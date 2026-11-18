import { calcPath } from "@/lib/programmatic/calculators/paths";
import { dayMonthYear, type DateLocale } from "@/lib/programmatic/holidays/format";
import { elDay, num } from "@/lib/programmatic/rent-update/copy";

import type { InvalidReason, RetirementType } from "./engine";
import type { ColumnId, YM } from "./rules";

/**
 * Paths and words of "¿A qué edad me puedo jubilar?", small enough for the
 * browser (the client component imports this file, the engine and the
 * rules; nothing that reads data).
 *
 *   /es/calculadoras/edad-jubilacion/
 *   /ca/calculadores/edat-jubilacio/
 *   /en/calculators/spain-retirement-age/
 *
 * Numbers and dates in the rent-update module's words (same output in Node
 * and every browser).
 */

export type RaLocale = DateLocale;
export const RA_LOCALES: readonly RaLocale[] = ["es", "ca", "en"];

export function retirementPath(locale: RaLocale): string {
  return calcPath("retirement-age", locale);
}

export function retirementEditions(): Record<RaLocale, string> {
  return { ca: retirementPath("ca"), es: retirementPath("es"), en: retirementPath("en") };
}

export { elDay, num };

/** "20 de junio de 2030" / "20 de juny de 2030" / "20 June 2030". */
export function day(iso: string, locale: RaLocale): string {
  return dayMonthYear(iso, locale);
}

/** "66 años y 10 meses", "67 años", "1 mes"; "66 anys i 10 mesos"; "66 years and 10 months". */
export function ymText(p: YM, locale: RaLocale): string {
  const w = {
    es: { y: ["año", "años"], m: ["mes", "meses"], and: "y" },
    ca: { y: ["any", "anys"], m: ["mes", "mesos"], and: "i" },
    en: { y: ["year", "years"], m: ["month", "months"], and: "and" },
  }[locale];
  const years = `${p.y} ${w.y[p.y === 1 ? 0 : 1]}`;
  const months = `${p.m} ${w.m[p.m === 1 ? 0 : 1]}`;
  if (p.m === 0) return years;
  if (p.y === 0) return months;
  return `${years} ${w.and} ${months}`;
}

/** A coefficient as the BOE prints it, two decimals: "21,00 %" / "21.00%". */
export function coef(n: number, locale: RaLocale): string {
  return locale === "en" ? `${num(n, 2, locale)}%` : `${num(n, 2, locale)} %`;
}

/** A whole percentage: "4 %" / "4%". */
export function whole(n: number, locale: RaLocale): string {
  return locale === "en" ? `${num(n, 0, locale)}%` : `${num(n, 0, locale)} %`;
}

/** Months: "24 meses" / "24 mesos" / "24 months". */
export function monthsText(n: number, locale: RaLocale): string {
  return ymText({ y: 0, m: n }, locale);
}

export const TYPE_LABEL: Record<RetirementType, Record<RaLocale, string>> = {
  ordinary: { es: "Ordinaria (sin recorte)", ca: "Ordinària (sense retallada)", en: "Ordinary (no reduction)" },
  involuntary: { es: "Anticipada por despido o cese involuntario", ca: "Anticipada per acomiadament o cessament involuntari", en: "Early, after dismissal or involuntary job loss" },
  voluntary: { es: "Anticipada voluntaria", ca: "Anticipada voluntària", en: "Early, voluntary" },
  delayed: { es: "Demorada (más tarde de la edad ordinaria)", ca: "Demorada (més tard de l'edat ordinària)", en: "Delayed (after the ordinary age)" },
};

export const COLUMN_LABEL: Record<ColumnId, Record<RaLocale, string>> = {
  "under-38-6": { es: "Menos de 38 años y 6 meses cotizados", ca: "Menys de 38 anys i 6 mesos cotitzats", en: "Under 38 years 6 months contributed" },
  "38-6-to-41-6": { es: "De 38 años y 6 meses a menos de 41 años y 6 meses", ca: "De 38 anys i 6 mesos a menys de 41 anys i 6 mesos", en: "38 years 6 months to under 41 years 6 months" },
  "41-6-to-44-6": { es: "De 41 años y 6 meses a menos de 44 años y 6 meses", ca: "De 41 anys i 6 mesos a menys de 44 anys i 6 mesos", en: "41 years 6 months to under 44 years 6 months" },
  "44-6-plus": { es: "44 años y 6 meses o más", ca: "44 anys i 6 mesos o més", en: "44 years 6 months or more" },
};

/** Short column headers for the coefficient tables. */
export const COLUMN_SHORT: Record<ColumnId, Record<RaLocale, string>> = {
  "under-38-6": { es: "< 38 a. 6 m.", ca: "< 38 a. 6 m.", en: "< 38 y 6 m" },
  "38-6-to-41-6": { es: "38 a. 6 m. – 41 a. 6 m.", ca: "38 a. 6 m. – 41 a. 6 m.", en: "38 y 6 m – 41 y 6 m" },
  "41-6-to-44-6": { es: "41 a. 6 m. – 44 a. 6 m.", ca: "41 a. 6 m. – 44 a. 6 m.", en: "41 y 6 m – 44 y 6 m" },
  "44-6-plus": { es: "≥ 44 a. 6 m.", ca: "≥ 44 a. 6 m.", en: "≥ 44 y 6 m" },
};

export interface CalcCopy {
  title: string;
  intro: string;
  noscript: string;
  birth: string;
  birthHint: string;
  contributed: string;
  years: string;
  months: string;
  contributedHint: string;
  keep: string;
  keepYes: string;
  keepNo: string;
  keepHint: string;
  type: string;
  delay: string;
  delayHint: string;
  ordinary: string;
  ordinaryAt: (age: string) => string;
  reached: (date: string) => string;
  via65: (period: string, date: string) => string;
  viaFull: (age: string, year: string) => string;
  rule65Yes: (have: string, need: string) => string;
  rule65No: (have: string, need: string) => string;
  minimumNo: (from: string | null) => string;
  earlyTitle: Record<"involuntary" | "voluntary", string>;
  earlyAt: (date: string, age: string) => string;
  earlyNow: (date: string, age: string) => string;
  earlyCut: (coef: string, months: string, column: string) => string;
  earlyNone: Record<"contribution" | "past", Record<"involuntary" | "voluntary", string>>;
  earlyInvoluntaryNote: string;
  earlyVoluntaryNote: string;
  earlyVoluntaryStopped: string;
  asOfLine: (date: string) => string;
  delayTitle: string;
  delayAt: (date: string, months: string) => string;
  delayBonus: (bonus: string) => string;
  delayActive: (share: string) => string;
  delayNone: Record<"not-contributing" | "minimum", string>;
  delayHalfYear: string;
  articles: string;
  invalid: Record<InvalidReason, string>;
}

export const CALC_COPY: Record<RaLocale, CalcCopy> = {
  es: {
    title: "¿A qué edad me puedo jubilar?",
    intro: "Pon tu fecha de nacimiento y lo que llevas cotizado (sale en tu informe de vida laboral). No pedimos DNI ni número de la Seguridad Social: nada sale de tu navegador.",
    noscript: "Sin JavaScript ves el resultado de una persona nacida el 20 de junio de 1965 con 35 años cotizados que sigue cotizando.",
    birth: "Fecha de nacimiento",
    birthHint: "Día, mes y año.",
    contributed: "Cotizado hasta hoy",
    years: "Años",
    months: "Meses",
    contributedHint: "Años y meses completos, sin la parte de las pagas extra (informe de vida laboral, en Tu Seguridad Social).",
    keep: "¿Seguirás cotizando hasta jubilarte?",
    keepYes: "Sí",
    keepNo: "No",
    keepHint: "Es lo que supone la Seguridad Social: que tu situación de hoy sigue igual.",
    type: "Tipo de jubilación",
    delay: "Meses que la retrasas",
    delayHint: "Después de la edad ordinaria: 12 = un año.",
    ordinary: "Edad ordinaria (sin recorte)",
    ordinaryAt: (age) => `a los ${age}`,
    reached: (date) => `Ya la has alcanzado: desde el ${date} te puedes jubilar sin recorte.`,
    via65: (period, date) => `Te jubilas a los 65 porque llegas a ${period} cotizados (el ${date}).`,
    viaFull: (age, year) => `Te toca la edad completa de ${year}: ${age}.`,
    rule65Yes: (have, need) => `Regla de los 65: sí. A los 65 llevarás ${have} y se piden ${need}.`,
    rule65No: (have, need) => `Regla de los 65: no. A los 65 llevarás ${have} y se piden ${need}.`,
    minimumNo: (from) =>
      from
        ? `No llegas a los 15 años cotizados en la edad ordinaria: los cumplirías el ${from}. Sin 15 años no hay pensión contributiva (art. 205.1.b).`
        : "Sin seguir cotizando no llegas a los 15 años: no hay pensión contributiva (art. 205.1.b); mira la pensión no contributiva.",
    earlyTitle: { involuntary: "Anticipada involuntaria, lo antes posible", voluntary: "Anticipada voluntaria, lo antes posible" },
    earlyAt: (date, age) => `El ${date}, a los ${age}`,
    earlyNow: (date, age) => `Ya puedes: el ${date} tienes ${age}`,
    earlyCut: (coefText, months, column) => `Recorte de la pensión: ${coefText} para siempre (${months} de adelanto; ${column}).`,
    earlyNone: {
      contribution: {
        involuntary: "No llegas a los 33 años cotizados antes de la edad ordinaria.",
        voluntary: "No llegas a los 35 años cotizados antes de la edad ordinaria.",
      },
      past: { involuntary: "Ya tienes la edad ordinaria: no hace falta anticipar.", voluntary: "Ya tienes la edad ordinaria: no hace falta anticipar." },
    },
    earlyInvoluntaryNote: "Además: 6 meses inscrito como demandante de empleo y un cese por despido colectivo, objetivo u otra causa del art. 207. No vale para autónomos.",
    earlyVoluntaryNote: "Además: estar de alta (o asimilado) y que la pensión resultante supere la mínima que te tocaría a los 65.",
    earlyVoluntaryStopped: "Si dejas de cotizar, normalmente ya no estarás de alta: sin alta o situación asimilada no hay anticipada voluntaria.",
    asOfLine: (date) => `Calculado a ${date}, con lo cotizado hasta ese día.`,
    delayTitle: "Demorada",
    delayAt: (date, months) => `El ${date} (${months} después)`,
    delayBonus: (bonus) => `Pensión un ${bonus} más alta para siempre (o pago único, o una mezcla).`,
    delayActive: (share) => `Si después sigues trabajando (jubilación activa), cobras el ${share} de la pensión.`,
    delayNone: {
      "not-contributing": "Sin cotizar después de la edad ordinaria no hay complemento: solo cuentan los años cotizados.",
      minimum: "Sin 15 años cotizados en la edad ordinaria no hay complemento por demora (art. 210.2).",
    },
    delayHalfYear: "Más de 6 meses sueltos suman un 2 % solo a partir del segundo año completo.",
    articles: "Arts. 205, 207, 208 y 210 y disposición transitoria séptima de la Ley General de la Seguridad Social.",
    invalid: {
      birth: "Pon una fecha de nacimiento válida.",
      "too-young": "Hay que tener al menos 16 años.",
      "too-old": "Si naciste antes de 1948 cumpliste 65 antes de 2013: se te aplica la regla anterior (65 años).",
      years: "Pon los años cotizados (de 0 a 60).",
      months: "Pon los meses de 0 a 11.",
      "too-much": "Ese periodo cotizado no cabe en tu edad: revisa los años y la fecha.",
      delay: "Pon los meses de demora, de 1 a 120.",
    },
  },
  ca: {
    title: "A quina edat em puc jubilar?",
    intro: "Posa la data de naixement i el que portes cotitzat (surt a l'informe de vida laboral). No demanem DNI ni número de la Seguretat Social: res no surt del navegador.",
    noscript: "Sense JavaScript veus el resultat d'una persona nascuda el 20 de juny de 1965 amb 35 anys cotitzats que continua cotitzant.",
    birth: "Data de naixement",
    birthHint: "Dia, mes i any.",
    contributed: "Cotitzat fins avui",
    years: "Anys",
    months: "Mesos",
    contributedHint: "Anys i mesos complets, sense la part de les pagues extra (informe de vida laboral, a Tu Seguridad Social).",
    keep: "Continuaràs cotitzant fins a jubilar-te?",
    keepYes: "Sí",
    keepNo: "No",
    keepHint: "És el que suposa la Seguretat Social: que la teva situació d'avui continua igual.",
    type: "Tipus de jubilació",
    delay: "Mesos que la retardes",
    delayHint: "Després de l'edat ordinària: 12 = un any.",
    ordinary: "Edat ordinària (sense retallada)",
    ordinaryAt: (age) => `als ${age}`,
    reached: (date) => `Ja l'has assolit: des del ${date} et pots jubilar sense retallada.`,
    via65: (period, date) => `Et jubiles als 65 perquè arribes a ${period} cotitzats (el ${date}).`,
    viaFull: (age, year) => `Et toca l'edat completa del ${year}: ${age}.`,
    rule65Yes: (have, need) => `Regla dels 65: sí. Als 65 portaràs ${have} i se'n demanen ${need}.`,
    rule65No: (have, need) => `Regla dels 65: no. Als 65 portaràs ${have} i se'n demanen ${need}.`,
    minimumNo: (from) =>
      from
        ? `No arribes als 15 anys cotitzats a l'edat ordinària: els compliries el ${from}. Sense 15 anys no hi ha pensió contributiva (art. 205.1.b).`
        : "Si no continues cotitzant no arribes als 15 anys: no hi ha pensió contributiva (art. 205.1.b); mira la pensió no contributiva.",
    earlyTitle: { involuntary: "Anticipada involuntària, com més aviat millor", voluntary: "Anticipada voluntària, com més aviat millor" },
    earlyAt: (date, age) => `El ${date}, als ${age}`,
    earlyNow: (date, age) => `Ja pots: el ${date} tens ${age}`,
    earlyCut: (coefText, months, column) => `Retallada de la pensió: ${coefText} per sempre (${months} d'avançament; ${column}).`,
    earlyNone: {
      contribution: {
        involuntary: "No arribes als 33 anys cotitzats abans de l'edat ordinària.",
        voluntary: "No arribes als 35 anys cotitzats abans de l'edat ordinària.",
      },
      past: { involuntary: "Ja tens l'edat ordinària: no cal avançar-la.", voluntary: "Ja tens l'edat ordinària: no cal avançar-la." },
    },
    earlyInvoluntaryNote: "A més: 6 mesos inscrit com a demandant d'ocupació i un cessament per acomiadament col·lectiu, objectiu o una altra causa de l'art. 207. No val per als autònoms.",
    earlyVoluntaryNote: "A més: estar d'alta (o assimilat) i que la pensió resultant superi la mínima que et tocaria als 65.",
    earlyVoluntaryStopped: "Si deixes de cotitzar, normalment ja no estaràs d'alta: sense alta o situació assimilada no hi ha anticipada voluntària.",
    asOfLine: (date) => `Calculat a ${date}, amb el que has cotitzat fins aquell dia.`,
    delayTitle: "Demorada",
    delayAt: (date, months) => `El ${date} (${months} després)`,
    delayBonus: (bonus) => `Pensió un ${bonus} més alta per sempre (o pagament únic, o una barreja).`,
    delayActive: (share) => `Si després continues treballant (jubilació activa), cobres el ${share} de la pensió.`,
    delayNone: {
      "not-contributing": "Sense cotitzar després de l'edat ordinària no hi ha complement: només compten els anys cotitzats.",
      minimum: "Sense 15 anys cotitzats a l'edat ordinària no hi ha complement per demora (art. 210.2).",
    },
    delayHalfYear: "Més de 6 mesos solts sumen un 2 % només a partir del segon any complet.",
    articles: "Arts. 205, 207, 208 i 210 i disposició transitòria setena de la Llei general de la Seguretat Social.",
    invalid: {
      birth: "Posa una data de naixement vàlida.",
      "too-young": "Cal tenir com a mínim 16 anys.",
      "too-old": "Si vas néixer abans del 1948 vas fer 65 anys abans del 2013: se t'aplica la regla anterior (65 anys).",
      years: "Posa els anys cotitzats (de 0 a 60).",
      months: "Posa els mesos de 0 a 11.",
      "too-much": "Aquest període cotitzat no cap en la teva edat: revisa els anys i la data.",
      delay: "Posa els mesos de demora, d'1 a 120.",
    },
  },
  en: {
    title: "When can I retire?",
    intro: "Enter your date of birth and how long you have contributed (it is on your working-life report, the informe de vida laboral). We never ask for your ID or Social Security number: nothing leaves your browser.",
    noscript: "Without JavaScript you see the result for someone born on 20 June 1965 with 35 years contributed who keeps contributing.",
    birth: "Date of birth",
    birthHint: "Day, month and year.",
    contributed: "Contributed so far",
    years: "Years",
    months: "Months",
    contributedHint: "Whole years and months, without the extra-payment share (working-life report, in Tu Seguridad Social).",
    keep: "Will you keep contributing until you retire?",
    keepYes: "Yes",
    keepNo: "No",
    keepHint: "That is what Social Security assumes: your situation today stays the same.",
    type: "Type of retirement",
    delay: "Months you delay it",
    delayHint: "After the ordinary age: 12 = one year.",
    ordinary: "Ordinary age (no reduction)",
    ordinaryAt: (age) => `at ${age}`,
    reached: (date) => `You have reached it: since ${date} you can retire with no reduction.`,
    via65: (period, date) => `You retire at 65 because you reach ${period} of contributions (on ${date}).`,
    viaFull: (age, year) => `The full age for ${year} applies: ${age}.`,
    rule65Yes: (have, need) => `The 65 rule: yes. At 65 you will have ${have} and ${need} is required.`,
    rule65No: (have, need) => `The 65 rule: no. At 65 you will have ${have} and ${need} is required.`,
    minimumNo: (from) =>
      from
        ? `You do not have 15 years of contributions at the ordinary age: you would reach them on ${from}. Without 15 years there is no contributory pension (art. 205.1.b).`
        : "Without further contributions you do not reach 15 years: no contributory pension (art. 205.1.b); see the non-contributory pension.",
    earlyTitle: { involuntary: "Early after involuntary job loss, earliest", voluntary: "Voluntary early retirement, earliest" },
    earlyAt: (date, age) => `On ${date}, at ${age}`,
    earlyNow: (date, age) => `Already: on ${date} you are ${age}`,
    earlyCut: (coefText, months, column) => `Pension reduced by ${coefText} for life (${months} early; ${column}).`,
    earlyNone: {
      contribution: {
        involuntary: "You do not reach 33 years of contributions before the ordinary age.",
        voluntary: "You do not reach 35 years of contributions before the ordinary age.",
      },
      past: { involuntary: "You have already reached the ordinary age: no need to retire early.", voluntary: "You have already reached the ordinary age: no need to retire early." },
    },
    earlyInvoluntaryNote: "Also: 6 months registered as a job seeker and a job loss by collective or objective dismissal or another art. 207 cause. Not for the self-employed.",
    earlyVoluntaryNote: "Also: being registered (alta or equivalent) and a resulting pension above the minimum you would get at 65.",
    earlyVoluntaryStopped: "If you stop contributing you will usually no longer be registered (alta): without it, or an equivalent situation, there is no voluntary early retirement.",
    asOfLine: (date) => `Worked out on ${date}, with your contributions up to that day.`,
    delayTitle: "Delayed",
    delayAt: (date, months) => `On ${date} (${months} later)`,
    delayBonus: (bonus) => `A pension ${bonus} higher for life (or a lump sum, or a mix).`,
    delayActive: (share) => `If you then keep working (jubilación activa), you are paid ${share} of the pension.`,
    delayNone: {
      "not-contributing": "Without contributions after the ordinary age there is no bonus: only years contributed count.",
      minimum: "Without 15 years of contributions at the ordinary age there is no delay bonus (art. 210.2).",
    },
    delayHalfYear: "More than 6 extra months add 2% only from the second full year.",
    articles: "General Social Security Act, arts. 205, 207, 208 and 210 and seventh transitional provision.",
    invalid: {
      birth: "Enter a valid date of birth.",
      "too-young": "You must be at least 16.",
      "too-old": "If you were born before 1948 you turned 65 before 2013: the earlier rule (65) applies.",
      years: "Enter the years contributed (0 to 60).",
      months: "Enter the months, 0 to 11.",
      "too-much": "That contribution period does not fit your age: check the years and the date.",
      delay: "Enter the months of delay, 1 to 120.",
    },
  },
};
