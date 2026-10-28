import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelHubRoute, NOT_FOUND_METADATA, fuelHubMetadata } from "@/components/programmatic/fuel/routes";
import { fuelHubAllowed } from "@/lib/programmatic/fuel/routing";

/**
 * /ca/benzineres/ — les benzineres més barates de Catalunya i totes les
 * pàgines de la família. Només `ca`. L'HTML és estàtic (sense preus); la taula
 * en directe s'omple al navegador des de /api/fuel/catalonia/.
 */
export const revalidate = false;

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
