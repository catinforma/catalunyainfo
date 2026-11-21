import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, SpainHubRoute, spainHubMetadata } from "@/components/programmatic/fuel/routes";
import { fuelHubAllowed } from "@/lib/programmatic/fuel/routing";

/**
 * /es/gasolineras/provincia/ — precio de la gasolina y el diésel hoy en las 52
 * provincias (21 Nov 2026), de la lista nacional del Ministerio
 * (lib/programmatic/fuel/spain-server.ts). `es` only; ISR every half hour.
 */
/** SPAIN_REVALIDATE_SECONDS in lib/programmatic/fuel/spain-server.ts (a literal: Next reads it statically). */
export const revalidate = 1800;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return fuelHubAllowed("es", locale) ? spainHubMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  if (!fuelHubAllowed("es", locale)) notFound();
  return <SpainHubRoute locale="es" />;
}
