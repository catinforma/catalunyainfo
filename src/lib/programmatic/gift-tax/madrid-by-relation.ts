import { money } from "@/lib/programmatic/inheritance-tax/copy";

import type { GiftLocale } from "./copy";
import { calculateGiftOk, giftInputOf, type GiftOk } from "./engine";
import { GIFT_RULES } from "./page";

/**
 * "¿Cuánto se paga por una donación en Madrid? Según el parentesco" (27 Nov
 * 2026): the same money gifts through the Madrid engine for a son, a brother
 * (the whole of group III gets the same 50 % since 1 July 2025) and a friend
 * (group IV, no rebate). Queries (GSC, 28 days to 26 Nov): "impuesto
 * donaciones madrid amigos" 2 at 10, "cuanto se paga por una donación de
 * 10.000 euros" 1 at 54, "impuesto de donaciones comunidad de madrid" 3 at
 * 55; the page sits at 10.8 with 1 click in 254 impressions (7 days).
 *
 * Re-read on 27 Nov 2026 (curl + grep), the figures already in
 * MADRID_GIFT_RULES: BOE consolidated text BOCM-m-2010-90068 ("Última
 * actualización publicada el 10/07/2026") art. 25.2 b) «aplicarán una
 * bonificación del 99 por ciento en la cuota tributaria derivada de las
 * mismas», «Los sujetos pasivos incluidos en el grupo III … aplicarán una
 * bonificación del 50 por ciento», «se formalice en documento público cuando
 * su base imponible sea superior a 10.000 euros»; comunidad.madrid
 * "Donaciones" ("Última actualización: 01 julio 2026"): «colaterales de 2º y
 * 3º grado, ascendientes y descendientes por afinidad (hermanos, tíos ,
 * sobrinos, hijastro, yerno, nuera....) se aplicará una bonificación del 50%
 * de la cuota tributaria», and private documents «por una cuantía superior a
 * 1.000,01 € y hasta 10.000 €» keep the 99 % for groups I and II. The
 * gift-tax RULES_UNTIL guard (tests/gift-tax.test.ts) covers these rules.
 * Money with the origin of the funds shown, no earlier gifts, first band of
 * prior wealth. Pure.
 */

export const MADRID_AMOUNTS = [10_000, 30_000, 50_000, 100_000] as const;

export interface MadridRelationRow {
  amount: number;
  child: GiftOk;
  sibling: GiftOk;
  friend: GiftOk;
}

export function madridRelationRows(): MadridRelationRow[] {
  const run = (relation: "child" | "sibling" | "unrelated", age: number, amount: number) => calculateGiftOk(GIFT_RULES.madrid, giftInputOf({ relation, age, amount }));
  return MADRID_AMOUNTS.map((amount) => ({ amount, child: run("child", 35, amount), sibling: run("sibling", 50, amount), friend: run("unrelated", 40, amount) }));
}

export interface MadridRelationCopy {
  title: string;
  intro: string;
  cols: [string, string, string, string];
  faq: { q: string; a: string }[];
}

export function madridRelationCopy(locale: GiftLocale): MadridRelationCopy {
  const rows = madridRelationRows();
  const r = (amount: number) => rows.find((x) => x.amount === amount)!;
  const M = (n: number) => money(n, locale);
  const [r10, r30, r50] = [r(10_000), r(30_000), r(50_000)];
  const coef = String(r10.friend.coefficient).replace(".", locale === "en" ? "." : ",");
  if (locale === "es") {
    return {
      title: "¿Cuánto se paga por una donación en Madrid según el parentesco?",
      intro: "Donaciones en dinero con el origen justificado y sin donaciones anteriores del mismo donante. Por encima de 10.000 € (sumando tres años) la bonificación exige documento público; hasta 10.000 € basta un documento privado.",
      cols: ["Donación", "Hijo, nieto, cónyuge o padres (99 %)", "Hermano, sobrino, tío o cuñado (50 %)", "Amigo o sin parentesco"],
      faq: [
        { q: "¿Cuánto se paga por una donación de 10.000 euros en Madrid?", a: `Depende del parentesco: un hijo paga ${M(r10.child.toPay)} (bonificación del 99 %), un hermano o un sobrino ${M(r10.sibling.toPay)} (bonificación del 50 %) y un amigo ${M(r10.friend.toPay)}, sin bonificación. Hasta 10.000 € de la misma persona en tres años basta un documento privado, pero en dinero el origen de los fondos tiene que estar justificado y escrito en el documento.` },
        { q: "¿Cuánto paga un amigo por una donación en Madrid?", a: `Un amigo, o cualquiera sin parentesco, es del grupo IV: no tiene reducción ni bonificación, salvo el 100 % si todo lo que recibe de ti en tres años no pasa de 1.000 €, y la cuota se multiplica por ${coef}. Por 10.000 € paga ${M(r10.friend.toPay)}; por 30.000 €, ${M(r30.friend.toPay)}, y por 50.000 €, ${M(r50.friend.toPay)}. Un hijo pagaría ${M(r50.child.toPay)} por esos 50.000 €.` },
      ],
    };
  }
  if (locale === "ca") {
    return {
      title: "Quant es paga per una donació a Madrid segons el parentiu?",
      intro: "Donacions en diners amb l'origen justificat i sense donacions anteriors del mateix donant. Per sobre de 10.000 € (sumant tres anys) la bonificació exigeix document públic; fins a 10.000 € n'hi ha prou amb un document privat.",
      cols: ["Donació", "Fill, nét, cònjuge o pares (99 %)", "Germà, nebot, oncle o cunyat (50 %)", "Amic o sense parentiu"],
      faq: [
        { q: "Quant es paga per una donació de 10.000 euros a Madrid?", a: `Depèn del parentiu: un fill paga ${M(r10.child.toPay)} (bonificació del 99 %), un germà o un nebot ${M(r10.sibling.toPay)} (bonificació del 50 %) i un amic ${M(r10.friend.toPay)}, sense bonificació. Fins a 10.000 € de la mateixa persona en tres anys n'hi ha prou amb un document privat, però en diners l'origen dels fons ha d'estar justificat i escrit al document.` },
        { q: "Quant paga un amic per una donació a Madrid?", a: `Un amic, o qualsevol persona sense parentiu, és del grup IV: no té reducció ni bonificació, llevat del 100 % si tot el que rep de tu en tres anys no passa de 1.000 €, i la quota es multiplica per ${coef}. Per 10.000 € paga ${M(r10.friend.toPay)}; per 30.000 €, ${M(r30.friend.toPay)}, i per 50.000 €, ${M(r50.friend.toPay)}. Un fill pagaria ${M(r50.child.toPay)} per aquests 50.000 €.` },
      ],
    };
  }
  return {
    title: "How much gift tax in Madrid, by relationship?",
    intro: "Money gifts with the origin of the funds shown and no earlier gifts from the same donor. Above €10,000 (adding up three years) the rebate needs a public document; up to €10,000 a private document is enough.",
    cols: ["Gift", "Child, grandchild, spouse or parents (99%)", "Sibling, nephew or niece, uncle or aunt, in-law (50%)", "Friend or unrelated"],
    faq: [
      { q: "How much tax on a €10,000 gift in Madrid?", a: `It depends on the relationship: a child pays ${M(r10.child.toPay)} (99% rebate), a brother, sister, nephew or niece ${M(r10.sibling.toPay)} (50% rebate) and a friend ${M(r10.friend.toPay)}, with no rebate. Up to €10,000 from the same person in three years a private document is enough, but for money the origin of the funds must be shown and written in the document.` },
      { q: "How much gift tax does a friend pay in Madrid?", a: `A friend, or anyone unrelated, is group IV: no reduction and no rebate, except 100% if everything they receive from you in three years stays at or below €1,000, and the tax is multiplied by ${coef}. On €10,000 they pay ${M(r10.friend.toPay)}; on €30,000, ${M(r30.friend.toPay)}; on €50,000, ${M(r50.friend.toPay)}. A child would pay ${M(r50.child.toPay)} on the same €50,000.` },
    ],
  };
}
