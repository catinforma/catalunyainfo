import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExtraPayRoute, extraPayMetadata } from "@/components/programmatic/extra-pay/ExtraPayPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/paga-extra/ — "Calculadora de la paga extra de Nadal 2026"
 * (lib/programmatic/extra-pay/): ET art. 31, LGSS art. 147.1 and the IRPF
 * withholding (RIRPF arts. 82-83, AEAT 2026 algorithm via the net salary
 * engine), server-rendered with the 30,000 € example. Ships with the deploy:
 * no publish group (nothing here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? extraPayMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <ExtraPayRoute locale="ca" />;
}
