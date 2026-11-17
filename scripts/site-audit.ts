/**
 * Whole-site technical SEO audit, run against production.
 *
 * Crawls what Google crawls: every URL of the sitemap and the news sitemap,
 * the pages listed in llms.txt, and every internal page those link to (the
 * noindex low-demand pages included, because their links still count), with
 * at most SEO_CONCURRENCY (default 4) requests in flight and a browser UA.
 *
 * Per page (scripts/lib/page-checks.ts): status and redirects, title and
 * description, one H1, canonical = self, hreflang (codes, self, x-default),
 * html lang, robots meta and X-Robots-Tag, Open Graph and Twitter cards,
 * images without alt, mixed content, JSON-LD validity and the properties each
 * type needs (Article, BreadcrumbList, FAQPage only with a visible FAQ, Event
 * with a location, Dataset, WebApplication), links written in a form that
 * redirects.
 *
 * Across pages: sitemap URLs that redirect, fail, are noindex, are not
 * self-canonical or are blocked by robots.txt; indexable pages missing from
 * the sitemap; hreflang reciprocity, targets and HTML vs sitemap agreement;
 * duplicate titles/descriptions and descriptions that are the same template
 * across a family; broken internal links and links to redirects; orphans
 * (no internal link at all) and click depth from the home pages; news
 * sitemap freshness; llms.txt URLs that are not live, indexable pages.
 *
 * `seo:links` keeps the editorial view of the link graph (contextual vs menu
 * links, cross-language leaks); `adsense:check` the policy pages.
 *
 * Usage:
 *   npm run site:audit -- [outDir]          (default ./audit-report/)
 *   SEO_CACHE_DIR=dir  reuse responses fetched earlier (same dir = no recrawl)
 *   SEO_MAX_PAGES=n    cap on pages fetched with GET (default 9000)
 *   SEO_ORIGIN=…       another origin (staging)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { SITE } from "../src/lib/site.ts";
import { CONCURRENCY, disallowRules, fetchPage, mapLimit, readSitemap, robotsAllows, type FetchedPage, type SitemapEntry } from "./lib/crawl.ts";
import { familyOf, pageIssues, parseHtml, templateSkeleton, type Issue, type PageLink, type ParsedPage } from "./lib/page-checks.ts";

export {};

const ORIGIN = process.env.SEO_ORIGIN ?? SITE.productionOrigin;
const OUT = process.argv[2] ?? "audit-report";
const MAX_PAGES = Number(process.env.SEO_MAX_PAGES ?? 9000) || 9000;
/** Test runs: only the first N sitemap URLs as seeds, and no link following. */
const SEED_LIMIT = Number(process.env.SEO_SEED_LIMIT ?? 0) || 0;
const HOMES = [`${ORIGIN}/ca/`, `${ORIGIN}/es/`, `${ORIGIN}/en/`];

interface PageRecord {
  url: string;
  fetch: Omit<FetchedPage, "body">;
  inSitemap: boolean;
  inNewsSitemap: boolean;
  html: boolean;
  parsed?: Omit<ParsedPage, "visibleText" | "links" | "jsonLd"> & { jsonLdTypes: string[] };
  links: PageLink[];
  issues: Issue[];
  indexable: boolean;
}

const SKIP_EXT = /\.(xml|ics|png|jpe?g|webp|avif|gif|svg|ico|pdf|txt|json|webmanifest|css|js|zip|csv|mp4|mp3)$/i;

function crawlable(url: string, rules: ReturnType<typeof disallowRules>): boolean {
  const u = new URL(url);
  if (u.origin !== ORIGIN) return false;
  if (SKIP_EXT.test(u.pathname)) return false;
  if (/^\/(api|admin|_next|img|ics|embed)\//.test(u.pathname)) return false;
  return robotsAllows(rules, u.pathname + u.search);
}

function addIssue(record: PageRecord, severity: Issue["severity"], code: string, detail?: string) {
  record.issues.push(detail === undefined ? { severity, code } : { severity, code, detail });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const started = Date.now();

  const robotsTxt = (await fetchPage(`${ORIGIN}/robots.txt`)).body;
  const rules = disallowRules(robotsTxt);
  const sitemapRefs = [...robotsTxt.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => m[1] ?? "");

  const sitemap: SitemapEntry[] = await readSitemap(`${ORIGIN}/sitemap.xml`);
  const newsXml = (await fetchPage(`${ORIGIN}/news-sitemap.xml`)).body;
  const news = [...newsXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => {
    const body = m[1] ?? "";
    return {
      loc: /<loc>([^<]+)<\/loc>/.exec(body)?.[1] ?? "",
      date: /<news:publication_date>([^<]+)</.exec(body)?.[1] ?? "",
      lang: /<news:language>([^<]+)</.exec(body)?.[1] ?? "",
      title: (/<news:title>([^<]+)</.exec(body)?.[1] ?? "").replace(/&apos;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"'),
    };
  });
  const llms = await fetchPage(`${ORIGIN}/llms.txt`);
  const llmsUrls = [...new Set([...llms.body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1] ?? ""))].filter((u) => u.startsWith(ORIGIN));

  const sitemapSet = new Map(sitemap.map((e) => [e.loc, e]));
  const newsSet = new Set(news.map((n) => n.loc));
  console.log(`${sitemap.length} sitemap URLs, ${news.length} news URLs, ${llmsUrls.length} llms.txt URLs; crawling ${ORIGIN} with ${CONCURRENCY} in flight`);

  // Crawl: seeds first, then whatever they link to, breadth first.
  const records = new Map<string, PageRecord>();
  const queued = new Set<string>();
  let frontier = [...new Set([...HOMES, ...sitemap.map((e) => e.loc), ...news.map((n) => n.loc), ...llmsUrls])];
  if (SEED_LIMIT > 0) frontier = frontier.slice(0, SEED_LIMIT);
  for (const u of frontier) queued.add(u);
  let fetched = 0;
  const headOnly: string[] = [];

  while (frontier.length > 0) {
    const batch = frontier.filter((u) => {
      if (fetched >= MAX_PAGES) {
        headOnly.push(u);
        return false;
      }
      fetched += 1;
      return true;
    });
    const next: string[] = [];
    await mapLimit(batch, CONCURRENCY, async (url, i) => {
      const response = await fetchPage(url);
      const { body, ...meta } = response;
      const isHtml = /text\/html/.test(response.contentType);
      const record: PageRecord = {
        url,
        fetch: meta,
        inSitemap: sitemapSet.has(url),
        inNewsSitemap: newsSet.has(url),
        html: isHtml,
        links: [],
        issues: [],
        indexable: false,
      };
      if (response.finalStatus === 200 && isHtml && response.redirects.length === 0) {
        const parsed = parseHtml(body, url, ORIGIN);
        record.links = parsed.links;
        record.issues = pageIssues(parsed, url, ORIGIN);
        const { visibleText: _v, links: _l, jsonLd, ...rest } = parsed;
        record.parsed = { ...rest, jsonLdTypes: [...new Set(jsonLd.map((n) => n.type))] };
        const noindex = /noindex/i.test(`${parsed.robots} ${parsed.googlebot} ${response.xRobotsTag}`);
        record.indexable = !noindex && (parsed.canonicals[0] ?? url) === url && robotsAllows(rules, new URL(url).pathname);
        if (/noindex/i.test(response.xRobotsTag)) addIssue(record, "info", "x-robots-noindex", response.xRobotsTag);
        if (response.ms > 2500) addIssue(record, "warn", "slow", `${response.ms} ms`);
        for (const link of SEED_LIMIT > 0 ? [] : parsed.links) {
          if (!queued.has(link.url) && crawlable(link.url, rules)) {
            queued.add(link.url);
            next.push(link.url);
          }
        }
      } else if (response.redirects.length > 0 && !queued.has(response.finalUrl) && crawlable(response.finalUrl, rules) && SEED_LIMIT === 0) {
        // A link that redirects: crawl where it lands, so the page behind it is audited too.
        queued.add(response.finalUrl);
        next.push(response.finalUrl);
      }
      records.set(url, record);
      if ((i + 1) % 250 === 0) console.log(`  ${records.size} pages (${Math.round((Date.now() - started) / 1000)} s)`);
    });
    frontier = next;
  }

  // Links we could not afford to GET: only whether they resolve.
  await mapLimit(headOnly, CONCURRENCY, async (url) => {
    const response = await fetchPage(url, { method: "HEAD" });
    const { body: _b, ...meta } = response;
    records.set(url, { url, fetch: meta, inSitemap: sitemapSet.has(url), inNewsSitemap: newsSet.has(url), html: false, links: [], issues: [], indexable: false });
  });

  // Every link target that was not crawlable (robots, files) is resolved with HEAD too, so a 404 to a PDF or an .ics still shows.
  const linkTargets = new Set<string>();
  for (const r of records.values()) {
    for (const l of r.links) linkTargets.add(l.url);
    // hreflang alternates and canonicals must resolve as well.
    for (const href of Object.values(r.parsed?.alternates ?? {})) if (href.startsWith(ORIGIN)) linkTargets.add(href);
    for (const href of r.parsed?.canonicals ?? []) if (href.startsWith(ORIGIN)) linkTargets.add(href);
  }
  const unresolved = [...linkTargets].filter((u) => !records.has(u) && !/^\/(api|admin)\//.test(new URL(u).pathname));
  const resolvedOther = new Map<string, Omit<FetchedPage, "body">>();
  await mapLimit(unresolved, CONCURRENCY, async (url) => {
    const { body: _b, ...meta } = await fetchPage(url, { method: "HEAD" });
    resolvedOther.set(url, meta);
  });
  const statusOf = (url: string) => records.get(url)?.fetch ?? resolvedOther.get(url);

  // ---- Sitemap vs pages -------------------------------------------------
  for (const entry of sitemap) {
    const r = records.get(entry.loc);
    if (!r) continue;
    if (r.fetch.redirects.length > 0) addIssue(r, "error", "sitemap-url-redirects", `${r.fetch.status} -> ${r.fetch.finalUrl}`);
    else if (r.fetch.finalStatus !== 200) addIssue(r, "error", "sitemap-url-status", String(r.fetch.finalStatus));
    if (r.parsed) {
      if (/noindex/i.test(`${r.parsed.robots} ${r.parsed.googlebot} ${r.fetch.xRobotsTag}`)) addIssue(r, "error", "sitemap-url-noindex");
      if ((r.parsed.canonicals[0] ?? entry.loc) !== entry.loc) addIssue(r, "error", "sitemap-url-not-canonical", r.parsed.canonicals[0]);
      // HTML and sitemap hreflang must agree, or Google drops the pair.
      const html = r.parsed.alternates;
      const keys = new Set([...Object.keys(html), ...Object.keys(entry.alternates)]);
      for (const key of keys) {
        if (html[key] !== entry.alternates[key]) addIssue(r, "error", "hreflang-html-vs-sitemap", `${key}: html=${html[key] ?? "-"} sitemap=${entry.alternates[key] ?? "-"}`);
      }
    }
    if (!robotsAllows(rules, new URL(entry.loc).pathname)) addIssue(r, "error", "sitemap-url-robots-blocked");
  }
  for (const r of records.values()) {
    if (!r.inSitemap && r.indexable && r.fetch.finalStatus === 200) addIssue(r, "warn", "indexable-not-in-sitemap");
  }

  // ---- hreflang across pages ---------------------------------------------
  for (const r of records.values()) {
    if (!r.parsed) continue;
    const alts = r.parsed.alternates;
    const own = Object.entries(alts).find(([code, href]) => href === r.url && code !== "x-default")?.[0];
    for (const [code, href] of Object.entries(alts)) {
      if (href === r.url) continue;
      const target = records.get(href);
      const status = statusOf(href);
      if (!status) continue;
      if (status.redirects.length > 0) {
        // x-default "/" is the language picker that redirects by design.
        if (!(code === "x-default" && href === `${ORIGIN}/`)) addIssue(r, "error", "hreflang-target-redirects", `${code} ${href}`);
        continue;
      }
      if (status.finalStatus !== 200) {
        addIssue(r, "error", "hreflang-target-status", `${code} ${href} ${status.finalStatus}`);
        continue;
      }
      if (!target?.parsed) continue;
      if (code !== "x-default" && !target.indexable) addIssue(r, "error", "hreflang-target-not-indexable", `${code} ${href}`);
      if (code === "x-default") continue;
      if (own && target.parsed.alternates[own] !== r.url) addIssue(r, "error", "hreflang-not-reciprocal", `${code} ${href} lists ${own}=${target.parsed.alternates[own] ?? "-"}`);
      if ((target.parsed.alternates["x-default"] ?? "") !== (alts["x-default"] ?? "")) {
        addIssue(r, "warn", "hreflang-x-default-disagrees", `${code} ${href}: ${target.parsed.alternates["x-default"] ?? "-"} vs ${alts["x-default"] ?? "-"}`);
      }
    }
  }

  // ---- Link graph: broken, redirecting, inbound, depth -------------------
  const inbound = new Map<string, { any: number; main: number }>();
  const broken = new Map<string, Set<string>>();
  const redirectTargets = new Map<string, { to: string; from: Set<string> }>();
  for (const r of records.values()) {
    for (const link of new Set(r.links.map((l) => `${l.url}\t${l.region}`))) {
      const [url = "", region] = link.split("\t");
      if (url === r.url) continue;
      const status = statusOf(url);
      const counts = inbound.get(url) ?? { any: 0, main: 0 };
      counts.any += 1;
      if (region === "main") counts.main += 1;
      inbound.set(url, counts);
      if (!status) continue;
      if (status.finalStatus === 0 || status.finalStatus >= 400) {
        const set = broken.get(url) ?? new Set<string>();
        set.add(r.url);
        broken.set(url, set);
      } else if (status.redirects.length > 0) {
        const entry = redirectTargets.get(url) ?? { to: status.finalUrl, from: new Set<string>() };
        entry.from.add(r.url);
        redirectTargets.set(url, entry);
      }
    }
  }

  // Click depth from the three home pages, through redirects, over every link.
  const depth = new Map<string, number>();
  let level = HOMES.filter((h) => records.has(h));
  for (const h of level) depth.set(h, 0);
  for (let d = 1; level.length > 0; d += 1) {
    const nextLevel: string[] = [];
    for (const url of level) {
      for (const link of records.get(url)?.links ?? []) {
        const target = statusOf(link.url)?.redirects.length ? (statusOf(link.url)?.finalUrl ?? link.url) : link.url;
        if (!depth.has(target) && records.get(target)?.parsed) {
          depth.set(target, d);
          nextLevel.push(target);
        }
      }
    }
    level = nextLevel;
  }

  for (const entry of sitemap) {
    const r = records.get(entry.loc);
    if (!r) continue;
    const counts = inbound.get(entry.loc);
    if (!counts || counts.any === 0) addIssue(r, "error", "orphan");
    else if (counts.main === 0 && new URL(entry.loc).pathname.split("/").filter(Boolean).length > 1) addIssue(r, "info", "no-contextual-links");
    const d = depth.get(entry.loc);
    if (d === undefined) addIssue(r, "warn", "unreachable-from-home");
    else if (d > 3) addIssue(r, "warn", "deep-page", `${d} clicks`);
  }

  // ---- Duplicates and templated text, indexable pages only --------------
  const indexablePages = [...records.values()].filter((r) => r.indexable && r.parsed);
  const byTitle = new Map<string, string[]>();
  const byDesc = new Map<string, string[]>();
  for (const r of indexablePages) {
    const t = r.parsed?.title ?? "";
    const d = r.parsed?.description ?? "";
    if (t) byTitle.set(t, [...(byTitle.get(t) ?? []), r.url]);
    if (d) byDesc.set(d, [...(byDesc.get(d) ?? []), r.url]);
  }
  for (const [title, urls] of byTitle) if (urls.length > 1) for (const u of urls) addIssue(records.get(u) as PageRecord, "warn", "duplicate-title", `${urls.length}x "${title.slice(0, 70)}"`);
  for (const [desc, urls] of byDesc) if (urls.length > 1) for (const u of urls) addIssue(records.get(u) as PageRecord, "warn", "duplicate-description", `${urls.length}x "${desc.slice(0, 70)}"`);

  const families = new Map<string, PageRecord[]>();
  for (const r of indexablePages) {
    const f = familyOf(r.url);
    families.set(f, [...(families.get(f) ?? []), r]);
  }
  const familyRows: string[] = ["family\tindexable\ttitle_skeletons\tdesc_skeletons\ttop_desc_skeleton_share\tavg_title_len\tavg_desc_len\ttitles_gt65\tdescs_lt70_or_gt165"];
  for (const [family, pages] of [...families.entries()].sort((a, b) => b[1].length - a[1].length)) {
    const titleSk = new Map<string, number>();
    const descSk = new Map<string, number>();
    for (const p of pages) {
      const ts = templateSkeleton(p.parsed?.title ?? "", p.url);
      const ds = templateSkeleton(p.parsed?.description ?? "", p.url);
      titleSk.set(ts, (titleSk.get(ts) ?? 0) + 1);
      descSk.set(ds, (descSk.get(ds) ?? 0) + 1);
    }
    const topDesc = Math.max(...descSk.values());
    const avg = (f: (p: PageRecord) => number) => Math.round(pages.reduce((s, p) => s + f(p), 0) / pages.length);
    familyRows.push(
      [
        family,
        pages.length,
        titleSk.size,
        descSk.size,
        `${Math.round((topDesc / pages.length) * 100)}%`,
        avg((p) => p.parsed?.title.length ?? 0),
        avg((p) => p.parsed?.description.length ?? 0),
        pages.filter((p) => (p.parsed?.title.length ?? 0) > 65).length,
        pages.filter((p) => {
          const n = p.parsed?.description.length ?? 0;
          return n < 70 || n > 165;
        }).length,
      ].join("\t"),
    );
  }

  // ---- News sitemap and llms.txt -----------------------------------------
  const newsRows: string[] = [];
  for (const n of news) {
    const r = records.get(n.loc);
    const ageH = (Date.now() - Date.parse(n.date)) / 36e5;
    const problems: string[] = [];
    if (!sitemapSet.has(n.loc)) problems.push("not in sitemap.xml");
    if (!(ageH <= 48)) problems.push(`published ${Math.round(ageH)} h ago (Google News: 2 days)`);
    if (n.lang !== new URL(n.loc).pathname.split("/")[1]) problems.push(`language ${n.lang}`);
    if (r && !r.indexable) problems.push("not indexable");
    newsRows.push(`${n.loc}\t${n.date}\t${problems.join("; ") || "ok"}`);
  }
  const llmsRows: string[] = [];
  for (const url of llmsUrls) {
    const r = records.get(url);
    const problems: string[] = [];
    if (!r) problems.push("not crawled");
    else {
      if (r.fetch.redirects.length) problems.push(`redirects to ${r.fetch.finalUrl}`);
      if (r.fetch.finalStatus !== 200) problems.push(`status ${r.fetch.finalStatus}`);
      if (r.parsed && !r.indexable) problems.push("not indexable");
    }
    if (!sitemapSet.has(url)) problems.push("not in sitemap");
    llmsRows.push(`${url}\t${problems.join("; ") || "ok"}`);
  }

  // og:image targets: one HEAD per distinct image.
  const ogImages = new Set<string>();
  for (const r of records.values()) if (r.parsed?.og["og:image"]) ogImages.add(r.parsed.og["og:image"]);
  const badOgImages: string[] = [];
  await mapLimit([...ogImages], CONCURRENCY, async (img) => {
    const res = await fetchPage(img, { method: "HEAD" });
    if (res.finalStatus !== 200 || !/^image\//.test(res.contentType)) badOgImages.push(`${img}\t${res.finalStatus}\t${res.contentType}`);
  });
  for (const r of records.values()) {
    const img = r.parsed?.og["og:image"];
    if (img && badOgImages.some((b) => b.startsWith(`${img}\t`))) addIssue(r, "error", "og-image-broken", img);
  }

  // ---- Output ------------------------------------------------------------
  const issueRows = ["url\tin_sitemap\tindexable\tseverity\tcode\tdetail"];
  const tally = new Map<string, { n: number; sitemap: number; example: string }>();
  for (const r of records.values()) {
    for (const issue of r.issues) {
      issueRows.push([r.url, r.inSitemap ? 1 : 0, r.indexable ? 1 : 0, issue.severity, issue.code, (issue.detail ?? "").replace(/\s+/g, " ")].join("\t"));
      const key = `${issue.severity}\t${issue.code}`;
      const t = tally.get(key) ?? { n: 0, sitemap: 0, example: r.url };
      t.n += 1;
      if (r.inSitemap) t.sitemap += 1;
      tally.set(key, t);
    }
  }
  const brokenRows = ["target\tstatus\tlinked_from_count\texample_from"];
  for (const [url, from] of [...broken.entries()].sort((a, b) => b[1].size - a[1].size)) {
    brokenRows.push(`${url}\t${statusOf(url)?.finalStatus}\t${from.size}\t${[...from].slice(0, 3).join(" ")}`);
  }
  const redirectRows = ["target\tfinal\tlinked_from_count\texample_from"];
  for (const [url, e] of [...redirectTargets.entries()].sort((a, b) => b[1].from.size - a[1].from.size)) {
    redirectRows.push(`${url}\t${e.to}\t${e.from.size}\t${[...e.from].slice(0, 3).join(" ")}`);
  }
  const depthRows = ["url\tdepth\tinbound_any\tinbound_main\tfamily"];
  for (const entry of sitemap) {
    const c = inbound.get(entry.loc);
    depthRows.push(`${entry.loc}\t${depth.get(entry.loc) ?? "unreachable"}\t${c?.any ?? 0}\t${c?.main ?? 0}\t${familyOf(entry.loc)}`);
  }
  const depthHistogram = new Map<string, number>();
  for (const entry of sitemap) {
    const d = String(depth.get(entry.loc) ?? "unreachable");
    depthHistogram.set(d, (depthHistogram.get(d) ?? 0) + 1);
  }
  const schemaTally = new Map<string, number>();
  for (const r of records.values()) for (const t of r.parsed?.jsonLdTypes ?? []) if (r.inSitemap) schemaTally.set(t, (schemaTally.get(t) ?? 0) + 1);

  const allPages = [...records.values()];
  const summary: string[] = [];
  summary.push(`Site audit ${new Date().toISOString()} on ${ORIGIN}`);
  summary.push(`robots.txt sitemaps: ${sitemapRefs.join(" ")}`);
  summary.push(
    `Sitemap ${sitemap.length} URLs; news ${news.length}; llms.txt ${llmsUrls.length}. Crawled ${allPages.length} URLs (${allPages.filter((r) => r.parsed).length} HTML pages parsed, ` +
      `${allPages.filter((r) => !r.inSitemap && r.parsed).length} off-sitemap, of which ${allPages.filter((r) => !r.inSitemap && r.parsed && !r.indexable).length} not indexable); ` +
      `${resolvedOther.size} other link targets resolved with HEAD. ${Math.round((Date.now() - started) / 1000)} s.`,
  );
  summary.push("\nISSUES (severity, code, all URLs, sitemap URLs, example)");
  for (const [key, t] of [...tally.entries()].sort((a, b) => b[1].n - a[1].n)) {
    summary.push(`  ${key.padEnd(48)} ${String(t.n).padStart(5)} ${String(t.sitemap).padStart(5)}  ${t.example.replace(ORIGIN, "")}`);
  }
  summary.push(`\nBROKEN INTERNAL LINK TARGETS: ${broken.size}`);
  for (const row of brokenRows.slice(1, 21)) summary.push(`  ${row.replaceAll(ORIGIN, "")}`);
  summary.push(`\nLINKS TO REDIRECTS (distinct targets): ${redirectTargets.size}`);
  for (const row of redirectRows.slice(1, 16)) summary.push(`  ${row.replaceAll(ORIGIN, "")}`);
  summary.push(`\nCLICK DEPTH OF SITEMAP URLS FROM THE HOME PAGES`);
  for (const [d, n] of [...depthHistogram.entries()].sort()) summary.push(`  ${d.padStart(11)}  ${n}`);
  summary.push(`\nSTRUCTURED DATA ON SITEMAP URLS`);
  for (const [t, n] of [...schemaTally.entries()].sort((a, b) => b[1] - a[1])) summary.push(`  ${String(n).padStart(5)}  ${t}`);
  summary.push(`\nNEWS SITEMAP`);
  for (const row of newsRows) summary.push(`  ${row.replace(ORIGIN, "")}`);
  summary.push(`\nLLMS.TXT URLS WITH PROBLEMS: ${llmsRows.filter((r) => !r.endsWith("\tok")).length}/${llmsRows.length}`);
  for (const row of llmsRows.filter((r) => !r.endsWith("\tok"))) summary.push(`  ${row.replace(ORIGIN, "")}`);
  summary.push(`\nOG IMAGES BROKEN: ${badOgImages.length}/${ogImages.size}`);
  for (const row of badOgImages) summary.push(`  ${row}`);

  // Article-like pages (four path segments or more) under 400 words of <main> text.
  const thin = allPages.filter((r) => r.inSitemap && r.parsed && new URL(r.url).pathname.split("/").filter(Boolean).length >= 3 && r.parsed.mainWords < 400);
  const times = allPages.filter((r) => r.parsed).map((r) => r.fetch.ms).sort((a, b) => a - b);
  summary.push(`\nRESPONSE TIME (ms, ${times.length} pages${process.env.SEO_CACHE_DIR ? ", as first fetched before caching" : ""}): median ${times[Math.floor(times.length / 2)] ?? 0}, p90 ${times[Math.floor(times.length * 0.9)] ?? 0}, max ${times.at(-1) ?? 0}`);
  summary.push(`\nTHIN SITEMAP PAGES (<400 words in <main>, 3+ path segments): ${thin.length}`);
  for (const r of thin.sort((a, b) => (a.parsed?.mainWords ?? 0) - (b.parsed?.mainWords ?? 0)).slice(0, 30)) summary.push(`  ${String(r.parsed?.mainWords).padStart(5)}  ${r.url.replace(ORIGIN, "")}`);

  await writeFile(join(OUT, "summary.txt"), `${summary.join("\n")}\n`);
  await writeFile(join(OUT, "issues.tsv"), `${issueRows.join("\n")}\n`);
  await writeFile(join(OUT, "broken-links.tsv"), `${brokenRows.join("\n")}\n`);
  await writeFile(join(OUT, "links-to-redirects.tsv"), `${redirectRows.join("\n")}\n`);
  await writeFile(join(OUT, "depth.tsv"), `${depthRows.join("\n")}\n`);
  await writeFile(join(OUT, "families.tsv"), `${familyRows.join("\n")}\n`);
  await writeFile(join(OUT, "news.tsv"), `${newsRows.join("\n")}\n`);
  await writeFile(join(OUT, "llms.tsv"), `${llmsRows.join("\n")}\n`);
  await writeFile(
    join(OUT, "pages.jsonl"),
    `${allPages.map((r) => JSON.stringify({ ...r, links: r.links.length, depth: depth.get(r.url) ?? null, inbound: inbound.get(r.url) ?? null })).join("\n")}\n`,
  );
  console.log(summary.slice(0, 60).join("\n"));
  console.log(`\nFull report in ${OUT}/ (summary.txt, issues.tsv, broken-links.tsv, links-to-redirects.tsv, depth.tsv, families.tsv, news.tsv, llms.tsv, pages.jsonl)`);
}

await main();
