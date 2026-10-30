import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComarcaRoute, comarcaMetadata } from "@/components/programmatic/holidays/routes";
import { comarcaStaticParams, resolveComarca } from "@/lib/programmatic/holidays/routing";

/** /es/festivos/comarca/<comarca>/ — Spanish twin of /ca/festius/comarca/<comarca>/. */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; comarca: string }>;

export function generateStaticParams() {
  return comarcaStaticParams("es");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, comarca } = await params;
  return resolveComarca("es", locale, comarca) ? comarcaMetadata("es", comarca) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { locale, comarca } = await params;
  if (!resolveComarca("es", locale, comarca)) notFound();
  return <ComarcaRoute locale="es" slug={comarca} />;
}
