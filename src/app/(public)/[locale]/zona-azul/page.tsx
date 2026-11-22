import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, ZaHubRoute, zaHubMetadata } from "@/components/programmatic/zona-azul/routes";
import { zaHubAllowed, zaHubStaticParams } from "@/lib/programmatic/zona-azul/routing";

/**
 * /es/zona-azul/ — "Zona azul por ciudad: horarios y precios": one row per
 * city with its paid hours, price per hour and maximum stay, read on each
 * council's official text (lib/programmatic/zona-azul/data.ts). `es` only.
 * Static: nothing in the server render depends on the date.
 */
export const revalidate = false;
// true: the publish group `zona-azul` revalidates this path; self-hosted, a
// dynamicParams = false route then answers 404. Other locales still 404
// through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string }>;

export function generateStaticParams() {
  return zaHubStaticParams("es");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return zaHubAllowed("es", locale) ? zaHubMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  if (!zaHubAllowed("es", locale)) notFound();
  return <ZaHubRoute locale="es" />;
}
