import type { Locale } from "@/lib/i18n/config";

/**
 * The homepage utilities strip: which pages, and in what order per edition.
 * Kept out of the component so a test can check every path against the
 * publisher that owns it; a renamed slug must not leave a dead homepage link.
 */

export type ToolKey = "holiday" | "weekend" | "localHolidays" | "transport" | "tax" | "mushrooms";

export const PATHS: Record<ToolKey, Record<Locale, string>> = {
  holiday: {
    ca: "guies/es-festiu-avui-catalunya",
    es: "guias/es-festivo-hoy-cataluna",
    en: "guides/is-today-a-holiday-in-catalonia",
  },
  weekend: {
    ca: "agenda/que-fer-aquest-cap-de-setmana-catalunya",
    es: "agenda/que-hacer-este-fin-de-semana-cataluna",
    en: "agenda/things-to-do-catalonia-this-weekend",
  },
  localHolidays: {
    ca: "guies/festius-locals-catalunya",
    es: "guias/festivos-locales-cataluna",
    en: "guides/local-holidays-catalonia",
  },
  transport: {
    ca: "guies/targetes-transport-barcelona",
    es: "guias/tarjetas-transporte-barcelona",
    en: "guides/barcelona-transport-passes",
  },
  tax: {
    ca: "guies/taxa-turistica-barcelona-catalunya",
    es: "guias/tasa-turistica-barcelona-cataluna",
    en: "guides/barcelona-catalonia-tourist-tax",
  },
  mushrooms: {
    ca: "natura/bolets-catalunya-condicions",
    es: "naturaleza/setas-cataluna-condiciones",
    en: "nature/mushroom-season-catalonia",
  },
};

/*
 * Visitors to the English edition are mostly travellers about to arrive in
 * Barcelona; the Catalan and Spanish editions are read mostly by people who
 * live here. Same tools, ordered by who is asking.
 */
export const ORDER: Record<Locale, ToolKey[]> = {
  ca: ["holiday", "weekend", "localHolidays", "mushrooms", "transport", "tax"],
  es: ["holiday", "weekend", "localHolidays", "mushrooms", "transport", "tax"],
  en: ["transport", "tax", "weekend", "holiday", "localHolidays", "mushrooms"],
};
