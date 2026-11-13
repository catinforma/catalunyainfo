import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaidLeaveRoute, paidLeaveMetadata } from "@/components/programmatic/paid-leave/PaidLeavePage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/permisos-laborals/ — "Permisos laborals 2026"
 * (lib/programmatic/paid-leave/): the Estatuto de los Trabajadores' paid
 * leave (arts. 37, 38, 48 and 48 bis) with the calculator, server-rendered
 * with the default example. Ships with the deploy: no publish group (nothing
 * here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? paidLeaveMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <PaidLeaveRoute locale="ca" />;
}
