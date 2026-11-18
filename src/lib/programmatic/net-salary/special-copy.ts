import { money, percent, type NetLocale } from "./copy";
import { DEFAULT_INPUT, breakEvenGross, compareRegimes } from "./engine";
import { SOCIAL_SECURITY } from "./rules-2026";
import { SPECIAL_REGIME } from "./special-regime";

/**
 * Words of the net salary page's sections for people moving to or working in
 * Spain that are plain text (no JSX), so the tests can read them: the FAQ
 * entries (FAQPage JSON-LD), the limit line, the break-even salaries and the
 * formatting helpers (components/programmatic/net-salary/SpecialRegimeSections.tsx
 * renders the rest). Every figure comes from the engine or the rules.
 */

const L = <T,>(locale: NetLocale, v: Record<NetLocale, T>): T => v[locale];
const S = SPECIAL_REGIME;

/** The worker's total rate on an open-ended contract (common contingencies + unemployment + training + MEI). */
export function workerRateOpen(): number {
  const r = SOCIAL_SECURITY.rates;
  return Math.round((r.commonContingencies + r.unemploymentOpenEnded + r.vocationalTraining + r.intergenerationalEquity) * 100) / 100;
}

export function specialFormat(locale: NetLocale) {
  const m = (v: number, d: 0 | 2 = 2) => money(v, locale, d);
  const pc = (v: number) => percent(v, locale);
  const p0 = (v: number) => percent(v, locale, 0);
  const signed = (v: number) => (v > 0 ? `+${m(v, 0)}` : m(v, 0));
  return { m, pc, p0, signed, threshold: m(S.threshold, 0), rate: p0(S.rate), top: p0(S.topRate) };
}

/** The two break-even salaries the page prints (single, no children; two children counted by half). */
export function specialBreakEven(): { single: number | null; twoChildren: number | null } {
  return { single: breakEvenGross(DEFAULT_INPUT), twoChildren: breakEvenGross({ ...DEFAULT_INPUT, children: 2 }) };
}

/** The FAQ's worked example. */
export const FAQ_GROSS = 50000;

export function specialRegimeFaq(locale: NetLocale): { q: string; a: string }[] {
  const { m, pc, threshold, rate, top } = specialFormat(locale);
  const c = compareRegimes({ ...DEFAULT_INPUT, gross: FAQ_GROSS });
  const st = c.standard;
  const sp = c.special;
  const g = m(FAQ_GROSS, 0);
  const years = S.followingYears + 1;
  const prior = S.priorNonResidentYears;
  const ss = pc(workerRateOpen());
  const d = S.residenceDays;
  return L(locale, {
    es: [
      { q: `¿Cuánto IRPF se paga con ${g} brutos?`, a: `Asalariado, soltero, sin hijos y con contrato indefinido: ${m(st.irpf.annual)} de retención de IRPF (${pc(st.irpf.rate)}) y ${m(st.ss.annual)} de Seguridad Social, así que ${m(st.net.annual, 0)} netos al año, ${m(st.net.perPayment)} al mes en 14 pagas. Con el régimen especial de trabajadores desplazados: ${m(sp.tax.annual)} (${pc(sp.tax.rate)}), ${m(sp.net.annual, 0)} netos. El IRPF final del régimen general se decide en la Renta, con la escala de tu comunidad.` },
      { q: "¿Qué es la ley Beckham?", a: `El nombre popular del régimen especial de trabajadores desplazados a España (artículo 93 de la Ley del IRPF): quien pasa a ser residente fiscal porque se ha trasladado aquí por trabajo puede pagar el ${rate} de su sueldo hasta ${threshold} (el ${top} de lo que pase) en lugar del IRPF progresivo, durante ${years} ejercicios. Hay que pedirlo con el modelo 149.` },
      { q: "¿Quién puede acogerse a la ley Beckham?", a: `Quien no ha sido residente en España en los ${prior} ejercicios anteriores y se traslada por un contrato de trabajo en España, un desplazamiento ordenado por la empresa, teletrabajo, un cargo de administrador, una actividad emprendedora reconocida o un trabajo altamente cualificado para empresas emergentes o de I+D+i; no los deportistas profesionales. El cónyuge y los hijos menores de ${S.childrenUnder} años pueden acogerse con condiciones.` },
      { q: "¿Cuándo se presenta el modelo 149?", a: `En un plazo máximo de ${S.optionMonths} meses desde la fecha de inicio de la actividad que consta en el alta en la Seguridad Social española (Reglamento del IRPF, art. 116). Primero se envía la documentación con el trámite propio de la Agencia Tributaria; la Agencia Tributaria tiene un máximo de ${S.certificateWorkingDays} días hábiles para expedir, si procede, el documento para tu empresa.` },
      { q: "¿El régimen especial cambia las cotizaciones a la Seguridad Social?", a: `No. Es un régimen del IRPF: de alta en la Seguridad Social española pagas el mismo ${ss} con contrato indefinido (hasta la base máxima), y la calculadora lo aplica en las dos columnas. Mantener la Seguridad Social de tu país de origen es otro caso, que la calculadora no incluye.` },
      { q: "¿Se paga IRPF autonómico en el régimen especial?", a: "No hay escala autonómica: el modelo 151 aplica la única escala del artículo 93 y asigna la mitad del resultado al Estado y la mitad a la comunidad. Así que el impuesto es el mismo en Madrid, en Cataluña o en cualquier comunidad de régimen común; en el régimen general, la escala de la comunidad cambia el impuesto final en la Renta. Navarra y el País Vasco tienen su propio IRPF y no están incluidos." },
      { q: "¿Cuántos días en España te hacen residente fiscal?", a: `Más de ${d} días en un año natural, contando las ausencias esporádicas salvo que acredites tu residencia fiscal en otro país; también eres residente si el núcleo principal de tus intereses económicos está en España (Ley del IRPF, art. 9.1).` },
    ],
    ca: [
      { q: `Quant IRPF es paga amb ${g} bruts?`, a: `Assalariat, solter, sense fills i amb contracte indefinit: ${m(st.irpf.annual)} de retenció d'IRPF (${pc(st.irpf.rate)}) i ${m(st.ss.annual)} de Seguretat Social, de manera que ${m(st.net.annual, 0)} nets l'any, ${m(st.net.perPayment)} al mes en 14 pagues. Amb el règim especial de treballadors desplaçats: ${m(sp.tax.annual)} (${pc(sp.tax.rate)}), ${m(sp.net.annual, 0)} nets. L'IRPF final del règim general es decideix a la renda, amb l'escala de la teva comunitat.` },
      { q: "Què és la llei Beckham?", a: `El nom popular del règim especial de treballadors desplaçats a Espanya (article 93 de la Llei de l'IRPF): qui passa a ser resident fiscal perquè s'hi ha traslladat per feina pot pagar el ${rate} del sou fins a ${threshold} (el ${top} del que passi) en lloc de l'IRPF progressiu, durant ${years} exercicis. S'ha de demanar amb el model 149.` },
      { q: "Qui s'hi pot acollir, a la llei Beckham?", a: `Qui no ha estat resident a Espanya en els ${prior} exercicis anteriors i s'hi trasllada per un contracte de treball a Espanya, un desplaçament ordenat per l'empresa, teletreball, un càrrec d'administrador, una activitat emprenedora reconeguda o una feina altament qualificada per a empreses emergents o de R+D+i; no els esportistes professionals. El cònjuge i els fills menors de ${S.childrenUnder} anys s'hi poden acollir amb condicions.` },
      { q: "Quan es presenta el model 149?", a: `En un termini màxim de ${S.optionMonths} mesos des de la data d'inici de l'activitat que consta a l'alta a la Seguretat Social espanyola (Reglament de l'IRPF, art. 116). Primer s'envia la documentació amb el tràmit propi de l'Agència Tributària; l'Agència Tributària té un màxim de ${S.certificateWorkingDays} dies hàbils per expedir, si escau, el document per a la teva empresa.` },
      { q: "El règim especial canvia les cotitzacions a la Seguretat Social?", a: `No. És un règim de l'IRPF: d'alta a la Seguretat Social espanyola pagues el mateix ${ss} amb contracte indefinit (fins a la base màxima), i la calculadora ho aplica a totes dues columnes. Mantenir la Seguretat Social del teu país d'origen és un altre cas, que la calculadora no inclou.` },
      { q: "Es paga IRPF autonòmic al règim especial?", a: "No hi ha escala autonòmica: el model 151 aplica l'única escala de l'article 93 i assigna la meitat del resultat a l'Estat i la meitat a la comunitat. Per tant, l'impost és el mateix a Madrid, a Catalunya o a qualsevol comunitat de règim comú; al règim general, l'escala de la comunitat canvia l'impost final a la renda. Navarra i el País Basc tenen el seu propi IRPF i no hi són inclosos." },
      { q: "Quants dies a Espanya et fan resident fiscal?", a: `Més de ${d} dies en un any natural, comptant les absències esporàdiques llevat que acreditis la residència fiscal en un altre país; també ets resident si el nucli principal dels teus interessos econòmics és a Espanya (Llei de l'IRPF, art. 9.1).` },
    ],
    en: [
      { q: `How much tax will I pay on ${g} in Spain?`, a: `As an employee, single, no children, on an open-ended contract: ${m(st.irpf.annual)} of income tax withheld (${pc(st.irpf.rate)}) and ${m(st.ss.annual)} of Social Security, so ${m(st.net.annual, 0)} net a year, ${m(st.net.perPayment)} a month in 14 payments. Under the special regime for posted workers: ${m(sp.tax.annual)} (${pc(sp.tax.rate)}), ${m(sp.net.annual, 0)} net. The final IRPF under the standard regime is settled in the annual return, with your region's scale.` },
      { q: "What is the Beckham law?", a: `The popular name of the special regime for workers posted to Spain (article 93 of the IRPF Law): people who become tax resident because they moved here for work can pay ${rate} on their pay up to ${threshold} (${top} above) instead of the progressive IRPF, for ${years} tax years. You must apply with modelo 149.` },
      { q: "Who qualifies for the Beckham law?", a: `Someone who has not been resident in Spain in the previous ${prior} tax years and moves because of a job in Spain, a posting ordered by the employer, remote work, becoming a company director, a recognised entrepreneurial activity or highly qualified work for start-ups or R&D; not professional athletes. A spouse and children under ${S.childrenUnder} can join under conditions.` },
      { q: "When do I have to file modelo 149?", a: `Within ${S.optionMonths} months of the activity start date in your Spanish Social Security registration (IRPF Regulation, art. 116). The documents go first, through the Tax Agency's own procedure; the Tax Agency then has up to ${S.certificateWorkingDays} working days to issue, if appropriate, the certificate for your employer.` },
      { q: "Does the special regime change my Social Security contributions?", a: `No. It is an income tax regime: registered with Spanish Social Security you pay the same ${ss} on an open-ended contract (up to the maximum base), and the calculator applies it in both columns. Keeping your home country's Social Security is a different case the calculator does not cover.` },
      { q: "Do I pay regional income tax under the special regime?", a: "There is no regional scale: modelo 151 applies the single article 93 scale and assigns half of the result to the State and half to the region. So the tax is the same in Madrid, Catalonia or any common-regime region; under the standard regime, the region's scale changes the final tax in the annual return. Navarre and the Basque Country have their own income tax and are not covered." },
      { q: "How many days in Spain make me tax resident?", a: `More than ${d} days in a calendar year, counting sporadic absences unless you prove tax residence in another country; you are also resident if the main centre of your economic interests is in Spain (IRPF Law, art. 9.1).` },
    ],
  });
}

export function specialRegimeLimit(locale: NetLocale): string {
  return L(locale, {
    es: "Régimen especial: rentas que no sean el sueldo de una sola empresa, rentas del ahorro, la deducción por impuestos pagados en el extranjero, la opción de los familiares y mantener la Seguridad Social del país de origen; tampoco los no residentes (IRNR).",
    ca: "Règim especial: rendes que no siguin el sou d'una sola empresa, rendes de l'estalvi, la deducció per impostos pagats a l'estranger, l'opció dels familiars i mantenir la Seguretat Social del país d'origen; tampoc els no residents (IRNR).",
    en: "Special regime: income other than pay from one employer, savings income, the credit for tax paid abroad, the family members' option and keeping your home country's Social Security; nor non-residents (IRNR).",
  });
}
