import type { Locale } from "@/lib/i18n/config";
import { b2href } from "@/lib/content/batch02/shared";
import { municipalityPath } from "@/lib/programmatic/holidays/paths";
import { linePath } from "@/lib/programmatic/rodalies/paths";

/**
 * Hand-picked links between the two Sitges guides (the film festival guide in
 * features/sitges.ts and the train guide in batch02/coast-trips.ts) and the
 * pages that answer the next question a Sitges reader asks (25 Nov 2026
 * internal-link audit: the festival guides had one body link, from the section
 * hub). Labels are the searched words. Every target is indexable
 * (tests/sitges-links.test.ts checks them against lib/seo/low-demand.ts); the
 * three targets are code routes or content pages in the same language.
 */

export type SitgesLink = { label: string; href: string };

const HOLIDAYS_LABEL: Record<Locale, string> = {
  ca: "festius a Sitges",
  es: "festivos en Sitges",
  en: "public holidays in Sitges",
};
const CARNIVAL_LABEL: Record<Locale, string> = {
  ca: "Carnaval de Sitges 2027",
  es: "Carnaval de Sitges 2027",
  en: "Sitges Carnival 2027",
};
const R2_LABEL: Record<Locale, string> = {
  ca: "R2 Sud de Rodalies: estat del servei i horaris",
  es: "R2 Sud de Rodalies: estado del servicio y horarios",
  en: "Rodalies R2 Sud: service status and timetable",
};

export const sitgesHolidaysHref = (locale: Locale): string => municipalityPath(locale, "sitges");
export const sitgesCarnivalHref = (locale: Locale): string => b2href("carnival", locale);
export const sitgesR2Href = (locale: Locale): string => linePath(locale, "R2S");

/** The Sitges holidays page, the Carnival 2027 guide and the R2 Sud line page, in that order. */
export function sitgesNextLinks(locale: Locale): SitgesLink[] {
  return [
    { label: HOLIDAYS_LABEL[locale], href: sitgesHolidaysHref(locale) },
    { label: CARNIVAL_LABEL[locale], href: sitgesCarnivalHref(locale) },
    { label: R2_LABEL[locale], href: sitgesR2Href(locale) },
  ];
}

function md(l: SitgesLink): string {
  return `[${l.label}](${l.href})`;
}

/** Paragraph closing the film festival guide: Sitges outside the festival. */
export function festivalNextParagraph(locale: Locale): string {
  const [h, c, r] = sitgesNextLinks(locale).map(md) as [string, string, string];
  return {
    ca: `Sitges la resta de l'any: ${h}, ${c} i ${r}.`,
    es: `Sitges el resto del año: ${h}, ${c} y ${r}.`,
    en: `Sitges the rest of the year: ${h}, ${c} and ${r}.`,
  }[locale];
}

/** Sentence added to the train guide's closing line: the festival guide, the holidays page and the R2 Sud page. */
export function trainGuideNextSentence(locale: Locale, festivalLabel: string, festivalHref: string): string {
  const f = `[${festivalLabel}](${festivalHref})`;
  const h = md({ label: HOLIDAYS_LABEL[locale], href: sitgesHolidaysHref(locale) });
  const r = md({ label: R2_LABEL[locale], href: sitgesR2Href(locale) });
  return {
    ca: ` I per a Sitges mateix: ${f}, ${h} i ${r}.`,
    es: ` Y para Sitges en sí: ${f}, ${h} y ${r}.`,
    en: ` And for Sitges itself: ${f}, ${h} and ${r}.`,
  }[locale];
}
