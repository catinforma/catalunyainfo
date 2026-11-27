import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

/**
 * 27 Nov 2026 live audit: 117 pages (69 in the sitemap) had FAQPage answers
 * worded differently from the text the page prints — the Spain-wide 2027 day
 * pages (/ca/festius/2027/dia/…, /es/festivos/2027/dia/…, /en/holidays/2027/day/…)
 * and the 2027 Catalonia date pages (/ca/festius/dia/<d>-2027/ …). The markup
 * now carries, for each question, the text printed under it, in its order.
 * These tests pin the schema to the same strings the components print.
 */

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { DAY_PAGES, spainDay } = await import("../src/lib/programmatic/spain-2027/days.ts");
const { dayH1, dayLead, dayNotes, daySections } = await import("../src/lib/programmatic/spain-2027/day-copy.ts");
const { dayH1Intl, dayLeadIntl, dayNotesIntl, daySectionsIntl } = await import("../src/lib/programmatic/spain-2027/day-copy-intl.ts");
const { printedDayFaq, dayWhereLines, dayBridgeLines } = await import("../src/lib/programmatic/spain-2027/day-faq.ts");
const { faqSchema } = await import("../src/lib/seo/jsonld.ts");
const { DATE_PAGES, sameDayIn2026 } = await import("../src/lib/programmatic/holidays/paths.ts");
const { dateContent } = await import("../src/lib/programmatic/holidays/dates.ts");
const { dateFaq, dateFaqItems } = await import("../src/lib/programmatic/holidays/structured.ts");
const { datePlaceLine } = await import("../src/lib/programmatic/holidays/places.ts");
const { isTranche4 } = await import("../src/lib/programmatic/holidays/dates-2027.ts");
const { dateQuestion } = await import("../src/lib/programmatic/holidays/question.ts");

const ROOT = join(import.meta.dirname, "..");
const DAYS_TSX = readFileSync(join(ROOT, "src/components/programmatic/spain-2027/days.tsx"), "utf8");
const DATE_TSX = readFileSync(join(ROOT, "src/components/programmatic/holidays/DatePage.tsx"), "utf8");
const LOCALES = ["ca", "es", "en"] as const;

/** The audit's comparison (scripts/lib/page-checks.ts): case and whitespace folded. */
const squash = (s: string) => s.replace(/[‘’´]/g, "'").replace(/\s+/g, "").toLowerCase();

type SchemaFaq = { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };

test("Spain day pages: FAQPage is the H1 and each H2 with exactly the text printed under it", () => {
  for (const iso of DAY_PAGES) {
    const day = spainDay(iso)!;
    for (const locale of LOCALES) {
      const sections = locale === "es" ? daySections(day) : daySectionsIntl(day, locale);
      const h1 = locale === "es" ? dayH1(iso) : dayH1Intl(iso, locale);
      const lead = locale === "es" ? [dayLead(day), ...dayNotes(day)] : [dayLeadIntl(day, locale), ...dayNotesIntl(day, locale)];
      // What SpainDayPage renders, block by block: the lead and notes, then each section's line and lists.
      const rendered = [
        { question: h1, answer: lead.join(" ") },
        ...sections.map((s) => ({
          question: s.question,
          answer: [s.printed, ...(s.more ?? []), ...(s.id === "donde" ? dayWhereLines(day, locale) : s.id === "puente" ? dayBridgeLines(day, locale) : [])].join("\n"),
        })),
      ];
      const schema = faqSchema([{ type: "faq", items: printedDayFaq(day, locale) }]) as unknown as SchemaFaq;
      assert.deepEqual(
        schema.mainEntity.map((q) => ({ question: q.name, answer: q.acceptedAnswer.text })),
        rendered,
        `${iso} ${locale}`,
      );
      // The whole page as the audit reads it contains every answer.
      const page = squash(rendered.flatMap((r) => [r.question, r.answer]).join(" "));
      for (const q of schema.mainEntity) assert.ok(page.includes(squash(q.acceptedAnswer.text)), `${iso} ${locale}: ${q.name}`);
      assert.doesNotMatch(JSON.stringify(schema), /undefined|null|NaN|\[object/, `${iso} ${locale}`);
    }
  }
});

test("Spain day pages: the component prints the lists from the same helpers the FAQ reads", () => {
  assert.match(DAYS_TSX, /faqSchema\(\[\{ type: "faq", items: printedDayFaq\(day, locale\) \}\]\)/);
  assert.doesNotMatch(DAYS_TSX, /w\.faq\(|dayFaq/);
  for (const loc of LOCALES) assert.match(DAYS_TSX, new RegExp(`\\.\\.\\.DAY_LIST_UI\\.${loc},`));
  assert.match(DAYS_TSX, /place: \(r\) => dayPlaceLabel\(r, "es"\)/);
  assert.match(DAYS_TSX, /place: \(r\) => dayPlaceLabel\(r, L\)/);
  assert.equal((DAYS_TSX.match(/\{dayHolderNote\(h, several, locale\)\}/g) ?? []).length, 2);
  // BridgeList: "<run> — <in> <places>." then the note; WhereLists: headings "On (n)", "Off (n)".
  assert.match(DAYS_TSX, /\{w\.run\(g\.run\)\} — \{UI\[locale\]\.in\} \{g\.regions\.length >= 10 \? w\.where\(g\.regions\) : <RegionLinks regions=\{g\.regions\} locale=\{locale\} \/>\}\./);
  assert.match(DAYS_TSX, /\{ui\.on\} \(\{day\.regions\.length\}\)/);
  assert.match(DAYS_TSX, /\{ui\.off\} \(\{working\.length\}\)/);
  assert.match(DAYS_TSX, /\{ui\.movedTo\}\{" "\}/);
  assert.match(DAYS_TSX, /\{i === 0 \? "" : i === regions\.length - 1 \? and : ", "\}/);
});

test("2027 date pages: FAQPage is the H1 and each H2 with exactly the text printed under it", () => {
  const pages = DATE_PAGES.filter((iso) => isTranche4(iso));
  assert.ok(pages.length >= 20, String(pages.length));
  for (const iso of pages) {
    for (const locale of LOCALES) {
      const c = dateContent(iso, locale);
      const items = dateFaqItems(iso, locale);
      // The lead, and its notes when nothing is printed between them (the 2026 twin line is).
      assert.deepEqual(items[0], { question: dateQuestion(iso, locale), answer: sameDayIn2026(iso) ? c.answer : [c.answer, ...c.answerNote].join(" ") }, `${iso} ${locale}`);
      const local = items.find((f) => f.question === c.local.title);
      assert.ok(local, `${iso} ${locale}: local question`);
      assert.equal(local.answer, [c.local.text, ...c.local.places.map((p) => datePlaceLine(p, locale)), c.local.note ?? ""].filter(Boolean).join("\n"), `${iso} ${locale}`);
      // Every other question is a section heading, answered by its paragraphs.
      for (const f of items.slice(1)) {
        if (f === local) continue;
        const section: { title: string; paragraphs: string[] } | undefined = c.sections.find((s: { title: string }) => s.title === f.question);
        assert.ok(section, `${iso} ${locale}: "${f.question}" is not a heading on the page`);
        assert.equal(f.answer, section.paragraphs.join(" "), `${iso} ${locale}: ${f.question}`);
      }
      const schema = dateFaq(iso, locale) as unknown as SchemaFaq;
      assert.equal(schema.mainEntity.length, items.length);
      assert.doesNotMatch(JSON.stringify(schema), /undefined|NaN|\[object/, `${iso} ${locale}`);
    }
  }
});

test("2027 date pages: the component prints the lead, the twin line, the notes and the town list in that order", () => {
  const lead = DATE_TSX.indexOf("{content.answer}</p>");
  const twin = DATE_TSX.indexOf("{sameDay2026 ? (");
  const notes = DATE_TSX.indexOf("{content.answerNote.map((p) => (");
  assert.ok(lead > 0 && lead < twin && twin < notes, "lead, then the 2026 twin, then the notes");
  // One list item per place: the name (linked or not), then " (" parent ")" for a nucleus.
  assert.match(DATE_TSX, /const label = locale === "es" \? esName\(p\.name\) : p\.name;/);
  assert.match(DATE_TSX, /\{" \("\}\s*\{href \? <Link href=\{href\}>\{parent\}<\/Link> : parent\}\s*\{"\)"\}/);
  assert.match(DATE_TSX, /<h2 id="local">\{content\.local\.title \?\? ui\.localTitle\}<\/h2>\s*<p>\{content\.local\.text\}<\/p>/);
});
