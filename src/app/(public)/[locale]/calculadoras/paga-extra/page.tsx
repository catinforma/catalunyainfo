import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExtraPayRoute, extraPayMetadata } from "@/components/programmatic/extra-pay/ExtraPayPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /es/calculadoras/paga-extra/ — "Calculadora de la paga extra de Navidad 2026"
 * (lib/programmatic/extra-pay/): ET art. 31, LGSS art. 147.1 and the IRPF
 * withholding (RIRPF arts. 82-83, AEAT 2026 algorithm via the net salary
 * engine), server-rendered with the 30,000 € example. Ships with the deploy:
 * no publish group (nothing here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es" ? extraPayMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <ExtraPayRoute locale="es" />;
}
