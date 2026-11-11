/**
 * The snapshot scripts/gordo-snapshot.py writes on 22 December from SELAE's
 * draw record and its per-prize "puntos de venta relacionados" pages. Every
 * field comes from those pages; the municipality is the INE municipality the
 * script matched SELAE's locality to (null when none matched).
 */

export type GordoPrizeKey = "first" | "second" | "third" | "fourth" | "fifth";

export interface GordoMunicipality {
  /** INE code, five digits ("08279"). */
  ine: string;
  /** Official name, article first ("el Prat de Llobregat", "A Coruña"). */
  name: string;
  slug: string;
}

export interface GordoOutlet {
  /** SELAE's point-of-sale id (/es/punto-de-venta/red-comercial/<id>). */
  id: string | null;
  /** "outlet": a lottery shop; "web": SELAE's own online channel (loteriasyapuestas.es). */
  channel: "outlet" | "web";
  /** As SELAE prints it ("RAMBLA DE FRANCESC MACIÁ, 106"); null for the web channel. */
  address: string | null;
  /** SELAE's "Localidad" ("TERRASSA", "NORIAS (LAS)"). */
  locality: string | null;
  /** INE province code ("08"). */
  province: string | null;
  /** SELAE adds "Repartido a través de la web oficial": part of it was sold through loteriasyapuestas.es. */
  viaWeb: boolean;
  municipality: GordoMunicipality | null;
}

export interface GordoPrize {
  key: GordoPrizeKey;
  /** Five digits each, as drawn so far (1, 1, 1, 2 and 8 when complete). */
  numbers: string[];
  /** Euros per 20 € décimo (SELAE's 2026 programme). */
  perDecimo: number;
  /** SELAE's points-of-sale page; null while SELAE has not published it. */
  page: string | null;
  /** null while SELAE has not published where it was sold. */
  outlets: GordoOutlet[] | null;
}

export interface GordoSnapshot {
  schema: 1;
  /** True only for the test fixture: the site refuses to render it. */
  testData: boolean;
  year: number;
  drawDate: string;
  drawId: string;
  /** When the SELAE pages were downloaded (ISO with offset). */
  readAt: string;
  sources: { results: string; officialList: string | null };
  prizes: GordoPrize[];
}
