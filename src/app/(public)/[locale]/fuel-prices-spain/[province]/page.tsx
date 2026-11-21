import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, SpainProvinceRoute, spainProvinceMetadata } from "@/components/programmatic/fuel/routes";
import { resolveSpainProvince, spainProvinceStaticParams } from "@/lib/programmatic/fuel/routing";

/**
 * /en/fuel-prices-spain/<province>/ — one province outside Catalonia, or Ceuta
 * or Melilla (21 Nov 2026). `en` only. The four Catalan provinces have no page
 * here (404): the English Catalonia hub has their figures.
 */
/** SPAIN_REVALIDATE_SECONDS in lib/programmatic/fuel/spain-server.ts (a literal: Next reads it statically). */
export const revalidate = 1800;
export const dynamicParams = true;

type Params = Promise<{ locale: string; province: string }>;

export function generateStaticParams() {
  return spainProvinceStaticParams("en", "province");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, province } = await params;
  const place = resolveSpainProvince("en", locale, province);
  return place ? spainProvinceMetadata("en", place) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, province } = await params;
  const place = resolveSpainProvince("en", locale, province);
  if (!place) notFound();
  return <SpainProvinceRoute locale="en" province={place} />;
}
