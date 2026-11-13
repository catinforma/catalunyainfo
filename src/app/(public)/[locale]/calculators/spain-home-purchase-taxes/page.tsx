import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomeTaxRoute, htMetadata } from "@/components/programmatic/home-purchase-tax/HomeTaxPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/calculators/spain-home-purchase-taxes/ — "Taxes on buying a home in Spain" (lib/programmatic/home-purchase-tax/): the calculator,
 * server-rendered on a fixed example, and the rates of every community with
 * the law they come from. Static: no publish group, it ships with the deploy.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? htMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <HomeTaxRoute locale="en" />;
}
