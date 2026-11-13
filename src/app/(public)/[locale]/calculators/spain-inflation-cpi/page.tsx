import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IpcRoute, ipcMetadata } from "@/components/programmatic/ipc/IpcPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { loadIpcData } from "@/lib/programmatic/ipc/server";

/**
 * /en/calculators/spain-inflation-cpi/ — "IPC hoy: último dato y calendario del INE"
 * (lib/programmatic/ipc/), read from the INE's API once a day with the
 * committed snapshot as fallback. No publish group: nothing here is in the
 * database.
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
  return locale === LOCALE ? ipcMetadata(LOCALE, await loadIpcData()) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (locale !== LOCALE) notFound();
  return <IpcRoute locale={LOCALE} data={await loadIpcData()} />;
}
