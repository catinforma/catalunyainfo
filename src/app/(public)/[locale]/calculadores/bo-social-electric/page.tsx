import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BonoSocialRoute, bonoSocialMetadata } from "@/components/programmatic/bono-social/BonoSocialPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/bo-social-electric/ — "Bo social elèctric: tens dret?" (lib/programmatic/bono-social/): who qualifies for
 * the bono social eléctrico (RD 897/2017 arts. 3-4) and its 2026 discount
 * (RDL 7/2026 art. 1), with the checker server-rendered on two adults, two
 * minors and 20,000 EUR a year. Ships with the deploy: no publish group
 * (nothing here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? bonoSocialMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <BonoSocialRoute locale="ca" />;
}
