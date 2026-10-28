/**
 * Builds the station list behind /es/gasolineras/ and /ca/benzineres/.
 *
 *   npm run fuel:snapshot -- build [--allow-removals]
 *       Reads the Ministry's live list for Catalonia (MITECO, REST service
 *       `EstacionesTerrestres/FiltroCCAA/09`) and Idescat's municipality ->
 *       comarca table, matches every Ministry municipality to its INE code,
 *       and writes
 *         src/lib/programmatic/fuel/municipalities.json
 *         src/lib/programmatic/fuel/stations.json
 *       Prices are NOT stored: they change every half hour and the pages read
 *       them live, in the browser, from /api/fuel/catalonia/.
 *       Refuses to write when a page that exists today would disappear
 *       (a comarca or city falling below its threshold) unless
 *       --allow-removals is given: a removed URL is a 404 for anyone who
 *       bookmarked or linked it.
 *
 *   npm run fuel:snapshot -- urls
 *       Prints every URL of the family (for IndexNow or Search Console).
 *
 * Run from a machine in Spain or anywhere: the service is public. It answers
 * 503 now and then; just run it again.
 */

import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { API_URLS } from "../src/lib/programmatic/fuel/upstream.ts";
import { fromIdescat, fromMinistry, nameKey } from "../src/lib/programmatic/fuel/names.ts";
import { selectPages } from "../src/lib/programmatic/fuel/data.ts";
import { fuelFamilyPaths } from "../src/lib/programmatic/fuel/sitemap.ts";
import type { FuelMunicipality, MunicipalitySnapshot, ProvinceCode, SnapshotStation, StationSnapshot } from "../src/lib/programmatic/fuel/types.ts";

const ROOT = resolve(import.meta.dirname, "..");
const OUT_MUNICIPALITIES = join(ROOT, "src/lib/programmatic/fuel/municipalities.json");
const OUT_STATIONS = join(ROOT, "src/lib/programmatic/fuel/stations.json");

const IDESCAT_COMARQUES = "https://www.idescat.cat/codis/?id=50&n=9";
const DATASET_URL = "https://catalogo.datosabiertos.miteco.gob.es/catalogo/dataset/902a266d-5ba2-4735-a378-45818ba5a4f4";

/**
 * Municipalities the Ministry still lists under a former name. Each maps to
 * the INE code Idescat gives the municipality's current official name (the
 * INE code does not change with a rename). Checked on 28 Oct 2026 against
 * Idescat's code table; the build fails on any other unmatched name.
 */
const RENAMED: Record<string, { province: ProvinceCode; ine: string; now: string }> = {
  "Bigues i Riells": { province: "08", ine: "08023", now: "Bigues i Riells del Fai" },
  "Santa Maria de Corcó": { province: "08", ine: "08254", now: "l'Esquirol" },
  Brunyola: { province: "17", ine: "17028", now: "Brunyola i Sant Martí Sapresa" },
  Calonge: { province: "17", ine: "17034", now: "Calonge i Sant Antoni" },
  "Castell-Platja d'Aro": { province: "17", ine: "17048", now: "Castell d'Aro, Platja d'Aro i s'Agaró" },
  Palamós: { province: "17", ine: "17118", now: "Palamós i Sant Joan" },
  Saus: { province: "17", ine: "17187", now: "Saus, Camallera i Llampaies" },
  "Roda de Barà": { province: "43", ine: "43131", now: "Roda de Berà" },
  "Sant Carles de la Ràpita": { province: "43", ine: "43136", now: "la Ràpita" },
};

const PROVINCES: readonly ProvinceCode[] = ["08", "17", "25", "43"];

function todayInMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "user-agent": "CatalunyaInfo fuel snapshot (+https://www.catalunyainfo.com)", accept: "application/json, text/plain, */*" },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

interface MinistryRow {
  IDEESS: string;
  "Rótulo": string;
  "Dirección": string;
  Municipio: string;
  IDMunicipio: string;
  IDProvincia: string;
}

async function readMinistry(): Promise<{ fecha: string; rows: MinistryRow[]; url: string }> {
  let lastError: unknown = null;
  for (const url of API_URLS) {
    try {
      const json = JSON.parse(await fetchText(url)) as { Fecha?: string; ListaEESSPrecio?: MinistryRow[]; ResultadoConsulta?: string };
      if (json.ResultadoConsulta !== "OK" || !Array.isArray(json.ListaEESSPrecio) || !json.Fecha) throw new Error(`${url}: unexpected answer`);
      return { fecha: json.Fecha, rows: json.ListaEESSPrecio, url };
    } catch (error) {
      lastError = error;
      console.warn(`! ${String(error)}`);
    }
  }
  throw new Error(`Ministry service unavailable: ${String(lastError)}`);
}

async function build(allowRemovals: boolean): Promise<void> {
  const readOn = todayInMadrid();
  const ministry = await readMinistry();
  const comarquesSsv = await fetchText(`${IDESCAT_COMARQUES}&f=ssv`);

  // Idescat: INE (first five digits) -> name and comarca.
  const idescat = new Map<string, { name: string; comarca: string; comarcaName: string }>();
  const byKey = new Map<string, string>();
  for (const line of comarquesSsv.split(/\r?\n/)) {
    const cells = line.split(";");
    if (!/^\d{6}$/.test(cells[0] ?? "")) continue;
    const ine = cells[0]!.slice(0, 5);
    const name = fromIdescat(cells[1] ?? "");
    idescat.set(ine, { name, comarca: cells[2] ?? "", comarcaName: cells[3] ?? "" });
    byKey.set(`${ine.slice(0, 2)}|${nameKey(name)}`, ine);
  }
  if (idescat.size < 940) throw new Error(`Idescat: only ${idescat.size} municipalities`);

  const rows = ministry.rows.filter((r) => (PROVINCES as readonly string[]).includes(r.IDProvincia));
  if (rows.length !== ministry.rows.length) throw new Error("Ministry: stations outside the four provinces in the Catalonia filter");
  if (rows.length < 1000) throw new Error(`Ministry: only ${rows.length} stations`);

  // One entry per Ministry municipality id.
  const municipalities = new Map<string, FuelMunicipality>();
  const unmatched: string[] = [];
  for (const row of rows) {
    const existing = municipalities.get(row.IDMunicipio);
    if (existing) {
      existing.stations += 1;
      continue;
    }
    const province = row.IDProvincia as ProvinceCode;
    const renamed = RENAMED[row.Municipio.trim()];
    const ine = renamed && renamed.province === province ? renamed.ine : byKey.get(`${province}|${nameKey(fromMinistry(row.Municipio))}`);
    const official = ine ? idescat.get(ine) : undefined;
    if (!ine || !official) {
      unmatched.push(`${row.Municipio} (${province}, id ${row.IDMunicipio})`);
      continue;
    }
    if (renamed && nameKey(official.name) !== nameKey(renamed.now)) throw new Error(`${row.Municipio}: Idescat now calls ${ine} "${official.name}", not "${renamed.now}"`);
    municipalities.set(row.IDMunicipio, {
      id: row.IDMunicipio,
      ine,
      name: official.name,
      ministryName: row.Municipio.trim(),
      comarca: official.comarca,
      province,
      stations: 1,
    });
  }
  if (unmatched.length) throw new Error(`Unmatched Ministry municipalities (add them to RENAMED after checking Idescat):\n  ${[...new Set(unmatched)].join("\n  ")}`);

  const comarques: Record<string, string> = {};
  for (const { comarca, comarcaName } of idescat.values()) comarques[comarca] = comarcaName;

  const municipalitySnapshot: MunicipalitySnapshot = {
    readOn,
    ministryTimestamp: ministry.fecha,
    comarques: Object.fromEntries(Object.entries(comarques).sort(([a], [b]) => a.localeCompare(b))),
    municipalities: [...municipalities.values()].sort((a, b) => a.ine.localeCompare(b.ine)),
    sources: {
      prices: {
        name: "Instalaciones de suministro de combustibles a vehículos y embarcaciones con venta pública",
        publisher: "Ministerio para la Transición Ecológica y el Reto Demográfico",
        url: DATASET_URL,
        api: ministry.url,
        licence: "CC BY 4.0",
        licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
      },
      comarques: { name: "Codis de municipis i comarques", publisher: "Idescat", url: IDESCAT_COMARQUES },
    },
  };

  const stations: SnapshotStation[] = rows
    .map((r) => ({ id: r.IDEESS, brand: r["Rótulo"].trim(), address: r["Dirección"].trim(), municipality: r.IDMunicipio }))
    .sort((a, b) => Number(a.id) - Number(b.id));
  const stationSnapshot: StationSnapshot = { readOn, stations };

  // Which pages the new list gives, against the committed one.
  const before = new Set(selectPages().map((p) => `${p.kind}/${p.slug}`));
  const after = new Set(selectPages(municipalitySnapshot, stationSnapshot).map((p) => `${p.kind}/${p.slug}`));
  const removed = [...before].filter((p) => !after.has(p));
  const added = [...after].filter((p) => !before.has(p));

  console.log(`Ministry: ${rows.length} stations in ${municipalities.size} municipalities, Fecha ${ministry.fecha} (${ministry.url})`);
  for (const p of PROVINCES) console.log(`  ${p}: ${rows.filter((r) => r.IDProvincia === p).length}`);
  console.log(`Pages: ${after.size} per locale (${added.length} new, ${removed.length} gone)`);
  if (added.length) console.log(`  + ${added.join("\n  + ")}`);
  if (removed.length) console.log(`  - ${removed.join("\n  - ")}`);
  if (removed.length && !allowRemovals) {
    throw new Error("Pages would disappear (see above). Re-run with --allow-removals if that is intended, and redirect their URLs.");
  }

  writeFileSync(OUT_MUNICIPALITIES, `${JSON.stringify(municipalitySnapshot, null, 1)}\n`);
  writeFileSync(OUT_STATIONS, `${JSON.stringify(stationSnapshot, null, 1)}\n`);
  console.log(`Wrote ${OUT_MUNICIPALITIES} and ${OUT_STATIONS} (readOn ${readOn}).`);
}

function urls(): void {
  for (const entry of fuelFamilyPaths()) console.log(`https://www.catalunyainfo.com${entry.path}`);
}

const [command = "build", ...rest] = process.argv.slice(2);
if (command === "build") await build(rest.includes("--allow-removals"));
else if (command === "urls") urls();
else {
  console.error(`Unknown command "${command}". Use build or urls.`);
  process.exit(1);
}
