import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubsidyRoute, subsidyMetadata } from "@/components/programmatic/unemployment-subsidy/SubsidyPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/subsidi-atur/ — "Subsidi per desocupació 2026"
 * (lib/programmatic/unemployment-subsidy/): who qualifies, how much and for how
 * long (LGSS arts. 274-280 and DA 57ª-58ª as reformed by RDL 2/2024), plus the
 * IMV 2026 amounts; server-rendered with the default example. Ships with the
 * deploy: no publish group (nothing here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? subsidyMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <SubsidyRoute locale="ca" />;
}
