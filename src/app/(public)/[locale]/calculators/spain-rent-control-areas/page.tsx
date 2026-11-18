import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ZonaTensionadaRoute, ztMetadata } from "@/components/programmatic/zona-tensionada/ZonaTensionadaPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/calculators/spain-rent-control-areas/ — "Is my town a zona tensionada?"
 * (lib/programmatic/zona-tensionada/). Ships with the deploy: no publish group.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? ztMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <ZonaTensionadaRoute locale="en" />;
}
