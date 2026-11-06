import type { Plan } from "@/lib/content/holidays/bridges";
import { dayMonth, dayMonthYear, dayPair, weekdayName } from "@/lib/programmatic/holidays/format";
import { joinList } from "@/lib/programmatic/holidays/names";

import { YEAR, dayCount } from "./calendar";
import { CITIES_AS_OF, INE_POPULATION, type LocalDay, type LocalList } from "./cities-data";
import {
  expectedMonth,
  holidayCount,
  isZoned,
  islandDay,
  local2027,
  localDays,
  localRuns,
  planForLocal,
  sharedWith,
  shortName,
  weekendLocalDays,
  type City,
} from "./cities";
import { DESCRIPTION_LIMIT, TITLE_LIMIT, compactDates, rangeWords, runLine, weekdayDate, type Faq } from "./copy";
import { SOURCES } from "./sources";

/**
 * Spanish words for the city pages. Every date, name and number comes from
 * `cities-data.ts` (the bulletins), `calendar.ts` (the BOE) or `cities.ts`
 * (computed from both); nothing here states a fact of its own.
 */

const POP = new Intl.NumberFormat("es-ES");

/** "689.423". */
export function population(c: City): string {
  return POP.format(c.population);
}

/** Communities with a single province, where "capital de la provincia" would read oddly. */
const ONE_PROVINCE = new Set(["AS", "IB", "MC", "RI", "CB", "MD", "NC"]);

/** "capital de la provincia de Cádiz", "capital del Principado de Asturias", "en la provincia de Málaga", "en el Principado de Asturias". */
export function placeWords(c: City): string {
  const one = ONE_PROVINCE.has(c.region);
  if (c.capital) return one ? `capital ${c.community.de}` : `capital de la provincia de ${c.province}`;
  const island = c.island ? `, en ${c.island === "Lanzarote y La Graciosa" ? "Lanzarote" : c.island}` : "";
  return one ? `${c.community.en}${island}` : `en la provincia de ${c.province}${island}`;
}

/** "Martes de Carnaval", or "fiesta local" where the bulletin gives no name. */
export function localName(d: LocalDay): string {
  return d.name ?? "Fiesta local";
}

function withName(d: LocalDay): string {
  return d.name ? `el ${weekdayDate(d.date)} (${d.name})` : `el ${weekdayDate(d.date)}`;
}

/** "9 feb y 24 jun", "20 y 26 jul". */
function abbrPair(a: string, b: string): string {
  if (a.slice(0, 7) === b.slice(0, 7)) return compactDates([a, b]);
  return `${compactDates([a])} y ${compactDates([b])}`;
}

/** "15 de octubre de 2026" → "octubre de 2026": the month the 2027 list is expected, from the 2026 one. */
export function expectedWords(c: City): string | null {
  const month = expectedMonth(c.region);
  if (!month) return null;
  return dayMonthYear(`${month}-01`, "es").replace(/^1 de /, "").replace(/ de \d{4}$/, "");
}

/* ------------------------------------------------------------- Metadata --- */

export function cityTitle(c: City): string {
  const days = localDays(c);
  if (local2027(c) && !isZoned(c) && days.length === 2) {
    const [a, b] = [days[0]!.date, days[1]!.date];
    const candidates = [
      `Festivos locales ${c.name} ${YEAR}: ${dayPair(a, b, "es")}`,
      `Festivos locales ${shortName(c)} ${YEAR}: ${dayPair(a, b, "es")}`,
      `Festivos locales ${shortName(c)} ${YEAR}: ${abbrPair(a, b)}`,
      `Festivos ${shortName(c)} ${YEAR}: ${abbrPair(a, b)}`,
    ];
    const fit = candidates.find((t) => t.length <= TITLE_LIMIT);
    if (fit) return fit;
  }
  const generic = [`Calendario laboral ${c.name} ${YEAR}: festivos`, `Calendario laboral ${shortName(c)} ${YEAR}: festivos`];
  return generic.find((t) => t.length <= TITLE_LIMIT) ?? generic[1]!;
}

export function cityH1(c: City): string {
  return `Calendario laboral ${c.name} ${YEAR}: festivos locales y puentes`;
}

/** The bulletin as the reader knows it: "BOJA núm. 210, de 29.10.2026" → "BOJA". */
function bulletinAbbr(list: LocalList): string {
  return list.source.ref.split(/\s/)[0] ?? list.source.ref;
}

export function cityDescription(c: City): string {
  const list = local2027(c);
  const total = holidayCount(c);
  if (list) {
    const days = localDays(c);
    const head = isZoned(c)
      ? `Fiestas locales de ${c.name} en ${YEAR} por zonas, según el ${bulletinAbbr(list)}: ${compactDates(days.map((d) => d.date))} y más.`
      : `Fiestas locales de ${c.name} en ${YEAR}: ${joinList(days.map((d) => weekdayDate(d.date)), "es")} (${bulletinAbbr(list)}).`;
    const full = `${head} Con ellas, ${total} festivos en ${YEAR}; puentes y calendario laboral.`;
    if (full.length <= DESCRIPTION_LIMIT) return full;
    const mid = `${head} Con ellas, ${total} festivos en ${YEAR}.`;
    return mid.length <= DESCRIPTION_LIMIT ? mid : head;
  }
  const regional = dayCount(c.region) + (islandDay(c) ? 1 : 0);
  const last = c.local2026 ? ` En 2026 fueron el ${dayPair(c.local2026.days[0]!.date, c.local2026.days[1]!.date, "es")}.` : "";
  const full = `Calendario laboral ${YEAR} de ${c.name}: los ${regional} festivos ${c.community.de} y el estado de sus 2 fiestas locales, aún sin publicar.${last}`;
  return full.length <= DESCRIPTION_LIMIT ? full : `Calendario laboral ${YEAR} de ${c.name}: los ${regional} festivos ${c.community.de}; sus fiestas locales, aún sin publicar.`;
}

/* ---------------------------------------------------------------- Intro --- */

/** What a local day does to the week: a long weekend, a bridge, nothing on a Saturday. */
export function planWords(c: City, d: LocalDay): string {
  const w = weekdayName(d.date, "es");
  if (w === "sábado" || w === "domingo") return `cae en fin de semana y no da un día libre más de lunes a viernes`;
  const plan = planForLocal(c, d.date);
  if (!plan) return `cae en ${w}`;
  if (plan.take.length === 0) return plan.days >= 3 ? `da un fin de semana largo de ${plan.days} días` : `cae en ${w}`;
  const leave = plan.take.length === 1 ? "1 día de vacaciones" : `${plan.take.length} días de vacaciones`;
  return `deja un puente de ${plan.days} días con ${leave} (${joinList(plan.take.map(weekdayDate), "es")})`;
}

/**
 * The first paragraph, made of the city's own facts only: size and place,
 * the two days and their names, the bulletin, the total, what each day does
 * to the week. No two cities share it.
 */
export function cityLead(c: City): string {
  const who = `${c.name} (${population(c)} habitantes, ${placeWords(c)})`;
  const list = local2027(c);
  const regional = dayCount(c.region);
  const island = islandDay(c);
  const base = island
    ? `los ${regional} festivos ${c.community.de} y la fiesta insular de ${island.place} (${weekdayDate(island.date)})`
    : `los ${regional} festivos ${c.community.de}`;
  if (list && !isZoned(c)) {
    const days = localDays(c);
    const effects = days.map((d) => `el ${weekdayDate(d.date)} ${planWords(c, d)}`);
    return (
      `${who} tiene en ${YEAR} estas 2 fiestas locales: ${joinList(days.map(withName), "es")}. ` +
      `Las publica el ${list.source.ref}. Sumadas a ${base}, son ${holidayCount(c)} días festivos en ${YEAR}. ` +
      `${capitalise(joinList(effects, "es"))}.${sharedLine(c)}`
    );
  }
  if (list) {
    const zones = list.zones ?? [];
    const parts = [`${list.mainArea ?? c.name}: ${joinList(localDays(c).map(withName), "es")}`, ...zones.map((z) => `${z.place}: ${joinList(z.days.map(withName), "es")}`)];
    return (
      `${who} no tiene las mismas fiestas locales en todo el término en ${YEAR}; el ${list.source.ref} las da por zonas. ` +
      `${parts.join(". ")}. Sumadas a ${base}, son ${holidayCount(c)} días festivos en cada zona.`
    );
  }
  return `${pendingLine(c)} ${capitalise(base)} ya son oficiales (BOE de 13 de octubre de 2026); ${c.name} tiene ${population(c)} habitantes y ${c.capital ? "es" : "está"} ${placeWords(c)}.`;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** " El 8 de septiembre también es fiesta local en Huelva, Mijas y Utrera.": the cities of the community sharing a day (up to 4 named). */
export function sharedLine(c: City): string {
  return localDays(c)
    .map((d) => {
      const others = sharedWith(c, d.date);
      if (others.length === 0) return "";
      const shown = others.slice(0, 4).map((x) => x.name);
      const rest = others.length - shown.length;
      return ` El ${dayMonth(d.date, "es")} también es fiesta local en ${rest > 0 ? `${shown.join(", ")} y ${rest} ${rest === 1 ? "ciudad" : "ciudades"} más` : joinList(shown, "es")}.`;
    })
    .join("");
}

/**
 * For a city without its 2027 days, in the words the page must use: they are
 * not out, when and where they are expected (from the 2026 precedent), what
 * the list says when it leaves the city out, and what 2026 had.
 */
export function pendingLine(c: City): string {
  const bulletin = SOURCES[c.region].local.bulletinShort;
  const when = expectedWords(c);
  const status =
    c.status2027 === "missing"
      ? `Las fiestas locales de ${YEAR} de ${c.name} aún no se han publicado. ${c.note ?? ""}`.trim()
      : `Las fiestas locales de ${YEAR} de ${c.name} aún no se han publicado; se esperan en ${when ?? "las próximas semanas"} en ${bulletin}.`;
  const last = c.local2026 ? ` En 2026 fueron ${joinList(c.local2026.days.map((d) => `el ${dayMonth(d.date, "es")}${d.name ? ` (${d.name})` : ""}`), "es")}.` : "";
  return `${status}${last}`;
}

/* ------------------------------------------------------------------ FAQ --- */

export function cityFaq(c: City): Faq[] {
  const list = local2027(c);
  const total = holidayCount(c);
  const regional = dayCount(c.region);
  const island = islandDay(c);
  const islandWords = island ? `, la fiesta insular de ${island.place}` : "";
  if (list) {
    const days = localDays(c);
    const answer = isZoned(c)
      ? `Van por zonas. ${list.mainArea}: ${joinList(days.map(withName), "es")}. ${(list.zones ?? []).map((z) => `${z.place}: ${joinList(z.days.map(withName), "es")}.`).join(" ")}`
      : `${capitalise(joinList(days.map(withName), "es"))}.`;
    const faq: Faq[] = [
      {
        question: `¿Cuáles son los festivos locales de ${c.name} en ${YEAR}?`,
        answer: `${answer} Fuente: ${list.source.ref}.`,
      },
      ...days.map((d) => ({
        question: `¿Es festivo el ${weekdayDate(d.date)} de ${YEAR} en ${c.name}?`,
        answer:
          `Sí. Es fiesta local en ${c.name}${d.name ? ` (${d.name})` : ""}${d.note ? `, ${d.note}` : ""}, no un festivo de toda la comunidad. ` +
          `${capitalise(planWords(c, d))}.`,
      })),
      {
        question: `¿Cuántos festivos tiene ${c.name} en ${YEAR}?`,
        answer:
          `${total}: los ${regional} festivos ${c.community.de} que publica el BOE${islandWords} y las 2 fiestas locales.` +
          (weekendLocalDays(c).length ? ` ${weekendLocalDays(c).length === 1 ? "Una de ellas cae" : "Dos caen"} en fin de semana.` : ""),
      },
      {
        question: `¿Qué puentes dan las fiestas locales de ${c.name} en ${YEAR}?`,
        answer: localRuns(c).length
          ? `${localRuns(c).map(runLine).join(". ")}. Cálculo de CatalunyaInfo para una semana de lunes a viernes.`
          : `Ninguno: ${joinList(days.map((d) => `el ${weekdayDate(d.date)} ${planWords(c, d)}`), "es")}.`,
      },
    ];
    return faq;
  }
  return [
    { question: `¿Se conocen ya los festivos locales de ${YEAR} de ${c.name}?`, answer: `No. ${pendingLine(c)}` },
    {
      question: `¿Cuántos festivos tiene ${c.name} en ${YEAR}?`,
      answer: `${regional + (island ? 1 : 0)} ya son oficiales: los ${regional} ${c.community.de} que publica el BOE${islandWords}. A ellos se sumarán las 2 fiestas locales cuando se publiquen.`,
    },
    ...(c.local2026
      ? [
          {
            question: `¿Qué días fueron festivo local en ${c.name} en 2026?`,
            answer: `${capitalise(joinList(c.local2026.days.map(withName), "es"))}, según ${c.local2026.source.title} (${c.local2026.source.ref}). Sirven de referencia, no valen para ${YEAR}.`,
          },
        ]
      : []),
  ];
}

/* ---------------------------------------------------------- List lines --- */

/** For the community page and the hub: "14 abr y 27 may", or the 2026 days, labelled. */
export function cityListLine(c: City): string {
  if (local2027(c)) return `${compactDates(localDays(c).map((d) => d.date))}${isZoned(c) ? "; por zonas" : ""}`;
  return c.local2026 ? `Pendiente (2026: ${compactDates(c.local2026.days.map((d) => d.date))})` : "Pendiente";
}

/** The run in words, for the bridges section. */
export function cityRunLine(run: Plan): string {
  return runLine(run);
}

export function populationSourceLine(c: City): string {
  return `Población: ${population(c)} habitantes a ${dayMonthYear(INE_POPULATION.asOf, "es")} (INE; ${INE_POPULATION.title.split(",")[0]}).`;
}

export function asOfLine(): string {
  return `Fiestas locales leídas el ${dayMonthYear(CITIES_AS_OF, "es")} en los boletines oficiales.`;
}

export { rangeWords };
