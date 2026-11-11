import { embedResponse, notFoundResponse } from "@/lib/programmatic/embed-2027/response";
import { embedCityStaticParams, isEmbedLocale, resolveEmbedCity } from "@/lib/programmatic/embed-2027/places";

/**
 * /embed/<locale>/2027/<comunidad>/<ciudad>/ — a Spanish city's 2027 work
 * calendar as a bare HTML document, for other websites' <iframe>
 * (lib/programmatic/embed-2027/). `<comunidad>` is the Spanish edition's
 * community slug in every language.
 *
 * Built once per city on its first request and kept until the next deploy
 * (`force-static`); Madrid is built at deploy in the three languages.
 * Headers come from next.config.ts.
 */
export const dynamic = "force-static";
export const revalidate = false;
export const dynamicParams = true;

export function generateStaticParams() {
  return embedCityStaticParams();
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; place: string; city: string }> }) {
  const { locale, place, city } = await params;
  const found = resolveEmbedCity(locale, place, city);
  return found && isEmbedLocale(locale) ? embedResponse(locale, found) : notFoundResponse();
}
