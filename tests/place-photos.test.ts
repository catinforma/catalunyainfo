import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import {
  FAIR_PHOTOS,
  HUB_PHOTOS,
  RESERVOIR_PHOTOS,
  TOWN_PHOTOS,
  fairEventImages,
  fairPagePhoto,
  photoImageObject,
  photoMetaImage,
  resolvePlacePhoto,
  townPhoto,
  type PlacePhotoEntry,
} from "../src/lib/content/place-photos.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { townBySlug } from "../src/lib/programmatic/christmas-fairs/data.ts";
import { townEventSchema } from "../src/lib/seo/jsonld.ts";
import { electionMetadata } from "../src/lib/programmatic/elections/metadata.ts";
import { resolveElectionPage } from "../src/lib/programmatic/elections/pages.ts";
import { municipalityBySlug } from "../src/lib/programmatic/holidays/data.ts";
import { reservoirHubMetadata, reservoirMetadata, resolveReservoir } from "../src/lib/programmatic/reservoirs/pages.ts";
import { isReservoirSlug } from "../src/lib/programmatic/reservoirs/types.ts";
import { DISCOVER_MIN_WIDTH, isOpenLicence, servableCrop } from "../src/lib/seo/discover-images.ts";
import { buildMetadata } from "../src/lib/seo/metadata.ts";

/*
 * Licensed place photographs (lib/content/place-photos.ts, 19 Nov 2026):
 * every photograph has a licence that allows commercial reuse, an author, a
 * source page, alt text and a caption in ca/es/en, a 16:9 share crop of at
 * least 1,200 px, and sits below the answer on its page.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

const ENTRIES: [string, PlacePhotoEntry][] = [
  ...Object.entries(TOWN_PHOTOS).map(([slug, e]) => [`town:${slug}`, e] as [string, PlacePhotoEntry]),
  ...Object.entries(FAIR_PHOTOS).map(([slug, e]) => [`fair:${slug}`, e] as [string, PlacePhotoEntry]),
  ...Object.entries(HUB_PHOTOS).map(([kind, e]) => [`hub:${kind}`, e] as [string, PlacePhotoEntry]),
  ...Object.entries(RESERVOIR_PHOTOS).map(([slug, e]) => [`reservoir:${slug}`, e] as [string, PlacePhotoEntry]),
];

test("the registry covers the top photo-less towns, the Espinelves fair, three hubs and Sau", () => {
  assert.equal(Object.keys(TOWN_PHOTOS).length, 25);
  assert.deepEqual(Object.keys(FAIR_PHOTOS), ["espinelves"]);
  assert.deepEqual(Object.keys(HUB_PHOTOS).sort(), ["fairs", "holidays", "reservoirs"]);
  assert.deepEqual(Object.keys(RESERVOIR_PHOTOS), ["sau"]);
  for (const slug of ["barcelona", "tarragona", "lleida", "girona", "terrassa", "badalona", "mataro", "reus", "salou", "el-prat-de-llobregat"]) {
    assert.ok(TOWN_PHOTOS[slug], slug);
  }
});

test("every photograph: open licence (no NC/ND), author, Commons source page, manifest file of 1,600 px or more", () => {
  for (const [id, entry] of ENTRIES) {
    const image = IMAGE_BY_KEY.get(entry.key);
    assert.ok(image, `${id}: ${entry.key} is not in the manifest`);
    assert.ok(isOpenLicence(image.license), `${id}: licence ${image.license}`);
    assert.doesNotMatch(image.license ?? "", /\bNC\b|\bND\b|non.?commercial|no.?deriv/i, id);
    assert.ok(image.credit && image.credit.trim().length > 1, `${id}: no author`);
    assert.match(image.creditUrl ?? "", /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/, `${id}: source page`);
    assert.ok(image.width >= 1600, `${id}: ${image.width} px`);
    assert.ok(image.width > image.height, `${id}: landscape`);
  }
});

test("every photograph: the 16:9 share crop is at least 1,200 px wide, exactly 16:9, and the crop route serves it", () => {
  for (const [id, entry] of ENTRIES) {
    for (const locale of LOCALES) {
      const photo = resolvePlacePhoto(entry, locale);
      assert.ok(photo, `${id} ${locale} does not resolve`);
      assert.equal(photo.share.ratio, "16x9");
      assert.ok(photo.share.width >= DISCOVER_MIN_WIDTH, `${id}: ${photo.share.width}`);
      assert.equal(photo.share.width * 9, photo.share.height * 16, `${id}: not 16:9`);
      assert.equal(photo.share.url, `/img/16x9/${entry.key}.jpg`);
      assert.ok(servableCrop("16x9", `${entry.key}.jpg`), `${id}: crop route 404`);
      const meta = photoMetaImage(photo);
      assert.ok(meta && meta.width >= 1200 && meta.alt === photo.alt);
    }
  }
});

test("every photograph: alt text and caption in ca, es and en, describing the picture", () => {
  for (const [id, entry] of ENTRIES) {
    for (const locale of LOCALES) {
      const alt = entry.alt[locale];
      const caption = entry.caption[locale];
      assert.ok(alt && alt.length >= 25 && alt.length <= 160, `${id} ${locale}: alt "${alt}"`);
      assert.doesNotMatch(alt, /^(foto|fotografia|fotografía|imatge|imagen|image|photo|picture)\b/i, `${id} ${locale}: alt starts with "photo of"`);
      assert.doesNotMatch(alt, /\.$/, `${id} ${locale}: alt ends with a full stop`);
      assert.ok(caption && caption.endsWith("."), `${id} ${locale}: caption "${caption}"`);
      assert.notEqual(alt, caption);
    }
    assert.notEqual(entry.alt.ca, entry.alt.en, `${id}: en alt not translated`);
    assert.notEqual(entry.alt.es, entry.alt.en, `${id}: en alt not translated`);
  }
});

test("each file is committed in public/images and optimised (WebP, at most 512 KB; the import aims at 350 KB)", () => {
  for (const [id, entry] of ENTRIES) {
    const path = join(ROOT, "public", "images", `${entry.key}.webp`);
    const size = statSync(path).size;
    assert.ok(size > 10_000 && size <= 512 * 1024, `${id}: ${size} bytes`);
    assert.equal(readFileSync(path).subarray(8, 12).toString("ascii"), "WEBP", `${id}: not a WebP`);
  }
});

test("each registry key is a page the site has: a town, a fair town, a reservoir", () => {
  for (const slug of Object.keys(TOWN_PHOTOS)) {
    const known = municipalityBySlug(slug) ?? townBySlug(slug) ?? resolveElectionPage("ca", "ca", slug);
    assert.ok(known, `${slug} is not a town of any family`);
  }
  for (const slug of Object.keys(FAIR_PHOTOS)) assert.ok(townBySlug(slug), `${slug} has no fair page`);
  for (const slug of Object.keys(RESERVOIR_PHOTOS)) assert.ok(isReservoirSlug(slug), slug);
});

test("og:image and twitter:image are the 16:9 crop; a town without a photograph keeps the site card", () => {
  const photo = townPhoto("tarragona", "es");
  const meta = buildMetadata({ locale: "es", path: "/es/festivos/tarragona/", title: "t", image: photoMetaImage(photo) });
  const og = (meta.openGraph?.images as { url: string; width: number; height: number }[])[0]!;
  assert.match(og.url, /\/img\/16x9\/municipi-tarragona-placa-font-ajuntament\.jpg$/);
  assert.ok(og.width >= 1200 && og.width * 9 === og.height * 16);
  assert.deepEqual(meta.twitter && "images" in meta.twitter ? meta.twitter.images : null, [og.url]);
  const none = buildMetadata({ locale: "es", path: "/es/festivos/x/", title: "t", image: photoMetaImage(townPhoto("not-a-town", "es")) });
  assert.match((none.openGraph?.images as { url: string }[])[0]!.url, /\/social-card\.png$/);
});

test("election and reservoir metadata carry the photograph", () => {
  const sb = resolveElectionPage("es", "es", "sant-boi-de-llobregat");
  assert.ok(sb);
  const og = (electionMetadata("es", sb).openGraph?.images as { url: string }[])[0]!;
  assert.match(og.url, /\/img\/16x9\/municipi-sant-boi-casa-de-la-vila\.jpg$/);
  const sau = resolveReservoir("ca", "ca", "sau");
  assert.ok(sau);
  assert.match((reservoirMetadata(sau, "ca").openGraph?.images as { url: string }[])[0]!.url, /embassaments-sau-cingles-tavertet\.jpg$/);
  assert.match((reservoirHubMetadata("en").openGraph?.images as { url: string }[])[0]!.url, /embassaments-presa-sau-tavertet\.jpg$/);
});

test("ImageObject: licence metadata Google reads (contentUrl, creator, creditText, license, acquireLicensePage)", () => {
  for (const [id, entry] of ENTRIES) {
    const photo = resolvePlacePhoto(entry, "ca");
    const node = photoImageObject(photo, "/ca/x/") as Record<string, unknown>;
    assert.equal(node["@type"], "ImageObject");
    assert.match(String(node.contentUrl), /^https?:\/\/.+\/img\/16x9\/.+\.jpg$/, id);
    assert.ok(Number(node.width) >= 1200, id);
    assert.equal(node.creditText, photo!.credit);
    assert.deepEqual(node.creator, { "@type": "Person", name: photo!.credit });
    assert.match(String(node.license), /^https:\/\/creativecommons\.org\/(licenses\/by(-sa)?\/\d\.\d\/|publicdomain\/zero\/1\.0\/)/, id);
    assert.equal(node.acquireLicensePage, photo!.creditUrl);
  }
});

test("fair pages: the fair's own photograph wins and goes into the Event markup; a town photograph never does", () => {
  assert.equal(fairPagePhoto("espinelves", "es")?.key, "fira-avet-espinelves-avets");
  assert.equal(fairPagePhoto("canyelles", "ca")?.key, "municipi-canyelles-castell");
  const images = fairEventImages("espinelves");
  assert.equal(images?.length, 3);
  for (const url of images!) assert.match(url, /^https?:\/\/.+\/img\/(16x9|4x3|1x1)\/fira-avet-espinelves-avets\.jpg$/);
  assert.equal(fairEventImages("canyelles"), undefined);
  const event = townEventSchema({ path: "/ca/fires-de-nadal/espinelves/", id: "x", name: "Fira", startDate: "2026-11-28", endDate: "2026-12-08", town: "Espinelves", region: "Girona", image: images });
  assert.deepEqual(event.image, images);
  const plain = townEventSchema({ path: "/ca/fires-de-nadal/canyelles/", id: "y", name: "Fira", startDate: "2026-11-28", endDate: "2026-11-29", town: "Canyelles", region: "Barcelona" });
  assert.equal("image" in plain, false);
});

test("the figure is lazy, reserves its box and prints author, source and licence links", () => {
  const src = read("src/components/PlacePhoto.tsx");
  assert.match(src, /loading="lazy"/);
  assert.match(src, /width=\{photo\.width\}/);
  assert.match(src, /height=\{photo\.height\}/);
  assert.doesNotMatch(src, /\bpreload\b|fetchPriority/);
  assert.match(src, /href=\{photo\.creditUrl\}/);
  assert.match(src, /rel="license/);
  assert.match(src, /Wikimedia Commons/);
});

test("the photograph sits below the answer on every page that shows it", () => {
  const after = (file: string, anchor: string) => {
    const src = read(file);
    const photo = src.indexOf("<PlacePhoto");
    const at = src.indexOf(anchor);
    assert.ok(photo > 0 && at > 0, `${file}: ${anchor}`);
    assert.ok(photo > at, `${file}: the photograph comes before ${anchor}`);
  };
  after("src/components/programmatic/holidays/MunicipalityPage.tsx", "firstScreenOrder(locale).map");
  after("src/components/programmatic/holidays/MunicipalityPage.tsx", "<HolidayStatus");
  after("src/components/programmatic/holidays/EnglishTownPage.tsx", "<HolidayTable");
  after("src/components/programmatic/holidays/EnglishTownPage.tsx", "<HolidayStatus");
  after("src/components/programmatic/holidays/HubPage.tsx", "<DateQuestions");
  after("src/components/programmatic/holidays/EnglishHubPage.tsx", "<HolidayTable");
  after("src/components/programmatic/ElectionResultsPage.tsx", "<ElectionDayCallout");
  after("src/components/programmatic/ElectionResultsPage.tsx", "<PollingSection");
  after("src/components/programmatic/christmas-fairs/TownPage.tsx", "<FairCard");
  after("src/components/programmatic/christmas-fairs/HubPage.tsx", "<FairRows");
  after("src/components/programmatic/reservoirs/ReservoirPages.tsx", "<ReservoirReading");
});
