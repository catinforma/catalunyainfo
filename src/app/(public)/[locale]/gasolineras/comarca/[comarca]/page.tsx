import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelPlaceRoute, NOT_FOUND_METADATA, fuelPlaceMetadata } from "@/components/programmatic/fuel/routes";
import { comarcaStaticParams, resolveComarca } from "@/lib/programmatic/fuel/routing";

/** /es/gasolineras/comarca/<comarca>/ — comarques with at least five stations. `es` only. */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; comarca: string }>;

export function generateStaticParams() {
  return comarcaStaticParams("es");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, comarca } = await params;
  const place = resolveComarca("es", locale, comarca);
  return place ? fuelPlaceMetadata("es", place) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, comarca } = await params;
  const place = resolveComarca("es", locale, comarca);
  if (!place) notFound();
  return <FuelPlaceRoute locale="es" place={place} />;
}
