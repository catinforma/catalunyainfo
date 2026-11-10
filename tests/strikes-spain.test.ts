import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { STRIKE_11N } from "../src/lib/content/batch02/strike-11n.ts";
import { CITY_HERO } from "../src/lib/content/batch02/strike-11n-cities.ts";
import { CITIES, STATE_SERVICES } from "../src/lib/content/batch02/strike-11n-cities-data.ts";
import type { StateService, Strike11nCity } from "../src/lib/content/batch02/strike-11n-cities-model.ts";
import { STRIKE_11N_CITY_REFS, strike11nCityHref } from "../src/lib/content/batch02/strike-11n-city-paths.ts";
import { STRIKES, STRIKES_GUIDE, STRIKE_URLS, madridDate } from "../src/lib/content/batch02/strikes.ts";
import {
  STRIKES_SPAIN_AS_OF,
  STRIKES_SPAIN_GUIDE,
  STRIKES_SPAIN_MAX_AGE_DAYS,
  buildStrikesSpainBody,
  daysBetween,
  isHubStale,
  lastDay,
  pastSpainStrikes,
  spainDays,
  staleSpainStrikes,
  strike11nMinimumServices,
  strikesSpainDescription,
  strikesSpainSeoTitle,
  titleMonths,
  upcomingSpainStrikes,
} from "../src/lib/content/batch02/strikes-spain.ts";
import { SPAIN_STRIKES, STRIKES_SPAIN_VERIFIED } from "../src/lib/content/batch02/strikes-spain-data.ts";
import type { SpainStrike } from "../src/lib/content/batch02/strikes-spain-model.ts";
import { STRIKES_SPAIN_HREF, STRIKES_SPAIN_PATH } from "../src/lib/content/batch02/strikes-spain-path.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { NEWS_CYCLE_ENTRY_KEYS } from "../src/lib/seo/news-cycle.ts";

/**
 * "Huelgas en España" (6 Nov 2026): the Spain-wide strikes calendar, one
 * Spanish-only evergreen URL, rendered from strikes-spain-data.ts.
 *
 * Pins the structure and SEO (Spanish only, a month in the title), the
 * sourcing discipline (organisers and official sources only, every external
 * link a listed source, no figure nobody published), the date logic (upcoming
 * vs past from STRIKES_SPAIN_AS_OF only), the agreement with the Catalan hub
 * and the 11N pages, the cross-links, and fails 4 days after the as-of date
 * until the list is re-checked.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const edition = STRIKES_SPAIN_GUIDE.editions.es;
const json = JSON.stringify(edition.blocks);
const body = text(edition.blocks);
const sentences = (plain: string) => plain.split(/\n|(?<=[.!?»])\s+/);

const CITY_HREFS = STRIKE_11N_CITY_REFS.map((ref) => strike11nCityHref(ref.key));
const PUBLISHED_ES = new Set([
  ...[...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)].map((paths) => `/es/${paths.es}/`),
  ...CITY_HREFS,
]);

/** News sites: facts are read on the organisers' and the official pages, never on these. */
const PRESS_HOSTS =
  /(^|\.)(elpais|elmundo|abc|larazon|lavanguardia|elperiodico|eldiario|elconfidencial|publico|20minutos|europapress|efe|rtve|cadenaser|ondacero|cope|antena3|telecinco|lasexta|huffingtonpost|que|cronista|elespanol|vozpopuli|libertaddigital|niusdiario|newtral|ara|naciodigital|elnacional|lavozdegalicia|heraldo|diariodesevilla|ideal|lasprovincias|levante-emv|elcorreo|diariovasco|lne|elcomercio|eldebate|okdiario|infobae|bolsamania|expansion|cincodias|eleconomista|hosteltur|alicanteplaza|ondavasca|democrata|diaridetarragona|diariodeleon|vivirediciones)\.(es|com|cat|net|info)$/;

/** The list as it would be once every indefinite strike had been recorded as over (on 20 Nov 2026). */
const allEnded = (list: SpainStrike[] = SPAIN_STRIKES): SpainStrike[] =>
  list.map((s) => (s.indefinite && !s.indefinite.endedOn ? { ...s, indefinite: { endedOn: "2026-11-20" } } : s));

const strike = (id: string) => {
  const found = SPAIN_STRIKES.find((s) => s.id === id);
  assert.ok(found, id);
  return found;
};

/* -------------------------------------------------------------------------- */
/* Structure, SEO, photo                                                      */
/* -------------------------------------------------------------------------- */

test("one Spanish-only page at /es/guias/huelgas-espana/, valid and substantial", () => {
  assert.deepEqual(Object.keys(STRIKES_SPAIN_GUIDE.editions), ["es"]);
  assert.equal(edition.path, "guias/huelgas-espana");
  assert.equal(STRIKES_SPAIN_PATH, edition.path);
  assert.equal(STRIKES_SPAIN_HREF, "/es/guias/huelgas-espana/");
  assert.ok(!/\d{4}/.test(edition.path), "no year in the path: the URL serves every strike");
  const parsed = bodySchema.safeParse(edition.blocks);
  assert.ok(parsed.success, JSON.stringify(parsed.error?.issues?.slice(0, 2)));
  assert.ok(wordCount(body) > 800, `thin: ${wordCount(body)} words`);
  assert.equal(STRIKES_SPAIN_GUIDE.entryKey, "guide-strikes-spain");
  assert.ok(NEWS_CYCLE_ENTRY_KEYS.has(STRIKES_SPAIN_GUIDE.entryKey), "marked up as NewsArticle, like the other strike pages");
  assert.equal(STRIKES_SPAIN_GUIDE.verifiedAt, STRIKES_SPAIN_VERIFIED);
  assert.equal(STRIKES_SPAIN_VERIFIED, STRIKES_SPAIN_AS_OF);
  assert.ok(body.includes("Última verificación de los datos de esta página"));
});

test("the path collides with no other published path", () => {
  const others = [
    ...[...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)].flatMap((paths) =>
      LOCALES.map((locale) => paths[locale]),
    ),
    ...STRIKE_11N_CITY_REFS.map((ref) => ref.path),
  ];
  assert.ok(!others.includes(STRIKES_SPAIN_PATH), `${STRIKES_SPAIN_PATH} is already published`);
});

test("title: under 60 characters, the searched words and the month of the as-of date; the next month joins from the 20th", () => {
  assert.equal(edition.seoTitle, strikesSpainSeoTitle());
  for (const asOf of [STRIKES_SPAIN_AS_OF, "2026-11-19", "2026-11-20", "2026-12-21", "2027-01-05", "2027-09-25", "2027-02-27"]) {
    const title = strikesSpainSeoTitle(asOf);
    assert.ok(title.length <= 60, `${asOf}: ${title.length} "${title}"`);
    assert.match(title, /^Huelgas (en España|\S+)/, title);
    assert.match(title, /España/, title);
    assert.ok(title.includes(titleMonths(asOf).short), `${asOf}: "${title}" lacks "${titleMonths(asOf).short}"`);
  }
  assert.equal(strikesSpainSeoTitle("2026-11-06"), "Huelgas en España en noviembre 2026: calendario y mínimos");
  assert.deepEqual(titleMonths("2026-11-19").months, ["2026-11"]);
  assert.equal(titleMonths("2026-11-20").short, "noviembre y diciembre 2026");
  assert.equal(titleMonths("2026-12-21").short, "diciembre 2026 y enero 2027");
  assert.equal(titleMonths("2026-12-21").long, "diciembre de 2026 y enero de 2027");
  assert.match(edition.title, new RegExp(`^Huelgas en España en ${titleMonths().long}: `));
  assert.ok(edition.excerpt.length > 30 && edition.excerpt.length <= 200);
});

test("description: under 155 characters, names the next strikes, general strike first; the evergreen line with none", () => {
  assert.equal(edition.seoDescription, strikesSpainDescription());
  assert.ok(edition.seoDescription.length <= 155, `${edition.seoDescription.length}: ${edition.seoDescription}`);
  assert.match(edition.seoDescription, /^Huelgas en España: /);
  for (const asOf of ["2026-11-06", "2026-11-11", "2026-11-13", "2026-12-15", "2027-06-01"]) {
    const description = strikesSpainDescription(asOf);
    assert.ok(description.length > 60 && description.length <= 155, `${asOf}: ${description.length} ${description}`);
  }
  const general = SPAIN_STRIKES.find((s) => s.sector === "general" && upcomingSpainStrikes().includes(s));
  if (general) assert.ok(edition.seoDescription.includes(general.label), "the general strike is named first when upcoming");
  assert.match(strikesSpainDescription("2030-01-01", allEnded()), /^Calendario de huelgas en España/);
});

test("photo: the 11N city pages' Commons file, with their exact alt text and caption", () => {
  const image = IMAGE_BY_KEY.get(CITY_HERO.key);
  assert.ok(image, "not in the image manifest");
  assert.match(image.license ?? "", /^CC (BY|BY-SA|0)|^PD|GFDL/);
  assert.equal(STRIKES_SPAIN_GUIDE.heroKey, CITY_HERO.key);
  assert.deepEqual(STRIKES_SPAIN_GUIDE.heroAlt, CITY_HERO.alt);
  assert.deepEqual(STRIKES_SPAIN_GUIDE.heroCaption, CITY_HERO.caption);
  assert.ok(!edition.blocks.some((b) => b.type === "image" || b.type === "gallery"));
});

/* -------------------------------------------------------------------------- */
/* Links                                                                      */
/* -------------------------------------------------------------------------- */

test("internal links stay in Spanish, end in a slash, point at a published path; the 11N page, its city pages, the Catalan hub and the strike guides are linked", () => {
  const hrefs = [...json.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "");
  for (const href of hrefs) {
    assert.ok(href.startsWith("/es/"), `links to ${href}`);
    assert.ok(href.endsWith("/"), href);
    assert.ok(PUBLISHED_ES.has(href), `${href} is not a published path`);
    assert.notEqual(href, STRIKES_SPAIN_HREF, "links to itself");
  }
  for (const key of ["strike11n", "strikes", "strikeRenfe", "strikeEducation"] as const) {
    assert.ok(hrefs.includes(`/es/${B2_PATHS[key].es}/`), `no link to ${key}`);
  }
  // The city pages, while the general strike is upcoming.
  if (upcomingSpainStrikes().some((s) => s.sector === "general")) for (const href of CITY_HREFS) assert.ok(hrefs.includes(href), `no link to ${href}`);
});

test("external links are https and every one is a listed source (e-Tauler orders only inline, until the DOGC numbers them)", () => {
  const urls = STRIKES_SPAIN_GUIDE.sources.map((s) => s.url);
  assert.equal(new Set(urls).size, urls.length, "a source is listed twice");
  const eTauler = new Set<string>(Object.values(STRIKE_URLS).filter((url) => /tauler\.seu-e\.cat/.test(url)));
  for (const url of urls) {
    assert.match(url, /^https:\/\//, url);
    assert.ok(!/[?&]utm_/.test(url), url);
    assert.ok(!/tauler\.seu-e\.cat\/detall/.test(url), `${url}: an e-Tauler notice expires; list the Treball page or the DOGC`);
    assert.ok(!PRESS_HOSTS.test(new URL(url).host), `${url}: press, not an organiser or an official source`);
  }
  for (const match of json.matchAll(/\]\((https?:[^)]*)\)/g)) {
    const href = match[1] ?? "";
    assert.match(href, /^https:\/\//, href);
    assert.ok(urls.includes(href) || eTauler.has(href), `${href} is linked but not in the sources`);
    if (eTauler.has(href)) assert.ok(urls.includes(STRIKE_URLS.treballMs), "an inline e-Tauler order needs Treball's list in the sources");
  }
  // The legal basis is cited from the BOE only.
  for (const url of [STRIKE_URLS.constitution, STRIKE_URLS.rdl17]) {
    assert.match(url, /^https:\/\/www\.boe\.es\//);
    assert.ok(urls.includes(url), url);
  }
});

test("every strike: ISO days in order, its organiser's own notice linked and listed, no press source", () => {
  const ids = new Set<string>();
  for (const s of SPAIN_STRIKES) {
    assert.ok(!ids.has(s.id), `${s.id} twice`);
    ids.add(s.id);
    assert.ok(s.dates.length > 0, s.id);
    for (const iso of s.dates) assert.match(iso, /^\d{4}-\d{2}-\d{2}$/, s.id);
    assert.deepEqual([...s.dates].sort(), s.dates, `${s.id}: days out of order`);
    assert.equal(new Set(s.dates).size, s.dates.length, `${s.id}: a day twice`);
    if (s.indefinite) assert.equal(s.dates.length, 1, `${s.id}: an indefinite strike lists its first day only`);
    assert.ok(s.sources.length > 0, s.id);
    const links = [...s.calledBy.matchAll(/\]\((https:[^)]*)\)/g)].map((m) => m[1] ?? "");
    if (s.call === "anunciada" || s.minimumServices === "strike11n" || links.length > 0) {
      assert.ok(links.length > 0, `${s.id}: the organiser's notice must be linked in calledBy`);
    }
    for (const href of links) assert.ok(s.sources.some((src) => src.url === href), `${s.id}: ${href} not in its sources`);
    for (const src of s.sources) assert.ok(!PRESS_HOSTS.test(new URL(src.url).host), `${s.id}: ${src.url} is press`);
    assert.ok(s.title === s.title.trim() && s.title.charAt(0) === s.title.charAt(0).toLowerCase(), `${s.id}: title lower case`);
    for (const guide of s.guides) for (const m of guide.matchAll(/\]\(([^)]*)\)/g)) assert.ok((m[1] ?? "").startsWith("/es/"), `${s.id}: guide ${m[1]}`);
  }
});

test("an announced strike says so: 'anunciada, sin convocatoria registrada', in its heading and in the table", () => {
  const announced: SpainStrike = {
    ...strike("huelga-maquinistas-2026-11-17"),
    id: "huelga-prueba-2026-12-03",
    dates: ["2026-12-03"],
    call: "anunciada",
    title: "huelga de prueba",
    catalanEntry: undefined,
  };
  const blocks = buildStrikesSpainBody(STRIKES_SPAIN_AS_OF, [...SPAIN_STRIKES, announced]);
  const out = text(blocks);
  assert.ok(out.includes("huelga de prueba (anunciada, sin convocatoria registrada)"), "heading");
  const tableBlock = blocks.find((b) => b.type === "table") as { rows: string[][] };
  assert.ok(tableBlock.rows.some((row) => row.some((cell) => cell.includes("anunciada, sin convocatoria registrada"))), "table");
});

/* -------------------------------------------------------------------------- */
/* Sourcing discipline: no figure nobody published                            */
/* -------------------------------------------------------------------------- */

test("no percentage that no order, resolution or organiser published", () => {
  const checked = "6 de noviembre de 2026";
  let plain = body;
  // Figures read on an official page or the organiser's own: published minimum services, the 11N slots, the call.
  const allowed = SPAIN_STRIKES.flatMap((s) => [
    s.calledBy,
    s.hours,
    ...s.notes,
    ...(s.minimumServices === "strike11n" ? [strike11nMinimumServices(checked).text] : s.minimumServices.status === "pending" ? [] : [s.minimumServices.text, s.minimumServices.short]),
  ]).map((t) => text([{ type: "paragraph", text: t } as Block]));
  for (const piece of allowed) plain = plain.split(piece).join(" ");
  for (const piece of sentences(plain)) {
    for (const pct of piece.match(/\d+(?:,\d+)?\s?%/g) ?? []) {
      const ok = (pct.replace(/\s/, "") === "90%" && /seguridad/.test(piece)) || /^(66|33)%$/.test(pct.replace(/\s/, "")) || pct === "72,41%";
      assert.ok(ok, `${pct} in "${piece}"`);
    }
  }
  // A pending strike prints no figure of its own.
  for (const s of SPAIN_STRIKES) {
    if (s.minimumServices !== "strike11n" && s.minimumServices.status === "pending") assert.doesNotMatch(s.minimumServices.text, /\d+(?:,\d+)?\s?%/, s.id);
  }
});

/* -------------------------------------------------------------------------- */
/* Date logic                                                                 */
/* -------------------------------------------------------------------------- */

test("upcoming and past are decided by the as-of date only: a strike moves to 'recientes' the day after its last day", () => {
  const renfe = strike("huelga-renfe-2026-11-10");
  assert.ok(upcomingSpainStrikes("2026-11-11").includes(renfe), "between its two days it is still upcoming");
  assert.ok(upcomingSpainStrikes("2026-11-12").includes(renfe));
  assert.ok(pastSpainStrikes("2026-11-13").includes(renfe));
  const later = text(buildStrikesSpainBody("2026-11-13"));
  assert.ok(later.includes("Huelgas recientes"));
  // The lead speaks of the day: on 11 Nov the general strike is on today.
  const lead11 = (buildStrikesSpainBody("2026-11-11")[0] as { text: string }).text;
  assert.match(lead11, /^\*\*Hoy, miércoles 11 de noviembre de 2026, hay huelga en España:\*\* .*huelga general de 24 horas/);
  // With nothing upcoming, the evergreen lead, the past list and the legal basis.
  const quiet = buildStrikesSpainBody("2030-01-01", allEnded());
  assert.match((quiet[0] as { text: string }).text, /No hay ninguna huelga de ámbito estatal convocada/);
  assert.ok(bodySchema.safeParse(quiet).success);
  assert.ok(text(quiet).includes("Cómo se fijan los servicios mínimos"));
});

test("date wording: days grouped by month, ranges of three or more days, indefinite strikes", () => {
  assert.equal(spainDays({ dates: ["2026-11-10", "2026-11-12"] }), "martes 10 y jueves 12 de noviembre de 2026");
  assert.equal(spainDays({ dates: ["2026-11-30", "2026-12-01"] }), "lunes 30 de noviembre y martes 1 de diciembre de 2026");
  assert.equal(spainDays({ dates: ["2026-12-14", "2026-12-15", "2026-12-16"] }), "del lunes 14 al miércoles 16 de diciembre de 2026");
  assert.equal(spainDays({ dates: ["2026-10-28"], indefinite: {} }), "desde el miércoles 28 de octubre de 2026");
  assert.equal(spainDays({ dates: ["2026-11-11"] }, false), "miércoles 11 de noviembre");
});

test("a minimum-services resolution is not cited after its last day in force (cite the new one, or record the strike as over)", () => {
  for (const s of upcomingSpainStrikes()) {
    if (!s.msValidUntil) continue;
    assert.match(s.msValidUntil, /^\d{4}-\d{2}-\d{2}$/, s.id);
    assert.ok(
      STRIKES_SPAIN_AS_OF <= s.msValidUntil,
      `${s.id}: its minimum-services resolution ran to ${s.msValidUntil}, but the page is dated ${STRIKES_SPAIN_AS_OF}. Read the Ministry's list: cite the new resolution and move msValidUntil, or set the strike's end (indefinite.endedOn) if it was called off.`,
    );
  }
});

test("a past strike may not stay 'pending': record what was published, or 'none'", () => {
  for (const s of pastSpainStrikes()) {
    if (s.minimumServices === "strike11n") continue;
    assert.notEqual(s.minimumServices.status, "pending", `${s.id} is past on ${STRIKES_SPAIN_AS_OF} but still 'pending'`);
  }
});

test("staleness helpers: stale the day after a last day; the page goes stale 4 days after the as-of date", () => {
  assert.deepEqual(staleSpainStrikes("2026-11-12", "2026-11-06").map((s) => s.id), ["huelga-general-2026-11-11"].filter((id) => SPAIN_STRIKES.some((s) => s.id === id)));
  assert.equal(STRIKES_SPAIN_MAX_AGE_DAYS, 4);
  assert.equal(isHubStale("2026-11-09", "2026-11-06"), false);
  assert.equal(isHubStale("2026-11-10", "2026-11-06"), true);
  assert.equal(daysBetween("2026-10-25", "2026-10-26"), 1, "across the clock change");
});

test("the Spain calendar was re-checked in the last 4 days (move STRIKES_SPAIN_AS_OF and publish ?only=huelgas-espana)", () => {
  const today = madridDate(new Date());
  assert.ok(STRIKES_SPAIN_AS_OF <= today, `STRIKES_SPAIN_AS_OF (${STRIKES_SPAIN_AS_OF}) is in the future`);
  assert.ok(
    !isHubStale(today),
    `On ${today} the Spain-wide strikes calendar was last checked on ${STRIKES_SPAIN_AS_OF} (${daysBetween(STRIKES_SPAIN_AS_OF, today)} days ago). Re-read every organiser, the BOE and the Ministry of Transport's lists, update src/lib/content/batch02/strikes-spain-data.ts, move STRIKES_SPAIN_AS_OF, deploy and publish ?only=huelgas-espana.`,
  );
});

test("no listed strike is shown as upcoming after its last day (move STRIKES_SPAIN_AS_OF and publish ?only=huelgas-espana)", () => {
  const today = madridDate(new Date());
  const stale = staleSpainStrikes(today);
  assert.deepEqual(
    stale.map((s) => s.id),
    [],
    `On ${today} these strikes are over but the Spain calendar still lists them as upcoming: ${stale.map((s) => `${s.id} (last day ${lastDay(s)})`).join(", ")}. Record what was published in strikes-spain-data.ts, move STRIKES_SPAIN_AS_OF and publish ?only=huelgas-espana.`,
  );
});

/* -------------------------------------------------------------------------- */
/* Agreement with the Catalan hub and the 11N pages                           */
/* -------------------------------------------------------------------------- */

test("a strike that is also in the Catalan hub has the same days there", () => {
  for (const s of SPAIN_STRIKES) {
    if (!s.catalanEntry) continue;
    const catalan = STRIKES.find((c) => c.id === s.catalanEntry);
    assert.ok(catalan, `${s.id}: ${s.catalanEntry} is not in strikes.ts`);
    assert.deepEqual(s.dates, catalan.dates, `${s.id}: the days differ from strikes.ts`);
  }
});

test("the 11N minimum services are read from the 11N pages' data: pending, partial and published follow the slots", () => {
  const filled = (city: Strike11nCity): Strike11nCity => ({
    ...city,
    services: city.services.map((service) => ({ ...service, status: "published" as const, text: "El 99% del servicio", source: { name: "x", url: "https://example.org/x" } })),
  });
  const empty = (city: Strike11nCity): Strike11nCity => ({ ...city, services: city.services.map((service) => ({ ...service, status: "pending" as const, text: null, source: null })) });
  const stateFilled = Object.fromEntries(
    Object.entries(STATE_SERVICES).map(([key, slot]) => [key, { ...slot, status: "published" as const, text: "El 98% de los trenes", source: { name: "r", url: `https://example.org/${key}` } }]),
  ) as Record<"rail" | "air", StateService>;
  const catalanPending = STRIKES.map((s) => (s.id === "vaga-general-2026-11-11" ? { ...s, minimumServices: { ...s.minimumServices, status: "pending" as const } } : s));
  const checked = "9 de noviembre de 2026";

  assert.equal(strike11nMinimumServices(checked, CITIES.map(empty), STATE_SERVICES, catalanPending).status, "pending");
  assert.equal(strike11nMinimumServices(checked, CITIES.map(filled), stateFilled, STRIKES).status, "published");
  const partial = strike11nMinimumServices(checked, CITIES.map(empty), STATE_SERVICES, STRIKES);
  assert.equal(partial.status, "partial");
  assert.match(partial.text, /Cataluña/);
  assert.match(partial.text, /Ministerio de Transportes/);
  // Today: whatever the data says, the page links every city page whose regional order is out.
  const now = strike11nMinimumServices(checked);
  for (const city of CITIES) {
    const linked = now.text.includes(`](${strike11nCityHref(city.key)})`);
    assert.equal(linked, city.services.some((s) => s.status === "published"), `${city.key}: linked ${linked}`);
  }
  // The BOE orders already out are always there.
  assert.match(now.text, /seguridad privada/);
  assert.match(now.text, /Orden INT\/1170\/2026/);
});

test("Catalonia: the section links the Catalan hub and lists the Catalan hub's Catalonia-only strikes, not the shared ones", () => {
  const section = body.slice(body.indexOf("Huelgas en Cataluña"), body.indexOf("Cómo se fijan"));
  assert.ok(section.length > 0);
  assert.ok(json.includes(`](/es/${B2_PATHS.strikes.es}/)`));
  const mirrored = new Set(SPAIN_STRIKES.map((s) => s.catalanEntry).filter(Boolean));
  for (const c of STRIKES) {
    if (mirrored.has(c.id)) assert.ok(!section.includes(`${c.title.es}.`) || SPAIN_STRIKES.some((s) => s.title === c.title.es), `${c.id} is listed twice`);
  }
});

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

test("FAQ: today, the month(s) of the title, doctors, Renfe and education, in the searched words", () => {
  const faqBlock = edition.blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] } | undefined;
  assert.ok(faqBlock, "no FAQ block");
  const questions = faqBlock.items.map((item) => item.question);
  assert.ok(questions.includes("¿Hay huelga hoy en España?"));
  for (const ym of titleMonths().months) assert.ok(questions.some((q) => q.startsWith("¿Qué huelgas hay en") && q.includes(ym.slice(0, 4))), ym);
  for (const word of ["médicos", "Renfe", "educación"]) assert.ok(questions.some((q) => q.includes(word)), word);
  for (const item of faqBlock.items) {
    assert.ok(!/\]\(|\*\*/.test(item.answer), `markdown in the answer to ${item.question}`);
    assert.ok(item.answer.length > 40, item.question);
  }
  // The Renfe answer says yes while a rail strike is upcoming.
  const renfe = faqBlock.items.find((item) => item.question.includes("Renfe"))!;
  if (upcomingSpainStrikes().some((s) => s.sector === "rail")) assert.match(renfe.answer, /^Sí: /);
});

/* -------------------------------------------------------------------------- */
/* Cross-links and publishing                                                 */
/* -------------------------------------------------------------------------- */

test("the Spanish 11N page and the Spanish Catalan hub link the Spain calendar; the Catalan and English editions do not", () => {
  for (const article of [STRIKES_GUIDE, STRIKE_11N]) {
    assert.ok(JSON.stringify(article.editions.es.blocks).includes(`](${STRIKES_SPAIN_HREF})`), `${article.key}: no link to the Spain calendar`);
    for (const locale of ["ca", "en"] as const) assert.ok(!JSON.stringify(article.editions[locale].blocks).includes(STRIKES_SPAIN_HREF), `${article.key}/${locale}`);
  }
});

test("the publish route has huelgas-espana and huelgas-espana-links, and the strikes groups republish the calendar", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ STRIKES_SPAIN_GUIDE \} from "@\/lib\/content\/batch02\/strikes-spain";/);
  assert.match(route, /wants\("huelgas-espana"\)\) published\.push\(await publishB2SpanishArticle\(STRIKES_SPAIN_GUIDE\)\)/);
  assert.match(route, /wants\("huelgas-espana-links"\)\) published\.push\(await publishB2Article\(STRIKES_GUIDE\), await publishB2Article\(STRIKE_11N\)\)/);
  const strikes = route.slice(route.indexOf('if (wants("strikes"))'), route.indexOf('if (wants("strike-renfe"))'));
  assert.match(strikes, /publishB2SpanishArticle\(STRIKES_SPAIN_GUIDE\)/);
});
