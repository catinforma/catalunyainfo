import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";
import { CommunityRouteIntl, communityMetadataIntl } from "@/components/programmatic/spain-2027/routes-intl";
import { editionCommunityParams, resolveEditionCommunity } from "@/lib/programmatic/spain-2027/editions";

/**
 * /ca/festius/2027/<comunitat>/ — one community or city's 2027 calendar (19 pages).
 */
export const revalidate = false;
// true: the publish group `calendario-2027-espana` revalidates this path;
// self-hosted, a dynamicParams = false route then answers 404
// (NoFallbackError). Other locales and unknown slugs still 404 through
// notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string; comunitat: string }>;

export function generateStaticParams() {
  return editionCommunityParams("ca", "comunitat");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, comunitat } = await params;
  const c = resolveEditionCommunity("ca", locale, comunitat);
  return c ? communityMetadataIntl(c, "ca") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, comunitat } = await params;
  const c = resolveEditionCommunity("ca", locale, comunitat);
  if (!c) notFound();
  return <CommunityRouteIntl c={c} locale="ca" />;
}
