import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExtraPayRoute, extraPayMetadata } from "@/components/programmatic/extra-pay/ExtraPayPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/calculators/christmas-extra-pay-spain/ — "Spain Christmas extra pay calculator 2026"
 * (lib/programmatic/extra-pay/): ET art. 31, LGSS art. 147.1 and the IRPF
 * withholding (RIRPF arts. 82-83, AEAT 2026 algorithm via the net salary
 * engine), server-rendered with the 30,000 € example. Ships with the deploy:
 * no publish group (nothing here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? extraPayMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <ExtraPayRoute locale="en" />;
}
