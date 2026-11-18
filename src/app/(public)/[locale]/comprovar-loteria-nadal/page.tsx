import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/components/programmatic/gordo/routes";
import { LotteryCheckRoute, lotteryCheckMetadata } from "@/components/programmatic/lottery-check/LotteryCheckPage";

/**
 * /ca/comprovar-loteria-nadal/ — the Christmas lottery checker (lib/programmatic/lottery-check/):
 * before the draw, what it will do, every prize and the rules; from the
 * 22 December snapshot (scripts/gordo-snapshot.py), the checker, the winning
 * numbers and the full pedrea. `ca` only. Static, from the committed
 * snapshot; runbook docs/GORDO_NAVIDAD_RUNBOOK.md (publish groups
 * `comprobar-loteria` and `gordo-navidad`).
 */
export const revalidate = false;
// true: the publish groups revalidate this path; a dynamicParams = false
// route would answer 404 after that (NoFallbackError). Other locales still
// 404 through notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "ca" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ca" ? lotteryCheckMetadata("ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ca") notFound();
  return <LotteryCheckRoute locale="ca" />;
}
