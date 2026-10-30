/**
 * Dataset markup for the fuel pages (Google Dataset Search).
 *
 * Prices and stations are the Ministry's (MITECO's "Instalaciones de
 * suministro de combustibles…", CC BY 4.0, recorded in the snapshot's
 * `sources.prices`). The page filters them by place and orders them by price;
 * the markup names the Ministry as creator and its licence, and takes the
 * page's own H1 and meta description. No `dateModified`: the prices are read
 * live in the browser, so no single date in the HTML would be true.
 */

import { datasetSchema } from "@/lib/seo/jsonld";

import { fuelDescription, fuelH1, hubMeta, placeName } from "./copy";
import { MUNICIPALITIES, STATIONS, type Place } from "./data";
import { fuelHubPath, fuelPath, type FuelLocale } from "./paths";

const CATALONIA: Record<FuelLocale, string> = { ca: "Catalunya", es: "Cataluña" };

function spatial(place: Place, locale: FuelLocale): string {
  switch (place.kind) {
    case "province":
      return `${locale === "es" ? "Provincia" : "Província"} de ${place.name}, ${CATALONIA[locale]}`;
    case "chain":
      return CATALONIA[locale];
    default:
      return `${placeName(place, locale)}, ${CATALONIA[locale]}`;
  }
}

function common() {
  const prices = MUNICIPALITIES.sources.prices;
  return { creator: prices.publisher, license: prices.licenceUrl, isBasedOn: [prices.url] };
}

export function fuelPlaceDataset(place: Place, locale: FuelLocale) {
  return datasetSchema({
    path: fuelPath(locale, place.kind, place.slug),
    name: fuelH1(place, locale),
    description: fuelDescription(place, locale),
    locale,
    ...common(),
    spatialCoverage: spatial(place, locale),
  });
}

export function fuelHubDataset(locale: FuelLocale) {
  const meta = hubMeta(locale, STATIONS.stations.length);
  return datasetSchema({
    path: fuelHubPath(locale),
    name: meta.h1,
    description: meta.description,
    locale,
    ...common(),
    spatialCoverage: CATALONIA[locale],
  });
}
