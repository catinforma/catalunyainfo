import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PurchaseCostsRoute, pcMetadata } from "@/components/programmatic/purchase-costs/PurchaseCostsPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/calculators/spain-home-buying-costs/ — "Costs of buying a home in Spain: notary, Land Registry and taxes"
 * (lib/programmatic/purchase-costs/): the calculator, server-rendered on a
 * fixed example, the notary's and the Registry's official scales and who pays
 * each cost. Static: no publish group, it ships with the deploy.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? pcMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <PurchaseCostsRoute locale="en" />;
}
