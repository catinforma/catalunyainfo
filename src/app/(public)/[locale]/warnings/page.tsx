import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WarningsRoute, warningsRouteMetadata } from "@/components/programmatic/warnings/WarningsPage";
import { NOT_FOUND_METADATA } from "@/lib/programmatic/warnings/page";
import { resolveWarnings } from "@/lib/programmatic/warnings/paths";

/**
 * /en/warnings/ — official warnings in force in Catalonia: AEMET
 * (Meteoalerta), Protecció Civil and the Servei Català de Trànsit. `en` only
 * (any other locale is a 404; Catalan and Spanish are /ca/avisos/ and
 * /es/avisos/). ISR every five minutes with the official reads in the HTML
 * (lib/programmatic/warnings/server.ts, one memoised read).
 */
const SEGMENT = "warnings";

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
