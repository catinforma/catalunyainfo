import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NetSalaryRoute, netSalaryMetadata } from "@/components/programmatic/net-salary/NetSalaryPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/sou-net/ — "Calculadora de sou net 2026"
 * (lib/programmatic/net-salary/), server-rendered with the 30,000 € example.
 * The first tool of the calculators family (lib/programmatic/calculators/paths.ts);
 * listed on the hub (/es/calculadoras/). Ships with the deploy: no publish group (nothing here is in the database).
 */
export const revalidate = false;
// true, like the leave planner: self-hosted, a dynamicParams = false route
// answers 404 if anything ever revalidates it (NoFallbackError). Other
// locales still 404 through notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? netSalaryMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <NetSalaryRoute locale="ca" />;
}
