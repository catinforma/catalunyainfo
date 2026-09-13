import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { seedTaxonomy } from "@/lib/content/seed-taxonomy";
import { publishWeekendGuide } from "@/lib/content/weekend/publish";
import { authoriseDeployRequest, describeError } from "@/lib/admin/deploy-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Seeds the taxonomy and publishes the current weekend guide.
 *
 * The guide lives on three evergreen URLs, so this is also how each week's
 * edition goes out: update the payload, deploy, call this once. It is
 * idempotent - the same three rows are upserted - and it revalidates every
 * cached surface the pages appear on so the change is live immediately rather
 * than at the next ISR window.
 */
export async function POST(request: Request) {
  if (!authoriseDeployRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const seed = await seedTaxonomy();
    const publish = await publishWeekendGuide();

    for (const edition of publish.editions) {
      revalidatePath(`/${edition.locale}`);
      revalidatePath(`/${edition.locale}/${edition.path}`);
      revalidatePath(`/${edition.locale}/agenda`);
    }
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ ok: true, seed, publish });
  } catch (error) {
    return NextResponse.json({ ok: false, error: describeError(error) }, { status: 500 });
  }
}
