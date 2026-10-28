import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HubPage } from "@/components/programmatic/mountain/HubPage";
import { NOT_FOUND_METADATA, hubMetadata, resolveHub } from "@/lib/programmatic/mountain/pages";

/**
 * /ca/temps-muntanya/: el temps a les estacions d'esquí i a la muntanya.
 * Només `ca`; qualsevol altre locale en aquesta carpeta és un 404. HTML
 * estàtic de la instantània; les lectures es carreguen al navegador des de
 * /api/mountain/weather/.
 */

export const revalidate = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveHub("ca", (await params).locale);
  return locale ? hubMetadata(locale) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const locale = resolveHub("ca", (await params).locale);
  if (!locale) notFound();
  return <HubPage locale={locale} />;
}
