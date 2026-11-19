/**
 * The prize programme the El Niño lottery checker ("Comprobar Lotería del
 * Niño 2027") applies: the rules, the known 2027 facts, the BOE's 2011
 * programme and the validation of SELAE's 2027 one. Client-safe and
 * data-free (the 2027 JSON is loaded by programme-data.ts, server-side): the
 * checker in the browser, the page, the build script and the tests read it.
 *
 * ## What is known for 2027 (SELAE, read 31 Oct 2026)
 *
 * SELAE's Lotería Nacional page, read on 31 Oct 2026 for the prize tax
 * calculator and the Christmas lottery guide: the Sorteo Extraordinario de El
 * Niño is on Wednesday 6 January 2027, décimos of 20 €, first prize
 * "2.000.000 € a la serie" (200,000 € a décimo). Nothing else of the 2027
 * programme has been read: SELAE answers 403 to the server since 13 Nov 2026
 * (re-tested 19 Nov, also SELAE's PDF of the first-quarter 2027 Saturday
 * programmes, SELAE_PROGRAMME_URL below, whose title a web search shows).
 *
 * ## The 2027 programme: programme-2027.json, null until someone reads it
 *
 * Counts and amounts of every category come only from SELAE's 2027 programme.
 * (loaded by programme-data.ts, server-side). Until a person reads that PDF (a browser on the owner's PC, or
 * `scripts/gordo-snapshot.py fetch --game nino` there) and transcribes the
 * Niño page into programme-2027.json, the page prints the first prize only
 * and the checker cannot run; a test fails from CONFIRM_BY while it is null.
 * `scripts/gordo-snapshot.py programme --game nino --dir <dir>` then checks
 * every figure of the JSON against the PDF's text.
 *
 * ## Which numbers get each derived prize: the BOE's wording (2011)
 *
 * The BOE stopped publishing Lotería Nacional programmes after March 2011.
 * The last El Niño programme it published, BOE-A-2010-20031 (Resolución de 23
 * de diciembre de 2010, for the draw of 6 January 2011), read on 19 Nov 2026,
 * defines the draw (five drums, one per digit, ten balls each; extractions of
 * five, three and two digits), the aproximaciones (number before and after,
 * 00000/99999 wrap), the centenas, the terminaciones, the reintegro and two
 * special one-digit reintegro extractions, each derived prize excluding the
 * number it derives from: QUOTE below, verbatim. BOE_2011 is that programme
 * as data: the tests run the engine on it and get its 37,812 prizes and
 * 14,000,000 € per series. The page shows those rules as "pendiente de
 * confirmar" for 2027 and never prints the 2011 amounts as 2027's.
 */

export const NINO_YEAR = 2027;
export const DRAW_DATE = "2027-01-06";

export const NUMBER_COUNT = 100_000;
/** SELAE (31 Oct 2026): décimos of 20 €; the first prize per series (billete) is ten times the décimo's. */
export const DECIMO_PRICE = 20;
export const DECIMOS_PER_BILLETE = 10;
export const BILLETE_PRICE = DECIMO_PRICE * DECIMOS_PER_BILLETE;
/** SELAE's Lotería Nacional page, 31 Oct 2026: "2.000.000 € a la serie". */
export const FIRST_PER_BILLETE = 2_000_000;

/** When SELAE's Lotería Nacional page (date, décimo, first prize) was read. */
export const SELAE_PAGE_READ = "2026-10-31";
/** When the BOE's last El Niño programme (the wording of the derived prizes) was read. */
export const BOE_READ = "2026-11-19";

/** From this day a test fails while the 2027 programme is not in programme-2027.json (nine days before the draw). */
export const CONFIRM_BY = "2026-12-28";

/** SELAE's first-quarter 2027 Saturday programmes (El Niño is a Wednesday draw of the Saturday series in SELAE's files). */
export const SELAE_PROGRAMME_URL =
  "https://www.loteriasyapuestas.es/f/loterias/documentos/Loter%C3%ADa%20Nacional/programas%20de%20premios/PROGRAMAS_PREMIOS_PRIMER_TRIMESTRE_2027_SABADOS.pdf";

export const SOURCES = {
  selaeLnac: {
    name: "Lotería Nacional: próximos sorteos (Sorteo Extraordinario de El Niño, 6 de enero de 2027)",
    url: "https://www.loteriasyapuestas.es/es/loteria-nacional",
    publisher: "SELAE",
    read: SELAE_PAGE_READ,
  },
  selaeProgramme: {
    name: "Programas de premios, primer trimestre de 2027, sábados (Sorteo Extraordinario de El Niño)",
    url: SELAE_PROGRAMME_URL,
    publisher: "SELAE",
    read: null,
  },
  boe2011: {
    name: "Resolución de 23 de diciembre de 2010, de Loterías y Apuestas del Estado, por la que se publica el programa de premios para el sorteo Extraordinario que se ha de celebrar el día 6 de enero de 2011",
    url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2010-20031",
    publisher: "BOE",
    ref: "BOE-A-2010-20031, BOE núm. 316, de 29 de diciembre de 2010",
    read: BOE_READ,
  },
} as const;

/** BOE-A-2010-20031, verbatim (Spanish). */
export const QUOTE = {
  drums:
    "Para la ejecución de este sorteo se utilizarán como mínimo cinco bombos que, de izquierda a derecha, representan, las decenas de millar, unidades de millar, centenas, decenas y unidades. Cada uno de ellos contendrá diez bolas numeradas del 0 al 9.",
  endings:
    "Se utilizarán dos bombos para la determinación de los premios de 400 euros que se adjudicarán, respectivamente, a aquellos billetes cuyas dos últimas cifras sean iguales y estén igualmente dispuestas que las de los números extraídos.",
  derive: "De los números formados por las extracciones de cinco cifras correspondientes a los premios primero y segundo se derivarán las aproximaciones, las centenas, las terminaciones y el reintegro, según se detalla en el programa de premios.",
  wrap: "Con respecto a las aproximaciones señaladas para los números anterior y posterior de los premios primero y segundo, se entenderá que si saliese premiado, en cualquiera de ellos, el número 00000, su anterior es el 99999 y el siguiente el 00001. Asimismo si el agraciado fuese el 99999, su anterior es el 99998 y el 00000 será el siguiente.",
  hundreds:
    "Para la aplicación de los premios de centena se entenderá que si cualquiera de los premios primero o segundo correspondiera, por ejemplo, al número 00025, se considerarán agraciados los 99 números restantes de la misma; es decir, desde el 00000 al 00024 y desde el 00026 al 00099.",
  except: "De los premios de centenas, terminaciones y reintegro ha de entenderse que quedan exceptuados los números de los que, respectivamente se deriven, agraciados con los premios primero y segundo.",
  special: "Asimismo tendrán derecho al reintegro de su precio todos los billetes cuya última cifra coincida con las que se obtengan en las dos extracciones especiales, que se realizarán del bombo de las unidades.",
  list: "Efectuado el sorteo se expondrán al público la lista oficial de las extracciones realizadas y la lista acumulada ordenada por terminaciones.",
} as const;

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

export type TopKey = "first" | "second" | "third";
export type Digits = 1 | 2 | 3 | 4 | 5;

export type NinoCategory =
  /** A named five-digit prize (first, second, third): one extraction each. */
  | { id: TopKey; kind: "top"; count: number; perBillete: number }
  /** Extractions of `digits` digits: every billete ending in those digits wins (5 = the whole number). */
  | { id: string; kind: "extraction"; digits: Digits; extractions: number; count: number; perBillete: number }
  /** The number before and after a top prize. */
  | { id: string; kind: "approx"; from: TopKey; count: number; perBillete: number }
  /** The other 99 numbers of a top prize's hundred. */
  | { id: string; kind: "hundred"; from: TopKey; count: number; perBillete: number }
  /** Billetes with a top prize's last `digits` digits, the prize itself excepted (1 = the reintegro). */
  | { id: string; kind: "ending"; from: TopKey; digits: Exclude<Digits, 5>; count: number; perBillete: number };

export interface NinoProgramme {
  schema: 1;
  year: number;
  drawDate: string;
  /** Series of 100,000 billetes. */
  series: number;
  billetePrice: number;
  decimoPrice: number;
  prizesPerSeries: number;
  eurosPerSeries: number;
  categories: NinoCategory[];
  /** Where the figures were copied from (SELAE's programme PDF, its page and date line). */
  source: { name: string; url: string; ref: string; page: number | null };
  /** Who read it, when and how. */
  confirmed: { read: string; how: string };
}

/** The id each category must carry: one per kind, digits and top prize. */
export function categoryId(c: NinoCategory): string {
  switch (c.kind) {
    case "top":
      return c.id;
    case "extraction":
      return `x${c.digits}`;
    case "approx":
      return `approx-${c.from}`;
    case "hundred":
      return `hundred-${c.from}`;
    case "ending":
      return `end${c.digits}-${c.from}`;
  }
}

/** How many of 100,000 numbers one category pays, by the BOE's rules (the tests and the JSON check use it). */
export function expectedCount(c: NinoCategory): number {
  switch (c.kind) {
    case "top":
      return 1;
    case "extraction":
      return c.extractions * 10 ** (5 - c.digits);
    case "approx":
      return 2;
    case "hundred":
      return 99;
    case "ending":
      return 10 ** (5 - c.digits) - 1;
  }
}

/**
 * BOE-A-2010-20031: the El Niño programme of 6 January 2011, as published
 * (60 series of 100,000 billetes at 200 €; 37,812 prizes and 14,000,000 € per
 * series). Historical: the rules' reference and the engine's test, never
 * printed as 2027's amounts.
 */
export const BOE_2011: NinoProgramme = {
  schema: 1,
  year: 2011,
  drawDate: "2011-01-06",
  series: 60,
  billetePrice: 200,
  decimoPrice: 20,
  prizesPerSeries: 37_812,
  eurosPerSeries: 14_000_000,
  categories: [
    { id: "first", kind: "top", count: 1, perBillete: 2_000_000 },
    { id: "second", kind: "top", count: 1, perBillete: 1_000_000 },
    { id: "x5", kind: "extraction", digits: 5, extractions: 12, count: 12, perBillete: 14_000 },
    { id: "x3", kind: "extraction", digits: 3, extractions: 14, count: 1_400, perBillete: 1_000 },
    { id: "x2", kind: "extraction", digits: 2, extractions: 5, count: 5_000, perBillete: 400 },
    { id: "approx-first", kind: "approx", from: "first", count: 2, perBillete: 12_600 },
    { id: "approx-second", kind: "approx", from: "second", count: 2, perBillete: 6_000 },
    { id: "hundred-first", kind: "hundred", from: "first", count: 99, perBillete: 1_000 },
    { id: "hundred-second", kind: "hundred", from: "second", count: 99, perBillete: 1_000 },
    { id: "end3-first", kind: "ending", from: "first", digits: 3, count: 99, perBillete: 1_000 },
    { id: "end3-second", kind: "ending", from: "second", digits: 3, count: 99, perBillete: 1_000 },
    { id: "end2-first", kind: "ending", from: "first", digits: 2, count: 999, perBillete: 1_000 },
    { id: "end1-first", kind: "ending", from: "first", digits: 1, count: 9_999, perBillete: 200 },
    { id: "x1", kind: "extraction", digits: 1, extractions: 2, count: 20_000, perBillete: 200 },
  ],
  source: { name: SOURCES.boe2011.name, url: SOURCES.boe2011.url, ref: SOURCES.boe2011.ref, page: null },
  confirmed: { read: BOE_READ, how: "BOE-A-2010-20031 read on boe.es (txt.php), every line transcribed" },
};

const OFFICIAL_PROGRAMME_HOSTS = ["www.loteriasyapuestas.es", "www.selae.es"];

/** What is wrong with a programme; empty when the checker can run on it. */
export function programmeProblems(input: unknown, { year = NINO_YEAR, drawDate = DRAW_DATE, hosts = OFFICIAL_PROGRAMME_HOSTS }: { year?: number; drawDate?: string; hosts?: string[] } = {}): string[] {
  if (input === null || typeof input !== "object" || Array.isArray(input)) return ["the programme is not an object"];
  const p = input as Partial<NinoProgramme>;
  const out: string[] = [];
  if (p.schema !== 1) out.push("schema must be 1");
  if (p.year !== year) out.push(`year must be ${year}`);
  if (p.drawDate !== drawDate) out.push(`drawDate must be ${drawDate}`);
  if (!(Number.isInteger(p.series) && p.series! > 0)) out.push("series must be a positive whole number");
  if (p.decimoPrice !== DECIMO_PRICE || p.billetePrice !== BILLETE_PRICE) out.push(`décimo ${DECIMO_PRICE} € and billete ${BILLETE_PRICE} € (SELAE, ${SELAE_PAGE_READ})`);
  const cats = Array.isArray(p.categories) ? p.categories : [];
  if (!cats.length) out.push("no categories");
  const ids = new Set<string>();
  const tops = new Set(cats.filter((c) => c?.kind === "top").map((c) => c.id));
  for (const c of cats) {
    const want = categoryId(c);
    if (c.kind === "top" && !["first", "second", "third"].includes(c.id)) out.push(`top prize ${c.id} is not first, second or third`);
    if (c.id !== want) out.push(`category ${c.id} must be called ${want}`);
    if (ids.has(c.id)) out.push(`category ${c.id} appears twice`);
    ids.add(c.id);
    if ("from" in c && !tops.has(c.from)) out.push(`${c.id} derives from ${c.from}, which is not a top prize`);
    if (c.kind === "extraction" && !(Number.isInteger(c.extractions) && c.extractions > 0 && [1, 2, 3, 4, 5].includes(c.digits))) out.push(`${c.id}: bad digits or extractions`);
    if (c.kind === "ending" && ![1, 2, 3, 4].includes(c.digits)) out.push(`${c.id}: bad digits`);
    if (!(c.perBillete > 0)) out.push(`${c.id}: perBillete must be positive`);
    if (c.count !== expectedCount(c)) out.push(`${c.id}: count ${c.count}, the rules give ${expectedCount(c)}`);
  }
  if (!tops.has("first")) out.push("no first prize");
  const first = cats.find((c) => c.id === "first");
  if (year === NINO_YEAR && first && first.perBillete !== FIRST_PER_BILLETE) out.push(`first prize ${first.perBillete}, SELAE's page says ${FIRST_PER_BILLETE} a la serie`);
  const prizes = cats.reduce((a, c) => a + c.count, 0);
  const euros = cats.reduce((a, c) => a + c.count * c.perBillete, 0);
  if (prizes !== p.prizesPerSeries) out.push(`categories add up to ${prizes} prizes, the programme prints ${p.prizesPerSeries}`);
  if (euros !== p.eurosPerSeries) out.push(`categories add up to ${euros} €, the programme prints ${p.eurosPerSeries}`);
  try {
    const u = new URL(String(p.source?.url));
    if (u.protocol !== "https:" || !hosts.includes(u.host)) out.push(`source ${u.host} is not ${hosts.join(" or ")}`);
  } catch {
    out.push("source.url is not a URL");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(p.confirmed?.read ?? "")) || String(p.confirmed?.how ?? "").length < 10) out.push("confirmed needs read (YYYY-MM-DD) and how");
  return out;
}

/** A programme file's content, validated: null stays null, anything wrong throws (the build and the tests fail loudly). */
export function loadProgramme(input: unknown): NinoProgramme | null {
  if (input === null) return null;
  const problems = programmeProblems(input);
  if (problems.length) throw new Error(`nino programme-2027.json refused: ${problems.join("; ")}`);
  return input as NinoProgramme;
}

export function category(p: NinoProgramme, id: string): NinoCategory | undefined {
  return p.categories.find((c) => c.id === id);
}

export const perDecimo = (c: NinoCategory, p: NinoProgramme) => c.perBillete / (p.billetePrice / p.decimoPrice);
export const perEuro = (c: NinoCategory, p: NinoProgramme) => c.perBillete / p.billetePrice;
