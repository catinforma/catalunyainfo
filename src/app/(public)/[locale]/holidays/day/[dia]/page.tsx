import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DateRoute, dateMetadata } from "@/components/programmatic/holidays/routes";
import { dateStaticParams, resolveDatePage } from "@/lib/programmatic/holidays/routing";

/**
 * /en/holidays/day/8-december-2026/ — "Is 8 December 2026 a public holiday in
 * Catalonia?" English has the date pages only: the per-town pages are ca/es.
 */
export const revalidate = false;
export const dynamicParams = false;

type Params = Promise<{ locale: string; dia: string }>;

export function generateStaticParams() {
  return dateStaticParams("en");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, dia } = await params;
  const iso = resolveDatePage("en", locale, dia);
  return iso ? dateMetadata("en", iso) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { locale, dia } = await params;
  const iso = resolveDatePage("en", locale, dia);
  if (!iso) notFound();
  return <DateRoute locale="en" iso={iso} />;
}
