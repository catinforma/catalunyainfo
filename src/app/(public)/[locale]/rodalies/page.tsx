import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HubPage } from "@/components/programmatic/rodalies/HubPage";
import { hubMetadata, resolveHub } from "@/lib/programmatic/rodalies/pages";

/**
 * `/ca/rodalies/`, `/es/rodalies/`, `/en/rodalies/`: live notices on every
 * line, the lines and where they go. The segment is the same word in the three
 * languages, so this one folder serves all three; any other locale is a 404.
 * Static HTML from the committed snapshot; the notices load in the browser.
 */

export const revalidate = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveHub((await params).locale);
  return locale ? hubMetadata(locale) : { robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const locale = resolveHub((await params).locale);
  if (!locale) notFound();
  return <HubPage locale={locale} />;
}
