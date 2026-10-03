import "server-only";

import type { Block } from "@/lib/content/blocks";
import { IMAGES } from "@/lib/content/images";
import {
  publishArticle,
  upsertImages,
  type ArticleSpec,
  type ImageSpec,
  type PublishResult,
} from "@/lib/content/publish-article";
import { LOCALES, type Locale } from "@/lib/i18n/config";

import { PARKING, TRANSPORT, ZBE } from "./barcelona-practical";
import { CERDANYA, GIRONA, MONTSERRAT_FREE } from "./day-trips";
import { RIPOLLES, SETCASES, SNOW } from "./pyrenees";
import type { B2Article } from "./shared";

/**
 * Publisher for editorial batch 02.
 *
 * Same shape as `features/publish.ts`: one spec per article, images resolved
 * first because block bodies reference media by row id, and the in-article
 * image dropped a third of the way down where it gives the reader a break
 * without competing with the lead.
 *
 * Published in the order the editorial package specified, which is also the
 * order the internal links point in: the Barcelona Practical cluster first, so
 * the day trips and the Pyrenees pages have somewhere to link back to.
 */

const IMAGE_BY_KEY = new Map(IMAGES.map((image) => [image.key, image]));

export const BATCH_02: B2Article[] = [
  TRANSPORT,
  ZBE,
  GIRONA,
  MONTSERRAT_FREE,
  RIPOLLES,
  SETCASES,
  CERDANYA,
  PARKING,
  SNOW,
];

function imagesFor(article: B2Article): ImageSpec[] {
  const specs: ImageSpec[] = [];

  const add = (
    key: string | undefined,
    alt: Record<Locale, string> | undefined,
    caption: Record<Locale, string> | undefined,
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
      // Attribution travels from the download sidecar through the manifest, so
      // for a CC BY-SA photograph it cannot get separated from the file.
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

export async function publishB2Article(article: B2Article): Promise<PublishResult> {
  const images = imagesFor(article);
  const mediaIds = images.length > 0 ? await upsertImages(images) : new Map<string, string>();
  // The template already renders the hero in the article header. Putting the
  // same file in the body as well is what made every page in this batch show
  // one photograph twice, so the body gets the second image or nothing.
  const inlineMediaId = article.secondaryKey ? mediaIds.get(article.secondaryKey) : undefined;

  const spec: ArticleSpec = {
    entryKey: article.entryKey,
    type: "guide",
    categoryKey: article.categoryKey,
    isFeatured: false,
    heroKey: images.length > 0 ? article.heroKey : undefined,
    images,
    sources: article.sources.map((source) => ({
      name: source.name,
      url: source.url,
      publisher: source.publisher ?? null,
      type: "official" as const,
    })),
    publishedAt: new Date(article.publishedAt),
    lastVerifiedAt: new Date(`${article.verifiedAt}T12:00:00+02:00`),
    editions: LOCALES.map((locale) => {
      const edition = article.editions[locale];
      const body: Block[] = [...edition.blocks];

      if (inlineMediaId) {
        body.splice(Math.min(6, body.length), 0, {
          type: "image",
          mediaId: inlineMediaId,
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
export async function publishBatch02(from = 0, to = BATCH_02.length): Promise<PublishResult[]> {
  const results: PublishResult[] = [];
  for (const article of BATCH_02.slice(from, to)) {
    results.push(await publishB2Article(article));
  }
  return results;
}
