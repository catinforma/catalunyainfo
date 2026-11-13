import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATORS_ROOT } from "../src/lib/programmatic/calculators/paths.ts";
import { IPC_LOCALES, ipcEditions, ipcPath } from "../src/lib/programmatic/ipc/copy.ts";
import { IPC_SNAPSHOT } from "../src/lib/programmatic/ipc/data.ts";
import { flashAfter, ipcMeta, ipcSitemapEntries, leadText, nextText } from "../src/lib/programmatic/ipc/page.ts";
import {
  IPC_FROM,
  IPC_SERIES,
  IPC_SERIES_IDS,
  TABLE_MONTHS,
  buildIpc,
  calendarRows,
  hasCalendarFor,
  ipcCalendarUrl,
  ipcSeriesUrl,
  latestFigures,
  nextReleases,
  parseReleases,
  tableRows,
  type IpcData,
} from "../src/lib/programmatic/ipc/series.ts";
import { loadIpcData, type Fetcher } from "../src/lib/programmatic/ipc/server.ts";
import { SERIES, calendarUrl } from "../src/lib/programmatic/rent-update/ine.ts";

/**
 * "IPC hoy" (lib/programmatic/ipc/): the INE series and calendar parsing,
 * the committed snapshot, the never-ahead-of-release rule, the loader's
 * fallback, the page words and the routes.
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const today = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;

/** One INE calendar entry, released at 09:00 Madrid (08:00 UTC in winter). */
const entry = (name: string, year: number, month: number, day: string) => ({ Nombre: name, Anyo: year, FK_Periodo: month, Fecha: Date.parse(`${day}T08:00:00Z`) });

/* -------------------------------------------------------------------------- */
/* Date guards                                                                */
/* -------------------------------------------------------------------------- */

test("date guard: the committed IPC snapshot is at most 62 days old (npm run ipc:snapshot -- build)", () => {
  assert.ok(daysBetween(IPC_SNAPSHOT.asOf, today()) <= 62, `IPC snapshot from ${IPC_SNAPSHOT.asOf}: run \`npm run ipc:snapshot -- build\` and commit it.`);
});

test("date guard: from 10 Jan 2027 the snapshot has the INE's 2027 calendar", () => {
  if (today() < "2027-01-10") return;
  assert.ok(hasCalendarFor(IPC_SNAPSHOT.releases, 2027), "The INE's 2027 CPI release dates are not in the snapshot: run `npm run ipc:snapshot -- build` (the INE publishes its calendar in calendar 8 of its API); if the INE has not published it, say so in docs/SEO_EXPERIMENTS.md.");
});

/* -------------------------------------------------------------------------- */
/* Series and calendar                                                        */
/* -------------------------------------------------------------------------- */

test("series: the four INE codes, read 13 Nov 2026, and the calendar URL the rent and pension pages also use", () => {
  assert.deepEqual(
    IPC_SERIES_IDS.map((id) => IPC_SERIES[id].code),
    ["IPC290750", "IPC290752", "IPC292510", "IPC292512"],
  );
  assert.equal(IPC_SERIES.general.code, SERIES.ipc.code);
  assert.equal(ipcCalendarUrl(), calendarUrl(SERIES.ipc));
  assert.equal(ipcSeriesUrl(IPC_SERIES.core), "https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/IPC292510?date=20230101:");
  assert.match(IPC_SERIES.core.name, /^Nacional\. Subyacente: General sin alimentos no elaborados ni productos energéticos\. Variación anual\.$/);
});

test("calendar: flash and final releases, a re-release keeps its first day, other statistics are left out", () => {
  const json = [
    entry("Índice de Precios de Consumo. Avance. Noviembre 2026", 2026, 11, "2026-11-27"),
    entry("Índice de Precios de Consumo. Noviembre 2026", 2026, 11, "2026-12-15"),
    entry("Índice de Precios de Consumo. Octubre 2026", 2026, 10, "2026-11-13"),
    entry("Índice de Precios de Consumo. Octubre 2026", 2026, 10, "2027-02-18"),
    entry("Índice de Precios de Consumo. Avance.Mayo 2022", 2022, 5, "2022-05-30"),
    entry("Ponderaciones IPC. Año 2026", 2026, 1, "2026-01-30"),
    { Nombre: "Índice de Precios de Consumo. Roto", Anyo: "x", FK_Periodo: 1, Fecha: 0 },
  ];
  assert.deepEqual(parseReleases(json), [
    { kind: "flash", month: "2022-05", day: "2022-05-30" },
    { kind: "final", month: "2026-10", day: "2026-11-13" },
    { kind: "flash", month: "2026-11", day: "2026-11-27" },
    { kind: "final", month: "2026-11", day: "2026-12-15" },
  ]);
  assert.deepEqual(parseReleases(null), []);
});

test("never ahead of the INE: a value whose release day has not come is not shown", () => {
  const releases = parseReleases([entry("Índice de Precios de Consumo. Octubre 2026", 2026, 10, "2026-11-13"), entry("Índice de Precios de Consumo. Noviembre 2026", 2026, 11, "2026-12-15")]);
  const v = new Map([
    ["2026-10", 4.9],
    ["2026-11", 9.9],
  ]);
  const values = Object.fromEntries(IPC_SERIES_IDS.map((id) => [id, v])) as Parameters<typeof buildIpc>[0];
  const before = buildIpc(values, releases, "2026-12-14");
  assert.equal(latestFigures(before)?.month, "2026-10");
  assert.equal(before.series.general.find((p) => p.month === "2026-11")?.value, null);
  assert.equal(latestFigures(buildIpc(values, releases, "2026-12-15"))?.general, 9.9);
  // A month the calendar never released is never a row.
  const noDay = buildIpc(Object.fromEntries(IPC_SERIES_IDS.map((id) => [id, new Map([["2026-12", 1]])])) as Parameters<typeof buildIpc>[0], releases, "2027-03-01");
  assert.deepEqual(tableRows(noDay), []);
});

/* -------------------------------------------------------------------------- */
/* The snapshot                                                               */
/* -------------------------------------------------------------------------- */

test("snapshot: October 2026 from the INE (13 Nov 2026), every value dated on or before the snapshot day", () => {
  const latest = latestFigures(IPC_SNAPSHOT);
  assert.ok(latest);
  if (IPC_SNAPSHOT.asOf === "2026-11-13") {
    assert.deepEqual(latest, { month: "2026-10", published: "2026-11-13", general: 4.9, generalMonthly: 0.6, core: 3.1, coreMonthly: 0.6 });
  }
  for (const id of IPC_SERIES_IDS) {
    for (const p of IPC_SNAPSHOT.series[id]) {
      assert.ok(p.month >= IPC_FROM, `${id} ${p.month}`);
      if (p.value !== null) assert.ok(p.published !== null && p.published <= IPC_SNAPSHOT.asOf, `${id} ${p.month} released ${p.published}`);
      if (p.value !== null) assert.ok(p.value > -15 && p.value < 30);
    }
  }
  const rows = tableRows(IPC_SNAPSHOT);
  assert.equal(rows.length, TABLE_MONTHS);
  assert.equal(rows[0]!.month, latest.month);
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i]!.month < rows[i - 1]!.month);
  for (const r of rows) for (const id of IPC_SERIES_IDS) assert.notEqual(r.values[id], null, `${r.month} ${id}`);
});

test("calendar on 13 Nov 2026: next flash 27 Nov and final 15 Dec; 2026 months listed, the 2027 calendar not out yet", () => {
  const data: IpcData = IPC_SNAPSHOT;
  const next = nextReleases(data, "2026-11-13");
  assert.deepEqual(next, { flash: { kind: "flash", month: "2026-11", day: "2026-11-27" }, final: { kind: "final", month: "2026-11", day: "2026-12-15" } });
  const rows = calendarRows(data.releases, [2026, 2027]);
  assert.equal(rows[0]!.month, "2025-12");
  assert.deepEqual(rows.find((r) => r.month === "2026-12"), { month: "2026-12", flash: "2026-12-30", final: null });
  assert.deepEqual(rows.find((r) => r.month === "2026-10"), { month: "2026-10", flash: "2026-10-30", final: "2026-11-13" });
  if (IPC_SNAPSHOT.asOf === "2026-11-13") assert.equal(hasCalendarFor(data.releases, 2027), false);
  assert.match(nextText("es", data, "2026-11-13"), /adelantado de noviembre de 2026 el 27 de noviembre de 2026 y el definitivo de noviembre de 2026 el 15 de diciembre de 2026/);
});

/* -------------------------------------------------------------------------- */
/* Loader                                                                     */
/* -------------------------------------------------------------------------- */

test("loader: INE down → the dated snapshot; a live answer older than the snapshot is ignored", async () => {
  const down: Fetcher = async () => {
    throw new Error("timeout");
  };
  const off = await loadIpcData(new Date("2026-11-20T10:00:00Z"), down);
  assert.equal(off.liveCalendar, false);
  assert.deepEqual(off.series, IPC_SNAPSHOT.series);
  const calendar = IPC_SNAPSHOT.releases.map((r) => entry(`Índice de Precios de Consumo. ${r.kind === "flash" ? "Avance. " : ""}X`, Number(r.month.slice(0, 4)), Number(r.month.slice(5)), r.day));
  const old: Fetcher = async (url) => new Response(JSON.stringify(url.includes("PUBLICACIONFECHA") ? calendar : { Data: [{ Anyo: 2024, FK_Periodo: 1, Valor: 3.4 }] }));
  const stale = await loadIpcData(new Date("2026-11-20T10:00:00Z"), old);
  assert.equal(stale.live.general, false);
  assert.equal(latestFigures(stale)?.month, latestFigures(IPC_SNAPSHOT)?.month);
});

test("loader: a new month appears on its release day, not before", async () => {
  const last = latestFigures(IPC_SNAPSHOT)!;
  const [y, m] = last.month.split("-").map(Number) as [number, number];
  const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  const release = IPC_SNAPSHOT.releases.find((r) => r.kind === "final" && r.month === nextMonth)?.day ?? `${nextMonth}-28`;
  const calendar = [...IPC_SNAPSHOT.releases.map((r) => entry(`Índice de Precios de Consumo. ${r.kind === "flash" ? "Avance. " : ""}X`, Number(r.month.slice(0, 4)), Number(r.month.slice(5)), r.day)), entry("Índice de Precios de Consumo. Y", Number(nextMonth.slice(0, 4)), Number(nextMonth.slice(5)), release)];
  const fetcher: Fetcher = async (url) => {
    if (url.includes("PUBLICACIONFECHA")) return new Response(JSON.stringify(calendar));
    const id = IPC_SERIES_IDS.find((i) => url.includes(IPC_SERIES[i].code))!;
    const data = IPC_SNAPSHOT.series[id].filter((p) => p.value !== null).map((p) => ({ Anyo: Number(p.month.slice(0, 4)), FK_Periodo: Number(p.month.slice(5)), Valor: p.value }));
    data.push({ Anyo: Number(nextMonth.slice(0, 4)), FK_Periodo: Number(nextMonth.slice(5)), Valor: 1.2 });
    return new Response(JSON.stringify({ Data: data }));
  };
  const dayBefore = new Date(Date.parse(`${release}T10:00:00Z`) - 86_400_000);
  assert.equal(latestFigures(await loadIpcData(dayBefore, fetcher))?.month, last.month);
  const on = await loadIpcData(new Date(`${release}T10:00:00Z`), fetcher);
  assert.equal(latestFigures(on)?.month, nextMonth);
  assert.equal(latestFigures(on)?.general, 1.2);
  assert.ok(on.live.general && on.liveCalendar);
});

/* -------------------------------------------------------------------------- */
/* Page words and routes                                                      */
/* -------------------------------------------------------------------------- */

test("page: titles and descriptions fit, the lead carries the INE's figures and day", () => {
  const latest = latestFigures(IPC_SNAPSHOT);
  for (const l of IPC_LOCALES) {
    const m = ipcMeta(l, latest);
    assert.ok(m.title.length <= 60, `${l} title ${m.title.length}: ${m.title}`);
    assert.ok(m.description.length <= 165, `${l} description ${m.description.length}: ${m.description}`);
    const e = ipcMeta(l, null);
    assert.ok(e.title.length <= 60 && e.description.length <= 165, l);
  }
  if (IPC_SNAPSHOT.asOf === "2026-11-13") {
    assert.equal(ipcMeta("es", latest).title, "IPC hoy: 4,9 % en octubre de 2026 y calendario del INE");
    assert.match(leadText("es", IPC_SNAPSHOT, "2026-11-13"), /^El IPC general subió un 4,9 % en los doce meses hasta octubre de 2026 y varió un \+0,6 % respecto al mes anterior; la inflación subyacente .* fue del 3,1 %\. Lo publicó el INE el 13 de noviembre de 2026\./);
    assert.match(leadText("ca", IPC_SNAPSHOT, "2026-11-13"), /fins a l'octubre de 2026/);
  }
  // A typed-in flash shows only for a month after the newest final one.
  const last = latestFigures(IPC_SNAPSHOT)!.month;
  assert.equal(flashAfter(IPC_SNAPSHOT, [{ month: last, value: 1, published: "2026-01-01", url: "x" }]), null);
  assert.equal(flashAfter(IPC_SNAPSHOT, [{ month: "2099-01", value: 1, published: "2099-01-30", url: "x" }])?.month, "2099-01");
});

test("routes: one static route per language, daily revalidation, never dynamicParams = false; sitemap and llms.txt", () => {
  assert.deepEqual(ipcEditions(), { es: "/es/calculadoras/ipc/", ca: "/ca/calculadores/ipc/", en: "/en/calculators/spain-inflation-cpi/" });
  for (const l of IPC_LOCALES) {
    const src = readFileSync(join(APP, CALCULATORS_ROOT[l], ipcPath(l).split("/")[3]!, "page.tsx"), "utf8");
    assert.match(src, new RegExp(`const LOCALE = "${l}";`));
    assert.match(src, /^export const revalidate = 86400;$/m);
    assert.match(src, /^export const dynamicParams = true;$/m);
  }
  const entries = ipcSitemapEntries();
  assert.equal(entries.length, 3);
  for (const x of entries) assert.deepEqual(Object.keys(x.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8"), /\.\.\.ipcSitemapEntries\(\)/);
  assert.match(readFileSync(join(ROOT, "src/lib/seo/llms.ts"), "utf8"), /hubs: ipcEditions\(\)/);
  const page = readFileSync(join(ROOT, "src/components/programmatic/ipc/IpcPage.tsx"), "utf8");
  assert.match(page, /<MoreCalculators current="ipc" locale=\{locale\} \/>/);
  assert.match(page, /calcPath\("pensions-2027", "es"\)/);
  assert.match(page, /calcPath\("rent-update", "es"\)/);
});
