import { SITE, absoluteUrl } from "@/lib/site";
import { HTML_LANG, type Locale } from "@/lib/i18n/config";
import { sectionPath } from "@/lib/i18n/routes";
import type { Block } from "@/lib/content/blocks";
import type { AuthorView, EntryDetail } from "@/lib/content/types";
import { OWNER } from "@/lib/content/pages/institutional";
import {
  SITE_AUTHOR_PROFILES,
  SITE_AUTHOR_ROLE,
  SITE_AUTHOR_SLUG,
  SITE_AUTHOR_SUMMARY,
  bylineAuthor,
  isSiteAuthor,
  siteAuthorPath,
} from "@/lib/content/author";
import { cropsForUrl, licenceUrl, manifestImage } from "@/lib/seo/discover-images";
import { isNewsArticle } from "@/lib/seo/news-cycle";

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
/** One id for the founder wherever he appears: Organization, Article author, author page. */
export const SITE_AUTHOR_NODE_ID = `${SITE.productionOrigin}/#${SITE_AUTHOR_SLUG}`;

export function organizationSchema(locale: Locale = "ca"): Json {
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
    // The publication's own profiles only; none exists yet (site.ts).
    ...(SITE.sameAs.length > 0 ? { sameAs: [...SITE.sameAs] } : {}),
    founder: sitePersonNode(locale),
  };
}

/**
 * The founder as a Person: his author page on this site as `url`, the about
 * page's three links (portfolio, GitHub, LinkedIn) as `sameAs`.
 */
export function sitePersonNode(locale: Locale): Json {
  return {
    "@type": "Person",
    "@id": SITE_AUTHOR_NODE_ID,
    name: OWNER.name,
    url: absoluteUrl(siteAuthorPath(locale)),
    jobTitle: SITE_AUTHOR_ROLE[locale],
    sameAs: [...SITE_AUTHOR_PROFILES],
  };
}

/** A piece's author: the founder's node, or a CMS author with their own page. */
export function personNode(author: AuthorView, locale: Locale): Json {
  if (isSiteAuthor(author)) return sitePersonNode(locale);
  const links = Object.values(author.links).filter(Boolean);
  return {
    "@type": "Person",
    name: author.name,
    url: absoluteUrl(`${sectionPath("authors", locale)}${author.slug}/`),
    ...(author.jobTitle ? { jobTitle: author.jobTitle } : {}),
    ...(links.length > 0 ? { sameAs: links } : {}),
  };
}

/**
 * The author page (`/ca/autors/marti-aguilera/`): Google's ProfilePage, whose
 * main entity is the same Person the articles name as author. No dates: the
 * page has no publication date of its own to state.
 */
export function siteAuthorProfileSchema(locale: Locale): Json {
  const url = absoluteUrl(siteAuthorPath(locale));
  return {
    "@type": "ProfilePage",
    "@id": `${url}#profile`,
    url,
    name: OWNER.name,
    inLanguage: HTML_LANG[locale],
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      ...sitePersonNode(locale),
      description: SITE_AUTHOR_SUMMARY[locale],
      worksFor: publisherNode(),
    },
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

/**
 * The Article's images. A licensed manifest photograph is declared as its
 * crops (16:9, 4:3, 1:1, each at least 1,200 px wide; discover-images.ts) with
 * its credit, licence deed and Commons page; anything else (an AI
 * illustration, a CMS upload) keeps the one ImageObject it had.
 */
export function articleImage(entry: EntryDetail): Json | Json[] | undefined {
  const hero = entry.og ?? entry.hero;
  if (!hero) return undefined;
  const crops = cropsForUrl(hero.url);
  const source = manifestImage(hero.url);
  if (crops.length === 0 || !source) return imageObject(entry);
  const licence = licenceUrl(source.license);
  return crops.map((crop) => ({
    "@type": "ImageObject",
    url: absoluteUrl(crop.url),
    width: crop.width,
    height: crop.height,
    ...(source.credit ? { creditText: source.credit } : {}),
    ...(licence ? { license: licence } : {}),
    ...(source.creditUrl ? { acquireLicensePage: source.creditUrl } : {}),
  }));
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

/**
 * NewsArticle for `news` entries and the guides that report a dated event
 * (news-cycle.ts), Article for every other guide and long-form piece.
 *
 * Dates are the ones the page shows: datePublished is the publication date,
 * dateModified the date its facts were last verified or changed (the
 * publisher stamps `updated_at` from each spec's as-of date, never the time of
 * a re-send), and never earlier than the publication date.
 */
export function articleSchema(entry: EntryDetail): Json {
  const author = bylineAuthor(entry);
  const image = articleImage(entry);
  const modified =
    entry.publishedAt && entry.updatedAt.getTime() < entry.publishedAt.getTime() ? entry.publishedAt : entry.updatedAt;
  return {
    "@type": isNewsArticle(entry) ? "NewsArticle" : "Article",
    "@id": `${absoluteUrl(entry.href)}#article`,
    headline: entry.title,
    ...(entry.excerpt ? { description: entry.excerpt } : {}),
    inLanguage: HTML_LANG[entry.locale],
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(entry.href) },
    ...(entry.publishedAt ? { datePublished: entry.publishedAt.toISOString() } : {}),
    dateModified: modified.toISOString(),
    // Inline rather than a bare @id: the Organization lives in another
    // script block, and a reference that does not resolve leaves Article
    // without a publisher for parsers that read one graph at a time.
    publisher: publisherNode(),
    // The byline the page shows (lib/content/author.ts). Only a piece with
    // no byline at all falls back to the Organization.
    author: author ? personNode(author, entry.locale) : publisherNode(),
    ...(image ? { image } : {}),
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

/* -------------------------------------------------------------------------- */
/* Dataset (live open-data pages)                                             */
/* -------------------------------------------------------------------------- */

/**
 * The Generalitat's open-data licence ("Llicència oberta d'ús d'informació -
 * Catalunya"). It is the `attributionLink` the transparency portal returns
 * for every dataset these pages read (b4eh-r8up, gn9e-3qhr, ntc4-rnwr,
 * irrv-2mfc, tgns-3xuy; checked 30 Oct 2026 through /api/views/<id>.json).
 */
export const GENCAT_OPEN_DATA_LICENCE =
  "https://administraciodigital.gencat.cat/ca/dades/dades-obertes/informacio-practica/llicencies/";

/** Google ignores a Dataset whose description is shorter than this. */
export const DATASET_DESCRIPTION_MIN = 50;

export interface DatasetInput {
  /** Site-relative path of the page the dataset is shown on. */
  path: string;
  /** The page's own title or H1: what a reader sees the table called. */
  name: string;
  /** The page's meta description (50 to 5,000 characters). */
  description: string;
  locale: Locale;
  /** The public body that produces the data, as it signs its datasets. */
  creator: string;
  /** Licence URL, as the publisher states it. */
  license: string;
  /** Official dataset (or gazette) URLs the page's figures come from. */
  isBasedOn: string[];
  /** "Girona", "Província de Lleida", "Catalunya". */
  spatialCoverage: string;
  /** ISO 8601 date or interval ("2026", "2023-05-28/2024-05-12"). */
  temporalCoverage?: string;
  /** ISO date the figures on the page were last read from the source. */
  dateModified?: string;
}

/**
 * Dataset markup for a page whose main content is a table of official open
 * data (Google Dataset Search). The creator and licence are the publisher's,
 * never ours: the page re-presents their data, filtered by place. Returns
 * null when the description is too short to qualify, rather than padding it.
 */
export function datasetSchema(input: DatasetInput): Json | null {
  const description = input.description.replace(/\s+/g, " ").trim();
  if (description.length < DATASET_DESCRIPTION_MIN || input.isBasedOn.length === 0) return null;
  const url = absoluteUrl(input.path);
  return {
    "@type": "Dataset",
    "@id": `${url}#dataset`,
    name: input.name,
    description,
    url,
    inLanguage: HTML_LANG[input.locale],
    isAccessibleForFree: true,
    creator: { "@type": "Organization", name: input.creator },
    license: input.license,
    isBasedOn: input.isBasedOn.length === 1 ? input.isBasedOn[0] : input.isBasedOn,
    spatialCoverage: { "@type": "Place", name: input.spatialCoverage },
    ...(input.temporalCoverage ? { temporalCoverage: input.temporalCoverage } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/* Event (official fairs calendar)                                            */
/* -------------------------------------------------------------------------- */

export interface TownEventInput {
  /** Site-relative path of the page that lists the event. */
  path: string;
  /** Stable id in the official dataset, for the node's `@id`. */
  id: string;
  name: string;
  /** ISO dates, as the official calendar gives them. */
  startDate: string;
  endDate: string;
  /** Municipality where it is held: the most precise place the source gives. */
  town: string;
  /** Province name ("Girona"). */
  region: string;
  /** Organiser's own website, when the source lists one. */
  url?: string | null;
}

/**
 * An event from an official calendar that gives a name, dates and the
 * municipality. Google requires name, startDate and location with an
 * address; the address is the municipality, because that is all the source
 * says, and nothing (venue, organiser, price) is filled in beyond it.
 */
export function townEventSchema(input: TownEventInput): Json {
  return {
    "@type": "Event",
    "@id": `${absoluteUrl(input.path)}#event-${input.id}`,
    name: input.name,
    startDate: input.startDate,
    endDate: input.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: input.town,
      address: {
        "@type": "PostalAddress",
        addressLocality: input.town,
        addressRegion: input.region,
        addressCountry: "ES",
      },
    },
    ...(input.url ? { url: input.url } : {}),
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
