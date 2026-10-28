/**
 * Words of the fuel pages in Spanish and Catalan. Pure: titles, descriptions,
 * headings and the guidance block. No price ever appears here: prices change
 * every half hour and are shown only by the browser component, with the
 * Ministry's own timestamp.
 *
 * Every rule quoted in the guidance was read on 28 Oct 2026:
 *  - Orden ITC/2308/2007, art. 6.1 (BOE-A-2007-14592): stations send their
 *    prices every Monday (or the next working day) and whenever they change,
 *    at least one hour before applying them; distributors may instead declare
 *    that they apply their operator's recommended prices.
 *  - Same order, annex I.1: the price is "el precio aplicado en surtidor sin
 *    descuentos".
 *  - The REST service's own note: prices are refreshed every half hour, with
 *    the prices in force at that moment.
 *  - Geoportal Gasolineras: Gasolina 95/98, gasóleo and GLP are priced in €/litre.
 *  - MITECO open-data catalogue: dataset under CC BY 4.0, discount plans
 *    published as a separate file. MITECO's legal notice: cite the source,
 *    keep the update date, do not suggest the Ministry endorses the reuse.
 */

import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { caA, caComarca, caDe, esName } from "@/lib/programmatic/holidays/names";

import type { Place } from "./data";
import type { Fuel } from "./live";
import type { FuelLocale } from "./paths";

export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

export const BOE_ORDER_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-2007-14592";
export const GEOPORTAL_HOME = "https://geoportalgasolineras.es/geoportal-instalaciones/Inicio";
export const MITECO_LEGAL_URL = "https://www.miteco.gob.es/es/atencion-al-ciudadano/aviso-legal.html";

/* -------------------------------------------------------------------------- */
/* Place names in a sentence                                                  */
/* -------------------------------------------------------------------------- */

/** The bare name as a heading or list item shows it. */
export function placeName(place: Place, locale: FuelLocale): string {
  if (place.kind === "city") return locale === "es" ? esName(place.name) : place.name;
  if (place.kind === "comarca") return place.name;
  return place.name;
}

/** "en Manresa" / "a Manresa", "al Baix Llobregat", "en la provincia de Girona". */
export function inPlace(place: Place, locale: FuelLocale): string {
  switch (place.kind) {
    case "city":
      return locale === "es" ? `en ${esName(place.name)}` : caA(place.name);
    case "comarca":
      return locale === "es" ? `en ${place.name}` : caA(caComarca(place.name));
    case "province":
      return locale === "es" ? `en la provincia de ${place.name}` : `a la província de ${place.name}`;
    case "chain":
      return locale === "es" ? `en las gasolineras ${place.name}` : `a les benzineres ${place.name}`;
  }
}

/** "de Manresa" / "de l'Hospitalet", "del Baix Llobregat", "de la provincia de Girona". */
export function ofPlace(place: Place, locale: FuelLocale): string {
  switch (place.kind) {
    case "city":
      return locale === "es" ? `de ${esName(place.name)}` : caDe(place.name);
    case "comarca":
      return locale === "es" ? `de ${place.name}` : caDe(caComarca(place.name));
    case "province":
      return locale === "es" ? `de la provincia de ${place.name}` : `de la província de ${place.name}`;
    case "chain":
      return locale === "es" ? `de ${place.name}` : caDe(place.name);
  }
}

/** Chain names as people search them: "Esclatoil (Esclat)". */
function chainTitleName(place: Extract<Place, { kind: "chain" }>): string {
  return place.slug === "esclatoil" ? "Esclatoil (Esclat)" : place.name;
}

/* -------------------------------------------------------------------------- */
/* Titles, descriptions, H1                                                   */
/* -------------------------------------------------------------------------- */

const first = (options: string[], limit: number): string => options.find((o) => o.length <= limit) ?? options[options.length - 1]!;

export function fuelTitle(place: Place, locale: FuelLocale): string {
  if (place.kind === "chain") {
    const n = chainTitleName(place);
    return first(
      locale === "es"
        ? [`Gasolineras ${n}: precio de la gasolina y el diésel hoy`, `Gasolineras ${n}: precio gasolina y diésel hoy`, `Gasolineras ${n}: precio hoy`]
        : [`Benzineres ${n}: preu de la gasolina i el dièsel avui`, `Benzineres ${n}: preu gasolina i dièsel avui`, `Benzineres ${n}: preu avui`],
      TITLE_LIMIT,
    );
  }
  if (place.kind === "province") {
    const p = place.name;
    return first(
      locale === "es"
        ? [`Gasolineras baratas provincia de ${p} hoy: gasolina y diésel`, `Gasolineras baratas en la provincia de ${p} hoy`, `Gasolineras baratas provincia de ${p} hoy`]
        : [`Benzineres barates província de ${p} avui: gasolina i dièsel`, `Benzineres barates a la província de ${p} avui`, `Benzineres barates província de ${p} avui`],
      TITLE_LIMIT,
    );
  }
  const where = inPlace(place, locale);
  const name = placeName(place, locale);
  return first(
    locale === "es"
      ? [
          `Gasolineras baratas ${where} hoy: precio gasolina y diésel`,
          `Gasolineras baratas ${where} hoy: gasolina y diésel`,
          `Gasolineras baratas ${where} hoy`,
          `Gasolineras ${name}: precio hoy`,
        ]
      : [
          `Benzineres barates ${where} avui: preu gasolina i dièsel`,
          `Benzineres barates ${where} avui: gasolina i dièsel`,
          `Benzineres barates ${where} avui`,
          `Benzineres ${name}: preu avui`,
        ],
    TITLE_LIMIT,
  );
}

export function fuelH1(place: Place, locale: FuelLocale): string {
  if (place.kind === "chain") return locale === "es" ? `Gasolineras ${place.name}: precio de hoy` : `Benzineres ${place.name}: preu d'avui`;
  return locale === "es" ? `Gasolineras más baratas ${inPlace(place, locale)} hoy` : `Benzineres més barates ${inPlace(place, locale)} avui`;
}

export function fuelDescription(place: Place, locale: FuelLocale): string {
  const n = place.stations;
  if (place.kind === "chain") {
    const c = chainTitleName(place);
    return first(
      locale === "es"
        ? [
            `Precio de la gasolina y el diésel ahora en las ${n} gasolineras ${c} de Cataluña, de la más barata a la más cara, con el dato oficial del Ministerio.`,
            `Gasolina y diésel ahora en las ${n} gasolineras ${c} de Cataluña, de la más barata a la más cara, con el dato oficial del Ministerio.`,
          ]
        : [
            `Preu de la gasolina i el dièsel ara a les ${n} benzineres ${c} de Catalunya, de la més barata a la més cara, amb la dada oficial del Ministeri.`,
            `Gasolina i dièsel ara a les ${n} benzineres ${c} de Catalunya, de la més barata a la més cara, amb la dada oficial del Ministeri.`,
          ],
      DESCRIPTION_LIMIT,
    );
  }
  const of = ofPlace(place, locale);
  return first(
    locale === "es"
      ? [
          `Las gasolineras más baratas ${of} ahora: gasolina 95, diésel, 98 y GLP en sus ${n} estaciones, con el precio oficial que publica el Ministerio.`,
          `Las gasolineras más baratas ${of} ahora: gasolina 95, diésel, 98 y GLP en ${n} estaciones, con el precio oficial del Ministerio.`,
          `Gasolineras más baratas ${of} ahora: gasolina 95, diésel, 98 y GLP, con el precio oficial del Ministerio.`,
        ]
      : [
          `Les benzineres més barates ${of} ara: gasolina 95, dièsel, 98 i GLP a les seves ${n} estacions, amb el preu oficial que publica el Ministeri.`,
          `Les benzineres més barates ${of} ara: gasolina 95, dièsel, 98 i GLP a ${n} estacions, amb el preu oficial del Ministeri.`,
          `Benzineres més barates ${of} ara: gasolina 95, dièsel, 98 i GLP, amb el preu oficial del Ministeri.`,
        ],
    DESCRIPTION_LIMIT,
  );
}

export interface HubMeta {
  title: string;
  description: string;
  h1: string;
  crumb: string;
}

export function hubMeta(locale: FuelLocale, total: number): HubMeta {
  return locale === "es"
    ? {
        title: "Gasolineras baratas en Cataluña hoy: por ciudad y comarca",
        description: `Las gasolineras más baratas de Cataluña ahora, entre sus ${total} estaciones: gasolina 95, diésel, 98 y GLP por provincia, comarca, ciudad y cadena.`,
        h1: "Gasolineras más baratas de Cataluña hoy",
        crumb: "Gasolineras",
      }
    : {
        title: "Benzineres barates a Catalunya avui: per ciutat i comarca",
        description: `Les benzineres més barates de Catalunya ara, entre les seves ${total} estacions: gasolina 95, dièsel, 98 i GLP per província, comarca, ciutat i cadena.`,
        h1: "Benzineres més barates de Catalunya avui",
        crumb: "Benzineres",
      };
}

/* -------------------------------------------------------------------------- */
/* Page text                                                                  */
/* -------------------------------------------------------------------------- */

/** "28 de octubre de 2026" / "28 d'octubre de 2026" from an ISO date. */
export function longDate(iso: string, locale: FuelLocale): string {
  const date = new Date(`${iso}T12:00:00Z`);
  const text = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "ca-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  // Intl writes "28 d’octubre": the site uses a straight apostrophe.
  return text.replace(/’/g, "'");
}

export function readLine(readOn: string, locale: FuelLocale): string {
  return locale === "es" ? `Listado de estaciones del Ministerio a ${longDate(readOn, locale)}` : `Llista d'estacions del Ministeri a ${longDate(readOn, locale)}`;
}

/** First paragraph, with the place's own numbers (stations and municipalities, never prices). */
export function placeLead(place: Place, locale: FuelLocale, towns: number): string {
  const n = place.stations;
  if (locale === "es") {
    const where = place.kind === "chain" ? "en Cataluña" : inPlace(place, locale);
    const spread = place.kind === "city" ? "" : `, repartidas en ${towns} municipios`;
    const who = place.kind === "chain" ? `El Ministerio para la Transición Ecológica tiene registradas ${n} gasolineras ${place.name} ${where}${spread}.` : `El Ministerio para la Transición Ecológica tiene registradas ${n} gasolineras ${where}${spread}.`;
    return `${who} Aquí tienes las diez más baratas en este momento para cada carburante y el precio mediano de todas, con la hora a la que el Ministerio publicó los precios.`;
  }
  const where = place.kind === "chain" ? "a Catalunya" : inPlace(place, locale);
  const spread = place.kind === "city" ? "" : `, repartides en ${towns} municipis`;
  const who = place.kind === "chain" ? `El Ministeri per a la Transició Ecològica té registrades ${n} benzineres ${place.name} ${where}${spread}.` : `El Ministeri per a la Transició Ecològica té registrades ${n} benzineres ${where}${spread}.`;
  return `${who} Aquí tens les deu més barates en aquest moment per a cada carburant i la mediana de totes, amb l'hora a què el Ministeri va publicar els preus.`;
}

export function hubLead(locale: FuelLocale, total: number, towns: number): string {
  return locale === "es"
    ? `El Ministerio para la Transición Ecológica tiene registradas ${total} gasolineras en Cataluña, en ${towns} municipios. Aquí tienes las diez más baratas ahora para cada carburante, y una página para cada provincia, comarca, ciudad con al menos diez gasolineras y las cadenas catalanas bonÀrea y Esclatoil.`
    : `El Ministeri per a la Transició Ecològica té registrades ${total} benzineres a Catalunya, en ${towns} municipis. Aquí tens les deu més barates ara per a cada carburant, i una pàgina per a cada província, comarca, ciutat amb almenys deu benzineres i les cadenes catalanes bonÀrea i Esclatoil.`;
}

export interface Guidance {
  title: string;
  paragraphs: string[];
}

/** The block of original guidance every page carries. Inline Markdown links only. */
export function guidance(locale: FuelLocale): Guidance[] {
  if (locale === "es") {
    return [
      {
        title: "De dónde salen estos precios",
        paragraphs: [
          `Los comunica cada gasolinera al Ministerio para la Transición Ecológica y el Reto Demográfico: todos los lunes y cada vez que los cambia, como mínimo una hora antes de aplicarlos ([Orden ITC/2308/2007, artículo 6](${BOE_ORDER_URL})). Una gasolinera de una red puede, en lugar de eso, declarar que aplica los precios máximos o recomendados por su operador.`,
          `El Ministerio los publica en el [Geoportal Gasolineras](${GEOPORTAL_HOME}) y en un servicio de datos abiertos que se actualiza cada media hora con los precios en vigor en ese momento. Esta página consulta ese servicio cuando la abres; no guardamos precios antiguos.`,
        ],
      },
      {
        title: "Cómo leer la tabla",
        paragraphs: [
          "**Gasolina 95 E5** es la sin plomo de 95 octanos de siempre; **gasóleo A**, el diésel normal de los coches; **gasolina 98 E5**, la de 98 octanos, y **GLP**, el autogás. Todos los precios son en euros por litro.",
          "Es el precio de venta al público en el surtidor, **sin descuentos**: el que declara la propia gasolinera. Las tarjetas de fidelización y los planes de descuento no están incluidos; el Ministerio publica esos planes aparte, en el mismo Geoportal.",
          "La **mediana** es el precio que deja la mitad de las gasolineras por encima y la otra mitad por debajo: sirve para ver cuánto te ahorras en la más barata frente a una gasolinera típica de la zona.",
          "Una gasolinera puede cambiar el precio después de la última actualización. Míralo en el surtidor antes de repostar.",
        ],
      },
    ];
  }
  return [
    {
      title: "D'on surten aquests preus",
      paragraphs: [
        `Els comunica cada benzinera al Ministeri per a la Transició Ecològica i el Repte Demogràfic: cada dilluns i cada vegada que els canvia, com a mínim una hora abans d'aplicar-los ([Ordre ITC/2308/2007, article 6](${BOE_ORDER_URL})). Una benzinera d'una xarxa pot, en lloc d'això, declarar que aplica els preus màxims o recomanats pel seu operador.`,
        `El Ministeri els publica al [Geoportal Gasolineras](${GEOPORTAL_HOME}) i en un servei de dades obertes que s'actualitza cada mitja hora amb els preus vigents en aquell moment. Aquesta pàgina consulta aquest servei quan l'obres; no desem preus antics.`,
      ],
    },
    {
      title: "Com llegir la taula",
      paragraphs: [
        "La **gasolina 95 E5** és la sense plom de 95 octans de sempre; el **gasoli A**, el dièsel normal dels cotxes; la **gasolina 98 E5**, la de 98 octans, i el **GLP**, l'autogas. Tots els preus són en euros per litre.",
        "És el preu de venda al públic al sortidor, **sense descomptes**: el que declara la mateixa benzinera. Les targetes de fidelització i els plans de descompte no hi són inclosos; el Ministeri publica aquests plans a part, al mateix Geoportal.",
        "La **mediana** és el preu que deixa la meitat de les benzineres per sobre i l'altra meitat per sota: serveix per veure quant t'estalvies a la més barata davant d'una benzinera típica de la zona.",
        "Una benzinera pot canviar el preu després de l'última actualització. Mira'l al sortidor abans de posar-hi combustible.",
      ],
    },
  ];
}

/** Attribution required by the licence (CC BY 4.0) and MITECO's legal notice. */
export function attribution(locale: FuelLocale, datasetUrl: string): string {
  return locale === "es"
    ? `Precios y estaciones: [Ministerio para la Transición Ecológica y el Reto Demográfico](${datasetUrl}), datos abiertos con licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es). CatalunyaInfo los filtra por zona y los ordena por precio; el Ministerio no participa en esta página ni la patrocina.`
    : `Preus i estacions: [Ministeri per a la Transició Ecològica i el Repte Demogràfic](${datasetUrl}), dades obertes amb llicència [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ca). CatalunyaInfo les filtra per zona i les ordena per preu; el Ministeri no participa en aquesta pàgina ni la patrocina.`;
}

/* -------------------------------------------------------------------------- */
/* Section titles and labels                                                  */
/* -------------------------------------------------------------------------- */

export const FUEL_NAMES: Record<FuelLocale, Record<Fuel, string>> = {
  es: { e95: "Gasolina 95 E5", goa: "Gasóleo A (diésel)", e98: "Gasolina 98 E5", glp: "GLP (autogás)" },
  ca: { e95: "Gasolina 95 E5", goa: "Gasoli A (dièsel)", e98: "Gasolina 98 E5", glp: "GLP (autogas)" },
};

export interface LiveLabels {
  fuelNames: Record<Fuel, string>;
  fallback: string;
  loading: string;
  failed: string;
  stale: string;
  old: string;
  updated: string;
  picker: string;
  median: string;
  none: string;
  caption: string;
  cols: { rank: string; station: string; town: string; price: string; map: string };
  map: string;
  perLitre: string;
  geoportal: string;
}

export function liveLabels(locale: FuelLocale): LiveLabels {
  if (locale === "es") {
    return {
      fuelNames: FUEL_NAMES.es,
      fallback: "Los precios de ahora se cargan del Ministerio al abrir la página, con JavaScript activado. Sin él, consúltalos en el Geoportal Gasolineras.",
      loading: "Cargando los precios del Ministerio…",
      failed: "Ahora no podemos mostrar los precios: el servicio del Ministerio no responde. Puedes consultarlos en el Geoportal Gasolineras.",
      stale: "No mostramos precios porque la última lista del Ministerio que tenemos es de {when}, hace más de un día. Consulta los precios actuales en el Geoportal Gasolineras.",
      old: "Atención: la lista del Ministerio es de {when}, hace más de cuatro horas. Los precios pueden haber cambiado; compruébalos en el Geoportal Gasolineras.",
      updated: "Precios en vigor a las {time} del {date}, según el Ministerio.",
      picker: "Carburante",
      median: "Precio mediano en {count} gasolineras {place}: {price}.",
      none: "Ninguna gasolinera {place} publica precio de este carburante ahora mismo.",
      caption: "Las {n} más baratas: {fuel}",
      cols: { rank: "#", station: "Gasolinera", town: "Municipio", price: "€/litro", map: "Mapa" },
      map: "Ver en el mapa",
      perLitre: "€/l",
      geoportal: "Geoportal Gasolineras",
    };
  }
  return {
    fuelNames: FUEL_NAMES.ca,
    fallback: "Els preus d'ara es carreguen del Ministeri en obrir la pàgina, amb el JavaScript activat. Sense, consulta'ls al Geoportal Gasolineras.",
    loading: "Carregant els preus del Ministeri…",
    failed: "Ara no podem mostrar els preus: el servei del Ministeri no respon. Els pots consultar al Geoportal Gasolineras.",
    stale: "No mostrem preus perquè l'última llista del Ministeri que tenim és de {when}, fa més d'un dia. Consulta els preus actuals al Geoportal Gasolineras.",
    old: "Atenció: la llista del Ministeri és de {when}, fa més de quatre hores. Els preus poden haver canviat; comprova'ls al Geoportal Gasolineras.",
    updated: "Preus vigents a les {time} del {date}, segons el Ministeri.",
    picker: "Carburant",
    median: "Mediana de {count} benzineres {place}: {price}.",
    none: "Cap benzinera {place} no publica preu d'aquest carburant ara mateix.",
    caption: "Les {n} més barates: {fuel}",
    cols: { rank: "#", station: "Benzinera", town: "Municipi", price: "€/litre", map: "Mapa" },
    map: "Veure al mapa",
    perLitre: "€/l",
    geoportal: "Geoportal Gasolineras",
  };
}

export interface SectionTitles {
  live: string;
  stations: string;
  brands: string;
  byComarca: string;
  byTown: string;
  siblings: string;
  nearbyCities: string;
  comarquesHere: string;
  citiesHere: string;
  provinces: string;
  chains: string;
  guides: string;
  sources: string;
  colBrand: string;
  colStations: string;
  colAddress: string;
  colTown: string;
  colComarca: string;
  allPlaces: string;
  stationsUnit: (n: number) => string;
}

export function sectionTitles(locale: FuelLocale): SectionTitles {
  return locale === "es"
    ? {
        live: "Precios ahora",
        stations: "Gasolineras registradas",
        brands: "Gasolineras por marca",
        byComarca: "Por comarcas",
        byTown: "Por municipios",
        siblings: "Otras zonas",
        nearbyCities: "Otras ciudades",
        comarquesHere: "Comarcas",
        citiesHere: "Ciudades",
        provinces: "Provincias",
        chains: "Cadenas catalanas",
        guides: "Si vas en coche",
        sources: "Fuentes",
        colBrand: "Marca (rótulo)",
        colStations: "Gasolineras",
        colAddress: "Dirección",
        colTown: "Municipio",
        colComarca: "Comarca",
        allPlaces: "Todas las zonas: gasolineras de Cataluña",
        stationsUnit: (n) => (n === 1 ? "1 gasolinera" : `${n} gasolineras`),
      }
    : {
        live: "Preus ara",
        stations: "Benzineres registrades",
        brands: "Benzineres per marca",
        byComarca: "Per comarques",
        byTown: "Per municipis",
        siblings: "Altres zones",
        nearbyCities: "Altres ciutats",
        comarquesHere: "Comarques",
        citiesHere: "Ciutats",
        provinces: "Províncies",
        chains: "Cadenes catalanes",
        guides: "Si vas amb cotxe",
        sources: "Fonts",
        colBrand: "Marca (rètol)",
        colStations: "Benzineres",
        colAddress: "Adreça",
        colTown: "Municipi",
        colComarca: "Comarca",
        allPlaces: "Totes les zones: benzineres de Catalunya",
        stationsUnit: (n) => (n === 1 ? "1 benzinera" : `${n} benzineres`),
      };
}

/** Guides that help someone who is driving; only ones that exist. */
export function driverGuides(locale: FuelLocale): { label: string; href: string }[] {
  return locale === "es"
    ? [
        { label: B2_TITLES.zbe.es, href: b2href("zbe", "es") },
        { label: B2_TITLES.parking.es, href: b2href("parking", "es") },
      ]
    : [
        { label: B2_TITLES.zbe.ca, href: b2href("zbe", "ca") },
        { label: B2_TITLES.parking.ca, href: b2href("parking", "ca") },
      ];
}
