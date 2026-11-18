import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EnglishHubRoute, englishHubMetadata } from "@/components/programmatic/weekend/EnglishWeekend";
import { NOT_FOUND_METADATA } from "@/components/programmatic/weekend/routes";

/**
 * /en/weekend/ — fairs, Christmas markets and the Generalitat's agenda this
 * weekend in Catalonia. `en` only (Catalan and Spanish: /ca/cap-de-setmana/,
 * /es/fin-de-semana/). ISR every hour with the official agenda in the HTML
 * (lib/programmatic/weekend/agenda-server.ts, one memoised read).
 */

/** SERVER_REVALIDATE_SECONDS in lib/programmatic/weekend/agenda-server.ts (a literal: Next reads it statically). */
export const revalidate = 3600;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return (await params).locale === "en" ? englishHubMetadata() : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  if ((await params).locale !== "en") notFound();
  return <EnglishHubRoute />;
}
