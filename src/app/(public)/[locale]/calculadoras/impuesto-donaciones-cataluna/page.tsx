import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CataloniaGiftTaxRoute } from "@/components/programmatic/gift-tax/CataloniaGiftTaxPage";
import { giftMetadata } from "@/components/programmatic/gift-tax/GiftTaxBody";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /es/calculadoras/impuesto-donaciones-cataluna/ — gift tax in catalonia (lib/programmatic/gift-tax/regions/catalonia.ts: Codi tributari de Catalunya, llibre sisè, arts. 632-20 a 633-3):
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
  return locale === "es" ? giftMetadata("catalonia", "es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <CataloniaGiftTaxRoute locale="es" />;
}
