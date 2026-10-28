/**
 * Shapes of the fuel-price family.
 *
 * Two committed files, both written only by `scripts/fuel-snapshot.ts` from
 * the Ministry's own list of stations (never prices, which change every half
 * hour and are read live in the browser):
 *
 *   municipalities.json  the Ministry's municipality ids in Catalonia, mapped
 *                        to the INE code, the official name and the comarca
 *                        (Idescat). The route handler reads only this one.
 *   stations.json        every station: id, brand, address, municipality.
 */

export type ProvinceCode = "08" | "17" | "25" | "43";

export interface SnapshotSource {
  name: string;
  publisher: string;
  url: string;
}

export interface FuelMunicipality {
  /** The Ministry's `IDMunicipio` (its own numbering, not the INE code). */
  id: string;
  /** INE municipality code, five digits. */
  ine: string;
  /** Official name, article first, as Idescat writes it: "l'Hospitalet de Llobregat". */
  name: string;
  /** The name as the Ministry spells it: "Hospitalet de Llobregat (L')". */
  ministryName: string;
  /** Idescat comarca code, two digits. */
  comarca: string;
  province: ProvinceCode;
  /** Stations listed in this municipality on `readOn`. */
  stations: number;
}

export interface MunicipalitySnapshot {
  /** Day the Ministry's list was read, Europe/Madrid, ISO. */
  readOn: string;
  /** The `Fecha` of the response that was read, as the Ministry writes it. */
  ministryTimestamp: string;
  /** Idescat comarca code -> name ("11" -> "Baix Llobregat"). */
  comarques: Record<string, string>;
  municipalities: FuelMunicipality[];
  sources: {
    prices: SnapshotSource & { api: string; licence: string; licenceUrl: string };
    comarques: SnapshotSource;
  };
}

export interface SnapshotStation {
  /** The Ministry's `IDEESS`. */
  id: string;
  /** `Rótulo`, trimmed, as the Ministry publishes it (upper case). */
  brand: string;
  /** `Dirección`, as published. */
  address: string;
  /** `IDMunicipio`. */
  municipality: string;
}

export interface StationSnapshot {
  readOn: string;
  stations: SnapshotStation[];
}
