import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { communityBySlug, type CommunityNames } from "@/lib/programmatic/spain-2027/communities";
import { BRIDGES, HUB, bridgesDescription, communityDescription, communityFaq, communityH1, communityTitle, hubDescription } from "@/lib/programmatic/spain-2027/copy";
import type { City } from "@/lib/programmatic/spain-2027/cities";
import { cityDescription, cityFaq, cityTitle } from "@/lib/programmatic/spain-2027/city-copy";
import { editionsOf } from "@/lib/programmatic/spain-2027/editions";
import { cityPath, communityPath, spainBridgesPath, spainHubPath } from "@/lib/programmatic/spain-2027/paths";
import { BOE_REF, SOURCES, SOURCES_READ_ON } from "@/lib/programmatic/spain-2027/sources";
import { breadcrumbSchema, datasetSchema, faqSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { CityPage, cityCrumbs } from "./city-page";
import { CommunityPage, SpainBridgesPage, SpainHubPage, bridgesCrumbs, communityCrumbs, hubCrumbs } from "./pages";

/**
 * Route bodies for /es/festivos/2027/. Each page lists its Catalan and
 * English editions (editions.ts, /ca/festius/2027/ and /en/holidays/2027/)
 * for hreflang and the language switcher.
 */

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

/** The BOE's terms of reuse (aviso legal, "Condiciones de reutilización"). */
const BOE_REUSE = "https://www.boe.es/informacion/aviso_legal/index.php#reutilizacion";
const CREATOR = "Ministerio de Trabajo y Economía Social. Dirección General de Trabajo";

/** The page's three editions (the name is older than the Catalan and English ones). */
function only(path: string) {
  return editionsOf(path) ?? { es: path };
}

function dataset(path: string, name: string, description: string, spatial: string, extra: string[] = []) {
  return datasetSchema({
    path,
    name,
    description,
    locale: "es",
    creator: CREATOR,
    license: BOE_REUSE,
    isBasedOn: [BOE_REF.url, ...extra],
    spatialCoverage: spatial,
    temporalCoverage: "2027",
    dateModified: SOURCES_READ_ON,
  });
}

/* ------------------------------------------------------------------ Hub --- */

export function spainHubMetadata(): Metadata {
  return buildMetadata({ locale: "es", path: spainHubPath(), title: HUB.title, description: hubDescription(), translations: only(spainHubPath()) });
}

export function SpainHubRoute() {
  return (
    <>
      <SiteHeader locale="es" translations={only(spainHubPath())} />
      <main id="main">
        <SpainHubPage />
      </main>
      <JsonLd json={graph([breadcrumbSchema(hubCrumbs()), dataset(spainHubPath(), HUB.h1, hubDescription(), "España")])} />
      <SiteFooter locale="es" />
    </>
  );
}

/* ------------------------------------------------------------ Community --- */

export function communityMetadata(slug: string): Metadata {
  const c = communityBySlug(slug);
  if (!c) return NOT_FOUND_METADATA;
  return buildMetadata({ locale: "es", path: communityPath(c), title: communityTitle(c), description: communityDescription(c), translations: only(communityPath(c)) });
}

export function CommunityRoute({ c }: { c: CommunityNames }) {
  const s = SOURCES[c.region];
  return (
    <>
      <SiteHeader locale="es" translations={only(communityPath(c))} />
      <main id="main">
        <CommunityPage c={c} />
      </main>
      <JsonLd
        json={graph([
          breadcrumbSchema(communityCrumbs(c)),
          dataset(communityPath(c), communityH1(c), communityDescription(c), `${c.short}, España`, s.decree.status === "published" ? [s.decree.text.url] : []),
          faqSchema([{ type: "faq", items: communityFaq(c) }]),
        ])}
      />
      <SiteFooter locale="es" />
    </>
  );
}

/* ----------------------------------------------------------------- City --- */

export function cityMetadata(city: City): Metadata {
  return buildMetadata({ locale: "es", path: cityPath(city), title: cityTitle(city), description: cityDescription(city), translations: only(cityPath(city)) });
}

/** No Dataset node here: the local lists come from regional bulletins whose reuse terms differ from the BOE's. */
export function CityRoute({ city }: { city: City }) {
  return (
    <>
      <SiteHeader locale="es" translations={only(cityPath(city))} />
      <main id="main">
        <CityPage c={city} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(cityCrumbs(city)), faqSchema([{ type: "faq", items: cityFaq(city) }])])} />
      <SiteFooter locale="es" />
    </>
  );
}

/* -------------------------------------------------------------- Bridges --- */

export function spainBridgesMetadata(): Metadata {
  return buildMetadata({ locale: "es", path: spainBridgesPath(), title: BRIDGES.title, description: bridgesDescription(), translations: only(spainBridgesPath()) });
}

export function SpainBridgesRoute() {
  return (
    <>
      <SiteHeader locale="es" translations={only(spainBridgesPath())} />
      <main id="main">
        <SpainBridgesPage />
      </main>
      <JsonLd json={graph([breadcrumbSchema(bridgesCrumbs())])} />
      <SiteFooter locale="es" />
    </>
  );
}
