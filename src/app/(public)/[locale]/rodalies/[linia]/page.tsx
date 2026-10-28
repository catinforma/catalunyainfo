import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LinePage } from "@/components/programmatic/rodalies/LinePage";
import { lineMetadata, lineStaticParams, resolveLine } from "@/lib/programmatic/rodalies/pages";

/**
 * One Rodalies line, `/ca/rodalies/<line>/` and `/es/rodalies/<line>/`.
 * Serves ca and es only: `/en/rodalies/<line>/` is a 404 (the English edition
 * is the hub). Static HTML from the committed snapshot, cached until a deploy
 * or an on-demand revalidation; the notices load in the browser.
 */

export const revalidate = false;
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
  return <LinePage line={page.line} locale={page.locale} />;
}
