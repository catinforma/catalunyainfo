import type { Metadata } from "next";

import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { Block } from "@/lib/content/blocks";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import {
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  clampText,
  hubBlocks,
  hubMeta,
  municipalityBlocks,
  municipalityMeta,
  provinceBlocks,
  provinceMeta,
  type PageMeta,
} from "@/lib/programmatic/gordo/copy";
import { SNAPSHOT, type GordoMunicipalityGroup, type GordoProvinceGroup } from "@/lib/programmatic/gordo/data";
import {
  gordoHubPath,
  gordoHubTranslations,
  gordoMunicipalityPath,
  gordoMunicipalityTranslations,
  gordoProvincePath,
  gordoProvinceTranslations,
} from "@/lib/programmatic/gordo/paths";
import type { GordoSnapshot } from "@/lib/programmatic/gordo/types";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * Route bodies of the Christmas lottery results family. Each `page.tsx` under
 * app/(public)/[locale]/{on-ha-tocat-la-loteria-de-nadal,donde-ha-tocado-el-gordo,spanish-christmas-lottery-results}
 * fixes its locale and calls one of these. Everything renders from the
 * committed snapshot (lib/programmatic/gordo/snapshot.json) and the copy:
 * no clock, no network, no database.
 */

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

function meta(locale: Locale, path: string, m: PageMeta, translations: Record<Locale, string>): Metadata {
  return buildMetadata({ locale, path, title: clampText(m.title, TITLE_LIMIT), description: clampText(m.description, DESCRIPTION_LIMIT), translations });
}

function Shell({ locale, m, crumbs, blocks, translations }: { locale: Locale; m: PageMeta; crumbs: Crumb[]; blocks: Block[]; translations: Record<Locale, string> }) {
  return (
    <>
      <SiteHeader locale={locale} translations={translations} activeSection={null} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{m.h1}</h1>
              <ShareBar locale={locale} path={crumbPath(crumbs)} title={m.h1} contentType="gordo" />
            </div>
          </header>
          <div className="ci-shell py-10">
            <BlockRenderer body={blocks} context={{ locale, media: new Map(), related: new Map(), sources: new Map(), translations }} />
            <ShareBar locale={locale} path={crumbPath(crumbs)} title={m.h1} contentType="gordo" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), faqSchema(blocks)])} />
      <SiteFooter locale={locale} />
    </>
  );
}

function hubCrumbs(locale: Locale, s: GordoSnapshot | null): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: hubMeta(locale, s).crumb, href: gordoHubPath(locale) },
  ];
}

/* ------------------------------------------------------------------ Hub --- */

export function gordoHubMetadata(locale: Locale): Metadata {
  return meta(locale, gordoHubPath(locale), hubMeta(locale, SNAPSHOT), gordoHubTranslations());
}

export function GordoHubRoute({ locale }: { locale: Locale }) {
  return <Shell locale={locale} m={hubMeta(locale, SNAPSHOT)} crumbs={hubCrumbs(locale, SNAPSHOT)} blocks={hubBlocks(locale, SNAPSHOT)} translations={gordoHubTranslations()} />;
}

/* ------------------------------------------------------------- Province --- */

export function gordoProvinceMetadata(locale: Locale, g: GordoProvinceGroup): Metadata {
  return meta(locale, gordoProvincePath(locale, g.province.slug), provinceMeta(locale, SNAPSHOT!, g), gordoProvinceTranslations(g.province.slug));
}

export function GordoProvinceRoute({ locale, g }: { locale: Locale; g: GordoProvinceGroup }) {
  const m = provinceMeta(locale, SNAPSHOT!, g);
  const crumbs = [...hubCrumbs(locale, SNAPSHOT), { label: m.crumb, href: gordoProvincePath(locale, g.province.slug) }];
  return <Shell locale={locale} m={m} crumbs={crumbs} blocks={provinceBlocks(locale, SNAPSHOT!, g)} translations={gordoProvinceTranslations(g.province.slug)} />;
}

/* --------------------------------------------------------- Municipality --- */

export function gordoMunicipalityMetadata(locale: Locale, g: GordoMunicipalityGroup): Metadata {
  return meta(
    locale,
    gordoMunicipalityPath(locale, g.province.slug, g.municipality.slug),
    municipalityMeta(locale, SNAPSHOT!, g),
    gordoMunicipalityTranslations(g.province.slug, g.municipality.slug),
  );
}

export function GordoMunicipalityRoute({ locale, g }: { locale: Locale; g: GordoMunicipalityGroup }) {
  const m = municipalityMeta(locale, SNAPSHOT!, g);
  const crumbs = [
    ...hubCrumbs(locale, SNAPSHOT),
    { label: g.province.name, href: gordoProvincePath(locale, g.province.slug) },
    { label: m.crumb, href: gordoMunicipalityPath(locale, g.province.slug, g.municipality.slug) },
  ];
  return (
    <Shell
      locale={locale}
      m={m}
      crumbs={crumbs}
      blocks={municipalityBlocks(locale, SNAPSHOT!, g)}
      translations={gordoMunicipalityTranslations(g.province.slug, g.municipality.slug)}
    />
  );
}
