import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";

import { pingIndexNow } from "@/lib/seo/indexnow";
import { purgeCdnPaths } from "@/lib/cdn/purge";
import { allIndexablePaths } from "@/lib/content/repository";

import { seedTaxonomy } from "@/lib/content/seed-taxonomy";
import { publishWeekendGuide } from "@/lib/content/weekend/publish";
import { publishMushroomReport } from "@/lib/content/mushrooms/publish";
import { publishAutumnColours } from "@/lib/content/autumn/publish";
import { publishInstitutionalPages } from "@/lib/content/pages/publish";
import { publishFeatures } from "@/lib/content/features/publish";
import { publishHolidayGuide } from "@/lib/content/holidays/publish";
import { publishTouristTaxGuide } from "@/lib/content/tourist-tax/publish";
import { publishMushroomZones } from "@/lib/content/mushroom-zones/publish";
import { publishB2Article, publishB2UnkeyedArticle, publishBatch02 } from "@/lib/content/batch02/publish";
import { AIRPORT } from "@/lib/content/batch02/airport";
import { MONUMENTS } from "@/lib/content/batch02/monuments";
import { SKI } from "@/lib/content/batch02/ski";
import { MUSEUMS } from "@/lib/content/batch02/museums";
import { CARDS } from "@/lib/content/batch02/cards";
import { CAMPNOU } from "@/lib/content/batch02/campnou";
import { HOURS } from "@/lib/content/batch02/hours";
import { SITGES, TARRAGONA } from "@/lib/content/batch02/coast-trips";
import { VOTING } from "@/lib/content/batch02/voting";
import { FIGUERES } from "@/lib/content/batch02/figueres";
import { ANDORRA } from "@/lib/content/batch02/andorra";
import { MONTJUIC, TIBIDABO } from "@/lib/content/batch02/hills";
import { CRUISEPORT } from "@/lib/content/batch02/cruiseport";
import { PORTAVENTURA } from "@/lib/content/batch02/portaventura";
import { MARKETS, ZOO_AQUARIUM } from "@/lib/content/batch02/family-markets";
import { BARCELONA_HUB } from "@/lib/content/batch02/barcelona-hub";
import { CLOCK_CHANGE } from "@/lib/content/batch02/clock-change";
import { NURIA } from "@/lib/content/batch02/nuria";
import { BEACHES_GUIDE } from "@/lib/content/batch02/beaches";
import { MESA } from "@/lib/content/batch02/mesa";
import { MUNICIPAL_RESULTS } from "@/lib/content/batch02/municipal-results";
import { CLIMATE } from "@/lib/content/batch02/climate";
import { SHOPS } from "@/lib/content/batch02/shops";
import { CHRISTMAS } from "@/lib/content/batch02/christmas";
import { PESSEBRES } from "@/lib/content/batch02/pessebres";
import { CHRISTMAS_BARCELONA } from "@/lib/content/batch02/christmas-barcelona";
import { NEW_YEAR } from "@/lib/content/batch02/new-year";
import { SNOW_NOW } from "@/lib/content/batch02/snow-now";
import { SNOW } from "@/lib/content/batch02/snow-trips";
import { PARKING, TRANSPORT, ZBE } from "@/lib/content/batch02/barcelona-practical";
import { ELECTION_NIGHT } from "@/lib/content/batch02/election-night";
import { CONGRESS_RESULTS, PARLIAMENT_RESULTS } from "@/lib/content/batch02/election-results";
import { CANDIDATES } from "@/lib/content/batch02/candidates";
import { CALCOTS } from "@/lib/content/batch02/calcots";
import { CHRISTMAS_TRADITIONS } from "@/lib/content/batch02/christmas-traditions";
import { DECEMBER_BRIDGE } from "@/lib/content/batch02/december-bridge";
import { DECEMBER_BRIDGE_SPAIN } from "@/lib/content/batch02/december-bridge-spain";
import { MARATO_GUIDE } from "@/lib/content/batch02/marato";
import { STRIKES_GUIDE } from "@/lib/content/batch02/strikes";
import { STRIKE_11N } from "@/lib/content/batch02/strike-11n";
import { STRIKE_EDUCATION_GUIDE, STRIKE_RENFE_GUIDE } from "@/lib/content/batch02/strike-guides";
import { STRIKE_11N_CITY_ARTICLES } from "@/lib/content/batch02/strike-11n-cities";
import { STRIKES_SPAIN_GUIDE } from "@/lib/content/batch02/strikes-spain";
import { RAIL_17N_GUIDE } from "@/lib/content/batch02/strike-rail-17n";
import { STRIKE_11N_SPAIN } from "@/lib/content/batch02/strike-11n-spain";
import { PAY_DATES } from "@/lib/content/batch02/pay-dates";
import { SHOPS_SPAIN_DECEMBER } from "@/lib/content/batch02/shops-spain-december";
import { GROSSA } from "@/lib/content/batch02/grossa";
import { EASTER_2027 } from "@/lib/content/batch02/easter-2027";
import { BRIDGES_2027 } from "@/lib/content/batch02/bridges-2027";
import { LOTERIA_NADAL } from "@/lib/content/batch02/loteria-nadal";
import { BARCELONA_DECEMBER } from "@/lib/content/batch02/barcelona-december";
import { REIS } from "@/lib/content/batch02/reis";
import { L2_CLOSURE_GUIDE } from "@/lib/content/batch02/l2-closure";
import { CHRISTMAS_LIGHTS } from "@/lib/content/batch02/christmas-lights";
import { GRAN_RECAPTE_GUIDE } from "@/lib/content/batch02/gran-recapte";
import { CHRISTMAS_TRANSPORT } from "@/lib/content/batch02/christmas-transport";
import { SCHOOL_FREE_DAYS } from "@/lib/content/batch02/school-free-days";
import { POSTAL_VOTE } from "@/lib/content/batch02/postal-vote";
import { FOREIGN_VOTE } from "@/lib/content/batch02/foreign-vote";
import { PADRO } from "@/lib/content/batch02/padro";
import { CARNIVAL_GUIDE } from "@/lib/content/batch02/carnival";
import { TSI_GUIDE } from "@/lib/content/batch02/tsi";
import { NIE_TIE_GUIDE } from "@/lib/content/batch02/nie-tie";
import { publishHolidayTodayGuide } from "@/lib/content/holidays/today-publish";
import { publishLocalHolidaysGuide } from "@/lib/content/holidays/local-publish";
import { publishReservoirGuide } from "@/lib/content/reservoirs/publish";
import { publishSchoolCalendarGuide } from "@/lib/content/school/publish";
import { publishSpainSchoolCalendars } from "@/lib/content/school-spain/publish";
import { editionHubPath, editionPaths } from "@/lib/programmatic/spain-2027/editions";
import { spainDayPaths, spainHubPath, spainPaths } from "@/lib/programmatic/spain-2027/paths";
import { widgetEditions } from "@/lib/programmatic/embed-2027/places";
import { gordoPaths } from "@/lib/programmatic/gordo/sitemap";
import { authoriseDeployRequest, describeError } from "@/lib/admin/deploy-auth";
import { revalidateSitemapAndFeeds } from "@/lib/seo/revalidate-feeds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Seeds the taxonomy and publishes every article that ships as code.
 *
 * Each piece lives on three evergreen URLs, so this is also how a refreshed
 * edition goes out: update the payload, deploy, call this once. It is
 * idempotent - the same rows are upserted - and it revalidates every cached
 * surface the pages appear on so the change is live immediately rather than at
 * the next ISR window.
 */
/** Keyed publish groups for the institutional pages (entries.key). */
const INSTITUTIONAL_PAGE_GROUPS: Record<string, readonly string[]> = {
  "about-page": ["page-about"],
  "legal-notice": ["page-legal-notice"],
  "privacy-cookies": ["page-privacy", "page-cookies"],
  "editorial-policy": ["page-editorial-policy"],
  "legal-hub": ["page-legal-hub"],
  "accessibility-page": ["page-accessibility"],
  "contact-page": ["page-contact"],
  // The AdSense advertising disclosure (11 Nov 2026): every page whose wording
  // it changed. Leaves corrections and sources alone.
  "ads-disclosure": [
    "page-privacy",
    "page-cookies",
    "page-legal-notice",
    "page-editorial-policy",
    "page-legal-hub",
    "page-accessibility",
    "page-about",
    "page-contact",
  ],
};

export async function POST(request: Request) {
  if (!authoriseDeployRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // `?only=` publishes one group at a time. Publishing everything is well over
  // twenty articles in three languages, which does not reliably fit inside the
  // function's time limit - and a publish that times out half way is worse than
  // one that never started.
  const only = new URL(request.url).searchParams.get("only") ?? "all";
  const wants = (group: string) => only === "all" || only === group;

  try {
    // One-off: submit every indexable URL to IndexNow (Bing, Yandex, Seznam…).
    if (only === "indexnow-all") {
      const rows = await allIndexablePaths();
      const homes = ["/ca", "/es", "/en"];
      return NextResponse.json({ ok: true, indexNow: await pingIndexNow([...homes, ...rows.map((row) => `/${row.locale}/${row.path}`)]) });
    }

    const seed = wants("taxonomy") || only === "all" ? await seedTaxonomy() : null;
    const published = [];
    if (wants("articles")) {
      published.push(await publishHolidayGuide());
      published.push(await publishHolidayTodayGuide());
      published.push(await publishTouristTaxGuide());
      published.push(await publishWeekendGuide());
      published.push(await publishMushroomReport());
      published.push(await publishAutumnColours());
    }
    // On its own so a status update does not republish the guides that are
    // mid title-experiment along with it.
    if (only === "autumn") published.push(await publishAutumnColours());
    // `pages` republishes all ten institutional pages and overwrites any CMS
    // edit on them; a keyed group touches only the pages it names.
    const pageKeys = Object.hasOwn(INSTITUTIONAL_PAGE_GROUPS, only) ? INSTITUTIONAL_PAGE_GROUPS[only] : undefined;
    const pages = wants("pages")
      ? await publishInstitutionalPages()
      : pageKeys
        ? await publishInstitutionalPages(pageKeys)
        : { pages: [] };
    if (wants("features")) published.push(...(await publishFeatures()));
    if (wants("features-a")) published.push(...(await publishFeatures(0, 5)));
    if (wants("features-b")) published.push(...(await publishFeatures(5, 10)));
    // Index 5 of FEATURES; republishes the Castanyada alone.
    if (wants("castanyada")) published.push(...(await publishFeatures(5, 6)));
    // Montserrat, traps and surprising places without the Castanyada beside them.
    if (wants("features-c")) published.push(...(await publishFeatures(6, 9)));
    if (wants("rainy")) published.push(...(await publishFeatures(9, 10)));
    if (wants("holidays")) published.push(await publishHolidayGuide());
    if (wants("holiday-today")) published.push(await publishHolidayTodayGuide());
    if (wants("local-holidays")) published.push(await publishLocalHolidaysGuide());
    if (wants("reservoirs")) published.push(await publishReservoirGuide());
    if (wants("school-calendar")) published.push(await publishSchoolCalendarGuide());
    if (wants("tourist-tax")) published.push(await publishTouristTaxGuide());
    // The weekly refresh: one article, so it never waits on the other five.
    if (wants("mushrooms")) published.push(await publishMushroomReport());
    // Empty registry until an editorial package adds a zone; publishes nothing.
    if (wants("mushroom-zones") || only === "all") published.push(...(await publishMushroomZones()));
    // Nine articles in three languages does not fit in one function call, so
    // the batch is sliced the same way the feature batch is.
    if (wants("batch02")) published.push(...(await publishBatch02()));
    if (wants("airport")) published.push(await publishB2Article(AIRPORT));
    if (wants("monuments")) published.push(await publishB2Article(MONUMENTS));
    if (wants("ski")) published.push(await publishB2Article(SKI));
    if (wants("museums")) published.push(await publishB2Article(MUSEUMS));
    if (wants("cards")) published.push(await publishB2Article(CARDS));
    if (wants("campnou")) published.push(await publishB2Article(CAMPNOU));
    if (wants("hours")) published.push(await publishB2Article(HOURS));
    if (wants("voting")) published.push(await publishB2Article(VOTING));
    if (wants("figueres")) published.push(await publishB2Article(FIGUERES));
    if (wants("andorra")) published.push(await publishB2Article(ANDORRA));
    if (wants("barcelona-hub")) published.push(await publishB2Article(BARCELONA_HUB));
    if (wants("clock-change")) published.push(await publishB2Article(CLOCK_CHANGE));
    if (wants("nuria")) published.push(await publishB2Article(NURIA));
    if (wants("beaches")) published.push(await publishB2Article(BEACHES_GUIDE));
    if (wants("mesa")) published.push(await publishB2Article(MESA));
    if (wants("municipal-results")) published.push(await publishB2Article(MUNICIPAL_RESULTS));
    if (wants("climate")) published.push(await publishB2Article(CLIMATE));
    if (wants("shops")) published.push(await publishB2Article(SHOPS));
    if (wants("christmas")) published.push(await publishB2Article(CHRISTMAS));
    // Living nativities: the calendar block reads the agenda live; this
    // publishes the guide around it.
    if (wants("pessebres")) published.push(await publishB2Article(PESSEBRES));
    // Christmas in Barcelona hub and New Year's Eve: dated-fact pages, one
    // group each so a newly announced date republishes only its own page.
    if (wants("christmas-bcn")) published.push(await publishB2Article(CHRISTMAS_BARCELONA));
    if (wants("nye")) published.push(await publishB2Article(NEW_YEAR));
    // Catalan Christmas traditions (tió, caganer, Sant Esteve): mostly
    // evergreen; republish when Santa Llúcia or the Pastorets season is out.
    if (wants("nadal-tradicions")) published.push(await publishB2Article(CHRISTMAS_TRADITIONS));
    // The live snow-depth page, plus the ski and snow guides that now link to it.
    if (wants("snow-now")) published.push(await publishB2Article(SNOW_NOW), await publishB2Article(SKI), await publishB2Article(SNOW));
    if (wants("transport")) published.push(await publishB2Article(TRANSPORT));
    if (wants("parking")) published.push(await publishB2Article(PARKING));
    // The low-emission zone guide on its own (it was only reachable through
    // batch02-a, which also republishes the transport and Girona guides).
    if (wants("zbe")) published.push(await publishB2Article(ZBE));
    if (wants("election-night")) published.push(await publishB2Article(ELECTION_NIGHT));
    // 29N candidates: the lists are read from the BOE at render time; this
    // publishes the guide around them (re-running it also refreshes the page).
    if (wants("candidates")) published.push(await publishB2Article(CANDIDATES));
    // Calçots and the Valls Calçotada 2027, plus the food-fairs feature
    // (index 4 of FEATURES) that gained one sentence linking to it.
    if (wants("calcots")) published.push(await publishB2Article(CALCOTS), ...(await publishFeatures(4, 5)));
    // December bridge 2026 and La Marató 2026, one group each, each with the
    // one existing page that gained a link to it (the holiday calendar; the
    // Christmas in Barcelona hub).
    if (wants("pont-desembre")) published.push(await publishB2Article(DECEMBER_BRIDGE), await publishHolidayGuide());
    if (wants("marato")) published.push(await publishB2Article(MARATO_GUIDE), await publishB2Article(CHRISTMAS_BARCELONA));
    // Strikes hub: one evergreen page, republished every time a strike or its
    // minimum services are added. The metro-hours and transport-passes guides
    // gained one body link to it; they go out once, on their own group, so a
    // strike update never republishes two pages under a title experiment.
    // 4 Nov 2026: the strike guides (Renfe 10/12 Nov, education 26 Nov) are
    // rendered from the same entries in strikes.ts, so the group the strike
    // watch runs after every update republishes them with the hub. One group
    // each too, for a guide on its own.
    // 6 Nov 2026: the Spain-wide calendar (huelgas-espana) reads the Catalan
    // strikes and the 11N minimum services from the same modules, so it goes
    // out with `strikes` and `strike-11n` too and never lags behind them.
    if (wants("strikes")) {
      published.push(
        await publishB2Article(STRIKES_GUIDE),
        await publishB2Article(STRIKE_RENFE_GUIDE),
        await publishB2Article(STRIKE_EDUCATION_GUIDE),
        await publishB2Article(STRIKES_SPAIN_GUIDE),
        // 13 Nov 2026: the 17 Nov rail strike across Spain, built from the same entries.
        await publishB2Article(RAIL_17N_GUIDE),
      );
    }
    if (wants("strike-renfe")) published.push(await publishB2Article(STRIKE_RENFE_GUIDE));
    // 13 Nov 2026: "Huelga de trenes del 17 de noviembre en España" on its own
    // (also in `strikes`). The 11N Spain and city pages now link it from their
    // "upcoming strikes" list: they go out once with `strike-11n-cities`.
    if (wants("huelga-trenes-17n")) published.push(await publishB2Article(RAIL_17N_GUIDE));
    if (wants("strike-educacio")) published.push(await publishB2Article(STRIKE_EDUCATION_GUIDE));
    if (wants("strikes-links")) published.push(await publishB2Article(HOURS), await publishB2Article(TRANSPORT));
    // The 11 November 2026 general strike's own page, with the strikes hub,
    // which links to it (one sentence) and carries the same minimum-services
    // status: every 11N update goes out on both at once.
    if (wants("strike-11n")) published.push(await publishB2Article(STRIKE_11N), await publishB2Article(STRIKES_GUIDE), await publishB2Article(STRIKES_SPAIN_GUIDE));
    // 10 Nov 2026: "Huelgas en España", the Spain-wide strikes calendar, in
    // three languages (/es/guias/huelgas-espana/, /ca/guies/vagues-espanya/,
    // /en/guides/strikes-spain/; facts in strikes-spain-data.ts). On its own
    // so a state-wide call or a Ministry resolution republishes only it. The
    // Catalan strikes hub (one sentence linking to it, in each language) and
    // the 11N page (one sentence in its Spanish callout) go out once with
    // `huelgas-espana-links`.
    if (wants("huelgas-espana")) published.push(await publishB2Article(STRIKES_SPAIN_GUIDE));
    if (wants("huelgas-espana-links")) published.push(await publishB2Article(STRIKES_GUIDE), await publishB2Article(STRIKE_11N));
    // 6 Nov 2026: the 11N general strike city by city (Madrid, Valencia,
    // Sevilla…), rendered from strike-11n-cities-data.ts; in Catalan and
    // English too since 10 Nov 2026 (strike-11n-cities-i18n/), every edition
    // in one entry. On its own so a regional order or a demonstration
    // republishes only these pages; the 11N page and the strikes hub, which
    // link to every Spanish one, go out with `strike-11n`. The halves `-a`
    // and `-b` are for a retry after a timeout.
    if (wants("strike-11n-cities")) {
      for (const article of STRIKE_11N_CITY_ARTICLES) published.push(await publishB2UnkeyedArticle(article));
      // 9 Nov 2026: the Spain-wide page, built from the same registry (ca, es and en since 10 Nov).
      published.push(await publishB2UnkeyedArticle(STRIKE_11N_SPAIN));
    }
    if (wants("strike-11n-cities-a")) {
      for (const article of STRIKE_11N_CITY_ARTICLES.slice(0, 7)) published.push(await publishB2UnkeyedArticle(article));
    }
    if (wants("strike-11n-cities-b")) {
      for (const article of STRIKE_11N_CITY_ARTICLES.slice(7)) published.push(await publishB2UnkeyedArticle(article));
      published.push(await publishB2UnkeyedArticle(STRIKE_11N_SPAIN));
    }
    // 9 Nov 2026: when the dole and pensions are paid (SEPE, Social Security); ca, es and en since 10 Nov.
    if (wants("pagos")) published.push(await publishB2Article(PAY_DATES));
    // 13 Nov 2026: evergreen flagships. How to register on the padró (ca, es, en),
    // on its own; the foreign-vote guide and the Barcelona hub, which gained one
    // sentence linking to it, go out once with `padro-links`.
    if (wants("padro")) published.push(await publishB2Article(PADRO));
    if (wants("padro-links")) published.push(await publishB2Article(FOREIGN_VOTE), await publishB2Article(BARCELONA_HUB));
    // 13 Nov 2026: Carnival 2027 in Catalonia, on its own so each organiser's
    // programme (PROGRAMMES_2027) and the DOGC local-holiday order republish only
    // it. The Sitges day trip and the calçots guide link to it: `carnaval-links`.
    if (wants("carnaval")) published.push(await publishB2Article(CARNIVAL_GUIDE));
    if (wants("carnaval-links")) published.push(await publishB2Article(SITGES), await publishB2Article(CALCOTS));
    // 13 Nov 2026: the TSI health card (ca, es, en), on its own. The padró guide
    // and the Barcelona hub gained a link to it (the hub also got the English
    // Montserrat anchor in the query's words): `tsi-links`.
    if (wants("tsi")) published.push(await publishB2Article(TSI_GUIDE));
    if (wants("tsi-links")) published.push(await publishB2Article(PADRO), await publishB2Article(BARCELONA_HUB));
    // 13 Nov 2026: NIE, TIE and the EU registration certificate (ca, es, en), on
    // its own. The padró and TSI guides and the Barcelona hub gained a link to
    // it: `nie-tie-links`.
    if (wants("nie-tie")) published.push(await publishB2Article(NIE_TIE_GUIDE));
    if (wants("nie-tie-links")) published.push(await publishB2Article(PADRO), await publishB2Article(TSI_GUIDE), await publishB2Article(BARCELONA_HUB));
    // 13 Nov 2026: the Montserrat guide (index 3 of BATCH_02) on its own, for the
    // cable car vs rack railway vs car/coach upgrade; `montserrat-links` sends
    // the two pages whose English anchor text changed (Beyond Montserrat,
    // index 6 of FEATURES, and Christmas in Barcelona).
    if (wants("montserrat")) published.push(...(await publishBatch02(3, 4)));
    if (wants("montserrat-links")) published.push(...(await publishFeatures(6, 7)), await publishB2Article(CHRISTMAS_BARCELONA));
    // 13 Nov 2026: evergreen wave 3. The snow-without-skiing guide (snow-trips.ts)
    // on its own, upgraded in place (by train, chains, avalanche bulletin);
    // `snow-now` still republishes it with the ski guide. The calçots guide's
    // at-home upgrade goes out with its existing `calcots` group.
    if (wants("neu")) published.push(await publishB2Article(SNOW));
    // 9 Nov 2026: shops open on 6, 7 and 8 December by community (Ministry calendar); ca, es and en since 10 Nov.
    if (wants("tiendas-espana")) published.push(await publishB2Article(SHOPS_SPAIN_DECEMBER));
    // La Grossa de Cap d'Any 2026: one page, on its own so the 31 December
    // results go out in one fast call. The New Year's Eve guide gained one
    // sentence linking to it; that goes out once with `nye`.
    if (wants("grossa")) published.push(await publishB2Article(GROSSA));
    // Easter 2027: one page, on its own so the updates it is waiting for (the
    // DOGC local-holiday order, the 2027 municipal shop days) republish only
    // it. The work calendar and school calendar guides gained one sentence
    // linking to it; they go out once with `holidays` and `school-calendar`.
    if (wants("setmana-santa-2027")) published.push(await publishB2Article(EASTER_2027));
    // Ponts / puentes 2027: every bridge computed from Ordre EMT/52/2026, and
    // the local bridges of the largest towns. On its own so the day the DOGC
    // local order is parsed (local-2027.json), a deploy plus this group
    // switches its town table from the councils' days to the order's.
    if (wants("ponts-2027")) published.push(await publishB2Article(BRIDGES_2027));
    // The two existing pages that gained one sentence linking to it (the
    // December bridge and the work calendar); goes out once, on its own, so a
    // refresh of the 2027 page never republishes them. The holidays hubs are
    // code routes: their sentence ships with the deploy.
    if (wants("ponts-2027-links")) published.push(await publishB2Article(DECEMBER_BRIDGE), await publishHolidayGuide());
    // The Spanish Christmas lottery 2026: one page, on its own so the 22
    // December results and Catalan points of sale go out in one fast call.
    // The three pages that gained one sentence linking to it (La Grossa, New
    // Year's Eve, Christmas in Barcelona) go out once, after it, with
    // `loteria-nadal-links`.
    if (wants("loteria-nadal")) published.push(await publishB2Article(LOTERIA_NADAL));
    if (wants("loteria-nadal-links")) {
      published.push(await publishB2Article(GROSSA), await publishB2Article(NEW_YEAR), await publishB2Article(CHRISTMAS_BARCELONA));
    }
    // Barcelona in December 2026: the dated hub for the month, on its own so a
    // newly announced date (lights, Santa Llúcia, the New Year's Eve show, La
    // Grossa's time) republishes only this page. The three pages that gained
    // one sentence linking to it go out once, with `barcelona-december-links`.
    if (wants("barcelona-december")) published.push(await publishB2Article(BARCELONA_DECEMBER));
    if (wants("barcelona-december-links")) {
      published.push(
        await publishB2Article(CHRISTMAS_BARCELONA),
        await publishB2Article(CLIMATE),
        await publishB2Article(DECEMBER_BRIDGE),
      );
    }
    // Rodalies live status (/ca/rodalies/ and the line pages are code routes,
    // not articles): the four guides that gained one body link to them.
    if (wants("rodalies-links")) {
      published.push(
        await publishB2Article(TRANSPORT),
        await publishB2Article(HOURS),
        await publishB2Article(AIRPORT),
        await publishB2Article(STRIKES_GUIDE),
      );
    }
    // Weekend zone pages (/ca/cap-de-setmana/, /es/fin-de-semana/ are code
    // routes, not articles): the Christmas markets guide gained one body link.
    if (wants("weekend-links")) published.push(await publishB2Article(CHRISTMAS));
    if (wants("family-markets")) published.push(await publishB2Article(ZOO_AQUARIUM), await publishB2Article(MARKETS));
    if (wants("cruiseport")) published.push(await publishB2Article(CRUISEPORT));
    if (wants("portaventura")) published.push(await publishB2Article(PORTAVENTURA));
    if (wants("hills")) published.push(await publishB2Article(MONTJUIC), await publishB2Article(TIBIDABO));
    if (wants("election-results")) published.push(await publishB2Article(CONGRESS_RESULTS), await publishB2Article(PARLIAMENT_RESULTS));
    if (wants("coast-trips")) published.push(await publishB2Article(SITGES), await publishB2Article(TARRAGONA));
    if (wants("batch02-a")) published.push(...(await publishBatch02(0, 3)));
    // Index 2 of BATCH_02; Girona without the transport and ZBE guides.
    if (wants("girona")) published.push(...(await publishBatch02(2, 3)));
    if (wants("batch02-b")) published.push(...(await publishBatch02(3, 6)));
    if (wants("batch02-c")) published.push(...(await publishBatch02(6, 9)));
    // Cavalcada de Reis 2027 (Barcelona and the larger towns): one page, on
    // its own so each council's programme (Barcelona's arrival and start in
    // November, its route around 2 January) republishes only it. The four
    // pages that gained one sentence linking to it (Christmas in Barcelona and
    // New Year's Eve through the shared cavalcada sentence, Christmas
    // traditions, Barcelona in December) go out once, with `reis-2027-links`.
    if (wants("reis-2027")) published.push(await publishB2Article(REIS));
    if (wants("reis-2027-links")) {
      published.push(
        await publishB2Article(CHRISTMAS_BARCELONA),
        await publishB2Article(NEW_YEAR),
        await publishB2Article(CHRISTMAS_TRADITIONS),
        await publishB2Article(BARCELONA_DECEMBER),
      );
    }
    // Metro L2 closed between La Pau and Gorg (TMB, 2 Nov - 3 Dec 2026): one
    // page, on its own so a change of dates or the reopening republishes only
    // it. The metro hours and transport cards guides gained one sentence each
    // (read from l2-closure.ts) and go out with their own groups, `hours` and
    // `cards`, after this one and again after the reopening.
    if (wants("l2-closure")) published.push(await publishB2Article(L2_CLOSURE_GUIDE));
    // Christmas lights switch-on 2026 (Barcelona and 25 towns): one page, on
    // its own so Barcelona's date (festive.ts ANNOUNCED_2026.lightsSwitchOn)
    // or a town's (christmas-lights-towns.ts) republishes only it. The two
    // pages that gained one body sentence linking to it (Christmas in
    // Barcelona, the Christmas markets guide) go out once, with
    // `llums-nadal-links`; their titles are inside the 3 Nov window.
    if (wants("llums-nadal")) published.push(await publishB2Article(CHRISTMAS_LIGHTS));
    if (wants("llums-nadal-links")) published.push(await publishB2Article(CHRISTMAS_BARCELONA), await publishB2Article(CHRISTMAS));
    // Gran Recapte d'Aliments 2026 (13-14 Nov): one page, on its own so the
    // 2026 results, once the organisers publish them, republish only it. The
    // two pages that gained one body sentence linking to it (La Marató, the
    // Barcelona markets guide) go out once, with `gran-recapte-links`.
    if (wants("gran-recapte")) published.push(await publishB2Article(GRAN_RECAPTE_GUIDE));
    if (wants("gran-recapte-links")) published.push(await publishB2Article(MARATO_GUIDE), await publishB2Article(MARKETS));
    // Transport over Christmas, New Year and Reis 2026-27 (metro, bus,
    // NitBus, Rodalies, FGC, tram): one page, on its own so each operator's
    // 2026-27 notice (christmas-transport.ts) republishes only it. The two
    // pages that gained one body sentence linking to it (New Year's Eve, the
    // metro hours guide; titles untouched, the EN hours description is in the
    // 3 Nov window) go out once, with `transport-nadal-links`.
    if (wants("transport-nadal")) published.push(await publishB2Article(CHRISTMAS_TRANSPORT));
    if (wants("transport-nadal-links")) published.push(await publishB2Article(NEW_YEAR), await publishB2Article(HOURS));
    // School free days 2026-2027 town by town (is there school on Monday
    // 7 December?): one page, on its own so a council's new or changed days
    // (school-free-days-towns.ts) republish only it. The December bridge
    // guide, which gained one body sentence linking to it, goes out once with
    // `lliure-disposicio-links`. The town holiday pages' section is static:
    // it ships with the deploy.
    if (wants("lliure-disposicio")) published.push(await publishB2Article(SCHOOL_FREE_DAYS));
    if (wants("lliure-disposicio-links")) published.push(await publishB2Article(DECEMBER_BRIDGE));
    // Postal vote (29N requests close 19 Nov): one page, on its own so the
    // phase changes (POSTAL_AS_OF past 19 Nov, then past 29 Nov) republish
    // only it. The how-to-vote guide, whose section now links here, goes out
    // with `voting`; the hub and town election pages are code routes.
    if (wants("vot-correu")) published.push(await publishB2Article(POSTAL_VOTE));
    // The December bridge, Christmas and Reyes in every community of Spain
    // (6 Nov 2026): one page, on its own so a regional change or the December
    // 2027 rewrite republishes only it. The Catalan December bridge page,
    // which gained one sentence linking to it, goes out once with
    // `puente-diciembre-espana-links`.
    if (wants("puente-diciembre-espana")) published.push(await publishB2Article(DECEMBER_BRIDGE_SPAIN));
    if (wants("puente-diciembre-espana-links")) published.push(await publishB2Article(DECEMBER_BRIDGE));
    // Foreign residents and the local elections of 23 May 2027 (10 Nov 2026):
    // one page, on its own so its phase changes (FOREIGN_VOTE_AS_OF past
    // 1 Dec, 30 Dec 2026 and 15 Jan 2027, then the March decree) republish
    // only it. The how-to-vote guide and the 2023 municipal results page,
    // which each gained one sentence linking to it, go out once with
    // `voto-extranjeros-2027-links`.
    if (wants("voto-extranjeros-2027")) published.push(await publishB2Article(FOREIGN_VOTE));
    if (wants("voto-extranjeros-2027-links")) published.push(await publishB2Article(VOTING), await publishB2Article(MUNICIPAL_RESULTS));
    // Calendario laboral 2027 en España (/es/festivos/2027/, 19 communities
    // and cities, the hub, the bridges page, and one page per large city,
    // /es/festivos/2027/<comunidad>/<ciudad>/): code routes built from the BOE
    // table and the bulletins, not articles, so the deploy ships them. This
    // group revalidates exactly those paths (each route keeps dynamicParams =
    // true, so this cannot 404 them; never their parent /es/festivos, which
    // is false), purges them at the CDN and sends them to IndexNow. Re-run it
    // after a deploy that changes sources.ts or cities-data.ts (a community's
    // local list published).
    // The same group carries the day pages ("¿Es festivo el 6 de diciembre de
    // 2027?", /es/festivos/2027/dia/…, /ca/festius/2027/dia/…,
    // /en/holidays/2027/day/…), the three editions of each date, and since
    // 10 Nov 2026 the Catalan and English editions of the calendar itself
    // (/ca/festius/2027/..., /en/holidays/2027/..., editions.ts).
    // ¿Dónde ha tocado el Gordo? (/es/donde-ha-tocado-el-gordo/,
    // /ca/on-ha-tocat-la-loteria-de-nadal/, /en/spanish-christmas-lottery-results/):
    // code routes rendered from the committed snapshot
    // (lib/programmatic/gordo/snapshot.json, written by
    // scripts/gordo-snapshot.py), so a new snapshot needs a deploy; this group
    // then revalidates the three hubs and every province and municipality page
    // the snapshot lists (all dynamicParams = true), purges them at the CDN and
    // sends them to IndexNow. Runbook: docs/GORDO_NAVIDAD_RUNBOOK.md. The
    // Christmas lottery guide, which links the hub in its three editions, goes
    // out with `gordo-navidad-links`.
    const gordoCodePaths = wants("gordo-navidad") ? gordoPaths().map((entry) => entry.path) : [];
    if (wants("gordo-navidad-links")) published.push(await publishB2Article(LOTERIA_NADAL));
    const codePaths = [...(wants("calendario-2027-espana") ? [...spainPaths(), ...spainDayPaths(), ...editionPaths()] : []), ...gordoCodePaths];
    // "Posa el calendari laboral 2027 al teu web" (/ca/festius/2027/al-teu-web/,
    // /es/festivos/2027/en-tu-web/, /en/holidays/2027/for-your-website/) and the
    // three 2027 hubs that link it: code routes (dynamicParams = true), shipped
    // by the deploy; this group revalidates, purges and IndexNow-pings them.
    // Never the /embed/ widgets: noindex, and rebuilt by every deploy.
    if (wants("calendari-2027-widget")) codePaths.push(...Object.values(widgetEditions()), spainHubPath(), editionHubPath("ca"), editionHubPath("en"));
    // The Catalan work calendar guide gained one sentence linking to the
    // Spain hub (Spanish edition); it goes out once, on its own.
    if (wants("calendario-2027-espana-links")) published.push(await publishHolidayGuide());
    // Calendario escolar 2026-2027 por comunidades, in Catalan, Spanish and
    // English (one entry, three editions each): the hub
    // /es/guias/calendario-escolar-espana/ (/ca/guies/calendari-escolar-espanya/,
    // /en/guides/spain-school-calendar/) and one guide per community whose
    // order is transcribed in school-spain/data.ts, all articles on the
    // catch-all route (dynamicParams = true, so revalidating them is safe).
    // The live part (today, next break, title) renders from code: a
    // corrected date needs a deploy and then this group. The Catalan school
    // calendar guide, whose three editions each link the hub in their own
    // language, goes out with `calendario-escolar-espana-links`.
    if (wants("calendario-escolar-espana")) published.push(...(await publishSpainSchoolCalendars()));
    if (wants("calendario-escolar-espana-links")) published.push(await publishSchoolCalendarGuide());

    const surfaces = [
      ...published.flatMap((article) =>
        article.editions.map((edition) => ({ locale: edition.locale, path: edition.path })),
      ),
      ...pages.pages.map((page) => ({ locale: page.locale, path: page.path })),
    ];

    const revalidated = new Set<string>();
    const revalidate = (path: string) => {
      revalidatePath(path);
      revalidated.add(path);
    };
    for (const surface of surfaces) {
      revalidate(`/${surface.locale}`);
      revalidate(`/${surface.locale}/${surface.path}`);
      const section = surface.path.split("/")[0];
      if (section) revalidate(`/${surface.locale}/${section}`);
    }
    // Exact paths only: no section or locale-home revalidation for code routes.
    for (const path of codePaths) revalidate(path.replace(/\/$/, ""));
    // The sitemap, the RSS feeds and the Google News sitemap list the same pieces.
    for (const url of revalidateSitemapAndFeeds()) revalidated.add(url);

    // Cloudflare may cache HTML (ops/vps/README.md section 10), and it does not
    // hear revalidatePath: purge the same URLs there. A no-op without a token.
    const cdnPurge = await purgeCdnPaths(revalidated, { label: `publish ${only}` });
    // revalidatePath only takes effect once this handler returns, so a request
    // that reached Cloudflare in between could have cached the old page again.
    // A second purge after the response closes that window.
    if (!cdnPurge.skipped) {
      after(async () => {
        await purgeCdnPaths(revalidated, { label: `publish ${only} (after revalidation)` });
      });
    }

    // Bing and ChatGPT search find the change in minutes, not days.
    const indexNow = await pingIndexNow([...surfaces.map((surface) => `/${surface.locale}/${surface.path}`), ...codePaths]);

    return NextResponse.json({ ok: true, seed, published, pages: pages.pages.length, indexNow, cdnPurge });
  } catch (error) {
    return NextResponse.json({ ok: false, error: describeError(error) }, { status: 500 });
  }
}
