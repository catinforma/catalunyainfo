import assert from "node:assert/strict";
import { test } from "node:test";

// The metadata helpers read the deployment environment at call time, so the
// production flags have to be in place before the module is imported.
process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { buildAlternates, clampDescription, clampTitle } = await import(
  "../src/lib/seo/metadata.ts"
);
const { allSystemPaths, legalPath, sectionPath, sectionFromSegment } = await import(
  "../src/lib/i18n/routes.ts"
);
const { LOCALES } = await import("../src/lib/i18n/config.ts");

test("canonical is absolute and on the production host", () => {
  const alternates = buildAlternates({
    path: "/ca/montserrat/",
    translations: { ca: "/ca/montserrat/", en: "/en/montserrat/" },
  });

  assert.equal(alternates?.canonical, "https://www.catalunyainfo.com/ca/montserrat/");
});

test("hreflang lists only translations that exist, and is self-referential", () => {
  const alternates = buildAlternates({
    path: "/ca/montserrat/",
    translations: { ca: "/ca/montserrat/", en: "/en/montserrat/" },
  });
  const languages = alternates?.languages as Record<string, string>;

  assert.equal(languages.ca, "https://www.catalunyainfo.com/ca/montserrat/");
  assert.equal(languages.en, "https://www.catalunyainfo.com/en/montserrat/");
  assert.equal(languages.es, undefined);
  assert.equal(languages["x-default"], "https://www.catalunyainfo.com/en/montserrat/");
});

test("x-default falls back to Catalan when there is no English edition", () => {
  const alternates = buildAlternates({
    path: "/ca/nomes-en-catala/",
    translations: { ca: "/ca/nomes-en-catala/" },
  });
  const languages = alternates?.languages as Record<string, string>;

  assert.equal(
    languages["x-default"],
    "https://www.catalunyainfo.com/ca/nomes-en-catala/",
  );
});

test("titles and descriptions are clamped and normalised", () => {
  assert.equal(clampTitle("Short title"), "Short title");
  assert.ok(clampTitle("x".repeat(120)).length <= 62);
  assert.equal(clampDescription("  spaced   out  "), "spaced out");
  assert.equal(clampDescription(""), undefined);
  assert.equal(clampDescription(null), undefined);
});

test("every locale has a distinct, well-formed path for every system page", () => {
  for (const locale of LOCALES) {
    const paths = allSystemPaths(locale);
    assert.ok(paths.length > 0);
    assert.equal(new Set(paths).size, paths.length, `duplicate system path in ${locale}`);
    for (const path of paths) {
      assert.ok(path.startsWith(`/${locale}/`), `${path} is not under /${locale}/`);
      assert.ok(path.endsWith("/"), `${path} does not end in a slash`);
    }
  }
});

test("system path lists line up by index across locales", () => {
  const lengths = LOCALES.map((l) => allSystemPaths(l).length);
  assert.equal(
    new Set(lengths).size,
    1,
    "locales expose a different number of system pages",
  );
});

test("a section segment maps back to its section in its own locale only", () => {
  assert.equal(sectionFromSegment("ca", "destinacions"), "destinations");
  assert.equal(sectionFromSegment("es", "destinos"), "destinations");
  assert.equal(sectionFromSegment("en", "destinations"), "destinations");
  assert.equal(sectionFromSegment("es", "destinacions"), null);
});

test("localised paths match the URL architecture in the brief", () => {
  assert.equal(sectionPath("destinations", "ca"), "/ca/destinacions/");
  assert.equal(sectionPath("guides", "es"), "/es/guias/");
  assert.equal(legalPath("privacy", "en"), "/en/legal/privacy/");
});

test("the home cluster names / as x-default; every other page keeps the English edition", async () => {
  const { buildAlternates } = await import("../src/lib/seo/metadata.ts");
  const home = buildAlternates({ path: "/ca/", translations: { ca: "/ca/", es: "/es/", en: "/en/" } });
  assert.equal((home?.languages as Record<string, string>)["x-default"], "https://www.catalunyainfo.com/");
  const page = buildAlternates({ path: "/ca/guies/x/", translations: { ca: "/ca/guies/x/", en: "/en/guides/x/" } });
  assert.equal((page?.languages as Record<string, string>)["x-default"], "https://www.catalunyainfo.com/en/guides/x/");
});

test("the site schema names the brand both ways and offers no retired search action", async () => {
  const { organizationSchema, websiteSchema } = await import("../src/lib/seo/jsonld.ts");
  for (const schema of [organizationSchema(), websiteSchema("ca")]) {
    assert.deepEqual(schema.alternateName, ["Catalunya Info", "catalunyainfo.com"]);
    assert.equal(schema.url, "https://www.catalunyainfo.com/");
    assert.equal("potentialAction" in schema, false);
  }
});
