import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ElectionsHubPage } from "@/components/programmatic/ElectionsHubPage";
import { electionsHubMetadata } from "@/lib/programmatic/elections/metadata";
import { resolveElectionsHub } from "@/lib/programmatic/elections/pages";

/** `/es/elecciones/`: every Spanish municipality page, by comarca. `es` only. */
const LOCALE = "es";

// 29N election-day layer (lib/programmatic/elections/election-day.ts): the page prints the phase it was
// rendered in, so it regenerates every minute (s-maxage=60 at Cloudflare) from 28 Nov to 7 Dec 2026
// without a deploy or a purge on the night. 60, not 300: the first visit after a phase change is still served
// the old page (x-nextjs-cache STALE) while the new one renders, so the window is one minute, not five.
// Not time-based: revalidate must be a static literal. On 8 Dec 2026 run `node scripts/election-layer-end.mjs` (back to `false`);
// tests/election-day.test.ts fails from 8 Dec until then. The pages stop printing the layer on their own (phase "over").
export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return resolveElectionsHub(LOCALE, locale) ? electionsHubMetadata(LOCALE) : { robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!resolveElectionsHub(LOCALE, locale)) notFound();
  return <ElectionsHubPage locale={LOCALE} />;
}
