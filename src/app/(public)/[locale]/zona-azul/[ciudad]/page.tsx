import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, ZaCityRoute, zaCityMetadata } from "@/components/programmatic/zona-azul/routes";
import { resolveZaCity, zaCityStaticParams } from "@/lib/programmatic/zona-azul/routing";

/**
 * /es/zona-azul/<ciudad>/ — regulated street parking in one city: whether it
 * is paid today and until what time, the timetable by type of day, zones,
 * prices and their official sources. `es` only.
 * Static: the server render states the general rule, never "today"; the
 * answer for today is worked out in the browser (TodayStatus), so a cached
 * page cannot go stale at midnight.
 */
export const revalidate = false;
// true: the publish group `zona-azul` revalidates these paths; self-hosted, a
// dynamicParams = false route then answers 404. An unknown city or another
// locale still 404s through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string; ciudad: string }>;

export function generateStaticParams() {
  return zaCityStaticParams("es", "ciudad");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, ciudad } = await params;
  const place = resolveZaCity("es", locale, ciudad);
  return place ? zaCityMetadata("es", place) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, ciudad } = await params;
  const place = resolveZaCity("es", locale, ciudad);
  if (!place) notFound();
  return <ZaCityRoute locale="es" city={place} />;
}
