import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { cityFaq, cityMeta, hubMeta, plain } from "@/lib/programmatic/zbe/copy";
import { DGT_ZBE_DATASET, DGT_ZBE_LICENCE } from "@/lib/programmatic/zbe/datex";
import { zbeCityPath, zbeCityTranslations, zbeHubPath, zbeHubTranslations } from "@/lib/programmatic/zbe/paths";
import { ZBE_SNAPSHOT } from "@/lib/programmatic/zbe/snapshot";
import type { ZbeCity, ZbeLocale } from "@/lib/programmatic/zbe/types";
import { breadcrumbSchema, datasetSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { ZbeCityPage, ZbeHubPage, cityCrumbs, hubCrumbs, hubFaqFor } from "./ZbePages";

/**
 * Metadata and page shell of the low-emission-zone routes, shared by the
 * two route folders (`zbe` for es and ca, `low-emission-zones` for en).
 * The three editions of every page are indexable and name each other in
 * hreflang (docs/SEO_EXPERIMENTS.md, 22 Nov 2026).
 */

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

/** FAQPage for the questions the page prints, answers without their link markup. */
function faqPage(faq: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: plain(f.a) } })),
  };
}

const SPAIN: Record<ZbeLocale, string> = { es: "España", ca: "Espanya", en: "Spain" };

export function zbeHubMetadata(locale: ZbeLocale): Metadata {
  const meta = hubMeta(locale);
  return buildMetadata({ locale, path: zbeHubPath(locale), title: meta.title, description: meta.description, translations: zbeHubTranslations() });
}

export function ZbeHubRoute({ locale }: { locale: ZbeLocale }) {
  const meta = hubMeta(locale);
  return (
    <>
      <SiteHeader locale={locale} translations={zbeHubTranslations()} activeSection={null} />
      <main id="main">
        <ZbeHubPage locale={locale} />
      </main>
      <JsonLd
        json={graph([
          breadcrumbSchema(hubCrumbs(locale)),
          datasetSchema({
            path: zbeHubPath(locale),
            name: meta.h1,
            description: meta.description,
            locale,
            creator: "Dirección General de Tráfico (DGT)",
            license: DGT_ZBE_LICENCE,
            isBasedOn: [DGT_ZBE_DATASET],
            spatialCoverage: SPAIN[locale],
            dateModified: ZBE_SNAPSHOT.builtOn,
          }),
          faqPage(hubFaqFor(locale)),
        ])}
      />
      <SiteFooter locale={locale} />
    </>
  );
}

export function zbeCityMetadata(locale: ZbeLocale, city: ZbeCity): Metadata {
  const meta = cityMeta(city, locale);
  return buildMetadata({ locale, path: zbeCityPath(locale, city.slug), title: meta.title, description: meta.description, translations: zbeCityTranslations(city.slug) });
}

export function ZbeCityRoute({ locale, city }: { locale: ZbeLocale; city: ZbeCity }) {
  return (
    <>
      <SiteHeader locale={locale} translations={zbeCityTranslations(city.slug)} activeSection={null} />
      <main id="main">
        <ZbeCityPage locale={locale} city={city} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(cityCrumbs(locale, city)), faqPage(cityFaq(city, locale))])} />
      <SiteFooter locale={locale} />
    </>
  );
}
