import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SmiRoute, smiMetadata } from "@/components/programmatic/smi/SmiPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { loadSmiBoe } from "@/lib/programmatic/smi/boe";

/**
 * /en/calculators/spain-minimum-wage-2027/ — "Salario mínimo (SMI) 2027" (lib/programmatic/smi/): the
 * last SMI in the BOE, the 2027 status from official documents and a
 * part-time calculator. Regenerated every hour, each time asking the BOE
 * whether the 2027 decree is out, so the page changes the day it is
 * published. No publish group: nothing here is in the database.
 */
const LOCALE = "en";

/** BOE_REVALIDATE_SECONDS (a literal: Next reads it statically). */
export const revalidate = 3600;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: LOCALE }];
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return locale === LOCALE ? smiMetadata(LOCALE, await loadSmiBoe()) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale !== LOCALE) notFound();
  return <SmiRoute locale={LOCALE} data={await loadSmiBoe()} />;
}
