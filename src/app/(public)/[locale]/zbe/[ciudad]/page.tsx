import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA, ZbeCityRoute, zbeCityMetadata } from "@/components/programmatic/zbe/routes";
import { resolveZbeCity, zbeStaticParams } from "@/lib/programmatic/zbe/routing";

/**
 * /es/zbe/<ciudad>/ and /ca/zbe/<ciutat>/ — "ZBE <Ciudad>: ¿puedo entrar con
 * mi coche?": the answer by DGT label, the days and hours, whether it applies
 * today, the area, the exemptions and the fine, each with the council page it
 * was read on. One page per zone; the English edition is
 * /en/low-emission-zones/<city>/.
 */
export const revalidate = false;
// true: the publish group `zbe` revalidates these paths (see ../page.tsx).
// Unknown slugs and other locales still 404 through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string; ciudad: string }>;

export function generateStaticParams() {
  return zbeStaticParams("zbe", "ciudad");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, ciudad } = await params;
  const page = resolveZbeCity("zbe", locale, ciudad);
  return page ? zbeCityMetadata(page.locale, page.city) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, ciudad } = await params;
  const page = resolveZbeCity("zbe", locale, ciudad);
  if (!page) notFound();
  return <ZbeCityRoute locale={page.locale} city={page.city} />;
}
