import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Renders pages offline the way Next serves them (tests/rsc/hooks.mjs):
 * server components → React Flight stream (the RSC payload) → HTML with the
 * client components' code, all on Next's vendored production React. Gives a
 * page's RSC payload and HTML without `next build`, so size budgets and
 * visible-text snapshots can live in `npm test`.
 *
 * As a CLI, prints the sizes of the jobs in a JSON file:
 *   node tests/rsc/harness.ts jobs.json
 */

export interface Job {
  name: string;
  /** "@/…" or a project-relative path. */
  module: string;
  export: string;
  props?: Record<string, unknown>;
  /** Imported before the module: fixtures such as a fetch stub. */
  setup?: string;
}

export interface Rendered {
  name: string;
  flight: string;
  html: string;
}

const projectRoot = resolve(import.meta.dirname, "..", "..");

function run(args: string[], env: Record<string, string>): string {
  const out = spawnSync(process.execPath, args, {
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: "production", ...env },
    encoding: "utf8",
    maxBuffer: 512 * 1024 * 1024,
  });
  if (out.status !== 0) throw new Error(`${args.join(" ")} exited ${out.status}\n${out.stderr}`);
  return out.stdout;
}

export function renderPages(jobs: readonly Job[]): Map<string, Rendered> {
  const dir = mkdtempSync(join(tmpdir(), "rsc-payload-"));
  try {
    const jobsFile = join(dir, "jobs.json");
    writeFileSync(jobsFile, JSON.stringify(jobs));
    const flightOut = run(["--conditions=react-server", "--disable-warning=ExperimentalWarning", "--import", "./tests/rsc/hooks.mjs", "tests/rsc/flight.mjs", jobsFile], {});
    const flightFile = join(dir, "flight.jsonl");
    writeFileSync(flightFile, flightOut);
    const htmlOut = run(["--disable-warning=ExperimentalWarning", "--import", "./tests/rsc/hooks.mjs", "tests/rsc/ssr.mjs", flightFile], { RSC_PHASE: "ssr" });
    const flights = new Map(lines(flightOut).map((j) => [j.name, j]));
    const result = new Map<string, Rendered>();
    for (const j of lines(htmlOut)) {
      if (j.error) throw new Error(`${j.name}: ${j.error}`);
      result.set(j.name, { name: j.name, flight: flights.get(j.name)!.flight!, html: j.html! });
    }
    return result;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function lines(out: string): { name: string; flight?: string; html?: string; error?: string }[] {
  return out
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
}

const bytes = (s: string) => Buffer.byteLength(s, "utf8");

/**
 * Bytes the stream takes once inlined in the HTML, as Next writes it:
 * `<script>self.__next_f.push([1,"…"])</script>` with the chunk JSON-escaped
 * and `& < >` turned into \u00xx (next/dist/shared/lib/htmlescape.js). One
 * script per ~2 KB of stream is a fair estimate of the chunking.
 */
export function inlinedBytes(flight: string): number {
  const body = JSON.stringify(flight).replace(/[&<>\u2028\u2029]/g, "\\u0000");
  const scripts = Math.max(1, Math.ceil(bytes(flight) / 2048));
  return bytes(body) + scripts * bytes(`<script>self.__next_f.push([1,])</script>`);
}

interface Row {
  tag: string;
  value: unknown;
  bytes: number;
}

/** The stream's rows: `<hex id>:<tag><json>\n`, or `<id>:T<hex length>,<text>` for long strings. */
export function flightRows(flight: string): Map<string, Row> {
  const rows = new Map<string, Row>();
  const buf = Buffer.from(flight, "utf8");
  let i = 0;
  while (i < buf.length) {
    const colon = buf.indexOf(":", i);
    if (colon < 0) break;
    const id = buf.subarray(i, colon).toString();
    const k = colon + 1;
    if (buf[k] === 0x54 /* T */) {
      const comma = buf.indexOf(",", k);
      const len = parseInt(buf.subarray(k + 1, comma).toString(), 16);
      rows.set(id, { tag: "T", value: buf.subarray(comma + 1, comma + 1 + len).toString(), bytes: comma + 1 + len - i });
      i = comma + 1 + len;
      continue;
    }
    const nl = buf.indexOf("\n", k);
    const end = nl < 0 ? buf.length : nl;
    const raw = buf.subarray(k, end).toString();
    const tag = /^[A-Z]/.test(raw) ? raw[0]! : "J";
    const json = tag === "J" ? raw : raw.slice(1);
    let value: unknown = json;
    try {
      value = JSON.parse(json);
    } catch {
      // leave as text
    }
    rows.set(id, { tag, value, bytes: end + 1 - i });
    i = end + 1;
  }
  return rows;
}

/**
 * Serialised bytes of the props each client component receives, `children`
 * left out (server-rendered children are the page's own content), with the
 * rows those props reference counted once. Keyed by export name.
 */
export function clientPropBytes(flight: string): Record<string, number> {
  const rows = flightRows(flight);
  const clientIds = new Map<string, string>();
  for (const [id, row] of rows) {
    if (row.tag === "I" && Array.isArray(row.value)) clientIds.set(id, String(row.value[2] || "default"));
  }
  const out: Record<string, number> = {};
  const counted = new Set<string>();
  const referenced = (x: unknown): number => {
    let total = 0;
    const stack = [x];
    while (stack.length) {
      const y = stack.pop();
      if (typeof y === "string") {
        const m = /^\$([0-9a-f]+)$/.exec(y);
        const row = m ? rows.get(m[1]!) : undefined;
        if (m && row && (row.tag === "J" || row.tag === "T") && !counted.has(m[1]!)) {
          counted.add(m[1]!);
          total += row.bytes;
          if (row.tag === "J") stack.push(row.value);
        }
      } else if (Array.isArray(y)) stack.push(...y);
      else if (y && typeof y === "object") stack.push(...Object.values(y));
    }
    return total;
  };
  const walked = new Set<string>();
  const walk = (x: unknown): void => {
    if (Array.isArray(x)) {
      if (x.length === 4 && x[0] === "$" && typeof x[1] === "string" && x[1].startsWith("$L") && clientIds.has(x[1].slice(2)) && x[3] && typeof x[3] === "object") {
        const { children, ...props } = x[3] as Record<string, unknown>;
        const name = clientIds.get(x[1].slice(2))!;
        out[name] = (out[name] ?? 0) + bytes(JSON.stringify(props)) + referenced(props);
        walk(children);
        return;
      }
      for (const y of x) walk(y);
    } else if (x && typeof x === "object") {
      for (const y of Object.values(x)) walk(y);
    } else if (typeof x === "string") {
      const m = /^\$L?([0-9a-f]+)$/.exec(x);
      const row = m ? rows.get(m[1]!) : undefined;
      if (m && row?.tag === "J" && !walked.has(m[1]!)) {
        walked.add(m[1]!);
        walk(row.value);
      }
    }
  };
  for (const [id, row] of rows) {
    if (row.tag === "J" && !walked.has(id)) {
      walked.add(id);
      walk(row.value);
    }
  }
  return out;
}

/** What a reader (or a crawler that reads HTML) sees: the text of the HTML, whitespace collapsed. */
export function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export interface Sizes {
  /** The page's own HTML markup (no header/footer). */
  html: number;
  /** The RSC payload as inlined in the HTML. */
  rsc: number;
  /** Largest client-component props, by export name. */
  props: Record<string, number>;
}

export function sizes(page: Rendered): Sizes {
  return { html: bytes(page.html), rsc: inlinedBytes(page.flight), props: clientPropBytes(page.flight) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // node tests/rsc/harness.ts jobs.json [--save <dir>]: sizes, and optionally each page's HTML and stream.
  const jobs = JSON.parse(readFileSync(process.argv[2]!, "utf8")) as Job[];
  const save = process.argv.indexOf("--save") > 0 ? process.argv[process.argv.indexOf("--save") + 1] : undefined;
  const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
  for (const page of renderPages(jobs).values()) {
    if (save) {
      writeFileSync(join(save, `${page.name}.html`), page.html);
      writeFileSync(join(save, `${page.name}.flight`), page.flight);
    }
    const s = sizes(page);
    const top = Object.entries(s.props)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]) => `${k} ${kb(v)}`)
      .join(", ");
    console.log(`${page.name.padEnd(28)} html ${kb(s.html).padStart(9)}  rsc ${kb(s.rsc).padStart(9)}  props: ${top}`);
  }
}
