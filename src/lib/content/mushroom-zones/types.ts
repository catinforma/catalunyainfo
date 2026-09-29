import type { Locale } from "@/lib/i18n/config";

/**
 * Local mushroom-condition pages.
 *
 * ## Why these exist
 *
 * Search Console shows `bolets vall d'en bas` at position 30 and `bergueda`,
 * `setcases`, `ripolles` and `riu de cerdanya` all appearing against the
 * mushroom report. The report is a Catalonia-wide page, so it surfaces for
 * those queries and satisfies none of them. That is measured demand with no
 * page behind it.
 *
 * ## Why they are not clones of the master
 *
 * The master answers *"what are conditions like in Catalonia this week"*. A
 * zone page answers *"what is the situation in this specific place, and what
 * do I need to know before going there"* — the local weather record, the
 * habitat, the rules that apply in that municipality, the safety notes. If a
 * zone page ends up being the master with a place name substituted in, it
 * will cannibalise the page that currently earns 45% of the site's clicks,
 * and it should not be published.
 *
 * ## What a zone page may never contain
 *
 * Enforced in `guard.ts` at publish time, not left to an editor's judgement:
 *
 *  - **No coordinates, and no directions to a spot.** Not a decimal pair, not
 *    a degrees-minutes string, not "the third track past the bridge".
 *  - **No claim that mushrooms are present.** Rain is measurable; fruiting is
 *    inferred. The page may say conditions are favourable and may not say you
 *    will find anything.
 *  - **No guarantees, no "secret spots".**
 *  - **A link to the master** in every edition, so the cluster has a centre.
 *  - **Sources and a verification date**, because a conditions page without
 *    them is an opinion with a date stamp.
 *
 * ## Rollout
 *
 * One pilot — Vall d'en Bas — measured for 14 to 28 days before any second
 * zone exists. Ripollès, Cerdanya, Alt Urgell and the rest are not created
 * automatically, and the registry starts empty on purpose: this file is
 * architecture, not content, and nothing here publishes a URL until an
 * editorial package fills it.
 */

export interface ZoneFaq {
  question: string;
  answer: string;
}

export interface ZoneEdition {
  /** Path after the locale prefix, no leading or trailing slash. */
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;

  lead: string[];

  /** Where things stand now, stated as conditions rather than as presence. */
  situationHeading: string;
  situation: string[];

  /** The measured record: rainfall, temperature, days since rain. */
  weatherHeading: string;
  weather: string[];

  /** Forest type and altitude band, which is what makes a place different. */
  habitatHeading: string;
  habitat: string[];

  /** Permits, daily limits, closed areas, municipal rules. */
  rulesHeading: string;
  rules: string[];

  safetyHeading: string;
  safety: string[];

  /** Getting there, access, what the area is like. No picking directions. */
  territoryHeading: string;
  territory: string[];

  /** Inline markdown linking to the Catalonia-wide report. Required. */
  masterLinkLine: string;

  faq?: ZoneFaq[];
}

export interface ZoneSource {
  name: string;
  url: string;
  publisher?: string | null;
}

export interface MushroomZone {
  /** Stable key, also the registry key used for internal links. */
  key: string;
  entryKey: string;
  /** The place as it is written in prose: "Vall d'en Bas". */
  areaName: string;
  /** The comarca it sits in: "Garrotxa". */
  comarca: string;
  categoryKey: string;

  sources: ZoneSource[];
  /** ISO date the local data was last checked against the sources. */
  verifiedAt: string;
  /** ISO date-time. */
  publishedAt: string;

  heroKey?: string;
  heroAlt?: Record<Locale, string>;
  heroCaption?: Record<Locale, string>;

  /**
   * English only when the editorial package justifies it. A zone page in a
   * language nobody searches the place name in is a thin page by construction.
   */
  editions: Partial<Record<Locale, ZoneEdition>>;
}
