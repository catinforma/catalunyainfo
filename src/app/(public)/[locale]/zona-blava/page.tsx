import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, ZaHubRoute, zaHubMetadata } from "@/components/programmatic/zona-azul/routes";
import { zaHubAllowed, zaHubStaticParams } from "@/lib/programmatic/zona-azul/routing";

/**
 * /ca/zona-blava/ — "Zona blava per ciutat: horaris i preus": the Catalan
 * edition of /es/zona-azul/ (same cities, same data file). `ca` only.
 * Static: nothing in the server render depends on the date.
 */
export const revalidate = false;
// true: the publish group `zona-azul` revalidates this path; self-hosted, a
// dynamicParams = false route then answers 404. Other locales still 404
// through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string }>;

export function generateStaticParams() {
  return zaHubStaticParams("ca");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return zaHubAllowed("ca", locale) ? zaHubMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  if (!zaHubAllowed("ca", locale)) notFound();
  return <ZaHubRoute locale="ca" />;
}
