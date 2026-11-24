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
// rendered in, so it regenerates every minute (s-maxage=60 at Cloudflare) from 28 Nov to 7 Dec 2026
// without a deploy or a purge on the night. 60, not 300: the first visit after a phase change is still served
// the old page (x-nextjs-cache STALE) while the new one renders, so the window is one minute, not five.
// Not time-based: revalidate must be a static literal. On 8 Dec 2026 run `node scripts/election-layer-end.mjs` (back to `false`);
// tests/election-day.test.ts fails from 8 Dec until then. The pages stop printing the layer on their own (phase "over").
export const revalidate = 60;
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
