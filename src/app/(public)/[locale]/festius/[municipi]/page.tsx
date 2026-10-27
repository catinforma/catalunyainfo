import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MunicipalityRoute, municipalityMetadata } from "@/components/programmatic/holidays/routes";
import { municipalityStaticParams, resolveMunicipality } from "@/lib/programmatic/holidays/routing";

/**
 * /ca/festius/<municipi>/ — one municipality's holidays. Static forever
 * (`revalidate = false`): the snapshot changes only with a deploy. The 20
 * biggest places are built at deploy, the rest on their first request.
 */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; municipi: string }>;

export function generateStaticParams() {
  return municipalityStaticParams("ca");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, municipi } = await params;
  return resolveMunicipality("ca", locale, municipi) ? municipalityMetadata("ca", municipi) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { locale, municipi } = await params;
  if (!resolveMunicipality("ca", locale, municipi)) notFound();
  return <MunicipalityRoute locale="ca" slug={municipi} />;
}
