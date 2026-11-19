import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ValenciaGiftTaxRoute } from "@/components/programmatic/gift-tax/ValenciaGiftTaxPage";
import { giftMetadata } from "@/components/programmatic/gift-tax/GiftTaxBody";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/impost-donacions-comunitat-valenciana/ — gift tax in valencia (lib/programmatic/gift-tax/regions/valencia.ts: Ley 13/1997, arts. 10 bis a 12 ter):
 * one gift's tax, server-rendered on the page's first example, with the
 * requirements, reductions, scale and rebate. Static: no publish group, it
 * ships with the deploy.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? giftMetadata("valencia", "ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <ValenciaGiftTaxRoute locale="ca" />;
}
