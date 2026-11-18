import { embedResponse, notFoundResponse } from "@/lib/programmatic/embed-2027/response";
import { embedTownStaticParams, isEmbedLocale, resolveEmbedTown } from "@/lib/programmatic/embed-2027/places";

/**
 * /embed/<locale>/2026/<municipi>/ — a Catalan town's 2026 work calendar (the
 * year's DOGC order) as a bare HTML document, for other websites' <iframe>
 * (lib/programmatic/embed-2027/). The Spanish cities have no 2026 widget.
 *
 * Cached like the 2027 widget: built once per town on its first request and
 * kept until the next deploy (`force-static`); Barcelona is built at deploy in
 * the three languages. Headers come from next.config.ts (`EMBED_SOURCE`).
 */
export const dynamic = "force-static";
export const revalidate = false;
export const dynamicParams = true;

export function generateStaticParams() {
  return embedTownStaticParams();
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; place: string }> }) {
  const { locale, place } = await params;
  const found = resolveEmbedTown(locale, place);
  return found && isEmbedLocale(locale) ? embedResponse(locale, found, 2026) : notFoundResponse();
}
