import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, ZoneRoute, zoneMetadata } from "@/components/programmatic/weekend/routes";
import { resolveZone, zoneStaticParams } from "@/lib/programmatic/weekend/routing";

/**
 * /ca/cap-de-setmana/<zona>/ — what to do this weekend in one zone. `ca` only.
 * ISR every hour: the HTML carries the weekend's dates, the fairs calendar,
 * the official agenda (lib/programmatic/weekend/agenda-server.ts) and the
 * zone's guidance; the nightly cron also rebuilds it when the weekend changes.
 */
/** SERVER_REVALIDATE_SECONDS in lib/programmatic/weekend/agenda-server.ts (a literal: Next reads it statically). */
export const revalidate = 3600;
export const dynamicParams = true;

type Params = Promise<{ locale: string; zona: string }>;

export function generateStaticParams() {
  return zoneStaticParams("ca");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, zona } = await params;
  const zone = resolveZone("ca", locale, zona);
  return zone ? zoneMetadata("ca", zone) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, zona } = await params;
  const zone = resolveZone("ca", locale, zona);
  if (!zone) notFound();
  return <ZoneRoute locale="ca" zone={zone} />;
}
