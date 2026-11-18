import { RELATED_LINK_CONTEXTS, safePath, type AnalyticsEvent, type ChannelLinkContext, type OfficialLinkContext } from "./events";

/**
 * Which link clicks become an analytics event (AnalyticsClicks.tsx listens,
 * this decides). Pure, so it is tested without a DOM.
 *
 * Four kinds of link are measured, from the href (and the box it sits in),
 * so server-rendered links need no client component of their own:
 *  - our WhatsApp channel             -> whatsapp_channel_click
 *  - a town or city .ics feed         -> ics_subscribe_click
 *  - an official or primary source    -> outbound_official_source_click
 *  - one of our pages, from the "next useful step" box
 *    (`data-ci-placement="next_step"`) or a town's list of its other pages
 *    (`"town_hub"`)                    -> related_content_click
 *
 * Every other click is left to GA4's enhanced measurement (`click` for any
 * outbound link), so nothing is counted twice under our names; other
 * internal links are not measured at all.
 */

export interface LinkClick {
  /** The anchor's resolved href (`a.href`, always absolute). */
  href: string;
  /** `location.hostname` of the page. */
  siteHost: string;
  locale: string;
  /** Our WhatsApp channel URL (lib/share/channel.ts). */
  channelUrl: string;
  /** The link sits in a page's source list (`.ci-sources`). */
  inSources: boolean;
  /** The link sits inside a calculator (`.ci-calc`). */
  inCalculator: boolean;
  /** `data-ci-placement` of the link or its nearest ancestor, if any. */
  placement?: string | null;
}

/**
 * Public administrations, official gazettes and public operators, matched as
 * the host or a parent domain of it. Not exhaustive on purpose: a council on a
 * bare `<town>.cat` domain cannot be told apart from a private `.cat` site, so
 * those count only when they are listed in a page's sources (by house rule
 * every listed source is official or primary).
 */
export const OFFICIAL_DOMAINS: readonly string[] = [
  // Spanish State: ministries and agencies (*.gob.es covers AEAT, SEPE's sede, Interior, INE's sede…)
  "gob.es", "boe.es", "ine.es", "bde.es", "tesoro.es", "seg-social.es", "sepe.es", "agenciatributaria.es",
  "aemet.es", "dgt.es", "juntaelectoralcentral.es", "congreso.es", "senado.es", "poderjudicial.es", "cnmc.es",
  // State-owned operators
  "ree.es", "adif.es", "renfe.com", "aena.es", "loteriasyapuestas.es",
  // Catalonia
  "gencat.cat", "parlament.cat", "transparenciacatalunya.cat", "idescat.cat", "meteo.cat", "icgc.cat",
  "diba.cat", "dipta.cat", "ddgi.cat", "diputaciolleida.cat", "amb.cat", "ambmobilitat.cat",
  "barcelona.cat", "bcn.cat", "seu-e.cat", "aoc.cat", "paeria.cat", "tmb.cat", "fgc.cat", "atm.cat",
  // The other communities and their gazettes
  "gva.es", "juntadeandalucia.es", "xunta.gal", "aragon.es", "jcyl.es", "comunidad.madrid", "madrid.es", "bocm.es",
  "euskadi.eus", "bizkaia.eus", "gipuzkoa.eus", "araba.eus", "navarra.es", "larioja.org", "caib.es",
  "gobiernodecanarias.org", "carm.es", "borm.es", "castillalamancha.es", "jccm.es", "juntaex.es",
  "asturias.es", "cantabria.es", "ceuta.es", "melilla.es",
  // European Union
  "europa.eu",
];

/** The host without `www.`, if it is an official domain; otherwise null. */
export function officialDomain(host: string): string | null {
  const h = host.toLowerCase().replace(/^www\./, "");
  if (!h) return null;
  return OFFICIAL_DOMAINS.some((d) => h === d || h.endsWith(`.${d}`)) ? h : null;
}

const CHANNEL_CONTEXTS: readonly ChannelLinkContext[] = ["article_box", "daily_box", "footer"];

function channelContext(placement: string | null | undefined): ChannelLinkContext {
  return CHANNEL_CONTEXTS.find((c) => c === placement) ?? "other";
}

function sameChannel(url: URL, channelUrl: string): boolean {
  try {
    const ours = new URL(channelUrl);
    return url.hostname.replace(/^www\./, "") === ours.hostname.replace(/^www\./, "") && url.pathname.replace(/\/$/, "") === ours.pathname.replace(/\/$/, "");
  } catch {
    return false;
  }
}

function isIcsPath(pathname: string): boolean {
  return pathname.startsWith("/ics/") && pathname.endsWith(".ics");
}

/** The event a click on this link sends, or null when the link is not measured. */
export function classifyLinkClick(click: LinkClick): AnalyticsEvent | null {
  let url: URL;
  try {
    url = new URL(click.href);
  } catch {
    return null;
  }
  const site = click.siteHost.toLowerCase().replace(/^www\./, "");
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const locale = click.locale;

  // Calendar feeds first: the webcal:// and Google links point at our own /ics/ path.
  if (url.protocol === "webcal:" && host === site && isIcsPath(url.pathname)) {
    return { name: "ics_subscribe_click", params: { method: "apple", locale } };
  }
  if (host === "calendar.google.com") {
    const cid = url.searchParams.get("cid") ?? "";
    if (cid.includes("/ics/")) return { name: "ics_subscribe_click", params: { method: "google", locale } };
    return null;
  }
  if ((url.protocol === "https:" || url.protocol === "http:") && host === site) {
    if (isIcsPath(url.pathname)) return { name: "ics_subscribe_click", params: { method: "download", locale } };
    // Our own page, from an onward-links box: the box's placement and the target path only.
    const related = RELATED_LINK_CONTEXTS.find((c) => c === click.placement);
    return related ? { name: "related_content_click", params: { link_context: related, link_url: safePath(url.pathname), locale } } : null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  if (sameChannel(url, click.channelUrl)) {
    return { name: "whatsapp_channel_click", params: { link_context: channelContext(click.placement), locale } };
  }

  const official = officialDomain(host);
  if (click.inSources || official) {
    const link_context: OfficialLinkContext = click.inSources ? "sources" : click.inCalculator ? "calculator" : "content";
    return { name: "outbound_official_source_click", params: { link_domain: host, link_context, locale } };
  }
  return null;
}
