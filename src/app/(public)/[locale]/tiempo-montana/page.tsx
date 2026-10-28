import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HubPage } from "@/components/programmatic/mountain/HubPage";
import { NOT_FOUND_METADATA, hubMetadata, resolveHub } from "@/lib/programmatic/mountain/pages";

/**
 * /es/tiempo-montana/: el tiempo en las estaciones de esquí y la montaña.
 * Solo `es`; cualquier otro locale en esta carpeta es un 404. HTML estático
 * de la instantánea; las lecturas se cargan en el navegador desde
 * /api/mountain/weather/.
 */

export const revalidate = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveHub("es", (await params).locale);
  return locale ? hubMetadata(locale) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const locale = resolveHub("es", (await params).locale);
  if (!locale) notFound();
  return <HubPage locale={locale} />;
}
