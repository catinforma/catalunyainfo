import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, SpainBridgesRoute, spainBridgesMetadata } from "@/components/programmatic/spain-2027/routes";
import { spainAllowed, spainLocaleParams } from "@/lib/programmatic/spain-2027/paths";

/** /es/festivos/2027/puentes/ — every 2027 long weekend in Spain, and where (computed from the BOE). */
export const revalidate = false;
// true: revalidated by the publish group `calendario-2027-espana` (see ../page.tsx).
export const dynamicParams = true;

export function generateStaticParams() {
  return spainLocaleParams();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return spainAllowed(locale) ? spainBridgesMetadata() : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!spainAllowed(locale)) notFound();
  return <SpainBridgesRoute />;
}
