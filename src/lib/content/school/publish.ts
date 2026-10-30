import "server-only";

import type { Block } from "@/lib/content/blocks";
import { IMAGES } from "@/lib/content/images";
import { publishArticle, upsertImages, type ArticleSpec, type ImageSpec, type PublishResult } from "@/lib/content/publish-article";
import { LOCALES, type Locale } from "@/lib/i18n/config";

import {
  addDays,
  aranSubstitutionFor,
  daysBetween,
  holidayOn,
  isCovered,
  longDate,
  shortDate,
  todayInCatalonia,
  weekdayIndex,
} from "@/lib/content/holidays/calendar";
import { BARCELONA_LOCAL } from "@/lib/content/holidays/payload";
import { municipalityBySlug } from "@/lib/programmatic/holidays/data";
import { townPageCount } from "@/lib/programmatic/holidays/towns";

import { SCHOOL_SOURCE, SCHOOL_VERIFIED_AT, SCHOOL_YEARS, type SchoolYear } from "./calendar";
import { bridgeDays, generalSchoolDays, weekdayDay } from "./snippet";

/**
 * "School calendar in Catalonia."
 *
 * One order (EDF/66/2026) sets three school years at once, which makes this a
 * page that answers the same recurring questions - when does school start,
 * when are the Christmas and Easter holidays, is there school today - for
 * three years without a refresh. Every statement in the copy below is in the
 * order's text; nothing is added from memory or from other sites.
 */

export const ENTRY_KEY = "guide-school-calendar-catalonia";

const PUBLISHED = new Date("2026-10-07T22:45:00+02:00");
const HERO_KEY = "calendari-escolar-escola-vic-pati";
const SECOND_KEY = "calendari-escolar-grup-ramon-llull";
const IMAGE_BY_KEY = new Map(IMAGES.map((image) => [image.key, image]));

interface Copy {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  lead: string;
  howTitle: string;
  how: string[];
  freeTitle: string;
  free: string[];
  juneTitle: string;
  june: string[];
  otherTitle: string;
  other: string[];
  /** The course that has just ended, for searches that still name its year. */
  previousTitle: string;
  previous: string[];
  related: string;
  heroAlt: string;
  heroCaption: string;
  secondAlt: string;
  secondCaption: string;
}

export const COPY: Record<Locale, Copy> = {
  ca: {
    path: "guies/calendari-escolar-catalunya",
    title: "Calendari escolar 2026-2027 a Catalunya: Nadal, Setmana Santa, festius i lliure disposició",
    // Stored fallback; the rendered title names the next break (school/snippet.ts).
    seoTitle: "Calendari escolar 2026-2027 Catalunya: vacances i festius",
    seoDescription:
      "Curs 2026-2027 a Catalunya: comença el 8 de setembre, Nadal del 22 de desembre al 7 de gener, Setmana Santa del 20 al 29 de març i acaba el 21 de juny.",
    excerpt:
      "Les dates oficials dels cursos 2026-2027, 2027-2028 i 2028-2029: inici, final, Nadal, Setmana Santa, festius del curs i si avui hi ha escola.",
    lead: "Una sola ordre del Departament d'Educació fixa el calendari escolar de **tres cursos seguits**. A sota: si **avui i demà** hi ha escola, el pròxim festiu, els dies de lliure disposició i els cursos següents que ja fixa l'ordre.",
    howTitle: "Ordre EDF/66/2026: com es fixa el calendari escolar",
    how: [
      "L'Ordre EDF/66/2026, publicada al DOGC el 27 d'abril de 2026, estableix el calendari dels cursos 2026-2027, 2027-2028 i 2028-2029 per a totes les escoles i instituts de Catalunya, públics i privats. La Llei d'educació demana entre 175 i 178 dies lectius per curs.",
      "El curs comença el sisè dia laborable de setembre, que en els tres cursos és el **8 de setembre**, o el dia laborable següent si el 8 és festiu. L'FP, en canvi, comença com a més tard el 14, el 13 o el 12 de setembre, segons el curs.",
      "A infantil (P3, P4 i P5), l'escola pot fer un **inici gradual** durant els cinc primers dies de curs, sempre que cada infant hi estigui com a mínim una hora i mitja i ho hagi aprovat el consell escolar.",
    ],
    freeTitle: "Dies de lliure disposició i festius locals",
    free: [
      "Cada escola pot fixar **quatre dies de lliure disposició** per curs, repartits entre els tres trimestres. No poden coincidir amb el primer ni l'últim dia de curs, ni amb les vacances de Nadal o Setmana Santa. Els decideix cada centre, i el consell escolar municipal proposa quins convindria que fessin totes les escoles del mateix municipi: per saber-los, cal preguntar a l'escola o a l'ajuntament.",
      "Només de manera excepcional una escola pot posar dies de lliure disposició seguits dins un mateix trimestre: cal l'acord previ del seu consell escolar i l'autorització dels serveis territorials d'Educació. I les escoles que comparteixen línia de transport escolar han de procurar triar els mateixos dies.",
      `També són festius els dos dies de **festa local** del municipi. Si un festiu local cau en un dia no lectiu, l'escola el pot afegir als seus dies de lliure disposició. Els dels ${townPageCount()} municipis que en tenen són a [festius locals per municipi](/ca/festius/), un per un i per comarques, i en una sola llista a la pàgina de [festius locals](/ca/guies/festius-locals-catalunya/).`,
    ],
    juneTitle: "Juny: jornada continuada",
    june: [
      "Les escoles i instituts poden reduir una hora diària l'horari de l'alumnat al final de curs, a partir del **7 de juny de 2027**, el **9 de juny de 2028** i l'**11 de juny de 2029**. És una opció de cada centre, no una obligació.",
    ],
    otherTitle: "Batxillerat, FP i adults",
    other: [
      "Primer de batxillerat acaba el 17 de juny de 2027, el 20 de juny de 2028 i el 20 de juny de 2029. El final de segon de batxillerat el fixa cada centre segons el calendari d'accés a la universitat.",
      "La formació de persones adultes i les escoles oficials d'idiomes comencen com a més tard el 21 de setembre de 2026, el 20 de setembre de 2027 i el 18 i el 21 de setembre de 2028, respectivament.",
    ],
    previousTitle: "El curs passat: calendari escolar 2025-2026",
    previous: [
      "El curs 2025-2026 ja s'ha acabat. Va començar el 8 de setembre de 2025 (el 12 per a batxillerat i FP de grau mitjà i superior), va acabar el 19 de juny de 2026 i tenia vacances de Nadal del 20 de desembre de 2025 al 7 de gener de 2026 i de Setmana Santa del 28 de març al 6 d'abril de 2026, segons l'Ordre EDF/72/2025 recollida pel Consorci d'Educació de Barcelona.",
    ],
    related:
      "Per planificar ponts i vacances amb els festius laborals, mira el [calendari laboral 2027](/ca/guies/calendari-laboral-catalunya/) i la pàgina [és festiu avui](/ca/guies/es-festiu-avui-catalunya/).",
    heroAlt: "Façana de l'Escola Jaume Balmes de Vic amb el pati enrajolat al davant",
    heroCaption: "L'Escola Jaume Balmes, a Vic.",
    secondAlt: "Edifici del Grup Escolar Ramon Llull de Barcelona entre palmeres i arbres",
    secondCaption: "El Grup Escolar Ramon Llull, a Barcelona.",
  },
  es: {
    path: "guias/calendario-escolar-cataluna",
    title: "Calendario escolar 2026-2027 en Cataluña: Navidad, Semana Santa, festivos y libre disposición",
    seoTitle: "Calendario escolar Cataluña 2026-2027: vacaciones y festivos",
    seoDescription:
      "Curso 2026-2027 en Cataluña: inicio el 8 de septiembre, Navidad del 22 de diciembre al 7 de enero, Semana Santa del 20 al 29 de marzo, fin el 21 de junio.",
    excerpt:
      "Las fechas oficiales de los cursos 2026-2027, 2027-2028 y 2028-2029: inicio, final, Navidad, Semana Santa, festivos del curso y si hoy hay colegio.",
    lead: "Una sola orden del Departamento de Educación fija el calendario escolar de **tres cursos seguidos**. Debajo: si **hoy y mañana** hay cole, el próximo festivo, los días de libre disposición y los cursos siguientes que ya fija la orden.",
    howTitle: "Orden EDF/66/2026: cómo se fija el calendario escolar",
    how: [
      "La Ordre EDF/66/2026, publicada en el DOGC el 27 de abril de 2026, establece el calendario de los cursos 2026-2027, 2027-2028 y 2028-2029 para todos los colegios e institutos de Cataluña, públicos y privados. La Ley de educación exige entre 175 y 178 días lectivos por curso.",
      "El curso empieza el sexto día laborable de septiembre, que en los tres cursos es el **8 de septiembre**, o el siguiente día laborable si el 8 es festivo. La FP, en cambio, empieza como muy tarde el 14, el 13 o el 12 de septiembre, según el curso.",
      "En infantil (P3, P4 y P5), el colegio puede hacer un **inicio gradual** durante los cinco primeros días de curso, siempre que cada niño esté como mínimo una hora y media en el centro y lo haya aprobado el consejo escolar.",
    ],
    freeTitle: "Días de libre disposición y festivos locales",
    free: [
      "Cada colegio puede fijar **cuatro días de libre disposición** por curso, repartidos entre los tres trimestres. No pueden coincidir con el primer ni el último día de curso, ni con las vacaciones de Navidad o Semana Santa. Los decide cada centro, y el consejo escolar municipal propone cuáles convendría que hicieran todos los colegios del mismo municipio: para saberlos, hay que preguntar al colegio o al ayuntamiento.",
      "Solo de forma excepcional un colegio puede poner días de libre disposición seguidos dentro de un mismo trimestre: hace falta el acuerdo previo de su consejo escolar y la autorización de los servicios territoriales de Educación. Y los colegios que comparten línea de transporte escolar deben procurar elegir los mismos días.",
      `También son festivos los dos días de **fiesta local** del municipio. Si un festivo local cae en un día no lectivo, el colegio puede añadirlo a sus días de libre disposición. Los de los ${townPageCount()} municipios que los tienen están en [festivos locales por municipio](/es/festivos/), uno a uno y por comarcas, y en una sola lista en la página de [festivos locales](/es/guias/festivos-locales-cataluna/).`,
    ],
    juneTitle: "Junio: jornada continua",
    june: [
      "Los colegios e institutos pueden reducir una hora diaria el horario del alumnado al final de curso, a partir del **7 de junio de 2027**, el **9 de junio de 2028** y el **11 de junio de 2029**. Es una opción de cada centro, no una obligación.",
    ],
    otherTitle: "Bachillerato, FP y adultos",
    other: [
      "Primero de bachillerato termina el 17 de junio de 2027, el 20 de junio de 2028 y el 20 de junio de 2029. El final de segundo de bachillerato lo fija cada centro según el calendario de acceso a la universidad.",
      "La formación de personas adultas y las escuelas oficiales de idiomas empiezan como muy tarde el 21 de septiembre de 2026, el 20 de septiembre de 2027 y el 18 y el 21 de septiembre de 2028, respectivamente.",
    ],
    previousTitle: "El curso pasado: calendario escolar 2025-2026",
    previous: [
      "El curso 2025-2026 ya ha terminado. Empezó el 8 de septiembre de 2025 (el 12 para bachillerato y FP de grado medio y superior), terminó el 19 de junio de 2026 y tuvo vacaciones de Navidad del 20 de diciembre de 2025 al 7 de enero de 2026 y de Semana Santa del 28 de marzo al 6 de abril de 2026, según la Ordre EDF/72/2025 recogida por el Consorci d'Educació de Barcelona.",
    ],
    related:
      "Para planificar puentes y vacaciones con los festivos laborales, mira el [calendario laboral 2027](/es/guias/calendario-laboral-cataluna/) y la página [es festivo hoy](/es/guias/es-festivo-hoy-cataluna/).",
    heroAlt: "Fachada de la Escola Jaume Balmes de Vic con el patio embaldosado delante",
    heroCaption: "La Escola Jaume Balmes, en Vic.",
    secondAlt: "Edificio del Grup Escolar Ramon Llull de Barcelona entre palmeras y árboles",
    secondCaption: "El Grup Escolar Ramon Llull, en Barcelona.",
  },
  en: {
    path: "guides/catalonia-school-calendar",
    title: "Catalonia school calendar 2026-2027: term dates, Christmas, Easter and days off",
    seoTitle: "Catalonia school calendar 2026-2027: holidays and term dates",
    seoDescription:
      "School year 2026-2027 in Catalonia: starts 8 September, Christmas 22 December to 7 January, Easter 20 to 29 March, ends 21 June. Plus Barcelona's days off.",
    excerpt:
      "Official term dates for 2026-2027, 2027-2028 and 2028-2029: start, end, Christmas, Easter, the year's days off and whether schools are open today.",
    lead: "A single order from the Catalan education department sets the school calendar for **three years in a row**. Below: whether there is school **today and tomorrow**, the next day off, free-choice days, and the years after this one that the order already sets.",
    howTitle: "Order EDF/66/2026: how the school calendar is set",
    how: [
      "Order EDF/66/2026, published in the Catalan official gazette (DOGC) on 27 April 2026, sets the calendar for 2026-2027, 2027-2028 and 2028-2029 for every school in Catalonia, state and private. Catalan education law requires between 175 and 178 teaching days a year.",
      "The year starts on the sixth working day of September, which in all three years is **8 September**, or the next working day if the 8th is a holiday. Vocational training (FP) starts by 14, 13 or 12 September at the latest, depending on the year.",
      "For the youngest (P3, P4 and P5, ages 3 to 5), schools may phase the start over the first five days, provided each child spends at least an hour and a half at school and the school council has approved it.",
    ],
    freeTitle: "Free-choice days and local holidays",
    free: [
      "Each school can set **four free-choice days** a year, spread across the three terms. They cannot fall on the first or last day of the year, or in the Christmas or Easter holidays. Each school decides its own, and the municipal school council suggests days for all schools in the same town to share: ask the school or the town hall.",
      "Only exceptionally can a school put free-choice days back to back within one term: it needs its school council's prior agreement and the education department's regional office's authorisation. Schools that share a school-bus route are expected to choose the same days.",
      "The town's two **local holidays** are also days off. If one falls on a non-school day, the school can add it to its free-choice days. Every town's local holidays are on the [local holidays](/en/guides/local-holidays-catalonia/) page.",
    ],
    juneTitle: "June: shorter school days",
    june: [
      "Schools may cut the school day by one hour at the end of the year, from **7 June 2027**, **9 June 2028** and **11 June 2029**. It is each school's choice, not a rule.",
    ],
    otherTitle: "Batxillerat, vocational training and adults",
    other: [
      "First-year batxillerat (the two-year upper-secondary course) ends on 17 June 2027, 20 June 2028 and 20 June 2029. The end of the second year is set by each school around the university-entrance calendar.",
      "Adult education and the official language schools start by 21 September 2026, 20 September 2027, and 18 and 21 September 2028 respectively, at the latest.",
    ],
    previousTitle: "Last year: the 2025-2026 school calendar",
    previous: [
      "The 2025-2026 school year is over. It started on 8 September 2025 (12 September for batxillerat and intermediate and higher vocational training), ended on 19 June 2026, and had Christmas holidays from 20 December 2025 to 7 January 2026 and Easter holidays from 28 March to 6 April 2026, under Order EDF/72/2025 as published by the Consorci d'Educació de Barcelona.",
    ],
    related:
      "To plan long weekends around public holidays, see the [public holiday guide](/en/guides/catalonia-public-holidays/) and [is today a holiday](/en/guides/is-today-a-holiday-in-catalonia/).",
    heroAlt: "Front of the Jaume Balmes school in Vic with its paved playground",
    heroCaption: "Jaume Balmes school, Vic.",
    secondAlt: "The Ramon Llull school building in Barcelona among palm trees",
    secondCaption: "The Ramon Llull school group, Barcelona.",
  },
};

export function buildBody(locale: Locale, secondMediaId?: string): Block[] {
  const copy = COPY[locale];
  const year = currentYear(todayInCatalonia());
  const blocks: Block[] = [
    { type: "paragraph", lead: true, text: `${answerLead(year, locale)} ${copy.lead}` },
  ];
  blocks.push({ type: "schoolCalendar" });
  blocks.push(christmasCallout(year, locale));
  blocks.push(...daysOff(year, locale));
  blocks.push(...barcelona(year, locale));

  const section = (heading: string, paragraphs: string[]) => {
    blocks.push({ type: "heading", level: 2, text: heading });
    for (const text of paragraphs) blocks.push({ type: "paragraph", text });
  };
  section(copy.howTitle, copy.how);
  section(copy.freeTitle, [...copy.free, ...bridgeParagraphs(year, locale)]);
  if (secondMediaId) blocks.push({ type: "image", mediaId: secondMediaId, size: "wide" });
  section(copy.juneTitle, copy.june);
  section(copy.otherTitle, copy.other);
  blocks.push(...nextYears(year, locale));
  section(copy.previousTitle, copy.previous);
  blocks.push(faq(year, locale));
  blocks.push({ type: "paragraph", text: copy.related });
  return blocks;
}

/* -------------------------------------------------------------------------- */
/* The answer first, and the days off: computed, never typed                  */
/* -------------------------------------------------------------------------- */

/**
 * Search Console: "días lectivos / no lectivos", "cuándo empiezan las clases",
 * "calendario escolar barcelona" at positions 30-60, because the page gave no
 * date in its first screen and did not count the days off at all. Everything
 * below is derived from SCHOOL_YEARS (Ordre EDF/66/2026) and the holiday
 * orders (EMT/66/2025, EMT/52/2026), so it cannot drift from the table.
 */

/** The school year in progress, or the next one during the summer. */
function currentYear(today: string): SchoolYear {
  return SCHOOL_YEARS.find((year) => today <= year.end) ?? SCHOOL_YEARS[SCHOOL_YEARS.length - 1]!;
}

/** "8 de setembre de 2026" / "8 September 2026": the long date without its weekday. */
function dayMonthYear(iso: string, locale: Locale): string {
  return longDate(iso, locale).replace(/^\S+,?\s/, "");
}

function answerLead(year: SchoolYear, locale: Locale): string {
  const started = todayInCatalonia() >= year.start;
  const d = (iso: string) => `**${dayMonthYear(iso, locale)}**`;
  if (locale === "ca") {
    return `El curs ${year.label} a Catalunya ${started ? "va començar" : "comença"} el ${d(year.start)} i acaba el ${d(year.end)}. Les vacances de Nadal van del ${d(year.christmas[0])} al ${d(year.christmas[1])}, i les de Setmana Santa, del ${d(year.easter[0])} al ${d(year.easter[1])}.`;
  }
  if (locale === "es") {
    return `El curso ${year.label} en Cataluña ${started ? "empezó" : "empieza"} el ${d(year.start)} y termina el ${d(year.end)}. Las vacaciones de Navidad van del ${d(year.christmas[0])} al ${d(year.christmas[1])}, y las de Semana Santa, del ${d(year.easter[0])} al ${d(year.easter[1])}.`;
  }
  return `The ${year.label} school year in Catalonia ${started ? "started" : "starts"} on ${d(year.start)} and ends on ${d(year.end)}. The Christmas holidays run from ${d(year.christmas[0])} to ${d(year.christmas[1])}, and Easter from ${d(year.easter[0])} to ${d(year.easter[1])}.`;
}

/** Catalonia-wide holidays that fall on a weekday inside term. */
function holidaysOnSchoolDays(year: SchoolYear): { date: string; name: Record<Locale, string> }[] {
  const out: { date: string; name: Record<Locale, string> }[] = [];
  for (let day = year.start; day <= year.end; day = addDays(day, 1)) {
    const weekday = weekdayIndex(day);
    if (weekday === 0 || weekday === 6) continue;
    if (day >= year.christmas[0] && day <= year.christmas[1]) continue;
    if (day >= year.easter[0] && day <= year.easter[1]) continue;
    const holiday = holidayOn(day);
    if (holiday) out.push({ date: day, name: holiday.name });
  }
  return out;
}

/** A Catalonia-wide holiday Aran swaps for its own day, if that day is in term. */
function aranSwapInTerm(year: SchoolYear) {
  for (let day = year.start; day <= year.end; day = addDays(day, 1)) {
    const swap = aranSubstitutionFor(day);
    if (swap && swap.date >= year.start && swap.date <= year.end) return swap;
  }
  return null;
}

/**
 * The proposal of the Consell d'Educació Municipal de Barcelona (CEMB),
 * approved at its plenary of 10 June 2026 (re-read 28 Oct 2026), with the
 * reason it gives for each day. A recommendation, not a rule, and for one
 * school year only.
 */
const BARCELONA_DAYS: Record<string, { date: string; reason: Record<Locale, string> }[]> = {
  "2026-2027": [
    { date: "2026-10-30", reason: { ca: "Castanyada i Tots Sants", es: "Castañada y Todos los Santos", en: "Castanyada and All Saints" } },
    { date: "2026-12-07", reason: { ca: "pont del 8 de desembre", es: "puente del 8 de diciembre", en: "8 December long weekend" } },
    { date: "2027-02-08", reason: { ca: "Carnaval", es: "Carnaval", en: "Carnival" } },
    { date: "2027-05-14", reason: { ca: "segona Pasqua", es: "segunda Pascua", en: "Whitsun" } },
  ],
};

const L = <T,>(locale: Locale, ca: T, es: T, en: T): T => (locale === "ca" ? ca : locale === "es" ? es : en);

/** "dimarts 22 de desembre de 2026" / "Tuesday 22 December 2026": weekday first, no comma. */
function day(iso: string, locale: Locale): string {
  return longDate(iso, locale).replace(", ", " ");
}

function span(from: string, to: string, locale: Locale): string {
  return L(locale, `del ${day(from, locale)} al ${day(to, locale)}`, `del ${day(from, locale)} al ${day(to, locale)}`, `${day(from, locale)} to ${day(to, locale)}`);
}

const DAYS_OFF_TITLE: Record<Locale, string> = {
  ca: "Festius i vacances del curs {y}",
  es: "Festivos y vacaciones del curso {y}",
  en: "Holidays and days off in {y}",
};

/**
 * "Vacances de Nadal 2026": the December question, answered before any
 * section. Computed from the order, so it is never a year out.
 */
function christmasCallout(year: SchoolYear, locale: Locale): Block {
  const [from, to] = year.christmas;
  const years = `${from.slice(0, 4)}-${to.slice(0, 4)}`;
  const back = day(addDays(to, 1), locale);
  return {
    type: "callout",
    tone: "info",
    title: L(locale, `Vacances de Nadal ${years}`, `Vacaciones de Navidad ${years}`, `Christmas school holidays ${years}`),
    text: L(
      locale,
      `Del **${day(from, locale)}** al **${day(to, locale)}**, tots dos inclosos. Es torna a classe el **${back}**.`,
      `Del **${day(from, locale)}** al **${day(to, locale)}**, ambos incluidos. Se vuelve a clase el **${back}**.`,
      `From **${day(from, locale)}** to **${day(to, locale)}**, both included. Classes restart on **${back}**.`,
    ),
  };
}

/**
 * Every date without school that the order fixes for all of Catalonia, in one
 * table: the format the Spanish results lead with ("todos los festivos del
 * curso"). Holidays come from the labour calendars, never typed here.
 */
function daysOff(year: SchoolYear, locale: Locale): Block[] {
  const rows: { date: string; cells: [string, string] }[] = [
    {
      date: year.start,
      cells: [day(year.start, locale), L(locale, "Primer dia de curs (infantil, primària, ESO i batxillerat)", "Primer día de curso (infantil, primaria, ESO y bachillerato)", "First day of school (infant, primary, ESO and batxillerat)")],
    },
    ...holidaysOnSchoolDays(year).map((h) => ({
      date: h.date,
      cells: [day(h.date, locale), `${L(locale, "Festiu", "Festivo", "Public holiday")}: ${h.name[locale]}`] as [string, string],
    })),
    { date: year.christmas[0], cells: [span(year.christmas[0], year.christmas[1], locale), L(locale, "Vacances de Nadal", "Vacaciones de Navidad", "Christmas holidays")] },
    { date: year.easter[0], cells: [span(year.easter[0], year.easter[1], locale), L(locale, "Vacances de Setmana Santa", "Vacaciones de Semana Santa", "Easter holidays")] },
    {
      date: year.end,
      cells: [day(year.end, locale), L(locale, "Últim dia de curs (infantil, primària i ESO)", "Último día de curso (infantil, primaria y ESO)", "Last day of school (infant, primary and ESO)")],
    },
  ];
  rows.sort((a, b) => a.date.localeCompare(b.date));

  const afterChristmas = day(addDays(year.christmas[1], 1), locale);
  const afterEaster = day(addDays(year.easter[1], 1), locale);
  const complete = isCovered(year.end);
  const aran = aranSwapInTerm(year);

  const p: string[] = [];
  if (locale === "ca") {
    p.push(`Després de Nadal es torna a classe el ${afterChristmas}, i després de Setmana Santa, el ${afterEaster}.${complete ? "" : " El calendari de festius de l'any vinent encara no s'ha publicat; quan surti, s'hi sumaran els seus dies."}`);
    if (aran) p.push(`A l'Aran, la festa del ${day(aran.replaces, locale)} queda substituïda per la ${aran.name.ca}, el **${day(aran.date, locale)}**, que és dia lectiu a la resta de Catalunya.`);
    p.push("Cal sumar-hi els dos festius locals de cada municipi, que són a [festius locals per municipi](/ca/festius/), i els quatre dies de lliure disposició que tria cada centre.");
  } else if (locale === "es") {
    p.push(`Después de Navidad se vuelve a clase el ${afterChristmas}, y después de Semana Santa, el ${afterEaster}.${complete ? "" : " El calendario de festivos del año que viene aún no se ha publicado; cuando salga, se sumarán sus días."}`);
    if (aran) p.push(`En Arán, la fiesta del ${day(aran.replaces, locale)} se sustituye por la ${aran.name.es}, el **${day(aran.date, locale)}**, que es día lectivo en el resto de Cataluña.`);
    p.push("Hay que sumar los dos festivos locales de cada municipio, que están en [festivos locales por municipio](/es/festivos/), y los cuatro días de libre disposición que elige cada centro.");
  } else {
    p.push(`After Christmas, classes restart on ${afterChristmas}; after Easter, on ${afterEaster}.${complete ? "" : " Next year's holiday calendar has not been published yet; its days will add to these when it is."}`);
    if (aran) p.push(`In Aran, the ${day(aran.replaces, locale)} holiday is replaced by the ${aran.name.en} on **${day(aran.date, locale)}**, a school day everywhere else in Catalonia.`);
    p.push("Add each town's two local holidays, listed in [local holidays in Catalonia](/en/guides/local-holidays-catalonia/), and the four free-choice days each school sets.");
  }

  return [
    { type: "heading", level: 2, text: DAYS_OFF_TITLE[locale].replace("{y}", year.label) },
    {
      type: "paragraph",
      text: L(
        locale,
        `Aquests són els dies sense classe que el calendari fixa per a totes les escoles de Catalunya el curs ${year.label}: l'inici i el final, les vacances i els festius que cauen en dia feiner.`,
        `Estos son los días sin clase que el calendario fija para todos los colegios de Cataluña en el curso ${year.label}: el inicio y el final, las vacaciones y los festivos que caen en día laborable.`,
        `These are the dates the calendar sets for every school in Catalonia in ${year.label}: the first and last days, the holidays and the public holidays that fall on a weekday.`,
      ),
    },
    {
      type: "table",
      caption: DAYS_OFF_TITLE[locale].replace("{y}", year.label),
      headers: L(locale, ["Data", "Què passa"], ["Fecha", "Qué pasa"], ["Date", "What happens"]),
      rows: rows.map((row) => row.cells),
      note: L(
        locale,
        "Ordre EDF/66/2026 (DOGC del 27 d'abril de 2026) i calendaris de festes laborals de la Generalitat (Ordres EMT/66/2025 i EMT/52/2026).",
        "Orden EDF/66/2026 (DOGC del 27 de abril de 2026) y calendarios de fiestas laborales de la Generalitat (Órdenes EMT/66/2025 y EMT/52/2026).",
        "Order EDF/66/2026 (DOGC, 27 April 2026) and the Catalan government's work-holiday calendars (Orders EMT/66/2025 and EMT/52/2026).",
      ),
      stickyColumn: 0,
    },
    ...p.map((text) => ({ type: "paragraph", text }) as Block),
  ];
}

/** Barcelona's two local days inside the school year, from the holiday engine (2026) and the city's 2027 calendar. */
function barcelonaLocalDays(year: SchoolYear): { date: string; name: Record<Locale, string> | null }[] {
  const dates = new Set([...(municipalityBySlug("barcelona")?.local ?? []), ...BARCELONA_LOCAL.map((h) => h.date)]);
  return [...dates]
    .filter((iso) => iso >= year.start && iso <= year.end)
    .filter((iso) => weekdayIndex(iso) >= 1 && weekdayIndex(iso) <= 5)
    .filter((iso) => !(iso >= year.christmas[0] && iso <= year.christmas[1]) && !(iso >= year.easter[0] && iso <= year.easter[1]))
    .sort()
    .map((iso) => {
      const named = BARCELONA_LOCAL.find((h) => h.date === iso) ?? BARCELONA_LOCAL.find((h) => h.date.slice(5) === iso.slice(5));
      return { date: iso, name: named ? named.name : null };
    });
}

/**
 * Runs of three or more days without school, outside the Christmas and Easter
 * holidays, that contain at least one weekday off: the "ponts" of the year for
 * a school that takes every day in `extra` off.
 */
export function schoolBridges(year: SchoolYear, extra: ReadonlySet<string>): { from: string; to: string; days: number }[] {
  const inBreak = (iso: string) =>
    (iso >= year.christmas[0] && iso <= year.christmas[1]) || (iso >= year.easter[0] && iso <= year.easter[1]);
  const weekend = (iso: string) => weekdayIndex(iso) === 0 || weekdayIndex(iso) === 6;
  const off = (iso: string) => !inBreak(iso) && (weekend(iso) || holidayOn(iso) !== null || extra.has(iso));
  const runs: { from: string; to: string; days: number }[] = [];
  let from: string | null = null;
  let weekdayOff = false;
  for (let iso = year.start; iso <= addDays(year.end, 1); iso = addDays(iso, 1)) {
    if (iso <= year.end && off(iso)) {
      from ??= iso;
      if (!weekend(iso)) weekdayOff = true;
      continue;
    }
    if (from) {
      const to = addDays(iso, -1);
      const days = Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000) + 1;
      if (days >= 3 && weekdayOff) runs.push({ from, to, days });
    }
    from = null;
    weekdayOff = false;
  }
  return runs;
}

/**
 * Barcelona: the city's two local days in term and the four days its
 * municipal school council (CEMB) proposes, in one table, and the long
 * weekends they make. A proposal, not a rule: each school decides.
 */
function barcelona(year: SchoolYear, locale: Locale): Block[] {
  const cemb = BARCELONA_DAYS[year.label] ?? [];
  const local = barcelonaLocalDays(year);
  if (cemb.length === 0 && local.length === 0) return [];

  const rows = [
    ...local.map((d) => ({
      date: d.date,
      what: `${L(locale, "Festa local", "Fiesta local", "Local holiday")}${d.name ? ` (${d.name[locale].replace(/ \(.*\)$/, "")})` : ""}`,
    })),
    ...cemb.map((d) => ({
      date: d.date,
      what: `${L(locale, "Dia de lliure disposició proposat pel CEMB", "Día de libre disposición propuesto por el CEMB", "Free-choice day recommended by the CEMB")} (${d.reason[locale]})`,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const bridges = schoolBridges(year, new Set([...local.map((d) => d.date), ...cemb.map((d) => d.date)]));
  const short = (iso: string) => shortDate(iso, locale);
  const bridgeList = bridges.map((b) => `${short(b.from)} – ${short(b.to)} (${b.days} ${L(locale, "dies", "días", "days")})`);
  const and = L(locale, " i ", " y ", " and ");
  const joined = bridgeList.length <= 1 ? bridgeList.join("") : `${bridgeList.slice(0, -1).join(", ")}${and}${bridgeList.at(-1)}`;

  const title = L(locale, `Calendari escolar de Barcelona ${year.label}`, `Calendario escolar de Barcelona ${year.label}`, `Barcelona school calendar ${year.label}`);
  const paragraphs = [
    L(
      locale,
      `A Barcelona, a més del calendari de tot Catalunya, no hi ha classe els dos festius locals de la ciutat, i el Consell d'Educació Municipal de Barcelona (CEMB) proposa a tots els centres quatre dies de lliure disposició comuns. És una proposta de ciutat: cada centre decideix els seus dies.`,
      `En Barcelona, además del calendario de toda Cataluña, no hay clase los dos festivos locales de la ciudad, y el Consell d'Educació Municipal de Barcelona (CEMB) propone a todos los centros cuatro días de libre disposición comunes. Es una propuesta de ciudad: cada centro decide sus días.`,
      `In Barcelona, on top of the Catalonia-wide calendar, there is no school on the city's two local holidays, and the city's municipal education council (CEMB) recommends four shared free-choice days to every school. It is a city-wide recommendation: each school sets its own days.`,
    ),
  ];
  if (joined) {
    paragraphs.push(
      L(
        locale,
        `Per a una escola que els faci tots, surten aquests ponts: ${joined}. Tots els festius de la ciutat són a [festius de Barcelona](/ca/festius/barcelona/).`,
        `Para un colegio que los haga todos, salen estos puentes: ${joined}. Todos los festivos de la ciudad están en [festivos de Barcelona](/es/festivos/barcelona/).`,
        `For a school that takes them all, that makes these long weekends: ${joined}.`,
      ),
    );
  }

  return [
    { type: "heading", level: 2, text: title },
    { type: "paragraph", text: paragraphs[0]! },
    {
      type: "table",
      caption: title,
      headers: L(locale, ["Data", "Per què no hi ha classe"], ["Fecha", "Por qué no hay clase"], ["Date", "Why there is no school"]),
      rows: rows.map((r) => [day(r.date, locale), r.what]),
      note: L(
        locale,
        "Festes locals: Ajuntament de Barcelona. Dies de lliure disposició: proposta aprovada pel plenari del CEMB del 10 de juny de 2026.",
        "Fiestas locales: Ayuntamiento de Barcelona. Días de libre disposición: propuesta aprobada por el pleno del CEMB del 10 de junio de 2026.",
        "Local holidays: Barcelona City Council. Free-choice days: proposal approved by the CEMB plenary on 10 June 2026.",
      ),
      stickyColumn: 0,
    },
    ...paragraphs.slice(1).map((text) => ({ type: "paragraph", text }) as Block),
  ];
}

const BRIDGE_PAGE: Record<Locale, string> = {
  ca: "/ca/guies/pont-desembre-catalunya/",
  es: "/es/guias/puente-diciembre-cataluna/",
  en: "/en/guides/december-long-weekend-catalonia/",
};

/**
 * "Hi ha escola el 7 de desembre?": the Monday or Friday between a weekend
 * and a Tuesday or Thursday holiday. A school day in the general calendar;
 * the order lets each school take it with a free-choice day, and Barcelona's
 * council proposes it to every school when it does (BARCELONA_DAYS).
 */
function bridgeParagraphs(year: SchoolYear, locale: Locale): string[] {
  return bridgeDays(year).map((b) => {
    const cemb = (BARCELONA_DAYS[year.label] ?? []).some((d) => d.date === b.day);
    const link = b.holiday.slice(5) === "12-08" ? BRIDGE_PAGE[locale] : null;
    const d = (iso: string) => weekdayDay(iso, locale);
    return L(
      locale,
      `**El pont del ${d(b.holiday)}.** El ${d(b.day)} és dia lectiu al calendari general: només el ${d(b.holiday)} (${b.name.ca}) és festiu a tot Catalunya. Cada escola el pot fer festiu amb un dels seus quatre dies de lliure disposició${cemb ? ", i a Barcelona el Consell d'Educació Municipal el proposa a tots els centres" : ""}; si el fa, són quatre dies sense classe.${link ? ` Tot el pont, a [pont de desembre](${link}).` : ""}`,
      `**El puente del ${d(b.holiday)}.** El ${d(b.day)} es día lectivo en el calendario general: solo el ${d(b.holiday)} (${b.name.es}) es festivo en toda Cataluña. Cada colegio puede hacerlo festivo con uno de sus cuatro días de libre disposición${cemb ? ", y en Barcelona el Consell d'Educació Municipal lo propone a todos los centros" : ""}; si lo hace, son cuatro días sin clase.${link ? ` Todo el puente, en [puente de diciembre](${link}).` : ""}`,
      `**The ${d(b.holiday)} long weekend.** ${d(b.day)} is a school day in the general calendar: only ${d(b.holiday)} (${b.name.en}) is a holiday across Catalonia. Each school can take it as one of its four free-choice days${cemb ? ", and Barcelona's municipal education council recommends it to every school" : ""}; if it does, that makes four days without school.${link ? ` The whole long weekend: [December long weekend](${link}).` : ""}`,
    );
  });
}

/** "Calendari escolar 2027-2028 i 2028-2029": the years after the current one, from the same order. */
function nextYears(year: SchoolYear, locale: Locale): Block[] {
  const later = SCHOOL_YEARS.slice(SCHOOL_YEARS.indexOf(year) + 1);
  if (later.length === 0) return [];
  const labels = later.map((y) => y.label).join(L(locale, " i ", " y ", " and "));
  const d = (iso: string) => day(iso, locale);
  return [
    { type: "heading", level: 2, text: L(locale, `Calendari escolar ${labels}`, `Calendario escolar ${labels}`, `School calendar ${labels}`) },
    ...later.map(
      (y) =>
        ({
          type: "paragraph",
          text: L(
            locale,
            `**Curs ${y.label}.** Comença el ${d(y.start)} i acaba el ${d(y.end)}. Vacances de Nadal ${span(y.christmas[0], y.christmas[1], locale)}, i de Setmana Santa ${span(y.easter[0], y.easter[1], locale)}, tots els dies inclosos. Primer de batxillerat acaba el ${d(y.endBatxillerat1)}, i l'FP comença com a més tard el ${d(y.startFP)}.`,
            `**Curso ${y.label}.** Empieza el ${d(y.start)} y termina el ${d(y.end)}. Vacaciones de Navidad ${span(y.christmas[0], y.christmas[1], locale)}, y de Semana Santa ${span(y.easter[0], y.easter[1], locale)}, todos los días incluidos. Primero de bachillerato termina el ${d(y.endBatxillerat1)}, y la FP empieza como muy tarde el ${d(y.startFP)}.`,
            `**${y.label}.** Starts on ${d(y.start)} and ends on ${d(y.end)}. Christmas holidays ${span(y.christmas[0], y.christmas[1], locale)}, and Easter ${span(y.easter[0], y.easter[1], locale)}, all days included. First-year batxillerat ends on ${d(y.endBatxillerat1)}; vocational training starts by ${d(y.startFP)} at the latest.`,
          ),
        }) as Block,
    ),
  ];
}

/** The last Monday-to-Friday with class before the Christmas break. */
function lastDayBeforeChristmas(year: SchoolYear): string {
  let iso = addDays(year.christmas[0], -1);
  while (weekdayIndex(iso) === 0 || weekdayIndex(iso) === 6 || holidayOn(iso)) iso = addDays(iso, -1);
  return iso;
}

/** The questions the school calendar is searched with, in the searchers' words. */
function faq(year: SchoolYear, locale: Locale): Block {
  const next = SCHOOL_YEARS[SCHOOL_YEARS.indexOf(year) + 1] ?? null;
  const [c0, c1] = year.christmas;
  const [e0, e1] = year.easter;
  const cy = c0.slice(0, 4);
  const ey = e0.slice(0, 4);
  const d = (iso: string) => day(iso, locale);
  const today = { ca: "/ca/guies/es-festiu-avui-catalunya/", es: "/es/guias/es-festivo-hoy-cataluna/", en: "/en/guides/is-today-a-holiday-in-catalonia/" }[locale];
  const bridge = bridgeDays(year)[0] ?? null;
  const cemb = BARCELONA_DAYS[year.label] ?? [];
  const cembDays = cemb.map((c) => weekdayDay(c.date, locale));
  const cembList = cembDays.length <= 1 ? cembDays.join("") : `${cembDays.slice(0, -1).join(", ")}${L(locale, " i ", " y ", " and ")}${cembDays.at(-1)}`;
  const schoolDays = generalSchoolDays(year);
  const weeks = Math.round((daysBetween(year.start, year.end) + 1) / 7);
  const lastBeforeXmas = lastDayBeforeChristmas(year);

  const items: Record<Locale, { question: string; answer: string }[]> = {
    ca: [
      { question: `Quan comencen les vacances de Nadal ${cy} a les escoles?`, answer: `El ${d(c0)}. Duren fins al ${d(c1)}, inclòs, i es torna a classe el ${d(addDays(c1, 1))}.` },
      ...(bridge ? [{ question: `Hi ha escola el ${weekdayDay(bridge.day, locale)}?`, answer: `Al calendari general, sí: és dia lectiu, i només el ${weekdayDay(bridge.holiday, locale)} és festiu a tot Catalunya. Però cada escola el pot fer festiu amb un dels seus quatre dies de lliure disposició${cemb.some((c) => c.date === bridge.day) ? ", i a Barcelona el Consell d'Educació Municipal el proposa a tots els centres" : ""}. Pregunta-ho a la teva escola.` }] : []),
      { question: `Quins són els dies de lliure disposició del curs ${year.label}?`, answer: `Els tria cada escola: quatre per curs, repartits entre els tres trimestres i mai el primer o l'últim dia ni durant les vacances. El consell escolar municipal en proposa uns de comuns${cemb.length ? `; a Barcelona, el CEMB proposa ${cembList}` : ""}.` },
      { question: `Quan és la Setmana Santa ${ey} a les escoles de Catalunya?`, answer: `Del ${d(e0)} al ${d(e1)}, tots dos inclosos; les classes tornen el ${d(addDays(e1, 1))}.` },
      ...(next ? [{ question: `Quan és la Setmana Santa ${next.easter[0].slice(0, 4)} a les escoles?`, answer: `Del ${d(next.easter[0])} al ${d(next.easter[1])}, tots dos inclosos (curs ${next.label}).` }] : []),
      { question: `Quan acaba el curs ${year.label}?`, answer: `El ${d(year.end)} a infantil, primària i ESO. Primer de batxillerat acaba el ${d(year.endBatxillerat1)}.` },
      ...(next ? [{ question: `Quan comença el curs ${next.label}?`, answer: `El ${d(next.start)} a infantil, primària, ESO i batxillerat (o el dia feiner següent, si és festiu); l'FP, com a més tard el ${d(next.startFP)}.` }] : []),
      { question: "Quants dies lectius té el curs escolar?", answer: `Entre 175 i 178, com fixa la Llei d'educació de Catalunya (article 54.1 de la Llei 12/2009).${schoolDays ? ` El curs ${year.label} té ${schoolDays} dies de classe al calendari general; una escola que faci els dos festius locals i els quatre de lliure disposició en dia lectiu en té ${schoolDays - 6}.` : " El nombre exacte de cada escola depèn dels festius locals i dels seus dies de lliure disposició."}` },
      { question: "Quantes setmanes té un curs escolar?", answer: `Del ${d(year.start)} al ${d(year.end)} hi ha ${weeks} setmanes.${schoolDays ? ` Sense les vacances de Nadal i Setmana Santa ni els festius, queden ${schoolDays} dies de classe, unes ${Math.round(schoolDays / 5)} setmanes de cinc dies, i unes ${Math.round((schoolDays - 6) / 5)} quan l'escola hi descompta els seus sis dies propis.` : ""}` },
      { question: "L'últim dia abans de Nadal hi ha jornada intensiva?", answer: `Pot ser: l'Ordre EDF/66/2026 permet que cada escola faci jornada continuada l'últim dia de classe abans de Nadal, que aquest curs és el ${d(lastBeforeXmas)}, compensant-ne les hores. Ho decideix i ho comunica cada escola: pregunta-ho a la teva.` },
      { question: "Avui o demà hi ha escola a Catalunya?", answer: `El quadre del principi diu cada dia si avui i demà hi ha classe segons el calendari oficial. Per als festius, inclosos els locals de cada municipi, mira [és festiu avui](${today}).` },
    ],
    es: [
      { question: `¿Cuándo empiezan las vacaciones de Navidad ${cy} en los colegios?`, answer: `El ${d(c0)}. Duran hasta el ${d(c1)}, incluido, y se vuelve a clase el ${d(addDays(c1, 1))}.` },
      ...(bridge ? [{ question: `¿Hay cole el ${weekdayDay(bridge.day, locale)}?`, answer: `En el calendario general, sí: es día lectivo, y solo el ${weekdayDay(bridge.holiday, locale)} es festivo en toda Cataluña. Pero cada colegio puede hacerlo festivo con uno de sus cuatro días de libre disposición${cemb.some((c) => c.date === bridge.day) ? ", y en Barcelona el Consell d'Educació Municipal lo propone a todos los centros" : ""}. Pregúntalo en tu colegio.` }] : []),
      { question: `¿Cuáles son los días de libre disposición del curso ${year.label}?`, answer: `Los elige cada colegio: cuatro por curso, repartidos entre los tres trimestres y nunca el primer o el último día ni durante las vacaciones. El consejo escolar municipal propone unos comunes${cemb.length ? `; en Barcelona, el CEMB propone ${cembList}` : ""}.` },
      { question: `¿Cuándo es Semana Santa ${ey} en los colegios de Cataluña?`, answer: `Del ${d(e0)} al ${d(e1)}, ambos incluidos; las clases vuelven el ${d(addDays(e1, 1))}.` },
      ...(next ? [{ question: `¿Cuándo es Semana Santa ${next.easter[0].slice(0, 4)} en los colegios?`, answer: `Del ${d(next.easter[0])} al ${d(next.easter[1])}, ambos incluidos (curso ${next.label}).` }] : []),
      { question: `¿Cuándo termina el curso ${year.label}?`, answer: `El ${d(year.end)} en infantil, primaria y ESO. Primero de bachillerato termina el ${d(year.endBatxillerat1)}.` },
      ...(next ? [{ question: `¿Cuándo empieza el curso ${next.label}?`, answer: `El ${d(next.start)} en infantil, primaria, ESO y bachillerato (o el siguiente día laborable, si es festivo); la FP, como muy tarde el ${d(next.startFP)}.` }] : []),
      { question: "¿Cuántos días lectivos tiene el curso escolar?", answer: `Entre 175 y 178, como fija la Ley de educación de Cataluña (artículo 54.1 de la Llei 12/2009).${schoolDays ? ` El curso ${year.label} tiene ${schoolDays} días de clase en el calendario general; un colegio que haga los dos festivos locales y los cuatro de libre disposición en día lectivo tiene ${schoolDays - 6}.` : " El número exacto de cada colegio depende de los festivos locales y de sus días de libre disposición."}` },
      { question: "¿Cuántas semanas tiene un curso escolar?", answer: `Del ${d(year.start)} al ${d(year.end)} hay ${weeks} semanas.${schoolDays ? ` Sin las vacaciones de Navidad y Semana Santa ni los festivos, quedan ${schoolDays} días de clase, unas ${Math.round(schoolDays / 5)} semanas de cinco días, y unas ${Math.round((schoolDays - 6) / 5)} cuando el colegio descuenta sus seis días propios.` : ""}` },
      { question: "¿El último día antes de Navidad hay jornada intensiva?", answer: `Puede: la Orden EDF/66/2026 permite que cada colegio haga jornada continua el último día de clase antes de Navidad, que este curso es el ${d(lastBeforeXmas)}, compensando las horas. Lo decide y lo comunica cada colegio: pregúntalo en el tuyo.` },
      { question: "¿Hoy o mañana hay cole o instituto en Cataluña?", answer: `El cuadro del principio dice cada día si hoy y mañana hay clase según el calendario oficial. Para los festivos, incluidos los locales de cada municipio, mira [es festivo hoy](${today}).` },
    ],
    en: [
      { question: `When do the ${cy} Christmas school holidays start?`, answer: `On ${d(c0)}. They last until ${d(c1)}, included, and classes restart on ${d(addDays(c1, 1))}.` },
      ...(bridge ? [{ question: `Is there school on ${weekdayDay(bridge.day, locale)}?`, answer: `In the general calendar, yes: it is a school day, and only ${weekdayDay(bridge.holiday, locale)} is a holiday across Catalonia. But each school can take it as one of its four free-choice days${cemb.some((c) => c.date === bridge.day) ? ", and Barcelona's municipal education council recommends it to every school" : ""}. Ask your school.` }] : []),
      { question: `What are the free-choice days in ${year.label}?`, answer: `Each school chooses its own: four a year, spread across the three terms, never the first or last day or inside the holidays. The municipal school council suggests shared ones${cemb.length ? `; in Barcelona the CEMB recommends ${cembList}` : ""}.` },
      { question: `When are the ${ey} Easter school holidays in Catalonia?`, answer: `From ${d(e0)} to ${d(e1)}, both included; classes restart on ${d(addDays(e1, 1))}.` },
      ...(next ? [{ question: `When are the ${next.easter[0].slice(0, 4)} Easter school holidays?`, answer: `From ${d(next.easter[0])} to ${d(next.easter[1])}, both included (${next.label} school year).` }] : []),
      { question: `When does the ${year.label} school year end?`, answer: `On ${d(year.end)} for infant, primary and ESO. First-year batxillerat ends on ${d(year.endBatxillerat1)}.` },
      ...(next ? [{ question: `When does the ${next.label} school year start?`, answer: `On ${d(next.start)} for infant, primary, ESO and batxillerat (or the next working day if that is a holiday); vocational training by ${d(next.startFP)} at the latest.` }] : []),
      { question: "How many school days are there in a year?", answer: `Between 175 and 178, as Catalonia's education law sets (article 54.1 of Llei 12/2009).${schoolDays ? ` ${year.label} has ${schoolDays} school days in the general calendar; a school whose two local holidays and four free-choice days all fall on school days has ${schoolDays - 6}.` : " The exact number for each school depends on local holidays and its free-choice days."}` },
      { question: "How many weeks is a school year?", answer: `From ${d(year.start)} to ${d(year.end)} is ${weeks} weeks.${schoolDays ? ` Without the Christmas and Easter breaks and the public holidays, that leaves ${schoolDays} school days, about ${Math.round(schoolDays / 5)} five-day weeks, or about ${Math.round((schoolDays - 6) / 5)} once a school takes its own six days off.` : ""}` },
      { question: "Is the last day before Christmas a short day?", answer: `It can be: Order EDF/66/2026 lets each school run a continuous (shorter) day on the last school day before Christmas, which this year is ${d(lastBeforeXmas)}, making the hours up elsewhere. Each school decides and announces it: ask yours.` },
      { question: "Is there school today or tomorrow in Catalonia?", answer: `The box at the top says every day whether there is school today and tomorrow under the official calendar. For public and local holidays, see [is today a holiday](${today}).` },
    ],
  };
  return { type: "faq", title: L(locale, "Preguntes freqüents", "Preguntas frecuentes", "Frequently asked questions"), items: items[locale] };
}

function imageSpec(key: string, alt: (c: Copy) => string, caption: (c: Copy) => string): ImageSpec {
  const file = IMAGE_BY_KEY.get(key);
  if (!file) throw new Error(`school: image ${key} missing from the manifest`);
  return {
    key,
    url: file.url,
    width: file.width,
    height: file.height,
    blurDataUrl: file.blurDataUrl,
    credit: file.credit ?? "CatalunyaInfo",
    creditUrl: file.creditUrl ?? null,
    license: file.license ?? null,
    alt: Object.fromEntries(LOCALES.map((l) => [l, alt(COPY[l])])),
    caption: Object.fromEntries(LOCALES.map((l) => [l, caption(COPY[l])])),
  };
}

export async function publishSchoolCalendarGuide(): Promise<PublishResult> {
  const images = [
    imageSpec(HERO_KEY, (c) => c.heroAlt, (c) => c.heroCaption),
    imageSpec(SECOND_KEY, (c) => c.secondAlt, (c) => c.secondCaption),
  ];
  const mediaIds = await upsertImages(images);

  const spec: ArticleSpec = {
    entryKey: ENTRY_KEY,
    type: "guide",
    categoryKey: "calendar",
    isFeatured: false,
    heroKey: HERO_KEY,
    images,
    sources: [
      { name: SCHOOL_SOURCE.name, url: SCHOOL_SOURCE.url, publisher: SCHOOL_SOURCE.publisher, type: "official" as const },
      {
        name: "Proposta de dies de lliure disposició del CEMB per al curs 2026-2027",
        url: "https://pro-gestornoticies-dtibcn-cat.s3.amazonaws.com/gestornoticies-pro/media/PROPOSTA_APROVADA_DE_DIES_DE_LLIURE_DISPOSICIO_DEL_CEMB_PER_AL_CURS_2026-2027.0d2f10d5.pdf",
        publisher: "Consell d'Educació Municipal de Barcelona",
        type: "official" as const,
      },
      {
        name: "Calendari de festes laborals 2027 (Ordre EMT/52/2026)",
        url: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2027/",
        publisher: "Departament d'Empresa i Treball, Generalitat de Catalunya",
        type: "official" as const,
      },
      {
        name: "Festes estatals i autonòmiques a Catalunya i locals a Barcelona",
        url: "https://ajuntament.barcelona.cat/calendarifestius/ca/",
        publisher: "Ajuntament de Barcelona",
        type: "official" as const,
      },
      {
        name: "Calendari escolar 2025-2026",
        url: "https://www.edubcn.cat/ca/centres_serveis_educatius/centres_educatius/gestio_centres/calendari_escolar/2025_2026",
        publisher: "Consorci d'Educació de Barcelona",
        type: "official" as const,
      },
    ],
    publishedAt: PUBLISHED,
    lastVerifiedAt: new Date(`${SCHOOL_VERIFIED_AT}T12:00:00+02:00`),
    editions: LOCALES.map((locale) => {
      const copy = COPY[locale];
      return {
        locale,
        path: copy.path,
        title: copy.title,
        excerpt: copy.excerpt,
        seoTitle: copy.seoTitle,
        seoDescription: copy.seoDescription,
        body: buildBody(locale, mediaIds.get(SECOND_KEY)),
      };
    }),
  };

  return publishArticle(spec);
}
