import { councilLabel, holidayLabel, displayName } from "./copy";
import { NEXT, NEXT_YEAR, YEAR, isAran, localThrough, nextHoliday, yearRows, type HolidayRow } from "./data";
import { addDays, dayMonth, dayMonthYear, weekdayDayMonth, weekdayName, type DateLocale } from "./format";
import { caA, caDe, esName, joinList } from "./names";
import { regional2027, town2027Days, town2027LinkLabel, type Town2027Days, type Town2027State } from "./town-2027";
import type { MuniLocale } from "./paths";
import type { SnapshotMunicipality } from "./types";

/**
 * The first screen of a town holiday page (`/es/festivos/<town>/`,
 * `/ca/festius/<town>/`; components/programmatic/holidays/MunicipalityPage.tsx).
 *
 * 12 Nov 2026 (answer-first layout, d2a328b) put the year's table first on
 * every edition. The 19 Nov review (docs/SEO_EXPERIMENTS.md, GSC 5-11 vs
 * 13-17 Nov) found the Spanish pages losing on the "hoy / mañana" queries
 * (mix-free +20 positions; their list queries +1.9, the Spanish date pages
 * +1.1) while the Catalan pages held (-0.3). So, per language:
 *
 * - es: the "¿Es festivo hoy o mañana en <town>?" answer and the next
 *   holiday, then the table with this year's past days collapsed, then the
 *   lead;
 * - ca: the table first, as on 12 Nov (unchanged).
 *
 * THE SWITCH is `TODAY_FIRST`. Reviews 26 Nov and 3 Dec 2026; reverting the
 * Spanish change is `es: false` (a deploy, no republish).
 */
export const TODAY_FIRST: Record<MuniLocale, boolean> = { ca: false, es: true };

export type FirstScreenPart = "answer" | "table" | "lead";

/** The order of the blocks above the next-step box, per edition. */
export function firstScreenOrder(locale: MuniLocale): FirstScreenPart[] {
  return TODAY_FIRST[locale] ? ["answer", "table", "lead"] : ["table", "lead"];
}

/** This year's rows split at the render date: what is still ahead, and what has passed. */
export function splitRowsByDate(rows: HolidayRow[], today: string): { upcoming: HolidayRow[]; past: HolidayRow[] } {
  return { upcoming: rows.filter((r) => r.date >= today), past: rows.filter((r) => r.date < today) };
}

/** "Festivos de 2026 que ya han pasado (10)": the summary of the collapsed rows. */
export function pastRowsLabel(locale: MuniLocale, n: number): string {
  return locale === "ca" ? `Festius del ${YEAR} que ja han passat (${n})` : `Festivos de ${YEAR} que ya han pasado (${n})`;
}

export interface TownAnswer {
  /** "¿Es festivo hoy o mañana en Barcelona?" */
  question: string;
  /** The answer as text around one bold date: before + strong + after. */
  before: string;
  strong: string;
  after: string;
}

export function townAnswerText(a: TownAnswer): string {
  return `${a.question} ${a.before}${a.strong}${a.after}`;
}

function longDay(iso: string, locale: MuniLocale): string {
  return `${weekdayName(iso, locale)} ${dayMonthYear(iso, locale)}`;
}

function shortDay(iso: string, locale: MuniLocale): string {
  return `${weekdayName(iso, locale)} ${dayMonth(iso, locale)}`;
}

function described(row: HolidayRow, locale: MuniLocale): string {
  const scope = row.kind === "catalonia" ? (locale === "ca" ? ", a tot Catalunya" : ", en toda Cataluña") : "";
  return `${holidayLabel(row, locale)}${scope}`;
}

/**
 * The answer to "¿es festivo hoy / mañana en <town>?", in the static HTML.
 *
 * The page is rendered on its first request and kept until the nightly cron
 * rebuilds it the day after each of its holidays (`holidayRefreshPaths`), so
 * whatever it says must hold on every day it may be served, and in a search
 * snippet read later. It therefore names dates, never "today": from the
 * render date `today` up to the next holiday N, "Hasta el <N> no hay ningún
 * festivo en <town>: es el próximo" is true on each of those days (and on
 * N itself it names that day); on a holiday it says that day is one, and
 * what follows. Where a local day of next year could come first (its order
 * not out yet), only the next Catalonia-wide day is named, with that caveat.
 * Null after the last published date.
 */
export function townTodayAnswer(m: SnapshotMunicipality, locale: MuniLocale, today: string): TownAnswer | null {
  const next = nextHoliday(m, locale, today);
  if (!next) return null;
  const name = displayName(m, locale);
  const n = next.row;
  const question = locale === "ca" ? `És festiu avui o demà ${caA(name)}?` : `¿Es festivo hoy o mañana en ${name}?`;
  // Nuclei with days of their own are in the table further down, not in this answer.
  const nuclei =
    m.local.length > 0 && m.nuclei.length > 0
      ? locale === "ca"
        ? " Alguns nuclis tenen festes locals pròpies: són més avall."
        : " Algunos núcleos tienen fiestas locales propias: están más abajo."
      : "";

  if (n.date === today) {
    const rows = [YEAR, NEXT].flatMap((year) => yearRows(m, year, locale));
    const following = rows.find((r) => r.date > today);
    const then = !following
      ? ""
      : following.date === addDays(today, 1)
        ? locale === "ca"
          ? ` El ${shortDay(following.date, locale)}, també (${described(following, locale)}).`
          : ` El ${shortDay(following.date, locale)}, también (${described(following, locale)}).`
        : locale === "ca"
          ? ` El següent: ${longDay(following.date, locale)} (${described(following, locale)}).`
          : ` El siguiente: ${longDay(following.date, locale)} (${described(following, locale)}).`;
    return {
      question,
      before: "Sí: el ",
      strong: longDay(n.date, locale),
      after: locale === "ca" ? ` és festiu ${caA(name)} (${described(n, locale)}).${then}` : ` es festivo en ${name} (${described(n, locale)}).${then}`,
    };
  }

  // Local days are known through localThrough(): a "no" up to N needs every day before N covered.
  if (addDays(n.date, -1) > localThrough()) {
    const year = n.date.slice(0, 4);
    return {
      question,
      before: locale === "ca" ? "El pròxim festiu de tot Catalunya és el " : "El próximo festivo de toda Cataluña es el ",
      strong: longDay(n.date, locale),
      after:
        locale === "ca"
          ? ` (${holidayLabel(n, locale)}). Els festius locals del ${year} encara no s'han publicat: pot ser que n'hi hagi algun abans.`
          : ` (${holidayLabel(n, locale)}). Los festivos locales de ${year} todavía no se han publicado: puede que haya alguno antes.`,
    };
  }

  return {
    question,
    before: locale === "ca" ? "Fins al " : "Hasta el ",
    strong: longDay(n.date, locale),
    after:
      locale === "ca"
        ? ` no hi ha cap festiu ${caA(name)}: és el pròxim (${described(n, locale)}).${nuclei}`
        : ` no hay ningún festivo en ${name}: es el próximo (${described(n, locale)}).${nuclei}`,
  };
}

/* -------------------------------------------------------------------------- */
/* 2027 on the first screen (27 Nov 2026, batch 8C)                           */
/* -------------------------------------------------------------------------- */

export interface Town2027Line {
  state: Town2027State;
  /** "Festivos locales de Badalona en 2027:" */
  strong: string;
  /** " martes 11 de mayo y lunes 17 de mayo, aprobados por …" */
  text: string;
  /** The jump to the 2027 section: "Calendario laboral 2027 de Badalona". */
  link: string;
}

/**
 * One line between the today answer and the 2026 table (above the table in
 * ca and en, which have no today answer there): the town's 2027 local days
 * with their weekdays and who set them, or "pending" with the reason. It
 * replaces the callout that sat under the live box (`t.nextLead`), so no
 * day is printed twice on the first screens; the 2027 section below keeps
 * the long form, the source and the table. The answer sentence, the table
 * and the lead paragraph are untouched (TODAY_FIRST reviews 26 Nov / 3 Dec).
 */
export function town2027Line(
  m: SnapshotMunicipality,
  locale: DateLocale,
  days: Town2027Days = town2027Days(m),
  order: { name: string; ref: string } | null = NEXT_YEAR.order,
): Town2027Line {
  const name = locale === "ca" ? m.name : esName(m.name);
  const link = town2027LinkLabel(m, locale);
  const strong = locale === "ca" ? `Festius locals ${caDe(m.name)} el ${NEXT}:` : locale === "es" ? `Festivos locales de ${name} en ${NEXT}:` : `${name}'s local holidays in ${NEXT}:`;
  const regional = regional2027(m);
  const n = regional.length;
  const total = new Set([...regional, ...days.local]).size;
  // Aran swaps Easter Monday for the Festa d'Aran (Ordre EMT/52/2026, art. 1.b): still twelve, not "all of Catalonia's".
  const aran = isAran(m);
  const sum =
    days.local.length === 0
      ? ""
      : locale === "ca"
        ? ` Amb els ${n} ${aran ? "generals de l'Aran" : "de tot Catalunya"}, ${total} festius.`
        : locale === "es"
          ? ` Con los ${n} ${aran ? "generales de Arán" : "de toda Cataluña"}, ${total} festivos.`
          : ` With ${aran ? "Aran's" : "Catalonia's"} ${n}, ${total} public holidays.`;
  const list = joinList(days.local.map((d) => weekdayDayMonth(d, locale)), locale);
  const nucleiOnly = {
    ca: " cada nucli té els seus, al calendari de més avall.",
    es: " cada núcleo tiene los suyos, en el calendario de más abajo.",
    en: " each village has its own, in the calendar below.",
  }[locale];
  if (days.state === "dogc") {
    // "Ordre EMT/208/2025, d'11 de desembre, per la qual…" -> "Ordre EMT/208/2025", then the bulletin: "DOGC núm. 9565, de 17.12.2025".
    const number = order?.name.match(/^Ordre ([A-Z]+\/\d+\/\d{4})/)?.[1];
    const word = { ca: "Ordre", es: "Orden", en: "Order" }[locale];
    const by = order ? ` (${number ? `${word} ${number}, ` : ""}${order.ref})` : "";
    return { state: days.state, strong, text: days.local.length ? ` ${list}${by}.${sum}` : nucleiOnly, link };
  }
  if (days.state === "council" && days.council) {
    return { state: days.state, strong, text: days.local.length ? ` ${list}, ${councilLabel(days.council, locale)}.${sum}` : nucleiOnly, link };
  }
  const text = {
    ca: ` pendents de publicació. Els proposa l'Ajuntament i els fixa una ordre del DOGC, que encara no ha sortit (la del ${YEAR} va sortir el 17 de desembre de 2025). Els ${n} ${aran ? "generals de l'Aran" : "de tot Catalunya"} ja són oficials.`,
    es: ` pendientes de publicación. Los propone el Ayuntamiento y los fija una orden del DOGC, que aún no ha salido (la de ${YEAR} salió el 17 de diciembre de 2025). Los ${n} ${aran ? "generales de Arán" : "de toda Cataluña"} ya son oficiales.`,
    en: ` not published yet. The council proposes them and a DOGC order sets them; it has not come out yet (the ${YEAR} one came out on 17 December 2025). ${aran ? "Aran's" : "Catalonia's"} ${n} are already official.`,
  }[locale];
  return { state: days.state, strong, text, link };
}
