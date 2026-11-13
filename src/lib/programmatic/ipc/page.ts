import type { MetadataRoute } from "next";

import { NOVEMBER_FLASH, type FlashFigure } from "@/lib/programmatic/pensions-2027/rules";
import { absoluteUrl } from "@/lib/site";

import { IPC_SNAPSHOT } from "./data";
import { IPC_LOCALES, bareDay, caOfMonth, elDay, ipcEditions, monthText, rate, signedRate, type IpcLocale } from "./copy";
import { latestFigures, nextReleases, type IpcData, type Latest } from "./series";

/**
 * The words of the IPC page that depend on the INE's figures: title,
 * description, the answer-first lead, the next releases and the freshness
 * line. Pure: the tests run it on the committed snapshot and made-up data.
 */

const L = <T>(locale: IpcLocale, v: Record<IpcLocale, T>): T => v[locale];

/** "octubre de 2026" / "d'octubre de 2026" (Catalan, after "IPC") / "October 2026". */
const ofMonth = (month: string, locale: IpcLocale) => (locale === "ca" ? caOfMonth(month) : locale === "es" ? `de ${monthText(month, "es")}` : monthText(month, "en"));

/**
 * The INE flash estimates typed in by hand from its press releases (the
 * pensions module keeps November 2026's); shown only for a month newer than
 * the newest final figure.
 */
export function flashAfter(data: IpcData, flashes: readonly (FlashFigure | null)[] = [NOVEMBER_FLASH]): FlashFigure | null {
  const last = latestFigures(data)?.month ?? "";
  return flashes.filter((f): f is FlashFigure => f !== null && f.month > last).sort((a, b) => (a.month < b.month ? 1 : -1))[0] ?? null;
}

export function ipcMeta(locale: IpcLocale, latest: Latest | null): { title: string; description: string; h1: string; breadcrumb: string } {
  const r = latest ? rate(latest.general, locale) : "";
  const m = latest ? latest.month : "";
  return L(locale, {
    es: {
      title: latest ? `IPC hoy: ${r} en ${monthText(m, "es")} y calendario del INE` : "IPC hoy: último dato y calendario del INE",
      description: latest
        ? `IPC del INE ${ofMonth(m, "es")}: ${r} anual, ${signedRate(latest.generalMonthly, "es")} mensual, subyacente ${rate(latest.core, "es")}. Últimos 24 meses, calendario del INE y para qué sirve.`
        : "Último IPC del INE, los últimos 24 meses, el calendario de publicación y para qué sirve: pensiones y alquiler.",
      h1: "IPC hoy: último dato y calendario del INE",
      breadcrumb: "IPC",
    },
    ca: {
      title: latest ? `IPC ${caOfMonth(m)}: ${r} i calendari de l'INE` : "IPC avui: última dada i calendari de l'INE",
      description: latest
        ? `IPC de l'INE ${caOfMonth(m)}: ${r} anual, ${signedRate(latest.generalMonthly, "ca")} mensual, subjacent ${rate(latest.core, "ca")}. Últims 24 mesos, calendari de l'INE i per a què serveix.`
        : "Últim IPC de l'INE, els últims 24 mesos, el calendari de publicació i per a què serveix: pensions i lloguer.",
      h1: "IPC avui: última dada i calendari de l'INE",
      breadcrumb: "IPC",
    },
    en: {
      title: latest ? `Spain CPI: ${r} in ${monthText(m, "en")} and INE release dates` : "Spain CPI today: latest figure and INE release dates",
      description: latest
        ? `Spain's CPI (INE) for ${monthText(m, "en")}: ${r} a year, ${signedRate(latest.generalMonthly, "en")} on the month, core ${rate(latest.core, "en")}. The last 24 months and the INE's release calendar.`
        : "Spain's latest CPI from the INE, the last 24 months, the release calendar and what it is used for: pensions and rent.",
      h1: "Spain's CPI today: latest figure and INE release calendar",
      breadcrumb: "CPI (IPC)",
    },
  });
}

/** The next INE releases in one sentence, or "" when the calendar has none left. */
export function nextText(locale: IpcLocale, data: IpcData, today: string): string {
  const { flash, final } = nextReleases(data, today);
  const parts: string[] = [];
  if (flash) parts.push(L(locale, { es: `el adelantado ${ofMonth(flash.month, "es")} el ${bareDay(flash.day, "es")}`, ca: `l'avançat ${caOfMonth(flash.month)} ${elDay(flash.day, "ca")}`, en: `the flash estimate for ${monthText(flash.month, "en")} on ${bareDay(flash.day, "en")}` }));
  if (final) parts.push(L(locale, { es: `el definitivo ${ofMonth(final.month, "es")} el ${bareDay(final.day, "es")}`, ca: `el definitiu ${caOfMonth(final.month)} ${elDay(final.day, "ca")}`, en: `the final figure for ${monthText(final.month, "en")} on ${bareDay(final.day, "en")}` }));
  if (parts.length === 0) return "";
  const joined = parts.join(L(locale, { es: " y ", ca: " i ", en: " and " }));
  return L(locale, { es: `Próximos datos del INE (a las 9:00): ${joined}.`, ca: `Properes dades de l'INE (a les 9.00): ${joined}.`, en: `Next INE releases (9:00 Madrid time): ${joined}.` });
}

export function leadText(locale: IpcLocale, data: IpcData, today: string): string {
  const latest = latestFigures(data);
  const next = nextText(locale, data, today);
  if (!latest) return [L(locale, { es: "No tenemos ahora el último dato del IPC del INE.", ca: "Ara no tenim l'última dada de l'IPC de l'INE.", en: "We do not have the INE's latest CPI figure right now." }), next].filter(Boolean).join(" ");
  const m = latest.month;
  const day = latest.published;
  const monthly = latest.generalMonthly;
  const core = latest.core;
  const first = L(locale, {
    es: `El IPC general subió un ${rate(latest.general, "es")} en los doce meses hasta ${monthText(m, "es")}${monthly !== null ? ` y varió un ${signedRate(monthly, "es")} respecto al mes anterior` : ""}${core !== null ? `; la inflación subyacente (sin alimentos no elaborados ni energía) fue del ${rate(core, "es")}` : ""}.${day ? ` Lo publicó el INE el ${bareDay(day, "es")}.` : ""}`,
    ca: `L'IPC general va pujar un ${rate(latest.general, "ca")} en els dotze mesos fins ${caOfMonth(m).replace(/^de /, "al ").replace(/^d'/, "a l'")}${monthly !== null ? ` i va variar un ${signedRate(monthly, "ca")} respecte al mes anterior` : ""}${core !== null ? `; la inflació subjacent (sense aliments no elaborats ni energia) va ser del ${rate(core, "ca")}` : ""}.${day ? ` El va publicar l'INE ${elDay(day, "ca")}.` : ""}`,
    en: `Spain's all-items CPI rose ${rate(latest.general, "en")} in the twelve months to ${monthText(m, "en")}${monthly !== null ? ` and changed ${signedRate(monthly, "en")} on the previous month` : ""}${core !== null ? `; core inflation (excluding unprocessed food and energy) was ${rate(core, "en")}` : ""}.${day ? ` The INE released it on ${bareDay(day, "en")}.` : ""}`,
  });
  const flash = flashAfter(data);
  const flashLine = flash
    ? L(locale, {
        es: `El indicador adelantado ${ofMonth(flash.month, "es")} es del ${rate(flash.value, "es")} (INE, ${bareDay(flash.published, "es")}).`,
        ca: `L'indicador avançat ${caOfMonth(flash.month)} és del ${rate(flash.value, "ca")} (INE, ${bareDay(flash.published, "ca")}).`,
        en: `The flash estimate for ${monthText(flash.month, "en")} is ${rate(flash.value, "en")} (INE, ${bareDay(flash.published, "en")}).`,
      })
    : "";
  return [first, flashLine, next].filter(Boolean).join(" ");
}

/** One line under the lead: where the figures come from on this render. */
export function freshnessText(locale: IpcLocale, live: boolean, today: string, snapshotAsOf: string): string {
  return live
    ? L(locale, { es: `Datos leídos de la API del INE ${elDay(today, "es")}.`, ca: `Dades llegides de l'API de l'INE ${elDay(today, "ca")}.`, en: `Figures read from the INE's API ${elDay(today, "en")}.` })
    : L(locale, {
        es: `No hemos podido leer el INE en este momento: los datos son los de nuestra copia ${elDay(snapshotAsOf, "es")}.`,
        ca: `No hem pogut llegir l'INE en aquest moment: les dades són les de la nostra còpia ${elDay(snapshotAsOf, "ca")}.`,
        en: `We could not read the INE just now: the figures are from our copy taken ${elDay(snapshotAsOf, "en")}.`,
      });
}

/** Sitemap: the three editions, last modified on the newest CPI release in the snapshot. */
export function ipcSitemapEntries(): MetadataRoute.Sitemap {
  const e = ipcEditions();
  const last = latestFigures(IPC_SNAPSHOT)?.published ?? IPC_SNAPSHOT.asOf;
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return IPC_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${last}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}
