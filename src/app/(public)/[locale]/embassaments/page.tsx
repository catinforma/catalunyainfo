import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReservoirHubPage } from "@/components/programmatic/reservoirs/ReservoirPages";
import { NOT_FOUND_METADATA, resolveReservoirHub, reservoirHubMetadata } from "@/lib/programmatic/reservoirs/pages";

/**
 * /ca/embassaments/ — els embassaments de l'ACA, un per un. Només `ca`;
 * estàtica, la lectura del dia es carrega al navegador.
 */
const ROUTE = "ca";

export const revalidate = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveReservoirHub(ROUTE, (await params).locale);
  return locale ? reservoirHubMetadata(locale) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const locale = resolveReservoirHub(ROUTE, (await params).locale);
  if (!locale) notFound();
  return <ReservoirHubPage locale={locale} />;
}
