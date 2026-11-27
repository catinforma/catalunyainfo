import { day, ymText, type RaLocale } from "./copy";
import { addDays, addMonths, ordinaryDate, type OrdinaryDate } from "./engine";
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
 *
 * 27 Nov 2026 (batch 8R, review fix): the DT 7ª row is the one of the year
 * in which the age is REACHED, not the year of the 65th birthday, so someone
 * who turns 65 late in 2026 can fall under the 2027 row (38 years at 65,
 * born 1 Oct 1961 or later: 38 y 3 m would only arrive in 2027, when 38 y
 * 6 m are asked, so 65 y 6 m, not 65 y 3 m). Each cell is now computed for
 * every day of birth of the year and split where the age or the row
 * changes, and states the row applied. Re-read today on the BOE
 * consolidated LGSS (BOE-A-2015-11724, "Última actualización publicada el
 * 25/11/2026"; curl + grep): art. 205.1.a ("sesenta y cinco años cuando se
 * acrediten treinta y ocho años y seis meses de cotización"), DT 7ª ("se
 * aplicarán de forma gradual, en los términos que resultan del siguiente
 * cuadro"; columns "Año / Períodos cotizados / Edad exigida", 2026 and "A
 * partir del año 2027" rows unchanged) and every LGSS quote in rules.ts:
 * all unchanged since the 11/11/2026 text.
 */

export const CONTRIBUTED_AT_65: readonly YM[] = [ym(35), ym(37), ym(38), ym(38, 3), ym(38, 6), ym(39), ym(40)];
/** Birth years of the two columns: 65 in 2026, and 65 in the final row's first year (every later year gives the same ages). */
export const BIRTH_YEARS = { y2026: 2026 - 65, y2027: FINAL_YEAR - 65 } as const;

/** A run of consecutive dates of birth with the same ordinary age under the same DT 7ª row. */
export interface BirthSpan {
  /** First and last date of birth of the run. */
  from: string;
  to: string;
  /** The engine's result for the run's first day. */
  result: OrdinaryDate;
}

export interface ByContributionRow {
  at65: YM;
  /** Turning 65 in 2026: one span, or two when the day of birth moves the age into 2027's row. */
  y2026: BirthSpan[];
  /** Turning 65 in 2027 or later: always the final row. */
  y2027: BirthSpan[];
}

/** The engine for one date of birth: `at65` contributed on the 65th birthday, growing after it. */
export function ordinaryAt65(birth: string, at65: YM): OrdinaryDate {
  const anchor = `${Number(birth.slice(0, 4)) + 65}${birth.slice(4)}`;
  return ordinaryDate(birth, { anchor, base: toMonths(at65), grows: true });
}

/** Every day of a birth year through the engine, grouped by (age, row): the row is the one of the year the age is reached. */
export function birthSpans(year: number, at65: YM): BirthSpan[] {
  const spans: BirthSpan[] = [];
  for (let d = `${year}-01-01`; d.startsWith(`${year}-`); d = addDays(d, 1)) {
    const result = ordinaryAt65(d, at65);
    const last = spans[spans.length - 1];
    if (last && toMonths(last.result.age) === toMonths(result.age) && last.result.row.year === result.row.year) last.to = d;
    else spans.push({ from: d, to: d, result });
  }
  return spans;
}

export function byContributionRows(): ByContributionRow[] {
  return CONTRIBUTED_AT_65.map((at65) => ({ at65, y2026: birthSpans(BIRTH_YEARS.y2026, at65), y2027: birthSpans(BIRTH_YEARS.y2027, at65) }));
}

/** "fila 2026 (la alcanzas en 2026)" / "fila «a partir del año 2027» (la alcanzas en 2027 o después)": the row of the year the age is reached. */
function ruleText(rowYear: number, locale: RaLocale): string {
  const last = rowYear >= FINAL_YEAR;
  if (locale === "es") return last ? `fila «a partir del año ${FINAL_YEAR}» (la alcanzas en ${FINAL_YEAR} o después)` : `fila ${rowYear} (la alcanzas en ${rowYear})`;
  if (locale === "ca") return last ? `fila «a partir de l'any ${FINAL_YEAR}» (l'assoleixes el ${FINAL_YEAR} o després)` : `fila ${rowYear} (l'assoleixes el ${rowYear})`;
  return last ? `"from ${FINAL_YEAR}" row (reached in ${FINAL_YEAR} or later)` : `${rowYear} row (reached in ${rowYear})`;
}

/** Catalan "de"/"a" + article + day: "de l'1 de gener de 1961", "al 30 de setembre de 1961". */
function caPrep(prep: "de" | "a", iso: string): string {
  const vowel = iso.endsWith("-01") || iso.endsWith("-11");
  return `${vowel ? `${prep} l'` : `${prep === "de" ? "del" : "al"} `}${day(iso, "ca")}`;
}

function rangeText(s: BirthSpan, locale: RaLocale): string {
  const [a, b] = [day(s.from, locale), day(s.to, locale)];
  if (locale === "es") return `Nacidos del ${a} al ${b}`;
  if (locale === "ca") return `Nascuts ${caPrep("de", s.from)} ${caPrep("a", s.to)}`;
  return `Born ${a} to ${b}`;
}

/** One line per span: "65 años y 3 meses, fila 2026 (la alcanzas en 2026)", with the birth dates when the cell splits. */
export function cellLines(spans: readonly BirthSpan[], locale: RaLocale): string[] {
  return spans.map((s) => {
    const line = `${ymText(s.result.age, locale)}, ${ruleText(s.result.row.year, locale)}`;
    return spans.length > 1 ? `${rangeText(s, locale)}: ${line}` : line;
  });
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
  // 2026's full age (66 y 10 m), for everyone born in 1961, arrives in 2027 (born Jan-Feb) or 2028: never under the 2026 row.
  const reachYears = [...new Set([`${BIRTH_YEARS.y2026}-01-01`, `${BIRTH_YEARS.y2026}-12-31`].map((b) => addMonths(b, toMonths(r26.age)).slice(0, 4)))];
  const yReach = reachYears.join({ es: " o ", ca: " o el ", en: " or " }[locale]);
  // The split row (38 years at 65 in 2026): the last birth day still under the 2026 row and the first under 2027's.
  const [early, late] = r38.y2026 as [BirthSpan, BirthSpan];
  const D = (iso: string) => day(iso, locale);
  if (locale === "es") {
    return {
      title: "¿A qué edad me jubilo según los años cotizados?",
      intro: `Edad ordinaria, sin recorte, según lo que lleves cotizado el día que cumples 65 y suponiendo que sigues cotizando después, con la misma función que la calculadora. Si llegas a ${Y(r27.threshold)} cotizados entre los 65 y los ${Y(r27.age)}, te jubilas ese día. La fila del cuadro de la disposición transitoria séptima que cuenta es la del año en que alcanzas la edad, no la del año en que cumples 65: con ${Y(r35.at65)} cotizados a los 65 en 2026, los ${Y(r26.age)} llegan en ${yReach}, cuando ya se piden ${Y(r27.age)}; y con ${Y(r38.at65)} cotizados, quien nació hasta el ${D(early.to)} se jubila a los ${Y(early.result.age)} dentro de 2026, pero quien nació desde el ${D(late.from)} solo completaría ${Y(r26.threshold)} en ${late.result.date.slice(0, 4)}, cuando ya se piden ${Y(r27.threshold)}, y se jubila a los ${Y(late.result.age)}. Cada casilla dice la fila que se aplica.`,
      caption: "Edad ordinaria de jubilación según lo cotizado al cumplir 65, con la fila del cuadro que se aplica (la del año en que se alcanza la edad)",
      cols: ["Cotizado al cumplir 65", `Si cumples 65 en 2026 (nacidos en ${BIRTH_YEARS.y2026})`, `Si cumples 65 en 2027 o después (nacidos desde ${BIRTH_YEARS.y2027})`],
      faq: [
        {
          q: "¿Me puedo jubilar a los 65 con 39 años cotizados?",
          a: `Sí, sin recorte: desde 2027 basta con ${Y(r27.threshold)} cotizados al cumplir 65, y en 2026 con ${Y(r26.threshold)}. Con menos, la edad ordinaria es ${Y(r27.age)}, salvo que llegues antes a esos años cotizados (el cuadro pide ${Y(r26.age)} solo a quien los alcanza dentro de 2026).`,
        },
        {
          q: "¿Cuántos años hay que cotizar para jubilarse a los 65?",
          a: `${Y(r27.threshold)} si cumples 65 en 2027 o después; ${Y(r26.threshold)} si los cumples en 2026. Con ${Y(r38.at65)} cotizados a los 65 y siguiendo de alta, en 2027 te jubilas a los ${Y(r38.y2027[0]!.result.age)}, el día que completas ${Y(r27.threshold)}. Para cobrar alguna pensión de jubilación, el mínimo son 15 años.`,
        },
      ],
    };
  }
  if (locale === "ca") {
    return {
      title: "A quina edat em jubilo segons els anys cotitzats?",
      intro: `Edat ordinària, sense retallada, segons el que portis cotitzat el dia que fas 65 anys i suposant que continues cotitzant després, amb la mateixa funció que la calculadora. Si arribes a ${Y(r27.threshold)} cotitzats entre els 65 i els ${Y(r27.age)}, et jubiles aquell dia. La fila del quadre de la disposició transitòria setena que compta és la de l'any en què assoleixes l'edat, no la de l'any en què fas 65 anys: amb ${Y(r35.at65)} cotitzats als 65 el 2026, els ${Y(r26.age)} arriben el ${yReach}, quan ja es demanen ${Y(r27.age)}; i amb ${Y(r38.at65)} cotitzats, qui va néixer fins ${caPrep("a", early.to)} es jubila als ${Y(early.result.age)} dins del 2026, però qui va néixer des ${caPrep("de", late.from)} només completaria ${Y(r26.threshold)} el ${late.result.date.slice(0, 4)}, quan ja es demanen ${Y(r27.threshold)}, i es jubila als ${Y(late.result.age)}. Cada casella diu la fila que s'aplica.`,
      caption: "Edat ordinària de jubilació segons el que s'ha cotitzat en fer 65 anys, amb la fila del quadre que s'aplica (la de l'any en què s'assoleix l'edat)",
      cols: ["Cotitzat en fer 65 anys", `Si fas 65 anys el 2026 (nascuts el ${BIRTH_YEARS.y2026})`, `Si fas 65 anys el 2027 o després (nascuts des del ${BIRTH_YEARS.y2027})`],
      faq: [
        {
          q: "Em puc jubilar als 65 amb 39 anys cotitzats?",
          a: `Sí, sense retallada: des del 2027 n'hi ha prou amb ${Y(r27.threshold)} cotitzats en fer 65 anys, i el 2026 amb ${Y(r26.threshold)}. Amb menys, l'edat ordinària és ${Y(r27.age)}, tret que arribis abans a aquests anys cotitzats (el quadre demana ${Y(r26.age)} només a qui els assoleix dins del 2026).`,
        },
        {
          q: "Quants anys cal cotitzar per jubilar-se als 65?",
          a: `${Y(r27.threshold)} si fas 65 anys el 2027 o després; ${Y(r26.threshold)} si els fas el 2026. Amb ${Y(r38.at65)} cotitzats als 65 i continuant d'alta, el 2027 et jubiles als ${Y(r38.y2027[0]!.result.age)}, el dia que completes ${Y(r27.threshold)}. Per cobrar alguna pensió de jubilació, el mínim són 15 anys.`,
        },
      ],
    };
  }
  return {
    title: "At what age can I retire, by years contributed?",
    intro: `Ordinary age, with no cut, by what you have contributed on your 65th birthday, assuming you keep contributing after it, from the calculator's own function. If you reach ${Y(r27.threshold)} between 65 and ${Y(r27.age)}, you can retire that day. The row of the seventh transitional provision's table that counts is the one for the year in which you reach the age, not the year you turn 65: with ${Y(r35.at65)} at 65 in 2026, you reach ${Y(r26.age)} in ${yReach}, when ${Y(r27.age)} is already required; and with ${Y(r38.at65)}, someone born up to ${D(early.to)} retires at ${Y(early.result.age)} within 2026, but someone born from ${D(late.from)} would only complete ${Y(r26.threshold)} in ${late.result.date.slice(0, 4)}, when ${Y(r27.threshold)} are already required, and retires at ${Y(late.result.age)}. Each cell names the row that applies.`,
    caption: "Ordinary retirement age by contributions on the 65th birthday, with the table row that applies (the year in which the age is reached)",
    cols: ["Contributed on turning 65", `Turning 65 in 2026 (born in ${BIRTH_YEARS.y2026})`, `Turning 65 in 2027 or later (born ${BIRTH_YEARS.y2027} or later)`],
    faq: [
      {
        q: "Can I retire at 65 with 39 years of contributions in Spain?",
        a: `Yes, with no cut: from 2027 you need ${Y(r27.threshold)} on turning 65, and in 2026 ${Y(r26.threshold)}. With less, the ordinary age is ${Y(r27.age)}, unless you reach those years first (the table asks ${Y(r26.age)} only of those who reach it within 2026).`,
      },
      {
        q: "How many years do you need to contribute to retire at 65 in Spain?",
        a: `${Y(r27.threshold)} if you turn 65 in 2027 or later; ${Y(r26.threshold)} if you turn 65 in 2026. With ${Y(r38.at65)} at 65 and still contributing, in 2027 you retire at ${Y(r38.y2027[0]!.result.age)}, the day you complete ${Y(r27.threshold)}. To get any retirement pension, the minimum is 15 years.`,
      },
    ],
  };
}
