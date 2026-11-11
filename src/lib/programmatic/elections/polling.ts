/**
 * Polling places ("locales electorales") for the general election of 29 Nov
 * 2026, per municipality, from the committed snapshot `polling-places.json`
 * (written by `scripts/elections-polling-places.py` from the four provincial
 * electoral boards' lists in the BOPs).
 *
 * Facts rule: the page prints only what the bulletin states for a town: the
 * polling place's name and address (as the bulletin writes them, upper case
 * included), the sections and tables (mesas) it serves and, for the smaller
 * towns, each mesa's surname range. Nothing is geocoded, completed or
 * inferred. A town without an entry would say its list is pending, never
 * guess; today every one of the 947 has an entry (tested).
 */

import type { Locale } from "@/lib/i18n/config";

import { inCa, placeName } from "./pages";
import RAW from "./polling-places.json" with { type: "json" };
import type { Municipality } from "./types";

export interface PollingTable {
  district: string;
  section: string;
  table: string;
  from: string;
  to: string;
}
export interface PollingPlace {
  name: string;
  address: string;
  postcode?: string;
  tables: PollingTable[];
}
export interface PollingMunicipality {
  name: string;
  source: string;
  sections: number;
  places: PollingPlace[];
}
export interface PollingSource {
  id: string;
  province: string;
  bulletin: string;
  kind: "list" | "municipalities";
  date: string;
  ref: string;
  title: string;
  publisher: string;
  url: string;
  pdf: string;
  sha256: string;
}
export interface PollingSnapshot {
  election: string;
  readAt: string;
  sources: PollingSource[];
  gaps: { code: string; name: string; reason: string }[];
  municipalities: Record<string, PollingMunicipality>;
}

export const POLLING = RAW as unknown as PollingSnapshot;

/** Where a reader finds their own mesa: the official INE consultation (already used by the guides). */
export const INE_MESA_URL = "https://sede.ine.gob.es/ce-mesas/?lang=es_ES";

export const pollingFor = (code: string): PollingMunicipality | null => POLLING.municipalities[code] ?? null;

export const tableCount = (p: PollingMunicipality): number => p.places.reduce((n, place) => n + place.tables.length, 0);

/** More places than this are grouped in collapsible blocks. */
export const OPEN_LIST_MAX = 8;
/** Towns with more mesas than this list sections and mesa counts, not every surname range. */
export const FULL_DETAIL_MAX_TABLES = 120;

export interface PollingPlaceView {
  name: string;
  address: string;
  /** One phrase per section (full detail) or per district (compact). */
  lines: string[];
  tables: number;
}
export interface PollingGroupView {
  /** Null for the plain list of a small town. */
  label: string | null;
  places: PollingPlaceView[];
}
export interface PollingModel {
  title: string;
  intro: string;
  find: string;
  /** Null when this town has no list yet: `pending` then says so. */
  groups: PollingGroupView[] | null;
  pending: string | null;
  /** Explains what each line shows. */
  legend: string | null;
  source: string | null;
  totals: { places: number; sections: number; tables: number } | null;
  /** The facts-block value, "12 locals, 31 meses". */
  fact: string | null;
  faq: { question: string; answer: string };
}

const BULLETIN_PLACE: Record<string, string> = { "08": "Barcelona", "17": "Girona", "25": "Lleida", "43": "Tarragona" };

interface Words {
  title: (place: string) => string;
  places: (n: number) => string;
  sections: (n: number) => string;
  tables: (n: number) => string;
  bulletin: (province: string) => string;
  intro: (place: string, n: number, s: number, t: number, bulletin: string) => string;
  find: string;
  district: (d: string) => string;
  sectionLine: (section: string, tables: string) => string;
  tableLine: (letter: string, from: string, to: string) => string;
  sectionsOf: (district: string, ranges: string, tables: number) => string;
  summary: (label: string, n: number) => string;
  all: (n: number) => string;
  legendFull: string;
  legendCompact: string;
  pending: (place: string, province: string) => string;
  source: (s: PollingSource, date: string, read: string) => string;
  replaces: (date: string) => string;
  faqQuestion: (place: string) => string;
  faqAnswer: (place: string, n: number) => string;
  fact: (n: number, t: number) => string;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const WORDS: Record<Locale, Words> = {
  ca: {
    title: (place) => `On votar el 29N ${inCa(place)}`,
    places: (n) => plural(n, "local electoral", "locals electorals"),
    sections: (n) => plural(n, "secció", "seccions"),
    tables: (n) => plural(n, "mesa", "meses"),
    bulletin: (province) => `BOP de ${province}`,
    intro: (place, n, s, t, bulletin) =>
      `${capital(inCa(place))} hi ha ${plural(n, "local electoral", "locals electorals")} per a les eleccions generals del 29 de novembre de 2026, amb ${plural(s, "secció", "seccions")} i ${plural(t, "mesa", "meses")}, segons la relació oficial que l'Oficina del Cens Electoral de l'INE va publicar al ${bulletin}. La llista indica, per a cada local, les seccions i les meses que hi voten.`,
    find: `El teu local i la teva mesa són els de la teva secció: els trobaràs a la targeta censal i a la [consulta oficial de mesa i local de l'INE](${INE_MESA_URL}). Si no coincideixen amb aquesta llista, fes cas de la targeta i de l'INE: el Cens Electoral pot publicar modificacions després d'aquesta relació.`,
    district: (d) => `Districte ${d}`,
    sectionLine: (section, tables) => `secció ${section}: ${tables}`,
    tableLine: (letter, from, to) => (letter === "U" ? `mesa única (cognoms ${from}-${to})` : `mesa ${letter} (cognoms ${from}-${to})`),
    sectionsOf: (district, ranges, tables) => `districte ${district}, ${ranges.includes(",") || ranges.includes("–") ? "seccions" : "secció"} ${ranges} · ${plural(tables, "mesa", "meses")}`,
    summary: (label, n) => `${label} · ${plural(n, "local", "locals")}`,
    all: (n) => `Veure els ${n} locals electorals`,
    legendFull: "Cada secció amb les seves meses: la lletra de la mesa i, entre parèntesis, els cognoms que hi voten, per ordre alfabètic.",
    legendCompact: "Cada local amb el districte, les seccions que hi voten (intervals) i el nombre de meses. Les lletres de cada mesa són a la targeta censal i a la consulta de l'INE.",
    pending: (place, province) =>
      `La relació oficial de locals electorals de la província de ${province} encara no es pot oferir aquí de manera fiable, i no volem publicar-hi dades que podrien ser errònies. Consulta el local ${inCa(place)} a la targeta censal i a la [consulta oficial de l'INE](${INE_MESA_URL}).`,
    source: (s, date, read) => `Font: [${s.title}](${s.url}), ${s.publisher}, ${s.ref}, data ${date}. Llegida el ${read}. Els noms i les adreces són els que escriu el butlletí.`,
    replaces: (date) => `Aquesta edició substitueix la relació publicada el ${date} al mateix butlletí.`,
    faqQuestion: (place) => `On puc votar el 29N ${inCa(place)}?`,
    faqAnswer: (place, n) =>
      `Al local de la teva secció, que figura a la targeta censal i a la consulta de l'INE. ${capital(inCa(place))} hi ha ${plural(n, "local electoral", "locals electorals")} segons la relació oficial del BOP, que és a aquesta pàgina.`,
    fact: (n, t) => `${plural(n, "local", "locals")}, ${plural(t, "mesa", "meses")} (BOP)`,
  },
  es: {
    title: (place) => `Dónde votar el 29N en ${place}`,
    places: (n) => plural(n, "local electoral", "locales electorales"),
    sections: (n) => plural(n, "sección", "secciones"),
    tables: (n) => plural(n, "mesa", "mesas"),
    bulletin: (province) => `BOP de ${province}`,
    intro: (place, n, s, t, bulletin) =>
      `En ${place} hay ${plural(n, "local electoral", "locales electorales")} para las elecciones generales del 29 de noviembre de 2026, con ${plural(s, "sección", "secciones")} y ${plural(t, "mesa", "mesas")}, según la relación oficial que la Oficina del Censo Electoral del INE publicó en el ${bulletin}. La lista indica, para cada local, las secciones y las mesas que votan en él.`,
    find: `Tu local y tu mesa son los de tu sección: los encontrarás en la tarjeta censal y en la [consulta oficial de mesa y local del INE](${INE_MESA_URL}). Si no coinciden con esta lista, hazle caso a la tarjeta y al INE: el Censo Electoral puede publicar modificaciones después de esta relación.`,
    district: (d) => `Distrito ${d}`,
    sectionLine: (section, tables) => `sección ${section}: ${tables}`,
    tableLine: (letter, from, to) => (letter === "U" ? `mesa única (apellidos ${from}-${to})` : `mesa ${letter} (apellidos ${from}-${to})`),
    sectionsOf: (district, ranges, tables) => `distrito ${district}, ${ranges.includes(",") || ranges.includes("–") ? "secciones" : "sección"} ${ranges} · ${plural(tables, "mesa", "mesas")}`,
    summary: (label, n) => `${label} · ${plural(n, "local", "locales")}`,
    all: (n) => `Ver los ${n} locales electorales`,
    legendFull: "Cada sección con sus mesas: la letra de la mesa y, entre paréntesis, los apellidos que votan en ella, por orden alfabético.",
    legendCompact: "Cada local con el distrito, las secciones que votan en él (intervalos) y el número de mesas. Las letras de cada mesa están en la tarjeta censal y en la consulta del INE.",
    pending: (place, province) =>
      `La relación oficial de locales electorales de la provincia de ${province} todavía no se puede ofrecer aquí de forma fiable, y no queremos publicar datos que podrían ser erróneos. Consulta el local de ${place} en la tarjeta censal y en la [consulta oficial del INE](${INE_MESA_URL}).`,
    source: (s, date, read) => `Fuente: [${s.title}](${s.url}), ${s.publisher}, ${s.ref}, fecha ${date}. Leída el ${read}. Los nombres y las direcciones son los que escribe el boletín.`,
    replaces: (date) => `Esta edición sustituye a la relación publicada el ${date} en el mismo boletín.`,
    faqQuestion: (place) => `¿Dónde puedo votar el 29N en ${place}?`,
    faqAnswer: (place, n) =>
      `En el local de tu sección, que figura en la tarjeta censal y en la consulta del INE. En ${place} hay ${plural(n, "local electoral", "locales electorales")} según la relación oficial del BOP, que está en esta página.`,
    fact: (n, t) => `${plural(n, "local", "locales")}, ${plural(t, "mesa", "mesas")} (BOP)`,
  },
  en: {
    title: (place) => `Where to vote on 29 November in ${place}`,
    places: (n) => plural(n, "polling place", "polling places"),
    sections: (n) => plural(n, "section", "sections"),
    tables: (n) => plural(n, "table", "tables"),
    bulletin: (province) => `${province} provincial gazette (BOP)`,
    intro: (place, n, s, t, bulletin) =>
      `${place} has ${plural(n, "polling place", "polling places")} for the general election of 29 November 2026, with ${plural(s, "electoral section", "electoral sections")} and ${plural(t, "voting table (mesa)", "voting tables (mesas)")}, according to the official list the Spanish Statistics Institute's electoral census office published in the ${bulletin}. For each place the list shows the sections and tables that vote there.`,
    find: `Your polling place and table are those of your section: they are on your census card (tarjeta censal) and in the [INE's official polling place and table lookup](${INE_MESA_URL}) (in Spanish). If they differ from this list, go by the card and the INE: the census office can publish changes after this list.`,
    district: (d) => `District ${d}`,
    sectionLine: (section, tables) => `section ${section}: ${tables}`,
    tableLine: (letter, from, to) => (letter === "U" ? `single table (surnames ${from}-${to})` : `table ${letter} (surnames ${from}-${to})`),
    sectionsOf: (district, ranges, tables) => `district ${district}, ${ranges.includes(",") || ranges.includes("–") ? "sections" : "section"} ${ranges} · ${plural(tables, "table", "tables")}`,
    summary: (label, n) => `${label} · ${plural(n, "place", "places")}`,
    all: (n) => `Show all ${n} polling places`,
    legendFull: "Each section with its tables: the table's letter and, in brackets, the surnames that vote at it, in alphabetical order.",
    legendCompact: "Each place with its district, the sections that vote there (ranges) and the number of tables. Each table's letter is on the census card and in the INE lookup.",
    pending: (place, province) =>
      `The official list of polling places for the province of ${province} cannot be offered here reliably yet, and we do not want to publish data that could be wrong. Look up the place in ${place} on your census card and in the [INE's official lookup](${INE_MESA_URL}).`,
    source: (s, date, read) => `Source: [${s.title}](${s.url}), ${s.publisher}, ${s.ref}, dated ${date}. Read on ${read}. Names and addresses are as the gazette writes them.`,
    replaces: (date) => `This edition replaces the list published on ${date} in the same gazette.`,
    faqQuestion: (place) => `Where can I vote on 29 November in ${place}?`,
    faqAnswer: (place, n) =>
      `At the polling place for your section, shown on your census card and in the INE lookup. ${place} has ${plural(n, "polling place", "polling places")} in the official provincial list, which is on this page.`,
    fact: (n, t) => `${plural(n, "polling place", "polling places")}, ${plural(t, "table", "tables")} (BOP)`,
  },
};

/** "001–004, 007": contiguous runs of three-digit section numbers collapse into ranges. */
export function sectionRanges(sections: string[]): string {
  const sorted = [...new Set(sections)].sort();
  const runs: string[] = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && Number(sorted[j + 1]) === Number(sorted[j]) + 1) j++;
    runs.push(j > i ? `${sorted[i]}–${sorted[j]}` : sorted[i]!);
    i = j + 1;
  }
  return runs.join(", ");
}

const byDistrict = (tables: PollingTable[]): Map<string, PollingTable[]> => {
  const out = new Map<string, PollingTable[]>();
  for (const t of [...tables].sort((a, b) => a.district.localeCompare(b.district) || a.section.localeCompare(b.section) || a.table.localeCompare(b.table))) {
    out.set(t.district, [...(out.get(t.district) ?? []), t]);
  }
  return out;
};

/** Lleida lists the postcode in its own column: added when the address lacks it. */
const addressOf = (p: PollingPlace) => (p.postcode && !p.address.includes(p.postcode) ? `${p.address}, ${p.postcode}` : p.address);

function placeView(place: PollingPlace, words: Words, full: boolean, multiDistrict: boolean): PollingPlaceView {
  const lines: string[] = [];
  for (const [district, tables] of byDistrict(place.tables)) {
    if (full) {
      const bySection = new Map<string, PollingTable[]>();
      for (const t of tables) bySection.set(t.section, [...(bySection.get(t.section) ?? []), t]);
      for (const [section, list] of bySection) {
        const label = multiDistrict || district !== "01" ? `${district}-${section}` : section;
        lines.push(capital(words.sectionLine(label, list.map((t) => words.tableLine(t.table, t.from, t.to)).join(", "))));
      }
    } else {
      lines.push(capital(words.sectionsOf(district, sectionRanges(tables.map((t) => t.section)), tables.length)));
    }
  }
  return { name: place.name, address: addressOf(place), lines, tables: place.tables.length };
}

/** Ordered by the first section each place serves: the order of the bulletin. */
const firstSection = (p: PollingPlace) => [...p.tables].map((t) => `${t.district}${t.section}${t.table}`).sort()[0]!;

export function buildPolling(m: Municipality, locale: Locale, date: (iso: string) => string): PollingModel {
  const words = WORDS[locale];
  const place = placeName(m, locale);
  const entry = pollingFor(m.code);
  const title = words.title(place);
  if (!entry) {
    return {
      title,
      intro: "",
      find: words.find,
      groups: null,
      pending: words.pending(place, m.province),
      legend: null,
      source: null,
      totals: null,
      fact: null,
      faq: { question: words.faqQuestion(place), answer: words.faqAnswer(place, 0) },
    };
  }
  const source = POLLING.sources.find((s) => s.id === entry.source);
  if (!source) throw new Error(`polling source ${entry.source} of ${m.code} is not listed`);
  const earlier = POLLING.sources
    .filter((s) => s.province === source.province && s.date < source.date)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const tables = tableCount(entry);
  const places = [...entry.places].sort((a, b) => firstSection(a).localeCompare(firstSection(b)));
  const districts = new Set(places.flatMap((p) => p.tables.map((t) => t.district)));
  const full = tables <= FULL_DETAIL_MAX_TABLES;
  const views = places.map((p) => placeView(p, words, full, districts.size > 1));

  let groups: PollingGroupView[];
  if (places.length <= OPEN_LIST_MAX) {
    groups = [{ label: null, places: views }];
  } else if (districts.size > 1) {
    groups = [...districts].sort().map((d) => {
      const inDistrict = places.map((p, i) => ({ p, v: views[i]! })).filter(({ p }) => p.tables.some((t) => t.district === d));
      return { label: words.summary(words.district(d), inDistrict.length), places: inDistrict.map(({ v }) => v) };
    });
  } else {
    groups = [{ label: words.all(places.length), places: views }];
  }

  const bulletin = words.bulletin(BULLETIN_PLACE[source.province] ?? "");
  const sourceLine = words.source(source, date(source.date), date(POLLING.readAt)) + (earlier ? ` ${words.replaces(date(earlier.date))}` : "");
  return {
    title,
    intro: words.intro(place, places.length, entry.sections, tables, bulletin),
    find: words.find,
    groups,
    pending: null,
    legend: full ? words.legendFull : words.legendCompact,
    source: sourceLine,
    totals: { places: places.length, sections: entry.sections, tables },
    fact: words.fact(places.length, tables),
    faq: { question: words.faqQuestion(place), answer: words.faqAnswer(place, places.length) },
  };
}
