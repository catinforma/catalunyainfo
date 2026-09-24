import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { seedTaxonomy } from "@/lib/content/seed-taxonomy";
import { publishWeekendGuide } from "@/lib/content/weekend/publish";
import { publishMushroomReport } from "@/lib/content/mushrooms/publish";
import { publishAutumnColours } from "@/lib/content/autumn/publish";
import { publishInstitutionalPages } from "@/lib/content/pages/publish";
import { publishFeatures } from "@/lib/content/features/publish";
import { publishHolidayGuide } from "@/lib/content/holidays/publish";
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
    const seed = wants("taxonomy") || only === "all" ? await seedTaxonomy() : null;
    const published = [];
    if (wants("articles")) {
      published.push(await publishHolidayGuide());
      published.push(await publishWeekendGuide());
      published.push(await publishMushroomReport());
      published.push(await publishAutumnColours());
    }
    const pages = wants("pages") ? await publishInstitutionalPages() : { pages: [] };
    if (wants("features")) published.push(...(await publishFeatures()));
    if (wants("features-a")) published.push(...(await publishFeatures(0, 5)));
    if (wants("features-b")) published.push(...(await publishFeatures(5, 10)));
    if (wants("holidays")) published.push(await publishHolidayGuide());

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

    return NextResponse.json({ ok: true, seed, published, pages: pages.pages.length });
  } catch (error) {
    return NextResponse.json({ ok: false, error: describeError(error) }, { status: 500 });
  }
}
