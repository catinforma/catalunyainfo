import type { Locale } from "@/lib/i18n/config";
import type { Body } from "./blocks";
import type { EntryStatus, EntryType } from "@/lib/db/schema";

export interface MediaView {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  alt: string;
  caption: string | null;
  credit: string | null;
  creditUrl: string | null;
  license: string | null;
  focalX: number;
  focalY: number;
}

export interface AuthorView {
  id: string;
  slug: string;
  name: string;
  jobTitle: string | null;
  bio: string | null;
  expertise: string | null;
  links: Record<string, string>;
  avatar: MediaView | null;
}

export interface CategoryView {
  id: string;
  key: string;
  section: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface TagView {
  id: string;
  key: string;
  name: string;
  slug: string;
}

export interface SourceView {
  id: string;
  name: string;
  publisher: string | null;
  url: string | null;
  type: string;
  note: string | null;
  accessedAt: Date | null;
}

export interface PlaceView {
  kind: string;
  latitude: number | null;
  longitude: number | null;
  comarca: string | null;
  municipality: string | null;
  postalCode: string | null;
  streetAddress: string | null;
  officialUrl: string | null;
  openingHours: unknown[];
  pricing: Record<string, unknown> | null;
  accessibility: Record<string, unknown> | null;
}

export interface EventView {
  startsAt: Date;
  endsAt: Date | null;
  isAllDay: boolean;
  recurrenceRule: string | null;
  venueName: string | null;
  ticketUrl: string | null;
  isFree: boolean;
  organiser: string | null;
}

export interface RouteView {
  distanceMetres: number | null;
  ascentMetres: number | null;
  descentMetres: number | null;
  durationMinutes: number | null;
  difficulty: number | null;
  isCircular: boolean;
  gpxUrl: string | null;
}

/** Shape used by cards, lists and related-content rails. */
export interface EntrySummary {
  entryId: string;
  translationId: string;
  type: EntryType;
  locale: Locale;
  title: string;
  /** Path after the locale prefix, no leading slash. */
  path: string;
  /** Full site-relative URL, e.g. `/ca/montserrat/com-arribar-hi/`. */
  href: string;
  excerpt: string | null;
  hero: MediaView | null;
  publishedAt: Date | null;
  updatedAt: Date;
  lastVerifiedAt: Date | null;
  readingMinutes: number;
  category: CategoryView | null;
  authorName: string | null;
  isFeatured: boolean;
}

export interface EntryDetail extends EntrySummary {
  status: EntryStatus;
  body: Body;
  noindex: boolean;
  canonicalUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  og: MediaView | null;
  author: AuthorView | null;
  tags: TagView[];
  categories: CategoryView[];
  sources: SourceView[];
  related: EntrySummary[];
  /** Published sibling translations, for hreflang and the language switcher. */
  translations: Partial<Record<Locale, string>>;
  place: PlaceView | null;
  event: EventView | null;
  route: RouteView | null;
  isDemo: boolean;
  breadcrumbs: { label: string; href: string }[];
}

export const SECTION_ENTRY_TYPES: Record<string, EntryType[]> = {
  news: ["news"],
  guides: ["article", "guide"],
  destinations: ["destination", "place"],
  events: ["event"],
  routes: ["route"],
};

/**
 * Categories a section also claims, on top of its entry types.
 *
 * Without this, every editorial piece is an `article` and therefore lands in
 * "Guides" and nowhere else - which is how a site ends up with one full hub and
 * four empty ones. A guide about medieval villages belongs under Destinations
 * as well, and a festival guide belongs under Events.
 *
 * `routes` is deliberately unmapped: a hiking-routes hub should stay empty
 * until there are actual routes, rather than being padded with articles that
 * are not routes.
 */
export const SECTION_CATEGORY_KEYS: Record<string, string[]> = {
  destinations: ["cities", "villages", "coast", "mountain"],
  events: ["festivals", "calendar"],
};
