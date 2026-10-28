/**
 * Shapes of the weekend-per-zone family.
 *
 * One committed file, `snapshot.json`, written only by
 * `scripts/weekend-snapshot.ts` from four official sources:
 *
 *   - the municipality register (`wpyq-we8x`, ICGC / Generalitat): every
 *     municipality with its INE and Idescat codes, comarca and province, so an
 *     agenda row can be placed in a zone;
 *   - Idescat's "Marques turístiques" classification: which comarques make up
 *     the Costa Brava, the Costa Daurada, Pirineus and Val d'Aran;
 *   - the fairs calendar (`vm32-przc`, Departament d'Empresa i Treball): the
 *     fairs still to come this year, with their dates;
 *   - the cultural agenda (`rhpv-yr4f`, Departament de Cultura): read only to
 *     measure how many activities each zone had per weekend over the last
 *     year (the doorway guardrail). The agenda itself is never stored: the
 *     pages read it live, in the browser, from `/api/weekend/agenda/`.
 */

export type ProvinceCode = "08" | "17" | "25" | "43";

export interface SnapshotSource {
  name: string;
  publisher: string;
  /** The page a reader can open. */
  url: string;
  /** The machine endpoint the script read. */
  api: string;
  /** When the publisher last changed the data (ISO date), as its metadata says. */
  updated: string | null;
}

export interface RegisterMunicipality {
  /** INE code, five digits ("08019"). */
  ine: string;
  /** Idescat code, six digits ("080193"): the one Meteocat's URLs use. */
  idescat: string;
  /** Official name, article first ("l'Hospitalet de Llobregat"). */
  name: string;
  /** Idescat comarca code, two digits. */
  comarca: string;
  province: ProvinceCode;
}

export interface SnapshotFair {
  /** `id_activitats_firals`. */
  id: string;
  /**
   * `nom`, as the organiser registered it. Shown in both languages: it is a
   * proper name ("Fira del Codony"), and the dataset's Spanish rendering
   * ("Feria del Membrillo") is not what the town or its posters call it.
   */
  name: string;
  /** Municipality, official name article first. */
  town: string;
  /** INE code of the municipality ("" if the code was missing). */
  ine: string;
  comarca: string;
  province: ProvinceCode;
  /** ISO dates. */
  start: string;
  end: string;
  /** `sector` / `sector_castellano`. */
  sector: string;
  sectorEs: string;
  /** Organiser's website, https, or null. */
  web: string | null;
  /** `dates_a_confirmar` = "Sí". */
  toConfirm: boolean;
}

/** Weekend counts of agenda activities in one zone, over the year before `readOn`. */
export interface ZoneVolume {
  weekends: number;
  /** First and last weekend measured (their Fridays). */
  from: string;
  to: string;
  median: number;
  /** A quarter of the weekends had fewer activities than this. */
  p25: number;
  min: number;
}

export interface WeekendSnapshot {
  /** Day the sources were read (Europe/Madrid). The only date the snapshot gives the pages. */
  readOn: string;
  sources: {
    agenda: SnapshotSource;
    fairs: SnapshotSource;
    register: SnapshotSource;
    brands: SnapshotSource;
  };
  /** Idescat comarca code -> name, as Idescat writes it ("39" -> "Aran"). */
  comarques: Record<string, string>;
  /** Idescat tourism brand code -> its name and comarques ("MT02" -> Costa Brava). */
  brands: Record<string, { name: string; comarques: string[] }>;
  municipalities: RegisterMunicipality[];
  /**
   * Agenda municipality slugs that still use a former name, mapped to the INE
   * code of the municipality's current name ("calonge" -> 17034).
   */
  agendaAliases: Record<string, string>;
  /** Fairs ending on or after `readOn`, in date order. */
  fairs: SnapshotFair[];
  /** Zone id -> its measured weekend volume. */
  volume: Record<string, ZoneVolume>;
}
