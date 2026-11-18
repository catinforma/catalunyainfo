import { EMBED_ROBOTS_VALUE } from "@/lib/security-headers";
import { SITE, absoluteUrl } from "@/lib/site";

/**
 * The document every embeddable widget is served as (the 2027 holiday
 * calendar, render.ts; the calculators, lib/programmatic/embed-calc/): one
 * self-contained HTML string, system fonts, an inline style, no script, no
 * cookie, no request to anyone. Framing and robots headers come from
 * next.config.ts (`EMBED_SOURCE`, `EMBED_CALC_SOURCE`).
 *
 * Each document says where its content lives on the site with the attribution
 * link at the foot, a plain followed link to that page. The widget is noindex,
 * `indexifembedded` (never a result of its own) and carries NO rel=canonical:
 * Google warns that noindex + canonical can pass the noindex to the target,
 * which would drop the town or calculator page (decision 18 Nov 2026).
 */

export function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export type ShellLocale = "ca" | "es" | "en";

/** Small on purpose: system fonts, no colours beyond two greys and the site's green, readable at 280 px. */
export const BASE_STYLE = [
  ":root{color-scheme:light;font:14px/1.45 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#1b2a33;background:#fff}",
  "body{margin:0;padding:12px}",
  "h1{font-size:16px;margin:0 0 8px}",
  "h2{font-size:14px;margin:14px 0 6px}",
  "table{width:100%;border-collapse:collapse}",
  "th,td{text-align:left;padding:4px 6px;border-bottom:1px solid #e3e8e6;vertical-align:top}",
  "th{font-size:12px;color:#55636b;font-weight:600}",
  "td.d{white-space:nowrap}",
  "td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}",
  "tr.l td{background:#f1f7f4}",
  "small{display:block;color:#55636b;font-size:12px}",
  "p{margin:8px 0 0;font-size:12px;color:#3d4b53}",
  "a{color:#0b6b4f}",
  "footer{margin-top:10px;padding-top:6px;border-top:1px solid #e3e8e6;font-size:13px}",
].join("");

const SOURCE_LEAD: Record<ShellLocale, string> = { ca: "Font:", es: "Fuente:", en: "Source:" };

/** "Font: <a href="…">CatalunyaInfo</a>": the attribution, never nofollow. */
export function attributionFooter(lang: ShellLocale, page: string): string {
  return `<footer>${SOURCE_LEAD[lang]} <a href="${esc(absoluteUrl(page))}" target="_blank" rel="noopener">${esc(SITE.name)}</a></footer>`;
}

export interface ShellInput {
  lang: ShellLocale;
  title: string;
  /** Site path of the page the widget's content belongs to: the attribution link. */
  page: string;
  /** The body's HTML, already escaped. */
  body: string[];
  /** Extra CSS for this widget. */
  style?: string;
}

export function embedDocument(input: ShellInput): string {
  return [
    "<!doctype html>",
    `<html lang="${input.lang}">`,
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<meta name="robots" content="${EMBED_ROBOTS_VALUE}">`,
    `<title>${esc(input.title)}</title>`,
    `<style>${BASE_STYLE}${input.style ?? ""}</style>`,
    "</head>",
    "<body>",
    ...input.body,
    // The attribution: a plain, followed link to the page the content comes from.
    attributionFooter(input.lang, input.page),
    "</body>",
    "</html>",
  ].join("\n");
}
