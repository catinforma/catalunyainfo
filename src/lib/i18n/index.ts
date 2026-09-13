import ca, { type Messages } from "./messages/ca";
import es from "./messages/es";
import en from "./messages/en";
import { type Locale } from "./config";

const DICTIONARIES: Record<Locale, Messages> = { ca, es, en };

export function getMessages(locale: Locale): Messages {
  return DICTIONARIES[locale];
}

/** Interpolate `{name}` placeholders. */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export * from "./config";
export * from "./routes";
export type { Messages };
