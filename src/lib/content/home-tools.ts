import type { Locale } from "@/lib/i18n/config";

/**
 * The homepage utilities strip: which pages, and in what order per edition.
 * Kept out of the component so a test can check every path against the
 * publisher that owns it; a renamed slug must not leave a dead homepage link.
 */

export type ToolKey = "holiday" | "weekend" | "localHolidays" | "transport" | "tax" | "mushrooms" | "reservoirs" | "school" | "airport" | "museums" | "monuments" | "cards" | "voting" | "barcelonaHub" | "clockChange" | "beaches";

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
  beaches: {
    ca: "guies/platges-barcelona",
    es: "guias/playas-barcelona",
    en: "guides/barcelona-beaches",
  },
  clockChange: {
    ca: "guies/canvi-hora-catalunya",
    es: "guias/cambio-hora-espana",
    en: "guides/clock-change-spain",
  },
  barcelonaHub: {
    ca: "guies/barcelona-guia-practica",
    es: "guias/barcelona-guia-practica",
    en: "guides/barcelona-practical-guide",
  },
  voting: {
    ca: "guies/com-votar-eleccions-catalunya",
    es: "guias/como-votar-elecciones-cataluna",
    en: "guides/how-to-vote-catalonia",
  },
  museums: {
    ca: "guies/museus-gratis-barcelona",
    es: "guias/museos-gratis-barcelona",
    en: "guides/free-museums-barcelona",
  },
  monuments: {
    ca: "guies/entrades-sagrada-familia-park-guell-casa-batllo",
    es: "guias/entradas-sagrada-familia-park-guell-casa-batllo",
    en: "guides/sagrada-familia-park-guell-casa-batllo-tickets",
  },
  cards: {
    ca: "guies/barcelona-card-o-hola-barcelona",
    es: "guias/barcelona-card-o-hola-barcelona",
    en: "guides/barcelona-card-vs-hola-barcelona",
  },
  airport: {
    ca: "guies/aeroport-barcelona-centre",
    es: "guias/aeropuerto-barcelona-centro",
    en: "guides/barcelona-airport-to-city-centre",
  },
  school: {
    ca: "guies/calendari-escolar-catalunya",
    es: "guias/calendario-escolar-cataluna",
    en: "guides/catalonia-school-calendar",
  },
  reservoirs: {
    ca: "guies/embassaments-catalunya-avui",
    es: "guias/embalses-cataluna-hoy",
    en: "guides/catalonia-reservoir-levels",
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
  ca: ["voting", "clockChange", "holiday", "school", "weekend", "localHolidays", "mushrooms", "reservoirs", "museums", "transport", "airport", "monuments", "cards", "barcelonaHub", "beaches", "tax"],
  es: ["voting", "clockChange", "holiday", "school", "weekend", "localHolidays", "mushrooms", "reservoirs", "museums", "transport", "airport", "monuments", "cards", "barcelonaHub", "beaches", "tax"],
  en: ["barcelonaHub", "airport", "beaches", "monuments", "transport", "cards", "museums", "tax", "weekend", "holiday", "localHolidays", "school", "clockChange", "voting", "reservoirs", "mushrooms"],
};
