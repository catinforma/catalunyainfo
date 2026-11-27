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
  /**
   * The four provinces in the same month (27 Nov 2026, batch 8J): INE table
   * 76143 "Tasa de variación del índice general por provincias. Series desde
   * enero de 1993" (https://www.ine.es/jaxiT3/Tabla.htm?t=76143, title
   * grepped on the page 27 Nov 2026 00:55 UTC), read with
   * DATOS_TABLA/76143?nult=3: Barcelona IPC306135 / IPC306137, Girona
   * IPC306639 / IPC306641, Lleida IPC307087 / IPC307089, Tarragona IPC308039 /
   * IPC308041 (annual / monthly change; October 2026 = Anyo 2026, FK_Periodo 10).
   */
  provinces: [
    { name: "Barcelona", annual: 4.7, monthly: 0.8 },
    { name: "Girona", annual: 5.7, monthly: 0.5 },
    { name: "Lleida", annual: 5.6, monthly: 0.9 },
    { name: "Tarragona", annual: 4.9, monthly: 0.5 },
  ],
  provincesTableUrl: "https://www.ine.es/jaxiT3/Tabla.htm?t=76143",
  /**
   * Catalonia's annual rate month by month, November 2025 to October 2026:
   * DATOS_SERIE/IPC294107?nult=13, read 27 Nov 2026 00:55 UTC (October 2025,
   * the 13th value, was 2,6 %; not printed).
   */
  history: [
    ["2025-11", 2.6],
    ["2025-12", 2.5],
    ["2026-01", 2.0],
    ["2026-02", 2.0],
    ["2026-03", 3.1],
    ["2026-04", 3.0],
    ["2026-05", 3.1],
    ["2026-06", 3.2],
    ["2026-07", 3.5],
    ["2026-08", 4.0],
    ["2026-09", 4.5],
    ["2026-10", 4.8],
  ],
} as const;

export interface CataloniaSection {
  heading: string;
  text: string;
  source: string;
  /** "Barcelona 4,7 %, Girona 5,7 %…" in one sentence, the highest named. */
  provincesText: string;
  provincesCaption: string;
  provincesCols: [string, string, string];
  provinces: { name: string; annual: string; monthly: string }[];
  provincesSource: string;
  historyCaption: string;
  historyCols: [string, string, string];
  /** Newest first; `spain` is the page's national annual rate for that month ("—" when the page has none). */
  history: { month: string; catalonia: string; spain: string }[];
}

const L = <T>(locale: IpcLocale, v: Record<IpcLocale, T>): T => v[locale];

/**
 * The section for the page's newest month, or null when the line is not for
 * that month. Pure. `spainByMonth`: the page's national annual rates by month
 * ("2026-10" -> 4.9), for the Catalonia-vs-Spain table.
 */
export function cataloniaSection(locale: IpcLocale, latest: Latest | null, c = CATALONIA_IPC, spainByMonth: ReadonlyMap<string, number | null> = new Map()): CataloniaSection | null {
  if (!latest || latest.month !== c.month) return null;
  const m = c.month;
  const spain = rate(latest.general, locale);
  const annual = rate(c.annual, locale);
  const monthly = signedRate(c.monthly, locale);
  const prev = rate(c.previousAnnual, locale);
  const read = bareDay(c.readOn, locale);
  const top = [...c.provinces].sort((a, b) => b.annual - a.annual)[0]!;
  const provList = c.provinces.map((p) => `${p.name} ${rate(p.annual, locale)}`).join(", ");
  const provinces = c.provinces.map((p) => ({ name: p.name, annual: rate(p.annual, locale), monthly: signedRate(p.monthly, locale) }));
  const history = [...c.history].reverse().map(([month, v]) => ({ month: monthText(month, locale), catalonia: rate(v, locale), spain: rate(spainByMonth.get(month) ?? null, locale) }));
  const extra = L(locale, {
    es: {
      provincesText: `Por provincias, en ${monthText(m, "es")}: ${provList}. La más alta, ${top.name}.`,
      provincesCaption: `IPC por provincias de Cataluña, ${monthText(m, "es")}`,
      provincesCols: ["Provincia", "Variación anual", "Variación mensual"] as [string, string, string],
      provincesSource: "INE, tasa de variación del índice general por provincias (tabla 76143), leída el 27 de noviembre de 2026.",
      historyCaption: "IPC de Cataluña y de España mes a mes, variación anual (último año)",
      historyCols: ["Mes", "Cataluña", "España"] as [string, string, string],
    },
    ca: {
      provincesText: `Per províncies, ${caOfMonth(m).replace(/^de /, "al ").replace(/^d'/, "a l'")}: ${provList}. La més alta, ${top.name}.`,
      provincesCaption: `IPC per províncies de Catalunya, ${monthText(m, "ca")}`,
      provincesCols: ["Província", "Variació anual", "Variació mensual"] as [string, string, string],
      provincesSource: "INE, taxa de variació de l'índex general per províncies (taula 76143), llegida el 27 de novembre de 2026.",
      historyCaption: "IPC de Catalunya i d'Espanya mes a mes, variació anual (últim any)",
      historyCols: ["Mes", "Catalunya", "Espanya"] as [string, string, string],
    },
    en: {
      provincesText: `By province, in ${monthText(m, "en")}: ${provList}. Highest: ${top.name}.`,
      provincesCaption: `CPI by Catalan province, ${monthText(m, "en")}`,
      provincesCols: ["Province", "Annual change", "Monthly change"] as [string, string, string],
      provincesSource: "INE, all-items annual change by province (table 76143), read 27 November 2026.",
      historyCaption: "Catalonia and Spain CPI month by month, annual change (last year)",
      historyCols: ["Month", "Catalonia", "Spain"] as [string, string, string],
    },
  });
  const base = L(locale, {
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
  return { ...base, ...extra, provinces, history };
}
