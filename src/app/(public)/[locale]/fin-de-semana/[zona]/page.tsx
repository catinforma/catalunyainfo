import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, ZoneRoute, zoneMetadata } from "@/components/programmatic/weekend/routes";
import { resolveZone, zoneStaticParams } from "@/lib/programmatic/weekend/routing";

/**
 * /es/fin-de-semana/<zona>/ — what to do this weekend in one zone. `es` only.
 * Static (`revalidate = false`): the HTML carries the weekend's dates, the
 * fairs calendar and the zone's guidance; the nightly cron rebuilds it when
 * the weekend changes, and the agenda's activities are read in the browser.
 */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; zona: string }>;

export function generateStaticParams() {
  return zoneStaticParams("es");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, zona } = await params;
  const zone = resolveZone("es", locale, zona);
  return zone ? zoneMetadata("es", zone) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, zona } = await params;
  const zone = resolveZone("es", locale, zona);
  if (!zone) notFound();
  return <ZoneRoute locale="es" zone={zone} />;
}
