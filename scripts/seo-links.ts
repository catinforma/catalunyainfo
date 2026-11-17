/**
 * Internal-link audit, run against production.
 *
 * Answers the four questions that actually cost traffic, none of which any
 * single page can answer about itself:
 *
 *  - **Broken links.** An internal link to a URL that does not resolve. Checked
 *    over HTTP, not against the sitemap: a page can be perfectly healthy and
 *    deliberately absent from the sitemap.
 *  - **Linked but unlisted.** A page we link to that the sitemap omits. Not an
 *    error in itself, but if we recommend it to readers we should be able to
 *    say why we are not recommending it to Google.
 *  - **Orphans.** A page in the sitemap that nothing links to. Google reaches
 *    it through the sitemap, but it inherits no authority and readers never
 *    arrive at it from anywhere.
 *  - **Thin incoming links.** A page with one or two inbound links is only
 *    marginally better off than an orphan.
 *  - **Cross-language leaks.** A Catalan page linking into the English tree
 *    hands the reader a language switch they did not ask for, and muddies the
 *    hreflang cluster.
 *
 * Crawls the sitemap rather than the filesystem, because what matters is the
 * HTML Google actually receives — links added by a component, or lost to a
 * rendering bug, both show up here and in neither the source nor the database.
 *
 * Usage: `npm run seo:links`
 * Exit code is non-zero when broken links or orphans are found, so it can gate
 * a deploy. Fetching goes through scripts/lib/crawl.ts: at most SEO_CONCURRENCY
 * (default 4) requests in flight, a browser UA, and SEO_CACHE_DIR to reuse the
 * responses a `site:audit` run already fetched. `site:audit` also reports
 * broken links, orphans and click depth over a wider crawl; this script keeps
 * the editorial questions (contextual vs menu links, cross-language leaks).
 */
import { SITE } from "../src/lib/site.ts";
import { CONCURRENCY, fetchPage, mapLimit, readSitemap } from "./lib/crawl.ts";

export {};

const ORIGIN = process.env.SEO_ORIGIN ?? SITE.productionOrigin;

interface PageReport {
  url: string;
  /** Links inside <main>: the contextual, editorial ones. */
  contextual: Set<string>;
  /** Every internal link on the page, navigation included. */
  all: Set<string>;
}

async function fetchText(url: string): Promise<string | null> {
  const page = await fetchPage(url, { timeoutMs: 30_000 });
  return page.finalStatus === 200 ? page.body : null;
}

async function sitemapUrls(): Promise<string[]> {
  return (await readSitemap(`${ORIGIN}/sitemap.xml`)).map((entry) => entry.loc);
}

function linksIn(scope: string): Set<string> {
  const out = new Set<string>();
  // Relative links and absolute ones on our own host (a block that writes the full URL).
  const host = ORIGIN.replace(/[.]/g, "\\.");
  for (const match of scope.matchAll(new RegExp(`href="(?:${host})?(\\/[a-z]{2}\\/[^"#?]*)"`, "g"))) {
    const href = match[1];
    if (href) out.add(href.endsWith("/") ? href : `${href}/`);
  }
  return out;
}

/**
 * Two scopes, because they answer different questions.
 *
 * A page linked only from the header is reachable but has no editorial
 * relationship to anything — Google sees a menu entry, not a recommendation.
 * A page linked from nowhere at all is a different and worse problem. Counting
 * them together would hide the first behind the second.
 */
function internalLinks(html: string): { contextual: Set<string>; all: Set<string> } {
  const start = html.indexOf("<main");
  const end = html.indexOf("</main>");
  const main = start >= 0 && end > start ? html.slice(start, end + 7) : "";
  return { contextual: linksIn(main), all: linksIn(html) };
}

async function main() {
  const urls = await sitemapUrls();
  console.log(`Crawling ${urls.length} URLs from the sitemap of ${ORIGIN}\n`);

  const pages = await mapLimit(urls, CONCURRENCY, async (url): Promise<PageReport> => {
    const html = await fetchText(url);
    if (!html) return { url, contextual: new Set<string>(), all: new Set<string>() };
    const links = internalLinks(html);
    return { url, contextual: links.contextual, all: links.all };
  });

  const known = new Set(urls.map((u) => u.replace(ORIGIN, "")));
  const contextualIn = new Map<string, number>();
  const anyIn = new Map<string, number>();
  for (const path of known) {
    contextualIn.set(path, 0);
    anyIn.set(path, 0);
  }

  const broken: { from: string; to: string }[] = [];
  const unlisted = new Map<string, string>();
  const crossLanguage: { from: string; to: string }[] = [];

  // Anything linked but not in the sitemap is resolved once over HTTP, so a
  // page that is healthy and simply unlisted is not reported as broken.
  const offSitemap = new Set<string>();
  for (const page of pages) {
    for (const href of page.all) if (!known.has(href)) offSitemap.add(href);
  }
  // Bounded like the crawl: an unbounded Promise.all fired every HEAD at once.
  const resolved = new Map<string, boolean>();
  await mapLimit([...offSitemap], CONCURRENCY, async (href) => {
    const response = await fetchPage(`${ORIGIN}${href}`, { method: "HEAD", timeoutMs: 20_000 });
    resolved.set(href, response.finalStatus >= 200 && response.finalStatus < 300);
  });

  for (const page of pages) {
    const from = page.url.replace(ORIGIN, "");
    const fromLocale = from.split("/")[1];

    for (const href of page.all) {
      if (known.has(href)) {
        anyIn.set(href, (anyIn.get(href) ?? 0) + 1);
      } else if (resolved.get(href)) {
        unlisted.set(href, from);
      } else {
        broken.push({ from, to: href });
      }
    }
    for (const href of page.contextual) {
      if (known.has(href)) contextualIn.set(href, (contextualIn.get(href) ?? 0) + 1);
      // The language switcher links across languages by design; only an
      // editorial link doing it is a defect.
      if (href.split("/")[1] !== fromLocale) crossLanguage.push({ from, to: href });
    }
  }

  const deep = (path: string) => path.split("/").filter(Boolean).length > 1;

  // Linked from nowhere at all. This is the one that actually costs traffic.
  const orphans = [...anyIn.entries()]
    .filter(([path, count]) => count === 0 && deep(path))
    .map(([path]) => path)
    .sort();

  // Reachable from the menu, but nothing recommends it in a sentence.
  const noContext = [...contextualIn.entries()]
    .filter(([path, count]) => count === 0 && deep(path) && (anyIn.get(path) ?? 0) > 0)
    .map(([path]) => path)
    .sort();

  const thin = [...contextualIn.entries()]
    .filter(([path, count]) => count > 0 && count <= 2 && deep(path))
    .sort((a, b) => a[1] - b[1]);

  console.log(`BROKEN INTERNAL LINKS: ${broken.length}`);
  for (const item of broken.slice(0, 20)) console.log(`  ${item.from}  ->  ${item.to}`);

  console.log(`\nCROSS-LANGUAGE CONTENT LINKS: ${crossLanguage.length}`);
  for (const item of crossLanguage.slice(0, 20)) console.log(`  ${item.from}  ->  ${item.to}`);

  console.log(`\nORPHANS (linked from nowhere at all): ${orphans.length}`);
  for (const path of orphans) console.log(`  ${path}`);

  console.log(`\nNO CONTEXTUAL LINKS (reachable only from the menu): ${noContext.length}`);
  for (const path of noContext) console.log(`  ${path}`);

  console.log(`\nTHIN (1-2 contextual links): ${thin.length}`);
  for (const [path, count] of thin.slice(0, 25)) console.log(`  ${count}  ${path}`);

  const best = [...contextualIn.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log(`\nMOST LINKED IN CONTENT:`);
  for (const [path, count] of best) console.log(`  ${count}  ${path}`);

  const failed = broken.length + crossLanguage.length + orphans.length;
  console.log(
    `\n${failed === 0 ? "PASS" : "ISSUES"}: ${broken.length} broken, ` +
      `${crossLanguage.length} cross-language, ${orphans.length} orphans, ` +
      `${noContext.length} without contextual links`,
  );
  process.exit(failed === 0 ? 0 : 1);
}

await main();
