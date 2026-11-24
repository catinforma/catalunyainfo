import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { A, Quote, Rich } from "@/components/programmatic/lottery-check/Rich";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { GROSSA_URLS } from "@/lib/content/batch02/grossa";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { clampText } from "@/lib/programmatic/gordo/copy";
import { PRIZE_LABEL } from "@/lib/programmatic/grossa-check/client-copy";
import {
  DESCRIPTION_LIMIT,
  GROSSA_QUOTES,
  TITLE_LIMIT,
  grossaCheckMeta,
  grossaCheckSources,
  grossaDisclaimer,
  grossaDrawText,
  grossaFaq,
  grossaFreshLine,
  grossaLead,
  grossaOfficialText,
  grossaPayText,
  grossaPrizeRows,
  grossaPrizeTableText,
  grossaRelatedLinks,
  grossaResultRows,
  grossaResultsHeadings,
  grossaRulesText,
  grossaWillDo,
} from "@/lib/programmatic/grossa-check/copy";
import { grossaData, type GrossaCheckerData } from "@/lib/programmatic/grossa-check/data";
import { GROSSA_DATA_PATH, grossaCheckEditions, grossaCheckPath } from "@/lib/programmatic/grossa-check/paths";
import { SOURCES, TIER_ORDER } from "@/lib/programmatic/grossa-check/programme";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { GrossaChecker } from "./GrossaChecker";

/**
 * "Comprovar La Grossa de Cap d'Any 2026" / "Comprobar La Grossa de Cap
 * d'Any 2026" / "Check your La Grossa de Cap d'Any 2026 ticket". Before the
 * draw: what the checker will do, every prize per ticket (DOGC 9640 annex 3),
 * how they combine (points 8.2 and 8.3, quoted), the draw, payment and tax,
 * and the official ways to check. From the 31 December snapshot: the checker
 * (client-side, on the JSON at GROSSA_DATA_PATH) and the eight winning
 * numbers with their neighbours and endings. Static: no clock, no network.
 */

const L = <T,>(locale: Locale, v: Record<Locale, T>): T => v[locale];

export function grossaCheckCrumbs(locale: Locale, data: GrossaCheckerData): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: grossaCheckMeta(locale, data).crumb, href: grossaCheckPath(locale) },
  ];
}

export function grossaCheckMetadata(locale: Locale): Metadata {
  const m = grossaCheckMeta(locale, grossaData());
  return buildMetadata({ locale, path: grossaCheckPath(locale), title: clampText(m.title, TITLE_LIMIT), description: clampText(m.description, DESCRIPTION_LIMIT), translations: grossaCheckEditions() });
}

function Results({ locale, data }: { locale: Locale; data: GrossaCheckerData }) {
  const h = grossaResultsHeadings(locale, data.year);
  const rows = grossaResultRows(locale, data.draw!);
  return (
    <>
      <h2 id="numeros-premiats">{h.results}</h2>
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table ci-stack-table">
          <thead>
            <tr>
              {h.cols.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.prize}-${i}`}>
                <th scope="row" className="font-normal">
                  {PRIZE_LABEL[r.prize][locale]}
                </th>
                <td data-label={h.cols[1]}>
                  <strong>{r.number ?? h.notYet}</strong>
                </td>
                <td data-label={h.cols[2]}>{r.five}</td>
                <td data-label={h.cols[3]}>{r.number ? r.neighbours : ""}</td>
                <td data-label={h.cols[4]}>{r.endings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function GrossaCheckRoute({ locale }: { locale: Locale }) {
  const data = grossaData();
  const meta = grossaCheckMeta(locale, data);
  const crumbs = grossaCheckCrumbs(locale, data);
  const will = grossaWillDo(locale);
  const pt = grossaPrizeTableText(locale);
  const rules = grossaRulesText(locale);
  const draw = grossaDrawText(locale);
  const pay = grossaPayText(locale);
  const official = grossaOfficialText(locale);
  const faq = grossaFaq(locale);
  const sources = grossaCheckSources(data);
  const hd = L(locale, {
    ca: { faq: "Preguntes freqüents", sources: "Fonts oficials", more: "Més sobre La Grossa i les loteries de Nadal" },
    es: { faq: "Preguntas frecuentes", sources: "Fuentes oficiales", more: "Más sobre La Grossa y las loterías de Navidad" },
    en: { faq: "Questions", sources: "Official sources", more: "More on La Grossa and the Christmas lotteries" },
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(grossaCheckPath(locale)),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  return (
    <>
      <SiteHeader locale={locale} translations={grossaCheckEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">
                <Rich text={grossaLead(locale, data)} />
              </p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{grossaFreshLine(locale)}</p>
              <ShareBar locale={locale} path={grossaCheckPath(locale)} title={meta.h1} contentType="lottery_check" />
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              {/* Always rendered: it reads the live feed in the browser (lib/programmatic/lottery-live/) and says "pending" until the numbers are in. */}
              <GrossaChecker locale={locale} dataUrl={GROSSA_DATA_PATH} officialHref={GROSSA_URLS.results} initial={data} />
              <p className="text-sm text-[var(--color-muted)]">{grossaDisclaimer(locale)}</p>

              {data.available ? <Results locale={locale} data={data} /> : null}

              <h2 id="que-fa">{will.heading}</h2>
              <ul>
                {will.items.map((item) => (
                  <li key={item}>
                    <Rich text={item} />
                  </li>
                ))}
              </ul>

              <h2 id="premis">{pt.heading}</h2>
              <p>
                <Rich text={pt.intro} />
              </p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{pt.caption}</caption>
                  <thead>
                    <tr>
                      {pt.cols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grossaPrizeRows(locale).map((r) => (
                      <tr key={r.prize}>
                        <th scope="row" className="font-normal">
                          {r.label}
                        </th>
                        <td data-label={pt.cols[1]}>{r.numbers}</td>
                        {TIER_ORDER.map((t, i) => (
                          <td key={t} data-label={pt.cols[i + 2]}>
                            {r.cells[t]}
                          </td>
                        ))}
                        <td data-label={pt.cols[8]}>{r.net}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">{pt.after}</p>

              <h2 id="regles">{rules.heading}</h2>
              <ul>
                {rules.items.map((item) => (
                  <li key={item}>
                    <Rich text={item} />
                  </li>
                ))}
              </ul>
              {GROSSA_QUOTES.map((q) => (
                <Quote key={q} text={q} label={rules.quoteLabel} href={SOURCES.dogc.url} lang="ca" />
              ))}

              <h2 id="sorteig">{draw.heading}</h2>
              {draw.paras.map((p) => (
                <p key={p}>
                  <Rich text={p} />
                </p>
              ))}

              <h2 id="cobrar">{pay.heading}</h2>
              <ul>
                {pay.items.map((item) => (
                  <li key={item}>
                    <Rich text={item} />
                  </li>
                ))}
              </ul>
              <p>
                <Rich text={pay.after} />
              </p>

              <h2 id="comprovar-oficial">{official.heading}</h2>
              <ul>
                {official.items.map((item) => (
                  <li key={item}>
                    <Rich text={item} />
                  </li>
                ))}
              </ul>

              <h2 id="mes">{hd.more}</h2>
              <ul>
                {grossaRelatedLinks(locale).map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>

              <h2 id="preguntes">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fonts">{hd.sources}</h2>
              <ul>
                {sources.map((s) => (
                  <li key={s.url}>
                    <A href={s.url}>{s.name}</A> ({s.publisher})
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{grossaDisclaimer(locale)}</p>
            </div>
            <ShareBar locale={locale} path={grossaCheckPath(locale)} title={meta.h1} contentType="lottery_check" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
