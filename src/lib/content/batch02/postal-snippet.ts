import type { Body } from "@/lib/content/blocks";
import { HANDIN_CLOSES } from "@/lib/content/election-phased";
import type { Locale } from "@/lib/i18n/config";

/**
 * The postal-vote guide's search snippet from Thu 26 Nov 2026, 14:00 Madrid (27 Nov 2026, ci-edicio, docs/
 * SEO_EXPERIMENTS.md, "postal guide: search snippet past the hand-in"). FACTUAL TENSE CORRECTION inside the
 * measurement window (closed-phase title and description changed 26 Nov): the stored closed-phase strings say
 * "lliurament fins al 26 de novembre, 14 h", an instruction once 14:00 has passed. From HANDIN_CLOSES the page
 * prints these instead, in the past tense, with only facts the body already states and sources: the hand-in
 * ended on Thu 26 Nov at 14:00 (JEC Acuerdo 418/2026; Correos "hasta el 26 de noviembre de 2026 a las 14:00h");
 * whoever asked for it cannot vote in person (Interior: "una vez ha sido admitida su solicitud, ya no puede votar
 * de forma presencial"; INE; LOREG art. 73.1); whoever did not votes at their table on the 29th, 9:00-20:00.
 *
 * Same switch as the body (HANDIN_PAST_COPY in postal-vote.ts reads the `handin` variant from the same instant),
 * printed from the render clock like the shops guide's snippet (shops-snippet.ts, content/live-title.ts). It
 * applies only while the guide carries the closed-phase body (the one with `handin` variants): once POSTAL_AS_OF
 * moves past polling day the "over" copy has none, and its stored, evergreen title and description are printed.
 */
export const POSTAL_ENTRY_KEY = "guide-postal-vote";

export const POSTAL_SNIPPET_HANDIN_PAST: Record<Locale, { title: string; description: string }> = {
  ca: {
    title: "Vot per correu 29N: el termini va acabar el 26 de novembre",
    description:
      "El lliurament a Correus va acabar el dijous 26 a les 14 h. Si el vas demanar, no pots votar en persona; si no, vota a la teva mesa el 29, de 9 a 20 h.",
  },
  es: {
    title: "Voto por correo 29N: la entrega terminó el 26 de noviembre",
    description:
      "La entrega en Correos terminó el jueves 26 a las 14 h. Si lo pediste, no puedes votar en persona; si no, vota en tu mesa el 29, de 9 a 20 h.",
  },
  en: {
    title: "Postal vote, Spain 29N election: hand-in ended on 26 Nov",
    description:
      "Hand-in at Correos ended on Thu 26 Nov, 14:00. If you applied, you cannot vote in person; if not, vote at your polling station on 29 Nov, 9:00-20:00.",
  },
};

/** The postal guide in its closed-phase copy, rendered at or after 26 Nov 14:00. */
function handinPast(body: Body, key: string | null | undefined, now: Date): boolean {
  return (
    key === POSTAL_ENTRY_KEY &&
    now.getTime() >= HANDIN_CLOSES.getTime() &&
    body.some((block) => block.type === "electionPhased" && Array.isArray(block.handin) && block.handin.length > 0)
  );
}

/** Null = the stored seoTitle. */
export function livePostalTitle(body: Body, locale: Locale, key: string | null | undefined, now: Date = new Date()): string | null {
  return handinPast(body, key, now) ? POSTAL_SNIPPET_HANDIN_PAST[locale].title : null;
}

/** Null = the stored seoDescription. */
export function livePostalDescription(body: Body, locale: Locale, key: string | null | undefined, now: Date = new Date()): string | null {
  return handinPast(body, key, now) ? POSTAL_SNIPPET_HANDIN_PAST[locale].description : null;
}
