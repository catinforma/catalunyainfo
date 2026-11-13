import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PensionRoute, pensionMetadata } from "@/components/programmatic/pensions-2027/PensionPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { loadPensionData } from "@/lib/programmatic/pensions-2027/server";

/**
 * /en/calculators/spain-pension-increase-2027/ — the 2027 pension increase calculator
 * (lib/programmatic/pensions-2027/), with the INE's CPI read on the server
 * once a day and the rent-update snapshot as fallback. No publish group:
 * nothing here is in the database.
 */
const LOCALE = "en";

/** SERVER_REVALIDATE_SECONDS (a literal: Next reads it statically). */
export const revalidate = 86400;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: LOCALE }];
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return locale === LOCALE ? pensionMetadata(LOCALE, await loadPensionData()) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale !== LOCALE) notFound();
  return <PensionRoute locale={LOCALE} data={await loadPensionData()} />;
}
