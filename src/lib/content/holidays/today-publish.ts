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

import { CALENDAR_VERIFIED_AT, HOLIDAY_SOURCE } from "./calendar";
import { COPY as CALENDAR_COPY } from "./copy";

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
    seoTitle: "És festiu avui a Catalunya? Resposta i pròxims festius",
    seoDescription:
      "Comprova si avui o demà és festiu a Catalunya, quin és el pròxim dia festiu i la llista completa de festius oficials.",
    excerpt:
      "La resposta d'avui, la de demà i el pròxim festiu, amb el calendari oficial de la Generalitat.",
    lead: [
      "Aquesta pàgina respon una sola pregunta: **si el dia d'avui és festiu a Catalunya**. També diu si ho és demà i quan cau el pròxim.",
    ],
    howTitle: "Com funcionen els festius a Catalunya",
    how: [
      "Cada any la Generalitat fixa **dotze dies festius** per a tot Catalunya. Són retribuïts i no recuperables.",
      "Tres d'aquests dotze es mouen cada any perquè depenen de la Pasqua: Divendres Sant, Dilluns de Pasqua Florida i, segons l'any, alguna altra data vinculada. La resta són fixos.",
      "El calendari s'aprova any per any, així que no es poden saber amb antelació il·limitada.",
    ],
    localTitle: "Els dos dies que no surten aquí",
    local: [
      "A banda dels dotze dies de tot Catalunya, **cada municipi en fixa dos més**, que són els seus festius locals. Varien de poble a poble i no formen part d'aquesta llista.",
      "Si el que vols saber és si demà obre la teva oficina o la teva escola, mira també el calendari del teu municipi: la resposta pot ser diferent de la d'aquesta pàgina.",
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
    seoTitle: "¿Es festivo hoy en Cataluña? Respuesta y próximos festivos",
    seoDescription:
      "Comprueba si hoy o mañana es festivo en Cataluña, cuándo cae el próximo día festivo y la lista completa de festivos oficiales.",
    excerpt:
      "La respuesta de hoy, la de mañana y el próximo festivo, con el calendario oficial de la Generalitat.",
    lead: [
      "Esta página responde a una sola pregunta: **si hoy es festivo en Cataluña**. También dice si lo es mañana y cuándo cae el próximo.",
    ],
    howTitle: "Cómo funcionan los festivos en Cataluña",
    how: [
      "Cada año la Generalitat fija **doce días festivos** para toda Cataluña. Son retribuidos y no recuperables.",
      "Tres de esos doce se mueven cada año porque dependen de la Pascua: Viernes Santo, Lunes de Pascua y, según el año, alguna otra fecha vinculada. El resto son fijos.",
      "El calendario se aprueba año a año, así que no puede conocerse con antelación ilimitada.",
    ],
    localTitle: "Los dos días que no salen aquí",
    local: [
      "Además de los doce días de toda Cataluña, **cada municipio fija dos más**, que son sus festivos locales. Varían de un pueblo a otro y no forman parte de esta lista.",
      "Si lo que quieres saber es si mañana abre tu oficina o tu colegio, consulta también el calendario de tu municipio: la respuesta puede ser distinta de la de esta página.",
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
    seoTitle: "Is today a public holiday in Catalonia? Live answer",
    seoDescription:
      "Check whether today or tomorrow is a public holiday in Catalonia, when the next one falls, and the full list of official holidays.",
    excerpt:
      "Today's answer, tomorrow's, and the next holiday, from the Catalan government's official calendar.",
    lead: [
      "This page answers one question: **whether today is a public holiday in Catalonia**. It also says whether tomorrow is, and when the next one falls.",
    ],
    howTitle: "How public holidays work in Catalonia",
    how: [
      "Each year the Catalan government sets **twelve public holidays** for the whole of Catalonia. They are paid and cannot be made up later.",
      "Three of the twelve move each year because they follow Easter: Good Friday, Easter Monday and, depending on the year, a related date. The rest are fixed.",
      "The calendar is approved one year at a time, so it cannot be known indefinitely far ahead.",
    ],
    localTitle: "The two days this page does not cover",
    local: [
      "On top of the twelve Catalonia-wide days, **every municipality sets two more** as its local holidays. They differ from town to town and are not in this list.",
      "If what you need to know is whether an office or a school is open tomorrow, check the municipal calendar as well: the answer can differ from this page.",
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

  section(copy.howTitle, copy.how);
  section(copy.localTitle, copy.local);
  section(copy.weekendTitle, copy.weekend);

  blocks.push({ type: "paragraph", text: copy.plannerLine });

  return blocks;
}

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
