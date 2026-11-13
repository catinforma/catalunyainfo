import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { SNOW as SNOW_FROM_PYRENEES } from "../src/lib/content/batch02/pyrenees.ts";
import { B2_PATHS, b2href } from "../src/lib/content/batch02/shared.ts";
import { SNOW, SNOW_AS_OF, SNOW_REREAD_BY, buildSnowBody } from "../src/lib/content/batch02/snow-trips.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/**
 * Snow without skiing (snow-trips.ts), upgraded in place on 13 Nov 2026:
 * by train, chains and winter tyres (Servei Català de Trànsit), the avalanche
 * bulletin (ICGC, Lauegi) and Meteocat. Same URLs, titles and descriptions
 * untouched (the 28 Oct title window runs to 28 Nov).
 */

const json = (locale: Locale) => JSON.stringify(SNOW.editions[locale].blocks);
const text = (locale: Locale) => bodyToPlainText(SNOW.editions[locale].blocks);
const sentences = (value: string) => value.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÚÇ¿«"(*])/u);

test("snow: same entry, same paths, same titles as before the upgrade", () => {
  assert.equal(SNOW, SNOW_FROM_PYRENEES, "pyrenees.ts re-exports the same object");
  assert.equal(SNOW.key, "snow");
  assert.equal(SNOW.entryKey, "guide-snow-without-skiing");
  assert.equal(SNOW.publishedAt, "2026-09-29T12:20:00+02:00");
  const titles: Record<Locale, string> = {
    ca: "Rutes d'hivern a Catalunya: on veure neu sense esquiar",
    es: "Dónde ver nieve en Cataluña sin esquiar: sitios y rutas",
    en: "Snow in Catalonia without skiing: snowshoe routes, trips",
  };
  const descriptions: Record<Locale, string> = {
    ca: "On veure neu a Catalunya sense esquiar: rutes d'hivern amb raquetes, trineus i telecabines a les estacions del Pirineu, i com arribar-hi en tren o bus.",
    es: "Dónde ver nieve en Cataluña sin esquiar: rutas de invierno con raquetas, trineos y telecabinas en las estaciones del Pirineo, y cómo llegar en tren o bus.",
    en: "Where to see snow in Catalonia without skiing: snowshoe routes, sledging and gondola rides at the Pyrenees resorts, and how to get there by train or bus.",
  };
  for (const locale of LOCALES) {
    const edition = SNOW.editions[locale];
    assert.equal(edition.path, B2_PATHS.snow[locale]);
    assert.equal(edition.seoTitle, titles[locale], `${locale}: title frozen until 28 Nov`);
    assert.equal(edition.seoDescription, descriptions[locale], `${locale}: description frozen until 28 Nov`);
  }
});

test("snow: every edition validates, is substantial and has the Spanish edition's shape", () => {
  const shape = (locale: Locale) => (SNOW.editions[locale].blocks as Block[]).map((b) => b.type).join(",");
  for (const locale of LOCALES) {
    const parsed = bodySchema.safeParse(SNOW.editions[locale].blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(locale)) > 1400, `${locale}: ${wordCount(text(locale))} words`);
    assert.equal(shape(locale), shape("es"), `${locale}: same sections as the Spanish edition`);
    assert.deepEqual(buildSnowBody(locale), SNOW.editions[locale].blocks);
  }
});

test("snow: dates — checked today or earlier, re-read guard before the season ends", () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.equal(SNOW.verifiedAt, SNOW_AS_OF);
  assert.ok(SNOW_AS_OF <= today, "as-of is not in the future");
  assert.ok(
    today <= SNOW_REREAD_BY,
    `snow-trips.ts: re-read the Rodalies R3 notice, the FGC calendars and fares, the Bus Natura and ski-bus pages and the SCT rules, then move SNOW_REREAD_BY and SNOW_AS_OF and republish \`neu\`.`,
  );
  for (const locale of LOCALES) {
    assert.match(text(locale), /13 (de novembre|de noviembre|November) (de )?2026/, `${locale}: check date shown`);
  }
});

test("snow: never promises snow, and says it is not a snow report", () => {
  for (const locale of LOCALES) {
    const body = text(locale).toLowerCase();
    for (const phrase of ["hi haurà neu", "habrá nieve", "there will be snow", "garantit", "garantizad", "guaranteed", "segur que hi ha neu", "seguro que hay nieve"]) {
      assert.ok(!body.includes(phrase), `${locale}: "${phrase}"`);
    }
    assert.match(body, /part de neu|parte de nieve|snow report/);
  }
});

test("snow: sources are official https pages; no aggregator, no aerobusbcn", () => {
  const official =
    /^(pirineu365\.cat|turistren\.cat|rodalies\.gencat\.cat|www\.renfe\.com|transit\.gencat\.cat|www\.meteo\.cat|meteo\.cat|www\.icgc\.cat|icgc\.cat|bpa\.icgc\.cat|lauegi\.conselharan\.org|www\.conselharan\.org|www\.baqueira\.es|www\.masella\.com|masella\.com|www\.guils\.com|www\.tuixent-lavansa\.com|www\.teisa-bus\.com|www\.alsa\.es|www\.visitvaldaran\.com|visitvaldaran\.com|www\.elbergueda\.cat|www\.boe\.es|interior\.gencat\.cat|ca\.lauegi\.report)$/;
  for (const source of SNOW.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/aerobusbcn|[?&]utm_/i.test(source.url), source.url);
    assert.match(new URL(source.url).hostname, official, source.url);
  }
  for (const locale of LOCALES) {
    assert.ok(!/aerobusbcn/i.test(json(locale)));
    for (const match of json(locale).matchAll(/\]\((https?:[^)\s]+)\)/g)) {
      assert.match(new URL(match[1]!).hostname, official, `${locale}: ${match[1]}`);
    }
  }
});

test("snow: internal links stay in their language and point at published paths", () => {
  const published = new Set(Object.values(B2_PATHS).flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)));
  for (const locale of LOCALES) {
    for (const key of ["snowNow", "ski", "nuria", "cerdanya"] as const) {
      assert.ok(json(locale).includes(`](${b2href(key, locale)})`), `${locale}: links ${key}`);
    }
    for (const match of json(locale).matchAll(/\]\((\/[^)]*)\)/g)) {
      const href = match[1]!;
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      assert.ok(published.has(href), `${locale}: ${href} is not a published path`);
    }
  }
});

test("snow: every price sits next to its season or validity", () => {
  for (const locale of LOCALES) {
    for (const sentence of sentences(text(locale)).filter((s) => /€/.test(s))) {
      assert.match(sentence, /2026-27|2026\/2027|2026-2027|temporada 2026|2026 season|desembre de 2026|diciembre de 2026|December 2026|publicat|publicado|published/i, `${locale}: "${sentence}" has a price without its season`);
    }
  }
});

test("snow: images keep their licences and archive captions", () => {
  for (const key of [SNOW.heroKey, SNOW.secondaryKey]) {
    assert.ok(key && IMAGE_BY_KEY.has(key), String(key));
    assert.match(IMAGE_BY_KEY.get(key!)?.license ?? "", /^CC BY-SA|^CC BY|^CC0/);
  }
  for (const locale of LOCALES) {
    assert.match(SNOW.heroCaption?.[locale] ?? "", /arxiu|archivo|archive/);
    assert.match(SNOW.secondaryCaption?.[locale] ?? "", /arxiu|archivo|archive/);
  }
});

test("snow: the publish route has its own group and still republishes it with snow-now", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ SNOW \} from "@\/lib\/content\/batch02\/snow-trips";/);
  assert.match(route, /wants\("neu"\)\) published\.push\(await publishB2Article\(SNOW\)\)/);
  assert.match(route, /wants\("snow-now"\)\)[^\n]*publishB2Article\(SNOW\)/);
});
