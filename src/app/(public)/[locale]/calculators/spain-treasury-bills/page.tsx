import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LetrasRoute, letrasMetadata } from "@/components/programmatic/treasury-bills/LetrasPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { loadLetrasData } from "@/lib/programmatic/treasury-bills/server";

/**
 * /en/calculators/spain-treasury-bills/ — "Spanish Treasury bills (Letras
 * del Tesoro): next auctions, latest rate and calculator"
 * (lib/programmatic/treasury-bills/): the Tesoro Público's latest results
 * read from tesoro.es at each regeneration (snapshot fallback), the 2026
 * calendar and a calculator. No publish group: nothing here is in the
 * database.
 */
const LOCALE = "en";

/** SERVER_REVALIDATE_SECONDS (a literal: Next reads it statically). */
export const revalidate = 10800;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: LOCALE }];
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return locale === LOCALE ? letrasMetadata(LOCALE, await loadLetrasData()) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale !== LOCALE) notFound();
  return <LetrasRoute locale={LOCALE} data={await loadLetrasData()} />;
}
