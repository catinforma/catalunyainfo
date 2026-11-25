import type { Block } from "@/lib/content/blocks";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { money } from "@/lib/programmatic/net-salary/copy";
import { specialRegimeTax } from "@/lib/programmatic/net-salary/engine";
import { NON_RESIDENT, REGISTRATION_LINKS, SPECIAL_QUOTES, SPECIAL_REGIME, SPECIAL_REGIME_RECHECK_BY, SPECIAL_SOURCES } from "@/lib/programmatic/net-salary/special-regime";

import { rateText, taxExample } from "./income-tax";
import { B2_PATHS, b2Related, b2link, callout, faq, h2, keyFacts, lead, list, netSalaryRelatedItem, paras, steps, table, verifiedLine, type B2Article, type B2Source } from "./shared";

/**
 * The "Beckham law" (special regime for workers posted to Spain, art. 93
 * LIRPF) as a guide of its own, in ca, es and en (21 Nov 2026): who
 * qualifies, what you pay, how to opt in with modelo 149, every deadline, the
 * family, waiver and exclusion, and the numbers against the standard scales
 * for a resident of Catalonia.
 *
 * Why this page: "beckham law" ≈ 1.2k searches a month from Spain alone, more
 * worldwide (research_notes/spain-utilities-opportunities-nov2026.md, row 25).
 * Since 18 Nov the net salary calculator has a special-regime mode and a short
 * section; this page answers the "requirements / how to apply / deadline"
 * queries the calculator does not, and the calculator links here.
 *
 * Every rule comes from lib/programmatic/net-salary/special-regime.ts (fact
 * pack research_notes/beckham-special-regime-nov2026.md, 18 Nov). Re-read on
 * 21 Nov 2026 with curl (research_notes/expat-guides-nov2026.md): LIRPF art.
 * 93 (BOE-A-2006-20764, art. 93 last changed 21/12/2024), RIRPF arts. 113-119
 * (BOE-A-2007-6820, update 18/11/2026: 115 residence year = first year over
 * 183 days; 116.1.a six months from the Social Security start date; 116.1.b
 * family six months from entry or the main taxpayer's, if longer; 117
 * November-December waiver, no return; 118 exclusion, one month; 119.4 «diez
 * días hábiles»), the AEAT regime page (updated 18/03/2026: «Para ejercitar
 * esta opción presentarán el modelo 149 [...] La declaración del impuesto la
 * realizarán con el modelo 151»), G606 (03/08/2026: NIF and the Censo; first
 * «Aportar documentación necesaria para optar por el régimen especial»), the
 * modelo 151 instructions (12/06/2026: 50 % State / 50 % region; filing period
 * «el mismo que se apruebe cada ejercicio [...] para la declaración del
 * Impuesto sobre la Renta de las Personas Físicas») and the AEAT non-residents
 * manual (13/11/2026: «no tienen la consideración de residentes a efectos de
 * la aplicación de un Convenio de Doble Imposición»).
 *
 * The comparison uses the standard IRPF of income-tax.ts (State + Catalan
 * scales on the taxable base, single, before deductions) against the art. 93
 * tax on gross pay (specialRegimeTax). Social Security is the same in both.
 *
 * Not printed (as in the calculator): the top savings rate (the BOE and an
 * AEAT manual disagree), foral territories' rules, Social Security agreements
 * (A1 certificates), processing times beyond art. 119.4, any claim that the
 * regime is automatic or "approved".
 */
export const BECKHAM_AS_OF = "2026-11-21";
/** The same yearly re-read as the calculator's special-regime rules. */
export const BECKHAM_REREAD_BY = SPECIAL_REGIME_RECHECK_BY;

export const BECKHAM_SALARIES = [40000, 60000, 80000, 100000, 150000, 300000] as const;

/** Lowest whole-euro gross pay at which the standard IRPF (Catalonia, single, before deductions) exceeds the art. 93 tax. */
export function beckhamCrossover(from = 20000, to = 600000): number | null {
  const better = (g: number) => taxExample(g).total > specialRegimeTax(g).annual;
  if (better(from) || !better(to)) return null;
  let lo = from;
  let hi = to;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (better(mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}

export function beckhamRows() {
  return BECKHAM_SALARIES.map((gross) => {
    const standard = taxExample(gross).total;
    const special = specialRegimeTax(gross).annual;
    return { gross, standard, special, saving: Math.round((standard - special) * 100) / 100 };
  });
}

export const BECKHAM_URLS = {
  lirpf93: SPECIAL_SOURCES.lirpf93.url,
  lirpf9: SPECIAL_SOURCES.lirpf9.url,
  rirpf: SPECIAL_SOURCES.rirpf.url,
  trlirnr: SPECIAL_SOURCES.trlirnr.url,
  startups: SPECIAL_SOURCES.startups.url,
  orden: SPECIAL_SOURCES.orden1338.url,
  aeatRegime: SPECIAL_SOURCES.aeatRegime.url,
  aeat149: SPECIAL_SOURCES.aeat149.url,
  aeat151: SPECIAL_SOURCES.aeat151.url,
  aeatManual: SPECIAL_SOURCES.aeatManual.url,
  nuss: REGISTRATION_LINKS.nuss,
} as const;

const SOURCES: B2Source[] = [
  { name: SPECIAL_SOURCES.lirpf93.name, url: BECKHAM_URLS.lirpf93, publisher: "BOE" },
  { name: SPECIAL_SOURCES.lirpf9.name, url: BECKHAM_URLS.lirpf9, publisher: "BOE" },
  { name: SPECIAL_SOURCES.rirpf.name, url: BECKHAM_URLS.rirpf, publisher: "BOE" },
  { name: SPECIAL_SOURCES.trlirnr.name, url: BECKHAM_URLS.trlirnr, publisher: "BOE" },
  { name: SPECIAL_SOURCES.startups.name, url: BECKHAM_URLS.startups, publisher: "BOE" },
  { name: SPECIAL_SOURCES.orden1338.name, url: BECKHAM_URLS.orden, publisher: "BOE" },
  { name: SPECIAL_SOURCES.aeatRegime.name, url: BECKHAM_URLS.aeatRegime, publisher: "Agencia Tributaria" },
  { name: SPECIAL_SOURCES.aeat149.name, url: BECKHAM_URLS.aeat149, publisher: "Agencia Tributaria" },
  { name: SPECIAL_SOURCES.aeat151.name, url: BECKHAM_URLS.aeat151, publisher: "Agencia Tributaria" },
  { name: SPECIAL_SOURCES.aeatManual.name, url: BECKHAM_URLS.aeatManual, publisher: "Agencia Tributaria" },
  { name: "Import@ss: solicitar el número de la Seguridad Social", url: BECKHAM_URLS.nuss, publisher: "Seguridad Social" },
];

export const BECKHAM_META: Record<Locale, { title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    title: "Llei Beckham (règim d'impatriats): qui s'hi pot acollir, el 24 %, el model 149 i els terminis",
    seoTitle: "Llei Beckham: requisits, tipus del 24 % i model 149",
    seoDescription: "El règim especial de l'art. 93 de la Llei de l'IRPF: 24 % fins a 600.000 € durant sis anys, qui s'hi pot acollir, com es demana amb el model 149 i en quin termini.",
    excerpt: "Qui s'hi pot acollir, què es paga, com es demana pas a pas amb el model 149 en sis mesos, la família, la renúncia i l'exclusió, i quant estalvies davant l'IRPF general a Catalunya.",
  },
  es: {
    title: "Ley Beckham (régimen de impatriados): quién puede acogerse, el 24 %, el modelo 149 y los plazos",
    seoTitle: "Ley Beckham: requisitos, tipo del 24 % y modelo 149",
    seoDescription: "El régimen especial del art. 93 de la Ley del IRPF: 24 % hasta 600.000 € durante seis años, quién puede acogerse, cómo se pide con el modelo 149 y en qué plazo.",
    excerpt: "Quién puede acogerse, qué se paga, cómo se pide paso a paso con el modelo 149 en seis meses, la familia, la renuncia y la exclusión, y cuánto ahorras frente al IRPF general en Cataluña.",
  },
  en: {
    title: "Beckham law in Spain: who qualifies, the 24% rate, form 149 and the deadlines",
    seoTitle: "Beckham law Spain: who qualifies, 24% tax and how to apply",
    seoDescription: "Spain's special regime for people who move here (art. 93 IRPF Law): 24% up to €600,000 for six years, who qualifies, how to apply with form 149 and by when.",
    excerpt: "Who qualifies, what you pay, how to apply step by step with form 149 within six months, your family, waiving and losing the regime, and what you save against standard income tax in Catalonia.",
  },
};

/** Everything numeric the three editions print, from the rules and the engines. */
function figures(L: Locale) {
  const S = SPECIAL_REGIME;
  const m = (v: number, d: 0 | 2 = 0) => money(v, L, d);
  const r = (v: number) => rateText(v, L);
  const crossover = beckhamCrossover();
  return {
    m,
    r,
    rate: r(S.rate),
    top: r(S.topRate),
    threshold: m(S.threshold),
    years: S.followingYears + 1,
    following: S.followingYears,
    prior: S.priorNonResidentYears,
    months: S.optionMonths,
    cert: S.certificateWorkingDays,
    share: r(S.qualifiedShare),
    cap: r(S.foreignCreditCap),
    savings: r(S.savingsFirstRate),
    childrenUnder: S.childrenUnder,
    days: S.residenceDays,
    nonRes: r(NON_RESIDENT.general),
    nonResEu: r(NON_RESIDENT.euEea),
    crossover: crossover === null ? "—" : m(crossover),
    rows: beckhamRows().map((x) => [m(x.gross), m(x.standard), m(x.special), x.saving >= 0 ? `+${m(x.saving)}` : m(x.saving)]),
    calc: calcPath("net-salary", L),
  };
}

type Figures = ReturnType<typeof figures>;
type Links = Record<"lirpf93" | "rirpf" | "trlirnr" | "regime" | "m149" | "m151" | "manual" | "nuss" | "calc" | "nieTie" | "incomeTax" | "padro", string>;

interface Copy {
  lead: string;
  factsTitle: string;
  facts: { label: string; value: string }[];
  whatH: string;
  what: string[];
  whoH: string;
  whoCaption: string;
  whoHead: string[];
  whoRows: string[][];
  whoAfter: string[];
  payH: string;
  pay: string[];
  numbersH: string;
  numbersCaption: string;
  numbersHead: string[];
  numbersNote: string;
  numbers: string[];
  howH: string;
  stepsTitle: string;
  steps: { title: string; text: string }[];
  deadlinesH: string;
  deadlinesCaption: string;
  deadlinesHead: string[];
  deadlinesRows: string[][];
  familyH: string;
  family: string[];
  leaveH: string;
  leave: string[];
  notH: string;
  not: string[];
  mistakesH: string;
  mistakes: string[];
  warnTitle: string;
  warn: string;
  faqH: string;
  faq: { question: string; answer: string }[];
  official: string;
}

/** A Markdown link. */
const a = (href: string, label: string) => `[${label}](${href})`;

function copyEn(f: Figures, k: Links): Copy {
  return {
    lead: `**The "Beckham law" is Spain's special tax regime for people who move here: instead of the standard income tax scales, you pay a flat ${f.rate} on your employment income up to ${f.threshold} a year (${f.top} above), for the year you become tax resident and the next ${f.following}.** It is optional and not automatic. You can opt in if you were not resident in Spain in the previous ${f.prior} tax years and you move for a job, a posting, remote work, a company directorship, an entrepreneurial activity or as a highly qualified professional for a start-up. You apply with **form 149** within **${f.months} months** of the start date in your Social Security registration, and the Tax Agency (AEAT) gives you, within ${f.cert} working days, a document for your employer, who then withholds ${f.rate}. Each year you file **form 151** instead of the standard return, in the normal income tax period. In Catalonia the standard scales take more than ${f.rate} of a single person's gross pay from ${f.crossover}, so the regime pays off above that.`,
    factsTitle: "The Beckham law in seven answers",
    facts: [
      { label: "Rate", value: `${f.rate} of employment income up to ${f.threshold} a year, ${f.top} above (art. 93 IRPF Law)` },
      { label: "How long", value: `The year you become resident and the next ${f.following}: ${f.years} tax years` },
      { label: "Who", value: `Not resident in Spain in the previous ${f.prior} years, and moving for work, a directorship, a start-up or an entrepreneurial project` },
      { label: "Deadline", value: `${f.months} months from the start date in your Social Security registration` },
      { label: "Forms", value: "Form 149 to opt in, waive or report an exclusion; form 151 for the yearly return" },
      { label: "Base", value: "Gross pay: no Social Security, expenses or family allowances come off" },
      { label: "Region", value: "One scale for all of Spain: the Catalan scale does not apply" },
    ],
    whatH: "What the Beckham law is",
    what: [
      `In law it is the "special regime for workers, professionals, entrepreneurs and investors posted to Spain", ${k.lirpf93}, in the wording of the start-ups law (Ley 28/2022) in force since 1 January 2023. You stay an income tax (IRPF) taxpayer, but your tax is worked out with the non-residents' rules: «${SPECIAL_QUOTES.art93}».`,
      `"Beckham law" is only the popular name; the law never uses it, and professional athletes are expressly excluded. The regime is about income tax for the years after the move: it does not change your immigration status (you still need your NIE, visa or TIE, see our ${k.nieTie}) or your Social Security.`,
    ],
    whoH: "Who qualifies",
    whoCaption: "Conditions of art. 93.1 of the IRPF Law (all of them must be met)",
    whoHead: ["Condition", "What the law asks", "Where"],
    whoRows: [
      ["No recent residence", `Not tax resident in Spain in any of the ${f.prior} tax years before the year of the move`, "Art. 93.1.a"],
      ["Reason: a job, posting or remote work", "A job with an employer in Spain; a posting ordered by your employer, with a posting letter; or remote work done exclusively by computer and telecommunications (for example with the international telework visa)", "Art. 93.1.b.1º"],
      ["Reason: company director", "Becoming a director of a company (with limits if it is an asset-holding company)", "Art. 93.1.b.2º"],
      ["Reason: entrepreneur", "An entrepreneurial activity recognised under Ley 14/2013 (ENISA report)", "Art. 93.1.b.3º"],
      ["Reason: highly qualified professional", `Working for start-ups, or in training, research, development and innovation, with that pay over ${f.share} of your income from work and business`, "Art. 93.1.b.4º"],
      ["No permanent establishment", "No income through a permanent establishment in Spain, except entrepreneurs and highly qualified professionals", "Art. 93.1.c"],
      ["Become resident", `The move must make you tax resident in Spain (more than ${f.days} days in a calendar year, art. 9)`, "Art. 93.1; RIRPF art. 115"],
    ],
    whoAfter: [
      `The move can happen in the first year of the regime or the year before. Professional athletes covered by Real Decreto 1006/1985 are excluded. Other self-employed work that is not one of the routes above does not qualify.`,
    ],
    payH: "What you pay under the regime",
    pay: [
      `**${f.rate} up to ${f.threshold}, ${f.top} above**, on your general income for the year (art. 93.2.e). Savings income (dividends, interest, gains) has its own scale, starting at ${f.savings}.`,
      `**The base is your gross pay.** The non-residents' law taxes the «importe íntegro» (${k.trlirnr}): no Social Security, no €2,000 of expenses, no personal or family allowance comes off. The only reductions are donations, tax paid abroad on foreign employment income (capped at ${f.cap} of the tax on that income) and what was withheld (RIRPF art. 114).`,
      `**All your employment income counts as Spanish** while the regime lasts, wherever you do the work (art. 93.2.b). Other income is taxed only if it arises in Spain, as for non-residents; you do not pay Spanish income tax on, say, foreign rent or interest.`,
      `**Withholding is ${f.rate}** (${f.top} on the part above ${f.threshold} paid by the same employer), so your payslip and your final tax on pay agree.`,
      `**One scale for all of Spain.** The AEAT's form 151 instructions apply the art. 93 scale and split the result 50 % State, 50 % region: Catalonia's own scale and deductions do not apply.`,
      `**Wealth tax only on assets in Spain** («obligación real», art. 93.1), and **no treaty residence**: the AEAT's ${k.manual} says regime taxpayers «no tienen la consideración de residentes a efectos de la aplicación de un Convenio de Doble Imposición».`,
    ],
    numbersH: "Beckham law or standard income tax: the numbers in Catalonia",
    numbersCaption: "Income tax a year: standard scales (Catalonia) vs the special regime; single, no children, one employer, open-ended contract, before deductions",
    numbersHead: ["Gross salary", "Standard IRPF (State + Catalonia)", `Special regime (${f.rate})`, "You save"],
    numbersNote: `Standard: 2026 State and Catalan scales on the base (gross minus Social Security and €2,000), €5,550 allowance; see our ${k.incomeTax}. Special: ${f.rate} of gross (art. 93.2.e). Social Security is the same in both. Negative saving: the regime costs more.`,
    numbers: [
      `For a single person in Catalonia, the standard scales take more than ${f.rate} of gross pay from **${f.crossover}** a year; below that the regime costs more, above it the gap grows quickly. Children, deductions, a spouse's income or income from abroad change the point. To see your own payslip under both regimes, use our ${a(f.calc, "net salary calculator")} and choose "Special regime for posted workers".`,
    ],
    howH: "How to apply, step by step",
    stepsTitle: "Opting in to the Beckham law",
    steps: [
      { title: "Get your NIE and tax ID", text: `You need a NIF (for foreigners, the NIE) and to be in the AEAT's tax census before you file; if you are not, file the census declaration first (AEAT, form 149 procedure). How to get the NIE: ${k.nieTie}.` },
      { title: "Register with Social Security", text: `Your employer registers you (alta). Its start date starts the clock. If you do not have a Social Security number yet, you can request it on ${k.nuss}. If you keep your home country's Social Security, the date in that document counts.` },
      { title: "Upload the documents", text: "On the AEAT e-office, use the procedure «Aportar documentación necesaria para optar por el régimen especial» (proof of the Social Security registration or of keeping the home system, and of the reason for the move). Note the registration number it gives you." },
      { title: `File form 149 within ${f.months} months`, text: `Online, with that registration number, within ${f.months} months of the start date in the Social Security registration (RIRPF art. 116.1.a). See the ${k.m149}.` },
      { title: "Give the AEAT document to your employer", text: `The AEAT issues, where appropriate, within ${f.cert} working days, a document proving you have opted in (RIRPF art. 119.4). Your employer uses it to withhold ${f.rate}.` },
      { title: "File form 151 every year", text: `Instead of the standard return you file form 151, in the same period as the general income tax return (${k.m151}).` },
    ],
    deadlinesH: "Every deadline",
    deadlinesCaption: "Deadlines of the special regime (Reglamento del IRPF, arts. 115 to 119)",
    deadlinesHead: ["What", "Deadline", "Rule"],
    deadlinesRows: [
      ["Opting in (you)", `${f.months} months from the start date in your Social Security registration`, "Art. 116.1.a"],
      ["Opting in (spouse, children)", `${f.months} months from their arrival, or your own period if it ends later`, "Art. 116.1.b"],
      ["AEAT document for the employer", `Within ${f.cert} working days of filing`, "Art. 119.4"],
      ["How long it lasts", `The year you become resident and the next ${f.following}`, "Art. 115"],
      ["Which is the first year", `The first calendar year after the move with more than ${f.days} days in Spain`, "Art. 115"],
      ["Waiving it", "In November or December, for the following year", "Art. 117"],
      ["Reporting an exclusion", "Within one month of no longer meeting a condition", "Art. 118"],
      ["Yearly return (form 151)", "The general income tax return period", "Form 151 instructions"],
    ],
    familyH: "Your spouse and children",
    family: [
      `Your spouse and your children under ${f.childrenUnder} (any age with a disability), or the other parent if you are not married, can opt in too (art. 93.3) if they move with you or later, before the end of your first year under the regime; become tax resident; meet the same ${f.prior}-year and permanent-establishment conditions; and the sum of their taxable bases is lower than yours. Each one files their own form 149, and the regime lasts for them as long as it lasts for you.`,
    ],
    leaveH: "Waiving the regime or losing it",
    leave: [
      `You can **waive** it in November or December, with effect from the next year, with form 149; an employee first hands the employer the personal data communication of RIRPF art. 88, gets back a stamped copy and attaches it (RIRPF art. 117). If you **stop meeting a condition** (for example you start earning through a permanent establishment) you are excluded from that tax year and must report it within one month (art. 118). In both cases **you cannot opt in again**.`,
    ],
    notH: "What the regime does not change",
    not: [
      "**Social Security.** If you are registered in Spain you pay the same contributions as any employee; the regime only affects income tax.",
      `**Immigration paperwork.** NIE, TIE, visas and the padró follow their own rules (see our ${k.padro}).`,
      "**Navarre and the Basque Country.** They have their own income tax and their own impatriate rules, not covered here.",
      `**Spanish income other than pay.** It is still taxed: Spanish rent goes with your pay at ${f.rate} / ${f.top}, and Spanish dividends, interest and gains go to the savings scale from ${f.savings} (art. 93.2.d and e).`,
    ],
    mistakesH: "Common mistakes",
    mistakes: [
      `**Missing the ${f.months}-month deadline.** It runs from the start date in the Social Security registration, not from your arrival or your first payslip, and there is no late option.`,
      "**Assuming it applies by itself.** You must file form 149; until your employer has the AEAT document, it withholds under the standard rules.",
      "**Expecting deductions.** Social Security, the €2,000 of expenses and family allowances do not reduce the base; with a modest salary or several children the standard rules can cost less.",
      "**Applying a regional scale.** The rate is the same in every region; Catalonia's scale and deductions do not apply.",
      "**Waiving it lightly.** Once you waive or lose the regime you cannot come back to it.",
      "**Relying on a tax treaty as a Spanish resident.** Under the regime you are not treated as resident for treaty purposes.",
    ],
    warnTitle: "When to get advice",
    warn: "Whether you qualify depends on your own facts: why and how you moved, where you lived before, your other income and your family. This guide explains the general rules; it is not tax advice. Check with the AEAT or a tax adviser before filing form 149, especially if you are a director, an entrepreneur, a remote worker for a foreign company or you keep your home Social Security.",
    faqH: "Frequently asked questions",
    faq: [
      { question: "What is the Beckham law in Spain?", answer: `The special income tax regime for people who become tax resident in Spain because they move here (art. 93 of the IRPF Law). You pay ${f.rate} on employment income up to ${f.threshold} and ${f.top} above, for ${f.years} tax years.` },
      { question: "Who qualifies for the Beckham law?", answer: `People who were not resident in Spain in the previous ${f.prior} tax years and move here for a job, a posting, remote work, a company directorship, an entrepreneurial activity recognised by ENISA, or as a highly qualified professional for a start-up. Professional athletes are excluded.` },
      { question: "How do I apply for the Beckham law?", answer: `Upload the supporting documents on the AEAT e-office, then file form 149 with the registration number they give you, within ${f.months} months of your Social Security start date. The AEAT issues a document for your employer within ${f.cert} working days.` },
      { question: "What is the deadline to apply?", answer: `${f.months} months from the start date that appears in your Social Security registration in Spain (or in the document that keeps your home country's Social Security).` },
      { question: "How long does the Beckham law last?", answer: `The tax year in which you become resident and the following ${f.following}: ${f.years} years in all, unless you waive it or stop meeting a condition.` },
      { question: "Can remote workers and digital nomads use the Beckham law?", answer: "Yes, if you are an employee working remotely exclusively by computer and telecommunications; the law mentions the international telework visa expressly. The other conditions (no residence in the previous five years, no permanent establishment) still apply." },
      { question: "Does the Beckham law apply to the self-employed?", answer: `Only through two routes: an entrepreneurial activity recognised under Ley 14/2013, or a highly qualified professional for start-ups or in R&D and innovation earning more than ${f.share} of their income that way. Other self-employed work does not qualify.` },
      { question: "Is the Beckham law worth it?", answer: `For a single person in Catalonia, the standard scales take more than ${f.rate} of gross pay from ${f.crossover}; below that the regime costs more. Children, deductions and income from abroad change the result.` },
      { question: "Do I pay tax on income from abroad under the Beckham law?", answer: "All your employment income is taxed in Spain wherever you work, but other foreign income, such as rent or interest abroad, is not taxed in Spain under the regime." },
    ],
    official: `${k.lirpf93}, ${k.rirpf} (arts. 113 to 119), ${k.trlirnr}, Ley 28/2022, Orden HFP/1338/2023, the AEAT ${k.regime}, the ${k.m149}, the ${k.m151} and the ${k.manual}, all read on 21 November 2026.`,
  };
}

function copyEs(f: Figures, k: Links): Copy {
  return {
    lead: `**La «ley Beckham» es el régimen fiscal especial para quien se traslada a España: en lugar de las escalas generales del IRPF, pagas un ${f.rate} fijo sobre los rendimientos del trabajo hasta ${f.threshold} al año (${f.top} por encima), el año en que pasas a ser residente fiscal y los ${f.following} siguientes.** Es optativo y no se aplica solo. Puedes acogerte si no has sido residente en España en los ${f.prior} ejercicios anteriores y te trasladas por un contrato de trabajo, un desplazamiento de tu empresa, teletrabajo, un cargo de administrador, una actividad emprendedora o como profesional altamente cualificado de una empresa emergente. Se pide con el **modelo 149** en el plazo de **${f.months} meses** desde la fecha de inicio que consta en tu alta en la Seguridad Social, y la Agencia Tributaria te da, en ${f.cert} días hábiles, un documento para tu empresa, que a partir de entonces te retiene el ${f.rate}. Cada año presentas el **modelo 151** en lugar de la declaración ordinaria, en el plazo general de la Renta. En Cataluña, las escalas generales se llevan más del ${f.rate} del bruto de una persona sola a partir de ${f.crossover}: por encima de esa cifra, el régimen sale a cuenta.`,
    factsTitle: "La ley Beckham en siete respuestas",
    facts: [
      { label: "Tipo", value: `${f.rate} de los rendimientos del trabajo hasta ${f.threshold} al año, ${f.top} por encima (art. 93 de la Ley del IRPF)` },
      { label: "Duración", value: `El año en que adquieres la residencia y los ${f.following} siguientes: ${f.years} ejercicios` },
      { label: "Quién", value: `No haber sido residente en España los ${f.prior} años anteriores y trasladarse por trabajo, un cargo de administrador, una empresa emergente o un proyecto emprendedor` },
      { label: "Plazo", value: `${f.months} meses desde la fecha de inicio de tu alta en la Seguridad Social` },
      { label: "Modelos", value: "El 149 para optar, renunciar o comunicar la exclusión; el 151 para la declaración anual" },
      { label: "Base", value: "El sueldo bruto: no se restan la Seguridad Social, los gastos ni los mínimos familiares" },
      { label: "Comunidad", value: "Una sola escala para toda España: la escala catalana no se aplica" },
    ],
    whatH: "Qué es la ley Beckham",
    what: [
      `En la ley es el «régimen especial aplicable a los trabajadores, profesionales, emprendedores e inversores desplazados a territorio español», ${k.lirpf93}, en la redacción de la ley de empresas emergentes (Ley 28/2022), vigente desde el 1 de enero de 2023. Sigues siendo contribuyente del IRPF, pero tu impuesto se calcula con las normas de los no residentes: «${SPECIAL_QUOTES.art93}».`,
      `«Ley Beckham» es solo el nombre popular; la ley no lo usa, y los deportistas profesionales están excluidos expresamente. El régimen trata del IRPF de los años posteriores al traslado: no cambia tu situación de extranjería (sigues necesitando el NIE, el visado o la TIE; mira la ${k.nieTie}) ni tu Seguridad Social.`,
    ],
    whoH: "Quién puede acogerse",
    whoCaption: "Requisitos del art. 93.1 de la Ley del IRPF (hay que cumplirlos todos)",
    whoHead: ["Requisito", "Qué pide la ley", "Dónde"],
    whoRows: [
      ["Sin residencia reciente", `No haber sido residente fiscal en España en ninguno de los ${f.prior} ejercicios anteriores al del desplazamiento`, "Art. 93.1.a"],
      ["Motivo: contrato, desplazamiento o teletrabajo", "Un contrato de trabajo con un empleador en España; un desplazamiento ordenado por tu empresa, con carta de desplazamiento; o teletrabajo hecho exclusivamente con medios informáticos y de telecomunicación (por ejemplo, con el visado para teletrabajo de carácter internacional)", "Art. 93.1.b.1º"],
      ["Motivo: administrador", "Adquirir la condición de administrador de una sociedad (con límites si es una entidad patrimonial)", "Art. 93.1.b.2º"],
      ["Motivo: emprendedor", "Una actividad emprendedora reconocida por la Ley 14/2013 (informe de ENISA)", "Art. 93.1.b.3º"],
      ["Motivo: profesional altamente cualificado", `Trabajar para empresas emergentes, o en formación, investigación, desarrollo e innovación, si esa retribución supera el ${f.share} de tus rendimientos del trabajo y de actividades`, "Art. 93.1.b.4º"],
      ["Sin establecimiento permanente", "No obtener rentas mediante un establecimiento permanente en España, salvo emprendedores y profesionales altamente cualificados", "Art. 93.1.c"],
      ["Pasar a ser residente", `El traslado debe convertirte en residente fiscal en España (más de ${f.days} días en un año natural, art. 9)`, "Art. 93.1; RIRPF art. 115"],
    ],
    whoAfter: [
      "El traslado puede producirse el primer año del régimen o el anterior. Quedan fuera los deportistas profesionales del Real Decreto 1006/1985. Un trabajo por cuenta propia que no encaje en ninguna de las vías anteriores no da derecho al régimen.",
    ],
    payH: "Qué se paga con el régimen especial",
    pay: [
      `**El ${f.rate} hasta ${f.threshold} y el ${f.top} por encima** sobre la base general del año (art. 93.2.e). Las rentas del ahorro (dividendos, intereses, ganancias) tienen su propia escala, que empieza en el ${f.savings}.`,
      `**La base es el sueldo bruto.** La ley de no residentes grava el «importe íntegro» (${k.trlirnr}): no se restan la Seguridad Social, ni los 2.000 € de gastos, ni el mínimo personal o familiar. Solo se descuentan los donativos, el impuesto pagado fuera por rendimientos del trabajo obtenidos en el extranjero (con el límite del ${f.cap} de la cuota de esos rendimientos) y las retenciones (RIRPF art. 114).`,
      `**Todos tus rendimientos del trabajo se consideran obtenidos en España** mientras dura el régimen, trabajes donde trabajes (art. 93.2.b). El resto de rentas solo tributa si se obtiene en España, como para los no residentes: no pagas IRPF, por ejemplo, por un alquiler o unos intereses del extranjero.`,
      `**La retención es del ${f.rate}** (${f.top} sobre lo que supere ${f.threshold} pagado por un mismo pagador), así que la nómina y el impuesto final sobre el sueldo coinciden.`,
      "**Una sola escala para toda España.** Las instrucciones del modelo 151 aplican la escala del art. 93 y reparten el resultado 50 % Estado, 50 % comunidad: la escala y las deducciones catalanas no se aplican.",
      `**Patrimonio solo por los bienes situados en España** («obligación real», art. 93.1) y **sin residencia a efectos de convenio**: el ${k.manual} de la AEAT dice que quienes se acogen «no tienen la consideración de residentes a efectos de la aplicación de un Convenio de Doble Imposición».`,
    ],
    numbersH: "Ley Beckham o IRPF general: los números en Cataluña",
    numbersCaption: "IRPF al año: escalas generales (Cataluña) frente al régimen especial; soltero, sin hijos, una empresa, contrato indefinido, antes de deducciones",
    numbersHead: ["Sueldo bruto", "IRPF general (Estado + Cataluña)", `Régimen especial (${f.rate})`, "Ahorras"],
    numbersNote: `General: escalas estatal y catalana de 2026 sobre la base (bruto menos Seguridad Social y 2.000 €), mínimo de 5.550 €; ver la ${k.incomeTax}. Especial: ${f.rate} del bruto (art. 93.2.e). La Seguridad Social es igual en los dos. Ahorro negativo: el régimen sale más caro.`,
    numbers: [
      `Para una persona sola en Cataluña, las escalas generales se llevan más del ${f.rate} del bruto a partir de **${f.crossover}** al año; por debajo, el régimen sale más caro, y por encima la diferencia crece deprisa. Los hijos, las deducciones, las rentas del cónyuge o las del extranjero mueven ese punto. Para ver tu nómina con los dos regímenes, usa nuestra ${a(f.calc, "calculadora de sueldo neto")} y elige «Régimen especial de trabajadores desplazados».`,
    ],
    howH: "Cómo se pide, paso a paso",
    stepsTitle: "Acogerse a la ley Beckham",
    steps: [
      { title: "Ten el NIE y el NIF", text: `Necesitas NIF (para los extranjeros, el NIE) y estar en el censo de obligados tributarios de la AEAT antes de presentar nada; si no lo estás, presenta antes la declaración censal (AEAT, ficha del modelo 149). Cómo conseguir el NIE: ${k.nieTie}.` },
      { title: "Date de alta en la Seguridad Social", text: `Te da de alta la empresa, y su fecha de inicio pone en marcha el plazo. Si aún no tienes número de la Seguridad Social, puedes pedirlo en ${k.nuss}. Si mantienes la Seguridad Social de tu país, cuenta la fecha de ese documento.` },
      { title: "Aporta la documentación", text: "En la sede de la AEAT, usa el trámite «Aportar documentación necesaria para optar por el régimen especial» (justificante del alta en la Seguridad Social o del mantenimiento de la de origen, y del motivo del traslado). Apunta el número de registro que te da." },
      { title: `Presenta el modelo 149 en ${f.months} meses`, text: `Por internet, con ese número de registro, en el plazo de ${f.months} meses desde la fecha de inicio que conste en el alta en la Seguridad Social (RIRPF art. 116.1.a). Mira la ${k.m149}.` },
      { title: "Entrega el documento de la AEAT a tu empresa", text: `La AEAT expide, si procede, en ${f.cert} días hábiles, un documento que acredita que has optado por el régimen (RIRPF art. 119.4). La empresa lo necesita para retenerte el ${f.rate}.` },
      { title: "Presenta el modelo 151 cada año", text: `En lugar de la declaración ordinaria presentas el modelo 151, en el mismo plazo que la Renta general (${k.m151}).` },
    ],
    deadlinesH: "Todos los plazos",
    deadlinesCaption: "Plazos del régimen especial (Reglamento del IRPF, arts. 115 a 119)",
    deadlinesHead: ["Qué", "Plazo", "Norma"],
    deadlinesRows: [
      ["Optar (tú)", `${f.months} meses desde la fecha de inicio de tu alta en la Seguridad Social`, "Art. 116.1.a"],
      ["Optar (cónyuge, hijos)", `${f.months} meses desde su entrada en España, o tu plazo si acaba más tarde`, "Art. 116.1.b"],
      ["Documento de la AEAT para la empresa", `En ${f.cert} días hábiles desde la presentación`, "Art. 119.4"],
      ["Duración", `El año en que adquieres la residencia y los ${f.following} siguientes`, "Art. 115"],
      ["Cuál es el primer año", `El primer año natural, tras el traslado, con más de ${f.days} días en España`, "Art. 115"],
      ["Renunciar", "En noviembre o diciembre, para el año siguiente", "Art. 117"],
      ["Comunicar la exclusión", "En un mes desde que dejas de cumplir un requisito", "Art. 118"],
      ["Declaración anual (modelo 151)", "El plazo general de la Renta", "Instrucciones del modelo 151"],
    ],
    familyH: "Tu cónyuge y tus hijos",
    family: [
      `Tu cónyuge y tus hijos menores de ${f.childrenUnder} años (de cualquier edad con discapacidad), o el otro progenitor si no estáis casados, también pueden acogerse (art. 93.3) si se desplazan contigo o después, antes de que acabe tu primer año del régimen; adquieren la residencia fiscal; cumplen los mismos requisitos de los ${f.prior} años y del establecimiento permanente; y la suma de sus bases liquidables es inferior a la tuya. Cada uno presenta su propio modelo 149, y el régimen les dura lo mismo que a ti.`,
    ],
    leaveH: "Renunciar al régimen o perderlo",
    leave: [
      `Puedes **renunciar** en noviembre o diciembre, con efectos desde el año siguiente, con el modelo 149; si eres trabajador, antes entregas a tu empresa la comunicación de datos del art. 88 del Reglamento, que te devuelve sellada, y la adjuntas (RIRPF art. 117). Si **dejas de cumplir un requisito** (por ejemplo, empiezas a obtener rentas mediante un establecimiento permanente), quedas excluido desde ese ejercicio y tienes que comunicarlo en un mes (art. 118). En los dos casos **ya no puedes volver a optar**.`,
    ],
    notH: "Lo que el régimen no cambia",
    not: [
      "**La Seguridad Social.** Si estás dado de alta en España, cotizas lo mismo que cualquier trabajador; el régimen solo afecta al IRPF.",
      `**Los trámites de extranjería.** El NIE, la TIE, los visados y el padrón siguen sus propias normas (mira la ${k.padro}).`,
      "**Navarra y el País Vasco.** Tienen su propio IRPF y sus propias normas para impatriados, que esta guía no cubre.",
      `**Las rentas españolas distintas del sueldo.** Siguen tributando: un alquiler en España va con el sueldo al ${f.rate} / ${f.top}, y los dividendos, intereses y ganancias españoles van a la escala del ahorro desde el ${f.savings} (art. 93.2.d y e).`,
    ],
    mistakesH: "Errores habituales",
    mistakes: [
      `**Dejar pasar el plazo de ${f.months} meses.** Cuenta desde la fecha de inicio del alta en la Seguridad Social, no desde que llegas ni desde la primera nómina, y no hay opción fuera de plazo.`,
      "**Pensar que se aplica solo.** Hay que presentar el modelo 149; hasta que la empresa tiene el documento de la AEAT, te retiene con las normas generales.",
      "**Contar con deducciones.** La Seguridad Social, los 2.000 € de gastos y los mínimos familiares no reducen la base; con un sueldo moderado o varios hijos, el régimen general puede salir más barato.",
      "**Aplicar una escala autonómica.** El tipo es el mismo en todas las comunidades; la escala y las deducciones catalanas no se aplican.",
      "**Renunciar a la ligera.** Si renuncias o quedas excluido, ya no puedes volver al régimen.",
      "**Invocar un convenio como residente en España.** Con el régimen no se te considera residente a efectos de los convenios de doble imposición.",
    ],
    warnTitle: "Cuándo pedir asesoramiento",
    warn: "Si puedes acogerte depende de tu caso: por qué y cómo te trasladas, dónde vivías antes, tus otras rentas y tu familia. Esta guía explica las normas generales; no es asesoramiento fiscal. Consúltalo con la AEAT o con un asesor fiscal antes de presentar el modelo 149, sobre todo si eres administrador, emprendedor, teletrabajas para una empresa extranjera o mantienes la Seguridad Social de tu país.",
    faqH: "Preguntas frecuentes",
    faq: [
      { question: "¿Qué es la ley Beckham?", answer: `El régimen especial del IRPF para quien pasa a ser residente fiscal en España porque se traslada aquí (art. 93 de la Ley del IRPF). Pagas el ${f.rate} de los rendimientos del trabajo hasta ${f.threshold} y el ${f.top} por encima, durante ${f.years} ejercicios.` },
      { question: "¿Quién puede acogerse a la ley Beckham?", answer: `Quien no ha sido residente en España en los ${f.prior} ejercicios anteriores y se traslada por un contrato de trabajo, un desplazamiento, teletrabajo, un cargo de administrador, una actividad emprendedora reconocida por ENISA o como profesional altamente cualificado de una empresa emergente. Los deportistas profesionales quedan fuera.` },
      { question: "¿Cómo se solicita la ley Beckham?", answer: `Aportas la documentación en la sede de la AEAT y presentas el modelo 149 con el número de registro que te dan, en ${f.months} meses desde la fecha de alta en la Seguridad Social. La AEAT expide un documento para tu empresa en ${f.cert} días hábiles.` },
      { question: "¿Cuál es el plazo para pedir la ley Beckham?", answer: `${f.months} meses desde la fecha de inicio que consta en tu alta en la Seguridad Social en España (o en el documento que mantiene la Seguridad Social de tu país).` },
      { question: "¿Cuántos años dura la ley Beckham?", answer: `El ejercicio en que adquieres la residencia y los ${f.following} siguientes: ${f.years} años en total, salvo que renuncies o dejes de cumplir un requisito.` },
      { question: "¿Pueden acogerse los teletrabajadores y nómadas digitales?", answer: "Sí, si trabajas por cuenta ajena a distancia, exclusivamente con medios informáticos y de telecomunicación; la ley cita expresamente el visado para teletrabajo de carácter internacional. El resto de requisitos (no haber sido residente los cinco años anteriores, sin establecimiento permanente) se mantienen." },
      { question: "¿Pueden acogerse los autónomos?", answer: `Solo por dos vías: una actividad emprendedora reconocida por la Ley 14/2013, o como profesional altamente cualificado de empresas emergentes o de I+D+i con más del ${f.share} de sus rendimientos por esa vía. El resto de trabajos por cuenta propia no da derecho al régimen.` },
      { question: "¿Compensa la ley Beckham?", answer: `Para una persona sola en Cataluña, las escalas generales se llevan más del ${f.rate} del bruto a partir de ${f.crossover}; por debajo, el régimen sale más caro. Los hijos, las deducciones y las rentas del extranjero cambian el resultado.` },
      { question: "¿Se pagan impuestos por las rentas del extranjero con la ley Beckham?", answer: "Todos los rendimientos del trabajo tributan en España trabajes donde trabajes, pero el resto de rentas extranjeras, como un alquiler o unos intereses fuera, no tributan en España con el régimen." },
    ],
    official: `${k.lirpf93}, ${k.rirpf} (arts. 113 a 119), ${k.trlirnr}, Ley 28/2022, Orden HFP/1338/2023, la ${k.regime} de la AEAT, la ${k.m149}, las ${k.m151} y el ${k.manual}, leídos el 21 de noviembre de 2026.`,
  };
}

function copyCa(f: Figures, k: Links): Copy {
  return {
    lead: `**La «llei Beckham» és el règim fiscal especial per a qui es trasllada a Espanya: en lloc de les escales generals de l'IRPF, pagues un ${f.rate} fix sobre els rendiments del treball fins a ${f.threshold} l'any (${f.top} per sobre), l'any en què passes a ser resident fiscal i els ${f.following} següents.** És optatiu i no s'aplica sol. T'hi pots acollir si no has estat resident a Espanya els ${f.prior} exercicis anteriors i et trasllades per un contracte de treball, un desplaçament de la teva empresa, teletreball, un càrrec d'administrador, una activitat emprenedora o com a professional altament qualificat d'una empresa emergent. Es demana amb el **model 149** en el termini de **${f.months} mesos** des de la data d'inici que consta a la teva alta a la Seguretat Social, i l'Agència Tributària et dona, en ${f.cert} dies hàbils, un document per a l'empresa, que a partir d'aleshores et reté el ${f.rate}. Cada any presentes el **model 151** en lloc de la declaració ordinària, en el termini general de la renda. A Catalunya, les escales generals s'enduen més del ${f.rate} del brut d'una persona sola a partir de ${f.crossover}: per sobre d'aquesta xifra, el règim surt a compte.`,
    factsTitle: "La llei Beckham en set respostes",
    facts: [
      { label: "Tipus", value: `${f.rate} dels rendiments del treball fins a ${f.threshold} l'any, ${f.top} per sobre (art. 93 de la Llei de l'IRPF)` },
      { label: "Durada", value: `L'any en què adquireixes la residència i els ${f.following} següents: ${f.years} exercicis` },
      { label: "Qui", value: `No haver estat resident a Espanya els ${f.prior} anys anteriors i traslladar-se per feina, un càrrec d'administrador, una empresa emergent o un projecte emprenedor` },
      { label: "Termini", value: `${f.months} mesos des de la data d'inici de la teva alta a la Seguretat Social` },
      { label: "Models", value: "El 149 per optar-hi, renunciar-hi o comunicar l'exclusió; el 151 per a la declaració anual" },
      { label: "Base", value: "El sou brut: no es resten la Seguretat Social, les despeses ni els mínims familiars" },
      { label: "Comunitat", value: "Una sola escala per a tot Espanya: l'escala catalana no s'aplica" },
    ],
    whatH: "Què és la llei Beckham",
    what: [
      `A la llei és el «règim especial aplicable als treballadors, professionals, emprenedors i inversors desplaçats a territori espanyol», ${k.lirpf93}, en la redacció de la llei d'empreses emergents (Llei 28/2022), vigent des de l'1 de gener de 2023. Continues sent contribuent de l'IRPF, però el teu impost es calcula amb les normes dels no residents: «${SPECIAL_QUOTES.art93}».`,
      `«Llei Beckham» és només el nom popular; la llei no el fa servir, i els esportistes professionals en queden exclosos expressament. El règim tracta de l'IRPF dels anys posteriors al trasllat: no canvia la teva situació d'estrangeria (continues necessitant el NIE, el visat o la TIE; vegeu la ${k.nieTie}) ni la teva Seguretat Social.`,
    ],
    whoH: "Qui s'hi pot acollir",
    whoCaption: "Requisits de l'art. 93.1 de la Llei de l'IRPF (cal complir-los tots)",
    whoHead: ["Requisit", "Què demana la llei", "On"],
    whoRows: [
      ["Sense residència recent", `No haver estat resident fiscal a Espanya en cap dels ${f.prior} exercicis anteriors al del desplaçament`, "Art. 93.1.a"],
      ["Motiu: contracte, desplaçament o teletreball", "Un contracte de treball amb un empleador a Espanya; un desplaçament ordenat per la teva empresa, amb carta de desplaçament; o teletreball fet exclusivament amb mitjans informàtics i de telecomunicació (per exemple, amb el visat per a teletreball de caràcter internacional)", "Art. 93.1.b.1r"],
      ["Motiu: administrador", "Adquirir la condició d'administrador d'una societat (amb límits si és una entitat patrimonial)", "Art. 93.1.b.2n"],
      ["Motiu: emprenedor", "Una activitat emprenedora reconeguda per la Llei 14/2013 (informe d'ENISA)", "Art. 93.1.b.3r"],
      ["Motiu: professional altament qualificat", `Treballar per a empreses emergents, o en formació, recerca, desenvolupament i innovació, si aquesta retribució supera el ${f.share} dels teus rendiments del treball i d'activitats`, "Art. 93.1.b.4t"],
      ["Sense establiment permanent", "No obtenir rendes mitjançant un establiment permanent a Espanya, llevat d'emprenedors i professionals altament qualificats", "Art. 93.1.c"],
      ["Passar a ser resident", `El trasllat t'ha de fer resident fiscal a Espanya (més de ${f.days} dies en un any natural, art. 9)`, "Art. 93.1; RIRPF art. 115"],
    ],
    whoAfter: [
      "El trasllat es pot produir el primer any del règim o l'anterior. En queden fora els esportistes professionals del Reial decret 1006/1985. Una feina per compte propi que no encaixi en cap de les vies anteriors no dona dret al règim.",
    ],
    payH: "Què es paga amb el règim especial",
    pay: [
      `**El ${f.rate} fins a ${f.threshold} i el ${f.top} per sobre** sobre la base general de l'any (art. 93.2.e). Les rendes de l'estalvi (dividends, interessos, guanys) tenen una escala pròpia, que comença en el ${f.savings}.`,
      `**La base és el sou brut.** La llei de no residents grava l'«importe íntegro» (${k.trlirnr}): no es resten la Seguretat Social, ni els 2.000 € de despeses, ni el mínim personal o familiar. Només es descompten els donatius, l'impost pagat fora per rendiments del treball obtinguts a l'estranger (amb el límit del ${f.cap} de la quota d'aquests rendiments) i les retencions (RIRPF art. 114).`,
      `**Tots els teus rendiments del treball es consideren obtinguts a Espanya** mentre dura el règim, treballis on treballis (art. 93.2.b). La resta de rendes només tributa si s'obté a Espanya, com per als no residents: no pagues IRPF, per exemple, per un lloguer o uns interessos de l'estranger.`,
      `**La retenció és del ${f.rate}** (${f.top} sobre el que superi ${f.threshold} pagat per un mateix pagador), de manera que la nòmina i l'impost final sobre el sou coincideixen.`,
      "**Una sola escala per a tot Espanya.** Les instruccions del model 151 apliquen l'escala de l'art. 93 i reparteixen el resultat 50 % Estat, 50 % comunitat: l'escala i les deduccions catalanes no s'apliquen.",
      `**Patrimoni només pels béns situats a Espanya** («obligación real», art. 93.1) i **sense residència a efectes de conveni**: el ${k.manual} de l'AEAT diu que qui s'hi acull «no tienen la consideración de residentes a efectos de la aplicación de un Convenio de Doble Imposición».`,
    ],
    numbersH: "Llei Beckham o IRPF general: els números a Catalunya",
    numbersCaption: "IRPF l'any: escales generals (Catalunya) davant del règim especial; solter, sense fills, una empresa, contracte indefinit, abans de deduccions",
    numbersHead: ["Sou brut", "IRPF general (Estat + Catalunya)", `Règim especial (${f.rate})`, "Estalvies"],
    numbersNote: `General: escales estatal i catalana del 2026 sobre la base (brut menys Seguretat Social i 2.000 €), mínim de 5.550 €; vegeu la ${k.incomeTax}. Especial: ${f.rate} del brut (art. 93.2.e). La Seguretat Social és igual en tots dos. Estalvi negatiu: el règim surt més car.`,
    numbers: [
      `Per a una persona sola a Catalunya, les escales generals s'enduen més del ${f.rate} del brut a partir de **${f.crossover}** l'any; per sota, el règim surt més car, i per sobre la diferència creix de pressa. Els fills, les deduccions, les rendes del cònjuge o les de l'estranger mouen aquest punt. Per veure la teva nòmina amb els dos règims, fes servir la nostra ${a(f.calc, "calculadora de sou net")} i tria «Règim especial de treballadors desplaçats».`,
    ],
    howH: "Com es demana, pas a pas",
    stepsTitle: "Acollir-se a la llei Beckham",
    steps: [
      { title: "Tingues el NIE i el NIF", text: `Necessites NIF (per als estrangers, el NIE) i ser al cens d'obligats tributaris de l'AEAT abans de presentar res; si no hi ets, presenta abans la declaració censal (AEAT, fitxa del model 149). Com aconseguir el NIE: ${k.nieTie}.` },
      { title: "Dona't d'alta a la Seguretat Social", text: `Et dona d'alta l'empresa, i la seva data d'inici posa en marxa el termini. Si encara no tens número de la Seguretat Social, el pots demanar a ${k.nuss}. Si mantens la Seguretat Social del teu país, compta la data d'aquell document.` },
      { title: "Aporta la documentació", text: "A la seu de l'AEAT, fes servir el tràmit «Aportar documentación necesaria para optar por el régimen especial» (justificant de l'alta a la Seguretat Social o del manteniment de la d'origen, i del motiu del trasllat). Apunta't el número de registre que et dona." },
      { title: `Presenta el model 149 en ${f.months} mesos`, text: `Per internet, amb aquest número de registre, en el termini de ${f.months} mesos des de la data d'inici que consti a l'alta a la Seguretat Social (RIRPF art. 116.1.a). Vegeu la ${k.m149}.` },
      { title: "Lliura el document de l'AEAT a l'empresa", text: `L'AEAT expedeix, si escau, en ${f.cert} dies hàbils, un document que acredita que has optat pel règim (RIRPF art. 119.4). L'empresa el necessita per retenir-te el ${f.rate}.` },
      { title: "Presenta el model 151 cada any", text: `En lloc de la declaració ordinària presentes el model 151, en el mateix termini que la renda general (${k.m151}).` },
    ],
    deadlinesH: "Tots els terminis",
    deadlinesCaption: "Terminis del règim especial (Reglament de l'IRPF, arts. 115 a 119)",
    deadlinesHead: ["Què", "Termini", "Norma"],
    deadlinesRows: [
      ["Optar-hi (tu)", `${f.months} mesos des de la data d'inici de la teva alta a la Seguretat Social`, "Art. 116.1.a"],
      ["Optar-hi (cònjuge, fills)", `${f.months} mesos des de la seva entrada a Espanya, o el teu termini si acaba més tard`, "Art. 116.1.b"],
      ["Document de l'AEAT per a l'empresa", `En ${f.cert} dies hàbils des de la presentació`, "Art. 119.4"],
      ["Durada", `L'any en què adquireixes la residència i els ${f.following} següents`, "Art. 115"],
      ["Quin és el primer any", `El primer any natural, després del trasllat, amb més de ${f.days} dies a Espanya`, "Art. 115"],
      ["Renunciar-hi", "Al novembre o al desembre, per a l'any següent", "Art. 117"],
      ["Comunicar l'exclusió", "En un mes des que deixes de complir un requisit", "Art. 118"],
      ["Declaració anual (model 151)", "El termini general de la renda", "Instruccions del model 151"],
    ],
    familyH: "El teu cònjuge i els teus fills",
    family: [
      `El teu cònjuge i els teus fills menors de ${f.childrenUnder} anys (de qualsevol edat amb discapacitat), o l'altre progenitor si no esteu casats, també s'hi poden acollir (art. 93.3) si es desplacen amb tu o després, abans que acabi el teu primer any del règim; adquireixen la residència fiscal; compleixen els mateixos requisits dels ${f.prior} anys i de l'establiment permanent; i la suma de les seves bases liquidables és inferior a la teva. Cadascú presenta el seu propi model 149, i el règim els dura el mateix que a tu.`,
    ],
    leaveH: "Renunciar al règim o perdre'l",
    leave: [
      `Hi pots **renunciar** al novembre o al desembre, amb efectes des de l'any següent, amb el model 149; si ets treballador, abans lliures a l'empresa la comunicació de dades de l'art. 88 del Reglament, que te la torna segellada, i l'adjuntes (RIRPF art. 117). Si **deixes de complir un requisit** (per exemple, comences a obtenir rendes mitjançant un establiment permanent), en quedes exclòs des d'aquell exercici i ho has de comunicar en un mes (art. 118). En tots dos casos **ja no hi pots tornar a optar**.`,
    ],
    notH: "El que el règim no canvia",
    not: [
      "**La Seguretat Social.** Si estàs donat d'alta a Espanya, cotitzes el mateix que qualsevol treballador; el règim només afecta l'IRPF.",
      `**Els tràmits d'estrangeria.** El NIE, la TIE, els visats i el padró segueixen les seves pròpies normes (vegeu la ${k.padro}).`,
      "**Navarra i el País Basc.** Tenen un IRPF propi i normes pròpies per als impatriats, que aquesta guia no cobreix.",
      `**Les rendes espanyoles diferents del sou.** Continuen tributant: un lloguer a Espanya va amb el sou al ${f.rate} / ${f.top}, i els dividends, interessos i guanys espanyols van a l'escala de l'estalvi des del ${f.savings} (art. 93.2.d i e).`,
    ],
    mistakesH: "Errors habituals",
    mistakes: [
      `**Deixar passar el termini de ${f.months} mesos.** Compta des de la data d'inici de l'alta a la Seguretat Social, no des que arribes ni des de la primera nòmina, i no hi ha opció fora de termini.`,
      "**Pensar que s'aplica sol.** Cal presentar el model 149; fins que l'empresa té el document de l'AEAT, et reté amb les normes generals.",
      "**Comptar amb deduccions.** La Seguretat Social, els 2.000 € de despeses i els mínims familiars no redueixen la base; amb un sou moderat o diversos fills, el règim general pot sortir més barat.",
      "**Aplicar una escala autonòmica.** El tipus és el mateix a totes les comunitats; l'escala i les deduccions catalanes no s'apliquen.",
      "**Renunciar-hi a la lleugera.** Si hi renuncies o en quedes exclòs, ja no hi pots tornar.",
      "**Invocar un conveni com a resident a Espanya.** Amb el règim no se't considera resident a efectes dels convenis de doble imposició.",
    ],
    warnTitle: "Quan cal demanar assessorament",
    warn: "Si t'hi pots acollir depèn del teu cas: per què i com et trasllades, on vivies abans, les teves altres rendes i la teva família. Aquesta guia explica les normes generals; no és assessorament fiscal. Consulta-ho amb l'AEAT o amb un assessor fiscal abans de presentar el model 149, sobretot si ets administrador, emprenedor, teletreballes per a una empresa estrangera o mantens la Seguretat Social del teu país.",
    faqH: "Preguntes freqüents",
    faq: [
      { question: "Què és la llei Beckham?", answer: `El règim especial de l'IRPF per a qui passa a ser resident fiscal a Espanya perquè s'hi trasllada (art. 93 de la Llei de l'IRPF). Pagues el ${f.rate} dels rendiments del treball fins a ${f.threshold} i el ${f.top} per sobre, durant ${f.years} exercicis.` },
      { question: "Qui s'hi pot acollir?", answer: `Qui no ha estat resident a Espanya els ${f.prior} exercicis anteriors i s'hi trasllada per un contracte de treball, un desplaçament, teletreball, un càrrec d'administrador, una activitat emprenedora reconeguda per ENISA o com a professional altament qualificat d'una empresa emergent. Els esportistes professionals en queden fora.` },
      { question: "Com es demana la llei Beckham?", answer: `Aportes la documentació a la seu de l'AEAT i presentes el model 149 amb el número de registre que et donen, en ${f.months} mesos des de la data d'alta a la Seguretat Social. L'AEAT expedeix un document per a l'empresa en ${f.cert} dies hàbils.` },
      { question: "Quin és el termini per demanar-la?", answer: `${f.months} mesos des de la data d'inici que consta a la teva alta a la Seguretat Social a Espanya (o al document que manté la Seguretat Social del teu país).` },
      { question: "Quants anys dura la llei Beckham?", answer: `L'exercici en què adquireixes la residència i els ${f.following} següents: ${f.years} anys en total, llevat que hi renunciïs o deixis de complir un requisit.` },
      { question: "S'hi poden acollir els teletreballadors i els nòmades digitals?", answer: "Sí, si treballes per compte d'altri a distància, exclusivament amb mitjans informàtics i de telecomunicació; la llei esmenta expressament el visat per a teletreball de caràcter internacional. La resta de requisits (no haver estat resident els cinc anys anteriors, sense establiment permanent) es mantenen." },
      { question: "S'hi poden acollir els autònoms?", answer: `Només per dues vies: una activitat emprenedora reconeguda per la Llei 14/2013, o com a professional altament qualificat d'empreses emergents o de R+D+I amb més del ${f.share} dels seus rendiments per aquesta via. La resta de feines per compte propi no hi donen dret.` },
      { question: "Compensa la llei Beckham?", answer: `Per a una persona sola a Catalunya, les escales generals s'enduen més del ${f.rate} del brut a partir de ${f.crossover}; per sota, el règim surt més car. Els fills, les deduccions i les rendes de l'estranger canvien el resultat.` },
      { question: "Es paguen impostos per les rendes de l'estranger amb la llei Beckham?", answer: "Tots els rendiments del treball tributen a Espanya treballis on treballis, però la resta de rendes estrangeres, com un lloguer o uns interessos fora, no tributen a Espanya amb el règim." },
    ],
    official: `${k.lirpf93}, ${k.rirpf} (arts. 113 a 119), ${k.trlirnr}, Llei 28/2022, Ordre HFP/1338/2023, la ${k.regime} de l'AEAT, la ${k.m149}, les ${k.m151} i el ${k.manual}, llegits el 21 de novembre de 2026.`,
  };
}

const COPY: Record<Locale, (f: Figures, k: Links) => Copy> = { en: copyEn, es: copyEs, ca: copyCa };

function links(L: Locale): Links {
  const U = BECKHAM_URLS;
  const w = (v: Record<Locale, string>) => v[L];
  return {
    lirpf93: a(U.lirpf93, w({ ca: "article 93 de la Llei de l'IRPF", es: "artículo 93 de la Ley del IRPF", en: "article 93 of the IRPF Law" })),
    rirpf: a(U.rirpf, w({ ca: "Reglament de l'IRPF", es: "Reglamento del IRPF", en: "IRPF Regulation" })),
    trlirnr: a(U.trlirnr, w({ ca: "llei dels no residents, art. 24", es: "ley de no residentes, art. 24", en: "non-residents' law, art. 24" })),
    regime: a(U.aeatRegime, w({ ca: "pàgina del règim especial", es: "página del régimen especial", en: "special regime page" })),
    m149: a(U.aeat149, w({ ca: "fitxa del model 149", es: "ficha del modelo 149", en: "form 149 page" })),
    m151: a(U.aeat151, w({ ca: "instruccions del model 151", es: "instrucciones del modelo 151", en: "form 151 instructions" })),
    manual: a(U.aeatManual, w({ ca: "manual de tributació de no residents", es: "manual de tributación de no residentes", en: "non-residents' tax manual" })),
    nuss: a(U.nuss, w({ ca: "Import@ss", es: "Import@ss", en: "Import@ss" })),
    calc: calcPath("net-salary", L),
    nieTie: b2link("nieTie", L, w({ ca: "guia del NIE i la TIE", es: "guía del NIE y la TIE", en: "NIE and TIE guide" })),
    incomeTax: b2link("incomeTax", L, w({ ca: "guia dels trams de l'IRPF", es: "guía de los tramos del IRPF", en: "income tax brackets guide" })),
    padro: b2link("padro", L, w({ ca: "guia del padró", es: "guía del padrón", en: "padró guide" })),
  };
}

/** One body for the three editions: the same sections, tables and links in each. */
export function buildBeckhamBody(locale: Locale): Block[] {
  const f = figures(locale);
  const k = links(locale);
  const t = COPY[locale](f, k);
  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    ...h2(t.whatH, ...t.what),
    ...h2(t.whoH),
    table(t.whoCaption, t.whoHead, t.whoRows),
    ...paras(...t.whoAfter),
    ...h2(t.payH),
    list(...t.pay),
    ...h2(t.numbersH),
    table(t.numbersCaption, t.numbersHead, f.rows, t.numbersNote),
    ...paras(...t.numbers),
    { type: "heading", level: 2, text: t.howH } as Block,
    steps(t.stepsTitle, t.steps),
    ...h2(t.deadlinesH),
    table(t.deadlinesCaption, t.deadlinesHead, t.deadlinesRows),
    ...h2(t.familyH, ...t.family),
    ...h2(t.leaveH, ...t.leave),
    ...h2(t.notH),
    list(...t.not),
    ...h2(t.mistakesH),
    list(...t.mistakes),
    callout("warning", t.warnTitle, t.warn),
    { type: "heading", level: 2, text: t.faqH } as Block,
    faq(t.faq),
    callout("official", verifiedLine(locale, BECKHAM_AS_OF), t.official),
    ...b2Related(["incomeTax", "nieTie", "padro", "tsi"], locale, [netSalaryRelatedItem(locale)]),
  ];
}

export const BECKHAM_GUIDE: B2Article = {
  key: "beckhamLaw",
  entryKey: "guide-beckham-law-spain",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "beckham-torre-glories-22at-barcelona",
  heroAlt: {
    ca: "La Torre Glòries i els edificis d'oficines del districte 22@ de Barcelona",
    es: "La Torre Glòries y los edificios de oficinas del distrito 22@ de Barcelona",
    en: "Torre Glòries and the office blocks of Barcelona's 22@ district",
  },
  heroCaption: {
    ca: "La Torre Glòries i el districte d'oficines 22@, a Barcelona.",
    es: "La Torre Glòries y el distrito de oficinas 22@, en Barcelona.",
    en: "Torre Glòries and the 22@ office district in Barcelona.",
  },
  verifiedAt: BECKHAM_AS_OF,
  publishedAt: "2026-11-21T20:30:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.beckhamLaw[locale], ...BECKHAM_META[locale], blocks: buildBeckhamBody(locale) }]),
  ) as B2Article["editions"],
};
