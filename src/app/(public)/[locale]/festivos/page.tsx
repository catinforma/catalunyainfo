import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HubRoute, hubMetadata } from "@/components/programmatic/holidays/routes";
import { hubAllowed } from "@/lib/programmatic/holidays/routing";

/** /es/festivos/ — Spanish twin of /ca/festius/. */
export const revalidate = false;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return hubAllowed("es", locale) ? hubMetadata("es") : {};
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hubAllowed("es", locale)) notFound();
  return <HubRoute locale="es" />;
}
