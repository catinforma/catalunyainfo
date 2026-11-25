import { holidayOn } from "@/lib/content/holidays/calendar";
import { councilApproved2027, municipalityBySlug } from "@/lib/programmatic/holidays/data";

import type { HolidayName } from "./logic";
import type { L, MarketArea, MarketSource, MarketTown } from "./types";

/**
 * The weekly street markets of Vic and Mataró: the only file with facts.
 * Pilot of 25 Nov 2026 (docs/SEO_EXPERIMENTS.md, entry of that day).
 *
 * Every pattern, hour and exception below was read on the council's own
 * page on 25 Nov 2026; the words it rests on are in `quotes` of the source
 * (a check script, `scripts/check-weekly-markets.ts`, greps them again).
 * Nothing here is rounded or completed from memory: where the council
 * publishes no hours (Vic, Tuesday and Saturday) the market has none and the
 * page says "horari de matí", the council's own words.
 *
 * Discrepancies found against the Generalitat census (open data
 * `vjxi-2iwi`, 553 rows read 25 Nov 2026, last updated 29 Oct 2026) are
 * listed in `docs/SEO_EXPERIMENTS.md` (entry of 25 Nov 2026) and, for the
 * ones a reader meets, on the page.
 */

export const WEEKLY_MARKETS_AS_OF = "2026-11-25";
/** The date guard fails from this day until the sources are read again (`tests/weekly-markets.test.ts`). */
export const WEEKLY_MARKETS_REREAD_BY = "2026-12-21";

const l = (ca: string, es: string, en: string): L => ({ ca, es, en });

const CENSUS_URL = "https://analisi.transparenciacatalunya.cat/Comer-/Mercats-de-venda-no-sedent-ria-de-Catalunya/vjxi-2iwi";
const CENSUS_PAGE = "https://ccam.gencat.cat/ca/arees_actuacio/comerc/elsmercatscat/setmanals";

/** The census, as a source of each town (the row ids differ). */
function census(id: string, rows: string): MarketSource {
  return {
    id,
    name: "Mercats de venda no sedentària de Catalunya (dades obertes)",
    publisher: "Generalitat de Catalunya, Departament d'Empresa i Treball (Transparència Catalunya)",
    url: CENSUS_URL,
    readOn: WEEKLY_MARKETS_AS_OF,
    quotes: [rows],
  };
}

/* -------------------------------------------------------------------------- */
/* Vic                                                                        */
/* -------------------------------------------------------------------------- */

const VIC_CENTRE: MarketArea = { id: "centre", name: l("Plaça Major i rambles", "plaza Mayor y ramblas", "Plaça Major and the ramblas") };
const VIC_REMEI: MarketArea = { id: "remei-estadi", name: l("Passeig de la Generalitat (Remei-Estadi)", "paseo de la Generalitat (Remei-Estadi)", "Passeig de la Generalitat (Remei-Estadi)") };

const VIC_SOURCES: MarketSource[] = [
  {
    id: "vic-ajuntament",
    name: "Els Mercats setmanals i mensuals",
    publisher: "Ajuntament de Vic",
    url: "https://www.vic.cat/serveis/economia-i-ocupacio/comerc-mercats-consum/copy_of_els-mercats-setmanals-i-mensuals",
    readOn: "2026-11-25",
    quotes: [
      "Actualment Vic compta amb tres mercats setmanals. Se celebren els dimarts, dissabtes i diumenges",
      "El mercat setmanal del dimarts i del dissabte se celebra al centre de la ciutat: plaça Major i rambles. El mercat setmanal del diumenge se celebra al passeig de la Generalitat. En tots dos casos són mercats amb horari de matí",
    ],
  },
  {
    id: "vic-turisme-festes",
    name: "Festes amb obertura comercial (Festes laborals i mercats de marxants 2026)",
    publisher: "Vic Turisme (Ajuntament de Vic)",
    url: "https://www.victurisme.cat/ca/que-s2019hi-pot-fer/comerc-fires-i-mercats/comerc-de-proximitat/festes-amb-obertura-comercial",
    readOn: "2026-11-25",
    quotes: [
      "Tots els dimarts i dissabtes laborals i diumenges, amb les següents excepcions en festiu",
      "Dimarts 8 de desembre: mercat normal. Comerç obert",
      "Dissabte 26 de desembre: canvi de data a Dijous 24 de desembre",
    ],
  },
  {
    id: "vic-turisme-mercats",
    name: "Mercats",
    publisher: "Vic Turisme (Ajuntament de Vic)",
    url: "https://www.victurisme.cat/ca/que-s2019hi-pot-fer/comerc-fires-i-mercats/mercats",
    readOn: "2026-11-25",
    quotes: ["És al Passeig de la Generalitat cada diumenge de 9 a 2h", "Dimarts i dissabte a la plaça Major, rambla del Carme i rambla del Passeig"],
  },
  census("vic-census", "'identificador': '518' Mercat setmanal de Vic (dimarts|dissabte); '519' Mercat setmanal de diumenge de Vic (diumenge)"),
];

const VIC_MEDIEVAL = {
  id: "mercat-medieval",
  name: l("Mercat Medieval de Vic", "Mercado Medieval de Vic", "Vic Medieval Market"),
  from: "2026-12-05",
  to: "2026-12-08",
  hours: l("cada dia de 10 a 20 h", "cada día de 10 a 20 h", "every day, 10:00 to 20:00"),
  url: "https://www.vicfires.cat/mercat-medieval-vic-2026",
  note: l(
    "Fira de Vicfires (Organisme Autònom de Fires i Mercats de l'Ajuntament de Vic), del 5 al 8 de desembre de 2026, amb programa i horari propis. No és el mercat setmanal.",
    "Feria de Vicfires (Organismo Autónomo de Ferias y Mercados del Ayuntamiento de Vic), del 5 al 8 de diciembre de 2026, con programa y horario propios. No es el mercado semanal.",
    "A Vicfires event (the Vic council's fairs and markets body), 5 to 8 December 2026, with its own programme and hours. It is not the weekly market.",
  ),
} as const;

export const VIC: MarketTown = {
  slug: "vic",
  ine: "08298",
  name: l("Vic", "Vic", "Vic"),
  markets: [
    {
      id: "vic-placa-major",
      area: VIC_CENTRE,
      name: l("Mercat de dimarts i dissabte", "Mercado de martes y sábado", "Tuesday and Saturday market"),
      place: l("plaça Major i rambles", "plaza Mayor y ramblas", "Plaça Major and the ramblas"),
      detail: l(
        "plaça Major, rambla del Carme i rambla del Passeig (Vic Turisme)",
        "plaza Mayor, rambla del Carme y rambla del Passeig (Vic Turisme)",
        "Plaça Major, rambla del Carme and rambla del Passeig (Vic Turisme)",
      ),
      days: [2, 6],
      hours: null,
      hoursNote: l(
        "L'Ajuntament només diu «horari de matí» i no en publica l'hora d'inici ni de fi.",
        "El Ayuntamiento solo dice «horario de mañana» y no publica la hora de inicio ni de fin.",
        "The council only says \"morning hours\" and publishes no start or end time.",
      ),
      goods: l("productes de tots els sectors i parades de producte de temporada", "productos de todos los sectores y puestos de producto de temporada", "all kinds of goods and seasonal-produce stalls"),
      src: ["vic-ajuntament", "vic-turisme-mercats", "vic-census"],
      census: { id: "518", day: "dimarts|dissabte" },
    },
    {
      id: "vic-diumenge",
      area: VIC_REMEI,
      name: l("Mercat de diumenge", "Mercado de domingo", "Sunday market"),
      place: l("passeig de la Generalitat, barri del Remei-Estadi", "paseo de la Generalitat, barrio del Remei-Estadi", "Passeig de la Generalitat, Remei-Estadi district"),
      days: [0],
      hours: ["09:00", "14:00"],
      hoursNote: l(
        "Vic Turisme escriu «de 9 a 2h»; l'Ajuntament el defineix com a mercat de matí.",
        "Vic Turisme escribe «de 9 a 2h»; el Ayuntamiento lo define como mercado de mañana.",
        "Vic Turisme writes \"de 9 a 2h\" (9 to 2); the council describes it as a morning market.",
      ),
      goods: l("fruita, verdura i producte fresc, tèxtil i moda", "fruta, verdura y producto fresco, textil y moda", "fruit, vegetables and fresh produce, textiles and fashion"),
      src: ["vic-ajuntament", "vic-turisme-mercats", "vic-census"],
      census: { id: "519", day: "diumenge" },
    },
  ],
  exceptions: [
    // The council's calendar of weekly markets on holidays, 2026 ("Tots els dimarts i dissabtes
    // laborals i diumenges, amb les següents excepcions en festiu"), read 25 Nov 2026 on
    // victurisme.cat. The Tuesday and Saturday holidays of 2026 are all listed (a test holds it).
    {
      id: "vic-2026-01-06",
      markets: ["vic-placa-major"],
      date: "2026-01-06",
      kind: "cancelled",
      note: l("Dimarts 6 de gener: anul·lat.", "Martes 6 de enero: anulado.", "Tuesday 6 January: cancelled."),
      src: "vic-turisme-festes",
      documentRead: false,
    },
    {
      id: "vic-2026-08-15",
      markets: ["vic-placa-major"],
      date: "2026-08-15",
      kind: "normal",
      note: l("Dissabte 15 d'agost: mercat normal.", "Sábado 15 de agosto: mercado normal.", "Saturday 15 August: market as usual."),
      src: "vic-turisme-festes",
      documentRead: false,
    },
    {
      id: "vic-2026-12-08",
      markets: ["vic-placa-major"],
      date: "2026-12-08",
      kind: "normal",
      note: l(
        "Dimarts 8 de desembre, la Immaculada: mercat normal.",
        "Martes 8 de diciembre, la Inmaculada: mercado normal.",
        "Tuesday 8 December, the Immaculate Conception: market as usual.",
      ),
      src: "vic-turisme-festes",
      documentRead: false,
    },
    // «Dissabte 26 de desembre: canvi de data a Dijous 24 de desembre». The council agreement that
    // the plan cites (seuelectronica.vic.cat/siac/Tablon_ver_doc.aspx?id=6234) answered HTTP 404 on
    // 25 Nov 2026 (it is not quoted: it could not be read), so `documentRead` is false and the page
    // asks the reader to confirm with mercats@vic.cat.
    {
      id: "vic-2026-12-26",
      markets: ["vic-placa-major"],
      date: "2026-12-26",
      kind: "moved",
      movedTo: "2026-12-24",
      note: l(
        "Dissabte 26 de desembre, Sant Esteve: el mercat de la plaça Major es trasllada al dijous 24 de desembre.",
        "Sábado 26 de diciembre, San Esteban: el mercado de la plaza Mayor se traslada al jueves 24 de diciembre.",
        "Saturday 26 December, Saint Stephen's Day: the Plaça Major market moves to Thursday 24 December.",
      ),
      src: "vic-turisme-festes",
      documentRead: false,
    },
  ],
  sources: VIC_SOURCES,
  calendarThrough: "2026-12-31",
  noticeUrl: "https://www.victurisme.cat/ca/que-s2019hi-pot-fer/comerc-fires-i-mercats/comerc-de-proximitat/festes-amb-obertura-comercial",
  checked: "2026-11-25",
  related: [VIC_MEDIEVAL],
};

/* -------------------------------------------------------------------------- */
/* Mataró                                                                     */
/* -------------------------------------------------------------------------- */

const MATARO_URL = "https://www.mataro.cat/ca/temes/comerc-mercats-i-fires/mercats/mercats-setmanals/mercats-setmanals";

const area = (id: string, ca: string, es: string, en = ca): MarketArea => ({ id, name: l(ca, es, en) });
const CUBA = area("placa-de-cuba", "Plaça de Cuba", "Plaza de Cuba");
const GRAN = area("placa-gran", "Plaça Gran", "Plaza Gran");
const BOET = area("pla-d-en-boet", "Pla d'en Boet", "Pla d'en Boet");
const CIRERA = area("cirera-molins", "Cirera – Molins", "Cirera – Molins");
const ESCORXADOR = area("l-escorxador", "L'Escorxador", "El Escorxador", "L'Escorxador");
const CERDANYOLA = area("cerdanyola", "Cerdanyola", "Cerdanyola");

const GOODS_FRESH = l("fruita i verdura", "fruta y verdura", "fruit and vegetables");
const GOODS_MIXED = l("equipament de la persona i la llar, i fruita i verdura", "equipamiento personal y del hogar, y fruta y verdura", "clothing and household goods, fruit and vegetables");

const MATARO_SOURCES: MarketSource[] = [
  {
    id: "mataro-ajuntament",
    name: "Mercats setmanals",
    publisher: "Ajuntament de Mataró",
    url: MATARO_URL,
    // The page's own metadata gives "modified 2024-11-21": the hours are the council's standing ones.
    readOn: "2026-11-25",
    quotes: [
      "A Mataró, el dissabte és el dia de mercat per excel·lència, amb sis mercats setmanals en diferents punts de la ciutat.",
      "I el dijous, a la plaça de Cuba, també hi ha un mercat de roba, complements i equipament de la llar.",
      "Polígon Industrial de Pla d’en Boet, dissabtes de 9 a 14 h",
      "Riera de Cirera, dissabtes de 7 a 14 h",
      "Carrer d'Enric Prat de la Riba, dissabtes de 7 a 14 h",
      "Passeig de Ramon Berenguer III, entre l'avinguda de la Gatassa i el passatge de Baldomer Vila, dissabtes de 7 a 14 h: fruita i verdura.",
      "Entorns de la plaça Cuba, dissabtes de 7 a 14 h, fruita i verdura; i dijous, de 9 a 14 h: equipament de la persona i la llar.",
      "Plaça Gran, diari, menys diumenge, de 7 a 14 h: fruita i verdura.",
    ],
  },
  census("mataro-census", "'identificador' 239 Plaça de Cuba (dissabte), 240 Escorxador, 241 Cirera Molins, 242 Cerdanyola, 243 Pla d'en Boet (dissabte), 244 Plaça de Cuba (dijous), 245 Plaça Gran (dilluns-dissabte)"),
];

export const MATARO: MarketTown = {
  slug: "mataro",
  ine: "08121",
  name: l("Mataró", "Mataró", "Mataró"),
  markets: [
    {
      id: "mataro-cuba-dissabte",
      area: CUBA,
      name: l("Plaça de Cuba, dissabte", "Plaza de Cuba, sábado", "Plaça de Cuba, Saturday"),
      place: l("entorns de la plaça de Cuba", "alrededores de la plaza de Cuba", "around Plaça de Cuba"),
      days: [6],
      hours: ["07:00", "14:00"],
      goods: GOODS_FRESH,
      src: ["mataro-ajuntament", "mataro-census"],
      census: { id: "239", day: "dissabte" },
    },
    {
      id: "mataro-cuba-dijous",
      area: CUBA,
      name: l("Plaça de Cuba, dijous", "Plaza de Cuba, jueves", "Plaça de Cuba, Thursday"),
      place: l("entorns de la plaça de Cuba", "alrededores de la plaza de Cuba", "around Plaça de Cuba"),
      days: [4],
      hours: ["09:00", "14:00"],
      goods: l("roba, complements i equipament de la llar", "ropa, complementos y equipamiento del hogar", "clothing, accessories and household goods"),
      src: ["mataro-ajuntament", "mataro-census"],
      census: { id: "244", day: "dijous" },
    },
    {
      id: "mataro-placa-gran",
      area: GRAN,
      name: l("Plaça Gran, de dilluns a dissabte", "Plaza Gran, de lunes a sábado", "Plaça Gran, Monday to Saturday"),
      place: l("plaça Gran", "plaza Gran", "Plaça Gran"),
      days: [1, 2, 3, 4, 5, 6],
      hours: ["07:00", "14:00"],
      goods: GOODS_FRESH,
      src: ["mataro-ajuntament", "mataro-census"],
      census: { id: "245", day: "dilluns-dissabte" },
    },
    {
      id: "mataro-pla-d-en-boet",
      area: BOET,
      name: l("Pla d'en Boet, dissabte", "Pla d'en Boet, sábado", "Pla d'en Boet, Saturday"),
      place: l("polígon industrial de Pla d'en Boet", "polígono industrial de Pla d'en Boet", "Pla d'en Boet industrial estate"),
      days: [6],
      hours: ["09:00", "14:00"],
      goods: GOODS_MIXED,
      src: ["mataro-ajuntament", "mataro-census"],
      census: { id: "243", day: "dissabte" },
    },
    {
      id: "mataro-cirera-molins",
      area: CIRERA,
      name: l("Cirera – Molins, dissabte", "Cirera – Molins, sábado", "Cirera – Molins, Saturday"),
      place: l("riera de Cirera", "riera de Cirera", "Riera de Cirera"),
      days: [6],
      hours: ["07:00", "14:00"],
      goods: GOODS_MIXED,
      src: ["mataro-ajuntament", "mataro-census"],
      census: { id: "241", day: "dissabte" },
    },
    {
      id: "mataro-escorxador",
      area: ESCORXADOR,
      name: l("L'Escorxador, dissabte", "El Escorxador, sábado", "L'Escorxador, Saturday"),
      place: l("carrer d'Enric Prat de la Riba", "calle de Enric Prat de la Riba", "Carrer d'Enric Prat de la Riba"),
      days: [6],
      hours: ["07:00", "14:00"],
      goods: GOODS_MIXED,
      src: ["mataro-ajuntament", "mataro-census"],
      census: { id: "240", day: "dissabte" },
    },
    {
      id: "mataro-cerdanyola",
      area: CERDANYOLA,
      name: l("Cerdanyola, dissabte", "Cerdanyola, sábado", "Cerdanyola, Saturday"),
      place: l(
        "passeig de Ramon Berenguer III, entre l'avinguda de la Gatassa i el passatge de Baldomer Vila",
        "paseo de Ramon Berenguer III, entre la avenida de la Gatassa y el pasaje de Baldomer Vila",
        "Passeig de Ramon Berenguer III, between avinguda de la Gatassa and passatge de Baldomer Vila",
      ),
      days: [6],
      hours: ["07:00", "14:00"],
      goods: GOODS_FRESH,
      src: ["mataro-ajuntament", "mataro-census"],
      census: { id: "242", day: "dissabte" },
    },
  ],
  // The council publishes no calendar of exceptions: nothing is invented. A session on a public
  // holiday is shown as "horari habitual" with the council's page linked (see logic.ts).
  exceptions: [],
  sources: MATARO_SOURCES,
  calendarThrough: null,
  noticeUrl: MATARO_URL,
  checked: "2026-11-25",
  related: [],
};

export const TOWNS: readonly MarketTown[] = [VIC, MATARO];

export function marketTownBySlug(slug: string): MarketTown | null {
  return TOWNS.find((t) => t.slug === slug) ?? null;
}

/** The census page and dataset, for the hub's "other towns" note. */
export const CENSUS_LINKS = { page: CENSUS_PAGE, data: CENSUS_URL, diba: "https://www.diba.cat/es/web/comerc/buscador-de-mercados-de-venda-no-sedentaria-mapa" } as const;

/** The Generalitat figures the hub quotes (CCAM page, read 25 Nov 2026): "560 mercats setmanals repartits en 466 municipis". */
export const CCAM_COUNT = { markets: 560, municipalities: 466, readOn: "2026-11-25" } as const;

/**
 * The public holidays of a town: Catalonia-wide days (the labour calendar),
 * the town's own local days of 2026 (DOGC order) and, until that order is
 * parsed, the days its council approved for 2027.
 */
export function holidayNameFor(slug: string): HolidayName {
  const local = new Set<string>([...(municipalityBySlug(slug)?.local ?? []), ...(councilApproved2027(slug)?.local ?? [])]);
  return (iso) => holidayOn(iso)?.name.ca ?? (local.has(iso) ? "festa local" : null);
}

/** The holiday names in the page's language (the logic only needs to know whether there is one). */
export function holidayNameIn(iso: string, locale: "ca" | "es" | "en"): string | null {
  return holidayOn(iso)?.name[locale] ?? null;
}
