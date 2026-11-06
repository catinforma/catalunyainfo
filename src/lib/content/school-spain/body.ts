import type { Block } from "@/lib/content/blocks";
import { addDays, weekdayIndex } from "@/lib/content/holidays/calendar";

import { BOE_2026, BOE_2027 } from "./holidays";
import {
  SPAIN_SCHOOL_YEAR,
  dayMonth,
  fullDate,
  holidaysInTerm,
  joinList,
  longSpan,
  mainLevels,
  nextSchoolDay,
  schoolDayIn,
  span,
  weekdayDay,
} from "./logic";
import { CATALONIA, HUB_PATH, SPAIN_REGIONS, hubRegions, regionPath } from "./regions";
import type { Period, RegionCalendar } from "./types";

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

function orderLink(region: RegionCalendar): string {
  const o = region.order;
  return `[${o.short}](${o.url}) (${o.bulletin}${o.number ? ` núm. ${o.number}` : ""}, ${dayMonth(o.date)} de ${o.date.slice(0, 4)})`;
}

/** "Vacaciones de Navidad 2026-2027 en Madrid", the H1 the brief asks for. */
export function regionTitle(region: RegionCalendar): string {
  return `Calendario escolar ${SPAIN_SCHOOL_YEAR} de ${region.short}: vacaciones de Navidad, Semana Santa y fin de curso`;
}

/** Stored fallback title (the rendered one is live: logic.ts liveRegionTitle). */
export function regionSeoTitle(region: RegionCalendar): string {
  return `Calendario escolar ${SPAIN_SCHOOL_YEAR} ${region.short}: Navidad y Semana Santa`;
}

export function regionExcerpt(region: RegionCalendar): string {
  const { start, end } = mainLevels(region);
  return `Curso ${SPAIN_SCHOOL_YEAR} ${region.inName}: empieza el ${dayMonth(start)}, Navidad ${span(region.christmas)}, Semana Santa ${span(region.easter)} y termina el ${dayMonth(end)}, según la orden oficial.`;
}

/** The answer, before any section: the four dates and where they come from. */
function lead(region: RegionCalendar): string {
  const { start, end } = mainLevels(region);
  const back = nextSchoolDay(region, region.christmas.to);
  return (
    `**Vacaciones de Navidad ${region.inName}: ${longSpan(region.christmas)}**, ambos incluidos; se vuelve a clase el ${weekdayDay(back)}. ` +
    `Semana Santa: ${longSpan(region.easter)}. En Infantil y Primaria el curso ${SPAIN_SCHOOL_YEAR} empieza el ${fullDate(start)} y termina el ${fullDate(end)}. ` +
    `Lo fija ${orderLink(region)}${region.provinces?.length ? ", y cada provincia concreta sus días en su propia resolución" : ""}.`
  );
}

function christmasSection(region: RegionCalendar): Block[] {
  const c = region.christmas;
  const last = lastClassBefore(region, c);
  const back = nextSchoolDay(region, c.to);
  return [
    { type: "heading", level: 2, text: `Vacaciones de Navidad ${c.from.slice(0, 4)}-${c.to.slice(0, 4)} ${region.inName}` },
    {
      type: "paragraph",
      text: `No hay clase ${longSpan(c)}, los dos días incluidos. El último día de clase antes de las vacaciones es el **${weekdayDay(last)}** y se vuelve al colegio el **${weekdayDay(back)}**.`,
    },
  ];
}

function easterSection(region: RegionCalendar): Block[] {
  const e = region.easter;
  const last = lastClassBefore(region, e);
  const back = nextSchoolDay(region, e.to);
  return [
    { type: "heading", level: 2, text: `Semana Santa ${e.from.slice(0, 4)} en los colegios ${region.inName.replace(/^en /, "de ")}` },
    {
      type: "paragraph",
      text: `Las vacaciones de Semana Santa van ${longSpan(e)}, ambos incluidos. Último día de clase: ${weekdayDay(last)}; vuelta a clase: **${weekdayDay(back)}**.`,
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
        l.start ? fullDate(l.start) : "—",
        `${l.end ? fullDate(l.end) : "—"}${l.note ? ` (${l.note})` : ""}`,
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
  for (const d of region.nonTeaching) {
    const wd = weekdayIndex(d.date);
    if (wd === 0 || wd === 6) continue;
    byDate.set(d.date, byDate.has(d.date) ? `${byDate.get(d.date)} (${d.reason})` : `Día no lectivo: ${d.reason}`);
  }
  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, what]) => ({ date, what }));
}

function daysOffSection(region: RegionCalendar): Block[] {
  const rows = daysOffRows(region);
  if (rows.length === 0) return [];
  const sevenDec = rows.some((r) => r.date === "2026-12-07");
  return [
    { type: "heading", level: 2, text: `Días sin clase ${region.inName} en el curso ${SPAIN_SCHOOL_YEAR}` },
    {
      type: "paragraph",
      text: `Fuera de las vacaciones, estos días laborables no hay clase en ningún colegio ${region.inName.replace(/^en /, "de ")}: los festivos nacionales y autonómicos que caen en día lectivo y los días que la orden declara no lectivos.`,
    },
    {
      type: "table",
      caption: `Días sin clase ${region.inName}, ${SPAIN_SCHOOL_YEAR}`,
      headers: ["Fecha", "Por qué no hay clase"],
      rows: rows.map((r) => [fullDate(r.date), r.what]),
      note: `Festivos: BOE de 28 de octubre de 2025 (2026) y de 13 de octubre de 2026 (2027). Días no lectivos: ${region.order.short}.`,
      stickyColumn: 0,
    },
    {
      type: "paragraph",
      text: sevenDec
        ? `El **lunes 7 de diciembre de 2026** es festivo ${region.inName} (se traslada el Día de la Constitución, que cae en domingo), así que con el martes 8 el puente de diciembre es de cuatro días sin clase.`
        : `El **lunes 7 de diciembre de 2026** no es festivo ${region.inName}: solo lo es el martes 8 (Inmaculada Concepción). Si no hay clase el 7 será porque lo fija el municipio o el centro.`,
    },
  ];
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
  return [
    { type: "heading", level: 2, text: `Calendario escolar por provincias ${region.inName}` },
    {
      type: "paragraph",
      text: `${region.inName.replace(/^en /, "En ")} cada provincia aprueba su calendario con una resolución propia, dentro del marco común. Estas son las fechas de Infantil y Primaria de cada una:`,
    },
    {
      type: "table",
      caption: `Calendario escolar ${SPAIN_SCHOOL_YEAR} por provincias ${region.inName}`,
      headers: ["Provincia", "Inicio", "Navidad", "Semana Santa", "Fin de curso", "Resolución"],
      rows: provinces.map((p) => {
        const row = p.levels[0];
        return [
          p.name,
          row?.start ? dayMonth(row.start) : "—",
          span(p.christmas),
          span(p.easter),
          row?.end ? dayMonth(row.end) : "—",
          `[${p.order.short}](${p.order.url})`,
        ];
      }),
      stickyColumn: 0,
    },
    ...provinces
      .filter((p) => p.nonTeaching.length > 0 || p.otherBreaks.length > 0)
      .map(
        (p) =>
          ({
            type: "paragraph",
            text: `**${p.name}.** ${[
              ...p.otherBreaks.map((b) => `${b.name}: ${span(b)}`),
              ...p.nonTeaching.map((d) => `${weekdayDay(d.date)}: ${d.reason}`),
            ].join("; ")}.`,
          }) as Block,
      ),
  ];
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
    `El calendario escolar ${region.inName} lo fija cada curso ${o.issuer === "" ? "la administración educativa" : `la ${o.issuer.replace(/^(La|El) /, "")}`}. Para ${SPAIN_SCHOOL_YEAR} es la **${o.title}**, publicada en el ${o.bulletin}${o.number ? ` núm. ${o.number}` : ""} del ${fullDate(o.date)}: [texto oficial](${o.url}).`,
  ];
  if (o.departmentUrl) text.push(`La consejería lo resume también en [su página del calendario escolar](${o.departmentUrl}).`);
  text.push(`Fechas leídas en el texto oficial el ${fullDate(region.verifiedAt).replace(/^\S+ /, "")}.`);
  return [
    { type: "heading", level: 2, text: "La orden oficial del calendario escolar" },
    { type: "paragraph", text: text.join(" ") },
  ];
}

function regionFaq(region: RegionCalendar): Block {
  const c = region.christmas;
  const e = region.easter;
  const { start, end } = mainLevels(region);
  const sevenDec = schoolDayIn(region, "2026-12-07");
  const sevenAnswer =
    sevenDec.kind === "school"
      ? `No es festivo ${region.inName}: es día lectivo en el calendario general. Solo el martes 8 (Inmaculada Concepción) es festivo. Algunos municipios o centros pueden tenerlo como día no lectivo local: pregúntalo en el colegio.`
      : `No. ${sevenDec.kind === "holiday" ? `Es festivo ${region.inName} (${sevenDec.name})` : sevenDec.kind === "nonTeaching" ? `Es día no lectivo (${sevenDec.reason})` : "No es día lectivo"}, y el martes 8 también es festivo: del sábado 5 al martes 8 no hay clase.`;
  const items = [
    {
      question: `¿Cuándo empiezan las vacaciones de Navidad ${c.from.slice(0, 4)} ${region.inName}?`,
      answer: `El ${weekdayDay(c.from)} es el primer día sin clase y el ${weekdayDay(c.to)} el último, según ${region.order.short}. El último día de clase es el ${weekdayDay(lastClassBefore(region, c))}.`,
    },
    {
      question: `¿Cuándo se vuelve al cole después de Navidad ${region.inName}?`,
      answer: `El ${fullDate(nextSchoolDay(region, c.to))}.`,
    },
    { question: `¿Hay clase el 7 de diciembre de 2026 ${region.inName}?`, answer: sevenAnswer },
    {
      question: `¿Cuándo son las vacaciones de Semana Santa ${e.from.slice(0, 4)} ${region.inName}?`,
      answer: `${longSpan(e).replace(/^del/, "Del")}, ambos incluidos. Se vuelve a clase el ${weekdayDay(nextSchoolDay(region, e.to))}.`,
    },
    ...(region.otherBreaks.length
      ? [
          {
            question: `¿Hay otras vacaciones durante el curso ${region.inName}?`,
            answer: `Sí: ${joinList(region.otherBreaks.map((b) => `${b.name.toLowerCase().startsWith("vacaciones") ? b.name.charAt(0).toLowerCase() + b.name.slice(1) : b.name}, ${span(b)}`))}.`,
          },
        ]
      : []),
    {
      question: `¿Cuándo empieza y termina el curso ${SPAIN_SCHOOL_YEAR} ${region.inName}?`,
      answer: `En Infantil y Primaria empieza el ${fullDate(start)} y termina el ${fullDate(end)}.${region.levels.length > 1 ? " Las demás etapas tienen sus fechas en la tabla de inicio y fin de curso por etapas." : ""}`,
    },
  ];
  return { type: "faq", title: "Preguntas frecuentes", items };
}

/** The whole body of one community's page. */
export function buildRegionBody(region: RegionCalendar): Block[] {
  return [
    { type: "paragraph", lead: true, text: lead(region) },
    { type: "spainSchoolCalendar", region: region.slug },
    ...christmasSection(region),
    ...easterSection(region),
    ...otherBreaksSection(region),
    ...levelsSection(region),
    ...daysOffSection(region),
    ...provincesSection(region),
    ...localSection(region),
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

function breakTable(kind: "christmas" | "easter"): Block {
  const regions = hubRegions().sort((a, b) => a[kind].from.localeCompare(b[kind].from) || a.short.localeCompare(b.short, "es"));
  const name = kind === "christmas" ? "Navidad" : "Semana Santa";
  return {
    type: "table",
    caption: `Vacaciones de ${name} por comunidades, curso ${SPAIN_SCHOOL_YEAR}`,
    headers: ["Comunidad", "Último día de clase", "Sin clase", "Vuelta a clase"],
    rows: regions.map((r) => [
      link(r),
      weekdayDay(lastClassBefore(r, r[kind])),
      span(r[kind]),
      weekdayDay(nextSchoolDay(r, r[kind].to)),
    ]),
    note: "Infantil y Primaria. Cada fila, según la orden o resolución de su comunidad; el último día de clase y la vuelta no cuentan fiestas locales.",
    stickyColumn: 0,
  };
}

export function buildHubBody(): Block[] {
  const regions = hubRegions();
  const christmasStarts = [...new Set(regions.map((r) => r.christmas.from))].sort();
  const firstXmas = christmasStarts[0]!;
  const lastXmas = christmasStarts.at(-1)!;
  const withOther = regions.filter((r) => r.otherBreaks.length > 0);
  const provincial = regions.filter((r) => r.provinces?.length);
  const blocks: Block[] = [
    {
      type: "paragraph",
      lead: true,
      text:
        `**Las vacaciones de Navidad de 2026 empiezan entre el ${weekdayDay(firstXmas)} y el ${weekdayDay(lastXmas)}**, según la comunidad. ` +
        `Cada comunidad autónoma fija su calendario escolar con una orden o resolución de su consejería de Educación, y Ceuta y Melilla, que dependen del Ministerio de Educación, con la de su dirección provincial. ` +
        `Aquí están las fechas de ${regions.length === 19 ? "las 17 comunidades, Ceuta y Melilla" : `${regions.length} comunidades y ciudades autónomas`} para el curso ${SPAIN_SCHOOL_YEAR}, cada una con su texto oficial.`,
    },
    { type: "spainSchoolCalendar", region: "espana" },
    { type: "heading", level: 2, text: "Vacaciones de Navidad 2026 por comunidades" },
    {
      type: "paragraph",
      text: "Ordenadas de la comunidad que empieza antes a la que empieza más tarde. «Sin clase» va del primer al último día de vacaciones, ambos incluidos.",
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
        items: withOther.map((r) => `${link(r)}: ${r.otherBreaks.map((b) => `${b.name.charAt(0).toLowerCase()}${b.name.slice(1)} (${span(b)})`).join("; ")}.`),
      },
    );
  }
  blocks.push(
    { type: "heading", level: 2, text: "Inicio y fin del curso 2026-2027 por comunidades" },
    {
      type: "table",
      caption: `Primer y último día del curso ${SPAIN_SCHOOL_YEAR}, Infantil y Primaria`,
      headers: ["Comunidad", "Primer día", "Último día"],
      rows: regions.map((r) => {
        const { start, end } = mainLevels(r);
        return [link(r), weekdayDay(start), fullDate(end)];
      }),
      note: "ESO, Bachillerato y FP pueden empezar o terminar otro día: las fechas por etapas están en la página de cada comunidad.",
      stickyColumn: 0,
    },
    { type: "heading", level: 2, text: "Quién fija el calendario escolar y los días locales" },
    {
      type: "paragraph",
      text: `El calendario de cada curso lo aprueba cada comunidad${provincial.length ? ` (en ${joinList(provincial.map((r) => r.short))}, cada provincia con su propia resolución)` : ""}. Encima de esas fechas, cada colegio no tiene clase en las dos fiestas locales de su municipio, y en muchas comunidades el ayuntamiento, el consejo escolar municipal o el propio centro pueden fijar algún día no lectivo más. Por eso, para un día suelto, manda el calendario del propio colegio.`,
    },
    { type: "heading", level: 2, text: "La orden de cada comunidad" },
    {
      type: "list",
      ordered: false,
      items: regions.map(
        (r) =>
          `${link(r)}: [${r.order.short}](${r.order.url}) (${r.order.bulletin}, ${dayMonth(r.order.date)} de ${r.order.date.slice(0, 4)}).`,
      ),
    },
    hubFaq(regions),
    {
      type: "paragraph",
      text: `Los festivos que caen en día lectivo salen de las dos tablas de fiestas laborales del BOE: la de 2026 (${BOE_2026.ref}) y la de 2027 (${BOE_2027.ref}).`,
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
        answer: `Depende de la comunidad. Es festivo (se traslada el Día de la Constitución, que cae en domingo) en ${joinList(regions.filter((r) => schoolDayIn(r, "2026-12-07").kind !== "school").map((r) => r.short))}. En el resto es día lectivo salvo que el municipio o el centro lo fije como no lectivo.`,
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
