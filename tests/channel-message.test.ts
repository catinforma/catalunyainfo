import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { PATHS as TOOL_PATHS, SEASONAL } from "../src/lib/content/home-tools.ts";
import { addDays } from "../src/lib/programmatic/holidays/format.ts";
import { todayMetadata } from "../src/lib/programmatic/today/page.ts";
import { inSeason, type HolidayData, type TodayStrike } from "../src/lib/programmatic/today/logic.ts";
import { PRODUCTION_DISALLOW } from "../src/lib/seo/robots-rules.ts";
import { ALWAYS_NOINDEX_SOURCES } from "../src/lib/security-headers.ts";
import { DAILY_FOLLOW_COPY, isDailyFollowPage } from "../src/lib/share/channel.ts";
import { channelMessage } from "../src/lib/share/channel-data.ts";
import {
  CHANNEL_UTM,
  MAX_LINES,
  MIN_LINES,
  buildChannelMessage,
  channelUrl,
  type ChannelInput,
} from "../src/lib/share/channel-message.ts";
import { MIN_TOKEN_LENGTH, channelTokenMatches } from "../src/lib/share/channel-token.ts";

const ORIGIN = "https://www.catalunyainfo.com";

/* -------------------------------------------------------------------------- */
/* Fixtures: the shapes holidayData() and todayStrikes() return               */
/* -------------------------------------------------------------------------- */

const HOLIDAYS: HolidayData = {
  from: "2026-11-01",
  regional: [
    { d: "2026-12-08", n: "la Immaculada" },
    { d: "2026-12-25", n: "Nadal" },
  ],
  regionalThrough: "2027-12-31",
  local: {
    "2026-11-20": [
      { n: "Girona", h: "/ca/festius/girona/", p: null },
      { n: "Ogassa", h: "/ca/festius/ogassa/", p: null },
    ],
    "2026-11-13": [{ n: "Ogassa", h: "/ca/festius/ogassa/", p: null }],
  },
  localThrough: "2026-12-31",
  towns: 947,
  datePages: { "2026-12-08": { href: "/ca/festius/dia/8-desembre-2026/", places: 0 } },
};

const STRIKES: TodayStrike[] = [
  {
    id: "vaga-ferroviaria-2026-11-17",
    dates: ["2026-11-17", "2026-11-19"],
    title: "vaga ferroviària",
    ms: "Serveis mínims encara no publicats",
    href: "/ca/guies/vaga-avui-catalunya/#vaga-ferroviaria-2026-11-17",
  },
  {
    id: "vaga-metges-2026-10-28",
    dates: ["2026-10-28"],
    indefinite: {},
    title: "vaga indefinida de metges",
    ms: "Urgències amb normalitat",
    href: "/ca/guies/vaga-avui-catalunya/#vaga-metges-2026-10-28",
  },
];

const SEASONAL_LABELS = Object.fromEntries(SEASONAL.map((s) => [s.key, { title: `Títol ${s.key}`, desc: `descripció de ${s.key}` }]));

function input(date: string, extra: Partial<ChannelInput> = {}): ChannelInput {
  return {
    date,
    holidays: HOLIDAYS,
    strikes: STRIKES,
    strikesAsOf: addDays(date, -1),
    election: null,
    links: { holidayToday: "/ca/guies/es-festiu-avui-catalunya/", weekendHub: "/ca/cap-de-setmana/" },
    seasonal: SEASONAL_LABELS,
    majorTowns: new Set(["Girona", "Barcelona"]),
    ...extra,
  };
}

function assertShape(text: string, lines: string[]) {
  assert.ok(lines.length >= MIN_LINES && lines.length <= MAX_LINES, `${lines.length} lines:\n${text}`);
  assert.equal(text, lines.join("\n"));
  assert.match(lines[0]!, /^\*Avui a Catalunya\* · /);
  assert.doesNotMatch(text, /aerobusbcn/i);
  for (const url of text.match(/https?:\/\/\S+/g) ?? []) {
    assert.ok(url.startsWith(`${ORIGIN}/ca/`), url);
    assert.ok(url.includes(`?${CHANNEL_UTM}`), `${url} carries the UTM`);
  }
}

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

test("channel post: strike day names the strike, its minimum services, and links its section", () => {
  const m = buildChannelMessage(input("2026-11-17"));
  assertShape(m.text, m.lines);
  assert.ok(m.notable);
  assert.match(m.text, /⚠️ Avui hi ha vaga ferroviària\. Serveis mínims encara no publicats\./);
  assert.match(m.text, /Continua la vaga indefinida de metges\./);
  assert.equal(m.link, `${ORIGIN}/ca/guies/vaga-avui-catalunya/?${CHANNEL_UTM}#vaga-ferroviaria-2026-11-17`);
  // The strike is the news: no "not a holiday" filler pushing it down.
  assert.doesNotMatch(m.text, /no és festiu/);
  assert.match(m.text, /Propera vaga, dijous 19 de novembre: vaga ferroviària\./);
});

test("channel post: the day before a strike warns about tomorrow and links it", () => {
  const m = buildChannelMessage(input("2026-11-16"));
  assertShape(m.text, m.lines);
  assert.match(m.text, /⚠️ Demà hi ha vaga ferroviària\./);
  assert.ok(m.link.includes("#vaga-ferroviaria-2026-11-17"));
});

test("channel post: a Catalonia-wide holiday, linked to its date page", () => {
  const m = buildChannelMessage(input("2026-12-08"));
  assertShape(m.text, m.lines);
  assert.ok(m.notable);
  assert.match(m.text, /🎉 Avui és festiu a tot Catalunya: la Immaculada\./);
  assert.equal(m.link, `${ORIGIN}/ca/festius/dia/8-desembre-2026/?${CHANNEL_UTM}`);
  assert.match(m.text, /Proper festiu a tot Catalunya: Nadal, divendres 25 de desembre\./);
});

test("channel post: a local holiday counts only in a major town", () => {
  const big = buildChannelMessage(input("2026-11-20"));
  assert.match(big.text, /📍 Festa local avui a Girona i 1 lloc més\./);
  assert.ok(big.notable);
  const village = buildChannelMessage(input("2026-11-13"));
  assert.doesNotMatch(village.text, /Ogassa/);
});

test("channel post: a normal day says so and links a seasonal page, not invented news", () => {
  const m = buildChannelMessage(input("2026-11-13"));
  assertShape(m.text, m.lines);
  assert.equal(m.notable, false);
  assert.match(m.text, /^Avui no és festiu a Catalunya\.$/m);
  assert.match(m.text, /^💡 Títol \w+\. Descripció de \w+$/m);
  const seasonal = SEASONAL.filter((s) => inSeason("2026-11-13", s.from, s.to)).map((s) => `/ca/${TOOL_PATHS[s.key].ca}/`);
  assert.ok(seasonal.some((path) => m.link === `${ORIGIN}${path}?${CHANNEL_UTM}`), m.link);
  assert.doesNotMatch(m.text, /🗓️/, "a Friday has no weekend line");
  // With nothing on the strike list at all, one plain line says both.
  const calm = buildChannelMessage(input("2026-11-13", { strikes: [] }));
  assert.match(calm.text, /Avui no és festiu a Catalunya i no hi ha cap vaga a la nostra llista\./);
});

test("channel post: Thursdays add the weekend, on the weekend agenda's dates, with its own utm_content", () => {
  const m = buildChannelMessage(input("2026-11-26"));
  assertShape(m.text, m.lines);
  const weekend = m.lines.at(-1)!;
  assert.match(weekend, /^🗓️ Cap de setmana \(divendres 27 – diumenge 29 de novembre\): fires i mercats per zones /);
  assert.ok(weekend.endsWith(`${ORIGIN}/ca/cap-de-setmana/?${CHANNEL_UTM}&utm_content=weekend`), weekend);
  // A holiday on the Friday makes it a long weekend.
  const long = buildChannelMessage(input("2026-12-24"));
  assert.match(long.text, /🗓️ Cap de setmana llarg \(divendres 25 – diumenge 27 de desembre\)/);
  assert.match(long.text, /Demà és festiu a tot Catalunya: Nadal\./);
});

test("channel post: a strike list older than a week is not used at all, and the owner is told", () => {
  const m = buildChannelMessage(input("2026-11-17", { strikesAsOf: "2026-11-05" }));
  assert.doesNotMatch(m.text, /vaga/i);
  assert.ok(m.warnings.some((w) => /llista de vagues/.test(w)));
});

test("channel post: election day and its countdown come from the alert strip's window", () => {
  const election = { day: "2026-11-29", start: "2026-11-12T00:00:00+01:00", end: "2026-11-30T00:00:00+01:00", href: "/ca/guies/com-votar-eleccions-catalunya/" };
  const on = buildChannelMessage(input("2026-11-29", { election }));
  assert.match(on.text, /🗳️ Avui hi ha eleccions generals\./);
  assert.equal(on.link, `${ORIGIN}/ca/guies/com-votar-eleccions-catalunya/?${CHANNEL_UTM}`);
  const before = buildChannelMessage(input("2026-11-27", { election }));
  assert.match(before.text, /Eleccions generals el diumenge 29 de novembre, d'aquí a 2 dies\./);
  const after = buildChannelMessage(input("2026-11-30", { election }));
  assert.doesNotMatch(after.text, /Eleccions/);
});

test("channel post: live figures only when given, each with its source and time", () => {
  const live = { fuel: { e95: 1.489, goa: 1.399, count: 1520, time: "07:30" }, reservoirs: { percent: 38.46, when: "lectura de l'ACA d'ahir" } };
  const m = buildChannelMessage(input("2026-11-13", { strikes: [], live }));
  assert.match(m.text, /Gasolina 95: 1,489 €\/l · gasoil: 1,399 €\/l \(mediana de 1\.520 benzineres, Ministeri, 07:30 h\)\./);
  assert.ok(m.lines.length <= MAX_LINES);
  assert.doesNotMatch(buildChannelMessage(input("2026-11-13")).text, /Gasolina|Embassaments/);
});

/* -------------------------------------------------------------------------- */
/* The real data, as the page builds it                                       */
/* -------------------------------------------------------------------------- */

test("channel post: built from the site's data, every day of the next two months is 4-7 lines with tagged links", () => {
  for (let i = 0; i < 60; i += 1) {
    const date = addDays("2026-11-13", i);
    const m = channelMessage(date);
    assertShape(m.text, m.lines);
    assert.ok(m.link.startsWith(`${ORIGIN}/ca/`) && m.link.includes(CHANNEL_UTM), `${date}: ${m.link}`);
  }
  assert.match(channelMessage("2026-12-08").text, /Avui és festiu a tot Catalunya: la Immaculada/);
});

/* -------------------------------------------------------------------------- */
/* UTM and canonical                                                          */
/* -------------------------------------------------------------------------- */

test("channel links: production host, trailing slash, UTM, anchor after the query; canonical stays clean", () => {
  assert.equal(CHANNEL_UTM, "utm_source=whatsapp&utm_medium=channel&utm_campaign=daily");
  assert.equal(channelUrl("/ca/avui"), `${ORIGIN}/ca/avui/?${CHANNEL_UTM}`);
  assert.equal(channelUrl("/ca/guies/x/#a"), `${ORIGIN}/ca/guies/x/?${CHANNEL_UTM}#a`);
  assert.equal(channelUrl("/ca/cap-de-setmana/", "weekend"), `${ORIGIN}/ca/cap-de-setmana/?${CHANNEL_UTM}&utm_content=weekend`);
  // The canonical comes from the path alone, and tagged URLs are never crawled.
  const canonical = String(todayMetadata("ca").alternates?.canonical ?? "");
  assert.ok(canonical.endsWith("/ca/avui/") && !canonical.includes("?"), canonical);
  assert.ok(PRODUCTION_DISALLOW.includes("/*?*"));
});

/* -------------------------------------------------------------------------- */
/* Private page: token, noindex, sitemap, CMS                                 */
/* -------------------------------------------------------------------------- */

test("channel page token: only the configured, long enough token opens the page", () => {
  const token = "a".repeat(MIN_TOKEN_LENGTH);
  assert.equal(channelTokenMatches(token, token), true);
  assert.equal(channelTokenMatches(token, ` ${token}\n`), true, "a trailing newline in the env file is ignored");
  assert.equal(channelTokenMatches(`${token}b`, token), false);
  assert.equal(channelTokenMatches(token.slice(1), token), false);
  assert.equal(channelTokenMatches("", token), false);
  assert.equal(channelTokenMatches(undefined, token), false);
  assert.equal(channelTokenMatches("anything", undefined), false, "no token configured: closed");
  assert.equal(channelTokenMatches("", ""), false);
  const short = "b".repeat(MIN_TOKEN_LENGTH - 1);
  assert.equal(channelTokenMatches(short, short), false, "a short token switches the page off");
});

test("channel page: dynamic, 404 without the token, noindex, no referrer, no analytics, not in the sitemap", () => {
  const page = readFileSync("src/app/(private)/canal/[token]/page.tsx", "utf8");
  assert.match(page, /export const dynamic = "force-dynamic"/);
  assert.match(page, /if \(!channelTokenMatches\(token\)\) notFound\(\);/);
  assert.match(page, /robots: \{ index: false, follow: false/);
  assert.doesNotMatch(page, /generateStaticParams/);
  const layout = readFileSync("src/app/(private)/layout.tsx", "utf8");
  assert.match(layout, /robots: \{ index: false, follow: false/);
  assert.match(layout, /referrer: "no-referrer"/);
  assert.doesNotMatch(layout, /ConsentGate|googletagmanager|SiteHeader/);
  assert.ok(ALWAYS_NOINDEX_SOURCES.includes("/canal/:path*"));
  assert.doesNotMatch(readFileSync("src/app/sitemap.ts", "utf8"), /canal|channel/i);
  // The token is read from the server env at run time: never a NEXT_PUBLIC_ variable.
  assert.doesNotMatch(readFileSync("src/lib/share/channel-token.ts", "utf8"), /NEXT_PUBLIC_/);
});

test("channel page in the CMS: signed-in users only, like the other admin pages", () => {
  const page = readFileSync("src/app/(admin)/admin/canal/page.tsx", "utf8");
  assert.match(page, /const user = await getSessionUser\(\);\s*if \(!user\) redirect\("\/admin\/login"\);/);
  assert.match(page, /export const dynamic = "force-dynamic"/);
  assert.match(readFileSync("src/app/(admin)/admin/layout.tsx", "utf8"), /href="\/admin\/canal"/);
});

/* -------------------------------------------------------------------------- */
/* The "every morning" prompt                                                 */
/* -------------------------------------------------------------------------- */

test("daily follow prompt: three languages, honest that the post is in Catalan, on the daily page and the strikes hub", () => {
  for (const l of ["ca", "es", "en"] as const) assert.ok(DAILY_FOLLOW_COPY[l].title && DAILY_FOLLOW_COPY[l].text && DAILY_FOLLOW_COPY[l].cta, l);
  assert.match(DAILY_FOLLOW_COPY.es.text, /en catalán/);
  assert.match(DAILY_FOLLOW_COPY.en.text, /in Catalan/);
  assert.ok(isDailyFollowPage("/ca/guies/vaga-avui-catalunya/"));
  assert.ok(isDailyFollowPage("/es/guias/huelga-hoy-cataluna"));
  assert.ok(isDailyFollowPage("/en/guides/strike-barcelona-catalonia-today/#x"));
  assert.ok(!isDailyFollowPage("/ca/guies/es-festiu-avui-catalunya/"));
  assert.match(readFileSync("src/components/programmatic/today/TodayPage.tsx", "utf8"), /<FollowChannel locale=\{locale\} variant="daily" \/>/);
});
