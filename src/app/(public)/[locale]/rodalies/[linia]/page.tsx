import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LinePage } from "@/components/programmatic/rodalies/LinePage";
import { lineMetadata, lineStaticParams, resolveLine } from "@/lib/programmatic/rodalies/pages";
import { forLine, loadServerAlerts } from "@/lib/programmatic/rodalies/server";

/**
 * One Rodalies line, `/ca/rodalies/<line>/` and `/es/rodalies/<line>/`.
 * Serves ca and es only: `/en/rodalies/<line>/` is a 404 (the English edition
 * is the hub). Facts from the committed snapshot; ISR every five minutes with
 * the notices read at render in the HTML (lib/programmatic/rodalies/server.ts,
 * printed with their read time), read again in the browser.
 */

/** SERVER_REVALIDATE_SECONDS (a literal: Next reads it statically). */
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return lineStaticParams();
}

type Props = { params: Promise<{ locale: string; linia: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, linia } = await params;
  const page = resolveLine(locale, linia);
  return page ? lineMetadata(page.line, page.locale) : { robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const { locale, linia } = await params;
  const page = resolveLine(locale, linia);
  if (!page) notFound();
  return <LinePage line={page.line} locale={page.locale} initial={forLine(await loadServerAlerts(), page.line.id)} />;
}
