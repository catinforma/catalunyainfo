import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComarcaRoute, comarcaMetadata } from "@/components/programmatic/holidays/routes";
import { comarcaStaticParams, resolveComarca } from "@/lib/programmatic/holidays/routing";

/**
 * /ca/festius/comarca/<comarca>/ — every municipality of a comarca with its
 * two local days, in a table. Static forever (`revalidate = false`): the
 * snapshot changes only with a deploy. Four comarques are built at deploy,
 * the rest on their first request.
 */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; comarca: string }>;

export function generateStaticParams() {
  return comarcaStaticParams("ca");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, comarca } = await params;
  return resolveComarca("ca", locale, comarca) ? comarcaMetadata("ca", comarca) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { locale, comarca } = await params;
  if (!resolveComarca("ca", locale, comarca)) notFound();
  return <ComarcaRoute locale="ca" slug={comarca} />;
}
