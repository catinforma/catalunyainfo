import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GordoProvinceRoute, NOT_FOUND_METADATA, gordoProvinceMetadata } from "@/components/programmatic/gordo/routes";
import { placeStaticParams, resolveProvincePage } from "@/lib/programmatic/gordo/routing";

/**
 * /en/spanish-christmas-lottery-results/<province>/ — one province where SELAE lists a main prize.
 * Exists only for provinces in the committed snapshot; before the draw (no
 * snapshot) every slug is a 404. Rendered on first request, then cached.
 */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; province: string }>;

export function generateStaticParams() {
  return placeStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, province } = await params;
  const g = resolveProvincePage("en", locale, province);
  return g ? gordoProvinceMetadata("en", g) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, province } = await params;
  const g = resolveProvincePage("en", locale, province);
  if (!g) notFound();
  return <GordoProvinceRoute locale="en" g={g} />;
}
