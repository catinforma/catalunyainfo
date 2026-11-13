/**
 * The official rules behind "¿Cuándo me toca pasar la ITV?"
 * (lib/programmatic/itv/). Client-safe: no data files, no server code.
 *
 * Every rule and quote below was read on ITV_RULES_AS_OF in the BOE's
 * consolidated texts:
 *  - Real Decreto 920/2017, de 23 de octubre, por el que se regula la
 *    inspección técnica de vehículos (BOE-A-2017-12841; consolidated text
 *    "última actualización publicada el 18/09/2024", RD 892/2024). The
 *    frequency table is in article 6.1 (not in annex I, which lists what is
 *    inspected); the 30-day rule is article 6.5; historic vehicles 6.2; the
 *    10 days the police give 6.9; the V-19 sticker article 12.1; tariffs are
 *    set by each community, article 19.1; the report's "Fecha próxima
 *    inspección", annex II.
 *  - Real Decreto Legislativo 6/2015 (Ley de Tráfico, BOE-A-2015-11722;
 *    consolidated text last updated 26/06/2026): article 76.o) (serious
 *    offence), 80.1 (200 euros) and 94 (50 % off when paid within 20 days).
 *
 * Nothing here comes from the press or the ITV operators. A test fails after
 * ITV_REREAD_BY: re-read both texts on the BOE and move both dates.
 */

/** The day every rule and quote below was read on the BOE. */
export const ITV_RULES_AS_OF = "2026-11-13";

/** Re-read RD 920/2017 art. 6 and the Ley de Tráfico by this day (a test fails after it). */
export const ITV_REREAD_BY = "2027-06-01";

export const BOE = {
  rd920: { id: "BOE-A-2017-12841", name: "Real Decreto 920/2017, de 23 de octubre, por el que se regula la inspección técnica de vehículos", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12841" },
  rd920art6: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12841#a6",
  lsv: { id: "BOE-A-2015-11722", name: "Real Decreto Legislativo 6/2015, de 30 de octubre, por el que se aprueba el texto refundido de la Ley sobre Tráfico, Circulación de Vehículos a Motor y Seguridad Vial", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11722" },
} as const;

/** How often, in months. */
export type Frequency = "exempt" | 6 | 12 | 24 | 36 | 48;

/**
 * One row of the art. 6.1 table: from `fromYears` of age (reached, counted
 * from the first registration) the frequency is `every`. The first band
 * starts at 0. "Hasta 4 años: Exento. De más de 4 años: Bienal" reads as:
 * below 4 years exempt, from the 4th anniversary every 2 years.
 */
export interface Band {
  fromYears: number;
  every: Frequency;
}

export type CategoryId =
  | "car"
  | "motorcycle"
  | "moped"
  | "van"
  | "bus"
  | "heavy"
  | "caravan"
  | "taxi"
  | "school"
  | "tractor-fast"
  | "tractor"
  | "works";

export interface Category {
  id: CategoryId;
  /** EU category codes as printed in art. 6.1. */
  codes: string;
  bands: Band[];
  /** The table's words, verbatim (Spanish). */
  quote: string;
}

/** Article 6.1 of RD 920/2017, verbatim in `quote`, as bands in `bands`. */
export const CATEGORIES: readonly Category[] = [
  { id: "car", codes: "M1", bands: [{ fromYears: 0, every: "exempt" }, { fromYears: 4, every: 24 }, { fromYears: 10, every: 12 }], quote: "Hasta 4 años: Exento. De más de 4 años: Bienal. De más de 10 años: Anual." },
  { id: "motorcycle", codes: "L (salvo L1e)", bands: [{ fromYears: 0, every: "exempt" }, { fromYears: 4, every: 24 }], quote: "Hasta 4 años: Exento. De más de 4 años: Bienal." },
  { id: "moped", codes: "L1e", bands: [{ fromYears: 0, every: "exempt" }, { fromYears: 3, every: 24 }], quote: "Hasta 3 años: Exento. De más de 3 años: Bienal." },
  { id: "van", codes: "N1", bands: [{ fromYears: 0, every: "exempt" }, { fromYears: 2, every: 24 }, { fromYears: 6, every: 12 }, { fromYears: 10, every: 6 }], quote: "Hasta 2 años: Exento. De 2 a 6 años: Bienal. De 6 a 10 años: Anual. De más de 10 años: Semestral." },
  { id: "bus", codes: "M2, M3", bands: [{ fromYears: 0, every: 12 }, { fromYears: 5, every: 6 }], quote: "Hasta 5 años: Anual. De más de 5 años: Semestral." },
  { id: "heavy", codes: "N2, N3, O2 (salvo caravanas), O3, O4", bands: [{ fromYears: 0, every: 12 }, { fromYears: 10, every: 6 }], quote: "Hasta 10 años: Anual. De más de 10 años: Semestral." },
  { id: "caravan", codes: "O2 (caravana remolcada)", bands: [{ fromYears: 0, every: "exempt" }, { fromYears: 6, every: 24 }], quote: "Hasta seis años: Exento. De más de 6 años: Bienal." },
  { id: "taxi", codes: "M1 (taxi, ambulancia, transporte escolar y de menores)", bands: [{ fromYears: 0, every: 12 }, { fromYears: 5, every: 6 }], quote: "Hasta cinco años: Anual. De más de cinco años: Semestral." },
  { id: "school", codes: "M1 y L (escuela de conductores)", bands: [{ fromYears: 0, every: "exempt" }, { fromYears: 2, every: 12 }, { fromYears: 5, every: 6 }], quote: "Hasta dos años: Exento. De dos a cinco años: Anual. De más de cinco años: Semestral." },
  { id: "tractor-fast", codes: "T (más de 40 km/h)", bands: [{ fromYears: 0, every: "exempt" }, { fromYears: 4, every: 24 }, { fromYears: 16, every: 12 }], quote: "Hasta 4 años: Exento. De 4 a 16 años: Bienal. De más de 16 años: Anual." },
  { id: "tractor", codes: "Resto de tractores agrícolas, máquinas automotrices, remolques especiales, tractocarros", bands: [{ fromYears: 0, every: "exempt" }, { fromYears: 8, every: 24 }, { fromYears: 16, every: 12 }], quote: "Hasta 8 años: Exento. Entre 8 y 16 años: Bienal. De más de 16 años: Anual." },
  { id: "works", codes: "Vehículos especiales de obras y servicios (25 km/h o más)", bands: [{ fromYears: 0, every: "exempt" }, { fromYears: 4, every: 24 }, { fromYears: 10, every: 12 }], quote: "Hasta 4 años: Exento. De 4 a 10 años: Bienal. De más de 10 años: Anual." },
];

/** The categories the calculator offers first (the rest follow in the same select). */
export const COMMON_CATEGORIES: readonly CategoryId[] = ["car", "motorcycle", "moped", "van", "caravan"];

/** Verbatim quotes (Spanish, as in the BOE), read on ITV_RULES_AS_OF. */
export const QUOTE = {
  /** RD 920/2017 art. 6.1, after the table. */
  age: "A efectos de la determinación de frecuencia, la antigüedad del vehículo deberá ser computada a partir de la fecha de primera matriculación o puesta en servicio que conste en el Registro de Vehículos del organismo autónomo Jefatura Central de Tráfico y que podrá ser consignada en el permiso de circulación o documento equivalente.",
  /** RD 920/2017 art. 6.5: the 30-day rule. */
  early:
    "El plazo de validez de las inspecciones técnicas periódicas se obtendrá adicionando a la fecha en la que el resultado de la inspección haya sido favorable la frecuencia indicada en este artículo. No obstante, si dicha fecha está comprendida en los 30 días naturales precedentes a la expiración del plazo de validez de la inspección anterior, el plazo de validez se obtendrá adicionando la frecuencia correspondiente a la citada fecha de expiración.",
  /** RD 920/2017 art. 6.3. */
  mixed: "En el caso de vehículos mixtos, la frecuencia de inspección aplicable será la correspondiente a la categoría N en la que el vehículo pueda catalogarse.",
  /** RD 920/2017 art. 6.4. */
  quad: "Los vehículos quad se equipararán a los de la categoría L (resto de L, por no corresponder con L1e), de la tabla anterior.",
  /** RD 920/2017 art. 6.9. */
  tenDays:
    "los agentes de la autoridad encargados de la vigilancia del tráfico en el ejercicio de las funciones que tienen encomendadas concederán al titular o arrendatario a largo plazo del vehículo un plazo de 10 días para someter al mismo a inspección técnica. Trascurrido el plazo indicado sin que se hubiera acreditado la presentación del mismo a la citada inspección, la Jefatura de Tráfico iniciará el procedimiento para acordar la baja de oficio del vehículo.",
  /** RD 920/2017 art. 12.1. */
  sticker:
    "Los vehículos que hayan superado favorablemente la inspección técnica periódica deberán colocar el correspondiente distintivo V-19 conforme a lo previsto en el anexo XI del Reglamento General de Vehículos, que será obtenido en la estación de ITV y tendrá la consideración de prueba de inspección.",
  /** RD 920/2017 art. 12.2. */
  register:
    "verificarán la vigencia de la inspección técnica periódica de los vehículos a través de los datos obrantes en el Registro de Vehículos de la Jefatura Central de Tráfico, o alternativamente del informe de inspección o de la tarjeta ITV o certificado de características del vehículo.",
  /** RD 920/2017 annex II, how the report is filled in. */
  reportDate: "Fecha próxima inspección: Se hará constar la fecha antes de la que debe el vehículo pasar la próxima inspección periódica en el caso de inspección favorable.",
  /** RD 920/2017 art. 11.8. */
  freeChoice: "Existe libertad de elección de la estación ITV para efectuar tanto la primera inspección técnica como las inspecciones sucesivas tras la subsanación de defectos.",
  /** RD 920/2017 art. 19.1. */
  tariffs: "El régimen tarifario de las inspecciones técnicas será establecido por la comunidad autónoma.",
  /** RD 920/2017 art. 11.2 (serious defects). */
  seriousDefects:
    "Los defectos calificados como graves son defectos que inhabilitan al vehículo para circular por las vías públicas excepto para su traslado al taller o, en su caso, para la regularización de su situación y vuelta a una Estación ITV para nueva inspección en un plazo no superior a dos meses, contados desde la primera inspección técnica desfavorable.",
  /** Ley de Tráfico art. 76.o). */
  offence: "Circular con un vehículo que incumpla las condiciones técnicas reglamentariamente establecidas, salvo que sea calificada como muy grave, así como las infracciones relativas a las normas que regulan la inspección técnica de vehículos.",
  /** Ley de Tráfico art. 80.1. */
  fine: "Las infracciones leves serán sancionadas con multa de hasta 100 euros; las graves, con multa de 200 euros, y las muy graves, con multa de 500 euros.",
  /** Ley de Tráfico art. 94 a). */
  discount: "La reducción del 50 por ciento del importe de la sanción.",
  /** Ley de Tráfico art. 94, opening words. */
  discountWhen: "Una vez realizado el pago voluntario de la multa, ya sea en el acto de entrega de la denuncia o dentro del plazo de veinte días naturales contados desde el día siguiente al de su notificación",
  /** RD 920/2017 art. 6.2, last paragraph (historic vehicles). */
  historicExempt:
    "aquellos vehículos clasificados como históricos con antigüedad superior a sesenta años desde su fabricación o primera matriculación, así como los ciclomotores clasificados como históricos con independencia de su antigüedad, quedarán exentos de someterse a la inspección técnica de vehículos",
} as const;

/** The fine for an ITV offence (Ley de Tráfico art. 76.o and 80.1) and with the early-payment discount (art. 94). */
export const FINE = { serious: 200, paidEarly: 100, discountDays: 20 } as const;

/** Days before the expiry within which a favourable inspection keeps the old date (art. 6.5). */
export const EARLY_DAYS = 30;

/** Historic vehicles, art. 6.2 (as amended by RD 892/2024): age bands for "resto de categorías". */
export const HISTORIC = [
  { from: 0, to: 30, every: "category" as const },
  { from: 30, to: 40, every: 24 as const },
  { from: 40, to: 45, every: 36 as const },
  { from: 45, to: null, every: 48 as const },
];
