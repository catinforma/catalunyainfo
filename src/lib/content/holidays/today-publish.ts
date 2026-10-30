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

import { SNAPSHOT, municipalityBySlug } from "@/lib/programmatic/holidays/data";
import { LOCAL_DATE_PAGES } from "@/lib/programmatic/holidays/dates";
import { joinList } from "@/lib/programmatic/holidays/names";
import { datePath } from "@/lib/programmatic/holidays/paths";
import { largestTownLinks, townPageCount } from "@/lib/programmatic/holidays/towns";

import { CALENDAR_VERIFIED_AT, HOLIDAY_SOURCE, shortDate, todayInCatalonia } from "./calendar";
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
    seoTitle: "Avui és festiu a Catalunya? Avui, demà i al teu municipi",
    seoDescription:
      "Si avui i demà és festiu a Catalunya, el pròxim festiu i on és festa local avui, amb el calendari de cada municipi. Dades de la Generalitat.",
    excerpt:
      "La resposta d'avui, la de demà, el pròxim festiu i on és festa local avui, amb el calendari oficial de la Generalitat.",
    lead: [
      "Aquesta pàgina respon cada dia una pregunta: **si avui és festiu a Catalunya**. També diu si ho és demà, quan cau el pròxim festiu i a quins municipis és avui festa local.",
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
    seoTitle: "¿Hoy es festivo en Cataluña? Hoy, mañana y en tu municipio",
    seoDescription:
      "Si hoy y mañana es festivo en Cataluña, el próximo festivo y dónde es fiesta local hoy, con el calendario de cada municipio. Datos de la Generalitat.",
    excerpt:
      "La respuesta de hoy, la de mañana, el próximo festivo y dónde es fiesta local hoy, con el calendario oficial de la Generalitat.",
    lead: [
      "Esta página responde cada día a una pregunta: **si hoy es festivo en Cataluña**. También dice si lo es mañana, cuándo cae el próximo festivo y en qué municipios es hoy fiesta local.",
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
      "Whether today and tomorrow are public holidays in Barcelona and the rest of Catalonia, the next holiday, and which towns have a local holiday today.",
    excerpt:
      "Today's answer, tomorrow's, the next holiday and where it is a local holiday today, from the Catalan government's official calendar.",
    lead: [
      "This page answers one question every day: **whether today is a public holiday in Catalonia**. It also says whether tomorrow is, when the next one falls, and which towns have a local holiday today.",
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

  copy.lead.forEach((text, index) => {
    blocks.push({ type: "paragraph", text, ...(index === 0 ? { lead: true } : {}) });
  });

  // The answer comes before any prose. Somebody who typed "is it a holiday
  // today" should not have to read an introduction to find out.
  blocks.push({ type: "holidayToday" });

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

  // How it works first for the reader who wants the rule; the local section
  // right after, because "is it a holiday in my town" is the next question.
  section(copy.localTitle, local);
  section(copy.howTitle, copy.how);
  section(copy.weekendTitle, copy.weekend);

  blocks.push(faqBlock(locale));
  blocks.push({ type: "paragraph", text: copy.plannerLine });

  return blocks;
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
      { question: "Avui és festiu a Catalunya?", answer: "El requadre del principi ho respon cada dia amb el calendari oficial de la Generalitat: si avui és un dels dotze festius de tot Catalunya i a quins municipis és avui festa local. Si no n'hi surt cap, avui és feiner a tot Catalunya." },
      { question: "Demà és festiu a Catalunya?", answer: "Ho diu la línia «Demà és festiu?» del requadre, i a sota hi ha els municipis on demà és festa local. Un dia només és festiu a tot Catalunya si és un dels dotze del calendari de la Generalitat (Ordre EMT/66/2025 per al 2026 i Ordre EMT/52/2026 per al 2027)." },
      { question: "On és festiu avui a Catalunya?", answer: `On avui és festa local: cada municipi en fixa dues l'any (Ordre EMT/208/2025, modificada per l'Ordre EMT/3/2026), i el requadre en dona la llista del dia.${dates ? ` Els dies amb més festes locals que vénen són ${dates}.` : ""}` },
      { question: "Avui és festiu a Barcelona?", answer: `Barcelona fa els dotze festius de tot Catalunya i dues festes locals: el ${YEAR_2026} van ser ${bcnList(bcn2026, "ca")}, i el 2027 són ${bcnList(BARCELONA_LOCAL.map((h) => h.date), "ca")}. Tot l'any, a [festius de Barcelona](/ca/festius/barcelona/).` },
    ],
    es: [
      { question: "¿Hoy es festivo en Cataluña?", answer: "El recuadro del principio lo responde cada día con el calendario oficial de la Generalitat: si hoy es uno de los doce festivos de toda Cataluña y en qué municipios es hoy fiesta local. Si no aparece ninguno, hoy es laborable en toda Cataluña." },
      { question: "¿Mañana es festivo en Cataluña?", answer: "Lo dice la línea «¿Mañana es festivo?» del recuadro, y debajo están los municipios donde mañana es fiesta local. Un día solo es festivo en toda Cataluña si es uno de los doce del calendario de la Generalitat (Orden EMT/66/2025 para 2026 y Orden EMT/52/2026 para 2027)." },
      { question: "¿Dónde es festivo hoy en Cataluña?", answer: `Donde hoy es fiesta local: cada municipio fija dos al año (Orden EMT/208/2025, modificada por la Orden EMT/3/2026), y el recuadro da la lista del día.${dates ? ` Los días con más fiestas locales que vienen son ${dates}.` : ""}` },
      { question: "¿Hoy es festivo en Barcelona?", answer: `Barcelona tiene los doce festivos de toda Cataluña y dos fiestas locales: en ${YEAR_2026} fueron ${bcnList(bcn2026, "es")}, y en 2027 son ${bcnList(BARCELONA_LOCAL.map((h) => h.date), "es")}. Todo el año, en [festivos de Barcelona](/es/festivos/barcelona/).` },
    ],
    en: [
      { question: "Is today a public holiday in Catalonia?", answer: "The box at the top answers that every day from the Catalan government's official calendar: whether today is one of the twelve Catalonia-wide holidays and which towns have a local holiday today. If none is listed, today is a working day everywhere in Catalonia." },
      { question: "Is tomorrow a holiday in Catalonia?", answer: "The \"Is tomorrow a holiday?\" line in the box says so, with the towns where tomorrow is a local holiday listed below it. A day is a holiday across Catalonia only if it is one of the twelve in the Catalan government's calendar (Order EMT/66/2025 for 2026, Order EMT/52/2026 for 2027)." },
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
