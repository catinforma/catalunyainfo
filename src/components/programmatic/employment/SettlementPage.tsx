import Link from "next/link";

import { calcPath, dateWords, money, num, type CalcLocale } from "@/lib/programmatic/employment/paths";
import { RULES_AS_OF } from "@/lib/programmatic/employment/rules";
import { settlement } from "@/lib/programmatic/employment/settlement";

import { CalcLayout, calcMetadata, type CalcMeta } from "./CalcLayout";
import { SettlementCalculator, type SettlementInitial } from "./SettlementCalculator";

/**
 * "Calculadora de finiquito" (es primary, ca, en): pending salary, accrued
 * extra payments, unused vacation, optionally the dismissal pay. Every figure
 * in the text is computed by settlement.ts from the example below.
 */

export const SETTLEMENT_EXAMPLE: SettlementInitial = {
  start: "2024-03-04",
  end: RULES_AS_OF,
  monthly: "2000",
  extrasProrated: false,
  extraAmount: "",
  accrual: "annual",
  vacationPerYear: "30",
  vacationTaken: "18",
  pendingDays: "",
  reason: "none",
  noticeMissing: false,
};

export const SETTLEMENT_META: Record<CalcLocale, CalcMeta> = {
  es: {
    title: "Calculadora de finiquito 2026: vacaciones, pagas extra y días pendientes",
    description: "Calcula tu finiquito: días del último mes, parte de las pagas extra y vacaciones no disfrutadas, y la indemnización si te despiden. Qué incluye y qué no.",
    h1: "Calculadora de finiquito",
    breadcrumb: "Finiquito",
  },
  ca: {
    title: "Calculadora de la quitança (finiquito) 2026: vacances, pagues extra i dies pendents",
    description: "Calcula la teva quitança: dies de l'últim mes, part de les pagues extra i vacances no gaudides, i la indemnització si t'acomiaden. Què inclou i què no.",
    h1: "Calculadora de la quitança (finiquito)",
    breadcrumb: "Quitança (finiquito)",
  },
  en: {
    title: "Final settlement (finiquito) calculator for Spain: holiday, extra payments, last days",
    description: "Work out your finiquito in Spain: the last month's days, the accrued extra payments, unused holiday and, if dismissed, severance pay. What it includes and what not.",
    h1: "Final settlement (finiquito) calculator",
    breadcrumb: "Final settlement calculator",
  },
};

export const settlementMetadata = (locale: CalcLocale) => calcMetadata("settlement", locale, SETTLEMENT_META[locale]);

export function SettlementRoute({ locale }: { locale: CalcLocale }) {
  const ex = SETTLEMENT_EXAMPLE;
  const r = settlement({
    start: ex.start,
    end: ex.end,
    monthly: Number(ex.monthly),
    extrasProrated: ex.extrasProrated,
    accrual: ex.accrual,
    vacationPerYear: Number(ex.vacationPerYear),
    vacationTaken: Number(ex.vacationTaken),
    reason: ex.reason,
  });
  const m = (x: number) => money(x, locale);
  const n = (x: number) => num(x, locale);
  const d = (iso: string) => dateWords(iso, locale);
  const [summer, christmas] = r.extras;
  const monthly = m(Number(ex.monthly));
  const dismissal = calcPath("dismissal", locale);
  const paro = calcPath("unemployment", locale);

  const copy = {
    es: {
      lead: (
        <p>
          El finiquito es lo que la empresa te debe el último día: <strong>el salario de los días trabajados del último mes, la parte de las pagas extra que has generado y no has cobrado, y las vacaciones no disfrutadas</strong>. No es la indemnización, que solo se cobra en algunos despidos y al acabar un contrato temporal. Ejemplo: con {monthly} brutos al mes, dos pagas extra sin prorratear y {ex.vacationTaken} días de vacaciones disfrutados, si tu último día es el {d(ex.end)} el finiquito es de <strong>{m(r.settlementTotal)}</strong> brutos.
        </p>
      ),
      inTitle: "Qué incluye el finiquito",
      in: [
        <>
          <strong>Salario pendiente:</strong> los días del último mes que aún no has cobrado (en el ejemplo, {r.pendingDays} días: {m(r.salary)}). Calculamos el mes como 30 días: salario mensual / 30 × días.
        </>,
        <>
          <strong>Pagas extra:</strong> el Estatuto da derecho a dos al año (art. 31), y tu convenio fija cuánto son y cuándo se generan. Si no van prorrateadas en la nómina, te deben la parte generada desde la última que cobraste (en el ejemplo, verano {m(summer!.amount)} y Navidad {m(christmas!.amount)}). Si van prorrateadas, ya las has cobrado.
        </>,
        <>
          <strong>Vacaciones no disfrutadas:</strong> al menos 30 días naturales al año (art. 38). No se pueden cambiar por dinero mientras trabajas, pero las que no has disfrutado al acabar el contrato se pagan en el finiquito, y cotizan a la Seguridad Social (LGSS, art. 147.2). En el ejemplo, {n(r.vacation.earned)} días generados este año − {ex.vacationTaken} disfrutados = {n(r.vacation.pending)} días: {m(r.vacation.amount)}.
        </>,
        <>Si es un despido objetivo y la empresa no te dio los 15 días de preaviso, esos 15 días de salario (art. 53.1.c y 53.4).</>,
        <>Si corresponde, la indemnización (elige el motivo en la calculadora, o usa la <Link href={dismissal}>calculadora de indemnización por despido</Link>).</>,
      ],
      notTitle: "Qué no calculamos",
      not: [
        "Horas extra, comisiones, incentivos, dietas o atrasos de convenio pendientes: súmalos tú si te los deben.",
        "Los descuentos de la nómina: mostramos importes brutos. El salario, las pagas y las vacaciones tributan IRPF y cotizan; la indemnización legal no tributa ni cotiza.",
        "Una tercera paga (beneficios u otras) o pagas de distinto importe: pon el importe de cada paga si tu convenio lo fija.",
        "El descuento por no avisar con el preaviso que marque tu convenio si te vas tú: depende del convenio.",
      ],
      howTitle: "Cómo calculamos cada parte",
      how: [
        `Días del último mes: si el último día es el último del mes, el mes entero (30 días); si no, el día del mes (el ${d(ex.end)} da ${r.pendingDays} días). Puedes cambiarlo si tu nómina se paga de otra forma.`,
        `Pagas extra con devengo anual: Navidad se genera del 1 de enero al 31 de diciembre y la de verano del 1 de julio al 30 de junio. En el ejemplo: verano, ${summer!.accruedDays} de ${summer!.periodDays} días; Navidad, ${christmas!.accruedDays} de ${christmas!.periodDays}. Con devengo semestral, cada una en seis meses. Si empezaste a trabajar dentro del periodo, contamos desde ese día.`,
        `Vacaciones: días al año × días trabajados este año / días del año, menos los ya disfrutados. Cada día se paga a salario mensual / 30. Si has disfrutado más de los generados, sale en negativo: la empresa puede descontarlo.`,
      ],
      signTitle: "Antes de firmar",
      sign: "La empresa tiene que darte una propuesta del documento de liquidación con el aviso del fin del contrato, y puedes pedir que esté presente un representante legal de los trabajadores cuando firmes el recibo del finiquito (Estatuto, art. 49.2). Si no estás de acuerdo con las cantidades, no firmes tu conformidad sin consultarlo antes.",
      paroTitle: "Las vacaciones no disfrutadas retrasan el paro",
      paro: (
        <>
          Si te pagan vacaciones en el finiquito, el paro empieza cuando acaban esos días (LGSS, art. 268.3), y cuentan como cotizados. Pide la prestación en los 15 días hábiles siguientes. <Link href={paro}>Calcula cuánto paro te corresponde</Link>.
        </>
      ),
    },
    ca: {
      lead: (
        <p>
          La quitança (el finiquito) és el que l&apos;empresa et deu l&apos;últim dia: <strong>el salari dels dies treballats de l&apos;últim mes, la part de les pagues extra que has generat i no has cobrat, i les vacances no gaudides</strong>. No és la indemnització, que només es cobra en alguns acomiadaments i en acabar un contracte temporal. Exemple: amb {monthly} bruts al mes, dues pagues extra sense prorratejar i {ex.vacationTaken} dies de vacances gaudits, si el teu últim dia és el {d(ex.end)} la quitança és de <strong>{m(r.settlementTotal)}</strong> bruts.
        </p>
      ),
      inTitle: "Què inclou la quitança",
      in: [
        <>
          <strong>Salari pendent:</strong> els dies de l&apos;últim mes que encara no has cobrat (a l&apos;exemple, {r.pendingDays} dies: {m(r.salary)}). Calculem el mes com 30 dies: salari mensual / 30 × dies.
        </>,
        <>
          <strong>Pagues extra:</strong> l&apos;Estatut en dona dues l&apos;any (art. 31), i el teu conveni fixa quant són i quan es generen. Si no van prorratejades a la nòmina, et deuen la part generada des de l&apos;última que vas cobrar (a l&apos;exemple, estiu {m(summer!.amount)} i Nadal {m(christmas!.amount)}). Si van prorratejades, ja les has cobrat.
        </>,
        <>
          <strong>Vacances no gaudides:</strong> almenys 30 dies naturals l&apos;any (art. 38). No es poden canviar per diners mentre treballes, però les que no has gaudit en acabar el contracte es paguen a la quitança, i cotitzen a la Seguretat Social (LGSS, art. 147.2). A l&apos;exemple, {n(r.vacation.earned)} dies generats aquest any − {ex.vacationTaken} gaudits = {n(r.vacation.pending)} dies: {m(r.vacation.amount)}.
        </>,
        <>Si és un acomiadament objectiu i l&apos;empresa no et va donar els 15 dies de preavís, aquests 15 dies de salari (art. 53.1.c i 53.4).</>,
        <>Si correspon, la indemnització (tria el motiu a la calculadora, o fes servir la <Link href={dismissal}>calculadora d&apos;indemnització per acomiadament</Link>).</>,
      ],
      notTitle: "Què no calculem",
      not: [
        "Hores extra, comissions, incentius, dietes o endarreriments de conveni pendents: suma'ls tu si te'ls deuen.",
        "Els descomptes de la nòmina: mostrem imports bruts. El salari, les pagues i les vacances tributen IRPF i cotitzen; la indemnització legal no tributa ni cotitza.",
        "Una tercera paga (beneficis o altres) o pagues d'import diferent: posa l'import de cada paga si el teu conveni el fixa.",
        "El descompte per no avisar amb el preavís que fixi el teu conveni si te'n vas tu: depèn del conveni.",
      ],
      howTitle: "Com calculem cada part",
      how: [
        `Dies de l'últim mes: si l'últim dia és l'últim del mes, el mes sencer (30 dies); si no, el dia del mes (el ${d(ex.end)} dona ${r.pendingDays} dies). El pots canviar si la teva nòmina es paga d'una altra manera.`,
        `Pagues extra amb meritació anual: la de Nadal es genera de l'1 de gener al 31 de desembre i la d'estiu de l'1 de juliol al 30 de juny. A l'exemple: estiu, ${summer!.accruedDays} de ${summer!.periodDays} dies; Nadal, ${christmas!.accruedDays} de ${christmas!.periodDays}. Amb meritació semestral, cadascuna en sis mesos. Si vas començar a treballar dins del període, comptem des d'aquell dia.`,
        `Vacances: dies l'any × dies treballats aquest any / dies de l'any, menys els ja gaudits. Cada dia es paga a salari mensual / 30. Si n'has gaudit més dels generats, surt en negatiu: l'empresa ho pot descomptar.`,
      ],
      signTitle: "Abans de signar",
      sign: "L'empresa t'ha de donar una proposta del document de liquidació amb l'avís de la fi del contracte, i pots demanar que hi hagi un representant legal dels treballadors quan signis el rebut de la quitança (Estatut, art. 49.2). Si no hi estàs d'acord, no signis la conformitat sense consultar-ho abans.",
      paroTitle: "Les vacances no gaudides endarrereixen l'atur",
      paro: (
        <>
          Si et paguen vacances a la quitança, l&apos;atur comença quan s&apos;acaben aquests dies (LGSS, art. 268.3), i compten com a cotitzats. Demana la prestació en els 15 dies hàbils següents. <Link href={paro}>Calcula quant d&apos;atur et correspon</Link>.
        </>
      ),
    },
    en: {
      lead: (
        <p>
          The final settlement (finiquito) is what your employer owes you on your last day: <strong>salary for the days worked in the last month, the part of the extra payments you have earned but not been paid, and unused holiday</strong>. It is not severance pay, which only some dismissals and the end of a fixed-term contract carry. Example: on {monthly} gross a month, two extra payments not spread over the year and {ex.vacationTaken} days of holiday taken, if your last day is {d(ex.end)} the settlement is <strong>{m(r.settlementTotal)}</strong> gross.
        </p>
      ),
      inTitle: "What the final settlement includes",
      in: [
        <>
          <strong>Outstanding salary:</strong> the days of the last month not yet paid (in the example, {r.pendingDays} days: {m(r.salary)}). A month counts as 30 days: monthly salary / 30 × days.
        </>,
        <>
          <strong>Extra payments:</strong> the Workers&apos; Statute gives two a year (art. 31); your collective agreement sets how much and when they accrue. If they are not spread over your payslips, you are owed the part earned since the last one paid (in the example, summer {m(summer!.amount)} and Christmas {m(christmas!.amount)}). If they are spread, you have already had them.
        </>,
        <>
          <strong>Unused holiday:</strong> at least 30 calendar days a year (art. 38). Holiday cannot be swapped for money while you work, but days not taken when the contract ends are paid in the settlement, and Social Security contributions are due on them (LGSS, art. 147.2). In the example, {n(r.vacation.earned)} days earned this year − {ex.vacationTaken} taken = {n(r.vacation.pending)} days: {m(r.vacation.amount)}.
        </>,
        <>In an objective dismissal without the 15 days&apos; notice, those 15 days&apos; salary (art. 53.1.c and 53.4).</>,
        <>Where it applies, severance pay (pick the reason in the calculator, or use the <Link href={dismissal}>severance pay calculator</Link>).</>,
      ],
      notTitle: "What we do not calculate",
      not: [
        "Overtime, commissions, bonuses, allowances or back pay under the agreement: add them yourself if you are owed them.",
        "Payslip deductions: amounts are gross. Salary, extra payments and holiday pay are taxed (IRPF) and pay contributions; statutory severance pay does neither.",
        "A third extra payment (profit share or other) or payments of different sizes: enter each payment's amount if your agreement sets it.",
        "A deduction for leaving without the notice your agreement requires: that depends on the agreement.",
      ],
      howTitle: "How each part is worked out",
      how: [
        `Days of the last month: a whole month (30 days) if your last day is the month's last, otherwise the day of the month (${d(ex.end)} gives ${r.pendingDays} days). Change it if your payroll works differently.`,
        `Extra payments accruing yearly: Christmas from 1 January to 31 December, summer from 1 July to 30 June. In the example: summer, ${summer!.accruedDays} of ${summer!.periodDays} days; Christmas, ${christmas!.accruedDays} of ${christmas!.periodDays}. Half-yearly accrual: six months each. If you started within the period, we count from that day.`,
        `Holiday: days a year × days worked this year / days in the year, minus those taken. Each day is paid at monthly salary / 30. If you took more than you earned, it shows as negative: the employer may deduct it.`,
      ],
      signTitle: "Before you sign",
      sign: "Your employer must give you a draft of the settlement with the notice of termination, and you can ask for a workers' representative to be present when you sign the receipt (Workers' Statute, art. 49.2). If you disagree with the figures, do not sign your agreement before getting advice.",
      paroTitle: "Unused holiday delays unemployment benefit",
      paro: (
        <>
          If holiday is paid in the settlement, unemployment benefit starts when those days end (LGSS, art. 268.3), and they count as contributed. Apply within the following 15 working days. <Link href={paro}>Work out your unemployment benefit</Link>.
        </>
      ),
    },
  }[locale];

  return (
    <CalcLayout calcKey="settlement" locale={locale} meta={SETTLEMENT_META[locale]} lead={copy.lead} sources={["etArt49", "etArt31", "etArt38", "etArt53", "lgss", "irpf"]}>
      <SettlementCalculator locale={locale} initial={SETTLEMENT_EXAMPLE} />

      <h2 id="incluye">{copy.inTitle}</h2>
      <ul>
        {copy.in.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      <h2 id="no-incluye">{copy.notTitle}</h2>
      <ul>
        {copy.not.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      <h2 id="calculo">{copy.howTitle}</h2>
      <ol>
        {copy.how.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <h2 id="firmar">{copy.signTitle}</h2>
      <p>{copy.sign}</p>

      <h2 id="paro">{copy.paroTitle}</h2>
      <p>{copy.paro}</p>
    </CalcLayout>
  );
}
