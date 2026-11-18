import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AverageSalaryRoute, wageMetadata } from "@/components/programmatic/average-salary/AverageSalaryPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /es/calculadoras/salario-medio/ — the INE's average salary (EAES) by community, age, sex
 * and sector, the EPA wage deciles and the "people like you" finder
 * (lib/programmatic/average-salary/), from the committed INE snapshot
 * (npm run salary:snapshot). Ships with the deploy: no publish group
 * (nothing here is in the database).
 */
export const revalidate = false;
// Self-hosted, a dynamicParams = false route answers 404 if anything ever revalidates it (NoFallbackError).
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es" ? wageMetadata("es") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "es") notFound();
  return <AverageSalaryRoute locale="es" />;
}
