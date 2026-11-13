import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SettlementRoute, settlementMetadata } from "@/components/programmatic/employment/SettlementPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/calculators/final-settlement-spain/ — the final settlement (finiquito) calculator (lib/programmatic/employment/),
 * server-rendered with its example so it answers without JavaScript.
 * A static folder beside the catch-all; ships with the deploy (no publish group).
 */
export const revalidate = false;
// true, like the other static folders: self-hosted, a dynamicParams = false
// route answers 404 if anything ever revalidates it (NoFallbackError). Other
// locales still 404 through notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? settlementMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <SettlementRoute locale="en" />;
}
