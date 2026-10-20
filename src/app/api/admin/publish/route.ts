import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { pingIndexNow } from "@/lib/seo/indexnow";
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
import { publishB2Article, publishBatch02 } from "@/lib/content/batch02/publish";
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
import { PARKING, TRANSPORT } from "@/lib/content/batch02/barcelona-practical";
import { ELECTION_NIGHT } from "@/lib/content/batch02/election-night";
import { CONGRESS_RESULTS, PARLIAMENT_RESULTS } from "@/lib/content/batch02/election-results";
import { publishHolidayTodayGuide } from "@/lib/content/holidays/today-publish";
import { publishLocalHolidaysGuide } from "@/lib/content/holidays/local-publish";
import { publishReservoirGuide } from "@/lib/content/reservoirs/publish";
import { publishSchoolCalendarGuide } from "@/lib/content/school/publish";
import { authoriseDeployRequest, describeError } from "@/lib/admin/deploy-auth";

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
    const pages = wants("pages") ? await publishInstitutionalPages() : { pages: [] };
    if (wants("features")) published.push(...(await publishFeatures()));
    if (wants("features-a")) published.push(...(await publishFeatures(0, 5)));
    if (wants("features-b")) published.push(...(await publishFeatures(5, 10)));
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
    if (wants("transport")) published.push(await publishB2Article(TRANSPORT));
    if (wants("parking")) published.push(await publishB2Article(PARKING));
    if (wants("election-night")) published.push(await publishB2Article(ELECTION_NIGHT));
    if (wants("family-markets")) published.push(await publishB2Article(ZOO_AQUARIUM), await publishB2Article(MARKETS));
    if (wants("cruiseport")) published.push(await publishB2Article(CRUISEPORT));
    if (wants("portaventura")) published.push(await publishB2Article(PORTAVENTURA));
    if (wants("hills")) published.push(await publishB2Article(MONTJUIC), await publishB2Article(TIBIDABO));
    if (wants("election-results")) published.push(await publishB2Article(CONGRESS_RESULTS), await publishB2Article(PARLIAMENT_RESULTS));
    if (wants("coast-trips")) published.push(await publishB2Article(SITGES), await publishB2Article(TARRAGONA));
    if (wants("batch02-a")) published.push(...(await publishBatch02(0, 3)));
    if (wants("batch02-b")) published.push(...(await publishBatch02(3, 6)));
    if (wants("batch02-c")) published.push(...(await publishBatch02(6, 9)));

    const surfaces = [
      ...published.flatMap((article) =>
        article.editions.map((edition) => ({ locale: edition.locale, path: edition.path })),
      ),
      ...pages.pages.map((page) => ({ locale: page.locale, path: page.path })),
    ];

    for (const surface of surfaces) {
      revalidatePath(`/${surface.locale}`);
      revalidatePath(`/${surface.locale}/${surface.path}`);
      const section = surface.path.split("/")[0];
      if (section) revalidatePath(`/${surface.locale}/${section}`);
    }
    revalidatePath("/sitemap.xml");

    // Bing and ChatGPT search find the change in minutes, not days.
    const indexNow = await pingIndexNow(surfaces.map((surface) => `/${surface.locale}/${surface.path}`));

    return NextResponse.json({ ok: true, seed, published, pages: pages.pages.length, indexNow });
  } catch (error) {
    return NextResponse.json({ ok: false, error: describeError(error) }, { status: 500 });
  }
}
