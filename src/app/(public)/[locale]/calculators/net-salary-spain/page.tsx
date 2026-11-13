import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NetSalaryRoute, netSalaryMetadata } from "@/components/programmatic/net-salary/NetSalaryPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/calculators/net-salary-spain/ — "Spain net salary calculator 2026"
 * (lib/programmatic/net-salary/), server-rendered with the €30,000 example.
 * The first tool of the calculators family (lib/programmatic/calculators/paths.ts);
 * listed on the hub (/es/calculadoras/). Ships with the deploy: no publish group (nothing here is in the database).
 */
export const revalidate = false;
// true, like the leave planner: self-hosted, a dynamicParams = false route
// answers 404 if anything ever revalidates it (NoFallbackError). Other
// locales still 404 through notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? netSalaryMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <NetSalaryRoute locale="en" />;
}
