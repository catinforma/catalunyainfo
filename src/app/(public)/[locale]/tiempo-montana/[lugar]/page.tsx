import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlacePage } from "@/components/programmatic/mountain/PlacePage";
import { NOT_FOUND_METADATA, placeMetadata, placeStaticParams, resolvePlace } from "@/lib/programmatic/mountain/pages";

/**
 * /es/tiempo-montana/<lugar>/: una estación de esquí o una montaña con una
 * estación de Meteocat lo bastante cerca. Solo `es`. HTML estático de la
 * instantánea, en caché hasta un despliegue o una revalidación a demanda;
 * las lecturas se cargan en el navegador.
 */

export const revalidate = false;
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string; lugar: string }> };

export function generateStaticParams() {
  return placeStaticParams("es", "lugar");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, lugar } = await params;
  const place = resolvePlace("es", locale, lugar);
  return place ? placeMetadata(place, "es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale, lugar } = await params;
  const place = resolvePlace("es", locale, lugar);
  if (!place) notFound();
  return <PlacePage place={place} locale="es" />;
}
