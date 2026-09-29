import "server-only";

import type { Block } from "@/lib/content/blocks";
import { IMAGES } from "@/lib/content/images";
import {
  publishArticle,
  type ArticleSpec,
  type ImageSpec,
  type PublishResult,
} from "@/lib/content/publish-article";
import { COPY as MASTER_COPY } from "@/lib/content/mushrooms/payload";
import type { Locale } from "@/lib/i18n/config";
import { LOCALES } from "@/lib/i18n/config";

import { assertZoneSafe } from "./guard";
import { MUSHROOM_ZONES } from "./registry";
import type { MushroomZone, ZoneEdition } from "./types";

/**
 * Publisher for local mushroom-condition pages.
 *
 * Every zone goes through `assertZoneSafe` first, and the guard throws rather
 * than warning. A page that promises the reader they will find something, or
 * that carries a coordinate, does not get published in a degraded form — the
 * whole publish fails and the package comes back for a rewrite. That is the
 * point: the check is worth having only if it can stop the thing it checks.
 *
 * With an empty registry this publishes nothing and returns an empty array, so
 * it is safe to wire into the publish route before any zone exists.
 */

const IMAGE_BY_KEY = new Map(IMAGES.map((image) => [image.key, image]));

/** The master report's path per locale, used to verify the required back link. */
export function masterPaths(): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {};
  for (const locale of LOCALES) out[locale] = MASTER_COPY[locale].path;
  return out;
}

function imagesFor(zone: MushroomZone): ImageSpec[] {
  if (!zone.heroKey) return [];
  const file = IMAGE_BY_KEY.get(zone.heroKey);
  if (!file) return [];
  return [
    {
      key: zone.heroKey,
      url: file.url,
      width: file.width,
      height: file.height,
      blurDataUrl: file.blurDataUrl,
      credit: file.credit ?? "CatalunyaInfo",
      creditUrl: file.creditUrl ?? null,
      license: file.license ?? null,
      alt: zone.heroAlt ?? {},
      caption: zone.heroCaption ?? {},
    },
  ];
}

export function buildZoneBody(zone: MushroomZone, edition: ZoneEdition): Block[] {
  const blocks: Block[] = [];

  edition.lead.forEach((text, index) => {
    blocks.push({ type: "paragraph", text, ...(index === 0 ? { lead: true } : {}) });
  });

  const section = (heading: string, paragraphs: string[]) => {
    if (paragraphs.length === 0) return;
    blocks.push({ type: "heading", level: 2, text: heading });
    for (const text of paragraphs) blocks.push({ type: "paragraph", text });
  };

  // Order matters: the situation is what the reader came for, the rules are
  // what they are least likely to look for and most likely to need.
  section(edition.situationHeading, edition.situation);
  section(edition.weatherHeading, edition.weather);
  section(edition.habitatHeading, edition.habitat);
  section(edition.rulesHeading, edition.rules);
  section(edition.safetyHeading, edition.safety);
  section(edition.territoryHeading, edition.territory);

  if (edition.faq && edition.faq.length > 0) {
    blocks.push({ type: "faq", items: edition.faq });
  }

  // The link back to the Catalonia-wide report is required by the guard, so
  // this is always a real link, and the cluster always has a centre.
  blocks.push({ type: "paragraph", text: edition.masterLinkLine });

  return blocks;
}

export async function publishMushroomZone(zone: MushroomZone): Promise<PublishResult> {
  assertZoneSafe(zone, masterPaths());

  const images = imagesFor(zone);
  const editions = LOCALES.flatMap((locale) => {
    const edition = zone.editions[locale];
    if (!edition) return [];
    return [
      {
        locale,
        path: edition.path,
        title: edition.title,
        excerpt: edition.excerpt,
        seoTitle: edition.seoTitle,
        seoDescription: edition.seoDescription,
        body: buildZoneBody(zone, edition),
      },
    ];
  });

  const spec: ArticleSpec = {
    entryKey: zone.entryKey,
    type: "guide",
    categoryKey: zone.categoryKey,
    isFeatured: false,
    heroKey: images.length > 0 ? zone.heroKey : undefined,
    images,
    sources: zone.sources.map((source) => ({
      name: source.name,
      url: source.url,
      publisher: source.publisher ?? null,
      type: "official" as const,
    })),
    publishedAt: new Date(zone.publishedAt),
    lastVerifiedAt: new Date(`${zone.verifiedAt}T12:00:00+02:00`),
    editions,
  };

  return publishArticle(spec);
}

/** Publishes every registered zone. Returns `[]` while the registry is empty. */
export async function publishMushroomZones(): Promise<PublishResult[]> {
  const results: PublishResult[] = [];
  for (const zone of MUSHROOM_ZONES) results.push(await publishMushroomZone(zone));
  return results;
}
