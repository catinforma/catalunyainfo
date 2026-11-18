import Link from "next/link";

import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { COMPARE_SALARIES, type NetLocale } from "@/lib/programmatic/net-salary/copy";
import { DEFAULT_INPUT, compareRegimes, specialRegimeTax } from "@/lib/programmatic/net-salary/engine";
import { SALARY_RULES_YEAR } from "@/lib/programmatic/net-salary/rules-2026";
import { specialBreakEven, specialFormat as fmt, workerRateOpen } from "@/lib/programmatic/net-salary/special-copy";
import { AEAT_EXAMPLES, NON_RESIDENT, REGISTRATION_LINKS, SPECIAL_QUOTES, SPECIAL_REGIME, SPECIAL_REGIME_AS_OF, SPECIAL_SOURCES } from "@/lib/programmatic/net-salary/special-regime";

/**
 * The net salary page's sections for people moving to or working in Spain, in
 * ca, es and en (same content, NetSalaryPage decides the order): how much
 * tax, standard withholding vs the special regime for posted workers
 * ("Beckham law", art. 93 LIRPF), the 183-day residence rule, the NIE and
 * Social Security number, plus their FAQ entries, sources and limits. Every
 * figure comes from the engine, rules-2026.ts or special-regime.ts.
 */

const L = <T,>(locale: NetLocale, v: Record<NetLocale, T>): T => v[locale];
const Y = SALARY_RULES_YEAR;
const S = SPECIAL_REGIME;

function Quote({ text, source, href }: { text: string; source: string; href: string }) {
  return (
    <blockquote lang="es">
      <p>«{text}»</p>
      <footer className="text-sm">
        <a href={href} rel="noopener" target="_blank">
          {source}
        </a>
      </footer>
    </blockquote>
  );
}

/* -------------------------------------------------------------------------- */
/* How much tax: standard withholding vs the special regime                   */
/* -------------------------------------------------------------------------- */

export function TaxInSpainSection({ locale }: { locale: NetLocale }) {
  const { m, pc, p0, signed, rate } = fmt(locale);
  const be = specialBreakEven();
  const rows = COMPARE_SALARIES.map((gross) => ({ gross, ...compareRegimes({ ...DEFAULT_INPUT, gross }) }));
  const ss = pc(workerRateOpen());

  const h = L(locale, {
    es: "¿Cuánto IRPF se paga? Régimen general y ley Beckham",
    ca: "Quant IRPF es paga? Règim general i llei Beckham",
    en: "How much tax will I pay in Spain?",
  });
  const lead = L(locale, {
    es: `En una nómina se pagan dos cosas: la Seguridad Social (tu parte es el ${ss} con contrato indefinido, hasta la base máxima) y la retención de IRPF, que sube con el sueldo y baja con los hijos y otras circunstancias familiares. La tabla da las dos, y lo que queda, para un soltero sin hijos; si has optado por el régimen especial de trabajadores desplazados (la «ley Beckham»), el IRPF es del ${rate}.`,
    ca: `En una nòmina es paguen dues coses: la Seguretat Social (la teva part és el ${ss} amb contracte indefinit, fins a la base màxima) i la retenció d'IRPF, que puja amb el sou i baixa amb els fills i altres circumstàncies familiars. La taula dona totes dues, i el que queda, per a un solter sense fills; si has optat pel règim especial de treballadors desplaçats (la «llei Beckham»), l'IRPF és del ${rate}.`,
    en: `As an employee you pay two things out of each payslip: Social Security (your share is ${ss} on an open-ended contract, up to the maximum base) and income tax (IRPF) withholding, which rises with pay and falls with children and other family circumstances. The table gives both, and what is left, for a single person without children; if you have opted for the special regime for posted workers (the "Beckham law"), the income tax is ${rate} instead.`,
  });
  const caption = L(locale, {
    es: `IRPF y neto ${Y}: retención del régimen general y régimen especial; soltero, sin hijos, contrato indefinido, comunidad de régimen común`,
    ca: `IRPF i net ${Y}: retenció del règim general i règim especial; solter, sense fills, contracte indefinit, comunitat de règim comú`,
    en: `Income tax and net pay ${Y}: standard withholding and special regime; single, no children, open-ended contract, common-regime region`,
  });
  const cols = L(locale, {
    es: ["Bruto anual", "General: retención", "General: neto al año", "Especial: IRPF", "Especial: neto al año", "Diferencia"],
    ca: ["Brut anual", "General: retenció", "General: net l'any", "Especial: IRPF", "Especial: net l'any", "Diferència"],
    en: ["Gross a year", "Standard: tax withheld", "Standard: net a year", "Special: income tax", "Special: net a year", "Difference"],
  });
  const single = be.single !== null ? m(be.single, 0) : "—";
  const two = be.twoChildren !== null ? m(be.twoChildren, 0) : "—";
  const breakEven = L(locale, {
    es: `Para un soltero sin hijos, el régimen especial deja más neto a partir de ${single} brutos al año: por debajo, la retención del régimen general es inferior al ${rate}. Con dos hijos menores de 25 años (computados por mitad), el punto sube a ${two}, porque el régimen general tiene mínimos familiares y el especial no.`,
    ca: `Per a un solter sense fills, el règim especial deixa més net a partir de ${single} bruts l'any: per sota, la retenció del règim general és inferior al ${rate}. Amb dos fills menors de 25 anys (computats per meitat), el punt puja a ${two}, perquè el règim general té mínims familiars i l'especial no.`,
    en: `For a single person without children, the special regime leaves more net pay from ${single} gross a year: below that, standard withholding is under ${rate}. With two children under 25 (counted by half) the point moves up to ${two}, because the standard calculation has family allowances and the special regime has none.`,
  });
  const caveat = L(locale, {
    es: `Las cifras del régimen general son la retención que aplica la empresa; el IRPF final se decide en la declaración de la Renta, con la escala y las deducciones de tu comunidad, y puede salir a devolver o a pagar. En el régimen especial, el ${rate} del sueldo ya es el impuesto final sobre los rendimientos del trabajo, igual en todas las comunidades. Para tu caso, usa la calculadora de arriba y elige el régimen.`,
    ca: `Les xifres del règim general són la retenció que aplica l'empresa; l'IRPF final es decideix a la declaració de la renda, amb l'escala i les deduccions de la teva comunitat, i pot sortir a retornar o a pagar. Al règim especial, el ${rate} del sou ja és l'impost final sobre els rendiments del treball, igual a totes les comunitats. Per al teu cas, fes servir la calculadora de dalt i tria el règim.`,
    en: `The standard figures are the withholding your employer applies; the final IRPF is settled in the annual return (Renta), with your region's own scale and deductions, so it can end in a refund or a bill. Under the special regime, ${rate} of the pay is already the final tax on employment income, the same in every region. For your own case, use the calculator above and choose the regime.`,
  });

  return (
    <>
      <h2 id="tax-spain">{h}</h2>
      <p>{lead}</p>
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table">
          <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
          <thead>
            <tr>
              {cols.map((c, k) => (
                <th key={c} scope="col" className={k > 0 ? "text-right" : undefined}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ gross, standard, special, difference }) => (
              <tr key={gross}>
                <th scope="row" className="whitespace-nowrap font-normal">
                  {m(gross, 0)}
                </th>
                <td className="whitespace-nowrap text-right tabular-nums">
                  {m(standard.irpf.annual, 0)} ({pc(standard.irpf.rate)})
                </td>
                <td className="whitespace-nowrap text-right tabular-nums">{m(standard.net.annual, 0)}</td>
                <td className="whitespace-nowrap text-right tabular-nums">
                  {m(special.tax.annual, 0)} ({pc(special.tax.rate)})
                </td>
                <td className="whitespace-nowrap text-right tabular-nums">{m(special.net.annual, 0)}</td>
                <td className="whitespace-nowrap text-right tabular-nums">{signed(difference)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{breakEven}</p>
      <p>{caveat}</p>
      <p className="text-sm">
        {L(locale, {
          es: `Por encima de ${m(S.threshold, 0)} el tipo es del ${p0(S.topRate)} en el régimen especial: la última fila lo incluye.`,
          ca: `Per sobre de ${m(S.threshold, 0)} el tipus és del ${p0(S.topRate)} al règim especial: l'última fila ho inclou.`,
          en: `Above ${m(S.threshold, 0)} the special-regime rate is ${p0(S.topRate)}: the last row includes it.`,
        })}
      </p>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* The special regime for posted workers                                      */
/* -------------------------------------------------------------------------- */

export function SpecialRegimeSection({ locale }: { locale: NetLocale }) {
  const { threshold, rate, top, p0 } = fmt(locale);
  const years = S.followingYears + 1;
  const prior = S.priorNonResidentYears;
  const share = p0(S.qualifiedShare);
  const cap = p0(S.foreignCreditCap);
  const savings = p0(S.savingsFirstRate);
  const next = Y + 1;

  const h = L(locale, {
    es: "Régimen especial de trabajadores desplazados (ley Beckham)",
    ca: "Règim especial de treballadors desplaçats (llei Beckham)",
    en: "Special regime for posted workers (Beckham law)",
  });
  const intro = L(locale, {
    es: `Si pasas a ser residente fiscal en España porque te has trasladado aquí por trabajo, puedes elegir tributar por el Impuesto sobre la Renta de no Residentes sin dejar de ser contribuyente del IRPF, el año en que adquieres la residencia y los ${S.followingYears} siguientes: ${years} ejercicios en total. Se conoce como «ley Beckham»; en la ley es el régimen especial de trabajadores, profesionales, emprendedores e inversores desplazados a territorio español, artículo 93 de la Ley del IRPF, en la redacción de la ley de empresas emergentes (Ley 28/2022), vigente desde el 1 de enero de 2023.`,
    ca: `Si passes a ser resident fiscal a Espanya perquè t'hi has traslladat per feina, pots triar tributar per l'impost sobre la renda de no residents sense deixar de ser contribuent de l'IRPF, l'any en què adquireixes la residència i els ${S.followingYears} següents: ${years} exercicis en total. Se'n diu «llei Beckham»; a la llei és el règim especial de treballadors, professionals, emprenedors i inversors desplaçats a territori espanyol, article 93 de la Llei de l'IRPF, en la redacció de la llei d'empreses emergents (Llei 28/2022), vigent des de l'1 de gener de 2023.`,
    en: `If you become tax resident in Spain because you moved here for work, you can choose to pay income tax under the non-residents' rules while remaining an IRPF taxpayer, for the year you become resident and the following ${S.followingYears}: ${years} tax years in all. It is known as the "Beckham law"; in law it is the special regime for workers, professionals, entrepreneurs and investors posted to Spain, article 93 of the IRPF Law, in the wording of the start-ups law (Ley 28/2022) in force since 1 January 2023.`,
  });
  const sub = L(locale, {
    es: { who: "Quién puede acogerse", pay: "Qué se paga", how: "Cómo se pide y cuánto dura" },
    ca: { who: "Qui s'hi pot acollir", pay: "Què es paga", how: "Com es demana i quant dura" },
    en: { who: "Who can opt in", pay: "What you pay", how: "How to opt in, and how long it lasts" },
  });
  const who = L(locale, {
    es: [
      `No haber sido residente en España en ninguno de los ${prior} ejercicios anteriores al del desplazamiento (art. 93.1.a).`,
      `Trasladarse, el primer año del régimen o el anterior, por alguno de estos motivos: un contrato de trabajo con una empresa en España; un desplazamiento ordenado por la empresa, con carta de desplazamiento; teletrabajo hecho exclusivamente con medios informáticos y de telecomunicación (por ejemplo, con el visado para teletrabajo de carácter internacional); ser nombrado administrador de una sociedad; una actividad emprendedora reconocida por la ley de emprendedores (Ley 14/2013, con informe favorable de ENISA); o trabajar como profesional altamente cualificado para empresas emergentes, o en formación, investigación, desarrollo e innovación, si eso supone más del ${share} de tus rendimientos del trabajo y de actividades (art. 93.1.b).`,
      "Quedan fuera los deportistas profesionales (Real Decreto 1006/1985).",
      "No obtener rentas mediante un establecimiento permanente en España, salvo en los casos de emprendedores y profesionales altamente cualificados (art. 93.1.c).",
      `Tu cónyuge y tus hijos menores de ${S.childrenUnder} años (de cualquier edad con discapacidad), o el otro progenitor si no estáis casados, también pueden acogerse si se desplazan contigo o antes de que acabe tu primer año del régimen, adquieren la residencia, cumplen la misma regla de los ${prior} años y la suma de sus bases es menor que la tuya (art. 93.3).`,
    ],
    ca: [
      `No haver estat resident a Espanya en cap dels ${prior} exercicis anteriors al del desplaçament (art. 93.1.a).`,
      `Traslladar-te, el primer any del règim o l'anterior, per algun d'aquests motius: un contracte de treball amb una empresa a Espanya; un desplaçament ordenat per l'empresa, amb carta de desplaçament; teletreball fet exclusivament amb mitjans informàtics i de telecomunicació (per exemple, amb el visat per a teletreball de caràcter internacional); ser nomenat administrador d'una societat; una activitat emprenedora reconeguda per la llei d'emprenedors (Llei 14/2013, amb informe favorable d'ENISA); o treballar com a professional altament qualificat per a empreses emergents, o en formació, recerca, desenvolupament i innovació, si això representa més del ${share} dels teus rendiments del treball i d'activitats (art. 93.1.b).`,
      "En queden fora els esportistes professionals (Reial decret 1006/1985).",
      "No obtenir rendes mitjançant un establiment permanent a Espanya, llevat dels casos d'emprenedors i professionals altament qualificats (art. 93.1.c).",
      `El teu cònjuge i els teus fills menors de ${S.childrenUnder} anys (de qualsevol edat amb discapacitat), o l'altre progenitor si no esteu casats, també s'hi poden acollir si es desplacen amb tu o abans que acabi el teu primer any del règim, adquireixen la residència, compleixen la mateixa regla dels ${prior} anys i la suma de les seves bases és inferior a la teva (art. 93.3).`,
    ],
    en: [
      `You were not resident in Spain in any of the ${prior} tax years before the year of the move (art. 93.1.a).`,
      `You move, in the first year of the regime or the year before, because of: a job with an employer in Spain; a posting ordered by your employer, with a posting letter; remote work done exclusively by computer and telecommunications (for example with the international telework visa); becoming a company director; an entrepreneurial activity recognised under the entrepreneurs' law (Ley 14/2013, with a favourable ENISA report); or work as a highly qualified professional for start-ups, or in training, research, development and innovation, when that pay is more than ${share} of your income from work and business (art. 93.1.b).`,
      "Professional athletes (Real Decreto 1006/1985) are excluded.",
      "You have no income through a permanent establishment in Spain, except in the entrepreneur and highly qualified professional cases (art. 93.1.c).",
      `Your spouse and children under ${S.childrenUnder} (any age with a disability), or the children's other parent if you are not married, can also opt in if they move with you or before your first regime year ends, become resident, meet the same ${prior}-year rule, and their tax bases together are smaller than yours (art. 93.3).`,
    ],
  });
  const pay = L(locale, {
    es: [
      `Rendimientos del trabajo: el ${rate} del sueldo bruto hasta ${threshold} al año y el ${top} de lo que pase de esa cifra (art. 93.2.e). Todo el sueldo que cobras durante el régimen se considera obtenido en España, trabajes donde trabajes (art. 93.2.b); las demás rentas solo tributan si proceden de España, con las reglas de no residentes. Dividendos, intereses y ganancias patrimoniales tienen su propia escala, que empieza en el ${savings}.`,
      `La base es el sueldo bruto: la ley de no residentes grava el «importe íntegro» (TRLIRNR, art. 24.1). No hay mínimo personal ni familiar ni se restan las cotizaciones; solo reducen el impuesto los donativos, el impuesto pagado en el extranjero por ese sueldo (hasta el ${cap} del impuesto español que le corresponde) y lo retenido (RIRPF, art. 114.2.b).`,
      `Retención: el ${rate}, y el ${top} de lo que la misma empresa te pague por encima de ${threshold} en el año (art. 93.2.f y RIRPF, art. 114.3), desde que le entregas el documento de la Agencia Tributaria. Con el sueldo de una sola empresa, la retención y el impuesto final coinciden.`,
      "Una sola escala para toda España: la declaración (modelo 151) aplica la escala del artículo 93 y después reparte el resultado mitad para el Estado y mitad para tu comunidad; no hay escala autonómica, así que da igual Madrid, Cataluña o Andalucía.",
      "La Seguridad Social no cambia: el régimen es una norma del IRPF. De alta en la Seguridad Social española, pagas las mismas cotizaciones que cualquier trabajador (la calculadora las aplica). Impuesto sobre el Patrimonio: solo por los bienes situados en España (art. 93.1).",
      "Convenios de doble imposición: según la Agencia Tributaria, quienes se acogen al régimen no se consideran residentes a efectos de los convenios, porque solo tributan por las rentas de fuente española.",
    ],
    ca: [
      `Rendiments del treball: el ${rate} del sou brut fins a ${threshold} l'any i el ${top} del que passi d'aquesta xifra (art. 93.2.e). Tot el sou que cobres durant el règim es considera obtingut a Espanya, treballis on treballis (art. 93.2.b); les altres rendes només tributen si provenen d'Espanya, amb les regles de no residents. Dividends, interessos i guanys patrimonials tenen la seva pròpia escala, que comença al ${savings}.`,
      `La base és el sou brut: la llei de no residents grava l'«importe íntegro» (TRLIRNR, art. 24.1). No hi ha mínim personal ni familiar ni es resten les cotitzacions; només redueixen l'impost els donatius, l'impost pagat a l'estranger per aquest sou (fins al ${cap} de l'impost espanyol que li correspon) i el que s'ha retingut (RIRPF, art. 114.2.b).`,
      `Retenció: el ${rate}, i el ${top} del que la mateixa empresa et pagui per sobre de ${threshold} a l'any (art. 93.2.f i RIRPF, art. 114.3), des que li lliures el document de l'Agència Tributària. Amb el sou d'una sola empresa, la retenció i l'impost final coincideixen.`,
      "Una sola escala per a tot Espanya: la declaració (model 151) aplica l'escala de l'article 93 i després reparteix el resultat meitat per a l'Estat i meitat per a la teva comunitat; no hi ha escala autonòmica, de manera que tant és Madrid, Catalunya o Andalusia.",
      "La Seguretat Social no canvia: el règim és una norma de l'IRPF. D'alta a la Seguretat Social espanyola, pagues les mateixes cotitzacions que qualsevol treballador (la calculadora les aplica). Impost sobre el patrimoni: només pels béns situats a Espanya (art. 93.1).",
      "Convenis de doble imposició: segons l'Agència Tributària, els qui s'acullen al règim no es consideren residents a efectes dels convenis, perquè només tributen per les rendes de font espanyola.",
    ],
    en: [
      `Employment income: ${rate} of gross pay up to ${threshold} a year and ${top} above it (art. 93.2.e). All the employment income you earn while in the regime counts as Spanish, wherever you do the work (art. 93.2.b); other income is taxed only if it comes from Spain, under the non-residents' rules. Dividends, interest and capital gains have their own scale, starting at ${savings}.`,
      `The base is the gross pay: the non-residents' law taxes the "importe íntegro" (TRLIRNR art. 24.1). There is no personal or family allowance and no deduction for Social Security; the only things that reduce the tax are donations, tax already paid abroad on that pay (up to ${cap} of the Spanish tax on it) and what was withheld (RIRPF art. 114.2.b).`,
      `Withholding: ${rate}, and ${top} on what the same employer pays you above ${threshold} in a year (art. 93.2.f and RIRPF art. 114.3), once you give your employer the Tax Agency's certificate. With pay from one employer, the withholding and the final tax are the same.`,
      "One scale for the whole of Spain: the annual return (modelo 151) applies the article 93 scale and then splits the result half to the State and half to your region; there is no regional scale, so Madrid, Catalonia or Andalusia make no difference.",
      "Social Security does not change: the regime is an income tax rule. Registered with Spanish Social Security, you pay the same contributions as anyone else (the calculator applies them). Wealth tax: only on your assets in Spain (art. 93.1).",
      "Double taxation treaties: the Tax Agency says that taxpayers under the regime are not treated as Spanish residents for treaty purposes, because they are taxed only on Spanish-source income.",
    ],
  });
  const how = L(locale, {
    es: [
      `Se presenta el modelo 149 en un plazo máximo de ${S.optionMonths} meses desde la fecha de inicio de la actividad que consta en el alta en la Seguridad Social española, o en los documentos que te mantienen en la Seguridad Social de tu país (RIRPF, art. 116.1.a).`,
      "Antes del 149 hay que enviar la documentación con el trámite de la Agencia Tributaria «Aportar documentación necesaria para optar por el régimen especial»; su número de registro va en el modelo. Necesitas NIF y estar en el censo de la Agencia Tributaria.",
      `Si todo está en orden, la Agencia Tributaria expide en un máximo de ${S.certificateWorkingDays} días hábiles un documento que acredita la opción; lo entregas a tu empresa para que retenga el ${rate} (RIRPF, art. 119.4).`,
      "Cada año se presenta la declaración especial, el modelo 151, en el mismo plazo que la Renta general.",
      `Dura el ejercicio en que adquieres la residencia (el primer año natural, después del desplazamiento, en que pasas más de ${S.residenceDays} días en España) y los ${S.followingYears} siguientes (RIRPF, art. 115).`,
      `Para salir, se renuncia en noviembre o diciembre del año anterior: para dejarlo desde ${next}, en noviembre o diciembre de ${Y} (RIRPF, art. 117). Si dejas de cumplir un requisito, quedas excluido desde ese ejercicio y debes comunicarlo en el plazo de un mes (art. 118). En los dos casos ya no puedes volver a optar.`,
    ],
    ca: [
      `Es presenta el model 149 en un termini màxim de ${S.optionMonths} mesos des de la data d'inici de l'activitat que consta a l'alta a la Seguretat Social espanyola, o als documents que et mantenen a la Seguretat Social del teu país (RIRPF, art. 116.1.a).`,
      "Abans del 149 cal enviar la documentació amb el tràmit de l'Agència Tributària «Aportar documentación necesaria para optar por el régimen especial»; el seu número de registre va al model. Necessites NIF i ser al cens de l'Agència Tributària.",
      `Si tot és correcte, l'Agència Tributària expedeix en un màxim de ${S.certificateWorkingDays} dies hàbils un document que acredita l'opció; el lliures a la teva empresa perquè retingui el ${rate} (RIRPF, art. 119.4).`,
      "Cada any es presenta la declaració especial, el model 151, en el mateix termini que la renda general.",
      `Dura l'exercici en què adquireixes la residència (el primer any natural, després del desplaçament, en què passes més de ${S.residenceDays} dies a Espanya) i els ${S.followingYears} següents (RIRPF, art. 115).`,
      `Per sortir-ne, s'hi renuncia al novembre o al desembre de l'any anterior: per deixar-lo des del ${next}, al novembre o al desembre del ${Y} (RIRPF, art. 117). Si deixes de complir un requisit, en quedes exclòs des d'aquell exercici i ho has de comunicar en el termini d'un mes (art. 118). En tots dos casos ja no hi pots tornar a optar.`,
    ],
    en: [
      `File modelo 149 within ${S.optionMonths} months of the start date of your activity shown in your Spanish Social Security registration (alta), or in the documents that keep you under your home country's Social Security (RIRPF art. 116.1.a).`,
      `Before the 149, send the supporting documents through the Tax Agency's procedure "Aportar documentación necesaria para optar por el régimen especial"; its registration number goes on the form. You need a tax number (NIF) and to be on the Tax Agency's census.`,
      `If everything is in order, the Tax Agency issues within ${S.certificateWorkingDays} working days a document proving the option; you give it to your employer so it withholds ${rate} (RIRPF art. 119.4).`,
      "Every year you file the special return, modelo 151, in the same period as the ordinary income tax return.",
      `It lasts for the tax year in which you become resident (the first calendar year after the move in which you spend more than ${S.residenceDays} days in Spain) and the next ${S.followingYears} (RIRPF art. 115).`,
      `To leave it, give notice in November or December of the year before: to leave from ${next}, in November or December ${Y} (RIRPF art. 117). If you stop meeting a condition you are out from that tax year and must tell the Tax Agency within one month (art. 118). Either way you cannot opt in again.`,
    ],
  });
  const links = L(locale, {
    es: { lead: "En la Agencia Tributaria:", regime: "Régimen especial de trabajadores desplazados", m149: "Modelo 149: opción, renuncia y exclusión", m151: "Modelo 151: instrucciones" },
    ca: { lead: "A l'Agència Tributària (en castellà):", regime: "Règim especial de treballadors desplaçats", m149: "Model 149: opció, renúncia i exclusió", m151: "Model 151: instruccions" },
    en: { lead: "At the Tax Agency (in Spanish):", regime: "The special regime for posted workers", m149: "Modelo 149: opting in, waiver and exclusion", m151: "Modelo 151: instructions" },
  });
  const disclaimer = L(locale, {
    es: "Si puedes acogerte depende de tu situación: el motivo del traslado, dónde vivías antes, el resto de tus rentas. Consúltalo con la Agencia Tributaria antes de presentar nada; esta página y la calculadora orientan, no son asesoramiento fiscal.",
    ca: "Si t'hi pots acollir depèn de la teva situació: el motiu del trasllat, on vivies abans, la resta de les teves rendes. Consulta-ho amb l'Agència Tributària abans de presentar res; aquesta pàgina i la calculadora orienten, no són assessorament fiscal.",
    en: "Whether you qualify depends on your own situation: why you moved, where you lived before, the rest of your income. Check with the Tax Agency before you file anything; this page and the calculator are a guide, not tax advice.",
  });

  return (
    <>
      <h2 id="beckham">{h}</h2>
      <p>{intro}</p>
      <Quote text={SPECIAL_QUOTES.art93} source="Ley 35/2006 del IRPF, art. 93.1 (BOE-A-2006-20764)" href={SPECIAL_SOURCES.lirpf93.url} />
      <h3>{sub.who}</h3>
      <ul>
        {who.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h3>{sub.pay}</h3>
      <ul>
        {pay.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h3>{sub.how}</h3>
      <ul>
        {how.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <Quote text={SPECIAL_QUOTES.art116} source="Reglamento del IRPF, art. 116.1.a (BOE-A-2007-6820)" href={SPECIAL_SOURCES.rirpf.url} />
      <p>{links.lead}</p>
      <ul>
        <li>
          <a href={SPECIAL_SOURCES.aeatRegime.url} rel="noopener" target="_blank">
            {links.regime}
          </a>
        </li>
        <li>
          <a href={SPECIAL_SOURCES.aeat149.url} rel="noopener" target="_blank">
            {links.m149}
          </a>
        </li>
        <li>
          <a href={SPECIAL_SOURCES.aeat151.url} rel="noopener" target="_blank">
            {links.m151}
          </a>
        </li>
      </ul>
      <p className="text-sm">{disclaimer}</p>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Residence: the 183-day rule                                                */
/* -------------------------------------------------------------------------- */

export function ResidencySection({ locale }: { locale: NetLocale }) {
  const { p0 } = fmt(locale);
  const d = S.residenceDays;
  const h = L(locale, {
    es: `¿Eres residente fiscal en España? La regla de los ${d} días`,
    ca: `Ets resident fiscal a Espanya? La regla dels ${d} dies`,
    en: `Are you tax resident in Spain? The ${d}-day rule`,
  });
  const text = L(locale, {
    es: [
      `Eres residente fiscal en España un año natural si pasas aquí más de ${d} días (las ausencias esporádicas cuentan, salvo que acredites tu residencia fiscal en otro país) o si en España está el núcleo principal o la base de tus actividades o intereses económicos. Se presume que eres residente si tu cónyuge no separado legalmente y tus hijos menores que dependen de ti viven en España (Ley del IRPF, art. 9.1).`,
      "Los residentes pagan IRPF por todas sus rentas, con independencia del lugar donde se hayan producido (art. 2): es lo que calcula la calculadora, con el régimen especial como excepción.",
      `Los no residentes pagan el Impuesto sobre la Renta de no Residentes (IRNR) por la renta obtenida en España: con carácter general el ${p0(NON_RESIDENT.general)}, y el ${p0(NON_RESIDENT.euEea)} si son residentes en otro Estado de la Unión Europea o del Espacio Económico Europeo con intercambio efectivo de información tributaria (TRLIRNR, art. 25.1.a). Esta calculadora no es para no residentes.`,
    ],
    ca: [
      `Ets resident fiscal a Espanya un any natural si hi passes més de ${d} dies (les absències esporàdiques compten, llevat que acreditis la teva residència fiscal en un altre país) o si a Espanya hi ha el nucli principal o la base de les teves activitats o interessos econòmics. Es presumeix que ets resident si el teu cònjuge no separat legalment i els teus fills menors que depenen de tu viuen a Espanya (Llei de l'IRPF, art. 9.1).`,
      "Els residents paguen IRPF per totes les seves rendes, independentment del lloc on s'hagin produït (art. 2): és el que calcula la calculadora, amb el règim especial com a excepció.",
      `Els no residents paguen l'impost sobre la renda de no residents (IRNR) per la renda obtinguda a Espanya: amb caràcter general el ${p0(NON_RESIDENT.general)}, i el ${p0(NON_RESIDENT.euEea)} si són residents en un altre estat de la Unió Europea o de l'Espai Econòmic Europeu amb intercanvi efectiu d'informació tributària (TRLIRNR, art. 25.1.a). Aquesta calculadora no és per a no residents.`,
    ],
    en: [
      `You are tax resident in Spain for a calendar year if you spend more than ${d} days here (sporadic absences count, unless you prove that you are tax resident in another country), or if the main centre of your business or economic interests is in Spain. You are presumed resident if your spouse, not legally separated, and your dependent under-age children live in Spain (IRPF Law, art. 9.1).`,
      "Residents pay IRPF on all their income, wherever it arises (art. 2): that is what the calculator works out, with the special regime as the exception.",
      `Non-residents pay non-residents' income tax (IRNR) on income obtained in Spain: ${p0(NON_RESIDENT.general)} in general, ${p0(NON_RESIDENT.euEea)} for residents of another EU or EEA state with an effective exchange of tax information (TRLIRNR art. 25.1.a). This calculator is not for non-residents.`,
    ],
  });
  return (
    <>
      <h2 id="residency">{h}</h2>
      <p>{text[0]}</p>
      <Quote text={SPECIAL_QUOTES.art9} source="Ley 35/2006 del IRPF, art. 9.1.a (BOE-A-2006-20764)" href={SPECIAL_SOURCES.lirpf9.url} />
      <p>{text[1]}</p>
      <p>{text[2]}</p>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Paperwork: NIE and Social Security number                                  */
/* -------------------------------------------------------------------------- */

export function RegistrationSection({ locale }: { locale: NetLocale }) {
  const h = L(locale, {
    es: "NIE y número de la Seguridad Social: los trámites al empezar a trabajar",
    ca: "NIE i número de la Seguretat Social: els tràmits en començar a treballar",
    en: "NIE and Social Security number: the paperwork when you start work",
  });
  const t = L(locale, {
    es: {
      nie: "NIE (número de identidad de extranjero): debe figurar en todos los documentos que se te expidan; se pide, igual que el certificado de registro de ciudadano de la UE o la TIE, con cita previa ante la Policía Nacional.",
      appointment: "Cita previa de extranjería",
      nuss: "Número de la Seguridad Social (NUSS): lo necesitas para darte de alta por primera vez cuando empiezas a trabajar. Se pide en Import@ss con tu DNI o NIE, tus datos de contacto y tu domicilio; sin Cl@ve ni certificado digital, con una foto de las dos caras del NIE y un selfi.",
      nussLink: "Solicitar el Número de la Seguridad Social (Import@ss)",
      alta: `La fecha de ese alta cuenta para el régimen especial: el plazo de ${S.optionMonths} meses del modelo 149 empieza en la fecha de inicio que figura en ella.`,
      more: "En Cataluña, también:",
    },
    ca: {
      nie: "NIE (número d'identitat d'estranger): ha de constar en tots els documents que se t'expedeixin; es demana, igual que el certificat de registre de ciutadà de la UE o la TIE, amb cita prèvia davant la Policia Nacional.",
      appointment: "Cita prèvia d'estrangeria",
      nuss: "Número de la Seguretat Social (NUSS): el necessites per donar-te d'alta per primer cop quan comences a treballar. Es demana a Import@ss amb el teu DNI o NIE, les dades de contacte i el domicili; sense Cl@ve ni certificat digital, amb una foto de les dues cares del NIE i un selfie.",
      nussLink: "Sol·licitar el número de la Seguretat Social (Import@ss)",
      alta: `La data d'aquesta alta compta per al règim especial: el termini de ${S.optionMonths} mesos del model 149 comença a la data d'inici que hi consta.`,
      more: "A Catalunya, també:",
    },
    en: {
      nie: "NIE (foreigner identity number): it must appear on every document issued to you; you request it, like the EU registration certificate or the TIE card, by appointment with the National Police.",
      appointment: "Foreigners' appointments (cita previa de extranjería)",
      nuss: "Social Security number (NUSS): you need it to be registered (alta) for the first time when you start work. Request it on Import@ss with your DNI or NIE, contact details and address; without Cl@ve or a digital certificate, with a photo of both sides of your NIE and a selfie.",
      nussLink: "Request a Social Security number (Import@ss, in Spanish)",
      alta: `The date of that registration matters for the special regime: the ${S.optionMonths}-month window for modelo 149 runs from the start date it shows.`,
      more: "Also useful in Catalonia:",
    },
  });
  return (
    <>
      <h2 id="nie">{h}</h2>
      <ul>
        <li>
          {t.nie}{" "}
          <a href={REGISTRATION_LINKS.foreignersAppointment} rel="noopener" target="_blank">
            {t.appointment}
          </a>
          ; <Link href={b2href("nieTie", locale)}>{B2_TITLES.nieTie[locale]}</Link>.
        </li>
        <li>
          {t.nuss}{" "}
          <a href={REGISTRATION_LINKS.nuss} rel="noopener" target="_blank">
            {t.nussLink}
          </a>
          .
        </li>
        <li>{t.alta}</li>
        <li>
          {t.more} <Link href={b2href("padro", locale)}>{B2_TITLES.padro[locale]}</Link>; <Link href={b2href("tsi", locale)}>{B2_TITLES.tsi[locale]}</Link>.
        </li>
      </ul>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ, sources, limits                                                       */
/* -------------------------------------------------------------------------- */

export function SpecialRegimeSources({ locale }: { locale: NetLocale }) {
  const { m } = fmt(locale);
  const asOf = dayMonthYear(SPECIAL_REGIME_AS_OF, locale);
  const [big, small] = AEAT_EXAMPLES;
  const lead = L(locale, {
    es: `Régimen especial de trabajadores desplazados, residencia y no residentes: fuentes oficiales leídas el ${asOf}. Comprobación: el cálculo reproduce los ejemplos de las instrucciones del modelo 151 de la Agencia Tributaria (base de ${m(big.base, 0)}: ${m(specialRegimeTax(big.base).annual, 0)}; ${m(small.base, 0)}: ${m(specialRegimeTax(small.base).annual, 0)}).`,
    ca: `Règim especial de treballadors desplaçats, residència i no residents: fonts oficials llegides el ${asOf}. Comprovació: el càlcul reprodueix els exemples de les instruccions del model 151 de l'Agència Tributària (base de ${m(big.base, 0)}: ${m(specialRegimeTax(big.base).annual, 0)}; ${m(small.base, 0)}: ${m(specialRegimeTax(small.base).annual, 0)}).`,
    en: `Special regime for posted workers, residence and non-residents: official sources read on ${asOf}. Check: the calculation reproduces the examples in the Tax Agency's modelo 151 instructions (a base of ${m(big.base, 0)}: ${m(specialRegimeTax(big.base).annual, 0)}; ${m(small.base, 0)}: ${m(specialRegimeTax(small.base).annual, 0)}).`,
  });
  return (
    <>
      <p>{lead}</p>
      <ul>
        {Object.values(SPECIAL_SOURCES).map((s) => (
          <li key={s.url}>
            <a href={s.url} rel="noopener" target="_blank">
              {s.name}
            </a>{" "}
            ({s.ref}, {dayMonthYear(s.date, locale)})
          </li>
        ))}
      </ul>
    </>
  );
}
