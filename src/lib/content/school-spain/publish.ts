import "server-only";

import { IMAGES } from "@/lib/content/images";
import { publishArticle, type ArticleSpec, type ImageSpec, type PublishResult, type SourceSpec } from "@/lib/content/publish-article";

import { LOCALES } from "@/lib/i18n/config";

import { BOE_2026, BOE_2027 } from "./holidays";
import { buildHubBody, buildRegionBody, hubExcerpt, hubSeoTitle, hubTitle, regionExcerpt, regionSeoTitle, regionTitle } from "./body";
import { localizeRegion } from "./i18n";
import { HUB_PATHS, SPAIN_REGIONS, hubRegions, regionPath } from "./regions";
import type { RegionCalendar } from "./types";

/**
 * "Calendario escolar 2026-2027" for every Spanish community with a
 * transcribed order, and the hub that compares them, each in Catalan, Spanish
 * and English: one entry with three editions, so every page lists the other
 * two as its hreflang alternates. The entry keys are those of the Spanish
 * pages first published on 6 November; the Catalan and English editions join
 * those entries as their translations.
 *
 * Publish group `calendario-escolar-espana` (api/admin/publish). Bodies are
 * built from `data.ts`; the live part (today, the next break, the title) is
 * the `spainSchoolCalendar` block, rendered from code, so a corrected date
 * needs a deploy and a republish.
 */

const PUBLISHED = new Date("2026-11-06T18:00:00+01:00");
const HERO_KEY = "calendario-escolar-espana-ceip-ayora";
const ENTRY_PREFIX = "guide-school-calendar-es-";
export const HUB_ENTRY_KEY = "guide-school-calendar-spain";

function hero(): ImageSpec {
  const file = IMAGES.find((image) => image.key === HERO_KEY);
  if (!file) throw new Error(`school-spain: image ${HERO_KEY} missing from the manifest`);
  return {
    key: HERO_KEY,
    url: file.url,
    width: file.width,
    height: file.height,
    blurDataUrl: file.blurDataUrl,
    credit: file.credit ?? "CatalunyaInfo",
    creditUrl: file.creditUrl ?? null,
    license: file.license ?? null,
    alt: {
      ca: "Façana de l'escola pública d'Infantil i Primària Isidro Girant, a Ayora, amb arbres al pati",
      es: "Fachada del colegio público de Infantil y Primaria Isidro Girant, en Ayora, con árboles en el patio",
      en: "Front of the Isidro Girant state infant and primary school in Ayora, with trees in the playground",
    },
    caption: {
      ca: "Escola pública d'Infantil i Primària Isidro Girant, a Ayora (València).",
      es: "Colegio público de Infantil y Primaria Isidro Girant, en Ayora (Valencia).",
      en: "Isidro Girant state infant and primary school, Ayora (Valencia).",
    },
  };
}

/** The order (and, per province, each resolution), the BOE holiday tables and the department page. */
function sourcesFor(region: RegionCalendar): SourceSpec[] {
  const out: SourceSpec[] = [
    { name: region.order.title.slice(0, 250), url: region.order.url, publisher: region.order.issuer, type: "official" },
    ...(region.provinces ?? []).map((p) => ({ name: p.order.title.slice(0, 250), url: p.order.url, publisher: p.order.issuer, type: "official" as const })),
  ];
  if (region.order.departmentUrl) {
    out.push({ name: `Calendario escolar ${region.short}`, url: region.order.departmentUrl, publisher: region.order.issuer, type: "official" });
  }
  out.push(
    { name: BOE_2026.name, url: BOE_2026.url, publisher: "Ministerio de Trabajo y Economía Social — BOE", type: "official" },
    { name: BOE_2027.name, url: BOE_2027.url, publisher: "Ministerio de Trabajo y Economía Social — BOE", type: "official" },
  );
  return out;
}

export function regionSpec(region: RegionCalendar): ArticleSpec {
  return {
    entryKey: `${ENTRY_PREFIX}${region.slug}`,
    type: "guide",
    categoryKey: "calendar",
    isFeatured: false,
    heroKey: HERO_KEY,
    images: [hero()],
    sources: sourcesFor(region),
    publishedAt: PUBLISHED,
    lastVerifiedAt: new Date(`${region.verifiedAt}T12:00:00+01:00`),
    editions: LOCALES.map((locale) => {
      const r = localizeRegion(region, locale);
      return {
        locale,
        path: regionPath(region.slug, locale),
        title: regionTitle(r),
        excerpt: regionExcerpt(r),
        seoTitle: regionSeoTitle(r),
        seoDescription: regionExcerpt(r).slice(0, 160),
        body: buildRegionBody(r),
      };
    }),
  };
}

export function hubSpec(): ArticleSpec {
  const regions = hubRegions();
  const verified = regions.map((r) => r.verifiedAt).sort().at(-1)!;
  return {
    entryKey: HUB_ENTRY_KEY,
    type: "guide",
    categoryKey: "calendar",
    isFeatured: false,
    heroKey: HERO_KEY,
    images: [hero()],
    sources: [
      ...regions.map((r) => ({ name: r.order.title.slice(0, 250), url: r.order.url, publisher: r.order.issuer, type: "official" as const })),
      { name: BOE_2026.name, url: BOE_2026.url, publisher: "Ministerio de Trabajo y Economía Social — BOE", type: "official" },
      { name: BOE_2027.name, url: BOE_2027.url, publisher: "Ministerio de Trabajo y Economía Social — BOE", type: "official" },
    ],
    publishedAt: PUBLISHED,
    lastVerifiedAt: new Date(`${verified}T12:00:00+01:00`),
    editions: LOCALES.map((locale) => ({
      locale,
      path: HUB_PATHS[locale],
      title: hubTitle(locale),
      excerpt: hubExcerpt(locale),
      seoTitle: hubSeoTitle(locale),
      seoDescription: hubExcerpt(locale).slice(0, 160),
      body: buildHubBody(locale),
    })),
  };
}

/** The hub first, so the community pages' links to it resolve as soon as they go out. */
export async function publishSpainSchoolCalendars(): Promise<PublishResult[]> {
  const results: PublishResult[] = [await publishArticle(hubSpec())];
  for (const region of SPAIN_REGIONS) results.push(await publishArticle(regionSpec(region)));
  return results;
}
