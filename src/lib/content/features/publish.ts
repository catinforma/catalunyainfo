import "server-only";

import { LOCALES, type Locale } from "@/lib/i18n/config";
import {
  publishArticle,
  upsertImages,
  type ArticleSpec,
  type ImageSpec,
  type PublishResult,
} from "@/lib/content/publish-article";
import { IMAGE_BY_KEY } from "@/lib/content/images";
import { TRAINS } from "./trains";
import { GAUDI } from "./gaudi";
import { MEDIEVAL } from "./medieval";
import { SITGES } from "./sitges";
import { FOODFAIRS } from "./foodfairs";
import { CASTANYADA } from "./castanyada";
import { MONTSERRAT } from "./montserrat";
import { TRAPS } from "./traps";
import { SURPRISING } from "./surprising";
import { RAINY } from "./rainy";
import type { FeatureArticle } from "./shared";

/**
 * Publishes the ten feature guides, in three languages each.
 *
 * Images are attached only when the file is actually present in the manifest.
 * That is deliberate rather than defensive: the guides are complete, correct
 * and indexable without them, so a missing illustration must never be the
 * reason thirty URLs stay unpublished. Drop the files into `incoming/`, run
 * `npm run images:import`, and re-run this — the hero and the in-article image
 * appear with no other change.
 */

export const FEATURES: FeatureArticle[] = [
  TRAINS,
  GAUDI,
  MEDIEVAL,
  SITGES,
  FOODFAIRS,
  CASTANYADA,
  MONTSERRAT,
  TRAPS,
  SURPRISING,
  RAINY,
];

const PUBLISHED = new Date("2026-09-18T09:00:00+02:00");
const LAST_VERIFIED = new Date("2026-09-18T09:00:00+02:00");

/** Builds the image specs for whichever of an article's images exist. */
function imagesFor(article: FeatureArticle): ImageSpec[] {
  const specs: ImageSpec[] = [];

  const add = (
    key: string | undefined,
    alt: Partial<Record<Locale, string>> | undefined,
    caption: Partial<Record<Locale, string>> | undefined,
  ) => {
    if (!key) return;
    const file = IMAGE_BY_KEY.get(key);
    if (!file) return;
    specs.push({
      key,
      url: file.url,
      width: file.width,
      height: file.height,
      blurDataUrl: file.blurDataUrl,
      // Attribution comes from the manifest, which carries it from the
      // sidecar written at download time. For a CC BY-SA photograph this is a
      // condition of publishing it, so it is never retyped by hand.
      credit: file.credit ?? "CatalunyaInfo",
      creditUrl: file.creditUrl ?? null,
      license: file.license ?? null,
      alt: alt ?? {},
      caption: caption ?? {},
    });
  };

  add(article.heroKey, article.heroAlt, article.heroCaption);
  add(article.secondaryKey, article.secondaryAlt, article.secondaryCaption);
  return specs;
}

export async function publishFeature(article: FeatureArticle): Promise<PublishResult> {
  const images = imagesFor(article);
  const hasHero = article.heroKey ? IMAGE_BY_KEY.has(article.heroKey) : false;
  const secondaryId = images.length > 0 ? await upsertImages(images) : new Map<string, string>();

  const spec: ArticleSpec = {
    entryKey: article.entryKey,
    type: "article",
    categoryKey: article.categoryKey,
    isFeatured: false,
    heroKey: hasHero ? article.heroKey : undefined,
    images,
    sources: article.sources.map((source) => ({
      name: source.name,
      url: source.url,
      publisher: source.publisher ?? null,
      type: "official" as const,
    })),
    publishedAt: PUBLISHED,
    lastVerifiedAt: LAST_VERIFIED,
    editions: LOCALES.map((locale) => {
      const edition = article.editions[locale];
      const body = [...edition.blocks];

      // The in-article image goes a third of the way down, which is where the
      // reader needs a break and where it is not competing with the lead.
      const mediaId = article.secondaryKey ? secondaryId.get(article.secondaryKey) : undefined;
      if (mediaId) {
        body.splice(Math.min(6, body.length), 0, {
          type: "image",
          mediaId,
          size: "wide",
        });
      }

      return {
        locale,
        path: edition.path,
        title: edition.title,
        excerpt: edition.excerpt,
        seoTitle: edition.seoTitle,
        seoDescription: edition.seoDescription,
        body,
      };
    }),
  };

  return publishArticle(spec);
}

/**
 * @param from,to optional slice, so the caller can publish in batches that fit
 * inside a serverless function's time limit.
 */
export async function publishFeatures(from = 0, to = FEATURES.length): Promise<PublishResult[]> {
  const results: PublishResult[] = [];
  for (const article of FEATURES.slice(from, to)) {
    results.push(await publishFeature(article));
  }
  return results;
}
