import type { Indicator } from "./official";
import type { Age, BlockLocale } from "./live";

/**
 * Words of the reading block (server HTML and browser). Kept free of data
 * imports so the client bundle carries only these strings.
 */
export interface ReadingLabels {
  /** "{pct}". */
  full: string;
  /** "{vol}", "{cap}". */
  volume: string;
  /** "{level}". */
  level: string;
  /** "{pp}", "{date}". */
  change: string;
  /** The page's own reading (server HTML, no JS, or the endpoint failed before answering). "{date}". */
  own: string;
  /** The endpoint failed: the page's own reading stays, with its date. "{date}". */
  failed: string;
  /** "{date}". */
  live: Record<Age, string>;
  official: string;
  source: string;
  indicatorsTitle: string;
  /** "{name}", "{vol}", "{date}". */
  indicator: string;
  indicatorNames: Record<Indicator["key"], string>;
  indicatorMissing: string;
  /** Hub table. */
  cols: { name: string; river: string; capacity: string; full: string; date: string };
  /** Hub: the page's own readings; "{date}". */
  tableOwn: string;
  tableLive: string;
  tableFailed: string;
}

export const READING_LABELS: Record<BlockLocale, ReadingLabels> = {
  ca: {
    full: "{pct} % ple",
    volume: "{vol} hm³ de {cap} hm³ de capacitat",
    level: "Cota de l'aigua: {level} m sobre el nivell del mar",
    change: "{pp} punts des del {date}",
    own: "Dada de l'ACA del {date}, la més recent quan es va generar aquesta pàgina.",
    failed: "Ara mateix no podem llegir la dada més nova de l'ACA: aquesta és la del {date}.",
    live: {
      today: "Dada de l'ACA d'avui, {date}.",
      yesterday: "Dada de l'ACA d'ahir, {date}.",
      recent: "Dada de l'ACA del {date}.",
      stale: "Dada de l'ACA del {date}: l'ACA no n'ha publicat cap de més nova.",
    },
    official: "Estat de les reserves al web de l'ACA",
    source: "Font: Generalitat de Catalunya, Agència Catalana de l'Aigua (dades obertes). Dades pendents de validar per l'ACA.",
    indicatorsTitle: "Reserves que compta el Pla de sequera",
    indicator: "{name}: {vol} hm³ (lectura del {date})",
    indicatorNames: {
      terLlobregat: "Reserves conjuntes del Ter-Llobregat",
      ter: "Reserves del Ter (Sau i Susqueda)",
      llobregat: "Reserves del Llobregat (la Llosa del Cavall, Sant Ponç i la Baells)",
      darnius: "Reserves de Darnius Boadella",
      siuranaRiudecanyes: "Reserves de Siurana i Riudecanyes",
    },
    indicatorMissing: "La suma surt quan tots els embassaments tenen lectura del mateix dia.",
    cols: { name: "Embassament", river: "Riu", capacity: "Capacitat (hm³)", full: "Ple", date: "Lectura" },
    tableOwn: "Lectures de l'ACA del {date}, les més recents quan es va generar aquesta pàgina.",
    tableLive: "Lectures més recents de l'ACA, amb la data de cadascuna.",
    tableFailed: "Ara mateix no podem llegir les dades més noves de l'ACA: aquestes són les del {date}.",
  },
  es: {
    full: "{pct} % lleno",
    volume: "{vol} hm³ de {cap} hm³ de capacidad",
    level: "Cota del agua: {level} m sobre el nivel del mar",
    change: "{pp} puntos desde el {date}",
    own: "Dato de la ACA del {date}, el más reciente cuando se generó esta página.",
    failed: "Ahora mismo no podemos leer el dato más nuevo de la ACA: este es el del {date}.",
    live: {
      today: "Dato de la ACA de hoy, {date}.",
      yesterday: "Dato de la ACA de ayer, {date}.",
      recent: "Dato de la ACA del {date}.",
      stale: "Dato de la ACA del {date}: la ACA no ha publicado ninguno más nuevo.",
    },
    official: "Estado de las reservas en la web de la ACA",
    source: "Fuente: Generalitat de Catalunya, Agència Catalana de l'Aigua (datos abiertos). Datos pendientes de validar por la ACA.",
    indicatorsTitle: "Reservas que cuenta el Plan de sequía",
    indicator: "{name}: {vol} hm³ (lectura del {date})",
    indicatorNames: {
      terLlobregat: "Reservas conjuntas del Ter-Llobregat",
      ter: "Reservas del Ter (Sau y Susqueda)",
      llobregat: "Reservas del Llobregat (la Llosa del Cavall, Sant Ponç y la Baells)",
      darnius: "Reservas de Darnius Boadella",
      siuranaRiudecanyes: "Reservas de Siurana y Riudecanyes",
    },
    indicatorMissing: "La suma aparece cuando todos los embalses tienen lectura del mismo día.",
    cols: { name: "Embalse", river: "Río", capacity: "Capacidad (hm³)", full: "Lleno", date: "Lectura" },
    tableOwn: "Lecturas de la ACA del {date}, las más recientes cuando se generó esta página.",
    tableLive: "Lecturas más recientes de la ACA, con la fecha de cada una.",
    tableFailed: "Ahora mismo no podemos leer los datos más nuevos de la ACA: estos son los del {date}.",
  },
  en: {
    full: "{pct}% full",
    volume: "{vol} hm³ of {cap} hm³ capacity",
    level: "Water level: {level} m above sea level",
    change: "{pp} points since {date}",
    own: "ACA reading of {date}, the latest when this page was generated.",
    failed: "We cannot read the ACA's newest figure right now: this is the one of {date}.",
    live: {
      today: "ACA reading of today, {date}.",
      yesterday: "ACA reading of yesterday, {date}.",
      recent: "ACA reading of {date}.",
      stale: "ACA reading of {date}: the ACA has published nothing newer.",
    },
    official: "Reservoir status on the ACA website (Catalan/Spanish)",
    source: "Source: Generalitat de Catalunya, Catalan Water Agency (ACA) open data. Figures pending validation by the ACA.",
    indicatorsTitle: "Reserves the drought plan counts",
    indicator: "{name}: {vol} hm³ (reading of {date})",
    indicatorNames: {
      terLlobregat: "Combined Ter-Llobregat reserves",
      ter: "Ter reserves (Sau and Susqueda)",
      llobregat: "Llobregat reserves (la Llosa del Cavall, Sant Ponç and la Baells)",
      darnius: "Darnius Boadella reserves",
      siuranaRiudecanyes: "Siurana and Riudecanyes reserves",
    },
    indicatorMissing: "The sum appears when every reservoir has a reading of the same day.",
    cols: { name: "Reservoir", river: "River", capacity: "Capacity (hm³)", full: "Full", date: "Reading" },
    tableOwn: "ACA readings of {date}, the latest when this page was generated.",
    tableLive: "The ACA's latest readings, each with its date.",
    tableFailed: "We cannot read the ACA's newest figures right now: these are the ones of {date}.",
  },
};
