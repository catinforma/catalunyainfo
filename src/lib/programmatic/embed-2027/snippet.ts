/**
 * The code a site pastes to embed one of our widgets (the holiday calendar,
 * the calculators): an <iframe> and, OUTSIDE it, a plain <a href> to the page
 * the widget's content comes from. Only that second link is in the host page's
 * own HTML, so only it counts as a link from their site; the iframe's footer
 * link stays inside our document.
 *
 * Data-free and dependency-free: the builder (a client component) and the
 * server-rendered "embed this" boxes both import it, so the two can never hand
 * out different code.
 */

export function attr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface SnippetInput {
  /** "https://www.catalunyainfo.com". */
  origin: string;
  /** Site path of the widget ("/embed/ca/2027/barcelona/"). */
  embed: string;
  /** Site path of the page the link points to. */
  page: string;
  /** The iframe's title (screen readers) and the link's text. */
  title: string;
  height: number;
  maxWidth?: number;
}

export function iframeSnippet(s: SnippetInput): string {
  return (
    `<iframe src="${attr(s.origin + s.embed)}" title="${attr(s.title)}" width="100%" height="${s.height}" style="border:0;max-width:${s.maxWidth ?? 520}px" loading="lazy"></iframe>\n` +
    `<p><a href="${attr(s.origin + s.page)}">${attr(s.title)}</a> · CatalunyaInfo</p>`
  );
}

export function linkSnippet(s: Pick<SnippetInput, "origin" | "page" | "title">): string {
  return `<a href="${attr(s.origin + s.page)}">${attr(s.title)}</a>`;
}

/** The holiday calendar's frame height (its longest list fits without a scrollbar at 520 px). */
export const CALENDAR_HEIGHT = 640;
