import { hasByline } from "@/lib/content/author";
import { OWNER } from "@/lib/content/pages/institutional";
import type { EntrySummary } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/config";
import { HTML_LANG } from "@/lib/i18n/config";
import { cropsForUrl } from "@/lib/seo/discover-images";
import { absoluteUrl } from "@/lib/site";

/**
 * RSS 2.0 feeds (one per language) and the Google News sitemap.
 *
 * Pure builders: the routes (app/(public)/[locale]/feed.xml, app/news-sitemap.xml)
 * read the database and hand the rows over, so the XML can be tested without
 * one. Every date is the entry's own (publication, last verification); nothing
 * here stamps "now" on an item. Paths: lib/seo/feed-paths.ts.
 */

/** Items per feed: enough for a reader returning after a week of updates. */
export const FEED_SIZE = 50;

/** Google News sitemaps may list only articles from the last two days. */
export const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;

/** At most 1,000 `<news:news>` entries per news sitemap. */
export const NEWS_SITEMAP_MAX = 1000;

/** Escapes text for XML and drops the control characters XML 1.0 forbids. */
export function xmlEscape(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 date, as RSS 2.0 requires (`Thu, 05 Nov 2026 11:00:00 GMT`). */
export function rfc822(date: Date): string {
  return date.toUTCString();
}

export interface FeedImage {
  /** Absolute URL. */
  url: string;
  width: number;
  height: number;
  type: string;
  credit?: string | null;
}

export interface FeedItem {
  title: string;
  /** Absolute URL of the page. */
  url: string;
  description?: string | null;
  publishedAt: Date;
  /** Last verification or change; never before publishedAt. */
  updatedAt: Date;
  author?: string | null;
  category?: string | null;
  image?: FeedImage | null;
}

export interface RssInput {
  locale: Locale;
  siteName: string;
  /** Absolute URL of the language's home page. */
  homeUrl: string;
  /** Absolute URL of the feed itself (atom:link rel="self"). */
  selfUrl: string;
  description: string;
  items: FeedItem[];
}

/** The 16:9 crop of a licensed photograph (as in the Article markup), else the hero as it is. */
function feedImage(entry: EntrySummary): FeedImage | null {
  const hero = entry.hero;
  if (!hero) return null;
  const wide = cropsForUrl(hero.url).find((crop) => crop.ratio === "16x9");
  if (wide) return { url: absoluteUrl(wide.url), width: wide.width, height: wide.height, type: "image/jpeg", credit: hero.credit };
  if (!hero.width || !hero.height) return null;
  const type = /\.webp$/i.test(hero.url) ? "image/webp" : /\.png$/i.test(hero.url) ? "image/png" : "image/jpeg";
  return {
    url: hero.url.startsWith("http") ? hero.url : absoluteUrl(hero.url),
    width: hero.width,
    height: hero.height,
    type,
    credit: hero.credit,
  };
}

/** A database summary as a feed item: its own dates, its byline (lib/content/author.ts). */
export function feedItem(entry: EntrySummary): FeedItem {
  const published = entry.publishedAt ?? entry.updatedAt;
  return {
    title: entry.title,
    url: absoluteUrl(entry.href),
    description: entry.excerpt,
    publishedAt: published,
    updatedAt: entry.updatedAt < published ? published : entry.updatedAt,
    author: entry.authorName ?? (hasByline(entry.type) ? OWNER.name : null),
    category: entry.category?.name ?? null,
    image: feedImage(entry),
  };
}

/** Items newest-modified first; ties by publication date. */
export function byModified(items: FeedItem[]): FeedItem[] {
  return [...items].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime() || b.publishedAt.getTime() - a.publishedAt.getTime(),
  );
}

/**
 * RSS 2.0, ordered by dateModified. `pubDate` is the publication date (what
 * RSS defines it as), `atom:updated` the last verification. The channel's
 * `lastBuildDate` is the newest item's modification, not the time the file was
 * rendered, so an unchanged feed does not look new.
 */
export function buildRss(input: RssInput): string {
  const items = byModified(input.items).slice(0, FEED_SIZE);
  const newest = items[0]?.updatedAt;
  const out: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">',
    "<channel>",
    `<title>${xmlEscape(input.siteName)}</title>`,
    `<link>${xmlEscape(input.homeUrl)}</link>`,
    `<description>${xmlEscape(input.description)}</description>`,
    `<language>${HTML_LANG[input.locale]}</language>`,
    `<atom:link href="${xmlEscape(input.selfUrl)}" rel="self" type="application/rss+xml"/>`,
    ...(newest ? [`<lastBuildDate>${rfc822(newest)}</lastBuildDate>`] : []),
    "<ttl>60</ttl>",
  ];
  for (const item of items) {
    out.push(
      "<item>",
      `<title>${xmlEscape(item.title)}</title>`,
      `<link>${xmlEscape(item.url)}</link>`,
      `<guid isPermaLink="true">${xmlEscape(item.url)}</guid>`,
      ...(item.description ? [`<description>${xmlEscape(item.description)}</description>`] : []),
      `<pubDate>${rfc822(item.publishedAt)}</pubDate>`,
      `<atom:updated>${item.updatedAt.toISOString()}</atom:updated>`,
      ...(item.author ? [`<dc:creator>${xmlEscape(item.author)}</dc:creator>`] : []),
      ...(item.category ? [`<category>${xmlEscape(item.category)}</category>`] : []),
      ...(item.image
        ? [
            `<media:content url="${xmlEscape(item.image.url)}" medium="image" type="${xmlEscape(item.image.type)}" width="${item.image.width}" height="${item.image.height}">`,
            ...(item.image.credit ? [`<media:credit>${xmlEscape(item.image.credit)}</media:credit>`] : []),
            "</media:content>",
          ]
        : []),
      "</item>",
    );
  }
  out.push("</channel>", "</rss>");
  return `${out.join("\n")}\n`;
}

export interface NewsSitemapItem {
  /** Absolute URL of the page. */
  url: string;
  locale: Locale;
  title: string;
  publishedAt: Date;
  updatedAt: Date;
}

/** The pieces a news sitemap may list now: published or modified in the last 48 hours. */
export function inNewsWindow<T extends { publishedAt: Date; updatedAt: Date }>(items: T[], now: Date): T[] {
  const since = now.getTime() - NEWS_WINDOW_MS;
  return items.filter((item) => {
    const latest = Math.max(item.publishedAt.getTime(), item.updatedAt.getTime());
    return latest >= since && item.publishedAt.getTime() <= now.getTime();
  });
}

/**
 * Google News sitemap: one `<url>` per piece published or modified in the
 * last 48 hours, newest first, at most 1,000. `news:publication_date` is the
 * real publication date; `news:name` the site's name as Google News shows it.
 */
export function buildNewsSitemap(siteName: string, items: NewsSitemapItem[], now: Date): string {
  const listed = inNewsWindow(items, now)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, NEWS_SITEMAP_MAX);
  const out: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
  ];
  for (const item of listed) {
    out.push(
      "<url>",
      `<loc>${xmlEscape(item.url)}</loc>`,
      `<lastmod>${item.updatedAt.toISOString()}</lastmod>`,
      "<news:news>",
      "<news:publication>",
      `<news:name>${xmlEscape(siteName)}</news:name>`,
      `<news:language>${HTML_LANG[item.locale]}</news:language>`,
      "</news:publication>",
      `<news:publication_date>${item.publishedAt.toISOString()}</news:publication_date>`,
      `<news:title>${xmlEscape(item.title)}</news:title>`,
      "</news:news>",
      "</url>",
    );
  }
  out.push("</urlset>");
  return `${out.join("\n")}\n`;
}
