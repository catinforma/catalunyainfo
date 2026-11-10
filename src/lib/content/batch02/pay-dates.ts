import type { Block } from "@/lib/content/blocks";
import { boeRegionsOn2026 } from "@/lib/programmatic/holidays/boe-2026";
import { boeRegionsOn } from "@/lib/programmatic/holidays/boe-2027";

import { faq, h2, lead, list, paras, table, type B2Source, type B2SpanishArticle } from "./shared";

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
 */
export const PAY_DATES_AS_OF = "2026-11-09";

const TARGET_CLOSED = new Set(["2026-01-01", "2026-04-03", "2026-04-06", "2026-05-01", "2026-12-25", "2026-12-26", "2027-01-01", "2027-03-26", "2027-03-29", "2027-05-01", "2027-12-25", "2027-12-26"]);
const MADRID_LOCAL = new Set(["2026-05-15", "2026-11-09", "2027-05-15", "2027-11-09"]);
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const U = {
  sepe: "https://www.sepe.es/HomeSepe/preguntas-frecuentes/detalle-pregunta.html?detail=%2Fpreguntas%2Fprestaciones-por-desempleo%2Fpago-y-cuant-a%2Fcuando-se-abona-la-nomina-de-prestaciones-del-sepe",
  rd696: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2018-9030",
  ecb: "https://www.ecb.europa.eu/ecb/contacts/working-hours/html/index.en.html",
  lgss: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724",
  imv: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-21007",
  pasivas: "https://www.boe.es/eli/es/rdlg/1987/04/30/670/con",
  pasivasFaq: "https://www.seg-social.es/wps/portal/wss/internet/FAQ/ae7d008e-a286-476f-8681-17ef191cac81/d88397b5-7cf0-4912-ba05-147fe51c3554/cpf56?temaPregunta=&view=FAQs_detalle_tema",
  imserso: "https://imserso.es/el-imserso/documentacion/estadisticas/pensiones-no-contributivas-jubilacion-incapacidad-pnc",
  bde: "https://clientebancario.bde.es/pcb/es/blog/sabes_cual_es_fecha_cobro_pension.html?blog=%2Fwebcb%2FBlog%2FCuentasDepositos",
} as const;
const link = (href: string, label: string) => `[${label}](${href})`;

const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const weekday = (s: string) => new Date(`${s}T12:00:00Z`).getUTCDay();
const words = (s: string) => {
  const [, m, d] = s.split("-").map(Number);
  return `${DAYS[weekday(s)]} ${d} de ${MONTHS[m! - 1]}`;
};

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

export function buildPayBody(): Block[] {
  const sepeRows = SPAN.map(([y, m]) => {
    const d = sepeDay(y, m);
    const prev = m === 1 ? `diciembre de ${y - 1}` : `${MONTHS[m - 2]}`;
    return [`${MONTHS[m - 1]} de ${y}`, `**${words(d)}**${d.endsWith("-10") ? "" : " (el 10 cae en fin de semana)"}`, `la de ${prev}`];
  });
  const pensionRows = SPAN.map(([y, m]) => {
    const d = pensionDeadline(y, m);
    const extra = m === 6 || m === 11 ? "Sí: paga extra" : "";
    return [`${MONTHS[m - 1]} de ${y}`, `**${words(d)}**`, extra];
  });
  const dec = sepeDay(2026, 12);
  return [
    lead(
      `**El paro (SEPE) se cobra el día 10 de cada mes**, o el siguiente día hábil si cae en festivo: en diciembre de 2026, el **${words(dec)}**. **Las pensiones de la Seguridad Social y el Ingreso Mínimo Vital** se pagan, como tarde, el **primer día hábil del mes** (y nunca después del día 4); muchos bancos las adelantan unos días. Aquí tienes el calendario hasta diciembre de 2027.`,
    ),
    ...h2(
      "Paro y subsidio: el día 10",
      `El SEPE paga la prestación y el subsidio por desempleo «el día 10 de cada mes» y, «si coincide que es festivo, el primer día hábil siguiente» (${link(U.sepe, "SEPE")}). Cada pago corresponde al mes anterior.`,
    ),
    table("Pago del paro y del subsidio (SEPE), diciembre 2026 – diciembre 2027", ["Mes del pago", "Día", "Prestación que se cobra"], sepeRows, "Solo se ha movido el día cuando el 10 cae en sábado o domingo; el SEPE no dice qué festivos autonómicos cuentan."),
    ...h2(
      "Pensiones e Ingreso Mínimo Vital: el primer día hábil",
      `El ${link(U.rd696, "Real Decreto 696/2018")} obliga a que las pensiones estén en la cuenta «el primer día hábil del mes en que se realice el pago y, como máximo, el cuarto día natural». Los días hábiles son los del calendario bancario europeo ${link(U.ecb, "TARGET")}, sin contar los festivos de la ciudad de Madrid. El ${link(U.imv, "Ingreso Mínimo Vital")} se paga cada mes con la misma regla.`,
    ),
    table("Fecha límite legal de pago de las pensiones de la Seguridad Social y del IMV", ["Mes del pago", "Como tarde", "Paga extra"], pensionRows, "Es el plazo de la norma, no la fecha de tu banco: muchas entidades adelantan el ingreso unos días."),
    ...h2(
      "Pagas extra: junio y noviembre (Clases Pasivas, junio y diciembre)",
      `Las pensiones contributivas de la Seguridad Social tienen «dos pagas extraordinarias que se devengan en los meses de junio y noviembre», que se cobran con la mensualidad de esos meses. Las pensiones por accidente de trabajo o enfermedad profesional las tienen **prorrateadas** en las 12 mensualidades. Las ${link(U.imserso, "pensiones no contributivas")} también tienen extra en junio y noviembre (${link(U.lgss, "Ley General de la Seguridad Social")}, art. 46.2). El Ingreso Mínimo Vital no tiene pagas extra.`,
      `Las **pensiones de Clases Pasivas** (funcionarios del Estado) son distintas: el pago se ordena «a partir del día 25 de cada mes», salvo en diciembre, que se adelanta (${link(U.pasivasFaq, "Seguridad Social")}), y sus pagas extra son en **junio y diciembre** (${link(U.pasivas, "Real Decreto Legislativo 670/1987")}).`,
    ),
    ...h2("¿Por qué mi banco me paga antes?"),
    ...paras(
      `Porque algunas entidades deciden adelantar el dinero: conocen la transferencia antes de recibirla y la ponen a tu disposición unos días antes, según el ${link(U.bde, "Banco de España")}. Es una decisión de cada banco, no una fecha oficial: si tu banco no adelanta, el plazo legal es el de la tabla.`,
    ),
    list(
      "Las pensiones no contributivas las paga la Tesorería de la Seguridad Social, salvo en Navarra y el País Vasco, que las gestionan ellos.",
      "Este calendario no sirve para nóminas de empresa ni para ayudas autonómicas.",
    ),
    faq([
      { question: "¿Qué día se cobra el paro en diciembre de 2026?", answer: `El ${words(dec)}, porque el SEPE paga el día 10 de cada mes, o el siguiente día hábil si es festivo.` },
      { question: "¿Cuándo se cobra la pensión?", answer: "Como tarde el primer día hábil de cada mes, y nunca después del día 4. Muchos bancos la adelantan unos días; eso depende de cada entidad." },
      { question: "¿Cuándo se cobra la paga extra de las pensiones?", answer: "Con la mensualidad de junio y la de noviembre. En Clases Pasivas, en junio y diciembre. El Ingreso Mínimo Vital no tiene pagas extra." },
    ]),
  ];
}

const SOURCES: B2Source[] = [
  { name: "¿Cuándo se abona la nómina de prestaciones del SEPE?", url: U.sepe, publisher: "SEPE" },
  { name: "Real Decreto 696/2018, Reglamento General de la Gestión Financiera de la Seguridad Social (BOE 30/06/2018)", url: U.rd696, publisher: "BOE" },
  { name: "TARGET closing days", url: U.ecb, publisher: "Banco Central Europeo" },
  { name: "Texto refundido de la Ley General de la Seguridad Social (RDL 8/2015)", url: U.lgss, publisher: "BOE" },
  { name: "Ley 19/2021, Ingreso Mínimo Vital", url: U.imv, publisher: "BOE" },
  { name: "Real Decreto Legislativo 670/1987, Clases Pasivas del Estado", url: U.pasivas, publisher: "BOE" },
  { name: "Clases Pasivas: fecha de pago", url: U.pasivasFaq, publisher: "Seguridad Social" },
  { name: "Pensiones no contributivas", url: U.imserso, publisher: "IMSERSO" },
  { name: "¿Sabes cuál es la fecha de cobro de tu pensión?", url: U.bde, publisher: "Banco de España" },
];

export const PAY_DATES: B2SpanishArticle = {
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
  editions: {
    es: {
      path: "guias/cuando-se-cobra-paro-pension",
      title: "Cuándo se cobra el paro y la pensión: calendario de pagos 2026 y 2027",
      seoTitle: "Cuándo se cobra el paro y la pensión: días de pago 2027",
      seoDescription: `Paro: el día 10 de cada mes (diciembre: ${words(sepeDay(2026, 12))}). Pensiones e IMV: como tarde el primer día hábil. Calendario hasta diciembre de 2027.`,
      excerpt: "Qué día se cobra el paro (SEPE), la pensión de la Seguridad Social, el IMV y las pagas extra: el calendario mes a mes hasta diciembre de 2027, con la norma oficial.",
      blocks: buildPayBody(),
    },
  },
};
