import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/components/programmatic/gordo/routes";
import { GrossaCheckRoute, grossaCheckMetadata } from "@/components/programmatic/grossa-check/GrossaCheckPage";

/**
 * /en/check-la-grossa-ticket/ — the La Grossa de Cap d'Any checker (lib/programmatic/grossa-check/):
 * before the draw, what it will do, the prizes and the rules; from the
 * 31 December snapshot (scripts/gordo-snapshot.py --game grossa), the checker and
 * the winning numbers. `en` only. Static, from the committed snapshot;
 * runbook docs/GROSSA_NINO_RUNBOOK.md (publish group `comprobar-grossa`).
 */
export const revalidate = false;
// true: the publish group revalidates this path; a dynamicParams = false
// route would answer 404 after that (NoFallbackError). Other locales still
// 404 through notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? grossaCheckMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <GrossaCheckRoute locale="en" />;
}
