import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SelfEmployedRoute, selfEmployedMetadata } from "@/components/programmatic/self-employed/SelfEmployedPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/quota-autonoms/ — "Quota d'autònoms 2026 (i 2027)"
 * (lib/programmatic/self-employed/): the 2026 bands of the Orden
 * PJC/297/2026, server-rendered with the default example, and where 2027
 * stands. Ships with the deploy: no publish group (nothing here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? selfEmployedMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <SelfEmployedRoute locale="ca" />;
}
