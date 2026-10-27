import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ElectionResultsPage } from "@/components/programmatic/ElectionResultsPage";
import { electionMetadata } from "@/lib/programmatic/elections/metadata";
import { electionsStaticParams, resolveElectionPage } from "@/lib/programmatic/elections/pages";

/**
 * Spanish edition of the election results per municipality
 * (`/es/elecciones/<slug>/`). Serves `es` only: any other locale is a 404.
 */
const LOCALE = "es";

export const revalidate = false;
export const dynamicParams = true;

export function generateStaticParams() {
  return electionsStaticParams(LOCALE);
}

type Props = { params: Promise<{ locale: string; municipi: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, municipi } = await params;
  const municipality = resolveElectionPage(LOCALE, locale, municipi);
  return municipality ? electionMetadata(LOCALE, municipality) : { robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const { locale, municipi } = await params;
  const municipality = resolveElectionPage(LOCALE, locale, municipi);
  if (!municipality) notFound();
  return <ElectionResultsPage locale={LOCALE} municipality={municipality} />;
}
