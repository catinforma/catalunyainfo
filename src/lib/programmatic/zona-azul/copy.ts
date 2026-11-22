import { capitalize, dayMonthYear } from "@/lib/programmatic/holidays/format";

import { BARCELONA_ROW, CITIES } from "./data";
import { caDe, duration, eur, hoursCell, hoursText, listText, lowerFirst, sameRanges, shortDuration, theTime } from "./format";
import { inWindow } from "./logic";
import { BARCELONA_GUIDE, zaCityPath } from "./paths";
import type { City, DaySchedule, L, PaidRule, PriceStep, Range, Season, SpecialDay, Zone, ZaLocale } from "./types";

/**
 * Every sentence of the family, built from the data file: nothing here states
 * a fact of its own. The server render never says "today": the day-dependent
 * answer is `today.ts`, computed in the browser.
 */

export interface Sourced {
  text: string;
  src: readonly string[];
}

export function primaryZone(city: City): Zone {
  return city.zones[0]!;
}

/** The rule the "is it paid today?" answer and the hub row are computed from. */
export function primaryRule(city: City): PaidRule {
  const rule = primaryZone(city).rule;
  if (!rule) throw new Error(`zona-azul: the first zone of ${city.slug} has no timetable rule`);
  return rule;
}

const NOT_PUBLISHED: L = { es: "No publicado", ca: "No publicat", en: "Not published" };

interface DayWords {
  weekdays: string;
  monSat: string;
  saturdays: string;
  sundays: string;
  holidays: string;
}

/** Inside a sentence. */
const DAYS: Record<ZaLocale, DayWords> = {
  es: { weekdays: "de lunes a viernes laborables", monSat: "de lunes a sábado laborables", saturdays: "los sábados", sundays: "los domingos", holidays: "los festivos" },
  ca: { weekdays: "de dilluns a divendres feiners", monSat: "de dilluns a dissabte feiners", saturdays: "els dissabtes", sundays: "els diumenges", holidays: "els festius" },
  en: { weekdays: "Monday to Friday (working days)", monSat: "Monday to Saturday (working days)", saturdays: "Saturdays", sundays: "Sundays", holidays: "public holidays" },
};

/** Row and column labels. */
export const ROW: Record<ZaLocale, { weekday: string; monSat: string; saturday: string; sunday: string; holiday: string; sunHol: string }> = {
  es: { weekday: "Lunes a viernes laborables", monSat: "Lunes a sábado laborables", saturday: "Sábados", sunday: "Domingos", holiday: "Festivos", sunHol: "Domingos y festivos" },
  ca: { weekday: "De dilluns a divendres feiners", monSat: "De dilluns a dissabte feiners", saturday: "Dissabtes", sunday: "Diumenges", holiday: "Festius", sunHol: "Diumenges i festius" },
  en: { weekday: "Monday to Friday (working days)", monSat: "Monday to Saturday (working days)", saturday: "Saturdays", sunday: "Sundays", holiday: "Public holidays", sunHol: "Sundays and public holidays" },
};

function afterColon(label: string, locale: ZaLocale): string {
  return locale === "en" ? label : lowerFirst(label);
}

function noPay(days: string, locale: ZaLocale): string {
  return { es: `${days} no se paga`, ca: `${days} no es paga`, en: `${days} are free` }[locale];
}

/** "de lunes a viernes laborables, de 9:00 a 21:00", "los sábados, de 9:00 a 15:00"… */
function paidSegments(s: DaySchedule, locale: ZaLocale): string[] {
  const d = DAYS[locale];
  const out: string[] = [];
  const merged = s.weekday.length > 0 && sameRanges(s.weekday, s.saturday);
  if (s.weekday.length > 0) out.push(`${merged ? d.monSat : d.weekdays}, ${hoursText(s.weekday, locale)}`);
  if (!merged && s.saturday.length > 0) out.push(`${d.saturdays}, ${hoursText(s.saturday, locale)}`);
  if (s.sunday.length > 0) out.push(`${d.sundays}, ${hoursText(s.sunday, locale)}`);
  if (s.holiday.length > 0) out.push(`${d.holidays}, ${hoursText(s.holiday, locale)}`);
  return out;
}

function freeSentence(s: DaySchedule, locale: ZaLocale): string {
  const d = DAYS[locale];
  const days = [s.saturday.length === 0 ? d.saturdays : null, s.sunday.length === 0 ? d.sundays : null, s.holiday.length === 0 ? d.holidays : null].filter(
    (x): x is string => x !== null,
  );
  if (days.length === 0) return "";
  const list = listText(days, locale);
  return { es: `${capitalize(list)} no se paga.`, ca: `${capitalize(list)} no es paga.`, en: `Parking is free on ${list}.` }[locale];
}

/** The general rule in one or two sentences, with no reference to the day it is read. */
export function ruleSentence(city: City, locale: ZaLocale): string {
  const base = primaryRule(city).base;
  const segments = paidSegments(base, locale).join("; ");
  const name = city.name[locale];
  const paid = {
    es: `En ${name} la zona azul se paga ${segments}.`,
    ca: `A ${name} la zona blava es paga ${segments}.`,
    en: `In ${name}, blue zone parking is charged ${segments}.`,
  }[locale];
  const free = freeSentence(base, locale);
  return free ? `${paid} ${free}` : paid;
}

/** "Agosto: de lunes a sábado laborables, de 9:00 a 15:00." */
export function seasonSentence(season: Season, base: DaySchedule, locale: ZaLocale): string {
  const segments = paidSegments(season.schedule, locale);
  if (segments.length === 0) return `${season.label[locale]}: ${{ es: "no se paga", ca: "no es paga", en: "free" }[locale]}.`;
  const saturdayDropped = base.saturday.length > 0 && season.schedule.saturday.length === 0;
  return `${season.label[locale]}: ${segments.join("; ")}${saturdayDropped ? `; ${noPay(DAYS[locale].saturdays, locale)}` : ""}.`;
}

function specialParts(special: SpecialDay, locale: ZaLocale, cell: boolean): string {
  const text = (r: readonly Range[]) => (cell ? hoursCell(r, locale) : r.length > 0 ? hoursText(r, locale) : { es: "no se paga", ca: "no es paga", en: "free" }[locale]);
  const d = DAYS[locale];
  const r = ROW[locale];
  const label = (sentence: string, row: string) => (cell ? `${row.replace(/ (laborables|feiners|\(working days\))$/, "")}:` : `${sentence},`);
  if (special.weekday && special.saturday && sameRanges(special.weekday, special.saturday)) return `${label(d.monSat, r.monSat)} ${text(special.weekday)}`;
  const parts: string[] = [];
  if (special.weekday) parts.push(`${label(d.weekdays, r.weekday)} ${text(special.weekday)}`);
  if (special.saturday) parts.push(`${label(d.saturdays, r.saturday)} ${text(special.saturday)}`);
  return parts.join("; ");
}

export function specialSentence(special: SpecialDay, locale: ZaLocale): string {
  return `${special.label[locale]}: ${specialParts(special, locale, false)}.`;
}

/* -------------------------------------------------------------------------- */
/* City page                                                                  */
/* -------------------------------------------------------------------------- */

export interface TimetableRow {
  label: string;
  hours: string;
  src: readonly string[];
}

export interface TimetableGroup {
  /** The zones that share this timetable. */
  zones: string[];
  rows: TimetableRow[];
}

function ruleRows(rule: PaidRule, src: readonly string[], locale: ZaLocale): TimetableRow[] {
  const r = ROW[locale];
  const b = rule.base;
  const rows: TimetableRow[] = [
    { label: r.weekday, hours: hoursCell(b.weekday, locale), src },
    { label: r.saturday, hours: hoursCell(b.saturday, locale), src },
  ];
  if (sameRanges(b.sunday, b.holiday)) rows.push({ label: r.sunHol, hours: hoursCell(b.sunday, locale), src });
  else rows.push({ label: r.sunday, hours: hoursCell(b.sunday, locale), src }, { label: r.holiday, hours: hoursCell(b.holiday, locale), src });
  for (const s of rule.seasons) {
    rows.push({ label: `${s.label[locale]}: ${afterColon(r.weekday, locale)}`, hours: hoursCell(s.schedule.weekday, locale), src: s.src });
    rows.push({ label: `${s.label[locale]}: ${afterColon(r.saturday, locale)}`, hours: hoursCell(s.schedule.saturday, locale), src: s.src });
    if (!sameRanges(s.schedule.sunday, b.sunday) || !sameRanges(s.schedule.holiday, b.holiday)) {
      rows.push({ label: `${s.label[locale]}: ${afterColon(r.sunHol, locale)}`, hours: `${hoursCell(s.schedule.sunday, locale)} / ${hoursCell(s.schedule.holiday, locale)}`, src: s.src });
    }
  }
  for (const s of rule.special) rows.push({ label: s.label[locale], hours: specialParts(s, locale, true), src: s.src });
  return rows;
}

/** One table per timetable: the zones that share a rule are listed together. */
export function timetableGroups(city: City, locale: ZaLocale): TimetableGroup[] {
  const groups: { rule: PaidRule; zones: Zone[] }[] = [];
  for (const zone of city.zones) {
    if (!zone.rule) continue;
    const group = groups.find((g) => g.rule === zone.rule);
    if (group) group.zones.push(zone);
    else groups.push({ rule: zone.rule, zones: [zone] });
  }
  return groups.map((g) => ({ zones: g.zones.map((z) => z.name[locale]), rows: ruleRows(g.rule, g.zones[0]!.src, locale) }));
}

export interface PriceRow {
  zone: string;
  /** Null when the zone has no visitor tariff: `note` then fills the row. */
  cells: { min: string; hour1: string; hour2: string; max: string } | null;
  note: string | null;
  src: readonly string[];
}

function stepCell(step: PriceStep | null, locale: ZaLocale): string {
  return step ? `${eur(step.eur, locale)} (${shortDuration(step.minutes)})` : NOT_PUBLISHED[locale];
}

function hourCell(value: number | null, minutes: number, zone: Zone, locale: ZaLocale): string {
  if (value !== null) return eur(value, locale);
  return zone.maxStayMinutes !== null && zone.maxStayMinutes < minutes ? "—" : NOT_PUBLISHED[locale];
}

export function priceRows(city: City, locale: ZaLocale): PriceRow[] {
  return city.zones.map((zone) => {
    const p = zone.prices;
    if (!p) return { zone: zone.name[locale], cells: null, note: zone.pricesNote?.[locale] ?? NOT_PUBLISHED[locale], src: zone.src };
    return {
      zone: zone.name[locale],
      cells: { min: stepCell(p.min, locale), hour1: hourCell(p.hour1, 60, zone, locale), hour2: hourCell(p.hour2, 120, zone, locale), max: stepCell(p.max, locale) },
      note: zone.pricesNote?.[locale] ?? null,
      src: zone.src,
    };
  });
}

function maxStay(zone: Zone, locale: ZaLocale): string {
  if (zone.maxStayNote) return zone.maxStayNote[locale];
  return zone.maxStayMinutes !== null ? duration(zone.maxStayMinutes, locale) : NOT_PUBLISHED[locale];
}

/** "Plazas azules: una hora, 1,10 €; dos horas, 2,75 €; mínimo, 0,05 € (5 minutos); máximo, 8,20 € (4 horas)." */
function priceLine(zone: Zone, locale: ZaLocale): string | null {
  const p = zone.prices;
  if (!p) return null;
  const w = {
    es: { h1: "una hora", h2: "dos horas", min: "mínimo", max: "máximo" },
    ca: { h1: "una hora", h2: "dues hores", min: "mínim", max: "màxim" },
    en: { h1: "one hour", h2: "two hours", min: "minimum", max: "maximum" },
  }[locale];
  const parts: string[] = [];
  if (p.hour1 !== null) parts.push(`${w.h1}, ${eur(p.hour1, locale)}`);
  if (p.hour2 !== null) parts.push(`${w.h2}, ${eur(p.hour2, locale)}`);
  if (p.min) parts.push(`${w.min}, ${eur(p.min.eur, locale)} (${duration(p.min.minutes, locale)})`);
  if (p.max) parts.push(`${w.max}, ${eur(p.max.eur, locale)} (${duration(p.max.minutes, locale)})`);
  return parts.length > 0 ? `${zone.name[locale]}: ${parts.join("; ")}.` : null;
}

function untilParts(s: DaySchedule, locale: ZaLocale): string {
  const d = DAYS[locale];
  const until = { es: "hasta", ca: "fins a", en: "until" }[locale];
  const one = (r: readonly Range[]) => {
    const end = `${until} ${theTime(r[r.length - 1]![1], locale)}`;
    if (r.length < 2) return end;
    const gap = hoursText([[r[0]![1], r[1]![0]]], locale);
    return `${end} ${{ es: `(con pausa ${gap})`, ca: `(amb pausa ${gap})`, en: `(with a break, ${gap})` }[locale]}`;
  };
  if (s.weekday.length > 0 && sameRanges(s.weekday, s.saturday)) return `${d.monSat}, ${one(s.weekday)}`;
  const parts: string[] = [];
  if (s.weekday.length > 0) parts.push(`${d.weekdays}, ${one(s.weekday)}`);
  parts.push(s.saturday.length > 0 ? `${d.saturdays}, ${one(s.saturday)}` : noPay(d.saturdays, locale));
  return parts.join("; ");
}

function augustSeason(rule: PaidRule): Season | null {
  return rule.seasons.find((s) => inWindow("08-15", s.from, s.to)) ?? null;
}

export interface Faq {
  q: string;
  a: string;
}

/** The questions people type, answered from the data. Every one is printed on the page and marked up. */
export function cityFaq(city: City, locale: ZaLocale): Faq[] {
  const name = city.name[locale];
  const zone = primaryZone(city);
  const rule = primaryRule(city);
  const base = rule.base;
  const d = DAYS[locale];
  const seasons = rule.seasons.map((s) => seasonSentence(s, base, locale)).join(" ");
  const free = { es: "no se paga", ca: "no es paga", en: "free" }[locale];
  const hours = (r: readonly Range[]) => (r.length > 0 ? hoursText(r, locale) : free);

  const saturdaySeasons = rule.seasons
    .filter((s) => !sameRanges(s.schedule.saturday, base.saturday))
    .map((s) => ` ${s.label[locale]}: ${hours(s.schedule.saturday)}.`)
    .join("");
  const saturday =
    base.saturday.length > 0
      ? { es: `Sí: los sábados se paga ${hoursText(base.saturday, locale)}.`, ca: `Sí: els dissabtes es paga ${hoursText(base.saturday, locale)}.`, en: `Yes: on Saturdays you pay ${hoursText(base.saturday, locale)}.` }[locale]
      : { es: "No: los sábados no se paga.", ca: "No: els dissabtes no es paga.", en: "No: Saturdays are free." }[locale];

  const sunday =
    base.sunday.length === 0 && base.holiday.length === 0
      ? {
          es: `No: los domingos y los festivos no se paga la zona azul en ${name}.`,
          ca: `No: els diumenges i els festius no es paga la zona blava a ${name}.`,
          en: `No: the blue zone in ${name} is free on Sundays and public holidays.`,
        }[locale]
      : `${capitalize(d.sundays)}: ${hours(base.sunday)}. ${capitalize(d.holidays)}: ${hours(base.holiday)}.`;

  const august = augustSeason(rule);
  const augustAnswer = august
    ? paidSegments(august.schedule, locale).length === 0
      ? `No. ${seasonSentence(august, base, locale)}`
      : `${{ es: "Sí, con otro horario.", ca: "Sí, amb un altre horari.", en: "Yes, with different hours." }[locale]} ${seasonSentence(august, base, locale)}`
    : {
        es: "Sí: los textos oficiales consultados no recogen un horario distinto para agosto, así que se aplica el horario general.",
        ca: "Sí: els textos oficials consultats no recullen cap horari diferent per a l'agost, de manera que s'hi aplica l'horari general.",
        en: "Yes: the official texts we read give no separate August timetable, so the general hours apply.",
      }[locale];

  const prices = city.zones.map((z) => priceLine(z, locale)).filter((x): x is string => x !== null).join(" ");
  const stays = city.zones
    .filter((z) => z.maxStayMinutes !== null)
    .map((z) => `${z.name[locale]}: ${duration(z.maxStayMinutes!, locale)}.`)
    .join(" ");

  const cancel =
    city.cancel?.text[locale] ??
    {
      es: "Los textos oficiales consultados no publican un importe para anular la denuncia.",
      ca: "Els textos oficials consultats no publiquen cap import per anul·lar la denúncia.",
      en: "The official texts we read publish no fee for cancelling a notice.",
    }[locale];
  const electric =
    city.exemptions.electric?.text[locale] ??
    {
      es: "Los textos oficiales consultados no recogen ninguna exención para los vehículos eléctricos.",
      ca: "Els textos oficials consultats no recullen cap exempció per als vehicles elèctrics.",
      en: "The official texts we read contain no exemption for electric vehicles.",
    }[locale];

  const q = {
    es: {
      hours: `¿Qué horario tiene la zona azul de ${name}?`,
      until: `¿Hasta qué hora se paga la zona azul en ${name}?`,
      saturday: `¿Se paga la zona azul los sábados en ${name}?`,
      sunday: `¿Se paga la zona azul los domingos y festivos en ${name}?`,
      august: `¿Se paga la zona azul en agosto en ${name}?`,
      price: `¿Cuánto vale la zona azul en ${name}?`,
      stay: `¿Cuánto tiempo se puede aparcar en la zona azul de ${name}?`,
      cancel: `¿Cuánto cuesta anular una denuncia de la zona azul en ${name}?`,
      electric: `¿Pagan zona azul los coches eléctricos en ${name}?`,
    },
    ca: {
      hours: `Quin horari té la zona blava ${caDe(name)}?`,
      until: `Fins a quina hora es paga la zona blava a ${name}?`,
      saturday: `Es paga la zona blava els dissabtes a ${name}?`,
      sunday: `Es paga la zona blava els diumenges i festius a ${name}?`,
      august: `Es paga la zona blava a l'agost a ${name}?`,
      price: `Quant val la zona blava a ${name}?`,
      stay: `Quant de temps es pot aparcar a la zona blava ${caDe(name)}?`,
      cancel: `Quant costa anul·lar una denúncia de la zona blava a ${name}?`,
      electric: `Paguen zona blava els cotxes elèctrics a ${name}?`,
    },
    en: {
      hours: `What are the blue zone hours in ${name}?`,
      until: `Until what time do you pay for the blue zone in ${name}?`,
      saturday: `Do you pay for the blue zone on Saturdays in ${name}?`,
      sunday: `Do you pay for the blue zone on Sundays and public holidays in ${name}?`,
      august: `Do you pay for the blue zone in August in ${name}?`,
      price: `How much does the blue zone cost in ${name}?`,
      stay: `How long can you park in the blue zone in ${name}?`,
      cancel: `How much does it cost to cancel a blue zone parking notice in ${name}?`,
      electric: `Do electric cars pay for the blue zone in ${name}?`,
    },
  }[locale];

  const until = `${capitalize(untilParts(base, locale))}.${rule.seasons.map((s) => ` ${s.label[locale]}: ${untilParts(s.schedule, locale)}.`).join("")}`;

  const faq: Faq[] = [
    { q: q.hours, a: `${ruleSentence(city, locale)}${seasons ? ` ${seasons}` : ""}${zone.hoursNote ? ` ${zone.hoursNote[locale]}` : ""}` },
    { q: q.until, a: until },
    { q: q.saturday, a: `${saturday}${saturdaySeasons}` },
    { q: q.sunday, a: sunday },
    { q: q.august, a: augustAnswer },
  ];
  if (prices) faq.push({ q: q.price, a: prices });
  if (stays) faq.push({ q: q.stay, a: stays });
  faq.push({ q: q.cancel, a: cancel }, { q: q.electric, a: electric });
  return faq;
}

export interface CityView {
  title: string;
  description: string;
  h1: string;
  lead: string;
  headings: Record<"today" | "hours" | "zones" | "prices" | "cancel" | "summer" | "pay" | "exempt" | "faq" | "sources" | "more", string>;
  cols: { day: string; hours: string; zone: string; who: string; stay: string; min: string; hour1: string; hour2: string; max: string };
  timetable: TimetableGroup[];
  hourNotes: Sourced[];
  zones: { name: string; who: string; stay: string; src: readonly string[] }[];
  prices: PriceRow[];
  notes: Sourced[];
  cancel: Sourced[];
  summer: Sourced[];
  pay: Sourced[];
  exempt: Sourced[];
  faq: Faq[];
  operator: string | null;
  checked: string;
  signNote: string;
}

function service(city: City): string {
  return city.service ? ` (${city.service})` : "";
}

export function cityTitle(city: City, locale: ZaLocale): string {
  const name = city.name[locale];
  return {
    es: `Zona azul ${name}${service(city)}: horario, precios y si se paga hoy`,
    ca: `Zona blava ${name}${service(city)}: horari, preus i si es paga avui`,
    en: `${name} blue zone parking${service(city)}: hours, prices, free days`,
  }[locale];
}

export function cityH1(city: City, locale: ZaLocale): string {
  const name = city.name[locale];
  return {
    es: `Zona azul de ${name}${service(city)}: horario, precios y días gratis`,
    ca: `Zona blava ${caDe(name)}${service(city)}: horari, preus i dies gratuïts`,
    en: `${name} blue zone parking${service(city)}: hours, prices and free days`,
  }[locale];
}

/** "lunes a viernes 9:00–21:00, sábados 9:00–15:00, domingos y festivos gratis" */
function compactRule(base: DaySchedule, locale: ZaLocale): string {
  const w = {
    es: { weekdays: "lunes a viernes", monSat: "lunes a sábado", saturdays: "sábados", sunHol: "domingos y festivos", free: "gratis" },
    ca: { weekdays: "de dilluns a divendres", monSat: "de dilluns a dissabte", saturdays: "dissabtes", sunHol: "diumenges i festius", free: "de franc" },
    en: { weekdays: "Monday to Friday", monSat: "Monday to Saturday", saturdays: "Saturdays", sunHol: "Sundays and public holidays", free: "free" },
  }[locale];
  const cell = (r: readonly Range[]) => (r.length > 0 ? hoursCell(r, locale) : w.free);
  const merged = base.weekday.length > 0 && sameRanges(base.weekday, base.saturday);
  const parts = [`${merged ? w.monSat : w.weekdays} ${cell(base.weekday)}`];
  if (!merged) parts.push(`${w.saturdays} ${cell(base.saturday)}`);
  if (sameRanges(base.sunday, base.holiday)) parts.push(`${w.sunHol} ${cell(base.sunday)}`);
  return parts.join(", ");
}

export function cityDescription(city: City, locale: ZaLocale): string {
  const name = city.name[locale];
  const zone = primaryZone(city);
  const rule = compactRule(primaryRule(city).base, locale);
  const hour = zone.prices?.hour1 ?? null;
  const stay = zone.maxStayMinutes;
  const price =
    hour !== null
      ? { es: ` 1 hora, ${eur(hour, locale)}`, ca: ` 1 hora, ${eur(hour, locale)}`, en: ` 1 hour, ${eur(hour, locale)}` }[locale] +
        (stay !== null ? { es: `; máximo ${duration(stay, locale)}.`, ca: `; màxim ${duration(stay, locale)}.`, en: `; maximum ${duration(stay, locale)}.` }[locale] : ".")
      : "";
  const head = { es: `Zona azul de ${name}: ${rule}.${price}`, ca: `Zona blava ${caDe(name)}: ${rule}.${price}`, en: `${name} blue zone: ${rule}.${price}` }[locale];
  const tail = { es: " Con fuente oficial.", ca: " Amb font oficial.", en: " Official sources." }[locale];
  return head.length + tail.length <= 160 ? head + tail : head;
}

export function cityLead(city: City, locale: ZaLocale): string {
  const zone = primaryZone(city);
  const hour = zone.prices?.hour1 ?? null;
  const stay = zone.maxStayMinutes;
  let money = "";
  if (hour !== null && stay !== null) {
    money = {
      es: ` ${zone.name.es}: una hora cuesta ${eur(hour, locale)} y el máximo son ${duration(stay, locale)}.`,
      ca: ` ${zone.name.ca}: una hora costa ${eur(hour, locale)} i el màxim són ${duration(stay, locale)}.`,
      en: ` ${zone.name.en}: one hour costs ${eur(hour, locale)} and the maximum stay is ${duration(stay, locale)}.`,
    }[locale];
  }
  const checked = {
    es: ` Horarios y precios leídos en los textos oficiales el ${dayMonthYear(city.verified, locale)}; en la calle manda la señal.`,
    ca: ` Horaris i preus llegits als textos oficials el ${dayMonthYear(city.verified, locale)}; al carrer mana el senyal.`,
    en: ` Hours and prices read in the official texts on ${dayMonthYear(city.verified, locale)}; on the street, the sign prevails.`,
  }[locale];
  return `${ruleSentence(city, locale)}${money}${checked}`;
}

const HEADINGS: Record<ZaLocale, (name: string) => CityView["headings"]> = {
  es: (name) => ({
    today: `¿Se paga hoy la zona azul en ${name}?`,
    hours: `Horario de la zona azul de ${name}`,
    zones: "Zonas y colores: quién puede aparcar",
    prices: "Precios y tiempo máximo",
    cancel: "Anular una denuncia",
    summer: "Agosto, verano y fechas especiales",
    pay: "Cómo se paga: parquímetro y aplicaciones",
    exempt: "Quién no paga: eléctricos y movilidad reducida",
    faq: "Preguntas frecuentes",
    sources: "Fuentes oficiales",
    more: "Zona azul en otras ciudades",
  }),
  ca: (name) => ({
    today: `Es paga avui la zona blava a ${name}?`,
    hours: `Horari de la zona blava ${caDe(name)}`,
    zones: "Zones i colors: qui hi pot aparcar",
    prices: "Preus i temps màxim",
    cancel: "Anul·lar una denúncia",
    summer: "Agost, estiu i dates especials",
    pay: "Com es paga: parquímetre i aplicacions",
    exempt: "Qui no paga: elèctrics i mobilitat reduïda",
    faq: "Preguntes freqüents",
    sources: "Fonts oficials",
    more: "Zona blava en altres ciutats",
  }),
  en: (name) => ({
    today: `Is the blue zone paid today in ${name}?`,
    hours: `${name} blue zone hours`,
    zones: "Zones and colours: who can park where",
    prices: "Prices and maximum stay",
    cancel: "Cancelling a parking notice",
    summer: "August, summer and special dates",
    pay: "How to pay: meters and apps",
    exempt: "Who does not pay: electric cars and reduced mobility",
    faq: "Frequently asked questions",
    sources: "Official sources",
    more: "Blue zone parking in other cities",
  }),
};

const COLS: Record<ZaLocale, CityView["cols"]> = {
  es: { day: "Día", hours: "Horario de pago", zone: "Zona", who: "Quién puede aparcar", stay: "Tiempo máximo", min: "Mínimo", hour1: "1 hora", hour2: "2 horas", max: "Máximo" },
  ca: { day: "Dia", hours: "Horari de pagament", zone: "Zona", who: "Qui hi pot aparcar", stay: "Temps màxim", min: "Mínim", hour1: "1 hora", hour2: "2 hores", max: "Màxim" },
  en: { day: "Day", hours: "Paid hours", zone: "Zone", who: "Who can park", stay: "Maximum stay", min: "Minimum", hour1: "1 hour", hour2: "2 hours", max: "Maximum" },
};

export function cityView(city: City, locale: ZaLocale): CityView {
  const name = city.name[locale];
  const rule = primaryRule(city);
  const fact = (f: { text: L; src: readonly string[] }): Sourced => ({ text: f.text[locale], src: f.src });

  const summer: Sourced[] = [
    ...rule.seasons.map((s) => ({ text: seasonSentence(s, rule.base, locale), src: s.src })),
    ...rule.special.map((s) => ({ text: specialSentence(s, locale), src: s.src })),
    ...city.seasonal.map(fact),
  ];
  if (rule.seasons.length === 0 && city.seasonal.length === 0) {
    summer.push({
      text: {
        es: "Los textos oficiales consultados no recogen un horario distinto para el verano: se aplica el horario general todo el año.",
        ca: "Els textos oficials consultats no recullen cap horari diferent per a l'estiu: s'hi aplica l'horari general tot l'any.",
        en: "The official texts we read give no separate summer timetable: the general hours apply all year.",
      }[locale],
      src: primaryZone(city).src,
    });
  }

  const pay: Sourced[] = [];
  if (city.apps) {
    const names = listText(city.apps.names, locale);
    pay.push({
      text: { es: `Aplicaciones de pago que cita el Ayuntamiento: ${names}.`, ca: `Aplicacions de pagament que cita l'Ajuntament: ${names}.`, en: `Payment apps named by the council: ${names}.` }[locale],
      src: city.apps.src,
    });
  }
  pay.push(fact(city.payNote));

  const missing = (what: L): Sourced => ({ text: what[locale], src: [] });
  const exempt: Sourced[] = [
    city.exemptions.electric
      ? fact(city.exemptions.electric)
      : missing({
          es: "Vehículos eléctricos: los textos oficiales consultados no recogen ninguna exención (no publicado).",
          ca: "Vehicles elèctrics: els textos oficials consultats no recullen cap exempció (no publicat).",
          en: "Electric vehicles: the official texts we read contain no exemption (not published).",
        }),
    city.exemptions.pmr
      ? fact(city.exemptions.pmr)
      : missing({
          es: "Personas con movilidad reducida: los textos oficiales consultados no lo recogen (no publicado).",
          ca: "Persones amb mobilitat reduïda: els textos oficials consultats no ho recullen (no publicat).",
          en: "People with reduced mobility: not covered in the official texts we read (not published).",
        }),
    ...city.exemptions.other.map(fact),
  ];

  const cancel: Sourced[] = city.cancel
    ? [{ text: city.cancel.text[locale], src: city.cancel.src }]
    : [
        missing({
          es: "Los textos oficiales consultados no publican un importe para anular la denuncia.",
          ca: "Els textos oficials consultats no publiquen cap import per anul·lar la denúncia.",
          en: "The official texts we read publish no fee for cancelling a notice.",
        }),
      ];
  if (city.cancelNote) cancel.push(fact(city.cancelNote));

  return {
    title: cityTitle(city, locale),
    description: cityDescription(city, locale),
    h1: cityH1(city, locale),
    lead: cityLead(city, locale),
    headings: HEADINGS[locale](name),
    cols: COLS[locale],
    timetable: timetableGroups(city, locale),
    hourNotes: city.zones.filter((z) => z.hoursNote).map((z) => ({ text: `${z.name[locale]}: ${z.hoursNote![locale]}`, src: z.src })),
    zones: city.zones.map((z) => ({ name: z.name[locale], who: z.who[locale], stay: maxStay(z, locale), src: z.src })),
    prices: priceRows(city, locale),
    notes: city.notes.map(fact),
    cancel,
    summer,
    pay,
    exempt,
    faq: cityFaq(city, locale),
    operator: city.operator?.[locale] ?? null,
    checked: {
      es: `Textos leídos el ${dayMonthYear(city.verified, locale)}.`,
      ca: `Textos llegits el ${dayMonthYear(city.verified, locale)}.`,
      en: `Texts read on ${dayMonthYear(city.verified, locale)}.`,
    }[locale],
    signNote: {
      es: "Horario general. En algunas calles la señal fija otro horario: manda siempre la señal.",
      ca: "Horari general. En alguns carrers el senyal fixa un altre horari: mana sempre el senyal.",
      en: "General timetable. Some streets are signed with other hours: the sign always prevails.",
    }[locale],
  };
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                        */
/* -------------------------------------------------------------------------- */

export interface HubRow {
  name: string;
  href: string;
  weekday: string;
  saturday: string;
  sunday: string;
  hour: string;
  stay: string;
}

export interface HubView {
  title: string;
  description: string;
  h1: string;
  lead: string;
  caption: string;
  cols: { city: string; weekday: string; saturday: string; sunday: string; hour: string; stay: string };
  rows: HubRow[];
  barcelona: HubRow;
  barcelonaNote: string;
  tableNote: string;
  headings: Record<"table" | "summer" | "faq" | "sources", string>;
  summer: { name: string; href: string; lines: string[] }[];
  noSummer: string;
  faq: Faq[];
  checked: string;
}

export function hubRow(city: City, locale: ZaLocale): HubRow {
  const zone = primaryZone(city);
  const base = primaryRule(city).base;
  return {
    name: city.name[locale],
    href: zaCityPath(locale, city.slug),
    weekday: hoursCell(base.weekday, locale),
    saturday: hoursCell(base.saturday, locale),
    sunday: sameRanges(base.sunday, base.holiday) ? hoursCell(base.sunday, locale) : `${hoursCell(base.sunday, locale)} / ${hoursCell(base.holiday, locale)}`,
    hour: zone.prices && zone.prices.hour1 !== null ? eur(zone.prices.hour1, locale) : NOT_PUBLISHED[locale],
    stay: zone.maxStayMinutes !== null ? shortDuration(zone.maxStayMinutes) : NOT_PUBLISHED[locale],
  };
}

function span(values: string[], locale: ZaLocale): string {
  const sorted = [...values].sort();
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  if (first === last) return { es: `a ${theTime(first, locale)}`, ca: `a ${theTime(first, locale)}`, en: `at ${theTime(first, locale)}` }[locale];
  return {
    es: `entre ${theTime(first, locale)} y ${theTime(last, locale)}`,
    ca: `entre ${theTime(first, locale)} i ${theTime(last, locale)}`,
    en: `between ${theTime(first, locale)} and ${theTime(last, locale)}`,
  }[locale];
}

export function hubFaq(locale: ZaLocale): Faq[] {
  const rules = CITIES.map((c) => ({ city: c, base: primaryRule(c).base, rule: primaryRule(c), zone: primaryZone(c) }));
  const n = rules.length;
  const weekday = rules.filter((r) => r.base.weekday.length > 0);
  const starts = span(weekday.map((r) => r.base.weekday[0]![0]), locale);
  const ends = span(weekday.map((r) => r.base.weekday[r.base.weekday.length - 1]![1]), locale);
  const breaks = weekday.filter((r) => r.base.weekday.length > 1).map((r) => r.city.name[locale]);
  const freeSundays = rules.filter((r) => r.base.sunday.length === 0 && r.base.holiday.length === 0).length;
  const free = { es: "no se paga", ca: "no es paga", en: "free" }[locale];
  const saturdays = rules.map((r) => `${r.city.name[locale]}, ${r.base.saturday.length > 0 ? hoursText(r.base.saturday, locale) : free}`).join("; ");
  const summer = rules.filter((r) => augustSeason(r.rule));
  const summerText = summer.map((r) => `${r.city.name[locale]} (${lowerFirstUnlessEn(seasonSentence(augustSeason(r.rule)!, r.base, locale), locale).replace(/\.$/, "")})`).join("; ");
  const priced = rules.filter((r) => r.zone.prices && r.zone.prices.hour1 !== null).sort((a, b) => a.zone.prices!.hour1! - b.zone.prices!.hour1!);
  const cheap = priced[0];
  const dear = priced[priced.length - 1];

  const hours = {
    es: `Depende de la ciudad: cada ayuntamiento lo fija en su ordenanza. En las ${n} ciudades de la tabla (Barcelona aparte), de lunes a viernes laborables se empieza a pagar ${starts} y se deja de pagar ${ends}${breaks.length > 0 ? `; con pausa al mediodía en ${listText(breaks, locale)}` : ""}.`,
    ca: `Depèn de la ciutat: cada ajuntament el fixa a la seva ordenança. A les ${n} ciutats de la taula (Barcelona a banda), de dilluns a divendres feiners es comença a pagar ${starts} i es deixa de pagar ${ends}${breaks.length > 0 ? `; amb pausa al migdia a ${listText(breaks, locale)}` : ""}.`,
    en: `It depends on the city: each council sets it in its own ordinance. In the ${n} cities in the table (Barcelona aside), on working days from Monday to Friday charging starts ${starts} and ends ${ends}${breaks.length > 0 ? `; with a midday break in ${listText(breaks, locale)}` : ""}.`,
  }[locale];
  const sunday =
    freeSundays === n
      ? {
          es: `En ninguna de las ${n} ciudades de la tabla (Barcelona aparte): con el horario general, los domingos y los festivos la zona azul es gratuita. En zonas de playa y en otras ciudades puede pagarse: lo dice la señal.`,
          ca: `En cap de les ${n} ciutats de la taula (Barcelona a banda): amb l'horari general, els diumenges i els festius la zona blava és gratuïta. En zones de platja i en altres ciutats es pot pagar: ho diu el senyal.`,
          en: `In none of the ${n} cities in the table (Barcelona aside): under the general timetable the blue zone is free on Sundays and public holidays. Beach areas and other cities may charge: the sign says so.`,
        }[locale]
      : {
          es: `Depende de la ciudad: en ${freeSundays} de las ${n} ciudades de la tabla (Barcelona aparte) los domingos y festivos son gratuitos.`,
          ca: `Depèn de la ciutat: en ${freeSundays} de les ${n} ciutats de la taula (Barcelona a banda) els diumenges i festius són gratuïts.`,
          en: `It depends on the city: Sundays and public holidays are free in ${freeSundays} of the ${n} cities in the table (Barcelona aside).`,
        }[locale];
  const august =
    summer.length > 0
      ? {
          es: `Sí, aunque con horario reducido en algunas ciudades: ${summerText}. En el resto de las ciudades de la tabla los textos oficiales no recogen un horario distinto.`,
          ca: `Sí, tot i que amb horari reduït en algunes ciutats: ${summerText}. A la resta de ciutats de la taula els textos oficials no recullen cap horari diferent.`,
          en: `Yes, although some cities shorten the hours: ${summerText}. For the other cities in the table the official texts give no separate timetable.`,
        }[locale]
      : {
          es: "Sí: en las ciudades de la tabla los textos oficiales no recogen un horario distinto para agosto.",
          ca: "Sí: a les ciutats de la taula els textos oficials no recullen cap horari diferent per a l'agost.",
          en: "Yes: for the cities in the table the official texts give no separate August timetable.",
        }[locale];

  const faq: Faq[] = [
    { q: { es: "¿Qué horario tiene la zona azul?", ca: "Quin horari té la zona blava?", en: "What are the blue zone hours in Spain?" }[locale], a: hours },
    { q: { es: "¿Los domingos se paga zona azul?", ca: "Els diumenges es paga zona blava?", en: "Do you pay for the blue zone on Sundays?" }[locale], a: sunday },
    { q: { es: "¿Se paga la zona azul los sábados?", ca: "Es paga la zona blava els dissabtes?", en: "Do you pay for the blue zone on Saturdays?" }[locale], a: `${{ es: "Depende de la ciudad", ca: "Depèn de la ciutat", en: "It depends on the city" }[locale]}: ${saturdays}.` },
    { q: { es: "¿Se paga la zona azul en agosto?", ca: "Es paga la zona blava a l'agost?", en: "Do you pay for the blue zone in August?" }[locale], a: august },
  ];
  if (cheap && dear) {
    const from = `${eur(cheap.zone.prices!.hour1!, locale)} (${cheap.city.name[locale]})`;
    const to = `${eur(dear.zone.prices!.hour1!, locale)} (${dear.city.name[locale]})`;
    faq.push({
      q: { es: "¿Cuánto vale una hora de zona azul?", ca: "Quant val una hora de zona blava?", en: "How much is one hour of blue zone parking?" }[locale],
      a: {
        es: `Entre ${from} y ${to} en la zona azul general de las ciudades de la tabla (Barcelona aparte). Varias ciudades tienen además tarifas más caras en el centro o en plazas de alta rotación.`,
        ca: `Entre ${from} i ${to} a la zona blava general de les ciutats de la taula (Barcelona a banda). Diverses ciutats tenen, a més, tarifes més cares al centre o en places d'alta rotació.`,
        en: `Between ${from} and ${to} in the general blue zone of the cities in the table (Barcelona aside). Several cities also have dearer tariffs in the centre or in high-rotation spaces.`,
      }[locale],
    });
  }
  return faq;
}

function lowerFirstUnlessEn(text: string, locale: ZaLocale): string {
  return locale === "en" ? text : lowerFirst(text);
}

export function hubView(locale: ZaLocale): HubView {
  const names = CITIES.slice(0, 4).map((c) => c.name[locale]);
  const more = CITIES.length > 4;
  const list = more ? names.join(", ") : listText([...names, BARCELONA_ROW.name[locale]], locale);
  const summer = CITIES.filter((c) => primaryRule(c).seasons.length > 0 || primaryRule(c).special.length > 0).map((c) => {
    const rule = primaryRule(c);
    return {
      name: c.name[locale],
      href: zaCityPath(locale, c.slug),
      lines: [...rule.seasons.map((s) => seasonSentence(s, rule.base, locale)), ...rule.special.map((s) => specialSentence(s, locale))],
    };
  });
  const latest = CITIES.reduce((d, c) => (c.verified > d ? c.verified : d), CITIES[0]!.verified);
  return {
    title: { es: "Zona azul por ciudad: horarios y precios", ca: "Zona blava per ciutat: horaris i preus", en: "Blue zone parking in Spain by city: hours and prices" }[locale],
    description: {
      es: `Horario y precio de la zona azul en ${list}${more ? " y más ciudades" : ""}: lunes a viernes, sábados, domingos y festivos, precio por hora y máximo.`,
      ca: `Horari i preu de la zona blava a ${list}${more ? " i més ciutats" : ""}: de dilluns a divendres, dissabtes, diumenges i festius, preu per hora i màxim.`,
      en: `Blue zone parking hours and prices in ${list}${more ? " and more cities" : ""}: weekdays, Saturdays, Sundays and holidays, price per hour, maximum stay.`,
    }[locale],
    h1: { es: "Zona azul por ciudad: horarios y precios", ca: "Zona blava per ciutat: horaris i preus", en: "Blue zone parking by city: hours and prices" }[locale],
    lead: {
      es: "No hay un horario único de zona azul: cada ayuntamiento fija en su ordenanza las horas, los días y el precio. En la tabla está el horario general de la zona azul de cada ciudad, lo que cuesta una hora y el tiempo máximo, leídos en los textos oficiales de cada ayuntamiento.",
      ca: "No hi ha un horari únic de zona blava: cada ajuntament fixa a la seva ordenança les hores, els dies i el preu. A la taula hi ha l'horari general de la zona blava de cada ciutat, el que costa una hora i el temps màxim, llegits als textos oficials de cada ajuntament.",
      en: "There is no single blue zone timetable in Spain: each council sets the hours, the days and the price in its own ordinance. The table gives each city's general blue zone hours, the price of one hour and the maximum stay, as read in each council's official texts.",
    }[locale],
    caption: {
      es: "Horario general de pago de la zona azul, precio de una hora y tiempo máximo, por ciudad",
      ca: "Horari general de pagament de la zona blava, preu d'una hora i temps màxim, per ciutat",
      en: "General paid hours of the blue zone, price of one hour and maximum stay, by city",
    }[locale],
    cols: {
      es: { city: "Ciudad", weekday: "Lunes a viernes", saturday: "Sábados", sunday: "Domingos y festivos", hour: "1 hora", stay: "Máximo" },
      ca: { city: "Ciutat", weekday: "De dilluns a divendres", saturday: "Dissabtes", sunday: "Diumenges i festius", hour: "1 hora", stay: "Màxim" },
      en: { city: "City", weekday: "Monday to Friday", saturday: "Saturdays", sunday: "Sundays and holidays", hour: "1 hour", stay: "Max stay" },
    }[locale],
    rows: CITIES.map((c) => hubRow(c, locale)),
    barcelona: {
      name: BARCELONA_ROW.name[locale],
      href: BARCELONA_GUIDE[locale],
      weekday: BARCELONA_ROW.weekday[locale],
      saturday: BARCELONA_ROW.saturday[locale],
      sunday: BARCELONA_ROW.sunday[locale],
      hour: BARCELONA_ROW.hour[locale],
      stay: BARCELONA_ROW.maxStay[locale],
    },
    barcelonaNote: {
      es: `Barcelona tiene su propia guía, con las cuatro tarifas, la zona verde y los barrios (cifras de AREA leídas el ${dayMonthYear(BARCELONA_ROW.verified, locale)}).`,
      ca: `Barcelona té la seva pròpia guia, amb les quatre tarifes, la zona verda i els barris (xifres d'AREA llegides el ${dayMonthYear(BARCELONA_ROW.verified, locale)}).`,
      en: `Barcelona has its own guide, with the four tariffs, the green zone and the neighbourhoods (AREA figures read on ${dayMonthYear(BARCELONA_ROW.verified, locale)}).`,
    }[locale],
    tableNote: {
      es: "Horario general de los días laborables y precio de la tarifa azul general de cada ciudad. Los festivos son gratuitos donde la columna dice «Gratis»; en algunas calles la señal fija otro horario.",
      ca: "Horari general dels dies feiners i preu de la tarifa blava general de cada ciutat. Els festius són gratuïts on la columna diu «Gratuït»; en alguns carrers el senyal fixa un altre horari.",
      en: "General working-day hours and the price of each city's general blue tariff. Public holidays are free where the column says \"Free\"; some streets are signed with other hours.",
    }[locale],
    headings: {
      es: { table: "Horario y precio de la zona azul por ciudad", summer: "Agosto, verano y fechas especiales", faq: "Preguntas frecuentes", sources: "Fuentes oficiales" },
      ca: { table: "Horari i preu de la zona blava per ciutat", summer: "Agost, estiu i dates especials", faq: "Preguntes freqüents", sources: "Fonts oficials" },
      en: { table: "Blue zone hours and prices by city", summer: "August, summer and special dates", faq: "Frequently asked questions", sources: "Official sources" },
    }[locale],
    summer,
    noSummer: {
      es: "En las demás ciudades de la tabla los textos oficiales consultados no recogen un horario distinto para el verano.",
      ca: "A les altres ciutats de la taula els textos oficials consultats no recullen cap horari diferent per a l'estiu.",
      en: "For the other cities in the table, the official texts we read give no separate summer timetable.",
    }[locale],
    faq: hubFaq(locale),
    checked: {
      es: `Textos leídos entre el ${dayMonthYear(BARCELONA_ROW.verified, locale)} y el ${dayMonthYear(latest, locale)}.`,
      ca: `Textos llegits entre el ${dayMonthYear(BARCELONA_ROW.verified, locale)} i el ${dayMonthYear(latest, locale)}.`,
      en: `Texts read between ${dayMonthYear(BARCELONA_ROW.verified, locale)} and ${dayMonthYear(latest, locale)}.`,
    }[locale],
  };
}
