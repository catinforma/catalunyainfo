/**
 * Per-page technical SEO checks on the raw HTML a crawler receives.
 *
 * Pure functions (no network), so the rules are unit-tested
 * (tests/site-audit-checks.test.ts) and `scripts/site-audit.ts` only crawls
 * and aggregates. Everything is read from the server HTML: our JSON-LD is
 * rendered on the server, so what curl sees is what Google sees.
 */

export type Severity = "error" | "warn" | "info";

export interface Issue {
  severity: Severity;
  /** Stable key for tallies, e.g. "title-too-long". */
  code: string;
  detail?: string;
}

export interface PageLink {
  /** Absolute URL without the #fragment. */
  url: string;
  /** The href exactly as written. */
  raw: string;
  /** Where the anchor sits: site header/menu (before <main>), main content, or footer (after </main>). */
  region: "nav" | "main" | "footer";
  rel: string;
}

export interface JsonLdNode {
  type: string;
  /** Path inside the block, e.g. "@graph[1].mainEntity[0]". */
  path: string;
  node: Record<string, unknown>;
}

export interface ParsedPage {
  title: string;
  titleCount: number;
  description: string;
  descriptionCount: number;
  robots: string;
  googlebot: string;
  canonicals: string[];
  alternates: Record<string, string>;
  hreflangCodes: string[];
  htmlLang: string;
  og: Record<string, string>;
  twitter: Record<string, string>;
  h1: string[];
  links: PageLink[];
  imagesNoAlt: string[];
  imagesEmptyAlt: number;
  /** <img> in <main> without width and height (layout shift). */
  imagesNoSize: number;
  htmlBytes: number;
  images: number;
  mixedContent: string[];
  jsonLdBlocks: number;
  jsonLdErrors: string[];
  jsonLd: JsonLdNode[];
  /** Text of the visible breadcrumb trail (labels), when the page has one. */
  breadcrumbTrail: string[];
  /** Visible text of <body>, scripts and styles removed, whitespace collapsed. */
  visibleText: string;
  mainWords: number;
}

const ENTITIES: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === "#") {
      const n = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
    }
    return ENTITIES[code.toLowerCase()] ?? whole;
  });
}

/** Attributes of one start tag, names lower-cased, values decoded. */
export function tagAttributes(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const inner = tag.replace(/^<\s*[a-zA-Z0-9-]+/, "").replace(/\/?>$/, "");
  for (const m of inner.matchAll(/([^\s"'=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const name = (m[1] ?? "").toLowerCase();
    if (!name || name in out) continue;
    out[name] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return out;
}

function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<template\b[\s\S]*?<\/template>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

/** Lower-case, accents and punctuation kept, whitespace collapsed, typographic quotes folded. */
export function normalizeText(text: string): string {
  return text
    .replace(/[\u2018\u2019\u00b4]/g, "'")
    .replace(/[\u201c\u201d\u00ab\u00bb]/g, '"')
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function canonicalHosts(origin: string): Set<string> {
  const host = new URL(origin).host;
  return new Set([host, host.replace(/^www\./, "")]);
}

export function parseHtml(html: string, pageUrl: string, origin: string): ParsedPage {
  // Scripts are cut out before reading tags, so a "<title>" inside the RSC
  // payload or a JSON-LD string is never mistaken for markup.
  const scriptless = html.replace(/<script\b[\s\S]*?<\/script>/gi, (s) => (s.startsWith('<script type="application/ld+json"') ? s : " "));
  const tags = (name: string) => [...scriptless.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => tagAttributes(m[0]));

  const titles = [...scriptless.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decodeEntities(m[1] ?? "").trim());
  // Inline <svg><title> elements are labels, not the document title.
  const docTitles = [...scriptless.replace(/<svg\b[\s\S]*?<\/svg>/gi, " ").matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((m) =>
    decodeEntities(m[1] ?? "").trim(),
  );

  const metas = tags("meta");
  const metaByName = (name: string) => metas.filter((m) => (m.name ?? "").toLowerCase() === name).map((m) => m.content ?? "");
  const descriptions = metaByName("description");
  const og: Record<string, string> = {};
  const twitter: Record<string, string> = {};
  for (const m of metas) {
    const prop = (m.property ?? "").toLowerCase();
    const name = (m.name ?? "").toLowerCase();
    if (prop.startsWith("og:") && !(prop in og)) og[prop] = m.content ?? "";
    if (name.startsWith("twitter:") && !(name in twitter)) twitter[name] = m.content ?? "";
  }

  const linksTags = tags("link");
  const canonicals = linksTags.filter((l) => (l.rel ?? "").toLowerCase() === "canonical").map((l) => l.href ?? "");
  const alternates: Record<string, string> = {};
  const hreflangCodes: string[] = [];
  for (const l of linksTags) {
    if ((l.rel ?? "").toLowerCase() !== "alternate" || !l.hreflang) continue;
    hreflangCodes.push(l.hreflang);
    if (!(l.hreflang in alternates)) alternates[l.hreflang] = l.href ?? "";
  }

  const htmlLang = tagAttributes(/<html\b[^>]*>/i.exec(html)?.[0] ?? "<html>").lang ?? "";

  const mainStart = scriptless.search(/<main\b/i);
  const mainEndIdx = scriptless.search(/<\/main>/i);
  const mainEnd = mainEndIdx > mainStart ? mainEndIdx : -1;

  const hosts = canonicalHosts(origin);
  const links: PageLink[] = [];
  for (const m of scriptless.matchAll(/<a\b[^>]*>/gi)) {
    const a = tagAttributes(m[0]);
    const raw = a.href;
    if (raw === undefined || raw === "" || /^(mailto:|tel:|sms:|javascript:|#|data:|whatsapp:)/i.test(raw)) continue;
    let resolved: URL;
    try {
      resolved = new URL(raw, pageUrl);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(resolved.protocol) || !hosts.has(resolved.host)) continue;
    resolved.hash = "";
    const at = m.index ?? 0;
    const region = mainStart >= 0 && at < mainStart ? "nav" : mainEnd >= 0 && at > mainEnd ? "footer" : "main";
    links.push({ url: resolved.toString(), raw, region, rel: (a.rel ?? "").toLowerCase() });
  }

  const imgs = [...scriptless.matchAll(/<img\b[^>]*>/gi)].map((m) => tagAttributes(m[0]));
  const imagesNoAlt = imgs.filter((img) => !("alt" in img)).map((img) => img.src ?? "");
  const imagesEmptyAlt = imgs.filter((img) => "alt" in img && img.alt?.trim() === "").length;
  const mainImgs = [...(mainStart >= 0 && mainEnd > mainStart ? scriptless.slice(mainStart, mainEnd) : "").matchAll(/<img\b[^>]*>/gi)].map((m) => tagAttributes(m[0]));
  // next/image with `fill` sizes the image from its box, so it shifts nothing.
  const imagesNoSize = mainImgs.filter((img) => !("fill" in img) && !/position:\s*absolute/.test(img.style ?? "") && (!img.width || !img.height)).length;

  const mixedContent: string[] = [];
  for (const m of scriptless.matchAll(/<(img|script|iframe|source|video|audio|embed|object|track)\b[^>]*>/gi)) {
    const at = tagAttributes(m[0]);
    for (const key of ["src", "srcset", "data", "poster"]) {
      if (/(^|[\s,])http:\/\//i.test(at[key] ?? "")) mixedContent.push(`${(m[1] ?? "").toLowerCase()} ${key}=${at[key]}`);
    }
  }
  for (const m of [...html.matchAll(/<script\b[^>]*\bsrc="http:\/\/[^"]*"[^>]*>/gi)]) mixedContent.push(`script ${m[0].slice(0, 120)}`);
  for (const l of linksTags) {
    const rel = (l.rel ?? "").toLowerCase();
    if (/stylesheet|icon|preload|modulepreload|manifest|apple-touch-icon/.test(rel) && /^http:\/\//i.test(l.href ?? "")) {
      mixedContent.push(`link rel=${rel} href=${l.href}`);
    }
  }

  const jsonLd: JsonLdNode[] = [];
  const jsonLdErrors: string[] = [];
  let jsonLdBlocks = 0;
  for (const block of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    jsonLdBlocks += 1;
    let data: unknown;
    try {
      data = JSON.parse(block[1] ?? "");
    } catch (error) {
      jsonLdErrors.push(`block ${jsonLdBlocks}: ${(error as Error).message.slice(0, 80)}`);
      continue;
    }
    const roots = Array.isArray(data) ? data : [data];
    for (const [i, root] of roots.entries()) {
      if (!root || typeof root !== "object") continue;
      if (!("@context" in (root as object))) jsonLdErrors.push(`block ${jsonLdBlocks}${roots.length > 1 ? `[${i}]` : ""}: no @context`);
      walkJsonLd(root as Record<string, unknown>, roots.length > 1 ? `[${i}]` : "", jsonLd);
    }
  }

  const breadcrumbNav = /<nav\b[^>]*aria-label="(?:Ruta de navegació|Ruta de navegación|Breadcrumb)"[^>]*>([\s\S]*?)<\/nav>/i.exec(scriptless);
  const breadcrumbTrail = breadcrumbNav
    ? [...(breadcrumbNav[1] ?? "").matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => stripTags(m[1] ?? "").replace(/\s*\/\s*$/, "").trim())
    : [];

  const bodyStart = html.search(/<body\b/i);
  const visibleText = stripTags(bodyStart >= 0 ? html.slice(bodyStart) : html);
  const mainHtml = mainStart >= 0 && mainEnd > mainStart ? scriptless.slice(mainStart, mainEnd) : "";
  const mainWords = stripTags(mainHtml)
    .split(/\s+/)
    .filter((w) => /\p{L}/u.test(w)).length;

  const h1 = [...scriptless.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1] ?? ""));

  return {
    title: docTitles[0] ?? titles[0] ?? "",
    titleCount: docTitles.length,
    description: descriptions[0] ?? "",
    descriptionCount: descriptions.length,
    robots: metaByName("robots").join(", "),
    googlebot: metaByName("googlebot").join(", "),
    canonicals,
    alternates,
    hreflangCodes,
    htmlLang,
    og,
    twitter,
    h1,
    links,
    imagesNoAlt,
    imagesEmptyAlt,
    imagesNoSize,
    htmlBytes: html.length,
    images: imgs.length,
    mixedContent,
    jsonLdBlocks,
    jsonLdErrors,
    jsonLd,
    breadcrumbTrail,
    visibleText,
    mainWords,
  };
}

function walkJsonLd(node: Record<string, unknown>, path: string, out: JsonLdNode[]): void {
  const type = node["@type"];
  if (type !== undefined) {
    for (const t of Array.isArray(type) ? type : [type]) out.push({ type: String(t), path: path || "$", node });
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === "@context") continue;
    const items = Array.isArray(value) ? value : [value];
    items.forEach((item, i) => {
      if (item && typeof item === "object") {
        walkJsonLd(item as Record<string, unknown>, `${path}${path ? "." : ""}${key}${Array.isArray(value) ? `[${i}]` : ""}`, out);
      }
    });
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

/** JSON with the keys sorted at every level, to compare two nodes by content. */
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stableJson((value as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function asArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function urlOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return str((value as Record<string, unknown>).url) || str((value as Record<string, unknown>)["@id"]);
  return "";
}

/**
 * Required and recommended properties per type, as Google documents them for
 * the features we use (Article, BreadcrumbList, Event, Dataset, software
 * apps), plus FAQPage, which Google no longer shows as a rich result but
 * which must still only describe a FAQ that is visible on the page.
 */
export function checkJsonLd(parsed: Pick<ParsedPage, "jsonLd" | "visibleText" | "canonicals" | "breadcrumbTrail">, pageUrl: string, origin: string): Issue[] {
  const issues: Issue[] = [];
  const visible = normalizeText(parsed.visibleText);
  const hosts = canonicalHosts(origin);
  const self = parsed.canonicals[0] || pageUrl;

  const add = (severity: Severity, code: string, detail: string) => issues.push({ severity, code, detail });

  // Dates anywhere in the markup must be ISO 8601.
  for (const { node, path } of parsed.jsonLd) {
    for (const [key, value] of Object.entries(node)) {
      if (/^(date|start|end|valid|upload|expires|temporalCoverage)/i.test(key) && typeof value === "string" && key !== "temporalCoverage") {
        if (!ISO_DATE.test(value)) add("error", "jsonld-bad-date", `${path}.${key}="${value}"`);
      }
    }
  }

  const types = parsed.jsonLd.map((n) => n.type);
  const breadcrumbLists = parsed.jsonLd.filter((n) => n.type === "BreadcrumbList");
  if (breadcrumbLists.length > 1) add("warn", "jsonld-breadcrumb-multiple", `${breadcrumbLists.length} BreadcrumbList`);
  // One FAQPage per page: two describe the same visible questions twice (and Google reads one).
  const faqPages = parsed.jsonLd.filter((n) => n.type === "FAQPage");
  if (faqPages.length > 1) add("error", "jsonld-faq-multiple", `${faqPages.length} FAQPage`);
  // Two nodes with one @id contradict each other when a property they both carry differs. One that
  // only says more (the author page's Person with its description) or the same thing again (the
  // town's Place in two events) is fine.
  const byId = new Map<string, Record<string, string>>();
  const conflicting = new Set<string>();
  for (const { node } of parsed.jsonLd) {
    const id = str(node["@id"]);
    if (!id) continue;
    const seen = byId.get(id) ?? {};
    for (const [k, v] of Object.entries(node)) {
      if (k === "@id") continue;
      const body = stableJson(v);
      if (seen[k] !== undefined && seen[k] !== body) conflicting.add(id);
      seen[k] = body;
    }
    byId.set(id, seen);
  }
  for (const id of conflicting) add("error", "jsonld-id-conflict", id);
  // Places, datasets and events print what the source gives; an empty field is a gap in a template.
  for (const { type, node, path } of parsed.jsonLd) {
    if (!["Dataset", "Place", "Event", "PostalAddress", "Organization"].includes(type)) continue;
    const empty = Object.entries(node).filter(([k, v]) => !k.startsWith("@") && (v === "" || v === null || (Array.isArray(v) && v.length === 0) || (typeof v === "object" && v !== null && !Array.isArray(v) && Object.keys(v).length === 0) || (typeof v === "string" && v.trim() === "")));
    if (empty.length > 0) add("error", "jsonld-empty-field", `${type} at ${path}: ${empty.map(([k]) => k).join(", ")}`);
  }
  // The trail printed above the title is the trail in the markup (names, not only the count).
  const squash = (s: string) => normalizeText(decodeEntities(s)).replace(/\s+/g, "");
  if (breadcrumbLists.length > 0 && parsed.breadcrumbTrail.length > 0) {
    const names = (asArray(breadcrumbLists[0]!.node.itemListElement) as Record<string, unknown>[]).map((i) => squash(str(i.name) || str((i.item as Record<string, unknown> | undefined)?.name)));
    const shown = parsed.breadcrumbTrail.map(squash);
    if (names.length === shown.length && names.some((n, i) => n !== shown[i] && !(shown[i]!.endsWith("…") && n.startsWith(shown[i]!.slice(0, -1))))) {
      add("warn", "breadcrumb-names-differ", `visible ${parsed.breadcrumbTrail.join(" > ")} | JSON-LD ${names.join(" > ")}`.slice(0, 300));
    }
  }
  const visibleSquashed = squash(parsed.visibleText);

  for (const { type, node, path } of parsed.jsonLd) {
    const where = `${type} at ${path}`;
    switch (type) {
      case "Article":
      case "NewsArticle":
      case "BlogPosting": {
        for (const field of ["headline", "image", "datePublished", "dateModified", "author"]) {
          if (node[field] === undefined || node[field] === "" || (Array.isArray(node[field]) && (node[field] as unknown[]).length === 0)) {
            add("warn", "jsonld-article-missing", `${where}: ${field}`);
          }
        }
        const headline = str(node.headline);
        if (headline.length > 110) add("warn", "jsonld-article-headline-long", `${where}: ${headline.length} chars`);
        for (const author of asArray(node.author)) {
          if (!author || typeof author !== "object" || !str((author as Record<string, unknown>).name)) {
            add("error", "jsonld-article-author-no-name", where);
          }
        }
        const published = Date.parse(str(node.datePublished));
        const modified = Date.parse(str(node.dateModified));
        if (Number.isFinite(published) && Number.isFinite(modified) && modified < published) {
          add("error", "jsonld-article-modified-before-published", where);
        }
        if (Number.isFinite(published) && published > Date.now() + 36e5) add("error", "jsonld-article-published-in-future", `${where}: ${node.datePublished}`);
        if (Number.isFinite(modified) && modified > Date.now() + 36e5) add("error", "jsonld-article-modified-in-future", `${where}: ${node.dateModified}`);
        for (const image of asArray(node.image)) {
          const u = urlOf(image);
          if (u && !/^https:\/\//.test(u)) add("error", "jsonld-article-image-not-absolute", `${where}: ${u}`);
        }
        const url = str(node.url) || urlOf(node.mainEntityOfPage);
        if (url && url !== self) add("warn", "jsonld-article-url-not-canonical", `${where}: ${url}`);
        break;
      }
      case "BreadcrumbList": {
        const items = asArray(node.itemListElement) as Record<string, unknown>[];
        if (items.length === 0) {
          add("error", "jsonld-breadcrumb-empty", where);
          break;
        }
        items.forEach((item, i) => {
          if (Number(item.position) !== i + 1) add("error", "jsonld-breadcrumb-position", `${where}: item ${i + 1} has position ${String(item.position)}`);
          const name = str(item.name) || str((item.item as Record<string, unknown> | undefined)?.name);
          if (!name) add("error", "jsonld-breadcrumb-no-name", `${where}: item ${i + 1}`);
          const href = urlOf(item.item);
          const isLast = i === items.length - 1;
          if (!href && !isLast) add("error", "jsonld-breadcrumb-no-item", `${where}: item ${i + 1}`);
          if (href) {
            try {
              const u = new URL(href);
              if (!hosts.has(u.host) || u.protocol !== "https:") add("error", "jsonld-breadcrumb-foreign-url", `${where}: ${href}`);
            } catch {
              add("error", "jsonld-breadcrumb-relative-url", `${where}: ${href}`);
            }
          }
          if (isLast && href && href !== self) add("warn", "jsonld-breadcrumb-last-not-self", `${where}: ${href}`);
        });
        // The visible trail and the markup are built from one array; a
        // different length means a page emits one without the other.
        if (parsed.breadcrumbTrail.length > 0 && parsed.breadcrumbTrail.length !== items.length) {
          add("warn", "breadcrumb-visible-vs-jsonld", `visible ${parsed.breadcrumbTrail.length}, JSON-LD ${items.length}`);
        }
        break;
      }
      case "FAQPage": {
        const questions = asArray(node.mainEntity) as Record<string, unknown>[];
        if (questions.length === 0) add("error", "jsonld-faq-empty", where);
        let hidden = 0;
        let firstHidden = "";
        for (const q of questions) {
          const name = str(q.name);
          const answer = str((q.acceptedAnswer as Record<string, unknown> | undefined)?.text);
          if (!name || !answer) add("error", "jsonld-faq-incomplete", `${where}: "${name.slice(0, 60)}"`);
          if (name && !visible.includes(normalizeText(decodeEntities(name)))) {
            hidden += 1;
            firstHidden ||= name.slice(0, 80);
          }
        }
        if (hidden > 0) add("error", "jsonld-faq-not-visible", `${where}: ${hidden}/${questions.length} questions not in the page text, e.g. "${firstHidden}"`);
        // The answer too: the markup carries the text the page shows, not another wording.
        let wrong = 0;
        let firstWrong = "";
        for (const q of questions) {
          const name = str(q.name);
          const answer = str((q.acceptedAnswer as Record<string, unknown> | undefined)?.text);
          if (name && answer && visible.includes(normalizeText(decodeEntities(name))) && !visibleSquashed.includes(squash(answer))) {
            wrong += 1;
            firstWrong ||= name.slice(0, 80);
          }
        }
        if (wrong > 0) add("error", "jsonld-faq-answer-not-visible", `${where}: ${wrong}/${questions.length} answers differ from the page text, e.g. "${firstWrong}"`);
        break;
      }
      case "Event": {
        for (const field of ["name", "startDate", "location"]) {
          if (!node[field]) add("error", "jsonld-event-missing", `${where}: ${field}`);
        }
        for (const location of asArray(node.location) as Record<string, unknown>[]) {
          const lt = str(location["@type"]);
          if (lt === "VirtualLocation") {
            if (!str(location.url)) add("error", "jsonld-event-location-incomplete", `${where}: VirtualLocation without url`);
          } else if (!location.address || (typeof location.address === "object" && !Object.keys(location.address as object).length)) {
            add("error", "jsonld-event-location-incomplete", `${where}: Place without address`);
          }
        }
        const start = Date.parse(str(node.startDate));
        const end = Date.parse(str(node.endDate));
        if (Number.isFinite(start) && Number.isFinite(end) && end < start) add("error", "jsonld-event-ends-before-start", where);
        // An event that has ended is not an error (EventScheduled also means "took place as scheduled"), but the
        // page that still lists it should say it is over: reported so a calendar page does not keep a past fair as news.
        const over = Number.isFinite(end) ? end : Number.isFinite(start) && !str(node.endDate) ? start + 864e5 : NaN;
        if (Number.isFinite(over) && over < Date.now() && /Scheduled$/.test(str(node.eventStatus) || "EventScheduled")) {
          add("info", "jsonld-event-past", `${where}: ends ${str(node.endDate) || str(node.startDate)}`);
        }
        const status = str(node.eventStatus);
        if (status && !/^https:\/\/schema\.org\/Event(Scheduled|Cancelled|Postponed|Rescheduled|MovedOnline)$/.test(status)) {
          add("error", "jsonld-event-bad-status", `${where}: ${status}`);
        }
        break;
      }
      case "Dataset": {
        if (!str(node.name)) add("error", "jsonld-dataset-missing", `${where}: name`);
        const description = str(node.description);
        if (!description) add("error", "jsonld-dataset-missing", `${where}: description`);
        else if (description.length < 50 || description.length > 5000) add("warn", "jsonld-dataset-description-length", `${where}: ${description.length} chars (Google: 50-5000)`);
        if (!node.license) add("info", "jsonld-dataset-no-license", where);
        if (!node.creator) add("info", "jsonld-dataset-no-creator", where);
        break;
      }
      case "WebApplication":
      case "SoftwareApplication": {
        if (!str(node.name)) add("error", "jsonld-app-missing", `${where}: name`);
        if (!node.offers) add("info", "jsonld-app-no-offers", where);
        if (!str(node.applicationCategory)) add("info", "jsonld-app-no-category", where);
        const url = str(node.url);
        if (url && url !== self) add("warn", "jsonld-app-url-not-canonical", `${where}: ${url}`);
        break;
      }
      case "ItemList": {
        if (asArray(node.itemListElement).length === 0) add("error", "jsonld-itemlist-empty", where);
        break;
      }
      case "HowTo":
        add("info", "jsonld-howto-retired", where);
        break;
      default:
        break;
    }
  }
  if (types.includes("FAQPage") && !types.includes("Question")) add("error", "jsonld-faq-empty", "FAQPage without Question nodes");
  return issues;
}

const LANG_CODE = /^(x-default|[a-z]{2,3}(-[A-Za-z]{4})?(-([A-Z]{2}|\d{3}))?)$/;

/** Everything that can be said about one page without looking at any other. */
export function pageIssues(parsed: ParsedPage, pageUrl: string, origin: string): Issue[] {
  const issues: Issue[] = [];
  const add = (severity: Severity, code: string, detail?: string) => issues.push(detail === undefined ? { severity, code } : { severity, code, detail });

  if (!parsed.title) add("error", "title-missing");
  else if (parsed.title.length > 65) add("warn", "title-too-long", `${parsed.title.length} chars`);
  else if (parsed.title.length < 25) add("warn", "title-too-short", `${parsed.title.length} chars`);
  if (parsed.titleCount > 1) add("error", "title-multiple", `${parsed.titleCount} <title>`);

  if (!parsed.description) add("error", "description-missing");
  else if (parsed.description.length > 165) add("warn", "description-too-long", `${parsed.description.length} chars`);
  else if (parsed.description.length < 70) add("warn", "description-too-short", `${parsed.description.length} chars`);
  if (parsed.descriptionCount > 1) add("error", "description-multiple");

  if (parsed.h1.length === 0) add("error", "h1-missing");
  else if (parsed.h1.length > 1) add("warn", "h1-multiple", parsed.h1.map((h) => h.slice(0, 40)).join(" | "));
  else if (!parsed.h1[0]) add("error", "h1-empty");

  if (parsed.canonicals.length === 0) add("error", "canonical-missing");
  else if (parsed.canonicals.length > 1 && new Set(parsed.canonicals).size > 1) add("error", "canonical-multiple", parsed.canonicals.join(" "));
  const canonical = parsed.canonicals[0] ?? "";
  if (canonical && canonical !== pageUrl) add("error", "canonical-not-self", canonical);
  if (canonical && !canonical.startsWith(`${origin}/`)) add("error", "canonical-wrong-origin", canonical);

  const robots = `${parsed.robots}, ${parsed.googlebot}`.toLowerCase();
  if (/noindex/.test(robots)) add("info", "noindex");
  if (/nofollow/.test(robots)) add("warn", "nofollow");

  const codes = parsed.hreflangCodes;
  if (codes.length > 0) {
    const dup = codes.filter((c, i) => codes.indexOf(c) !== i);
    if (dup.length) add("error", "hreflang-duplicate-code", [...new Set(dup)].join(","));
    for (const code of codes) if (!LANG_CODE.test(code)) add("error", "hreflang-invalid-code", code);
    if (!codes.includes("x-default")) add("warn", "hreflang-no-x-default");
    if (!Object.values(parsed.alternates).includes(pageUrl)) add("error", "hreflang-no-self", pageUrl);
    for (const href of Object.values(parsed.alternates)) {
      if (!href.startsWith(`${origin}/`) && href !== `${origin}`) add("error", "hreflang-wrong-origin", href);
    }
  }

  const urlLocale = new URL(pageUrl).pathname.split("/")[1] ?? "";
  if (["ca", "es", "en"].includes(urlLocale) && !parsed.htmlLang.toLowerCase().startsWith(urlLocale)) {
    add("error", "html-lang-mismatch", `lang="${parsed.htmlLang}" on /${urlLocale}/`);
  }
  if (["ca", "es", "en"].includes(urlLocale) && codes.length > 0) {
    const own = Object.entries(parsed.alternates).find(([code, href]) => href === pageUrl && code !== "x-default")?.[0] ?? "";
    if (own && !own.toLowerCase().startsWith(urlLocale)) add("error", "hreflang-self-wrong-language", `${own} on /${urlLocale}/`);
  }

  // Open Graph / Twitter cards: what a shared link shows in WhatsApp, X, etc.
  for (const key of ["og:title", "og:description", "og:url", "og:image", "og:type"]) {
    if (!parsed.og[key]) add("warn", "og-missing", key);
  }
  if (parsed.og["og:url"] && canonical && parsed.og["og:url"] !== canonical) add("warn", "og-url-not-canonical", parsed.og["og:url"]);
  if (parsed.og["og:image"] && !/^https:\/\//.test(parsed.og["og:image"])) add("error", "og-image-not-absolute", parsed.og["og:image"]);
  if (!parsed.twitter["twitter:card"]) add("warn", "twitter-card-missing");
  const ogLocale = (parsed.og["og:locale"] ?? "").toLowerCase();
  if (ogLocale && ["ca", "es", "en"].includes(urlLocale) && !ogLocale.startsWith(urlLocale)) add("warn", "og-locale-mismatch", ogLocale);

  if (parsed.imagesNoAlt.length > 0) add("warn", "img-no-alt", `${parsed.imagesNoAlt.length}: ${parsed.imagesNoAlt.slice(0, 2).join(" ")}`);
  if (parsed.imagesNoSize > 0) add("warn", "img-no-size", `${parsed.imagesNoSize} in <main> without width/height`);
  if (parsed.htmlBytes > 400_000) add("warn", "html-heavy", `${Math.round(parsed.htmlBytes / 1024)} KB`);
  if (parsed.mixedContent.length > 0) add("error", "mixed-content", parsed.mixedContent.slice(0, 3).join(" | "));

  for (const e of parsed.jsonLdErrors) add("error", e.includes("no @context") ? "jsonld-no-context" : "jsonld-invalid", e);
  issues.push(...checkJsonLd(parsed, pageUrl, origin));

  // Links as written: each of these costs a redirect hop per crawl.
  const redirecting = parsed.links.filter((l) => {
    const u = new URL(l.url);
    if (u.protocol === "http:" || u.host !== new URL(origin).host) return true;
    const last = u.pathname.split("/").pop() ?? "";
    return u.pathname !== "/" && !u.pathname.endsWith("/") && !last.includes(".");
  });
  if (redirecting.length > 0) add("warn", "links-redirecting-form", `${redirecting.length}: ${[...new Set(redirecting.map((l) => l.raw))].slice(0, 3).join(" ")}`);

  return issues;
}

/** The section a URL belongs to, for per-family tallies: "/es/festivos/dia/" style, at most three segments. */
export function familyOf(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return `/${parts.join("/")}${parts.length ? "/" : ""}`;
  const depth = parts.length >= 4 ? 3 : 2;
  return `/${parts.slice(0, Math.min(depth, parts.length - 1)).join("/")}/`;
}

/**
 * Template text left after removing what makes a page unique (the words of
 * its own URL slug and every number): two pages whose descriptions reduce to
 * the same skeleton say the same thing about different towns or dates.
 */
export function templateSkeleton(text: string, url: string): string {
  const slugWords = new Set(
    new URL(url).pathname
      .split(/[/-]/)
      .filter((w) => w.length > 2)
      .map((w) => w.toLowerCase()),
  );
  return normalizeText(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w && !/\d/.test(w) && !slugWords.has(w))
    .join(" ");
}
