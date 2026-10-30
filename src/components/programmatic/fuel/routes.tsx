import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { fuelDescription, fuelTitle, hubMeta } from "@/lib/programmatic/fuel/copy";
import type { Place } from "@/lib/programmatic/fuel/data";
import { fuelHubPath, fuelHubTranslations, fuelPath, fuelTranslations, type FuelLocale } from "@/lib/programmatic/fuel/paths";
import { fuelHubDataset, fuelPlaceDataset } from "@/lib/programmatic/fuel/structured";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { FuelHubPage, hubCrumbs, hubTotals } from "./FuelHubPage";
import { FuelPlacePage, placeCrumbs } from "./FuelPlacePage";

/**
 * Route bodies for the fuel family. Each `page.tsx` under
 * `app/(public)/[locale]/{gasolineras,benzineres}` is a thin wrapper that
 * fixes its locale and calls one of these, so the two editions cannot drift.
 */

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

export function fuelHubMetadata(locale: FuelLocale): Metadata {
  const meta = hubMeta(locale, hubTotals().stations);
  return buildMetadata({ locale, path: fuelHubPath(locale), title: meta.title, description: meta.description, translations: fuelHubTranslations() });
}

export function FuelHubRoute({ locale }: { locale: FuelLocale }) {
  return (
    <>
      <SiteHeader locale={locale} translations={fuelHubTranslations()} activeSection={null} />
      <main id="main">
        <FuelHubPage locale={locale} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(hubCrumbs(locale)), fuelHubDataset(locale)])} />
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

export function FuelPlaceRoute({ locale, place }: { locale: FuelLocale; place: Place }) {
  return (
    <>
      <SiteHeader locale={locale} translations={fuelTranslations(place.kind, place.slug)} activeSection={null} />
      <main id="main">
        <FuelPlacePage place={place} locale={locale} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(placeCrumbs(place, locale)), fuelPlaceDataset(place, locale)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
