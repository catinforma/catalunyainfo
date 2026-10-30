import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ElectionsComarcaPage } from "@/components/programmatic/ElectionsComarcaPage";
import { electionComarcaMetadata } from "@/lib/programmatic/elections/metadata";
import { comarcaStaticParams, resolveComarcaPage } from "@/lib/programmatic/elections/pages";

/**
 * `/es/elecciones/comarca/<comarca>/`: every municipality of a comarca with
 * its 2023 local result, in a table. Serves `es` only (any other locale is a
 * 404). Four comarques are built at deploy, the rest on first request.
 */
const LOCALE = "es";

export const revalidate = false;
export const dynamicParams = true;

export function generateStaticParams() {
  return comarcaStaticParams(LOCALE);
}

type Props = { params: Promise<{ locale: string; comarca: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, comarca } = await params;
  const group = resolveComarcaPage(LOCALE, locale, comarca);
  return group ? electionComarcaMetadata(LOCALE, group) : { robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const { locale, comarca } = await params;
  const group = resolveComarcaPage(LOCALE, locale, comarca);
  if (!group) notFound();
  return <ElectionsComarcaPage locale={LOCALE} group={group} />;
}
