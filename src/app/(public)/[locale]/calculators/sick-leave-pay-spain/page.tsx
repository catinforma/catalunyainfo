import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SickLeaveRoute, sickLeaveMetadata } from "@/components/programmatic/sick-leave/SickLeavePage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/calculators/sick-leave-pay-spain/ — "Spain sick pay calculator"
 * (lib/programmatic/sick-leave/): incapacidad temporal day by day (LGSS arts.
 * 169-176, as amended by RDL 31/2026 from 1 Dec 2026), server-rendered with
 * the default example. Ships with the deploy: no publish group (nothing here
 * is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? sickLeaveMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <SickLeaveRoute locale="en" />;
}
