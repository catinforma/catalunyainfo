import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CityRoute, NOT_FOUND_METADATA, cityMetadata } from "@/components/programmatic/spain-2027/routes";
import { cityStaticParams, resolveCity } from "@/lib/programmatic/spain-2027/paths";

/** /es/festivos/2027/<comunidad>/<ciudad>/ — "Festivos locales <Ciudad> 2027: <día 1> y <día 2>". */
export const revalidate = false;
// true: revalidated by the publish group `calendario-2027-espana` (see ../../page.tsx).
// Unknown slugs and other locales still 404 through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string; comunidad: string; ciudad: string }>;

export function generateStaticParams() {
  return cityStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, comunidad, ciudad } = await params;
  const city = resolveCity(locale, comunidad, ciudad);
  return city ? cityMetadata(city) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, comunidad, ciudad } = await params;
  const city = resolveCity(locale, comunidad, ciudad);
  if (!city) notFound();
  return <CityRoute city={city} />;
}
