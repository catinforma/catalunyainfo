import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { PAY_DATES_PATH, dateWords } from "@/lib/programmatic/employment/paths";
import { calcEditions, calcPath, type CalcKey, type CalcLocale } from "@/lib/programmatic/calculators/paths";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { RULES_AS_OF, SOURCE, type SourceKey } from "@/lib/programmatic/employment/rules";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * The frame the three employment calculators share: header, breadcrumbs, H1
 * and answer-first lead, the calculator and the page's own sections
 * (children), then the estimate disclaimer, the official sources with the day
 * they were read, and the family's other calculators (MoreCalculators). Breadcrumb JSON-LD
 * only: no FAQ or calculator schema (Google shows FAQ results only for
 * government and health sites, and there is no rich result for a calculator).
 */

export interface CalcMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
}

export function calcMetadata(key: CalcKey, locale: CalcLocale, meta: CalcMeta): Metadata {
  return buildMetadata({ locale, path: calcPath(key, locale), title: meta.title, description: meta.description, translations: calcEditions(key) });
}

export function calcCrumbs(key: CalcKey, locale: CalcLocale, meta: CalcMeta): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    hubCrumb(locale),
    { label: meta.breadcrumb, href: calcPath(key, locale) },
  ];
}

const T = {
  ca: {
    disclaimerTitle: "És una estimació",
    disclaimer: (asOf: string) =>
      `Calculem amb l'Estatut dels Treballadors i la Llei general de la Seguretat Social tal com estan el ${asOf}. El teu conveni col·lectiu o el teu contracte poden millorar aquestes quantitats, i una sentència, una conciliació o el SEPE en poden fixar unes altres. No és assessorament jurídic: abans de signar res, consulta-ho amb la representació sindical, un graduat social o un advocat laboralista.`,
    sources: "Fonts oficials",
    read: (d: string) => `consultades el ${d}`,
    payDates: "Quan es cobra l'atur i la pensió (dies de pagament)",
  },
  es: {
    disclaimerTitle: "Es una estimación",
    disclaimer: (asOf: string) =>
      `Calculamos con el Estatuto de los Trabajadores y la Ley General de la Seguridad Social tal como están a ${asOf}. Tu convenio colectivo o tu contrato pueden mejorar estas cantidades, y una sentencia, una conciliación o el SEPE pueden fijar otras. No es asesoramiento jurídico: antes de firmar nada, consúltalo con la representación sindical, un graduado social o un abogado laboralista.`,
    sources: "Fuentes oficiales",
    read: (d: string) => `consultadas el ${d}`,
    payDates: "Cuándo se cobra el paro y la pensión (días de pago)",
  },
  en: {
    disclaimerTitle: "This is an estimate",
    disclaimer: (asOf: string) =>
      `We calculate with Spain's Workers' Statute (Estatuto de los Trabajadores) and General Social Security Act (LGSS) as they stand on ${asOf}. Your collective agreement (convenio) or contract can improve these amounts, and a court ruling, a conciliation or SEPE can set different ones. This is not legal advice: before you sign anything, check with a union representative, a graduado social or an employment lawyer.`,
    sources: "Official sources",
    read: (d: string) => `read on ${d}`,
    payDates: "When unemployment benefit and pensions are paid (payment dates)",
  },
} as const;

export function CalcLayout({
  calcKey,
  locale,
  meta,
  lead,
  sources,
  children,
}: {
  calcKey: CalcKey;
  locale: CalcLocale;
  meta: CalcMeta;
  lead: ReactNode;
  sources: SourceKey[];
  children: ReactNode;
}) {
  const t = T[locale];
  const crumbs = calcCrumbs(calcKey, locale, meta);
  const asOf = dateWords(RULES_AS_OF, locale);
  return (
    <>
      <SiteHeader locale={locale} translations={calcEditions(calcKey)} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <div className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</div>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              {children}

              <div role="note" className="ci-callout ci-callout-warning mt-8">
                <p>
                  <strong>{t.disclaimerTitle}.</strong> {t.disclaimer(asOf)}
                </p>
              </div>

              <h2 id="fuentes">{t.sources}</h2>
              <p className="text-sm text-[var(--color-muted)]">{t.read(asOf)}.</p>
              <ul>
                {sources.map((k) => (
                  <li key={k}>
                    <a href={SOURCE[k].url} rel="noopener" target="_blank">
                      {SOURCE[k].name}
                    </a>{" "}
                    ({SOURCE[k].publisher})
                  </li>
                ))}
              </ul>

              <MoreCalculators
                current={calcKey}
                locale={locale}
                extra={
                  calcKey === "unemployment" ? (
                    <li>
                      <Link href={PAY_DATES_PATH[locale]}>{t.payDates}</Link>
                    </li>
                  ) : null
                }
              />
            </div>
            <ShareBar locale={locale} path={calcPath(calcKey, locale)} title={meta.h1} contentType="employment_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
