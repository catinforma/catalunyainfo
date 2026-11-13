import type { Block } from "@/lib/content/blocks";
import { weekdayIndex } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";
import { communityPath, spainHubPath } from "@/lib/programmatic/spain-2027/paths";

import { BOE_2026, BOE_2027 } from "./holidays";
import { holidayName, lang } from "./i18n";
import {
  SPAIN_SCHOOL_YEAR,
  alternatives,
  between,
  breakDays,
  breakDaysAll,
  lastClassBefore,
  type BreakDays,
  type BreakKind,
  caEl,
  cap,
  dayMonth,
  fullDate,
  holidaysInTerm,
  joinList,
  breakName,
  longSpan,
  mainLevels,
  nextSchoolDay,
  provinceCalendars,
  schoolDayIn,
  span,
  theOrder,
  weekdayDay,
} from "./logic";
import { CATALONIA, HUB_PATH, HUB_PATHS, SPAIN_REGIONS, hubRegions, pendingRegions, regionPath } from "./regions";
import type { LevelDates, Period, RegionCalendar, SchoolOrder } from "./types";

/**
 * Bodies of the Spanish school-calendar pages: one per community and the hub,
 * in Spanish, Catalan and English. Pure (no database, no server-only), so the
 * tests build every page.
 *
 * Every sentence is computed from the region's record, which is transcribed
 * from its order; nothing here states a date of its own. The language is the
 * record's (`localizeRegion`): each builder holds the three wordings side by
 * side. The Catalan and English editions leave out the links to the 2027 work
 * calendar pages, which exist only in Spanish.
 */

const href = (path: string, locale: Locale = "es") => `/${locale}/${path}/`;

/** The wording for the page's language. */
function t<T>(locale: Locale, es: T, ca: T, en: T): T {
  return locale === "ca" ? ca : locale === "en" ? en : es;
}

const Y = SPAIN_SCHOOL_YEAR;

/**
 * The communities grouped by the day one of the three falls on, earliest
 * first. A region whose provinces disagree appears once per day, with them:
 * "Andalucía (Sevilla)". A region whose text sets only a minimum carries
 * `minimumNote`.
 */
function dayGroups(regions: RegionCalendar[], kind: BreakKind, pick: keyof BreakDays, minimumNote: string): { date: string; names: string[] }[] {
  const L = regions[0] ? lang(regions[0]) : "es";
  const entries: { date: string; name: string }[] = [];
  for (const r of regions) {
    const all = breakDaysAll(r, kind);
    const byDate = new Map<string, string[]>();
    for (const { name, days } of all) byDate.set(days[pick], [...(byDate.get(days[pick]) ?? []), name ?? r.short]);
    const suffix = r[kind].minimum ? ` (${minimumNote})` : "";
    if (byDate.size === 1) entries.push({ date: [...byDate.keys()][0]!, name: `${r.short}${suffix}` });
    else for (const [date, names] of byDate) entries.push({ date, name: `${r.short} (${joinList(names, L)})` });
  }
  const groups = new Map<string, string[]>();
  for (const e of entries) groups.set(e.date, [...(groups.get(e.date) ?? []), e.name]);
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, names]) => ({ date, names }));
}

/** "el lunes 21 de diciembre en Cataluña y Galicia; el martes 22 de diciembre en ..." */
function groupsInWords(groups: { date: string; names: string[] }[], locale: Locale): string {
  return groups
    .map((g) =>
      t(
        locale,
        `el ${weekdayDay(g.date)} en ${joinList(g.names)}`,
        `${caEl(weekdayDay(g.date, locale))} a ${joinList(g.names, locale)}`,
        `on ${weekdayDay(g.date, locale)} in ${joinList(g.names, locale)}`,
      ),
    )
    .join("; ");
}

/** "las 17 comunidades, Ceuta y Melilla" while none is pending. */
function scopeWords(locale: Locale): string {
  const pendingList = pendingRegions(locale);
  if (pendingList.length === 0) return t(locale, "las 17 comunidades, Ceuta y Melilla", "les 17 comunitats, Ceuta i Melilla", "all 17 regions, Ceuta and Melilla");
  return t(locale, "las comunidades y ciudades autónomas", "les comunitats i ciutats autònomes", "the regions and autonomous cities");
}

/**
 * Spain at Christmas in one sentence, for Catalonia's own guide: the days the
 * last class falls on across the country and the window of return, with the
 * link to the table. Computed from the same records as the hub.
 */
export function spainChristmasLine(locale: Locale): string {
  const regions = hubRegions(locale);
  const all = regions.flatMap((r) => breakDaysAll(r, "christmas").map((x) => x.days));
  const lasts = alternatives(all.map((d) => d.last), locale);
  const backs = all.map((d) => d.back).sort();
  const window = between(backs[0]!, backs.at(-1)!, locale);
  const year = regions[0]!.christmas.from.slice(0, 4);
  return t(
    locale,
    `En el resto de España, el último día de clase antes de Navidad es el ${lasts}, según la comunidad, y se vuelve ${window}: las fechas de ${scopeWords(locale)}, con la orden de cada una, están en [vacaciones de Navidad ${year} por comunidades](${href(HUB_PATH)}).`,
    `A la resta d'Espanya, l'últim dia de classe abans de Nadal és ${caEl(lasts)}, segons la comunitat, i es torna ${window}: les dates de ${scopeWords(locale)}, amb el text oficial de cadascuna, són a [vacances de Nadal ${year} per comunitats](${href(HUB_PATHS.ca, "ca")}).`,
    `Elsewhere in Spain, the last day of class before Christmas is ${lasts}, depending on the region, and school resumes ${window}: the dates for ${scopeWords(locale)}, each with its official text, are in [Christmas ${year} school holidays by region](${href(HUB_PATHS.en, "en")}).`,
  );
}

/** "BOCM núm. 131, 4 de junio de 2026" / "web del Ministerio de Educación"; "BOCM no. 131, 4 June 2026". */
export function orderWhere(order: SchoolOrder, locale: Locale = "es"): string {
  if (locale === "en") {
    const date = order.date ? `, ${dayMonth(order.date, locale)} ${order.date.slice(0, 4)}` : "";
    return `${order.bulletin}${order.number ? ` no. ${order.number}` : ""}${date}`;
  }
  const date = order.date ? `, ${dayMonth(order.date, locale)} de ${order.date.slice(0, 4)}` : "";
  return `${order.bulletin}${order.number ? ` núm. ${order.number}` : ""}${date}`;
}

function orderLink(region: RegionCalendar): string {
  return `[${region.order.short}](${region.order.url}) (${orderWhere(region.order, lang(region))})`;
}

/** "el viernes 18 de junio de 2027" or the window: "entre el 18 y el 22 de junio de 2027, según el centro". */
function startWords(level: LevelDates, locale: Locale = "es"): string {
  return level.startText ?? (level.start ? `${t(locale, "el", "el", "on")} ${fullDate(level.start, locale)}` : "—");
}

function endWords(level: LevelDates, locale: Locale = "es"): string {
  return level.endText ?? (level.end ? `${t(locale, "el", "el", "on")} ${fullDate(level.end, locale)}` : "—");
}

/** The short name after "de", with its article where Spanish needs one. */
const DE_SHORT: Record<string, string> = { PV: "del País Vasco", VC: "de la Comunidad Valenciana" };

/** "Calendario escolar 2026-2027 de Madrid: vacaciones de Navidad, Semana Santa y fin de curso". */
export function regionTitle(region: RegionCalendar): string {
  return t(
    lang(region),
    `Calendario escolar ${Y} ${DE_SHORT[region.boe] ?? `de ${region.short}`}: vacaciones de Navidad, Semana Santa y fin de curso`,
    `Calendari escolar ${Y} ${region.deShort ?? region.deName}: vacances de Nadal, Setmana Santa i final de curs`,
    `${region.short} school calendar ${Y}: Christmas holidays, Easter and end of term`,
  );
}

/** Stored fallback title (the rendered one is live: logic.ts liveRegionTitle). */
export function regionSeoTitle(region: RegionCalendar): string {
  return t(
    lang(region),
    `Calendario escolar ${Y} ${region.short}: Navidad y Semana Santa`,
    `Calendari escolar ${Y} ${region.short}: Nadal i Setmana Santa`,
    `${region.short} school calendar ${Y}: Christmas and Easter`,
  );
}

export function regionExcerpt(region: RegionCalendar): string {
  const L = lang(region);
  const { start, end } = mainLevels(region);
  const main = region.levels[0]!;
  const c = region.christmas.label ?? span(region.christmas, L);
  const e = span(region.easter, L);
  if (L === "ca") {
    const ends = main.endEarliest ? `entre ${caEl(dayMonth(main.endEarliest, L))} i ${caEl(dayMonth(end, L))}` : caEl(dayMonth(end, L));
    return `Curs ${Y} ${region.inName}: comença ${caEl(dayMonth(start, L))}, Nadal ${c}, Setmana Santa ${e} i acaba ${ends}, segons el text oficial.`;
  }
  if (L === "en") {
    const ends = main.endEarliest ? `between ${dayMonth(main.endEarliest, L)} and ${dayMonth(end, L)}` : `on ${dayMonth(end, L)}`;
    return `${Y} school year ${region.inName}: starts on ${dayMonth(start, L)}, Christmas from ${c}, Easter from ${e} and ends ${ends}, according to the official text.`;
  }
  const ends = main.endEarliest ? `entre el ${dayMonth(main.endEarliest)} y el ${dayMonth(end)}` : `el ${dayMonth(end)}`;
  return `Curso ${Y} ${region.inName}: empieza el ${dayMonth(start)}, Navidad ${c}, Semana Santa ${e} y termina ${ends}, según la orden oficial.`;
}

/**
 * The Christmas answer, first and in bold, in the words people search:
 * "Vacaciones de Navidad 2026-27 en Madrid: del ... al ... (vuelta a clase el
 * ...)", then the last day of class. Where the provinces differ (Andalucía),
 * the return in each; where the text sets only a minimum (País Vasco), says so.
 */
function christmasLead(region: RegionCalendar): string {
  const L = lang(region);
  const c = region.christmas;
  const years = `${c.from.slice(0, 4)}-${c.to.slice(2, 4)}`;
  const { last, back } = breakDays(region, "christmas");
  const name = t(L, `Vacaciones de Navidad ${years} ${region.inName}`, `Vacances de Nadal ${years} ${region.inName}`, `Christmas holidays ${years} ${region.inName}`);
  if (c.label) {
    const groups = new Map<string, string[]>();
    for (const { name: province, days } of breakDaysAll(region, "christmas")) groups.set(days.back, [...(groups.get(days.back) ?? []), province ?? region.short]);
    const backs = groupsInWords(
      [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, names]) => ({ date, names })),
      L,
    );
    const pend = region.pendingProvinces?.length ? ` ${joinList(region.pendingProvinces, L)}: ${pending(L)}.` : "";
    return t(
      L,
      `**${name}: ${c.label}**. Vuelta a clase: ${backs}.${pend} `,
      `**${name}: ${c.label}**. Tornada a classe: ${backs}.${pend} `,
      `**${name}: from ${c.label}**. Back to school: ${backs}.${pend} `,
    );
  }
  if (c.minimum) {
    return t(
      L,
      `**${name}: como mínimo ${longSpan(c)} (vuelta a clase como pronto el ${weekdayDay(back)})**. Cada centro puede alargarlas en su calendario. `,
      `**${name}: com a mínim ${longSpan(c, L)} (tornada a classe com a molt aviat ${caEl(weekdayDay(back, L))})**. Cada centre les pot allargar en el seu calendari. `,
      `**${name}: at least from ${longSpan(c, L)} (back to school on ${weekdayDay(back, L)} at the earliest)**. Each school can extend them in its own calendar. `,
    );
  }
  return t(
    L,
    `**${name}: ${longSpan(c)} (vuelta a clase el ${weekdayDay(back)})**. El último día de clase es el ${weekdayDay(last)}. `,
    `**${name}: ${longSpan(c, L)} (tornada a classe ${caEl(weekdayDay(back, L))})**. L'últim dia de classe és ${caEl(weekdayDay(last, L))}. `,
    `**${name}: from ${longSpan(c, L)} (back to school on ${weekdayDay(back, L)})**. The last day of class is ${weekdayDay(last, L)}. `,
  );
}

/** The answer, before any section: Christmas, then the other dates and where they come from. */
function lead(region: RegionCalendar): string {
  const L = lang(region);
  const main = region.levels[0]!;
  const e = region.easter;
  const provinces = Boolean(region.provinces?.length);
  const christmas = christmasLead(region);
  if (L === "ca") {
    return (
      christmas +
      `Setmana Santa: ${longSpan(e, L)}${e.minimum ? " com a mínim" : ""}. A Infantil i Primària el curs ${Y} comença ${startWords(main, L)} i acaba ${endWords(main, L)}. ` +
      `Text oficial: ${orderLink(region)}${provinces ? "; cada província el concreta en la seva pròpia resolució" : ""}.`
    );
  }
  if (L === "en") {
    return (
      christmas +
      `Easter: ${e.minimum ? "at least from " : ""}${longSpan(e, L)}. In Infant and Primary, the ${Y} school year starts ${startWords(main, L)} and ends ${endWords(main, L)}. ` +
      `Official text: ${orderLink(region)}${provinces ? "; each province sets the details in its own resolution" : ""}.`
    );
  }
  return (
    christmas +
    `Semana Santa: ${longSpan(e)}${e.minimum ? " como mínimo" : ""}. En Infantil y Primaria el curso ${Y} empieza ${startWords(main)} y termina ${endWords(main)}. ` +
    `Lo fija ${orderLink(region)}${provinces ? ", y cada provincia lo concreta en su propia resolución" : ""}.`
  );
}

/** Navarra, País Vasco: each school approves its own calendar inside the text's limits. */
function flexibleCallout(region: RegionCalendar): Block[] {
  if (!region.flexible) return [];
  const title = t(lang(region), "Cada centro aprueba su calendario", "Cada centre aprova el seu calendari", "Each school approves its own calendar");
  return [{ type: "callout", tone: "info", title, text: region.flexible }];
}

function pending(locale: Locale): string {
  return t(locale, "por confirmar", "per confirmar", "to be confirmed");
}

function christmasSection(region: RegionCalendar): Block[] {
  const L = lang(region);
  const c = region.christmas;
  const last = lastClassBefore(region, c);
  const back = nextSchoolDay(region, c.to);
  const years = `${c.from.slice(0, 4)}-${c.to.slice(0, 4)}`;
  const heading: Block = {
    type: "heading",
    level: 2,
    text: t(L, `Vacaciones de Navidad ${years} ${region.inName}`, `Vacances de Nadal ${years} ${region.inName}`, `Christmas holidays ${years} ${region.inName}`),
  };
  if (c.label) {
    const rows = provinceCalendars(region).map(({ name, calendar }) => {
      const p = calendar.christmas;
      return [name, weekdayDay(lastClassBefore(calendar, p), L), span(p, L), weekdayDay(nextSchoolDay(calendar, p.to), L)];
    });
    const P = pending(L);
    return [
      heading,
      {
        type: "paragraph",
        text: t(
          L,
          `Cada provincia fija su Navidad: no hay clase ${c.label}. Así queda en cada una:`,
          `Cada província fixa el seu Nadal: no hi ha classe ${c.label}. Així queda a cadascuna:`,
          `Each province sets its own Christmas: there is no class from ${c.label}. This is how it works out in each one:`,
        ),
      },
      {
        type: "table",
        caption: t(
          L,
          `Vacaciones de Navidad ${years} por provincias ${region.inName}`,
          `Vacances de Nadal ${years} per províncies ${region.inName}`,
          `Christmas holidays ${years} by province ${region.inName}`,
        ),
        headers: t(
          L,
          ["Provincia", "Último día de clase", "Sin clase", "Vuelta a clase"],
          ["Província", "Últim dia de classe", "Sense classe", "Tornada a classe"],
          ["Province", "Last day of class", "No class", "Back to school"],
        ),
        rows: [...rows, ...(region.pendingProvinces ?? []).map((name) => [name, P, P, P])],
        note: t(
          L,
          "Infantil y Primaria. Resoluciones de las delegaciones territoriales; no cuenta las fiestas locales.",
          "Infantil i Primària. Resolucions de les delegacions territorials; no compta les festes locals.",
          "Infant and Primary. Resolutions of the provincial offices; local holidays are not counted.",
        ),
        stickyColumn: 0,
      },
    ];
  }
  const note = c.note ? ` ${c.note}` : "";
  return [
    heading,
    {
      type: "paragraph",
      text: c.minimum
        ? t(
            L,
            `Como mínimo no hay clase ${longSpan(c)}, los dos días incluidos: el último día de clase es como muy tarde el **${weekdayDay(last)}** y se vuelve como pronto el **${weekdayDay(back)}**. Cada centro puede alargarlas en su calendario.`,
            `Com a mínim no hi ha classe ${longSpan(c, L)}, tots dos dies inclosos: l'últim dia de classe és com a molt tard el **${weekdayDay(last, L)}** i es torna com a molt aviat el **${weekdayDay(back, L)}**. Cada centre les pot allargar en el seu calendari.`,
            `At the very least there is no class from ${longSpan(c, L)}, both days included: the last day of class is no later than **${weekdayDay(last, L)}** and school resumes no earlier than **${weekdayDay(back, L)}**. Each school can extend them in its own calendar.`,
          )
        : t(
            L,
            `No hay clase ${longSpan(c)}, los dos días incluidos. El último día de clase antes de las vacaciones es el **${weekdayDay(last)}** y se vuelve al colegio el **${weekdayDay(back)}**.${note}`,
            `No hi ha classe ${longSpan(c, L)}, tots dos dies inclosos. L'últim dia de classe abans de les vacances és el **${weekdayDay(last, L)}** i es torna a l'escola el **${weekdayDay(back, L)}**.${note}`,
            `There is no class from ${longSpan(c, L)}, both days included. The last day of class before the holidays is **${weekdayDay(last, L)}** and school resumes on **${weekdayDay(back, L)}**.${note}`,
          ),
    },
  ];
}

function easterSection(region: RegionCalendar): Block[] {
  const L = lang(region);
  const e = region.easter;
  const last = lastClassBefore(region, e);
  const back = nextSchoolDay(region, e.to);
  const y = e.from.slice(0, 4);
  const note = e.note ? ` ${e.note}` : "";
  return [
    {
      type: "heading",
      level: 2,
      text: t(L, `Semana Santa ${y} en los colegios ${region.deName}`, `Setmana Santa ${y} a les escoles ${region.deName}`, `Easter ${y} in schools ${region.inName}`),
    },
    {
      type: "paragraph",
      text: e.minimum
        ? t(
            L,
            `Como mínimo, las vacaciones de Semana Santa van ${longSpan(e)}, ambos incluidos (de Jueves Santo a Lunes de Pascua): último día de clase como muy tarde el ${weekdayDay(last)} y vuelta como pronto el **${weekdayDay(back)}**. Cada centro puede alargarlas.`,
            `Com a mínim, les vacances de Setmana Santa van ${longSpan(e, L)}, tots dos inclosos (de Dijous Sant a Dilluns de Pasqua): últim dia de classe com a molt tard el ${weekdayDay(last, L)} i tornada com a molt aviat el **${weekdayDay(back, L)}**. Cada centre les pot allargar.`,
            `At the very least, the Easter holidays run from ${longSpan(e, L)}, both days included (Maundy Thursday to Easter Monday): last day of class no later than ${weekdayDay(last, L)} and back to school no earlier than **${weekdayDay(back, L)}**. Each school can extend them.`,
          )
        : t(
            L,
            `Las vacaciones de Semana Santa van ${longSpan(e)}, ambos incluidos. Último día de clase: ${weekdayDay(last)}; vuelta a clase: **${weekdayDay(back)}**.${note}`,
            `Les vacances de Setmana Santa van ${longSpan(e, L)}, tots dos inclosos. Últim dia de classe: ${weekdayDay(last, L)}; tornada a classe: **${weekdayDay(back, L)}**.${note}`,
            `The Easter holidays run from ${longSpan(e, L)}, both days included. Last day of class: ${weekdayDay(last, L)}; back to school: **${weekdayDay(back, L)}**.${note}`,
          ),
    },
  ];
}

function otherBreaksSection(region: RegionCalendar): Block[] {
  if (region.otherBreaks.length === 0) return [];
  const L = lang(region);
  const one = region.otherBreaks.length === 1;
  return [
    {
      type: "heading",
      level: 2,
      text: t(L, `Otras vacaciones del curso ${region.inName}`, `Altres vacances del curs ${region.inName}`, `Other holidays during the school year ${region.inName}`),
    },
    {
      type: "paragraph",
      text: t(
        L,
        `Además de Navidad y Semana Santa, la orden fija ${one ? "este periodo" : "estos periodos"} sin clase:`,
        `A més de Nadal i Setmana Santa, el text oficial fixa ${one ? "aquest període" : "aquests períodes"} sense classe:`,
        `Besides Christmas and Easter, the official text sets ${one ? "this period" : "these periods"} without class:`,
      ),
    },
    {
      type: "list",
      ordered: false,
      items: region.otherBreaks.map((b) => `**${b.name}**: ${longSpan(b, L)}${b.note ? ` (${b.note})` : ""}.`),
    },
  ];
}

function levelsSection(region: RegionCalendar): Block[] {
  const L = lang(region);
  return [
    { type: "heading", level: 2, text: t(L, "Inicio y fin de curso por etapas", "Inici i final de curs per etapes", "Start and end of the school year by stage") },
    {
      type: "paragraph",
      text: t(
        L,
        "Infantil, Primaria, ESO, Bachillerato y Formación Profesional no siempre empiezan ni terminan el mismo día. Estas son las fechas de la orden, tal como las agrupa:",
        "Infantil, Primària, ESO, Batxillerat i Formació Professional no sempre comencen ni acaben el mateix dia. Aquestes són les dates del text oficial, agrupades com les agrupa ell:",
        "Infant, Primary, ESO, Bachillerato and vocational training (FP) do not always start or end on the same day. These are the official text's dates, grouped the way it groups them:",
      ),
    },
    {
      type: "table",
      caption: t(L, `Inicio y fin del curso ${Y} ${region.inName}`, `Inici i final del curs ${Y} ${region.inName}`, `Start and end of the ${Y} school year ${region.inName}`),
      headers: t(L, ["Etapa", "Empieza", "Termina"], ["Etapa", "Comença", "Acaba"], ["Stage", "Starts", "Ends"]),
      rows: region.levels.map((l) => [
        l.levels,
        l.startText ?? (l.start ? fullDate(l.start, L) : "—"),
        `${l.endText ?? (l.end ? fullDate(l.end, L) : "—")}${l.note ? ` (${l.note})` : ""}`,
      ]),
      note: `${region.order.short} (${region.order.bulletin}).`,
      stickyColumn: 0,
    },
  ];
}

/** Every weekday without class for the whole community, outside the breaks. */
export function daysOffRows(region: RegionCalendar): { date: string; what: string }[] {
  const L = lang(region);
  const byDate = new Map<string, string>();
  for (const h of holidaysInTerm(region)) byDate.set(h.date, `${t(L, "Festivo", "Festiu", "Public holiday")}: ${holidayName(h.name, L)}`);
  const { start, end } = mainLevels(region);
  const inBreak = (iso: string) =>
    [region.christmas, region.easter, ...region.otherBreaks].some((p) => iso >= p.from && iso <= p.to);
  for (const d of region.nonTeaching) {
    const wd = weekdayIndex(d.date);
    if (wd === 0 || wd === 6 || inBreak(d.date) || d.date < start || d.date > end) continue;
    const what = `${d.reason}${d.levels ? ` (${t(L, "solo", "només", "only")} ${d.levels})` : ""}`;
    byDate.set(d.date, byDate.has(d.date) ? `${byDate.get(d.date)}; ${what}` : `${t(L, "Día no lectivo", "Dia no lectiu", "Non-teaching day")}: ${what}`);
  }
  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, what]) => ({ date, what }));
}

function daysOffSection(region: RegionCalendar): Block[] {
  const L = lang(region);
  const rows = daysOffRows(region);
  if (rows.length === 0) return [];
  const partial = region.nonTeaching.some((d) => d.partial || d.levels);
  return [
    {
      type: "heading",
      level: 2,
      text: t(L, `Días sin clase ${region.inName} en el curso ${Y}`, `Dies sense classe ${region.inName} el curs ${Y}`, `Days without class ${region.inName} in ${Y}`),
    },
    {
      type: "paragraph",
      text: t(
        L,
        `Fuera de las vacaciones, estos días laborables no hay clase en los colegios ${region.deName}: los festivos nacionales y autonómicos que caen en día lectivo y los días que la orden declara no lectivos${partial ? " (los que no valen para todos dicen a quién se aplican)" : ""}.`,
        `Fora de les vacances, aquests dies feiners no hi ha classe a les escoles ${region.deName}: els festius estatals i autonòmics que cauen en dia lectiu i els dies que el text oficial declara no lectius${partial ? " (els que no valen per a tothom diuen a qui s'apliquen)" : ""}.`,
        `Outside the holidays, there is no class in schools ${region.inName} on these weekdays: the national and regional public holidays that fall on a teaching day and the days the official text makes non-teaching days${partial ? " (those that do not apply to everyone say who they apply to)" : ""}.`,
      ),
    },
    {
      type: "table",
      caption: t(L, `Días sin clase ${region.inName}, ${Y}`, `Dies sense classe ${region.inName}, ${Y}`, `Days without class ${region.inName}, ${Y}`),
      headers: t(L, ["Fecha", "Por qué no hay clase"], ["Data", "Per què no hi ha classe"], ["Date", "Why there is no class"]),
      rows: rows.map((r) => [fullDate(r.date, L), r.what]),
      note: t(
        L,
        `Festivos: BOE de 28 de octubre de 2025 (2026) y de 13 de octubre de 2026 (2027). Días no lectivos: ${region.order.short}.`,
        `Festius: BOE de 28 d'octubre de 2025 (2026) i de 13 d'octubre de 2026 (2027). Dies no lectius: ${region.order.short}.`,
        `Public holidays: BOE of 28 October 2025 (2026) and of 13 October 2026 (2027). Non-teaching days: ${region.order.short}.`,
      ),
      stickyColumn: 0,
    },
    { type: "paragraph", text: sevenDecember(region) },
  ];
}

/** "¿Hay clase el 7 de diciembre?": the question of the December long weekend. */
function sevenDecember(region: RegionCalendar): string {
  const L = lang(region);
  const day = schoolDayIn(region, "2026-12-07");
  const inName = region.inName;
  if (day.kind === "holiday") {
    return t(
      L,
      `El **lunes 7 de diciembre de 2026** es festivo ${inName} (se traslada el Día de la Constitución, que cae en domingo), así que con el martes 8 el puente de diciembre es de cuatro días sin clase, del sábado 5 al martes 8.`,
      `El **dilluns 7 de desembre de 2026** és festiu ${inName} (s'hi trasllada el Dia de la Constitució, que cau en diumenge), així que amb el dimarts 8 el pont de desembre és de quatre dies sense classe, del dissabte 5 al dimarts 8.`,
      `**Monday 7 December 2026** is a public holiday ${inName} (Constitution Day, which falls on a Sunday, moves to it), so with Tuesday 8 the December long weekend is four days without class, from Saturday 5 to Tuesday 8.`,
    );
  }
  if (day.kind === "nonTeaching") {
    return t(
      L,
      `El **lunes 7 de diciembre de 2026** no es festivo laboral ${inName}, pero la orden lo declara día sin clase (${day.reason}): con el martes 8, festivo, los colegios tienen cuatro días seguidos sin clase, del sábado 5 al martes 8.`,
      `El **dilluns 7 de desembre de 2026** no és festiu laboral ${inName}, però el text oficial el declara dia sense classe (${day.reason}): amb el dimarts 8, festiu, les escoles tenen quatre dies seguits sense classe, del dissabte 5 al dimarts 8.`,
      `**Monday 7 December 2026** is not a public holiday ${inName}, but the official text makes it a day without class (${day.reason}): with Tuesday 8, a public holiday, schools have four days in a row without class, from Saturday 5 to Tuesday 8.`,
    );
  }
  const own = region.flexible ? t(L, " en su calendario", " en el seu calendari", " in its calendar") : "";
  return t(
    L,
    `El **lunes 7 de diciembre de 2026** no es festivo ${inName} y la orden no lo declara no lectivo: solo el martes 8 (Inmaculada Concepción) es festivo. Si un colegio no tiene clase el 7 será porque lo fija el municipio o el propio centro${own}.`,
    `El **dilluns 7 de desembre de 2026** no és festiu ${inName} i el text oficial no el declara no lectiu: només el dimarts 8 (Immaculada Concepció) és festiu. Si una escola no té classe el 7 serà perquè ho fixa el municipi o el mateix centre${own}.`,
    `**Monday 7 December 2026** is not a public holiday ${inName} and the official text does not make it a non-teaching day: only Tuesday 8 (Immaculate Conception) is a holiday. If a school has no class on the 7th, it is because the municipality or the school itself set it${own}.`,
  );
}

function localSection(region: RegionCalendar): Block[] {
  const L = lang(region);
  return [
    {
      type: "heading",
      level: 2,
      text: t(L, "Fiestas locales y días no lectivos de cada municipio", "Festes locals i dies no lectius de cada municipi", "Local holidays and each municipality's non-teaching days"),
    },
    { type: "paragraph", text: region.localDays },
    {
      type: "paragraph",
      text: t(
        L,
        "Por eso dos colegios de la misma comunidad pueden no coincidir algún día suelto. Para saber qué días tiene libres un centro concreto, lo más fiable es su propio calendario, que suele estar en su web o en la secretaría, o el ayuntamiento.",
        "Per això dues escoles de la mateixa comunitat poden no coincidir algun dia solt. Per saber quins dies té lliures un centre concret, el més fiable és el seu propi calendari, que sol ser al seu web o a la secretaria, o l'ajuntament.",
        "That is why two schools in the same region may not match on the odd day. To know which days a particular school has off, the most reliable source is its own calendar, usually on its website or at the school office, or the town council.",
      ),
    },
  ];
}

function provincesSection(region: RegionCalendar): Block[] {
  const provinces = region.provinces ?? [];
  if (provinces.length === 0) return [];
  const L = lang(region);
  const main = region.levels[0]!;
  const P = pending(L);
  const extra = region.provincesNote ? ` ${region.provincesNote}` : "";
  return [
    {
      type: "heading",
      level: 2,
      text: t(L, `Calendario escolar por provincias ${region.inName}`, `Calendari escolar per províncies ${region.inName}`, `School calendar by province ${region.inName}`),
    },
    {
      type: "paragraph",
      text: t(
        L,
        `${region.inName.replace(/^en /, "En ")} cada provincia aprueba después su calendario con una resolución propia, dentro del marco que fija ${theOrder(region.order.short)}.${extra}`,
        `${cap(region.inName)} cada província aprova després el seu calendari amb una resolució pròpia, dins del marc que fixa ${theOrder(region.order.short, L)}.${extra}`,
        `${cap(region.inName)}, each province then approves its calendar with a resolution of its own, within the framework set by ${theOrder(region.order.short, L)}.${extra}`,
      ),
    },
    {
      type: "table",
      caption: t(
        L,
        `Calendario escolar ${Y} por provincias ${region.inName}`,
        `Calendari escolar ${Y} per províncies ${region.inName}`,
        `${Y} school calendar by province ${region.inName}`,
      ),
      headers: t(
        L,
        ["Provincia", "Inicio", "Navidad", "Semana Santa", "Fin de curso", "Otros días sin clase", "Resolución"],
        ["Província", "Inici", "Nadal", "Setmana Santa", "Final de curs", "Altres dies sense classe", "Resolució"],
        ["Province", "Start", "Christmas", "Easter", "End of term", "Other days without class", "Resolution"],
      ),
      rows: [
        ...provinces.map((p) => {
          const row = p.levels?.[0] ?? main;
          const others = [
            ...(p.otherBreaks ?? []).map((b) => `${b.name} (${span(b, L)})`),
            ...(p.nonTeaching ?? []).map((d) => `${dayMonth(d.date, L)} (${d.reason})`),
          ];
          return [
            p.name,
            row.start ? dayMonth(row.start, L) : "—",
            span(p.christmas ?? region.christmas, L),
            span(p.easter ?? region.easter, L),
            row.end ? dayMonth(row.end, L) : "—",
            others.length ? others.join("; ") : t(L, "los de la orden", "els del text oficial", "those of the official text"),
            `[${p.order.short}](${p.order.url})`,
          ];
        }),
        ...(region.pendingProvinces ?? []).map((name) => [
          name,
          P,
          P,
          P,
          P,
          P,
          t(L, "resolución 2026-2027 no localizada", "resolució 2026-2027 no localitzada", "2026-2027 resolution not found"),
        ]),
      ],
      note: t(
        L,
        "Infantil y Primaria. Resoluciones de las delegaciones provinciales.",
        "Infantil i Primària. Resolucions de les delegacions provincials.",
        "Infant and Primary. Resolutions of the provincial offices.",
      ),
      stickyColumn: 0,
    },
    ...(provinces.some((p) => p.localDays)
      ? [
          {
            type: "paragraph",
            text: t(L, "Días locales, según la resolución de cada provincia:", "Dies locals, segons la resolució de cada província:", "Local days, according to each province's resolution:"),
          } as Block,
          { type: "list", ordered: false, items: provinces.filter((p) => p.localDays).map((p) => `**${p.name}.** ${p.localDays}`) } as Block,
        ]
      : []),
  ];
}

/** Murcia: every municipality's local holidays and other days without class, from the order's annex. */
function townSection(region: RegionCalendar): Block[] {
  const towns = [...(region.townDays ?? [])].sort((a, b) => a.town.localeCompare(b.town, "es"));
  if (towns.length === 0) return [];
  const L = lang(region);
  const short = (iso: string) => `${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`;
  return [
    {
      type: "heading",
      level: 2,
      text: t(L, `Días sin clase de cada municipio ${region.inName}`, `Dies sense classe de cada municipi ${region.inName}`, `Days without class in each municipality ${region.inName}`),
    },
    {
      type: "paragraph",
      text: t(
        L,
        `La resolución fija, municipio por municipio, los dos festivos locales y los otros días no lectivos que ha propuesto cada Consejo Escolar Municipal. Valen para todos los colegios e institutos del municipio (día/mes; septiembre a diciembre son de 2026 y enero a junio, de 2027).`,
        `La resolució fixa, municipi per municipi, els dos festius locals i els altres dies no lectius que ha proposat cada Consell Escolar Municipal. Valen per a totes les escoles i instituts del municipi (dia/mes; de setembre a desembre són del 2026 i de gener a juny, del 2027).`,
        `The resolution sets, municipality by municipality, the two local holidays and the other non-teaching days proposed by each Municipal School Council. They apply to every primary and secondary school in the municipality (day/month; September to December are in 2026 and January to June in 2027).`,
      ),
    },
    {
      type: "table",
      caption: t(
        L,
        `Festivos locales y días no lectivos por municipio, curso ${Y}`,
        `Festius locals i dies no lectius per municipi, curs ${Y}`,
        `Local holidays and non-teaching days by municipality, ${Y}`,
      ),
      headers: t(
        L,
        ["Municipio", "Festivos locales", "Otros días sin clase"],
        ["Municipi", "Festius locals", "Altres dies sense classe"],
        ["Municipality", "Local holidays", "Other days without class"],
      ),
      rows: towns.map((tw) => [
        tw.town,
        tw.local.map(short).join(", "),
        `${tw.other.map(short).join(", ")}${tw.note ? ` (${tw.note})` : ""}`,
      ]),
      note: t(L, `${region.order.short}, anexo V (${region.order.bulletin}).`, `${region.order.short}, annex V (${region.order.bulletin}).`, `${region.order.short}, annex V (${region.order.bulletin}).`),
      stickyColumn: 0,
    },
  ];
}

/**
 * The same community's 2027 work calendar (/es/festivos/2027/<slug>/), for the
 * holidays and long weekends. Spanish only: those pages have no Catalan or
 * English edition, and an edition links only to pages in its own language.
 */
function workCalendarLink(region: RegionCalendar): Block[] {
  if (lang(region) !== "es") return [];
  return [
    {
      type: "paragraph",
      text: `Para los festivos laborales y los puentes de 2027, mira el [calendario laboral 2027 ${region.deName}](${communityPath(region.slug)}).`,
    },
  ];
}

function notesSection(region: RegionCalendar): Block[] {
  if (region.notes.length === 0) return [];
  const L = lang(region);
  return [
    {
      type: "heading",
      level: 2,
      text: t(L, "Otras fechas y reglas que fija la orden", "Altres dates i normes que fixa el text oficial", "Other dates and rules in the official text"),
    },
    { type: "list", ordered: false, items: region.notes },
  ];
}

function orderSection(region: RegionCalendar): Block[] {
  const L = lang(region);
  const o = region.order;
  const where = orderWhere(o, L);
  const read = fullDate(region.verifiedAt, L).replace(/^\S+ /, "");
  const text = [
    t(
      L,
      `El calendario escolar ${region.inName} lo fija cada curso la ${o.issuer}. El de ${Y} está en: **${o.title}** (${where}). [Texto oficial](${o.url}).`,
      `El calendari escolar ${region.inName} el fixa cada curs l'administració educativa (${o.issuer}). El del curs ${Y} és: **${o.title}** (${where}). [Text oficial](${o.url}).`,
      `The school calendar ${region.inName} is set every year by the education authority (${o.issuer}). The one for ${Y} is: **${o.title}** (${where}). [Official text](${o.url}).`,
    ),
  ];
  if (o.departmentUrl) {
    text.push(
      t(
        L,
        `La administración educativa lo recoge también en [su página del calendario escolar](${o.departmentUrl}).`,
        `L'administració educativa també el recull a [la seva pàgina del calendari escolar](${o.departmentUrl}).`,
        `The education authority also has it on [its school calendar page](${o.departmentUrl}).`,
      ),
    );
  }
  if (region.schoolDays) {
    const min = Boolean(region.flexible);
    text.push(
      t(
        L,
        `El curso tiene ${region.schoolDays} días lectivos${min ? " como mínimo" : ""}.`,
        `El curs té ${region.schoolDays} dies lectius${min ? " com a mínim" : ""}.`,
        `The school year has ${min ? "at least " : ""}${region.schoolDays} teaching days.`,
      ),
    );
  }
  text.push(t(L, `Fechas leídas en el texto oficial el ${read}.`, `Dates llegides al text oficial ${caEl(read)}.`, `Dates read in the official text on ${read}.`));
  return [
    { type: "heading", level: 2, text: t(L, "La orden oficial del calendario escolar", "El text oficial del calendari escolar", "The official school calendar text") },
    { type: "paragraph", text: text.join(" ") },
  ];
}

function regionFaq(region: RegionCalendar): Block {
  const L = lang(region);
  const c = region.christmas;
  const e = region.easter;
  const main = region.levels[0]!;
  const inName = region.inName;
  const sevenDec = schoolDayIn(region, "2026-12-07");
  const minimum = (p: Period) =>
    p.minimum ? t(L, " Es el mínimo: cada centro puede alargarlas.", " És el mínim: cada centre les pot allargar.", " This is the minimum: each school can extend them.") : "";
  const sevenAnswer =
    sevenDec.kind === "school"
      ? t(
          L,
          `No es festivo ${inName} y la orden no lo declara no lectivo: es día lectivo en el calendario general, y solo el martes 8 (Inmaculada Concepción) es festivo. Algunos municipios o centros pueden tenerlo como día no lectivo local: pregúntalo en el colegio.`,
          `No és festiu ${inName} i el text oficial no el declara no lectiu: és dia lectiu al calendari general, i només el dimarts 8 (Immaculada Concepció) és festiu. Alguns municipis o centres el poden tenir com a dia no lectiu local: pregunta-ho a l'escola.`,
          `It is not a public holiday ${inName} and the official text does not make it a non-teaching day: it is a school day in the general calendar, and only Tuesday 8 (Immaculate Conception) is a holiday. Some municipalities or schools may have it as a local non-teaching day: ask the school.`,
        )
      : t(
          L,
          `No. ${sevenDec.kind === "holiday" ? `Es festivo ${inName} (${sevenDec.name})` : sevenDec.kind === "nonTeaching" ? `Es día no lectivo (${sevenDec.reason})` : "No es día lectivo"}, y el martes 8 también es festivo: del sábado 5 al martes 8 no hay clase.`,
          `No. ${sevenDec.kind === "holiday" ? `És festiu ${inName} (${sevenDec.name})` : sevenDec.kind === "nonTeaching" ? `És dia no lectiu (${sevenDec.reason})` : "No és dia lectiu"}, i el dimarts 8 també és festiu: del dissabte 5 al dimarts 8 no hi ha classe.`,
          `No. ${sevenDec.kind === "holiday" ? `It is a public holiday ${inName} (${sevenDec.name})` : sevenDec.kind === "nonTeaching" ? `It is a non-teaching day (${sevenDec.reason})` : "It is not a school day"}, and Tuesday 8 is also a holiday: there is no class from Saturday 5 to Tuesday 8.`,
        );
  const cy = c.from.slice(0, 4);
  const ey = e.from.slice(0, 4);
  const back = nextSchoolDay(region, c.to);
  const provincesBack = (on: string) =>
    joinList(
      provinceCalendars(region).map(({ name, calendar }) => `${name}, ${on}${weekdayDay(nextSchoolDay(calendar, calendar.christmas.to), L)}`),
      L,
    );
  const items = [
    {
      question: t(
        L,
        `¿Cuándo empiezan las vacaciones de Navidad ${cy} ${inName}?`,
        `Quan comencen les vacances de Nadal ${cy} ${inName}?`,
        `When do the ${cy} Christmas holidays start ${inName}?`,
      ),
      answer: c.label
        ? t(
            L,
            `Depende de la provincia: no hay clase ${c.label}. La tabla de Navidad por provincias tiene el último día de clase y la vuelta de cada una.`,
            `Depèn de la província: no hi ha classe ${c.label}. La taula de Nadal per províncies té l'últim dia de classe i la tornada de cadascuna.`,
            `It depends on the province: there is no class from ${c.label}. The Christmas table by province has each one's last day of class and return.`,
          )
        : t(
            L,
            `El ${weekdayDay(c.from)} es el primer día sin clase y el ${weekdayDay(c.to)} el último, según ${theOrder(region.order.short)}. El último día de clase es el ${weekdayDay(lastClassBefore(region, c))}.${minimum(c)}`,
            `El ${weekdayDay(c.from, L)} és el primer dia sense classe i el ${weekdayDay(c.to, L)} l'últim, segons ${theOrder(region.order.short, L)}. L'últim dia de classe és el ${weekdayDay(lastClassBefore(region, c), L)}.${minimum(c)}`,
            `${weekdayDay(c.from, L)} is the first day without class and ${weekdayDay(c.to, L)} the last, according to ${theOrder(region.order.short, L)}. The last day of class is ${weekdayDay(lastClassBefore(region, c), L)}.${minimum(c)}`,
          ),
    },
    {
      question: t(
        L,
        `¿Cuándo se vuelve al cole después de Navidad ${inName}?`,
        `Quan es torna a l'escola després de Nadal ${inName}?`,
        `When does school go back after Christmas ${inName}?`,
      ),
      answer: c.label
        ? t(L, `Según la provincia: ${provincesBack("el ")}.`, `Segons la província: ${provincesBack("el ")}.`, `It depends on the province: ${provincesBack("on ")}.`)
        : c.minimum
          ? t(
              L,
              `Depende del centro: las vacaciones duran como mínimo hasta el ${weekdayDay(c.to)}, así que como pronto se vuelve el ${fullDate(back)}.`,
              `Depèn del centre: les vacances duren com a mínim fins al ${weekdayDay(c.to, L)}, així que com a molt aviat es torna el ${fullDate(back, L)}.`,
              `It depends on the school: the holidays last at least until ${weekdayDay(c.to, L)}, so the earliest return is ${fullDate(back, L)}.`,
            )
          : t(L, `El ${fullDate(back)}.`, `El ${fullDate(back, L)}.`, `On ${fullDate(back, L)}.`),
    },
    {
      question: t(L, `¿Hay clase el 7 de diciembre de 2026 ${inName}?`, `Hi ha classe el 7 de desembre de 2026 ${inName}?`, `Is there school on 7 December 2026 ${inName}?`),
      answer: sevenAnswer,
    },
    {
      question: t(
        L,
        `¿Cuándo son las vacaciones de Semana Santa ${ey} ${inName}?`,
        `Quan són les vacances de Setmana Santa ${ey} ${inName}?`,
        `When are the ${ey} Easter holidays ${inName}?`,
      ),
      answer: t(
        L,
        `${longSpan(e).replace(/^del/, "Del")}, ambos incluidos. Se vuelve a clase el ${weekdayDay(nextSchoolDay(region, e.to))}.${minimum(e)}`,
        `${cap(longSpan(e, L))}, tots dos inclosos. Es torna a classe el ${weekdayDay(nextSchoolDay(region, e.to), L)}.${minimum(e)}`,
        `From ${longSpan(e, L)}, both days included. School resumes on ${weekdayDay(nextSchoolDay(region, e.to), L)}.${minimum(e)}`,
      ),
    },
    ...(region.otherBreaks.length
      ? [
          {
            question: t(
              L,
              `¿Hay otras vacaciones durante el curso ${inName}?`,
              `Hi ha altres vacances durant el curs ${inName}?`,
              `Are there other holidays during the school year ${inName}?`,
            ),
            answer: `${t(L, "Sí", "Sí", "Yes")}: ${joinList(region.otherBreaks.map((b) => `${breakName(b.name, L)}, ${span(b, L)}`), L)}.`,
          },
        ]
      : []),
    {
      question: t(
        L,
        `¿Cuándo empieza y termina el curso ${Y} ${inName}?`,
        `Quan comença i acaba el curs ${Y} ${inName}?`,
        `When does the ${Y} school year start and end ${inName}?`,
      ),
      answer: t(
        L,
        `En Infantil y Primaria empieza ${startWords(main)} y termina ${endWords(main)}.${region.levels.length > 1 ? " Las demás etapas tienen sus fechas en la tabla de inicio y fin de curso por etapas." : ""}`,
        `A Infantil i Primària comença ${startWords(main, L)} i acaba ${endWords(main, L)}.${region.levels.length > 1 ? " Les altres etapes tenen les seves dates a la taula d'inici i final de curs per etapes." : ""}`,
        `In Infant and Primary it starts ${startWords(main, L)} and ends ${endWords(main, L)}.${region.levels.length > 1 ? " The other stages have their dates in the table of start and end dates by stage." : ""}`,
      ),
    },
  ];
  return { type: "faq", title: t(L, "Preguntas frecuentes", "Preguntes freqüents", "Frequently asked questions"), items };
}

/** Under the Christmas section: the same three days for every other community, one click away. */
function christmasHubLink(region: RegionCalendar): Block {
  const L = lang(region);
  const year = region.christmas.from.slice(0, 4);
  return {
    type: "paragraph",
    text: t(
      L,
      `¿Y en otras comunidades? El último día de clase, el primer día de vacaciones y la vuelta al cole de ${scopeWords(L)}, cada una con su orden, están en la tabla de [vacaciones de Navidad ${year} por comunidades](${href(HUB_PATH)}).`,
      `I a les altres comunitats? L'últim dia de classe, el primer dia de vacances i la tornada a l'escola de ${scopeWords(L)}, cadascuna amb el seu text oficial, són a la taula de [vacances de Nadal ${year} per comunitats](${href(HUB_PATHS.ca, "ca")}).`,
      `What about other regions? The last day of class, the first day of the holidays and the return to school for ${scopeWords(L)}, each with its official text, are in the table of [Christmas ${year} school holidays by region](${href(HUB_PATHS.en, "en")}).`,
    ),
  };
}

/** The whole body of one community's page, in the record's language. */
export function buildRegionBody(region: RegionCalendar): Block[] {
  const L = lang(region);
  return [
    { type: "paragraph", lead: true, text: lead(region) },
    ...flexibleCallout(region),
    { type: "spainSchoolCalendar", region: region.slug },
    ...christmasSection(region),
    christmasHubLink(region),
    ...easterSection(region),
    ...otherBreaksSection(region),
    ...levelsSection(region),
    ...daysOffSection(region),
    ...workCalendarLink(region),
    ...provincesSection(region),
    ...localSection(region),
    ...townSection(region),
    ...notesSection(region),
    ...orderSection(region),
    regionFaq(region),
    {
      type: "paragraph",
      text: t(
        L,
        `¿Y en otras comunidades? Las fechas de todas, una al lado de otra, están en el [calendario escolar ${Y} por comunidades](${href(HUB_PATH)}).`,
        `I a les altres comunitats? Les dates de totes, l'una al costat de l'altra, són al [calendari escolar ${Y} per comunitats](${href(HUB_PATHS.ca, "ca")}).`,
        `What about other regions? The dates for all of them, side by side, are in the [${Y} school calendar by region](${href(HUB_PATHS.en, "en")}).`,
      ),
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                        */
/* -------------------------------------------------------------------------- */

export function hubTitle(locale: Locale = "es"): string {
  return t(locale, `Calendario escolar ${Y} en España por comunidades`, `Calendari escolar ${Y} a Espanya per comunitats autònomes`, `School calendar ${Y} in Spain by region`);
}

export function hubSeoTitle(locale: Locale = "es"): string {
  return t(
    locale,
    `Calendario escolar ${Y} por comunidades: Navidad y Semana Santa`,
    `Calendari escolar ${Y} per comunitats: Nadal i Setmana Santa`,
    `Spain school calendar ${Y} by region: Christmas and Easter`,
  );
}

export const HUB_TITLE = hubTitle("es");
export const HUB_SEO_TITLE = hubSeoTitle("es");

function link(region: RegionCalendar): string {
  const L = lang(region);
  return `[${region.short}](${href(regionPath(region.slug, L), L)})`;
}

/** "por confirmar" rows: communities whose 2026-2027 text is not transcribed yet. */
function pendingRows(cells: number, locale: Locale): string[][] {
  return pendingRegions(locale).map((p) => [p.short, ...Array.from({ length: cells - 1 }, () => pending(locale))]);
}

/**
 * The text a row cites: the order, or, where the provinces set this break's
 * days themselves (Andalucía's Christmas), the department's page with every
 * provincial resolution.
 */
function sourceCell(region: RegionCalendar, kind: BreakKind): string {
  const L = lang(region);
  const provincial = new Set(breakDaysAll(region, kind).map((x) => `${x.days.last}${x.days.first}${x.days.back}`)).size > 1;
  if (provincial) {
    return `[${t(L, "Resoluciones provinciales", "Resolucions provincials", "Provincial resolutions")}](${region.order.departmentUrl ?? region.order.url})`;
  }
  return `[${orderWhere(region.order, L)}](${region.order.url})`;
}

/**
 * One row per community: last day of class, first day without, first day
 * back and the text that says so. Where the provinces differ, the cell gives
 * their alternatives ("22 o 23 de diciembre"); where the text sets a minimum,
 * the cell says how it bends.
 */
function breakTable(kind: BreakKind, locale: Locale): Block {
  const L = locale;
  const earliest = (r: RegionCalendar) => breakDaysAll(r, kind).map((x) => x.days.first).sort()[0]!;
  const regions = hubRegions(L).sort((a, b) => earliest(a).localeCompare(earliest(b)) || a.short.localeCompare(b.short, L));
  const name = kind === "christmas" ? t(L, "Navidad", "Nadal", "Christmas") : t(L, "Semana Santa", "Setmana Santa", "Easter");
  const year = regions[0]![kind].from.slice(0, 4);
  const byProvince = t(L, " (según la provincia)", " (segons la província)", " (by province)");
  const cell = (r: RegionCalendar, pick: keyof BreakDays, minimum: string) => {
    const dates = breakDaysAll(r, kind).map((x) => x.days[pick]);
    const varies = new Set(dates).size > 1;
    return `${alternatives(dates, L)}${varies ? byProvince : r[kind].minimum ? ` (${minimum})` : ""}`;
  };
  const latest = t(L, "como muy tarde", "com a molt tard", "at the latest");
  const earliestWords = t(L, "como pronto", "com a molt aviat", "at the earliest");
  const pendingProvinces = regions.filter((r) => r.pendingProvinces?.length);
  const pendingNote = pendingProvinces
    .map((r) =>
      t(
        L,
        ` ${r.short}: ${joinList(r.pendingProvinces!, L)}, por confirmar.`,
        ` ${r.short}: ${joinList(r.pendingProvinces!, L)}, per confirmar.`,
        ` ${r.short}: ${joinList(r.pendingProvinces!, L)} to be confirmed.`,
      ),
    )
    .join("");
  return {
    type: "table",
    caption: t(L, `Vacaciones de ${name} ${year} por comunidades, curso ${Y}`, `Vacances de ${name} ${year} per comunitats, curs ${Y}`, `${name} ${year} school holidays by region, ${Y}`),
    headers: t(
      L,
      ["Comunidad", "Último día de clase", "Primer día sin clase", "Vuelta a clase", "Fuente"],
      ["Comunitat", "Últim dia de classe", "Primer dia sense classe", "Tornada a classe", "Font"],
      ["Region", "Last day of class", "First day off", "Back to school", "Source"],
    ),
    rows: [
      ...regions.map((r) => [link(r), cell(r, "last", latest), cell(r, "first", latest), cell(r, "back", earliestWords), sourceCell(r, kind)]),
      ...pendingRows(5, L),
    ],
    note: t(
      L,
      `Infantil y Primaria. Cada fila, según la orden o resolución de su comunidad; no cuenta las fiestas locales ni los días que fije cada municipio o centro.${pendingNote}`,
      `Infantil i Primària. Cada fila, segons l'ordre o resolució de la seva comunitat; no compta les festes locals ni els dies que fixi cada municipi o centre.${pendingNote}`,
      `Infant and Primary. Each row follows its region's order or resolution; local holidays and days set by each municipality or school are not counted.${pendingNote}`,
    ),
    stickyColumn: 0,
  };
}

/** "lunes 7 de septiembre", or the window's words, for the start and end table. */
function shortStart(region: RegionCalendar): string {
  const L = lang(region);
  const main = region.levels[0]!;
  return main.startText ? main.startText.replace(L === "en" ? / 2026.*$/ : / de 2026.*$/, "") : weekdayDay(main.start!, L);
}

function shortEnd(region: RegionCalendar): string {
  const L = lang(region);
  const main = region.levels[0]!;
  return main.endText ? main.endText.replace(L === "en" ? / 2027.*$/ : / de 2027.*$/, "") : fullDate(main.end!, L);
}

/**
 * The hub's answer, in bold: the day most communities have their last class
 * before Christmas and the window of return, then the communities that finish
 * earlier or later, provinces named where they differ. Computed, never typed.
 */
function christmasHubAnswer(regions: RegionCalendar[]): string {
  const L = lang(regions[0]!);
  const groups = dayGroups(regions, "christmas", "last", t(L, "como muy tarde", "com a molt tard", "at the latest"));
  const main = [...groups].sort((a, b) => b.names.length - a.names.length || a.date.localeCompare(b.date))[0]!;
  const before = groups.filter((g) => g.date < main.date);
  const after = groups.filter((g) => g.date > main.date);
  const backs = regions.flatMap((r) => breakDaysAll(r, "christmas").map((x) => x.days.back)).sort();
  const year = regions[0]!.christmas.from.slice(0, 4);
  const window = between(backs[0]!, backs.at(-1)!, L);
  const head = t(
    L,
    `**Vacaciones de Navidad ${year} en los colegios: en la mayoría de comunidades el último día de clase es el ${weekdayDay(main.date)}, y se vuelve a clase ${window}.**`,
    `**Vacances de Nadal ${year} a les escoles: a la majoria de comunitats l'últim dia de classe és ${caEl(weekdayDay(main.date, L))}, i es torna a classe ${window}.**`,
    `**Christmas ${year} school holidays: in most regions the last day of class is ${weekdayDay(main.date, L)}, and school resumes ${window}.**`,
  );
  const earlier = before.length ? groupsInWords(before, L) : "";
  const later = after.length ? groupsInWords(after, L) : "";
  if (!earlier && !later) return head;
  const tail =
    earlier && later
      ? t(L, `Las clases terminan antes ${earlier}, y más tarde ${later}.`, `Les classes acaben abans ${earlier}, i més tard ${later}.`, `Classes end earlier ${earlier}, and later ${later}.`)
      : earlier
        ? t(L, `Las clases terminan antes ${earlier}.`, `Les classes acaben abans ${earlier}.`, `Classes end earlier ${earlier}.`)
        : t(L, `Las clases terminan más tarde ${later}.`, `Les classes acaben més tard ${later}.`, `Classes end later ${later}.`);
  return `${head} ${tail}`;
}

export function buildHubBody(locale: Locale = "es"): Block[] {
  const L = locale;
  const regions = hubRegions(L);
  const pendingList = pendingRegions(L);
  const withOther = regions.filter((r) => r.otherBreaks.length > 0 || r.hubOther);
  const provincial = regions.filter((r) => r.provinces?.length);
  const pendingNames = joinList(pendingList.map((p) => p.short), L);
  const scope =
    pendingList.length === 0
      ? t(L, "las 17 comunidades, Ceuta y Melilla", "les 17 comunitats, Ceuta i Melilla", "all 17 regions, Ceuta and Melilla")
      : t(
          L,
          `todas las comunidades y ciudades autónomas menos ${pendingNames}, que están por confirmar,`,
          `totes les comunitats i ciutats autònomes menys ${pendingNames}, que estan per confirmar,`,
          `every region and autonomous city except ${pendingNames}, still to be confirmed,`,
        );
  const blocks: Block[] = [
    {
      type: "paragraph",
      lead: true,
      text: t(
        L,
        `${christmasHubAnswer(regions)} ` +
          `Cada comunidad autónoma fija su calendario escolar con una orden o resolución de su consejería de Educación, y Ceuta y Melilla, que dependen del Ministerio de Educación, con la de su dirección provincial. ` +
          `Aquí están las fechas de ${scope} para el curso ${Y}, cada una con su texto oficial.`,
        `${christmasHubAnswer(regions)} ` +
          `Cada comunitat autònoma fixa el seu calendari escolar amb una ordre o resolució del seu departament d'Educació, i Ceuta i Melilla, que depenen del Ministeri d'Educació, amb la de la seva direcció provincial. ` +
          `Aquí hi ha les dates de ${scope} per al curs ${Y}, cadascuna amb el seu text oficial.`,
        `${christmasHubAnswer(regions)} ` +
          `Each of Spain's autonomous communities sets its school calendar through an order or resolution of its education department, and Ceuta and Melilla, which depend on the Ministry of Education, through one from their provincial directorate. ` +
          `Here are the dates for ${scope} for the ${Y} school year, each with its official text.`,
      ),
    },
    { type: "spainSchoolCalendar", region: "espana" },
    { type: "heading", level: 2, text: t(L, "Vacaciones de Navidad 2026 por comunidades", "Vacances de Nadal 2026 per comunitats", "Christmas holidays 2026 by region") },
    {
      type: "paragraph",
      text: t(
        L,
        "Ordenadas de la comunidad que empieza antes a la que empieza más tarde. «Sin clase» va del primer al último día sin clase que da cada orden, ambos incluidos.",
        "Ordenades de la comunitat que comença abans a la que comença més tard. «Sense classe» va del primer a l'últim dia sense classe que dona cada text oficial, tots dos inclosos.",
        "Sorted from the region that starts first to the one that starts last. “No class” runs from the first to the last day without class in each official text, both included.",
      ),
    },
    breakTable("christmas", L),
    { type: "heading", level: 2, text: t(L, "Semana Santa 2027 por comunidades", "Setmana Santa 2027 per comunitats", "Easter 2027 by region") },
    {
      type: "paragraph",
      text: t(
        L,
        "El Jueves Santo es el 25 de marzo de 2027 y el Viernes Santo, el 26, pero cada comunidad coloca las vacaciones escolares a su manera: antes, después o alrededor de la Semana Santa.",
        "El Dijous Sant és el 25 de març de 2027 i el Divendres Sant, el 26, però cada comunitat col·loca les vacances escolars a la seva manera: abans, després o al voltant de la Setmana Santa.",
        "Maundy Thursday is 25 March 2027 and Good Friday the 26th, but each region places the school holidays its own way: before, after or around Holy Week.",
      ),
    },
    breakTable("easter", L),
  ];
  if (withOther.length) {
    blocks.push(
      {
        type: "heading",
        level: 2,
        text: t(L, "Carnaval y otras vacaciones durante el curso", "Carnaval i altres vacances durant el curs", "Carnival and other holidays during the school year"),
      },
      {
        type: "paragraph",
        text: t(
          L,
          `Solo algunas comunidades fijan más periodos sin clase para todos sus colegios, además de Navidad y Semana Santa:`,
          `Només algunes comunitats fixen més períodes sense classe per a totes les seves escoles, a més de Nadal i Setmana Santa:`,
          `Only some regions set further periods without class for all their schools, besides Christmas and Easter:`,
        ),
      },
      {
        type: "list",
        ordered: false,
        items: withOther.map(
          (r) => `${link(r)}: ${r.otherBreaks.length ? r.otherBreaks.map((b) => `${breakName(b.name, L)} (${span(b, L)})`).join("; ") : r.hubOther!}.`,
        ),
      },
    );
  }
  const provincialNames = joinList(provincial.map((r) => (L === "es" ? r.short : (r.inShort ?? r.inName))), L);
  blocks.push(
    {
      type: "heading",
      level: 2,
      text: t(L, "Inicio y fin del curso 2026-2027 por comunidades", "Inici i final del curs 2026-2027 per comunitats", "Start and end of the 2026-2027 school year by region"),
    },
    {
      type: "table",
      caption: t(
        L,
        `Primer y último día del curso ${Y}, Infantil y Primaria`,
        `Primer i últim dia del curs ${Y}, Infantil i Primària`,
        `First and last day of the ${Y} school year, Infant and Primary`,
      ),
      headers: t(L, ["Comunidad", "Primer día", "Último día"], ["Comunitat", "Primer dia", "Últim dia"], ["Region", "First day", "Last day"]),
      rows: [...regions.map((r) => [link(r), shortStart(r), shortEnd(r)]), ...pendingRows(3, L)],
      note: t(
        L,
        "ESO, Bachillerato y FP pueden empezar o terminar otro día: las fechas por etapas están en la página de cada comunidad.",
        "ESO, Batxillerat i FP poden començar o acabar un altre dia: les dates per etapes són a la pàgina de cada comunitat.",
        "ESO, Bachillerato and vocational training may start or end on another day: the dates by stage are on each region's page.",
      ),
      stickyColumn: 0,
    },
    {
      type: "heading",
      level: 2,
      text: t(L, "Quién fija el calendario escolar y los días locales", "Qui fixa el calendari escolar i els dies locals", "Who sets the school calendar and the local days"),
    },
    {
      type: "paragraph",
      text: t(
        L,
        `El calendario de cada curso lo aprueba cada comunidad${provincial.length ? ` (en ${provincialNames}, cada provincia lo concreta con su propia resolución)` : ""}. Encima de esas fechas, cada colegio no tiene clase en las fiestas locales de su municipio, y en muchas comunidades el ayuntamiento, el consejo escolar municipal o el propio centro pueden fijar algún día no lectivo más. En Navarra y el País Vasco, además, cada centro aprueba su propio calendario dentro de un margen. Por eso, para un día suelto, manda el calendario del propio colegio.`,
        `El calendari de cada curs l'aprova cada comunitat${provincial.length ? ` (${provincialNames}, cada província el concreta amb la seva pròpia resolució)` : ""}. A sobre d'aquestes dates, cada escola no té classe les festes locals del seu municipi, i en moltes comunitats l'ajuntament, el consell escolar municipal o el mateix centre poden fixar algun dia no lectiu més. A Navarra i al País Basc, a més, cada centre aprova el seu propi calendari dins d'un marge. Per això, per a un dia solt, mana el calendari de la mateixa escola.`,
        `Each region approves the calendar for every school year${provincial.length ? ` (${provincialNames}, each province sets the details in its own resolution)` : ""}. On top of those dates, each school has no class on its municipality's local holidays, and in many regions the town council, the municipal school council or the school itself can add a non-teaching day or two. In Navarre and the Basque Country, each school also approves its own calendar within a margin. That is why, for any single day, the school's own calendar is what counts.`,
      ),
    },
    { type: "heading", level: 2, text: t(L, "La orden de cada comunidad", "El text oficial de cada comunitat", "Each region's official text") },
    {
      type: "list",
      ordered: false,
      items: [
        ...regions.map((r) => `${link(r)}: [${r.order.short}](${r.order.url}) (${orderWhere(r.order, L)}).`),
        ...pendingList.map((p) => `${p.short}: ${pending(L)}.`),
      ],
    },
    hubFaq(regions, L),
    {
      type: "paragraph",
      text: t(
        L,
        `Los festivos que caen en día lectivo salen de las dos tablas de fiestas laborales del BOE: la de 2026 (${BOE_2026.ref}) y la de 2027 (${BOE_2027.ref}). Los festivos y puentes de 2027 de cada comunidad están en el [calendario laboral 2027 por comunidades](${spainHubPath()}).`,
        `Els festius que cauen en dia lectiu surten de les dues taules de festes laborals del BOE: la del 2026 (${BOE_2026.ref}) i la del 2027 (${BOE_2027.ref}).`,
        `Public holidays that fall on teaching days come from the BOE's two tables of public holidays: 2026 (${BOE_2026.ref.replace("BOE de", "BOE of")}) and 2027 (${BOE_2027.ref.replace("BOE de", "BOE of")}).`,
      ),
    },
  );
  return blocks;
}

function hubFaq(regions: RegionCalendar[], locale: Locale): Block {
  const L = locale;
  const latest = t(L, "como muy tarde", "com a molt tard", "at the latest");
  const lastDays = groupsInWords(dayGroups(regions, "christmas", "last", latest), L);
  const firstDays = groupsInWords(dayGroups(regions, "christmas", "first", latest), L);
  const backDays = groupsInWords(dayGroups(regions, "christmas", "back", t(L, "como pronto", "com a molt aviat", "at the earliest")), L);
  const byEnd = [...regions].sort((a, b) => mainLevels(a).end.localeCompare(mainLevels(b).end));
  const earliestEnd = mainLevels(byEnd[0]!).end;
  const latestEnd = mainLevels(byEnd.at(-1)!).end;
  const off = joinList(regions.filter((r) => schoolDayIn(r, "2026-12-07").kind !== "school").map((r) => r.short), L);
  const on = joinList(regions.filter((r) => schoolDayIn(r, "2026-12-07").kind === "school").map((r) => r.short), L);
  return {
    type: "faq",
    title: t(L, "Preguntas frecuentes", "Preguntes freqüents", "Frequently asked questions"),
    items: [
      {
        question: t(L, "¿Cuándo empiezan las vacaciones de Navidad 2026 en los colegios?", "Quan comencen les vacances de Nadal 2026 a les escoles?", "When do the 2026 Christmas school holidays start?"),
        answer: t(
          L,
          `Depende de la comunidad. El primer día sin clase es ${firstDays}. El último día de clase es ${lastDays}. La tabla de Navidad tiene la orden de cada una.`,
          `Depèn de la comunitat. El primer dia sense classe és ${firstDays}. L'últim dia de classe és ${lastDays}. La taula de Nadal té el text oficial de cadascuna.`,
          `It depends on the region. The first day without class is ${firstDays}. The last day of class is ${lastDays}. The Christmas table has each one's official text.`,
        ),
      },
      {
        question: t(
          L,
          "¿Cuándo se vuelve al colegio después de Navidad?",
          "Quan es torna a l'escola després de Nadal?",
          "When does school go back after Christmas in Spain?",
        ),
        answer: t(L, `Se vuelve a clase ${backDays}.`, `Es torna a classe ${backDays}.`, `School resumes ${backDays}.`),
      },
      {
        question: t(L, "¿Cuándo termina el curso 2026-2027?", "Quan acaba el curs 2026-2027?", "When does the 2026-2027 school year end?"),
        answer: t(
          L,
          `En Infantil y Primaria, entre el ${weekdayDay(earliestEnd)} y el ${weekdayDay(latestEnd)}, según la comunidad.`,
          `A Infantil i Primària, entre el ${weekdayDay(earliestEnd, L)} i el ${weekdayDay(latestEnd, L)}, segons la comunitat.`,
          `In Infant and Primary, between ${weekdayDay(earliestEnd, L)} and ${weekdayDay(latestEnd, L)}, depending on the region.`,
        ),
      },
      {
        question: t(L, "¿Hay clase el 7 de diciembre de 2026?", "Hi ha classe el 7 de desembre de 2026?", "Is there school on 7 December 2026?"),
        answer: t(
          L,
          `Depende de la comunidad. No hay clase en ${off}: en unas es festivo, porque se traslada el Día de la Constitución, que cae en domingo, y en otras la orden lo declara no lectivo. En ${on} es día lectivo en el calendario general, salvo que el municipio o el centro lo fije como no lectivo.`,
          `Depèn de la comunitat. No hi ha classe en aquestes: ${off}. En unes és festiu, perquè s'hi trasllada el Dia de la Constitució, que cau en diumenge, i en d'altres el text oficial el declara no lectiu. En aquestes altres és dia lectiu al calendari general, tret que el municipi o el centre el fixi com a no lectiu: ${on}.`,
          `It depends on the region. These have no class: ${off}. In some it is a public holiday, because Constitution Day, which falls on a Sunday, moves to it, and in others the official text makes it a non-teaching day. In these it is a school day in the general calendar, unless the municipality or the school makes it a non-teaching day: ${on}.`,
        ),
      },
      {
        question: t(L, "¿Por qué mi colegio tiene un día libre que no sale aquí?", "Per què la meva escola té un dia lliure que no surt aquí?", "Why does my school have a day off that is not listed here?"),
        answer: t(
          L,
          "Porque además del calendario de la comunidad cuentan las dos fiestas locales de cada municipio y, según la comunidad, los días no lectivos que fijan el ayuntamiento, el consejo escolar municipal o el propio centro.",
          "Perquè a més del calendari de la comunitat compten les dues festes locals de cada municipi i, segons la comunitat, els dies no lectius que fixen l'ajuntament, el consell escolar municipal o el mateix centre.",
          "Because besides the regional calendar, each municipality's two local holidays count and, depending on the region, so do the non-teaching days set by the town council, the municipal school council or the school itself.",
        ),
      },
    ],
  };
}

export function hubExcerpt(locale: Locale = "es"): string {
  return t(
    locale,
    `Las fechas del curso ${Y} en cada comunidad, con su orden oficial: inicio, vacaciones de Navidad, Semana Santa, Carnaval y fin de curso.`,
    `Les dates del curs ${Y} a cada comunitat autònoma, amb el seu text oficial: inici, vacances de Nadal, Setmana Santa, Carnaval i final de curs.`,
    `The ${Y} school year dates in every Spanish region, each with its official text: start of term, Christmas holidays, Easter, Carnival and end of term.`,
  );
}

/** Every page this module publishes in one language, for the publish group and the tests. */
export function allSpainSchoolPaths(locale: Locale = "es"): string[] {
  return [HUB_PATHS[locale], ...SPAIN_REGIONS.map((r) => regionPath(r.slug, locale))];
}

export { CATALONIA };
