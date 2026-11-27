import { ymText, type RaLocale } from "./copy";
import { addMonths, ordinaryDate, type OrdinaryDate } from "./engine";
import { FINAL_YEAR, phaseInRow, toMonths, ym, type YM } from "./rules";

/**
 * "¿A qué edad me jubilo con X años cotizados?" (27 Nov 2026, batch 8J):
 * the ordinary age by the years contributed on the 65th birthday, for
 * someone who turns 65 in 2026 and someone who turns 65 in 2027 or later,
 * from `ordinaryDate`, the calculator's own function (DT 7ª LGSS table in
 * rules.ts), assuming contributions go on after 65 (the calculator's
 * default). Queries (GSC 28 days to 25 Nov): "edad de jubilación" 10 at 13.3,
 * "jubilacion con 39 años cotizados" 2 at 18.0, "años cotizados para
 * jubilarse a los 65" 1 at 11.0, "jubilacion 67 años" 2 at 34.0. The years
 * are fixed by the law (2027 is the table's last row), so nothing here goes
 * stale. Pure.
 */

export const CONTRIBUTED_AT_65: readonly YM[] = [ym(35), ym(37), ym(38), ym(38, 3), ym(38, 6), ym(39), ym(40)];
/** Two people turning 65 on 1 March: in 2026 and in the final row's first year. */
export const BIRTHS = { y2026: "1961-03-01", y2027: `${FINAL_YEAR - 65}-03-01` } as const;

export interface ByContributionRow {
  at65: YM;
  y2026: OrdinaryDate;
  y2027: OrdinaryDate;
}

function at(birth: string, at65: YM): OrdinaryDate {
  // The anchor is the 65th birthday, with `at65` contributed that day, growing after it.
  const anchor = `${Number(birth.slice(0, 4)) + 65}${birth.slice(4)}`;
  return ordinaryDate(birth, { anchor, base: toMonths(at65), grows: true });
}

export function byContributionRows(): ByContributionRow[] {
  return CONTRIBUTED_AT_65.map((at65) => ({ at65, y2026: at(BIRTHS.y2026, at65), y2027: at(BIRTHS.y2027, at65) }));
}

export interface ByContributionCopy {
  title: string;
  intro: string;
  caption: string;
  cols: [string, string, string];
  faq: { q: string; a: string }[];
}

export function byContributionCopy(locale: RaLocale): ByContributionCopy {
  const Y = (p: YM) => ymText(p, locale);
  const r26 = phaseInRow(2026);
  const r27 = phaseInRow(FINAL_YEAR);
  const rows = byContributionRows();
  const r38 = rows.find((r) => toMonths(r.at65) === toMonths(ym(38)))!;
  const r35 = rows[0]!;
  const yReach = addMonths(BIRTHS.y2026, toMonths(r26.age)).slice(0, 4);
  if (locale === "es") {
    return {
      title: "¿A qué edad me jubilo según los años cotizados?",
      intro: `Edad ordinaria, sin recorte, según lo que lleves cotizado el día que cumples 65 y suponiendo que sigues cotizando después, con la misma función que la calculadora. Si llegas a ${Y(r27.threshold)} cotizados entre los 65 y los ${Y(r27.age)}, te jubilas ese día. Cuenta la edad del año en que la alcanzas: con ${Y(r35.at65)} cotizados a los 65 en 2026, los ${Y(r26.age)} llegan en ${yReach}, cuando ya se piden ${Y(r27.age)}.`,
      caption: "Edad ordinaria de jubilación según lo cotizado al cumplir 65",
      cols: ["Cotizado al cumplir 65", "Si cumples 65 en 2026", "Si cumples 65 en 2027 o después"],
      faq: [
        {
          q: "¿Me puedo jubilar a los 65 con 39 años cotizados?",
          a: `Sí, sin recorte: desde 2027 basta con ${Y(r27.threshold)} cotizados al cumplir 65, y en 2026 con ${Y(r26.threshold)}. Con menos, la edad ordinaria es ${Y(r27.age)} (${Y(r26.age)} en 2026), salvo que llegues antes a esos años cotizados.`,
        },
        {
          q: "¿Cuántos años hay que cotizar para jubilarse a los 65?",
          a: `${Y(r27.threshold)} si cumples 65 en 2027 o después; ${Y(r26.threshold)} si los cumples en 2026. Con ${Y(r38.at65)} cotizados a los 65 y siguiendo de alta, en 2027 te jubilas a los ${Y(r38.y2027.age)}, el día que completas ${Y(r27.threshold)}. Para cobrar alguna pensión de jubilación, el mínimo son 15 años.`,
        },
      ],
    };
  }
  if (locale === "ca") {
    return {
      title: "A quina edat em jubilo segons els anys cotitzats?",
      intro: `Edat ordinària, sense retallada, segons el que portis cotitzat el dia que fas 65 anys i suposant que continues cotitzant després, amb la mateixa funció que la calculadora. Si arribes a ${Y(r27.threshold)} cotitzats entre els 65 i els ${Y(r27.age)}, et jubiles aquell dia. Compta l'edat de l'any en què l'assoleixes: amb ${Y(r35.at65)} cotitzats als 65 el 2026, els ${Y(r26.age)} arriben el ${yReach}, quan ja es demanen ${Y(r27.age)}.`,
      caption: "Edat ordinària de jubilació segons el que s'ha cotitzat en fer 65 anys",
      cols: ["Cotitzat en fer 65 anys", "Si fas 65 anys el 2026", "Si fas 65 anys el 2027 o després"],
      faq: [
        {
          q: "Em puc jubilar als 65 amb 39 anys cotitzats?",
          a: `Sí, sense retallada: des del 2027 n'hi ha prou amb ${Y(r27.threshold)} cotitzats en fer 65 anys, i el 2026 amb ${Y(r26.threshold)}. Amb menys, l'edat ordinària és ${Y(r27.age)} (${Y(r26.age)} el 2026), tret que arribis abans a aquests anys cotitzats.`,
        },
        {
          q: "Quants anys cal cotitzar per jubilar-se als 65?",
          a: `${Y(r27.threshold)} si fas 65 anys el 2027 o després; ${Y(r26.threshold)} si els fas el 2026. Amb ${Y(r38.at65)} cotitzats als 65 i continuant d'alta, el 2027 et jubiles als ${Y(r38.y2027.age)}, el dia que completes ${Y(r27.threshold)}. Per cobrar alguna pensió de jubilació, el mínim són 15 anys.`,
        },
      ],
    };
  }
  return {
    title: "At what age can I retire, by years contributed?",
    intro: `Ordinary age, with no cut, by what you have contributed on your 65th birthday, assuming you keep contributing after it, from the calculator's own function. If you reach ${Y(r27.threshold)} between 65 and ${Y(r27.age)}, you can retire that day. The age of the year you reach it counts: with ${Y(r35.at65)} at 65 in 2026, you reach ${Y(r26.age)} in ${yReach}, when ${Y(r27.age)} is already required.`,
    caption: "Ordinary retirement age by contributions on the 65th birthday",
    cols: ["Contributed on turning 65", "Turning 65 in 2026", "Turning 65 in 2027 or later"],
    faq: [
      {
        q: "Can I retire at 65 with 39 years of contributions in Spain?",
        a: `Yes, with no cut: from 2027 you need ${Y(r27.threshold)} on turning 65, and in 2026 ${Y(r26.threshold)}. With less, the ordinary age is ${Y(r27.age)} (${Y(r26.age)} in 2026), unless you reach those years first.`,
      },
      {
        q: "How many years do you need to contribute to retire at 65 in Spain?",
        a: `${Y(r27.threshold)} if you turn 65 in 2027 or later; ${Y(r26.threshold)} if you turn 65 in 2026. With ${Y(r38.at65)} at 65 and still contributing, in 2027 you retire at ${Y(r38.y2027.age)}, the day you complete ${Y(r27.threshold)}. To get any retirement pension, the minimum is 15 years.`,
      },
    ],
  };
}
