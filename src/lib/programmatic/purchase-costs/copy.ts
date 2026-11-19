import { calcPath } from "@/lib/programmatic/calculators/paths";
import { EXAMPLE as TAX_EXAMPLE, bareDay, euros, htPath, pct, wholeEuros, writeHash as writeTaxHash, type HtLocale } from "@/lib/programmatic/home-purchase-tax/copy";
import type { HomeType } from "@/lib/programmatic/home-purchase-tax/types";
import { num } from "@/lib/programmatic/rent-update/copy";

import { FOLIOS_MAX, OWNERS, SIMPLE_COPIES_MAX, taxInput, type Owners, type PcInput, type PcInvalid } from "./engine";
import { NOTARY_FREE_ABOVE } from "./rules";

/**
 * Paths and words of the home-buying costs calculator, small enough for the
 * browser (the calculator imports this file):
 *
 *   /es/calculadoras/gastos-compraventa-vivienda/
 *   /ca/calculadores/despeses-compravenda-habitatge/
 *   /en/calculators/spain-home-buying-costs/
 *
 * The tax profile's labels (age, habitual home, large family…) are the
 * home-purchase tax calculator's own (its CALC_COPY), not typed again.
 */

export type PcLocale = HtLocale;
export const PC_LOCALES: readonly PcLocale[] = ["es", "ca", "en"];

export function pcPath(locale: PcLocale): string {
  return calcPath("home-purchase-costs", locale);
}

export function pcEditions(): Record<PcLocale, string> {
  return { es: pcPath("es"), ca: pcPath("ca"), en: pcPath("en") };
}

export { bareDay, euros, pct, wholeEuros };

/** "3,005061 €" / "€3.005061": an amount as the BOE prints it, up to six decimals, at least two. */
export function lawEuros(n: number, locale: PcLocale): string {
  const decimals = Math.max(2, (n.toFixed(6).replace(/0+$/, "").split(".")[1] ?? "").length);
  return locale === "en" ? `€${num(n, decimals, locale)}` : `${num(n, decimals, locale)} €`;
}

/** The page's default example (server-rendered; the tests pin its result): the tax calculator's example plus a 20-folio deed. */
export const EXAMPLE: PcInput = {
  ...TAX_EXAMPLE,
  smallHome: false,
  onlyHome: false,
  folios: 20,
  simpleCopies: 1,
  owners: 1,
  buyerPaysDeed: false,
  mortgage: false,
};

/** The same home in the tax calculator, with its hash: "see the tax in detail". */
export function taxDetailHref(input: PcInput, locale: PcLocale): string {
  return `${htPath(locale)}${writeTaxHash(taxInput(input))}`;
}

/* -------------------------------------------------------------------------- */
/* URL hash: a result can be shared                                           */
/* -------------------------------------------------------------------------- */

export function writeHash(s: PcInput): string {
  const p = new URLSearchParams();
  p.set("c", s.community);
  p.set("p", String(s.price));
  p.set("t", s.type === "new" ? "n" : "u");
  p.set("e", String(s.age));
  if (s.largeFamily) p.set("fn", "1");
  if (s.disability) p.set("d", String(s.disability));
  p.set("h", s.habitual ? "1" : "0");
  if (s.firstHome) p.set("pv", "1");
  if (s.protected) p.set("vpo", "1");
  if (s.smallHome) p.set("s90", "1");
  if (s.onlyHome) p.set("u", "1");
  p.set("f", String(s.folios));
  p.set("cs", String(s.simpleCopies));
  if (s.owners !== 1) p.set("w", String(s.owners));
  if (s.buyerPaysDeed) p.set("bd", "1");
  if (s.mortgage) p.set("m", "1");
  return `#${p.toString()}`;
}

export function readHash(hash: string, base: PcInput, ids: readonly string[]): PcInput {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  if (![...p.keys()].length) return base;
  const out: PcInput = { ...base };
  const c = p.get("c");
  if (c && ids.includes(c)) out.community = c;
  const price = Number(p.get("p"));
  if (p.has("p") && Number.isFinite(price) && price > 0 && price <= NOTARY_FREE_ABOVE) out.price = price;
  if (p.get("t") === "n" || p.get("t") === "u") out.type = (p.get("t") === "n" ? "new" : "second-hand") as HomeType;
  const age = Number(p.get("e"));
  if (p.has("e") && Number.isInteger(age) && age >= 18 && age <= 120) out.age = age;
  out.largeFamily = p.get("fn") === "1";
  const d = Number(p.get("d"));
  out.disability = d === 33 || d === 65 ? d : 0;
  if (p.has("h")) out.habitual = p.get("h") === "1";
  out.firstHome = p.get("pv") === "1";
  out.protected = p.get("vpo") === "1";
  out.smallHome = p.get("s90") === "1";
  out.onlyHome = p.get("u") === "1";
  const f = Number(p.get("f"));
  if (p.has("f") && Number.isInteger(f) && f >= 1 && f <= FOLIOS_MAX) out.folios = f;
  const cs = Number(p.get("cs"));
  if (p.has("cs") && Number.isInteger(cs) && cs >= 0 && cs <= SIMPLE_COPIES_MAX) out.simpleCopies = cs;
  const w = Number(p.get("w"));
  out.owners = (OWNERS as readonly number[]).includes(w) ? (w as Owners) : 1;
  out.buyerPaysDeed = p.get("bd") === "1";
  out.mortgage = p.get("m") === "1";
  return out;
}

/* -------------------------------------------------------------------------- */
/* Calculator words                                                           */
/* -------------------------------------------------------------------------- */

export interface PcCalcCopy {
  title: string;
  intro: string;
  noscript: string;
  folios: string;
  foliosHint: string;
  simpleCopies: string;
  simpleCopiesHint: string;
  owners: string;
  ownersHint: string;
  ownersOption: (n: Owners) => string;
  deedPayer: string;
  deedPayerOptions: { law: string; buyer: string };
  mortgage: string;
  vpoSmall: string;
  vpoOnly: string;
  vpoHint: string;
  profileSummary: string;
  results: (price: string, place: string) => string;
  notary: string;
  deed: string;
  deedSteps: (scale: string, cut: string | null, rebate: string, folios: string) => string;
  firstCopy: string;
  firstCopyNote: (folios: number, cut: boolean) => string;
  simpleCopiesLine: (n: number) => string;
  notaryFixed: string;
  registry: string;
  presentation: string;
  registration: string;
  registrationSteps: (scale: string, shares: string | null, cut: string | null, rebate: string, sale: string) => string;
  registryFixed: string;
  payerBuyer: string;
  payerSeller: string;
  vat: (rate: string) => string;
  vatNone: string;
  taxes: string;
  taxDetail: string;
  taxInvalid: string;
  taxUnverified: string;
  buyerTotal: string;
  buyerTotalNone: string;
  sellerPays: (amount: string) => string;
  sellerNone: string;
  fixedNote: string;
  foliosNote: string;
  mortgageTitle: string;
  mortgageItems: readonly string[];
  notIncluded: string;
  notIncludedItems: readonly string[];
  invoice: string;
  invalid: Record<PcInvalid, string>;
  example: string;
  loading: string;
  loadError: string;
}

const freeAbove = (l: PcLocale) => euros(NOTARY_FREE_ABOVE, l);

export const CALC_COPY: Record<PcLocale, PcCalcCopy> = {
  es: {
    title: "Calcula los gastos de tu compra",
    intro: "Notaría y Registro de la Propiedad con sus aranceles oficiales, el IVA de sus facturas y los impuestos de la compra en tu comunidad, con quién paga cada cosa.",
    noscript: "Sin JavaScript ves el ejemplo: una vivienda de segunda mano de 250.000 € en Cataluña con una escritura de 20 folios. Las tablas de esta página dan las escalas para hacer el cálculo a mano.",
    folios: "Folios de la escritura (estimación)",
    foliosHint: "Ponemos 20 como punto de partida del ejemplo, no como media: ninguna fuente oficial publica cuántos folios tiene una escritura, y depende de las cargas, los anexos y los certificados que se incorporan. Pide la cifra a la notaría con el borrador. Contamos cada folio escrito por las dos caras y cada copia tan larga como la matriz.",
    simpleCopies: "Copias simples que pides",
    simpleCopiesHint: "Una copia simple no tiene valor de título, pero sirve para trámites. La copia autorizada que se inscribe en el Registro ya está incluida.",
    owners: "Quién compra",
    ownersHint: "En proindiviso, el Registro aplica su escala a la parte de cada comprador (norma general segunda), y eso cuesta más que una sola base. Un matrimonio en gananciales o en otra comunidad matrimonial tributa como una sola base.",
    ownersOption: (n) => (n === 1 ? "Una persona, o un matrimonio en gananciales" : `${n} personas en proindiviso, a partes iguales`),
    deedPayer: "¿Quién paga la escritura matriz?",
    deedPayerOptions: { law: "El vendedor, como dice el Código Civil (art. 1455) si no pactáis otra cosa", buyer: "Yo: lo hemos pactado en el contrato" },
    mortgage: "Voy a firmar una hipoteca para comprarla",
    vpoSmall: "Tiene 90 m² útiles o menos",
    vpoOnly: "Será mi única vivienda y mi residencia habitual y permanente",
    vpoHint: "Para una vivienda protegida que compras al promotor, la Ley 41/1980 (art. 8.2) reduce notaría y Registro a la mitad, y a un importe fijo si no pasa de 90 m² útiles, solo si es tu única vivienda y tu residencia habitual y permanente.",
    profileSummary: "Tu situación, para los tipos reducidos del impuesto",
    results: (price, place) => `Gastos de una compra de ${price} en ${place}`,
    notary: "Notaría (arancel del Real Decreto 1426/1989)",
    deed: "Escritura matriz",
    deedSteps: (scale, cut, rebate, folios) => `Escala del número 2.1: ${scale}${cut ? `; ${cut}` : ""}; rebaja del 5 %: −${rebate}; folios de matriz desde el quinto (número 7): ${folios}.`,
    firstCopy: "Copia autorizada (para el Registro)",
    firstCopyNote: (f, cut) => `Número 4.1: ${f} folios, la mitad desde el duodécimo${cut ? "; con la reducción del 50 % de la Ley 41/1980" : ""}.`,
    simpleCopiesLine: (n) => (n === 1 ? "1 copia simple (número 4.2)" : `${n} copias simples (número 4.2)`),
    notaryFixed: "Notaría, por todos los conceptos (Ley 41/1980, art. 8.2)",
    registry: "Registro de la Propiedad (arancel del Real Decreto 1427/1989)",
    presentation: "Asiento de presentación (número 1)",
    registration: "Inscripción de tu compra (número 2.1)",
    registrationSteps: (scale, shares, cut, rebate, sale) => `Escala${shares ? ` sobre ${shares}` : ""}: ${scale}${cut ? `; ${cut}` : ""}; rebaja del 5 % del arancel: −${rebate}; 5 % por compraventa de vivienda (Real Decreto-ley 6/2000, art. 36): −${sale}.`,
    registryFixed: "Registro, por todos los conceptos (Ley 41/1980, art. 8.2)",
    payerBuyer: "Pagas tú",
    payerSeller: "Paga el vendedor (art. 1455 del Código Civil, salvo pacto)",
    vat: (rate) => `IVA del ${rate} de tus facturas de notaría y Registro`,
    vatNone: "En Canarias, Ceuta y Melilla las facturas no llevan IVA sino IGIC o IPSI: no lo calculamos ni lo sumamos.",
    taxes: "Impuestos de la compra (los pagas tú siempre)",
    taxDetail: "Ver el impuesto con su artículo y sus requisitos",
    taxInvalid: "Escribe una edad entre 18 y 120 años para calcular el impuesto.",
    taxUnverified: "No verificado en la ley de esta comunidad",
    buyerTotal: "Total que pagas tú",
    buyerTotalNone: "Total que pagas tú: no se puede sumar (falta un dato verificado)",
    sellerPays: (a) => `Si no pactáis otra cosa, el vendedor paga la escritura matriz: ${a} con IVA.`,
    sellerNone: "Has pactado pagar tú también la escritura matriz: está en tu total.",
    fixedNote: "Importe fijo de la Ley 41/1980 (en euros desde la Instrucción de la DGRN de 22 de mayo de 2002). La ley no lo separa en matriz y copia: lo contamos entero en tu total. Con plaza de garaje o trastero vinculados puede subir algo; lo explica la tabla de la página.",
    foliosNote: "Los folios y las copias varían en cada escritura: la factura real puede ser distinta. El notario y el registrador deben detallar en su minuta cada concepto, la base y el número del arancel aplicado.",
    mortgageTitle: "Con hipoteca, la Ley 5/2019 (art. 14.1.e) reparte así sus gastos:",
    mortgageItems: [
      "Notaría de la escritura del préstamo: el banco. Las copias, quien las pida.",
      "Inscripción de la hipoteca en el Registro: el banco.",
      "Gestoría: el banco.",
      "AJD de la escritura del préstamo: el banco (texto refundido, art. 29, Real Decreto-ley 17/2018).",
      "Tasación de la vivienda: tú. No tiene arancel oficial: pide presupuesto.",
    ],
    notIncluded: "No incluido (no tiene tarifa oficial o depende de tu escritura):",
    notIncludedItems: [
      "Gestoría de la compraventa: precio libre, no lo estimamos.",
      "Nota simple, notas de afección fiscal, testimonios, desplazamientos del notario y gastos suplidos (envíos, certificados).",
      "La cancelación de la hipoteca del vendedor, si la tiene: es otra escritura.",
      "El descuento de hasta el 10 % que el notario puede aplicar (Real Decreto-ley 6/2000, art. 35): es voluntario.",
    ],
    invoice: "Estimación con las escalas oficiales del BOE, no un presupuesto. Pide a la notaría y al Registro su minuta; puedes impugnarla en 15 días hábiles.",
    invalid: {
      price: "Escribe un precio mayor que 0.",
      "above-free": `Por encima de ${freeAbove("es")} el notario cobra el exceso lo que acuerde con las partes: no lo podemos calcular.`,
      folios: `Escribe un número de folios entre 1 y ${FOLIOS_MAX}.`,
      copies: `Escribe entre 0 y ${SIMPLE_COPIES_MAX} copias simples.`,
      owners: "Elige quién compra.",
      community: "Elige una comunidad.",
    },
    example: "Ejemplo: vivienda de segunda mano de 250.000 € en Cataluña, escritura de 20 folios, una copia simple. Cambia los datos para tu caso.",
    loading: "Cargando los impuestos de todas las comunidades…",
    loadError: "No se han podido cargar los impuestos de las comunidades. Comprueba la conexión y vuelve a cambiar un dato.",
  },
  ca: {
    title: "Calcula les despeses de la teva compra",
    intro: "Notaria i Registre de la Propietat amb els seus aranzels oficials, l'IVA de les seves factures i els impostos de la compra a la teva comunitat, amb qui paga cada cosa.",
    noscript: "Sense JavaScript veus l'exemple: un habitatge de segona mà de 250.000 € a Catalunya amb una escriptura de 20 folis. Les taules d'aquesta pàgina donen les escales per fer el càlcul a mà.",
    folios: "Folis de l'escriptura (estimació)",
    foliosHint: "Posem 20 com a punt de partida de l'exemple, no com a mitjana: cap font oficial publica quants folis té una escriptura, i depèn de les càrregues, els annexos i els certificats que s'hi incorporen. Demana la xifra a la notaria amb l'esborrany. Comptem cada foli escrit per les dues cares i cada còpia tan llarga com la matriu.",
    simpleCopies: "Còpies simples que demanes",
    simpleCopiesHint: "Una còpia simple no té valor de títol, però serveix per a tràmits. La còpia autoritzada que s'inscriu al Registre ja hi és inclosa.",
    owners: "Qui compra",
    ownersHint: "En proindivís, el Registre aplica la seva escala a la part de cada comprador (norma general segona), i això costa més que una sola base. Un matrimoni en societat de guanys o en una altra comunitat matrimonial compta com una sola base.",
    ownersOption: (n) => (n === 1 ? "Una persona, o un matrimoni en societat de guanys" : `${n} persones en proindivís, a parts iguals`),
    deedPayer: "Qui paga l'escriptura matriu?",
    deedPayerOptions: { law: "El venedor, com diu el Codi civil espanyol (art. 1455) si no pacteu una altra cosa", buyer: "Jo: ho hem pactat al contracte" },
    mortgage: "Signaré una hipoteca per comprar-lo",
    vpoSmall: "Té 90 m² útils o menys",
    vpoOnly: "Serà el meu únic habitatge i la meva residència habitual i permanent",
    vpoHint: "Per a un habitatge protegit que compres al promotor, la Llei 41/1980 (art. 8.2) redueix notaria i Registre a la meitat, i a un import fix si no passa de 90 m² útils, només si és el teu únic habitatge i la teva residència habitual i permanent.",
    profileSummary: "La teva situació, per als tipus reduïts de l'impost",
    results: (price, place) => `Despeses d'una compra de ${price} a ${place}`,
    notary: "Notaria (aranzel del Reial decret 1426/1989)",
    deed: "Escriptura matriu",
    deedSteps: (scale, cut, rebate, folios) => `Escala del número 2.1: ${scale}${cut ? `; ${cut}` : ""}; rebaixa del 5 %: −${rebate}; folis de matriu des del cinquè (número 7): ${folios}.`,
    firstCopy: "Còpia autoritzada (per al Registre)",
    firstCopyNote: (f, cut) => `Número 4.1: ${f} folis, la meitat des del dotzè${cut ? "; amb la reducció del 50 % de la Llei 41/1980" : ""}.`,
    simpleCopiesLine: (n) => (n === 1 ? "1 còpia simple (número 4.2)" : `${n} còpies simples (número 4.2)`),
    notaryFixed: "Notaria, per tots els conceptes (Llei 41/1980, art. 8.2)",
    registry: "Registre de la Propietat (aranzel del Reial decret 1427/1989)",
    presentation: "Assentament de presentació (número 1)",
    registration: "Inscripció de la teva compra (número 2.1)",
    registrationSteps: (scale, shares, cut, rebate, sale) => `Escala${shares ? ` sobre ${shares}` : ""}: ${scale}${cut ? `; ${cut}` : ""}; rebaixa del 5 % de l'aranzel: −${rebate}; 5 % per compravenda d'habitatge (Reial decret llei 6/2000, art. 36): −${sale}.`,
    registryFixed: "Registre, per tots els conceptes (Llei 41/1980, art. 8.2)",
    payerBuyer: "Pagues tu",
    payerSeller: "Paga el venedor (art. 1455 del Codi civil, llevat de pacte)",
    vat: (rate) => `IVA del ${rate} de les teves factures de notaria i Registre`,
    vatNone: "A Canàries, Ceuta i Melilla les factures no porten IVA sinó IGIC o IPSI: no el calculem ni el sumem.",
    taxes: "Impostos de la compra (els pagues tu sempre)",
    taxDetail: "Veure l'impost amb el seu article i els seus requisits",
    taxInvalid: "Escriu una edat entre 18 i 120 anys per calcular l'impost.",
    taxUnverified: "No verificat a la llei d'aquesta comunitat",
    buyerTotal: "Total que pagues tu",
    buyerTotalNone: "Total que pagues tu: no es pot sumar (falta una dada verificada)",
    sellerPays: (a) => `Si no pacteu una altra cosa, el venedor paga l'escriptura matriu: ${a} amb IVA.`,
    sellerNone: "Has pactat pagar tu també l'escriptura matriu: és al teu total.",
    fixedNote: "Import fix de la Llei 41/1980 (en euros des de la Instrucció de la DGRN de 22 de maig de 2002). La llei no el separa en matriu i còpia: el comptem sencer al teu total. Amb plaça d'aparcament o traster vinculats pot pujar una mica; ho explica la taula de la pàgina.",
    foliosNote: "Els folis i les còpies varien a cada escriptura: la factura real pot ser diferent. El notari i el registrador han de detallar a la minuta cada concepte, la base i el número de l'aranzel aplicat.",
    mortgageTitle: "Amb hipoteca, la Llei 5/2019 (art. 14.1.e) en reparteix així les despeses:",
    mortgageItems: [
      "Notaria de l'escriptura del préstec: el banc. Les còpies, qui les demani.",
      "Inscripció de la hipoteca al Registre: el banc.",
      "Gestoria: el banc.",
      "AJD de l'escriptura del préstec: el banc (text refós, art. 29, Reial decret llei 17/2018).",
      "Taxació de l'habitatge: tu. No té aranzel oficial: demana pressupost.",
    ],
    notIncluded: "No inclòs (no té tarifa oficial o depèn de la teva escriptura):",
    notIncludedItems: [
      "Gestoria de la compravenda: preu lliure, no l'estimem.",
      "Nota simple, notes d'afecció fiscal, testimonis, desplaçaments del notari i bestretes (enviaments, certificats).",
      "La cancel·lació de la hipoteca del venedor, si en té: és una altra escriptura.",
      "El descompte de fins al 10 % que el notari pot aplicar (Reial decret llei 6/2000, art. 35): és voluntari.",
    ],
    invoice: "Estimació amb les escales oficials del BOE, no un pressupost. Demana a la notaria i al Registre la seva minuta; la pots impugnar en 15 dies hàbils.",
    invalid: {
      price: "Escriu un preu més gran que 0.",
      "above-free": `Per sobre de ${freeAbove("ca")} el notari cobra l'excés el que acordi amb les parts: no el podem calcular.`,
      folios: `Escriu un nombre de folis entre 1 i ${FOLIOS_MAX}.`,
      copies: `Escriu entre 0 i ${SIMPLE_COPIES_MAX} còpies simples.`,
      owners: "Tria qui compra.",
      community: "Tria una comunitat.",
    },
    example: "Exemple: habitatge de segona mà de 250.000 € a Catalunya, escriptura de 20 folis, una còpia simple. Canvia les dades per al teu cas.",
    loading: "Carregant els impostos de totes les comunitats…",
    loadError: "No s'han pogut carregar els impostos de les comunitats. Comprova la connexió i torna a canviar una dada.",
  },
  en: {
    title: "Work out the costs of your purchase",
    intro: "Notary and Land Registry fees on their official scales, the VAT on their invoices and the purchase taxes in your region, with who pays each one.",
    noscript: "Without JavaScript you see the example: a €250,000 second-hand home in Catalonia with a 20-folio deed. The tables on this page give the scales to work it out by hand.",
    folios: "Folios in the deed (estimate)",
    foliosHint: "20 is only the example's starting point, not an average: no official source publishes how many folios a deed has, and it depends on the charges, annexes and certificates attached. Ask the notary's office once there is a draft. Each folio is counted as written on both sides and each copy as long as the original.",
    simpleCopies: "Simple copies you ask for",
    simpleCopiesHint: "A simple copy is not a title deed but is useful for paperwork. The authorised copy that goes to the Land Registry is already included.",
    owners: "Who is buying",
    ownersHint: "When several people buy in shares (pro indiviso), the Registry applies its scale to each buyer's share (general rule two), which costs more than a single base. A married couple under community property counts as one base.",
    ownersOption: (n) => (n === 1 ? "One person, or a married couple under community property" : `${n} people in equal shares (pro indiviso)`),
    deedPayer: "Who pays for the deed itself (the matrix)?",
    deedPayerOptions: { law: "The seller, as the Civil Code says (art. 1455) unless you agree otherwise", buyer: "Me: we agreed it in the contract" },
    mortgage: "I will sign a mortgage to buy it",
    vpoSmall: "Useful floor area of 90 m² or less",
    vpoOnly: "It will be my only home and my permanent main residence",
    vpoHint: "For a protected home bought from the developer, Ley 41/1980 (art. 8.2) halves the notary and Registry fees, and fixes them if it has no more than 90 m² of useful floor area, only if it is your only home and permanent main residence.",
    profileSummary: "About you, for the tax's reduced rates",
    results: (price, place) => `Costs of a ${price} purchase in ${place}`,
    notary: "Notary (scale of Royal Decree 1426/1989)",
    deed: "The deed (matrix)",
    deedSteps: (scale, cut, rebate, folios) => `Item 2.1 scale: ${scale}${cut ? `; ${cut}` : ""}; 5% rebate: −${rebate}; matrix folios from the fifth (item 7): ${folios}.`,
    firstCopy: "Authorised copy (for the Land Registry)",
    firstCopyNote: (f, cut) => `Item 4.1: ${f} folios, half price from the twelfth${cut ? "; with Ley 41/1980's 50% reduction" : ""}.`,
    simpleCopiesLine: (n) => (n === 1 ? "1 simple copy (item 4.2)" : `${n} simple copies (item 4.2)`),
    notaryFixed: "Notary, all items (Ley 41/1980, art. 8.2)",
    registry: "Land Registry (scale of Royal Decree 1427/1989)",
    presentation: "Presentation entry (item 1)",
    registration: "Registration of your purchase (item 2.1)",
    registrationSteps: (scale, shares, cut, rebate, sale) => `Scale${shares ? ` on ${shares}` : ""}: ${scale}${cut ? `; ${cut}` : ""}; 5% scale rebate: −${rebate}; 5% for a home sale (Royal Decree-law 6/2000, art. 36): −${sale}.`,
    registryFixed: "Land Registry, all items (Ley 41/1980, art. 8.2)",
    payerBuyer: "You pay",
    payerSeller: "The seller pays (Civil Code art. 1455, unless agreed)",
    vat: (rate) => `${rate} IVA (VAT) on your notary and Registry invoices`,
    vatNone: "In the Canary Islands, Ceuta and Melilla the invoices carry IGIC or IPSI, not IVA: not worked out or added here.",
    taxes: "Purchase taxes (always yours)",
    taxDetail: "See the tax with its article and conditions",
    taxInvalid: "Enter an age between 18 and 120 to work out the tax.",
    taxUnverified: "Not verified in this region's law",
    buyerTotal: "Total you pay",
    buyerTotalNone: "Total you pay: cannot be added up (a verified figure is missing)",
    sellerPays: (a) => `Unless you agree otherwise, the seller pays for the deed: ${a} with VAT.`,
    sellerNone: "You agreed to pay for the deed too: it is in your total.",
    fixedNote: "Fixed amount of Ley 41/1980 (in euros since the DGRN Instruction of 22 May 2002). The law does not split it into deed and copy: we count all of it in your total. With a linked parking space or storeroom it may rise a little; the page's table explains it.",
    foliosNote: "Folios and copies vary with each deed: the real invoice may differ. The notary and the registrar must itemise each concept, the base and the scale item applied on their invoice (minuta).",
    mortgageTitle: "With a mortgage, Ley 5/2019 (art. 14.1.e) splits its costs like this:",
    mortgageItems: [
      "Notary for the loan deed: the bank. Copies: whoever asks for them.",
      "Registering the mortgage: the bank.",
      "Gestoría (paperwork agency): the bank.",
      "AJD stamp duty on the loan deed: the bank (consolidated act art. 29, Royal Decree-law 17/2018).",
      "Valuation of the home: you. It has no official scale: ask for a quote.",
    ],
    notIncluded: "Not included (no official scale, or it depends on your deed):",
    notIncludedItems: [
      "A gestoría for the purchase: free price, not estimated.",
      "Land Registry extract (nota simple), tax charge notes, certified copies of attached documents, the notary's travel and outlays (postage, certificates).",
      "Cancelling the seller's mortgage, if any: that is another deed.",
      "The discount of up to 10% a notary may apply (Royal Decree-law 6/2000, art. 35): it is optional.",
    ],
    invoice: "An estimate on the BOE's official scales, not a quote. Ask the notary and the Registry for their invoice (minuta); you can challenge it within 15 working days.",
    invalid: {
      price: "Enter a price above 0.",
      "above-free": `Above ${freeAbove("en")} the notary's fee on the excess is agreed freely: we cannot work it out.`,
      folios: `Enter between 1 and ${FOLIOS_MAX} folios.`,
      copies: `Enter between 0 and ${SIMPLE_COPIES_MAX} simple copies.`,
      owners: "Choose who is buying.",
      community: "Pick a region.",
    },
    example: "Example: a €250,000 second-hand home in Catalonia, a 20-folio deed, one simple copy. Change the figures to your case.",
    loading: "Loading every region's taxes…",
    loadError: "The regions' taxes could not be loaded. Check your connection and change any field to try again.",
  },
};
