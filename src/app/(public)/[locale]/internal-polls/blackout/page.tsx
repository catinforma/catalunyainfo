import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PollsBlackoutPage } from "@/components/programmatic/polls/PollsBlackoutPage";
import { isLocale } from "@/lib/i18n/config";
import { NOT_FOUND_METADATA, pollsMetadata } from "@/lib/programmatic/polls/page";

/**
 * The 29N polls page inside the LOREG 69.7 window (24 Nov 2026 00:00 to
 * 29 Nov 21:00, Madrid): the law, the return time and the official results
 * links, never a figure. Its output does not depend on the date, so it is
 * prerendered and served from the ISR cache; the proxy (src/proxy.ts,
 * lib/programmatic/polls/routing.ts) rewrites the public guide URLs here while
 * the window is open. Outside it they go to the force-dynamic `../page.tsx`.
 *
 * Requested directly, at any date, it shows the same figure-free page. The
 * revalidate only refreshes the header and footer navigation. Cache headers:
 * next.config.ts (POLLS_CACHE_HEADERS), `private, no-store` like the dynamic
 * route, so no shared cache keeps a copy of the public URL either way.
 */
export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? pollsMetadata(locale) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <PollsBlackoutPage locale={locale} />;
}
