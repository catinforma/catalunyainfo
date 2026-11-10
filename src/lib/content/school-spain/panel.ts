import { addDays, daysBetween } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

import { orderWhere } from "./body";
import { holidayName, lang } from "./i18n";
import {
  SPAIN_SCHOOL_YEAR,
  caEl,
  fullDate,
  holidaysInTerm,
  joinList,
  longSpan,
  mainLevels,
  nextBreak,
  nextSchoolDay,
  schoolDayIn,
  variesByProvince,
  weekdayDay,
} from "./logic";
import { hubRegions, pendingRegions, regionPath } from "./regions";
import type { Period, RegionCalendar } from "./types";

/**
 * The words of the `spainSchoolCalendar` panel (components/blocks/SpainSchoolCalendar.tsx),
 * in the page's language: pure, so the tests read every sentence the
 * component prints. The component only lays them out.
 */

const Y = SPAIN_SCHOOL_YEAR;

function t<T>(locale: Locale, es: T, ca: T, en: T): T {
  return locale === "ca" ? ca : locale === "en" ? en : es;
}

const SHORT_MONTHS: Record<Locale, string[]> = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"],
  ca: ["gen", "febr", "març", "abr", "maig", "juny", "jul", "ag", "set", "oct", "nov", "des"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/** "23 dic" */
function short(iso: string, locale: Locale): string {
  return `${Number(iso.slice(8, 10))} ${SHORT_MONTHS[locale][Number(iso.slice(5, 7)) - 1]}`;
}

/** "23 dic – 7 ene" */
function shortSpan(period: Period, locale: Locale): string {
  return period.from === period.to ? short(period.from, locale) : `${short(period.from, locale)} – ${short(period.to, locale)}`;
}

/** "(dentro de 43 días)", "(d'aquí a 43 dies)", "(in 43 days)". */
function inDays(n: number, locale: Locale): string {
  return t(locale, `(dentro de ${n} días)`, `(d'aquí a ${n} ${n === 1 ? "dia" : "dies"})`, `(in ${n} ${n === 1 ? "day" : "days"})`);
}

/** "el lunes 11 de enero" / "l'11" / "on Monday 11 January". */
function onDay(iso: string, locale: Locale): string {
  return t(locale, `el ${weekdayDay(iso)}`, caEl(weekdayDay(iso, locale)), `on ${weekdayDay(iso, locale)}`);
}

export function dayLine(region: RegionCalendar, iso: string, which: "today" | "tomorrow"): string {
  const L = lang(region);
  const label = which === "today" ? t(L, "Hoy", "Avui", "Today") : t(L, "Mañana", "Demà", "Tomorrow");
  const when = `${label}, ${weekdayDay(iso, L)}`;
  if (variesByProvince(region, iso)) {
    return `${when}: ${t(L, "depende de la provincia; mira la tabla por provincias.", "depèn de la província; mira la taula per províncies.", "it depends on the province; see the table by province.")}`;
  }
  const day = schoolDayIn(region, iso);
  switch (day.kind) {
    case "before":
      return t(
        L,
        `${when}: el curso aún no ha empezado; empieza el ${weekdayDay(day.start)}.`,
        `${when}: el curs encara no ha començat; comença ${onDay(day.start, L)}.`,
        `${when}: the school year has not started yet; it starts ${onDay(day.start, L)}.`,
      );
    case "weekend":
      return t(L, `${when}: no hay clase (fin de semana).`, `${when}: no hi ha classe (cap de setmana).`, `${when}: no school (weekend).`);
    case "holiday":
      return t(L, `${when}: no hay clase, es festivo (${day.name}).`, `${when}: no hi ha classe, és festiu (${day.name}).`, `${when}: no school, public holiday (${day.name}).`);
    case "nonTeaching":
      return t(
        L,
        `${when}: no hay clase, es día no lectivo (${day.reason}).`,
        `${when}: no hi ha classe, és dia no lectiu (${day.reason}).`,
        `${when}: no school, non-teaching day (${day.reason}).`,
      );
    case "christmas":
    case "easter": {
      const back = nextSchoolDay(region, day.until);
      const xmas = day.kind === "christmas";
      return t(
        L,
        `${when}: vacaciones de ${xmas ? "Navidad" : "Semana Santa"}. Se vuelve a clase el ${weekdayDay(back)}.`,
        `${when}: vacances de ${xmas ? "Nadal" : "Setmana Santa"}. Es torna a classe ${onDay(back, L)}.`,
        `${when}: ${xmas ? "Christmas" : "Easter"} holidays. School resumes ${onDay(back, L)}.`,
      );
    }
    case "break": {
      const back = nextSchoolDay(region, day.until);
      return t(
        L,
        `${when}: no hay clase (${day.name}). Se vuelve el ${weekdayDay(back)}.`,
        `${when}: no hi ha classe (${day.name}). Es torna ${onDay(back, L)}.`,
        `${when}: no school (${day.name}). School resumes ${onDay(back, L)}.`,
      );
    }
    case "summer":
      return t(L, `${when}: el curso ${Y} ya ha terminado.`, `${when}: el curs ${Y} ja s'ha acabat.`, `${when}: the ${Y} school year is over.`);
    default:
      return t(L, `${when}: día lectivo ${region.inName}.`, `${when}: dia lectiu ${region.inName}.`, `${when}: school day ${region.inName}.`);
  }
}

export interface RegionPanel {
  label: string;
  today: string;
  tomorrow: string;
  nextOff: string | null;
  nextLine: string | null;
  note: string;
  caption: string;
  headers: [string, string];
  rows: [string, string][];
  sourceLabel: string;
  sourceName: string;
  sourceUrl: string;
  sourceWhere: string;
}

/** Everything one community's panel says on `today`. */
export function regionPanel(region: RegionCalendar, today: string): RegionPanel {
  const L = lang(region);
  const { start, end } = mainLevels(region);
  const main = region.levels[0]!;
  const next = nextBreak(region, today);
  let nextLine: string | null = null;
  if (next && next.kind !== "summer") {
    const name =
      next.kind === "break" ? next.period.name : next.kind === "christmas" ? t(L, "Navidad", "Nadal", "Christmas") : t(L, "Semana Santa", "Setmana Santa", "Easter");
    const minimum = next.kind !== "break" && next.period.minimum ? t(L, ", como mínimo", ", com a mínim", ", at least") : "";
    const span = L === "en" ? `from ${longSpan(next.period, L)}` : longSpan(next.period, L);
    nextLine = `${t(L, "Próximas vacaciones", "Properes vacances", "Next holidays")}: ${name}, ${span}${minimum} ${inDays(daysBetween(today, next.period.from), L)}.`;
  } else if (next?.kind === "summer" && today >= start) {
    const label = t(L, "Último día de clase", "Últim dia de classe", "Last day of class");
    nextLine = main.endText ? `${label}: ${main.endText}.` : `${label}: ${fullDate(end, L)} ${inDays(daysBetween(today, end), L)}.`;
  }
  // The next weekday off for everyone in the community before that break.
  const limit = next ? (next.kind === "summer" ? next.from : next.period.from) : today;
  const offDays = [
    ...holidaysInTerm(region).map((h) => ({ date: h.date, why: holidayName(h.name, L) })),
    ...region.nonTeaching.filter((d) => !d.partial).map((d) => ({ date: d.date, why: d.reason })),
  ]
    .filter((d) => d.date > addDays(today, 1) && d.date < limit)
    .sort((a, b) => a.date.localeCompare(b.date));
  const off = offDays[0];
  const nextOff = off
    ? `${t(L, "Próximo día laborable sin clase en toda la comunidad", "Proper dia feiner sense classe a tota la comunitat", "Next weekday without class across the region")}: ${weekdayDay(off.date, L)} (${off.why}).`
    : null;

  const min = t(L, " (mínimo)", " (mínim)", " (minimum)");
  const rows: [string, string][] = [
    [`${t(L, "Inicio de curso", "Inici de curs", "Start of the school year")} (${main.levels})`, main.startText ?? fullDate(start, L)],
    [`${t(L, "Vacaciones de Navidad", "Vacances de Nadal", "Christmas holidays")}${region.christmas.minimum ? min : ""}`, region.christmas.label ?? longSpan(region.christmas, L)],
    ...region.otherBreaks.filter((b) => b.from < region.easter.from).map((b) => [b.name, longSpan(b, L)] as [string, string]),
    [`${t(L, "Vacaciones de Semana Santa", "Vacances de Setmana Santa", "Easter holidays")}${region.easter.minimum ? min : ""}`, region.easter.label ?? longSpan(region.easter, L)],
    ...region.otherBreaks.filter((b) => b.from > region.easter.from).map((b) => [b.name, longSpan(b, L)] as [string, string]),
    [`${t(L, "Fin de curso", "Final de curs", "End of the school year")} (${main.levels})`, main.endText ?? fullDate(end, L)],
  ];
  const caption = t(L, `Calendario escolar ${Y} ${region.inName}`, `Calendari escolar ${Y} ${region.inName}`, `School calendar ${Y} ${region.inName}`);
  return {
    label: caption,
    today: dayLine(region, today, "today"),
    tomorrow: dayLine(region, addDays(today, 1), "tomorrow"),
    nextOff,
    nextLine,
    note: region.flexible
      ? t(
          L,
          "Límites y mínimos que fija la comunidad: cada centro aprueba su propio calendario dentro de ellos, con sus fiestas locales y sus días no lectivos.",
          "Límits i mínims que fixa la comunitat: cada centre aprova el seu propi calendari dins d'aquests límits, amb les seves festes locals i els seus dies no lectius.",
          "Limits and minimums set by the region: each school approves its own calendar within them, with its local holidays and non-teaching days.",
        )
      : t(
          L,
          "Calendario general de la comunidad. No cuenta las fiestas locales de cada municipio ni los días que puedan fijar el ayuntamiento o el propio centro.",
          "Calendari general de la comunitat. No compta les festes locals de cada municipi ni els dies que puguin fixar l'ajuntament o el mateix centre.",
          "The region's general calendar. It does not count each municipality's local holidays or the days the town council or the school itself may set.",
        ),
    caption,
    headers: t(L, ["Qué", "Fecha"], ["Què", "Data"], ["What", "Date"]),
    rows,
    sourceLabel: t(L, "Fuente:", "Font:", "Source:"),
    sourceName: region.order.short,
    sourceUrl: region.order.url,
    sourceWhere: orderWhere(region.order, L),
  };
}

export interface HubPanel {
  label: string;
  lead: string | null;
  leadNote: string;
  caption: string;
  headers: string[];
  rows: { key: string; name: string; href: string | null; suffix: string; cells: string[] }[];
  footnote: string;
}

/** The hub's panel: the next break to start, and every community's dates. */
export function hubPanel(locale: Locale, today: string): HubPanel {
  const L = locale;
  const regions = hubRegions(L);
  const pending = pendingRegions(L);
  const christmas = t(L, "Navidad", "Nadal", "Christmas");
  const easter = t(L, "Semana Santa", "Setmana Santa", "Easter");
  // The next Christmas or Easter break to start, and where it starts first.
  const upcoming = regions
    .flatMap((r) => [
      { r, kind: christmas, period: r.christmas },
      { r, kind: easter, period: r.easter },
    ])
    .filter((x) => x.period.from > today)
    .sort((a, b) => a.period.from.localeCompare(b.period.from));
  const first = upcoming[0];
  let lead: string | null = null;
  if (first) {
    const firstNames = joinList(upcoming.filter((x) => x.kind === first.kind && x.period.from === first.period.from).map((x) => x.r.short), L);
    const sameKind = upcoming.filter((x) => x.kind === first.kind);
    const last = sameKind.at(-1);
    const lastNames = last ? joinList(sameKind.filter((x) => x.period.from === last.period.from).map((x) => x.r.short), L) : "";
    const n = daysBetween(today, first.period.from);
    const tail = last && last.period.from !== first.period.from;
    lead = t(
      L,
      `Vacaciones de ${first.kind}: las primeras empiezan el ${weekdayDay(first.period.from)} en ${firstNames} ${inDays(n, L)}${tail ? `, y las últimas el ${weekdayDay(last.period.from)} en ${lastNames}` : ""}.`,
      `Vacances de ${first.kind}: les primeres comencen ${caEl(weekdayDay(first.period.from, L))} ${inDays(n, L)} a ${firstNames}${tail ? `, i les últimes, ${caEl(weekdayDay(last.period.from, L))} a ${lastNames}` : ""}.`,
      `${first.kind} holidays: the first start on ${weekdayDay(first.period.from, L)} ${inDays(n, L)} in ${firstNames}${tail ? `, and the last on ${weekdayDay(last.period.from, L)} in ${lastNames}` : ""}.`,
    );
  }
  const from = t(L, "desde", "des del", "from");
  const until = t(L, "hasta", "fins al", "until");
  return {
    label: t(L, `Calendario escolar ${Y} por comunidades`, `Calendari escolar ${Y} per comunitats`, `School calendar ${Y} by region`),
    lead,
    leadNote: t(
      L,
      "Primer y último día sin clase, ambos incluidos, en Infantil y Primaria. Sin contar fines de semana previos, fiestas locales ni días que fije cada municipio o centro.",
      "Primer i últim dia sense classe, tots dos inclosos, a Infantil i Primària. Sense comptar caps de setmana previs, festes locals ni dies que fixi cada municipi o centre.",
      "First and last day without class, both included, in Infant and Primary. Not counting the weekend before, local holidays or days set by each municipality or school.",
    ),
    caption: t(L, `Calendario escolar ${Y} por comunidades`, `Calendari escolar ${Y} per comunitats`, `School calendar ${Y} by region`),
    headers: t(
      L,
      ["Comunidad", "Inicio", "Navidad", "Otras vacaciones", "Semana Santa", "Fin de curso"],
      ["Comunitat", "Inici", "Nadal", "Altres vacances", "Setmana Santa", "Final de curs"],
      ["Region", "Start", "Christmas", "Other breaks", "Easter", "End of term"],
    ),
    rows: [
      ...regions.map((r) => {
        const { start, end } = mainLevels(r);
        const main = r.levels[0]!;
        return {
          key: r.slug,
          name: r.short,
          href: `/${L}/${regionPath(r.slug, L)}/`,
          suffix: r.provinces?.length ? t(L, " (por provincias)", " (per províncies)", " (by province)") : "",
          cells: [
            main.startLatest ? `${short(start, L)} – ${short(main.startLatest, L)}*` : main.startText ? `${from} ${short(start, L)}*` : short(start, L),
            `${r.christmas.labelShort ?? shortSpan(r.christmas, L)}${r.christmas.minimum ? "*" : ""}`,
            r.otherBreaks.length ? r.otherBreaks.map((b) => `${b.name}: ${shortSpan(b, L)}`).join("; ") : (r.hubOther ?? "—"),
            `${r.easter.labelShort ?? shortSpan(r.easter, L)}${r.easter.minimum ? "*" : ""}`,
            main.endEarliest ? `${short(main.endEarliest, L)} – ${short(end, L)}*` : main.endText ? `${until} ${short(end, L)}*` : short(end, L),
          ],
        };
      }),
      ...pending.map((p) => ({ key: p.slug, name: p.short, href: null, suffix: "", cells: [t(L, "por confirmar", "per confirmar", "to be confirmed")] })),
    ],
    footnote: t(
      L,
      `Fechas de Infantil y Primaria, del primer al último día sin clase en cada periodo de vacaciones, según la orden o resolución de cada comunidad para el curso ${Y}; ESO, Bachillerato y FP pueden empezar o terminar otro día: está en la página de cada comunidad. * Navarra y País Vasco: márgenes y mínimos; cada centro fija sus días.`,
      `Dates d'Infantil i Primària, del primer a l'últim dia sense classe de cada període de vacances, segons l'ordre o resolució de cada comunitat per al curs ${Y}; ESO, Batxillerat i FP poden començar o acabar un altre dia: és a la pàgina de cada comunitat. * Navarra i País Basc: marges i mínims; cada centre fixa els seus dies.`,
      `Infant and Primary dates, from the first to the last day without class in each holiday period, according to each region's order or resolution for ${Y}; ESO, Bachillerato and vocational training may start or end on another day: see each region's page. * Navarre and the Basque Country: margins and minimums; each school sets its own days.`,
    ),
  };
}
