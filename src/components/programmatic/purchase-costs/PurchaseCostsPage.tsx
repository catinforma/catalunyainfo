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
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { HT_DATA_PATH, clientCommunity, communityOptions } from "@/lib/programmatic/home-purchase-tax/communities";
import { EXAMPLE, bareDay, euros, lawEuros, pcEditions, pcPath, pct, wholeEuros, type PcLocale } from "@/lib/programmatic/purchase-costs/copy";
import { exampleResults, feeTable, headline, pcFaq, pcMeta, type ExampleId } from "@/lib/programmatic/purchase-costs/page";
import {
  ARANCEL_REBATE,
  EXTRAS,
  FEES_VAT,
  NOTARY_COPY_PER_FOLIO,
  NOTARY_FREE_ABOVE,
  NOTARY_OPTIONAL_DISCOUNT_MAX,
  NOTARY_SCALE,
  PRO_INDIVISO_MAX_PCT,
  QUOTE,
  REGISTRY_CAP,
  REGISTRY_HOME_SALE_CUT,
  REGISTRY_PRESENTATION,
  REGISTRY_SCALE,
  RULES_AS_OF,
  SIMPLE_COPY_PER_FOLIO,
  SOURCES,
  VPO_FIXED,
  VPO_FIXED_ANNEX,
  type FeeSlice,
} from "@/lib/programmatic/purchase-costs/rules";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { PurchaseCostsCalculator } from "./PurchaseCostsCalculator";

/**
 * "Gastos de compraventa de vivienda" / "Despeses de compravenda d'habitatge"
 * / "Spain home buying costs": the calculator (server-rendered on EXAMPLE),
 * then who pays what, the notary's scale, copies and folios, the Registry's
 * scale and its two rebajas, protected housing, a fee table by price, the
 * IVA, the mortgage's costs (Ley 5/2019), what has no official price,
 * worked examples, questions, sources and limits. Every figure comes from
 * rules.ts through the engine; the purchase taxes from the home-purchase tax
 * engine. Static: it ships with the deploy (no publish group).
 */

const L = <T,>(locale: PcLocale, v: Record<PcLocale, T>): T => v[locale];

export function pcCrumbs(locale: PcLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: pcMeta(locale).breadcrumb, href: pcPath(locale) }];
}

export function pcMetadata(locale: PcLocale): Metadata {
  const m = pcMeta(locale);
  return buildMetadata({ locale, path: pcPath(locale), title: m.title, description: m.description, translations: pcEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ children, source }: { children: string; source: { url: string; label: string } }) {
  return (
    <blockquote lang="es">
      <p>«{children}»</p>
      <footer className="text-sm">
        <A href={source.url}>{source.label}</A>
      </footer>
    </blockquote>
  );
}

function scaleRows(scale: readonly FeeSlice[], locale: PcLocale): [string, string][] {
  return scale.map((s, i) => {
    const prev = scale[i - 1]?.to ?? null;
    const range =
      s.to === null
        ? L(locale, { es: `Más de ${euros(s.from, "es")}`, ca: `Més de ${euros(s.from, "ca")}`, en: `Over ${euros(s.from, "en")}` })
        : prev === null
          ? L(locale, { es: `Hasta ${euros(s.to, "es")}`, ca: `Fins a ${euros(s.to, "ca")}`, en: `Up to ${euros(s.to, "en")}` })
          : `${euros(prev, locale)} – ${euros(s.to, locale)}`;
    const perMille = String(s.perMille).replace(".", locale === "en" ? "." : ",");
    const fee = s.fixed !== undefined ? L(locale, { es: `${lawEuros(s.fixed, "es")} fijos`, ca: `${lawEuros(s.fixed, "ca")} fixos`, en: `${lawEuros(s.fixed, "en")} flat` }) : L(locale, { es: `${perMille} por mil del exceso`, ca: `${perMille} per mil de l'excés`, en: `${perMille} per thousand on the excess` });
    return [range, fee];
  });
}

function ScaleTable({ caption, rows, cols }: { caption: string; rows: [string, string][]; cols: [string, string] }) {
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table">
        <caption className="text-left text-sm">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{cols[0]}</th>
            <th scope="col">{cols[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, v]) => (
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
  );
}

const EXAMPLE_LABEL: Record<ExampleId, Record<PcLocale, string>> = {
  resale: { es: "Segunda mano, 250.000 €, Cataluña (el ejemplo de la calculadora)", ca: "Segona mà, 250.000 €, Catalunya (l'exemple de la calculadora)", en: "Second-hand, €250,000, Catalonia (the calculator's example)" },
  new: { es: "Obra nueva del promotor, 200.000 €, Madrid", ca: "Obra nova del promotor, 200.000 €, Madrid", en: "New build from the developer, €200,000, Madrid" },
  couple: { es: "Dos compradores a medias (proindiviso), 300.000 €, Cataluña", ca: "Dos compradors a mitges (proindivís), 300.000 €, Catalunya", en: "Two buyers, half each (pro indiviso), €300,000, Catalonia" },
  "vpo-resale": { es: "VPO de segunda mano, 150.000 €, Cataluña", ca: "HPO de segona mà, 150.000 €, Catalunya", en: "Second-hand protected home (VPO), €150,000, Catalonia" },
  "vpo-small": { es: "VPO nueva de hasta 90 m², única vivienda, 120.000 €, Andalucía", ca: "HPO nou de fins a 90 m², únic habitatge, 120.000 €, Andalusia", en: "New VPO up to 90 m², only home, €120,000, Andalusia" },
};

export function PurchaseCostsRoute({ locale }: { locale: PcLocale }) {
  const meta = pcMeta(locale);
  const crumbs = pcCrumbs(locale);
  const E = (n: number) => euros(n, locale);
  const X = (n: number) => lawEuros(n, locale);
  const P = (n: number) => pct(n, locale);
  const day = (iso: string) => bareDay(iso, locale);
  const h = headline();
  const n = h.fees.notary;
  const r = h.fees.registry;
  const taxLine = h.taxes.status === "ok" ? h.taxes.lines[0] : null;
  const faq = pcFaq(locale);
  const examples = exampleResults();
  const rows = feeTable();
  const src = (s: { url: string; name: string }, art: string) => ({ url: s.url, label: `${s.name}, ${art}` });

  const lead = L(locale, {
    es: `Al comprar una vivienda, la notaría y el Registro de la Propiedad cobran por arancel oficial: una escala por tramos del precio, con rebajas fijadas en el BOE, más las copias y los folios. En una vivienda de segunda mano de ${wholeEuros(EXAMPLE.price, "es")} en Cataluña, con una escritura de ${EXAMPLE.folios} folios, la escritura matriz cuesta ${E(n.deed)} (la paga el vendedor salvo pacto), tus copias ${E(cents2(n.firstCopy + n.simpleCopies))} y el Registro ${E(r.total)}, más el ${P(FEES_VAT)} de IVA. Lo grande es el impuesto: ${taxLine?.amount != null ? E(taxLine.amount) : "—"} de ITP. En total pagas ${h.buyerTotal !== null ? E(h.buyerTotal) : "—"}.`,
    ca: `En comprar un habitatge, la notaria i el Registre de la Propietat cobren per aranzel oficial: una escala per trams del preu, amb rebaixes fixades al BOE, més les còpies i els folis. En un habitatge de segona mà de ${wholeEuros(EXAMPLE.price, "ca")} a Catalunya, amb una escriptura de ${EXAMPLE.folios} folis, l'escriptura matriu costa ${E(n.deed)} (la paga el venedor llevat de pacte), les teves còpies ${E(cents2(n.firstCopy + n.simpleCopies))} i el Registre ${E(r.total)}, més el ${P(FEES_VAT)} d'IVA. El gran és l'impost: ${taxLine?.amount != null ? E(taxLine.amount) : "—"} d'ITP. En total pagues ${h.buyerTotal !== null ? E(h.buyerTotal) : "—"}.`,
    en: `When you buy a home in Spain, the notary and the Land Registry charge on official scales: slices of the price, with rebates set in the BOE, plus copies and folios. For a ${wholeEuros(EXAMPLE.price, "en")} second-hand home in Catalonia with a ${EXAMPLE.folios}-folio deed, the deed itself costs ${E(n.deed)} (the seller's unless agreed), your copies ${E(cents2(n.firstCopy + n.simpleCopies))} and the Registry ${E(r.total)}, plus ${P(FEES_VAT)} VAT. The big item is the tax: ${taxLine?.amount != null ? E(taxLine.amount) : "—"} of ITP. In all you pay ${h.buyerTotal !== null ? E(h.buyerTotal) : "—"}.`,
  });
  const freshness = L(locale, {
    es: `Aranceles y normas leídos en el BOE (textos consolidados) el ${day(RULES_AS_OF)}. Los impuestos salen de nuestra calculadora de impuestos de compra, con las leyes de cada comunidad.`,
    ca: `Aranzels i normes llegits al BOE (textos consolidats) el ${day(RULES_AS_OF)}. Els impostos surten de la nostra calculadora d'impostos de compra, amb les lleis de cada comunitat.`,
    en: `Scales and rules read in the BOE (consolidated texts) on ${day(RULES_AS_OF)}. The taxes come from our home purchase tax calculator, with each region's law.`,
  });
  const disclaimer = L(locale, {
    es: "Estimación con las escalas oficiales, no un presupuesto ni asesoramiento. Los folios, las copias y otros conceptos (notas, testimonios, suplidos) cambian en cada escritura, y la factura final puede ser distinta. Pide la minuta detallada a la notaría y al Registro, y confirma los impuestos con la agencia tributaria de tu comunidad.",
    ca: "Estimació amb les escales oficials, no un pressupost ni assessorament. Els folis, les còpies i altres conceptes (notes, testimonis, bestretes) canvien a cada escriptura, i la factura final pot ser diferent. Demana la minuta detallada a la notaria i al Registre, i confirma els impostos amb l'agència tributària de la teva comunitat.",
    en: "An estimate on the official scales, not a quote or advice. Folios, copies and other items (notes, certified copies, outlays) change with each deed, and the final invoice may differ. Ask the notary and the Registry for an itemised invoice, and confirm the taxes with your region's tax agency.",
  });

  const hd = L(locale, {
    es: { who: "Quién paga cada gasto", notary: "Notaría: el arancel del Real Decreto 1426/1989", copies: "Copias y folios de la escritura", registry: "Registro de la Propiedad: el arancel del Real Decreto 1427/1989", owners: "Si compráis varias personas", vpo: "Vivienda protegida (VPO): las rebajas", table: "Notaría y Registro por precio de la vivienda", vat: "El IVA de la notaría y el Registro", mortgage: "Si firmas una hipoteca", free: "Gestoría y tasación: sin precio oficial", taxes: "Los impuestos de la compra", examples: "Ejemplos", faq: "Preguntas frecuentes", sources: "Fuentes oficiales", limits: "Qué no calcula" },
    ca: { who: "Qui paga cada despesa", notary: "Notaria: l'aranzel del Reial decret 1426/1989", copies: "Còpies i folis de l'escriptura", registry: "Registre de la Propietat: l'aranzel del Reial decret 1427/1989", owners: "Si compreu diverses persones", vpo: "Habitatge protegit (HPO): les rebaixes", table: "Notaria i Registre per preu de l'habitatge", vat: "L'IVA de la notaria i el Registre", mortgage: "Si signes una hipoteca", free: "Gestoria i taxació: sense preu oficial", taxes: "Els impostos de la compra", examples: "Exemples", faq: "Preguntes freqüents", sources: "Fonts oficials", limits: "Què no calcula" },
    en: { who: "Who pays each cost", notary: "Notary: the scale of Royal Decree 1426/1989", copies: "Copies and folios of the deed", registry: "Land Registry: the scale of Royal Decree 1427/1989", owners: "If several people buy", vpo: "Protected housing (VPO): the discounts", table: "Notary and Registry fees by price", vat: "VAT on the notary and Registry", mortgage: "If you sign a mortgage", free: "Gestoría and valuation: no official price", taxes: "The purchase taxes", examples: "Worked examples", faq: "Questions", sources: "Official sources", limits: "What it does not cover" },
  });

  const whoCols = L(locale, { es: ["Gasto", "Quién paga", "Norma"], ca: ["Despesa", "Qui paga", "Norma"], en: ["Cost", "Who pays", "Rule"] });
  const whoRows = L<[string, string, string][]>(locale, {
    es: [
      ["Escritura matriz de compraventa (notaría)", "El vendedor, salvo pacto", "Código Civil, art. 1455"],
      ["Primera copia y copias posteriores (notaría)", "El comprador, salvo pacto", "Código Civil, art. 1455"],
      ["Inscripción en el Registro de la Propiedad", "Quien inscribe a su favor: el comprador", "Real Decreto 1427/1989, norma general octava"],
      ["ITP, o IVA y AJD de la compra", "El comprador, pacte lo que pacte", "Texto refundido del ITPAJD, arts. 8 y 29"],
      ["Notaría, Registro, gestoría y AJD de la hipoteca", "El banco", "Ley 5/2019, art. 14.1.e; texto refundido, art. 29"],
      ["Copias de la escritura de hipoteca", "Quien las pide", "Ley 5/2019, art. 14.1.e.ii"],
      ["Tasación de la vivienda (hipoteca)", "El comprador (prestatario)", "Ley 5/2019, art. 14.1.e.i"],
    ],
    ca: [
      ["Escriptura matriu de compravenda (notaria)", "El venedor, llevat de pacte", "Codi civil espanyol, art. 1455"],
      ["Primera còpia i còpies posteriors (notaria)", "El comprador, llevat de pacte", "Codi civil espanyol, art. 1455"],
      ["Inscripció al Registre de la Propietat", "Qui inscriu al seu favor: el comprador", "Reial decret 1427/1989, norma general vuitena"],
      ["ITP, o IVA i AJD de la compra", "El comprador, pactin el que pactin", "Text refós de l'ITPAJD, arts. 8 i 29"],
      ["Notaria, Registre, gestoria i AJD de la hipoteca", "El banc", "Llei 5/2019, art. 14.1.e; text refós, art. 29"],
      ["Còpies de l'escriptura d'hipoteca", "Qui les demana", "Llei 5/2019, art. 14.1.e.ii"],
      ["Taxació de l'habitatge (hipoteca)", "El comprador (prestatari)", "Llei 5/2019, art. 14.1.e.i"],
    ],
    en: [
      ["The sale deed itself (notary)", "The seller, unless agreed", "Civil Code, art. 1455"],
      ["First and later copies (notary)", "The buyer, unless agreed", "Civil Code, art. 1455"],
      ["Registration at the Land Registry", "Whoever registers in their favour: the buyer", "Royal Decree 1427/1989, general rule eight"],
      ["ITP, or IVA and AJD on the purchase", "The buyer, whatever is agreed", "ITPAJD consolidated act, arts. 8 and 29"],
      ["Notary, Registry, gestoría and AJD of the mortgage", "The bank", "Ley 5/2019, art. 14.1.e; consolidated act, art. 29"],
      ["Copies of the mortgage deed", "Whoever asks for them", "Ley 5/2019, art. 14.1.e.ii"],
      ["Valuation of the home (mortgage)", "The buyer (borrower)", "Ley 5/2019, art. 14.1.e.i"],
    ],
  });

  const scaleCols = L<[string, string]>(locale, { es: ["Valor de la vivienda", "Derechos"], ca: ["Valor de l'habitatge", "Drets"], en: ["Value of the home", "Fee"] });
  const tableCols = L(locale, {
    es: ["Precio", "Notaría: escala", "Notaría: matriz con la rebaja del 5 %", "Registro: escala", "Registro: inscripción con las dos rebajas"],
    ca: ["Preu", "Notaria: escala", "Notaria: matriu amb la rebaixa del 5 %", "Registre: escala", "Registre: inscripció amb les dues rebaixes"],
    en: ["Price", "Notary: scale", "Notary: deed after the 5% rebate", "Registry: scale", "Registry: registration after both rebates"],
  });
  const exCols = L(locale, {
    es: ["Caso", "Notaría", "Registro", "IVA de tus facturas", "Impuestos", "Total que pagas", "Paga el vendedor"],
    ca: ["Cas", "Notaria", "Registre", "IVA de les teves factures", "Impostos", "Total que pagues", "Paga el venedor"],
    en: ["Case", "Notary", "Registry", "VAT on your invoices", "Taxes", "Total you pay", "Seller pays"],
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(pcPath(locale)),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  const limits = L(locale, {
    es: [
      "Los folios y las copias son tu estimación: cada folio de la matriz se cuenta escrito por las dos caras (el Reglamento Notarial, art. 155, regula las cuatro planas de cada pliego) y cada copia tan larga como la matriz.",
      "No suma notas simples, notas de afección fiscal, testimonios, desplazamientos del notario ni suplidos, que dependen de cada escritura.",
      `Por encima de ${E(NOTARY_FREE_ABOVE)} la notaría del exceso es libre: la calculadora no llega ahí.`,
      "En una VPO nueva de más de 90 m², la Ley 41/1980 habla de «derechos de matriz»: aplicamos el 50 % a la escala y a la primera copia, no a los folios (estimación al alza).",
      "No calcula los gastos de la hipoteca (los paga el banco), la tasación, la gestoría, la cancelación de la hipoteca del vendedor ni la plusvalía municipal.",
      "En Canarias, Ceuta y Melilla no suma el IGIC o el IPSI de las facturas.",
    ],
    ca: [
      "Els folis i les còpies són la teva estimació: cada foli de la matriu es compta escrit per les dues cares (el Reglament notarial, art. 155, regula les quatre planes de cada plec) i cada còpia tan llarga com la matriu.",
      "No suma notes simples, notes d'afecció fiscal, testimonis, desplaçaments del notari ni bestretes, que depenen de cada escriptura.",
      `Per sobre de ${E(NOTARY_FREE_ABOVE)} la notaria de l'excés és lliure: la calculadora no hi arriba.`,
      "En un HPO nou de més de 90 m², la Llei 41/1980 parla de «drets de matriu»: apliquem el 50 % a l'escala i a la primera còpia, no als folis (estimació a l'alça).",
      "No calcula les despeses de la hipoteca (les paga el banc), la taxació, la gestoria, la cancel·lació de la hipoteca del venedor ni la plusvàlua municipal.",
      "A Canàries, Ceuta i Melilla no suma l'IGIC o l'IPSI de les factures.",
    ],
    en: [
      "Folios and copies are your estimate: each matrix folio counts as written on both sides (the Notarial Regulation, art. 155, lays out four sides per sheet) and each copy as long as the matrix.",
      "It does not add Registry extracts, tax charge notes, certified copies of attachments, the notary's travel or outlays, which depend on each deed.",
      `Above ${E(NOTARY_FREE_ABOVE)} the notary's fee on the excess is free: the calculator stops there.`,
      "For a new VPO over 90 m², Ley 41/1980 speaks of “derechos de matriz”: we apply the 50% to the scale and the first copy, not to the folios (an estimate on the high side).",
      "It does not work out the mortgage's costs (the bank's), the valuation, a gestoría, cancelling the seller's mortgage or the municipal plusvalía tax.",
      "In the Canary Islands, Ceuta and Melilla it does not add the IGIC or IPSI on the invoices.",
    ],
  });

  return (
    <>
      <SiteHeader locale={locale} translations={pcEditions()} />
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
              <PurchaseCostsCalculator locale={locale} options={communityOptions(locale)} initial={clientCommunity(EXAMPLE.community)} dataUrl={HT_DATA_PATH} />
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>
              <CalculatorNextStep current="home-purchase-costs" locale={locale} />

              <h2 id="quien-paga">{hd.who}</h2>
              <p>
                {L(locale, {
                  es: "Notaría y Registro tienen arancel: su precio lo fija el BOE, no cada despacho. Quién paga cada parte lo dicen el Código Civil, el arancel y, con hipoteca, la Ley 5/2019:",
                  ca: "Notaria i Registre tenen aranzel: el preu el fixa el BOE, no cada despatx. Qui paga cada part ho diuen el Codi civil espanyol, l'aranzel i, amb hipoteca, la Llei 5/2019 (textos oficials en castellà):",
                  en: "The notary and the Registry charge on official scales: the BOE sets the price, not each office. Who pays each part comes from the Civil Code, the scales and, with a mortgage, Ley 5/2019 (official texts in Spanish):",
                })}
              </p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {whoCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {whoRows.map(([k, who, rule]) => (
                      <tr key={k}>
                        <th scope="row">{k}</th>
                        <td data-label={whoCols[1]}>{who}</td>
                        <td data-label={whoCols[2]}>{rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Quote source={src(SOURCES.civilCode, "art. 1455")}>{QUOTE.civilCode1455}</Quote>
              <Quote source={src(SOURCES.trlitp, "art. 8")}>{`${QUOTE.taxBuyer} ${QUOTE.taxBuyerWho}`}</Quote>
              <Quote source={src(SOURCES.registries, "anexo II, norma octava")}>{QUOTE.registryWhoPays}</Quote>

              <h2 id="notaria">{hd.notary}</h2>
              <p>
                {L(locale, {
                  es: `El notario cobra la escritura de compraventa con la escala del número 2.1 de su arancel, sobre el precio (o el valor comprobado por Hacienda, si lo hay). Hasta ${E(NOTARY_FREE_ABOVE)}; por encima, el exceso se pacta libremente. No puede cobrar por asesorarte sobre la escritura que autoriza:`,
                  ca: `El notari cobra l'escriptura de compravenda amb l'escala del número 2.1 del seu aranzel, sobre el preu (o el valor comprovat per Hisenda, si n'hi ha). Fins a ${E(NOTARY_FREE_ABOVE)}; per sobre, l'excés es pacta lliurement. No pot cobrar per assessorar-te sobre l'escriptura que autoritza:`,
                  en: `The notary charges the sale deed on item 2.1 of the notaries' scale, on the price (or the value checked by the tax office, if any). Up to ${E(NOTARY_FREE_ABOVE)}; above that the excess is agreed freely. The notary cannot charge for advising you on the deed they authorise:`,
                })}
              </p>
              <ScaleTable caption={L(locale, { es: "Arancel notarial, número 2.1: documentos de cuantía", ca: "Aranzel notarial, número 2.1: documents de quantia", en: "Notaries' scale, item 2.1: documents with a value" })} rows={scaleRows(NOTARY_SCALE, locale)} cols={scaleCols} />
              <Quote source={src(SOURCES.notaries, "anexo I, número 2.1")}>{`${QUOTE.notaryScaleLead} ${QUOTE.notaryScale.join(" ")} ${QUOTE.notaryFree}`}</Quote>
              <p>
                {L(locale, {
                  es: `Al resultado se le resta siempre un ${P(ARANCEL_REBATE)} (lo introdujo el Real Decreto-ley 8/2010 y el Real Decreto 1612/2011 lo escribió en el arancel), además de cualquier otra rebaja. Y el notario puede hacer un descuento de hasta el ${P(NOTARY_OPTIONAL_DISCOUNT_MAX)} si quiere (Real Decreto-ley 6/2000, art. 35): no lo aplicamos porque es voluntario.`,
                  ca: `Al resultat se li resta sempre un ${P(ARANCEL_REBATE)} (el va introduir el Reial decret llei 8/2010 i el Reial decret 1612/2011 el va escriure a l'aranzel), a més de qualsevol altra rebaixa. I el notari pot fer un descompte de fins al ${P(NOTARY_OPTIONAL_DISCOUNT_MAX)} si vol (Reial decret llei 6/2000, art. 35): no l'apliquem perquè és voluntari.`,
                  en: `A ${P(ARANCEL_REBATE)} rebate always comes off the result (introduced by Royal Decree-law 8/2010 and written into the scale by Royal Decree 1612/2011), on top of any other discount. The notary may also give a discount of up to ${P(NOTARY_OPTIONAL_DISCOUNT_MAX)} (Royal Decree-law 6/2000, art. 35): we do not apply it, as it is optional.`,
                })}
              </p>
              <Quote source={src(SOURCES.notaries, "anexo I, número 2.1")}>{QUOTE.notaryRebate}</Quote>
              <Quote source={src(SOURCES.rdl6_2000, "art. 35.1")}>{QUOTE.notaryDiscount}</Quote>
              <Quote source={src(SOURCES.notaries, "anexo II, norma segunda")}>{QUOTE.notaryNoAdvice}</Quote>

              <h3 id="copias">{hd.copies}</h3>
              <p>
                {L(locale, {
                  es: `Además de la escala, la matriz paga sus folios desde el quinto, por cara escrita, y cada copia se cobra por folio: la copia autorizada (la que va al Registro) a ${X(NOTARY_COPY_PER_FOLIO)} el folio y la mitad desde el duodécimo; una copia simple a ${X(SIMPLE_COPY_PER_FOLIO)} el folio. Estos importes no tienen la rebaja del 5 %, que es solo de la escala.`,
                  ca: `A més de l'escala, la matriu paga els folis des del cinquè, per cara escrita, i cada còpia es cobra per foli: la còpia autoritzada (la que va al Registre) a ${X(NOTARY_COPY_PER_FOLIO)} el foli i la meitat des del dotzè; una còpia simple a ${X(SIMPLE_COPY_PER_FOLIO)} el foli. Aquests imports no tenen la rebaixa del 5 %, que és només de l'escala.`,
                  en: `Besides the scale, the matrix pays for its folios from the fifth, per written side, and each copy is charged per folio: the authorised copy (the one that goes to the Registry) at ${X(NOTARY_COPY_PER_FOLIO)} a folio and half from the twelfth; a simple copy at ${X(SIMPLE_COPY_PER_FOLIO)} a folio. These amounts do not get the 5% rebate, which is for the scale only.`,
                })}
              </p>
              <Quote source={src(SOURCES.notaries, "anexo I, número 4")}>{`${QUOTE.notaryCopies} […] ${QUOTE.notarySimpleCopies}`}</Quote>
              <Quote source={src(SOURCES.notaries, "anexo I, número 7")}>{QUOTE.notaryMatrixFolios}</Quote>
              <p>
                {L(locale, {
                  es: "Ninguna fuente oficial publica cuántos folios tiene una escritura de compraventa, así que la calculadora te los pregunta (20 en el ejemplo, sin que sea una media). Cuenta cada folio escrito por las dos caras, porque la matriz se extiende en las cuatro planas de cada pliego:",
                  ca: "Cap font oficial publica quants folis té una escriptura de compravenda, així que la calculadora te'ls pregunta (20 a l'exemple, sense que sigui una mitjana). Compta cada foli escrit per les dues cares, perquè la matriu s'estén a les quatre planes de cada plec:",
                  en: "No official source publishes how many folios a sale deed has, so the calculator asks you (20 in the example, not an average). It counts each folio as written on both sides, because the matrix is written on the four sides of each sheet:",
                })}
              </p>
              <Quote source={src(SOURCES.notarialRegulation, "art. 155")}>{QUOTE.notarySides}</Quote>

              <h2 id="registro">{hd.registry}</h2>
              <p>
                {L(locale, {
                  es: `El registrador cobra la inscripción de tu compra con la escala del número 2.1 de su arancel. El total no puede bajar de ${X(REGISTRY_CAP.min)} ni pasar de ${X(REGISTRY_CAP.max)}; se le resta un ${P(ARANCEL_REBATE)} y, por ser compraventa de vivienda, otro ${P(REGISTRY_HOME_SALE_CUT)} sobre lo que queda (Real Decreto-ley 6/2000, art. 36). El asiento de presentación (número 1) suma ${X(REGISTRY_PRESENTATION)}.`,
                  ca: `El registrador cobra la inscripció de la teva compra amb l'escala del número 2.1 del seu aranzel. El total no pot baixar de ${X(REGISTRY_CAP.min)} ni passar de ${X(REGISTRY_CAP.max)}; se li resta un ${P(ARANCEL_REBATE)} i, per ser compravenda d'habitatge, un altre ${P(REGISTRY_HOME_SALE_CUT)} sobre el que queda (Reial decret llei 6/2000, art. 36). L'assentament de presentació (número 1) suma ${X(REGISTRY_PRESENTATION)}.`,
                  en: `The registrar charges your purchase's registration on item 2.1 of the registrars' scale. The total cannot fall below ${X(REGISTRY_CAP.min)} or exceed ${X(REGISTRY_CAP.max)}; ${P(ARANCEL_REBATE)} comes off and, as a home sale, another ${P(REGISTRY_HOME_SALE_CUT)} on what is left (Royal Decree-law 6/2000, art. 36). The presentation entry (item 1) adds ${X(REGISTRY_PRESENTATION)}.`,
                })}
              </p>
              <ScaleTable caption={L(locale, { es: "Arancel registral, número 2.1: inscripciones", ca: "Aranzel registral, número 2.1: inscripcions", en: "Registrars' scale, item 2.1: registrations" })} rows={scaleRows(REGISTRY_SCALE, locale)} cols={scaleCols} />
              <Quote source={src(SOURCES.registries, "anexo I, número 2.1")}>{`${QUOTE.registryScaleLead} ${QUOTE.registryScale.join(" ")}`}</Quote>
              <Quote source={src(SOURCES.registries, "anexo I, número 2.1")}>{QUOTE.registryCap}</Quote>
              <Quote source={src(SOURCES.registries, "anexo I, número 2.1")}>{QUOTE.registryRebate}</Quote>
              <Quote source={src(SOURCES.rdl6_2000, "art. 36.1")}>{`${QUOTE.registryHomeSale} […] ${QUOTE.registryHomeSaleOrder}`}</Quote>
              <Quote source={src(SOURCES.registries, "anexo I, número 1")}>{QUOTE.registryPresentation}</Quote>

              <h3 id="varios-compradores">{hd.owners}</h3>
              <p>
                {L(locale, {
                  es: `Si compráis en proindiviso, el registrador aplica la escala a la parte de cada uno, y como la escala baja por tramos, sale más caro que una sola base; el total no puede pasar del ${P(PRO_INDIVISO_MAX_PCT)} del valor. Un matrimonio en gananciales o en otra comunidad matrimonial paga como una sola base:`,
                  ca: `Si compreu en proindivís, el registrador aplica l'escala a la part de cadascú, i com que l'escala baixa per trams, surt més car que una sola base; el total no pot passar de l'${P(PRO_INDIVISO_MAX_PCT)} del valor. Un matrimoni en societat de guanys o en una altra comunitat matrimonial paga com una sola base:`,
                  en: `If you buy in shares (pro indiviso), the registrar applies the scale to each share, and since the scale falls by slices, it costs more than a single base; the total cannot exceed ${P(PRO_INDIVISO_MAX_PCT)} of the value. A married couple under community property pays as one base:`,
                })}
              </p>
              <Quote source={src(SOURCES.registries, "anexo II, norma segunda")}>{`${QUOTE.registryProIndiviso} […] ${QUOTE.registrySpouses}`}</Quote>
              <p>
                {L(locale, {
                  es: "En Cataluña, si no hay capítulos matrimoniales, el régimen es el de separación de bienes, así que un matrimonio que compra a medias es un proindiviso para el Registro:",
                  ca: "A Catalunya, si no hi ha capítols matrimonials, el règim és el de separació de béns, de manera que un matrimoni que compra a mitges és un proindivís per al Registre (text oficial en castellà al BOE):",
                  en: "In Catalonia, without a marriage contract, spouses hold property separately, so a married couple buying half each is a pro indiviso for the Registry (the BOE's Spanish text):",
                })}
              </p>
              <Quote source={src(SOURCES.catalanFamilyCode, "art. 231-10.2")}>{QUOTE.catalanSeparation}</Quote>

              <h2 id="vpo">{hd.vpo}</h2>
              <p>
                {L(locale, {
                  es: `Los aranceles no tienen rebaja por primera vivienda si es libre. Para las viviendas protegidas sí: en la segunda y posteriores ventas de una VPO, la escala de la notaría (número 2.2.e) y la del Registro (número 2.4.b) bajan un 50 %. En la primera venta, la Ley 41/1980 rebaja un 50 % la matriz, la primera copia y la inscripción, y si la vivienda no pasa de ${VPO_FIXED.maxUsefulArea} m² útiles, notaría y Registro cobran un fijo por todo: ${X(VPO_FIXED.notary)} y ${X(VPO_FIXED.registry)}. Las dos cosas solo si es la única vivienda del comprador y su residencia habitual y permanente.`,
                  ca: `Els aranzels no tenen rebaixa per primer habitatge si és lliure. Per als habitatges protegits sí: en la segona i posteriors vendes d'un HPO, l'escala de la notaria (número 2.2.e) i la del Registre (número 2.4.b) baixen un 50 %. En la primera venda, la Llei 41/1980 rebaixa un 50 % la matriu, la primera còpia i la inscripció, i si l'habitatge no passa de ${VPO_FIXED.maxUsefulArea} m² útils, notaria i Registre cobren un fix per tot: ${X(VPO_FIXED.notary)} i ${X(VPO_FIXED.registry)}. Les dues coses només si és l'únic habitatge del comprador i la seva residència habitual i permanent.`,
                  en: `The scales have no first-home discount for a free-market home. Protected housing does: on a VPO's second and later sales the notary's scale (item 2.2.e) and the Registry's (item 2.4.b) fall by 50%. On the first sale, Ley 41/1980 takes 50% off the deed, the first copy and the registration, and if the home has no more than ${VPO_FIXED.maxUsefulArea} m² of useful floor area, notary and Registry charge a fixed amount for everything: ${X(VPO_FIXED.notary)} and ${X(VPO_FIXED.registry)}. Both only if it is the buyer's only home and permanent main residence.`,
                })}
              </p>
              <Quote source={src(SOURCES.notaries, "anexo I, número 2.2")}>{`${QUOTE.notaryHalfLead} […] ${QUOTE.notaryVpoResale}`}</Quote>
              <Quote source={src(SOURCES.registries, "anexo I, número 2.4")}>{`${QUOTE.registryHalfLead} […] ${QUOTE.registryVpoResale}`}</Quote>
              <Quote source={src(SOURCES.ley41_1980, "art. 8.1 y 8.2")}>{`${QUOTE.vpoFirst} […] ${QUOTE.vpoFirstSale}`}</Quote>
              <Quote source={src(SOURCES.instruction2002, "arts. 5.a y 11.a")}>{`${QUOTE.vpoEurosNotary} […] ${QUOTE.vpoEurosRegistry}`}</Quote>
              <p className="text-sm">
                {L(locale, {
                  es: `Con plaza de garaje y trastero vinculados, el fijo puede subir ${X(VPO_FIXED_ANNEX.notary.parking)} y ${X(VPO_FIXED_ANNEX.notary.storeroom)} en la notaría y ${X(VPO_FIXED_ANNEX.registry.parking)} y ${X(VPO_FIXED_ANNEX.registry.storeroom)} en el Registro (misma Instrucción, arts. 5.b y 11.b). La Ley 41/1980 deja a salvo beneficios más favorables de la norma con la que se calificó la vivienda.`,
                  ca: `Amb plaça d'aparcament i traster vinculats, el fix pot pujar ${X(VPO_FIXED_ANNEX.notary.parking)} i ${X(VPO_FIXED_ANNEX.notary.storeroom)} a la notaria i ${X(VPO_FIXED_ANNEX.registry.parking)} i ${X(VPO_FIXED_ANNEX.registry.storeroom)} al Registre (mateixa Instrucció, arts. 5.b i 11.b). La Llei 41/1980 deixa a salvo beneficis més favorables de la norma amb què es va qualificar l'habitatge.`,
                  en: `With a linked parking space and storeroom, the fixed amount may rise by ${X(VPO_FIXED_ANNEX.notary.parking)} and ${X(VPO_FIXED_ANNEX.notary.storeroom)} at the notary and ${X(VPO_FIXED_ANNEX.registry.parking)} and ${X(VPO_FIXED_ANNEX.registry.storeroom)} at the Registry (same Instruction, arts. 5.b and 11.b). Ley 41/1980 keeps any more favourable benefit of the rules under which the home was classified.`,
                })}
              </p>

              <h2 id="tabla">{hd.table}</h2>
              <p>
                {L(locale, {
                  es: "Solo las escalas, con sus rebajas, para una persona que compra una vivienda libre. Faltan los folios, las copias, el asiento de presentación y el IVA, que la calculadora sí suma:",
                  ca: "Només les escales, amb les seves rebaixes, per a una persona que compra un habitatge lliure. Hi falten els folis, les còpies, l'assentament de presentació i l'IVA, que la calculadora sí que suma:",
                  en: "The scales only, with their rebates, for one person buying a free-market home. Folios, copies, the presentation entry and VAT are not in it; the calculator adds them:",
                })}
              </p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
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
                    {rows.map((row) => (
                      <tr key={row.price} id={`precio-${row.price}`}>
                        <th scope="row">{wholeEuros(row.price, locale)}</th>
                        <td data-label={tableCols[1]}>{E(row.notaryScale)}</td>
                        <td data-label={tableCols[2]}>{E(row.notaryDeed)}</td>
                        <td data-label={tableCols[3]}>{E(row.registryScale)}</td>
                        <td data-label={tableCols[4]}>{E(row.registration)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="iva">{hd.vat}</h2>
              <p>
                {L(locale, {
                  es: `Las facturas del notario y del registrador llevan el IVA general del ${P(FEES_VAT)}. En Canarias, Ceuta y Melilla no se aplica el IVA (art. 3 de la Ley del IVA): llevan IGIC o IPSI, que la calculadora no suma.`,
                  ca: `Les factures del notari i del registrador porten l'IVA general del ${P(FEES_VAT)}. A Canàries, Ceuta i Melilla no s'aplica l'IVA (art. 3 de la Llei de l'IVA): porten IGIC o IPSI, que la calculadora no suma.`,
                  en: `Notary and registrar invoices carry the general ${P(FEES_VAT)} IVA (VAT). The Canary Islands, Ceuta and Melilla are outside the IVA (VAT Act art. 3): their invoices carry IGIC or IPSI, which the calculator does not add.`,
                })}
              </p>
              <Quote source={src(SOURCES.liva, "art. 90.Uno")}>{QUOTE.vatGeneral}</Quote>

              <h2 id="hipoteca">{hd.mortgage}</h2>
              <p>
                {L(locale, {
                  es: "La escritura de la hipoteca es otra escritura, aparte de la compraventa. Desde la Ley 5/2019, su notaría, su inscripción y la gestoría las paga el banco; tú pagas la tasación y las copias que pidas. El AJD del préstamo también es del banco:",
                  ca: "L'escriptura de la hipoteca és una altra escriptura, a part de la compravenda. Des de la Llei 5/2019, la seva notaria, la seva inscripció i la gestoria les paga el banc; tu pagues la taxació i les còpies que demanis. L'AJD del préstec també és del banc:",
                  en: "The mortgage deed is a separate deed from the sale. Since Ley 5/2019 the bank pays its notary, its registration and the gestoría; you pay the valuation and any copies you ask for. The AJD on the loan is the bank's too:",
                })}
              </p>
              <Quote source={src(SOURCES.ley5_2019, "art. 14.1.e")}>{`${QUOTE.ley5Lead} i. ${QUOTE.ley5Valuation} ii. ${QUOTE.ley5Notary} iii ${QUOTE.ley5Registry} iv. ${QUOTE.ley5Tax}`}</Quote>
              <Quote source={src(SOURCES.trlitp, "art. 29")}>{`${QUOTE.ajdBuyer} ${QUOTE.mortgageAjdLender}`}</Quote>
              <p>
                <Link href={calcPath("mortgage", locale)}>{L(locale, { es: "Calcula la cuota de tu hipoteca", ca: "Calcula la quota de la teva hipoteca", en: "Work out your mortgage payment" })}</Link>
                {L(locale, { es: ", con el Euríbor oficial.", ca: ", amb l'Euríbor oficial.", en: ", with the official Euribor." })}
              </p>

              <h2 id="sin-arancel">{hd.free}</h2>
              <p>
                {L(locale, {
                  es: "La gestoría (que liquida el impuesto y lleva la escritura al Registro) y la tasación no tienen arancel oficial: cada empresa fija su precio. No los estimamos; pide presupuesto por escrito. Con hipoteca, la gestoría la paga el banco y la tasación tú.",
                  ca: "La gestoria (que liquida l'impost i porta l'escriptura al Registre) i la taxació no tenen aranzel oficial: cada empresa fixa el seu preu. No els estimem; demana pressupost per escrit. Amb hipoteca, la gestoria la paga el banc i la taxació tu.",
                  en: "The gestoría (which files the tax and takes the deed to the Registry) and the valuation have no official scale: each firm sets its price. We do not estimate them; ask for a written quote. With a mortgage the bank pays the gestoría and you pay the valuation.",
                })}
              </p>

              <h2 id="impuestos">{hd.taxes}</h2>
              <p>
                {L(locale, {
                  es: "El gasto mayor es el impuesto: ITP en una vivienda de segunda mano, o IVA y AJD en una nueva, con el tipo de tu comunidad. La calculadora de arriba lo suma con el mismo motor que nuestra calculadora de impuestos, que da cada tipo con su artículo y los requisitos de los tipos reducidos:",
                  ca: "La despesa més gran és l'impost: ITP en un habitatge de segona mà, o IVA i AJD en un de nou, amb el tipus de la teva comunitat. La calculadora de dalt el suma amb el mateix motor que la nostra calculadora d'impostos, que dona cada tipus amb el seu article i els requisits dels tipus reduïts:",
                  en: "The biggest cost is the tax: ITP on a second-hand home, or IVA and AJD on a new one, at your region's rate. The calculator above adds it with the same engine as our tax calculator, which gives each rate with its article and the conditions of the reduced rates:",
                })}{" "}
                <Link href={calcPath("home-purchase-tax", locale)}>{L(locale, { es: "Impuestos al comprar vivienda (ITP o IVA)", ca: "Impostos en comprar habitatge (ITP o IVA)", en: "Home purchase taxes (ITP or IVA)" })}</Link>.
              </p>

              <h2 id="ejemplos">{hd.examples}</h2>
              <p>
                {L(locale, {
                  es: `Con una escritura de ${EXAMPLE.folios} folios, una copia simple y el reparto legal (la matriz, del vendedor). «Notaría» es el total de la notaría, la pague quien la pague:`,
                  ca: `Amb una escriptura de ${EXAMPLE.folios} folis, una còpia simple i el repartiment legal (la matriu, del venedor). «Notaria» és el total de la notaria, la pagui qui la pagui:`,
                  en: `With a ${EXAMPLE.folios}-folio deed, one simple copy and the legal split (the deed itself on the seller). “Notary” is the whole notary bill, whoever pays it:`,
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
                    {examples.map(({ id, result: x }) => (
                      <tr key={id} id={`ejemplo-${id}`}>
                        <th scope="row">{EXAMPLE_LABEL[id][locale]}</th>
                        <td data-label={exCols[1]}>{E(x.fees.notary.total)}</td>
                        <td data-label={exCols[2]}>{E(x.fees.registry.total)}</td>
                        <td data-label={exCols[3]}>{x.fees.vat ? E(x.fees.vat.buyer) : "—"}</td>
                        <td data-label={exCols[4]}>{x.taxes.status === "ok" && x.taxes.total !== null ? E(x.taxes.total) : "—"}</td>
                        <td data-label={exCols[5]}>{x.buyerTotal !== null ? E(x.buyerTotal) : "—"}</td>
                        <td data-label={exCols[6]}>{E(x.sellerFees)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                {L(locale, {
                  es: "Los impuestos de las VPO usan el tipo reducido de la ley de cada comunidad, que pide requisitos que solo comprueba Hacienda; la calculadora de impuestos los detalla.",
                  ca: "Els impostos dels HPO fan servir el tipus reduït de la llei de cada comunitat, que demana requisits que només comprova Hisenda; la calculadora d'impostos els detalla.",
                  en: "The VPO taxes use the reduced rate of each region's law, which has conditions only the tax office checks; the tax calculator lists them.",
                })}
              </p>

              <h2 id="preguntas">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}
              <Quote source={src(SOURCES.notaries, "anexo II, norma décima")}>{QUOTE.notaryAppeal}</Quote>
              <Quote source={src(SOURCES.registries, "anexo II, norma sexta")}>{QUOTE.registryAppeal}</Quote>
              <p className="text-sm">
                {L(locale, {
                  es: `Otros conceptos que pueden aparecer en las facturas, que no sumamos: nota simple del Registro (${X(EXTRAS.notaSimple)} por finca, número 4.1.f) y nota de afección fiscal (${X(EXTRAS.affectionNote)}, número 3.3). Si el vendedor cancela su hipoteca, es otra escritura: ${X(EXTRAS.cancellationNotary)} de notaría (número 1.1.f) y, en el Registro, la escala sobre el capital pendiente reducido un ${P(EXTRAS.cancellationRegistryBaseCut)} (número 2.1.g).`,
                  ca: `Altres conceptes que poden aparèixer a les factures, que no sumem: nota simple del Registre (${X(EXTRAS.notaSimple)} per finca, número 4.1.f) i nota d'afecció fiscal (${X(EXTRAS.affectionNote)}, número 3.3). Si el venedor cancel·la la seva hipoteca, és una altra escriptura: ${X(EXTRAS.cancellationNotary)} de notaria (número 1.1.f) i, al Registre, l'escala sobre el capital pendent reduït un ${P(EXTRAS.cancellationRegistryBaseCut)} (número 2.1.g).`,
                  en: `Other items that may appear on the invoices, not added here: a Registry extract (nota simple, ${X(EXTRAS.notaSimple)} per property, item 4.1.f) and a tax charge note (${X(EXTRAS.affectionNote)}, item 3.3). If the seller cancels their mortgage, that is another deed: ${X(EXTRAS.cancellationNotary)} at the notary (item 1.1.f) and, at the Registry, the scale on the outstanding capital reduced by ${P(EXTRAS.cancellationRegistryBaseCut)} (item 2.1.g).`,
                })}
              </p>
              <Quote source={src(SOURCES.registries, "anexo I, números 3.3 y 4.1.f")}>{`${QUOTE.registryAffection} […] ${QUOTE.registryNotaSimple}`}</Quote>
              <Quote source={src(SOURCES.notaries, "anexo I, número 1.1.f")}>{QUOTE.notaryCancellation}</Quote>
              <Quote source={src(SOURCES.registries, "anexo I, número 2.1.g")}>{QUOTE.registryCancellation}</Quote>

              <h2 id="fuentes">{hd.sources}</h2>
              <ul className="text-sm">
                {Object.values(SOURCES).map((s) => (
                  <li key={s.id}>
                    <A href={s.url}>{s.name}</A> ({s.id}
                    {s.consolidated ? L(locale, { es: `, texto consolidado al ${day(s.consolidated)}`, ca: `, text consolidat a ${day(s.consolidated)}`, en: `, consolidated text of ${day(s.consolidated)}` }) : ""}
                    {L(locale, { es: `; leído el ${day(s.read)}`, ca: `; llegit el ${day(s.read)}`, en: `; read on ${day(s.read)}` })})
                  </li>
                ))}
              </ul>

              <h2 id="limites">{hd.limits}</h2>
              <ul>
                {limits.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <MoreCalculators current="home-purchase-costs" locale={locale} />
            </div>
            <ShareBar locale={locale} path={pcPath(locale)} title={meta.h1} contentType="home-purchase-costs" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}

/** Two amounts added at the cent. */
function cents2(n: number): number {
  return Math.round(n * 100) / 100;
}
