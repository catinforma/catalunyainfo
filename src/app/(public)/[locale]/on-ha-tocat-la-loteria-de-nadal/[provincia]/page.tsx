import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GordoProvinceRoute, NOT_FOUND_METADATA, gordoProvinceMetadata } from "@/components/programmatic/gordo/routes";
import { placeStaticParams, resolveProvincePage } from "@/lib/programmatic/gordo/routing";

/**
 * /ca/on-ha-tocat-la-loteria-de-nadal/<provincia>/ — one province where SELAE lists a main prize.
 * Exists only for provinces in the committed snapshot; before the draw (no
 * snapshot) every slug is a 404. Rendered on first request, then cached.
 */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; provincia: string }>;

export function generateStaticParams() {
  return placeStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, provincia } = await params;
  const g = resolveProvincePage("ca", locale, provincia);
  return g ? gordoProvinceMetadata("ca", g) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, provincia } = await params;
  const g = resolveProvincePage("ca", locale, provincia);
  if (!g) notFound();
  return <GordoProvinceRoute locale="ca" g={g} />;
}
