import { bareDay, money, type SmiLocale } from "./copy";
import { increaseOn, prorated12 } from "./engine";
import { QUOTE, SMI_2026, type SmiYear } from "./rules";

/**
 * "Preguntas frecuentes" of the SMI 2027 page (26 Nov 2026), in the words
 * Search Console shows people typing at it (29 Oct-25 Nov 2026: "esta
 * aprobado ya?", "se ha aprobado?", "cuando se publica", "boe smi 2027",
 * "salario mínimo 2027 españa en 12 pagas", "smi catalunya", "salario minimo
 * cataluña 2026", "smi 2027 neto", "spain minimum wage per hour"). Every
 * figure comes from the decree rows in rules.ts (read in the BOE's XML) or
 * from the calculator's own function; nothing is typed here. With no 2027
 * decree (`y27` null) the 2027 answers are left out instead of guessed.
 * Pure, client-safe.
 */

export interface Faq {
  q: string;
  a: string;
}

const L = <T>(locale: SmiLocale, v: Record<SmiLocale, T>): T => v[locale];

/** "Real Decreto 1013/2026" from "Real Decreto 1013/2026, de 18 de noviembre". */
const shortNorm = (y: Pick<SmiYear, "norm">, locale: SmiLocale) => {
  const s = y.norm.replace(/, de \d{1,2} de [a-záéíóú]+$/i, "");
  return locale === "ca" ? s.replace("Real Decreto", "Reial decret") : locale === "en" ? s.replace("Real Decreto", "Royal Decree") : s;
};

export function smiFaq(locale: SmiLocale, y27: SmiYear | null, net2026PerPayment: number): Faq[] {
  const m = (n: number) => money(n, locale);
  const day = (iso: string) => bareDay(iso, locale);
  const y26 = SMI_2026;
  const faq: Faq[] = [];
  if (y27) {
    const rise = increaseOn(y26, y27);
    const riseText = rise === null ? "" : rise.toLocaleString(locale === "en" ? "en-GB" : locale === "ca" ? "ca-ES" : "es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    faq.push(
      {
        q: L(locale, { es: "¿Está aprobado ya el salario mínimo de 2027?", ca: "Ja està aprovat el salari mínim del 2027?", en: "Has the 2027 minimum wage been approved?" }),
        a: L(locale, {
          es: `Sí. El ${shortNorm(y27, "es")} lo fija en ${m(y27.monthly)} al mes en 14 pagas (${m(y27.annual)} al año) y se publicó en el BOE el ${day(y27.published)} (${y27.boeId}). Se aplica desde el ${day(y27.effectiveFrom)}${riseText ? `, un ${riseText} % más que los ${m(y26.monthly)} de 2026` : ""}.`,
          ca: `Sí. El ${shortNorm(y27, "ca")} el fixa en ${m(y27.monthly)} al mes en 14 pagues (${m(y27.annual)} l'any) i es va publicar al BOE el ${day(y27.published)} (${y27.boeId}). S'aplica des de l'${day(y27.effectiveFrom)}${riseText ? `, un ${riseText} % més que els ${m(y26.monthly)} del 2026` : ""}.`,
          en: `Yes. ${shortNorm(y27, "en")} sets it at ${m(y27.monthly)} a month in 14 payments (${m(y27.annual)} a year), published in the BOE on ${day(y27.published)} (${y27.boeId}). It applies from ${day(y27.effectiveFrom)}${riseText ? `, ${riseText}% more than 2026's ${m(y26.monthly)}` : ""}.`,
        }),
      },
      {
        q: L(locale, { es: "¿Cuánto es el SMI de 2027 en 12 pagas?", ca: "Quant és l'SMI del 2027 en 12 pagues?", en: "How much is the 2027 SMI in 12 payments?" }),
        a: L(locale, {
          es: `${m(prorated12(y27))} al mes: el decreto fija un mínimo de ${m(y27.annual)} al año («${QUOTE.rd1013annual}»), y ${m(y27.annual)} ÷ 12 = ${m(prorated12(y27))}. En 14 pagas son ${m(y27.monthly)} cada una.`,
          ca: `${m(prorated12(y27))} al mes: el decret fixa un mínim de ${m(y27.annual)} l'any («${QUOTE.rd1013annual}»), i ${m(y27.annual)} ÷ 12 = ${m(prorated12(y27))}. En 14 pagues són ${m(y27.monthly)} cadascuna.`,
          en: `${m(prorated12(y27))} a month: the decree sets a yearly floor of ${m(y27.annual)} ("${QUOTE.rd1013annual}"), and ${m(y27.annual)} ÷ 12 = ${m(prorated12(y27))}. In 14 payments it is ${m(y27.monthly)} each.`,
        }),
      },
      {
        q: L(locale, { es: "¿Cuál es el salario mínimo en Cataluña?", ca: "Quin és el salari mínim a Catalunya?", en: "What is the minimum wage in Catalonia?" }),
        a: L(locale, {
          es: `El mismo que en toda España: ${m(y26.monthly)} al mes en 14 pagas en 2026 y ${m(y27.monthly)} desde el ${day(y27.effectiveFrom)}. El SMI lo fija el Estado «para cualesquiera actividades en la agricultura, en la industria y en los servicios» (${shortNorm(y27, "es")}, art. 1), con la competencia exclusiva del Estado en legislación laboral (disposición final primera). Tu convenio colectivo puede fijar más, nunca menos.`,
          ca: `El mateix que a tot Espanya: ${m(y26.monthly)} al mes en 14 pagues el 2026 i ${m(y27.monthly)} des de l'${day(y27.effectiveFrom)}. L'SMI el fixa l'Estat «para cualesquiera actividades en la agricultura, en la industria y en los servicios» (${shortNorm(y27, "ca")}, art. 1), amb la competència exclusiva de l'Estat en legislació laboral (disposició final primera). El teu conveni col·lectiu pot fixar-ne més, mai menys.`,
          en: `The same as in the rest of Spain: ${m(y26.monthly)} a month in 14 payments in 2026 and ${m(y27.monthly)} from ${day(y27.effectiveFrom)}. The State sets the SMI "para cualesquiera actividades en la agricultura, en la industria y en los servicios" (for any activity in farming, industry and services; ${shortNorm(y27, "en")}, art. 1), under its exclusive power over labour law (final provision one). Your collective agreement may set more, never less.`,
        }),
      },
      {
        q: L(locale, { es: "¿Desde cuándo se cobra el nuevo SMI?", ca: "Des de quan es cobra el nou SMI?", en: "From when is the new SMI paid?" }),
        a: L(locale, {
          es: `Desde la nómina de enero de 2027: el decreto entra en vigor el ${day(y27.effectiveFrom)} y se aplica hasta el 31 de diciembre de 2027 («${QUOTE.rd1013effects}»). Hasta entonces sigue el de 2026, ${m(y26.monthly)}.`,
          ca: `Des de la nòmina de gener del 2027: el decret entra en vigor l'${day(y27.effectiveFrom)} i s'aplica fins al 31 de desembre del 2027 («${QUOTE.rd1013effects}»). Fins aleshores continua el del 2026, ${m(y26.monthly)}.`,
          en: `From the January 2027 payslip: the decree comes into force on ${day(y27.effectiveFrom)} and applies until 31 December 2027 ("${QUOTE.rd1013effects}"). Until then 2026's applies, ${m(y26.monthly)}.`,
        }),
      },
      {
        q: L(locale, { es: "¿Cuánto es el SMI por hora?", ca: "Quant és l'SMI per hora?", en: "How much is the SMI per hour?" }),
        a: L(locale, {
          es: `Solo hay SMI por hora en el empleo de hogar: ${m(y27.domesticHourly)} por hora efectivamente trabajada en 2027 (${m(y26.domesticHourly)} en 2026), con pagas extra y vacaciones incluidas. Para el resto se fija por mes (${m(y27.monthly)}) o por día (${m(y27.daily)}); si trabajas menos horas, cobras la parte proporcional. Con un contrato de duración determinada que no pasa de 120 días en la misma empresa, al menos ${m(y27.temporaryDaily)} por jornada.`,
          ca: `Només hi ha SMI per hora en el treball de la llar: ${m(y27.domesticHourly)} per hora efectivament treballada el 2027 (${m(y26.domesticHourly)} el 2026), amb pagues extra i vacances incloses. Per a la resta es fixa per mes (${m(y27.monthly)}) o per dia (${m(y27.daily)}); si treballes menys hores, cobres la part proporcional. Amb un contracte de durada determinada que no passa de 120 dies a la mateixa empresa, com a mínim ${m(y27.temporaryDaily)} per jornada.`,
          en: `Only domestic work has an hourly SMI: ${m(y27.domesticHourly)} per hour actually worked in 2027 (${m(y26.domesticHourly)} in 2026), extra payments and holidays included. Otherwise it is set per month (${m(y27.monthly)}) or per day (${m(y27.daily)}); fewer hours earn the proportional part. On a fixed-term contract of no more than 120 days with the same employer, at least ${m(y27.temporaryDaily)} per working day.`,
        }),
      },
    );
  }
  faq.push({
    q: L(locale, { es: "¿Cuánto es el salario mínimo en neto?", ca: "Quant és el salari mínim en net?", en: "How much is the minimum wage after tax?" }),
    a: L(locale, {
      es: `Con las reglas de nómina de 2026, el SMI de 2026 (${m(y26.annual)} al año en 14 pagas) deja ${m(net2026PerPayment)} netos en cada nómina para una persona soltera, sin hijos y con contrato indefinido. El neto de 2027 depende de la retención y la cotización que se apliquen en 2027: calcúlalo en la calculadora de sueldo neto.`,
      ca: `Amb les regles de nòmina del 2026, l'SMI del 2026 (${m(y26.annual)} l'any en 14 pagues) deixa ${m(net2026PerPayment)} nets a cada nòmina per a una persona soltera, sense fills i amb contracte indefinit. El net del 2027 depèn de la retenció i la cotització que s'apliquin el 2027: calcula'l a la calculadora de sou net.`,
      en: `On 2026 payroll rules, the 2026 SMI (${m(y26.annual)} a year in 14 payments) leaves ${m(net2026PerPayment)} net in each payslip for a single person with no children on an open-ended contract. The 2027 net depends on the withholding and contributions applied in 2027: work it out in the net salary calculator.`,
    }),
  });
  return faq;
}
