import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NcPensionRoute, ncMetadata } from "@/components/programmatic/non-contributory-pension/NcPensionPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/calculators/spain-non-contributory-pension/ — "Spain non-contributory
 * pension 2026: rules and amount" (lib/programmatic/non-contributory-pension/).
 * Same page as the Spanish one; ships with the deploy, no publish group.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? ncMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <NcPensionRoute locale="en" />;
}
