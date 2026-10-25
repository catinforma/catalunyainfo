import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { CANDIDATES } from "../src/lib/content/batch02/candidates.ts";
import { ELECTION_NIGHT } from "../src/lib/content/batch02/election-night.ts";
import { B2_PATHS, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import { ELECTORS, PROVINCES, SEATS } from "../src/lib/content/candidates/boe.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { EVERGREEN } from "../src/lib/content/weekend/evergreen.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * The 29N candidates guide. Same structural checks as the batch-02 suite (it
 * has one photograph, not two, so it is not in that suite's list), plus what
 * this page must never do: print last election's names, rank or comment on
 * anyone, or wander into the how-to-vote page's subject.
 */

const PUBLISHED = new Set([
  ...Object.values(B2_PATHS).flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
  ...LOCALES.map((locale) => `/${locale}/${EVERGREEN[locale].path}/`),
]);

const text = (locale: (typeof LOCALES)[number]) => bodyToPlainText(CANDIDATES.editions[locale].blocks);

test("three editions that validate, are substantial and sit on the registry paths", () => {
  for (const locale of LOCALES) {
    const edition = CANDIDATES.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    const words = wordCount(text(locale));
    assert.ok(words > 900, `${locale} has only ${words} words`);
    assert.equal(edition.path, B2_PATHS.candidates[locale]);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
  }
});

test("titles and descriptions fit what Google shows and use the searched words", () => {
  const words = { ca: /candidats/i, es: /candidatos/i, en: /candidates/i };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, title, excerpt } = CANDIDATES.editions[locale];
    assert.ok(seoTitle.length <= 60, `${locale} seoTitle is ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${locale} description is ${seoDescription.length}`);
    assert.match(seoTitle, words[locale]);
    assert.match(seoTitle, /Barcelona/);
    assert.match(seoTitle, /2026/);
    assert.match(title, words[locale]);
    assert.match(seoDescription, /BOE/);
    assert.ok(excerpt.length > 30);
  }
});

test("the live lists come right after the lead, once, in every language", () => {
  for (const locale of LOCALES) {
    const blocks = CANDIDATES.editions[locale].blocks;
    assert.equal(blocks.filter((block) => block.type === "candidateLists").length, 1, locale);
    assert.equal(blocks.findIndex((block) => block.type === "candidateLists"), 1, locale);
    const published = withReadNext([...blocks], locale);
    assert.equal(published.findIndex((block) => block.type === "candidateLists"), 1, locale);
  }
});

test("seats and electors are the decree's and the INE's, labelled as the consultation census", () => {
  assert.deepEqual(
    PROVINCES.map((key) => [SEATS[key].deputies, SEATS[key].senators]),
    [
      [32, 4],
      [6, 4],
      [4, 4],
      [6, 4],
    ],
  );
  assert.equal(PROVINCES.reduce((sum, key) => sum + ELECTORS[key].total, 0), 5_926_487);
  for (const key of PROVINCES) {
    assert.equal(ELECTORS[key].resident + ELECTORS[key].abroad, ELECTORS[key].total, key);
  }
  const census = { ca: /cens de consulta/, es: /censo de consulta/, en: /consultation census/ };
  const big = { ca: "4.398.757", es: "4.398.757", en: "4,398,757" };
  const total = { ca: "5.926.487", es: "5.926.487", en: "5,926,487" };
  for (const locale of LOCALES) {
    const body = text(locale);
    assert.match(body, census[locale], locale);
    assert.ok(body.includes(big[locale]), `${locale}: Barcelona electors`);
    assert.ok(body.includes(total[locale]), `${locale}: total electors`);
    assert.match(body, /806\/2026/, locale);
  }
});

test("the calendar is the legal one: 28 Oct, 2 and 3 Nov, appeals 4-5 Nov, 12 Nov, campaign, 29 Nov 9-20 h", () => {
  const days: Record<string, string[]> = {
    ca: ["21–26 d'octubre", "28 d'octubre", "2 de novembre", "3 de novembre", "4–5 de novembre", "12 de novembre", "13 de novembre (0:00) – 27 de novembre (24:00)", "28 de novembre", "29 de novembre, de 9:00 a 20:00"],
    es: ["21–26 de octubre", "28 de octubre", "2 de noviembre", "3 de noviembre", "4–5 de noviembre", "12 de noviembre", "13 de noviembre (0:00) – 27 de noviembre (24:00)", "28 de noviembre", "29 de noviembre, de 9:00 a 20:00"],
    en: ["21–26 October", "28 October", "2 November", "3 November", "4–5 November", "12 November", "13 November (00:00) – 27 November (24:00)", "28 November", "29 November, 9:00–20:00"],
  };
  for (const locale of LOCALES) {
    const body = text(locale);
    for (const day of days[locale]!) assert.ok(body.includes(day), `${locale}: ${day}`);
  }
});

test("Congress closed lists, Senate up to three, and where the lists are published, in every language", () => {
  const rules: Record<string, RegExp[]> = {
    ca: [/fins a tres/, /llista tancada|llistes tancades/, /169\.4/, /3 % dels vots vàlids/, /dos suplents/],
    es: [/hasta tres/, /lista cerrada|listas cerradas/, /169\.4/, /3 % de los votos válidos/, /dos suplentes/],
    en: [/up to three/, /closed list/, /169\.4/, /3% of the valid votes/, /two substitutes/],
  };
  for (const locale of LOCALES) {
    for (const rule of rules[locale]!) assert.match(text(locale), rule, `${locale}: ${rule}`);
  }
});

test("no names, polls, rankings or court case: strictly procedural", () => {
  for (const locale of LOCALES) {
    const body = text(locale);
    // Not one name from last election's lists, and no party.
    for (const name of ["Batet", "Iceta", "PSC", "ERC", "JUNTS", "Junts", "VOX", "Vox", "PP)", "SUMAR", "Sumar", "CUP"]) {
      assert.ok(!body.includes(name), `${locale}: ${name}`);
    }
    assert.doesNotMatch(body, /encuesta|sondeo|enquesta|sondeig|\bpolls?\b|favorit|favorito|favourite|ganador|guanyador|winner|rànquing de|ranking de/i, locale);
    assert.doesNotMatch(body, /Supremo|Suprem|Supreme|204\/2026/, locale);
    // 2023 appears once: the precedent for corrections, labelled as such.
    const mentions = body.match(/.{0,40}2023.{0,40}/g) ?? [];
    assert.equal(mentions.length, 1, `${locale}: ${mentions.join(" | ")}`);
    assert.match(mentions[0] ?? "", /generals del 2023|generales de 2023|2023 general election/, locale);
  }
});

test("the INE ballot download is presented as CERA-only, with its warning", () => {
  const warn = { ca: /residents a l'estranger \(CERA\)/, es: /residentes en el extranjero \(CERA\)/, en: /living abroad \(CERA\)/ };
  for (const locale of LOCALES) {
    const body = text(locale);
    assert.match(body, warn[locale], locale);
    assert.match(body, /26 (de )?(novembre|noviembre|November)/, locale);
    assert.match(JSON.stringify(CANDIDATES.editions[locale].blocks), /ine\.es\/dyngs\/CEL\/index\.htm\?cid=1030/, locale);
  }
});

test("internal links stay in their language, end in a slash and point at published pages", () => {
  for (const locale of LOCALES) {
    const blocks = JSON.stringify(CANDIDATES.editions[locale].blocks);
    const links = [...blocks.matchAll(/\]\((\/[a-z]{2}\/[^)]*)\)/g)].map((match) => match[1] ?? "");
    assert.ok(links.length >= 5, `${locale}: only ${links.length} internal links`);
    for (const href of links) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
    }
    for (const key of ["voting", "mesa", "electionNight", "congressResults"] as const) {
      assert.ok(links.includes(`/${locale}/${B2_PATHS[key][locale]}/`), `${locale}: no ${key} link`);
    }
  }
});

test("how-to-vote and election night each link to this page in every language", () => {
  for (const locale of LOCALES) {
    const target = `(/${locale}/${B2_PATHS.candidates[locale]}/)`;
    assert.equal(JSON.stringify(VOTING.editions[locale].blocks).split(target).length - 1, 1, `voting/${locale}`);
    assert.equal(JSON.stringify(ELECTION_NIGHT.editions[locale].blocks).split(target).length - 1, 1, `election night/${locale}`);
  }
});

test("sources are official https pages and the reader sees the verification date", () => {
  assert.ok(CANDIDATES.sources.length >= 5);
  for (const source of CANDIDATES.sources) {
    assert.match(source.url, /^https:\/\/(www\.)?(boe\.es|ine\.es|juntaelectoralcentral\.es|29neleccionesgenerales\.es)\//, source.url);
    assert.doesNotMatch(source.url, /aerobusbcn|[?&]utm_/);
  }
  assert.equal(CANDIDATES.verifiedAt, "2026-10-25");
  for (const locale of LOCALES) assert.match(text(locale), /verificaci|verified/i, locale);
});

test("the lead photo is the how-to-vote guide's second file, with that file's own wording", () => {
  assert.ok(CANDIDATES.heroKey && IMAGE_BY_KEY.has(CANDIDATES.heroKey));
  assert.equal(CANDIDATES.heroKey, VOTING.secondaryKey);
  assert.deepEqual(CANDIDATES.heroAlt, VOTING.secondaryAlt);
  assert.deepEqual(CANDIDATES.heroCaption, VOTING.secondaryCaption);
  assert.equal(CANDIDATES.secondaryKey, undefined);
  for (const locale of LOCALES) {
    assert.ok(!CANDIDATES.editions[locale].blocks.some((block) => block.type === "image" || block.type === "gallery"));
  }
});

test("the publish route has a 'candidates' group", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("candidates"\)\) published\.push\(await publishB2Article\(CANDIDATES\)\)/);
});
