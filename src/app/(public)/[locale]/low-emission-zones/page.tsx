import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, ZbeHubRoute, zbeHubMetadata } from "@/components/programmatic/zbe/routes";
import { zbeHubStaticParams, zbeLocaleFor } from "@/lib/programmatic/zbe/routing";

/**
 * /en/low-emission-zones/ — "Low-emission zones in Spain (ZBE): cities,
 * labels and hours". English edition of /es/zbe/ (see that route).
 */
export const revalidate = false;
// true: the publish group `zbe` revalidates this path; self-hosted, a
// dynamicParams = false route then answers 404 (NoFallbackError). Other
// locales still 404 through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string }>;

export function generateStaticParams() {
  return zbeHubStaticParams("low-emission-zones");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const served = zbeLocaleFor("low-emission-zones", locale);
  return served ? zbeHubMetadata(served) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  const served = zbeLocaleFor("low-emission-zones", locale);
  if (!served) notFound();
  return <ZbeHubRoute locale={served} />;
}
