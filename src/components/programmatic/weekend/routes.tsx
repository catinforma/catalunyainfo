import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { weekendWindow, type WeekendWindow } from "@/lib/content/weekend/agenda";
import { hubMeta, zoneDescription, zoneTitle } from "@/lib/programmatic/weekend/copy";
import { listedFairs } from "@/lib/programmatic/weekend/data";
import { hubTranslations, weekendHubPath, zonePath, zoneTranslations } from "@/lib/programmatic/weekend/paths";
import { fairEvents } from "@/lib/programmatic/weekend/structured";
import type { WeekendLocale, ZoneDef } from "@/lib/programmatic/weekend/zones";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { HubPage, hubCrumbs } from "./HubPage";
import { ZonePage, zoneCrumbs } from "./ZonePage";

/**
 * Route bodies for the weekend family. Each `page.tsx` under
 * `app/(public)/[locale]/{cap-de-setmana,fin-de-semana}` is a thin wrapper
 * that fixes its locale and calls one of these, so the two editions cannot
 * drift.
 *
 * The weekend window is computed once per render, from the clock in
 * Europe/Madrid, exactly as the Catalonia weekend page does: the title, the
 * headings and the fairs listed all come from it. The pages are static
 * (`revalidate = false`) and the nightly cron rebuilds them on the night the
 * window changes (`programmatic/weekend/refresh.ts`), so the dates in a title
 * are never those of a weekend that is over.
 */

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

export function currentWindow(): WeekendWindow {
  return weekendWindow(todayInCatalonia());
}

export function hubMetadata(locale: WeekendLocale, window: WeekendWindow = currentWindow()): Metadata {
  const meta = hubMeta(locale, window);
  return buildMetadata({ locale, path: weekendHubPath(locale), title: meta.title, description: meta.description, translations: hubTranslations() });
}

export function HubRoute({ locale }: { locale: WeekendLocale }) {
  const window = currentWindow();
  return (
    <>
      <SiteHeader locale={locale} translations={hubTranslations()} activeSection={null} />
      <main id="main">
        <HubPage locale={locale} window={window} />
      </main>
      {/* The fairs the page lists for this weekend: the same call HubPage makes. */}
      <JsonLd json={graph([breadcrumbSchema(hubCrumbs(locale)), ...fairEvents(listedFairs(null, window), weekendHubPath(locale), locale)])} />
      <SiteFooter locale={locale} />
    </>
  );
}

export function zoneMetadata(locale: WeekendLocale, zone: ZoneDef, window: WeekendWindow = currentWindow()): Metadata {
  return buildMetadata({
    locale,
    path: zonePath(locale, zone),
    title: zoneTitle(zone, locale, window),
    description: zoneDescription(zone, locale, window),
    translations: zoneTranslations(zone),
  });
}

export function ZoneRoute({ locale, zone }: { locale: WeekendLocale; zone: ZoneDef }) {
  const window = currentWindow();
  return (
    <>
      <SiteHeader locale={locale} translations={zoneTranslations(zone)} activeSection={null} />
      <main id="main">
        <ZonePage zone={zone} locale={locale} window={window} />
      </main>
      {/* The fairs the page lists for this weekend: the same call ZonePage makes. */}
      <JsonLd json={graph([breadcrumbSchema(zoneCrumbs(zone, locale)), ...fairEvents(listedFairs(zone, window), zonePath(locale, zone), locale)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
