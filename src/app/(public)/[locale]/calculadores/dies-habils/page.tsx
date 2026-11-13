import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { WorkingDaysRoute, workingDaysMetadata } from "@/components/programmatic/working-days/WorkingDaysPage";

/**
 * /ca/calculadores/dies-habils/ — the working-days and deadlines calculator
 * (lib/programmatic/working-days/), server-rendered with the default example.
 * Built from the holiday modules at build time: no publish group, it ships
 * with the deploy (and picks up the DOGC 2027 local order with the next one).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? workingDaysMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <WorkingDaysRoute locale="ca" />;
}
