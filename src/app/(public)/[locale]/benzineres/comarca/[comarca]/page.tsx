import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelPlaceRoute, NOT_FOUND_METADATA, fuelPlaceMetadata } from "@/components/programmatic/fuel/routes";
import { comarcaStaticParams, resolveComarca } from "@/lib/programmatic/fuel/routing";

/** /ca/benzineres/comarca/<comarca>/ — comarques amb almenys cinc benzineres. Només `ca`. */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; comarca: string }>;

export function generateStaticParams() {
  return comarcaStaticParams("ca");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, comarca } = await params;
  const place = resolveComarca("ca", locale, comarca);
  return place ? fuelPlaceMetadata("ca", place) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, comarca } = await params;
  const place = resolveComarca("ca", locale, comarca);
  if (!place) notFound();
  return <FuelPlaceRoute locale="ca" place={place} />;
}
