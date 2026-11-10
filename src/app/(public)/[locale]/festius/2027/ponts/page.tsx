import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { SpainBridgesRouteIntl, bridgesMetadataIntl } from "@/components/programmatic/spain-2027/routes-intl";
import { editionAllowed, editionLocaleParams } from "@/lib/programmatic/spain-2027/editions";

/**
 * /ca/festius/2027/ponts/ — every long weekend of 2027 in Spain, by community (/es/festivos/2027/puentes/).
 */
export const revalidate = false;
// true: the publish group `calendario-2027-espana` revalidates this path;
// self-hosted, a dynamicParams = false route then answers 404
// (NoFallbackError). Other locales and unknown slugs still 404 through
// notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return editionLocaleParams("ca");
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return editionAllowed("ca", locale) ? bridgesMetadataIntl("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!editionAllowed("ca", locale)) notFound();
  return <SpainBridgesRouteIntl locale="ca" />;
}
