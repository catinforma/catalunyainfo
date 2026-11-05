import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";

import { SEATS, PROVINCES } from "../src/lib/content/candidates/boe.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { POLLS_PAGE_UPDATED, pollsCopy } from "../src/lib/programmatic/polls/copy.ts";
import { pollsPageData } from "../src/lib/programmatic/polls/data.ts";
import { POLLS, POLLS_CHECKED_ON } from "../src/lib/programmatic/polls/figures.ts";
import { pollsCrumbs, pollsMetadata, pollsSchemas } from "../src/lib/programmatic/polls/page.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { POLLS_INTERNAL_SEGMENT, POLLS_PATHS, pollsHeaderSources, pollsPath } from "../src/lib/programmatic/polls/paths.ts";
import type { Figure, PublishedPoll } from "../src/lib/programmatic/polls/types.ts";
import { BLACKOUT_END, BLACKOUT_START, isPollBlackout } from "../src/lib/programmatic/polls/window.ts";

/**
 * The 29N official-polls page and the LOREG art. 69.7 blackout: no poll
 * figure may be published, broadcast or reproduced from 24 Nov 2026 00:00 to
 * the close of polls on 29 Nov 20:00 (Madrid). These tests are the guard that
 * makes a leak fail loudly instead of silently.
 */

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");

/** A Madrid wall-clock time in November 2026 (CET, UTC+1). */
const madrid = (local: string) => new Date(`${local}:00+01:00`);

const published = POLLS.filter((poll): poll is PublishedPoll => poll.status === "published");

/**
 * Every token that would betray a poll figure if it reached a page in the
 * window: study numbers, report URLs, party names as the source writes them,
 * and each vote estimate as printed in any language ("23,1" / "23.1"; as a
 * number between non-digits, so "9.7" does not match "art. 69.7"). Seat
 * counts are small integers that ordinary copy also uses ("32 a Barcelona"):
 * the structural check (no poll field at all in the blackout data) covers them.
 */
function figureTokens(): { text: string[]; numbers: RegExp[] } {
  const text = new Set<string>();
  const numbers = new Map<string, RegExp>();
  const addFigure = (value: Figure | null | undefined) => {
    if (value === null || value === undefined) return;
    for (const n of typeof value === "number" ? [value] : value) {
      if (Number.isInteger(n)) continue;
      const [whole, decimals] = n.toFixed(1).split(".");
      numbers.set(`${whole}.${decimals}`, new RegExp(`(?<![\\d.,])${whole}[.,]${decimals}(?!\\d)`));
    }
  };
  for (const poll of published) {
    text.add(poll.study);
    for (const url of Object.values(poll.links)) if (url) text.add(url);
    for (const table of poll.tables) {
      for (const row of table.rows) {
        text.add(row.party);
        addFigure(row.vote);
      }
    }
  }
  return { text: [...text].filter((token) => token.length >= 3), numbers: [...numbers.values()] };
}

function assertNoFigure(json: string, where: string) {
  const { text, numbers } = figureTokens();
  for (const token of text) assert.ok(!json.includes(token), `${where}: "${token}"`);
  for (const pattern of numbers) assert.doesNotMatch(json, pattern, where);
}

const PARTY_NAMES = [...new Set(published.flatMap((poll) => poll.tables.flatMap((table) => table.rows.map((row) => row.party))))];

/* -------------------------------------------------------------------------- */
/* The window                                                                 */
/* -------------------------------------------------------------------------- */

/*
 * The brief asked for 24 Nov 00:00 - 29 Nov 20:00. The end is 21:00 Madrid:
 * the Canary Islands close at 20:00 local, and the Junta Electoral Central
 * bars estimates of results there before 21:00 peninsular time (Acuerdos
 * 458/1999, 99/2005). The brief's five timestamps are all kept below; 20:00
 * is now inside the window, and 20:59 / 21:00 test the real edge.
 */
test("the window is 24 Nov 2026 00:00 to 29 Nov 2026 21:00, Europe/Madrid", () => {
  assert.equal(BLACKOUT_START.toISOString(), "2026-11-23T23:00:00.000Z");
  assert.equal(BLACKOUT_END.toISOString(), "2026-11-29T20:00:00.000Z");
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", dateStyle: "short", timeStyle: "short" });
  assert.equal(fmt.format(BLACKOUT_START), "24/11/2026, 00:00");
  assert.equal(fmt.format(BLACKOUT_END), "29/11/2026, 21:00");
  const canaries = new Intl.DateTimeFormat("en-GB", { timeZone: "Atlantic/Canary", timeStyle: "short" });
  assert.equal(canaries.format(BLACKOUT_END), "20:00", "the end is when the Canary Islands close");
});

const CASES: { at: string; blackout: boolean }[] = [
  { at: "2026-11-23T23:59", blackout: false },
  { at: "2026-11-24T00:00", blackout: true },
  { at: "2026-11-26T12:00", blackout: true },
  { at: "2026-11-29T19:59", blackout: true },
  { at: "2026-11-29T20:00", blackout: true },
  { at: "2026-11-29T20:59", blackout: true },
  { at: "2026-11-29T21:00", blackout: false },
];

test("the data function: no figure, no poll, no link to a poll inside the window", () => {
  for (const { at, blackout } of CASES) {
    const now = madrid(at);
    assert.equal(isPollBlackout(now), blackout, at);
    const data = pollsPageData(now);
    const json = JSON.stringify(data);
    if (blackout) {
      assert.equal(data.state, "blackout", at);
      // Structurally empty: no field that could hold a poll.
      assert.deepEqual(Object.keys(data).sort(), ["returnsAt", "state"], at);
      assert.equal((data as { returnsAt: string }).returnsAt, BLACKOUT_END.toISOString(), at);
      assertNoFigure(json, `${at} blackout data`);
      assert.doesNotMatch(json, /cis\.es|ceo\.gencat|%/i, at);
    } else {
      assert.equal(data.state, "open", at);
      assert.equal(data.state === "open" && data.polls, POLLS, at);
      for (const poll of published) assert.ok(json.includes(poll.study), `${at}: ${poll.id} missing outside the window`);
    }
  }
});

test("the gate fails closed: an invalid clock counts as inside the window", () => {
  assert.equal(isPollBlackout(new Date("not a date")), true);
  assert.equal(pollsPageData(new Date(Number.NaN)).state, "blackout");
});

test("the copy, metadata, breadcrumbs and JSON-LD never carry a figure, at any date", () => {
  for (const locale of LOCALES) {
    const copy = pollsCopy(locale);
    const surfaces = {
      copy: JSON.stringify({ ...copy, blackout: copy.blackout }),
      metadata: JSON.stringify(pollsMetadata(locale)),
      crumbs: JSON.stringify(pollsCrumbs(locale)),
      schemas: JSON.stringify(pollsSchemas(locale)),
    };
    for (const [name, text] of Object.entries(surfaces)) {
      assertNoFigure(text, `${locale} ${name}`);
      assert.doesNotMatch(text, /cis\.es\/[^"]|ceo\.gencat\.cat\/[^"]/, `${locale} ${name}: links a study, not just the site`);
    }
    // Title and description: no percentage and no number but the date of the vote.
    for (const text of [copy.title, copy.seoTitle, copy.description, copy.crumb]) {
      assert.doesNotMatch(text, /%/, `${locale}: ${text}`);
      assert.doesNotMatch(text.replace(/\b29N\b|\b29\b|\b2026\b/g, ""), /\d/, `${locale}: ${text}`);
    }
    assert.ok(copy.seoTitle.length <= 60, `${locale}: seoTitle ${copy.seoTitle.length} chars`);
    assert.ok(copy.description.length <= 160, `${locale}: description ${copy.description.length} chars`);
  }
});

test("neutral wording: no winners, favourites or rankings in our own words", () => {
  for (const locale of LOCALES) {
    // Values only (the copy has a key called "lead").
    const values = (node: unknown): string[] =>
      typeof node === "string" ? [node] : node && typeof node === "object" ? Object.values(node).flatMap(values) : [];
    const text = values(pollsCopy(locale)).join("\n");
    assert.doesNotMatch(text, /guanya|guanyador|gana\b|ganador|\bwins?\b|winner|favorit|favourite|victòria|victoria|victory|lidera|\bleads?\b|primera força|primera fuerza|sorpasso/i, locale);
  }
});

/* -------------------------------------------------------------------------- */
/* Nothing else can reach the figures                                         */
/* -------------------------------------------------------------------------- */

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|mts|js|mjs)$/.test(name) ? [path] : [];
  });
}

test("only data.ts imports figures.ts; data.ts re-exports nothing", async () => {
  const files = [...sourceFiles(SRC), ...sourceFiles(join(ROOT, "scripts")), join(ROOT, "next.config.ts")];
  const importers = files.filter((file) => {
    const text = readFileSync(file, "utf8");
    return /(from|import|require)\s*\(?\s*["'][^"']*polls\/figures["']/.test(text) || (/["']\.\/figures["']/.test(text) && file.includes(join("programmatic", "polls")));
  });
  assert.deepEqual(importers.map((file) => relative(ROOT, file)), [join("src", "lib", "programmatic", "polls", "data.ts")]);

  const data = await import("../src/lib/programmatic/polls/data.ts");
  assert.deepEqual(Object.keys(data), ["pollsPageData"], "data.ts must export only the gate");
  assert.doesNotMatch(readFileSync(join(SRC, "lib", "programmatic", "polls", "data.ts"), "utf8"), /export\s*\*|export\s*\{/);
});

test("no other source file carries a study's number or report URL", () => {
  const figures = join(SRC, "lib", "programmatic", "polls", "figures.ts");
  const unique = published.flatMap((poll) => [poll.study, poll.links.results, poll.links.questionnaire].filter((x): x is string => !!x));
  for (const file of sourceFiles(SRC)) {
    if (file === figures) continue;
    const text = readFileSync(file, "utf8");
    for (const token of unique) assert.ok(!text.includes(token), `${relative(ROOT, file)} contains "${token}"`);
  }
});

/* -------------------------------------------------------------------------- */
/* Rendered at request time, never cached                                     */
/* -------------------------------------------------------------------------- */

test("the route is force-dynamic, never prerendered or revalidated, and the guide URLs rewrite to it", async () => {
  const app = join(SRC, "app", "(public)", "[locale]");
  const file = join(app, POLLS_INTERNAL_SEGMENT, "page.tsx");
  // Code only: the route's own comment names what must not be added.
  const text = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.match(text, /^export const dynamic = "force-dynamic";$/m, file);
  assert.doesNotMatch(text, /export const revalidate|generateStaticParams|force-static|"use cache"|unstable_cache/, file);
  assert.match(text, /<PollsPage locale=\{locale\} \/>/);

  const { default: config } = await import("../next.config.ts");
  const rewrites = (await config.rewrites!()) as { source: string; destination: string }[];
  for (const locale of LOCALES) {
    assert.ok(
      rewrites.some((r) => r.source === pollsPath(locale) && r.destination === `/${locale}/${POLLS_INTERNAL_SEGMENT}/`),
      `${locale}: rewrite ${pollsPath(locale)}`,
    );
    // Nothing else may own the public URL: no B2 guide (a published entry is
    // served before afterFiles rewrites), no legacy redirect.
    assert.ok(!Object.values(B2_PATHS).some((paths) => paths[locale] === POLLS_PATHS[locale]), `${locale}: B2 path collision`);
  }
  const redirects = readFileSync(join(ROOT, "migration", "redirects.csv"), "utf8");
  for (const locale of LOCALES) assert.ok(!redirects.includes(POLLS_PATHS[locale]), `${locale}: legacy redirect`);
  const view = readFileSync(join(SRC, "components", "programmatic", "polls", "PollsPage.tsx"), "utf8");
  assert.doesNotMatch(view, /^["']use client["']/m, "the view is a Server Component");
  assert.doesNotMatch(view, /"use cache"|unstable_cache|polls\/figures/, "no cache directive, no direct figures import");
  const connection = view.indexOf("await connection()");
  const clock = view.indexOf("pollsPageData(new Date())");
  assert.ok(connection > 0 && clock > connection, "the clock is read after await connection()");
  // The client island gets a timestamp, never data.
  const reload = readFileSync(join(SRC, "components", "programmatic", "polls", "PollsReload.tsx"), "utf8");
  assert.doesNotMatch(reload, /import .*polls\/(data|figures|types)/);
});

type HeaderRule = { source: string; headers: { key: string; value: string }[] };

test("next.config sends no-store, CDN and Cloudflare no-store on every polls URL", async () => {
  const { default: config } = await import("../next.config.ts");
  const rules = (await config.headers!()) as HeaderRule[];
  for (const source of pollsHeaderSources()) {
    const rule = rules.find((r) => r.source === source);
    assert.ok(rule, `${source}: no header rule`);
    const get = (key: string) => rule.headers.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value ?? "";
    assert.match(get("Cache-Control"), /private/, source);
    assert.match(get("Cache-Control"), /no-store/, source);
    assert.equal(get("CDN-Cache-Control"), "no-store", source);
    assert.equal(get("Cloudflare-CDN-Cache-Control"), "no-store", source);
    // Last rule for this path, so nothing later overrides it.
    const later = rules.slice(rules.indexOf(rule) + 1).filter((r) => r.source === "/:path*" && r.headers.some((h) => h.key === "Cache-Control"));
    assert.equal(later.length, 0, source);
  }
  for (const locale of LOCALES) {
    assert.ok(pollsHeaderSources().includes(pollsPath(locale).slice(0, -1)), locale);
  }
  const readme = readFileSync(join(ROOT, "ops", "vps", "README.md"), "utf8");
  for (const locale of LOCALES) assert.ok(readme.includes(`"${pollsPath(locale).slice(0, -1)}"`), `Cloudflare bypass for ${locale}`);
});

/* -------------------------------------------------------------------------- */
/* The data itself                                                            */
/* -------------------------------------------------------------------------- */

/** The CIS's own site and the Generalitat's (the CEO publishes on documents.dadesobertes.gencat.cat and web.gencat.cat). */
const OFFICIAL_HOSTS = /^https:\/\/([a-z0-9-]+\.)*(cis\.es|gencat\.cat)(\/|$)/;

test("every poll is CIS or CEO, linked on their own sites, with a complete LOREG 69.2 technical sheet", () => {
  for (const poll of POLLS) {
    assert.ok(poll.org === "cis" || poll.org === "ceo", poll.id);
    if (poll.status === "expected") {
      assert.match(poll.page, OFFICIAL_HOSTS, poll.id);
      continue;
    }
    for (const url of Object.values(poll.links)) if (url) assert.match(url, OFFICIAL_HOSTS, `${poll.id}: ${url}`);
    assert.ok(poll.links.results, `${poll.id}: results link`);
    assert.ok(poll.links.questionnaire, `${poll.id}: questionnaire (full text of the questions, art. 69.2.c)`);
    for (const locale of LOCALES) {
      for (const [field, value] of Object.entries(poll.sheet)) {
        if (field === "fieldwork") continue;
        assert.ok(((value as Record<string, string>)[locale] ?? "").length > 3, `${poll.id}/${locale}: sheet.${field}`);
      }
    }
    assert.match(poll.sheet.fieldwork.from, /^2026-\d{2}-\d{2}$/);
    assert.ok(poll.sheet.fieldwork.from <= poll.sheet.fieldwork.to && poll.sheet.fieldwork.to <= poll.publishedOn, poll.id);
    assert.ok(poll.tables.length > 0, poll.id);
  }
});

test("seat figures fit the seats each province elects", () => {
  const catalonia = PROVINCES.reduce((sum, key) => sum + SEATS[key].deputies, 0);
  const low = (value: Figure | null | undefined) => (value === null || value === undefined ? 0 : typeof value === "number" ? value : value[0]);
  for (const poll of published) {
    for (const table of poll.tables) {
      const seatsLow = table.rows.reduce((sum, row) => sum + low(row.seats), 0);
      assert.ok(seatsLow <= catalonia, `${poll.id}: ${seatsLow} > ${catalonia}`);
      for (const key of PROVINCES) {
        const provinceLow = table.rows.reduce((sum, row) => sum + low(row.provinces?.[key]), 0);
        assert.ok(provinceLow <= SEATS[key].deputies, `${poll.id}/${key}: ${provinceLow} > ${SEATS[key].deputies}`);
      }
      for (const row of table.rows) {
        for (const value of [row.vote, row.seats, ...Object.values(row.provinces ?? {})]) {
          if (value && typeof value !== "number") assert.ok(value[0] <= value[1], `${poll.id}/${row.party}: range`);
        }
      }
    }
  }
  assert.ok(PARTY_NAMES.every((name) => name.trim() === name && name.length > 0));
});

/* -------------------------------------------------------------------------- */
/* Staleness: the page must be refilled before the window                     */
/* -------------------------------------------------------------------------- */

const today = new Date().toISOString().slice(0, 10);

test("staleness: every pending slot re-checked by its date", () => {
  for (const poll of POLLS) {
    if (poll.status !== "expected") continue;
    assert.ok(
      today <= poll.recheckBy,
      `${poll.id}: re-check ${poll.page} (due ${poll.recheckBy}); fill the figures from the official report or move recheckBy, then POLLS_CHECKED_ON`,
    );
    if (poll.expectedOn) assert.ok(today <= poll.expectedOn, `${poll.id}: announced for ${poll.expectedOn}, still not filled in`);
  }
});

test("staleness: from 18 Nov the CIS and CEO sources must have been re-read for the last days before the blackout", () => {
  if (today >= "2026-11-18" && today < "2026-11-24") {
    assert.ok(POLLS_CHECKED_ON >= "2026-11-18", `POLLS_CHECKED_ON is ${POLLS_CHECKED_ON}: re-read cis.es and ceo.gencat.cat and update figures.ts`);
  }
  assert.ok(POLLS_PAGE_UPDATED >= POLLS_CHECKED_ON, "POLLS_PAGE_UPDATED moves with the data");
});

/* -------------------------------------------------------------------------- */
/* Links in                                                                   */
/* -------------------------------------------------------------------------- */

test("linked from the election hub and the candidates guide, in the body only", async () => {
  const { hubCopy } = await import("../src/lib/programmatic/elections/hub.ts");
  const { CANDIDATES } = await import("../src/lib/content/batch02/candidates.ts");
  for (const locale of LOCALES) {
    const link = `](${pollsPath(locale)})`;
    assert.ok(hubCopy(locale).intro.some((text) => text.includes(link)), `hub ${locale}`);
    const edition = CANDIDATES.editions[locale];
    assert.ok(JSON.stringify(edition.blocks).includes(link), `candidates ${locale}`);
    // Titles and descriptions of the election pages stay as they are (3 Nov window).
    for (const text of [edition.title, edition.seoTitle, edition.seoDescription]) {
      assert.doesNotMatch(text, /enquest|encuest|poll/i, `candidates ${locale}: ${text}`);
    }
  }
});
