import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { CityRouteIntl, cityMetadataIntl } from "@/components/programmatic/spain-2027/routes-intl";
import { editionCityParams, resolveEditionCity } from "@/lib/programmatic/spain-2027/editions";

/**
 * /ca/festius/2027/<comunitat>/<ciutat>/ — one city's local days and 2027 calendar.
 */
export const revalidate = false;
// true: the publish group `calendario-2027-espana` revalidates this path;
// self-hosted, a dynamicParams = false route then answers 404
// (NoFallbackError). Other locales and unknown slugs still 404 through
// notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string; comunitat: string; ciutat: string }>;

export function generateStaticParams() {
  return editionCityParams("ca", "comunitat", "ciutat");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, comunitat, ciutat } = await params;
  const city = resolveEditionCity("ca", locale, comunitat, ciutat);
  return city ? cityMetadataIntl(city, "ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, comunitat, ciutat } = await params;
  const city = resolveEditionCity("ca", locale, comunitat, ciutat);
  if (!city) notFound();
  return <CityRouteIntl city={city} locale="ca" />;
}
