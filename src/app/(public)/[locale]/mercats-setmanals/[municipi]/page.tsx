import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarketsTownRoute, NOT_FOUND_METADATA, marketsTownMetadata } from "@/components/programmatic/weekly-markets/routes";
import { marketsTownStaticParams, resolveMarketTown } from "@/lib/programmatic/weekly-markets/routing";

/**
 * /ca/mercats-setmanals/<municipi>/ — one town's weekly street markets: the next
 * session, place and hours of each market, dated holiday exceptions and
 * their sources. `ca` only. One URL per town: the square a reader picks
 * and the day never reach the URL. ISR (see the hub).
 */
export const revalidate = 3600;
export const dynamicParams = true;

type Params = Promise<{ locale: string; municipi: string }>;

export function generateStaticParams() {
  return marketsTownStaticParams("ca", "municipi");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, municipi } = await params;
  const town = resolveMarketTown("ca", locale, municipi);
  return town ? marketsTownMetadata("ca", town) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, municipi } = await params;
  const town = resolveMarketTown("ca", locale, municipi);
  if (!town) notFound();
  return <MarketsTownRoute locale="ca" town={town} />;
}
