import type { Locale } from "@/lib/i18n/config";
import { calcPath, type CalculatorId } from "@/lib/programmatic/calculators/paths";

/**
 * The homepage utilities strip: which pages, and in what order per edition.
 * Kept out of the component so a test can check every path against the
 * publisher that owns it; a renamed slug must not leave a dead homepage link.
 */

export type ToolKey = "today" | "holiday" | "weekend" | "localHolidays" | "transport" | "tax" | "mushrooms" | "reservoirs" | "school" | "airport" | "museums" | "monuments" | "cards" | "voting" | "barcelonaHub" | "clockChange" | "beaches" | "castanyada" | "shops" | "christmas" | "autumn" | "ski" | "snowNow";

export const PATHS: Record<ToolKey, Record<Locale, string>> = {
  // The daily page (src/lib/programmatic/today/paths.ts owns the segment).
  today: { ca: "avui", es: "hoy", en: "today" },
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
  ca: ["today", "voting", "clockChange", "holiday", "school", "weekend", "localHolidays", "mushrooms", "reservoirs", "museums", "transport", "airport", "monuments", "cards", "barcelonaHub", "beaches", "tax"],
  es: ["today", "voting", "clockChange", "holiday", "school", "weekend", "localHolidays", "mushrooms", "reservoirs", "museums", "transport", "airport", "monuments", "cards", "barcelonaHub", "beaches", "tax"],
  en: ["today", "barcelonaHub", "airport", "beaches", "monuments", "transport", "cards", "museums", "tax", "weekend", "holiday", "localHolidays", "school", "clockChange", "voting", "reservoirs", "mushrooms"],
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
  // 5 Nov 2026: from 1 Nov, not 15 Nov. The ski guide ranked ~60 for
  // "estaciones de esquí cataluña" with its last crawl on 12 Oct, and the
  // opening dates (28 Nov, 4 Dec) and early-bird passes (to 22 Nov, 8 Dec)
  // are November searches; the homepage is the strongest link it can get.
  { key: "ski", from: "11-01", to: "04-15" },
  // Wider than the ski season at both ends: the page says so honestly when
  // no station has snow, and early and late snow is what people search for.
  { key: "snowNow", from: "10-25", to: "05-15" },
  { key: "autumn", from: "10-01", to: "11-30" },
];

function inWindow(monthDay: string, from: string, to: string): boolean {
  return from <= to ? monthDay >= from && monthDay <= to : monthDay >= from || monthDay <= to;
}

/*
 * 12 Nov 2026 (answer-first layout, docs/SEO_EXPERIMENTS.md): the most-searched
 * utilities open the homepage, before the articles. They are the menu's
 * topical hubs (lib/nav/menu.ts: strikes, holidays, elections, ordered by each
 * edition's Search Console impressions) plus the school calendar. A strip tool
 * that leads to the same page as a top card is left out of the strip, so no
 * card appears twice (tests/home-tools.test.ts).
 */
export type TopToolKey = "strikes" | "holidays" | "elections" | "school";

export const TOP_TOOLS: Record<Locale, TopToolKey[]> = {
  es: ["strikes", "holidays", "elections", "school"],
  ca: ["elections", "strikes", "holidays", "school"],
  en: ["elections", "strikes", "holidays", "school"],
};

/** Strip tools that open the same page as a top card. */
export const DUPLICATES_TOP: ToolKey[] = ["school"];

/** The strip for one edition on one day (`today` as YYYY-MM-DD). */
export function toolsFor(locale: Locale, today: string): ToolKey[] {
  const monthDay = today.slice(5, 10);
  const season = SEASONAL.filter((s) => inWindow(monthDay, s.from, s.to)).map((s) => s.key);
  return [...season, ...ORDER[locale]];
}

/*
 * 26 Nov 2026 (batch 6C): the five most-searched calculators of each edition,
 * one text line under the homepage search (components/HomeTools.tsx
 * HomeCalculators), then the calculators hub. A line of links, not a card
 * grid (owner, 12 Nov 2026: nothing between the tiles and the articles that
 * pushes them a screen down). Order: Search Console impressions of each
 * edition's page, 30 Oct-26 Nov 2026 (`snapshot.py pages 28 6000`):
 *  es: premios-loteria 3,774 · letras-del-tesoro 2,359 · salario-minimo-2027 1,111 · dias-habiles 1,082 · permisos-laborales 691
 *  ca: pujada-pensions-2027 444 · dies-habils 368 · ipc 336 · permisos-laborals 295 · atur 293
 *  en: spain-pension-increase-2027 189 · spain-minimum-wage-2027 164 · spain-inflation-cpi 152 · spain-unemployment-subsidy 119 · itv-spain 102
 * Re-read with calculators/related.ts POPULARITY (RANKING_REREAD_BY).
 */
export type HomeCalculatorId = Extract<
  CalculatorId,
  "lottery-tax" | "treasury-bills" | "smi-2027" | "working-days" | "paid-leave" | "pensions-2027" | "ipc" | "unemployment" | "unemployment-subsidy" | "itv"
>;

export const HOME_CALCULATORS: Record<Locale, readonly HomeCalculatorId[]> = {
  es: ["lottery-tax", "treasury-bills", "smi-2027", "working-days", "paid-leave"],
  ca: ["pensions-2027", "working-days", "ipc", "paid-leave", "unemployment"],
  en: ["pensions-2027", "smi-2027", "ipc", "unemployment-subsidy", "itv"],
};

/** Short names for the line (the hub cards' titles are longer). */
export const HOME_CALCULATOR_LABEL: Record<HomeCalculatorId, Record<Locale, string>> = {
  "lottery-tax": { es: "Premios de lotería", ca: "Premis de loteria", en: "Lottery prize tax" },
  "treasury-bills": { es: "Letras del Tesoro", ca: "Lletres del Tresor", en: "Treasury bills" },
  "smi-2027": { es: "Salario mínimo 2027", ca: "Salari mínim 2027", en: "Minimum wage 2027" },
  "working-days": { es: "Días hábiles", ca: "Dies hàbils", en: "Working days" },
  "paid-leave": { es: "Permisos laborales", ca: "Permisos laborals", en: "Paid leave" },
  "pensions-2027": { es: "Subida de las pensiones 2027", ca: "Pujada de les pensions 2027", en: "Pension increase 2027" },
  ipc: { es: "IPC", ca: "IPC", en: "Inflation (CPI)" },
  unemployment: { es: "Paro", ca: "Atur", en: "Unemployment benefit" },
  "unemployment-subsidy": { es: "Subsidio por desempleo", ca: "Subsidi d'atur", en: "Unemployment subsidy" },
  itv: { es: "ITV", ca: "ITV", en: "ITV (vehicle inspection)" },
};

export const HOME_CALCULATORS_COPY: Record<Locale, { lead: string; all: string }> = {
  es: { lead: "Calculadoras más usadas:", all: "todas las calculadoras" },
  ca: { lead: "Calculadores més usades:", all: "totes les calculadores" },
  en: { lead: "Most-used calculators:", all: "all calculators" },
};

/** The line's links for one edition: each tool's page (the component adds the hub). */
export function homeCalculatorLinks(locale: Locale): { href: string; label: string }[] {
  return HOME_CALCULATORS[locale].map((id) => ({ href: calcPath(id, locale), label: HOME_CALCULATOR_LABEL[id][locale] }));
}
