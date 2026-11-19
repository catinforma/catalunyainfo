import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { classifyLinkClick } from "../src/lib/analytics/clicks.ts";
import { headingId, type Block } from "../src/lib/content/blocks.ts";
import { POSTAL_29N } from "../src/lib/content/batch02/postal-vote.ts";
import { B2_PATHS, B2_TITLES, b2href, type B2Key } from "../src/lib/content/batch02/shared.ts";
import { STRIKE_DAY } from "../src/lib/content/batch02/strike-days-1920n.ts";
import { STRIKE_11N_CITY_REFS, strike11nCityHref } from "../src/lib/content/batch02/strike-11n-city-paths.ts";
import { STRIKES_AS_OF } from "../src/lib/content/batch02/strikes.ts";
import { VOTING } from "../src/lib/content/batch02/voting.ts";
import {
  BARCELONA_KEYS,
  CATALONIA_STRIKE_KEYS,
  CHRISTMAS_KEYS,
  ELECTION_KEYS,
  HOLIDAY_KEYS,
  NEXT_STEP_MAX_LINKS,
  NEXT_STEP_TITLE,
  SPAIN_STRIKE_KEYS,
  STRIKE_11N_SPAIN_KEY_PREFIX,
  VOTING_WHERE,
  b2KeyForHref,
  christmasNextStep,
  electionNextStep,
  electionTownNextStep,
  entryNextStep,
  holidayDateNextStep,
  nextStepIndex,
  nextStrikePages,
  pathOnly,
  strikeNextStep,
  type NextStep,
} from "../src/lib/engagement/next-step.ts";
import { CALCULATOR_NEXT, calculatorNextStep } from "../src/lib/engagement/next-step-calculators.ts";
import { townNextStep } from "../src/lib/engagement/next-step-towns.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { hubCards } from "../src/lib/programmatic/calculators/hub.ts";
import { CALCULATOR_IDS, calcPath, calculatorsHubPath } from "../src/lib/programmatic/calculators/paths.ts";
import { towns } from "../src/lib/programmatic/christmas-fairs/data.ts";
import { fairsHubPath, townTranslations } from "../src/lib/programmatic/christmas-fairs/paths.ts";
import { municipalities } from "../src/lib/programmatic/holidays/data.ts";
import { leavePath } from "../src/lib/programmatic/leave-2027/copy.ts";
import { checkPath } from "../src/lib/programmatic/lottery-check/paths.ts";
import { hubMeta as rodaliesHubMeta } from "../src/lib/programmatic/rodalies/pages.ts";
import { hubPath as rodaliesHubPath } from "../src/lib/programmatic/rodalies/paths.ts";

/**
 * The "next useful step" box (18 Nov 2026, lib/engagement/next-step.ts):
 * every link a path the site builds, in the reader's language, never the page
 * itself, 1 to 3 links, anchors that are the target's own title, dated steps
 * that never point back in time, and clicks reported as related_content_click.
 */

const read = (rel: string) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const TODAY = "2026-11-18";

/** Every page these boxes may link, in one language. */
function knownPaths(locale: Locale): Set<string> {
  return new Set([
    ...Object.values(B2_PATHS).map((paths) => `/${locale}/${paths[locale]}/`),
    rodaliesHubPath(locale),
    leavePath(locale),
    calculatorsHubPath(locale),
    fairsHubPath(locale),
    ...CALCULATOR_IDS.map((id) => calcPath(id, locale)),
    ...hubCards().filter((card) => !card.hrefLang?.[locale]).map((card) => card.href[locale]),
    ...towns().flatMap((town) => townTranslations(town)[locale] ?? []),
    // The Christmas lottery checker (a code route), the prize tax calculator's next step.
    checkPath(locale),
  ]);
}
const KNOWN = Object.fromEntries(LOCALES.map((locale) => [locale, knownPaths(locale)])) as Record<Locale, Set<string>>;

function assertStep(step: NextStep | null, locale: Locale, self: string, what: string) {
  assert.ok(step, `${what}: no box`);
  assert.ok(step.links.length >= 1 && step.links.length <= NEXT_STEP_MAX_LINKS, `${what}: ${step.links.length} links`);
  const paths = step.links.map((link) => pathOnly(link.href));
  assert.equal(new Set(paths).size, paths.length, `${what}: a link twice`);
  for (const link of step.links) {
    const path = pathOnly(link.href);
    assert.ok(path.startsWith(`/${locale}/`) && path.endsWith("/"), `${what}: ${link.href} is not a ${locale} page path`);
    assert.ok(KNOWN[locale].has(path), `${what}: ${link.href} is not a page the site builds`);
    assert.notEqual(path, pathOnly(self), `${what}: links itself`);
    assert.ok(link.label.trim().length >= 8 && !/^(aquí|here|click|clic|más|more|leer)/i.test(link.label), `${what}: anchor "${link.label}"`);
  }
}

/* ------------------------------------------------------------ Content --- */

const FAMILY_KEYS: readonly B2Key[] = [...CATALONIA_STRIKE_KEYS, ...SPAIN_STRIKE_KEYS, ...ELECTION_KEYS, ...HOLIDAY_KEYS, ...CHRISTMAS_KEYS, ...BARCELONA_KEYS];

test("every content page of the six families gets a box in ca, es and en, with registry paths and no self-link", () => {
  for (const key of FAMILY_KEYS) {
    for (const locale of LOCALES) {
      const href = b2href(key, locale);
      assert.equal(b2KeyForHref(href), key);
      assertStep(entryNextStep({ href, key: null, locale }, TODAY), locale, href, `${key}/${locale}`);
    }
  }
  // Pages outside the families keep their layout.
  assert.equal(entryNextStep({ href: b2href("museums", "es"), key: null, locale: "es" }, TODAY), null);
  assert.equal(entryNextStep({ href: "/es/guias/no-existe/", key: null, locale: "es" }, TODAY), null);
});

test("strikes: Catalonia gets Rodalies live and the next strike days; the 11N city and Spain pages get the Spain days and calendar, never Rodalies", () => {
  for (const locale of LOCALES) {
    const cat = strikeNextStep("catalonia", locale, b2href("strikes", locale), "2026-11-18", "2026-11-18")!;
    assert.deepEqual(
      cat.links.map((l) => pathOnly(l.href)),
      [rodaliesHubPath(locale), b2href("strike19n", locale), b2href("strike20n", locale)],
    );
    assert.equal(cat.links[0]!.label, rodaliesHubMeta(locale).title);
    assert.equal(cat.links[1]!.label, B2_TITLES.strike19n[locale]);

    for (const ref of STRIKE_11N_CITY_REFS) {
      const href = strike11nCityHref(ref.key, locale);
      const step = entryNextStep({ href, key: `${STRIKE_11N_SPAIN_KEY_PREFIX}${ref.key}`, locale }, TODAY);
      assertStep(step, locale, href, `11N ${ref.key}/${locale}`);
      assert.ok(!step!.links.some((l) => l.href === rodaliesHubPath(locale)), `${ref.key}: Rodalies on a page for the rest of Spain`);
      assert.equal(step!.links.at(-1)!.href, b2href("strikesSpain", locale));
    }
  }
});

test("strikes: no dated link points to a day already past, and the hubs stand in once none is ahead", () => {
  const dateOf = (key: B2Key, asOf: string) => (key === "strike19n" || key === "strike20n" ? STRIKE_DAY[key] : nextStrikePages("catalonia", asOf, asOf).find((p) => p.key === key)?.date);
  for (let day = 18; day <= 30; day += 1) {
    const asOf = `2026-11-${String(day).padStart(2, "0")}`;
    for (const scope of ["catalonia", "spain"] as const) {
      for (const page of nextStrikePages(scope, asOf, asOf)) assert.ok(page.date >= asOf, `${scope} ${asOf}: ${page.key} on ${page.date}`);
      const step = strikeNextStep(scope, "es", scope === "catalonia" ? b2href("strike11n", "es") : b2href("railStrike17n", "es"), asOf, asOf)!;
      assertStep(step, "es", "/es/", `${scope} ${asOf}`);
      for (const link of step.links) {
        const key = b2KeyForHref(link.href);
        const date = key ? dateOf(key, asOf) : undefined;
        if (date) assert.ok(date >= asOf, `${scope} ${asOf}: links ${key}, past on ${date}`);
      }
    }
  }
  // After the last dated page: Catalonia keeps Rodalies and the two hubs; Spain the calendar.
  assert.deepEqual(
    strikeNextStep("catalonia", "ca", b2href("strike11n", "ca"), "2026-12-15", "2026-12-15")!.links.map((l) => l.href),
    [rodaliesHubPath("ca"), b2href("strikes", "ca"), b2href("strikesSpain", "ca")],
  );
  assert.deepEqual(strikeNextStep("spain", "en", b2href("railStrike17n", "en"), "2026-12-15", "2026-12-15")!.links.map((l) => l.href), [b2href("strikesSpain", "en")]);
});

test("strikes: a strike page whose title has no day says the day under the link", () => {
  const renfe = nextStrikePages("catalonia", "2026-11-21", "2026-11-21").find((p) => p.key === "strikeRenfe");
  if (!renfe) return; // the 23N call is gone from strikes.ts: nothing to check
  const step = strikeNextStep("catalonia", "es", b2href("strikes", "es"), "2026-11-21", "2026-11-21")!;
  const link = step.links.find((l) => l.href === b2href("strikeRenfe", "es"))!;
  assert.equal(link.label, B2_TITLES.strikeRenfe.es);
  assert.match(link.note ?? "", /^Lunes 23 de noviembre$/);
  // The 19N/20N titles carry their day: no note.
  const early = strikeNextStep("catalonia", "es", b2href("strikes", "es"), "2026-11-18", "2026-11-18")!;
  assert.ok(early.links.every((l) => !l.note));
});

test("strikes: the box reads the same as-of switch as the strike pages (no clock)", () => {
  const src = read("src/lib/engagement/next-step.ts");
  assert.doesNotMatch(src.split("Elections (29 November 2026)")[0]!, /new Date|Date\.now|todayInCatalonia/);
  assert.ok(nextStrikePages("catalonia").every((p) => p.date >= STRIKES_AS_OF));
});

test("elections: postal vote while it can be requested, then where to vote, then results night", () => {
  for (const locale of LOCALES) {
    const candidates = b2href("candidates", locale);
    const open = electionNextStep(locale, candidates, POSTAL_29N.requestBy)!;
    assert.deepEqual(open.links.map((l) => pathOnly(l.href)), [b2href("postalVote", locale), b2href("voting", locale)]);
    const closed = electionNextStep(locale, candidates, "2026-11-20")!;
    assert.ok(!closed.links.some((l) => l.href === b2href("postalVote", locale)), `${locale}: postal vote after 19 Nov`);
    assert.equal(closed.links[0]!.href, `${b2href("voting", locale)}#${VOTING_WHERE[locale].id}`);
    const after = electionNextStep(locale, candidates, "2026-11-30")!;
    assert.deepEqual(after.links.map((l) => l.href), [b2href("electionNight", locale)]);
    // On the how-to-vote guide itself the next in line fills in.
    const onVoting = electionNextStep(locale, b2href("voting", locale), TODAY)!;
    assert.deepEqual(onVoting.links.map((l) => l.href), [b2href("postalVote", locale), b2href("electionNight", locale)]);
    // Town pages list their polling places already.
    assert.deepEqual(electionTownNextStep(locale, `/${locale}/x/`, TODAY)!.links.map((l) => l.href), [b2href("postalVote", locale), b2href("electionNight", locale)]);
    assert.deepEqual(electionTownNextStep(locale, `/${locale}/x/`, "2026-11-20")!.links.map((l) => l.href), [b2href("electionNight", locale)]);
  }
});

test("elections: the 'where do I vote' anchor is the how-to-vote guide's own heading and id", () => {
  for (const locale of LOCALES) {
    const headings = (VOTING.editions[locale].blocks as Block[]).filter((b): b is Extract<Block, { type: "heading" }> => b.type === "heading");
    const match = headings.find((h) => h.text === VOTING_WHERE[locale].label);
    assert.ok(match, `${locale}: no heading "${VOTING_WHERE[locale].label}" in the guide`);
    assert.equal(headingId(match), VOTING_WHERE[locale].id, locale);
  }
});

test("holidays: guides and date pages hand on to the December bridge while it is ahead and to the 2027 planner", () => {
  for (const locale of LOCALES) {
    const bridge = b2href("decemberBridge", locale);
    for (const key of HOLIDAY_KEYS) {
      const step = entryNextStep({ href: b2href(key, locale), key: null, locale }, TODAY)!;
      assert.ok(step.links.some((l) => l.href === leavePath(locale)), `${key}/${locale}: no leave planner`);
      const later = entryNextStep({ href: b2href(key, locale), key: null, locale }, "2026-12-09")!;
      assert.ok(!later.links.some((l) => l.href === bridge || l.href === b2href("decemberBridgeSpain", locale)), `${key}/${locale}: December bridge after 8 Dec`);
    }
    const day = holidayDateNextStep("2026-12-07", locale, `/${locale}/x/`, TODAY)!;
    assert.deepEqual(day.links.map((l) => l.href), [bridge, leavePath(locale)]);
    const day2027 = holidayDateNextStep("2027-04-02", locale, `/${locale}/x/`, TODAY)!;
    assert.deepEqual(day2027.links.map((l) => l.href), [b2href("bridges2027", locale), leavePath(locale)]);
  }
});

test("holidays: a town page gets the planner with the town picked, then its Christmas fair, else working days", () => {
  const withFair = towns().find((town) => town.fairs.some((f) => f.end >= TODAY))!;
  const step = townNextStep(withFair.slug, withFair.name, "ca", `/ca/festius/${withFair.slug}/`, TODAY)!;
  assertStep(step, "ca", `/ca/festius/${withFair.slug}/`, `town ${withFair.slug}`);
  assert.equal(step.links[0]!.href, `${leavePath("ca")}#p=${withFair.slug}`);
  assert.equal(step.links[1]!.href, townTranslations(withFair).ca);
  // After the season: working days instead.
  const late = townNextStep(withFair.slug, withFair.name, "es", `/es/festivos/${withFair.slug}/`, "2027-02-01")!;
  assert.match(late.links[1]!.href, /\/es\/calculadoras\/dias-habiles\/#p=/);

  const fairSlugs = new Set(towns().map((t) => t.slug));
  const without = municipalities().find((m) => !fairSlugs.has(m.slug))!;
  for (const locale of LOCALES) {
    const s = townNextStep(without.slug, without.name, locale, `/${locale}/x/`, TODAY)!;
    assert.equal(s.links.length, 2);
    assert.equal(pathOnly(s.links[1]!.href), calcPath("working-days", locale));
  }
  // English: a fair page only for the towns that have an English one.
  for (const town of towns()) {
    const en = townNextStep(town.slug, town.name, "en", `/en/holidays/${town.slug}/`, TODAY)!;
    for (const link of en.links) assert.ok(KNOWN.en.has(pathOnly(link.href)), `${town.slug}: ${link.href}`);
  }
});

test("Christmas fairs: the lights and the December holidays; Barcelona's December agenda; nothing after the season", () => {
  for (const locale of LOCALES) {
    assertStep(christmasNextStep(locale, fairsHubPath(locale), TODAY), locale, fairsHubPath(locale), `fairs hub ${locale}`);
    const bcn = christmasNextStep(locale, `/${locale}/x/`, TODAY, { barcelona: true })!;
    assert.equal(bcn.links[0]!.href, b2href("barcelonaDecember", locale));
    assert.equal(christmasNextStep(locale, `/${locale}/x/`, "2027-01-08"), null);
  }
});

test("calculators: every tool gets one or two related tools in its own language, never itself", () => {
  for (const id of [...CALCULATOR_IDS, "leave-2027"] as const) {
    for (const locale of LOCALES) {
      const self = id === "leave-2027" ? leavePath(locale) : calcPath(id, locale);
      const step = calculatorNextStep(id, locale, self);
      assertStep(step, locale, self, `${id}/${locale}`);
      assert.ok(step!.links.length <= 2, `${id}: ${step!.links.length}`);
    }
  }
  for (const [id, next] of Object.entries(CALCULATOR_NEXT)) {
    for (const key of next ?? []) assert.ok(hubCards().some((card) => card.key === key), `${id} → ${key}: no hub card`);
  }
});

/* ---------------------------------------------------------- Placement --- */

test("the box goes after the key facts, else after the lead, else at the first section", () => {
  const lead = { type: "paragraph", lead: true, text: "x" };
  const facts = { type: "keyFacts", items: [] };
  const h2 = { type: "heading", level: 2, text: "x" };
  const p = { type: "paragraph", text: "x" };
  assert.equal(nextStepIndex([lead, { type: "languageLinks" }, facts, p, h2, p]), 3);
  assert.equal(nextStepIndex([lead, p, h2, facts]), 1);
  assert.equal(nextStepIndex([p, p, h2, p]), 2);
  assert.equal(nextStepIndex([p]), 1);
});

test("templates render the box server-side, after the answer, with the placement the click listener reads", () => {
  const box = read("src/components/NextStep.tsx");
  assert.doesNotMatch(box, /"use client"/);
  assert.match(box, /data-ci-placement="next_step"/);
  assert.match(box, /<nav\s+aria-labelledby="ci-next-step-title"/);
  for (const locale of LOCALES) assert.ok(NEXT_STEP_TITLE[locale].length > 0);

  const article = read("src/components/pages/EntryArticle.tsx");
  assert.match(article, /<SummaryBox[^>]*\/>\s*\{nextStepInSummary \? <NextStep/);
  assert.match(article, /<BlockRenderer body=\{body\} context=\{context\} insert=\{bodyInsert\} \/>/);
  for (const [file, re] of [
    // Right after the first screen (answer, table, lead: holidays/first-screen.ts, 19 Nov 2026), before #avui.
    ["src/components/programmatic/holidays/MunicipalityPage.tsx", /\{firstScreenOrder\(locale\)\.map\([^]*?\{t\.lead\} \{t\.source\}\s*<\/p>\s*\),\s*\)\}\s*\{\/\*[^*]*\*\/\}\s*<NextStep step=\{townNextStep\([^]*?<h2 id="avui">/],
    ["src/components/programmatic/holidays/EnglishTownPage.tsx", /<NextStep step=\{townNextStep\(/],
    ["src/components/programmatic/holidays/DatePage.tsx", /<NextStep step=\{holidayDateNextStep\([^]*?<h2 id="local">/],
    ["src/components/programmatic/ElectionResultsPage.tsx", /<NextStep step=\{electionTownNextStep\(/],
    ["src/components/programmatic/christmas-fairs/TownPage.tsx", /<NextStep\s+step=\{christmasNextStep\([^]*?<h2 id="com-arribar">/],
    ["src/components/programmatic/christmas-fairs/HubPage.tsx", /<FairStatus[^>]*\/>\s*\{\/\*[^*]*\*\/\}\s*<NextStep step=\{christmasNextStep\(/],
  ] as const) {
    assert.match(read(file), re, file);
  }
  // Every calculator page: the box under its tool, before "Más calculadoras".
  const calcPages = [
    "net-salary/NetSalaryPage", "extra-pay/ExtraPayPage", "self-employed/SelfEmployedPage", "employment/DismissalPage", "employment/SettlementPage",
    "employment/UnemploymentPage", "unemployment-subsidy/SubsidyPage", "sick-leave/SickLeavePage", "paid-leave/PaidLeavePage", "rent-update/RentPage",
    "euribor/EuriborPage", "mortgage/MortgagePage", "home-purchase-tax/HomeTaxPage", "inheritance-tax/InheritanceTaxPage", "pensions-2027/PensionPage", "retirement-age/RetirementAgePage", "widow-pension/WidowPensionPage", "working-days/WorkingDaysPage",
    "smi/SmiPage", "iprem/IpremPage", "ipc/IpcPage", "treasury-bills/LetrasPage", "lottery-tax/LotteryTaxPage", "itv/ItvPage", "traffic-fines/TrafficFinesPage", "bono-social/BonoSocialPage", "average-salary/AverageSalaryPage", "zona-tensionada/ZonaTensionadaPage", "leave-2027/LeavePage",
  ];
  assert.equal(calcPages.length, CALCULATOR_IDS.length + 1);
  for (const page of calcPages) {
    const src = read(`src/components/programmatic/${page}.tsx`);
    assert.equal((src.match(/<CalculatorNextStep current="/g) ?? []).length, 1, page);
  }
});

/* ---------------------------------------------------------- Analytics --- */

test("a click in the box is related_content_click with link_context next_step and the target path only", () => {
  const base = { siteHost: "www.catalunyainfo.com", locale: "es", channelUrl: "https://whatsapp.com/channel/x", inSources: false, inCalculator: false };
  assert.deepEqual(
    classifyLinkClick({ ...base, href: "https://www.catalunyainfo.com/es/festivos/2027/aprovechar-vacaciones/?utm=x#p=sabadell", placement: "next_step" }),
    { name: "related_content_click", params: { link_context: "next_step", link_url: "/es/festivos/2027/aprovechar-vacaciones/", locale: "es" } },
  );
  // Internal links elsewhere stay unmeasured; an unknown placement is not reported.
  assert.equal(classifyLinkClick({ ...base, href: "https://www.catalunyainfo.com/es/rodalies/" }), null);
  assert.equal(classifyLinkClick({ ...base, href: "https://www.catalunyainfo.com/es/rodalies/", placement: "<x>" }), null);
  // An outbound link is never reported as internal, whatever box it sits in.
  assert.notEqual(classifyLinkClick({ ...base, href: "https://example.org/a", placement: "next_step" })?.name, "related_content_click");
});
