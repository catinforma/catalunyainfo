import { embedResponse, notFoundResponse } from "@/lib/programmatic/embed-2027/response";
import { embedTownStaticParams, isEmbedLocale, resolveEmbedTown } from "@/lib/programmatic/embed-2027/places";

/**
 * /embed/<locale>/2027/<municipi>/ — a Catalan town's 2027 work calendar as a
 * bare HTML document, for other websites' <iframe> (lib/programmatic/embed-2027/).
 *
 * Cached like the town pages: built once per place on its first request and
 * kept until the next deploy, which is when its data can change
 * (`force-static`: a GET handler is not cached otherwise). Barcelona is built
 * at deploy in the three languages. Headers (frame-ancestors *, no
 * X-Frame-Options, noindex) come from next.config.ts.
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
  return found && isEmbedLocale(locale) ? embedResponse(locale, found) : notFoundResponse();
}
