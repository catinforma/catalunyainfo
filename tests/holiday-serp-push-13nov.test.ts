import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { bodySchema, slugifyAnchor, type Block } from "../src/lib/content/blocks.ts";
import { addDays } from "../src/lib/content/holidays/calendar.ts";
import { COPY } from "../src/lib/content/holidays/copy.ts";
import { LOCAL_ORDER_CHECKED, LOCAL_TABLE_TOWNS, buildBody } from "../src/lib/content/holidays/publish.ts";
import { DECEMBER_BRIDGE, OUTSIDE_CATALONIA_TITLE } from "../src/lib/content/batch02/december-bridge.ts";
import { DECEMBER_BRIDGE_SPAIN } from "../src/lib/content/batch02/december-bridge-spain.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { workCalendarLine } from "../src/lib/programmatic/holidays/copy.ts";
import { councilApproved2027, councilApprovedTowns } from "../src/lib/programmatic/holidays/data.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";
import { CITIES, isZoned, local2027, localDays } from "../src/lib/programmatic/spain-2027/cities.ts";
import { cityAnswer } from "../src/lib/programmatic/spain-2027/city-copy.ts";
import { cityAnswerIntl } from "../src/lib/programmatic/spain-2027/city-copy-intl.ts";

/**
 * 13 Nov 2026 SERP push (docs/SEO_EXPERIMENTS.md): the work calendar's local
 * days of the largest towns and the calendar feeds, the hub and town pages
 * linking it in the body, the December bridge summary "which days, where four
 * days", and every Spain 2027 city page answering in its first line.
 */

type T = { type: string; text?: string; headers?: string[]; rows?: string[][]; note?: string; items?: { label: string; value: string }[]; title?: string };
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());

test("work calendar: the largest towns' 2027 local days, approved or not, then the calendar feeds", () => {
  for (const locale of LOCALES) {
    const body = buildBody(locale) as T[];
    assert.ok(bodySchema.safeParse(body).success, locale);
    const at = body.findIndex((b) => b.type === "heading" && b.text === COPY[locale].localTitle);
    assert.ok(at > 0, `${locale}: local heading`);
    const table = body.slice(at).find((b) => b.type === "table");
    assert.equal(table?.rows?.length, LOCAL_TABLE_TOWNS, locale);
    const bcn = table!.rows![0]!;
    assert.match(bcn[0]!, /Barcelona/, locale);
    // Barcelona's council days (Decret ANY2026-15675): 17 May and 24 September.
    assert.match(bcn[1]!, /17 (de )?(maig|mayo|May)/, locale);
    assert.match(bcn[1]!, /24 (de )?(setembre|septiembre|September)/, locale);
    // A town without a council decision read says so, and is never given days.
    for (const row of table!.rows!) {
      if (row[1] === COPY[locale].localNotYet) continue;
      assert.match(row[1]!, /\d/, `${locale}: ${row[0]}`);
    }
    const text = JSON.stringify(body.slice(at, at + 8));
    assert.ok(text.includes(String(councilApprovedTowns().length)), `${locale}: approved count`);
    assert.ok(text.includes("#afegeix-calendari"), `${locale}: feed example links the town page's calendar block`);
    // The first table points down to the section; the downloadable file does too.
    const local = `/${locale}/${COPY[locale].path}/#${slugifyAnchor(COPY[locale].localTitle)}`;
    assert.ok((body.find((b) => b.type === "table")?.note ?? "").includes(local), `${locale}: 2027 table note`);
    const cal = body.findIndex((b) => b.type === "calendar");
    assert.ok((body[cal + 1]?.text ?? "").includes(local), `${locale}: under the .ics file`);
  }
  assert.ok(councilApproved2027("barcelona"));
});

test("work calendar: the open data was read for the 2027 local order in the last 21 days", () => {
  assert.ok(today <= addDays(LOCAL_ORDER_CHECKED, 21), `re-read the Generalitat open data (b4eh-r8up) and the DOGC for the 2027 local order, then move LOCAL_ORDER_CHECKED (${LOCAL_ORDER_CHECKED})`);
  assert.ok(LOCAL_ORDER_CHECKED <= today, "LOCAL_ORDER_CHECKED is in the future");
});

test("holiday hub and town pages link the work calendar in their body", () => {
  for (const locale of LOCALES) assert.ok(workCalendarLine(locale).includes(`](${GUIDES.workCalendar[locale]})`), locale);
  const root = join(import.meta.dirname, "..", "src", "components", "programmatic", "holidays");
  for (const file of ["HubPage.tsx", "EnglishHubPage.tsx", "MunicipalityPage.tsx", "EnglishTownPage.tsx"]) {
    assert.match(readFileSync(join(root, file), "utf8"), /renderInline\(workCalendarLine\(/, file);
  }
});

test("December bridge, Spain: the summary opens with the bridge's holidays, the 4-day communities and Catalonia linked", () => {
  const catalan = { ca: "/ca/guies/pont-desembre-catalunya/", es: "/es/guias/puente-diciembre-cataluna/", en: "/en/guides/december-long-weekend-catalonia/" } as const;
  const label = { ca: /^Festius del pont de desembre$/, es: /^Festivos del puente de diciembre$/, en: /^The December bridge holidays$/ } as const;
  for (const locale of LOCALES) {
    const blocks = DECEMBER_BRIDGE_SPAIN.editions[locale].blocks as T[];
    const facts = blocks.find((b) => b.type === "keyFacts");
    assert.ok(facts, `${locale}: key facts`);
    assert.match(facts!.items![0]!.label, label[locale], locale);
    assert.match(facts!.items![1]!.label, /4/, `${locale}: four-day bridge`);
    assert.ok(facts!.items![2]!.value.includes(`](${catalan[locale]})`), `${locale}: Catalan page linked`);
    // The Catalan page's box sends national readers on with the query's words.
    const box = (DECEMBER_BRIDGE.editions[locale].blocks as Block[]).find((b) => b.type === "callout" && b.title === OUTSIDE_CATALONIA_TITLE[locale]);
    assert.match(JSON.stringify(box), /festius del pont de desembre|festivos del puente de diciembre|December 2026 bridge holidays/, locale);
  }
});

test("Spain 2027 city pages: the first line gives the two local days, or the status and where they are expected", () => {
  for (const c of CITIES) {
    const es = cityAnswer(c);
    const ca = cityAnswerIntl(c, "ca");
    const en = cityAnswerIntl(c, "en");
    for (const a of [es, ca, en]) assert.match(a.strong, /2027/, c.slug);
    if (local2027(c)) {
      const days = localDays(c);
      assert.ok(days.length >= 1, c.slug);
      for (const d of days) {
        const day = String(Number(d.date.slice(8, 10)));
        for (const a of [es, ca, en]) assert.ok(a.strong.includes(` ${day} `), `${c.slug}: ${d.date}`);
      }
      if (!isZoned(c)) assert.match(es.rest, /Las publica el /, c.slug);
    } else {
      assert.match(es.strong, /aún sin publicar/, c.slug);
      assert.match(ca.strong, /encara sense publicar/, c.slug);
      assert.match(en.strong, /not published yet/, c.slug);
      assert.match(es.rest, /Boletines consultados el /, c.slug);
    }
  }
  const vigo = CITIES.find((c) => c.slug === "vigo")!;
  // DOG núm. 204, de 26.10.2026; the Xunta's open data (calendario-laboral-2027, code 36057) agrees, read 13 Nov 2026.
  assert.equal(cityAnswer(vigo).strong, "Fiestas locales de Vigo en 2027: el lunes 29 de marzo y el lunes 16 de agosto.");
});
