import type { MetadataRoute } from "next";

import { RENT_SNAPSHOT } from "@/lib/programmatic/rent-update/data";
import type { SeriesData } from "@/lib/programmatic/rent-update/ine";
import { absoluteUrl } from "@/lib/site";

import { PENSION_LOCALES, bareDay, elDay, euros, monthText, pct, pensionEditions, percentText, rangeText, type PensionLocale } from "./copy";
import { DEFAULT_INPUT, revaluationStatus, revaluePension, type RateStatus } from "./engine";
import { INE_FINAL_DAY, INE_FLASH_DAY, NOVEMBER_FLASH, OFFICIAL_2027, WINDOW_FROM, WINDOW_TO } from "./rules";

/**
 * The words of the pensions page that depend on the INE's figures and on
 * where the 2027 revaluation stands (provisional → flash → final →
 * official): title, description, the answer-first lead, the status line.
 * Pure: the tests run it on the committed snapshot and on made-up states.
 */

const L = <T>(locale: PensionLocale, v: Record<PensionLocale, T>): T => v[locale];

/** The status on `today` with this file's dated constants. */
export function statusOn(ipc: SeriesData, today: string): RateStatus | null {
  return revaluationStatus(ipc, today, NOVEMBER_FLASH, OFFICIAL_2027);
}

/** The newest month with a final INE value in the window, and the first one missing. */
function edges(status: RateStatus): { lastKnown: string | null; missing: string | null; finalDay: string } {
  const known = status.months.filter((m) => m.value !== null);
  const missing = status.months.find((m) => m.value === null) ?? null;
  return { lastKnown: known.at(-1)?.month ?? null, missing: missing?.month ?? null, finalDay: missing?.published ?? INE_FINAL_DAY };
}

export function pensionMeta(locale: PensionLocale, status: RateStatus | null): { title: string; description: string; h1: string; breadcrumb: string } {
  const p = status ? percentText(status, locale) : "";
  const kind = status?.kind ?? null;
  return L(locale, {
    es: {
      title:
        kind === "official"
          ? `Subida de las pensiones 2027: ${p}, oficial en el BOE`
          : kind === "final"
            ? `Subida de las pensiones 2027: ${p} (dato definitivo del INE)`
            : kind === "flash"
              ? `Subida pensiones 2027: ${p} con el IPC adelantado del INE`
              : kind === "provisional"
                ? `Subida pensiones 2027: ${p} provisional (falta noviembre)`
                : "Subida de las pensiones 2027: calculadora con el IPC",
      description:
        "Calcula tu pensión de 2027: la subida es la media del IPC de diciembre a noviembre (art. 58 LGSS), con los datos del INE de cada mes. Pensiones mínimas, no contributivas e IPREM de 2026, del BOE.",
      h1: "Subida de las pensiones en 2027: calculadora y dato del IPC",
      breadcrumb: "Subida de las pensiones 2027",
    },
    ca: {
      title:
        kind === "official"
          ? `Pujada de les pensions 2027: ${p}, oficial al BOE`
          : kind === "final"
            ? `Pujada de les pensions 2027: ${p} (dada definitiva de l'INE)`
            : kind === "flash"
              ? `Pujada pensions 2027: ${p} amb l'IPC avançat de l'INE`
              : kind === "provisional"
                ? `Pujada pensions 2027: ${p} provisional (falta novembre)`
                : "Pujada de les pensions 2027: calculadora amb l'IPC",
      description:
        "Calcula la teva pensió del 2027: la pujada és la mitjana de l'IPC de desembre a novembre (art. 58 LGSS), amb les dades de l'INE de cada mes. Pensions mínimes, no contributives i IPREM del 2026, del BOE.",
      h1: "Pujada de les pensions el 2027: calculadora i dada de l'IPC",
      breadcrumb: "Pujada de les pensions 2027",
    },
    en: {
      title:
        kind === "official"
          ? `Spain pension increase 2027: ${p}, official (BOE)`
          : kind === "final"
            ? `Spain pension increase 2027: ${p} (final INE figure)`
            : kind === "flash"
              ? `Spain pension increase 2027: ${p} on the INE flash CPI`
              : kind === "provisional"
                ? `Spain pension increase 2027: ${p} provisional (Nov missing)`
                : "Spain pension increase 2027: CPI calculator",
      description:
        "Work out your 2027 Spanish state pension: the increase is the average CPI from December to November (LGSS art. 58), from the INE's monthly figures. 2026 minimum and non-contributory pensions and IPREM, from the BOE.",
      h1: "Spain pension increase in 2027: calculator and CPI figure",
      breadcrumb: "Pension increase 2027",
    },
  });
}

/** The answer-first lead: the rule, where the figure stands, the worked example. */
export function leadText(locale: PensionLocale, status: RateStatus | null, today: string): string {
  const range = rangeText(WINDOW_FROM, WINDOW_TO, locale);
  const rule = L(locale, {
    es: `Las pensiones contributivas suben en enero de 2027 lo que haya subido de media el IPC de ${range} (art. 58 de la Ley General de la Seguridad Social).`,
    ca: `Les pensions contributives pugen el gener del 2027 el que hagi pujat de mitjana l'IPC de ${range} (art. 58 de la Llei general de la Seguretat Social).`,
    en: `Spain's contributory pensions rise in January 2027 by the average CPI from ${range} (art. 58 of the General Social Security Act).`,
  });
  if (!status) return rule;
  const p = percentText(status, locale);
  const ex = revaluePension(DEFAULT_INPUT, status.percent);
  const example = ex.status === "ok" ? ex.monthly2027 : null;
  const from = euros(DEFAULT_INPUT.monthly, locale);
  const to = example === null ? "" : euros(example, locale);
  const { missing, finalDay } = edges(status);
  const flashOut = today >= INE_FLASH_DAY;
  switch (status.kind) {
    case "provisional":
      return [
        rule,
        L(locale, {
          es: `Con los ${status.known} meses que ha publicado el INE, la media es del ${p}: una pensión de ${from} al mes pasaría a ${to}.`,
          ca: `Amb els ${status.known} mesos que ha publicat l'INE, la mitjana és del ${p}: una pensió de ${from} al mes passaria a ${to}.`,
          en: `On the ${status.known} months the INE has released, the average is ${p}: a pension of ${from} a month would become ${to}.`,
        }),
        missing
          ? L(locale, {
              es: `Es provisional: falta el IPC de ${monthText(missing, "es")}, ${flashOut ? `cuyo dato adelantado publicó el INE el ${bareDay(INE_FLASH_DAY, "es")}; el definitivo llega` : `que el INE publica adelantado el ${bareDay(INE_FLASH_DAY, "es")} y definitivo`} el ${bareDay(finalDay, "es")}.`,
              ca: `És provisional: falta l'IPC de ${monthText(missing, "ca")}, ${flashOut ? `la dada avançada del qual l'INE va publicar ${elDay(INE_FLASH_DAY, "ca")}; la definitiva arriba` : `que l'INE publica avançat ${elDay(INE_FLASH_DAY, "ca")} i definitiu`} ${elDay(finalDay, "ca")}.`,
              en: `It is provisional: ${monthText(missing, "en")}'s CPI is missing; ${flashOut ? `the INE released its flash estimate on ${bareDay(INE_FLASH_DAY, "en")} and the final figure comes` : `the INE releases a flash estimate on ${bareDay(INE_FLASH_DAY, "en")} and the final figure`} on ${bareDay(finalDay, "en")}.`,
            })
          : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "flash":
      return [
        rule,
        L(locale, {
          es: `Con el IPC adelantado de noviembre (${pct(status.flash!.value, 1, "es")}, INE, ${bareDay(status.flash!.published, "es")}), la media de los 12 meses da una subida del ${p}: una pensión de ${from} al mes pasaría a ${to}. El INE publica el dato definitivo el ${bareDay(finalDay, "es")} y el Gobierno lo aprueba después en el BOE.`,
          ca: `Amb l'IPC avançat de novembre (${pct(status.flash!.value, 1, "ca")}, INE, ${bareDay(status.flash!.published, "ca")}), la mitjana dels 12 mesos dona una pujada del ${p}: una pensió de ${from} al mes passaria a ${to}. L'INE publica la dada definitiva ${elDay(finalDay, "ca")} i el Govern l'aprova després al BOE.`,
          en: `With November's flash CPI (${pct(status.flash!.value, 1, "en")}, INE, ${bareDay(status.flash!.published, "en")}), the 12-month average gives an increase of ${p}: a pension of ${from} a month would become ${to}. The INE releases the final figure on ${bareDay(finalDay, "en")} and the government then approves it in the BOE.`,
        }),
      ].join(" ");
    case "final":
      return [
        rule,
        L(locale, {
          es: `Con los 12 datos definitivos del INE, la subida es del ${p}: una pensión de ${from} al mes pasa a ${to}. Falta que el Gobierno lo apruebe en el BOE, como hizo para 2026 con el Real Decreto-ley 3/2026.`,
          ca: `Amb les 12 dades definitives de l'INE, la pujada és del ${p}: una pensió de ${from} al mes passa a ${to}. Falta que el Govern ho aprovi al BOE, com va fer per al 2026 amb el Reial decret llei 3/2026.`,
          en: `With the INE's 12 final figures, the increase is ${p}: a pension of ${from} a month becomes ${to}. The government still has to approve it in the BOE, as it did for 2026 with Royal Decree-law 3/2026.`,
        }),
      ].join(" ");
    case "official":
      return [
        rule,
        L(locale, {
          es: `Es oficial: ${p} (${status.official!.norm}, BOE del ${bareDay(status.official!.published, "es")}). Una pensión de ${from} al mes pasa a ${to}.`,
          ca: `És oficial: ${p} (${status.official!.norm}, BOE ${elDay(status.official!.published, "ca").replace(/^(el |l')/, "del ")}). Una pensió de ${from} al mes passa a ${to}.`,
          en: `It is official: ${p} (${status.official!.norm}, BOE of ${bareDay(status.official!.published, "en")}). A pension of ${from} a month becomes ${to}.`,
        }),
      ].join(" ");
  }
}

/** One line under the lead: where the CPI figures come from on this render. */
export function freshnessText(locale: PensionLocale, live: boolean, today: string, snapshotAsOf: string): string {
  return live
    ? L(locale, {
        es: `Datos del IPC leídos del INE ${elDay(today, "es")}.`,
        ca: `Dades de l'IPC llegides de l'INE ${elDay(today, "ca")}.`,
        en: `CPI figures read from the INE ${elDay(today, "en")}.`,
      })
    : L(locale, {
        es: `No hemos podido leer el INE en este momento: el IPC es el de nuestra copia ${elDay(snapshotAsOf, "es")}.`,
        ca: `No hem pogut llegir l'INE en aquest moment: l'IPC és el de la nostra còpia ${elDay(snapshotAsOf, "ca")}.`,
        en: `We could not read the INE just now: the CPI is from our copy taken ${elDay(snapshotAsOf, "en")}.`,
      });
}

/** Sitemap: the three editions, last modified on the newest CPI release in the snapshot (or the official norm). */
export function pensionSitemapEntries(): MetadataRoute.Sitemap {
  const e = pensionEditions();
  const pts = RENT_SNAPSHOT.series.ipc.points.filter((p) => p.value !== null);
  const last = [pts.at(-1)?.published ?? RENT_SNAPSHOT.asOf, OFFICIAL_2027?.published ?? ""].sort().at(-1)!;
  // x-default = the English edition, as buildAlternates (lib/seo/metadata.ts) says in the page head.
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return PENSION_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${last}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}
