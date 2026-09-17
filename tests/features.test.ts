import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import { ARTICLE_PATHS, ARTICLE_TITLES } from "../src/lib/content/features/shared.ts";
import { TRAINS } from "../src/lib/content/features/trains.ts";
import { GAUDI } from "../src/lib/content/features/gaudi.ts";
import { MEDIEVAL } from "../src/lib/content/features/medieval.ts";
import { SITGES } from "../src/lib/content/features/sitges.ts";
import { FOODFAIRS } from "../src/lib/content/features/foodfairs.ts";
import { CASTANYADA } from "../src/lib/content/features/castanyada.ts";
import { MONTSERRAT } from "../src/lib/content/features/montserrat.ts";
import { TRAPS } from "../src/lib/content/features/traps.ts";
import { SURPRISING } from "../src/lib/content/features/surprising.ts";
import { RAINY } from "../src/lib/content/features/rainy.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * Ten feature guides in three languages.
 *
 * The test that matters most here is the internal-link one: thirty editions
 * cross-linking each other by hand is exactly where dead links come from, so
 * every href in every edition has to resolve to a path this repository
 * actually publishes, in the same language.
 */

const FEATURES = [
  TRAINS,
  GAUDI,
  MEDIEVAL,
  SITGES,
  FOODFAIRS,
  CASTANYADA,
  MONTSERRAT,
  TRAPS,
  SURPRISING,
  RAINY,
];

/** Every path the site publishes, including the three earlier articles. */
const PUBLISHED_HREFS = new Set(
  Object.values(ARTICLE_PATHS).flatMap((paths) =>
    LOCALES.map((locale) => `/${locale}/${paths[locale]}/`),
  ),
);

test("there are ten features, thirty editions, thirty distinct paths", () => {
  assert.equal(FEATURES.length, 10);

  // Uniqueness is per (locale, path), which is what the URL index enforces:
  // `agenda/festival-sitges-guia` is deliberately the same string in ca and es,
  // because the segment and the slug both spell the same in those languages.
  const pairs = FEATURES.flatMap((f) => LOCALES.map((l) => `${l}:${f.editions[l].path}`));
  assert.equal(pairs.length, 30);
  assert.equal(new Set(pairs).size, 30, "two editions share a locale and path");

  // And each one matches the central registry, which is what the links use.
  for (const feature of FEATURES) {
    for (const locale of LOCALES) {
      assert.equal(feature.editions[locale].path, ARTICLE_PATHS[feature.key][locale]);
    }
  }
});

test("entry keys are unique", () => {
  const keys = FEATURES.map((f) => f.entryKey);
  assert.equal(new Set(keys).size, keys.length);
});

test("every edition is a valid body and substantial", () => {
  for (const feature of FEATURES) {
    for (const locale of LOCALES) {
      const body = feature.editions[locale].blocks;
      const parsed = bodySchema.safeParse(body);
      assert.ok(
        parsed.success,
        `${feature.key}/${locale}: ${JSON.stringify(parsed.error?.issues?.[0])}`,
      );
      const words = wordCount(bodyToPlainText(body));
      assert.ok(words >= 450, `${feature.key}/${locale} is thin: ${words} words`);
    }
  }
});

test("internal links resolve to a path we publish, in the same language", () => {
  const link = /\]\((\/[^)]*)\)/g;
  for (const feature of FEATURES) {
    for (const locale of LOCALES) {
      const text = JSON.stringify(feature.editions[locale].blocks);
      for (const match of text.matchAll(link)) {
        const href = match[1] ?? "";
        assert.ok(
          PUBLISHED_HREFS.has(href),
          `${feature.key}/${locale} links to ${href}, which nothing publishes`,
        );
        assert.ok(
          href.startsWith(`/${locale}/`),
          `${feature.key}/${locale} links into another language: ${href}`,
        );
      }
    }
  }
});

test("every feature links to at least three others", () => {
  for (const feature of FEATURES) {
    for (const locale of LOCALES) {
      const text = JSON.stringify(feature.editions[locale].blocks);
      const targets = new Set(
        [...text.matchAll(/\]\((\/[a-z]{2}\/[^)]*)\)/g)].map((m) => m[1]),
      );
      assert.ok(
        targets.size >= 3,
        `${feature.key}/${locale} only links to ${targets.size} internal pages`,
      );
    }
  }
});

test("SEO fields are present and within the lengths Google renders", () => {
  for (const feature of FEATURES) {
    for (const locale of LOCALES) {
      const e = feature.editions[locale];
      assert.ok(e.title.length > 10, `${feature.key}/${locale}: no title`);
      assert.ok(e.seoTitle.length <= 62, `${feature.key}/${locale}: seoTitle ${e.seoTitle.length}`);
      assert.ok(
        e.seoDescription.length >= 60 && e.seoDescription.length <= 170,
        `${feature.key}/${locale}: description ${e.seoDescription.length} chars`,
      );
      assert.ok(e.excerpt.length > 40, `${feature.key}/${locale}: excerpt too short`);
    }
  }
});

test("paths are lowercase, evergreen and carry no year", () => {
  for (const feature of FEATURES) {
    for (const locale of LOCALES) {
      const path = feature.editions[locale].path;
      assert.match(path, /^[a-z0-9/-]+$/, `${feature.key}/${locale}: ${path}`);
      assert.doesNotMatch(path, /\d/, `${feature.key}/${locale}: ${path} carries a number`);
      assert.doesNotMatch(path, /^\/|\/$/, `${feature.key}/${locale}: stray slash`);
    }
  }
});

test("sources are https and free of tracking parameters", () => {
  for (const feature of FEATURES) {
    assert.ok(feature.sources.length >= 1, `${feature.key} cites nothing`);
    for (const source of feature.sources) {
      assert.match(source.url, /^https:\/\//, `${feature.key}: ${source.url}`);
      assert.doesNotMatch(source.url, /utm_|chatgpt\.com/, `${feature.key}: ${source.url}`);
    }
  }
});

test("no tracking parameters anywhere in the prose", () => {
  for (const feature of FEATURES) {
    for (const locale of LOCALES) {
      assert.doesNotMatch(
        JSON.stringify(feature.editions[locale].blocks),
        /utm_source|utm_medium|chatgpt\.com/,
        `${feature.key}/${locale}`,
      );
    }
  }
});

test("every illustration is disclosed as generated, in every language", () => {
  for (const feature of FEATURES) {
    for (const [alt, caption] of [
      [feature.heroAlt, feature.heroCaption],
      [feature.secondaryAlt, feature.secondaryCaption],
    ] as const) {
      if (!caption) continue;
      for (const locale of LOCALES) {
        assert.ok(alt?.[locale]?.length, `${feature.key}: missing ${locale} alt`);
        assert.match(
          caption[locale] ?? "",
          /intel·ligència artificial|inteligencia artificial|artificial intelligence/,
          `${feature.key}: ${locale} caption does not disclose generation`,
        );
      }
    }
  }
});

test("no caption claims a generated image is a photograph of a specific place", () => {
  const forbidden = /fotografia (real|del lloc)|fotografía (real|del lugar)|(real|actual) photograph/i;
  for (const feature of FEATURES) {
    for (const locale of LOCALES) {
      for (const caption of [feature.heroCaption?.[locale], feature.secondaryCaption?.[locale]]) {
        if (caption) assert.doesNotMatch(caption, forbidden, `${feature.key}/${locale}`);
      }
    }
  }
});

test("the Sitges guide never presents a schedule it does not have", () => {
  // The screening grid was unpublished at the time of writing. Saying so is the
  // point; a fabricated timetable is the one thing that would make this guide
  // actively harmful.
  const marker = {
    ca: /es publicar(à|a) properament|encara no|pendent de publicació/i,
    es: /se publicará próximamente|todavía no|pendiente de publicar/i,
    en: /coming soon|not yet published|not out yet/i,
  };
  for (const locale of LOCALES) {
    const text = bodyToPlainText(SITGES.editions[locale].blocks);
    assert.match(text, marker[locale], `${locale} Sitges guide lost the caveat`);
    assert.match(text, /8[–-]18|October 8|8 d'octubre|8 de octubre/, `${locale} lost the dates`);
  }
});

test("the Gaudí guide states that the Finca Güell pavilions are closed", () => {
  const marker = {
    ca: /tancat per obres/i,
    es: /cerrado por obras/i,
    en: /closed for (works|restoration)/i,
  };
  for (const locale of LOCALES) {
    assert.match(
      bodyToPlainText(GAUDI.editions[locale].blocks),
      marker[locale],
      `${locale} Gaudí guide lost the closure notice`,
    );
  }
});

test("the food fairs guide publishes only the date it verified", () => {
  // Viladrau is the one date checked against the organiser. Every other fair
  // gets a period and a link, because the aggregators disagree with each other.
  for (const locale of LOCALES) {
    const text = bodyToPlainText(FOODFAIRS.editions[locale].blocks);
    assert.match(text, /24/, `${locale} lost the Viladrau date`);
    assert.match(
      text,
      /Viladrau/,
      `${locale} lost Viladrau entirely`,
    );
  }
});

test("the Barcelona guide accuses nobody of fraud", () => {
  const forbidden = /estafa|fraude|fraud|scam|timo|rip[- ]off/i;
  for (const locale of LOCALES) {
    assert.doesNotMatch(
      bodyToPlainText(TRAPS.editions[locale].blocks),
      forbidden,
      `${locale} Barcelona guide makes an unsourced allegation`,
    );
  }
});

test("every feature has a title for the related rail in all three languages", () => {
  for (const feature of FEATURES) {
    for (const locale of LOCALES) {
      assert.ok(ARTICLE_TITLES[feature.key][locale]?.length, `${feature.key}/${locale}`);
    }
  }
});
