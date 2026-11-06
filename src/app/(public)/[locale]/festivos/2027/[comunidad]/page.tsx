import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CommunityRoute, NOT_FOUND_METADATA, communityMetadata } from "@/components/programmatic/spain-2027/routes";
import { communityStaticParams, resolveCommunity } from "@/lib/programmatic/spain-2027/paths";

/** /es/festivos/2027/<comunidad>/ — "Calendario laboral 2027 de <comunidad>: festivos y puentes". */
export const revalidate = false;
// true: revalidated by the publish group `calendario-2027-espana` (see ../page.tsx).
// Unknown slugs and other locales still 404 through notFound() below.
export const dynamicParams = true;

type Params = Promise<{ locale: string; comunidad: string }>;

export function generateStaticParams() {
  return communityStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, comunidad } = await params;
  return resolveCommunity(locale, comunidad) ? communityMetadata(comunidad) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, comunidad } = await params;
  const c = resolveCommunity(locale, comunidad);
  if (!c) notFound();
  return <CommunityRoute c={c} />;
}
