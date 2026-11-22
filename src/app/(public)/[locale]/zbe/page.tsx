import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, ZbeHubRoute, zbeHubMetadata } from "@/components/programmatic/zbe/routes";
import { zbeHubStaticParams, zbeLocaleFor } from "@/lib/programmatic/zbe/routing";

/**
 * /es/zbe/ and /ca/zbe/ — "ZBE en España: ciudades, etiquetas y horarios":
 * every low-emission zone whose rule was read on the council's own page, and
 * the rest of the DGT directory without a rule (22 Nov 2026). The English
 * edition is /en/low-emission-zones/. Built from the committed snapshot and
 * lib/programmatic/zbe/cities.ts: nothing is fetched at request time.
 */
export const revalidate = false;
// true: the publish group `zbe` revalidates this path; self-hosted, a
// dynamicParams = false route then answers 404 (NoFallbackError). Other
// locales still 404 through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string }>;

export function generateStaticParams() {
  return zbeHubStaticParams("zbe");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const served = zbeLocaleFor("zbe", locale);
  return served ? zbeHubMetadata(served) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  const served = zbeLocaleFor("zbe", locale);
  if (!served) notFound();
  return <ZbeHubRoute locale={served} />;
}
