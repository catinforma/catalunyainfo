import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { comarcaDescription, comarcaTitle, dateQuestion, hubCopy, municipalityDescription, municipalityFaq, municipalityTitle } from "@/lib/programmatic/holidays/copy";
import { comarcaBySlug, municipalityBySlug, nextYearFor } from "@/lib/programmatic/holidays/data";
import { dateContent } from "@/lib/programmatic/holidays/dates";
import type { DateLocale } from "@/lib/programmatic/holidays/format";
import {
  comarcaPath,
  comarcaTranslations,
  datePath,
  dateTranslations,
  hubPath,
  hubTranslations,
  municipalityPath,
  municipalityTranslations,
  type DatePage,
  type MuniLocale,
} from "@/lib/programmatic/holidays/paths";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { ComarcaPage, comarcaCrumbs } from "./ComarcaPage";
import { DatePageView, dateCrumbs } from "./DatePage";
import { HubPage, hubCrumbs } from "./HubPage";
import { MunicipalityPage, municipalityCrumbs } from "./MunicipalityPage";

/**
 * Route bodies for the holiday family. Each `page.tsx` under
 * `app/(public)/[locale]/{festius,festivos,holidays}` is a thin wrapper that
 * fixes its locale and calls one of these, so the three locales cannot drift.
 */

/* ---------------------------------------------------------------- Hub --- */

export function hubMetadata(locale: MuniLocale): Metadata {
  const t = hubCopy(locale);
  return buildMetadata({ locale, path: hubPath(locale), title: t.title, description: t.description, translations: hubTranslations() });
}

export function HubRoute({ locale }: { locale: MuniLocale }) {
  return (
    <>
      <SiteHeader locale={locale} translations={hubTranslations()} />
      <main id="main">
        <HubPage locale={locale} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(hubCrumbs(locale))])} />
      <SiteFooter locale={locale} />
    </>
  );
}

/* ------------------------------------------------------- Municipality --- */

export function municipalityMetadata(locale: MuniLocale, slug: string): Metadata {
  const m = municipalityBySlug(slug);
  if (!m) return { robots: { index: false, follow: false } };
  return buildMetadata({
    locale,
    path: municipalityPath(locale, m.slug),
    title: municipalityTitle(m, locale),
    description: municipalityDescription(m, locale),
    translations: municipalityTranslations(m.slug),
  });
}

/** Null when the slug is not one of the municipalities (the page then 404s). */
export function MunicipalityRoute({ locale, slug }: { locale: MuniLocale; slug: string }) {
  const m = municipalityBySlug(slug);
  if (!m) return null;
  return (
    <>
      <SiteHeader locale={locale} translations={municipalityTranslations(m.slug)} />
      <main id="main">
        <MunicipalityPage m={m} locale={locale} />
      </main>
      <JsonLd
        json={graph([
          breadcrumbSchema(municipalityCrumbs(m, locale)),
          // The same questions the page prints (copy.ts municipalityFaq), as FAQPage.
          faqSchema([
            {
              type: "faq",
              items: municipalityFaq(m, locale, nextYearFor(m.slug), todayInCatalonia()).map(({ question, answer }) => ({ question, answer })),
            },
          ]),
        ])}
      />
      <SiteFooter locale={locale} />
    </>
  );
}

/* ------------------------------------------------------------ Comarca --- */

export function comarcaMetadata(locale: MuniLocale, slug: string): Metadata {
  const g = comarcaBySlug(slug);
  if (!g) return { robots: { index: false, follow: false } };
  return buildMetadata({
    locale,
    path: comarcaPath(locale, g.slug),
    title: comarcaTitle(g, locale),
    description: comarcaDescription(g, locale),
    translations: comarcaTranslations(g.slug),
  });
}

/** Null when the slug is not one of the comarques (the page then 404s). */
export function ComarcaRoute({ locale, slug }: { locale: MuniLocale; slug: string }) {
  const g = comarcaBySlug(slug);
  if (!g) return null;
  return (
    <>
      <SiteHeader locale={locale} translations={comarcaTranslations(g.slug)} />
      <main id="main">
        <ComarcaPage g={g} locale={locale} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(comarcaCrumbs(g, locale))])} />
      <SiteFooter locale={locale} />
    </>
  );
}

/* ---------------------------------------------------------- Date page --- */

export function dateMetadata(locale: DateLocale, iso: DatePage): Metadata {
  return buildMetadata({
    locale,
    path: datePath(locale, iso),
    title: dateQuestion(iso, locale),
    description: dateContent(iso, locale).description,
    translations: dateTranslations(iso),
  });
}

export function DateRoute({ locale, iso }: { locale: DateLocale; iso: DatePage }) {
  return (
    <>
      <SiteHeader locale={locale} translations={dateTranslations(iso)} />
      <main id="main">
        <DatePageView iso={iso} locale={locale} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(dateCrumbs(iso, locale))])} />
      <SiteFooter locale={locale} />
    </>
  );
}
