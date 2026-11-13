import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelHubRoute, NOT_FOUND_METADATA, fuelHubMetadata } from "@/components/programmatic/fuel/routes";
import { fuelHubAllowed } from "@/lib/programmatic/fuel/routing";

/**
 * /ca/benzineres/ — les benzineres més barates de Catalunya i totes les
 * pàgines de la família. Només `ca`. ISR cada mitja hora amb els preus a l'HTML
 * (lib/programmatic/fuel/server.ts); el navegador els torna a llegir.
 */
/** SERVER_REVALIDATE_SECONDS in lib/programmatic/fuel/server.ts (a literal: Next reads it statically). */
export const revalidate = 1800;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return fuelHubAllowed("ca", locale) ? fuelHubMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  if (!fuelHubAllowed("ca", locale)) notFound();
  return <FuelHubRoute locale="ca" />;
}
