import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, TownRoute, townMetadata } from "@/components/programmatic/christmas-fairs/routes";
import { resolveTown, townStaticParams } from "@/lib/programmatic/christmas-fairs/routing";

/**
 * /ca/fires-de-nadal/<municipi>/ — one town's Christmas fairs of the season. `ca` only.
 * Only towns with at least one dated fair exist;
 * anything else is a 404. Static (`revalidate = false`), from the committed snapshot.
 */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; municipi: string }>;

export function generateStaticParams() {
  return townStaticParams("ca");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, municipi } = await params;
  const town = resolveTown("ca", locale, municipi);
  return town ? townMetadata("ca", town) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, municipi } = await params;
  const town = resolveTown("ca", locale, municipi);
  if (!town) notFound();
  return <TownRoute locale="ca" town={town} />;
}
