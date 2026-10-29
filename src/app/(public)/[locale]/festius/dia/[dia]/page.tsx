import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DateRoute, dateMetadata } from "@/components/programmatic/holidays/routes";
import { dateStaticParams, resolveDatePage } from "@/lib/programmatic/holidays/routing";

/** /ca/festius/dia/8-desembre-2026/ — "És festiu el 8 de desembre de 2026 a Catalunya?" All eleven are built at deploy. */
export const revalidate = false;
export const dynamicParams = false;

type Params = Promise<{ locale: string; dia: string }>;

export function generateStaticParams() {
  return dateStaticParams("ca");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, dia } = await params;
  const iso = resolveDatePage("ca", locale, dia);
  return iso ? dateMetadata("ca", iso) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { locale, dia } = await params;
  const iso = resolveDatePage("ca", locale, dia);
  if (!iso) notFound();
  return <DateRoute locale="ca" iso={iso} />;
}
