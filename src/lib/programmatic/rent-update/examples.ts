import { caOfMonth, elDay, euros, monthText, pct, DECIMALS, type RentLocale } from "./copy";
import { computeRentUpdate, defaultExample, type OkResult, type RentSeries } from "./engine";

/**
 * "Cuánto sube mi alquiler" by rent (27 Nov 2026, batch 8J): six rents
 * updated today, run through `computeRentUpdate`, the calculator's own
 * engine, for a housing lease on the IRAV (the default example: signed two
 * years ago, so every cap in force applies) and for a shop on the CPI. Queries
 * (GSC 28 days to 25 Nov): "ipc alquiler" 6 at 59.0, "calcular subida
 * alquiler" 3 at 29.3, "calcular actualizacion renta ipc alquiler" 3 at 22.0,
 * "actualización alquiler" 4 at 63.8. The two questions are built from the
 * same results, so they change with each INE release and with the rules'
 * dates in rules.ts. Pure.
 */

export const EXAMPLE_RENTS = [500, 700, 900, 1100, 1300, 1500] as const;
/** The rent the "how is it calculated" answer works through. */
export const FAQ_RENT = 800;

export interface RentRow {
  rent: number;
  flat: OkResult;
  shop: OkResult;
}

/** Null when today's update cannot be worked out (a release pending, out of range). */
export function rentRows(series: RentSeries, today: string): RentRow[] | null {
  const rows: RentRow[] = [];
  for (const rent of EXAMPLE_RENTS) {
    const input = { ...defaultExample(today), rent };
    const flat = computeRentUpdate(input, series);
    const shop = computeRentUpdate({ ...input, index: "ipc", use: "commercial" }, series);
    if (flat.status !== "ok" || shop.status !== "ok") return null;
    rows.push({ rent, flat, shop });
  }
  return rows;
}

export interface RentExamplesCopy {
  title: string;
  intro: string;
  caption: string;
  cols: [string, string, string];
  cell: (r: OkResult) => string;
  faq: { q: string; a: string }[];
}

export function rentExamplesCopy(locale: RentLocale, series: RentSeries, today: string): RentExamplesCopy | null {
  const rows = rentRows(series, today);
  const faqFlat = computeRentUpdate({ ...defaultExample(today), rent: FAQ_RENT }, series);
  const faqShop = computeRentUpdate({ ...defaultExample(today), rent: FAQ_RENT, index: "ipc", use: "commercial" }, series);
  if (!rows || faqFlat.status !== "ok" || faqShop.status !== "ok" || !faqShop.agreed.source) return null;
  const e = (x: number) => euros(x, locale);
  // "2 %", "4,9 %", "2.57%": two decimals at most, trailing zeros dropped.
  const p = (x: number) =>
    pct(x, 2, locale)
      .replace(/([.,]\d*?)0+(\s?%)$/, "$1$2")
      .replace(/[.,](\s?%)$/, "$1");
  const ipc = faqShop.agreed.source;
  const ipcV = pct(ipc.value, DECIMALS.ipc, locale);
  const day = elDay(today, locale);
  const ipcOf = locale === "ca" ? `l'IPC ${caOfMonth(ipc.month)}` : locale === "es" ? `el IPC de ${monthText(ipc.month, "es")}` : `the CPI for ${monthText(ipc.month, "en")}`;
  const cell = (r: OkResult) => `${e(r.newRent)} (+${e(r.monthly)}, ${p(r.percent)})`;
  const factor = (1 + ipc.value / 100).toLocaleString(locale === "en" ? "en-GB" : "es-ES", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const rent = e(FAQ_RENT);
  const rentQ = locale === "en" ? `€${FAQ_RENT}` : `${FAQ_RENT} €`;
  if (locale === "es") {
    return {
      title: "Cuánto sube tu alquiler hoy según lo que pagas",
      intro: `Con la misma cuenta que la calculadora, para una actualización hoy, ${day}: vivienda con un contrato que dice IRAV (firmado hace dos años) y local de negocio con un contrato que dice IPC (${ipcOf}: ${ipcV}).`,
      caption: `Renta nueva al mes si el contrato se actualiza ${day}`,
      cols: ["Renta actual", "Vivienda", "Local de negocio (IPC)"],
      cell,
      faq: [
        {
          q: `¿Cuánto sube un alquiler de ${rentQ} este año?`,
          a: `Si es una vivienda y el contrato se actualiza hoy, ${day}, pasa a ${e(faqFlat.newRent)} al mes (+${e(faqFlat.monthly)}, un ${p(faqFlat.percent)}), salvo un nuevo pacto con el casero. En un local de negocio con un contrato que dice IPC, a ${e(faqShop.newRent)} (+${e(faqShop.monthly)}).`,
        },
        {
          q: "¿Cómo se calcula la subida del alquiler con el IPC?",
          a: `Se multiplica la renta por 1 más el IPC del último mes publicado el día de la actualización: hoy, ${ipcOf}, ${ipcV}, así que ${rent} × ${factor} = ${e(faqShop.newRent)}. Es lo que se aplica a un local; en una vivienda manda el límite más bajo de los que están en vigor, y la misma renta queda en ${e(faqFlat.newRent)}.`,
        },
      ],
    };
  }
  if (locale === "ca") {
    return {
      title: "Quant puja el teu lloguer avui segons el que pagues",
      intro: `Amb el mateix càlcul que la calculadora, per a una actualització avui, ${day}: habitatge amb un contracte que diu IRAV (signat fa dos anys) i local de negoci amb un contracte que diu IPC (${ipcOf}: ${ipcV}).`,
      caption: `Renda nova al mes si el contracte s'actualitza ${day}`,
      cols: ["Renda actual", "Habitatge", "Local de negoci (IPC)"],
      cell,
      faq: [
        {
          q: `Quant puja un lloguer de ${rentQ} aquest any?`,
          a: `Si és un habitatge i el contracte s'actualitza avui, ${day}, passa a ${e(faqFlat.newRent)} al mes (+${e(faqFlat.monthly)}, un ${p(faqFlat.percent)}), tret d'un nou pacte amb el propietari. En un local de negoci amb un contracte que diu IPC, a ${e(faqShop.newRent)} (+${e(faqShop.monthly)}).`,
        },
        {
          q: "Com es calcula la pujada del lloguer amb l'IPC?",
          a: `Es multiplica la renda per 1 més l'IPC de l'últim mes publicat el dia de l'actualització: avui, ${ipcOf}, ${ipcV}, de manera que ${rent} × ${factor} = ${e(faqShop.newRent)}. És el que s'aplica a un local; en un habitatge mana el límit més baix dels que són vigents, i la mateixa renda queda en ${e(faqFlat.newRent)}.`,
        },
      ],
    };
  }
  return {
    title: "How much your rent goes up today, by what you pay",
    intro: `The calculator's own sums, for an update today, ${day.replace(/^on /, "")}: a home whose lease says IRAV (signed two years ago) and a shop whose lease says CPI (${ipcOf}: ${ipcV}).`,
    caption: `New monthly rent if the lease is updated ${day}`,
    cols: ["Current rent", "Home", "Shop or office (CPI)"],
    cell,
    faq: [
      {
        q: `How much does a ${rentQ} rent go up this year in Spain?`,
        a: `For a home whose lease is updated today, ${day.replace(/^on /, "")}, it becomes ${e(faqFlat.newRent)} a month (+${e(faqFlat.monthly)}, ${p(faqFlat.percent)}), unless you agree something new with the landlord. For a shop whose lease says CPI, ${e(faqShop.newRent)} (+${e(faqShop.monthly)}).`,
      },
      {
        q: "How is a rent increase worked out with the CPI?",
        a: `Multiply the rent by 1 plus the CPI of the last month published on the update day: today, ${ipcOf}, ${ipcV}, so ${rent} × ${factor} = ${e(faqShop.newRent)}. That is what a shop pays; for a home the lowest cap in force applies, and the same rent stays at ${e(faqFlat.newRent)}.`,
      },
    ],
  };
}
