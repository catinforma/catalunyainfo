import "server-only";

import type { Block } from "@/lib/content/blocks";
import { IMAGE_BY_KEY } from "@/lib/content/images";
import {
  publishArticle,
  type ArticleSpec,
  type ImageSpec,
  type PublishResult,
} from "@/lib/content/publish-article";
import { LOCALES, type Locale } from "@/lib/i18n/config";

import { SNAPSHOT, aranSwap, municipalityBySlug } from "@/lib/programmatic/holidays/data";
import { LOCAL_DATE_PAGES } from "@/lib/programmatic/holidays/dates";
import { joinList } from "@/lib/programmatic/holidays/names";
import { datePath } from "@/lib/programmatic/holidays/paths";
import { largestTownLinks, townPageCount } from "@/lib/programmatic/holidays/towns";

import { CALENDAR_VERIFIED_AT, HOLIDAY_SOURCE, addDays, allHolidays, shortDate, todayInCatalonia } from "./calendar";
import { weekdayDate } from "./today-answer";
import { COPY as CALENDAR_COPY } from "./copy";
import { LOCAL_SOURCE } from "./local";
import { BARCELONA_LOCAL } from "./payload";

/**
 * "Is today a public holiday in Catalonia?"
 *
 * ## Why this page exists
 *
 * Search Console, one week to 6 October 2026: **166 distinct queries**
 * containing "festiv", of which about 145 are the same question asked about a
 * particular day — `30 de octubre es festivo`, `el lunes es festivo en
 * cataluña`, `mañana es festivo`, `es festivo en cataluña hoy`, `12 de octubre
 * es festivo en cataluña`. Nearly all of them land on the year-planner calendar
 * at positions 50 to 99, and none of them is clicked.
 *
 * Where the date is close the planner already ranks — `30 octubre es festivo`
 * at position 5, `el dia 30 de octubre es festivo` at 6.4 — which says the site
 * can compete for this and is simply answering the wrong question. A year
 * planner is for someone booking leave in January. These people want a yes or
 * a no about one day.
 *
 * ## Why it does not cannibalise the calendar guide
 *
 * Different intent, different page, and they link to each other. The planner
 * answers *which days are holidays next year*; this answers *is this day a
 * holiday*. The planner keeps the bridges, the long weekends and the ICS
 * download; this one carries none of them.
 *
 * ## Why the URL has no year in it
 *
 * It is the same page every day, forever. A `-2026` slug would need replacing
 * each January and would split its own history.
 */

export const ENTRY_KEY = "guide-is-today-a-holiday-catalonia";

const PUBLISHED = new Date("2026-10-06T12:00:00+02:00");

// The calendar guide's Diada photograph. Shared deliberately: every article
// carries at least one photo, and this is the one that says "public holiday"
// in Catalonia without a word of text.
const HERO_KEY = "calendari-laboral-catalunya-diada";
const HERO_ALT: Record<Locale, string> = {
  ca: "Ofrena floral durant la Diada Nacional de Catalunya, amb rams de colors al peu del monument",
  es: "Ofrenda floral durante la Diada Nacional de Cataluña, con ramos de colores al pie del monumento",
  en: "Flowers laid at a monument during the Diada, Catalonia's national day",
};
const HERO_CAPTION: Record<Locale, string> = {
  ca: "La Diada, l'11 de setembre, és un dels festius que es fan a tot Catalunya.",
  es: "La Diada, el 11 de septiembre, es uno de los festivos de toda Cataluña.",
  en: "The Diada on 11 September is one of the holidays kept across Catalonia.",
};

function heroImages(): ImageSpec[] {
  const file = IMAGE_BY_KEY.get(HERO_KEY);
  if (!file) return [];
  return [
    {
      key: HERO_KEY,
      url: file.url,
      width: file.width,
      height: file.height,
      blurDataUrl: file.blurDataUrl,
      credit: file.credit ?? "CatalunyaInfo",
      creditUrl: file.creditUrl ?? null,
      license: file.license ?? null,
      alt: HERO_ALT,
      caption: HERO_CAPTION,
    },
  ];
}
const VERIFIED = new Date(`${CALENDAR_VERIFIED_AT}T12:00:00+02:00`);

interface TodayCopy {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  lead: string[];
  howTitle: string;
  how: string[];
  localTitle: string;
  local: string[];
  weekendTitle: string;
  weekend: string[];
  plannerLine: string;
}

const COPY: Record<Locale, TodayCopy> = {
  ca: {
    path: "guies/es-festiu-avui-catalunya",
    title: "És festiu avui a Catalunya?",
    seoTitle: "Avui és festiu a Catalunya? Avui, demà i pròxims festius",
    seoDescription:
      "Si avui i demà són festius a Catalunya, amb la data, els tres pròxims festius i on és festa local avui, municipi a municipi. Dades de la Generalitat.",
    excerpt:
      "La resposta d'avui, la de demà, el pròxim festiu i on és festa local avui, amb el calendari oficial de la Generalitat.",
    lead: [
      "El requadre es renova cada nit, passada la mitjanit, amb el calendari oficial de la Generalitat: diu **si avui és festiu a Catalunya**, si ho és demà, quins són els tres pròxims festius i a quins municipis és avui festa local. Cada resposta porta la seva data.",
    ],
    howTitle: "Com funcionen els festius a Catalunya",
    how: [
      "Cada any la Generalitat fixa **dotze dies festius** per a tot Catalunya. Són retribuïts i no recuperables.",
      "Dos d'aquests dotze canvien de data cada any perquè depenen de la Pasqua: Divendres Sant i Dilluns de Pasqua Florida. La llista tampoc no és sempre la mateixa: el 2026 hi ha el 15 d'agost i el 26 de desembre; el 2027, quan tots dos cauen en diumenge, no hi són, i en canvi hi ha l'1 de novembre i el 6 de desembre.",
      "El calendari s'aprova any per any, així que no es poden saber amb antelació il·limitada.",
    ],
    localTitle: "És festiu avui al teu municipi?",
    local: [
      "A banda dels dotze dies de tot Catalunya, **cada municipi en fixa dos més**, que són els seus festius locals. Varien de poble a poble i no surten a la llista de pròxims festius: a dalt, a «On és festiu avui?», hi ha els municipis i nuclis que avui i demà fan festa local, segons les dades obertes de la Generalitat.",
      "Per veure l'any sencer d'un municipi, cadascun dels {count} que tenen festius locals té la seva pàgina amb tots els festius ({towns}); els tens tots, per comarques, a [festius locals per municipi](/ca/festius/), i en una sola llista a [festius locals de Catalunya](/ca/guies/festius-locals-catalunya/).",
      "Si el que vols saber és si demà obre la teva escola, compta-hi també els dies de lliure disposició de cada centre: el curs sencer és al [calendari escolar 2026-2027](/ca/guies/calendari-escolar-catalunya/).",
    ],
    weekendTitle: "Un festiu en dissabte es trasllada?",
    weekend: [
      "No automàticament. Quan un festiu cau en diumenge, la normativa preveu el trasllat al dilluns següent en determinats casos, però quan cau en dissabte no es trasllada.",
      "Això explica per què hi ha anys amb molts més ponts que altres sense que canviï el nombre de dies.",
    ],
    plannerLine:
      "Si el que vols és planificar vacances i ponts amb temps, tenim el [calendari laboral complet](/ca/guies/calendari-laboral-catalunya/), amb els ponts i el fitxer per afegir-lo al teu calendari.",
  },

  es: {
    path: "guias/es-festivo-hoy-cataluna",
    title: "¿Es festivo hoy en Cataluña?",
    seoTitle: "¿Es festivo hoy en Cataluña? Hoy, mañana y próximos festivos",
    seoDescription:
      "Si hoy y mañana son festivos en Cataluña, con la fecha, los tres próximos festivos y dónde es fiesta local hoy, municipio a municipio. Datos oficiales.",
    excerpt:
      "La respuesta de hoy, la de mañana, el próximo festivo y dónde es fiesta local hoy, con el calendario oficial de la Generalitat.",
    lead: [
      "El recuadro se renueva cada noche, pasada la medianoche, con el calendario oficial de la Generalitat: dice **si hoy es festivo en Cataluña**, si lo es mañana, cuáles son los tres próximos festivos y en qué municipios es hoy fiesta local. Cada respuesta lleva su fecha.",
    ],
    howTitle: "Cómo funcionan los festivos en Cataluña",
    how: [
      "Cada año la Generalitat fija **doce días festivos** para toda Cataluña. Son retribuidos y no recuperables.",
      "Dos de esos doce cambian de fecha cada año porque dependen de la Pascua: Viernes Santo y Lunes de Pascua Florida. La lista tampoco es siempre la misma: en 2026 incluye el 15 de agosto y el 26 de diciembre; en 2027, cuando ambos caen en domingo, no están, y en cambio sí lo están el 1 de noviembre y el 6 de diciembre.",
      "El calendario se aprueba año a año, así que no puede conocerse con antelación ilimitada.",
    ],
    localTitle: "¿Es festivo hoy en tu municipio?",
    local: [
      "Además de los doce días de toda Cataluña, **cada municipio fija dos más**, que son sus festivos locales. Varían de un pueblo a otro y no salen en la lista de próximos festivos: arriba, en «¿Dónde es festivo hoy?», están los municipios y núcleos que hoy y mañana tienen fiesta local, según los datos abiertos de la Generalitat.",
      "Para ver el año entero de un municipio, cada uno de los {count} que tienen festivos locales tiene su página con todos los festivos ({towns}); los tienes todos, por comarcas, en [festivos locales por municipio](/es/festivos/), y en una sola lista en [festivos locales de Cataluña](/es/guias/festivos-locales-cataluna/).",
      "Si lo que quieres saber es si mañana hay cole, cuenta también los días de libre disposición de cada centro: el curso entero está en el [calendario escolar 2026-2027](/es/guias/calendario-escolar-cataluna/).",
    ],
    weekendTitle: "¿Un festivo en sábado se traslada?",
    weekend: [
      "No automáticamente. Cuando un festivo cae en domingo, la normativa prevé el traslado al lunes siguiente en determinados casos, pero cuando cae en sábado no se traslada.",
      "Eso explica que haya años con muchos más puentes que otros sin que cambie el número de días.",
    ],
    plannerLine:
      "Si lo que quieres es planificar vacaciones y puentes con tiempo, tenemos el [calendario laboral completo](/es/guias/calendario-laboral-cataluna/), con los puentes y el archivo para añadirlo a tu calendario.",
  },

  en: {
    path: "guides/is-today-a-holiday-in-catalonia",
    title: "Is today a public holiday in Catalonia?",
    seoTitle: "Is today a holiday in Barcelona and Catalonia? Live answer",
    seoDescription:
      "Whether today and tomorrow are public holidays in Barcelona and Catalonia, with the date, the next three holidays and the towns with a local holiday today.",
    excerpt:
      "Today's answer, tomorrow's, the next holiday and where it is a local holiday today, from the Catalan government's official calendar.",
    lead: [
      "The box is renewed every night, just after midnight, from the Catalan government's official calendar: it says **whether today is a public holiday in Catalonia**, whether tomorrow is, the next three holidays and which towns have a local holiday today. Every answer carries its date.",
    ],
    howTitle: "How public holidays work in Catalonia",
    how: [
      "Each year the Catalan government sets **twelve public holidays** for the whole of Catalonia. They are paid and cannot be made up later.",
      "Two of the twelve change date every year because they follow Easter: Good Friday and Easter Monday. The list itself also changes: 2026 includes 15 August and 26 December; in 2027, when both fall on a Sunday, they are not on it, and 1 November and 6 December are.",
      "The calendar is approved one year at a time, so it cannot be known indefinitely far ahead.",
    ],
    localTitle: "Is it a holiday today in your town?",
    local: [
      "On top of the twelve Catalonia-wide days, **every municipality sets two more** as its local holidays. They differ from town to town and are not in the list of upcoming holidays: above, under \"Where is it a local holiday today?\", are the towns and villages with a local holiday today and tomorrow, from the Catalan government's open data.",
      "Barcelona's two local holidays in {bcnYear} are {bcn}. Every other town's dates are in [local holidays in Catalonia](/en/guides/local-holidays-catalonia/).",
      "If what you need to know is whether schools are open tomorrow, each school also sets four free-choice days of its own: the term dates are in the [Catalonia school calendar 2026-2027](/en/guides/catalonia-school-calendar/).",
    ],
    weekendTitle: "Does a Saturday holiday move?",
    weekend: [
      "Not automatically. When a holiday falls on a Sunday the rules provide for moving it to the following Monday in certain cases, but a Saturday holiday is not moved.",
      "That is why some years have far more long weekends than others without the number of days changing.",
    ],
    plannerLine:
      "If you are planning leave and long weekends ahead of time, see the [full public holiday guide](/en/guides/catalonia-public-holidays/), with the bridges and a calendar file to download.",
  },
};

export function buildBody(locale: Locale): Block[] {
  const copy = COPY[locale];
  const blocks: Block[] = [];

  // The answer is the first thing on the page, before any prose: somebody who
  // typed "is it a holiday today" should not have to read an introduction to
  // find out (3 Nov 2026: the lead used to come first). The lead follows it
  // and says how the box works.
  blocks.push({ type: "holidayToday" });
  for (const text of copy.lead) blocks.push({ type: "paragraph", text });

  const section = (heading: string, paragraphs: string[]) => {
    blocks.push({ type: "heading", level: 2, text: heading });
    for (const text of paragraphs) blocks.push({ type: "paragraph", text });
  };

  // Local questions go on to the town pages of the holiday engine (ca/es);
  // English has no town pages, so it names Barcelona's two days instead.
  const towns = locale === "en" ? "" : joinList(largestTownLinks(locale), locale);
  const bcn = joinList(
    BARCELONA_LOCAL.map((holiday) => `${shortDate(holiday.date, "en")} (${holiday.name.en.replace(/ \(.*\)$/, "")})`),
    "en",
  );
  const local = copy.local.map((text) =>
    text
      .replace("{towns}", towns)
      .replace("{count}", String(townPageCount()))
      .replace("{bcnYear}", BARCELONA_LOCAL[0]!.date.slice(0, 4))
      .replace("{bcn}", bcn),
  );

  // "Mañana es festivo" (5 Nov 2026): 36 impressions at 52 for this page,
  // spread over six town pages and the work calendar (73). The box answers it
  // only inside a <dt>, and the FAQ answer pointed at the box. A heading in the
  // query's words, with the dated eves, answers it in the body.
  blocks.push(...tomorrowSection(locale));

  // How it works first for the reader who wants the rule; the local section
  // right after, because "is it a holiday in my town" is the next question.
  section(copy.localTitle, local);
  section(copy.howTitle, copy.how);
  section(copy.weekendTitle, copy.weekend);

  blocks.push(faqBlock(locale));
  blocks.push({ type: "paragraph", text: copy.plannerLine });

  return blocks;
}

const TOMORROW_TITLE: Record<Locale, string> = {
  ca: "Demà és festiu a Catalunya?",
  es: "¿Mañana es festivo en Cataluña?",
  en: "Is tomorrow a holiday in Catalonia?",
};

/** "la Inmaculada" / "Navidad" after "víspera de", with Catalan elision ("vigília de l'Assumpció"). */
function holidayAfterOf(name: string, locale: Locale): string {
  const lower = name.replace(/^La /, "la ").replace(/^L'/, "l'");
  if (locale === "en") return `the eve of ${name}`;
  if (locale === "es") return `víspera de ${lower}`;
  return /^[aeiouàèéíòóú]/i.test(lower) ? `vigília d'${lower}` : `vigília de ${lower}`;
}

/**
 * The next days on which "tomorrow" is a Catalonia-wide holiday, from `today`
 * (the publish day). Each item names its own date and year, so a stored copy
 * stays true after the date has passed.
 */
export function tomorrowEves(locale: Locale, today: string, style: "body" | "faq" = "body", count = 4): string[] {
  return allHolidays()
    .filter((holiday) => addDays(holiday.date, -1) >= today)
    .slice(0, count)
    .map((holiday) => {
      const eve = weekdayDate(addDays(holiday.date, -1), locale, true);
      const aran = aranSwap(Number(holiday.date.slice(0, 4)))?.replaces === holiday.date;
      const exceptAran = aran ? { ca: ", excepte a l'Aran", es: ", excepto en Arán", en: ", except in Aran" }[locale] : "";
      const of = holidayAfterOf(holiday.name[locale], locale);
      return style === "body"
        ? `**${eve}**: ${of} (${weekdayDate(holiday.date, locale)}${exceptAran})`
        : `${locale === "en" ? "" : "el "}${eve} (${of}${exceptAran})`;
    });
}

/** The next Catalonia-wide holidays from `today`, dated with their year: the FAQ's answer to "is today a holiday?". */
function nextHolidaysLine(locale: Locale, today: string, count = 3): string {
  return joinList(
    allHolidays()
      .filter((holiday) => holiday.date >= today)
      .slice(0, count)
      .map((holiday) => {
        const aran = aranSwap(Number(holiday.date.slice(0, 4)))?.replaces === holiday.date;
        const exceptAran = aran ? { ca: ", excepte a l'Aran", es: ", excepto en Arán", en: ", except in Aran" }[locale] : "";
        return `${locale === "en" ? "" : "el "}${weekdayDate(holiday.date, locale, true)} (${holiday.name[locale]}${exceptAran})`;
      }),
    locale,
  );
}

/** Heading in the query's words, the rule, the dated eves as a list, then where the local days are. */
function tomorrowSection(locale: Locale): Block[] {
  const hub = { ca: "/ca/festius/", es: "/es/festivos/", en: "/en/holidays/" }[locale];
  const [intro, after] = {
    ca: [
      "Demà és festiu a tot Catalunya només la vigília d'un dels dotze festius del calendari de la Generalitat. Les pròximes vigílies:",
      `Cada municipi hi afegeix dues festes locals. El requadre de dalt diu cada dia si demà és festiu i a quins municipis és demà festa local; l'any sencer de cada municipi és a [festius locals per municipi](${hub}).`,
    ],
    es: [
      "Mañana es festivo en toda Cataluña solo la víspera de uno de los doce festivos del calendario de la Generalitat. Las próximas vísperas:",
      `Cada municipio añade dos fiestas locales. El recuadro de arriba dice cada día si mañana es festivo y en qué municipios es mañana fiesta local; el año entero de cada municipio está en [festivos locales por municipio](${hub}).`,
    ],
    en: [
      "Tomorrow is a holiday across Catalonia only on the eve of one of the twelve days in the Catalan government's calendar. The next eves:",
      `Each town adds two local holidays. The box at the top says every day whether tomorrow is a holiday and where tomorrow is a local holiday; each town's whole year is in [public holidays town by town](${hub}).`,
    ],
  }[locale] as [string, string];
  const eves = tomorrowEves(locale, todayInCatalonia());
  // Past the last published calendar there is nothing to list: keep the rule only.
  if (eves.length === 0) {
    return [
      { type: "heading", level: 2, text: TOMORROW_TITLE[locale] },
      { type: "paragraph", text: `${intro.replace(/\s*[^.]*:$/, "")}` },
      { type: "paragraph", text: after },
    ];
  }
  return [
    { type: "heading", level: 2, text: TOMORROW_TITLE[locale] },
    { type: "paragraph", text: intro },
    { type: "list", ordered: false, items: eves },
    { type: "paragraph", text: after },
  ];
}

/**
 * The questions in the words Search Console shows ("hoy es festivo en
 * cataluña", "mañana es festivo", "donde es festivo hoy en cataluña").
 * Nothing here depends on the publish date except the list of local-holiday
 * dates still ahead, which links each to its own page (past ones stay
 * correct: those pages switch to the past tense).
 */
function faqBlock(locale: Locale): Block {
  const today = todayInCatalonia();
  // Only the days with many local holidays (11 Nov, 30 Nov, 7 Dec...), not the odd one.
  const ahead = Object.keys(LOCAL_DATE_PAGES)
    .filter((iso) => iso >= today && (SNAPSHOT.localByDate[iso]?.length ?? 0) >= 10)
    .sort()
    .slice(0, 4);
  const dates = joinList(
    ahead.map((iso) => {
      const n = SNAPSHOT.localByDate[iso]!.length;
      const page = datePath(locale, LOCAL_DATE_PAGES[iso]!);
      const when = shortDate(iso, locale);
      return locale === "ca"
        ? `[${/^1?1 /.test(when) ? "l'" : "el "}${when}](${page}) (${n} ${n === 1 ? "lloc" : "llocs"})`
        : locale === "es"
          ? `[el ${when}](${page}) (${n} ${n === 1 ? "lugar" : "lugares"})`
          : `[${when}](${page}) (${n} ${n === 1 ? "place" : "places"})`;
    }),
    locale,
  );
  const bcn2026 = municipalityBySlug("barcelona")?.local ?? [];
  const bcnList = (days: string[], loc: Locale) => joinList(days.map((iso) => `${loc === "en" ? "" : "el "}${shortDate(iso, loc)}`), loc);

  const items: Record<Locale, { question: string; answer: string }[]> = {
    ca: [
      { question: "Avui és festiu a Catalunya?", answer: `Només si avui és un dels dotze festius de tot Catalunya. Els pròxims: ${nextHolidaysLine("ca", today)}. Si avui no és cap d'aquests, pot ser festa local al teu municipi: el requadre del principi ho diu cada dia, amb el calendari oficial de la Generalitat.` },
      { question: "Demà és festiu a Catalunya?", answer: `Només si avui és la vigília d'un dels dotze festius de tot Catalunya (Ordre EMT/66/2025 per al 2026 i Ordre EMT/52/2026 per al 2027). Les pròximes vigílies: ${joinList(tomorrowEves("ca", today, "faq"), "ca")}. El requadre del principi ho diu cada dia i afegeix on és demà festa local.` },
      { question: "On és festiu avui a Catalunya?", answer: `On avui és festa local: cada municipi en fixa dues l'any (Ordre EMT/208/2025, modificada per l'Ordre EMT/3/2026), i el requadre en dona la llista del dia.${dates ? ` Els dies amb més festes locals que vénen són ${dates}.` : ""}` },
      { question: "Avui és festiu a Barcelona?", answer: `Barcelona fa els dotze festius de tot Catalunya i dues festes locals: el ${YEAR_2026} van ser ${bcnList(bcn2026, "ca")}, i el 2027 són ${bcnList(BARCELONA_LOCAL.map((h) => h.date), "ca")}. Tot l'any, a [festius de Barcelona](/ca/festius/barcelona/).` },
    ],
    es: [
      { question: "¿Hoy es festivo en Cataluña?", answer: `Solo si hoy es uno de los doce festivos de toda Cataluña. Los próximos: ${nextHolidaysLine("es", today)}. Si hoy no es uno de ellos, puede ser fiesta local en tu municipio: el recuadro del principio lo dice cada día, con el calendario oficial de la Generalitat.` },
      { question: "¿Mañana es festivo en Cataluña?", answer: `Solo si hoy es la víspera de uno de los doce festivos de toda Cataluña (Orden EMT/66/2025 para 2026 y Orden EMT/52/2026 para 2027). Las próximas vísperas: ${joinList(tomorrowEves("es", today, "faq"), "es")}. El recuadro del principio lo dice cada día y añade dónde es mañana fiesta local.` },
      { question: "¿Dónde es festivo hoy en Cataluña?", answer: `Donde hoy es fiesta local: cada municipio fija dos al año (Orden EMT/208/2025, modificada por la Orden EMT/3/2026), y el recuadro da la lista del día.${dates ? ` Los días con más fiestas locales que vienen son ${dates}.` : ""}` },
      { question: "¿Hoy es festivo en Barcelona?", answer: `Barcelona tiene los doce festivos de toda Cataluña y dos fiestas locales: en ${YEAR_2026} fueron ${bcnList(bcn2026, "es")}, y en 2027 son ${bcnList(BARCELONA_LOCAL.map((h) => h.date), "es")}. Todo el año, en [festivos de Barcelona](/es/festivos/barcelona/).` },
    ],
    en: [
      { question: "Is today a public holiday in Catalonia?", answer: `Only if today is one of the twelve Catalonia-wide holidays. The next ones: ${nextHolidaysLine("en", today)}. If today is not one of them, it may be a local holiday in your town: the box at the top says so every day, from the Catalan government's official calendar.` },
      { question: "Is tomorrow a holiday in Catalonia?", answer: `Only if today is the eve of one of the twelve Catalonia-wide holidays (Order EMT/66/2025 for 2026, Order EMT/52/2026 for 2027). The next eves: ${joinList(tomorrowEves("en", today, "faq"), "en")}. The box at the top says so every day, with the towns where tomorrow is a local holiday.` },
      { question: "Is today a holiday in Barcelona?", answer: `Barcelona keeps the twelve Catalonia-wide holidays plus two local ones: in ${YEAR_2026} they were ${bcnList(bcn2026, "en")}, and in 2027 they are ${bcnList(BARCELONA_LOCAL.map((h) => h.date), "en")}.` },
      { question: "Where is it a holiday today in Catalonia?", answer: `Wherever today is a local holiday: each town sets two a year (Order EMT/208/2025, amended by Order EMT/3/2026), and the box lists today's.${dates ? ` The coming days with the most local holidays are ${dates}.` : ""}` },
    ],
  };
  return {
    type: "faq",
    title: locale === "ca" ? "Preguntes freqüents" : locale === "es" ? "Preguntas frecuentes" : "Frequently asked questions",
    items: items[locale],
  };
}

const YEAR_2026 = "2026";

export async function publishHolidayTodayGuide(): Promise<PublishResult> {
  const spec: ArticleSpec = {
    entryKey: ENTRY_KEY,
    type: "guide",
    categoryKey: "public-services",
    isFeatured: false,
    heroKey: HERO_KEY,
    images: heroImages(),
    sources: [
      {
        name: HOLIDAY_SOURCE.name,
        url: HOLIDAY_SOURCE.url,
        publisher: HOLIDAY_SOURCE.publisher,
        type: "official" as const,
      },
      {
        name: LOCAL_SOURCE.name,
        url: LOCAL_SOURCE.url,
        publisher: LOCAL_SOURCE.publisher,
        type: "official" as const,
      },
      {
        name: "Festes estatals i autonòmiques a Catalunya i locals a Barcelona",
        url: "https://ajuntament.barcelona.cat/calendarifestius/ca/",
        publisher: "Ajuntament de Barcelona",
        type: "official" as const,
      },
    ],
    publishedAt: PUBLISHED,
    lastVerifiedAt: VERIFIED,
    editions: LOCALES.map((locale) => {
      const copy = COPY[locale];
      return {
        locale,
        path: copy.path,
        title: copy.title,
        excerpt: copy.excerpt,
        seoTitle: copy.seoTitle,
        seoDescription: copy.seoDescription,
        body: buildBody(locale),
      };
    }),
  };

  return publishArticle(spec);
}

export { COPY, CALENDAR_COPY };
