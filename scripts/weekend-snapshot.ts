/**
 * Builds the snapshot behind /ca/cap-de-setmana/ and /es/fin-de-semana/.
 *
 *   npm run weekend:snapshot -- build [--allow-removals]
 *       Reads, from the official sources:
 *         - the municipality register (analisi.transparenciacatalunya.cat,
 *           `wpyq-we8x`, ICGC): INE and Idescat codes, comarca and province of
 *           every municipality;
 *         - Idescat's "Marques turístiques" classification (comarques of the
 *           Costa Brava, Costa Daurada, Pirineus, Val d'Aran…);
 *         - the fairs calendar (`vm32-przc`, Departament d'Empresa i Treball):
 *           every fair that has not ended yet;
 *         - a year of the cultural agenda (`rhpv-yr4f`, Departament de
 *           Cultura), only to measure how many activities each zone had per
 *           weekend: the doorway guardrail (a zone ships only if three weekends
 *           in four had at least MIN_EVENTS). The agenda is not stored; the
 *           pages read it live from /api/weekend/agenda/.
 *       and writes src/lib/programmatic/weekend/snapshot.json.
 *       Refuses to write when a zone page that exists today would disappear
 *       (its volume fell below the guardrail) unless --allow-removals is given.
 *       Also prints the volume of the cities and comarques that do NOT have a
 *       page, so the threshold can be revisited with numbers.
 *
 *   npm run weekend:snapshot -- urls
 *       Prints every URL of the family (for IndexNow or Search Console).
 *
 * Re-run when the fairs calendar is updated (Socrata `rowsUpdatedAt` of
 * vm32-przc; the 2027 calendar is not published on 28 Oct 2026) and once a
 * quarter for the volumes.
 */

import { existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { addDays, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { weekendWindow } from "../src/lib/content/weekend/agenda.ts";
import { fromIdescat } from "../src/lib/programmatic/fuel/names.ts";
import { buildLookup, cleanWeb, compactEvents, municipalityNames } from "../src/lib/programmatic/weekend/compact.ts";
import { inZone, type LiveEvent } from "../src/lib/programmatic/weekend/live.ts";
import type { ProvinceCode, RegisterMunicipality, SnapshotFair, WeekendSnapshot, ZoneVolume } from "../src/lib/programmatic/weekend/types.ts";
import { MIN_EVENTS, ZONES, zoneFilter } from "../src/lib/programmatic/weekend/zones.ts";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "src/lib/programmatic/weekend/snapshot.json");

const SOCRATA = "https://analisi.transparenciacatalunya.cat";
const IDESCAT_BRANDS = "https://www.idescat.cat/codis/?id=50&n=37";

/**
 * Municipalities the agenda still writes under a former name, mapped to the
 * INE code of the current name (the code does not change with a rename). The
 * same renames the fuel snapshot checked against Idescat on 28 Oct 2026; the
 * build fails if the register gives any of these codes another name.
 */
const AGENDA_RENAMED: Record<string, { ine: string; now: string }> = {
  "bigues-i-riells": { ine: "08023", now: "Bigues i Riells del Fai" },
  "santa-maria-de-corco": { ine: "08254", now: "l'Esquirol" },
  brunyola: { ine: "17028", now: "Brunyola i Sant Martí Sapresa" },
  calonge: { ine: "17034", now: "Calonge i Sant Antoni" },
  "castell-platja-d-aro": { ine: "17048", now: "Castell d'Aro, Platja d'Aro i s'Agaró" },
  "roda-de-bara": { ine: "43131", now: "Roda de Berà" },
  "sant-carles-de-la-rapita": { ine: "43136", now: "la Ràpita" },
};

const PROVINCES: readonly ProvinceCode[] = ["08", "17", "25", "43"];

function todayInMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "user-agent": "CatalunyaInfo weekend snapshot (+https://www.catalunyainfo.com)", accept: "application/json, text/plain, */*" },
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

async function fetchJson<T>(url: string): Promise<T> {
  return JSON.parse(await fetchText(url)) as T;
}

/** Socrata's `rowsUpdatedAt`, as an ISO date in Madrid. */
async function updatedOn(id: string): Promise<string | null> {
  const meta = await fetchJson<{ rowsUpdatedAt?: number }>(`${SOCRATA}/api/views/${id}.json`);
  if (!meta.rowsUpdatedAt) return null;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date(meta.rowsUpdatedAt * 1000));
}

function quantile(sorted: readonly number[], q: number): number {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] ?? 0;
}

function measure(counts: readonly number[], fridays: readonly string[]): ZoneVolume {
  const sorted = [...counts].sort((a, b) => a - b);
  return {
    weekends: counts.length,
    from: fridays[0]!,
    to: fridays.at(-1)!,
    median: quantile(sorted, 0.5),
    p25: quantile(sorted, 0.25),
    min: sorted[0] ?? 0,
  };
}

async function build(allowRemovals: boolean): Promise<void> {
  const readOn = todayInMadrid();

  /* Register ----------------------------------------------------------------- */
  const registerRows = await fetchJson<Record<string, string>[]>(`${SOCRATA}/resource/wpyq-we8x.json?$limit=5000`);
  const municipalities: RegisterMunicipality[] = registerRows
    .map((r) => ({
      ine: r.codi_municipi_ine ?? "",
      idescat: r.codi_municipi ?? "",
      name: (r.municipi ?? "").trim(),
      comarca: r.codi_comarca ?? "",
      province: (r.codi_prov_ncia ?? "") as ProvinceCode,
    }))
    .sort((a, b) => a.ine.localeCompare(b.ine));
  for (const m of municipalities) {
    if (!/^\d{5}$/.test(m.ine) || !/^\d{6}$/.test(m.idescat) || m.idescat.slice(0, 5) !== m.ine) throw new Error(`Register: bad codes for ${JSON.stringify(m)}`);
    if (!PROVINCES.includes(m.province) || m.ine.slice(0, 2) !== m.province) throw new Error(`Register: bad province for ${m.name}`);
    if (!/^\d{2}$/.test(m.comarca) || !m.name) throw new Error(`Register: bad row ${JSON.stringify(m)}`);
  }
  if (municipalities.length < 940) throw new Error(`Register: only ${municipalities.length} municipalities`);
  const byIne = new Map(municipalities.map((m) => [m.ine, m]));

  const agendaAliases: Record<string, string> = {};
  for (const [slug, { ine, now }] of Object.entries(AGENDA_RENAMED)) {
    const m = byIne.get(ine);
    if (!m) throw new Error(`Register has no ${ine} (${now})`);
    if (m.name !== now) throw new Error(`Register calls ${ine} "${m.name}", not "${now}"`);
    agendaAliases[slug] = ine;
  }

  /* Idescat tourism brands ---------------------------------------------------- */
  const ssv = (await fetchText(`${IDESCAT_BRANDS}&f=ssv`)).replace(/^﻿/, "");
  const brands: WeekendSnapshot["brands"] = {};
  const comarques: Record<string, string> = {};
  let current: string | null = null;
  for (const line of ssv.split(/\r?\n/)) {
    const [level, code, name] = line.split(";");
    if (level === "Marca turística" && code && name) {
      current = code;
      brands[code] = { name: name.trim(), comarques: [] };
    } else if (level === "Comarca" && code && name && current) {
      brands[current]!.comarques.push(code);
      comarques[code] = name.trim();
    }
  }
  if (Object.keys(comarques).length !== 43) throw new Error(`Idescat brands: ${Object.keys(comarques).length} comarques, expected 43`);
  for (const m of municipalities) if (!comarques[m.comarca]) throw new Error(`Register comarca ${m.comarca} (${m.name}) is not in Idescat's list`);
  for (const zone of ZONES) {
    if (!zone.brands) continue;
    const fromIdescat = zone.brands.flatMap((b) => brands[b]?.comarques ?? []).sort();
    if (JSON.stringify(fromIdescat) !== JSON.stringify([...(zone.comarques ?? [])].sort())) {
      throw new Error(`${zone.id}: zones.ts lists ${zone.comarques?.join(",")}, Idescat ${zone.brands.join("+")} lists ${fromIdescat.join(",")}`);
    }
  }

  /* Fairs ------------------------------------------------------------------- */
  const fairRows = await fetchJson<Record<string, string>[]>(`${SOCRATA}/resource/vm32-przc.json?$limit=5000`);
  const fairs: SnapshotFair[] = [];
  for (const r of fairRows) {
    const start = (r.data_inici ?? "").slice(0, 10);
    const end = (r.data_fi ?? r.data_inici ?? "").slice(0, 10);
    if (!start || !end || end < readOn) continue;
    const ine = (r.codi_municipi_idescat ?? "").slice(0, 5);
    const m = byIne.get(ine);
    const province = (m?.province ?? ine.slice(0, 2)) as ProvinceCode;
    if (!PROVINCES.includes(province)) throw new Error(`Fair ${r.nom}: no province for ${ine}`);
    fairs.push({
      id: r.id_activitats_firals ?? `${r.nom}-${start}`,
      name: (r.nom ?? "").trim(),
      town: m?.name ?? fromIdescat(r.municipi ?? ""),
      ine: m ? ine : "",
      comarca: m?.comarca ?? r.codi_comarca ?? "",
      province,
      start,
      end,
      sector: (r.sector ?? "").trim(),
      sectorEs: (r.sector_castellano ?? r.sector ?? "").trim(),
      web: cleanWeb(r.p_gina_web),
      toConfirm: /^s[ií]$/i.test((r.dates_a_confirmar ?? "").trim()),
    });
  }
  fairs.sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end) || a.name.localeCompare(b.name, "ca"));
  if (fairRows.length < 100) throw new Error(`Fairs: only ${fairRows.length} rows`);

  /* A year of agenda weekends ------------------------------------------------- */
  // The 52 weekends that ended before today.
  let friday = readOn;
  while (weekdayIndex(friday) !== 5 || weekendWindow(friday).to >= readOn) friday = addDays(friday, -1);
  const fridays: string[] = [];
  for (let i = 0; i < 52; i++) fridays.unshift(addDays(friday, -7 * i));
  const windows = fridays.map((f) => weekendWindow(f));

  const where =
    `data_inici <= '${windows.at(-1)!.to}T23:59:59' AND data_fi >= '${windows[0]!.from}T00:00:00'` +
    ` AND (permanent IS NULL OR permanent != 'Sí') AND (modalitat IS NULL OR modalitat != 'Virtual')`;
  const history = await fetchJson<Record<string, string>[]>(
    `${SOCRATA}/resource/rhpv-yr4f.json?$select=codi,denominaci,espai,comarca_i_municipi,municipi,comarca,data_inici,data_fi,tags_categor_es,gratuita,url,linkbotoentrades` +
      `&$where=${encodeURIComponent(where)}&$order=data_inici&$limit=100000`,
  );
  if (history.length < 3000) throw new Error(`Agenda: only ${history.length} rows for a year`);

  const register = { municipalities, comarques, agendaAliases };
  const lookup = buildLookup(register);
  const names = municipalityNames(register);
  const perWeekend: LiveEvent[][] = windows.map((w) =>
    compactEvents(
      history.filter((r) => (r.data_inici ?? "").slice(0, 10) <= w.to && (r.data_fi ?? r.data_inici ?? "").slice(0, 10) >= w.from),
      w,
      lookup,
      names,
    ),
  );

  const volume: Record<string, ZoneVolume> = {};
  for (const zone of ZONES) {
    const filter = zoneFilter(zone);
    volume[zone.id] = measure(perWeekend.map((events) => events.filter((e) => inZone(e, filter)).length), fridays);
  }

  // The places without a page, for the record.
  const candidates = new Map<string, number[]>();
  perWeekend.forEach((events, i) => {
    for (const e of events) {
      for (const key of [e.ine ? `town ${e.ine} ${e.m}` : "", e.c ? `comarca ${e.c} ${comarques[e.c]}` : ""]) {
        if (!key) continue;
        const counts = candidates.get(key) ?? new Array<number>(windows.length).fill(0);
        counts[i]! += 1;
        candidates.set(key, counts);
      }
    }
  });
  const ranked = [...candidates.entries()]
    .map(([key, counts]) => ({ key, v: measure(counts, fridays) }))
    .sort((a, b) => b.v.p25 - a.v.p25 || b.v.median - a.v.median)
    .slice(0, 25);

  const snapshot: WeekendSnapshot = {
    readOn,
    sources: {
      agenda: {
        name: "Agenda cultural de Catalunya (per localitzacions)",
        publisher: "Departament de Cultura, Generalitat de Catalunya",
        url: `${SOCRATA}/d/rhpv-yr4f`,
        api: `${SOCRATA}/resource/rhpv-yr4f.json`,
        updated: await updatedOn("rhpv-yr4f"),
      },
      fairs: {
        name: "Calendari fires de Catalunya (fires i fires mercat)",
        publisher: "Departament d'Empresa i Treball, Generalitat de Catalunya",
        url: `${SOCRATA}/d/vm32-przc`,
        api: `${SOCRATA}/resource/vm32-przc.json`,
        updated: await updatedOn("vm32-przc"),
      },
      register: {
        name: "Caps de municipi de Catalunya georeferenciats",
        publisher: "Institut Cartogràfic i Geològic de Catalunya (ICGC)",
        url: `${SOCRATA}/d/wpyq-we8x`,
        api: `${SOCRATA}/resource/wpyq-we8x.json`,
        updated: await updatedOn("wpyq-we8x"),
      },
      brands: {
        name: "Marques turístiques (a partir de l'1-1-1994)",
        publisher: "Institut d'Estadística de Catalunya (Idescat)",
        url: IDESCAT_BRANDS,
        api: `${IDESCAT_BRANDS}&f=ssv`,
        updated: null,
      },
    },
    comarques: Object.fromEntries(Object.entries(comarques).sort(([a], [b]) => a.localeCompare(b))),
    brands,
    municipalities,
    agendaAliases,
    fairs,
    volume,
  };

  // Which zone pages the new volumes give, against the committed snapshot.
  const ships = (v: Record<string, ZoneVolume>) => new Set<string>(ZONES.filter((z) => (v[z.id]?.p25 ?? 0) >= MIN_EVENTS).map((z) => z.id));
  const after = ships(volume);
  let before = new Set<string>();
  if (existsSync(OUT)) {
    const { SNAPSHOT } = await import("../src/lib/programmatic/weekend/data.ts");
    before = ships(SNAPSHOT.volume);
  }
  const removed = [...before].filter((id) => !after.has(id));

  console.log(`Register: ${municipalities.length} municipalities (updated ${snapshot.sources.register.updated})`);
  console.log(`Fairs: ${fairRows.length} in the calendar, ${fairs.length} not yet over (updated ${snapshot.sources.fairs.updated})`);
  console.log(`Agenda: ${history.length} rows, weekends ${fridays[0]} to ${fridays.at(-1)} (updated ${snapshot.sources.agenda.updated})`);
  console.log("Zones (p25 / median / min activities per weekend):");
  for (const zone of ZONES) {
    const v = volume[zone.id]!;
    console.log(`  ${after.has(zone.id) ? "ship" : "HOLD"} ${zone.id}: ${v.p25} / ${v.median} / ${v.min}`);
  }
  console.log("Best places without a page (p25 / median):");
  for (const r of ranked) console.log(`  ${r.key}: ${r.v.p25} / ${r.v.median}`);
  if (removed.length) {
    console.log(`Zone pages that would disappear: ${removed.join(", ")}`);
    if (!allowRemovals) throw new Error("Re-run with --allow-removals if that is intended, and redirect their URLs.");
  }

  writeFileSync(OUT, `${JSON.stringify(snapshot, null, 1)}\n`);
  console.log(`Wrote ${OUT} (readOn ${readOn}).`);
}

async function urls(): Promise<void> {
  const { weekendFamilyPaths } = await import("../src/lib/programmatic/weekend/sitemap.ts");
  for (const entry of weekendFamilyPaths()) console.log(`https://www.catalunyainfo.com${entry.path}`);
}

const [command = "build", ...rest] = process.argv.slice(2);
if (command === "build") {
  await build(rest.includes("--allow-removals"));
} else if (command === "urls") {
  await urls();
} else {
  console.error(`Unknown command "${command}". Use build or urls.`);
  process.exit(1);
}
