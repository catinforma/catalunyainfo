import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  CALCULATOR_SESSION_KEY,
  CALCULATOR_USE_START,
  armCalculatorUse,
  commitCalculatorResult,
  reportCalculatorUse,
  resultSignature,
} from "../src/lib/analytics/calculator-use.ts";
import { OFFICIAL_DOMAINS, classifyLinkClick, officialDomain, type LinkClick } from "../src/lib/analytics/clicks.ts";
import { ANALYTICS_EVENTS, CALCULATOR_USE_IDS, track, type AnalyticsEvent } from "../src/lib/analytics/events.ts";
import { CALCULATOR_IDS } from "../src/lib/programmatic/calculators/paths.ts";
import { WHATSAPP_CHANNEL_URL } from "../src/lib/share/channel.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

/* ------------------------------------------------------- The contract --- */

test("the tracking plan's events are in the contract, and the never-wired external_link is gone", () => {
  for (const name of ["calculator_use", "whatsapp_channel_click", "share", "internal_search", "outbound_official_source_click", "ics_subscribe_click", "useful_feedback"]) {
    assert.ok(ANALYTICS_EVENTS.includes(name as never), name);
  }
  assert.ok(!ANALYTICS_EVENTS.includes("external_link" as never));
  assert.equal(new Set(ANALYTICS_EVENTS).size, ANALYTICS_EVENTS.length);
  // GA4 rules: snake_case, at most 40 characters, not a reserved prefix.
  for (const name of ANALYTICS_EVENTS) {
    assert.match(name, /^[a-z][a-z0-9_]{0,39}$/, name);
    assert.doesNotMatch(name, /^(ga_|google_|firebase_)/, name);
  }
});

test("every calculator in the registry with a tool reports calculator_use under its own id", () => {
  // The IPC page is a reference table with no inputs.
  const withTool = CALCULATOR_IDS.filter((id) => id !== "ipc");
  for (const id of withTool) assert.ok((CALCULATOR_USE_IDS as readonly string[]).includes(id), id);
});

test("track() is a silent no-op without gtag (no consent yet) and reports what it did", () => {
  const g = globalThis as { window?: unknown };
  const saved = g.window;
  const event: AnalyticsEvent = { name: "calculator_use", params: { calculator_id: "net-salary", locale: "es" } };
  try {
    delete g.window;
    assert.equal(track(event), false);
    g.window = {};
    assert.equal(track(event), false);
    const calls: unknown[][] = [];
    g.window = { gtag: (...args: unknown[]) => calls.push(args) };
    assert.equal(track(event), true);
    assert.deepEqual(calls, [["event", "calculator_use", { calculator_id: "net-salary", locale: "es" }]]);
    g.window = {
      gtag: () => {
        throw new Error("blocked");
      },
    };
    assert.equal(track(event), false);
  } finally {
    if (saved === undefined) delete g.window;
    else g.window = saved;
  }
});

/* --------------------------------------------------------- Link clicks --- */

const base: Omit<LinkClick, "href"> = {
  siteHost: "www.catalunyainfo.com",
  locale: "es",
  channelUrl: WHATSAPP_CHANNEL_URL,
  inSources: false,
  inCalculator: false,
};
const click = (href: string, extra: Partial<LinkClick> = {}) => classifyLinkClick({ ...base, href, ...extra });

test("our WhatsApp channel link is whatsapp_channel_click with its placement; another channel is not", () => {
  assert.deepEqual(click(WHATSAPP_CHANNEL_URL, { placement: "article_box" }), { name: "whatsapp_channel_click", params: { link_context: "article_box", locale: "es" } });
  assert.deepEqual(click(WHATSAPP_CHANNEL_URL, { placement: "footer", locale: "ca" }), { name: "whatsapp_channel_click", params: { link_context: "footer", locale: "ca" } });
  // Unknown or missing placement is reported, as "other", never as free text.
  assert.deepEqual(click(WHATSAPP_CHANNEL_URL, { placement: "<script>" })?.params, { link_context: "other", locale: "es" });
  assert.deepEqual(click(`${WHATSAPP_CHANNEL_URL}/`)?.name, "whatsapp_channel_click");
  // Rodalies' own channel, and share links to WhatsApp, are not ours.
  assert.equal(click("https://whatsapp.com/channel/0029Vav4hGTId7nPenKMuo2C"), null);
  assert.equal(click("https://wa.me/?text=Hola%20https%3A%2F%2Fwww.catalunyainfo.com%2Fes%2F"), null);
});

test("calendar feed links: webcal is apple, Google's add-by-URL is google, the .ics file is download", () => {
  assert.deepEqual(click("webcal://www.catalunyainfo.com/ics/ca/sabadell.ics"), { name: "ics_subscribe_click", params: { method: "apple", locale: "es" } });
  const google = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent("webcal://www.catalunyainfo.com/ics/es/2027/madrid/madrid.ics")}`;
  assert.deepEqual(click(google), { name: "ics_subscribe_click", params: { method: "google", locale: "es" } });
  assert.deepEqual(click("https://www.catalunyainfo.com/ics/en/sabadell.ics"), { name: "ics_subscribe_click", params: { method: "download", locale: "es" } });
  // Not a feed: an ordinary internal link, a Google Calendar link to something else, another site's webcal.
  assert.equal(click("https://www.catalunyainfo.com/ca/festius/sabadell/"), null);
  assert.equal(click("https://calendar.google.com/calendar/render?cid=webcal%3A%2F%2Fexample.com%2Fx.ics"), null);
  assert.equal(click("webcal://example.com/ics/x.ics"), null);
});

test("official sources: a listed source always counts; elsewhere only an official domain does, by host only", () => {
  assert.deepEqual(click("https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430&p=20251231#a37"), {
    name: "outbound_official_source_click",
    params: { link_domain: "boe.es", link_context: "content", locale: "es" },
  });
  assert.deepEqual(click("https://sede.sepe.gob.es/portalSede/procedimientos-y-servicios/personas/proteccion-por-desempleo/simulador", { inCalculator: true })?.params, {
    link_domain: "sede.sepe.gob.es",
    link_context: "calculator",
    locale: "es",
  });
  // A council on a bare .cat domain counts when it is a listed source.
  assert.deepEqual(click("https://www.sabadell.cat/ca/festes", { inSources: true })?.params, { link_domain: "sabadell.cat", link_context: "sources", locale: "es" });
  assert.equal(click("https://www.sabadell.cat/ca/festes"), null);
  // Not official, not a listed source: left to GA4's own outbound `click`.
  assert.equal(click("https://commons.wikimedia.org/wiki/File:x.jpg"), null);
  assert.equal(click("mailto:hola@example.com"), null);
  assert.equal(click("tel:+34900000000"), null);
  assert.equal(click("not a url"), null);
});

test("official-domain matching is by whole labels, so look-alike hosts do not pass", () => {
  assert.equal(officialDomain("www.boe.es"), "boe.es");
  assert.equal(officialDomain("TREBALL.GENCAT.CAT"), "treball.gencat.cat");
  assert.equal(officialDomain("notboe.es"), null);
  assert.equal(officialDomain("boe.es.example.com"), null);
  assert.equal(officialDomain("gencat.cat.evil.net"), null);
  assert.equal(officialDomain(""), null);
  for (const d of OFFICIAL_DOMAINS) assert.match(d, /^[a-z0-9-]+(\.[a-z0-9-]+)+$/, d);
});

test("no measured link click carries a path, a query string or free text", () => {
  const hrefs = [
    "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-1&nombre=Ana",
    "https://sede.agenciatributaria.gob.es/Sede/ayuda/consultas.html?nif=00000000T",
    "https://www.sabadell.cat/ca/a?email=a%40b.c",
  ];
  for (const href of hrefs) {
    for (const inSources of [false, true]) {
      const event = click(href, { inSources });
      // sabadell.cat outside a source list is not measured at all.
      if (!event) {
        assert.ok(!inSources && href.includes("sabadell.cat"), href);
        continue;
      }
      for (const value of Object.values(event.params)) {
        assert.doesNotMatch(String(value), /[/?=@#%]/, `${href} -> ${String(value)}`);
      }
    }
  }
});

/* ----------------------------------------------------- calculator_use --- */

test("calculator_use waits for the visitor: a hash-restored result before any interaction is not a use", () => {
  let s = CALCULATOR_USE_START;
  let step = commitCalculatorResult(s, "default");
  assert.equal(step.report, false);
  s = step.state;
  // The shared link restores another result after mount: still no interaction.
  step = commitCalculatorResult(s, "from-hash");
  assert.equal(step.report, false);
  s = armCalculatorUse(step.state);
  assert.equal(s.baseline, "from-hash");
  // An interaction that does not change the result (a click on a link inside the tool).
  step = commitCalculatorResult(s, "from-hash");
  assert.equal(step.report, false);
  // The visitor's change produces a new result: report.
  step = commitCalculatorResult(step.state, "theirs");
  assert.equal(step.report, true);
  // Once done, further changes report nothing.
  step = commitCalculatorResult({ ...step.state, done: true }, "again");
  assert.equal(step.report, false);
});

test("arming twice keeps the first baseline", () => {
  let s = commitCalculatorResult(CALCULATOR_USE_START, "a").state;
  s = armCalculatorUse(s);
  s = commitCalculatorResult(s, "b").state;
  s = armCalculatorUse(s);
  assert.equal(s.baseline, "a");
});

test("resultSignature is stable for equal results and survives values JSON cannot hold", () => {
  assert.equal(resultSignature({ net: 1, lines: [1, 2] }), resultSignature({ net: 1, lines: [1, 2] }));
  assert.notEqual(resultSignature({ net: 1 }), resultSignature({ net: 2 }));
  assert.equal(resultSignature(null), "null");
  assert.equal(resultSignature(undefined), "undefined");
  const loop: Record<string, unknown> = {};
  loop.self = loop;
  assert.equal(typeof resultSignature(loop), "string");
  assert.equal(typeof resultSignature(10n), "string");
});

function fakeStorage() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

test("calculator_use is sent once per tab session per calculator", () => {
  const storage = fakeStorage();
  const sent: AnalyticsEvent[] = [];
  const send = (e: AnalyticsEvent) => (sent.push(e), true);
  assert.equal(reportCalculatorUse("net-salary", "es", send, storage), true);
  assert.equal(reportCalculatorUse("net-salary", "es", send, storage), true);
  assert.equal(reportCalculatorUse("dismissal", "es", send, storage), true);
  assert.deepEqual(sent, [
    { name: "calculator_use", params: { calculator_id: "net-salary", locale: "es" } },
    { name: "calculator_use", params: { calculator_id: "dismissal", locale: "es" } },
  ]);
  assert.deepEqual(JSON.parse(storage.data.get(CALCULATOR_SESSION_KEY) ?? "[]"), ["net-salary", "dismissal"]);
});

test("without consent nothing is marked, so the first change after accepting still counts", () => {
  const storage = fakeStorage();
  assert.equal(reportCalculatorUse("mortgage", "ca", () => false, storage), false);
  assert.equal(storage.data.has(CALCULATOR_SESSION_KEY), false);
  const sent: AnalyticsEvent[] = [];
  assert.equal(reportCalculatorUse("mortgage", "ca", (e) => (sent.push(e), true), storage), true);
  assert.equal(sent.length, 1);
});

test("blocked or corrupt sessionStorage falls back to once per page load", () => {
  const sent: AnalyticsEvent[] = [];
  const send = (e: AnalyticsEvent) => (sent.push(e), true);
  const blocked = {
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {
      throw new Error("SecurityError");
    },
  };
  assert.equal(reportCalculatorUse("itv", "en", send, blocked), true);
  assert.equal(reportCalculatorUse("itv", "en", send, blocked), true);
  assert.equal(reportCalculatorUse("smi-2027", "en", send, null), true);
  assert.equal(reportCalculatorUse("smi-2027", "en", send, null), true);
  assert.equal(sent.length, 2);
  const corrupt = fakeStorage();
  corrupt.data.set(CALCULATOR_SESSION_KEY, "{not json");
  assert.equal(reportCalculatorUse("euribor", "es", send, corrupt), true);
  assert.equal(sent.length, 3);
});

/* -------------------------------------------------- Wiring (source scan) --- */

function filesUnder(rel: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(join(ROOT, rel))) {
    const path = `${rel}/${name}`;
    if (statSync(join(ROOT, path)).isDirectory()) out.push(...filesUnder(path));
    else if (path.endsWith(".tsx")) out.push(path);
  }
  return out;
}

test("every interactive calculator section is wired to calculator_use", () => {
  const calculators = filesUnder("src/components").filter((f) => {
    const src = read(f);
    return src.startsWith('"use client"') && /<section className="ci-calc"/.test(src);
  });
  assert.ok(calculators.length >= 21, `found ${calculators.length}`);
  for (const f of calculators) {
    const src = read(f);
    assert.match(src, /const calcUse = useCalculatorUse\(/, f);
    assert.match(src, /<section className="ci-calc" \{\.\.\.calcUse\}/, f);
  }
});

test("the WhatsApp channel links say where they sit, and the listener is mounted once in the layout", () => {
  const follow = read("src/components/share/FollowChannel.tsx");
  const links = follow.match(/<a href=\{WHATSAPP_CHANNEL_URL\}[^>]*>/g) ?? [];
  assert.equal(links.length, 2);
  for (const a of links) assert.match(a, /data-ci-placement=/);
  const layout = read("src/app/(public)/[locale]/layout.tsx");
  assert.match(layout, /<AnalyticsClicks locale=\{typed\} channelUrl=\{WHATSAPP_CHANNEL_URL\} \/>/);
  // The listener and the search signal go through track(), never gtag directly.
  for (const f of ["src/components/AnalyticsClicks.tsx", "src/components/SearchAnalytics.tsx"]) {
    assert.doesNotMatch(read(f).replace(/typeof window\.gtag !== "function"/, ""), /gtag\(|dataLayer/, f);
  }
});

test("internal_search sends the length and the count, never the query text", () => {
  const page = read("src/app/(public)/[locale]/internal-search/page.tsx");
  assert.match(page, /<SearchAnalytics locale=\{locale\} termLength=\{query\.length\} resultsCount=\{results\.length \+ shortcuts\.length\} \/>/);
  const signal = read("src/components/SearchAnalytics.tsx");
  assert.match(signal, /params: \{ search_term_length: termLength, results_count: resultsCount, locale \}/);
});
