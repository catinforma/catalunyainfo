import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { DEATH_STEPS_AS_OF, DEATH_STEPS_CALCULATORS, DEATH_STEPS_GUIDE, DEATH_STEPS_REREAD_BY, DEATH_STEPS_URLS, buildDeathStepsBody } from "../src/lib/content/batch02/death-steps.ts";
import { B2_PATHS, B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import { searchShortcuts } from "../src/lib/content/search-shortcuts.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { DEADLINE as ISD_DEADLINE } from "../src/lib/programmatic/inheritance-tax/rules.ts";
import { DEADLINE as PV_DEADLINE } from "../src/lib/programmatic/plusvalia/rules.ts";

const blocks = (locale: Locale) => DEATH_STEPS_GUIDE.editions[locale].blocks;
const json = (locale: Locale) => JSON.stringify(blocks(locale));
const text = (locale: Locale) => bodyToPlainText(blocks(locale));
const links = (locale: Locale) => [...json(locale).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);
const tables = (locale: Locale) => (blocks(locale) as unknown as { type: string; rows?: string[][]; caption?: string }[]).filter((b) => b.type === "table");

/**
 * Hosts of the sources read on 19 Nov 2026: BOE, the Ministry of Justice
 * (e-office and its information page), the Catalan legal portal, the Catalan
 * Tax Agency, Social Security and the Bank of Spain's customer portal.
 */
const OFFICIAL = /^(www\.boe\.es|sede\.mjusticia\.gob\.es|www\.mjusticia\.gob\.es|portaljuridic\.gencat\.cat|atc\.gencat\.cat|www\.seg-social\.es|clientebancario\.bde\.es)$/;

test("death-steps: three editions on year-free registry paths, one entry", () => {
  assert.equal(DEATH_STEPS_GUIDE.key, "deathSteps");
  assert.equal(DEATH_STEPS_GUIDE.entryKey, "guide-death-steps-deadlines-spain");
  assert.deepEqual(Object.keys(DEATH_STEPS_GUIDE.editions).sort(), [...LOCALES].sort());
  for (const locale of LOCALES) {
    const edition = DEATH_STEPS_GUIDE.editions[locale];
    assert.equal(edition.path, B2_PATHS.deathSteps[locale]);
    assert.doesNotMatch(edition.path, /20\d\d/, "evergreen: no year in the path");
    assert.equal(b2href("deathSteps", locale), `/${locale}/${edition.path}/`);
    assert.equal(B2_TITLES.deathSteps[locale], edition.seoTitle, `${locale}: link anchor = title`);
  }
  assert.equal(new Set(LOCALES.map((l) => DEATH_STEPS_GUIDE.editions[l].path)).size, 3);
});

test("death-steps: every edition validates, is substantial and has the same shape", () => {
  const shape = (locale: Locale) => (blocks(locale) as Block[]).map((b) => b.type).join(",");
  for (const locale of LOCALES) {
    const parsed = bodySchema.safeParse(blocks(locale));
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(locale)) > 2500, `${locale}: ${wordCount(text(locale))} words`);
    assert.equal(shape(locale), shape("es"), `${locale}: same sections as the Spanish edition`);
    assert.deepEqual(buildDeathStepsBody(locale), blocks(locale));
    const { seoTitle, seoDescription, excerpt, title } = DEATH_STEPS_GUIDE.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} seoTitle ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 170, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30 && excerpt.length <= 600 && title.length > 10);
    for (const t of tables(locale)) for (const row of t.rows ?? []) assert.equal(row.length, (t as unknown as { headers: string[] }).headers.length, `${locale}: ${t.caption}`);
  }
  assert.match(DEATH_STEPS_GUIDE.editions.es.seoTitle, /^Qué hacer cuando fallece un familiar/);
  assert.match(DEATH_STEPS_GUIDE.editions.ca.seoTitle, /^Què cal fer quan mor un familiar/);
  assert.match(DEATH_STEPS_GUIDE.editions.en.seoTitle, /^What to do when someone dies in Spain/);
});

test("death-steps: the answer comes first (certificates after 15 working days, fee 006, the notary, 6-month tax deadlines, pension)", () => {
  const facts: Record<Locale, RegExp[]> = {
    ca: [/certificat mèdic/, /Registre Civil/, /15 dies hàbils/, /últimes voluntats/, /cobertura de defunció/, /taxa 006/, /declaració d'hereus/, /successions, 6 mesos/, /plusvàlua municipal, 6 mesos/, /viduïtat/],
    es: [/certificado médico/, /Registro Civil/, /15 días hábiles/, /últimas voluntades/, /seguros de cobertura de fallecimiento/, /tasa 006/, /declaración de herederos/, /sucesiones, 6 meses/, /plusvalía municipal, 6 meses/, /viudedad/],
    en: [/medical death certificate/, /Civil Registry/, /15 working days/, /últimas voluntades/, /seguros de cobertura de fallecimiento/, /fee 006/, /declaration of heirs/, /inheritance tax, 6 months/, /plusvalía municipal, 6 months/, /widow/],
  };
  for (const locale of LOCALES) {
    const first = blocks(locale)[0] as { text?: string; lead?: boolean };
    assert.ok(first.lead, `${locale}: first block is the lead`);
    for (const fact of facts[locale]) assert.match(first.text ?? "", fact, `${locale}: lead ${fact}`);
    const checklist = tables(locale)[0]!;
    assert.equal(blocks(locale)[1]!.type, "table", `${locale}: the checklist comes second`);
    assert.ok((checklist.rows ?? []).length >= 15, `${locale}: checklist rows`);
  }
});

test("death-steps: the tax deadlines are the calculators' own rules (RD 1629/1991 arts. 67-68, TRLRHL art. 110.2.b)", () => {
  assert.deepEqual({ ...ISD_DEADLINE }, { months: 6, extensionMonths: 6, askWithinMonths: 5 });
  assert.equal(PV_DEADLINE.mortisCausaMonths, 6);
  assert.equal(PV_DEADLINE.mortisCausaMaxMonths, 12);
  const words: Record<Locale, { months: string; ask: string; total: string }> = {
    ca: { months: `${ISD_DEADLINE.months} mesos`, ask: `Abans de ${ISD_DEADLINE.askWithinMonths} mesos`, total: `${ISD_DEADLINE.months + ISD_DEADLINE.extensionMonths} mesos amb pròrroga` },
    es: { months: `${ISD_DEADLINE.months} meses`, ask: `Antes de ${ISD_DEADLINE.askWithinMonths} meses`, total: `${ISD_DEADLINE.months + ISD_DEADLINE.extensionMonths} meses con prórroga` },
    en: { months: `${ISD_DEADLINE.months} months`, ask: `Before ${ISD_DEADLINE.askWithinMonths} months`, total: `${ISD_DEADLINE.months + ISD_DEADLINE.extensionMonths} months with the extension` },
  };
  for (const locale of LOCALES) {
    const body = text(locale);
    for (const w of Object.values(words[locale])) assert.ok(body.includes(w), `${locale}: ${w}`);
    assert.ok(body.includes("110.2"), `${locale}: plusvalía article`);
    assert.ok(body.includes("art. 68") && body.includes("67.1.a"), `${locale}: RD 1629/1991 articles`);
  }
  // The Spanish edition quotes the BOE's words.
  const es = text("es");
  assert.ok(es.includes("seis meses prorrogables hasta un año a solicitud del sujeto pasivo"));
  assert.ok(es.includes("contados desde el día del fallecimiento del causante"));
  assert.ok(es.includes("dentro de los cinco primeros meses del plazo"));
});

test("death-steps: the Registro Civil, certificates and Social Security facts as read on 19 Nov 2026", () => {
  const must: Record<Locale, (string | RegExp)[]> = {
    ca: ["arts. 62 i 66", "art. 62.3", "art. 67.2", "Decret 297/1997", "24 hores", "48 hores", "37.3.b bis", "90 dies naturals", "7 dies hàbils", "art. 6.2", "cinc anys", "46,50 euros", "20 %", "art. 230", "art. 53.1", "art. 224.1", "art. 224.3", "art. 8.1.a"],
    es: ["arts. 62 y 66", "art. 62.3", "art. 67.2", "Decret 297/1997", "24 horas", "48 horas", "37.3.b bis", "90 días naturales", "7 días hábiles", "art. 6.2", "cinco años", "«46,50 euros»", "«el 20% de la base reguladora»", "art. 230", "art. 53.1", "art. 224.1", "art. 224.3", "art. 8.1.a"],
    en: ["arts. 62 and 66", "art. 62.3", "art. 67.2", "Decree 297/1997", "24 hours", "48 hours", "37.3.b bis", "90 calendar days", "7 working days", "art. 6.2", "five years", "€46.50", "20%", "art. 230", "art. 53.1", "art. 224.1", "art. 224.3", "art. 8.1.a"],
  };
  for (const locale of LOCALES) {
    const body = text(locale);
    for (const m of must[locale]) assert.ok(typeof m === "string" ? body.includes(m) : m.test(body), `${locale}: ${m}`);
  }
  const es = text("es");
  for (const quote of [
    "En ningún caso podrá efectuarse la inscripción de defunción sin que se haya presentado ante el Registro Civil el certificado médico de defunción",
    "en el plazo que reglamentariamente se establezca",
    "a la mayor brevedad posible",
    "agentes funerarios que, en representación de la familia, suelen ser los encargados de comunicar la defunción ante el Registro Civil",
    "No es podrà donar destinació final a un cadàver abans del transcurs de 24 hores des de la defunció",
    "el documento que acredita si una persona ha otorgado testamento/s y ante qué Notario/s",
    "las entidades de crédito no deben permitir disposiciones en las cuentas del cliente fallecido",
    "a partir de los tres meses anteriores a la fecha en que se presente la correspondiente solicitud",
  ]) {
    assert.ok(es.includes(quote), `es quotes: ${quote}`);
  }
});

test("death-steps: Catalonia's book four, where it differs from the Civil Code", () => {
  const cat = (locale: Locale) => tables(locale).find((t) => /Codi civil de Catalunya|Catalan Civil Code/.test(t.caption ?? ""));
  for (const locale of LOCALES) {
    const table = cat(locale);
    assert.ok(table, `${locale}: comparison table`);
    const cells = JSON.stringify(table!.rows);
    for (const art of ["808", "451-5", "451-4", "834", "452-1", "442-3", "1005", "461-12.1", "461-12.2", "1014", "461-15", "461-17"]) assert.ok(cells.includes(art), `${locale}: art. ${art}`);
    const body = text(locale);
    for (const art of ["442-5.2", "461-15.2", "461-20", "Llei 13/2026", "4", "9.8", "16.1"]) assert.ok(body.includes(art), `${locale}: ${art}`);
  }
  assert.ok(text("es").includes("una cuarta parte") && text("es").includes("Dos terceras partes"));
  assert.ok(text("ca").includes("Una quarta part") && text("ca").includes("Dues terceres parts"));
  assert.ok(text("en").includes("One quarter") && text("en").includes("Two thirds"));
  // Catalan originals quoted verbatim in the Spanish and Catalan editions.
  for (const locale of ["es", "ca"] as const) {
    const body = text(locale);
    assert.ok(body.includes("El dret del cridat a acceptar o repudiar l'herència no està sotmès a termini"), `${locale}: 461-12.1`);
    assert.ok(body.includes("es pot exercir en el termini d'un any a comptar de la mort del causant"), `${locale}: 442-5.2`);
  }
});

test("death-steps: nothing the official pages do not say (no fee amount, no wills-certificate delay, no 'frozen by law')", () => {
  for (const locale of LOCALES) {
    const body = text(locale);
    assert.doesNotMatch(body, /3[.,][0-9]{2}\s*(€|euros?)|€\s*3[.,][0-9]{2}/i, `${locale}: no fee 006 amount`);
    assert.doesNotMatch(body, /\b\d+\s*(setmanes|semanas|weeks)\b/i, `${locale}: no invented waiting time`);
    assert.doesNotMatch(body, /(la ley|la llei|the law) (bloquea|bloqueja|freezes)/i, `${locale}: no legal freezing claim`);
    assert.doesNotMatch(body, /650\/2012/, `${locale}: the EU Succession Regulation was not read`);
  }
});

test("death-steps: external links are official sites only, https, no tracking, never aerobusbcn", () => {
  for (const locale of LOCALES) {
    const external = links(locale).filter((h) => h.startsWith("http"));
    assert.ok(external.length >= 25, `${locale}: only ${external.length} official links`);
    for (const href of external) {
      const url = new URL(href);
      assert.equal(url.protocol, "https:", href);
      assert.match(url.hostname, OFFICIAL, `${locale}: ${url.hostname} is not an official source`);
      assert.doesNotMatch(href, /utm_|aerobus/i, href);
    }
    for (const must of [DEATH_STEPS_URLS.lrc, DEATH_STEPS_URLS.mjWills, DEATH_STEPS_URLS.mjInsurance, DEATH_STEPS_URLS.cccat, DEATH_STEPS_URLS.risd, DEATH_STEPS_URLS.trlrhl, DEATH_STEPS_URLS.lgss, DEATH_STEPS_URLS.ssGrant, DEATH_STEPS_URLS.bde]) {
      assert.ok(links(locale).includes(must), `${locale}: links ${must}`);
    }
  }
  for (const source of DEATH_STEPS_GUIDE.sources) assert.match(new URL(source.url).hostname, OFFICIAL, source.url);
  assert.equal(new Set(DEATH_STEPS_GUIDE.sources.map((s) => s.url)).size, DEATH_STEPS_GUIDE.sources.length, "no duplicate source URL (it breaks the publish)");
});

test("death-steps: internal links stay in the edition's language, end in a slash and reach every calculator it ties together", () => {
  for (const locale of LOCALES) {
    const internal = links(locale).filter((h) => h.startsWith("/"));
    for (const href of internal) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href} crosses languages`);
      assert.match(href, /\/$/, href);
    }
    for (const id of DEATH_STEPS_CALCULATORS) assert.ok(internal.includes(calcPath(id, locale)), `${locale}: links ${id}`);
    assert.ok(internal.includes(b2href("payDates", locale)), `${locale}: links the pay-dates guide`);
  }
});

test("death-steps: no clock times in the running text", () => {
  for (const locale of LOCALES) {
    const prose = bodyToPlainText(blocks(locale).filter((b) => b.type !== "table"));
    assert.doesNotMatch(prose, /(?<!€)\b([01]?\d|2[0-3])[:.][0-5]\d\b/, `${locale}: a clock time outside a table`);
  }
});

test("death-steps: no photograph, with the reason, and a disclaimer before the FAQ", () => {
  assert.equal(DEATH_STEPS_GUIDE.heroKey, undefined);
  assert.ok((DEATH_STEPS_GUIDE.noPhotoReason ?? "").length > 40);
  for (const locale of LOCALES) {
    const types = (blocks(locale) as { type: string; tone?: string }[]).map((b) => (b.type === "callout" ? `callout:${b.tone}` : b.type));
    assert.ok(types.indexOf("callout:warning") > 0 && types.indexOf("callout:warning") < types.indexOf("faq"), `${locale}: YMYL disclaimer before the FAQ`);
    assert.ok(types.includes("callout:official"), `${locale}: verified line`);
    const faqItems = (blocks(locale).find((b) => b.type === "faq") as unknown as { items: unknown[] }).items;
    assert.ok(faqItems.length >= 12, `${locale}: FAQ`);
  }
});

test("death-steps: the facts were read recently (re-read every source in death-steps.ts from January, then move DEATH_STEPS_AS_OF)", () => {
  assert.equal(DEATH_STEPS_GUIDE.verifiedAt, DEATH_STEPS_AS_OF);
  assert.ok(DEATH_STEPS_AS_OF < DEATH_STEPS_REREAD_BY);
  assert.ok(Date.now() < Date.parse(`${DEATH_STEPS_REREAD_BY}T00:00:00Z`), `Death-steps facts last read ${DEATH_STEPS_AS_OF}: re-read the ISD, plusvalía, LGSS and Seguridad Social pages, the Ministry of Justice certificates and book four of the Catalan Civil Code (Llei 13/2026 in force 4 Feb 2027), then move DEATH_STEPS_AS_OF and DEATH_STEPS_REREAD_BY`);
});

test("death-steps: the calculators link back to the guide (inheritance by region, gift tax, comparison, plusvalía, widow's pension)", () => {
  for (const file of [
    "../src/components/programmatic/inheritance-tax/InheritanceByRegion.tsx",
    "../src/components/programmatic/gift-tax/GiftByRegion.tsx",
    "../src/components/programmatic/inheritance-compare/InheritanceComparePage.tsx",
    "../src/components/programmatic/plusvalia/PlusvaliaPage.tsx",
    "../src/components/programmatic/widow-pension/WidowPensionPage.tsx",
  ]) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.match(source, /<Link href=\{b2href\("deathSteps", locale\)\}>\{B2_TITLES\.deathSteps\[locale\]\}<\/Link>/, file);
  }
});

test("death-steps: the publish route registers `fallecimiento`", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("fallecimiento"\)\) published\.push\(await publishB2Article\(DEATH_STEPS_GUIDE\)\)/);
});

test("death-steps: the site search opens the guide, and 'permiso por fallecimiento' still opens the paid-leave calculator", () => {
  const first = (locale: Locale, q: string) => searchShortcuts(locale, q)[0]?.href;
  assert.equal(first("es", "trámites fallecimiento"), b2href("deathSteps", "es"));
  assert.equal(first("es", "certificado de últimas voluntades"), b2href("deathSteps", "es"));
  assert.equal(first("es", "seguros de cobertura de fallecimiento"), b2href("deathSteps", "es"));
  assert.equal(first("ca", "últimes voluntats"), b2href("deathSteps", "ca"));
  assert.equal(first("en", "death certificate"), b2href("deathSteps", "en"));
  assert.equal(first("es", "permiso por fallecimiento"), calcPath("paid-leave", "es"));
});
