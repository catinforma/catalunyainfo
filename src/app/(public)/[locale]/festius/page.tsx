import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HubRoute, hubMetadata } from "@/components/programmatic/holidays/routes";
import { hubAllowed } from "@/lib/programmatic/holidays/routing";

/**
 * /ca/festius/ — local holidays of the 300 most populous municipalities, by
 * comarca. Catalan only; /es/festivos/ is its Spanish twin. Data comes from
 * the committed snapshot (src/lib/programmatic/holidays), never the database.
 */
export const revalidate = false;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return hubAllowed("ca", locale) ? hubMetadata("ca") : {};
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hubAllowed("ca", locale)) notFound();
  return <HubRoute locale="ca" />;
}
