import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WidowPensionRoute, widowMetadata } from "@/components/programmatic/widow-pension/WidowPensionPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/calculators/spain-widows-pension/ — "Spain widow's pension:
 * requirements and amount" (lib/programmatic/widow-pension/). Same page as
 * the Spanish one; ships with the deploy, no publish group.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? widowMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <WidowPensionRoute locale="en" />;
}
