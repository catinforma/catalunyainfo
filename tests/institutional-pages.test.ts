import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import { PAGES } from "../src/lib/content/pages/publish.ts";
import { OPERATOR } from "../src/lib/content/pages/operator.ts";
import { LEGAL_KEYS, LEGAL_SEGMENTS, SECTION_SEGMENTS } from "../src/lib/i18n/routes.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { SITE } from "../src/lib/site.ts";

/**
 * The institutional pages were the site's worst defect: the footer linked to
 * them, the sitemap listed all thirty, and every one returned 404. These tests
 * exist so that can never silently come back - the set of pages here has to
 * cover exactly the set of URLs the route map and the sitemap advertise.
 */

const EXPECTED_PATHS = LOCALES.flatMap((locale) => [
  SECTION_SEGMENTS.legal[locale],
  ...LEGAL_KEYS.map((key) => `${SECTION_SEGMENTS.legal[locale]}/${LEGAL_SEGMENTS[key][locale]}`),
  SECTION_SEGMENTS.about[locale],
  SECTION_SEGMENTS.contact[locale],
]);

test("every URL the route map advertises has a page behind it", () => {
  const published = new Set(
    PAGES.flatMap((page) => LOCALES.map((locale) => page.path[locale])),
  );
  for (const path of EXPECTED_PATHS) {
    assert.ok(published.has(path), `no page publishes /${path}/ — it would 404 from the sitemap`);
  }
  // And nothing extra, which would be a page nothing links to. Compared as
  // sets: `legal` and `cookies` spell the same in all three languages.
  assert.deepEqual([...published].sort(), [...new Set(EXPECTED_PATHS)].sort());
});

test("every page is a valid body in all three languages", () => {
  for (const page of PAGES) {
    for (const locale of LOCALES) {
      const copy = page.copy[locale];
      assert.ok(copy, `${page.key}: missing ${locale}`);
      const parsed = bodySchema.safeParse(copy.blocks);
      assert.ok(
        parsed.success,
        `${page.key}/${locale}: ${JSON.stringify(parsed.error?.issues?.[0])}`,
      );
    }
  }
});

test("no page is a stub", () => {
  for (const page of PAGES) {
    for (const locale of LOCALES) {
      const words = wordCount(bodyToPlainText(page.copy[locale].blocks));
      // The legal hub is an index, and the contact page is mostly a form, so
      // both are allowed to be shorter. The rest are documents someone has to
      // be able to rely on.
      const floor =
        page.key === "page-legal-hub" ? 60 : page.key === "page-contact" ? 170 : 220;
      assert.ok(words >= floor, `${page.key}/${locale} is a stub: ${words} words`);
    }
  }
});

test("SEO fields are present and within the lengths Google renders", () => {
  for (const page of PAGES) {
    for (const locale of LOCALES) {
      const copy = page.copy[locale];
      assert.ok(copy.title.length > 3, `${page.key}/${locale}: no title`);
      assert.ok(copy.seoTitle.length <= 60, `${page.key}/${locale}: seoTitle too long`);
      assert.ok(
        copy.seoDescription.length >= 50 && copy.seoDescription.length <= 165,
        `${page.key}/${locale}: seoDescription is ${copy.seoDescription.length} chars`,
      );
      assert.ok(copy.excerpt.length > 20, `${page.key}/${locale}: no excerpt`);
    }
  }
});

test("the contact page carries the form, and no other page does", () => {
  for (const page of PAGES) {
    for (const locale of LOCALES) {
      const forms = page.copy[locale].blocks.filter((block) => block.type === "contactForm");
      const expected = page.key === "page-contact" ? 1 : 0;
      assert.equal(forms.length, expected, `${page.key}/${locale}: ${forms.length} forms`);
    }
  }
});

test("the published contact address is the real inbox, everywhere", () => {
  assert.equal(SITE.contactEmail, "catalunyatinforma@gmail.com");
  assert.equal(OPERATOR.email, SITE.contactEmail);

  // And no page may quote a different address than the one that is monitored.
  const addresses = new Set<string>();
  for (const page of PAGES) {
    for (const locale of LOCALES) {
      const text = JSON.stringify(page.copy[locale].blocks);
      for (const hit of text.match(/[\w.+-]+@[\w.-]+\.\w+/g) ?? []) addresses.add(hit);
    }
  }
  assert.deepEqual([...addresses].sort(), [SITE.contactEmail]);
});

test("the legal notice states nothing it does not know", () => {
  // OPERATOR fields that are empty must never reach the page as a placeholder:
  // an invented tax number is a false statement, an absent line is only a gap.
  const forbidden = /\bXXX+\b|\[pendent\]|\[pendiente\]|\[TBD\]|B00000000|00000000[A-Z]/i;
  for (const page of PAGES) {
    for (const locale of LOCALES) {
      assert.doesNotMatch(
        JSON.stringify(page.copy[locale].blocks),
        forbidden,
        `${page.key}/${locale} carries a placeholder identity`,
      );
    }
  }
});

test("internal links are locale-correct and absolute", () => {
  const link = /\]\((\/[^)]*)\)/g;
  for (const page of PAGES) {
    for (const locale of LOCALES) {
      const text = JSON.stringify(page.copy[locale].blocks);
      for (const match of text.matchAll(link)) {
        const href = match[1] ?? "";
        assert.match(href, /^\/(ca|es|en)\//, `${page.key}/${locale}: ${href} has no locale`);
        assert.ok(
          href.startsWith(`/${locale}/`),
          `${page.key}/${locale} links into another language: ${href}`,
        );
        assert.ok(href.endsWith("/"), `${page.key}/${locale}: ${href} has no trailing slash`);
      }
    }
  }
});

test("the cookie policy describes exactly the cookies the site sets", async () => {
  const { COOKIES } = await import("../src/lib/content/pages/operator.ts");
  const { CONSENT_COOKIE } = await import("../src/lib/analytics/consent.ts");

  const named = COOKIES.map((cookie) => cookie.name);
  assert.ok(named.includes(CONSENT_COOKIE), "the consent cookie itself is undocumented");
  assert.ok(named.includes("ci_locale"), "the locale cookie is undocumented");
  assert.ok(named.includes("ci_session"), "the admin session cookie is undocumented");

  const page = PAGES.find((p) => p.key === "page-cookies");
  assert.ok(page);
  for (const locale of LOCALES) {
    // Against the raw blocks, not the plain text: `bodyToPlainText` strips
    // underscores along with the inline markup, so `ci_consent` would not
    // survive it.
    const text = JSON.stringify(page.copy[locale].blocks);
    for (const name of named) {
      assert.ok(text.includes(name), `${locale} cookie policy does not list ${name}`);
    }
  }
});
