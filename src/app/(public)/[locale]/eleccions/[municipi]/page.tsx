import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ElectionResultsPage } from "@/components/programmatic/ElectionResultsPage";
import { electionMetadata } from "@/lib/programmatic/elections/metadata";
import { electionsStaticParams, resolveElectionPage } from "@/lib/programmatic/elections/pages";

/**
 * Catalan edition of the election results per municipality
 * (`/ca/eleccions/<slug>/`). Serves `ca` only: any other locale is a 404, so
 * the `[...slug]` catch-all is untouched. Data from the committed snapshot,
 * cached until a deploy or an on-demand revalidation.
 */
const LOCALE = "ca";

// 29N election-day layer (lib/programmatic/elections/election-day.ts): the page prints the phase it was
// rendered in, so it regenerates every 5 minutes (s-maxage=300 at Cloudflare) from 28 Nov to 7 Dec 2026
// without a deploy or a purge on the night. Back to `false` in the first deploy after 8 Dec 2026 (tested).
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return electionsStaticParams(LOCALE);
}

type Props = { params: Promise<{ locale: string; municipi: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, municipi } = await params;
  const municipality = resolveElectionPage(LOCALE, locale, municipi);
  return municipality ? electionMetadata(LOCALE, municipality) : { robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const { locale, municipi } = await params;
  const municipality = resolveElectionPage(LOCALE, locale, municipi);
  if (!municipality) notFound();
  return <ElectionResultsPage locale={LOCALE} municipality={municipality} />;
}
