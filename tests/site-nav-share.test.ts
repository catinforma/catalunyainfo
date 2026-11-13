import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { COPY as SCHOOL_COPY } from "../src/lib/content/school/publish.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { sectionPath } from "../src/lib/i18n/routes.ts";
import {
  MENU_LABELS,
  MENU_PATHS,
  MORE_ORDER,
  PRIMARY_ORDER,
  moreItems,
  primaryItems,
  type MenuKey,
} from "../src/lib/nav/menu.ts";
import { calculatorsHubPath } from "../src/lib/programmatic/calculators/paths.ts";
import { hubPath as electionsHubPath } from "../src/lib/programmatic/elections/paths.ts";
import { hubPath as holidaysHubPath } from "../src/lib/programmatic/holidays/paths.ts";
import { hubEditions } from "../src/lib/programmatic/spain-2027/editions.ts";
import { ANALYTICS_EVENTS } from "../src/lib/analytics/events.ts";
import { isLowDemandPath } from "../src/lib/seo/low-demand.ts";
import { SHARE_CHANNELS, SHARE_COPY, canonicalUrl, sharedUrl, shareLinks, type ShareChannel, type ShareLink } from "../src/lib/share/links.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

/* ------------------------------------------------------------------ Menu --- */

// The menu's paths are hand-written; the modules that publish each page own the slugs.
const OWNER: Record<MenuKey, (l: Locale) => string> = {
  strikes: (l) => `/${l}/${B2_PATHS.strikes[l]}/`,
  holidays: (l) => `/${l}/${B2_PATHS.workCalendar[l]}/`,
  elections: (l) => electionsHubPath(l),
  calculators: (l) => calculatorsHubPath(l),
  school: (l) => `/${l}/${SCHOOL_COPY[l].path}/`,
  localHolidays: (l) => holidaysHubPath(l),
  spain2027: (l) => hubEditions()[l],
  contact: (l) => sectionPath("contact", l),
};

// Programmatic hubs are routes of their own: the page file must exist.
const ROUTE_FILE: Partial<Record<MenuKey, Record<Locale, string>>> = {
  elections: { ca: "eleccions/page.tsx", es: "elecciones/page.tsx", en: "elections/page.tsx" },
  calculators: { ca: "calculadores/page.tsx", es: "calculadoras/page.tsx", en: "calculators/page.tsx" },
  localHolidays: { ca: "festius/page.tsx", es: "festivos/page.tsx", en: "holidays/page.tsx" },
  spain2027: { ca: "festius/2027/page.tsx", es: "festivos/2027/page.tsx", en: "holidays/2027/page.tsx" },
};

test("every menu entry links to the path its publisher uses, in every language", () => {
  for (const key of Object.keys(MENU_PATHS) as MenuKey[]) {
    for (const locale of LOCALES) {
      assert.equal(MENU_PATHS[key][locale], OWNER[key](locale), `${key} (${locale})`);
      assert.ok(MENU_PATHS[key][locale].startsWith(`/${locale}/`), `${key} (${locale}) is in its own language`);
      const route = ROUTE_FILE[key]?.[locale];
      if (route) assert.ok(existsSync(join(ROOT, "src/app/(public)/[locale]", route)), `${key} (${locale}): ${route}`);
    }
  }
});

test("the menu links indexable pages only, and never aerobusbcn.com", () => {
  for (const locale of LOCALES) {
    for (const item of [...primaryItems(locale), ...moreItems(locale)]) {
      assert.ok(!isLowDemandPath(item.href), `${item.href} is on the low-demand (noindex) list`);
      assert.ok(!item.href.includes("aerobusbcn"), item.href);
      assert.ok(item.label.trim().length > 0, `${item.key} (${locale}) has a label`);
    }
  }
});

test("each edition lists every menu entry exactly once", () => {
  const all = (Object.keys(MENU_PATHS) as MenuKey[]).sort();
  for (const locale of LOCALES) {
    const keys = [...PRIMARY_ORDER[locale], ...MORE_ORDER];
    assert.equal(new Set(keys).size, keys.length, `${locale}: duplicate entry`);
    assert.deepEqual([...keys].sort(), all, locale);
    for (const key of keys) assert.ok(MENU_LABELS[key][locale], `${key} (${locale})`);
  }
});

/* ---------------------------------------------------------------- Header --- */

const HEADER = read("src/components/SiteHeader.tsx");
const DISCLOSURE = read("src/components/nav/MenuDisclosure.tsx");

test("the phone menu is a disclosure with aria-controls, aria-expanded and Escape", () => {
  // The summary names its panel, and the panel carries that id.
  assert.match(DISCLOSURE, /<summary[^>]*aria-controls=\{panelId\}/);
  assert.match(DISCLOSURE, /<div id=\{panelId\}/);
  // aria-expanded is mirrored from the element's real state once hydrated…
  assert.match(DISCLOSURE, /setAttribute\("aria-expanded", details\.open \? "true" : "false"\)/);
  // …and never hard-coded in the server HTML, where it could not follow a no-JS toggle.
  assert.doesNotMatch(DISCLOSURE, /aria-expanded=\{/);
  assert.match(DISCLOSURE, /event\.key === "Escape"/);
  assert.match(DISCLOSURE, /button\.focus\(\)/, "Escape returns focus to the button");
  assert.match(DISCLOSURE, /closest\("a\[href\]"\)/, "following a link closes the menu");
  // The hamburger exists below lg only; the visible bar from lg up.
  assert.match(HEADER, /panelId="ci-menu-panel"[\s\S]*?className="ci-menu lg:hidden"/);
  assert.match(HEADER, /className="ml-auto hidden items-center gap-5 lg:flex"/);
  // The button's accessible name, in each language.
  assert.match(HEADER, /<span className="ci-visually-hidden">\{MENU_BUTTON_LABEL\[locale\]\}<\/span>/);
});

test("the header keeps its landmarks: two menu navs, no headings", () => {
  assert.equal(HEADER.match(/<nav aria-label=\{t\.common\.menu\}/g)?.length, 2);
  assert.doesNotMatch(HEADER, /<h[1-6]/);
  assert.match(HEADER, /<header className="ci-header">/);
});

test("menu and share controls are 44px tap targets", () => {
  const css = read("src/app/globals.css");
  const rule = (sel: string) => css.match(new RegExp(`\\${sel} \\{([^}]*)\\}`))?.[1] ?? "";
  assert.match(rule(".ci-menu-button"), /width: 2\.75rem;[\s\S]*height: 2\.75rem;/);
  assert.match(rule(".ci-share-btn"), /min-width: 2\.75rem;[\s\S]*height: 2\.75rem;/);
  assert.match(rule(".ci-menu-list a"), /min-height: 2\.75rem;/);
  // The bar reserves its height, so the native button replacing the icons shifts nothing.
  assert.match(rule(".ci-share"), /min-height: 2\.75rem;/);
  assert.match(rule(".ci-share"), /flex-wrap: nowrap;/);
});

/* ----------------------------------------------------------------- Share --- */

const PATH = "/es/guias/huelga-hoy-cataluna/";
const TITLE = "Huelga hoy y mañana en Cataluña: qué funciona & calendario";

test("canonical and shared URLs: www host, clean canonical, utm_source=share + utm_medium", () => {
  assert.equal(canonicalUrl(PATH), "https://www.catalunyainfo.com/es/guias/huelga-hoy-cataluna/");
  assert.equal(canonicalUrl("/es/guias/x?utm_source=a#top"), "https://www.catalunyainfo.com/es/guias/x/");
  for (const method of [...SHARE_CHANNELS, "copy", "native"] as const) {
    const url = new URL(sharedUrl(PATH, method));
    assert.equal(url.origin, "https://www.catalunyainfo.com");
    assert.equal(url.pathname, PATH);
    assert.equal(url.searchParams.get("utm_source"), "share");
    assert.equal(url.searchParams.get("utm_medium"), method);
    assert.equal([...url.searchParams.keys()].length, 2);
  }
});

test("share links are well-formed for every channel and language", () => {
  for (const locale of LOCALES) {
    const links = shareLinks(PATH, TITLE, locale);
    assert.deepEqual(links.map((l) => l.channel), [...SHARE_CHANNELS]);
    const by = Object.fromEntries(links.map((l) => [l.channel, l])) as Record<ShareChannel, ShareLink>;
    const expected = (m: string) => sharedUrl(PATH, m as never);

    const wa = new URL(by.whatsapp.href);
    assert.equal(wa.origin + wa.pathname, "https://wa.me/");
    assert.equal(wa.searchParams.get("text"), `${TITLE} ${expected("whatsapp")}`);

    const tg = new URL(by.telegram.href);
    assert.equal(tg.origin + tg.pathname, "https://t.me/share/url");
    assert.equal(tg.searchParams.get("url"), expected("telegram"));
    assert.equal(tg.searchParams.get("text"), TITLE);

    const x = new URL(by.x.href);
    assert.equal(x.origin + x.pathname, "https://x.com/intent/post");
    assert.equal(x.searchParams.get("url"), expected("x"));
    assert.equal(x.searchParams.get("text"), TITLE);

    const fb = new URL(by.facebook.href);
    assert.equal(fb.origin + fb.pathname, "https://www.facebook.com/sharer/sharer.php");
    assert.equal(fb.searchParams.get("u"), expected("facebook"));

    assert.ok(by.email.href.startsWith("mailto:?subject="), by.email.href);
    const mail = new URLSearchParams(by.email.href.slice("mailto:?".length));
    assert.equal(mail.get("subject"), TITLE);
    assert.equal(mail.get("body"), `${TITLE}\n\n${expected("email")}`);
    // `&` in the title must not break the query string.
    assert.doesNotMatch(by.email.href, /&calendario/);

    // Every icon link has its own accessible name in this language.
    const labels = links.map((l) => l.label);
    assert.equal(new Set(labels).size, labels.length, locale);
    for (const label of labels) assert.ok(label.length > 3, `${locale}: ${label}`);
    const copy = SHARE_COPY[locale];
    for (const value of Object.values(copy)) assert.ok(value.trim(), locale);
  }
  assert.equal(SHARE_COPY.ca.copyLink, "Copiar enllaç");
  assert.equal(SHARE_COPY.es.share, "Compartir");
  assert.equal(SHARE_COPY.en.share, "Share");
  // Instagram has no web share URL: it is offered through the native sheet only.
  assert.ok(!(SHARE_CHANNELS as readonly string[]).includes("instagram"));
});

test("the share event is part of the analytics contract and goes through track()", () => {
  assert.ok(ANALYTICS_EVENTS.includes("share"));
  const controls = read("src/components/share/ShareControls.tsx");
  assert.match(controls, /track\(\{ name: "share", params: \{ method, content_type: contentType, item_id: path, locale \} \}\)/);
  // track() is a no-op until ConsentGate has loaded gtag after consent: no other route to GA.
  assert.doesNotMatch(controls, /window\.gtag|gtag\(|dataLayer/);
});

test("no external script, iframe or SDK comes with the share bar or the menu", () => {
  const files = [
    "src/components/share/ShareBar.tsx",
    "src/components/share/ShareControls.tsx",
    "src/components/share/icons.tsx",
    "src/components/nav/MenuDisclosure.tsx",
    "src/components/SiteHeader.tsx",
    "src/lib/share/links.ts",
    "src/lib/nav/menu.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert.doesNotMatch(src, /<script|<Script|next\/script|<iframe|dangerouslySetInnerHTML|createElement\("script"\)/i, file);
  }
  // Share links open in a new tab without handing the opener to the network.
  assert.match(read("src/components/share/ShareControls.tsx"), /rel: "noopener noreferrer nofollow"/);
  // The CSP still allows scripts from the site and Google's tag only.
  assert.match(read("src/lib/security-headers.ts"), /`script-src 'self' 'unsafe-inline' https:\/\/www\.googletagmanager\.com\$\{/);
});

test("the share bar adds no heading, and skips pages kept out of the index", () => {
  for (const file of ["src/components/share/ShareBar.tsx", "src/components/share/ShareControls.tsx"]) {
    assert.doesNotMatch(read(file), /<h[1-6]/, file);
  }
  assert.match(read("src/components/share/ShareBar.tsx"), /if \(!path \|\| isLowDemandPath\(path\)\) return null;/);
  // Articles get it twice: under the meta line and at the end.
  const article = read("src/components/pages/EntryArticle.tsx");
  assert.equal(article.match(/<ShareBar /g)?.length, 2);
  assert.match(article, /<ShareBar[^>]*variant="full"/);
});
