import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EuriborRoute, euriborMetadata } from "@/components/programmatic/euribor/EuriborPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { loadEuriborData } from "@/lib/programmatic/euribor/server";

/**
 * /es/calculadoras/euribor-hoy/ — "Euríbor hoy: el dato oficial del mes" (lib/programmatic/euribor/): the
 * official monthly Euribor and mortgage reference rates from the Banco de
 * España (be1901.csv, read once a day; snapshot checked against the BOE as
 * fallback). No publish group: nothing here is in the database.
 */
const LOCALE = "es";

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
  return locale === LOCALE ? euriborMetadata(LOCALE, await loadEuriborData()) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale !== LOCALE) notFound();
  return <EuriborRoute locale={LOCALE} data={await loadEuriborData()} />;
}
