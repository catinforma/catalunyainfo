import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, TownRoute, townMetadata } from "@/components/programmatic/christmas-fairs/routes";
import { resolveTown, townStaticParams } from "@/lib/programmatic/christmas-fairs/routing";

/**
 * /en/christmas-markets/<municipi>/ — one town's Christmas markets of the season. `en` only.
 * Only towns with at least one dated fair exist, and in English only the towns in EN_TOWNS;
 * anything else is a 404. Static (`revalidate = false`), from the committed snapshot.
 */
export const revalidate = false;
export const dynamicParams = true;

type Params = Promise<{ locale: string; municipi: string }>;

export function generateStaticParams() {
  return townStaticParams("en");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, municipi } = await params;
  const town = resolveTown("en", locale, municipi);
  return town ? townMetadata("en", town) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, municipi } = await params;
  const town = resolveTown("en", locale, municipi);
  if (!town) notFound();
  return <TownRoute locale="en" town={town} />;
}
