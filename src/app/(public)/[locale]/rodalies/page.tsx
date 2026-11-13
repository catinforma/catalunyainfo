import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HubPage } from "@/components/programmatic/rodalies/HubPage";
import { hubMetadata, resolveHub } from "@/lib/programmatic/rodalies/pages";
import { loadServerAlerts } from "@/lib/programmatic/rodalies/server";

/**
 * `/ca/rodalies/`, `/es/rodalies/`, `/en/rodalies/`: live notices on every
 * line, the lines and where they go. The segment is the same word in the three
 * languages, so this one folder serves all three; any other locale is a 404.
 * Facts from the committed snapshot; ISR every five minutes with the notices
 * read at render in the HTML (lib/programmatic/rodalies/server.ts, printed
 * with their read time), read again in the browser.
 */

/** SERVER_REVALIDATE_SECONDS (a literal: Next reads it statically). */
export const revalidate = 300;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveHub((await params).locale);
  return locale ? hubMetadata(locale) : { robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const locale = resolveHub((await params).locale);
  if (!locale) notFound();
  return <HubPage locale={locale} initial={await loadServerAlerts()} />;
}
