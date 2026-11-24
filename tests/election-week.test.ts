import { preVote } from "./pre-vote.ts";
import assert from "node:assert/strict";
import { test } from "node:test";

import { ELECTION_NIGHT } from "../src/lib/content/batch02/election-night.ts";
import { MESA } from "../src/lib/content/batch02/mesa.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { closedOn } from "../src/lib/content/batch02/shops.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { electionDayBlock, electionPhase, type ElectionDayBlock } from "../src/lib/programmatic/elections/election-day.ts";
import { townElectionDay } from "../src/lib/programmatic/elections/model.ts";
import { SNAPSHOT } from "../src/lib/programmatic/elections/snapshot.ts";

/**
 * 21 Nov 2026, the 29N election-week questions (docs/SEO_EXPERIMENTS.md,
 * "21 Nov 2026 — 29N election-week questions"; facts read that day on the
 * BOE, the DOGC and Interior, research_notes/el-week-29n-2026-11-21.md): each
 * question has one page that answers it first, with the official rule quoted
 * and linked.
 *  - Paid hours to vote: Ordre EMT/232/2026 (DOGC núm. 9799, 20 Nov 2026) on
 *    how-to-vote, the mesa guide and the election-day layer of the town pages.
 *  - No DNI: LOREG art. 85.1 quoted on how-to-vote.
 *  - Blank vs null, the 3 % threshold, D'Hondt, the Senate and the seats per
 *    province: election night, from LOREG arts. 96, 163, 166 and RD 806/2026.
 *  - Mesa: what time (LOREG 80.1), the first five hours on Monday 30.
 *  - Is 29 Nov a holiday / shops: how-to-vote's FAQ links the shops guide.
 */

type Item = { question: string; answer: string };
type B = { type: string; text?: string; level?: number; items?: (string | Item)[]; rows?: string[][] };

const blocks = (article: typeof MESA, locale: Locale) => preVote(article.editions[locale].blocks) as unknown as B[];
const h2s = (article: typeof MESA, locale: Locale) =>
  blocks(article, locale).filter((b) => b.type === "heading" && b.level === 2).map((b) => b.text ?? "");
const faqItems = (article: typeof MESA, locale: Locale) =>
  blocks(article, locale).filter((b) => b.type === "faq").flatMap((b) => b.items as Item[]);
const plain = (article: typeof MESA, locale: Locale) => bodyToPlainText(preVote(article.editions[locale].blocks));

const EMT_232 = "https://portaldogc.gencat.cat/utilsEADOP/PDF/9799/2181015.pdf";
const DOGC_NOT_YET = /DOGC[^.]*(encara no|aún no|still not)|(encara no|aún no|still not)[^.]*DOGC/;

test("how-to-vote gives the 29N paid hours from Ordre EMT/232/2026 (DOGC 20 Nov), no 'not yet' line", () => {
  const title: Record<Locale, string> = {
    ca: "Quantes hores et donen per anar a votar si treballes el 29N?",
    es: "¿Cuántas horas te dan para ir a votar si trabajas el 29N?",
    en: "Paid time off to vote on 29 November: how many hours do you get?",
  };
  const hours: Record<Locale, string[]> = {
    ca: ["**4 hores**", "**2 hores**", "Cap", "Cap"],
    es: ["**4 horas**", "**2 horas**", "Ninguno", "Ninguno"],
    en: ["**4 hours**", "**2 hours**", "None", "None"],
  };
  for (const locale of LOCALES) {
    const all = blocks(VOTING, locale);
    const at = all.findIndex((b) => b.type === "heading" && b.level === 2 && b.text === title[locale]);
    assert.ok(at > 0, `${locale}: leave section`);
    const rows = all.slice(at).find((b) => b.type === "table")?.rows ?? [];
    assert.deepEqual(rows.map((r) => r[1]), hours[locale], `${locale}: the order's tiers`);
    const json = JSON.stringify(all);
    assert.ok(json.includes(`](${EMT_232})`), `${locale}: links the DOGC order`);
    assert.ok(json.includes(`](${b2href("mesa", locale)})`), `${locale}: hands mesa members on`);
    assert.doesNotMatch(plain(VOTING, locale), DOGC_NOT_YET, `${locale}: stale "not yet in the DOGC"`);
    const leaveFaq = faqItems(VOTING, locale).find((i) => /hores lliures|horas libres|paid time off/.test(i.question));
    assert.match(leaveFaq?.answer ?? "", /EMT\/232\/2026/, `${locale}: FAQ cites the order`);
  }
  assert.ok(VOTING.sources.some((s) => s.url === EMT_232), "order in sources");
  assert.ok(!VOTING.sources.some((s) => s.url.includes("1983506.pdf")), "the 2023 order left the sources");
});

test("'can I vote without a DNI' quotes LOREG 85.1; the holiday FAQ says shops may open and links the shops guide", () => {
  const q: Record<Locale, string> = { ca: "Puc votar sense DNI?", es: "¿Se puede votar sin DNI?", en: "Can I vote without a DNI?" };
  const holiday: Record<Locale, RegExp> = { ca: /^El 29 de novembre és festiu/, es: /^¿El 29 de noviembre es festivo/, en: /^Is 29 November a public holiday/ };
  const closed = closedOn("2026-11-29");
  assert.ok(closed.length > 0);
  for (const locale of LOCALES) {
    const faq = faqItems(VOTING, locale);
    const id = faq.find((i) => i.question === q[locale]);
    assert.ok(id, `${locale}: no-DNI FAQ`);
    assert.ok(id.answer.includes("pasaporte o permiso de conducir en que aparezca la fotografía del titular"), `${locale}: LOREG 85.1 quoted`);
    assert.match(id.answer, /85\.1/);
    const day = faq.find((i) => holiday[locale].test(i.question));
    assert.ok(day, `${locale}: holiday FAQ`);
    assert.ok(day.answer.includes(`](${b2href("shops", locale)})`), `${locale}: links the shops guide`);
    for (const town of closed) assert.ok(day.answer.includes(town), `${locale}: names ${town}`);
  }
});

test("election night answers blank vs null, D'Hondt with the law's own example, the Senate and seats per province", () => {
  const titles: Record<Locale, string[]> = {
    ca: ["Vot en blanc i vot nul: diferències i com compta cadascun", "Com es reparteixen els escons: la llei d'Hondt i el mínim del 3 %", "Com s'elegeixen els senadors: els quatre més votats de cada província"],
    es: ["Voto en blanco y voto nulo: diferencias y cómo cuenta cada uno", "Cómo se reparten los escaños: la ley D'Hondt y el mínimo del 3 %", "Cómo se eligen los senadores: los cuatro más votados de cada provincia"],
    en: ["Blank vote and spoilt (null) vote in Spain: the difference and how each counts", "How seats are allocated: the D'Hondt method and the 3 % threshold", "How senators are elected: the four most voted in each province"],
  };
  const num = (cell: string) => Number(cell.replace(/[*.,]/g, ""));
  for (const locale of LOCALES) {
    const headings = h2s(ELECTION_NIGHT, locale);
    for (const t of titles[locale]) assert.ok(headings.includes(t), `${locale}: ${t}`);
    const text = plain(ELECTION_NIGHT, locale);
    // The law's own words, in Spanish in every edition (LOREG arts. 96.5, 163.1.a, 166.1.b).
    assert.ok(text.includes("Se considera voto en blanco, pero válido"), `${locale}: 96.5`);
    assert.ok(text.includes("el 3 por 100 de los votos válidos emitidos en la circunscripción"), `${locale}: 163.1.a`);
    assert.ok(text.includes("serán proclamados electos aquellos candidatos que obtengan mayor número de votos"), `${locale}: 166.1.b`);
    const json = JSON.stringify(preVote(ELECTION_NIGHT.editions[locale].blocks));
    for (const anchor of ["#anoventayseis", "#acientosesentaytres", "#acientosesentayseis", "#acientotres"]) assert.ok(json.includes(anchor), `${locale}: ${anchor}`);
    const tables = blocks(ELECTION_NIGHT, locale).filter((b) => b.type === "table");
    // The worked example is the LOREG's own (art. 163.1.c): recompute D'Hondt for 8 seats from the ÷1 column.
    const example = tables.find((b) => (b.rows ?? []).length === 6 && b.rows?.[0]?.[0] === "A");
    assert.ok(example?.rows, `${locale}: example table`);
    const votes = example.rows.map((r) => num(r[1] ?? ""));
    assert.deepEqual(votes, [168000, 104000, 72000, 64000, 40000, 32000], `${locale}: the law's figures`);
    const top8 = votes
      .flatMap((v, i) => [1, 2, 3, 4, 5, 6, 7, 8].map((d) => ({ i, q: v / d })))
      .sort((x, y) => y.q - x.q)
      .slice(0, 8);
    const seats = votes.map((_, i) => top8.filter((x) => x.i === i).length);
    assert.deepEqual(example.rows.map((r) => Number(r[5])), seats, `${locale}: seats match D'Hondt`);
    assert.deepEqual(seats, [4, 2, 1, 1, 0, 0], "the law's result");
    // Seats per province: Real Decreto 806/2026, art. 3 and annex.
    const perProvince = tables.find((b) => (b.rows ?? []).some((r) => r[0] === "Barcelona"));
    assert.deepEqual(perProvince?.rows?.slice(0, 4).map((r) => r.slice(0, 3)), [["Barcelona", "32", "4"], ["Girona", "6", "4"], ["Lleida", "4", "4"], ["Tarragona", "6", "4"]], locale);
  }
  assert.ok(ELECTION_NIGHT.sources.some((s) => s.url === "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742"), "RD 806/2026");
});

test("the mesa guide gives Ordre EMT/232/2026 (first five hours, night shift) and the 8:00 rule of LOREG 80.1", () => {
  const time: Record<Locale, string> = { ca: "A quina hora he de ser a la mesa electoral?", es: "¿A qué hora hay que estar en la mesa electoral?", en: "What time do I have to be at the polling station?" };
  for (const locale of LOCALES) {
    const json = JSON.stringify(MESA.editions[locale].blocks);
    assert.ok(json.includes(`](${EMT_232})`), `${locale}: links the order`);
    assert.doesNotMatch(json, /EMT\/178\/2023/, `${locale}: the 2023 order is gone`);
    const text = plain(MESA, locale);
    assert.match(text, /cinc primeres|cinco primeras|first five/, `${locale}: the first five hours`);
    assert.doesNotMatch(text, DOGC_NOT_YET, `${locale}: stale "not yet in the DOGC"`);
    const at8 = faqItems(MESA, locale).find((i) => i.question === time[locale]);
    assert.ok(at8?.answer.includes("se reúnen a las ocho horas del día fijado para la votación"), `${locale}: LOREG 80.1 quoted`);
    assert.ok(json.includes("#acientocuarentaytres"), `${locale}: the penalty links LOREG art. 143`);
  }
  assert.ok(MESA.sources.some((s) => s.url === EMT_232), "order in sources");
});

test("the town pages' polling-day block gives Catalonia's paid hours; on 30 Nov it says the first five hours", () => {
  const emt = `](${EMT_232})`;
  const text = (b: ElectionDayBlock | null) => (b ? [b.title, ...b.md].join("\n") : "");
  const salou = SNAPSHOT.municipalities.find((x) => x.slug === "salou");
  assert.ok(salou, "salou is in the snapshot");
  for (const locale of LOCALES) {
    const polling = text(electionDayBlock(locale, "polling", { resultsUrl: null }));
    assert.ok(polling.includes(emt), `${locale}: polling-day line links the order`);
    assert.match(polling, /dues si|dos si|two if/, `${locale}: the two-hour tier`);
    const after = text(townElectionDay(salou, locale, electionPhase(new Date("2026-11-30T08:00:00Z"))));
    assert.ok(after.includes(emt), `${locale}: day-after line links the order`);
    assert.match(after, /cinc primeres|cinco primeras|first five/, `${locale}: the first five hours`);
  }
});
