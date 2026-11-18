import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ElectionsHubPage } from "@/components/programmatic/ElectionsHubPage";
import { electionsHubMetadata } from "@/lib/programmatic/elections/metadata";
import { resolveElectionsHub } from "@/lib/programmatic/elections/pages";

/** `/ca/eleccions/`: every Catalan municipality page, by comarca. `ca` only. */
const LOCALE = "ca";

// 29N election-day layer (lib/programmatic/elections/election-day.ts): the page prints the phase it was
// rendered in, so it regenerates every 5 minutes (s-maxage=300 at Cloudflare) from 28 Nov to 7 Dec 2026
// without a deploy or a purge on the night. Back to `false` in the first deploy after 8 Dec 2026 (tested).
export const revalidate = 300;

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
