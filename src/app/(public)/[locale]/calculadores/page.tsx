import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CalculatorsHubRoute, calculatorsHubMetadata } from "@/components/programmatic/calculators/CalculatorsHub";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/ — the calculators hub: every tool of the registry
 * (lib/programmatic/calculators/paths.ts) and the site's other tools, with
 * the cards in lib/programmatic/calculators/hub.ts. Ships with the deploy: no
 * publish group (nothing here is in the database).
 */
export const revalidate = false;
// true, like the calculators beside it: self-hosted, a dynamicParams = false
// route answers 404 if anything ever revalidates it (NoFallbackError). Other
// locales still 404 through notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? calculatorsHubMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <CalculatorsHubRoute locale="ca" />;
}
