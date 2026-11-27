import assert from "node:assert/strict";
import test from "node:test";

/**
 * Batch 10G (27 Nov 2026): the 2027 Catalonia date pages (/ca/festius/dia/<d>-2027/,
 * /es/festivos/dia/<d>-2027/, /en/holidays/day/<d>-2027/) answer under their own
 * headings which weekday the date is, whether a Saturday or Sunday is moved to
 * the Monday (Catalonia's order, the councils' local days, the BOE list) and,
 * on 17 May, when Pasqua Granada is. Each heading is an FAQ item with the
 * same text. Nothing typed: every fact comes from the data modules.
 */

const { TRANCHE_4 } = await import("../src/lib/programmatic/holidays/paths.ts");
const { dateContent2027, dayKind2027, WHIT_MONDAY_2027 } = await import("../src/lib/programmatic/holidays/dates-2027.ts");
const { nextYearPlacesOn, regionalDays } = await import("../src/lib/programmatic/holidays/data.ts");
const { spainScope, regionList } = await import("../src/lib/programmatic/holidays/boe-2027.ts");
const { addDays, weekdayName } = await import("../src/lib/programmatic/holidays/format.ts");
const { dateFaq } = await import("../src/lib/programmatic/holidays/structured.ts");

type L = "ca" | "es" | "en";
const LOCALES: L[] = ["ca", "es", "en"];
const WEEKDAY_Q: Record<L, RegExp> = { ca: /^Quin dia de la setmana és /, es: /^¿Qué día de la semana es el /, en: /^What day of the week is / };
const MONDAY_Q: Record<L, RegExp> = { ca: /^Es passa al dilluns /, es: /^¿Se pasa al lunes el /, en: /moved to the Monday\?$/ };

const kindOf = (iso: string) => dayKind2027(iso, nextYearPlacesOn(iso).places);
const isWeekendKind = (iso: string) => ["weekend", "weekend-holiday"].includes(kindOf(iso));
function mondayAfter(iso: string): string {
  let d = addDays(iso, 1);
  while (new Date(`${d}T12:00:00Z`).getUTCDay() !== 1) d = addDays(d, 1);
  return d;
}

function section(iso: string, locale: L, q: RegExp) {
  const c = dateContent2027(iso, locale);
  const i = c.sections.findIndex((s) => q.test(s.title));
  return { c, i, s: c.sections[i] };
}

test("every 2027 date page, every language: the weekday right after the towns, the Monday next to it on weekends, both in the FAQ", () => {
  assert.ok(TRANCHE_4.length >= 20, String(TRANCHE_4.length));
  for (const iso of TRANCHE_4) {
    for (const locale of LOCALES) {
      const { c, i, s } = section(iso, locale, WEEKDAY_Q[locale]);
      assert.ok(s, `${iso} ${locale}: no weekday heading`);
      // The first section after the list of towns (DatePage prints sections[sectionsBeforeLocal] first after it).
      assert.equal(i, c.sectionsBeforeLocal ?? 0, `${iso} ${locale}`);
      assert.equal(s.paragraphs.length, 1);
      assert.ok(s.paragraphs[0]!.includes(weekdayName(iso, locale)), `${iso} ${locale}: ${s.paragraphs[0]}`);
      const monday = section(iso, locale, MONDAY_Q[locale]);
      if (isWeekendKind(iso)) {
        assert.equal(monday.i, i + 1, `${iso} ${locale}: Monday section after the weekday`);
      } else {
        assert.equal(monday.i, -1, `${iso} ${locale}: no Monday section on a weekday`);
      }
      const faq = c.faq ?? [];
      for (const block of [s, monday.s].filter(Boolean)) {
        const item = faq.find((f) => f.question === block!.title);
        assert.ok(item, `${iso} ${locale}: "${block!.title}" not in the FAQ`);
        assert.equal(item.answer, block!.paragraphs.join(" "));
      }
      assert.equal(new Set(faq.map((f) => f.question)).size, faq.length, `${iso} ${locale}: unique questions`);
      assert.doesNotMatch(JSON.stringify(dateFaq(iso, locale)), /undefined|NaN|\[object/, `${iso} ${locale}`);
    }
  }
});

test("the Monday section says what the order, the councils and the BOE mark on that Monday, for every weekend date", () => {
  const off = new Set(regionalDays(2027).map((d) => d.date));
  const weekendDates = TRANCHE_4.filter(isWeekendKind);
  assert.ok(weekendDates.length >= 4, weekendDates.join(","));
  for (const iso of weekendDates) {
    const monday = mondayAfter(iso);
    const scope = spainScope(monday);
    const local = nextYearPlacesOn(monday);
    for (const locale of LOCALES) {
      const { s } = section(iso, locale, MONDAY_Q[locale]);
      const [catalonia, spain] = s!.paragraphs;
      if (!off.has(monday)) assert.match(catalonia!, { ca: /^No a Catalunya/, es: /^No en Cataluña/, en: /^Not in Catalonia/ }[locale], `${iso} ${locale}`);
      assert.equal(/festa local|fiesta local|local holiday/.test(catalonia!), local.places.length > 0, `${iso} ${locale}: local days on ${monday}`);
      assert.match(spain!, /BOE/);
      if (scope.kind === "some") assert.ok(spain!.includes(regionList(scope.regions, locale)), `${iso} ${locale}: ${spain}`);
      if (scope.kind === "none") assert.match(spain!, { ca: /a cap comunitat/, es: /en ninguna comunidad/, en: /in any region/ }[locale]);
    }
  }
});

test("Catalonia-only days: 24 June (Thursday) and 26 December (Sunday, not a holiday in 2027)", () => {
  assert.equal(section("2027-06-24", "ca", WEEKDAY_Q.ca).s!.paragraphs[0], "Cau en dijous: el dijous 24 de juny de 2027.");
  assert.equal(section("2027-06-24", "es", WEEKDAY_Q.es).s!.paragraphs[0], "Cae en jueves: el jueves 24 de junio de 2027.");
  assert.equal(section("2027-06-24", "en", WEEKDAY_Q.en).s!.paragraphs[0], "It falls on a Thursday: Thursday 24 June 2027.");
  assert.equal(section("2027-06-24", "es", MONDAY_Q.es).i, -1);

  const dec26 = { ca: section("2027-12-26", "ca", MONDAY_Q.ca).s!, es: section("2027-12-26", "es", MONDAY_Q.es).s!, en: section("2027-12-26", "en", MONDAY_Q.en).s! };
  assert.equal(dec26.ca.title, "Es passa al dilluns el 26 de desembre de 2027?");
  assert.equal(dec26.es.title, "¿Se pasa al lunes el 26 de diciembre de 2027?");
  assert.equal(dec26.en.title, "Is 26 December 2027 moved to the Monday?");
  assert.equal(dec26.ca.paragraphs[0], "No a Catalunya: el 26 de desembre de 2027 no és festiu i l'Ordre EMT/52/2026 tampoc no fa festiu el dilluns 27 de desembre.");
  assert.equal(dec26.es.paragraphs[1], "En el resto de España, la relación de fiestas de 2027 publicada en el BOE no marca el lunes 27 de diciembre en ninguna comunidad.");
  assert.equal(dec26.en.paragraphs[1], "In the rest of Spain, the BOE's list of 2027 holidays does not mark Monday 27 December in any region.");
});

test("Spain-wide days: 12 October (Tuesday) and 15 August (Sunday: six regions take Monday 16 August, Catalonia does not)", () => {
  assert.equal(section("2027-10-12", "es", WEEKDAY_Q.es).s!.title, "¿Qué día de la semana es el 12 de octubre de 2027?");
  assert.equal(section("2027-10-12", "ca", WEEKDAY_Q.ca).s!.paragraphs[0], "Cau en dimarts: el dimarts 12 d'octubre de 2027.");
  assert.equal(section("2027-10-12", "en", WEEKDAY_Q.en).s!.paragraphs[0], "It falls on a Tuesday: Tuesday 12 October 2027.");

  const es = section("2027-08-15", "es", MONDAY_Q.es).s!;
  assert.match(es.paragraphs[0]!, /^No en Cataluña: el 15 de agosto de 2027 no es festivo y la Orden EMT\/52\/2026 tampoco hace festivo el lunes 16 de agosto\. El lunes 16 de agosto sí es fiesta local al menos en \d+ municipios/);
  assert.equal(es.paragraphs[1], "En el resto de España, el lunes 16 de agosto es festivo en Andalucía, Aragón, Asturias, Canarias, Castilla y León y la Comunidad de Madrid, según la relación de fiestas de 2027 publicada en el BOE.");
  assert.match(section("2027-08-15", "ca", MONDAY_Q.ca).s!.paragraphs[1]!, /^A la resta d'Espanya, el dilluns 16 d'agost és festiu a Andalusia, /);
  assert.match(section("2027-08-15", "en", MONDAY_Q.en).s!.paragraphs[1]!, /^In the rest of Spain, Monday 16 August is a holiday in Andalusia, Aragon, Asturias, the Canary Islands, Castile and León and the Community of Madrid/);

  // 1 May, a Saturday holiday: not moved in Catalonia; the Saturday-compensation section stays after the Monday one.
  const may1 = dateContent2027("2027-05-01", "ca");
  const titles = may1.sections.map((s) => s.title);
  assert.equal(may1.sections[titles.findIndex((t) => MONDAY_Q.ca.test(t))]!.paragraphs[0]!.startsWith("No a Catalunya: l'Ordre EMT/52/2026 no el passa a cap altre dia i el dilluns 3 de maig és feiner."), true);
  assert.ok(titles.findIndex((t) => MONDAY_Q.ca.test(t)) < titles.findIndex((t) => /compensen el festiu/.test(t)));
});

test("Easter Monday keeps 'when is Easter' above the towns; Pasqua Granada gets its own, seven weeks later", () => {
  for (const locale of LOCALES) {
    const easter = dateContent2027("2027-03-29", locale);
    assert.equal(easter.sectionsBeforeLocal, 1);
    assert.match(easter.sections[0]!.title, { ca: /^Quan és Pasqua el 2027\?$/, es: /^¿Cuándo es Pascua en 2027\?$/, en: /^When is Easter in 2027\?$/ }[locale]);
    assert.match(easter.sections[1]!.title, WEEKDAY_Q[locale]);
    assert.equal(section("2027-03-29", locale, MONDAY_Q[locale]).i, -1);
  }
  assert.equal(section("2027-03-29", "es", WEEKDAY_Q.es).s!.paragraphs[0], "Cae en lunes: el lunes 29 de marzo de 2027.");

  assert.equal(WHIT_MONDAY_2027, addDays("2027-03-29", 49));
  const titles: Record<L, string> = { ca: "Quan és la Pasqua Granada el 2027?", es: "¿Cuándo es la Pascua Granada en 2027?", en: "When is Whit Monday (Pasqua Granada) in 2027?" };
  for (const locale of LOCALES) {
    const c = dateContent2027(WHIT_MONDAY_2027, locale);
    assert.equal(c.sectionsBeforeLocal, 1, locale);
    assert.equal(c.sections[0]!.title, titles[locale]);
    assert.equal(c.faq?.[1]?.question, titles[locale]);
    assert.ok(c.sections[0]!.paragraphs[0]!.includes("Barcelona"), locale);
  }
  assert.match(dateContent2027(WHIT_MONDAY_2027, "ca").sections[0]!.paragraphs[0]!, /^La Pasqua Granada del 2027 és el dilluns 17 de maig, set setmanes després del Dilluns de Pasqua \(dilluns 29 de març\)\. No és cap dels dotze festius del 2027 a Catalunya \(Ordre EMT\/52\/2026\): és festa local almenys a \d+ municipis/);
  assert.match(dateContent2027(WHIT_MONDAY_2027, "es").sections[0]!.paragraphs[0]!, /^La Pascua Granada de 2027 es el lunes 17 de mayo, siete semanas después del Lunes de Pascua \(lunes 29 de marzo\)/);
  assert.match(dateContent2027(WHIT_MONDAY_2027, "en").sections[0]!.paragraphs[0]!, /^Whit Monday \(Pasqua Granada\) 2027 is Monday 17 May, seven weeks after Easter Monday \(Monday 29 March\)/);
  // No other page gets it.
  for (const iso of TRANCHE_4.filter((d) => d !== WHIT_MONDAY_2027)) assert.ok(!dateContent2027(iso, "ca").sections.some((s) => s.title === titles.ca), iso);
});
