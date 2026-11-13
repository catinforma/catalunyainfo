import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { SMI_LOCALES, bareDay, elDay, money, pct, smiEditions, type SmiLocale } from "./copy";
import { increaseOn, prorated12, smi2027Status, type LiveBoe, type Smi2027Status } from "./engine";
import { DRAFT_2027, OFFICIAL_2027, SMI_2026, SMI_RULES_AS_OF, type SmiYear } from "./rules";

/**
 * The words of the SMI page that depend on where 2027 stands (draft →
 * published in the BOE → amounts known): title, description, the
 * answer-first lead and the freshness line. Pure: the tests run it on every
 * state.
 */

const L = <T>(locale: SmiLocale, v: Record<SmiLocale, T>): T => v[locale];

export function statusOf(live: LiveBoe | null): Smi2027Status {
  return smi2027Status(live, OFFICIAL_2027);
}

export function smiMeta(locale: SmiLocale, status: Smi2027Status): { title: string; description: string; h1: string; breadcrumb: string } {
  const m26 = money(SMI_2026.monthly, locale);
  const draft = money(DRAFT_2027.monthly, locale);
  const off = status.kind === "official" ? status.year : null;
  const m27 = off ? money(off.monthly, locale) : "";
  return L(locale, {
    es: {
      title: off ? `Salario mínimo 2027: ${m27} al mes en 14 pagas (BOE)` : status.kind === "published" ? "Salario mínimo 2027: ya publicado en el BOE" : `Salario mínimo 2027: proyecto de ${draft}; SMI 2026, ${m26}`,
      description: off
        ? `SMI 2027 oficial: ${m27} al mes en 14 pagas, ${money(off.annual, "es")} al año, por día y por hora (empleo de hogar), con el real decreto del BOE. Calculadora a tiempo parcial.`
        : `SMI 2026: ${m26} al mes en 14 pagas (RD 126/2026). Qué hay oficial del SMI 2027, el proyecto de Trabajo, la historia desde 2018 y calculadora a tiempo parcial.`,
      h1: "Salario mínimo (SMI) 2027: cuantía oficial, proyecto y calculadora",
      breadcrumb: "Salario mínimo 2027",
    },
    ca: {
      title: off ? `Salari mínim 2027: ${m27} al mes en 14 pagues (BOE)` : status.kind === "published" ? "Salari mínim 2027: ja publicat al BOE" : `Salari mínim 2027: projecte de ${draft}; SMI 2026, ${m26}`,
      description: off
        ? `SMI 2027 oficial: ${m27} al mes en 14 pagues, ${money(off.annual, "ca")} l'any, per dia i per hora (treball de la llar), amb el reial decret del BOE. Calculadora a temps parcial.`
        : `SMI 2026: ${m26} al mes en 14 pagues (RD 126/2026). Què és oficial de l'SMI 2027, el projecte de Treball, la història des del 2018 i calculadora a temps parcial.`,
      h1: "Salari mínim (SMI) 2027: quantia oficial, projecte i calculadora",
      breadcrumb: "Salari mínim 2027",
    },
    en: {
      title: off ? `Spain minimum wage 2027: ${m27} a month (BOE)` : status.kind === "published" ? "Spain minimum wage 2027: now in the BOE" : `Spain minimum wage 2027: ${draft} draft; 2026 SMI ${m26}`,
      description: off
        ? `Spain's official 2027 minimum wage (SMI): ${m27} a month in 14 payments, ${money(off.annual, "en")} a year, per day and per hour for domestic work, from the BOE decree.`
        : `Spain's 2026 minimum wage: ${m26} a month in 14 payments (RD 126/2026). What is official for 2027, the draft, history since 2018, part-time calculator.`,
      h1: "Spain's minimum wage (SMI) 2027: official amount, draft and calculator",
      breadcrumb: "Minimum wage 2027",
    },
  });
}

/** "1.221 € al mes en 14 pagas (17.094 € al año), 40,70 € al día y 9,55 € la hora en el empleo de hogar". */
export function amountsText(y: SmiYear, locale: SmiLocale): string {
  return L(locale, {
    es: `${money(y.monthly, "es")} al mes en 14 pagas (${money(y.annual, "es")} al año; ${money(prorated12(y), "es")} si se cobra en 12), ${money(y.daily, "es")} al día y ${money(y.domesticHourly, "es")} la hora en el empleo de hogar`,
    ca: `${money(y.monthly, "ca")} al mes en 14 pagues (${money(y.annual, "ca")} l'any; ${money(prorated12(y), "ca")} si es cobra en 12), ${money(y.daily, "ca")} al dia i ${money(y.domesticHourly, "ca")} l'hora en el treball de la llar`,
    en: `${money(y.monthly, "en")} a month in 14 payments (${money(y.annual, "en")} a year; ${money(prorated12(y), "en")} if paid in 12), ${money(y.daily, "en")} a day and ${money(y.domesticHourly, "en")} an hour for domestic work`,
  });
}

/** "(Real Decreto 126/2026, BOE del 19 de febrero de 2026)". */
function normRef(y: Pick<SmiYear, "norm" | "published">, locale: SmiLocale): string {
  const short = y.norm.replace(/, de \d{1,2} de [a-záéíóú]+$/i, "");
  return L(locale, {
    es: `${short}, BOE del ${bareDay(y.published, "es")}`,
    ca: `${short}, BOE del ${bareDay(y.published, "ca")}`,
    en: `${short}, BOE of ${bareDay(y.published, "en")}`,
  });
}

export function leadText(locale: SmiLocale, status: Smi2027Status, today: string): string {
  const y26 = `${amountsText(SMI_2026, locale)} (${normRef(SMI_2026, locale)})`;
  if (status.kind === "official") {
    const y = status.year;
    const rise = increaseOn(SMI_2026, y);
    return L(locale, {
      es: `Es oficial: el salario mínimo interprofesional (SMI) de 2027 es de ${amountsText(y, "es")} (${normRef(y, "es")}). ${rise !== null ? `Sube un ${pct(rise, 1, "es")} sobre los ${money(SMI_2026.monthly, "es")} de 2026.` : ""}`.trim(),
      ca: `És oficial: el salari mínim interprofessional (SMI) del 2027 és de ${amountsText(y, "ca")} (${normRef(y, "ca")}). ${rise !== null ? `Puja un ${pct(rise, 1, "ca")} sobre els ${money(SMI_2026.monthly, "ca")} del 2026.` : ""}`.trim(),
      en: `It is official: Spain's 2027 minimum wage (SMI) is ${amountsText(y, "en")} (${normRef(y, "en")}). ${rise !== null ? `That is ${pct(rise, 1, "en")} more than 2026's ${money(SMI_2026.monthly, "en")}.` : ""}`.trim(),
    });
  }
  if (status.kind === "published") {
    const day = status.hit.published ? bareDay(status.hit.published, locale) : "";
    return L(locale, {
      es: `El BOE${day ? ` del ${day}` : ""} publica el ${status.hit.title}: consulta allí las cuantías; las añadimos aquí en cuanto las comprobamos. El último SMI con cuantías comprobadas es el de 2026: ${y26}.`,
      ca: `El BOE${day ? ` del ${day}` : ""} publica el ${status.hit.title}: consulta-hi les quanties; les afegim aquí tan bon punt les comprovem. L'últim SMI amb quanties comprovades és el del 2026: ${y26}.`,
      en: `The BOE${day ? ` of ${day}` : ""} publishes the ${status.hit.title}: check the amounts there; we add them here as soon as we have checked them. The last SMI with checked amounts is 2026's: ${y26}.`,
    });
  }
  const heard = today > DRAFT_2027.hearingTo;
  const d = DRAFT_2027;
  return L(locale, {
    es: `El último salario mínimo interprofesional (SMI) fijado en el BOE es el de 2026: ${y26}. El de 2027 aún no está aprobado: el Ministerio de Trabajo propone ${money(d.monthly, "es")} al mes en 14 pagas (+${pct(d.increase, 1, "es")}) en un proyecto de real decreto que ${heard ? "estuvo" : "está"} en audiencia pública hasta el ${bareDay(d.hearingTo, "es")}.`,
    ca: `L'últim salari mínim interprofessional (SMI) fixat al BOE és el del 2026: ${y26}. El del 2027 encara no està aprovat: el Ministeri de Treball proposa ${money(d.monthly, "ca")} al mes en 14 pagues (+${pct(d.increase, 1, "ca")}) en un projecte de reial decret que ${heard ? "va estar" : "està"} en audiència pública fins al ${bareDay(d.hearingTo, "ca")}.`,
    en: `The last minimum wage (SMI) set in the BOE is 2026's: ${y26}. 2027's is not approved yet: the Ministry of Labour proposes ${money(d.monthly, "en")} a month in 14 payments (+${pct(d.increase, 1, "en")}) in a draft royal decree ${heard ? "that was" : "that is"} open to public comment until ${bareDay(d.hearingTo, "en")}.`,
  });
}

/** One line under the lead: when the BOE was asked. */
export function freshnessText(locale: SmiLocale, checked: boolean, today: string): string {
  return checked
    ? L(locale, {
        es: `BOE consultado ${elDay(today, "es")} (cada hora). Cifras de 2018 a 2026 y documentos del Ministerio revisados ${elDay(SMI_RULES_AS_OF, "es")}.`,
        ca: `BOE consultat ${elDay(today, "ca")} (cada hora). Xifres del 2018 al 2026 i documents del Ministeri revisats ${elDay(SMI_RULES_AS_OF, "ca")}.`,
        en: `BOE checked ${elDay(today, "en")} (every hour). 2018–2026 figures and the Ministry's documents checked ${elDay(SMI_RULES_AS_OF, "en")}.`,
      })
    : L(locale, {
        es: `No hemos podido consultar el BOE en este momento. Cifras y documentos revisados ${elDay(SMI_RULES_AS_OF, "es")}.`,
        ca: `No hem pogut consultar el BOE en aquest moment. Xifres i documents revisats ${elDay(SMI_RULES_AS_OF, "ca")}.`,
        en: `We could not reach the BOE just now. Figures and documents checked ${elDay(SMI_RULES_AS_OF, "en")}.`,
      });
}

/** Sitemap: the three editions, last modified on the newest official text read. */
export function smiSitemapEntries(): MetadataRoute.Sitemap {
  const e = smiEditions();
  const last = [SMI_RULES_AS_OF, OFFICIAL_2027?.published ?? ""].sort().at(-1)!;
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return SMI_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${last}T00:00:00Z`),
    changeFrequency: "daily" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

