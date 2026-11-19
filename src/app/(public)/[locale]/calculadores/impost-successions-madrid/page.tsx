import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MadridInheritanceTaxRoute } from "@/components/programmatic/inheritance-tax/MadridInheritanceTaxPage";
import { regionMetadata } from "@/components/programmatic/inheritance-tax/RegionalInheritanceTaxBody";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/impost-successions-madrid/ — inheritance tax in Madrid
 * (lib/programmatic/inheritance-tax/regions/madrid.ts: Decreto Legislativo 1/2010, arts. 21-26): one heir's
 * tax, server-rendered on the page's first example, with the scale,
 * reductions and rebate tables. Static: no publish group, it ships with the
 * deploy.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? regionMetadata("madrid", "ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <MadridInheritanceTaxRoute locale="ca" />;
}
