import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { hubMeta, townDescription, townTitle } from "@/lib/programmatic/christmas-fairs/copy";
import { familyLastChecked, type Town } from "@/lib/programmatic/christmas-fairs/data";
import { fairsHubPath, hubTranslations, townPath, townTranslations, type FairsLocale } from "@/lib/programmatic/christmas-fairs/paths";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { HubPage, hubCounts, hubCrumbs } from "./HubPage";
import { TownPage, townCrumbs } from "./TownPage";

/**
 * Route bodies for the Christmas fairs family. Each `page.tsx` under
 * `app/(public)/[locale]/{fires-de-nadal,mercados-navidad,christmas-markets}`
 * is a thin wrapper that fixes its locale and calls one of these, so the three
 * editions cannot drift. Everything renders from the committed snapshot and
 * `organisers.ts`: no clock, no network, no database.
 */

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

export function hubMetadata(locale: FairsLocale): Metadata {
  const meta = hubMeta(locale, hubCounts(), familyLastChecked());
  return buildMetadata({ locale, path: fairsHubPath(locale), title: meta.title, description: meta.description, translations: hubTranslations() });
}

export function HubRoute({ locale }: { locale: FairsLocale }) {
  return (
    <>
      <SiteHeader locale={locale} translations={hubTranslations()} activeSection={null} />
      <main id="main">
        <HubPage locale={locale} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(hubCrumbs(locale))])} />
      <SiteFooter locale={locale} />
    </>
  );
}

export function townMetadata(locale: FairsLocale, town: Town): Metadata {
  return buildMetadata({
    locale,
    path: townPath(locale, town.slug),
    title: townTitle(town, locale),
    description: townDescription(town, locale),
    translations: townTranslations(town),
  });
}

export function TownRoute({ locale, town }: { locale: FairsLocale; town: Town }) {
  return (
    <>
      <SiteHeader locale={locale} translations={townTranslations(town)} activeSection={null} />
      <main id="main">
        <TownPage town={town} locale={locale} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(townCrumbs(town, locale))])} />
      <SiteFooter locale={locale} />
    </>
  );
}
