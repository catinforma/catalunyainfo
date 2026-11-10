import type { Locale } from "@/lib/i18n/config";
import type { Region } from "@/lib/programmatic/holidays/boe-2027";

import { SCHOOL_TEXT } from "./translations";
import type { LevelDates, NonTeachingDay, Period, ProvinceCalendar, RegionCalendar, SchoolBreak, SchoolOrder } from "./types";

/**
 * The Catalan and English editions of the Spanish school-calendar pages.
 *
 * A record of `data.ts` is Spanish. `localizeRegion` returns a copy in another
 * language: the same dates (the same strings, untouched), its words swapped
 * for their pair in `translations.ts`, its names in that language, and
 * `locale` set, which every builder reads to pick its sentences. `slug` stays
 * the Spanish identifier: it names the entry, the block and the record, not
 * the URL (that is `regionPath(slug, locale)`).
 */

export interface RegionNames {
  /** In titles: "Madrid", "Balearic Islands". */
  short: string;
  /** "la Comunitat de Madrid" / "the Community of Madrid". */
  name: string;
  /** "a la Comunitat de Madrid" / "in the Community of Madrid". */
  inName: string;
  /** "de la Comunitat de Madrid" / "of the Community of Madrid". */
  deName: string;
  /** "a Madrid", "al País Basc" / "in Madrid", "in the Basque Country". */
  inShort: string;
  /** "de Madrid", "del País Basc" / "of Madrid". */
  deShort: string;
  /** URL word: guies/calendari-escolar-<slug>, guides/<slug>-school-calendar. */
  slug: string;
}

type Names = Record<Region, RegionNames>;

const ca = (slug: string, short: string, name: string, inName: string, deName: string, inShort = inName, deShort = deName): RegionNames => ({
  slug,
  short,
  name,
  inName,
  deName,
  inShort,
  deShort,
});

const CA: Names = {
  AN: ca("andalusia", "Andalusia", "Andalusia", "a Andalusia", "d'Andalusia"),
  AR: ca("arago", "Aragó", "l'Aragó", "a l'Aragó", "de l'Aragó"),
  AS: ca("asturies", "Astúries", "el Principat d'Astúries", "al Principat d'Astúries", "del Principat d'Astúries", "a Astúries", "d'Astúries"),
  IB: ca("balears", "Balears", "les Illes Balears", "a les Illes Balears", "de les Illes Balears", "a les Balears", "de les Balears"),
  CN: ca("canaries", "Canàries", "Canàries", "a Canàries", "de Canàries"),
  CB: ca("cantabria", "Cantàbria", "Cantàbria", "a Cantàbria", "de Cantàbria"),
  CM: ca("castella-la-manxa", "Castella-la Manxa", "Castella-la Manxa", "a Castella-la Manxa", "de Castella-la Manxa"),
  CL: ca("castella-i-lleo", "Castella i Lleó", "Castella i Lleó", "a Castella i Lleó", "de Castella i Lleó"),
  CT: ca("catalunya", "Catalunya", "Catalunya", "a Catalunya", "de Catalunya"),
  EX: ca("extremadura", "Extremadura", "Extremadura", "a Extremadura", "d'Extremadura"),
  GA: ca("galicia", "Galícia", "Galícia", "a Galícia", "de Galícia"),
  MD: ca("madrid", "Madrid", "la Comunitat de Madrid", "a la Comunitat de Madrid", "de la Comunitat de Madrid", "a Madrid", "de Madrid"),
  MC: ca("murcia", "Múrcia", "la Regió de Múrcia", "a la Regió de Múrcia", "de la Regió de Múrcia", "a Múrcia", "de Múrcia"),
  NC: ca("navarra", "Navarra", "la Comunitat Foral de Navarra", "a la Comunitat Foral de Navarra", "de la Comunitat Foral de Navarra", "a Navarra", "de Navarra"),
  PV: ca("pais-basc", "País Basc", "el País Basc", "al País Basc", "del País Basc"),
  RI: ca("la-rioja", "La Rioja", "la Rioja", "a la Rioja", "de la Rioja"),
  VC: ca("comunitat-valenciana", "Comunitat Valenciana", "la Comunitat Valenciana", "a la Comunitat Valenciana", "de la Comunitat Valenciana"),
  CE: ca("ceuta", "Ceuta", "Ceuta", "a Ceuta", "de Ceuta"),
  ML: ca("melilla", "Melilla", "Melilla", "a Melilla", "de Melilla"),
};

/** English: the name with its article, if any; "in"/"of" are added. */
const en = (slug: string, short: string, name: string, shortWithArticle = short): RegionNames => ({
  slug,
  short,
  name,
  inName: `in ${name}`,
  deName: `of ${name}`,
  inShort: `in ${shortWithArticle}`,
  deShort: `of ${shortWithArticle}`,
});

const EN: Names = {
  AN: en("andalusia", "Andalusia", "Andalusia"),
  AR: en("aragon", "Aragon", "Aragon"),
  AS: en("asturias", "Asturias", "the Principality of Asturias"),
  IB: en("balearic-islands", "Balearic Islands", "the Balearic Islands", "the Balearic Islands"),
  CN: en("canary-islands", "Canary Islands", "the Canary Islands", "the Canary Islands"),
  CB: en("cantabria", "Cantabria", "Cantabria"),
  CM: en("castile-la-mancha", "Castile-La Mancha", "Castile-La Mancha"),
  CL: en("castile-and-leon", "Castile and León", "Castile and León"),
  CT: en("catalonia", "Catalonia", "Catalonia"),
  EX: en("extremadura", "Extremadura", "Extremadura"),
  GA: en("galicia", "Galicia", "Galicia"),
  MD: en("madrid", "Madrid", "the Community of Madrid"),
  MC: en("murcia", "Murcia", "the Region of Murcia"),
  NC: en("navarre", "Navarre", "the Chartered Community of Navarre"),
  PV: en("basque-country", "Basque Country", "the Basque Country", "the Basque Country"),
  RI: en("la-rioja", "La Rioja", "La Rioja"),
  VC: en("valencian-community", "Valencian Community", "the Valencian Community", "the Valencian Community"),
  CE: en("ceuta", "Ceuta", "Ceuta"),
  ML: en("melilla", "Melilla", "Melilla"),
};

export const REGION_NAMES: Record<"ca" | "en", Names> = { ca: CA, en: EN };

/** The language of a record: Spanish unless `localizeRegion` made it. */
export function lang(region: { locale?: Locale }): Locale {
  return region.locale ?? "es";
}

/** The Catalan or English pair of a Spanish text; the text itself when it has none (a test lists those). */
export function tx(text: string, locale: Locale): string {
  if (locale === "es") return text;
  const pair = SCHOOL_TEXT[text];
  return pair ? pair[locale === "ca" ? 0 : 1] : text;
}

/** A holiday of the BOE table, whose names join same-day holidays with " / ". */
export function holidayName(name: string, locale: Locale): string {
  return locale === "es" ? name : name.split(" / ").map((n) => tx(n, locale)).join(" / ");
}

function opt(text: string | undefined, locale: Locale): string | undefined {
  return text === undefined ? undefined : tx(text, locale);
}

function order(o: SchoolOrder, locale: Locale): SchoolOrder {
  // The title and the signing body are cited as the text prints them.
  return { ...o, short: tx(o.short, locale), bulletin: tx(o.bulletin, locale) };
}

function level(l: LevelDates, locale: Locale): LevelDates {
  return { ...l, levels: tx(l.levels, locale), startText: opt(l.startText, locale), endText: opt(l.endText, locale), note: opt(l.note, locale) };
}

function period<P extends Period>(p: P, locale: Locale): P {
  return { ...p, note: opt(p.note, locale), label: opt(p.label, locale), labelShort: opt(p.labelShort, locale) };
}

function brk(b: SchoolBreak, locale: Locale): SchoolBreak {
  return { ...b, name: tx(b.name, locale), note: opt(b.note, locale) };
}

function day(d: NonTeachingDay, locale: Locale): NonTeachingDay {
  return { ...d, reason: tx(d.reason, locale), levels: opt(d.levels, locale) };
}

function province(p: ProvinceCalendar, locale: Locale): ProvinceCalendar {
  return {
    ...p,
    name: tx(p.name, locale),
    order: order(p.order, locale),
    levels: p.levels?.map((l) => level(l, locale)),
    christmas: p.christmas && period(p.christmas, locale),
    easter: p.easter && period(p.easter, locale),
    otherBreaks: p.otherBreaks?.map((b) => brk(b, locale)),
    nonTeaching: p.nonTeaching?.map((d) => day(d, locale)),
    localDays: opt(p.localDays, locale),
  };
}

/** Drop the keys a copy set to undefined, so a localized record has the shape of its source. */
function clean<T extends object>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** The record in `locale`: same dates, its words and names in that language. Spanish returns the record itself. */
export function localizeRegion(region: RegionCalendar, locale: Locale): RegionCalendar {
  if (locale === "es") return region;
  const n = REGION_NAMES[locale][region.boe];
  return clean({
    ...region,
    locale,
    name: n.name,
    short: n.short,
    inName: n.inName,
    deName: n.deName,
    inShort: n.inShort,
    deShort: n.deShort,
    order: order(region.order, locale),
    levels: region.levels.map((l) => level(l, locale)),
    christmas: period(region.christmas, locale),
    easter: period(region.easter, locale),
    otherBreaks: region.otherBreaks.map((b) => brk(b, locale)),
    nonTeaching: region.nonTeaching.map((d) => day(d, locale)),
    localDays: tx(region.localDays, locale),
    notes: region.notes.map((s) => tx(s, locale)),
    provinces: region.provinces?.map((p) => province(p, locale)),
    provincesNote: opt(region.provincesNote, locale),
    pendingProvinces: region.pendingProvinces?.map((p) => tx(p, locale)),
    townDays: region.townDays?.map((t) => ({ ...t, note: opt(t.note, locale) })),
    hubOther: opt(region.hubOther, locale),
    flexible: opt(region.flexible, locale),
  });
}

/**
 * Every Spanish text of a record that a Catalan or English page prints, for
 * the test that none is left without its pair. Order titles and issuers are
 * not in it: they are cited in Spanish in every edition.
 */
export function translatableTexts(region: RegionCalendar): string[] {
  const out: (string | undefined)[] = [region.order.short, region.localDays, region.provincesNote, region.hubOther, region.flexible, ...region.notes];
  const levels = (ls: LevelDates[] | undefined) => ls?.forEach((l) => out.push(l.levels, l.startText, l.endText, l.note));
  const periods = (ps: (Period | undefined)[]) => ps.forEach((p) => p && out.push(p.note, p.label, p.labelShort));
  const breaks = (bs: SchoolBreak[] | undefined) => bs?.forEach((b) => out.push(b.name, b.note));
  const days = (ds: NonTeachingDay[] | undefined) => ds?.forEach((d) => out.push(d.reason, d.levels));
  levels(region.levels);
  periods([region.christmas, region.easter]);
  breaks(region.otherBreaks);
  days(region.nonTeaching);
  out.push(...(region.pendingProvinces ?? []));
  for (const p of region.provinces ?? []) {
    out.push(p.name, p.order.short, p.localDays);
    if (p.order.bulletin.startsWith("web ")) out.push(p.order.bulletin);
    levels(p.levels);
    periods([p.christmas, p.easter]);
    breaks(p.otherBreaks);
    days(p.nonTeaching);
  }
  if (region.order.bulletin.startsWith("web ")) out.push(region.order.bulletin);
  for (const t of region.townDays ?? []) out.push(t.note);
  return [...new Set(out.filter((s): s is string => Boolean(s)))];
}
