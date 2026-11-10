import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SpainDayRoute, spainDayMetadata } from "@/components/programmatic/spain-2027/days";
import { resolveSpainDay, spainDayStaticParams } from "@/lib/programmatic/spain-2027/paths";

/**
 * /es/festivos/2027/dia/19-marzo/ — "¿Es festivo el 19 de marzo de 2027?" for
 * all Spain, from the BOE's 2027 table (days.ts). The static `dia` folder
 * wins over `[comunidad]` beside it, and no community is called that.
 */
export const revalidate = false;
// true: revalidated by the publish group `calendario-2027-espana` (see ../../page.tsx).
// Unknown slugs, folded dates and other locales still 404 through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string; fecha: string }>;

export function generateStaticParams() {
  return spainDayStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, fecha } = await params;
  const iso = resolveSpainDay(locale, fecha);
  return iso ? spainDayMetadata(iso) : { robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Params }) {
  const { locale, fecha } = await params;
  const iso = resolveSpainDay(locale, fecha);
  if (!iso) notFound();
  return <SpainDayRoute iso={iso} />;
}
