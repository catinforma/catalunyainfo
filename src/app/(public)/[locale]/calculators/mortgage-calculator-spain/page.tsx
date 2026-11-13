import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MortgageRoute, mortgageMetadata } from "@/components/programmatic/mortgage/MortgagePage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { loadEuriborData } from "@/lib/programmatic/euribor/server";

/**
 * /en/calculators/mortgage-calculator-spain/ — "Spain mortgage calculator: fixed, variable or mixed" (lib/programmatic/mortgage/): the
 * mortgage and revision calculators, with the latest official Euribor from
 * the Banco de España (read once a day, snapshot fallback). No publish
 * group: nothing here is in the database.
 */
const LOCALE = "en";

/** euribor/server.ts SERVER_REVALIDATE_SECONDS (a literal: Next reads it statically). */
export const revalidate = 86400;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: LOCALE }];
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return locale === LOCALE ? mortgageMetadata(LOCALE, await loadEuriborData()) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale !== LOCALE) notFound();
  return <MortgageRoute locale={LOCALE} data={await loadEuriborData()} />;
}
