import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HubRoute, NOT_FOUND_METADATA, hubMetadata } from "@/components/programmatic/christmas-fairs/routes";
import { hubAllowed } from "@/lib/programmatic/christmas-fairs/routing";

/**
 * /ca/fires-de-nadal/ — every dated Christmas fair of the season in Catalonia, by date and town.
 * `ca` only. Static (`revalidate = false`): it renders from the committed
 * snapshot, and "open today" is worked out in the browser. A deploy publishes a
 * refreshed snapshot (npm run christmasfairs:snapshot -- build).
 */
export const revalidate = false;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return hubAllowed("ca", locale) ? hubMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hubAllowed("ca", locale)) notFound();
  return <HubRoute locale="ca" />;
}
