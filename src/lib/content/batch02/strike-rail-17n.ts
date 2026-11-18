import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import {
  B2_PATHS,
  B2_TITLES,
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
import { STRIKES_SPAIN_VERIFIED, SPAIN_STRIKES } from "./strikes-spain-data";
import { fillChecked, spainCheckedOn } from "./strikes-spain";
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

/**
 * Cercanías networks whose minimum services the Basque Government sets (RD
 * 368/2024; the Ministry's resolution of 12 Nov 2026 says so), and whether its
 * order for the 17th is out: Orden de 13 de noviembre de 2026, 50 % at peak /
 * 25 % (euskadi.eus, read 16 Nov 2026; linked from the Spain entry).
 */
const BASQUE_NETWORKS: ReadonlySet<string> = new Set(["Bilbao", "San Sebastián"]);
const BASQUE_MS_PUBLISHED = true;

/**
 * Whether the Ministry published a minimum-services resolution for Adif. False:
 * none for the 17th was on its rail or air lists up to 18 Nov 2026 (re-read
 * that day), and none is due for the 19th, which SCF called off on the 17th
 * (SCFCOM 38). The Spain entry's text says "**Adif, el 17:** sin resolución
 * publicada"; flip both together if one appears. A test keeps them in step.
 */
export const ADIF_MS_PUBLISHED = false;

/** 18 Nov 2026: the 19th's Adif strike, called off on the 17th (SCFCOM 38); its section stays until that day has passed. */
const CALLED_OFF_DAY = "2026-11-19";
const U = STRIKE_URLS;
const link = (href: string, label: string) => `[${label}](${href})`;
const lowerFirst = (s: string) => `${s.charAt(0).toLowerCase()}${s.slice(1)}`;
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
  /**
   * `today`: the as-of date is the 17th itself ("hoy"). 18 Nov 2026: the 19th (Adif) was called off, so the strike has
   * one day and the lead says so in one sentence.
   */
  lead: (phase: Rail17nPhase, msPending: boolean, today: boolean) => string;
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
  basque: string;
  pending: string;
  rodaliesRow: string;
  /** The Ministry's Cercanías figures, once its resolution is out (BOE-free: the resolution's PDF, read 16 Nov 2026). */
  stateRow: string;
  /** Cercanías Bilbao and San Sebastián: the Basque Government's order (RD 368/2024 transfer). */
  basqueRow: string;
  networksNote: string;
  rodaliesGuide: (href: string) => string;
  ticketsHeading: string;
  tickets: string[];
  nextHeading: string;
  /** The 23 Nov section's heading, while that strike is listed. */
  next23Heading: string;
  nextId: string;
  next23: (title: string, scope: string) => string;
  next23Ms: (ms: string) => string;
  /** The 19 Nov section: SCF's Adif strike, called off on the 17th (SCFCOM 38). */
  day19Heading: string;
  day19Id: string;
  day19: (calledOff: string) => string;
  /** FAQ for the 23 Nov strike, from its Spain entry (scope and minimum-services status). */
  q23: string;
  a23: (scope: string, ms: string) => string;
  nextLinks: (locale: Locale) => string[];
  faq: (msState: string, rodalies: string, today: boolean, msPending: boolean) => { question: string; answer: string }[];
}

const COPY: Record<Locale, Copy> = {
  es: {
    lead: (phase, msPending, today) => {
      const who = "toda la plantilla del Grupo Renfe (Cercanías, Rodalies, Media Distancia, AVE y Larga Distancia) y Adif, convocada por FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO y SFF-CGT; SEMAF llama también a los maquinistas de Iryo y Ouigo";
      const scope = "en el Grupo Renfe (Cercanías, Rodalies, Media Distancia, AVE y Larga Distancia) y Adif; SEMAF llama también a los maquinistas de Iryo y Ouigo";
      const ms = msPending
        ? "Los servicios mínimos del Ministerio de Transportes para Cercanías, Media Distancia y AVE aún no se han publicado; en Rodalies, la Generalitat ya los ha fijado."
        : "**Servicios mínimos oficiales:** Cercanías, 75 % en hora punta y 50 % el resto del día (Bilbao y San Sebastián, 50 % y 25 %); Media Distancia, 65 %; AVE y Larga Distancia, 72 %; Iryo, 70 %; Ouigo, 65,38 %; Rodalies de Catalunya, 66 % en hora punta y 33 % el resto. Metro, autobuses, tranvías y FGC no están convocados.";
      const day19 = "El paro de Adif del jueves 19 está desconvocado.";
      if (phase === "after") return `**El martes 17 de noviembre de 2026 hubo huelga de trenes en toda España,** de 0.00 a 23.59 h: ${who}. El paro de Adif del jueves 19 se desconvocó: el SCF lo anunció el 17. Más abajo, los servicios mínimos que se fijaron.`;
      if (today) return `**Hoy, martes 17 de noviembre, hay huelga de trenes en toda España,** de 0.00 a 23.59 h, ${scope}. ${ms} ${day19}`;
      return `**Sí: el martes 17 de noviembre de 2026 hay huelga de trenes en toda España,** de 0.00 a 23.59 h, ${scope}. ${ms} ${day19}`;
    },
    factsTitle: "La huelga de trenes, de un vistazo",
    labels: { when: "Cuándo", who: "Quién convoca", scope: "A quién afecta", rodalies: "Rodalies (Cataluña)", state: "Cercanías, Media Distancia y AVE", notIn: "Fuera de la huelga" },
    when: "Martes 17 de noviembre, de 0.00 a 23.59 h (Grupo Renfe y Adif); el paro de Adif del jueves 19, desconvocado",
    who: "FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO y SFF-CGT en el Grupo Renfe; los sindicatos del comité de empresa de Adif; SCF en Adif (el 17; el 19, desconvocado)",
    whoHeading: "Quién convoca la huelga de trenes",
    whoId: "quien-convoca",
    notIn: "Metro, autobuses, tranvías y trenes autonómicos que no son de Renfe (FGC, Euskotren, Metrovalencia, Serveis Ferroviaris de Mallorca): no forman parte de las convocatorias publicadas",
    statePending: "Por confirmar: los fija el Ministerio de Transportes y aún no se han publicado",
    statePublished: "Publicados por el Ministerio de Transportes: Cercanías, 75 % en hora punta y 50 % el resto del día; Media Distancia, 65 % de media; AVE y Larga Distancia, 72 %",
    msHeading: "Servicios mínimos: qué trenes funcionan el 17 de noviembre",
    msId: "servicios-minimos",
    stateSub: "**Cercanías, Media Distancia, AVE y Larga Distancia, Iryo, Ouigo y Adif (Ministerio de Transportes).**",
    rodaliesSub: "**Rodalies de Catalunya y regionales (Generalitat).**",
    precedent: (renfe) =>
      `**Como referencia, no son los del 17:** para la huelga de maquinistas de Renfe del 10 de noviembre, el Ministerio fijó en Cercanías el 75 % del servicio en hora punta (de 6.00 a 9.00, de 13.30 a 15.30 y de 18.30 a 20.30 h) y el 50 % el resto del día, una media del 65 % en Media Distancia y el 72 % en AVE y Larga Distancia, según ${link(renfe, "el aviso de Renfe del 6 de noviembre")}. La resolución del 17 puede fijar otros porcentajes.`,
    networksHeading: "Cercanías: red por red",
    networksId: "cercanias",
    networksIntro: (renfe) =>
      `Todas las redes de Cercanías las opera Renfe, cuya plantilla está llamada a la huelga del 17. Los servicios mínimos los fija el Ministerio de Transportes, salvo en Rodalies de Catalunya (Generalitat) y en Bilbao y San Sebastián (Gobierno Vasco). Los horarios de cada red, en ${link(renfe, "renfe.com")}.`,
    caption: "Huelga de trenes del 17 de noviembre: servicios mínimos en cada red de Cercanías",
    headers: ["Red", "Quién fija los mínimos", "Servicios mínimos del 17"],
    ministry: "Ministerio de Transportes",
    generalitat: "Generalitat de Catalunya",
    basque: "Gobierno Vasco",
    pending: "Por confirmar",
    rodaliesRow: "66 % en hora punta y 33 % el resto del día",
    stateRow: "75 % en hora punta y 50 % el resto del día",
    basqueRow: "50 % en hora punta y 25 % el resto del día",
    networksNote: "Las redes, como las lista renfe.com. Cifras de la resolución del Ministerio de Transportes del 12 de noviembre (la misma en todas sus redes; en Madrid, la C9 está cerrada por obras), de la orden del Gobierno Vasco del 13 de noviembre y de la de la Generalitat del 12.",
    rodaliesGuide: (href) => `Líneas, horarios de servicios mínimos y avisos en directo de Rodalies: ${link(href, "la guía de la huelga de Renfe y Rodalies")}.`,
    ticketsHeading: "Si tienes billete de AVE, Larga Distancia, Iryo u Ouigo",
    tickets: [
      `**Renfe:** el cambio o la devolución depende de Renfe; sigue lo que publique en ${link(U.renfe, "renfe.com")} o te envíe por correo cuando se conozcan los trenes que circulan.`,
      "**Iryo y Ouigo:** SEMAF llama a sus maquinistas; cada compañía avisa a sus viajeros de los trenes afectados.",
      "**Mira tu tren la víspera y la misma mañana:** con servicios mínimos no circulan todos los trenes de tu hora.",
    ],
    nextHeading: "Después del 17",
    next23Heading: "Lunes 23 de noviembre: huelga de maquinistas (SEMAF)",
    nextId: "despues",
    next23: (title, scope) => `**Lunes 23 de noviembre: ${title}.** ${scope}`,
    next23Ms: (ms) => `**Servicios mínimos del 23:** ${ms}.`,
    day19Heading: "Jueves 19 de noviembre: huelga en Adif, desconvocada",
    day19Id: "19-noviembre",
    q23: "¿Hay huelga de trenes el 23 de noviembre?",
    a23: (scope, ms) => `Sí: el sindicato de maquinistas SEMAF la ha convocado para el lunes 23 de noviembre. ${scope} Servicios mínimos: ${ms.charAt(0).toLowerCase()}${ms.slice(1)}.`,
    day19: (calledOff) =>
      `El sindicato SCF desconvocó el 17 de noviembre el paro de 24 horas del personal de circulación de Adif previsto para el jueves 19: «SCF ha acordado la desconvocatoria para el día 19», después de que Adif aceptara sus reivindicaciones (${link(calledOff, "comunicado 38 del SCF")}). Ese día no había convocatoria en Renfe, Iryo ni Ouigo, así que no queda ninguna huelga de trenes convocada.`,
    nextLinks: (locale) => [
      b2link("strikesSpain", locale, "Todas las huelgas convocadas en España, día a día"),
      b2link("strikeEducation", locale, "Huelga educativa en Cataluña el jueves 26 de noviembre: ¿hay colegio?"),
    ],
    faq: (msState, rodalies, today, msPending) => [
      {
        question: today ? "¿Hay huelga de trenes hoy, 17 de noviembre?" : "¿Hay huelga de trenes el martes 17 de noviembre?",
        answer: `Sí. ${today ? "Hoy, martes 17 de noviembre" : "El martes 17 de noviembre de 2026"}, de 0.00 a 23.59 h, está convocada toda la plantilla del Grupo Renfe (Cercanías, Rodalies, Media Distancia, AVE y Larga Distancia) y Adif, y SEMAF llama también a los maquinistas de Iryo, Ouigo y otras operadoras.${
          msPending ? "" : " Servicios mínimos: Cercanías, 75 % en hora punta y 50 % el resto del día; Media Distancia, 65 %; AVE y Larga Distancia, 72 %; Iryo, 70 %; Ouigo, 65,38 %; Rodalies, 66 % y 33 %."
        }`,
      },
      { question: "¿Qué servicios mínimos hay en Renfe el 17 de noviembre?", answer: msState },
      { question: "¿Y en Rodalies?", answer: rodalies },
      { question: "¿Hay huelga de trenes el 19 de noviembre?", answer: "No. El sindicato SCF desconvocó el 17 de noviembre el paro de 24 horas del personal de circulación de Adif, la única convocatoria ferroviaria de ese día; Renfe, Iryo y Ouigo no estaban convocados." },
      { question: "¿La huelga de trenes afecta al metro?", answer: "No: el metro, los autobuses y los tranvías no forman parte de las convocatorias publicadas para el 17, ni los trenes autonómicos que no son de Renfe, como FGC, Euskotren o Metrovalencia." },
    ],
  },
  ca: {
    lead: (phase, msPending, today) => {
      const who = "tot el personal del Grup Renfe (Rodalies, Cercanías, Mitja Distància, AVE i Llarga Distància) i Adif, convocada per FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO i SFF-CGT; SEMAF també crida els maquinistes d'Iryo i Ouigo";
      const scope = "al Grup Renfe (Rodalies, Cercanías, Mitja Distància, AVE i Llarga Distància) i Adif; SEMAF també crida els maquinistes d'Iryo i Ouigo";
      const ms = msPending
        ? "Els serveis mínims del Ministeri de Transports per a Cercanías, Mitja Distància i AVE encara no s'han publicat; a Rodalies, la Generalitat ja els ha fixat."
        : "**Serveis mínims oficials:** Rodalies de Catalunya, 66 % en hora punta i 33 % la resta del dia; Cercanías, 75 % en hora punta i 50 % la resta (Bilbao i Sant Sebastià, 50 % i 25 %); Mitja Distància, 65 %; AVE i Llarga Distància, 72 %; Iryo, 70 %; Ouigo, 65,38 %. El metro, els autobusos, els tramvies i FGC no hi estan convocats.";
      const day19 = "L'aturada d'Adif del dijous 19 està desconvocada.";
      if (phase === "after") return `**El dimarts 17 de novembre de 2026 hi va haver vaga de trens a tot Espanya,** de 0.00 a 23.59 h: ${who}. L'aturada d'Adif del dijous 19 es va desconvocar: l'SCF ho va anunciar el 17. Més avall, els serveis mínims que es van fixar.`;
      if (today) return `**Avui, dimarts 17 de novembre, hi ha vaga de trens a tot Espanya,** de 0.00 a 23.59 h, ${scope}. ${ms} ${day19}`;
      return `**Sí: el dimarts 17 de novembre de 2026 hi ha vaga de trens a tot Espanya,** de 0.00 a 23.59 h, ${scope}. ${ms} ${day19}`;
    },
    factsTitle: "La vaga de trens, d'un cop d'ull",
    labels: { when: "Quan", who: "Qui la convoca", scope: "A qui afecta", rodalies: "Rodalies (Catalunya)", state: "Cercanías, Mitja Distància i AVE", notIn: "Fora de la vaga" },
    when: "Dimarts 17 de novembre, de 0.00 a 23.59 h (Grup Renfe i Adif); l'aturada d'Adif del dijous 19, desconvocada",
    who: "FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO i SFF-CGT al Grup Renfe; els sindicats del comitè d'empresa d'Adif; SCF a Adif (el 17; el 19, desconvocada)",
    whoHeading: "Qui convoca la vaga de trens",
    whoId: "qui-convoca",
    notIn: "Metro, autobusos, tramvies i trens autonòmics que no són de Renfe (FGC, Euskotren, Metrovalencia, Serveis Ferroviaris de Mallorca): no formen part de les convocatòries publicades",
    statePending: "Per confirmar: els fixa el Ministeri de Transports i encara no s'han publicat",
    statePublished: "Publicats pel Ministeri de Transports: Cercanías, 75 % en hora punta i 50 % la resta del dia; Mitja Distància, 65 % de mitjana; AVE i Llarga Distància, 72 %",
    msHeading: "Serveis mínims: quins trens funcionen el 17 de novembre",
    msId: "serveis-minims",
    stateSub: "**Cercanías, Mitja Distància, AVE i Llarga Distància, Iryo, Ouigo i Adif (Ministeri de Transports).**",
    rodaliesSub: "**Rodalies de Catalunya i regionals (Generalitat).**",
    precedent: (renfe) =>
      `**Com a referència, no són els del 17:** per a la vaga de maquinistes de Renfe del 10 de novembre, el Ministeri va fixar a Cercanías el 75 % del servei en hora punta (de 6.00 a 9.00, de 13.30 a 15.30 i de 18.30 a 20.30 h) i el 50 % la resta del dia, una mitjana del 65 % a Mitja Distància i el 72 % a l'AVE i la Llarga Distància, segons ${link(renfe, "l'avís de Renfe del 6 de novembre")}. La resolució del 17 pot fixar altres percentatges.`,
    networksHeading: "Cercanías: xarxa per xarxa",
    networksId: "cercanias",
    networksIntro: (renfe) =>
      `Totes les xarxes de Cercanías les opera Renfe, el personal de la qual està cridat a la vaga del 17. Els serveis mínims els fixa el Ministeri de Transports, llevat de Rodalies de Catalunya (Generalitat) i de Bilbao i Sant Sebastià (Govern Basc). Els horaris de cada xarxa, a ${link(renfe, "renfe.com")}.`,
    caption: "Vaga de trens del 17 de novembre: serveis mínims a cada xarxa de Cercanías",
    headers: ["Xarxa", "Qui fixa els mínims", "Serveis mínims del 17"],
    ministry: "Ministeri de Transports",
    generalitat: "Generalitat de Catalunya",
    basque: "Govern Basc",
    pending: "Per confirmar",
    rodaliesRow: "66 % en hora punta i 33 % la resta del dia",
    stateRow: "75 % en hora punta i 50 % la resta del dia",
    basqueRow: "50 % en hora punta i 25 % la resta del dia",
    networksNote: "Les xarxes, com les llista renfe.com. Xifres de la resolució del Ministeri de Transports del 12 de novembre (la mateixa a totes les seves xarxes; a Madrid, la C9 és tancada per obres), de l'ordre del Govern Basc del 13 de novembre i de la de la Generalitat del 12.",
    rodaliesGuide: (href) => `Línies, horaris de serveis mínims i avisos en directe de Rodalies: ${link(href, "la guia de la vaga de Renfe i Rodalies")}.`,
    ticketsHeading: "Si tens bitllet d'AVE, Llarga Distància, Iryo o Ouigo",
    tickets: [
      `**Renfe:** el canvi o la devolució depèn de Renfe; segueix el que publiqui a ${link(U.renfe, "renfe.com")} o t'enviï per correu quan se sàpiga quins trens circulen.`,
      "**Iryo i Ouigo:** SEMAF crida els seus maquinistes; cada companyia avisa els seus viatgers dels trens afectats.",
      "**Mira el teu tren la vigília i el mateix matí:** amb serveis mínims no circulen tots els trens de la teva hora.",
    ],
    nextHeading: "Després del 17",
    next23Heading: "Dilluns 23 de novembre: vaga de maquinistes (SEMAF)",
    nextId: "despres",
    next23: (title, scope) => `**Dilluns 23 de novembre: ${title}.** ${scope}`,
    next23Ms: (ms) => `**Serveis mínims del 23:** ${ms}.`,
    day19Heading: "Dijous 19 de novembre: vaga a Adif, desconvocada",
    day19Id: "19-novembre",
    q23: "Hi ha vaga de trens el 23 de novembre?",
    a23: (scope, ms) => `Sí: el sindicat de maquinistes SEMAF l'ha convocada per al dilluns 23 de novembre. ${scope} Serveis mínims: ${ms.charAt(0).toLowerCase()}${ms.slice(1)}.`,
    day19: (calledOff) =>
      `El sindicat SCF va desconvocar el 17 de novembre l'aturada de 24 hores del personal de circulació d'Adif prevista per al dijous 19: «SCF ha acordado la desconvocatoria para el día 19», després que Adif acceptés les seves reivindicacions (${link(calledOff, "comunicat 38 de l'SCF")}). Aquell dia no hi havia cap convocatòria a Renfe, Iryo ni Ouigo, de manera que no queda cap vaga de trens convocada.`,
    nextLinks: (locale) => [
      b2link("strikesSpain", locale, "Totes les vagues convocades a Espanya, dia a dia"),
      b2link("strikeEducation", locale, "Vaga a l'educació a Catalunya el dijous 26 de novembre: hi ha escola?"),
    ],
    faq: (msState, rodalies, today, msPending) => [
      {
        question: today ? "Hi ha vaga de trens avui, 17 de novembre?" : "Hi ha vaga de trens el dimarts 17 de novembre?",
        answer: `Sí. ${today ? "Avui, dimarts 17 de novembre" : "El dimarts 17 de novembre de 2026"}, de 0.00 a 23.59 h, hi està convocat tot el personal del Grup Renfe (Rodalies, Cercanías, Mitja Distància, AVE i Llarga Distància) i Adif, i SEMAF també crida els maquinistes d'Iryo, Ouigo i altres operadores.${
          msPending ? "" : " Serveis mínims: Rodalies, 66 % en hora punta i 33 % la resta del dia; Cercanías, 75 % i 50 %; Mitja Distància, 65 %; AVE i Llarga Distància, 72 %; Iryo, 70 %; Ouigo, 65,38 %."
        }`,
      },
      { question: "Quins serveis mínims hi ha a Renfe el 17 de novembre?", answer: msState },
      { question: "I a Rodalies?", answer: rodalies },
      { question: "Hi ha vaga de trens el 19 de novembre?", answer: "No. El sindicat SCF va desconvocar el 17 de novembre l'aturada de 24 hores del personal de circulació d'Adif, l'única convocatòria ferroviària d'aquell dia; Renfe, Iryo i Ouigo no hi estaven convocats." },
      { question: "La vaga de trens afecta el metro?", answer: "No: el metro, els autobusos i els tramvies no formen part de les convocatòries publicades per al 17, ni els trens autonòmics que no són de Renfe, com FGC, Euskotren o Metrovalencia." },
    ],
  },
  en: {
    lead: (phase, msPending, today) => {
      const who = "all Renfe Group staff (Cercanías and Rodalies commuter trains, Media Distancia, AVE and long distance) and Adif, called by FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO and SFF-CGT; SEMAF also calls out drivers at Iryo and Ouigo";
      const scope = "at the Renfe Group (Cercanías and Rodalies commuter trains, Media Distancia, AVE and long distance) and Adif; SEMAF also calls out drivers at Iryo and Ouigo";
      const ms = msPending
        ? "The Ministry of Transport's minimum services for Cercanías, Media Distancia and AVE have not been published yet; for Rodalies, the Generalitat has set them."
        : "**Official minimum services:** Cercanías 75% at peak times and 50% the rest of the day (Bilbao and San Sebastián 50% and 25%); Media Distancia 65%; AVE and long distance 72%; Iryo 70%; Ouigo 65.38%; Rodalies de Catalunya 66% at peak times and 33% the rest. Metro, buses, trams and FGC are not called out.";
      const day19 = "The Adif stoppage on Thursday 19 is called off.";
      if (phase === "after") return `**On Tuesday 17 November 2026 there was a rail strike across Spain,** 00:00 to 23:59: ${who}. The Adif stoppage on Thursday 19 was called off, as SCF announced on the 17th. The minimum services that were set are below.`;
      if (today) return `**Today, Tuesday 17 November, there is a rail strike across Spain,** 00:00 to 23:59, ${scope}. ${ms} ${day19}`;
      return `**Yes: on Tuesday 17 November 2026 there is a rail strike across Spain,** 00:00 to 23:59, ${scope}. ${ms} ${day19}`;
    },
    factsTitle: "The rail strike at a glance",
    labels: { when: "When", who: "Called by", scope: "Who is called out", rodalies: "Rodalies (Catalonia)", state: "Cercanías, Media Distancia and AVE", notIn: "Not part of it" },
    when: "Tuesday 17 November, 00:00 to 23:59 (Renfe Group and Adif); the Adif stoppage on Thursday 19, called off",
    who: "FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO and SFF-CGT at the Renfe Group; the unions on Adif's works council; SCF at Adif (17th; the 19th called off)",
    whoHeading: "Who called the rail strike",
    whoId: "who-called-it",
    notIn: "Metro, buses, trams and regional railways not run by Renfe (FGC, Euskotren, Metrovalencia, Serveis Ferroviaris de Mallorca): not part of the published calls",
    statePending: "To be confirmed: the Ministry of Transport sets them and has not published them yet",
    statePublished: "Published by the Ministry of Transport: Cercanías 75% at peak times and 50% the rest of the day; Media Distancia 65% on average; AVE and long distance 72%",
    msHeading: "Minimum services: which trains run on 17 November",
    msId: "minimum-services",
    stateSub: "**Cercanías, Media Distancia, AVE and long distance, Iryo, Ouigo and Adif (Ministry of Transport).**",
    rodaliesSub: "**Rodalies de Catalunya and regional trains (Generalitat).**",
    precedent: (renfe) =>
      `**For reference only, not the 17th's:** for the Renfe drivers' strike of 10 November, the Ministry set 75% of the usual Cercanías service at peak times (06:00 to 09:00, 13:30 to 15:30 and 18:30 to 20:30) and 50% the rest of the day, 65% on average on Media Distancia and 72% on AVE and long distance, according to ${link(renfe, "Renfe's notice of 6 November")}. The resolution for the 17th may set other percentages.`,
    networksHeading: "Cercanías commuter trains: network by network",
    networksId: "cercanias",
    networksIntro: (renfe) =>
      `Renfe runs every Cercanías network, and its staff are called out on the 17th. The Ministry of Transport sets minimum services, except on Rodalies de Catalunya (the Generalitat) and in Bilbao and San Sebastián (the Basque Government). Each network's timetables are on ${link(renfe, "renfe.com")}.`,
    caption: "Rail strike on 17 November: minimum services on each Cercanías network",
    headers: ["Network", "Who sets minimum services", "Minimum services on the 17th"],
    ministry: "Ministry of Transport",
    generalitat: "Generalitat de Catalunya",
    basque: "Basque Government",
    pending: "To be confirmed",
    rodaliesRow: "66% at peak times, 33% the rest of the day",
    stateRow: "75% at peak times, 50% the rest of the day",
    basqueRow: "50% at peak times, 25% the rest of the day",
    networksNote: "Networks as renfe.com lists them. Figures from the Ministry of Transport's resolution of 12 November (the same on all its networks; in Madrid, line C9 is closed for works), the Basque Government's order of 13 November and the Generalitat's of the 12th.",
    rodaliesGuide: (href) => `Rodalies lines, minimum-service timetables and live notices: ${link(href, "our Renfe and Rodalies strike guide")}.`,
    ticketsHeading: "Holding an AVE, long-distance, Iryo or Ouigo ticket",
    tickets: [
      `**Renfe:** changes and refunds depend on Renfe; follow what it publishes on ${link(U.renfe, "renfe.com")} or emails you once the running trains are known.`,
      "**Iryo and Ouigo:** SEMAF calls out their drivers; each company tells its passengers which trains are affected.",
      "**Check your train the evening before and that morning:** under minimum services not every train at your usual time runs.",
    ],
    nextHeading: "After the 17th",
    next23Heading: "Monday 23 November: train drivers' strike (SEMAF)",
    nextId: "after",
    next23: (title, scope) => `**Monday 23 November: ${title}.** ${scope}`,
    next23Ms: (ms) => `**Minimum services on the 23rd:** ${ms}.`,
    day19Heading: "Thursday 19 November: Adif strike called off",
    day19Id: "19-november",
    q23: "Is there a rail strike on 23 November?",
    a23: (scope, ms) => `Yes: the train drivers' union SEMAF has called one for Monday 23 November. ${scope} Minimum services: ${ms.charAt(0).toLowerCase()}${ms.slice(1)}.`,
    day19: (calledOff) =>
      `On 17 November the SCF union called off the 24-hour stoppage by Adif's traffic-control staff planned for Thursday 19: "SCF ha acordado la desconvocatoria para el día 19" (SCF has agreed to call off the 19th), after Adif accepted its demands (${link(calledOff, "SCF's notice 38")}). There was no call at Renfe, Iryo or Ouigo that day, so no rail strike is left on the 19th.`,
    nextLinks: (locale) => [
      b2link("strikesSpain", locale, "Every strike called in Spain, day by day"),
      b2link("strikeEducation", locale, "Catalonia education strike on Thursday 26 November: is there school?"),
    ],
    faq: (msState, rodalies, today, msPending) => [
      {
        question: today ? "Is there a rail strike in Spain today, 17 November?" : "Is there a rail strike in Spain on Tuesday 17 November?",
        answer: `Yes. ${today ? "Today, Tuesday 17 November" : "On Tuesday 17 November 2026"}, 00:00 to 23:59, all Renfe Group staff (Cercanías, Rodalies, Media Distancia, AVE and long distance) and Adif are called out, and SEMAF also calls out drivers at Iryo, Ouigo and other operators.${
          msPending ? "" : " Minimum services: Cercanías 75% at peak times and 50% the rest of the day; Media Distancia 65%; AVE and long distance 72%; Iryo 70%; Ouigo 65.38%; Rodalies 66% and 33%."
        }`,
      },
      { question: "What minimum services are there on Renfe on 17 November?", answer: msState },
      { question: "And on Rodalies?", answer: rodalies },
      { question: "Is there a rail strike on 19 November?", answer: "No. On 17 November the SCF union called off the 24-hour stoppage by Adif's traffic-control staff, the only rail call that day; Renfe, Iryo and Ouigo were not called out." },
      { question: "Does the rail strike affect the metro?", answer: "No: metros, buses and trams are not part of the calls published for the 17th, nor are regional railways not run by Renfe, such as FGC, Euskotren or Metrovalencia." },
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
  const today = asOf === rail17nDays()[0];
  const msPending = spain.minimumServices.status !== "published";
  // 18 Nov 2026: {checked} prints the day the Spain sources were re-read, never a later as-of day.
  const stateText = fillChecked(spain.minimumServices.text, locale, spainCheckedOn());
  const rodaliesText = catalan.minimumServices.text[locale];
  const stateCell = msPending ? t.pending : t.stateRow;
  const rodaliesCell = catalan.minimumServices.status === "published" ? t.rodaliesRow : t.pending;
  const next = SPAIN_STRIKES.find((s) => s.id === RAIL_17N_ID.next);
  const renfeGuide = `/${locale}/${B2_PATHS.strikeRenfe[locale]}/`;

  const rows = [
    ...CERCANIAS_NETWORKS.map((network) => (BASQUE_NETWORKS.has(network) ? [network, t.basque, BASQUE_MS_PUBLISHED ? t.basqueRow : t.pending] : [network, t.ministry, stateCell])),
    ["Rodalies de Catalunya", t.generalitat, rodaliesCell],
  ];

  // "Rodalies el 17: 66 % …" under the label "Rodalies (Cataluña)": the label already names the network.
  const rodaliesShort = catalan.minimumServices.msShort[locale].replace(/^Rodalies(:|,)? (on )?/, "");

  return [
    lead(t.lead(phase, msPending, today)),
    keyFacts(t.factsTitle, [
      { label: t.labels.when, value: t.when },
      { label: t.labels.who, value: t.who },
      { label: t.labels.scope, value: spain.scope[locale] },
      { label: t.labels.state, value: msPending ? t.statePending : t.statePublished },
      { label: t.labels.rodalies, value: `${rodaliesShort.charAt(0).toUpperCase()}${rodaliesShort.slice(1)}` },
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
    // 18 Nov 2026: the 19th's call-off stays on the page until that day has passed ("huelga renfe 19 noviembre").
    ...(asOf > CALLED_OFF_DAY ? [] : [heading(2, t.day19Heading, t.day19Id), ...paras(t.day19(U.scf38), b2link("strike19n", locale, B2_TITLES.strike19n[locale]))]),
    heading(2, t.ticketsHeading),
    list(...t.tickets),
    heading(2, next ? t.next23Heading : t.nextHeading, t.nextId),
    list(
      ...(next ? [t.next23(next.title[locale], next.scope[locale]), t.next23Ms(lowerFirst(next.minimumServices.short[locale]))] : []),
      ...t.nextLinks(locale),
      b2link("strike20n", locale, B2_TITLES.strike20n[locale]),
    ),
    faq([...t.faq(stateText, rodaliesText, today, msPending), ...(next ? [{ question: t.q23, answer: t.a23(next.scope[locale], next.minimumServices.short[locale]) }] : [])]),
    ...paras(verifiedLine(locale, RAIL_17N_VERIFIED)),
    ...b2Related(["strikeRenfe", "strikesSpain", "strikes"], locale),
  ];
}

/* -------------------------------------------------------------------------- */
/* Meta and article                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Descriptions. `before` was written on 13 Nov, before any figure was out; from
 * 16 Nov (Ministry resolution of 12 Nov published) `published` carries the
 * figures and `today` the same on the 17th itself. docs/SEO_EXPERIMENTS.md,
 * 16 Nov 2026: the description only, the title is untouched.
 */
/**
 * 18 Nov 2026: the `day19` description (17 Nov, "Jueves 19: solo paran los
 * responsables de circulación de Adif") went with the 19th, called off by SCF
 * on the 17th: from the 18th the page is past and `after` applies.
 */
const META: Record<Locale, { title: string; seoTitle: string; before: string; published: string; today: string; after: string; excerpt: string }> = {
  es: {
    title: "Huelga de trenes del 17 de noviembre en España: Renfe, Adif, Cercanías, AVE y servicios mínimos",
    seoTitle: "Huelga de trenes 17 noviembre en España: Cercanías y AVE",
    before: "Martes 17 de noviembre, de 0.00 a 23.59 h: huelga en Renfe y Adif en toda España. Servicios mínimos en Cercanías, Rodalies y AVE, red por red.",
    published: "Sí, el martes 17 hay huelga en Renfe y Adif (0 a 23.59 h). Servicios mínimos: Cercanías 75 % en hora punta y 50 %, Media Distancia 65 %, AVE 72 %.",
    today: "Hoy martes 17, huelga en Renfe y Adif de 0 a 23.59 h. Servicios mínimos: Cercanías 75 % en hora punta y 50 %, Media Distancia 65 %, AVE 72 %.",
    after: "El 17 de noviembre de 2026 hubo huelga en Renfe y Adif en toda España: quién la convocó y los servicios mínimos que se fijaron, red por red.",
    excerpt: "La huelga de trenes del 17 de noviembre de 2026 en toda España: quién la convoca, Cercanías red por red, Rodalies, AVE y servicios mínimos.",
  },
  ca: {
    title: "Vaga de trens del 17 de novembre a Espanya: Renfe, Adif, Cercanías, AVE i serveis mínims",
    seoTitle: "Vaga de trens 17 novembre a Espanya: Cercanías i AVE",
    before: "Dimarts 17 de novembre, de 0.00 a 23.59 h: vaga a Renfe i Adif a tot Espanya. Serveis mínims a Cercanías, Rodalies i AVE, xarxa per xarxa.",
    published: "Sí, dimarts 17 hi ha vaga a Renfe i Adif (0 a 23.59 h). Serveis mínims: Rodalies 66 % en hora punta i 33 %, Cercanías 75 % i 50 %, AVE 72 %.",
    today: "Avui dimarts 17, vaga a Renfe i Adif de 0 a 23.59 h. Serveis mínims: Rodalies 66 % en hora punta i 33 %, Cercanías 75 % i 50 %, AVE 72 %.",
    after: "El 17 de novembre de 2026 hi va haver vaga a Renfe i Adif a tot Espanya: qui la va convocar i els serveis mínims que es van fixar.",
    excerpt: "La vaga de trens del 17 de novembre de 2026 a tot Espanya: qui la convoca, Cercanías xarxa per xarxa, Rodalies, AVE i serveis mínims.",
  },
  en: {
    title: "Spain rail strike on 17 November: Renfe, Adif, Cercanías, AVE and minimum services",
    seoTitle: "Spain rail strike 17 November: Cercanías, AVE, what runs",
    before: "Tuesday 17 November, 00:00 to 23:59: strike at Renfe and Adif across Spain. Minimum services on Cercanías, Rodalies and AVE, network by network.",
    published: "Yes: Renfe and Adif strike on Tuesday 17 November, 00:00-23:59. Minimum services: Cercanías 75% at peak, 50% otherwise; AVE 72%; Media Distancia 65%.",
    today: "Today, Tuesday 17: Renfe and Adif strike, 00:00-23:59. Minimum services: Cercanías 75% at peak, 50% otherwise; AVE 72%; Media Distancia 65%.",
    after: "On 17 November 2026 Renfe and Adif staff went on strike across Spain: who called it and the minimum services that were set, network by network.",
    excerpt: "The rail strike of 17 November 2026 across Spain: who called it, Cercanías network by network, Rodalies, AVE and minimum services.",
  },
};

export function rail17nDescription(locale: Locale, asOf: string = STRIKES_AS_OF): string {
  const phase = rail17nPhase(asOf);
  if (phase === "after") return META[locale].after;
  if (spainEntry().minimumServices.status !== "published") return META[locale].before;
  if (asOf === rail17nDays()[0]) return META[locale].today;
  return META[locale].published;
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
