import { dayMonthYear, type DateLocale } from "./format";

/**
 * The date pages' question, which is their H1 and their breadcrumb: "És
 * festiu el 8 de desembre de 2026 a Catalunya?". Its own module so the date
 * copy can ask it without importing `copy.ts`, which imports the date copy.
 */
export function dateQuestion(iso: string, locale: DateLocale): string {
  if (locale === "ca") {
    const day = Number(iso.slice(8, 10));
    const art = day === 1 || day === 11 ? "l'" : "el ";
    return `És festiu ${art}${dayMonthYear(iso, "ca")} a Catalunya?`;
  }
  if (locale === "es") return `¿Es festivo el ${dayMonthYear(iso, "es")} en Cataluña?`;
  return `Is ${dayMonthYear(iso, "en")} a public holiday in Catalonia?`;
}
