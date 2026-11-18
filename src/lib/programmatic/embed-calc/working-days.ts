import { countWorkingDays, daysInMonth, deadline, isIsoDate, MAX_AMOUNT, UNITS, type Calendar, type DayRules, type Reason, type RuleSet, type Unit } from "@/lib/programmatic/working-days/engine";
import { CALC_COPY, NATIONAL_ID, dateText, itemHolidays, itemInfo, joinWords, workingDaysLinkFor, workingDaysPath, type WdData, type WdItem } from "@/lib/programmatic/working-days/copy";
import { absoluteUrl } from "@/lib/site";
import { workingDaysData } from "@/lib/programmatic/working-days/places";
import { COVER_FROM, COVER_TO } from "@/lib/programmatic/working-days/rules";
import { MONTHS } from "@/lib/programmatic/holidays/format";
import { embedDocument, esc } from "@/lib/programmatic/embed-2027/shell";

import { workingDaysEmbedPath, type CalcEmbedLocale } from "./paths";

/**
 * The embeddable working-days calculator
 * (/embed/<locale>/calc/working-days/[<place id>/]): the site's engine
 * (working-days/engine.ts) and holiday data (working-days/places.ts, the same
 * places and the same counted days as the calculator page) behind two plain
 * GET forms, no script:
 *
 *  - working days between two dates (`m=count`: from, to, rules, Saturdays);
 *  - the last day of a deadline (`m=deadline`: notified, amount, unit, rules);
 *
 * and, always, the place's working days month by month in 2026 and 2027
 * (Monday to Friday, minus its counted holidays). Without a query it shows the
 * table alone. Every word is the calculator's (CALC_COPY) or below.
 */

const data = new Map<CalcEmbedLocale, WdData>();
function dataFor(lang: CalcEmbedLocale): WdData {
  let d = data.get(lang);
  if (!d) {
    d = workingDaysData(lang);
    data.set(lang, d);
  }
  return d;
}

/** The place a widget path names, or null (a 404). No segment: all of Spain. */
export function workingDaysPlace(lang: CalcEmbedLocale, segments: string[] | undefined): WdItem | null {
  const id = segments && segments.length > 0 ? segments.join("/") : NATIONAL_ID;
  for (const g of dataFor(lang).groups) {
    const item = g.items.find((i) => i[0] === id);
    if (item) return item;
  }
  return null;
}

/** Every place id the widget answers for (tests). */
export function workingDaysPlaceIds(lang: CalcEmbedLocale): string[] {
  return dataFor(lang).groups.flatMap((g) => g.items.map((i) => i[0]));
}

const W: Record<
  CalcEmbedLocale,
  { title: (place: string) => string; count: string; deadline: string; submitCount: string; submitDeadline: string; months: string; month: string; total: string; monthsNote: string; holidaysOff: string; full: string }
> = {
  ca: {
    title: (p) => `Dies hàbils i laborables: ${p}`,
    count: "Dies hàbils entre dues dates",
    deadline: "L'últim dia d'un termini",
    submitCount: "Compta",
    submitDeadline: "Calcula el termini",
    months: "Dies laborables per mes",
    month: "Mes",
    total: "Total",
    monthsNote: "De dilluns a divendres, sense els festius que comptem per a aquest lloc.",
    holidaysOff: "Festius dins el període",
    full: "Obre la calculadora completa (dos llocs, l'explicació de cada regla)",
  },
  es: {
    title: (p) => `Días hábiles y laborables: ${p}`,
    count: "Días hábiles entre dos fechas",
    deadline: "El último día de un plazo",
    submitCount: "Contar",
    submitDeadline: "Calcular el plazo",
    months: "Días laborables por mes",
    month: "Mes",
    total: "Total",
    monthsNote: "De lunes a viernes, sin los festivos que contamos para este lugar.",
    holidaysOff: "Festivos dentro del periodo",
    full: "Abre la calculadora completa (dos lugares, la explicación de cada regla)",
  },
  en: {
    title: (p) => `Working days: ${p}`,
    count: "Working days between two dates",
    deadline: "The last day of a deadline",
    submitCount: "Count",
    submitDeadline: "Work out the deadline",
    months: "Working days per month",
    month: "Month",
    total: "Total",
    monthsNote: "Monday to Friday, minus the holidays we count for this place.",
    holidaysOff: "Holidays in the period",
    full: "Open the full calculator (two places, each rule explained)",
  },
};

const RULES: readonly RuleSet[] = ["general", "admin", "judicial"];

export interface WdQuery {
  mode: "count" | "deadline" | null;
  rules: RuleSet;
  saturdays: boolean;
  from: string;
  to: string;
  notified: string;
  amount: number;
  unit: Unit;
}

/** The form's fields, validated; anything unreadable falls back to the default so the form always renders. */
export function workingDaysQuery(search: URLSearchParams): WdQuery {
  const date = (k: string, fallback: string) => {
    const v = search.get(k) ?? "";
    return isIsoDate(v) ? v : fallback;
  };
  const rules = (RULES as readonly string[]).includes(search.get("r") ?? "") ? (search.get("r") as RuleSet) : "general";
  const unitRaw = search.get("u") ?? "";
  const unit: Unit = (UNITS[rules] as readonly string[]).includes(unitRaw) ? (unitRaw as Unit) : "working";
  const amount = Number(search.get("n"));
  const m = search.get("m");
  return {
    mode: m === "count" || m === "deadline" ? m : null,
    rules,
    saturdays: search.get("s") === "1",
    from: date("from", "2027-01-01"),
    to: date("to", "2027-12-31"),
    notified: date("d", "2027-01-04"),
    amount: Number.isInteger(amount) && amount >= 1 && amount <= MAX_AMOUNT[unit] ? amount : 10,
    unit,
  };
}

function rulesSelect(lang: CalcEmbedLocale, id: string, value: RuleSet, only?: readonly RuleSet[]): string {
  const t = CALC_COPY[lang];
  return (
    `<label for="${id}">${esc(t.rules)}</label><select id="${id}" name="r">` +
    (only ?? RULES).map((r) => `<option value="${r}"${r === value ? " selected" : ""}>${esc(t.rulesName[r])}</option>`).join("") +
    `</select>`
  );
}

function forms(lang: CalcEmbedLocale, action: string, q: WdQuery): string {
  const t = CALC_COPY[lang];
  const w = W[lang];
  const range = `min="${COVER_FROM}" max="${COVER_TO}"`;
  const units = (["working", "calendar", "months"] as const).map((u) => `<option value="${u}"${u === q.unit ? " selected" : ""}>${esc(t.unitName[u])}</option>`).join("");
  return [
    `<form method="get" action="${action}" aria-labelledby="f1"><h2 id="f1">${esc(w.count)}</h2><input type="hidden" name="m" value="count">`,
    `<label for="from">${esc(t.from)}</label><input id="from" name="from" type="date" ${range} value="${q.from}" required>`,
    `<label for="to">${esc(t.to)}</label><input id="to" name="to" type="date" ${range} value="${q.to}" required>`,
    rulesSelect(lang, "r1", q.rules),
    `<label class="c"><input name="s" type="checkbox" value="1"${q.saturdays ? " checked" : ""}> ${esc(t.saturdays)}</label>`,
    `<button type="submit">${esc(w.submitCount)}</button></form>`,
    `<form method="get" action="${action}" aria-labelledby="f2"><h2 id="f2">${esc(w.deadline)}</h2><input type="hidden" name="m" value="deadline">`,
    `<label for="d">${esc(t.notified)}</label><input id="d" name="d" type="date" ${range} value="${q.notified}" aria-describedby="d-hint" required><small id="d-hint">${esc(t.notifiedHelp)}</small>`,
    `<label for="n">${esc(t.amount)}</label><input id="n" name="n" type="number" min="1" max="${MAX_AMOUNT.calendar}" step="1" value="${q.amount}" required>`,
    `<label for="u">${esc(t.unit)}</label><select id="u" name="u">${units}</select>`,
    rulesSelect(lang, "r2", q.rules === "general" ? "admin" : q.rules),
    `<button type="submit">${esc(w.submitDeadline)}</button></form>`,
  ].join("");
}

function reasonsLine(lang: CalcEmbedLocale, skipped: { date: string; reason: Reason }[]): string | null {
  const holidays = skipped.filter((s) => s.reason === "holiday").map((s) => dateText(s.date, lang));
  return holidays.length ? `${W[lang].holidaysOff}: ${joinWords(holidays, lang)}.` : null;
}

function result(lang: CalcEmbedLocale, q: WdQuery, cal: Calendar): string {
  const t = CALC_COPY[lang];
  if (q.mode === "count") {
    const rules: DayRules = { rules: q.rules, saturdays: q.saturdays };
    const r = countWorkingDays(q.from, q.to, cal, rules);
    if (!r.ok) return `<p role="alert"><strong>${esc(t.errors[r.error])}</strong></p>`;
    const line = reasonsLine(lang, r.skipped);
    return [
      `<h2 id="res">${esc(t.workingCount)}: ${r.working}</h2>`,
      `<table aria-labelledby="res"><tbody>`,
      `<tr class="l"><th scope="row">${esc(t.workingCount)}</th><td class="n"><strong>${r.working}</strong></td></tr>`,
      `<tr><th scope="row">${esc(t.nonWorkingCount)}</th><td class="n">${r.skipped.length}</td></tr>`,
      `<tr><th scope="row">${esc(t.calendarCount)}</th><td class="n">${r.calendar}</td></tr>`,
      `</tbody></table>`,
      `<p>${esc(`${dateText(r.first, lang)} – ${dateText(r.last, lang)} · ${t.rulesName[q.rules]}`)}</p>`,
      line ? `<p>${esc(line)}</p>` : "",
    ].join("");
  }
  if (q.mode === "deadline") {
    const rules: DayRules = { rules: q.rules };
    const r = deadline(q.notified, q.amount, q.unit, cal, rules);
    if (!r.ok) return `<p role="alert"><strong>${esc(t.errors[r.error])}</strong></p>`;
    const moved = r.movedOver.length ? t.movedLine(dateText(r.nominal, lang), joinWords([...new Set(r.movedOver.map((m) => t.reason[m.reason]))], lang)) : null;
    return [
      `<h2 id="res">${esc(t.lastDay)}: ${esc(dateText(r.last, lang))}</h2>`,
      `<table aria-labelledby="res"><tbody>`,
      `<tr class="l"><th scope="row">${esc(t.lastDay)}</th><td><strong>${esc(dateText(r.last, lang))}</strong></td></tr>`,
      `<tr><th scope="row">${esc(t.firstDay)}</th><td>${esc(dateText(r.first, lang))}</td></tr>`,
      `<tr><th scope="row">${esc(t.workingInside)}</th><td class="n">${r.working}</td></tr>`,
      `<tr><th scope="row">${esc(t.calendarInside)}</th><td class="n">${r.calendar}</td></tr>`,
      `</tbody></table>`,
      `<p>${esc(`${q.amount} ${t.unitName[q.unit]} · ${t.rulesName[q.rules]}`)}</p>`,
      moved ? `<p>${esc(moved)}</p>` : "",
      r.graceDay ? `<p>${esc(t.grace(dateText(r.graceDay, lang)))}</p>` : "",
    ].join("");
  }
  return "";
}

/** Monday-to-Friday working days per month, 2026 and 2027, for the place. */
export function monthlyWorkingDays(cal: Calendar): { month: number; y2026: number; y2027: number }[] {
  const week: DayRules = { rules: "general" };
  return Array.from({ length: 12 }, (_, i) => {
    const mm = String(i + 1).padStart(2, "0");
    const count = (y: number) => {
      const r = countWorkingDays(`${y}-${mm}-01`, `${y}-${mm}-${String(daysInMonth(y, i + 1)).padStart(2, "0")}`, cal, week);
      if (!r.ok) throw new Error(`working days widget: month ${y}-${mm}`);
      return r.working;
    };
    return { month: i + 1, y2026: count(2026), y2027: count(2027) };
  });
}

function monthTable(lang: CalcEmbedLocale, cal: Calendar): string {
  const w = W[lang];
  const rows = monthlyWorkingDays(cal);
  const sum = (k: "y2026" | "y2027") => rows.reduce((a, r) => a + r[k], 0);
  const name = (m: number) => {
    const n = MONTHS[lang][m - 1] ?? String(m);
    return n.charAt(0).toUpperCase() + n.slice(1);
  };
  return [
    `<h2 id="mt">${esc(w.months)}</h2>`,
    `<table aria-labelledby="mt"><thead><tr><th scope="col">${esc(w.month)}</th><th scope="col" class="n">2026</th><th scope="col" class="n">2027</th></tr></thead><tbody>`,
    ...rows.map((r) => `<tr><th scope="row">${esc(name(r.month))}</th><td class="n">${r.y2026}</td><td class="n">${r.y2027}</td></tr>`),
    `<tr class="l"><th scope="row">${esc(w.total)}</th><td class="n"><strong>${sum("y2026")}</strong></td><td class="n"><strong>${sum("y2027")}</strong></td></tr>`,
    `</tbody></table>`,
    `<p>${esc(w.monthsNote)}</p>`,
  ].join("");
}

const STYLE = [
  "form{display:grid;gap:4px;margin:0 0 6px;padding:8px 0;border-top:1px solid #e3e8e6}",
  "form h2{margin:0 0 2px}",
  "label{font-size:12px;font-weight:600;margin-top:6px}",
  "label.c{font-weight:400;display:flex;gap:6px;align-items:flex-start}",
  "input,select{font:inherit;padding:6px;border:1px solid #b8c2be;border-radius:4px;max-width:100%;background:#fff;color:#1b2a33}",
  "input[type=checkbox]{padding:0;margin-top:3px}",
  "button{font:inherit;font-weight:600;margin-top:8px;padding:8px 12px;border:0;border-radius:4px;background:#0b6b4f;color:#fff;cursor:pointer;justify-self:start}",
  "button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible{outline:2px solid #0b6b4f;outline-offset:2px}",
  "th[scope=row]{font-size:13px;color:#1b2a33;font-weight:400}",
].join("");

export function renderWorkingDaysEmbed(lang: CalcEmbedLocale, item: WdItem, search: URLSearchParams): string {
  const d = dataFor(lang);
  const t = CALC_COPY[lang];
  const w = W[lang];
  const q = workingDaysQuery(search);
  const cal: Calendar = { holidays: new Set(itemHolidays(d, item)), from: COVER_FROM, to: COVER_TO };
  const label = item[1];
  const placeId = item[0] === NATIONAL_ID ? null : item[0];
  const counted = t.counted(itemInfo(item), label);
  return embedDocument({
    lang,
    title: w.title(label),
    page: workingDaysPath(lang),
    style: STYLE,
    body: [
      `<h1>${esc(w.title(label))}</h1>`,
      result(lang, q, cal),
      forms(lang, workingDaysEmbedPath(lang, placeId), q),
      monthTable(lang, cal),
      `<h2>${esc(t.countedTitle)}</h2>`,
      ...counted.map((c) => `<p>${esc(c)}</p>`),
      `<p>${esc(t.disclaimer)}</p>`,
      `<p><a href="${esc(absoluteUrl(placeId ? workingDaysLinkFor(lang, placeId) : workingDaysPath(lang)))}" target="_blank" rel="noopener">${esc(w.full)}</a></p>`,
    ],
  });
}
