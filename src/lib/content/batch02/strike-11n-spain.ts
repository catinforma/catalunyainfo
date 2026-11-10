import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import { b2href, faq, h2, lead, list, table, type B2Edition, type B2UnkeyedArticle } from "./shared";
import { strikePhase } from "./strike-11n";
import { STRIKE_URLS } from "./strikes";
import { CITY_HERO, NATIONAL_SOURCES, localizeCity } from "./strike-11n-cities";
import { CITIES, STRIKE_11N_CITIES_AS_OF, STRIKE_11N_CITIES_VERIFIED } from "./strike-11n-cities-data";

/**
 * "Huelga general 11 de noviembre en España: ciudad por ciudad" (9 Nov 2026),
 * in Catalan and English too since 10 Nov 2026.
 *
 * GSC 7-9 Nov: the place-less Spanish queries ("huelga general 11 noviembre",
 * "la huelga del 11 de noviembre es en toda España", "manifestacion 11
 * noviembre") landed on the Sevilla city page at position 9-12, because the
 * 11N guide speaks about Catalonia. This page answers them for all of Spain
 * from the city registry (strike-11n-cities-data.ts, with the Catalan and
 * English words of strike-11n-cities-i18n/): no fact of its own beyond the
 * date and hours, which every city page already states. It follows
 * STRIKE_11N_CITIES_AS_OF, so the timed switch (before / today / past)
 * changes it with the city pages, and it is published with `strike-11n-cities`.
 */
const link = (href: string, label: string) => `[${label}](${href})`;

export const STRIKE_11N_SPAIN_PATHS: Record<Locale, string> = {
  ca: "guies/vaga-general-11-novembre-espanya",
  es: "guias/huelga-general-11-noviembre-espana",
  en: "guides/general-strike-11-november-spain-by-city",
};

function leadText(asOf: string, locale: Locale): string {
  const phase = strikePhase(asOf);
  if (locale === "ca") {
    const who = "convocada per CCOO i UGT, amb la CGT, la CNT i altres organitzacions, per a totes les activitats, públiques i privades";
    if (phase === "past") return `**El dimecres 11 de novembre de 2026 hi va haver vaga general de 24 hores a tot Espanya,** ${who}. Aquests van ser, ciutat per ciutat, els serveis mínims publicats i les manifestacions convocades.`;
    if (phase === "today") return `**Avui, dimecres 11 de novembre, hi ha vaga general de 24 hores a tot Espanya:** ha començat a les 0 h i acaba a les 24 h, ${who}. Ciutat per ciutat, els serveis mínims publicats i les manifestacions convocades.`;
    return `**El dimecres 11 de novembre de 2026 hi ha vaga general de 24 hores a tot Espanya,** de 0 a 24 h, ${who}. Aquí tens, ciutat per ciutat, els serveis mínims publicats i les manifestacions convocades.`;
  }
  if (locale === "en") {
    const who = "called by CCOO and UGT, with CGT, CNT and other organisations, for every activity, public and private";
    if (phase === "past") return `**On Wednesday 11 November 2026 there was a 24-hour general strike across Spain,** ${who}. These were, city by city, the minimum services published and the demonstrations called.`;
    if (phase === "today") return `**Today, Wednesday 11 November, there is a 24-hour general strike across Spain:** it began at 0 h and ends at 24 h, ${who}. City by city, the minimum services published and the demonstrations called.`;
    return `**On Wednesday 11 November 2026 there is a 24-hour general strike across Spain,** from 0 to 24 h, ${who}. Here, city by city, are the minimum services published and the demonstrations called.`;
  }
  const who = "convocada por CCOO y UGT, con CGT, CNT y otras organizaciones, para todas las actividades, públicas y privadas";
  if (phase === "past") return `**El miércoles 11 de noviembre de 2026 hubo huelga general de 24 horas en toda España,** ${who}. Estos fueron, ciudad por ciudad, los servicios mínimos publicados y las manifestaciones convocadas.`;
  if (phase === "today") return `**Hoy, miércoles 11 de noviembre, hay huelga general de 24 horas en toda España:** empezó a las 0 h y acaba a las 24 h, ${who}. Ciudad por ciudad, los servicios mínimos publicados y las manifestaciones convocadas.`;
  return `**El miércoles 11 de noviembre de 2026 hay huelga general de 24 horas en toda España,** de 0 a 24 h, ${who}. Aquí tienes, ciudad por ciudad, los servicios mínimos publicados y las manifestaciones convocadas.`;
}

/** The copy of the page, per language; the facts come from the city registry. */
const COPY = {
  es: {
    catalonia: "Barcelona y Cataluña",
    cataloniaMs: "Publicados por la Generalitat: en la guía, sector por sector",
    barcelonaDemo: "Barcelona: a las 17.30 h, desde los Jardinets de Gràcia",
    notPublished: "Aún no publicados",
    noDemo: "Sin hora ni lugar publicados",
    caption: "Huelga general del 11 de noviembre: servicios mínimos y manifestaciones por ciudad",
    headers: ["Ciudad", "Servicios mínimos", "Manifestación"],
    note: "Cada ciudad enlaza a su página, con la orden de servicios mínimos, quién la fija y dónde se consulta.",
    stateHeading: "Trenes, aviones y oficinas del Estado",
    state: (rail: string) =>
      `Los servicios mínimos de los trenes de Renfe de alta velocidad y larga distancia y de los vuelos los fija el Ministerio de Transportes por resolución: compruébalos en su ${link(rail, "lista de resoluciones ferroviarias")} y, el mismo día, en renfe.com o en tu compañía aérea. Cada página de ciudad dice en qué punto están.`,
    cataloniaLine: (href: string) => `En Cataluña, Rodalies, metro, autobuses, escuelas y hospitales tienen servicios mínimos de la Generalitat: los tienes en ${link(href, "la guía de la huelga en Cataluña")}.`,
    demosHeading: "Manifestaciones convocadas",
    barcelonaItem: (href: string) => `**Barcelona:** a las 17.30 h, desde los Jardinets de Gràcia (${link(href, "más en la guía de Cataluña")}).`,
    faq: [
      {
        question: "¿La huelga del 11 de noviembre es en toda España?",
        answer: "Sí. Es una huelga general de 24 horas en todo el Estado, para todas las actividades, públicas y privadas, convocada por CCOO y UGT con CGT, CNT y otras organizaciones.",
      },
      {
        question: "¿A qué hora empieza y acaba la huelga general?",
        answer: "De las 0 a las 24 h del miércoles 11 de noviembre de 2026, con adaptaciones en los trabajos a turnos.",
      },
      {
        question: "¿Hay servicios mínimos en mi ciudad?",
        answer: "Los fija cada comunidad autónoma (transporte urbano, sanidad, educación) y el Ministerio de Transportes (trenes de larga distancia y vuelos). En la tabla tienes el estado en cada ciudad, con el enlace a su página.",
      },
    ],
  },
  ca: {
    catalonia: "Barcelona i Catalunya",
    cataloniaMs: "Publicats per la Generalitat: a la guia, sector per sector",
    barcelonaDemo: "Barcelona: a les 17.30 h, des dels Jardinets de Gràcia",
    notPublished: "Encara no publicats",
    noDemo: "Sense hora ni lloc publicats",
    caption: "Vaga general de l'11 de novembre: serveis mínims i manifestacions per ciutat",
    headers: ["Ciutat", "Serveis mínims", "Manifestació"],
    note: "Cada ciutat enllaça a la seva pàgina, amb l'ordre de serveis mínims, qui la fixa i on es consulta.",
    stateHeading: "Trens, avions i oficines de l'Estat",
    state: (rail: string) =>
      `Els serveis mínims dels trens de Renfe d'alta velocitat i llarga distància i dels vols els fixa el Ministeri de Transports per resolució: comprova'ls a la seva ${link(rail, "llista de resolucions ferroviàries")} i, el mateix dia, a renfe.com o a la teva companyia aèria. Cada pàgina de ciutat diu en quin punt són.`,
    cataloniaLine: (href: string) => `A Catalunya, Rodalies, metro, autobusos, escoles i hospitals tenen serveis mínims de la Generalitat: els tens a ${link(href, "la guia de la vaga a Catalunya")}.`,
    demosHeading: "Manifestacions convocades",
    barcelonaItem: (href: string) => `**Barcelona:** a les 17.30 h, des dels Jardinets de Gràcia (${link(href, "més a la guia de Catalunya")}).`,
    faq: [
      {
        question: "La vaga de l'11 de novembre és a tot Espanya?",
        answer: "Sí. És una vaga general de 24 hores a tot l'Estat, per a totes les activitats, públiques i privades, convocada per CCOO i UGT amb la CGT, la CNT i altres organitzacions.",
      },
      {
        question: "A quina hora comença i acaba la vaga general?",
        answer: "De les 0 a les 24 h del dimecres 11 de novembre de 2026, amb adaptacions en els treballs per torns.",
      },
      {
        question: "Hi ha serveis mínims a la meva ciutat?",
        answer: "Els fixa cada comunitat autònoma (transport urbà, sanitat, educació) i el Ministeri de Transports (trens de llarga distància i vols). A la taula tens l'estat a cada ciutat, amb l'enllaç a la seva pàgina.",
      },
    ],
  },
  en: {
    catalonia: "Barcelona and Catalonia",
    cataloniaMs: "Published by the Generalitat: in the guide, sector by sector",
    barcelonaDemo: "Barcelona: at 17.30, from the Jardinets de Gràcia",
    notPublished: "Not published yet",
    noDemo: "No time or place published",
    caption: "General strike on 11 November: minimum services and demonstrations by city",
    headers: ["City", "Minimum services", "Demonstration"],
    note: "Each city links to its own page, with the minimum-services order, who sets it and where to check it.",
    stateHeading: "Trains, flights and State offices",
    state: (rail: string) =>
      `Minimum services for Renfe's high-speed and long-distance trains and for flights are set by the Ministry of Transport by resolution: check them in its ${link(rail, "list of rail resolutions")} and, on the day, on renfe.com or with your airline. Each city page says where they stand.`,
    cataloniaLine: (href: string) => `In Catalonia, Rodalies, the metro, buses, schools and hospitals have minimum services set by the Generalitat: they are in ${link(href, "the guide to the strike in Catalonia")}.`,
    demosHeading: "Demonstrations called",
    barcelonaItem: (href: string) => `**Barcelona:** at 17.30, from the Jardinets de Gràcia (${link(href, "more in the Catalonia guide")}).`,
    faq: [
      {
        question: "Is the 11 November strike across the whole of Spain?",
        answer: "Yes. It is a 24-hour general strike across the country, for every activity, public and private, called by CCOO and UGT with CGT, CNT and other organisations.",
      },
      {
        question: "What time does the general strike start and end?",
        answer: "From 0 to 24 h on Wednesday 11 November 2026, adapted for shift work.",
      },
      {
        question: "Are there minimum services in my city?",
        answer: "Each autonomous community sets them (urban transport, healthcare, education), and the Ministry of Transport sets those for long-distance trains and flights. The table shows where they stand in each city, with a link to its page.",
      },
    ],
  },
} as const;

export function buildSpainBody(asOf: string = STRIKE_11N_CITIES_AS_OF, locale: Locale = "es"): Block[] {
  const t = COPY[locale];
  const catalonia = b2href("strike11n", locale);
  const cities = CITIES.map((city) => localizeCity(city, locale));
  const rows = cities.map((city) => [link(`/${locale}/${city.path}/`, city.name), city.msSummary ?? t.notPublished, city.demoShort ?? t.noDemo]);
  rows.push([link(catalonia, t.catalonia), t.cataloniaMs, t.barcelonaDemo]);
  const demos = cities.filter((city) => city.demoShort).map((city) => `**${city.name}:** ${city.demoShort}.`);
  return [
    lead(leadText(asOf, locale)),
    table(t.caption, [...t.headers], rows, t.note),
    ...h2(t.stateHeading, t.state(STRIKE_URLS.ministryRail), t.cataloniaLine(catalonia)),
    ...h2(t.demosHeading),
    list(...demos, t.barcelonaItem(catalonia)),
    faq(t.faq.map((item) => ({ ...item }))),
  ];
}

const EDITION_COPY: Record<Locale, Omit<B2Edition, "path" | "blocks">> = {
  es: {
    title: "Huelga general del 11 de noviembre en España: servicios mínimos y manifestaciones, ciudad por ciudad",
    seoTitle: "Huelga general 11 noviembre en España: ciudad por ciudad",
    seoDescription: "Miércoles 11 de noviembre, de 0 a 24 h, en toda España. Servicios mínimos y manifestaciones en Madrid, Valencia, Sevilla, Bilbao y más ciudades.",
    excerpt: "La huelga general del 11 de noviembre de 2026 en toda España: servicios mínimos y manifestaciones en Madrid, Valencia, Sevilla, Bilbao, Barcelona y más ciudades.",
  },
  ca: {
    title: "Vaga general de l'11 de novembre a Espanya: serveis mínims i manifestacions, ciutat per ciutat",
    seoTitle: "Vaga general 11 novembre a Espanya: ciutat per ciutat",
    seoDescription: "Dimecres 11 de novembre, de 0 a 24 h, a tot Espanya. Serveis mínims i manifestacions a Madrid, València, Sevilla, Bilbao i més ciutats.",
    excerpt: "La vaga general de l'11 de novembre de 2026 a tot Espanya: serveis mínims i manifestacions a Madrid, València, Sevilla, Bilbao, Barcelona i més ciutats.",
  },
  en: {
    title: "General strike on 11 November in Spain: minimum services and demonstrations, city by city",
    seoTitle: "General strike 11 November in Spain: city by city",
    seoDescription: "Wednesday 11 November, from 0 to 24 h, across Spain. Minimum services and demonstrations in Madrid, Valencia, Seville, Bilbao and more cities.",
    excerpt: "The general strike of 11 November 2026 across Spain: minimum services and demonstrations in Madrid, Valencia, Seville, Bilbao, Barcelona and more cities.",
  },
};

function spainEdition(locale: Locale): B2Edition {
  return { path: STRIKE_11N_SPAIN_PATHS[locale], ...EDITION_COPY[locale], blocks: buildSpainBody(STRIKE_11N_CITIES_AS_OF, locale) };
}

export const STRIKE_11N_SPAIN: B2UnkeyedArticle = {
  entryKey: "guide-general-strike-11-november-2026-spain",
  categoryKey: "public-services",
  sources: NATIONAL_SOURCES,
  heroKey: CITY_HERO.key,
  heroAlt: { ...CITY_HERO.alt },
  heroCaption: { ...CITY_HERO.caption },
  verifiedAt: STRIKE_11N_CITIES_VERIFIED,
  publishedAt: "2026-11-09T12:00:00+01:00",
  editions: { ca: spainEdition("ca"), es: spainEdition("es"), en: spainEdition("en") },
};
