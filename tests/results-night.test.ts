import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { CONGRESS_RESULTS } from "../src/lib/content/batch02/election-results.ts";
import { ELECTION_NIGHT } from "../src/lib/content/batch02/election-night.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { hubCopy } from "../src/lib/programmatic/elections/hub.ts";
import { buildElectionPage, ELECTION_NIGHT_RESULTS_URL, INTERIOR_CHECKED } from "../src/lib/programmatic/elections/model.ts";
import { hubPath } from "../src/lib/programmatic/elections/paths.ts";
import {
  ELECTION_NIGHT_RESULTS_SOURCE,
  ELECTION_NIGHT_RESULTS_URL as SWITCH,
  RESULTS_SITE_CHECKED,
  isAnnouncementHost,
  resultsNightLine,
} from "../src/lib/programmatic/elections/results-night.ts";
import { SNAPSHOT } from "../src/lib/programmatic/elections/snapshot.ts";
import { madridDate } from "../src/lib/programmatic/elections/today.ts";
import { datePath } from "../src/lib/programmatic/holidays/paths.ts";

/**
 * Results night, 29 Nov 2026 (13 Nov 2026, docs/SEO_EXPERIMENTS.md): one
 * switch for the official results site, read by the town pages, the hubs,
 * the election-night guide and the Congress results guide. What these pin:
 * the switch is the only place the address lives, it can only be set with
 * the official note that names it, every page says the same thing in its own
 * language, and nothing carries a figure, a poll or a guessed domain.
 */

// The civil date in Catalonia (the server clock is UTC: just after midnight in Madrid it is still the day before).
const today = madridDate(new Date());
const CHECKED: Record<Locale, RegExp> = {
  ca: /comprovat el 13 de novembre de 2026/,
  es: /comprobado el 13 de noviembre de 2026/,
  en: /checked on 13 November 2026/,
};
const salou = () => {
  const m = SNAPSHOT.municipalities.find((x) => x.slug === "salou");
  assert.ok(m, "salou is in the snapshot");
  return m;
};

test("one switch: model.ts re-exports it, and it is set only with the official note that names it", () => {
  assert.equal(ELECTION_NIGHT_RESULTS_URL, SWITCH);
  assert.equal(INTERIOR_CHECKED, RESULTS_SITE_CHECKED);
  if (SWITCH === null) {
    assert.equal(ELECTION_NIGHT_RESULTS_SOURCE, null, "no announcement without a site");
  } else {
    assert.match(SWITCH, /^https:\/\//, "an https address");
    assert.ok(ELECTION_NIGHT_RESULTS_SOURCE, "the note that names the site is recorded");
    assert.ok(isAnnouncementHost(ELECTION_NIGHT_RESULTS_SOURCE), `announced on an official host: ${ELECTION_NIGHT_RESULTS_SOURCE}`);
  }
  assert.ok(isAnnouncementHost("https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/interior/Paginas/x.aspx"));
  assert.ok(isAnnouncementHost("https://29neleccionesgenerales.es/"));
  assert.ok(!isAnnouncementHost("https://resultados-29n.example.com/"));
  assert.ok(!isAnnouncementHost("not a url"));
});

test("re-check clock: the official sites must be read again on or after 26 Nov while no site is set", () => {
  // Interior named its 23J 2023 site three days before the vote; this fails from 26 Nov until RESULTS_SITE_CHECKED moves.
  if (SWITCH === null && today >= "2026-11-26") {
    assert.ok(RESULTS_SITE_CHECKED >= "2026-11-26", `results site last looked for on ${RESULTS_SITE_CHECKED}: re-read 29neleccionesgenerales.es and Interior's notes, then move it`);
  }
  assert.ok(RESULTS_SITE_CHECKED <= today, "the check date is not in the future");
});

test("the results line: when, who, provisional vs official; the link only once the switch is set", () => {
  for (const locale of LOCALES) {
    const off = resultsNightLine(locale, null);
    assert.match(off, /20:00/);
    assert.match(off, /21:00/);
    assert.match(off, /\b4\b.*\b7\b/);
    assert.match(off, /BOE/);
    assert.match(off, /Interior/);
    assert.match(off, CHECKED[locale], `${locale}: says when it was last checked`);
    assert.doesNotMatch(off, /\]\(/, `${locale}: no link while the switch is off`);
    const on = resultsNightLine(locale, "https://example.gob.es/resultados/");
    assert.equal(on.split("](https://example.gob.es/resultados/)").length - 1, 1, `${locale}: one link`);
    assert.doesNotMatch(on, CHECKED[locale], `${locale}: no "not yet" once set`);
    for (const text of [off, on]) {
      assert.doesNotMatch(text, /enquest|sondeig|encuesta|sondeo|\bpolls?\b|previsi|pronòstic|pronóstico|forecast|projecci|proyecci|projection|%/i, `${locale}: no polls, forecasts or figures`);
      assert.doesNotMatch(text, /\b(avui|demà|hoy|mañana|today|tomorrow|tonight)\b/i, `${locale}: true on any day`);
    }
  }
});

test("town pages, hubs and both guides print the same line in each language", () => {
  const generalIn = SNAPSHOT.general2026 !== undefined;
  for (const locale of LOCALES) {
    const line = resultsNightLine(locale);
    if (!generalIn) {
      const md = buildElectionPage(salou(), locale).slot.md.join("\n");
      assert.ok(md.includes(line), `${locale}: town page`);
      assert.ok(hubCopy(locale).intro.includes(line), `${locale}: hub`);
    }
    const night = JSON.stringify(ELECTION_NIGHT.editions[locale].blocks);
    if (SWITCH === null) assert.match(bodyToPlainText(ELECTION_NIGHT.editions[locale].blocks), /13 (de )?(novembre|noviembre|November)/, `${locale}: election night re-dated`);
    else assert.ok(night.includes(SWITCH), `${locale}: election night links the site`);
    const congress = CONGRESS_RESULTS.editions[locale];
    assert.ok(JSON.stringify(congress.blocks).includes(JSON.stringify(line).slice(1, -1)), `${locale}: Congress results guide`);
    assert.ok(JSON.stringify(congress.blocks).includes(`](${hubPath(locale)})`), `${locale}: Congress results guide links the town pages in its language`);
  }
  if (SWITCH === null) {
    assert.ok(!ELECTION_NIGHT.sources.some((s) => /resultados/i.test(s.name) && s.publisher === "Ministerio del Interior" && /web oficial\)$/.test(s.name)), "no results-site source while off");
  }
});

test("voting FAQ: is 29 / 30 November a holiday, and the day of reflection, in all three languages", () => {
  const holiday: Record<Locale, RegExp> = {
    ca: /^El 29 de novembre és festiu\?/,
    es: /^¿El 29 de noviembre es festivo\?/,
    en: /^Is 29 November a public holiday\?/,
  };
  const reflection: Record<Locale, RegExp> = { ca: /jornada de reflexió/, es: /jornada de reflexión/, en: /day of reflection/ };
  for (const locale of LOCALES) {
    const faqBlock = VOTING.editions[locale].blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] } | undefined;
    assert.ok(faqBlock, `${locale}: FAQ`);
    const item = faqBlock.items.find((q) => holiday[locale].test(q.question));
    assert.ok(item, `${locale}: holiday question`);
    assert.ok(item.answer.includes(`](${datePath(locale, "2026-11-30")})`), `${locale}: links the 30 Nov date page in its own language`);
    assert.match(item.answer, /605\/1999/);
    assert.match(item.answer, /28\)/, `${locale}: LOREG article 28 for polling-station members`);
    const refl = faqBlock.items.find((q) => reflection[locale].test(q.question));
    assert.ok(refl, `${locale}: reflection-day question`);
    assert.match(refl.answer, /28/);
    assert.match(refl.answer, /53/);
  }
});
