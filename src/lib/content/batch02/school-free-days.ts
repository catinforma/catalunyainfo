import type { Block } from "@/lib/content/blocks";
import { shortDate } from "@/lib/content/holidays/calendar";
import { SCHOOL_SOURCE } from "@/lib/content/school/calendar";
import type { Locale } from "@/lib/i18n/config";
import { municipalityBySlug } from "@/lib/programmatic/holidays/data";
import { hubPath, municipalityPath } from "@/lib/programmatic/holidays/paths";

import { SIBLING_PATHS } from "./december-bridge";
import {
  COURSE,
  FREE_DAYS_AS_OF,
  FREE_DAYS_PENDING,
  FREE_DAYS_TOWNS,
  MONDAY_7,
  freeDay,
  joinNames,
  localDaysInCourse,
  monday7,
  nameIn,
  readDate,
  type FreeDaysPending,
  type FreeDaysTown,
} from "./school-free-days-towns";
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
  table,
  verifiedLine,
  type B2Article,
  type B2Key,
  type B2Source,
} from "./shared";

/**
 * "Dies de lliure disposició 2026-2027": is there school on Monday 7
 * December 2026, town by town, and the four free days of the course that each
 * municipal school council proposed.
 *
 * Why (5 Nov 2026): strike traffic (60% of impressions) ends after 12 Nov, and
 * the December bridge guide (/es/guias/puente-diciembre-cataluna/) took 5,600
 * impressions in 14 days, rising, on "puente de diciembre 2026" and "el 7 de
 * diciembre es festivo" queries. 8 December 2026 is a Tuesday, so most
 * councils put a free day on Monday the 7th; that page could only say "it
 * depends on the school, Barcelona proposes it". The town holiday pages
 * (/es/festivos/<town>/, 31k impressions a week at 1.8% CTR) get a short
 * section from the same data (SchoolFreeDays.tsx) for the queries "días de
 * libre disposición 2026-2027 <town>" and "hay cole el 7 de diciembre <town>".
 *
 * Data: school-free-days-towns.ts (one row per town, its official source and
 * read date; towns without a published set in FREE_DAYS_PENDING with the
 * council page to watch). The rules come from Ordre EDF/66/2026, section 2.4
 * b-e, re-read on 5 Nov 2026 (the PDF in SCHOOL_SOURCE); the CEMB quote on
 * school autonomy from Barcelona's proposal (its row).
 *
 * The answer is computed per town: "free" when the set includes 7 December,
 * "local" when 7 December is the town's local holiday (Ordre EMT/208/2025, via
 * the holidays snapshot), "school" when the set leaves it out. Nothing is said
 * for a town without a set but "not published".
 *
 * No new photograph: the hero is the school calendar guide's second picture,
 * with its exact alt text and caption (media rows are keyed by file;
 * src/lib/content/school/publish.ts).
 */

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 155;
/** The first option that fits, or the last one. */
const fit = (options: string[], limit: number): string => options.find((o) => o.length <= limit) ?? options[options.length - 1]!;

/** Ordre EMT/208/2025: the 2026 local holidays (Monday 7 December is one in 43 municipalities). */
const LOCAL_ORDER = {
  name: "Ordre EMT/208/2025, d'11 de desembre, calendari de festes locals a Catalunya per a l'any 2026",
  url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1032232&type=01&language=ca_ES",
};
/** Ordre EMT/66/2025: the 2026 holidays of Catalonia (8 December, a Tuesday). */
const REGIONAL_ORDER = {
  name: "Ordre EMT/66/2025, de 30 d'abril, calendari oficial de festes laborals a Catalunya per a l'any 2026",
  url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1013204&type=01&language=ca_ES",
};

export const SCHOOL_FREE_DAYS_META: Record<Locale, { path: string; title: string; excerpt: string }> = {
  ca: {
    path: "guies/dies-lliure-disposicio-escoles",
    title: "Dies de lliure disposició 2026-2027: hi ha escola el dilluns 7 de desembre? Municipi per municipi",
    excerpt: "Si hi ha classe el dilluns 7 de desembre de 2026 i els quatre dies de lliure disposició del curs 2026-2027 de cada municipi, de la web de l'ajuntament o del seu consell escolar municipal.",
  },
  es: {
    path: "guias/dias-libre-disposicion-colegios",
    title: "Días de libre disposición 2026-2027: ¿hay colegio el lunes 7 de diciembre? Municipio por municipio",
    excerpt: "Si hay clase el lunes 7 de diciembre de 2026 y los cuatro días de libre disposición del curso 2026-2027 de cada municipio, de la web del ayuntamiento o de su consejo escolar municipal.",
  },
  en: {
    path: "guides/catalonia-school-free-days",
    title: "School free days 2026-2027 in Catalonia: is there school on Monday 7 December? Town by town",
    excerpt: "Whether there is school on Monday 7 December 2026, and each town's four free days of the 2026-2027 school year, from the town council or its municipal school council.",
  },
};

/* -------------------------------------------------------------------------- */
/* Counting                                                                   */
/* -------------------------------------------------------------------------- */

/** Biggest first: the names a reader is most likely to look for. */
const byPopulation = (towns: readonly FreeDaysTown[]) =>
  [...towns].sort((a, b) => (municipalityBySlug(a.slug)?.rank ?? 9999) - (municipalityBySlug(b.slug)?.rank ?? 9999));

/** "l'Hospitalet de Llobregat" files under H, "el Prat" under P. */
const sortKey = (name: string) => name.replace(/^(el |la |les |els |l')/i, "");
const alphabetical = <T extends { name: string }>(towns: readonly T[]) => [...towns].sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name), "ca"));

export function monday7Groups(towns: readonly FreeDaysTown[] = FREE_DAYS_TOWNS) {
  const sorted = byPopulation(towns);
  return {
    free: sorted.filter((t) => monday7(t) === "free"),
    local: sorted.filter((t) => monday7(t) === "local"),
    school: sorted.filter((t) => monday7(t) === "school"),
  };
}

/** "4 de 6", "4 of 6". */
const of = (a: number, b: number, locale: Locale) => `${a} ${locale === "en" ? "of" : "de"} ${b}`;

/** The first `k` names, then "i N més" / "y N más" / "and N more". */
function someNames(towns: readonly FreeDaysTown[], k: number, locale: Locale): string {
  const names = towns.slice(0, k).map((t) => nameIn(t.name, locale));
  const rest = towns.length - names.length;
  if (rest <= 0) return joinNames(names, locale);
  return `${names.join(", ")}${{ ca: ` i ${rest} més`, es: ` y ${rest} más`, en: ` and ${rest} more` }[locale]}`;
}

/** "30 d'octubre i 7 de desembre de 2026; 8 de febrer i 14 de maig de 2027". */
export function shortDays(days: readonly string[], locale: Locale): string {
  const years = [...new Set(days.map((d) => d.slice(0, 4)))];
  return years
    .map((year) => `${joinNames(days.filter((d) => d.startsWith(year)).map((d) => shortDate(d, locale)), locale)}${locale === "en" ? " " : " de "}${year}`)
    .join("; ");
}

/* -------------------------------------------------------------------------- */
/* Title and description                                                      */
/* -------------------------------------------------------------------------- */

export function freeDaysTitle(locale: Locale): string {
  const options: Record<Locale, string[]> = {
    ca: ["Hi ha escola el 7 de desembre? Lliure disposició 2026-27", "Hi ha escola el 7 de desembre? Lliure disposició"],
    es: ["¿Hay cole el 7 de diciembre? Libre disposición 2026-27", "¿Hay cole el 7 de diciembre? Libre disposición"],
    en: ["Is there school on 7 December? Catalonia free days 2026-27", "School on 7 December? Catalonia free days 2026-27"],
  };
  return fit(options[locale], TITLE_LIMIT);
}

/** The answer first: how many towns have no school on the 7th, the biggest by name. */
export function freeDaysDescription(locale: Locale, towns: readonly FreeDaysTown[] = FREE_DAYS_TOWNS): string {
  const { free } = monday7Groups(towns);
  const n = towns.length;
  const options = [4, 3, 2, 1].map((k) => {
    const names = joinNames(free.slice(0, k).map((t) => nameIn(t.name, locale)), locale);
    return {
      ca: `Dilluns 7 de desembre sense classe a ${names}${free.length > k ? " i més" : ""} (${of(free.length, n, "ca")} municipis). Els dies de lliure disposició 2026-2027 de cada ajuntament.`,
      es: `Lunes 7 de diciembre sin clase en ${names}${free.length > k ? " y más" : ""} (${of(free.length, n, "es")} municipios). Los días de libre disposición 2026-2027 de cada ayuntamiento.`,
      en: `No school on Monday 7 December in ${names}${free.length > k ? " and more" : ""} (${of(free.length, n, "en")} towns). Each council's 2026-2027 school free days.`,
    }[locale];
  });
  return fit(options, DESCRIPTION_LIMIT);
}

/* -------------------------------------------------------------------------- */
/* Lead and key facts                                                         */
/* -------------------------------------------------------------------------- */

export function monday7Lead(locale: Locale, towns: readonly FreeDaysTown[] = FREE_DAYS_TOWNS): string {
  const { free, local, school } = monday7Groups(towns);
  const n = towns.length;
  const localLine = local.length
    ? {
        ca: ` A ${joinNames(local.map((t) => nameIn(t.name, "ca")), "ca")} el 7 és festa local, i tampoc no n'hi ha.`,
        es: ` En ${joinNames(local.map((t) => nameIn(t.name, "es")), "es")} el 7 es fiesta local, y tampoco hay.`,
        en: ` In ${joinNames(local.map((t) => nameIn(t.name, "en")), "en")} the 7th is a local holiday, so there is none either.`,
      }[locale]
    : "";
  const schoolLine = school.length
    ? {
        ca: ` En canvi, a ${someNames(school, 4, "ca")} no és dia de lliure disposició: hi ha classe.`,
        es: ` En cambio, en ${someNames(school, 4, "es")} no es día de libre disposición: hay clase.`,
        en: ` In ${someNames(school, 4, "en")}, by contrast, it is not a free day: there is school.`,
      }[locale]
    : "";
  return {
    ca: `**Dilluns 7 de desembre de 2026: no hi ha classe a ${of(free.length, n, "ca")} municipis** que han publicat els dies de lliure disposició del curs 2026-2027, com ${someNames(free, 5, "ca")}: és un dels seus dies de lliure disposició, que fa pont amb el dimarts 8, festiu a tot Catalunya.${localLine}${schoolLine} Cada escola pot triar altres dies: confirma-ho amb el centre.`,
    es: `**Lunes 7 de diciembre de 2026: no hay clase en ${of(free.length, n, "es")} municipios** que han publicado los días de libre disposición del curso 2026-2027, como ${someNames(free, 5, "es")}: es uno de sus días de libre disposición, que hace puente con el martes 8, festivo en toda Cataluña.${localLine}${schoolLine} Cada colegio puede elegir otros días: confírmalo con el centro.`,
    en: `**Monday 7 December 2026: no school in ${of(free.length, n, "en")} towns** that have published their free days for the 2026-2027 school year, such as ${someNames(free, 5, "en")}: it is one of their free days, bridging to Tuesday the 8th, a public holiday across Catalonia.${localLine}${schoolLine} Each school may choose other days: check with yours.`,
  }[locale];
}

function keyFactsBlock(locale: Locale, towns: readonly FreeDaysTown[], pending: readonly FreeDaysPending[]): Block {
  const { free } = monday7Groups(towns);
  const n = towns.length;
  const christmas = {
    ca: `Del ${shortDate(COURSE.christmas[0], "ca")} de ${COURSE.christmas[0].slice(0, 4)} al ${shortDate(COURSE.christmas[1], "ca")} de ${COURSE.christmas[1].slice(0, 4)}`,
    es: `Del ${shortDate(COURSE.christmas[0], "es")} de ${COURSE.christmas[0].slice(0, 4)} al ${shortDate(COURSE.christmas[1], "es")} de ${COURSE.christmas[1].slice(0, 4)}`,
    en: `${shortDate(COURSE.christmas[0], "en")} ${COURSE.christmas[0].slice(0, 4)} to ${shortDate(COURSE.christmas[1], "en")} ${COURSE.christmas[1].slice(0, 4)}`,
  }[locale];
  const copy = {
    ca: {
      title: "Dies de lliure disposició 2026-2027",
      items: [
        { label: "Dilluns 7 de desembre", value: `Sense classe a ${of(free.length, n, "ca")} municipis amb dies publicats` },
        { label: "Dimarts 8 de desembre", value: "Festiu a tot Catalunya (la Immaculada)" },
        { label: "Quants dies", value: "Quatre per curs, repartits en els tres trimestres" },
        { label: "Qui els tria", value: "Cada escola, amb la proposta del consell escolar municipal" },
        { label: "Vacances de Nadal", value: christmas },
        { label: "Municipis revisats", value: `${n} amb dies publicats, ${pending.length} encara sense` },
      ],
    },
    es: {
      title: "Días de libre disposición 2026-2027",
      items: [
        { label: "Lunes 7 de diciembre", value: `Sin clase en ${of(free.length, n, "es")} municipios con días publicados` },
        { label: "Martes 8 de diciembre", value: "Festivo en toda Cataluña (la Purísima)" },
        { label: "Cuántos días", value: "Cuatro por curso, repartidos en los tres trimestres" },
        { label: "Quién los elige", value: "Cada colegio, con la propuesta del consejo escolar municipal" },
        { label: "Vacaciones de Navidad", value: christmas },
        { label: "Municipios revisados", value: `${n} con días publicados, ${pending.length} aún sin ellos` },
      ],
    },
    en: {
      title: "School free days 2026-2027",
      items: [
        { label: "Monday 7 December", value: `No school in ${of(free.length, n, "en")} towns with published days` },
        { label: "Tuesday 8 December", value: "Public holiday across Catalonia (Immaculate Conception)" },
        { label: "How many days", value: "Four per school year, spread over the three terms" },
        { label: "Who picks them", value: "Each school, on the municipal school council's proposal" },
        { label: "Christmas holidays", value: christmas },
        { label: "Towns checked", value: `${n} with published days, ${pending.length} not yet` },
      ],
    },
  }[locale];
  return keyFacts(copy.title, copy.items);
}

/* -------------------------------------------------------------------------- */
/* Town table                                                                 */
/* -------------------------------------------------------------------------- */

const MONDAY_CELL: Record<Locale, Record<"free" | "local" | "school", string>> = {
  ca: { free: "**Sense classe**", local: "Festa local: sense classe", school: "Hi ha classe" },
  es: { free: "**Sin clase**", local: "Fiesta local: sin clase", school: "Hay clase" },
  en: { free: "**No school**", local: "Local holiday: no school", school: "School day" },
};

const KIND: Record<Locale, Record<FreeDaysTown["kind"], string>> = {
  ca: { proposal: "proposta", agreement: "acord", notice: "calendari municipal" },
  es: { proposal: "propuesta", agreement: "acuerdo", notice: "calendario municipal" },
  en: { proposal: "proposal", agreement: "agreement", notice: "town calendar" },
};

/** The town's name, linked to its holiday page in Catalan and Spanish (English has pages for a few towns only). */
function townCell(town: FreeDaysTown, locale: Locale): string {
  const name = nameIn(town.name, locale);
  if (locale === "en" || !municipalityBySlug(town.slug)) return name;
  return `[${name}](${municipalityPath(locale, town.slug)})`;
}

export function townRows(locale: Locale, towns: readonly FreeDaysTown[] = FREE_DAYS_TOWNS): string[][] {
  return alphabetical(towns).map((t) => {
    const days = shortDays(t.days, locale);
    const extra = [t.scope?.[locale], t.note?.[locale]].filter(Boolean).join(" ");
    const checked = t.checked === FREE_DAYS_AS_OF ? "" : { ca: `, consultat el ${readDate(t.checked, "ca")}`, es: `, consultado el ${readDate(t.checked, "es")}`, en: `, checked ${readDate(t.checked, "en")}` }[locale];
    return [townCell(t, locale), MONDAY_CELL[locale][monday7(t)], extra ? `${days}. ${extra}` : days, `[${t.publisher}](${t.url}) (${KIND[locale][t.kind]}${checked})`];
  });
}

function townTable(locale: Locale, towns: readonly FreeDaysTown[]): Block {
  const caption = { ca: "Dies de lliure disposició del curs 2026-2027 per municipis", es: "Días de libre disposición del curso 2026-2027 por municipios", en: "School free days of the 2026-2027 year by town" }[locale];
  const headers = {
    ca: ["Municipi", "Dilluns 7 de desembre", "Dies de lliure disposició 2026-2027", "Font"],
    es: ["Municipio", "Lunes 7 de diciembre", "Días de libre disposición 2026-2027", "Fuente"],
    en: ["Town", "Monday 7 December", "Free days 2026-2027", "Source"],
  }[locale];
  const checked = readDate(FREE_DAYS_AS_OF, locale);
  const note = {
    ca: `De la web de cada ajuntament, del seu servei d'educació o del seu consell escolar municipal; comprovades el ${checked}. «Proposta»: el consell escolar municipal la recomana a totes les escoles. «Acord»: el consell escolar municipal els ha acordat. «Calendari municipal»: l'ajuntament els publica com a calendari del municipi. «Festa local»: Ordre EMT/208/2025.`,
    es: `De la web de cada ayuntamiento, de su servicio de educación o de su consejo escolar municipal; comprobadas el ${checked}. «Propuesta»: el consejo escolar municipal la recomienda a todos los colegios. «Acuerdo»: el consejo escolar municipal los ha acordado. «Calendario municipal»: el ayuntamiento los publica como calendario del municipio. «Fiesta local»: Ordre EMT/208/2025.`,
    en: `From each town council's website, its education service or its municipal school council; checked on ${checked}. "Proposal": the municipal school council recommends them to every school. "Agreement": the municipal school council agreed them. "Town calendar": the council publishes them as the town's calendar. "Local holiday": Order EMT/208/2025.`,
  }[locale];
  return table(caption, headers, townRows(locale, towns), note);
}

function pendingSection(locale: Locale, pending: readonly FreeDaysPending[]): Block[] {
  if (!pending.length) return [];
  const checked = readDate(FREE_DAYS_AS_OF, locale);
  const copy = {
    ca: {
      heading: "Municipis que encara no han publicat els dies",
      text: `A ${checked} no hem trobat els dies de lliure disposició del curs 2026-2027 a la web d'aquests ajuntaments ni del seu consell escolar municipal. No vol dir que no n'hi hagi: l'escola els ha de tenir a la seva programació. Pregunta-ho al centre o mira la pàgina de l'ajuntament:`,
    },
    es: {
      heading: "Municipios que aún no han publicado los días",
      text: `A ${checked} no hemos encontrado los días de libre disposición del curso 2026-2027 en la web de estos ayuntamientos ni de su consejo escolar municipal. No quiere decir que no los haya: el colegio los tiene en su programación. Pregúntalo en el centro o mira la página del ayuntamiento:`,
    },
    en: {
      heading: "Towns that have not published their days yet",
      text: `As of ${checked} we could not find the 2026-2027 free days on the website of these town councils or of their municipal school council. That does not mean there are none: each school has them in its annual plan. Ask the school or check the council's page:`,
    },
  }[locale];
  const label = { ca: "web de l'ajuntament", es: "web del ayuntamiento", en: "council website" }[locale];
  // Where 7 December is a local holiday, that answer stands without the council's free days.
  const local = { ca: " (el 7 de desembre hi és festa local: no hi ha classe)", es: " (el 7 de diciembre es fiesta local: no hay clase)", en: " (7 December is a local holiday there: no school)" }[locale];
  return [
    ...h2(copy.heading, copy.text),
    list(...alphabetical(pending).map((p) => `${nameIn(p.name, locale)}${localDaysInCourse(p.slug).includes(MONDAY_7) ? local : ""}: [${label}](${p.watch})`)),
  ];
}

/* -------------------------------------------------------------------------- */
/* How it works and the rest of the course                                    */
/* -------------------------------------------------------------------------- */

const ORDER: Record<Locale, string> = {
  ca: `[Ordre EDF/66/2026](${SCHOOL_SOURCE.url})`,
  es: `[Ordre EDF/66/2026](${SCHOOL_SOURCE.url})`,
  en: `[Order EDF/66/2026](${SCHOOL_SOURCE.url})`,
};

function howSection(locale: Locale, towns: readonly FreeDaysTown[]): Block[] {
  const five = alphabetical(towns.filter((t) => t.days.length > 4)).map((t) => nameIn(t.name, locale));
  const fiveLine = five.length
    ? {
        ca: ` A la taula, ${five.length === 1 ? `${five[0]} en publica` : `${five.length} municipis en publiquen`} més de quatre.`,
        es: ` En la tabla, ${five.length === 1 ? `${five[0]} publica` : `${five.length} municipios publican`} más de cuatro.`,
        en: ` In the table, ${five.length === 1 ? `${five[0]} lists` : `${five.length} towns list`} more than four.`,
      }[locale]
    : "";
  const bcn = towns.find((t) => t.slug === "barcelona");
  const autonomy = bcn
    ? {
        ca: ` Com recorda el Consell d'Educació Municipal de Barcelona a la seva proposta, «tot i que és una proposta de ciutat, els centres educatius tenen autonomia de gestió».`,
        es: ` Como recuerda el Consell d'Educació Municipal de Barcelona en su propuesta, «tot i que és una proposta de ciutat, els centres educatius tenen autonomia de gestió» (aunque es una propuesta de ciudad, los centros tienen autonomía de gestión).`,
        en: ` As Barcelona's municipal education council puts it in its proposal, "tot i que és una proposta de ciutat, els centres educatius tenen autonomia de gestió" (although it is a city-wide proposal, schools manage themselves).`,
      }[locale]
    : "";
  const copy = {
    ca: {
      heading: "Com funcionen els dies de lliure disposició",
      texts: [
        `L'${ORDER.ca}, que fixa el calendari escolar dels cursos 2026-2027 a 2028-2029, diu que «els centres poden establir quatre dies festius de lliure disposició, que s'han de distribuir entre els tres trimestres». No poden coincidir amb el primer ni l'últim dia de curs (el 8 de setembre de 2026 i el 21 de juny de 2027) ni amb les vacances de Nadal o de Setmana Santa, i cada escola els ha de posar a la seva programació general i comunicar-los als serveis territorials d'Educació.`,
        `**Qui els tria?** Cada escola, però l'ordre demana als consells escolars municipals que, un cop coneguts els festius, fixin «els dies que convindria que adoptessin tots els centres del mateix municipi». La proposta és comuna per a tot el municipi, però no obliga les escoles.${autonomy}`,
        `Només excepcionalment una escola pot posar dies de lliure disposició seguits dins un mateix trimestre: cal l'acord del seu consell escolar i l'autorització dels serveis territorials. I les escoles que comparteixen una línia de transport escolar han de procurar triar els mateixos dies.`,
        `Les dues festes locals del municipi tampoc no són lectives, i si una cau en un dia sense classe, l'escola la pot afegir als seus dies de lliure disposició.${fiveLine} Les festes locals de cada municipi són a [festius locals per municipi](${hubPath("ca")}).`,
      ],
    },
    es: {
      heading: "Cómo funcionan los días de libre disposición",
      texts: [
        `La ${ORDER.es}, que fija el calendario escolar de los cursos 2026-2027 a 2028-2029, dice que los centros pueden establecer «quatre dies festius de lliure disposició» (cuatro días festivos de libre disposición), que deben repartirse entre los tres trimestres. No pueden coincidir con el primer ni el último día de curso (el 8 de septiembre de 2026 y el 21 de junio de 2027) ni con las vacaciones de Navidad o de Semana Santa, y cada colegio debe ponerlos en su programación general y comunicarlos a los servicios territoriales de Educación.`,
        `**¿Quién los elige?** Cada colegio, pero la orden pide a los consejos escolares municipales que, una vez conocidos los festivos, fijen «els dies que convindria que adoptessin tots els centres del mateix municipi» (los días que convendría que adoptaran todos los centros del municipio). La propuesta es común para todo el municipio, pero no obliga a los colegios.${autonomy}`,
        `Solo de forma excepcional un colegio puede poner días de libre disposición seguidos dentro de un mismo trimestre: necesita el acuerdo de su consejo escolar y la autorización de los servicios territoriales. Y los colegios que comparten una línea de transporte escolar deben procurar elegir los mismos días.`,
        `Las dos fiestas locales del municipio tampoco son lectivas, y si una cae en un día sin clase, el colegio puede añadirla a sus días de libre disposición.${fiveLine} Las fiestas locales de cada municipio están en [festivos locales por municipio](${hubPath("es")}).`,
      ],
    },
    en: {
      heading: "How school free days work",
      texts: [
        `${ORDER.en}, which sets the school calendar for 2026-2027 to 2028-2029, lets schools set "quatre dies festius de lliure disposició" (four free-choice days off), spread over the three terms. They cannot fall on the first or last day of the year (8 September 2026 and 21 June 2027) or in the Christmas or Easter holidays, and each school must put them in its annual plan and report them to the Education department's local office.`,
        `**Who picks them?** Each school, but the order asks the municipal school councils, once the holidays are known, to set "els dies que convindria que adoptessin tots els centres del mateix municipi" (the days all the town's schools should ideally share). The proposal is the same for the whole town, but it does not bind the schools.${autonomy}`,
        `Only exceptionally may a school put free days back to back in one term: it needs its school council's agreement and the local Education office's authorisation. Schools sharing a school bus route must try to pick the same days.`,
        `The town's two local holidays are not school days either, and when one falls on a day without school, the school may add it to its free days.${fiveLine}`,
      ],
    },
  }[locale];
  return h2(copy.heading, ...copy.texts);
}

/** The free day most towns chose in a month, if any: "dilluns 8 de febrer de 2027 (5 de 7 municipis)". */
function commonDay(towns: readonly FreeDaysTown[], month: string): { day: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const t of towns) for (const d of t.days) if (d.startsWith(month)) counts.set(d, (counts.get(d) ?? 0) + 1);
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  return best ? { day: best[0], count: best[1] } : null;
}

function restSection(locale: Locale, towns: readonly FreeDaysTown[]): Block[] {
  const n = towns.length;
  const carnaval = commonDay(towns, "2027-02");
  const school = `[${{ ca: "calendari escolar 2026-2027", es: "calendario escolar 2026-2027", en: "2026-2027 school calendar" }[locale]}](/${locale}/${SIBLING_PATHS.school[locale]}/)`;
  const carnavalLine = carnaval
    ? {
        ca: ` El pròxim bloc és el de Carnaval: el dia més triat és el ${freeDay(carnaval.day, "ca")} (${of(carnaval.count, n, "ca")} municipis de la taula).`,
        es: ` El próximo bloque es el de Carnaval: el día más elegido es el ${freeDay(carnaval.day, "es")} (${of(carnaval.count, n, "es")} municipios de la tabla).`,
        en: ` The next block is Carnival: the most common day is ${freeDay(carnaval.day, "en")} (${of(carnaval.count, n, "en")} towns in the table).`,
      }[locale]
    : "";
  const copy = {
    ca: {
      heading: "La resta del curs: Nadal, Carnaval i Setmana Santa",
      texts: [
        `Les vacances de Nadal van del 22 de desembre de 2026 al 7 de gener de 2027, i les de Setmana Santa, del 20 al 29 de març de 2027; el curs acaba el 21 de juny de 2027.${carnavalLine} Tot el curs, amb els festius, al ${school}.`,
        `Si treballes, el dilluns 7 és feiner a Catalunya llevat dels 43 municipis on és festa local: com fer pont i què obre, a ${b2link("decemberBridge", "ca", "la guia del pont de desembre del 2026")}.`,
      ],
    },
    es: {
      heading: "El resto del curso: Navidad, Carnaval y Semana Santa",
      texts: [
        `Las vacaciones de Navidad van del 22 de diciembre de 2026 al 7 de enero de 2027, y las de Semana Santa, del 20 al 29 de marzo de 2027; el curso acaba el 21 de junio de 2027.${carnavalLine} Todo el curso, con los festivos, en el ${school}.`,
        `Si trabajas, el lunes 7 es laborable en Cataluña salvo en los 43 municipios donde es fiesta local: cómo hacer puente y qué abre, en ${b2link("decemberBridge", "es", "el puente de diciembre de 2026")}.`,
      ],
    },
    en: {
      heading: "The rest of the year: Christmas, Carnival and Easter",
      texts: [
        `The Christmas holidays run from 22 December 2026 to 7 January 2027, and Easter from 20 to 29 March 2027; the school year ends on 21 June 2027.${carnavalLine} The whole year, with its holidays, is in the ${school}.`,
        `For workers, Monday the 7th is a working day in Catalonia except in the 43 towns where it is a local holiday: how to make a long weekend of it and what opens, in ${b2link("decemberBridge", "en", "our December 2026 long weekend guide")}.`,
      ],
    },
  }[locale];
  return h2(copy.heading, ...copy.texts);
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

function faqItems(locale: Locale, towns: readonly FreeDaysTown[]): { question: string; answer: string }[] {
  const { free, local, school } = monday7Groups(towns);
  const n = towns.length;
  const bcn = towns.find((t) => t.slug === "barcelona");
  const bcnDays = bcn ? bcn.days.map((d) => freeDay(d, locale)) : [];
  const localAnswer = local.length ? { ca: ` A ${joinNames(local.map((t) => nameIn(t.name, "ca")), "ca")} és festa local.`, es: ` En ${joinNames(local.map((t) => nameIn(t.name, "es")), "es")} es fiesta local.`, en: ` In ${joinNames(local.map((t) => nameIn(t.name, "en")), "en")} it is a local holiday.` }[locale] : "";
  const schoolAnswer = school.length ? { ca: ` A ${someNames(school, 3, "ca")}, sí que n'hi ha.`, es: ` En ${someNames(school, 3, "es")}, sí que hay.`, en: ` In ${someNames(school, 3, "en")}, there is.` }[locale] : "";
  const copy = {
    ca: [
      { question: "Hi ha escola el 7 de desembre de 2026?", answer: `Depèn del municipi i de l'escola. No és festiu a tot Catalunya, però a ${of(free.length, n, "ca")} municipis que han publicat els dies de lliure disposició, com ${someNames(free, 3, "ca")}, és un dels seus dies de lliure disposició.${localAnswer}${schoolAnswer}` },
      ...(bcn ? [{ question: "Hi ha escola el 7 de desembre a Barcelona?", answer: `No, si l'escola segueix la proposta del Consell d'Educació Municipal de Barcelona, que hi posa un dia de lliure disposició. Els quatre dies que proposa per al curs 2026-2027 són ${joinNames(bcnDays, "ca")}. Cada escola decideix.` }] : []),
      { question: "I el 8 de desembre?", answer: "No hi ha classe: el dimarts 8 de desembre (la Immaculada) és festiu a tot Catalunya." },
      { question: "Quants dies de lliure disposició hi ha el curs 2026-2027?", answer: "Quatre, repartits entre els tres trimestres, que no poden coincidir amb el primer ni l'últim dia de curs ni amb les vacances de Nadal o Setmana Santa (Ordre EDF/66/2026). Si una festa local cau en un dia sense classe, l'escola la pot afegir." },
      { question: "Qui decideix els dies de lliure disposició?", answer: "Cada escola, a la seva programació general. El consell escolar municipal proposa els dies que convindria que fessin totes les escoles del municipi, però cada escola pot triar-ne d'altres." },
    ],
    es: [
      { question: "¿Hay colegio el 7 de diciembre de 2026?", answer: `Depende del municipio y del colegio. No es festivo en toda Cataluña, pero en ${of(free.length, n, "es")} municipios que han publicado los días de libre disposición, como ${someNames(free, 3, "es")}, es uno de sus días de libre disposición.${localAnswer}${schoolAnswer}` },
      ...(bcn ? [{ question: "¿Hay colegio el 7 de diciembre en Barcelona?", answer: `No, si el colegio sigue la propuesta del Consell d'Educació Municipal de Barcelona, que pone ahí un día de libre disposición. Los cuatro días que propone para el curso 2026-2027 son ${joinNames(bcnDays, "es")}. Cada colegio decide.` }] : []),
      { question: "¿Y el 8 de diciembre?", answer: "No hay clase: el martes 8 de diciembre (la Purísima) es festivo en toda Cataluña." },
      { question: "¿Cuántos días de libre disposición hay en el curso 2026-2027?", answer: "Cuatro, repartidos entre los tres trimestres, que no pueden coincidir con el primer ni el último día de curso ni con las vacaciones de Navidad o Semana Santa (Ordre EDF/66/2026). Si una fiesta local cae en un día sin clase, el colegio puede añadirla." },
      { question: "¿Quién decide los días de libre disposición?", answer: "Cada colegio, en su programación general. El consejo escolar municipal propone los días que convendría que hicieran todos los colegios del municipio, pero cada colegio puede elegir otros." },
    ],
    en: [
      { question: "Is there school on 7 December 2026?", answer: `It depends on the town and the school. It is not a holiday across Catalonia, but in ${of(free.length, n, "en")} towns that have published their free days, such as ${someNames(free, 3, "en")}, it is one of their free days.${localAnswer}${schoolAnswer}` },
      ...(bcn ? [{ question: "Is there school on 7 December in Barcelona?", answer: `No, if the school follows the proposal of Barcelona's municipal education council, which puts a free day there. The four days it proposes for 2026-2027 are ${joinNames(bcnDays, "en")}. Each school decides.` }] : []),
      { question: "And on 8 December?", answer: "No school: Tuesday 8 December (Immaculate Conception) is a public holiday across Catalonia." },
      { question: "How many free days are there in 2026-2027?", answer: "Four, spread over the three terms, never on the first or last day of the year or in the Christmas or Easter holidays (Order EDF/66/2026). When a local holiday falls on a day without school, the school may add it." },
      { question: "Who decides the free days?", answer: "Each school, in its annual plan. The municipal school council proposes the days all the town's schools should ideally share, but each school may choose others." },
    ],
  }[locale];
  return copy;
}

/* -------------------------------------------------------------------------- */
/* Body, sources and article                                                  */
/* -------------------------------------------------------------------------- */

const RELATED: B2Key[] = ["decemberBridge", "strikeEducation", "holidayToday", "barcelonaDecember"];

export function buildSchoolFreeDaysBody(
  locale: Locale,
  towns: readonly FreeDaysTown[] = FREE_DAYS_TOWNS,
  pending: readonly FreeDaysPending[] = FREE_DAYS_PENDING,
): Block[] {
  const checked = readDate(FREE_DAYS_AS_OF, locale);
  const t = {
    ca: {
      method: ["Com tractem les dades", `Només hi posem els dies d'un municipi quan l'ajuntament, el seu servei d'educació o el seu consell escolar municipal els ha publicat; mai de la web d'una escola, d'una AFA o d'un diari. Si no els trobem, ho diem i enllacem l'ajuntament. Última revisió: ${checked}.`],
      tableHeading: "Dies de lliure disposició 2026-2027, municipi per municipi",
      tableIntro: "Els dies que el consell escolar municipal proposa a totes les escoles del municipi. Cada escola fixa els seus a la programació del curs, i en pot triar d'altres.",
    },
    es: {
      method: ["Cómo tratamos los datos", `Solo ponemos los días de un municipio cuando el ayuntamiento, su servicio de educación o su consejo escolar municipal los ha publicado; nunca de la web de un colegio, de un AMPA o de un periódico. Si no los encontramos, lo decimos y enlazamos el ayuntamiento. Última revisión: ${checked}.`],
      tableHeading: "Días de libre disposición 2026-2027, municipio por municipio",
      tableIntro: "Los días que el consejo escolar municipal propone a todos los colegios del municipio. Cada colegio fija los suyos en la programación del curso, y puede elegir otros.",
    },
    en: {
      method: ["How we handle the data", `We only list a town's days once the town council, its education service or its municipal school council has published them; never from a school's, a parents' association's or a newspaper's website. When we cannot find them, we say so and link the council. Last checked on ${checked}.`],
      tableHeading: "School free days 2026-2027, town by town",
      tableIntro: "The days each municipal school council proposes to every school in the town. Each school sets its own in its annual plan, and may choose others.",
    },
  }[locale];
  return [
    lead(monday7Lead(locale, towns)),
    keyFactsBlock(locale, towns, pending),
    languageLinks(),
    callout("info", t.method[0]!, t.method[1]!),
    ...h2(t.tableHeading, t.tableIntro),
    townTable(locale, towns),
    ...pendingSection(locale, pending),
    ...howSection(locale, towns),
    ...restSection(locale, towns),
    faq(faqItems(locale, towns)),
    ...paras(verifiedLine(locale, FREE_DAYS_AS_OF)),
    ...b2Related(RELATED, locale),
  ];
}

export function freeDaysSources(towns: readonly FreeDaysTown[] = FREE_DAYS_TOWNS): B2Source[] {
  const list: B2Source[] = [];
  const add = (name: string, url: string, publisher: string) => {
    if (!list.some((s) => s.url === url)) list.push({ name, url, publisher });
  };
  add(SCHOOL_SOURCE.name, SCHOOL_SOURCE.url, "DOGC");
  add(REGIONAL_ORDER.name, REGIONAL_ORDER.url, "DOGC");
  add(LOCAL_ORDER.name, LOCAL_ORDER.url, "DOGC");
  for (const t of alphabetical(towns)) add(`${t.title} (${t.name})`, t.url, t.publisher);
  return list;
}

export const SCHOOL_FREE_DAYS: B2Article = {
  key: "schoolFreeDays",
  entryKey: "guide-school-free-days",
  categoryKey: "calendar",
  sources: freeDaysSources(),
  // The school calendar guide's second photograph, with its exact alt text and caption (see the header comment).
  heroKey: "calendari-escolar-grup-ramon-llull",
  heroAlt: {
    ca: "Edifici del Grup Escolar Ramon Llull de Barcelona entre palmeres i arbres",
    es: "Edificio del Grup Escolar Ramon Llull de Barcelona entre palmeras y árboles",
    en: "The Ramon Llull school building in Barcelona among palm trees",
  },
  heroCaption: {
    ca: "El Grup Escolar Ramon Llull, a Barcelona.",
    es: "El Grup Escolar Ramon Llull, en Barcelona.",
    en: "The Ramon Llull school group, Barcelona.",
  },
  verifiedAt: FREE_DAYS_AS_OF,
  publishedAt: "2026-11-05T12:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [
      locale,
      {
        ...SCHOOL_FREE_DAYS_META[locale],
        seoTitle: freeDaysTitle(locale),
        seoDescription: freeDaysDescription(locale),
        blocks: buildSchoolFreeDaysBody(locale),
      },
    ]),
  ) as B2Article["editions"],
};
