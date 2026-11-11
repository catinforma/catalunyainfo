import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GordoHubRoute, NOT_FOUND_METADATA, gordoHubMetadata } from "@/components/programmatic/gordo/routes";
import { hubAllowed, hubStaticParams } from "@/lib/programmatic/gordo/routing";

/**
 * /ca/on-ha-tocat-la-loteria-de-nadal/ — the Christmas lottery hub: before the draw, how it is run
 * and published and how to check a décimo; from the snapshot on, the results
 * and where each main prize was sold. `ca` only. Static, from the committed
 * snapshot (scripts/gordo-snapshot.py; runbook docs/GORDO_NAVIDAD_RUNBOOK.md).
 */
export const revalidate = false;
// true: the publish group `gordo-navidad` revalidates this path; a
// dynamicParams = false route would answer 404 after that (NoFallbackError).
// Other locales still 404 through notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return hubStaticParams("ca");
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return hubAllowed("ca", locale) ? gordoHubMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hubAllowed("ca", locale)) notFound();
  return <GordoHubRoute locale="ca" />;
}
