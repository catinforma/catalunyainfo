import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReservoirPage } from "@/components/programmatic/reservoirs/ReservoirPages";
import { NOT_FOUND_METADATA, reservoirMetadata, reservoirStaticParams, resolveReservoir } from "@/lib/programmatic/reservoirs/pages";

/**
 * /es/embalses/<embalse>/ — un embalse de la serie diaria de la ACA. Solo
 * `es`; estática (snapshot), la lectura del día se lee en el navegador desde
 * /api/reservoirs/levels/.
 */
const ROUTE = "es";

export const revalidate = false;
export const dynamicParams = true;

export function generateStaticParams() {
  return reservoirStaticParams(ROUTE, "embalse");
}

type Props = { params: Promise<{ locale: string; embalse: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, embalse } = await params;
  const reservoir = resolveReservoir(ROUTE, locale, embalse);
  return reservoir ? reservoirMetadata(reservoir, ROUTE) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale, embalse } = await params;
  const reservoir = resolveReservoir(ROUTE, locale, embalse);
  if (!reservoir) notFound();
  return <ReservoirPage reservoir={reservoir} locale={ROUTE} />;
}
