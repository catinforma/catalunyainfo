import { calcPath } from "@/lib/programmatic/calculators/paths";
import { dayMonthYear, type DateLocale } from "@/lib/programmatic/holidays/format";
import { elDay, euros, num } from "@/lib/programmatic/rent-update/copy";

import type { CheckId, InvalidReason, PncType, RentReason } from "./engine";

/**
 * Paths and words of "Pensión no contributiva: requisitos y cuánto se
 * cobra", small enough for the browser (the client component imports this
 * file, the engine and the rules; nothing that reads data).
 *
 *   /es/calculadoras/pension-no-contributiva/
 *   /ca/calculadores/pensio-no-contributiva/
 *   /en/calculators/spain-non-contributory-pension/
 */

export type NcLocale = DateLocale;
export const NC_LOCALES: readonly NcLocale[] = ["es", "ca", "en"];

export function ncPath(locale: NcLocale): string {
  return calcPath("non-contributory-pension", locale);
}

export function ncEditions(): Record<NcLocale, string> {
  return { ca: ncPath("ca"), es: ncPath("es"), en: ncPath("en") };
}

export { elDay, euros, num };

export function day(iso: string, locale: NcLocale): string {
  return dayMonthYear(iso, locale);
}

/** "65 %" / "65%". */
export function whole(n: number, locale: NcLocale): string {
  return locale === "en" ? `${num(n, 0, locale)}%` : `${num(n, 0, locale)} %`;
}

/** "628,80 € al mes" / "€628.80 a month". */
export function perMonth(n: number, locale: NcLocale): string {
  return { es: `${euros(n, locale)} al mes`, ca: `${euros(n, locale)} al mes`, en: `${euros(n, locale)} a month` }[locale];
}

/** "8.803,20 € al año" / "8.803,20 € l'any" / "€8,803.20 a year". */
export function perYear(n: number, locale: NcLocale): string {
  return { es: `${euros(n, locale)} al año`, ca: `${euros(n, locale)} l'any`, en: `${euros(n, locale)} a year` }[locale];
}

export const TYPE_LABEL: Record<PncType, Record<NcLocale, string>> = {
  retirement: { es: "Jubilación (65 años o más)", ca: "Jubilació (65 anys o més)", en: "Retirement (65 or over)" },
  invalidity: { es: "Incapacidad o invalidez (de 18 a 64 años, discapacidad del 65 % o más)", ca: "Incapacitat o invalidesa (de 18 a 64 anys, discapacitat del 65 % o més)", en: "Invalidity (18 to 64, a disability of 65% or more)" },
};

export interface CalcCopy {
  title: string;
  intro: string;
  noscript: string;
  type: string;
  age: string;
  disability: string;
  disabilityHint: string;
  thirdPerson: string;
  thirdPersonHint: string;
  residence: Record<PncType, string>;
  residenceHint: Record<PncType, string>;
  lastTwo: string;
  lastTwoHint: string;
  members: string;
  membersHint: string;
  firstDegree: string;
  beneficiaries: string;
  beneficiariesHint: string;
  ownIncome: string;
  ownIncomeHint: string;
  householdIncome: string;
  householdIncomeHint: string;
  renting: string;
  rentHolder: string;
  ownsHome: string;
  landlordKin: string;
  rentHabitual: string;
  yes: string;
  no: string;
  rAccess: string;
  accessYes: string;
  accessNo: string;
  fail: Record<CheckId, (p: { type: PncType; own: string; unit: string; limit: string; pnc: string }) => string>;
  suggest: Record<PncType, string>;
  rLimit: string;
  limitLine: (unit: string, limit: string) => string;
  limitAlone: string;
  rAmount: string;
  amountLine: (monthly: string, annual: string) => string;
  full: (full: string, n: number) => string;
  ownCut: (cut: string, free: string) => string;
  householdCut: (cut: string) => string;
  floor: (min: string) => string;
  complement: (c: string) => string;
  thirdHousehold: string;
  rRent: string;
  rent: { "no-pension": string; "not-renting": string; may: (a: string) => string; shared: string; no: (reasons: string) => string };
  rentReason: Record<RentReason, string>;
  effects: string;
  asOfLine: (date: string) => string;
  articles: string;
  invalid: Record<InvalidReason, string>;
}

export const CALC_COPY: Record<NcLocale, CalcCopy> = {
  es: {
    title: "¿Tengo derecho a la pensión no contributiva y cuánto cobraré?",
    intro: "Contesta con lo que sepas: edad, residencia, con quién vives y los ingresos de todos en un año. No pedimos DNI ni datos personales: nada sale de tu navegador.",
    noscript: "Sin JavaScript ves el resultado de una persona de 67 años que vive sola, sin ingresos y con 40 años de residencia en España.",
    type: "Qué pensión pides",
    age: "Tu edad",
    disability: "Tu grado de discapacidad o enfermedad crónica (%)",
    disabilityHint: "El reconocido en tu certificado de discapacidad.",
    thirdPerson: "¿Necesitas la ayuda de otra persona para vestirte, desplazarte, comer…?",
    thirdPersonHint: "Con un 75 % o más y esa necesidad reconocida hay un complemento del 50 %.",
    residence: { retirement: "Años de residencia legal en España desde los 16", invalidity: "Años de residencia legal en España" },
    residenceHint: { retirement: "Hacen falta 10.", invalidity: "Hacen falta 5." },
    lastTwo: "¿Has vivido en España los 2 últimos años seguidos?",
    lastTwoHint: "Las ausencias de menos de 90 días al año no rompen la residencia.",
    members: "Personas de tu unidad económica, tú incluido",
    membersHint: "Tú, tu cónyuge y los parientes de sangre hasta segundo grado con quien vives (padres, hijos, abuelos, nietos, hermanos). Los demás (amigos, suegros, cuñados) no cuentan.",
    firstDegree: "¿Entre ellos está tu padre, tu madre o algún hijo o hija?",
    beneficiaries: "¿Cuántos, tú incluido, cobran o piden una pensión no contributiva?",
    beneficiariesHint: "Por ejemplo, 2 si tu cónyuge también la cobra.",
    ownIncome: "Tus ingresos al año",
    ownIncomeHint: "Brutos: sueldo, pensiones, subsidios, intereses y alquileres. Tu vivienda no cuenta.",
    householdIncome: "Ingresos al año de los demás miembros, sumados",
    householdIncomeHint: "Brutos, sin las pensiones no contributivas que ya hayas contado arriba.",
    renting: "¿Vives de alquiler?",
    rentHolder: "¿Eres titular del contrato?",
    ownsHome: "¿Tienes alguna vivienda en propiedad?",
    landlordKin: "¿El casero es tu cónyuge, pareja o familiar hasta tercer grado?",
    rentHabitual: "¿El contrato es de un año o más y llevas 180 días viviendo allí?",
    yes: "Sí",
    no: "No",
    rAccess: "¿Tienes derecho?",
    accessYes: "Sí: cumples la edad, la residencia y los límites de ingresos.",
    accessNo: "No, con estos datos:",
    fail: {
      age: ({ type }) => (type === "retirement" ? "Hay que haber cumplido 65 años (art. 369.1)." : "Hay que tener de 18 a 64 años (art. 363.1.a)."),
      disability: () => "Hace falta un grado de discapacidad o enfermedad crónica del 65 % o más (art. 363.1.c).",
      residence: ({ type }) => (type === "retirement" ? "Hacen falta 10 años de residencia legal entre los 16 años y la solicitud (art. 369.1)." : "Hacen falta 5 años de residencia legal en España (art. 363.1.b)."),
      recent: ({ type }) => `Los 2 años inmediatamente anteriores a la solicitud tienen que ser en España (art. ${type === "retirement" ? "369.1" : "363.1.b"}).`,
      "own-income": ({ own, pnc }) => `Tus ingresos (${own}) tienen que ser inferiores a ${pnc} al año (art. 363.1.d).`,
      household: ({ unit, limit }) => `Los ingresos de tu unidad económica (${unit}) tienen que ser inferiores a ${limit} al año (art. 363.2 y 363.3).`,
    },
    suggest: { retirement: "Con 65 años o más se pide la de jubilación.", invalidity: "Antes de los 65 y con un 65 % de discapacidad se pide la de incapacidad." },
    rLimit: "Límite de ingresos de tu hogar",
    limitLine: (u, l) => `Ingresos de la unidad: ${u}; límite: ${l} al año.`,
    limitAlone: "Vives solo o con personas que no forman tu unidad económica: solo cuentan tus ingresos.",
    rAmount: "Cuánto cobrarías",
    amountLine: (m, a) => `${m} en 14 pagas (${a}).`,
    full: (f, n) => (n > 1 ? `Importe de cada uno con ${n} beneficiarios en casa: ${f} (art. 364.1).` : `Importe íntegro: ${f} (art. 364.1).`),
    ownCut: (c, free) => `Menos ${c}: tus ingresos por encima de ${free} (el 35 %, art. 364.2).`,
    householdCut: (c) => `Menos ${c}: lo que la unidad pasa del límite (art. 364.3).`,
    floor: (m) => `Nunca menos de ${m} al año, el 25 % (art. 364.4).`,
    complement: (c) => `Más ${c} de complemento por necesitar a otra persona (art. 364.6).`,
    thirdHousehold: "Con el complemento de tercera persona, la ley no detalla cómo se recorta por convivencia: aplicamos los límites del Imserso. Orientativo.",
    rRent: "Complemento de alquiler",
    rent: {
      "no-pension": "Solo para quien tiene reconocida la pensión no contributiva.",
      "not-renting": "Solo si vives de alquiler.",
      may: (a) => `Puede corresponderte: ${a} al año, en un solo pago. Se pide aparte.`,
      shared: "Si en el piso viven varios pensionistas no contributivos, solo lo cobra el titular del contrato (o el primero que figure).",
      no: (r) => `No: ${r}.`,
    },
    rentReason: { "not-holder": "tienes que ser titular del contrato", "owns-home": "no puedes tener vivienda en propiedad", kin: "el casero no puede ser tu cónyuge, pareja o familiar hasta tercer grado", "not-habitual": "el contrato tiene que ser de un año o más y llevar 180 días viviendo allí" },
    effects: "Se cobra desde el día 1 del mes siguiente a la solicitud (arts. 365 y 371).",
    asOfLine: (d) => `Normas vigentes ${d}; cuantías de 2026.`,
    articles: "Ley General de la Seguridad Social, arts. 363 a 372; Real Decreto 241/2026, art. 21; Real Decreto 1191/2012.",
    invalid: {
      age: "Escribe tu edad en años.",
      disability: "El grado de discapacidad va de 0 a 100.",
      residence: "Los años de residencia no pueden pasar de tu edad.",
      members: "La unidad económica va de 1 a 12 personas.",
      beneficiaries: "Los beneficiarios no pueden ser más que las personas de la unidad.",
      income: "Escribe los ingresos al año en euros (0 si no hay).",
    },
  },
  ca: {
    title: "Tinc dret a la pensió no contributiva i quant cobraré?",
    intro: "Contesta amb el que sàpigues: edat, residència, amb qui vius i els ingressos de tothom en un any. No demanem DNI ni dades personals: res no surt del teu navegador.",
    noscript: "Sense JavaScript veus el resultat d'una persona de 67 anys que viu sola, sense ingressos i amb 40 anys de residència a Espanya.",
    type: "Quina pensió demanes",
    age: "La teva edat",
    disability: "El teu grau de discapacitat o malaltia crònica (%)",
    disabilityHint: "El reconegut al teu certificat de discapacitat.",
    thirdPerson: "Necessites l'ajuda d'una altra persona per vestir-te, desplaçar-te, menjar…?",
    thirdPersonHint: "Amb un 75 % o més i aquesta necessitat reconeguda hi ha un complement del 50 %.",
    residence: { retirement: "Anys de residència legal a Espanya des dels 16", invalidity: "Anys de residència legal a Espanya" },
    residenceHint: { retirement: "En calen 10.", invalidity: "En calen 5." },
    lastTwo: "Has viscut a Espanya els 2 últims anys seguits?",
    lastTwoHint: "Les absències de menys de 90 dies l'any no trenquen la residència.",
    members: "Persones de la teva unitat econòmica, tu inclòs",
    membersHint: "Tu, el teu cònjuge i els parents de sang fins a segon grau amb qui vius (pares, fills, avis, néts, germans). Els altres (amics, sogres, cunyats) no compten.",
    firstDegree: "Entre ells hi ha el teu pare, la teva mare o algun fill o filla?",
    beneficiaries: "Quants, tu inclòs, cobren o demanen una pensió no contributiva?",
    beneficiariesHint: "Per exemple, 2 si el teu cònjuge també la cobra.",
    ownIncome: "Els teus ingressos l'any",
    ownIncomeHint: "Bruts: sou, pensions, subsidis, interessos i lloguers. El teu habitatge no compta.",
    householdIncome: "Ingressos l'any dels altres membres, sumats",
    householdIncomeHint: "Bruts, sense les pensions no contributives que ja hagis comptat a dalt.",
    renting: "Vius de lloguer?",
    rentHolder: "Ets titular del contracte?",
    ownsHome: "Tens algun habitatge en propietat?",
    landlordKin: "El propietari és el teu cònjuge, parella o familiar fins a tercer grau?",
    rentHabitual: "El contracte és d'un any o més i fa 180 dies que hi vius?",
    yes: "Sí",
    no: "No",
    rAccess: "Hi tens dret?",
    accessYes: "Sí: compleixes l'edat, la residència i els límits d'ingressos.",
    accessNo: "No, amb aquestes dades:",
    fail: {
      age: ({ type }) => (type === "retirement" ? "Cal haver complert 65 anys (art. 369.1)." : "Cal tenir de 18 a 64 anys (art. 363.1.a)."),
      disability: () => "Cal un grau de discapacitat o malaltia crònica del 65 % o més (art. 363.1.c).",
      residence: ({ type }) => (type === "retirement" ? "Calen 10 anys de residència legal entre els 16 anys i la sol·licitud (art. 369.1)." : "Calen 5 anys de residència legal a Espanya (art. 363.1.b)."),
      recent: ({ type }) => `Els 2 anys immediatament anteriors a la sol·licitud han de ser a Espanya (art. ${type === "retirement" ? "369.1" : "363.1.b"}).`,
      "own-income": ({ own, pnc }) => `Els teus ingressos (${own}) han de ser inferiors a ${pnc} l'any (art. 363.1.d).`,
      household: ({ unit, limit }) => `Els ingressos de la teva unitat econòmica (${unit}) han de ser inferiors a ${limit} l'any (art. 363.2 i 363.3).`,
    },
    suggest: { retirement: "Amb 65 anys o més es demana la de jubilació.", invalidity: "Abans dels 65 i amb un 65 % de discapacitat es demana la d'incapacitat." },
    rLimit: "Límit d'ingressos de la llar",
    limitLine: (u, l) => `Ingressos de la unitat: ${u}; límit: ${l} l'any.`,
    limitAlone: "Vius sol o amb persones que no formen la teva unitat econòmica: només compten els teus ingressos.",
    rAmount: "Quant cobraries",
    amountLine: (m, a) => `${m} en 14 pagues (${a}).`,
    full: (f, n) => (n > 1 ? `Import de cadascú amb ${n} beneficiaris a casa: ${f} (art. 364.1).` : `Import íntegre: ${f} (art. 364.1).`),
    ownCut: (c, free) => `Menys ${c}: els teus ingressos per sobre de ${free} (el 35 %, art. 364.2).`,
    householdCut: (c) => `Menys ${c}: el que la unitat passa del límit (art. 364.3).`,
    floor: (m) => `Mai menys de ${m} l'any, el 25 % (art. 364.4).`,
    complement: (c) => `Més ${c} de complement per necessitar una altra persona (art. 364.6).`,
    thirdHousehold: "Amb el complement de tercera persona, la llei no detalla com es retalla per convivència: apliquem els límits de l'Imserso. Orientatiu.",
    rRent: "Complement de lloguer",
    rent: {
      "no-pension": "Només per a qui té reconeguda la pensió no contributiva.",
      "not-renting": "Només si vius de lloguer.",
      may: (a) => `Et pot correspondre: ${a} l'any, en un sol pagament. Es demana a part.`,
      shared: "Si al pis hi viuen diversos pensionistes no contributius, només el cobra el titular del contracte (o el primer que hi consti).",
      no: (r) => `No: ${r}.`,
    },
    rentReason: { "not-holder": "has de ser titular del contracte", "owns-home": "no pots tenir habitatge en propietat", kin: "el propietari no pot ser el teu cònjuge, parella o familiar fins a tercer grau", "not-habitual": "el contracte ha de ser d'un any o més i fer 180 dies que hi vius" },
    effects: "Es cobra des del dia 1 del mes següent a la sol·licitud (arts. 365 i 371).",
    asOfLine: (d) => `Normes vigents ${d}; quanties del 2026.`,
    articles: "Llei general de la Seguretat Social, arts. 363 a 372; Reial decret 241/2026, art. 21; Reial decret 1191/2012.",
    invalid: {
      age: "Escriu la teva edat en anys.",
      disability: "El grau de discapacitat va de 0 a 100.",
      residence: "Els anys de residència no poden passar de la teva edat.",
      members: "La unitat econòmica va d'1 a 12 persones.",
      beneficiaries: "Els beneficiaris no poden ser més que les persones de la unitat.",
      income: "Escriu els ingressos l'any en euros (0 si no n'hi ha).",
    },
  },
  en: {
    title: "Am I entitled to Spain's non-contributory pension, and how much?",
    intro: "Answer what you know: age, residence, who you live with and everyone's income in a year. No ID or personal data asked: nothing leaves your browser.",
    noscript: "Without JavaScript you see the result for a 67-year-old living alone, with no income and 40 years of residence in Spain.",
    type: "Which pension you apply for",
    age: "Your age",
    disability: "Your recognised degree of disability or chronic illness (%)",
    disabilityHint: "As on your disability certificate.",
    thirdPerson: "Do you need another person's help to dress, move about, eat…?",
    thirdPersonHint: "With 75% or more and that need recognised there is a 50% top-up.",
    residence: { retirement: "Years of legal residence in Spain since age 16", invalidity: "Years of legal residence in Spain" },
    residenceHint: { retirement: "10 are needed.", invalidity: "5 are needed." },
    lastTwo: "Have you lived in Spain for the last 2 years in a row?",
    lastTwoHint: "Absences under 90 days a year do not break residence.",
    members: "People in your household unit, you included",
    membersHint: "You, your spouse and the blood relatives up to the second degree you live with (parents, children, grandparents, grandchildren, siblings). Others (friends, in-laws) do not count.",
    firstDegree: "Is your father, mother or a son or daughter among them?",
    beneficiaries: "How many of them, you included, get or apply for a non-contributory pension?",
    beneficiariesHint: "For example, 2 if your spouse gets one too.",
    ownIncome: "Your income a year",
    ownIncomeHint: "Gross: wages, pensions, benefits, interest and rents. Your home does not count.",
    householdIncome: "The other members' income a year, together",
    householdIncomeHint: "Gross, without the non-contributory pensions already counted above.",
    renting: "Do you rent your home?",
    rentHolder: "Is the lease in your name?",
    ownsHome: "Do you own any home?",
    landlordKin: "Is the landlord your spouse, partner or a relative up to the third degree?",
    rentHabitual: "Is the lease for a year or more, and have you lived there 180 days?",
    yes: "Yes",
    no: "No",
    rAccess: "Are you entitled?",
    accessYes: "Yes: you meet the age, residence and income limits.",
    accessNo: "No, with these answers:",
    fail: {
      age: ({ type }) => (type === "retirement" ? "You must be 65 or over (art. 369.1)." : "You must be 18 to 64 (art. 363.1.a)."),
      disability: () => "You need a degree of disability or chronic illness of 65% or more (art. 363.1.c).",
      residence: ({ type }) => (type === "retirement" ? "You need 10 years of legal residence between age 16 and the application (art. 369.1)." : "You need 5 years of legal residence in Spain (art. 363.1.b)."),
      recent: ({ type }) => `The 2 years right before the application must be in Spain (art. ${type === "retirement" ? "369.1" : "363.1.b"}).`,
      "own-income": ({ own, pnc }) => `Your income (${own}) must be under ${pnc} a year (art. 363.1.d).`,
      household: ({ unit, limit }) => `Your household unit's income (${unit}) must be under ${limit} a year (art. 363.2 and 363.3).`,
    },
    suggest: { retirement: "From 65 you apply for the retirement one.", invalidity: "Under 65 with a 65% disability you apply for the invalidity one." },
    rLimit: "Your household's income limit",
    limitLine: (u, l) => `The unit's income: ${u}; limit: ${l} a year.`,
    limitAlone: "You live alone or with people outside your household unit: only your income counts.",
    rAmount: "How much you would get",
    amountLine: (m, a) => `${m} in 14 payments (${a}).`,
    full: (f, n) => (n > 1 ? `Each one's amount with ${n} beneficiaries at home: ${f} (art. 364.1).` : `Full amount: ${f} (art. 364.1).`),
    ownCut: (c, free) => `Minus ${c}: your income above ${free} (35%, art. 364.2).`,
    householdCut: (c) => `Minus ${c}: what the unit has above the limit (art. 364.3).`,
    floor: (m) => `Never under ${m} a year, 25% (art. 364.4).`,
    complement: (c) => `Plus ${c} top-up for needing another person (art. 364.6).`,
    thirdHousehold: "With the third-person top-up the law does not spell out the household cut: we apply IMSERSO's limits. An estimate.",
    rRent: "Rent supplement",
    rent: {
      "no-pension": "Only for people already granted the non-contributory pension.",
      "not-renting": "Only if you rent your home.",
      may: (a) => `You may get it: ${a} a year, in one payment. It is applied for separately.`,
      shared: "If several non-contributory pensioners share the flat, only the leaseholder gets it (or the first named).",
      no: (r) => `No: ${r}.`,
    },
    rentReason: { "not-holder": "the lease must be in your name", "owns-home": "you cannot own a home", kin: "the landlord cannot be your spouse, partner or a relative up to the third degree", "not-habitual": "the lease must be for a year or more, with 180 days lived there" },
    effects: "Paid from the 1st of the month after the application (arts. 365 and 371).",
    asOfLine: (d) => `Rules in force ${d}; 2026 amounts.`,
    articles: "General Social Security Act, arts. 363 to 372; Royal Decree 241/2026, art. 21; Royal Decree 1191/2012.",
    invalid: {
      age: "Enter your age in years.",
      disability: "The degree of disability runs from 0 to 100.",
      residence: "Years of residence cannot be more than your age.",
      members: "The household unit has 1 to 12 people.",
      beneficiaries: "Beneficiaries cannot outnumber the people in the unit.",
      income: "Enter income a year in euros (0 if none).",
    },
  },
};
