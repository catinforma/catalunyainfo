import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import { dateYear } from "./festive";
import { STRIKE_URLS } from "./strikes";

/**
 * "Fonts revisades el 25 de novembre de 2026: …" (25 Nov 2026, ci-edicio /
 * ci-enginyeria, docs/SEO_EXPERIMENTS.md): the line every strike day page and
 * strike guide prints right under its answer, naming the two or three
 * official sources the page stands on, each with its link. Why: the strike
 * pages are 41 % of the sessions that arrive from AI assistants
 * (scratchpad/night/ai-traffic.md), and an assistant that quotes a page quotes
 * the date and the source beside the answer; before this, the date sat in the
 * byline or in the last paragraph and the sources in a list at the bottom.
 *
 * The date is the page's own VERIFIED constant (the day its sources were last
 * re-read), passed in by the page builder: never a literal here, never the
 * clock, never later than the as-of day (each page applies its own
 * `checkedOn`, as its "sources checked" lines already did). A re-read that
 * moves the constant moves this line with it.
 *
 * The names are the publishers' own; the links are the URLs the page already
 * cites in its body and sources list (read on 25 Nov 2026, see the constants'
 * comments in strikes.ts and strikes-spain-data.ts).
 *
 * Load order: strikes.ts builds the Catalan hub while it loads and prints this
 * line, and this module imports STRIKE_URLS from strikes.ts. So everything here
 * is a function declaration (hoisted) that reads the URLs when called, never a
 * constant evaluated at load; and the Students' Union and Renfe 11N links are
 * the literals of SPAIN_URLS.students and SPAIN_URLS.renfe11n, because
 * strikes-spain-data.ts imports strikes.ts (a test pins them equal).
 */

export interface CitableSource {
  /** Name per language: the publisher and what it publishes. */
  name: Record<Locale, string>;
  url: string;
}

function catalogue() {
  const treball: CitableSource = {
    name: {
      ca: "Departament d'Empresa i Treball (vagues amb serveis mínims)",
      es: "Departament d'Empresa i Treball (huelgas con servicios mínimos)",
      en: "Catalan Department of Business and Labour (strikes with minimum services)",
    },
    url: STRIKE_URLS.treballMs,
  };
  const ministryRail: CitableSource = {
    name: {
      ca: "Ministeri de Transports (resolucions de serveis mínims ferroviaris)",
      es: "Ministerio de Transportes (resoluciones de servicios mínimos ferroviarios)",
      en: "Ministry of Transport (rail minimum-services resolutions)",
    },
    url: STRIKE_URLS.ministryRail,
  };
  const rodalies: CitableSource = {
    name: { ca: "Rodalies de Catalunya (alteracions del servei)", es: "Rodalies de Catalunya (alteraciones del servicio)", en: "Rodalies de Catalunya (service alerts)" },
    url: STRIKE_URLS.rodaliesStatus,
  };
  const smu: CitableSource = {
    name: { ca: "Sindicato Médicos Unidos (preavís de vaga)", es: "Sindicato Médicos Unidos (preaviso de huelga)", en: "Sindicato Médicos Unidos (strike notice)" },
    url: STRIKE_URLS.smuNotice,
  };
  const semafCallOff: CitableSource = {
    name: {
      ca: "SEMAF (comunicat 2026-38, desconvocatòria del 23 de novembre)",
      es: "SEMAF (comunicado 2026-38, desconvocatoria del 23 de noviembre)",
      en: "SEMAF (notice 2026-38, call-off of 23 November)",
    },
    url: STRIKE_URLS.semaf38,
  };
  const scfCallOff: CitableSource = {
    name: {
      ca: "SCF (comunicat 38, desconvocatòria del 19 de novembre)",
      es: "SCF (comunicado 38, desconvocatoria del 19 de noviembre)",
      en: "SCF (notice 38, call-off of 19 November)",
    },
    url: STRIKE_URLS.scf38,
  };
  const cgt26: CitableSource = {
    name: {
      ca: "CGT Ensenyament (preavís de vaga del 26 de novembre)",
      es: "CGT Ensenyament (preaviso de huelga del 26 de noviembre)",
      en: "CGT Ensenyament (strike notice for 26 November)",
    },
    url: STRIKE_URLS.cgtEns26Notice,
  };
  const ustec26: CitableSource = {
    name: { ca: "USTEC·STEs (convocatòria del 26N)", es: "USTEC·STEs (convocatoria del 26N)", en: "USTEC·STEs (26 November call)" },
    url: STRIKE_URLS.ustec26,
  };
  const students20: CitableSource = {
    name: {
      ca: "Sindicato de Estudiantes (convocatòria del 20N)",
      es: "Sindicato de Estudiantes (convocatoria del 20N)",
      en: "Sindicato de Estudiantes (20 November call)",
    },
    url: "https://www.sindicatodeestudiantes.net/index.php/noticias/internacional/20n-huelga-estudiantil-europea",
  };
  const orderRodalies17: CitableSource = {
    name: {
      ca: "Ordre del Departament d'Empresa i Treball del 12 de novembre (Rodalies, 17N)",
      es: "Orden del Departament d'Empresa i Treball del 12 de noviembre (Rodalies, 17N)",
      en: "Order of the Department of Business and Labour of 12 November (Rodalies, 17 November)",
    },
    url: STRIKE_URLS.ordreRenfe17,
  };
  const ministryRenfe17: CitableSource = {
    name: {
      ca: "Ministeri de Transports (resolució del 12 de novembre, Grup Renfe, 17N)",
      es: "Ministerio de Transportes (resolución del 12 de noviembre, Grupo Renfe, 17N)",
      en: "Ministry of Transport (resolution of 12 November, Renfe Group, 17 November)",
    },
    url: STRIKE_URLS.ministryRenfe17,
  };
  const order11n: CitableSource = {
    name: {
      ca: "Ordre del Departament d'Empresa i Treball del 5 de novembre (serveis mínims de l'11N)",
      es: "Orden del Departament d'Empresa i Treball del 5 de noviembre (servicios mínimos del 11N)",
      en: "Order of the Department of Business and Labour of 5 November (minimum services for 11 November)",
    },
    url: STRIKE_URLS.ordre11n,
  };
  const renfe11n: CitableSource = {
    name: {
      ca: "Renfe (serveis mínims de la vaga general de l'11N)",
      es: "Renfe (servicios mínimos de la huelga general del 11N)",
      en: "Renfe (minimum services for the 11 November general strike)",
    },
    url: "https://grupo.renfe.com/es/es/sala-de-prensa/noticias/2026/11/establecidos-los-servicios-minimos-para-la-huelga-general-convocada-el-11n",
  };
  const ccoo11n: CitableSource = {
    name: { ca: "CCOO (registre de la vaga general de l'11N)", es: "CCOO (registro de la huelga general del 11N)", en: "CCOO (registration of the 11 November general strike)" },
    url: STRIKE_URLS.ccooRegistered,
  };

  return {
    strike11n: [order11n, renfe11n, ccoo11n],
    railStrike17n: [ministryRenfe17, orderRodalies17, scfCallOff],
    strike19n: [smu, treball, scfCallOff],
    strike20n: [students20, smu, treball],
    strike23n: [semafCallOff, ministryRail, treball],
    strike26n: [treball, cgt26, ustec26],
    strikeEducation: [treball, cgt26, ustec26],
    strikeRenfe: [ministryRail, treball, rodalies],
    strikes: [treball, ministryRail, rodalies],
    strikesSpain: [ministryRail, treball, smu],
  } satisfies Record<string, CitableSource[]>;
}

export type CitableKey = keyof ReturnType<typeof catalogue>;

/** The named sources of one strike page kind; the two or three official sources its line prints. */
export function citableSources(key: CitableKey): CitableSource[] {
  return catalogue()[key];
}

/** Every page kind that carries the line. */
export function citableKeys(): CitableKey[] {
  return Object.keys(catalogue()) as CitableKey[];
}

/**
 * The line's own words with the date: "Fonts revisades el 25 de novembre de 2026", "Fuentes revisadas el 25 de noviembre de 2026",
 * "Sources checked on 25 November 2026". Catalan elides before 1 and 11 ("Fonts revisades l'11 de novembre de 2026").
 */
export function citableLabel(locale: Locale, checked: string): string {
  const day = Number(checked.slice(8, 10));
  const article = locale === "ca" && (day === 1 || day === 11) ? "l'" : "el ";
  const lead = { ca: `Fonts revisades ${article}`, es: "Fuentes revisadas el ", en: "Sources checked on " }[locale];
  return `${lead}${dateYear(checked, locale)}`;
}

/**
 * "**Fonts revisades el 25 de novembre de 2026:** [A](url) · [B](url) · [C](url)." as a paragraph.
 * `checked` is the ISO day the page's sources were last re-read (its VERIFIED constant, through
 * the page's own `checkedOn`): this function never invents a date.
 */
export function sourcesCheckedLine(locale: Locale, checked: string, key: CitableKey): Block {
  const links = citableSources(key)
    .map((source) => `[${source.name[locale]}](${source.url})`)
    .join(" · ");
  return { type: "paragraph", text: `**${citableLabel(locale, checked)}:** ${links}.` } as Block;
}
