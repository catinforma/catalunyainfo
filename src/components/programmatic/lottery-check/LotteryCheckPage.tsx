import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { CATEGORY_LABEL } from "@/lib/programmatic/lottery-check/client-copy";
import {
  DESCRIPTION_LIMIT,
  M,
  TITLE_LIMIT,
  checkFaq,
  checkLead,
  checkMeta,
  checkSources,
  disclaimer,
  drawText,
  freshLine,
  officialText,
  payText,
  preDrawNotice,
  prizeRows,
  prizeTableText,
  relatedLinks,
  resultsHeadings,
  rulesText,
  willDo,
} from "@/lib/programmatic/lottery-check/copy";
import { checkerData, pedreaByThousand, type CheckerData } from "@/lib/programmatic/lottery-check/data";
import { neighbours } from "@/lib/programmatic/lottery-check/engine";
import { CHECK_DATA_PATH, checkEditions, checkPath } from "@/lib/programmatic/lottery-check/paths";
import { DECIMO_PRICE, DRAWN, QUOTE, SOURCES, perDecimo, type CategoryId } from "@/lib/programmatic/lottery-check/programme";
import { clampText } from "@/lib/programmatic/gordo/copy";
import { num } from "@/lib/programmatic/lottery-tax/copy";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { LotteryChecker } from "./LotteryChecker";
import { A, Rich, Quote as SharedQuote } from "./Rich";

/**
 * "Comprobar Lotería de Navidad 2026" / "Comprovar la Loteria de Nadal 2026" /
 * "Check your Spanish Christmas Lottery ticket 2026". Before the draw: what
 * the checker will do, every prize per décimo and per euro, the rules of the
 * derived prizes, the draw, payment and tax, and the official ways to check.
 * From the 22 December snapshot: the checker itself (client-side, on the JSON
 * at CHECK_DATA_PATH), the drawn prizes, the derived ones and the full pedrea
 * grouped by thousand. Static: no clock, no network, no database.
 */

const L = <T,>(locale: Locale, v: Record<Locale, T>): T => v[locale];

export function checkCrumbs(locale: Locale, data: CheckerData): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: checkMeta(locale, data).crumb, href: checkPath(locale) },
  ];
}

export function lotteryCheckMetadata(locale: Locale): Metadata {
  const m = checkMeta(locale, checkerData());
  return buildMetadata({ locale, path: checkPath(locale), title: clampText(m.title, TITLE_LIMIT), description: clampText(m.description, DESCRIPTION_LIMIT), translations: checkEditions() });
}

function Quote({ text, label }: { text: string; label: string }) {
  return <SharedQuote text={text} label={label} href={SOURCES.boe2010.url} lang="es" />;
}

/* ------------------------------------------------------------- Results --- */

function Results({ locale, data }: { locale: Locale; data: CheckerData }) {
  const d = data.draw!;
  const h = resultsHeadings(locale, data.year);
  const join = (ns: string[]) => (ns.length <= 1 ? ns.join("") : `${ns.slice(0, -1).join(", ")} ${h.and} ${ns[ns.length - 1]}`);
  const row = (id: CategoryId, numbers: string[], expected: number) => ({
    id,
    label: CATEGORY_LABEL[id][locale],
    numbers: numbers.length ? numbers.join(", ") + (numbers.length < expected ? ` (${numbers.length}/${expected})` : "") : h.notYet,
  });
  const main = [
    row("first", d.first ? [d.first] : [], 1),
    row("second", d.second ? [d.second] : [], 1),
    row("third", d.third ? [d.third] : [], 1),
    row("fourth", d.fourth, DRAWN.fourth),
    row("fifth", d.fifth, DRAWN.fifth),
  ];
  const range = (n: string) => h.range(`${n.slice(0, 3)}00`, `${n.slice(0, 3)}99`, n);
  const derived: { id: CategoryId; text: string }[] = [];
  const tops: ["first" | "second" | "third", string | null][] = [
    ["first", d.first],
    ["second", d.second],
    ["third", d.third],
  ];
  const ids = { first: ["approxFirst", "hundredFirst", "lastTwoFirst"], second: ["approxSecond", "hundredSecond", "lastTwoSecond"], third: ["approxThird", "hundredThird", "lastTwoThird"] } as const;
  for (const [key, n] of tops) if (n) derived.push({ id: ids[key][0], text: join(neighbours(n)) });
  for (const [key, n] of tops) if (n) derived.push({ id: ids[key][1], text: range(n) });
  for (const n of d.fourth) derived.push({ id: "hundredFourth", text: range(n) });
  for (const [key, n] of tops) if (n) derived.push({ id: ids[key][2], text: h.ending(n.slice(3), n) });
  if (d.first) derived.push({ id: "reintegro", text: h.ending(d.first.slice(4), d.first) });
  const cols = L(locale, { es: ["Por décimo", "Por euro"], ca: ["Per dècim", "Per euro"], en: ["Per décimo", "Per euro"] });
  const groups = d.pedrea ? pedreaByThousand(d.pedrea) : [];
  const tens = Array.from({ length: 10 }, (_, i) => String(i));
  const total = num(DRAWN.pedrea, 0, locale);

  return (
    <>
      <h2 id="numeros-premiados">{h.results}</h2>
      <h3>{h.main}</h3>
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table ci-stack-table">
          <thead>
            <tr>
              <th scope="col">{CHECK_COLS[locale].prize}</th>
              <th scope="col">{h.colNumber}</th>
              <th scope="col">{cols[0]}</th>
              <th scope="col">{cols[1]}</th>
            </tr>
          </thead>
          <tbody>
            {main.map((r) => (
              <tr key={r.id}>
                <th scope="row" className="font-normal">
                  {r.label}
                </th>
                <td data-label={h.colNumber}>
                  <strong>{r.numbers}</strong>
                </td>
                <td data-label={cols[0]}>{M(perDecimo(r.id), locale)}</td>
                <td data-label={cols[1]}>{M(perDecimo(r.id) / DECIMO_PRICE, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {derived.length ? (
        <>
          <h3>{h.derived}</h3>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table ci-stack-table">
              <thead>
                <tr>
                  <th scope="col">{CHECK_COLS[locale].prize}</th>
                  <th scope="col">{h.colNumbers}</th>
                  <th scope="col">{cols[0]}</th>
                </tr>
              </thead>
              <tbody>
                {derived.map((r, i) => (
                  <tr key={`${r.id}-${i}`}>
                    <th scope="row" className="font-normal">
                      {CATEGORY_LABEL[r.id][locale]}
                    </th>
                    <td data-label={h.colNumbers}>{r.text}</td>
                    <td data-label={cols[0]}>{M(perDecimo(r.id), locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      <h3 id="pedrea">{h.pedrea}</h3>
      {d.pedrea ? (
        <>
          <p className="text-sm">{h.pedreaNote(num(d.pedrea.length, 0, locale), total)}</p>
          {tens.map((ten) => {
            const inTen = groups.filter((g) => g.thousand.startsWith(ten));
            const n = inTen.reduce((a, g) => a + g.numbers.length, 0);
            return (
              <details key={ten}>
                <summary>
                  {ten}0000–{ten}9999 ({n})
                </summary>
                {inTen.map((g) => (
                  <p key={g.thousand} className="text-sm">
                    <strong>{g.thousand}000–{g.thousand}999:</strong> {g.numbers.join(" ")}
                  </p>
                ))}
              </details>
            );
          })}
        </>
      ) : (
        <p>{h.pedreaMissing}</p>
      )}
    </>
  );
}

const CHECK_COLS: Record<Locale, { prize: string }> = { es: { prize: "Premio" }, ca: { prize: "Premi" }, en: { prize: "Prize" } };

/* ---------------------------------------------------------------- Page --- */

export function LotteryCheckRoute({ locale }: { locale: Locale }) {
  const data = checkerData();
  const meta = checkMeta(locale, data);
  const crumbs = checkCrumbs(locale, data);
  const pre = preDrawNotice(locale);
  const will = willDo(locale);
  const pt = prizeTableText(locale);
  const rules = rulesText(locale);
  const draw = drawText(locale);
  const pay = payText(locale);
  const official = officialText(locale);
  const faq = checkFaq(locale);
  const sources = checkSources(data);
  const hd = L(locale, {
    es: { faq: "Preguntas frecuentes", sources: "Fuentes oficiales", more: "Más sobre la Lotería de Navidad" },
    ca: { faq: "Preguntes freqüents", sources: "Fonts oficials", more: "Més sobre la Loteria de Nadal" },
    en: { faq: "Questions", sources: "Official sources", more: "More on the Spanish Christmas Lottery" },
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(checkPath(locale)),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <SiteHeader locale={locale} translations={checkEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">
                <Rich text={checkLead(locale, data)} />
              </p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{freshLine(locale)}</p>
              <ShareBar locale={locale} path={checkPath(locale)} title={meta.h1} contentType="lottery_check" />
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              {data.available ? (
                <LotteryChecker locale={locale} dataUrl={CHECK_DATA_PATH} />
              ) : (
                <div role="note" className="ci-callout ci-callout-info">
                  <p>
                    <strong>{pre.title}</strong>
                  </p>
                  <p>{pre.text}</p>
                </div>
              )}
              <p className="text-sm text-[var(--color-muted)]">{disclaimer(locale)}</p>

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
                    {prizeRows(locale).map((r) => (
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
              <p className="text-sm">{pt.after}</p>

              <h2 id="reglas">{rules.heading}</h2>
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
              <Quote text={QUOTE.wrap} label={rules.quoteLabel} />
              <Quote text={QUOTE.hundreds} label={rules.quoteLabel} />
              <Quote text={QUOTE.lastTwo} label={rules.quoteLabel} />
              <Quote text={QUOTE.reintegro} label={rules.quoteLabel} />
              <Quote text={QUOTE.except} label={rules.quoteLabel} />

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
                {relatedLinks(locale).map((l) => (
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
              <p className="text-sm text-[var(--color-muted)]">{disclaimer(locale)}</p>
            </div>
            <ShareBar locale={locale} path={checkPath(locale)} title={meta.h1} contentType="lottery_check" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
