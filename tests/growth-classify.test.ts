import assert from "node:assert/strict";
import { test } from "node:test";

import {
  classifyQuery,
  clusterFor,
  normalise,
  opportunityScore,
} from "../src/lib/growth/classify.ts";

/**
 * The classifier decides which numbers we steer the site by, so the cases that
 * matter are the ones where a wrong call would change a decision:
 *
 *  - A topical query wrongly binned as noise would hide real demand.
 *  - A fragment wrongly counted as human would keep the CTR artefact in the
 *    KPI, which is the whole thing this exists to remove.
 *  - A short word that merely contains a stopword — `sitges` contains `si` —
 *    must not be mistaken for one.
 */

test("real queries from Search Console are classified as human", () => {
  for (const query of [
    "donde hay setas ahora en cataluña 2026",
    "bolets catalunya 2026",
    "bolets vall d'en bas",
    "predicció bolets catalunya",
    "quants dies després de ploure surten els bolets",
    "mapa bolets catalunya 2026",
    "sitges film festival 2026 schedule",
    "calendario laboral 2027",
    "semana santa 2027 catalunya",
    "divendres sant 2027",
    "cuánto es la tasa turística en barcelona",
    "barcelona tourist tax calculator",
    "que hacer este fin de semana en cataluña",
    "cuando empieza el otoño en cataluña",
  ]) {
    assert.equal(classifyQuery(query).kind, "human", query);
  }
});

test("a one-word topical query is still human", () => {
  // `bolets` is one word and is the most valuable subject on the site. No
  // length rule may ever bin it.
  assert.equal(classifyQuery("bolets").kind, "human");
  assert.equal(classifyQuery("bolets").cluster, "bolets");
  assert.equal(classifyQuery("setcases").cluster, "destinations");
});

test("the observed fragments are classified as noise", () => {
  for (const query of [
    "d'acord",
    "check again",
    "si",
    "sí",
    "vale",
    "las dos cosas",
    "para ir mañana",
    "avui",
    "demà",
    "hoy",
    "ahora",
    "ahora esta semana",
    "a fecha de hoy",
    "oct 10",
    "september 23",
    "sabado 17",
    "6 de octubre",
  ]) {
    assert.equal(classifyQuery(query).kind, "noise", query);
  }
});

test("a stopword inside a topical word does not trigger the noise rule", () => {
  // `sitges` contains `si`; `mesos` contains `mes`. Substring matching here
  // would silently delete the Sitges cluster.
  assert.equal(classifyQuery("sitges").kind, "human");
  assert.equal(classifyQuery("sitges film festival").cluster, "sitges");
});

test("a fragment next to a topical word stays human", () => {
  // "where to find mushrooms today" is a real question, not a fragment.
  assert.equal(classifyQuery("on trobar bolets avui").kind, "human");
  assert.equal(classifyQuery("temporada de bolets 2026").kind, "human");
});

test("brand is separated from human search", () => {
  for (const query of ["catalunya info", "catalunyainfo", "catalunya informacio", "info catalunya"]) {
    assert.equal(classifyQuery(query).kind, "brand", query);
  }
});

test("every classification carries a reason", () => {
  for (const query of ["bolets", "d'acord", "catalunya info", "xyzzy plugh"]) {
    assert.ok(classifyQuery(query).reason.length > 0, query);
  }
});

test("an unknown query is reported as unclassified, never guessed", () => {
  const result = classifyQuery("alojamiento en hospitalet de llobregat");
  assert.equal(result.kind, "unclassified");
  assert.equal(result.cluster, null);
});

test("cluster assignment prefers the more specific vocabulary", () => {
  // `barcelona` is in the practical vocabulary, but a tax query is a tax query.
  assert.equal(clusterFor("cuanto es la tasa turistica en barcelona"), "taxa-turistica");
  assert.equal(clusterFor("barcelona tourist traps"), "barcelona-practical");
});

test("normalise strips accents and punctuation without merging words", () => {
  assert.equal(normalise("Predicció bolets, Catalunya!"), "prediccio bolets catalunya");
  assert.equal(normalise("d'acord"), "d acord");
});

test("opportunity claims nothing for a query that is not human", () => {
  const row = { query: "si", clicks: 0, impressions: 8, ctr: 0, position: 3 };
  const opp = opportunityScore(row, classifyQuery("si"));
  assert.equal(opp.score, 0);
  assert.match(opp.terms[0] ?? "", /no opportunity claimed/);
});

test("a query we already win scores lower than one we nearly win", () => {
  const won = { query: "bolets catalunya 2026", clicks: 2, impressions: 6, ctr: 0.33, position: 2.5 };
  const near = { query: "mapa bolets catalunya 2026", clicks: 1, impressions: 15, ctr: 0.07, position: 7.7 };
  const wonScore = opportunityScore(won, classifyQuery(won.query)).score;
  const nearScore = opportunityScore(near, classifyQuery(near.query)).score;
  assert.ok(nearScore > wonScore, `${nearScore} should beat ${wonScore}`);
});

test("the opportunity score explains itself term by term", () => {
  const row = {
    query: "predicció bolets catalunya",
    clicks: 0,
    impressions: 7,
    ctr: 0,
    position: 16.3,
  };
  const opp = opportunityScore(row, classifyQuery(row.query));
  assert.ok(opp.terms.length >= 4);
  // The printed terms must add up to the score, or the explanation is a lie.
  const sum = opp.terms.reduce((total, term) => {
    const match = /^([+-][\d.]+)/.exec(term);
    return total + (match ? Number(match[1]) : 0);
  }, 0);
  assert.equal(Math.round(sum * 10) / 10, opp.score);
});
