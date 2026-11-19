import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InheritanceTaxRoute, isdMetadata } from "@/components/programmatic/inheritance-tax/InheritanceTaxPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/impost-successions-catalunya/ — «Impost de successions a
 * Catalunya» (lib/programmatic/inheritance-tax/): one heir's tax under the
 * llibre sisè of the Codi tributari de Catalunya, server-rendered on the
 * ATC's worked example 1, with the scale, reductions and rebate tables.
 * Static: no publish group, it ships with the deploy.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? isdMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <InheritanceTaxRoute locale="ca" />;
}
