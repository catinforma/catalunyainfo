import type { Block } from "@/lib/content/blocks";
import { WEEKDAY_NAMES, shortDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

import { dateYear } from "./festive";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  keyFacts,
  languageLinks,
  lead,
  list,
  paras,
  verifiedLine,
  type B2Article,
  type B2Key,
  type B2Source,
} from "./shared";

/**
 * Gran Recapte d'Aliments 2026: Catalonia's food-bank collection, on
 * year-free URLs (guies/gran-recapte-aliments, guias/gran-recapte-alimentos,
 * guides/gran-recapte-food-drive-catalonia) with the year in the titles.
 *
 * AS_OF 2026-11-04 (GRAN_RECAPTE_AS_OF). Every fact was read that day in the
 * raw HTML of the organisers' own pages, and nowhere else:
 *
 *  - https://www.granrecapte.org/ca/ (granrecapte.com now 301-redirects to
 *    acatbal.org; the campaign site is granrecapte.org): "Aquest 13 i 14 de
 *    novembre ... Gran Recapte 2026. Aquest any dedicat a les noves pobreses."
 *  - https://www.granrecapte.org/ca/gran-recapte-2026/ (and /es/): since 2009,
 *    the four food banks, "més de 2.000 punts de recollida", "més de 170.000
 *    persones durant dos mesos" through "569 entitats socials", the noves
 *    pobreses profiles, food prices "prop d'un 32%" up 2020-2025.
 *  - https://www.granrecapte.org/ca/fes-una-donacio-daliments/ (and /es/):
 *    "Els dies 13 i 14 de novembre, trobaràs punts de recollida d'aliments a
 *    tots els supermercats que col·laboren"; the chain logos (CHAINS below,
 *    the ambiguous files identified by eye: Vector.png Cal Fruitós,
 *    images-2.png Charter, michelangelo2-1.png Montserrat Supermercats,
 *    images-1-1.png Superestalvi; one orange "M" logo left out, unidentified);
 *    the shop list by town, supermercats-Gran-Recapte-donacions.pdf (only
 *    08xxx postcodes: towns in the province of Barcelona).
 *  - https://www.granrecapte.org/ca/fes-un-donatiu-economic/ (and /es/):
 *    Mercadona, El Corte Inglés and Consum take money at the till only, "en
 *    lloc de fer una donació d'aliments"; Barcelona's six municipal markets
 *    (Sants, Santa Caterina, Barceloneta, Ninot, Sarrià, Clot) on 13-14 Nov.
 *  - https://www.granrecapte.org/ca/fes-un-donatiu/ (and /es/): online, the
 *    "supermercat solidari", Bizum "codi del Gran Recapte: 33596 i el teu codi
 *    postal al camp Concepte", bank transfer (the IBAN is deliberately not
 *    copied), "Truca al 900 898 076". The online form takes card, PayPal,
 *    Bizum and direct debit (.../fes-un-donatiu-economic/en-linia/). The tax
 *    box: 80% of the first 250 euros, 40% above, 45% for repeat donors, up to
 *    10% of the taxable base.
 *  - https://www.granrecapte.org/ca/fes-voluntariat/ (and /es/haz-voluntariado/):
 *    4-hour shifts, coordinators, groups of at least 2, sign-up at
 *    voluntariat.granrecapte.org or the app, returning volunteers log in with
 *    their DNI. No closing date is published.
 *  - https://www.granrecapte.org/ca/transparencia/ (and /es/): "Les xifres de
 *    l'edició 2025: +5.2 M€ equivalents ... 17.500 persones" volunteers.
 *  - https://acatbal.org/gran-recapte-2026/ (14 Oct 2026): "13 i 14 de
 *    novembre ... la 18a edició"; https://acatbal.org/el-gran-recapte/: web
 *    donations "fins a mitjans de desembre", 2025 data (5,257,693 raised,
 *    17,542 volunteers: agrees with the campaign site).
 *  - Banc dels Aliments de Girona, https://bancdelsalimentsgirona.org/el-gran-recapte-2026-es-mobilitza-pel-pais/:
 *    2025 money bought "oli, llet i conserves ... peix, carn i ous"; its own
 *    Bizum 00929 (https://bancdelsalimentsgirona.org/gran-recapte/).
 *  - Banc dels Aliments de les Comarques de Lleida, note of 13 Oct 2026 (13-14
 *    Nov, Bizum 33596) and of 19 Oct 2026 (ECTS credits for UdL students).
 *  - Banc dels Aliments de les Comarques de Tarragona, El Gran Recapte page:
 *    "Necessitem llegums secs, oli, llet, llaunes de conserva de peix i
 *    aliments infantils" (the only list of foods any organiser publishes; no
 *    date on the page); its own sign-up form (/inscripcions).
 *
 * Left out on purpose (sources disagree or say nothing): the volunteer
 * target (15,000 for ACATBAL and Lleida, 17,000 for Girona), the 2025
 * tonnage (1,556 t on granrecapte.org, 1,341,766 kg on acatbal.org), any
 * collection hours (none published), a volunteer deadline (none published),
 * the IBAN, the per-bank phone numbers. Fact pack:
 * research_notes/gran-recapte-2026.md (gitignored).
 *
 * To refresh: re-read the pages above, update the copy, move
 * GRAN_RECAPTE_AS_OF, test, deploy, publish `gran-recapte`. After the
 * campaign the organisers publish the 2026 results: add them (the results
 * section and FAQ) and move AS_OF past 14 November before
 * GRAN_RECAPTE_REFRESH_BY, when a test starts failing.
 *
 * Linked from two existing pages, one body sentence each, both read from
 * granRecapteMention(): La Marató (volunteering section) and the Barcelona
 * markets guide (tips list). They go out with `gran-recapte-links`.
 *
 * No new photograph: the hero is the markets guide's lead picture (the roof
 * of Santa Caterina market, one of the six markets with a donation point;
 * CC BY 2.0), with that guide's exact alt text and caption, because media
 * rows are keyed by file. The strings are copied, not imported, so that
 * family-markets.ts can import this module without a cycle; a test keeps
 * them equal.
 */

export const GRAN_RECAPTE_AS_OF = "2026-11-04";
/** After this day the page must have been re-read after the campaign (a test fails otherwise). */
export const GRAN_RECAPTE_REFRESH_BY = "2026-11-20";

export const GRAN_RECAPTE = {
  edition: 18,
  days: ["2026-11-13", "2026-11-14"] as const,
  bizum: "33596",
  bizumGirona: "00929",
  phone: "900 898 076",
} as const;

export const GR_URLS = {
  home: { ca: "https://www.granrecapte.org/ca/", es: "https://www.granrecapte.org/es/" },
  edition: { ca: "https://www.granrecapte.org/ca/gran-recapte-2026/", es: "https://www.granrecapte.org/es/gran-recapte-2026/" },
  food: { ca: "https://www.granrecapte.org/ca/fes-una-donacio-daliments/", es: "https://www.granrecapte.org/es/haz-una-donacion-de-alimentos/" },
  money: { ca: "https://www.granrecapte.org/ca/fes-un-donatiu-economic/", es: "https://www.granrecapte.org/es/haz-un-donativo-economico/" },
  donate: { ca: "https://www.granrecapte.org/ca/fes-un-donatiu/", es: "https://www.granrecapte.org/es/haz-un-donativo/" },
  online: "https://www.granrecapte.org/ca/fes-un-donatiu-economic/en-linia/",
  volunteer: { ca: "https://www.granrecapte.org/ca/fes-voluntariat/", es: "https://www.granrecapte.org/es/haz-voluntariado/" },
  signUp: "https://voluntariat.granrecapte.org/vol/",
  transparency: { ca: "https://www.granrecapte.org/ca/transparencia/", es: "https://www.granrecapte.org/es/transparencia/" },
  shopList: "https://www.granrecapte.org/wp-content/uploads/2026/10/supermercats-Gran-Recapte-donacions.pdf",
  acatbal2026: "https://acatbal.org/gran-recapte-2026/",
  acatbal: "https://acatbal.org/el-gran-recapte/",
  girona: "https://bancdelsalimentsgirona.org/gran-recapte/",
  gironaNote: "https://bancdelsalimentsgirona.org/el-gran-recapte-2026-es-mobilitza-pel-pais/",
  lleida: "https://www.bancalimentslleida.cat/",
  lleidaNote:
    "https://www.bancalimentslleida.cat/ca/ultimes-noticies/el-banc-dels-aliments-de-les-comarques-de--lleida-fa-una-crida-per-aconseguir-1100-voluntaris-de-cara-al-gran-recapte-2026-dels-dies-13-i-14-de-novembre",
  lleidaUdl: "https://www.bancalimentslleida.cat/ca/ultimes-noticies/els-estudiants-de-la-udl-podran-sumar-credits-ects-fent-voluntariat-al-gran-recapte-2026",
  tarragona: "https://www.bancalimentstarragona.org/ca/El-Gran-Recapte",
  tarragonaSignUp: "https://www.bancalimentstarragona.org/inscripcions",
  barcelona: "https://www.bancdelsaliments.org/ca/",
} as const;

/** The chains whose logos the organisers show on the food-donation page, 4 Nov 2026. */
export const CHAINS = [
  "Alcampo",
  "Aldi",
  "Ametller Origen",
  "bonÀrea",
  "Bonpreu/Esclat",
  "Cal Fruitós",
  "Caprabo",
  "Carrefour",
  "Charter",
  "Condis",
  "Covalco",
  "Eurospar",
  "Facsa",
  "Gros Mercat",
  "Jodofi",
  "La Sirena",
  "Llobet",
  "Makro",
  "Montserrat Supermercats",
  "Novavenda",
  "Plusfresc",
  "Proxim",
  "Roges Supermercats",
  "Sorli",
  "Spar",
  "Suma",
  "Superestalvi",
  "Supermas",
  "Superservis",
  "Valvi",
  "Veritas",
] as const;

/** The big chains named first in the FAQ (all in CHAINS). */
const FAQ_CHAINS = ["Alcampo", "Aldi", "Ametller Origen", "bonÀrea", "Bonpreu/Esclat", "Caprabo", "Carrefour", "Condis", "Sorli", "Spar", "Veritas"] as const;

/** Money at the till only, no food. */
export const MONEY_ONLY = ["Mercadona", "El Corte Inglés", "Consum"] as const;

/** Barcelona municipal markets with a donation point on both days. */
export const MARKETS_BCN: Record<Locale, string[]> = {
  ca: ["Sants", "Santa Caterina", "la Barceloneta", "el Ninot", "Sarrià", "el Clot"],
  es: ["Sants", "Santa Caterina", "la Barceloneta", "el Ninot", "Sarrià", "el Clot"],
  en: ["Sants", "Santa Caterina", "Barceloneta", "Ninot", "Sarrià", "Clot"],
};

/** Copied from family-markets.ts MARKETS (same file, same media row); a test keeps them equal. */
export const GR_HERO = {
  key: "mercats-santa-caterina-coberta",
  alt: {
    ca: "La coberta ondulada de colors del mercat de Santa Caterina",
    es: "La cubierta ondulada de colores del mercado de Santa Caterina",
    en: "The colourful wave-shaped roof of Santa Caterina market",
  },
  caption: {
    ca: "La coberta del mercat de Santa Caterina.",
    es: "La cubierta del mercado de Santa Caterina.",
    en: "The roof of Santa Caterina market.",
  },
} as const;

const RELATED: B2Key[] = ["marato", "markets", "shops", "christmasLights"];

const link = (href: string, label: string) => `[${label}](${href})`;
const AND: Record<Locale, string> = { ca: " i ", es: " y ", en: " and " };
const joinNames = (names: readonly string[], locale: Locale) =>
  names.length < 2 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")}${AND[locale]}${names[names.length - 1]}`;

/**
 * "divendres 13 i dissabte 14 de novembre" / "viernes 13 y sábado 14 de
 * noviembre" / "Friday 13 and Saturday 14 November", weekdays computed from
 * the dates. `article` adds "el" (ca, es) before each day; `weekday: false`
 * drops the weekdays ("el 13 i el 14 de novembre").
 */
export function daysText(locale: Locale, opts: { year?: boolean; article?: boolean; weekday?: boolean } = {}): string {
  const [first, second] = GRAN_RECAPTE.days;
  const withWeekday = opts.weekday ?? true;
  const weekday = (iso: string) => (withWeekday ? `${WEEKDAY_NAMES[locale][weekdayIndex(iso)] ?? ""} ` : "");
  const art = opts.article && locale !== "en" ? "el " : "";
  const day1 = String(Number(first.slice(8, 10)));
  const year = opts.year ? (locale === "en" ? ` ${second.slice(0, 4)}` : ` de ${second.slice(0, 4)}`) : "";
  return `${art}${weekday(first)}${day1}${AND[locale]}${art}${weekday(second)}${shortDate(second, locale)}${year}`;
}

/* -------------------------------------------------------------------------- */
/* Titles                                                                     */
/* -------------------------------------------------------------------------- */

export const GRAN_RECAPTE_META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/gran-recapte-aliments",
    title: "Gran Recapte 2026: divendres 13 i dissabte 14 de novembre, on i què donar i com fer-te voluntari",
    seoTitle: "Gran Recapte 2026: 13 i 14 de novembre, com fer-te voluntari",
    seoDescription:
      "El Gran Recapte 2026 és el divendres 13 i el dissabte 14 de novembre als supermercats. Què donar, com fer-te voluntari, cadenes i Bizum 33596.",
    excerpt:
      "Quan és el Gran Recapte d'aliments 2026, a quins supermercats donar, quins aliments es demanen, com fer-te voluntari i com fer un donatiu, amb les dades de l'organització.",
  },
  es: {
    path: "guias/gran-recapte-alimentos",
    title: "Gran Recapte 2026: viernes 13 y sábado 14 de noviembre, dónde y qué donar y cómo ser voluntario",
    seoTitle: "Gran Recapte 2026: 13 y 14 de noviembre, cómo ser voluntario",
    seoDescription:
      "El Gran Recapte 2026 es el viernes 13 y el sábado 14 de noviembre en los supermercados. Qué donar, cómo ser voluntario, cadenas y Bizum 33596.",
    excerpt:
      "Cuándo es el Gran Recapte de alimentos 2026, en qué supermercados donar, qué alimentos se piden, cómo ser voluntario y cómo hacer un donativo, con los datos de la organización.",
  },
  en: {
    path: "guides/gran-recapte-food-drive-catalonia",
    title: "Gran Recapte 2026: Catalonia's food bank drive on Friday 13 and Saturday 14 November, where to give and how to volunteer",
    seoTitle: "Gran Recapte 2026: 13–14 November food drive, how to help",
    seoDescription:
      "Catalonia's Gran Recapte food drive is on Friday 13 and Saturday 14 November 2026 in supermarkets. What to give, how to volunteer, chains and Bizum code.",
    excerpt:
      "When the Gran Recapte 2026 food collection is, which supermarkets take part, what food to give, how to volunteer and how to donate money, from the organisers' own pages.",
  },
};

/* -------------------------------------------------------------------------- */
/* Sentence for the pages that link here                                      */
/* -------------------------------------------------------------------------- */

/**
 * One body sentence for an existing page: La Marató's volunteering section
 * ("marato") or the Barcelona markets guide's tips ("markets").
 */
export function granRecapteMention(locale: Locale, where: "marato" | "markets"): string {
  const days = daysText(locale, { year: true, article: true });
  // No weekdays on La Marató's page: its weekday test reads every "weekday +
  // day" there as a December date.
  const bare = daysText(locale, { year: true, article: true, weekday: false });
  const markets = joinNames(MARKETS_BCN[locale], locale);
  const texts: Record<"marato" | "markets", Record<Locale, string>> = {
    marato: {
      ca: `Abans, al novembre, hi ha l'altra gran campanya solidària de l'any: el Gran Recapte d'aliments, ${bare}, als supermercats de tot Catalunya, que també busca voluntaris. Com fer-t'hi voluntari o donar-hi, a ${b2link("granRecapte", "ca", "la guia del Gran Recapte 2026")}.`,
      es: `Antes, en noviembre, llega la otra gran campaña solidaria del año: el Gran Recapte de alimentos, ${bare}, en los supermercados de toda Cataluña, que también busca voluntarios. Cómo ser voluntario o donar, en ${b2link("granRecapte", "es", "la guía del Gran Recapte 2026")}.`,
      en: `Before that, in November, comes the year's other big charity drive: the Gran Recapte food collection, on ${bare}, in supermarkets across Catalonia, which also needs volunteers. How to volunteer or give is in ${b2link("granRecapte", "en", "our Gran Recapte 2026 guide")}.`,
    },
    markets: {
      ca: `**Gran Recapte:** ${days}, sis mercats municipals de Barcelona (${markets}) tenen un punt de donació del Gran Recapte d'aliments. Ho expliquem a ${b2link("granRecapte", "ca", "la guia del Gran Recapte 2026")}.`,
      es: `**Gran Recapte:** ${days}, seis mercados municipales de Barcelona (${markets}) tienen un punto de donación del Gran Recapte de alimentos. Lo explicamos en ${b2link("granRecapte", "es", "la guía del Gran Recapte 2026")}.`,
      en: `**Gran Recapte:** on ${days}, six of Barcelona's municipal markets (${markets}) have a donation point for the Gran Recapte food drive. Details in ${b2link("granRecapte", "en", "our Gran Recapte 2026 guide")}.`,
    },
  };
  return texts[where][locale];
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

export function buildGranRecapteBody(locale: Locale): Block[] {
  const daysYear = daysText(locale, { year: true, article: true });
  const days = daysText(locale, { article: true });
  const daysCap = daysText(locale, { year: true });
  const chains = joinNames(CHAINS, locale);
  const faqChains = joinNames(FAQ_CHAINS, locale);
  const moneyOnly = joinNames(MONEY_ONLY, locale);
  const markets = joinNames(MARKETS_BCN[locale], locale);
  const asOf = dateYear(GRAN_RECAPTE_AS_OF, locale);
  const { bizum, bizumGirona, phone, edition } = GRAN_RECAPTE;

  if (locale === "ca") {
    return [
      lead(
        `**El Gran Recapte 2026 és ${days}.** Aquests dos dies, els supermercats col·laboradors de tot Catalunya tenen punts de recollida on pots deixar aliments per als quatre Bancs dels Aliments. És la ${edition}a edició i, per primer cop, està dedicada a les «noves pobreses»: persones que, fins i tot amb feina o amb pensió, no arriben a final de mes. També hi pots col·laborar fent un torn de voluntariat de quatre hores o amb un donatiu, per exemple per Bizum amb el codi ${bizum}.`,
      ),
      keyFacts("El Gran Recapte 2026, d'un cop d'ull", [
        { label: "Dies", value: daysCap.charAt(0).toUpperCase() + daysCap.slice(1) },
        { label: "On", value: "Als supermercats col·laboradors de tot Catalunya: més de 2.000 punts de recollida" },
        { label: "Què donar", value: "Llegums secs, oli, llet, conserves de peix i aliments infantils (Banc dels Aliments de Tarragona)" },
        { label: "Voluntariat", value: "Torns de 4 hores en un punt de recollida; inscripció a voluntariat.granrecapte.org o a l'app del Gran Recapte" },
        { label: "Bizum", value: `Codi ${bizum}, amb el teu codi postal al camp «Concepte»` },
        { label: moneyOnly, value: "Només donatiu en diners a la caixa, no aliments" },
        { label: "Organitzen", value: "Els quatre Bancs dels Aliments de Catalunya: Barcelona, Girona, Lleida i Tarragona" },
      ]),
      languageLinks(),
      callout(
        "info",
        "Com tractem les dades",
        `Tot el que hi ha en aquesta pàgina surt de la web del Gran Recapte (granrecapte.org), de l'Associació Catalana de Bancs dels Aliments i de les webs dels quatre Bancs dels Aliments, consultades el ${asOf}. L'organització no ha publicat cap data límit per inscriure's al voluntariat ni cap horari de recollida comú a totes les botigues, i per això no n'hi posem. Quan publiqui els resultats del 2026, els afegirem.`,
      ),
      ...h2(
        "Quan és el Gran Recapte 2026?",
        `${daysYear.charAt(0).toUpperCase() + daysYear.slice(1)}. Els dos dies hi ha punts de recollida d'aliments als supermercats col·laboradors, amb voluntaris que expliquen la campanya i recullen el que dones. La web del Gran Recapte no indica cap horari comú de recollida; els torns de voluntariat són de quatre hores.`,
        "Es fa alhora a tot Catalunya, amb més de 2.000 punts de recollida segons l'organització. Els donatius en diners, en canvi, no s'han de fer necessàriament aquells dos dies: segons l'Associació Catalana de Bancs dels Aliments, per internet es poden fer durant la campanya i fins a mitjans de desembre.",
      ),
      ...h2(
        "On donar: supermercats i mercats que hi participen",
        `**Als supermercats que col·laboren amb el Gran Recapte.** A la seva ${link(GR_URLS.food.ca, "pàgina de donació d'aliments")}, l'organització hi mostra aquestes cadenes: ${chains}. A la mateixa pàgina hi ha el ${link(GR_URLS.shopList, "llistat de botigues per població (PDF)")}, amb municipis de la província de Barcelona; a les comarques de Girona, Lleida i Tarragona, informa-te'n al ${link(GR_URLS.girona, "Banc dels Aliments de Girona")}, al ${link(GR_URLS.lleida, "de Lleida")} o al ${link(GR_URLS.tarragona, "de Tarragona")}.`,
        `**${moneyOnly}** també hi col·laboren, però d'una altra manera: segons la web del Gran Recapte, en aquests supermercats només s'hi pot fer un donatiu en diners directament a la caixa, no una donació d'aliments.`,
        `**Mercats municipals de Barcelona.** A la ciutat de Barcelona, ${days} també es pot fer un donatiu al punt senyalitzat de sis mercats: ${markets}. Segons l'organització, les entitats socials de cada barri faran servir aquests diners per comprar producte fresc als mateixos mercats i repartir-lo entre els veïns que més ho necessiten.`,
      ),
      ...h2(
        "Quins aliments donar al Gran Recapte",
        `El Banc dels Aliments de les Comarques de Tarragona ho resumeix així a la ${link(GR_URLS.tarragona, "seva pàgina del Gran Recapte")}: «Necessitem llegums secs, oli, llet, llaunes de conserva de peix i aliments infantils». Són, diu, aliments d'alt valor nutritiu, bàsics en l'alimentació de les persones.`,
        "L'any passat, els diners recollits van servir per comprar aliments com oli, llet i conserves, i també peix, carn i ous, segons el Banc dels Aliments de Girona. I la web del Gran Recapte recorda que, amb els donatius, els Bancs compren aliments a preus més baixos.",
      ),
      ...h2(
        "Com fer-te voluntari del Gran Recapte 2026",
        `T'hi pots inscriure des de la ${link(GR_URLS.volunteer.ca, "pàgina de voluntariat del Gran Recapte")} o amb l'app del Gran Recapte (iOS i Android). Hi ha tres maneres de participar-hi:`,
      ),
      list(
        `**Voluntari o voluntària:** un torn de quatre hores en un punt de recollida, amb un equip. Informes la gent, ajudes a recollir les donacions i a classificar els aliments. Inscripció a ${link(GR_URLS.signUp, "voluntariat.granrecapte.org")}.`,
        "**Coordinador o coordinadora:** coordines un o més punts de recollida durant els dos dies. Fas el seguiment de les inscripcions, dones suport a l'equip de voluntariat i gestiones el material.",
        "**En grup:** amb amics, família o companys de feina. Amb un mínim de dues persones ja podeu cobrir un torn de quatre hores en un supermercat.",
      ),
      ...paras(
        `Si t'hi vas inscriure en edicions anteriors, només cal que et descarreguis l'app i hi entris amb el DNI. L'organització no ha publicat cap data límit: el ${asOf} la inscripció era oberta. El Banc dels Aliments de Tarragona també té ${link(GR_URLS.tarragonaSignUp, "el seu propi formulari d'inscripció")}, i a Lleida els estudiants de la UdL poden obtenir crèdits ECTS fent voluntariat al Gran Recapte.`,
        "Si t'hi has inscrit però finalment no hi pots anar, l'organització demana que cancel·lis la inscripció i ho diguis a la persona coordinadora del teu punt de recollida, perquè algú altre pugui ocupar la plaça.",
      ),
      ...h2(
        "Com fer un donatiu en diners al Gran Recapte",
        `La ${link(GR_URLS.donate.ca, "pàgina de donatius del Gran Recapte")} ofereix aquestes vies:`,
      ),
      list(
        `**Per internet**, amb el ${link(GR_URLS.online, "formulari de donatiu")}: targeta, PayPal, Bizum o domiciliació bancària.`,
        `**Per Bizum**, a l'apartat «Fer un donatiu» o «Aportar a causes socials» de l'app del teu banc, amb el codi del Gran Recapte: **${bizum}**. Escriu el teu codi postal al camp «Concepte». El Banc dels Aliments de Girona també publica un codi propi, el ${bizumGirona}.`,
        `**Per telèfon**, al **${phone}**.`,
        "**Per transferència**, al compte que publica la pàgina de donatius. Copia'l de la web oficial, no d'un missatge ni d'una xarxa social.",
        "**Al «supermercat solidari»** en línia del Gran Recapte, enllaçat des de la mateixa pàgina de donatius.",
        `**A la caixa** de ${moneyOnly}, ${days}, i als sis mercats municipals de Barcelona que hi participen.`,
      ),
      ...paras(
        "**Desgravació.** Segons la web del Gran Recapte, els particulars es poden deduir a la declaració de la renda el 80% dels primers 250 € donats i el 40% de la resta (el 45% si durant tres anys han fet donatius per un import igual o superior al de l'any anterior), fins al 10% de la base liquidable. El certificat fiscal es demana des de la mateixa web.",
      ),
      ...h2(
        "Què és el Gran Recapte i qui l'organitza",
        `És la gran recollida anual d'aliments de Catalunya. La fan els quatre Bancs dels Aliments (Barcelona, Girona, Lleida i Tarragona) des del 2009, amb voluntaris, entitats socials, cadenes de distribució i empreses. Segons ${link(GR_URLS.edition.ca, "la web del Gran Recapte 2026")}, el que es recull cobreix durant dos mesos les necessitats bàsiques de més de 170.000 persones, a través d'una xarxa de 569 entitats socials de tot Catalunya.`,
        "El tema d'aquest any són les **noves pobreses**: persones grans que viuen soles amb pensions baixes, persones que treballen i no arriben a final de mes, famílies amb fills, classes mitjanes empobrides i joves que no es poden emancipar. Segons l'organització, entre el 2020 i el 2025 els aliments i les begudes no alcohòliques s'han encarit prop d'un 32%.",
        `La següent gran campanya solidària de l'any és ${b2link("marato", "ca", "La Marató de 3Cat, al desembre")}.`,
      ),
      ...h2(
        "Resultats del Gran Recapte 2025",
        `Segons ${link(GR_URLS.transparency.ca, "la pàgina de transparència del Gran Recapte")}, consultada el ${asOf}, l'edició del 2025 va recollir l'equivalent a més de 5,2 milions d'euros, entre aliments i donatius en diners, i hi van participar 17.500 persones voluntàries. Els resultats del 2026 els publicarà l'organització després de la campanya; els afegirem aquí.`,
      ),
      faq([
        { question: "Quan és el Gran Recapte 2026?", answer: `${daysYear.charAt(0).toUpperCase() + daysYear.slice(1)}, als supermercats col·laboradors de tot Catalunya.` },
        { question: "Quins supermercats participen al Gran Recapte 2026?", answer: `Segons la web del Gran Recapte, ${faqChains}, entre més de trenta cadenes. A ${moneyOnly} només s'hi pot fer un donatiu en diners a la caixa.` },
        { question: "Quins aliments puc donar?", answer: "Aliments bàsics i d'alt valor nutritiu. El Banc dels Aliments de Tarragona demana llegums secs, oli, llet, conserves de peix i aliments infantils." },
        { question: "Com em puc fer voluntari del Gran Recapte?", answer: "Inscrivint-te a voluntariat.granrecapte.org o a l'app del Gran Recapte. Un torn és de quatre hores en un punt de recollida; també t'hi pots apuntar en grup (mínim dues persones) o com a coordinador." },
        { question: "Fins quan em puc inscriure com a voluntari?", answer: `L'organització no ha publicat cap data límit, i el ${asOf} la inscripció era oberta. Les places de cada torn són limitades: si un torn ja és ple, en pots triar un altre.` },
        { question: "Quin és el Bizum del Gran Recapte?", answer: `El codi ${bizum}, a l'apartat «Fer un donatiu» o «Aportar a causes socials» de l'app del teu banc, amb el teu codi postal al camp «Concepte».` },
        { question: "Puc donar aliments a Mercadona?", answer: `No. Segons l'organització, a ${moneyOnly} només s'hi pot fer un donatiu en diners a la caixa, ${days}.` },
        { question: "Els donatius al Gran Recapte desgraven?", answer: "Sí. Segons la web del Gran Recapte, els particulars es poden deduir el 80% dels primers 250 € i el 40% de la resta (el 45% els donants habituals), fins al 10% de la base liquidable." },
        { question: "Quant es va recollir al Gran Recapte 2025?", answer: "L'equivalent a més de 5,2 milions d'euros, entre aliments i donatius, amb 17.500 persones voluntàries, segons l'organització." },
      ]),
      ...paras(verifiedLine("ca", GRAN_RECAPTE_AS_OF)),
      ...b2Related(RELATED, "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        `**El Gran Recapte 2026 es ${days}.** Esos dos días, los supermercados colaboradores de toda Cataluña tienen puntos de recogida donde puedes dejar alimentos para los cuatro Bancs dels Aliments (bancos de alimentos) catalanes. Es la ${edition}.ª edición y, por primera vez, está dedicada a las «nuevas pobrezas»: personas que, incluso con trabajo o con pensión, no llegan a final de mes. También puedes colaborar haciendo un turno de voluntariado de cuatro horas o con un donativo, por ejemplo por Bizum con el código ${bizum}.`,
      ),
      keyFacts("El Gran Recapte 2026, de un vistazo", [
        { label: "Días", value: daysCap.charAt(0).toUpperCase() + daysCap.slice(1) },
        { label: "Dónde", value: "En los supermercados colaboradores de toda Cataluña: más de 2.000 puntos de recogida" },
        { label: "Qué donar", value: "Legumbres secas, aceite, leche, conservas de pescado y alimentos infantiles (Banc dels Aliments de Tarragona)" },
        { label: "Voluntariado", value: "Turnos de 4 horas en un punto de recogida; inscripción en voluntariat.granrecapte.org o en la app del Gran Recapte" },
        { label: "Bizum", value: `Código ${bizum}, con tu código postal en el campo «Concepto»` },
        { label: moneyOnly, value: "Solo donativo en dinero en caja, no alimentos" },
        { label: "Organizan", value: "Los cuatro Bancs dels Aliments de Cataluña: Barcelona, Girona, Lleida y Tarragona" },
      ]),
      languageLinks(),
      callout(
        "info",
        "Cómo tratamos los datos",
        `Todo lo que hay en esta página sale de la web del Gran Recapte (granrecapte.org), de la Associació Catalana de Bancs dels Aliments y de las webs de los cuatro Bancs dels Aliments, consultadas el ${asOf}. La organización no ha publicado ninguna fecha límite para inscribirse como voluntario ni un horario de recogida común a todas las tiendas, y por eso no lo ponemos. Cuando publique los resultados de 2026, los añadiremos.`,
      ),
      ...h2(
        "¿Cuándo es el Gran Recapte 2026?",
        `${daysYear.charAt(0).toUpperCase() + daysYear.slice(1)}. Los dos días hay puntos de recogida de alimentos en los supermercados colaboradores, con voluntarios que explican la campaña y recogen lo que donas. La web del Gran Recapte no indica un horario de recogida común; los turnos de voluntariado son de cuatro horas.`,
        "Se celebra a la vez en toda Cataluña, con más de 2.000 puntos de recogida según la organización. Los donativos en dinero, en cambio, no tienen por qué hacerse esos dos días: según la Associació Catalana de Bancs dels Aliments, por internet se pueden hacer durante la campaña y hasta mediados de diciembre.",
      ),
      ...h2(
        "Dónde donar: supermercados y mercados que participan",
        `**En los supermercados que colaboran con el Gran Recapte.** En su ${link(GR_URLS.food.es, "página de donación de alimentos")}, la organización muestra estas cadenas: ${chains}. En la misma página está el ${link(GR_URLS.shopList, "listado de tiendas por población (PDF)")}, con municipios de la provincia de Barcelona; en las comarcas de Girona, Lleida y Tarragona, infórmate en el ${link(GR_URLS.girona, "Banc dels Aliments de Girona")}, en el ${link(GR_URLS.lleida, "de Lleida")} o en el ${link(GR_URLS.tarragona, "de Tarragona")}.`,
        `**${moneyOnly}** también colaboran, pero de otra forma: según la web del Gran Recapte, en estos supermercados solo se puede hacer un donativo en dinero directamente en caja, no una donación de alimentos.`,
        `**Mercados municipales de Barcelona.** En la ciudad de Barcelona, ${days} también se puede hacer un donativo en el punto señalizado de seis mercados: ${markets}. Según la organización, las entidades sociales de cada barrio usarán ese dinero para comprar producto fresco en los mismos mercados y repartirlo entre los vecinos que más lo necesitan.`,
      ),
      ...h2(
        "Qué alimentos donar en el Gran Recapte",
        `El Banc dels Aliments de les Comarques de Tarragona lo resume así en su ${link(GR_URLS.tarragona, "página del Gran Recapte")}: «Necessitem llegums secs, oli, llet, llaunes de conserva de peix i aliments infantils» (legumbres secas, aceite, leche, latas de conserva de pescado y alimentos infantiles). Son, dice, alimentos de alto valor nutritivo, básicos en la alimentación de las personas.`,
        "El año pasado, el dinero recaudado sirvió para comprar alimentos como aceite, leche y conservas, y también pescado, carne y huevos, según el Banc dels Aliments de Girona. Y la web del Gran Recapte recuerda que, con los donativos, los bancos compran alimentos a precios más bajos.",
      ),
      ...h2(
        "Cómo ser voluntario del Gran Recapte 2026",
        `Puedes inscribirte desde la ${link(GR_URLS.volunteer.es, "página de voluntariado del Gran Recapte")} o con la app del Gran Recapte (iOS y Android). Hay tres formas de participar:`,
      ),
      list(
        `**Voluntario o voluntaria:** un turno de cuatro horas en un punto de recogida, en equipo. Informas a la gente, ayudas a recoger las donaciones y a clasificar los alimentos. Inscripción en ${link(GR_URLS.signUp, "voluntariat.granrecapte.org")}.`,
        "**Coordinador o coordinadora:** coordinas uno o varios puntos de recogida durante los dos días. Haces el seguimiento de las inscripciones, apoyas al equipo de voluntariado y gestionas el material.",
        "**En grupo:** con amigos, familia o compañeros de trabajo. Con un mínimo de dos personas ya podéis cubrir un turno de cuatro horas en un supermercado.",
      ),
      ...paras(
        `Si te inscribiste en ediciones anteriores, solo tienes que descargarte la app y entrar con tu DNI. La organización no ha publicado ninguna fecha límite: el ${asOf} la inscripción estaba abierta. El Banc dels Aliments de Tarragona tiene además ${link(GR_URLS.tarragonaSignUp, "su propio formulario de inscripción")}, y en Lleida los estudiantes de la UdL pueden obtener créditos ECTS haciendo voluntariado en el Gran Recapte.`,
        "Si te has inscrito y al final no puedes ir, la organización pide que canceles la inscripción y avises a la persona coordinadora de tu punto de recogida, para que otra persona pueda ocupar la plaza.",
      ),
      ...h2(
        "Cómo hacer un donativo en dinero al Gran Recapte",
        `La ${link(GR_URLS.donate.es, "página de donativos del Gran Recapte")} ofrece estas vías:`,
      ),
      list(
        `**Por internet**, con el ${link(GR_URLS.online, "formulario de donativo")}: tarjeta, PayPal, Bizum o domiciliación bancaria.`,
        `**Por Bizum**, en el apartado «Hacer una donación» o «Aportar a causas sociales» de la app de tu banco, con el código del Gran Recapte: **${bizum}**. Escribe tu código postal en el campo «Concepto». El Banc dels Aliments de Girona publica también un código propio, el ${bizumGirona}.`,
        `**Por teléfono**, en el **${phone}**.`,
        "**Por transferencia**, a la cuenta que publica la página de donativos. Cópiala de la web oficial, no de un mensaje ni de una red social.",
        "**En el «supermercado solidario»** en línea del Gran Recapte, enlazado desde la misma página de donativos.",
        `**En caja** en ${moneyOnly}, ${days}, y en los seis mercados municipales de Barcelona que participan.`,
      ),
      ...paras(
        "**Desgravación.** Según la web del Gran Recapte, los particulares pueden deducirse en la declaración de la renta el 80% de los primeros 250 € donados y el 40% del resto (el 45% si durante tres años han donado un importe igual o superior al del año anterior), hasta el 10% de la base liquidable. El certificado fiscal se pide desde la misma web.",
      ),
      ...h2(
        "Qué es el Gran Recapte y quién lo organiza",
        `Es la gran recogida anual de alimentos de Cataluña. La hacen los cuatro Bancs dels Aliments (Barcelona, Girona, Lleida y Tarragona) desde 2009, con voluntarios, entidades sociales, cadenas de distribución y empresas. Según ${link(GR_URLS.edition.es, "la web del Gran Recapte 2026")}, lo que se recoge cubre durante dos meses las necesidades básicas de más de 170.000 personas, a través de una red de 569 entidades sociales de toda Cataluña.`,
        "El tema de este año son las **nuevas pobrezas**: personas mayores que viven solas con pensiones bajas, personas que trabajan y no llegan a final de mes, familias con hijos, clases medias empobrecidas y jóvenes que no pueden emanciparse. Según la organización, entre 2020 y 2025 los alimentos y las bebidas no alcohólicas se han encarecido cerca de un 32%.",
        `La siguiente gran campaña solidaria del año es ${b2link("marato", "es", "La Marató de 3Cat, en diciembre")}.`,
      ),
      ...h2(
        "Resultados del Gran Recapte 2025",
        `Según ${link(GR_URLS.transparency.es, "la página de transparencia del Gran Recapte")}, consultada el ${asOf}, la edición de 2025 recaudó el equivalente a más de 5,2 millones de euros, entre alimentos y donativos en dinero, y participaron 17.500 personas voluntarias. Los resultados de 2026 los publicará la organización después de la campaña; los añadiremos aquí.`,
      ),
      faq([
        { question: "¿Cuándo es el Gran Recapte 2026?", answer: `${daysYear.charAt(0).toUpperCase() + daysYear.slice(1)}, en los supermercados colaboradores de toda Cataluña.` },
        { question: "¿Qué supermercados participan en el Gran Recapte 2026?", answer: `Según la web del Gran Recapte, ${faqChains}, entre más de treinta cadenas. En ${moneyOnly} solo se puede hacer un donativo en dinero en caja.` },
        { question: "¿Qué alimentos puedo donar?", answer: "Alimentos básicos y de alto valor nutritivo. El Banc dels Aliments de Tarragona pide legumbres secas, aceite, leche, conservas de pescado y alimentos infantiles." },
        { question: "¿Cómo puedo ser voluntario del Gran Recapte?", answer: "Inscribiéndote en voluntariat.granrecapte.org o en la app del Gran Recapte. Un turno es de cuatro horas en un punto de recogida; también puedes apuntarte en grupo (mínimo dos personas) o como coordinador." },
        { question: "¿Hasta cuándo puedo inscribirme como voluntario?", answer: `La organización no ha publicado ninguna fecha límite, y el ${asOf} la inscripción estaba abierta. Las plazas de cada turno son limitadas: si un turno ya está lleno, puedes elegir otro.` },
        { question: "¿Cuál es el Bizum del Gran Recapte?", answer: `El código ${bizum}, en el apartado «Hacer una donación» o «Aportar a causas sociales» de la app de tu banco, con tu código postal en el campo «Concepto».` },
        { question: "¿Puedo donar alimentos en Mercadona?", answer: `No. Según la organización, en ${moneyOnly} solo se puede hacer un donativo en dinero en caja, ${days}.` },
        { question: "¿Los donativos al Gran Recapte desgravan?", answer: "Sí. Según la web del Gran Recapte, los particulares pueden deducirse el 80% de los primeros 250 € y el 40% del resto (el 45% los donantes habituales), hasta el 10% de la base liquidable." },
        { question: "¿Cuánto se recaudó en el Gran Recapte 2025?", answer: "El equivalente a más de 5,2 millones de euros, entre alimentos y donativos, con 17.500 personas voluntarias, según la organización." },
      ]),
      ...paras(verifiedLine("es", GRAN_RECAPTE_AS_OF)),
      ...b2Related(RELATED, "es"),
    ];
  }

  return [
    lead(
      `**The Gran Recapte 2026 is on ${days}.** On those two days, participating supermarkets across Catalonia have collection points where you can leave food for the region's four food banks (Bancs dels Aliments). It is the ${edition}th edition and, for the first time, it is dedicated to the "new poverty": people who cannot make ends meet even with a job or a pension. You can also help by volunteering for a four-hour shift or by giving money, for example by Bizum with code ${bizum}.`,
    ),
    keyFacts("The Gran Recapte 2026 at a glance", [
      { label: "Days", value: daysCap },
      { label: "Where", value: "Participating supermarkets all over Catalonia: more than 2,000 collection points" },
      { label: "What to give", value: "Dried pulses, oil, milk, tinned fish and baby food (Tarragona food bank)" },
      { label: "Volunteering", value: "Four-hour shifts at a collection point; sign up at voluntariat.granrecapte.org or in the Gran Recapte app" },
      { label: "Bizum", value: `Code ${bizum}, with your postcode in the "Concepto" (concept) field` },
      { label: moneyOnly, value: "Money at the till only, no food" },
      { label: "Organisers", value: "Catalonia's four food banks: Barcelona, Girona, Lleida and Tarragona" },
    ]),
    languageLinks(),
    callout(
      "info",
      "How we handle the details",
      `Everything on this page comes from the Gran Recapte website (granrecapte.org), the Catalan association of food banks and the four food banks' own websites, checked on ${asOf}. The organisers have not published a closing date for volunteer sign-up or collection hours common to every shop, so we do not give any. We will add the 2026 results once they publish them.`,
    ),
    ...h2(
      "When is the Gran Recapte 2026?",
      `On **${daysYear}**. On both days, participating supermarkets have food collection points staffed by volunteers who explain the campaign and take what you give. The Gran Recapte website gives no collection hours common to every shop; volunteer shifts last four hours.`,
      "It runs at the same time all over Catalonia, with more than 2,000 collection points according to the organisers. Money donations, on the other hand, do not have to be made on those two days: according to the Catalan association of food banks, you can give online during the campaign and until mid-December.",
    ),
    ...h2(
      "Where to give: participating supermarkets and markets",
      `**In supermarkets that take part in the Gran Recapte.** On their ${link(GR_URLS.food.es, "food donation page")} (in Catalan and Spanish), the organisers show these chains: ${chains}. The same page links a ${link(GR_URLS.shopList, "list of shops by town (PDF)")}, covering towns in the province of Barcelona; for the Girona, Lleida and Tarragona areas, check the ${link(GR_URLS.girona, "Girona")}, ${link(GR_URLS.lleida, "Lleida")} or ${link(GR_URLS.tarragona, "Tarragona")} food bank.`,
      `**${moneyOnly}** take part too, but differently: according to the Gran Recapte website, in these supermarkets you can only give money at the till, not food.`,
      `**Barcelona's municipal markets.** In the city of Barcelona, on ${days} you can also give money at the signposted point in six markets: ${markets}. According to the organisers, each neighbourhood's social organisations will use that money to buy fresh produce in the same markets and share it among the neighbours who need it most.`,
    ),
    ...h2(
      "What food to give to the Gran Recapte",
      `The Tarragona food bank (Banc dels Aliments de les Comarques de Tarragona) sums it up on its ${link(GR_URLS.tarragona, "Gran Recapte page")}: "Necessitem llegums secs, oli, llet, llaunes de conserva de peix i aliments infantils" (we need dried pulses, oil, milk, tinned fish and baby food). These are, it says, highly nutritious foods that are basic to people's diet.`,
      "Last year, the money collected bought food such as oil, milk and tinned food, as well as fish, meat and eggs, according to the Girona food bank. And the Gran Recapte website points out that, with money donations, the food banks buy food at lower prices.",
    ),
    ...h2(
      "How to volunteer for the Gran Recapte 2026",
      `Sign up from the ${link(GR_URLS.volunteer.es, "Gran Recapte volunteering page")} (in Catalan and Spanish) or in the Gran Recapte app (iOS and Android). There are three ways to take part:`,
    ),
    list(
      `**Volunteer:** a four-hour shift at a collection point, as part of a team. You tell shoppers about the campaign, help take in donations and sort the food. Sign up at ${link(GR_URLS.signUp, "voluntariat.granrecapte.org")}.`,
      "**Coordinator:** you coordinate one or more collection points over both days, following the sign-ups, supporting the volunteer team and handling the materials.",
      "**As a group:** with friends, family or colleagues. Any group of two or more people can cover a four-hour shift in a supermarket.",
    ),
    ...paras(
      `If you signed up in previous years, just download the app and log in with your DNI (Spanish ID number). The organisers have not published a closing date: on ${asOf} sign-up was open. The Tarragona food bank also runs ${link(GR_URLS.tarragonaSignUp, "its own sign-up form")}, and in Lleida, students at the University of Lleida (UdL) can earn ECTS credits by volunteering for the Gran Recapte.`,
      "If you have signed up but cannot make it after all, the organisers ask you to cancel your booking and tell the coordinator of your collection point, so that someone else can take the place.",
    ),
    ...h2(
      "How to give money to the Gran Recapte",
      `The ${link(GR_URLS.donate.es, "Gran Recapte donation page")} lists these options:`,
    ),
    list(
      `**Online**, with the ${link(GR_URLS.online, "donation form")}: card, PayPal, Bizum or direct debit.`,
      `**By Bizum** (the Spanish mobile payment service), in the "Hacer una donación" or "Aportar a causas sociales" section of your banking app, with the Gran Recapte code: **${bizum}**. Put your postcode in the concept field. The Girona food bank also publishes its own code, ${bizumGirona}.`,
      `**By phone**, on **${phone}**.`,
      "**By bank transfer**, to the account shown on the donation page. Copy it from the official website, never from a message or a social media post.",
      "**In the online \"supermercat solidari\"** (charity supermarket), linked from the same donation page.",
      `**At the till** in ${moneyOnly} on ${days}, and at the six participating Barcelona municipal markets.`,
    ),
    ...paras(
      "**Tax relief.** According to the Gran Recapte website, individuals paying Spanish income tax can deduct 80% of the first €250 donated and 40% of the rest (45% for those who have given the same amount or more for three years), up to 10% of the taxable base. The tax certificate is requested on the same website.",
    ),
    ...h2(
      "What is the Gran Recapte and who runs it",
      `It is Catalonia's big yearly food collection, run since 2009 by the region's four food banks (Barcelona, Girona, Lleida and Tarragona) with volunteers, social organisations, retail chains and companies. According to ${link(GR_URLS.edition.es, "the Gran Recapte 2026 website")}, what it collects covers the basic needs of more than 170,000 people for two months, through a network of 569 social organisations across Catalonia.`,
      "This year's theme is the **new poverty**: older people living alone on small pensions, people in work who cannot make ends meet, families with children, a squeezed middle class and young people who cannot afford to leave home. According to the organisers, food and soft drinks became about 32% more expensive between 2020 and 2025.",
      `The year's next big charity event is ${b2link("marato", "en", "La Marató, TV3's telethon, in December")}.`,
    ),
    ...h2(
      "Gran Recapte 2025 results",
      `According to ${link(GR_URLS.transparency.es, "the Gran Recapte transparency page")}, checked on ${asOf}, the 2025 edition raised the equivalent of more than €5.2 million in food and money donations, with 17,500 volunteers. The organisers will publish the 2026 results after the campaign; we will add them here.`,
    ),
    faq([
      { question: "When is the Gran Recapte 2026?", answer: `On ${daysYear}, in participating supermarkets across Catalonia.` },
      { question: "Which supermarkets take part in the Gran Recapte 2026?", answer: `According to the Gran Recapte website, ${faqChains}, among more than thirty chains. In ${moneyOnly} you can only give money at the till.` },
      { question: "What food can I give?", answer: "Basic, highly nutritious food. The Tarragona food bank asks for dried pulses, oil, milk, tinned fish and baby food." },
      { question: "How can I volunteer for the Gran Recapte?", answer: "Sign up at voluntariat.granrecapte.org or in the Gran Recapte app. A shift is four hours at a collection point; you can also sign up as a group (two people or more) or as a coordinator." },
      { question: "Is there a deadline to sign up as a volunteer?", answer: `The organisers have not published one, and on ${asOf} sign-up was open. Each shift has a limited number of places: if one is full, you can choose another.` },
      { question: "What is the Gran Recapte Bizum code?", answer: `Code ${bizum}, in the donations section of your banking app ("Hacer una donación" or "Aportar a causas sociales"), with your postcode in the concept field.` },
      { question: "Can I give food at Mercadona?", answer: `No. According to the organisers, in ${moneyOnly} you can only give money at the till, on ${days}.` },
      { question: "Are donations to the Gran Recapte tax-deductible?", answer: "Yes, for Spanish income tax payers. According to the Gran Recapte website, individuals can deduct 80% of the first €250 and 40% of the rest (45% for regular donors), up to 10% of the taxable base." },
      { question: "How much did the Gran Recapte 2025 raise?", answer: "The equivalent of more than €5.2 million in food and money, with 17,500 volunteers, according to the organisers." },
    ]),
    ...paras(verifiedLine("en", GRAN_RECAPTE_AS_OF)),
    ...b2Related(RELATED, "en"),
  ];
}

/* -------------------------------------------------------------------------- */
/* Sources and article                                                        */
/* -------------------------------------------------------------------------- */

const SOURCES: B2Source[] = [
  { name: "Gran Recapte d'aliments", url: GR_URLS.home.ca, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Gran Recapte 2026", url: GR_URLS.edition.ca, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Gran Recapte 2026 (castellano)", url: GR_URLS.edition.es, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Fes una donació d'aliments", url: GR_URLS.food.ca, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Haz una donación de alimentos", url: GR_URLS.food.es, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Supermercats del Gran Recapte per població (PDF)", url: GR_URLS.shopList, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Fes un donatiu econòmic", url: GR_URLS.money.ca, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Haz un donativo económico", url: GR_URLS.money.es, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Fes un donatiu ara", url: GR_URLS.donate.ca, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Haz un donativo ahora", url: GR_URLS.donate.es, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Donatiu econòmic en línia", url: GR_URLS.online, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Fes voluntariat", url: GR_URLS.volunteer.ca, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Haz voluntariado", url: GR_URLS.volunteer.es, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Transparència: les xifres de l'edició 2025", url: GR_URLS.transparency.ca, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Transparencia: las cifras de la edición 2025", url: GR_URLS.transparency.es, publisher: "Associació Catalana Banc dels Aliments" },
  { name: "Gran Recapte 2026. Ja ha començat el compte enrere", url: GR_URLS.acatbal2026, publisher: "ACATBAL" },
  { name: "El Gran Recapte", url: GR_URLS.acatbal, publisher: "ACATBAL" },
  { name: "El Gran Recapte 2026 es mobilitza pel país", url: GR_URLS.gironaNote, publisher: "Banc dels Aliments de Girona" },
  { name: "Gran Recapte", url: GR_URLS.girona, publisher: "Banc dels Aliments de Girona" },
  { name: "Crida per aconseguir 1.100 voluntaris per al Gran Recapte 2026", url: GR_URLS.lleidaNote, publisher: "Banc dels Aliments de les Comarques de Lleida" },
  { name: "Els estudiants de la UdL podran sumar crèdits ECTS fent voluntariat al Gran Recapte 2026", url: GR_URLS.lleidaUdl, publisher: "Banc dels Aliments de les Comarques de Lleida" },
  { name: "El Gran Recapte", url: GR_URLS.tarragona, publisher: "Banc dels Aliments de les Comarques de Tarragona" },
  { name: "Inscripció Gran Recapte 2026", url: GR_URLS.tarragonaSignUp, publisher: "Banc dels Aliments de les Comarques de Tarragona" },
];

export const GRAN_RECAPTE_GUIDE: B2Article = {
  key: "granRecapte",
  entryKey: "guide-gran-recapte",
  categoryKey: "festivals",
  sources: SOURCES,
  // Reused from the manifest, not a new photograph (see the header comment).
  heroKey: GR_HERO.key,
  heroAlt: { ...GR_HERO.alt },
  heroCaption: { ...GR_HERO.caption },
  verifiedAt: GRAN_RECAPTE_AS_OF,
  publishedAt: "2026-11-04T12:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...GRAN_RECAPTE_META[locale], blocks: buildGranRecapteBody(locale) }]),
  ) as B2Article["editions"],
};
