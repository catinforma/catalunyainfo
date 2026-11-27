import { plansFor } from "@/lib/content/holidays/bridges";

import type { CouncilApproved } from "./council-2027";
import { NEXT, NEXT_YEAR, councilApproved2027, isAran, nextYearFor, nextYearPlacesOn, regionalDays } from "./data";
import { dayMonthYear, weekdayDayMonth, weekdayName, type DateLocale } from "./format";
import { caA, caDe, esName, joinList } from "./names";
import { isDatePage } from "./paths";
import type { NucleusDays, SnapshotMunicipality } from "./types";

/**
 * A town's 2027 local holidays as the town pages state them, in one place
 * (`/ca/festius/<town>/`, `/es/festivos/<town>/`, `/en/holidays/<town>/`).
 *
 * Why (GSC 31 Oct - 27 Nov 2026, query x page on the town pages): the 2027
 * queries ("festivos mataro 2027", "calendario laboral badalona 2027",
 * "festes locals vic 2027") are the town pages' best pattern, CTR 2-4 % at
 * positions 5-7, and they peak in December. The pages answered them only in
 * the "¿Y en 2027?" section, below the 2026 table, the live box and the photo.
 * So the first screen now carries one line with the 2027 days (or a plain
 * "pending" where nobody has published them), the section's heading uses the
 * searchers' words, and the FAQ says whether the two days make a long weekend.
 *
 * Three states, never mixed: the DOGC order once `local-2027.json` has it
 * (it always wins); before it, the council's own act (`council-2027.ts`,
 * labelled "pending the DOGC order"); otherwise pending. No date is ever
 * carried over from 2026. No clock: the same data gives the same text.
 */

export type Town2027State = "dogc" | "council" | "pending";

export interface Town2027Days {
  state: Town2027State;
  /** The town's own two days (empty where only its nuclei have days, or pending). */
  local: string[];
  nuclei: NucleusDays[];
  council: CouncilApproved | null;
}

export function town2027Days(
  m: Pick<SnapshotMunicipality, "slug">,
  next: { local: string[]; nuclei?: NucleusDays[] } | null = nextYearFor(m.slug),
  approved: CouncilApproved | null = councilApproved2027(m.slug),
): Town2027Days {
  if (next) return { state: "dogc", local: [...next.local].sort(), nuclei: next.nuclei ?? [], council: null };
  if (approved) return { state: "council", local: [...approved.local].sort(), nuclei: approved.nuclei ?? [], council: approved };
  return { state: "pending", local: [], nuclei: [], council: null };
}

function placeName(m: Pick<SnapshotMunicipality, "name">, locale: DateLocale): string {
  return locale === "ca" ? m.name : esName(m.name);
}

/**
 * The 2027 section's heading, in the words of the queries it answers:
 * "Festivos y calendario laboral 2027 en Badalona" / "Festius i calendari
 * laboral 2027 a Vic" / "Badalona public and bank holidays 2027".
 */
export function town2027Heading(m: Pick<SnapshotMunicipality, "name">, locale: DateLocale): string {
  if (locale === "ca") return `Festius i calendari laboral ${NEXT} ${caA(m.name)}`;
  if (locale === "es") return `Festivos y calendario laboral ${NEXT} en ${esName(m.name)}`;
  return `${placeName(m, "en")} public and bank holidays ${NEXT}`;
}

/** "Calendari laboral 2027 de Vic", the first-screen line's jump to the section. */
export function town2027LinkLabel(m: Pick<SnapshotMunicipality, "name">, locale: DateLocale): string {
  if (locale === "ca") return `Calendari laboral ${NEXT} ${caDe(m.name)}`;
  if (locale === "es") return `Calendario laboral ${NEXT} de ${esName(m.name)}`;
  return `${placeName(m, "en")} work calendar ${NEXT}`;
}

/** The Catalonia-wide days the town has in 2027 (Aran swaps one, never adds). */
export function regional2027(m: Pick<SnapshotMunicipality, "comarca">): string[] {
  return regionalDays(NEXT, isAran(m)).map((d) => d.date);
}

/* -------------------------------------------------------------------------- */
/* Long weekends: "¿hay puente con las fiestas locales de 2027?"              */
/* -------------------------------------------------------------------------- */

/** "del sábado 8 al martes 11 de mayo", "del viernes 30 de abril al lunes 3 de mayo", "Saturday 8 to Tuesday 11 May". */
function range(from: string, to: string, locale: DateLocale): string {
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const first = sameMonth ? `${weekdayName(from, locale)} ${Number(from.slice(8, 10))}` : weekdayDayMonth(from, locale);
  const last = weekdayDayMonth(to, locale);
  return locale === "en" ? `${first} to ${last}` : `del ${first} al ${last}`;
}

function onDays(dates: readonly string[], locale: DateLocale): string {
  const art = locale === "en" ? "" : "el ";
  return joinList(dates.map((d) => `${art}${weekdayDayMonth(d, locale)}`), locale);
}

export interface Town2027Bridge {
  /** The local days the run is built around (two when they share it). */
  dates: string[];
  /** Null when the day falls on a weekend. */
  from: string | null;
  to: string | null;
  days: number;
  /** Leave to book, Monday to Friday, already-off days left out. */
  take: string[];
}

/** One entry per distinct run of days off the town's 2027 local days make, with the Catalonia-wide days counted as off. */
export function town2027Bridges(m: Pick<SnapshotMunicipality, "comarca">, local: readonly string[]): Town2027Bridge[] {
  const out: Town2027Bridge[] = [];
  for (const { date, plan } of plansFor(local, regional2027(m))) {
    if (!plan) {
      out.push({ dates: [date], from: null, to: null, days: 0, take: [] });
      continue;
    }
    const same = out.find((b) => b.from === plan.from && b.to === plan.to && b.take.join() === plan.take.join());
    if (same) same.dates.push(date);
    else out.push({ dates: [date], from: plan.from, to: plan.to, days: plan.days, take: [...plan.take] });
  }
  return out;
}

export interface Town2027Faq {
  question: string;
  answer: string;
}

/**
 * "¿Hay puente con las fiestas locales de 2027 en Badalona?", answered from
 * the town's own two days and the Catalonia-wide ones (lib/content/holidays/
 * bridges.ts, the rule the 2027 bridges page uses). Null while the days are
 * pending, or where the town has none of its own (nuclei only).
 */
export function town2027BridgeFaq(m: Pick<SnapshotMunicipality, "name" | "slug" | "comarca">, locale: DateLocale, days: Town2027Days = town2027Days(m)): Town2027Faq | null {
  if (days.state === "pending" || days.local.length === 0) return null;
  const name = placeName(m, locale);
  const runs = town2027Bridges(m, days.local);
  const sentences = runs.map((b) => {
    const on = onDays(b.dates, locale);
    const lead = `${on.charAt(0).toUpperCase()}${on.slice(1)}`;
    if (!b.from || !b.to) {
      if (locale === "ca") return `${lead} cau en cap de setmana: no afegeix cap dia lliure de dilluns a divendres.`;
      if (locale === "es") return `${lead} cae en fin de semana: no añade ningún día libre de lunes a viernes.`;
      return `${lead} falls on a weekend: no extra day off in a Monday-to-Friday week.`;
    }
    const span = range(b.from, b.to, locale);
    if (b.take.length === 0) {
      if (locale === "ca") return `${lead}: ${b.days} dies seguits sense demanar-ne cap, ${span}.`;
      if (locale === "es") return `${lead}: ${b.days} días seguidos sin pedir ninguno, ${span}.`;
      return `${lead}: ${b.days} days off in a row without booking any leave, ${span}.`;
    }
    const take = onDays(b.take, locale);
    if (locale === "ca") return `${lead}: pont de ${b.days} dies, ${span}, si demanes ${take}.`;
    if (locale === "es") return `${lead}: puente de ${b.days} días, ${span}, si pides ${take}.`;
    return `${lead}: a ${b.days}-day bridge, ${span}, if you book ${take} off.`;
  });
  // A council page that names no act "gives" the days; a plenary, decree or board "approved" them (as copy.ts councilLabel).
  const web = days.council?.act.kind === "web";
  const pending =
    days.state !== "council"
      ? ""
      : web
        ? { ca: " Són els dies que l'Ajuntament dona al seu web, pendents de l'ordre del DOGC.", es: " Son los días que el Ayuntamiento da en su web, pendientes de la orden del DOGC.", en: " These are the days the council gives on its website, pending the DOGC order." }[locale]
        : { ca: " Són els dies aprovats per l'Ajuntament, pendents de l'ordre del DOGC.", es: " Son los días aprobados por el Ayuntamiento, pendientes de la orden del DOGC.", en: " These are the days the council approved, pending the DOGC order." }[locale];
  const week = {
    ca: " Per a una setmana de dilluns a divendres; torns i convenis a part.",
    es: " Para una semana de lunes a viernes; turnos y convenios aparte.",
    en: " For a Monday-to-Friday week; shifts and collective agreements aside.",
  }[locale];
  const question =
    locale === "ca"
      ? `Hi ha pont amb les festes locals del ${NEXT} ${caA(m.name)}?`
      : locale === "es"
        ? `¿Hay puente con las fiestas locales de ${NEXT} en ${name}?`
        : `Do ${name}'s ${NEXT} local holidays make a long weekend?`;
  return { question, answer: `${sentences.join(" ")}${pending}${week}` };
}

/* -------------------------------------------------------------------------- */
/* The 2027 date page of one of the town's days                               */
/* -------------------------------------------------------------------------- */

export interface Town2027DateLink {
  date: string;
  /** "El lunes 17 de mayo de 2027 también es fiesta local en otros 120 lugares, según sus ayuntamientos:" */
  lead: string;
}

/**
 * The first of the town's 2027 local days that has a date page
 * (`/es/festivos/dia/17-mayo-2027/`), with how many other places share it,
 * read the way that page reads it (`nextYearPlacesOn`). Null if none has one.
 */
export function town2027DateLink(m: Pick<SnapshotMunicipality, "slug">, locale: DateLocale, days: Town2027Days = town2027Days(m)): Town2027DateLink | null {
  const date = days.local.find((d) => isDatePage(d));
  if (!date) return null;
  const on = nextYearPlacesOn(date, NEXT_YEAR);
  const others = on.places.filter((p) => p.slug !== m.slug).length;
  const day = `${weekdayName(date, locale)} ${dayMonthYear(date, locale)}`;
  const council = on.status === "council";
  if (locale === "ca") {
    const where = others === 1 ? "un lloc més" : `${others} llocs més`;
    return { date, lead: `El ${day} també és festa local a ${where}${council ? ", segons els dies que ja han aprovat els ajuntaments" : " de Catalunya"}:` };
  }
  if (locale === "es") {
    const where = others === 1 ? "un lugar más" : `otros ${others} lugares`;
    return { date, lead: `El ${day} también es fiesta local en ${where}${council ? ", según los días que ya han aprobado los ayuntamientos" : " de Cataluña"}:` };
  }
  const where = others === 1 ? "one other place" : `${others} other places`;
  return { date, lead: `${day.charAt(0).toUpperCase()}${day.slice(1)} is also a local holiday in ${where}${council ? ", from the days councils have approved so far" : " in Catalonia"}:` };
}
