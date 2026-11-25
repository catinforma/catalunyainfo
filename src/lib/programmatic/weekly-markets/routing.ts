import { marketTownBySlug, TOWNS } from "./data";
import { weeklyMarketsPaths } from "./sitemap";
import type { MarketTown, MkLocale } from "./types";

/**
 * Which request each route of the family answers. Every route folder serves
 * one locale (`mercats-setmanals` = ca, `mercados-semanales` = es,
 * `weekly-markets` = en): any other `[locale]` value, or a slug that is not
 * a town of the data file, resolves to null and the page calls `notFound()`.
 */

export function marketsHubAllowed(route: MkLocale, locale: string): boolean {
  return route === locale;
}

export function resolveMarketTown(route: MkLocale, locale: string, slug: string): MarketTown | null {
  if (route !== locale) return null;
  return marketTownBySlug(slug);
}

export function marketsTownStaticParams<K extends string>(route: MkLocale, key: K): ({ locale: MkLocale } & Record<K, string>)[] {
  return TOWNS.map((t) => ({ locale: route, [key]: t.slug }) as { locale: MkLocale } & Record<K, string>);
}

export function marketsHubStaticParams(route: MkLocale): { locale: MkLocale }[] {
  return [{ locale: route }];
}

/**
 * Paths for `revalidatePath`, every night: the next session is computed on
 * the server in Europe/Madrid, so the six town pages and the three hubs are
 * rebuilt after midnight (the cron runs at 23:05 UTC, 00:05 in winter, 01:05
 * in summer). The pages also revalidate hourly on their own (ISR), which
 * covers the end of a session and the hour before the cron in summer.
 */
export function weeklyMarketsRefreshPaths(): string[] {
  return weeklyMarketsPaths().map((entry) => entry.path.replace(/\/$/, ""));
}
