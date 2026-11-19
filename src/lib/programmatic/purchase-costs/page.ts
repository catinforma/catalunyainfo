import type { MetadataRoute } from "next";

import { COMMUNITIES } from "@/lib/programmatic/home-purchase-tax/communities";
import { cents } from "@/lib/programmatic/home-purchase-tax/engine";
import { absoluteUrl } from "@/lib/site";

import { EXAMPLE, PC_LOCALES, euros, pcEditions, type PcLocale } from "./copy";
import { calculate, scaleFee, type PcInput, type PcResult } from "./engine";
import { ARANCEL_REBATE, NOTARY_SCALE, REGISTRY_HOME_SALE_CUT, REGISTRY_SCALE, RULES_AS_OF } from "./rules";

/** Title, description, H1 and breadcrumb. Pure: the tests check their length. */
export function pcMeta(locale: PcLocale): { title: string; description: string; h1: string; breadcrumb: string; appName: string } {
  return {
    es: {
      title: "Gastos de compraventa de vivienda 2026: notaría y Registro",
      description: "Calcula la notaría y el Registro al comprar una vivienda con los aranceles oficiales del BOE, su IVA, los impuestos de tu comunidad y quién paga cada gasto.",
      h1: "Gastos de compraventa de una vivienda: notaría, Registro e impuestos",
      breadcrumb: "Gastos de compraventa de vivienda",
      appName: "Calculadora de gastos de compraventa de vivienda",
    },
    ca: {
      title: "Despeses de compravenda d'habitatge 2026: notaria i Registre",
      description: "Calcula la notaria i el Registre en comprar un habitatge amb els aranzels oficials del BOE, el seu IVA, els impostos de la teva comunitat i qui paga cada despesa.",
      h1: "Despeses de compravenda d'un habitatge: notaria, Registre i impostos",
      breadcrumb: "Despeses de compravenda d'habitatge",
      appName: "Calculadora de despeses de compravenda d'habitatge",
    },
    en: {
      title: "Spain home buying costs 2026: notary and Land Registry fees",
      description: "Work out notary and Land Registry fees on buying a home in Spain from the official BOE scales, with VAT, your region's purchase taxes and who pays each.",
      h1: "Costs of buying a home in Spain: notary, Land Registry and taxes",
      breadcrumb: "Home buying costs",
      appName: "Spain home buying costs calculator",
    },
  }[locale];
}

/** The three editions with reciprocal hreflang; x-default English like every page's HTML. */
export function pcSitemapEntries(): MetadataRoute.Sitemap {
  const e = pcEditions();
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return PC_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${RULES_AS_OF}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

/** The server-rendered fee table: each price, both scales before and after their rebajas (no folios, copies, presentation or IVA). */
export const TABLE_PRICES = [60_000, 100_000, 150_000, 200_000, 250_000, 300_000, 400_000, 500_000, 750_000, 1_000_000] as const;

export interface FeeRow {
  price: number;
  notaryScale: number;
  notaryDeed: number;
  registryScale: number;
  registration: number;
}

export function feeTable(): FeeRow[] {
  return TABLE_PRICES.map((price) => {
    const n = scaleFee(NOTARY_SCALE, price);
    const r = scaleFee(REGISTRY_SCALE, price);
    return {
      price,
      notaryScale: cents(n),
      notaryDeed: cents(n * (1 - ARANCEL_REBATE / 100)),
      registryScale: cents(r),
      registration: cents(r * (1 - ARANCEL_REBATE / 100) * (1 - REGISTRY_HOME_SALE_CUT / 100)),
    };
  });
}

export type ExampleId = "resale" | "new" | "couple" | "vpo-resale" | "vpo-small";

/** Worked examples, each one engine run (the tests pin them). */
export const EXAMPLES: readonly { id: ExampleId; input: PcInput }[] = [
  { id: "resale", input: EXAMPLE },
  { id: "new", input: { ...EXAMPLE, community: "madrid", price: 200_000, type: "new" } },
  { id: "couple", input: { ...EXAMPLE, price: 300_000, owners: 2 } },
  { id: "vpo-resale", input: { ...EXAMPLE, price: 150_000, protected: true } },
  { id: "vpo-small", input: { ...EXAMPLE, community: "andalucia", price: 120_000, type: "new", protected: true, smallHome: true, onlyHome: true } },
];

export function exampleResults(): { id: ExampleId; input: PcInput; result: Extract<PcResult, { status: "ok" }> }[] {
  return EXAMPLES.map(({ id, input }) => {
    const result = calculate(input, COMMUNITIES);
    if (result.status !== "ok") throw new Error(`example ${id}: ${result.reason}`);
    return { id, input, result };
  });
}

/** The answer-first lead's figures: the default example. */
export function headline(): Extract<PcResult, { status: "ok" }> {
  const r = calculate(EXAMPLE, COMMUNITIES);
  if (r.status !== "ok") throw new Error(`headline: ${r.reason}`);
  return r;
}

export interface Faq {
  q: string;
  a: string;
}

/** The questions, answered from the same figures as the calculator. */
export function pcFaq(locale: PcLocale): Faq[] {
  const h = headline();
  const n = h.fees.notary;
  const r = h.fees.registry;
  const E = (x: number) => euros(x, locale);
  const couple = exampleResults().find((x) => x.id === "couple")!.result.fees.registry;
  const single300 = calculate({ ...EXAMPLE, price: 300_000 }, COMMUNITIES);
  const single = single300.status === "ok" ? single300.fees.registry : null;
  return {
    es: [
      { q: "¿Cuánto cuesta la notaría al comprar un piso?", a: `Lo fija el arancel notarial (Real Decreto 1426/1989): una escala por tramos del precio, con una rebaja obligatoria del 5 %, más los folios de la matriz desde el quinto y las copias por folio. Para una vivienda de 250.000 € la escala da ${E(n.scale)}, ${E(n.deedScale)} tras la rebaja; con una escritura de 20 folios, una copia autorizada y una simple, la notaría suma ${E(n.total)} más el 21 % de IVA. Los folios cambian en cada escritura.` },
      { q: "¿Quién paga la notaría, el comprador o el vendedor?", a: "El Código Civil (art. 1455) pone la escritura matriz a cargo del vendedor y la primera copia y lo posterior a cargo del comprador, salvo que pactéis otra cosa en el contrato. Los impuestos de la compra los paga siempre el comprador, diga lo que diga el contrato (texto refundido del ITP, art. 8)." },
      { q: "¿Cuánto cuesta inscribir la compra en el Registro de la Propiedad?", a: `El arancel registral (Real Decreto 1427/1989) aplica otra escala por tramos, nunca por debajo de 24,04 € ni por encima de 2.181,67 €, con una rebaja del 5 % y otro 5 % por ser compraventa de vivienda (Real Decreto-ley 6/2000, art. 36). Para 250.000 €: ${E(r.scale)} de escala, ${E(r.registration)} tras las dos rebajas, más ${E(r.presentation)} del asiento de presentación y el IVA. Lo paga quien inscribe a su favor: el comprador.` },
      { q: "Si pido una hipoteca, ¿quién paga su notaría y su Registro?", a: "El banco. La Ley 5/2019 (art. 14.1.e) pone a su cargo la notaría de la escritura del préstamo, la inscripción de la hipoteca y la gestoría; las copias, quien las pida, y la tasación, tú. El AJD de la escritura del préstamo también lo paga el banco desde noviembre de 2018 (art. 29 del texto refundido)." },
      { q: "¿Cuánto cobra la gestoría?", a: "No tiene arancel oficial: cada gestoría fija su precio, así que no lo estimamos. Si hay hipoteca, la gestoría de la hipoteca la paga el banco (Ley 5/2019, art. 14.1.e). Pide presupuesto por escrito antes de encargarla." },
      { q: "¿Hay rebajas de notaría y Registro por primera vivienda o por VPO?", a: "En los dos aranceles no hay rebaja por ser tu primera vivienda si es libre. Para viviendas protegidas sí: la segunda y posteriores ventas de una VPO tienen un 50 % menos en notaría (número 2.2.e) y Registro (número 2.4.b); la primera venta del promotor, un 50 % menos en matriz, primera copia e inscripción, y si no pasa de 90 m² útiles, 60,05 € de notaría y 24,02 € de Registro por todo, siempre que sea tu única vivienda y tu residencia habitual (Ley 41/1980, art. 8)." },
      { q: "Si compramos dos personas, ¿el Registro cuesta más?", a: `Sí, si compráis en proindiviso: el Registro aplica la escala a la parte de cada uno, con un máximo del 1 % del valor (norma general segunda). Para 300.000 € a medias la inscripción sale ${E(couple.registration)}${single ? `, frente a ${E(single.registration)} con una sola base` : ""}. Un matrimonio en gananciales tributa como una sola base; en Cataluña, sin capítulos matrimoniales, el régimen es el de separación de bienes (Código civil de Cataluña, art. 231-10), así que una pareja que compra a medias es un proindiviso.` },
      { q: "¿Puedo reclamar la factura del notario o del registrador?", a: "Sí. Tienen que darte una minuta firmada con cada concepto, la base y el número del arancel aplicado, y puedes impugnarla en 15 días hábiles desde que te la entregan, ante el propio notario o registrador o directamente ante su Colegio (normas generales décima del arancel notarial y sexta del registral)." },
    ],
    ca: [
      { q: "Quant costa la notaria en comprar un pis?", a: `Ho fixa l'aranzel notarial (Reial decret 1426/1989): una escala per trams del preu, amb una rebaixa obligatòria del 5 %, més els folis de la matriu des del cinquè i les còpies per foli. Per a un habitatge de 250.000 € l'escala dona ${E(n.scale)}, ${E(n.deedScale)} després de la rebaixa; amb una escriptura de 20 folis, una còpia autoritzada i una de simple, la notaria suma ${E(n.total)} més el 21 % d'IVA. Els folis canvien a cada escriptura.` },
      { q: "Qui paga la notaria, el comprador o el venedor?", a: "El Codi civil espanyol (art. 1455) posa l'escriptura matriu a càrrec del venedor i la primera còpia i el que ve després a càrrec del comprador, llevat que pacteu una altra cosa al contracte. Els impostos de la compra els paga sempre el comprador, digui el que digui el contracte (text refós de l'ITP, art. 8)." },
      { q: "Quant costa inscriure la compra al Registre de la Propietat?", a: `L'aranzel registral (Reial decret 1427/1989) aplica una altra escala per trams, mai per sota de 24,04 € ni per sobre de 2.181,67 €, amb una rebaixa del 5 % i un altre 5 % per ser compravenda d'habitatge (Reial decret llei 6/2000, art. 36). Per a 250.000 €: ${E(r.scale)} d'escala, ${E(r.registration)} després de les dues rebaixes, més ${E(r.presentation)} de l'assentament de presentació i l'IVA. Ho paga qui inscriu al seu favor: el comprador.` },
      { q: "Si demano una hipoteca, qui paga la seva notaria i el seu Registre?", a: "El banc. La Llei 5/2019 (art. 14.1.e) posa al seu càrrec la notaria de l'escriptura del préstec, la inscripció de la hipoteca i la gestoria; les còpies, qui les demani, i la taxació, tu. L'AJD de l'escriptura del préstec també el paga el banc des del novembre del 2018 (art. 29 del text refós)." },
      { q: "Quant cobra la gestoria?", a: "No té aranzel oficial: cada gestoria fixa el seu preu, així que no l'estimem. Si hi ha hipoteca, la gestoria de la hipoteca la paga el banc (Llei 5/2019, art. 14.1.e). Demana pressupost per escrit abans d'encarregar-la." },
      { q: "Hi ha rebaixes de notaria i Registre per primer habitatge o per HPO?", a: "Als dos aranzels no hi ha rebaixa per ser el teu primer habitatge si és lliure. Per als habitatges protegits sí: la segona i posteriors vendes d'un HPO tenen un 50 % menys a notaria (número 2.2.e) i Registre (número 2.4.b); la primera venda del promotor, un 50 % menys en matriu, primera còpia i inscripció, i si no passa de 90 m² útils, 60,05 € de notaria i 24,02 € de Registre per tot, sempre que sigui el teu únic habitatge i la teva residència habitual (Llei 41/1980, art. 8)." },
      { q: "Si comprem dues persones, el Registre costa més?", a: `Sí, si compreu en proindivís: el Registre aplica l'escala a la part de cadascú, amb un màxim de l'1 % del valor (norma general segona). Per a 300.000 € a mitges la inscripció surt ${E(couple.registration)}${single ? `, davant de ${E(single.registration)} amb una sola base` : ""}. Un matrimoni en societat de guanys compta com una sola base; a Catalunya, sense capítols matrimonials, el règim és el de separació de béns (Codi civil de Catalunya, art. 231-10), de manera que una parella que compra a mitges és un proindivís.` },
      { q: "Puc reclamar la factura del notari o del registrador?", a: "Sí. T'han de donar una minuta signada amb cada concepte, la base i el número de l'aranzel aplicat, i la pots impugnar en 15 dies hàbils des que te la lliuren, davant el mateix notari o registrador o directament davant el seu Col·legi (normes generals desena de l'aranzel notarial i sisena del registral)." },
    ],
    en: [
      { q: "How much does the notary cost when you buy a flat in Spain?", a: `The notaries' official scale (Royal Decree 1426/1989) sets it: slices of the price, less a compulsory 5% rebate, plus the matrix folios from the fifth and the copies per folio. For a €250,000 home the scale gives ${E(n.scale)}, ${E(n.deedScale)} after the rebate; with a 20-folio deed, one authorised and one simple copy, the notary comes to ${E(n.total)} plus 21% VAT. Folios differ with each deed.` },
      { q: "Who pays the notary, buyer or seller?", a: "The Civil Code (art. 1455) puts the deed itself on the seller and the first copy and what comes after on the buyer, unless the contract says otherwise. The purchase taxes are always the buyer's, whatever the contract says (ITP consolidated act, art. 8)." },
      { q: "How much does registering the purchase at the Land Registry cost?", a: `The registrars' scale (Royal Decree 1427/1989) is another set of slices, never below €24.04 or above €2,181.67, with a 5% rebate and another 5% for a home sale (Royal Decree-law 6/2000, art. 36). For €250,000: ${E(r.scale)} on the scale, ${E(r.registration)} after both rebates, plus ${E(r.presentation)} for the presentation entry and VAT. Whoever registers in their favour pays: the buyer.` },
      { q: "With a mortgage, who pays its notary and registration?", a: "The bank. Ley 5/2019 (art. 14.1.e) puts the notary for the loan deed, the mortgage's registration and the gestoría on the lender; copies on whoever asks for them, and the valuation on you. Since November 2018 the bank also pays the AJD stamp duty on the loan deed (consolidated act art. 29)." },
      { q: "How much does a gestoría charge?", a: "There is no official scale: each gestoría sets its price, so we do not estimate it. With a mortgage, the bank pays the mortgage's gestoría (Ley 5/2019, art. 14.1.e). Ask for a written quote first." },
      { q: "Are there notary or Registry discounts for a first home or protected housing (VPO)?", a: "Neither scale has a first-home discount for a free-market home. Protected housing does: a VPO's second and later sales get 50% off the notary (item 2.2.e) and the Registry (item 2.4.b); the developer's first sale, 50% off the deed, first copy and registration, and with no more than 90 m² of useful floor area a fixed €60.05 for the notary and €24.02 for the Registry, provided it is your only home and permanent residence (Ley 41/1980, art. 8)." },
      { q: "If two of us buy, does the Land Registry cost more?", a: `Yes, if you buy in shares (pro indiviso): the Registry applies the scale to each share, up to 1% of the value (general rule two). For €300,000 bought half each, registration comes to ${E(couple.registration)}${single ? `, against ${E(single.registration)} on a single base` : ""}. A married couple under community property counts as one base; in Catalonia, without a marriage contract, spouses hold property separately (Catalan Civil Code, art. 231-10), so a couple buying half each is a pro indiviso.` },
      { q: "Can I challenge the notary's or registrar's invoice?", a: "Yes. They must give you a signed invoice (minuta) with each concept, the base and the scale item applied, and you can challenge it within 15 working days of receiving it, with the notary or registrar or straight to their professional body (general rules ten of the notaries' scale and six of the registrars')." },
    ],
  }[locale];
}
