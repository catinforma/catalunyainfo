import { calcPath } from "@/lib/programmatic/calculators/paths";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { euros, num } from "@/lib/programmatic/rent-update/copy";

import type { Benefit, HomeType, HtInput, HtLocale, Rate } from "./types";

/**
 * Paths and words of the home-purchase tax calculator, small enough for the
 * browser (the calculator imports this file):
 *
 *   /es/calculadoras/impuestos-compra-vivienda/
 *   /ca/calculadores/impostos-compra-habitatge/
 *   /en/calculators/spain-home-purchase-taxes/
 */

export type { HtLocale };
export const HT_LOCALES: readonly HtLocale[] = ["es", "ca", "en"];

export function htPath(locale: HtLocale): string {
  return calcPath("home-purchase-tax", locale);
}

export function htEditions(): Record<HtLocale, string> {
  return { es: htPath("es"), ca: htPath("ca"), en: htPath("en") };
}

export { euros };

/** "250.000 €" / "€250,000": whole euros. */
export function wholeEuros(n: number, locale: HtLocale): string {
  return locale === "en" ? `€${num(n, 0, locale)}` : `${num(n, 0, locale)} €`;
}

/** "10 %" / "0,5 %" / "10%": up to two decimals, no trailing zeros. */
export function pct(n: number, locale: HtLocale): string {
  const d = Number.isInteger(n) ? 0 : Number.isInteger(n * 10) ? 1 : 2;
  return locale === "en" ? `${num(n, d, locale)}%` : `${num(n, d, locale)} %`;
}

export function bareDay(iso: string, locale: HtLocale): string {
  return dayMonthYear(iso, locale);
}

/** "10 %" or "10 % hasta 1.000.000 €; 11 % en el exceso". */
export function rateText(rate: Rate, locale: HtLocale): string {
  if (rate.kind === "flat") return pct(rate.rate, locale);
  const parts = rate.brackets.map((b, i) => {
    const prev = rate.brackets[i - 1]?.upTo ?? null;
    const p = pct(b.rate, locale);
    if (rate.how === "progressive") {
      if (b.upTo === null) return { es: `${p} en lo que exceda de ${wholeEuros(prev ?? 0, "es")}`, ca: `${p} en el que excedeixi de ${wholeEuros(prev ?? 0, "ca")}`, en: `${p} above ${wholeEuros(prev ?? 0, "en")}` }[locale];
      if (prev === null) return { es: `${p} hasta ${wholeEuros(b.upTo, "es")}`, ca: `${p} fins a ${wholeEuros(b.upTo, "ca")}`, en: `${p} up to ${wholeEuros(b.upTo, "en")}` }[locale];
      return { es: `${p} de ${wholeEuros(prev, "es")} a ${wholeEuros(b.upTo, "es")}`, ca: `${p} de ${wholeEuros(prev, "ca")} a ${wholeEuros(b.upTo, "ca")}`, en: `${p} from ${wholeEuros(prev, "en")} to ${wholeEuros(b.upTo, "en")}` }[locale];
    }
    if (b.upTo === null) return { es: `${p} si vale más de ${wholeEuros(prev ?? 0, "es")}`, ca: `${p} si val més de ${wholeEuros(prev ?? 0, "ca")}`, en: `${p} if worth more than ${wholeEuros(prev ?? 0, "en")}` }[locale];
    return { es: `${p} si vale hasta ${wholeEuros(b.upTo, "es")}`, ca: `${p} si val fins a ${wholeEuros(b.upTo, "ca")}`, en: `${p} if worth up to ${wholeEuros(b.upTo, "en")}` }[locale];
  });
  const lead = rate.how === "progressive" ? { es: "por tramos: ", ca: "per trams: ", en: "by slices: " }[locale] : "";
  return lead + parts.join("; ");
}

/** "4 %", "bonificación del 10 %", "5 %, bonificación del 20 %": how a benefit lowers the tax. */
export function benefitRate(b: Benefit, locale: HtLocale): string {
  const bonus = b.bonusPercent === undefined ? null : { es: `bonificación del ${pct(b.bonusPercent, "es")}`, ca: `bonificació del ${pct(b.bonusPercent, "ca")}`, en: `${pct(b.bonusPercent, "en")} rebate` }[locale];
  if (b.rate && bonus) return `${rateText(b.rate, locale)}, ${bonus}`;
  return b.rate ? rateText(b.rate, locale) : (bonus ?? "");
}

/** The page's default example (server-rendered; the tests pin its result). */
export const EXAMPLE: HtInput = {
  community: "cataluna",
  price: 250_000,
  type: "second-hand",
  age: 40,
  largeFamily: false,
  disability: 0,
  habitual: true,
  firstHome: false,
  protected: false,
};

/* -------------------------------------------------------------------------- */
/* URL hash: a result can be shared                                           */
/* -------------------------------------------------------------------------- */

export function writeHash(s: HtInput): string {
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
  return `#${p.toString()}`;
}

export function readHash(hash: string, base: HtInput, ids: readonly string[]): HtInput {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  if (![...p.keys()].length) return base;
  const out: HtInput = { ...base };
  const c = p.get("c");
  if (c && ids.includes(c)) out.community = c;
  const price = Number(p.get("p"));
  if (p.has("p") && Number.isFinite(price) && price > 0 && price <= 100_000_000) out.price = price;
  if (p.get("t") === "n" || p.get("t") === "u") out.type = (p.get("t") === "n" ? "new" : "second-hand") as HomeType;
  const age = Number(p.get("e"));
  if (p.has("e") && Number.isInteger(age) && age >= 18 && age <= 120) out.age = age;
  out.largeFamily = p.get("fn") === "1";
  const d = Number(p.get("d"));
  out.disability = d === 33 || d === 65 ? d : 0;
  if (p.has("h")) out.habitual = p.get("h") === "1";
  out.firstHome = p.get("pv") === "1";
  out.protected = p.get("vpo") === "1";
  return out;
}

/* -------------------------------------------------------------------------- */
/* Calculator words                                                           */
/* -------------------------------------------------------------------------- */

export const TAX_NAME: Record<"itp" | "ajd" | "vat" | "igic" | "ipsi", Record<HtLocale, string>> = {
  itp: { es: "ITP (transmisiones patrimoniales)", ca: "ITP (transmissions patrimonials)", en: "ITP (property transfer tax)" },
  ajd: { es: "AJD (actos jurídicos documentados) de la escritura", ca: "AJD (actes jurídics documentats) de l'escriptura", en: "AJD (stamp duty) on the deed" },
  vat: { es: "IVA", ca: "IVA", en: "IVA (VAT)" },
  igic: { es: "IGIC (impuesto canario)", ca: "IGIC (impost canari)", en: "IGIC (Canary Islands tax)" },
  ipsi: { es: "IPSI (Ceuta y Melilla)", ca: "IPSI (Ceuta i Melilla)", en: "IPSI (Ceuta and Melilla tax)" },
};

export interface HtCalcCopy {
  title: string;
  intro: string;
  noscript: string;
  community: string;
  price: string;
  priceHint: string;
  type: string;
  types: Record<HomeType, string>;
  typeHints: Record<HomeType, string>;
  profile: string;
  age: string;
  habitual: string;
  firstHome: string;
  largeFamily: string;
  disability: string;
  disabilityOptions: Record<"0" | "33" | "65", string>;
  protected: string;
  results: string;
  total: string;
  totalUnverified: string;
  rateApplied: (rate: string, effective: string) => string;
  general: (amount: string) => string;
  reduced: (label: string) => string;
  generalRate: string;
  basis: string;
  extra: string;
  manual: string;
  unverified: (agency: string) => string;
  mortgage: string;
  fees: string;
  invalid: Record<"price" | "age" | "community", string>;
  example: string;
  share: string;
}

export const CALC_COPY: Record<HtLocale, HtCalcCopy> = {
  es: {
    title: "Calcula los impuestos de tu compra",
    intro: "Elige la comunidad donde está la vivienda, el precio y si es nueva o de segunda mano. Las preguntas sobre ti sirven para aplicar los tipos reducidos que fija la ley de cada comunidad.",
    noscript: "Sin JavaScript ves el ejemplo: una vivienda de segunda mano de 250.000 € en Cataluña. La tabla por comunidades de esta página da los tipos para hacer el cálculo a mano.",
    community: "Comunidad autónoma donde está la vivienda",
    price: "Precio de compra",
    priceHint: "El precio de la escritura. Para el ITP, Hacienda toma el valor de referencia del Catastro si es mayor.",
    type: "La vivienda es",
    types: { "second-hand": "De segunda mano", new: "Nueva (primera venta del promotor)" },
    typeHints: { "second-hand": "Paga ITP.", new: "Paga IVA (IGIC en Canarias, IPSI en Ceuta y Melilla) y AJD." },
    profile: "Tu situación (para los tipos reducidos)",
    age: "Tu edad el día de la compra",
    habitual: "Será tu vivienda habitual",
    firstHome: "Es tu primera vivienda",
    largeFamily: "Familia numerosa",
    disability: "Discapacidad (tuya o de quien diga la ley)",
    disabilityOptions: { "0": "No", "33": "33 % o más", "65": "65 % o más" },
    protected: "Vivienda protegida (VPO)",
    results: "Lo que pagarías",
    total: "Total de impuestos",
    totalUnverified: "Total: no se puede calcular (tipo no verificado)",
    rateApplied: (rate, eff) => `Tipo aplicado: ${rate} (${eff} del precio)`,
    general: (a) => `Al tipo general serían ${a}.`,
    reduced: (l) => `Tipo reducido aplicado: ${l}.`,
    generalRate: "Tipo general.",
    basis: "Base legal",
    extra: "Además debes cumplir:",
    manual: "Otras reducciones de esta comunidad que dependen de datos que no preguntamos:",
    unverified: (a) => `No verificado: no hemos podido leer el tipo en la ley de esta comunidad. Consulta ${a}.`,
    mortgage: "Si firmas una hipoteca, el AJD de la escritura del préstamo lo paga el banco (art. 29 del texto refundido, Real Decreto-ley 17/2018).",
    fees: "Notaría y Registro se pagan aparte, según arancel (no los sumamos).",
    invalid: { price: "Escribe un precio mayor que 0.", age: "Escribe una edad entre 18 y 120 años.", community: "Elige una comunidad." },
    example: "Ejemplo: vivienda de segunda mano de 250.000 € en Cataluña. Cambia los datos para tu caso.",
    share: "Enlace a este cálculo",
  },
  ca: {
    title: "Calcula els impostos de la teva compra",
    intro: "Tria la comunitat on és l'habitatge, el preu i si és nou o de segona mà. Les preguntes sobre tu serveixen per aplicar els tipus reduïts que fixa la llei de cada comunitat.",
    noscript: "Sense JavaScript veus l'exemple: un habitatge de segona mà de 250.000 € a Catalunya. La taula per comunitats d'aquesta pàgina dona els tipus per fer el càlcul a mà.",
    community: "Comunitat autònoma on és l'habitatge",
    price: "Preu de compra",
    priceHint: "El preu de l'escriptura. Per a l'ITP, Hisenda pren el valor de referència del Cadastre si és més alt.",
    type: "L'habitatge és",
    types: { "second-hand": "De segona mà", new: "Nou (primera venda del promotor)" },
    typeHints: { "second-hand": "Paga ITP.", new: "Paga IVA (IGIC a Canàries, IPSI a Ceuta i Melilla) i AJD." },
    profile: "La teva situació (per als tipus reduïts)",
    age: "La teva edat el dia de la compra",
    habitual: "Serà el teu habitatge habitual",
    firstHome: "És el teu primer habitatge",
    largeFamily: "Família nombrosa",
    disability: "Discapacitat (teva o de qui digui la llei)",
    disabilityOptions: { "0": "No", "33": "33 % o més", "65": "65 % o més" },
    protected: "Habitatge protegit (HPO)",
    results: "El que pagaries",
    total: "Total d'impostos",
    totalUnverified: "Total: no es pot calcular (tipus no verificat)",
    rateApplied: (rate, eff) => `Tipus aplicat: ${rate} (${eff} del preu)`,
    general: (a) => `Al tipus general serien ${a}.`,
    reduced: (l) => `Tipus reduït aplicat: ${l}.`,
    generalRate: "Tipus general.",
    basis: "Base legal",
    extra: "A més has de complir:",
    manual: "Altres reduccions d'aquesta comunitat que depenen de dades que no preguntem:",
    unverified: (a) => `No verificat: no hem pogut llegir el tipus a la llei d'aquesta comunitat. Consulta ${a}.`,
    mortgage: "Si signes una hipoteca, l'AJD de l'escriptura del préstec el paga el banc (art. 29 del text refós, Reial decret llei 17/2018).",
    fees: "Notaria i Registre es paguen a part, segons aranzel (no els sumem).",
    invalid: { price: "Escriu un preu més gran que 0.", age: "Escriu una edat entre 18 i 120 anys.", community: "Tria una comunitat." },
    example: "Exemple: habitatge de segona mà de 250.000 € a Catalunya. Canvia les dades per al teu cas.",
    share: "Enllaç a aquest càlcul",
  },
  en: {
    title: "Work out the taxes on your purchase",
    intro: "Pick the region where the home is, the price and whether it is new or second-hand. The questions about you are used to apply the reduced rates each region's law sets.",
    noscript: "Without JavaScript you see the example: a €250,000 second-hand home in Catalonia. The table by region on this page gives the rates to work it out by hand.",
    community: "Region (autonomous community) where the home is",
    price: "Purchase price",
    priceHint: "The price in the deed. For ITP the tax office uses the Land Registry (Catastro) reference value if it is higher.",
    type: "The home is",
    types: { "second-hand": "Second-hand (resale)", new: "New (first sale by the developer)" },
    typeHints: { "second-hand": "Pays ITP.", new: "Pays IVA (IGIC in the Canaries, IPSI in Ceuta and Melilla) and AJD." },
    profile: "About you (for the reduced rates)",
    age: "Your age on the purchase day",
    habitual: "It will be your main home",
    firstHome: "It is your first home",
    largeFamily: "Large family (familia numerosa)",
    disability: "Disability (yours or of whoever the law names)",
    disabilityOptions: { "0": "No", "33": "33% or more", "65": "65% or more" },
    protected: "Officially protected housing (VPO)",
    results: "What you would pay",
    total: "Total taxes",
    totalUnverified: "Total: cannot be worked out (rate not verified)",
    rateApplied: (rate, eff) => `Rate applied: ${rate} (${eff} of the price)`,
    general: (a) => `At the general rate it would be ${a}.`,
    reduced: (l) => `Reduced rate applied: ${l}.`,
    generalRate: "General rate.",
    basis: "Legal basis",
    extra: "You must also meet:",
    manual: "Other reductions in this region that depend on facts we do not ask about:",
    unverified: (a) => `Not verified: we could not read the rate in this region's law. Check with ${a}.`,
    mortgage: "If you take out a mortgage, the AJD on the loan deed is paid by the bank (art. 29 of the consolidated act, Royal Decree-law 17/2018).",
    fees: "Notary and Land Registry fees are paid separately, on the official scale (not added here).",
    invalid: { price: "Enter a price above 0.", age: "Enter an age between 18 and 120.", community: "Pick a region." },
    example: "Example: a €250,000 second-hand home in Catalonia. Change the figures to your case.",
    share: "Link to this calculation",
  },
};
