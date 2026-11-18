import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReportRoute, reportMetadata } from "@/components/programmatic/holidays/LocalDataReport";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/festius/dades-festius-locals/ — "Festius locals de Catalunya: els dies
 * que més es repeteixen", the data report (lib/programmatic/holidays/report.ts).
 * A static folder beside `[municipi]`: no town slug is this one (a test holds it).
 * Ships with the deploy; the publish group `festius-locals-dades` revalidates,
 * purges and IndexNow-pings it.
 */
export const revalidate = false;
// true: a publish group revalidates this path; self-hosted, a dynamicParams =
// false route then answers 404 (NoFallbackError). Other locales still 404.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? reportMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <ReportRoute locale="ca" />;
}
