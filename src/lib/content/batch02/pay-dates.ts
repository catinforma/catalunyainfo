import type { Block } from "@/lib/content/blocks";
import { WEEKDAY_NAMES } from "@/lib/content/holidays/calendar";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { boeRegionsOn2026 } from "@/lib/programmatic/holidays/boe-2026";
import { boeRegionsOn } from "@/lib/programmatic/holidays/boe-2027";
import { calcEditions, calculatorsHubEditions } from "@/lib/programmatic/calculators/paths";
import { pensionEditions } from "@/lib/programmatic/pensions-2027/copy";

import { B2_PATHS, callout, faq, h2, lead, list, paras, table, type B2Article, type B2Edition, type B2Source } from "./shared";

/**
 * "¿Cuándo se cobra el paro y la pensión?" — payment dates, Spain-wide (9 Nov 2026).
 *
 * Every rule was read on 9 Nov 2026 on the official text (fact pack:
 * research_notes/x10 ChatGPT dossier of 9 Nov, links checked by script):
 *  - SEPE: «el día 10 de cada mes» and, if a holiday, «el primer día hábil siguiente».
 *    Only weekends move the computed date here: the SEPE does not say which
 *    regional calendar it uses, so no regional holiday is applied.
 *  - Social Security pensions and IMV (RD 696/2018, art. 3 and 4; Ley 19/2021):
 *    «el primer día hábil del mes en que se realice el pago y, como máximo, el
 *    cuarto día natural»; business days follow the TARGET calendar and exclude
 *    holidays in the city of Madrid. The table gives that legal deadline, never
 *    a bank date (banks may pay earlier, Banco de España).
 *  - Extra payments: contributory and non-contributory pensions, June and
 *    November; Clases Pasivas, June and December (RDL 670/1987).
 *  - Clases Pasivas: the payment order is issued «a partir del día 25 de cada
 *    mes», earlier in December (day not published).
 * No clock: the tables cover Dec 2026 to Dec 2027 whatever day the page renders.
 * PAY_DATES_AS_OF moves when the rules are re-read; a test fails 60 days after.
 *
 * Three editions since 10 Nov 2026 (owner rule: every page in ca, es and en).
 * The Catalan and English editions say what the Spanish one says, with the
 * same dates, links and sources; the official texts are Spanish, so those two
 * report the rules in their own words instead of quoting them. One body
 * builder for the three, so no edition can gain or lose a section.
 */
export const PAY_DATES_AS_OF = "2026-11-09";

/**
 * 25 Nov 2026: the SEPE answer and RD 696/2018 art. 24.2 re-read with curl for the
 * source callout and the "first payment" section (owner, 24 Nov: money-topic pages
 * show the official sentence and the day it was read on the first screen).
 *  - SEPE FAQ «¿Cuándo se abona la nómina de prestaciones del SEPE?»: «El pago de
 *    prestaciones del SEPE se produce el día 10 de cada mes, y si coincide que es
 *    festivo, el primer día hábil siguiente.» and «Puedes consultar la nómina de
 *    prestaciones en tu Área Personal, si dispones de DNI / Certificado electrónico o
 *    Cl@ve permanente o mediante un PIN telefónico que enviaremos a tu móvil.»
 *  - RD 696/2018 art. 24.1: «El Ministerio de Trabajo, Migraciones y Seguridad Social
 *    dictará reglas especiales para el pago de las prestaciones económicas del sistema
 *    de la Seguridad Social.» Art. 24.2: «En todo caso, una vez efectuado su primer
 *    pago, los importes de los sucesivos pagos mensuales de las pensiones y demás
 *    prestaciones de pago ordinario periódico deberán figurar en la cuenta de los
 *    perceptores o a disposición del beneficiario en la entidad financiera colaboradora
 *    el primer día hábil del mes en que se realice el pago y, como máximo, el cuarto
 *    día natural de dicho mes.»
 * The re-read date moves with the quote; a test fails 60 days after it.
 *
 * 25 Nov 2026, "each unemployment payment corresponds to the previous month" (reviewer: no source). Found with curl
 * on the BOE consolidated text (ELI https://www.boe.es/eli/es/rd/1985/04/02/625/con, BOE-A-1985-8124, last update
 * published 22/05/2024, read 25 Nov 2026): RD 625/1985 art. 26.1 «El abono de la prestación o subsidio por desempleo se
 * realizará por mensualidades de treinta días, dentro del mes inmediato siguiente al que corresponda el devengo. En todo
 * caso, el derecho al percibo de cada mensualidad caducará al año de su respectivo vencimiento.» The SEPE FAQ does not
 * say it; the text has no «mensualidades vencidas» wording but says the same thing. The page says exactly that and does
 * not say pensions work the same way: no source read for pensions (RD 696/2018 and the LGSS have no such sentence for
 * ordinary pensions; LGSS «por meses vencidos» concerns only the delayed-retirement amount).
 */
export const SEPE_READ_ON = "2026-11-25";
/** The SEPE sentence, verbatim (printed in the three editions: the official text is Spanish). */
export const SEPE_QUOTE = "El pago de prestaciones del SEPE se produce el día 10 de cada mes, y si coincide que es festivo, el primer día hábil siguiente.";

const TARGET_CLOSED = new Set(["2026-01-01", "2026-04-03", "2026-04-06", "2026-05-01", "2026-12-25", "2026-12-26", "2027-01-01", "2027-03-26", "2027-03-29", "2027-05-01", "2027-12-25", "2027-12-26"]);
const MADRID_LOCAL = new Set(["2026-05-15", "2026-11-09", "2027-05-15", "2027-11-09"]);
const MONTHS: Record<Locale, string[]> = {
  ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const U = {
  sepe: "https://www.sepe.es/HomeSepe/preguntas-frecuentes/detalle-pregunta.html?detail=%2Fpreguntas%2Fprestaciones-por-desempleo%2Fpago-y-cuant-a%2Fcuando-se-abona-la-nomina-de-prestaciones-del-sepe",
  rd696: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2018-9030",
  rd625: "https://www.boe.es/eli/es/rd/1985/04/02/625/con",
  ecb: "https://www.ecb.europa.eu/ecb/contacts/working-hours/html/index.en.html",
  lgss: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724",
  imv: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-21007",
  pasivas: "https://www.boe.es/eli/es/rdlg/1987/04/30/670/con",
  pasivasFaq: "https://www.seg-social.es/wps/portal/wss/internet/FAQ/ae7d008e-a286-476f-8681-17ef191cac81/d88397b5-7cf0-4912-ba05-147fe51c3554/cpf56?temaPregunta=&view=FAQs_detalle_tema",
  imserso: "https://imserso.es/el-imserso/documentacion/estadisticas/pensiones-no-contributivas-jubilacion-incapacidad-pnc",
  bde: "https://clientebancario.bde.es/pcb/es/blog/sabes_cual_es_fecha_cobro_pension.html?blog=%2Fwebcb%2FBlog%2FCuentasDepositos",
} as const;
const link = (href: string, label: string) => `[${label}](${href})`;
/** The unemployment benefit calculator (lib/programmatic/employment/), which links back here. */
const CALC = calcEditions("unemployment");
/** The unemployment subsidy checker (lib/programmatic/unemployment-subsidy/), which links back here. */
const SUBSIDY = calcEditions("unemployment-subsidy");
/** The net salary calculator and the calculators hub, for readers checking a payslip rather than a benefit. */
const NET = calcEditions("net-salary");
/** The Christmas extra pay calculator (lib/programmatic/extra-pay/), which links back here: the payslip extra, not the pension one. */
const EXTRA = calcEditions("extra-pay");
const HUB = calculatorsHubEditions();
/** The 2027 pension increase calculator (lib/programmatic/pensions-2027/), which links back here. */
const PENSION_CALC = pensionEditions();
/** The retirement age calculator (lib/programmatic/retirement-age/), which links back here. */
const RETIREMENT = calcEditions("retirement-age");
/**
 * The sick-pay calculator (lib/programmatic/sick-leave/), 19 Nov 2026: "quan es cobra estant de baixa" reaches it.
 * Sick pay is not on this calendar: the Seguridad Social says «el pago lo efectúa la empresa como pago delegado
 * con la misma periodicidad que los salarios» (quoted on that page, its "Quién paga y cuándo cobras").
 */
const SICK = calcEditions("sick-leave");
/** 27 Nov 2026 (link audit, round 3): the non-contributory pension calculator (707 impressions in 28 days, no editorial inlink) next to the line on who pays it. */
const PNC = calcEditions("non-contributory-pension");

const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const weekday = (s: string) => new Date(`${s}T12:00:00Z`).getUTCDay();
/** "de diciembre", "de desembre", "d'abril" (Catalan elides before a vowel). */
const of = (month: string, L: Locale) => (L === "ca" && /^[aeiou]/.test(month) ? `d'${month}` : `de ${month}`);
/** "jueves 10 de diciembre", "dijous 10 de desembre", "Thursday 10 December". */
const words = (s: string, L: Locale = "es") => {
  const [, m, d] = s.split("-").map(Number);
  const month = MONTHS[L][m! - 1]!;
  return `${WEEKDAY_NAMES[L][weekday(s)]} ${d} ${L === "en" ? month : of(month, L)}`;
};
/** "diciembre de 2026", "desembre de 2026", "December 2026". */
const monthYear = (y: number, m: number, L: Locale) => (L === "en" ? `${MONTHS.en[m - 1]} ${y}` : `${MONTHS[L][m - 1]} de ${y}`);

/** "25 de noviembre de 2026", "25 de novembre de 2026", "25 November 2026". */
function longDay(s: string, L: Locale): string {
  const [y, m, d] = s.split("-").map(Number);
  const month = MONTHS[L][m! - 1]!;
  return L === "en" ? `${d} ${month} ${y}` : `${d} ${of(month, L)} de ${y}`;
}

function madridHoliday(s: string): boolean {
  if (MADRID_LOCAL.has(s)) return true;
  return s.startsWith("2026") ? boeRegionsOn2026(s).includes("MD" as never) : boeRegionsOn(s).includes("MD");
}

/** TGSS business day: not a weekend, not a TARGET closing day, not a holiday in the city of Madrid (RD 696/2018, art. 3). */
export function tgssBusinessDay(s: string): boolean {
  const w = weekday(s);
  return w !== 0 && w !== 6 && !TARGET_CLOSED.has(s) && !madridHoliday(s);
}

/** Legal deadline for monthly pensions paid in month m: first TGSS business day, and no later than the 4th. */
export function pensionDeadline(y: number, m: number): string {
  for (let d = 1; d <= 4; d++) if (tgssBusinessDay(iso(y, m, d))) return iso(y, m, d);
  return iso(y, m, 4);
}

/** SEPE: the 10th, or the next day that is not a Saturday or Sunday. */
export function sepeDay(y: number, m: number): string {
  let d = 10;
  while ([0, 6].includes(weekday(iso(y, m, d)))) d++;
  return iso(y, m, d);
}

const SPAN: [number, number][] = [[2026, 12], ...Array.from({ length: 12 }, (_, i) => [2027, i + 1] as [number, number])];

/** The month a SEPE payment covers: the one before the payment month. */
function coveredMonth(y: number, m: number, L: Locale): string {
  if (L === "en") return m === 1 ? `December ${y - 1}` : MONTHS.en[m - 2]!;
  const month = m === 1 ? `${MONTHS[L][11]} de ${y - 1}` : MONTHS[L][m - 2]!;
  return L === "ca" ? `la ${of(month, L)}` : `la de ${month}`;
}

interface PayCopy {
  weekend: string;
  extra: string;
  lead: (dec: string) => string;
  sepe: { heading: string; text: string; caption: string; headers: string[]; note: string };
  pensions: { heading: string; text: string; caption: string; headers: string[]; note: string };
  extras: { heading: string; texts: string[] };
  bank: { heading: string; text: string; items: string[]; payroll: string };
  faq: (dec: string) => { question: string; answer: string }[];
}

const COPY: Record<Locale, PayCopy> = {
  es: {
    weekend: " (el 10 cae en fin de semana)",
    extra: "Sí: paga extra",
    lead: (dec) =>
      `**El paro (SEPE) se cobra el día 10 de cada mes**, o el siguiente día hábil si cae en festivo: en diciembre de 2026, el **${dec}**. **Las pensiones de la Seguridad Social y el Ingreso Mínimo Vital** se pagan, como tarde, el **primer día hábil del mes** (y nunca después del día 4); muchos bancos las adelantan unos días. Aquí tienes el calendario hasta diciembre de 2027.`,
    sepe: {
      heading: "Paro y subsidio: el día 10",
      text: `El SEPE paga la prestación y el subsidio por desempleo «el día 10 de cada mes» y, «si coincide que es festivo, el primer día hábil siguiente» (${link(U.sepe, "SEPE")}). El ${link(U.rd625, "Real Decreto 625/1985")}, art. 26.1, dice que se abona «por mensualidades de treinta días, dentro del mes inmediato siguiente al que corresponda el devengo»: cada pago es de la mensualidad del mes anterior. ¿Cuánto te toca y durante cuánto tiempo? ${link(CALC.es, "Calcula tu paro")}. ¿Se te acaba el paro o no llegas a 360 días cotizados? ${link(SUBSIDY.es, "Comprueba si te corresponde el subsidio")}.`,
      caption: "Pago del paro y del subsidio (SEPE), diciembre 2026 – diciembre 2027",
      headers: ["Mes del pago", "Día", "Prestación que se cobra"],
      note: "Solo se ha movido el día cuando el 10 cae en sábado o domingo; el SEPE no dice qué festivos autonómicos cuentan. La columna sigue el art. 26.1 del RD 625/1985: mensualidades de treinta días, pagadas en el mes siguiente.",
    },
    pensions: {
      heading: "Pensiones e Ingreso Mínimo Vital: el primer día hábil",
      text: `El ${link(U.rd696, "Real Decreto 696/2018")} obliga a que las pensiones estén en la cuenta «el primer día hábil del mes en que se realice el pago y, como máximo, el cuarto día natural». Los días hábiles son los del calendario bancario europeo ${link(U.ecb, "TARGET")}, sin contar los festivos de la ciudad de Madrid. El ${link(U.imv, "Ingreso Mínimo Vital")} se paga cada mes con la misma regla. ¿Cuánto sube tu pensión en enero de 2027? ${link(PENSION_CALC.es, "Calcula la subida de las pensiones 2027")}. ¿Aún no te has jubilado? ${link(RETIREMENT.es, "Calcula a qué edad te puedes jubilar")}.`,
      caption: "Fecha límite legal de pago de las pensiones de la Seguridad Social y del IMV",
      headers: ["Mes del pago", "Como tarde", "Paga extra"],
      note: "Es el plazo de la norma, no la fecha de tu banco: muchas entidades adelantan el ingreso unos días.",
    },
    extras: {
      heading: "Pagas extra: junio y noviembre (Clases Pasivas, junio y diciembre)",
      texts: [
        `Las pensiones contributivas de la Seguridad Social tienen «dos pagas extraordinarias que se devengan en los meses de junio y noviembre», que se cobran con la mensualidad de esos meses. Las pensiones por accidente de trabajo o enfermedad profesional las tienen **prorrateadas** en las 12 mensualidades. Las ${link(U.imserso, "pensiones no contributivas")} también tienen extra en junio y noviembre (${link(U.lgss, "Ley General de la Seguridad Social")}, art. 46.2). El Ingreso Mínimo Vital no tiene pagas extra.`,
        `Las **pensiones de Clases Pasivas** (funcionarios del Estado) son distintas: el pago se ordena «a partir del día 25 de cada mes», salvo en diciembre, que se adelanta (${link(U.pasivasFaq, "Seguridad Social")}), y sus pagas extra son en **junio y diciembre** (${link(U.pasivas, "Real Decreto Legislativo 670/1987")}).`,
        `¿Cobras una nómina? Tu paga extra de Navidad no sigue este calendario: el día y el importe los fija tu convenio colectivo. ${link(EXTRA.es, "Calcula tu paga extra de Navidad")}: bruto, parte proporcional si entraste este año, retención de IRPF y neto.`,
      ],
    },
    bank: {
      heading: "¿Por qué mi banco me paga antes?",
      text: `Porque algunas entidades deciden adelantar el dinero: conocen la transferencia antes de recibirla y la ponen a tu disposición unos días antes, según el ${link(U.bde, "Banco de España")}. Es una decisión de cada banco, no una fecha oficial: si tu banco no adelanta, el plazo legal es el de la tabla.`,
      items: [
        `Las pensiones no contributivas las paga la Tesorería de la Seguridad Social, salvo en Navarra y el País Vasco, que las gestionan ellos. ${link(PNC.es, "Calcula cuánto cobrarías de pensión no contributiva")}.`,
        "Este calendario no sirve para nóminas de empresa ni para ayudas autonómicas.",
        `Tampoco para la baja laboral: en general la paga la empresa en tu nómina, con la misma periodicidad que el salario («pago delegado»). ${link(SICK.es, "Calcula cuánto cobras de baja laboral")}.`,
      ],
      payroll: `Para saber cuánto cobrarás en la nómina, usa la ${link(NET.es, "calculadora de sueldo neto")}; el finiquito, el despido y la subida del alquiler están en las ${link(HUB.es, "calculadoras")}.`,
    },
    faq: (dec) => [
      { question: "¿Qué día se cobra el paro en diciembre de 2026?", answer: `El ${dec}, porque el SEPE paga el día 10 de cada mes, o el siguiente día hábil si es festivo.` },
      { question: "¿Cuándo se cobra la pensión?", answer: "Como tarde el primer día hábil de cada mes, y nunca después del día 4. Muchos bancos la adelantan unos días; eso depende de cada entidad." },
      { question: "¿Cuándo se cobra la paga extra de las pensiones?", answer: "Con la mensualidad de junio y la de noviembre. En Clases Pasivas, en junio y diciembre. El Ingreso Mínimo Vital no tiene pagas extra." },
    ],
  },
  ca: {
    weekend: " (el 10 cau en cap de setmana)",
    extra: "Sí: paga extra",
    lead: (dec) =>
      `**L'atur (SEPE) es cobra el dia 10 de cada mes**, o el primer dia hàbil següent si cau en festiu: el desembre de 2026, el **${dec}**. **Les pensions de la Seguretat Social i l'Ingrés Mínim Vital** s'han de pagar, com a molt tard, el **primer dia hàbil del mes** (i mai després del dia 4); molts bancs les avancen uns dies. Aquí tens el calendari fins al desembre de 2027.`,
    sepe: {
      heading: "Atur i subsidi: el dia 10",
      text: `El SEPE paga la prestació i el subsidi per desocupació el dia 10 de cada mes i, si coincideix amb un festiu, el primer dia hàbil següent (${link(U.sepe, "SEPE")}). El ${link(U.rd625, "Reial decret 625/1985")}, art. 26.1, diu que s'abona «per mensualitats de trenta dies, dins del mes immediat següent a aquell al qual correspongui la meritació»: cada pagament és de la mensualitat del mes anterior. Quant et toca i durant quant de temps? ${link(CALC.ca, "Calcula el teu atur")}. Se t'acaba l'atur o no arribes a 360 dies cotitzats? ${link(SUBSIDY.ca, "Comprova si et correspon el subsidi")}.`,
      caption: "Pagament de l'atur i del subsidi (SEPE), desembre 2026 – desembre 2027",
      headers: ["Mes del pagament", "Dia", "Prestació que es cobra"],
      note: "El dia només s'ha mogut quan el 10 cau en dissabte o diumenge; el SEPE no diu quins festius autonòmics compten. La columna segueix l'art. 26.1 del RD 625/1985: mensualitats de trenta dies, pagades el mes següent.",
    },
    pensions: {
      heading: "Pensions i Ingrés Mínim Vital: el primer dia hàbil",
      text: `El ${link(U.rd696, "Reial decret 696/2018")} obliga que les pensions siguin al compte el primer dia hàbil del mes en què es fa el pagament i, com a màxim, el quart dia natural. Els dies hàbils són els del calendari bancari europeu ${link(U.ecb, "TARGET")}, sense comptar els festius de la ciutat de Madrid. L'${link(U.imv, "Ingrés Mínim Vital")} es paga cada mes amb la mateixa regla. Quant puja la teva pensió el gener del 2027? ${link(PENSION_CALC.ca, "Calcula la pujada de les pensions 2027")}. Encara no t'has jubilat? ${link(RETIREMENT.ca, "Calcula a quina edat et pots jubilar")}.`,
      caption: "Data límit legal de pagament de les pensions de la Seguretat Social i de l'IMV",
      headers: ["Mes del pagament", "Com a molt tard", "Paga extra"],
      note: "És el termini de la norma, no la data del teu banc: moltes entitats avancen l'ingrés uns dies.",
    },
    extras: {
      heading: "Pagues extra: juny i novembre (Classes Passives, juny i desembre)",
      texts: [
        `Les pensions contributives de la Seguretat Social tenen dues pagues extraordinàries que es meriten els mesos de juny i novembre i es cobren amb la mensualitat d'aquests mesos. Les pensions per accident de treball o malaltia professional les tenen **prorratejades** en les 12 mensualitats. Les ${link(U.imserso, "pensions no contributives")} també tenen paga extra al juny i al novembre (${link(U.lgss, "Llei general de la Seguretat Social")}, art. 46.2). L'Ingrés Mínim Vital no té pagues extra.`,
        `Les **pensions de Classes Passives** (funcionaris de l'Estat) van a part: el pagament s'ordena a partir del dia 25 de cada mes, tret del desembre, que s'avança (${link(U.pasivasFaq, "Seguretat Social")}), i les pagues extra són al **juny i al desembre** (${link(U.pasivas, "Reial decret legislatiu 670/1987")}).`,
        `Cobres una nòmina? La teva paga extra de Nadal no segueix aquest calendari: el dia i l'import els fixa el teu conveni col·lectiu. ${link(EXTRA.ca, "Calcula la teva paga extra de Nadal")}: brut, part proporcional si vas entrar aquest any, retenció d'IRPF i net.`,
      ],
    },
    bank: {
      heading: "Per què el meu banc em paga abans?",
      text: `Perquè algunes entitats decideixen avançar els diners: coneixen la transferència abans de rebre-la i la posen a la teva disposició uns dies abans, segons el ${link(U.bde, "Banc d'Espanya")}. És una decisió de cada banc, no una data oficial: si el teu banc no avança el pagament, el termini legal és el de la taula.`,
      items: [
        `Les pensions no contributives les paga la Tresoreria de la Seguretat Social, tret de Navarra i el País Basc, que les gestionen ells mateixos. ${link(PNC.ca, "Calcula quant cobraries de pensió no contributiva")}.`,
        "Aquest calendari no serveix per a les nòmines d'empresa ni per als ajuts autonòmics.",
        `Tampoc per a la baixa laboral: en general la paga l'empresa a la teva nòmina, amb la mateixa periodicitat que el sou («pagament delegat»). ${link(SICK.ca, "Calcula quant cobres de baixa laboral")}.`,
      ],
      payroll: `Per saber quant cobraràs a la nòmina, fes servir la ${link(NET.ca, "calculadora de sou net")}; la quitança, l'acomiadament i la pujada del lloguer són a les ${link(HUB.ca, "calculadores")}.`,
    },
    faq: (dec) => [
      { question: "Quin dia es cobra l'atur el desembre de 2026?", answer: `El ${dec}, perquè el SEPE paga el dia 10 de cada mes, o el primer dia hàbil següent si és festiu.` },
      { question: "Quan es cobra la pensió?", answer: "Com a molt tard el primer dia hàbil de cada mes, i mai després del dia 4. Molts bancs l'avancen uns dies; això depèn de cada entitat." },
      { question: "Quan es cobra la paga extra de les pensions?", answer: "Amb la mensualitat de juny i la de novembre. A Classes Passives, al juny i al desembre. L'Ingrés Mínim Vital no té pagues extra." },
    ],
  },
  en: {
    weekend: " (the 10th falls on a weekend)",
    extra: "Yes: extra payment",
    lead: (dec) =>
      `**Unemployment benefit in Spain (the "paro", paid by SEPE) arrives on the 10th of each month**, or on the next business day if the 10th is a holiday: in December 2026, on **${dec}**. **Social Security pensions and the Minimum Living Income (IMV)** must be paid by the **first business day of the month** at the latest (and never after the 4th); many banks pay a few days early. Here is the calendar up to December 2027.`,
    sepe: {
      heading: "Unemployment benefit and subsidy: the 10th",
      text: `SEPE, Spain's public employment service, pays unemployment benefit (prestación por desempleo) and the unemployment subsidy (subsidio) on the 10th of each month and, if that day is a holiday, on the next business day (${link(U.sepe, "SEPE")}). ${link(U.rd625, "Royal Decree 625/1985")}, art. 26.1, says the benefit is paid in monthly instalments of thirty days, within the month immediately following the one in which the instalment accrued (devengo): each payment is for the previous month. How much you get, and for how long: ${link(CALC.en, "unemployment benefit calculator")}. Benefit running out, or fewer than 360 days of contributions? ${link(SUBSIDY.en, "unemployment subsidy checker")}.`,
      caption: "SEPE unemployment benefit and subsidy payment dates, December 2026 – December 2027",
      headers: ["Payment month", "Day", "Month it covers"],
      note: "The day has been moved only when the 10th falls on a Saturday or Sunday; SEPE does not say which regional holidays count. The last column follows art. 26.1 of RD 625/1985: instalments of thirty days, paid in the following month.",
    },
    pensions: {
      heading: "Pensions and the Minimum Living Income: the first business day",
      text: `${link(U.rd696, "Royal Decree 696/2018")} requires pensions to be in the account on the first business day of the month in which they are paid and, at the latest, on the fourth calendar day. Business days are those of the European banking calendar, ${link(U.ecb, "TARGET")}, leaving out public holidays in the city of Madrid. The ${link(U.imv, "Minimum Living Income (Ingreso Mínimo Vital)")} is paid every month under the same rule. How much will your pension rise in January 2027? ${link(PENSION_CALC.en, "Work out the 2027 pension increase")}. Not retired yet? ${link(RETIREMENT.en, "Work out when you can retire")}.`,
      caption: "Legal deadline for paying Social Security pensions and the IMV",
      headers: ["Payment month", "At the latest", "Extra payment"],
      note: "This is the deadline in the regulation, not your bank's date: many banks credit the money a few days earlier.",
    },
    extras: {
      heading: "Extra payments: June and November (Clases Pasivas: June and December)",
      texts: [
        `Contributory Social Security pensions come with two extra payments (pagas extraordinarias) that accrue in June and November and are paid with the pension for those months. Pensions for a work accident or an occupational disease have them **spread** across the 12 monthly payments. ${link(U.imserso, "Non-contributory pensions")} also get an extra payment in June and November (${link(U.lgss, "General Social Security Act")}, art. 46.2). The Minimum Living Income has no extra payments.`,
        `**Clases Pasivas pensions** (for state civil servants) work differently: the payment order is issued from the 25th of each month, except in December, when it is brought forward (${link(U.pasivasFaq, "Social Security")}), and their extra payments come in **June and December** (${link(U.pasivas, "Royal Legislative Decree 670/1987")}).`,
        `On a payroll? Your Christmas extra payment does not follow this calendar: the day and the amount are set by your collective agreement. ${link(EXTRA.en, "Work out your Christmas extra pay")}: gross, the part earned if you started this year, IRPF withheld and net.`,
      ],
    },
    bank: {
      heading: "Why does my bank pay me early?",
      text: `Because some banks choose to advance the money: they know the transfer is coming before they receive it and make it available a few days earlier, according to the ${link(U.bde, "Bank of Spain")}. It is each bank's decision, not an official date: if your bank does not pay early, the legal deadline is the one in the table.`,
      items: [
        `Non-contributory pensions are paid by the Social Security Treasury, except in Navarre and the Basque Country, which manage their own. ${link(PNC.en, "Work out how much non-contributory pension you would get")}.`,
        "This calendar does not apply to company payrolls or to regional benefits.",
        `Nor to sick leave: as a rule your employer pays it in your payslip, on the same schedule as your salary (“pago delegado”). ${link(SICK.en, "Work out your sick pay in Spain")}.`,
      ],
      payroll: `To see what your payslip will show, use the ${link(NET.en, "net salary calculator")}; final settlement, severance pay and rent increases are in the ${link(HUB.en, "calculators")}.`,
    },
    faq: (dec) => [
      { question: "What day is unemployment benefit paid in Spain in December 2026?", answer: `On ${dec}: SEPE pays on the 10th of each month, or on the next business day if the 10th is a holiday.` },
      { question: "When are pensions paid in Spain?", answer: "By the first business day of each month at the latest, and never after the 4th. Many banks pay a few days early; that depends on each bank." },
      { question: "When is the extra pension payment paid?", answer: "With the June and November monthly payments. For Clases Pasivas pensions, in June and December. The Minimum Living Income has no extra payments." },
    ],
  },
};


/** 25 Nov 2026 additions: the source on the first screen, "10th on a weekend", where to see your payroll, the first pension payment. */
interface NovCopy {
  sourceTitle: (readOn: string) => string;
  sourceText: string;
  moved: { heading: string; text: (list: string, n: number) => string; where: string };
  first: { heading: string; text: string };
  faq: (jan: string) => { question: string; answer: string }[];
}

const NOV25: Record<Locale, NovCopy> = {
  es: {
    sourceTitle: (readOn) => `SEPE, leído el ${readOn}`,
    sourceText: `«${SEPE_QUOTE}»`,
    moved: {
      heading: "¿Qué día cobro el paro si el 10 cae en sábado, domingo o festivo?",
      text: (list, n) =>
        `Si el 10 es festivo, el ${link(U.sepe, "SEPE")} paga «el primer día hábil siguiente». El SEPE lo establece para los festivos; la tabla aplica la misma regla cuando el 10 cae en sábado o domingo, y hasta diciembre de 2027 pasa ${n} veces: ${list}. El SEPE no dice qué festivos autonómicos o locales cuentan: si el tuyo cae en 10, mira la fecha en tu Área Personal.`,
      where:
        "¿Dónde ves tu pago? El SEPE indica que puedes consultar la nómina de prestaciones en tu Área Personal, con DNI o certificado electrónico, Cl@ve permanente o un PIN telefónico que te envía al móvil. La tabla de arriba es la regla general; tu nómina es la de tu caso.",
    },
    first: {
      heading: "¿Cuándo se cobra la primera pensión?",
      text: `La tabla vale para los pagos mensuales que siguen al primero. El ${link(U.rd696, "Real Decreto 696/2018")}, art. 24.2, empieza así: «una vez efectuado su primer pago, los importes de los sucesivos pagos mensuales de las pensiones […] deberán figurar en la cuenta […] el primer día hábil del mes en que se realice el pago y, como máximo, el cuarto día natural de dicho mes». Para el primer cobro esa norma no fija un día: su art. 24.1 remite a las reglas especiales que dicte el Ministerio de Trabajo.`,
    },
    faq: (jan) => [
      { question: "¿Qué día se cobra el paro en enero de 2027?", answer: `El ${jan}: el 10 de enero cae en domingo y aplicamos la regla del SEPE para los festivos, el primer día hábil siguiente.` },
      { question: "¿Qué pasa si el día 10 del paro cae en fin de semana o festivo?", answer: "El SEPE lo dice para los festivos: paga el primer día hábil siguiente. Para los sábados y domingos la tabla aplica la misma regla, porque no hemos encontrado un texto oficial que los mencione; el SEPE tampoco dice qué festivos autonómicos o locales cuentan." },
      { question: "¿Dónde puedo ver cuándo me pagan el paro?", answer: "En tu Área Personal del SEPE, con DNI o certificado electrónico, Cl@ve permanente o un PIN telefónico: ahí consultas tu nómina de prestaciones." },
      { question: "¿Cuándo se cobra la primera pensión?", answer: "La norma fija el primer día hábil del mes (como máximo el día 4) para los pagos mensuales posteriores al primero. Para el primer cobro no fija un día: remite a las reglas especiales del Ministerio de Trabajo (RD 696/2018, art. 24)." },
    ],
  },
  ca: {
    sourceTitle: (readOn) => `SEPE, llegit el ${readOn}`,
    sourceText: `El SEPE ho diu així, en castellà: «${SEPE_QUOTE}»`,
    moved: {
      heading: "Quin dia cobro l'atur si el 10 cau en dissabte, diumenge o festiu?",
      text: (list, n) =>
        `Si el 10 és festiu, el ${link(U.sepe, "SEPE")} paga el primer dia hàbil següent. El SEPE ho estableix per als festius; la taula aplica la mateixa regla quan el 10 cau en dissabte o diumenge, i fins al desembre de 2027 passa ${n} vegades: ${list}. El SEPE no diu quins festius autonòmics o locals compten: si el teu cau en 10, mira la data a la teva Àrea Personal.`,
      where:
        "On veus el teu pagament? El SEPE indica que pots consultar la nòmina de prestacions a la teva Àrea Personal, amb DNI o certificat electrònic, Cl@ve permanent o un PIN telefònic que t'envia al mòbil. La taula de dalt és la regla general; la teva nòmina és la del teu cas.",
    },
    first: {
      heading: "Quan es cobra la primera pensió?",
      text: `La taula val per als pagaments mensuals que segueixen el primer. El ${link(U.rd696, "Reial decret 696/2018")}, art. 24.2, comença així: una vegada fet el primer pagament, els imports dels pagaments mensuals successius de les pensions han de figurar al compte el primer dia hàbil del mes en què es faci el pagament i, com a màxim, el quart dia natural d'aquell mes. Per al primer cobrament aquesta norma no fixa cap dia: l'art. 24.1 remet a les regles especials que dicti el Ministeri de Treball.`,
    },
    faq: (jan) => [
      { question: "Quin dia es cobra l'atur el gener de 2027?", answer: `El ${jan}: el 10 de gener cau en diumenge i apliquem la regla del SEPE per als festius, el primer dia hàbil següent.` },
      { question: "Què passa si el dia 10 de l'atur cau en cap de setmana o festiu?", answer: "El SEPE ho diu per als festius: paga el primer dia hàbil següent. Per als dissabtes i diumenges la taula aplica la mateixa regla, perquè no hem trobat cap text oficial que els esmenti; el SEPE tampoc no diu quins festius autonòmics o locals compten." },
      { question: "On puc veure quan em paguen l'atur?", answer: "A la teva Àrea Personal del SEPE, amb DNI o certificat electrònic, Cl@ve permanent o un PIN telefònic: allà consultes la teva nòmina de prestacions." },
      { question: "Quan es cobra la primera pensió?", answer: "La norma fixa el primer dia hàbil del mes (com a màxim el dia 4) per als pagaments mensuals posteriors al primer. Per al primer cobrament no fixa cap dia: remet a les regles especials del Ministeri de Treball (RD 696/2018, art. 24)." },
    ],
  },
  en: {
    sourceTitle: (readOn) => `SEPE, read on ${readOn}`,
    sourceText: `SEPE's own words, in Spanish: «${SEPE_QUOTE}»`,
    moved: {
      heading: "What day is unemployment benefit paid if the 10th is a Saturday, Sunday or holiday?",
      text: (list, n) =>
        `If the 10th is a holiday, ${link(U.sepe, "SEPE")} pays on the next business day. SEPE states that for holidays; the table applies the same rule when the 10th falls on a Saturday or Sunday, which happens ${n} times up to December 2027: ${list}. SEPE does not say which regional or local holidays count: if yours falls on the 10th, check the date in your personal area.`,
      where:
        "Where do you see your payment? SEPE says you can check your benefit payroll (nómina de prestaciones) in your Área Personal, with your DNI or electronic certificate, Cl@ve permanente or a phone PIN it sends to your mobile. The table above is the general rule; your payroll is your own case.",
    },
    first: {
      heading: "When is the first pension paid?",
      text: `The table applies to the monthly payments after the first. ${link(U.rd696, "Royal Decree 696/2018")}, art. 24.2, begins: once the first payment has been made, the successive monthly payments of pensions must be in the account on the first business day of the month in which they are paid and, at the latest, on the fourth calendar day of that month. For the first payment that rule sets no day: art. 24.1 refers to the special rules the Ministry of Labour issues.`,
    },
    faq: (jan) => [
      { question: "What day is unemployment benefit paid in Spain in January 2027?", answer: `On ${jan}: the 10th of January is a Sunday, so we apply SEPE's holiday rule, the next business day.` },
      { question: "What happens if the 10th falls on a weekend or a holiday?", answer: "SEPE states it for holidays: it pays on the next business day. For Saturdays and Sundays the table applies the same rule, because we found no official text that mentions them; SEPE does not say which regional or local holidays count either." },
      { question: "Where can I see when my unemployment benefit is paid?", answer: "In your SEPE Área Personal, with your DNI or electronic certificate, Cl@ve permanente or a phone PIN: your benefit payroll is there." },
      { question: "When is the first Spanish pension paid?", answer: "The rule sets the first business day of the month (the 4th at the latest) for the monthly payments after the first. For the first payment it sets no day: it refers to the Ministry of Labour's special rules (RD 696/2018, art. 24)." },
    ],
  },
};

/** The payment days up to December 2027 moved off a weekend, "lunes 11 de enero, lunes 12 de abril". */
function movedMonths(L: Locale): { text: string; n: number } {
  const moved = SPAN.filter(([y, m]) => !sepeDay(y, m).endsWith("-10"));
  return { text: moved.map(([y, m]) => words(sepeDay(y, m), L)).join(", "), n: moved.length };
}

export function buildPayBody(locale: Locale = "es"): Block[] {
  const L = locale;
  const t = COPY[L];
  const sepeRows = SPAN.map(([y, m]) => {
    const d = sepeDay(y, m);
    return [monthYear(y, m, L), `**${words(d, L)}**${d.endsWith("-10") ? "" : t.weekend}`, coveredMonth(y, m, L)];
  });
  const pensionRows = SPAN.map(([y, m]) => {
    const d = pensionDeadline(y, m);
    const extra = m === 6 || m === 11 ? t.extra : "";
    return [monthYear(y, m, L), `**${words(d, L)}**`, extra];
  });
  const dec = words(sepeDay(2026, 12), L);
  const x = NOV25[L];
  const mv = movedMonths(L);
  return [
    lead(t.lead(dec)),
    callout("official", x.sourceTitle(longDay(SEPE_READ_ON, L)), x.sourceText),
    ...h2(t.sepe.heading, t.sepe.text),
    table(t.sepe.caption, t.sepe.headers, sepeRows, t.sepe.note),
    ...h2(x.moved.heading, x.moved.text(mv.text, mv.n), x.moved.where),
    ...h2(t.pensions.heading, t.pensions.text),
    table(t.pensions.caption, t.pensions.headers, pensionRows, t.pensions.note),
    ...h2(x.first.heading, x.first.text),
    ...h2(t.extras.heading, ...t.extras.texts),
    ...h2(t.bank.heading),
    ...paras(t.bank.text),
    list(...t.bank.items),
    ...paras(t.bank.payroll),
    faq([...t.faq(dec), ...x.faq(words(sepeDay(2027, 1), L))]),
  ];
}

const SOURCES: B2Source[] = [
  { name: "¿Cuándo se abona la nómina de prestaciones del SEPE?", url: U.sepe, publisher: "SEPE" },
  { name: "Real Decreto 625/1985, desarrolla la Ley 31/1984 de Protección por Desempleo, art. 26 (texto consolidado)", url: U.rd625, publisher: "BOE" },
  { name: "Real Decreto 696/2018, Reglamento General de la Gestión Financiera de la Seguridad Social (BOE 30/06/2018)", url: U.rd696, publisher: "BOE" },
  { name: "TARGET closing days", url: U.ecb, publisher: "Banco Central Europeo" },
  { name: "Texto refundido de la Ley General de la Seguridad Social (RDL 8/2015)", url: U.lgss, publisher: "BOE" },
  { name: "Ley 19/2021, Ingreso Mínimo Vital", url: U.imv, publisher: "BOE" },
  { name: "Real Decreto Legislativo 670/1987, Clases Pasivas del Estado", url: U.pasivas, publisher: "BOE" },
  { name: "Clases Pasivas: fecha de pago", url: U.pasivasFaq, publisher: "Seguridad Social" },
  { name: "Pensiones no contributivas", url: U.imserso, publisher: "IMSERSO" },
  { name: "¿Sabes cuál es la fecha de cobro de tu pensión?", url: U.bde, publisher: "Banco de España" },
];

const DEC = (L: Locale) => words(sepeDay(2026, 12), L);

const META: Record<Locale, Omit<B2Edition, "path" | "blocks">> = {
  es: {
    title: "Cuándo se cobra el paro y la pensión: calendario de pagos 2026 y 2027",
    seoTitle: "Cuándo se cobra el paro y la pensión: días de pago 2027",
    seoDescription: `Paro: el día 10 de cada mes (diciembre: ${DEC("es")}). Pensiones e IMV: como tarde el primer día hábil. Calendario hasta diciembre de 2027.`,
    excerpt: "Qué día se cobra el paro (SEPE), la pensión de la Seguridad Social, el IMV y las pagas extra: el calendario mes a mes hasta diciembre de 2027, con la norma oficial.",
  },
  ca: {
    title: "Quan es cobra l'atur i la pensió: calendari de pagaments 2026 i 2027",
    seoTitle: "Quan es cobra l'atur i la pensió: dies de pagament 2027",
    seoDescription: `Atur: el dia 10 de cada mes (desembre: ${DEC("ca")}). Pensions i IMV: com a molt tard el primer dia hàbil. Calendari fins al desembre de 2027.`,
    excerpt: "Quin dia es cobra l'atur (SEPE), la pensió de la Seguretat Social, l'IMV i les pagues extra: el calendari mes a mes fins al desembre de 2027, amb la norma oficial.",
  },
  en: {
    title: "When are unemployment benefit and pensions paid in Spain? Payment dates for 2026 and 2027",
    seoTitle: "When are unemployment benefit and pensions paid in Spain?",
    seoDescription: `Unemployment benefit (paro): the 10th of each month (December: ${DEC("en")}). Pensions and IMV: by the first business day. Dates to December 2027.`,
    excerpt: "The day unemployment benefit (SEPE), Social Security pensions, the IMV and the extra payments are paid in Spain: the month-by-month calendar to December 2027, with the official rule.",
  },
};

export const PAY_DATES: B2Article = {
  key: "payDates",
  entryKey: "guide-payment-dates-unemployment-pensions-spain",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "pagos-oficina-sepe-malaga",
  heroAlt: {
    ca: "Entrada d'una oficina del SEPE a Màlaga",
    es: "Entrada de una oficina del SEPE en Málaga",
    en: "Entrance to a SEPE public employment office in Málaga",
  },
  heroCaption: {
    ca: "Oficina del SEPE a Màlaga.",
    es: "Oficina del SEPE en Málaga.",
    en: "A SEPE office in Málaga.",
  },
  verifiedAt: PAY_DATES_AS_OF,
  publishedAt: "2026-11-09T18:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.payDates[locale], ...META[locale], blocks: buildPayBody(locale) }]),
  ) as B2Article["editions"],
};
