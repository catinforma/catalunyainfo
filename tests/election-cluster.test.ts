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
  assert.equal(MESA.verifiedAt, "2026-11-05");
});

/* -------------------------------------------------------------------------- */
/* Mesa electoral, 3 Nov 2026: today's questions on the first screen          */
/* -------------------------------------------------------------------------- */

/**
 * The draw ends on 4 Nov and notices run to 7 Nov (Interior's 29N mesa page,
 * JEC calendar; LOREG 27.2-27.4 and 143, re-read 3 Nov 2026). Right under the
 * lead, a key-facts block answers: have I been drawn, what now, the excuse
 * deadline and where to file it (paper or the Cl@ve platform Interior links,
 * JEC Instrucción 2/2023), the pay, time off and the penalty. Nothing in it
 * may invent a payment date or an online "were you drawn" lookup.
 */
test("mesa: a key-facts block right after the lead answers today's questions", () => {
  const app = "https://www.mesaselectorales.es/web-excusas-form/#/login";
  const words: Record<Locale, RegExp[]> = {
    ca: [/notificació/, /7 de novembre/, /7 dies des de la notificació/, /Junta Electoral de Zona/, /Cl@ve/, /75 €/, /dilluns 30 de novembre/, /delicte/, /65 anys/],
    es: [/notificación/, /7 de noviembre/, /7 días desde la notificación/, /Junta Electoral de Zona/, /Cl@ve/, /75 €/, /lunes 30 de noviembre/, /delito/, /65 años/],
    en: [/notification/, /7 November/, /7 days from the notification/, /Junta Electoral de Zona/, /Cl@ve/, /€75/, /Monday 30 November/, /criminal offence/, /65/],
  };
  for (const locale of LOCALES) {
    const all = MESA.editions[locale].blocks as unknown as { type: string; items?: { label: string; value: string }[] }[];
    assert.equal(all[0]?.type, "paragraph", `${locale}: lead first`);
    assert.equal(all[1]?.type, "keyFacts", `${locale}: key facts second`);
    const facts = (all[1]?.items ?? []).map((item) => `${item.label} ${item.value}`).join(" ");
    for (const pattern of words[locale]) assert.match(facts, pattern, `${locale}: ${pattern}`);
    assert.ok(facts.includes(`](${app})`), `${locale}: the excuse platform Interior links to`);
    assert.doesNotMatch(facts, /transfer|transferencia|transferència|bizum|cheque|\bxec\b/i, `${locale}: payment method`);
    // The lead names the notice deadline and the 7 days in the first screen.
    assert.match(leadOf(MESA, locale), /7 (de )?(novembre|noviembre|November)/, `${locale}: notice deadline in the lead`);
  }
  const urls = MESA.sources.map((s) => s.url);
  assert.ok(urls.includes("https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-9416"), "JEC Instrucción 2/2023");
  assert.ok(urls.includes("https://29neleccionesgenerales.es/informacion-mesas/informacion-general/recurso-contra-la-designacion-impedimentos-y-excusas/"), "Interior's excuses page");
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
    // Dated: re-checked on 3 Nov 2026 against the JEC's sessions to 29 Oct.
    assert.match(text, /a 3 de (novembre|noviembre) (encara no|aún no)|not done so by 3 November/, `${locale}: dated`);
    assert.doesNotMatch(text, /MiDNI[^.]*(és vàlid|es válid|is valid|is accepted|s'accepta|se acepta|ja serveix|ya sirve)/i, `${locale}: MiDNI presented as valid`);
  }
  assert.ok(VOTING.sources.some((s) => s.url.includes("idacuerdoinstruccion=154752")), "Acuerdo 295/2026 in sources");
});

/* -------------------------------------------------------------------------- */
/* Titles stay frozen                                                         */
/* -------------------------------------------------------------------------- */

test("titles and descriptions are exactly what main serves (measurement windows)", () => {
  const frozen = {
    // Changed on 3 Nov 2026 (owner's "right now" push lifted the freezes;
    // logged in docs/SEO_EXPERIMENTS.md, measured 15 Nov and 1 Dec): the
    // snippet answers "have I been drawn" (notice by 7 Nov), the 7 days to
    // object and where, the €75 and Monday's five hours.
    mesa: {
      ca: ["Membre de mesa electoral: com saber si t'ha tocat, què fer, quant es cobra i com excusar-te", "Membre de mesa electoral 2026: si t'ha tocat, excusa i 75 €", "T'ho notifiquen fins al 7 de novembre; tens 7 dies per excusar-te a la Junta Electoral de Zona, també en línia. Dieta de 75 € i 5 h menys el dilluns 30."],
      es: ["Mesa electoral: cómo saber si te ha tocado, qué hacer, cuánto se cobra y cómo excusarte", "Mesa electoral 2026: si te ha tocado, plazo de excusa y 75 €", "Notificación hasta el 7 de noviembre; luego, 7 días para excusarte ante la Junta Electoral de Zona, también en línea. Dieta de 75 € y 5 h menos el lunes."],
      en: ["Drawn for polling-station duty (mesa electoral) in Spain on 29 November: what to do, excuses and the €75 pay", "Polling-station duty in Spain (mesa electoral): €75, excuses", "Notified by 7 Nov? You have 7 days to ask the Junta Electoral de Zona to excuse you, online with Cl@ve too. €75 tax-free, 5 hours off on Monday 30 Nov."],
    },
    // Changed on 3 Nov 2026 (same push): ca in the words of "quan són les
    // properes eleccions", es with "29N" back, en front-loads "2026 spain
    // general election"; descriptions give the dates, the finder and 19 Nov.
    voting: {
      ca: ["Quan són les properes eleccions a Catalunya i com votar el 29 de novembre (on, horari, vot per correu)", "Quan són les properes eleccions a Catalunya? 29N i on votar", "Generals: diumenge 29 de novembre, 9-20 h. Municipals previstes: 23 de maig de 2027. Mira on votes sense DNI. Vot per correu fins al 19 de novembre."],
      es: ["Próximas elecciones en Cataluña: cuándo son y cómo votar el 29 de noviembre (dónde, horario, voto por correo)", "Próximas elecciones en Cataluña: 29N, cuándo y dónde votar", "Generales: domingo 29 de noviembre, 9-20 h. Municipales previstas: 23 de mayo de 2027. Mira dónde votas sin DNI. Voto por correo hasta el 19 de noviembre."],
      en: ["How to vote in Spain's 2026 general election on 29 November: registration, polling stations and dates", "2026 Spain general election (29 Nov): how to vote, register", "Sunday 29 Nov, 9:00-20:00. Only Spanish citizens can vote; the roll is automatic. Find your polling station, ID rules; postal vote request by 19 Nov."],
    },
  };
  for (const locale of LOCALES) {
    for (const [article, key] of [[MESA, "mesa"], [VOTING, "voting"]] as const) {
      const { title, seoTitle, seoDescription } = article.editions[locale];
      assert.deepEqual([title, seoTitle, seoDescription], frozen[key][locale], `${key}/${locale}`);
    }
  }
});
