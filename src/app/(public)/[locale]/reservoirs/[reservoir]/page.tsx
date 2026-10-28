import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReservoirPage } from "@/components/programmatic/reservoirs/ReservoirPages";
import { NOT_FOUND_METADATA, reservoirMetadata, reservoirStaticParams, resolveReservoir } from "@/lib/programmatic/reservoirs/pages";

/**
 * /en/reservoirs/<reservoir>/ — one reservoir of the ACA's daily series.
 * `en` only; static (snapshot), the day's reading is read in the browser
 * from /api/reservoirs/levels/.
 */
const ROUTE = "en";

export const revalidate = false;
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
  return <ReservoirPage reservoir={reservoir} locale={ROUTE} />;
}
