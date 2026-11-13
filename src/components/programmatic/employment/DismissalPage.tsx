import Link from "next/link";

import { compareDismissals, dismissalPay } from "@/lib/programmatic/employment/dismissal";
import { calcPath, dateWords, money, num, type CalcLocale } from "@/lib/programmatic/employment/paths";
import {
  IRPF_EXEMPT_CAP,
  OBJECTIVE_DAYS_PER_YEAR,
  RULES_AS_OF,
  TEMPORARY_DAYS_PER_YEAR,
  UNFAIR_DAYS_PER_YEAR,
  UNFAIR_OLD_DAYS_PER_YEAR,
} from "@/lib/programmatic/employment/rules";

import { CalcLayout, calcMetadata, type CalcMeta } from "./CalcLayout";
import { DismissalCalculator, type DismissalInitial } from "./DismissalCalculator";

/**
 * "Calculadora de indemnización por despido" (es primary, ca, en). Every
 * figure on the page is computed by dismissal.ts from the example below; the
 * rules are the constants of rules.ts. No year in the URL: re-dated with
 * RULES_AS_OF.
 */

/** The server-rendered example: an unfair dismissal on the day the rules were read. */
export const DISMISSAL_EXAMPLE: DismissalInitial = { type: "unfair", start: "2015-09-01", end: RULES_AS_OF, salary: "28000", salaryKind: "annual" };
/** The pre-2012 example of its own section. */
const OLD_EXAMPLE = { start: "2008-01-15", end: RULES_AS_OF, annualSalary: 36_500 } as const;

export const DISMISSAL_META: Record<CalcLocale, CalcMeta> = {
  es: {
    title: "Calculadora de indemnización por despido 2026: improcedente, objetivo y fin de contrato",
    description: "Calcula tu indemnización por despido: improcedente (33 o 45 días por año), objetivo o ERE (20 días) y fin de contrato temporal (12 días), con los topes del Estatuto.",
    h1: "Calculadora de indemnización por despido",
    breadcrumb: "Indemnización por despido",
  },
  ca: {
    title: "Calculadora d'indemnització per acomiadament 2026: improcedent, objectiu i fi de contracte",
    description: "Calcula la indemnització per acomiadament: improcedent (33 o 45 dies per any), objectiu o ERO (20 dies) i fi de contracte temporal (12 dies), amb els límits de l'Estatut.",
    h1: "Calculadora d'indemnització per acomiadament",
    breadcrumb: "Indemnització per acomiadament",
  },
  en: {
    title: "Severance pay calculator for Spain (2026): unfair, objective and end of contract",
    description: "Work out statutory severance pay in Spain: unfair dismissal (33 or 45 days a year), objective dismissal or ERE (20 days) and end of a fixed-term contract (12 days), with the caps.",
    h1: "Severance pay calculator for Spain",
    breadcrumb: "Severance pay calculator",
  },
};

export const dismissalMetadata = (locale: CalcLocale) => calcMetadata("dismissal", locale, DISMISSAL_META[locale]);

export function DismissalRoute({ locale }: { locale: CalcLocale }) {
  const ex = DISMISSAL_EXAMPLE;
  const all = compareDismissals({ start: ex.start, end: ex.end, annualSalary: Number(ex.salary) });
  const old = dismissalPay({ type: "unfair", ...OLD_EXAMPLE });
  const m = (x: number) => money(x, locale);
  const n = (x: number) => num(x, locale);
  const d = (iso: string) => dateWords(iso, locale);
  const salary = m(Number(ex.salary));
  const months = all.unfair.tranches[0]!.months;
  const settlement = calcPath("settlement", locale);
  const paro = calcPath("unemployment", locale);

  const copy = {
    es: {
      lead: (
        <p>
          <strong>Despido improcedente: 33 días de salario por año trabajado</strong> (45 por el tiempo anterior al 12 de febrero de 2012), con un máximo de 24 mensualidades. <strong>Despido objetivo o ERE: 20 días por año</strong>, máximo 12 mensualidades. <strong>Fin de contrato temporal: 12 días por año.</strong> Ejemplo: con {salary} brutos al año y antigüedad del {d(ex.start)}, un despido improcedente el {d(ex.end)} son {n(all.unfair.days)} días: <strong>{m(all.unfair.amount)}</strong>.
        </p>
      ),
      tableTitle: "Cuánto corresponde en cada caso",
      tableCols: ["Supuesto", "Días por año", "Tope", "Norma"],
      rows: [
        ["Despido improcedente (contrato desde el 12-2-2012)", `${UNFAIR_DAYS_PER_YEAR}`, "24 mensualidades (720 días)", "ET art. 56.1"],
        ["Despido improcedente (contrato anterior)", `${UNFAIR_OLD_DAYS_PER_YEAR} hasta el 11-2-2012, ${UNFAIR_DAYS_PER_YEAR} después`, "720 días, o lo que dé el tramo anterior; máx. 42 mensualidades", "ET disp. trans. 11ª"],
        ["Despido objetivo o colectivo (ERE)", `${OBJECTIVE_DAYS_PER_YEAR}`, "12 mensualidades", "ET arts. 53.1.b y 51.4"],
        ["Fin de contrato temporal", `${TEMPORARY_DAYS_PER_YEAR}`, "Sin tope", "ET art. 49.1.c"],
        ["Despido disciplinario procedente, baja voluntaria", "0", "—", "Solo el finiquito"],
      ],
      howTitle: "Cómo se calcula, paso a paso",
      how: [
        `Antigüedad en meses: del primer día de trabajo al último. La ley dice «prorrateándose por meses los periodos de tiempo inferiores a un año», y cada fracción de mes cuenta como un mes entero. En el ejemplo, del ${d(ex.start)} al ${d(ex.end)}: ${months} meses.`,
        `Salario diario: el bruto anual con las pagas extra y todos los complementos salariales, entre 365. En el ejemplo, ${salary} / 365 = ${m(all.unfair.dailySalary)}.`,
        `Días de indemnización: meses × días por año / 12. En el ejemplo, ${months} × 33 / 12 = ${n(all.unfair.days)} días (objetivo: ${months} × 20 / 12 = ${n(all.objective.days)} días).`,
        `Tope: si los días pasan del máximo, se quedan en el máximo. Importe: días × salario diario = ${m(all.unfair.amount)} (objetivo: ${m(all.objective.amount)}).`,
      ],
      oldTitle: "Si empezaste antes del 12 de febrero de 2012",
      old: `La reforma laboral de 2012 bajó la indemnización por despido improcedente de 45 a 33 días por año, pero solo para el tiempo trabajado desde el 12 de febrero de 2012. El tiempo anterior se sigue pagando a 45 días por año. Ejemplo: antigüedad del ${d(OLD_EXAMPLE.start)}, despido el ${d(OLD_EXAMPLE.end)} y 100 € diarios: ${old.tranches[0]!.months} meses a 45 días (${n(old.tranches[0]!.days)} días) más ${old.tranches[1]!.months} meses a 33 días (${n(old.tranches[1]!.days)} días) = ${n(old.days)} días, ${m(old.amount)}. El tope es de 720 días, salvo que el tramo anterior a 2012 ya dé más días: entonces el tope son esos días, sin pasar nunca de 42 mensualidades.`,
      notTitle: "Qué no incluye",
      not: [
        <>El finiquito: los días del último mes, la parte de las pagas extra y las vacaciones no disfrutadas se pagan aparte. <Link href={settlement}>Calcula tu finiquito</Link>.</>,
        <>Los salarios de tramitación: solo si la empresa readmite tras un despido improcedente, o si eres representante de los trabajadores (art. 56.2 y 56.4).</>,
        <>Lo que mejore tu convenio colectivo o tu contrato, y lo pactado en una conciliación por encima del mínimo legal.</>,
        <>El despido nulo: la consecuencia es la readmisión con los salarios dejados de percibir, no esta indemnización.</>,
      ],
      taxTitle: "¿Tributa la indemnización?",
      tax: `No, hasta el importe obligatorio que marca el Estatuto: está exenta del IRPF (Ley 35/2006, art. 7.e) con un límite de ${m(IRPF_EXEMPT_CAP)}, y no cotiza a la Seguridad Social (LGSS, art. 147.2.c). Lo que se cobre por encima, por convenio, pacto o contrato, sí tributa. En un despido objetivo o un ERE por causas económicas, técnicas, organizativas o de producción, también está exenta la parte que no supere lo que habría correspondido por despido improcedente.`,
      faqTitle: "Preguntas frecuentes",
      faq: [
        ["¿Cuánto tiempo tengo para reclamar un despido?", "20 días hábiles desde el día siguiente al despido (ET art. 59.3). Antes de ir al juzgado hay que presentar la papeleta de conciliación."],
        ["¿Cobro el paro si me despiden?", <>Sí, si has cotizado al menos 360 días en los últimos seis años: el despido y el fin de contrato son situación legal de desempleo. <Link href={paro}>Calcula cuánto paro te corresponde</Link>.</>],
        ["¿La baja voluntaria tiene indemnización?", "No. El Estatuto no prevé indemnización cuando te vas tú (salvo en los casos de los artículos 40, 41 y 50: traslado, modificación sustancial o incumplimiento grave de la empresa). Sí cobras el finiquito."],
      ],
    },
    ca: {
      lead: (
        <p>
          <strong>Acomiadament improcedent: 33 dies de salari per any treballat</strong> (45 pel temps anterior al 12 de febrer de 2012), amb un màxim de 24 mensualitats. <strong>Acomiadament objectiu o ERO: 20 dies per any</strong>, màxim 12 mensualitats. <strong>Fi de contracte temporal: 12 dies per any.</strong> Exemple: amb {salary} bruts l&apos;any i antiguitat del {d(ex.start)}, un acomiadament improcedent el {d(ex.end)} són {n(all.unfair.days)} dies: <strong>{m(all.unfair.amount)}</strong>.
        </p>
      ),
      tableTitle: "Quant correspon en cada cas",
      tableCols: ["Supòsit", "Dies per any", "Límit", "Norma"],
      rows: [
        ["Acomiadament improcedent (contracte des del 12-2-2012)", `${UNFAIR_DAYS_PER_YEAR}`, "24 mensualitats (720 dies)", "ET art. 56.1"],
        ["Acomiadament improcedent (contracte anterior)", `${UNFAIR_OLD_DAYS_PER_YEAR} fins a l'11-2-2012, ${UNFAIR_DAYS_PER_YEAR} després`, "720 dies, o el que doni el tram anterior; màx. 42 mensualitats", "ET disp. trans. 11a"],
        ["Acomiadament objectiu o col·lectiu (ERO)", `${OBJECTIVE_DAYS_PER_YEAR}`, "12 mensualitats", "ET arts. 53.1.b i 51.4"],
        ["Fi de contracte temporal", `${TEMPORARY_DAYS_PER_YEAR}`, "Sense límit", "ET art. 49.1.c"],
        ["Acomiadament disciplinari procedent, baixa voluntària", "0", "—", "Només la quitança"],
      ],
      howTitle: "Com es calcula, pas a pas",
      how: [
        `Antiguitat en mesos: del primer dia de feina a l'últim. La llei diu que es prorrategen per mesos els períodes inferiors a un any, i cada fracció de mes compta com un mes sencer. A l'exemple, del ${d(ex.start)} al ${d(ex.end)}: ${months} mesos.`,
        `Salari diari: el brut anual amb les pagues extra i tots els complements salarials, entre 365. A l'exemple, ${salary} / 365 = ${m(all.unfair.dailySalary)}.`,
        `Dies d'indemnització: mesos × dies per any / 12. A l'exemple, ${months} × 33 / 12 = ${n(all.unfair.days)} dies (objectiu: ${months} × 20 / 12 = ${n(all.objective.days)} dies).`,
        `Límit: si els dies passen del màxim, es queden al màxim. Import: dies × salari diari = ${m(all.unfair.amount)} (objectiu: ${m(all.objective.amount)}).`,
      ],
      oldTitle: "Si vas començar abans del 12 de febrer de 2012",
      old: `La reforma laboral del 2012 va baixar la indemnització per acomiadament improcedent de 45 a 33 dies per any, però només per al temps treballat des del 12 de febrer de 2012. El temps anterior es continua pagant a 45 dies per any. Exemple: antiguitat del ${d(OLD_EXAMPLE.start)}, acomiadament el ${d(OLD_EXAMPLE.end)} i 100 € diaris: ${old.tranches[0]!.months} mesos a 45 dies (${n(old.tranches[0]!.days)} dies) més ${old.tranches[1]!.months} mesos a 33 dies (${n(old.tranches[1]!.days)} dies) = ${n(old.days)} dies, ${m(old.amount)}. El límit és de 720 dies, tret que el tram anterior al 2012 ja en doni més: aleshores el límit són aquests dies, sense passar mai de 42 mensualitats.`,
      notTitle: "Què no inclou",
      not: [
        <>La quitança: els dies de l&apos;últim mes, la part de les pagues extra i les vacances no gaudides es paguen a part. <Link href={settlement}>Calcula la teva quitança</Link>.</>,
        <>Els salaris de tramitació: només si l&apos;empresa readmet després d&apos;un acomiadament improcedent, o si ets representant dels treballadors (art. 56.2 i 56.4).</>,
        <>El que millori el teu conveni col·lectiu o el contracte, i el que es pacti en una conciliació per sobre del mínim legal.</>,
        <>L&apos;acomiadament nul: la conseqüència és la readmissió amb els salaris deixats de cobrar, no aquesta indemnització.</>,
      ],
      taxTitle: "La indemnització tributa?",
      tax: `No, fins a l'import obligatori que fixa l'Estatut: està exempta de l'IRPF (Llei 35/2006, art. 7.e) amb un límit de ${m(IRPF_EXEMPT_CAP)}, i no cotitza a la Seguretat Social (LGSS, art. 147.2.c). El que es cobri per sobre, per conveni, pacte o contracte, sí que tributa. En un acomiadament objectiu o un ERO per causes econòmiques, tècniques, organitzatives o de producció, també està exempta la part que no superi el que hauria correspost per acomiadament improcedent.`,
      faqTitle: "Preguntes freqüents",
      faq: [
        ["Quant de temps tinc per reclamar un acomiadament?", "20 dies hàbils des de l'endemà de l'acomiadament (ET art. 59.3). Abans d'anar al jutjat cal presentar la papereta de conciliació."],
        ["Cobro l'atur si m'acomiaden?", <>Sí, si has cotitzat almenys 360 dies en els últims sis anys: l&apos;acomiadament i la fi de contracte són situació legal de desocupació. <Link href={paro}>Calcula quant d&apos;atur et correspon</Link>.</>],
        ["La baixa voluntària té indemnització?", "No. L'Estatut no preveu indemnització quan te'n vas tu (tret dels casos dels articles 40, 41 i 50: trasllat, modificació substancial o incompliment greu de l'empresa). Sí que cobres la quitança."],
      ],
    },
    en: {
      lead: (
        <p>
          <strong>Unfair dismissal: 33 days&apos; salary per year worked</strong> (45 for service before 12 February 2012), capped at 24 months&apos; pay. <strong>Objective dismissal or ERE: 20 days a year</strong>, capped at 12 months&apos; pay. <strong>End of a fixed-term contract: 12 days a year.</strong> Example: on {salary} gross a year, with service since {d(ex.start)}, an unfair dismissal on {d(ex.end)} gives {n(all.unfair.days)} days: <strong>{m(all.unfair.amount)}</strong>.
        </p>
      ),
      tableTitle: "What each case pays",
      tableCols: ["Case", "Days per year", "Cap", "Rule"],
      rows: [
        ["Unfair dismissal (contract from 12 Feb 2012)", `${UNFAIR_DAYS_PER_YEAR}`, "24 months' pay (720 days)", "ET art. 56.1"],
        ["Unfair dismissal (earlier contract)", `${UNFAIR_OLD_DAYS_PER_YEAR} to 11 Feb 2012, ${UNFAIR_DAYS_PER_YEAR} after`, "720 days, or what the earlier part gives; max 42 months' pay", "ET transitional prov. 11"],
        ["Objective or collective dismissal (ERE)", `${OBJECTIVE_DAYS_PER_YEAR}`, "12 months' pay", "ET arts. 53.1.b and 51.4"],
        ["End of a fixed-term contract", `${TEMPORARY_DAYS_PER_YEAR}`, "No cap", "ET art. 49.1.c"],
        ["Fair disciplinary dismissal, resignation", "0", "—", "Final settlement only"],
      ],
      howTitle: "How it is worked out, step by step",
      how: [
        `Length of service in months, from your first day to your last. The law prorates periods under a year "by months", and any part of a month counts as a whole month. In the example, ${d(ex.start)} to ${d(ex.end)}: ${months} months.`,
        `Daily salary: gross annual pay with the extra payments and every salary supplement, divided by 365. In the example, ${salary} / 365 = ${m(all.unfair.dailySalary)}.`,
        `Days of severance: months × days per year / 12. In the example, ${months} × 33 / 12 = ${n(all.unfair.days)} days (objective: ${months} × 20 / 12 = ${n(all.objective.days)} days).`,
        `Cap: days above the maximum stay at the maximum. Amount: days × daily salary = ${m(all.unfair.amount)} (objective: ${m(all.objective.amount)}).`,
      ],
      oldTitle: "If you started before 12 February 2012",
      old: `The 2012 labour reform cut unfair-dismissal pay from 45 to 33 days a year, but only for service from 12 February 2012. Earlier service is still paid at 45 days a year. Example: service since ${d(OLD_EXAMPLE.start)}, dismissed on ${d(OLD_EXAMPLE.end)}, €100 a day: ${old.tranches[0]!.months} months at 45 days (${n(old.tranches[0]!.days)} days) plus ${old.tranches[1]!.months} months at 33 days (${n(old.tranches[1]!.days)} days) = ${n(old.days)} days, ${m(old.amount)}. The cap is 720 days, unless the pre-2012 part alone gives more: then the cap is those days, never above 42 months' pay.`,
      notTitle: "What it does not include",
      not: [
        <>The final settlement (finiquito): the last month&apos;s days, the accrued extra payments and unused holiday are paid on top. <Link href={settlement}>Work out your final settlement</Link>.</>,
        <>Back pay during the claim (salarios de tramitación): only if the employer takes you back after an unfair dismissal, or if you are a workers&apos; representative (art. 56.2 and 56.4).</>,
        <>Anything your collective agreement or contract adds, or what is agreed at a conciliation above the legal minimum.</>,
        <>Void dismissal (nulo): the remedy is reinstatement with back pay, not this payment.</>,
      ],
      taxTitle: "Is severance pay taxed?",
      tax: `Not up to the statutory amount: it is exempt from income tax (IRPF, Ley 35/2006, art. 7.e) up to ${m(IRPF_EXEMPT_CAP)}, and no Social Security contributions are due on it (LGSS, art. 147.2.c). Anything above it, by agreement or contract, is taxed. In an objective dismissal or an ERE for economic, technical, organisational or production reasons, the part up to what an unfair dismissal would have paid is also exempt.`,
      faqTitle: "Frequently asked questions",
      faq: [
        ["How long do I have to challenge a dismissal?", "20 working days from the day after the dismissal (ET art. 59.3). A conciliation claim (papeleta de conciliación) must be filed before going to court."],
        ["Do I get unemployment benefit if I am dismissed?", <>Yes, if you have contributed for at least 360 days in the last six years: dismissal and the end of a contract count as legal unemployment. <Link href={paro}>Work out your unemployment benefit</Link>.</>],
        ["Is there severance pay if I resign?", "No. The Statute gives none when you leave (except under articles 40, 41 and 50: relocation, substantial change or a serious breach by the employer). You still get the final settlement."],
      ],
    },
  }[locale];

  return (
    <CalcLayout calcKey="dismissal" locale={locale} meta={DISMISSAL_META[locale]} lead={copy.lead} sources={["etArt56", "etDt11", "etArt53", "etArt49", "irpf", "lgss", "smi2026"]}>
      <DismissalCalculator locale={locale} initial={DISMISSAL_EXAMPLE} />

      <h2 id="tabla">{copy.tableTitle}</h2>
      <div className="ci-table-scroll">
        <table className="ci-local-table ci-stack-table">
          <thead>
            <tr>
              {copy.tableCols.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {copy.rows.map(([a, b, c, e]) => (
              <tr key={a}>
                <th scope="row" className="font-normal">
                  {a}
                </th>
                <td data-label={copy.tableCols[1]}>{b}</td>
                <td data-label={copy.tableCols[2]}>{c}</td>
                <td data-label={copy.tableCols[3]}>{e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="calculo">{copy.howTitle}</h2>
      <ol>
        {copy.how.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <h2 id="antes-2012">{copy.oldTitle}</h2>
      <p>{copy.old}</p>

      <h2 id="no-incluye">{copy.notTitle}</h2>
      <ul>
        {copy.not.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      <h2 id="impuestos">{copy.taxTitle}</h2>
      <p>{copy.tax}</p>

      <h2 id="preguntas">{copy.faqTitle}</h2>
      {copy.faq.map(([q, a]) => (
        <div key={String(q)}>
          <h3>{q}</h3>
          <p>{a}</p>
        </div>
      ))}
    </CalcLayout>
  );
}
