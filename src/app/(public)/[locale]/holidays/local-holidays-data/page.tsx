import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReportRoute, reportMetadata } from "@/components/programmatic/holidays/LocalDataReport";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/holidays/local-holidays-data/ — "Catalonia local holidays: the most
 * common dates, in data", the data report (lib/programmatic/holidays/report.ts).
 * A static folder beside `[municipi]`: no town slug is this one (a test holds it).
 */
export const revalidate = false;
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? reportMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <ReportRoute locale="en" />;
}
