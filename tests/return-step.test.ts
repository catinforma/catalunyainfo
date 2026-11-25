import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { classifyLinkClick, classifyReturnStepClick } from "../src/lib/analytics/clicks.ts";
import { ANALYTICS_EVENTS, RETURN_FAMILIES, RETURN_POSITIONS, RETURN_TARGETS, track } from "../src/lib/analytics/events.ts";
import { POSTAL_29N } from "../src/lib/content/batch02/postal-vote.ts";
import { B2_PATHS, b2href, type B2Key } from "../src/lib/content/batch02/shared.ts";
import { ELECTION_KEYS, CATALONIA_STRIKE_KEYS, SPAIN_STRIKE_KEYS, STRIKE_11N_SPAIN_KEY_PREFIX } from "../src/lib/engagement/next-step.ts";
import { RETURN_MAX_LINKS, returnStepForElectionHub, returnStepForElectionTown, returnStepForEntry, whatsappLabel } from "../src/lib/engagement/return-step.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { municipalityPath } from "../src/lib/programmatic/holidays/paths.ts";
import { sharedUrl, SHARE_CHANNELS } from "../src/lib/share/links.ts";
import { CHANNEL_UTM, channelUrl } from "../src/lib/share/channel-message.ts";
import { WHATSAPP_CHANNEL_URL } from "../src/lib/share/channel.ts";

/**
 * The "keep it" block of the strike and election pages (25 Nov 2026,
 * lib/engagement/return-step.ts): present on every template of both families,
 * built only from pages the site has, never the page itself, measured by
 * `next_step_click` with its position and target type, and the utm rules of
 * the links that bring readers back from WhatsApp.
 */

const read = (rel: string) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const TODAY = "2026-11-25";
const SITE = "www.catalunyainfo.com";

const knownPath = (locale: Locale) => new Set(Object.values(B2_PATHS).map((p) => `/${locale}/${p[locale]}/`));

function assertStep(step: ReturnType<typeof returnStepForEntry>, locale: Locale, self: string, what: string) {
  assert.ok(step, `${what}: no block`);
  assert.ok(step.links.length >= 1 && step.links.length <= RETURN_MAX_LINKS, `${what}: ${step.links.length} links`);
  assert.equal(step.whatsapp.href, WHATSAPP_CHANNEL_URL, what);
  assert.ok(step.whatsapp.label.length <= 30 && step.whatsapp.note.length <= 32, `${what}: button text wraps at 360 px`);
  for (const link of step.links) {
    assert.ok(RETURN_TARGETS.includes(link.target), `${what}: target ${link.target}`);
    assert.notEqual(link.href.split("#")[0], self, `${what}: links itself`);
    assert.ok(link.label.length > 0 && link.label.length <= 24, `${what}: label too long for one line at 360 px "${link.label}"`);
    if (link.target !== "town_calendar") assert.ok(knownPath(locale).has(link.href), `${what}: unknown path ${link.href}`);
    assert.ok(link.href.startsWith(`/${locale}/`), `${what}: ${link.href} is not in ${locale}`);
  }
  assert.equal(new Set(step.links.map((l) => l.href)).size, step.links.length, `${what}: repeated link`);
}

test("every strike and election guide gets the block, in all three languages, with the channel button first", () => {
  const keys: B2Key[] = [...CATALONIA_STRIKE_KEYS, ...SPAIN_STRIKE_KEYS, ...ELECTION_KEYS];
  for (const locale of LOCALES) {
    for (const key of keys) {
      const self = b2href(key, locale);
      const step = returnStepForEntry({ href: self, key: null, locale }, TODAY);
      assertStep(step, locale, self, `${locale} ${key}`);
      assert.equal(step!.family, CATALONIA_STRIKE_KEYS.includes(key) || SPAIN_STRIKE_KEYS.includes(key) ? "strikes" : "elections", key);
      assert.equal(step!.position, "after_answer");
    }
    // The 11N Spain and city pages are told by entry key.
    const self = `/${locale}/x/`;
    const city = returnStepForEntry({ href: self, key: `${STRIKE_11N_SPAIN_KEY_PREFIX}sevilla`, locale }, TODAY);
    assertStep(city, locale, self, `${locale} 11N city`);
    assert.equal(city!.family, "strikes");
  }
});

test("the strike pages offer 'is today a holiday?' and the strikes hub; the hub itself offers the Spain calendar instead of itself", () => {
  for (const locale of LOCALES) {
    const page = returnStepForEntry({ href: b2href("strike26n", locale), key: null, locale }, TODAY)!;
    assert.deepEqual(page.links.map((l) => l.target), ["strikes_spain_hub", "spain_holidays"]);
    const education = returnStepForEntry({ href: b2href("strikeEducation", locale), key: null, locale }, TODAY)!;
    assert.deepEqual(education.links.map((l) => l.target), ["holiday_today", "strikes_hub"]);
    assert.equal(education.links[0]!.href, b2href("holidayToday", locale));
    const hub = returnStepForEntry({ href: b2href("strikes", locale), key: null, locale }, TODAY)!;
    assert.deepEqual(hub.links.map((l) => l.target), ["holiday_today", "strikes_spain_hub"]);
    // Once the December long weekend is past the Spain pages offer the Catalonia hub next to the Spain calendar.
    const later = returnStepForEntry({ href: b2href("strike26n", locale), key: null, locale }, "2026-12-09")!;
    assert.deepEqual(later.links.map((l) => l.target), ["strikes_spain_hub", "strikes_hub"]);
  }
});

test("pages of other families get no block", () => {
  for (const key of ["shops", "christmas", "transport"] as B2Key[]) {
    assert.equal(returnStepForEntry({ href: b2href(key, "ca"), key: null, locale: "ca" }, TODAY), null, key);
  }
});

test("an election town page offers the town's own calendar first, then 'is today a holiday?'", () => {
  for (const locale of ["ca", "es"] as const) {
    const step = returnStepForElectionTown("granollers", locale, `/${locale}/eleccions/granollers/`, TODAY);
    assertStep(step, locale, `/${locale}/eleccions/granollers/`, `${locale} Granollers`);
    assert.equal(step.links[0]!.target, "town_calendar");
    assert.equal(step.links[0]!.href, `${municipalityPath(locale, "granollers")}#afegeix-calendari`);
    assert.equal(step.links[1]!.target, "holiday_today");
  }
  // A slug the holiday snapshot does not know: no calendar link, the hub links stand in.
  const unknown = returnStepForElectionTown("no-such-town", "ca", "/ca/eleccions/no-such-town/", TODAY);
  assert.deepEqual(unknown.links.map((l) => l.target), ["holiday_today", "strikes_hub"]);
});

test("the English town page uses the English holiday page only for towns that have one", () => {
  const step = returnStepForElectionTown("barcelona", "en", "/en/elections/barcelona/", TODAY);
  assert.equal(step.links[0]!.target, "town_calendar");
  assert.equal(step.links[0]!.href, `${municipalityPath("en", "barcelona")}#afegeix-calendari`);
});

test("the election hub and the comarca pages put the block after their intro", () => {
  for (const locale of LOCALES) {
    const step = returnStepForElectionHub(locale, `/${locale}/x/`, TODAY);
    assertStep(step, locale, `/${locale}/x/`, `${locale} hub`);
    assert.equal(step.position, "after_intro");
    assert.equal(step.family, "elections");
  }
});

test("the WhatsApp button says what it is for, and says the channel is in Catalan outside Catalan", () => {
  for (const locale of LOCALES) {
    const strikes = returnStepForEntry({ href: b2href("strikes", locale), key: null, locale }, TODAY)!;
    assert.equal(strikes.whatsapp.label, whatsappLabel("strikes", locale, TODAY));
    assert.match(strikes.whatsapp.label, locale === "ca" ? /pròxima vaga/ : locale === "es" ? /próxima huelga/ : /next strike/);
    if (locale !== "ca") assert.match(strikes.whatsapp.note, locale === "es" ? /en catalán/ : /in Catalan/);
    assert.match(strikes.whatsapp.note, /WhatsApp/);
  }
  // Election pages: 29N until polling day, strikes and holidays after it.
  assert.match(whatsappLabel("elections", "ca", POSTAL_29N.election), /29N/);
  assert.doesNotMatch(whatsappLabel("elections", "ca", "2026-11-30"), /29N/);
});

/* ------------------------------------------------------- Measurement --- */

const click = (extra: Partial<Parameters<typeof classifyReturnStepClick>[0]>) =>
  classifyReturnStepClick({
    href: `https://${SITE}/ca/guies/es-festiu-avui-catalunya/`,
    siteHost: SITE,
    locale: "ca",
    placement: "return_step",
    position: "after_answer",
    family: "strikes",
    target: "holiday_today",
    ...extra,
  });

test("next_step_click is in the contract, with the block position, target type and family", () => {
  assert.ok(ANALYTICS_EVENTS.includes("next_step_click"));
  assert.deepEqual(click({}), {
    name: "next_step_click",
    params: { block_position: "after_answer", target_type: "holiday_today", step_family: "strikes", link_url: "/ca/guies/es-festiu-avui-catalunya/", locale: "ca" },
  });
  // A link with a query or hash sends the bare path.
  assert.equal((click({ href: `https://${SITE}/ca/festius/granollers/?x=1#afegeix-calendari`, target: "town_calendar" })?.params as { link_url?: string }).link_url, "/ca/festius/granollers/");
});

test("the channel link reports the target type without a path, and the channel's own event with link_context return_step", () => {
  const event = click({ href: WHATSAPP_CHANNEL_URL, target: "whatsapp_channel" });
  assert.deepEqual(event, { name: "next_step_click", params: { block_position: "after_answer", target_type: "whatsapp_channel", step_family: "strikes", locale: "ca" } });
  const channel = classifyLinkClick({
    href: WHATSAPP_CHANNEL_URL,
    siteHost: SITE,
    locale: "ca",
    channelUrl: WHATSAPP_CHANNEL_URL,
    inSources: false,
    inCalculator: false,
    placement: "return_step",
  });
  assert.deepEqual(channel, { name: "whatsapp_channel_click", params: { link_context: "return_step", locale: "ca" } });
});

test("values outside the closed lists, or another placement, send nothing", () => {
  assert.equal(click({ target: "<script>" }), null);
  assert.equal(click({ position: "top" }), null);
  assert.equal(click({ family: "calculators" }), null);
  assert.equal(click({ placement: "next_step" }), null);
  assert.equal(click({ placement: null }), null);
  assert.equal(click({ href: "not a url" }), null);
  for (const list of [RETURN_POSITIONS, RETURN_TARGETS, RETURN_FAMILIES]) for (const v of list) assert.match(v, /^[a-z][a-z_]*$/);
});

test("the event goes out through track() only with consent", () => {
  const event = click({})!;
  assert.equal(track(event), false);
});

test("the click listener reads the block's data attributes and sends both events", () => {
  const listener = read("src/components/AnalyticsClicks.tsx");
  assert.match(listener, /classifyReturnStepClick/);
  for (const attr of ["data-ci-position", "data-ci-family", "data-ci-target"]) assert.ok(listener.includes(attr), attr);
});

/* --------------------------------------------------- Templates present --- */

test("every strike and election template renders the block", () => {
  assert.match(read("src/components/pages/EntryArticle.tsx"), /<ReturnStep step=\{ret\}/);
  for (const file of ["ElectionResultsPage", "ElectionsHubPage", "ElectionsComarcaPage"]) {
    assert.match(read(`src/components/programmatic/${file}.tsx`), /<ReturnStep step=\{returnStepForElection/, file);
  }
  // The longer "next useful step" box did not go: it moved down on the pages that have the block.
  assert.match(read("src/components/pages/EntryArticle.tsx"), /\{ret \? <NextStep step=\{step\}/);
  assert.match(read("src/components/programmatic/ElectionResultsPage.tsx"), /<NextStep step=\{electionTownNextStep/);
});

test("the block is server-rendered: no client code, fixed layout, the channel link as it is", () => {
  const component = read("src/components/ReturnStep.tsx");
  assert.doesNotMatch(component, /use client|useState|useEffect/);
  assert.match(component, /data-ci-placement=\{RETURN_STEP_PLACEMENT\}/);
  assert.match(component, /data-ci-target="whatsapp_channel"/);
  assert.doesNotMatch(component, /utm_/);
  const css = read("src/app/globals.css");
  assert.match(css, /\.ci-return \{[^}]*max-width/);
  // Nothing in the block loads late or changes height after render.
  assert.doesNotMatch(css.slice(css.indexOf(".ci-return {"), css.indexOf("Town and city holiday pages: subscribe")), /animation|transition|@keyframes/);
});

/* ------------------------------------------------------------- utm ------ */

test("links that bring readers back from WhatsApp carry utm: the channel's posts (source whatsapp) and the share buttons (source share)", () => {
  // The button on the site leaves for whatsapp.com: nothing to tag. Visits come from the channel's own posts...
  assert.equal(CHANNEL_UTM, "utm_source=whatsapp&utm_medium=channel&utm_campaign=daily");
  for (const path of ["/ca/guies/vaga-avui-catalunya/", "/ca/cap-de-setmana/#x"]) {
    assert.match(channelUrl(path), /\?utm_source=whatsapp&utm_medium=channel&utm_campaign=daily/);
  }
  // ...and from the share bar, whose WhatsApp share arrives as source "share", medium "whatsapp" (not source "whatsapp").
  for (const channel of SHARE_CHANNELS) assert.match(sharedUrl("/ca/x/", channel), new RegExp(`\\?utm_source=share&utm_medium=${channel}$`));
});
