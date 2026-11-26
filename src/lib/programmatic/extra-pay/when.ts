import { elDay } from "@/lib/programmatic/rent-update/copy";

import type { EpLocale } from "./copy";
import { EXTRA_PAY_YEAR } from "./rules";

/**
 * "¿Cuándo se cobra la paga extra de Navidad?" on the first screen of the
 * extra pay calculator (26 Nov 2026): GSC 29 Oct-25 Nov shows the Catalan
 * page reached by "quan es cobra la paga extra de nadal" (22 impr, pos 6.6),
 * "… generalitat" (13, 7.8), "quan es cobra la paga de nadal" (10, 5.3) and
 * "quan es cobra la paga doble de nadal" (9, 6.1). One line per group, each
 * from its official text: employees (ET art. 31, already quoted on the page),
 * State civil servants (Ley 33/1987 art. 33, read 26 Nov 2026 on the BOE
 * consolidated text BOE-A-1987-28404, fixture
 * tests/fixtures/boe-ley33-1987-art33-20261126.txt) and contributory
 * pensioners (LGSS art. 46, QUOTE.lgss46). Regional and local civil servants
 * (Generalitat included) are left out: no official text for their December
 * payment was read, so nothing is said about them.
 * Pure, client-safe.
 */

export const WHEN_READ_ON = "2026-11-26";

/** Ley 33/1987, art. 33, first sentence (BOE consolidated text, read WHEN_READ_ON). */
export const LEY33_ART33 = "Las pagas extraordinarias de los funcionarios del Estado se devengarán el primer día hábil de los meses de junio y diciembre";
export const LEY33_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-1987-28404#a3-5";

/**
 * The first working day (Monday to Friday) of December of `year`: 1-5
 * December always hold one, and no national holiday falls on them (6 and 8
 * December are the first ones of the month).
 */
export function firstWorkingDayOfDecember(year: number = EXTRA_PAY_YEAR): string {
  for (let d = 1; d <= 7; d++) {
    const iso = `${year}-12-0${d}`;
    const wd = new Date(`${iso}T12:00:00Z`).getUTCDay();
    if (wd >= 1 && wd <= 5) return iso;
  }
  throw new Error("unreachable");
}

const L = <T>(locale: EpLocale, v: Record<EpLocale, T>): T => v[locale];

export interface WhenBox {
  title: string;
  items: { who: string; text: string }[];
}

export function whenBox(locale: EpLocale): WhenBox {
  const civil = elDay(firstWorkingDayOfDecember(), locale);
  const y = EXTRA_PAY_YEAR;
  return L(locale, {
    es: {
      title: `¿Cuándo se cobra la paga extra de Navidad de ${y}?`,
      items: [
        { who: "Trabajadores por cuenta ajena", text: "el día que fije tu convenio colectivo o tu contrato: el Estatuto de los Trabajadores (art. 31) solo dice que es «con ocasión de las fiestas de Navidad». Si la tienes prorrateada, no hay paga aparte en diciembre." },
        { who: "Funcionarios del Estado", text: `se devenga el primer día hábil de diciembre: este año, ${civil} (Ley 33/1987, art. 33).` },
        { who: "Pensionistas de la Seguridad Social", text: "la paga extra de final de año se devenga en noviembre, no en diciembre (Ley General de la Seguridad Social, art. 46)." },
      ],
    },
    ca: {
      title: `Quan es cobra la paga extra de Nadal del ${y}?`,
      items: [
        { who: "Treballadors per compte d'altri", text: "el dia que fixi el teu conveni col·lectiu o el teu contracte: l'Estatut dels Treballadors (art. 31) només diu que és amb ocasió de les festes de Nadal. Si la tens prorratejada, no hi ha paga a part al desembre." },
        { who: "Funcionaris de l'Estat", text: `es merita el primer dia hàbil de desembre: enguany, ${civil} (Llei 33/1987, art. 33).` },
        { who: "Pensionistes de la Seguretat Social", text: "la paga extra de final d'any es merita al novembre, no al desembre (Llei general de la Seguretat Social, art. 46)." },
      ],
    },
    en: {
      title: `When is the ${y} Christmas extra pay paid?`,
      items: [
        { who: "Employees", text: "on the day your collective agreement or contract sets: the Workers' Statute (art. 31) only says it comes at Christmas. If yours is prorated, there is no separate December payment." },
        { who: "State civil servants", text: `it accrues on the first working day of December: this year, ${civil} (Law 33/1987, art. 33).` },
        { who: "Social Security pensioners", text: "the end-of-year extra payment accrues in November, not December (General Social Security Act, art. 46)." },
      ],
    },
  });
}

/** One question for the page's FAQ (civil servants; the pensioners' one is already there). */
export function whenFaq(locale: EpLocale): { q: string; a: string }[] {
  const civil = elDay(firstWorkingDayOfDecember(), locale);
  return [
    L(locale, {
      es: { q: "¿Cuándo cobran la paga extra de diciembre los funcionarios?", a: `Los funcionarios del Estado la devengan el primer día hábil de diciembre, en ${EXTRA_PAY_YEAR} ${civil}: «${LEY33_ART33}» (Ley 33/1987, art. 33). Si no has trabajado los seis meses anteriores completos, se reduce en proporción (mismo artículo).` },
      ca: { q: "Quan cobren la paga extra de desembre els funcionaris?", a: `Els funcionaris de l'Estat la meriten el primer dia hàbil de desembre, el ${EXTRA_PAY_YEAR} ${civil}: «${LEY33_ART33}» (Llei 33/1987, art. 33). Si no has treballat els sis mesos anteriors complets, es redueix en proporció (mateix article).` },
      en: { q: "When do civil servants get the December extra pay?", a: `State civil servants accrue it on the first working day of December, in ${EXTRA_PAY_YEAR} ${civil}: "${LEY33_ART33}" (Law 33/1987, art. 33, in Spanish). If you have not worked the whole previous six months, it is reduced in proportion (same article).` },
    }),
  ];
}
