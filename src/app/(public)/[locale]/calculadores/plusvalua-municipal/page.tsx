import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlusvaliaRoute, pvMetadata } from "@/components/programmatic/plusvalia/PlusvaliaPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/plusvalua-municipal/ — «Plusvàlua municipal»
 * (lib/programmatic/plusvalia/): the IIVTNU of one transfer under arts. 104
 * to 110 of the Haciendas Locales act, by the objective and the real-gain
 * methods, server-rendered on a December 2026 sale, with the maximum
 * coefficients until 30 Nov and from 1 Dec 2026. Static: no publish group,
 * it ships with the deploy.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? pvMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <PlusvaliaRoute locale="ca" />;
}
