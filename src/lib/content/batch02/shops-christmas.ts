import type { Locale } from "@/lib/i18n/config";

/**
 * Shops at Christmas 2026: which Sundays and holidays from 29 November 2026
 * to 6 January 2027 general-timetable shops may open, in Catalonia and in
 * every municipality. Shared by the shops guide (its December table and the
 * `shopsChristmas` block) and the town holiday pages ("Obertura comercial a
 * Nadal").
 *
 * Read on 5 Nov 2026 (research_notes/x10/obertura-comercial-nadal-2026.md):
 * - Resolució EMT/4342/2025 (DOGC 9551, 27.11.2025) lists 77 councils by
 *   name with their ten days, and its preamble gives the ten days of every
 *   municipality it does not list (Ordre EMT/77/2025, arts. 1 and 6). So the
 *   official text covers all 947 municipalities: 77 by name, 870 by default.
 * - Llei 18/2017, art. 36.2.d (BOE consolidated text, last update 31.12.2025):
 *   25 and 26 December and 1 and 6 January are closing days; art. 37 lists the
 *   shops outside those limits.
 * - Ordre EMT/89/2026: 3 January 2027 is a general opening day, but councils
 *   could swap it (art. 2) and food retailers may swap up to three dates
 *   (art. 6); neither list was in the DOGC on 5 Nov 2026 (summaries up to
 *   DOGC 9788 scanned).
 *
 * Nothing here knows what day it is: CHRISTMAS_SHOPS_STALE_FROM is enforced by
 * a test (tests/shops-christmas.test.ts), CHRISTMAS_SHOPS_LAST_DAY by the town
 * section, which renders nothing on a build after it.
 */

/** The day every source below was read. */
export const CHRISTMAS_SHOPS_CHECKED = "2026-11-05";

/** From this day the 2027 municipal list must have been read: a test fails. */
export const CHRISTMAS_SHOPS_STALE_FROM = "2027-01-01";

/** The last date the town section talks about (Reis). */
export const CHRISTMAS_SHOPS_LAST_DAY = "2027-01-06";

export type ChristmasSourceKey = "order2026" | "resolution2026" | "retailLaw" | "holidays2026" | "holidays2027" | "order2027" | "barcelona";

export interface ChristmasSource {
  name: string;
  ref: string;
  url: string;
  /** When the text was read for these pages. */
  checked: string;
}

export const CHRISTMAS_SOURCES: Record<ChristmasSourceKey, ChristmasSource> = {
  order2026: {
    name: "Ordre EMT/77/2025, de 22 de maig, calendari d'obertura dels establiments comercials en diumenge i dies festius per a l'any 2026",
    ref: "DOGC núm. 9421, de 27.5.2025",
    url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1015009",
    checked: CHRISTMAS_SHOPS_CHECKED,
  },
  resolution2026: {
    name: "Resolució EMT/4342/2025, de 20 de novembre, dates afegides o substituïdes en el calendari de dies festius amb obertura comercial autoritzada de diversos municipis per a l'any 2026",
    ref: "DOGC núm. 9551, de 27.11.2025",
    url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1030324",
    checked: CHRISTMAS_SHOPS_CHECKED,
  },
  retailLaw: {
    name: "Llei 18/2017, de l'1 d'agost, de comerç, serveis i fires (text consolidat, articles 36 i 37)",
    ref: "BOE-A-2017-11320, última actualització 31.12.2025",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11320",
    checked: CHRISTMAS_SHOPS_CHECKED,
  },
  holidays2026: {
    name: "Ordre EMT/66/2025, de 30 d'abril, calendari oficial de festes laborals a Catalunya per a l'any 2026",
    ref: "DOGC núm. 9406, de 6.5.2025",
    url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1013204",
    checked: CHRISTMAS_SHOPS_CHECKED,
  },
  holidays2027: {
    name: "Ordre EMT/52/2026, de 25 de març, calendari oficial de festes laborals a Catalunya per a l'any 2027",
    ref: "DOGC núm. 9637, de 1.4.2026",
    url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1040896",
    checked: CHRISTMAS_SHOPS_CHECKED,
  },
  order2027: {
    name: "Ordre EMT/89/2026, de 22 de maig, calendari d'obertura dels establiments comercials en diumenge i dies festius per a l'any 2027",
    ref: "DOGC núm. 9674, de 28.5.2026",
    url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1045357",
    checked: CHRISTMAS_SHOPS_CHECKED,
  },
  barcelona: {
    name: "Horaris comercials (zona turística ZGAT: diumenges i festius del 15 de maig al 15 de setembre)",
    ref: "Ajuntament de Barcelona",
    url: "https://ajuntament.barcelona.cat/comerc/ca/el-comerc-barcelona/horaris-comercials",
    checked: CHRISTMAS_SHOPS_CHECKED,
  },
};

/**
 * The 2026 days of the municipalities the resolution does not list, from
 * 29 November on (Resolució EMT/4342/2025, preamble; Ordre EMT/77/2025,
 * arts. 1 and 6).
 */
export const DEFAULT_DECEMBER_2026 = ["2026-11-29", "2026-12-06", "2026-12-08", "2026-12-13", "2026-12-20", "2026-12-27"] as const;

/** First and last day of the window the per-town lists cover. */
export const WINDOW_2026 = { from: "2026-11-29", to: "2026-12-31" } as const;

/** Closing days of Llei 18/2017, art. 36.2.d, in the Christmas window. */
export const LAW_CLOSING = ["2026-12-25", "2026-12-26", "2027-01-01", "2027-01-06"] as const;

/** 2027 general opening day in the window (Ordre EMT/89/2026, art. 1): councils could swap it. */
export const GENERAL_2027_IN_WINDOW = "2027-01-03";

/** Working days people ask about (Ordre EMT/66/2025: not public holidays). */
export const WORKING_ASKED = ["2026-12-24", "2026-12-31"] as const;

/**
 * One municipality's opening days in the window, from its own 2026 list (the
 * snapshot's `shops`, or the default): the days it may open, and the default
 * days it swapped away.
 */
export function windowDays(shops: readonly string[]): { open: string[]; swapped: string[] } {
  const inWindow = (d: string) => d >= WINDOW_2026.from && d <= WINDOW_2026.to;
  const open = shops.filter(inWindow).sort();
  return { open, swapped: DEFAULT_DECEMBER_2026.filter((d) => !open.includes(d)) };
}

/** The same, from a towns-table entry (TOWNS_NOV_DEC in shops.ts) or none for the default. */
export function windowDaysFromDiff(diff: { closed: readonly string[]; extra: readonly string[] } | undefined): { open: string[]; swapped: string[] } {
  const all = [...DEFAULT_DECEMBER_2026.filter((d) => !diff?.closed.includes(d)), ...(diff?.extra ?? [])];
  return windowDays(all);
}

/* -------------------------------------------------------------------------- */
/* One municipality, day by day (the town pages)                              */
/* -------------------------------------------------------------------------- */

export type ChristmasAnswer =
  /** One of the town's ten days. */
  | "open"
  /** A default day the council swapped for another. */
  | "swapped"
  /** A local holiday that is not one of the ten days. */
  | "localClosed"
  /** Llei 18/2017, art. 36.2.d. */
  | "lawClosed"
  /** 3 January 2027: general day, the council's swaps not published. */
  | "pending2027";

export interface ChristmasDay {
  iso: string;
  answer: ChristmasAnswer;
  /** A local holiday of the municipality (2026 order). */
  local: boolean;
  source: ChristmasSourceKey;
}

/**
 * Every Sunday and holiday from 6 December to 6 January for one municipality,
 * plus its December local holidays and any extra opening day it chose.
 * `shopsOwnList` says whether the council is listed by name in the
 * resolution (otherwise the default applies).
 */
export function christmasDays(m: { shops: readonly string[]; local: readonly string[]; shopsOwnList: boolean }): ChristmasDay[] {
  const december = (d: string) => d >= "2026-12-01" && d <= "2026-12-31";
  const base = ["2026-12-06", "2026-12-08", "2026-12-13", "2026-12-20", "2026-12-27", ...LAW_CLOSING, GENERAL_2027_IN_WINDOW];
  const dates = [...new Set([...base, ...m.shops.filter(december), ...m.local.filter(december)])].sort();
  const listed: ChristmasSourceKey = m.shopsOwnList ? "resolution2026" : "order2026";
  return dates.map((iso) => {
    const local = m.local.includes(iso);
    if ((LAW_CLOSING as readonly string[]).includes(iso)) return { iso, answer: "lawClosed", local, source: "retailLaw" };
    if (iso === GENERAL_2027_IN_WINDOW) return { iso, answer: "pending2027", local, source: "order2027" };
    if (m.shops.includes(iso)) return { iso, answer: "open", local, source: listed };
    if ((DEFAULT_DECEMBER_2026 as readonly string[]).includes(iso)) return { iso, answer: "swapped", local, source: "resolution2026" };
    return { iso, answer: "localClosed", local, source: listed };
  });
}

/* -------------------------------------------------------------------------- */
/* Words                                                                       */
/* -------------------------------------------------------------------------- */

const SHORT_MONTH: Record<Locale, string[]> = {
  ca: ["gen.", "febr.", "març", "abr.", "maig", "juny", "jul.", "ag.", "set.", "oct.", "nov.", "des."],
  es: ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/**
 * "29 nov. · 6, 8, 13, 20 i 27 des.": dates grouped by month, short month
 * names (the per-town table repeats this 947 times).
 */
export function compactDays(isos: readonly string[], locale: Locale): string {
  if (isos.length === 0) return "—";
  const and = { ca: "i", es: "y", en: "and" }[locale];
  const groups = new Map<string, number[]>();
  for (const iso of [...isos].sort()) {
    const key = iso.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), Number(iso.slice(8, 10))]);
  }
  return [...groups.entries()]
    .map(([key, days]) => {
      const month = SHORT_MONTH[locale][Number(key.slice(5, 7)) - 1] ?? "";
      const list = days.length === 1 ? String(days[0]) : `${days.slice(0, -1).join(", ")} ${and} ${days.at(-1)}`;
      return `${list} ${month}`;
    })
    .join(" · ");
}
