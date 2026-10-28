import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelPlaceRoute, NOT_FOUND_METADATA, fuelPlaceMetadata } from "@/components/programmatic/fuel/routes";
import { cityStaticParams, resolveCityOrChain } from "@/lib/programmatic/fuel/routing";

/**
 * /ca/benzineres/<municipi o cadena>/ — una ciutat amb almenys deu
 * benzineres, o una cadena catalana (bonÀrea, Esclatoil). Només `ca`; estàtica,
 * els preus es llegeixen al navegador.
 */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; lloc: string }>;

export function generateStaticParams() {
  return cityStaticParams("ca", "lloc");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, lloc } = await params;
  const place = resolveCityOrChain("ca", locale, lloc);
  return place ? fuelPlaceMetadata("ca", place) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, lloc } = await params;
  const place = resolveCityOrChain("ca", locale, lloc);
  if (!place) notFound();
  return <FuelPlaceRoute locale="ca" place={place} />;
}
