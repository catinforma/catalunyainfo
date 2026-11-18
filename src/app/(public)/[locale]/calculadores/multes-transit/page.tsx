import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { TrafficFinesRoute, trafficFinesMetadata } from "@/components/programmatic/traffic-fines/TrafficFinesPage";

/**
 * /ca/calculadores/multes-transit/ — «Multes de trànsit: terminis, descompte
 * del 50 % i recursos» (lib/programmatic/traffic-fines/): the deadline
 * calculator (Ley de Tráfico arts. 93-96, 110 and 112; Ley 39/2015 art.
 * 30.5), server-rendered on a fixed example, the 50 % and the fines without
 * it, points and surcharges. Static: no publish group, it ships with the
 * deploy.
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if it is ever revalidated.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? trafficFinesMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <TrafficFinesRoute locale="ca" />;
}
