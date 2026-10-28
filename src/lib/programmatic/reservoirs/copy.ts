/**
 * Words of the reservoir pages: titles, descriptions and the guidance blocks.
 * Every number comes from the snapshot (`data.ts`) or from the verified
 * official facts (`official.ts`); nothing here reads a clock.
 */

import { B2_PATHS } from "@/lib/content/batch02/shared";
import { PATHS as TOOL_PATHS } from "@/lib/content/home-tools";
import type { Locale } from "@/lib/i18n/config";

import { SNAPSHOT, reservoirBySlug } from "./data";
import { formatDate, formatNumber } from "./live";
import { OFFICIAL, OFFICIAL_VERIFIED, SOURCES, indicatorsOf, officialUrl, type Indicator, type Stage } from "./official";
import { reservoirHubPath, reservoirPath } from "./paths";
import type { ReservoirSlug, SnapshotReservoir } from "./types";

export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

/** The year in the titles: the snapshot's latest reading. */
export const titleYear = (): string => SNAPSHOT.latestDate.slice(0, 4);

const num = (n: number, l: Locale, d = 1) => formatNumber(n, l, d);
const date = (iso: string, l: Locale) => formatDate(iso, l);

/* -------------------------------------------------------------------------- */
/* Names                                                                      */
/* -------------------------------------------------------------------------- */

/** "de Sau", "de la Baells", "del Foix": Catalan and Spanish write the same here. */
export function deName(r: { name: string; slug: ReservoirSlug }): string {
  if (r.slug === "foix") return "del Foix";
  return `de ${r.name}`;
}

/** "Sau reservoir", "La Baells reservoir". */
export function enName(r: { name: string }): string {
  return `${r.name.charAt(0).toUpperCase()}${r.name.slice(1)} reservoir`;
}

/** "l'embassament de Sau", "el embalse de Sau", "Sau reservoir" (inside a sentence). */
export function inSentence(r: SnapshotReservoir, l: Locale): string {
  if (l === "ca") return `l'embassament ${deName(r)}`;
  if (l === "es") return `el embalse ${deName(r)}`;
  return enName(r);
}

/** "al Ter", "a la Muga", "a la riera de Riudecanyes"; "en el Ter"; "on the Ter". */
export function riverIn(slug: ReservoirSlug, l: Locale): string {
  const river = OFFICIAL[slug].river[l];
  if (l === "en") return slug === "riudecanyes" ? `on the ${river}` : `on the ${river} river`;
  if (slug === "riudecanyes") return l === "ca" ? `a la ${river}` : `en la ${river}`;
  if (l === "ca") return slug === "darnius-boadella" ? `a la ${river}` : `al ${river}`;
  return `en el ${river}`;
}

const upper = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

/** Display name for lists and links: "Sau", "la Baells", "Foix". */
export const listName = (r: { name: string }) => r.name;

/* -------------------------------------------------------------------------- */
/* Titles, descriptions, H1                                                   */
/* -------------------------------------------------------------------------- */

const pick = (options: string[], limit: number) => options.find((t) => t.length <= limit) ?? options[options.length - 1]!;

export function reservoirTitle(r: SnapshotReservoir, l: Locale): string {
  const y = titleYear();
  const options =
    l === "ca"
      ? [`Embassament ${deName(r)} avui: nivell i % d'aigua (${y})`, `Embassament ${deName(r)} avui: nivell (${y})`, `Pantà ${deName(r)}: nivell avui (${y})`]
      : l === "es"
        ? [`Embalse ${deName(r)} hoy: nivel y % de agua (${y})`, `Embalse ${deName(r)} hoy: nivel (${y})`, `Pantano ${deName(r)}: nivel hoy (${y})`]
        : [`${enName(r)} today: water level and % full (${y})`, `${enName(r)} today: water level (${y})`, `${enName(r)}: level today (${y})`];
  return pick(options, TITLE_LIMIT);
}

export function reservoirDescription(r: SnapshotReservoir, l: Locale): string {
  const o = OFFICIAL[r.slug];
  const cap = num(o.capacity, l, 2);
  const river = o.river[l];
  const options =
    l === "ca"
      ? [
          `Nivell del pantà ${deName(r)} avui amb la dada diària de l'ACA: % d'aigua, hm³ i cota. Riu ${river}, ${cap} hm³ de capacitat i evolució de l'últim any.`,
          `Nivell del pantà ${deName(r)} avui amb la dada diària de l'ACA: % d'aigua i hm³. ${cap} hm³ de capacitat i evolució de l'últim any.`,
          `Nivell del pantà ${deName(r)} avui amb la dada diària de l'ACA, capacitat i evolució de l'últim any.`,
        ]
      : l === "es"
        ? [
            `Nivel del pantano ${deName(r)} hoy con el dato diario de la ACA: % de agua, hm³ y cota. Río ${river}, ${cap} hm³ de capacidad y evolución del último año.`,
            `Nivel del pantano ${deName(r)} hoy con el dato diario de la ACA: % de agua y hm³. ${cap} hm³ de capacidad y evolución del último año.`,
            `Nivel del pantano ${deName(r)} hoy con el dato diario de la ACA, capacidad y evolución del último año.`,
          ]
        : [
            `${enName(r)} level today from the Catalan Water Agency's daily data: % full, hm³ and water level. ${cap} hm³ capacity, river ${river}, the past year.`,
            `${enName(r)} level today from the Catalan Water Agency's daily data: % full and hm³, ${cap} hm³ capacity and the past year.`,
            `${enName(r)} level today from the Catalan Water Agency's daily data, its capacity and the past year.`,
          ];
  return pick(options, DESCRIPTION_LIMIT);
}

export function reservoirH1(r: SnapshotReservoir, l: Locale): string {
  if (l === "ca") return `Embassament ${deName(r)} (pantà ${deName(r)}): nivell avui`;
  if (l === "es") return `Embalse ${deName(r)} (pantano ${deName(r)}): nivel hoy`;
  return `${enName(r)}: water level today`;
}

export function reservoirLead(r: SnapshotReservoir, l: Locale): string {
  if (l === "ca") {
    return `Quanta aigua té avui ${inSentence(r, l)}, ${riverIn(r.slug, l)}: la dada diària de l'Agència Catalana de l'Aigua (ACA), amb la data de cada lectura, i què ha fet el nivell durant l'últim any.`;
  }
  if (l === "es") {
    return `Cuánta agua tiene hoy ${inSentence(r, l)}, ${riverIn(r.slug, l)}: el dato diario de la Agència Catalana de l'Aigua (ACA), con la fecha de cada lectura, y qué ha hecho el nivel durante el último año.`;
  }
  return `How much water ${inSentence(r, l)} ${riverIn(r.slug, l)} holds today: the Catalan Water Agency's (ACA) daily figure, with the date of each reading, and what the level did over the past year.`;
}

/* -------------------------------------------------------------------------- */
/* Section titles and fixed words                                             */
/* -------------------------------------------------------------------------- */

export interface PageWords {
  kicker: string;
  readLine: string;
  today: string;
  facts: string;
  year: string;
  uses: string;
  drought: string;
  read: string;
  faq: string;
  siblings: string;
  system: string;
  network: string;
  others: string;
  hub: string;
  related: string;
  sources: string;
  sourcesNote: string;
  monthCols: [string, string, string];
  thresholdCols: [string, string];
  officialDam: string;
}

export function words(l: Locale): PageWords {
  const read = date(SNAPSHOT.readOn, l);
  if (l === "ca") {
    return {
      kicker: "Embassaments de Catalunya",
      readLine: `Dades de l'ACA llegides el ${read}; la lectura del dia es carrega al navegador`,
      today: "Nivell avui",
      facts: "Fitxa de l'embassament",
      year: "L'últim any",
      uses: "Per a què serveix",
      drought: "Què hi té a veure la sequera",
      read: "Com es llegeixen aquestes dades",
      faq: "Preguntes freqüents",
      siblings: "Altres embassaments",
      system: "Del mateix sistema",
      network: "La resta del Ter-Llobregat",
      others: "La resta d'embassaments de l'ACA",
      hub: "Tots els embassaments, un per un",
      related: "També et pot interessar",
      sources: "Fonts",
      sourcesNote: `Fonts oficials, consultades el ${date(OFFICIAL_VERIFIED, l)}.`,
      monthCols: ["Lectura", "Ple", "Volum (hm³)"],
      thresholdCols: ["Estat", "Llindar (hm³)"],
      officialDam: "Fitxa de l'embassament al web de l'ACA",
    };
  }
  if (l === "es") {
    return {
      kicker: "Embalses de Cataluña",
      readLine: `Datos de la ACA leídos el ${read}; la lectura del día se carga en el navegador`,
      today: "Nivel hoy",
      facts: "Ficha del embalse",
      year: "El último año",
      uses: "Para qué sirve",
      drought: "Qué tiene que ver con la sequía",
      read: "Cómo se leen estos datos",
      faq: "Preguntas frecuentes",
      siblings: "Otros embalses",
      system: "Del mismo sistema",
      network: "El resto del Ter-Llobregat",
      others: "El resto de embalses de la ACA",
      hub: "Todos los embalses, uno a uno",
      related: "También te puede interesar",
      sources: "Fuentes",
      sourcesNote: `Fuentes oficiales, consultadas el ${date(OFFICIAL_VERIFIED, l)}.`,
      monthCols: ["Lectura", "Lleno", "Volumen (hm³)"],
      thresholdCols: ["Estado", "Umbral (hm³)"],
      officialDam: "Ficha del embalse en la web de la ACA",
    };
  }
  return {
    kicker: "Catalonia's reservoirs",
    readLine: `ACA data read on ${read}; today's reading loads in your browser`,
    today: "Level today",
    facts: "Reservoir facts",
    year: "The past year",
    uses: "What it is for",
    drought: "How it relates to drought",
    read: "How to read these figures",
    faq: "Questions",
    siblings: "Other reservoirs",
    system: "Same system",
    network: "The rest of Ter-Llobregat",
    others: "The ACA's other reservoirs",
    hub: "Every reservoir, one by one",
    related: "See also",
    sources: "Sources",
    sourcesNote: `Official sources, checked on ${date(OFFICIAL_VERIFIED, l)}.`,
    monthCols: ["Reading", "Full", "Volume (hm³)"],
    thresholdCols: ["Stage", "Threshold (hm³)"],
    officialDam: "The reservoir on the ACA website (Spanish)",
  };
}

/* -------------------------------------------------------------------------- */
/* Fact sheet                                                                 */
/* -------------------------------------------------------------------------- */

export interface Fact {
  label: string;
  value: string;
}

const MANAGER: Record<Locale, Record<"aca" | "endesa" | "riudecanyes", string>> = {
  ca: { aca: "Agència Catalana de l'Aigua", endesa: "Endesa, propietària de la presa", riudecanyes: "Comunitat de Regants de Riudecanyes, propietària de la presa" },
  es: { aca: "Agència Catalana de l'Aigua", endesa: "Endesa, propietaria de la presa", riudecanyes: "Comunitat de Regants de Riudecanyes, propietaria de la presa" },
  en: { aca: "Catalan Water Agency (ACA)", endesa: "Endesa, owner of the dam", riudecanyes: "Comunitat de Regants de Riudecanyes (irrigators' association), owner of the dam" },
};

export function facts(r: SnapshotReservoir, l: Locale): Fact[] {
  const o = OFFICIAL[r.slug];
  const out: Fact[] = [];
  const L = {
    ca: { river: "Riu", places: "Municipis", station: "Estació de l'ACA", comarca: "Comarca", capacity: "Capacitat", manager: "Gestió", year: "Inaugurada", height: "Alçada de la presa", basin: "Conca (ACA)" },
    es: { river: "Río", places: "Municipios", station: "Estación de la ACA", comarca: "Comarca", capacity: "Capacidad", manager: "Gestión", year: "Inaugurada", height: "Altura de la presa", basin: "Cuenca (ACA)" },
    en: { river: "River", places: "Municipalities", station: "ACA station", comarca: "Comarca (county)", capacity: "Capacity", manager: "Run by", year: "Opened", height: "Dam height", basin: "Basin (ACA)" },
  }[l];
  out.push({ label: L.river, value: o.river[l] });
  if (o.municipalities) out.push({ label: L.places, value: o.municipalities.join(", ") });
  else out.push({ label: L.station, value: r.station });
  if (o.comarca) out.push({ label: L.comarca, value: o.comarca });
  const asOf = l === "en" ? `ACA, ${date(SOURCES.bulletin.dated.split("/").reverse().join("-"), l)}` : `ACA, ${SOURCES.bulletin.dated}`;
  out.push({ label: L.capacity, value: `${num(o.capacity, l, 2)} hm³ (${asOf})` });
  out.push({ label: L.manager, value: MANAGER[l][o.manager] });
  if (o.inaugurated) out.push({ label: L.year, value: String(o.inaugurated) });
  if (o.height) out.push({ label: L.height, value: `${num(o.height, l, Number.isInteger(o.height) ? 0 : 2)} m${l === "en" ? " from the foundation" : l === "es" ? " desde la cimentación" : " des de la fonamentació"}` });
  if (r.basin) out.push({ label: L.basin, value: r.subbasin && r.subbasin !== r.basin ? `${r.basin} · ${r.subbasin}` : r.basin });
  return out;
}

/* -------------------------------------------------------------------------- */
/* The past year (snapshot)                                                   */
/* -------------------------------------------------------------------------- */

export function trendParagraphs(r: SnapshotReservoir, l: Locale): string[] {
  const t = r.trend;
  const name = inSentence(r, l);
  const out: string[] = [];
  if (t.yearAgo) {
    const diff = t.latest.percent - t.yearAgo.percent;
    const pp = num(Math.abs(diff), l);
    if (l === "ca") {
      const dir = Math.abs(diff) < 0.05 ? "el mateix percentatge" : diff > 0 ? `**${pp} punts més**` : `**${pp} punts menys**`;
      out.push(`Fa un any, el ${date(t.yearAgo.date, l)}, ${name} era al **${num(t.yearAgo.percent, l)} %** (${num(t.yearAgo.volume, l, 2)} hm³). En la lectura més recent d'aquesta pàgina, la del ${date(t.latest.date, l)}, és al **${num(t.latest.percent, l)} %** (${num(t.latest.volume, l, 2)} hm³): ${dir}.`);
    } else if (l === "es") {
      const dir = Math.abs(diff) < 0.05 ? "el mismo porcentaje" : diff > 0 ? `**${pp} puntos más**` : `**${pp} puntos menos**`;
      out.push(`Hace un año, el ${date(t.yearAgo.date, l)}, ${name} estaba al **${num(t.yearAgo.percent, l)} %** (${num(t.yearAgo.volume, l, 2)} hm³). En la lectura más reciente de esta página, la del ${date(t.latest.date, l)}, está al **${num(t.latest.percent, l)} %** (${num(t.latest.volume, l, 2)} hm³): ${dir}.`);
    } else {
      const dir = Math.abs(diff) < 0.05 ? "the same share" : diff > 0 ? `**${pp} points more**` : `**${pp} points less**`;
      out.push(`A year earlier, on ${date(t.yearAgo.date, l)}, ${name} was **${num(t.yearAgo.percent, l)}%** full (${num(t.yearAgo.volume, l, 2)} hm³). In this page's latest reading, of ${date(t.latest.date, l)}, it is **${num(t.latest.percent, l)}%** full (${num(t.latest.volume, l, 2)} hm³): ${dir}.`);
    }
  }
  if (l === "ca") {
    out.push(`En els 365 dies fins al ${date(t.latest.date, l)}, el nivell més baix va ser del **${num(t.min.percent, l)} %**, el ${date(t.min.date, l)}, i el més alt, del **${num(t.max.percent, l)} %**, el ${date(t.max.date, l)}.`);
  } else if (l === "es") {
    out.push(`En los 365 días hasta el ${date(t.latest.date, l)}, el nivel más bajo fue del **${num(t.min.percent, l)} %**, el ${date(t.min.date, l)}, y el más alto, del **${num(t.max.percent, l)} %**, el ${date(t.max.date, l)}.`);
  } else {
    out.push(`In the 365 days to ${date(t.latest.date, l)}, the lowest level was **${num(t.min.percent, l)}%**, on ${date(t.min.date, l)}, and the highest **${num(t.max.percent, l)}%**, on ${date(t.max.date, l)}.`);
  }
  if (t.max.percent > 100) {
    out.push(
      l === "ca"
        ? "L'ACA va publicar lectures per sobre del 100 %: l'embassament contenia més aigua que la seva capacitat nominal. Les mostrem tal com les publica."
        : l === "es"
          ? "La ACA publicó lecturas por encima del 100 %: el embalse contenía más agua que su capacidad nominal. Las mostramos tal como las publica."
          : "The ACA published readings above 100%: the reservoir held more water than its nominal capacity. We show them as published.",
    );
  }
  const day = Number(t.latest.date.slice(8, 10));
  out.push(
    l === "ca"
      ? `La taula dona una lectura per mes, la del dia ${day} (o la del dia vàlid més proper abans). És el que ha passat, no una previsió.`
      : l === "es"
        ? `La tabla da una lectura por mes, la del día ${day} (o la del día válido más cercano anterior). Es lo que ha pasado, no una previsión.`
        : `The table gives one reading a month, on day ${day} (or the closest valid day before it). It is what happened, not a forecast.`,
  );
  return out;
}

/* -------------------------------------------------------------------------- */
/* Uses                                                                       */
/* -------------------------------------------------------------------------- */

export function usesParagraph(r: SnapshotReservoir, l: Locale): string {
  return OFFICIAL[r.slug].uses[l];
}

/* -------------------------------------------------------------------------- */
/* Drought (PES)                                                              */
/* -------------------------------------------------------------------------- */

const STAGE: Record<Locale, Record<Stage, string>> = {
  ca: { prealerta: "Prealerta", alerta: "Alerta", excepcionalitat: "Excepcionalitat", emergencia1: "Emergència I", emergencia2: "Emergència II", emergencia3: "Emergència III", emergencia: "Emergència" },
  es: { prealerta: "Prealerta", alerta: "Alerta", excepcionalitat: "Excepcionalidad", emergencia1: "Emergencia I", emergencia2: "Emergencia II", emergencia3: "Emergencia III", emergencia: "Emergencia" },
  en: { prealerta: "Pre-alert", alerta: "Alert", excepcionalitat: "Exceptional", emergencia1: "Emergency I", emergencia2: "Emergency II", emergencia3: "Emergency III", emergencia: "Emergency" },
};

/** October first, as the PES tables run. */
const MONTHS: Record<Locale, string[]> = {
  ca: ["oct.", "nov.", "des.", "gen.", "febr.", "març", "abr.", "maig", "juny", "jul.", "ag.", "set."],
  es: ["oct.", "nov.", "dic.", "ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept."],
  en: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
};

/** "367" when flat; "210 (oct.–gen.), 240 (febr.), 270 (març–jul.), 240 (ag.), 210 (set.)" when it varies. */
export function thresholdText(values: number[], l: Locale): string {
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : num(v, l));
  if (values.every((v) => v === values[0])) return fmt(values[0]!);
  const runs: { from: number; to: number; value: number }[] = [];
  values.forEach((value, i) => {
    const last = runs.at(-1);
    if (last && last.value === value) last.to = i;
    else runs.push({ from: i, to: i, value });
  });
  return runs.map((run) => `${fmt(run.value)} (${MONTHS[l][run.from]}${run.to > run.from ? `–${MONTHS[l][run.to]}` : ""})`).join(", ");
}

export interface ThresholdTable {
  key: Indicator["key"];
  caption: string;
  rows: { stage: string; value: string }[];
}

const INDICATOR_CAPTION: Record<Locale, Record<Indicator["key"], string>> = {
  ca: {
    terLlobregat: "Reserves conjuntes del Ter-Llobregat (Sau, Susqueda, la Llosa del Cavall, Sant Ponç i la Baells)",
    ter: "Reserves del Ter (Sau i Susqueda)",
    llobregat: "Reserves del Llobregat (la Llosa del Cavall, Sant Ponç i la Baells)",
    darnius: "Reserves de Darnius Boadella",
    siuranaRiudecanyes: "Suma de reserves de Siurana i Riudecanyes",
  },
  es: {
    terLlobregat: "Reservas conjuntas del Ter-Llobregat (Sau, Susqueda, la Llosa del Cavall, Sant Ponç y la Baells)",
    ter: "Reservas del Ter (Sau y Susqueda)",
    llobregat: "Reservas del Llobregat (la Llosa del Cavall, Sant Ponç y la Baells)",
    darnius: "Reservas de Darnius Boadella",
    siuranaRiudecanyes: "Suma de reservas de Siurana y Riudecanyes",
  },
  en: {
    terLlobregat: "Combined Ter-Llobregat reserves (Sau, Susqueda, la Llosa del Cavall, Sant Ponç and la Baells)",
    ter: "Ter reserves (Sau and Susqueda)",
    llobregat: "Llobregat reserves (la Llosa del Cavall, Sant Ponç and la Baells)",
    darnius: "Darnius Boadella reserves",
    siuranaRiudecanyes: "Siurana and Riudecanyes reserves combined",
  },
};

export function thresholdTables(slug: ReservoirSlug, l: Locale): ThresholdTable[] {
  return indicatorsOf(slug).map((ind) => ({
    key: ind.key,
    caption: INDICATOR_CAPTION[l][ind.key],
    rows: ind.rows.map((row) => ({ stage: STAGE[l][row.stage], value: thresholdText(row.values, l) })),
  }));
}

const DECLARATIONS_LINK: Record<Locale, string> = {
  ca: `[les declaracions de sequera de l'ACA](${officialUrl.declarations})`,
  es: `[las declaraciones de sequía de la ACA](${officialUrl.declarations}) (en catalán)`,
  en: `[the ACA's drought declarations](${officialUrl.declarations}) (in Catalan)`,
};

export function droughtParagraphs(r: SnapshotReservoir, l: Locale): { before: string[]; after: string[] } {
  const unit = OFFICIAL[r.slug].unit;
  const before: string[] = [];
  if (l === "ca") {
    if (unit === "terLlobregat") {
      before.push(
        `Les restriccions per sequera no depenen d'un sol embassament. El Pla especial de sequera de l'ACA decideix l'estat de la unitat Ter-Llobregat amb tres indicadors: les reserves conjuntes de Sau, Susqueda, la Llosa del Cavall, Sant Ponç i la Baells; les del Ter (Sau i Susqueda), i les del Llobregat (la Llosa del Cavall, Sant Ponç i la Baells). L'estat de la unitat és el pitjor dels tres, i l'indicador principal és el conjunt.`,
      );
    } else if (unit === "darnius") {
      before.push("Darnius Boadella té la seva pròpia unitat al Pla especial de sequera de l'ACA: l'estat de sequera de la unitat Embassament de Darnius-Boadella depèn del volum d'aquest embassament.");
    } else if (unit === "riudecanyes") {
      before.push(
        "La unitat Riudecanyes del Pla especial de sequera de l'ACA fa servir la suma de les reserves de Siurana i Riudecanyes. Només té dos llindars, i el Pla contempla l'emergència com a únic estat de sequera d'aquesta unitat, perquè el reg ja hi està restringit de manera permanent.",
      );
    } else {
      before.push(
        "El Pla especial de sequera de l'ACA fixa llindars d'embassament per a les unitats de Darnius-Boadella, Ter-Llobregat (amb el Ter i el Llobregat per separat) i Riudecanyes. El Foix no és cap dels embassaments d'aquests indicadors.",
      );
    }
    if (unit) before.push("Els llindars són volums en hm³; alguns canvien segons el mes i s'apliquen des del dia 1 de cada mes. La prealerta encara és normalitat: el Pla només preveu restriccions a partir de l'alerta.");
  } else if (l === "es") {
    if (unit === "terLlobregat") {
      before.push(
        "Las restricciones por sequía no dependen de un solo embalse. El Plan especial de sequía de la ACA decide el estado de la unidad Ter-Llobregat con tres indicadores: las reservas conjuntas de Sau, Susqueda, la Llosa del Cavall, Sant Ponç y la Baells; las del Ter (Sau y Susqueda), y las del Llobregat (la Llosa del Cavall, Sant Ponç y la Baells). El estado de la unidad es el peor de los tres, y el indicador principal es el conjunto.",
      );
    } else if (unit === "darnius") {
      before.push("Darnius Boadella tiene su propia unidad en el Plan especial de sequía de la ACA: el estado de sequía de la unidad Embalse de Darnius-Boadella depende del volumen de este embalse.");
    } else if (unit === "riudecanyes") {
      before.push(
        "La unidad Riudecanyes del Plan especial de sequía de la ACA usa la suma de las reservas de Siurana y Riudecanyes. Solo tiene dos umbrales, y el Plan contempla la emergencia como único estado de sequía de esta unidad, porque el riego ya está restringido de forma permanente.",
      );
    } else {
      before.push(
        "El Plan especial de sequía de la ACA fija umbrales de embalse para las unidades de Darnius-Boadella, Ter-Llobregat (con el Ter y el Llobregat por separado) y Riudecanyes. El Foix no es ninguno de los embalses de esos indicadores.",
      );
    }
    if (unit) before.push("Los umbrales son volúmenes en hm³; algunos cambian según el mes y se aplican desde el día 1 de cada mes. La prealerta todavía es normalidad: el Plan solo prevé restricciones a partir de la alerta.");
  } else {
    if (unit === "terLlobregat") {
      before.push(
        "Drought restrictions do not depend on any single reservoir. The ACA's drought plan sets the stage of the Ter-Llobregat unit from three indicators: the combined reserves of Sau, Susqueda, la Llosa del Cavall, Sant Ponç and la Baells; those of the Ter (Sau and Susqueda); and those of the Llobregat (la Llosa del Cavall, Sant Ponç and la Baells). The unit takes the worst of the three, and the combined one is the main indicator.",
      );
    } else if (unit === "darnius") {
      before.push("Darnius Boadella has its own unit in the ACA's drought plan: the drought stage of the Darnius-Boadella unit depends on this reservoir's volume.");
    } else if (unit === "riudecanyes") {
      before.push(
        "The Riudecanyes unit of the ACA's drought plan uses the combined reserves of Siurana and Riudecanyes. It has only two thresholds, and the plan treats emergency as the unit's only drought stage, because irrigation there is already permanently restricted.",
      );
    } else {
      before.push(
        "The ACA's drought plan sets reservoir thresholds for the Darnius-Boadella, Ter-Llobregat (with the Ter and the Llobregat separately) and Riudecanyes units. Foix is not one of the reservoirs in those indicators.",
      );
    }
    if (unit) before.push("The thresholds are volumes in hm³; some change with the month and apply from the 1st of each month. Pre-alert is still normal: the plan only provides for restrictions from the alert stage on.");
  }
  const after =
    l === "ca"
      ? [`Que les reserves passin per sota d'un llindar no declara res per si sol: cada estat el declara l'ACA per resolució. Per saber l'estat d'avui de cada zona, consulta ${DECLARATIONS_LINK.ca}.`]
      : l === "es"
        ? [`Que las reservas bajen de un umbral no declara nada por sí solo: cada estado lo declara la ACA por resolución. Para saber el estado de hoy de cada zona, consulta ${DECLARATIONS_LINK.es}.`]
        : [`Reserves falling below a threshold declare nothing by themselves: each stage is declared by an ACA resolution. For today's stage in each area, see ${DECLARATIONS_LINK.en}.`];
  return { before, after };
}

/* -------------------------------------------------------------------------- */
/* How to read                                                                */
/* -------------------------------------------------------------------------- */

export function readParagraphs(l: Locale): string[] {
  const dataset = SNAPSHOT.sources.daily;
  if (l === "ca") {
    return [
      "El **percentatge** és el volum d'aigua embassada dividit per la capacitat de l'embassament. Un **hm³** (hectòmetre cúbic) és un milió de metres cúbics, mil milions de litres. La **cota** és l'altura de la superfície de l'aigua sobre el nivell del mar.",
      `L'ACA publica una lectura per embassament i dia a les [dades obertes de la Generalitat](${dataset.url}). Les dades del dia en curs estan pendents de validar, i per això cada xifra porta la seva data al costat.`,
      "Hi ha dies en què l'ACA publica més del 100 %: l'embassament conté més aigua que la seva capacitat nominal. Les mostrem tal com són.",
    ];
  }
  if (l === "es") {
    return [
      "El **porcentaje** es el volumen de agua embalsada dividido por la capacidad del embalse. Un **hm³** (hectómetro cúbico) es un millón de metros cúbicos, mil millones de litros. La **cota** es la altura de la superficie del agua sobre el nivel del mar.",
      `La ACA publica una lectura por embalse y día en los [datos abiertos de la Generalitat](${dataset.url}). Los datos del día en curso están pendientes de validar, y por eso cada cifra lleva su fecha al lado.`,
      "Hay días en que la ACA publica más del 100 %: el embalse contiene más agua que su capacidad nominal. Los mostramos tal como son.",
    ];
  }
  return [
    "The **percentage** is the stored volume divided by the reservoir's capacity. One **hm³** (cubic hectometre) is a million cubic metres, a billion litres. The **water level** is the height of the water surface above sea level.",
    `The ACA publishes one reading per reservoir per day on the [Generalitat's open-data portal](${dataset.url}). The current day's figures are pending validation, which is why every figure carries its date.`,
    "On some days the ACA publishes more than 100%: the reservoir holds more water than its nominal capacity. We show those as they are.",
  ];
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export function faq(r: SnapshotReservoir, l: Locale): { question: string; answer: string }[] {
  const o = OFFICIAL[r.slug];
  const cap = num(o.capacity, l, 2);
  const de = deName(r);
  const placesCa = o.municipalities ? ` i ocupa terrenys de ${o.municipalities.join(", ")}` : "";
  const placesEs = o.municipalities ? ` y ocupa terrenos de ${o.municipalities.join(", ")}` : "";
  const placesEn = o.municipalities ? `, covering land in ${o.municipalities.join(", ")}` : "";
  const unitAnswer = {
    ca: {
      terLlobregat: "Sí, com a part del Ter-Llobregat: l'estat de sequera d'aquesta unitat depèn de la suma de reserves dels cinc embassaments del sistema i de les del Ter i el Llobregat per separat. Cada estat el declara l'ACA per resolució.",
      darnius: "Sí: l'estat de sequera de la unitat Embassament de Darnius-Boadella depèn del volum d'aquest embassament. Cada estat el declara l'ACA per resolució.",
      riudecanyes: "Sí, sumat amb l'altre embassament del sistema: la unitat Riudecanyes fa servir les reserves de Siurana i Riudecanyes juntes. Cada estat el declara l'ACA per resolució.",
      none: "No directament: el Pla especial de sequera de l'ACA no fa servir el Foix com a indicador de cap unitat.",
    },
    es: {
      terLlobregat: "Sí, como parte del Ter-Llobregat: el estado de sequía de esta unidad depende de la suma de reservas de los cinco embalses del sistema y de las del Ter y el Llobregat por separado. Cada estado lo declara la ACA por resolución.",
      darnius: "Sí: el estado de sequía de la unidad Embalse de Darnius-Boadella depende del volumen de este embalse. Cada estado lo declara la ACA por resolución.",
      riudecanyes: "Sí, sumado con el otro embalse del sistema: la unidad Riudecanyes usa las reservas de Siurana y Riudecanyes juntas. Cada estado lo declara la ACA por resolución.",
      none: "No directamente: el Plan especial de sequía de la ACA no usa el Foix como indicador de ninguna unidad.",
    },
    en: {
      terLlobregat: "Yes, as part of Ter-Llobregat: that unit's drought stage depends on the combined reserves of the system's five reservoirs and on those of the Ter and the Llobregat separately. Each stage is declared by an ACA resolution.",
      darnius: "Yes: the drought stage of the Darnius-Boadella unit depends on this reservoir's volume. Each stage is declared by an ACA resolution.",
      riudecanyes: "Yes, added to the system's other reservoir: the Riudecanyes unit uses Siurana's and Riudecanyes' reserves together. Each stage is declared by an ACA resolution.",
      none: "Not directly: the ACA's drought plan does not use Foix as an indicator for any unit.",
    },
  }[l][o.unit ?? "none"];
  if (l === "ca") {
    return [
      { question: `Com està avui el pantà ${de}?`, answer: "La dada d'avui és a dalt de tot, amb la data de la lectura. La publica cada dia l'Agència Catalana de l'Aigua a les dades obertes de la Generalitat." },
      { question: `Quina capacitat té l'embassament ${de}?`, answer: `${cap} hm³, segons l'estat de les reserves de l'ACA del ${SOURCES.bulletin.dated}.` },
      { question: `A quin riu és l'embassament ${de}?`, answer: `${upper(riverIn(r.slug, "ca"))}${placesCa}.` },
      { question: `L'embassament ${de} compta per a les restriccions per sequera?`, answer: unitAnswer },
    ];
  }
  if (l === "es") {
    return [
      { question: `¿Cómo está hoy el pantano ${de}?`, answer: "El dato de hoy está arriba del todo, con la fecha de la lectura. Lo publica cada día la Agència Catalana de l'Aigua en los datos abiertos de la Generalitat." },
      { question: `¿Qué capacidad tiene el embalse ${de}?`, answer: `${cap} hm³, según el estado de las reservas de la ACA del ${SOURCES.bulletin.dated}.` },
      { question: `¿En qué río está el embalse ${de}?`, answer: `${upper(riverIn(r.slug, "es"))}${placesEs}.` },
      { question: `¿El embalse ${de} cuenta para las restricciones por sequía?`, answer: unitAnswer },
    ];
  }
  return [
    { question: `How full is ${enName(r)} today?`, answer: "Today's figure is at the top of the page, with the date of the reading. The Catalan Water Agency publishes it every day on the Generalitat's open-data portal." },
    { question: `What is the capacity of ${enName(r)}?`, answer: `${cap} hm³, according to the ACA's reservoir status of ${date(SOURCES.bulletin.dated.split("/").reverse().join("-"), l)}.` },
    { question: `Which river is ${enName(r)} on?`, answer: `The ${o.river.en}${placesEn}.` },
    { question: `Does ${enName(r)} count for drought restrictions?`, answer: unitAnswer },
  ];
}

/* -------------------------------------------------------------------------- */
/* Links and sources                                                          */
/* -------------------------------------------------------------------------- */

export interface LinkItem {
  label: string;
  href: string;
}

/** The existing live guide (total and Ter-Llobregat today) and the climate guide: published articles. */
export function relatedLinks(l: Locale): LinkItem[] {
  const guide = `/${l}/${TOOL_PATHS.reservoirs[l]}/`;
  const climate = `/${l}/${B2_PATHS.climate[l]}/`;
  if (l === "ca") {
    return [
      { label: "Estat dels embassaments de Catalunya avui: el total i el Ter-Llobregat", href: guide },
      { label: "El temps a Barcelona mes a mes: quan plou", href: climate },
    ];
  }
  if (l === "es") {
    return [
      { label: "Embalses de Cataluña hoy: el total y el Ter-Llobregat", href: guide },
      { label: "El tiempo en Barcelona mes a mes: cuándo llueve", href: climate },
    ];
  }
  return [
    { label: "Catalonia reservoir levels today: the total and Ter-Llobregat", href: guide },
    { label: "Barcelona weather by month: when it rains", href: climate },
  ];
}

export interface SourceItem {
  name: string;
  publisher: string;
  url: string;
  note: string;
}

export function sources(l: Locale): SourceItem[] {
  const daily = SNAPSHOT.sources.daily;
  const history = SNAPSHOT.sources.history;
  const t = {
    ca: {
      daily: `dades diàries; llegides el ${date(SNAPSHOT.readOn, l)}`,
      history: "codi d'estació i conca",
      bulletin: `capacitats, ${SOURCES.bulletin.dated}`,
      dams: `municipis i usos, actualitzat el ${SOURCES.damsPage.dated}`,
      guide: `riu, presa i finalitat, ${SOURCES.guide.dated}`,
      plan: "sistemes Ter, Siurana i Riudecanyes",
      pes: "unitats i llindars de sequera",
    },
    es: {
      daily: `datos diarios; leídos el ${date(SNAPSHOT.readOn, l)}`,
      history: "código de estación y cuenca",
      bulletin: `capacidades, ${SOURCES.bulletin.dated}`,
      dams: `municipios y usos, actualizado el ${SOURCES.damsPage.dated}`,
      guide: "río, presa y finalidad, diciembre de 2021",
      plan: "sistemas Ter, Siurana y Riudecanyes",
      pes: "unidades y umbrales de sequía",
    },
    en: {
      daily: `daily data; read on ${date(SNAPSHOT.readOn, l)}`,
      history: "station code and basin",
      bulletin: `capacities, ${date(SOURCES.bulletin.dated.split("/").reverse().join("-"), l)}`,
      dams: `municipalities and uses, updated ${SOURCES.damsPage.dated}`,
      guide: "river, dam and purpose, December 2021",
      plan: "Ter, Siurana and Riudecanyes systems",
      pes: "drought units and thresholds",
    },
  }[l];
  return [
    { name: daily.name, publisher: daily.publisher, url: daily.url, note: t.daily },
    { name: history.name, publisher: history.publisher, url: history.url, note: t.history },
    { name: SOURCES.bulletin.name, publisher: SOURCES.bulletin.publisher, url: SOURCES.bulletin.url, note: t.bulletin },
    { name: SOURCES.damsPage.name, publisher: SOURCES.damsPage.publisher, url: SOURCES.damsPage.url, note: t.dams },
    { name: SOURCES.guide.name, publisher: SOURCES.guide.publisher, url: SOURCES.guide.url, note: t.guide },
    { name: SOURCES.plan.name, publisher: SOURCES.plan.publisher, url: SOURCES.plan.url, note: t.plan },
    { name: SOURCES.pes.name, publisher: SOURCES.pes.publisher, url: SOURCES.pes.url, note: t.pes },
  ];
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                        */
/* -------------------------------------------------------------------------- */

export interface HubCopy {
  title: string;
  description: string;
  h1: string;
  crumb: string;
  lead: string;
  tableTitle: string;
  aboutTitle: string;
  about: string[];
  ebroTitle: string;
  ebro: string[];
}

export function hubCopy(l: Locale): HubCopy {
  const y = titleYear();
  const guide = `/${l}/${TOOL_PATHS.reservoirs[l]}/`;
  const bulletin = SOURCES.bulletin.url;
  if (l === "ca") {
    return {
      title: `Embassaments de Catalunya un per un: nivell avui (${y})`,
      description:
        "El nivell de cada embassament de l'ACA amb la dada diària: Sau, Susqueda, la Baells, la Llosa del Cavall, Siurana i la resta. Riu, capacitat i l'últim any.",
      h1: "Embassaments de Catalunya, un per un",
      crumb: "Embassaments",
      lead: "Els nou embassaments de la sèrie diària de l'Agència Catalana de l'Aigua, cadascun amb la seva pàgina: el nivell d'avui, el riu, la capacitat, per a què serveix i com ha anat l'últim any.",
      tableTitle: "Nivell de cada embassament",
      aboutTitle: "Quins embassaments són",
      about: [
        "Són els que l'ACA publica cada dia a les dades obertes: els de les conques internes de Catalunya de més de 2 hm³ i Siurana, que és a la conca de l'Ebre però l'ACA el gestiona amb Riudecanyes. El Pasteral, la petita presa del Ter aigües avall de Susqueda (2 hm³ segons l'ACA), no hi és.",
        `Per al total de Catalunya i el sistema Ter-Llobregat, que abasteix l'àrea de Barcelona, consulta [l'estat dels embassaments avui](${guide}).`,
      ],
      ebroTitle: "I Rialb, Oliana, Canelles o Riba-roja?",
      ebro: [
        `Els embassaments de la part catalana de l'Ebre (Rialb, Oliana, Canelles, Santa Anna, Talarn, Camarasa, Mequinensa, Riba-roja…) són a la conca de la Confederació Hidrogràfica de l'Ebre (CHE), que en publica les dades. La CHE adverteix que les dades en temps real del seu sistema SAIH no són oficials fins que les valida, i per això no en fem pàgines. L'ACA n'inclou un resum, amb dades facilitades per la CHE, al seu [butlletí diari](${bulletin}).`,
      ],
    };
  }
  if (l === "es") {
    return {
      title: `Embalses de Cataluña uno a uno: nivel hoy (${y})`,
      description:
        "El nivel de cada pantano de la ACA con el dato diario: Sau, Susqueda, la Baells, la Llosa del Cavall, Siurana y el resto. Río, capacidad y último año.",
      h1: "Embalses de Cataluña, uno a uno",
      crumb: "Embalses",
      lead: "Los nueve embalses de la serie diaria de la Agència Catalana de l'Aigua, cada uno con su página: el nivel de hoy, el río, la capacidad, para qué sirve y cómo ha ido el último año.",
      tableTitle: "Nivel de cada embalse",
      aboutTitle: "Qué embalses son",
      about: [
        "Son los que la ACA publica cada día en los datos abiertos: los de las cuencas internas de Cataluña de más de 2 hm³ y Siurana, que está en la cuenca del Ebro pero la ACA gestiona con Riudecanyes. El Pasteral, la pequeña presa del Ter aguas abajo de Susqueda (2 hm³ según la ACA), no está.",
        `Para el total de Cataluña y el sistema Ter-Llobregat, que abastece el área de Barcelona, consulta [los embalses de Cataluña hoy](${guide}).`,
      ],
      ebroTitle: "¿Y Rialb, Oliana, Canelles o Riba-roja?",
      ebro: [
        `Los embalses de la parte catalana del Ebro (Rialb, Oliana, Canelles, Santa Anna, Talarn, Camarasa, Mequinenza, Riba-roja…) están en la cuenca de la Confederación Hidrográfica del Ebro (CHE), que publica sus datos. La CHE advierte que los datos en tiempo real de su sistema SAIH no son oficiales hasta que los valida, y por eso no les dedicamos páginas. La ACA incluye un resumen, con datos facilitados por la CHE, en su [boletín diario](${bulletin}).`,
      ],
    };
  }
  return {
    title: `Catalonia reservoirs one by one: water levels today (${y})`,
    description:
      "How full each reservoir the Catalan Water Agency measures is, from its daily data: Sau, Susqueda, la Baells, Siurana and the rest, with river and capacity.",
    h1: "Catalonia's reservoirs, one by one",
    crumb: "Reservoirs",
    lead: "The nine reservoirs in the Catalan Water Agency's daily series, each with its own page: today's level, the river, the capacity, what it is for and how the past year went.",
    tableTitle: "Level of each reservoir",
    aboutTitle: "Which reservoirs these are",
    about: [
      "They are the ones the ACA publishes every day as open data: the reservoirs of Catalonia's internal basins above 2 hm³, plus Siurana, which lies in the Ebro basin but is run by the ACA together with Riudecanyes. El Pasteral, the small dam on the Ter below Susqueda (2 hm³ according to the ACA), is not included.",
      `For the Catalonia total and the Ter-Llobregat system that supplies the Barcelona area, see [Catalonia reservoir levels today](${guide}).`,
    ],
    ebroTitle: "What about Rialb, Oliana, Canelles or Riba-roja?",
    ebro: [
      `The reservoirs of the Catalan part of the Ebro basin (Rialb, Oliana, Canelles, Santa Anna, Talarn, Camarasa, Mequinenza, Riba-roja…) are in the basin of the Ebro Basin Authority (CHE), which publishes their data. The CHE warns that the real-time data of its SAIH system are not official until it validates them, so we do not give them pages. The ACA includes a summary, with data supplied by the CHE, in its [daily bulletin](${bulletin}).`,
    ],
  };
}

/** Link text from another page of the family to a reservoir. */
export function reservoirLinkLabel(r: SnapshotReservoir, l: Locale): string {
  const o = OFFICIAL[r.slug];
  if (l === "ca") return `Embassament ${deName(r)} (${o.river.ca})`;
  if (l === "es") return `Embalse ${deName(r)} (${o.river.es})`;
  return `${enName(r)} (${o.river.en})`;
}

export { reservoirBySlug, reservoirHubPath, reservoirPath };
