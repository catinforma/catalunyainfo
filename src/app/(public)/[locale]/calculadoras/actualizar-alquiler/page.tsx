import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RentRoute, rentMetadata } from "@/components/programmatic/rent-update/RentPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { loadRentData } from "@/lib/programmatic/rent-update/server";

/**
 * /es/calculadoras/actualizar-alquiler/ — "Actualizar el alquiler": the
 * rent-update calculator (lib/programmatic/rent-update/), with the INE's IPC
 * and IRAV read on the server once a day and the snapshot as fallback.
 * No publish group: nothing here is in the database.
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
  return locale === LOCALE ? rentMetadata(LOCALE, await loadRentData()) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale !== LOCALE) notFound();
  return <RentRoute locale={LOCALE} data={await loadRentData()} />;
}
