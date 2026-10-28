import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HubPage } from "@/components/programmatic/mountain/HubPage";
import { NOT_FOUND_METADATA, hubMetadata, resolveHub } from "@/lib/programmatic/mountain/pages";

/**
 * /en/mountain-weather/: ski resort and mountain weather. English only (the
 * place pages exist in ca and es); any other locale in this folder is a 404.
 * Static HTML from the committed snapshot; the readings load in the browser
 * from /api/mountain/weather/.
 */

export const revalidate = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveHub("en", (await params).locale);
  return locale ? hubMetadata(locale) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const locale = resolveHub("en", (await params).locale);
  if (!locale) notFound();
  return <HubPage locale={locale} />;
}
