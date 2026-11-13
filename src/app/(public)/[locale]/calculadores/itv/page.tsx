import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ItvRoute, itvMetadata } from "@/components/programmatic/itv/ItvPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /ca/calculadores/itv/ — "Quan em toca passar l'ITV?" (lib/programmatic/itv/):
 * the calculator (RD 920/2017 art. 6), server-rendered on a fixed example,
 * and the official fee per community. Static: no publish group, it ships
 * with the deploy.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? itvMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <ItvRoute locale="ca" />;
}
