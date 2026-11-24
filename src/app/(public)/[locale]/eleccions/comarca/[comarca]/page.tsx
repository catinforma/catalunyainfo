import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ElectionsComarcaPage } from "@/components/programmatic/ElectionsComarcaPage";
import { electionComarcaMetadata } from "@/lib/programmatic/elections/metadata";
import { comarcaStaticParams, resolveComarcaPage } from "@/lib/programmatic/elections/pages";

/**
 * `/ca/eleccions/comarca/<comarca>/`: every municipality of a comarca with its
 * 2023 local result, in a table. Serves `ca` only (any other locale is a 404).
 * The static `comarca` segment sits beside `[municipi]`; no municipality's
 * slug is "comarca". Four comarques are built at deploy, the rest on first
 * request, all cached until a deploy.
 */
const LOCALE = "ca";

// 29N election-day layer (lib/programmatic/elections/election-day.ts): the page prints the phase it was
// rendered in, so it regenerates every minute (s-maxage=60 at Cloudflare) from 28 Nov to 7 Dec 2026
// without a deploy or a purge on the night. 60, not 300: the first visit after a phase change is still served
// the old page (x-nextjs-cache STALE) while the new one renders, so the window is one minute, not five.
// Back to `false` in the first deploy after 8 Dec 2026 (tested).
export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return comarcaStaticParams(LOCALE);
}

type Props = { params: Promise<{ locale: string; comarca: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, comarca } = await params;
  const group = resolveComarcaPage(LOCALE, locale, comarca);
  return group ? electionComarcaMetadata(LOCALE, group) : { robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const { locale, comarca } = await params;
  const group = resolveComarcaPage(LOCALE, locale, comarca);
  if (!group) notFound();
  return <ElectionsComarcaPage locale={LOCALE} group={group} />;
}
