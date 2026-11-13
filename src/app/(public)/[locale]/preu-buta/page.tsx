import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ButaneRoute, butaneRouteMetadata } from "@/components/programmatic/butane/ButanePage";
import { NOT_FOUND_METADATA } from "@/lib/programmatic/butane/page";
import { resolveButane } from "@/lib/programmatic/butane/paths";

/**
 * /ca/preu-buta/ — preu màxim de la bombona de butà avui, del BOE.
 * `ca` only (any other locale is a 404). The figures live in
 * lib/programmatic/butane/data.ts (a new BOE revision is one line there and
 * a deploy); the page is regenerated every hour so the day it is about
 * (revision Tuesday, tax month) moves on its own.
 */
const ROUTE = "ca";

/** SERVER_REVALIDATE_SECONDS in lib/programmatic/butane/server.ts (a literal: Next reads it statically). */
export const revalidate = 3600;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveButane(ROUTE, (await params).locale);
  return locale ? butaneRouteMetadata(locale) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const locale = resolveButane(ROUTE, (await params).locale);
  if (!locale) notFound();
  return <ButaneRoute locale={locale} />;
}
