import type { Locale } from "@/lib/i18n/config";
import { FAIRS, familyLastChecked, townBySlug, towns } from "@/lib/programmatic/christmas-fairs/data";
import { fairsHubPath, townPath as fairsTownPath } from "@/lib/programmatic/christmas-fairs/paths";
import { weekendHubPath } from "@/lib/programmatic/weekend/paths";

import { LIGHTS_TOWNS } from "./christmas-lights-towns";

import type { SeasonSpan } from "./christmas-traditions";
import { LOCAL_MONDAY_7 } from "./december-bridge";
import { dateYear, range } from "./festive";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Christmas markets in Catalonia (roadmap P08, backlog #21).
 *
 * Re-checked on 24 October 2026 against each organiser's own page. A 2026 date
 * goes in only when the organiser has published it. For the big markets that
 * have not (Santa Llúcia, Sagrada Família, Girona, Lleida, Manresa,
 * Granollers) the page gives last year's dates only where an official page
 * states them, and always labelled "2025" - never as this year's.
 *
 * Manresa, 30 Oct 2026: web.manresa.cat/web/menu/9216-fira-de-santa-llucia is
 * still headed "SANTA LLÚCIA 2025"; the Generalitat fairs calendar
 * (vm32-przc, row 24032442, updated 25 Sep 2026, re-queried 30 Oct) gives
 * 12-13 Dec 2026, "Plaça Major i Baixada de la Seu", organiser Ajuntament de
 * Manresa, dates not "to be confirmed". The page gives those dates attributed
 * to the calendar, as the Christmas fairs family does (its Manresa page).
 *
 * Verified 2025 facts: Santa Llúcia ran 28 Nov - 23 Dec 2025 with 215 stalls
 * (organiser's "Calendari - 2025" page); Manresa 13-14 Dec 2025; Granollers'
 * five fairs from 21 Nov 2025.
 *
 * Verified 2026 dates: Canyelles (weekend of 21 Nov), Espinelves (28 Nov - 8
 * Dec, 45th), Vic medieval market (5-8 Dec), Garriguella (8 Dec), Altafulla
 * (11-13 Dec), Sant Pere de Vilamajor and Roquetes (12-13 Dec), les Masies de
 * Voltregà (18-20 Dec).
 *
 * Removed on 24 Oct: Santa Margarida i els Monjos (its announcement now
 * returns 404), Sabadell, Terrassa, Tarragona, Reus and Tortosa (no official
 * page found, only aggregators that disagree), and two unsourced claims about
 * when Lleida and the Tarragona cities announced last year's dates.
 *
 * Canyelles is written as "the weekend of 21 November": its second day is a
 * genuine 2026 date that the stale-date guard in
 * tests/christmas-markets.test.ts would otherwise catch.
 *
 * Perennial URL, no year in the slug: the same page serves every December.
 */

// 28 Oct 2026 (research_notes/page1-28oct/ski_christmas.md): every 2026 date
// re-read; Santa Llúcia, Sagrada Família, Girona, Figueres and Lleida still
// unannounced. 30 Oct: Figueres 27 Nov-24 Dec 2026 from the council's call for
// stallholders (figueres.cat/tramits/convocatories/mercatnadal26), newer than
// its standing market page, which still says "Dates a determinar per 2026". Added: Sant Antoni de Vilamajor (28-29 Nov) and Cubelles
// (18-20 Dec), Girona's 2025 dates and its rule tying the start to Black
// Friday, Tarragona's and Reus's 2025 dates from their councils, and
// Barcelona as European Capital of Christmas 2026 (infoBarcelona). The
// Sagrada Família's 2025 dates and the 2025 opening hours stay out: the
// stale-date guard in tests/christmas-markets.test.ts forbids them.
//
// 30 Oct 2026 (top-3 push): firadesantallucia.cat re-read (home and
// calendari.php still show the 2025 calendar, so the Santa Llúcia line now
// says 30 Oct); CA title in the words of "fires de nadal catalunya 2026",
// ES in "mercados navideños cataluña 2026"; descriptions give one official
// 2026 date and say Santa Llúcia has none yet. Other dates not re-read.
//
// 30 Oct 2026, seasonal top-3 push: "fires de nadal catalunya 2026" asks for
// the list, so the ca/es lead, descriptions and first FAQ now open with how
// many fairs have an official date (FAMILY, the same count as the Christmas
// fairs hub, from the Generalitat fairs calendar and the councils) and link
// the hub; a paragraph gives the fairs on the December bridge and on La
// Marató's weekend, with links to both pages. Titles kept.
//
// 3 Nov 2026 (Christmas cluster refresh): the Generalitat's Agenda Cultural
// de Catalunya published the Fira de Santa Llúcia that morning, 27 Nov - 23
// Dec 2026, "de 10 a 21 h", Avinguda de la Catedral, organiser "Associació
// Fira de Santa Llúcia" (SANTA_LLUCIA_2026); firadesantallucia.cat still
// showed 2025. The guide gives those dates and hours attributed to the agenda,
// in the lead, the table, its section, the FAQ, the titles and descriptions.
// Re-read the same day, all unchanged: the Sagrada Família (council page, no
// date), Girona (the yearless rule), Lleida (2025-26 calendar), Figueres
// (call for stallholders 27 Nov - 24 Dec; standing page "Dates a determinar
// per 2026"), Manresa (council page still 2025), Granollers (2025-26),
// Tarragona (council and Mercats de Tarragona, no 2026 date), Reus (press
// notes), Vic (agenda), and the ten councils of the confirmed list (each
// quote still on its page). Sabadell's and Terrassa's sites could not be read
// (login wall, bot challenge); no official 2026 page found for either. Links
// added: Barcelona in December, the Three Kings parade and the fairs family's
// new Barcelona page.
//
// 4 Nov 2026: "I la resta de ciutats?" gains one sentence linking the new
// Christmas lights page (Barcelona and 25 towns; group `llums-nadal-links`).
// No date in it; titles and descriptions untouched (3 Nov window).
const VERIFIED = "2026-11-03";

/** Fairs open on at least one day between `from` and `to`. */
const openBetween = (from: string, to: string) => FAIRS.filter((f) => f.start <= to && f.end >= from).length;

/**
 * The Christmas fairs family's figures when the guide is published, so the
 * guide and the hub (`/ca/fires-de-nadal/`) give the same count.
 */
export const FAMILY = {
  fairs: FAIRS.length,
  towns: towns().length,
  checked: familyLastChecked(),
  /** Saturday 5 to Tuesday 8 December 2026. */
  bridge: openBetween("2026-12-05", "2026-12-08"),
  /** 12 and 13 December 2026, La Marató's weekend. */
  maratoWeekend: openBetween("2026-12-12", "2026-12-13"),
} as const;

/**
 * Last year's Fira de Santa Llúcia, from the organiser's "Calendari - 2025"
 * page (the market table below prints the same days). Always shown with its
 * year; the 2026 dates go in ANNOUNCED_TRADITIONS when they are published.
 */
export const SANTA_LLUCIA_2025 = {
  from: "2025-11-28",
  to: "2025-12-23",
  url: "https://firadesantallucia.cat/calendari.php",
} as const;

/**
 * This year's Fira de Santa Llúcia, as the Generalitat's Agenda Cultural de
 * Catalunya published it on 3 Nov 2026 (activity 2026110300020, also open
 * data rhpv-yr4f): "Inici: 27/11/2026 Fi: 23/12/2026 Horari: de 10 a 21 h",
 * "Avinguda de la Catedral", "Organitzador: Associació Fira de Santa Llúcia".
 * The organiser's own site still showed 2025 that day, so every sentence
 * attributes the dates to the agenda. christmas-traditions.ts's
 * ANNOUNCED_TRADITIONS.santaLlucia is this object (the December hub reads it
 * from there). When firadesantallucia.cat publishes, re-read it: if it agrees,
 * switch `url` to its calendar and drop `via`.
 */
export const SANTA_LLUCIA_2026: SeasonSpan = {
  from: "2026-11-27",
  to: "2026-12-23",
  url: "https://agenda.cultura.gencat.cat/ca/activitat.html/2026110300020",
  via: "agenda",
  hours: { open: "10:00", close: "21:00" },
  read: "2026-11-03",
};

/** "de 10 a 21 h" / "de 10 a 21 h" / "10:00 to 21:00". */
export function hoursText(hours: { open: string; close: string }, locale: Locale): string {
  if (locale === "en") return `${hours.open} to ${hours.close}`;
  const h = (t: string) => (t.endsWith(":00") ? String(Number(t.slice(0, 2))) : `${Number(t.slice(0, 2))}.${t.slice(3)}`);
  return `de ${h(hours.open)} a ${h(hours.close)} h`;
}

const SL = SANTA_LLUCIA_2026;
const SL_HOURS = SL.hours!;
/** "del 27 de novembre al 23 de desembre de 2026" / "27 November to 23 December 2026". */
const slRange = (locale: Locale) => range(SL.from, SL.to, locale);
/** "Del 27 de novembre al 23 de desembre de 2026, de 10 a 21 h". */
const slWhen = (locale: Locale) => {
  const r = slRange(locale);
  return `${r.charAt(0).toUpperCase()}${r.slice(1)}, ${hoursText(SL_HOURS, locale)}`;
};
const SL_SOURCE: Record<Locale, string> = {
  ca: `l'[Agenda Cultural de la Generalitat](${SL.url})`,
  es: `la [Agenda Cultural de la Generalitat](${SL.url})`,
  en: `the [Catalan government's cultural agenda](${SL.url})`,
};
/** The fairs family's Barcelona page exists only while Barcelona has a dated fair in the snapshot. */
const BCN_FAIRS = townBySlug("barcelona");
const bcnFairsLink = (locale: Locale, label: string) => (BCN_FAIRS ? `[${label}](${fairsTownPath(locale, "barcelona")})` : label);

const SOURCES: B2Source[] = [
  { name: "Agenda Cultural de Catalunya: Fira de Santa Llúcia a l'Avinguda de la Catedral de Barcelona (2026)", url: SANTA_LLUCIA_2026.url, publisher: "Departament de Cultura, Generalitat de Catalunya" },
  { name: "Fira de Santa Llúcia", url: "https://www.barcelona.cat/culturapopular/ca/festes-i-tradicions/fires/fira-de-santa-llucia", publisher: "Ajuntament de Barcelona" },
  { name: "Fira de Nadal de la Sagrada Família", url: "https://www.barcelona.cat/culturapopular/ca/festes-i-tradicions/fires/fira-de-nadal-de-la-sagrada-familia", publisher: "Ajuntament de Barcelona" },
  { name: "Nadal a Barcelona", url: "https://www.barcelona.cat/nadal/ca", publisher: "Ajuntament de Barcelona" },
  { name: "Fira de Santa Llúcia: calendari 2025", url: "https://firadesantallucia.cat/calendari.php", publisher: "Associació Fira de Santa Llúcia" },
  { name: "Fira de Santa Llúcia", url: "https://firadesantallucia.cat/", publisher: "Associació Fira de Santa Llúcia" },
  { name: "Mercat de Nadal", url: "https://www.figueres.cat/figueres/fires-i-mercats/mercat-de-nadal-1", publisher: "Ajuntament de Figueres" },
  { name: "Convocatòria Mercat de Nadal 2026 (27 de novembre - 24 de desembre)", url: "https://www.figueres.cat/tramits/convocatories/mercatnadal26", publisher: "Ajuntament de Figueres" },
  { name: "Mercat de Nadal", url: "https://comercmercatsconsum.paeria.cat/comerc-i-mercats/mercats-ambulants/mercat-de-nadal", publisher: "Paeria de Lleida" },
  { name: "Fira de Santa Llúcia", url: "https://web.manresa.cat/web/menu/9216-fira-de-santa-llucia", publisher: "Ajuntament de Manresa" },
  { name: "Calendari fires de Catalunya (fires i fires mercat)", url: "https://analisi.transparenciacatalunya.cat/d/vm32-przc", publisher: "Departament d'Empresa i Treball, Generalitat de Catalunya" },
  { name: "Fires de Nadal", url: "https://www.granollers.cat/nadal/fires-de-nadal", publisher: "Ajuntament de Granollers" },
  { name: "45a Fira de l'Avet 2026", url: "https://espinelves.cat/%f0%9f%8c%b2fira-de-lavet-2025-sollicituds-i-reglament-de-participacio/", publisher: "Ajuntament d'Espinelves" },
  { name: "La Fira de Santa Llúcia", url: "https://www.canyelles.cat/promocio-economica-i-turisme/la-fira-de-santa-llucia", publisher: "Ajuntament de Canyelles" },
  { name: "Mercat Medieval Vic 2026", url: "https://www.vic.cat/ciutat/agenda/mercat-medieval-vic-2026", publisher: "Ajuntament de Vic" },
  { name: "6è Mercat de Nadal de Garriguella", url: "https://garriguella.cat/obertes-les-inscripcions-per-participar-en-el-6e-mercat-de-nadal-de-garriguella/", publisher: "Ajuntament de Garriguella" },
  { name: "Fira de Nadal 2026", url: "https://altafulla.cat/noticies/l-ajuntament-d-altafulla-obre-les-inscripcions-per-participar-en-la-fira-de-nadal-2026_1589", publisher: "Ajuntament d'Altafulla" },
  { name: "4a Fira de Nadal Vila Claus", url: "https://www.vilamajor.cat/actualitat/noticies/ja-es-poden-sollicitar-parades-per-a-la-4a-fira-de-nadal-vila-claus-2026.html", publisher: "Ajuntament de Sant Pere de Vilamajor" },
  { name: "32a Fira de Nadal de Roquetes", url: "https://roquetes.cat/web/obertes-les-inscripcions-per-participar-a-la-32a-fira-de-nadal-de-roquetes-%F0%9F%8E%84/", publisher: "Ajuntament de Roquetes" },
  { name: "Mercat de Nadal", url: "https://www.lesmasiesdevoltrega.cat/actualitat/noticies/obertes-les-inscripcions-per-participar-en-el-mercat-de-nadal-de-les-masies-de-voltrega.html", publisher: "Ajuntament de les Masies de Voltregà" },
  { name: "1a Fira «Un Nadal com cal»", url: "https://www.santantonidevilamajor.cat/actualitat/noticies/busquem-artesanses-i-creadorses-per-omplir-de-magia-la-1a-fira-un-nadal-com-cal-de-sant-antoni-de-vilamajor.html", publisher: "Ajuntament de Sant Antoni de Vilamajor" },
  { name: "Cubelles recupera la Fira de Nadal", url: "https://www.cubelles.cat/cubelles-facil/promocio-economica/cubelles-recupera-la-fira-de-nadal-amb-un-format-renovat-inspirat-en-els-mercats-nadalencs-tradicionals.html", publisher: "Ajuntament de Cubelles" },
  { name: "Mercat de Nadal a la plaça de la Independència", url: "https://web.girona.cat/comerc/firesimercatsalcarrer/permisos/nadalplindependencia", publisher: "Ajuntament de Girona" },
  { name: "La Rambla Nova, a punt per les fires de Nadal i d'artesania (2025)", url: "https://www.tarragona.cat/comerc/noticies/la-rambla-nova-a-punt-per-les-fires-de-nadal-i-dartesania-1", publisher: "Ajuntament de Tarragona" },
  { name: "Reus té a punt la campanya de Nadal 2025-2026", url: "https://www.reus.cat/noticia/reus-te-punt-la-campanya-de-nadal-2025-2026", publisher: "Ajuntament de Reus" },
  { name: "Barcelona, Capital Europea del Nadal 2026", url: "https://www.barcelona.cat/infobarcelona/en/barcelona-capital-europea-de-nadal-2026_1579437.html", publisher: "Ajuntament de Barcelona" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "tradicions/mercats-de-nadal-catalunya",
    title: "Fires i mercats de Nadal a Catalunya 2026: Fira de Santa Llúcia, dates i llocs",
    seoTitle: "Fires i mercats de Nadal Catalunya 2026: dates, Santa Llúcia",
    seoDescription: `Fires de Nadal Catalunya 2026: ${FAMILY.fairs} amb data oficial. Santa Llúcia (Barcelona): ${slRange("ca")}, ${hoursText(SL_HOURS, "ca")}.`,
    excerpt:
      "Els mercats de Nadal de Catalunya el 2026: quines dates han confirmat els organitzadors, quines eren les del 2025 i on es fa cada fira.",
  },
  es: {
    path: "tradiciones/mercados-navidad-cataluna",
    title: "Mercados navideños en Cataluña 2026: Fira de Santa Llúcia, fechas y lugares",
    seoTitle: "Mercados navideños Cataluña 2026: fechas y Santa Llúcia",
    seoDescription: `Mercados navideños Cataluña 2026: ${FAMILY.fairs} con fecha oficial. Santa Llúcia (Barcelona): ${slRange("es")}, ${hoursText(SL_HOURS, "es")}.`,
    excerpt:
      "Los mercados de Navidad de Cataluña en 2026: qué fechas han confirmado los organizadores, cuáles fueron las de 2025 y dónde se hace cada feria.",
  },
  en: {
    path: "traditions/christmas-markets-catalonia",
    title: "Christmas markets in Barcelona and Catalonia 2026: dates and places",
    seoTitle: "Barcelona Christmas markets 2026: Santa Llúcia from 27 Nov",
    seoDescription:
      "Fira de Santa Llúcia 2026: 27 Nov–23 Dec, 10:00–21:00, by Barcelona Cathedral. Sagrada Família fair: dates not out yet. Every Catalan market with dates.",
    excerpt:
      "Christmas markets in Barcelona and Catalonia in 2026: the dates organisers have confirmed, last year's dates for the rest, and where each one is held.",
  },
};

type Row = [market: string, town: string, where: string, dates: string];

/** The main markets. "Where" only when an official page states it; 2025 dates always labelled. */
const MARKETS: Record<Locale, Row[]> = {
  ca: [
    ["Fira de Santa Llúcia", "Barcelona", "Pla de la Seu i avinguda de la Catedral", `**${slWhen("ca")}**, segons l'Agenda Cultural de la Generalitat`],
    ["Fira de Nadal de la Sagrada Família", "Barcelona", "Plaça de la Sagrada Família", "Pendent. Sol començar a finals de novembre o principis de desembre"],
    ["Fira de l'Avet (45a)", "Espinelves", "—", "**Del 28 de novembre al 8 de desembre de 2026**"],
    ["Mercat de Nadal", "Girona", "Plaça de la Independència", "Pendent. El 2025: del 28 de novembre de 2025 al 5 de gener de 2026"],
    ["Mercat de Nadal", "Figueres", "La Rambla", "Del 27 de novembre al 24 de desembre de 2026"],
    ["Mercat de Nadal", "Lleida", "Plaça de la Catedral i voltants", "Pendent"],
    ["Fira de Santa Llúcia", "Manresa", "Plaça Major i Baixada de la Seu", "12 i 13 de desembre de 2026, segons el calendari de fires de la Generalitat (l'Ajuntament encara mostra el 2025)"],
    ["Fires de Nadal", "Granollers", "Porxada, Corona i Barangé (2025)", "Pendent. El 2025: des del 21 de novembre"],
  ],
  es: [
    ["Fira de Santa Llúcia", "Barcelona", "Pla de la Seu y avenida de la Catedral", `**${slWhen("es")}**, según la Agenda Cultural de la Generalitat`],
    ["Fira de Nadal de la Sagrada Família", "Barcelona", "Plaza de la Sagrada Família", "Pendiente. Suele empezar a finales de noviembre o principios de diciembre"],
    ["Fira de l'Avet (45.ª)", "Espinelves", "—", "**Del 28 de noviembre al 8 de diciembre de 2026**"],
    ["Mercat de Nadal", "Girona", "Plaza de la Independència", "Pendiente. En 2025: del 28 de noviembre de 2025 al 5 de enero de 2026"],
    ["Mercat de Nadal", "Figueres", "La Rambla", "Del 27 de noviembre al 24 de diciembre de 2026"],
    ["Mercat de Nadal", "Lleida", "Plaza de la Catedral y alrededores", "Pendiente"],
    ["Fira de Santa Llúcia", "Manresa", "Plaza Major y Baixada de la Seu", "12 y 13 de diciembre de 2026, según el calendario de ferias de la Generalitat (el Ayuntamiento aún muestra 2025)"],
    ["Ferias de Navidad", "Granollers", "Porxada, Corona y Barangé (2025)", "Pendiente. En 2025: desde el 21 de noviembre"],
  ],
  en: [
    ["Fira de Santa Llúcia", "Barcelona", "Pla de la Seu and Avinguda de la Catedral", `**${slWhen("en")}**, according to the Catalan government's cultural agenda`],
    ["Sagrada Família Christmas Fair", "Barcelona", "Plaça de la Sagrada Família", "Not yet published. Usually opens late November or early December"],
    ["Fir Tree Fair (45th)", "Espinelves", "—", "**28 November to 8 December 2026**"],
    ["Christmas market", "Girona", "Plaça de la Independència", "Not yet published. In 2025: 28 November 2025 to 5 January 2026"],
    ["Christmas market", "Figueres", "La Rambla", "27 November to 24 December 2026"],
    ["Christmas market", "Lleida", "Plaça de la Catedral and around", "Not yet published"],
    ["Fira de Santa Llúcia", "Manresa", "Plaça Major and Baixada de la Seu", "12 and 13 December 2026, according to the Catalan government's fairs calendar (the council's page still shows 2025)"],
    ["Christmas fairs", "Granollers", "Porxada, Corona and Barangé squares (2025)", "Not yet published. In 2025: from 21 November"],
  ],
};

const HEADERS: Record<Locale, string[]> = {
  ca: ["Mercat", "Població", "On", "Dates del 2026"],
  es: ["Mercado", "Población", "Dónde", "Fechas de 2026"],
  en: ["Market", "Town", "Where", "2026 dates"],
};

function marketTable(locale: Locale) {
  const caption: Record<Locale, string> = {
    ca: "Els grans mercats de Nadal de Catalunya i les seves dates",
    es: "Los grandes mercados de Navidad de Cataluña y sus fechas",
    en: "The main Christmas markets in Catalonia and their dates",
  };
  const note: Record<Locale, string> = {
    ca: `«Pendent» vol dir que l'organitzador encara no ha publicat les dates del 2026; les del 2025 surten de la seva pàgina oficial i poden canviar. «On» només quan una pàgina oficial ho diu. Comprovat el ${dateYear(VERIFIED, "ca")}; Santa Llúcia, a l'Agenda Cultural de la Generalitat (el web de la fira encara mostra el 2025), i Manresa, al calendari oficial de fires de la Generalitat.`,
    es: `«Pendiente» significa que el organizador aún no ha publicado las fechas de 2026; las de 2025 salen de su página oficial y pueden cambiar. «Dónde» solo cuando una página oficial lo dice. Comprobado el ${dateYear(VERIFIED, "es")}; Santa Llúcia, en la Agenda Cultural de la Generalitat (la web de la feria aún muestra 2025), y Manresa, en el calendario oficial de ferias de la Generalitat.`,
    en: `"Not yet published" means the organiser has not announced its 2026 dates; the 2025 dates come from its official page and may change. "Where" only when an official page says so. Checked on ${dateYear(VERIFIED, "en")}; Santa Llúcia in the Catalan government's cultural agenda (the fair's own website still shows 2025), and Manresa in the Catalan government's official fairs calendar.`,
  };
  return table(caption[locale], HEADERS[locale], MARKETS[locale], note[locale]);
}

/** Smaller fairs whose 2026 dates their council has published, in date order. */
const CONFIRMED: Record<Locale, string[]> = {
  ca: [
    "**Canyelles** (Garraf): 24a Fira de Santa Llúcia, el cap de setmana del 21 de novembre.",
    "**Espinelves** (Osona): 45a Fira de l'Avet, del 28 de novembre al 8 de desembre.",
    "**Sant Antoni de Vilamajor** (Vallès Oriental): 1a fira «Un Nadal com cal», dissabte 28 i diumenge 29 de novembre, a la plaça de la Vila.",
    "**Garriguella** (Alt Empordà): 6è Mercat de Nadal, dimarts 8 de desembre, de 9 a 14 h, a la plaça de l'Església.",
    "**Altafulla** (Tarragonès): Fira de Nadal, l'11, el 12 i el 13 de desembre, a les places de l'Església i del Pou.",
    "**Sant Pere de Vilamajor** (Vallès Oriental): 4a Fira de Nadal Vila Claus, el 12 i el 13 de desembre, al parc de la Rectoria.",
    "**Roquetes** (Baix Ebre): 32a Fira de Nadal, el 12 i el 13 de desembre, al passeig Ramon Bosch i Rosell i la plaça dels Països Catalans.",
    "**Cubelles** (Garraf): Fira de Nadal, el 18, el 19 i el 20 de desembre.",
    "**Les Masies de Voltregà** (Osona): Mercat de Nadal, el 18, el 19 i el 20 de desembre.",
  ],
  es: [
    "**Canyelles** (Garraf): 24.ª Fira de Santa Llúcia, el fin de semana del 21 de noviembre.",
    "**Espinelves** (Osona): 45.ª Fira de l'Avet (feria del abeto), del 28 de noviembre al 8 de diciembre.",
    "**Sant Antoni de Vilamajor** (Vallès Oriental): 1.ª feria «Un Nadal com cal», sábado 28 y domingo 29 de noviembre, en la plaza de la Vila.",
    "**Garriguella** (Alt Empordà): 6.º Mercat de Nadal, martes 8 de diciembre, de 9 a 14 h, en la plaza de l'Església.",
    "**Altafulla** (Tarragonès): Fira de Nadal, el 11, el 12 y el 13 de diciembre, en las plazas de l'Església y del Pou.",
    "**Sant Pere de Vilamajor** (Vallès Oriental): 4.ª Fira de Nadal Vila Claus, el 12 y el 13 de diciembre, en el parque de la Rectoria.",
    "**Roquetes** (Baix Ebre): 32.ª Fira de Nadal, el 12 y el 13 de diciembre, en el paseo Ramon Bosch i Rosell y la plaza dels Països Catalans.",
    "**Cubelles** (Garraf): Fira de Nadal, el 18, el 19 y el 20 de diciembre.",
    "**Les Masies de Voltregà** (Osona): Mercat de Nadal, el 18, el 19 y el 20 de diciembre.",
  ],
  en: [
    "**Canyelles** (Garraf): 24th Fira de Santa Llúcia, the weekend of 21 November.",
    "**Espinelves** (Osona): 45th Fir Tree Fair (Fira de l'Avet), 28 November to 8 December.",
    "**Sant Antoni de Vilamajor** (Vallès Oriental): first 'Un Nadal com cal' fair, Saturday 28 and Sunday 29 November, on Plaça de la Vila.",
    "**Garriguella** (Alt Empordà): 6th Christmas market, Tuesday 8 December, 9:00 to 14:00, on Plaça de l'Església.",
    "**Altafulla** (Tarragonès): Christmas fair, 11, 12 and 13 December, on the squares of l'Església and del Pou.",
    "**Sant Pere de Vilamajor** (Vallès Oriental): 4th Vila Claus Christmas fair, 12 and 13 December, in the Rectoria park.",
    "**Roquetes** (Baix Ebre): 32nd Christmas fair, 12 and 13 December, on Passeig Ramon Bosch i Rosell and Plaça dels Països Catalans.",
    "**Cubelles** (Garraf): Christmas fair, 18, 19 and 20 December.",
    "**Les Masies de Voltregà** (Osona): Christmas market, 18, 19 and 20 December.",
  ],
};

/** The opening sentence: how many fairs have an official date, and where the list is. */
function countSentence(locale: Locale): string {
  const checked = dateYear(FAMILY.checked, locale);
  return {
    ca: `**${FAMILY.fairs} fires i mercats de Nadal de Catalunya ja tenen data oficial per al 2026**, a ${FAMILY.towns} municipis, segons el calendari oficial de fires de la Generalitat i els ajuntaments (revisat el ${checked}); són totes, poble a poble, a [fires de Nadal per municipi](${fairsHubPath("ca")}).`,
    es: `**${FAMILY.fairs} ferias y mercados de Navidad de Cataluña ya tienen fecha oficial para 2026**, en ${FAMILY.towns} municipios, según el calendario oficial de ferias de la Generalitat y los ayuntamientos (revisado el ${checked}); están todas, pueblo a pueblo, en [ferias de Navidad por municipio](${fairsHubPath("es")}).`,
    en: `**${FAMILY.fairs} Christmas markets and fairs in Catalonia already have an official 2026 date**, in ${FAMILY.towns} towns, according to the Catalan government's official fairs calendar and the town councils (checked on ${checked}); they are all, town by town, in [Christmas markets by town](${fairsHubPath("en")}).`,
  }[locale];
}

/** The fairs on the December bridge and on La Marató's weekend, with both pages linked. */
function busyWeekends(locale: Locale): string {
  return {
    ca: `**Pel pont de desembre**, del dissabte 5 al dimarts 8, hi ha ${FAMILY.bridge} fires de Nadal amb data oficial, i el **cap de setmana del 12 i 13 de desembre**, el de ${b2link("marato", "ca", "La Marató de TV3")}, n'hi ha ${FAMILY.maratoWeekend}. Quins dies són festius aquell pont, a ${b2link("decemberBridge", "ca", "el pont de desembre del 2026")}.`,
    es: `**En el puente de diciembre**, del sábado 5 al martes 8, hay ${FAMILY.bridge} ferias de Navidad con fecha oficial, y el **fin de semana del 12 y 13 de diciembre**, el de ${b2link("marato", "es", "La Marató de TV3")}, hay ${FAMILY.maratoWeekend}. Qué días son festivos ese puente, en ${b2link("decemberBridge", "es", "el puente de diciembre de 2026")}.`,
    en: `**Over the December long weekend**, Saturday 5 to Tuesday 8, ${FAMILY.bridge} Christmas fairs have official dates, and on the **weekend of 12 and 13 December**, ${b2link("marato", "en", "La Marató")}'s weekend, ${FAMILY.maratoWeekend} do. Which days are holidays that weekend: ${b2link("decemberBridge", "en", "the December 2026 long weekend")}.`,
  }[locale];
}

function body(locale: Locale) {
  if (locale === "ca") {
    return [
      lead(
        `${countSentence("ca")} La **Fira de Santa Llúcia 2026** de Barcelona es fa **${slRange("ca")}, ${hoursText(SL_HOURS, "ca")}**, davant de la Catedral, segons ${SL_SOURCE.ca}. La de la **Sagrada Família** encara no té dates. Entre les altres, la **Fira de l'Avet d'Espinelves** va del 28 de novembre al 8 de desembre de 2026.`,
      ),
      callout(
        "info",
        "Com llegir aquesta pàgina",
        "Només hi posem una data del 2026 quan l'organitzador o l'administració l'ha publicada. Per als grans mercats que encara no ho han fet, donem la del 2025 i ho diem clarament. Les dates de Santa Llúcia surten de l'Agenda Cultural de la Generalitat, que dona l'Associació Fira de Santa Llúcia com a organitzadora: el web de la fira encara mostra el calendari del 2025. L'Ajuntament de Barcelona diu que actualitzarà el seu web de Nadal cap al novembre del 2026; aquí ho afegim el dia que surti.",
      ),
      marketTable("ca"),
      ...h2("Mercats de Nadal amb dates del 2026 confirmades", "Aquestes fires ja tenen dates oficials del 2026, publicades pels seus ajuntaments:"),
      list(...CONFIRMED.ca),
      ...paras(
        "També al desembre, tot i que no és un mercat de Nadal: el **Mercat Medieval de Vic** ocupa el centre històric de la ciutat del 5 al 8 de desembre de 2026, segons l'agenda de l'Ajuntament de Vic.",
        `Totes les fires de Nadal amb data oficial, municipi per municipi i amb el lloc i com arribar-hi, són a [fires de Nadal per municipi](${fairsHubPath("ca")}).`,
        busyWeekends("ca"),
      ),
      ...h2(
        "Fira de Santa Llúcia 2026: quan i on",
        "Segons l'Ajuntament de Barcelona, «des del 1786 es fa, al davant de la Catedral, la Fira de Santa Llúcia, una de les més populars de la ciutat». Les parades omplen el pla de la Seu i l'avinguda de la Catedral, s'hi instal·len a final de novembre o principi de desembre, **sempre abans del dia 13, Santa Llúcia**, i s'hi queden durant els dies de Nadal.",
        `**El 2026 es fa ${slRange("ca")}, ${hoursText(SL_HOURS, "ca")}**, a l'avinguda de la Catedral, segons ${SL_SOURCE.ca}, que en dona com a organitzadora l'Associació Fira de Santa Llúcia i hi descriu més de 160 parades de productes estrictament nadalencs, com pessebres, figuretes, molsa i arbres de Nadal, i desenes més d'artesania i regals. El web de l'associació encara mostra el calendari del 2025 (${dateYear(VERIFIED, "ca")}). La fitxa de la fira, amb com arribar-hi i quins dies són festius, és a ${bcnFairsLink("ca", "fires de Nadal a Barcelona")}.`,
        `L'edició del 2025 va anar del 28 de novembre fins al 23 de desembre, amb 215 parades, segons l'Associació Fira de Santa Llúcia, que l'organitza i publica el calendari al seu web. És la fira on Barcelona compra el pessebre: figures, molsa, avets i herbes, a més d'artesania i regals. Per veure'n un de vivent, mira ${b2link("pessebres", "ca", "el calendari de pessebres vivents")}.`,
      ),
      ...h2(
        "Fira de Nadal de la Sagrada Família",
        "Es fa a la plaça de la Sagrada Família des del 1962 i té un centenar de parades en quatre sectors: arbres i plantes, pessebres i decoració (caganers i tions inclosos), alimentació i regals. L'organitza l'Associació d'Artesans i Firaires Nadalencs de la Sagrada Família.",
        `Segons l'Ajuntament, comença a la darreria de novembre o principi de desembre i es pot visitar fins als dies de Nadal. Les dates del 2026 encara no s'han anunciat (comprovat el ${dateYear(VERIFIED, "ca")}).`,
      ),
      ...h2(
        "Mercats de Nadal de Girona, Figueres i Lleida",
        `**Girona** fa el seu Mercat de Nadal a la plaça de la Independència. El 2025 va anar del 28 de novembre de 2025 al 5 de gener de 2026, i l'Ajuntament lliga la data d'inici al dia oficial del Black Friday. Si hi vas des de Barcelona, mira ${b2link("girona", "ca", "com anar a Girona en tren")}.`,
        `**Figueres** el fa a la Rambla, amb casetes de fusta, avets, plantes i productes agroalimentaris; segons la convocatòria de l'Ajuntament per als paradistes, el 2026 es fa del 27 de novembre al 24 de desembre. Per combinar-ho amb el museu, ${b2link("figueres", "ca", "Figueres i el Teatre-Museu Dalí")}.`,
        "**Lleida** instal·la el Mercat de Nadal a la plaça de la Catedral i voltants; la Paeria encara no n'ha publicat el calendari del 2026.",
      ),
      ...h2(
        "Manresa i Granollers",
        `**Manresa** fa la Fira de Santa Llúcia, on l'Ajuntament diu que es troben «els elements imprescindibles per preparar Nadal». Segons el calendari de fires de la Generalitat, el 2026 es fa el 12 i el 13 de desembre a la plaça Major i la Baixada de la Seu; la pàgina de l'Ajuntament encara és la del 2025, quan es va fer el dissabte 13 de desembre a la Baixada de la Seu i el diumenge 14 a la plaça Major. Més detalls a [fires de Nadal de Manresa](${fairsTownPath("ca", "manresa")}).`,
        "**Granollers** en fa diverses: el 2025 hi va haver la parada de plantes i arbres de Nadal des del 21 de novembre, la fira de pessebres i ornamentació a la plaça de la Porxada, la fira d'artesania a la plaça Barangé i dos mercats de cap de setmana.",
      ),
      ...h2(
        "I la resta de ciutats?",
        `A **Tarragona**, el 2025 la Fira de Nadal va ser del 4 al 24 de desembre a la Rambla Nova, i a **Reus** el Mercat de Nadal, del 30 de novembre al 23 de desembre a la plaça del Mercadal; cap de les dues ciutats no ha publicat encara les dates del 2026. Sabadell, Terrassa, Tortosa i molts altres municipis també munten fires a l'Advent, però no n'hem trobat cap pàgina oficial amb dates del 2026; les webs d'agenda es contradiuen entre elles. Consulta l'agenda de l'ajuntament abans d'anar-hi. Si vas a Tarragona en tren, ${b2link("tarragona", "ca", "Tarragona des de Barcelona")}.`,
        `Quan i on s'encenen els llums de Nadal a Barcelona i a ${LIGHTS_TOWNS.length} municipis més, de Girona a Tortosa, amb la data del 2026 de cada ajuntament quan ja l'ha publicada, ho trobaràs a ${b2link("christmasLights", "ca", "l'encesa de llums de Nadal 2026")}.`,
      ),
      ...h2(
        "Abans d'anar-hi",
        `Els organitzadors canvien dates i emplaçaments d'un any a l'altre: comprova-ho al seu web el dia que hi vagis. Si vas a comprar un diumenge o festiu de desembre, mira ${b2link("shops", "ca", "quins dies poden obrir les botigues")}: el 2026 ho poden fer els diumenges 6, 13, 20 i 27 de desembre i el dimarts 8. Per als ponts, ${b2link("workCalendar", "ca", "el calendari de festius")}.`,
        `Per a la resta del Nadal a la ciutat, mira ${b2link("christmasBarcelona", "ca", "l'encesa de llums de Nadal a Barcelona")}, amb el pessebre de Sant Jaume i què obre els festius, i tot el mes dia a dia a ${b2link("barcelonaDecember", "ca", "Barcelona al desembre del 2026")}. Per al 5 de gener, ${b2link("reis", "ca", "la Cavalcada de Reis 2027")}.`,
        `Per saber quines fires i mercats hi ha cada cap de setmana a la teva zona, segons el calendari oficial de fires, mira [les fires i mercats d'aquest cap de setmana](${weekendHubPath("ca")}).`,
      ),
      faq([
        {
          question: "Quines fires de Nadal hi ha a Catalunya el 2026?",
          answer: `A ${dateYear(FAMILY.checked, "ca")}, ${FAMILY.fairs} fires i mercats de Nadal tenen data oficial del 2026, a ${FAMILY.towns} municipis: entre d'altres, la Fira de Santa Llúcia de Barcelona (${slRange("ca")}), la Fira de l'Avet d'Espinelves (del 28 de novembre al 8 de desembre), el Mercat de Nadal de Figueres (del 27 de novembre al 24 de desembre) i la Fira de Santa Llúcia de Manresa (12 i 13 de desembre). La llista completa és a la pàgina de fires de Nadal per municipi. La Fira de Nadal de la Sagrada Família encara no té dates.`,
        },
        {
          question: "Quan és la Fira de Santa Llúcia 2026?",
          answer: `${slWhen("ca")}, a l'avinguda de la Catedral de Barcelona, segons l'Agenda Cultural de la Generalitat. El 2025 va obrir el 28 de novembre i va tancar el 23 de desembre.`,
        },
        {
          question: "Quin horari té la Fira de Santa Llúcia?",
          answer: `El 2026, ${hoursText(SL_HOURS, "ca")}, segons l'Agenda Cultural de la Generalitat. Abans d'anar-hi, mira el web de l'Associació Fira de Santa Llúcia, que l'organitza.`,
        },
        {
          question: "On es fa la Fira de Santa Llúcia?",
          answer: "Davant de la Catedral de Barcelona, al pla de la Seu i l'avinguda de la Catedral, on es fa des del 1786.",
        },
        {
          question: "Quines fires de Nadal hi ha pel pont de desembre?",
          answer: `Del dissabte 5 al dimarts 8 de desembre de 2026 hi ha ${FAMILY.bridge} fires de Nadal amb data oficial, com la Fira de l'Avet d'Espinelves, que s'acaba el dia 8, i el Mercat de Nadal de Garriguella, el mateix dimarts 8. L'únic festiu a tot Catalunya és el dimarts 8; el dilluns 7 només ho és en ${LOCAL_MONDAY_7.municipalities} municipis.`,
        },
        {
          question: "Quins dies obren les botigues al desembre del 2026?",
          answer: "A Barcelona i a la majoria de municipis, els diumenges 6, 13, 20 i 27 de desembre i el dimarts 8 de desembre. El 25 i el 26 de desembre tanquen.",
        },
      ]),
      ...paras(verifiedLine("ca", VERIFIED)),
      ...b2Related(["christmasBarcelona", "christmasTraditions", "pessebres", "newYear", "shops"], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        `${countSentence("es")} La **Fira de Santa Llúcia 2026** de Barcelona se celebra **${slRange("es")}, ${hoursText(SL_HOURS, "es")}**, frente a la Catedral, según ${SL_SOURCE.es}. La de la **Sagrada Família** aún no tiene fechas. Entre las demás, la **Fira de l'Avet de Espinelves** va del 28 de noviembre al 8 de diciembre de 2026.`,
      ),
      callout(
        "info",
        "Cómo leer esta página",
        "Solo ponemos una fecha de 2026 cuando el organizador o la administración la ha publicado. Para los grandes mercados que aún no lo han hecho, damos la de 2025 y lo decimos claramente. Las fechas de Santa Llúcia salen de la Agenda Cultural de la Generalitat, que da como organizadora a la Associació Fira de Santa Llúcia: la web de la feria aún muestra el calendario de 2025. El Ayuntamiento de Barcelona dice que actualizará su web de Navidad hacia noviembre de 2026; aquí lo añadimos el día que salga.",
      ),
      marketTable("es"),
      ...h2("Mercados de Navidad con fechas de 2026 confirmadas", "Estas ferias ya tienen fechas oficiales de 2026, publicadas por sus ayuntamientos:"),
      list(...CONFIRMED.es),
      ...paras(
        "También en diciembre, aunque no es un mercado de Navidad: el **Mercat Medieval de Vic** ocupa el centro histórico de la ciudad del 5 al 8 de diciembre de 2026, según la agenda del Ayuntamiento de Vic.",
        `Todas las ferias de Navidad con fecha oficial, municipio por municipio y con el lugar y cómo llegar, están en [ferias de Navidad por municipio](${fairsHubPath("es")}).`,
        busyWeekends("es"),
      ),
      ...h2(
        "Fira de Santa Llúcia 2026: cuándo y dónde",
        "Según el Ayuntamiento de Barcelona, desde 1786 se celebra frente a la Catedral y es una de las ferias más populares de la ciudad. Los puestos llenan el pla de la Seu y la avenida de la Catedral, se instalan a finales de noviembre o principios de diciembre, **siempre antes del día 13, Santa Llúcia**, y se quedan durante los días de Navidad.",
        `**En 2026 se celebra ${slRange("es")}, ${hoursText(SL_HOURS, "es")}**, en la avenida de la Catedral, según ${SL_SOURCE.es}, que da como organizadora a la Associació Fira de Santa Llúcia y describe más de 160 puestos de productos estrictamente navideños, como belenes, figuritas, musgo y árboles de Navidad, y decenas más de artesanía y regalos. La web de la asociación aún muestra el calendario de 2025 (${dateYear(VERIFIED, "es")}). La ficha de la feria, con cómo llegar y qué días son festivos, está en ${bcnFairsLink("es", "ferias de Navidad en Barcelona")}.`,
        `La edición de 2025 fue del 28 de noviembre hasta el 23 de diciembre, con 215 puestos, según la Associació Fira de Santa Llúcia, que la organiza y publica el calendario en su web. Es la feria donde Barcelona compra el belén: figuras, musgo, abetos y hierbas, además de artesanía y regalos. Para ver uno viviente, mira ${b2link("pessebres", "es", "el calendario de belenes vivientes")}.`,
      ),
      ...h2(
        "Fira de Nadal de la Sagrada Família",
        "Se celebra en la plaza de la Sagrada Família desde 1962 y tiene un centenar de puestos en cuatro sectores: árboles y plantas, belenes y decoración (caganers y tiós incluidos), alimentación y regalos. La organiza la Associació d'Artesans i Firaires Nadalencs de la Sagrada Família.",
        `Según el Ayuntamiento, empieza a finales de noviembre o principios de diciembre y se puede visitar hasta los días de Navidad. Las fechas de 2026 aún no se han anunciado (comprobado el ${dateYear(VERIFIED, "es")}).`,
      ),
      ...h2(
        "Mercados de Navidad de Girona, Figueres y Lleida",
        `**Girona** celebra su Mercat de Nadal en la plaza de la Independència. En 2025 fue del 28 de noviembre de 2025 al 5 de enero de 2026, y el Ayuntamiento liga la fecha de inicio al día oficial del Black Friday. Si vas desde Barcelona, mira ${b2link("girona", "es", "cómo ir a Girona en tren")}.`,
        `**Figueres** lo hace en la Rambla, con casetas de madera, abetos, plantas y productos agroalimentarios; según la convocatoria del Ayuntamiento para los paradistas, en 2026 se celebra del 27 de noviembre al 24 de diciembre. Para combinarlo con el museo, ${b2link("figueres", "es", "Figueres y el Teatro-Museo Dalí")}.`,
        "**Lleida** instala el Mercat de Nadal en la plaza de la Catedral y alrededores; la Paeria aún no ha publicado el calendario de 2026.",
      ),
      ...h2(
        "Manresa y Granollers",
        `**Manresa** celebra la Fira de Santa Llúcia, donde el Ayuntamiento dice que se encuentra lo imprescindible para preparar la Navidad. Según el calendario de ferias de la Generalitat, en 2026 se celebra el 12 y el 13 de diciembre en la plaza Major y la Baixada de la Seu; la página del Ayuntamiento aún es la de 2025, cuando se hizo el sábado 13 de diciembre en la Baixada de la Seu y el domingo 14 en la plaza Major. Más detalles en [ferias de Navidad de Manresa](${fairsTownPath("es", "manresa")}).`,
        "**Granollers** organiza varias: en 2025 hubo el puesto de plantas y árboles de Navidad desde el 21 de noviembre, la feria de belenes y ornamentación en la plaza de la Porxada, la feria de artesanía en la plaza Barangé y dos mercados de fin de semana.",
      ),
      ...h2(
        "¿Y el resto de ciudades?",
        `En **Tarragona**, en 2025 la Fira de Nadal fue del 4 al 24 de diciembre en la Rambla Nova, y en **Reus** el Mercat de Nadal, del 30 de noviembre al 23 de diciembre en la plaza del Mercadal; ninguna de las dos ciudades ha publicado aún las fechas de 2026. Sabadell, Terrassa, Tortosa y muchos otros municipios también montan ferias en Adviento, pero no hemos encontrado ninguna página oficial con fechas de 2026; las webs de agenda se contradicen entre sí. Consulta la agenda del ayuntamiento antes de ir. Si vas a Tarragona en tren, ${b2link("tarragona", "es", "Tarragona desde Barcelona")}.`,
        `Cuándo y dónde se encienden las luces de Navidad en Barcelona y en ${LIGHTS_TOWNS.length} municipios más, de Girona a Tortosa, con la fecha de 2026 de cada ayuntamiento cuando ya la ha publicado, lo encontrarás en ${b2link("christmasLights", "es", "el encendido de luces de Navidad 2026")}.`,
      ),
      ...h2(
        "Antes de ir",
        `Los organizadores cambian fechas y emplazamientos de un año a otro: compruébalo en su web el día que vayas. Si vas a comprar un domingo o festivo de diciembre, mira ${b2link("shops", "es", "qué días pueden abrir las tiendas")}: en 2026 pueden hacerlo los domingos 6, 13, 20 y 27 de diciembre y el martes 8. Para los puentes, ${b2link("workCalendar", "es", "el calendario de festivos")}.`,
        `Para el resto de la Navidad en la ciudad, mira ${b2link("christmasBarcelona", "es", "el encendido de luces de Navidad en Barcelona")}, con el belén de Sant Jaume y qué abre los festivos, y todo el mes día a día en ${b2link("barcelonaDecember", "es", "Barcelona en diciembre de 2026")}. Para el 5 de enero, ${b2link("reis", "es", "la Cabalgata de Reyes 2027")}.`,
        `Para saber qué ferias y mercados hay cada fin de semana en tu zona, según el calendario oficial de ferias, mira [las ferias y mercados de este fin de semana](${weekendHubPath("es")}).`,
      ),
      faq([
        {
          question: "¿Qué ferias de Navidad hay en Cataluña en 2026?",
          answer: `A ${dateYear(FAMILY.checked, "es")}, ${FAMILY.fairs} ferias y mercados de Navidad tienen fecha oficial de 2026, en ${FAMILY.towns} municipios: entre otros, la Fira de Santa Llúcia de Barcelona (${slRange("es")}), la Fira de l'Avet de Espinelves (del 28 de noviembre al 8 de diciembre), el Mercat de Nadal de Figueres (del 27 de noviembre al 24 de diciembre) y la Fira de Santa Llúcia de Manresa (12 y 13 de diciembre). La lista completa está en la página de ferias de Navidad por municipio. La Fira de Nadal de la Sagrada Família aún no tiene fechas.`,
        },
        {
          question: "¿Cuándo es la Fira de Santa Llúcia 2026?",
          answer: `${slWhen("es")}, en la avenida de la Catedral de Barcelona, según la Agenda Cultural de la Generalitat. En 2025 abrió el 28 de noviembre y cerró el 23 de diciembre.`,
        },
        {
          question: "¿Qué horario tiene la Fira de Santa Llúcia?",
          answer: `En 2026, ${hoursText(SL_HOURS, "es")}, según la Agenda Cultural de la Generalitat. Antes de ir, mira la web de la Associació Fira de Santa Llúcia, que la organiza.`,
        },
        {
          question: "¿Dónde se celebra la Fira de Santa Llúcia?",
          answer: "Frente a la Catedral de Barcelona, en el pla de la Seu y la avenida de la Catedral, donde se celebra desde 1786.",
        },
        {
          question: "¿Qué ferias de Navidad hay en el puente de diciembre?",
          answer: `Del sábado 5 al martes 8 de diciembre de 2026 hay ${FAMILY.bridge} ferias de Navidad con fecha oficial, como la Fira de l'Avet de Espinelves, que acaba el día 8, y el Mercat de Nadal de Garriguella, el mismo martes 8. El único festivo en toda Cataluña es el martes 8; el lunes 7 solo lo es en ${LOCAL_MONDAY_7.municipalities} municipios.`,
        },
        {
          question: "¿Qué días abren las tiendas en diciembre de 2026?",
          answer: "En Barcelona y en la mayoría de municipios, los domingos 6, 13, 20 y 27 de diciembre y el martes 8 de diciembre. El 25 y el 26 de diciembre cierran.",
        },
      ]),
      ...paras(verifiedLine("es", VERIFIED)),
      ...b2Related(["christmasBarcelona", "christmasTraditions", "pessebres", "newYear", "shops"], "es"),
    ];
  }

  return [
    lead(
      `Barcelona's Christmas market is the **Fira de Santa Llúcia**, in front of the Cathedral, and **the 2026 fair runs from ${slRange("en")}, ${hoursText(SL_HOURS, "en")}**, according to ${SL_SOURCE.en}. The city's second fair, at the **Sagrada Família**, has not announced its dates yet. Elsewhere in Catalonia, the **Espinelves Fir Tree Fair** runs from 28 November to 8 December 2026, and Barcelona is this year's **European Capital of Christmas**, according to the City Council.`,
    ),
    callout(
      "info",
      "How to read this page",
      "We give a 2026 date only once the organiser or an official body has published it. For the big markets that have not, we give the 2025 dates and say so. The Santa Llúcia dates come from the Catalan government's cultural agenda, which names the Associació Fira de Santa Llúcia as the organiser; the fair's own website still shows its 2025 calendar. Barcelona City Council says it will update its Christmas website around November 2026; we add each date the day it appears.",
    ),
    marketTable("en"),
    ...h2("Christmas markets with confirmed 2026 dates", "These fairs already have official 2026 dates, published by their town councils:"),
    list(...CONFIRMED.en),
    ...paras(
      "Also in December, though not a Christmas market: **Vic's Medieval Market** fills the historic centre from 5 to 8 December 2026, according to Vic City Council's events listing.",
      `Every Christmas market in Catalonia with official dates, town by town, with the place and how to get there, is in [Christmas markets by town](${fairsHubPath("en")}): ${FAMILY.fairs} of them in ${FAMILY.towns} towns as of ${dateYear(FAMILY.checked, "en")}.`,
      busyWeekends("en"),
    ),
    ...h2(
      "Fira de Santa Llúcia 2026: when and where",
      "According to Barcelona City Council, the fair has been held in front of the Cathedral since 1786 and is one of the most popular in the city. Its stalls fill the Pla de la Seu and Avinguda de la Catedral; they set up at the end of November or the start of December, **always before 13 December, Santa Llúcia's day**, and stay through the Christmas days.",
      `**In 2026 it runs from ${slRange("en")}, ${hoursText(SL_HOURS, "en")}**, on Avinguda de la Catedral, according to ${SL_SOURCE.en}, which names the Associació Fira de Santa Llúcia as the organiser and describes more than 160 stalls selling strictly Christmas goods, such as nativity scenes, figurines, moss and Christmas trees, plus dozens more for crafts and gifts. The association's own website still showed its 2025 calendar on ${dateYear(VERIFIED, "en")}. Getting there and the holidays on those days: ${bcnFairsLink("en", "Christmas markets in Barcelona")}.`,
      `The 2025 edition ran from 28 November until 23 December, with 215 stalls, according to the Associació Fira de Santa Llúcia, which runs it and publishes the calendar on its website. It is where Barcelona buys its nativity scene: figures, moss, fir trees and greenery, as well as crafts and gifts. For a living one, see ${b2link("pessebres", "en", "the living nativity calendar")}.`,
    ),
    ...h2(
      "Sagrada Família Christmas Fair",
      "Held on Plaça de la Sagrada Família since 1962, it has about a hundred stalls in four sections: trees and plants, nativity scenes and decorations (caganers and tiós included), food, and gifts. It is run by the Associació d'Artesans i Firaires Nadalencs de la Sagrada Família.",
      `According to the City Council, it starts at the end of November or early December and runs until the Christmas days. The 2026 dates have not been announced (checked on ${dateYear(VERIFIED, "en")}).`,
    ),
    ...h2(
      "Christmas markets in Girona, Figueres and Lleida",
      `**Girona** holds its Christmas market on Plaça de la Independència. In 2025 it ran from 28 November 2025 to 5 January 2026, and the council ties its opening day to the official Black Friday. From Barcelona, see ${b2link("girona", "en", "Girona by train")}.`,
      `**Figueres** holds it on La Rambla, in wooden huts selling Christmas items, food, plants and fir trees; the council's call for stallholders gives 27 November to 24 December 2026. To combine it with the museum, see ${b2link("figueres", "en", "Figueres and the Dalí Theatre-Museum")}.`,
      "**Lleida** sets up its Christmas market on Plaça de la Catedral and the streets around it; the city has not yet published its 2026 calendar.",
    ),
    ...h2(
      "Manresa and Granollers",
      "**Manresa** holds a Fira de Santa Llúcia, which the council describes as the place to find what you need to prepare for Christmas. According to the Catalan government's fairs calendar, the 2026 fair is on 12 and 13 December on Plaça Major and the Baixada de la Seu; the council's own page still shows 2025, when it was held on Saturday 13 December on the Baixada de la Seu and on Sunday 14 December on Plaça Major.",
      "**Granollers** runs several: in 2025 there was a Christmas tree and plant stall from 21 November, a nativity and decorations fair on Plaça de la Porxada, a craft fair on Plaça Barangé and two weekend markets.",
    ),
    ...h2(
      "What about other towns?",
      `In **Tarragona** the 2025 Christmas fair ran from 4 to 24 December on the Rambla Nova, and in **Reus** the Christmas market from 30 November to 23 December on Plaça del Mercadal; neither city has published its 2026 dates yet. Sabadell, Terrassa, Tortosa and many other towns also hold Advent fairs, but we have found no official page with 2026 dates, and listing sites contradict each other. Check the council's events page before you go. By train to Tarragona, see ${b2link("tarragona", "en", "Tarragona from Barcelona")}.`,
      `When and where the Christmas lights are switched on in Barcelona and ${LIGHTS_TOWNS.length} other towns, from Girona to Tortosa, with each council's 2026 date once it is published, is in ${b2link("christmasLights", "en", "our Christmas lights switch-on guide")}.`,
    ),
    ...h2(
      "Before you go",
      `Organisers change dates and venues from year to year, so check their website for your day. If you plan to shop on a December Sunday or holiday, see ${b2link("shops", "en", "which days shops may open")}: in 2026 they may open on Sundays 6, 13, 20 and 27 December and on Tuesday 8 December. For long weekends, ${b2link("workCalendar", "en", "the public holiday calendar")}.`,
      `For the rest of Christmas in the city, see ${b2link("christmasBarcelona", "en", "the Barcelona Christmas lights switch-on")}, with the Plaça Sant Jaume nativity scene and what is open on the holidays, and the whole month day by day in ${b2link("barcelonaDecember", "en", "Barcelona in December 2026")}. For 5 January, ${b2link("reis", "en", "the 2027 Three Kings parade")}.`,
    ),
    faq([
      {
        question: "When is the Fira de Santa Llúcia 2026?",
        answer: `${slWhen("en")}, on Avinguda de la Catedral in Barcelona, according to the Catalan government's cultural agenda. In 2025 it opened on 28 November and closed on 23 December.`,
      },
      {
        question: "What are the Santa Llúcia Christmas market's opening hours?",
        answer: `In 2026, ${hoursText(SL_HOURS, "en")}, according to the Catalan government's cultural agenda. Check the Associació Fira de Santa Llúcia's website, which runs the fair, before you go.`,
      },
      {
        question: "Where is the Christmas market in Barcelona?",
        answer:
          "The oldest, the Fira de Santa Llúcia, is in front of Barcelona Cathedral (Pla de la Seu and Avinguda de la Catedral), where it has been held since 1786. The second is the Sagrada Família Christmas Fair, on Plaça de la Sagrada Família.",
      },
      {
        question: "Which Christmas markets have confirmed 2026 dates?",
        answer: `As of ${dateYear(FAMILY.checked, "en")}, ${FAMILY.fairs} Christmas markets and fairs in ${FAMILY.towns} towns have official 2026 dates, among them Barcelona's Fira de Santa Llúcia (${slRange("en")}), the Espinelves Fir Tree Fair (28 November to 8 December), Figueres's Christmas market (27 November to 24 December) and Manresa's Fira de Santa Llúcia (12 and 13 December). The full list is on the Christmas markets by town page. The Sagrada Família Christmas Fair has not announced its dates yet.`,
      },
      {
        question: "Is Barcelona the European Capital of Christmas 2026?",
        answer: "Yes. The City Council announced in December 2025 that Barcelona had been named European Capital of Christmas 2026. Its Christmas website says it will be updated around November 2026 with this year's programme.",
      },
      {
        question: "Are shops open on Sundays in December 2026?",
        answer: "In Barcelona and most towns, shops may open on Sundays 6, 13, 20 and 27 December and on Tuesday 8 December. They are closed on 25 and 26 December.",
      },
    ]),
    ...paras(verifiedLine("en", VERIFIED)),
    ...b2Related(["christmasBarcelona", "christmasTraditions", "pessebres", "newYear", "shops"], "en"),
  ];
}

export const CHRISTMAS: B2Article = {
  key: "christmas",
  entryKey: "guide-christmas-markets-catalonia",
  categoryKey: "festivals",
  sources: SOURCES,
  heroKey: "mercats-nadal-santa-llucia-nit",
  heroAlt: {
    ca: "Parades de la Fira de Santa Llúcia il·luminades de nit davant la Catedral de Barcelona",
    es: "Puestos de la Fira de Santa Llúcia iluminados de noche ante la catedral de Barcelona",
    en: "Fira de Santa Llúcia stalls lit up at night by Barcelona Cathedral",
  },
  heroCaption: {
    ca: "La Fira de Santa Llúcia, davant de la Catedral de Barcelona.",
    es: "La Fira de Santa Llúcia, frente a la Catedral de Barcelona.",
    en: "The Fira de Santa Llúcia, in front of Barcelona Cathedral.",
  },
  secondaryKey: "mercats-nadal-santa-llucia-figures",
  secondaryAlt: {
    ca: "Prestatges amb figures de pessebre i escenaris de molsa en una parada de la Fira de Santa Llúcia",
    es: "Estanterías con figuras de belén y escenarios de musgo en un puesto de la Fira de Santa Llúcia",
    en: "Shelves of nativity figures and moss scenery on a Fira de Santa Llúcia stall",
  },
  secondaryCaption: {
    ca: "Figures de pessebre a la Fira de Santa Llúcia.",
    es: "Figuras de belén en la Fira de Santa Llúcia.",
    en: "Nativity figures at the Fira de Santa Llúcia.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-11-10T09:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};
