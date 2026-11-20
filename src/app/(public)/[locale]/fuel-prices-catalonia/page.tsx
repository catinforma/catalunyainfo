import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelHubRoute, NOT_FOUND_METADATA, fuelHubMetadata } from "@/components/programmatic/fuel/routes";
import { fuelHubAllowed } from "@/lib/programmatic/fuel/routing";

/**
 * /en/fuel-prices-catalonia/ — the English edition of the fuel hub (20 Nov
 * 2026): Catalonia's cheapest stations now and today's price in every area.
 * `en` only. ISR every half hour with the prices in the HTML
 * (lib/programmatic/fuel/server.ts); the browser re-reads /api/fuel/catalonia/.
 * The place pages have no English edition: this hub links the Spanish ones.
 */
/** SERVER_REVALIDATE_SECONDS in lib/programmatic/fuel/server.ts (a literal: Next reads it statically). */
export const revalidate = 1800;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return fuelHubAllowed("en", locale) ? fuelHubMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  if (!fuelHubAllowed("en", locale)) notFound();
  return <FuelHubRoute locale="en" />;
}
