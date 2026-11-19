import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NcPensionRoute, ncMetadata } from "@/components/programmatic/non-contributory-pension/NcPensionPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /es/calculadoras/pension-no-contributiva/ — "Pensión no contributiva:
 * requisitos y cuánto se cobra" (lib/programmatic/non-contributory-pension/):
 * who is entitled to the retirement (LGSS art. 369) or invalidity (art. 363)
 * PNC, the household limits (art. 363.2-4), the amount (art. 364) with the
 * 2026 figures (RDL 3/2026, RD 241/2026) and the rent supplement (RD
 * 1191/2012), server-rendered on a 67-year-old living alone. Ships with the
 * deploy: no publish group (nothing here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es" ? ncMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <NcPensionRoute locale="es" />;
}
