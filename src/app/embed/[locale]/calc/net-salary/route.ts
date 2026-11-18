import { renderNetSalaryEmbed } from "@/lib/programmatic/embed-calc/net-salary";
import { isCalcEmbedLocale } from "@/lib/programmatic/embed-calc/paths";
import { calcEmbedResponse, calcNotFound } from "@/lib/programmatic/embed-calc/response";

/**
 * /embed/<locale>/calc/net-salary/ — the net salary calculator as a bare HTML
 * document for other websites' <iframe> (lib/programmatic/embed-calc/). A GET
 * form, no script: each submission is answered here with the result, so the
 * route runs per request (not cached by Next: it reads the query). Headers
 * (frame-ancestors *, form-action 'self', noindex) come from next.config.ts.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isCalcEmbedLocale(locale)) return calcNotFound();
  const search = new URL(request.url).searchParams;
  return calcEmbedResponse(renderNetSalaryEmbed(locale, search), search.size > 0);
}
