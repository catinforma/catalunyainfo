import "server-only";

import { calendarLine } from "@/lib/content/batch02/christmas-season-links";
import { b2href } from "@/lib/content/batch02/shared";
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
import { FREE_DAYS_AS_OF, FREE_DAYS_TOWNS, COURSE as FREE_DAYS_COURSE } from "@/lib/content/batch02/school-free-days-towns";
import { municipalityBySlug } from "@/lib/programmatic/holidays/data";
import { townPageCount } from "@/lib/programmatic/holidays/towns";

import { spainChristmasLine } from "@/lib/content/school-spain/body";
import { SPAIN_SCHOOL_YEAR } from "@/lib/content/school-spain/logic";
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

/**
 * The answer boxes under the lead (Christmas, Easter, free-choice days, number
 * of school days), read on the official sources on 24 Nov 2026 (curl + grep of
 * the quoted words; skill verify-official-source):
 *
 * Ordre EDF/66/2026, DOGC 9653, 27.4.2026
 * (https://portaldogc.gencat.cat/utilsEADOP/PDF/9653/2147443.pdf, PDF text):
 *  - art. 3.4 a (2nd cycle of infant and primary; arts. 4.4 ESO and 6.5
 *    batxillerat say the same): «Nadal: del 22 de desembre de 2026 al 7 de gener
 *    de 2027, ambdós inclosos.» / «Setmana Santa: del 20 de març al 29 de març de
 *    2027, ambdós inclosos.»
 *  - art. 3.4 c: «Els centres poden establir quatre dies festius de lliure
 *    disposició, que s'han de distribuir entre els tres trimestres; no poden
 *    coincidir amb els dies d'inici i final de curs ni amb els períodes de
 *    vacances de Nadal ni de Setmana Santa; s'han de preveure en la programació
 *    general del centre, i s'han de comunicar als serveis territorials.»
 *  - art. 3.4 e: «Els consells escolars municipals, un cop determinats els
 *    calendaris de festivitats locals, nacionals i estatals, han de fixar els
 *    dies que convindria que adoptessin tots els centres del mateix municipi.»
 *  - art. 1: «Totes les referències que en aquesta Ordre es fan als serveis
 *    territorials i a les seves direccions, a la ciutat de Barcelona, s'han
 *    d'entendre referides al Consorci d'Educació de Barcelona».
 *  - preamble: the Law sets «entre cent setanta-cinc i cent setanta-vuit dies
 *    lectius per curs». The order states no number of school days or weeks
 *    for a year: the general-calendar days and the weeks are counted here
 *    from its dates and the holiday orders, and the page says so.
 *
 * Generalitat's page "Consulta el calendari escolar de Catalunya"
 * (https://web.gencat.cat/ca/ciutadania/educacio-formacio/calendari-escolar-catalunya,
 * the same page in /es/ and /en/; read 24 Nov 2026, Last-Modified 24 Nov 2026
 * 18:43 GMT): «A més, cada centre pot establir fins a 4 dies de lliure
 * disposició, repartits durant el curs. Pots consultar les dates concretes de
 * cada any al DOGC: Calendari escolar al DOGC · Calendari laboral al DOGC · Al
 * calendari del teu centre educatiu».
 *
 * The free-choice days themselves are never typed here: each school's are its
 * own, and the towns whose councils have published theirs are on the free-days
 * page.
 */
export const SCHOOL_ANSWERS_READ = "2026-11-24";

/**
 * A test fails from this day: the Christmas break is over, so the box must move
 * on to 2027-2028 (publish `school-calendar` again), and the order's Easter and
 * free-choice-day texts and the Generalitat's page are to be read again before
 * the Easter peak.
 */
export const SCHOOL_ANSWERS_REREAD_BY = "2027-01-08";

const GENCAT_SCHOOL_PAGE: Record<Locale, string> = {
  ca: "https://web.gencat.cat/ca/ciutadania/educacio-formacio/calendari-escolar-catalunya",
  es: "https://web.gencat.cat/es/ciutadania/educacio-formacio/calendari-escolar-catalunya",
  en: "https://web.gencat.cat/en/ciutadania/educacio-formacio/calendari-escolar-catalunya",
};

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
      "Per planificar ponts i vacances amb els festius laborals, mira el [calendari laboral 2027](/ca/guies/calendari-laboral-catalunya/) i la pàgina [és festiu avui](/ca/guies/es-festiu-avui-catalunya/). Les dates de les altres comunitats són al [calendari escolar 2026-2027 per comunitats](/ca/guies/calendari-escolar-espanya/).",
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
      "Para planificar puentes y vacaciones con los festivos laborales, mira el [calendario laboral 2027](/es/guias/calendario-laboral-cataluna/) y la página [es festivo hoy](/es/guias/es-festivo-hoy-cataluna/). Las fechas de las demás comunidades están en el [calendario escolar 2026-2027 por comunidades](/es/guias/calendario-escolar-espana/).",
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
      "To plan long weekends around public holidays, see the [public holiday guide](/en/guides/catalonia-public-holidays/) and [is today a holiday](/en/guides/is-today-a-holiday-in-catalonia/). The dates for the rest of Spain are in the [2026-2027 school calendar by region](/en/guides/spain-school-calendar/).",
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
  // The reader's questions in the order they are searched (Search Console, 28
  // days to 24 Nov 2026): Christmas, Easter, "is there school today or
  // tomorrow" (the day-dependent block, computed when the page renders), the
  // free-choice days, how many school days. Each break is the next one that is
  // not over yet.
  const today = todayInCatalonia();
  const christmasYear = SCHOOL_YEARS.find((y) => today <= y.christmas[1]) ?? year;
  const easterYear = SCHOOL_YEARS.find((y) => today <= y.easter[1]) ?? year;
  blocks.push(christmasCallout(christmasYear, locale));
  blocks.push(easterCallout(easterYear, locale));
  blocks.push({ type: "schoolCalendar" });
  blocks.push(freeDaysCallout(year, locale));
  blocks.push(schoolDaysCallout(year, locale));
  // 27 Nov 2026: the Christmas section, shown from 1 November to the day back (date windows).
  blocks.push(...christmasSection(christmasYear, locale));
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
  const last = day(lastClassBefore(from), locale);
  const back = day(firstClassAfter(to), locale);
  const read = dayMonthYear(SCHOOL_ANSWERS_READ, locale);
  return {
    type: "callout",
    tone: "info",
    // es (5 Nov 2026): in the searchers' words, "vacaciones de Navidad 2026
    // colegios Cataluña"; ca and en keep theirs (the ca title is under test).
    title: L(locale, `Vacances de Nadal ${years}`, `Vacaciones de Navidad ${years} en los colegios de Cataluña`, `Christmas school holidays ${years}`),
    // 24 Nov 2026: first day without school and day back, with weekdays, and
    // the order's name and read date (queries "quan comencen les vacances de
    // nadal", "vacances de nadal 2026": 0 clicks at position 4.6-8.8).
    // 13 Nov 2026: the Spain-wide question ("cuándo empiezan las vacaciones de
    // Navidad 2026") lands on community pages; this one hands it to the table.
    text: `${L(
      locale,
      `Les vacances de Nadal comencen el **${day(from, locale)}** (l'últim dia de classe és el ${last}) i duren fins al **${day(to, locale)}**, tots dos inclosos. Es torna a classe el **${back}**. Font: [Ordre EDF/66/2026](${SCHOOL_SOURCE.url}), DOGC del 27 d'abril de 2026; llegida el ${read}.`,
      `Las vacaciones de Navidad empiezan el **${day(from, locale)}** (el último día de clase es el ${last}) y duran hasta el **${day(to, locale)}**, ambos incluidos. Se vuelve a clase el **${back}**. Fuente: [Ordre EDF/66/2026](${SCHOOL_SOURCE.url}), DOGC del 27 de abril de 2026; leída el ${read}.`,
      `The Christmas holidays start on **${day(from, locale)}** (the last day of class is ${last}) and last until **${day(to, locale)}**, both included. Classes restart on **${back}**. Source: [Order EDF/66/2026](${SCHOOL_SOURCE.url}), DOGC of 27 April 2026; read on ${read}.`,
    )}${year.label === SPAIN_SCHOOL_YEAR ? ` ${spainChristmasLine(locale)}` : ""}`,
  };
}

/** The first Monday-to-Friday after `iso` that is not a Catalonia-wide holiday. */
function firstClassAfter(iso: string): string {
  let d = addDays(iso, 1);
  for (let i = 0; i < 14; i++, d = addDays(d, 1)) {
    if (weekdayIndex(d) !== 0 && weekdayIndex(d) !== 6 && !holidayOn(d)) return d;
  }
  return addDays(iso, 1);
}

/** The last Monday-to-Friday before `iso` that is not a Catalonia-wide holiday. */
function lastClassBefore(iso: string): string {
  let d = addDays(iso, -1);
  for (let i = 0; i < 14; i++, d = addDays(d, -1)) {
    if (weekdayIndex(d) !== 0 && weekdayIndex(d) !== 6 && !holidayOn(d)) return d;
  }
  return addDays(iso, -1);
}

/**
 * 27 Nov 2026 (ci-edicio, batch 8P): "vacances de Nadal 2026 escoles", "quan
 * comencen les vacances de Nadal", "último día de clase antes de Navidad",
 * "cuándo se vuelve al cole después de Reyes 2027" rise to a mid-December
 * peak. The box under the lead gives the dates; this section, the first H2 of
 * the page from 1 November until the day back, answers the questions around
 * them. Read on the order's PDF on 27 Nov 2026 (curl + pdftotext + grep):
 *
 * Ordre EDF/66/2026 (https://portaldogc.gencat.cat/utilsEADOP/PDF/9653/2147443.pdf):
 *  - the same line, «Nadal: del 22 de desembre de 2026 al 7 de gener de 2027,
 *    ambdós inclosos.», 12 times: arts. 2.4 a (primer cicle d'educació
 *    infantil: «a les escoles rurals ... i a les llars d'infants de titularitat
 *    de la Generalitat», art. 2.1), 3.4 a (segon cicle d'infantil i primària),
 *    4.4 a (ESO), 5.4 a (instituts escola), 6.5 (batxillerat), 7.5 (FP
 *    bàsica), 8.6 a (cicles de grau mitjà i superior, cursos d'especialització,
 *    IFE, PFI, cursos preparatoris), 9.5 a (arts plàstiques i disseny), 10.5 a
 *    (arts escèniques, música i dansa, ensenyaments artístics superiors), 11.5
 *    (ensenyaments esportius), 12.4 (formació de persones adultes) and 13.4 a
 *    (escoles oficials d'idiomes); 2027-2028 (22 Dec - 9 Jan) and 2028-2029
 *    (22 Dec - 7 Jan) also 12 times each. No other Christmas dates in the text.
 *  - every one of those articles: the four free-choice days «no poden
 *    coincidir ... amb els períodes de vacances de Nadal ni de Setmana Santa».
 *  - 3.7 c: the head of a state school reports to the serveis territorials
 *    «L'organització de la jornada continuada de l'últim dia d'activitat
 *    escolar abans de les vacances de Nadal i les corresponents compensacions
 *    d'hores lectives»; 4.6 c (ESO) adds «quan la reducció prevista superi les
 *    dues hores autoritzades per a aquest període».
 *  - municipal escoles bressol and private nurseries are not in the order's
 *    scope (art. 2.1 names only the Generalitat's): the page says to ask.
 * Generalitat's page (web.gencat.cat/{ca,es,en}/ciutadania/educacio-formacio/
 * calendari-escolar-catalunya, Last-Modified 26 Nov 2026): «Durant el curs hi ha
 * períodes de vacances comuns a tots els centres: Vacances de Nadal».
 * The free-choice days near Christmas come from FREE_DAYS_TOWNS (each
 * council's own source, read by FREE_DAYS_AS_OF); none is typed here.
 */
export const CHRISTMAS_SECTION_READ = "2026-11-27";

/** The two windows of the section: before the break (future tense), and during it until the day back. */
export function christmasWindows(year: SchoolYear): { before: { from: string; until: string }; during: { from: string; until: string } } {
  const [from, to] = year.christmas;
  const midnight = (iso: string) => `${iso}T00:00:00+01:00`;
  return {
    before: { from: midnight(`${from.slice(0, 4)}-11-01`), until: midnight(from) },
    during: { from: midnight(from), until: midnight(firstClassAfter(to)) },
  };
}

const SPAIN_HUB: Record<Locale, string> = {
  ca: "/ca/guies/calendari-escolar-espanya/",
  es: "/es/guias/calendario-escolar-espana/",
  en: "/en/guides/spain-school-calendar/",
};

/** Towns whose published free-choice days touch the break: the last day of class or the day back. */
function freeDaysNextToChristmas(year: SchoolYear): { names: string[]; days: string[] } | null {
  if (year.label !== FREE_DAYS_COURSE.label) return null;
  const edges = new Set([lastClassBefore(year.christmas[0]), firstClassAfter(year.christmas[1])]);
  const towns = FREE_DAYS_TOWNS.filter((t) => t.days.some((d) => edges.has(d)));
  return { names: towns.map((t) => t.name), days: [...edges] };
}

function christmasSectionBlocks(year: SchoolYear, locale: Locale, phase: "before" | "during"): Block[] {
  const [from, to] = year.christmas;
  const years = `${from.slice(0, 4)}-${to.slice(0, 4)}`;
  const last = day(lastClassBefore(from), locale);
  const first = day(from, locale);
  const end = day(to, locale);
  const backIso = firstClassAfter(to);
  const back = day(backIso, locale);
  const reis = `${to.slice(0, 4)}-01-06`;
  const afterReis = reis >= from && reis <= to;
  const and = L(locale, " i ", " y ", " and ");
  const join = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")}${and}${xs.at(-1)}`);

  const opening =
    phase === "before"
      ? L(
          locale,
          `**L'últim dia de classe abans de Nadal és el ${last}**, i les vacances comencen el ${first}. Duren fins al ${end}, tots dos inclosos, i **es torna a l'escola el ${back}**${afterReis ? ", després de Reis" : ""}.`,
          `**El último día de clase antes de Navidad es el ${last}**, y las vacaciones empiezan el ${first}. Duran hasta el ${end}, ambos incluidos, y **se vuelve al cole el ${back}**${afterReis ? ", después de Reyes" : ""}.`,
          `**The last day of school before Christmas is ${last}**, and the holidays start on ${first}. They last until ${end}, both included, and **children go back to school on ${back}**${afterReis ? ", after Three Kings' Day" : ""}.`,
        )
      : L(
          locale,
          `**Les escoles de Catalunya fan vacances de Nadal del ${first} al ${end}**, tots dos inclosos. L'últim dia de classe va ser el ${last}, i **es torna a l'escola el ${back}**${afterReis ? ", després de Reis" : ""}.`,
          `**Los colegios de Cataluña tienen vacaciones de Navidad del ${first} al ${end}**, ambos incluidos. El último día de clase fue el ${last}, y **se vuelve al cole el ${back}**${afterReis ? ", después de Reyes" : ""}.`,
          `**Schools in Catalonia are on Christmas holidays from ${first} to ${end}**, both included. The last day of school was ${last}, and **children go back to school on ${back}**${afterReis ? ", after Three Kings' Day" : ""}.`,
        );

  const rows: [string, string][] = [
    [last, L(locale, "Últim dia de classe", "Último día de clase", "Last day of school")],
    [first, L(locale, "Primer dia de vacances", "Primer día de vacaciones", "First day of the holidays")],
  ];
  for (let iso = from; iso <= to; iso = addDays(iso, 1)) {
    const holiday = holidayOn(iso);
    if (holiday) rows.push([day(iso, locale), `${L(locale, "Festiu", "Festivo", "Public holiday")}: ${holiday.name[locale]}`]);
  }
  rows.push([end, L(locale, "Últim dia de vacances", "Último día de vacaciones", "Last day of the holidays")]);
  rows.push([back, L(locale, "Tornada a classe", "Vuelta a clase", "Back to school")]);

  const towns = freeDaysNextToChristmas(year);
  const asOf = dayMonthYear(FREE_DAYS_AS_OF, locale);
  const hub = b2href("schoolFreeDays", locale);
  const [edgeA, edgeB] = towns ? towns.days.map((d) => day(d, locale)) : ["", ""];
  const townLine = !towns
    ? ""
    : towns.names.length === 0
      ? L(
          locale,
          ` Dels ${FREE_DAYS_TOWNS.length} municipis que han publicat els dies comuns per a les seves escoles (llegits fins al ${asOf}), cap no en proposa ni el ${edgeA} ni el ${edgeB}: són a [dies de lliure disposició per municipi](${hub}).`,
          ` De los ${FREE_DAYS_TOWNS.length} municipios que han publicado los días comunes para sus colegios (leídos hasta el ${asOf}), ninguno propone ni el ${edgeA} ni el ${edgeB}: están en [días de libre disposición por municipio](${hub}).`,
          ` Of the ${FREE_DAYS_TOWNS.length} towns that have published shared days for their schools (read up to ${asOf}), none proposes ${edgeA} or ${edgeB}: they are on [free-choice days by town](${hub}).`,
        )
      : L(
          locale,
          ` Dels ${FREE_DAYS_TOWNS.length} municipis que han publicat els dies comuns per a les seves escoles (llegits fins al ${asOf}), proposen el ${edgeA} o el ${edgeB} ${join(towns.names)}: són a [dies de lliure disposició per municipi](${hub}).`,
          ` De los ${FREE_DAYS_TOWNS.length} municipios que han publicado los días comunes para sus colegios (leídos hasta el ${asOf}), proponen el ${edgeA} o el ${edgeB} ${join(towns.names)}: están en [días de libre disposición por municipio](${hub}).`,
          ` Of the ${FREE_DAYS_TOWNS.length} towns that have published shared days for their schools (read up to ${asOf}), ${join(towns.names)} propose ${edgeA} or ${edgeB}: see [free-choice days by town](${hub}).`,
        );

  return [
    {
      type: "heading",
      level: 2,
      id: L(locale, "vacances-nadal", "vacaciones-navidad", "christmas-holidays"),
      text: L(
        locale,
        `Vacances de Nadal ${years} a les escoles: últim dia de classe i tornada`,
        `Vacaciones de Navidad ${years} en los colegios de Cataluña: último día de clase y vuelta al cole`,
        `Christmas school holidays ${years} in Catalonia: last day of school and going back`,
      ),
    },
    { type: "paragraph", text: opening },
    {
      type: "table",
      caption: L(locale, `Nadal ${years} a les escoles de Catalunya, dia a dia`, `Navidad ${years} en los colegios de Cataluña, día a día`, `Christmas ${years} in Catalan schools, day by day`),
      headers: L(locale, ["Data", "Què passa"], ["Fecha", "Qué pasa"], ["Date", "What happens"]),
      rows,
      note: L(
        locale,
        "Ordre EDF/66/2026 (DOGC del 27 d'abril de 2026) i calendaris de festes laborals de la Generalitat. No compta els dies de lliure disposició de cada escola.",
        "Orden EDF/66/2026 (DOGC del 27 de abril de 2026) y calendarios de fiestas laborales de la Generalitat. No cuenta los días de libre disposición de cada colegio.",
        "Order EDF/66/2026 (DOGC, 27 April 2026) and the Catalan government's work-holiday calendars. Each school's free-choice days are not counted.",
      ),
      stickyColumn: 0,
    },
    {
      type: "paragraph",
      text: L(
        locale,
        `**Instituts, FP, escoles d'idiomes i llars d'infants.** L'[Ordre EDF/66/2026](${SCHOOL_SOURCE.url}) dona les mateixes vacances de Nadal a tots els ensenyaments que regula: infantil i primària, ESO, instituts escola, batxillerat, FP bàsica, cicles de grau mitjà i superior, arts plàstiques i disseny, música, dansa i arts escèniques, ensenyaments esportius, formació de persones adultes i escoles oficials d'idiomes (EOI). També el primer cicle d'infantil (0 a 3 anys) de les llars d'infants de la Generalitat i de les escoles rurals. Les escoles bressol municipals i les privades no surten a l'ordre: el seu calendari, pregunta'l a l'escola bressol o a l'ajuntament.`,
        `**Institutos, FP, escuelas de idiomas y guarderías.** La [Ordre EDF/66/2026](${SCHOOL_SOURCE.url}) da las mismas vacaciones de Navidad a todas las enseñanzas que regula: infantil y primaria, ESO, institutos escuela, bachillerato, FP básica, ciclos de grado medio y superior, artes plásticas y diseño, música, danza y artes escénicas, enseñanzas deportivas, formación de personas adultas y escuelas oficiales de idiomas (EOI). También el primer ciclo de infantil (0 a 3 años) de las guarderías (llars d'infants) de la Generalitat y de las escuelas rurales. Las escoles bressol municipales y las guarderías privadas no aparecen en la orden: su calendario, pregúntalo en la escuela infantil o en el ayuntamiento.`,
        `**Secondary, vocational training, language schools and nurseries.** [Order EDF/66/2026](${SCHOOL_SOURCE.url}) gives the same Christmas holidays to every kind of school it covers: infant and primary, ESO (secondary), instituts escola, batxillerat, basic, intermediate and higher vocational training (FP), art and design, music, dance and performing arts, sports qualifications, adult education and the official language schools (EOI). It also covers the 0-to-3 stage at the Generalitat's own nurseries (llars d'infants) and rural schools. Municipal nurseries (escoles bressol) and private ones are not in the order: ask the nursery or the town hall for theirs.`,
      ),
    },
    {
      type: "paragraph",
      text: L(
        locale,
        `**Dies de lliure disposició al voltant de Nadal.** Cap escola no en pot posar cap dins les vacances de Nadal; els quatre de cada centre van repartits entre els tres trimestres, i els tria cada escola.${townLine} Per saber si la teva escola en fa algun just abans o just després, mira el calendari del centre.`,
        `**Días de libre disposición alrededor de Navidad.** Ningún colegio puede poner uno dentro de las vacaciones de Navidad; los cuatro de cada centro van repartidos entre los tres trimestres, y los elige cada colegio.${townLine} Para saber si tu colegio hace alguno justo antes o justo después, mira el calendario del centro.`,
        `**Free-choice days around Christmas.** No school can put one inside the Christmas holidays; each school's four are spread across the three terms, and each school picks its own.${townLine} To know whether your school takes one just before or just after, check its calendar.`,
      ),
    },
    {
      type: "paragraph",
      text: L(
        locale,
        `**L'últim dia, horari més curt.** El ${last} l'escola pot fer jornada continuada i compensar-ne les hores un altre dia; a les públiques, la direcció ho comunica als serveis territorials d'Educació (a l'ESO, quan redueix més de les dues hores autoritzades per a aquest dia). Pregunta l'horari d'aquell dia, i el del menjador, a la teva escola.`,
        `**El último día, horario más corto.** El ${last} el colegio puede hacer jornada continua y compensar las horas otro día; en los públicos, la dirección lo comunica a los servicios territoriales de Educación (en la ESO, cuando reduce más de las dos horas autorizadas para ese día). Pregunta el horario de ese día, y el del comedor, en tu colegio.`,
        `**A shorter last day.** On ${last} the school may run a continuous (shorter) day and make the hours up another day; at state schools, the head reports this to the education department's regional office (in ESO, when it cuts more than the two hours allowed for that day). Ask your school for that day's times, and the canteen's.`,
      ),
    },
    {
      type: "paragraph",
      text: L(
        locale,
        `Plans per a aquests dies a [Nadal a Barcelona](${b2href("christmasBarcelona", locale)}). Les vacances de Nadal de les altres comunitats, amb el text oficial de cadascuna, són al [calendari escolar per comunitats](${SPAIN_HUB[locale]}).`,
        `Planes para estos días en [Navidad en Barcelona](${b2href("christmasBarcelona", locale)}). Las vacaciones de Navidad de las demás comunidades, con la orden de cada una, están en el [calendario escolar por comunidades](${SPAIN_HUB[locale]}).`,
        `Things to do over the break: [Christmas in Barcelona](${b2href("christmasBarcelona", locale)}). Christmas school holidays in the rest of Spain, each with its official text: [school calendar by region](${SPAIN_HUB[locale]}).`,
      ),
    },
  ];
}

/** The Christmas section, before and during the break; nothing after the day back (the box under the lead still answers). */
function christmasSection(year: SchoolYear, locale: Locale): Block[] {
  const w = christmasWindows(year);
  return [
    { type: "dateWindow", from: w.before.from, until: w.before.until, on: christmasSectionBlocks(year, locale, "before") } as Block,
    { type: "dateWindow", from: w.during.from, until: w.during.until, on: christmasSectionBlocks(year, locale, "during") } as Block,
  ];
}

/**
 * "Vacances de Setmana Santa 2027": the second question, answered under the
 * Christmas box (search: "setmana santa 2027 calendari escolar", position 7.8).
 * No link to the Easter 2027 page here: the days-off section carries the only
 * one (tests/easter-2027.test.ts counts it).
 */
function easterCallout(year: SchoolYear, locale: Locale): Block {
  const [from, to] = year.easter;
  const y = from.slice(0, 4);
  const last = day(lastClassBefore(from), locale);
  const back = day(firstClassAfter(to), locale);
  const holiday = holidayOn(to);
  const note = holiday ? ` (${holiday.name[locale]})` : "";
  return {
    type: "callout",
    tone: "info",
    title: L(locale, `Vacances de Setmana Santa ${y}`, `Vacaciones de Semana Santa ${y} en los colegios de Cataluña`, `Easter school holidays ${y}`),
    text: L(
      locale,
      `Del **${day(from, locale)}** al **${day(to, locale)}**${note}, tots dos inclosos. L'últim dia de classe és el ${last} i es torna a classe el **${back}**.`,
      `Del **${day(from, locale)}** al **${day(to, locale)}**${note}, ambos incluidos. El último día de clase es el ${last} y se vuelve a clase el **${back}**.`,
      `From **${day(from, locale)}** to **${day(to, locale)}**${note}, both included. The last day of class is ${last} and classes restart on **${back}**.`,
    ),
  };
}

/**
 * "Dies de lliure disposició": what they are, who sets them, how many, and
 * where a family finds its school's days (search: "dies de lliure disposició",
 * "dies de lliure disposició 2026-2027"). Quotes in the comment at the top.
 */
function freeDaysCallout(year: SchoolYear, locale: Locale): Block {
  const hub = b2href("schoolFreeDays", locale);
  const towns = FREE_DAYS_TOWNS.length;
  const gencat = GENCAT_SCHOOL_PAGE[locale];
  return {
    type: "callout",
    tone: "official",
    title: L(locale, "Dies de lliure disposició: què són i on mirar els de la teva escola", "Días de libre disposición: qué son y dónde mirar los de tu colegio", "Free-choice days: what they are and where to find your school's"),
    text: L(
      locale,
      `Són dies sense classe que **cada escola** pot fixar dins del curs: **quatre**, repartits entre els tres trimestres, i mai el primer ni l'últim dia de curs ni durant les vacances de Nadal o Setmana Santa. Les dates concretes **no són les mateixes a tot Catalunya**: les tria cada centre, que les comunica als serveis territorials d'Educació (a Barcelona ciutat, al Consorci d'Educació), i el consell escolar municipal de cada municipi fixa els que convindria que fessin totes les escoles del poble o de la ciutat. Per saber els de la teva escola, mira el calendari del centre o la web de l'ajuntament; la [pàgina del calendari escolar de la Generalitat](${gencat}) hi remet. Els dies que han publicat ${towns} municipis, un per un i amb la font de cada consell, són a [dies de lliure disposició per municipi](${hub}). Font: Ordre EDF/66/2026, article 3.4 (infantil i primària), 4.4 (ESO) i 6.5 (batxillerat).`,
      `Son días sin clase que **cada colegio** puede fijar dentro del curso: **cuatro**, repartidos entre los tres trimestres, y nunca el primer ni el último día de curso ni durante las vacaciones de Navidad o Semana Santa. Las fechas concretas **no son las mismas en toda Cataluña**: las elige cada centro, que las comunica a los servicios territoriales de Educación (en la ciudad de Barcelona, al Consorci d'Educació), y el consejo escolar municipal de cada municipio fija los que convendría que hicieran todos los colegios del pueblo o de la ciudad. Para saber los de tu colegio, mira el calendario del centro o la web del ayuntamiento; la [página del calendario escolar de la Generalitat](${gencat}) remite a ellos. Los días que han publicado ${towns} municipios, uno a uno y con la fuente de cada consejo, están en [días de libre disposición por municipio](${hub}). Fuente: Ordre EDF/66/2026, artículo 3.4 (infantil y primaria), 4.4 (ESO) y 6.5 (bachillerato).`,
      `These are days off that **each school** can set within the year: **four**, spread across the three terms, and never the first or last day of the year or inside the Christmas or Easter holidays. The exact dates are **not the same across Catalonia**: each school chooses its own and reports them to the education department's regional offices (in Barcelona city, the Consorci d'Educació), and each town's municipal school council sets the days it would like every school in the town to share. To find your school's, look at the school's calendar or the town hall's website; the [Generalitat's school calendar page](${gencat}) points to them. The days ${towns} towns have published, one by one with each council's source, are on [free-choice days by town](${hub}). Source: Order EDF/66/2026, articles 3.4 (infant and primary), 4.4 (ESO) and 6.5 (batxillerat).`,
    ),
  };
}

/**
 * "Quants dies lectius i setmanes té el curs?": the order states the law's
 * range only; the rest is counted from its dates (the same count as the FAQ).
 */
function schoolDaysCallout(year: SchoolYear, locale: Locale): Block {
  const schoolDays = generalSchoolDays(year);
  const weeks = Math.round((daysBetween(year.start, year.end) + 1) / 7);
  const first = day(year.start, locale);
  const lastDay = day(year.end, locale);
  const own = schoolDays ? schoolDays - 6 : null;
  return {
    type: "callout",
    tone: "info",
    title: L(locale, `Quants dies i setmanes té el curs ${year.label}?`, `¿Cuántos días y semanas tiene el curso ${year.label}?`, `How many days and weeks is the ${year.label} school year?`),
    text: L(
      locale,
      `L'ordre recorda que la Llei d'educació demana **entre 175 i 178 dies lectius** per curs. El curs va del ${first} al ${lastDay}: **${weeks} setmanes** de calendari.${schoolDays ? ` Comptant des de les dates de l'ordre, el calendari general té **${schoolDays} dies de classe**; una escola que faci en dia lectiu els seus dos festius locals i els quatre dies de lliure disposició en té ${own}.` : ""} L'ordre no fixa el nombre de dies ni de setmanes d'un curs concret: aquests comptes són nostres.`,
      `La orden recuerda que la Ley de educación exige **entre 175 y 178 días lectivos** por curso. El curso va del ${first} al ${lastDay}: **${weeks} semanas** de calendario.${schoolDays ? ` Contando desde las fechas de la orden, el calendario general tiene **${schoolDays} días de clase**; un colegio que haga en día lectivo sus dos festivos locales y los cuatro días de libre disposición tiene ${own}.` : ""} La orden no fija el número de días ni de semanas de un curso concreto: esas cuentas son nuestras.`,
      `The order recalls that the education law requires **between 175 and 178 school days** a year. The year runs from ${first} to ${lastDay}: **${weeks} calendar weeks**.${schoolDays ? ` Counting from the order's dates, the general calendar has **${schoolDays} school days**; a school whose two local holidays and four free-choice days all fall on school days has ${own}.` : ""} The order does not fix the number of days or weeks of a given year: these counts are ours.`,
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
  const easterYear = year.easter[0].slice(0, 4);
  const easterPage = EASTER_PAGE[easterYear]?.[locale];
  const easterLine = easterPage
    ? L(
        locale,
        `Els festius, les festes locals que toquen a les vacances i els ponts de Setmana Santa són a [Setmana Santa ${easterYear} a Catalunya](${easterPage}).`,
        `Los festivos, las fiestas locales que tocan a las vacaciones y los puentes de Semana Santa están en [Semana Santa ${easterYear} en Cataluña](${easterPage}).`,
        `Public holidays, the local holidays next to the break and the Easter long weekends are in [Easter ${easterYear} in Catalonia](${easterPage}).`,
      )
    : null;
  // The parade is on the evening of 5 January; only when that falls inside the break.
  const reisYear = year.christmas[1].slice(0, 4);
  const reisEve = `${reisYear}-01-05`;
  const reisPage = reisEve >= year.christmas[0] && reisEve <= year.christmas[1] ? REIS_PAGE[reisYear]?.[locale] : undefined;
  const reisLine = reisPage
    ? L(
        locale,
        `La Cavalcada de Reis, el vespre del ${day(reisEve, locale)}, cau dins de les vacances de Nadal: l'horari i el recorregut de la de Barcelona i de les d'altres ciutats són a [la Cavalcada de Reis ${reisYear}](${reisPage}).`,
        `La Cabalgata de Reyes, la tarde del ${day(reisEve, locale)}, cae dentro de las vacaciones de Navidad: el horario y el recorrido de la de Barcelona y de las de otras ciudades están en [la Cabalgata de Reyes ${reisYear}](${reisPage}).`,
        `The Three Kings parade, on the evening of ${day(reisEve, locale)}, falls inside the Christmas holidays: times and routes in Barcelona and other towns are in [the ${reisYear} Three Kings parade](${reisPage}).`,
      )
    : null;

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
  if (reisLine) p.push(reisLine);
  // 27 Nov 2026 (batch 8M): the Christmas hub's season calendar, only for the course whose holidays it covers.
  if (CALENDAR_HUB_COURSES.has(year.label)) p.push(calendarLine(locale));
  if (easterLine) p.push(easterLine);

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

/** The Easter guide for a given year, where there is one (the year of the school break's start). */
const EASTER_PAGE: Record<string, Record<Locale, string>> = {
  "2027": {
    ca: "/ca/guies/setmana-santa-2027-catalunya/",
    es: "/es/guias/semana-santa-2027-cataluna/",
    en: "/en/guides/easter-2027-catalonia/",
  },
};

/**
 * The Three Kings parade guide for a given January, where there is one (the
 * year the Christmas break ends). Its URLs carry no year, but its content is
 * about one parade, so it is keyed like the Easter guide.
 */
const REIS_PAGE: Record<string, Record<Locale, string>> = {
  "2027": {
    ca: "/ca/guies/cavalcada-de-reis-barcelona/",
    es: "/es/guias/cabalgata-de-reyes-barcelona/",
    en: "/en/guides/three-kings-parade-barcelona/",
  },
};

/**
 * Courses whose Christmas holidays the Christmas hub's calendar
 * (batch02/christmas-calendar.ts, 1 Dec 2026 - 7 Jan 2027) covers. Add the
 * next course when the calendar is rolled to it.
 */
const CALENDAR_HUB_COURSES: ReadonlySet<string> = new Set(["2026-2027"]);

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

/**
 * 20 Nov 2026: the December bridge cluster. For Monday 7 December 2026 only
 * (the bridge page is about that December), the school answer hands on to the
 * Catalan bridge page, day by day.
 */
function bridgeGuide(dayIso: string, locale: Locale): string {
  if (dayIso !== "2026-12-07") return "";
  return L(
    locale,
    ` El pont, dia a dia: [pont de desembre 2026 a Catalunya](${b2href("decemberBridge", "ca")}).`,
    ` El puente, día a día: [puente de diciembre 2026 en Cataluña](${b2href("decemberBridge", "es")}).`,
    ` The long weekend, day by day: [the December 2026 long weekend in Catalonia](${b2href("decemberBridge", "en")}).`,
  );
}

/** The questions the school calendar is searched with, in the searchers' words. */
function faq(year: SchoolYear, locale: Locale): Block {
  const next = SCHOOL_YEARS[SCHOOL_YEARS.indexOf(year) + 1] ?? null;
  // The Christmas questions are about the next Christmas not yet over (the same pick as the box under the lead).
  const xmasYear = SCHOOL_YEARS.find((y) => todayInCatalonia() <= y.christmas[1]) ?? year;
  const [c0, c1] = xmasYear.christmas;
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
  const lastBeforeXmas = lastDayBeforeChristmas(xmasYear);
  // 27 Nov 2026: the Christmas questions in the searchers' words (last day, back after Reis, other stages, free days).
  const xmasBack = firstClassAfter(c1);
  const by = xmasBack.slice(0, 4);

  const items: Record<Locale, { question: string; answer: string }[]> = {
    ca: [
      { question: `Quan comencen les vacances de Nadal ${cy} a les escoles?`, answer: `El ${d(c0)}. Duren fins al ${d(c1)}, inclòs, i es torna a classe el ${d(addDays(c1, 1))}.` },
      { question: "Quin és l'últim dia de classe abans de Nadal?", answer: `El ${d(lastBeforeXmas)}, segons el calendari general de Catalunya. Les vacances comencen l'endemà, el ${d(c0)}. Un dia de lliure disposició o una festa local de la teva escola el poden avançar.` },
      { question: `Quan es torna a l'escola després de Reis ${by}?`, answer: `El ${d(xmasBack)}. Les vacances de Nadal acaben el ${d(c1)}, inclòs.` },
      { question: "L'FP, el batxillerat i les escoles d'idiomes tenen les mateixes vacances de Nadal?", answer: `Sí: l'Ordre EDF/66/2026 dona les mateixes dates, del ${d(c0)} al ${d(c1)}, a l'ESO, el batxillerat, l'FP, les escoles oficials d'idiomes, la formació d'adults i els ensenyaments artístics i esportius, i al primer cicle d'infantil de les llars d'infants de la Generalitat. Les escoles bressol municipals i privades no surten a l'ordre: pregunta-ho a la teva.` },
      { question: "Una escola pot posar un dia de lliure disposició per Nadal?", answer: "Dins les vacances de Nadal, no: l'ordre ho prohibeix. Fora d'aquests dies, cada escola tria els seus quatre dies, repartits entre els tres trimestres: mira el calendari del teu centre." },
      ...(bridge ? [{ question: `Hi ha escola el ${weekdayDay(bridge.day, locale)}?`, answer: `Al calendari general, sí: és dia lectiu, i només el ${weekdayDay(bridge.holiday, locale)} és festiu a tot Catalunya. Però cada escola el pot fer festiu amb un dels seus quatre dies de lliure disposició${cemb.some((c) => c.date === bridge.day) ? ", i a Barcelona el Consell d'Educació Municipal el proposa a tots els centres" : ""}. Pregunta-ho a la teva escola.${bridgeGuide(bridge.day, locale)}` }] : []),
      { question: `Quins són els dies de lliure disposició del curs ${year.label}?`, answer: `Els tria cada escola: quatre per curs, repartits entre els tres trimestres i mai el primer o l'últim dia ni durant les vacances. El consell escolar municipal en proposa uns de comuns${cemb.length ? `; a Barcelona, el CEMB proposa ${cembList}` : ""}.` },
      { question: "On puc consultar els dies de lliure disposició de la meva escola?", answer: `Al calendari del teu centre o a la web de l'ajuntament: no són els mateixos a tot Catalunya, perquè els tria cada escola. La [pàgina del calendari escolar de la Generalitat](${GENCAT_SCHOOL_PAGE.ca}) remet al calendari de cada centre, i els dies dels ${FREE_DAYS_TOWNS.length} municipis que els han publicat són a [dies de lliure disposició per municipi](${b2href("schoolFreeDays", "ca")}).` },
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
      { question: "¿Cuál es el último día de clase antes de Navidad en Cataluña?", answer: `El ${d(lastBeforeXmas)}, según el calendario general de Cataluña. Las vacaciones empiezan al día siguiente, el ${d(c0)}. Un día de libre disposición o una fiesta local de tu colegio pueden adelantarlo.` },
      { question: `¿Cuándo se vuelve al cole después de Reyes ${by} en Cataluña?`, answer: `El ${d(xmasBack)}. Las vacaciones de Navidad terminan el ${d(c1)}, incluido.` },
      { question: "¿La FP, el bachillerato y las escuelas de idiomas tienen las mismas vacaciones de Navidad?", answer: `Sí: la Orden EDF/66/2026 da las mismas fechas, del ${d(c0)} al ${d(c1)}, a la ESO, el bachillerato, la FP, las escuelas oficiales de idiomas, la formación de adultos y las enseñanzas artísticas y deportivas, y al primer ciclo de infantil de las guarderías de la Generalitat. Las escoles bressol municipales y las guarderías privadas no aparecen en la orden: pregunta en la tuya.` },
      { question: "¿Puede un colegio poner un día de libre disposición en Navidad?", answer: "Dentro de las vacaciones de Navidad, no: la orden lo prohíbe. Fuera de esos días, cada colegio elige sus cuatro días, repartidos entre los tres trimestres: mira el calendario de tu centro." },
      ...(bridge ? [{ question: `¿Hay cole el ${weekdayDay(bridge.day, locale)}?`, answer: `En el calendario general, sí: es día lectivo, y solo el ${weekdayDay(bridge.holiday, locale)} es festivo en toda Cataluña. Pero cada colegio puede hacerlo festivo con uno de sus cuatro días de libre disposición${cemb.some((c) => c.date === bridge.day) ? ", y en Barcelona el Consell d'Educació Municipal lo propone a todos los centros" : ""}. Pregúntalo en tu colegio.${bridgeGuide(bridge.day, locale)}` }] : []),
      { question: `¿Cuáles son los días de libre disposición del curso ${year.label}?`, answer: `Los elige cada colegio: cuatro por curso, repartidos entre los tres trimestres y nunca el primer o el último día ni durante las vacaciones. El consejo escolar municipal propone unos comunes${cemb.length ? `; en Barcelona, el CEMB propone ${cembList}` : ""}.` },
      { question: "¿Dónde puedo consultar los días de libre disposición de mi colegio?", answer: `En el calendario de tu centro o en la web del ayuntamiento: no son los mismos en toda Cataluña, porque los elige cada colegio. La [página del calendario escolar de la Generalitat](${GENCAT_SCHOOL_PAGE.es}) remite al calendario de cada centro, y los días de los ${FREE_DAYS_TOWNS.length} municipios que los han publicado están en [días de libre disposición por municipio](${b2href("schoolFreeDays", "es")}).` },
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
      { question: "What is the last day of school before Christmas in Catalonia?", answer: `${d(lastBeforeXmas)} in the general Catalan calendar. The holidays start the next day, ${d(c0)}. A free-choice day or local holiday at your school can bring it forward.` },
      { question: `When do schools go back after Three Kings' Day ${by}?`, answer: `On ${d(xmasBack)}. The Christmas holidays end on ${d(c1)}, included.` },
      { question: "Do vocational training, batxillerat and language schools have the same Christmas holidays?", answer: `Yes: Order EDF/66/2026 gives the same dates, ${d(c0)} to ${d(c1)}, to ESO, batxillerat, vocational training, the official language schools, adult education and the arts and sports schools, and to the 0-to-3 stage at the Generalitat's nurseries. Municipal and private nurseries (escoles bressol) are not in the order: ask yours.` },
      { question: "Can a school put a free-choice day in the Christmas holidays?", answer: "Not inside the Christmas holidays: the order rules it out. Outside them, each school picks its four days, spread across the three terms: check your school's calendar." },
      ...(bridge ? [{ question: `Is there school on ${weekdayDay(bridge.day, locale)}?`, answer: `In the general calendar, yes: it is a school day, and only ${weekdayDay(bridge.holiday, locale)} is a holiday across Catalonia. But each school can take it as one of its four free-choice days${cemb.some((c) => c.date === bridge.day) ? ", and Barcelona's municipal education council recommends it to every school" : ""}. Ask your school.${bridgeGuide(bridge.day, locale)}` }] : []),
      { question: `What are the free-choice days in ${year.label}?`, answer: `Each school chooses its own: four a year, spread across the three terms, never the first or last day or inside the holidays. The municipal school council suggests shared ones${cemb.length ? `; in Barcelona the CEMB recommends ${cembList}` : ""}.` },
      { question: "Where can I find my school's free-choice days?", answer: `On your school's calendar or the town hall's website: they are not the same across Catalonia, because each school chooses its own. The [Generalitat's school calendar page](${GENCAT_SCHOOL_PAGE.en}) points to each school's calendar, and the days of the ${FREE_DAYS_TOWNS.length} towns that have published them are on [free-choice days by town](${b2href("schoolFreeDays", "en")}).` },
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
