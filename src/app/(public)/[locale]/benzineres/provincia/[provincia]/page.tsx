import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelPlaceRoute, NOT_FOUND_METADATA, fuelPlaceMetadata } from "@/components/programmatic/fuel/routes";
import { provinceStaticParams, resolveProvince } from "@/lib/programmatic/fuel/routing";

/** /ca/benzineres/provincia/<provincia>/ — les quatre províncies. Només `ca`. */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; provincia: string }>;

export function generateStaticParams() {
  return provinceStaticParams("ca");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, provincia } = await params;
  const place = resolveProvince("ca", locale, provincia);
  return place ? fuelPlaceMetadata("ca", place) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, provincia } = await params;
  const place = resolveProvince("ca", locale, provincia);
  if (!place) notFound();
  return <FuelPlaceRoute locale="ca" place={place} />;
}
