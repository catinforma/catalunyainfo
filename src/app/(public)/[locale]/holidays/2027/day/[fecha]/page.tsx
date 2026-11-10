import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SpainDayRoute, spainDayMetadata } from "@/components/programmatic/spain-2027/days";
import { resolveSpainDay, spainDayStaticParams } from "@/lib/programmatic/spain-2027/paths";

/**
 * /en/holidays/2027/day/19-march/ — "Is 19 March 2027 a public holiday in Spain?" for all
 * Spain, from the BOE's 2027 table (days.ts). The static `2027` folder wins
 * over `[municipi]` beside it (no town slug is a year).
 */
export const revalidate = false;
// true: revalidated by the publish group `calendario-2027-espana`; self-hosted, a
// regenerated route with dynamicParams = false answers 404 (ops/vps/README.md).
// Unknown slugs, folded dates and other locales still 404 through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string; fecha: string }>;

export function generateStaticParams() {
  return spainDayStaticParams("en");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, fecha } = await params;
  const iso = resolveSpainDay("en", locale, fecha);
  return iso ? spainDayMetadata(iso, "en") : { robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Params }) {
  const { locale, fecha } = await params;
  const iso = resolveSpainDay("en", locale, fecha);
  if (!iso) notFound();
  return <SpainDayRoute iso={iso} locale="en" />;
}
