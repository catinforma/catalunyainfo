import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarketsHubRoute, NOT_FOUND_METADATA, marketsHubMetadata } from "@/components/programmatic/weekly-markets/routes";
import { marketsHubAllowed, marketsHubStaticParams } from "@/lib/programmatic/weekly-markets/routing";

/**
 * /en/weekly-markets/ — Weekly markets in Catalonia: Vic and Mataró: the next session of the weekly street markets
 * of Vic and Mataró (lib/programmatic/weekly-markets/data.ts, read on each
 * council's own page). `en` only.
 * ISR: the next session is computed on the server in Europe/Madrid, so the
 * page is rebuilt at most an hour old (and right after midnight by the
 * nightly job, `weeklyMarketsRefreshPaths`).
 */
export const revalidate = 3600;
// true: the publish group `mercats-setmanals` revalidates this path; self-hosted, a
// dynamicParams = false route then answers 404. Other locales still 404
// through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string }>;

export function generateStaticParams() {
  return marketsHubStaticParams("en");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return marketsHubAllowed("en", locale) ? marketsHubMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  if (!marketsHubAllowed("en", locale)) notFound();
  return <MarketsHubRoute locale="en" />;
}
