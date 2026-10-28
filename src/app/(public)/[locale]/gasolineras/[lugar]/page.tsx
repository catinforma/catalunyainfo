import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelPlaceRoute, NOT_FOUND_METADATA, fuelPlaceMetadata } from "@/components/programmatic/fuel/routes";
import { cityStaticParams, resolveCityOrChain } from "@/lib/programmatic/fuel/routing";

/**
 * /es/gasolineras/<municipio o cadena>/ — a city with at least ten stations,
 * or a Catalan chain (bonÀrea, Esclatoil). `es` only; static forever, the
 * prices are read in the browser.
 */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; lugar: string }>;

export function generateStaticParams() {
  return cityStaticParams("es", "lugar");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, lugar } = await params;
  const place = resolveCityOrChain("es", locale, lugar);
  return place ? fuelPlaceMetadata("es", place) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, lugar } = await params;
  const place = resolveCityOrChain("es", locale, lugar);
  if (!place) notFound();
  return <FuelPlaceRoute locale="es" place={place} />;
}
