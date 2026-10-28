import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReservoirPage } from "@/components/programmatic/reservoirs/ReservoirPages";
import { NOT_FOUND_METADATA, reservoirMetadata, reservoirStaticParams, resolveReservoir } from "@/lib/programmatic/reservoirs/pages";

/**
 * /ca/embassaments/<embassament>/ — un embassament de la sèrie diària de
 * l'ACA. Només `ca`; estàtica (snapshot), la lectura del dia es llegeix al
 * navegador des de /api/reservoirs/levels/.
 */
const ROUTE = "ca";

export const revalidate = false;
export const dynamicParams = true;

export function generateStaticParams() {
  return reservoirStaticParams(ROUTE, "embassament");
}

type Props = { params: Promise<{ locale: string; embassament: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, embassament } = await params;
  const reservoir = resolveReservoir(ROUTE, locale, embassament);
  return reservoir ? reservoirMetadata(reservoir, ROUTE) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale, embassament } = await params;
  const reservoir = resolveReservoir(ROUTE, locale, embassament);
  if (!reservoir) notFound();
  return <ReservoirPage reservoir={reservoir} locale={ROUTE} />;
}
