import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SpainDayRoute, spainDayMetadata } from "@/components/programmatic/spain-2027/days";
import { resolveSpainDay, spainDayStaticParams } from "@/lib/programmatic/spain-2027/paths";

/**
 * /ca/festius/2027/dia/19-marc/ — "És festiu el 19 de març de 2027 a Espanya?" for all
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
  return spainDayStaticParams("ca");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, fecha } = await params;
  const iso = resolveSpainDay("ca", locale, fecha);
  return iso ? spainDayMetadata(iso, "ca") : { robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Params }) {
  const { locale, fecha } = await params;
  const iso = resolveSpainDay("ca", locale, fecha);
  if (!iso) notFound();
  return <SpainDayRoute iso={iso} locale="ca" />;
}
