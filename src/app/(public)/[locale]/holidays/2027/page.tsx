import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { SpainHubRouteIntl, hubMetadataIntl } from "@/components/programmatic/spain-2027/routes-intl";
import { editionAllowed, editionLocaleParams } from "@/lib/programmatic/spain-2027/editions";

/**
 * /en/holidays/2027/ — the English edition of /es/festivos/2027/ (editions.ts). The static
 * `2027` folder wins over the town route `[municipi]` beside it.
 */
export const revalidate = false;
// true: the publish group `calendario-2027-espana` revalidates this path;
// self-hosted, a dynamicParams = false route then answers 404
// (NoFallbackError). Other locales and unknown slugs still 404 through
// notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return editionLocaleParams("en");
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return editionAllowed("en", locale) ? hubMetadataIntl("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!editionAllowed("en", locale)) notFound();
  return <SpainHubRouteIntl locale="en" />;
}
