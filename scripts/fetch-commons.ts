/**
 * Fetches freely-licensed photographs from Wikimedia Commons.
 *
 * Why Commons and not an image search: a search engine is an index, not a
 * licence. A photograph found through one belongs to whoever took it, and
 * publishing it without checking the licence is infringement regardless of
 * which site surfaced it. Commons publishes the licence and the author as
 * structured metadata for every file, so permission can be verified per image
 * rather than assumed.
 *
 * What this enforces:
 *
 *  - **Only licences on the allow-list below.** Anything else - including
 *    "fair use", non-commercial, and no-derivatives - is skipped with a reason,
 *    because this site is a publication and NC/ND terms do not fit it.
 *  - **Attribution is captured at download time** into a sidecar file next to
 *    the image, so the author, licence and source page cannot be lost between
 *    here and the page. `import-images.ts` reads the sidecar into the manifest,
 *    and the renderer prints it under the photograph.
 *
 * Two modes, because a blind search is not good enough. Searching "Besalú
 * bridge" and taking the largest result returns a modern road bridge, not the
 * famous medieval one - so nothing is published without being looked at first:
 *
 *   npm run images:commons -- preview '[{"key":"x","search":"..."}]'
 *     Downloads small thumbnails of the top candidates into `incoming/preview/`
 *     and prints an indexed list with licence and author.
 *
 *   npm run images:commons -- pick '[{"key":"x","file":"File:Foo.jpg"}]'
 *     Downloads the chosen file at full size plus its attribution sidecar.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export {};

const ROOT = process.cwd();
const INCOMING = join(ROOT, "incoming");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "CatalunyaInfo/2.0 (https://www.catalunyainfo.com; catalunyatinforma@gmail.com)";

/**
 * Licences we may publish under.
 *
 * Public domain and CC0 need no attribution; the rest do, and we credit every
 * one of them anyway. Non-commercial and no-derivatives licences are absent on
 * purpose: this is a publication, and one day it may carry advertising.
 */
const ALLOWED = [
  /^cc0/i,
  /^cc[- ]by(-sa)?[- ]?[1-4]/i,
  /^public domain/i,
  /^pd[- ]/i,
  /^gfdl/i,
];

const FORBIDDEN = [/nc\b/i, /non[- ]?commercial/i, /\bnd\b/i, /no[- ]?deriv/i, /fair use/i];

interface Wanted {
  /** Manifest key, and therefore the file name on disk. */
  key: string;
  /** Commons search term (preview mode). */
  search?: string;
  /** Exact Commons title, e.g. `File:Foo.jpg` (pick mode). */
  file?: string;
  /**
   * Word the Commons file title must contain.
   *
   * This is what makes the automatic mode trustworthy without looking at every
   * candidate: searching "Besalú bridge" and taking the largest result returns
   * a modern road bridge, but a file actually titled "Pont Medieval (Besalú)"
   * cannot be one. The title is the uploader's own description of the subject.
   */
  must?: string;
  /** Minimum width, so we never ship a thumbnail as a hero. */
  minWidth?: number;
}

interface Credit {
  credit: string;
  creditUrl: string;
  license: string;
  commonsFile: string;
}

/** Commons returns the author as HTML. We want a plain line of text. */
function plain(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function licenceAllowed(name: string): boolean {
  if (!name) return false;
  if (FORBIDDEN.some((re) => re.test(name))) return false;
  return ALLOWED.some((re) => re.test(name));
}

async function api(params: Record<string, string>): Promise<Record<string, unknown>> {
  const url = new URL(API);
  for (const [k, v] of Object.entries({ ...params, format: "json", origin: "*" })) {
    url.searchParams.set(k, v);
  }
  const response = await fetch(url, { headers: { "user-agent": UA } });
  if (!response.ok) throw new Error(`Commons API ${response.status}`);
  return (await response.json()) as Record<string, unknown>;
}

interface Candidate {
  title: string;
  width: number;
  height: number;
  url: string;
  thumbUrl: string;
  descriptionUrl: string;
  licence: string;
  artist: string;
  mime: string;
}

function parsePages(result: { query?: { pages?: Record<string, unknown> } }): Candidate[] {
  const pages = result.query?.pages ?? {};
  const out: Candidate[] = [];

  for (const page of Object.values(pages)) {
    const p = page as {
      title?: string;
      imageinfo?: {
        url: string;
        descriptionurl: string;
        thumburl?: string;
        width: number;
        height: number;
        mime: string;
        extmetadata?: Record<string, { value?: string }>;
      }[];
    };
    const info = p.imageinfo?.[0];
    if (!info) continue;
    const meta = info.extmetadata ?? {};
    out.push({
      title: p.title ?? "",
      width: info.width,
      height: info.height,
      url: info.url,
      thumbUrl: info.thumburl ?? info.url,
      descriptionUrl: info.descriptionurl,
      mime: info.mime,
      licence: plain(meta.LicenseShortName?.value) || plain(meta.License?.value),
      artist: plain(meta.Artist?.value) || plain(meta.Credit?.value) || "Wikimedia Commons",
    });
  }
  return out;
}

async function byTitle(title: string): Promise<Candidate | null> {
  const result = (await api({
    action: "query",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
  })) as { query?: { pages?: Record<string, unknown> } };
  return parsePages(result)[0] ?? null;
}

async function candidatesFor(search: string, limit = 12): Promise<Candidate[]> {
  const result = (await api({
    action: "query",
    generator: "search",
    gsrsearch: `filetype:bitmap ${search}`,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "420",
  })) as { query?: { pages?: Record<string, unknown> } };

  return parsePages(result);
}

/**
 * One file, with retries.
 *
 * Commons serves thumbnails from a different host than the API, and that host
 * times out often enough that a single failure must not abort a whole batch
 * halfway through.
 */
async function download(url: string, attempts = 3): Promise<Buffer | null> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": UA },
        signal: AbortSignal.timeout(90_000),
      });
      if (!response.ok) return null;
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (attempt === attempts) {
        console.log(`      download failed: ${error instanceof Error ? error.message : error}`);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  return null;
}

function extFor(mime: string): string {
  return mime === "image/png" ? "png" : "jpg";
}

/** Downloads small thumbnails of the candidates so they can be looked at. */
async function preview(wanted: Wanted[]) {
  const dir = join(INCOMING, "preview");
  await mkdir(dir, { recursive: true });

  for (const item of wanted) {
    if (!item.search) continue;
    const minWidth = item.minWidth ?? 1200;

    const candidates = (await candidatesFor(item.search))
      .filter((c) => c.mime === "image/jpeg" || c.mime === "image/png")
      .filter((c) => c.width >= minWidth)
      .filter((c) => licenceAllowed(c.licence))
      .slice(0, 6);

    if (candidates.length === 0) {
      console.log(`NONE  ${item.key}  (${item.search})`);
      continue;
    }

    for (const [index, candidate] of candidates.entries()) {
      const bytes = await download(candidate.thumbUrl);
      if (!bytes) continue;
      await writeFile(join(dir, `${item.key}__${index}.${extFor(candidate.mime)}`), bytes);
      console.log(
        `${item.key}__${index}  ${String(candidate.width).padStart(5)}px  ${candidate.licence.padEnd(14)}  ${candidate.title}`,
      );
    }
  }
}

/** Downloads the chosen files at full size, with their attribution. */
async function pick(wanted: Wanted[]) {
  await mkdir(INCOMING, { recursive: true });

  for (const item of wanted) {
    if (!item.file) continue;

    const candidate = await byTitle(item.file);
    if (!candidate) {
      console.log(`SKIP  ${item.key}: ${item.file} not found`);
      continue;
    }
    if (!licenceAllowed(candidate.licence)) {
      console.log(`SKIP  ${item.key}: licence "${candidate.licence || "unknown"}" not permitted`);
      continue;
    }

    const bytes = await download(candidate.url);
    if (!bytes) {
      console.log(`SKIP  ${item.key}: download failed`);
      continue;
    }

    await writeFile(join(INCOMING, `${item.key}.${extFor(candidate.mime)}`), bytes);

    const credit: Credit = {
      credit: candidate.artist,
      creditUrl: candidate.descriptionUrl,
      license: candidate.licence,
      commonsFile: candidate.title,
    };
    await writeFile(
      join(INCOMING, `${item.key}.credit.json`),
      `${JSON.stringify(credit, null, 2)}
`,
      "utf8",
    );

    console.log(
      `OK    ${item.key.padEnd(46)} ${candidate.width}x${candidate.height}  ${candidate.licence}  — ${candidate.artist.slice(0, 40)}`,
    );
  }
}

/**
 * Search, filter and download in one pass, with every subject in flight at
 * once. The per-subject preview round trip was accurate but far too slow to
 * illustrate ten articles.
 */
async function auto(wanted: Wanted[]) {
  await mkdir(INCOMING, { recursive: true });

  const results = await Promise.all(
    wanted.map(async (item) => {
      if (!item.search) return `SKIP  ${item.key}: no search term`;
      const minWidth = item.minWidth ?? 1200;
      const must = item.must?.toLowerCase();

      const candidates = (await candidatesFor(item.search, 20))
        .filter((c) => c.mime === "image/jpeg" || c.mime === "image/png")
        .filter((c) => c.width >= minWidth)
        .filter((c) => licenceAllowed(c.licence))
        .filter((c) => (must ? c.title.toLowerCase().includes(must) : true))
        // Landscape first: these are heroes and in-article images, and a
        // portrait photograph crops badly into a wide frame.
        .sort((a, b) => {
          const landscape = (c: Candidate) => (c.width > c.height ? 1 : 0);
          if (landscape(b) !== landscape(a)) return landscape(b) - landscape(a);
          return b.width * b.height - a.width * a.height;
        });

      const candidate = candidates[0];
      if (!candidate) return `NONE  ${item.key}  (${item.search}${must ? ` / title~${must}` : ""})`;

      const bytes = await download(candidate.url);
      if (!bytes) return `SKIP  ${item.key}: download failed`;

      await writeFile(join(INCOMING, `${item.key}.${extFor(candidate.mime)}`), bytes);
      await writeFile(
        join(INCOMING, `${item.key}.credit.json`),
        `${JSON.stringify(
          {
            credit: candidate.artist,
            creditUrl: candidate.descriptionUrl,
            license: candidate.licence,
            commonsFile: candidate.title,
          } satisfies Credit,
          null,
          2,
        )}
`,
        "utf8",
      );

      return `OK    ${item.key.padEnd(44)} ${String(candidate.width).padStart(5)}x${candidate.height}  ${candidate.licence.padEnd(13)} ${candidate.title}`;
    }),
  );

  for (const line of results) console.log(line);
}

async function main() {
  const mode = process.argv[2];
  const wanted: Wanted[] = JSON.parse(process.argv[3] ?? "[]");

  if (mode !== "preview" && mode !== "pick" && mode !== "auto") {
    console.error("Usage: images:commons -- auto|preview|pick <json array>");
    process.exit(1);
  }
  if (wanted.length === 0) {
    console.error("Nothing requested.");
    process.exit(1);
  }

  if (mode === "preview") await preview(wanted);
  else if (mode === "auto") await auto(wanted);
  else await pick(wanted);
}

await main();
