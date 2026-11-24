import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { A, Quote, Rich } from "@/components/programmatic/lottery-check/Rich";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { NADAL_URLS } from "@/lib/content/batch02/loteria-nadal";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { clampText } from "@/lib/programmatic/gordo/copy";
import { categoryLabel } from "@/lib/programmatic/nino-check/client-copy";
import {
  DESCRIPTION_LIMIT,
  M,
  TITLE_LIMIT,
  ninoCheckMeta,
  ninoCheckSources,
  ninoDisclaimer,
  ninoDrawText,
  ninoFaq,
  ninoFreshLine,
  ninoLead,
  ninoOfficialText,
  ninoPayText,
  ninoPrizeRows,
  ninoPrizeTableText,
  ninoRelatedLinks,
  ninoResultsHeadings,
  ninoRulesText,
  ninoWillDo,
} from "@/lib/programmatic/nino-check/copy";
import { ninoData, type NinoCheckerData } from "@/lib/programmatic/nino-check/data";
import { neighbours, type NinoDraw } from "@/lib/programmatic/nino-check/engine";
import { NINO_DATA_PATH, ninoCheckEditions, ninoCheckPath } from "@/lib/programmatic/nino-check/paths";
import { QUOTE, SOURCES, perDecimo, type NinoProgramme } from "@/lib/programmatic/nino-check/programme";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { NinoChecker } from "./NinoChecker";

/**
 * "Comprobar Lotería del Niño 2027" / "Comprovar la Loteria del Nen 2027" /
 * "Check your El Niño lottery ticket 2027". Before the draw: the date, the
 * first prize as SELAE published it, the derived-prize rules of the last
 * programme the BOE published (2011, "pendiente de confirmar"), payment and
 * tax, and the official ways to check; the full 2027 programme once SELAE's
 * PDF is read (programme-2027.json). From the 6 January snapshot: the checker
 * (client-side, on the JSON at NINO_DATA_PATH) and every drawn and derived
 * prize. Static: no clock, no network.
 */

const L = <T,>(locale: Locale, v: Record<Locale, T>): T => v[locale];

export function ninoCheckCrumbs(locale: Locale, data: NinoCheckerData): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: ninoCheckMeta(locale, data).crumb, href: ninoCheckPath(locale) },
  ];
}

export function ninoCheckMetadata(locale: Locale): Metadata {
  const m = ninoCheckMeta(locale, ninoData());
  return buildMetadata({ locale, path: ninoCheckPath(locale), title: clampText(m.title, TITLE_LIMIT), description: clampText(m.description, DESCRIPTION_LIMIT), translations: ninoCheckEditions() });
}

/** Every drawn and derived prize of the snapshot, in programme order. */
export function ninoResultRows(locale: Locale, d: NinoDraw, p: NinoProgramme): { id: string; label: string; numbers: string; perDecimo: string }[] {
  const h = ninoResultsHeadings(locale, p.year);
  const join = (ns: string[]) => (ns.length <= 1 ? ns.join("") : `${ns.slice(0, -1).join(", ")} ${h.and} ${ns[ns.length - 1]}`);
  return p.categories.map((c) => {
    let numbers = h.notYet;
    if (c.kind === "top") numbers = d[c.id] ?? h.notYet;
    else if (c.kind === "extraction") {
      const list = d[`x${c.digits}` as const];
      numbers = list.length ? `${list.map((n) => (c.digits < 5 ? h.endingAll(n) : n)).join(", ")}${list.length < c.extractions ? ` (${list.length}/${c.extractions})` : ""}` : h.notYet;
    } else {
      const src = d[c.from];
      if (src) {
        if (c.kind === "approx") numbers = join(neighbours(src));
        if (c.kind === "hundred") numbers = h.range(`${src.slice(0, 3)}00`, `${src.slice(0, 3)}99`, src);
        if (c.kind === "ending") numbers = h.ending(src.slice(5 - c.digits), src);
      }
    }
    return { id: c.id, label: categoryLabel(c, locale), numbers, perDecimo: M(perDecimo(c, p), locale) };
  });
}

function Results({ locale, data }: { locale: Locale; data: NinoCheckerData }) {
  const h = ninoResultsHeadings(locale, data.year);
  const rows = ninoResultRows(locale, data.draw!, data.programme!);
  const prize = L(locale, { es: "Premio", ca: "Premi", en: "Prize" });
  return (
    <>
      <h2 id="numeros-premiados">{h.results}</h2>
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table ci-stack-table">
          <thead>
            <tr>
              <th scope="col">{prize}</th>
              <th scope="col">{h.colNumbers}</th>
              <th scope="col">{h.colDecimo}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row" className="font-normal">
                  {r.label}
                </th>
                <td data-label={h.colNumbers}>
                  <strong>{r.numbers}</strong>
                </td>
                <td data-label={h.colDecimo}>{r.perDecimo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function NinoCheckRoute({ locale }: { locale: Locale }) {
  const data = ninoData();
  const meta = ninoCheckMeta(locale, data);
  const crumbs = ninoCheckCrumbs(locale, data);
  const will = ninoWillDo(locale);
  const pt = ninoPrizeTableText(locale);
  const rules = ninoRulesText(locale);
  const draw = ninoDrawText(locale);
  const pay = ninoPayText(locale);
  const official = ninoOfficialText(locale);
  const faq = ninoFaq(locale);
  const sources = ninoCheckSources(data);
  const hd = L(locale, {
    es: { faq: "Preguntas frecuentes", sources: "Fuentes oficiales", more: "Más sobre las loterías de Navidad" },
    ca: { faq: "Preguntes freqüents", sources: "Fonts oficials", more: "Més sobre les loteries de Nadal" },
    en: { faq: "Questions", sources: "Official sources", more: "More on Spain's Christmas lotteries" },
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(ninoCheckPath(locale)),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const quotes = [QUOTE.drums, QUOTE.derive, QUOTE.wrap, QUOTE.hundreds, QUOTE.except, QUOTE.special];

  return (
    <>
      <SiteHeader locale={locale} translations={ninoCheckEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">
                <Rich text={ninoLead(locale, data)} />
              </p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{ninoFreshLine(locale)}</p>
              <ShareBar locale={locale} path={ninoCheckPath(locale)} title={meta.h1} contentType="lottery_check" />
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              {/* Always rendered: it reads the live feed in the browser (lib/programmatic/lottery-live/) and says "pending" until the numbers are in. */}
              <NinoChecker locale={locale} dataUrl={NINO_DATA_PATH} officialHref={NADAL_URLS.lnac} initial={data} />
              <p className="text-sm text-[var(--color-muted)]">{ninoDisclaimer(locale)}</p>

              {data.available ? <Results locale={locale} data={data} /> : null}

              <h2 id="que-hace">{will.heading}</h2>
              <ul>
                {will.items.map((item) => (
                  <li key={item}>
                    <Rich text={item} />
                  </li>
                ))}
              </ul>

              <h2 id="premios">{pt.heading}</h2>
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
                    {ninoPrizeRows(locale).map((r) => (
                      <tr key={r.id}>
                        <th scope="row" className="font-normal">
                          {r.label}
                        </th>
                        <td data-label={pt.cols[1]}>{r.count}</td>
                        <td data-label={pt.cols[2]}>{r.perDecimo}</td>
                        <td data-label={pt.cols[3]}>{r.perEuro}</td>
                        <td data-label={pt.cols[4]}>{r.net}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                <Rich text={pt.after} />
              </p>

              <h2 id="reglas">{rules.heading}</h2>
              <p>
                <Rich text={rules.intro} />
              </p>
              <ul>
                {rules.items.map((item) => (
                  <li key={item}>
                    <Rich text={item} />
                  </li>
                ))}
              </ul>
              {rules.pending ? (
                <div role="note" className="ci-callout ci-callout-warning">
                  <p>
                    <Rich text={rules.pending} />
                  </p>
                </div>
              ) : null}
              {quotes.map((q) => (
                <Quote key={q} text={q} label={rules.quoteLabel} href={SOURCES.boe2011.url} lang="es" />
              ))}

              <h2 id="sorteo">{draw.heading}</h2>
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

              <h2 id="comprobar-selae">{official.heading}</h2>
              <ul>
                {official.items.map((item) => (
                  <li key={item}>
                    <Rich text={item} />
                  </li>
                ))}
              </ul>

              <h2 id="mas">{hd.more}</h2>
              <ul>
                {ninoRelatedLinks(locale).map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>

              <h2 id="preguntas">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fuentes">{hd.sources}</h2>
              <ul>
                {sources.map((s) => (
                  <li key={s.url}>
                    <A href={s.url}>{s.name}</A> ({s.publisher})
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{ninoDisclaimer(locale)}</p>
            </div>
            <ShareBar locale={locale} path={ninoCheckPath(locale)} title={meta.h1} contentType="lottery_check" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
