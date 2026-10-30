import type { Block } from "@/lib/content/blocks";
import { TRAINS } from "@/lib/content/features/trains";
import { PATHS as TOOL_PATHS } from "@/lib/content/home-tools";
import { SCHOOL_SOURCE, SCHOOL_YEARS } from "@/lib/content/school/calendar";
import type { Locale } from "@/lib/i18n/config";
import { hubPath as rodaliesHub } from "@/lib/programmatic/rodalies/paths";

import { dateYear, dayDate } from "./festive";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  h3,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";
import { STRIKE_URLS } from "./strikes";

/**
 * "Vaga general 11 de novembre": a page of its own for the 11 November 2026
 * general strike, beside the evergreen strikes hub (`strikes.ts`), so that a
 * title in the searched words is indexed before the day. The hub carries one
 * dated section per strike; this page carries the 11N detail sector by sector.
 *
 * Every fact was read on 29 Oct 2026 on the organisers' own pages (ccoo.es,
 * 11n.cat for CCOO de Catalunya, ugt.es, ugt.cat, cgtcatalunya.cat,
 * sindicat.net for USTEC·STEs), the BOE (Constitution art. 28.2, RDL 17/1977),
 * the DOGC (Ordres EMT/38/2024, EMT/201/2024, EDF/66/2026), the Departament
 * d'Empresa i Treball (strikes FAQ and its list of strikes with minimum
 * services) and the operators' notice pages (fact pack:
 * research_notes/x10/strike-11n-factpack.md). On that day no minimum services
 * had been published for 11 November anywhere.
 *
 * Re-checked on 30 Oct 2026: the Departament d'Empresa i Treball's list of
 * strikes with minimum services (e-Tauler) had no 11N order; Rodalies, TMB and
 * FGC had no 11N notice; 11n.cat still gave no demonstration time or place.
 * Added that day: SEMAF's Renfe drivers' strikes on 10 Nov (full stoppage)
 * and 12 Nov (partial stoppages), from SEMAF's notice nº 2026-51, and the
 * doctors' indefinite strike since 28 Oct (Metges de Catalunya), from the
 * Generalitat's order of 22 Oct; both also sit in the strikes hub.
 *
 * Re-checked on the evening of 30 Oct 2026: still no 11N order in the DOGC
 * (up to núm. 9784, 30 Oct) or on Treball's e-Tauler list (newest 23 Oct), no
 * 11N resolution on the Ministry of Transport's rail or air lists, no notice at
 * Rodalies, Renfe, TMB or FGC, and neither 11n.cat nor ugt.cat gives a
 * demonstration time or place. The doctors' order is now cited by its DOGC
 * number (Ordre EMT/209/2026), and Ouigo's minimum services by the Ministry's
 * own resolution of 27 Oct.
 *
 * Left out on purpose: the demonstrations' times and places (no organiser had
 * published them), any minimum-service figure for 11N, anything about taxis
 * beyond what the 2024 orders say (nothing), and health or school advice that
 * no official body has published.
 *
 * HOW TO UPDATE (the lead):
 *  - Minimum services out (DOGC order, Treball's list, or an operator's
 *    notice): for each sector in MINIMUM_SERVICES_11N set `status:
 *    "published"`, write `text` in ca/es/en with the figure and the link inline
 *    (e.g. `85% del servei, segons [l'Ordre EMT/xx/2026](https://...)`), and set
 *    `source` to the order or notice. Move STRIKE_11N_AS_OF to the day you
 *    checked. In `strikes.ts`, set the 11N entry's minimumServices to
 *    "published" too (a test keeps the two pages in step). Run the tests,
 *    deploy, publish `?only=strike-11n` (it republishes this page and the hub).
 *  - The day after the strike (12 Nov): move STRIKE_11N_AS_OF (the test
 *    "the page is brought up to date after the strike" fails until you do) so
 *    the lead speaks in the past, record every sector (none may stay
 *    "pending"), and publish `?only=strike-11n` again.
 */

/** The strike day (Wednesday). */
export const STRIKE_11N_DATE = "2026-11-11";

/**
 * The day the page was last brought up to date. What the lead says (before,
 * on or after the day) is decided against this date, never the clock: the
 * HTML is the same whichever day it is rendered.
 */
export const STRIKE_11N_AS_OF = "2026-10-30";

/** The facts were re-read on the sources on the as-of day: one constant to move. */
export const STRIKE_11N_VERIFIED = STRIKE_11N_AS_OF;

export type StrikePhase = "upcoming" | "today" | "past";

export function strikePhase(asOf: string): StrikePhase {
  if (asOf < STRIKE_11N_DATE) return "upcoming";
  return asOf === STRIKE_11N_DATE ? "today" : "past";
}

/** True once `today` is after the strike but the page still speaks from before (or on) the day. */
export function isStale(today: string, asOf: string = STRIKE_11N_AS_OF): boolean {
  return today > STRIKE_11N_DATE && asOf <= STRIKE_11N_DATE;
}

/* -------------------------------------------------------------------------- */
/* Minimum services, one slot per sector                                      */
/* -------------------------------------------------------------------------- */

export type SectorKey = "rodalies" | "tmb" | "fgcTram" | "longDistance" | "airports" | "schools" | "health";

/** pending: nothing published yet. published: `text` says what the order or notice sets. */
export type SectorStatus = "pending" | "published";

export interface SectorMinimumServices {
  key: SectorKey;
  status: SectorStatus;
  /** Only when published: what is set, with the figure and the link to the order or notice inline. */
  text: Record<Locale, string> | null;
  /** Only when published: the order or the operator's notice (added to the article's sources). */
  source: B2Source | null;
}

/**
 * Fill these in when the order or the notices come out (see HOW TO UPDATE).
 * Rodalies to health: the Generalitat's order in the DOGC. Long distance: the
 * Spanish government. Airports: Aena and the airlines.
 */
export const MINIMUM_SERVICES_11N: SectorMinimumServices[] = [
  { key: "rodalies", status: "pending", text: null, source: null },
  { key: "tmb", status: "pending", text: null, source: null },
  { key: "fgcTram", status: "pending", text: null, source: null },
  { key: "longDistance", status: "pending", text: null, source: null },
  { key: "airports", status: "pending", text: null, source: null },
  { key: "schools", status: "pending", text: null, source: null },
  { key: "health", status: "pending", text: null, source: null },
];

/** Who sets each sector's minimum services. */
export const SET_BY: Record<SectorKey, "generalitat" | "state" | "aena"> = {
  rodalies: "generalitat",
  tmb: "generalitat",
  fgcTram: "generalitat",
  longDistance: "state",
  airports: "aena",
  schools: "generalitat",
  health: "generalitat",
};

export type MsState = "pending" | "partial" | "published";

export function msState(slots: SectorMinimumServices[] = MINIMUM_SERVICES_11N): MsState {
  const published = slots.filter((slot) => slot.status === "published").length;
  if (published === 0) return "pending";
  return published === slots.length ? "published" : "partial";
}

/** Whether the Generalitat's order is out: any of its sectors is published. */
export function generalitatOrderPublished(slots: SectorMinimumServices[] = MINIMUM_SERVICES_11N): boolean {
  return slots.some((slot) => SET_BY[slot.key] === "generalitat" && slot.status === "published");
}

function slot(slots: SectorMinimumServices[], key: SectorKey): SectorMinimumServices {
  return slots.find((s) => s.key === key) ?? { key, status: "pending", text: null, source: null };
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

const U = {
  ...STRIKE_URLS,
  treballMs: "https://treball.gencat.cat/ca/ambits/relacions_laborals/vagues/serveis-minims/",
  treballFaq: "https://treball.gencat.cat/ca/ambits/relacions_laborals/acces_directe/preguntes_mes_frequents/vagues/",
  schoolOrder: SCHOOL_SOURCE.url,
} as const;

export const STRIKE_11N_URLS = U;

const link = (href: string, label: string) => `[${label}](${href})`;

const BASE_SOURCES: B2Source[] = [
  { name: "Registro de la huelga general del 11N (19/10/2026)", url: U.ccooRegistered, publisher: "CCOO" },
  { name: "Convocamos huelga general para el 11 de noviembre (07/10/2026)", url: U.ccooCall, publisher: "CCOO" },
  { name: "Huelga general de 24 horas este 11 de noviembre", url: U.ugt, publisher: "UGT" },
  { name: "11N. Vaga general: preguntes freqüents", url: U.ccooCatalunya, publisher: "CCOO de Catalunya" },
  { name: "11N. Vaga general. Salaris, habitatge i preus", url: U.ugtCatalunya, publisher: "UGT de Catalunya" },
  { name: "L'11-N: vaga general per uns salaris dignes, un habitatge assequible i una vida millor (13/10/2026)", url: U.ugtCatalunyaCall, publisher: "UGT de Catalunya" },
  { name: "11N: CGT convoca Vaga General per l'habitatge i els salaris dignes (09/10/2026)", url: U.cgtCatalunya, publisher: "CGT Catalunya" },
  { name: "Ratifiquem la vaga general de l'11 de novembre (09/10/2026)", url: U.ustec, publisher: "USTEC·STEs" },
  { name: "Constitución Española, artículo 28.2", url: U.constitution, publisher: "BOE" },
  { name: "Real Decreto-ley 17/1977, de 4 de marzo, sobre relaciones de trabajo (artículos 3, 4, 6 y 10)", url: U.rdl17, publisher: "BOE" },
  { name: "Informació de vagues amb serveis mínims (e-Tauler)", url: U.treballMs, publisher: "Departament d'Empresa i Treball" },
  { name: "Preguntes més freqüents: vagues", url: U.treballFaq, publisher: "Departament d'Empresa i Treball" },
  { name: "Ordre EMT/201/2024, de 25 de setembre (serveis essencials, vaga general del 27 de setembre de 2024)", url: U.emt201, publisher: "DOGC" },
  { name: "Ordre EMT/38/2024, de 5 de març (serveis essencials, vaga general del 8 de març de 2024)", url: U.emt38, publisher: "DOGC" },
  { name: SCHOOL_SOURCE.name, url: SCHOOL_SOURCE.url, publisher: "DOGC" },
  { name: "Diari Oficial de la Generalitat de Catalunya", url: U.dogc, publisher: "DOGC" },
  { name: "Alteracions del servei", url: U.rodaliesStatus, publisher: "Rodalies de Catalunya" },
  { name: "Avisos de servei", url: U.tmb, publisher: "TMB" },
  { name: "Ferrocarrils de la Generalitat de Catalunya", url: U.fgc, publisher: "FGC" },
  { name: "Renfe", url: U.renfe, publisher: "Renfe" },
  { name: "OUIGO España", url: U.ouigo, publisher: "OUIGO España" },
  { name: "Trenes afectados por huelga de maquinistas (servicios mínimos aprobados por el Ministerio de Transportes)", url: U.ouigoStrike, publisher: "OUIGO España" },
  { name: "Resolución de 27 de octubre de 2026: servicios mínimos durante la huelga convocada por SEMAF en OUIGO España", url: U.ouigoResolution, publisher: "Ministerio de Transportes y Movilidad Sostenible" },
  { name: "Infovuelos", url: U.aena, publisher: "Aena" },
  { name: "SEMAF continúa convocando huelgas los días 10 y 12 de noviembre en el Grupo Renfe (nº 2026-51, 29/10/2026)", url: U.semaf1012, publisher: "SEMAF" },
  { name: "Ordre EMT/209/2026, de 22 d'octubre: servei essencial d'assistència sanitària dels centres del SISCAT (vaga indefinida de Metges de Catalunya, DOGC núm. 9780)", url: U.ordreMetges, publisher: "DOGC" },
];

/** Every source the page cites: the fixed ones plus each published sector's order or notice, once. */
export function strike11nSources(slots: SectorMinimumServices[] = MINIMUM_SERVICES_11N): B2Source[] {
  const seen = new Set<string>();
  const all: B2Source[] = [];
  const published = slots.flatMap((s) => (s.status === "published" && s.source ? [s.source] : []));
  for (const source of [...published, ...BASE_SOURCES]) {
    if (seen.has(source.url)) continue;
    seen.add(source.url);
    all.push({ name: source.name, url: source.url, publisher: source.publisher });
  }
  return all;
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

type Meta = { path: string; title: string; seoTitle: string; excerpt: string };

export const STRIKE_11N_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/vaga-general-11-novembre",
    title: "Vaga general de l'11 de novembre de 2026: serveis mínims i què funciona a Catalunya",
    seoTitle: "Vaga general 11 de novembre: serveis mínims i què funciona",
    excerpt:
      "La vaga general de l'11 de novembre de 2026 a Catalunya: horari, qui la convoca i per què, serveis mínims de transport, escoles i sanitat, i els drets de qui fa vaga.",
  },
  es: {
    path: "guias/huelga-general-11-noviembre",
    title: "Huelga general del 11 de noviembre de 2026: servicios mínimos y qué funciona en Cataluña",
    seoTitle: "Huelga general 11 de noviembre 2026: servicios mínimos",
    excerpt:
      "La huelga general del 11 de noviembre de 2026 en Cataluña: horario, quién la convoca y por qué, servicios mínimos de transporte, colegios y sanidad, y los derechos de quien hace huelga.",
  },
  en: {
    path: "guides/general-strike-11-november-spain",
    title: "General strike on 11 November 2026 in Spain: what runs in Barcelona and Catalonia",
    seoTitle: "General strike 11 November 2026 in Spain: what runs",
    excerpt:
      "The 11 November 2026 general strike in Barcelona and Catalonia: hours, who called it and why, minimum services for transport, schools and health, and strikers' rights.",
  },
};

const DESCRIPTION: Record<Locale, { pending: string; published: string; past: string }> = {
  ca: {
    pending: "Vaga general el dimecres 11 de novembre de 2026, 24 hores des de les 0 h. Serveis mínims encara no publicats: qui els fixa, quan surten i què funciona.",
    published: "Vaga general el dimecres 11 de novembre de 2026, 24 hores des de les 0 h. Serveis mínims publicats: Rodalies, metro, bus, escoles i sanitat.",
    past: "La vaga general de l'11 de novembre de 2026: qui la va convocar, els serveis mínims de Rodalies, metro, bus, escoles i sanitat, i què diu la llei.",
  },
  es: {
    pending: "Huelga general el miércoles 11 de noviembre de 2026, 24 horas desde las 0 h. Servicios mínimos aún no publicados: quién los fija, cuándo y qué funciona.",
    published: "Huelga general el miércoles 11 de noviembre de 2026, 24 horas desde las 0 h. Servicios mínimos publicados: Rodalies, metro, bus, colegios y sanidad.",
    past: "La huelga general del 11 de noviembre de 2026: quién la convocó, los servicios mínimos de Rodalies, metro, bus, colegios y sanidad, y qué dice la ley.",
  },
  en: {
    pending: "24-hour general strike across Spain on Wednesday 11 November 2026. Minimum services not out yet: who sets them, when, and what runs in Barcelona.",
    published: "24-hour general strike across Spain on Wednesday 11 November 2026. Minimum services are out: Rodalies, metro, buses, schools and hospitals in Catalonia.",
    past: "The 11 November 2026 general strike in Spain: who called it, the minimum services set for Barcelona and Catalonia, and what the law says.",
  },
};

/** Answer-first meta description: the date, the hours, and where minimum services stand. */
export function strike11nDescription(
  locale: Locale,
  asOf: string = STRIKE_11N_AS_OF,
  slots: SectorMinimumServices[] = MINIMUM_SERVICES_11N,
): string {
  const d = DESCRIPTION[locale];
  if (strikePhase(asOf) === "past") return d.past;
  return generalitatOrderPublished(slots) ? d.published : d.pending;
}

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

const SCHOOL_YEAR = SCHOOL_YEARS.find((year) => STRIKE_11N_DATE >= year.start && STRIKE_11N_DATE <= year.end) ?? SCHOOL_YEARS[0]!;

const strip = (text: string) => text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

interface Ctx {
  locale: Locale;
  /** "dimecres 11 de novembre de 2026" */
  day: string;
  /** "29 d'octubre de 2026" */
  checked: string;
  phase: StrikePhase;
  state: MsState;
  slots: SectorMinimumServices[];
}

interface SectorCopy {
  name: string;
  /** Short, for the table. */
  setBy: string;
  /** Long, for the pending line: "the Generalitat, in the order...". */
  setter: string;
  where: string;
}

interface Copy {
  lead: (c: Ctx) => string;
  keyFactsTitle: string;
  keyFacts: (c: Ctx) => { label: string; value: string }[];
  data: (c: Ctx) => string;
  msHeading: string;
  msIntro: (c: Ctx) => string[];
  willListTitle: string;
  willList: string;
  tableCaption: string;
  tableHeaders: string[];
  notPublished: string;
  tableNote: (c: Ctx) => string;
  refHeading: string;
  ref: string;
  refWarningTitle: string;
  refWarning: string;
  sectors: Record<SectorKey, SectorCopy>;
  msLine: (c: Ctx, key: SectorKey) => string;
  transportHeading: string;
  transportIntro: string;
  more: Record<"rodalies" | "tmb" | "fgcTram" | "longDistance" | "airports", string>;
  taxiHeading: string;
  taxi: string;
  schoolsHeading: string;
  schools: (c: Ctx) => string[];
  healthHeading: string;
  health: (c: Ctx) => string[];
  callHeading: string;
  callIntro: string;
  demands: string[];
  callAfter: (c: Ctx) => string[];
  hoursHeading: string;
  hours: string[];
  rightsHeading: string;
  rightsIntro: string;
  rights: string[];
  faq: (c: Ctx) => { question: string; answer: string }[];
}

const schoolSpan = (locale: Locale) => ({
  start: dateYear(SCHOOL_YEAR.start, locale),
  end: dateYear(SCHOOL_YEAR.end, locale),
  christmas: dateYear(SCHOOL_YEAR.christmas[0], locale),
});

/** The minimum-services answer for one sector, as plain text, for the FAQ. */
function sectorAnswer(c: Ctx, key: SectorKey, pending: string): string {
  const s = slot(c.slots, key);
  return s.status === "published" && s.text ? strip(s.text[c.locale]) : pending;
}

const COPY: Record<Locale, Copy> = {
  ca: {
    lead: (c) => {
      const who = "la convoquen CCOO i UGT, amb CGT, CNT i altres organitzacions, per a totes les activitats, públiques i privades";
      if (c.phase === "past") {
        return `**El ${c.day} hi va haver vaga general de 24 hores a tot l'Estat, també a Catalunya,** convocada per CCOO i UGT amb CGT, CNT i altres organitzacions. A la taula de més avall hi ha els serveis mínims que es van fixar per a cada sector.`;
      }
      const first =
        c.phase === "today"
          ? `**Avui, ${c.day}, hi ha vaga general de 24 hores a tot l'Estat, també a Catalunya:** ha començat a les 0 h i ${who}.`
          : `**El ${c.day} hi ha vaga general de 24 hores a tot l'Estat, també a Catalunya:** comença a les 0 h i ${who}.`;
      const ms = {
        pending: ` **Els serveis mínims encara no s'han publicat** (consultat el ${c.checked}): la Generalitat els fixa per ordre al DOGC pocs dies abans, i els posarem aquí, sector per sector, tan bon punt surtin.`,
        partial: ` **Una part dels serveis mínims ja s'ha publicat** i la resta encara no (consultat el ${c.checked}): la taula de més avall diu quins.`,
        published: " **Els serveis mínims ja s'han publicat:** els tens a la taula de més avall, sector per sector, amb l'enllaç a l'ordre o a l'avís oficial.",
      }[c.state];
      return `${first}${ms} **Compte també amb el 10 i el 12 de novembre:** el sindicat de maquinistes SEMAF hi ha convocat vaga al Grup Renfe (aturada total el 10, aturades parcials el 12), que afecta Rodalies.`;
    },
    keyFactsTitle: "La vaga general de l'11 de novembre, d'un cop d'ull",
    keyFacts: (c) => [
      { label: "Dia", value: cap(c.day) },
      { label: "Horari", value: "24 hores des de les 0 h. On es treballa per torns, des del primer torn fins a l'últim" },
      { label: "Convocatòria", value: "CCOO i UGT, amb CGT, CNT i altres organitzacions. A Catalunya, CCOO de Catalunya, UGT de Catalunya i CGT Catalunya; a l'educació, també USTEC·STEs" },
      { label: "Qui hi està cridat", value: "Totes les persones treballadores, assalariades o per compte propi, del sector públic i del privat" },
      {
        label: "Serveis mínims",
        value: {
          pending: `Encara no publicats (consultat el ${c.checked}). Els fixa la Generalitat per ordre al DOGC; els trens de llarga distància, el Govern espanyol`,
          partial: `Publicats en part (consultat el ${c.checked}): mira la taula per sectors`,
          published: "Publicats: mira la taula per sectors",
        }[c.state],
      },
      { label: "Escoles", value: "És dia lectiu: les escoles obren amb el personal mínim que fixi l'ordre de serveis mínims" },
      { label: "10 i 12 de novembre", value: "Vaga de maquinistes del Grup Renfe (SEMAF), que afecta Rodalies: aturada total el 10 i aturades parcials el 12" },
    ],
    data: (c) =>
      `Només hi posem el que publiquen els sindicats convocants, el BOE, el DOGC, el Departament d'Empresa i Treball i els operadors de transport, i no el que avança la premsa.${c.state === "published" ? "" : " Quan surtin els serveis mínims, els afegirem a la taula, sector per sector, amb l'enllaç a l'ordre."}`,
    msHeading: "Serveis mínims de l'11 de novembre: què funciona",
    msIntro: (c) =>
      c.state === "pending"
        ? [
            `**Encara no s'han publicat.** El ${c.checked}, la ${link(U.treballMs, "llista de vagues amb serveis mínims del Departament d'Empresa i Treball")} no tenia cap ordre per a l'11 de novembre, i Rodalies, TMB i FGC no hi tenien cap avís. Quan surti, l'ordre també es publicarà al ${link(U.dogc, "DOGC")}.`,
            `Els dels serveis que depenen de la Generalitat (Rodalies i regionals, metro, autobusos, tramvia, FGC, escoles, sanitat pública i la mateixa Administració) els fixarà el Departament d'Empresa i Treball amb una ordre que es publica al DOGC. Els dels serveis de l'Estat, com l'alta velocitat i la llarga distància, els fixa el Govern espanyol.`,
            `**Quan surten:** a les vagues generals del 2024, l'ordre es va signar dos o tres dies abans. L'${link(U.emt38, "Ordre EMT/38/2024")} es va signar el 5 de març per a la vaga del 8, i el DOGC la va publicar el 6; l'${link(U.emt201, "Ordre EMT/201/2024")} es va signar el 25 de setembre per a la del 27, i el DOGC la va publicar el mateix dia 27. Si es repeteix aquest calendari, l'ordre de l'11 de novembre es signaria cap al 8 o el 9 de novembre, però no hi ha cap data oficial.`,
          ]
        : [
            `Aquí tens el que fixen l'ordre de la Generalitat i els avisos dels operadors, sector per sector, tal com eren el ${c.checked}. En cas de dubte, compta el text oficial enllaçat a cada fila.`,
          ],
    willListTitle: "Aquesta pàgina els hi posarà quan surtin",
    willList: "Quan es publiquin, hi afegirem el que fixi l'ordre per a cada servei, amb l'enllaç al DOGC o a l'avís de l'operador. Fins llavors, les fonts oficials són les de la columna de la dreta de la taula.",
    tableCaption: "Serveis mínims de l'11 de novembre: qui els fixa i on es consulten",
    tableHeaders: ["Servei", "Qui els fixa", "Serveis mínims", "On es consulten"],
    notPublished: "Encara no publicats",
    tableNote: (c) => `Consultat el ${c.checked}. Les ordres de la Generalitat també cobreixen la resta d'autobusos urbans i interurbans, inclòs el que va a l'aeroport.`,
    refHeading: "Què va fixar l'última vaga general (2024), només com a referència",
    ref: "Per a la vaga general del 27 de setembre de 2024, l'Ordre EMT/201/2024 va fixar el **85% del servei** a Rodalies i regionals, al metro, als autobusos de TMB, a FGC, al tramvia i a la resta del transport urbà i interurbà, inclòs l'autobús entre Barcelona i l'aeroport, i va permetre repartir aquell percentatge de manera irregular al llarg del dia.",
    refWarningTitle: "No és una previsió per a l'11 de novembre",
    refWarning: "Aquella vaga la convocaven CGT i Solidaridad Obrera, i l'ordre justificava els percentatges, entre altres raons, perquè no l'havien convocada «altres associacions sindicals que disposen de més àmplia representativitat en el teixit laboral català». La de l'11 de novembre la convoquen CCOO i UGT, i l'ordre pot fixar percentatges diferents.",
    sectors: {
      rodalies: {
        name: "Rodalies i regionals",
        setBy: "Generalitat (ordre al DOGC)",
        setter: "Els fixarà l'ordre de la Generalitat al DOGC.",
        where: `${link(U.rodaliesStatus, "rodalies.gencat.cat")}, amb l'horari de cada línia; el mateix dia, [els avisos de la teva línia](${rodaliesHub("ca")})`,
      },
      tmb: {
        name: "Metro i autobusos de TMB",
        setBy: "Generalitat (ordre al DOGC)",
        setter: "Els fixarà l'ordre de la Generalitat al DOGC.",
        where: `${link(U.tmb, "tmb.cat")}, avisos de servei`,
      },
      fgcTram: {
        name: "FGC i tramvia",
        setBy: "Generalitat (ordre al DOGC)",
        setter: "Els fixarà l'ordre de la Generalitat al DOGC.",
        where: link(U.fgc, "fgc.cat"),
      },
      longDistance: {
        name: "Alta velocitat i llarga distància (Renfe, Ouigo)",
        setBy: "Govern espanyol",
        setter: "Els fixa el Govern espanyol, no la Generalitat.",
        where: `${link(U.renfe, "renfe.com")} i ${link(U.ouigo, "ouigo.com")}`,
      },
      airports: {
        name: "Vols del Prat, Girona i Reus",
        setBy: "No la Generalitat: l'operativa d'Aena no és a les seves ordres",
        setter: "Dels vols n'informen Aena i les companyies aèries.",
        where: `${link(U.aena, "Infovuelos d'Aena")} i la teva companyia aèria`,
      },
      schools: {
        name: "Escoles, instituts i llars d'infants",
        setBy: "Generalitat (ordre al DOGC)",
        setter: "Els fixarà l'ordre de la Generalitat al DOGC.",
        where: "L'escola informa les famílies",
      },
      health: {
        name: "Hospitals, CAP i farmàcies de guàrdia",
        setBy: "Generalitat (ordre al DOGC)",
        setter: "Els fixarà l'ordre de la Generalitat al DOGC.",
        where: "El teu centre de salut o hospital",
      },
    },
    msLine: (c, key) => {
      const s = slot(c.slots, key);
      return s.status === "published" && s.text
        ? `**Serveis mínims:** ${s.text.ca}`
        : `**Serveis mínims:** encara no publicats (consultat el ${c.checked}). ${COPY.ca.sectors[key].setter}`;
    },
    transportHeading: "Transport: Rodalies, metro, bus, FGC, trens i avions",
    transportIntro: "Una vaga general pot afectar tots els operadors alhora, i cadascun publica els seus horaris de serveis mínims quan surt l'ordre. Mira'ls el vespre abans i el mateix matí: les ordres permeten repartir el percentatge de manera desigual al llarg del dia, així que no tots els trens o autobusos de la teva hora hi seran.",
    more: {
      rodalies: `Rodalies publica l'horari de serveis mínims de cada línia al seu ${link(U.rodaliesStatus, "web d'alteracions del servei")}: per a la vaga de Renfe del 29 d'octubre de 2026, l'avís amb els percentatges ja era actualitzat el dia 26. El mateix dia de la vaga, mira [els avisos de la teva línia avui](${rodaliesHub("ca")}), llegits en directe de Rodalies de Catalunya. **El dia abans i el dia després també hi ha vaga a Renfe:** el sindicat de maquinistes SEMAF ha convocat una aturada total el dimarts 10 de novembre i aturades parcials al llarg del dijous 12, segons ${link(U.semaf1012, "el seu comunicat del 29 d'octubre")}, sense hores ni serveis mínims publicats encara.`,
      tmb: `TMB els publica als seus ${link(U.tmb, "avisos de servei")}. L'horari d'un dia normal és a ${b2link("hours", "ca", "l'horari del metro i del NitBus")}.`,
      fgcTram: `FGC informa de l'estat del servei a ${link(U.fgc, "fgc.cat")}. Les ordres de les vagues generals del 2024 també hi incloïen el tramvia i la resta d'autobusos urbans i interurbans.`,
      longDistance: `Els trens d'alta velocitat i de llarga distància són serveis de l'Estat, i per això no són a l'ordre de la Generalitat: per a la vaga d'Ouigo d'aquesta tardor, els serveis mínims els va fixar el Ministeri de Transports, amb ${link(U.ouigoResolution, "una resolució del 27 d'octubre")}. Si tens bitllet per a l'11, mira ${link(U.renfe, "renfe.com")} o el web del teu operador; la vaga de maquinistes de SEMAF del 10 i el 12 de novembre també afecta els trens de Renfe.`,
      airports: `Les ordres de la Generalitat només fixen l'operativa dels aeroports que gestiona ella, Lleida-Alguaire i Andorra-la Seu d'Urgell. Per als vols del Prat, Girona i Reus, que són d'Aena, mira l'estat del vol a la teva companyia o a ${link(U.aena, "Infovuelos d'Aena")}, i les maneres d'arribar-hi a ${b2link("airport", "ca", "la guia de l'aeroport al centre de Barcelona")}.`,
    },
    taxiHeading: "Taxi",
    taxi: "Les ordres de serveis mínims de les vagues generals del 2024 (EMT/38/2024 i EMT/201/2024) no esmentaven el taxi.",
    schoolsHeading: "Hi ha escola l'11 de novembre?",
    schools: (c) => {
      const s = schoolSpan("ca");
      return [
        `**Sí, és dia lectiu.** El curs 2026-2027 va del ${s.start} al ${s.end} i les vacances de Nadal comencen el ${s.christmas}, segons l'${link(U.schoolOrder, "Ordre EDF/66/2026")}, i l'11 de novembre no és cap dels festius de tot Catalunya. Una vaga no canvia el calendari escolar: les escoles obren, amb el personal mínim que fixi l'ordre de serveis mínims, i és cada escola qui diu a les famílies què pot garantir aquell dia. Compta també els dies de lliure disposició de la teva escola i la festa local, si n'hi ha: ${link(`/ca/${TOOL_PATHS.school.ca}/`, "calendari escolar 2026-2027")}.`,
        `**Qui fa vaga a l'educació:** el sindicat docent USTEC·STEs ha ratificat la vaga general i diu: «Cridem tot el personal educatiu a fer vaga». ${c.phase === "past" ? "" : "Per tant, alguns docents i altres treballadors de l'escola poden no ser-hi."}`.trim(),
        slot(c.slots, "schools").status === "published" && slot(c.slots, "schools").text
          ? `**Serveis mínims a les escoles:** ${slot(c.slots, "schools").text!.ca}`
          : "**Què va fixar l'última vaga general, només com a referència:** per a la del 27 de setembre de 2024, l'Ordre EMT/201/2024 va fixar a cada escola una persona de l'equip directiu i, a més, dos docents per cada quatre grups a infantil i primària i un per cada tres a secundària; el 2024 també fixava el 50% de la plantilla a l'educació especial, a les llars d'infants i al menjador, i el transport escolar es mantenia cap a les escoles d'infantil i primària sense transport públic alternatiu. En paraules d'aquella ordre, cal garantir «un servei de vigilància i atenció» als alumnes. L'ordre de l'11 de novembre pot fixar-ne uns altres.",
      ];
    },
    healthHeading: "Sanitat: hospitals, CAP i farmàcies",
    health: (c) => {
      const s = slot(c.slots, "health");
      return [
        s.status === "published" && s.text
          ? `**Serveis mínims:** ${s.text.ca}`
          : `**Serveis mínims:** encara no publicats (consultat el ${c.checked}). Els fixarà la mateixa ordre de la Generalitat, que a la vaga general del 2024 cobria tant els centres sanitaris públics com els privats.`,
        "**Què va fixar l'última vaga general, només com a referència:** per a la del 27 de setembre de 2024, l'Ordre EMT/201/2024 va mantenir el funcionament normal de les urgències dels hospitals i de les unitats especials (cures intensives, diàlisi, parts, radioteràpia i quimioteràpia), l'atenció urgent als centres fora de l'hospital durant el seu horari habitual, el transport sanitari urgent i les farmàcies de guàrdia.",
        ...(c.phase === "past"
          ? []
          : [
              `**A més, els metges ja són en vaga:** Metges de Catalunya fa des del 28 d'octubre de 2026 una vaga indefinida del personal facultatiu, que continuava el ${c.checked}. ${link(U.ordreMetges, "L'ordre del Departament d'Empresa i Treball del 22 d'octubre")} hi manté amb normalitat les urgències i les unitats especials. Els detalls, a ${b2link("strikes", "ca", "la guia de vagues a Catalunya")}.`,
            ]),
      ];
    },
    callHeading: "Qui convoca la vaga general i per què",
    callIntro: `És una vaga general de tot l'Estat. CCOO va informar el 19 d'octubre de 2026 que «ya está registrada» i la va presentar als mitjans aquell dia a la seu del Ministeri de Treball, amb UGT, CGT, CNT, la Confederación Intersindical, CO.BAS, el Sindicato de Inquilinas i la Unión de Actores y Actrices. A Catalunya la convoquen CCOO de Catalunya, la UGT de Catalunya i CGT Catalunya. Les reivindicacions, amb les paraules de cada organització:`,
    demands: [
      `**UGT i CCOO** (${link(U.ugtCatalunyaCall, "crida del 13 d'octubre")}, publicada per la UGT de Catalunya): convoquen la vaga «per desbloquejar la negociació col·lectiva» i per apujar els salaris, reduir la jornada laboral, millorar la salut de les persones treballadores i eradicar la precarietat, i exigeixen a les administracions que actuïn «contra l'especulació immobiliària».`,
      `**CCOO de Catalunya** (${link(U.ccooCatalunya, "11n.cat")}): una vaga «per garantir un habitatge assequible», «per millorar els salaris», «perquè viure millor costi menys», «per garantir uns serveis públics de qualitat», per la salut de les persones treballadores i per defensar el sistema públic de pensions.`,
      `**UGT de Catalunya** (${link(U.ugtCatalunya, "ugt.cat")}): «Que l'habitatge no es mengi el teu salari». Vol «recuperar poder adquisitiu, apujar els salaris i desbloquejar la negociació col·lectiva», i diu que «l'habitatge és un dret, no un negoci».`,
      `**UGT** (${link(U.ugt, "ugt.es")}): reclama una pujada del salari mínim interprofessional (SMI) d'almenys el 7% el 2027.`,
      `**CGT Catalunya** (${link(U.cgtCatalunya, "9 d'octubre")}): set reivindicacions, entre les quals la reducció del preu de l'habitatge, la «reducció de la jornada laboral a 35 hores setmanals» sense reducció salarial i un salari mínim i una pensió mínima de 1.500 €.`,
      `**USTEC·STEs** (${link(U.ustec, "9 d'octubre")}): ha ratificat la vaga a l'educació amb el lema «sense casa, no hi ha educació».`,
    ],
    callAfter: (c) => [
      `**Manifestacions:** CCOO de Catalunya anuncia manifestacions l'11 de novembre «en les principals capitals de província» i diu que les anirà anunciant als seus canals; la UGT de Catalunya resumeix el pla així: «L'11N al matí buidarem les empreses, a la tarda omplirem els carrers». El ${c.checked} cap dels convocants no n'havia publicat l'hora ni el lloc.`,
    ],
    hoursHeading: "Horari: a quina hora comença i acaba",
    hours: [
      `La vaga comença a les 0 h de l'11 de novembre i dura 24 hores. Segons ${link(U.ccooCatalunya, "CCOO de Catalunya")}, «es convoca per a tot el dia, a totes les activitats».`,
      "On es treballa per torns, «la vaga comença amb el primer torn, encara que aquest comenci abans de les 0 hores, i acaba amb el darrer torn, malgrat que aquest acabi després de les 0h».",
      "Segons CCOO de Catalunya, només les administracions i les empreses que fan «activitats essencials per a la comunitat» poden tenir serveis mínims.",
    ],
    rightsHeading: "Drets de qui fa vaga (i de qui no): què diu la llei",
    rightsIntro: `El dret de vaga el reconeix ${link(U.constitution, "l'article 28.2 de la Constitució")}: «Se reconoce el derecho a la huelga de los trabajadores para la defensa de sus intereses». L'article 6 del ${link(U.rdl17, "Reial decret llei 17/1977")} en fixa els efectes:`,
    rights: [
      "**No et poden acomiadar ni sancionar per fer vaga** (article 6.1), llevat que durant la vaga cometis una falta laboral.",
      `**Aquell dia no cobres:** «Durante la huelga se entenderá suspendido el contrato de trabajo y el trabajador no tendrá derecho al salario» (article 6.2). Segons el ${link(U.treballFaq, "Departament d'Empresa i Treball")}, l'empresa ho descompta de la nòmina següent, amb el salari base, els complements salarials i les parts proporcionals de les pagues extraordinàries.`,
      "**Seguretat Social:** quedes en situació d'alta especial, i ni tu ni l'empresa no cotitzeu aquell dia (article 6.3).",
      "**Qui no vol fer vaga pot treballar:** la llei respecta la llibertat de treball de qui no s'hi vol sumar (article 6.4).",
      "**L'empresa no et pot substituir** per persones que no hi treballaven quan es va comunicar la vaga (article 6.5).",
      "**No cal avisar l'empresa:** «La normativa reguladora del dret de vaga no contempla l'obligació de preavís per part de la persona treballadora», segons el Departament d'Empresa i Treball. El preavís el fan els sindicats que convoquen: cinc dies naturals, o deu si la vaga afecta serveis públics (articles 3 i 4 del Reial decret llei 17/1977).",
      `**Si l'empresa et designa per als serveis mínims, hi has d'anar,** recorda CCOO de Catalunya. A l'última vaga general, l'article 2 de l'${link(U.emt201, "Ordre EMT/201/2024")} deia que l'empresa designa aquestes persones després d'escoltar el comitè de vaga, preferentment entre les que no fan vaga, i que els ho ha de comunicar de manera formal.`,
    ],
    faq: (c) => {
      const pendingCheck = `encara no s'han publicat (consultat el ${c.checked})`;
      return [
        {
          question: "Què funciona l'11 de novembre?",
          answer:
            c.state === "pending"
              ? `Els serveis essencials funcionen amb serveis mínims: transport públic, escoles, hospitals, farmàcies de guàrdia i serveis d'emergència. Els percentatges ${pendingCheck}: els fixarà la Generalitat per ordre al DOGC, i el Govern espanyol per a l'alta velocitat i la llarga distància. Els posarem en aquesta pàgina quan surtin.`
              : "Els serveis essencials funcionen amb els serveis mínims publicats, que són a la taula d'aquesta pàgina sector per sector: Rodalies, metro i bus, FGC i tramvia, trens de llarga distància, vols, escoles i sanitat.",
        },
        {
          question: "Hi ha escola l'11N?",
          answer: "Sí. L'11 de novembre és dia lectiu al calendari escolar 2026-2027 i una vaga no el canvia: les escoles obren amb el personal mínim que fixa l'ordre de serveis mínims, i cada escola informa les famílies del que pot garantir. Alguns docents poden fer vaga: USTEC·STEs crida tot el personal educatiu a fer-ne.",
        },
        {
          question: "Hi ha metro l'11 de novembre?",
          answer: sectorAnswer(c, "tmb", `Sí, amb serveis mínims, que fixarà la Generalitat i que ${pendingCheck}. A la vaga general del 27 de setembre de 2024 van ser el 85% del servei, però l'ordre de l'11 de novembre pot fixar-ne uns altres.`),
        },
        {
          question: "Hi ha Rodalies l'11 de novembre?",
          answer: `${sectorAnswer(c, "rodalies", `Sí, amb serveis mínims, que fixarà la Generalitat i que ${pendingCheck}. Rodalies publica l'horari de serveis mínims de cada línia al seu web quan surt l'ordre.`)} A més, el 10 i el 12 de novembre hi ha vaga de maquinistes del Grup Renfe convocada per SEMAF.`,
        },
        {
          question: "A quina hora comença la vaga general?",
          answer: "A les 0 h de l'11 de novembre, i dura 24 hores. On es treballa per torns, comença amb el primer torn encara que comenci abans de mitjanit i acaba amb l'últim encara que acabi després, segons CCOO de Catalunya.",
        },
        {
          question: "He d'avisar l'empresa si faig vaga?",
          answer: "No. Segons el Departament d'Empresa i Treball, la normativa no obliga la persona treballadora a avisar abans. Si l'empresa et designa formalment per als serveis mínims, sí que has d'anar a treballar.",
        },
        {
          question: "Em descompten el sou si faig vaga?",
          answer: "Sí. Durant la vaga el contracte queda suspès i no tens dret al salari (article 6.2 del Reial decret llei 17/1977). L'empresa descompta les hores no treballades de la nòmina següent, amb la part proporcional de les pagues extraordinàries, i aquell dia ni tu ni l'empresa no cotitzeu a la Seguretat Social.",
        },
        {
          question: "Quan es publiquen els serveis mínims de l'11N?",
          answer:
            c.state === "pending"
              ? `Pocs dies abans: a les vagues generals del 2024, l'ordre de la Generalitat es va signar dos o tres dies abans i el DOGC la va publicar entre dos dies abans i el mateix dia de la vaga. El ${c.checked} encara no hi era.`
              : "Ja s'han publicat: són a la taula d'aquesta pàgina, amb l'enllaç a l'ordre o a l'avís oficial de cada sector.",
        },
      ];
    },
  },
  es: {
    lead: (c) => {
      const who = "la convocan CCOO y UGT, con CGT, CNT y otras organizaciones, para todas las actividades, públicas y privadas";
      if (c.phase === "past") {
        return `**El ${c.day} hubo huelga general de 24 horas en toda España, también en Cataluña,** convocada por CCOO y UGT con CGT, CNT y otras organizaciones. En la tabla de más abajo están los servicios mínimos que se fijaron para cada sector.`;
      }
      const first =
        c.phase === "today"
          ? `**Hoy, ${c.day}, hay huelga general de 24 horas en toda España, también en Cataluña:** ha empezado a las 0 h y ${who}.`
          : `**El ${c.day} hay huelga general de 24 horas en toda España, también en Cataluña:** empieza a las 0 h y ${who}.`;
      const ms = {
        pending: ` **Los servicios mínimos aún no se han publicado** (consultado el ${c.checked}): la Generalitat los fija por orden en el DOGC pocos días antes, y los pondremos aquí, sector por sector, en cuanto salgan.`,
        partial: ` **Una parte de los servicios mínimos ya se ha publicado** y el resto aún no (consultado el ${c.checked}): la tabla de más abajo dice cuáles.`,
        published: " **Los servicios mínimos ya se han publicado:** los tienes en la tabla de más abajo, sector por sector, con el enlace a la orden o al aviso oficial.",
      }[c.state];
      return `${first}${ms} **Ojo también al 10 y al 12 de noviembre:** el sindicato de maquinistas SEMAF ha convocado huelga en el Grupo Renfe (paro total el 10, paros parciales el 12), que afecta a Rodalies.`;
    },
    keyFactsTitle: "La huelga general del 11 de noviembre, de un vistazo",
    keyFacts: (c) => [
      { label: "Día", value: cap(c.day) },
      { label: "Horario", value: "24 horas desde las 0 h. Donde se trabaja por turnos, desde el primer turno hasta el último" },
      { label: "Convocatoria", value: "CCOO y UGT, con CGT, CNT y otras organizaciones. En Cataluña, CCOO de Catalunya, UGT de Catalunya y CGT Catalunya; en educación, también USTEC·STEs" },
      { label: "A quién llama", value: "A todas las personas trabajadoras, asalariadas o por cuenta propia, del sector público y del privado" },
      {
        label: "Servicios mínimos",
        value: {
          pending: `Aún no publicados (consultado el ${c.checked}). Los fija la Generalitat por orden en el DOGC; los trenes de larga distancia, el Gobierno de España`,
          partial: `Publicados en parte (consultado el ${c.checked}): mira la tabla por sectores`,
          published: "Publicados: mira la tabla por sectores",
        }[c.state],
      },
      { label: "Colegios", value: "Es día lectivo: los colegios abren con el personal mínimo que fije la orden de servicios mínimos" },
      { label: "10 y 12 de noviembre", value: "Huelga de maquinistas del Grupo Renfe (SEMAF), que afecta a Rodalies: paro total el 10 y paros parciales el 12" },
    ],
    data: (c) =>
      `Solo ponemos lo que publican los sindicatos convocantes, el BOE, el DOGC, el Departament d'Empresa i Treball y los operadores de transporte, no lo que adelanta la prensa.${c.state === "published" ? "" : " Cuando salgan los servicios mínimos, los añadiremos a la tabla, sector por sector, con el enlace a la orden."}`,
    msHeading: "Servicios mínimos del 11 de noviembre: qué funciona",
    msIntro: (c) =>
      c.state === "pending"
        ? [
            `**Aún no se han publicado.** El ${c.checked}, la ${link(U.treballMs, "lista de huelgas con servicios mínimos del Departament d'Empresa i Treball")} no tenía ninguna orden para el 11 de noviembre, y Rodalies, TMB y FGC no tenían ningún aviso. Cuando salga, la orden también se publicará en el ${link(U.dogc, "DOGC")}.`,
            `Los de los servicios que dependen de la Generalitat (Rodalies y regionales, metro, autobuses, tranvía, FGC, escuelas, sanidad pública y la propia Administración) los fijará el Departament d'Empresa i Treball con una orden que se publica en el DOGC. Los de los servicios del Estado, como la alta velocidad y la larga distancia, los fija el Gobierno de España.`,
            `**Cuándo salen:** en las huelgas generales de 2024, la orden se firmó dos o tres días antes. La ${link(U.emt38, "Ordre EMT/38/2024")} se firmó el 5 de marzo para la huelga del 8, y el DOGC la publicó el 6; la ${link(U.emt201, "Ordre EMT/201/2024")} se firmó el 25 de septiembre para la del 27, y el DOGC la publicó el mismo día 27. Si se repite ese calendario, la orden del 11 de noviembre se firmaría hacia el 8 o el 9 de noviembre, pero no hay ninguna fecha oficial.`,
          ]
        : [
            `Aquí tienes lo que fijan la orden de la Generalitat y los avisos de los operadores, sector por sector, tal como estaban el ${c.checked}. En caso de duda, cuenta el texto oficial enlazado en cada fila.`,
          ],
    willListTitle: "Esta página los pondrá en cuanto salgan",
    willList: "Cuando se publiquen, añadiremos lo que fije la orden para cada servicio, con el enlace al DOGC o al aviso del operador. Hasta entonces, las fuentes oficiales son las de la columna de la derecha de la tabla.",
    tableCaption: "Servicios mínimos del 11 de noviembre: quién los fija y dónde se consultan",
    tableHeaders: ["Servicio", "Quién los fija", "Servicios mínimos", "Dónde se consultan"],
    notPublished: "Aún no publicados",
    tableNote: (c) => `Consultado el ${c.checked}. Las órdenes de la Generalitat también cubren el resto de autobuses urbanos e interurbanos, incluido el que va al aeropuerto.`,
    refHeading: "Qué fijó la última huelga general (2024), solo como referencia",
    ref: "Para la huelga general del 27 de septiembre de 2024, la Ordre EMT/201/2024 fijó el **85% del servicio** en Rodalies y regionales, el metro, los autobuses de TMB, FGC, el tranvía y el resto del transporte urbano e interurbano, incluido el autobús entre Barcelona y el aeropuerto, y permitió repartir ese porcentaje de forma irregular a lo largo del día.",
    refWarningTitle: "No es una previsión para el 11 de noviembre",
    refWarning: "Aquella huelga la convocaban CGT y Solidaridad Obrera, y la orden justificaba los porcentajes, entre otras razones, porque no la habían convocado «altres associacions sindicals que disposen de més àmplia representativitat en el teixit laboral català» (otros sindicatos con más representatividad en Cataluña). La del 11 de noviembre la convocan CCOO y UGT, y la orden puede fijar porcentajes distintos.",
    sectors: {
      rodalies: {
        name: "Rodalies y regionales",
        setBy: "Generalitat (orden en el DOGC)",
        setter: "Los fijará la orden de la Generalitat en el DOGC.",
        where: `${link(U.rodaliesStatus, "rodalies.gencat.cat")}, con el horario de cada línea; el mismo día, [los avisos de tu línea](${rodaliesHub("es")})`,
      },
      tmb: {
        name: "Metro y autobuses de TMB",
        setBy: "Generalitat (orden en el DOGC)",
        setter: "Los fijará la orden de la Generalitat en el DOGC.",
        where: `${link(U.tmb, "tmb.cat")}, avisos de servicio`,
      },
      fgcTram: {
        name: "FGC y tranvía",
        setBy: "Generalitat (orden en el DOGC)",
        setter: "Los fijará la orden de la Generalitat en el DOGC.",
        where: link(U.fgc, "fgc.cat"),
      },
      longDistance: {
        name: "Alta velocidad y larga distancia (Renfe, Ouigo)",
        setBy: "Gobierno de España",
        setter: "Los fija el Gobierno de España, no la Generalitat.",
        where: `${link(U.renfe, "renfe.com")} y ${link(U.ouigo, "ouigo.com")}`,
      },
      airports: {
        name: "Vuelos de El Prat, Girona y Reus",
        setBy: "No la Generalitat: la operativa de Aena no está en sus órdenes",
        setter: "De los vuelos informan Aena y las compañías aéreas.",
        where: `${link(U.aena, "Infovuelos de Aena")} y tu compañía aérea`,
      },
      schools: {
        name: "Colegios, institutos y guarderías",
        setBy: "Generalitat (orden en el DOGC)",
        setter: "Los fijará la orden de la Generalitat en el DOGC.",
        where: "El colegio informa a las familias",
      },
      health: {
        name: "Hospitales, CAP y farmacias de guardia",
        setBy: "Generalitat (orden en el DOGC)",
        setter: "Los fijará la orden de la Generalitat en el DOGC.",
        where: "Tu centro de salud u hospital",
      },
    },
    msLine: (c, key) => {
      const s = slot(c.slots, key);
      return s.status === "published" && s.text
        ? `**Servicios mínimos:** ${s.text.es}`
        : `**Servicios mínimos:** aún no publicados (consultado el ${c.checked}). ${COPY.es.sectors[key].setter}`;
    },
    transportHeading: "Transporte: Rodalies, metro, bus, FGC, trenes y aviones",
    transportIntro: "Una huelga general puede afectar a todos los operadores a la vez, y cada uno publica sus horarios de servicios mínimos cuando sale la orden. Míralos la noche antes y la misma mañana: las órdenes permiten repartir el porcentaje de forma desigual a lo largo del día, así que no todos los trenes o autobuses de tu hora estarán.",
    more: {
      rodalies: `Rodalies publica el horario de servicios mínimos de cada línea en su ${link(U.rodaliesStatus, "web de alteraciones del servicio")}: para la huelga de Renfe del 29 de octubre de 2026, el aviso con los porcentajes ya estaba actualizado el día 26. El mismo día de la huelga, mira [los avisos de tu línea hoy](${rodaliesHub("es")}), leídos en directo de Rodalies de Catalunya. **El día antes y el día después también hay huelga en Renfe:** el sindicato de maquinistas SEMAF ha convocado un paro total el martes 10 de noviembre y paros parciales a lo largo del jueves 12, según ${link(U.semaf1012, "su comunicado del 29 de octubre")}, sin horas ni servicios mínimos publicados todavía.`,
      tmb: `TMB los publica en sus ${link(U.tmb, "avisos de servicio")}. El horario de un día normal está en ${b2link("hours", "es", "el horario del metro y del NitBus")}.`,
      fgcTram: `FGC informa del estado del servicio en ${link(U.fgc, "fgc.cat")}. Las órdenes de las huelgas generales de 2024 también incluían el tranvía y el resto de autobuses urbanos e interurbanos.`,
      longDistance: `Los trenes de alta velocidad y de larga distancia son servicios del Estado, y por eso no están en la orden de la Generalitat: para la huelga de Ouigo de este otoño, los servicios mínimos los fijó el Ministerio de Transportes, con ${link(U.ouigoResolution, "una resolución del 27 de octubre")}. Si tienes billete para el 11, mira ${link(U.renfe, "renfe.com")} o la web de tu operador; la huelga de maquinistas de SEMAF del 10 y el 12 de noviembre también afecta a los trenes de Renfe.`,
      airports: `Las órdenes de la Generalitat solo fijan la operativa de los aeropuertos que gestiona ella, Lleida-Alguaire y Andorra-La Seu d'Urgell. Para los vuelos de El Prat, Girona y Reus, que son de Aena, mira el estado del vuelo en tu compañía o en ${link(U.aena, "Infovuelos de Aena")}, y las formas de llegar en ${b2link("airport", "es", "la guía del aeropuerto al centro de Barcelona")}.`,
    },
    taxiHeading: "Taxi",
    taxi: "Las órdenes de servicios mínimos de las huelgas generales de 2024 (EMT/38/2024 y EMT/201/2024) no mencionaban el taxi.",
    schoolsHeading: "¿Hay colegio el 11 de noviembre?",
    schools: (c) => {
      const s = schoolSpan("es");
      return [
        `**Sí, es día lectivo.** El curso 2026-2027 va del ${s.start} al ${s.end} y las vacaciones de Navidad empiezan el ${s.christmas}, según la ${link(U.schoolOrder, "Ordre EDF/66/2026")}, y el 11 de noviembre no es ninguno de los festivos de toda Cataluña. Una huelga no cambia el calendario escolar: los colegios abren, con el personal mínimo que fije la orden de servicios mínimos, y es cada colegio quien dice a las familias qué puede garantizar ese día. Cuenta también los días de libre disposición de tu colegio y la fiesta local, si la hay: ${link(`/es/${TOOL_PATHS.school.es}/`, "calendario escolar 2026-2027")}.`,
        `**Quién hace huelga en la educación:** el sindicato docente USTEC·STEs ha ratificado la huelga general y llama a todo el personal educativo a la huelga («Cridem tot el personal educatiu a fer vaga»). ${c.phase === "past" ? "" : "Por tanto, algunos docentes y otros trabajadores del colegio pueden no estar."}`.trim(),
        slot(c.slots, "schools").status === "published" && slot(c.slots, "schools").text
          ? `**Servicios mínimos en los colegios:** ${slot(c.slots, "schools").text!.es}`
          : "**Qué fijó la última huelga general, solo como referencia:** para la del 27 de septiembre de 2024, la Ordre EMT/201/2024 fijó en cada escuela una persona del equipo directivo y, además, dos docentes por cada cuatro grupos en infantil y primaria y uno por cada tres en secundaria; en 2024 también fijaba el 50% de la plantilla en educación especial, en las guarderías y en el comedor, y el transporte escolar se mantenía hacia las escuelas de infantil y primaria sin transporte público alternativo. En palabras de aquella orden, hay que garantizar «un servei de vigilància i atenció» a los alumnos. La orden del 11 de noviembre puede fijar otros.",
      ];
    },
    healthHeading: "Sanidad: hospitales, CAP y farmacias",
    health: (c) => {
      const s = slot(c.slots, "health");
      return [
        s.status === "published" && s.text
          ? `**Servicios mínimos:** ${s.text.es}`
          : `**Servicios mínimos:** aún no publicados (consultado el ${c.checked}). Los fijará la misma orden de la Generalitat, que en la huelga general de 2024 cubría tanto los centros sanitarios públicos como los privados.`,
        "**Qué fijó la última huelga general, solo como referencia:** para la del 27 de septiembre de 2024, la Ordre EMT/201/2024 mantuvo el funcionamiento normal de las urgencias de los hospitales y de las unidades especiales (cuidados intensivos, diálisis, partos, radioterapia y quimioterapia), la atención urgente en los centros fuera del hospital durante su horario habitual, el transporte sanitario urgente y las farmacias de guardia.",
        ...(c.phase === "past"
          ? []
          : [
              `**Además, los médicos ya están en huelga:** Metges de Catalunya mantiene desde el 28 de octubre de 2026 una huelga indefinida del personal facultativo, que seguía el ${c.checked}. ${link(U.ordreMetges, "La orden del Departament d'Empresa i Treball del 22 de octubre")} mantiene con normalidad las urgencias y las unidades especiales. Los detalles, en ${b2link("strikes", "es", "la guía de huelgas en Cataluña")}.`,
            ]),
      ];
    },
    callHeading: "Quién convoca la huelga general y por qué",
    callIntro: `Es una huelga general de toda España. CCOO informó el 19 de octubre de 2026 de que «ya está registrada» y la presentó a los medios ese día en la sede del Ministerio de Trabajo, con UGT, CGT, CNT, la Confederación Intersindical, CO.BAS, el Sindicato de Inquilinas y la Unión de Actores y Actrices. En Cataluña la convocan CCOO de Catalunya, la UGT de Catalunya y CGT Catalunya. Las reivindicaciones, con las palabras de cada organización:`,
    demands: [
      `**CCOO y UGT** (${link(U.ccooCall, "convocatoria del 7 de octubre")}): llaman a la huelga «para desbloquear la negociación colectiva», para «subir salarios», «reducir la jornada», «mejorar la salud de las personas trabajadoras» y «erradicar la precariedad», y para que las administraciones impulsen políticas «que acaben con la especulación de la vivienda».`,
      `**UGT** (${link(U.ugt, "ugt.es")}): «Reclamamos una subida del SMI de, al menos, un 7% en 2027».`,
      `**CCOO de Catalunya** (${link(U.ccooCatalunya, "11n.cat")}): una huelga para garantizar una vivienda asequible, mejorar los salarios, que vivir mejor cueste menos, garantizar unos servicios públicos de calidad, por la salud de las personas trabajadoras y por el sistema público de pensiones.`,
      `**UGT de Catalunya** (${link(U.ugtCatalunya, "ugt.cat")}): «Que l'habitatge no es mengi el teu salari» (que la vivienda no se coma tu salario); quiere recuperar poder adquisitivo, subir los salarios y desbloquear la negociación colectiva.`,
      `**CGT Catalunya** (${link(U.cgtCatalunya, "9 de octubre")}): siete reivindicaciones, entre ellas bajar el precio de la vivienda, la reducción de la jornada laboral a 35 horas semanales sin reducción salarial y un salario mínimo y una pensión mínima de 1.500 €.`,
      `**USTEC·STEs** (${link(U.ustec, "9 de octubre")}): ha ratificado la huelga en la educación con el lema «sense casa, no hi ha educació» (sin casa no hay educación).`,
    ],
    callAfter: (c) => [
      `**Manifestaciones:** CCOO de Catalunya anuncia manifestaciones el 11 de noviembre «en les principals capitals de província» (en las principales capitales de provincia) y dice que las irá anunciando en sus canales; la UGT de Catalunya resume el plan así: por la mañana, vaciar las empresas, y por la tarde, llenar las calles. El ${c.checked} ninguno de los convocantes había publicado la hora ni el lugar.`,
    ],
    hoursHeading: "Horario: a qué hora empieza y acaba",
    hours: [
      `La huelga empieza a las 0 h del 11 de noviembre y dura 24 horas. Según ${link(U.ccooCatalunya, "CCOO de Catalunya")}, se convoca para todo el día y en todas las actividades.`,
      "Donde se trabaja por turnos, la huelga empieza con el primer turno, aunque comience antes de las 0 h, y acaba con el último, aunque termine después.",
      "Según CCOO de Catalunya, solo las administraciones y las empresas que realizan actividades esenciales para la comunidad pueden tener servicios mínimos.",
    ],
    rightsHeading: "Derechos de quien hace huelga (y de quien no): qué dice la ley",
    rightsIntro: `El derecho de huelga lo reconoce ${link(U.constitution, "el artículo 28.2 de la Constitución")}: «Se reconoce el derecho a la huelga de los trabajadores para la defensa de sus intereses». El artículo 6 del ${link(U.rdl17, "Real Decreto-ley 17/1977")} fija sus efectos:`,
    rights: [
      "**No te pueden despedir ni sancionar por hacer huelga** (artículo 6.1), salvo que durante la huelga cometas una falta laboral.",
      `**Ese día no cobras:** «Durante la huelga se entenderá suspendido el contrato de trabajo y el trabajador no tendrá derecho al salario» (artículo 6.2). Según el ${link(U.treballFaq, "Departament d'Empresa i Treball")}, la empresa lo descuenta de la nómina siguiente, con el salario base, los complementos salariales y las partes proporcionales de las pagas extraordinarias.`,
      "**Seguridad Social:** quedas en situación de alta especial, y ni tú ni la empresa cotizáis ese día (artículo 6.3).",
      "**Quien no quiera hacer huelga puede trabajar:** la ley respeta «la libertad de trabajo» de quien no quiera sumarse (artículo 6.4).",
      "**La empresa no te puede sustituir** por personas que no trabajaban en ella cuando se comunicó la huelga (artículo 6.5).",
      "**No hace falta avisar a la empresa:** la normativa del derecho de huelga no obliga a la persona trabajadora a avisar antes, según el Departament d'Empresa i Treball, y UGT lo dice así: «No tienes obligación de comunicar previamente a tu empresa que vas a secundar una huelga legal». El preaviso lo dan los sindicatos que convocan: cinco días naturales, o diez si la huelga afecta a servicios públicos (artículos 3 y 4 del Real Decreto-ley 17/1977).",
      `**Si la empresa te designa para los servicios mínimos, tienes que ir,** recuerda CCOO de Catalunya. En la última huelga general, el artículo 2 de la ${link(U.emt201, "Ordre EMT/201/2024")} decía que la empresa designa a esas personas tras escuchar al comité de huelga, preferentemente entre las que no hacen huelga, y que se lo debe comunicar de forma formal.`,
    ],
    faq: (c) => {
      const pendingCheck = `aún no se han publicado (consultado el ${c.checked})`;
      return [
        {
          question: "¿Qué funciona el 11 de noviembre?",
          answer:
            c.state === "pending"
              ? `Los servicios esenciales funcionan con servicios mínimos: transporte público, colegios, hospitales, farmacias de guardia y servicios de emergencia. Los porcentajes ${pendingCheck}: los fijará la Generalitat por orden en el DOGC, y el Gobierno de España para la alta velocidad y la larga distancia. Los pondremos en esta página en cuanto salgan.`
              : "Los servicios esenciales funcionan con los servicios mínimos publicados, que están en la tabla de esta página sector por sector: Rodalies, metro y bus, FGC y tranvía, trenes de larga distancia, vuelos, colegios y sanidad.",
        },
        {
          question: "¿Hay colegio el 11N?",
          answer: "Sí. El 11 de noviembre es día lectivo en el calendario escolar 2026-2027 y una huelga no lo cambia: los colegios abren con el personal mínimo que fija la orden de servicios mínimos, y cada colegio informa a las familias de lo que puede garantizar. Algunos docentes pueden hacer huelga: USTEC·STEs llama a todo el personal educativo a hacerla.",
        },
        {
          question: "¿Hay metro el 11 de noviembre?",
          answer: sectorAnswer(c, "tmb", `Sí, con servicios mínimos, que fijará la Generalitat y que ${pendingCheck}. En la huelga general del 27 de septiembre de 2024 fueron el 85% del servicio, pero la orden del 11 de noviembre puede fijar otros.`),
        },
        {
          question: "¿Hay Rodalies el 11 de noviembre?",
          answer: `${sectorAnswer(c, "rodalies", `Sí, con servicios mínimos, que fijará la Generalitat y que ${pendingCheck}. Rodalies publica el horario de servicios mínimos de cada línea en su web cuando sale la orden.`)} Además, el 10 y el 12 de noviembre hay huelga de maquinistas del Grupo Renfe convocada por SEMAF.`,
        },
        {
          question: "¿A qué hora empieza la huelga general?",
          answer: "A las 0 h del 11 de noviembre, y dura 24 horas. Donde se trabaja por turnos, empieza con el primer turno aunque comience antes de medianoche y acaba con el último aunque termine después, según CCOO de Catalunya.",
        },
        {
          question: "¿Tengo que avisar a la empresa si hago huelga?",
          answer: "No. Según el Departament d'Empresa i Treball, la normativa no obliga a la persona trabajadora a avisar antes. Si la empresa te designa formalmente para los servicios mínimos, sí tienes que ir a trabajar.",
        },
        {
          question: "¿Me descuentan el sueldo si hago huelga?",
          answer: "Sí. Durante la huelga el contrato queda suspendido y no tienes derecho al salario (artículo 6.2 del Real Decreto-ley 17/1977). La empresa descuenta las horas no trabajadas de la nómina siguiente, con la parte proporcional de las pagas extraordinarias, y ese día ni tú ni la empresa cotizáis a la Seguridad Social.",
        },
        {
          question: "¿Cuándo se publican los servicios mínimos del 11N?",
          answer:
            c.state === "pending"
              ? `Pocos días antes: en las huelgas generales de 2024, la orden de la Generalitat se firmó dos o tres días antes y el DOGC la publicó entre dos días antes y el mismo día de la huelga. El ${c.checked} aún no estaba.`
              : "Ya se han publicado: están en la tabla de esta página, con el enlace a la orden o al aviso oficial de cada sector.",
        },
      ];
    },
  },
  en: {
    lead: (c) => {
      const who = "it was called by the CCOO and UGT unions, with CGT, CNT and other organisations, and covers every activity, public and private";
      if (c.phase === "past") {
        return `**There was a 24-hour general strike across Spain, Catalonia included, on ${c.day},** called by CCOO and UGT with CGT, CNT and other organisations. The table below shows the minimum services set for each sector.`;
      }
      const first =
        c.phase === "today"
          ? `**Today, ${c.day}, there is a 24-hour general strike across Spain, Barcelona and Catalonia included:** it began at midnight; ${who}.`
          : `**On ${c.day} there is a 24-hour general strike across Spain, Barcelona and Catalonia included:** it starts at midnight (00:00); ${who}.`;
      const ms = {
        pending: ` **Minimum services have not been published yet** (checked on ${c.checked}): the Generalitat sets them in an order in the DOGC, its official gazette, a few days before, and we will add them here, sector by sector, as soon as they are out.`,
        partial: ` **Some minimum services have been published and others not yet** (checked on ${c.checked}): the table below shows which.`,
        published: " **Minimum services have been published:** they are in the table below, sector by sector, with a link to the official order or notice.",
      }[c.state];
      return `${first}${ms} **Watch 10 and 12 November too:** the train drivers' union SEMAF has called strikes at the Renfe Group (a full stoppage on the 10th, partial stoppages on the 12th), which affect Rodalies.`;
    },
    keyFactsTitle: "The 11 November general strike at a glance",
    keyFacts: (c) => [
      { label: "Day", value: c.day },
      { label: "Hours", value: "24 hours from 00:00. Where people work shifts, from the first shift to the last" },
      { label: "Called by", value: "CCOO and UGT, with CGT, CNT and other organisations. In Catalonia, CCOO de Catalunya, UGT de Catalunya and CGT Catalunya; in education, the teachers' union USTEC·STEs too" },
      { label: "Who is called out", value: "All workers, employed or self-employed, public and private" },
      {
        label: "Minimum services",
        value: {
          pending: `Not published yet (checked on ${c.checked}). The Generalitat sets them in the DOGC; the Spanish government for long-distance trains`,
          partial: `Partly published (checked on ${c.checked}): see the table by sector`,
          published: "Published: see the table by sector",
        }[c.state],
      },
      { label: "Schools", value: "A school day: schools open with the minimum staff the minimum-services order sets" },
      { label: "10 and 12 November", value: "Renfe Group train drivers' strike (SEMAF), which affects Rodalies: a full stoppage on the 10th, partial stoppages on the 12th" },
    ],
    data: (c) =>
      `We only print what the unions calling the strike, the BOE and DOGC gazettes, the Generalitat's Department of Business and Labour and the transport operators publish, never what the press reports ahead of them.${c.state === "published" ? "" : " When minimum services come out, we will add them to the table, sector by sector, with a link to the order."}`,
    msHeading: "Minimum services on 11 November: what runs",
    msIntro: (c) =>
      c.state === "pending"
        ? [
            `**Not published yet.** On ${c.checked}, the ${link(U.treballMs, "Department of Business and Labour's list of strikes with minimum services")} had no order for 11 November, and Rodalies, TMB and FGC had no notice about it. Once out, the order will also be published in the ${link(U.dogc, "DOGC")}.`,
            `For services that answer to the Generalitat (Rodalies and regional trains, metro, buses, tram, FGC, schools, public healthcare and the Catalan administration itself), the Department of Business and Labour will set them in an order published in the DOGC. For State services such as high-speed and long-distance trains, the Spanish government sets them.`,
            `**When they come out:** in the 2024 general strikes the order was signed two or three days before. ${link(U.emt38, "Order EMT/38/2024")} was signed on 5 March for the strike on the 8th and published in the DOGC on the 6th; ${link(U.emt201, "Order EMT/201/2024")} was signed on 25 September for the strike on the 27th and published in the DOGC on the 27th itself. If that timing repeats, the 11 November order would be signed around 8 or 9 November, but there is no official date.`,
          ]
        : [
            `Here is what the Generalitat's order and the operators' notices set, sector by sector, as they stood on ${c.checked}. If in doubt, the official text linked in each row is what counts.`,
          ],
    willListTitle: "This page will list them as soon as they are out",
    willList: "Once they are published, we will add what the order sets for each service, with a link to the DOGC or to the operator's notice. Until then, the official sources are in the right-hand column of the table.",
    tableCaption: "Minimum services on 11 November: who sets them and where to check",
    tableHeaders: ["Service", "Who sets them", "Minimum services", "Where to check"],
    notPublished: "Not published yet",
    tableNote: (c) => `Checked on ${c.checked}. The Generalitat's orders also cover all other urban and interurban buses, including the airport bus.`,
    refHeading: "What the last general strike's order set (2024), for reference only",
    ref: "For the general strike of 27 September 2024, Order EMT/201/2024 set **85% of normal service** on Rodalies and regional trains, the metro, TMB buses, FGC, the tram and all other urban and interurban transport, including the bus between Barcelona and the airport, and let operators spread that percentage unevenly over the day.",
    refWarningTitle: "This is not a forecast for 11 November",
    refWarning: "That strike was called by CGT and Solidaridad Obrera, and the order justified its percentages partly because it had not been called by \"altres associacions sindicals que disposen de més àmplia representativitat en el teixit laboral català\" (other unions with wider representation among Catalan workers). The 11 November strike is called by CCOO and UGT, so the order may set different percentages.",
    sectors: {
      rodalies: {
        name: "Rodalies and regional trains",
        setBy: "Generalitat (order in the DOGC)",
        setter: "The Generalitat's order in the DOGC will set them.",
        where: `${link(U.rodaliesStatus, "rodalies.gencat.cat")}, with a timetable per line; on the day, [your line's notices](${rodaliesHub("en")})`,
      },
      tmb: {
        name: "TMB metro and buses",
        setBy: "Generalitat (order in the DOGC)",
        setter: "The Generalitat's order in the DOGC will set them.",
        where: `${link(U.tmb, "tmb.cat")}, service notices`,
      },
      fgcTram: {
        name: "FGC and tram",
        setBy: "Generalitat (order in the DOGC)",
        setter: "The Generalitat's order in the DOGC will set them.",
        where: link(U.fgc, "fgc.cat"),
      },
      longDistance: {
        name: "High-speed and long-distance trains (Renfe, Ouigo)",
        setBy: "Spanish government",
        setter: "The Spanish government sets them, not the Generalitat.",
        where: `${link(U.renfe, "renfe.com")} and ${link(U.ouigo, "ouigo.com")}`,
      },
      airports: {
        name: "Flights at Barcelona-El Prat, Girona and Reus",
        setBy: "Not the Generalitat: Aena's operations are not in its orders",
        setter: "Aena and the airlines inform passengers about flights.",
        where: `${link(U.aena, "Aena's Infovuelos")} and your airline`,
      },
      schools: {
        name: "Schools and nurseries",
        setBy: "Generalitat (order in the DOGC)",
        setter: "The Generalitat's order in the DOGC will set them.",
        where: "Your school tells families",
      },
      health: {
        name: "Hospitals, health centres and duty pharmacies",
        setBy: "Generalitat (order in the DOGC)",
        setter: "The Generalitat's order in the DOGC will set them.",
        where: "Your health centre or hospital",
      },
    },
    msLine: (c, key) => {
      const s = slot(c.slots, key);
      return s.status === "published" && s.text
        ? `**Minimum services:** ${s.text.en}`
        : `**Minimum services:** not published yet (checked on ${c.checked}). ${COPY.en.sectors[key].setter}`;
    },
    transportHeading: "Transport: Rodalies, metro, buses, FGC, trains and flights",
    transportIntro: "A general strike can hit every operator at once, and each publishes its minimum-service timetables once the order is out. Check them the evening before and that morning: the orders let operators spread the percentage unevenly over the day, so not every train or bus at your usual time will run.",
    more: {
      rodalies: `Rodalies publishes a minimum-service timetable for every line on its ${link(U.rodaliesStatus, "service changes page")}: for the Renfe strike of 29 October 2026, the notice with the percentages had been updated by the 26th. On the strike day, check [today's notices for your line](${rodaliesHub("en")}), read live from Rodalies de Catalunya. **Renfe has strikes the day before and the day after too:** the train drivers' union SEMAF has called a full stoppage on Tuesday 10 November and partial stoppages during Thursday 12 November, according to ${link(U.semaf1012, "its notice of 29 October")}, with no hours or minimum services published yet.`,
      tmb: `TMB publishes them in its ${link(U.tmb, "service notices")}. Normal-day hours are in ${b2link("hours", "en", "Barcelona metro and night bus hours")}.`,
      fgcTram: `FGC posts its service status on ${link(U.fgc, "fgc.cat")}. The 2024 general-strike orders also covered the tram and all other urban and interurban buses.`,
      longDistance: `High-speed and long-distance trains are State services, so they are not in the Generalitat's order: for Ouigo's strike this autumn, the Ministry of Transport set the minimum services in ${link(U.ouigoResolution, "a resolution of 27 October")}. If you have a ticket for the 11th, check ${link(U.renfe, "renfe.com")} or your operator's website; SEMAF's drivers' strike on 10 and 12 November also affects Renfe trains.`,
      airports: `The Generalitat's orders only set the operations of the two airports it runs, Lleida-Alguaire and Andorra-La Seu d'Urgell. For flights at Barcelona-El Prat, Girona and Reus, which Aena runs, check your flight with your airline or on ${link(U.aena, "Aena's Infovuelos")}, and the ways to get there in ${b2link("airport", "en", "our airport to city centre guide")}.`,
    },
    taxiHeading: "Taxis",
    taxi: "The minimum-services orders for the 2024 general strikes (EMT/38/2024 and EMT/201/2024) did not mention taxis.",
    schoolsHeading: "Is there school on 11 November?",
    schools: (c) => {
      const s = schoolSpan("en");
      return [
        `**Yes, it is a school day.** The 2026-2027 school year runs from ${s.start} to ${s.end}, with the Christmas holidays starting on ${s.christmas}, under ${link(U.schoolOrder, "Order EDF/66/2026")}, and 11 November is not one of Catalonia's public holidays. A strike does not change the school calendar: schools open with the minimum staff the minimum-services order sets, and each school tells families what it can provide that day. Also check your school's own free days and any local holiday: ${link(`/en/${TOOL_PATHS.school.en}/`, "Catalonia school calendar 2026-2027")}.`,
        `**Who strikes in education:** the teachers' union USTEC·STEs has ratified the general strike and calls all education staff out ("Cridem tot el personal educatiu a fer vaga"). ${c.phase === "past" ? "" : "So some teachers and other school staff may be absent."}`.trim(),
        slot(c.slots, "schools").status === "published" && slot(c.slots, "schools").text
          ? `**Minimum services in schools:** ${slot(c.slots, "schools").text!.en}`
          : "**What the last general strike's order set, for reference only:** for the strike of 27 September 2024, Order EMT/201/2024 required one member of each school's management team plus two teachers for every four classes in nursery and primary and one for every three in secondary; in 2024 it also set 50% of staff in special education, nurseries and lunchtime cover, and kept school buses running to nursery and primary schools with no public transport alternative. In that order's words, pupils must get \"un servei de vigilància i atenció\" (supervision and care). The 11 November order may set different levels.",
      ];
    },
    healthHeading: "Health: hospitals, health centres and pharmacies",
    health: (c) => {
      const s = slot(c.slots, "health");
      return [
        s.status === "published" && s.text
          ? `**Minimum services:** ${s.text.en}`
          : `**Minimum services:** not published yet (checked on ${c.checked}). The same Generalitat order will set them; in the 2024 general strike it covered both public and private health centres.`,
        "**What the last general strike's order set, for reference only:** for the strike of 27 September 2024, Order EMT/201/2024 kept hospital A&E and the special units (intensive care, dialysis, maternity, radiotherapy and chemotherapy) running normally, urgent care at health centres outside hospitals during their usual hours, urgent patient transport and the duty pharmacies.",
        ...(c.phase === "past"
          ? []
          : [
              `**Doctors are already on strike:** since 28 October 2026 the doctors' union Metges de Catalunya has held an indefinite strike of medical staff, still on as of ${c.checked}. ${link(U.ordreMetges, "The Department of Business and Labour's order of 22 October")} keeps A&E and the special units running normally. Details in ${b2link("strikes", "en", "our guide to strikes in Barcelona and Catalonia")}.`,
            ]),
      ];
    },
    callHeading: "Who called the general strike and why",
    callIntro: `It is a nationwide general strike. CCOO said on 19 October 2026 that it "ya está registrada" (has been registered) and presented it to the press that day at the Ministry of Labour, with UGT, CGT, CNT, Confederación Intersindical, CO.BAS, the Sindicato de Inquilinas tenants' union and the actors' union Unión de Actores y Actrices. In Catalonia it is called by CCOO de Catalunya, UGT de Catalunya and CGT Catalunya. Their demands, in each organisation's words:`,
    demands: [
      `**CCOO and UGT** (${link(U.ccooCall, "call of 7 October")}): they call the strike "para desbloquear la negociación colectiva" (to unblock collective bargaining), to raise wages, cut working hours, improve workers' health and end job precariousness, and to push all administrations towards policies that end housing speculation.`,
      `**UGT** (${link(U.ugt, "ugt.es")}): "Reclamamos una subida del SMI de, al menos, un 7% en 2027" (a rise in the minimum wage of at least 7% in 2027).`,
      `**CCOO de Catalunya** (${link(U.ccooCatalunya, "11n.cat")}): a strike for affordable housing, higher wages, a cheaper cost of living, quality public services, workers' health and the public pension system.`,
      `**UGT de Catalunya** (${link(U.ugtCatalunya, "ugt.cat")}): "Que l'habitatge no es mengi el teu salari" (don't let housing eat your wages); it wants to recover purchasing power, raise wages and unblock collective bargaining.`,
      `**CGT Catalunya** (${link(U.cgtCatalunya, "9 October")}): seven demands, including lower housing prices, a 35-hour working week with no loss of pay, and a minimum wage and minimum pension of €1,500.`,
      `**USTEC·STEs** (${link(U.ustec, "9 October")}): ratified the strike in education under the slogan "sense casa, no hi ha educació" (no home, no education).`,
    ],
    callAfter: (c) => [
      `**Demonstrations:** CCOO de Catalunya says there will be demonstrations on 11 November "en les principals capitals de província" (in the main provincial capitals) and that it will announce them on its channels; UGT de Catalunya sums up the plan as emptying workplaces in the morning and filling the streets in the afternoon. On ${c.checked} none of the organisers had published times or places.`,
    ],
    hoursHeading: "Hours: when it starts and ends",
    hours: [
      `The strike starts at 00:00 on 11 November and lasts 24 hours. According to ${link(U.ccooCatalunya, "CCOO de Catalunya")}, it is called for the whole day and every activity.`,
      "Where people work shifts, the strike starts with the first shift, even if that begins before midnight, and ends with the last one, even if that ends after midnight.",
      "According to CCOO de Catalunya, only public administrations and companies carrying out activities essential to the community can have minimum services.",
    ],
    rightsHeading: "Rights of those who strike (and those who don't): what the law says",
    rightsIntro: `The right to strike is recognised by ${link(U.constitution, "Article 28.2 of the Spanish Constitution")}: "Se reconoce el derecho a la huelga de los trabajadores para la defensa de sus intereses" (workers' right to strike in defence of their interests is recognised). Article 6 of ${link(U.rdl17, "Royal Decree-Law 17/1977")} sets out its effects:`,
    rights: [
      "**You cannot be dismissed or disciplined for striking** (Article 6.1), unless you commit a disciplinary offence during the strike.",
      `**You are not paid for the day:** "Durante la huelga se entenderá suspendido el contrato de trabajo y el trabajador no tendrá derecho al salario" (during the strike the employment contract is suspended and the worker is not entitled to pay; Article 6.2). According to the ${link(U.treballFaq, "Generalitat's Department of Business and Labour")}, the employer deducts it from the next payslip: base pay, pay supplements and the proportional part of the extra payments.`,
      "**Social Security:** you stay registered under a special status, and neither you nor your employer pays contributions for that day (Article 6.3).",
      "**Those who do not want to strike can work:** the law protects the freedom to work of anyone who does not join (Article 6.4).",
      "**Your employer cannot replace you** with people who were not working there when the strike was notified (Article 6.5).",
      "**You do not have to tell your employer:** according to the Department of Business and Labour, the rules on strikes do not require individual workers to give notice. Notice is given by the unions calling the strike: five calendar days, or ten if public services are affected (Articles 3 and 4 of Royal Decree-Law 17/1977).",
      `**If your employer formally assigns you to minimum services, you have to work,** as CCOO de Catalunya reminds members. In the last general strike, Article 2 of ${link(U.emt201, "Order EMT/201/2024")} said employers name those staff after hearing the strike committee, preferably among people who are not striking, and must notify them formally.`,
    ],
    faq: (c) => {
      const pendingCheck = `have not been published yet (checked on ${c.checked})`;
      return [
        {
          question: "What runs on 11 November?",
          answer:
            c.state === "pending"
              ? `Essential services run on minimum services: public transport, schools, hospitals, duty pharmacies and emergency services. The percentages ${pendingCheck}: the Generalitat will set them in an order in the DOGC, and the Spanish government for high-speed and long-distance trains. We will add them to this page as soon as they are out.`
              : "Essential services run on the published minimum services, listed sector by sector in the table on this page: Rodalies, metro and buses, FGC and tram, long-distance trains, flights, schools and health.",
        },
        {
          question: "Is there school on 11 November?",
          answer: "Yes. 11 November is a school day in the 2026-2027 calendar and a strike does not change that: schools open with the minimum staff the minimum-services order sets, and each school tells families what it can provide. Some teachers may strike: the teachers' union USTEC·STEs is calling all education staff out.",
        },
        {
          question: "Is the Barcelona metro running on 11 November?",
          answer: sectorAnswer(c, "tmb", `Yes, on minimum services, which the Generalitat will set and which ${pendingCheck}. In the general strike of 27 September 2024 they were 85% of normal service, but the 11 November order may set a different level.`),
        },
        {
          question: "Are Rodalies trains running on 11 November?",
          answer: `${sectorAnswer(c, "rodalies", `Yes, on minimum services, which the Generalitat will set and which ${pendingCheck}. Rodalies publishes a minimum-service timetable for each line on its website once the order is out.`)} On top of that, SEMAF has called a Renfe Group drivers' strike on 10 and 12 November.`,
        },
        {
          question: "What time does the general strike start?",
          answer: "At 00:00 on 11 November, for 24 hours. Where people work shifts, it starts with the first shift even if that begins before midnight, and ends with the last one even if that ends after, according to CCOO de Catalunya.",
        },
        {
          question: "Do I have to tell my employer if I strike?",
          answer: "No. According to the Generalitat's Department of Business and Labour, the rules do not require individual workers to give notice. If your employer formally assigns you to minimum services, you do have to work.",
        },
        {
          question: "Will my pay be docked if I strike?",
          answer: "Yes. During the strike the contract is suspended and you are not entitled to pay (Article 6.2 of Royal Decree-Law 17/1977). The employer deducts the hours not worked from the next payslip, including the proportional part of the extra payments, and neither you nor your employer pays Social Security contributions for that day.",
        },
        {
          question: "When will the 11 November minimum services be published?",
          answer:
            c.state === "pending"
              ? `A few days before: in the 2024 general strikes the Generalitat's order was signed two or three days before, and the DOGC published it between two days before and the day of the strike itself. On ${c.checked} it was not out yet.`
              : "They are out: see the table on this page, with a link to the official order or notice for each sector.",
        },
      ];
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["strikes", "hours", "airport", "transport"] as const;
const SECTOR_ORDER: SectorKey[] = ["rodalies", "tmb", "fgcTram", "longDistance", "airports", "schools", "health"];
const TRANSPORT: ("rodalies" | "tmb" | "fgcTram" | "longDistance" | "airports")[] = ["rodalies", "tmb", "fgcTram", "longDistance", "airports"];

function heading(level: 2 | 3, text: string, id?: string): Block {
  return { type: "heading", level, text, ...(id ? { id } : {}) } as Block;
}

export function buildStrike11nBody(
  locale: Locale,
  asOf: string = STRIKE_11N_AS_OF,
  slots: SectorMinimumServices[] = MINIMUM_SERVICES_11N,
): Block[] {
  const t = COPY[locale];
  const c: Ctx = {
    locale,
    day: dayDate(STRIKE_11N_DATE, locale),
    checked: dateYear(asOf, locale),
    phase: strikePhase(asOf),
    state: msState(slots),
    slots,
  };

  const blocks: Block[] = [];
  blocks.push(lead(t.lead(c)));
  blocks.push(keyFacts(t.keyFactsTitle, t.keyFacts(c)));
  blocks.push(callout("official", verifiedLine(locale, asOf), t.data(c)));

  // Minimum services: the answer most readers came for, first.
  blocks.push(heading(2, t.msHeading, "serveis-minims"));
  blocks.push(...paras(...t.msIntro(c)));
  if (c.state !== "published") blocks.push(callout("info", t.willListTitle, t.willList));
  blocks.push(
    table(
      t.tableCaption,
      t.tableHeaders,
      SECTOR_ORDER.map((key) => {
        const s = slot(slots, key);
        const sector = t.sectors[key];
        return [sector.name, sector.setBy, s.status === "published" && s.text ? s.text[locale] : t.notPublished, sector.where];
      }),
      t.tableNote(c),
    ),
  );
  if (!generalitatOrderPublished(slots)) {
    blocks.push(...h3(t.refHeading, t.ref));
    blocks.push(callout("warning", t.refWarningTitle, t.refWarning));
  }

  // Transport, sector by sector.
  blocks.push(...h2(t.transportHeading, t.transportIntro));
  for (const key of TRANSPORT) {
    blocks.push(heading(3, t.sectors[key].name));
    blocks.push(...paras(t.msLine(c, key), t.more[key]));
  }
  blocks.push(...h3(t.taxiHeading, t.taxi));

  blocks.push(heading(2, t.schoolsHeading, "escoles"));
  blocks.push(...paras(...t.schools(c)));
  // The 2024 reference is dropped once this year's figures are in.
  const health = t.health(c);
  blocks.push(...h2(t.healthHeading, ...(slot(slots, "health").status === "published" ? health.slice(0, 1) : health)));

  blocks.push(...h2(t.callHeading, t.callIntro));
  blocks.push(list(...t.demands));
  blocks.push(...paras(...t.callAfter(c)));

  blocks.push(...h2(t.hoursHeading, ...t.hours));

  blocks.push(...h2(t.rightsHeading, t.rightsIntro));
  blocks.push(list(...t.rights));

  blocks.push(faq(t.faq(c).map((item) => ({ question: item.question, answer: strip(item.answer) }))));
  blocks.push(...paras(verifiedLine(locale, STRIKE_11N_VERIFIED)));
  blocks.push(...b2Related([...RELATED], locale));
  return blocks;
}

/* -------------------------------------------------------------------------- */
/* Article                                                                    */
/* -------------------------------------------------------------------------- */

export const STRIKE_11N: B2Article = {
  key: "strike11n",
  entryKey: "guide-general-strike-11-november-2026",
  categoryKey: "public-services",
  sources: strike11nSources(),
  // No new photograph: the Rodalies trains of the trains feature (also the
  // strikes hub's hero), with that feature's exact alt text and caption, since
  // media rows are keyed by file and other wording would overwrite them.
  heroKey: TRAINS.heroKey,
  heroAlt: TRAINS.heroAlt,
  heroCaption: TRAINS.heroCaption,
  verifiedAt: STRIKE_11N_VERIFIED,
  publishedAt: "2026-10-29T20:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [
      locale,
      { ...STRIKE_11N_META[locale], seoDescription: strike11nDescription(locale), blocks: buildStrike11nBody(locale) },
    ]),
  ) as B2Article["editions"],
};
