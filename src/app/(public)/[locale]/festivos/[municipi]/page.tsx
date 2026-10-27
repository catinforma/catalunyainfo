import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MunicipalityRoute, municipalityMetadata } from "@/components/programmatic/holidays/routes";
import { municipalityStaticParams, resolveMunicipality } from "@/lib/programmatic/holidays/routing";

/** /es/festivos/<municipio>/ — Spanish twin of /ca/festius/<municipi>/. */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; municipi: string }>;

export function generateStaticParams() {
  return municipalityStaticParams("es");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, municipi } = await params;
  return resolveMunicipality("es", locale, municipi) ? municipalityMetadata("es", municipi) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { locale, municipi } = await params;
  if (!resolveMunicipality("es", locale, municipi)) notFound();
  return <MunicipalityRoute locale="es" slug={municipi} />;
}
