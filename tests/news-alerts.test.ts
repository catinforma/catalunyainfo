import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import {
  EXPIRED_STYLE_ID,
  NEWS_ALERTS,
  NEWS_ALERTS_LABEL,
  STRIKE_11N_ID,
  STRIKE_RENFE_ID,
  activeNewsAlerts,
  alertHref,
  buildNewsAlerts,
  daysPhrase,
  endOfMadridDay,
  madridMidnight,
  newsAlertsExpiryScript,
  type NewsAlert,
} from "../src/lib/alerts/news-alerts.ts";
import { B2_PATHS, type B2Article, type B2Key } from "../src/lib/content/batch02/shared.ts";
import { STRIKE_11N } from "../src/lib/content/batch02/strike-11n.ts";
import { STRIKE_RENFE_GUIDE } from "../src/lib/content/batch02/strike-guides.ts";
import { STRIKES, lastDay, type Strike } from "../src/lib/content/batch02/strikes.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { GENERAL_ELECTION_DAY } from "../src/lib/programmatic/elections/today.ts";

/**
 * The sitewide alert strip (4 Nov 2026): what these pin is that every line is
 * shown only inside its window, decided in Madrid time, with dates taken from
 * strikes.ts and elections/today.ts; that each language links to that
 * language's published page; and that the browser-side script hides a line
 * once its end has passed on a page rendered before.
 */

const at = (iso: string) => Date.parse(iso);
const ids = (instant: string, locale: (typeof LOCALES)[number] = "ca", path?: string) =>
  activeNewsAlerts(locale, path, at(instant)).map((line) => line.id);
const byId = (id: string, alerts: readonly NewsAlert[] = NEWS_ALERTS) => {
  const alert = alerts.find((a) => a.id === id);
  assert.ok(alert, `alert ${id} exists`);
  return alert;
};
const strike = (id: string) => {
  const entry = STRIKES.find((s) => s.id === id);
  assert.ok(entry, `strike ${id} is in strikes.ts`);
  return entry;
};

/* -------------------------------------------------------------------------- */
/* End instants                                                               */
/* -------------------------------------------------------------------------- */

test("Madrid midnights carry the offset in force, across both clock changes", () => {
  assert.equal(madridMidnight("2026-11-12"), "2026-11-12T00:00:00+01:00");
  assert.equal(madridMidnight("2026-07-01"), "2026-07-01T00:00:00+02:00");
  // Clocks change at 02:00/03:00: midnight on the change day keeps the old offset.
  assert.equal(madridMidnight("2026-03-29"), "2026-03-29T00:00:00+01:00");
  assert.equal(madridMidnight("2026-03-30"), "2026-03-30T00:00:00+02:00");
  assert.equal(madridMidnight("2026-10-25"), "2026-10-25T00:00:00+02:00");
  assert.equal(madridMidnight("2026-10-26"), "2026-10-26T00:00:00+01:00");
  assert.equal(endOfMadridDay("2026-11-30"), "2026-12-01T00:00:00+01:00");
  assert.equal(endOfMadridDay("2026-12-31"), "2027-01-01T00:00:00+01:00");
});

test("the three alerts and their windows, as of 4 Nov 2026", () => {
  assert.deepEqual(
    NEWS_ALERTS.map((a) => [a.id, a.target, a.start, a.end]),
    [
      ["strike-11n", "strike11n", "2026-11-04T00:00:00+01:00", "2026-11-12T00:00:00+01:00"],
      ["strike-renfe", "strikeRenfe", "2026-11-04T00:00:00+01:00", "2026-11-13T00:00:00+01:00"],
      ["election-29n", "voting", "2026-11-13T00:00:00+01:00", "2026-11-30T00:00:00+01:00"],
    ],
  );
  // The end of 11 Nov in Madrid is 23:00 UTC on the 11th.
  assert.equal(at(byId("strike-11n").end), Date.UTC(2026, 10, 11, 23, 0, 0));
});

test("the ends are derived from the source modules, not typed in", () => {
  assert.equal(byId("strike-11n").end, endOfMadridDay(lastDay(strike(STRIKE_11N_ID))));
  assert.equal(byId("strike-renfe").end, endOfMadridDay(lastDay(strike(STRIKE_RENFE_ID))));
  assert.equal(byId("election-29n").end, endOfMadridDay(GENERAL_ELECTION_DAY));
});

test("a day called off in strikes.ts moves the end and the wording; a strike removed drops its line", () => {
  const edited: Strike[] = STRIKES.map((s) => (s.id === STRIKE_RENFE_ID ? { ...s, dates: ["2026-11-10"] } : s));
  const renfe = byId("strike-renfe", buildNewsAlerts(edited));
  assert.equal(renfe.end, "2026-11-11T00:00:00+01:00");
  assert.equal(renfe.text.ca, "Vaga de Renfe el dimarts 10 de novembre: Rodalies i serveis mínims");
  assert.doesNotMatch(renfe.text.es, /12/);

  const without = buildNewsAlerts(STRIKES.filter((s) => s.id !== STRIKE_11N_ID));
  assert.deepEqual(without.map((a) => a.id), ["strike-renfe", "election-29n"]);

  const moved = byId("election-29n", buildNewsAlerts(STRIKES, "2026-12-06"));
  assert.equal(moved.end, "2026-12-07T00:00:00+01:00");
  assert.match(moved.text.ca, /el diumenge 6 de desembre/);
});

/* -------------------------------------------------------------------------- */
/* Windows                                                                    */
/* -------------------------------------------------------------------------- */

test("each line is shown only inside its window, in Madrid time", () => {
  assert.deepEqual(ids("2026-11-03T23:59:59+01:00"), []);
  assert.deepEqual(ids("2026-11-04T00:00:00+01:00"), ["strike-11n", "strike-renfe"]);
  assert.deepEqual(ids("2026-11-04T10:00:00+01:00"), ["strike-11n", "strike-renfe"]);
  assert.deepEqual(ids("2026-11-11T23:59:59.999+01:00"), ["strike-11n", "strike-renfe"]);
  // 23:30 UTC on the 11th is already the 12th in Madrid.
  assert.deepEqual(ids("2026-11-11T23:30:00Z"), ["strike-renfe"]);
  assert.deepEqual(ids("2026-11-12T00:00:00+01:00"), ["strike-renfe"]);
  assert.deepEqual(ids("2026-11-12T23:59:59+01:00"), ["strike-renfe"]);
  assert.deepEqual(ids("2026-11-13T00:00:00+01:00"), ["election-29n"]);
  assert.deepEqual(ids("2026-11-29T23:59:59+01:00"), ["election-29n"]);
  assert.deepEqual(ids("2026-11-30T00:00:00+01:00"), []);
});

/* -------------------------------------------------------------------------- */
/* Links                                                                      */
/* -------------------------------------------------------------------------- */

/** The article each alert links to, as registered with the publish route. */
const ARTICLES: Partial<Record<B2Key, { article: B2Article; constName: string }>> = {
  strike11n: { article: STRIKE_11N, constName: "STRIKE_11N" },
  strikeRenfe: { article: STRIKE_RENFE_GUIDE, constName: "STRIKE_RENFE_GUIDE" },
  voting: { article: VOTING, constName: "VOTING" },
};

test("every line links to its guide's real path in the reader's language", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  for (const alert of NEWS_ALERTS) {
    const registered = ARTICLES[alert.target];
    assert.ok(registered, `${alert.id}: its target ${alert.target} is a known article`);
    assert.equal(registered.article.key, alert.target);
    assert.match(route, new RegExp(`publishB2Article\\(${registered.constName}\\)`), `${alert.id}: published by the publish route`);
    const hrefs = new Set<string>();
    for (const locale of LOCALES) {
      const href = alertHref(alert, locale);
      assert.equal(href, `/${locale}/${B2_PATHS[alert.target][locale]}/`);
      assert.equal(href, `/${locale}/${registered.article.editions[locale].path}/`, `${alert.id} ${locale}: the article's own path`);
      hrefs.add(href);
    }
    assert.equal(hrefs.size, LOCALES.length, `${alert.id}: one page per language`);
  }
});

test("the 11N line points at the 11N page in each language", () => {
  const line = (locale: (typeof LOCALES)[number]) => activeNewsAlerts(locale, undefined, at("2026-11-05T12:00:00+01:00"))[0];
  assert.equal(line("ca")?.href, "/ca/guies/vaga-general-11-novembre/");
  assert.equal(line("es")?.href, "/es/guias/huelga-general-11-noviembre/");
  assert.equal(line("en")?.href, "/en/guides/general-strike-11-november-spain/");
});

test("a line is not shown on the page it links to (with or without the trailing slash)", () => {
  const t = "2026-11-05T12:00:00+01:00";
  assert.deepEqual(ids(t, "es", "/es/guias/huelga-general-11-noviembre/"), ["strike-renfe"]);
  assert.deepEqual(ids(t, "ca", "/ca/guies/vaga-renfe-rodalies-novembre"), ["strike-11n"]);
  // Another language's page is not this page.
  assert.deepEqual(ids(t, "ca", "/es/guias/huelga-general-11-noviembre/"), ["strike-11n", "strike-renfe"]);
  assert.deepEqual(ids("2026-11-20T12:00:00+01:00", "en", "/en/guides/how-to-vote-catalonia/"), []);
});

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

test("the copy names the day, never 'today', and stays short and calm", () => {
  assert.equal(byId("strike-11n").text.ca, "Vaga general el dimecres 11 de novembre: què funciona i serveis mínims");
  assert.equal(byId("strike-11n").text.es, "Huelga general el miércoles 11 de noviembre: qué funciona y servicios mínimos");
  assert.equal(byId("strike-11n").text.en, "General strike on Wednesday 11 November: what runs and minimum services");
  assert.equal(byId("strike-renfe").text.ca, "Vaga de Renfe el dimarts 10 i el dijous 12 de novembre: Rodalies i serveis mínims");
  assert.equal(byId("strike-renfe").text.es, "Huelga de Renfe el martes 10 y el jueves 12 de noviembre: Rodalies y servicios mínimos");
  assert.equal(byId("strike-renfe").text.en, "Renfe strike on Tuesday 10 and Thursday 12 November: Rodalies and minimum services");
  assert.equal(byId("election-29n").text.ca, "Eleccions generals el diumenge 29 de novembre: on i com votar");
  assert.equal(byId("election-29n").text.es, "Elecciones generales el domingo 29 de noviembre: dónde y cómo votar");
  assert.equal(byId("election-29n").text.en, "General election on Sunday 29 November: how and where to vote");

  for (const alert of NEWS_ALERTS) {
    for (const locale of LOCALES) {
      const text = alert.text[locale];
      assert.doesNotMatch(text, /\b(avui|demà|hoy|mañana|today|tomorrow|tonight|ara mateix|ahora)\b|!|¡/i, `${alert.id} ${locale}`);
      assert.ok(text.length <= 90, `${alert.id} ${locale}: ${text.length} characters`);
    }
  }
  for (const locale of LOCALES) assert.ok(NEWS_ALERTS_LABEL[locale].length > 0);
});

test("the day phrase says the month once per run and crosses months", () => {
  assert.equal(daysPhrase(["2026-10-30", "2026-11-02"], "ca"), "el divendres 30 d'octubre i el dilluns 2 de novembre");
  assert.equal(daysPhrase(["2026-11-06", "2026-11-09", "2026-12-04"], "es"), "el viernes 6, el lunes 9 de noviembre y el viernes 4 de diciembre");
  assert.equal(daysPhrase(["2026-11-11"], "en"), "on Wednesday 11 November");
});

/* -------------------------------------------------------------------------- */
/* Browser-side expiry                                                        */
/* -------------------------------------------------------------------------- */

/** Runs the inline script against a fake document and clock. */
function runExpiry(instant: string) {
  const nodes = new Map<string, { id: string; textContent: string }>();
  const timers: number[] = [];
  const document = {
    getElementById: (id: string) => nodes.get(id) ?? null,
    createElement: () => ({ id: "", textContent: "" }),
    head: { appendChild: (node: { id: string; textContent: string }) => nodes.set(node.id, node) },
  };
  runInNewContext(newsAlertsExpiryScript(), {
    Date: { now: () => at(instant) },
    document,
    setTimeout: (_fn: unknown, ms: number) => timers.push(ms),
  });
  return { css: nodes.get(EXPIRED_STYLE_ID)?.textContent ?? null, timers };
}

test("the expiry script hides nothing before the first end and wakes up at it", () => {
  const { css, timers } = runExpiry("2026-11-05T12:00:00+01:00");
  assert.equal(css, "");
  assert.deepEqual(timers, [at("2026-11-12T00:00:00+01:00") - at("2026-11-05T12:00:00+01:00") + 1000]);
});

test("the expiry script hides ended lines, and the strip once none is left", () => {
  const after11 = runExpiry("2026-11-12T08:00:00+01:00");
  assert.match(after11.css ?? "", /^\[data-alert="strike-11n"\]\{display:none\}/);
  assert.doesNotMatch(after11.css ?? "", /\[data-alert="strike-renfe"\]\{/);
  assert.match(after11.css ?? "", /\.ci-alerts:not\(:has\(li:not\(\[data-alert="strike-11n"\]\)\)\)\{display:none\}/);
  assert.equal(after11.timers.length, 1);

  const afterAll = runExpiry("2026-11-30T00:00:00+01:00");
  for (const id of ["strike-11n", "strike-renfe", "election-29n"]) assert.match(afterAll.css ?? "", new RegExp(`\\[data-alert="${id}"\\]`));
  assert.deepEqual(afterAll.timers, []);
});

test("alert ids are unique and safe inside a CSS selector", () => {
  const all = NEWS_ALERTS.map((a) => a.id);
  assert.equal(new Set(all).size, all.length);
  for (const id of all) assert.match(id, /^[a-z0-9-]+$/);
  assert.doesNotMatch(newsAlertsExpiryScript(), /<\/?script/i);
});

/* -------------------------------------------------------------------------- */
/* Wiring                                                                     */
/* -------------------------------------------------------------------------- */

test("the strip is under every SiteHeader, the script runs before page content, and neither is client code", () => {
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
  const header = read("../src/components/SiteHeader.tsx");
  assert.match(header, /<\/header>\s*\{\/\*[\s\S]*?\*\/\}\s*<NewsAlerts locale=\{locale\} currentPath=\{translations\[locale\]\} \/>/);
  const layout = read("../src/app/(public)/[locale]/layout.tsx");
  assert.ok(layout.indexOf("<NewsAlertsExpiry />") > 0 && layout.indexOf("<NewsAlertsExpiry />") < layout.indexOf("{children}"));
  const component = read("../src/components/NewsAlerts.tsx");
  assert.doesNotMatch(component, /^["']use client["']/m);
  assert.doesNotMatch(read("../src/lib/alerts/news-alerts.ts"), /^["']use client["']/m);
});
