import assert from "node:assert/strict";
import { test } from "node:test";

import { MESA } from "../src/lib/content/batch02/mesa.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/**
 * Election cluster, 28 Oct 2026: body-only answers for the queries Search
 * Console shows the mesa and how-to-vote guides already rank for (positions
 * 4-10). Facts re-read that day from the BOE (Orden INT/650/2026, LOREG), the
 * official 29N mesa manual, the INE and the Junta Electoral Central
 * (research_notes/growth-round3/election-cluster-2026-10-28.md). Titles and
 * descriptions are inside measurement windows (docs/SEO_EXPERIMENTS.md), so
 * the last test pins them to what main serves.
 */

type Item = { question: string; answer: string };
type B = { type: string; text?: string; level?: number; lead?: boolean; items?: (string | Item)[]; rows?: string[][] };

const blocks = (article: typeof MESA, locale: Locale) => article.editions[locale].blocks as unknown as B[];
const leadOf = (article: typeof MESA, locale: Locale) => blocks(article, locale).find((b) => b.type === "paragraph" && b.lead)?.text ?? "";
const h2s = (article: typeof MESA, locale: Locale) =>
  blocks(article, locale).filter((b) => b.type === "heading" && b.level === 2).map((b) => b.text ?? "");
const faqQuestions = (article: typeof MESA, locale: Locale) =>
  blocks(article, locale)
    .filter((b) => b.type === "faq")
    .flatMap((b) => (b.items as Item[]).map((item) => item.question));

/* -------------------------------------------------------------------------- */
/* Mesa electoral: how much, and when                                         */
/* -------------------------------------------------------------------------- */

test("mesa: the lead gives the 2026 amount, its order and when it is paid", () => {
  const when = { ca: /Quan es cobra:/, es: /Cuándo se cobra:/, en: /When it is paid:/ };
  const cash = { ca: /efectiu/, es: /efectivo/, en: /cash/ };
  for (const locale of LOCALES) {
    const lead = leadOf(MESA, locale);
    assert.match(lead, /75 €|€75/, `${locale}: amount`);
    assert.match(lead, /INT\/650\/2026/, `${locale}: the order`);
    assert.match(lead, /29 (de )?(novembre|noviembre|November)/, `${locale}: the election`);
    assert.match(lead, when[locale], `${locale}: when it is paid`);
    assert.match(lead, cash[locale], `${locale}: the only official word on the method`);
  }
});

test("mesa: separate 'how much' and 'when is it paid' sections, FAQ in the searched wording", () => {
  const titles = {
    ca: ["Quant es cobra per ser a una mesa electoral el 2026", "Quan es cobra per ser a una mesa electoral"],
    es: ["Cuánto pagan por estar en una mesa electoral en 2026", "Cuándo se cobra por estar en una mesa electoral"],
    en: ["How much polling-station duty pays in 2026", "When polling-station duty is paid"],
  };
  const questions = {
    ca: ["Quant es cobra per ser a una mesa electoral el 2026?", "Quan es cobra per ser a una mesa electoral el 2026?", "Quant et donen per anar a la mesa electoral?"],
    es: ["¿Cuánto pagan por estar en una mesa electoral en 2026?", "¿Cuándo se cobra por estar en una mesa electoral en 2026?", "¿Cuánto te dan por ir a la mesa electoral?"],
    en: ["How much does polling-station duty pay in Spain in 2026?", "When do you get paid for polling-station duty in 2026?", "What do you get for sitting on a polling-station table?"],
  };
  for (const locale of LOCALES) {
    const headings = h2s(MESA, locale);
    assert.deepEqual(headings.slice(0, 2), titles[locale], `${locale}: pay sections come first`);
    const faq = faqQuestions(MESA, locale);
    for (const q of questions[locale]) assert.ok(faq.includes(q), `${locale}: FAQ "${q}"`);
    // The order applies to every election held after 27 June 2026, 29N included.
    assert.match(bodyToPlainText(MESA.editions[locale].blocks), /29N|29 November/, `${locale}: applies to 29N`);
  }
});

test("mesa: no payment date or method is invented, and the amount is sourced", () => {
  for (const locale of LOCALES) {
    const text = bodyToPlainText(MESA.editions[locale].blocks);
    assert.doesNotMatch(text, /transfer|transferencia|transferència|bizum|cheque|\bxec\b/i, `${locale}: payment method`);
    assert.doesNotMatch(text, /(se paga|es paga|is paid|se cobra|es cobra)[^.]*(el|on|the) \d{1,2} (de )?(desembre|diciembre|December|gener|enero|January)/i, `${locale}: payment date`);
    assert.doesNotMatch(text, /70 €[^.]*2026|€70[^.]*2026/, `${locale}: the old amount is not presented as 2026`);
  }
  const urls = MESA.sources.map((s) => s.url);
  assert.ok(urls.includes("https://www.boe.es/buscar/act.php?id=BOE-A-2026-13948"), "Orden INT/650/2026");
  assert.ok(urls.includes("https://29neleccionesgenerales.es/pdf/miembros_mesas/MMM_G2026_castellano_para_web.pdf"), "29N manual");
  assert.equal(MESA.verifiedAt, "2026-10-28");
});

/* -------------------------------------------------------------------------- */
/* How to vote: next elections and where to vote, near the top               */
/* -------------------------------------------------------------------------- */

test("voting: the first two sections answer 'next elections' and 'where do I vote'", () => {
  const first = { ca: "Properes eleccions a Catalunya", es: "Próximas elecciones en Cataluña", en: "Next elections in Catalonia" };
  const second = { ca: /^On voto\?/, es: /^¿Dónde voto\?/, en: /^Where do I vote\?/ };
  for (const locale of LOCALES) {
    const headings = h2s(VOTING, locale);
    assert.equal(headings[0], first[locale], `${locale}: first section`);
    assert.match(headings[1] ?? "", second[locale], `${locale}: second section`);
  }
});

test("voting: municipal elections 'expected' on 23 May 2027 with LOREG 42.3, worded like the results hub", () => {
  const expected = { ca: /previstes per al (diumenge )?\*?\*?23 de maig de 2027/, es: /previstas para el (domingo )?\*?\*?23 de mayo de 2027/, en: /expected on (Sunday )?\*?\*?23 May 2027/ };
  const decree = { ca: /29 i el 30 de març de 2027/, es: /29 y el 30 de marzo de 2027/, en: /29 and 30 March 2027/ };
  for (const locale of LOCALES) {
    const raw = JSON.stringify(VOTING.editions[locale].blocks);
    assert.match(raw, expected[locale], `${locale}: expected, not fixed`);
    assert.match(raw, decree[locale], `${locale}: decree dates`);
    assert.match(raw, /42\.3/, `${locale}: legal basis`);
    const next = blocks(VOTING, locale).find((b) => b.type === "table");
    const parliament = next?.rows?.find((row) => /Parlament|Parliament/.test(row[0] ?? ""));
    assert.match(parliament?.[1] ?? "", /Sense data|Sin fecha|No date/, `${locale}: no Parlament date`);
  }
  const lead = leadOf(VOTING, "es");
  assert.match(lead, /próximas elecciones en Cataluña/i);
});

test("voting: where to vote = the INE finder, the census card, the 19 Nov list, no guessed domain", () => {
  for (const locale of LOCALES) {
    const raw = JSON.stringify(VOTING.editions[locale].blocks);
    assert.match(raw, /https:\/\/sede\.ine\.gob\.es\/ce-mesas\/\?lang=es_ES/, `${locale}: official finder`);
    assert.match(raw, /900 343 232/, `${locale}: census office line`);
    const text = bodyToPlainText(VOTING.editions[locale].blocks);
    assert.match(text, /2 (i|y|and) (el )?10 (de )?(novembre|noviembre|November)/, `${locale}: census card window`);
    assert.match(text, /19 (de )?(novembre|noviembre|November)[^.]*(INE|definitiv|final)|(INE|definitiv|final)[^.]*19 (de )?(novembre|noviembre|November)/, `${locale}: final list`);
    // Every outbound link in the body goes to an official or primary source.
    const hosts = [...raw.matchAll(/\]\((https?:\/\/[^/)]+)/g)].map((m) => new URL(m[1]!).hostname);
    for (const host of hosts) {
      assert.match(host, /(^|\.)((ine|boe|correos)\.es|gob\.es|29neleccionesgenerales\.es|juntaelectoralcentral\.es)$/, `${locale}: ${host}`);
    }
  }
});

test("voting: English answers the registration question in the first lines", () => {
  assert.match(leadOf(VOTING, "en"), /do not register to vote/);
  assert.ok(faqQuestions(VOTING, "en").includes("How do I vote in the 2026 Spanish general election?"));
  assert.ok(faqQuestions(VOTING, "en").includes("Do I need to register to vote in the 2026 Spanish general election?"));
  assert.ok(faqQuestions(VOTING, "es").includes("¿Dónde tengo que ir a votar el 29 de noviembre?"));
  assert.ok(faqQuestions(VOTING, "ca").includes("Quan són les properes eleccions a Catalunya?"));
  // 30 Oct 2026: "dónde voto dni", "2026 spain general election dates", "what time the polls open".
  assert.ok(faqQuestions(VOTING, "es").includes("¿Puedo saber dónde voto con el DNI?"));
  assert.ok(faqQuestions(VOTING, "ca").includes("Puc saber on voto amb el DNI?"));
  assert.ok(faqQuestions(VOTING, "en").includes("What are the key dates of the 2026 Spain general election?"));
  assert.ok(faqQuestions(VOTING, "en").includes("What time do the polls open and close on 29 November?"));
  // 30 Oct 2026, wave 4: English searchers are often foreigners. The lead's
  // first sentence says who can vote (LOREG art. 2.1: Spanish citizens only),
  // and the FAQ answers "when", "can foreigners vote", the finder and CERA.
  const firstSentence = leadOf(VOTING, "en").split(/\.\s/)[0] ?? "";
  assert.match(firstSentence, /Sunday 29 November 2026/);
  assert.match(firstSentence, /9:00 to 20:00/);
  assert.match(firstSentence, /only Spanish citizens can vote/);
  assert.match(firstSentence, /EU citizens and other foreign residents cannot/);
  assert.match(VOTING.editions.en.seoDescription, /Only Spanish citizens can vote/);
  for (const q of [
    "When is the 2026 Spain general election?",
    "Can foreigners or EU citizens vote in Spain's general election?",
    "How do I find my polling station for the 2026 Spain general election?",
    "How do Spaniards living abroad vote (CERA)?",
  ]) assert.ok(faqQuestions(VOTING, "en").includes(q), `en FAQ: ${q}`);
  const enText = bodyToPlainText(VOTING.editions.en.blocks);
  assert.match(enText, /by 24 November/, "en: CERA postal deadline");
  assert.match(enText, /from 21 to 26 November/, "en: CERA ballot box at the consulate");
  assert.doesNotMatch(enText, /EU citizens (can|may) vote in (the|a) general election/i);
  // The finder is linked in the lead with what it asks for (read on 30 Oct 2026: no ID, Cl@ve or certificate).
  const finder = "](https://sede.ine.gob.es/ce-mesas/?lang=es_ES)";
  const noId: Record<"ca" | "es" | "en", RegExp> = { ca: /sense DNI ni Cl@ve/, es: /sin DNI ni Cl@ve/, en: /with no ID number or login/ };
  for (const locale of ["ca", "es", "en"] as const) {
    const leadBlock = JSON.stringify(VOTING.editions[locale].blocks[0]);
    assert.ok(leadBlock.includes(finder), `${locale}: finder in the lead`);
    assert.match(leadBlock, noId[locale], locale);
  }
});

test("voting: one link to the per-municipality results hub in each language", () => {
  const hub = { ca: "](/ca/eleccions/)", es: "](/es/elecciones/)", en: "](/en/elections/)" };
  for (const locale of LOCALES) {
    const raw = JSON.stringify(VOTING.editions[locale].blocks);
    assert.equal(raw.split(hub[locale]).length - 1, 1, `${locale}: hub link`);
  }
});

test("voting: MiDNI stays suspended; the JEC's 22 Oct condition is cited, not read as a green light", () => {
  for (const locale of LOCALES) {
    const text = bodyToPlainText(VOTING.editions[locale].blocks);
    assert.match(text, /(Acuerdo|Acord) 295\/2026/, `${locale}: Acuerdo 295/2026`);
    assert.match(text, /28 (d'|de )?(octubre|October)/, `${locale}: dated`);
    assert.doesNotMatch(text, /MiDNI[^.]*(és vàlid|es válid|is valid|is accepted|s'accepta|se acepta|ja serveix|ya sirve)/i, `${locale}: MiDNI presented as valid`);
  }
  assert.ok(VOTING.sources.some((s) => s.url.includes("idacuerdoinstruccion=154752")), "Acuerdo 295/2026 in sources");
});

/* -------------------------------------------------------------------------- */
/* Titles stay frozen                                                         */
/* -------------------------------------------------------------------------- */

test("titles and descriptions are exactly what main serves (measurement windows)", () => {
  const frozen = {
    // Changed in the 30 Oct 2026 CTR sweep (owner lifted the 14 Nov freeze;
    // logged in docs/SEO_EXPERIMENTS.md): the draw window leads the snippet.
    mesa: {
      ca: ["Membre de mesa electoral: què fer si t'ha tocat, quant es cobra i com excusar-te", "Membre de mesa electoral 2026: 75 €, sorteig i excuses", "Sorteig del 31 d'octubre al 4 de novembre; t'ho notifiquen en 3 dies i en tens 7 per excusar-te. Es cobren 75 € sense IRPF. Què fer si et toca."],
      es: ["Miembro de mesa electoral: qué hacer si te ha tocado, cuánto se cobra y cómo excusarte", "Mesa electoral 2026: se cobran 75 €, sorteo y excusas", "Sorteo del 31 de octubre al 4 de noviembre; te lo notifican en 3 días y tienes 7 para excusarte. Se cobran 75 € sin IRPF. Qué hacer si te toca."],
      en: ["Drawn for polling-station duty in Spain on 29 November: the €75 pay, excuses and what to do", "Polling-station duty in Spain 2026: €75 pay, excuses, time off", "Draw from 31 Oct to 4 Nov; you are notified within 3 days and have 7 to ask to be excused. The €75 allowance is tax-free. What to do if drawn."],
    },
    // Changed in the 30 Oct 2026 top-3 push (owner lifted the freeze; logged in docs/SEO_EXPERIMENTS.md).
    voting: {
      ca: ["Properes eleccions a Catalunya: quan són i com votar el 29 de novembre (on, horari, vot per correu)", "Properes eleccions a Catalunya: quan són i on votar el 29N", "Són el diumenge 29 de novembre de 2026 (generals), de 9 a 20 h. On voto: cercador de l'INE, sense DNI ni Cl@ve. Vot per correu fins al 19 de novembre."],
      es: ["Próximas elecciones en Cataluña: cuándo son y cómo votar el 29 de noviembre (dónde, horario, voto por correo)", "Próximas elecciones en Cataluña: cuándo son y dónde votar", "Son el domingo 29 de noviembre de 2026 (generales), de 9 a 20 h. Dónde voto: buscador del INE, sin DNI ni Cl@ve. Voto por correo hasta el 19 de noviembre."],
      // EN title and description changed again in the 30 Oct 2026 CTR sweep wave 4 (before deploy): the date back in the title, who can vote in the description.
      en: ["How to vote in Spain's 2026 general election on 29 November: registration, polling stations and dates", "Spain general election 29 Nov 2026: how to vote, register", "Sunday 29 November, polls 9:00-20:00. Only Spanish citizens can vote; no sign-up, the roll is automatic. Find your polling station; postal vote by 19 Nov."],
    },
  };
  for (const locale of LOCALES) {
    for (const [article, key] of [[MESA, "mesa"], [VOTING, "voting"]] as const) {
      const { title, seoTitle, seoDescription } = article.editions[locale];
      assert.deepEqual([title, seoTitle, seoDescription], frozen[key][locale], `${key}/${locale}`);
    }
  }
});
