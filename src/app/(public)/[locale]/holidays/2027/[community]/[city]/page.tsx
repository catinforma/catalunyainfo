import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { CityRouteIntl, cityMetadataIntl } from "@/components/programmatic/spain-2027/routes-intl";
import { editionCityParams, resolveEditionCity } from "@/lib/programmatic/spain-2027/editions";

/**
 * /en/holidays/2027/<community>/<city>/ — one city's local days and 2027 calendar.
 */
export const revalidate = false;
// true: the publish group `calendario-2027-espana` revalidates this path;
// self-hosted, a dynamicParams = false route then answers 404
// (NoFallbackError). Other locales and unknown slugs still 404 through
// notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string; community: string; city: string }>;

export function generateStaticParams() {
  return editionCityParams("en", "community", "city");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, community, city } = await params;
  const found = resolveEditionCity("en", locale, community, city);
  return found ? cityMetadataIntl(found, "en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, community, city } = await params;
  const found = resolveEditionCity("en", locale, community, city);
  if (!found) notFound();
  return <CityRouteIntl city={found} locale="en" />;
}
