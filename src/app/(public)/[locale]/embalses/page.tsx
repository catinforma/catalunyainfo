import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReservoirHubPage } from "@/components/programmatic/reservoirs/ReservoirPages";
import { NOT_FOUND_METADATA, resolveReservoirHub, reservoirHubMetadata } from "@/lib/programmatic/reservoirs/pages";

/**
 * /es/embalses/ — los embalses de la ACA, uno a uno. Solo `es`; estática,
 * la lectura del día se carga en el navegador.
 */
const ROUTE = "es";

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
