import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { B2_PATHS, withReadNext } from "../src/lib/content/batch02/shared.ts";
import {
  MINIMUM_SERVICES_11N,
  SET_BY,
  STRIKE_11N,
  STRIKE_11N_AS_OF,
  STRIKE_11N_DATE,
  STRIKE_11N_META,
  STRIKE_11N_URLS,
  STRIKE_11N_VERIFIED,
  buildStrike11nBody,
  generalitatOrderPublished,
  isStale,
  msState,
  strike11nDescription,
  strike11nSources,
  strikePhase,
  type SectorKey,
  type SectorMinimumServices,
} from "../src/lib/content/batch02/strike-11n.ts";
import { STRIKES, STRIKES_GUIDE, madridDate } from "../src/lib/content/batch02/strikes.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { TRAINS } from "../src/lib/content/features/trains.ts";
import { holidayOn, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { SCHOOL_YEARS, schoolStatusOn } from "../src/lib/content/school/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { hubPath as rodaliesHubPath } from "../src/lib/programmatic/rodalies/paths.ts";

/**
 * The 11 November 2026 general strike page (29 Oct 2026): one page per
 * language beside the strikes hub, one minimum-services slot per sector.
 *
 * Pins what the page must say (the organisers' and the gazettes' facts read
 * on 29 Oct 2026), what it must never say (an 11N percentage nobody has
 * published, press-only claims), how it changes when the lead fills in the
 * slots, and fails once 11 November has passed without the page being
 * brought up to date.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const json = (locale: Locale) => JSON.stringify(STRIKE_11N.editions[locale].blocks);
const body = (locale: Locale) => text(STRIKE_11N.editions[locale].blocks);
const sentences = (plain: string) => plain.split(/\n|(?<=[.!?])\s+/);

const PUBLISHED = new Set([
  ...[...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)].flatMap(
    (paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`),
  ),
  // The Rodalies hub is a code route (app/(public)/[locale]/rodalies), served in all three languages.
  ...LOCALES.map((locale) => rodaliesHubPath(locale)),
]);

const ALL_SECTORS: SectorKey[] = ["rodalies", "tmb", "fgcTram", "longDistance", "airports", "schools", "health"];

/** What the lead would write once the order is out (shape only; not real figures). */
function filled(keys: SectorKey[] = ALL_SECTORS): SectorMinimumServices[] {
  return ALL_SECTORS.map((key) =>
    keys.includes(key)
      ? {
          key,
          status: "published" as const,
          text: {
            ca: `el 99% del servei, segons [l'ordre de prova](https://example.org/ordre-${key})`,
            es: `el 99% del servicio, según [la orden de prueba](https://example.org/ordre-${key})`,
            en: `99% of normal service, under [the test order](https://example.org/ordre-${key})`,
          },
          source: { name: `Ordre de prova ${key}`, url: `https://example.org/ordre-${key}`, publisher: "DOGC" },
        }
      : { key, status: "pending" as const, text: null, source: null },
  );
}

/* -------------------------------------------------------------------------- */
/* Structure, SEO, links, photo                                               */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on the registry paths", () => {
  assert.deepEqual(B2_PATHS.strike11n, {
    ca: "guies/vaga-general-11-novembre",
    es: "guias/huelga-general-11-noviembre",
    en: "guides/general-strike-11-november-spain",
  });
  for (const locale of LOCALES) {
    const edition = STRIKE_11N.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(body(locale)) > 1500, `${locale} is thin`);
    assert.equal(edition.path, B2_PATHS.strike11n[locale]);
    assert.equal(edition.path, STRIKE_11N_META[locale].path);
    assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
  }
});

test("the paths collide with no other published path", () => {
  for (const locale of LOCALES) {
    const all = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)].map(
      (paths) => paths[locale],
    );
    assert.equal(all.filter((path) => path === B2_PATHS.strike11n[locale]).length, 1, locale);
  }
});

test("titles fit in 60 characters in the searched words; descriptions fit in 155 and answer first", () => {
  const seo: Record<Locale, RegExp> = {
    ca: /^Vaga general 11 de novembre: serveis mínims i què funciona$/,
    es: /^Huelga general 11 de noviembre 2026: servicios mínimos$/,
    en: /^General strike 11 November 2026 in Spain: what runs$/,
  };
  const h1: Record<Locale, RegExp> = {
    ca: /^Vaga general de l'11 de novembre de 2026: serveis mínims i què funciona/,
    es: /^Huelga general del 11 de noviembre de 2026: servicios mínimos y qué funciona/,
    en: /^General strike on 11 November 2026 in Spain: what runs/,
  };
  const answer: Record<Locale, RegExp> = {
    ca: /dimecres 11 de novembre de 2026, 24 hores des de les 0 h/,
    es: /miércoles 11 de noviembre de 2026, 24 horas desde las 0 h/,
    en: /24-hour general strike across Spain on Wednesday 11 November 2026/,
  };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, excerpt, title } = STRIKE_11N.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} title ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30 && excerpt.length <= 200, `${locale} excerpt ${excerpt.length}`);
    assert.match(seoTitle, seo[locale]);
    assert.match(title, h1[locale]);
    assert.match(seoDescription, answer[locale]);
    assert.equal(seoDescription, strike11nDescription(locale));
    // Pending on the as-of day: the description says so.
    assert.match(seoDescription, /no publicats|no publicados|not out yet/, locale);
  }
});

test("the description stays within 155 characters in every state the page can be in", () => {
  for (const locale of LOCALES) {
    for (const [asOf, slots] of [
      [STRIKE_11N_AS_OF, MINIMUM_SERVICES_11N],
      ["2026-11-09", filled()],
      ["2026-11-09", filled(["longDistance"])],
      ["2026-11-11", filled()],
      ["2026-11-12", filled()],
    ] as const) {
      const description = strike11nDescription(locale, asOf, [...slots]);
      assert.ok(description.length > 60 && description.length <= 155, `${locale}/${asOf}: ${description.length} ${description}`);
    }
  }
  // Only the Generalitat's order flips the description to "published".
  assert.match(strike11nDescription("ca", "2026-11-09", filled(["longDistance"])), /no publicats/);
  assert.match(strike11nDescription("ca", "2026-11-09", filled()), /Serveis mínims publicats/);
  assert.match(strike11nDescription("en", "2026-11-12", filled()), /^The 11 November 2026 general strike/);
});

test("internal links stay in their language, end in a slash and point at a published path", () => {
  for (const locale of LOCALES) {
    const blocks = json(locale);
    const hrefs = [...blocks.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "");
    for (const href of hrefs) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
    }
    assert.ok(hrefs.length >= 8, `${locale}: only ${hrefs.length} internal links`);
    // The pages the brief names: the strikes hub, Rodalies live, metro hours, the school calendar.
    for (const target of [
      `/${locale}/${B2_PATHS.strikes[locale]}/`,
      rodaliesHubPath(locale),
      `/${locale}/${B2_PATHS.hours[locale]}/`,
      `/${locale}/${TOOL_PATHS.school[locale]}/`,
    ]) {
      assert.ok(hrefs.includes(target), `${locale}: no link to ${target}`);
    }
  }
});

test("external links are https and every one is a listed source", () => {
  const urls = STRIKE_11N.sources.map((source) => source.url);
  assert.equal(new Set(urls).size, urls.length, "a source is listed twice");
  for (const url of urls) {
    assert.match(url, /^https:\/\//, url);
    assert.ok(!/[?&]utm_/.test(url), url);
  }
  for (const locale of LOCALES) {
    for (const match of json(locale).matchAll(/\]\((https?:[^)]*)\)/g)) {
      const href = match[1] ?? "";
      assert.match(href, /^https:\/\//, href);
      assert.ok(urls.includes(href), `${locale}: ${href} is linked but not in the sources`);
    }
  }
  // The organisers' own sites, the BOE and the DOGC are all cited.
  for (const host of ["www.ccoo.es", "11n.cat", "www.ugt.es", "www.ugt.cat", "cgtcatalunya.cat", "www.sindicat.net", "www.boe.es", "portaljuridic.gencat.cat", "treball.gencat.cat"]) {
    assert.ok(urls.some((url) => new URL(url).host === host), `no source on ${host}`);
  }
  for (const url of [STRIKE_11N_URLS.constitution, STRIKE_11N_URLS.rdl17]) assert.match(url, /^https:\/\/www\.boe\.es\//);
  assert.equal(STRIKE_11N.verifiedAt, STRIKE_11N_VERIFIED);
});

test("the read-next box only repeats links from the related rail, and the hub comes first", () => {
  for (const locale of LOCALES) {
    const before = STRIKE_11N.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    assert.ok(related.items?.[0]?.includes(`(/${locale}/${B2_PATHS.strikes[locale]}/)`), locale);
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) {
      assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
    }
  }
});

test("no new photograph: the hero is the trains feature's file with its exact alt and caption", () => {
  assert.ok(STRIKE_11N.heroKey && IMAGE_BY_KEY.has(STRIKE_11N.heroKey));
  assert.equal(STRIKE_11N.heroKey, TRAINS.heroKey);
  assert.deepEqual(STRIKE_11N.heroAlt, TRAINS.heroAlt, "alt differs from the existing media row");
  assert.deepEqual(STRIKE_11N.heroCaption, TRAINS.heroCaption, "caption differs from the existing media row");
  assert.equal(STRIKE_11N.secondaryKey, undefined);
  for (const locale of LOCALES) {
    assert.ok(!STRIKE_11N.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
  }
});

/* -------------------------------------------------------------------------- */
/* Known answers read on 29 Oct 2026                                          */
/* -------------------------------------------------------------------------- */

test("known answers: the date, the hours, who calls it and who is called out", () => {
  assert.equal(STRIKE_11N_DATE, "2026-11-11");
  assert.equal(weekdayIndex(STRIKE_11N_DATE), 3); // Wednesday
  const leadWords: Record<Locale, RegExp[]> = {
    ca: [/^El dimecres 11 de novembre de 2026 hi ha vaga general de 24 hores/, /0 h/, /encara no s'han publicat/],
    es: [/^El miércoles 11 de noviembre de 2026 hay huelga general de 24 horas/, /0 h/, /aún no se han publicado/],
    en: [/^On Wednesday 11 November 2026 there is a 24-hour general strike/, /00:00/, /not been published yet/],
  };
  for (const locale of LOCALES) {
    const blocks = STRIKE_11N.editions[locale].blocks;
    assert.equal(blocks[0]?.type, "paragraph");
    assert.equal((blocks[0] as { lead?: boolean }).lead, true);
    assert.equal(blocks[1]?.type, "keyFacts");
    const leadText = text(blocks.slice(0, 1));
    for (const pattern of leadWords[locale]) assert.match(leadText, pattern, `${locale} lead`);
    const all = body(locale);
    for (const name of ["CCOO", "UGT", "CGT", "CNT", "USTEC·STEs", "CCOO de Catalunya", "UGT de Catalunya", "CGT Catalunya", "CO.BAS", "Sindicato de Inquilinas"]) {
      assert.ok(all.includes(name), `${locale}: ${name}`);
    }
    // CCOO: registered, announced 19 Oct 2026; CCOO de Catalunya: 24 h from 0 h, shifts.
    assert.match(all, /19 (d'octubre|de octubre|October) (de )?2026/, locale);
    assert.ok(all.includes("ya está registrada"), locale);
    assert.match(all, /primer torn|primer turno|first shift/, locale);
    // The registered demands, with their numbers as the unions print them.
    assert.match(all, /35[ -](hores|horas|hour)/, locale);
    assert.match(all, /1\.500 €|€1,500/, locale);
    assert.match(all, /7% (el|en|in) 2027/, locale);
  }
});

test("known answers: who sets minimum services, when they came out in 2024, where to watch", () => {
  const precedents: Record<Locale, RegExp[]> = {
    ca: [/Ordre EMT\/38\/2024 es va signar el 5 de març/, /Ordre EMT\/201\/2024 es va signar el 25 de setembre/],
    es: [/Ordre EMT\/38\/2024 se firmó el 5 de marzo/, /Ordre EMT\/201\/2024 se firmó el 25 de septiembre/],
    en: [/Order EMT\/38\/2024 was signed on 5 March/, /Order EMT\/201\/2024 was signed on 25 September/],
  };
  for (const locale of LOCALES) {
    const all = body(locale);
    for (const pattern of precedents[locale]) assert.match(all, pattern, locale);
    assert.match(all, /Departament d'Empresa i Treball|Department of Business and Labour/, locale);
    assert.match(all, /Ministeri de Transports|Ministerio de Transportes|Ministry of Transport/, locale);
    assert.match(all, /Lleida-Alguaire/, locale);
    const blocks = json(locale);
    for (const url of [STRIKE_11N_URLS.dogc, STRIKE_11N_URLS.treballMs, STRIKE_11N_URLS.rodaliesStatus, STRIKE_11N_URLS.tmb, STRIKE_11N_URLS.fgc, STRIKE_11N_URLS.renfe, STRIKE_11N_URLS.aena]) {
      assert.ok(blocks.includes(`](${url})`), `${locale}: no link to ${url}`);
    }
    // The "this page will list them" line while the order is pending.
    assert.match(all, /Aquesta pàgina els hi posarà quan surtin|Esta página los pondrá en cuanto salgan|This page will list them as soon as they are out/, locale);
  }
});

test("known answers: schools are open, it is a school day and not a Catalan holiday", () => {
  assert.equal(holidayOn(STRIKE_11N_DATE), null, "11 November 2026 is a Catalan public holiday");
  assert.equal(schoolStatusOn(STRIKE_11N_DATE).kind, "term");
  const year = SCHOOL_YEARS.find((y) => y.label === "2026-2027");
  assert.ok(year);
  assert.equal(year.start, "2026-09-08");
  assert.equal(year.christmas[0], "2026-12-22");
  const schoolDay: Record<Locale, RegExp> = { ca: /Sí, és dia lectiu/, es: /Sí, es día lectivo/, en: /Yes, it is a school day/ };
  for (const locale of LOCALES) {
    const all = body(locale);
    assert.match(all, schoolDay[locale], locale);
    assert.match(all, /EDF\/66\/2026/, locale);
    assert.match(all, /8 (de setembre|de septiembre|September) (de )?2026/, locale);
    assert.match(all, /22 (de desembre|de diciembre|December) (de )?2026/, locale);
  }
});

test("known answers: workers' rights come from the BOE text and the Generalitat's strike FAQ", () => {
  const quote = "Durante la huelga se entenderá suspendido el contrato de trabajo y el trabajador no tendrá derecho al salario";
  for (const locale of LOCALES) {
    const all = body(locale);
    assert.ok(all.includes(quote), `${locale}: RDL 17/1977 art. 6.2 not quoted`);
    assert.ok(all.includes("Se reconoce el derecho a la huelga de los trabajadores para la defensa de sus intereses"), locale);
    for (const article of ["6.1", "6.2", "6.3", "6.4", "6.5", "28.2"]) assert.ok(all.includes(article), `${locale}: ${article}`);
    assert.ok(json(locale).includes(`](${STRIKE_11N_URLS.treballFaq})`), `${locale}: no link to the Generalitat FAQ`);
  }
  assert.ok(body("ca").includes("La normativa reguladora del dret de vaga no contempla l'obligació de preavís per part de la persona treballadora"));
});

test("the FAQ asks in the searched words and answers in plain text", () => {
  const questions: Record<Locale, string[]> = {
    ca: ["Què funciona l'11 de novembre?", "Hi ha escola l'11N?", "Hi ha metro l'11 de novembre?", "Hi ha Rodalies l'11 de novembre?"],
    es: ["¿Qué funciona el 11 de noviembre?", "¿Hay colegio el 11N?", "¿Hay metro el 11 de noviembre?", "¿Hay Rodalies el 11 de noviembre?"],
    en: ["What runs on 11 November?", "Is there school on 11 November?", "Is the Barcelona metro running on 11 November?", "Are Rodalies trains running on 11 November?"],
  };
  for (const locale of LOCALES) {
    const block = STRIKE_11N.editions[locale].blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] } | undefined;
    assert.ok(block, locale);
    const asked = block.items.map((item) => item.question);
    for (const question of questions[locale]) assert.ok(asked.includes(question), `${locale}: missing "${question}"`);
    for (const item of block.items) assert.doesNotMatch(item.answer, /\*\*|\]\(/, `${locale}: markdown in "${item.question}"`);
  }
});

test("every weekday printed next to a date matches that date", () => {
  const weekdays: Record<Locale, string[]> = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    en: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  };
  const months: Record<Locale, string[]> = {
    ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
    es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    en: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
  };
  let checked = 0;
  for (const locale of LOCALES) {
    const all = body(locale).toLowerCase() + " " + STRIKE_11N.editions[locale].seoDescription.toLowerCase();
    const pattern = new RegExp(`(${weekdays[locale].join("|")}),? (\\d{1,2}) (?:d'|de )?(${months[locale].join("|")})`, "gu");
    for (const match of all.matchAll(pattern)) {
      const month = months[locale].indexOf(match[3]!) + 1;
      const iso = `2026-${String(month).padStart(2, "0")}-${match[2]!.padStart(2, "0")}`;
      assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${locale}: "${match[0]}"`);
      checked += 1;
    }
  }
  assert.ok(checked >= 6, `only ${checked} weekday mentions checked`);
});

/* -------------------------------------------------------------------------- */
/* What must never be printed                                                 */
/* -------------------------------------------------------------------------- */

test("no 11 November percentage nobody has published: every % is 2024's or a union's minimum-wage demand", () => {
  for (const locale of LOCALES) {
    for (const piece of sentences(body(locale))) {
      if (!/\d+\s?%/.test(piece)) continue;
      assert.match(piece, /2024|SMI|salari mínim|salario mínimo|minimum wage/, `${locale}: "${piece}"`);
    }
    // The minimum-services column of the table says "not published" for every sector.
    const tableBlock = STRIKE_11N.editions[locale].blocks.find((b) => b.type === "table") as { rows: string[][] };
    assert.equal(tableBlock.rows.length, ALL_SECTORS.length, locale);
    for (const row of tableBlock.rows) {
      assert.match(row[2] ?? "", /^(Encara no publicats|Aún no publicados|Not published yet)$/, `${locale}: ${row[0]}`);
    }
  }
});

test("press-only and unpublished claims are never printed", () => {
  for (const locale of LOCALES) {
    for (const plain of [body(locale), text(buildStrike11nBody(locale, "2026-11-12", filled()))]) {
      // No organiser had published a demonstration place or time on 29 Oct 2026.
      assert.doesNotMatch(plain, /Jardinets|Passeig de Gràcia|17[.:]30|18[.:]00 h/i, locale);
      assert.doesNotMatch(plain, /desconvocad|called off|cancel·lada la vaga|huelga cancelada/i, locale);
      // CCOO's housing figure was not in the page text as read.
      assert.doesNotMatch(plain, /1[.,]5 (milions|millones|million)/i, locale);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* The data model: slots, states, dates                                       */
/* -------------------------------------------------------------------------- */

test("one slot per sector, consistent with its status", () => {
  assert.deepEqual(MINIMUM_SERVICES_11N.map((s) => s.key).sort(), [...ALL_SECTORS].sort());
  assert.deepEqual(Object.keys(SET_BY).sort(), [...ALL_SECTORS].sort());
  const urls = strike11nSources().map((source) => source.url);
  for (const slot of MINIMUM_SERVICES_11N) {
    if (slot.status === "pending") {
      assert.equal(slot.text, null, `${slot.key}: pending with text`);
      assert.equal(slot.source, null, `${slot.key}: pending with a source`);
      continue;
    }
    assert.ok(slot.text && slot.source, `${slot.key}: published without text or source`);
    assert.match(slot.source.url, /^https:\/\//);
    assert.ok(urls.includes(slot.source.url), `${slot.key}: source not in the article's sources`);
    for (const locale of LOCALES) {
      const value = slot.text[locale];
      assert.match(value, /\d+\s?%|plantilla|personal|staff|servei habitual|servicio habitual|usual service|normal/, `${slot.key}/${locale}: no figure`);
      assert.match(value, /\]\(https:\/\//, `${slot.key}/${locale}: no link to the order or notice`);
    }
  }
});

test("filling the slots changes the page without touching the template", () => {
  const all = filled();
  assert.equal(msState(all), "published");
  assert.equal(msState(filled(["rodalies"])), "partial");
  assert.equal(msState(filled([])), "pending");
  assert.equal(generalitatOrderPublished(filled(["longDistance", "airports"])), false);
  assert.equal(generalitatOrderPublished(filled(["schools"])), true);
  for (const locale of LOCALES) {
    const blocks = buildStrike11nBody(locale, "2026-11-09", all);
    assert.ok(bodySchema.safeParse(blocks).success, locale);
    const plain = text(blocks);
    const tableBlock = blocks.find((b) => b.type === "table") as { rows: string[][] };
    for (const row of tableBlock.rows) assert.match(row[2] ?? "", /99%/, `${locale}: ${row[0]}`);
    // Each transport sector, the schools and health print what was published.
    assert.ok(plain.split("99%").length - 1 >= ALL_SECTORS.length * 2, locale);
    assert.match(text(blocks.slice(0, 1)), /ja s'han publicat|ya se han publicado|have been published/, locale);
    // The "will list them" box and the 2024 reference go once the order is out.
    assert.doesNotMatch(plain, /Aquesta pàgina els hi posarà|Esta página los pondrá|This page will list them/, locale);
    assert.doesNotMatch(plain, /85%/, `${locale}: the 2024 reference stays next to real figures`);
    // The order joins the sources.
    assert.ok(strike11nSources(all).some((s) => s.url === "https://example.org/ordre-rodalies"));
    // Partly published: the lead says which state it is in.
    assert.match(text(buildStrike11nBody(locale, "2026-11-09", filled(["longDistance"])).slice(0, 1)), /Una part|Una parte|Some minimum services/, locale);
  }
});

test("the lead follows the as-of date: before, on and after the day", () => {
  assert.equal(strikePhase("2026-11-10"), "upcoming");
  assert.equal(strikePhase("2026-11-11"), "today");
  assert.equal(strikePhase("2026-11-12"), "past");
  const today: Record<Locale, RegExp> = { ca: /^Avui, dimecres 11 de novembre/, es: /^Hoy, miércoles 11 de noviembre/, en: /^Today, Wednesday 11 November/ };
  const past: Record<Locale, RegExp> = { ca: /hi va haver vaga general/, es: /hubo huelga general/, en: /^There was a 24-hour general strike/ };
  for (const locale of LOCALES) {
    const onTheDay = buildStrike11nBody(locale, "2026-11-11", filled());
    assert.ok(bodySchema.safeParse(onTheDay).success, locale);
    assert.match(text(onTheDay.slice(0, 1)), today[locale], locale);
    const after = buildStrike11nBody(locale, "2026-11-12", filled());
    assert.ok(bodySchema.safeParse(after).success, locale);
    assert.match(text(after.slice(0, 1)), past[locale], locale);
  }
});

test("staleness: the page is stale only from the day after the strike, until the as-of date moves", () => {
  assert.equal(isStale("2026-11-10", "2026-10-29"), false);
  assert.equal(isStale("2026-11-11", "2026-10-29"), false);
  assert.equal(isStale("2026-11-12", "2026-10-29"), true);
  assert.equal(isStale("2026-11-12", "2026-11-11"), true);
  assert.equal(isStale("2026-11-12", "2026-11-12"), false);
});

test("the page is brought up to date after the strike (move STRIKE_11N_AS_OF and republish ?only=strike-11n)", () => {
  const today = madridDate(new Date());
  assert.ok(STRIKE_11N_AS_OF <= today, `STRIKE_11N_AS_OF (${STRIKE_11N_AS_OF}) is in the future`);
  assert.equal(
    isStale(today),
    false,
    `On ${today} the 11 November strike is over but the page still speaks from ${STRIKE_11N_AS_OF}. Update src/lib/content/batch02/strike-11n.ts (STRIKE_11N_AS_OF, every sector's minimum services) and publish ?only=strike-11n.`,
  );
  if (strikePhase(STRIKE_11N_AS_OF) === "past") {
    const pending = MINIMUM_SERVICES_11N.filter((s) => s.status === "pending").map((s) => s.key);
    assert.deepEqual(pending, [], `the strike is past on ${STRIKE_11N_AS_OF} but these sectors are still 'pending': record what was published`);
  }
});

test("the page is deterministic: no clock in the module, same output on every call", () => {
  const source = readFileSync(new URL("../src/lib/content/batch02/strike-11n.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(/, "the module reads the clock");
  for (const locale of LOCALES) {
    assert.equal(JSON.stringify(buildStrike11nBody(locale)), json(locale), locale);
  }
});

/* -------------------------------------------------------------------------- */
/* The strikes hub and the publish route                                      */
/* -------------------------------------------------------------------------- */

test("the strikes hub links here once per language and agrees on whether the order is out", () => {
  const general = STRIKES.find((s) => s.id === "vaga-general-2026-11-11");
  assert.ok(general);
  for (const locale of LOCALES) {
    const target = `](/${locale}/${B2_PATHS.strike11n[locale]}/)`;
    assert.equal(JSON.stringify(STRIKES_GUIDE.editions[locale].blocks).split(target).length - 1, 1, `hub/${locale}`);
    assert.equal(general.facts[locale].join(" ").split(target).length - 1, 1, `hub entry/${locale}`);
  }
  assert.equal(
    general.minimumServices.status === "pending",
    !generalitatOrderPublished(),
    "strikes.ts (11N entry) and strike-11n.ts disagree on whether the Generalitat's order is out: update both",
  );
  // The hub's own titles are untouched.
  assert.equal(STRIKES_GUIDE.editions.ca.seoTitle, "Vaga avui a Catalunya: què funciona i serveis mínims");
  assert.equal(STRIKES_GUIDE.editions.es.seoTitle, "Huelga hoy en Cataluña: qué funciona y servicios mínimos");
  assert.equal(STRIKES_GUIDE.editions.en.seoTitle, "Strike in Barcelona and Catalonia today: what runs");
});

test("the publish route has a strike-11n group that also republishes the hub", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ STRIKE_11N \} from "@\/lib\/content\/batch02\/strike-11n";/);
  assert.match(route, /wants\("strike-11n"\)\) published\.push\(await publishB2Article\(STRIKE_11N\), await publishB2Article\(STRIKES_GUIDE\)\)/);
});
