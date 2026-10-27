import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ElectionsHubPage } from "@/components/programmatic/ElectionsHubPage";
import { electionsHubMetadata } from "@/lib/programmatic/elections/metadata";
import { resolveElectionsHub } from "@/lib/programmatic/elections/pages";

/** `/es/elecciones/`: every Spanish municipality page, by comarca. `es` only. */
const LOCALE = "es";

export const revalidate = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return resolveElectionsHub(LOCALE, locale) ? electionsHubMetadata(LOCALE) : { robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!resolveElectionsHub(LOCALE, locale)) notFound();
  return <ElectionsHubPage locale={LOCALE} />;
}
