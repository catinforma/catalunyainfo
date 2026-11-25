import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarketsTownRoute, NOT_FOUND_METADATA, marketsTownMetadata } from "@/components/programmatic/weekly-markets/routes";
import { marketsTownStaticParams, resolveMarketTown } from "@/lib/programmatic/weekly-markets/routing";

/**
 * /es/mercados-semanales/<municipio>/ — one town's weekly street markets: the next
 * session, place and hours of each market, dated holiday exceptions and
 * their sources. `es` only. One URL per town: the square a reader picks
 * and the day never reach the URL. ISR (see the hub).
 */
export const revalidate = 3600;
export const dynamicParams = true;

type Params = Promise<{ locale: string; municipio: string }>;

export function generateStaticParams() {
  return marketsTownStaticParams("es", "municipio");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, municipio } = await params;
  const town = resolveMarketTown("es", locale, municipio);
  return town ? marketsTownMetadata("es", town) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, municipio } = await params;
  const town = resolveMarketTown("es", locale, municipio);
  if (!town) notFound();
  return <MarketsTownRoute locale="es" town={town} />;
}
