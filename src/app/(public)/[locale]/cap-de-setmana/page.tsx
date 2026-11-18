import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HubRoute, NOT_FOUND_METADATA, hubMetadata } from "@/components/programmatic/weekend/routes";
import { hubAllowed } from "@/lib/programmatic/weekend/routing";

/**
 * /ca/cap-de-setmana/ — fairs and markets this weekend in Catalonia, and the zones.
 * `ca` only. ISR every hour with the official agenda in the HTML
 * (lib/programmatic/weekend/agenda-server.ts); the nightly cron also rebuilds
 * it when the weekend changes (src/lib/programmatic/weekend/refresh.ts).
 */
/** SERVER_REVALIDATE_SECONDS in lib/programmatic/weekend/agenda-server.ts (a literal: Next reads it statically). */
export const revalidate = 3600;
// true: regenerated hourly and by the nightly cron (revalidatePath); self-hosted, a
// dynamicParams = false route then answers 404 (NoFallbackError). Unknown
// locales still 404 through notFound() below.
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return hubAllowed("ca", locale) ? hubMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hubAllowed("ca", locale)) notFound();
  return <HubRoute locale="ca" />;
}
