import { b2href, type B2Key } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";
import { calcPath, type CalculatorId } from "@/lib/programmatic/calculators/paths";

import { b2KeyForHref } from "./next-step";
import { pathOnly, type NextStep, type NextStepLink } from "./next-step-core";

/**
 * The one-line calculator link on the guides people land on (26 Nov 2026,
 * batch 6C): a short question and one or two calculator links on a tip
 * callout, after the body of the guide (EntryArticle) and under the answer
 * of the "is <date> a holiday?" pages (holidays/DatePage).
 *
 * Why (GSC 30 Oct-26 Nov 2026, `snapshot.py pages 28 300`): the guides take
 * most of the site's clicks (the December bridge 406 + 515, the shops guide
 * 534, how to vote 331 + 277 + 63, the 1 Nov and 7 Dec date pages 316 and
 * 258) while the ~40 calculators took 237 in all; none of those guides
 * linked the calculator its readers need next.
 *
 * Rules:
 *  - Links only. The one statement of law is the paid-leave line's: voting
 *    is paid leave for the time it takes, Estatuto de los Trabajadores art.
 *    37.3.d («para el cumplimiento de un deber inexcusable de carácter
 *    público y personal, comprendido el ejercicio del sufragio activo»,
 *    BOE-A-2015-11430, read 26 Nov 2026; the same quote as
 *    programmatic/paid-leave/rules.ts QUOTE.publicDuty, which that
 *    calculator prints).
 *  - A calculator only where the calculator answers the reader's next
 *    question: none on the strike pages (no tool works out what a strike
 *    day takes off a payslip).
 *  - Never a calculator the page already links: in its body (stored or
 *    built) or in its "next useful step" box. Nothing left: no line.
 *  - The Christmas extra pay line on the shops guides runs to
 *    EXTRA_PAY_LINE_UNTIL (the 2026 extra pay is paid by then; the card
 *    names 2026).
 *  - Rendered by the templates, never stored in a body. Clicks:
 *    `related_content_click`, `link_context: "calculator_line"`.
 */

export const EXTRA_PAY_LINE_UNTIL = "2026-12-31";

export interface CalculatorLine {
  text: string;
  links: NextStepLink[];
}

type LineKind = "vote" | "mesa" | "deadline" | "christmas" | "lottery" | "payDates" | "death";

/** Which guides carry a line, and of which kind. */
export const GUIDE_LINES: Partial<Record<B2Key, LineKind>> = {
  voting: "vote",
  mesa: "mesa",
  decemberBridge: "deadline",
  decemberBridgeSpain: "deadline",
  holidayToday: "deadline",
  workCalendar: "deadline",
  bridges2027: "deadline",
  easter2027: "deadline",
  shops: "christmas",
  shopsSpainDecember: "christmas",
  loteriaNadal: "lottery",
  grossa: "lottery",
  payDates: "payDates",
  deathSteps: "death",
};

export const CALCULATORS = {
  vote: ["paid-leave"],
  mesa: ["paid-leave"],
  deadline: ["working-days"],
  christmas: ["extra-pay"],
  lottery: ["lottery-tax"],
  payDates: ["unemployment", "pensions-2027"],
  death: ["widow-pension", "inheritance-tax-by-region"],
} as const satisfies Record<LineKind, readonly CalculatorId[]>;

const TEXT: Record<LineKind, Record<Locale, string>> = {
  vote: {
    ca: "Si treballes el dia de les eleccions, votar és un permís retribuït pel temps indispensable (Estatut dels Treballadors, art. 37.3.d):",
    es: "Si trabajas el día de las elecciones, votar es un permiso retribuido por el tiempo indispensable (Estatuto de los Trabajadores, art. 37.3.d):",
    en: "If you work on election day, voting is paid leave for the time it takes (Workers' Statute, art. 37.3.d):",
  },
  mesa: {
    ca: "Tots els permisos retribuïts de la feina, amb el seu article:",
    es: "Todos los permisos retribuidos del trabajo, con su artículo:",
    en: "Every paid leave from work, with its article:",
  },
  deadline: {
    ca: "Tens un termini que venç amb aquests festius?",
    es: "¿Tienes un plazo que vence con estos festivos?",
    en: "Got a deadline running over these holidays?",
  },
  christmas: {
    ca: "Fent números per a les compres de Nadal?",
    es: "¿Haciendo números para las compras de Navidad?",
    en: "Doing the sums for Christmas shopping?",
  },
  lottery: {
    ca: "Si et toca, què et queda després d'impostos:",
    es: "Si te toca, lo que te queda después de impuestos:",
    en: "If you win, what you keep after tax:",
  },
  payDates: {
    ca: "Quant cobraràs:",
    es: "Cuánto cobrarás:",
    en: "How much you will get:",
  },
  death: {
    ca: "Les dues calculadores d'aquests tràmits:",
    es: "Las dos calculadoras de estos trámites:",
    en: "The two calculators for these steps:",
  },
};

type LineCalculator = (typeof CALCULATORS)[LineKind][number];

/**
 * Each link's words, in the reader's query words. Written here rather than
 * read from the hub cards (calculators/hub.ts) so the content pages do not
 * load every calculator's rules (next-step-calculators.ts is kept apart for
 * the same reason). Working days: the words of its hub link
 * (WorkingDaysHubLink, next-step.ts workingDaysStep); paid leave and the
 * lottery: the anchors the death-steps and Christmas lottery guides already
 * use; pensions: context-links.ts.
 */
export const LINK_LABEL: Record<LineCalculator, Record<Locale, string>> = {
  "paid-leave": { ca: "Calculadora de permisos laborals", es: "Calculadora de permisos laborales", en: "Paid leave calculator" },
  "working-days": {
    ca: "Calcula els dies hàbils i l'últim dia del termini al teu municipi",
    es: "Calcula los días hábiles y el último día del plazo en tu municipio",
    en: "Work out the working days and the last day of the deadline where you are",
  },
  "extra-pay": { ca: "Calcula quant cobraràs net de paga extra", es: "Calcula cuánto cobrarás neto de paga extra", en: "Work out your Christmas extra pay after tax" },
  "lottery-tax": { ca: "Calculadora de premis de loteria", es: "Calculadora de premios de lotería", en: "Spanish lottery prize tax calculator" },
  unemployment: { ca: "Calcula quant cobraràs d'atur", es: "Calcula cuánto cobrarás de paro", en: "Work out your unemployment benefit" },
  "pensions-2027": { ca: "Calcula la pujada de les pensions el 2027", es: "Calcula la subida de las pensiones en 2027", en: "Work out the 2027 pension increase" },
  "widow-pension": { ca: "Calcula la pensió de viduïtat", es: "Calcula la pensión de viudedad", en: "Work out the widow's pension" },
  "inheritance-tax-by-region": { ca: "Impost de successions per comunitat", es: "Impuesto de sucesiones por comunidad", en: "Inheritance tax by region" },
};

const calculatorLink = (id: LineCalculator, locale: Locale): NextStepLink => ({ href: calcPath(id, locale), label: LINK_LABEL[id][locale] });

/** Does a page already link this path (its body, or its next-step box)? The body is searched as JSON for the path without its final slash, so a link with a query (`?lugar=`) counts. */
function alreadyLinked(path: string, body: unknown, step: NextStep | null): boolean {
  if (step?.links.some((link) => pathOnly(link.href) === path)) return true;
  return body !== undefined && JSON.stringify(body).includes(path.replace(/\/$/, ""));
}

/** The line of one kind for one page; null when every calculator is already linked or the line is out of its window. */
export function calculatorLineFor(kind: LineKind, locale: Locale, opts: { body?: unknown; step?: NextStep | null; today: string; self?: string }): CalculatorLine | null {
  if (kind === "christmas" && opts.today > EXTRA_PAY_LINE_UNTIL) return null;
  const links = (CALCULATORS[kind] as readonly LineCalculator[])
    .map((id) => calculatorLink(id, locale))
    .filter((link) => link.href !== opts.self && !alreadyLinked(link.href, opts.body, opts.step ?? null));
  return links.length > 0 ? { text: TEXT[kind][locale], links } : null;
}

/** A content page's line: by its registry key, after the body. */
export function entryCalculatorLine(entry: { href: string; locale: Locale; body?: unknown }, step: NextStep | null, today: string): CalculatorLine | null {
  const key = b2KeyForHref(entry.href);
  const kind = key ? GUIDE_LINES[key] : undefined;
  if (!kind) return null;
  return calculatorLineFor(kind, entry.locale, { body: entry.body, step, today, self: b2href(key!, entry.locale) });
}

/** "Is <date> a holiday?" pages: the working-days calculator (their next-step box never links it). */
export function dateCalculatorLine(locale: Locale, step: NextStep | null, today: string): CalculatorLine | null {
  return calculatorLineFor("deadline", locale, { step, today });
}
