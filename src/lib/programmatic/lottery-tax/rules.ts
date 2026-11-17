/**
 * Every rule and figure of the lottery prize tax calculator ("premios de
 * lotería: cuánto se queda Hacienda"), each with its source. Nothing numeric
 * is typed anywhere else: the engine, the page and the tests read from here.
 * Client-safe: no data files, no server code.
 *
 * ## Read on 17 Nov 2026 (curl + grep of the quoted text)
 *
 *  - BOE, Ley 35/2006 del IRPF (BOE-A-2006-20764), consolidated text
 *    "Última actualización publicada el 11/11/2026", disposición adicional
 *    trigésima tercera (#datrigesimatercera). The BOE open-data API lists
 *    three versions of the block; the one in force (5 Jul 2018, Ley 6/2018
 *    art. 67.1, BOE-A-2018-9268) says: the levy applies to each décimo,
 *    fracción, cupón or bet separately (33ª.1); exempt up to 40,000 euros,
 *    only the excess is taxed; full exemption needs a stake of at least
 *    0.50 euros, below that the exempt amount shrinks in proportion; shared
 *    prizes split the exempt amount by each co-holder's share (33ª.2); 20 %
 *    rate (33ª.4) and 20 % withholding on the same base (33ª.6); no return
 *    when withheld (33ª.7); not part of the IRPF taxable base (33ª.8). Who
 *    is covered (33ª.1.a): SELAE, the Autonomous Communities' bodies or
 *    entities, Cruz Roja, ONCE; 33ª.1.b: equivalent EU/EEA public or
 *    non-profit lotteries.
 *  - Agencia Tributaria:
 *     - Manual práctico de Renta 2025, "Gravamen especial sobre los premios de
 *       determinadas loterías y apuestas: cuantías exentas" (page updated
 *       17/03/2026): "En el ejercicio 2025 estarán exentos del gravamen
 *       especial los premios cuye importe íntegro sea igual o inferior a
 *       40.000 euros" (AEAT's typo "cuye" kept out of our quotes: we quote
 *       the BOE instead); other prizes are ganancias patrimoniales in the
 *       general base.
 *     - Notice "Premios del sorteo de la lotería de Navidad" (17/12/2024):
 *       SELAE withholds when paying; per décimo; 40,000 € exempt; the
 *       100,000 € example (12,000 € withheld, 88,000 € received); shared
 *       prizes and participaciones split the 40,000 € by percentage and the
 *       collector must be able to prove the split; no other return for IRPF
 *       taxpayers or non-residents once withheld.
 *     - Non-residents, "Gravamen especial sobre premios de loterías y
 *       apuestas" (DA 5ª Ley IRNR; page updated 02/10/2026): 40,000 € from
 *       1 Jan 2020, 20 %, payer files modelo 230 (and 270), the winner files
 *       modelo 136 only without withholding, treaty refund via modelo 210.
 *     - Procedure pages: modelo 136 (GH09, autoliquidación, updated
 *       09/06/2026) and modelo 230 (G235, the payer's withholdings, updated
 *       03/08/2026), both approved by Orden HAP/70/2013.
 *  - DOGC núm. 9640 (8.4.2026), Annex 3, read through the DOGC document API:
 *    La Grossa de Cap d'Any, draw on 31 Dec 2026, 10 € a ticket, prizes per
 *    ticket 200,000 € (first), 65,000 € (second), 30,000 € (third). No other
 *    holiday Grossa is in that agreement (Annex 1 La Diada, Annex 2 La
 *    Castanyada).
 *
 * ## Not re-read on 17 Nov 2026
 *
 * SELAE (loteriasyapuestas.es and selae.es) and loteriesdecatalunya.cat answer
 * 403 to the server (and to WebFetch). The Christmas prize amounts below are
 * SELAE's 2026 programme as read on 31 Oct 2026 (the PDF of the Q4 Saturday
 * programmes, dated 26 Jan 2026), the same figures the lottery guide prints
 * (tests/lottery-tax.test.ts keeps both in step); El Niño's first prize and
 * date come from SELAE's Lotería Nacional page, read the same day. El Niño's
 * other prizes are not printed: its 2027 programme could not be read.
 *
 * ## Do not print
 *
 * El Niño 2027's other prizes (programme unread); any 2027 change to DA 33ª
 * (none known); figures of the Basque and Navarre foral regimes (not read: the
 * page only says their own rules apply); modelo 136 deadlines (not read); a
 * claim that "La Grossa de Nadal" does not exist (the DOGC agreement for the
 * second half of 2026 simply has no such draw: Annex 1 La Diada, Annex 2 La
 * Castanyada, Annex 3 Cap d'Any).
 *
 * A test fails from RULES_UNTIL: re-read DA 33ª on the BOE (any 2027 change),
 * the AEAT pages, SELAE's 2027 programmes and the DOGC, then move both dates.
 */

export const RULES_AS_OF = "2026-11-17";
/** From this day a test fails: re-read the levy for 2027 and the draws' prize programmes. */
export const RULES_UNTIL = "2027-01-01";

/** The day SELAE's 2026 Christmas programme and Lotería Nacional page were last read (403 since 13 Nov). */
export const SELAE_READ = "2026-10-31";

/** DA 33ª.2: exempt part of each décimo's (ticket's, bet's) gross prize. */
export const EXEMPT_PER_TICKET = 40_000;
/** DA 33ª.4 and 33ª.6: rate of the levy and of the withholding, on the part above the exempt amount. */
export const RATE = 0.2;
/** DA 33ª.2: a décimo or bet of less than this keeps only a proportional part of the exempt amount. */
export const MIN_STAKE_FULL_EXEMPTION = 0.5;

export interface Source {
  name: string;
  url: string;
  publisher: string;
  /** Reference shown next to the name (BOE id, DOGC number, page date). */
  ref: string;
  /** ISO day we read it. */
  read: string;
}

export const SOURCES = {
  lirpf: {
    name: "Ley 35/2006, del Impuesto sobre la Renta de las Personas Físicas, disposición adicional trigésima tercera",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#datrigesimatercera",
    publisher: "BOE",
    ref: "BOE-A-2006-20764, texto consolidado actualizado el 11/11/2026",
    read: RULES_AS_OF,
  },
  aeatManual: {
    name: "Gravamen especial sobre los premios de determinadas loterías y apuestas: cuantías exentas (Manual práctico de Renta 2025)",
    url: "https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c02-irpf-cuestiones-generales/sujecion-irpf-aspectos-materiales/delimitacion-negativa-hecho-imponible-rentas-sujetas/gravamen-especial-sobre-premios-determinadas-apuestas.html",
    publisher: "Agencia Tributaria",
    ref: "página actualizada el 17/03/2026",
    read: RULES_AS_OF,
  },
  aeatNotice: {
    name: "Premios del sorteo de la lotería de Navidad",
    url: "https://sede.agenciatributaria.gob.es/Sede/todas-noticias/2024/diciembre/17/premios-sorteo-loteria-navidad.html",
    publisher: "Agencia Tributaria",
    ref: "17/12/2024",
    read: RULES_AS_OF,
  },
  aeatNonResidents: {
    name: "Gravamen especial sobre premios de loterías y apuestas (no residentes)",
    url: "https://sede.agenciatributaria.gob.es/Sede/no-residentes/irnr-sin-establecimiento-permanente/gravamen-especial-sobre-premios-loterias-apuestas.html",
    publisher: "Agencia Tributaria",
    ref: "página actualizada el 02/10/2026",
    read: RULES_AS_OF,
  },
  aeat136: {
    name: "Modelo 136. Gravamen especial sobre los premios de determinadas loterías y apuestas. Autoliquidación",
    url: "https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GH09.shtml",
    publisher: "Agencia Tributaria",
    ref: "Orden HAP/70/2013; página actualizada el 09/06/2026",
    read: RULES_AS_OF,
  },
  aeat230: {
    name: "Modelo 230. Retenciones e ingresos a cuenta del gravamen especial sobre los premios de determinadas loterías y apuestas",
    url: "https://sede.agenciatributaria.gob.es/Sede/procedimientoini/G235.shtml",
    publisher: "Agencia Tributaria",
    ref: "Orden HAP/70/2013; página actualizada el 03/08/2026",
    read: RULES_AS_OF,
  },
  selaeProgramme: {
    name: "Programa de premios del Sorteo Extraordinario de Navidad del 22 de diciembre de 2026",
    url: "https://www.loteriasyapuestas.es/f/loterias/documentos/Loter%C3%ADa%20Nacional/programas%20de%20premios/PROGRAMAS_PREMIOS_CUARTO_TRIMESTRE_2026_SABADOS.pdf",
    publisher: "SELAE",
    ref: "Madrid, 26 de enero de 2026",
    read: SELAE_READ,
  },
  selaeLnac: {
    name: "Lotería Nacional: próximos sorteos",
    url: "https://www.loteriasyapuestas.es/es/loteria-nacional",
    publisher: "SELAE",
    ref: "Sorteo Extraordinario de El Niño, 6 de enero de 2027",
    read: SELAE_READ,
  },
  dogcGrossa: {
    name: "Anunci de l'Acord del Consell d'Administració de Loteries de Catalunya, SAU, de 10 de desembre de 2025, sobre les característiques dels sortejos de La Loteria Passiva 2n semestre 2026 (annex 3, La Grossa de Cap d'Any)",
    url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1041354",
    publisher: "DOGC",
    ref: "DOGC núm. 9640, 8.4.2026",
    read: RULES_AS_OF,
  },
} as const satisfies Record<string, Source>;

/** Verbatim quotes (Spanish, as published), read on the dates in SOURCES. */
export const QUOTE = {
  /** DA 33ª.1.a: who is covered. */
  scope:
    "Los premios de las loterías y apuestas organizadas por la Sociedad Estatal Loterías y Apuestas del Estado y por los órganos o entidades de las Comunidades Autónomas, así como de los sorteos organizados por la Cruz Roja Española y de las modalidades de juegos autorizadas a la Organización Nacional de Ciegos Españoles.",
  /** DA 33ª.1, last paragraph. */
  perTicket: "El gravamen especial se exigirá de forma independiente respecto de cada décimo, fracción o cupón de lotería o apuesta premiados.",
  /** DA 33ª.2, first paragraph. */
  exempt:
    "Estarán exentos del gravamen especial los premios cuyo importe íntegro sea igual o inferior a 40.000 euros. Los premios cuyo importe íntegro sea superior a 40.000 euros se someterán a tributación respecto de la parte del mismo que exceda de dicho importe.",
  /** DA 33ª.2, second paragraph. */
  minStake:
    "Lo dispuesto en el párrafo anterior será de aplicación siempre que la cuantía del décimo, fracción o cupón de lotería, o de la apuesta efectuada, sea de al menos 0,50 euros. En caso de que fuera inferior a 0,50 euros, la cuantía máxima exenta señalada en el párrafo anterior se reducirá de forma proporcional.",
  /** DA 33ª.2, third paragraph. */
  shared: "En el supuesto de que el premio fuera de titularidad compartida, la cuantía exenta prevista en los párrafos anteriores se prorrateará entre los cotitulares en función de la cuota que les corresponda.",
  /** DA 33ª.6, second paragraph. */
  rate: "El porcentaje de retención o ingreso a cuenta será el 20 por ciento. La base de retención o ingreso a cuenta vendrá determinada por el importe de la base imponible del gravamen especial.",
  /** DA 33ª.7, second paragraph. */
  noReturn:
    "No obstante, no existirá obligación de presentar la citada autoliquidación cuando el premio obtenido hubiera sido de cuantía inferior al importe exento previsto en el apartado 2 anterior o se hubiera practicado retención o el ingreso a cuenta conforme a lo previsto en el apartado 6 anterior.",
  /** DA 33ª.8, first sentence. */
  notInBase: "No se integrarán en la base imponible del Impuesto los premios previstos en esta disposición adicional.",
  /** AEAT notice of 17 Dec 2024: who withholds. */
  payer:
    "los perceptores de estos premios, cualquiera que sea su naturaleza, en el momento del cobro, soportarán una retención o ingreso a cuenta que debe practicarles el organismo pagador del premio, es decir, la SELAE.",
  /** AEAT notice of 17 Dec 2024: the worked example. */
  example: "Así, por ejemplo un premio de 100.000 €, tributaría al 20% sobre 60.000 € (100.000 - 40.000), por lo que se practicaría una retención de 12.000 € y se percibirían 88.000 €.",
  /** AEAT notice of 17 Dec 2024: shared prizes and participaciones. */
  aeatShared:
    "En el caso de premios compartidos (grupo de amigos o parientes, peñas, cofradías...), en los que el premio se reparte entre todos los participantes, se deben distribuir los 40.000 € que están exentos, entre todos los beneficiarios en proporción a su porcentaje de participación, y quien proceda al reparto del premio que figure como beneficiario único (o como gestor de cobro) por haberlo manifestado así en el momento del cobro del premio, deberá estar en condiciones de acreditar ante la Administración Tributaria que el premio ha sido repartido a los titulares de participaciones, siendo por tanto necesaria la identificación de cada ganador así como de su porcentaje de participación.",
  /** AEAT notice of 17 Dec 2024: nothing else to file. */
  noOtherReturn:
    "Los contribuyentes del IRPF o los contribuyentes no residentes sin establecimiento permanente que resulten agraciados y hayan soportado la retención en el momento del abono del premio no tendrán que presentar ninguna otra autoliquidación.",
  /** AEAT non-residents page: refund under a tax treaty. */
  treatyRefund:
    "se podrá solicitar dicha aplicación y la devolución consiguiente mediante la presentación del modelo de autoliquidación 210 (subapartado G)",
} as const;

/* -------------------------------------------------------------------------- */
/* Draws and prize presets                                                    */
/* -------------------------------------------------------------------------- */

export type DrawId = "navidad-2026" | "nino-2027" | "grossa-2026";

export interface Draw {
  id: DrawId;
  /** Price of one décimo (Lotería Nacional) or ticket (La Grossa), euros. */
  price: number;
  /** ISO day of the draw. */
  date: string;
  source: keyof typeof SOURCES;
}

export const DRAWS: Record<DrawId, Draw> = {
  // SELAE programme Q4 2026: "Los billetes estarán divididos en décimos de 20 €."
  "navidad-2026": { id: "navidad-2026", price: 20, date: "2026-12-22", source: "selaeProgramme" },
  // SELAE Lotería Nacional page (31 Oct 2026): El Niño on Wednesday 6 Jan 2027, 20 € décimos.
  "nino-2027": { id: "nino-2027", price: 20, date: "2027-01-06", source: "selaeLnac" },
  // DOGC 9640, annex 3: "La data de realització del sorteig és el 31 de desembre de 2026"; "El preu del bitllet és de deu (10) euros."
  "grossa-2026": { id: "grossa-2026", price: 10, date: "2026-12-31", source: "dogcGrossa" },
};

export type PresetId =
  | "gordo"
  | "segundo"
  | "tercero"
  | "cuarto"
  | "quinto"
  | "pedrea"
  | "reintegro"
  | "nino-primero"
  | "grossa-primer"
  | "grossa-segon"
  | "grossa-tercer";

export interface Preset {
  id: PresetId;
  draw: DrawId;
  /** Gross prize of one whole décimo (or Grossa ticket), euros. */
  prize: number;
}

/**
 * Per whole décimo or ticket. Christmas: SELAE's 2026 programme per billete
 * divided by ten (4,000,000 / 1,250,000 / 500,000 / 200,000 / 60,000 / pedrea
 * 1,000 / reintegro 200 per 200 € billete). El Niño: "2.000.000 € a la serie"
 * (first prize, per billete of ten décimos). La Grossa: DOGC 9640 annex 3,
 * "Les cinc xifres" of the first, second and third prizes.
 */
export const PRESETS: readonly Preset[] = [
  { id: "gordo", draw: "navidad-2026", prize: 400_000 },
  { id: "segundo", draw: "navidad-2026", prize: 125_000 },
  { id: "tercero", draw: "navidad-2026", prize: 50_000 },
  { id: "cuarto", draw: "navidad-2026", prize: 20_000 },
  { id: "quinto", draw: "navidad-2026", prize: 6_000 },
  { id: "pedrea", draw: "navidad-2026", prize: 100 },
  { id: "reintegro", draw: "navidad-2026", prize: 20 },
  { id: "nino-primero", draw: "nino-2027", prize: 200_000 },
  { id: "grossa-primer", draw: "grossa-2026", prize: 200_000 },
  { id: "grossa-segon", draw: "grossa-2026", prize: 65_000 },
  { id: "grossa-tercer", draw: "grossa-2026", prize: 30_000 },
];

export function presetOf(id: PresetId): Preset {
  const p = PRESETS.find((x) => x.id === id);
  if (!p) throw new Error(`unknown preset ${id}`);
  return p;
}
