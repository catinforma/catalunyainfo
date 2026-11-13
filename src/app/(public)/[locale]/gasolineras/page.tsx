import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelHubRoute, NOT_FOUND_METADATA, fuelHubMetadata } from "@/components/programmatic/fuel/routes";
import { fuelHubAllowed } from "@/lib/programmatic/fuel/routing";

/**
 * /es/gasolineras/ — Catalonia's cheapest stations now and every fuel page.
 * `es` only. ISR every half hour with the ten cheapest per product in the
 * HTML (lib/programmatic/fuel/server.ts); the browser re-reads /api/fuel/catalonia/.
 */
/** SERVER_REVALIDATE_SECONDS in lib/programmatic/fuel/server.ts (a literal: Next reads it statically). */
export const revalidate = 1800;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return fuelHubAllowed("es", locale) ? fuelHubMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  if (!fuelHubAllowed("es", locale)) notFound();
  return <FuelHubRoute locale="es" />;
}
