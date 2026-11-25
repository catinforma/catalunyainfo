import { MONTJUIC } from "./hills";
import type { Locale } from "@/lib/i18n/config";

import type { Block } from "@/lib/content/blocks";

import { CHECKED, cavalcadaSentence, metroTable, when } from "./christmas-barcelona";
import { ANNOUNCED_2026_27, TRANSPORT_URLS, christmasTransportMention, oneDayTable } from "./christmas-transport";
import {
  ANNOUNCED_2026,
  DAYS,
  FESTIVE_VERIFIED,
  PAST,
  SIGHT_SOURCES,
  WATCH,
  dateYear,
  type Announcements,
} from "./festive";
import { seasonLinks } from "./christmas-season-links";
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
 * New Year's Eve in Barcelona 2026-27 (Cap d'Any).
 *
 * The facts come from `festive.ts` (checked 25 Oct 2026): the City Council's
 * 2024 and 2025 New Year's Eve plans, its 2025 Cap d'Any page, TMB's standing
 * timetable and its December 2025 notice, the 2027 holiday calendar and the
 * shop rules. Nothing for 2026-27 was published that day, so the lead says so
 * and every detail of the last edition carries its year.
 *
 * 26 Oct 2026: the descriptions and the metro key fact no longer present
 * Avinguda de la Reina Maria Cristina or Espanya as this year's venue and
 * station; they carry 2024 and 2025. The City Council moved the 2026 Mercè
 * Piromusical to Nova Icària beach, and the press reports of a 2026 move to
 * the Anella Olímpica cite no official source, so no 2026 venue is printed
 * (research_notes/rank-all/review-4-bcn-sights.md).
 *
 * 31 Oct 2026: the Reis section's cavalcada sentence (christmas-barcelona.ts)
 * now ends with a link to the Three Kings parade page; this page goes out
 * with `reis-2027-links`.
 *
 * 5 Nov 2026: one body sentence after the metro table links the new
 * Christmas transport page (christmas-transport.ts, christmasTransportMention);
 * titles and descriptions untouched. Goes out with `transport-nadal-links`.
 *
 * No new photograph: the hero is the Magic Fountain picture already in the
 * manifest (the Montjuïc guide's lead image), because the publisher refuses
 * an article without one.
 */

/**
 * 21 Nov 2026 (December events cluster, body only; title, description and
 * lead untouched, in their window to 23 Nov): the City Council has still
 * published nothing for 2026-27 (press room tag "nadal-2026", latest 17 Nov;
 * barcelona.cat/nadal still "Nadal 2025"; the Cap d'Any page still the 2025
 * show, 23:50 to 00:10). Added: the 2025 night hour by hour, the transport
 * on the night of 31 December from the Christmas transport page's data (FGC
 * all night on six lines, its 19 Nov 2026 notice), and FAQ in the searched
 * words (what time the fireworks are, the nearest metro, Rodalies and FGC
 * that night, what opens on 1 January).
 */

/**
 * The day the City Council's press room and Christmas site were last read for the 2026-27 New Year's Eve.
 * 25 Nov 2026 (body only): re-read the press room tag "nadal-2026" (latest items 23 and 25 Nov, all about the
 * lights switch-on of 26 Nov; nothing on Cap d'Any), barcelona.cat/nadal/ca ("Nadal 2025", "es tornarà a actualitzar
 * al voltant del mes de novembre del 2026") and its Cap d'Any page (still the 2025 show), TMB's operating-hours page
 * ("24 December", "31 December: Continuous service throughout New Year's Eve") and TMB's press room (latest item
 * 25 Nov; no Christmas or New Year's Eve notice).
 */
export const NEW_YEAR_CHECKED = "2026-11-25";

/**
 * TMB's own notices of last season, for the sentence that says when they come out: Christmas Eve hours on 23 Dec 2025
 * (the City Council's note, PAST.tmbChristmas2025) and "Per Cap d'Any, el metro funcionarà 43 hores sense interrupció"
 * on 30 Dec 2025 (TMB press room, read 25 Nov 2026: "30.12.2025").
 */
export const TMB_NYE_NOTICE_2025 = "2025-12-30";

/** Last year's TMB notices and what the standing timetable says for 24 December, in the searched words ("metro 24 diciembre"). */
export function tmbNoticeSentence(locale: Locale): string {
  const eve = dateYear(PAST.tmbChristmas2025.published, locale);
  const nye = dateYear(TMB_NYE_NOTICE_2025, locale);
  const checked = dateYear(NEW_YEAR_CHECKED, locale);
  return {
    ca: `**Metro el 24 de desembre i la nit de Cap d'Any, el 2026:** segons l'horari general de TMB, el 24 de desembre el metro tanca a les 23:00. TMB encara no ha publicat el servei especial del 2026 (comprovat el ${checked}); l'any passat va publicar els horaris de la vigília de Nadal el ${eve} i el servei de la nit de Cap d'Any el ${nye}.`,
    es: `**Metro el 24 de diciembre y en Nochevieja, en 2026:** según el horario general de TMB, el 24 de diciembre el metro cierra a las 23:00. TMB aún no ha publicado el servicio especial de 2026 (comprobado el ${checked}); el año pasado publicó los horarios de Nochebuena el ${eve} y el servicio de Nochevieja el ${nye}.`,
    en: `**Metro on 24 December and on New Year's Eve, 2026:** according to TMB's standing timetable, the metro closes at 23:00 on 24 December. TMB has not published its 2026 special service yet (checked on ${checked}); last year it published the Christmas Eve hours on ${eve} and the New Year's Eve service on ${nye}.`,
  }[locale];
}

/**
 * The re-read checkpoints: from each day NEW_YEAR_CHECKED must be on or after
 * it (a test fails otherwise). 1 Dec: the 2025 Christmas programme with the
 * New Year's Eve show came out on 12 Nov, so it is late; 15 Dec: halfway;
 * 29 Dec: the entry and transport plan came out on 29 Dec in 2024 and 2025.
 */
export const NEW_YEAR_REREAD_BY = ["2026-12-01", "2026-12-15", "2026-12-29"] as const;

/** The last checkpoint `today` has reached, or null before the first. */
export function newYearRereadDue(today: string): string | null {
  const passed = NEW_YEAR_REREAD_BY.filter((day) => today >= day);
  return passed.length ? passed[passed.length - 1]! : null;
}

const SOURCES: B2Source[] = [
  { name: "Cap d'Any 2025", url: PAST.newYear2025.url, publisher: "Ajuntament de Barcelona" },
  { name: "Dispositiu per a la nit de Cap d'Any (2025)", url: PAST.newYearOps2025.url, publisher: "Ajuntament de Barcelona" },
  { name: "Dispositiu de Cap d'Any (2024)", url: PAST.newYearOps2024.url, publisher: "Ajuntament de Barcelona" },
  { name: "Barcelona vibra amb la màgia del Nadal (programa del 2025)", url: PAST.programme2025.url, publisher: "Ajuntament de Barcelona" },
  { name: "Servei de Premsa: Nadal 2026", url: WATCH.pressTag, publisher: "Ajuntament de Barcelona" },
  { name: "Nadal a Barcelona", url: WATCH.christmasSite, publisher: "Ajuntament de Barcelona" },
  { name: "Tradicions de Cap d'Any", url: "https://www.barcelona.cat/nadal/ca/tradicions/tradicions-de-cap-dany", publisher: "Ajuntament de Barcelona" },
  { name: "Metro and bus opening hours", url: WATCH.tmbHours, publisher: "TMB" },
  { name: "Horaris especials del metro i els autobusos de TMB la vigília de Nadal (2025)", url: PAST.tmbChristmas2025.url, publisher: "Ajuntament de Barcelona / TMB" },
  { name: "Calendari de festes laborals 2027", url: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2027/", publisher: "Generalitat de Catalunya" },
  { name: "Llei 18/2017, de comerç, serveis i fires (articles 36 i 37)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11320", publisher: "BOE" },
  { name: "Ordre EMT/89/2026, calendari d'obertura comercial en diumenges i festius per al 2027", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1045357&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Sagrada Família: schedules", url: SIGHT_SOURCES.sagradaFamilia, publisher: "Junta Constructora del Temple de la Sagrada Família" },
  { name: "La Pedrera: practical information", url: SIGHT_SOURCES.pedrera, publisher: "Fundació Catalunya La Pedrera" },
  { name: "MNAC: horaris i preus", url: SIGHT_SOURCES.mnac, publisher: "Museu Nacional d'Art de Catalunya" },
  { name: "Museu Picasso: tickets and opening hours", url: SIGHT_SOURCES.picasso, publisher: "Museu Picasso" },
  { name: "Els Reis d'Orient tornen a Barcelona (recorregut del 2026)", url: PAST.cavalcada2026.url, publisher: "Ajuntament de Barcelona" },
  { name: "Per Cap d'Any, el metro funcionarà 43 hores sense interrupció (30/12/2025)", url: TRANSPORT_URLS.tmbNewYear2025, publisher: "TMB" },
  ...(ANNOUNCED_2026_27.fgc
    ? [{ name: "Ferrocarrils reforça el servei els caps de setmana i festius previs a les festes de Nadal (19/11/2026)", url: ANNOUNCED_2026_27.fgc.url, publisher: "Govern de la Generalitat / FGC" }]
    : []),
];

export const NEW_YEAR_META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/cap-d-any-barcelona",
    title: "Cap d'Any a Barcelona 2026-27: la festa de Montjuïc, el metro i l'1 de gener",
    seoTitle: "Cap d'Any Barcelona 2026: la revetlla a Montjuïc i el metro",
    seoDescription:
      "Cap d'Any a Barcelona: què s'ha anunciat per al 2026, on es va fer l'espectacle gratuït el 2024 i el 2025, el metro tota la nit i què obre l'1 de gener.",
    excerpt:
      "Cap d'Any a Barcelona: on es fa la festa de la ciutat, què se sap del 2026, com s'hi entra, el metro tota la nit, els dotze grans de raïm i què obre l'1 de gener.",
  },
  es: {
    path: "guias/nochevieja-barcelona",
    title: "Nochevieja en Barcelona 2026-27: fin de año en Montjuïc, metro y 1 de enero",
    seoTitle: "Nochevieja Barcelona 2026: fin de año en Montjuïc y metro",
    seoDescription:
      "Nochevieja en Barcelona: qué se ha anunciado para 2026, dónde fue el espectáculo gratis en 2024 y 2025, el metro toda la noche y qué abre el 1 de enero.",
    excerpt:
      "Nochevieja en Barcelona: dónde es la fiesta de la ciudad, qué se sabe de 2026, cómo se entra, el metro toda la noche, las 12 uvas y qué abre el 1 de enero.",
  },
  en: {
    path: "guides/new-years-eve-barcelona",
    title: "New Year's Eve in Barcelona 2026-27: the Montjuïc show, metro and 1 January",
    seoTitle: "New Year's Eve Barcelona 2026: Montjuïc fireworks, metro",
    seoDescription:
      "Barcelona's free New Year's Eve show: what has been announced for 2026, where it was in 2024 and 2025, the all-night metro and what's open on 1 January.",
    excerpt:
      "New Year's Eve in Barcelona: where the city's show is, what is known for 2026, how to get in, the all-night metro, the 12 grapes and what is open on 1 January.",
  },
};

/* -------------------------------------------------------------------------- */
/* Sentences that change when the 2026-27 plan is announced                   */
/* -------------------------------------------------------------------------- */

export function newYearLead(locale: Locale, facts: Announcements = ANNOUNCED_2026): string {
  const a = facts.newYearShow;
  const metro: Record<Locale, string> = {
    ca: "Segons l'horari de TMB, el metro no tanca en tota la nit del 31 de desembre.",
    es: "Según el horario de TMB, el metro no cierra en toda la noche del 31 de diciembre.",
    en: "TMB's timetable has the metro running all night on 31 December.",
  };
  if (a) {
    const head: Record<Locale, string> = {
      ca: `**La festa de Cap d'Any 2026 de Barcelona és ${when(a, "ca")}**, segons l'Ajuntament.`,
      es: `**La fiesta de Nochevieja 2026 de Barcelona es ${when(a, "es")}**, según el Ayuntamiento.`,
      en: `**Barcelona's New Year's Eve 2026 celebration is on ${when(a, "en")}**, according to the City Council.`,
    };
    return `${head[locale]} ${metro[locale]}`;
  }
  const head: Record<Locale, string> = {
    ca: `**L'Ajuntament encara no ha anunciat la festa de Cap d'Any 2026 de Barcelona** (${CHECKED.ca}). El 2024 i el 2025 es va fer a l'avinguda de la Reina Maria Cristina, als peus de Montjuïc; la del 2025 va ser gratuïta, amb focs, drons i música de 23:50 a 00:10.`,
    es: `**El Ayuntamiento aún no ha anunciado la fiesta de Nochevieja 2026 de Barcelona** (${CHECKED.es}). En 2024 y 2025 se hizo en la avenida de la Reina Maria Cristina, a los pies de Montjuïc; la de 2025 fue gratuita, con fuegos artificiales, drones y música de 23:50 a 00:10.`,
    en: `**Barcelona has not announced its New Year's Eve 2026 celebration yet** (${CHECKED.en}). In 2024 and 2025 the city's show was on Avinguda de la Reina Maria Cristina, at the foot of Montjuïc; the 2025 one was free, with fireworks, drones and music from 23:50 to 00:10.`,
  };
  return `${head[locale]} ${metro[locale]}`;
}

function showFact(locale: Locale, facts: Announcements): string {
  const a = facts.newYearShow;
  if (a) return when(a, locale).replace(/^el /, "");
  return { ca: "Encara no s'ha anunciat", es: "Aún no se ha anunciado", en: "Not announced yet" }[locale];
}

function plansSentence(locale: Locale, facts: Announcements): string {
  const a = facts.newYearShow;
  if (a) {
    return {
      ca: `Per al 2026-27, l'Ajuntament ha anunciat la festa ${when(a, "ca")} ([anunci](${a.url})). Els accessos i el dispositiu de transport se solen publicar els darrers dies de l'any: el ${dateYear(PAST.newYearOps2024.published, "ca")} i el ${dateYear(PAST.newYearOps2025.published, "ca")}.`,
      es: `Para 2026-27, el Ayuntamiento ha anunciado la fiesta ${when(a, "es")} ([anuncio](${a.url})). Los accesos y el dispositivo de transporte suelen publicarse los últimos días del año: el ${dateYear(PAST.newYearOps2024.published, "es")} y el ${dateYear(PAST.newYearOps2025.published, "es")}.`,
      en: `For 2026-27 the City Council has announced the celebration for ${when(a, "en")} ([announcement](${a.url})). Entry and transport arrangements usually come out in the last days of the year: on ${dateYear(PAST.newYearOps2024.published, "en")} and ${dateYear(PAST.newYearOps2025.published, "en")}.`,
    }[locale];
  }
  return {
    ca: `Per al 2026-27 l'Ajuntament encara no ha publicat res (comprovat el ${dateYear(NEW_YEAR_CHECKED, "ca")}). El 2025 va anunciar la festa de Cap d'Any dins del programa de Nadal, el ${dateYear(PAST.programme2025.published, "ca")}, i el dispositiu d'accessos i transport el ${dateYear(PAST.newYearOps2025.published, "ca")}, com el ${dateYear(PAST.newYearOps2024.published, "ca")}.`,
    es: `Para 2026-27 el Ayuntamiento aún no ha publicado nada (comprobado el ${dateYear(NEW_YEAR_CHECKED, "es")}). En 2025 anunció la fiesta de fin de año dentro del programa de Navidad, el ${dateYear(PAST.programme2025.published, "es")}, y el dispositivo de accesos y transporte el ${dateYear(PAST.newYearOps2025.published, "es")}, como el ${dateYear(PAST.newYearOps2024.published, "es")}.`,
    en: `For 2026-27 the City Council has published nothing yet (checked on ${dateYear(NEW_YEAR_CHECKED, "en")}). In 2025 it announced the New Year's Eve show in its Christmas programme on ${dateYear(PAST.programme2025.published, "en")}, and the entry and transport arrangements on ${dateYear(PAST.newYearOps2025.published, "en")}, as it had on ${dateYear(PAST.newYearOps2024.published, "en")}.`,
  }[locale];
}

function whereAnswer(locale: Locale, facts: Announcements): string {
  const a = facts.newYearShow;
  const past = {
    ca: "El 2024 i el 2025, l'espectacle de l'Ajuntament, amb focs artificials, es va fer a l'avinguda de la Reina Maria Cristina, als peus de Montjuïc, entre la plaça d'Espanya i la Font Màgica.",
    es: "En 2024 y 2025, el espectáculo del Ayuntamiento, con fuegos artificiales, se hizo en la avenida de la Reina Maria Cristina, a los pies de Montjuïc, entre la plaza de España y la Fuente Mágica.",
    en: "In 2024 and 2025 the City Council's show, with fireworks, was on Avinguda de la Reina Maria Cristina, at the foot of Montjuïc between Plaça d'Espanya and the Magic Fountain.",
  }[locale];
  if (a) {
    const now = { ca: `Per al 2026-27 s'ha anunciat ${when(a, "ca")}.`, es: `Para 2026-27 se ha anunciado ${when(a, "es")}.`, en: `For 2026-27 it has been announced for ${when(a, "en")}.` }[locale];
    return `${now} ${past}`;
  }
  const pending = { ca: "El lloc del 2026-27 encara no s'ha anunciat.", es: "El lugar de 2026-27 aún no se ha anunciado.", en: "The 2026-27 venue has not been announced yet." }[locale];
  return `${past} ${pending}`;
}

/* -------------------------------------------------------------------------- */
/* The night at a glance (21 Nov 2026)                                        */
/* -------------------------------------------------------------------------- */

const CHECKED_NYE: Record<Locale, string> = {
  ca: `comprovat el ${dateYear(NEW_YEAR_CHECKED, "ca")}`,
  es: `comprobado el ${dateYear(NEW_YEAR_CHECKED, "es")}`,
  en: `checked on ${dateYear(NEW_YEAR_CHECKED, "en")}`,
};

/** The 2025 night hour by hour (City Council and TMB, 2025), always labelled 2025. */
export function nightTable(locale: Locale): Block {
  const rows: Record<Locale, string[][]> = {
    ca: [
      ["19:00", "Desviaments de bus per la festa: línies 13, 23, 150 i X3 i ruta vermella del Bus Turístic"],
      ["20:00", "També es desvien la D20, H12, H16, 46, 65, 91, 109 i X2"],
      ["22:00", "Espectacle especial de les fonts màgiques"],
      ["23:50", "Comença l'espectacle central a l'avinguda de la Reina Maria Cristina: focs, drons i música, gratuït i sense límit d'aforament"],
      ["00:00", "Campanades i dotze grans de raïm"],
      ["00:10", "Acaba l'espectacle; la sortida, per l'avinguda de Rius i Taulet, la de Francesc Ferrer i Guàrdia i la de Maria Cristina"],
      ["Tota la nit", "Metro obert sense parar: 43 hores, de les 5:00 del 31 de desembre a la mitjanit de l'1 de gener"],
    ],
    es: [
      ["19:00", "Desvíos de bus por la fiesta: líneas 13, 23, 150 y X3 y ruta roja del Bus Turístic"],
      ["20:00", "También se desvían la D20, H12, H16, 46, 65, 91, 109 y X2"],
      ["22:00", "Espectáculo especial de las fuentes mágicas"],
      ["23:50", "Empieza el espectáculo central en la avenida de la Reina Maria Cristina: fuegos artificiales, drones y música, gratis y sin límite de aforo"],
      ["00:00", "Campanadas y doce uvas"],
      ["00:10", "Termina el espectáculo; la salida, por la avenida de Rius i Taulet, la de Francesc Ferrer i Guàrdia y la de Maria Cristina"],
      ["Toda la noche", "Metro abierto sin parar: 43 horas, de las 5:00 del 31 de diciembre a la medianoche del 1 de enero"],
    ],
    en: [
      ["19:00", "Bus diversions for the show: lines 13, 23, 150 and X3 and the Bus Turístic red route"],
      ["20:00", "Lines D20, H12, H16, 46, 65, 91, 109 and X2 are diverted too"],
      ["22:00", "Special Magic Fountain show"],
      ["23:50", "The main show starts on Avinguda de la Reina Maria Cristina: fireworks, drones and music, free and with no capacity limit"],
      ["00:00", "Midnight chimes and the twelve grapes"],
      ["00:10", "The show ends; the way out is along Avinguda de Rius i Taulet, Avinguda de Francesc Ferrer i Guàrdia and Avinguda de Maria Cristina"],
      ["All night", "Metro open non-stop: 43 hours, from 5:00 on 31 December to midnight on 1 January"],
    ],
  };
  return table(
    { ca: "La nit de Cap d'Any del 2025 a Barcelona, hora a hora", es: "La Nochevieja de 2025 en Barcelona, hora a hora", en: "New Year's Eve 2025 in Barcelona, hour by hour" }[locale],
    { ca: ["Hora (2025)", "Què va passar"], es: ["Hora (2025)", "Qué pasó"], en: ["Time (2025)", "What happened"] }[locale],
    rows[locale],
    {
      ca: `Ajuntament de Barcelona i TMB, desembre del 2025. El programa del 2026-27 encara no s'ha publicat (${CHECKED_NYE.ca}).`,
      es: `Ayuntamiento de Barcelona y TMB, diciembre de 2025. El programa de 2026-27 aún no se ha publicado (${CHECKED_NYE.es}).`,
      en: `Barcelona City Council and TMB, December 2025. The 2026-27 programme is not out yet (${CHECKED_NYE.en}).`,
    }[locale],
  );
}

/** Every operator on the night of 31 December, from the Christmas transport page's data. */
function nightTransportTable(locale: Locale): Block {
  return oneDayTable(
    "newYearsEve",
    { ca: "Transport la nit de Cap d'Any, 31 de desembre de 2026", es: "Transporte en Nochevieja, 31 de diciembre de 2026", en: "Transport on New Year's Eve, 31 December 2026" }[locale],
    locale,
  );
}

/** The FAQ added on 21 Nov 2026, in the searched words. */
function moreFaq(locale: Locale, facts: Announcements): { question: string; answer: string }[] {
  const L = <T,>(v: Record<Locale, T>) => v[locale];
  const a = facts.newYearShow;
  const fgc = ANNOUNCED_2026_27.fgc;
  const fgcNye = fgc?.days.newYearsEve;
  const rodNye = ANNOUNCED_2026_27.rodalies?.days.newYearsEve;
  return [
    {
      question: L({ ca: "A quina hora són els focs de Cap d'Any a Barcelona?", es: "¿A qué hora son los fuegos artificiales de Nochevieja en Barcelona?", en: "What time are the New Year's Eve fireworks in Barcelona?" }),
      answer: a
        ? L({ ca: `El 2026-27, segons l'Ajuntament, ${when(a, "ca")}.`, es: `En 2026-27, según el Ayuntamiento, ${when(a, "es")}.`, en: `For 2026-27, according to the City Council, ${when(a, "en")}.` })
        : L({
            ca: `L'hora del 2026-27 encara no s'ha anunciat (${CHECKED_NYE.ca}). El 2025 l'espectacle central, amb focs, drons i música, va anar de 23:50 a 00:10 a l'avinguda de la Reina Maria Cristina, i abans, des de les 22:00, hi va haver un espectacle especial de les fonts màgiques.`,
            es: `La hora de 2026-27 aún no se ha anunciado (${CHECKED_NYE.es}). En 2025 el espectáculo central, con fuegos artificiales, drones y música, fue de 23:50 a 00:10 en la avenida de la Reina Maria Cristina, y antes, desde las 22:00, hubo un espectáculo especial de las fuentes mágicas.`,
            en: `The 2026-27 time has not been announced yet (${CHECKED_NYE.en}). In 2025 the main show, with fireworks, drones and music, ran from 23:50 to 00:10 on Avinguda de la Reina Maria Cristina, after a special Magic Fountain show from 22:00.`,
          }),
    },
    {
      question: L({ ca: "Quina és la parada de metro més propera a la festa de Cap d'Any?", es: "¿Cuál es la parada de metro más cercana a la fiesta de Nochevieja?", en: "Which metro station is nearest the New Year's Eve show?" }),
      answer: L({
        ca: "El 2024 i el 2025, Espanya (L1 i L3). El 2025 l'Ajuntament recomanava també Hostafrancs (L1), Tarragona (L3), Rocafort (L1) i Poble Sec (L3), amb personal per regular el pas de gent a l'entrada i a la sortida. El metro no tanca en tota la nit del 31 de desembre.",
        es: "En 2024 y 2025, Espanya (L1 y L3). En 2025 el Ayuntamiento recomendaba también Hostafrancs (L1), Tarragona (L3), Rocafort (L1) y Poble Sec (L3), con personal para regular el paso de gente a la entrada y a la salida. El metro no cierra en toda la noche del 31 de diciembre.",
        en: "In 2024 and 2025, Espanya (L1, L3). In 2025 the City Council also recommended Hostafrancs (L1), Tarragona (L3), Rocafort (L1) and Poble Sec (L3), with staff managing the crowds on the way in and out. The metro runs all night on 31 December.",
      }),
    },
    {
      question: L({ ca: "Funcionen Rodalies i FGC la nit de Cap d'Any?", es: "¿Funcionan Rodalies y FGC en Nochevieja?", en: "Do Rodalies and FGC trains run on New Year's Eve?" }),
      answer: L({
        ca: `${fgcNye ? `FGC, sí: el 2026-27 ${fgcNye.ca} (nota del ${dateYear(fgc!.published ?? fgc!.read, "ca")}).` : "FGC, el 2025, va circular tota la nit, com cada any, a la zona urbana de Barcelona i fins a Sabadell i Terrassa; el 2026-27, per confirmar."} ${rodNye ? `Rodalies, el 2026-27: ${rodNye.ca}.` : `Rodalies no ha anunciat cap servei especial per a aquesta nit (${CHECKED_NYE.ca}), i el 2025 tampoc.`} El metro no tanca en tota la nit.`,
        es: `${fgcNye ? `FGC, sí: en 2026-27 ${fgcNye.es} (nota del ${dateYear(fgc!.published ?? fgc!.read, "es")}).` : "FGC, en 2025, circuló toda la noche, como cada año, en la zona urbana de Barcelona y hasta Sabadell y Terrassa; en 2026-27, por confirmar."} ${rodNye ? `Rodalies, en 2026-27: ${rodNye.es}.` : `Rodalies no ha anunciado ningún servicio especial para esa noche (${CHECKED_NYE.es}), y en 2025 tampoco.`} El metro no cierra en toda la noche.`,
        en: `${fgcNye ? `FGC does: for 2026-27, ${fgcNye.en} (note of ${dateYear(fgc!.published ?? fgc!.read, "en")}).` : "FGC ran all night in 2025, as every year, in Barcelona and out to Sabadell and Terrassa; 2026-27 to be confirmed."} ${rodNye ? `Rodalies, for 2026-27: ${rodNye.en}.` : `Rodalies has announced no special service for that night (${CHECKED_NYE.en}), and it announced none in 2025 either.`} The metro runs all night.`,
      }),
    },
    {
      question: L({ ca: "Què obre l'1 de gener a Barcelona?", es: "¿Qué abre el 1 de enero en Barcelona?", en: "What is open on 1 January in Barcelona?" }),
      answer: L({
        ca: "L'1 de gener de 2027 és divendres i festiu: les botigues amb horari general tanquen, i poden obrir els forns, les botigues de conveniència, les farmàcies i les botigues de fins a 300 m² d'alimentació o de petites empreses. La Sagrada Família obre de 9:00 a 14:00 i la Pedrera, d'11:00 a 20:30; el MNAC i el Museu Picasso tanquen.",
        es: "El 1 de enero de 2027 es viernes y festivo: las tiendas con horario general cierran, y pueden abrir las panaderías, las tiendas de conveniencia, las farmacias y las tiendas de hasta 300 m² de alimentación o de pequeñas empresas. La Sagrada Familia abre de 9:00 a 14:00 y La Pedrera, de 11:00 a 20:30; el MNAC y el Museu Picasso cierran.",
        en: "1 January 2027 is a Friday and a public holiday: shops on the general timetable close, while bakeries, convenience stores, pharmacies and shops of up to 300 m² selling everyday food or run by small businesses may open. The Sagrada Família opens 9:00 to 14:00 and La Pedrera 11:00 to 20:30; MNAC and the Museu Picasso are closed.",
      }),
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const NYE_METRO_DAYS = [DAYS.newYearsEve, DAYS.newYear, DAYS.reisEve, DAYS.reis] as const;

const RELATED = ["christmasBarcelona", "hours", "shops", "montjuic", "workCalendar", "christmas", "barcelonaHub"] as const;

export function buildNewYearBody(locale: Locale, facts: Announcements = ANNOUNCED_2026) {
  if (locale === "ca") {
    return [
      lead(newYearLead("ca", facts)),
      keyFacts("Cap d'Any, d'un cop d'ull", [
        { label: "Festa del 2026-27", value: showFact("ca", facts) },
        { label: "On (2024 i 2025)", value: "Avinguda de la Reina Maria Cristina, entre la plaça d'Espanya i la Font Màgica" },
        { label: "Horari (2025)", value: "Espectacle de les fonts màgiques des de les 22:00; espectacle central de 23:50 a 00:10" },
        { label: "Preu (2025)", value: "Gratuït i sense límit d'aforament" },
        { label: "Metro", value: "Tota la nit el 31 de desembre (horari de TMB); el 2024 i el 2025 l'estació més propera a l'espectacle era Espanya (L1, L3)" },
        { label: "Quan surten els detalls", value: "El 2025, el programa va sortir el 12 de novembre; els accessos i el transport, el 29 de desembre, igual que el 2024" },
      ]),
      callout(
        "info",
        "Com tractem les dates",
        "Només hi posem una data del 2026-27 quan l'Ajuntament o TMB l'han publicada. El que es va fer el 2024 i el 2025 sempre porta l'any al costat: és el que pots esperar, no una confirmació.",
      ),
      ...h2(
        "On és la festa de Cap d'Any a Barcelona?",
        "El 2024 i el 2025 l'Ajuntament la va fer a l'avinguda de la Reina Maria Cristina, la que puja de la plaça d'Espanya a la Font Màgica, als peus de Montjuïc. L'espectacle del 2025, produït per Groupe F amb música de Marc Parrot, combinava focs artificials, drons, audiovisuals i música en quatre parts inspirades en l'aire, l'aigua, la terra i el foc.",
        "El 2025 la vetllada va començar a les 22:00 amb un espectacle especial de les fonts màgiques, i l'espectacle central va anar de 23:50 a 00:10: començava deu minuts abans de les campanades i s'allargava els deu primers minuts de l'any.",
        plansSentence("ca", facts),
      ),
      nightTable("ca"),
      ...h2(
        "Com s'hi entra: accessos, què no hi pots portar i espai reservat",
        "Així va funcionar el 2025; els detalls del 2026-27 arribaran amb el dispositiu de l'Ajuntament:",
      ),
      list(
        "**Accés** per filtres de control a la calçada central entre les dues torres venecianes de la plaça d'Espanya, amb quatre carrils i personal de seguretat amb detectors de metalls.",
        "**No s'hi podia entrar** amb ampolles de vidre, llaunes, patinets elèctrics ni cap objecte perillós.",
        "**Sense accés de públic** per l'avinguda de Rius i Taulet ni per l'avinguda de Francesc Ferrer i Guàrdia, reservades per a emergències; en acabar, la sortida es feia per aquestes vies i per la mateixa avinguda de Maria Cristina.",
        "**Persones amb mobilitat reduïda:** espai reservat a la cruïlla de l'avinguda de Maria Cristina amb Rius i Taulet, amb aforament limitat i presentant la targeta acreditativa, i zona d'aparcament a Rius i Taulet.",
      ),
      ...h2(
        "Metro i autobusos la nit de Cap d'Any",
        `**El metro funciona tota la nit del 31 de desembre:** l'horari general de TMB hi preveu servei continu. El 2024 i el 2025 va funcionar 43 hores seguides, des de les 5:00 del 31 de desembre fins al final del servei, a mitjanit de l'1 de gener; el 2025, amb vuit línies i 165 estacions obertes.`,
        "El 2025, de 21:00 a 2:00 els trens passaven cada 4 minuts o menys a les línies 1 i 3, i de 2:00 a 5:00, cada 10 minuts o menys a les línies 1, 4 i 5.",
        "**Estacions recomanades (2025):** Espanya (L1 i L3), la més propera, i també Hostafrancs (L1), Tarragona (L3), Rocafort (L1) i Poble Sec (L3), amb personal per regular el pas de gent a l'entrada i a la sortida.",
        "**Autobusos (2025):** a partir de les 19:00 es van desviar les línies 13, 23, 150 i X3 i la ruta vermella del Bus Turístic, i a partir de les 20:00, la D20, H12, H16, 46, 65, 91, 109 i X2, pels talls de trànsit a la plaça d'Espanya.",
        tmbNoticeSentence("ca"),
        "Aquesta taula aplica l'horari general de TMB a la nit de Cap d'Any i als dies de Reis. L'1 de gener de 2027 és divendres, i els divendres l'horari general arriba fins a les 2:00; TMB ho confirmarà al desembre:",
      ),
      metroTable("ca", NYE_METRO_DAYS),
      nightTransportTable("ca"),
      ...paras(christmasTransportMention("ca")),
      ...h2(
        "Els dotze grans de raïm i altres tradicions",
        "**Les campanades.** A mitjanit, les dotze darreres campanades de l'any marquen el compte enrere i a cada una es menja un gra de raïm i es demana un desig. Segons la pàgina de tradicions de l'Ajuntament, el costum no és gaire antic: el situa en l'excedent de raïm de l'any 1909. Després venen els brindis amb cava, els petons i les abraçades.",
        "**L'home dels Nassos.** El 31 de desembre s'anima la mainada a buscar l'home que té tants nassos com dies té l'any. La gràcia és que aquell dia tothom en té tants com dies queden: un.",
        "**La Cursa dels Nassos.** Barcelona fa des del 1999 aquesta cursa de Sant Silvestre, el darrer dia de l'any, en què és habitual córrer disfressat.",
        "**El primer bany de l'any.** L'1 de gener, cap al migdia, els més valents es capbussen al Mediterrani, i hi ha brou calent per a tothom qui s'hi banya, segons l'Ajuntament.",
        `**La Grossa de Cap d'Any**, la loteria de la Generalitat, se sorteja el mateix 31 de desembre: l'hora, els premis i els números premiats són a ${b2link("grossa", "ca", "la guia de La Grossa de Cap d'Any")}.`,
        `**La loteria de Nadal**, la de l'Estat, se sorteja abans, el 22 de desembre: com es cobra i on ha tocat a Catalunya, a ${b2link("loteriaNadal", "ca", "la guia de la loteria de Nadal")}.`,
      ),
      ...h2(
        "Què obre l'1 de gener a Barcelona?",
        `L'1 de gener de 2027 és divendres i festiu. Les botigues amb horari general han de tancar, com el 6 de gener; hi poden obrir els forns, les botigues de conveniència, les farmàcies i les botigues de fins a 300 m² d'alimentació o de petites empreses. El primer diumenge del calendari comercial general del 2027 és el 3 de gener (Ordre EMT/89/2026); Barcelona encara no ha publicat els seus dies del 2027. Tot el detall, a ${b2link("shops", "ca", "la guia de botigues obertes en diumenges i festius")}.`,
        `**Monuments i museus:** la Sagrada Família obre de 9:00 a 14:00 i la Pedrera, d'11:00 a 20:30; el MNAC i el Museu Picasso tanquen. Per a l'1 de gener de 2026, TMB va avisar que el Barcelona Bus Turístic no circularia. Per al dia de Nadal i Sant Esteve, mira ${b2link("christmasBarcelona", "ca", "Nadal a Barcelona")}.`,
      ),
      ...h2(
        "Reis: el 5 de gener",
        `${cavalcadaSentence("ca", facts)} El 6 de gener de 2027 (dimecres) és festiu i les botigues amb horari general tanquen.`,
      ),
      ...seasonLinks("ca", ["barcelonaDecember", "christmasLights", "holidayToday"]),

      faq([
        { question: "On es fan els focs de Cap d'Any a Barcelona?", answer: whereAnswer("ca", facts) },
        {
          question: "La festa de Cap d'Any de Barcelona és gratuïta?",
          answer: "La del 2025 va ser gratuïta i sense límit d'aforament. S'hi entrava per filtres de seguretat a la plaça d'Espanya i no s'hi podien portar ampolles de vidre, llaunes ni patinets elèctrics.",
        },
        {
          question: "El metro de Barcelona funciona tota la nit per Cap d'Any?",
          answer: "Sí. L'horari de TMB preveu servei continu la nit del 31 de desembre. El 2024 i el 2025 va funcionar 43 hores seguides, de les 5:00 del 31 de desembre a la mitjanit de l'1 de gener.",
        },
        {
          question: "Quan s'anunciarà el Cap d'Any 2026 de Barcelona?",
          answer: `El 2025 l'Ajuntament va anunciar l'espectacle en el programa de Nadal, el ${dateYear(PAST.programme2025.published, "ca")}, i els accessos i el transport el ${dateYear(PAST.newYearOps2025.published, "ca")}. El web de Nadal diu que s'actualitzarà cap al novembre del 2026.`,
        },
        {
          question: "Què són els dotze grans de raïm?",
          answer: "A mitjanit es menja un gra de raïm a cada una de les dotze campanades i es demana un desig. Després es brinda amb cava.",
        },
        ...moreFaq("ca", facts),
      ]),
      ...paras(verifiedLine("ca", FESTIVE_VERIFIED)),
      ...b2Related([...RELATED], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(newYearLead("es", facts)),
      keyFacts("Nochevieja, de un vistazo", [
        { label: "Fiesta de 2026-27", value: showFact("es", facts) },
        { label: "Dónde (2024 y 2025)", value: "Avenida de la Reina Maria Cristina, entre la plaza de España y la Fuente Mágica" },
        { label: "Horario (2025)", value: "Espectáculo de las fuentes mágicas desde las 22:00; espectáculo central de 23:50 a 00:10" },
        { label: "Precio (2025)", value: "Gratis y sin límite de aforo" },
        { label: "Metro", value: "Toda la noche el 31 de diciembre (horario de TMB); en 2024 y 2025 la estación más cercana al espectáculo era Espanya (L1, L3)" },
        { label: "Cuándo salen los detalles", value: "En 2025, el programa salió el 12 de noviembre; los accesos y el transporte, el 29 de diciembre, igual que en 2024" },
      ]),
      callout(
        "info",
        "Cómo tratamos las fechas",
        "Solo ponemos una fecha de 2026-27 cuando el Ayuntamiento o TMB la han publicado. Lo que se hizo en 2024 y 2025 siempre lleva el año al lado: es lo que puedes esperar, no una confirmación.",
      ),
      ...h2(
        "¿Dónde es la fiesta de fin de año en Barcelona?",
        "En 2024 y 2025 el Ayuntamiento la celebró en la avenida de la Reina Maria Cristina, la que sube de la plaza de España a la Fuente Mágica, a los pies de Montjuïc. El espectáculo de 2025, producido por Groupe F con música de Marc Parrot, combinaba fuegos artificiales, drones, audiovisuales y música en cuatro partes inspiradas en el aire, el agua, la tierra y el fuego.",
        "En 2025 la velada empezó a las 22:00 con un espectáculo especial de las fuentes mágicas, y el espectáculo central fue de 23:50 a 00:10: empezaba diez minutos antes de las campanadas y se alargaba los diez primeros minutos del año.",
        plansSentence("es", facts),
      ),
      nightTable("es"),
      ...h2(
        "Cómo se entra: accesos, qué no puedes llevar y espacio reservado",
        "Así funcionó en 2025; los detalles de 2026-27 llegarán con el dispositivo del Ayuntamiento:",
      ),
      list(
        "**Acceso** por filtros de control en la calzada central entre las dos torres venecianas de la plaza de España, con cuatro carriles y personal de seguridad con detectores de metales.",
        "**No se podía entrar** con botellas de vidrio, latas, patinetes eléctricos ni ningún objeto peligroso.",
        "**Sin acceso de público** por la avenida de Rius i Taulet ni por la avenida de Francesc Ferrer i Guàrdia, reservadas para emergencias; al terminar, la salida se hacía por esas vías y por la propia avenida de Maria Cristina.",
        "**Personas con movilidad reducida:** espacio reservado en el cruce de la avenida de Maria Cristina con Rius i Taulet, con aforo limitado y presentando la tarjeta acreditativa, y zona de aparcamiento en Rius i Taulet.",
      ),
      ...h2(
        "Metro y autobuses en Nochevieja",
        "**El metro funciona toda la noche del 31 de diciembre:** el horario general de TMB prevé servicio continuo. En 2024 y 2025 funcionó 43 horas seguidas, desde las 5:00 del 31 de diciembre hasta el final del servicio, a medianoche del 1 de enero; en 2025, con ocho líneas y 165 estaciones abiertas.",
        "En 2025, de 21:00 a 2:00 los trenes pasaban cada 4 minutos o menos en las líneas 1 y 3, y de 2:00 a 5:00, cada 10 minutos o menos en las líneas 1, 4 y 5.",
        "**Estaciones recomendadas (2025):** Espanya (L1 y L3), la más cercana, y también Hostafrancs (L1), Tarragona (L3), Rocafort (L1) y Poble Sec (L3), con personal para regular el paso de gente a la entrada y a la salida.",
        "**Autobuses (2025):** desde las 19:00 se desviaron las líneas 13, 23, 150 y X3 y la ruta roja del Bus Turístic, y desde las 20:00, la D20, H12, H16, 46, 65, 91, 109 y X2, por los cortes de tráfico en la plaza de España.",
        tmbNoticeSentence("es"),
        "Esta tabla aplica el horario general de TMB a la Nochevieja y a los días de Reyes. El 1 de enero de 2027 es viernes, y los viernes el horario general llega hasta las 2:00; TMB lo confirmará en diciembre:",
      ),
      metroTable("es", NYE_METRO_DAYS),
      nightTransportTable("es"),
      ...paras(christmasTransportMention("es")),
      ...h2(
        "Las 12 uvas y otras tradiciones",
        "**Las campanadas.** A medianoche, las doce últimas campanadas del año marcan la cuenta atrás y con cada una se come una uva y se pide un deseo. Según la página de tradiciones del Ayuntamiento de Barcelona, la costumbre no es muy antigua: la sitúa en el excedente de uva de 1909. Después llegan los brindis con cava, los besos y los abrazos.",
        "**L'home dels Nassos.** En Cataluña, el 31 de diciembre se anima a los niños a buscar al hombre que tiene tantas narices como días tiene el año. La gracia es que ese día todos tenemos tantas como días quedan: una.",
        "**La Cursa dels Nassos.** Barcelona celebra desde 1999 esta carrera de San Silvestre, el último día del año, en la que es habitual correr disfrazado.",
        "**El primer baño del año.** El 1 de enero, hacia el mediodía, los más valientes se zambullen en el Mediterráneo, y hay caldo caliente para todos los que se bañan, según el Ayuntamiento.",
        `**La Grossa de Cap d'Any**, la lotería de la Generalitat, se sortea el mismo 31 de diciembre: la hora, los premios y los números premiados están en ${b2link("grossa", "es", "la guía de La Grossa de Cap d'Any")}.`,
        `**La Lotería de Navidad**, la del Estado, se sortea antes, el 22 de diciembre: cómo se cobra y dónde ha tocado en Cataluña, en ${b2link("loteriaNadal", "es", "la guía de la Lotería de Navidad")}.`,
      ),
      ...h2(
        "¿Qué abre el 1 de enero en Barcelona?",
        `El 1 de enero de 2027 es viernes y festivo. Las tiendas con horario general deben cerrar, igual que el 6 de enero; pueden abrir las panaderías, las tiendas de conveniencia, las farmacias y las tiendas de hasta 300 m² de alimentación o de pequeñas empresas. El primer domingo del calendario comercial general de 2027 es el 3 de enero (Orden EMT/89/2026); Barcelona aún no ha publicado sus días de 2027. Todo el detalle, en ${b2link("shops", "es", "la guía de tiendas abiertas en domingos y festivos")}.`,
        `**Monumentos y museos:** la Sagrada Familia abre de 9:00 a 14:00 y La Pedrera, de 11:00 a 20:30; el MNAC y el Museu Picasso cierran. Para el 1 de enero de 2026, TMB avisó de que el Barcelona Bus Turístic no circularía. Para el día de Navidad y San Esteban, mira ${b2link("christmasBarcelona", "es", "Navidad en Barcelona")}.`,
      ),
      ...h2(
        "Reyes: el 5 de enero",
        `${cavalcadaSentence("es", facts)} El 6 de enero de 2027 (miércoles) es festivo y las tiendas con horario general cierran.`,
      ),
      ...seasonLinks("es", ["barcelonaDecember", "christmasLights", "holidayToday"]),

      faq([
        { question: "¿Dónde son los fuegos artificiales de fin de año en Barcelona?", answer: whereAnswer("es", facts) },
        {
          question: "¿La fiesta de Nochevieja de Barcelona es gratis?",
          answer: "La de 2025 fue gratuita y sin límite de aforo. Se entraba por filtros de seguridad en la plaza de España y no se podían llevar botellas de vidrio, latas ni patinetes eléctricos.",
        },
        {
          question: "¿El metro de Barcelona funciona toda la noche en Nochevieja?",
          answer: "Sí. El horario de TMB prevé servicio continuo la noche del 31 de diciembre. En 2024 y 2025 funcionó 43 horas seguidas, de las 5:00 del 31 de diciembre a la medianoche del 1 de enero.",
        },
        {
          question: "¿Cuándo se anunciará la Nochevieja 2026 de Barcelona?",
          answer: `En 2025 el Ayuntamiento anunció el espectáculo en el programa de Navidad, el ${dateYear(PAST.programme2025.published, "es")}, y los accesos y el transporte el ${dateYear(PAST.newYearOps2025.published, "es")}. Su web de Navidad dice que se actualizará hacia noviembre de 2026.`,
        },
        {
          question: "¿Qué son las 12 uvas?",
          answer: "A medianoche se come una uva con cada una de las doce campanadas y se pide un deseo. Después se brinda con cava.",
        },
        ...moreFaq("es", facts),
      ]),
      ...paras(verifiedLine("es", FESTIVE_VERIFIED)),
      ...b2Related([...RELATED], "es"),
    ];
  }

  return [
    lead(newYearLead("en", facts)),
    keyFacts("New Year's Eve at a glance", [
      { label: "2026-27 celebration", value: showFact("en", facts) },
      { label: "Where (2024 and 2025)", value: "Avinguda de la Reina Maria Cristina, between Plaça d'Espanya and the Magic Fountain" },
      { label: "Times (2025)", value: "Magic Fountain show from 22:00; main show 23:50 to 00:10" },
      { label: "Price (2025)", value: "Free, with no capacity limit" },
      { label: "Metro", value: "All night on 31 December (TMB timetable); in 2024 and 2025 the nearest station to the show was Espanya (L1, L3)" },
      { label: "When details come out", value: "In 2025 the programme came out on 12 November, and entry and transport details on 29 December, as in 2024" },
    ]),
    callout(
      "info",
      "How we handle dates",
      "We give a 2026-27 date only once the City Council or TMB has published it. What happened in 2024 and 2025 always carries its year: it is what you can expect, not a confirmation.",
    ),
    ...h2(
      "Where is the New Year's Eve celebration in Barcelona?",
      "In 2024 and 2025 the City Council held it on Avinguda de la Reina Maria Cristina, the avenue that rises from Plaça d'Espanya to the Magic Fountain at the foot of Montjuïc. The 2025 show, produced by Groupe F with music by Marc Parrot, combined fireworks, drones, audiovisuals and music in four parts inspired by air, water, earth and fire.",
      "In 2025 the evening began at 22:00 with a special Magic Fountains show, and the main show ran from 23:50 to 00:10, starting ten minutes before the midnight chimes and running into the first ten minutes of the year.",
      plansSentence("en", facts),
    ),
    nightTable("en"),
    ...h2(
      "Getting in: entry points, what you cannot bring, accessible area",
      "This is how it worked in 2025; the 2026-27 details will come with the City Council's plan:",
    ),
    list(
      "**Entry** through control filters on the central carriageway between the two Venetian Towers of Plaça d'Espanya, with four lanes and security staff using metal detectors.",
      "**Not allowed in:** glass bottles, cans, electric scooters and any dangerous object.",
      "**No public entry** from Avinguda de Rius i Taulet or Avinguda de Francesc Ferrer i Guàrdia, which were kept for emergencies; after the show people left along those streets and along Avinguda de Maria Cristina itself.",
      "**Reduced mobility:** a reserved area at the junction of Avinguda de Maria Cristina and Rius i Taulet, with limited places and on showing the accreditation card, and a parking area on Rius i Taulet.",
    ),
    ...h2(
      "Metro and buses on New Year's Eve",
      "**The metro runs all night on 31 December:** TMB's standing timetable lists \"continuous service throughout New Year's Eve\". In 2024 and 2025 it ran for 43 hours without a break, from 5:00 on 31 December until the end of service at midnight on 1 January; in 2025, with eight lines and 165 stations open.",
      "In 2025, from 21:00 to 2:00 trains ran every 4 minutes or less on lines 1 and 3, and from 2:00 to 5:00 every 10 minutes or less on lines 1, 4 and 5.",
      "**Recommended stations (2025):** Espanya (L1, L3), the closest, and also Hostafrancs (L1), Tarragona (L3), Rocafort (L1) and Poble Sec (L3), with staff managing the crowds on the way in and out.",
      "**Buses (2025):** from 19:00, lines 13, 23, 150 and X3 and the Bus Turístic red route were diverted, and from 20:00 lines D20, H12, H16, 46, 65, 91, 109 and X2, because of the road closures at Plaça d'Espanya.",
      tmbNoticeSentence("en"),
        "This table applies TMB's standing timetable to New Year's Eve and the Three Kings days. 1 January 2027 is a Friday, and on Fridays the standing timetable runs to 2:00; TMB will confirm in December:",
    ),
    metroTable("en", NYE_METRO_DAYS),
    nightTransportTable("en"),
    ...paras(christmasTransportMention("en")),
    ...h2(
      "The 12 grapes and other New Year traditions",
      "**The chimes.** At midnight the last twelve chimes of the year count down, and with each one you eat a grape and make a wish. Barcelona City Council's traditions page says the custom is fairly recent and traces it to a grape surplus in 1909. Then come the toasts with cava, the kisses and the hugs.",
      "**L'home dels Nassos.** On 31 December Catalan children are sent to look for the Man with the Noses, who has as many noses as there are days in the year. The joke is that on that day everyone has as many as there are days left: one.",
      "**Cursa dels Nassos.** Barcelona has run this Sant Silvestre race on the last day of the year since 1999, and running in fancy dress is the norm.",
      "**First swim of the year.** On 1 January, around midday, the bravest take a group dip in the Mediterranean, with hot broth for everyone who goes in, according to the City Council.",
      `**La Grossa de Cap d'Any**, the Catalan government's lottery, is drawn on 31 December itself: the time, the prizes and the winning numbers are in ${b2link("grossa", "en", "our La Grossa de Cap d'Any guide")}.`,
      `**The Spanish Christmas Lottery** (El Gordo), the state's, is drawn earlier, on 22 December: how to claim and where it fell in Catalonia are in ${b2link("loteriaNadal", "en", "our Spanish Christmas Lottery guide")}.`,
    ),
    ...h2(
      "What is open on 1 January in Barcelona?",
      `1 January 2027 is a Friday and a public holiday. Shops on the general timetable must close, as on 6 January; bakeries, convenience stores, pharmacies and shops of up to 300 m² selling everyday food or run by small businesses may open. The first Sunday in the 2027 general shopping calendar is 3 January (Ordre EMT/89/2026); Barcelona has not yet published its own 2027 days. Details in ${b2link("shops", "en", "our guide to shops open on Sundays and holidays")}.`,
      `**Sights and museums:** the Sagrada Família opens 9:00 to 14:00 and La Pedrera 11:00 to 20:30; MNAC and the Museu Picasso are closed. For 1 January 2026, TMB said the Barcelona Bus Turístic would not run. For Christmas Day and Sant Esteve, see ${b2link("christmasBarcelona", "en", "Christmas in Barcelona")}.`,
    ),
    ...h2(
      "Three Kings: 5 January",
      `${cavalcadaSentence("en", facts)} 6 January 2027 (a Wednesday) is a public holiday and shops on the general timetable close.`,
    ),
    ...seasonLinks("en", ["barcelonaDecember", "christmasLights", "holidayToday"]),

    faq([
      { question: "Where are the New Year's Eve fireworks in Barcelona?", answer: whereAnswer("en", facts) },
      {
        question: "Is New Year's Eve in Barcelona free?",
        answer: "The 2025 show was free, with no capacity limit. Entry was through security filters at Plaça d'Espanya, and glass bottles, cans and electric scooters were not allowed.",
      },
      {
        question: "Does the Barcelona metro run all night on New Year's Eve?",
        answer: "Yes. TMB's timetable lists continuous service on the night of 31 December. In 2024 and 2025 it ran for 43 hours nonstop, from 5:00 on 31 December to midnight on 1 January.",
      },
      {
        question: "When will Barcelona announce its New Year's Eve 2026 plans?",
        answer: `In 2025 the City Council announced the show in its Christmas programme on ${dateYear(PAST.programme2025.published, "en")}, and the entry and transport arrangements on ${dateYear(PAST.newYearOps2025.published, "en")}. Its Christmas website says it will be updated around November 2026.`,
      },
      {
        question: "What are the 12 grapes?",
        answer: "At midnight you eat one grape with each of the twelve chimes and make a wish. Then everyone toasts with cava.",
      },
      ...moreFaq("en", facts),
    ]),
    ...paras(verifiedLine("en", FESTIVE_VERIFIED)),
    ...b2Related([...RELATED], "en"),
  ];
}

export const NEW_YEAR: B2Article = {
  key: "newYear",
  entryKey: "guide-new-years-eve-barcelona",
  categoryKey: "festivals",
  sources: SOURCES,
  // Reused from the manifest, not a new photograph (see the header comment).
  heroKey: "montjuic-font-magica-nit",
  // Same alt and caption as MONTJUIC: media rows are keyed by file, so
  // different wording here would overwrite that page's on every publish.
  heroAlt: MONTJUIC.heroAlt,
  heroCaption: MONTJUIC.heroCaption,
  verifiedAt: FESTIVE_VERIFIED,
  publishedAt: "2026-10-25T12:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...NEW_YEAR_META[locale], blocks: buildNewYearBody(locale) }]),
  ) as B2Article["editions"],
};
