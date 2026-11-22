import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, ZaCityRoute, zaCityMetadata } from "@/components/programmatic/zona-azul/routes";
import { resolveZaCity, zaCityStaticParams } from "@/lib/programmatic/zona-azul/routing";

/**
 * /en/blue-zone-parking/<city>/ — the English edition of
 * /es/zona-azul/<ciudad>/ (same slug, same data file). `en` only.
 * Static: the server render states the general rule, never "today"; the
 * answer for today is worked out in the browser (TodayStatus).
 */
export const revalidate = false;
// true: the publish group `zona-azul` revalidates these paths; self-hosted, a
// dynamicParams = false route then answers 404. An unknown city or another
// locale still 404s through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string; city: string }>;

export function generateStaticParams() {
  return zaCityStaticParams("en", "city");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, city } = await params;
  const place = resolveZaCity("en", locale, city);
  return place ? zaCityMetadata("en", place) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, city } = await params;
  const place = resolveZaCity("en", locale, city);
  if (!place) notFound();
  return <ZaCityRoute locale="en" city={place} />;
}
