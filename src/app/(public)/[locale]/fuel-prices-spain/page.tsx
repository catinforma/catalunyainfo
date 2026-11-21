import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, SpainHubRoute, spainHubMetadata } from "@/components/programmatic/fuel/routes";
import { fuelHubAllowed } from "@/lib/programmatic/fuel/routing";

/**
 * /en/fuel-prices-spain/ — petrol and diesel prices today in all 52 provinces
 * (21 Nov 2026), from the Ministry's national list
 * (lib/programmatic/fuel/spain-server.ts). `en` only; ISR every half hour.
 * The English edition of /es/gasolineras/provincia/: the Catalonia-only hub
 * (/en/fuel-prices-catalonia/) could not hold the other provinces.
 */
/** SPAIN_REVALIDATE_SECONDS in lib/programmatic/fuel/spain-server.ts (a literal: Next reads it statically). */
export const revalidate = 1800;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return fuelHubAllowed("en", locale) ? spainHubMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  if (!fuelHubAllowed("en", locale)) notFound();
  return <SpainHubRoute locale="en" />;
}
