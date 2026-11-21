import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { fuelDescription, fuelTitle, hubMeta } from "@/lib/programmatic/fuel/copy";
import { MUNICIPALITIES, type Place } from "@/lib/programmatic/fuel/data";
import { freshness, type LivePayload } from "@/lib/programmatic/fuel/live";
import { loadServerPrices } from "@/lib/programmatic/fuel/server";
import {
  fuelHubPath,
  fuelHubTranslations,
  fuelPath,
  fuelTranslations,
  spainHubPath,
  spainHubTranslations,
  spainProvincePath,
  spainProvinceTranslations,
  type FuelHubLocale,
  type FuelLocale,
} from "@/lib/programmatic/fuel/paths";
import { spainSummary, type SpainProvince, type SpainSummary } from "@/lib/programmatic/fuel/spain";
import {
  provinceLabel,
  spainHubDescription,
  spainHubFaq,
  spainHubMeta,
  spainProvinceDescription,
  spainProvinceFaq,
  spainProvinceH1,
  spainProvinceTitle,
} from "@/lib/programmatic/fuel/spain-copy";
import { loadSpainPrices } from "@/lib/programmatic/fuel/spain-server";
import { fuelHubDataset, fuelPlaceDataset } from "@/lib/programmatic/fuel/structured";
import { breadcrumbSchema, datasetSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { FuelHubPage, hubCrumbs, hubTotals } from "./FuelHubPage";
import { FuelPlacePage, placeCrumbs } from "./FuelPlacePage";
import { SpainHubPage, SpainProvincePage, spainHubCrumbs, spainProvinceCrumbs } from "./SpainPages";

/**
 * Route bodies for the fuel family. Each `page.tsx` under
 * `app/(public)/[locale]/{gasolineras,benzineres}` is a thin wrapper that
 * fixes its locale and calls one of these, so the two editions cannot drift.
 */

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

export function fuelHubMetadata(locale: FuelHubLocale): Metadata {
  const meta = hubMeta(locale, hubTotals().stations);
  return buildMetadata({ locale, path: fuelHubPath(locale), title: meta.title, description: meta.description, translations: fuelHubTranslations() });
}

/** The Ministry's list for this render and its time, when it is no more than a day old. */
async function pricesForRender(): Promise<{ prices: LivePayload | null; now: number; dateModified?: string }> {
  const prices = await loadServerPrices();
  const now = Date.now();
  const usable = prices && freshness(prices.updated, now) !== "stale" ? prices : null;
  return { prices: usable, now, dateModified: usable?.updated ?? undefined };
}

export async function FuelHubRoute({ locale }: { locale: FuelHubLocale }) {
  const { prices, now, dateModified } = await pricesForRender();
  return (
    <>
      <SiteHeader locale={locale} translations={fuelHubTranslations()} activeSection={null} />
      <main id="main">
        <FuelHubPage locale={locale} prices={prices} now={now} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(hubCrumbs(locale)), fuelHubDataset(locale, dateModified)])} />
      <SiteFooter locale={locale} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Spain by province (21 Nov 2026)                                            */
/* -------------------------------------------------------------------------- */

/** The national list for this render, reduced once per list (spain.ts); null when none under a day old. */
async function spainForRender(): Promise<SpainSummary | null> {
  return spainSummary(await loadSpainPrices(), Date.now());
}

function spainDataset(input: { path: string; name: string; description: string; locale: FuelHubLocale; spatial: string; dateModified?: string | null }) {
  const prices = MUNICIPALITIES.sources.prices;
  return datasetSchema({
    path: input.path,
    name: input.name,
    description: input.description,
    locale: input.locale,
    creator: prices.publisher,
    license: prices.licenceUrl,
    isBasedOn: [prices.url],
    spatialCoverage: input.spatial,
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  });
}

function faqPage(faq: { q: string; a: string }[]) {
  return { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
}

const SPAIN: Record<FuelHubLocale, string> = { es: "España", ca: "Espanya", en: "Spain" };

export async function spainHubMetadata(locale: FuelHubLocale): Promise<Metadata> {
  const summary = await spainForRender();
  return buildMetadata({ locale, path: spainHubPath(locale), title: spainHubMeta(locale).title, description: spainHubDescription(locale, summary), translations: spainHubTranslations() });
}

export async function SpainHubRoute({ locale }: { locale: FuelHubLocale }) {
  const summary = await spainForRender();
  const meta = spainHubMeta(locale);
  return (
    <>
      <SiteHeader locale={locale} translations={spainHubTranslations()} activeSection={null} />
      <main id="main">
        <SpainHubPage locale={locale} summary={summary} />
      </main>
      <JsonLd
        json={graph([
          breadcrumbSchema(spainHubCrumbs(locale)),
          spainDataset({ path: spainHubPath(locale), name: meta.h1, description: spainHubDescription(locale, summary), locale, spatial: SPAIN[locale], dateModified: summary?.updated }),
          summary ? faqPage(spainHubFaq(locale, summary)) : null,
        ])}
      />
      <SiteFooter locale={locale} />
    </>
  );
}

export async function spainProvinceMetadata(locale: FuelHubLocale, province: SpainProvince): Promise<Metadata> {
  const summary = await spainForRender();
  return buildMetadata({
    locale,
    path: spainProvincePath(locale, province.slug),
    title: spainProvinceTitle(province, locale),
    description: spainProvinceDescription(province, locale, summary),
    translations: spainProvinceTranslations(province.slug),
  });
}

export async function SpainProvinceRoute({ locale, province }: { locale: FuelHubLocale; province: SpainProvince }) {
  const summary = await spainForRender();
  return (
    <>
      <SiteHeader locale={locale} translations={spainProvinceTranslations(province.slug)} activeSection={null} />
      <main id="main">
        <SpainProvincePage province={province} locale={locale} summary={summary} />
      </main>
      <JsonLd
        json={graph([
          breadcrumbSchema(spainProvinceCrumbs(province, locale)),
          spainDataset({
            path: spainProvincePath(locale, province.slug),
            name: spainProvinceH1(province, locale),
            description: spainProvinceDescription(province, locale, summary),
            locale,
            spatial: `${provinceLabel(province, locale)}, ${SPAIN[locale]}`,
            dateModified: summary?.updated,
          }),
          summary?.provinces[province.code] ? faqPage(spainProvinceFaq(province, locale, summary)) : null,
        ])}
      />
      <SiteFooter locale={locale} />
    </>
  );
}

export function fuelPlaceMetadata(locale: FuelLocale, place: Place): Metadata {
  return buildMetadata({
    locale,
    path: fuelPath(locale, place.kind, place.slug),
    title: fuelTitle(place, locale),
    description: fuelDescription(place, locale),
    translations: fuelTranslations(place.kind, place.slug),
  });
}

export async function FuelPlaceRoute({ locale, place }: { locale: FuelLocale; place: Place }) {
  const { prices, now, dateModified } = await pricesForRender();
  return (
    <>
      <SiteHeader locale={locale} translations={fuelTranslations(place.kind, place.slug)} activeSection={null} />
      <main id="main">
        <FuelPlacePage place={place} locale={locale} prices={prices} now={now} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(placeCrumbs(place, locale)), fuelPlaceDataset(place, locale, dateModified)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
