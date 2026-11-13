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
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { bareDay, euriborPath } from "@/lib/programmatic/euribor/copy";
import { boeLink, latestPoint } from "@/lib/programmatic/euribor/series";
import type { EuriborData } from "@/lib/programmatic/euribor/server";
import { monthText, mortgageEditions, mortgagePath, type MortgageLocale } from "@/lib/programmatic/mortgage/copy";
import { mortgageLead, mortgageMeta } from "@/lib/programmatic/mortgage/page";
import { EARLY_REPAYMENT, QUOTE, RULES_AS_OF, URLS } from "@/lib/programmatic/mortgage/rules";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { MortgageCalculator } from "./MortgageCalculator";
import { RevisionCalculator } from "./RevisionCalculator";

/**
 * "Calculadora de hipoteca" (and its ca/en editions): the instalment of a
 * fixed, variable or mixed loan (French amortisation, yearly table, total
 * interest) with the latest official Euribor prefilled, the revision
 * calculator, how the instalment is worked out, and the Ley 5/2019 basics
 * quoted from the BOE (FIPRE, FEIN, FiAE, notary, no floor, early-repayment
 * caps, default interest). Neutral: no bank, broker or affiliate link.
 */

const L = <T,>(locale: MortgageLocale, v: Record<MortgageLocale, T>): T => v[locale];

export function mortgageCrumbs(locale: MortgageLocale, label: string): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label, href: mortgagePath(locale) }];
}

export function mortgageMetadata(locale: MortgageLocale, data: EuriborData): Metadata {
  const m = mortgageMeta(locale, data.series);
  return buildMetadata({ locale, path: mortgagePath(locale), title: m.title, description: m.description, translations: mortgageEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Q({ children }: { children: ReactNode }) {
  return <q lang="es">{children}</q>;
}

export function MortgageRoute({ locale, data }: { locale: MortgageLocale; data: EuriborData }) {
  const meta = mortgageMeta(locale, data.series);
  const crumbs = mortgageCrumbs(locale, meta.breadcrumb);
  const lead = mortgageLead(locale, data.series);
  const e = latestPoint(data.series.euribor);
  const options = data.series.euribor
    .slice(-24)
    .reverse()
    .map((p) => ({ month: p.month, value: p.value, boe: p.boe }));
  const fr = EARLY_REPAYMENT.fixed;

  const h = L(locale, {
    es: { how: "Cómo se calcula la cuota", law: "Lo que dice la ley: Ley 5/2019 y Orden EHA/2899/2011", sources: "Fuentes" },
    ca: { how: "Com es calcula la quota", law: "El que diu la llei: Llei 5/2019 i Orden EHA/2899/2011", sources: "Fonts" },
    en: { how: "How the instalment is worked out", law: "What the law says: Ley 5/2019 and Orden EHA/2899/2011", sources: "Sources" },
  });

  const freshness = e
    ? L(locale, {
        es: `Euríbor oficial de ${monthText(e.month, "es")} (BOE del ${bareDay(e.boe, "es")}), leído del Banco de España el ${bareDay(data.live ? data.today : data.snapshotAsOf, "es")}. Normas revisadas el ${bareDay(RULES_AS_OF, "es")}.`,
        ca: `Euríbor oficial de ${monthText(e.month, "ca")} (BOE del ${bareDay(e.boe, "ca")}), llegit del Banc d'Espanya el ${bareDay(data.live ? data.today : data.snapshotAsOf, "ca")}. Normes revisades el ${bareDay(RULES_AS_OF, "ca")}.`,
        en: `Official Euribor for ${monthText(e.month, "en")} (BOE of ${bareDay(e.boe, "en")}), read from the Banco de España on ${bareDay(data.live ? data.today : data.snapshotAsOf, "en")}. Rules checked on ${bareDay(RULES_AS_OF, "en")}.`,
      })
    : "";

  const disclaimer = L(locale, {
    es: "Información, no asesoramiento financiero. Es una estimación: tu cuota real depende de la escritura (tipo, fechas de revisión, comisiones, seguros vinculados). La oferta que te obliga a ti y al banco es la FEIN.",
    ca: "Informació, no assessorament financer. És una estimació: la quota real depèn de l'escriptura (tipus, dates de revisió, comissions, assegurances vinculades). L'oferta que t'obliga a tu i al banc és la FEIN.",
    en: "Information, not financial advice. This is an estimate: your real instalment depends on your deed (rate, revision dates, fees, tied insurance). The offer that binds you and the bank is the FEIN.",
  });

  const how = L(locale, {
    es: [
      "Las hipotecas en España se amortizan casi siempre con el sistema francés: pagas la misma cuota cada mes mientras no cambia el tipo; al principio casi todo es interés y, con los años, cada vez más capital.",
      "Cuota = C · i / (1 − (1 + i)^−n), con C el capital pendiente, i el tipo nominal anual (TIN) dividido entre 12 y n los meses que faltan. Cada mes, el interés es el capital pendiente por i; el resto de la cuota amortiza capital. Redondeamos al céntimo, y la última cuota ajusta lo que quede.",
      "En las variables, el tipo se revisa cada 6 o 12 meses con el Euríbor del mes que diga la escritura más el diferencial, y la cuota se recalcula con el capital y el plazo que quedan. En las mixtas, la cuota cambia una vez, al acabar los años a tipo fijo.",
    ],
    ca: [
      "Les hipoteques a Espanya s'amortitzen gairebé sempre amb el sistema francès: pagues la mateixa quota cada mes mentre no canvia el tipus; al principi gairebé tot és interès i, amb els anys, cada cop més capital.",
      "Quota = C · i / (1 − (1 + i)^−n), amb C el capital pendent, i el tipus nominal anual (TIN) dividit entre 12 i n els mesos que falten. Cada mes, l'interès és el capital pendent per i; la resta de la quota amortitza capital. Arrodonim al cèntim, i l'última quota ajusta el que quedi.",
      "A les variables, el tipus es revisa cada 6 o 12 mesos amb l'Euríbor del mes que digui l'escriptura més el diferencial, i la quota es recalcula amb el capital i el termini que queden. A les mixtes, la quota canvia un cop, en acabar els anys a tipus fix.",
    ],
    en: [
      "Spanish mortgages are almost always repaid with the French system: the same instalment every month while the rate does not change; at first it is nearly all interest and, over the years, more and more capital.",
      "Instalment = C · i / (1 − (1 + i)^−n), where C is the capital outstanding, i the annual nominal rate (TIN) divided by 12 and n the months left. Each month the interest is the outstanding capital times i; the rest of the instalment repays capital. We round to the cent, and the last instalment settles whatever is left.",
      "On variable loans the rate is revised every 6 or 12 months with the Euribor of the month your deed names plus the spread, and the instalment is recalculated on the capital and term left. On mixed loans the instalment changes once, when the fixed years end.",
    ],
  });

  const law = L<{ title: string; body: ReactNode }[]>(locale, {
    es: [
      { title: "Antes de pedirla: la FIPRE", body: <>Los bancos deben dar información general gratuita sobre sus préstamos; la Orden EHA/2899/2011 (art. 21) dice: <Q>{QUOTE.fipre}</Q> Es orientativa: no obliga al banco.</> },
      { title: "Diez días antes de firmar: FEIN, FiAE y escenarios", body: <>Ley 5/2019, art. 14.1: <Q>{QUOTE.art14}</Q> La primera es <Q>{QUOTE.fein}</Q> Con ella llegan la Ficha de Advertencias Estandarizadas (FiAE), el proyecto de contrato y, en las variables, <Q>{QUOTE.scenarios}</Q></> },
      { title: "El notario, gratis y antes de la firma", body: <>Tienes que ir al notario que elijas a recibir explicaciones sobre la FEIN y la FiAE (art. 15), y <Q>{QUOTE.notaryFree}</Q></> },
      { title: "Sin cláusula suelo ni interés negativo", body: <>Art. 21: <Q>{QUOTE.noFloor}</Q> y <Q>{QUOTE.noNegative}</Q></> },
      { title: "Amortizar antes: comisiones máximas", body: <>Art. 23: en las variables, como máximo un {EARLY_REPAYMENT.variable[0].capPct.toString().replace(".", ",")} % del capital devuelto durante los {EARLY_REPAYMENT.variable[0].years} primeros años o un {EARLY_REPAYMENT.variable[1].capPct.toString().replace(".", ",")} % durante los {EARLY_REPAYMENT.variable[1].years} primeros (una de las dos, según el contrato), y nada después; en las fijas, un {fr.firstCapPct} % los {fr.firstYears} primeros años y un {fr.afterCapPct.toString().replace(".", ",")} % después. Nunca más que la pérdida real del banco.</> },
      { title: "Si te retrasas: interés de demora", body: <>Art. 25.1: <Q>{QUOTE.defaultInterest}</Q></> },
    ],
    ca: [
      { title: "Abans de demanar-la: la FIPRE", body: <>Els bancs han de donar informació general gratuïta sobre els seus préstecs; l’Orden EHA/2899/2011 (art. 21) diu: <Q>{QUOTE.fipre}</Q> És orientativa: no obliga el banc.</> },
      { title: "Deu dies abans de signar: FEIN, FiAE i escenaris", body: <>Llei 5/2019, art. 14.1: <Q>{QUOTE.art14}</Q> La primera és <Q>{QUOTE.fein}</Q> Amb ella arriben la Fitxa d’Advertiments Estandarditzats (FiAE), el projecte de contracte i, a les variables, <Q>{QUOTE.scenarios}</Q></> },
      { title: "El notari, gratis i abans de la signatura", body: <>Has d’anar al notari que triïs a rebre explicacions sobre la FEIN i la FiAE (art. 15), i <Q>{QUOTE.notaryFree}</Q></> },
      { title: "Sense clàusula terra ni interès negatiu", body: <>Art. 21: <Q>{QUOTE.noFloor}</Q> i <Q>{QUOTE.noNegative}</Q></> },
      { title: "Amortitzar abans: comissions màximes", body: <>Art. 23: a les variables, com a màxim un {EARLY_REPAYMENT.variable[0].capPct.toString().replace(".", ",")} % del capital retornat durant els {EARLY_REPAYMENT.variable[0].years} primers anys o un {EARLY_REPAYMENT.variable[1].capPct.toString().replace(".", ",")} % durant els {EARLY_REPAYMENT.variable[1].years} primers (una de les dues, segons el contracte), i res després; a les fixes, un {fr.firstCapPct} % els {fr.firstYears} primers anys i un {fr.afterCapPct.toString().replace(".", ",")} % després. Mai més que la pèrdua real del banc.</> },
      { title: "Si et retardes: interès de demora", body: <>Art. 25.1: <Q>{QUOTE.defaultInterest}</Q></> },
    ],
    en: [
      { title: "Before you apply: the FIPRE", body: <>Banks must give free general information on their loans; Orden EHA/2899/2011 (art. 21) says it comes on the precontractual information sheet: <Q>{QUOTE.fipre}</Q> It is for guidance and does not bind the bank.</> },
      { title: "Ten days before signing: FEIN, FiAE and scenarios", body: <>Ley 5/2019, art. 14.1: the lender must hand over the documents at least ten calendar days before signing (<Q>{QUOTE.art14}</Q>). The first is the European Standardised Information Sheet, a binding offer: <Q>{QUOTE.fein}</Q> With it come the standardised warnings sheet (FiAE), the draft contract and, for variable loans, a document with instalments under different rate scenarios: <Q>{QUOTE.scenarios}</Q></> },
      { title: "The notary, free and before signing", body: <>You must see the notary of your choice for explanations of the FEIN and FiAE (art. 15), and that record costs you nothing: <Q>{QUOTE.notaryFree}</Q></> },
      { title: "No floor clause, no negative interest", body: <>Art. 21: <Q>{QUOTE.noFloor}</Q> and <Q>{QUOTE.noNegative}</Q></> },
      { title: "Repaying early: maximum fees", body: <>Art. 23: on variable loans, at most {EARLY_REPAYMENT.variable[0].capPct}% of the capital repaid during the first {EARLY_REPAYMENT.variable[0].years} years or {EARLY_REPAYMENT.variable[1].capPct}% during the first {EARLY_REPAYMENT.variable[1].years} (one or the other, as the contract says), and nothing after; on fixed loans, {fr.firstCapPct}% in the first {fr.firstYears} years and {fr.afterCapPct}% after. Never more than the bank’s actual loss.</> },
      { title: "If you pay late: default interest", body: <>Art. 25.1: the loan’s interest plus three percentage points: <Q>{QUOTE.defaultInterest}</Q></> },
    ],
  });

  const euriborLink = L(locale, {
    es: ["¿Qué Euríbor toca en tu revisión?", "El Euríbor oficial de los últimos 24 meses, el IRPH y cuándo sale el próximo"],
    ca: ["Quin Euríbor toca a la teva revisió?", "L'Euríbor oficial dels últims 24 mesos, l'IRPH i quan surt el proper"],
    en: ["Which Euribor applies at your revision?", "The official Euribor over the last 24 months, the IRPH and the next release"],
  });

  return (
    <>
      <SiteHeader locale={locale} translations={mortgageEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
              {freshness ? <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{freshness}</p> : null}
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <MortgageCalculator locale={locale} euribor={e ? { value: e.value, month: e.month } : null} defaults={{ kind: "variable", amount: 150_000, years: 25, fixedPct: 2.5, fixedYears: 5, spreadPct: 0.75 }} />
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <div id="revision">{options.length ? <RevisionCalculator locale={locale} options={options} defaults={{ balance: 120_000, years: 20, months: 0, spreadPct: 0.8 }} /> : null}</div>
              <p>
                {euriborLink[0]} <Link href={euriborPath(locale)}>{euriborLink[1]}</Link>.
              </p>

              <h2 id="como-se-calcula">{h.how}</h2>
              {how.map((p) => (
                <p key={p}>{p}</p>
              ))}

              <h2 id="ley">{h.law}</h2>
              {law.map((item) => (
                <section key={item.title} aria-label={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </section>
              ))}

              <h2 id="fuentes">{h.sources}</h2>
              <ul className="text-sm">
                <li>
                  <A href={URLS.ley5}>Ley 5/2019, de 15 de marzo, reguladora de los contratos de crédito inmobiliario</A> (BOE-A-2019-3814): <A href={URLS.ley5Art14}>art. 14</A> · <A href={URLS.ley5Art15}>art. 15</A> · <A href={URLS.ley5Art21}>art. 21</A> · <A href={URLS.ley5Art23}>art. 23</A> · <A href={URLS.ley5Art25}>art. 25</A>
                </li>
                <li>
                  <A href={URLS.orden}>Orden EHA/2899/2011, de 28 de octubre</A> (BOE-A-2011-17015): <A href={URLS.ordenArt21}>art. 21 (FIPRE)</A> · <A href={URLS.ordenArt22}>art. 22 (FiAE)</A>
                </li>
                {e ? (
                  <li>
                    {L(locale, { es: "Euríbor oficial", ca: "Euríbor oficial", en: "Official Euribor" })} {monthText(e.month, locale)}: <A href={boeLink(e.boe, data.resolutions, "interbank")}>BOE {bareDay(e.boe, locale)}</A> · {L(locale, { es: "Fuente: Banco de España", ca: "Font: Banc d'Espanya", en: "Source: Banco de España" })}
                  </li>
                ) : null}
              </ul>

              <MoreCalculators current="mortgage" locale={locale} />
            </div>
            <ShareBar locale={locale} path={mortgagePath(locale)} title={meta.h1} contentType="mortgage" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
