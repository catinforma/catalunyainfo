import type { Block } from "@/lib/content/blocks";
import { HOLIDAYS_BY_YEAR, addDays, shortDate, weekdayIndex, WEEKDAY_NAMES } from "@/lib/content/holidays/calendar";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { displayName } from "@/lib/programmatic/holidays/copy";
import type { CouncilApproved } from "@/lib/programmatic/holidays/council-2027";
import { councilApproved2027, municipalities, nextYearFor, nextYearPublished } from "@/lib/programmatic/holidays/data";
import { hasEnglishPage } from "@/lib/programmatic/holidays/english";
import { municipalityPath } from "@/lib/programmatic/holidays/paths";
import type { SnapshotMunicipality } from "@/lib/programmatic/holidays/types";

import { FREE_DAYS_AS_OF, FREE_DAYS_TOWNS, joinNames, nameIn, type FreeDaysTown } from "./school-free-days-towns";
import { B2_PATHS, b2Related, b2link, callout, faq, h2, h3, keyFacts, lead, table, verifiedLine, type B2Article, type B2Source } from "./shared";

/**
 * Carnival 2027 in Catalonia (13 Nov 2026): the dates, whether it is a holiday,
 * whether there is school, and the big carnivals.
 *
 * Why this page: in Catalonia "carnaval 2026" peaked at ≈37,000 searches in
 * the week of 8-14 Feb 2026 and "carnaval sitges" at ≈3,700 a week in
 * February (Google Trends, 5 years, "festivos" anchor); the site had no page.
 * research_notes/evergreen-demand-nov2026.md has the evidence. Published in
 * November so it can rank before the late-January ramp.
 *
 * What it can say now, and from where (read 13 Nov 2026, curl + grep):
 *  - The dates are COMPUTED from the 2027 calendar's Easter (Ordre EMT/52/2026:
 *    Easter Monday 29 March, so Easter Sunday 28 March): Ash Wednesday is 46
 *    days before Easter Sunday, Dijous Gras the Thursday before. Barcelona's
 *    popular-culture page gives the rule ("el Dimecres de Cendra es mou entre
 *    els dies 4 de febrer i 10 de març").
 *  - No regional holiday falls in the week (HOLIDAYS_BY_YEAR[2027]; a test
 *    checks it).
 *  - Local holidays that week: the DOGC order once parsed, until then each
 *    council's own act (council-2027.ts), labelled pending, exactly as the
 *    Easter page reads them.
 *  - School free days that week: FREE_DAYS_TOWNS (school-free-days-towns.ts,
 *    each read on the council or school council's page).
 *  - Sitges: VisitSitges (the town's tourism agency), "Carnaval de Sitges
 *    2027": «del 4 al 10 de febrero», Arribo «el jueves 4 de febrero», Rua de
 *    la Disbauxa «el domingo 7», Rua de l'Extermini «el martes 9», burial «el
 *    miércoles 10 de febrero»; 150th anniversary of the Casino Prado Suburense.
 *  - Vilanova i la Geltrú: carnavaldevilanova.cat (the Federació
 *    d'Associacions pel Carnaval) names the days: Dijous Gras, Divendres
 *    d'Arrivo, Dissabte de Mascarots, Diumenge de Comparses, Dilluns de Coros,
 *    Dimarts de Vidalot, Dimecres de Cendra. (www.vilanova.cat serves an
 *    incomplete certificate chain, OpenSSL code 21, so curl needs -k; read
 *    that way on 13 Nov, its "Calendaris municipals" page says «8 de febrer de
 *    2027, dilluns de Carnaval», and the local-holiday table links it.)
 *  - Solsona: carnavalsolsona.com (Associació de Festes del Carnaval), history:
 *    recovered «l'any 1971», Gegants Bojos, Penjada del Ruc.
 *  - Platja d'Aro: the council's own news page on the 2026 edition
 *    (ciutada.platjadaro.com): «Rua de Carrosses i Comparses, dissabte 14 de
 *    febrer; l'endemà Rua de Colles Locals a Castell d'Aro», printed as 2026.
 *    (www.platjadaro.com has a history page, but its legal notice is an
 *    unfilled template, so it is not cited.)
 *  - Barcelona: barcelona.cat/culturapopular (ca, es, en): the Arribo of the
 *    Rei Carnestoltes (traditionally on the Passeig del Born), neighbourhood
 *    rues on the Saturday, the burial of the sardine on Ash Wednesday. The
 *    three language versions disagree on the day of the Arribo and the
 *    taronjada, so no day is printed for those.
 *
 * Not printed: any 2027 time, route or programme other than Sitges's four
 * dated events (none is published), the 2026 editions' details, trains (no
 * 2027 Rodalies notice), and everything from media and event aggregators.
 *
 * PROGRAMMES_2027: fill each town's entry with the organiser's post when the
 * programme comes out (usually January) and republish (`carnaval`). A test
 * fails from 25 Jan 2027 while any entry is still null, and from 11 Feb 2027
 * (the week is over: roll the page to 2028).
 */
export const CARNIVAL_AS_OF = "2026-11-13";
export const CARNIVAL_YEAR = 2027;

const EASTER_MONDAY = (HOLIDAYS_BY_YEAR[CARNIVAL_YEAR] ?? []).find((h) => h.name.en === "Easter Monday");
if (!EASTER_MONDAY) throw new Error("carnival page: no Easter Monday in the 2027 calendar");
const EASTER_SUNDAY = addDays(EASTER_MONDAY.date, -1);
const ASH = addDays(EASTER_SUNDAY, -46);

/** Carnival week 2027, Dijous Gras to Ash Wednesday, computed from the calendar's Easter. */
export const CARNIVAL = {
  easterSunday: EASTER_SUNDAY,
  dijousGras: addDays(ASH, -6),
  friday: addDays(ASH, -5),
  saturday: addDays(ASH, -4),
  sunday: addDays(ASH, -3),
  monday: addDays(ASH, -2),
  tuesday: addDays(ASH, -1),
  ashWednesday: ASH,
} as const;

export const CARNIVAL_WEEK: readonly string[] = [0, 1, 2, 3, 4, 5, 6].map((n) => addDays(CARNIVAL.dijousGras, n));

const inWeek = (iso: string) => iso >= CARNIVAL.dijousGras && iso <= CARNIVAL.ashWednesday;

/** Regional (Catalonia-wide) holidays inside the week: none in 2027; a test keeps it so. */
export function regionalHolidaysInWeek(): string[] {
  return (HOLIDAYS_BY_YEAR[CARNIVAL_YEAR] ?? []).map((h) => h.date).filter(inWeek);
}

export interface CarnivalLocalDay {
  town: SnapshotMunicipality;
  date: string;
  /** What the council calls the day, where it names it. */
  dayName: string | null;
  /** The council's own act, while the DOGC order is not out; null once it is. */
  council: CouncilApproved | null;
}

/** Local holidays in Carnival week: the DOGC order's once parsed, the councils' own acts before. */
export function carnivalLocalDays(): CarnivalLocalDay[] {
  const published = nextYearPublished();
  const out: CarnivalLocalDay[] = [];
  for (const town of municipalities()) {
    const council = published ? null : councilApproved2027(town.slug);
    const days = published ? (nextYearFor(town.slug)?.local ?? []) : (council?.local ?? []);
    days.forEach((date, i) => {
      if (!inWeek(date)) return;
      out.push({ town, date, dayName: council?.names?.[i] ?? null, council });
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.town.rank - b.town.rank);
}

/** Towns of the school free-days table with a free day in Carnival week, and those days. */
export function carnivalSchoolDays(towns: readonly FreeDaysTown[] = FREE_DAYS_TOWNS): { town: FreeDaysTown; days: string[] }[] {
  return towns.map((town) => ({ town, days: town.days.filter(inWeek) })).filter((t) => t.days.length > 0);
}

/* -------------------------------------------------------------------------- */
/* The 2027 programmes, filled when each organiser publishes                  */
/* -------------------------------------------------------------------------- */

export type CarnivalTown = "sitges" | "vilanova" | "solsona" | "platjaDaro" | "barcelona";

export interface ProgrammeNotice {
  /** ISO date of the organiser's post with the 2027 programme or dates. */
  published: string;
  url: string;
}

/**
 * Sitges's 2027 dates are out (VisitSitges, read 13 Nov 2026; the post
 * carries no date of its own, so the read date stands in). The rest are null
 * until their organisers publish.
 */
export const PROGRAMMES_2027: Record<CarnivalTown, ProgrammeNotice | null> = {
  sitges: { published: "2026-11-13", url: "https://www.visitsitges.com/en/agenda/carnaval-de-sitges-2027/" },
  vilanova: null,
  solsona: null,
  platjaDaro: null,
  barcelona: null,
};

export const PROGRAMME_HOSTS: Record<CarnivalTown, string[]> = {
  sitges: ["www.visitsitges.com", "visitsitges.com", "www.sitges.cat", "sitges.cat"],
  vilanova: ["carnavaldevilanova.cat", "www.carnavaldevilanova.cat", "www.vilanova.cat"],
  solsona: ["carnavalsolsona.com", "www.carnavalsolsona.com", "www.solsona.cat"],
  platjaDaro: ["www.platjadaro.com", "platjadaro.com", "ciutada.platjadaro.com", "agenda.platjadaro.com"],
  barcelona: ["www.barcelona.cat", "ajuntament.barcelona.cat"],
};

/** Reasons a programme notice must not be printed; empty when it is fine. */
export function programmeProblems(town: CarnivalTown, notice: ProgrammeNotice): string[] {
  const problems: string[] = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(notice.published) || Number.isNaN(Date.parse(`${notice.published}T12:00:00Z`))) problems.push(`not an ISO date: ${notice.published}`);
  else if (notice.published < "2026-03-01" || notice.published > CARNIVAL.ashWednesday) problems.push(`outside the run-up to Carnival 2027: ${notice.published}`);
  let url: URL | null = null;
  try {
    url = new URL(notice.url);
  } catch {
    problems.push(`url does not parse: ${notice.url}`);
  }
  if (url) {
    if (url.protocol !== "https:") problems.push("url is not https");
    if (!PROGRAMME_HOSTS[town].includes(url.hostname)) problems.push(`not the organiser's host: ${url.hostname}`);
    if (/[?&]utm_/.test(url.search)) problems.push("url carries tracking parameters");
  }
  return problems;
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

export const CARNIVAL_URLS = {
  calendar2027: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2027/",
  sitges2027: "https://www.visitsitges.com/en/agenda/carnaval-de-sitges-2027/",
  vilanova: "https://carnavaldevilanova.cat/",
  solsona: "https://carnavalsolsona.com/la-festa/historia/",
  platjaDaro: "https://ciutada.platjadaro.com/carnaval-de-platja-daro-2026/",
  bcnCa: "https://www.barcelona.cat/culturapopular/ca/festes-i-tradicions/carnaval-de-barcelona",
  bcnEs: "https://www.barcelona.cat/culturapopular/es/fiestas-y-tradiciones/carnaval-de-barcelona",
  bcnEn: "https://www.barcelona.cat/culturapopular/en/festivals-and-traditions/barcelona-carnival",
} as const;

export function carnivalSources(): B2Source[] {
  const fixed: B2Source[] = [
    { name: "Calendari de festes laborals 2027 (Ordre EMT/52/2026, DOGC 1.4.2026)", url: CARNIVAL_URLS.calendar2027, publisher: "Departament d'Empresa i Treball" },
    { name: "Carnaval de Sitges 2027", url: CARNIVAL_URLS.sitges2027, publisher: "VisitSitges (Ajuntament de Sitges)" },
    { name: "Carnaval de Vilanova i la Geltrú: pàgina oficial", url: CARNIVAL_URLS.vilanova, publisher: "Federació d'Associacions pel Carnaval de Vilanova i la Geltrú" },
    { name: "Història del Carnaval de Solsona", url: CARNIVAL_URLS.solsona, publisher: "Associació de Festes del Carnaval de Solsona" },
    { name: "Carnaval de Platja d'Aro 2026", url: CARNIVAL_URLS.platjaDaro, publisher: "Ajuntament de Castell d'Aro, Platja d'Aro i S'Agaró" },
    { name: "Carnaval de Barcelona", url: CARNIVAL_URLS.bcnCa, publisher: "Ajuntament de Barcelona (Cultura Popular)" },
  ];
  const seen = new Set(fixed.map((s) => s.url));
  const councils: B2Source[] = [];
  for (const day of carnivalLocalDays()) {
    if (!day.council || seen.has(day.council.source.url)) continue;
    seen.add(day.council.source.url);
    councils.push({ name: `${day.council.source.name} (${day.town.name})`, url: day.council.source.url, publisher: day.council.source.ref });
  }
  for (const { town } of carnivalSchoolDays()) {
    if (seen.has(town.url)) continue;
    seen.add(town.url);
    councils.push({ name: town.title, url: town.url, publisher: town.publisher });
  }
  return [...fixed, ...councils];
}

/* -------------------------------------------------------------------------- */
/* Wording helpers                                                            */
/* -------------------------------------------------------------------------- */

/** A Markdown link; parentheses in the URL (council PDFs named "…(1).pdf") are percent-encoded so they cannot close it. */
const a = (href: string, label: string) => `[${label}](${href.replace(/\(/g, "%28").replace(/\)/g, "%29")})`;
/** "dijous 4 de febrer", "jueves 4 de febrero", "Thursday 4 February". */
const day = (iso: string, L: Locale) => `${WEEKDAY_NAMES[L][weekdayIndex(iso)]} ${shortDate(iso, L)}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function townName(town: SnapshotMunicipality, L: Locale): string {
  return L === "ca" ? town.name : L === "es" ? displayName(town, "es") : cap(town.name);
}

function townLink(town: SnapshotMunicipality, L: Locale): string {
  const name = L === "ca" ? cap(town.name) : townName(town, L);
  if (L === "en" && !hasEnglishPage(town.slug)) return name;
  return a(municipalityPath(L, town.slug), name);
}

function localRows(L: Locale): string[][] {
  return carnivalLocalDays().map((d) => [
    cap(day(d.date, L)),
    townLink(d.town, L),
    d.dayName ?? "—",
    d.council
      ? a(d.council.source.url, { ca: "Ajuntament, pendent del DOGC", es: "Ayuntamiento, pendiente del DOGC", en: "Council, pending the DOGC" }[L])
      : { ca: "Ordre del DOGC", es: "Orden del DOGC", en: "DOGC order" }[L],
  ]);
}

/** "Vilanova i la Geltrú (dilluns 8), Castell d'Aro, Platja d'Aro i s'Agaró (dijous 4) i Sant Feliu de Guíxols (divendres 5)": the three largest towns. */
function biggestLocal(L: Locale, n = 3): string {
  const byRank = [...carnivalLocalDays()].sort((x, y) => x.town.rank - y.town.rank);
  const picked: CarnivalLocalDay[] = [];
  for (const d of byRank) if (!picked.some((p) => p.town.slug === d.town.slug) && picked.length < n) picked.push(d);
  return joinNames(picked.map((d) => `${L === "ca" ? cap(d.town.name) : townName(d.town, L)} (${WEEKDAY_NAMES[L][weekdayIndex(d.date)]} ${Number(d.date.slice(8))})`), L);
}

function schoolCounts() {
  const towns = carnivalSchoolDays();
  const monday = towns.filter((t) => t.days.includes(CARNIVAL.monday));
  const friday = towns.filter((t) => t.days.includes(CARNIVAL.friday));
  return { total: FREE_DAYS_TOWNS.length, withDay: towns.length, monday, friday, barcelonaMonday: monday.some((t) => t.town.slug === "barcelona") };
}

function schoolRows(L: Locale): string[][] {
  return carnivalSchoolDays().map(({ town, days }) => [
    nameIn(town.name, L),
    joinNames(days.map((d) => day(d, L)), L),
    { proposal: { ca: "Proposta (cada escola decideix)", es: "Propuesta (cada escuela decide)", en: "Proposal (each school decides)" }, agreement: { ca: "Acord del consell escolar municipal", es: "Acuerdo del consejo escolar municipal", en: "Municipal school council agreement" }, notice: { ca: "Calendari publicat", es: "Calendario publicado", en: "Published calendar" } }[town.kind][L],
  ]);
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

export const CARNIVAL_META: Record<Locale, { title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    title: "Carnaval 2027 a Catalunya: dates, festius locals, escoles i les rues de Sitges i Vilanova",
    seoTitle: "Carnaval 2027 a Catalunya: dates, festius i rues de Sitges",
    seoDescription: "Del dijous 4 al dimecres 10 de febrer de 2027. No és festiu a Catalunya, però sí en alguns pobles, i el dilluns 8 moltes escoles fan festa. Dates de Sitges.",
    excerpt: "Quan és el Carnaval 2027, on és festiu local, quines escoles fan festa el dilluns 8 de febrer i els dies grans de Sitges, Vilanova, Solsona, Platja d'Aro i Barcelona.",
  },
  es: {
    title: "Carnaval 2027 en Cataluña: fechas, festivos locales, colegios y las rúas de Sitges y Vilanova",
    seoTitle: "Carnaval 2027 en Cataluña: fechas, festivos y rúas de Sitges",
    seoDescription: "Del jueves 4 al miércoles 10 de febrero de 2027. No es festivo en Cataluña, pero sí en algunos pueblos, y el lunes 8 muchos colegios no tienen clase.",
    excerpt: "Cuándo es el Carnaval 2027, dónde es festivo local, qué colegios no tienen clase el lunes 8 de febrero y los días grandes de Sitges, Vilanova, Solsona, Platja d'Aro y Barcelona.",
  },
  en: {
    title: "Carnival 2027 in Catalonia: dates, local holidays, schools and the Sitges and Vilanova parades",
    seoTitle: "Carnival 2027 in Catalonia: dates, holidays and Sitges parades",
    seoDescription: "Thursday 4 to Wednesday 10 February 2027. Not a public holiday in Catalonia, but it is in some towns, and many schools close on Monday 8. Sitges dates.",
    excerpt: "When Carnival 2027 is, where it is a local holiday, which schools close on Monday 8 February, and the big days in Sitges, Vilanova, Solsona, Platja d'Aro and Barcelona.",
  },
};

export function buildCarnivalBody(L: Locale): Block[] {
  const C = CARNIVAL;
  const local = carnivalLocalDays();
  const localTowns = new Set(local.map((d) => d.town.slug)).size;
  const pending = local.some((d) => d.council !== null);
  const school = schoolCounts();
  const free = b2link("schoolFreeDays", L, { ca: "dies de lliure disposició municipi per municipi", es: "días de libre disposición municipio por municipio", en: "school free days town by town" }[L]);
  const bcnCulture = L === "es" ? CARNIVAL_URLS.bcnEs : L === "en" ? CARNIVAL_URLS.bcnEn : CARNIVAL_URLS.bcnCa;
  const d = (iso: string) => day(iso, L);
  const notYet = { ca: "Programa del 2027: encara no publicat (13 de novembre de 2026).", es: "Programa de 2027: aún no publicado (13 de noviembre de 2026).", en: "2027 programme: not published yet (13 November 2026)." }[L];

  const t = {
    ca: {
      lead: `**El Carnaval 2027 va del dijous 4 de febrer (Dijous Gras) al dimecres 10 de febrer (Dimecres de Cendra).** No és festiu a Catalunya, però ${localTowns} municipis tenen una festa local aquella setmana, com ${biggestLocal("ca")}. I el **dilluns 8 de febrer** és dia de lliure disposició a moltes escoles${school.barcelonaMonday ? ", també a Barcelona" : ""}. A Sitges, la Rua de la Disbauxa és el diumenge 7 i la Rua de l'Extermini, el dimarts 9.`,
      factsTitle: "El Carnaval 2027 en sis dates",
      facts: [
        { label: "Dijous Gras", value: d(C.dijousGras) },
        { label: "Cap de setmana de rues", value: `${d(C.saturday)} i ${d(C.sunday)}` },
        { label: "Dilluns de Carnaval", value: `${d(C.monday)}: lliure disposició a ${school.monday.length} dels ${school.total} municipis de la nostra taula escolar` },
        { label: "Dimarts de Carnaval", value: `${d(C.tuesday)}: Rua de l'Extermini a Sitges` },
        { label: "Dimecres de Cendra", value: `${d(C.ashWednesday)}: enterrament de la sardina i fi del Carnaval` },
        { label: "És festiu?", value: `No a Catalunya; sí a ${localTowns} municipis (festa local)` },
      ],
      whenH: "Quan és el Carnaval 2027",
      when: [
        `El Carnaval es mou cada any amb la Pasqua. El 2027 el Diumenge de Pasqua és el 28 de març (el Dilluns de Pasqua, 29 de març, és festiu segons el ${a(CARNIVAL_URLS.calendar2027, "calendari laboral 2027")}), i el Dimecres de Cendra cau 46 dies abans: el **10 de febrer**. La setmana de Carnaval comença el dijous anterior, el **Dijous Gras, 4 de febrer**, el dia dels berenars i àpats populars.`,
      ],
      weekCaption: "La setmana del Carnaval 2027, dia per dia",
      weekHead: ["Dia", "Què passa"],
      week: [
        [d(C.dijousGras), "Dijous Gras. Arribo de Sa Majestat Carnestoltes a Sitges"],
        [d(C.friday), "Divendres d'Arrivo a Vilanova i la Geltrú"],
        [d(C.saturday), "Rues als barris de Barcelona; Dissabte de Mascarots a Vilanova"],
        [d(C.sunday), "Rua de la Disbauxa a Sitges; Diumenge de Comparses a Vilanova"],
        [d(C.monday), "Dilluns de Coros a Vilanova (festa local); lliure disposició a moltes escoles"],
        [d(C.tuesday), "Rua de l'Extermini a Sitges; Dimarts de Vidalot a Vilanova"],
        [d(C.ashWednesday), "Dimecres de Cendra: enterrament de Carnestoltes a Sitges i de la sardina a Barcelona"],
      ],
      weekNote: `Fonts: VisitSitges (dates del 2027), Federació d'Associacions pel Carnaval de Vilanova (nom de cada dia) i Cultura Popular de l'Ajuntament de Barcelona. Els horaris del 2027 encara no són públics.`,
      holH: "És festiu el Carnaval? On hi ha festa local",
      hol: [
        `A Catalunya el Carnaval no és festiu: cap dels dies del calendari laboral del 2027 cau aquella setmana. Però cada ajuntament tria dues festes locals, i ${localTowns} n'han posat una entre el ${shortDate(C.dijousGras, "ca")} i el ${shortDate(C.ashWednesday, "ca")}.${pending ? " Són els dies que ha aprovat cada ajuntament, pendents de l'ordre del DOGC que els fa oficials (l'any passat va sortir el 17 de desembre)." : ""} El que més es repeteix és el dilluns de Carnaval.`,
      ],
      holCaption: "Municipis amb festa local la setmana de Carnaval del 2027",
      holHead: ["Dia", "Municipi", "Nom que li dona l'ajuntament", "Font"],
      schoolH: "Hi ha escola el dilluns de Carnaval?",
      schoolP: [
        `Depèn del municipi. El calendari escolar no hi posa vacances, però cada municipi té dies de lliure disposició, i el de Carnaval és dels més triats: dels ${school.total} municipis que tenim recollits, ${school.withDay} en tenen un aquella setmana, i ${school.monday.length} el posen el **dilluns 8 de febrer**${school.barcelonaMonday ? ", Barcelona entre ells" : ""}. ${school.friday.length > 0 ? `${school.friday.length} municipis el posen el divendres 5.` : ""} Confirma-ho sempre amb l'escola: on el consell escolar només fa una proposta, cada centre decideix. Tots els municipis, a la pàgina de ${free}.`,
      ],
      schoolCaption: "Dies de lliure disposició escolar la setmana de Carnaval del 2027",
      schoolHead: ["Municipi", "Dia sense classe", "Tipus"],
      bigH: "Els grans carnavals",
      sitgesH: "Sitges",
      sitges: [`Del 4 al 10 de febrer de 2027, amb un any especial pels 150 anys del Casino Prado Suburense, que organitza les figures de Carnestoltes i de la Reina. Els dies marcats: l'Arribo de Carnestoltes el dijous 4, la **Rua de la Disbauxa el diumenge 7**, la **Rua de l'Extermini el dimarts 9** i l'enterrament de Carnestoltes el dimecres 10. Font: ${a(CARNIVAL_URLS.sitges2027, "VisitSitges")}. Si hi vas des de Barcelona en tren, ${b2link("sitges", "ca", "la guia de Sitges")} té la línia i els bitllets.`],
      vilanovaH: "Vilanova i la Geltrú",
      vilanova: [`Cada dia té nom: Dijous Gras, Divendres d'Arrivo, Dissabte de Mascarots, Diumenge de Comparses, Dilluns de Coros, Dimarts de Vidalot i Dimecres de Cendra (${a(CARNIVAL_URLS.vilanova, "Federació d'Associacions pel Carnaval")}). El dilluns 8 de febrer és festa local a Vilanova el 2027. ${notYet}`],
      solsonaH: "Solsona",
      solsona: [`Segons l'associació que l'organitza, Solsona va ser la primera població de l'Estat a recuperar el Carnaval, el 1971, quan encara era una festa prohibida pel franquisme. Són seus els Gegants Bojos i la Penjada del Ruc al campanar (${a(CARNIVAL_URLS.solsona, "Associació de Festes del Carnaval de Solsona")}). ${notYet}`],
      platjaH: "Platja d'Aro",
      platja: [`El plat fort és la Rua de Carrosses i Comparses: el 2026 es va fer el dissabte de Carnaval, i l'endemà, la Rua de Colles Locals a Castell d'Aro (${a(CARNIVAL_URLS.platjaDaro, "Ajuntament de Castell-Platja d'Aro")}). El dijous 4 de febrer, Dijous Gras, és festa local al municipi el 2027. ${notYet}`],
      bcnH: "Barcelona",
      bcn: [`Comença amb l'Arribo del Rei Carnestoltes, tradicionalment al passeig del Born; les rues es fan als barris, i el Dimecres de Cendra s'enterra la sardina (${a(bcnCulture, "Cultura Popular, Ajuntament de Barcelona")}). ${notYet}`],
      faqH: "Preguntes freqüents",
      faq: [
        { question: "Quan és el Carnaval 2027?", answer: `Del dijous 4 de febrer (Dijous Gras) al dimecres 10 de febrer de 2027 (Dimecres de Cendra). El cap de setmana de rues és el 6 i el 7 de febrer.` },
        { question: "És festiu el Carnaval a Catalunya?", answer: `No: cap festiu del calendari laboral del 2027 cau aquella setmana. Però ${localTowns} municipis hi tenen una festa local, com ${biggestLocal("ca")}.` },
        { question: "Hi ha escola el dilluns de Carnaval, 8 de febrer de 2027?", answer: `A molts municipis no: és dia de lliure disposició a ${school.monday.length} dels ${school.total} que tenim recollits${school.barcelonaMonday ? ", Barcelona inclosa" : ""}. Confirma-ho amb la teva escola.` },
        { question: "Quan és la rua de Sitges 2027?", answer: "La Rua de la Disbauxa és el diumenge 7 de febrer i la Rua de l'Extermini, el dimarts 9 de febrer de 2027 (VisitSitges). Els horaris encara no són públics." },
        { question: "Quan és el Dijous Gras 2027?", answer: "El dijous 4 de febrer de 2027." },
        { question: "Quan és el Dimecres de Cendra 2027?", answer: "El dimecres 10 de febrer de 2027, 46 dies abans del Diumenge de Pasqua (28 de març)." },
      ],
    },
    es: {
      lead: `**El Carnaval 2027 va del jueves 4 de febrero (Jueves Lardero, Dijous Gras) al miércoles 10 de febrero (Miércoles de Ceniza).** No es festivo en Cataluña, pero ${localTowns} municipios tienen una fiesta local esa semana, como ${biggestLocal("es")}. Y el **lunes 8 de febrero** es día de libre disposición en muchos colegios${school.barcelonaMonday ? ", también en Barcelona" : ""}. En Sitges, la Rua de la Disbauxa es el domingo 7 y la Rua de l'Extermini, el martes 9.`,
      factsTitle: "El Carnaval 2027 en seis fechas",
      facts: [
        { label: "Jueves Lardero (Dijous Gras)", value: d(C.dijousGras) },
        { label: "Fin de semana de rúas", value: `${d(C.saturday)} y ${d(C.sunday)}` },
        { label: "Lunes de Carnaval", value: `${d(C.monday)}: libre disposición en ${school.monday.length} de los ${school.total} municipios de nuestra tabla escolar` },
        { label: "Martes de Carnaval", value: `${d(C.tuesday)}: Rua de l'Extermini en Sitges` },
        { label: "Miércoles de Ceniza", value: `${d(C.ashWednesday)}: entierro de la sardina y fin del Carnaval` },
        { label: "¿Es festivo?", value: `No en Cataluña; sí en ${localTowns} municipios (fiesta local)` },
      ],
      whenH: "Cuándo es el Carnaval 2027",
      when: [
        `El Carnaval se mueve cada año con la Semana Santa. En 2027 el Domingo de Pascua es el 28 de marzo (el Lunes de Pascua, 29 de marzo, es festivo según el ${a(CARNIVAL_URLS.calendar2027, "calendario laboral 2027")}, en catalán), y el Miércoles de Ceniza cae 46 días antes: el **10 de febrero**. La semana de Carnaval empieza el jueves anterior, el **Jueves Lardero, 4 de febrero**, el día de las meriendas y comidas populares.`,
      ],
      weekCaption: "La semana del Carnaval 2027, día a día",
      weekHead: ["Día", "Qué pasa"],
      week: [
        [d(C.dijousGras), "Jueves Lardero. Arribo de S. M. Carnestoltes en Sitges"],
        [d(C.friday), "Divendres d'Arrivo en Vilanova i la Geltrú"],
        [d(C.saturday), "Rúas en los barrios de Barcelona; Dissabte de Mascarots en Vilanova"],
        [d(C.sunday), "Rua de la Disbauxa en Sitges; Diumenge de Comparses en Vilanova"],
        [d(C.monday), "Dilluns de Coros en Vilanova (fiesta local); libre disposición en muchos colegios"],
        [d(C.tuesday), "Rua de l'Extermini en Sitges; Dimarts de Vidalot en Vilanova"],
        [d(C.ashWednesday), "Miércoles de Ceniza: entierro de Carnestoltes en Sitges y de la sardina en Barcelona"],
      ],
      weekNote: "Fuentes: VisitSitges (fechas de 2027), Federació d'Associacions pel Carnaval de Vilanova (nombre de cada día) y Cultura Popular del Ayuntamiento de Barcelona. Los horarios de 2027 aún no son públicos.",
      holH: "¿Es festivo el Carnaval? Dónde hay fiesta local",
      hol: [
        `En Cataluña el Carnaval no es festivo: ningún día del calendario laboral de 2027 cae esa semana. Pero cada ayuntamiento elige dos fiestas locales, y ${localTowns} han puesto una entre el ${shortDate(C.dijousGras, "es")} y el ${shortDate(C.ashWednesday, "es")}.${pending ? " Son los días que ha aprobado cada ayuntamiento, pendientes de la orden del DOGC que los hace oficiales (el año pasado salió el 17 de diciembre)." : ""} El que más se repite es el lunes de Carnaval.`,
      ],
      holCaption: "Municipios con fiesta local en la semana de Carnaval de 2027",
      holHead: ["Día", "Municipio", "Nombre que le da el ayuntamiento", "Fuente"],
      schoolH: "¿Hay colegio el lunes de Carnaval?",
      schoolP: [
        `Depende del municipio. El calendario escolar no pone vacaciones, pero cada municipio tiene días de libre disposición, y el de Carnaval es de los más elegidos: de los ${school.total} municipios que tenemos recogidos, ${school.withDay} tienen uno esa semana, y ${school.monday.length} lo ponen el **lunes 8 de febrero**${school.barcelonaMonday ? ", Barcelona entre ellos" : ""}. ${school.friday.length > 0 ? `${school.friday.length} municipios lo ponen el viernes 5.` : ""} Confírmalo siempre con el colegio: donde el consejo escolar solo hace una propuesta, cada centro decide. Todos los municipios, en la página de ${free}.`,
      ],
      schoolCaption: "Días de libre disposición escolar en la semana de Carnaval de 2027",
      schoolHead: ["Municipio", "Día sin clase", "Tipo"],
      bigH: "Los grandes carnavales",
      sitgesH: "Sitges",
      sitges: [`Del 4 al 10 de febrero de 2027, con un año especial por los 150 años del Casino Prado Suburense, que organiza las figuras de Carnestoltes y de la Reina. Los días marcados: el Arribo de Carnestoltes el jueves 4, la **Rua de la Disbauxa el domingo 7**, la **Rua de l'Extermini el martes 9** y el entierro de Carnestoltes el miércoles 10. Fuente: ${a(CARNIVAL_URLS.sitges2027, "VisitSitges")}. Si vas desde Barcelona en tren, ${b2link("sitges", "es", "la guía de Sitges")} tiene la línea y los billetes.`],
      vilanovaH: "Vilanova i la Geltrú",
      vilanova: [`Cada día tiene nombre: Dijous Gras, Divendres d'Arrivo, Dissabte de Mascarots, Diumenge de Comparses, Dilluns de Coros, Dimarts de Vidalot y Dimecres de Cendra (${a(CARNIVAL_URLS.vilanova, "Federació d'Associacions pel Carnaval")}). El lunes 8 de febrero es fiesta local en Vilanova en 2027. ${notYet}`],
      solsonaH: "Solsona",
      solsona: [`Según la asociación que lo organiza, Solsona fue la primera población del Estado en recuperar el Carnaval, en 1971, cuando aún era una fiesta prohibida por el franquismo. Suyos son los Gegants Bojos y la Penjada del Ruc en el campanario (${a(CARNIVAL_URLS.solsona, "Associació de Festes del Carnaval de Solsona")}). ${notYet}`],
      platjaH: "Platja d'Aro",
      platja: [`El plato fuerte es la Rua de Carrosses i Comparses: en 2026 se hizo el sábado de Carnaval y, al día siguiente, la Rua de Colles Locals en Castell d'Aro (${a(CARNIVAL_URLS.platjaDaro, "Ayuntamiento de Castell-Platja d'Aro")}, en catalán). El jueves 4 de febrero, Jueves Lardero, es fiesta local en el municipio en 2027. ${notYet}`],
      bcnH: "Barcelona",
      bcn: [`Empieza con el Arribo del Rey Carnestoltes, tradicionalmente en el paseo del Born; las rúas se hacen en los barrios, y el Miércoles de Ceniza se entierra la sardina (${a(bcnCulture, "Cultura Popular, Ayuntamiento de Barcelona")}). ${notYet}`],
      faqH: "Preguntas frecuentes",
      faq: [
        { question: "¿Cuándo es el Carnaval 2027?", answer: "Del jueves 4 de febrero (Jueves Lardero) al miércoles 10 de febrero de 2027 (Miércoles de Ceniza). El fin de semana de rúas es el 6 y el 7 de febrero." },
        { question: "¿Es festivo el Carnaval en Cataluña?", answer: `No: ningún festivo del calendario laboral de 2027 cae esa semana. Pero ${localTowns} municipios tienen una fiesta local, como ${biggestLocal("es")}.` },
        { question: "¿Hay colegio el lunes de Carnaval, 8 de febrero de 2027?", answer: `En muchos municipios no: es día de libre disposición en ${school.monday.length} de los ${school.total} que tenemos recogidos${school.barcelonaMonday ? ", Barcelona incluida" : ""}. Confírmalo con tu colegio.` },
        { question: "¿Cuándo es la rúa de Sitges 2027?", answer: "La Rua de la Disbauxa es el domingo 7 de febrero y la Rua de l'Extermini, el martes 9 de febrero de 2027 (VisitSitges). Los horarios aún no son públicos." },
        { question: "¿Cuándo es el Jueves Lardero 2027?", answer: "El jueves 4 de febrero de 2027 (Dijous Gras en catalán)." },
        { question: "¿Cuándo es el Miércoles de Ceniza 2027?", answer: "El miércoles 10 de febrero de 2027, 46 días antes del Domingo de Pascua (28 de marzo)." },
      ],
    },
    en: {
      lead: `**Carnival 2027 runs from Thursday 4 February (Dijous Gras, "Fat Thursday") to Wednesday 10 February (Ash Wednesday).** It is not a public holiday in Catalonia, but ${localTowns} towns have a local holiday that week, among them ${biggestLocal("en")}. And **Monday 8 February** is a school free day in many towns${school.barcelonaMonday ? ", Barcelona included" : ""}. In Sitges, the Rua de la Disbauxa parade is on Sunday 7 and the Rua de l'Extermini on Tuesday 9.`,
      factsTitle: "Carnival 2027 in six dates",
      facts: [
        { label: "Fat Thursday (Dijous Gras)", value: d(C.dijousGras) },
        { label: "Parade weekend", value: `${d(C.saturday)} and ${d(C.sunday)}` },
        { label: "Carnival Monday", value: `${d(C.monday)}: school free day in ${school.monday.length} of the ${school.total} towns in our school table` },
        { label: "Carnival Tuesday", value: `${d(C.tuesday)}: Rua de l'Extermini in Sitges` },
        { label: "Ash Wednesday", value: `${d(C.ashWednesday)}: burial of the sardine, end of Carnival` },
        { label: "Public holiday?", value: `Not in Catalonia; a local holiday in ${localTowns} towns` },
      ],
      whenH: "When is Carnival 2027?",
      when: [
        `Carnival moves every year with Easter. In 2027 Easter Sunday is 28 March (Easter Monday, 29 March, is a holiday in the ${a(CARNIVAL_URLS.calendar2027, "2027 work calendar")}, in Catalan), and Ash Wednesday falls 46 days earlier: **10 February**. Carnival week starts on the Thursday before, **Dijous Gras, 4 February**, the day of communal snacks and meals.`,
      ],
      weekCaption: "Carnival week 2027, day by day",
      weekHead: ["Day", "What happens"],
      week: [
        [d(C.dijousGras), "Dijous Gras. Arrival (Arribo) of King Carnestoltes in Sitges"],
        [d(C.friday), "Divendres d'Arrivo in Vilanova i la Geltrú"],
        [d(C.saturday), "Neighbourhood parades in Barcelona; Dissabte de Mascarots in Vilanova"],
        [d(C.sunday), "Rua de la Disbauxa in Sitges; Diumenge de Comparses in Vilanova"],
        [d(C.monday), "Dilluns de Coros in Vilanova (local holiday); school free day in many towns"],
        [d(C.tuesday), "Rua de l'Extermini in Sitges; Dimarts de Vidalot in Vilanova"],
        [d(C.ashWednesday), "Ash Wednesday: burial of Carnestoltes in Sitges and of the sardine in Barcelona"],
      ],
      weekNote: "Sources: VisitSitges (2027 dates), the Vilanova Carnival federation (the name of each day) and Barcelona City Council's Popular Culture pages. No 2027 times are public yet.",
      holH: "Is Carnival a public holiday? Where it is a local one",
      hol: [
        `Carnival is not a public holiday in Catalonia: no day of the 2027 work calendar falls that week. But each town picks two local holidays, and ${localTowns} have put one between ${shortDate(C.dijousGras, "en")} and ${shortDate(C.ashWednesday, "en")}.${pending ? " These are the days each council has approved, pending the DOGC order that makes them official (last year it came out on 17 December)." : ""} Carnival Monday is the most common.`,
      ],
      holCaption: "Towns with a local holiday in Carnival week 2027",
      holHead: ["Day", "Town", "What the council calls it", "Source"],
      schoolH: "Is there school on Carnival Monday?",
      schoolP: [
        `It depends on the town. The school calendar has no Carnival break, but each town has school free days ("dies de lliure disposició"), and Carnival is a favourite: of the ${school.total} towns we track, ${school.withDay} have one that week, and ${school.monday.length} put it on **Monday 8 February**${school.barcelonaMonday ? ", Barcelona among them" : ""}. ${school.friday.length > 0 ? `${school.friday.length} towns put it on Friday 5.` : ""} Always check with the school: where the school council only proposes the day, each school decides. Every town is on our page of ${free}.`,
      ],
      schoolCaption: "School free days in Carnival week 2027",
      schoolHead: ["Town", "Day without classes", "Type"],
      bigH: "The big carnivals",
      sitgesH: "Sitges",
      sitges: [`4 to 10 February 2027, a special year for the 150th anniversary of the Casino Prado Suburense, which stages both King Carnestoltes and the Carnival Queen. The dated events: the Arribo of Carnestoltes on Thursday 4, the **Rua de la Disbauxa on Sunday 7**, the **Rua de l'Extermini on Tuesday 9** and the burial of Carnestoltes on Wednesday 10. Source: ${a(CARNIVAL_URLS.sitges2027, "VisitSitges")}. Going by train from Barcelona? ${b2link("sitges", "en", "Our Sitges guide")} has the line and the tickets.`],
      vilanovaH: "Vilanova i la Geltrú",
      vilanova: [`Every day has a name: Dijous Gras, Divendres d'Arrivo, Dissabte de Mascarots, Diumenge de Comparses, Dilluns de Coros, Dimarts de Vidalot and Dimecres de Cendra (${a(CARNIVAL_URLS.vilanova, "Vilanova Carnival federation")}, in Catalan). Monday 8 February is a local holiday in Vilanova in 2027. ${notYet}`],
      solsonaH: "Solsona",
      solsona: [`According to the association that runs it, Solsona was the first town in Spain to revive Carnival, in 1971, when the festival was still banned under Franco. It is the home of the Gegants Bojos ("mad giants") and the Penjada del Ruc, the donkey hung from the bell tower (${a(CARNIVAL_URLS.solsona, "Solsona Carnival association")}, in Catalan). ${notYet}`],
      platjaH: "Platja d'Aro",
      platja: [`The highlight is the Rua de Carrosses i Comparses, a parade of floats and costumed groups: in 2026 it was on the Carnival Saturday, with the local groups' parade in Castell d'Aro the next day (${a(CARNIVAL_URLS.platjaDaro, "Castell-Platja d'Aro council")}, in Catalan). Thursday 4 February, Dijous Gras, is a local holiday in the town in 2027. ${notYet}`],
      bcnH: "Barcelona",
      bcn: [`It opens with the Arribo of King Carnestoltes, traditionally on Passeig del Born; the parades (rues) are held in the neighbourhoods, and on Ash Wednesday the sardine is buried (${a(bcnCulture, "Popular Culture, Barcelona City Council")}). ${notYet}`],
      faqH: "Frequently asked questions",
      faq: [
        { question: "When is Carnival 2027 in Catalonia?", answer: "From Thursday 4 February (Dijous Gras) to Wednesday 10 February 2027 (Ash Wednesday). The parade weekend is 6 and 7 February." },
        { question: "Is Carnival a public holiday in Catalonia?", answer: `No: no public holiday in the 2027 work calendar falls that week. But ${localTowns} towns have a local holiday then, among them ${biggestLocal("en")}.` },
        { question: "Is there school on Carnival Monday, 8 February 2027?", answer: `In many towns, no: it is a school free day in ${school.monday.length} of the ${school.total} towns we track${school.barcelonaMonday ? ", Barcelona included" : ""}. Check with your school.` },
        { question: "When is the Sitges Carnival parade in 2027?", answer: "The Rua de la Disbauxa is on Sunday 7 February and the Rua de l'Extermini on Tuesday 9 February 2027 (VisitSitges). Times are not public yet." },
        { question: "When is Fat Thursday (Dijous Gras) 2027?", answer: "Thursday 4 February 2027." },
        { question: "When is Ash Wednesday 2027?", answer: "Wednesday 10 February 2027, 46 days before Easter Sunday (28 March)." },
      ],
    },
  }[L];

  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    ...h2(t.whenH, ...t.when),
    table(t.weekCaption, t.weekHead, t.week.map(([dd, what]) => [cap(dd!), what!]), t.weekNote),
    ...h2(t.holH, ...t.hol),
    table(t.holCaption, t.holHead, localRows(L)),
    ...h2(t.schoolH, ...t.schoolP),
    table(t.schoolCaption, t.schoolHead, schoolRows(L), { ca: `Dies llegits a la pàgina de cada ajuntament o consell escolar (última lectura: ${shortDate(FREE_DAYS_AS_OF, "ca")}).`, es: `Días leídos en la página de cada ayuntamiento o consejo escolar (última lectura: ${shortDate(FREE_DAYS_AS_OF, "es")}).`, en: `Days read on each council's or school council's page (last read ${shortDate(FREE_DAYS_AS_OF, "en")}).` }[L]),
    { type: "heading", level: 2, text: t.bigH } as Block,
    ...h3(t.sitgesH, ...t.sitges),
    ...h3(t.vilanovaH, ...t.vilanova),
    ...h3(t.solsonaH, ...t.solsona),
    ...h3(t.platjaH, ...t.platja),
    ...h3(t.bcnH, ...t.bcn),
    { type: "heading", level: 2, text: t.faqH } as Block,
    faq(t.faq),
    callout("official", verifiedLine(L, CARNIVAL_AS_OF), {
      ca: "Dates calculades amb la Pasqua del calendari laboral 2027; festes locals de cada ajuntament; dies escolars de cada consell escolar; programes dels organitzadors.",
      es: "Fechas calculadas con la Pascua del calendario laboral 2027; fiestas locales de cada ayuntamiento; días escolares de cada consejo escolar; programas de los organizadores.",
      en: "Dates computed from Easter in the 2027 work calendar; local holidays from each council; school days from each school council; programmes from the organisers.",
    }[L]),
    ...b2Related(["easter2027", "schoolFreeDays", "calcots", "sitges"], L),
  ];
}

export const CARNIVAL_GUIDE: B2Article = {
  key: "carnival",
  entryKey: "guide-carnival-catalonia",
  categoryKey: "festivals",
  sources: carnivalSources(),
  heroKey: "sitges-platja-fragata-esglesia",
  heroAlt: {
    ca: "La platja de la Fragata de Sitges amb l'església de Sant Bartomeu i Santa Tecla dalt del penya-segat",
    es: "La playa de la Fragata de Sitges con la iglesia de Sant Bartomeu i Santa Tecla sobre el acantilado",
    en: "Sitges's Fragata beach with the church of Sant Bartomeu i Santa Tecla on the headland",
  },
  heroCaption: {
    ca: "Sitges, on el Carnaval 2027 va del 4 al 10 de febrer.",
    es: "Sitges, donde el Carnaval 2027 va del 4 al 10 de febrero.",
    en: "Sitges, whose Carnival 2027 runs from 4 to 10 February.",
  },
  verifiedAt: CARNIVAL_AS_OF,
  publishedAt: "2026-11-13T12:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.carnival[locale], ...CARNIVAL_META[locale], blocks: buildCarnivalBody(locale) }]),
  ) as B2Article["editions"],
};
