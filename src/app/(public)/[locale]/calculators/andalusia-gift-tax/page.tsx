import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AndaluciaGiftTaxRoute } from "@/components/programmatic/gift-tax/AndaluciaGiftTaxPage";
import { giftMetadata } from "@/components/programmatic/gift-tax/GiftTaxBody";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/calculators/andalusia-gift-tax/ — gift tax in andalucia (lib/programmatic/gift-tax/regions/andalucia.ts: Ley 5/2021, arts. 32 a 40 y 68):
 * one gift's tax, server-rendered on the page's first example, with the
 * requirements, reductions, scale and rebate. Static: no publish group, it
 * ships with the deploy.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? giftMetadata("andalucia", "en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <AndaluciaGiftTaxRoute locale="en" />;
}
