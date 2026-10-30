import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EnglishTownRoute, englishTownMetadata } from "@/components/programmatic/holidays/routes";
import { englishTownStaticParams, resolveMunicipality } from "@/lib/programmatic/holidays/routing";

/**
 * /en/holidays/<municipi>/ — one town's public holidays, in English, for the
 * English selection only (the 11 largest and the resorts, shared with the
 * election pages: lib/programmatic/elections/english.ts). Every one of them is
 * built at deploy and no other slug is allowed: any other town, and any other
 * locale, is a 404. The static `day` folder next to this one keeps
 * /en/holidays/day/<date>/ for the date pages.
 */
export const revalidate = false;
export const dynamicParams = false;

type Params = Promise<{ locale: string; municipi: string }>;

export function generateStaticParams() {
  return englishTownStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, municipi } = await params;
  return resolveMunicipality("en", locale, municipi) ? englishTownMetadata(municipi) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { locale, municipi } = await params;
  if (!resolveMunicipality("en", locale, municipi)) notFound();
  return <EnglishTownRoute slug={municipi} />;
}
