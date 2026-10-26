import { CHRISTMAS } from "./christmas";
import { WEEKDAY_NAMES, aranSubstitutionFor, weekdayIndex } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

import { dateYear, dayDate, span } from "./festive";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  keyFacts,
  lead,
  list,
  paras,
  steps,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Catalan Christmas traditions: the tió, the caganer, the pessebre, the Missa
 * del Gall, els Pastorets, the Christmas food and Sant Esteve.
 *
 * Mostly evergreen. Checked on 26 October 2026 against the Ajuntament de
 * Barcelona (its Christmas traditions page and its Cultura Popular pages),
 * the IEC dictionary (DIEC2), the Generalitat (holiday orders in the DOGC,
 * the IGP Torró d'Agramunt page), the BOE national holiday table and the
 * Coordinadora de Pastorets de Catalunya (research_notes/nadal-tradicions.md).
 *
 * No origin dates: the council's own pages disagree on when the caganer, the
 * pessebre and els Pastorets began (Baroque vs "end of the 17th century";
 * 1223 vs the 14th century; the 18th century vs medieval liturgical plays),
 * so the page says what each tradition is, when and how it is done, and
 * leaves the history out.
 *
 * HOW TO UPDATE: when the Fira de Santa Llúcia or the Coordinadora de
 * Pastorets publishes its 2026-27 dates, fill the field in
 * ANNOUNCED_TRADITIONS (ISO dates and the organiser's own page), set
 * TRADITIONS_VERIFIED to the check date, run the tests and republish the
 * "nadal-tradicions" group. The "not announced yet" lines switch on their own.
 *
 * No new photograph: the hero is the nativity-figures picture already in the
 * manifest (the Christmas markets guide's second image), with that file's own
 * alt and caption, because media rows are keyed by file.
 */

export const TRADITIONS_VERIFIED = "2026-10-26";

/** The days the page names. Each is checked against the DOGC orders in the tests. */
export const TRADITION_DAYS = {
  immaculada: "2026-12-08",
  nitDeNadal: "2026-12-24",
  nadal: "2026-12-25",
  santEsteve: "2026-12-26",
  reisEve: "2027-01-05",
  reis: "2027-01-06",
  /** In 2027 Sant Esteve falls on a Sunday and is not in Ordre EMT/52/2026. */
  santEsteveNextYear: "2027-12-26",
} as const;

const aranSubstitution = aranSubstitutionFor(TRADITION_DAYS.santEsteve);
if (!aranSubstitution) throw new Error("christmas-traditions: the Aran substitution for Sant Esteve 2026 is missing from the holiday calendar");
/** Festa d'Aran, which replaces Sant Esteve in Aran (Ordre EMT/66/2025, art. 1.b). */
export const ARAN_DAY = aranSubstitution.date;

export interface SeasonSpan {
  /** First day, ISO. */
  from: string;
  /** Last day, ISO. */
  to: string;
  /** The organiser's own page that published the dates. */
  url: string;
}

export interface TraditionAnnouncements {
  /** Fira de Santa Llúcia 2026, from firadesantallucia.cat or barcelona.cat. */
  santaLlucia: SeasonSpan | null;
  /** The Coordinadora de Pastorets de Catalunya's 2026-27 season. */
  pastorets: SeasonSpan | null;
}

/** `null` = not published yet, at TRADITIONS_VERIFIED. */
export const ANNOUNCED_TRADITIONS: TraditionAnnouncements = {
  santaLlucia: null,
  pastorets: null,
};

/** The window a 2026-27 date must fall in. */
export const TRADITIONS_SEASON = { from: "2026-11-01", to: "2027-02-28" } as const;

/** Why a filled-in season cannot be printed, or nothing when it can. */
export function seasonSpanProblems(item: SeasonSpan): string[] {
  const problems: string[] = [];
  const valid = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) &&
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
  for (const [name, value] of [["from", item.from], ["to", item.to]] as const) {
    if (!valid(value)) problems.push(`${name} ${value} is not an ISO date`);
    else if (value < TRADITIONS_SEASON.from || value > TRADITIONS_SEASON.to) problems.push(`${name} ${value} is outside the 2026-27 season`);
  }
  if (valid(item.from) && valid(item.to) && item.to < item.from) problems.push(`${item.to} is before ${item.from}`);
  if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\//.test(item.url)) problems.push(`${item.url} is not an https page`);
  if (/[?&]utm_/.test(item.url)) problems.push(`${item.url} carries tracking`);
  if (/aerobusbcn/i.test(item.url)) problems.push(`${item.url} is not allowed`);
  return problems;
}

/** Last season's Pastorets, from the Coordinadora's note of 2 December 2025. Always printed with its years. */
export const PASTORETS_2025 = {
  presented: "2025-11-29",
  from: "2025-12-13",
  to: "2026-02-01",
  url: "https://www.pastoretsdecatalunya.cat/2025/12/02/la-coordinadora-de-pastorets-de-catalunya-presenta-la-nova-temporada-de-pastorets-amb-68-grups-i-mes-de-300-representacions-arreu-del-pais/",
} as const;

const PASTORETS_FINDER = "https://www.pastoretsdecatalunya.cat/cercador/";

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

const D = TRADITION_DAYS;

function weekday(iso: string, locale: Locale): string {
  return WEEKDAY_NAMES[locale][weekdayIndex(iso)] ?? "";
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * "del 28 de novembre al 23 de desembre de 2026", or with both years when the
 * range crosses New Year: "del 13 de desembre de 2025 a l'1 de febrer de 2026".
 * English has no leading "from", so the sentence supplies it.
 */
export function range(from: string, to: string, locale: Locale): string {
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  if (sameYear) return locale === "en" ? `${span(from, to, "en")} ${from.slice(0, 4)}` : `${span(from, to, locale)} de ${from.slice(0, 4)}`;
  if (locale === "en") return `${dateYear(from, "en")} to ${dateYear(to, "en")}`;
  if (locale === "es") return `del ${dateYear(from, "es")} al ${dateYear(to, "es")}`;
  const vowel = (iso: string) => ["01", "11"].includes(iso.slice(8, 10));
  return `${vowel(from) ? "de l'" : "del "}${dateYear(from, "ca")} ${vowel(to) ? "a l'" : "al "}${dateYear(to, "ca")}`;
}

const CHECKED: Record<Locale, string> = {
  ca: `comprovat el ${dateYear(TRADITIONS_VERIFIED, "ca")}`,
  es: `comprobado el ${dateYear(TRADITIONS_VERIFIED, "es")}`,
  en: `checked on ${dateYear(TRADITIONS_VERIFIED, "en")}`,
};

export function santaLluciaSentence(locale: Locale, facts: TraditionAnnouncements = ANNOUNCED_TRADITIONS): string {
  const a = facts.santaLlucia;
  if (a) {
    return {
      ca: `La del 2026 es fa ${range(a.from, a.to, "ca")}, segons [l'organització](${a.url}).`,
      es: `La de 2026 se celebra ${range(a.from, a.to, "es")}, según [la organización](${a.url}).`,
      en: `The 2026 fair runs from ${range(a.from, a.to, "en")}, according to [the organisers](${a.url}).`,
    }[locale];
  }
  return {
    ca: `Les dates del 2026 encara no s'han anunciat (${CHECKED.ca}): el web de l'organització encara mostra el calendari del 2025, i l'Ajuntament diu que actualitzarà el seu web de Nadal cap al novembre. Segons l'Ajuntament, la fira s'instal·la cada any a final de novembre o a principi de desembre, sempre abans del 13, Santa Llúcia.`,
    es: `Las fechas de 2026 aún no se han anunciado (${CHECKED.es}): la web de la organización todavía muestra el calendario de 2025, y el Ayuntamiento dice que actualizará su web de Navidad hacia noviembre. Según el Ayuntamiento, la feria se instala cada año a finales de noviembre o principios de diciembre, siempre antes del 13, Santa Llúcia.`,
    en: `The 2026 dates have not been announced yet (${CHECKED.en}): the organisers' website still shows the 2025 calendar, and the City Council says it will update its Christmas website around November. According to the council, the fair goes up every year in late November or early December, always before 13 December, Santa Llúcia's day.`,
  }[locale];
}

function santaLluciaFact(locale: Locale, facts: TraditionAnnouncements): string {
  const a = facts.santaLlucia;
  if (a) return locale === "en" ? cap(range(a.from, a.to, "en")) : cap(range(a.from, a.to, locale).replace(/^de?l /, ""));
  return { ca: `Dates del 2026 encara no anunciades (${CHECKED.ca})`, es: `Fechas de 2026 aún no anunciadas (${CHECKED.es})`, en: `2026 dates not announced yet (${CHECKED.en})` }[locale];
}

export function pastoretsSentence(locale: Locale, facts: TraditionAnnouncements = ANNOUNCED_TRADITIONS): string {
  const a = facts.pastorets;
  if (a) {
    return {
      ca: `La temporada 2026-27 va ${range(a.from, a.to, "ca")}, segons la [Coordinadora de Pastorets de Catalunya](${a.url}).`,
      es: `La temporada 2026-27 va ${range(a.from, a.to, "es")}, según la [Coordinadora de Pastorets de Catalunya](${a.url}).`,
      en: `The 2026-27 season runs from ${range(a.from, a.to, "en")}, according to the [Coordinadora de Pastorets de Catalunya](${a.url}).`,
    }[locale];
  }
  const p = PASTORETS_2025;
  return {
    ca: `La temporada 2026-27 encara no s'ha presentat (${CHECKED.ca}). La Coordinadora de Pastorets de Catalunya va presentar l'anterior el ${dateYear(p.presented, "ca")}, i va anar ${range(p.from, p.to, "ca")}.`,
    es: `La temporada 2026-27 aún no se ha presentado (${CHECKED.es}). La Coordinadora de Pastorets de Catalunya presentó la anterior el ${dateYear(p.presented, "es")}, y fue ${range(p.from, p.to, "es")}.`,
    en: `The 2026-27 season has not been presented yet (${CHECKED.en}). The Coordinadora de Pastorets de Catalunya presented the last one on ${dateYear(p.presented, "en")}, and it ran from ${range(p.from, p.to, "en")}.`,
  }[locale];
}

function pastoretsFact(locale: Locale, facts: TraditionAnnouncements): string {
  const a = facts.pastorets;
  if (a) return { ca: `Temporada 2026-27: ${range(a.from, a.to, "ca")}`, es: `Temporada 2026-27: ${range(a.from, a.to, "es")}`, en: `2026-27 season: ${range(a.from, a.to, "en")}` }[locale];
  const p = PASTORETS_2025;
  return {
    ca: `Temporada 2026-27 encara no presentada; la 2025-26 va anar ${range(p.from, p.to, "ca")}`,
    es: `Temporada 2026-27 aún no presentada; la 2025-26 fue ${range(p.from, p.to, "es")}`,
    en: `2026-27 season not presented yet; 2025-26 ran from ${range(p.from, p.to, "en")}`,
  }[locale];
}

function buyAnswer(locale: Locale, facts: TraditionAnnouncements): string {
  const a = facts.santaLlucia;
  const when = a
    ? { ca: `El 2026 es fa ${range(a.from, a.to, "ca")}.`, es: `En 2026 se celebra ${range(a.from, a.to, "es")}.`, en: `In 2026 it runs from ${range(a.from, a.to, "en")}.` }[locale]
    : { ca: "Les dates del 2026 encara no s'han anunciat.", es: "Las fechas de 2026 aún no se han anunciado.", en: "Its 2026 dates have not been announced yet." }[locale];
  return {
    ca: `A la Fira de Santa Llúcia, davant de la Catedral de Barcelona, que té un sector de figures de pessebre (caganers inclosos) i un altre de molsa, suro i tions. ${when}`,
    es: `En la Fira de Santa Llúcia, frente a la catedral de Barcelona, que tiene un sector de figuras de belén (caganers incluidos) y otro de musgo, corcho y tions. ${when}`,
    en: `At the Fira de Santa Llúcia in front of Barcelona Cathedral, which has a section for nativity figures (caganers included) and another for moss, cork and tió logs. ${when}`,
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Sources and meta                                                           */
/* -------------------------------------------------------------------------- */

const CP = "https://www.barcelona.cat/culturapopular/ca/festes-i-tradicions";

const SOURCES: B2Source[] = [
  { name: "Ordre EMT/66/2025, calendari oficial de festes laborals a Catalunya per a l'any 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1013204&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Ordre EMT/52/2026, calendari oficial de festes laborals a Catalunya per a l'any 2027", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1040896&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Relación de fiestas laborales para el año 2026", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-21667", publisher: "BOE" },
  { name: "Tradicions de Nadal", url: "https://www.barcelona.cat/nadal/ca/tradicions/tradicions-de-nadal", publisher: "Ajuntament de Barcelona" },
  { name: "Tió", url: `${CP}/personatges-i-elements-festius/tio`, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Caganer", url: `${CP}/personatges-i-elements-festius/caganer`, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Pessebre", url: `${CP}/personatges-i-elements-festius/pessebre`, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Pastorets", url: `${CP}/personatges-i-elements-festius/pastorets`, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Cant de la Sibil·la", url: `${CP}/personatges-i-elements-festius/cant-de-la-sibilla`, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Reis d'Orient", url: `${CP}/personatges-i-elements-festius/reis-dorient`, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Cavalcada de Reis", url: `${CP}/cavalcada-de-reis`, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Escudella de Nadal", url: `${CP}/gastronomia/escudella-de-nadal`, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Canelons", url: `${CP}/gastronomia/canelons`, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Torrons", url: `${CP}/gastronomia/torrons`, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Neules", url: `${CP}/gastronomia/neules`, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Fira de Santa Llúcia", url: `${CP}/fires/fira-de-santa-llucia`, publisher: "Ajuntament de Barcelona, Cultura Popular" },
  { name: "Fira de Santa Llúcia: calendari", url: "https://firadesantallucia.cat/calendari.php", publisher: "Associació Fira de Santa Llúcia" },
  { name: "Nadal a Barcelona", url: "https://www.barcelona.cat/nadal/ca", publisher: "Ajuntament de Barcelona" },
  { name: "Diccionari de la llengua catalana (DIEC2): tió, caganer, pessebre, missa del gall", url: "https://dlc.iec.cat/", publisher: "Institut d'Estudis Catalans" },
  { name: "IGP Torró d'Agramunt", url: "https://agricultura.gencat.cat/ca/ambits/alimentacio/segells-qualitat-diferenciada/distintius-origen/dop-igp/igp/productes-reconeixement-comunitari/torro-agramunt/", publisher: "Generalitat de Catalunya, Departament d'Agricultura" },
  { name: "Presentació de la temporada de Pastorets 2025-2026", url: PASTORETS_2025.url, publisher: "Coordinadora de Pastorets de Catalunya" },
  { name: "Cercador de Pastorets", url: PASTORETS_FINDER, publisher: "Coordinadora de Pastorets de Catalunya" },
];

export const CHRISTMAS_TRADITIONS_META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "tradicions/tradicions-de-nadal-catalunya",
    title: "Tradicions de Nadal a Catalunya: el tió, el caganer i Sant Esteve",
    seoTitle: "Tradicions de Nadal a Catalunya 2026: el tió i el caganer",
    seoDescription:
      "Què és el tió i quan es fa cagar, el caganer, el pessebre, els Pastorets i la Missa del Gall, i què es menja per Nadal i per Sant Esteve, festiu el 2026.",
    excerpt:
      "Com es fa cagar el tió, on s'amaga el caganer, què són els Pastorets i la Missa del Gall, què es menja per Nadal i per Sant Esteve, i els festius del 2026.",
  },
  es: {
    path: "tradiciones/tradiciones-navidad-cataluna",
    title: "Tradiciones de Navidad en Cataluña: el tió, el caganer y Sant Esteve",
    seoTitle: "Tradiciones de Navidad en Cataluña 2026: tió y caganer",
    seoDescription:
      "Qué es el tió y cuándo se hace cagar, el caganer, el belén, los Pastorets, la Misa del Gallo y qué se come en Navidad y San Esteban, festivo en 2026.",
    excerpt:
      "Cómo se hace cagar el tió, dónde se esconde el caganer, qué son los Pastorets y la Misa del Gallo, qué se come en Navidad y San Esteban y los festivos de 2026.",
  },
  en: {
    path: "traditions/catalan-christmas-traditions",
    title: "Catalan Christmas traditions: the Tió, the caganer and Sant Esteve",
    seoTitle: "Catalan Christmas traditions 2026: caga tió and caganer",
    seoDescription:
      "What the tió (caga tió) and the caganer are, how the pessebre, Midnight Mass and Pastorets work, what Catalans eat and why 26 Dec 2026 is a holiday.",
    excerpt:
      "How Catalan children make the tió poo, where the caganer hides, what els Pastorets and the Missa del Gall are, the Christmas food and the 2026 holidays.",
  },
};

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["christmasBarcelona", "pessebres", "christmas", "newYear", "workCalendar", "shops", "holidayToday"] as const;

function bodyCa(facts: TraditionAnnouncements) {
  return [
    lead(
      `**A Catalunya, per Nadal la mainada fa cagar el tió, un tronc que «caga» regals la nit del 24 o el dia 25 de desembre; al pessebre s'hi amaga un caganer, i l'endemà de Nadal, Sant Esteve, és un altre festiu: el dia dels canelons.** El 2026, Nadal és ${weekday(D.nadal, "ca")} i Sant Esteve, ${dayDate(D.santEsteve, "ca")}, festiu a tot Catalunya excepte a l'Aran.`,
    ),
    keyFacts("El Nadal 2026-27, dia a dia", [
      { label: "Tió", value: `Menja des de la Immaculada (${dayDate(D.immaculada, "ca", false)}, festiu) i caga la nit de Nadal o el dia de Nadal, segons cada casa` },
      { label: "Missa del Gall", value: `A mitjanit de la Nit de Nadal, ${dayDate(D.nitDeNadal, "ca", false)} (dia feiner)` },
      { label: "Nadal", value: `${cap(dayDate(D.nadal, "ca"))}, festiu: escudella i carn d'olla, torrons i neules` },
      { label: "Sant Esteve", value: `${cap(dayDate(D.santEsteve, "ca"))}, festiu a Catalunya excepte a l'Aran: canelons` },
      { label: "Reis", value: `${cap(dayDate(D.reis, "ca"))}, festiu; la cavalcada és el vespre del 5` },
      { label: "Fira de Santa Llúcia", value: santaLluciaFact("ca", facts) },
      { label: "Pastorets", value: pastoretsFact("ca", facts) },
    ]),
    callout(
      "info",
      "D'on surten aquestes dades",
      "Els festius són els del calendari oficial de la Generalitat, publicat al DOGC. Les tradicions, del web de Nadal i de Cultura Popular de l'Ajuntament de Barcelona i del diccionari de l'Institut d'Estudis Catalans. Quan aquestes fonts no coincideixen sobre l'origen d'un costum, com passa amb el caganer, el pessebre o els Pastorets, no en donem cap data.",
    ),
    ...h2(
      "Què és el tió de Nadal?",
      "El diccionari de l'Institut d'Estudis Catalans el defineix com el «tronc que per Nadal hom fingeix que, picant-lo, arriba a cagar dolços i altres regals», i d'aquí ve l'expressió fer cagar el tió. La paraula vol dir, primer de tot, un tros de tronc per cremar a la llar; també se'n diu tronc, tronca, soca o rabassa, i a la Franja, tronca de Nadal.",
      "El tió d'avui és un tronc amb barretina i una cara somrient dibuixada, que s'està a casa tapat amb una manta perquè no passi fred.",
    ),
    ...h2(
      "Quan es fa cagar el tió?",
      `Arriba a casa uns dies abans de Nadal, i la tradició que recull l'Ajuntament de Barcelona diu que se li comença a donar menjar per la Immaculada, el 8 de desembre (el 2026, ${weekday(D.immaculada, "ca")} i festiu).`,
      "**A les cases se'l fa cagar la nit de Nadal, el 24 de desembre, o el mateix dia de Nadal, el 25**: cada família ho fa segons el seu costum. Les escoles i les entitats en fan cagades col·lectives a les seves festes de Nadal, uns dies abans.",
    ),
    steps("Com es fa cagar el tió, pas a pas", [
      { title: "Dona-li menjar i tapa'l", text: "Palla, garrofes, galetes, mandarines, rosegons de pa o peles de taronja: tot s'hi val perquè, el dia que toca, ho torni en forma de regals. La manta, que no li falti." },
      { title: "Abans, nadales", text: "Els infants solen anar a cantar nadales davant del pessebre. Hi ha qui escalfa o mulla els bastons, perquè diu que així caga més bé." },
      { title: "Pica i canta", text: "La mainada pica el tió amb els bastons, amb força, mentre canta la cançó. N'hi ha moltíssimes variants, segons el territori i la família." },
      { title: "Aixeca la manta", text: "Quan el tió ja està ben escalfat, s'aixeca la manta i hi apareixen els regals: per tradició, les postres del dinar de Nadal, neules i torrons, i també llaminadures i algun regal petit." },
    ]),
    ...paras(
      "Una de les moltes versions de la cançó, la que recull l'Ajuntament: «Caga tió, tió de Nadal, no caguis arengades, que són salades, caga torrons, que són més bons!»",
    ),
    ...h2(
      "Què és el caganer i per què es posa al pessebre?",
      "És la «figura popular del pessebre nadalenc en actitud de fer de cos», segons el diccionari de l'IEC. La imatge tradicional és la d'un home amb barretina, ajupit i amb les natges a l'aire, que fuma amb pipa o un cigar i de vegades llegeix el diari; de tant en tant, amb un porquet que l'ensuma per darrere.",
      "**Es col·loca amagat, darrere d'un arbre o sota un pont, i es diu que porta bona sort.** Què significa, però, ningú no ho sap del cert: la pàgina de Cultura Popular de l'Ajuntament admet que la interpretació de la figura encara és motiu de controvèrsia.",
      "Des de fa anys, els figuraires en fan de personatges coneguts, com futbolistes, polítics, actors o cantants, i la novetat de cada any té ressò als mitjans. També és peça de col·leccionista: fins i tot hi ha una associació, els Amics del Caganer, que l'estudia i en fa exposicions.",
    ),
    ...h2(
      "Com es fa el pessebre a Catalunya",
      "El pessebre és la «representació figurativa del naixement de Jesús, que es fa durant el temps de Nadal» (diccionari de l'IEC). El tradicional català es construeix amb molsa, suro i galzeran, i la seva escena principal és el naixement, en una cova o en un estable, amb la Mare de Déu, sant Josep, el Nen, el bou i la mula; l'anunciata als pastors i els tres Reis completen la història.",
      "Al voltant hi caben escenes de la vida de cada dia, com la dona que renta, la vella que fila, un pescador o els pastors que porten presents, i, ben amagat en algun racó, el caganer.",
      `El pessebre de l'Ajuntament, a la plaça de Sant Jaume, el tractem a ${b2link("christmasBarcelona", "ca", "Nadal a Barcelona")}, on afegim les dates del 2026 quan s'anunciïn. Si busques un pessebre vivent, l'escenificació del naixement amb actors, el calendari de tot Catalunya és a ${b2link("pessebres", "ca", "la guia de pessebres vivents")}.`,
    ),
    ...h2(
      "La Missa del Gall: quan és",
      `És la «missa solemne que hom celebra a mitjanit de Nadal», segons el diccionari de l'IEC: la nit del 24 al 25 de desembre. El 2026 la Nit de Nadal és ${weekday(D.nitDeNadal, "ca")} i és un dia feiner; el festiu és l'endemà.`,
      "En algunes esglésies de Barcelona, abans de la Missa del Gall es canta el Cant de la Sibil·la, una peça de teatre religiós medieval que pronostica l'arribada del Messies i la fi del món, interpretada per un nen o una dona vestits de sibil·la, amb una espasa a la mà. L'hora de la missa del 2026, mira-la a la parròquia on vulguis anar.",
    ),
    ...h2(
      "Els Pastorets: què són i quan es fan",
      "Per Nadal, teatres de tota mida, ateneus, casals parroquials i centres cívics programen Els Pastorets, que segons l'Ajuntament és l'obra més representada pels grups de teatre amateur de Catalunya. L'argument es construeix amb tres històries: Josep i Maria que busquen posada fins al naixement de Jesús, la lluita entre àngels i dimonis, i les aventures, molt còmiques, dels pastors.",
      "N'hi ha moltes versions. Entre les més conegudes, Cultura Popular destaca El bressol de Jesús o en Garrofa i en Pallanga, de Frederic Soler, Pitarra (1901), i Els Pastorets o l'Adveniment de l'Infant Jesús, de Josep Maria Folch i Torres (1916).",
      `${pastoretsSentence("ca", facts)} Al seu web, la Coordinadora té un [cercador de Pastorets](${PASTORETS_FINDER}) i un mapa dels grups associats.`,
    ),
    ...h2(
      "Què es menja per Nadal a Catalunya?",
      "**El dia de Nadal, escudella i carn d'olla.** El primer plat és l'escudella, un brou de carn i verdura que aquest dia es fa amb galets, una pasta grossa que de vegades es farceix de carn. Després es serveix la carn d'olla, la carn i les verdures que han bullit al brou, amb la pilota, una mandonguilla grossa de carn picada, ou, all i julivert que es talla a rodanxes.",
      "**De postres, torrons i neules.** El torró és una massa dolça d'ametlles, avellanes, pinyons o nous torrades, barrejades amb mel o ou; la neula, un full prim de farina, sucre i clara d'ou enrotllat com un canó, que se sol servir amb el torró i el cava. Entre les varietats de torró més conegudes, l'Ajuntament cita les de Xixona, Alacant i Agramunt.",
      "El torró d'Agramunt té indicació geogràfica protegida: segons el Departament d'Agricultura, s'elabora al terme municipal d'Agramunt (Urgell) amb avellanes o ametlles, sucre, mel i clara d'ou, en tauletes cobertes de pa d'àngel, i l'envàs ha de dur el nom «Torró d'Agramunt. Indicació Geogràfica Protegida» i el logotip.",
      "**Per Sant Esteve, canelons.** Es fan amb la carn del rostit que ha sobrat del dinar de Nadal, i aquesta és la diferència amb els italians, que porten carn picada amb sofregit. Es farceixen làmines de pasta, s'enrotllen, es cobreixen de beixamel i es gratinen amb formatge.",
    ),
    ...h2(
      "Sant Esteve és festiu? El 26 de desembre de 2026",
      `**Sí. El ${dayDate(D.santEsteve, "ca")} és festiu a tot Catalunya**, segons el calendari oficial de festes laborals (Ordre EMT/66/2025). L'excepció és l'Aran: allà el substitueix la Festa d'Aran, que va ser el ${dayDate(ARAN_DAY, "ca")}, i el 26 de desembre hi és feiner.`,
      `No és un festiu de tot l'Estat: a la taula del BOE per al 2026, el 26 de desembre només és festiu a Catalunya i a les Illes Balears. I no cau cada any en festiu: el 2027, el 26 de desembre és ${weekday(D.santEsteveNextYear, "ca")} i no figura al calendari de festes laborals (Ordre EMT/52/2026).`,
      `És el dia de tornar-se a reunir, sobretot amb la branca de la família amb qui no s'ha fet Nadal; ja ho diu la dita: «Per Nadal, cada ovella al seu corral; per Sant Esteve, cada ovella a casa seva». Què obre el 25 i el 26 de desembre ho expliquem a ${b2link("christmasBarcelona", "ca", "Nadal a Barcelona")} i a ${b2link("shops", "ca", "botigues obertes en diumenges i festius")}.`,
    ),
    ...h2(
      "Cap d'Any i Reis",
      `La nit del 31 de desembre, amb el raïm i la festa de la ciutat, té la seva pròpia guia: ${b2link("newYear", "ca", "Cap d'Any a Barcelona")}. Els Reis arriben el vespre del 5 de gener, i el ${dayDate(D.reis, "ca")} és festiu a Catalunya (Ordre EMT/52/2026); l'horari i el recorregut de la cavalcada de Barcelona, quan es publiquin, els afegim a la mateixa guia.`,
    ),
    ...h2("On veure-ho i on comprar-ho el 2026"),
    list(
      `**Fira de Santa Llúcia**, davant de la Catedral de Barcelona, on es fa des del 1786: té un sector de pessebres i figures, caganers inclosos, i un altre de verd, amb molsa, suro i tions. ${santaLluciaSentence("ca", facts)} Les dates i la resta de fires són a ${b2link("christmas", "ca", "la guia de mercats de Nadal")}.`,
      `**El pessebre de la plaça de Sant Jaume**, a ${b2link("christmasBarcelona", "ca", "Nadal a Barcelona")}.`,
      `**Pessebres vivents** de tot Catalunya, amb les dates que ja són oficials, a ${b2link("pessebres", "ca", "la guia de pessebres vivents")}.`,
      `**Pastorets**: el [cercador de Pastorets](${PASTORETS_FINDER}) de la Coordinadora de Pastorets de Catalunya.`,
    ),
    faq([
      { question: "Què és el tió?", answer: "Un tronc que per Nadal la mainada alimenta i tapa amb una manta i que, quan el piquen amb bastons tot cantant «Caga tió», caga regals: llaminadures, torrons, neules i algun regal petit." },
      { question: "Quan es fa cagar el tió?", answer: "La nit de Nadal (24 de desembre) o el dia de Nadal (25), segons el costum de cada casa. Se li comença a donar menjar uns dies abans; per tradició, per la Immaculada, el 8 de desembre." },
      { question: "Per què es posa un caganer al pessebre?", answer: "Es diu que porta bona sort, sobretot si està ben amagat, darrere d'un arbre o sota un pont. El significat de la figura, però, encara es discuteix: no n'hi ha una explicació única." },
      { question: "Sant Esteve és festiu el 2026?", answer: `Sí: el ${dayDate(D.santEsteve, "ca")} és festiu a tot Catalunya, excepte a l'Aran, on el substitueix la Festa d'Aran (17 de juny). El 2027 el 26 de desembre cau en diumenge i no és festiu.` },
      { question: "Què es menja per Nadal i per Sant Esteve?", answer: "El dia de Nadal, escudella amb galets i carn d'olla, i de postres torrons i neules. Per Sant Esteve, canelons fets amb la carn del rostit que ha sobrat de Nadal." },
      { question: "Quan és la Missa del Gall?", answer: `A mitjanit de la Nit de Nadal, entre el 24 i el 25 de desembre. El 2026, el 24 és ${weekday(D.nitDeNadal, "ca")} i dia feiner.` },
      { question: "On es compren caganers i tions a Barcelona?", answer: buyAnswer("ca", facts) },
    ]),
    ...paras(verifiedLine("ca", TRADITIONS_VERIFIED)),
    ...b2Related([...RELATED], "ca"),
  ];
}

function bodyEs(facts: TraditionAnnouncements) {
  return [
    lead(
      `**En Cataluña, por Navidad los niños hacen «cagar» el tió, un tronco que deja regalos la noche del 24 o el día 25 de diciembre; en el belén se esconde un caganer, y el día después de Navidad, San Esteban (Sant Esteve), es otro festivo: el de los canelones.** En 2026, Navidad cae en ${weekday(D.nadal, "es")} y San Esteban, el ${dayDate(D.santEsteve, "es")}, festivo en toda Cataluña salvo en Arán.`,
    ),
    keyFacts("La Navidad 2026-27, día a día", [
      { label: "Tió", value: `Come desde la Inmaculada (${dayDate(D.immaculada, "es", false)}, festivo) y «caga» en Nochebuena o el día de Navidad, según cada casa` },
      { label: "Misa del Gallo", value: `A medianoche de Nochebuena, ${dayDate(D.nitDeNadal, "es", false)} (laborable)` },
      { label: "Navidad", value: `${cap(dayDate(D.nadal, "es"))}, festivo: escudella i carn d'olla, turrones y neules` },
      { label: "San Esteban", value: `${cap(dayDate(D.santEsteve, "es"))}, festivo en Cataluña salvo en Arán: canelones` },
      { label: "Reyes", value: `${cap(dayDate(D.reis, "es"))}, festivo; la cabalgata es la tarde-noche del 5` },
      { label: "Fira de Santa Llúcia", value: santaLluciaFact("es", facts) },
      { label: "Pastorets", value: pastoretsFact("es", facts) },
    ]),
    callout(
      "info",
      "De dónde salen estos datos",
      "Los festivos son los del calendario oficial de la Generalitat, publicado en el DOGC. Las tradiciones, de la web de Navidad y de Cultura Popular del Ayuntamiento de Barcelona y del diccionario del Institut d'Estudis Catalans. Cuando esas fuentes no coinciden sobre el origen de una costumbre, como ocurre con el caganer, el belén o los Pastorets, no damos ninguna fecha.",
    ),
    ...h2(
      "¿Qué es el tió de Nadal?",
      "El diccionario del Institut d'Estudis Catalans lo define como el tronco que en Navidad se finge que, al golpearlo, acaba «cagando» dulces y otros regalos; de ahí la expresión catalana fer cagar el tió (hacer cagar el tió). La palabra significa, ante todo, un trozo de tronco para quemar en el hogar; también se le llama tronc, tronca, soca o rabassa, y en la Franja, tronca de Nadal.",
      "El tió de hoy es un tronco con barretina y una cara sonriente pintada, que vive en casa tapado con una manta para que no pase frío.",
    ),
    ...h2(
      "¿Cuándo se hace cagar el tió?",
      `Llega a casa unos días antes de Navidad, y la tradición que recoge el Ayuntamiento de Barcelona dice que se le empieza a dar de comer por la Inmaculada, el 8 de diciembre (en 2026, ${weekday(D.immaculada, "es")} y festivo).`,
      "**En las casas se le hace cagar en Nochebuena, el 24 de diciembre, o el mismo día de Navidad, el 25**: cada familia lo hace según su costumbre. Escuelas y entidades organizan «cagadas» colectivas en sus fiestas de Navidad, unos días antes.",
    ),
    steps("Cómo se hace cagar el tió, paso a paso", [
      { title: "Dale de comer y tápalo", text: "Paja, algarrobas, galletas, mandarinas, mendrugos de pan o pieles de naranja: todo vale para que, el día señalado, lo devuelva en forma de regalos. Y que no le falte la manta." },
      { title: "Antes, villancicos", text: "Los niños suelen cantar villancicos (nadales) delante del belén. Hay quien calienta o moja los palos, porque dicen que así «caga» mejor." },
      { title: "Golpea y canta", text: "Los niños golpean el tió con palos, con fuerza, mientras cantan la canción. Hay muchísimas variantes, según la zona y la familia." },
      { title: "Levanta la manta", text: "Cuando el tió ya está bien «calentito», se levanta la manta y aparecen los regalos: por tradición, los postres de la comida de Navidad, neules y turrones, además de golosinas y algún regalo pequeño." },
    ]),
    ...paras(
      "Una de las muchas versiones de la canción, la que recoge el Ayuntamiento: «Caga tió, tió de Nadal, no caguis arengades, que són salades, caga torrons, que són més bons!» (caga, tió, tió de Navidad, no cagues arenques, que son salados; caga turrones, que son más buenos).",
    ),
    ...h2(
      "¿Qué es el caganer y por qué se pone en el belén?",
      "Es, según el diccionario del IEC, la figura popular del belén navideño en actitud de hacer de vientre. La imagen tradicional es la de un hombre con barretina, agachado y con las nalgas al aire, que fuma en pipa o un puro y a veces lee el periódico; de vez en cuando, con un cerdito que lo olisquea por detrás.",
      "**Se coloca escondido, detrás de un árbol o debajo de un puente, y se dice que trae buena suerte.** Qué significa, en cambio, nadie lo sabe con certeza: la página de Cultura Popular del Ayuntamiento admite que su interpretación todavía es motivo de controversia.",
      "Desde hace años los artesanos hacen caganers de personajes conocidos, como futbolistas, políticos, actores o cantantes, y la novedad de cada año tiene eco en los medios. También es pieza de coleccionista: hay incluso una asociación, Amics del Caganer, que lo estudia y organiza exposiciones.",
    ),
    ...h2(
      "Cómo es el belén (pessebre) catalán",
      "El pessebre es la representación figurativa del nacimiento de Jesús que se hace durante el tiempo de Navidad, según el diccionario del IEC. El tradicional catalán se monta con musgo, corcho y galzeran (rusco), y su escena principal es el nacimiento, en una cueva o en un establo, con la Virgen, san José, el Niño, el buey y la mula; el anuncio a los pastores y los tres Reyes completan la historia.",
      "Alrededor caben escenas de la vida cotidiana, como la mujer que lava, la vieja que hila, un pescador o los pastores que llevan regalos, y, bien escondido en algún rincón, el caganer.",
      `El belén del Ayuntamiento, en la plaza de Sant Jaume, lo tratamos en ${b2link("christmasBarcelona", "es", "Navidad en Barcelona")}, donde añadimos las fechas de 2026 cuando se anuncien. Si buscas un belén viviente, la escenificación del nacimiento con actores, el calendario de toda Cataluña está en ${b2link("pessebres", "es", "la guía de belenes vivientes")}.`,
    ),
    ...h2(
      "La Misa del Gallo (Missa del Gall): cuándo es",
      `Es la misa solemne que se celebra a medianoche de Navidad, según el diccionario del IEC: la noche del 24 al 25 de diciembre. En 2026 la Nochebuena cae en ${weekday(D.nitDeNadal, "es")} y es laborable; el festivo es el día siguiente.`,
      "En algunas iglesias de Barcelona, antes de la Misa del Gallo se canta el Cant de la Sibil·la, una pieza de teatro religioso medieval que anuncia la llegada del Mesías y el fin del mundo, interpretada por un niño o una mujer vestidos de sibila, con una espada en la mano. La hora de la misa de 2026, consúltala en la parroquia a la que quieras ir.",
    ),
    ...h2(
      "Els Pastorets: qué son y cuándo se representan",
      "En Navidad, teatros de todos los tamaños, ateneos, casales parroquiales y centros cívicos programan Els Pastorets, que según el Ayuntamiento es la obra más representada por los grupos de teatro aficionado de Cataluña. El argumento se construye con tres historias: José y María buscando posada hasta el nacimiento de Jesús, la lucha entre ángeles y demonios, y las aventuras, muy cómicas, de los pastores.",
      "Hay muchas versiones. Entre las más conocidas, Cultura Popular destaca El bressol de Jesús o en Garrofa i en Pallanga, de Frederic Soler, Pitarra (1901), y Els Pastorets o l'Adveniment de l'Infant Jesús, de Josep Maria Folch i Torres (1916).",
      `${pastoretsSentence("es", facts)} En su web, la Coordinadora tiene un [buscador de Pastorets](${PASTORETS_FINDER}) y un mapa de los grupos asociados.`,
    ),
    ...h2(
      "¿Qué se come en Navidad en Cataluña?",
      "**El día de Navidad, escudella i carn d'olla.** El primer plato es la escudella, un caldo de carne y verdura que ese día se hace con galets, una pasta grande en forma de caracola que a veces se rellena de carne. Después se sirve la carn d'olla, la carne y las verduras que han hervido en el caldo, con la pilota, una albóndiga grande de carne picada, huevo, ajo y perejil que se corta en rodajas.",
      "**De postre, turrones y neules.** El turrón es una masa dulce de almendras, avellanas, piñones o nueces tostadas, mezcladas con miel o huevo; la neula, una lámina fina de harina, azúcar y clara de huevo enrollada como un tubo, que se suele servir con el turrón y el cava. Entre las variedades de turrón más conocidas, el Ayuntamiento cita las de Jijona, Alicante y Agramunt.",
      "El turrón de Agramunt tiene indicación geográfica protegida: según el Departament d'Agricultura de la Generalitat, se elabora en el término municipal de Agramunt (Urgell) con avellanas o almendras, azúcar, miel y clara de huevo, en tabletas cubiertas de oblea, y el envase debe llevar el nombre «Torró d'Agramunt. Indicació Geogràfica Protegida» y el logotipo.",
      "**Por San Esteban, canelones.** Se hacen con la carne del asado que ha sobrado de la comida de Navidad, y esa es la diferencia con los italianos, que llevan carne picada con sofrito. Se rellenan láminas de pasta, se enrollan, se cubren de bechamel y se gratinan con queso.",
    ),
    ...h2(
      "¿Es festivo San Esteban (Sant Esteve) en Cataluña?",
      `**Sí. El ${dayDate(D.santEsteve, "es")} es festivo en toda Cataluña**, según el calendario oficial de fiestas laborales (Orden EMT/66/2025). La excepción es Arán: allí lo sustituye la Fiesta de Arán, que fue el ${dayDate(ARAN_DAY, "es")}, y el 26 de diciembre es laborable.`,
      `No es festivo en toda España: en la tabla del BOE para 2026, el 26 de diciembre solo es festivo en Cataluña y en las Illes Balears. Y no siempre cae en festivo: en 2027, el 26 de diciembre es ${weekday(D.santEsteveNextYear, "es")} y no figura en el calendario de fiestas laborales (Orden EMT/52/2026).`,
      `Es el día de volver a reunirse, sobre todo con la rama de la familia con la que no se ha celebrado la Navidad; ya lo dice el refrán catalán: «Per Nadal, cada ovella al seu corral; per Sant Esteve, cada ovella a casa seva» (por Navidad, cada oveja en su corral; por San Esteban, cada oveja en su casa). Qué abre el 25 y el 26 de diciembre lo contamos en ${b2link("christmasBarcelona", "es", "Navidad en Barcelona")} y en ${b2link("shops", "es", "tiendas abiertas en domingos y festivos")}.`,
    ),
    ...h2(
      "Nochevieja y Reyes",
      `La noche del 31 de diciembre, con las uvas y la fiesta de la ciudad, tiene su propia guía: ${b2link("newYear", "es", "Nochevieja en Barcelona")}. Los Reyes llegan la tarde-noche del 5 de enero, y el ${dayDate(D.reis, "es")} es festivo en Cataluña (Orden EMT/52/2026); el horario y el recorrido de la cabalgata de Barcelona, cuando se publiquen, los añadimos a esa misma guía.`,
    ),
    ...h2("Dónde verlo y comprarlo en 2026"),
    list(
      `**Fira de Santa Llúcia**, frente a la catedral de Barcelona, donde se celebra desde 1786: tiene un sector de belenes y figuras, caganers incluidos, y otro de verde, con musgo, corcho y tions. ${santaLluciaSentence("es", facts)} Las fechas y el resto de ferias están en ${b2link("christmas", "es", "la guía de mercados de Navidad")}.`,
      `**El belén de la plaza de Sant Jaume**, en ${b2link("christmasBarcelona", "es", "Navidad en Barcelona")}.`,
      `**Belenes vivientes** de toda Cataluña, con las fechas que ya son oficiales, en ${b2link("pessebres", "es", "la guía de belenes vivientes")}.`,
      `**Pastorets**: el [buscador de Pastorets](${PASTORETS_FINDER}) de la Coordinadora de Pastorets de Catalunya.`,
    ),
    faq([
      { question: "¿Qué es el tió?", answer: "Un tronco al que en Navidad los niños dan de comer y tapan con una manta y que, cuando lo golpean con palos cantando «Caga tió», «caga» regalos: golosinas, turrones, neules y algún regalo pequeño." },
      { question: "¿Cuándo se hace cagar el tió?", answer: "En Nochebuena (24 de diciembre) o el día de Navidad (25), según la costumbre de cada casa. Se le empieza a dar de comer unos días antes; por tradición, por la Inmaculada, el 8 de diciembre." },
      { question: "¿Por qué se pone un caganer en el belén?", answer: "Se dice que trae buena suerte, sobre todo si está bien escondido, detrás de un árbol o debajo de un puente. Su significado, en cambio, todavía se discute: no hay una explicación única." },
      { question: "¿Es festivo el 26 de diciembre de 2026 en Cataluña?", answer: `Sí: el ${dayDate(D.santEsteve, "es")}, San Esteban, es festivo en toda Cataluña, salvo en Arán, donde lo sustituye la Fiesta de Arán (17 de junio). En 2027 el 26 de diciembre cae en domingo y no es festivo.` },
      { question: "¿Qué se come en Navidad y San Esteban en Cataluña?", answer: "El día de Navidad, escudella con galets y carn d'olla, y de postre turrones y neules. Por San Esteban, canelones hechos con la carne del asado que ha sobrado de Navidad." },
      { question: "¿Cuándo es la Misa del Gallo?", answer: `A medianoche de Nochebuena, entre el 24 y el 25 de diciembre. En 2026, el 24 cae en ${weekday(D.nitDeNadal, "es")} y es laborable.` },
      { question: "¿Dónde comprar un caganer o un tió en Barcelona?", answer: buyAnswer("es", facts) },
    ]),
    ...paras(verifiedLine("es", TRADITIONS_VERIFIED)),
    ...b2Related([...RELATED], "es"),
  ];
}

function bodyEn(facts: TraditionAnnouncements) {
  return [
    lead(
      `**At Christmas in Catalonia, children make the tió "poo": a log that leaves presents on the night of 24 December or on Christmas Day. The nativity scene hides a caganer, and the day after Christmas, Sant Esteve, is a second public holiday, the day for canelons.** In 2026 Christmas Day is a ${weekday(D.nadal, "en")} and Sant Esteve is ${dayDate(D.santEsteve, "en")}, a holiday across Catalonia except in Aran.`,
    ),
    keyFacts("Christmas 2026-27, day by day", [
      { label: "Tió", value: `Fed from the Immaculada (${dayDate(D.immaculada, "en", false)}, a holiday); it "poos" on Christmas Eve or Christmas Day, depending on the family` },
      { label: "Missa del Gall", value: `Midnight Mass on Christmas Eve, ${dayDate(D.nitDeNadal, "en", false)} (a working day)` },
      { label: "Christmas Day", value: `${dayDate(D.nadal, "en")}, holiday: escudella i carn d'olla, turrón and neules` },
      { label: "Sant Esteve", value: `${dayDate(D.santEsteve, "en")}, holiday in Catalonia except Aran: canelons` },
      { label: "Three Kings", value: `${dayDate(D.reis, "en")}, holiday; the parade is on the evening of the 5th` },
      { label: "Fira de Santa Llúcia", value: santaLluciaFact("en", facts) },
      { label: "Pastorets", value: pastoretsFact("en", facts) },
    ]),
    callout(
      "info",
      "Where these facts come from",
      "The holidays are the Generalitat's official calendar, published in its gazette (DOGC). The traditions come from Barcelona City Council's Christmas and Cultura Popular pages and from the Institut d'Estudis Catalans' dictionary. Where those sources disagree about how old a custom is, as they do for the caganer, the nativity scene and els Pastorets, we give no date.",
    ),
    ...h2(
      "What is the Tió de Nadal (caga tió)?",
      "The Institut d'Estudis Catalans' dictionary defines the tió as the log that, at Christmas, people pretend will \"poo\" sweets and other presents when it is beaten; hence the Catalan phrase fer cagar el tió, \"making the tió poo\", and the song that starts \"Caga tió\". The word itself first means a piece of log for burning in the hearth; it is also called tronc, tronca, soca or rabassa.",
      "Today's tió is a log with a barretina (the traditional Catalan cap) and a painted smiling face, which lives in the house under a blanket so it does not get cold.",
    ),
    ...h2(
      "When do you make the tió poo?",
      `It turns up a few days before Christmas, and the tradition recorded by Barcelona City Council says it starts being fed on the Immaculada, 8 December (in 2026 a ${weekday(D.immaculada, "en")} and a public holiday).`,
      "**At home, families make it poo on Christmas Eve, 24 December, or on Christmas Day, the 25th**: each family follows its own custom. Schools and local associations hold group sessions at their Christmas parties a few days earlier.",
    ),
    steps("How to make the tió poo, step by step", [
      { title: "Feed it and cover it", text: "Straw, carob pods, biscuits, mandarins, bread crusts or orange peel: anything goes, so that on the day it gives it all back as presents. And it must have its blanket." },
      { title: "Sing carols first", text: "Children usually sing Christmas carols (nadales) in front of the nativity scene. Some warm or wet the sticks, because they say the tió then poos better." },
      { title: "Beat it and sing", text: "The children hit the tió hard with their sticks while singing the song. There are countless versions, depending on the area and the family." },
      { title: "Lift the blanket", text: "Once the tió is well warmed up, the blanket comes off and the presents appear: by tradition the Christmas lunch desserts, neules and turrón, plus sweets and the odd small gift." },
    ]),
    ...paras(
      "One of the many versions of the song, the one Barcelona City Council gives: \"Caga tió, tió de Nadal, no caguis arengades, que són salades, caga torrons, que són més bons!\" (Poo, tió, Christmas log, don't poo herrings, they're too salty; poo turrón, it tastes much better!)",
    ),
    ...h2(
      "What is a caganer, and why is it in the nativity scene?",
      "The caganer (literally \"the pooper\") is, as the IEC dictionary describes it, a popular figure of the Christmas nativity scene shown relieving himself. The traditional figure is a man in a barretina, squatting with his bottom in the air, smoking a pipe or a cigar and sometimes reading the paper; now and then a piglet sniffs at him from behind.",
      "**He is hidden somewhere in the scene, behind a tree or under a bridge, and is said to bring good luck.** What he actually means nobody knows for sure: the City Council's Cultura Popular page admits that how to interpret the figure is still debated.",
      "For years figure makers have produced caganers of famous people, from footballers and politicians to actors and singers, and each year's new ones get media coverage. Caganers are also collected: there is even an association, the Amics del Caganer, that researches the figure and puts on exhibitions.",
    ),
    ...h2(
      "The Catalan nativity scene (pessebre)",
      "The pessebre is the figurative representation of the birth of Jesus made during the Christmas season, as the IEC dictionary puts it. A traditional Catalan one is built with moss, cork and galzeran (butcher's broom), around the Nativity in a cave or a stable, with Mary, Joseph, the Child, the ox and the mule; the annunciation to the shepherds and the Three Kings complete the story.",
      "Around it go scenes of everyday life, such as the washerwoman, the old woman spinning, a fisherman or shepherds bringing gifts, and, tucked away in a corner, the caganer.",
      `The City Council's own nativity scene on Plaça de Sant Jaume is covered in ${b2link("christmasBarcelona", "en", "Christmas in Barcelona")}, where we add the 2026 dates once they are announced. For a living nativity, the Nativity acted out by people, see the calendar for all Catalonia in ${b2link("pessebres", "en", "our living nativity scenes guide")}.`,
    ),
    ...h2(
      "Midnight Mass (Missa del Gall): when is it?",
      `The Missa del Gall, literally "the rooster's mass", is the solemn mass held at midnight on Christmas Eve, as the IEC dictionary defines it: the night of 24 to 25 December. In 2026 Christmas Eve is a ${weekday(D.nitDeNadal, "en")} and a working day; the holiday is the next day.`,
      "In some Barcelona churches the Cant de la Sibil·la is sung before Midnight Mass: a medieval piece of religious drama foretelling the coming of the Messiah and the end of the world, performed by a boy or a woman dressed as the Sibyl, holding a sword. For the 2026 Mass times, check with the parish you want to attend.",
    ),
    ...h2(
      "Els Pastorets: the Christmas play",
      "Every Christmas, theatres of every size, cultural societies (ateneus), parish halls and civic centres stage Els Pastorets (\"The Little Shepherds\"), which the City Council calls the play most performed by Catalonia's amateur theatre groups. The plot weaves three stories together: Joseph and Mary looking for lodging until Jesus is born, the fight between angels and devils, and the comic adventures of the shepherds.",
      "There are many versions. Among the best known, the Cultura Popular site picks out El bressol de Jesús o en Garrofa i en Pallanga by Frederic Soler, \"Pitarra\" (1901), and Els Pastorets o l'Adveniment de l'Infant Jesús by Josep Maria Folch i Torres (1916).",
      `${pastoretsSentence("en", facts)} The Coordinadora's website has a [Pastorets finder](${PASTORETS_FINDER}) and a map of its member groups.`,
    ),
    ...h2(
      "What do Catalans eat at Christmas?",
      "**On Christmas Day, escudella i carn d'olla.** The first course is escudella, a meat and vegetable broth that on this day is made with galets, large pasta shells that are sometimes stuffed with meat. Then comes the carn d'olla, the meat and vegetables cooked in the broth, with the pilota, a big meatball of minced meat, egg, garlic and parsley cut into slices.",
      "**For dessert, turrón and neules.** Turrón (torró in Catalan) is a sweet block of roasted almonds, hazelnuts, pine nuts or walnuts mixed with honey or egg; a neula is a thin sheet of flour, sugar and egg white rolled into a tube, usually served with turrón and cava. Among the best-known kinds of turrón, the City Council names those of Xixona, Alicante and Agramunt.",
      "Torró d'Agramunt has Protected Geographical Indication status: according to the Generalitat's agriculture department, it is made in the municipality of Agramunt (Urgell) from hazelnuts or almonds, sugar, honey and egg white, in bars covered with wafer paper, and the pack must carry the name \"Torró d'Agramunt. Indicació Geogràfica Protegida\" and the logo.",
      "**On Sant Esteve, canelons.** Catalan cannelloni are filled with the roast meat left over from Christmas lunch, which is what sets them apart from the Italian kind, made with minced meat and tomato sofregit. Sheets of pasta are filled, rolled, covered with béchamel and browned with cheese.",
    ),
    ...h2(
      "Is 26 December (Sant Esteve) a holiday in Catalonia?",
      `**Yes. ${dayDate(D.santEsteve, "en")} is a public holiday across Catalonia**, according to the official calendar of work holidays (Ordre EMT/66/2025). The exception is Aran, where the Festa d'Aran, held on ${dayDate(ARAN_DAY, "en")}, replaces it, so 26 December is a working day there.`,
      `It is not a holiday everywhere in Spain: in the BOE's table for 2026, 26 December is a holiday only in Catalonia and the Balearic Islands. Nor is it a holiday every year: in 2027, 26 December is a ${weekday(D.santEsteveNextYear, "en")} and does not appear in the calendar of work holidays (Ordre EMT/52/2026).`,
      `It is the day for getting together again, above all with the side of the family you did not spend Christmas with; as the Catalan saying goes, "Per Nadal, cada ovella al seu corral; per Sant Esteve, cada ovella a casa seva" (at Christmas every sheep in its fold, on Sant Esteve every sheep in its own home). What is open on 25 and 26 December is in ${b2link("christmasBarcelona", "en", "Christmas in Barcelona")} and ${b2link("shops", "en", "our guide to shops open on Sundays and holidays")}.`,
    ),
    ...h2(
      "New Year's Eve and the Three Kings",
      `New Year's Eve, with the twelve grapes and the city's celebration, has its own guide: ${b2link("newYear", "en", "New Year's Eve in Barcelona")}. The Three Kings arrive on the evening of 5 January, and ${dayDate(D.reis, "en")} is a public holiday in Catalonia (Ordre EMT/52/2026); the times and route of Barcelona's parade will be added to that same guide once they are published.`,
    ),
    ...h2("Where to see it and buy it in 2026"),
    list(
      `**Fira de Santa Llúcia**, in front of Barcelona Cathedral, where it has been held since 1786: it has a section for nativity scenes and figures, caganers included, and a greenery section with moss, cork and tió logs. ${santaLluciaSentence("en", facts)} Dates and the other fairs are in ${b2link("christmas", "en", "our Christmas markets guide")}.`,
      `**The Plaça de Sant Jaume nativity scene**: see ${b2link("christmasBarcelona", "en", "Christmas in Barcelona")}.`,
      `**Living nativity scenes** across Catalonia, with the dates already official: ${b2link("pessebres", "en", "our living nativity scenes guide")}.`,
      `**Pastorets**: the Coordinadora de Pastorets de Catalunya's [Pastorets finder](${PASTORETS_FINDER}).`,
    ),
    faq([
      { question: "What is the caga tió?", answer: "A log that Catalan children feed and keep under a blanket in the run-up to Christmas. On Christmas Eve or Christmas Day they beat it with sticks while singing \"Caga tió\", and it \"poos\" presents: sweets, turrón, neules and small gifts." },
      { question: "When do Catalans make the tió poo?", answer: "On Christmas Eve (24 December) or Christmas Day (25 December), depending on the family. It is fed for some days beforehand; by tradition from 8 December, the Immaculada." },
      { question: "Why is there a caganer in the nativity scene?", answer: "He is said to bring good luck, especially when well hidden behind a tree or under a bridge. What the figure actually means is still debated: there is no single explanation." },
      { question: "Is 26 December 2026 a public holiday in Catalonia?", answer: `Yes. ${dayDate(D.santEsteve, "en")}, Sant Esteve, is a holiday across Catalonia except in Aran, where the Festa d'Aran (17 June) replaces it. In 2027, 26 December falls on a Sunday and is not a holiday.` },
      { question: "What do Catalans eat at Christmas?", answer: "On Christmas Day, escudella (broth with galets pasta) and carn d'olla, with turrón and neules for dessert. On Sant Esteve, canelons made with the roast meat left over from Christmas lunch." },
      { question: "When is the Missa del Gall?", answer: `At midnight on Christmas Eve, between 24 and 25 December. In 2026, 24 December is a ${weekday(D.nitDeNadal, "en")} and a working day.` },
      { question: "Where can I buy a caganer or a tió in Barcelona?", answer: buyAnswer("en", facts) },
    ]),
    ...paras(verifiedLine("en", TRADITIONS_VERIFIED)),
    ...b2Related([...RELATED], "en"),
  ];
}

export function buildChristmasTraditionsBody(locale: Locale, facts: TraditionAnnouncements = ANNOUNCED_TRADITIONS) {
  if (locale === "ca") return bodyCa(facts);
  if (locale === "es") return bodyEs(facts);
  return bodyEn(facts);
}

export const CHRISTMAS_TRADITIONS: B2Article = {
  key: "christmasTraditions",
  entryKey: "guide-catalan-christmas-traditions",
  categoryKey: "festivals",
  sources: SOURCES,
  // Reused from the manifest, not a new photograph (see the header comment).
  heroKey: CHRISTMAS.secondaryKey,
  // Same alt and caption as the Christmas markets guide's second image:
  // media rows are keyed by file, so other wording would overwrite it there.
  heroAlt: CHRISTMAS.secondaryAlt,
  heroCaption: CHRISTMAS.secondaryCaption,
  verifiedAt: TRADITIONS_VERIFIED,
  publishedAt: "2026-10-26T12:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [
      locale,
      { ...CHRISTMAS_TRADITIONS_META[locale], blocks: buildChristmasTraditionsBody(locale) },
    ]),
  ) as B2Article["editions"],
};
