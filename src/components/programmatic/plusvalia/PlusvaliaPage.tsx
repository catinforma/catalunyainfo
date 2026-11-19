import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { art, coef, elDay, fromDay, money, pvEditions, pvPath, rowLabel, untilDay, type PvLocale } from "@/lib/programmatic/plusvalia/copy";
import type { PvOk } from "@/lib/programmatic/plusvalia/engine";
import { DEFAULT_INPUT, examples, pvFaq, pvMeta, type ExampleId } from "@/lib/programmatic/plusvalia/page";
import {
  ARTICLE,
  BARCELONA,
  CONSOLIDATED_AS_OF,
  DEADLINE,
  MAX_BONUS,
  MAX_RATE,
  MAX_REDUCING_COEFFICIENT,
  NEW_TABLE_FROM,
  QUOTE,
  RDL29_CONVALIDATED,
  REVALUATION_REDUCTION,
  RULES_AS_OF,
  RULES_UNTIL,
  SOURCES,
  TABLES,
  type Source,
} from "@/lib/programmatic/plusvalia/rules";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { PlusvaliaCalculator } from "./PlusvaliaCalculator";

/**
 * "Plusvalía municipal" / "Plusvàlua municipal" / "Spain plusvalía tax": the
 * IIVTNU of one transfer under arts. 104 to 110 of the Haciendas Locales act
 * (as RDL 26/2021 left them), as a calculator server-rendered on a December
 * 2026 sale, then how it is worked out, the maximum coefficients (until 30
 * Nov 2026 and from 1 Dec 2026, with Barcelona's), the real-gain method,
 * our worked cases, rate, rebate and who pays, when nothing is due, the
 * deadline and where to file, Barcelona, why there are two methods,
 * questions, sources and limits. Every figure comes from rules.ts through
 * the engine.
 */

const L = <T,>(locale: PvLocale, v: Record<PvLocale, T>): T => v[locale];
const md = (text: string) => text.split(/\*\*/).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));

export function pvCrumbs(locale: PvLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: pvMeta(locale).breadcrumb, href: pvPath(locale) }];
}

export function pvMetadata(locale: PvLocale): Metadata {
  const m = pvMeta(locale);
  return buildMetadata({ locale, path: pvPath(locale), title: m.title, description: m.description, translations: pvEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ text, href, label, lang = "es" }: { text: string; href: string; label: string; lang?: "ca" | "es" }) {
  return (
    <blockquote lang={lang}>
      <p>«{text}»</p>
      <footer className="text-sm">
        <A href={href}>{label}</A>
      </footer>
    </blockquote>
  );
}

const srcUrl = (src: Source, locale: PvLocale) => (locale === "ca" ? src.url : (src.urlEs ?? src.url));

const EXAMPLE_LABEL: Record<ExampleId, Record<PvLocale, string>> = {
  "sale-14y-nov": { ca: "Venda el 19-11-2026 d'un pis comprat el 10-3-2012 per 200.000 € i venut per 320.000 €; sòl 60.000 € de 150.000 €", es: "Venta el 19-11-2026 de un piso comprado el 10-3-2012 por 200.000 € y vendido por 320.000 €; suelo 60.000 € de 150.000 €", en: "Sale on 19-11-2026 of a flat bought on 10-3-2012 for €200,000 and sold for €320,000; land €60,000 of €150,000" },
  "sale-14y-dec": { ca: "El mateix pis, venut el 15-12-2026", es: "El mismo piso, vendido el 15-12-2026", en: "The same flat, sold on 15-12-2026" },
  "sale-3y-real": { ca: "Venda el 15-12-2026 d'un pis comprat l'1-6-2023 per 250.000 € i venut per 265.000 €; sòl 90.000 € de 180.000 €", es: "Venta el 15-12-2026 de un piso comprado el 1-6-2023 por 250.000 € y vendido por 265.000 €; suelo 90.000 € de 180.000 €", en: "Sale on 15-12-2026 of a flat bought on 1-6-2023 for €250,000 and sold for €265,000; land €90,000 of €180,000" },
  "sale-loss": { ca: "Venda el 15-12-2026 amb pèrdues: comprat l'1-5-2007 per 300.000 €, venut per 260.000 €", es: "Venta el 15-12-2026 con pérdidas: comprado el 1-5-2007 por 300.000 €, vendido por 260.000 €", en: "Sale at a loss on 15-12-2026: bought on 1-5-2007 for €300,000, sold for €260,000" },
  "inheritance-home": { ca: "Herència (mort el 15-12-2026) d'un habitatge adquirit l'1-2-1998, sòl 50.000 €, bonificació del 95 %", es: "Herencia (fallecimiento el 15-12-2026) de una vivienda adquirida el 1-2-1998, suelo 50.000 €, bonificación del 95 %", en: "Inheritance (death on 15-12-2026) of a home acquired on 1-2-1998, land €50,000, 95% rebate" },
  months: { ca: "Venda el 15-12-2026 d'un pis comprat el 10-3-2026 (9 mesos), sòl 40.000 €", es: "Venta el 15-12-2026 de un piso comprado el 10-3-2026 (9 meses), suelo 40.000 €", en: "Sale on 15-12-2026 of a flat bought on 10-3-2026 (9 months), land €40,000" },
};

export function PlusvaliaRoute({ locale }: { locale: PvLocale }) {
  const meta = pvMeta(locale);
  const crumbs = pvCrumbs(locale);
  const M = (n: number) => money(n, locale);
  const C = (n: number) => coef(n, locale);
  const on = (iso: string) => elDay(iso, locale);
  const from = (iso: string) => fromDay(iso, locale);
  const until = (iso: string) => untilDay(iso, locale);
  const faq = pvFaq(locale);
  const ex = examples();
  const get = (id: ExampleId): PvOk => ex.find((e) => e.id === id)!.result;
  const nov = get("sale-14y-nov");
  const dec = get("sale-14y-dec");
  const law = SOURCES.trlrhl.url;
  const lawLabel = (a: string) => art(a);
  const t24 = TABLES["rdl8-2023"];
  const t26 = TABLES["rdl29-2026"];
  const tDer = TABLES["rdl16-2025"];
  const lastDay2024Table = "2026-11-30";

  const lead = L(locale, {
    es: `La plusvalía municipal grava lo que ha ganado valor el suelo de un inmueble urbano cuando se vende, se hereda o se dona. Se calcula de dos maneras y puedes pagar por la menor: el valor catastral del suelo por un coeficiente según los años, o la ganancia real en la parte del suelo. Desde el 1 de diciembre de 2026 cambian los coeficientes máximos: el mismo piso, con 60.000 € de suelo y 14 años, pasa de ${M(nov.toPay)} a ${M(dec.toPay)} al 30 %.`,
    ca: `La plusvàlua municipal grava el que ha guanyat de valor el sòl d'un immoble urbà quan es ven, s'hereta o es dona. Es calcula de dues maneres i pots pagar per la més baixa: el valor cadastral del sòl per un coeficient segons els anys, o el guany real en la part del sòl. Des de l'1 de desembre de 2026 canvien els coeficients màxims: el mateix pis, amb 60.000 € de sòl i 14 anys, passa de ${M(nov.toPay)} a ${M(dec.toPay)} al 30 %.`,
    en: `Spain's plusvalía municipal taxes the rise in value of the land under urban property when it is sold, inherited or given away. It is worked out two ways and you can pay on the lower: the land's cadastral value times a coefficient for the years held, or the real gain on the land's share. The maximum coefficients change on 1 December 2026: the same flat, with €60,000 of land and 14 years, goes from ${M(nov.toPay)} to ${M(dec.toPay)} at 30%.`,
  });
  const fresh = L(locale, {
    es: `Normas revisadas ${on(RULES_AS_OF)} en el BOE: texto refundido de la Ley Reguladora de las Haciendas Locales, arts. 104 a 110 (texto consolidado actualizado ${on(CONSOLIDATED_AS_OF)}), y Real Decreto-ley 29/2026, convalidado ${on(RDL29_CONVALIDATED)}. Se revisan de nuevo ${from(RULES_UNTIL)}: los coeficientes se actualizan cada año.`,
    ca: `Normes revisades ${on(RULES_AS_OF)} al BOE: text refós de la Llei reguladora de les hisendes locals, arts. 104 a 110 (text consolidat actualitzat ${on(CONSOLIDATED_AS_OF)}), i Reial decret llei 29/2026, convalidat ${on(RDL29_CONVALIDATED)}. Es tornen a revisar ${from(RULES_UNTIL)}: els coeficients s'actualitzen cada any.`,
    en: `Rules checked ${on(RULES_AS_OF)} in the BOE: the consolidated Local Finance Act (TRLRHL), arts. 104 to 110 (consolidated text updated ${on(CONSOLIDATED_AS_OF)}), and Royal Decree-law 29/2026, ratified ${on(RDL29_CONVALIDATED)}. Due for a fresh check ${from(RULES_UNTIL)}: the coefficients are updated every year.`,
  });
  const disclaimer = L(locale, {
    es: "Estimación orientativa. El importe oficial es la liquidación o la autoliquidación de tu ayuntamiento, con el tipo, los coeficientes y las bonificaciones de su ordenanza fiscal y los valores que compruebe. Si hay usufructos u otros derechos reales, expropiaciones, terrenos sin valor catastral o una transmisión anterior no sujeta, consulta a tu ayuntamiento o a un asesor.",
    ca: "Estimació orientativa. L'import oficial és la liquidació o l'autoliquidació del teu ajuntament, amb el tipus, els coeficients i les bonificacions de la seva ordenança fiscal i els valors que comprovi. Si hi ha usdefruits o altres drets reals, expropiacions, terrenys sense valor cadastral o una transmissió anterior no subjecta, consulta-ho al teu ajuntament o a un assessor.",
    en: "An estimate. The official amount is your council's assessment or self-assessment, with the rate, coefficients and rebates of its tax ordinance and the values it checks. With usufructs or other rights in rem, compulsory purchases, land with no cadastral value or an earlier transfer that was not subject to the tax, ask your council or an adviser.",
  });

  const hd = L(locale, {
    es: { how: "Cómo se calcula, paso a paso", table: "Los coeficientes máximos: hasta el 30 de noviembre y desde el 1 de diciembre de 2026", january: "Enero de 2025 y enero de 2026: dos tablas derogadas", real: "El método del incremento real", examples: "Ejemplos con la calculadora", rate: "Tipo, bonificación y quién paga", none: "Cuándo no se paga", file: "Plazo y dónde se declara", bcn: "En Barcelona", why: "Por qué hay dos métodos", faq: "Preguntas frecuentes", sources: "Fuentes oficiales", limits: "Qué no calcula" },
    ca: { how: "Com es calcula, pas a pas", table: "Els coeficients màxims: fins al 30 de novembre i des de l'1 de desembre de 2026", january: "Gener de 2025 i gener de 2026: dues taules derogades", real: "El mètode de l'increment real", examples: "Exemples amb la calculadora", rate: "Tipus, bonificació i qui paga", none: "Quan no es paga", file: "Termini i on es declara", bcn: "A Barcelona", why: "Per què hi ha dos mètodes", faq: "Preguntes freqüents", sources: "Fonts oficials", limits: "Què no calcula" },
    en: { how: "How it is worked out, step by step", table: "The maximum coefficients: until 30 November and from 1 December 2026", january: "January 2025 and January 2026: two derogated tables", real: "The real-gain method", examples: "Worked cases through the calculator", rate: "Rate, rebate and who pays", none: "When nothing is due", file: "Deadline and where to file", bcn: "In Barcelona", why: "Why there are two methods", faq: "Questions", sources: "Official sources", limits: "What it does not cover" },
  });

  const steps = L(locale, {
    es: [
      `**Periodo de generación** (${lawLabel(ARTICLE.coefficients)}): los años completos desde la adquisición anterior hasta la transmisión, como máximo 20. Con menos de un año, los meses completos.`,
      `**Coeficiente**: el de tu ayuntamiento para ese periodo, que no puede superar el máximo legal en la fecha de la transmisión (tabla de abajo). Con menos de un año, el anual × meses / 12.`,
      `**Base objetiva** (${lawLabel(ARTICLE.base)}): valor catastral del suelo a efectos del IBI (${lawLabel(ARTICLE.landValue)}) × coeficiente.`,
      `**Base real** (${lawLabel(ARTICLE.noGain)} y ${ARTICLE.realGain}): (valor de transmisión − valor de adquisición) × la parte que el suelo representa en el valor catastral. Si es cero o negativa, no hay impuesto; si es menor que la objetiva, puedes pedir que sea la base.`,
      `**Cuota** (${lawLabel(ARTICLE.cuotaIntegra)}): base × el tipo de tu ayuntamiento, como máximo el ${MAX_RATE} % (${lawLabel(ARTICLE.rate)}); en herencias, menos la bonificación de tu ordenanza, como máximo el ${MAX_BONUS} % (${lawLabel(ARTICLE.bonus)}).`,
    ],
    ca: [
      `**Període de generació** (${lawLabel(ARTICLE.coefficients)}): els anys complets des de l'adquisició anterior fins a la transmissió, com a màxim 20. Amb menys d'un any, els mesos complets.`,
      `**Coeficient**: el del teu ajuntament per a aquest període, que no pot superar el màxim legal en la data de la transmissió (taula de sota). Amb menys d'un any, l'anual × mesos / 12.`,
      `**Base objectiva** (${lawLabel(ARTICLE.base)}): valor cadastral del sòl a efectes de l'IBI (${lawLabel(ARTICLE.landValue)}) × coeficient.`,
      `**Base real** (${lawLabel(ARTICLE.noGain)} i ${ARTICLE.realGain}): (valor de transmissió − valor d'adquisició) × la part que el sòl representa en el valor cadastral. Si és zero o negativa, no hi ha impost; si és més baixa que l'objectiva, pots demanar que sigui la base.`,
      `**Quota** (${lawLabel(ARTICLE.cuotaIntegra)}): base × el tipus del teu ajuntament, com a màxim el ${MAX_RATE} % (${lawLabel(ARTICLE.rate)}); en herències, menys la bonificació de la teva ordenança, com a màxim el ${MAX_BONUS} % (${lawLabel(ARTICLE.bonus)}).`,
    ],
    en: [
      `**Period held** (${lawLabel(ARTICLE.coefficients)}): the full years from the previous acquisition to the transfer, at most 20. Under a year, the full months.`,
      `**Coefficient**: your council's for that period, never above the legal maximum on the transfer date (table below). Under a year, the annual one × months / 12.`,
      `**Objective base** (${lawLabel(ARTICLE.base)}): the land's cadastral value for IBI (${lawLabel(ARTICLE.landValue)}) × coefficient.`,
      `**Real-gain base** (${lawLabel(ARTICLE.noGain)} and ${ARTICLE.realGain}): (transfer value − acquisition value) × the land's share of the cadastral value. Zero or below, no tax; below the objective base, you can ask for it to be the base.`,
      `**Tax** (${lawLabel(ARTICLE.cuotaIntegra)}): base × your council's rate, at most ${MAX_RATE}% (${lawLabel(ARTICLE.rate)}); on inheritances, less your ordinance's rebate, at most ${MAX_BONUS}% (${lawLabel(ARTICLE.bonus)}).`,
    ],
  });

  const tableCols = L(locale, {
    es: ["Periodo", `Máximo ${until(lastDay2024Table)} (RDL 8/2023)`, `Máximo ${from(NEW_TABLE_FROM)} (RDL 29/2026)`, "Barcelona (ordenanza 1.3, art. 5.3)"],
    ca: ["Període", `Màxim ${until(lastDay2024Table)} (RDL 8/2023)`, `Màxim ${from(NEW_TABLE_FROM)} (RDL 29/2026)`, "Barcelona (ordenança 1.3, art. 5.3)"],
    en: ["Period", `Maximum ${until(lastDay2024Table)} (RDL 8/2023)`, `Maximum ${from(NEW_TABLE_FROM)} (RDL 29/2026)`, "Barcelona (ordinance 1.3, art. 5.3)"],
  });
  const derCols = L(locale, {
    es: ["Periodo", "RDL 9/2024 y RDL 16/2025"],
    ca: ["Període", "RDL 9/2024 i RDL 16/2025"],
    en: ["Period", "RDL 9/2024 and RDL 16/2025"],
  });
  const exCols = L(locale, {
    es: ["Caso", "Coeficiente", "Base objetiva", "Base real", "A pagar (30 %)"],
    ca: ["Cas", "Coeficient", "Base objectiva", "Base real", "A pagar (30 %)"],
    en: ["Case", "Coefficient", "Objective base", "Real-gain base", "To pay (30%)"],
  });
  const dash = "—";

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(pvPath(locale)),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const boe = (a: string) => L(locale, { es: `BOE: ${art(a)}`, ca: `BOE: ${art(a)}`, en: `BOE: ${art(a)}` });

  return (
    <>
      <SiteHeader locale={locale} translations={pvEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{fresh}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <PlusvaliaCalculator locale={locale} initial={DEFAULT_INPUT} />
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer}{" "}
                {L(locale, {
                  es: "No hay un simulador estatal: lo da cada ayuntamiento. El de Barcelona está dentro de su trámite:",
                  ca: "No hi ha un simulador estatal: el dona cada ajuntament. El de Barcelona és dins el seu tràmit:",
                  en: "There is no state simulator: each council has its own. Barcelona's is inside its procedure:",
                })}{" "}
                <A href={srcUrl(SOURCES.bcnProcedure, locale)}>{L(locale, { es: "IMH de Barcelona, plusvalía", ca: "IMH de Barcelona, plusvàlua", en: "Barcelona IMH, plusvalía (in Spanish)" })}</A>.
              </p>
              <CalculatorNextStep current="plusvalia" locale={locale} />

              <h2 id="como-se-calcula">{hd.how}</h2>
              <ol>
                {steps.map((s) => (
                  <li key={s}>{md(s)}</li>
                ))}
              </ol>
              <Quote text={QUOTE.base} href={law} label={boe(ARTICLE.base)} />
              <Quote text={QUOTE.landValue} href={law} label={boe(ARTICLE.landValue)} />
              <p>
                {L(locale, {
                  es: `Tu ayuntamiento puede rebajar ese valor con un coeficiente reductor de hasta el ${MAX_REDUCING_COEFFICIENT} % o, tras una revisión catastral general, con una reducción de hasta el ${REVALUATION_REDUCTION.maxPercent} % durante ${REVALUATION_REDUCTION.years} años (${lawLabel(ARTICLE.revaluation)}). Si tu ordenanza lo aplica, escribe en la calculadora el valor ya reducido.`,
                  ca: `El teu ajuntament pot rebaixar aquest valor amb un coeficient reductor de fins al ${MAX_REDUCING_COEFFICIENT} % o, després d'una revisió cadastral general, amb una reducció de fins al ${REVALUATION_REDUCTION.maxPercent} % durant ${REVALUATION_REDUCTION.years} anys (${lawLabel(ARTICLE.revaluation)}). Si la teva ordenança ho aplica, escriu a la calculadora el valor ja reduït.`,
                  en: `Your council may lower that value with a reducing coefficient of up to ${MAX_REDUCING_COEFFICIENT}% or, after a general cadastral revaluation, a reduction of up to ${REVALUATION_REDUCTION.maxPercent}% for ${REVALUATION_REDUCTION.years} years (${lawLabel(ARTICLE.revaluation)}). If your ordinance does, enter the reduced value in the calculator.`,
                })}
              </p>
              <Quote text={QUOTE.reducingCoefficient} href={law} label={boe(ARTICLE.landValue)} />
              <Quote text={`${QUOTE.revaluation} ${QUOTE.revaluationMax}`} href={law} label={boe(ARTICLE.revaluation)} />

              <h2 id="coeficientes">{hd.table}</h2>
              <p>
                {L(locale, {
                  es: `La ley fija solo el máximo; cada ayuntamiento aprueba los suyos en su ordenanza fiscal, iguales o más bajos. El 1 de diciembre de 2026 entra la tabla del Real Decreto-ley 29/2026: sube el máximo para todos los periodos hasta 16 años y baja de 17 años en adelante (de ${C(t24.values[20]!)} a ${C(t26.values[20]!)} con 20 años o más). Si un coeficiente de tu ordenanza queda por encima del nuevo máximo, se aplica el máximo directamente.`,
                  ca: `La llei només fixa el màxim; cada ajuntament aprova els seus a l'ordenança fiscal, iguals o més baixos. L'1 de desembre de 2026 entra la taula del Reial decret llei 29/2026: puja el màxim per a tots els períodes fins a 16 anys i baixa de 17 anys en endavant (de ${C(t24.values[20]!)} a ${C(t26.values[20]!)} amb 20 anys o més). Si un coeficient de la teva ordenança queda per sobre del nou màxim, s'aplica el màxim directament.`,
                  en: `The law sets only the maximum; each council approves its own in its tax ordinance, equal or lower. On 1 December 2026 the Royal Decree-law 29/2026 table comes in: the maximum rises for every period up to 16 years and falls from 17 years on (from ${C(t24.values[20]!)} to ${C(t26.values[20]!)} at 20 years or more). If a coefficient in your ordinance ends up above the new maximum, the maximum applies directly.`,
                })}
              </p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{art(ARTICLE.coefficients)}</caption>
                  <thead>
                    <tr>
                      {tableCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t24.values.map((v, i) => (
                      <tr key={i}>
                        <th scope="row" className="font-normal" data-label={tableCols[0]}>
                          {rowLabel(i, locale)}
                        </th>
                        <td data-label={tableCols[1]}>{C(v)}</td>
                        <td data-label={tableCols[2]}>
                          <strong>{C(t26.values[i]!)}</strong>
                        </td>
                        <td data-label={tableCols[3]}>{C(BARCELONA.coefficients[i]!)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Quote text={QUOTE.councilCoefficient} href={law} label={boe(ARTICLE.coefficients)} />
              <Quote text={QUOTE.fullYears} href={law} label={boe(ARTICLE.coefficients)} />
              <Quote text={`${QUOTE.yearlyUpdate} ${QUOTE.ordinanceExcess}`} href={law} label={boe(ARTICLE.coefficients)} />
              <Quote text={QUOTE.rdl29} href={SOURCES.rdl29_2026.url} label={L(locale, { es: "Real Decreto-ley 29/2026, art. 10 (BOE 7-10-2026)", ca: "Reial decret llei 29/2026, art. 10 (BOE 7-10-2026)", en: "Royal Decree-law 29/2026, art. 10 (BOE 7-10-2026)" })} />
              <Quote text={QUOTE.rdl29Convalidation} href={SOURCES.rdl29Convalidation.url} label={L(locale, { es: "Resolución de 12 de noviembre de 2026 (BOE 13-11-2026)", ca: "Resolució de 12 de novembre de 2026 (BOE 13-11-2026)", en: "Resolution of 12 November 2026 (BOE 13-11-2026)" })} />

              <h3 id="enero">{hd.january}</h3>
              <p>
                {L(locale, {
                  es: "Dos reales decretos-leyes cambiaron la tabla desde el 1 de enero y el Congreso los derogó semanas después: el 9/2024 (derogado en el BOE del 23 de enero de 2025) y el 16/2025 (derogado en el BOE del 28 de enero de 2026). Las dos tablas eran iguales. Desde esas fechas volvió la del Real Decreto-ley 8/2023, y es la que rige hasta el 30 de noviembre de 2026. La calculadora aplica la tabla derogada a las transmisiones del 1 al 22 de enero de 2025 y del 1 al 27 de enero de 2026, cuando estaba en vigor, y te avisa: confírmalo con tu ayuntamiento.",
                  ca: "Dos reials decrets llei van canviar la taula des de l'1 de gener i el Congrés els va derogar setmanes després: el 9/2024 (derogat al BOE del 23 de gener de 2025) i el 16/2025 (derogat al BOE del 28 de gener de 2026). Les dues taules eren iguals. Des d'aquestes dates va tornar la del Reial decret llei 8/2023, que és la que regeix fins al 30 de novembre de 2026. La calculadora aplica la taula derogada a les transmissions de l'1 al 22 de gener de 2025 i de l'1 al 27 de gener de 2026, quan era vigent, i t'avisa: confirma-ho amb el teu ajuntament.",
                  en: "Two royal decree-laws changed the table from 1 January and Congress derogated each a few weeks later: 9/2024 (derogation in the BOE of 23 January 2025) and 16/2025 (derogation in the BOE of 28 January 2026). Both tables were the same. From those dates the Royal Decree-law 8/2023 table returned, and it applies until 30 November 2026. The calculator applies the derogated table to transfers from 1 to 22 January 2025 and from 1 to 27 January 2026, while it was in force, and flags it: check with your council.",
                })}
              </p>
              <details>
                <summary>{L(locale, { es: "Ver la tabla derogada", ca: "Veure la taula derogada", en: "See the derogated table" })}</summary>
                <div className="ci-table-scroll mt-4">
                  <table className="ci-local-table ci-stack-table">
                    <thead>
                      <tr>
                        {derCols.map((c) => (
                          <th key={c} scope="col">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tDer.values.map((v, i) => (
                        <tr key={i}>
                          <th scope="row" className="font-normal" data-label={derCols[0]}>
                            {rowLabel(i, locale)}
                          </th>
                          <td data-label={derCols[1]}>{C(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              <Quote text={QUOTE.rdl16} href={SOURCES.rdl16_2025.url} label={L(locale, { es: "Real Decreto-ley 16/2025, art. 18", ca: "Reial decret llei 16/2025, art. 18", en: "Royal Decree-law 16/2025, art. 18" })} />
              <Quote text={QUOTE.rdl16Derogation} href={SOURCES.rdl16Derogation.url} label={L(locale, { es: "Resolución de 27 de enero de 2026 (BOE 28-1-2026)", ca: "Resolució de 27 de gener de 2026 (BOE 28-1-2026)", en: "Resolution of 27 January 2026 (BOE 28-1-2026)" })} />

              <h2 id="incremento-real">{hd.real}</h2>
              <p>
                {L(locale, {
                  es: "Compara el valor de transmisión con el de adquisición, cada uno el mayor entre el de la escritura y el que compruebe la Administración, sin gastos ni impuestos. Solo cuenta la parte del suelo: la proporción entre el valor catastral del suelo y el total en la fecha de la transmisión, aplicada a los dos valores. En herencias y donaciones, el valor es el declarado en el impuesto de sucesiones y donaciones.",
                  ca: "Compara el valor de transmissió amb el d'adquisició, cadascun el més alt entre el de l'escriptura i el que comprovi l'Administració, sense despeses ni impostos. Només compta la part del sòl: la proporció entre el valor cadastral del sòl i el total en la data de la transmissió, aplicada als dos valors. En herències i donacions, el valor és el declarat a l'impost de successions i donacions.",
                  en: "It compares the transfer value with the acquisition value, each the higher of the deed value and the one the tax authority checks, without costs or taxes. Only the land's part counts: the ratio of the land's cadastral value to the total on the transfer date, applied to both values. For inheritances and gifts, the value is the one declared for inheritance and gift tax.",
                })}
              </p>
              <Quote text={QUOTE.noGainValues} href={law} label={boe(ARTICLE.noGain)} />
              <Quote text={QUOTE.landShare} href={law} label={boe(ARTICLE.noGain)} />
              <Quote text={QUOTE.lucrativeValue} href={law} label={boe(ARTICLE.noGain)} />
              <Quote text={QUOTE.realGain} href={law} label={boe(ARTICLE.realGain)} />

              <h2 id="ejemplos">{hd.examples}</h2>
              <p>
                {L(locale, {
                  es: "Casos nuestros, calculados con la tabla vigente en cada fecha, el tipo máximo del 30 % y sin coeficiente propio del ayuntamiento:",
                  ca: "Casos nostres, calculats amb la taula vigent en cada data, el tipus màxim del 30 % i sense coeficient propi de l'ajuntament:",
                  en: "Our own cases, worked out with the table in force on each date, the 30% maximum rate and no council coefficient of its own:",
                })}
              </p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {exCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ex.map(({ id, result }) => (
                      <tr key={id}>
                        <th scope="row" className="font-normal">
                          {EXAMPLE_LABEL[id][locale]}
                        </th>
                        <td data-label={exCols[1]}>{C(result.coefficient)}</td>
                        <td data-label={exCols[2]}>{M(result.objective.base)}</td>
                        <td data-label={exCols[3]}>{result.realGain === null ? dash : M(Math.max(0, result.realGain))}</td>
                        <td data-label={exCols[4]}>
                          <strong>{M(result.toPay)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="tipo-y-quien-paga">{hd.rate}</h2>
              <p>
                {L(locale, {
                  es: `El impuesto es voluntario para los ayuntamientos: solo se paga donde la ordenanza lo establece. Cada uno fija su tipo, como máximo el ${MAX_RATE} %, uno solo o uno por periodo, y puede regular una bonificación de hasta el ${MAX_BONUS} % en herencias a descendientes, cónyuges y ascendientes.`,
                  ca: `L'impost és voluntari per als ajuntaments: només es paga on l'ordenança l'estableix. Cadascun fixa el seu tipus, com a màxim el ${MAX_RATE} %, un de sol o un per període, i pot regular una bonificació de fins al ${MAX_BONUS} % en herències a descendents, cònjuges i ascendents.`,
                  en: `The tax is optional for councils: it is due only where the ordinance levies it. Each sets its rate, at most ${MAX_RATE}%, one rate or one per period, and may give a rebate of up to ${MAX_BONUS}% on inheritances by descendants, spouses and ascendants.`,
                })}
              </p>
              <Quote text={QUOTE.optional} href={law} label={boe(ARTICLE.optional)} />
              <Quote text={`${QUOTE.rate} ${QUOTE.ratePerPeriod}`} href={law} label={boe(ARTICLE.rate)} />
              <Quote text={QUOTE.bonus} href={law} label={boe(ARTICLE.bonus)} />
              <Quote text={QUOTE.taxpayerOnerous} href={law} label={boe("106.1.b")} />
              <Quote text={QUOTE.taxpayerLucrative} href={law} label={boe("106.1.a")} />
              <Quote text={QUOTE.substitute} href={law} label={boe("106.2")} />
              <p>
                {L(locale, {
                  es: "Quien compra paga, además, el ITP o el IVA de la compra:",
                  ca: "Qui compra paga, a més, l'ITP o l'IVA de la compra:",
                  en: "The buyer also pays ITP or IVA on the purchase:",
                })}{" "}
                <Link href={calcPath("home-purchase-tax", locale)}>{L(locale, { es: "impuestos al comprar vivienda", ca: "impostos en comprar habitatge", en: "home purchase taxes" })}</Link>.{" "}
                {L(locale, {
                  es: "Quien hereda paga también el impuesto de sucesiones:",
                  ca: "Qui hereta paga també l'impost de successions:",
                  en: "An heir also pays inheritance tax:",
                })}{" "}
                <Link href={calcPath("inheritance-tax", locale)}>{L(locale, { es: "impuesto de sucesiones en Cataluña", ca: "impost de successions a Catalunya", en: "Catalonia inheritance tax" })}</Link>.
              </p>

              <h2 id="cuando-no-se-paga">{hd.none}</h2>
              <ul>
                <li>
                  {md(
                    L(locale, {
                      es: `**Sin incremento de valor** (${lawLabel(ARTICLE.noGain)}): si vendes por lo mismo o por menos de lo que costó. Hay que declararlo igualmente, con las dos escrituras.`,
                      ca: `**Sense increment de valor** (${lawLabel(ARTICLE.noGain)}): si vens pel mateix o per menys del que va costar. Cal declarar-ho igualment, amb les dues escriptures.`,
                      en: `**No increase in value** (${lawLabel(ARTICLE.noGain)}): selling for the same or less than it cost. It must still be declared, with both deeds.`,
                    }),
                  )}
                </li>
                <li>
                  {md(
                    L(locale, {
                      es: `**Divorcio y bienes del matrimonio** (${lawLabel(ARTICLE.notSubject)}): las aportaciones a la sociedad conyugal y las transmisiones entre cónyuges o a los hijos por una sentencia de nulidad, separación o divorcio.`,
                      ca: `**Divorci i béns del matrimoni** (${lawLabel(ARTICLE.notSubject)}): les aportacions a la societat conjugal i les transmissions entre cònjuges o als fills per una sentència de nul·litat, separació o divorci.`,
                      en: `**Divorce and marital property** (${lawLabel(ARTICLE.notSubject)}): contributions to the marital community and transfers between spouses or to the children under an annulment, separation or divorce ruling.`,
                    }),
                  )}
                </li>
                <li>
                  {md(
                    L(locale, {
                      es: `**Dación en pago de la vivienda habitual** (${lawLabel(ARTICLE.dacion)}): exenta, también en ejecuciones hipotecarias, si ni el deudor ni su unidad familiar tienen otros bienes suficientes para pagar toda la deuda hipotecaria.`,
                      ca: `**Dació en pagament de l'habitatge habitual** (${lawLabel(ARTICLE.dacion)}): exempta, també en execucions hipotecàries, si ni el deutor ni la seva unitat familiar tenen altres béns suficients per pagar tot el deute hipotecari.`,
                      en: `**Handing the main home to the lender (dación en pago)** (${lawLabel(ARTICLE.dacion)}): exempt, also in mortgage foreclosures, if neither the debtor nor their household has other assets enough to pay the whole mortgage debt.`,
                    }),
                  )}
                </li>
              </ul>
              <Quote text={QUOTE.noGain} href={law} label={boe(ARTICLE.noGain)} />
              <Quote text={QUOTE.noGainDeclare} href={law} label={boe(ARTICLE.noGain)} />
              <Quote text={QUOTE.notSubjectDivorce} href={law} label={boe(ARTICLE.notSubject)} />
              <Quote text={QUOTE.dacion} href={law} label={boe(ARTICLE.dacion)} />

              <h2 id="plazo">{hd.file}</h2>
              <ul>
                <li>
                  {md(
                    L(locale, {
                      es: `**Venta o donación:** ${DEADLINE.interVivosWorkingDays} días hábiles desde la escritura. En una donación, quien dona también tiene que comunicarla, y en una venta, quien compra (${lawLabel(ARTICLE.communicate)}).`,
                      ca: `**Venda o donació:** ${DEADLINE.interVivosWorkingDays} dies hàbils des de l'escriptura. En una donació, qui dona també l'ha de comunicar, i en una venda, qui compra (${lawLabel(ARTICLE.communicate)}).`,
                      en: `**Sale or gift:** ${DEADLINE.interVivosWorkingDays} working days from the deed. On a gift the donor must also notify it, and on a sale the buyer (${lawLabel(ARTICLE.communicate)}).`,
                    }),
                  )}{" "}
                  <Link href={calcPath("working-days", locale)}>{L(locale, { es: "Calcula el último día hábil", ca: "Calcula l'últim dia hàbil", en: "Work out the last working day" })}</Link>.
                </li>
                <li>
                  {md(
                    L(locale, {
                      es: `**Herencia:** ${DEADLINE.mortisCausaMonths} meses desde el fallecimiento, prorrogables hasta un año a petición tuya.`,
                      ca: `**Herència:** ${DEADLINE.mortisCausaMonths} mesos des de la mort, prorrogables fins a un any si ho demanes.`,
                      en: `**Inheritance:** ${DEADLINE.mortisCausaMonths} months from the death, extendable to one year if you ask.`,
                    }),
                  )}{" "}
                  {L(locale, { es: "Los demás trámites y plazos tras un fallecimiento:", ca: "La resta de tràmits i terminis després d'una mort:", en: "The other steps and deadlines after a death:" })}{" "}
                  <Link href={b2href("deathSteps", locale)}>{B2_TITLES.deathSteps[locale]}</Link>.
                </li>
                <li>
                  {md(
                    L(locale, {
                      es: `**Dónde:** en el ayuntamiento del municipio donde está el inmueble, con la escritura. Si tu ayuntamiento ha delegado la gestión en un organismo de la diputación, el trámite se hace allí: en la provincia de Barcelona, el ORGT de la Diputació ofrece los trámites de la plusvàlua. Pregunta en tu ayuntamiento cuál es tu caso.`,
                      ca: `**On:** a l'ajuntament del municipi on és l'immoble, amb l'escriptura. Si el teu ajuntament n'ha delegat la gestió en un organisme de la diputació, el tràmit es fa allà: a la província de Barcelona, l'ORGT de la Diputació ofereix els tràmits de la plusvàlua. Pregunta al teu ajuntament quin és el teu cas.`,
                      en: `**Where:** at the council of the town where the property is, with the deed. If your council has delegated the tax to a provincial agency, you file there: in the province of Barcelona, the Diputació's ORGT runs plusvàlua procedures. Ask your council which applies to you.`,
                    }),
                  )}
                </li>
              </ul>
              <Quote text={`${QUOTE.deadlineInterVivos} ${QUOTE.deadlineMortisCausa}`} href={law} label={boe(ARTICLE.deadlines)} />
              <Quote text={QUOTE.filing} href={law} label={boe("110.1")} />
              <Quote text={QUOTE.selfAssessment} href={law} label={boe(ARTICLE.selfAssessment)} />
              <Quote text={`${QUOTE.communicateDonor} ${QUOTE.communicateBuyer}`} href={law} label={boe(ARTICLE.communicate)} />
              <Quote text={QUOTE.orgtProcedure} href={SOURCES.orgt.url} label={L(locale, { es: "ORGT, Diputació de Barcelona (en catalán)", ca: "ORGT, Diputació de Barcelona", en: "ORGT, Diputació de Barcelona (in Catalan)" })} lang="ca" />
              <p>
                {L(locale, {
                  es: "El valor catastral del suelo y el total están en los datos catastrales de tu inmueble:",
                  ca: "El valor cadastral del sòl i el total són a les dades cadastrals del teu immoble:",
                  en: "The land and total cadastral values are in your property's cadastral data:",
                })}{" "}
                <A href={SOURCES.catastro.url}>{L(locale, { es: "Sede Electrónica del Catastro (Inmuebles)", ca: "Seu Electrònica del Cadastre (Inmuebles)", en: "Catastro e-office (Inmuebles, in Spanish)" })}</A>.
              </p>
              <Quote text={QUOTE.catastro} href={SOURCES.catastro.url} label={L(locale, { es: "Sede Electrónica del Catastro", ca: "Seu Electrònica del Cadastre", en: "Catastro e-office" })} />

              <h2 id="barcelona">{hd.bcn}</h2>
              <p>
                {L(locale, {
                  es: `La ordenanza fiscal 1.3 de Barcelona, en vigor desde el 1 de enero de 2025 y sin cambios para 2026, fija el tipo del ${BARCELONA.rate} % y los coeficientes de la columna «Barcelona» de la tabla: los máximos del Real Decreto-ley 8/2023, salvo 0,05 con menos de un año (en herencias solo cuentan los años completos). Su disposición adicional aplica automáticamente las actualizaciones de los coeficientes por una norma con rango de ley. Da una bonificación del ${BARCELONA.bonus} % por la vivienda habitual de la persona fallecida a cónyuge, descendientes y ascendientes, si la conservan ${BARCELONA.keepYears} años. Se paga por autoliquidación ante el Institut Municipal d'Hisenda, que calcula una estimación dentro del trámite.`,
                  ca: `L'ordenança fiscal 1.3 de Barcelona, vigent des de l'1 de gener de 2025 i sense canvis per al 2026, fixa el tipus del ${BARCELONA.rate} % i els coeficients de la columna «Barcelona» de la taula: els màxims del Reial decret llei 8/2023, llevat de 0,05 amb menys d'un any (en herències només compten els anys complets). La seva disposició addicional aplica automàticament les actualitzacions dels coeficients per una norma amb rang de llei. Dona una bonificació del ${BARCELONA.bonus} % per l'habitatge habitual de la persona morta a cònjuge, descendents i ascendents, si el conserven ${BARCELONA.keepYears} anys. Es paga per autoliquidació a l'Institut Municipal d'Hisenda, que calcula una estimació dins el tràmit.`,
                  en: `Barcelona's tax ordinance 1.3, in force since 1 January 2025 and unchanged for 2026, sets a ${BARCELONA.rate}% rate and the coefficients in the table's "Barcelona" column: the Royal Decree-law 8/2023 maxima, except 0.05 under one year (on inheritances only full years count). Its additional provision applies updates of the coefficients by a norm with the rank of law automatically. It gives a ${BARCELONA.bonus}% rebate on the deceased's habitual home to spouses, descendants and ascendants who keep it ${BARCELONA.keepYears} years. It is paid by self-assessment with the Institut Municipal d'Hisenda, which gives an estimate inside the procedure.`,
                })}
              </p>
              <Quote text={QUOTE.bcnRate} href={SOURCES.bcnOrdinance.url} label={L(locale, { es: "Ordenanza fiscal 1.3 de Barcelona, art. 7 (en catalán)", ca: "Ordenança fiscal 1.3 de Barcelona, art. 7", en: "Barcelona tax ordinance 1.3, art. 7 (in Catalan)" })} lang="ca" />
              <Quote text={QUOTE.bcnUnderYear} href={SOURCES.bcnOrdinance.url} label={L(locale, { es: "Ordenanza fiscal 1.3, art. 5.3", ca: "Ordenança fiscal 1.3, art. 5.3", en: "Ordinance 1.3, art. 5.3" })} lang="ca" />
              <Quote text={QUOTE.bcnAutomatic} href={SOURCES.bcnOrdinance.url} label={L(locale, { es: "Ordenanza fiscal 1.3, disposición adicional", ca: "Ordenança fiscal 1.3, disposició addicional", en: "Ordinance 1.3, additional provision" })} lang="ca" />
              <Quote text={`${QUOTE.bcnBonus} ${QUOTE.bcnKeep}`} href={SOURCES.bcnOrdinance.url} label={L(locale, { es: "Ordenanza fiscal 1.3, art. 9.1", ca: "Ordenança fiscal 1.3, art. 9.1", en: "Ordinance 1.3, art. 9.1" })} lang="ca" />
              <Quote text={QUOTE.bcnSelfAssessment} href={SOURCES.bcnOrdinance.url} label={L(locale, { es: "Ordenanza fiscal 1.3, art. 11.1", ca: "Ordenança fiscal 1.3, art. 11.1", en: "Ordinance 1.3, art. 11.1" })} lang="ca" />
              <Quote text={QUOTE.bcnInForce} href={SOURCES.bcnOrdinance.url} label={L(locale, { es: "Ordenanza fiscal 1.3, disposición final", ca: "Ordenança fiscal 1.3, disposició final", en: "Ordinance 1.3, final provision" })} lang="ca" />
              <Quote text={`${QUOTE.bcnDeclareAll} ${QUOTE.bcnEstimate}`} href={SOURCES.bcnProcedure.url} label={L(locale, { es: "Institut Municipal d'Hisenda de Barcelona (en catalán)", ca: "Institut Municipal d'Hisenda de Barcelona", en: "Barcelona Institut Municipal d'Hisenda (in Catalan)" })} lang="ca" />

              <h2 id="dos-metodos">{hd.why}</h2>
              <p>
                {L(locale, {
                  es: "Hasta noviembre de 2021 la base se calculaba siempre con el valor catastral y unos porcentajes anuales. El Tribunal Constitucional anuló ese sistema objetivo y de aplicación obligatoria en la sentencia 182/2021, sin reabrir los casos ya cerrados, y el Real Decreto-ley 26/2021, en vigor desde el 10 de noviembre de 2021, creó los coeficientes que se actualizan cada año y la opción del incremento real.",
                  ca: "Fins al novembre de 2021 la base es calculava sempre amb el valor cadastral i uns percentatges anuals. El Tribunal Constitucional va anul·lar aquest sistema objectiu i d'aplicació obligatòria a la sentència 182/2021, sense reobrir els casos ja tancats, i el Reial decret llei 26/2021, vigent des del 10 de novembre de 2021, va crear els coeficients que s'actualitzen cada any i l'opció de l'increment real.",
                  en: "Until November 2021 the base was always the cadastral value times yearly percentages. The Constitutional Court struck down that objective, compulsory system in ruling 182/2021, without reopening settled cases, and Royal Decree-law 26/2021, in force since 10 November 2021, brought in yearly-updated coefficients and the real-gain option.",
                })}
              </p>
              <Quote text={QUOTE.stcRuling} href={SOURCES.stc182_2021.url} label={L(locale, { es: "STC 182/2021, fallo (BOE 25-11-2021)", ca: "STC 182/2021, decisió (BOE 25-11-2021)", en: "Constitutional Court ruling 182/2021 (BOE 25-11-2021)" })} />
              <Quote text={QUOTE.stcConsolidated} href={SOURCES.stc182_2021.url} label={L(locale, { es: "STC 182/2021, fundamento jurídico 6", ca: "STC 182/2021, fonament jurídic 6", en: "Ruling 182/2021, legal ground 6" })} />
              <Quote text={QUOTE.rdl26Purpose} href={SOURCES.rdl26_2021.url} label={L(locale, { es: "Real Decreto-ley 26/2021, preámbulo", ca: "Reial decret llei 26/2021, preàmbul", en: "Royal Decree-law 26/2021, preamble" })} />

              <h2 id="preguntas">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fuentes">{hd.sources}</h2>
              <p>
                {L(locale, {
                  es: `Leídas ${on(RULES_AS_OF)}. Las normas se citan del BOE; la ordenanza y el trámite de Barcelona, del Ajuntament.`,
                  ca: `Llegides ${on(RULES_AS_OF)}. Les normes es citen del BOE; l'ordenança i el tràmit de Barcelona, de l'Ajuntament.`,
                  en: `Read ${on(RULES_AS_OF)}. Laws are quoted from the BOE; Barcelona's ordinance and procedure, from the city council.`,
                })}
              </p>
              <ul>
                {Object.values(SOURCES).map((src: Source) => (
                  <li key={src.url}>
                    <A href={srcUrl(src, locale)}>{src.name}</A> ({src.publisher}, {src.ref})
                  </li>
                ))}
              </ul>

              <h2 id="limites">{hd.limits}</h2>
              <ul>
                {L(locale, {
                  es: [
                    "El tipo, los coeficientes y las bonificaciones de cada ayuntamiento: escribe los de tu ordenanza (solo citamos los de Barcelona).",
                    "Usufructos, nuda propiedad y otros derechos reales, el derecho de vuelo, expropiaciones y terrenos sin valor catastral (art. 107.2).",
                    "Una transmisión anterior no sujeta, que cambia la fecha desde la que cuentan los años (arts. 104.5 y 107.4).",
                    "Las exenciones de entidades públicas y benéficas y la de bienes de interés cultural (art. 105), y la bonificación por actividades económicas (art. 108.5).",
                    "El último día exacto del plazo, los recargos y los intereses por declarar tarde.",
                  ],
                  ca: [
                    "El tipus, els coeficients i les bonificacions de cada ajuntament: escriu els de la teva ordenança (només citem els de Barcelona).",
                    "Usdefruits, nua propietat i altres drets reals, el dret de vol, expropiacions i terrenys sense valor cadastral (art. 107.2).",
                    "Una transmissió anterior no subjecta, que canvia la data des de la qual compten els anys (arts. 104.5 i 107.4).",
                    "Les exempcions d'entitats públiques i benèfiques i la de béns d'interès cultural (art. 105), i la bonificació per activitats econòmiques (art. 108.5).",
                    "L'últim dia exacte del termini, els recàrrecs i els interessos per declarar tard.",
                  ],
                  en: [
                    "Each council's rate, coefficients and rebates: enter your ordinance's (we only quote Barcelona's).",
                    "Usufruct, bare ownership and other rights in rem, the right to build upwards, compulsory purchases and land with no cadastral value (art. 107.2).",
                    "An earlier transfer that was not subject to the tax, which changes the date the years count from (arts. 104.5 and 107.4).",
                    "Exemptions for public and charitable bodies and listed heritage (art. 105), and the economic-activity rebate (art. 108.5).",
                    "The exact last day of the deadline, and surcharges and interest for filing late.",
                  ],
                }).map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <MoreCalculators current="plusvalia" locale={locale} />
            </div>
            <ShareBar locale={locale} path={pvPath(locale)} title={meta.h1} contentType="plusvalia_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
