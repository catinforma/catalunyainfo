import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BonoSocialRoute, bonoSocialMetadata } from "@/components/programmatic/bono-social/BonoSocialPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /es/calculadoras/bono-social-electrico/ — "Bono social eléctrico: ¿tienes derecho?" (lib/programmatic/bono-social/): who qualifies for
 * the bono social eléctrico (RD 897/2017 arts. 3-4) and its 2026 discount
 * (RDL 7/2026 art. 1), with the checker server-rendered on two adults, two
 * minors and 20,000 EUR a year. Ships with the deploy: no publish group
 * (nothing here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es" ? bonoSocialMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <BonoSocialRoute locale="es" />;
}
