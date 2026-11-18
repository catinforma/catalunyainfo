import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { BS_LOCALES, bonoSocialEditions, money, rate, type BsLocale } from "./copy";
import { checkOk, household, thresholdsFor, capRowFor, type BonoInput } from "./engine";
import { IPREM_14 } from "@/lib/programmatic/iprem/rules";

import { DISCOUNT_2026, KWH_CAP, PERMANENT_DISCOUNT, PER_EXTRA_ADULT, PER_MINOR, RULES_AS_OF, SPECIAL_BONUS } from "./rules";

/**
 * Pure pieces of the bono social page: titles, the default input, the income
 * table and the worked examples (all computed by the engine, so the HTML and
 * the calculator always agree), the FAQ and the sitemap entries.
 */

/** The calculator's first render, on the server: two adults, two minors, 20,000 € a year, on the PVPC. */
export const DEFAULT_INPUT: BonoInput = household(2, 2, 20_000);

/** The figures the titles, lead and FAQ quote. */
export function headline() {
  const alone = thresholdsFor({ adults: 1, minors: 0, largeFamily: false, minimumPension: false, special: false });
  const aloneSpecial = thresholdsFor({ adults: 1, minors: 0, largeFamily: false, minimumPension: false, special: true });
  const family = thresholdsFor({ adults: 2, minors: 2, largeFamily: false, minimumPension: false, special: false });
  const coupleChild = thresholdsFor({ adults: 2, minors: 1, largeFamily: false, minimumPension: false, special: false });
  return {
    alone,
    aloneSpecial,
    family,
    coupleChild,
    perAdult: PER_EXTRA_ADULT * IPREM_14,
    perMinor: PER_MINOR * IPREM_14,
    special: SPECIAL_BONUS * IPREM_14,
    v2026: DISCOUNT_2026.rate.vulnerable,
    s2026: DISCOUNT_2026.rate.severe,
    vPerm: PERMANENT_DISCOUNT.vulnerable,
    sPerm: PERMANENT_DISCOUNT.severe,
  };
}

export interface BsMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  appName: string;
}

export function bonoSocialMeta(locale: BsLocale): BsMeta {
  const h = headline();
  const M = (n: number) => money(n, locale);
  const R = (r: number) => rate(r, locale);
  return {
    es: {
      title: "Bono social eléctrico 2026: requisitos y calculadora",
      description: `¿Tienes derecho? ${R(h.v2026)} de descuento (${R(h.s2026)} si eres vulnerable severo) hasta el 31/12/2026, solo con PVPC. Límite: ${M(h.alone.vulnerable)} al año si vives solo.`,
      h1: "Bono social eléctrico: ¿tienes derecho? Requisitos y descuento 2026",
      breadcrumb: "Bono social eléctrico",
      appName: "Calculadora del bono social eléctrico (Real Decreto 897/2017 y Real Decreto-ley 7/2026)",
    },
    ca: {
      title: "Bo social elèctric 2026: requisits i calculadora",
      description: `Tens dret al bo social? ${R(h.v2026)} de descompte (${R(h.s2026)} si ets vulnerable sever) fins al 31/12/2026, només amb PVPC. Límit: ${M(h.alone.vulnerable)} l'any si vius sol.`,
      h1: "Bo social elèctric: tens dret? Requisits i descompte del 2026",
      breadcrumb: "Bo social elèctric",
      appName: "Calculadora del bo social elèctric (Reial decret 897/2017 i Reial decret llei 7/2026)",
    },
    en: {
      title: "Spain's bono social 2026: electricity discount checker",
      description: `Do you qualify? ${R(h.v2026)} off the bill (${R(h.s2026)} if severely vulnerable) until 31 Dec 2026, PVPC tariff only. Income limit ${M(h.alone.vulnerable)} a year living alone.`,
      h1: "Spain's bono social for electricity: do you qualify? 2026 rules",
      breadcrumb: "Bono social (electricity)",
      appName: "Spain bono social eligibility checker (Royal Decree 897/2017 and Royal Decree-law 7/2026)",
    },
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Income table                                                               */
/* -------------------------------------------------------------------------- */

export type HouseholdId = "a1" | "a2" | "a3" | "a1m1" | "a1m2" | "a2m1" | "a2m2" | "a2m3";

export const HOUSEHOLDS: readonly { id: HouseholdId; adults: number; minors: number }[] = [
  { id: "a1", adults: 1, minors: 0 },
  { id: "a2", adults: 2, minors: 0 },
  { id: "a3", adults: 3, minors: 0 },
  { id: "a1m1", adults: 1, minors: 1 },
  { id: "a1m2", adults: 1, minors: 2 },
  { id: "a2m1", adults: 2, minors: 1 },
  { id: "a2m2", adults: 2, minors: 2 },
  { id: "a2m3", adults: 2, minors: 3 },
];

export const HOUSEHOLD_LABEL: Record<HouseholdId, Record<BsLocale, string>> = {
  a1: { es: "Una persona sola", ca: "Una persona sola", en: "One person alone" },
  a2: { es: "Dos adultos", ca: "Dos adults", en: "Two adults" },
  a3: { es: "Tres adultos", ca: "Tres adults", en: "Three adults" },
  a1m1: { es: "Un adulto y un menor", ca: "Un adult i un menor", en: "One adult, one minor" },
  a1m2: { es: "Un adulto y dos menores", ca: "Un adult i dos menors", en: "One adult, two minors" },
  a2m1: { es: "Dos adultos y un menor", ca: "Dos adults i un menor", en: "Two adults, one minor" },
  a2m2: { es: "Dos adultos y dos menores", ca: "Dos adults i dos menors", en: "Two adults, two minors" },
  a2m3: { es: "Dos adultos y tres menores", ca: "Dos adults i tres menors", en: "Two adults, three minors" },
};

/** Every household of the table with its limits, without and with a special circumstance, and its kWh cap. */
export function incomeTable() {
  return HOUSEHOLDS.map((h) => {
    const base = { adults: h.adults, minors: h.minors, largeFamily: false, minimumPension: false };
    return {
      ...h,
      plain: thresholdsFor({ ...base, special: false }),
      special: thresholdsFor({ ...base, special: true }),
      kwh: KWH_CAP[capRowFor(h.adults, h.minors, false, false)],
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Worked examples                                                            */
/* -------------------------------------------------------------------------- */

export type ExampleId = "alone" | "family" | "family-low" | "single-parent" | "large-family" | "pensioner" | "couple-over" | "free-market";

export function exampleInputs(): [ExampleId, BonoInput][] {
  return [
    ["alone", household(1, 0, 11_000)],
    ["family", DEFAULT_INPUT],
    ["family-low", household(2, 2, 11_000)],
    ["single-parent", household(1, 1, 14_000, { special: ["single-parent"] })],
    ["large-family", household(2, 3, 30_000, { largeFamily: true })],
    ["pensioner", household(1, 0, 8_000, { minimumPension: true })],
    ["couple-over", household(2, 0, 25_000)],
    ["free-market", household(1, 0, 11_000, { tariff: "free" })],
  ];
}

/** The worked examples, in the page's order. */
export function examples() {
  return exampleInputs().map(([id, input]) => ({ id, input, result: checkOk(input) }));
}

/* -------------------------------------------------------------------------- */
/* Sitemap and FAQ                                                            */
/* -------------------------------------------------------------------------- */

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML. */
export function bonoSocialSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  const e = bonoSocialEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return BS_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

/** The FAQ, with every figure from the rules and the engine (also the FAQPage JSON-LD). */
export function bonoSocialFaq(locale: BsLocale): { q: string; a: string }[] {
  const h = headline();
  const M = (n: number) => money(n, locale);
  const R = (r: number) => rate(r, locale);
  return {
    es: [
      {
        q: "¿Cuánto descuenta el bono social en 2026?",
        a: `El ${R(h.v2026)} de la factura a los consumidores vulnerables y el ${R(h.s2026)} a los vulnerables severos, del 1 de enero al 31 de diciembre de 2026 (Real Decreto-ley 7/2026). Desde el 1 de enero de 2027, si no se aprueba una prórroga, vuelve a la regla fija: ${R(h.vPerm)} y ${R(h.sPerm)}. El descuento se aplica a todo el término de potencia y al de energía hasta un límite de kWh al año.`,
      },
      {
        q: "¿Quién tiene derecho al bono social eléctrico?",
        a: "La persona titular del contrato de luz de su vivienda habitual, con 10 kW o menos, que tenga el PVPC (la tarifa regulada) y cumpla uno de estos requisitos: ingresos del hogar por debajo del límite, título de familia numerosa, pensión mínima de jubilación o incapacidad permanente para todos los que tienen ingresos, o alguien del hogar que cobra el ingreso mínimo vital.",
      },
      {
        q: "¿Cuál es el límite de ingresos para el bono social?",
        a: `${M(h.alone.vulnerable)} al año para una persona sola (1,5 veces el IPREM de 14 pagas, ${M(IPREM_14)}). Cada adulto más suma ${M(h.perAdult)} y cada menor ${M(h.perMinor)}: dos adultos y dos menores, ${M(h.family.vulnerable)}. Con discapacidad, violencia de género, terrorismo, dependencia, familia monoparental o electrodependencia, ${M(h.special)} más. Con la mitad de esos ingresos eres vulnerable severo.`,
      },
      {
        q: "¿Qué ingresos cuentan para el bono social?",
        a: "La base imponible general y la del ahorro de la última declaración de la renta que tenga Hacienda cuando lo pides, sumadas las de todo el hogar (pareja y familiares hasta segundo grado que viven contigo). Si alguien no tenía que declarar, cuentan los datos que tiene Hacienda; si tenía que declarar y no lo hizo, se deniega.",
      },
      {
        q: "¿Puedo tener el bono social con cualquier compañía de luz?",
        a: "No. Solo se aplica con el PVPC, y el PVPC solo lo venden las comercializadoras de referencia. Si estás en el mercado libre, al pedir el bono social la comercializadora de referencia te cambia al PVPC, gratis si mantienes la potencia. Tampoco vale un contrato que junte luz y gas.",
      },
      {
        q: "¿Cómo se solicita el bono social y cuánto dura?",
        a: "Con el formulario de una comercializadora de referencia (por teléfono, en la web, por correo electrónico o postal o en sus oficinas) y la documentación del hogar. Tiene 10 días hábiles para responder; el descuento cuenta desde el ciclo de facturación en que entregas la solicitud completa. Dura dos años y se renueva si sigues cumpliendo; con familia numerosa, lo que dure el título.",
      },
      {
        q: "¿Me pueden cortar la luz si tengo el bono social?",
        a: "Hasta el 31 de diciembre de 2026, no: el Real Decreto-ley 7/2026 prorroga la prohibición de cortar la luz, el gas natural y el agua a los consumidores vulnerables, vulnerables severos y en riesgo de exclusión social. A quien está en riesgo de exclusión social no se le puede cortar por impago tampoco después: su suministro es esencial.",
      },
    ],
    ca: [
      {
        q: "Quant descompta el bo social el 2026?",
        a: `El ${R(h.v2026)} de la factura als consumidors vulnerables i el ${R(h.s2026)} als vulnerables severs, de l'1 de gener al 31 de desembre de 2026 (Reial decret llei 7/2026). Des de l'1 de gener de 2027, si no s'aprova una pròrroga, torna a la regla fixa: ${R(h.vPerm)} i ${R(h.sPerm)}. El descompte s'aplica a tot el terme de potència i al d'energia fins a un límit de kWh l'any.`,
      },
      {
        q: "Qui té dret al bo social elèctric?",
        a: "La persona titular del contracte de llum del seu habitatge habitual, amb 10 kW o menys, que tingui el PVPC (la tarifa regulada) i compleixi un d'aquests requisits: ingressos de la llar per sota del límit, títol de família nombrosa, pensió mínima de jubilació o d'incapacitat permanent per a tots els qui tenen ingressos, o algú de la llar que cobra l'ingrés mínim vital.",
      },
      {
        q: "Quin és el límit d'ingressos per al bo social?",
        a: `${M(h.alone.vulnerable)} l'any per a una persona sola (1,5 vegades l'IPREM de 14 pagues, ${M(IPREM_14)}). Cada adult més hi suma ${M(h.perAdult)} i cada menor ${M(h.perMinor)}: dos adults i dos menors, ${M(h.family.vulnerable)}. Amb discapacitat, violència de gènere, terrorisme, dependència, família monoparental o electrodependència, ${M(h.special)} més. Amb la meitat d'aquests ingressos ets vulnerable sever.`,
      },
      {
        q: "Quins ingressos compten per al bo social?",
        a: "La base imposable general i la de l'estalvi de l'última declaració de la renda que tingui Hisenda quan el demanes, sumades les de tota la llar (parella i familiars fins a segon grau que viuen amb tu). Si algú no havia de declarar, compten les dades que té Hisenda; si havia de declarar i no ho va fer, es denega.",
      },
      {
        q: "Puc tenir el bo social amb qualsevol companyia de llum?",
        a: "No. Només s'aplica amb el PVPC, i el PVPC només el venen les comercialitzadores de referència. Si ets al mercat lliure, quan demanes el bo social la comercialitzadora de referència et canvia al PVPC, de franc si mantens la potència. Tampoc no val un contracte que ajunti llum i gas.",
      },
      {
        q: "Com es demana el bo social i quant dura?",
        a: "Amb el formulari d'una comercialitzadora de referència (per telèfon, al web, per correu electrònic o postal o a les seves oficines) i la documentació de la llar. Té 10 dies hàbils per respondre; el descompte compta des del cicle de facturació en què lliures la sol·licitud completa. Dura dos anys i es renova si continues complint; amb família nombrosa, el que duri el títol.",
      },
      {
        q: "Em poden tallar la llum si tinc el bo social?",
        a: "Fins al 31 de desembre de 2026, no: el Reial decret llei 7/2026 prorroga la prohibició de tallar la llum, el gas natural i l'aigua als consumidors vulnerables, vulnerables severs i en risc d'exclusió social. A qui és en risc d'exclusió social tampoc no se li pot tallar per impagament després: el seu subministrament és essencial.",
      },
    ],
    en: [
      {
        q: "How much does the bono social take off the bill in 2026?",
        a: `${R(h.v2026)} for vulnerable consumers and ${R(h.s2026)} for severely vulnerable ones, from 1 January to 31 December 2026 (Royal Decree-law 7/2026). From 1 January 2027, unless an extension is approved, the permanent rule returns: ${R(h.vPerm)} and ${R(h.sPerm)}. The discount covers the whole power term and the energy term up to a yearly kWh limit.`,
      },
      {
        q: "Who qualifies for the bono social for electricity?",
        a: "The holder of the electricity contract at their main home, with 10 kW or less, on the PVPC (the regulated tariff), who meets one of these: household income under the limit, a large-family title, the minimum retirement or permanent incapacity pension for everyone with income, or someone in the household receiving the minimum living income (IMV).",
      },
      {
        q: "What is the income limit for the bono social?",
        a: `${M(h.alone.vulnerable)} a year for one person alone (1.5 times the 14-payment IPREM of ${M(IPREM_14)}). Each further adult adds ${M(h.perAdult)} and each minor ${M(h.perMinor)}: two adults and two minors, ${M(h.family.vulnerable)}. With disability, gender violence, terrorism, dependency, a single parent or electrodependency, ${M(h.special)} more. At half that income you are severely vulnerable.`,
      },
      {
        q: "Which income counts for the bono social?",
        a: "The general and savings taxable bases of the last income tax return the tax office has when you apply, added up for the whole household (partner and relatives up to the second degree who live with you). For someone who did not have to file, the tax office's own data count; if they had to file and did not, the application is refused.",
      },
      {
        q: "Can I get the bono social with any electricity company?",
        a: "No. It only applies on the PVPC, and only the reference suppliers (comercializadoras de referencia) sell the PVPC. If you are on the free market, applying moves you to the PVPC with the reference supplier, free of charge if you keep the same power. A contract bundling electricity and gas does not qualify either.",
      },
      {
        q: "How do I apply, and how long does it last?",
        a: "With a reference supplier's form (by phone, online, by email or post, or at its offices) and the household's documents. It has 10 working days to answer; the discount counts from the billing cycle in which you hand in the complete application. It lasts two years and is renewed while you still qualify; for large families, as long as the title.",
      },
      {
        q: "Can my electricity be cut off if I have the bono social?",
        a: "Not until 31 December 2026: Royal Decree-law 7/2026 extends the ban on cutting off electricity, natural gas and water to vulnerable, severely vulnerable and at-risk consumers. A consumer at risk of social exclusion cannot be cut off for non-payment after that date either: their supply is essential.",
      },
    ],
  }[locale];
}
