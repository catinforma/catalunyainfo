import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/components/programmatic/gordo/routes";
import { NinoCheckRoute, ninoCheckMetadata } from "@/components/programmatic/nino-check/NinoCheckPage";

/**
 * /es/comprobar-loteria-nino/ — the El Niño lottery checker (lib/programmatic/nino-check/):
 * before the draw, what it will do, the prizes and the rules; from the
 * 6 January snapshot (scripts/gordo-snapshot.py --game nino), the checker and
 * the winning numbers. `es` only. Static, from the committed snapshot;
 * runbook docs/GROSSA_NINO_RUNBOOK.md (publish group `comprobar-nino`).
 */
export const revalidate = false;
// true: the publish group revalidates this path; a dynamicParams = false
// route would answer 404 after that (NoFallbackError). Other locales still
// 404 through notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es" ? ninoCheckMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <NinoCheckRoute locale="es" />;
}
