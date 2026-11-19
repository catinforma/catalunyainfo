import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MadridGiftTaxRoute } from "@/components/programmatic/gift-tax/MadridGiftTaxPage";
import { giftMetadata } from "@/components/programmatic/gift-tax/GiftTaxBody";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /es/calculadoras/impuesto-donaciones-madrid/ — gift tax in madrid (lib/programmatic/gift-tax/regions/madrid.ts: Decreto Legislativo 1/2010, arts. 22 bis a 25):
 * one gift's tax, server-rendered on the page's first example, with the
 * requirements, reductions, scale and rebate. Static: no publish group, it
 * ships with the deploy.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es" ? giftMetadata("madrid", "es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <MadridGiftTaxRoute locale="es" />;
}
