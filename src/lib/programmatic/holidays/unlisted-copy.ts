import { DESCRIPTION_MAX, TITLE_MAX, councilDays, councilLabel, councilSource, fit, type CouncilSource } from "./copy";
import { NEXT, YEAR, NEXT_YEAR, isAran, regionalDays, type UnlistedTown } from "./data";
import { dayMonth, dayPair, weekdayDayMonth } from "./format";
import { caA, caDe, caStart, esName, joinList } from "./names";
import type { MuniLocale } from "./paths";

/**
 * Copy for the pages of the councils the 2026 order lists with "proposta no
 * formulada" that have 2027 days (`unlistedTowns` in data.ts). The answer
 * leads: next year's two days with their label ("aprovats per l'Ajuntament
 * (ple …), pendents de l'ordre del DOGC") and the source, then the 2026 fact
 * (no local day in the official calendar). Deterministic: no clock.
 */

export interface UnlistedCopy {
  title: string;
  description: string;
  h1: string;
  /** First paragraph: the 2027 days and their status. */
  lead: string;
  /** The line under it: the order is still to come, or which order fixed them. */
  status: string;
  source: CouncilSource | null;
  tableTitle: string;
  tableCaption: string;
  regionalLead: string;
  title2026: string;
  text2026: string;
  faq: { question: string; answer: string }[];
}

function days(u: UnlistedTown): [string, string] | null {
  const local = u.next?.local ?? u.council?.local ?? null;
  return local && local.length === 2 ? [local[0]!, local[1]!] : null;
}

function wdList(dates: readonly string[], locale: MuniLocale): string {
  return joinList(dates.map((d) => `el ${weekdayDayMonth(d, locale)}`), locale);
}

export function unlistedCopy(u: UnlistedTown, locale: MuniLocale): UnlistedCopy {
  const pair = days(u);
  const regionalNext = joinList(regionalDays(NEXT, isAran(u)).map((d) => dayMonth(d.date, locale)), locale);
  const order = NEXT_YEAR.order;
  if (locale === "ca") {
    const name = u.name;
    const local2027 = u.next
      ? `Els festius locals ${caDe(name)} el ${NEXT} són ${wdList(u.next.local, "ca")}.`
      : `Els festius locals ${caDe(name)} el ${NEXT} seran ${councilDays(u.council!, "ca")}: ${councilLabel(u.council!, "ca")}.`;
    const text2026 = `L'ordre de festes locals del ${YEAR} (Ordre EMT/208/2025, DOGC del 17 de desembre de 2025) no fixa cap festiu local per a ${name}: hi diu «proposta no formulada», perquè l'ajuntament no va enviar la proposta a temps, i la modificació de gener no ho va canviar. El ${YEAR}, doncs, ${caA(name)} el calendari oficial només té els dotze festius de tot Catalunya.`;
    return {
      title: fit(
        pair
          ? [`Festius locals ${name} ${NEXT}: ${dayPair(pair[0], pair[1], "ca")}`, `Festius ${name} ${NEXT}: ${dayPair(pair[0], pair[1], "ca")}`, `Festius locals ${name} ${NEXT}`]
          : [`Festius locals ${name} ${NEXT}`],
        TITLE_MAX,
      ),
      description: fit(
        [
          `${caStart(name)} el ${NEXT}: festius locals el ${pair ? dayPair(pair[0], pair[1], "ca") : ""}, ${u.next ? "segons l'ordre del DOGC" : "aprovats per l'Ajuntament i pendents del DOGC"}. El ${YEAR} no en té cap al calendari oficial.`,
          `${caStart(name)} el ${NEXT}: festius locals el ${pair ? dayPair(pair[0], pair[1], "ca") : ""}, ${u.next ? "segons l'ordre del DOGC" : "aprovats per l'Ajuntament i pendents del DOGC"}.`,
        ],
        DESCRIPTION_MAX,
      ),
      h1: `Festius locals ${caDe(name)} ${NEXT}`,
      lead: local2027,
      status: u.next
        ? `Els fixa ${order ? order.name : `l'ordre de festes locals del ${NEXT}`}. S'hi sumen els dotze festius de tot Catalunya.`
        : `L'ordre del Departament d'Empresa i Treball que els fa oficials, a proposta de cada ajuntament, encara no ha sortit; la del ${YEAR} va sortir al DOGC el 17 de desembre de 2025. S'hi sumen els dotze festius de tot Catalunya, que ja són oficials (Ordre EMT/52/2026).`,
      source: u.council && !u.next ? councilSource(u.council, "ca") : null,
      tableTitle: `Tots els festius del ${NEXT} ${caA(name)}`,
      tableCaption: `Festius de Catalunya i festius locals ${caDe(name)}, ${NEXT}`,
      regionalLead: `Els dotze festius de tot Catalunya del ${NEXT}:`,
      title2026: `I el ${YEAR}?`,
      text2026,
      faq: [
        { question: `Quins són els festius locals ${caDe(name)} el ${NEXT}?`, answer: `${local2027} S'hi sumen els dotze de tot Catalunya: ${regionalNext}.` },
        { question: `${caStart(name)} té festius locals el ${YEAR}?`, answer: text2026 },
        {
          question: `Quin és el calendari laboral ${NEXT} ${caDe(name)}?`,
          answer: `Catorze festius: els dotze de tot Catalunya (${regionalNext}) i els dos locals${pair ? `, el ${dayPair(pair[0], pair[1], "ca")}` : ""}${u.next ? "" : ", encara pendents de l'ordre del DOGC"}.`,
        },
      ],
    };
  }
  const name = esName(u.name);
  const local2027 = u.next
    ? `Los festivos locales de ${name} en ${NEXT} son ${wdList(u.next.local, "es")}.`
    : `Los festivos locales de ${name} en ${NEXT} serán ${councilDays(u.council!, "es")}: ${councilLabel(u.council!, "es")}.`;
  const text2026 = `La orden de fiestas locales de ${YEAR} (Orden EMT/208/2025, DOGC del 17 de diciembre de 2025) no fija ningún festivo local para ${name}: dice «proposta no formulada», porque el ayuntamiento no envió la propuesta a tiempo, y la modificación de enero no lo cambió. En ${YEAR}, por tanto, el calendario oficial de ${name} solo tiene los doce festivos de toda Cataluña.`;
  return {
    title: fit(
      pair
        ? [`Festivos locales ${name} ${NEXT}: ${dayPair(pair[0], pair[1], "es")}`, `Festivos ${name} ${NEXT}: ${dayPair(pair[0], pair[1], "es")}`, `Festivos locales ${name} ${NEXT}`]
        : [`Festivos locales ${name} ${NEXT}`],
      TITLE_MAX,
    ),
    description: fit(
      [
        `${name} en ${NEXT}: festivos locales el ${pair ? dayPair(pair[0], pair[1], "es") : ""}, ${u.next ? "según la orden del DOGC" : "aprobados por el Ayuntamiento y pendientes del DOGC"}. En ${YEAR} no tiene ninguno en el calendario oficial.`,
        `${name} en ${NEXT}: festivos locales el ${pair ? dayPair(pair[0], pair[1], "es") : ""}, ${u.next ? "según la orden del DOGC" : "aprobados por el Ayuntamiento y pendientes del DOGC"}.`,
      ],
      DESCRIPTION_MAX,
    ),
    h1: `Festivos locales de ${name} ${NEXT}`,
    lead: local2027,
    status: u.next
      ? `Los fija ${order ? order.name : `la orden de fiestas locales de ${NEXT}`}. Se suman a los doce festivos de toda Cataluña.`
      : `La orden del Departament d'Empresa i Treball que los hace oficiales, a propuesta de cada ayuntamiento, todavía no ha salido; la de ${YEAR} salió en el DOGC el 17 de diciembre de 2025. Se suman a los doce festivos de toda Cataluña, que ya son oficiales (Orden EMT/52/2026).`,
    source: u.council && !u.next ? councilSource(u.council, "es") : null,
    tableTitle: `Todos los festivos de ${NEXT} en ${name}`,
    tableCaption: `Festivos de Cataluña y festivos locales de ${name}, ${NEXT}`,
    regionalLead: `Los doce festivos de toda Cataluña en ${NEXT}:`,
    title2026: `¿Y en ${YEAR}?`,
    text2026,
    faq: [
      { question: `¿Cuáles son los festivos locales de ${name} en ${NEXT}?`, answer: `${local2027} Se suman a los doce de toda Cataluña: ${regionalNext}.` },
      { question: `¿${name} tiene festivos locales en ${YEAR}?`, answer: text2026 },
      {
        question: `¿Cuál es el calendario laboral ${NEXT} de ${name}?`,
        answer: `Catorce festivos: los doce de toda Cataluña (${regionalNext}) y los dos locales${pair ? `, el ${dayPair(pair[0], pair[1], "es")}` : ""}${u.next ? "" : ", todavía pendientes de la orden del DOGC"}.`,
      },
    ],
  };
}
