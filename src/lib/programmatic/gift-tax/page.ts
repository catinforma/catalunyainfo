import type { MetadataRoute } from "next";

import { ISD_LOCALES, money, percent } from "@/lib/programmatic/inheritance-tax/copy";
import { absoluteUrl } from "@/lib/site";

import { GIFT_AGENCY, GIFT_REGION_IN, giftEditions, type GiftLocale } from "./copy";
import { calculateGiftOk, giftInputOf, type GiftInput, type GiftOk } from "./engine";
import { ANDALUCIA_GIFT_RULES } from "./regions/andalucia";
import { CATALONIA_GIFT_RULES } from "./regions/catalonia";
import { MADRID_GIFT_RULES } from "./regions/madrid";
import { RULES_AS_OF } from "./regions/state";
import { GIFT_REGION_IDS, type GiftRegionId, type GiftRules } from "./regions/types";
import { VALENCIA_GIFT_DATES, VALENCIA_GIFT_RULES } from "./regions/valencia";

/**
 * Pure pieces of the four gift tax pages: titles, the worked examples (each
 * agency's published cases, reproduced to the cent, and our own, checked by
 * hand in tests/gift-tax.test.ts), the FAQ and the sitemap entries. Every
 * figure comes from the engine.
 */

export const GIFT_RULES: Record<GiftRegionId, GiftRules> = { catalonia: CATALONIA_GIFT_RULES, madrid: MADRID_GIFT_RULES, andalucia: ANDALUCIA_GIFT_RULES, valencia: VALENCIA_GIFT_RULES };

export interface GiftExample {
  id: string;
  label: Record<GiftLocale, string>;
  input: GiftInput;
  /** The figures the agency itself publishes for this case: the tax after the coefficient (cuota tributaria) and the amount to pay. */
  official?: { quota: number; toPay: number };
}

const L3 = (ca: string, es: string, en: string): Record<GiftLocale, string> => ({ ca, es, en });

/** The first one of each community is what the server renders in the calculator. */
export const GIFT_EXAMPLES: Record<GiftRegionId, readonly GiftExample[]> = {
  catalonia: [
    { id: "atc-1", label: L3("Cas 1 de l'ATC: fill de 35 anys, 275.000 € en diners amb escriptura", "Caso 1 de la ATC: hijo de 35 años, 275.000 € en dinero con escritura", "ATC case 1: son aged 35, €275,000 in money with a deed"), input: giftInputOf({ relation: "child", age: 35, amount: 275_000, priorWealth: 12_000 }), official: { quota: 15_250, toPay: 15_250 } },
    { id: "atc-2", label: L3("Cas 2 de l'ATC: el mateix, sense escriptura", "Caso 2 de la ATC: lo mismo, sin escritura", "ATC case 2: the same, without a deed"), input: giftInputOf({ relation: "child", age: 35, amount: 275_000, priorWealth: 12_000, publicDeed: false }), official: { quota: 35_750, toPay: 35_750 } },
    { id: "atc-3", label: L3("Cas 3 de l'ATC: filla de 35 anys, un habitatge de 275.000 € amb escriptura", "Caso 3 de la ATC: hija de 35 años, una vivienda de 275.000 € con escritura", "ATC case 3: daughter aged 35, a €275,000 home with a deed"), input: giftInputOf({ relation: "child", age: 35, amount: 275_000, kind: "home" }), official: { quota: 15_250, toPay: 15_250 } },
    { id: "atc-4", label: L3("Cas 4 de l'ATC: filla de 27 anys, 40.000 € per al primer habitatge", "Caso 4 de la ATC: hija de 27 años, 40.000 € para la primera vivienda", "ATC case 4: daughter aged 27, €40,000 for her first home"), input: giftInputOf({ relation: "child", age: 27, amount: 40_000, forHome: true }), official: { quota: 100, toPay: 100 } },
    { id: "atc-5", label: L3("Cas 5 de l'ATC: el mateix amb 90.000 € (límit de 60.000 €)", "Caso 5 de la ATC: lo mismo con 90.000 € (límite de 60.000 €)", "ATC case 5: the same with €90,000 (the €60,000 cap)"), input: giftInputOf({ relation: "child", age: 27, amount: 90_000, forHome: true }), official: { quota: 1_500, toPay: 1_500 } },
    { id: "atc-6", label: L3("Cas 6 de l'ATC: germana de 40 anys, 80.000 € en document privat", "Caso 6 de la ATC: hermana de 40 años, 80.000 € en documento privado", "ATC case 6: sister aged 40, €80,000 in a private document"), input: giftInputOf({ relation: "sibling", age: 40, amount: 80_000, publicDeed: false }), official: { quota: 10_799.76, toPay: 10_799.76 } },
    { id: "atc-7", label: L3("Cas 7 de l'ATC: neboda de 18 anys, 60.000 €", "Caso 7 de la ATC: sobrina de 18 años, 60.000 €", "ATC case 7: niece aged 18, €60,000"), input: giftInputOf({ relation: "nephew", age: 18, amount: 60_000, publicDeed: false }), official: { quota: 7_305.72, toPay: 7_305.72 } },
    { id: "atc-8", label: L3("Cas 8 de l'ATC: amiga de 60 anys, 70.000 €", "Caso 8 de la ATC: amiga de 60 años, 70.000 €", "ATC case 8: friend aged 60, €70,000"), input: giftInputOf({ relation: "unrelated", age: 60, amount: 70_000, publicDeed: false }), official: { quota: 11_400, toPay: 11_400 } },
    { id: "atc-11", label: L3("Cas 11 de l'ATC: fill de 40 anys, 50.000 € després d'una donació de 200.000 €", "Caso 11 de la ATC: hijo de 40 años, 50.000 € tras una donación de 200.000 €", "ATC case 11: son aged 40, €50,000 after an earlier €200,000 gift"), input: giftInputOf({ relation: "child", age: 40, amount: 50_000, priorWealth: 300_000, previousGifts: 200_000 }), official: { quota: 2_700, toPay: 2_700 } },
  ],
  madrid: [
    { id: "son-100k", label: L3("Fill de 35 anys, 100.000 € en diners, escriptura i origen justificat", "Hijo de 35 años, 100.000 € en dinero, escritura y origen justificado", "Son aged 35, €100,000 in money, deed and origin shown"), input: giftInputOf({ relation: "child", age: 35, amount: 100_000 }) },
    { id: "official-home", label: L3("Exemple de la Comunitat de Madrid: pare a fill, un immoble de 200.000 €", "Ejemplo de la Comunidad de Madrid: padre a hijo, un inmueble de 200.000 €", "The Madrid region's example: father to son, a €200,000 property"), input: giftInputOf({ relation: "child", age: 35, amount: 200_000, kind: "home" }), official: { quota: 31_621.21, toPay: 316.21 } },
    { id: "official-garage", label: L3("Exemple de la Comunitat de Madrid: una plaça de garatge de 10.000 € un any després d'un pis de 235.000 €", "Ejemplo de la Comunidad de Madrid: una plaza de garaje de 10.000 € un año después de un piso de 235.000 €", "The Madrid region's example: a €10,000 parking space a year after a €235,000 flat"), input: giftInputOf({ relation: "child", age: 35, amount: 10_000, kind: "other", previousGifts: 235_000 }), official: { quota: 1_690, toPay: 16.9 } },
    { id: "daughter-home", label: L3("Filla de 30 anys, 300.000 € per comprar l'habitatge habitual", "Hija de 30 años, 300.000 € para comprar la vivienda habitual", "Daughter aged 30, €300,000 to buy her habitual home"), input: giftInputOf({ relation: "child", age: 30, amount: 300_000, forHome: true }) },
    { id: "son-private", label: L3("Fill de 35 anys, 50.000 € en document privat", "Hijo de 35 años, 50.000 € en documento privado", "Son aged 35, €50,000 in a private document"), input: giftInputOf({ relation: "child", age: 35, amount: 50_000, publicDeed: false }) },
    { id: "brother", label: L3("Germà de 50 anys, 50.000 € amb escriptura", "Hermano de 50 años, 50.000 € con escritura", "Brother aged 50, €50,000 with a deed"), input: giftInputOf({ relation: "sibling", age: 50, amount: 50_000 }) },
    { id: "friend", label: L3("Amic sense parentiu, 30.000 €", "Amigo sin parentesco, 30.000 €", "Unrelated friend, €30,000"), input: giftInputOf({ relation: "unrelated", age: 40, amount: 30_000 }) },
    { id: "small", label: L3("Amic, 800 € en document privat", "Amigo, 800 € en documento privado", "Friend, €800 in a private document"), input: giftInputOf({ relation: "unrelated", age: 40, amount: 800, publicDeed: false, fundsOrigin: false }) },
  ],
  andalucia: [
    { id: "official-100k", label: L3("Exemple de l'Agència Tributària d'Andalusia: pare a fill de 30 anys, 100.000 € amb escriptura", "Ejemplo de la Agencia Tributaria de Andalucía: padre a hijo de 30 años, 100.000 € con escritura", "The Andalusian Tax Agency's example: father to son aged 30, €100,000 with a deed"), input: giftInputOf({ relation: "child", age: 30, amount: 100_000 }), official: { quota: 12_620, toPay: 126.2 } },
    { id: "official-accumulated", label: L3("Exemple de l'Agència: 15.000 € després de 30.000 € en dos anys", "Ejemplo de la Agencia: 15.000 € después de 30.000 € en dos años", "The Agency's example: €15,000 after €30,000 over two years"), input: giftInputOf({ relation: "child", age: 30, amount: 15_000, previousGifts: 30_000 }), official: { quota: 1_473, toPay: 14.73 } },
    { id: "daughter-home", label: L3("Filla de 30 anys, 120.000 € per comprar l'habitatge habitual", "Hija de 30 años, 120.000 € para comprar la vivienda habitual", "Daughter aged 30, €120,000 to buy her habitual home"), input: giftInputOf({ relation: "child", age: 30, amount: 120_000, forHome: true }) },
    { id: "son-small", label: L3("Fill de 30 anys, 3.000 € en document privat", "Hijo de 30 años, 3.000 € en documento privado", "Son aged 30, €3,000 in a private document"), input: giftInputOf({ relation: "child", age: 30, amount: 3_000, publicDeed: false, fundsOrigin: false }) },
    { id: "son-private", label: L3("Fill de 30 anys, 20.000 € en document privat", "Hijo de 30 años, 20.000 € en documento privado", "Son aged 30, €20,000 in a private document"), input: giftInputOf({ relation: "child", age: 30, amount: 20_000, publicDeed: false }) },
    { id: "nephew", label: L3("Nebot de 40 anys, 50.000 €", "Sobrino de 40 años, 50.000 €", "Nephew aged 40, €50,000"), input: giftInputOf({ relation: "nephew", age: 40, amount: 50_000 }) },
    { id: "friend", label: L3("Amic sense parentiu, 50.000 €", "Amigo sin parentesco, 50.000 €", "Unrelated friend, €50,000"), input: giftInputOf({ relation: "unrelated", age: 40, amount: 50_000 }) },
  ],
  valencia: [
    { id: "son-300k", label: L3("Fill de 30 anys, 300.000 € en diners, escriptura i origen justificat", "Hijo de 30 años, 300.000 € en dinero, escritura y origen justificado", "Son aged 30, €300,000 in money, deed and origin shown"), input: giftInputOf({ relation: "child", age: 30, amount: 300_000 }) },
    { id: "grandchild-15", label: L3("Nét de 15 anys, 200.000 € amb escriptura", "Nieto de 15 años, 200.000 € con escritura", "Grandchild aged 15, €200,000 with a deed"), input: giftInputOf({ relation: "grandchild", age: 15, amount: 200_000 }) },
    { id: "son-private", label: L3("Fill de 30 anys, 50.000 € en document privat", "Hijo de 30 años, 50.000 € en documento privado", "Son aged 30, €50,000 in a private document"), input: giftInputOf({ relation: "child", age: 30, amount: 50_000, publicDeed: false }) },
    { id: "brother", label: L3("Germà de 60 anys, 100.000 € amb escriptura", "Hermano de 60 años, 100.000 € con escritura", "Brother aged 60, €100,000 with a deed"), input: giftInputOf({ relation: "sibling", age: 60, amount: 100_000 }) },
    { id: "brother-in-law", label: L3("Cunyat de 60 anys, 100.000 € amb escriptura", "Cuñado de 60 años, 100.000 € con escritura", "Brother-in-law aged 60, €100,000 with a deed"), input: giftInputOf({ relation: "affinity", age: 60, amount: 100_000 }) },
    { id: "friend-disability", label: L3("Amic amb discapacitat del 65 %, 300.000 €", "Amigo con discapacidad del 65 %, 300.000 €", "Unrelated friend with a 65% disability, €300,000"), input: giftInputOf({ relation: "unrelated", age: 50, amount: 300_000, disability: 65 }) },
    { id: "friend", label: L3("Amic sense parentiu, 100.000 €", "Amigo sin parentesco, 100.000 €", "Unrelated friend, €100,000"), input: giftInputOf({ relation: "unrelated", age: 50, amount: 100_000 }) },
  ],
};

export function giftDefaultInput(region: GiftRegionId): GiftInput {
  return GIFT_EXAMPLES[region][0]!.input;
}

export function giftExampleResults(region: GiftRegionId): (GiftExample & { result: GiftOk })[] {
  return GIFT_EXAMPLES[region].map((e) => ({ ...e, result: calculateGiftOk(GIFT_RULES[region], e.input) }));
}

/** One example's result by id. */
export function giftExample(region: GiftRegionId, id: string): GiftOk {
  const e = GIFT_EXAMPLES[region].find((x) => x.id === id);
  if (!e) throw new Error(`gift-tax ${region}: no example ${id}`);
  return calculateGiftOk(GIFT_RULES[region], e.input);
}

export interface GiftMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  appName: string;
}

export function giftMeta(region: GiftRegionId, locale: GiftLocale): GiftMeta {
  const M = (n: number) => money(n, locale);
  if (region === "catalonia") {
    const deed = giftExample("catalonia", "atc-1");
    const noDeed = giftExample("catalonia", "atc-2");
    return {
      ca: {
        title: "Impost de donacions a Catalunya 2026: calculadora",
        description: `Un fill que rep 275.000 € en escriptura paga ${M(deed.toPay)}; sense escriptura, ${M(noDeed.toPay)}. Calcula l'impost de donacions a Catalunya pas a pas.`,
        h1: "Impost de donacions a Catalunya: calculadora pas a pas",
        breadcrumb: "Donacions a Catalunya",
        appName: "Calculadora de l'impost de donacions a Catalunya (Codi tributari, llibre sisè)",
      },
      es: {
        title: "Impuesto de donaciones en Cataluña 2026: calculadora",
        description: `Un hijo que recibe 275.000 € en escritura paga ${M(deed.toPay)}; sin escritura, ${M(noDeed.toPay)}. Calcula el impuesto de donaciones en Cataluña paso a paso.`,
        h1: "Impuesto de donaciones en Cataluña: calculadora paso a paso",
        breadcrumb: "Donaciones en Cataluña",
        appName: "Calculadora del impuesto de donaciones en Cataluña (Código tributario, libro sexto)",
      },
      en: {
        title: "Catalonia gift tax calculator 2026",
        description: `A son given €275,000 in a public deed pays ${M(deed.toPay)}; without the deed, ${M(noDeed.toPay)}. Work out the Catalan gift tax step by step.`,
        h1: "Catalonia gift tax: step-by-step calculator",
        breadcrumb: "Catalonia gift tax",
        appName: "Catalonia gift tax calculator (Catalan Tax Code, book six)",
      },
    }[locale];
  }
  if (region === "madrid") {
    const son = giftExample("madrid", "son-100k");
    return {
      ca: {
        title: "Impost de donacions a Madrid 2026: calculadora",
        description: `De pares a fills, bonificació del 99 %: un fill que rep 100.000 € en escriptura paga ${M(son.toPay)}. Calcula l'impost de donacions a Madrid pas a pas.`,
        h1: "Impost de donacions a la Comunitat de Madrid: calculadora pas a pas",
        breadcrumb: "Donacions a Madrid",
        appName: "Calculadora de l'impost de donacions a la Comunitat de Madrid (Decret legislatiu 1/2010)",
      },
      es: {
        title: "Impuesto de donaciones en Madrid 2026: calculadora",
        description: `De padres a hijos, bonificación del 99 %: un hijo que recibe 100.000 € en escritura paga ${M(son.toPay)}. Calcula el impuesto de donaciones en Madrid paso a paso.`,
        h1: "Impuesto de donaciones en la Comunidad de Madrid: calculadora paso a paso",
        breadcrumb: "Donaciones en Madrid",
        appName: "Calculadora del impuesto de donaciones en la Comunidad de Madrid (Decreto Legislativo 1/2010)",
      },
      en: {
        title: "Madrid gift tax calculator 2026",
        description: `Parents to children get a 99% rebate: a son given €100,000 in a public deed pays ${M(son.toPay)}. Work out Madrid's gift tax step by step.`,
        h1: "Madrid gift tax: step-by-step calculator",
        breadcrumb: "Madrid gift tax",
        appName: "Madrid region gift tax calculator (Legislative Decree 1/2010)",
      },
    }[locale];
  }
  if (region === "andalucia") {
    const son = giftExample("andalucia", "official-100k");
    return {
      ca: {
        title: "Impost de donacions a Andalusia 2026: calculadora",
        description: `Fills, cònjuge i pares es bonifiquen el 99 %: un fill que rep 100.000 € paga ${M(son.toPay)}. Calcula l'impost de donacions a Andalusia pas a pas.`,
        h1: "Impost de donacions a Andalusia: calculadora pas a pas",
        breadcrumb: "Donacions a Andalusia",
        appName: "Calculadora de l'impost de donacions a Andalusia (Llei 5/2021 de tributs cedits)",
      },
      es: {
        title: "Impuesto de donaciones en Andalucía 2026: calculadora",
        description: `Hijos, cónyuge y padres se bonifican el 99 %: un hijo que recibe 100.000 € paga ${M(son.toPay)}. Calcula el impuesto de donaciones en Andalucía paso a paso.`,
        h1: "Impuesto de donaciones en Andalucía: calculadora paso a paso",
        breadcrumb: "Donaciones en Andalucía",
        appName: "Calculadora del impuesto de donaciones en Andalucía (Ley 5/2021 de Tributos Cedidos)",
      },
      en: {
        title: "Andalusia gift tax calculator 2026",
        description: `Children, spouses and parents get a 99% rebate: a son given €100,000 pays ${M(son.toPay)}. Work out Andalusia's gift tax step by step.`,
        h1: "Andalusia gift tax: step-by-step calculator",
        breadcrumb: "Andalusia gift tax",
        appName: "Andalusia gift tax calculator (Ceded Taxes Act, Law 5/2021)",
      },
    }[locale];
  }
  const son = giftExample("valencia", "son-300k");
  return {
    ca: {
      title: "Impost de donacions a la Comunitat Valenciana 2026",
      description: `Un fill que rep 300.000 € redueix 100.000 € i, amb la bonificació del 99 %, paga ${M(son.toPay)}. Calcula l'impost de donacions valencià pas a pas.`,
      h1: "Impost de donacions a la Comunitat Valenciana: calculadora pas a pas",
      breadcrumb: "Donacions a la C. Valenciana",
      appName: "Calculadora de l'impost de donacions a la Comunitat Valenciana (Llei 13/1997)",
    },
    es: {
      title: "Impuesto de donaciones Comunidad Valenciana 2026",
      description: `Un hijo que recibe 300.000 € reduce 100.000 € y, con la bonificación del 99 %, paga ${M(son.toPay)}. Calcula paso a paso el impuesto de donaciones valenciano.`,
      h1: "Impuesto de donaciones en la Comunidad Valenciana: calculadora paso a paso",
      breadcrumb: "Donaciones en la C. Valenciana",
      appName: "Calculadora del impuesto de donaciones en la Comunitat Valenciana (Ley 13/1997)",
    },
    en: {
      title: "Valencia region gift tax calculator 2026",
      description: `A son given €300,000 deducts €100,000 and, with the 99% rebate, pays ${M(son.toPay)}. Work out the Valencian gift tax step by step.`,
      h1: "Valencia region gift tax: step-by-step calculator",
      breadcrumb: "Valencia gift tax",
      appName: "Valencia region gift tax calculator (Valencian Law 13/1997)",
    },
  }[locale];
}

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML. */
export function giftSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  return GIFT_REGION_IDS.flatMap((region) => {
    const e = giftEditions(region);
    const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
    return ISD_LOCALES.map((locale) => ({
      url: absoluteUrl(e[locale]),
      lastModified: new Date(`${lastModified}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: locale === "en" ? 0.6 : 0.8,
      alternates: { languages },
    }));
  });
}

/** "un mes" / "30 días hábiles" / "two months": the community's deadline in words. */
export function giftDeadline(rules: GiftRules, locale: GiftLocale): string {
  const d = rules.deadline;
  if ("workingDays" in d) return { ca: `${d.workingDays} dies hàbils comptats des de l'endemà de la donació`, es: `${d.workingDays} días hábiles contados desde el día siguiente a la donación`, en: `${d.workingDays} working days from the day after the gift` }[locale];
  const n = d.months;
  return { ca: n === 1 ? "un mes des del dia de la donació" : `${n === 2 ? "dos" : n} mesos des de l'endemà de la donació`, es: n === 1 ? "un mes desde el día de la donación" : `${n === 2 ? "dos" : n} meses desde el día siguiente a la donación`, en: n === 1 ? "one month from the day of the gift" : `${n === 2 ? "two" : n} months from the day after the gift` }[locale];
}

/** The FAQ, every figure from the engine and the rules (also the FAQPage JSON-LD). */
export function giftFaq(region: GiftRegionId, locale: GiftLocale): { q: string; a: string }[] {
  const rules = GIFT_RULES[region];
  const M = (n: number) => money(n, locale);
  const P = (n: number) => percent(n, locale);
  const where = GIFT_REGION_IN[region][locale];
  const agency = GIFT_AGENCY[region][locale];
  const first = giftExample(region, GIFT_EXAMPLES[region][0]!.id);
  const firstLabel = GIFT_EXAMPLES[region][0]!.label[locale];
  const deadline = giftDeadline(rules, locale);
  const pick = (v: Record<GiftLocale, string>) => v[locale];
  /** Madrid's page: two donors (both parents), two self-assessments. */
  const perDonor =
    region === "madrid"
      ? { ca: " Si et donen els dos pares, la Comunitat de Madrid demana dues autoliquidacions, una per donant.", es: " Si te donan los dos padres, la Comunidad de Madrid pide dos autoliquidaciones, una por donante.", en: " If both parents give, the Madrid region asks for two self-assessments, one per donor." }
      : { ca: "", es: "", en: "" };

  const childAnswer = {
    catalonia: pick({
      ca: `Catalunya no té bonificació per a les donacions, però els fills, néts, cònjuge i pares (grups I i II) tenen una tarifa reduïda si la donació és en escriptura pública: el 5 % fins a 200.000 €, el 7 % fins a 600.000 € i el 9 % a partir d'aquí. ${firstLabel}: paga ${M(first.toPay)}. Sense escriptura, ${M(giftExample("catalonia", "atc-2").toPay)}.`,
      es: `Cataluña no tiene bonificación para las donaciones, pero los hijos, nietos, cónyuge y padres (grupos I y II) tienen una tarifa reducida si la donación es en escritura pública: el 5 % hasta 200.000 €, el 7 % hasta 600.000 € y el 9 % a partir de ahí. ${firstLabel}: paga ${M(first.toPay)}. Sin escritura, ${M(giftExample("catalonia", "atc-2").toPay)}.`,
      en: `Catalonia has no rebate on gifts, but children, grandchildren, spouses and parents (groups I and II) get a reduced scale when the gift is in a public deed: 5% up to €200,000, 7% up to €600,000 and 9% above that. ${firstLabel}: pays ${M(first.toPay)}. Without a deed, ${M(giftExample("catalonia", "atc-2").toPay)}.`,
    }),
    madrid: pick({
      ca: `No hi ha reducció per parentiu, però els grups I i II (fills, néts, cònjuge, pares, avis) es bonifiquen el 99 % de la quota. ${firstLabel}: paga ${M(first.toPay)}. En document privat per sobre de 10.000 € es perd la bonificació: ${M(giftExample("madrid", "son-private").toPay)} per 50.000 €.`,
      es: `No hay reducción por parentesco, pero los grupos I y II (hijos, nietos, cónyuge, padres, abuelos) se bonifican el 99 % de la cuota. ${firstLabel}: paga ${M(first.toPay)}. En documento privado por encima de 10.000 € se pierde la bonificación: ${M(giftExample("madrid", "son-private").toPay)} por 50.000 €.`,
      en: `There is no kinship reduction, but groups I and II (children, grandchildren, spouse, parents, grandparents) get 99% off the tax. ${firstLabel}: pays ${M(first.toPay)}. In a private document above €10,000 the rebate is lost: ${M(giftExample("madrid", "son-private").toPay)} on €50,000.`,
    }),
    andalucia: pick({
      ca: `No hi ha reducció per parentiu, però els grups I i II es bonifiquen el 99 % de la quota. ${firstLabel}: paga ${M(first.toPay)}. Fins a 5.000 € en tres anys no cal escriptura; per sobre, en document privat no hi ha bonificació: ${M(giftExample("andalucia", "son-private").toPay)} per 20.000 €.`,
      es: `No hay reducción por parentesco, pero los grupos I y II se bonifican el 99 % de la cuota. ${firstLabel}: paga ${M(first.toPay)}. Hasta 5.000 € en tres años no hace falta escritura; por encima, en documento privado no hay bonificación: ${M(giftExample("andalucia", "son-private").toPay)} por 20.000 €.`,
      en: `There is no kinship reduction, but groups I and II get 99% off the tax. ${firstLabel}: pays ${M(first.toPay)}. Up to €5,000 in three years no deed is needed; above that, in a private document there is no rebate: ${M(giftExample("andalucia", "son-private").toPay)} on €20,000.`,
    }),
    valencia: pick({
      ca: `Un fill de 21 anys o més redueix 100.000 € (de més jove, fins a 156.000 €) i es bonifica el 99 % de la resta de la quota, si la donació és en document públic. ${firstLabel}: paga ${M(first.toPay)}. En document privat no hi ha ni reducció ni bonificació: ${M(giftExample("valencia", "son-private").toPay)} per 50.000 €.`,
      es: `Un hijo de 21 años o más reduce 100.000 € (más joven, hasta 156.000 €) y se bonifica el 99 % del resto de la cuota, si la donación es en documento público. ${firstLabel}: paga ${M(first.toPay)}. En documento privado no hay ni reducción ni bonificación: ${M(giftExample("valencia", "son-private").toPay)} por 50.000 €.`,
      en: `A child aged 21 or over deducts €100,000 (younger, up to €156,000) and gets 99% off the rest of the tax, if the gift is in a public document. ${firstLabel}: pays ${M(first.toPay)}. In a private document there is neither reduction nor rebate: ${M(giftExample("valencia", "son-private").toPay)} on €50,000.`,
    }),
  }[region];

  const notary = {
    catalonia: pick({
      ca: "Per a la tarifa reduïda dels grups I i II, sí: escriptura pública o sentència judicial; si són diners, l'escriptura s'ha de signar dins del mes següent a l'entrega. Per a la reducció del primer habitatge, també (amb la finalitat escrita). Els grups III i IV paguen la tarifa general igualment.",
      es: "Para la tarifa reducida de los grupos I y II, sí: escritura pública o sentencia judicial; si es dinero, la escritura se tiene que firmar dentro del mes siguiente a la entrega. Para la reducción de la primera vivienda, también (con la finalidad escrita). Los grupos III y IV pagan la tarifa general igualmente.",
      en: "For groups I and II's reduced scale, yes: a public deed or a court ruling; for money, the deed must be signed within a month of the handover. The first-home reduction needs it too (with the purpose written in). Groups III and IV pay the general scale either way.",
    }),
    madrid: pick({
      ca: "Fins a 10.000 € de la mateixa persona en tres anys, n'hi ha prou amb un document privat; per sobre, la bonificació i la reducció per diners per a l'habitatge exigeixen document públic, signat abans que acabi el termini de declaració. Fins a 1.000 € en tres anys no cal ni declarar-ho (llevat de béns registrables).",
      es: "Hasta 10.000 € de la misma persona en tres años basta un documento privado; por encima, la bonificación y la reducción por dinero para la vivienda exigen documento público, firmado antes de que acabe el plazo de declaración. Hasta 1.000 € en tres años no hace falta ni declararlo (salvo bienes registrables).",
      en: "Up to €10,000 from the same person in three years a private document is enough; above that, the rebate and the cash-for-home reduction need a public document, signed before the filing period ends. Up to €1,000 in three years there is not even anything to file (except registrable assets).",
    }),
    andalucia: pick({
      ca: "Des de l'1 de gener de 2026, només per sobre de 5.000 € de la mateixa persona en tres anys: llavors la bonificació exigeix document públic amb l'entrega alhora (amb diners, signat dins del mes següent). Fins al 2025 calia sempre.",
      es: "Desde el 1 de enero de 2026, solo por encima de 5.000 € de la misma persona en tres años: entonces la bonificación exige documento público con la entrega simultánea (con dinero, firmado dentro del mes siguiente). Hasta 2025 hacía falta siempre.",
      en: "Since 1 January 2026, only above €5,000 from the same person in three years: then the rebate needs a public document with the asset handed over at once (for money, signed within the following month). Until 2025 it was always required.",
    }),
    valencia: pick({
      ca: "Sí, per a la reducció i per a la bonificació: document públic, o formalitzar-la així dins del termini de declaració. Fins a 4.000 € en diners o un vehicle en tres anys, valen documents signats digitalment amb un servei de confiança qualificat.",
      es: "Sí, para la reducción y para la bonificación: documento público, o formalizarla así dentro del plazo de declaración. Hasta 4.000 € en dinero o un vehículo en tres años, valen documentos firmados digitalmente con un servicio de confianza cualificado.",
      en: "Yes, for the reduction and for the rebate: a public document, or the gift put in one within the filing period. Up to €4,000 in money or a vehicle in three years, documents signed digitally through a qualified trust service will do.",
    }),
  }[region];

  const cash = {
    catalonia: pick({
      ca: "El Codi tributari no hi afegeix cap requisit d'origen dels fons; sí que demana l'escriptura dins del mes següent a l'entrega per tenir la tarifa reduïda. L'ATC compta la data de la transferència com la de l'entrega dels diners.",
      es: "El Código tributario no añade ningún requisito de origen de los fondos; sí pide la escritura dentro del mes siguiente a la entrega para tener la tarifa reducida. La ATC cuenta la fecha de la transferencia como la de la entrega del dinero.",
      en: "The Catalan Tax Code adds no origin-of-funds requirement; it does ask for the deed within a month of the handover for the reduced scale. The ATC counts the transfer date as the day the money is handed over.",
    }),
    madrid: pick({
      ca: "La bonificació només s'aplica si l'origen dels diners està justificat i el document de la donació ho diu. La Comunitat de Madrid demana el justificant bancari de la transferència amb l'autoliquidació.",
      es: "La bonificación solo se aplica si el origen del dinero está justificado y el documento de la donación lo dice. La Comunidad de Madrid pide el justificante bancario de la transferencia con la autoliquidación.",
      en: "The rebate only applies if the origin of the money is justified and the gift document says so. The Madrid region asks for the bank transfer receipt with the self-assessment.",
    }),
    andalucia: pick({
      ca: "Per sobre de 5.000 €, l'escriptura s'ha de signar dins del mes següent a l'entrega i ha de dir d'on surten els diners, que s'ha de poder justificar. Si són entregues a terminis, una sola escriptura amb totes.",
      es: "Por encima de 5.000 €, la escritura se tiene que firmar dentro del mes siguiente a la entrega y tiene que decir de dónde sale el dinero, que se tiene que poder justificar. Si son entregas a plazos, una sola escritura con todas.",
      en: "Above €5,000, the deed must be signed within a month of the handover and say where the money comes from, which must be provable. For instalments, one single deed listing them all.",
    }),
    valencia: pick({
      ca: "La reducció i la bonificació exigeixen justificar l'origen dels fons, que el document ho digui i que identifiqui el mitjà de l'entrega (la transferència, per exemple).",
      es: "La reducción y la bonificación exigen justificar el origen de los fondos, que el documento lo diga y que identifique el medio de la entrega (la transferencia, por ejemplo).",
      en: "The reduction and the rebate need the origin of the funds justified, stated in the document, with how the money is handed over (a bank transfer, for instance).",
    }),
  }[region];

  const home = {
    catalonia: pick({
      ca: `Sí, per al primer habitatge habitual d'un descendent de 36 anys o menys: el 95 % dels diners (o del valor de l'habitatge), fins a 60.000 € de reducció (120.000 € amb discapacitat del 65 %), amb escriptura que ho digui, renda fins a 36.000 € i compra en sis mesos. ${GIFT_EXAMPLES.catalonia[3]!.label[locale]}: paga ${M(giftExample("catalonia", "atc-4").toPay)}.`,
      es: `Sí, para la primera vivienda habitual de un descendiente de 36 años o menos: el 95 % del dinero (o del valor de la vivienda), hasta 60.000 € de reducción (120.000 € con discapacidad del 65 %), con escritura que lo diga, renta de hasta 36.000 € y compra en seis meses. ${GIFT_EXAMPLES.catalonia[3]!.label[locale]}: paga ${M(giftExample("catalonia", "atc-4").toPay)}.`,
      en: `Yes, for the first habitual home of a descendant aged 36 or under: 95% of the money (or of the home's value), up to a €60,000 reduction (€120,000 with a 65% disability), with a deed saying so, income up to €36,000 and the purchase within six months. ${GIFT_EXAMPLES.catalonia[3]!.label[locale]}: pays ${M(giftExample("catalonia", "atc-4").toPay)}.`,
    }),
    madrid: pick({
      ca: `Sí, per a diners que els grups I i II o un germà destinen dins d'un any a comprar l'habitatge habitual: el 100 %, fins a 250.000 € comptant tres anys de donacions del mateix donant, amb el destí escrit al document. Filla de 30 anys amb 300.000 €: paga ${M(giftExample("madrid", "daughter-home").toPay)}.`,
      es: `Sí, para dinero que los grupos I y II o un hermano destinan dentro de un año a comprar la vivienda habitual: el 100 %, hasta 250.000 € contando tres años de donaciones del mismo donante, con el destino escrito en el documento. Hija de 30 años con 300.000 €: paga ${M(giftExample("madrid", "daughter-home").toPay)}.`,
      en: `Yes, for money that groups I and II or a sibling spend on buying their habitual home within a year: 100%, up to €250,000 counting three years of gifts from the same donor, with the purpose written in the document. Daughter aged 30 with €300,000: pays ${M(giftExample("madrid", "daughter-home").toPay)}.`,
    }),
    andalucia: pick({
      ca: `Sí: el 99 % dels diners de pares o avis per comprar l'habitatge habitual a Andalusia, o de l'habitatge que et donen, sobre una base de fins a 150.000 € (250.000 € amb discapacitat), si tens menys de 35 anys (o discapacitat) i un patrimoni previ de fins a 402.678,11 €. Filla de 30 anys amb 120.000 €: paga ${M(giftExample("andalucia", "daughter-home").toPay)}.`,
      es: `Sí: el 99 % del dinero de padres o abuelos para comprar la vivienda habitual en Andalucía, o de la vivienda que te donan, sobre una base de hasta 150.000 € (250.000 € con discapacidad), si tienes menos de 35 años (o discapacidad) y un patrimonio previo de hasta 402.678,11 €. Hija de 30 años con 120.000 €: paga ${M(giftExample("andalucia", "daughter-home").toPay)}.`,
      en: `Yes: 99% of money from parents or grandparents to buy the habitual home in Andalusia, or of the home they give you, on a base of up to €150,000 (€250,000 with a disability), if you are under 35 (or disabled) and your prior wealth is up to €402,678.11. Daughter aged 30 with €120,000: pays ${M(giftExample("andalucia", "daughter-home").toPay)}.`,
    }),
    valencia: pick({
      ca: "No n'hi ha cap de general: la llei valenciana només en té una per a diners donats a dones víctimes de violència de gènere per comprar l'habitatge habitual (el 95 %, sobre fins a 60.000 €), que la calculadora no aplica. La reducció per parentiu i la bonificació del 99 % ja cobreixen la majoria de donacions de pares a fills.",
      es: "No hay ninguna general: la ley valenciana solo tiene una para dinero donado a mujeres víctimas de violencia de género para comprar la vivienda habitual (el 95 %, sobre hasta 60.000 €), que la calculadora no aplica. La reducción por parentesco y la bonificación del 99 % ya cubren la mayoría de donaciones de padres a hijos.",
      en: "There is no general one: Valencian law only has one for money given to women victims of gender violence to buy their habitual home (95%, on up to €60,000), which the calculator does not apply. The kinship reduction and the 99% rebate already cover most gifts from parents to children.",
    }),
  }[region];

  const siblingId = region === "andalucia" ? "nephew" : region === "catalonia" ? "atc-6" : "brother";
  const sibling = giftExample(region, siblingId);
  const siblingLabel = GIFT_EXAMPLES[region].find((e) => e.id === siblingId)!.label[locale];
  const siblingRule = {
    catalonia: pick({ ca: "Són del grup III: tarifa general i coeficient 1,5882, sense bonificació.", es: "Son del grupo III: tarifa general y coeficiente 1,5882, sin bonificación.", en: "They are group III: the general scale and a 1.5882 coefficient, with no rebate." }),
    madrid: pick({ ca: "Són del grup III: coeficient 1,5882 i, des de l'1 de juliol de 2025, una bonificació del 50 % (també cunyats, sogres, gendres i joves), amb els mateixos requisits de document.", es: "Son del grupo III: coeficiente 1,5882 y, desde el 1 de julio de 2025, una bonificación del 50 % (también cuñados, suegros, yernos y nueras), con los mismos requisitos de documento.", en: "They are group III: a 1.5882 coefficient and, since 1 July 2025, a 50% rebate (in-laws too), with the same document requirements." }),
    andalucia: pick({ ca: "Són del grup III: coeficient 1,5 i cap bonificació.", es: "Son del grupo III: coeficiente 1,5 y ninguna bonificación.", en: "They are group III: a 1.5 coefficient and no rebate." }),
    valencia: pick({
      ca: `Són del grup III: cap reducció, coeficient 1,5882 i, per als germans, nebots i oncles de sang, una bonificació del 25 % des de l'1 de juny de 2026 (del ${VALENCIA_GIFT_DATES.groupIIIBonusNext} % des de l'1 de juny de 2027). Els parents per afinitat no en tenen.`,
      es: `Son del grupo III: ninguna reducción, coeficiente 1,5882 y, para hermanos, sobrinos y tíos de sangre, una bonificación del 25 % desde el 1 de junio de 2026 (del ${VALENCIA_GIFT_DATES.groupIIIBonusNext} % desde el 1 de junio de 2027). Los parientes por afinidad no la tienen.`,
      en: `They are group III: no reduction, a 1.5882 coefficient and, for blood siblings, nephews, nieces, uncles and aunts, a 25% rebate since 1 June 2026 (${VALENCIA_GIFT_DATES.groupIIIBonusNext}% from 1 June 2027). In-laws get none.`,
    }),
  }[region];

  const simulator = {
    catalonia: pick({
      ca: "No. L'ATC publica onze casos pràctics de donacions, i l'autoliquidació del model 651 es fa amb el seu formulari en línia (cal identificació digital). Aquesta calculadora reprodueix els casos 1 a 8 i 11 al cèntim, però és una estimació.",
      es: "No. La ATC publica once casos prácticos de donaciones, y la autoliquidación del modelo 651 se hace con su formulario en línea (hace falta identificación digital). Esta calculadora reproduce los casos 1 a 8 y 11 al céntimo, pero es una estimación.",
      en: "No. The ATC publishes eleven worked gift cases, and form 651 is filed through its online form (it needs a digital ID). This calculator reproduces cases 1 to 8 and 11 to the cent, but it is an estimate.",
    }),
    madrid: pick({
      ca: "No. La Comunitat de Madrid fa el càlcul dins de l'autoliquidació de l'Oficina Virtual Tributària i la seva pàgina en dona dos exemples, que aquesta calculadora reprodueix al cèntim (316,21 € i 16,90 €). És una estimació.",
      es: "No. La Comunidad de Madrid hace el cálculo dentro de la autoliquidación de la Oficina Virtual Tributaria y su página da dos ejemplos, que esta calculadora reproduce al céntimo (316,21 € y 16,90 €). Es una estimación.",
      en: "No. The Madrid region works it out inside the self-assessment of its Oficina Virtual Tributaria, and its page gives two examples, which this calculator reproduces to the cent (€316.21 and €16.90). It is an estimate.",
    }),
    andalucia: pick({
      ca: "No. El càlcul oficial és el model 651, amb l'ajuda de la Junta d'Andalusia; la seva guia de l'impost de donacions té exemples que aquesta calculadora reprodueix (126,20 € i 14,73 €). És una estimació.",
      es: "No. El cálculo oficial es el modelo 651, con la ayuda de la Junta de Andalucía; su guía del impuesto de donaciones tiene ejemplos que esta calculadora reproduce (126,20 € y 14,73 €). Es una estimación.",
      en: "No. The official calculation is form 651, with the Junta de Andalucía's help; its gift tax guide has examples this calculator reproduces (€126.20 and €14.73). It is an estimate.",
    }),
    valencia: pick({
      ca: "No. L'ATV té simuladors del valor dels immobles i dels vehicles, però no de l'impost: el càlcul oficial el fa el programa d'ajuda del model 651. Aquesta calculadora és una estimació.",
      es: "No. La ATV tiene simuladores del valor de los inmuebles y de los vehículos, pero no del impuesto: el cálculo oficial lo hace el programa de ayuda del modelo 651. Esta calculadora es una estimación.",
      en: "No. The ATV has simulators for the value of property and vehicles, not for the tax: the official calculation is form 651's help program. This calculator is an estimate.",
    }),
  }[region];

  return {
    ca: [
      { q: `Quant paga un fill per una donació dels pares ${where}?`, a: childAnswer },
      { q: "Cal anar al notari?", a: notary },
      { q: "I si són diners en efectiu o per transferència?", a: cash },
      { q: "Hi ha reducció si els diners són per comprar un habitatge?", a: home },
      { q: "Quant paga un germà o un nebot?", a: `${siblingRule} ${siblingLabel}: paga ${M(sibling.toPay)}, el ${P(sibling.effectiveRate * 100)} del que rep.` },
      { q: "Quin termini hi ha per pagar?", a: `${deadline[0]!.toUpperCase()}${deadline.slice(1)}, sense pròrroga (la pròrroga és només per a les herències). Es presenta a ${agency} amb el model 651, un per a cada donatari.${perDonor.ca}` },
      { q: `Quan es paga ${where} i no en una altra comunitat?`, a: "Si la donació és d'un immoble, a la comunitat on és l'immoble. Si són diners o altres béns, a la comunitat on viu qui rep la donació (on ha viscut més dies dels cinc anys anteriors), si viu a Espanya (Llei 22/2009, arts. 28 i 32). Si qui rep no viu a Espanya, l'impost el gestiona l'Agència Tributària de l'Estat." },
      { q: "Es sumen les donacions anteriors?", a: "Sí: les donacions de la mateixa persona en els tres anys anteriors es tracten com una sola per calcular el tipus mitjà, que s'aplica a la donació d'ara (Llei 29/1987, art. 30). Escriu-les al camp de donacions anteriors." },
      { q: "Hi ha un simulador oficial?", a: simulator },
    ],
    es: [
      { q: `¿Cuánto paga un hijo por una donación de sus padres ${where}?`, a: childAnswer },
      { q: "¿Hace falta ir al notario?", a: notary },
      { q: "¿Y si es dinero en efectivo o por transferencia?", a: cash },
      { q: "¿Hay reducción si el dinero es para comprar una vivienda?", a: home },
      { q: "¿Cuánto paga un hermano o un sobrino?", a: `${siblingRule} ${siblingLabel}: paga ${M(sibling.toPay)}, el ${P(sibling.effectiveRate * 100)} de lo que recibe.` },
      { q: "¿Qué plazo hay para pagar?", a: `${deadline[0]!.toUpperCase()}${deadline.slice(1)}, sin prórroga (la prórroga es solo para las herencias). Se presenta en ${agency} con el modelo 651, uno por cada donatario.${perDonor.es}` },
      { q: `¿Cuándo se paga ${where} y no en otra comunidad?`, a: "Si la donación es de un inmueble, en la comunidad donde está el inmueble. Si es dinero u otros bienes, en la comunidad donde vive quien recibe la donación (donde ha vivido más días de los cinco años anteriores), si vive en España (Ley 22/2009, arts. 28 y 32). Si quien recibe no vive en España, el impuesto lo gestiona la Agencia Tributaria del Estado." },
      { q: "¿Se suman las donaciones anteriores?", a: "Sí: las donaciones de la misma persona en los tres años anteriores se tratan como una sola para calcular el tipo medio, que se aplica a la donación de ahora (Ley 29/1987, art. 30). Escríbelas en el campo de donaciones anteriores." },
      { q: "¿Hay un simulador oficial?", a: simulator },
    ],
    en: [
      { q: `How much tax does a child pay on a gift from their parents ${where}?`, a: childAnswer },
      { q: "Do I need a notary?", a: notary },
      { q: "What if it is cash or a bank transfer?", a: cash },
      { q: "Is there a reduction if the money is for buying a home?", a: home },
      { q: "How much does a brother, sister, nephew or niece pay?", a: `${siblingRule} ${siblingLabel}: pays ${M(sibling.toPay)}, ${P(sibling.effectiveRate * 100)} of what they receive.` },
      { q: "What is the deadline?", a: `${deadline[0]!.toUpperCase()}${deadline.slice(1)}, with no extension (extensions are only for inheritances). It is filed with ${agency} on form 651, one per donee.${perDonor.en}` },
      { q: `When is it paid ${where} rather than in another region?`, a: "For a property, in the region where the property is. For money and other assets, in the region where the person receiving the gift lives (where they lived the most days of the five years before), if they live in Spain (Law 22/2009, arts. 28 and 32). If the donee does not live in Spain, the State Tax Agency handles it." },
      { q: "Are earlier gifts added in?", a: "Yes: gifts from the same person in the three years before count as one to work out the average rate, which applies to the gift now (Law 29/1987, art. 30). Enter them in the earlier-gifts field." },
      { q: "Is there an official simulator?", a: simulator },
    ],
  }[locale];
}
