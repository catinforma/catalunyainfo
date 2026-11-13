import type { Locale } from "@/lib/i18n/config";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { dayMonthYear, weekdayName } from "@/lib/programmatic/holidays/format";
import { unpackDates } from "@/lib/programmatic/working-days/copy";
import type { Calendar, Reason } from "@/lib/programmatic/working-days/engine";
import { COVER_FROM, COVER_TO } from "@/lib/programmatic/working-days/rules";

import { validDate, type PaidLeaveInput } from "./engine";
import { BIRTH, EVENTS, SHORT_RULES, type EventId, type ShortEvent } from "./rules";

/**
 * Paths and words of the paid-leave reference and calculator, small enough
 * for the browser (the client component imports this file, the engine and
 * the rules; nothing that reads data).
 *
 *   /es/calculadoras/permisos-laborales/
 *   /ca/calculadores/permisos-laborals/
 *   /en/calculators/spain-paid-leave/
 */

export type PlLocale = Locale;
export const PL_LOCALES: readonly PlLocale[] = ["es", "ca", "en"];

export function paidLeavePath(locale: PlLocale): string {
  return calcPath("paid-leave", locale);
}

export function paidLeaveEditions(): Record<PlLocale, string> {
  return { ca: paidLeavePath("ca"), es: paidLeavePath("es"), en: paidLeavePath("en") };
}

/** [value, label, holidays packed as "YYMMDD,YYMMDD"] (working-days packing). */
export type PlPlace = [string, string, string];

/** The default place of the working-day count, per edition. */
export const DEFAULT_PLACE: Record<PlLocale, string> = { es: "madrid/all", ca: "catalunya", en: "catalunya" };

/** The holidays of one place, for the engine. */
export function calendarOf(places: readonly PlPlace[], value: string): Calendar {
  const p = places.find((x) => x[0] === value) ?? places[0];
  return { holidays: new Set(p ? unpackDates(p[2]) : []), from: COVER_FROM, to: COVER_TO };
}

/** "jueves, 3 de diciembre de 2026" / "dijous, 3 de desembre de 2026" / "Thursday, 3 December 2026". */
export function fullDate(iso: string, locale: PlLocale): string {
  return `${weekdayName(iso, locale)}, ${dayMonthYear(iso, locale)}`;
}

/* -------------------------------------------------------------------------- */
/* Shareable state in the URL hash                                            */
/* -------------------------------------------------------------------------- */

/** "#e=illness&d=2026-12-03&p=madrid/all" (+ "v=1" travel, "b" birth date and "m=1" single parent). */
export function writeHash(s: PaidLeaveInput): string {
  const p = new URLSearchParams();
  p.set("e", s.event);
  if (s.event === "birth") {
    p.set("b", s.birth);
    if (s.single) p.set("m", "1");
  } else {
    p.set("d", s.start);
    p.set("p", s.place);
    if (s.event === "death" && s.travel) p.set("v", "1");
  }
  return `#${p.toString()}`;
}

export function readHash(hash: string, base: PaidLeaveInput, places: readonly PlPlace[]): PaidLeaveInput {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const out: PaidLeaveInput = { ...base };
  const e = EVENTS.find((x) => x === p.get("e"));
  if (e) out.event = e;
  const d = p.get("d") ?? "";
  if (validDate(d)) out.start = d;
  const b = p.get("b") ?? "";
  if (validDate(b)) out.birth = b;
  const place = p.get("p") ?? "";
  if (places.some((x) => x[0] === place)) out.place = place;
  out.travel = p.get("v") === "1";
  out.single = p.get("m") === "1";
  return out;
}

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

export const EVENT_LABEL: Record<PlLocale, Record<EventId, string>> = {
  es: {
    illness: "Accidente o enfermedad grave, hospitalización o intervención de un familiar (5 días)",
    death: "Fallecimiento de un familiar (2 días, 4 con desplazamiento)",
    marriage: "Matrimonio o registro de pareja de hecho (15 días naturales)",
    move: "Mudanza: traslado del domicilio habitual (1 día)",
    vacation: "Vacaciones mínimas (30 días naturales)",
    birth: "Nacimiento y cuidado del menor (19 semanas)",
  },
  ca: {
    illness: "Accident o malaltia greu, hospitalització o intervenció d'un familiar (5 dies)",
    death: "Defunció d'un familiar (2 dies, 4 amb desplaçament)",
    marriage: "Matrimoni o registre de parella de fet (15 dies naturals)",
    move: "Mudança: trasllat del domicili habitual (1 dia)",
    vacation: "Vacances mínimes (30 dies naturals)",
    birth: "Naixement i cura del menor (19 setmanes)",
  },
  en: {
    illness: "Serious accident or illness, hospitalisation or surgery of a relative (5 days)",
    death: "Death of a relative (2 days, 4 if you have to travel)",
    marriage: "Marriage or registered partnership (15 calendar days)",
    move: "Moving house (1 day)",
    vacation: "Minimum annual holidays (30 calendar days)",
    birth: "Birth and childcare leave (19 weeks)",
  },
};

/** "Estatuto de los Trabajadores, art. 37.3.b" in each language. */
export function etArticle(article: string, locale: PlLocale): string {
  return { es: `Estatuto de los Trabajadores, art. ${article}`, ca: `Estatut dels treballadors, art. ${article}`, en: `Workers' Statute (Estatuto de los Trabajadores), art. ${article}` }[locale];
}

export const REASON_LABEL: Record<PlLocale, Record<Reason, string>> = {
  es: { holiday: "festivo", saturday: "sábado", sunday: "domingo", august: "agosto", christmas: "Navidad" },
  ca: { holiday: "festiu", saturday: "dissabte", sunday: "diumenge", august: "agost", christmas: "Nadal" },
  en: { holiday: "holiday", saturday: "Saturday", sunday: "Sunday", august: "August", christmas: "Christmas" },
};

export const DISCLAIMER: Record<PlLocale, string> = {
  es: "Información general sobre los mínimos del Estatuto de los Trabajadores, no asesoramiento legal. Tu convenio colectivo o tu contrato pueden mejorarlos y concretar cómo se cuentan los días; ante una duda concreta, consulta tu convenio, la representación de los trabajadores, un graduado social o un abogado laboralista.",
  ca: "Informació general sobre els mínims de l'Estatut dels treballadors, no assessorament legal. El teu conveni col·lectiu o el teu contracte els poden millorar i concretar com es compten els dies; davant d'un dubte concret, consulta el teu conveni, la representació dels treballadors, un graduat social o un advocat laboralista.",
  en: "General information on the legal minimums of the Workers' Statute, not legal advice. Your collective agreement (convenio) or contract can improve them and set how the days are counted; for a specific case, check your agreement, the workers' representatives, a graduado social or an employment lawyer.",
};

export interface CalcCopy {
  title: string;
  intro: string;
  noscript: string;
  event: string;
  start: string;
  startHint: string;
  travel: string;
  place: string;
  placeHint: string;
  birth: string;
  single: string;
  results: string;
  days: (n: number, natural: boolean) => string;
  lastCalendar: string;
  lastWorking: string;
  firstWorking: string;
  skipped: string;
  outOfRange: string;
  naturalNote: (event: ShortEvent) => string;
  unspecifiedNote: string;
  payer: (event: ShortEvent) => string;
  birthRows: { mandatory: string; flexible: string; continuous: string; childcare: string; nursing: string; parental: string };
  birthFlexibleValue: (from: string, until: string, weeks: number) => string;
  birthChildcareValue: (until: string, weeks: number) => string;
  birthNursingValue: (until: string, shared: string) => string;
  birthParentalValue: (until: string) => string;
  birthNote: string;
  birthPay: string;
  share: string;
}

const W = (n: number, l: PlLocale) => ({ es: n === 1 ? "1 semana" : `${n} semanas`, ca: n === 1 ? "1 setmana" : `${n} setmanes`, en: n === 1 ? "1 week" : `${n} weeks` })[l];

export const CALC_COPY: Record<PlLocale, CalcCopy> = {
  es: {
    title: "Calcula tu permiso",
    intro: "Elige el motivo y el primer día del permiso: te decimos cuántos días te da el Estatuto de los Trabajadores y qué día termina. En el nacimiento, pon la fecha del parto.",
    noscript: "Sin JavaScript ves el ejemplo de abajo (5 días desde el jueves 3 de diciembre de 2026, en la Comunidad de Madrid). Con JavaScript, la calculadora se actualiza al cambiar cualquier dato.",
    event: "Motivo del permiso",
    start: "Primer día del permiso",
    startHint: "El Estatuto no fija el día de inicio: pon el día en que empiezas a ausentarte.",
    travel: "Necesito desplazarme (2 días más, art. 37.3.b bis)",
    place: "Festivos de",
    placeHint: "Para contar solo días laborables (lunes a viernes sin festivos). No incluye las fiestas locales de tu municipio.",
    birth: "Fecha del nacimiento",
    single: "Familia monoparental (una sola persona progenitora)",
    results: "Resultado",
    days: (n, natural) => (natural ? `${n} días naturales` : n === 1 ? "1 día" : `${n} días`),
    lastCalendar: "Último día contando días seguidos",
    lastWorking: "Último día contando solo días laborables",
    firstWorking: "Primer día laborable contado",
    skipped: "No se cuentan",
    outOfRange: "Para contar días laborables solo hay festivos de 2026 y 2027: elige una fecha de esos años.",
    naturalNote: (e) => (e === "marriage" ? "El Estatuto dice «quince días naturales»: se cuentan todos los días seguidos, también sábados, domingos y festivos." : "El Estatuto dice «treinta días naturales» al año como mínimo: se cuentan seguidos. Cómo se reparten y si tu convenio da más (o los cuenta como laborables) depende de tu convenio."),
    unspecifiedNote: "El Estatuto solo dice «días», sin decir si son naturales o laborables. Te damos los dos cómputos: mira qué dice tu convenio colectivo.",
    payer: () => "Lo paga la empresa: es un permiso retribuido (sigues cobrando tu salario).",
    birthRows: {
      mandatory: "6 semanas obligatorias, a jornada completa",
      flexible: "Semanas que puedes repartir",
      continuous: "Si las coges todas seguidas, terminas el",
      childcare: "Semanas hasta los 8 años",
      nursing: "Lactancia (1 hora al día)",
      parental: "Permiso parental (8 semanas, sin sueldo)",
    },
    birthFlexibleValue: (from, until, w) => `${W(w, "es")}, en semanas sueltas o seguidas, desde el ${from} hasta que cumpla 12 meses (${until})`,
    birthChildcareValue: (until, w) => `${W(w, "es")}, hasta que cumpla 8 años (${until})`,
    birthNursingValue: (until, shared) => `hasta que cumpla 9 meses (${until}); hasta los 12 meses (${shared}) si los dos progenitores la ejercen igual`,
    birthParentalValue: (until) => `hasta que cumpla 8 años (${until})`,
    birthNote: "Contamos desde el día del parto como día 1. Cada progenitor tiene su propio permiso y no se puede ceder al otro.",
    birthPay: `Lo paga la Seguridad Social (INSS): el ${BIRTH.benefitPct} % de tu base reguladora, exento de IRPF salvo en Navarra. La empresa no paga el salario durante esas semanas.`,
    share: "El enlace de la página guarda lo que has elegido: puedes copiarlo y compartirlo.",
  },
  ca: {
    title: "Calcula el teu permís",
    intro: "Tria el motiu i el primer dia del permís: et diem quants dies et dona l'Estatut dels treballadors i quin dia acaba. En el naixement, posa la data del part.",
    noscript: "Sense JavaScript veus l'exemple de sota (5 dies des del dijous 3 de desembre de 2026, a Catalunya). Amb JavaScript, la calculadora s'actualitza en canviar qualsevol dada.",
    event: "Motiu del permís",
    start: "Primer dia del permís",
    startHint: "L'Estatut no fixa el dia d'inici: posa el dia que comences a absentar-te.",
    travel: "He de desplaçar-me (2 dies més, art. 37.3.b bis)",
    place: "Festius de",
    placeHint: "Per comptar només dies laborables (dilluns a divendres sense festius). No inclou les festes locals del teu municipi.",
    birth: "Data del naixement",
    single: "Família monoparental (una sola persona progenitora)",
    results: "Resultat",
    days: (n, natural) => (natural ? `${n} dies naturals` : n === 1 ? "1 dia" : `${n} dies`),
    lastCalendar: "Últim dia comptant dies seguits",
    lastWorking: "Últim dia comptant només dies laborables",
    firstWorking: "Primer dia laborable comptat",
    skipped: "No es compten",
    outOfRange: "Per comptar dies laborables només hi ha festius del 2026 i el 2027: tria una data d'aquests anys.",
    naturalNote: (e) => (e === "marriage" ? "L'Estatut diu «quince días naturales» (quinze dies naturals): es compten tots els dies seguits, també dissabtes, diumenges i festius." : "L'Estatut diu «treinta días naturales» (trenta dies naturals) l'any com a mínim: es compten seguits. Com es reparteixen i si el teu conveni en dona més (o els compta com a laborables) depèn del teu conveni."),
    unspecifiedNote: "L'Estatut només diu «días» (dies), sense dir si són naturals o laborables. Et donem els dos còmputs: mira què diu el teu conveni col·lectiu.",
    payer: () => "El paga l'empresa: és un permís retribuït (continues cobrant el teu salari).",
    birthRows: {
      mandatory: "6 setmanes obligatòries, a jornada completa",
      flexible: "Setmanes que pots repartir",
      continuous: "Si les agafes totes seguides, acabes el",
      childcare: "Setmanes fins als 8 anys",
      nursing: "Lactància (1 hora al dia)",
      parental: "Permís parental (8 setmanes, sense sou)",
    },
    birthFlexibleValue: (from, until, w) => `${W(w, "ca")}, en setmanes soltes o seguides, des del ${from} fins que faci 12 mesos (${until})`,
    birthChildcareValue: (until, w) => `${W(w, "ca")}, fins que faci 8 anys (${until})`,
    birthNursingValue: (until, shared) => `fins que faci 9 mesos (${until}); fins als 12 mesos (${shared}) si els dos progenitors l'exerceixen igual`,
    birthParentalValue: (until) => `fins que faci 8 anys (${until})`,
    birthNote: "Comptem des del dia del part com a dia 1. Cada progenitor té el seu propi permís i no es pot cedir a l'altre.",
    birthPay: `El paga la Seguretat Social (INSS): el ${BIRTH.benefitPct} % de la teva base reguladora, exempt d'IRPF llevat de Navarra. L'empresa no paga el salari durant aquestes setmanes.`,
    share: "L'enllaç de la pàgina guarda el que has triat: el pots copiar i compartir.",
  },
  en: {
    title: "Work out your leave",
    intro: "Pick the reason and the first day of leave: you get the days the Workers' Statute gives you and the day the leave ends. For birth leave, enter the date of birth.",
    noscript: "Without JavaScript you see the example below (5 days from Thursday 3 December 2026, in Catalonia). With JavaScript, the calculator updates as you change anything.",
    event: "Reason for the leave",
    start: "First day of leave",
    startHint: "The Statute does not set the first day: enter the day you start being off work.",
    travel: "I have to travel (2 more days, art. 37.3.b bis)",
    place: "Holidays of",
    placeHint: "To count working days only (Monday to Friday without holidays). Your town's local holidays are not included.",
    birth: "Date of birth",
    single: "Single-parent family (only one parent)",
    results: "Result",
    days: (n, natural) => (natural ? `${n} calendar days` : n === 1 ? "1 day" : `${n} days`),
    lastCalendar: "Last day, counting consecutive days",
    lastWorking: "Last day, counting working days only",
    firstWorking: "First working day counted",
    skipped: "Not counted",
    outOfRange: "Working days can only be counted with the 2026 and 2027 holidays: pick a date in those years.",
    naturalNote: (e) => (e === "marriage" ? "The Statute says «quince días naturales» (fifteen calendar days): every consecutive day counts, weekends and holidays included." : "The Statute says «treinta días naturales» (thirty calendar days) a year at least: counted consecutively. How they are split, and whether your agreement gives more (or counts working days), depends on your collective agreement."),
    unspecifiedNote: "The Statute only says «días» (days), without saying whether calendar or working days. You get both counts: check what your collective agreement says.",
    payer: () => "Your employer pays it: it is paid leave (you keep your salary).",
    birthRows: {
      mandatory: "6 mandatory weeks, full time",
      flexible: "Weeks you can spread out",
      continuous: "If you take them all in a row, you finish on",
      childcare: "Weeks until age 8",
      nursing: "Nursing (1 hour a day)",
      parental: "Parental leave (8 weeks, unpaid)",
    },
    birthFlexibleValue: (from, until, w) => `${W(w, "en")}, in single weeks or in a row, from ${from} until the child turns 12 months (${until})`,
    birthChildcareValue: (until, w) => `${W(w, "en")}, until the child turns 8 (${until})`,
    birthNursingValue: (until, shared) => `until the child turns 9 months (${until}); until 12 months (${shared}) if both parents take it the same way`,
    birthParentalValue: (until) => `until the child turns 8 (${until})`,
    birthNote: "We count the day of birth as day 1. Each parent has their own leave, and it cannot be passed to the other.",
    birthPay: `Social Security (the INSS) pays it: ${BIRTH.benefitPct}% of your daily base (base reguladora), free of income tax except in Navarre. Your employer does not pay your salary during those weeks.`,
    share: "The page's link keeps what you chose: you can copy and share it.",
  },
};

/** The Estatuto article of a short event, for the result. */
export function eventArticle(e: ShortEvent): string {
  return SHORT_RULES[e].article;
}
