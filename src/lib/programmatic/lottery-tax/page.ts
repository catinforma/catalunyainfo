import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { LT_LOCALES, lotteryTaxEditions, money, type LtLocale } from "./copy";
import { calculateOk, type LotteryInput } from "./engine";
import { DRAWS, EXEMPT_PER_TICKET, PRESETS, RULES_AS_OF, presetOf, type PresetId } from "./rules";

/**
 * Pure pieces of the lottery prize tax page: titles, the default input, the
 * prize table and the worked examples (all computed by the engine, so the
 * HTML and the calculator always agree), and the sitemap entries.
 */

/** The calculator's first render, on the server: one whole El Gordo décimo. */
export const DEFAULT_PRESET: PresetId = "gordo";

export function presetInput(id: PresetId, played?: number, tickets = 1): LotteryInput {
  const p = presetOf(id);
  const price = DRAWS[p.draw].price;
  return { prize: p.prize, price, played: played ?? price, tickets };
}

/** One whole Gordo décimo, a 5 € share of one, and the AEAT's 100,000 € example: the figures the titles and lead quote. */
export function headline() {
  const gordo = calculateOk(presetInput("gordo"));
  const share5 = calculateOk(presetInput("gordo", 5));
  const second = calculateOk(presetInput("segundo"));
  const third = calculateOk(presetInput("tercero"));
  const grossa = calculateOk(presetInput("grossa-primer"));
  return { gordo, share5, second, third, grossa };
}

export interface LtMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  appName: string;
}

export function lotteryTaxMeta(locale: LtLocale): LtMeta {
  const h = headline();
  const M = (n: number) => money(n, locale);
  return {
    es: {
      title: "Calculadora de premios de lotería: cuánto se queda Hacienda",
      description: `Un décimo del Gordo (${M(h.gordo.total.gross)}) paga ${M(h.gordo.total.withholding)} a Hacienda y cobras ${M(h.gordo.total.net)}. Calcula tu premio o participación: 40.000 € exentos por décimo.`,
      h1: "¿Cuánto se queda Hacienda de un premio de lotería? Calculadora 2026",
      breadcrumb: "Premios de lotería",
      appName: "Calculadora de premios de lotería y Hacienda (gravamen especial, Ley 35/2006)",
    },
    ca: {
      title: "Calculadora de premis de loteria: quant se'n queda Hisenda",
      description: `Un dècim del Gordo (${M(h.gordo.total.gross)}) paga ${M(h.gordo.total.withholding)} a Hisenda i en cobres ${M(h.gordo.total.net)}. Calcula el teu premi o participació: 40.000 € exempts per dècim.`,
      h1: "Quant se'n queda Hisenda d'un premi de loteria? Calculadora 2026",
      breadcrumb: "Premis de loteria",
      appName: "Calculadora de premis de loteria i Hisenda (gravamen especial, Llei 35/2006)",
    },
    en: {
      title: "Spanish lottery prize tax calculator: El Gordo after tax",
      description: `One El Gordo décimo (${M(h.gordo.total.gross)}) pays ${M(h.gordo.total.withholding)} in tax and you keep ${M(h.gordo.total.net)}. Work out your prize or share: €40,000 tax-free per décimo.`,
      h1: "Spanish lottery prize tax: how much you keep from El Gordo",
      breadcrumb: "Lottery prize tax",
      appName: "Spanish lottery prize tax calculator (special levy, Law 35/2006)",
    },
  }[locale];
}

/** Every preset as one whole décimo or ticket, for the server-rendered table. */
export function prizeTable() {
  return PRESETS.map((p) => ({ preset: p, result: calculateOk(presetInput(p.id)) }));
}

/**
 * Round prizes per décimo of 20 €, for the searchers who type the amount
 * ("cuánto se lleva Hacienda de un premio de 50.000 euros", 6.000, 20.000,
 * 30.000: GSC, 28 Oct-24 Nov 2026). Computed by the engine like every table.
 */
export const AMOUNTS_PER_TICKET = [6_000, 20_000, 30_000, 40_000, 50_000, 100_000, 200_000] as const;

export function amountsTable() {
  return AMOUNTS_PER_TICKET.map((prize) => ({ prize, result: calculateOk({ prize, price: 20, played: 20, tickets: 1 }) }));
}

/** The sentence above the table: the amounts people ask about, said in their words. */
export function amountsLead(locale: LtLocale): string {
  const M = (n: number) => money(n, locale);
  const by = (prize: number) => amountsTable().find((a) => a.prize === prize)!.result.total;
  const p6 = by(6_000);
  const p30 = by(30_000);
  const p50 = by(50_000);
  const ex = M(EXEMPT_PER_TICKET);
  return {
    es: `Si te toca un premio de ${M(p50.gross)} en un décimo, Hacienda se queda ${M(p50.withholding)} y cobras ${M(p50.net)}. Con ${M(p30.gross)} o ${M(p6.gross)} por décimo no se queda nada: están por debajo de los ${ex} exentos. Es lo que paga cada décimo de 20 €; si lo compartes, mira «Décimos compartidos».`,
    ca: `Si et toca un premi de ${M(p50.gross)} en un dècim, Hisenda se'n queda ${M(p50.withholding)} i en cobres ${M(p50.net)}. Amb ${M(p30.gross)} o ${M(p6.gross)} per dècim no se'n queda res: són per sota dels ${ex} exempts. És el que paga cada dècim de 20 €; si el comparteixes, mira «Dècims compartits».`,
    en: `If a décimo wins ${M(p50.gross)}, the tax office keeps ${M(p50.withholding)} and you collect ${M(p50.net)}. A prize of ${M(p30.gross)} or ${M(p6.gross)} per décimo pays nothing: it is under the ${ex} tax-free amount. These are the figures for each €20 décimo; if you share it, see "Shared décimos".`,
  }[locale];
}

export type ExampleId = "one-gordo" | "share-5" | "half-second" | "two-gordo" | "third" | "grossa" | "aeat";

/** The worked examples, in the page's order. */
export function examples(): { id: ExampleId; input: LotteryInput; result: ReturnType<typeof calculateOk> }[] {
  const list: [ExampleId, LotteryInput][] = [
    ["one-gordo", presetInput("gordo")],
    ["share-5", presetInput("gordo", 5)],
    ["half-second", presetInput("segundo", 10)],
    ["two-gordo", presetInput("gordo", 20, 2)],
    ["third", presetInput("tercero")],
    ["grossa", presetInput("grossa-primer")],
    // The Agencia Tributaria's own example (notice of 17 Dec 2024): a 100,000 € prize.
    ["aeat", { prize: 100_000, price: 20, played: 20, tickets: 1 }],
  ];
  return list.map(([id, input]) => ({ id, input, result: calculateOk(input) }));
}

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML. */
export function lotteryTaxSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  const e = lotteryTaxEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return LT_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

/** The FAQ, with every figure from the engine (also the FAQPage JSON-LD). */
export function lotteryTaxFaq(locale: LtLocale): { q: string; a: string }[] {
  const h = headline();
  const M = (n: number) => money(n, locale);
  const g = h.gordo.total;
  const s = h.share5.total;
  const billete = calculateOk(presetInput("gordo", 20, 10)).total;
  const two = calculateOk(presetInput("gordo", 20, 2)).total;
  const gr = h.grossa.total;
  // El Niño 2027's first prize (SELAE's Lotería Nacional page, read 31 Oct 2026): the January query, 20 Nov 2026.
  const nino = calculateOk(presetInput("nino-primero")).total;
  const fourth = presetInput("cuarto").prize;
  const fifth = presetInput("quinto").prize;
  const ex = M(EXEMPT_PER_TICKET);
  return {
    es: [
      { q: "¿Cuánto se queda Hacienda del Gordo?", a: `${M(g.withholding)} por décimo: el 20 % de lo que pasa de ${ex} (${M(g.gross)} − ${ex} = ${M(g.base)}). Del décimo del Gordo cobras ${M(g.net)}.` },
      { q: "¿Cuánto cobra un décimo del Gordo?", a: `${M(g.net)} netos de los ${M(g.gross)} del premio. Un billete entero, de diez décimos, cobra ${M(billete.net)}, porque cada décimo tiene sus propios ${ex} exentos.` },
      { q: "¿Cuánto paga a Hacienda una participación de 5 €?", a: `Si juegas 5 € de un décimo de 20 € del Gordo, tienes la cuarta parte: cobras ${M(s.gross)}, de los que ${M(s.exempt)} están exentos, y te retienen ${M(s.withholding)}. Te quedan ${M(s.net)}.` },
      { q: "¿A partir de cuánto se paga a Hacienda por un premio de lotería?", a: `A partir de ${ex} por décimo, y solo por lo que pasa de esa cifra. El cuarto premio (${M(fourth)}), el quinto (${M(fifth)}), la pedrea y el reintegro no pagan nada.` },
      { q: "¿Hay que declarar el premio de la lotería en la Renta?", a: "No. El gravamen se retiene al cobrar el premio y el premio no se integra en la base del IRPF; si te lo han retenido, no tienes que presentar ninguna otra declaración por él." },
      { q: "Si tengo varios décimos premiados, ¿se suman?", a: `No: cada décimo tiene sus propios ${ex} exentos. Dos décimos del Gordo cobran ${M(two.net)} en total y Hacienda retiene ${M(two.withholding)}.` },
      { q: "¿La Grossa de Cap d'Any paga a Hacienda?", a: `Sí, igual: es una lotería de la Generalitat y la ley incluye las de las comunidades autónomas. El primer premio, ${M(gr.gross)} por billete de 10 €, paga ${M(gr.withholding)} y deja ${M(gr.net)}.` },
      { q: "¿Cuánto se queda Hacienda del Niño?", a: `Lo mismo que en Navidad: el 20 % de lo que pasa de ${ex} por décimo. El primer premio del Niño 2027, ${M(nino.gross)} por décimo de 20 €, paga ${M(nino.withholding)} y deja ${M(nino.net)}.` },
    ],
    ca: [
      { q: "Quant se'n queda Hisenda del Gordo?", a: `${M(g.withholding)} per dècim: el 20 % del que passa de ${ex} (${M(g.gross)} − ${ex} = ${M(g.base)}). Del dècim del Gordo en cobres ${M(g.net)}.` },
      { q: "Quant cobra un dècim del Gordo?", a: `${M(g.net)} nets dels ${M(g.gross)} del premi. Un bitllet sencer, de deu dècims, cobra ${M(billete.net)}, perquè cada dècim té els seus propis ${ex} exempts.` },
      { q: "Quant paga a Hisenda una participació de 5 €?", a: `Si jugues 5 € d'un dècim de 20 € del Gordo, en tens la quarta part: cobres ${M(s.gross)}, dels quals ${M(s.exempt)} són exempts, i et retenen ${M(s.withholding)}. Et queden ${M(s.net)}.` },
      { q: "A partir de quant es paga a Hisenda per un premi de loteria?", a: `A partir de ${ex} per dècim, i només pel que passa d'aquesta xifra. El quart premi (${M(fourth)}), el cinquè (${M(fifth)}), la pedrea i el reintegrament no paguen res.` },
      { q: "S'ha de declarar el premi de la loteria a la Renda?", a: "No. El gravamen es reté en cobrar el premi i el premi no s'integra a la base de l'IRPF; si te l'han retingut, no has de presentar cap altra declaració per aquest premi." },
      { q: "Si tinc diversos dècims premiats, se sumen?", a: `No: cada dècim té els seus propis ${ex} exempts. Dos dècims del Gordo cobren ${M(two.net)} en total i Hisenda en reté ${M(two.withholding)}.` },
      { q: "La Grossa de Cap d'Any paga a Hisenda?", a: `Sí, igual: és una loteria de la Generalitat i la llei hi inclou les de les comunitats autònomes. El primer premi, ${M(gr.gross)} per bitllet de 10 €, paga ${M(gr.withholding)} i en deixa ${M(gr.net)}.` },
      { q: "Quant se'n queda Hisenda del Nen (El Niño)?", a: `El mateix que a Nadal: el 20 % del que passa de ${ex} per dècim. El primer premi del Nen 2027, ${M(nino.gross)} per dècim de 20 €, paga ${M(nino.withholding)} i en deixa ${M(nino.net)}.` },
    ],
    en: [
      { q: "How much tax is taken from El Gordo?", a: `${M(g.withholding)} per décimo: 20% of the part above ${ex} (${M(g.gross)} − ${ex} = ${M(g.base)}). You keep ${M(g.net)} from an El Gordo décimo.` },
      { q: "How much does one El Gordo décimo pay after tax?", a: `${M(g.net)} of the ${M(g.gross)} prize. A whole ticket (billete) of ten décimos pays ${M(billete.net)}, because each décimo has its own ${ex} tax-free.` },
      { q: "How much tax does a €5 share (participación) pay?", a: `A €5 stake in a €20 El Gordo décimo is a quarter of it: you win ${M(s.gross)}, ${M(s.exempt)} of it tax-free, and ${M(s.withholding)} is withheld. You keep ${M(s.net)}.` },
      { q: "From what amount is a Spanish lottery prize taxed?", a: `Above ${ex} per décimo, and only on the part above it. The fourth prize (${M(fourth)}), the fifth (${M(fifth)}), the pedrea and the reintegro pay nothing.` },
      { q: "Do I have to declare a lottery prize on my Spanish tax return?", a: "No. The levy is withheld when the prize is paid and the prize is not part of the income tax base; once it has been withheld, there is nothing else to file for it." },
      { q: "If I have several winning décimos, are they added up?", a: `No: each décimo has its own ${ex} tax-free. Two El Gordo décimos pay ${M(two.net)} in all, with ${M(two.withholding)} withheld.` },
      { q: "Is La Grossa de Cap d'Any taxed the same way?", a: `Yes: it is the Catalan government's lottery, and the law covers the regions' lotteries. Its first prize, ${M(gr.gross)} per €10 ticket, pays ${M(gr.withholding)} and leaves ${M(gr.net)}.` },
      { q: "How much tax is taken from El Niño's first prize?", a: `The same as at Christmas: 20% of the part above ${ex} per décimo. El Niño 2027's first prize, ${M(nino.gross)} per €20 décimo, pays ${M(nino.withholding)} and leaves ${M(nino.net)}.` },
    ],
  }[locale];
}
