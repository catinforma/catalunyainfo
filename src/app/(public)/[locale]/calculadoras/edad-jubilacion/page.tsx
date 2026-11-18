import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RetirementAgeRoute, retirementMetadata } from "@/components/programmatic/retirement-age/RetirementAgePage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /es/calculadoras/edad-jubilacion/ — "¿A qué edad me puedo jubilar?" (lib/programmatic/retirement-age/): the day
 * the ordinary retirement age is reached (LGSS art. 205.1.a and DT 7ª), the
 * 65 rule, early retirement with its monthly coefficients (arts. 207-208)
 * and the delay bonus (art. 210.2), server-rendered on a person born 20 June
 * 1965 with 35 years contributed. Ships with the deploy: no publish group
 * (nothing here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es" ? retirementMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <RetirementAgeRoute locale="es" />;
}
