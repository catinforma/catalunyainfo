import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { ANNOUNCED_2026_27, TRANSPORT_NADAL_AS_OF } from "../src/lib/content/batch02/christmas-transport.ts";
import { CHRISTMAS_LIGHTS } from "../src/lib/content/batch02/christmas-lights.ts";
import { DECEMBER_BRIDGE } from "../src/lib/content/batch02/december-bridge.ts";
import { DECEMBER_BRIDGE_SPAIN } from "../src/lib/content/batch02/december-bridge-spain.ts";
import { ANNOUNCED_2026, dateYear } from "../src/lib/content/batch02/festive.ts";
import { NEW_YEAR, NEW_YEAR_CHECKED, NEW_YEAR_META, NEW_YEAR_REREAD_BY, newYearLead, newYearRereadDue } from "../src/lib/content/batch02/new-year.ts";
import { B2_PATHS, type B2Article, type B2Key } from "../src/lib/content/batch02/shared.ts";
import { madridDate } from "../src/lib/content/batch02/strikes.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { dateContent, transportNoticeFor } from "../src/lib/programmatic/holidays/dates.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";

/**
 * December events cluster, 21 Nov 2026: the New Year's Eve guide's body
 * (night table, transport table, FAQ), its re-read guard, and the link lines
 * from the Christmas lights page, the December bridge pages, the fairs hub
 * and the Christmas/New Year date pages to Reis, New Year's Eve and the
 * Christmas transport page.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const href = (key: B2Key, locale: Locale) => `](/${locale}/${B2_PATHS[key][locale]}/)`;
const count = (article: B2Article, locale: Locale, key: B2Key) => JSON.stringify(article.editions[locale].blocks).split(href(key, locale)).length - 1;

/* -------------------------------------------------------------------------- */
/* New Year's Eve                                                             */
/* -------------------------------------------------------------------------- */

test("NYE: title, description and lead stay as they were (window to 23 Nov); the body says when it was checked", () => {
  const titles: Record<Locale, string> = {
    ca: "Cap d'Any Barcelona 2026: la revetlla a Montjuïc i el metro",
    es: "Nochevieja Barcelona 2026: fin de año en Montjuïc y metro",
    en: "New Year's Eve Barcelona 2026: Montjuïc fireworks, metro",
  };
  for (const locale of LOCALES) {
    assert.equal(NEW_YEAR_META[locale].seoTitle, titles[locale], locale);
    assert.equal(NEW_YEAR.editions[locale].blocks[0]!.type, "paragraph");
    assert.equal((NEW_YEAR.editions[locale].blocks[0] as { text: string }).text, newYearLead(locale), `${locale}: the lead is the pre-registered one`);
    assert.ok(text(NEW_YEAR.editions[locale].blocks.slice(1)).includes(dateYear(NEW_YEAR_CHECKED, locale)), `${locale}: the body's check date`);
  }
});

test("NYE: the 2025 night hour by hour and the transport of 31 December, each labelled with its year or season", () => {
  for (const locale of LOCALES) {
    const tables = NEW_YEAR.editions[locale].blocks.filter((b) => b.type === "table") as unknown as { caption: string; headers: string[]; rows: string[][]; note?: string }[];
    const night = tables.find((t) => t.headers[0]!.includes("2025"));
    assert.ok(night, `${locale}: the night table`);
    assert.ok(night!.rows.some((r) => r[0] === "23:50") && night!.rows.some((r) => r[0] === "22:00"), `${locale}: 22:00 and 23:50 rows`);
    assert.ok(night!.note?.includes(dateYear(NEW_YEAR_CHECKED, locale)), `${locale}: 2026-27 not out, with the check date`);
    const transport = tables.find((t) => t.rows.length === 6 && t.rows.some((r) => r[0]!.startsWith("FGC")));
    assert.ok(transport, `${locale}: the 31 December transport table`);
    const fgc = transport!.rows.find((r) => r[0]!.startsWith("FGC"))![1]!;
    if (ANNOUNCED_2026_27.fgc?.days.newYearsEve) assert.ok(fgc.includes("2026-27"), `${locale}: FGC from its 2026-27 notice`);
    for (const row of transport!.rows) assert.match(row[1]!, /2025|2026|2026-27|horari general|horario general|standing timetable|sense avís|sin aviso|no special notice/, `${locale}: ${row[0]} says where it comes from`);
    assert.ok(transport!.note?.includes(dateYear(TRANSPORT_NADAL_AS_OF, locale)), `${locale}: transport check date`);
  }
});

test("NYE: FAQ in the searched words, and no 2026-27 time while the show is not announced", () => {
  const questions: Record<Locale, string[]> = {
    ca: ["A quina hora són els focs de Cap d'Any a Barcelona?", "Quina és la parada de metro més propera a la festa de Cap d'Any?", "Funcionen Rodalies i FGC la nit de Cap d'Any?", "Què obre l'1 de gener a Barcelona?"],
    es: ["¿A qué hora son los fuegos artificiales de Nochevieja en Barcelona?", "¿Cuál es la parada de metro más cercana a la fiesta de Nochevieja?", "¿Funcionan Rodalies y FGC en Nochevieja?", "¿Qué abre el 1 de enero en Barcelona?"],
    en: ["What time are the New Year's Eve fireworks in Barcelona?", "Which metro station is nearest the New Year's Eve show?", "Do Rodalies and FGC trains run on New Year's Eve?", "What is open on 1 January in Barcelona?"],
  };
  for (const locale of LOCALES) {
    const faq = NEW_YEAR.editions[locale].blocks.find((b) => b.type === "faq") as unknown as { items: { question: string; answer: string }[] };
    for (const q of questions[locale]) assert.ok(faq.items.some((i) => i.question === q), `${locale}: ${q}`);
    const time = faq.items.find((i) => i.question === questions[locale][0])!.answer;
    if (!ANNOUNCED_2026.newYearShow) assert.ok(time.includes("2025") && time.includes("23:50"), `${locale}: last year's time, labelled`);
    // The NYE page keeps exactly one link to the transport page (the transport tests hold it to one).
    assert.equal(count(NEW_YEAR, locale, "christmasTransport"), 1, `${locale}: one link to the transport page`);
  }
});

test("NYE re-read: from 1, 15 and 29 December 2026 NEW_YEAR_CHECKED must have moved (or the show is announced)", () => {
  assert.deepEqual([...NEW_YEAR_REREAD_BY], ["2026-12-01", "2026-12-15", "2026-12-29"]);
  assert.equal(newYearRereadDue("2026-11-30"), null);
  assert.equal(newYearRereadDue("2026-12-01"), "2026-12-01");
  assert.equal(newYearRereadDue("2026-12-28"), "2026-12-15");
  assert.equal(newYearRereadDue("2027-01-02"), "2026-12-29");
  const today = madridDate(new Date());
  assert.ok(NEW_YEAR_CHECKED <= today, `NEW_YEAR_CHECKED (${NEW_YEAR_CHECKED}) is in the future`);
  const due = newYearRereadDue(today);
  if (due) {
    assert.ok(
      NEW_YEAR_CHECKED >= due,
      `On ${today} the New Year's Eve guide was last checked on ${NEW_YEAR_CHECKED}, before ${due}. Re-read the City Council's press room (tag nadal-2026, search "cap d'any") and barcelona.cat/nadal/ca/campanades-de-cap-dany; fill festive.ts ANNOUNCED_2026.newYearShow if the show is out, move NEW_YEAR_CHECKED in src/lib/content/batch02/new-year.ts, and publish ?only=nye.`,
    );
  }
});

/* -------------------------------------------------------------------------- */
/* Link lines (body only)                                                     */
/* -------------------------------------------------------------------------- */

test("link lines: the lights page and both December bridge pages send readers to transport, New Year's Eve and Reis", () => {
  for (const locale of LOCALES) {
    assert.equal(count(CHRISTMAS_LIGHTS, locale, "christmasTransport"), 1, `lights ${locale} -> transport`);
    assert.equal(count(CHRISTMAS_LIGHTS, locale, "newYear"), 1, `lights ${locale} -> NYE`);
    for (const key of ["christmasTransport", "newYear", "reis"] as const) assert.equal(count(DECEMBER_BRIDGE, locale, key), 1, `bridge ${locale} -> ${key}`);
    for (const key of ["christmasTransport", "reis"] as const) assert.equal(count(DECEMBER_BRIDGE_SPAIN, locale, key), 1, `Spain bridge ${locale} -> ${key}`);
    // Snippets untouched.
    for (const article of [CHRISTMAS_LIGHTS, DECEMBER_BRIDGE, DECEMBER_BRIDGE_SPAIN]) {
      const e = article.editions[locale];
      assert.ok(!e.seoDescription.includes("](/"), `${article.key} ${locale}: no link in the description`);
    }
  }
});

test("link lines: the fairs hub lists New Year's Eve and the transport page", () => {
  const hub = readFileSync(new URL("../src/components/programmatic/christmas-fairs/HubPage.tsx", import.meta.url), "utf8");
  const start = hub.indexOf("const guides = (");
  assert.ok(start > 0, "the guides list");
  const list = hub.slice(start, hub.indexOf(".map(", start));
  for (const key of ["reis", "newYear", "christmasTransport"]) assert.ok(list.includes(`"${key}"`), key);
});

test("link lines: the Christmas and New Year date pages link that night's transport (31 Dec: New Year's Eve)", () => {
  const days = ["2026-12-24", "2026-12-25", "2026-12-26", "2027-01-01", "2027-01-06"];
  for (const locale of LOCALES) {
    assert.equal(GUIDES.christmasTransport[locale], `/${locale}/${B2_PATHS.christmasTransport[locale]}/`, `${locale}: GUIDES path is the published one`);
    for (const iso of days) {
      const n = transportNoticeFor(iso, locale)!;
      assert.equal(n.href, GUIDES.christmasTransport[locale], `${iso} ${locale}`);
      assert.equal(dateContent(iso as never, locale).transportNotice?.href, n.href, `${iso} ${locale}: on the page`);
      assert.notEqual(dateContent(iso as never, locale).notice?.href, n.href, `${iso} ${locale}: not the same link twice`);
    }
    assert.equal(transportNoticeFor("2026-12-31", locale)!.href, GUIDES.newYear[locale]);
    assert.equal(dateContent("2026-12-31" as never, locale).transportNotice?.href, GUIDES.newYear[locale]);
    // Other date pages are untouched.
    for (const iso of ["2026-12-08", "2026-12-07", "2027-12-25"]) assert.equal(transportNoticeFor(iso, locale), undefined, iso);
  }
});

test("publish groups: the pages changed here go out with their existing groups", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  for (const [group, article] of [["reis-2027", "REIS"], ["transport-nadal", "CHRISTMAS_TRANSPORT"], ["nye", "NEW_YEAR"], ["llums-nadal", "CHRISTMAS_LIGHTS"], ["pont-desembre", "DECEMBER_BRIDGE"], ["puente-diciembre-espana", "DECEMBER_BRIDGE_SPAIN"]] as const) {
    assert.match(route, new RegExp(`wants\\("${group}"\\)\\) published\\.push\\(await publishB2Article\\(${article}\\)`), group);
  }
});
