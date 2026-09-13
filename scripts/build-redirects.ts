/**
 * Turns `migration/redirects.csv` into a typed module the edge can import.
 *
 * The CSV is the human-editable source of truth for the migration: it carries
 * the decision and the reason for every legacy URL. This script projects it
 * into `src/lib/migration/legacy-redirects.ts`, which `next.config.ts` uses for
 * 301s and `middleware.ts` uses for 410s.
 *
 * Run: `node --experimental-strip-types scripts/build-redirects.ts`
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = join(root, "migration", "redirects.csv");
const outPath = join(root, "src", "lib", "migration", "legacy-redirects.ts");

/** Minimal RFC 4180 parser: handles quoted fields containing commas. */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      out.push(field);
      field = "";
    } else {
      field += char;
    }
  }
  out.push(field);
  return out;
}

const csv = readFileSync(csvPath, "utf8").trim();
const [header, ...lines] = csv.split(/\r?\n/);
if (!header) throw new Error("redirects.csv is empty");

const cols = parseCsvLine(header);
const idx = {
  from: cols.indexOf("from_path"),
  to: cols.indexOf("to_path"),
  status: cols.indexOf("status"),
  decision: cols.indexOf("decision"),
};
if (idx.from < 0 || idx.to < 0 || idx.status < 0) {
  throw new Error("redirects.csv must have from_path, to_path and status columns");
}

const redirects: { from: string; to: string; status: number }[] = [];
const gone: string[] = [];
const seen = new Set<string>();

for (const line of lines) {
  if (!line.trim()) continue;
  const fields = parseCsvLine(line);
  const from = (fields[idx.from] ?? "").trim();
  const to = (fields[idx.to] ?? "").trim();
  const status = Number.parseInt((fields[idx.status] ?? "").trim(), 10);
  if (!from) continue;
  if (seen.has(from)) throw new Error(`Duplicate from_path in redirects.csv: ${from}`);
  seen.add(from);

  if (status === 410) {
    gone.push(from);
  } else if (to) {
    redirects.push({ from, to, status: Number.isFinite(status) ? status : 301 });
  } else {
    throw new Error(`Row for ${from} has status ${status} but no to_path`);
  }
}

const banner = `// GENERATED FILE - do not edit by hand.
// Source: migration/redirects.csv
// Regenerate: npm run build:redirects
`;

const body = `${banner}
export interface LegacyRedirect {
  readonly from: string;
  readonly to: string;
  readonly status: number;
}

export const LEGACY_REDIRECTS: readonly LegacyRedirect[] = ${JSON.stringify(redirects, null, 2)} as const;

/**
 * URLs that must answer 410 Gone.
 *
 * These are the auto-generated news items from version 1. They have no
 * equivalent on the new site, and funnelling 42 stale URLs into a hub page
 * would read as a soft 404. 410 tells Google the removal is deliberate.
 */
export const LEGACY_GONE: ReadonlySet<string> = new Set(${JSON.stringify(gone, null, 2)});
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, body, "utf8");

console.log(
  `legacy-redirects.ts written: ${redirects.length} redirects, ${gone.length} gone`,
);
