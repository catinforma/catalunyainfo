import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EnglishBarcelonaRoute, englishBarcelonaMetadata } from "@/components/programmatic/weekend/EnglishWeekend";
import { NOT_FOUND_METADATA } from "@/components/programmatic/weekend/routes";

/**
 * /en/weekend/barcelona/ — things to do in Barcelona this weekend, from the
 * Ajuntament de Barcelona's agenda (Open Data BCN) and the Generalitat's.
 * `en` only (Catalan and Spanish: /ca/cap-de-setmana/barcelona/,
 * /es/fin-de-semana/barcelona/). ISR every hour with the agenda in the HTML.
 */

/** SERVER_REVALIDATE_SECONDS in lib/programmatic/weekend/agenda-server.ts (a literal: Next reads it statically). */
export const revalidate = 3600;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return (await params).locale === "en" ? englishBarcelonaMetadata() : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  if ((await params).locale !== "en") notFound();
  return <EnglishBarcelonaRoute />;
}
