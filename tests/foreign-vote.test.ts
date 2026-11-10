import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import {
  FOREIGN_VOTE,
  FOREIGN_VOTE_AS_OF,
  FOREIGN_VOTE_PATHS,
  FOREIGN_VOTE_URL,
  MUNICIPALS_2027,
  buildForeignVote,
  foreignVotePhase,
  type ForeignVotePhase,
} from "../src/lib/content/batch02/foreign-vote.ts";
import { MUNICIPAL_RESULTS } from "../src/lib/content/batch02/municipal-results.ts";
import { B2_PATHS, B2_TITLES, b2href, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { madridDate } from "../src/lib/content/batch02/strikes.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/**
 * Foreign residents and the local elections of 23 May 2027 (10 Nov 2026): one
 * page per language, every fact from the INE (Electoral Census Office) and
 * the BOE, read that day.
 *
 * What it must never do: print a residence requirement for New Zealand (the
 * sources disagree), give Norway a reference date the BOE text does not give,
 * present the March and April dates as official before the decree exists,
 * print a weekday that does not match its date, or keep telling people to
 * register after their deadline (30 Dec 2026 for the EU, 15 Jan 2027 for the
 * agreement countries).
 */

const PHASES: ForeignVotePhase[] = ["before", "open", "euClosed", "closed"];
const AT: Record<ForeignVotePhase, string> = { before: "2026-11-10", open: "2026-12-01", euClosed: "2026-12-31", closed: "2027-01-16" };

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const body = (locale: Locale, article = FOREIGN_VOTE) => text(article.editions[locale].blocks);
const json = (locale: Locale, article = FOREIGN_VOTE) => JSON.stringify(article.editions[locale].blocks);
const plain = (value: string) => value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
const leadOf = (locale: Locale, article = FOREIGN_VOTE) => plain(String((article.editions[locale].blocks[0] as { text?: string }).text ?? ""));

type Loose = { type: string; text?: string; level?: number; items?: unknown[]; rows?: string[][]; tone?: string };
const loose = (locale: Locale, article = FOREIGN_VOTE) => article.editions[locale].blocks as unknown as Loose[];

/** Each paragraph, list item, step, callout, table row and FAQ question with its answer. */
function units(locale: Locale, article = FOREIGN_VOTE): string[] {
  const out: string[] = [];
  for (const block of loose(locale, article)) {
    if (block.type === "paragraph" || block.type === "callout") out.push(plain(String(block.text)));
    if (block.type === "list") out.push(...(block.items as string[]).map(plain));
    if (block.type === "steps") out.push(...(block.items as { title: string; text: string }[]).map((i) => plain(`${i.title}: ${i.text}`)));
    if (block.type === "faq") out.push(...(block.items as { question: string; answer: string }[]).map((i) => plain(`${i.question} ${i.answer}`)));
    if (block.type === "table") out.push(...(block.rows ?? []).map((row) => row.join(" | ")));
  }
  return out;
}
const rowsOf = (locale: Locale, article = FOREIGN_VOTE) => loose(locale, article).filter((b) => b.type === "table").flatMap((b) => b.rows ?? []);

const ROOT = new URL("..", import.meta.url);
const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS)];
const PUBLISHED = new Set(ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)));
const OFFICIAL_HOSTS = ["www.ine.es", "sede.ine.gob.es", "www.boe.es"];

/* -------------------------------------------------------------------------- */
/* Structure, paths, SEO                                                      */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on year-free registry paths, in every phase", () => {
  const expected: Record<Locale, string> = {
    ca: "guies/vot-estrangers-eleccions-municipals",
    es: "guias/voto-extranjeros-elecciones-municipales",
    en: "guides/can-foreigners-vote-spain-local-elections",
  };
  for (const phase of PHASES) {
    const article = buildForeignVote(AT[phase]);
    for (const locale of LOCALES) {
      const edition = article.editions[locale];
      const parsed = bodySchema.safeParse(edition.blocks);
      assert.ok(parsed.success, `${phase}/${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
      assert.ok(wordCount(text(edition.blocks)) > 1200, `${phase}/${locale} is thin`);
      assert.equal(edition.path, expected[locale]);
      assert.equal(edition.path, B2_PATHS.foreignVote[locale]);
      assert.equal(edition.path, FOREIGN_VOTE_PATHS[locale]);
      assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    }
  }
  assert.equal(new Set(LOCALES.map((locale) => FOREIGN_VOTE.editions[locale].path)).size, 3, "one slug per language");
  assert.equal(FOREIGN_VOTE.key, "foreignVote");
  assert.equal(FOREIGN_VOTE.entryKey, "guide-foreign-residents-vote-municipal-elections");
  for (const locale of LOCALES) assert.doesNotMatch(B2_TITLES.foreignVote[locale], /\b30\b|\b15\b/, `${locale}: the rail title carries no deadline`);
});

test("the new paths collide with no registry path, no route folder and no legacy redirect", () => {
  for (const locale of LOCALES) {
    const path = B2_PATHS.foreignVote[locale];
    assert.equal(ALL_PATHS.filter((paths) => paths[locale] === path).length, 1, `${locale}: ${path}`);
  }
  const app = join(ROOT.pathname.replace(/^\/([A-Za-z]:)/, "$1"), "src/app/(public)/[locale]");
  const folders = readdirSync(app).filter((name) => statSync(join(app, name)).isDirectory());
  for (const segment of ["guies", "guias", "guides"]) assert.ok(!folders.includes(segment), `a route folder shadows ${segment}/`);
  const redirects = readFileSync(new URL("../migration/redirects.csv", import.meta.url), "utf8");
  for (const locale of LOCALES) assert.ok(!redirects.includes(B2_PATHS.foreignVote[locale]), locale);
});

test("titles fit in 60 characters and descriptions in 155; each phase's snippet gives that phase's deadline", () => {
  const eu = /30 Dec|30 de dic|30 dic|30 de des|30 des/;
  const agreement = /15 Jan|15 de enero|15 ene|15 de gener|15 gen/;
  const shut = /closed|cerrados|tancats/;
  for (const phase of PHASES) {
    const article = buildForeignVote(AT[phase]);
    for (const locale of LOCALES) {
      const { seoTitle, seoDescription, title, excerpt } = article.editions[locale];
      assert.ok(seoTitle.length > 20 && seoTitle.length <= 60, `${phase}/${locale} title ${seoTitle.length}: ${seoTitle}`);
      assert.ok(seoDescription.length > 80 && seoDescription.length <= 155, `${phase}/${locale} description ${seoDescription.length}: ${seoDescription}`);
      assert.match(seoTitle, locale === "en" ? /^Can I vote in Spain/ : locale === "ca" ? /^Vot d'estrangers/ : /^Voto de extranjeros/);
      const snippet = `${seoTitle} ${seoDescription}`;
      if (phase === "before" || phase === "open") assert.match(seoTitle, eu, `${phase}/${locale}: the EU deadline in the title`);
      if (phase !== "closed") assert.match(snippet, agreement, `${phase}/${locale}: the 15 January deadline`);
      if (phase === "closed") assert.match(seoTitle, shut, `${phase}/${locale}: says registration is closed`);
      assert.ok(title.length > seoTitle.length, `${phase}/${locale}: the H1 says more than the title`);
      assert.ok(excerpt.length > 30 && excerpt.length <= 200, `${locale} excerpt ${excerpt.length}`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

test("the 2027 dates: INE and BOE deadlines, and the decree and roll dates the law gives for 23 May", () => {
  assert.equal(weekdayIndex(MUNICIPALS_2027.election), 0, "23 May 2027 is a Sunday");
  assert.equal(MUNICIPALS_2027.election, "2027-05-23");
  assert.equal(MUNICIPALS_2027.euBy, "2026-12-30");
  assert.equal(MUNICIPALS_2027.agreementFrom, "2026-12-01");
  assert.equal(MUNICIPALS_2027.agreementBy, "2027-01-15");
  assert.equal(weekdayIndex(MUNICIPALS_2027.agreementFrom), 2, "1 Dec 2026 is a Tuesday");
  assert.equal(weekdayIndex(MUNICIPALS_2027.euBy), 3, "30 Dec 2026 is a Wednesday");
  assert.equal(weekdayIndex(MUNICIPALS_2027.agreementBy), 5, "15 Jan 2027 is a Friday");
  const day = (iso: string) => Date.parse(`${iso}T12:00:00Z`) / 86_400_000;
  // Fourth Sunday of May: the 22nd to the 28th.
  assert.ok(Number(MUNICIPALS_2027.election.slice(8)) >= 22 && Number(MUNICIPALS_2027.election.slice(8)) <= 28);
  // LOREG 42.3: decree on the 55th day before, in the BOE the next day.
  assert.equal(day(MUNICIPALS_2027.election) - day(MUNICIPALS_2027.decree), 55);
  assert.equal(day(MUNICIPALS_2027.decreeBoe) - day(MUNICIPALS_2027.decree), 1);
  // LOREG 39.2: eight days of roll consultation from the sixth day after the call.
  assert.equal(day(MUNICIPALS_2027.rollFrom) - day(MUNICIPALS_2027.decreeBoe), 6);
  assert.equal(day(MUNICIPALS_2027.rollTo) - day(MUNICIPALS_2027.rollFrom), 7);
});

test("every weekday printed next to a date matches it", () => {
  const weekdays: Record<Locale, string[]> = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  };
  // Autumn months are 2026, the months to polling day 2027.
  const months: Record<Locale, Record<string, string>> = {
    ca: { octubre: "2026-10", novembre: "2026-11", desembre: "2026-12", gener: "2027-01", març: "2027-03", abril: "2027-04", maig: "2027-05" },
    es: { octubre: "2026-10", noviembre: "2026-11", diciembre: "2026-12", enero: "2027-01", marzo: "2027-03", abril: "2027-04", mayo: "2027-05" },
    en: { October: "2026-10", November: "2026-11", December: "2026-12", January: "2027-01", March: "2027-03", April: "2027-04", May: "2027-05" },
  };
  for (const phase of PHASES) {
    const article = buildForeignVote(AT[phase]);
    for (const locale of LOCALES) {
      const edition = article.editions[locale];
      const all = [body(locale, article), units(locale, article).join(" "), edition.seoTitle, edition.seoDescription, edition.title].join(" ");
      const pattern = new RegExp(`(${weekdays[locale].join("|")}) (\\d{1,2}) (?:de |d')?(${Object.keys(months[locale]).join("|")})`, "gi");
      let seen = 0;
      for (const m of all.matchAll(pattern)) {
        const month = Object.entries(months[locale]).find(([name]) => name.toLowerCase() === m[3]!.toLowerCase())![1];
        const iso = `${month}-${String(Number(m[2])).padStart(2, "0")}`;
        const index = weekdays[locale].findIndex((w) => w.toLowerCase() === m[1]!.toLowerCase());
        assert.equal(weekdayIndex(iso), index, `${phase}/${locale}: "${m[0]}"`);
        seen++;
      }
      assert.ok(seen >= 6, `${phase}/${locale}: only ${seen} weekday-date pairs`);
    }
  }
});

test("answer first: yes, who, polling day and both deadlines in the lead, then the steps", () => {
  const eu: Record<Locale, string> = { ca: "30 de desembre del 2026", es: "30 de diciembre de 2026", en: "30 December 2026" };
  const agreement: Record<Locale, string> = { ca: "15 de gener del 2027", es: "15 de enero de 2027", en: "15 January 2027" };
  const pollingDay: Record<Locale, string> = { ca: "23 de maig del 2027", es: "23 de mayo de 2027", en: "23 May 2027" };
  for (const locale of LOCALES) {
    for (const phase of ["before", "open"] as const) {
      const article = buildForeignVote(AT[phase]);
      const lead = leadOf(locale, article);
      assert.match(lead, /^(Yes|Sí), /, `${phase}/${locale}: ${lead.slice(0, 60)}`);
      for (const needle of [eu[locale], agreement[locale], pollingDay[locale]]) assert.ok(lead.includes(needle), `${phase}/${locale}: ${needle}`);
      assert.match(lead, /13/, `${phase}/${locale}: how many agreement countries`);
    }
    const blocks = loose(locale);
    assert.equal(blocks[0]?.type, "paragraph");
    assert.equal(blocks[1]?.type, "steps", `${locale}: the steps right under the lead`);
    assert.equal(blocks[1]?.items?.length, 5, `${locale}: five steps`);
  }
});

test("the copy moves with the dates: before 1 Dec, open, EU closed from 31 Dec, all closed from 16 Jan", () => {
  assert.equal(foreignVotePhase("2026-11-10"), "before");
  assert.equal(foreignVotePhase("2026-11-30"), "before");
  assert.equal(foreignVotePhase("2026-12-01"), "open");
  assert.equal(foreignVotePhase("2026-12-30"), "open");
  assert.equal(foreignVotePhase("2026-12-31"), "euClosed");
  assert.equal(foreignVotePhase("2027-01-15"), "euClosed");
  assert.equal(foreignVotePhase("2027-01-16"), "closed");
  assert.equal(foreignVotePhase(FOREIGN_VOTE_AS_OF), "before", "today's copy is the 'before' one");

  const euAsk: Record<Locale, RegExp> = { ca: /declara la voluntat de votar fins al/, es: /declara tu voluntad de votar hasta/, en: /EU citizens: declare by/ };
  const euPast: Record<Locale, RegExp> = { ca: /es va acabar el 30 de desembre/, es: /terminó el 30 de diciembre/, en: /the deadline was 30 December/ };
  const agreementAsk: Record<Locale, RegExp> = { ca: /sol·licita la inscripció/, es: /solicita la inscripción/, en: /apply (by|from)/ };
  const agreementPast: Record<Locale, RegExp> = { ca: /es va acabar el 15 de gener/, es: /terminó el 15 de enero/, en: /(closed|ended) on 15 January|the deadline was 15 January/ };
  const tooLate: Record<Locale, RegExp> = { ca: /^Només si et vas inscriure a temps/, es: /^Solo si te inscribiste a tiempo/, en: /^Only if you registered in time/ };
  for (const locale of LOCALES) {
    const titles = (phase: ForeignVotePhase) => (loose(locale, buildForeignVote(AT[phase]))[1]!.items as { title: string }[]).map((i) => i.title);
    for (const phase of ["before", "open"] as const) {
      assert.match(titles(phase)[1]!, euAsk[locale], `${phase}/${locale}: EU step`);
      assert.match(titles(phase)[2]!, agreementAsk[locale], `${phase}/${locale}: agreement step`);
    }
    assert.match(titles("euClosed")[1]!, euPast[locale], `euClosed/${locale}: EU step`);
    assert.match(titles("euClosed")[2]!, agreementAsk[locale], `euClosed/${locale}: agreement step still open`);
    assert.match(titles("closed")[1]!, euPast[locale], `closed/${locale}: EU step`);
    assert.match(titles("closed")[2]!, agreementPast[locale], `closed/${locale}: agreement step`);
    assert.doesNotMatch(titles("closed").join(" "), agreementAsk[locale], `closed/${locale}: still asks people to apply`);
    assert.match(leadOf(locale, buildForeignVote(AT.closed)), tooLate[locale], `closed/${locale}: lead`);
    assert.doesNotMatch(leadOf(locale, buildForeignVote(AT.euClosed)), /^(Yes|Sí), (if you are an EU|si eres ciudadano|si ets ciutadà)/, `euClosed/${locale}: lead`);
  }
});

/* -------------------------------------------------------------------------- */
/* What the page must and must not say                                        */
/* -------------------------------------------------------------------------- */

test("New Zealand: named as an agreement country, never given a residence figure", () => {
  const name: Record<Locale, string> = { ca: "Nova Zelanda", es: "Nueva Zelanda", en: "New Zealand" };
  const figure = /\b(\d+|three|five|tres|cinco|cinc) (years|años|anys)\b/i;
  for (const phase of PHASES) {
    const article = buildForeignVote(AT[phase]);
    for (const locale of LOCALES) {
      const mentions = units(locale, article).filter((u) => u.includes(name[locale]));
      assert.ok(mentions.length >= 4, `${phase}/${locale}: only ${mentions.length} mentions`);
      for (const unit of mentions) assert.doesNotMatch(unit, figure, `${phase}/${locale}: "${unit.slice(0, 120)}"`);
      const rows = rowsOf(locale, article).filter((row) => row[0] === name[locale]);
      assert.equal(rows.length, 2, `${phase}/${locale}: one row in each table`);
      for (const row of rows) assert.doesNotMatch(row.join(" "), /\d (years|años|anys)|\b[35]\b/, `${phase}/${locale}: ${row.join(" | ")}`);
    }
  }
});

test("Norway is 'more than three years' with no reference date; the UK three and the rest five", () => {
  const norway: Record<Locale, string> = { ca: "Noruega", es: "Noruega", en: "Norway" };
  const uk: Record<Locale, string> = { ca: "Regne Unit", es: "Reino Unido", en: "United Kingdom" };
  const more: Record<Locale, RegExp> = { ca: /més de 3 anys/i, es: /más de 3 años/i, en: /more than 3 years/i };
  for (const locale of LOCALES) {
    const rows = rowsOf(locale);
    const norwayRows = rows.filter((row) => row[0] === norway[locale]);
    assert.equal(norwayRows.length, 2, locale);
    for (const row of norwayRows) {
      assert.match(row.join(" "), more[locale], `${locale}: ${row.join(" | ")}`);
      assert.doesNotMatch(row.join(" "), /polling day|día de la votación|dia de la votació/, `${locale}: Norway has no reference date`);
    }
    const ukRows = rows.filter((row) => row[0] === uk[locale]);
    assert.equal(ukRows.length, 2, locale);
    for (const row of ukRows) assert.match(row.join(" "), /\b3\b/, `${locale}: ${row.join(" | ")}`);
    const five = rows.filter((row) => /Colombia|Colòmbia/.test(row[0] ?? ""));
    assert.equal(five.length, 2, locale);
    for (const row of five) {
      assert.match(row.join(" "), /\b5\b/, `${locale}: ${row.join(" | ")}`);
      assert.equal(row[0]!.split(", ").length, 10, `${locale}: ten five-year countries`);
    }
  }
});

test("the decree is not published: the March and April dates are 'to be confirmed'", () => {
  const notYet: Record<Locale, RegExp> = { ca: /encara no s'ha publicat/, es: /aún no se ha publicado/, en: /not (yet )?been published|has not been published yet/ };
  const confirm: Record<Locale, RegExp> = { ca: /per confirmar/, es: /por confirmar/, en: /to be confirmed/ };
  const march: Record<Locale, RegExp> = { ca: /29 de març/, es: /29 de marzo/, en: /29 March/ };
  const april: Record<Locale, RegExp> = { ca: /12 d'abril/, es: /12 de abril/, en: /12 April/ };
  for (const locale of LOCALES) {
    assert.match(body(locale), notYet[locale], locale);
    for (const row of rowsOf(locale).filter((r) => march[locale].test(r[0] ?? "") || april[locale].test(r[0] ?? ""))) {
      assert.match(row[0]!, confirm[locale], `${locale}: ${row[0]}`);
    }
    assert.equal(rowsOf(locale).filter((r) => confirm[locale].test(r[0] ?? "")).length, 2, `${locale}: two unconfirmed rows`);
  }
});

test("EU: once and permanent; agreement countries: every election; nobody is registered automatically", () => {
  const words: Record<Locale, RegExp[]> = {
    ca: [/una sola vegada/, /a cada elecció/, /encara que votessis el 2023/, /d'ofici/, /345\.312/, /515\.363/, /58\.333/, /104\.614/, /900 343 232/, /Cl@ve/, /TIE/, /model DFA/],
    es: [/una sola vez/, /en cada elección/, /aunque votaras en 2023/, /de oficio/, /345\.312/, /515\.363/, /58\.333/, /104\.614/, /900 343 232/, /Cl@ve/, /TIE/, /modelo DFA/],
    en: [/only once|just once|once only/, /every election|each election/, /even if you voted in 2023/, /automatically/, /345,312/, /515,363/, /58,333/, /104,614/, /900 343 232/, /Cl@ve/, /TIE/, /DFA/],
  };
  for (const locale of LOCALES) for (const pattern of words[locale]) assert.match(body(locale), pattern, `${locale}: ${pattern}`);
});

test("the general election of 29 Nov is not for foreign residents, and the page says so", () => {
  const no: Record<Locale, RegExp> = { ca: /només voten els ciutadans espanyols/, es: /solo votan los ciudadanos españoles/, en: /[Oo]nly Spanish citizens/ };
  for (const locale of LOCALES) assert.match(body(locale), no[locale], locale);
});

/* -------------------------------------------------------------------------- */
/* Sources, links, image                                                      */
/* -------------------------------------------------------------------------- */

test("sources are official, https, listed once, and the reader sees the check date", () => {
  assert.ok(FOREIGN_VOTE.sources.length >= 8);
  for (const source of FOREIGN_VOTE.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/[?&]utm_/i.test(source.url), source.url);
    assert.ok(OFFICIAL_HOSTS.includes(new URL(source.url).host), `${source.url} is not official`);
  }
  assert.equal(new Set(FOREIGN_VOTE.sources.map((s) => s.url)).size, FOREIGN_VOTE.sources.length, "a source is listed twice");
  const U = FOREIGN_VOTE_URL;
  for (const url of [U.ine2027, U.inePress, U.ineAgreements, U.euClave, U.euCtt, U.rollLookup, U.boeEu, U.boeOrder, U.boeAgreements, U.loreg]) {
    assert.ok(FOREIGN_VOTE.sources.some((s) => s.url === url), `missing ${url}`);
  }
  assert.equal(FOREIGN_VOTE.verifiedAt, FOREIGN_VOTE_AS_OF);
  const checked: Record<Locale, RegExp> = { ca: /10 de novembre de 2026/, es: /10 de noviembre de 2026/, en: /10 November 2026/ };
  for (const locale of LOCALES) assert.match(body(locale), checked[locale], locale);
});

test("the INE procedures and the form are linked directly, in every language", () => {
  const U = FOREIGN_VOTE_URL;
  for (const locale of LOCALES) {
    const raw = json(locale);
    for (const url of [U.euClave, U.euCtt, U.dfaForm, U.rollLookup, U.ineAgreements, U.inePress]) {
      assert.ok(raw.includes(`](${url})`), `${locale}: no link to ${url}`);
    }
    assert.ok(raw.includes(`](${U.ine2027})`) || raw.includes(`](${U.ine2027En})`), `${locale}: the INE's 2027 page`);
  }
  // The trailing slash matters: without it the e-office answers 404 or redirects to http.
  assert.match(U.euClave, /\/tramite\/manifestacion_voluntad_voto\/$/);
  assert.match(U.euCtt, /\/tramite\/manifestacionVotoUECTT\/$/);
});

test("external links go to official sites only; internal links stay in their language and exist", () => {
  for (const phase of PHASES) {
    const article = buildForeignVote(AT[phase]);
    for (const locale of LOCALES) {
      const raw = json(locale, article);
      const external = [...raw.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]!);
      assert.ok(external.length >= 8, `${phase}/${locale}: only ${external.length} official links`);
      for (const href of external) {
        assert.match(href, /^https:\/\//, href);
        assert.ok(OFFICIAL_HOSTS.includes(new URL(href).host), `${phase}/${locale}: ${href}`);
      }
      const internal = [...raw.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "");
      assert.ok(internal.length >= 4, `${phase}/${locale}: only ${internal.length} internal links`);
      for (const href of internal) {
        assert.ok(href.startsWith(`/${locale}/`), `${phase}/${locale} links to ${href}`);
        assert.ok(PUBLISHED.has(href), `${phase}/${locale}: ${href} is not a published path`);
      }
      assert.ok(raw.includes(`](${b2href("voting", locale)})`), `${locale}: links to the how-to-vote guide`);
      assert.ok(raw.includes(`](${b2href("municipalResults", locale)})`), `${locale}: links to the municipal results`);
      assert.ok(!raw.includes(`](${b2href("foreignVote", locale)})`), `${locale}: links to itself`);
    }
  }
});

test("no new photograph: the municipal results page's hero, with its alt and caption", () => {
  assert.equal(FOREIGN_VOTE.heroKey, MUNICIPAL_RESULTS.heroKey);
  assert.ok(FOREIGN_VOTE.heroKey && IMAGE_BY_KEY.has(FOREIGN_VOTE.heroKey));
  assert.deepEqual(FOREIGN_VOTE.heroAlt, MUNICIPAL_RESULTS.heroAlt);
  assert.deepEqual(FOREIGN_VOTE.heroCaption, MUNICIPAL_RESULTS.heroCaption);
  assert.equal(FOREIGN_VOTE.secondaryKey, undefined);
  for (const locale of LOCALES) {
    assert.ok(!FOREIGN_VOTE.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"), locale);
  }
});

test("the read-next box only repeats links from the related rail", () => {
  for (const locale of LOCALES) {
    const before = FOREIGN_VOTE.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string } | undefined;
    for (const link of box?.text.match(/\]\(([^)]+)\)/g) ?? []) {
      assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Links in, publish groups                                                   */
/* -------------------------------------------------------------------------- */

test("the how-to-vote guide and the municipal results page each link here once, in their own language", () => {
  for (const locale of LOCALES) {
    const target = `](${b2href("foreignVote", locale)})`;
    for (const [name, article] of [["voting", VOTING], ["municipalResults", MUNICIPAL_RESULTS]] as const) {
      const raw = JSON.stringify(article.editions[locale].blocks);
      assert.equal(raw.split(target).length - 1, 1, `${name}/${locale}: one link to the guide`);
      for (const other of LOCALES.filter((l) => l !== locale)) {
        assert.ok(!raw.includes(`](${b2href("foreignVote", other)})`), `${name}/${locale} links to the ${other} edition`);
      }
    }
    assert.doesNotMatch(JSON.stringify(VOTING.editions[locale].blocks), /have not been published yet|aún no se han publicado|encara no s'han publicat/, `${locale}: the stale 'window not published' line is gone`);
  }
});

test("the publish route registers `voto-extranjeros-2027` and, for the two pages that link here, `voto-extranjeros-2027-links`", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("voto-extranjeros-2027"\)\) published\.push\(await publishB2Article\(FOREIGN_VOTE\)\)/);
  assert.match(route, /wants\("voto-extranjeros-2027-links"\)\) published\.push\(await publishB2Article\(VOTING\), await publishB2Article\(MUNICIPAL_RESULTS\)\)/);
});

/* -------------------------------------------------------------------------- */
/* Freshness                                                                  */
/* -------------------------------------------------------------------------- */

test("the page is re-read at each deadline: 1 Dec, 31 Dec 2026, 16 Jan, 31 Mar and 24 May 2027", () => {
  const today = madridDate(new Date());
  const redo = "re-read the INE pages in FOREIGN_VOTE_URL, update the copy in foreign-vote.ts, move FOREIGN_VOTE_AS_OF to today, test and publish `voto-extranjeros-2027`";
  if (today >= MUNICIPALS_2027.agreementFrom) {
    assert.ok(
      FOREIGN_VOTE_AS_OF >= MUNICIPALS_2027.agreementFrom,
      `FOREIGN_VOTE_AS_OF is ${FOREIGN_VOTE_AS_OF}: the agreement countries' window opened on 1 Dec 2026. Find the INE's direct online procedure for them (the page links only the e-office home, FOREIGN_VOTE_URL.agreementOnline) and whether the letters went out; ${redo} (the copy switches to "open")`,
    );
  }
  if (today > MUNICIPALS_2027.euBy) {
    assert.ok(
      FOREIGN_VOTE_AS_OF > MUNICIPALS_2027.euBy,
      `FOREIGN_VOTE_AS_OF is ${FOREIGN_VOTE_AS_OF}: the EU citizens' deadline was 30 Dec 2026. ${redo} (the copy switches to "euClosed")`,
    );
  }
  if (today > MUNICIPALS_2027.agreementBy) {
    assert.ok(
      FOREIGN_VOTE_AS_OF > MUNICIPALS_2027.agreementBy,
      `FOREIGN_VOTE_AS_OF is ${FOREIGN_VOTE_AS_OF}: the agreement countries' deadline was 15 Jan 2027. ${redo} (the copy switches to "closed")`,
    );
  }
  if (today > MUNICIPALS_2027.decreeBoe) {
    assert.ok(
      FOREIGN_VOTE_AS_OF > MUNICIPALS_2027.decreeBoe,
      `FOREIGN_VOTE_AS_OF is ${FOREIGN_VOTE_AS_OF}: the decree calling the elections was due in the BOE on 30 Mar 2027. Read it, replace every "to be confirmed" date (decree, roll consultation 5-12 April) with the official one; ${redo}`,
    );
  }
  if (today > MUNICIPALS_2027.election) {
    assert.ok(
      FOREIGN_VOTE_AS_OF > MUNICIPALS_2027.election,
      `FOREIGN_VOTE_AS_OF is ${FOREIGN_VOTE_AS_OF}: polling day (23 May 2027) is past. Rewrite the page for the next local elections or say these are over; ${redo}`,
    );
  }
});
