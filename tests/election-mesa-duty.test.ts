import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { MESA, MESA_29N } from "../src/lib/content/batch02/mesa.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { shortDate } from "../src/lib/content/holidays/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { JEZ, MESA_DUTY_CHECKED, MESA_DUTY_UNTIL, buildMesaDuty, jezFor } from "../src/lib/programmatic/elections/mesa-duty.ts";
import { buildElectionPage } from "../src/lib/programmatic/elections/model.ts";
import { municipalitiesFor } from "../src/lib/programmatic/elections/pages.ts";
import { POLLING } from "../src/lib/programmatic/elections/polling.ts";
import { SNAPSHOT } from "../src/lib/programmatic/elections/snapshot.ts";

/**
 * "Mesa electoral a <town>" (4 Nov 2026). The JEZ of each municipality comes
 * from `jez.json` (`scripts/elections-jez.py`: Generalitat register vevv-8fvw,
 * cross-checked against Justícia's 772x-hgsh/95tc-3cti and the Junta
 * Electoral Central's per-municipality pages); the dates and amounts from the
 * mesa guide (`MESA_29N`). The spot checks below were read by hand on the
 * JEC's "Junta Electoral de Zona que corresponde a cada municipio" that day.
 */

const bySlug = (slug: string) => SNAPSHOT.municipalities.find((m) => m.slug === slug)!;
const iso = (d: string) => d;
const JSON_PATH = new URL("../src/lib/programmatic/elections/jez.json", import.meta.url);

test("every one of the 947 municipalities maps to a JEZ and a judicial district", () => {
  const codes = SNAPSHOT.municipalities.map((m) => m.code);
  assert.equal(codes.length, 947);
  assert.deepEqual(Object.keys(JEZ.towns).sort(), [...codes].sort());
  assert.deepEqual(Object.keys(POLLING.municipalities).sort(), [...codes].sort(), "same towns as the polling places");
  for (const m of SNAPSHOT.municipalities) {
    const j = jezFor(m.code);
    assert.ok(j, `${m.code} ${m.name} has no JEZ`);
    assert.ok(buildMesaDuty(m, "ca", iso), `${m.name}: no section`);
  }
});

test("31 zone boards and 49 judicial districts, each seated in a municipality that belongs to it", () => {
  assert.equal(JEZ.boards.length, 31);
  assert.equal(JEZ.districts.length, 49);
  const seats = new Set(JEZ.boards.map((b) => b.seat));
  assert.equal(seats.size, 31);
  JEZ.boards.forEach((b, i) => {
    assert.equal(JEZ.towns[b.seat]?.[0], i, `the seat ${b.seat} belongs to its own JEZ`);
    assert.ok(b.address.length > 10, b.seat);
    assert.ok(b.phones.length > 0 && b.phones.every((p) => /^[6-9]\d{8}$/.test(p)), `${b.seat}: ${b.phones}`);
  });
  JEZ.districts.forEach((seat, i) => assert.equal(JEZ.towns[seat]?.[1], i, `the seat ${seat} belongs to its own district`));
  // Every board and district index is used, and a board's towns never span provinces.
  const used = new Set(Object.values(JEZ.towns).map(([b]) => b));
  assert.equal(used.size, 31);
  for (const [code, [b]] of Object.entries(JEZ.towns)) assert.equal(JEZ.boards[b]!.seat.slice(0, 2), code.slice(0, 2), code);
});

test("LOREG art. 8.6: the JEZ follows the 1979 districts, not today's (spot checks, JEC 4 Nov 2026)", () => {
  const expect: [string, string, string][] = [
    // slug, JEZ seat, current judicial district seat
    ["matadepera", "terrassa", "terrassa"],
    ["santa-coloma-de-gramenet", "barcelona", "santa-coloma-de-gramenet"],
    ["l-hospitalet-de-llobregat", "l-hospitalet-de-llobregat", "l-hospitalet-de-llobregat"],
    ["sant-boi-de-llobregat", "l-hospitalet-de-llobregat", "sant-boi-de-llobregat"],
    ["el-prat-de-llobregat", "l-hospitalet-de-llobregat", "el-prat-de-llobregat"],
    ["mollet-del-valles", "granollers", "mollet-del-valles"],
    ["abrera", "sant-feliu-de-llobregat", "martorell"],
    ["montblanc", "valls", "valls"],
    ["amposta", "tortosa", "amposta"],
    ["bossost", "vielha-e-mijaran", "vielha-e-mijaran"],
  ];
  for (const [slug, board, district] of expect) {
    const j = jezFor(bySlug(slug).code)!;
    assert.equal(j.boardSeat.slug, board, `${slug}: JEZ`);
    assert.equal(j.districtSeat.slug, district, `${slug}: judicial district`);
  }
  const differ = SNAPSHOT.municipalities.filter((m) => {
    const j = jezFor(m.code)!;
    return j.boardSeat.code !== j.districtSeat.code;
  });
  assert.equal(differ.length, 200);
});

test("the JSON stays compact: one line, no indentation, under 25 KB, official https sources", () => {
  const text = readFileSync(JSON_PATH, "utf8");
  assert.ok(text.length < 25_000, `${text.length} bytes`);
  assert.equal(text.trimEnd().split("\n").length, 1);
  assert.match(JEZ.readAt, /^2026-\d\d-\d\d$/);
  for (const [key, s] of Object.entries(JEZ.sources)) {
    assert.match(s.url, /^https:\/\/(analisi\.transparenciacatalunya\.cat|www\.juntaelectoralcentral\.es)\//, key);
    assert.match(s.sha256, /^[0-9a-f]{64}$/, key);
    assert.ok(s.name && s.publisher, key);
  }
});

test("the section reuses the mesa guide's facts, and the guide still prints them", () => {
  const words: Record<Locale, { money: string; hours: RegExp; age: RegExp }> = {
    ca: { money: `${MESA_29N.allowanceEur} €`, hours: /cinc hores|5 hores/, age: /65 anys/ },
    es: { money: `${MESA_29N.allowanceEur} €`, hours: /cinco horas|5 horas/, age: /65 años/ },
    en: { money: `€${MESA_29N.allowanceEur}`, hours: /five fewer hours|five hours|5 hours/, age: /age 65|65 or over/ },
  };
  for (const locale of LOCALES) {
    const guide = bodyToPlainText(MESA.editions[locale].blocks);
    const raw = JSON.stringify(MESA.editions[locale].blocks);
    for (const date of [MESA_29N.drawFrom, MESA_29N.drawTo, MESA_29N.noticeBy, MESA_29N.lastExcuseDay]) {
      assert.ok(guide.includes(shortDate(date, locale)), `${locale} guide: ${date}`);
    }
    assert.ok(guide.includes(words[locale].money), `${locale} guide: allowance`);
    assert.match(guide, words[locale].hours, `${locale} guide: hours off`);
    assert.match(guide, words[locale].age, `${locale} guide: 65`);
    assert.ok(raw.includes(MESA_29N.excuseApp), `${locale} guide: excuse platform`);

    const mesa = buildMesaDuty(bySlug("sabadell"), locale, iso)!;
    const all = [mesa.intro, ...mesa.rows.map((r) => r.value), mesa.pay.value].join(" ");
    assert.ok(all.includes(shortDate(MESA_29N.drawTo, locale)), `${locale}: draw end`);
    assert.ok(all.includes(shortDate(MESA_29N.noticeBy, locale)), `${locale}: notice`);
    assert.ok(all.includes(shortDate(MESA_29N.lastExcuseDay, locale)), `${locale}: last excuse day`);
    assert.ok(all.includes(shortDate(MESA_29N.dayAfter, locale)), `${locale}: Monday`);
    assert.ok(all.includes(words[locale].money), `${locale}: allowance`);
    assert.ok(all.includes(MESA_29N.excuseApp), `${locale}: excuse platform`);
    assert.ok(mesa.guide.includes(`](${b2href("mesa", locale)})`), `${locale}: links the mesa guide`);
    assert.ok(mesa.source.includes(MESA_DUTY_CHECKED), `${locale}: check date`);
  }
});

test("every town page in every language carries the section, its fact and its FAQ entry", () => {
  const titles: Record<Locale, RegExp> = { ca: /^Mesa electoral (a|al|als) /, es: /^Mesa electoral en /, en: /^Polling-station duty \(mesa electoral\) in / };
  for (const locale of LOCALES) {
    const towns = municipalitiesFor(locale);
    assert.equal(towns.length, locale === "en" ? 30 : 947);
    for (const m of towns) {
      const page = buildElectionPage(m, locale);
      const mesa = page.mesa!;
      assert.match(mesa.title, titles[locale], `${locale}/${m.slug}`);
      const j = jezFor(m.code)!;
      assert.ok(mesa.board.address === j.board.address, `${locale}/${m.slug}: address as the JEC writes it`);
      assert.ok(mesa.intro.includes(mesa.board.name.replace(/^Junta Electoral de Zona /, "")), `${locale}/${m.slug}: intro names the JEZ`);
      assert.deepEqual(page.faq.at(-1), mesa.faq, `${locale}/${m.slug}: FAQ (and so FAQPage JSON-LD) entry`);
      assert.ok(page.facts.some((f) => f.value === mesa.fact.value), `${locale}/${m.slug}: fact`);
      assert.equal(new Set(page.faq.map((f) => f.question)).size, page.faq.length, `${locale}/${m.slug}: unique questions`);
      // FAQ answers are printed as plain text: no inline markup.
      assert.doesNotMatch(mesa.faq.answer, /\*\*|\]\(/, `${locale}/${m.slug}`);
    }
  }
});

test("the note explains a JEZ outside today's judicial district", () => {
  const santBoi = buildMesaDuty(bySlug("sant-boi-de-llobregat"), "es", iso)!;
  assert.match(santBoi.board.note, /1979/);
  assert.match(santBoi.board.note, /L'Hospitalet de Llobregat\.$/);
  assert.match(buildMesaDuty(bySlug("el-prat-de-llobregat"), "ca", iso)!.board.note, /la de l'Hospitalet de Llobregat\.$/);
  assert.doesNotMatch(buildMesaDuty(bySlug("matadepera"), "ca", iso)!.board.note, /1979/);
  assert.match(buildMesaDuty(bySlug("terrassa"), "ca", iso)!.board.note, /^Terrassa és el cap del seu partit judicial/);
  assert.equal(buildMesaDuty(bySlug("terrassa"), "ca", iso)!.board.phones[0]!.href, "tel:+34936932900");
});

test("only the town's own row reaches the page: no client component imports the JEZ data", () => {
  const sabadell = JSON.stringify(buildMesaDuty(bySlug("sabadell"), "ca", iso));
  const others = JEZ.boards.filter((b) => b.seat !== jezFor(bySlug("sabadell").code)!.board.seat);
  for (const b of others) assert.ok(!sabadell.includes(b.address), `another JEZ's address: ${b.address}`);
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : /\.(tsx?|jsx?)$/.test(name) ? [path] : [];
    });
  for (const file of walk(new URL("../src", import.meta.url).pathname)) {
    const text = readFileSync(file, "utf8");
    if (!/^["']use client["']/m.test(text)) continue;
    assert.doesNotMatch(text, /mesa-duty|jez\.json/, `${file} is a client component importing the JEZ data`);
  }
});

test("the section is about 29N: rewrite or remove it once polling day is over", () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  assert.ok(
    today <= MESA_DUTY_UNTIL,
    `Today is ${today}: the "Mesa electoral a <town>" section (src/lib/programmatic/elections/mesa-duty.ts) is past polling day. Remove it from the town pages or rewrite it for the next election.`,
  );
});
