import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GordoHubRoute, NOT_FOUND_METADATA, gordoHubMetadata } from "@/components/programmatic/gordo/routes";
import { hubAllowed, hubStaticParams } from "@/lib/programmatic/gordo/routing";

/**
 * /en/spanish-christmas-lottery-results/ — the Christmas lottery hub: before the draw, how it is run
 * and published and how to check a décimo; from the snapshot on, the results
 * and where each main prize was sold. `en` only. Static, from the committed
 * snapshot (scripts/gordo-snapshot.py; runbook docs/GORDO_NAVIDAD_RUNBOOK.md).
 */
export const revalidate = false;
// true: the publish group `gordo-navidad` revalidates this path; a
// dynamicParams = false route would answer 404 after that (NoFallbackError).
// Other locales still 404 through notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return hubStaticParams("en");
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return hubAllowed("en", locale) ? gordoHubMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hubAllowed("en", locale)) notFound();
  return <GordoHubRoute locale="en" />;
}
