import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReservoirPage } from "@/components/programmatic/reservoirs/ReservoirPages";
import { NOT_FOUND_METADATA, reservoirMetadata, reservoirStaticParams, resolveReservoir } from "@/lib/programmatic/reservoirs/pages";
import { loadServerReservoirs } from "@/lib/programmatic/reservoirs/server";

/**
 * /en/reservoirs/<reservoir>/ — one reservoir of the ACA's daily series.
 * `en` only; ISR every three hours with the ACA's reading in the HTML
 * (lib/programmatic/reservoirs/server.ts); the browser reads it again from
 * /api/reservoirs/levels/.
 */
const ROUTE = "en";

/** SERVER_REVALIDATE_SECONDS (a literal: Next reads it statically). */
export const revalidate = 10800;
export const dynamicParams = true;

export function generateStaticParams() {
  return reservoirStaticParams(ROUTE, "reservoir");
}

type Props = { params: Promise<{ locale: string; reservoir: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, reservoir: slug } = await params;
  const reservoir = resolveReservoir(ROUTE, locale, slug);
  return reservoir ? reservoirMetadata(reservoir, ROUTE) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale, reservoir: slug } = await params;
  const reservoir = resolveReservoir(ROUTE, locale, slug);
  if (!reservoir) notFound();
  return <ReservoirPage reservoir={reservoir} locale={ROUTE} server={await loadServerReservoirs()} />;
}
