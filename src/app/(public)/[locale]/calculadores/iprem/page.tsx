import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IpremRoute, ipremMetadata } from "@/components/programmatic/iprem/IpremPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/iprem/ — "IPREM 2026" (lib/programmatic/iprem/): the
 * IPREM in force from the BOE (Ley 31/2022 DA 90ª, budget extended), the
 * history 2004–2026, 2027, the common limits in IPREM multiples and a
 * calculator, server-rendered on 1.5 times and 12,000 EUR a year. Ships with
 * the deploy: no publish group (nothing here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? ipremMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <IpremRoute locale="ca" />;
}
