/**
 * The page model: every string and table cell a municipality page shows,
 * built from the snapshot. Pure and deterministic (no clock), so the tests
 * read exactly what the reader reads.
 *
 * Copy rules: neutral; no polls, projections or commentary on parties; the
 * only judgement is arithmetic printed with its rule (the 5 % threshold, the
 * D'Hondt quotients). Text fields marked `md` go through the site's inline
 * formatter (bold and links in our own copy); everything else, including every
 * name taken from the source, is plain text.
 */

import { B2_TITLES, b2href, type B2Key } from "@/lib/content/batch02/shared";
import { shortDate } from "@/lib/content/holidays/calendar";
import { joinList } from "@/lib/programmatic/holidays/names";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";

import { caOfComarca, comarcaOf, comarcaPath, electionPath, hubPath, inCa, isComarcaLocale, latestDataDate, ofCa, PAGES_PER_LOCALE, placeName, siblings } from "./pages";
import {
  councilSize,
  councilSystem,
  electedCount,
  generalView,
  leadingLists,
  matchDhondt,
  municipalView,
  regionalView,
  SMALLEST_STEP,
  turnout,
  type GeneralView,
  type MunicipalView,
  type RegionalView,
} from "./results";
import { SNAPSHOT } from "./snapshot";
import type { DayLines } from "./today";
import type { ElectionsSnapshot, General2026, Municipality, RegionalVotes } from "./types";

/** Interior's results download area, where the per-municipality files appear. */
export const INTERIOR_DOWNLOADS: Record<Locale, string> = {
  ca: "https://infoelectoral.interior.gob.es/ca/elecciones-celebradas/area-de-descargas/",
  es: "https://infoelectoral.interior.gob.es/es/elecciones-celebradas/area-de-descargas/",
  en: "https://infoelectoral.interior.gob.es/en/elecciones-celebradas/area-de-descargas/",
};

/**
 * The official election-night results site. Null until the Interior Ministry
 * announces it: never guessed, never scraped. Checked 27 and 29 Oct 2026 on
 * infoelectoral.interior.gob.es and 29neleccionesgenerales.es (no results
 * section, no announcement). Interior's note of 21 Oct 2026 ("Dispositivo de
 * recepción de resultados provisionales...") is not one: it describes a data
 * repository for accredited media only, whose address the media receive by
 * email on 17 Nov. It names no public website.
 */
export const ELECTION_NIGHT_RESULTS_URL: string | null = null;

/** The date the Interior pages above were last checked. */
export const INTERIOR_CHECKED = "2026-10-29";

export const LOREG_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672";
export const RD_806_2026_URL = "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742";

/** Fourth Sunday of May 2027 (LOREG art. 42.3); the call decree is due 55 days before. */
export const NEXT_MUNICIPAL = { day: "2027-05-23", decree: "2027-03-29", published: "2027-03-30" };

export interface Table {
  caption: string;
  headers: string[];
  rows: string[][];
  /** Rows styled as totals (blank votes, other lists). */
  footRows: string[][];
  note: string;
}

export interface Link {
  href: string;
  label: string;
}

/**
 * The 29N results in the slot, once the Interior Ministry's file is imported
 * (`scripts/elections-29n.ts`; the steps for the day are in its header).
 * Plain text: names are printed exactly as the file writes them.
 */
export interface SlotResults {
  summary: string;
  table: Table;
}

export interface ElectionPageModel {
  locale: Locale;
  h1: string;
  standfirst: string;
  /** ISO date of the newest data on the page: the read date, or the 29N import if later. */
  dataDate: string;
  readLine: string;
  facts: { label: string; value: string }[];
  slot: {
    title: string;
    lines: DayLines;
    md: string[];
    /** Null until the official file is imported: the slot then says when results will appear. */
    results: SlotResults | null;
  };
  municipal: { title: string; summary: string; table: Table; mayor: string | null; mayorRule: string };
  seats: { title: string; md: string[] };
  congress: { title: string; summary: string; table: Table };
  parliament: { title: string; summary: string; table: Table };
  turnout: { title: string; table: Table };
  census: { title: string; md: string[] };
  next: { title: string; md: string[] };
  faqTitle: string;
  faq: { question: string; answer: string }[];
  /** `comarca`: the comarca page, every town's 2023 result in a table (Catalan and Spanish only). */
  siblings: { title: string; groups: { label: string; links: Link[] }[]; hub: Link; comarca: Link | null };
  related: { title: string; links: Link[] };
  sources: { title: string; note: string; items: { name: string; publisher: string; url: string; updated: string }[] };
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function formats(locale: Locale) {
  const intl = INTL_LOCALE[locale];
  const whole = new Intl.NumberFormat(intl, { maximumFractionDigits: 0 });
  const one = new Intl.NumberFormat(intl, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const upToOne = new Intl.NumberFormat(intl, { maximumFractionDigits: 1 });
  return {
    n: (value: number) => whole.format(value),
    p: (value: number) => (locale === "en" ? `${one.format(value)}%` : `${one.format(value)} %`),
    q: (value: number) => upToOne.format(value),
    date: (iso: string) => longDate(iso, locale),
  };
}

export function longDate(iso: string, locale: Locale): string {
  const year = iso.slice(0, 4);
  return locale === "en" ? `${shortDate(iso, locale)} ${year}` : `${shortDate(iso, locale)} de ${year}`;
}

/** Catalan apostrophises the article before "1" and "11" (u, onze): "l'1 d'octubre", "el 17 de juny". */
const caApostrophe = (iso: string) => ["01", "11"].includes(iso.slice(8, 10));
export const caEl = (iso: string) => `${caApostrophe(iso) ? "l'" : "el "}${longDate(iso, "ca")}`;
export const caDel = (iso: string) => `${caApostrophe(iso) ? "de l'" : "del "}${longDate(iso, "ca")}`;

/** The same rule for a printed percentage: "l'11,2 %", "de l'1,5 %", "el 21,0 %". */
const caElides = (formatted: string) => /^(1|11)(,|\s|$)/.test(formatted);
export const caElPct = (formatted: string) => `${caElides(formatted) ? "l'" : "el "}${formatted}`;
export const caDelPct = (formatted: string) => `${caElides(formatted) ? "de l'" : "del "}${formatted}`;

const ORDINAL_CA = (n: number) => (n === 1 ? "1r" : n === 2 ? "2n" : n === 3 ? "3r" : n === 4 ? "4t" : `${n}è`);
/** "L'11è" (onzè), "El 13è": councils of 11 appear from 2,001 residents (tranche 2). */
export const caTheOrdinal = (n: number) => `${n === 1 || n === 11 ? "L'" : "El "}${ORDINAL_CA(n)}`;
const ORDINAL_ES = (n: number) => `${n}.º`;
const ORDINAL_EN = (n: number) => {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
};

/* -------------------------------------------------------------------------- */
/* Builder                                                                    */
/* -------------------------------------------------------------------------- */

const RELATED: B2Key[] = ["electionNight", "voting", "candidates", "municipalResults", "congressResults", "parliamentResults"];

/* -------------------------------------------------------------------------- */
/* Small councils: open lists (LOREG 184) and concejo abierto (179.2)         */
/* -------------------------------------------------------------------------- */

/**
 * The parts of the page that change for a council not elected by D'Hondt
 * (`councilSystem`): the council fact, the 2023 summary and table, the
 * mayor rule, the "how" section and the first two questions. Everything else
 * on the page is the same for every town.
 *
 *  - Open lists: votes go to candidates, so a list's figure in the source is
 *    not a count of ballots (the figures do not add up to the ballots cast
 *    for candidacies, and can exceed them). The table prints it as the
 *    source's figure, with councillors, and no percentage, no threshold and
 *    no quotient; the leading list is the one with most councillors.
 *  - Concejo abierto: one post, the mayoralty, by majority; each voter casts
 *    one vote, so shares of valid votes hold and are printed.
 */
interface SmallCouncilCopy {
  fact: { label: string; value: string };
  summary: string;
  table: Table;
  mayorRule: string;
  seats: { title: string; md: string[] };
  faq: { question: string; answer: string }[];
}

function smallCouncilCopy(m: Municipality, locale: Locale, mv: MunicipalView, cataloniaTurnout: number): SmallCouncilCopy {
  const f = formats(locale);
  const r = m.municipal;
  const place = placeName(m, locale);
  const Place = place.charAt(0).toLocaleUpperCase(locale) + place.slice(1);
  const census = r.censusPopulation;
  const council = councilSystem(r) === "council";
  const elected = electedCount(r);
  const leading = leadingLists(r);
  const lead = leading[0]!;
  const leadRow = mv.rows.find((row) => row.code === lead.code)!;
  const listSum = r.lists.reduce((sum, list) => sum + list.votes, 0);
  const smallest = census <= SMALLEST_STEP;
  const scale = councilSize(census);
  const shorts = joinList(
    leading.map((list) => list.short),
    locale,
  );
  const named = (and: string) => leading.map((list) => `${list.short} (${list.name})`).join(and);

  if (locale === "ca") {
    const a = inCa(place);
    const de = ofCa(place);
    const A = a.charAt(0).toUpperCase() + a.slice(1);
    if (council) {
      return {
        fact: { label: "Règim municipal", value: "consell obert: s'elegeix directament l'alcaldia" },
        summary: `${Place} funciona en règim de consell obert: a les municipals s'elegeix directament l'alcaldia. Van votar ${f.n(r.voters)} persones d'un cens de ${f.n(r.electorate)}: una participació ${caDelPct(f.p(mv.turnout))}, davant ${caDelPct(f.p(cataloniaTurnout))} del conjunt de Catalunya. L'alcaldia la va obtenir ${lead.short}, amb ${f.n(lead.votes)} vots (${caElPct(f.p(leadRow.share))} dels vots vàlids).`,
        table: {
          caption: `Resultats de les eleccions municipals del 2023 ${a}`,
          headers: ["Candidatura", "Vots", "% vots vàlids", "Alcaldia"],
          rows: mv.rows.map((row) => [`${row.short}\n${row.name}`, f.n(row.votes), f.p(row.share), row.seats > 0 ? "Sí" : "No"]),
          footRows: [["Vots en blanc", f.n(r.blankVotes), f.p(mv.blankShare), ""]],
          note: `Vots vàlids: ${f.n(r.validVotes)}, amb els vots en blanc. Vots nuls: ${f.n(r.nullVotes)}, que no compten en els percentatges. Percentatges calculats a partir dels recomptes oficials.`,
        },
        mayorRule: "Al consell obert, els electors elegeixen directament l'alcalde per sistema majoritari (llei electoral, article 179.2).",
        seats: {
          title: "Com es va elegir l'alcaldia",
          md: [
            `Les dades oficials registren un sol càrrec a elegir ${a}, l'alcaldia, i no els ${scale} regidors que l'escala de la llei electoral dona a un municipi de ${f.n(census)} habitants. És el règim de **consell obert**: l'escala no s'hi aplica i els electors elegeixen directament l'alcalde per sistema majoritari ([LOREG, article 179.2](${LOREG_URL})).`,
            `L'alcaldia va ser per a la candidatura més votada, ${lead.short}: ${f.n(lead.votes)} dels ${f.n(r.validVotes)} vots vàlids.`,
          ],
        },
        faq: [
          {
            question: `Quina candidatura va obtenir l'alcaldia a les municipals del 2023 ${a}?`,
            answer: `${lead.short} (${lead.name}), amb ${f.n(lead.votes)} vots, ${caElPct(f.p(leadRow.share))} dels vàlids. ${Place} funciona en consell obert: els electors elegeixen directament l'alcalde.`,
          },
          {
            question: `Quants regidors s'elegeixen ${a}?`,
            answer: `Cap: ${place} funciona en consell obert i a les municipals s'elegeix directament l'alcaldia (llei electoral, article 179.2).`,
          },
        ],
      };
    }
    const most = lead.seats;
    return {
      fact: { label: "Regidors al ple", value: `${r.seats}, amb llistes obertes` },
      summary: `${Place} escull ${r.seats} regidors amb llistes obertes. Van votar ${f.n(r.voters)} persones d'un cens de ${f.n(r.electorate)}: una participació ${caDelPct(f.p(mv.turnout))}, davant ${caDelPct(f.p(cataloniaTurnout))} del conjunt de Catalunya. ${
        leading.length === 1 ? `La candidatura amb més regidors va ser ${lead.short}, amb ${most} dels ${r.seats}.` : `${shorts} van obtenir ${most} ${most === 1 ? "regidor" : "regidors"} cadascuna.`
      }${elected < r.seats ? ` Les dades oficials hi registren ${elected} regidors elegits dels ${r.seats} del ple.` : ""}`,
      table: {
        caption: `Resultats de les eleccions municipals del 2023 ${a}`,
        headers: ["Candidatura", "Vots de la candidatura", "Regidors"],
        rows: r.lists.map((list) => [`${list.short}\n${list.name}`, f.n(list.votes), String(list.seats)]),
        footRows: [],
        note: `Vots en blanc: ${f.n(r.blankVotes)}. Vots nuls: ${f.n(r.nullVotes)}. Aquí es vota a candidats, no a llistes: la xifra de cada candidatura és la que publica la Generalitat i no és un recompte de paperetes${
          listSum !== r.listVotes ? ` (les candidatures sumen ${f.n(listSum)}, i les paperetes amb vot a candidatures van ser ${f.n(r.listVotes)})` : ""
        }, de manera que no en calculem percentatges.`,
      },
      mayorRule: smallest
        ? "L'alcaldia no la decideix directament el vot: els regidors elegeixen l'alcalde en el ple de constitució (llei electoral, article 196)."
        : "L'alcaldia no la decideix directament el vot: els regidors elegeixen l'alcalde en el ple de constitució. Als municipis de 100 a 250 habitants tots els regidors hi poden ser candidats; si cap no obté la majoria absoluta dels regidors, és alcalde el regidor que va obtenir més vots populars (llei electoral, article 196).",
      seats: {
        title: `Com es van elegir els ${r.seats} regidors`,
        md: [
          `Als municipis de fins a 250 habitants es vota amb **llistes obertes** ([LOREG, article 184](${LOREG_URL})): no es reparteixen regidors entre llistes, sinó que surten elegits els candidats amb més vots, siguin de la llista que siguin, fins a completar els ${r.seats} regidors. ${
            smallest
              ? "Fins a 100 residents, cada candidatura presenta com a màxim 3 noms i cada elector en pot marcar fins a 2"
              : "Entre 101 i 250 residents, cada candidatura presenta com a màxim 5 noms i cada elector en pot marcar fins a 4"
          }; els empats es resolen per sorteig. No hi ha llindar del 5 % ni sistema D'Hondt.`,
          `El nombre de regidors depèn de la població: amb ${f.n(census)} habitants al padró de referència d'aquestes eleccions, ${a} li'n corresponen ${r.seats} (LOREG, article 179).`,
          ...(elected < r.seats ? [`Les dades oficials registren ${elected} regidors elegits dels ${r.seats} que corresponen ${a}.`] : []),
        ],
      },
      faq: [
        {
          question: `Quina candidatura va obtenir més regidors a les municipals del 2023 ${a}?`,
          answer:
            leading.length === 1
              ? `${named(" i ")}, amb ${most} dels ${r.seats} regidors. ${A} es vota amb llistes obertes: els regidors són els candidats més votats.`
              : `${named(" i ")}, amb ${most} ${most === 1 ? "regidor" : "regidors"} cadascuna dels ${r.seats}. ${A} es vota amb llistes obertes: els regidors són els candidats més votats.`,
        },
        {
          question: `Quants regidors té l'Ajuntament ${de}?`,
          answer: `${r.seats}, segons l'escala de l'article 179 de la llei electoral aplicada a la població del municipi.${elected < r.seats ? ` Les dades oficials del 2023 hi registren ${elected} regidors elegits.` : ""}`,
        },
      ],
    };
  }

  if (locale === "es") {
    if (council) {
      return {
        fact: { label: "Régimen municipal", value: "concejo abierto: se elige directamente la alcaldía" },
        summary: `${place} funciona en régimen de concejo abierto: en las municipales se elige directamente la alcaldía. Votaron ${f.n(r.voters)} personas de un censo de ${f.n(r.electorate)}: una participación del ${f.p(mv.turnout)}, frente al ${f.p(cataloniaTurnout)} del conjunto de Cataluña. La alcaldía la obtuvo ${lead.short}, con ${f.n(lead.votes)} votos (el ${f.p(leadRow.share)} de los votos válidos).`,
        table: {
          caption: `Resultados de las elecciones municipales de 2023 en ${place}`,
          headers: ["Candidatura", "Votos", "% votos válidos", "Alcaldía"],
          rows: mv.rows.map((row) => [`${row.short}\n${row.name}`, f.n(row.votes), f.p(row.share), row.seats > 0 ? "Sí" : "No"]),
          footRows: [["Votos en blanco", f.n(r.blankVotes), f.p(mv.blankShare), ""]],
          note: `Votos válidos: ${f.n(r.validVotes)}, con los votos en blanco. Votos nulos: ${f.n(r.nullVotes)}, que no cuentan en los porcentajes. Porcentajes calculados a partir de los recuentos oficiales.`,
        },
        mayorRule: "En el concejo abierto, los electores eligen directamente al alcalde por sistema mayoritario (ley electoral, artículo 179.2).",
        seats: {
          title: "Cómo se eligió la alcaldía",
          md: [
            `Los datos oficiales registran un solo cargo a elegir en ${place}, la alcaldía, y no los ${scale} concejales que la escala de la ley electoral da a un municipio de ${f.n(census)} habitantes. Es el régimen de **concejo abierto**: la escala no se aplica y los electores eligen directamente al alcalde por sistema mayoritario ([LOREG, artículo 179.2](${LOREG_URL})).`,
            `La alcaldía fue para la candidatura más votada, ${lead.short}: ${f.n(lead.votes)} de los ${f.n(r.validVotes)} votos válidos.`,
          ],
        },
        faq: [
          {
            question: `¿Qué candidatura obtuvo la alcaldía en las municipales de 2023 en ${place}?`,
            answer: `${lead.short} (${lead.name}), con ${f.n(lead.votes)} votos, el ${f.p(leadRow.share)} de los válidos. ${place} funciona en concejo abierto: los electores eligen directamente al alcalde.`,
          },
          {
            question: `¿Cuántos concejales se eligen en ${place}?`,
            answer: `Ninguno: ${place} funciona en concejo abierto y en las municipales se elige directamente la alcaldía (ley electoral, artículo 179.2).`,
          },
        ],
      };
    }
    const most = lead.seats;
    return {
      fact: { label: "Concejales en el pleno", value: `${r.seats}, con listas abiertas` },
      summary: `${place} elige ${r.seats} concejales con listas abiertas. Votaron ${f.n(r.voters)} personas de un censo de ${f.n(r.electorate)}: una participación del ${f.p(mv.turnout)}, frente al ${f.p(cataloniaTurnout)} del conjunto de Cataluña. ${
        leading.length === 1 ? `La candidatura con más concejales fue ${lead.short}, con ${most} de ${r.seats}.` : `${shorts} obtuvieron ${most} ${most === 1 ? "concejal" : "concejales"} cada una.`
      }${elected < r.seats ? ` Los datos oficiales registran ${elected} concejales electos de los ${r.seats} del pleno.` : ""}`,
      table: {
        caption: `Resultados de las elecciones municipales de 2023 en ${place}`,
        headers: ["Candidatura", "Votos de la candidatura", "Concejales"],
        rows: r.lists.map((list) => [`${list.short}\n${list.name}`, f.n(list.votes), String(list.seats)]),
        footRows: [],
        note: `Votos en blanco: ${f.n(r.blankVotes)}. Votos nulos: ${f.n(r.nullVotes)}. Aquí se vota a candidatos, no a listas: la cifra de cada candidatura es la que publica la Generalitat y no es un recuento de papeletas${
          listSum !== r.listVotes ? ` (las candidaturas suman ${f.n(listSum)}, y las papeletas con voto a candidaturas fueron ${f.n(r.listVotes)})` : ""
        }, así que no calculamos porcentajes.`,
      },
      mayorRule: smallest
        ? "La alcaldía no la decide directamente el voto: los concejales eligen al alcalde en el pleno de constitución (ley electoral, artículo 196)."
        : "La alcaldía no la decide directamente el voto: los concejales eligen al alcalde en el pleno de constitución. En los municipios de 100 a 250 habitantes todos los concejales pueden ser candidatos; si ninguno obtiene la mayoría absoluta de los concejales, es alcalde el concejal que obtuvo más votos populares (ley electoral, artículo 196).",
      seats: {
        title: `Cómo se eligieron los ${r.seats} concejales`,
        md: [
          `En los municipios de hasta 250 habitantes se vota con **listas abiertas** ([LOREG, artículo 184](${LOREG_URL})): no se reparten concejales entre listas, sino que salen elegidos los candidatos con más votos, sean de la lista que sean, hasta completar los ${r.seats} concejales. ${
            smallest
              ? "Hasta 100 residentes, cada candidatura presenta como máximo 3 nombres y cada elector puede marcar hasta 2"
              : "Entre 101 y 250 residentes, cada candidatura presenta como máximo 5 nombres y cada elector puede marcar hasta 4"
          }; los empates se resuelven por sorteo. No hay umbral del 5 % ni sistema D'Hondt.`,
          `El número de concejales depende de la población: con ${f.n(census)} habitantes en el padrón de referencia de estas elecciones, a ${place} le corresponden ${r.seats} (LOREG, artículo 179).`,
          ...(elected < r.seats ? [`Los datos oficiales registran ${elected} concejales electos de los ${r.seats} que corresponden a ${place}.`] : []),
        ],
      },
      faq: [
        {
          question: `¿Qué candidatura obtuvo más concejales en las municipales de 2023 en ${place}?`,
          answer:
            leading.length === 1
              ? `${named(" y ")}, con ${most} de los ${r.seats} concejales. En ${place} se vota con listas abiertas: los concejales son los candidatos más votados.`
              : `${named(" y ")}, con ${most} ${most === 1 ? "concejal" : "concejales"} cada una de los ${r.seats}. En ${place} se vota con listas abiertas: los concejales son los candidatos más votados.`,
        },
        {
          question: `¿Cuántos concejales tiene el Ayuntamiento de ${place}?`,
          answer: `${r.seats}, según la escala del artículo 179 de la ley electoral aplicada a la población del municipio.${elected < r.seats ? ` Los datos oficiales de 2023 registran ${elected} concejales electos.` : ""}`,
        },
      ],
    };
  }

  if (council) {
    return {
      fact: { label: "Local government", value: "open council (concejo abierto): voters elect the mayor directly" },
      summary: `${place} is governed as an open council (concejo abierto): at local elections voters elect the mayor directly. Turnout was ${f.p(mv.turnout)} (${f.n(r.voters)} voters out of an electorate of ${f.n(r.electorate)}), against ${f.p(cataloniaTurnout)} across Catalonia. The mayoralty went to ${lead.short}, with ${f.n(lead.votes)} votes (${f.p(leadRow.share)} of valid votes).`,
      table: {
        caption: `Results of the 2023 local election in ${place}`,
        headers: ["List", "Votes", "% of valid votes", "Mayor"],
        rows: mv.rows.map((row) => [`${row.short}\n${row.name}`, f.n(row.votes), f.p(row.share), row.seats > 0 ? "Yes" : "No"]),
        footRows: [["Blank votes", f.n(r.blankVotes), f.p(mv.blankShare), ""]],
        note: `Valid votes: ${f.n(r.validVotes)}, including blank votes. Spoilt (null) votes: ${f.n(r.nullVotes)}, not counted in the percentages. Percentages computed from the official counts.`,
      },
      mayorRule: "In an open council, voters elect the mayor directly by simple majority (electoral law, article 179.2).",
      seats: {
        title: "How the mayor was elected",
        md: [
          `The official data record a single post to fill in ${place}, the mayoralty, rather than the ${scale} councillors the electoral law's scale gives a municipality of ${f.n(census)} residents. This is the **open council** (concejo abierto): the scale does not apply and voters elect the mayor directly by majority ([LOREG, article 179.2](${LOREG_URL})).`,
          `The mayoralty went to the list with most votes, ${lead.short}: ${f.n(lead.votes)} of ${f.n(r.validVotes)} valid votes.`,
        ],
      },
      faq: [
        {
          question: `Which list won the mayoralty in the 2023 local election in ${place}?`,
          answer: `${lead.short} (${lead.name}), with ${f.n(lead.votes)} votes, ${f.p(leadRow.share)} of valid votes. ${place} is an open council: voters elect the mayor directly.`,
        },
        { question: `How many councillors does ${place} elect?`, answer: `None: ${place} is an open council, and at local elections voters elect the mayor directly (electoral law, article 179.2).` },
      ],
    };
  }
  const most = lead.seats;
  return {
    fact: { label: "Councillors", value: `${r.seats}, open lists` },
    summary: `${place} elects ${r.seats} councillors from open lists. Turnout was ${f.p(mv.turnout)} (${f.n(r.voters)} voters out of an electorate of ${f.n(r.electorate)}), against ${f.p(cataloniaTurnout)} across Catalonia. ${
      leading.length === 1 ? `The list with most councillors was ${lead.short}, with ${most} of ${r.seats}.` : `${shorts} won ${most} ${most === 1 ? "councillor" : "councillors"} each.`
    }${elected < r.seats ? ` The official data record ${elected} councillors elected out of ${r.seats}.` : ""}`,
    table: {
      caption: `Results of the 2023 local election in ${place}`,
      headers: ["List", "List's votes", "Councillors"],
      rows: r.lists.map((list) => [`${list.short}\n${list.name}`, f.n(list.votes), String(list.seats)]),
      footRows: [],
      note: `Blank votes: ${f.n(r.blankVotes)}. Spoilt (null) votes: ${f.n(r.nullVotes)}. Here people vote for candidates, not lists: each list's figure is the one the Generalitat publishes and is not a count of ballots${
        listSum !== r.listVotes ? ` (the lists add up to ${f.n(listSum)}, while ${f.n(r.listVotes)} ballots had votes for candidates)` : ""
      }, so no percentages are computed.`,
    },
    mayorRule: smallest
      ? "Voters do not elect the mayor directly: the councillors do, at the council's first meeting (electoral law, article 196)."
      : "Voters do not elect the mayor directly: the councillors do, at the council's first meeting. In municipalities of 100 to 250 residents any councillor may stand; if none wins an absolute majority of the councillors, the councillor with most popular votes becomes mayor (electoral law, article 196).",
    seats: {
      title: `How the ${r.seats} councillors were elected`,
      md: [
        `Municipalities of up to 250 residents vote with **open lists** ([LOREG, article 184](${LOREG_URL})): seats are not shared out between lists; the candidates with most votes are elected, whatever their list, up to ${r.seats} councillors. ${
          smallest
            ? "Up to 100 residents, each list has at most 3 names and each voter may mark up to 2"
            : "From 101 to 250 residents, each list has at most 5 names and each voter may mark up to 4"
        }; ties are settled by lot. There is no 5% threshold and no D'Hondt.`,
        `The size of the council depends on population: with ${f.n(census)} residents on the register used for this election, ${place} elects ${r.seats} (LOREG, article 179).`,
        ...(elected < r.seats ? [`The official data record ${elected} councillors elected out of the ${r.seats} ${place} elects.`] : []),
      ],
    },
    faq: [
      {
        question: `Which list won most councillors in the 2023 local election in ${place}?`,
        answer: `${named(" and ")}, with ${most} of the ${r.seats} councillors${leading.length > 1 ? " each" : ""}. ${place} votes with open lists: the councillors are the candidates with most votes.`,
      },
      {
        question: `How many councillors does ${place} have?`,
        answer: `${r.seats}, under the scale in article 179 of the electoral law applied to the municipality's population.${elected < r.seats ? ` The official 2023 data record ${elected} elected.` : ""}`,
      },
    ],
  };
}

/** The town's 29N results, when the official file has been imported and covers it. */
export function generalOf(m: Municipality, snapshot: ElectionsSnapshot = SNAPSHOT): { meta: General2026; counts: RegionalVotes; view: GeneralView } | null {
  if (!snapshot.general2026 || !m.g2026) return null;
  return { meta: snapshot.general2026, counts: m.g2026, view: generalView(m.g2026, snapshot.general2026) };
}


export function buildElectionPage(m: Municipality, locale: Locale, snapshot: ElectionsSnapshot = SNAPSHOT): ElectionPageModel {
  const f = formats(locale);
  const place = placeName(m, locale);
  const Place = place.charAt(0).toLocaleUpperCase(locale) + place.slice(1);
  const mv = municipalView(m.municipal);
  const congress = regionalView(m.congress, snapshot.catalonia.congress, snapshot.elections.congress.lists ?? {});
  const parliament = regionalView(m.parliament, snapshot.catalonia.parliament, snapshot.elections.parliament.lists ?? {});
  const cataloniaMunicipalTurnout = turnout(snapshot.catalonia.municipal);
  const top = mv.rows[0]!;
  // Lists level on most votes (Rasquera, Sant Feliu de Buixalleu): every one is named, none is "the" most voted.
  const tops = mv.rows.filter((row) => row.votes === top.votes);
  const topsTied = tops.length > 1;
  const general = generalOf(m, snapshot);
  const dataDate = latestDataDate(snapshot);
  const dates = {
    municipal: f.date(snapshot.elections.municipal.date),
    congress: f.date(snapshot.elections.congress.date),
    parliament: f.date(snapshot.elections.parliament.date),
    read: f.date(dataDate),
  };
  const { sameComarca, sameProvince } = siblings(m, locale);
  const link = (x: Municipality): Link => ({ href: electionPath(locale, x.slug), label: placeName(x, locale) });
  const last = mv.dhondt.last;
  const nextOut = mv.dhondt.nextOut;
  const shortOf = (code: string | undefined) => m.municipal.lists.find((list) => list.code === code)?.short ?? "";
  const mayor = m.mayor;
  const mayorParty = mayor?.party ? ` (${mayor.party})` : "";
  const census = m.municipal.censusPopulation;
  const sizeOk = councilSize(census) === m.municipal.seats;
  // Open lists or concejo abierto: their own council copy (D'Hondt towns keep theirs below).
  const small = councilSystem(m.municipal) === "lists" ? null : smallCouncilCopy(m, locale, mv, turnout(snapshot.catalonia.municipal));
  // A last seat tied in quotient and in votes, settled by lot (LOREG 163.1.d).
  const draw = small ? null : matchDhondt(m.municipal.lists, m.municipal.seats, m.municipal.validVotes);
  const drawn = draw && draw.drawnBy.length > 0 ? draw : null;
  const shortsOf = (codes: string[]) =>
    joinList(
      codes.map((code) => shortOf(code)),
      locale,
    );
  const comarca: Link | null = isComarcaLocale(locale)
    ? {
        href: comarcaPath(locale, comarcaOf(m).slug),
        label:
          locale === "ca"
            ? `Tots els municipis ${caOfComarca(m.comarca)}: resultats de les municipals del 2023`
            : `Todos los municipios de la comarca ${m.comarca}: resultados de las municipales de 2023`,
      }
    : null;

  const municipalRows = mv.rows.map((row) => [`${row.short}\n${row.name}`, f.n(row.votes), f.p(row.share), String(row.seats)]);
  const regionalTable = (view: RegionalView, caption: string, headers: string[], othersLabel: (n: number) => string, blankLabel: string, note: string): Table => ({
    caption,
    headers,
    rows: view.rows.map((row) => [`${row.short}\n${row.name}`, f.n(row.votes), f.p(row.share), f.p(row.cataloniaShare), String(row.cataloniaSeats)]),
    footRows: [
      [othersLabel(view.others.lists), f.n(view.others.votes), f.p(view.others.share), f.p(view.others.cataloniaShare), "0"],
      [blankLabel, f.n(view.blank.votes), f.p(view.blank.share), f.p(view.blank.cataloniaShare), ""],
    ],
    note,
  });
  const sources = [
    ...(general ? [{ name: general.meta.source.name, publisher: general.meta.source.publisher, url: INTERIOR_DOWNLOADS[locale], updated: general.meta.source.fileDate }] : []),
    snapshot.sources.votes,
    snapshot.sources.turnout,
    snapshot.sources.elections,
    snapshot.sources.population,
    snapshot.sources.entities,
    snapshot.sources.mayors,
  ].map((s) => ({ name: s.name, publisher: s.publisher, url: s.url, updated: f.date(s.updated) }));
  // The 29N table: same columns as the 2023 Congress table, every candidacy on the town's ballot.
  const g = general?.view;
  const generalTable = (caption: string, headers: string[], blankLabel: string, note: string): Table => ({
    caption,
    headers,
    rows: (g?.rows ?? []).map((row) => [`${row.short}\n${row.name}`, f.n(row.votes), f.p(row.share), f.p(row.cataloniaShare), String(row.cataloniaSeats)]),
    footRows: g ? [[blankLabel, f.n(g.blank.votes), f.p(g.blank.share), f.p(g.blank.cataloniaShare), ""]] : [],
    note,
  });
  const leaders = (and: string) => (g?.leaders ?? []).map((row) => row.short).join(and);
  const related = RELATED.map((key) => ({ href: b2href(key, locale), label: B2_TITLES[key][locale] }));
  const hub = { href: hubPath(locale), label: "" };

  if (locale === "ca") {
    const a = inCa(place);
    const de = ofCa(place);
    return {
      locale,
      h1: `Resultats de les eleccions ${a}`,
      standfirst: general
        ? `Els resultats de les eleccions generals del 29 de novembre de 2026 ${a}, del fitxer oficial del Ministeri de l'Interior, al costat del conjunt de Catalunya. I les municipals del 2023 amb els vots i els regidors de cada llista, les generals del 2023 i les eleccions al Parlament del 2024.`
        : `Les municipals del 2023 amb els vots i els regidors de cada llista, i com es va votar ${a} a les generals del 2023 i a les eleccions al Parlament del 2024, al costat del conjunt de Catalunya. Amb dades oficials i un espai per als resultats del 29 de novembre.`,
      dataDate,
      readLine: `Dades llegides el ${dates.read}`,
      facts: [
        { label: "Població", value: `${f.n(m.population)} habitants (1 de gener de ${snapshot.sources.population.period.slice(0, 4)}, Idescat)` },
        { label: "Comarca i província", value: `${m.comarca} · ${m.province}` },
        small ? small.fact : { label: "Regidors al ple", value: String(m.municipal.seats) },
        ...(mayor ? [{ label: "Alcaldia", value: `${mayor.name}${mayorParty}, des ${caDel(mayor.since)}` }] : []),
        { label: "Pròximes municipals", value: "diumenge 23 de maig de 2027 (previstes)" },
      ],
      slot: {
        title: "Eleccions generals del 29 de novembre de 2026",
        lines: {
          fallback: "Votació: diumenge 29 de novembre de 2026.",
          before: "Falten {days} dies per a la votació, el diumenge 29 de novembre de 2026.",
          beforeOne: "Demà, diumenge 29 de novembre de 2026, és el dia de la votació.",
          today: "Avui, diumenge 29 de novembre de 2026, és el dia de la votació.",
          after: "La votació va ser el diumenge 29 de novembre de 2026.",
        },
        md: general
          ? [
              `**Resultats oficials del Ministeri de l'Interior**, del fitxer de resultats per municipis de la seva [àrea de descàrregues](${INTERIOR_DOWNLOADS.ca}).`,
              `Més sobre aquestes eleccions: [${B2_TITLES.candidates.ca}](${b2href("candidates", "ca")}) i [${B2_TITLES.congressResults.ca}](${b2href("congressResults", "ca")}).`,
            ]
          : [
              `**Els resultats ${de} apareixeran aquí quan el Ministeri de l'Interior publiqui el fitxer oficial de resultats per municipis** a la seva [àrea de descàrregues](${INTERIOR_DOWNLOADS.ca}).`,
              ELECTION_NIGHT_RESULTS_URL
                ? `Resultats provisionals de la nit electoral: [web oficial del Ministeri de l'Interior](${ELECTION_NIGHT_RESULTS_URL}).`
                : `Resultats provisionals de la nit electoral: Interior encara no ha anunciat el web on els publicarà (comprovat el ${f.date(INTERIOR_CHECKED)}). Quan ho faci, n'hi posarem l'enllaç oficial. Com funciona l'escrutini: [${B2_TITLES.electionNight.ca}](${b2href("electionNight", "ca")}).`,
              `Si has de votar: [com votar a Catalunya](${b2href("voting", "ca")}) i [les llistes de candidats del 29N](${b2href("candidates", "ca")}).`,
            ],
        results:
          general && g
            ? {
                summary: `${a.charAt(0).toUpperCase()}${a.slice(1)} van votar ${f.n(general.counts.voters)} persones d'un cens de ${f.n(general.counts.electorate)}: una participació ${caDelPct(f.p(g.turnout))}, davant ${caDelPct(f.p(g.cataloniaTurnout))} de Catalunya.${
                  g.leaders.length === 1
                    ? ` La candidatura més votada va ser ${g.leaders[0]!.short}, amb ${f.n(g.leaders[0]!.votes)} vots (${caElPct(f.p(g.leaders[0]!.share))} dels vots vàlids; ${f.p(g.leaders[0]!.cataloniaShare)} a Catalunya).`
                    : g.leaders.length > 1
                      ? ` Les candidatures més votades van ser ${leaders(" i ")}, empatades amb ${f.n(g.leaders[0]!.votes)} vots cadascuna (${caElPct(f.p(g.leaders[0]!.share))} dels vots vàlids).`
                      : ""
                }`,
                table: generalTable(
                  `Vots al Congrés el 29 de novembre de 2026 ${a} i a Catalunya`,
                  ["Candidatura", "Vots", `% ${Place}`, "% Catalunya", "Diputats"],
                  "Vots en blanc",
                  `Font: Ministeri de l'Interior, fitxer oficial de resultats per municipis ${general.meta.source.file}, ${caDel(general.meta.source.fileDate)}. Vots vàlids: ${f.n(general.counts.validVotes)}, amb els vots en blanc; vots nuls: ${f.n(general.counts.nullVotes)}, que no compten en els percentatges. Percentatges calculats a partir dels recomptes oficials. Catalunya: la suma dels seus municipis, sense el vot dels residents a l'estranger (CERA); amb aquest vot, la participació oficial va ser ${caDelPct(f.p(g.cataloniaTurnoutWithAbroad))}. Els escons es reparteixen per províncies: l'última columna és el total de Catalunya (${g.cataloniaSeats} diputats).`,
                ),
              }
            : null,
      },
      municipal: {
        title: `Eleccions municipals del ${dates.municipal}`,
        summary:
          small?.summary ??
          `${Place} escull ${m.municipal.seats} regidors. Van votar ${f.n(m.municipal.voters)} persones d'un cens de ${f.n(m.municipal.electorate)}: una participació ${caDelPct(f.p(mv.turnout))}, davant ${caDelPct(f.p(cataloniaMunicipalTurnout))} del conjunt de Catalunya. ${
            topsTied
              ? `Les llistes més votades van ser ${shortsOf(tops.map((row) => row.code))}, empatades amb ${f.n(top.votes)} vots cadascuna (${caElPct(f.p(top.share))} dels vots vàlids): ${tops.map((row) => `${row.short}, ${row.seats} ${row.seats === 1 ? "regidor" : "regidors"}`).join("; ")}.`
              : `La llista més votada va ser ${top.short}, amb ${f.n(top.votes)} vots (${caElPct(f.p(top.share))} dels vots vàlids) i ${top.seats} ${top.seats === 1 ? "regidor" : "regidors"}.`
          }`,
        table: small?.table ?? {
          caption: `Resultats de les eleccions municipals del 2023 ${a}`,
          headers: ["Candidatura", "Vots", "% vots vàlids", "Regidors"],
          rows: municipalRows,
          footRows: [["Vots en blanc", f.n(m.municipal.blankVotes), f.p(mv.blankShare), ""]],
          note: `Vots vàlids: ${f.n(m.municipal.validVotes)}, amb els vots en blanc. Vots nuls: ${f.n(m.municipal.nullVotes)}, que no compten en els percentatges. Percentatges calculats a partir dels recomptes oficials.`,
        },
        mayorRule:
          small?.mayorRule ??
          "L'alcaldia no la decideix directament el vot: els regidors elegeixen l'alcalde en el ple de constitució. Si cap dels caps de llista no obté la majoria absoluta dels regidors, és alcalde qui encapçala la llista més votada (llei electoral, article 196).",
        mayor: mayor ? `Segons el registre d'ens locals de la Generalitat, l'alcaldia ${de} l'ocupa ${mayor.name}${mayorParty}, que en va prendre possessió ${caEl(mayor.since)}.` : null,
      },
      seats: small?.seats ?? {
        title: `Com es van repartir els ${m.municipal.seats} regidors`,
        md: [
          `La llei electoral aplica el **sistema D'Hondt** ([LOREG, articles 163 i 180](${LOREG_URL})). Només hi entren les llistes amb almenys el **5 % dels vots vàlids**, que ${a} volia dir ${f.n(mv.threshold)} vots; ${mv.belowThreshold === 0 ? "totes les llistes el van superar" : mv.belowThreshold === 1 ? "una llista es va quedar per sota" : `${mv.belowThreshold} llistes es van quedar per sota`}. Els vots de cada llista que el supera es divideixen per 1, 2, 3… i els regidors van als quocients més alts.`,
          ...(drawn && last
            ? [
                `${caTheOrdinal(m.municipal.seats)} i últim regidor es va decidir per sorteig: ${shortsOf(drawn.tiedLists)} hi empataven amb el mateix quocient, ${f.q(last.value)} (${f.n(last.votes)} vots ÷ ${last.divisor}), i el mateix nombre total de vots. La llei resol el primer d'aquests empats per sorteig i els següents alternant (LOREG, article 163.1). Segons el resultat oficial, el regidor va ser per a ${shortsOf(drawn.drawnBy)}.`,
              ]
            : last && nextOut
              ? [`${caTheOrdinal(m.municipal.seats)} i últim regidor el va obtenir ${shortOf(last.code)}, amb un quocient de ${f.q(last.value)} (${f.n(last.votes)} vots ÷ ${last.divisor}). El quocient més alt que es va quedar sense regidor: ${f.q(nextOut.value)} (${shortOf(nextOut.code)}, ${f.n(nextOut.votes)} ÷ ${nextOut.divisor}).`]
              : []),
          ...(sizeOk
            ? [`El nombre de regidors depèn de la població: amb ${f.n(census)} habitants al padró de referència d'aquestes eleccions, ${a} li'n corresponen ${m.municipal.seats} (LOREG, article 179).`]
            : []),
        ],
      },
      congress: {
        title: `Eleccions generals del ${dates.congress} (Congrés)`,
        summary: `${a.charAt(0).toUpperCase()}${a.slice(1)} van votar ${f.n(m.congress.voters)} persones d'un cens de ${f.n(m.congress.electorate)}: una participació ${caDelPct(f.p(congress.turnout))}, davant ${caDelPct(f.p(congress.cataloniaTurnout))} de Catalunya. La llista més votada va ser ${congress.rows[0]?.short}, amb ${caElPct(f.p(congress.rows[0]?.share ?? 0))} dels vots vàlids (${f.p(congress.rows[0]?.cataloniaShare ?? 0)} a Catalunya).`,
        table: regionalTable(
          congress,
          `Vots al Congrés el 2023 ${a} i a Catalunya`,
          ["Candidatura", "Vots", `% ${Place}`, "% Catalunya", "Diputats"],
          (n) => `Altres candidatures (${n})`,
          "Vots en blanc",
          `Els escons es reparteixen per províncies, no per municipis: l'última columna és el total de Catalunya (48 diputats). Les xifres de Catalunya no inclouen el vot dels residents a l'estranger (CERA), que es compta per províncies i no s'assigna a cap municipi; amb aquest vot, la participació oficial a Catalunya va ser del ${f.p(congress.cataloniaTurnoutWithAbroad)}.`,
        ),
      },
      parliament: {
        title: `Eleccions al Parlament de Catalunya del ${dates.parliament}`,
        summary: `${a.charAt(0).toUpperCase()}${a.slice(1)} van votar ${f.n(m.parliament.voters)} persones d'un cens de ${f.n(m.parliament.electorate)}: una participació ${caDelPct(f.p(parliament.turnout))}, davant ${caDelPct(f.p(parliament.cataloniaTurnout))} de Catalunya. La llista més votada va ser ${parliament.rows[0]?.short}, amb ${caElPct(f.p(parliament.rows[0]?.share ?? 0))} dels vots vàlids (${f.p(parliament.rows[0]?.cataloniaShare ?? 0)} a Catalunya).`,
        table: regionalTable(
          parliament,
          `Vots al Parlament el 2024 ${a} i a Catalunya`,
          ["Candidatura", "Vots", `% ${Place}`, "% Catalunya", "Diputats"],
          (n) => `Altres candidatures (${n})`,
          "Vots en blanc",
          `Els 135 diputats es reparteixen per províncies; l'última columna és el total. Les xifres de Catalunya no inclouen el vot dels residents a l'estranger (CERA); amb aquest vot, la participació oficial va ser del ${f.p(parliament.cataloniaTurnoutWithAbroad)}.`,
        ),
      },
      turnout: {
        title: `Participació ${a} i a Catalunya`,
        table: {
          caption: `Participació a les ${g ? "quatre" : "tres"} últimes eleccions ${a}`,
          headers: ["Eleccions", Place, "Catalunya"],
          rows: [
            ...(g && general ? [[`Generals, ${f.date(general.meta.date)}`, f.p(g.turnout), f.p(g.cataloniaTurnout)]] : []),
            [`Municipals, ${dates.municipal}`, f.p(mv.turnout), f.p(cataloniaMunicipalTurnout)],
            [`Generals, ${dates.congress}`, f.p(congress.turnout), f.p(congress.cataloniaTurnout)],
            [`Parlament, ${dates.parliament}`, f.p(parliament.turnout), f.p(parliament.cataloniaTurnout)],
          ],
          footRows: [],
          note: "Votants sobre cens. Generals i Parlament: Catalunya sense el vot de l'estranger, per comparar les mateixes dades.",
        },
      },
      census: {
        title: "Què és el cens electoral",
        md: [
          `El cens electoral és la llista de les persones amb dret a vot ([LOREG, article 31](${LOREG_URL})). No és la població: no hi ha els menors de 18 anys ni els estrangers sense dret a vot. Per això ${place} té ${f.n(m.population)} habitants i a les municipals del 2023 tenia un cens de ${f.n(m.municipal.electorate)} persones.`,
          "A les municipals, el cens també inclou els ciutadans de la Unió Europea i dels països amb tractat de reciprocitat que hi resideixen i s'hi han inscrit (article 176). A les generals i a les del Parlament, el vot de les persones inscrites a l'estranger (CERA) es compta per províncies i no apareix a les xifres del municipi.",
          "La **participació** és el nombre de votants dividit pel cens. Els percentatges de cada llista es calculen sobre els **vots vàlids**: els vots a candidatures més els vots en blanc. Els vots nuls no compten.",
        ],
      },
      next: {
        title: "Quan són les pròximes eleccions municipals",
        md: [
          `Les pròximes municipals són previstes per al **diumenge 23 de maig de 2027**. La llei les fixa el quart diumenge de maig, cada quatre anys, i el decret de convocatòria s'expedeix 55 dies abans i es publica l'endemà al BOE ([LOREG, article 42.3](${LOREG_URL})): el 29 i el 30 de març de 2027. El decret encara no s'ha publicat.`,
          `Els resultats de qualsevol municipi de Catalunya des del 1979: [${B2_TITLES.municipalResults.ca}](${b2href("municipalResults", "ca")}).`,
        ],
      },
      faqTitle: "Preguntes freqüents",
      faq: [
        ...(small?.faq ?? [
          {
            question: `Quina llista va ser la més votada a les municipals del 2023 ${a}?`,
            answer: topsTied
              ? `${tops.map((row) => `${row.short} (${row.name})`).join(" i ")}, empatades amb ${f.n(top.votes)} vots cadascuna, ${caElPct(f.p(top.share))} dels vàlids. Dels ${m.municipal.seats} regidors, ${tops.map((row) => `${row.short} en va obtenir ${row.seats}`).join(" i ")}.`
              : `${top.short} (${top.name}), amb ${f.n(top.votes)} vots, ${caElPct(f.p(top.share))} dels vàlids, i ${top.seats} dels ${m.municipal.seats} regidors.`,
          },
          {
            question: `Quants regidors té l'Ajuntament ${de}?`,
            answer: `${m.municipal.seats}, segons l'escala de l'article 179 de la llei electoral aplicada a la població del municipi.`,
          },
        ]),
        g && general && g.leaders.length
          ? {
              question: `Quina candidatura va tenir més vots el 29N ${a}?`,
              answer: `${g.leaders.map((row) => `${row.short} (${row.name})`).join(" i ")}, amb ${f.n(g.leaders[0]!.votes)} vots${g.leaders.length > 1 ? " cadascuna" : ""}, ${caElPct(f.p(g.leaders[0]!.share))} dels vàlids. La participació va ser ${caDelPct(f.p(g.turnout))}. Dades oficials del Ministeri de l'Interior.`,
            }
          : {
              question: `Quan es podran consultar els resultats del 29N ${a}?`,
              answer: "Quan el Ministeri de l'Interior publiqui el fitxer oficial de resultats per municipis, que apareixerà en aquesta pàgina. La nit electoral, l'escrutini provisional el publica Interior.",
            },
      ],
      siblings: {
        title: "Resultats en altres municipis",
        groups: [
          ...(sameComarca.length ? [{ label: `${m.comarca}`, links: sameComarca.map(link) }] : []),
          ...(sameProvince.length ? [{ label: `Altres municipis de la província de ${m.province}`, links: sameProvince.map(link) }] : []),
        ],
        hub: { ...hub, label: `Els ${PAGES_PER_LOCALE.ca} municipis de Catalunya, per comarques` },
        comarca,
      },
      related: { title: "Guies sobre les eleccions", links: related },
      sources: {
        title: "Fonts",
        note: `Dades oficials llegides el ${dates.read}; entre parèntesis, l'última actualització de cada conjunt de dades.`,
        items: sources,
      },
    };
  }

  if (locale === "es") {
    return {
      locale,
      h1: `Resultados de las elecciones en ${place}`,
      standfirst: general
        ? `Los resultados de las elecciones generales del 29 de noviembre de 2026 en ${place}, del fichero oficial del Ministerio del Interior, junto al conjunto de Cataluña. Y las municipales de 2023 con los votos y los concejales de cada lista, las generales de 2023 y las elecciones al Parlament de 2024.`
        : `Las municipales de 2023 con los votos y los concejales de cada lista, y cómo se votó en ${place} en las generales de 2023 y en las elecciones al Parlament de 2024, junto al conjunto de Cataluña. Con datos oficiales y un espacio para los resultados del 29 de noviembre.`,
      dataDate,
      readLine: `Datos leídos el ${dates.read}`,
      facts: [
        { label: "Población", value: `${f.n(m.population)} habitantes (1 de enero de ${snapshot.sources.population.period.slice(0, 4)}, Idescat)` },
        { label: "Comarca y provincia", value: `${m.comarca} · ${m.province}` },
        small ? small.fact : { label: "Concejales en el pleno", value: String(m.municipal.seats) },
        ...(mayor ? [{ label: "Alcaldía", value: `${mayor.name}${mayorParty}, desde el ${f.date(mayor.since)}` }] : []),
        { label: "Próximas municipales", value: "domingo 23 de mayo de 2027 (previstas)" },
      ],
      slot: {
        title: "Elecciones generales del 29 de noviembre de 2026",
        lines: {
          fallback: "Votación: domingo 29 de noviembre de 2026.",
          before: "Faltan {days} días para la votación, el domingo 29 de noviembre de 2026.",
          beforeOne: "Mañana, domingo 29 de noviembre de 2026, es el día de la votación.",
          today: "Hoy, domingo 29 de noviembre de 2026, es el día de la votación.",
          after: "La votación fue el domingo 29 de noviembre de 2026.",
        },
        md: general
          ? [
              `**Resultados oficiales del Ministerio del Interior**, del fichero de resultados por municipios de su [área de descargas](${INTERIOR_DOWNLOADS.es}).`,
              `Más sobre estas elecciones: [${B2_TITLES.candidates.es}](${b2href("candidates", "es")}) y [${B2_TITLES.congressResults.es}](${b2href("congressResults", "es")}).`,
            ]
          : [
              `**Los resultados de ${place} aparecerán aquí cuando el Ministerio del Interior publique el fichero oficial de resultados por municipios** en su [área de descargas](${INTERIOR_DOWNLOADS.es}).`,
              ELECTION_NIGHT_RESULTS_URL
                ? `Resultados provisionales de la noche electoral: [web oficial del Ministerio del Interior](${ELECTION_NIGHT_RESULTS_URL}).`
                : `Resultados provisionales de la noche electoral: Interior aún no ha anunciado la web donde los publicará (comprobado el ${f.date(INTERIOR_CHECKED)}). Cuando lo haga, pondremos aquí el enlace oficial. Cómo funciona el escrutinio: [${B2_TITLES.electionNight.es}](${b2href("electionNight", "es")}).`,
              `Si tienes que votar: [cómo votar en Cataluña](${b2href("voting", "es")}) y [las listas de candidatos del 29N](${b2href("candidates", "es")}).`,
            ],
        results:
          general && g
            ? {
                summary: `En ${place} votaron ${f.n(general.counts.voters)} personas de un censo de ${f.n(general.counts.electorate)}: una participación del ${f.p(g.turnout)}, frente al ${f.p(g.cataloniaTurnout)} de Cataluña.${
                  g.leaders.length === 1
                    ? ` La candidatura más votada fue ${g.leaders[0]!.short}, con ${f.n(g.leaders[0]!.votes)} votos (el ${f.p(g.leaders[0]!.share)} de los votos válidos; ${f.p(g.leaders[0]!.cataloniaShare)} en Cataluña).`
                    : g.leaders.length > 1
                      ? ` Las candidaturas más votadas fueron ${leaders(" y ")}, empatadas con ${f.n(g.leaders[0]!.votes)} votos cada una (el ${f.p(g.leaders[0]!.share)} de los votos válidos).`
                      : ""
                }`,
                table: generalTable(
                  `Votos al Congreso el 29 de noviembre de 2026 en ${place} y en Cataluña`,
                  ["Candidatura", "Votos", `% ${place}`, "% Cataluña", "Diputados"],
                  "Votos en blanco",
                  `Fuente: Ministerio del Interior, fichero oficial de resultados por municipios ${general.meta.source.file}, del ${f.date(general.meta.source.fileDate)}. Votos válidos: ${f.n(general.counts.validVotes)}, con los votos en blanco; votos nulos: ${f.n(general.counts.nullVotes)}, que no cuentan en los porcentajes. Porcentajes calculados a partir de los recuentos oficiales. Cataluña: la suma de sus municipios, sin el voto de los residentes en el extranjero (CERA); con ese voto, la participación oficial fue del ${f.p(g.cataloniaTurnoutWithAbroad)}. Los escaños se reparten por provincias: la última columna es el total de Cataluña (${g.cataloniaSeats} diputados).`,
                ),
              }
            : null,
      },
      municipal: {
        title: `Elecciones municipales del ${dates.municipal}`,
        summary:
          small?.summary ??
          `${place} elige ${m.municipal.seats} concejales. Votaron ${f.n(m.municipal.voters)} personas de un censo de ${f.n(m.municipal.electorate)}: una participación del ${f.p(mv.turnout)}, frente al ${f.p(cataloniaMunicipalTurnout)} del conjunto de Cataluña. ${
            topsTied
              ? `Las listas más votadas fueron ${shortsOf(tops.map((row) => row.code))}, empatadas con ${f.n(top.votes)} votos cada una (el ${f.p(top.share)} de los votos válidos): ${tops.map((row) => `${row.short}, ${row.seats} ${row.seats === 1 ? "concejal" : "concejales"}`).join("; ")}.`
              : `La lista más votada fue ${top.short}, con ${f.n(top.votes)} votos (el ${f.p(top.share)} de los votos válidos) y ${top.seats} ${top.seats === 1 ? "concejal" : "concejales"}.`
          }`,
        table: small?.table ?? {
          caption: `Resultados de las elecciones municipales de 2023 en ${place}`,
          headers: ["Candidatura", "Votos", "% votos válidos", "Concejales"],
          rows: municipalRows,
          footRows: [["Votos en blanco", f.n(m.municipal.blankVotes), f.p(mv.blankShare), ""]],
          note: `Votos válidos: ${f.n(m.municipal.validVotes)}, con los votos en blanco. Votos nulos: ${f.n(m.municipal.nullVotes)}, que no cuentan en los porcentajes. Porcentajes calculados a partir de los recuentos oficiales.`,
        },
        mayorRule:
          small?.mayorRule ??
          "La alcaldía no la decide directamente el voto: los concejales eligen al alcalde en el pleno de constitución. Si ningún cabeza de lista obtiene la mayoría absoluta de los concejales, es alcalde el cabeza de la lista más votada (ley electoral, artículo 196).",
        mayor: mayor ? `Según el registro de entes locales de la Generalitat, la alcaldía de ${place} la ocupa ${mayor.name}${mayorParty}, que tomó posesión el ${f.date(mayor.since)}.` : null,
      },
      seats: small?.seats ?? {
        title: `Cómo se repartieron los ${m.municipal.seats} concejales`,
        md: [
          `La ley electoral aplica el **sistema D'Hondt** ([LOREG, artículos 163 y 180](${LOREG_URL})). Solo entran las listas con al menos el **5 % de los votos válidos**, que en ${place} significaba ${f.n(mv.threshold)} votos; ${mv.belowThreshold === 0 ? "todas las listas lo superaron" : mv.belowThreshold === 1 ? "una lista se quedó por debajo" : `${mv.belowThreshold} listas se quedaron por debajo`}. Los votos de cada lista que lo supera se dividen por 1, 2, 3… y los concejales van a los cocientes más altos.`,
          ...(drawn && last
            ? [
                `El ${ORDINAL_ES(m.municipal.seats)} y último concejal se decidió por sorteo: ${shortsOf(drawn.tiedLists)} empataban con el mismo cociente, ${f.q(last.value)} (${f.n(last.votes)} votos ÷ ${last.divisor}), y el mismo número total de votos. La ley resuelve el primero de estos empates por sorteo y los siguientes de forma alternativa (LOREG, artículo 163.1). Según el resultado oficial, el concejal fue para ${shortsOf(drawn.drawnBy)}.`,
              ]
            : last && nextOut
              ? [`El ${ORDINAL_ES(m.municipal.seats)} y último concejal lo obtuvo ${shortOf(last.code)}, con un cociente de ${f.q(last.value)} (${f.n(last.votes)} votos ÷ ${last.divisor}). El cociente más alto que se quedó sin concejal: ${f.q(nextOut.value)} (${shortOf(nextOut.code)}, ${f.n(nextOut.votes)} ÷ ${nextOut.divisor}).`]
              : []),
          ...(sizeOk
            ? [`El número de concejales depende de la población: con ${f.n(census)} habitantes en el padrón de referencia de estas elecciones, a ${place} le corresponden ${m.municipal.seats} (LOREG, artículo 179).`]
            : []),
        ],
      },
      congress: {
        title: `Elecciones generales del ${dates.congress} (Congreso)`,
        summary: `En ${place} votaron ${f.n(m.congress.voters)} personas de un censo de ${f.n(m.congress.electorate)}: una participación del ${f.p(congress.turnout)}, frente al ${f.p(congress.cataloniaTurnout)} de Cataluña. La lista más votada fue ${congress.rows[0]?.short}, con el ${f.p(congress.rows[0]?.share ?? 0)} de los votos válidos (${f.p(congress.rows[0]?.cataloniaShare ?? 0)} en Cataluña).`,
        table: regionalTable(
          congress,
          `Votos al Congreso en 2023 en ${place} y en Cataluña`,
          ["Candidatura", "Votos", `% ${place}`, "% Cataluña", "Diputados"],
          (n) => `Otras candidaturas (${n})`,
          "Votos en blanco",
          `Los escaños se reparten por provincias, no por municipios: la última columna es el total de Cataluña (48 diputados). Las cifras de Cataluña no incluyen el voto de los residentes en el extranjero (CERA), que se cuenta por provincias y no se asigna a ningún municipio; con ese voto, la participación oficial en Cataluña fue del ${f.p(congress.cataloniaTurnoutWithAbroad)}.`,
        ),
      },
      parliament: {
        title: `Elecciones al Parlament de Catalunya del ${dates.parliament}`,
        summary: `En ${place} votaron ${f.n(m.parliament.voters)} personas de un censo de ${f.n(m.parliament.electorate)}: una participación del ${f.p(parliament.turnout)}, frente al ${f.p(parliament.cataloniaTurnout)} de Cataluña. La lista más votada fue ${parliament.rows[0]?.short}, con el ${f.p(parliament.rows[0]?.share ?? 0)} de los votos válidos (${f.p(parliament.rows[0]?.cataloniaShare ?? 0)} en Cataluña).`,
        table: regionalTable(
          parliament,
          `Votos al Parlament en 2024 en ${place} y en Cataluña`,
          ["Candidatura", "Votos", `% ${place}`, "% Cataluña", "Diputados"],
          (n) => `Otras candidaturas (${n})`,
          "Votos en blanco",
          `Los 135 diputados se reparten por provincias; la última columna es el total. Las cifras de Cataluña no incluyen el voto de los residentes en el extranjero (CERA); con ese voto, la participación oficial fue del ${f.p(parliament.cataloniaTurnoutWithAbroad)}.`,
        ),
      },
      turnout: {
        title: `Participación en ${place} y en Cataluña`,
        table: {
          caption: `Participación en las ${g ? "cuatro" : "tres"} últimas elecciones en ${place}`,
          headers: ["Elecciones", place, "Cataluña"],
          rows: [
            ...(g && general ? [[`Generales, ${f.date(general.meta.date)}`, f.p(g.turnout), f.p(g.cataloniaTurnout)]] : []),
            [`Municipales, ${dates.municipal}`, f.p(mv.turnout), f.p(cataloniaMunicipalTurnout)],
            [`Generales, ${dates.congress}`, f.p(congress.turnout), f.p(congress.cataloniaTurnout)],
            [`Parlament, ${dates.parliament}`, f.p(parliament.turnout), f.p(parliament.cataloniaTurnout)],
          ],
          footRows: [],
          note: "Votantes sobre censo. Generales y Parlament: Cataluña sin el voto exterior, para comparar los mismos datos.",
        },
      },
      census: {
        title: "Qué es el censo electoral",
        md: [
          `El censo electoral es la lista de las personas con derecho a voto ([LOREG, artículo 31](${LOREG_URL})). No es la población: no están los menores de 18 años ni los extranjeros sin derecho a voto. Por eso ${place} tiene ${f.n(m.population)} habitantes y en las municipales de 2023 tenía un censo de ${f.n(m.municipal.electorate)} personas.`,
          "En las municipales, el censo también incluye a los ciudadanos de la Unión Europea y de los países con tratado de reciprocidad que residen allí y se han inscrito (artículo 176). En las generales y en las del Parlament, el voto de las personas inscritas en el extranjero (CERA) se cuenta por provincias y no aparece en las cifras del municipio.",
          "La **participación** es el número de votantes dividido por el censo. Los porcentajes de cada lista se calculan sobre los **votos válidos**: los votos a candidaturas más los votos en blanco. Los votos nulos no cuentan.",
        ],
      },
      next: {
        title: "Cuándo son las próximas elecciones municipales",
        md: [
          `Las próximas municipales están previstas para el **domingo 23 de mayo de 2027**. La ley las fija el cuarto domingo de mayo, cada cuatro años, y el decreto de convocatoria se expide 55 días antes y se publica al día siguiente en el BOE ([LOREG, artículo 42.3](${LOREG_URL})): el 29 y el 30 de marzo de 2027. El decreto todavía no se ha publicado.`,
          `Los resultados de cualquier municipio de Cataluña desde 1979: [${B2_TITLES.municipalResults.es}](${b2href("municipalResults", "es")}).`,
        ],
      },
      faqTitle: "Preguntas frecuentes",
      faq: [
        ...(small?.faq ?? [
          {
            question: `¿Qué lista fue la más votada en las municipales de 2023 en ${place}?`,
            answer: topsTied
              ? `${tops.map((row) => `${row.short} (${row.name})`).join(" y ")}, empatadas con ${f.n(top.votes)} votos cada una, el ${f.p(top.share)} de los válidos. De los ${m.municipal.seats} concejales, ${tops.map((row) => `${row.short} obtuvo ${row.seats}`).join(" y ")}.`
              : `${top.short} (${top.name}), con ${f.n(top.votes)} votos, el ${f.p(top.share)} de los válidos, y ${top.seats} de los ${m.municipal.seats} concejales.`,
          },
          {
            question: `¿Cuántos concejales tiene el Ayuntamiento de ${place}?`,
            answer: `${m.municipal.seats}, según la escala del artículo 179 de la ley electoral aplicada a la población del municipio.`,
          },
        ]),
        g && general && g.leaders.length
          ? {
              question: `¿Qué candidatura tuvo más votos el 29N en ${place}?`,
              answer: `${g.leaders.map((row) => `${row.short} (${row.name})`).join(" y ")}, con ${f.n(g.leaders[0]!.votes)} votos${g.leaders.length > 1 ? " cada una" : ""}, el ${f.p(g.leaders[0]!.share)} de los válidos. La participación fue del ${f.p(g.turnout)}. Datos oficiales del Ministerio del Interior.`,
            }
          : {
              question: `¿Cuándo se podrán consultar los resultados del 29N en ${place}?`,
              answer: "Cuando el Ministerio del Interior publique el fichero oficial de resultados por municipios, que aparecerá en esta página. En la noche electoral, el escrutinio provisional lo publica Interior.",
            },
      ],
      siblings: {
        title: "Resultados en otros municipios",
        groups: [
          ...(sameComarca.length ? [{ label: `${m.comarca}`, links: sameComarca.map(link) }] : []),
          ...(sameProvince.length ? [{ label: `Otros municipios de la provincia de ${m.province}`, links: sameProvince.map(link) }] : []),
        ],
        hub: { ...hub, label: `Los ${PAGES_PER_LOCALE.es} municipios de Cataluña, por comarcas` },
        comarca,
      },
      related: { title: "Guías sobre las elecciones", links: related },
      sources: {
        title: "Fuentes",
        note: `Datos oficiales leídos el ${dates.read}; entre paréntesis, la última actualización de cada conjunto de datos.`,
        items: sources,
      },
    };
  }

  return {
    locale,
    h1: `Election results in ${place}`,
    standfirst: general
      ? `Results of the general election of 29 November 2026 in ${place}, from the Spanish Interior Ministry's official file, beside Catalonia as a whole. And the 2023 local election with every list's votes and councillors, the 2023 general election and the 2024 Catalan election.`
      : `The 2023 local election with every list's votes and councillors, and how ${place} voted in the 2023 general election and the 2024 Catalan election, beside Catalonia as a whole. From official data, with space for the results of 29 November.`,
    dataDate,
    readLine: `Data read on ${dates.read}`,
    facts: [
      { label: "Population", value: `${f.n(m.population)} (1 January ${snapshot.sources.population.period.slice(0, 4)}, Idescat)` },
      { label: "Comarca and province", value: `${m.comarca} · ${m.province}` },
      small ? small.fact : { label: "Councillors", value: String(m.municipal.seats) },
      ...(mayor ? [{ label: "Mayor", value: `${mayor.name}${mayorParty}, since ${f.date(mayor.since)}` }] : []),
      { label: "Next local elections", value: "Sunday 23 May 2027 (expected)" },
    ],
    slot: {
      title: "General election of 29 November 2026",
      lines: {
        fallback: "Polling day: Sunday 29 November 2026.",
        before: "{days} days to go to polling day, Sunday 29 November 2026.",
        beforeOne: "Tomorrow, Sunday 29 November 2026, is polling day.",
        today: "Today, Sunday 29 November 2026, is polling day.",
        after: "Polling day was Sunday 29 November 2026.",
      },
      md: general
        ? [
            `**Official results from the Spanish Ministry of the Interior**, from the results file by municipality in its [download area](${INTERIOR_DOWNLOADS.en}).`,
            `More on this election: [${B2_TITLES.candidates.en}](${b2href("candidates", "en")}) and [${B2_TITLES.congressResults.en}](${b2href("congressResults", "en")}).`,
          ]
        : [
            `**Results for ${place} will appear here when the Spanish Ministry of the Interior publishes the official results file by municipality** in its [download area](${INTERIOR_DOWNLOADS.en}).`,
            ELECTION_NIGHT_RESULTS_URL
              ? `Provisional results on election night: [the Interior Ministry's official site](${ELECTION_NIGHT_RESULTS_URL}).`
              : `Provisional results on election night: the ministry has not yet announced the website where it will publish them (checked on ${f.date(INTERIOR_CHECKED)}). When it does, we will add the official link here. How the count works: [${B2_TITLES.electionNight.en}](${b2href("electionNight", "en")}).`,
            `If you are voting: [how to vote in Catalonia](${b2href("voting", "en")}) and [the 29 November candidate lists](${b2href("candidates", "en")}).`,
          ],
      results:
        general && g
          ? {
              summary: `In ${place}, ${f.n(general.counts.voters)} people voted out of an electorate of ${f.n(general.counts.electorate)}: turnout of ${f.p(g.turnout)}, against ${f.p(g.cataloniaTurnout)} in Catalonia.${
                g.leaders.length === 1
                  ? ` The list with most votes was ${g.leaders[0]!.short}, with ${f.n(g.leaders[0]!.votes)} votes (${f.p(g.leaders[0]!.share)} of valid votes; ${f.p(g.leaders[0]!.cataloniaShare)} in Catalonia).`
                  : g.leaders.length > 1
                    ? ` The lists with most votes were ${leaders(" and ")}, tied on ${f.n(g.leaders[0]!.votes)} votes each (${f.p(g.leaders[0]!.share)} of valid votes).`
                    : ""
              }`,
              table: generalTable(
                `Votes for Congress on 29 November 2026 in ${place} and in Catalonia`,
                ["List", "Votes", `% ${place}`, "% Catalonia", "Seats"],
                "Blank votes",
                `Source: Spanish Ministry of the Interior, official results file by municipality ${general.meta.source.file}, dated ${f.date(general.meta.source.fileDate)}. Valid votes: ${f.n(general.counts.validVotes)}, including blank votes; spoilt (null) votes: ${f.n(general.counts.nullVotes)}, not counted in the percentages. Percentages computed from the official counts. Catalonia: the sum of its municipalities, without votes from residents abroad (CERA); with them, official turnout was ${f.p(g.cataloniaTurnoutWithAbroad)}. Seats are allocated by province: the last column is Catalonia's total (${g.cataloniaSeats} members of Congress).`,
              ),
            }
          : null,
    },
    municipal: {
      title: `Local election of ${dates.municipal}`,
      summary:
        small?.summary ??
        `${place} elects ${m.municipal.seats} councillors. Turnout was ${f.p(mv.turnout)} (${f.n(m.municipal.voters)} voters out of an electorate of ${f.n(m.municipal.electorate)}), against ${f.p(cataloniaMunicipalTurnout)} across Catalonia. ${
          topsTied
            ? `The lists with most votes were ${shortsOf(tops.map((row) => row.code))}, tied on ${f.n(top.votes)} votes each (${f.p(top.share)} of valid votes): ${tops.map((row) => `${row.short}, ${row.seats} ${row.seats === 1 ? "councillor" : "councillors"}`).join("; ")}.`
            : `The list with most votes was ${top.short}, with ${f.n(top.votes)} votes (${f.p(top.share)} of valid votes) and ${top.seats} ${top.seats === 1 ? "councillor" : "councillors"}.`
        }`,
      table: small?.table ?? {
        caption: `Results of the 2023 local election in ${place}`,
        headers: ["List", "Votes", "% of valid votes", "Councillors"],
        rows: municipalRows,
        footRows: [["Blank votes", f.n(m.municipal.blankVotes), f.p(mv.blankShare), ""]],
        note: `Valid votes: ${f.n(m.municipal.validVotes)}, including blank votes. Spoilt (null) votes: ${f.n(m.municipal.nullVotes)}, not counted in the percentages. Percentages computed from the official counts.`,
      },
      mayorRule:
        small?.mayorRule ??
        "Voters do not elect the mayor directly: the councillors do, at the council's first meeting. If no list leader wins an absolute majority of the councillors, the leader of the list with most votes becomes mayor (electoral law, article 196).",
      mayor: mayor ? `According to the Catalan government's register of local authorities, the mayor of ${place} is ${mayor.name}${mayorParty}, in office since ${f.date(mayor.since)}.` : null,
    },
    seats: small?.seats ?? {
      title: `How the ${m.municipal.seats} councillors were allocated`,
      md: [
        `Spanish electoral law uses the **D'Hondt method** ([LOREG, articles 163 and 180](${LOREG_URL})). Only lists with at least **5% of the valid votes** take part, which in ${place} meant ${f.n(mv.threshold)} votes; ${mv.belowThreshold === 0 ? "every list passed it" : mv.belowThreshold === 1 ? "one list fell short" : `${mv.belowThreshold} lists fell short`}. Each remaining list's votes are divided by 1, 2, 3… and the seats go to the largest quotients.`,
        ...(drawn && last
          ? [
              `The ${ORDINAL_EN(m.municipal.seats)} and last seat was decided by lot: ${shortsOf(drawn.tiedLists)} were level on the same quotient, ${f.q(last.value)} (${f.n(last.votes)} votes ÷ ${last.divisor}), and the same total votes. The law settles the first such tie by lot and later ones alternately (LOREG, article 163.1). According to the official result, the seat went to ${shortsOf(drawn.drawnBy)}.`,
            ]
          : last && nextOut
            ? [`The ${ORDINAL_EN(m.municipal.seats)} and last seat went to ${shortOf(last.code)}, with a quotient of ${f.q(last.value)} (${f.n(last.votes)} votes ÷ ${last.divisor}). The highest quotient left without a seat: ${f.q(nextOut.value)} (${shortOf(nextOut.code)}, ${f.n(nextOut.votes)} ÷ ${nextOut.divisor}).`]
            : []),
        ...(sizeOk
          ? [`The size of the council depends on population: with ${f.n(census)} residents on the register used for this election, ${place} elects ${m.municipal.seats} (LOREG, article 179).`]
          : []),
      ],
    },
    congress: {
      title: `General election of ${dates.congress} (Congress)`,
      summary: `In ${place}, ${f.n(m.congress.voters)} people voted out of an electorate of ${f.n(m.congress.electorate)}: turnout of ${f.p(congress.turnout)}, against ${f.p(congress.cataloniaTurnout)} in Catalonia. The list with most votes was ${congress.rows[0]?.short}, with ${f.p(congress.rows[0]?.share ?? 0)} of valid votes (${f.p(congress.rows[0]?.cataloniaShare ?? 0)} in Catalonia).`,
      table: regionalTable(
        congress,
        `Votes for Congress in 2023 in ${place} and in Catalonia`,
        ["List", "Votes", `% ${place}`, "% Catalonia", "Seats"],
        (n) => `Other lists (${n})`,
        "Blank votes",
        `Seats are allocated by province, not by municipality: the last column is Catalonia's total (48 members of Congress). Catalonia's figures leave out votes from residents abroad (CERA), which are counted by province and belong to no municipality; with them, official turnout in Catalonia was ${f.p(congress.cataloniaTurnoutWithAbroad)}.`,
      ),
    },
    parliament: {
      title: `Catalan Parliament election of ${dates.parliament}`,
      summary: `In ${place}, ${f.n(m.parliament.voters)} people voted out of an electorate of ${f.n(m.parliament.electorate)}: turnout of ${f.p(parliament.turnout)}, against ${f.p(parliament.cataloniaTurnout)} in Catalonia. The list with most votes was ${parliament.rows[0]?.short}, with ${f.p(parliament.rows[0]?.share ?? 0)} of valid votes (${f.p(parliament.rows[0]?.cataloniaShare ?? 0)} in Catalonia).`,
      table: regionalTable(
        parliament,
        `Votes for the Catalan Parliament in 2024 in ${place} and in Catalonia`,
        ["List", "Votes", `% ${place}`, "% Catalonia", "Seats"],
        (n) => `Other lists (${n})`,
        "Blank votes",
        `The 135 seats are allocated by province; the last column is the total. Catalonia's figures leave out votes from residents abroad (CERA); with them, official turnout was ${f.p(parliament.cataloniaTurnoutWithAbroad)}.`,
      ),
    },
    turnout: {
      title: `Turnout in ${place} and in Catalonia`,
      table: {
        caption: `Turnout in the last ${g ? "four" : "three"} elections in ${place}`,
        headers: ["Election", place, "Catalonia"],
        rows: [
          ...(g && general ? [[`General, ${f.date(general.meta.date)}`, f.p(g.turnout), f.p(g.cataloniaTurnout)]] : []),
          [`Local, ${dates.municipal}`, f.p(mv.turnout), f.p(cataloniaMunicipalTurnout)],
          [`General, ${dates.congress}`, f.p(congress.turnout), f.p(congress.cataloniaTurnout)],
          [`Catalan Parliament, ${dates.parliament}`, f.p(parliament.turnout), f.p(parliament.cataloniaTurnout)],
        ],
        footRows: [],
        note: "Voters over electorate. General and Parliament: Catalonia without the vote from abroad, so like is compared with like.",
      },
    },
    census: {
      title: "What the electoral roll (census) is",
      md: [
        `The electoral roll (_censo electoral_) lists everyone entitled to vote ([LOREG, article 31](${LOREG_URL})). It is not the population: under-18s and foreign residents without voting rights are not on it. That is why ${place} has ${f.n(m.population)} residents and had an electorate of ${f.n(m.municipal.electorate)} at the 2023 local election.`,
        "For local elections the roll also includes citizens of other EU countries, and of countries with a reciprocity treaty, who live there and have registered (article 176). In general and Catalan elections, votes from people registered abroad (CERA) are counted by province and do not appear in the municipality's figures.",
        "**Turnout** is voters divided by the electorate. Each list's percentage is of **valid votes**: votes for lists plus blank votes. Spoilt votes do not count.",
      ],
    },
    next: {
      title: "When the next local elections are",
      md: [
        `The next local elections are expected on **Sunday 23 May 2027**. The law sets them on the fourth Sunday of May every four years, and the decree calling them is issued 55 days before and published in the BOE the next day ([LOREG, article 42.3](${LOREG_URL})): 29 and 30 March 2027. It has not been published yet.`,
        `Local election results for any municipality in Catalonia since 1979: [${B2_TITLES.municipalResults.en}](${b2href("municipalResults", "en")}).`,
      ],
    },
    faqTitle: "Common questions",
    faq: [
      ...(small?.faq ?? [
        {
          question: `Which list won most votes in the 2023 local election in ${place}?`,
          answer: topsTied
            ? `${tops.map((row) => `${row.short} (${row.name})`).join(" and ")}, tied on ${f.n(top.votes)} votes each, ${f.p(top.share)} of valid votes. Of the ${m.municipal.seats} councillors, ${tops.map((row) => `${row.short} won ${row.seats}`).join(" and ")}.`
            : `${top.short} (${top.name}), with ${f.n(top.votes)} votes, ${f.p(top.share)} of valid votes, and ${top.seats} of the ${m.municipal.seats} councillors.`,
        },
        {
          question: `How many councillors does ${place} have?`,
          answer: `${m.municipal.seats}, under the scale in article 179 of the electoral law applied to the municipality's population.`,
        },
      ]),
      g && general && g.leaders.length
        ? {
            question: `Which list won most votes on 29 November in ${place}?`,
            answer: `${g.leaders.map((row) => `${row.short} (${row.name})`).join(" and ")}, with ${f.n(g.leaders[0]!.votes)} votes${g.leaders.length > 1 ? " each" : ""}, ${f.p(g.leaders[0]!.share)} of valid votes. Turnout was ${f.p(g.turnout)}. Official data from the Interior Ministry.`,
          }
        : {
            question: `When will the 29 November results for ${place} be available?`,
            answer: "When the Interior Ministry publishes the official results file by municipality; they will appear on this page. On election night, the provisional count is published by the ministry.",
          },
    ],
    siblings: {
      title: "Results in other towns",
      groups: [
        ...(sameComarca.length ? [{ label: `${m.comarca}`, links: sameComarca.map(link) }] : []),
        ...(sameProvince.length ? [{ label: `Elsewhere in the province of ${m.province}`, links: sameProvince.map(link) }] : []),
      ],
      hub: { ...hub, label: "Catalonia's largest towns and resorts, by comarca" },
      comarca,
    },
    related: { title: "Election guides", links: related },
    sources: {
      title: "Sources",
      note: `Official data read on ${dates.read}; in brackets, each dataset's last update.`,
      items: sources,
    },
  };
}
