import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TodayPage } from "@/components/programmatic/today/TodayPage";
import { NOT_FOUND_METADATA, todayMetadata } from "@/lib/programmatic/today/page";
import { resolveToday } from "@/lib/programmatic/today/paths";

/**
 * /en/today/ — Today in Catalonia: holidays, strikes, Rodalies, reservoirs and fuel prices.
 * `en` only (any other locale is a 404). Static: the HTML carries no date of
 * its own; today's answers are computed in the browser and the live items read
 * the existing CDN-cached endpoints.
 */
const ROUTE = "en";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveToday(ROUTE, (await params).locale);
  return locale ? todayMetadata(locale) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const locale = resolveToday(ROUTE, (await params).locale);
  if (!locale) notFound();
  return <TodayPage locale={locale} />;
}
