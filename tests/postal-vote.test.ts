import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { MESA } from "../src/lib/content/batch02/mesa.ts";
import {
  POSTAL_29N,
  POSTAL_AS_OF,
  POSTAL_URL,
  POSTAL_VOTE,
  POSTAL_VOTE_PATHS,
  buildPostalVote,
  postalPhase,
  type PostalPhase,
} from "../src/lib/content/batch02/postal-vote.ts";
import { B2_PATHS, B2_TITLES, b2href, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { madridDate } from "../src/lib/content/batch02/strikes.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { hubCopy } from "../src/lib/programmatic/elections/hub.ts";
import { SNAPSHOT } from "../src/lib/programmatic/elections/snapshot.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/**
 * Postal vote for 29N (5 Nov 2026): one page per language, every fact from
 * the LOREG (arts. 72-73), the JEC calendar, Correos, Interior's 29N site and
 * the INE, read that day.
 *
 * What it must never do: say Cl@ve works for the online request (no official
 * page lists it), let a requester think they can still vote in person, print
 * a weekday that does not match its date, or keep telling people to apply
 * after 19 November.
 */

const PHASES: PostalPhase[] = ["open", "closed", "over"];
const AT: Record<PostalPhase, string> = { open: "2026-11-05", closed: "2026-11-20", over: "2026-11-30" };

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const body = (locale: Locale, article = POSTAL_VOTE) => text(article.editions[locale].blocks);
const json = (locale: Locale, article = POSTAL_VOTE) => JSON.stringify(article.editions[locale].blocks);
const plain = (value: string) => value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
const leadOf = (locale: Locale, article = POSTAL_VOTE) => plain(String((article.editions[locale].blocks[0] as { text?: string }).text ?? ""));

/** Each paragraph, list item, step, callout and FAQ question with its answer. */
function units(locale: Locale, article = POSTAL_VOTE): string[] {
  const out: string[] = [];
  for (const block of article.editions[locale].blocks as unknown as Record<string, unknown>[]) {
    if (block.type === "paragraph" || block.type === "callout") out.push(plain(String(block.text)));
    if (block.type === "list") out.push(...(block.items as string[]).map(plain));
    if (block.type === "steps") out.push(...(block.items as { title: string; text: string }[]).map((i) => plain(`${i.title}: ${i.text}`)));
    if (block.type === "faq") out.push(...(block.items as { question: string; answer: string }[]).map((i) => plain(`${i.question} ${i.answer}`)));
  }
  return out;
}

const ROOT = new URL("..", import.meta.url);
const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS)];
const PUBLISHED = new Set(ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)));
const OFFICIAL_HOSTS = [
  "www.correos.es",
  "29neleccionesgenerales.es",
  "www.ine.es",
  "sede.ine.gob.es",
  "www.boe.es",
  "www.juntaelectoralcentral.es",
];

/* -------------------------------------------------------------------------- */
/* Structure, paths, SEO                                                      */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on year-free registry paths, in every phase", () => {
  const expected: Record<Locale, string> = { ca: "guies/vot-per-correu", es: "guias/voto-por-correo", en: "guides/postal-vote-spain" };
  for (const phase of PHASES) {
    const article = buildPostalVote(AT[phase]);
    for (const locale of LOCALES) {
      const edition = article.editions[locale];
      const parsed = bodySchema.safeParse(edition.blocks);
      assert.ok(parsed.success, `${phase}/${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
      assert.ok(wordCount(text(edition.blocks)) > 1200, `${phase}/${locale} is thin`);
      assert.equal(edition.path, expected[locale]);
      assert.equal(edition.path, B2_PATHS.postalVote[locale]);
      assert.equal(edition.path, POSTAL_VOTE_PATHS[locale]);
      assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    }
  }
  assert.equal(POSTAL_VOTE.key, "postalVote");
  assert.equal(POSTAL_VOTE.entryKey, "guide-postal-vote");
  for (const locale of LOCALES) assert.doesNotMatch(B2_TITLES.postalVote[locale], /\b19\b|\b25\b/, `${locale}: the rail title carries no deadline`);
});

test("the new paths collide with no registry path, no route folder and no legacy redirect", () => {
  for (const locale of LOCALES) {
    const path = B2_PATHS.postalVote[locale];
    assert.equal(ALL_PATHS.filter((paths) => paths[locale] === path).length, 1, `${locale}: ${path}`);
  }
  const app = join(ROOT.pathname.replace(/^\/([A-Za-z]:)/, "$1"), "src/app/(public)/[locale]");
  const folders = readdirSync(app).filter((name) => statSync(join(app, name)).isDirectory());
  for (const segment of ["guies", "guias", "guides"]) assert.ok(!folders.includes(segment), `a route folder shadows ${segment}/`);
  const redirects = readFileSync(new URL("../migration/redirects.csv", import.meta.url), "utf8");
  for (const locale of LOCALES) assert.ok(!redirects.includes(B2_PATHS.postalVote[locale]), locale);
});

test("titles fit in 60 characters and descriptions in 155; each phase's snippet gives that phase's deadline", () => {
  const deadline: Record<PostalPhase, RegExp> = { open: /\b19\b/, closed: /\b25\b/, over: /29N|29 Nov/ };
  for (const phase of PHASES) {
    const article = buildPostalVote(AT[phase]);
    for (const locale of LOCALES) {
      const { seoTitle, seoDescription, title, excerpt } = article.editions[locale];
      assert.ok(seoTitle.length > 20 && seoTitle.length <= 60, `${phase}/${locale} title ${seoTitle.length}: ${seoTitle}`);
      assert.ok(seoDescription.length > 80 && seoDescription.length <= 155, `${phase}/${locale} description ${seoDescription.length}: ${seoDescription}`);
      assert.match(seoTitle, locale === "en" ? /[Pp]ostal vote/ : locale === "ca" ? /^Vot per correu/ : /^Voto por correo/);
      assert.match(`${seoTitle} ${seoDescription}`, deadline[phase], `${phase}/${locale}`);
      assert.ok(title.length > seoTitle.length, `${phase}/${locale}: the H1 says more than the title`);
      assert.ok(excerpt.length > 30 && excerpt.length <= 200, `${locale} excerpt ${excerpt.length}`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

test("the 29N dates follow the law from the 6 Oct call and the 29 Nov vote, with the right weekdays", () => {
  assert.equal(weekdayIndex(POSTAL_29N.election), 0, "29 Nov is a Sunday");
  assert.equal(weekdayIndex(POSTAL_29N.requestBy), 4, "19 Nov is a Thursday");
  assert.equal(weekdayIndex(POSTAL_29N.deliverBy), 3, "25 Nov is a Wednesday");
  const day = (iso: string) => Date.parse(`${iso}T12:00:00Z`) / 86_400_000;
  // LOREG 72.a: until the tenth day before; 73.2: from day 34 after the call, before the sixth day before; 73.3: before the third day before.
  assert.equal(day(POSTAL_29N.election) - day(POSTAL_29N.requestBy), 10);
  assert.equal(day(POSTAL_29N.sendFrom) - day("2026-10-06"), 34);
  assert.equal(day(POSTAL_29N.election) - day(POSTAL_29N.sendTo), 7);
  assert.equal(day(POSTAL_29N.election) - day(POSTAL_29N.deliverBy), 4);
});

test("every weekday printed next to a day of the month matches the date", () => {
  const weekdays: Record<Locale, string[]> = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  };
  for (const phase of PHASES) {
    const article = buildPostalVote(AT[phase]);
    for (const locale of LOCALES) {
      const all = [body(locale, article), article.editions[locale].seoDescription].join(" ");
      const pattern = new RegExp(`\\b(${weekdays[locale].join("|")}) (\\d{1,2})\\b`, "gi");
      let seen = 0;
      for (const m of all.matchAll(pattern)) {
        const iso = `2026-11-${String(Number(m[2])).padStart(2, "0")}`;
        const index = weekdays[locale].findIndex((w) => w.toLowerCase() === m[1]!.toLowerCase());
        assert.equal(weekdayIndex(iso), index, `${phase}/${locale}: "${m[0]}"`);
        seen++;
      }
      assert.ok(seen >= 6, `${phase}/${locale}: only ${seen} weekday-day pairs`);
    }
  }
});

test("answer first: the lead gives the request deadline and the hand-in deadline, then the steps", () => {
  const request: Record<Locale, string> = { ca: "19 de novembre", es: "19 de noviembre", en: "19 November" };
  const handIn: Record<Locale, RegExp> = { ca: /25 de novembre/, es: /25 de noviembre/, en: /25 November/ };
  for (const locale of LOCALES) {
    const lead = leadOf(locale, buildPostalVote(AT.open));
    assert.ok(lead.slice(0, 80).includes(request[locale]), `${locale}: ${lead.slice(0, 100)}`);
    assert.match(lead, handIn[locale], `${locale}: hand-in deadline in the lead`);
    assert.match(lead, /Corre[uo]s/, `${locale}: where`);
    const blocks = POSTAL_VOTE.editions[locale].blocks as unknown as { type: string; items?: unknown[] }[];
    assert.equal(blocks[0]?.type, "paragraph");
    assert.equal(blocks[1]?.type, "steps", `${locale}: the steps right under the lead`);
    assert.ok((blocks[1]?.items?.length ?? 0) >= 5, `${locale}: five steps`);
  }
});

test("the copy moves with the dates: open to 19 Nov, closed to 29 Nov, over after polling day", () => {
  assert.equal(postalPhase("2026-11-19"), "open");
  assert.equal(postalPhase("2026-11-20"), "closed");
  assert.equal(postalPhase("2026-11-29"), "closed");
  assert.equal(postalPhase("2026-11-30"), "over");
  const closed: Record<Locale, RegExp> = { ca: /es va tancar/, es: /cerró/, en: /closed on/ };
  const over: Record<Locale, RegExp> = { ca: /ja s'ha acabat/, es: /ya ha terminado/, en: /is over/ };
  const asksToApply: Record<Locale, RegExp> = { ca: /Demana el vot per correu fins/, es: /Pide el voto por correo hasta/, en: /Apply for a postal vote by/ };
  for (const locale of LOCALES) {
    assert.match(leadOf(locale, buildPostalVote(AT.open)), asksToApply[locale]);
    for (const phase of ["closed", "over"] as const) {
      const article = buildPostalVote(AT[phase]);
      assert.doesNotMatch(leadOf(locale, article), asksToApply[locale], `${phase}/${locale}: still asks people to apply`);
      assert.match(leadOf(locale, article), phase === "closed" ? closed[locale] : over[locale], `${phase}/${locale}`);
      const firstFaq = (article.editions[locale].blocks.find((b) => b.type === "faq") as { items: { answer: string }[] }).items[0]!.answer;
      assert.match(firstFaq, phase === "closed" ? /tancat|cerrado|closed/ : /29N|29 November/, `${phase}/${locale}: the deadline FAQ`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* What the page must and must not say                                        */
/* -------------------------------------------------------------------------- */

test("Cl@ve is never offered for the online request; a certificate or electronic DNI is", () => {
  for (const locale of LOCALES) {
    for (const unit of units(locale).filter((u) => u.includes("Cl@ve"))) {
      assert.match(unit, /\bno\b|\bsense\b|\bsin\b|\bnot\b|\bNi\b|Neither|\bnomés\b|\bsolo\b|\bonly\b/, `${locale}: "${unit}"`);
    }
    assert.match(body(locale), locale === "en" ? /digital certificate/ : locale === "ca" ? /certificat digital/ : /certificado digital/);
    assert.match(body(locale), /AutoFirma/);
  }
});

test("'already applied, can I vote in person?' is answered no, with the census 'C'", () => {
  const no: Record<Locale, RegExp> = {
    ca: /ja no pots votar en persona/,
    es: /ya no puedes votar en persona/,
    en: /can no longer vote in person/,
  };
  for (const locale of LOCALES) {
    assert.match(leadOf(locale), no[locale], `${locale}: in the lead`);
    assert.match(body(locale), /«C»|"C"/, `${locale}: the census mark`);
    const faqs = (POSTAL_VOTE.editions[locale].blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] }).items;
    const inPerson = faqs.find((f) => /en persona|in person/.test(f.question));
    assert.ok(inPerson, `${locale}: FAQ on voting in person`);
    assert.match(inPerson!.answer, /^No\b/, `${locale}: ${inPerson!.answer}`);
  }
});

test("the official steps are there: ID without photocopies, illness, absence, certificate in the envelope, free, someone else hands it in", () => {
  const words: Record<Locale, RegExp[]> = {
    ca: [/fotocòpia/, /autorització notarial/, /certificat mèdic oficial/, /avís/, /certificat d'inscripció al cens/, /sobre blanc|sobre de votació \*\*blanc/, /sepia/, /900 343 232/, /no necessita segell/, /justificant|model d'autorització/],
    es: [/fotocopia/, /autorización notarial/, /certificado médico oficial/, /aviso/, /certificado de inscripción en el censo/, /blanco/, /sepia/, /900 343 232/, /no necesita franqueo/, /modelo de autorización/],
    en: [/photocop/, /notarised/, /official medical certificate/, /notice/, /census certificate/, /white/, /sepia/, /900 343 232/, /needs no stamp/, /model/],
  };
  for (const locale of LOCALES) {
    const b = body(locale);
    for (const pattern of words[locale]) assert.match(b, pattern, `${locale}: ${pattern}`);
    assert.ok(json(locale).includes(POSTAL_URL.tracking), `${locale}: the INE tracking service`);
    assert.ok(json(locale).includes(POSTAL_URL.ineForm), `${locale}: the INE form`);
    assert.ok(json(locale).includes(POSTAL_URL.correos), `${locale}: Correos`);
    // No opening hours: Correos only says "usual opening hours".
    assert.doesNotMatch(b.replace(/\b(0?9|20)[:.]00\b|\b(9|20) ?h\b|\b8[.:]00\b|9 del matí|9 de la mañana/g, ""), /\b\d{1,2}[:.]\d{2}\b|\b\d{1,2} ?h\b/, `${locale}: a clock time other than the polls'`);
  }
});

test("voters abroad: CERA by 24 Nov to the consulate or 21-26 Nov at the ballot box, ERTA closed on 31 Oct", () => {
  const words: Record<Locale, RegExp[]> = {
    ca: [/24 de novembre/, /del 21 al 26 de novembre/, /31 d'octubre/, /CERA/, /ERTA/],
    es: [/24 de noviembre/, /del 21 al 26 de noviembre/, /31 de octubre/, /CERA/, /ERTA/],
    en: [/24 November/, /from 21 to 26 November/, /31 October/, /CERA/, /ERTA/],
  };
  for (const locale of LOCALES) for (const pattern of words[locale]) assert.match(body(locale), pattern, `${locale}: ${pattern}`);
});

test("sources are official, https, listed once, and the reader sees the check date", () => {
  assert.ok(POSTAL_VOTE.sources.length >= 8);
  for (const source of POSTAL_VOTE.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/[?&]utm_|aerobusbcn/i.test(source.url), source.url);
    assert.ok(OFFICIAL_HOSTS.includes(new URL(source.url).host), `${source.url} is not official`);
  }
  assert.equal(new Set(POSTAL_VOTE.sources.map((s) => s.url)).size, POSTAL_VOTE.sources.length, "a source is listed twice");
  for (const url of [POSTAL_URL.correos, POSTAL_URL.interior, POSTAL_URL.ine, POSTAL_URL.jec, POSTAL_URL.loreg, "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742"]) {
    assert.ok(POSTAL_VOTE.sources.some((s) => s.url === url), `missing ${url}`);
  }
  assert.equal(POSTAL_VOTE.verifiedAt, POSTAL_AS_OF);
  const checked: Record<Locale, RegExp> = { ca: /5 de novembre de 2026/, es: /5 de noviembre de 2026/, en: /5 November 2026/ };
  for (const locale of LOCALES) assert.match(body(locale), checked[locale], locale);
});

test("external links go to official sites only; internal links stay in their language and exist", () => {
  for (const locale of LOCALES) {
    const raw = json(locale);
    const external = [...raw.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]!);
    assert.ok(external.length >= 5, `${locale}: only ${external.length} official links`);
    for (const href of external) {
      assert.match(href, /^https:\/\//, href);
      assert.ok(OFFICIAL_HOSTS.includes(new URL(href).host), `${locale}: ${href}`);
    }
    for (const match of raw.matchAll(/\]\((\/[^)]*)\)/g)) {
      const href = match[1] ?? "";
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
    }
    assert.ok(raw.includes(`](${b2href("voting", locale)})`), `${locale}: links back to the how-to-vote guide`);
  }
});

test("no new photograph: the how-to-vote guide's hero, with its alt and caption", () => {
  assert.equal(POSTAL_VOTE.heroKey, VOTING.heroKey);
  assert.ok(POSTAL_VOTE.heroKey && IMAGE_BY_KEY.has(POSTAL_VOTE.heroKey));
  assert.deepEqual(POSTAL_VOTE.heroAlt, VOTING.heroAlt);
  assert.deepEqual(POSTAL_VOTE.heroCaption, VOTING.heroCaption);
  assert.equal(POSTAL_VOTE.secondaryKey, undefined);
  for (const locale of LOCALES) {
    assert.ok(!POSTAL_VOTE.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"), locale);
  }
});

test("the read-next box only repeats links from the related rail", () => {
  for (const locale of LOCALES) {
    const before = POSTAL_VOTE.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string } | undefined;
    for (const link of box?.text.match(/\]\(([^)]+)\)/g) ?? []) {
      assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Links in, publish group                                                    */
/* -------------------------------------------------------------------------- */

test("the how-to-vote guide keeps its 'Postal vote' heading and links here from it, the warning and the rail", () => {
  const heading: Record<Locale, string> = { ca: "Vot per correu", es: "Voto por correo", en: "Postal vote" };
  for (const locale of LOCALES) {
    const blocks = VOTING.editions[locale].blocks as unknown as { type: string; text?: string; level?: number; items?: string[] }[];
    const target = `](${b2href("postalVote", locale)})`;
    const at = blocks.findIndex((b) => b.type === "heading" && b.level === 2 && b.text === heading[locale]);
    assert.ok(at > 0, `${locale}: the #voto-por-correo heading is unchanged`);
    assert.ok(String(blocks[at + 1]?.text).includes(target), `${locale}: the section links here`);
    assert.equal(blocks[at + 2]?.type, "heading", `${locale}: the section is one paragraph`);
    const warn = blocks.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "warning");
    assert.ok(String(warn?.text).includes(target), `${locale}: the warning links here`);
    const rail = blocks[blocks.length - 1];
    assert.ok(rail?.items?.[0]?.includes(target), `${locale}: first in the related rail`);
  }
});

test("the election hub (until 29N results) and the town pages' voting line link here", () => {
  for (const locale of LOCALES) {
    const intro = hubCopy(locale).intro.join(" ");
    if (!SNAPSHOT.general2026) assert.ok(intro.includes(`](${b2href("postalVote", locale)})`), `${locale}: hub`);
  }
  const model = readFileSync(new URL("../src/lib/programmatic/elections/model.ts", import.meta.url), "utf8");
  for (const locale of LOCALES) assert.ok(model.includes(`b2href("postalVote", "${locale}")`), `${locale}: town pages`);
});

test("the publish route registers `vot-correu`", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("vot-correu"\)\) published\.push\(await publishB2Article\(POSTAL_VOTE\)\)/);
});

/* -------------------------------------------------------------------------- */
/* Mesa electoral, 5 Nov: what people ask once drawn                          */
/* -------------------------------------------------------------------------- */

test("mesa (5 Nov): the draw is past, what to bring, alegaciones, substitutes and Orden INT/650/2026", () => {
  const words: Record<Locale, { past: RegExp; bring: RegExp; allege: RegExp; faqs: RegExp[] }> = {
    ca: { past: /es va fer entre el 31 d'octubre/, bring: /portar/, allege: /al·legació/, faqs: [/al·legacions/, /portar/, /suplents/, /Orden INT\/650\/2026/] },
    es: { past: /se hizo entre el 31 de octubre/, bring: /llevar/, allege: /alegación/, faqs: [/alegaciones/, /llevar/, /suplentes/, /Orden INT\/650\/2026/] },
    en: { past: /was held between 31 October/, bring: /bring/, allege: /objection/, faqs: [/objection/, /bring/, /[Ss]ubstitutes/, /Orden INT\/650\/2026/] },
  };
  for (const locale of LOCALES) {
    const blocks = MESA.editions[locale].blocks as unknown as { type: string; text?: string; items?: { label?: string; value?: string; question?: string; answer?: string }[] }[];
    assert.match(String(blocks[0]?.text), words[locale].past, `${locale}: lead`);
    const labels = (blocks[1]?.items ?? []).map((i) => i.label ?? "");
    assert.ok(labels.some((l) => words[locale].bring.test(l)), `${locale}: what to bring`);
    assert.ok(labels.some((l) => words[locale].allege.test(l)), `${locale}: alegación in the excuse label`);
    const questions = (blocks.find((b) => b.type === "faq")?.items ?? []).map((i) => i.question ?? "");
    for (const pattern of words[locale].faqs) assert.ok(questions.some((q) => pattern.test(q)), `${locale}: FAQ ${pattern}`);
    const raw = JSON.stringify(blocks);
    assert.match(raw, /justificant d'assistència|justificante de asistencia|certificate of attendance/, `${locale}: substitutes' attendance slip`);
  }
});

/* -------------------------------------------------------------------------- */
/* Freshness                                                                  */
/* -------------------------------------------------------------------------- */

test("from 20 Nov the page must say requests are closed, and from 30 Nov that the 29N postal vote is over", () => {
  const today = madridDate(new Date());
  if (today > POSTAL_29N.requestBy) {
    assert.ok(
      POSTAL_AS_OF > POSTAL_29N.requestBy,
      `POSTAL_AS_OF is ${POSTAL_AS_OF}: requests closed on 19 Nov. Re-read Correos, Interior and the INE, move POSTAL_AS_OF in postal-vote.ts to today (the copy switches to "closed"), test and publish \`vot-correu\``,
    );
  }
  if (today > POSTAL_29N.election) {
    assert.ok(
      POSTAL_AS_OF > POSTAL_29N.election,
      `POSTAL_AS_OF is ${POSTAL_AS_OF}: polling day is past. Move it to today (the copy switches to "over"), check whether the next election has been called, test and publish \`vot-correu\``,
    );
  }
});
