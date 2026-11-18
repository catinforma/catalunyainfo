import type { Locale } from "@/lib/i18n/config";
import { calcPath, type CalculatorId } from "@/lib/programmatic/calculators/paths";
import { municipalities, unlistedTowns } from "@/lib/programmatic/holidays/data";
import { IPREM_YEAR } from "@/lib/programmatic/iprem/rules";
import { municipalityPath } from "@/lib/programmatic/holidays/paths";
import { hasEnglishPage } from "@/lib/programmatic/holidays/english";
import { CITIES } from "@/lib/programmatic/spain-2027/cities";
import { editionsOf } from "@/lib/programmatic/spain-2027/editions";
import { cityPath } from "@/lib/programmatic/spain-2027/paths";
import { ZONES } from "@/lib/programmatic/weekend/zones";
import { zonePath } from "@/lib/programmatic/weekend/paths";

/**
 * Direct answers for the site search, shown above the CMS results.
 *
 * The CMS search (`searchEntries`) only sees CMS entries, so a query for a
 * town ("festiu local de monistrol de montserrat 2027", "festivos adicionales
 * Tona"), a network ("FGC", "TMB", "rodalies demà") or a family of
 * programmatic pages (town holidays, Spain 2027 cities, weekend zones,
 * calculators) found nothing or a strike page first (GA4 site search, 28 days
 * to 17 Nov 2026). These are matched in memory, no external service: the
 * curated topics below by keyword, the programmatic families by place name.
 * Every path is one the site serves (tests/search-shortcuts.test.ts).
 */

export interface Shortcut {
  href: string;
  label: string;
}

type PerLocale<T> = Record<Locale, T>;

interface Topic {
  /** Phrases, already normalised (lower case, no accents): any one, as whole words, matches. */
  keys: readonly string[];
  links: readonly PerLocale<Shortcut>[];
}

const L = (ca: [string, string], es: [string, string], en: [string, string]): PerLocale<Shortcut> => ({
  ca: { href: ca[0], label: ca[1] },
  es: { href: es[0], label: es[1] },
  en: { href: en[0], label: en[1] },
});

const METRO = L(
  ["/ca/guies/horaris-metro-barcelona/", "Horaris del metro de Barcelona (TMB)"],
  ["/es/guias/horarios-metro-barcelona/", "Horarios del metro de Barcelona (TMB)"],
  ["/en/guides/barcelona-metro-hours/", "Barcelona metro hours (TMB)"],
);
const PASSES = L(
  ["/ca/guies/targetes-transport-barcelona/", "Targetes de transport: T-casual, T-usual i tarifes (TMB, FGC, Rodalies)"],
  ["/es/guias/tarjetas-transporte-barcelona/", "Tarjetas de transporte: T-casual, T-usual y tarifas (TMB, FGC, Rodalies)"],
  ["/en/guides/barcelona-transport-passes/", "Barcelona transport passes: T-casual, T-usual and fares (TMB, FGC, Rodalies)"],
);
const RODALIES = L(
  ["/ca/rodalies/", "Rodalies avui: avisos i estat de cada línia"],
  ["/es/rodalies/", "Rodalies hoy: avisos y estado de cada línea"],
  ["/en/rodalies/", "Rodalies today: notices and every line's status"],
);
const STRIKE = L(
  ["/ca/guies/vaga-avui-catalunya/", "Vagues avui i pròximes vagues a Catalunya"],
  ["/es/guias/huelga-hoy-cataluna/", "Huelgas hoy y próximas huelgas en Cataluña"],
  ["/en/guides/strike-barcelona-catalonia-today/", "Strikes in Catalonia today and next"],
);
const XMAS_TRANSPORT = L(
  ["/ca/guies/transport-nadal-cap-d-any-barcelona/", "Transport per Nadal i Cap d'Any a Barcelona"],
  ["/es/guias/transporte-navidad-nochevieja-barcelona/", "Transporte en Navidad y Nochevieja en Barcelona"],
  ["/en/guides/barcelona-public-transport-christmas-new-year/", "Barcelona public transport at Christmas and New Year"],
);
const MONTSERRAT = L(
  ["/ca/escapades/montserrat-per-lliure-des-barcelona/", "Montserrat per lliure des de Barcelona: cremallera, aeri i tren"],
  ["/es/escapadas/montserrat-por-libre-desde-barcelona/", "Montserrat por libre desde Barcelona: cremallera, aéreo y tren"],
  ["/en/day-trips/montserrat-without-a-tour-from-barcelona/", "Montserrat without a tour: rack railway, cable car and train"],
);
const SITGES = L(
  ["/ca/escapades/sitges-des-de-barcelona-tren/", "Sitges des de Barcelona en tren"],
  ["/es/escapadas/sitges-desde-barcelona-tren/", "Sitges desde Barcelona en tren"],
  ["/en/day-trips/sitges-from-barcelona-by-train/", "Sitges from Barcelona by train"],
);
const GIRONA = L(
  ["/ca/escapades/girona-des-de-barcelona-tren/", "Girona des de Barcelona en tren"],
  ["/es/escapadas/girona-desde-barcelona-tren/", "Girona desde Barcelona en tren"],
  ["/en/day-trips/girona-from-barcelona-by-train/", "Girona from Barcelona by train"],
);
const TARRAGONA = L(
  ["/ca/escapades/tarragona-des-de-barcelona-tren/", "Tarragona des de Barcelona en tren"],
  ["/es/escapadas/tarragona-desde-barcelona-tren/", "Tarragona desde Barcelona en tren"],
  ["/en/day-trips/tarragona-from-barcelona-by-train/", "Tarragona from Barcelona by train"],
);
const NO_CAR = L(
  ["/ca/escapades/catalunya-sense-cotxe-tren/", "Catalunya sense cotxe: escapades en tren"],
  ["/es/escapadas/cataluna-sin-coche-tren/", "Cataluña sin coche: escapadas en tren"],
  ["/en/guides/cerdanya-without-a-car/", "The Cerdanya without a car"],
);
const DAY_TRIPS = L(
  ["/ca/escapades/escapades-barcelona-mes-enlla-montserrat/", "Escapades des de Barcelona més enllà de Montserrat"],
  ["/es/escapadas/escapadas-barcelona-mas-alla-montserrat/", "Escapadas desde Barcelona más allá de Montserrat"],
  ["/en/day-trips/beyond-montserrat-barcelona-day-trips/", "Day trips from Barcelona beyond Montserrat"],
);
const HOLIDAYS = L(
  ["/ca/festius/", "Festius locals de tots els municipis de Catalunya"],
  ["/es/festivos/", "Festivos locales de todos los municipios de Cataluña"],
  ["/en/holidays/", "Public and local holidays in Catalonia"],
);
const WORK_CALENDAR = L(
  ["/ca/guies/calendari-laboral-catalunya/", "Calendari laboral de Catalunya"],
  ["/es/guias/calendario-laboral-cataluna/", "Calendario laboral de Cataluña"],
  ["/en/guides/catalonia-public-holidays/", "Catalonia public holidays"],
);
const DEC_BRIDGE = L(
  ["/ca/guies/pont-desembre-catalunya/", "Pont de la Puríssima i de desembre 2026"],
  ["/es/guias/puente-diciembre-cataluna/", "Puente de diciembre 2026 en Cataluña"],
  ["/en/guides/december-long-weekend-catalonia/", "The December 2026 long weekend in Catalonia"],
);
const EASTER = L(
  ["/ca/guies/setmana-santa-2027-catalunya/", "Setmana Santa i Pasqua 2027 a Catalunya"],
  ["/es/guias/semana-santa-2027-cataluna/", "Semana Santa y Pascua 2027 en Cataluña"],
  ["/en/guides/easter-2027-catalonia/", "Easter 2027 in Catalonia"],
);
const CARNIVAL = L(
  ["/ca/tradicions/carnaval-catalunya/", "Carnestoltes a Catalunya: dates i on anar"],
  ["/es/tradiciones/carnaval-cataluna/", "Carnaval en Cataluña: fechas y dónde ir"],
  ["/en/traditions/carnival-catalonia/", "Carnival in Catalonia: dates and where to go"],
);
const SHOPS = L(
  ["/ca/guies/botigues-obertes-festius-catalunya/", "Botigues obertes en diumenges i festius"],
  ["/es/guias/tiendas-abiertas-festivos-cataluna/", "Tiendas abiertas en domingos y festivos"],
  ["/en/guides/shops-open-sundays-holidays-catalonia/", "Shops open on Sundays and holidays"],
);

const FARMERS = L(
  ["/ca/guies/mercats-de-pages-venda-proximitat/", "Mercats de pagès i venda de proximitat: la llista oficial i el segell"],
  ["/es/guias/mercados-payeses-venta-proximidad-cataluna/", "Mercados payeses y venta de proximidad: la lista oficial y el sello"],
  ["/en/guides/farmers-markets-catalonia/", "Farmers' markets and the local-sale label in Catalonia"],
);

const TOPICS: readonly Topic[] = [
  { keys: ["mercat de pages", "mercats de pages", "mercats pagesos", "mercat pages", "mercats agraris", "mercat agrari", "venda directa", "venda de proximitat", "venta directa", "venta de proximidad", "mercado payes", "mercados payeses", "mercado de payes", "mercados de payes", "mercados agrarios", "km 0", "farmers market", "farmers markets"], links: [FARMERS] },
  { keys: ["metro", "tmb", "bus", "autobus", "horaris metro", "horarios metro"], links: [METRO, PASSES, XMAS_TRANSPORT] },
  { keys: ["fgc", "ferrocarrils", "ferrocarrils de la generalitat", "cremallera", "cremallera de montserrat"], links: [PASSES, MONTSERRAT, XMAS_TRANSPORT] },
  { keys: ["rodalies", "renfe", "cercanias", "tren", "trens", "trenes", "train", "trains"], links: [RODALIES, STRIKE, PASSES] },
  { keys: ["vaga", "vagues", "huelga", "huelgas", "strike", "strikes"], links: [STRIKE] },
  { keys: ["t casual", "t usual", "tcasual", "tusual", "targeta", "targetes", "tarjeta", "tarjetas", "abonament", "abono", "bitllet", "billete", "tarifes", "tarifas", "atm"], links: [PASSES] },
  { keys: ["montserrat"], links: [MONTSERRAT, DAY_TRIPS] },
  { keys: ["sitges"], links: [SITGES] },
  { keys: ["girona", "gerona"], links: [GIRONA] },
  { keys: ["tarragona"], links: [TARRAGONA] },
  { keys: ["sense cotxe", "sin coche", "without a car", "escapada", "escapades", "escapadas", "excursio", "excursion", "day trip", "day trips"], links: [DAY_TRIPS, NO_CAR] },
  { keys: ["festiu", "festius", "festivo", "festivos", "festes locals", "fiestas locales", "festiu local", "festivo local", "holiday", "holidays"], links: [HOLIDAYS, WORK_CALENDAR] },
  { keys: ["calendari laboral", "calendario laboral", "work calendar"], links: [WORK_CALENDAR] },
  { keys: ["pont", "puente", "purissima", "inmaculada", "immaculada", "long weekend"], links: [DEC_BRIDGE] },
  { keys: ["pasqua", "pascua", "setmana santa", "semana santa", "easter"], links: [EASTER] },
  { keys: ["carnestoltes", "carnaval", "carnival"], links: [CARNIVAL] },
  { keys: ["botigues", "tiendas", "shops", "centres comercials", "centros comerciales", "obertes", "abiertas", "obrir diumenge", "abrir domingo"], links: [SHOPS] },
];

/** Calculators: names people type, to the tool. */
const CALC_KEYS: readonly { keys: readonly string[]; id: CalculatorId; label: PerLocale<string> }[] = [
  { keys: ["sou net", "sueldo neto", "salari net", "salario neto", "net salary", "nomina"], id: "net-salary", label: { ca: "Calculadora de sou net", es: "Calculadora de sueldo neto", en: "Net salary calculator" } },
  { keys: ["paga extra", "pagas extra", "pagues extra", "paga de navidad", "paga de nadal", "extra pay", "christmas bonus"], id: "extra-pay", label: { ca: "Calculadora de la paga extra", es: "Calculadora de la paga extra", en: "Christmas extra pay calculator" } },
  { keys: ["hipoteca", "mortgage"], id: "mortgage", label: { ca: "Calculadora d'hipoteca", es: "Calculadora de hipoteca", en: "Mortgage calculator" } },
  { keys: ["euribor"], id: "euribor", label: { ca: "Euríbor avui", es: "Euríbor hoy", en: "Euribor today" } },
  { keys: ["bono social", "bo social", "social bonus"], id: "bono-social", label: { ca: "Bo social elèctric: tens dret?", es: "Bono social eléctrico: ¿tienes derecho?", en: "Bono social (electricity): do you qualify?" } },
  { keys: ["multa", "multas", "multes", "multa dgt", "multas dgt", "multa de trafico", "multa de transit", "puntos dgt", "puntos carnet", "punts carnet", "traffic fine", "speeding fine"], id: "traffic-fines", label: { ca: "Multes de trànsit: terminis i 50 %", es: "Multas de tráfico: plazos y 50 %", en: "Traffic fines: deadlines and 50% off" } },
  { keys: ["zona tensionada", "zonas tensionadas", "zones tensionades", "zona tensada", "mercado tensionado", "ley de vivienda", "llei de l habitatge", "rent control"], id: "zona-tensionada", label: { ca: "Zona tensionada: hi és el teu municipi?", es: "Zona tensionada: ¿está tu municipio?", en: "Zona tensionada: is your town in one?" } },
  { keys: ["itv"], id: "itv", label: { ca: "Quan toca passar l'ITV", es: "Cuándo toca pasar la ITV", en: "When the ITV is due" } },
  { keys: ["ipc", "inflacio", "inflacion", "cpi"], id: "ipc", label: { ca: "IPC avui", es: "IPC hoy", en: "Spain CPI" } },
  { keys: ["salario medio", "salari mitja", "sueldo medio", "sou mitja", "salario mediano", "average salary", "tabla salarial", "taula salarial"], id: "average-salary", label: { ca: "Salari mitjà a Espanya (INE)", es: "Salario medio en España (INE)", en: "Average salary in Spain (INE)" } },
  { keys: ["smi", "salari minim", "salario minimo", "minimum wage"], id: "smi-2027", label: { ca: "Salari mínim 2027", es: "Salario mínimo 2027", en: "Minimum wage 2027" } },
  { keys: ["iprem", "indicador publico de renta", "indicador public de renda"], id: "iprem", label: { ca: `IPREM ${IPREM_YEAR}`, es: `IPREM ${IPREM_YEAR}`, en: `IPREM ${IPREM_YEAR}` } },
  { keys: ["atur", "paro", "prestacio", "prestacion"], id: "unemployment", label: { ca: "Calculadora de l'atur", es: "Calculadora del paro", en: "Unemployment benefit calculator" } },
  { keys: ["jubilacion", "jubilacio", "jubilarme", "jubilar me", "edad de jubilacion", "edat de jubilacio", "retirement", "retire"], id: "retirement-age", label: { ca: "Edat de jubilació: quan et pots jubilar", es: "Edad de jubilación: cuándo te puedes jubilar", en: "Retirement age: when you can retire" } },
  { keys: ["pensions", "pensiones", "pension"], id: "pensions-2027", label: { ca: "Pujada de les pensions 2027", es: "Subida de las pensiones 2027", en: "Pension increase 2027" } },
  { keys: ["lletres del tresor", "letras del tesoro", "treasury bills"], id: "treasury-bills", label: { ca: "Lletres del Tresor", es: "Letras del Tesoro", en: "Treasury bills" } },
  { keys: ["dies habils", "dias habiles", "working days"], id: "working-days", label: { ca: "Calculadora de dies hàbils", es: "Calculadora de días hábiles", en: "Working days calculator" } },
  { keys: ["autonoms", "autonomos", "quota autonoms", "cuota autonomos"], id: "self-employed", label: { ca: "Quota d'autònoms", es: "Cuota de autónomos", en: "Self-employed contributions" } },
  { keys: ["lloguer", "alquiler", "irav"], id: "rent-update", label: { ca: "Actualitzar el lloguer", es: "Actualizar el alquiler", en: "Rent update" } },
];

/** Lower case, accents and punctuation off, single spaces: "Festiu local de Monistrol!" -> "festiu local de monistrol". */
export function normalise(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[·'’`´\-_/.,;:!?¿¡()"«»]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Whole-word containment: "festiu de tona 2027" has "tona"; "tonada" does not. */
function hasPhrase(query: string, phrase: string): boolean {
  return ` ${query} `.includes(` ${phrase} `);
}

/** Words that say "holidays" (or a year) around a town name; what is left must be the name for a short one to match. */
const HOLIDAY_WORDS = new Set(
  "festiu festius festivo festivos festa festes fiesta fiestas local locals locales addicional addicionals adicional adicionales calendari calendario laboral de del d a al en el la les los las i y 2026 2027 2028 holiday holidays public in".split(" "),
);

function rest(query: string): string {
  return query
    .split(" ")
    .filter((w) => !HOLIDAY_WORDS.has(w))
    .join(" ");
}

/** A place name matches when it is in the query as whole words; a one-word name under 6 letters only when the rest is holiday words. */
function placeMatches(query: string, name: string): boolean {
  const n = normalise(name);
  if (!n || !hasPhrase(query, n)) return false;
  if (n.includes(" ") || n.length >= 6) return true;
  return rest(` ${query} `.replace(` ${n} `, " ").trim()) === "";
}

interface Place {
  name: string;
  /** Larger first when several match. */
  weight: number;
  links: Partial<PerLocale<Shortcut>>;
}

let placesCache: Place[] | null = null;

function places(): Place[] {
  if (placesCache) return placesCache;
  const out: Place[] = [];
  for (const m of municipalities()) {
    out.push({
      name: m.name,
      weight: m.population,
      links: {
        ca: { href: municipalityPath("ca", m.slug), label: `Festius locals ${m.name.startsWith("el ") ? `del ${m.name.slice(3)}` : `de ${m.name}`} 2026 i 2027` },
        es: { href: municipalityPath("es", m.slug), label: `Festivos locales de ${m.name.charAt(0).toUpperCase()}${m.name.slice(1)} 2026 y 2027` },
        ...(hasEnglishPage(m.slug) ? { en: { href: municipalityPath("en", m.slug), label: `${m.name} public holidays 2026 and 2027` } } : {}),
      },
    });
  }
  for (const u of unlistedTowns()) {
    out.push({
      name: u.name,
      weight: u.population,
      links: {
        ca: { href: municipalityPath("ca", u.slug), label: `Festius locals de ${u.name} 2027` },
        es: { href: municipalityPath("es", u.slug), label: `Festivos locales de ${u.name} 2027` },
      },
    });
  }
  for (const c of CITIES) {
    const es = cityPath(c);
    const ed = editionsOf(es);
    out.push({
      name: c.name,
      weight: c.population,
      links: {
        es: { href: es, label: `Festivos de ${c.name} 2027` },
        ...(ed ? { ca: { href: ed.ca, label: `Festius de ${c.name} 2027` }, en: { href: ed.en, label: `${c.name} public holidays 2027` } } : {}),
      },
    });
  }
  for (const z of ZONES) {
    out.push({
      name: z.name.ca,
      // After the town of the same name (Girona, Tarragona): the weekend page is the second answer.
      weight: 1,
      links: {
        ca: { href: zonePath("ca", z), label: `Què fer aquest cap de setmana: ${z.name.ca}` },
        es: { href: zonePath("es", z), label: `Qué hacer este fin de semana: ${z.name.es}` },
      },
    });
  }
  placesCache = out;
  return out;
}

/**
 * Up to `limit` direct links for the query, best first: a place named in full
 * (its holiday page, then its weekend page), then the curated topics, then
 * calculators. Empty for an empty query.
 */
export function searchShortcuts(locale: Locale, rawQuery: string, limit = 6): Shortcut[] {
  const query = normalise(rawQuery);
  if (query.length < 2) return [];
  const out: Shortcut[] = [];
  const push = (s: Shortcut | undefined) => {
    if (s && !out.some((o) => o.href === s.href)) out.push(s);
  };

  const matched = places()
    .filter((p) => placeMatches(query, p.name))
    // The longest name first ("Monistrol de Montserrat" before "Montserrat"), then the larger place.
    .sort((a, b) => normalise(b.name).length - normalise(a.name).length || b.weight - a.weight);
  const placeLinks = matched.map((p) => p.links[locale]).filter((s): s is Shortcut => Boolean(s));
  const topicLinks = TOPICS.filter((t) => t.keys.some((k) => hasPhrase(query, k))).flatMap((t) => t.links.map((l) => l[locale]));

  // What the query says besides the place: nothing ("girona"), only holiday words ("festius girona 2027"), or a topic ("metro barcelona").
  const longest = matched[0] ? normalise(matched[0].name) : null;
  const besides = longest ? ` ${query} `.replace(` ${longest} `, " ").trim() : query;
  if (!longest || (besides !== "" && rest(besides) !== "")) {
    // A topic query that may also name a place: the topic answers first.
    topicLinks.forEach(push);
    placeLinks.forEach(push);
  } else if (besides === "") {
    // The place alone: its holiday page, then the topic pages named after it (the day trip), then its other pages.
    push(placeLinks[0]);
    topicLinks.forEach(push);
    placeLinks.forEach(push);
  } else {
    // The place with holiday words: its holiday pages first.
    placeLinks.forEach(push);
    topicLinks.forEach(push);
  }
  for (const c of CALC_KEYS) if (c.keys.some((k) => hasPhrase(query, k))) push({ href: calcPath(c.id, locale), label: c.label[locale] });

  return out.slice(0, limit);
}

/** Every path the shortcuts can print, for the test. */
export function allShortcutHrefs(): string[] {
  const hrefs = new Set<string>();
  for (const t of TOPICS) for (const l of t.links) for (const s of Object.values(l)) hrefs.add(s.href);
  return [...hrefs];
}
