import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EnglishHubRoute, englishHubMetadata } from "@/components/programmatic/holidays/routes";
import { hubAllowed } from "@/lib/programmatic/holidays/routing";

/**
 * /en/holidays/ — Catalonia's bank holidays for this year and next, and the
 * local holidays of the English towns (the 11 largest and the resorts).
 * English only; /ca/festius/ and /es/festivos/ list every town. Data comes
 * from the committed snapshot (src/lib/programmatic/holidays), never the database.
 */
export const revalidate = false;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return hubAllowed("en", locale) ? englishHubMetadata() : {};
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hubAllowed("en", locale)) notFound();
  return <EnglishHubRoute />;
}
