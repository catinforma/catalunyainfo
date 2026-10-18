/**
 * Whole-site audit, run against production.
 *
 * Crawls every URL in the sitemap and checks what Google and AdSense reviewers
 * actually receive: status, title and description length, a single H1, the
 * canonical pointing at itself, a complete and reciprocal hreflang cluster,
 * the html lang matching the URL's locale, structured data that parses and
 * carries Article's required fields,
 * word count, images without alt text, images without width/height, and the
 * page weight.
 *
 * `seo:links` already covers the link graph and `adsense:check` the policy
 * pages; this covers everything per page that neither of them looks at.
 *
 * Usage: `npm run site:audit` (writes `audit-report.json` and prints a summary)
 */
import { writeFile } from "node:fs/promises";

import { SITE } from "../src/lib/site.ts";

export {};

const ORIGIN = process.env.SEO_ORIGIN ?? SITE.productionOrigin;
const CONCURRENCY = 6;

interface PageAudit {
  url: string;
  status: number;
  bytes: number;
  ms: number;
  title: string;
  titleLen: number;
  description: string;
  descLen: number;
  h1Count: number;
  canonical: string;
  canonicalSelf: boolean;
  hreflang: string[];
  /** hreflang code -> href, for the reciprocity check across pages. */
  alternates: Record<string, string>;
  htmlLang: string;
  robots: string;
  schemaTypes: string[];
  words: number;
  images: number;
  imagesNoAlt: number;
  imagesNoSize: number;
  issues: string[];
}

function decode(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function first(html: string, pattern: RegExp): string {
  const match = pattern.exec(html);
  return match?.[1] ? decode(match[1]) : "";
}

async function auditPage(url: string): Promise<PageAudit> {
  const started = Date.now();
  let status = 0;
  let html = "";
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "CatalunyaInfo-site-audit" },
      signal: AbortSignal.timeout(45_000),
    });
    status = response.status;
    html = await response.text();
  } catch {
    status = 0;
  }
  const ms = Date.now() - started;

  const title = first(html, /<title>([^<]*)<\/title>/);
  const description = first(html, /<meta name="description" content="([^"]*)"/);
  const canonical = first(html, /<link rel="canonical" href="([^"]*)"/);
  const robots = first(html, /<meta name="robots" content="([^"]*)"/);
  const hreflang = [...html.matchAll(/hrefLang="([a-zA-Z-]+)"/g)].map((m) => m[1] ?? "");
  const alternates: Record<string, string> = {};
  for (const m of html.matchAll(/<link rel="alternate" hrefLang="([a-zA-Z-]+)" href="([^"]+)"/g)) {
    if (m[1] && m[2]) alternates[m[1]] = m[2];
  }
  const htmlLang = first(html, /<html[^>]*\blang="([^"]+)"/);
  const articleProblems: string[] = [];

  const schemaTypes: string[] = [];
  for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(block[1] ?? "") as { "@graph"?: { "@type"?: string }[]; "@type"?: string };
      for (const node of data["@graph"] ?? [data]) {
        if (!node["@type"]) continue;
        schemaTypes.push(String(node["@type"]));
        // Fields Google lists for Article/NewsArticle; missing ones are silent
        // in a browser and only show up in the Rich Results Test.
        if (node["@type"] === "Article" || node["@type"] === "NewsArticle") {
          const article = node as Record<string, unknown>;
          for (const field of ["headline", "image", "datePublished", "dateModified", "author", "publisher"]) {
            if (!article[field]) articleProblems.push(field);
          }
        }
      }
    } catch {
      schemaTypes.push("INVALID_JSON");
    }
  }

  const mainStart = html.indexOf("<main");
  const mainEnd = html.indexOf("</main>");
  const main = mainStart >= 0 && mainEnd > mainStart ? html.slice(mainStart, mainEnd) : "";
  const text = main
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;

  const imgs = [...main.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const imagesNoAlt = imgs.filter((tag) => !/\balt="[^"]+"/.test(tag)).length;
  const imagesNoSize = imgs.filter((tag) => !/\bwidth=/.test(tag) || !/\bheight=/.test(tag)).length;

  const h1Count = (main.match(/<h1\b/g) ?? []).length;
  const canonicalSelf = canonical === url;

  const issues: string[] = [];
  if (status !== 200) issues.push(`status ${status}`);
  if (!title) issues.push("no title");
  else if (title.length > 65) issues.push(`title ${title.length} chars`);
  else if (title.length < 25) issues.push(`title only ${title.length} chars`);
  if (!description) issues.push("no meta description");
  else if (description.length > 165) issues.push(`description ${description.length} chars`);
  else if (description.length < 70) issues.push(`description only ${description.length} chars`);
  if (h1Count !== 1) issues.push(`${h1Count} H1`);
  if (!canonical) issues.push("no canonical");
  else if (!canonicalSelf) issues.push(`canonical points elsewhere: ${canonical}`);
  if (robots && /noindex/.test(robots)) issues.push("noindex");
  if (hreflang.length > 0 && !hreflang.includes("x-default")) issues.push("hreflang without x-default");
  // The reciprocity check parses <link rel="alternate" …> by attribute order;
  // if Next ever changes it, say so instead of silently checking nothing.
  if (hreflang.length > 0 && Object.keys(alternates).length === 0) issues.push("hreflang present but alternates not parsed");
  if (schemaTypes.includes("INVALID_JSON")) issues.push("invalid JSON-LD");
  if (articleProblems.length > 0) issues.push(`Article missing ${articleProblems.join(", ")}`);
  const urlLocale = new URL(url).pathname.split("/")[1] ?? "";
  if (["ca", "es", "en"].includes(urlLocale) && !htmlLang.startsWith(urlLocale)) {
    issues.push(`html lang "${htmlLang}" on a /${urlLocale}/ URL`);
  }
  if (imagesNoAlt > 0) issues.push(`${imagesNoAlt} images without alt`);
  if (imagesNoSize > 0) issues.push(`${imagesNoSize} images without width/height`);
  if (html.length > 400_000) issues.push(`HTML ${Math.round(html.length / 1024)} KB`);
  if (ms > 2500) issues.push(`slow: ${ms} ms`);

  return {
    url,
    status,
    bytes: html.length,
    ms,
    title,
    titleLen: title.length,
    description,
    descLen: description.length,
    h1Count,
    canonical,
    canonicalSelf,
    hreflang,
    alternates,
    htmlLang,
    robots,
    schemaTypes,
    words,
    images: imgs.length,
    imagesNoAlt,
    imagesNoSize,
    issues,
  };
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const results: R[] = [];
  let index = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (index < items.length) {
        const current = index++;
        const item = items[current];
        if (item !== undefined) results[current] = await fn(item);
      }
    }),
  );
  return results;
}

async function main() {
  const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? "").filter(Boolean);
  console.log(`Auditing ${urls.length} URLs on ${ORIGIN}\n`);

  const pages = await mapLimit(urls, CONCURRENCY, auditPage);

  // hreflang must be reciprocal: if A names B as its "es" version, B must
  // name A back under A's language. A one-way link is ignored by Google.
  const byUrl = new Map(pages.map((page) => [page.url, page]));
  for (const page of pages) {
    const ownLang = Object.entries(page.alternates).find(([, href]) => href === page.url)?.[0];
    if (!ownLang) continue;
    for (const [lang, href] of Object.entries(page.alternates)) {
      if (lang === "x-default" || href === page.url) continue;
      const other = byUrl.get(href);
      if (other && other.alternates[ownLang] !== page.url) {
        page.issues.push(`hreflang ${lang} not reciprocal (${href})`);
      }
    }
  }

  // Duplicate titles and descriptions are a site-level problem no single page shows.
  const titleCount = new Map<string, number>();
  const descCount = new Map<string, number>();
  for (const page of pages) {
    titleCount.set(page.title, (titleCount.get(page.title) ?? 0) + 1);
    descCount.set(page.description, (descCount.get(page.description) ?? 0) + 1);
  }
  for (const page of pages) {
    if (page.title && (titleCount.get(page.title) ?? 0) > 1) page.issues.push("duplicate title");
    if (page.description && (descCount.get(page.description) ?? 0) > 1) page.issues.push("duplicate description");
  }

  const articleLike = pages.filter((page) => page.url.split("/").filter(Boolean).length >= 5);
  const thin = articleLike.filter((page) => page.words < 400);

  const tally = new Map<string, number>();
  for (const page of pages) {
    for (const issue of page.issues) {
      const key = issue.replace(/\d+/g, "N").replace(/: .*/, "");
      tally.set(key, (tally.get(key) ?? 0) + 1);
    }
  }

  console.log("ISSUES BY TYPE");
  for (const [issue, count] of [...tally.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(4)}  ${issue}`);
  }

  console.log(`\nTHIN ARTICLES (<400 words in <main>): ${thin.length}`);
  for (const page of thin.sort((a, b) => a.words - b.words)) {
    console.log(`  ${String(page.words).padStart(5)}  ${page.url.replace(ORIGIN, "")}`);
  }

  const avgMs = Math.round(pages.reduce((sum, page) => sum + page.ms, 0) / pages.length);
  const avgWords = Math.round(articleLike.reduce((sum, page) => sum + page.words, 0) / Math.max(1, articleLike.length));
  console.log(`\nAverage response ${avgMs} ms; average article ${avgWords} words; ${articleLike.length} articles.`);

  const schemaTally = new Map<string, number>();
  for (const page of pages) for (const type of new Set(page.schemaTypes)) schemaTally.set(type, (schemaTally.get(type) ?? 0) + 1);
  console.log("\nSTRUCTURED DATA COVERAGE");
  for (const [type, count] of [...schemaTally.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(4)}  ${type}`);
  }

  await writeFile("audit-report.json", JSON.stringify(pages, null, 2), "utf8");
  console.log("\nFull per-page report: audit-report.json");
}

await main();
