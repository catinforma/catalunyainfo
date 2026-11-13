import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PvpcRoute, pvpcRouteMetadata } from "@/components/programmatic/pvpc/routes";
import { NOT_FOUND_METADATA } from "@/lib/programmatic/pvpc/pages";
import { resolvePvpc } from "@/lib/programmatic/pvpc/paths";

/**
 * /en/electricity-price-spain/tomorrow/ — tomorrow's PVPC price, or when it is published.
 * `en` only (any other locale is a 404). ISR every 15 minutes with REE's
 * prices in the HTML (lib/programmatic/pvpc/server.ts, one memoised read).
 */
const ROUTE = "en";

/** SERVER_REVALIDATE_SECONDS in lib/programmatic/pvpc/server.ts (a literal: Next reads it statically). */
export const revalidate = 900;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolvePvpc(ROUTE, (await params).locale);
  return locale ? pvpcRouteMetadata(locale, "tomorrow") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const locale = resolvePvpc(ROUTE, (await params).locale);
  if (!locale) notFound();
  return <PvpcRoute locale={locale} which="tomorrow" />;
}
