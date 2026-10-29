import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import "../../globals.css";

import { ConsentGate } from "@/components/ConsentGate";
import { JsonLd } from "@/components/JsonLd";
import { ScrollReset } from "@/components/ScrollReset";
import { fontClassNames } from "@/lib/fonts";
import { getMessages } from "@/lib/i18n";
import { HTML_LANG, LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { graph, organizationSchema, websiteSchema } from "@/lib/seo/jsonld";
import { SITE } from "@/lib/site";

/**
 * This is a root layout: it owns `<html>` and `<body>`.
 *
 * Putting it under `[locale]` rather than at `app/` means `lang` and `dir` come
 * from a static route param, so every public page stays statically renderable.
 * Reading the locale from a header instead would opt the whole site into
 * dynamic rendering and forfeit CDN caching.
 */

/*
 * No `dynamicParams = false` here. Set on this layout it was inherited by the
 * whole subtree, including `[...slug]`, so every article published after the
 * last build answered 404 without the page ever running, until the next
 * deploy (diagnosed 12 Oct 2026 from the prerender manifest: fallback false).
 * Unknown locales still 404: the layout calls notFound(), and the locale-only
 * pages below set dynamicParams = false for themselves.
 */

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0c161c" },
  ],
  colorScheme: "light dark",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);

  return {
    title: {
      default: `${SITE.name} — ${t.home.tagline}`,
      template: `%s · ${SITE.name}`,
    },
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: SITE.productionOrigin }],
    generator: null,
    formatDetection: { telephone: false },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    },
    manifest: "/site.webmanifest",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed = locale as Locale;
  const t = getMessages(typed);

  const siteGraph = graph([
    organizationSchema(),
    websiteSchema(typed),
  ]);

  return (
    <html lang={HTML_LANG[typed]} className={fontClassNames} suppressHydrationWarning>
      <body>
        <a className="ci-skip" href="#main">
          {t.common.skipToContent}
        </a>
        {children}
        <ScrollReset />
        <JsonLd json={siteGraph} />
        <ConsentGate locale={typed} t={{ consent: getMessages(typed).consent, legalLabel: getMessages(typed).nav.legal }} />
      </body>
    </html>
  );
}
