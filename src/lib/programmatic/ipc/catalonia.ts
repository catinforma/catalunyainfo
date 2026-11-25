import { bareDay, caOfMonth, monthText, rate, signedRate, type IpcLocale } from "./copy";
import type { Latest } from "./series";

/**
 * Catalonia's own CPI line on "IPC hoy". Searchers write "ipc octubre 2026
 * catalunya" / "ipc catalunya 2026" (GSC 12-25 Nov 2026: 12 + 7 + 5 + 2
 * impressions at position 6-10 on the page, which only had the national
 * figure).
 *
 * Source, read 25 Nov 2026 15:04 UTC with the INE's JSON API (table 76140,
 * "Tasa de variación del índice general por comunidades autónomas. Series
 * desde enero de 1978", updated by the INE on 13 Nov 2026;
 * https://www.ine.es/jaxiT3/Tabla.htm?t=76140):
 *   DATOS_SERIE/IPC294107?nult=3 "Cataluña. Índice general. Variación anual."
 *     -> 2026 Aug 4.0, Sep 4.5, Oct 4.8
 *   DATOS_SERIE/IPC294109?nult=3 "Cataluña. Índice general. Variación mensual."
 *     -> 2026 Aug 0.6, Sep 0.1, Oct 0.7
 *   DATOS_SERIE/IPC290750 / IPC290752 (national, the page's own series):
 *     Oct 4.9 annual, +0.6 monthly (same as the page's live figure).
 * The INE publishes the November figures (national and by community) on
 * 15 Dec 2026 (calendar, PUBLICACIONFECHA_PUBLICACION/8, read at the same time).
 *
 * The section only renders while the page's newest national month is the
 * one below; after the November release it disappears by itself, and the
 * date guard in tests/ipc-catalonia.test.ts asks for the new figures from
 * 16 Dec 2026.
 */
export const CATALONIA_IPC = {
  month: "2026-10",
  annual: 4.8,
  monthly: 0.7,
  /** The previous month's annual rate (September 2026). */
  previousAnnual: 4.5,
  readOn: "2026-11-25",
  /** From this day the line must carry the November figures. */
  rereadBy: "2026-12-16",
  tableUrl: "https://www.ine.es/jaxiT3/Tabla.htm?t=76140",
  codes: ["IPC294107", "IPC294109"],
} as const;

export interface CataloniaSection {
  heading: string;
  text: string;
  source: string;
}

const L = <T>(locale: IpcLocale, v: Record<IpcLocale, T>): T => v[locale];

/** The section for the page's newest month, or null when the line is not for that month. Pure. */
export function cataloniaSection(locale: IpcLocale, latest: Latest | null, c = CATALONIA_IPC): CataloniaSection | null {
  if (!latest || latest.month !== c.month) return null;
  const m = c.month;
  const spain = rate(latest.general, locale);
  const annual = rate(c.annual, locale);
  const monthly = signedRate(c.monthly, locale);
  const prev = rate(c.previousAnnual, locale);
  const read = bareDay(c.readOn, locale);
  return L(locale, {
    es: {
      heading: "IPC en Cataluña",
      text: `En Cataluña, el IPC general subió un ${annual} en los doce meses hasta ${monthText(m, "es")} y varió un ${monthly} respecto al mes anterior; en septiembre la tasa anual era del ${prev}. En el conjunto de España fue del ${spain}.`,
      source: `INE, índice general por comunidades autónomas (series ${c.codes.join(" y ")}), leídas el ${read}.`,
    },
    ca: {
      heading: "IPC a Catalunya",
      text: `A Catalunya, l'IPC general va pujar un ${annual} en els dotze mesos fins ${caOfMonth(m).replace(/^de /, "al ").replace(/^d'/, "a l'")} i va variar un ${monthly} respecte al mes anterior; al setembre la taxa anual era del ${prev}. Al conjunt d'Espanya va ser del ${spain}.`,
      source: `INE, índex general per comunitats autònomes (sèries ${c.codes.join(" i ")}), llegides el ${read}.`,
    },
    en: {
      heading: "CPI in Catalonia",
      text: `In Catalonia, the all-items CPI rose ${annual} in the twelve months to ${monthText(m, "en")} and changed ${monthly} on the previous month; in September the annual rate was ${prev}. For Spain as a whole it was ${spain}.`,
      source: `INE, all-items index by autonomous community (series ${c.codes.join(" and ")}), read ${read}.`,
    },
  });
}
