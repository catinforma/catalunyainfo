import type { Locale } from "@/lib/i18n/config";
import { butanePath } from "@/lib/programmatic/butane/paths";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { hubPath as holidaysHub, municipalityPath } from "@/lib/programmatic/holidays/paths";
import { reservoirHubPath, reservoirPath } from "@/lib/programmatic/reservoirs/paths";
import { linePath } from "@/lib/programmatic/rodalies/paths";

/**
 * Hand-picked internal links from the 25 Nov 2026 link-graph audit
 * (docs/SEO_EXPERIMENTS.md, "Internal-link audit, round 2").
 *
 * The audit crawled the whole sitemap (3,325 URLs, 25 Nov 2026) and counted
 * links inside <main> from pages that are not bulk templates. These pages had
 * fewer than five of those, at position 8 to 20, so each gets a few links from
 * the guide or hub a reader of that subject is already on. Labels are the
 * words people search. Every target is a code route or a content page in the
 * same language as the page that links it.
 *
 * Kept free of the content bundles so tests can import it directly and every
 * builder (guides, the Today page) reads the same list.
 */

export type AuditLink = { label: string; href: string };

const A = (label: string, href: string): string => `[${label}](${href})`;

const RESERVOIR_LABELS: Record<Locale, { sau: string; susqueda: string; hub: string }> = {
  ca: { sau: "Embassament de Sau: nivell avui", susqueda: "Embassament de Susqueda: nivell avui", hub: "Embassaments de Catalunya, un per un: nivell avui" },
  es: { sau: "Embalse de Sau: nivel hoy", susqueda: "Embalse de Susqueda: nivel hoy", hub: "Embalses de Cataluña uno a uno: nivel hoy" },
  en: { sau: "Sau reservoir: water level today", susqueda: "Susqueda reservoir: water level today", hub: "Catalonia's reservoirs one by one: level today" },
};

/** Sau, Susqueda and the hub, in that order. */
export function reservoirLinks(locale: Locale): AuditLink[] {
  const l = RESERVOIR_LABELS[locale];
  return [
    { label: l.sau, href: reservoirPath(locale, "sau") },
    { label: l.susqueda, href: reservoirPath(locale, "susqueda") },
    { label: l.hub, href: reservoirHubPath(locale) },
  ];
}

const BUTANE_LABEL: Record<Locale, string> = {
  ca: "Preu de la bombona de butà avui",
  es: "Precio de la bombona de butano hoy",
  en: "Butane bottle price today",
};
export const butaneLink = (locale: Locale): AuditLink => ({ label: BUTANE_LABEL[locale], href: butanePath(locale) });

/** Barcelona's holidays page and the holidays hub, in that order. */
export function barcelonaHolidayLinks(locale: Locale): AuditLink[] {
  const label = {
    ca: ["Festius a Barcelona", "Festius de Catalunya per municipi"],
    es: ["Festivos en Barcelona", "Festivos de Cataluña por municipio"],
    en: ["Public holidays in Barcelona", "Public holidays in Catalonia, town by town"],
  }[locale];
  return [
    { label: label[0] as string, href: municipalityPath(locale, "barcelona") },
    { label: label[1] as string, href: holidaysHub(locale) },
  ];
}

const TARRAGONA_HOLIDAYS_LABEL: Record<Locale, string> = {
  ca: "Festius a Tarragona: locals i de Catalunya",
  es: "Festivos en Tarragona: locales y de Cataluña",
  en: "Public holidays in Tarragona: local and Catalonia-wide",
};
export const tarragonaHolidayLink = (locale: Locale): AuditLink => ({ label: TARRAGONA_HOLIDAYS_LABEL[locale], href: municipalityPath(locale, "tarragona") });

const WORKING_DAYS_LABEL: Record<Locale, string> = {
  ca: "Calculadora de dies hàbils: quan acaba un termini",
  es: "Calculadora de días hábiles: cuándo acaba un plazo",
  en: "Working days calculator: when a deadline ends",
};
export const workingDaysLink = (locale: Locale): AuditLink => ({ label: WORKING_DAYS_LABEL[locale], href: calcPath("working-days", locale) });

/** R1, R2 and R4 line pages, in that order. */
export const RAIL_LINES = ["R1", "R2", "R4"] as const;
export const railLineHrefs = (locale: Locale): string[] => RAIL_LINES.map((id) => linePath(locale, id));

/** Day trips by train: where to check each line today. */
export function railLinesSentence(locale: Locale): string {
  const [r1, r2, r4] = railLineHrefs(locale) as [string, string, string];
  return {
    ca: `Estat de les línies d'aquestes escapades avui: ${A("R1 de Rodalies", r1)}, ${A("R2 de Rodalies", r2)} i ${A("R4 de Rodalies", r4)}, amb les incidències.`,
    es: `Estado de las líneas de estas escapadas hoy: ${A("R1 de Rodalies", r1)}, ${A("R2 de Rodalies", r2)} y ${A("R4 de Rodalies", r4)}, con las incidencias.`,
    en: `Today's status of the lines on these day trips, with disruptions: ${A("Rodalies R1", r1)}, ${A("Rodalies R2", r2)} and ${A("Rodalies R4", r4)}.`,
  }[locale];
}

/** Practical guide: the calendar, one sentence before the closing note. */
export function barcelonaHolidaysSentence(locale: Locale): string {
  const [bcn, hub] = barcelonaHolidayLinks(locale).map((l) => l.href) as [string, string];
  return {
    ca: `Abans de fixar el dia, comprova els ${A("festius a Barcelona", bcn)} i els ${A("festius de Catalunya per municipi", hub)}.`,
    es: `Antes de fijar el día, comprueba los ${A("festivos en Barcelona", bcn)} y los ${A("festivos de Cataluña por municipio", hub)}.`,
    en: `Before you fix the day, check the ${A("public holidays in Barcelona", bcn)} and the ${A("public holidays in Catalonia, town by town", hub)}.`,
  }[locale];
}

/** Weather guide: after the weather, how the reservoirs stand. */
export function reservoirsSentence(locale: Locale): string {
  const [sau, susqueda, hub] = reservoirLinks(locale).map((l) => l.href) as [string, string, string];
  return {
    ca: `Després d'un estiu sec o d'una tardor plujosa, mira el nivell de l'${A("embassament de Sau", sau)}, de l'${A("embassament de Susqueda", susqueda)} i dels ${A("embassaments de Catalunya un per un", hub)}.`,
    es: `Tras un verano seco o un otoño lluvioso, mira el nivel del ${A("embalse de Sau", sau)}, del ${A("embalse de Susqueda", susqueda)} y de los ${A("embalses de Cataluña uno a uno", hub)}.`,
    en: `After a dry summer or a wet autumn, check the water level of the ${A("Sau reservoir", sau)}, the ${A("Susqueda reservoir", susqueda)} and ${A("Catalonia's reservoirs one by one", hub)}.`,
  }[locale];
}

/** Related-list item for the Tarragona and ZBE guides. */
export const relatedItem = (l: AuditLink): string => A(l.label, l.href);
