import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WidgetRoute, widgetMetadata } from "@/components/programmatic/embed-2027/WidgetPage";
import { NOT_FOUND_METADATA } from "@/components/programmatic/spain-2027/routes";

/**
 * /en/holidays/2027/for-your-website/ — "Add the 2027 holiday calendar to
 * your website": the picker, preview and code of the embeddable calendar
 * (/embed/en/2027/…). A static folder beside `[community]`: no community slug
 * is this one.
 */
export const revalidate = false;
// true: the publish group `calendari-2027-widget` revalidates this path;
// self-hosted, a dynamicParams = false route then answers 404
// (NoFallbackError). Other locales still 404 through notFound() below.
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en" ? widgetMetadata("en") : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en") notFound();
  return <WidgetRoute locale="en" />;
}
