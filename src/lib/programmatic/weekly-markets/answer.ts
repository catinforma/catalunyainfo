import type { Hhmm, MkLocale } from "./types";

/**
 * The "next market" answer as the browser and the server both build it. Small
 * and free of data imports: the client component ships this module, nothing
 * else of the family.
 *
 * An option is one session day of one zone, already worded: `before` is
 * "Pròxim mercat a Vic: ", `datePhrase` "dissabte 28 de novembre" and `after`
 * ", plaça Major, horari de matí." The relative word ("avui, ", "demà, ") is
 * added when the answer is composed, from the clock of whoever composes it,
 * so one list of options serves the server render and a tab left open.
 */

export interface AnswerOption {
  /** ISO date of the session day. */
  date: string;
  /** Closing time of the last session of the day; null when the council publishes none (held until midnight). */
  endsAt: Hhmm | null;
  before: string;
  datePhrase: string;
  after: string;
  /** True when the answer carries a caveat the council's notice page settles. */
  notice: boolean;
}

export interface AnswerZone {
  id: string;
  label: string;
  options: AnswerOption[];
}

export const RELATIVE_WORDS: Record<MkLocale, { today: string; tomorrow: string }> = {
  ca: { today: "avui, ", tomorrow: "demà, " },
  es: { today: "hoy, ", tomorrow: "mañana, " },
  en: { today: "today, ", tomorrow: "tomorrow, " },
};

function nextDay(iso: string): string {
  return new Date(Date.parse(`${iso}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
}

/** The first option still to come at this moment (Madrid date and time): today's until it ends, then the later days. */
export function currentOption(options: readonly AnswerOption[], today: string, hhmm: Hhmm): AnswerOption | null {
  return options.find((o) => o.date > today || (o.date === today && !(o.endsAt !== null && hhmm >= o.endsAt))) ?? null;
}

/** "Pròxim mercat a Vic: avui, dissabte 28 de novembre, plaça Major, horari de matí." */
export function composeAnswer(option: AnswerOption, today: string, locale: MkLocale): string {
  const words = RELATIVE_WORDS[locale];
  const relative = option.date === today ? words.today : option.date === nextDay(today) ? words.tomorrow : "";
  return `${option.before}${relative}${option.datePhrase}${option.after}`;
}

/** What the answer says when no session is left inside the look-ahead window. */
export const NO_SESSION: Record<MkLocale, string> = {
  ca: "No tenim cap sessió prevista en els propers mesos: consulta l'Ajuntament.",
  es: "No tenemos ninguna sesión prevista en los próximos meses: consulta al Ayuntamiento.",
  en: "We have no session scheduled for the coming months: check with the council.",
};
