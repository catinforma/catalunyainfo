import { SITE, absoluteUrl } from "@/lib/site";
import { HTML_LANG, type Locale } from "@/lib/i18n/config";
import { sectionPath } from "@/lib/i18n/routes";
import type { Block } from "@/lib/content/blocks";
import type { EntryDetail } from "@/lib/content/types";

/**
 * Structured data.
 *
 * Everything here is derived from data we actually hold. We never emit a
 * property we cannot back with a real value, and we never emit Article markup
 * for a page that is not an article. Fabricated structured data is a manual
 * action risk, not a ranking trick.
 */

type Json = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE.productionOrigin}/#organization`;
export const WEBSITE_ID = `${SITE.productionOrigin}/#website`;

export function organizationSchema(): Json {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    alternateName: BRAND_ALTERNATE_NAMES,
    url: `${SITE.productionOrigin}/`,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.productionOrigin}/logo.png`,
      width: 512,
      height: 512,
    },
    ...(SITE.contactEmail ? { email: SITE.contactEmail } : {}),
  };
}

/**
 * "catalunya info" (two words) is how people search for the site, and the
 * brand ranked only 6.6 for it: nothing told Google the two spellings are the
 * same entity. No SearchAction: Google retired the sitelinks search box, and
 * the target was a URL robots.txt blocks.
 */
const BRAND_ALTERNATE_NAMES = ["Catalunya Info", "catalunyainfo.com"];

export function websiteSchema(locale: Locale): Json {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE.productionOrigin}/`,
    name: SITE.name,
    alternateName: BRAND_ALTERNATE_NAMES,
    inLanguage: HTML_LANG[locale],
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function breadcrumbSchema(items: { label: string; href: string }[]): Json | null {
  if (items.length === 0) return null;
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

function imageObject(entry: EntryDetail): Json | undefined {
  const hero = entry.og ?? entry.hero;
  if (!hero) return undefined;
  return {
    "@type": "ImageObject",
    url: hero.url.startsWith("http") ? hero.url : absoluteUrl(hero.url),
    ...(hero.width ? { width: hero.width } : {}),
    ...(hero.height ? { height: hero.height } : {}),
    ...(hero.credit ? { creditText: hero.credit } : {}),
  };
}

function citations(entry: EntryDetail): Json[] | undefined {
  const withUrls = entry.sources.filter((s) => s.url);
  if (withUrls.length === 0) return undefined;
  return withUrls.map((s) => ({
    "@type": "CreativeWork",
    name: s.name,
    url: s.url,
    ...(s.publisher ? { publisher: { "@type": "Organization", name: s.publisher } } : {}),
  }));
}

function authorNode(entry: EntryDetail): Json | undefined {
  if (!entry.author) return undefined;
  return {
    "@type": "Person",
    name: entry.author.name,
    url: absoluteUrl(`${sectionPath("authors", entry.locale)}${entry.author.slug}/`),
    ...(entry.author.jobTitle ? { jobTitle: entry.author.jobTitle } : {}),
  };
}

function publisherNode(): Json {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    url: SITE.productionOrigin,
    logo: { "@type": "ImageObject", url: `${SITE.productionOrigin}/logo.png`, width: 512, height: 512 },
  };
}

/** NewsArticle for `news`, Article for guides and long-form. */
export function articleSchema(entry: EntryDetail): Json {
  const isNews = entry.type === "news";
  return {
    "@type": isNews ? "NewsArticle" : "Article",
    "@id": `${absoluteUrl(entry.href)}#article`,
    headline: entry.title,
    ...(entry.excerpt ? { description: entry.excerpt } : {}),
    inLanguage: HTML_LANG[entry.locale],
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(entry.href) },
    ...(entry.publishedAt ? { datePublished: entry.publishedAt.toISOString() } : {}),
    dateModified: entry.updatedAt.toISOString(),
    // Inline rather than a bare @id: the Organization lives in another
    // script block, and a reference that does not resolve leaves Article
    // without a publisher for parsers that read one graph at a time.
    publisher: publisherNode(),
    // No named author is published yet; Google accepts an Organization
    // author, which beats none (165 articles had no author at all).
    author: authorNode(entry) ?? publisherNode(),
    ...(imageObject(entry) ? { image: imageObject(entry) } : {}),
    ...(citations(entry) ? { citation: citations(entry) } : {}),
    ...(entry.tags.length > 0 ? { keywords: entry.tags.map((t) => t.name).join(", ") } : {}),
  };
}

export function placeSchema(entry: EntryDetail): Json | null {
  if (!entry.place) return null;
  const p = entry.place;
  return {
    "@type": p.kind === "museum" ? "Museum" : p.kind === "beach" ? "Beach" : "TouristAttraction",
    "@id": `${absoluteUrl(entry.href)}#place`,
    name: entry.title,
    ...(entry.excerpt ? { description: entry.excerpt } : {}),
    ...(p.latitude !== null && p.longitude !== null
      ? { geo: { "@type": "GeoCoordinates", latitude: p.latitude, longitude: p.longitude } }
      : {}),
    ...(p.streetAddress || p.municipality
      ? {
          address: {
            "@type": "PostalAddress",
            ...(p.streetAddress ? { streetAddress: p.streetAddress } : {}),
            ...(p.municipality ? { addressLocality: p.municipality } : {}),
            ...(p.postalCode ? { postalCode: p.postalCode } : {}),
            addressRegion: "Catalunya",
            addressCountry: "ES",
          },
        }
      : {}),
    ...(p.officialUrl ? { sameAs: p.officialUrl } : {}),
    ...(p.openingHours.length > 0 ? { openingHoursSpecification: p.openingHours } : {}),
    ...(imageObject(entry) ? { image: imageObject(entry) } : {}),
  };
}

export function eventSchema(entry: EntryDetail): Json | null {
  if (!entry.event) return null;
  const e = entry.event;
  return {
    "@type": "Event",
    "@id": `${absoluteUrl(entry.href)}#event`,
    name: entry.title,
    ...(entry.excerpt ? { description: entry.excerpt } : {}),
    startDate: e.startsAt.toISOString(),
    ...(e.endsAt ? { endDate: e.endsAt.toISOString() } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(e.venueName
      ? {
          location: {
            "@type": "Place",
            name: e.venueName,
            address: {
              "@type": "PostalAddress",
              addressRegion: "Catalunya",
              addressCountry: "ES",
            },
          },
        }
      : {}),
    ...(e.organiser ? { organizer: { "@type": "Organization", name: e.organiser } } : {}),
    ...(e.ticketUrl || e.isFree
      ? {
          offers: {
            "@type": "Offer",
            ...(e.ticketUrl ? { url: e.ticketUrl } : {}),
            ...(e.isFree ? { price: 0, priceCurrency: "EUR" } : {}),
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    ...(imageObject(entry) ? { image: imageObject(entry) } : {}),
  };
}

/** Emitted only when the body actually contains a FAQ block. */
export function faqSchema(body: Block[]): Json | null {
  const faq = body.find((b) => b.type === "faq");
  if (!faq || faq.type !== "faq") return null;
  return {
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: stripInline(item.answer) },
    })),
  };
}

/** Emitted only when the body actually contains a steps block. */
export function howToSchema(entry: EntryDetail): Json | null {
  const steps = entry.body.find((b) => b.type === "steps");
  if (!steps || steps.type !== "steps") return null;
  return {
    "@type": "HowTo",
    name: steps.title ?? entry.title,
    step: steps.items.map((item, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: item.title,
      ...(item.text ? { text: stripInline(item.text) } : {}),
    })),
  };
}

function stripInline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();
}

/** Wraps nodes in a single `@graph` document, dropping nulls. */
export function graph(nodes: (Json | null | undefined)[]): string {
  const filtered = nodes.filter((n): n is Json => Boolean(n));
  return JSON.stringify({ "@context": "https://schema.org", "@graph": filtered });
}
