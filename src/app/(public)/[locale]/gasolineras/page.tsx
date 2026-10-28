import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelHubRoute, NOT_FOUND_METADATA, fuelHubMetadata } from "@/components/programmatic/fuel/routes";
import { fuelHubAllowed } from "@/lib/programmatic/fuel/routing";

/**
 * /es/gasolineras/ — Catalonia's cheapest stations now and every fuel page.
 * `es` only. The HTML is static (no prices); the live table is filled in the
 * browser from /api/fuel/catalonia/.
 */
export const revalidate = false;

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
