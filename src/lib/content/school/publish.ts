import "server-only";

import type { Block } from "@/lib/content/blocks";
import { IMAGES } from "@/lib/content/images";
import { publishArticle, upsertImages, type ArticleSpec, type ImageSpec, type PublishResult } from "@/lib/content/publish-article";
import { LOCALES, type Locale } from "@/lib/i18n/config";

import {
  addDays,
  aranSubstitutionFor,
  holidayOn,
  isCovered,
  longDate,
  todayInCatalonia,
  weekdayIndex,
} from "@/lib/content/holidays/calendar";

import { SCHOOL_SOURCE, SCHOOL_VERIFIED_AT, SCHOOL_YEARS, type SchoolYear } from "./calendar";

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
    title: "Calendari escolar de Catalunya: inici de curs, Nadal i Setmana Santa",
    seoTitle: "Calendari escolar Catalunya 2026-2027: dates clau",
    seoDescription:
      "Quan comença i acaba el curs escolar a Catalunya, les vacances de Nadal i Setmana Santa dels cursos 2026-2027, 2027-2028 i 2028-2029, segons el DOGC.",
    excerpt:
      "Les dates oficials dels cursos 2026-2027, 2027-2028 i 2028-2029: inici, final, Nadal i Setmana Santa, i si avui hi ha escola.",
    lead: "Una sola ordre del Departament d'Educació fixa el calendari escolar de **tres cursos seguits**. Aquí hi ha totes les dates, i què diu el calendari d'**avui**.",
    howTitle: "Com es fixa el calendari",
    how: [
      "L'Ordre EDF/66/2026, publicada al DOGC el 27 d'abril de 2026, estableix el calendari dels cursos 2026-2027, 2027-2028 i 2028-2029 per a totes les escoles i instituts de Catalunya, públics i privats. La Llei d'educació demana entre 175 i 178 dies lectius per curs.",
      "El curs comença el sisè dia laborable de setembre, que en els tres cursos és el **8 de setembre**, o el dia laborable següent si el 8 és festiu. L'FP, en canvi, comença com a més tard el 14, el 13 o el 12 de setembre, segons el curs.",
    ],
    freeTitle: "Els dies que no surten a la taula",
    free: [
      "Cada escola pot fixar **quatre dies de lliure disposició** per curs, repartits entre els tres trimestres. No poden coincidir amb el primer ni l'últim dia de curs, ni amb les vacances de Nadal o Setmana Santa. Els decideix cada centre, i el consell escolar municipal proposa quins convindria que fessin totes les escoles del mateix municipi: per saber-los, cal preguntar a l'escola o a l'ajuntament.",
      "També són festius els dos dies de **festa local** del municipi. Si un festiu local cau en un dia no lectiu, l'escola el pot afegir als seus dies de lliure disposició. Els festius locals de cada municipi són a la pàgina de [festius locals](/ca/guies/festius-locals-catalunya/).",
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
      "Per planificar ponts i vacances amb els festius laborals, mira el [calendari laboral](/ca/guies/calendari-laboral-catalunya/) i la pàgina [és festiu avui](/ca/guies/es-festiu-avui-catalunya/).",
    heroAlt: "Façana de l'Escola Jaume Balmes de Vic amb el pati enrajolat al davant",
    heroCaption: "L'Escola Jaume Balmes, a Vic.",
    secondAlt: "Edifici del Grup Escolar Ramon Llull de Barcelona entre palmeres i arbres",
    secondCaption: "El Grup Escolar Ramon Llull, a Barcelona.",
  },
  es: {
    path: "guias/calendario-escolar-cataluna",
    title: "Calendario escolar de Cataluña: inicio de curso, Navidad y Semana Santa",
    seoTitle: "Calendario escolar Cataluña 2026-2027: fechas clave",
    seoDescription:
      "Cuándo empieza y acaba el curso escolar en Cataluña, las vacaciones de Navidad y Semana Santa de los cursos 2026-2027, 2027-2028 y 2028-2029, según el DOGC.",
    excerpt:
      "Las fechas oficiales de los cursos 2026-2027, 2027-2028 y 2028-2029: inicio, final, Navidad y Semana Santa, y si hoy hay colegio.",
    lead: "Una sola orden del Departamento de Educación fija el calendario escolar de **tres cursos seguidos**. Aquí están todas las fechas, y qué dice el calendario de **hoy**.",
    howTitle: "Cómo se fija el calendario",
    how: [
      "La Ordre EDF/66/2026, publicada en el DOGC el 27 de abril de 2026, establece el calendario de los cursos 2026-2027, 2027-2028 y 2028-2029 para todos los colegios e institutos de Cataluña, públicos y privados. La Ley de educación exige entre 175 y 178 días lectivos por curso.",
      "El curso empieza el sexto día laborable de septiembre, que en los tres cursos es el **8 de septiembre**, o el siguiente día laborable si el 8 es festivo. La FP, en cambio, empieza como muy tarde el 14, el 13 o el 12 de septiembre, según el curso.",
    ],
    freeTitle: "Los días que no aparecen en la tabla",
    free: [
      "Cada colegio puede fijar **cuatro días de libre disposición** por curso, repartidos entre los tres trimestres. No pueden coincidir con el primer ni el último día de curso, ni con las vacaciones de Navidad o Semana Santa. Los decide cada centro, y el consejo escolar municipal propone cuáles convendría que hicieran todos los colegios del mismo municipio: para saberlos, hay que preguntar al colegio o al ayuntamiento.",
      "También son festivos los dos días de **fiesta local** del municipio. Si un festivo local cae en un día no lectivo, el colegio puede añadirlo a sus días de libre disposición. Los festivos locales de cada municipio están en la página de [festivos locales](/es/guias/festivos-locales-cataluna/).",
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
      "Para planificar puentes y vacaciones con los festivos laborales, mira el [calendario laboral](/es/guias/calendario-laboral-cataluna/) y la página [es festivo hoy](/es/guias/es-festivo-hoy-cataluna/).",
    heroAlt: "Fachada de la Escola Jaume Balmes de Vic con el patio embaldosado delante",
    heroCaption: "La Escola Jaume Balmes, en Vic.",
    secondAlt: "Edificio del Grup Escolar Ramon Llull de Barcelona entre palmeras y árboles",
    secondCaption: "El Grup Escolar Ramon Llull, en Barcelona.",
  },
  en: {
    path: "guides/catalonia-school-calendar",
    title: "Catalonia school calendar: term dates, Christmas and Easter",
    seoTitle: "Catalonia school calendar 2026-2027: term dates",
    seoDescription:
      "When the school year starts and ends in Catalonia, and the Christmas and Easter holidays for 2026-2027, 2027-2028 and 2028-2029, from the official gazette.",
    excerpt:
      "Official term dates for 2026-2027, 2027-2028 and 2028-2029: start, end, Christmas and Easter, and whether schools are open today.",
    lead: "A single order from the Catalan education department sets the school calendar for **three years in a row**. Here are all the dates, and what the calendar says about **today**.",
    howTitle: "How the calendar is set",
    how: [
      "Order EDF/66/2026, published in the Catalan official gazette (DOGC) on 27 April 2026, sets the calendar for 2026-2027, 2027-2028 and 2028-2029 for every school in Catalonia, state and private. Catalan education law requires between 175 and 178 teaching days a year.",
      "The year starts on the sixth working day of September, which in all three years is **8 September**, or the next working day if the 8th is a holiday. Vocational training (FP) starts by 14, 13 or 12 September at the latest, depending on the year.",
    ],
    freeTitle: "The days the table cannot show",
    free: [
      "Each school can set **four free-choice days** a year, spread across the three terms. They cannot fall on the first or last day of the year, or in the Christmas or Easter holidays. Each school decides its own, and the municipal school council suggests days for all schools in the same town to share: ask the school or the town hall.",
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
  blocks.push(...daysOff(year, locale));

  const section = (heading: string, paragraphs: string[]) => {
    blocks.push({ type: "heading", level: 2, text: heading });
    for (const text of paragraphs) blocks.push({ type: "paragraph", text });
  };
  section(copy.howTitle, copy.how);
  section(copy.freeTitle, copy.free);
  if (secondMediaId) blocks.push({ type: "image", mediaId: secondMediaId, size: "wide" });
  section(copy.juneTitle, copy.june);
  section(copy.otherTitle, copy.other);
  section(copy.previousTitle, copy.previous);
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
 * Barcelona's municipal school council (CEMB) proposal, approved at its plenary
 * of 10 June 2026. A recommendation, not a rule, and for one school year only.
 */
const BARCELONA_DAYS: Record<string, string[]> = {
  "2026-2027": ["2026-10-30", "2026-12-07", "2027-02-08", "2027-05-14"],
};

const DAYS_OFF_TITLE: Record<Locale, string> = {
  ca: "Dies sense classe del curs {y}",
  es: "Días sin clase del curso {y}",
  en: "Days without school in {y}",
};

function daysOff(year: SchoolYear, locale: Locale): Block[] {
  const and = locale === "ca" ? " i " : locale === "es" ? " y " : " and ";
  const list = (items: string[]) =>
    items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")}${and}${items[items.length - 1]}`;

  const named = list(holidaysOnSchoolDays(year).map((h) => `**${longDate(h.date, locale)}** (${h.name[locale]})`));
  const afterChristmas = longDate(addDays(year.christmas[1], 1), locale);
  const afterEaster = longDate(addDays(year.easter[1], 1), locale);
  const complete = isCovered(year.end);
  const aran = aranSwapInTerm(year);

  const p: string[] = [];
  if (locale === "ca") {
    p.push(`A més de les vacances, no hi ha classe els festius de tot Catalunya que cauen en dia feiner dins del curs: ${named}.${complete ? "" : " El calendari de festius de l'any vinent encara no s'ha publicat; quan surti, s'hi sumaran els seus dies."}`);
    p.push(`Després de Nadal es torna a classe el ${afterChristmas}, i després de Setmana Santa, el ${afterEaster}.`);
    if (aran) p.push(`A l'Aran, la festa del ${longDate(aran.replaces, locale)} queda substituïda per la ${aran.name.ca}, el **${longDate(aran.date, locale)}**, que és dia lectiu a la resta de Catalunya.`);
    p.push("Cal sumar-hi els dos festius locals de cada municipi i els dies de lliure disposició que tria cada centre.");
  } else if (locale === "es") {
    p.push(`Además de las vacaciones, no hay clase los festivos de toda Cataluña que caen en día laborable dentro del curso: ${named}.${complete ? "" : " El calendario de festivos del año que viene aún no se ha publicado; cuando salga, se sumarán sus días."}`);
    p.push(`Después de Navidad se vuelve a clase el ${afterChristmas}, y después de Semana Santa, el ${afterEaster}.`);
    if (aran) p.push(`En Arán, la fiesta del ${longDate(aran.replaces, locale)} se sustituye por la ${aran.name.es}, el **${longDate(aran.date, locale)}**, que es día lectivo en el resto de Cataluña.`);
    p.push("Hay que sumar los dos festivos locales de cada municipio y los días de libre disposición que elige cada centro.");
  } else {
    p.push(`Besides the holidays, there is no school on Catalonia-wide public holidays that fall on a weekday during term: ${named}.${complete ? "" : " Next year's holiday calendar has not been published yet; its days will add to these when it is."}`);
    p.push(`After Christmas, classes restart on ${afterChristmas}; after Easter, on ${afterEaster}.`);
    if (aran) p.push(`In Aran, the ${longDate(aran.replaces, locale)} holiday is replaced by the ${aran.name.en} on **${longDate(aran.date, locale)}**, a school day everywhere else in Catalonia.`);
    p.push("Add each town's two local holidays and the free-choice days each school sets.");
  }

  const bcn = BARCELONA_DAYS[year.label];
  if (bcn) {
    const days = list(bcn.map((iso) => `**${longDate(iso, locale)}**`));
    p.push(
      locale === "ca"
        ? `A **Barcelona**, el Consell Escolar Municipal proposa a tots els centres fer festa el ${days}. És una proposta de ciutat: cada centre decideix els seus dies.`
        : locale === "es"
          ? `En **Barcelona**, el Consell Escolar Municipal propone a todos los centros hacer fiesta el ${days}. Es una propuesta de ciudad: cada centro decide sus días.`
          : `In **Barcelona**, the municipal school council recommends that every school take ${days} off. It is a city-wide recommendation: each school sets its own days.`,
    );
  }

  return [
    { type: "heading", level: 2, text: DAYS_OFF_TITLE[locale].replace("{y}", year.label) },
    ...p.map((text) => ({ type: "paragraph", text }) as Block),
  ];
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
