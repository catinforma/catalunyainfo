import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { seedTaxonomy } from "@/lib/content/seed-taxonomy";
import { publishWeekendGuide } from "@/lib/content/weekend/publish";
import { publishMushroomReport } from "@/lib/content/mushrooms/publish";
import { publishAutumnColours } from "@/lib/content/autumn/publish";
import { publishInstitutionalPages } from "@/lib/content/pages/publish";
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

  try {
    const seed = await seedTaxonomy();
    const published = [
      await publishWeekendGuide(),
      await publishMushroomReport(),
      await publishAutumnColours(),
    ];
    const pages = await publishInstitutionalPages();

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
