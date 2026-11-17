import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LotteryTaxRoute, lotteryTaxMetadata } from "@/components/programmatic/lottery-tax/LotteryTaxPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/premis-loteria/ — "Premis de loteria: quant se'n queda Hisenda"
 * (lib/programmatic/lottery-tax/): the special levy on lottery prizes (Ley
 * 35/2006, DA 33ª) with the calculator, server-rendered on one whole El Gordo
 * décimo. Ships with the deploy: no publish group (nothing here is in the
 * database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? lotteryTaxMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <LotteryTaxRoute locale="ca" />;
}
