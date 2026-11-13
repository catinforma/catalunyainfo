import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LeaveRoute, leaveMetadata } from "@/components/programmatic/leave-2027/LeavePage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /es/festivos/2027/aprovechar-vacaciones/ — "Cómo aprovechar los festivos 2027": the 2027 leave planner
 * (lib/programmatic/leave-2027/), server-rendered for Barcelona and 5 days.
 * A static folder beside `[comunidad]`: no community slug is this one.
 * Ships with the deploy: no publish group (nothing here is in the database).
 */
export const revalidate = false;
// true, like the 2027 calendar's other static folders: self-hosted, a
// dynamicParams = false route answers 404 if anything ever revalidates it
// (NoFallbackError). Other locales still 404 through notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es" ? leaveMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <LeaveRoute locale="es" />;
}
