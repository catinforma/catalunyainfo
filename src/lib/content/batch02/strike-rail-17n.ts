import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import {
  B2_PATHS,
  b2Related,
  b2link,
  faq,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";
import { STRIKES, STRIKES_AS_OF, STRIKES_VERIFIED, STRIKE_URLS, type Strike } from "./strikes";
import { STRIKES_SPAIN_AS_OF, STRIKES_SPAIN_VERIFIED, SPAIN_STRIKES } from "./strikes-spain-data";
import { fillChecked } from "./strikes-spain";
import type { SpainStrike } from "./strikes-spain-model";
import { TRAINS } from "@/lib/content/features/trains";

/**
 * "Huelga de trenes del 17 de noviembre en España" (13 Nov 2026), in Catalan,
 * Spanish and English.
 *
 * Why (GSC 7-13 Nov, docs/SEO_EXPERIMENTS.md, 13 Nov): rail-strike queries
 * ran at ~2,500 impressions a week, most of them Spain-wide and in Spanish
 * ("huelga renfe noviembre 2026" 347 at position 10, "huelga de trenes
 * noviembre 2026", "huelga cercanias sevilla/malaga/zaragoza"), and they
 * landed on the Renfe guide, which speaks about Rodalies. On 12 Nov the 17 Nov
 * strike grew into a call by every union at the Renfe Group (FeSMC-UGT, CCOO,
 * SF-Intersindical, SEMAF, ALFERRO, SFF-CGT, per the Generalitat's order of
 * that day) plus Adif: the same shape as 11N, whose Spain-wide pages carried
 * the site's traffic. This page answers the Spain-wide question; the Renfe
 * guide keeps Rodalies, and each links the other.
 *
 * SINGLE SOURCE OF TRUTH: no fact about the strike is typed here. Who calls
 * it, the days, hours and scope and the Ministry's minimum services come from
 * the Spain entry (`strikes-spain-data.ts`, "huelga-ferroviaria-2026-11-17");
 * Rodalies' minimum services from the Catalan entry (`strikes.ts`,
 * "vaga-ferroviaria-2026-11-17"); the 23 Nov strike from its Spain entry.
 * What this module adds: the list of Renfe's Cercanías networks (renfe.com,
 * read 13 Nov 2026) and who sets minimum services on each, and the 10 Nov
 * precedent figures from Renfe's own notice, printed only while the
 * Ministry's resolution for the 17th is not out and always labelled as the
 * 10 Nov strike's.
 *
 * Dates: before / during / after from STRIKES_AS_OF only (no clock), like
 * every strike page; the `strikes` group republishes it with the hub, so the
 * strike watch that moves the as-of moves this page too.
 */

export const RAIL_17N_ID = { spain: "huelga-ferroviaria-2026-11-17", catalan: "vaga-ferroviaria-2026-11-17", next: "huelga-renfe-2026-11-23" } as const;

/** Renfe's Cercanías networks outside Catalonia, as renfe.com/es/es/cercanias lists them (read 13 Nov 2026). */
export const CERCANIAS_NETWORKS = [
  "Madrid",
  "Valencia",
  "Sevilla",
  "Málaga",
  "Bilbao",
  "San Sebastián",
  "Asturias",
  "Cantabria",
  "Murcia/Alicante",
  "Zaragoza",
  "Cádiz",
  "León",
  "Cartagena",
  "Ferrol",
] as const;

const RENFE_CERCANIAS = "https://www.renfe.com/es/es/cercanias";
const U = STRIKE_URLS;
const link = (href: string, label: string) => `[${label}](${href})`;
const heading = (level: 2 | 3, text: string, id?: string): Block => ({ type: "heading", level, text, ...(id ? { id } : {}) }) as Block;

export type Rail17nPhase = "before" | "during" | "after";

function spainEntry(strikes: readonly SpainStrike[] = SPAIN_STRIKES): SpainStrike {
  const found = strikes.find((s) => s.id === RAIL_17N_ID.spain);
  if (!found) throw new Error(`strike-rail-17n: no Spain entry ${RAIL_17N_ID.spain}`);
  return found;
}

function catalanEntry(strikes: readonly Strike[] = STRIKES): Strike {
  const found = strikes.find((s) => s.id === RAIL_17N_ID.catalan);
  if (!found) throw new Error(`strike-rail-17n: no Catalan entry ${RAIL_17N_ID.catalan}`);
  return found;
}

/** The strike's days, from its Spain entry: ["2026-11-17", "2026-11-19"]. */
export function rail17nDays(): string[] {
  return [...spainEntry().dates];
}

export function rail17nPhase(asOf: string = STRIKES_AS_OF): Rail17nPhase {
  const days = rail17nDays();
  if (asOf < (days[0] ?? "")) return "before";
  if (asOf > (days[days.length - 1] ?? "")) return "after";
  return "during";
}

/** The earlier of the two hubs' verification dates: the page never claims a re-check it did not get. */
export const RAIL_17N_VERIFIED = STRIKES_VERIFIED < STRIKES_SPAIN_VERIFIED ? STRIKES_VERIFIED : STRIKES_SPAIN_VERIFIED;

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

interface Copy {
  lead: (phase: Rail17nPhase, msPending: boolean) => string;
  factsTitle: string;
  labels: { when: string; who: string; scope: string; rodalies: string; state: string; notIn: string };
  when: string;
  who: string;
  whoHeading: string;
  whoId: string;
  notIn: string;
  statePending: string;
  statePublished: string;
  msHeading: string;
  msId: string;
  stateSub: string;
  rodaliesSub: string;
  precedent: (renfe: string) => string;
  networksHeading: string;
  networksId: string;
  networksIntro: (renfe: string) => string;
  caption: string;
  headers: [string, string, string];
  ministry: string;
  generalitat: string;
  pending: string;
  rodaliesRow: string;
  networksNote: string;
  rodaliesGuide: (href: string) => string;
  ticketsHeading: string;
  tickets: string[];
  nextHeading: string;
  nextId: string;
  next23: (title: string, scope: string) => string;
  nextLinks: (locale: Locale) => string[];
  faq: (msState: string, rodalies: string) => { question: string; answer: string }[];
}

const COPY: Record<Locale, Copy> = {
  es: {
    lead: (phase, msPending) => {
      const who = "toda la plantilla del Grupo Renfe (Cercanías, Rodalies, Media Distancia, AVE y Larga Distancia) y Adif, convocada por FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO y SFF-CGT; SEMAF llama también a los maquinistas de Iryo y Ouigo";
      const ms = msPending
        ? "Los servicios mínimos del Ministerio de Transportes para Cercanías, Media Distancia y AVE aún no se han publicado; en Rodalies, la Generalitat ya los ha fijado."
        : "Los servicios mínimos, red por red, están más abajo.";
      if (phase === "after") return `**El martes 17 de noviembre de 2026 hubo huelga de trenes en toda España,** de 0.00 a 23.59 h: ${who}. El jueves 19 pararon los responsables de circulación de Adif (SCF). Más abajo, los servicios mínimos que se fijaron.`;
      if (phase === "during") return `**Huelga de trenes del martes 17 de noviembre (Grupo Renfe y Adif, de 0.00 a 23.59 h) y del jueves 19 (circulación de Adif):** ${who}. ${ms}`;
      return `**El martes 17 de noviembre de 2026 hay huelga de trenes en toda España,** de 0.00 a 23.59 h: ${who}. El jueves 19 paran los responsables de circulación de Adif (SCF). ${ms}`;
    },
    factsTitle: "La huelga de trenes, de un vistazo",
    labels: { when: "Cuándo", who: "Quién convoca", scope: "A quién afecta", rodalies: "Rodalies (Cataluña)", state: "Cercanías, Media Distancia y AVE", notIn: "Fuera de la huelga" },
    when: "Martes 17 de noviembre, de 0.00 a 23.59 h (Grupo Renfe y Adif); jueves 19, paros de 24 horas en Adif",
    who: "FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO y SFF-CGT en el Grupo Renfe; los sindicatos del comité de empresa de Adif; SCF en Adif (17 y 19)",
    whoHeading: "Quién convoca la huelga de trenes",
    whoId: "quien-convoca",
    notIn: "Metro, autobuses, tranvías y trenes autonómicos que no son de Renfe (FGC, Euskotren, Metrovalencia, Serveis Ferroviaris de Mallorca): no forman parte de las convocatorias publicadas",
    statePending: "Por confirmar: los fija el Ministerio de Transportes y aún no se han publicado",
    statePublished: "Publicados por el Ministerio de Transportes: en «Servicios mínimos»",
    msHeading: "Servicios mínimos: qué trenes funcionan el 17 de noviembre",
    msId: "servicios-minimos",
    stateSub: "**Cercanías, Media Distancia, AVE y Larga Distancia, Iryo, Ouigo y Adif (Ministerio de Transportes).**",
    rodaliesSub: "**Rodalies de Catalunya y regionales (Generalitat).**",
    precedent: (renfe) =>
      `**Como referencia, no son los del 17:** para la huelga de maquinistas de Renfe del 10 de noviembre, el Ministerio fijó en Cercanías el 75 % del servicio en hora punta (de 6.00 a 9.00, de 13.30 a 15.30 y de 18.30 a 20.30 h) y el 50 % el resto del día, una media del 65 % en Media Distancia y el 72 % en AVE y Larga Distancia, según ${link(renfe, "el aviso de Renfe del 6 de noviembre")}. La resolución del 17 puede fijar otros porcentajes.`,
    networksHeading: "Cercanías: red por red",
    networksId: "cercanias",
    networksIntro: (renfe) =>
      `Todas las redes de Cercanías las opera Renfe, cuya plantilla está llamada a la huelga del 17. Los servicios mínimos los fija el Ministerio de Transportes para todas a la vez, salvo Rodalies de Catalunya, que los recibe de la Generalitat. Los horarios de cada red, en ${link(renfe, "renfe.com")}.`,
    caption: "Huelga de trenes del 17 de noviembre: servicios mínimos en cada red de Cercanías",
    headers: ["Red", "Quién fija los mínimos", "Servicios mínimos del 17"],
    ministry: "Ministerio de Transportes",
    generalitat: "Generalitat de Catalunya",
    pending: "Por confirmar",
    rodaliesRow: "66 % en hora punta y 33 % el resto del día",
    networksNote: "Las redes, como las lista renfe.com. Si el Ministerio fija cifras distintas por red, se verán aquí cuando publique la resolución.",
    rodaliesGuide: (href) => `Líneas, horarios de servicios mínimos y avisos en directo de Rodalies: ${link(href, "la guía de la huelga de Renfe y Rodalies")}.`,
    ticketsHeading: "Si tienes billete de AVE, Larga Distancia, Iryo u Ouigo",
    tickets: [
      `**Renfe:** el cambio o la devolución depende de Renfe; sigue lo que publique en ${link(U.renfe, "renfe.com")} o te envíe por correo cuando se conozcan los trenes que circulan.`,
      "**Iryo y Ouigo:** SEMAF llama a sus maquinistas; cada compañía avisa a sus viajeros de los trenes afectados.",
      "**Mira tu tren la víspera y la misma mañana:** con servicios mínimos no circulan todos los trenes de tu hora.",
    ],
    nextHeading: "Después del 17 y el 19",
    nextId: "despues",
    next23: (title, scope) => `**Lunes 23 de noviembre: ${title}.** ${scope}`,
    nextLinks: (locale) => [
      b2link("strikesSpain", locale, "Todas las huelgas convocadas en España, día a día"),
      b2link("strikeEducation", locale, "Huelga educativa en Cataluña el jueves 26 de noviembre: ¿hay colegio?"),
    ],
    faq: (msState, rodalies) => [
      { question: "¿Hay huelga de trenes el 17 de noviembre?", answer: "Sí. El martes 17 de noviembre de 2026, de 0.00 a 23.59 h, está convocada toda la plantilla del Grupo Renfe (Cercanías, Rodalies, Media Distancia, AVE y Larga Distancia) y Adif, y SEMAF llama también a los maquinistas de Iryo, Ouigo y otras operadoras." },
      { question: "¿Qué servicios mínimos hay en Cercanías el 17 de noviembre?", answer: msState },
      { question: "¿Y en Rodalies?", answer: rodalies },
      { question: "¿Hay huelga de trenes el 19 de noviembre?", answer: "El jueves 19 de noviembre la convoca solo el sindicato SCF, para el personal de circulación de Adif, con paros de 24 horas. Sus servicios mínimos los fija el Ministerio de Transportes." },
      { question: "¿La huelga de trenes afecta al metro?", answer: "No: el metro, los autobuses y los tranvías no forman parte de las convocatorias publicadas para el 17 y el 19, ni los trenes autonómicos que no son de Renfe, como FGC, Euskotren o Metrovalencia." },
    ],
  },
  ca: {
    lead: (phase, msPending) => {
      const who = "tot el personal del Grup Renfe (Rodalies, Cercanías, Mitja Distància, AVE i Llarga Distància) i Adif, convocada per FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO i SFF-CGT; SEMAF també crida els maquinistes d'Iryo i Ouigo";
      const ms = msPending
        ? "Els serveis mínims del Ministeri de Transports per a Cercanías, Mitja Distància i AVE encara no s'han publicat; a Rodalies, la Generalitat ja els ha fixat."
        : "Els serveis mínims, xarxa per xarxa, són més avall.";
      if (phase === "after") return `**El dimarts 17 de novembre de 2026 hi va haver vaga de trens a tot Espanya,** de 0.00 a 23.59 h: ${who}. El dijous 19 van aturar-se els responsables de circulació d'Adif (SCF). Més avall, els serveis mínims que es van fixar.`;
      if (phase === "during") return `**Vaga de trens del dimarts 17 de novembre (Grup Renfe i Adif, de 0.00 a 23.59 h) i del dijous 19 (circulació d'Adif):** ${who}. ${ms}`;
      return `**El dimarts 17 de novembre de 2026 hi ha vaga de trens a tot Espanya,** de 0.00 a 23.59 h: ${who}. El dijous 19 s'aturen els responsables de circulació d'Adif (SCF). ${ms}`;
    },
    factsTitle: "La vaga de trens, d'un cop d'ull",
    labels: { when: "Quan", who: "Qui la convoca", scope: "A qui afecta", rodalies: "Rodalies (Catalunya)", state: "Cercanías, Mitja Distància i AVE", notIn: "Fora de la vaga" },
    when: "Dimarts 17 de novembre, de 0.00 a 23.59 h (Grup Renfe i Adif); dijous 19, aturades de 24 hores a Adif",
    who: "FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO i SFF-CGT al Grup Renfe; els sindicats del comitè d'empresa d'Adif; SCF a Adif (17 i 19)",
    whoHeading: "Qui convoca la vaga de trens",
    whoId: "qui-convoca",
    notIn: "Metro, autobusos, tramvies i trens autonòmics que no són de Renfe (FGC, Euskotren, Metrovalencia, Serveis Ferroviaris de Mallorca): no formen part de les convocatòries publicades",
    statePending: "Per confirmar: els fixa el Ministeri de Transports i encara no s'han publicat",
    statePublished: "Publicats pel Ministeri de Transports: a «Serveis mínims»",
    msHeading: "Serveis mínims: quins trens funcionen el 17 de novembre",
    msId: "serveis-minims",
    stateSub: "**Cercanías, Mitja Distància, AVE i Llarga Distància, Iryo, Ouigo i Adif (Ministeri de Transports).**",
    rodaliesSub: "**Rodalies de Catalunya i regionals (Generalitat).**",
    precedent: (renfe) =>
      `**Com a referència, no són els del 17:** per a la vaga de maquinistes de Renfe del 10 de novembre, el Ministeri va fixar a Cercanías el 75 % del servei en hora punta (de 6.00 a 9.00, de 13.30 a 15.30 i de 18.30 a 20.30 h) i el 50 % la resta del dia, una mitjana del 65 % a Mitja Distància i el 72 % a l'AVE i la Llarga Distància, segons ${link(renfe, "l'avís de Renfe del 6 de novembre")}. La resolució del 17 pot fixar altres percentatges.`,
    networksHeading: "Cercanías: xarxa per xarxa",
    networksId: "cercanias",
    networksIntro: (renfe) =>
      `Totes les xarxes de Cercanías les opera Renfe, el personal de la qual està cridat a la vaga del 17. Els serveis mínims els fixa el Ministeri de Transports per a totes alhora, llevat de Rodalies de Catalunya, que els rep de la Generalitat. Els horaris de cada xarxa, a ${link(renfe, "renfe.com")}.`,
    caption: "Vaga de trens del 17 de novembre: serveis mínims a cada xarxa de Cercanías",
    headers: ["Xarxa", "Qui fixa els mínims", "Serveis mínims del 17"],
    ministry: "Ministeri de Transports",
    generalitat: "Generalitat de Catalunya",
    pending: "Per confirmar",
    rodaliesRow: "66 % en hora punta i 33 % la resta del dia",
    networksNote: "Les xarxes, com les llista renfe.com. Si el Ministeri fixa xifres diferents per xarxa, es veuran aquí quan publiqui la resolució.",
    rodaliesGuide: (href) => `Línies, horaris de serveis mínims i avisos en directe de Rodalies: ${link(href, "la guia de la vaga de Renfe i Rodalies")}.`,
    ticketsHeading: "Si tens bitllet d'AVE, Llarga Distància, Iryo o Ouigo",
    tickets: [
      `**Renfe:** el canvi o la devolució depèn de Renfe; segueix el que publiqui a ${link(U.renfe, "renfe.com")} o t'enviï per correu quan se sàpiga quins trens circulen.`,
      "**Iryo i Ouigo:** SEMAF crida els seus maquinistes; cada companyia avisa els seus viatgers dels trens afectats.",
      "**Mira el teu tren la vigília i el mateix matí:** amb serveis mínims no circulen tots els trens de la teva hora.",
    ],
    nextHeading: "Després del 17 i el 19",
    nextId: "despres",
    next23: (title, scope) => `**Dilluns 23 de novembre: ${title}.** ${scope}`,
    nextLinks: (locale) => [
      b2link("strikesSpain", locale, "Totes les vagues convocades a Espanya, dia a dia"),
      b2link("strikeEducation", locale, "Vaga a l'educació a Catalunya el dijous 26 de novembre: hi ha escola?"),
    ],
    faq: (msState, rodalies) => [
      { question: "Hi ha vaga de trens el 17 de novembre?", answer: "Sí. El dimarts 17 de novembre de 2026, de 0.00 a 23.59 h, hi està convocat tot el personal del Grup Renfe (Rodalies, Cercanías, Mitja Distància, AVE i Llarga Distància) i Adif, i SEMAF també crida els maquinistes d'Iryo, Ouigo i altres operadores." },
      { question: "Quins serveis mínims hi ha a Cercanías el 17 de novembre?", answer: msState },
      { question: "I a Rodalies?", answer: rodalies },
      { question: "Hi ha vaga de trens el 19 de novembre?", answer: "El dijous 19 de novembre la convoca només el sindicat SCF, per al personal de circulació d'Adif, amb aturades de 24 hores. Els serveis mínims els fixa el Ministeri de Transports." },
      { question: "La vaga de trens afecta el metro?", answer: "No: el metro, els autobusos i els tramvies no formen part de les convocatòries publicades per al 17 i el 19, ni els trens autonòmics que no són de Renfe, com FGC, Euskotren o Metrovalencia." },
    ],
  },
  en: {
    lead: (phase, msPending) => {
      const who = "all Renfe Group staff (Cercanías and Rodalies commuter trains, Media Distancia, AVE and long distance) and Adif, called by FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO and SFF-CGT; SEMAF also calls out drivers at Iryo and Ouigo";
      const ms = msPending
        ? "The Ministry of Transport's minimum services for Cercanías, Media Distancia and AVE have not been published yet; for Rodalies, the Generalitat has set them."
        : "Minimum services, network by network, are below.";
      if (phase === "after") return `**On Tuesday 17 November 2026 there was a rail strike across Spain,** 00:00 to 23:59: ${who}. On Thursday 19 Adif's traffic controllers (SCF) stopped work. The minimum services that were set are below.`;
      if (phase === "during") return `**Rail strike on Tuesday 17 November (Renfe Group and Adif, 00:00 to 23:59) and Thursday 19 (Adif traffic control):** ${who}. ${ms}`;
      return `**On Tuesday 17 November 2026 there is a rail strike across Spain,** 00:00 to 23:59: ${who}. On Thursday 19 Adif's traffic controllers (SCF) stop work. ${ms}`;
    },
    factsTitle: "The rail strike at a glance",
    labels: { when: "When", who: "Called by", scope: "Who is called out", rodalies: "Rodalies (Catalonia)", state: "Cercanías, Media Distancia and AVE", notIn: "Not part of it" },
    when: "Tuesday 17 November, 00:00 to 23:59 (Renfe Group and Adif); Thursday 19, 24-hour stoppages at Adif",
    who: "FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO and SFF-CGT at the Renfe Group; the unions on Adif's works council; SCF at Adif (17th and 19th)",
    whoHeading: "Who called the rail strike",
    whoId: "who-called-it",
    notIn: "Metro, buses, trams and regional railways not run by Renfe (FGC, Euskotren, Metrovalencia, Serveis Ferroviaris de Mallorca): not part of the published calls",
    statePending: "To be confirmed: the Ministry of Transport sets them and has not published them yet",
    statePublished: "Published by the Ministry of Transport: see \"Minimum services\"",
    msHeading: "Minimum services: which trains run on 17 November",
    msId: "minimum-services",
    stateSub: "**Cercanías, Media Distancia, AVE and long distance, Iryo, Ouigo and Adif (Ministry of Transport).**",
    rodaliesSub: "**Rodalies de Catalunya and regional trains (Generalitat).**",
    precedent: (renfe) =>
      `**For reference only, not the 17th's:** for the Renfe drivers' strike of 10 November, the Ministry set 75% of the usual Cercanías service at peak times (06:00 to 09:00, 13:30 to 15:30 and 18:30 to 20:30) and 50% the rest of the day, 65% on average on Media Distancia and 72% on AVE and long distance, according to ${link(renfe, "Renfe's notice of 6 November")}. The resolution for the 17th may set other percentages.`,
    networksHeading: "Cercanías commuter trains: network by network",
    networksId: "cercanias",
    networksIntro: (renfe) =>
      `Renfe runs every Cercanías network, and its staff are called out on the 17th. The Ministry of Transport sets minimum services for all of them at once, except Rodalies de Catalunya, whose are set by the Generalitat. Each network's timetables are on ${link(renfe, "renfe.com")}.`,
    caption: "Rail strike on 17 November: minimum services on each Cercanías network",
    headers: ["Network", "Who sets minimum services", "Minimum services on the 17th"],
    ministry: "Ministry of Transport",
    generalitat: "Generalitat de Catalunya",
    pending: "To be confirmed",
    rodaliesRow: "66% at peak times, 33% the rest of the day",
    networksNote: "Networks as renfe.com lists them. If the Ministry sets different figures per network, they will show here once its resolution is out.",
    rodaliesGuide: (href) => `Rodalies lines, minimum-service timetables and live notices: ${link(href, "our Renfe and Rodalies strike guide")}.`,
    ticketsHeading: "Holding an AVE, long-distance, Iryo or Ouigo ticket",
    tickets: [
      `**Renfe:** changes and refunds depend on Renfe; follow what it publishes on ${link(U.renfe, "renfe.com")} or emails you once the running trains are known.`,
      "**Iryo and Ouigo:** SEMAF calls out their drivers; each company tells its passengers which trains are affected.",
      "**Check your train the evening before and that morning:** under minimum services not every train at your usual time runs.",
    ],
    nextHeading: "After the 17th and 19th",
    nextId: "after",
    next23: (title, scope) => `**Monday 23 November: ${title}.** ${scope}`,
    nextLinks: (locale) => [
      b2link("strikesSpain", locale, "Every strike called in Spain, day by day"),
      b2link("strikeEducation", locale, "Catalonia education strike on Thursday 26 November: is there school?"),
    ],
    faq: (msState, rodalies) => [
      { question: "Is there a rail strike in Spain on 17 November?", answer: "Yes. On Tuesday 17 November 2026, 00:00 to 23:59, all Renfe Group staff (Cercanías, Rodalies, Media Distancia, AVE and long distance) and Adif are called out, and SEMAF also calls out drivers at Iryo, Ouigo and other operators." },
      { question: "What minimum services are there on Cercanías on 17 November?", answer: msState },
      { question: "And on Rodalies?", answer: rodalies },
      { question: "Is there a rail strike on 19 November?", answer: "On Thursday 19 November only the SCF union calls one, for Adif's traffic-control staff, with 24-hour stoppages. The Ministry of Transport sets its minimum services." },
      { question: "Does the rail strike affect the metro?", answer: "No: metros, buses and trams are not part of the calls published for the 17th and 19th, nor are regional railways not run by Renfe, such as FGC, Euskotren or Metrovalencia." },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RENFE_PRECEDENT = U.renfeSemaf1012;

export function buildRail17nBody(locale: Locale, asOf: string = STRIKES_AS_OF): Block[] {
  const t = COPY[locale];
  const spain = spainEntry();
  const catalan = catalanEntry();
  const phase = rail17nPhase(asOf);
  const msPending = spain.minimumServices.status !== "published";
  const stateText = fillChecked(spain.minimumServices.text, locale, STRIKES_SPAIN_AS_OF);
  const rodaliesText = catalan.minimumServices.text[locale];
  const stateCell = msPending ? t.pending : t.statePublished;
  const rodaliesCell = catalan.minimumServices.status === "published" ? t.rodaliesRow : t.pending;
  const next = SPAIN_STRIKES.find((s) => s.id === RAIL_17N_ID.next);
  const renfeGuide = `/${locale}/${B2_PATHS.strikeRenfe[locale]}/`;

  const rows = [
    ...CERCANIAS_NETWORKS.map((network) => [network, t.ministry, stateCell]),
    ["Rodalies de Catalunya", t.generalitat, rodaliesCell],
  ];

  return [
    lead(t.lead(phase, msPending)),
    keyFacts(t.factsTitle, [
      { label: t.labels.when, value: t.when },
      { label: t.labels.who, value: t.who },
      { label: t.labels.scope, value: spain.scope[locale] },
      { label: t.labels.state, value: msPending ? t.statePending : t.statePublished },
      { label: t.labels.rodalies, value: catalan.minimumServices.msShort[locale].replace(/^Rodalies: /, "") },
      { label: t.labels.notIn, value: t.notIn },
    ]),
    heading(2, t.whoHeading, t.whoId),
    ...paras(spain.calledBy[locale]),
    heading(2, t.msHeading, t.msId),
    ...paras(`${t.stateSub} ${stateText}`, ...(msPending ? [t.precedent(RENFE_PRECEDENT)] : []), `${t.rodaliesSub} ${rodaliesText}`),
    heading(2, t.networksHeading, t.networksId),
    ...paras(t.networksIntro(RENFE_CERCANIAS)),
    table(t.caption, [...t.headers], rows, t.networksNote),
    ...paras(t.rodaliesGuide(renfeGuide)),
    heading(2, t.ticketsHeading),
    list(...t.tickets),
    heading(2, t.nextHeading, t.nextId),
    list(...(next ? [t.next23(next.title[locale], next.scope[locale])] : []), ...t.nextLinks(locale)),
    faq(t.faq(stateText, rodaliesText)),
    ...paras(verifiedLine(locale, RAIL_17N_VERIFIED)),
    ...b2Related(["strikeRenfe", "strikesSpain", "strikes"], locale),
  ];
}

/* -------------------------------------------------------------------------- */
/* Meta and article                                                           */
/* -------------------------------------------------------------------------- */

const META: Record<Locale, { title: string; seoTitle: string; before: string; after: string; excerpt: string }> = {
  es: {
    title: "Huelga de trenes del 17 de noviembre en España: Renfe, Adif, Cercanías, AVE y servicios mínimos",
    seoTitle: "Huelga de trenes 17 noviembre en España: Cercanías y AVE",
    before: "Martes 17 de noviembre, de 0.00 a 23.59 h: huelga en Renfe y Adif en toda España. Servicios mínimos en Cercanías, Rodalies y AVE, red por red.",
    after: "El 17 de noviembre de 2026 hubo huelga en Renfe y Adif en toda España: quién la convocó y los servicios mínimos que se fijaron, red por red.",
    excerpt: "La huelga de trenes del 17 de noviembre de 2026 en toda España: quién la convoca, Cercanías red por red, Rodalies, AVE y servicios mínimos.",
  },
  ca: {
    title: "Vaga de trens del 17 de novembre a Espanya: Renfe, Adif, Cercanías, AVE i serveis mínims",
    seoTitle: "Vaga de trens 17 novembre a Espanya: Cercanías i AVE",
    before: "Dimarts 17 de novembre, de 0.00 a 23.59 h: vaga a Renfe i Adif a tot Espanya. Serveis mínims a Cercanías, Rodalies i AVE, xarxa per xarxa.",
    after: "El 17 de novembre de 2026 hi va haver vaga a Renfe i Adif a tot Espanya: qui la va convocar i els serveis mínims que es van fixar.",
    excerpt: "La vaga de trens del 17 de novembre de 2026 a tot Espanya: qui la convoca, Cercanías xarxa per xarxa, Rodalies, AVE i serveis mínims.",
  },
  en: {
    title: "Spain rail strike on 17 November: Renfe, Adif, Cercanías, AVE and minimum services",
    seoTitle: "Spain rail strike 17 November: Cercanías, AVE, what runs",
    before: "Tuesday 17 November, 00:00 to 23:59: strike at Renfe and Adif across Spain. Minimum services on Cercanías, Rodalies and AVE, network by network.",
    after: "On 17 November 2026 Renfe and Adif staff went on strike across Spain: who called it and the minimum services that were set, network by network.",
    excerpt: "The rail strike of 17 November 2026 across Spain: who called it, Cercanías network by network, Rodalies, AVE and minimum services.",
  },
};

export function rail17nDescription(locale: Locale, asOf: string = STRIKES_AS_OF): string {
  return rail17nPhase(asOf) === "after" ? META[locale].after : META[locale].before;
}

/** Every external link the page carries, named: the Spain and Catalan entries' sources plus Renfe's pages. */
export function rail17nSources(): B2Source[] {
  const all: B2Source[] = [];
  const add = (source: B2Source) => {
    if (!all.some((s) => s.url === source.url)) all.push(source);
  };
  for (const source of spainEntry().sources) add(source);
  for (const source of catalanEntry().sources) add(source);
  add({ name: "Ordre EMT/ /2026, de 12 de novembre: serveis mínims de Rodalies i regionals, 17 de novembre (e-Tauler)", url: U.ordreRenfe17, publisher: "Departament d'Empresa i Treball" });
  add({ name: "Establecidos los servicios mínimos para la huelga convocada por SEMAF (06/11/2026)", url: RENFE_PRECEDENT, publisher: "Renfe" });
  add({ name: "Cercanías: redes y horarios", url: RENFE_CERCANIAS, publisher: "Renfe" });
  add({ name: "Renfe", url: U.renfe, publisher: "Renfe" });
  for (const next of SPAIN_STRIKES.filter((s) => s.id === RAIL_17N_ID.next)) for (const source of next.sources) add(source);
  return all;
}

const LOCALES: Locale[] = ["ca", "es", "en"];

export const RAIL_17N_GUIDE: B2Article = {
  key: "railStrike17n",
  entryKey: "guide-rail-strike-17-november-2026-spain",
  categoryKey: "public-services",
  sources: rail17nSources(),
  heroKey: TRAINS.heroKey ?? "",
  heroAlt: TRAINS.heroAlt ?? { ca: "", es: "", en: "" },
  heroCaption: TRAINS.heroCaption ?? { ca: "", es: "", en: "" },
  verifiedAt: RAIL_17N_VERIFIED,
  publishedAt: "2026-11-13T12:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      {
        path: B2_PATHS.railStrike17n[locale],
        title: META[locale].title,
        seoTitle: META[locale].seoTitle,
        seoDescription: rail17nDescription(locale),
        excerpt: META[locale].excerpt,
        blocks: buildRail17nBody(locale),
      },
    ]),
  ) as B2Article["editions"],
};
