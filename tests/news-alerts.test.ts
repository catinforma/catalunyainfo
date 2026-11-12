import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import {
  DECEMBER_BRIDGE_LAST_DAY,
  DECEMBER_BRIDGE_MONDAY,
  EXPIRED_STYLE_ID,
  NEWS_ALERTS,
  NEWS_ALERTS_LABEL,
  STRIKE_11N_ID,
  STRIKE_EDUCATION_ID,
  STRIKE_RAIL_ID,
  STRIKE_RENFE_23_ID,
  STRIKE_RENFE_ID,
  activeNewsAlerts,
  alertHref,
  buildNewsAlerts,
  daysPhrase,
  endOfMadridDay,
  madridMidnight,
  newsAlertsExpiryScript,
  nextDateLinks,
  type NewsAlert,
} from "../src/lib/alerts/news-alerts.ts";
import { DECEMBER_BRIDGE_SPAIN, SPAIN_DAYS } from "../src/lib/content/batch02/december-bridge-spain.ts";
import { B2_PATHS, type B2Article, type B2Key } from "../src/lib/content/batch02/shared.ts";
import { STRIKE_11N } from "../src/lib/content/batch02/strike-11n.ts";
import { STRIKE_EDUCATION_GUIDE, STRIKE_RENFE_GUIDE } from "../src/lib/content/batch02/strike-guides.ts";
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

test("the alerts and their windows, as of 11 Nov 2026: from the 12th, what comes after 11N", () => {
  assert.deepEqual(
    NEWS_ALERTS.map((a) => [a.id, a.target, a.start, a.end]),
    [
      ["strike-11n", "strike11n", "2026-11-04T00:00:00+01:00", "2026-11-12T00:00:00+01:00"],
      // SEMAF called off the 12th (notice of 10 Nov): the Renfe line ends with the 10th.
      ["strike-renfe", "strikeRenfe", "2026-11-04T00:00:00+01:00", "2026-11-11T00:00:00+01:00"],
      ["strike-rail-17n", "strikeRenfe", "2026-11-12T00:00:00+01:00", "2026-11-20T00:00:00+01:00"],
      // Same guide as the 17/19 line: it starts when that one ends.
      ["strike-renfe-23n", "strikeRenfe", "2026-11-20T00:00:00+01:00", "2026-11-24T00:00:00+01:00"],
      ["strike-education-26n", "strikeEducation", "2026-11-12T00:00:00+01:00", "2026-11-27T00:00:00+01:00"],
      ["election-29n", "voting", "2026-11-12T00:00:00+01:00", "2026-11-30T00:00:00+01:00"],
      // 12 Nov 2026: the day after the election, the December bridge until the end of the 8th.
      ["december-bridge", "decemberBridgeSpain", "2026-11-30T00:00:00+01:00", "2026-12-09T00:00:00+01:00"],
    ],
  );
  // The end of 11 Nov in Madrid is 23:00 UTC on the 11th.
  assert.equal(at(byId("strike-11n").end), Date.UTC(2026, 10, 11, 23, 0, 0));
});

test("the ends are derived from the source modules, not typed in", () => {
  assert.equal(byId("strike-11n").end, endOfMadridDay(lastDay(strike(STRIKE_11N_ID))));
  assert.equal(byId("strike-renfe").end, endOfMadridDay(lastDay(strike(STRIKE_RENFE_ID))));
  assert.equal(byId("strike-rail-17n").end, endOfMadridDay(lastDay(strike(STRIKE_RAIL_ID))));
  assert.equal(byId("strike-renfe-23n").end, endOfMadridDay(lastDay(strike(STRIKE_RENFE_23_ID))));
  assert.equal(byId("strike-education-26n").end, endOfMadridDay(lastDay(strike(STRIKE_EDUCATION_ID))));
  assert.equal(byId("election-29n").end, endOfMadridDay(GENERAL_ELECTION_DAY));
  assert.equal(byId("december-bridge").start, endOfMadridDay(GENERAL_ELECTION_DAY));
  assert.equal(DECEMBER_BRIDGE_MONDAY, SPAIN_DAYS.monday);
  assert.equal(DECEMBER_BRIDGE_LAST_DAY, SPAIN_DAYS.immaculada);
  assert.equal(byId("december-bridge").end, endOfMadridDay(SPAIN_DAYS.immaculada));
});

test("a day called off in strikes.ts moves the end and the wording; a strike removed drops its line", () => {
  const edited: Strike[] = STRIKES.map((s) => (s.id === STRIKE_RAIL_ID ? { ...s, dates: ["2026-11-17"] } : s));
  const rail = byId("strike-rail-17n", buildNewsAlerts(edited));
  assert.equal(rail.end, "2026-11-18T00:00:00+01:00");
  assert.equal(rail.text.ca, "Vaga de trens el dimarts 17 de novembre: Renfe, Adif i serveis mínims");
  assert.doesNotMatch(rail.text.es, /19/);
  // The next line to the same guide starts when it ends.
  assert.equal(byId("strike-renfe-23n", buildNewsAlerts(edited)).start, "2026-11-18T00:00:00+01:00");

  const without = buildNewsAlerts(STRIKES.filter((s) => s.id !== STRIKE_11N_ID && s.id !== STRIKE_EDUCATION_ID));
  assert.deepEqual(without.map((a) => a.id), ["strike-renfe", "strike-rail-17n", "strike-renfe-23n", "election-29n", "december-bridge"]);
  // A strike whose days are all before the line's start drops its line.
  const early: Strike[] = STRIKES.map((s) => (s.id === STRIKE_EDUCATION_ID ? { ...s, dates: ["2026-11-11"] } : s));
  assert.ok(!buildNewsAlerts(early).some((a) => a.id === "strike-education-26n"));

  const moved = byId("election-29n", buildNewsAlerts(STRIKES, "2026-12-06"));
  assert.equal(moved.end, "2026-12-07T00:00:00+01:00");
  assert.match(moved.text.ca, /el diumenge 6 de desembre/);
});

/* -------------------------------------------------------------------------- */
/* Windows                                                                    */
/* -------------------------------------------------------------------------- */

test("each line is shown only inside its window, in Madrid time; each disappears after its day", () => {
  const next = ["strike-rail-17n", "strike-education-26n", "election-29n"];
  assert.deepEqual(ids("2026-11-03T23:59:59+01:00"), []);
  assert.deepEqual(ids("2026-11-04T00:00:00+01:00"), ["strike-11n", "strike-renfe"]);
  assert.deepEqual(ids("2026-11-10T23:59:59+01:00"), ["strike-11n", "strike-renfe"]);
  assert.deepEqual(ids("2026-11-11T00:00:00+01:00"), ["strike-11n"]);
  assert.deepEqual(ids("2026-11-11T23:59:59.999+01:00"), ["strike-11n"]);
  // 23:30 UTC on the 11th is already the 12th in Madrid.
  assert.deepEqual(ids("2026-11-11T23:30:00Z"), next);
  assert.deepEqual(ids("2026-11-12T00:00:00+01:00"), next);
  assert.deepEqual(ids("2026-11-19T23:59:59+01:00"), next);
  assert.deepEqual(ids("2026-11-20T00:00:00+01:00"), ["strike-renfe-23n", "strike-education-26n", "election-29n"]);
  assert.deepEqual(ids("2026-11-23T23:59:59+01:00"), ["strike-renfe-23n", "strike-education-26n", "election-29n"]);
  assert.deepEqual(ids("2026-11-24T00:00:00+01:00"), ["strike-education-26n", "election-29n"]);
  assert.deepEqual(ids("2026-11-27T00:00:00+01:00"), ["election-29n"]);
  assert.deepEqual(ids("2026-11-29T23:59:59+01:00"), ["election-29n"]);
  assert.deepEqual(ids("2026-11-30T00:00:00+01:00"), ["december-bridge"]);
  assert.deepEqual(ids("2026-12-08T23:59:59+01:00"), ["december-bridge"]);
  assert.deepEqual(ids("2026-12-09T00:00:00+01:00"), []);
  // Not on the page it links to.
  assert.deepEqual(ids("2026-12-01T12:00:00+01:00", "es", "/es/guias/puente-diciembre-espana/"), []);
  // Never two lines to one page at once.
  for (let day = 4; day <= 30; day++) {
    const instant = at(`2026-11-${String(day).padStart(2, "0")}T12:00:00+01:00`);
    const targets = NEWS_ALERTS.filter((a) => at(a.start) <= instant && instant < at(a.end)).map((a) => a.target);
    assert.equal(new Set(targets).size, targets.length, `${day} Nov: ${targets.join(", ")}`);
  }
});

test("the 11N pages' upcoming block: the strip's next lines, as of the page's date, one per guide", () => {
  const ca = nextDateLinks("ca", "2026-11-11");
  assert.deepEqual(ca, [
    "[Vaga de trens el dimarts 17 i el dijous 19 de novembre: Renfe, Adif i serveis mínims](/ca/guies/vaga-renfe-rodalies-novembre/)",
    "[Vaga a l'educació a Catalunya el dijous 26 de novembre: hi ha escola?](/ca/guies/vaga-educacio-novembre/)",
    "[Eleccions generals el diumenge 29 de novembre: on i com votar](/ca/guies/com-votar-eleccions-catalunya/)",
  ]);
  // The same in the "upcoming", "day" and "past" states of the 11N pages.
  assert.deepEqual(nextDateLinks("ca", "2026-11-10"), ca);
  assert.deepEqual(nextDateLinks("ca", "2026-11-12"), ca);
  for (const locale of LOCALES) {
    const links = nextDateLinks(locale, "2026-11-12");
    assert.equal(links.length, 3, locale);
    for (const [i, key] of (["strikeRenfe", "strikeEducation", "voting"] as const).entries()) {
      assert.ok(links[i]?.endsWith(`](/${locale}/${B2_PATHS[key][locale]}/)`), `${locale} ${key}: ${links[i]}`);
    }
  }
  // After the 19th the Renfe guide's item is the 23 Nov strike; each item goes after its day.
  assert.match(nextDateLinks("es", "2026-11-20")[0] ?? "", /^\[Huelga de maquinistas el lunes 23 de noviembre/);
  assert.equal(nextDateLinks("en", "2026-11-27").length, 1);
  assert.deepEqual(nextDateLinks("en", "2026-11-30"), []);
});

/* -------------------------------------------------------------------------- */
/* Links                                                                      */
/* -------------------------------------------------------------------------- */

/** The article each alert links to, as registered with the publish route. */
const ARTICLES: Partial<Record<B2Key, { article: B2Article; constName: string }>> = {
  strike11n: { article: STRIKE_11N, constName: "STRIKE_11N" },
  strikeRenfe: { article: STRIKE_RENFE_GUIDE, constName: "STRIKE_RENFE_GUIDE" },
  strikeEducation: { article: STRIKE_EDUCATION_GUIDE, constName: "STRIKE_EDUCATION_GUIDE" },
  voting: { article: VOTING, constName: "VOTING" },
  decemberBridgeSpain: { article: DECEMBER_BRIDGE_SPAIN, constName: "DECEMBER_BRIDGE_SPAIN" },
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
  assert.deepEqual(ids("2026-11-20T12:00:00+01:00", "en", "/en/guides/how-to-vote-catalonia/"), ["strike-renfe-23n", "strike-education-26n"]);
  assert.deepEqual(ids("2026-11-13T12:00:00+01:00", "ca", "/ca/guies/vaga-educacio-novembre/"), ["strike-rail-17n", "election-29n"]);
});

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

test("the copy names the day, never 'today', and stays short and calm", () => {
  assert.equal(byId("strike-11n").text.ca, "Vaga general el dimecres 11 de novembre: què funciona i serveis mínims");
  assert.equal(byId("strike-11n").text.es, "Huelga general el miércoles 11 de noviembre: qué funciona y servicios mínimos");
  assert.equal(byId("strike-11n").text.en, "General strike on Wednesday 11 November: what runs and minimum services");
  assert.equal(byId("strike-renfe").text.ca, "Vaga de Renfe el dimarts 10 de novembre: Rodalies i serveis mínims");
  assert.equal(byId("strike-renfe").text.es, "Huelga de Renfe el martes 10 de noviembre: Rodalies y servicios mínimos");
  assert.equal(byId("strike-renfe").text.en, "Renfe strike on Tuesday 10 November: Rodalies and minimum services");
  assert.equal(byId("strike-rail-17n").text.ca, "Vaga de trens el dimarts 17 i el dijous 19 de novembre: Renfe, Adif i serveis mínims");
  assert.equal(byId("strike-rail-17n").text.es, "Huelga de trenes el martes 17 y el jueves 19 de noviembre: Renfe, Adif y servicios mínimos");
  assert.equal(byId("strike-rail-17n").text.en, "Rail strike on Tuesday 17 and Thursday 19 November: Renfe, Adif and minimum services");
  assert.equal(byId("strike-renfe-23n").text.ca, "Vaga de maquinistes el dilluns 23 de novembre: Renfe, Rodalies i serveis mínims");
  assert.equal(byId("strike-education-26n").text.ca, "Vaga a l'educació a Catalunya el dijous 26 de novembre: hi ha escola?");
  assert.equal(byId("strike-education-26n").text.es, "Huelga educativa en Cataluña el jueves 26 de noviembre: ¿hay colegio?");
  assert.equal(byId("strike-education-26n").text.en, "Catalonia education strike on Thursday 26 November: is there school?");
  assert.equal(byId("election-29n").text.ca, "Eleccions generals el diumenge 29 de novembre: on i com votar");
  assert.equal(byId("election-29n").text.es, "Elecciones generales el domingo 29 de noviembre: dónde y cómo votar");
  assert.equal(byId("election-29n").text.en, "General election on Sunday 29 November: how and where to vote");
  assert.equal(byId("december-bridge").text.ca, "Pont de desembre: on és festiu el dilluns 7 de desembre");
  assert.equal(byId("december-bridge").text.es, "Puente de diciembre: dónde es festivo el lunes 7 de diciembre");
  assert.equal(byId("december-bridge").text.en, "December bridge: where it is a holiday on Monday 7 December");

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
  // Nothing hidden; only the phone rule (first open line only) is written.
  assert.equal((css ?? "").split("@media")[0], "");
  assert.match(css ?? "", /^@media \(max-width:767\.98px\)\{\.ci-alerts li:is\(\[data-alert="/);
  assert.deepEqual(timers, [at("2026-11-11T00:00:00+01:00") - at("2026-11-05T12:00:00+01:00") + 1000]);
});

test("the expiry script hides ended lines, and the strip once none is left", () => {
  const after11 = runExpiry("2026-11-12T08:00:00+01:00");
  assert.match(after11.css ?? "", /^\[data-alert="strike-11n"\],\[data-alert="strike-renfe"\]\{display:none\}/);
  const [hidden11 = "", phones11 = ""] = (after11.css ?? "").split("@media");
  assert.doesNotMatch(hidden11, /\[data-alert="strike-rail-17n"\]/);
  // On phones the first line still open (rail 17/19 Nov) is the one kept: ended lines are not in the rule.
  assert.match(phones11, /\[data-alert="strike-rail-17n"\]/);
  assert.doesNotMatch(phones11, /\[data-alert="strike-11n"\]/);
  assert.match(after11.css ?? "", /\.ci-alerts:not\(:has\(li:not\(\[data-alert="strike-11n"\]\):not\(\[data-alert="strike-renfe"\]\)\)\)\{display:none\}/);
  assert.equal(after11.timers.length, 1);

  // 12 Nov 2026: the December bridge line is the last one; it ends with 8 Dec.
  const afterAll = runExpiry("2026-12-09T00:00:00+01:00");
  for (const alert of NEWS_ALERTS) assert.match(afterAll.css ?? "", new RegExp(`\\[data-alert="${alert.id}"\\]`));
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

test("expiry script: on phones only the first line that has not ended shows", () => {
  const script = newsAlertsExpiryScript();
  assert.match(script, /@media \(max-width:767\.98px\)\{\.ci-alerts li:is\('\+on\.join\(','\)\+'\)~li\{display:none\}\}/);
});
