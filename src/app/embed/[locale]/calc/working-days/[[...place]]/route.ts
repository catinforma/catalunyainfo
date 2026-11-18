import { isCalcEmbedLocale } from "@/lib/programmatic/embed-calc/paths";
import { calcEmbedResponse, calcNotFound } from "@/lib/programmatic/embed-calc/response";
import { renderWorkingDaysEmbed, workingDaysPlace } from "@/lib/programmatic/embed-calc/working-days";

/**
 * /embed/<locale>/calc/working-days/[<place id>/] — the working-days
 * calculator as a bare HTML document for other websites' <iframe>
 * (lib/programmatic/embed-calc/): all of Spain without a place, else the
 * calculator's place ids ("barcelona", "catalunya", "madrid/madrid",
 * "andalucia/all"). GET forms, no script; runs per request. Headers come from
 * next.config.ts (`EMBED_CALC_SOURCE`).
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ locale: string; place?: string[] }> }) {
  const { locale, place } = await params;
  if (!isCalcEmbedLocale(locale)) return calcNotFound();
  const item = workingDaysPlace(locale, place);
  if (!item) return calcNotFound();
  const search = new URL(request.url).searchParams;
  return calcEmbedResponse(renderWorkingDaysEmbed(locale, item, search), search.size > 0);
}
