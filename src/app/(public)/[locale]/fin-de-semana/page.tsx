import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HubRoute, NOT_FOUND_METADATA, hubMetadata } from "@/components/programmatic/weekend/routes";
import { hubAllowed } from "@/lib/programmatic/weekend/routing";

/**
 * /es/fin-de-semana/ — fairs and markets this weekend in Catalonia, and the zones.
 * `es` only. Static: the nightly cron rebuilds it when the weekend changes
 * (see src/lib/programmatic/weekend/refresh.ts); the agenda is read in the browser.
 */
export const revalidate = false;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return hubAllowed("es", locale) ? hubMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hubAllowed("es", locale)) notFound();
  return <HubRoute locale="es" />;
}
