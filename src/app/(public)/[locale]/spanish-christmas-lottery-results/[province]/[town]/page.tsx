import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GordoMunicipalityRoute, NOT_FOUND_METADATA, gordoMunicipalityMetadata } from "@/components/programmatic/gordo/routes";
import { placeStaticParams, resolveMunicipalityPage } from "@/lib/programmatic/gordo/routing";

/**
 * /en/spanish-christmas-lottery-results/<province>/<town>/ — one municipality where SELAE lists a main
 * prize. Exists only for municipalities in the committed snapshot; before the
 * draw every slug is a 404. Rendered on first request, then cached.
 */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; province: string; town: string }>;

export function generateStaticParams() {
  return placeStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, province, town } = await params;
  const g = resolveMunicipalityPage("en", locale, province, town);
  return g ? gordoMunicipalityMetadata("en", g) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, province, town } = await params;
  const g = resolveMunicipalityPage("en", locale, province, town);
  if (!g) notFound();
  return <GordoMunicipalityRoute locale="en" g={g} />;
}
