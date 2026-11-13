import type { Locale } from "@/lib/i18n/config";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { money, parseAmount, percent } from "@/lib/programmatic/net-salary/copy";

import { ANSWERS, SITUATIONS, type Answer, type Reason, type Situation, type SubsidyInput, type SubsidyKind, type SubsidyResult } from "./engine";
import { INCOME_LIMIT, OVER52_AGE, YOUNG_AGE } from "./rules";

/**
 * Paths and words of the unemployment subsidy checker, small enough for the
 * browser (the client component imports this file, the engine and the rules).
 *
 *   /es/calculadoras/subsidio-desempleo/
 *   /ca/calculadores/subsidi-atur/
 *   /en/calculators/spain-unemployment-subsidy/
 */

export type SubLocale = Locale;
export const SUB_LOCALES: readonly SubLocale[] = ["es", "ca", "en"];

export { money, parseAmount, percent };

export function subsidyPath(locale: SubLocale): string {
  return calcPath("unemployment-subsidy", locale);
}

export function subsidyEditions(): Record<SubLocale, string> {
  return { ca: subsidyPath("ca"), es: subsidyPath("es"), en: subsidyPath("en") };
}

/* -------------------------------------------------------------------------- */
/* Shareable state in the URL hash                                            */
/* -------------------------------------------------------------------------- */

const S_CODE: Record<Situation, string> = { exhausted: "a", insufficient: "c", emigrant: "e", victim: "v", other: "o" };
const A_CODE: Record<Answer, string> = { yes: "s", no: "n", unknown: "x" };

/** "#s=a&e=47&d=360&m=2&r=0&h=1200" plus the answers that differ from "unknown". */
export function writeHash(s: SubsidyInput): string {
  const p = new URLSearchParams();
  p.set("s", S_CODE[s.situation]);
  p.set("e", String(s.age));
  if (s.situation === "exhausted") p.set("d", String(s.exhaustedDays));
  if (s.situation === "insufficient") p.set("c", String(s.contributedDays));
  p.set("m", String(s.familyMembers));
  p.set("r", String(s.ownIncome));
  if (s.familyMembers > 0) p.set("h", String(s.householdIncome));
  if (s.retirementRecord !== "unknown") p.set("j", A_CODE[s.retirementRecord]);
  if (s.unemploymentYears !== "unknown") p.set("u", A_CODE[s.unemploymentYears]);
  if (s.situation === "emigrant" && s.workedAbroad !== "unknown") p.set("w", A_CODE[s.workedAbroad]);
  if (s.situation === "victim" && s.priorRai > 0) p.set("i", String(s.priorRai));
  return `#${p.toString()}`;
}

export function readHash(hash: string, base: SubsidyInput): SubsidyInput {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const out: SubsidyInput = { ...base };
  const num = (k: string) => (p.has(k) ? Number(p.get(k)) : NaN);
  const answer = (k: string) => ANSWERS.find((a) => A_CODE[a] === p.get(k));
  const s = SITUATIONS.find((x) => S_CODE[x] === p.get("s"));
  if (s) out.situation = s;
  const e = num("e");
  if (Number.isInteger(e) && e >= 16 && e <= 70) out.age = e;
  const d = num("d");
  if (Number.isInteger(d) && d >= 0 && d <= 720) out.exhaustedDays = d;
  const c = num("c");
  if (Number.isInteger(c) && c >= 0 && c <= 2190) out.contributedDays = c;
  const m = num("m");
  if (Number.isInteger(m) && m >= 0 && m <= 20) out.familyMembers = m;
  const r = num("r");
  if (Number.isFinite(r) && r >= 0 && r <= 1_000_000) out.ownIncome = r;
  const h = num("h");
  if (Number.isFinite(h) && h >= 0 && h <= 1_000_000) out.householdIncome = h;
  out.retirementRecord = answer("j") ?? "unknown";
  out.unemploymentYears = answer("u") ?? "unknown";
  out.workedAbroad = answer("w") ?? "unknown";
  const i = num("i");
  out.priorRai = i === 1 || i === 2 || i === 3 ? i : 0;
  return out;
}

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

const LIMIT = (l: SubLocale) => money(INCOME_LIMIT, l);

export interface CalculatorCopy {
  title: string;
  intro: string;
  noscript: string;
  situation: string;
  situationOptions: Record<Situation, string>;
  age: string;
  ageHint: string;
  exhausted: string;
  exhaustedOption: (days: number) => string;
  contributed: string;
  contributedHint: string;
  members: string;
  membersHint: string;
  ownIncome: string;
  ownIncomeHint: string;
  household: string;
  householdHint: string;
  over52Legend: string;
  retirementRecord: string;
  unemploymentYears: string;
  answerOptions: Record<Answer, string>;
  workedAbroad: string;
  priorRai: string;
  priorRaiOptions: [string, string, string, string];
  result: string;
  verdict: (r: SubsidyResult) => string;
  kindName: Record<SubsidyKind, string>;
  duration: (r: SubsidyResult) => string;
  first: string;
  total: string;
  cols: { months: string; pct: string; monthly: string; total: string };
  monthsLabel: (from: number, to: number | null) => string;
  incomeLine: (r: SubsidyResult) => string;
  familyLine: (r: SubsidyResult, members: number) => string;
  reason: Record<Reason, string>;
  basis: Record<SubsidyKind, string>;
  retirement: string;
  periods: string;
  share: string;
  disclaimer: string;
}

export const CALC_COPY: Record<SubLocale, CalculatorCopy> = {
  es: {
    title: "Comprueba si te corresponde el subsidio",
    intro: "Contesta con lo que tenías el día en que agotaste el paro o te quedaste sin trabajo, y con los ingresos brutos del mes natural anterior a la solicitud.",
    noscript: "Sin JavaScript ves el ejemplo de abajo (47 años, paro de 360 días agotado, pareja y un hijo, 1.200 € de ingresos en casa). Activa JavaScript para comprobar tu caso.",
    situation: "Tu situación",
    situationOptions: {
      exhausted: "He agotado la prestación contributiva (el paro)",
      insufficient: "Me he quedado sin trabajo con menos de 360 días cotizados",
      emigrant: "Soy emigrante retornado (vuelvo de fuera del Espacio Económico Europeo)",
      victim: "Soy víctima de violencia de género o sexual",
      other: "Otra (salida de prisión, baja voluntaria, autónomo…)",
    },
    age: "Edad",
    ageHint: "La que tenías el día en que agotaste el paro o perdiste el empleo.",
    exhausted: "Duración del paro que has agotado",
    exhaustedOption: (d) => `${d} días (${d / 30} meses)`,
    contributed: "Días cotizados en los últimos 6 años",
    contributedHint: "Están en tu vida laboral. Con 360 o más días tienes paro contributivo.",
    members: "Personas de tu unidad familiar, sin contarte",
    membersHint: "Cónyuge o pareja de hecho registrada, hijos menores de 26 años o con discapacidad, menores acogidos. 0 si vives solo.",
    ownIncome: "Tus ingresos brutos del mes anterior",
    ownIncomeHint: `De cualquier tipo: salario, alquileres, intereses, pensiones… El límite es ${LIMIT("es")} al mes. La indemnización legal por despido no cuenta.`,
    household: "Ingresos brutos de toda la unidad familiar el mes anterior (tú incluido)",
    householdHint: `Se dividen entre todos los miembros: si salen ${LIMIT("es")} o menos por persona tienes responsabilidades familiares.`,
    over52Legend: "Si tienes 52 años o más",
    retirementRecord: "¿Tienes al menos 15 años cotizados, 2 de ellos en los últimos 15?",
    unemploymentYears: "¿Has cotizado por desempleo al menos 6 años en tu vida laboral?",
    answerOptions: { yes: "Sí", no: "No", unknown: "No lo sé" },
    workedAbroad: "¿Has trabajado al menos 12 meses en los últimos 6 años en ese país, sin cobrar allí prestación por desempleo?",
    priorRai: "Derechos anteriores a la Renta Activa de Inserción",
    priorRaiOptions: ["Ninguno", "Uno", "Dos", "Tres o más"],
    result: "Resultado",
    verdict: (r) =>
      r.status === "eligible"
        ? "Te corresponde el subsidio"
        : r.status === "contributory"
          ? "Te corresponde el paro contributivo, no el subsidio"
          : r.status === "check-sepe"
            ? "Consulta en el SEPE"
            : "Con estos datos no te corresponde",
    kindName: {
      exhausted: "Subsidio por agotamiento de la prestación",
      insufficient: "Subsidio por cotización insuficiente",
      over52: "Subsidio para mayores de 52 años",
      emigrant: "Subsidio de emigrante retornado",
      victim: "Subsidio para víctimas de violencia de género o sexual",
    },
    duration: (r) => (r.kind === "over52" ? "Hasta la edad ordinaria de jubilación" : `${r.months} meses como máximo, en periodos de 3 meses`),
    first: "Primer mes",
    total: "Total en toda la duración",
    cols: { months: "Meses", pct: "% del IPREM", monthly: "Al mes", total: "En el tramo" },
    monthsLabel: (f, t) => (t === null ? `Desde el mes ${f}` : f === t ? `Mes ${f}` : `Meses ${f} a ${t}`),
    incomeLine: (r) => `Tus ingresos ${r.ownIncomeOk ? "no superan" : "superan"} el límite de ${LIMIT("es")} al mes (75 % del SMI).`,
    familyLine: (r, m) =>
      m === 0
        ? "Sin unidad familiar no hay responsabilidades familiares."
        : `Ingresos por persona en tu unidad familiar: ${money(r.perHead, "es")}: ${r.familyOk ? "tienes" : "no tienes"} responsabilidades familiares.`,
    reason: {
      income: `Tus ingresos superan ${LIMIT("es")} al mes y, si tienes familia, los ingresos por persona también. Si bajan, puedes pedirlo dentro de los 6 meses siguientes.`,
      "young-short": `Con menos de ${YOUNG_AGE} años y sin responsabilidades familiares hace falta haber agotado un paro de 360 días o más. Si llegas a tenerlas dentro de los 6 meses siguientes al agotamiento, puedes pedirlo: consulta en el SEPE.`,
      "few-days": "Con menos de 90 días cotizados no hay subsidio por cotización insuficiente.",
      contributory: "Con 360 días cotizados o más tienes derecho al paro contributivo: calcula cuánto te toca.",
      "abroad-no": "Sin 12 meses trabajados en el extranjero en los últimos 6 años (o si cobraste allí el paro) no se accede a este subsidio.",
      "abroad-unknown": "Depende de dónde y cuánto trabajaste fuera y del certificado de emigrante retornado: consulta en el SEPE.",
      "emigrant-family": "Tus ingresos superan el límite pero tu unidad familiar no: la ley pide carecer de rentas; consulta en el SEPE si te lo reconocen.",
      "rai-three": "Con tres derechos anteriores a la Renta Activa de Inserción solo se accede si han pasado 3 años desde el primero: consulta en el SEPE.",
      "other-situation": "Esta calculadora no puede valorar tu caso. La reforma de 2024 quitó los subsidios especiales de salida de prisión; consulta en el SEPE (o mira el Ingreso Mínimo Vital, más abajo).",
      "over52-unknown": `Si cumples los dos requisitos de los mayores de ${OVER52_AGE} años, cobrarías el subsidio para mayores de 52 (480 € al mes hasta la jubilación, con cotización): consulta tu vida laboral o en el SEPE.`,
      "over52-record-no": `Sin esos requisitos no hay subsidio para mayores de ${OVER52_AGE} años; se calcula el subsidio general.`,
      "over52-income": `Para el subsidio de mayores de ${OVER52_AGE} años cuentan solo tus ingresos, y superan el límite; se calcula el subsidio general (que admite responsabilidades familiares).`,
    },
    basis: {
      exhausted: "Base legal: arts. 274.1.a, 275, 277.1 y 278 de la Ley General de la Seguridad Social.",
      insufficient: "Base legal: arts. 274.1.b, 275, 277.2 y 278 de la Ley General de la Seguridad Social.",
      over52: "Base legal: art. 280 de la Ley General de la Seguridad Social (cuantía, 280.4; cotización por jubilación, 280.9).",
      emigrant: "Base legal: disposición adicional 57ª y art. 278 de la Ley General de la Seguridad Social.",
      victim: "Base legal: disposición adicional 58ª y art. 278 de la Ley General de la Seguridad Social.",
    },
    retirement: "El SEPE cotiza por tu jubilación mientras lo cobras. Cada 12 meses tienes que presentar la declaración anual de rentas.",
    periods: "Se concede por 3 meses y hay que pedir la prórroga en los 15 días hábiles siguientes a cada trimestre, acreditando que sigues cumpliendo los requisitos.",
    share: "El enlace de esta página guarda los datos que has puesto: puedes copiarlo para compartir el cálculo.",
    disclaimer: "Comprobación orientativa con la ley publicada en el BOE; quien reconoce el subsidio es el SEPE. No incluye el subsidio agrario, la renta agraria, los fijos discontinuos ni los subsidios nacidos antes del 1 de noviembre de 2024.",
  },
  ca: {
    title: "Comprova si et correspon el subsidi",
    intro: "Respon amb el que tenies el dia que vas esgotar l'atur o et vas quedar sense feina, i amb els ingressos bruts del mes natural anterior a la sol·licitud.",
    noscript: "Sense JavaScript veus l'exemple de sota (47 anys, atur de 360 dies esgotat, parella i un fill, 1.200 € d'ingressos a casa). Activa JavaScript per comprovar el teu cas.",
    situation: "La teva situació",
    situationOptions: {
      exhausted: "He esgotat la prestació contributiva (l'atur)",
      insufficient: "M'he quedat sense feina amb menys de 360 dies cotitzats",
      emigrant: "Soc emigrant retornat (torno de fora de l'Espai Econòmic Europeu)",
      victim: "Soc víctima de violència de gènere o sexual",
      other: "Una altra (sortida de presó, baixa voluntària, autònom…)",
    },
    age: "Edat",
    ageHint: "La que tenies el dia que vas esgotar l'atur o vas perdre la feina.",
    exhausted: "Durada de l'atur que has esgotat",
    exhaustedOption: (d) => `${d} dies (${d / 30} mesos)`,
    contributed: "Dies cotitzats en els últims 6 anys",
    contributedHint: "Són a la teva vida laboral. Amb 360 dies o més tens atur contributiu.",
    members: "Persones de la teva unitat familiar, sense comptar-te",
    membersHint: "Cònjuge o parella de fet registrada, fills menors de 26 anys o amb discapacitat, menors acollits. 0 si vius sol.",
    ownIncome: "Els teus ingressos bruts del mes anterior",
    ownIncomeHint: `De qualsevol tipus: sou, lloguers, interessos, pensions… El límit és ${LIMIT("ca")} al mes. La indemnització legal per acomiadament no compta.`,
    household: "Ingressos bruts de tota la unitat familiar el mes anterior (tu inclòs)",
    householdHint: `Es divideixen entre tots els membres: si surten ${LIMIT("ca")} o menys per persona tens responsabilitats familiars.`,
    over52Legend: "Si tens 52 anys o més",
    retirementRecord: "Tens com a mínim 15 anys cotitzats, 2 dels quals en els últims 15?",
    unemploymentYears: "Has cotitzat per desocupació com a mínim 6 anys en la teva vida laboral?",
    answerOptions: { yes: "Sí", no: "No", unknown: "No ho sé" },
    workedAbroad: "Has treballat com a mínim 12 mesos en els últims 6 anys en aquell país, sense cobrar-hi prestació per desocupació?",
    priorRai: "Drets anteriors a la Renda Activa d'Inserció",
    priorRaiOptions: ["Cap", "Un", "Dos", "Tres o més"],
    result: "Resultat",
    verdict: (r) =>
      r.status === "eligible"
        ? "Et correspon el subsidi"
        : r.status === "contributory"
          ? "Et correspon l'atur contributiu, no el subsidi"
          : r.status === "check-sepe"
            ? "Consulta-ho al SEPE"
            : "Amb aquestes dades no et correspon",
    kindName: {
      exhausted: "Subsidi per esgotament de la prestació",
      insufficient: "Subsidi per cotització insuficient",
      over52: "Subsidi per a més grans de 52 anys",
      emigrant: "Subsidi d'emigrant retornat",
      victim: "Subsidi per a víctimes de violència de gènere o sexual",
    },
    duration: (r) => (r.kind === "over52" ? "Fins a l'edat ordinària de jubilació" : `${r.months} mesos com a màxim, en períodes de 3 mesos`),
    first: "Primer mes",
    total: "Total en tota la durada",
    cols: { months: "Mesos", pct: "% de l'IPREM", monthly: "Al mes", total: "En el tram" },
    monthsLabel: (f, t) => (t === null ? `Des del mes ${f}` : f === t ? `Mes ${f}` : `Mesos ${f} a ${t}`),
    incomeLine: (r) => `Els teus ingressos ${r.ownIncomeOk ? "no superen" : "superen"} el límit de ${LIMIT("ca")} al mes (75 % de l'SMI).`,
    familyLine: (r, m) =>
      m === 0
        ? "Sense unitat familiar no hi ha responsabilitats familiars."
        : `Ingressos per persona a la teva unitat familiar: ${money(r.perHead, "ca")}: ${r.familyOk ? "tens" : "no tens"} responsabilitats familiars.`,
    reason: {
      income: `Els teus ingressos superen ${LIMIT("ca")} al mes i, si tens família, els ingressos per persona també. Si baixen, el pots demanar dins dels 6 mesos següents.`,
      "young-short": `Amb menys de ${YOUNG_AGE} anys i sense responsabilitats familiars cal haver esgotat un atur de 360 dies o més. Si les arribes a tenir dins dels 6 mesos següents a l'esgotament, el pots demanar: consulta-ho al SEPE.`,
      "few-days": "Amb menys de 90 dies cotitzats no hi ha subsidi per cotització insuficient.",
      contributory: "Amb 360 dies cotitzats o més tens dret a l'atur contributiu: calcula quant et toca.",
      "abroad-no": "Sense 12 mesos treballats a l'estranger en els últims 6 anys (o si hi vas cobrar l'atur) no s'accedeix a aquest subsidi.",
      "abroad-unknown": "Depèn d'on i quant vas treballar fora i del certificat d'emigrant retornat: consulta-ho al SEPE.",
      "emigrant-family": "Els teus ingressos superen el límit però la teva unitat familiar no: la llei demana no tenir rendes; consulta al SEPE si te'l reconeixen.",
      "rai-three": "Amb tres drets anteriors a la Renda Activa d'Inserció només s'hi accedeix si han passat 3 anys des del primer: consulta-ho al SEPE.",
      "other-situation": "Aquesta calculadora no pot valorar el teu cas. La reforma del 2024 va treure els subsidis especials de sortida de presó; consulta-ho al SEPE (o mira l'Ingrés Mínim Vital, més avall).",
      "over52-unknown": `Si compleixes els dos requisits dels més grans de ${OVER52_AGE} anys, cobraries el subsidi per a més grans de 52 (480 € al mes fins a la jubilació, amb cotització): consulta la teva vida laboral o el SEPE.`,
      "over52-record-no": `Sense aquests requisits no hi ha subsidi per a més grans de ${OVER52_AGE} anys; es calcula el subsidi general.`,
      "over52-income": `Per al subsidi de més grans de ${OVER52_AGE} anys compten només els teus ingressos, i superen el límit; es calcula el subsidi general (que admet responsabilitats familiars).`,
    },
    basis: {
      exhausted: "Base legal: arts. 274.1.a, 275, 277.1 i 278 de la Llei general de la Seguretat Social.",
      insufficient: "Base legal: arts. 274.1.b, 275, 277.2 i 278 de la Llei general de la Seguretat Social.",
      over52: "Base legal: art. 280 de la Llei general de la Seguretat Social (quantia, 280.4; cotització per jubilació, 280.9).",
      emigrant: "Base legal: disposició addicional 57a i art. 278 de la Llei general de la Seguretat Social.",
      victim: "Base legal: disposició addicional 58a i art. 278 de la Llei general de la Seguretat Social.",
    },
    retirement: "El SEPE cotitza per la teva jubilació mentre el cobres. Cada 12 mesos has de presentar la declaració anual de rendes.",
    periods: "Es concedeix per 3 mesos i cal demanar la pròrroga en els 15 dies hàbils següents a cada trimestre, acreditant que continues complint els requisits.",
    share: "L'enllaç d'aquesta pàgina guarda les dades que has posat: el pots copiar per compartir el càlcul.",
    disclaimer: "Comprovació orientativa amb la llei publicada al BOE; qui reconeix el subsidi és el SEPE. No inclou el subsidi agrari, la renda agrària, els fixos discontinus ni els subsidis nascuts abans de l'1 de novembre de 2024.",
  },
  en: {
    title: "Check whether you qualify for the subsidy",
    intro: "Answer with your situation on the day your unemployment benefit ran out or your job ended, and with your gross income in the calendar month before you apply.",
    noscript: "Without JavaScript you see the example below (aged 47, a 360-day benefit exhausted, a partner and a child, €1,200 household income). Turn JavaScript on to check your own case.",
    situation: "Your situation",
    situationOptions: {
      exhausted: "My contributory unemployment benefit (paro) has run out",
      insufficient: "I lost my job with fewer than 360 days of contributions",
      emigrant: "I am a returning Spanish emigrant (from outside the European Economic Area)",
      victim: "I am a victim of gender-based or sexual violence",
      other: "Something else (release from prison, I resigned, self-employed…)",
    },
    age: "Age",
    ageHint: "On the day your benefit ran out or your job ended.",
    exhausted: "Length of the benefit you used up",
    exhaustedOption: (d) => `${d} days (${d / 30} months)`,
    contributed: "Days contributed in the last 6 years",
    contributedHint: "They are on your vida laboral record. With 360 days or more you get the contributory benefit.",
    members: "People in your family unit, not counting you",
    membersHint: "Spouse or registered partner, children under 26 or with a disability, foster children. 0 if you live alone.",
    ownIncome: "Your gross income last month",
    ownIncomeHint: `Of any kind: wages, rent, interest, pensions… The limit is ${LIMIT("en")} a month. Statutory severance pay does not count.`,
    household: "The whole family unit's gross income last month (yours included)",
    householdHint: `It is divided by all members: ${LIMIT("en")} or less per person means you have family responsibilities.`,
    over52Legend: "If you are 52 or over",
    retirementRecord: "Do you have at least 15 years of contributions, 2 of them in the last 15?",
    unemploymentYears: "Have you contributed for unemployment for at least 6 years over your working life?",
    answerOptions: { yes: "Yes", no: "No", unknown: "I don't know" },
    workedAbroad: "Did you work at least 12 months in the last 6 years in that country, without getting unemployment benefit there?",
    priorRai: "Earlier Renta Activa de Inserción (RAI) awards",
    priorRaiOptions: ["None", "One", "Two", "Three or more"],
    result: "Result",
    verdict: (r) =>
      r.status === "eligible"
        ? "You qualify for the subsidy"
        : r.status === "contributory"
          ? "You qualify for contributory benefit, not the subsidy"
          : r.status === "check-sepe"
            ? "Ask SEPE"
            : "With these answers you do not qualify",
    kindName: {
      exhausted: "Subsidy after the benefit runs out",
      insufficient: "Subsidy for insufficient contributions",
      over52: "Subsidy for people aged 52 and over",
      emigrant: "Returning emigrant subsidy",
      victim: "Subsidy for victims of gender-based or sexual violence",
    },
    duration: (r) => (r.kind === "over52" ? "Until the ordinary retirement age" : `Up to ${r.months} months, in 3-month periods`),
    first: "First month",
    total: "Total over the whole subsidy",
    cols: { months: "Months", pct: "% of IPREM", monthly: "Per month", total: "In the band" },
    monthsLabel: (f, t) => (t === null ? `From month ${f}` : f === t ? `Month ${f}` : `Months ${f} to ${t}`),
    incomeLine: (r) => `Your income is ${r.ownIncomeOk ? "within" : "above"} the ${LIMIT("en")} monthly limit (75% of the minimum wage).`,
    familyLine: (r, m) =>
      m === 0
        ? "With no family unit there are no family responsibilities."
        : `Income per person in your family unit: ${money(r.perHead, "en")}: you ${r.familyOk ? "have" : "do not have"} family responsibilities.`,
    reason: {
      income: `Your income is above ${LIMIT("en")} a month and, if you have a family, so is the income per person. If it drops, you can still apply within 6 months.`,
      "young-short": `Under ${YOUNG_AGE} without family responsibilities, the benefit you used up must have lasted 360 days or more. If you come to have them within 6 months of the benefit running out, you can apply: ask SEPE.`,
      "few-days": "With fewer than 90 days of contributions there is no subsidy for insufficient contributions.",
      contributory: "With 360 days of contributions or more you are entitled to the contributory benefit: work out how much.",
      "abroad-no": "Without 12 months worked abroad in the last 6 years (or if you got unemployment benefit there) this subsidy does not apply.",
      "abroad-unknown": "It depends on where and how long you worked abroad and on the returning emigrant certificate: ask SEPE.",
      "emigrant-family": "Your income is above the limit but your family unit's is not: the law asks for no income of your own; ask SEPE whether it will be granted.",
      "rai-three": "After three earlier RAI awards you only qualify if 3 years have passed since the first: ask SEPE.",
      "other-situation": "This tool cannot assess your case. The 2024 reform removed the special access for people released from prison; ask SEPE (or see the Minimum Living Income below).",
      "over52-unknown": `If you meet both requirements for people aged ${OVER52_AGE} and over, you would get the over-52 subsidy instead (€480 a month until retirement, with pension contributions): check your contribution record or ask SEPE.`,
      "over52-record-no": `Without those requirements there is no over-${OVER52_AGE} subsidy; the general subsidy is shown.`,
      "over52-income": `For the over-${OVER52_AGE} subsidy only your own income counts, and it is above the limit; the general subsidy (which accepts family responsibilities) is shown.`,
    },
    basis: {
      exhausted: "Legal basis: General Social Security Act (LGSS), arts. 274.1.a, 275, 277.1 and 278.",
      insufficient: "Legal basis: General Social Security Act (LGSS), arts. 274.1.b, 275, 277.2 and 278.",
      over52: "Legal basis: General Social Security Act (LGSS), art. 280 (amount, 280.4; retirement contributions, 280.9).",
      emigrant: "Legal basis: General Social Security Act (LGSS), additional provision 57 and art. 278.",
      victim: "Legal basis: General Social Security Act (LGSS), additional provision 58 and art. 278.",
    },
    retirement: "SEPE pays your retirement contributions while you get it. Every 12 months you must file the annual income statement.",
    periods: "It is granted for 3 months at a time: apply for each extension within 15 working days after each quarter, showing you still qualify.",
    share: "This page's link keeps what you entered: copy it to share the result.",
    disclaimer: "An indicative check under the law published in the BOE; SEPE decides. It leaves out the farm-worker subsidy and renta agraria, fijos discontinuos and subsidies that started before 1 November 2024.",
  },
};

export type { Answer, Situation, SubsidyKind };
