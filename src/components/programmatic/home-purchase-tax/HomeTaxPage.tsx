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
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { COMMUNITIES, COMMUNITIES_AS_OF, clientCommunities } from "@/lib/programmatic/home-purchase-tax/communities";
import { EXAMPLE, bareDay, benefitRate, euros, htEditions, htPath, pct, rateText, wholeEuros, type HtLocale } from "@/lib/programmatic/home-purchase-tax/copy";
import { calculate } from "@/lib/programmatic/home-purchase-tax/engine";
import { htMeta } from "@/lib/programmatic/home-purchase-tax/page";
import { ARANCEL_REBATE, BOE_TEXTS, NOTARY_SCALE, QUOTE, REGISTRY_CAP, REGISTRY_SCALE, STATE_DEFAULTS, STATE_RULES_AS_OF, VAT, type FeeSlice } from "@/lib/programmatic/home-purchase-tax/rules";
import type { Benefit, Community } from "@/lib/programmatic/home-purchase-tax/types";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { HomeTaxCalculator } from "./HomeTaxCalculator";

/**
 * "Impuestos al comprar una vivienda" / "Impostos en comprar un habitatge" /
 * "Taxes on buying a home in Spain": the calculator (ITP for a second-hand
 * home, IVA/IGIC/IPSI + AJD for a new one), the rates of every community with
 * the article and the words of its law, the mortgage AJD rule (RDL 17/2018),
 * and the notary and registry scales (no invented totals). Static: it ships
 * with the deploy (no publish group).
 */

const L = <T,>(locale: HtLocale, v: Record<HtLocale, T>): T => v[locale];

export function htCrumbs(locale: HtLocale, label: string): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label, href: htPath(locale) }];
}

export function htMetadata(locale: HtLocale): Metadata {
  const m = htMeta(locale);
  return buildMetadata({ locale, path: htPath(locale), title: m.title, description: m.description, translations: htEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ children }: { children: string }) {
  return (
    <blockquote lang="es">
      <p>«{children}»</p>
    </blockquote>
  );
}

const UNVERIFIED = { es: "No verificado", ca: "No verificat", en: "Not verified" } as const;

function BenefitList({ items, locale }: { items: readonly Benefit[]; locale: HtLocale }) {
  if (items.length === 0) return <span className="text-sm text-[var(--color-muted)]">{L(locale, { es: "Ninguno para particulares", ca: "Cap per a particulars", en: "None for individuals" })}</span>;
  return (
    <ul className="m-0 list-none p-0 text-sm">
      {items.map((b) => (
        <li key={b.id} className="mb-1">
          <strong>{benefitRate(b, locale)}</strong>: {b.label[locale]} <span className="text-[var(--color-muted)]">({b.article})</span>
        </li>
      ))}
    </ul>
  );
}

function LawCell({ c, locale }: { c: Community; locale: HtLocale }) {
  if (!c.law) {
    return (
      <span className="text-sm">
        {UNVERIFIED[locale]}: <A href={c.taxAgency.url}>{c.taxAgency.name}</A>
      </span>
    );
  }
  return (
    <span className="text-sm">
      <A href={c.law.url}>{c.law.short}</A>
      {c.law.consolidatedAsOf ? L(locale, { es: ` (texto consolidado al ${bareDay(c.law.consolidatedAsOf, "es")})`, ca: ` (text consolidat a ${bareDay(c.law.consolidatedAsOf, "ca")})`, en: ` (consolidated text of ${bareDay(c.law.consolidatedAsOf, "en")})` }) : null}
    </span>
  );
}

function scaleRows(scale: readonly FeeSlice[], locale: HtLocale): [string, string][] {
  return scale.map((s) => {
    const range =
      s.to === null
        ? L(locale, { es: `Más de ${euros(s.from, "es")}`, ca: `Més de ${euros(s.from, "ca")}`, en: `Over ${euros(s.from, "en")}` })
        : s.from === 0
          ? L(locale, { es: `Hasta ${euros(s.to, "es")}`, ca: `Fins a ${euros(s.to, "ca")}`, en: `Up to ${euros(s.to, "en")}` })
          : `${euros(s.from, locale)} – ${euros(s.to, locale)}`;
    const fee = s.fixed !== undefined ? euros(s.fixed, locale) : L(locale, { es: `${String(s.perMille).replace(".", ",")} por mil del exceso`, ca: `${String(s.perMille).replace(".", ",")} per mil de l'excés`, en: `${s.perMille} per thousand on the excess` });
    return [range, fee];
  });
}

export function HomeTaxRoute({ locale }: { locale: HtLocale }) {
  const meta = htMeta(locale);
  const crumbs = htCrumbs(locale, meta.breadcrumb);
  const day = (iso: string) => bareDay(iso, locale);
  const example = calculate(EXAMPLE, COMMUNITIES);
  const exLine = example.status === "ok" ? example.lines[0] : null;
  const exAmount = exLine?.amount ?? null;
  const exRate = exLine?.rate ? rateText(exLine.rate, locale) : null;
  const sourced = COMMUNITIES.filter((c) => c.status === "sourced");
  const unverified = COMMUNITIES.filter((c) => c.status === "unverified");

  const lead = L(locale, {
    es: `Si compras una vivienda de segunda mano pagas el ITP (Impuesto de Transmisiones Patrimoniales), con el tipo que fija tu comunidad autónoma; si es nueva, el IVA del ${pct(VAT.general, "es")} (${pct(VAT.protected, "es")} en VPO de régimen especial) más el AJD de la escritura. ${exAmount !== null && exRate ? `Ejemplo: en Cataluña, una vivienda de segunda mano de ${wholeEuros(EXAMPLE.price, "es")} paga ${euros(exAmount, "es")} de ITP (${exRate}).` : ""} El AJD de la hipoteca lo paga el banco desde noviembre de 2018.`,
    ca: `Si compres un habitatge de segona mà pagues l'ITP (impost de transmissions patrimonials), amb el tipus que fixa la teva comunitat autònoma; si és nou, l'IVA del ${pct(VAT.general, "ca")} (${pct(VAT.protected, "ca")} en HPO de règim especial) més l'AJD de l'escriptura. ${exAmount !== null && exRate ? `Exemple: a Catalunya, un habitatge de segona mà de ${wholeEuros(EXAMPLE.price, "ca")} paga ${euros(exAmount, "ca")} d'ITP (${exRate}).` : ""} L'AJD de la hipoteca el paga el banc des del novembre del 2018.`,
    en: `Buy a second-hand home in Spain and you pay ITP (property transfer tax) at the rate your region sets; buy a new one and you pay ${pct(VAT.general, "en")} IVA (VAT; ${pct(VAT.protected, "en")} on special-regime protected housing) plus AJD (stamp duty) on the deed. ${exAmount !== null && exRate ? `Example: a ${wholeEuros(EXAMPLE.price, "en")} second-hand home in Catalonia pays ${euros(exAmount, "en")} in ITP (${exRate}).` : ""} Since November 2018 the bank pays the AJD on the mortgage deed.`,
  });
  const freshness = L(locale, {
    es: `Leyes leídas ${day(COMMUNITIES_AS_OF)} (BOE y boletines autonómicos): ${sourced.length} territorios con tipos verificados${unverified.length ? `, ${unverified.length} sin verificar` : ""}. Normas estatales leídas en el BOE ${day(STATE_RULES_AS_OF)}.`,
    ca: `Lleis llegides el ${day(COMMUNITIES_AS_OF)} (BOE i butlletins autonòmics): ${sourced.length} territoris amb tipus verificats${unverified.length ? `, ${unverified.length} sense verificar` : ""}. Normes estatals llegides al BOE el ${day(STATE_RULES_AS_OF)}.`,
    en: `Laws read on ${day(COMMUNITIES_AS_OF)} (BOE and regional bulletins): ${sourced.length} territories with verified rates${unverified.length ? `, ${unverified.length} not verified` : ""}. State rules read in the BOE on ${day(STATE_RULES_AS_OF)}.`,
  });
  const disclaimer = L(locale, {
    es: "Cálculo orientativo, no es asesoramiento fiscal. Los tipos reducidos tienen requisitos (límites de renta y de patrimonio, plazos para vivir en la casa, escritura) que solo comprueba la Administración. Antes de firmar, confirma tu caso con la agencia tributaria de tu comunidad o un profesional.",
    ca: "Càlcul orientatiu, no és assessorament fiscal. Els tipus reduïts tenen requisits (límits de renda i de patrimoni, terminis per viure-hi, escriptura) que només comprova l'Administració. Abans de signar, confirma el teu cas amb l'agència tributària de la teva comunitat o un professional.",
    en: "An estimate, not tax advice. Reduced rates come with requirements (income and wealth limits, time limits to move in, wording of the deed) that only the tax office checks. Before you sign, confirm your case with your region's tax agency or an adviser.",
  });

  const h = L(locale, {
    es: { itp: "Vivienda de segunda mano: el ITP de cada comunidad", base: "¿Sobre qué se paga? Precio y valor de referencia", newHome: "Vivienda nueva: IVA y AJD", ajd: "El AJD de la escritura de compra, por comunidad", special: "Canarias, Ceuta y Melilla, País Vasco y Navarra", mortgage: "La hipoteca: el AJD lo paga el banco", fees: "Notaría y Registro: lo que dice el arancel", sources: "Fuentes" },
    ca: { itp: "Habitatge de segona mà: l'ITP de cada comunitat", base: "Sobre què es paga? Preu i valor de referència", newHome: "Habitatge nou: IVA i AJD", ajd: "L'AJD de l'escriptura de compra, per comunitat", special: "Canàries, Ceuta i Melilla, País Basc i Navarra", mortgage: "La hipoteca: l'AJD el paga el banc", fees: "Notaria i Registre: el que diu l'aranzel", sources: "Fonts" },
    en: { itp: "Second-hand home: each region's ITP", base: "What is it charged on? Price and reference value", newHome: "New home: IVA and AJD", ajd: "AJD on the purchase deed, by region", special: "Canary Islands, Ceuta and Melilla, Basque Country and Navarre", mortgage: "The mortgage: the bank pays the AJD", fees: "Notary and Land Registry: the official scale", sources: "Sources" },
  });
  const itpCols = L(locale, { es: ["Comunidad", "ITP general", "Tipos reducidos para vivienda", "Ley"], ca: ["Comunitat", "ITP general", "Tipus reduïts per a habitatge", "Llei"], en: ["Region", "General ITP", "Reduced rates for a home", "Law"] });
  const ajdCols = L(locale, { es: ["Comunidad", "Impuesto de la vivienda nueva", "AJD general", "AJD reducido", "Ley"], ca: ["Comunitat", "Impost de l'habitatge nou", "AJD general", "AJD reduït", "Llei"], en: ["Region", "Tax on a new home", "General AJD", "Reduced AJD", "Law"] });

  const newHomeCell = (c: Community) => {
    const nh = c.newHome;
    if (nh.general === null) {
      const agency = nh.agency ?? c.taxAgency;
      return (
        <>
          <strong>{`${nh.name}: ${UNVERIFIED[locale].toLowerCase()}`}</strong>
          <span className="block text-sm">
            <A href={agency.url}>{agency.name}</A>
          </span>
        </>
      );
    }
    return (
      <>
        <strong>
          {nh.name} {pct(nh.general, locale)}
        </strong>
        {nh.protected !== null && nh.protectedLabel ? (
          <span className="block text-sm text-[var(--color-muted)]">
            {pct(nh.protected, locale)}: {nh.protectedLabel[locale]}
          </span>
        ) : null}
        {c.benefits.some((b) => b.tax === "vat") ? <BenefitList items={c.benefits.filter((b) => b.tax === "vat")} locale={locale} /> : null}
      </>
    );
  };

  return (
    <>
      <SiteHeader locale={locale} translations={htEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{freshness}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <HomeTaxCalculator locale={locale} communities={clientCommunities()} />
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <h2 id="itp">{h.itp}</h2>
              <p>
                {L(locale, {
                  es: "La compraventa de una vivienda usada, o de una nueva que ya no vende su promotor por primera vez, está exenta de IVA (art. 20.Uno.22.º de la Ley del IVA) y paga el ITP. El tipo lo fija cada comunidad en su ley de tributos cedidos; si no fijara ninguno, el texto refundido del impuesto pone un 6 % (art. 11.1.a):",
                  ca: "La compravenda d'un habitatge usat, o d'un de nou que ja no ven el promotor per primera vegada, està exempta d'IVA (art. 20.Uno.22.º de la Llei de l'IVA) i paga l'ITP. El tipus el fixa cada comunitat en la seva llei de tributs cedits; si no en fixés cap, el text refós de l'impost posa un 6 % (art. 11.1.a; text oficial en castellà):",
                  en: "Buying a used home, or a new one that is no longer the developer's first sale, is exempt from IVA (VAT Act art. 20.Uno.22) and pays ITP. Each region sets the rate in its law on ceded taxes; if it set none, the state act's fall-back is 6% (art. 11.1.a; official text in Spanish):",
                })}
              </p>
              <Quote>{QUOTE.secondDelivery}</Quote>
              <Quote>{QUOTE.itpDefault}</Quote>
              <p>
                {L(locale, {
                  es: "En esta tabla, cada tipo reducido lleva su artículo; las condiciones completas (límites de renta, de patrimonio o de precio, plazos) están en la ley enlazada y la calculadora te las recuerda cuando aplica un tipo reducido.",
                  ca: "En aquesta taula, cada tipus reduït porta el seu article; les condicions completes (límits de renda, de patrimoni o de preu, terminis) són a la llei enllaçada i la calculadora te les recorda quan aplica un tipus reduït.",
                  en: "Each reduced rate in this table carries its article; the full conditions (income, wealth or price limits, deadlines) are in the linked law, and the calculator reminds you of them when it applies a reduced rate.",
                })}
              </p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {itpCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMMUNITIES.map((c) => (
                      <tr key={c.id} id={`itp-${c.id}`}>
                        <th scope="row">{c.name[locale]}</th>
                        <td data-label={itpCols[1]}>
                          {c.itp ? (
                            <>
                              <strong>{rateText(c.itp.general, locale)}</strong> <span className="text-sm text-[var(--color-muted)]">({c.itp.article})</span>
                            </>
                          ) : (
                            <strong>{UNVERIFIED[locale]}</strong>
                          )}
                        </td>
                        <td data-label={itpCols[2]}>{c.itp ? <BenefitList items={c.benefits.filter((b) => b.tax === "itp")} locale={locale} /> : "—"}</td>
                        <td data-label={itpCols[3]}>
                          <LawCell c={c} locale={locale} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {COMMUNITIES.some((c) => c.notes.length > 0) ? (
                <ul className="text-sm">
                  {COMMUNITIES.flatMap((c) =>
                    c.notes.map((n, i) => (
                      <li key={`${c.id}-${i}`}>
                        <strong>{c.name[locale]}</strong>: {n[locale]}
                      </li>
                    )),
                  )}
                </ul>
              ) : null}

              <h2 id="base">{h.base}</h2>
              <p>
                {L(locale, {
                  es: "El ITP no se calcula siempre sobre el precio. Para un inmueble, la base es el valor de referencia del Catastro (art. 10.2 del texto refundido), y si el precio pactado es mayor, el precio:",
                  ca: "L'ITP no es calcula sempre sobre el preu. Per a un immoble, la base és el valor de referència del Cadastre (art. 10.2 del text refós), i si el preu pactat és més alt, el preu:",
                  en: "ITP is not always charged on the price. For property, the base is the Catastro reference value (art. 10.2 of the consolidated act), and the agreed price if that is higher:",
                })}
              </p>
              <Quote>{QUOTE.referenceValue}</Quote>
              <Quote>{QUOTE.higherDeclared}</Quote>
              <p>
                {L(locale, {
                  es: "La calculadora usa el precio que escribes. Si el valor de referencia de tu vivienda es mayor (lo consultas gratis en la Sede Electrónica del Catastro), escribe ese valor.",
                  ca: "La calculadora fa servir el preu que escrius. Si el valor de referència del teu habitatge és més alt (el consultes gratis a la Seu Electrònica del Cadastre), escriu aquest valor.",
                  en: "The calculator uses the price you type. If your home's reference value is higher (look it up free on the Catastro's e-office), type that value instead.",
                })}{" "}
                <A href="https://www1.sedecatastro.gob.es/Accesos/SECAccvr.aspx">{L(locale, { es: "Valor de referencia (Sede del Catastro)", ca: "Valor de referència (Seu del Cadastre)", en: "Reference value (Catastro e-office)" })}</A>
              </p>

              <h2 id="vivienda-nueva">{h.newHome}</h2>
              <p>
                {L(locale, {
                  es: `La primera venta de una vivienda por su promotor paga IVA. El tipo es el ${pct(VAT.general, "es")} (art. 91.Uno.1.7.º de la Ley 37/1992), incluidas hasta dos plazas de garaje y los anexos que se venden con ella:`,
                  ca: `La primera venda d'un habitatge pel promotor paga IVA. El tipus és el ${pct(VAT.general, "ca")} (art. 91.Uno.1.7.º de la Llei 37/1992), incloses fins a dues places de garatge i els annexos que es venen amb l'habitatge:`,
                  en: `A home's first sale by its developer pays IVA (VAT). The rate is ${pct(VAT.general, "en")} (Ley 37/1992 art. 91.Uno.1.7), including up to two parking spaces and annexes sold with it:`,
                })}
              </p>
              <Quote>{`${QUOTE.vat10Lead} […] ${QUOTE.vat10}`}</Quote>
              <p>
                {L(locale, {
                  es: `Las viviendas de protección oficial de régimen especial o de promoción pública, y las protegidas con calificación permanente, pagan el ${pct(VAT.protected, "es")} cuando las vende el promotor (art. 91.Dos.1.6.º). Otras VPO pagan el ${pct(VAT.general, "es")}:`,
                  ca: `Els habitatges de protecció oficial de règim especial o de promoció pública, i els protegits amb qualificació permanent, paguen el ${pct(VAT.protected, "ca")} quan els ven el promotor (art. 91.Dos.1.6.º). Altres HPO paguen el ${pct(VAT.general, "ca")}:`,
                  en: `Special-regime or public-promotion protected housing (VPO), and housing with permanent protected status, pays ${pct(VAT.protected, "en")} when sold by the developer (art. 91.Dos.1.6). Other VPO pays ${pct(VAT.general, "en")}:`,
                })}
              </p>
              <Quote>{`${QUOTE.vat4Lead} […] ${QUOTE.vat4}`}</Quote>
              <p>
                {L(locale, {
                  es: "Además, la escritura de compraventa paga el AJD (actos jurídicos documentados, cuota gradual) al tipo de cada comunidad; si no fijara ninguno, el 0,50 % del texto refundido (art. 31.2):",
                  ca: "A més, l'escriptura de compravenda paga l'AJD (actes jurídics documentats, quota gradual) al tipus de cada comunitat; si no en fixés cap, el 0,50 % del text refós (art. 31.2):",
                  en: "On top, the purchase deed pays AJD (stamp duty on notarial documents) at each region's rate; if it set none, the state act's 0.50% (art. 31.2):",
                })}
              </p>
              <Quote>{QUOTE.ajdDefault}</Quote>

              <h2 id="ajd">{h.ajd}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {ajdCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMMUNITIES.map((c) => (
                      <tr key={c.id} id={`ajd-${c.id}`}>
                        <th scope="row">{c.name[locale]}</th>
                        <td data-label={ajdCols[1]}>{newHomeCell(c)}</td>
                        <td data-label={ajdCols[2]}>
                          {c.ajd ? (
                            <>
                              <strong>{rateText(c.ajd.general, locale)}</strong> <span className="text-sm text-[var(--color-muted)]">({c.ajd.article})</span>
                            </>
                          ) : (
                            <strong>{UNVERIFIED[locale]}</strong>
                          )}
                        </td>
                        <td data-label={ajdCols[3]}>{c.ajd ? <BenefitList items={c.benefits.filter((b) => b.tax === "ajd")} locale={locale} /> : "—"}</td>
                        <td data-label={ajdCols[4]}>
                          <LawCell c={c} locale={locale} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="regimenes-especiales">{h.special}</h2>
              <p>
                {L(locale, {
                  es: "En Canarias la vivienda nueva no paga IVA sino IGIC, el impuesto indirecto canario. En Ceuta y Melilla tampoco hay IVA: se aplica el IPSI de cada ciudad; el ITP y el AJD son los estatales (6 % y 0,50 %) con una bonificación del 50 % (art. 57 bis del texto refundido):",
                  ca: "A Canàries l'habitatge nou no paga IVA sinó IGIC, l'impost indirecte canari. A Ceuta i Melilla tampoc no hi ha IVA: s'hi aplica l'IPSI de cada ciutat; l'ITP i l'AJD són els estatals (6 % i 0,50 %) amb una bonificació del 50 % (art. 57 bis del text refós):",
                  en: "In the Canary Islands a new home pays IGIC, the Canaries' indirect tax, instead of IVA. Ceuta and Melilla have no IVA either: each city's IPSI applies; ITP and AJD are the state ones (6% and 0.50%) with a 50% rebate (art. 57 bis of the consolidated act):",
                })}
              </p>
              <Quote>{`${QUOTE.ceutaMelillaItp} a) ${QUOTE.ceutaMelillaItpWhat}`}</Quote>
              <Quote>{QUOTE.ceutaMelillaAjd}</Quote>
              <p>
                {L(locale, {
                  es: "El País Vasco (Álava, Bizkaia y Gipuzkoa) y Navarra tienen haciendas forales con su propia norma del impuesto: sus tipos salen de esas normas forales, no de la ley estatal. Donde no hemos podido leer la norma foral, la tabla lo dice.",
                  ca: "El País Basc (Àlaba, Biscaia i Guipúscoa) i Navarra tenen hisendes forals amb una norma pròpia de l'impost: els tipus surten d'aquestes normes forals, no de la llei estatal. On no hem pogut llegir la norma foral, la taula ho diu.",
                  en: "The Basque Country (Álava, Bizkaia and Gipuzkoa) and Navarre have their own (foral) tax authorities and their own version of the tax: their rates come from those foral norms, not the state act. Where we could not read the foral norm, the table says so.",
                })}
              </p>

              <h2 id="hipoteca">{h.mortgage}</h2>
              <p>
                {L(locale, {
                  es: "Desde el 10 de noviembre de 2018, en la escritura de un préstamo hipotecario el contribuyente del AJD es el prestamista, no tú. Lo dice el artículo 29 del texto refundido, en la redacción del Real Decreto-ley 17/2018:",
                  ca: "Des del 10 de novembre del 2018, en l'escriptura d'un préstec hipotecari el contribuent de l'AJD és el prestador, no tu. Ho diu l'article 29 del text refós, en la redacció del Reial decret llei 17/2018:",
                  en: "Since 10 November 2018 the taxpayer of the AJD on a mortgage loan deed is the lender, not you. It is article 29 of the consolidated act, as worded by Royal Decree-law 17/2018:",
                })}
              </p>
              <Quote>{QUOTE.mortgageLender}</Quote>
              <p>
                {L(locale, {
                  es: "Así que la calculadora solo suma el AJD de la escritura de compra (en vivienda nueva), no el de la hipoteca.",
                  ca: "Per això la calculadora només suma l'AJD de l'escriptura de compra (en habitatge nou), no el de la hipoteca.",
                  en: "So the calculator only adds the AJD on the purchase deed (for a new home), not the mortgage one.",
                })}{" "}
                <Link href={calcPath("mortgage", locale)}>{L(locale, { es: "Calcula la cuota de tu hipoteca", ca: "Calcula la quota de la teva hipoteca", en: "Work out your mortgage payment" })}</Link>.
              </p>

              <h2 id="notaria-registro">{h.fees}</h2>
              <p>
                {L(locale, {
                  es: `Los honorarios del notario y del registrador no son libres: los fijan sus aranceles oficiales (Real Decreto 1426/1989 y Real Decreto 1427/1989), con una escala por tramos del valor y una rebaja del ${pct(ARANCEL_REBATE, "es")}. Además se cobran las copias por folio y otros conceptos, y el IVA del 21 % (art. 90 de la Ley del IVA), así que el total depende de cada escritura: no lo calculamos. Pide presupuesto a la notaría.`,
                  ca: `Els honoraris del notari i del registrador no són lliures: els fixen els aranzels oficials (Reial decret 1426/1989 i Reial decret 1427/1989), amb una escala per trams del valor i una rebaixa del ${pct(ARANCEL_REBATE, "ca")}. A més es cobren les còpies per foli i altres conceptes, i l'IVA del 21 % (art. 90 de la Llei de l'IVA), de manera que el total depèn de cada escriptura: no el calculem. Demana pressupost a la notaria.`,
                  en: `Notary and registrar fees are not free: their official scales set them (Royal Decrees 1426/1989 and 1427/1989), by slices of the value with a ${pct(ARANCEL_REBATE, "en")} rebate. Copies are charged per page plus other items, and 21% IVA (VAT Act art. 90), so the total depends on each deed: we do not compute it. Ask the notary for a quote.`,
                })}
              </p>
              <Quote>{QUOTE.notaryScale}</Quote>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <caption className="text-left text-sm">{L(locale, { es: "Notaría: escala de los documentos de cuantía (número 2.1)", ca: "Notaria: escala dels documents de quantia (número 2.1)", en: "Notary: scale for documents with a value (item 2.1)" })}</caption>
                  <tbody>
                    {scaleRows(NOTARY_SCALE, locale).map(([k, v]) => (
                      <tr key={k}>
                        <th scope="row" className="font-normal">
                          {k}
                        </th>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Quote>{QUOTE.notaryRebate}</Quote>
              <Quote>{QUOTE.notaryCopies}</Quote>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <caption className="text-left text-sm">{L(locale, { es: "Registro de la Propiedad: escala de las inscripciones (número 2.1)", ca: "Registre de la Propietat: escala de les inscripcions (número 2.1)", en: "Land Registry: scale for entries (item 2.1)" })}</caption>
                  <tbody>
                    {scaleRows(REGISTRY_SCALE, locale).map(([k, v]) => (
                      <tr key={k}>
                        <th scope="row" className="font-normal">
                          {k}
                        </th>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                {L(locale, {
                  es: `El total del número 2 del arancel registral no puede pasar de ${euros(REGISTRY_CAP.max, "es")} ni bajar de ${euros(REGISTRY_CAP.min, "es")}:`,
                  ca: `El total del número 2 de l'aranzel registral no pot passar de ${euros(REGISTRY_CAP.max, "ca")} ni baixar de ${euros(REGISTRY_CAP.min, "ca")}:`,
                  en: `The registry's item 2 total cannot exceed ${euros(REGISTRY_CAP.max, "en")} or fall below ${euros(REGISTRY_CAP.min, "en")}:`,
                })}
              </p>
              <Quote>{QUOTE.registryCap}</Quote>
              <Quote>{QUOTE.registryRebate}</Quote>

              <h2 id="texto-de-la-ley">{L(locale, { es: "Lo que dice la ley de cada comunidad", ca: "El que diu la llei de cada comunitat", en: "What each region's law says" })}</h2>
              <p>
                {L(locale, {
                  es: "Las palabras de cada ley para cada tipo de esta página, con su artículo (textos consolidados oficiales; las escalas son tablas en la ley).",
                  ca: "Les paraules de cada llei per a cada tipus d'aquesta pàgina, amb l'article (textos consolidats oficials, en castellà; les escales són taules a la llei).",
                  en: "The words of each law for every rate on this page, with its article (official consolidated texts, in Spanish; scales are tables in the law).",
                })}
              </p>
              {COMMUNITIES.filter((c) => c.law).map((c) => (
                <details key={c.id} id={`ley-${c.id}`} className="mb-2">
                  <summary>
                    {c.name[locale]}: {c.law!.short}
                  </summary>
                  <ul className="text-sm">
                    {[
                      c.itp ? { k: "itp", a: c.itp.article, t: `ITP: ${rateText(c.itp.general, locale)}`, q: c.itp.quote } : null,
                      c.ajd ? { k: "ajd", a: c.ajd.article, t: `AJD: ${rateText(c.ajd.general, locale)}`, q: c.ajd.quote } : null,
                      ...c.benefits.map((b) => ({ k: b.id, a: b.article, t: `${b.tax.toUpperCase()}: ${b.label[locale]}`, q: b.quote })),
                    ]
                      .filter((x): x is { k: string; a: string; t: string; q: string } => x !== null)
                      .map((x) => (
                        <li key={x.k}>
                          <strong>{x.t}</strong> ({x.a}): <q lang="es">{x.q}</q>
                        </li>
                      ))}
                  </ul>
                </details>
              ))}

              <h2 id="fuentes">{h.sources}</h2>
              <ul className="text-sm">
                <li>
                  <A href={BOE_TEXTS.liva.url}>{BOE_TEXTS.liva.name}</A> ({BOE_TEXTS.liva.id}): {L(locale, { es: "arts. 20.Uno.22.º, 90 y 91", ca: "arts. 20.Uno.22.º, 90 i 91", en: "arts. 20.Uno.22, 90 and 91" })}
                </li>
                <li>
                  <A href={BOE_TEXTS.trlitp.url}>{BOE_TEXTS.trlitp.name}</A> ({BOE_TEXTS.trlitp.id}): {L(locale, { es: "arts. 10, 11, 29, 31 y 57 bis", ca: "arts. 10, 11, 29, 31 i 57 bis", en: "arts. 10, 11, 29, 31 and 57 bis" })}
                </li>
                <li>
                  <A href={BOE_TEXTS.rdl17_2018.url}>{BOE_TEXTS.rdl17_2018.name}</A> ({BOE_TEXTS.rdl17_2018.id})
                </li>
                <li>
                  <A href={BOE_TEXTS.notaries.url}>{BOE_TEXTS.notaries.name}</A> ({BOE_TEXTS.notaries.id})
                </li>
                <li>
                  <A href={BOE_TEXTS.registries.url}>{BOE_TEXTS.registries.name}</A> ({BOE_TEXTS.registries.id})
                </li>
                {[...new Map(COMMUNITIES.flatMap((c) => (c.newHome.law ? [[c.newHome.law.url, c.newHome] as const] : []))).values()].map((nh) => (
                  <li key={nh.law!.url}>
                    <A href={nh.law!.url}>{nh.law!.title}</A> ({nh.article})
                  </li>
                ))}
                {COMMUNITIES.map((c) => (
                  <li key={c.id}>
                    {c.name[locale]}:{" "}
                    {c.law ? (
                      <>
                        <A href={c.law.url}>{c.law.title}</A>
                        {L(locale, { es: `, leída el ${day(c.law.readOn)}`, ca: `, llegida el ${day(c.law.readOn)}`, en: `, read on ${day(c.law.readOn)}` })}
                        {c.amendments.map((a) => (
                          <span key={a.url}>
                            {"; "}
                            <A href={a.url}>{a.title}</A>
                          </span>
                        ))}
                      </>
                    ) : (
                      <>
                        {UNVERIFIED[locale]}. <A href={c.taxAgency.url}>{c.taxAgency.name}</A>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-sm">
                {L(locale, {
                  es: `Tipos estatales por defecto: ITP ${pct(STATE_DEFAULTS.itp, "es")} y AJD ${pct(STATE_DEFAULTS.ajd, "es")}, solo si una comunidad no ha fijado los suyos.`,
                  ca: `Tipus estatals per defecte: ITP ${pct(STATE_DEFAULTS.itp, "ca")} i AJD ${pct(STATE_DEFAULTS.ajd, "ca")}, només si una comunitat no ha fixat els seus.`,
                  en: `State fall-back rates: ITP ${pct(STATE_DEFAULTS.itp, "en")} and AJD ${pct(STATE_DEFAULTS.ajd, "en")}, only where a region has not set its own.`,
                })}
              </p>

              <MoreCalculators current="home-purchase-tax" locale={locale} />
            </div>
            <ShareBar locale={locale} path={htPath(locale)} title={meta.h1} contentType="home-purchase-tax" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
