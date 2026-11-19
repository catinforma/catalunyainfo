import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WidowPensionRoute, widowMetadata } from "@/components/programmatic/widow-pension/WidowPensionPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /es/calculadoras/pension-viudedad/ — "Pensión de viudedad: requisitos y
 * cuánto se cobra" (lib/programmatic/widow-pension/): who is entitled (LGSS
 * arts. 217 and 219 to 222), the 52, 60 or 70 % (Decreto 3158/1966 art. 31,
 * RD 900/2018), the amount from the base reguladora against the 2026 minimum
 * (RD 241/2026), server-rendered on a 66-year-old pensioner's widow. Ships
 * with the deploy: no publish group (nothing here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es" ? widowMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <WidowPensionRoute locale="es" />;
}
