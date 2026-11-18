import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ZonaTensionadaRoute, ztMetadata } from "@/components/programmatic/zona-tensionada/ZonaTensionadaPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /es/calculadoras/zona-tensionada/ — "¿Está mi municipio en zona
 * tensionada?" (lib/programmatic/zona-tensionada/): every declared zona de
 * mercado residencial tensionado from the Ministry of Housing's lists in the
 * BOE, the Generalitat's October 2026 extension and new towns, and what
 * changes for a tenant. Ships with the deploy: no publish group (nothing here
 * is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es" ? ztMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <ZonaTensionadaRoute locale="es" />;
}
