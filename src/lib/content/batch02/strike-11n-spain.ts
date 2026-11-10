import type { Block } from "@/lib/content/blocks";

import { faq, h2, lead, list, table, type B2SpanishArticle } from "./shared";
import { strikePhase } from "./strike-11n";
import { STRIKE_URLS } from "./strikes";
import { CITY_HERO, NATIONAL_SOURCES } from "./strike-11n-cities";
import { CITIES, STRIKE_11N_CITIES_AS_OF, STRIKE_11N_CITIES_VERIFIED } from "./strike-11n-cities-data";

/**
 * "Huelga general 11 de noviembre en España: ciudad por ciudad" (9 Nov 2026).
 *
 * GSC 7-9 Nov: the place-less Spanish queries ("huelga general 11 noviembre",
 * "la huelga del 11 de noviembre es en toda España", "manifestacion 11
 * noviembre") landed on the Sevilla city page at position 9-12, because the
 * 11N guide speaks about Catalonia. This page answers them for all of Spain
 * from the city registry (strike-11n-cities-data.ts): no fact of its own
 * beyond the date and hours, which every city page already states. It follows
 * STRIKE_11N_CITIES_AS_OF, so the timed switch (before / today / past)
 * changes it with the city pages, and it is published with `strike-11n-cities`.
 */
const link = (href: string, label: string) => `[${label}](${href})`;
const CATALONIA = "/es/guias/huelga-general-11-noviembre/";
const PATH = "guias/huelga-general-11-noviembre-espana";

function leadText(asOf: string): string {
  const phase = strikePhase(asOf);
  const who = "convocada por CCOO y UGT, con CGT, CNT y otras organizaciones, para todas las actividades, públicas y privadas";
  if (phase === "past") return `**El miércoles 11 de noviembre de 2026 hubo huelga general de 24 horas en toda España,** ${who}. Estos fueron, ciudad por ciudad, los servicios mínimos publicados y las manifestaciones convocadas.`;
  if (phase === "today") return `**Hoy, miércoles 11 de noviembre, hay huelga general de 24 horas en toda España:** empezó a las 0 h y acaba a las 24 h, ${who}. Ciudad por ciudad, los servicios mínimos publicados y las manifestaciones convocadas.`;
  return `**El miércoles 11 de noviembre de 2026 hay huelga general de 24 horas en toda España,** de 0 a 24 h, ${who}. Aquí tienes, ciudad por ciudad, los servicios mínimos publicados y las manifestaciones convocadas.`;
}

export function buildSpainBody(asOf: string = STRIKE_11N_CITIES_AS_OF): Block[] {
  const rows = CITIES.map((city) => [
    link(`/es/${city.path}/`, city.name),
    city.msSummary ?? "Aún no publicados",
    city.demoShort ?? "Sin hora ni lugar publicados",
  ]);
  rows.push([
    link(CATALONIA, "Barcelona y Cataluña"),
    "Publicados por la Generalitat: en la guía, sector por sector",
    "Barcelona: a las 17.30 h, desde los Jardinets de Gràcia",
  ]);
  const demos = CITIES.filter((city) => city.demoShort).map((city) => `**${city.name}:** ${city.demoShort}.`);
  return [
    lead(leadText(asOf)),
    table(
      "Huelga general del 11 de noviembre: servicios mínimos y manifestaciones por ciudad",
      ["Ciudad", "Servicios mínimos", "Manifestación"],
      rows,
      "Cada ciudad enlaza a su página, con la orden de servicios mínimos, quién la fija y dónde se consulta.",
    ),
    ...h2(
      "Trenes, aviones y oficinas del Estado",
      `Los servicios mínimos de los trenes de Renfe de alta velocidad y larga distancia y de los vuelos los fija el Ministerio de Transportes por resolución: compruébalos en su ${link(STRIKE_URLS.ministryRail, "lista de resoluciones ferroviarias")} y, el mismo día, en renfe.com o en tu compañía aérea. Cada página de ciudad dice en qué punto están.`,
      `En Cataluña, Rodalies, metro, autobuses, escuelas y hospitales tienen servicios mínimos de la Generalitat: los tienes en ${link(CATALONIA, "la guía de la huelga en Cataluña")}.`,
    ),
    ...h2("Manifestaciones convocadas"),
    list(...demos, `**Barcelona:** a las 17.30 h, desde los Jardinets de Gràcia (${link(CATALONIA, "más en la guía de Cataluña")}).`),
    faq([
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
    ]),
  ];
}

export const STRIKE_11N_SPAIN: B2SpanishArticle = {
  entryKey: "guide-general-strike-11-november-2026-spain",
  categoryKey: "public-services",
  sources: NATIONAL_SOURCES,
  heroKey: CITY_HERO.key,
  heroAlt: { ...CITY_HERO.alt },
  heroCaption: { ...CITY_HERO.caption },
  verifiedAt: STRIKE_11N_CITIES_VERIFIED,
  publishedAt: "2026-11-09T12:00:00+01:00",
  editions: {
    es: {
      path: PATH,
      title: "Huelga general del 11 de noviembre en España: servicios mínimos y manifestaciones, ciudad por ciudad",
      seoTitle: "Huelga general 11 noviembre en España: ciudad por ciudad",
      seoDescription: "Miércoles 11 de noviembre, de 0 a 24 h, en toda España. Servicios mínimos y manifestaciones en Madrid, Valencia, Sevilla, Bilbao y más ciudades.",
      excerpt: "La huelga general del 11 de noviembre de 2026 en toda España: servicios mínimos y manifestaciones en Madrid, Valencia, Sevilla, Bilbao, Barcelona y más ciudades.",
      blocks: buildSpainBody(),
    },
  },
};
