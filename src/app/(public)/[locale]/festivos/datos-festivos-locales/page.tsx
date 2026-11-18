import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReportRoute, reportMetadata } from "@/components/programmatic/holidays/LocalDataReport";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /es/festivos/datos-festivos-locales/ — "Festivos locales de Cataluña: los
 * días que más se repiten", the data report (lib/programmatic/holidays/report.ts).
 * A static folder beside `[municipi]`: no town slug is this one (a test holds it).
 */
export const revalidate = false;
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es" ? reportMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <ReportRoute locale="es" />;
}
