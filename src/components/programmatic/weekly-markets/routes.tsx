import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { hubView, townView, type Faq } from "@/lib/programmatic/weekly-markets/copy";
import { madridClock } from "@/lib/programmatic/weekly-markets/logic";
import { marketsHubPath, marketsHubTranslations, marketsTownPath, marketsTownTranslations } from "@/lib/programmatic/weekly-markets/paths";
import type { MarketTown, MkLocale } from "@/lib/programmatic/weekly-markets/types";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { HubPage } from "./HubPage";
import { TownPage, hubCrumbs, townCrumbs } from "./TownPage";

/**
 * The bodies of the six route files of the family (a hub and a town page in
 * each of the three languages). The wrappers under `app/` only resolve the
 * parameters and declare the cache: ISR with an hourly window (the next
 * session is computed on the server in Europe/Madrid), plus the publish
 * group and the nightly refresh, which rebuild the pages just after midnight.
 */

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

/** FAQ markup for exactly the questions printed on the page. */
function faqNode(faq: Faq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };
}

export function marketsHubMetadata(locale: MkLocale): Metadata {
  const v = hubView(madridClock(new Date()), locale);
  return buildMetadata({ locale, path: marketsHubPath(locale), title: v.title, description: v.description, translations: marketsHubTranslations() });
}

export function marketsTownMetadata(locale: MkLocale, town: MarketTown): Metadata {
  const v = townView(town, madridClock(new Date()), locale);
  return buildMetadata({ locale, path: marketsTownPath(locale, town.slug), title: v.title, description: v.description, translations: marketsTownTranslations(town.slug) });
}

export function MarketsHubRoute({ locale }: { locale: MkLocale }) {
  const clock = madridClock(new Date());
  return (
    <>
      <SiteHeader locale={locale} translations={marketsHubTranslations()} activeSection={null} />
      <main id="main">
        <HubPage locale={locale} clock={clock} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(hubCrumbs(locale))])} />
      <SiteFooter locale={locale} />
    </>
  );
}

export function MarketsTownRoute({ locale, town }: { locale: MkLocale; town: MarketTown }) {
  const clock = madridClock(new Date());
  return (
    <>
      <SiteHeader locale={locale} translations={marketsTownTranslations(town.slug)} activeSection={null} />
      <main id="main">
        <TownPage town={town} locale={locale} clock={clock} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(townCrumbs(town, locale)), faqNode(townView(town, clock, locale).faq)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
