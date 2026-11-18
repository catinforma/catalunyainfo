import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WarningsRoute, warningsRouteMetadata } from "@/components/programmatic/warnings/WarningsPage";
import { NOT_FOUND_METADATA } from "@/lib/programmatic/warnings/page";
import { resolveWarnings } from "@/lib/programmatic/warnings/paths";

/**
 * /ca/avisos/ and /es/avisos/ — avisos oficials en vigor a Catalunya: AEMET
 * (Meteoalerta), Protecció Civil i Servei Català de Trànsit. Catalan and
 * Spanish share the segment; any other locale is a 404 (English is
 * /en/warnings/). ISR every five minutes with the official reads in the HTML
 * (lib/programmatic/warnings/server.ts, one memoised read).
 */
const SEGMENT = "avisos";

/** SERVER_REVALIDATE_SECONDS in lib/programmatic/warnings/server.ts (a literal: Next reads it statically). */
export const revalidate = 300;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveWarnings(SEGMENT, (await params).locale);
  return locale ? warningsRouteMetadata(locale) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const locale = resolveWarnings(SEGMENT, (await params).locale);
  if (!locale) notFound();
  return <WarningsRoute locale={locale} />;
}
