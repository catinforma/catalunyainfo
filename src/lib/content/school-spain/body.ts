import type { Block } from "@/lib/content/blocks";
import { addDays, weekdayIndex } from "@/lib/content/holidays/calendar";
import { communityPath, spainHubPath } from "@/lib/programmatic/spain-2027/paths";

import { BOE_2026, BOE_2027 } from "./holidays";
import {
  SPAIN_SCHOOL_YEAR,
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
import { CATALONIA, HUB_PATH, SPAIN_REGIONS, hubRegions, pendingRegions, regionPath } from "./regions";
import type { LevelDates, Period, RegionCalendar, SchoolOrder } from "./types";

/**
 * Bodies of the Spanish school-calendar pages: one per community and the hub.
 * Pure (no database, no server-only), so the tests build every page.
 *
 * Every sentence is computed from the region's record, which is transcribed
 * from its order; nothing here states a date of its own.
 */

const href = (path: string) => `/es/${path}/`;

/** The last weekday with class before a break. */
function lastClassBefore(region: RegionCalendar, period: Period): string {
  let iso = addDays(period.from, -1);
  for (let i = 0; i < 14; i++, iso = addDays(iso, -1)) {
    if (schoolDayIn(region, iso).kind === "school") return iso;
  }
  return addDays(period.from, -1);
}

/** "BOCM núm. 131, 4 de junio de 2026" / "web del Ministerio de Educación". */
export function orderWhere(order: SchoolOrder): string {
  const date = order.date ? `, ${dayMonth(order.date)} de ${order.date.slice(0, 4)}` : "";
  return `${order.bulletin}${order.number ? ` núm. ${order.number}` : ""}${date}`;
}

function orderLink(region: RegionCalendar): string {
  return `[${region.order.short}](${region.order.url}) (${orderWhere(region.order)})`;
}

/** "el viernes 18 de junio de 2027" or the window: "entre el 18 y el 22 de junio de 2027, según el centro". */
function startWords(level: LevelDates): string {
  return level.startText ?? (level.start ? `el ${fullDate(level.start)}` : "—");
}

function endWords(level: LevelDates): string {
  return level.endText ?? (level.end ? `el ${fullDate(level.end)}` : "—");
}

/** The short name after "de", with its article where Spanish needs one. */
const DE_SHORT: Record<string, string> = { PV: "del País Vasco", VC: "de la Comunidad Valenciana" };

/** "Calendario escolar 2026-2027 de Madrid: vacaciones de Navidad, Semana Santa y fin de curso". */
export function regionTitle(region: RegionCalendar): string {
  return `Calendario escolar ${SPAIN_SCHOOL_YEAR} ${DE_SHORT[region.boe] ?? `de ${region.short}`}: vacaciones de Navidad, Semana Santa y fin de curso`;
}

/** Stored fallback title (the rendered one is live: logic.ts liveRegionTitle). */
export function regionSeoTitle(region: RegionCalendar): string {
  return `Calendario escolar ${SPAIN_SCHOOL_YEAR} ${region.short}: Navidad y Semana Santa`;
}

export function regionExcerpt(region: RegionCalendar): string {
  const { start, end } = mainLevels(region);
  const main = region.levels[0]!;
  const ends = main.endEarliest ? `entre el ${dayMonth(main.endEarliest)} y el ${dayMonth(end)}` : `el ${dayMonth(end)}`;
  return `Curso ${SPAIN_SCHOOL_YEAR} ${region.inName}: empieza el ${dayMonth(start)}, Navidad ${region.christmas.label ?? span(region.christmas)}, Semana Santa ${span(region.easter)} y termina ${ends}, según la orden oficial.`;
}

/** The answer, before any section: the four dates and where they come from. */
function lead(region: RegionCalendar): string {
  const main = region.levels[0]!;
  const back = nextSchoolDay(region, region.christmas.to);
  const christmas = region.christmas.label
    ? `**Vacaciones de Navidad ${region.inName}: ${region.christmas.label}**. `
    : region.christmas.minimum
      ? `**Vacaciones de Navidad ${region.inName}: como mínimo ${longSpan(region.christmas)}**, ambos incluidos; cada centro puede alargarlas en su calendario. `
      : `**Vacaciones de Navidad ${region.inName}: ${longSpan(region.christmas)}**, ambos incluidos; se vuelve a clase el ${weekdayDay(back)}. `;
  return (
    christmas +
    `Semana Santa: ${longSpan(region.easter)}${region.easter.minimum ? " como mínimo" : ""}. En Infantil y Primaria el curso ${SPAIN_SCHOOL_YEAR} empieza ${startWords(main)} y termina ${endWords(main)}. ` +
    `Lo fija ${orderLink(region)}${region.provinces?.length ? ", y cada provincia lo concreta en su propia resolución" : ""}.`
  );
}

/** Navarra, País Vasco: each school approves its own calendar inside the text's limits. */
function flexibleCallout(region: RegionCalendar): Block[] {
  if (!region.flexible) return [];
  return [{ type: "callout", tone: "info", title: "Cada centro aprueba su calendario", text: region.flexible }];
}

function christmasSection(region: RegionCalendar): Block[] {
  const c = region.christmas;
  const last = lastClassBefore(region, c);
  const back = nextSchoolDay(region, c.to);
  const heading: Block = { type: "heading", level: 2, text: `Vacaciones de Navidad ${c.from.slice(0, 4)}-${c.to.slice(0, 4)} ${region.inName}` };
  if (c.label) {
    const rows = provinceCalendars(region).map(({ name, calendar }) => {
      const p = calendar.christmas;
      return [name, weekdayDay(lastClassBefore(calendar, p)), span(p), weekdayDay(nextSchoolDay(calendar, p.to))];
    });
    return [
      heading,
      { type: "paragraph", text: `Cada provincia fija su Navidad: no hay clase ${c.label}. Así queda en cada una:` },
      {
        type: "table",
        caption: `Vacaciones de Navidad ${c.from.slice(0, 4)}-${c.to.slice(0, 4)} por provincias ${region.inName}`,
        headers: ["Provincia", "Último día de clase", "Sin clase", "Vuelta a clase"],
        rows: [...rows, ...(region.pendingProvinces ?? []).map((name) => [name, "por confirmar", "por confirmar", "por confirmar"])],
        note: "Infantil y Primaria. Resoluciones de las delegaciones territoriales; no cuenta las fiestas locales.",
        stickyColumn: 0,
      },
    ];
  }
  return [
    heading,
    {
      type: "paragraph",
      text: c.minimum
        ? `Como mínimo no hay clase ${longSpan(c)}, los dos días incluidos: el último día de clase es como muy tarde el **${weekdayDay(last)}** y se vuelve como pronto el **${weekdayDay(back)}**. Cada centro puede alargarlas en su calendario.`
        : `No hay clase ${longSpan(c)}, los dos días incluidos. El último día de clase antes de las vacaciones es el **${weekdayDay(last)}** y se vuelve al colegio el **${weekdayDay(back)}**.${c.note ? ` ${c.note}` : ""}`,
    },
  ];
}

function easterSection(region: RegionCalendar): Block[] {
  const e = region.easter;
  const last = lastClassBefore(region, e);
  const back = nextSchoolDay(region, e.to);
  return [
    { type: "heading", level: 2, text: `Semana Santa ${e.from.slice(0, 4)} en los colegios ${region.deName}` },
    {
      type: "paragraph",
      text: e.minimum
        ? `Como mínimo, las vacaciones de Semana Santa van ${longSpan(e)}, ambos incluidos (de Jueves Santo a Lunes de Pascua): último día de clase como muy tarde el ${weekdayDay(last)} y vuelta como pronto el **${weekdayDay(back)}**. Cada centro puede alargarlas.`
        : `Las vacaciones de Semana Santa van ${longSpan(e)}, ambos incluidos. Último día de clase: ${weekdayDay(last)}; vuelta a clase: **${weekdayDay(back)}**.${e.note ? ` ${e.note}` : ""}`,
    },
  ];
}

function otherBreaksSection(region: RegionCalendar): Block[] {
  if (region.otherBreaks.length === 0) return [];
  return [
    { type: "heading", level: 2, text: `Otras vacaciones del curso ${region.inName}` },
    {
      type: "paragraph",
      text: `Además de Navidad y Semana Santa, la orden fija ${region.otherBreaks.length === 1 ? "este periodo" : "estos periodos"} sin clase:`,
    },
    {
      type: "list",
      ordered: false,
      items: region.otherBreaks.map((b) => `**${b.name}**: ${longSpan(b)}${b.note ? ` (${b.note})` : ""}.`),
    },
  ];
}

function levelsSection(region: RegionCalendar): Block[] {
  return [
    { type: "heading", level: 2, text: "Inicio y fin de curso por etapas" },
    {
      type: "paragraph",
      text: "Infantil, Primaria, ESO, Bachillerato y Formación Profesional no siempre empiezan ni terminan el mismo día. Estas son las fechas de la orden, tal como las agrupa:",
    },
    {
      type: "table",
      caption: `Inicio y fin del curso ${SPAIN_SCHOOL_YEAR} ${region.inName}`,
      headers: ["Etapa", "Empieza", "Termina"],
      rows: region.levels.map((l) => [
        l.levels,
        l.startText ?? (l.start ? fullDate(l.start) : "—"),
        `${l.endText ?? (l.end ? fullDate(l.end) : "—")}${l.note ? ` (${l.note})` : ""}`,
      ]),
      note: `${region.order.short} (${region.order.bulletin}).`,
      stickyColumn: 0,
    },
  ];
}

/** Every weekday without class for the whole community, outside the breaks. */
export function daysOffRows(region: RegionCalendar): { date: string; what: string }[] {
  const byDate = new Map<string, string>();
  for (const h of holidaysInTerm(region)) byDate.set(h.date, `Festivo: ${h.name}`);
  const { start, end } = mainLevels(region);
  const inBreak = (iso: string) =>
    [region.christmas, region.easter, ...region.otherBreaks].some((p) => iso >= p.from && iso <= p.to);
  for (const d of region.nonTeaching) {
    const wd = weekdayIndex(d.date);
    if (wd === 0 || wd === 6 || inBreak(d.date) || d.date < start || d.date > end) continue;
    const what = `${d.reason}${d.levels ? ` (solo ${d.levels})` : ""}`;
    byDate.set(d.date, byDate.has(d.date) ? `${byDate.get(d.date)}; ${what}` : `Día no lectivo: ${what}`);
  }
  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, what]) => ({ date, what }));
}

function daysOffSection(region: RegionCalendar): Block[] {
  const rows = daysOffRows(region);
  if (rows.length === 0) return [];
  const partial = region.nonTeaching.some((d) => d.partial || d.levels);
  return [
    { type: "heading", level: 2, text: `Días sin clase ${region.inName} en el curso ${SPAIN_SCHOOL_YEAR}` },
    {
      type: "paragraph",
      text: `Fuera de las vacaciones, estos días laborables no hay clase en los colegios ${region.deName}: los festivos nacionales y autonómicos que caen en día lectivo y los días que la orden declara no lectivos${partial ? " (los que no valen para todos dicen a quién se aplican)" : ""}.`,
    },
    {
      type: "table",
      caption: `Días sin clase ${region.inName}, ${SPAIN_SCHOOL_YEAR}`,
      headers: ["Fecha", "Por qué no hay clase"],
      rows: rows.map((r) => [fullDate(r.date), r.what]),
      note: `Festivos: BOE de 28 de octubre de 2025 (2026) y de 13 de octubre de 2026 (2027). Días no lectivos: ${region.order.short}.`,
      stickyColumn: 0,
    },
    { type: "paragraph", text: sevenDecember(region) },
  ];
}

/** "¿Hay clase el 7 de diciembre?": the question of the December long weekend. */
function sevenDecember(region: RegionCalendar): string {
  const day = schoolDayIn(region, "2026-12-07");
  if (day.kind === "holiday") {
    return `El **lunes 7 de diciembre de 2026** es festivo ${region.inName} (se traslada el Día de la Constitución, que cae en domingo), así que con el martes 8 el puente de diciembre es de cuatro días sin clase, del sábado 5 al martes 8.`;
  }
  if (day.kind === "nonTeaching") {
    return `El **lunes 7 de diciembre de 2026** no es festivo laboral ${region.inName}, pero la orden lo declara día sin clase (${day.reason}): con el martes 8, festivo, los colegios tienen cuatro días seguidos sin clase, del sábado 5 al martes 8.`;
  }
  return `El **lunes 7 de diciembre de 2026** no es festivo ${region.inName} y la orden no lo declara no lectivo: solo el martes 8 (Inmaculada Concepción) es festivo. Si un colegio no tiene clase el 7 será porque lo fija el municipio o el propio centro${region.flexible ? " en su calendario" : ""}.`;
}

function localSection(region: RegionCalendar): Block[] {
  return [
    { type: "heading", level: 2, text: "Fiestas locales y días no lectivos de cada municipio" },
    { type: "paragraph", text: region.localDays },
    {
      type: "paragraph",
      text: "Por eso dos colegios de la misma comunidad pueden no coincidir algún día suelto. Para saber qué días tiene libres un centro concreto, lo más fiable es su propio calendario, que suele estar en su web o en la secretaría, o el ayuntamiento.",
    },
  ];
}

function provincesSection(region: RegionCalendar): Block[] {
  const provinces = region.provinces ?? [];
  if (provinces.length === 0) return [];
  const main = region.levels[0]!;
  return [
    { type: "heading", level: 2, text: `Calendario escolar por provincias ${region.inName}` },
    {
      type: "paragraph",
      text: `${region.inName.replace(/^en /, "En ")} cada provincia aprueba después su calendario con una resolución propia, dentro del marco que fija ${theOrder(region.order.short)}.${region.provincesNote ? ` ${region.provincesNote}` : ""}`,
    },
    {
      type: "table",
      caption: `Calendario escolar ${SPAIN_SCHOOL_YEAR} por provincias ${region.inName}`,
      headers: ["Provincia", "Inicio", "Navidad", "Semana Santa", "Fin de curso", "Otros días sin clase", "Resolución"],
      rows: [
        ...provinces.map((p) => {
          const row = p.levels?.[0] ?? main;
          const others = [
            ...(p.otherBreaks ?? []).map((b) => `${b.name} (${span(b)})`),
            ...(p.nonTeaching ?? []).map((d) => `${dayMonth(d.date)} (${d.reason})`),
          ];
          return [
            p.name,
            row.start ? dayMonth(row.start) : "—",
            span(p.christmas ?? region.christmas),
            span(p.easter ?? region.easter),
            row.end ? dayMonth(row.end) : "—",
            others.length ? others.join("; ") : "los de la orden",
            `[${p.order.short}](${p.order.url})`,
          ];
        }),
        ...(region.pendingProvinces ?? []).map((name) => [name, "por confirmar", "por confirmar", "por confirmar", "por confirmar", "por confirmar", "resolución 2026-2027 no localizada"]),
      ],
      note: "Infantil y Primaria. Resoluciones de las delegaciones provinciales.",
      stickyColumn: 0,
    },
    ...(provinces.some((p) => p.localDays)
      ? [
          { type: "paragraph", text: "Días locales, según la resolución de cada provincia:" } as Block,
          { type: "list", ordered: false, items: provinces.filter((p) => p.localDays).map((p) => `**${p.name}.** ${p.localDays}`) } as Block,
        ]
      : []),
  ];
}

/** Murcia: every municipality's local holidays and other days without class, from the order's annex. */
function townSection(region: RegionCalendar): Block[] {
  const towns = [...(region.townDays ?? [])].sort((a, b) => a.town.localeCompare(b.town, "es"));
  if (towns.length === 0) return [];
  const short = (iso: string) => `${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`;
  return [
    { type: "heading", level: 2, text: `Días sin clase de cada municipio ${region.inName}` },
    {
      type: "paragraph",
      text: `La resolución fija, municipio por municipio, los dos festivos locales y los otros días no lectivos que ha propuesto cada Consejo Escolar Municipal. Valen para todos los colegios e institutos del municipio (día/mes; septiembre a diciembre son de 2026 y enero a junio, de 2027).`,
    },
    {
      type: "table",
      caption: `Festivos locales y días no lectivos por municipio, curso ${SPAIN_SCHOOL_YEAR}`,
      headers: ["Municipio", "Festivos locales", "Otros días sin clase"],
      rows: towns.map((t) => [
        t.town,
        t.local.map(short).join(", "),
        `${t.other.map(short).join(", ")}${t.note ? ` (${t.note})` : ""}`,
      ]),
      note: `${region.order.short}, anexo V (${region.order.bulletin}).`,
      stickyColumn: 0,
    },
  ];
}

/** The same community's 2027 work calendar (/es/festivos/2027/<slug>/), for the holidays and long weekends. */
function workCalendarLink(region: RegionCalendar): Block {
  return {
    type: "paragraph",
    text: `Para los festivos laborales y los puentes de 2027, mira el [calendario laboral 2027 ${region.deName}](${communityPath(region.slug)}).`,
  };
}

function notesSection(region: RegionCalendar): Block[] {
  if (region.notes.length === 0) return [];
  return [
    { type: "heading", level: 2, text: "Otras fechas y reglas que fija la orden" },
    { type: "list", ordered: false, items: region.notes },
  ];
}

function orderSection(region: RegionCalendar): Block[] {
  const o = region.order;
  const text = [
    `El calendario escolar ${region.inName} lo fija cada curso la ${o.issuer}. El de ${SPAIN_SCHOOL_YEAR} está en: **${o.title}** (${orderWhere(o)}). [Texto oficial](${o.url}).`,
  ];
  if (o.departmentUrl) text.push(`La administración educativa lo recoge también en [su página del calendario escolar](${o.departmentUrl}).`);
  if (region.schoolDays) text.push(`El curso tiene ${region.schoolDays} días lectivos${region.flexible ? " como mínimo" : ""}.`);
  text.push(`Fechas leídas en el texto oficial el ${fullDate(region.verifiedAt).replace(/^\S+ /, "")}.`);
  return [
    { type: "heading", level: 2, text: "La orden oficial del calendario escolar" },
    { type: "paragraph", text: text.join(" ") },
  ];
}

function regionFaq(region: RegionCalendar): Block {
  const c = region.christmas;
  const e = region.easter;
  const main = region.levels[0]!;
  const sevenDec = schoolDayIn(region, "2026-12-07");
  const minimum = (p: Period) => (p.minimum ? " Es el mínimo: cada centro puede alargarlas." : "");
  const sevenAnswer =
    sevenDec.kind === "school"
      ? `No es festivo ${region.inName} y la orden no lo declara no lectivo: es día lectivo en el calendario general, y solo el martes 8 (Inmaculada Concepción) es festivo. Algunos municipios o centros pueden tenerlo como día no lectivo local: pregúntalo en el colegio.`
      : `No. ${sevenDec.kind === "holiday" ? `Es festivo ${region.inName} (${sevenDec.name})` : sevenDec.kind === "nonTeaching" ? `Es día no lectivo (${sevenDec.reason})` : "No es día lectivo"}, y el martes 8 también es festivo: del sábado 5 al martes 8 no hay clase.`;
  const items = [
    {
      question: `¿Cuándo empiezan las vacaciones de Navidad ${c.from.slice(0, 4)} ${region.inName}?`,
      answer: c.label
        ? `Depende de la provincia: no hay clase ${c.label}. La tabla de Navidad por provincias tiene el último día de clase y la vuelta de cada una.`
        : `El ${weekdayDay(c.from)} es el primer día sin clase y el ${weekdayDay(c.to)} el último, según ${theOrder(region.order.short)}. El último día de clase es el ${weekdayDay(lastClassBefore(region, c))}.${minimum(c)}`,
    },
    {
      question: `¿Cuándo se vuelve al cole después de Navidad ${region.inName}?`,
      answer: c.label
        ? `Según la provincia: ${joinList(provinceCalendars(region).map(({ name, calendar }) => `${name}, el ${weekdayDay(nextSchoolDay(calendar, calendar.christmas.to))}`))}.`
        : c.minimum
          ? `Depende del centro: las vacaciones duran como mínimo hasta el ${weekdayDay(c.to)}, así que como pronto se vuelve el ${fullDate(nextSchoolDay(region, c.to))}.`
          : `El ${fullDate(nextSchoolDay(region, c.to))}.`,
    },
    { question: `¿Hay clase el 7 de diciembre de 2026 ${region.inName}?`, answer: sevenAnswer },
    {
      question: `¿Cuándo son las vacaciones de Semana Santa ${e.from.slice(0, 4)} ${region.inName}?`,
      answer: `${longSpan(e).replace(/^del/, "Del")}, ambos incluidos. Se vuelve a clase el ${weekdayDay(nextSchoolDay(region, e.to))}.${minimum(e)}`,
    },
    ...(region.otherBreaks.length
      ? [
          {
            question: `¿Hay otras vacaciones durante el curso ${region.inName}?`,
            answer: `Sí: ${joinList(region.otherBreaks.map((b) => `${breakName(b.name)}, ${span(b)}`))}.`,
          },
        ]
      : []),
    {
      question: `¿Cuándo empieza y termina el curso ${SPAIN_SCHOOL_YEAR} ${region.inName}?`,
      answer: `En Infantil y Primaria empieza ${startWords(main)} y termina ${endWords(main)}.${region.levels.length > 1 ? " Las demás etapas tienen sus fechas en la tabla de inicio y fin de curso por etapas." : ""}`,
    },
  ];
  return { type: "faq", title: "Preguntas frecuentes", items };
}

/** The whole body of one community's page. */
export function buildRegionBody(region: RegionCalendar): Block[] {
  return [
    { type: "paragraph", lead: true, text: lead(region) },
    ...flexibleCallout(region),
    { type: "spainSchoolCalendar", region: region.slug },
    ...christmasSection(region),
    ...easterSection(region),
    ...otherBreaksSection(region),
    ...levelsSection(region),
    ...daysOffSection(region),
    workCalendarLink(region),
    ...provincesSection(region),
    ...localSection(region),
    ...townSection(region),
    ...notesSection(region),
    ...orderSection(region),
    regionFaq(region),
    {
      type: "paragraph",
      text: `¿Y en otras comunidades? Las fechas de todas, una al lado de otra, están en el [calendario escolar ${SPAIN_SCHOOL_YEAR} por comunidades](${href(HUB_PATH)}).`,
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                        */
/* -------------------------------------------------------------------------- */

export const HUB_TITLE = `Calendario escolar ${SPAIN_SCHOOL_YEAR} en España por comunidades`;
export const HUB_SEO_TITLE = `Calendario escolar ${SPAIN_SCHOOL_YEAR} por comunidades: Navidad y Semana Santa`;

function link(region: RegionCalendar): string {
  return `[${region.short}](${href(regionPath(region.slug))})`;
}

const PENDING = "por confirmar";

/** "por confirmar" rows: communities whose 2026-2027 text is not transcribed yet. */
function pendingRows(cells: number): string[][] {
  return pendingRegions().map((p) => [p.short, ...Array.from({ length: cells - 1 }, () => PENDING)]);
}

function breakTable(kind: "christmas" | "easter"): Block {
  const regions = hubRegions().sort((a, b) => a[kind].from.localeCompare(b[kind].from) || a.short.localeCompare(b.short, "es"));
  const name = kind === "christmas" ? "Navidad" : "Semana Santa";
  return {
    type: "table",
    caption: `Vacaciones de ${name} por comunidades, curso ${SPAIN_SCHOOL_YEAR}`,
    headers: ["Comunidad", "Último día de clase", "Sin clase", "Vuelta a clase"],
    rows: [
      ...regions.map((r) => [
        link(r),
        r[kind].label ? "según la provincia" : weekdayDay(lastClassBefore(r, r[kind])),
        r[kind].label ?? `${span(r[kind])}${r[kind].minimum ? " (mínimo)" : ""}`,
        r[kind].label ? "según la provincia" : weekdayDay(nextSchoolDay(r, r[kind].to)),
      ]),
      ...pendingRows(4),
    ],
    note: "Infantil y Primaria. Cada fila, según la orden o resolución de su comunidad; el último día de clase y la vuelta no cuentan fiestas locales.",
    stickyColumn: 0,
  };
}

/** "lunes 7 de septiembre", or the window's words, for the start and end table. */
function shortStart(region: RegionCalendar): string {
  const main = region.levels[0]!;
  return main.startText ? main.startText.replace(/ de 2026.*$/, "") : weekdayDay(main.start!);
}

function shortEnd(region: RegionCalendar): string {
  const main = region.levels[0]!;
  return main.endText ? main.endText.replace(/ de 2027.*$/, "") : fullDate(main.end!);
}

export function buildHubBody(): Block[] {
  const regions = hubRegions();
  const pending = pendingRegions();
  const christmasStarts = [...new Set(regions.map((r) => r.christmas.from))].sort();
  const firstXmas = christmasStarts[0]!;
  const lastXmas = christmasStarts.at(-1)!;
  const withOther = regions.filter((r) => r.otherBreaks.length > 0 || r.hubOther);
  const provincial = regions.filter((r) => r.provinces?.length);
  const scope =
    pending.length === 0
      ? "las 17 comunidades, Ceuta y Melilla"
      : `todas las comunidades y ciudades autónomas menos ${joinList(pending.map((p) => p.short))}, que están por confirmar,`;
  const blocks: Block[] = [
    {
      type: "paragraph",
      lead: true,
      text:
        `**Las vacaciones de Navidad de 2026 empiezan entre el ${weekdayDay(firstXmas)} y el ${weekdayDay(lastXmas)}**, según la comunidad. ` +
        `Cada comunidad autónoma fija su calendario escolar con una orden o resolución de su consejería de Educación, y Ceuta y Melilla, que dependen del Ministerio de Educación, con la de su dirección provincial. ` +
        `Aquí están las fechas de ${scope} para el curso ${SPAIN_SCHOOL_YEAR}, cada una con su texto oficial.`,
    },
    { type: "spainSchoolCalendar", region: "espana" },
    { type: "heading", level: 2, text: "Vacaciones de Navidad 2026 por comunidades" },
    {
      type: "paragraph",
      text: "Ordenadas de la comunidad que empieza antes a la que empieza más tarde. «Sin clase» va del primer al último día sin clase que da cada orden, ambos incluidos.",
    },
    breakTable("christmas"),
    { type: "heading", level: 2, text: "Semana Santa 2027 por comunidades" },
    {
      type: "paragraph",
      text: "El Jueves Santo es el 25 de marzo de 2027 y el Viernes Santo, el 26, pero cada comunidad coloca las vacaciones escolares a su manera: antes, después o alrededor de la Semana Santa.",
    },
    breakTable("easter"),
  ];
  if (withOther.length) {
    blocks.push(
      { type: "heading", level: 2, text: "Carnaval y otras vacaciones durante el curso" },
      {
        type: "paragraph",
        text: `Solo algunas comunidades fijan más periodos sin clase para todos sus colegios, además de Navidad y Semana Santa:`,
      },
      {
        type: "list",
        ordered: false,
        items: withOther.map(
          (r) =>
            `${link(r)}: ${r.otherBreaks.length ? r.otherBreaks.map((b) => `${breakName(b.name)} (${span(b)})`).join("; ") : r.hubOther!}.`,
        ),
      },
    );
  }
  blocks.push(
    { type: "heading", level: 2, text: "Inicio y fin del curso 2026-2027 por comunidades" },
    {
      type: "table",
      caption: `Primer y último día del curso ${SPAIN_SCHOOL_YEAR}, Infantil y Primaria`,
      headers: ["Comunidad", "Primer día", "Último día"],
      rows: [...regions.map((r) => [link(r), shortStart(r), shortEnd(r)]), ...pendingRows(3)],
      note: "ESO, Bachillerato y FP pueden empezar o terminar otro día: las fechas por etapas están en la página de cada comunidad.",
      stickyColumn: 0,
    },
    { type: "heading", level: 2, text: "Quién fija el calendario escolar y los días locales" },
    {
      type: "paragraph",
      text: `El calendario de cada curso lo aprueba cada comunidad${provincial.length ? ` (en ${joinList(provincial.map((r) => r.short))}, cada provincia lo concreta con su propia resolución)` : ""}. Encima de esas fechas, cada colegio no tiene clase en las fiestas locales de su municipio, y en muchas comunidades el ayuntamiento, el consejo escolar municipal o el propio centro pueden fijar algún día no lectivo más. En Navarra y el País Vasco, además, cada centro aprueba su propio calendario dentro de un margen. Por eso, para un día suelto, manda el calendario del propio colegio.`,
    },
    { type: "heading", level: 2, text: "La orden de cada comunidad" },
    {
      type: "list",
      ordered: false,
      items: [
        ...regions.map((r) => `${link(r)}: [${r.order.short}](${r.order.url}) (${orderWhere(r.order)}).`),
        ...pending.map((p) => `${p.short}: ${PENDING}.`),
      ],
    },
    hubFaq(regions),
    {
      type: "paragraph",
      text: `Los festivos que caen en día lectivo salen de las dos tablas de fiestas laborales del BOE: la de 2026 (${BOE_2026.ref}) y la de 2027 (${BOE_2027.ref}). Los festivos y puentes de 2027 de cada comunidad están en el [calendario laboral 2027 por comunidades](${spainHubPath()}).`,
    },
  );
  return blocks;
}

function hubFaq(regions: RegionCalendar[]): Block {
  const byXmas = [...regions].sort((a, b) => a.christmas.from.localeCompare(b.christmas.from));
  const first = byXmas[0]!;
  const firstNames = byXmas.filter((r) => r.christmas.from === first.christmas.from).map((r) => r.short);
  const last = byXmas.at(-1)!;
  const lastNames = byXmas.filter((r) => r.christmas.from === last.christmas.from).map((r) => r.short);
  const byEnd = [...regions].sort((a, b) => mainLevels(a).end.localeCompare(mainLevels(b).end));
  const earliestEnd = mainLevels(byEnd[0]!).end;
  const latestEnd = mainLevels(byEnd.at(-1)!).end;
  return {
    type: "faq",
    title: "Preguntas frecuentes",
    items: [
      {
        question: "¿Cuándo empiezan las vacaciones de Navidad 2026 en los colegios?",
        answer: `Depende de la comunidad: el primer día sin clase va del ${weekdayDay(first.christmas.from)} (${joinList(firstNames)}) al ${weekdayDay(last.christmas.from)} (${joinList(lastNames)}). La tabla de Navidad tiene todas.`,
      },
      {
        question: "¿Cuándo termina el curso 2026-2027?",
        answer: `En Infantil y Primaria, entre el ${weekdayDay(earliestEnd)} y el ${weekdayDay(latestEnd)}, según la comunidad.`,
      },
      {
        question: "¿Hay clase el 7 de diciembre de 2026?",
        answer: `Depende de la comunidad. No hay clase en ${joinList(regions.filter((r) => schoolDayIn(r, "2026-12-07").kind !== "school").map((r) => r.short))}: en unas es festivo, porque se traslada el Día de la Constitución, que cae en domingo, y en otras la orden lo declara no lectivo. En ${joinList(regions.filter((r) => schoolDayIn(r, "2026-12-07").kind === "school").map((r) => r.short))} es día lectivo en el calendario general, salvo que el municipio o el centro lo fije como no lectivo.`,
      },
      {
        question: "¿Por qué mi colegio tiene un día libre que no sale aquí?",
        answer: "Porque además del calendario de la comunidad cuentan las dos fiestas locales de cada municipio y, según la comunidad, los días no lectivos que fijan el ayuntamiento, el consejo escolar municipal o el propio centro.",
      },
    ],
  };
}

export function hubExcerpt(): string {
  return `Las fechas del curso ${SPAIN_SCHOOL_YEAR} en cada comunidad, con su orden oficial: inicio, vacaciones de Navidad, Semana Santa, Carnaval y fin de curso.`;
}

/** Every page this module publishes, for the publish group and the tests. */
export function allSpainSchoolPaths(): string[] {
  return [HUB_PATH, ...SPAIN_REGIONS.map((r) => regionPath(r.slug))];
}

export { CATALONIA };
