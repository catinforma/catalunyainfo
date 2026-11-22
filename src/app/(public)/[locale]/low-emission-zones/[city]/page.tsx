import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, ZbeCityRoute, zbeCityMetadata } from "@/components/programmatic/zbe/routes";
import { resolveZbeCity, zbeStaticParams } from "@/lib/programmatic/zbe/routing";

/**
 * /en/low-emission-zones/<city>/ — "<City> low-emission zone (ZBE): can I
 * drive in?". English edition of /es/zbe/<ciudad>/ (see that route): the
 * one foreign drivers land on, so it carries the foreign-plate rules.
 */
export const revalidate = false;
// true: the publish group `zbe` revalidates these paths (see ../../zbe/page.tsx).
// Unknown slugs and other locales still 404 through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string; city: string }>;

export function generateStaticParams() {
  return zbeStaticParams("low-emission-zones", "city");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, city } = await params;
  const page = resolveZbeCity("low-emission-zones", locale, city);
  return page ? zbeCityMetadata(page.locale, page.city) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, city } = await params;
  const page = resolveZbeCity("low-emission-zones", locale, city);
  if (!page) notFound();
  return <ZbeCityRoute locale={page.locale} city={page.city} />;
}
