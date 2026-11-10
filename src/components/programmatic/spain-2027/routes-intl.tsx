import type { Metadata } from "next";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { City } from "@/lib/programmatic/spain-2027/cities";
import { cityDescriptionIntl, cityFaqIntl, cityTitleIntl } from "@/lib/programmatic/spain-2027/city-copy-intl";
import {
  BRIDGES_INTL,
  HUB_INTL,
  bridgesDescriptionIntl,
  communityDescriptionIntl,
  communityFaqIntl,
  communityH1Intl,
  communityTitleIntl,
  hubDescriptionIntl,
} from "@/lib/programmatic/spain-2027/copy-intl";
import {
  bridgesEditions,
  cityEditions,
  communityEditions,
  editionBridgesPath,
  editionCityPath,
  editionCommunityPath,
  editionHubPath,
  hubEditions,
  type Edition,
  type EditionNames,
} from "@/lib/programmatic/spain-2027/editions";
import { BOE_REF, SOURCES, SOURCES_READ_ON } from "@/lib/programmatic/spain-2027/sources";
import { breadcrumbSchema, datasetSchema, faqSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { CityPageIntl, cityCrumbsIntl } from "./city-page-intl";
import { CommunityPageIntl, SpainBridgesPageIntl, SpainHubPageIntl, bridgesCrumbsIntl, communityCrumbsIntl, hubCrumbsIntl } from "./pages-intl";

/**
 * Route bodies for /ca/festius/2027/ and /en/holidays/2027/, the Catalan and
 * English editions of /es/festivos/2027/. Every page lists its three editions
 * (editions.ts) for hreflang and the language switcher.
 */

/** The BOE's terms of reuse (aviso legal, "Condiciones de reutilización"). */
const BOE_REUSE = "https://www.boe.es/informacion/aviso_legal/index.php#reutilizacion";
const CREATOR = "Ministerio de Trabajo y Economía Social. Dirección General de Trabajo";

function dataset(locale: Edition, path: string, name: string, description: string, spatial: string, extra: string[] = []) {
  return datasetSchema({
    path,
    name,
    description,
    locale,
    creator: CREATOR,
    license: BOE_REUSE,
    isBasedOn: [BOE_REF.url, ...extra],
    spatialCoverage: spatial,
    temporalCoverage: "2027",
    dateModified: SOURCES_READ_ON,
  });
}

function Shell({ locale, translations, children, json }: { locale: Edition; translations: Record<string, string>; children: ReactNode; json: string }) {
  return (
    <>
      <SiteHeader locale={locale} translations={translations} />
      <main id="main">{children}</main>
      <JsonLd json={json} />
      <SiteFooter locale={locale} />
    </>
  );
}

/* ------------------------------------------------------------------ Hub --- */

export function hubMetadataIntl(locale: Edition): Metadata {
  return buildMetadata({ locale, path: editionHubPath(locale), title: HUB_INTL[locale].title, description: hubDescriptionIntl(locale), translations: hubEditions() });
}

export function SpainHubRouteIntl({ locale }: { locale: Edition }) {
  const spain = locale === "ca" ? "Espanya" : "Spain";
  return (
    <Shell
      locale={locale}
      translations={hubEditions()}
      json={graph([breadcrumbSchema(hubCrumbsIntl(locale)), dataset(locale, editionHubPath(locale), HUB_INTL[locale].h1, hubDescriptionIntl(locale), spain)])}
    >
      <SpainHubPageIntl locale={locale} />
    </Shell>
  );
}

/* ------------------------------------------------------------ Community --- */

export function communityMetadataIntl(c: EditionNames, locale: Edition): Metadata {
  return buildMetadata({
    locale,
    path: editionCommunityPath(locale, c.region),
    title: communityTitleIntl(c, locale),
    description: communityDescriptionIntl(c, locale),
    translations: communityEditions(c.region),
  });
}

export function CommunityRouteIntl({ c, locale }: { c: EditionNames; locale: Edition }) {
  const s = SOURCES[c.region];
  const spain = locale === "ca" ? "Espanya" : "Spain";
  return (
    <Shell
      locale={locale}
      translations={communityEditions(c.region)}
      json={graph([
        breadcrumbSchema(communityCrumbsIntl(c, locale)),
        dataset(
          locale,
          editionCommunityPath(locale, c.region),
          communityH1Intl(c, locale),
          communityDescriptionIntl(c, locale),
          `${c.short}, ${spain}`,
          s.decree.status === "published" ? [s.decree.text.url] : [],
        ),
        faqSchema([{ type: "faq", items: communityFaqIntl(c, locale) }]),
      ])}
    >
      <CommunityPageIntl c={c} locale={locale} />
    </Shell>
  );
}

/* ----------------------------------------------------------------- City --- */

export function cityMetadataIntl(city: City, locale: Edition): Metadata {
  return buildMetadata({
    locale,
    path: editionCityPath(locale, city),
    title: cityTitleIntl(city, locale),
    description: cityDescriptionIntl(city, locale),
    translations: cityEditions(city),
  });
}

/** No Dataset node here: the local lists come from regional bulletins whose reuse terms differ from the BOE's. */
export function CityRouteIntl({ city, locale }: { city: City; locale: Edition }) {
  return (
    <Shell
      locale={locale}
      translations={cityEditions(city)}
      json={graph([breadcrumbSchema(cityCrumbsIntl(city, locale)), faqSchema([{ type: "faq", items: cityFaqIntl(city, locale) }])])}
    >
      <CityPageIntl c={city} locale={locale} />
    </Shell>
  );
}

/* -------------------------------------------------------------- Bridges --- */

export function bridgesMetadataIntl(locale: Edition): Metadata {
  return buildMetadata({
    locale,
    path: editionBridgesPath(locale),
    title: BRIDGES_INTL[locale].title,
    description: bridgesDescriptionIntl(locale),
    translations: bridgesEditions(),
  });
}

export function SpainBridgesRouteIntl({ locale }: { locale: Edition }) {
  return (
    <Shell locale={locale} translations={bridgesEditions()} json={graph([breadcrumbSchema(bridgesCrumbsIntl(locale))])}>
      <SpainBridgesPageIntl locale={locale} />
    </Shell>
  );
}
