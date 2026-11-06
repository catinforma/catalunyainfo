import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, SpainHubRoute, spainHubMetadata } from "@/components/programmatic/spain-2027/routes";
import { spainAllowed, spainLocaleParams } from "@/lib/programmatic/spain-2027/paths";

/**
 * /es/festivos/2027/ — "Calendario laboral 2027 en España: festivos por
 * comunidad autónoma", from the BOE's 2027 table. Spanish only. The static
 * `2027` folder wins over the Catalan town route `[municipi]` beside it.
 */
export const revalidate = false;
// true: the publish group `calendario-2027-espana` revalidates this path;
// self-hosted, a dynamicParams = false route then answers 404
// (NoFallbackError). Other locales still 404 through notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return spainLocaleParams();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return spainAllowed(locale) ? spainHubMetadata() : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!spainAllowed(locale)) notFound();
  return <SpainHubRoute />;
}
