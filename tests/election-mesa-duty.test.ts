import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CATALONIA_JEZ, MESA, MESA_29N } from "../src/lib/content/batch02/mesa.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { shortDate } from "../src/lib/content/holidays/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { JEZ, MESA_72H, MESA_HELD_FROM, MESA_DUTY_CHECKED, MESA_DUTY_UNTIL, buildMesaDuty, jezFor, mesaStage } from "../src/lib/programmatic/elections/mesa-duty.ts";
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

/**
 * 6 Nov 2026: the Spanish mesa guide speaks for all of Spain, and what only
 * applies in Catalonia (the 31 Juntas Electorales de Zona, the DOGC voter
 * leave) sits in a section of its own. Its counts come from `jez.json`.
 */
test("es mesa guide: national lead, a Catalonia section whose JEZ counts match the snapshot", () => {
  const perProvince = { barcelona: "08", girona: "17", lleida: "25", tarragona: "43" } as const;
  assert.equal(CATALONIA_JEZ.boards, JEZ.boards.length);
  for (const [name, prefix] of Object.entries(perProvince)) {
    assert.equal(CATALONIA_JEZ[name as keyof typeof perProvince], JEZ.boards.filter((b) => b.seat.startsWith(prefix)).length, name);
  }
  assert.equal(CATALONIA_JEZ.districts, JEZ.districts.length);
  const elsewhere = Object.values(JEZ.towns).filter(([b, d]) => JEZ.boards[b]!.seat !== JEZ.districts[d]).length;
  assert.equal(CATALONIA_JEZ.elsewhere, elsewhere);

  const es = MESA.editions.es;
  assert.match(es.seoTitle, /^Mesa electoral 29N/);
  assert.match(es.title, /elecciones generales del 29 de noviembre/);
  const blocks = es.blocks as unknown as { type: string; text?: string; level?: number; items?: string[] }[];
  assert.match(blocks[0]?.text ?? "", /mismas en toda España/);
  const at = blocks.findIndex((b) => b.type === "heading" && b.text === "Si te ha tocado mesa en Cataluña");
  assert.ok(at > 0, "Catalonia section");
  const items = (blocks[at + 1]?.items ?? []).join(" ");
  assert.match(items, /DOGC/);
  assert.ok(items.includes(`hay ${JEZ.boards.length} (`), "JEZ count");
  assert.ok(items.includes("](/es/elecciones/)"), "links the town pages");
  // The national work bullet no longer carries the Catalan detail.
  assert.doesNotMatch(bodyToPlainText(blocks.slice(0, at) as never), /DOGC|EMT\/178\/2023/);
  for (const locale of ["ca", "en"] as const) {
    assert.ok(!JSON.stringify(MESA.editions[locale].blocks).includes("Si te ha tocado mesa en Cataluña"), locale);
  }
});

/**
 * 25 Nov 2026 (docs/SEO_EXPERIMENTS.md, "25 Nov 2026 - 29N readiness"): from 15 Nov the seven
 * days to excuse yourself are over for anyone notified by 7 Nov, so the section stops
 * promising them and says what LOREG art. 27.4 leaves: 72 hours before 08:00 on polling day
 * (Thu 26 Nov 08:00), then "immediately and before the table is set up".
 */
test("mesa stage follows the clock: early before 15 Nov, late to Thu 26 Nov 07:59, last from 08:00", () => {
  assert.equal(mesaStage(undefined), "early");
  assert.equal(mesaStage(new Date("2026-11-14T23:30:00+01:00")), "early");
  assert.equal(mesaStage(new Date("2026-11-15T00:00:00+01:00")), "late");
  assert.equal(mesaStage(new Date("2026-11-25T10:00:00+01:00")), "late");
  assert.equal(mesaStage(new Date("2026-11-26T07:59:59+01:00")), "late");
  assert.equal(mesaStage(new Date("2026-11-26T08:00:00+01:00")), "last");
  assert.equal(mesaStage(new Date("2026-11-28T10:00:00+01:00")), "last");
  assert.equal(new Date("2026-11-29T08:00:00+01:00").getTime() - MESA_72H.getTime(), 72 * 3600 * 1000, "72 hours before 08:00 on polling day");
  assert.equal(mesaStage(new Date(Number.NaN)), "early");
});

test("after 14 Nov no town section promises the seven-day excuse; it names the 72-hour rule, in ca, es and en", () => {
  const stale: Record<Locale, RegExp> = {
    ca: /des d'aquell dia tens|si te la lliuren el dia/,
    es: /desde ese día tienes|si te la entregan el día/,
    en: /from that day you have|if it reaches you on/,
  };
  for (const [when, stage] of [["2026-11-25T10:00:00+01:00", "late"], ["2026-11-27T10:00:00+01:00", "last"]] as const) {
    const now = new Date(when);
    for (const locale of LOCALES) {
      for (const slug of ["sabadell", "terrassa", "bossost"]) {
        const mesa = buildMesaDuty(bySlug(slug), locale, iso, now)!;
        const all = [mesa.intro, ...mesa.rows.map((r) => `${r.label} ${r.value}`), mesa.faq.answer].join(" ");
        assert.doesNotMatch(all, stale[locale], `${locale}/${slug}/${stage}`);
        assert.match(all, /72/, `${locale}/${slug}/${stage}: the 72-hour rule`);
        assert.match(all, /27\.4/, `${locale}/${slug}/${stage}: LOREG art. 27.4`);
        assert.ok(all.includes(MESA_29N.excuseApp), `${locale}/${slug}/${stage}: platform for late notices`);
        assert.ok(all.includes(shortDate(MESA_29N.lastExcuseDay, locale)), `${locale}/${slug}/${stage}: 14 Nov in the past tense`);
        assert.doesNotMatch(mesa.faq.answer, /\*\*|\]\(/, "plain-text FAQ");
        if (stage === "late") assert.match(all, /26/, `${locale}/${slug}: Thursday 26 Nov`);
        else assert.match(all, /(de seguida|de inmediato|immediately)/, `${locale}/${slug}: immediately`);
      }
    }
  }
});

test("every town in every language builds the late and last sections, FAQ without markup", () => {
  for (const when of ["2026-11-25T10:00:00+01:00", "2026-11-26T09:00:00+01:00"]) {
    for (const locale of LOCALES) {
      for (const m of municipalitiesFor(locale)) {
        const page = buildElectionPage(m, locale, undefined, "before", new Date(when));
        assert.ok(page.mesa, `${locale}/${m.slug}`);
        assert.deepEqual(page.faq.at(-1), page.mesa!.faq, `${locale}/${m.slug}: FAQ is the mesa FAQ`);
        assert.doesNotMatch(page.mesa!.faq.answer, /\*\*|\]\(/, `${locale}/${m.slug}`);
        assert.ok(page.mesa!.intro.includes("27.4"), `${locale}/${m.slug}`);
      }
    }
  }
});

/**
 * 25 Nov 2026, round 2: from Sun 29 Nov 08:00 Madrid the tables are set up (LOREG art. 80.1), so the section
 * stops giving instructions and reports in the past tense until it is removed (`MESA_DUTY_UNTIL`).
 */
test("mesa stage held: from Sun 29 Nov 08:00 Madrid, to the second, and through 30 Nov", () => {
  assert.equal(MESA_HELD_FROM.getTime(), new Date("2026-11-29T07:00:00Z").getTime(), "08:00 CET is 07:00 UTC");
  assert.equal(mesaStage(new Date("2026-11-29T07:59:59+01:00")), "last");
  assert.equal(mesaStage(new Date("2026-11-29T08:00:00+01:00")), "held");
  assert.equal(mesaStage(new Date("2026-11-29T23:59:59+01:00")), "held");
  assert.equal(mesaStage(new Date("2026-11-30T10:00:00+01:00")), "held");
  assert.ok(MESA_DUTY_UNTIL >= "2026-11-30", "the held stage must cover the days the section still renders");
});

test("held stage: past tense, no instruction to file or to tell the board, keeps the board, the allowance and Monday", () => {
  const instruction: Record<Locale, RegExp> = {
    ca: /comunica-ho|avisa|de seguida|almenys 72|fins al dijous/i,
    es: /comunícalo|avisa|de inmediato|al menos 72|hasta el jueves/i,
    en: /tell the (board|\*\*Junta)|immediately|at least 72|by Thursday/i,
  };
  const past: Record<Locale, RegExp> = { ca: /es van reunir a les \*\*8\.00 del diumenge 29 de novembre\*\*/, es: /se reunieron a las \*\*8:00 del domingo 29 de noviembre\*\*/, en: /met at their polling place at \*\*08:00 on Sunday 29 November\*\*/ };
  for (const when of ["2026-11-29T08:00:00+01:00", "2026-11-29T15:00:00+01:00", "2026-11-30T10:00:00+01:00"]) {
    for (const locale of LOCALES) {
      for (const slug of ["sabadell", "terrassa", "bossost"]) {
        const mesa = buildMesaDuty(bySlug(slug), locale, iso, new Date(when))!;
        const all = [mesa.intro, ...mesa.rows.map((r) => `${r.label} ${r.value}`), mesa.faq.answer].join(" ");
        assert.match(mesa.intro, past[locale], `${locale}/${slug}/${when}`);
        assert.doesNotMatch(all, instruction[locale], `${locale}/${slug}/${when}: no instruction left`);
        assert.match(all, /80\.1/, `${locale}/${slug}: art. 80.1`);
        assert.ok(mesa.intro.includes("27.4"), `${locale}/${slug}: art. 27.4`);
        assert.ok(mesa.faq.answer.includes(mesa.board.address), `${locale}/${slug}: board address stays`);
        assert.ok(mesa.pay.value.includes(shortDate(MESA_29N.dayAfter, locale)), `${locale}/${slug}: Monday stays`);
        assert.doesNotMatch(mesa.faq.answer, /\*\*|\]\(/, "plain-text FAQ");
      }
    }
  }
});

test("every town in every language builds the held section", () => {
  for (const locale of LOCALES) {
    for (const m of municipalitiesFor(locale)) {
      const page = buildElectionPage(m, locale, undefined, "polling", new Date("2026-11-29T10:00:00+01:00"));
      assert.ok(page.mesa?.intro.includes("80.1"), `${locale}/${m.slug}`);
      assert.deepEqual(page.faq.at(-1), page.mesa!.faq, `${locale}/${m.slug}`);
    }
  }
});
