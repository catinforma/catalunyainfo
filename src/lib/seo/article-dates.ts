import { SITE_TIMEZONE } from "@/lib/format";

/**
 * Publication and update dates of an article: one source for the JSON-LD
 * (datePublished / dateModified), the Open Graph article times and the dates
 * the page shows, so the three can never disagree.
 *
 * Google, "Add a byline date" (Search Central, read 18 Nov 2026): "Ensure that
 * the date (and optional time and timezone) match between the equivalent
 * user-visible and structured values", and "The date is required; the time is
 * not". Google News, "Best practices for your article pages": "articles need
 * to show both a clear, visible date and time", "Ideally, these should be
 * between the headline and the article text", and "it's against our
 * guidelines to artificially freshen a story when the publisher didn't add
 * significant information".
 *
 * Two rules follow:
 *
 *  - A time is stated only when it is real. The specs give verification
 *    dates as days ("2026-11-17"), which the publishers stored as noon; that
 *    noon is not when anything happened. Such an update is marked up and shown
 *    as a date alone ("2026-11-17"), never as "11:00".
 *  - The update date moves only when the page's verified content changes
 *    (`editionUpdatedAt`): a re-sent page, a day roll-over of "tomorrow" to
 *    "today" or a layout box leaves it where it was.
 */

/** `2026-11-18`: the calendar day of an instant on the site's clock (Europe/Madrid). */
export function madridDay(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export interface DatedEntry {
  publishedAt: Date | null;
  updatedAt: Date;
  lastVerifiedAt: Date | null;
}

export interface ArticleDates {
  published: Date | null;
  /** Never before the publication. */
  modified: Date;
  /** False when the stored update instant is only a verification day (see above). */
  modifiedTimeKnown: boolean;
  /** ISO 8601, as the markup and `<time datetime>` carry them. */
  publishedIso: string | null;
  /** Full instant when the time is known, else the Madrid day (`2026-11-17`). */
  modifiedIso: string;
  /** The page has been updated since it was published, so it shows an update date. */
  showModified: boolean;
}

/**
 * The stored update is a verification day, not an instant, when it is exactly
 * the stored verification stamp (the noon the publishers write for a day) and
 * not the publication itself.
 */
export function modifiedTimeKnown(entry: DatedEntry): boolean {
  const updated = entry.updatedAt.getTime();
  if (entry.publishedAt && updated === entry.publishedAt.getTime()) return true;
  return !(entry.lastVerifiedAt && updated === entry.lastVerifiedAt.getTime());
}

export function articleDates(entry: DatedEntry): ArticleDates {
  const published = entry.publishedAt;
  const early = Boolean(published && entry.updatedAt.getTime() < published.getTime());
  const modified = early && published ? published : entry.updatedAt;
  const known = early ? true : modifiedTimeKnown(entry);
  return {
    published,
    modified,
    modifiedTimeKnown: known,
    publishedIso: published ? published.toISOString() : null,
    modifiedIso: known ? modified.toISOString() : madridDay(modified),
    // A day without a time on the publication day ("updated 17 Nov" under
    // "published 17 Nov, 13:00") says nothing, so it is not shown.
    showModified: Boolean(
      published && modified.getTime() > published.getTime() && (known || madridDay(modified) > madridDay(published)),
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* The publishers' rule                                                       */
/* -------------------------------------------------------------------------- */

/** JSON with object keys sorted, so a body read back from jsonb compares equal to the one written. */
export function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map((item) => (item === undefined ? "null" : stableJson(item))).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record)
    .filter((key) => record[key] !== undefined)
    .sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(",")}}`;
}

export interface EditionContent {
  title: string;
  excerpt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  body: unknown;
}

/** What a reader sees of an edition: if this is equal, the page did not change. */
export function editionFingerprint(content: EditionContent): string {
  return stableJson({
    title: content.title,
    excerpt: content.excerpt ?? null,
    seoTitle: content.seoTitle ?? null,
    seoDescription: content.seoDescription ?? null,
    body: content.body,
  });
}

export interface EditionUpdateInput {
  now: Date;
  /** The publication instant, already capped at now. */
  publishedAt: Date;
  /** The spec's verification day, as the publisher stores it (noon of that day). */
  verifiedAt: Date;
  /** `editionFingerprint` of the edition being written. */
  fingerprint: string;
  /** The row being overwritten, if any. */
  previous: { updatedAt: Date; fingerprint: string } | null;
}

/**
 * `updated_at` (dateModified) for an edition being written.
 *
 *  1. Identical page re-sent: unchanged.
 *  2. Changed, and its facts verified today: this publish is the change, so
 *     the real instant (`now`).
 *  3. Changed, verification older than today: the content moved without a new
 *     check (the strike pages' 00:05 switch of "mañana" to "hoy", a layout
 *     box), so the last real update stands, if it already covers that check.
 *  4. Otherwise (first publish, or a check from an earlier day not yet
 *     recorded): the publication, or the verification day when that is later.
 *
 * Never before the publication, never after now.
 */
export function editionUpdatedAt(input: EditionUpdateInput): Date {
  const { now, publishedAt, verifiedAt, fingerprint, previous } = input;
  const clamp = (date: Date) => new Date(Math.min(now.getTime(), Math.max(date.getTime(), publishedAt.getTime())));
  const verifiedDay = madridDay(verifiedAt);
  const fallback = verifiedDay > madridDay(publishedAt) ? verifiedAt : publishedAt;
  if (!previous) return clamp(fallback);
  if (previous.fingerprint === fingerprint) return clamp(previous.updatedAt);
  if (verifiedDay === madridDay(now)) return clamp(now);
  if (madridDay(previous.updatedAt) >= verifiedDay) return clamp(previous.updatedAt);
  return clamp(fallback);
}
