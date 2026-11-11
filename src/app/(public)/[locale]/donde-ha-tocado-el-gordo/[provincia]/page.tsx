import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GordoProvinceRoute, NOT_FOUND_METADATA, gordoProvinceMetadata } from "@/components/programmatic/gordo/routes";
import { placeStaticParams, resolveProvincePage } from "@/lib/programmatic/gordo/routing";

/**
 * /es/donde-ha-tocado-el-gordo/<provincia>/ — one province where SELAE lists a main prize.
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
  const g = resolveProvincePage("es", locale, provincia);
  return g ? gordoProvinceMetadata("es", g) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, provincia } = await params;
  const g = resolveProvincePage("es", locale, provincia);
  if (!g) notFound();
  return <GordoProvinceRoute locale="es" g={g} />;
}
