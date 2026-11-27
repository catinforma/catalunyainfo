import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

/**
 * Batch 10E (27 Nov 2026): the Spain-wide 2027 day pages answer, under their
 * own headings, whether the day is a holiday in Catalonia, whether shops open
 * there and which weekday it is. Every fact is the Catalonia date pages'
 * (dates-2027.ts) or the calendar's; nothing is typed twice.
 */

const ROOT = join(import.meta.dirname, "..");
const { DAY_PAGES, spainDay } = await import("../src/lib/programmatic/spain-2027/days.ts");
const { daySections } = await import("../src/lib/programmatic/spain-2027/day-copy.ts");
const { daySectionsIntl } = await import("../src/lib/programmatic/spain-2027/day-copy-intl.ts");
const { printedDayFaq } = await import("../src/lib/programmatic/spain-2027/day-faq.ts");
const { cataloniaDay2027, dateContent2027, dayKind2027 } = await import("../src/lib/programmatic/holidays/dates-2027.ts");

type L = "ca" | "es" | "en";
const LOCALES: L[] = ["ca", "es", "en"];

function sections(iso: string, locale: L) {
  const day = spainDay(iso)!;
  return locale === "es" ? daySections(day) : daySectionsIntl(day, locale);
}

function section(iso: string, locale: L, id: string) {
  const s = sections(iso, locale).find((x) => x.id === id);
  assert.ok(s, `${iso} ${locale}: no section ${id}`);
  return s;
}

test("every day page, every language: Catalonia and shops after the long weekend, the weekday after 'what is celebrated'", () => {
  assert.equal(DAY_PAGES.length, 27);
  for (const iso of DAY_PAGES) {
    for (const locale of LOCALES) {
      const ids = sections(iso, locale).map((s) => s.id);
      const at = (id: string) => ids.indexOf(id);
      assert.equal(at("cataluna"), at("puente") + 1, `${iso} ${locale} ${ids}`);
      assert.equal(at("tiendas"), at("puente") + 2, `${iso} ${locale} ${ids}`);
      assert.equal(at("dia-semana"), at("que-se-celebra") + 1, `${iso} ${locale} ${ids}`);
      for (const s of sections(iso, locale)) {
        const text = [s.question, s.printed, ...(s.more ?? [])].join(" ");
        assert.doesNotMatch(text, /undefined|null|NaN|\$\{/, `${iso} ${locale} ${s.id}`);
        assert.ok(s.printed.length > 0, `${iso} ${locale} ${s.id}`);
      }
    }
  }
});

test("the Catalonia and shops answers are the Catalonia date page's own, and agree with the BOE's Catalonia column", () => {
  for (const iso of DAY_PAGES) {
    const day = spainDay(iso)!;
    for (const locale of LOCALES) {
      const c = dateContent2027(iso, locale);
      assert.equal(section(iso, locale, "cataluna").printed, c.answer, `${iso} ${locale}`);
      const shops = c.sections.find((s) => s.paragraphs.join(" ") === cataloniaDay2027(iso, locale).shops.join(" "));
      assert.ok(shops, `${iso} ${locale}: the shops paragraphs are the date page's`);
      const t = section(iso, locale, "tiendas");
      assert.deepEqual([t.printed, ...(t.more ?? [])], shops.paragraphs, `${iso} ${locale}`);
    }
    // Ordre EMT/52/2026 (DOGC) and BOE-A-2026-21254 (column CT) say the same of each day.
    assert.equal(cataloniaDay2027(iso, "es").holiday, day.regions.includes("CT"), iso);
    assert.equal(cataloniaDay2027(iso, "es").holiday, ["holiday", "weekend-holiday"].includes(dayKind2027(iso)), iso);
  }
});

test("19 March 2027, a holiday in some communities only: Catalonia says no, with its towns; weekday in three languages", () => {
  const iso = "2027-03-19";
  assert.ok(!spainDay(iso)!.national && spainDay(iso)!.regions.length > 1 && !spainDay(iso)!.regions.includes("CT"));
  assert.equal(section(iso, "es", "cataluna").question, "¿Es festivo el 19 de marzo de 2027 en Cataluña?");
  assert.equal(section(iso, "ca", "cataluna").question, "És festiu el 19 de març de 2027 a Catalunya?");
  assert.equal(section(iso, "en", "cataluna").question, "Is 19 March 2027 a public holiday in Catalonia?");
  assert.match(section(iso, "es", "cataluna").printed, /^No\. El viernes 19 de marzo de 2027, San José, es laborable en Cataluña/);
  assert.match(section(iso, "ca", "cataluna").printed, /^No\./);
  assert.match(section(iso, "en", "cataluna").printed, /^No\./);
  assert.equal(section(iso, "es", "dia-semana").question, "¿Qué día de la semana es el 19 de marzo de 2027?");
  assert.equal(section(iso, "es", "dia-semana").printed, "Cae en viernes: el viernes 19 de marzo de 2027.");
  assert.equal(section(iso, "ca", "dia-semana").printed, "Cau en divendres: el divendres 19 de març de 2027.");
  assert.equal(section(iso, "en", "dia-semana").printed, "It falls on a Friday: Friday 19 March 2027.");
  assert.equal(section(iso, "es", "tiendas").question, "¿Abren las tiendas en Cataluña el 19 de marzo de 2027?");
  assert.match(section(iso, "es", "tiendas").printed, /^Es laborable: las tiendas abren con su horario habitual/);
  assert.equal(section(iso, "en", "tiendas").question, "Are shops open in Catalonia on 19 March 2027?");
});

test("15 August 2027 (Sunday, moved elsewhere): not a holiday in Catalonia, nor the Monday", () => {
  const iso = "2027-08-15";
  assert.ok(spainDay(iso)!.moved);
  assert.match(section(iso, "es", "cataluna").printed, /^No\. .*cae en domingo.*ni incluye el lunes 16 de agosto\.$/);
  assert.match(section(iso, "ca", "cataluna").printed, /ni hi posa el dilluns 16 d'agost\.$/);
  assert.match(section(iso, "en", "cataluna").printed, /does not add Monday 16 August either\.$/);
  assert.equal(section(iso, "es", "dia-semana").printed, "Cae en domingo: el domingo 15 de agosto de 2027.");
});

test("Easter Monday, 6 December and 1 May 2027: Aran's swap, shops closed by law, shops allowed, a Saturday", () => {
  assert.match(section("2027-03-29", "es", "cataluna").printed, /excepto en Arán/);
  assert.match(section("2027-03-29", "es", "tiendas").printed, /tienen que cerrar.*Ley 18\/2017, artículo 36\.2\.d/);
  assert.equal(section("2027-03-29", "es", "tiendas").more?.length, 1);
  assert.match(section("2027-12-06", "ca", "tiendas").printed, /^Les botigues poden obrir: el 6 de desembre és un dels vuit diumenges i festius d'obertura/);
  assert.match(section("2027-12-06", "en", "tiendas").printed, /^Shops may open: 6 December is one of the eight/);
  assert.match(section("2027-05-01", "es", "cataluna").printed, /^Sí, pero cae en sábado\./);
  assert.equal(section("2027-05-01", "en", "dia-semana").printed, "It falls on a Saturday: Saturday 1 May 2027.");
});

test("date guard: the 'municipal opening days not published yet' line is re-read against the DOGC", async () => {
  const { SHOPS_MUNICIPAL_2027_REREAD_BY } = await import("../src/lib/programmatic/spain-2027/day-catalonia.ts");
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  assert.ok(
    today < SHOPS_MUNICIPAL_2027_REREAD_BY,
    `From ${SHOPS_MUNICIPAL_2027_REREAD_BY}: read the DOGC for the 2027 municipal shop-opening days (Ordre EMT/89/2026, art. 5); if published, update shopsParagraphs in dates-2027.ts, then move the date.`,
  );
});

test("FAQPage carries the three questions with the printed text, and the component prints the extra paragraphs and the Catalonia link", () => {
  for (const locale of LOCALES) {
    const faq = printedDayFaq(spainDay("2027-03-29")!, locale);
    for (const id of ["cataluna", "tiendas", "dia-semana"]) {
      const s = section("2027-03-29", locale, id);
      assert.deepEqual(
        faq.find((f) => f.question === s.question),
        { question: s.question, answer: [s.printed, ...(s.more ?? [])].join("\n") },
        `${locale} ${id}`,
      );
    }
  }
  const tsx = readFileSync(join(ROOT, "src/components/programmatic/spain-2027/days.tsx"), "utf8");
  assert.match(tsx, /\{s\.more\?\.map\(\(p\) => \(/);
  assert.match(tsx, /\{s\.id === "cataluna" \? \(/);
});
