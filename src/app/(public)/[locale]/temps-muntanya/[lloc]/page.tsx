import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlacePage } from "@/components/programmatic/mountain/PlacePage";
import { NOT_FOUND_METADATA, placeMetadata, placeStaticParams, resolvePlace } from "@/lib/programmatic/mountain/pages";

/**
 * /ca/temps-muntanya/<lloc>/: una estació d'esquí o una muntanya amb una
 * estació del Meteocat prou a prop. Només `ca`. HTML estàtic de la
 * instantània, en memòria cau fins a un desplegament o una revalidació a
 * demanda; les lectures es carreguen al navegador.
 */

export const revalidate = false;
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string; lloc: string }> };

export function generateStaticParams() {
  return placeStaticParams("ca", "lloc");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, lloc } = await params;
  const place = resolvePlace("ca", locale, lloc);
  return place ? placeMetadata(place, "ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale, lloc } = await params;
  const place = resolvePlace("ca", locale, lloc);
  if (!place) notFound();
  return <PlacePage place={place} locale="ca" />;
}
