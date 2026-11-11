import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GordoMunicipalityRoute, NOT_FOUND_METADATA, gordoMunicipalityMetadata } from "@/components/programmatic/gordo/routes";
import { placeStaticParams, resolveMunicipalityPage } from "@/lib/programmatic/gordo/routing";

/**
 * /es/donde-ha-tocado-el-gordo/<provincia>/<municipio>/ — one municipality where SELAE lists a main
 * prize. Exists only for municipalities in the committed snapshot; before the
 * draw every slug is a 404. Rendered on first request, then cached.
 */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; provincia: string; municipio: string }>;

export function generateStaticParams() {
  return placeStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, provincia, municipio } = await params;
  const g = resolveMunicipalityPage("es", locale, provincia, municipio);
  return g ? gordoMunicipalityMetadata("es", g) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, provincia, municipio } = await params;
  const g = resolveMunicipalityPage("es", locale, provincia, municipio);
  if (!g) notFound();
  return <GordoMunicipalityRoute locale="es" g={g} />;
}
