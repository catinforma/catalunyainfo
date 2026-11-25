import type { Block } from "@/lib/content/blocks";
import { WEEKDAY_NAMES, holidayOn, shortDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import { CATALONIA_HOLIDAYS } from "@/lib/content/holidays/payload";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { agendaPageUrl } from "@/lib/content/pessebres/agenda";

import { FESTA_2027 } from "./calcots";
import { CARNIVAL } from "./carnival";
import { CLIMATE, climateMonth, monthAnchor } from "./climate";
import { SUN_SOURCES, SUN_VERIFIED, daylightText, sunMonth } from "./climate-months";
import { ANNOUNCED_2027 } from "./reis";
import { OPENING_2027 } from "./shops";
import { B2_PATHS, b2Related, b2link, b2href, callout, faq, keyFacts, lead, list, table, verifiedLine, type B2Article, type B2Source } from "./shared";

/**
 * "Barcelona in January and February 2027" (25 Nov 2026), ticket O9 of the
 * 25 Nov opportunities list: no page for visitors in the two coldest months
 * ("barcelona weather january" 984 impressions at position 9.1, "barcelona in
 * december" 124 at 6.0; the UK, Germany and France are the biggest English
 * audiences in GA4).
 *
 * ONE guide for both months, not two. Reasons: the dated facts that exist
 * today for each month are few (January: two holidays, one opening Sunday,
 * the Three Kings and Sant Antoni; February: Carnival, Santa Eulàlia and the
 * calçot season) and they share the same weather, sales and transport
 * answers; two pages would repeat those and each would be thin. The month
 * H2s carry their own anchors (#january, #february) and the weather table has
 * a row per month. The path has no year, so next winter rolls onto it.
 *
 * Every date comes from a module that holds its source, never typed twice:
 * 1 and 6 January from CATALONIA_HOLIDAYS (Ordre EMT/52/2026), the opening
 * Sundays from OPENING_2027 (Ordre EMT/89/2026), Carnival from CARNIVAL, the
 * Valls calçotada from FESTA_2027, weather from the climate guide's AEMET
 * tables, sunrise/sunset from the IGN table (climate-months.ts).
 *
 * Read on 25 Nov 2026 (curl, 18:35-18:55 CET):
 *  - Ajuntament de Barcelona, Cultura Popular, "Tres Tombs de Barcelona"
 *    (barcelona.cat/culturapopular/ca/festes-i-tradicions/tres-tombs-de-barcelona):
 *    "Diada: 17 de gener" and «La cavalcada dels Tres Tombs de Barcelona se
 *    celebra el dissabte següent a la festivitat de Sant Antoni Abat. I si
 *    aquesta data s'escau en dissabte, s'ajorna a la setmana sobre.» 17 January
 *    2027 is a Sunday, so by the council's own rule the parade is Saturday 23
 *    January. The page gives no 2027 programme: the page says "by that rule".
 *  - Same site, "Festes de Santa Eulàlia" (.../festes-de-santa-eulalia): "Diada:
 *    12 de febrer", celebrated "pels volts del 12 de febrer". The festival's own
 *    site (barcelona.cat/santaeulalia/ca) is still the 2026 edition: «Del 12 al
 *    15 de febrer», "El dijous 12 de febrer ... sortida de les Laies". No 2027
 *    programme, so none is printed; the 2026 dates are labelled 2026.
 *  - Generalitat's cultural agenda (open data rhpv-yr4f, Socrata), Barcelona
 *    rows dated 1 Jan-28 Feb 2027: the four in AGENDA, each page returned 200.
 *    No prices.
 *  - Our passes guide (barcelona-practical.ts, 25 Nov): neither ATM nor TMB had
 *    published the 2027 fares.
 *  - Barcelona's 2027 shop-opening days (Resolució of the Generalitat) are not
 *    published (shops guide, 25 Nov).
 *
 * HOW TO UPDATE (the page is rewritten, not patched, from `rollBy`): when
 * Barcelona's council publishes the Santa Eulàlia 2027 programme, the Tres
 * Tombs date, the Carnival programme (PROGRAMMES_2027.barcelona) or its shop
 * days, add them to the day-by-day table, move BARCELONA_WINTER.asOf, test and
 * republish `barcelona-gener-febrer`.
 */
export const BARCELONA_WINTER = {
  asOf: "2026-11-25",
  /** First re-read: Barcelona's 2027 shop days, the Santa Eulàlia and Carnival programmes, 2027 fares. */
  rereadBy: "2026-12-22",
  /** The page speaks of 1 and 3 January as ahead of us: rewrite it from this day. */
  rollBy: "2027-01-04",
  read: { councilCulture: "2026-11-25T18:45+01:00", santaEulalia: "2026-11-25T18:40+01:00", agenda: "2026-11-25T18:55+01:00" },
  newYear: "2027-01-01",
  reis: "2027-01-06",
  reisEve: "2027-01-05",
  /** Sant Antoni Abat's day, per the council's page (a Sunday in 2027). */
  santAntoni: "2027-01-17",
  /** The council's rule: the Saturday after the saint's day, unless that day is itself a Saturday. */
  tresTombs: "2027-01-23",
  santaEulalia: "2027-02-12",
  santaEulalia2026: { from: "2026-02-12", to: "2026-02-15" },
  url: {
    tresTombs: "https://www.barcelona.cat/culturapopular/ca/festes-i-tradicions/tres-tombs-de-barcelona",
    santaEulalia: "https://www.barcelona.cat/culturapopular/ca/festes-i-tradicions/festes-de-santa-eulalia",
    santaEulaliaFestes: "https://www.barcelona.cat/santaeulalia/ca",
    agenda: "https://analisi.transparenciacatalunya.cat/d/rhpv-yr4f",
    order2027: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1045357&type=01&language=ca_ES",
    holidays2027: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1040896&type=01&language=ca_ES",
    retailLaw: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11320",
    calendarBcn: "https://ajuntament.barcelona.cat/calendarifestius/ca/",
    visitSitges: "https://www.visitsitges.com/en/agenda/carnaval-de-sitges-2027/",
  },
} as const;

const W = BARCELONA_WINTER;

/** Barcelona's activities in the Generalitat's cultural agenda dated in January-February 2027, read 25 Nov 2026. */
export const AGENDA: readonly { codi: string; name: string; venue: string; from: string; to?: string; time?: string; extra?: string }[] = [
  { codi: "20260402103", name: "Gran Gala Flamenc", venue: "Palau de la Música Catalana", from: "2027-01-01", time: "17:00" },
  { codi: "20260603028", name: "Carmen (Òpera Popular de Barcelona)", venue: "Palau de la Música Catalana", from: "2027-01-15", time: "20:00" },
  { codi: "2026092800011", name: "Penny Siopis. Tinta, sang i història", venue: "Museu Tàpies", from: "2027-01-21", to: "2027-06-20" },
  { codi: "20260603029", name: "Carmen (Òpera Popular de Barcelona)", venue: "Palau de la Música Catalana", from: "2027-02-26", time: "20:00" },
];

export const BARCELONA_WINTER_SOURCES: B2Source[] = [
  { name: "Ordre EMT/52/2026, calendari oficial de festes laborals a Catalunya per a l'any 2027", url: W.url.holidays2027, publisher: "DOGC", ref: "núm. 9637, 1.4.2026" },
  { name: "Ordre EMT/89/2026, calendari d'obertura comercial en diumenges i festius per al 2027", url: W.url.order2027, publisher: "DOGC", ref: "núm. 9674, 28.5.2026" },
  { name: "Llei 18/2017, de comerç, serveis i fires (text consolidat, article 36)", url: W.url.retailLaw, publisher: "BOE" },
  { name: "Festes estatals i autonòmiques a Catalunya i locals a Barcelona al 2027", url: W.url.calendarBcn, publisher: "Ajuntament de Barcelona" },
  { name: "Tres Tombs de Barcelona (llegit el 25.11.2026)", url: W.url.tresTombs, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Festes de Santa Eulàlia (llegit el 25.11.2026)", url: W.url.santaEulalia, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Santa Eulàlia, programa de l'edició del 2026 (llegit el 25.11.2026)", url: W.url.santaEulaliaFestes, publisher: "Ajuntament de Barcelona" },
  { name: "Agenda cultural de Catalunya (dades obertes, llegit el 25.11.2026)", url: W.url.agenda, publisher: "Departament de Cultura, Generalitat de Catalunya" },
  { name: "Carnaval de Sitges 2027 (llegit el 13.11.2026)", url: W.url.visitSitges, publisher: "VisitSitges" },
  ...CLIMATE.sources.filter((s) => /valoresclimatologicos\?l=0076|X4_2010/.test(s.url)),
  ...SUN_SOURCES.slice(0, 1),
];

/* -------------------------------------------------------------------------- */
/* Wording helpers                                                            */
/* -------------------------------------------------------------------------- */

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const num = (value: number, L: Locale) => (L === "en" ? value.toFixed(1) : value.toFixed(1).replace(".", ","));
const toF = (celsius: number) => Math.round((celsius * 9) / 5 + 32);
const wd = (iso: string, L: Locale) => WEEKDAY_NAMES[L][weekdayIndex(iso)]!;
/** "Friday 1 January" / "divendres 1 de gener". */
const dd = (iso: string, L: Locale) => `${wd(iso, L)} ${shortDate(iso, L)}`;
/** "Friday 1 January" with a capital, for table cells. */
const ddc = (iso: string, L: Locale) => cap(dd(iso, L));
const range = (from: string, to: string, L: Locale) =>
  ({
    ca: `del ${dd(from, L)} al ${dd(to, L)}`,
    es: `del ${dd(from, L)} al ${dd(to, L)}`,
    en: `${dd(from, L)} to ${dd(to, L)}`,
  })[L];

const holiday = (iso: string, L: Locale) => {
  const h = holidayOn(iso);
  if (!h) throw new Error(`barcelona-winter: ${iso} is not in the Catalonia calendar`);
  return h.name[L];
};

const JAN = climateMonth(0);
const FEB = climateMonth(1);

/** Public holidays of Catalonia in the two months (2027): 1 and 6 January only; a test keeps it so. */
export const WINTER_HOLIDAYS: readonly string[] = CATALONIA_HOLIDAYS.filter((h) => h.date >= "2027-01-01" && h.date <= "2027-02-28").map((h) => h.date);

/** The anchors of the weather guide's two month headings, per language. */
const weatherLink = (L: Locale, i: 0 | 1, label: string) => `[${label}](${b2href("climate", L)}#${monthAnchor(L, i)})`;

const AS_OF: Record<Locale, string> = {
  ca: `llegit el ${shortDate(W.asOf, "ca")} del 2026`,
  es: `leído el ${shortDate(W.asOf, "es")} de 2026`,
  en: `read on ${shortDate(W.asOf, "en")} 2026`,
};

function agendaRows(L: Locale): string[][] {
  const at = (time?: string) => (time ? { ca: ` a les ${time}`, es: ` a las ${time}`, en: ` at ${time}` }[L] : "");
  const note: Record<string, Record<Locale, string>> = {
    "20260402103": { ca: "Espectacle de flamenc, unes 75 minuts sense pausa", es: "Espectáculo de flamenco, unos 75 minutos sin pausa", en: "A flamenco show, about 75 minutes without an interval" },
    "20260603028": { ca: "Òpera de Bizet, unes 150 minuts amb una pausa", es: "Ópera de Bizet, unos 150 minutos con una pausa", en: "Bizet's opera, about 150 minutes with one interval" },
    "2026092800011": { ca: "Exposició; de dimarts a dissabte de 10 a 19 h i diumenge de 10 a 15 h, segons l'agenda", es: "Exposición; de martes a sábado de 10 a 19 h y domingo de 10 a 15 h, según la agenda", en: "Exhibition; Tuesday to Saturday 10:00-19:00 and Sunday 10:00-15:00, according to the agenda" },
    "20260603029": { ca: "Òpera de Bizet, unes 150 minuts amb una pausa", es: "Ópera de Bizet, unos 150 minutos con una pausa", en: "Bizet's opera, about 150 minutes with one interval" },
  };
  return AGENDA.map((a) => {
    const when = a.to
      ? { ca: `Del ${shortDate(a.from, L)} al ${shortDate(a.to, L)} de 2027`, es: `Del ${shortDate(a.from, L)} al ${shortDate(a.to, L)} de 2027`, en: `${shortDate(a.from, L)} to ${shortDate(a.to, L)} 2027` }[L]
      : `${ddc(a.from, L)}${at(a.time)}`;
    const url = agendaPageUrl(a.codi);
    return [`[${a.name}](${url})`, a.venue, when, note[a.codi]![L]];
  });
}

/* -------------------------------------------------------------------------- */
/* The copy                                                                   */
/* -------------------------------------------------------------------------- */

function weatherTableRows(L: Locale): string[][] {
  const row = (name: string, m: ReturnType<typeof climateMonth>, i: 0 | 1) => {
    const s = sunMonth(i);
    const t = (c: number) => (L === "en" ? `${num(c, L)} (${toF(c)})` : num(c, L));
    return [name, t(m.high), t(m.low), `${m.rain}`, num(m.rainDays, L), `${m.sun}`, `${s.sunrise} - ${s.sunset} (${daylightText(i)})`];
  };
  const months = { ca: ["Gener", "Febrer"], es: ["Enero", "Febrero"], en: ["January", "February"] }[L];
  return [row(months[0]!, JAN, 0), row(months[1]!, FEB, 1)];
}

type Copy = {
  lead: string;
  factsTitle: string;
  facts: { label: string; value: string }[];
  holidaysH: string;
  holidays: string[];
  dayTitle: string;
  dayHead: string[];
  dayRows: string[][];
  dayNote: string;
  januaryH: string;
  january: string[];
  februaryH: string;
  february: string[];
  weatherH: string;
  weather: string[];
  weatherTitle: string;
  weatherHead: string[];
  weatherNote: string;
  shopsH: string;
  shops: string[];
  transportH: string;
  transport: string[];
  agendaH: string;
  agendaIntro: string;
  agendaTitle: string;
  agendaHead: string[];
  faqH: string;
  faq: { question: string; answer: string }[];
  calloutTitle: string;
  callout: string;
  pending: string[];
  pendingH: string;
};

function copy(L: Locale): Copy {
  const first = OPENING_2027.general[0];
  const second = OPENING_2027.municipalDefault[0];
  const carn = { from: CARNIVAL.dijousGras, to: CARNIVAL.ashWednesday, sitges: "2027-02-07", extermini: "2027-02-09" };
  const barcelonaReisNull = ANNOUNCED_2027.barcelona === null;
  const link = (key: Parameters<typeof b2link>[0], label: string) => b2link(key, L, label);
  const h = {
    jan: { hi: num(JAN.high, L), lo: num(JAN.low, L) },
    feb: { hi: num(FEB.high, L), lo: num(FEB.low, L) },
  };

  if (L === "ca") {
    return {
      lead: `**Al gener i al febrer del 2027 Barcelona té dos festius, tots dos a la primera setmana: ${dd(W.newYear, L)} (${holiday(W.newYear, L)}) i ${dd(W.reis, L)} (${holiday(W.reis, L)}).** Al febrer no n'hi ha cap. Les botigues poden obrir el ${dd(first, L)}; l'Ajuntament encara no ha publicat els seus dies d'obertura del 2027. L'hivern és suau: màximes mitjanes de ${h.jan.hi} °C al gener i ${h.feb.hi} °C al febrer, mínimes de ${h.jan.lo} i ${h.feb.lo} °C (AEMET, aeroport). El Carnaval va ${range(carn.from, carn.to, L)}.`,
      factsTitle: "Gener i febrer del 2027 a Barcelona, d'un cop d'ull",
      facts: [
        { label: "Festius", value: `${cap(dd(W.newYear, L))} i ${dd(W.reis, L)}; cap al febrer` },
        { label: "Botigues", value: `Poden obrir el ${dd(first, L)}; els dies de Barcelona del 2027 encara no són publicats` },
        { label: "Temps al gener", value: `Màxima ${h.jan.hi} °C, mínima ${h.jan.lo} °C, ${JAN.rain} mm de pluja` },
        { label: "Temps al febrer", value: `Màxima ${h.feb.hi} °C, mínima ${h.feb.lo} °C, ${FEB.rain} mm de pluja` },
        { label: "Llum del dia 15", value: `Gener ${daylightText(0)}; febrer ${daylightText(1)} (IGN)` },
        { label: "Carnaval", value: `${cap(range(carn.from, carn.to, L))}` },
        { label: "Reis", value: `Cavalcada la tarda del ${dd(W.reisEve, L)}${barcelonaReisNull ? "; hora i recorregut de Barcelona encara no anunciats" : ""}` },
        { label: "Santa Eulàlia", value: `Diada el ${dd(W.santaEulalia, L)}; programa del 2027 no publicat` },
        { label: "Tarifes de transport 2027", value: "No publicades a 25 de novembre del 2026" },
      ],
      holidaysH: "Festius i què tanca a Barcelona al gener i al febrer",
      holidays: [
        `Els dos festius són de tot Catalunya (Ordre EMT/52/2026): ${dd(W.newYear, L)}, ${holiday(W.newYear, L)}, i ${dd(W.reis, L)}, ${holiday(W.reis, L)}. El ${dd(W.reisEve, L)}, vigília de Reis, és dia laborable. Barcelona no té cap festa local al gener ni al febrer: les del 2027 són el 17 de maig i el 24 de setembre (calendari de l'Ajuntament). Per a un pont, mira ${link("bridges2027", "ponts i caps de setmana llargs del 2027")}.`,
        `**Botigues.** L'1 i el 6 de gener, les botigues sotmeses a l'horari general han de tancar per llei (Llei 18/2017, article 36.2.d); en queden fora els establiments exclosos de l'horari general, que són a ${link("shops", "botigues obertes en diumenges i festius")}. **Museus i monuments.** Cada un publica els seus horaris de festiu: no hem llegit els de l'1 i el 6 de gener del 2027, així que no els donem; mira el web oficial abans d'anar-hi.`,
      ],
      dayTitle: "Dates clau, gener i febrer del 2027",
      dayHead: ["Dia", "Què és", "Font o estat"],
      dayRows: [
        [ddc(W.newYear, L), `Festiu: ${holiday(W.newYear, L)}. Botigues tancades per llei`, "Ordre EMT/52/2026"],
        [ddc(first, L), "Les botigues poden obrir (calendari general d'obertura comercial)", "Ordre EMT/89/2026, art. 1"],
        [ddc(W.reisEve, L), `Cavalcada de Reis${barcelonaReisNull ? ": hora i recorregut de Barcelona encara no anunciats" : ""}`, "Ajuntament; vegeu la guia de Reis"],
        [ddc(W.reis, L), `Festiu: ${holiday(W.reis, L)}. Botigues tancades per llei`, "Ordre EMT/52/2026"],
        [ddc(second, L), "Dia d'obertura per defecte als municipis que no n'han triat d'altres; Barcelona encara no ha publicat els seus", "Ordre EMT/89/2026, art. 5"],
        [ddc(W.santAntoni, L), "Dia de Sant Antoni Abat (diumenge). Els Tres Tombs de Barcelona són el dissabte següent", "Ajuntament, Cultura Popular"],
        [ddc(W.tresTombs, L), "Tres Tombs de Barcelona, segons la regla de l'Ajuntament; programa del 2027 no publicat", "Ajuntament, Cultura Popular"],
        [ddc(FESTA_2027.date, L), `Gran Festa de la Calçotada de Valls (${FESTA_2027.edition}a edició)`, "Vegeu la guia de calçots"],
        [`${cap(range(carn.from, carn.to, L))}`, "Carnaval; rues de Sitges el diumenge 7 i el dimarts 9", "VisitSitges; vegeu la guia de Carnaval"],
        [ddc(W.santaEulalia, L), "Diada de Santa Eulàlia, patrona de Barcelona; programa del 2027 no publicat", "Ajuntament, Cultura Popular"],
      ],
      dayNote: `Estat ${AS_OF.ca}. Quan l'Ajuntament publiqui un programa, l'afegim a la taula.`,
      januaryH: "Barcelona al gener del 2027",
      january: [
        `**Cap d'Any i Reis.** L'1 de gener és festiu i la Cavalcada de Reis és la tarda del 5 de gener, abans del festiu del 6; l'hora i el recorregut de Barcelona, quan els publiqui l'Ajuntament, són a ${link("reis", "la Cavalcada de Reis 2027")}. El transport de l'1 i el 6 de gener és a ${link("christmasTransport", "el transport de Nadal i Cap d'Any")}.`,
        `**Rebaixes.** La llei no fixa quan comencen: cada botiga ho decideix. El primer diumenge amb botigues obertes és el ${dd(first, L)}. El que diu la llei i els teus drets, a ${link("winterSales", "rebaixes d'hivern 2027 a Catalunya")}.`,
        `**Sant Antoni Abat.** El dia del sant és el 17 de gener, diumenge el 2027. Segons l'Ajuntament, els Tres Tombs de Barcelona se celebren el dissabte següent al dia del sant; amb aquesta regla, el ${dd(W.tresTombs, L)}. L'Ajuntament encara no n'ha publicat el programa del 2027.`,
        `**Calçots.** La Gran Festa de la Calçotada de Valls és el ${dd(FESTA_2027.date, L)}; les dates de la temporada i dels actes, a ${link("calcots", "la guia de calçots")}.`,
      ],
      februaryH: "Barcelona al febrer del 2027",
      february: [
        `**Carnaval.** Va ${range(carn.from, carn.to, L)}. A Sitges, la Rua de la Disbauxa és el diumenge 7 i la Rua de l'Extermini, el dimarts 9 (VisitSitges). A Barcelona, segons l'Ajuntament, les rues se solen fer als barris el dissabte a la tarda; les dates del 2027 no són anunciades. Tots els dies, festes locals i desfilades, a ${link("carnival", "la guia del Carnaval 2027")}.`,
        `**Santa Eulàlia.** El dia de la patrona és el 12 de febrer, divendres el 2027, i les festes se celebren pels volts d'aquesta data. L'Ajuntament encara no ha publicat el programa del 2027; l'edició del 2026 va ser ${range(W.santaEulalia2026.from, W.santaEulalia2026.to, L)} de 2026 (és l'última dada oficial). No és festiu a Barcelona: les escoles i les botigues tenen l'horari habitual.`,
        `**Calçots.** La temporada continua al febrer; vegeu ${link("calcots", "la guia de calçots")}.`,
      ],
      weatherH: "El temps a Barcelona al gener i al febrer",
      weather: [
        `Al gener, l'aeroport té una màxima mitjana de ${h.jan.hi} °C i una mínima de ${h.jan.lo} °C, amb ${JAN.rain} mm de pluja en ${num(JAN.rainDays, L)} dies i ${JAN.sun} hores de sol. Al febrer, ${h.feb.hi} i ${h.feb.lo} °C, ${FEB.rain} mm en ${num(FEB.rainDays, L)} dies i ${FEB.sun} hores de sol. Al centre (el Raval, 2010-2025) són uns ${num(JAN.cityHigh, L)} i ${num(JAN.cityLow, L)} °C al gener i ${num(FEB.cityHigh, L)} i ${num(FEB.cityLow, L)} °C al febrer. Els rècords de fred a l'aeroport són ${num(JAN.recordLow, L)} °C al gener i ${num(FEB.recordLow, L)} °C al febrer.`,
        `Els dies són curts: el dia 15 de gener el sol surt a les ${sunMonth(0).sunrise} i es pon a les ${sunMonth(0).sunset} (${daylightText(0)} de llum); el 15 de febrer, a les ${sunMonth(1).sunrise} i a les ${sunMonth(1).sunset} (${daylightText(1)}). Mes a mes, amb què abrigar-te: ${weatherLink(L, 0, "el temps a Barcelona al gener")} i ${weatherLink(L, 1, "el temps a Barcelona al febrer")}, a la guia ${link("climate", "el temps a Barcelona mes a mes")}.`,
      ],
      weatherTitle: "El temps a Barcelona al gener i al febrer",
      weatherHead: ["Mes", "Màxima °C", "Mínima °C", "Pluja (mm)", "Dies de pluja", "Hores de sol", "Sol el dia 15 (sortida - posta)"],
      weatherNote: `AEMET, Barcelona Aeroport, valors normals 1981-2010; sortida i posta del sol: Instituto Geográfico Nacional, Barcelona 2027, hora oficial (llegit el ${shortDate(SUN_VERIFIED, L)} del 2026).`,
      shopsH: "Botigues, diumenges i rebaixes",
      shops: [
        `El calendari general del 2027 (Ordre EMT/89/2026) deixa obrir el ${dd(first, L)} i, als municipis que no han triat dies propis, el ${dd(second, L)}. La llista de dies de cada municipi, Barcelona inclosa, no és publicada: l'any passat va sortir el 27 de novembre. Poden obrir, no han d'obrir. Tots els dies, a ${link("shops", "botigues obertes en diumenges i festius")}.`,
      ],
      transportH: "Metro i transport",
      transport: [
        `L'horari del metro, dels autobusos i de Rodalies l'1 i el 6 de gener és a ${link("christmasTransport", "el transport de Nadal i Cap d'Any")}; les hores del metro i dels autobusos de nit, a ${link("hours", "horaris del metro")}. Els preus actuals són els del 2026: a 25 de novembre ni l'ATM ni TMB havien publicat les tarifes del 2027. Quina targeta et convé, a ${link("transport", "targetes de transport de Barcelona")}.`,
      ],
      agendaH: "Concerts i exposicions amb data",
      agendaIntro: `Algunes activitats de Barcelona de gener i febrer que ja són a l'agenda cultural de la Generalitat (dades obertes, ${AS_OF.ca}). Preus i entrades, al web de cada organitzador:`,
      agendaTitle: "Activitats de Barcelona a l'agenda cultural, gener i febrer del 2027",
      agendaHead: ["Activitat", "Lloc", "Quan", "Nota"],
      pendingH: "Encara per anunciar",
      pending: [
        "Els dies d'obertura comercial de Barcelona del 2027 (Generalitat)",
        "El programa de Santa Eulàlia del 2027 i el dels Tres Tombs (Ajuntament)",
        "El programa del Carnaval de Barcelona del 2027 (Ajuntament)",
        "L'hora i el recorregut de la Cavalcada de Reis de Barcelona (Ajuntament)",
        "Les tarifes del transport públic del 2027 (ATM)",
      ],
      faqH: "Preguntes freqüents",
      faq: [
        { question: "Quin temps fa a Barcelona al gener?", answer: `Màximes mitjanes de ${h.jan.hi} °C i mínimes de ${h.jan.lo} °C a l'aeroport, amb ${JAN.rain} mm de pluja en ${num(JAN.rainDays, L)} dies i ${JAN.sun} hores de sol (AEMET, 1981-2010). Al febrer, ${h.feb.hi} i ${h.feb.lo} °C.` },
        { question: "Quins festius hi ha a Barcelona al gener i al febrer del 2027?", answer: `Dos: ${dd(W.newYear, L)} (${holiday(W.newYear, L)}) i ${dd(W.reis, L)} (${holiday(W.reis, L)}). Al febrer no hi ha cap festiu, ni de Catalunya ni de Barcelona.` },
        { question: "Obren les botigues l'1 i el 6 de gener?", answer: "Les botigues sotmeses a l'horari general, no: són festius de tancament per llei (Llei 18/2017, article 36.2.d). Els establiments exclosos de l'horari general poden obrir." },
        { question: "Obren les botigues el 3 de gener del 2027?", answer: `Poden obrir: el ${dd(first, L)} és un dels vuit dies del calendari general d'obertura comercial del 2027. Poden, no han de fer-ho.` },
        { question: "Quan és el Carnaval del 2027?", answer: `Va ${range(carn.from, carn.to, L)} (Dijous Gras a Dimecres de Cendra). A Barcelona no és festiu.` },
        { question: "Quan són les festes de Santa Eulàlia del 2027?", answer: `El dia de la patrona és el ${dd(W.santaEulalia, L)}. L'Ajuntament encara no ha publicat el programa del 2027; el 2026 van ser ${range(W.santaEulalia2026.from, W.santaEulalia2026.to, L)} de 2026.` },
        { question: "Quan són els Tres Tombs de Barcelona el 2027?", answer: `L'Ajuntament els situa el dissabte següent a Sant Antoni Abat (17 de gener). El 2027 el 17 és diumenge, així que per aquesta regla és el ${dd(W.tresTombs, L)}; el programa del 2027 no és publicat.` },
        { question: "Fa fred a Barcelona al gener?", answer: `És suau comparat amb el nord d'Europa: ${h.jan.hi} °C de màxima mitjana, però amb nits de ${h.jan.lo} °C. El rècord de fred a l'aeroport al gener és ${num(JAN.recordLow, L)} °C.` },
      ],
      calloutTitle: "Com tractem les dates",
      callout: "Només hi posem una data del 2027 quan l'ha publicada l'administració; quan només tenim la regla (els Tres Tombs) o l'edició d'enguany (Santa Eulàlia), ho diem. Fonts: Ordre EMT/52/2026, Ordre EMT/89/2026, Llei 18/2017, Ajuntament de Barcelona (Cultura Popular), agenda cultural de la Generalitat, AEMET i IGN.",
    };
  }

  if (L === "es") {
    return {
      lead: `**En enero y febrero de 2027 Barcelona tiene dos festivos, los dos en la primera semana: ${dd(W.newYear, L)} (${holiday(W.newYear, L)}) y ${dd(W.reis, L)} (${holiday(W.reis, L)}).** En febrero no hay ninguno. Las tiendas pueden abrir el ${dd(first, L)}; el Ayuntamiento aún no ha publicado sus días de apertura de 2027. El invierno es suave: máximas medias de ${h.jan.hi} °C en enero y ${h.feb.hi} °C en febrero, mínimas de ${h.jan.lo} y ${h.feb.lo} °C (AEMET, aeropuerto). El Carnaval va ${range(carn.from, carn.to, L)}.`,
      factsTitle: "Enero y febrero de 2027 en Barcelona, de un vistazo",
      facts: [
        { label: "Festivos", value: `${cap(dd(W.newYear, L))} y ${dd(W.reis, L)}; ninguno en febrero` },
        { label: "Tiendas", value: `Pueden abrir el ${dd(first, L)}; los días de Barcelona de 2027 aún no están publicados` },
        { label: "Tiempo en enero", value: `Máxima ${h.jan.hi} °C, mínima ${h.jan.lo} °C, ${JAN.rain} mm de lluvia` },
        { label: "Tiempo en febrero", value: `Máxima ${h.feb.hi} °C, mínima ${h.feb.lo} °C, ${FEB.rain} mm de lluvia` },
        { label: "Luz del día 15", value: `Enero ${daylightText(0)}; febrero ${daylightText(1)} (IGN)` },
        { label: "Carnaval", value: `${cap(range(carn.from, carn.to, L))}` },
        { label: "Reyes", value: `Cabalgata la tarde del ${dd(W.reisEve, L)}${barcelonaReisNull ? "; hora y recorrido de Barcelona aún sin anunciar" : ""}` },
        { label: "Santa Eulàlia", value: `Diada el ${dd(W.santaEulalia, L)}; programa de 2027 sin publicar` },
        { label: "Tarifas de transporte 2027", value: "No publicadas a 25 de noviembre de 2026" },
      ],
      holidaysH: "Festivos y qué cierra en Barcelona en enero y febrero",
      holidays: [
        `Los dos festivos son de toda Cataluña (Orden EMT/52/2026): ${dd(W.newYear, L)}, ${holiday(W.newYear, L)}, y ${dd(W.reis, L)}, ${holiday(W.reis, L)}. El ${dd(W.reisEve, L)}, víspera de Reyes, es laborable. Barcelona no tiene fiesta local en enero ni en febrero: las de 2027 son el 17 de mayo y el 24 de septiembre (calendario del Ayuntamiento). Para un puente, mira ${link("bridges2027", "puentes y fines de semana largos de 2027")}.`,
        `**Tiendas.** El 1 y el 6 de enero, las tiendas sometidas al horario general deben cerrar por ley (Ley 18/2017, artículo 36.2.d); quedan fuera los establecimientos excluidos del horario general, que están en ${link("shops", "tiendas abiertas en domingos y festivos")}. **Museos y monumentos.** Cada uno publica sus horarios de festivo: no hemos leído los del 1 y el 6 de enero de 2027, así que no los damos; mira la web oficial antes de ir.`,
      ],
      dayTitle: "Fechas clave, enero y febrero de 2027",
      dayHead: ["Día", "Qué es", "Fuente o estado"],
      dayRows: [
        [ddc(W.newYear, L), `Festivo: ${holiday(W.newYear, L)}. Tiendas cerradas por ley`, "Orden EMT/52/2026"],
        [ddc(first, L), "Las tiendas pueden abrir (calendario general de apertura comercial)", "Orden EMT/89/2026, art. 1"],
        [ddc(W.reisEve, L), `Cabalgata de Reyes${barcelonaReisNull ? ": hora y recorrido de Barcelona aún sin anunciar" : ""}`, "Ayuntamiento; ver la guía de Reyes"],
        [ddc(W.reis, L), `Festivo: ${holiday(W.reis, L)}. Tiendas cerradas por ley`, "Orden EMT/52/2026"],
        [ddc(second, L), "Día de apertura por defecto en los municipios que no han elegido otros; Barcelona aún no ha publicado los suyos", "Orden EMT/89/2026, art. 5"],
        [ddc(W.santAntoni, L), "Día de Sant Antoni Abat (domingo). Los Tres Tombs de Barcelona son el sábado siguiente", "Ayuntamiento, Cultura Popular"],
        [ddc(W.tresTombs, L), "Tres Tombs de Barcelona, según la regla del Ayuntamiento; programa de 2027 sin publicar", "Ayuntamiento, Cultura Popular"],
        [ddc(FESTA_2027.date, L), `Gran Festa de la Calçotada de Valls (${FESTA_2027.edition}.ª edición)`, "Ver la guía de calçots"],
        [`${cap(range(carn.from, carn.to, L))}`, "Carnaval; rúas de Sitges el domingo 7 y el martes 9", "VisitSitges; ver la guía de Carnaval"],
        [ddc(W.santaEulalia, L), "Diada de Santa Eulàlia, patrona de Barcelona; programa de 2027 sin publicar", "Ayuntamiento, Cultura Popular"],
      ],
      dayNote: `Estado ${AS_OF.es}. Cuando el Ayuntamiento publique un programa, lo añadimos a la tabla.`,
      januaryH: "Barcelona en enero de 2027",
      january: [
        `**Año Nuevo y Reyes.** El 1 de enero es festivo y la Cabalgata de Reyes es la tarde del 5 de enero, antes del festivo del 6; la hora y el recorrido de Barcelona, cuando los publique el Ayuntamiento, están en ${link("reis", "la Cabalgata de Reyes 2027")}. El transporte del 1 y el 6 de enero está en ${link("christmasTransport", "el transporte de Navidad y Nochevieja")}.`,
        `**Rebajas.** La ley no fija cuándo empiezan: cada tienda lo decide. El primer domingo con tiendas abiertas es el ${dd(first, L)}. Lo que dice la ley y tus derechos, en ${link("winterSales", "rebajas de enero 2027 en Cataluña")}.`,
        `**Sant Antoni Abat.** El día del santo es el 17 de enero, domingo en 2027. Según el Ayuntamiento, los Tres Tombs de Barcelona se celebran el sábado siguiente al día del santo; con esa regla, el ${dd(W.tresTombs, L)}. El Ayuntamiento aún no ha publicado el programa de 2027.`,
        `**Calçots.** La Gran Festa de la Calçotada de Valls es el ${dd(FESTA_2027.date, L)}; las fechas de la temporada y de los actos, en ${link("calcots", "la guía de calçots")}.`,
      ],
      februaryH: "Barcelona en febrero de 2027",
      february: [
        `**Carnaval.** Va ${range(carn.from, carn.to, L)}. En Sitges, la Rua de la Disbauxa es el domingo 7 y la Rua de l'Extermini, el martes 9 (VisitSitges). En Barcelona, según el Ayuntamiento, las rúas suelen hacerse en los barrios el sábado por la tarde; las fechas de 2027 no están anunciadas. Todos los días, fiestas locales y desfiles, en ${link("carnival", "la guía del Carnaval 2027")}.`,
        `**Santa Eulàlia.** El día de la patrona es el 12 de febrero, viernes en 2027, y las fiestas se celebran en torno a esa fecha. El Ayuntamiento aún no ha publicado el programa de 2027; la edición de 2026 fue ${range(W.santaEulalia2026.from, W.santaEulalia2026.to, L)} de 2026 (es el último dato oficial). No es festivo en Barcelona: colegios y tiendas tienen su horario habitual.`,
        `**Calçots.** La temporada sigue en febrero; mira ${link("calcots", "la guía de calçots")}.`,
      ],
      weatherH: "El tiempo en Barcelona en enero y febrero",
      weather: [
        `En enero, el aeropuerto tiene una máxima media de ${h.jan.hi} °C y una mínima de ${h.jan.lo} °C, con ${JAN.rain} mm de lluvia en ${num(JAN.rainDays, L)} días y ${JAN.sun} horas de sol. En febrero, ${h.feb.hi} y ${h.feb.lo} °C, ${FEB.rain} mm en ${num(FEB.rainDays, L)} días y ${FEB.sun} horas de sol. En el centro (el Raval, 2010-2025) son unos ${num(JAN.cityHigh, L)} y ${num(JAN.cityLow, L)} °C en enero y ${num(FEB.cityHigh, L)} y ${num(FEB.cityLow, L)} °C en febrero. Los récords de frío en el aeropuerto son ${num(JAN.recordLow, L)} °C en enero y ${num(FEB.recordLow, L)} °C en febrero.`,
        `Los días son cortos: el 15 de enero el sol sale a las ${sunMonth(0).sunrise} y se pone a las ${sunMonth(0).sunset} (${daylightText(0)} de luz); el 15 de febrero, a las ${sunMonth(1).sunrise} y a las ${sunMonth(1).sunset} (${daylightText(1)}). Mes a mes, con qué abrigarte: ${weatherLink(L, 0, "el tiempo en Barcelona en enero")} y ${weatherLink(L, 1, "el tiempo en Barcelona en febrero")}, en la guía ${link("climate", "el tiempo en Barcelona mes a mes")}.`,
      ],
      weatherTitle: "El tiempo en Barcelona en enero y febrero",
      weatherHead: ["Mes", "Máxima °C", "Mínima °C", "Lluvia (mm)", "Días de lluvia", "Horas de sol", "Sol el día 15 (salida - puesta)"],
      weatherNote: `AEMET, Barcelona Aeropuerto, valores normales 1981-2010; salida y puesta del sol: Instituto Geográfico Nacional, Barcelona 2027, hora oficial (leído el ${shortDate(SUN_VERIFIED, L)} de 2026).`,
      shopsH: "Tiendas, domingos y rebajas",
      shops: [
        `El calendario general de 2027 (Orden EMT/89/2026) permite abrir el ${dd(first, L)} y, en los municipios que no han elegido días propios, el ${dd(second, L)}. La lista de días de cada municipio, Barcelona incluida, no está publicada: el año pasado salió el 27 de noviembre. Pueden abrir, no tienen que abrir. Todos los días, en ${link("shops", "tiendas abiertas en domingos y festivos")}.`,
      ],
      transportH: "Metro y transporte",
      transport: [
        `El horario del metro, de los autobuses y de Rodalies el 1 y el 6 de enero está en ${link("christmasTransport", "el transporte de Navidad y Nochevieja")}; las horas del metro y de los autobuses nocturnos, en ${link("hours", "horarios del metro")}. Los precios actuales son los de 2026: a 25 de noviembre ni la ATM ni TMB habían publicado las tarifas de 2027. Qué tarjeta te conviene, en ${link("transport", "tarjetas de transporte de Barcelona")}.`,
      ],
      agendaH: "Conciertos y exposiciones con fecha",
      agendaIntro: `Algunas actividades de Barcelona de enero y febrero que ya están en la agenda cultural de la Generalitat (datos abiertos, ${AS_OF.es}). Precios y entradas, en la web de cada organizador:`,
      agendaTitle: "Actividades de Barcelona en la agenda cultural, enero y febrero de 2027",
      agendaHead: ["Actividad", "Lugar", "Cuándo", "Nota"],
      pendingH: "Todavía por anunciar",
      pending: [
        "Los días de apertura comercial de Barcelona de 2027 (Generalitat)",
        "El programa de Santa Eulàlia de 2027 y el de los Tres Tombs (Ayuntamiento)",
        "El programa del Carnaval de Barcelona de 2027 (Ayuntamiento)",
        "La hora y el recorrido de la Cabalgata de Reyes de Barcelona (Ayuntamiento)",
        "Las tarifas del transporte público de 2027 (ATM)",
      ],
      faqH: "Preguntas frecuentes",
      faq: [
        { question: "¿Qué tiempo hace en Barcelona en enero?", answer: `Máximas medias de ${h.jan.hi} °C y mínimas de ${h.jan.lo} °C en el aeropuerto, con ${JAN.rain} mm de lluvia en ${num(JAN.rainDays, L)} días y ${JAN.sun} horas de sol (AEMET, 1981-2010). En febrero, ${h.feb.hi} y ${h.feb.lo} °C.` },
        { question: "¿Qué festivos hay en Barcelona en enero y febrero de 2027?", answer: `Dos: ${dd(W.newYear, L)} (${holiday(W.newYear, L)}) y ${dd(W.reis, L)} (${holiday(W.reis, L)}). En febrero no hay ningún festivo, ni de Cataluña ni de Barcelona.` },
        { question: "¿Abren las tiendas el 1 y el 6 de enero?", answer: "Las tiendas sometidas al horario general, no: son días de cierre por ley (Ley 18/2017, artículo 36.2.d). Los establecimientos excluidos del horario general pueden abrir." },
        { question: "¿Abren las tiendas el 3 de enero de 2027?", answer: `Pueden abrir: el ${dd(first, L)} es uno de los ocho días del calendario general de apertura comercial de 2027. Pueden, no tienen que hacerlo.` },
        { question: "¿Cuándo es el Carnaval de 2027?", answer: `Va ${range(carn.from, carn.to, L)} (Jueves Lardero a Miércoles de Ceniza). En Barcelona no es festivo.` },
        { question: "¿Cuándo son las fiestas de Santa Eulàlia de 2027?", answer: `El día de la patrona es el ${dd(W.santaEulalia, L)}. El Ayuntamiento aún no ha publicado el programa de 2027; en 2026 fueron ${range(W.santaEulalia2026.from, W.santaEulalia2026.to, L)} de 2026.` },
        { question: "¿Cuándo son los Tres Tombs de Barcelona en 2027?", answer: `El Ayuntamiento los sitúa el sábado siguiente a Sant Antoni Abat (17 de enero). En 2027 el 17 es domingo, así que por esa regla es el ${dd(W.tresTombs, L)}; el programa de 2027 no está publicado.` },
        { question: "¿Hace frío en Barcelona en enero?", answer: `Es suave comparado con el norte de Europa: ${h.jan.hi} °C de máxima media, pero con noches de ${h.jan.lo} °C. El récord de frío en el aeropuerto en enero es ${num(JAN.recordLow, L)} °C.` },
      ],
      calloutTitle: "Cómo tratamos las fechas",
      callout: "Solo ponemos una fecha de 2027 cuando la ha publicado la administración; cuando solo tenemos la regla (los Tres Tombs) o la edición de este año (Santa Eulàlia), lo decimos. Fuentes: Orden EMT/52/2026, Orden EMT/89/2026, Ley 18/2017, Ayuntamiento de Barcelona (Cultura Popular), agenda cultural de la Generalitat, AEMET e IGN.",
    };
  }

  return {
    lead: `**In January and February 2027 Barcelona has two public holidays, both in the first week: ${dd(W.newYear, L)} (${holiday(W.newYear, L)}) and ${dd(W.reis, L)} (${holiday(W.reis, L)}).** There are none in February. Shops may open on ${dd(first, L)}; the City Council has not yet published its own 2027 opening days. Winter is mild: average highs of ${h.jan.hi} °C (${toF(JAN.high)} °F) in January and ${h.feb.hi} °C (${toF(FEB.high)} °F) in February, lows of ${h.jan.lo} and ${h.feb.lo} °C (AEMET, airport). Carnival runs ${range(carn.from, carn.to, L)}.`,
    factsTitle: "January and February 2027 in Barcelona at a glance",
    facts: [
      { label: "Public holidays", value: `${dd(W.newYear, L)} and ${dd(W.reis, L)}; none in February` },
      { label: "Shops", value: `May open on ${dd(first, L)}; Barcelona's own 2027 days are not published yet` },
      { label: "January weather", value: `High ${h.jan.hi} °C, low ${h.jan.lo} °C, ${JAN.rain} mm of rain` },
      { label: "February weather", value: `High ${h.feb.hi} °C, low ${h.feb.lo} °C, ${FEB.rain} mm of rain` },
      { label: "Daylight on the 15th", value: `January ${daylightText(0)}; February ${daylightText(1)} (IGN)` },
      { label: "Carnival", value: cap(range(carn.from, carn.to, L)) },
      { label: "Three Kings", value: `Parade on the evening of ${dd(W.reisEve, L)}${barcelonaReisNull ? "; Barcelona's time and route not announced yet" : ""}` },
      { label: "Santa Eulàlia", value: `Saint's day ${dd(W.santaEulalia, L)}; 2027 programme not published` },
      { label: "2027 transport fares", value: "Not published as of 25 November 2026" },
    ],
    holidaysH: "Public holidays and what is closed in Barcelona in January and February",
    holidays: [
      `Both holidays are Catalonia-wide (Ordre EMT/52/2026): ${dd(W.newYear, L)}, ${holiday(W.newYear, L)}, and ${dd(W.reis, L)}, ${holiday(W.reis, L)}. ${cap(dd(W.reisEve, L))}, the eve of Epiphany, is a working day. Barcelona has no local holiday in January or February: its 2027 ones are 17 May and 24 September (City Council calendar). For a long weekend, see ${link("bridges2027", "every 2027 bridge and long weekend")}.`,
      `**Shops.** On 1 and 6 January shops on the general timetable must close by law (Llei 18/2017, article 36.2.d); the exceptions, establishments excluded from the general timetable, are in ${link("shops", "shops open on Sundays and holidays")}. **Museums and sights.** Each publishes its own holiday hours: we have not read the ones for 1 and 6 January 2027, so we do not list them; check the official site before you go.`,
    ],
    dayTitle: "Key dates, January and February 2027",
    dayHead: ["Day", "What it is", "Source or status"],
    dayRows: [
      [ddc(W.newYear, L), `Public holiday: ${holiday(W.newYear, L)}. Shops closed by law`, "Ordre EMT/52/2026"],
      [ddc(first, L), "Shops may open (general shop-opening calendar)", "Ordre EMT/89/2026, art. 1"],
      [ddc(W.reisEve, L), `Three Kings parade${barcelonaReisNull ? ": Barcelona's time and route not announced yet" : ""}`, "City Council; see the Three Kings guide"],
      [ddc(W.reis, L), `Public holiday: ${holiday(W.reis, L)}. Shops closed by law`, "Ordre EMT/52/2026"],
      [ddc(second, L), "Default opening day in towns that chose no other; Barcelona has not published its own", "Ordre EMT/89/2026, art. 5"],
      [ddc(W.santAntoni, L), "Saint Anthony the Abbot's day (a Sunday). Barcelona's Tres Tombs parade is the following Saturday", "City Council, Cultura Popular"],
      [ddc(W.tresTombs, L), "Tres Tombs parade in Barcelona, by the City Council's rule; 2027 programme not published", "City Council, Cultura Popular"],
      [ddc(FESTA_2027.date, L), `Gran Festa de la Calçotada in Valls (${FESTA_2027.edition}th edition)`, "See the calçots guide"],
      [cap(range(carn.from, carn.to, L)), "Carnival; Sitges parades on Sunday 7 and Tuesday 9", "VisitSitges; see the Carnival guide"],
      [ddc(W.santaEulalia, L), "Santa Eulàlia's day, Barcelona's patron saint; 2027 programme not published", "City Council, Cultura Popular"],
    ],
    dayNote: `Status ${AS_OF.en}. When the City Council publishes a programme, we add it to the table.`,
    januaryH: "Barcelona in January 2027",
    january: [
      `**New Year and Three Kings.** 1 January is a public holiday and the Three Kings parade is on the evening of 5 January, before the 6 January holiday; Barcelona's time and route, once the City Council publishes them, are in ${link("reis", "the 2027 Three Kings parade guide")}. Transport on 1 and 6 January is in ${link("christmasTransport", "Barcelona transport at Christmas and New Year")}.`,
      `**The sales.** The law sets no start date: each shop decides. The first Sunday with shops open is ${dd(first, L)}. What the law says and your rights are in ${link("winterSales", "winter sales 2027 in Barcelona and Catalonia")}.`,
      `**Sant Antoni Abat.** The saint's day is 17 January, a Sunday in 2027. According to the City Council, Barcelona's Tres Tombs parade of horses and carriages is held on the Saturday after the saint's day; by that rule, ${dd(W.tresTombs, L)}. The council has not published the 2027 programme yet.`,
      `**Calçots.** The Gran Festa de la Calçotada in Valls is on ${dd(FESTA_2027.date, L)}; the season and event dates are in ${link("calcots", "the calçots guide")}.`,
    ],
    februaryH: "Barcelona in February 2027",
    february: [
      `**Carnival.** It runs ${range(carn.from, carn.to, L)}. In Sitges, the Rua de la Disbauxa is on Sunday 7 and the Rua de l'Extermini on Tuesday 9 (VisitSitges). In Barcelona, according to the City Council, neighbourhood parades are usually held on a Saturday afternoon; the 2027 dates are not announced. Every day, local holidays and parades are in ${link("carnival", "the Carnival 2027 guide")}.`,
      `**Santa Eulàlia.** The patron saint's day is 12 February, a Friday in 2027, and the festival is held around that date. The City Council has not published the 2027 programme; the 2026 edition ran ${range(W.santaEulalia2026.from, W.santaEulalia2026.to, L)} 2026 (the latest official information). It is not a public holiday in Barcelona: schools and shops keep normal hours.`,
      `**Calçots.** The season continues in February; see ${link("calcots", "the calçots guide")}.`,
    ],
    weatherH: "What is the weather like in Barcelona in January and February?",
    weather: [
      `In January the airport averages a high of ${h.jan.hi} °C (${toF(JAN.high)} °F) and a low of ${h.jan.lo} °C (${toF(JAN.low)} °F), with ${JAN.rain} mm of rain over ${num(JAN.rainDays, L)} days and ${JAN.sun} hours of sunshine. In February: ${h.feb.hi} and ${h.feb.lo} °C (${toF(FEB.high)} and ${toF(FEB.low)} °F), ${FEB.rain} mm over ${num(FEB.rainDays, L)} days and ${FEB.sun} hours of sunshine. In the city centre (el Raval, 2010-2025) it is about ${num(JAN.cityHigh, L)} and ${num(JAN.cityLow, L)} °C in January and ${num(FEB.cityHigh, L)} and ${num(FEB.cityLow, L)} °C in February. The airport's cold records are ${num(JAN.recordLow, L)} °C in January and ${num(FEB.recordLow, L)} °C in February.`,
      `Days are short: on 15 January the sun rises at ${sunMonth(0).sunrise} and sets at ${sunMonth(0).sunset} (${daylightText(0)} of daylight); on 15 February, at ${sunMonth(1).sunrise} and ${sunMonth(1).sunset} (${daylightText(1)}). For what to pack month by month, see ${weatherLink(L, 0, "Barcelona weather in January")} and ${weatherLink(L, 1, "Barcelona weather in February")} in ${link("climate", "Barcelona weather by month")}.`,
    ],
    weatherTitle: "Barcelona weather in January and February",
    weatherHead: ["Month", "High °C (°F)", "Low °C (°F)", "Rain (mm)", "Rain days", "Sun hours", "Sun on the 15th (rise - set)"],
    weatherNote: `AEMET, Barcelona Airport, normals 1981-2010; sunrise and sunset: Instituto Geográfico Nacional, Barcelona 2027, official time (read on ${shortDate(SUN_VERIFIED, L)} 2026).`,
    shopsH: "Shops, Sundays and the sales",
    shops: [
      `The general 2027 calendar (Ordre EMT/89/2026) lets shops open on ${dd(first, L)} and, in towns that chose no days of their own, on ${dd(second, L)}. The list of each town's own days, Barcelona's included, is not published: last year's came out on 27 November. Shops may open; they need not. All the days are in ${link("shops", "shops open on Sundays and holidays")}.`,
    ],
    transportH: "Metro and transport",
    transport: [
      `Metro, bus and Rodalies service on 1 and 6 January is in ${link("christmasTransport", "Barcelona transport at Christmas and New Year")}; metro hours and night buses are in ${link("hours", "Barcelona metro hours")}. Current prices are the 2026 ones: as of 25 November neither ATM nor TMB had published 2027 fares. Which card suits you is in ${link("transport", "which Barcelona transport pass to buy")}.`,
    ],
    agendaH: "Concerts and exhibitions with a date",
    agendaIntro: `Some January and February events in Barcelona already in the Catalan government's cultural agenda (open data, ${AS_OF.en}). Prices and tickets are on each organiser's website:`,
    agendaTitle: "Barcelona events in the cultural agenda, January and February 2027",
    agendaHead: ["Event", "Venue", "When", "Note"],
    pendingH: "Still to be announced",
    pending: [
      "Barcelona's 2027 shop-opening days (Generalitat)",
      "The 2027 Santa Eulàlia and Tres Tombs programmes (City Council)",
      "The 2027 Barcelona Carnival programme (City Council)",
      "The time and route of Barcelona's Three Kings parade (City Council)",
      "2027 public transport fares (ATM)",
    ],
    faqH: "Frequently asked questions",
    faq: [
      { question: "What is the weather like in Barcelona in January?", answer: `Average highs of ${h.jan.hi} °C (${toF(JAN.high)} °F) and lows of ${h.jan.lo} °C (${toF(JAN.low)} °F) at the airport, with ${JAN.rain} mm of rain over ${num(JAN.rainDays, L)} days and ${JAN.sun} hours of sunshine (AEMET, 1981-2010). In February, ${h.feb.hi} and ${h.feb.lo} °C.` },
      { question: "What are the public holidays in Barcelona in January and February 2027?", answer: `Two: ${dd(W.newYear, L)} (${holiday(W.newYear, L)}) and ${dd(W.reis, L)} (${holiday(W.reis, L)}). There is no public holiday in February, Catalonia-wide or in Barcelona.` },
      { question: "Are shops open in Barcelona on 1 and 6 January?", answer: "Shops on the general timetable are not: they are closing days by law (Llei 18/2017, article 36.2.d). Establishments excluded from the general timetable may open." },
      { question: "Are shops open on 3 January 2027?", answer: `They may open: ${dd(first, L)} is one of the eight days of the general shop-opening calendar for 2027. They may, not must.` },
      { question: "When is Carnival in 2027?", answer: `It runs ${range(carn.from, carn.to, L)} (Fat Thursday to Ash Wednesday). It is not a public holiday in Barcelona.` },
      { question: "When is Santa Eulàlia in Barcelona in 2027?", answer: `The patron saint's day is ${dd(W.santaEulalia, L)}. The City Council has not published the 2027 programme; in 2026 the festival ran ${range(W.santaEulalia2026.from, W.santaEulalia2026.to, L)} 2026.` },
      { question: "When is the Tres Tombs parade in Barcelona in 2027?", answer: `The City Council holds it on the Saturday after Sant Antoni Abat (17 January). In 2027 the 17th is a Sunday, so by that rule it is ${dd(W.tresTombs, L)}; the 2027 programme is not published.` },
      { question: "Is Barcelona cold in January?", answer: `It is mild next to northern Europe: ${h.jan.hi} °C average highs, but nights of ${h.jan.lo} °C. The airport's January cold record is ${num(JAN.recordLow, L)} °C.` },
    ],
    calloutTitle: "How we treat dates",
    callout: "We print a 2027 date only when the authorities have published it; where we only have the rule (Tres Tombs) or this year's edition (Santa Eulàlia), we say so. Sources: Ordre EMT/52/2026, Ordre EMT/89/2026, Llei 18/2017, Barcelona City Council (Cultura Popular), the Generalitat's cultural agenda, AEMET and IGN.",
  };
}

export function buildBarcelonaWinterBody(L: Locale): Block[] {
  const t = copy(L);
  const heading = (text: string, id: string) => ({ type: "heading", level: 2, text, id }) as Block;
  const paragraph = (text: string) => ({ type: "paragraph", text }) as Block;
  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    heading(t.holidaysH, "holidays"),
    ...t.holidays.map(paragraph),
    table(t.dayTitle, t.dayHead, t.dayRows, t.dayNote),
    heading(t.januaryH, "january"),
    ...t.january.map(paragraph),
    heading(t.februaryH, "february"),
    ...t.february.map(paragraph),
    heading(t.weatherH, "weather"),
    ...t.weather.slice(0, 1).map(paragraph),
    table(t.weatherTitle, t.weatherHead, weatherTableRows(L), t.weatherNote),
    ...t.weather.slice(1).map(paragraph),
    heading(t.shopsH, "shops"),
    ...t.shops.map(paragraph),
    heading(t.transportH, "transport"),
    ...t.transport.map(paragraph),
    heading(t.agendaH, "agenda"),
    paragraph(t.agendaIntro),
    table(t.agendaTitle, t.agendaHead, agendaRows(L)),
    heading(t.pendingH, "pending"),
    list(...t.pending),
    heading(t.faqH, "faq"),
    faq(t.faq),
    callout("official", t.calloutTitle, t.callout),
    paragraph(verifiedLine(L, W.asOf)),
    ...b2Related(["barcelonaDecember", "climate", "winterSales", "shops", "reis", "carnival", "christmasTransport", "transport"], L),
  ];
}

const META: Record<Locale, { title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    title: "Barcelona al gener i al febrer del 2027: temps, festius, rebaixes i Carnaval",
    seoTitle: "Barcelona al gener i febrer 2027: temps, festius i Carnaval",
    seoDescription: `Barcelona al gener i febrer del 2027: festius l'1 i el 6 de gener, màximes de ${num(JAN.high, "ca")} °C, botigues obertes el 3 de gener, rebaixes i Carnaval del 4 al 10 de febrer.`,
    excerpt: "Gener i febrer del 2027 a Barcelona en una pàgina: festius i què tanca, botigues, temps i hores de llum, Reis, Tres Tombs, Carnaval, Santa Eulàlia i transport, amb les dates oficials.",
  },
  es: {
    title: "Barcelona en enero y febrero de 2027: tiempo, festivos, rebajas y Carnaval",
    seoTitle: "Barcelona en enero y febrero 2027: tiempo, festivos y Carnaval",
    seoDescription: `Barcelona en enero y febrero de 2027: festivos el 1 y el 6 de enero, máximas de ${num(JAN.high, "es")} °C, tiendas abiertas el 3 de enero, rebajas y Carnaval del 4 al 10 de febrero.`,
    excerpt: "Enero y febrero de 2027 en Barcelona en una página: festivos y qué cierra, tiendas, tiempo y horas de luz, Reyes, Tres Tombs, Carnaval, Santa Eulàlia y transporte, con las fechas oficiales.",
  },
  en: {
    title: "Barcelona in January and February 2027: weather, holidays, sales and Carnival",
    seoTitle: "Barcelona in January and February 2027: weather and events",
    seoDescription: `Barcelona in January and February 2027: holidays on 1 and 6 January, ${num(JAN.high, "en")} °C highs, shops open Sunday 3 January, the sales and Carnival on 4-10 February.`,
    excerpt: "January and February 2027 in Barcelona on one page: public holidays and what closes, shops, weather and daylight, Three Kings, Tres Tombs, Carnival, Santa Eulàlia and transport, with the official dates.",
  },
};

export const BARCELONA_WINTER_META = META;

export const BARCELONA_WINTER_GUIDE: B2Article = {
  key: "barcelonaWinter",
  entryKey: "guide-barcelona-january-february",
  categoryKey: "festivals",
  sources: BARCELONA_WINTER_SOURCES,
  // Reused from the manifest (Wikimedia Commons, CC BY-SA 4.0, credit in images.ts), same alt and caption as the Barcelona hub.
  heroKey: "barcelona-hub-vista-carmel",
  heroAlt: {
    ca: "Vista de Barcelona des dels Bunkers del Carmel, amb la ciutat fins al mar",
    es: "Vista de Barcelona desde los Bunkers del Carmel, con la ciudad hasta el mar",
    en: "Barcelona seen from the Bunkers del Carmel, over the city to the sea",
  },
  heroCaption: {
    ca: "Barcelona des dels Bunkers del Carmel.",
    es: "Barcelona desde los Bunkers del Carmel.",
    en: "Barcelona from the Bunkers del Carmel.",
  },
  verifiedAt: W.asOf,
  publishedAt: "2026-11-25T19:30:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.barcelonaWinter[locale], ...META[locale], blocks: buildBarcelonaWinterBody(locale) }]),
  ) as B2Article["editions"],
};
