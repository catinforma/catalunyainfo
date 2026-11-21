import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, SpainHubRoute, spainHubMetadata } from "@/components/programmatic/fuel/routes";
import { fuelHubAllowed } from "@/lib/programmatic/fuel/routing";

/**
 * /ca/benzineres/provincia/ — preu de la gasolina i el dièsel avui a les 52
 * províncies (21 Nov 2026), de la llista nacional del Ministeri
 * (lib/programmatic/fuel/spain-server.ts). Només `ca`; ISR cada mitja hora.
 */
/** SPAIN_REVALIDATE_SECONDS in lib/programmatic/fuel/spain-server.ts (a literal: Next reads it statically). */
export const revalidate = 1800;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return fuelHubAllowed("ca", locale) ? spainHubMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  if (!fuelHubAllowed("ca", locale)) notFound();
  return <SpainHubRoute locale="ca" />;
}
