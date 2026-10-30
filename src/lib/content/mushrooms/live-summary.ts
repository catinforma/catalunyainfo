import type { Locale } from "@/lib/i18n/config";

import { READ_AT, WINDOW_DAYS, ZONE_READINGS, type ZoneReading } from "./conditions";
import { LEVEL_LABEL, ZONES } from "./payload";

/**
 * The "this week" sentences of the mushroom report, written from the latest
 * Meteocat reading instead of by hand.
 *
 * The hand-written versions named the leading zones and quoted rainfall for
 * 1-6 October; a week later the ranking had changed (Els Ports and the
 * Pyrenees up, Ripollès down) and the page contradicted its own live map.
 * Everything here is derived from `conditions.ts`, so a refresh updates the
 * summary, the key facts and the table together. None of it says there are
 * mushrooms: only where rain has fallen.
 */

const RANK: Record<ZoneReading["level"], number> = { very: 0, favourable: 1, interesting: 2, patchy: 3, low: 4 };

const MONTHS: Record<Locale, string[]> = {
  ca: ["de gener", "de febrer", "de març", "d'abril", "de maig", "de juny", "de juliol", "d'agost", "de setembre", "d'octubre", "de novembre", "de desembre"],
  es: ["de enero", "de febrero", "de marzo", "de abril", "de mayo", "de junio", "de julio", "de agosto", "de septiembre", "de octubre", "de noviembre", "de diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

export function readDate(locale: Locale): string {
  const [year, month, day] = READ_AT.split("-").map(Number) as [number, number, number];
  const name = MONTHS[locale][month - 1] ?? "";
  return locale === "en" ? `${day} ${name} ${year}` : `${day} ${name} de ${year}`;
}

/** "25 d'octubre" / "25 de octubre" / "25 October": the reading day without the year. */
export function readDay(locale: Locale): string {
  const [, month, day] = READ_AT.split("-").map(Number) as [number, number, number];
  return `${day} ${MONTHS[locale][month - 1] ?? ""}`;
}

/** Catalan contractions before a day: "del 25" but "de l'1" and "de l'11"; likewise "al"/"a l'", "el"/"l'". */
const elided = (day: string) => /^1?1 /.test(day);
function caOf(day: string): string {
  return elided(day) ? `de l'${day}` : `del ${day}`;
}
function caAl(day: string): string {
  return elided(day) ? `a l'${day}` : `al ${day}`;
}
function caEl(day: string): string {
  return elided(day) ? `l'${day}` : `el ${day}`;
}

const zoneName = (id: string, locale: Locale) => ZONES.find((zone) => zone.id === id)?.name[locale] ?? id;

/** Google shows about 155 characters of a description. */
const DESCRIPTION_BUDGET = 155;

/**
 * The zone's first name for the snippet ("Ripollès", "Garrotxa"); the
 * four-comarca Pyrenees zone gets its own word, because its first comarca
 * alone would misdescribe it.
 */
const SHORT_NAME: Record<string, Record<Locale, string>> = {
  pirineu: { ca: "Pirineu", es: "Pirineo", en: "the Pyrenees" },
};
const shortName = (id: string, locale: Locale) => SHORT_NAME[id]?.[locale] ?? (zoneName(id, locale).split(" / ")[0] ?? id);

/**
 * The search description, rebuilt from the latest reading on every refresh:
 * it opens with the date the rain was read and names the wettest zones, so the
 * snippet says "this week" with a date rather than promising it. Zones are
 * dropped from the end until it fits. Like everything here, it is about rain,
 * not mushrooms.
 */
export function liveDescription(locale: Locale): string {
  const order = ranked();
  const day = readDay(locale);
  const build = (count: number) => {
    const names = join(order.slice(0, count).map((r) => shortName(r.id, locale)), locale);
    if (locale === "ca") return `Dades del Meteocat ${caOf(day)}: més pluja els últims ${WINDOW_DAYS} dies a ${names}. Mapa de condicions per zones, cada setmana.`;
    if (locale === "es") return `Datos de Meteocat del ${day}: más lluvia en los últimos ${WINDOW_DAYS} días en ${names}. Mapa de condiciones por zonas, cada semana.`;
    return `Meteocat data for ${day}: most rain over the last ${WINDOW_DAYS} days in ${names}. Conditions map by area, updated every week.`;
  };
  for (let count = 3; count > 1; count -= 1) {
    const text = build(count);
    if (text.length <= DESCRIPTION_BUDGET) return text;
  }
  return build(1);
}

const mm = (value: number, locale: Locale) => (locale === "en" ? String(value) : String(value).replace(".", ","));

function join(items: string[], locale: Locale): string {
  const and = locale === "en" ? "and" : locale === "es" ? "y" : "i";
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

/** Zones ordered by band, then by rainfall: the order every sentence uses. */
export function ranked(): ZoneReading[] {
  return [...ZONE_READINGS].sort((a, b) => RANK[a.level] - RANK[b.level] || b.mm - a.mm);
}

export function liveSummary(locale: Locale) {
  const order = ranked();
  const top = order.slice(0, 3);
  const second = order.slice(3, 5);
  const driest = [...ZONE_READINGS].sort((a, b) => a.mm - b.mm).slice(0, 2);
  const wettest = [...ZONE_READINGS]
    .filter((reading) => reading.wettest)
    .sort((a, b) => (b.wettest?.mm ?? 0) - (a.wettest?.mm ?? 0))[0];
  const date = readDate(locale);
  const names = (list: ZoneReading[]) => join(list.map((r) => zoneName(r.id, locale)), locale);
  const withMm = (list: ZoneReading[]) => join(list.map((r) => `${zoneName(r.id, locale)} (${mm(r.mm, locale)} mm)`), locale);

  const T = {
    ca: {
      direct: `Amb les dades del Meteocat ${caOf(date)}, les zones amb més pluja acumulada els últims ${WINDOW_DAYS} dies són ${withMm(top)}. Les més seques: ${withMm(driest)}. Bones condicions no garanteixen que hi hagi bolets.`,
      intro: `Aquesta setmana, segons les dades del Meteocat ${caOf(date)}, la pluja acumulada els últims ${WINDOW_DAYS} dies situa **${names(top)}** al capdavant de les condicions per als bolets. ${names(driest)} són les zones on ha plogut menys.`,
      facts: [
        { label: "Millors condicions", value: names(top) },
        { label: "Segon grup", value: names(second) },
        ...(wettest?.wettest ? [{ label: "Estació amb més pluja", value: `${wettest.wettest.name} — ${mm(wettest.wettest.mm, locale)} mm en ${WINDOW_DAYS} dies` }] : []),
        { label: "Període analitzat", value: `Els ${WINDOW_DAYS} dies fins ${caAl(date)}` },
        { label: "Última verificació", value: date },
      ],
      ranking: `Ordenant Catalunya per les condicions mesurades ${caEl(date)}: ${top.map((r, i) => `**${i + 1}. ${zoneName(r.id, locale)}**`).join(", ")}. Després venen ${names(second)}. On ha plogut menys: ${names(driest)}.`,
      figure: (r: ZoneReading) => `${mm(r.mm, locale)} mm de mitjana (${r.stations} estacions)`,
      reading: (r: ZoneReading) => (r.wettest ? `Màxim: ${r.wettest.name}, ${mm(r.wettest.mm, locale)} mm` : ""),
      context: "Com ha anat la temporada fins a principis d'octubre",
    },
    es: {
      direct: `Con los datos de Meteocat del ${date}, las zonas con más lluvia acumulada en los últimos ${WINDOW_DAYS} días son ${withMm(top)}. Las más secas: ${withMm(driest)}. Buenas condiciones no garantizan que haya setas.`,
      intro: `Esta semana, según los datos de Meteocat del ${date}, la lluvia acumulada en los últimos ${WINDOW_DAYS} días sitúa a **${names(top)}** a la cabeza de las condiciones para las setas. ${names(driest)} son las zonas donde menos ha llovido.`,
      facts: [
        { label: "Mejores condiciones", value: names(top) },
        { label: "Segundo grupo", value: names(second) },
        ...(wettest?.wettest ? [{ label: "Estación con más lluvia", value: `${wettest.wettest.name} — ${mm(wettest.wettest.mm, locale)} mm en ${WINDOW_DAYS} días` }] : []),
        { label: "Periodo analizado", value: `Los ${WINDOW_DAYS} días hasta el ${date}` },
        { label: "Última verificación", value: date },
      ],
      ranking: `Ordenando Cataluña por las condiciones medidas el ${date}: ${top.map((r, i) => `**${i + 1}. ${zoneName(r.id, locale)}**`).join(", ")}. Después vienen ${names(second)}. Donde menos ha llovido: ${names(driest)}.`,
      figure: (r: ZoneReading) => `${mm(r.mm, locale)} mm de media (${r.stations} estaciones)`,
      reading: (r: ZoneReading) => (r.wettest ? `Máximo: ${r.wettest.name}, ${mm(r.wettest.mm, locale)} mm` : ""),
      context: "Cómo ha ido la temporada hasta principios de octubre",
    },
    en: {
      direct: `On Meteocat's data for ${date}, the areas with the most rain over the last ${WINDOW_DAYS} days are ${withMm(top)}. The driest: ${withMm(driest)}. Good conditions do not guarantee mushrooms.`,
      intro: `This week, on Meteocat's data for ${date}, rain over the last ${WINDOW_DAYS} days puts **${names(top)}** at the top for mushroom conditions. ${names(driest)} have had the least.`,
      facts: [
        { label: "Best conditions", value: names(top) },
        { label: "Next group", value: names(second) },
        ...(wettest?.wettest ? [{ label: "Wettest station", value: `${wettest.wettest.name} — ${mm(wettest.wettest.mm, locale)} mm in ${WINDOW_DAYS} days` }] : []),
        { label: "Period", value: `The ${WINDOW_DAYS} days to ${date}` },
        { label: "Last verified", value: date },
      ],
      ranking: `Ranking Catalonia by the conditions measured on ${date}: ${top.map((r, i) => `**${i + 1}. ${zoneName(r.id, locale)}**`).join(", ")}. Next come ${names(second)}. The least rain: ${names(driest)}.`,
      figure: (r: ZoneReading) => `${mm(r.mm, locale)} mm average (${r.stations} stations)`,
      reading: (r: ZoneReading) => (r.wettest ? `Highest: ${r.wettest.name}, ${mm(r.wettest.mm, locale)} mm` : ""),
      context: "How the season went up to early October",
    },
  }[locale];

  return {
    ...T,
    tableRows: order.map((r) => [zoneName(r.id, locale), LEVEL_LABEL[r.level][locale], T.figure(r), T.reading(r)]),
  };
}
