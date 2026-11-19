import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AndaluciaInheritanceTaxRoute } from "@/components/programmatic/inheritance-tax/AndaluciaInheritanceTaxPage";
import { regionMetadata } from "@/components/programmatic/inheritance-tax/RegionalInheritanceTaxBody";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /es/calculadoras/impuesto-sucesiones-andalucia/ — inheritance tax in Andalucía
 * (lib/programmatic/inheritance-tax/regions/andalucia.ts: Ley 5/2021 de Tributos Cedidos, arts. 26-29 and 37-39): one heir's
 * tax, server-rendered on the page's first example, with the scale,
 * reductions and rebate tables. Static: no publish group, it ships with the
 * deploy.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es" ? regionMetadata("andalucia", "es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <AndaluciaInheritanceTaxRoute locale="es" />;
}
