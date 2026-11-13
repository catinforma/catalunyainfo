import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReservoirPage } from "@/components/programmatic/reservoirs/ReservoirPages";
import { NOT_FOUND_METADATA, reservoirMetadata, reservoirStaticParams, resolveReservoir } from "@/lib/programmatic/reservoirs/pages";
import { loadServerReservoirs } from "@/lib/programmatic/reservoirs/server";

/**
 * /ca/embassaments/<embassament>/ — un embassament de la sèrie diària de
 * l'ACA. Només `ca`; ISR cada tres hores amb la lectura de l'ACA a l'HTML
 * (lib/programmatic/reservoirs/server.ts); el navegador la torna a llegir des
 * de /api/reservoirs/levels/.
 */
const ROUTE = "ca";

/** SERVER_REVALIDATE_SECONDS (a literal: Next reads it statically). */
export const revalidate = 10800;
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
  return <ReservoirPage reservoir={reservoir} locale={ROUTE} server={await loadServerReservoirs()} />;
}
