import type { Locale } from "@/lib/i18n/config";

/**
 * The homepage utilities strip: which pages, and in what order per edition.
 * Kept out of the component so a test can check every path against the
 * publisher that owns it; a renamed slug must not leave a dead homepage link.
 */

export type ToolKey = "holiday" | "weekend" | "localHolidays" | "transport" | "tax" | "mushrooms" | "reservoirs" | "school" | "airport" | "museums" | "monuments" | "cards" | "voting" | "barcelonaHub" | "clockChange" | "beaches" | "castanyada" | "shops" | "christmas" | "autumn" | "ski" | "snowNow";

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
  castanyada: {
    ca: "tradicions/castanyada-catalunya",
    es: "tradiciones/castanyada-cataluna",
    en: "traditions/castanyada-catalonia",
  },
  shops: {
    ca: "guies/botigues-obertes-festius-catalunya",
    es: "guias/tiendas-abiertas-festivos-cataluna",
    en: "guides/shops-open-sundays-holidays-catalonia",
  },
  christmas: {
    ca: "tradicions/mercats-de-nadal-catalunya",
    es: "tradiciones/mercados-navidad-cataluna",
    en: "traditions/christmas-markets-catalonia",
  },
  autumn: {
    ca: "natura/colors-tardor-catalunya",
    es: "naturaleza/colores-otono-cataluna",
    en: "nature/fall-colors-catalonia",
  },
  ski: {
    ca: "guies/estacions-esqui-catalunya",
    es: "guias/estaciones-esqui-cataluna",
    en: "guides/ski-resorts-catalonia",
  },
  snowNow: {
    ca: "guies/neu-pirineu-avui",
    es: "guias/nieve-pirineo-hoy",
    en: "guides/snow-pyrenees-today",
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

/*
 * Pages that matter only part of the year go first while they matter and
 * leave the strip afterwards. Search Console, 23 Oct 2026: the Castanyada page
 * ranked 60th for "castanyada" eight days before 31 October, and its Spanish
 * edition had never been crawled; the homepage did not link it. Windows are
 * month-day, inclusive, in Catalan time; a window whose start is after its end
 * runs across New Year.
 */
export const SEASONAL: { key: ToolKey; from: string; to: string }[] = [
  { key: "castanyada", from: "10-10", to: "11-01" },
  { key: "christmas", from: "11-02", to: "01-06" },
  { key: "shops", from: "10-20", to: "01-06" },
  { key: "ski", from: "11-15", to: "04-15" },
  // Wider than the ski season at both ends: the page says so honestly when
  // no station has snow, and early and late snow is what people search for.
  { key: "snowNow", from: "10-25", to: "05-15" },
  { key: "autumn", from: "10-01", to: "11-30" },
];

function inWindow(monthDay: string, from: string, to: string): boolean {
  return from <= to ? monthDay >= from && monthDay <= to : monthDay >= from || monthDay <= to;
}

/** The strip for one edition on one day (`today` as YYYY-MM-DD). */
export function toolsFor(locale: Locale, today: string): ToolKey[] {
  const monthDay = today.slice(5, 10);
  const season = SEASONAL.filter((s) => inWindow(monthDay, s.from, s.to)).map((s) => s.key);
  return [...season, ...ORDER[locale]];
}
