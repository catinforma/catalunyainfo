import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GordoMunicipalityRoute, NOT_FOUND_METADATA, gordoMunicipalityMetadata } from "@/components/programmatic/gordo/routes";
import { placeStaticParams, resolveMunicipalityPage } from "@/lib/programmatic/gordo/routing";

/**
 * /ca/on-ha-tocat-la-loteria-de-nadal/<provincia>/<municipi>/ — one municipality where SELAE lists a main
 * prize. Exists only for municipalities in the committed snapshot; before the
 * draw every slug is a 404. Rendered on first request, then cached.
 */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; provincia: string; municipi: string }>;

export function generateStaticParams() {
  return placeStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, provincia, municipi } = await params;
  const g = resolveMunicipalityPage("ca", locale, provincia, municipi);
  return g ? gordoMunicipalityMetadata("ca", g) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, provincia, municipi } = await params;
  const g = resolveMunicipalityPage("ca", locale, provincia, municipi);
  if (!g) notFound();
  return <GordoMunicipalityRoute locale="ca" g={g} />;
}
