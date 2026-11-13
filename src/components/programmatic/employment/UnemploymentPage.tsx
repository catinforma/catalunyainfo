import Link from "next/link";

import { PAY_DATES_PATH, dateWords, money, num, pct } from "@/lib/programmatic/employment/paths";
import { calcPath, type CalcLocale } from "@/lib/programmatic/calculators/paths";
import { BENEFIT_SS_RATE, DURATION_SCALE, IPREM_MONTHLY, IPREM_PLUS_SIXTH, MAX_CONTRIBUTION_BASE, SUBSIDY_MONTHLY } from "@/lib/programmatic/employment/rules";
import { benefitLimits, unemploymentBenefit, type Children } from "@/lib/programmatic/employment/unemployment";

import { CalcLayout, calcMetadata, type CalcMeta } from "./CalcLayout";
import { UnemploymentCalculator, type UnemploymentInitial } from "./UnemploymentCalculator";

/**
 * "Calculadora del paro" (es primary, ca, en): duration (LGSS art. 269),
 * amount (art. 270) with the 2026 limits, and the deductions. Every figure in
 * the text comes from unemployment.ts and rules.ts. Linked both ways with the
 * pay-dates guide (/es/guias/cuando-se-cobra-paro-pension/).
 */

export const UNEMPLOYMENT_EXAMPLE: UnemploymentInitial = { contributedDays: "1500", monthlyBase: "1800", children: 0, partTimePct: "100" };

export const UNEMPLOYMENT_META: Record<CalcLocale, CalcMeta> = {
  es: {
    title: "Calculadora del paro 2026: cuánto cobrarás y cuánto dura la prestación",
    description: "Calcula tu paro: duración según los días cotizados, 70 % de la base los primeros 180 días y 60 % después, con el mínimo y el máximo de 2026 y los descuentos.",
    h1: "Calculadora del paro: cuánto cobrarás y durante cuánto tiempo",
    breadcrumb: "Calculadora del paro",
  },
  ca: {
    title: "Calculadora de l'atur 2026: quant cobraràs i quant dura la prestació",
    description: "Calcula el teu atur: durada segons els dies cotitzats, 70 % de la base els primers 180 dies i 60 % després, amb el mínim i el màxim del 2026 i els descomptes.",
    h1: "Calculadora de l'atur: quant cobraràs i durant quant de temps",
    breadcrumb: "Calculadora de l'atur",
  },
  en: {
    title: "Spain unemployment benefit calculator (2026): how much and for how long",
    description: "Work out Spanish unemployment benefit (paro): duration from your days contributed, 70% of your base for 180 days then 60%, the 2026 minimum and maximum, deductions.",
    h1: "Unemployment benefit calculator for Spain",
    breadcrumb: "Unemployment benefit calculator",
  },
};

/** The subsidy checker (lib/programmatic/unemployment-subsidy/), which links back here. */
const SUBSIDY_LINK: Record<CalcLocale, { text: string; link: string }> = {
  es: { text: "¿Se te acaba el paro o no llegas a 360 días cotizados?", link: "Comprueba si te corresponde el subsidio por desempleo" },
  ca: { text: "Se t'acaba l'atur o no arribes a 360 dies cotitzats?", link: "Comprova si et correspon el subsidi per desocupació" },
  en: { text: "Benefit running out, or fewer than 360 days of contributions?", link: "Check whether you qualify for the unemployment subsidy" },
};

export const unemploymentMetadata = (locale: CalcLocale) => calcMetadata("unemployment", locale, UNEMPLOYMENT_META[locale]);

export function UnemploymentRoute({ locale }: { locale: CalcLocale }) {
  const ex = UNEMPLOYMENT_EXAMPLE;
  const r = unemploymentBenefit({ contributedDays: Number(ex.contributedDays), monthlyBase: Number(ex.monthlyBase), children: ex.children });
  const m = (x: number) => money(x, locale);
  const n = (x: number) => num(x, locale);
  const lim = ([0, 1, 2] as Children[]).map((c) => benefitLimits(c));
  const [first, after] = r.phases;
  const payDates = PAY_DATES_PATH[locale];
  const settlement = calcPath("settlement", locale);
  const dismissal = calcPath("dismissal", locale);
  const iprem = m(IPREM_MONTHLY);
  const iprem7 = m(IPREM_PLUS_SIXTH);
  const ss = pct(BENEFIT_SS_RATE, locale);
  const lgssDate = dateWords("2026-11-11", locale);

  const copy = {
    es: {
      lead: (
        <p>
          <strong>El paro dura de 120 días a 2 años</strong> según lo que hayas cotizado en los últimos seis años (mínimo 360 días) y <strong>paga el 70 % de tu base reguladora los primeros 180 días y el 60 % desde el día 181</strong>, con un mínimo de {m(lim[0]!.min)} y un máximo de {m(lim[0]!.max)} al mes sin hijos a cargo en 2026 ({m(lim[1]!.min)} y hasta {m(lim[2]!.max)} con hijos). Ejemplo: {n(Number(ex.contributedDays))} días cotizados y una base de {m(Number(ex.monthlyBase))} dan {r.durationDays} días de paro, {m(first!.monthly)} al mes los primeros seis meses y {m(after!.monthly)} después.
        </p>
      ),
      pay: (
        <>
          El SEPE paga el día 10 de cada mes la mensualidad anterior: <Link href={payDates}>calendario de pagos del paro</Link>.
        </>
      ),
      durTitle: "Cuánto dura: la tabla oficial",
      durIntro: "Artículo 269.1 de la LGSS. Cuentan los días cotizados por desempleo en los seis años anteriores que no hayas usado para otra prestación, y también las vacaciones pagadas y no disfrutadas al acabar el contrato.",
      durCols: ["Días cotizados", "Días de paro", "Meses"],
      from: (a: number, b: number | null) => (b === null ? `${n(a)} o más` : `De ${n(a)} a ${n(b)}`),
      amtTitle: "Cuánto se cobra: mínimo y máximo de 2026",
      amtIntro: `La base reguladora es la media de tus bases de cotización por desempleo de los últimos 180 días, sin horas extra (art. 270.1): para seis nóminas mensuales, la base mensual media; al día, entre 30. Se cobra el 70 % los primeros 180 días y el 60 % después (art. 270.2), entre unos límites que dependen de los hijos a cargo y se calculan sobre el IPREM (${iprem} al mes en 2026, el de los Presupuestos de 2023 prorrogados) más una sexta parte: ${iprem7} (art. 270.3). La base nunca pasa de la máxima de cotización de 2026, ${m(MAX_CONTRIBUTION_BASE)} al mes.`,
      amtCols: ["Hijos a cargo", "Mínimo al mes", "Máximo al mes"],
      kids: ["Ninguno", "Uno", "Dos o más"],
      amtNote: "Las mismas cifras publica el SEPE en «Cuantías anuales». A tiempo parcial, mínimo y máximo se reducen en proporción a la jornada.",
      reformTitle: "¿Cambió el porcentaje con la reforma de 2024?",
      reform: `No. El Real Decreto-ley 2/2024 reformó los subsidios (ahora el 95 %, el 90 % y el 80 % del IPREM: ${m(SUBSIDY_MONTHLY[0])}, ${m(SUBSIDY_MONTHLY[1])} y ${m(SUBSIDY_MONTHLY[2])} al mes) y su compatibilidad con un empleo, pero no la prestación contributiva: el artículo 270.2 de la LGSS sigue diciendo «el 70 por ciento durante los ciento ochenta primeros días y el 60 por ciento a partir del día ciento ochenta y uno» (texto consolidado del BOE, actualizado el ${lgssDate}). El 60 % desde el día 181 rige desde el 1 de enero de 2023; antes era el 50 %.`,
      dedTitle: "Descuentos: Seguridad Social e IRPF",
      ded: `Mientras cobras el paro sigues cotizando: el SEPE paga la parte de la empresa y te descuenta la tuya, que en 2026 es el ${ss} de la base reguladora (en el ejemplo, ${m(r.ssMonthly)} al mes), aunque tu prestación esté en el máximo o el mínimo. También te retiene IRPF si corresponde, según lo que vayas a cobrar en el año y tu situación familiar; puedes pedir más retención con el modelo 145.`,
      whoTitle: "Quién tiene derecho",
      who: [
        <>Estar en situación legal de desempleo: despido, fin de contrato temporal, ERE… La baja voluntaria no da derecho, salvo los casos del Estatuto que la equiparan (traslado, modificación sustancial, incumplimiento grave de la empresa, violencia de género).</>,
        <>Haber cotizado al menos 360 días en los últimos seis años.</>,
        <>Inscribirte como demandante de empleo, firmar el acuerdo de actividad y no tener la edad de jubilación (salvo que no tengas cotización suficiente para jubilarte).</>,
        <>Pedirlo en los 15 días hábiles siguientes al despido o al final de las vacaciones no disfrutadas (con el certificado de empresa). Si te pagan vacaciones en el <Link href={settlement}>finiquito</Link>, el paro empieza al acabar esos días.</>,
        <>Si te han despedido, mira también tu <Link href={dismissal}>indemnización</Link>: es compatible con el paro.</>,
      ],
    },
    ca: {
      lead: (
        <p>
          <strong>L&apos;atur dura de 120 dies a 2 anys</strong> segons el que hagis cotitzat en els últims sis anys (mínim 360 dies) i <strong>paga el 70 % de la base reguladora els primers 180 dies i el 60 % des del dia 181</strong>, amb un mínim de {m(lim[0]!.min)} i un màxim de {m(lim[0]!.max)} al mes sense fills a càrrec el 2026 ({m(lim[1]!.min)} i fins a {m(lim[2]!.max)} amb fills). Exemple: {n(Number(ex.contributedDays))} dies cotitzats i una base de {m(Number(ex.monthlyBase))} donen {r.durationDays} dies d&apos;atur, {m(first!.monthly)} al mes els primers sis mesos i {m(after!.monthly)} després.
        </p>
      ),
      pay: (
        <>
          El SEPE paga el dia 10 de cada mes la mensualitat anterior: <Link href={payDates}>calendari de pagaments de l&apos;atur</Link>.
        </>
      ),
      durTitle: "Quant dura: la taula oficial",
      durIntro: "Article 269.1 de la LGSS. Compten els dies cotitzats per desocupació en els sis anys anteriors que no hagis fet servir per a una altra prestació, i també les vacances pagades i no gaudides en acabar el contracte.",
      durCols: ["Dies cotitzats", "Dies d'atur", "Mesos"],
      from: (a: number, b: number | null) => (b === null ? `${n(a)} o més` : `De ${n(a)} a ${n(b)}`),
      amtTitle: "Quant es cobra: mínim i màxim del 2026",
      amtIntro: `La base reguladora és la mitjana de les bases de cotització per desocupació dels últims 180 dies, sense hores extra (art. 270.1): per a sis nòmines mensuals, la base mensual mitjana; al dia, entre 30. Es cobra el 70 % els primers 180 dies i el 60 % després (art. 270.2), entre uns límits que depenen dels fills a càrrec i es calculen sobre l'IPREM (${iprem} al mes el 2026, el dels Pressupostos del 2023 prorrogats) més una sisena part: ${iprem7} (art. 270.3). La base no passa mai de la màxima de cotització del 2026, ${m(MAX_CONTRIBUTION_BASE)} al mes.`,
      amtCols: ["Fills a càrrec", "Mínim al mes", "Màxim al mes"],
      kids: ["Cap", "Un", "Dos o més"],
      amtNote: "Les mateixes xifres publica el SEPE a «Cuantías anuales». A temps parcial, el mínim i el màxim es redueixen en proporció a la jornada.",
      reformTitle: "Va canviar el percentatge amb la reforma del 2024?",
      reform: `No. El Reial decret llei 2/2024 va reformar els subsidis (ara el 95 %, el 90 % i el 80 % de l'IPREM: ${m(SUBSIDY_MONTHLY[0])}, ${m(SUBSIDY_MONTHLY[1])} i ${m(SUBSIDY_MONTHLY[2])} al mes) i la compatibilitat amb una feina, però no la prestació contributiva: l'article 270.2 de la LGSS continua dient el 70 % durant els primers 180 dies i el 60 % a partir del dia 181 (text consolidat del BOE, actualitzat el ${lgssDate}). El 60 % des del dia 181 regeix des de l'1 de gener de 2023; abans era el 50 %.`,
      dedTitle: "Descomptes: Seguretat Social i IRPF",
      ded: `Mentre cobres l'atur continues cotitzant: el SEPE paga la part de l'empresa i et descompta la teva, que el 2026 és el ${ss} de la base reguladora (a l'exemple, ${m(r.ssMonthly)} al mes), encara que la prestació sigui al màxim o al mínim. També et reté IRPF si correspon, segons el que cobraràs durant l'any i la teva situació familiar; pots demanar més retenció amb el model 145.`,
      whoTitle: "Qui hi té dret",
      who: [
        <>Estar en situació legal de desocupació: acomiadament, fi de contracte temporal, ERO… La baixa voluntària no hi dona dret, tret dels casos de l&apos;Estatut que l&apos;equiparen (trasllat, modificació substancial, incompliment greu de l&apos;empresa, violència de gènere).</>,
        <>Haver cotitzat almenys 360 dies en els últims sis anys.</>,
        <>Inscriure&apos;t com a demandant d&apos;ocupació, signar l&apos;acord d&apos;activitat i no tenir l&apos;edat de jubilació (tret que no tinguis prou cotització per jubilar-te).</>,
        <>Demanar-lo en els 15 dies hàbils següents a l&apos;acomiadament o al final de les vacances no gaudides (amb el certificat d&apos;empresa). Si et paguen vacances a la <Link href={settlement}>quitança</Link>, l&apos;atur comença quan s&apos;acaben aquests dies.</>,
        <>Si t&apos;han acomiadat, mira també la teva <Link href={dismissal}>indemnització</Link>: és compatible amb l&apos;atur.</>,
      ],
    },
    en: {
      lead: (
        <p>
          <strong>Unemployment benefit (paro) lasts from 120 days to 2 years</strong> depending on what you contributed in the last six years (360 days minimum), and <strong>pays 70% of your base reguladora for the first 180 days and 60% from day 181</strong>, with a minimum of {m(lim[0]!.min)} and a maximum of {m(lim[0]!.max)} a month without children in 2026 ({m(lim[1]!.min)} and up to {m(lim[2]!.max)} with children). Example: {n(Number(ex.contributedDays))} days contributed and a base of {m(Number(ex.monthlyBase))} give {r.durationDays} days of benefit, {m(first!.monthly)} a month for the first six months and {m(after!.monthly)} after.
        </p>
      ),
      pay: (
        <>
          SEPE pays the previous month&apos;s benefit on the 10th of each month: <Link href={payDates}>unemployment benefit payment dates</Link>.
        </>
      ),
      durTitle: "How long it lasts: the official scale",
      durIntro: "Article 269.1 of the General Social Security Act (LGSS). It counts days of unemployment contributions in the previous six years not used for an earlier benefit, including unused holiday paid when the contract ended.",
      durCols: ["Days contributed", "Days of benefit", "Months"],
      from: (a: number, b: number | null) => (b === null ? `${n(a)} or more` : `${n(a)} to ${n(b)}`),
      amtTitle: "How much: the 2026 minimum and maximum",
      amtIntro: `The base reguladora is the average of your unemployment contribution bases over the last 180 days, without overtime (art. 270.1): for six monthly payslips, the average monthly base; per day, divided by 30. You get 70% for the first 180 days and 60% after (art. 270.2), within limits that depend on children in your care and are set on the IPREM (${iprem} a month in 2026, the 2023 budget figure, still prorogued) plus one sixth: ${iprem7} (art. 270.3). The base never exceeds the 2026 maximum contribution base, ${m(MAX_CONTRIBUTION_BASE)} a month.`,
      amtCols: ["Children in care", "Minimum a month", "Maximum a month"],
      kids: ["None", "One", "Two or more"],
      amtNote: "SEPE publishes the same figures in its \"Cuantías anuales\" page. For part-time work, the minimum and maximum shrink in proportion to the hours.",
      reformTitle: "Did the 2024 reform change the percentages?",
      reform: `No. Royal Decree-law 2/2024 reformed the unemployment subsidies (now 95%, 90% and 80% of the IPREM: ${m(SUBSIDY_MONTHLY[0])}, ${m(SUBSIDY_MONTHLY[1])} and ${m(SUBSIDY_MONTHLY[2])} a month) and how they combine with a job, but not the contributory benefit: article 270.2 LGSS still reads "70 per cent for the first 180 days and 60 per cent from day 181" (BOE consolidated text, updated ${lgssDate}). The 60% from day 181 applies since 1 January 2023; it used to be 50%.`,
      dedTitle: "Deductions: Social Security and income tax",
      ded: `You keep contributing while on benefit: SEPE pays the employer's share and deducts yours, ${ss} of the base reguladora in 2026 (in the example, ${m(r.ssMonthly)} a month), even when your benefit is at the maximum or minimum. It also withholds income tax (IRPF) where due, depending on what you will receive in the year and your family; you can ask for more withholding with form 145.`,
      whoTitle: "Who is entitled",
      who: [
        <>Being legally unemployed: dismissal, end of a fixed-term contract, ERE… Resigning does not qualify, except in the cases the Workers&apos; Statute treats as dismissal (relocation, substantial change, serious breach by the employer, gender violence).</>,
        <>At least 360 days contributed in the last six years.</>,
        <>Registering as a job seeker, signing the activity agreement (acuerdo de actividad) and being under the state pension age (unless you lack the contributions to retire).</>,
        <>Applying within 15 working days of the dismissal or of the end of unused holiday (with the employer&apos;s certificate). If holiday is paid in your <Link href={settlement}>final settlement</Link>, benefit starts when those days end.</>,
        <>If you were dismissed, check your <Link href={dismissal}>severance pay</Link> too: you can get both.</>,
      ],
    },
  }[locale];

  return (
    <CalcLayout calcKey="unemployment" locale={locale} meta={UNEMPLOYMENT_META[locale]} lead={copy.lead} sources={["lgssArt269", "lgssArt270", "lgss", "sepeAmounts", "sepeContributory", "pge2023", "cotizacion2026"]}>
      <UnemploymentCalculator locale={locale} initial={UNEMPLOYMENT_EXAMPLE} />
      <p>{copy.pay}</p>

      <h2 id="duracion">{copy.durTitle}</h2>
      <p>{copy.durIntro}</p>
      <div className="ci-table-scroll">
        <table className="ci-local-table">
          <thead>
            <tr>
              {copy.durCols.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DURATION_SCALE.map(([from, days], i) => {
              const next = DURATION_SCALE[i + 1];
              return (
                <tr key={from}>
                  <th scope="row" className="font-normal">
                    {copy.from(from, next ? next[0] - 1 : null)}
                  </th>
                  <td>{days}</td>
                  <td>{days / 30}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 id="cuantia">{copy.amtTitle}</h2>
      <p>{copy.amtIntro}</p>
      <div className="ci-table-scroll">
        <table className="ci-local-table">
          <thead>
            <tr>
              {copy.amtCols.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lim.map((l, i) => (
              <tr key={copy.kids[i]}>
                <th scope="row" className="font-normal">
                  {copy.kids[i]}
                </th>
                <td>{m(l.min)}</td>
                <td>{m(l.max)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-[var(--color-muted)]">{copy.amtNote}</p>

      <h2 id="reforma-2024">{copy.reformTitle}</h2>
      <p>{copy.reform}</p>
      <p>
        {SUBSIDY_LINK[locale].text} <Link href={calcPath("unemployment-subsidy", locale)}>{SUBSIDY_LINK[locale].link}</Link>.
      </p>

      <h2 id="descuentos">{copy.dedTitle}</h2>
      <p>{copy.ded}</p>

      <h2 id="requisitos">{copy.whoTitle}</h2>
      <ul>
        {copy.who.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </CalcLayout>
  );
}
