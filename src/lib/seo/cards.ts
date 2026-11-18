import { createHash } from "node:crypto";

import { dayDate } from "@/lib/content/batch02/festive";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { hubMeta as electionsHubMeta } from "@/lib/programmatic/elections/pages";
import { GENERAL_ELECTION_DAY } from "@/lib/programmatic/elections/today";
import { hubMeta as gordoHubMeta } from "@/lib/programmatic/gordo/copy";
import { SNAPSHOT as GORDO_SNAPSHOT } from "@/lib/programmatic/gordo/data";
import { NADAL_DRAW_DATE } from "@/lib/content/batch02/loteria-nadal";

/**
 * Generated share cards (1200 x 675, 16:9) for the service-news pages that
 * have no photograph of their own.
 *
 * Google Discover asks for images "at least 1200 px wide", "16x9 aspect ratio",
 * and says: "Avoid using generic images (for example, your site logo) in the
 * schema.org markup or og:image meta tag" (Search Central, Discover, read
 * 18 Nov 2026). Those pages used the site-wide brand card. A card here carries
 * the page's own headline, its date and the brand, rendered by
 * app/card/[family]/[file]/route.tsx with ImageResponse as the default card
 * (app/social-card.png) already is. No photograph, no illustration: text only.
 *
 * The card text comes from the very copy the page uses (its H1), so the two
 * cannot drift. The URL carries a hash of that text (`/card/<family>/<locale>-<hash>.png`):
 * when the headline changes (the Gordo hub on draw night) the URL changes, so
 * no cache serves yesterday's card, and the route serves only the hash it
 * computes itself, never text taken from the request.
 *
 * Add a family only for a page with a fixed headline per deploy; a page whose
 * title changes every day (the electricity price) would need a new card daily.
 */

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 675;

export interface CardContent {
  /** Small line above the headline: the topic. */
  kicker: string;
  /** The page's H1. */
  title: string;
  /** "Sorteo: martes 22 de diciembre de 2026": the date the page is about. */
  dateLine: string;
}

const LABELS = {
  gordo: {
    kicker: { ca: "Loteria de Nadal", es: "Lotería de Navidad", en: "Spanish Christmas Lottery" },
    date: { ca: "Sorteig", es: "Sorteo", en: "Draw" },
  },
  elections: {
    kicker: { ca: "Eleccions", es: "Elecciones", en: "Elections" },
    date: { ca: "Eleccions generals", es: "Elecciones generales", en: "General election" },
  },
} as const;

const FAMILIES = {
  /** /ca/on-ha-tocat-la-loteria-de-nadal/, /es/donde-ha-tocado-el-gordo/, /en/spanish-christmas-lottery-results/ */
  gordo: (locale: Locale): CardContent => ({
    kicker: LABELS.gordo.kicker[locale],
    title: gordoHubMeta(locale, GORDO_SNAPSHOT).h1,
    dateLine: `${LABELS.gordo.date[locale]}: ${dayDate(NADAL_DRAW_DATE, locale)}`,
  }),
  /** /ca/eleccions/, /es/elecciones/, /en/elections/ */
  elections: (locale: Locale): CardContent => ({
    kicker: LABELS.elections.kicker[locale],
    title: electionsHubMeta(locale).h1,
    dateLine: `${LABELS.elections.date[locale]}: ${dayDate(GENERAL_ELECTION_DAY, locale)}`,
  }),
} as const satisfies Record<string, (locale: Locale) => CardContent>;

export type CardFamily = keyof typeof FAMILIES;

export function isCardFamily(value: string): value is CardFamily {
  return Object.hasOwn(FAMILIES, value);
}

export function cardContent(family: CardFamily, locale: Locale): CardContent {
  return FAMILIES[family](locale);
}

/** First 10 hex characters of the SHA-256 of the card's text. */
export function cardHash(content: CardContent): string {
  return createHash("sha256").update(JSON.stringify([content.kicker, content.title, content.dateLine])).digest("hex").slice(0, 10);
}

/** Site-relative URL of the current card. */
export function cardPath(family: CardFamily, locale: Locale): string {
  return `/card/${family}/${locale}-${cardHash(cardContent(family, locale))}.png`;
}

/** The card as buildMetadata's `image`. */
export function cardImage(family: CardFamily, locale: Locale): { url: string; width: number; height: number; alt: string } {
  const content = cardContent(family, locale);
  return { url: cardPath(family, locale), width: CARD_WIDTH, height: CARD_HEIGHT, alt: content.title };
}

/** The card a request asks for, if `<locale>-<hash>.png` names the current one; else null (404). */
export function resolveCard(family: string, file: string): { locale: Locale; content: CardContent } | null {
  if (!isCardFamily(family)) return null;
  const match = /^([a-z]{2})-([0-9a-f]{10})\.png$/.exec(file);
  const locale = match?.[1];
  if (!match || !locale || !isLocale(locale)) return null;
  const content = cardContent(family, locale);
  return cardHash(content) === match[2] ? { locale, content } : null;
}

/** Every current card, for generateStaticParams and the tests. */
export function allCards(): { family: CardFamily; locale: Locale; file: string }[] {
  return (Object.keys(FAMILIES) as CardFamily[]).flatMap((family) =>
    LOCALES.map((locale) => ({ family, locale, file: `${locale}-${cardHash(cardContent(family, locale))}.png` })),
  );
}
