import { money } from "@/lib/programmatic/inheritance-tax/copy";

import type { GiftLocale } from "./copy";
import { calculateGiftOk, giftInputOf, type GiftInput } from "./engine";
import { GIFT_RULES } from "./page";

/**
 * "Comunidad Valenciana o Cataluña: la misma donación" (26 Nov 2026): the same
 * gifts through both communities' engines (Ley valenciana 13/1997 and Llei
 * catalana 19/2010, as GIFT_RULES holds them, read 19 Nov 2026), for the
 * Valencia page. Queries (GSC, 28 days to 25 Nov): "donación comunidad
 * valenciana 100.000 euros" 2 at 17.5, "impuesto donaciones comunidad
 * valenciana 2026" 3 at 7.3, "donaciones entre hermanos comunidad valenciana"
 * 1 at 42; the page sits at 6.6 with no clicks. Money gifts in a public deed
 * with the origin shown, no earlier gifts, first band of prior wealth.
 * Where the tax is due: money in the donee's community of residence (the
 * page's "otras comunidades" section). Pure.
 */

export interface CompareCase {
  id: string;
  label: Record<GiftLocale, string>;
  input: GiftInput;
}

export const COMPARE_CASES: readonly CompareCase[] = [
  { id: "son-100k", label: { es: "Hijo de 30 años, 100.000 €", ca: "Fill de 30 anys, 100.000 €", en: "Son aged 30, €100,000" }, input: giftInputOf({ relation: "child", age: 30, amount: 100_000 }) },
  { id: "son-300k", label: { es: "Hijo de 30 años, 300.000 €", ca: "Fill de 30 anys, 300.000 €", en: "Son aged 30, €300,000" }, input: giftInputOf({ relation: "child", age: 30, amount: 300_000 }) },
  { id: "grandchild-60k", label: { es: "Nieto de 25 años, 60.000 €", ca: "Nét de 25 anys, 60.000 €", en: "Grandchild aged 25, €60,000" }, input: giftInputOf({ relation: "grandchild", age: 25, amount: 60_000 }) },
  { id: "brother-100k", label: { es: "Hermano de 60 años, 100.000 €", ca: "Germà de 60 anys, 100.000 €", en: "Brother aged 60, €100,000" }, input: giftInputOf({ relation: "sibling", age: 60, amount: 100_000 }) },
];

export interface CompareRow {
  id: string;
  label: Record<GiftLocale, string>;
  valencia: number;
  catalonia: number;
}

export function compareRows(): CompareRow[] {
  return COMPARE_CASES.map((c) => ({
    id: c.id,
    label: c.label,
    valencia: calculateGiftOk(GIFT_RULES.valencia, c.input).toPay,
    catalonia: calculateGiftOk(GIFT_RULES.catalonia, c.input).toPay,
  }));
}

export interface CompareCopy {
  title: string;
  intro: string;
  cols: [string, string, string];
  faq: { q: string; a: string }[];
}

export function compareCopy(locale: GiftLocale): CompareCopy {
  const rows = compareRows();
  const r = (id: string) => rows.find((x) => x.id === id)!;
  const M = (n: number) => money(n, locale);
  const s100 = r("son-100k");
  const s300 = r("son-300k");
  const b = r("brother-100k");
  if (locale === "es") {
    return {
      title: "Comunidad Valenciana o Cataluña: la misma donación",
      intro: "Las mismas donaciones en dinero, en escritura pública y con el origen justificado, calculadas con las normas de cada comunidad. El dinero tributa donde vive quien lo recibe, así que quien vive en Cataluña paga con las normas catalanas aunque los padres vivan en la Comunidad Valenciana.",
      cols: ["Donación", "Comunidad Valenciana", "Cataluña"],
      faq: [
        { q: "¿Cuánto se paga por donar 100.000 euros a un hijo en la Comunidad Valenciana?", a: `${M(s100.valencia)} si el hijo tiene 21 años o más, la donación se hace en documento público y el origen del dinero consta en él: la reducción por parentesco es de 100.000 €, así que no queda base. Por encima, el 99 % de bonificación: 300.000 € pagan ${M(s300.valencia)}. Sin documento público no hay reducción ni bonificación.` },
        { q: "¿Se paga menos por una donación en la Comunidad Valenciana o en Cataluña?", a: `De padres a hijos, en la Comunidad Valenciana: 100.000 € a un hijo de 30 años pagan ${M(s100.valencia)} allí y ${M(s100.catalonia)} en Cataluña (tarifa reducida del 5 % con escritura); 300.000 €, ${M(s300.valencia)} frente a ${M(s300.catalonia)}. Entre hermanos, 100.000 € pagan ${M(b.valencia)} en la Comunidad Valenciana (bonificación del 25 %) y ${M(b.catalonia)} en Cataluña. Cuenta la comunidad donde vive quien recibe el dinero.` },
      ],
    };
  }
  if (locale === "ca") {
    return {
      title: "Comunitat Valenciana o Catalunya: la mateixa donació",
      intro: "Les mateixes donacions en diners, en escriptura pública i amb l'origen justificat, calculades amb les normes de cada comunitat. Els diners tributen on viu qui els rep, de manera que qui viu a Catalunya paga amb les normes catalanes encara que els pares visquin a la Comunitat Valenciana.",
      cols: ["Donació", "Comunitat Valenciana", "Catalunya"],
      faq: [
        { q: "Quant es paga per donar 100.000 euros a un fill a la Comunitat Valenciana?", a: `${M(s100.valencia)} si el fill té 21 anys o més, la donació es fa en document públic i l'origen dels diners hi consta: la reducció per parentiu és de 100.000 €, així que no queda base. Per sobre, el 99 % de bonificació: 300.000 € paguen ${M(s300.valencia)}. Sense document públic no hi ha reducció ni bonificació.` },
        { q: "Es paga menys per una donació a la Comunitat Valenciana o a Catalunya?", a: `De pares a fills, a la Comunitat Valenciana: 100.000 € a un fill de 30 anys hi paguen ${M(s100.valencia)} i ${M(s100.catalonia)} a Catalunya (tarifa reduïda del 5 % amb escriptura); 300.000 €, ${M(s300.valencia)} davant de ${M(s300.catalonia)}. Entre germans, 100.000 € paguen ${M(b.valencia)} a la Comunitat Valenciana (bonificació del 25 %) i ${M(b.catalonia)} a Catalunya. Compta la comunitat on viu qui rep els diners.` },
      ],
    };
  }
  return {
    title: "Valencia region or Catalonia: the same gift",
    intro: "The same money gifts, in a public deed with the origin of the funds shown, worked out under each region's rules. Money is taxed where the recipient lives, so someone living in Catalonia pays under the Catalan rules even if the parents live in the Valencia region.",
    cols: ["Gift", "Valencia region", "Catalonia"],
    faq: [
      { q: "How much tax on a €100,000 gift to a son in the Valencia region?", a: `${M(s100.valencia)} if the son is 21 or over, the gift is made in a public document and the origin of the money is stated in it: the kinship allowance is €100,000, so nothing is left to tax. Above that, a 99% rebate: €300,000 pays ${M(s300.valencia)}. Without a public document there is neither allowance nor rebate.` },
      { q: "Is gift tax lower in the Valencia region or in Catalonia?", a: `From parents to children, in the Valencia region: €100,000 to a son aged 30 pays ${M(s100.valencia)} there and ${M(s100.catalonia)} in Catalonia (the reduced 5% scale with a deed); €300,000, ${M(s300.valencia)} against ${M(s300.catalonia)}. Between siblings, €100,000 pays ${M(b.valencia)} in the Valencia region (25% rebate) and ${M(b.catalonia)} in Catalonia. What counts is the region where the recipient lives.` },
    ],
  };
}
