import type { Locale } from "@/lib/i18n/config";

import {
  ANNOUNCED_2026,
  DAYS,
  FESTIVE_VERIFIED,
  LIGHTS_PLAN_2026,
  PAST,
  SIGHT_SOURCES,
  WATCH,
  dateYear,
  dayDate,
  metroRows,
  sightRows,
  span,
  type Announcement,
  type Announcements,
} from "./festive";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Christmas in Barcelona 2026: the hub over the lights, the nativity scene,
 * the markets guide, what is open on the holidays and the New Year page.
 *
 * Every date comes from `festive.ts` (checked 25 Oct 2026). Nothing for
 * 2026-27 had been announced that day except the lighting plan of 9 July, so
 * the leads say "not announced yet" and give last year's dates with their
 * year. Filling ANNOUNCED_2026 switches them to the official date.
 *
 * The markets are not repeated here: the Christmas markets guide carries them.
 * No new photograph: the hero is the Christmas-lights picture already in the
 * manifest (the shops guide's lead image), because the publisher refuses an
 * article without one.
 */

const SOURCES: B2Source[] = [
  { name: "Barcelona consolida el festival de Llums de Nadal (pla del 2026)", url: LIGHTS_PLAN_2026.url, publisher: "Ajuntament de Barcelona" },
  { name: "Barcelona encendrà els llums de Nadal el dissabte 22 de novembre (2025)", url: PAST.lights2025.url, publisher: "Ajuntament de Barcelona" },
  { name: "Barcelona prepara un Nadal amb més llums (2024)", url: PAST.lights2024.url, publisher: "Ajuntament de Barcelona" },
  { name: "Barcelona vibra amb la màgia del Nadal (programa del 2025)", url: PAST.programme2025.url, publisher: "Ajuntament de Barcelona" },
  { name: "Pessebre tradicional de Sant Jaume 2025", url: PAST.pessebre2025.url, publisher: "Ajuntament de Barcelona" },
  { name: "El Pessebre tradicional de Barcelona 2024 es trasllada a l'Ajuntament", url: PAST.pessebre2024.url, publisher: "Ajuntament de Barcelona" },
  { name: "Nadal a Barcelona", url: WATCH.christmasSite, publisher: "Ajuntament de Barcelona" },
  { name: "Servei de Premsa: Nadal 2026", url: WATCH.pressTag, publisher: "Ajuntament de Barcelona" },
  { name: "Tradicions de Nadal", url: "https://www.barcelona.cat/nadal/ca/tradicions/tradicions-de-nadal", publisher: "Ajuntament de Barcelona" },
  { name: "Metro and bus opening hours", url: WATCH.tmbHours, publisher: "TMB" },
  { name: "Horaris especials del metro i els autobusos de TMB la vigília de Nadal (2025)", url: PAST.tmbChristmas2025.url, publisher: "Ajuntament de Barcelona / TMB" },
  { name: "Calendari de festes laborals 2026", url: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2026/", publisher: "Generalitat de Catalunya" },
  { name: "Calendari de festes laborals 2027", url: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2027/", publisher: "Generalitat de Catalunya" },
  { name: "Llei 18/2017, de comerç, serveis i fires (articles 36 i 37)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11320", publisher: "BOE" },
  { name: "Resolució EMT/4342/2025, dies d'obertura comercial dels municipis per al 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1030324&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Sagrada Família: schedules", url: SIGHT_SOURCES.sagradaFamilia, publisher: "Junta Constructora del Temple de la Sagrada Família" },
  { name: "La Pedrera: practical information", url: SIGHT_SOURCES.pedrera, publisher: "Fundació Catalunya La Pedrera" },
  { name: "Casa Batlló: opening hours", url: SIGHT_SOURCES.batllo, publisher: "Casa Batlló" },
  { name: "MNAC: horaris i preus", url: SIGHT_SOURCES.mnac, publisher: "Museu Nacional d'Art de Catalunya" },
  { name: "Museu Picasso: tickets and opening hours", url: SIGHT_SOURCES.picasso, publisher: "Museu Picasso" },
  { name: "The traditional method", url: "https://www.cava.wine/en/origin-cava/traditional-method-champenoise/", publisher: "D.O. Cava" },
  { name: "Cava zones", url: "https://www.cava.wine/en/origin-cava/4-zones/", publisher: "D.O. Cava" },
];

export const CHRISTMAS_BARCELONA_META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/nadal-a-barcelona",
    title: "Nadal a Barcelona 2026: llums, pessebre de Sant Jaume i què obre",
    seoTitle: "Nadal a Barcelona 2026: encesa de llums i què obre",
    seoDescription:
      "L'encesa dels llums de Nadal de Barcelona 2026, els carrers il·luminats, el pessebre de Sant Jaume i què obre el 25 i 26 de desembre i l'1 i 6 de gener.",
    excerpt:
      "El Nadal a Barcelona el 2026: l'encesa dels llums i els carrers, el pessebre de la plaça de Sant Jaume, què obre els festius, el metro i les tradicions.",
  },
  es: {
    path: "guias/navidad-en-barcelona",
    title: "Navidad en Barcelona 2026: luces, belén de Sant Jaume y qué abre",
    seoTitle: "Navidad en Barcelona 2026: encendido de luces y qué abre",
    seoDescription:
      "Encendido de las luces de Navidad de Barcelona 2026, calles iluminadas, el belén de Sant Jaume y qué abre el 25 y 26 de diciembre y el 1 y 6 de enero.",
    excerpt:
      "La Navidad en Barcelona en 2026: el encendido de las luces y sus calles, el belén de la plaza de Sant Jaume, qué abre los festivos, el metro y las tradiciones.",
  },
  en: {
    path: "guides/christmas-in-barcelona",
    title: "Christmas in Barcelona 2026: lights, nativity scene and what's open",
    seoTitle: "Christmas in Barcelona 2026: lights and what's open",
    seoDescription:
      "Barcelona Christmas lights 2026: switch-on date and streets, the Plaça Sant Jaume nativity scene, and what is open on 25-26 December and 1 and 6 January.",
    excerpt:
      "Christmas in Barcelona in 2026: the lights switch-on and the lit streets, the nativity scene, what is open on the holidays, the metro and the traditions.",
  },
};

/* -------------------------------------------------------------------------- */
/* Sentences that change when a date is announced                             */
/* -------------------------------------------------------------------------- */

export function when(item: Announcement, locale: Locale): string {
  const time = item.time ? (locale === "en" ? ` at ${item.time}` : locale === "es" ? ` a las ${item.time}` : ` a les ${item.time}`) : "";
  const place = item.place ? ` (${item.place[locale]})` : "";
  return `${locale === "en" ? "" : "el "}${dayDate(item.date, locale)}${time}${place}`;
}

export const CHECKED: Record<Locale, string> = {
  ca: `comprovat el ${dateYear(FESTIVE_VERIFIED, "ca")}`,
  es: `comprobado el ${dateYear(FESTIVE_VERIFIED, "es")}`,
  en: `checked on ${dateYear(FESTIVE_VERIFIED, "en")}`,
};

export function lightsLead(locale: Locale, facts: Announcements = ANNOUNCED_2026): string {
  const a = facts.lightsSwitchOn;
  const plan: Record<Locale, string> = {
    ca: `Per a enguany preveu ${LIGHTS_PLAN_2026.km} km de carrers il·luminats, amb els llums d'autor de nou a cinc carrers del centre i dos emplaçaments nous: la Rambla de Prim i el passeig de Maragall.`,
    es: `Para este año prevé ${LIGHTS_PLAN_2026.km} km de calles iluminadas, con las luces de autor de nuevo en cinco calles del centro y dos emplazamientos nuevos: la Rambla de Prim y el paseo de Maragall.`,
    en: `This year it plans ${LIGHTS_PLAN_2026.km} km of lit streets, with designer lights back on five central streets and in two new places, Rambla de Prim and Passeig de Maragall.`,
  };
  if (a) {
    const head: Record<Locale, string> = {
      ca: `**Barcelona encén els llums de Nadal ${when(a, "ca")}**, segons ha anunciat l'Ajuntament.`,
      es: `**Barcelona enciende las luces de Navidad ${when(a, "es")}**, según ha anunciado el Ayuntamiento.`,
      en: `**Barcelona switches on its Christmas lights on ${when(a, "en")}**, the City Council has announced.`,
    };
    return `${head[locale]} ${plan[locale]}`;
  }
  const s = PAST.lights2025;
  const head: Record<Locale, string> = {
    ca: `**L'Ajuntament encara no ha anunciat la data de l'encesa dels llums de Nadal de Barcelona 2026** (${CHECKED.ca}). L'any passat la va anunciar el ${dateYear(s.announced, "ca").replace(/ de \d{4}$/, "")} i va encendre els llums el ${dayDate(s.switchOn, "ca")} al passeig de Gràcia.`,
    es: `**El Ayuntamiento aún no ha anunciado la fecha del encendido de las luces de Navidad de Barcelona 2026** (${CHECKED.es}). El año pasado la anunció el ${dateYear(s.announced, "es").replace(/ de \d{4}$/, "")} y encendió las luces el ${dayDate(s.switchOn, "es")} en el paseo de Gràcia.`,
    en: `**Barcelona has not announced the date of its 2026 Christmas lights switch-on yet** (${CHECKED.en}). Last year the date came out on ${dateYear(s.announced, "en").replace(/ \d{4}$/, "")} and the switch-on was on ${dayDate(s.switchOn, "en")}, on Passeig de Gràcia.`,
  };
  return `${head[locale]} ${plan[locale]}`;
}

function switchOnFact(locale: Locale, facts: Announcements): string {
  const a = facts.lightsSwitchOn;
  if (a) return when(a, locale).replace(/^el /, "");
  const past = dayDate(PAST.lights2025.switchOn, locale);
  return { ca: `Encara no s'ha anunciat (el 2025: ${past})`, es: `Aún no se ha anunciado (en 2025: ${past})`, en: `Not announced yet (2025: ${past})` }[locale];
}

function switchOnSection(locale: Locale, facts: Announcements): string {
  const a = facts.lightsSwitchOn;
  const p24 = PAST.lights2024;
  const p25 = PAST.lights2025;
  if (a) {
    return {
      ca: `L'encesa és ${when(a, "ca")}, segons l'[anunci de l'Ajuntament](${a.url}). Les dues anteriors van ser el ${dateYear(p24.switchOn, "ca")} i el ${dateYear(p25.switchOn, "ca")}.`,
      es: `El encendido es ${when(a, "es")}, según el [anuncio del Ayuntamiento](${a.url}). Los dos anteriores fueron el ${dateYear(p24.switchOn, "es")} y el ${dateYear(p25.switchOn, "es")}.`,
      en: `The switch-on is on ${when(a, "en")}, according to the [City Council's announcement](${a.url}). The two before were on ${dateYear(p24.switchOn, "en")} and ${dateYear(p25.switchOn, "en")}.`,
    }[locale];
  }
  return {
    ca: `Encara no. L'Ajuntament fixa la data i l'anuncia a la seva sala de premsa: el ${dateYear(p24.announced, "ca")} va anunciar l'encesa del ${dateYear(p24.switchOn, "ca")}, i el ${dateYear(p25.announced, "ca")}, la del ${dayDate(p25.switchOn, "ca")}, amb un espectacle al passeig de Gràcia. A ${dateYear(FESTIVE_VERIFIED, "ca")} no ha publicat cap data per a enguany.`,
    es: `Todavía no. El Ayuntamiento fija la fecha y la anuncia en su sala de prensa: el ${dateYear(p24.announced, "es")} anunció el encendido del ${dateYear(p24.switchOn, "es")}, y el ${dateYear(p25.announced, "es")}, el del ${dayDate(p25.switchOn, "es")}, con un espectáculo en el paseo de Gràcia. A ${dateYear(FESTIVE_VERIFIED, "es")} no ha publicado ninguna fecha para este año.`,
    en: `Not yet. The City Council sets the date and announces it in its press room: on ${dateYear(p24.announced, "en")} it announced a switch-on on ${dateYear(p24.switchOn, "en")}, and on ${dateYear(p25.announced, "en")} one on ${dayDate(p25.switchOn, "en")}, with a show on Passeig de Gràcia. As of ${dateYear(FESTIVE_VERIFIED, "en")} it has published no date for this year.`,
  }[locale];
}

function pessebreSentence(locale: Locale, facts: Announcements): string {
  const a = facts.pessebre;
  const s = PAST.pessebre2025;
  if (a) {
    const range = a.until ? span(a.date, a.until, locale) : when(a, locale);
    return {
      ca: `**El 2026 es podrà visitar ${range}**, segons l'[Ajuntament](${a.url}).`,
      es: `**En 2026 se podrá visitar ${range}**, según el [Ayuntamiento](${a.url}).`,
      en: `**In 2026 it is open ${range}**, according to the [City Council](${a.url}).`,
    }[locale];
  }
  return {
    ca: `Les dates del 2026 encara no s'han anunciat. El 2025 es va poder visitar ${span(s.from, s.to, "ca")} de 2026, de franc i sense reserva: de dilluns a divendres d'11:00 a 14:00 i de 16:00 a 20:00, els caps de setmana d'11:00 a 20:00, el 26 de desembre d'11:00 a 16:00, i tancat el 25 de desembre i l'1 de gener.`,
    es: `Las fechas de 2026 aún no se han anunciado. En 2025 se pudo visitar ${span(s.from, s.to, "es")} de 2026, gratis y sin reserva: de lunes a viernes de 11:00 a 14:00 y de 16:00 a 20:00, los fines de semana de 11:00 a 20:00, el 26 de diciembre de 11:00 a 16:00, y cerrado el 25 de diciembre y el 1 de enero.`,
    en: `The 2026 dates have not been announced. In 2025 it was open from ${span(s.from, s.to, "en")} 2026, free and without booking: Monday to Friday 11:00 to 14:00 and 16:00 to 20:00, weekends 11:00 to 20:00, 26 December 11:00 to 16:00, and closed on 25 December and 1 January.`,
  }[locale];
}

function santJaumeSentence(locale: Locale, facts: Announcements): string {
  const a = facts.santJaume;
  const s = PAST.santJaume2025;
  if (a) {
    const range = a.until ? span(a.date, a.until, locale) : when(a, locale);
    return {
      ca: `A la plaça, l'Ajuntament i la Generalitat tornen a projectar un espectacle de llum sobre les façanes institucionals ${range} ([anunci](${a.url})).`,
      es: `En la plaza, el Ayuntamiento y la Generalitat vuelven a proyectar un espectáculo de luz sobre las fachadas institucionales ${range} ([anuncio](${a.url})).`,
      en: `Out in the square, the City Council and the Generalitat project a light show on the institutional façades again, ${range} ([announcement](${a.url})).`,
    }[locale];
  }
  return {
    ca: `A la plaça, l'Ajuntament i la Generalitat van projectar una intervenció de llum conjunta sobre les façanes institucionals ${span(s.from, s.to, "ca")} de 2026 (la temporada 2025-26), de 18:30 a 22:00 i fins a les 23:00 els caps de setmana. Per al 2026 tampoc no hi ha dates.`,
    es: `En la plaza, el Ayuntamiento y la Generalitat proyectaron una intervención de luz conjunta sobre las fachadas institucionales ${span(s.from, s.to, "es")} de 2026 (la temporada 2025-26), de 18:30 a 22:00 y hasta las 23:00 los fines de semana. Para 2026 tampoco hay fechas.`,
    en: `Out in the square, the City Council and the Generalitat projected a joint light show on the institutional façades from ${span(s.from, s.to, "en")} 2026 (the 2025-26 season), from 18:30 to 22:00 and until 23:00 at weekends. There are no 2026 dates for it either.`,
  }[locale];
}

export function cavalcadaSentence(locale: Locale, facts: Announcements): string {
  const a = facts.cavalcada;
  if (a) {
    return {
      ca: `La **Cavalcada de Reis** del 2027 és ${when(a, "ca")}, segons l'[Ajuntament](${a.url}).`,
      es: `La **Cabalgata de Reyes** de 2027 es ${when(a, "es")}, según el [Ayuntamiento](${a.url}).`,
      en: `The 2027 **Three Kings parade** (Cavalcada de Reis) is on ${when(a, "en")}, according to the [City Council](${a.url}).`,
    }[locale];
  }
  const p = PAST.programme2025.published;
  const r = PAST.cavalcada2026.route;
  return {
    ca: `La **Cavalcada de Reis** és el vespre del 5 de gener, vigília del festiu del 6; l'Ajuntament en publica l'horari i el recorregut les setmanes abans (per a la del 2026, el programa el ${dateYear(p, "ca")} i el recorregut complet el ${dateYear(r, "ca")}).`,
    es: `La **Cabalgata de Reyes** es la tarde-noche del 5 de enero, víspera del festivo del 6; el Ayuntamiento publica su horario y su recorrido las semanas antes (para la de 2026, el programa el ${dateYear(p, "es")} y el recorrido completo el ${dateYear(r, "es")}).`,
    en: `The **Three Kings parade** (Cavalcada de Reis) is on the evening of 5 January, the eve of the 6 January holiday; the City Council publishes its times and route in the weeks before (for the 2026 parade, the programme on ${dateYear(p, "en")} and the full route on ${dateYear(r, "en")}).`,
  }[locale];
}

function switchOnAnswer(locale: Locale, facts: Announcements): string {
  const a = facts.lightsSwitchOn;
  if (a) {
    return {
      ca: `L'Ajuntament ha anunciat l'encesa per al ${dayDate(a.date, "ca")}${a.time ? ` a les ${a.time}` : ""}. Els llums s'hi queden durant les festes; l'any passat, fins al 6 de gener.`,
      es: `El Ayuntamiento ha anunciado el encendido para el ${dayDate(a.date, "es")}${a.time ? ` a las ${a.time}` : ""}. Las luces se quedan durante las fiestas; el año pasado, hasta el 6 de enero.`,
      en: `The City Council has announced the switch-on for ${dayDate(a.date, "en")}${a.time ? ` at ${a.time}` : ""}. The lights stay up over the holidays; last year, until 6 January.`,
    }[locale];
  }
  return {
    ca: `Encara no s'ha anunciat (${CHECKED.ca}). El 2025 l'Ajuntament va anunciar la data el 16 d'octubre i va encendre els llums el ${dayDate(PAST.lights2025.switchOn, "ca")} al passeig de Gràcia; el 2024, el ${dateYear(PAST.lights2024.switchOn, "ca")}.`,
    es: `Aún no se ha anunciado (${CHECKED.es}). En 2025 el Ayuntamiento anunció la fecha el 16 de octubre y encendió las luces el ${dayDate(PAST.lights2025.switchOn, "es")} en el paseo de Gràcia; en 2024, el ${dateYear(PAST.lights2024.switchOn, "es")}.`,
    en: `It has not been announced yet (${CHECKED.en}). In 2025 the City Council announced the date on 16 October and the switch-on was on ${dayDate(PAST.lights2025.switchOn, "en")}, on Passeig de Gràcia; in 2024 it was on ${dateYear(PAST.lights2024.switchOn, "en")}.`,
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Tables                                                                     */
/* -------------------------------------------------------------------------- */

const VERIFIED_DAY: Record<Locale, string> = {
  ca: dateYear(FESTIVE_VERIFIED, "ca"),
  es: dateYear(FESTIVE_VERIFIED, "es"),
  en: dateYear(FESTIVE_VERIFIED, "en"),
};

export function metroTable(locale: Locale, days?: readonly string[]) {
  const caption = { ca: "El metro de Barcelona per Nadal i Cap d'Any (2026-27)", es: "El metro de Barcelona en Navidad y Año Nuevo (2026-27)", en: "Barcelona metro over Christmas and New Year (2026-27)" }[locale];
  const headers = { ca: ["Dia", "Tipus de dia", "Metro"], es: ["Día", "Tipo de día", "Metro"], en: ["Day", "Type of day", "Metro"] }[locale];
  const note = {
    ca: `Segons l'horari general de TMB (comprovat el ${VERIFIED_DAY.ca}): mitjanit; les 2:00 els divendres i vigílies de festiu; tota la nit els dissabtes i el 31 de desembre; les 23:00 el 24 de desembre. TMB confirma l'horari de Nadal al desembre (el 2025, el dia 23).`,
    es: `Según el horario general de TMB (comprobado el ${VERIFIED_DAY.es}): medianoche; las 2:00 los viernes y vísperas de festivo; toda la noche los sábados y el 31 de diciembre; las 23:00 el 24 de diciembre. TMB confirma el horario de Navidad en diciembre (en 2025, el día 23).`,
    en: `From TMB's standing timetable (checked ${VERIFIED_DAY.en}): midnight; 2:00 on Fridays and nights before holidays; all night on Saturdays and 31 December; 23:00 on 24 December. TMB confirms its Christmas hours in December (on the 23rd in 2025).`,
  }[locale];
  return table(caption, headers, metroRows(locale, days), note);
}

function sightTable(locale: Locale) {
  const caption = { ca: "Grans visites durant les festes", es: "Grandes visitas durante las fiestas", en: "Big sights over the holidays" }[locale];
  const headers = { ca: ["Lloc", "El que diu la seva web oficial"], es: ["Lugar", "Lo que dice su web oficial"], en: ["Sight", "What its official page says"] }[locale];
  const note = {
    ca: `De la pàgina d'horaris de cada lloc, comprovada el ${VERIFIED_DAY.ca}. Poden canviar per actes especials: mira-ho el dia abans.`,
    es: `De la página de horarios de cada lugar, comprobada el ${VERIFIED_DAY.es}. Pueden cambiar por actos especiales: compruébalo el día antes.`,
    en: `From each sight's own opening-hours page, checked ${VERIFIED_DAY.en}. Hours can change for special events, so check the day before.`,
  }[locale];
  return table(caption, headers, sightRows(locale), note);
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["newYear", "christmas", "shops", "hours", "workCalendar", "climate", "barcelonaHub"] as const;

export function buildChristmasBarcelonaBody(locale: Locale, facts: Announcements = ANNOUNCED_2026) {
  const holidaysFact = {
    ca: `Divendres ${dateYear(DAYS.christmas, "ca")} i dissabte 26 (Sant Esteve); divendres 1 i dimecres 6 de gener de 2027`,
    es: `Viernes ${dateYear(DAYS.christmas, "es")} y sábado 26 (San Esteban); viernes 1 y miércoles 6 de enero de 2027`,
    en: `Friday 25 and Saturday 26 December 2026 (Sant Esteve); Friday 1 and Wednesday 6 January 2027`,
  }[locale];
  const pessebreFact = facts.pessebre
    ? (facts.pessebre.until ? span(facts.pessebre.date, facts.pessebre.until, locale) : when(facts.pessebre, locale))
    : { ca: `Dates del 2026 pendents (el 2025: ${span(PAST.pessebre2025.from, PAST.pessebre2025.to, "ca")})`, es: `Fechas de 2026 pendientes (en 2025: ${span(PAST.pessebre2025.from, PAST.pessebre2025.to, "es")})`, en: `2026 dates not announced (2025: ${span(PAST.pessebre2025.from, PAST.pessebre2025.to, "en")})` }[locale];

  if (locale === "ca") {
    return [
      lead(lightsLead("ca", facts)),
      keyFacts("El Nadal del 2026, d'un cop d'ull", [
        { label: "Encesa de llums", value: switchOnFact("ca", facts) },
        { label: "Festius", value: holidaysFact },
        { label: "Botigues", value: "Tancades el 25 i 26 de desembre i l'1 i el 6 de gener, excepte les exemptes (forns, botigues de conveniència, botigues petites...). A Barcelona poden obrir els diumenges 6, 13, 20 i 27 de desembre i el dimarts 8." },
        { label: "Metro", value: "Fins a les 23:00 el 24 de desembre; tota la nit el 31 de desembre, segons l'horari de TMB." },
        { label: "Pessebre de l'Ajuntament", value: pessebreFact },
      ]),
      callout(
        "info",
        "Com tractem les dates",
        "Només hi posem una data del 2026 quan l'Ajuntament o TMB l'han publicada. Les del 2025 sempre porten l'any al costat. L'Ajuntament diu que el seu web de Nadal (barcelona.cat/nadal) s'actualitzarà cap al novembre del 2026; aquí afegim cada data el dia que és oficial.",
      ),
      ...h2(
        "Quan és l'encesa dels llums de Nadal de Barcelona 2026?",
        switchOnSection("ca", facts),
        "El 2025 els llums van estar encesos fins al 6 de gener de 2026, de 17:30 a 1:00 de diumenge a dijous i fins a les 2:00 els divendres, els dissabtes i les vigílies de festiu.",
      ),
      ...h2(
        "Llums de Nadal de Barcelona 2026: quins carrers",
        `L'Ajuntament va presentar el pla del 2026 el 9 de juliol: **${LIGHTS_PLAN_2026.km} quilòmetres de carrers i places amb llums** a tots els districtes, amb els eixos i les associacions de comerciants, i un pressupost d'uns 4,6 milions d'euros, més del 65% pagat amb ${b2link("touristTax", "ca", "l'impost turístic")}.`,
      ),
      list(
        "**Llums d'autor:** tornen a la Via Laietana, la plaça de Catalunya, el carrer d'Aragó, la Gran Via de les Corts Catalanes i el passeig de Sant Joan, i arriben a dos llocs nous, la Rambla de Prim i el passeig de Maragall.",
        "**Carrers del centre:** l'Ajuntament torna a il·luminar la ronda de Sant Pere, el carrer de Balmes, la plaça d'Urquinaona, la Rambla i l'avinguda del Paral·lel, que per primer cop tindrà llums de punta a punta.",
        "**El Galet**, el llum de Nadal dissenyat per Ramon Bigas, torna a tretze mercats municipals i a la plaça de Sant Miquel.",
        "**Fonts:** més d'una cinquantena tindran il·luminació de Nadal, entre elles les de la plaça de la Mercè, la plaça de Karl Marx, el llac de la Nova Icària, la plaça de Francesc Macià i la cascada de la Ciutadella.",
      ),
      ...paras(
        "El web de Nadal de l'Ajuntament hi afegirà un mapa amb les rutes de llums. L'Ajuntament també recorda que el 2026 Barcelona és capital europea del Nadal.",
      ),
      ...h2(
        "Plaça de Sant Jaume: el pessebre i l'espectacle de llum",
        "El pessebre tradicional de la ciutat ara és a dins: el 2024 i el 2025 l'Associació de Pessebristes de Barcelona el va muntar a l'Ajuntament, a les cotxeres (el pati de Carruatges) que donen a la plaça de Sant Jaume, després de diverses edicions al Museu Frederic Marès. El del 2025 recreava paisatges de muntanya catalans.",
        pessebreSentence("ca", facts),
        santJaumeSentence("ca", facts),
        `Si t'agraden els pessebres, el Monestir de Pedralbes hi va exposar diorames del Naixement i dels Reis fins al ${dateYear(PAST.pedralbes2025Until, "ca")}.`,
      ),
      ...h2(
        "Mercats de Nadal: Fira de Santa Llúcia i Sagrada Família",
        `Les dues grans fires de Nadal de Barcelona són la de Santa Llúcia, davant de la Catedral, i la de la Sagrada Família. Les dates, el que s'hi ven i la resta de mercats de Catalunya són a ${b2link("christmas", "ca", "la guia de mercats de Nadal")}, que actualitzem quan els organitzadors les publiquen.`,
      ),
      ...h2(
        "Més activitats de Nadal a la ciutat",
        `El programa del 2025, publicat el ${dateYear(PAST.programme2025.published, "ca")}, incloïa el Barcelona Festival de Nadal (${PAST.festival2025.shows} funcions d'arts de carrer a la plaça de Catalunya, ${span(PAST.festival2025.from, PAST.festival2025.to, "ca")} de 2025) i el Concert de Nadal de l'Orfeó Català al pla de la Seu (${dateYear(PAST.concert2025, "ca")}). El programa del 2026 encara no s'ha publicat.`,
      ),
      ...h2(
        "Què obre a Barcelona el dia de Nadal?",
        "Una part. **El 25 de desembre (divendres, el 2026) i el 26, Sant Esteve (dissabte), són festius a tot Catalunya**, igual que l'1 i el 6 de gener de 2027 (divendres i dimecres). A l'Aran, el 26 de desembre és feiner: el substitueix la Festa d'Aran, el 17 de juny.",
        `Aquests quatre dies, la llei catalana de comerç obliga a tancar les botigues amb horari general. Poden obrir, perquè en queden excloses, els forns i pastisseries, les floristeries, les botigues de conveniència, les farmàcies, les botigues de dins de les estacions i les de fins a 300 m² d'alimentació o de petites i mitjanes empreses. Abans de Nadal, a Barcelona les botigues poden obrir els diumenges 6, 13, 20 i 27 de desembre i el dimarts 8: ho detallem a ${b2link("shops", "ca", "la guia de botigues obertes en diumenges i festius")}.`,
      ),
      sightTable("ca"),
      ...h2(
        "Metro i autobusos per Nadal i Cap d'Any",
        "El metro funciona tots els dies de festes. Aquesta taula aplica l'horari general de TMB a cada dia:",
      ),
      metroTable("ca"),
      ...paras(
        "**Autobusos:** el 24 de desembre els autobusos de TMB fan l'última sortida des de la parada d'origen a les 22:00, «com cada any», segons TMB el 2025. Per a la temporada 2025-26, TMB va avisar que el Barcelona Bus Turístic no circularia el dia de Nadal ni el d'Any Nou.",
        `Per als autobusos nocturns i el detall de cada nit, mira ${b2link("hours", "ca", "l'horari del metro i del NitBus")}. La nit de Cap d'Any, el metro no tanca: l'espectacle, els accessos i les estacions són a ${b2link("newYear", "ca", "la guia de Cap d'Any a Barcelona")}.`,
      ),
      ...h2(
        "Tradicions de Nadal, en breu",
        "**El tió.** Segons la guia de tradicions de l'Ajuntament, el tió és un tronc que la mainada comença a alimentar per la Immaculada, el 8 de desembre, i que per Nadal, tapat amb una manta, se li pega amb un bastó cantant «Caga tió» perquè cagui torrons, llaminadures i algun regalet.",
        "**Nadal i Sant Esteve.** El 25 és el gran dinar familiar, amb l'escudella de galets i, per postres, torrons i neules. El 26, Sant Esteve, és un altre festiu a Catalunya per tornar-se a reunir, sovint amb l'altra branca de la família, al voltant dels canelons.",
        "**El pessebre i el caganer.** Els pessebres es fan amb suro, molsa i fusta, i a Catalunya hi ha un caganer amagat: una figura que porta bona sort i que, segons l'Ajuntament, només es troba als naixements de Catalunya i el País Valencià i va sorgir en època barroca.",
        "**Els Pastorets.** Una obra de teatre que es remunta al segle XVIII i que barreja el Naixement amb la baralla entre àngels i dimonis; per Nadal se'n fan per tot arreu.",
        "**El cava.** L'escumós dels brindis de Nadal es fa pel mètode tradicional, amb una segona fermentació a l'ampolla i com a mínim nou mesos de criança amb les lies; segons la DO Cava, el seu origen és al Penedès, sobretot a Sant Sadurní d'Anoia i els voltants.",
        "**Els Innocents.** El 28 de desembre és el dia de les bromes: vigila que no et pengin una llufa a l'esquena.",
      ),
      ...h2(
        "El temps i les escapades al desembre",
        `Les mitjanes del desembre (temperatures, pluja i hores de sol, de l'AEMET) són a ${b2link("climate", "ca", "la guia del temps a Barcelona mes a mes")}. Excursions d'un dia que funcionen a l'hivern: ${b2link("montserratFree", "ca", "Montserrat per lliure")}, ${b2link("girona", "ca", "Girona en tren")}, ${b2link("sitges", "ca", "Sitges")} o ${b2link("figueres", "ca", "Figueres i el Museu Dalí")}. Si busques neu, ${b2link("nuria", "ca", "la Vall de Núria")}, ${b2link("snow", "ca", "on veure neu sense esquiar")} i ${b2link("ski", "ca", "les estacions d'esquí")}.`,
      ),
      ...h2(
        "Cap d'Any i Reis",
        `La nit del 31 de desembre, la gran cita és l'espectacle gratuït de Cap d'Any de la ciutat: com va anar el 2024 i el 2025 i què s'ha anunciat per a enguany ho expliquem a ${b2link("newYear", "ca", "la guia de Cap d'Any a Barcelona")}.`,
        cavalcadaSentence("ca", facts),
      ),
      faq([
        { question: "Quan s'encenen els llums de Nadal de Barcelona el 2026?", answer: switchOnAnswer("ca", facts) },
        {
          question: "Què obre a Barcelona el dia de Nadal?",
          answer: "El 25 de desembre és festiu: la majoria de botigues tanquen per llei, però hi poden obrir els forns, les botigues de conveniència i les botigues petites; el metro funciona i alguns monuments obren amb horari reduït, com la Sagrada Família, de 9:00 a 14:00. El MNAC, la Pedrera i el Museu Picasso tanquen.",
        },
        {
          question: "Obren les botigues el 26 de desembre a Barcelona?",
          answer: "La majoria no: Sant Esteve és festiu a Catalunya i la llei obliga a tancar les botigues amb horari general, com el 25 de desembre i l'1 i el 6 de gener. Les botigues excloses (forns, conveniència, botigues de fins a 300 m²...) sí que poden obrir.",
        },
        {
          question: "On és el pessebre de la plaça de Sant Jaume?",
          answer: `A dins de l'Ajuntament, a les cotxeres que donen a la plaça de Sant Jaume, on l'Associació de Pessebristes de Barcelona el va muntar el 2024 i el 2025. ${facts.pessebre ? pessebreSentence("ca", facts).replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") : `El 2025 es va poder visitar ${span(PAST.pessebre2025.from, PAST.pessebre2025.to, "ca")} de 2026, de franc. Les dates del 2026 encara no s'han anunciat.`}`,
        },
        {
          question: "Funciona el metro el dia de Nadal?",
          answer: "Sí. Segons l'horari general de TMB, el divendres 25 de desembre de 2026 obre a les 5:00 i tanca a les 2:00, perquè l'endemà és festiu; el 24 de desembre tanca a les 23:00. TMB confirma l'horari de Nadal al desembre.",
        },
      ]),
      ...paras(verifiedLine("ca", FESTIVE_VERIFIED)),
      ...b2Related([...RELATED], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(lightsLead("es", facts)),
      keyFacts("La Navidad de 2026, de un vistazo", [
        { label: "Encendido de luces", value: switchOnFact("es", facts) },
        { label: "Festivos", value: holidaysFact },
        { label: "Tiendas", value: "Cerradas el 25 y 26 de diciembre y el 1 y 6 de enero, salvo las exentas (panaderías, tiendas de conveniencia, tiendas pequeñas...). En Barcelona pueden abrir los domingos 6, 13, 20 y 27 de diciembre y el martes 8." },
        { label: "Metro", value: "Hasta las 23:00 el 24 de diciembre; toda la noche el 31 de diciembre, según el horario de TMB." },
        { label: "Belén del Ayuntamiento", value: pessebreFact },
      ]),
      callout(
        "info",
        "Cómo tratamos las fechas",
        "Solo ponemos una fecha de 2026 cuando el Ayuntamiento o TMB la han publicado. Las de 2025 siempre llevan el año al lado. El Ayuntamiento dice que su web de Navidad (barcelona.cat/nadal) se actualizará hacia noviembre de 2026; aquí añadimos cada fecha el día que es oficial.",
      ),
      ...h2(
        "¿Cuándo es el encendido de las luces de Navidad de Barcelona 2026?",
        switchOnSection("es", facts),
        "En 2025 las luces estuvieron encendidas hasta el 6 de enero de 2026, de 17:30 a 1:00 de domingo a jueves y hasta las 2:00 los viernes, los sábados y las vísperas de festivo.",
      ),
      ...h2(
        "Luces de Navidad de Barcelona 2026: qué calles",
        `El Ayuntamiento presentó el plan de 2026 el 9 de julio: **${LIGHTS_PLAN_2026.km} kilómetros de calles y plazas con luces** en todos los distritos, junto con los ejes y asociaciones de comerciantes, y un presupuesto de unos 4,6 millones de euros, más del 65% pagado con ${b2link("touristTax", "es", "la tasa turística")}.`,
      ),
      list(
        "**Luces de autor:** vuelven a la Via Laietana, la plaza de Catalunya, la calle Aragó, la Gran Via de les Corts Catalanes y el paseo de Sant Joan, y llegan a dos sitios nuevos, la Rambla de Prim y el paseo de Maragall.",
        "**Calles del centro:** el Ayuntamiento vuelve a iluminar la ronda de Sant Pere, la calle Balmes, la plaza Urquinaona, la Rambla y la avenida del Paral·lel, que por primera vez tendrá luces de punta a punta.",
        "**El Galet**, la lámpara navideña diseñada por Ramon Bigas, vuelve a trece mercados municipales y a la plaza de Sant Miquel.",
        "**Fuentes:** más de cincuenta tendrán iluminación navideña, entre ellas las de la plaza de la Mercè, la plaza de Karl Marx, el lago de la Nova Icària, la plaza de Francesc Macià y la cascada de la Ciutadella.",
      ),
      ...paras(
        "La web de Navidad del Ayuntamiento añadirá un mapa con las rutas de luces. El Ayuntamiento también recuerda que en 2026 Barcelona es capital europea de la Navidad.",
      ),
      ...h2(
        "Plaza de Sant Jaume: el belén y el espectáculo de luz",
        "El belén tradicional de la ciudad ahora está dentro: en 2024 y 2025 la Associació de Pessebristes de Barcelona lo montó en el Ayuntamiento, en las cocheras (el patio de Carruajes) que dan a la plaza de Sant Jaume, después de varias ediciones en el Museu Frederic Marès. El de 2025 recreaba paisajes de montaña catalanes.",
        pessebreSentence("es", facts),
        santJaumeSentence("es", facts),
        `Si te gustan los belenes, el Monasterio de Pedralbes expuso dioramas del Nacimiento y de los Reyes hasta el ${dateYear(PAST.pedralbes2025Until, "es")}.`,
      ),
      ...h2(
        "Mercados de Navidad: Fira de Santa Llúcia y Sagrada Família",
        `Las dos grandes ferias de Navidad de Barcelona son la de Santa Llúcia, frente a la Catedral, y la de la Sagrada Família. Las fechas, lo que se vende y el resto de mercados de Cataluña están en ${b2link("christmas", "es", "la guía de mercados de Navidad")}, que actualizamos cuando los organizadores las publican.`,
      ),
      ...h2(
        "Más actos de Navidad en la ciudad",
        `El programa de 2025, publicado el ${dateYear(PAST.programme2025.published, "es")}, incluía el Barcelona Festival de Nadal (${PAST.festival2025.shows} funciones de artes de calle en la plaza de Catalunya, ${span(PAST.festival2025.from, PAST.festival2025.to, "es")} de 2025) y el Concierto de Navidad del Orfeó Català en el pla de la Seu (${dateYear(PAST.concert2025, "es")}). El programa de 2026 aún no se ha publicado.`,
      ),
      ...h2(
        "¿Qué abre en Barcelona el día de Navidad?",
        "Una parte. **El 25 de diciembre (viernes, en 2026) y el 26, San Esteban (sábado), son festivos en toda Cataluña**, igual que el 1 y el 6 de enero de 2027 (viernes y miércoles). En Arán, el 26 de diciembre es laborable: lo sustituye la Fiesta de Arán, el 17 de junio.",
        `Esos cuatro días, la ley catalana de comercio obliga a cerrar a las tiendas con horario general. Pueden abrir, porque quedan excluidas, las panaderías y pastelerías, las floristerías, las tiendas de conveniencia, las farmacias, las tiendas del interior de las estaciones y las de hasta 300 m² de alimentación o de pequeñas y medianas empresas. Antes de Navidad, en Barcelona las tiendas pueden abrir los domingos 6, 13, 20 y 27 de diciembre y el martes 8: lo detallamos en ${b2link("shops", "es", "la guía de tiendas abiertas en domingos y festivos")}.`,
      ),
      sightTable("es"),
      ...h2(
        "Metro y autobuses en Navidad y Año Nuevo",
        "El metro funciona todos los días de fiesta. Esta tabla aplica el horario general de TMB a cada día:",
      ),
      metroTable("es"),
      ...paras(
        "**Autobuses:** el 24 de diciembre los autobuses de TMB hacen la última salida desde la parada de origen a las 22:00, «como cada año», según TMB en 2025. Para la temporada 2025-26, TMB avisó de que el Barcelona Bus Turístic no circularía el día de Navidad ni el de Año Nuevo.",
        `Para los autobuses nocturnos y el detalle de cada noche, mira ${b2link("hours", "es", "el horario del metro y del NitBus")}. En Nochevieja el metro no cierra: el espectáculo, los accesos y las estaciones están en ${b2link("newYear", "es", "la guía de Nochevieja en Barcelona")}.`,
      ),
      ...h2(
        "Tradiciones de Navidad en Cataluña, en breve",
        "**El tió.** Según la guía de tradiciones del Ayuntamiento, el tió es un tronco al que los niños empiezan a alimentar por la Inmaculada, el 8 de diciembre, y al que en Navidad, tapado con una manta, se golpea con un bastón cantando «Caga tió» para que «cague» turrones, golosinas y algún regalito.",
        "**Navidad y San Esteban.** El 25 es la gran comida familiar, con escudella de galets (una sopa con pasta en forma de caracola grande) y, de postre, turrones y neules. El 26, Sant Esteve, es otro festivo en Cataluña para volver a reunirse, a menudo con la otra rama de la familia, alrededor de los canelones.",
        "**El belén y el caganer.** Los belenes se hacen con corcho, musgo y madera, y en Cataluña llevan un caganer escondido: una figura que da buena suerte y que, según el Ayuntamiento, solo se encuentra en los belenes de Cataluña y el País Valenciano y surgió en época barroca.",
        "**Els Pastorets.** Una obra de teatro que se remonta al siglo XVIII y mezcla el Nacimiento con la lucha entre ángeles y demonios; en Navidad se representa por todas partes.",
        "**El cava.** El espumoso de los brindis navideños se elabora por el método tradicional, con una segunda fermentación en la botella y al menos nueve meses de crianza con sus lías; según la DO Cava, su origen está en el Penedès, sobre todo en Sant Sadurní d'Anoia y alrededores.",
        "**Los Inocentes.** El 28 de diciembre es el día de las bromas: en Cataluña, cuidado con que no te cuelguen una llufa (un monigote de papel) en la espalda.",
      ),
      ...h2(
        "El tiempo y las excursiones en diciembre",
        `Las medias de diciembre (temperaturas, lluvia y horas de sol, de la AEMET) están en ${b2link("climate", "es", "la guía del tiempo en Barcelona mes a mes")}. Excursiones de un día que funcionan en invierno: ${b2link("montserratFree", "es", "Montserrat por libre")}, ${b2link("girona", "es", "Girona en tren")}, ${b2link("sitges", "es", "Sitges")} o ${b2link("figueres", "es", "Figueres y el Museo Dalí")}. Si buscas nieve, ${b2link("nuria", "es", "la Vall de Núria")}, ${b2link("snow", "es", "dónde ver nieve sin esquiar")} y ${b2link("ski", "es", "las estaciones de esquí")}.`,
      ),
      ...h2(
        "Nochevieja y Reyes",
        `La noche del 31 de diciembre, la gran cita es el espectáculo gratuito de fin de año de la ciudad: cómo fue en 2024 y 2025 y qué se ha anunciado para este año lo contamos en ${b2link("newYear", "es", "la guía de Nochevieja en Barcelona")}.`,
        cavalcadaSentence("es", facts),
      ),
      faq([
        { question: "¿Cuándo se encienden las luces de Navidad de Barcelona en 2026?", answer: switchOnAnswer("es", facts) },
        {
          question: "¿Qué abre en Barcelona el día de Navidad?",
          answer: "El 25 de diciembre es festivo: la mayoría de tiendas cierran por ley, pero pueden abrir las panaderías, las tiendas de conveniencia y las tiendas pequeñas; el metro funciona y algunos monumentos abren con horario reducido, como la Sagrada Familia, de 9:00 a 14:00. El MNAC, La Pedrera y el Museu Picasso cierran.",
        },
        {
          question: "¿Abren las tiendas el 26 de diciembre en Barcelona?",
          answer: "La mayoría no: San Esteban es festivo en Cataluña y la ley obliga a cerrar a las tiendas con horario general, igual que el 25 de diciembre y el 1 y el 6 de enero. Las tiendas excluidas (panaderías, conveniencia, tiendas de hasta 300 m²...) sí pueden abrir.",
        },
        {
          question: "¿Dónde está el belén de la plaza de Sant Jaume?",
          answer: `Dentro del Ayuntamiento, en las cocheras que dan a la plaza de Sant Jaume, donde la Associació de Pessebristes de Barcelona lo montó en 2024 y 2025. ${facts.pessebre ? pessebreSentence("es", facts).replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") : `En 2025 se pudo visitar ${span(PAST.pessebre2025.from, PAST.pessebre2025.to, "es")} de 2026, gratis. Las fechas de 2026 aún no se han anunciado.`}`,
        },
        {
          question: "¿Funciona el metro el día de Navidad?",
          answer: "Sí. Según el horario general de TMB, el viernes 25 de diciembre de 2026 abre a las 5:00 y cierra a las 2:00, porque el día siguiente es festivo; el 24 de diciembre cierra a las 23:00. TMB confirma el horario de Navidad en diciembre.",
        },
      ]),
      ...paras(verifiedLine("es", FESTIVE_VERIFIED)),
      ...b2Related([...RELATED], "es"),
    ];
  }

  return [
    lead(lightsLead("en", facts)),
    keyFacts("Christmas 2026 at a glance", [
      { label: "Lights switch-on", value: switchOnFact("en", facts) },
      { label: "Public holidays", value: holidaysFact },
      { label: "Shops", value: "Closed on 25 and 26 December and 1 and 6 January, except exempt ones (bakeries, convenience stores, small shops...). In Barcelona they may open on Sundays 6, 13, 20 and 27 December and on Tuesday 8 December." },
      { label: "Metro", value: "Until 23:00 on 24 December; all night on 31 December, according to TMB's timetable." },
      { label: "City Hall nativity scene", value: pessebreFact },
    ]),
    callout(
      "info",
      "How we handle dates",
      "We give a 2026 date only once the City Council or TMB has published it. Dates from 2025 always carry their year. The City Council says its Christmas website (barcelona.cat/nadal) will be updated around November 2026; we add each date the day it becomes official.",
    ),
    ...h2(
      "When are the Barcelona Christmas lights switched on in 2026?",
      switchOnSection("en", facts),
      "In 2025 the lights stayed on until 6 January 2026, from 17:30 to 1:00 from Sunday to Thursday and until 2:00 on Fridays, Saturdays and the evenings before public holidays.",
    ),
    ...h2(
      "Barcelona Christmas lights 2026: which streets",
      `The City Council presented its 2026 plan on 9 July: **${LIGHTS_PLAN_2026.km} km of streets and squares with lights** in every district, together with the local shopkeepers' associations, on a budget of about €4.6 million, more than 65% of it paid from ${b2link("touristTax", "en", "the tourist tax")}.`,
    ),
    list(
      "**Designer lights** return to Via Laietana, Plaça de Catalunya, Carrer d'Aragó, Gran Via de les Corts Catalanes and Passeig de Sant Joan, and reach two new places: Rambla de Prim and Passeig de Maragall.",
      "**Central streets:** the City Council again lights Ronda de Sant Pere, Carrer de Balmes, Plaça d'Urquinaona, La Rambla and Avinguda del Paral·lel, which is lit along its whole length for the first time.",
      "**The Galet**, the Christmas lamp designed by Ramon Bigas, comes back to thirteen municipal markets and to Plaça de Sant Miquel.",
      "**Fountains:** more than fifty get Christmas lighting, among them those on Plaça de la Mercè, Plaça de Karl Marx, the Nova Icària lake, Plaça de Francesc Macià and the Ciutadella cascade.",
    ),
    ...paras(
      "The City Council's Christmas website will add a map of light routes. The council also points out that 2026 is the year Barcelona is European Capital of Christmas.",
    ),
    ...h2(
      "Plaça de Sant Jaume: the nativity scene and the light show",
      "Barcelona's traditional nativity scene has moved indoors: in 2024 and 2025 the Associació de Pessebristes de Barcelona built it inside City Hall, in the coach house (Pati de Carruatges) that opens onto Plaça de Sant Jaume, after several editions at the Museu Frederic Marès. The 2025 one recreated Catalan mountain landscapes.",
      pessebreSentence("en", facts),
      santJaumeSentence("en", facts),
      `If you like nativity scenes, Pedralbes Monastery showed dioramas of the Nativity and the Three Kings until ${dateYear(PAST.pedralbes2025Until, "en")}.`,
    ),
    ...h2(
      "Christmas markets: Fira de Santa Llúcia and Sagrada Família",
      `Barcelona's two big Christmas fairs are the Fira de Santa Llúcia, in front of the Cathedral, and the Sagrada Família fair. Their dates, what they sell and the other markets in Catalonia are in ${b2link("christmas", "en", "our Christmas markets guide")}, which we update as the organisers publish them.`,
    ),
    ...h2(
      "More Christmas events in the city",
      `The 2025 programme, published on ${dateYear(PAST.programme2025.published, "en")}, included the Barcelona Festival de Nadal (${PAST.festival2025.shows} street-arts performances of theatre, dance, circus and music on Plaça de Catalunya, ${span(PAST.festival2025.from, PAST.festival2025.to, "en")} 2025) and the city's Christmas concert by the Orfeó Català on the Pla de la Seu (${dateYear(PAST.concert2025, "en")}). The 2026 programme has not been published yet.`,
    ),
    ...h2(
      "Is Barcelona open on Christmas Day?",
      "Partly. **25 December (a Friday in 2026) and 26 December, Sant Esteve (a Saturday), are both public holidays across Catalonia**, as are 1 and 6 January 2027 (Friday and Wednesday). In Aran, 26 December is a working day: the Festa d'Aran on 17 June replaces it.",
      `On those four days Catalan retail law keeps shops on the general timetable closed. Exempt, and so free to open, are bakeries and cake shops, florists, convenience stores, pharmacies, shops inside stations, and shops of up to 300 m² that sell everyday food or are run by small and medium-sized businesses. Before Christmas, shops in Barcelona may open on Sundays 6, 13, 20 and 27 December and on Tuesday 8 December: details in ${b2link("shops", "en", "our guide to shops open on Sundays and holidays")}.`,
    ),
    sightTable("en"),
    ...h2(
      "Metro and buses at Christmas and New Year",
      "The metro runs on every day of the holidays. This table applies TMB's standing timetable to each day:",
    ),
    metroTable("en"),
    ...paras(
      "**Buses:** on 24 December TMB buses make their last departures from the first stop at 22:00, \"as every year\", TMB said in 2025. For the 2025-26 season TMB said the Barcelona Bus Turístic would not run on Christmas Day or New Year's Day.",
      `For night buses and each night's details, see ${b2link("hours", "en", "Barcelona metro hours and night buses")}. On New Year's Eve the metro does not close: the show, the entry points and the nearest stations are in ${b2link("newYear", "en", "New Year's Eve in Barcelona")}.`,
    ),
    ...h2(
      "Catalan Christmas traditions, briefly",
      "**The tió.** According to the City Council's guide to Christmas traditions, the tió is a log that children start \"feeding\" on 8 December, the Immaculada, and that at Christmas, covered with a blanket, they beat with a stick while singing \"Caga tió\" so that it \"poos\" turrón, sweets and small presents.",
      "**Christmas Day and Sant Esteve.** The 25th is the big family lunch, with escudella de galets (a broth with large pasta shells) and turrón and neules (rolled wafers) for dessert. The 26th, Sant Esteve, is a second public holiday in Catalonia for getting together again, often with the other side of the family, over canelons.",
      "**The pessebre and the caganer.** Nativity scenes are built with cork, moss and wood, and in Catalonia they hide a caganer, a squatting figure that brings good luck; the City Council notes it is found only in Catalan and Valencian nativity scenes and appeared in the Baroque period.",
      "**Els Pastorets.** A Christmas play that goes back to the 18th century and mixes the Nativity with a fight between angels and devils; theatres of every size put it on.",
      "**Cava.** The sparkling wine of Christmas toasts is made by the traditional method, with a second fermentation in the bottle and at least nine months on its lees; according to the DO Cava, its origins are in the Penedès, especially around Sant Sadurní d'Anoia.",
      "**Innocents' Day.** 28 December is the day for practical jokes: in Catalonia, check your back for a llufa, a paper cut-out pinned on without you noticing.",
    ),
    ...h2(
      "Weather and day trips in December",
      `December's averages (temperature, rain and sunshine, from AEMET) are in ${b2link("climate", "en", "Barcelona weather by month")}. Day trips that work in winter: ${b2link("montserratFree", "en", "Montserrat without a tour")}, ${b2link("girona", "en", "Girona by train")}, ${b2link("sitges", "en", "Sitges")} or ${b2link("figueres", "en", "Figueres and the Dalí Museum")}. For snow, ${b2link("nuria", "en", "Vall de Núria")}, ${b2link("snow", "en", "where to see snow without skiing")} and ${b2link("ski", "en", "Catalonia's ski resorts")}.`,
    ),
    ...h2(
      "New Year's Eve and the Three Kings",
      `On 31 December the big event is the city's free New Year's Eve show: how it ran in 2024 and 2025 and what has been announced for this year are in ${b2link("newYear", "en", "New Year's Eve in Barcelona")}.`,
      cavalcadaSentence("en", facts),
    ),
    faq([
      { question: "When are the Christmas lights switched on in Barcelona in 2026?", answer: switchOnAnswer("en", facts) },
      {
        question: "Is Barcelona open on Christmas Day?",
        answer: "Partly. 25 December is a public holiday: most shops are closed by law, but bakeries, convenience stores and small shops may open, the metro runs, and some sights open for shorter hours, such as the Sagrada Família, 9:00 to 14:00. MNAC, La Pedrera and the Museu Picasso are closed.",
      },
      {
        question: "Are shops open on 26 December in Barcelona?",
        answer: "Most are not: Sant Esteve is a public holiday in Catalonia and the law keeps shops on the general timetable closed, as on 25 December and 1 and 6 January. Exempt shops (bakeries, convenience stores, shops up to 300 m²...) may open.",
      },
      {
        question: "Where is the nativity scene in Plaça Sant Jaume?",
        answer: `Inside City Hall, in the coach house that opens onto Plaça de Sant Jaume, where the Associació de Pessebristes de Barcelona built it in 2024 and 2025. ${facts.pessebre ? pessebreSentence("en", facts).replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") : `In 2025 it was open from ${span(PAST.pessebre2025.from, PAST.pessebre2025.to, "en")} 2026, free. The 2026 dates have not been announced.`}`,
      },
      {
        question: "Does the metro run on Christmas Day in Barcelona?",
        answer: "Yes. By TMB's standing timetable it opens at 5:00 on Friday 25 December 2026 and closes at 2:00, because the next day is a holiday; on 24 December it closes at 23:00. TMB confirms its Christmas hours in December.",
      },
    ]),
    ...paras(verifiedLine("en", FESTIVE_VERIFIED)),
    ...b2Related([...RELATED], "en"),
  ];
}

export const CHRISTMAS_BARCELONA: B2Article = {
  key: "christmasBarcelona",
  entryKey: "guide-christmas-in-barcelona",
  categoryKey: "festivals",
  sources: SOURCES,
  // Reused from the manifest, not a new photograph (see the header comment).
  heroKey: "botigues-llums-nadal-barcelona",
  heroAlt: {
    ca: "Llums de Nadal blaves i blanques sobre un carrer comercial de Barcelona, de nit",
    es: "Luces de Navidad azules y blancas sobre una calle comercial de Barcelona, de noche",
    en: "Blue and white Christmas lights over a shopping street in Barcelona at night",
  },
  heroCaption: {
    ca: "Llums de Nadal en un carrer de Barcelona (fotografia del 2016).",
    es: "Luces de Navidad en una calle de Barcelona (fotografía de 2016).",
    en: "Christmas lights on a Barcelona street (photographed in 2016).",
  },
  verifiedAt: FESTIVE_VERIFIED,
  publishedAt: "2026-10-25T12:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [
      locale,
      { ...CHRISTMAS_BARCELONA_META[locale], blocks: buildChristmasBarcelonaBody(locale) },
    ]),
  ) as B2Article["editions"],
};
