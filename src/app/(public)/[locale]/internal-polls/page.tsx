import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PollsPage } from "@/components/programmatic/polls/PollsPage";
import { isLocale } from "@/lib/i18n/config";
import { NOT_FOUND_METADATA, pollsMetadata } from "@/lib/programmatic/polls/page";

/**
 * The official 29N polls page (CIS, CEO), served at its localised guide URLs
 * through rewrites in next.config.ts (`pollsRewrites()`), the way internal
 * search is: `/ca/guies/enquestes-eleccions-generals-catalunya/`,
 * `/es/guias/encuestas-elecciones-generales-cataluna/`,
 * `/en/guides/spain-general-election-polls-catalonia/`. A route folder under
 * `guies/` would shadow the catch-all (tests forbid it); a page inside the
 * catch-all would inherit its ISR. Canonical and hreflang point at the public
 * URLs.
 *
 * Rendered on every request, never prerendered or cached: whether the poll
 * figures may be shown depends on the clock (LOREG art. 69.7 blackout, 24 Nov
 * 2026 00:00 to 29 Nov 21:00, Madrid), so a stored copy could carry them into
 * the window. Do not add revalidate, static params or force-static here:
 * tests/polls-blackout.test.ts fails if you do. Cache headers: next.config.ts
 * (POLLS_CACHE_HEADERS).
 */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? pollsMetadata(locale) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <PollsPage locale={locale} />;
}
