import { DF6_PCT, DF6_TO } from "@/lib/programmatic/rent-update/rules";

import { CATALONIA_IPC } from "./catalonia";
import { bareDay, caOfMonth, elDay, monthText, rate, signedRate, type IpcLocale } from "./copy";
import { flashAfter } from "./page";
import { latestFigures, nextReleases, type IpcData } from "./series";

/**
 * "IPC hoy" FAQ (27 Nov 2026, batch 8J): the questions searchers type on the
 * page's queries (GSC 28 days to 25 Nov: "ipc octubre 2026 catalunya" 28 at
 * 8.6, "ipc catalunya 2026" 10, "ipc novembre 2026" 7 at 10.6, "que dia sale
 * el ipc mensual" 4 at 7.5, "ipc actual" / "ipc oficial", EN "inflation rate
 * spain" 10 at 12.8, "what is the current inflation rate in spain?"). Every
 * answer is built from the same data as the lead (latest final month, the
 * typed flash, the INE calendar), so it changes by itself with each release:
 * nothing here names a month or a figure the INE has not published. The
 * Catalonia answer only exists while CATALONIA_IPC is for the page's newest
 * month (same rule as the section). Printed and FAQPage text are the same
 * strings. Pure.
 */

const L = <T>(locale: IpcLocale, v: Record<IpcLocale, T>): T => v[locale];
const ofMonthCa = (month: string) => caOfMonth(month);

export interface IpcFaqItem {
  q: string;
  a: string;
}

export function ipcFaq(locale: IpcLocale, data: IpcData, today: string): IpcFaqItem[] {
  const latest = latestFigures(data);
  if (!latest) return [];
  const m = latest.month;
  const out: IpcFaqItem[] = [];
  const day = latest.published ? bareDay(latest.published, locale) : null;
  const flash = flashAfter(data);
  const next = nextReleases(data, today);

  // 1. The current figure.
  const flashSentence = flash
    ? L(locale, {
        es: ` El indicador adelantado de ${monthText(flash.month, "es")}, una primera estimación, es del ${rate(flash.value, "es")}.`,
        ca: ` L'indicador avançat ${ofMonthCa(flash.month)}, una primera estimació, és del ${rate(flash.value, "ca")}.`,
        en: ` The flash estimate for ${monthText(flash.month, "en")}, a first estimate, is ${rate(flash.value, "en")}.`,
      })
    : "";
  out.push(
    L(locale, {
      es: {
        q: "¿Cuál es el IPC actual en España?",
        a: `El último dato definitivo es el de ${monthText(m, "es")}: el IPC general subió un ${rate(latest.general, "es")} en doce meses (${signedRate(latest.generalMonthly, "es")} respecto al mes anterior) y la subyacente, un ${rate(latest.core, "es")}${day ? `. Lo publicó el INE el ${day}` : ""}.${flashSentence}`,
      },
      ca: {
        q: "Quin és l'IPC actual a Espanya?",
        a: `L'última dada definitiva és la ${ofMonthCa(m)}: l'IPC general va pujar un ${rate(latest.general, "ca")} en dotze mesos (${signedRate(latest.generalMonthly, "ca")} respecte al mes anterior) i la subjacent, un ${rate(latest.core, "ca")}${day ? `. La va publicar l'INE ${elDay(latest.published!, "ca")}` : ""}.${flashSentence}`,
      },
      en: {
        q: "What is the current inflation rate in Spain?",
        a: `The latest final figure is for ${monthText(m, "en")}: the all-items CPI rose ${rate(latest.general, "en")} over twelve months (${signedRate(latest.generalMonthly, "en")} on the previous month) and core inflation was ${rate(latest.core, "en")}${day ? `. The INE released it on ${day}` : ""}.${flashSentence}`,
      },
    }),
  );

  // 2. Catalonia, only while the verified line is for the newest month.
  if (CATALONIA_IPC.month === m) {
    const c = CATALONIA_IPC;
    const prov = c.provinces.map((p) => `${p.name} ${rate(p.annual, locale)}`).join(", ");
    out.push(
      L(locale, {
        es: {
          q: `¿Cuál es el IPC de Cataluña en ${monthText(m, "es")}?`,
          a: `Un ${rate(c.annual, "es")} anual y un ${signedRate(c.monthly, "es")} mensual, según el INE; en España, el ${rate(latest.general, "es")}. Por provincias: ${prov}.`,
        },
        ca: {
          q: `Quin és l'IPC de Catalunya ${ofMonthCa(m).replace(/^de /, "al ").replace(/^d'/, "a l'")}?`,
          a: `Un ${rate(c.annual, "ca")} anual i un ${signedRate(c.monthly, "ca")} mensual, segons l'INE; a Espanya, el ${rate(latest.general, "ca")}. Per províncies: ${prov}.`,
        },
        en: {
          q: `What was Catalonia's CPI in ${monthText(m, "en")}?`,
          a: `${rate(c.annual, "en")} on the year and ${signedRate(c.monthly, "en")} on the month, according to the INE; Spain's was ${rate(latest.general, "en")}. By province: ${prov}.`,
        },
      }),
    );
  }

  // 3. When it comes out: the rule, then the next dates from the INE calendar.
  const nextBits: string[] = [];
  if (next.flash) nextBits.push(L(locale, { es: `el adelantado de ${monthText(next.flash.month, "es")}, el ${bareDay(next.flash.day, "es")}`, ca: `l'avançat ${ofMonthCa(next.flash.month)}, ${elDay(next.flash.day, "ca")}`, en: `the ${monthText(next.flash.month, "en")} flash estimate on ${bareDay(next.flash.day, "en")}` }));
  if (next.final) nextBits.push(L(locale, { es: `el definitivo de ${monthText(next.final.month, "es")}, el ${bareDay(next.final.day, "es")}`, ca: `el definitiu ${ofMonthCa(next.final.month)}, ${elDay(next.final.day, "ca")}`, en: `the final ${monthText(next.final.month, "en")} figure on ${bareDay(next.final.day, "en")}` }));
  const nextSentence = nextBits.length ? L(locale, { es: ` Próximas fechas: ${nextBits.join(" y ")}.`, ca: ` Properes dates: ${nextBits.join(" i ")}.`, en: ` Next dates: ${nextBits.join(" and ")}.` }) : "";
  out.push(
    L(locale, {
      es: {
        q: "¿Qué día sale el IPC cada mes?",
        a: `El INE publica el IPC dos veces por mes de referencia, siempre a las 9:00: el indicador adelantado a final del mismo mes y el dato definitivo, con el detalle por grupos y por comunidades, hacia mitad del mes siguiente.${nextSentence}`,
      },
      ca: {
        q: "Quin dia surt l'IPC cada mes?",
        a: `L'INE publica l'IPC dues vegades per mes de referència, sempre a les 9.00: l'indicador avançat a final del mateix mes i la dada definitiva, amb el detall per grups i per comunitats, cap a mitjan mes següent.${nextSentence}`,
      },
      en: {
        q: "When is Spain's CPI released each month?",
        a: `The INE releases the CPI twice for each month, always at 9:00 Madrid time: the flash estimate at the end of the same month and the final figure, with the breakdown by group and by region, around the middle of the next month.${nextSentence}`,
      },
    }),
  );

  // 4. Rent: which CPI counts and the cap in force (rent-update/rules.ts, RDL 29/2026 DF 6ª).
  const capTo = bareDay(DF6_TO, locale);
  out.push(
    L(locale, {
      es: {
        q: "¿Qué IPC se aplica para actualizar el alquiler?",
        a: `El último publicado el día en que se cumple el año de contrato, si el contrato dice IPC. En los alquileres de vivienda, hasta el ${capTo} la subida anual no puede pasar del ${DF6_PCT} % sin un nuevo pacto (Real Decreto-ley 29/2026), aunque el IPC sea más alto; en un local de negocio se aplica el IPC entero.`,
      },
      ca: {
        q: "Quin IPC s'aplica per actualitzar el lloguer?",
        a: `L'últim publicat el dia que es compleix l'any de contracte, si el contracte diu IPC. Als lloguers d'habitatge, fins al ${capTo} la pujada anual no pot passar del ${DF6_PCT} % sense un nou pacte (Reial decret llei 29/2026), encara que l'IPC sigui més alt; en un local de negoci s'aplica l'IPC sencer.`,
      },
      en: {
        q: "Which CPI is used to update a rent?",
        a: `The latest one published on the contract's anniversary, if the lease says CPI. For residential leases, until ${capTo} the yearly rise cannot exceed ${DF6_PCT}% without a new agreement (Royal Decree-law 29/2026), even when the CPI is higher; for commercial premises the full CPI applies.`,
      },
    }),
  );

  // 5. Pensions: the average of December to November (LGSS art. 58, quoted on the uses list); the January rise after `today`.
  const ry = Number(today.slice(0, 4)) + 1;
  out.push(
    L(locale, {
      es: {
        q: "¿Qué IPC se usa para subir las pensiones?",
        a: `La media de las doce tasas anuales del IPC de diciembre a noviembre del año anterior a la subida (art. 58 de la Ley General de la Seguridad Social). Para la subida de enero de ${ry} cuentan las de diciembre de ${ry - 2} a noviembre de ${ry - 1}.`,
      },
      ca: {
        q: "Quin IPC es fa servir per apujar les pensions?",
        a: `La mitjana de les dotze taxes anuals de l'IPC de desembre a novembre de l'any anterior a la pujada (art. 58 de la Llei general de la Seguretat Social). Per a la pujada de gener de ${ry} compten les de desembre de ${ry - 2} a novembre de ${ry - 1}.`,
      },
      en: {
        q: "Which CPI is used to raise pensions?",
        a: `The average of the twelve annual CPI rates from December to November of the year before the rise (General Social Security Act, art. 58). For the January ${ry} rise, December ${ry - 2} to November ${ry - 1} count.`,
      },
    }),
  );
  return out;
}

/** The FAQ heading per language. */
export const IPC_FAQ_TITLE: Record<IpcLocale, string> = { es: "Preguntas frecuentes sobre el IPC", ca: "Preguntes freqüents sobre l'IPC", en: "Questions about Spain's CPI" };
