import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InheritanceCompareRoute, cmpMetadata } from "@/components/programmatic/inheritance-compare/InheritanceComparePage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/calculators/spain-inheritance-tax-by-region/ — inheritance and gift tax
 * compared across the 21 territories (lib/programmatic/inheritance-compare):
 * every cell with its article and date, one worked example, the CSV. Static:
 * no publish group, it ships with the deploy.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? cmpMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <InheritanceCompareRoute locale="en" />;
}
