import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelPlaceRoute, NOT_FOUND_METADATA, fuelPlaceMetadata } from "@/components/programmatic/fuel/routes";
import { provinceStaticParams, resolveProvince } from "@/lib/programmatic/fuel/routing";

/** /es/gasolineras/provincia/<provincia>/ — the four provinces. `es` only. */
/** SERVER_REVALIDATE_SECONDS in lib/programmatic/fuel/server.ts (a literal: Next reads it statically). */
export const revalidate = 1800;
export const dynamicParams = true;

type Params = Promise<{ locale: string; provincia: string }>;

export function generateStaticParams() {
  return provinceStaticParams("es");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, provincia } = await params;
  const place = resolveProvince("es", locale, provincia);
  return place ? fuelPlaceMetadata("es", place) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, provincia } = await params;
  const place = resolveProvince("es", locale, provincia);
  if (!place) notFound();
  return <FuelPlaceRoute locale="es" place={place} />;
}
