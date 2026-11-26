import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { getMessages } from "../src/lib/i18n/index.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { notFoundLinks, notFoundLocale } from "../src/lib/i18n/not-found.ts";

/**
 * Guards for the design pass, round 2 (27 Nov 2026, docs/SEO_EXPERIMENTS.md):
 * the 404 page in the visitor's language with the site's header and footer,
 * 44 px language links, and the phone menu's backdrop and focus handling.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

/* ------------------------------------------------------------------ 404 --- */

test("the 404 speaks the language of its path, and falls back to Catalan", () => {
  // Before: /es/... and /en/... 404s were in Catalan.
  assert.equal(notFoundLocale("es"), "es");
  assert.equal(notFoundLocale("en"), "en");
  assert.equal(notFoundLocale("ca"), "ca");
  for (const odd of [undefined, null, "", "fr", "ES", 3, ["es"]]) assert.equal(notFoundLocale(odd), "ca");
});

test("the 404 copy exists, and differs, in every language", () => {
  const titles = new Set(LOCALES.map((l) => getMessages(l).notFound.title));
  const lists = new Set(LOCALES.map((l) => getMessages(l).notFound.linksTitle));
  assert.equal(titles.size, 3);
  assert.equal(lists.size, 3);
  assert.equal(getMessages("es").notFound.title, "Página no encontrada");
  assert.equal(getMessages("en").notFound.title, "Page not found");
});

test("the 404 links lead home, to guides, holidays and calculators, all in the visitor's edition", () => {
  for (const locale of LOCALES) {
    const links = notFoundLinks(locale);
    const keys = links.map((l) => l.key);
    for (const key of ["home", "guides", "holidays", "calculators"] as const) assert.ok(keys.includes(key), `${key} (${locale})`);
    assert.equal(links[0]?.href, `/${locale}/`);
    for (const link of links) {
      assert.ok(link.href.startsWith(`/${locale}/`), `${link.href} is in /${locale}/`);
      assert.ok(link.href.endsWith("/"), `${link.href} has the trailing slash`);
      assert.ok(link.label.length > 0);
    }
    assert.equal(new Set(links.map((l) => l.href)).size, links.length, "no duplicate link");
  }
  assert.equal(notFoundLinks("es").find((l) => l.key === "guides")?.href, "/es/guias/");
  assert.equal(notFoundLinks("en").find((l) => l.key === "guides")?.href, "/en/guides/");
  assert.equal(notFoundLinks("es").find((l) => l.key === "home")?.label, "Volver al inicio");
});

test("the 404 page is server-rendered with header, search, links and footer, and stays static", () => {
  const page = read("src/app/(public)/[locale]/not-found.tsx");
  assert.doesNotMatch(page, /^"use client"/m);
  assert.match(page, /from "next\/root-params"/);
  assert.match(page, /notFoundLocale\(await localeParam\(\)\)/);
  // No request-time API: the routes that call notFound() keep their static rendering.
  assert.doesNotMatch(page, /next\/headers|cookies\(|headers\(/);
  assert.doesNotMatch(page, /DEFAULT_LOCALE/);
  assert.match(page, /<SiteHeader locale=\{locale\} translations=\{\{\}\} \/>/);
  assert.match(page, /<SiteFooter locale=\{locale\} \/>/);
  assert.match(page, /<SearchBox locale=\{locale\}/);
  assert.match(page, /<main id="main"/);
  // Lost visitors should not trigger five RSC prefetches.
  assert.match(page, /prefetch=\{false\}/);
  assert.match(page, /min-h-11/);
});

/* ------------------------------------------------------ Language links --- */

test("language links are 44 px tall tap targets; the visible pill is unchanged", () => {
  // Before: the links were the 21 px pill itself (WCAG 2.5.8 asks for 24).
  // (.tsx cannot be imported by the test runner: the source is checked.)
  const src = read("src/components/LanguageSwitcher.tsx");
  assert.match(src, /const TARGET = "inline-flex min-h-11 items-center text-xs no-underline";/);
  assert.match(src, /current \? TARGET : \`\$\{TARGET\} text-/);
  // The pill keeps its old classes, now on an inner span.
  assert.match(src, /<span\s+className=\{\s*current\s*\? "rounded-xs bg-\[var\(--color-ink\)\] px-1\.5 py-0\.5 text-\[var\(--color-paper\)\]"\s*: "rounded-xs px-1\.5 py-0\.5"/);
  assert.match(src, /\{LOCALE_SHORT\[l\]\}\s*<\/span>/);
  // 44 px fits the header row exactly (min-h-14 = 56 px minus py-1.5 = 2 x 6 px),
  // the height of the menu button beside it: the header does not grow.
  const header = read("src/components/SiteHeader.tsx");
  assert.match(header, /<div className="ci-shell flex min-h-14 items-center gap-2 py-1\.5 sm:gap-4">/);
  assert.match(read("src/app/globals.css"), /\.ci-menu-button \{[^}]*height: 2\.75rem;/);
});

/* ----------------------------------------------------------- Phone menu --- */

test("the open phone menu dims the page with a tappable backdrop that moves nothing", () => {
  const css = read("src/app/globals.css");
  const rule = css.match(/\.ci-menu\[open\] > \.ci-menu-button::after \{([^}]*)\}/)?.[1] ?? "";
  assert.match(rule, /content: "";/);
  assert.match(rule, /position: absolute;/, "out of flow: no layout shift");
  assert.match(rule, /top: 100%;/, "below the header row: the header is not dimmed");
  assert.match(rule, /background: rgb\(12 22 28 \/ 0\.45\);/);
  // Only the phone menu: the desktop "More" summary is .ci-nav-link, not .ci-menu-button.
  assert.doesNotMatch(css, /\.ci-menu-more[^{]*::after/);
});

test("the phone menu traps Tab, Escape closes it and returns focus; the desktop dropdown does not trap", () => {
  const disclosure = read("src/components/nav/MenuDisclosure.tsx");
  assert.match(disclosure, /trapFocus && event\.key === "Tab" && details\.open/);
  assert.match(disclosure, /event\.shiftKey && active === button[\s\S]*?last\.focus\(\)/);
  assert.match(disclosure, /!event\.shiftKey && active === last[\s\S]*?button\.focus\(\)/);
  assert.match(disclosure, /event\.key === "Escape" && details\.open[\s\S]*?close\(true\)/);
  const header = read("src/components/SiteHeader.tsx");
  assert.equal(header.match(/\btrapFocus\b/g)?.length, 1);
  assert.match(header, /panelClassName="ci-menu-panel"\s*trapFocus/);
});
