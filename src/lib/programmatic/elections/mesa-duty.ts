/**
 * "Mesa electoral a <town>": what someone drawn for a 29N polling table in
 * this municipality needs this week, and where their excuse goes.
 *
 * Demand (Search Console, 2-3 Nov 2026): "mesa electoral 29n <town>" is the
 * fastest-rising election query family, landing on these town pages
 * (docs/SEO_EXPERIMENTS.md, 4 Nov 2026). Body only: the titles and
 * descriptions changed on 3 Nov are in a measurement window.
 *
 * The facts are the mesa guide's (`MESA_29N` in content/batch02/mesa.ts:
 * draw 31 Oct-4 Nov, notice by 7 Nov, 7 days to file an excuse, Cl@ve
 * platform, 75 EUR, five hours off on Monday 30 Nov), imported, not repeated;
 * re-read on 4 Nov 2026 on Interior's 29N mesa pages.
 *
 * Where the excuse goes: the Junta Electoral de Zona (LOREG art. 27.3). LOREG
 * art. 8.3 puts each JEZ "en las localidades cabeza de los partidos judiciales
 * aludidos en el apartado 6", and art. 8.6 says those are "los de las
 * Elecciones Locales de 1979" (BOE consolidated text, read 4 Nov 2026), not
 * today's judicial districts. So the page names the JEZ first and, for the
 * 200 towns whose current judicial district is another one (Sant Boi, el Prat,
 * Santa Coloma de Gramenet, Mollet...), says why the two differ.
 *
 * Data: `jez.json`, written by `scripts/elections-jez.py` on 4 Nov 2026 from
 * the Generalitat's register of local authorities (dataset vevv-8fvw,
 * PARTIT_ELECTORAL and PARTIT_JUDICIAL, refreshed that day), the Departament
 * de Justícia's municipality -> judicial district datasets (772x-hgsh,
 * 95tc-3cti; 22 Sep 2021, all 947 agree with the register) and the Junta
 * Electoral Central's "Junta Electoral de Zona que corresponde a cada
 * municipio" (all 947 agree; the JEC lists the Valls zone under a blank name
 * and calls the Aran one "Vielha", both checked by the script). Address and
 * telephone of each JEZ: the JEC's "Directorio de Juntas Electorales de
 * Zona" for Catalonia, printed as the JEC writes them (one malformed
 * ten-digit Lleida number dropped). Only this town's row reaches the page.
 *
 * Remove or rewrite after polling day: a test fails from 1 Dec 2026.
 */

import { MESA_29N, MESA_SOURCES } from "@/lib/content/batch02/mesa";
import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { shortDate } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

import RAW from "./jez.json" with { type: "json" };
import { capitalised } from "./names";
import { inCa, ofCa, placeName } from "./pages";
import { SNAPSHOT } from "./snapshot";
import type { Municipality } from "./types";

export interface JezSource {
  name: string;
  publisher: string;
  url: string;
  sha256: string;
}
export interface JezBoard {
  /** INE code of the seat municipality. */
  seat: string;
  /** As the JEC directory writes it. */
  address: string;
  /** Nine digits, as the JEC directory lists them. */
  phones: string[];
}
export interface JezSnapshot {
  readAt: string;
  sources: Record<"towns" | "justice" | "jec" | "directory", JezSource>;
  boards: JezBoard[];
  /** Seat (INE code) of each current judicial district. */
  districts: string[];
  /** INE code -> [index in `boards`, index in `districts`]. */
  towns: Record<string, [number, number]>;
}

export const JEZ = RAW as unknown as JezSnapshot;

/** The date this section's facts were last checked (Interior, JEC, LOREG, the datasets). */
export const MESA_DUTY_CHECKED = "2026-11-04";

/** After polling day the section is stale: `tests/election-mesa-duty.test.ts` fails from this date. */
export const MESA_DUTY_UNTIL = "2026-11-30";

const byCode = new Map(SNAPSHOT.municipalities.map((m) => [m.code, m]));

export interface TownJez {
  board: JezBoard;
  /** The seat municipality of the JEZ and of today's judicial district. */
  boardSeat: Municipality;
  districtSeat: Municipality;
}

export function jezFor(code: string): TownJez | null {
  const row = JEZ.towns[code];
  if (!row) return null;
  const board = JEZ.boards[row[0]];
  const boardSeat = board ? byCode.get(board.seat) : undefined;
  const districtSeat = byCode.get(JEZ.districts[row[1]] ?? "");
  if (!board || !boardSeat || !districtSeat) return null;
  return { board, boardSeat, districtSeat };
}

/** "936932900" -> "936 932 900". */
export const phoneDisplay = (digits: string) => digits.replace(/^(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3");

export interface MesaDutyModel {
  title: string;
  /** md */
  intro: string;
  /** Notice and excuse (md values), shown before the JEZ row. */
  rows: { label: string; value: string }[];
  /** Allowance and time off (md), shown after it. */
  pay: { label: string; value: string };
  board: {
    label: string;
    /** "Junta Electoral de Zona de Terrassa": plain text. */
    name: string;
    address: string;
    phones: { display: string; href: string }[];
    phoneLabel: string;
    /** Why this JEZ: the judicial district, and the 1979 map where it differs. Plain text. */
    note: string;
    /** Directory credit, plain text. */
    credit: string;
  };
  /** md: link to the mesa guide. */
  guide: string;
  /** md */
  source: string;
  fact: { label: string; value: string };
  faq: { question: string; answer: string };
}

type Case = "seat" | "same" | "elsewhere";

interface Words {
  title: (place: string) => string;
  intro: (place: string, board: string) => string;
  rows: { label: string; value: string }[];
  pay: { label: string; value: string };
  boardLabel: string;
  boardName: (seat: string) => string;
  phoneLabel: string;
  note: (c: Case, place: string, district: string, board: string, townIsDistrictSeat: boolean) => string;
  credit: string;
  guide: (href: string, title: string) => string;
  source: (date: string, l: SourceLinks) => string;
  factLabel: string;
  faqQuestion: (place: string) => string;
  faqAnswer: (board: string, address: string) => string;
}

const d = (iso: string, locale: Locale) => shortDate(iso, locale);
const F = MESA_29N;
const sourceUrl = (needle: string): string => {
  const url = MESA_SOURCES.find((s) => s.url.includes(needle))?.url;
  if (!url) throw new Error(`mesa guide source ${needle} not found`);
  return url;
};
/** Interior's 29N page on excuses and the LOREG, both already sources of the mesa guide. */
const EXCUSES_URL = sourceUrl("impedimentos-y-excusas");
const LOREG_URL = sourceUrl("BOE-A-1985-11672");

interface SourceLinks {
  interior: string;
  loreg: string;
  jec: string;
  directory: string;
  towns: string;
}

/** The day of the month the latest notices arrive: "si te la lliuren el dia 7". */
const NOTICE_DAY = Number(F.noticeBy.slice(8, 10));

const WORDS: Record<Locale, Words> = {
  ca: {
    title: (place) => `Mesa electoral ${inCa(place)}`,
    intro: (place, board) =>
      `L'Ajuntament ${ofCa(place)} ja ha sortejat els membres de les meses del 29N: el termini acabava el ${d(F.drawTo, "ca")}. Si t'ha tocat, t'ho ha de notificar com a molt tard el **${d(F.noticeBy, "ca")}**, i des d'aquell dia tens **${F.excuseDays} dies** per excusar-te davant la **Junta Electoral de Zona ${ofCa(board)}**.`,
    rows: [
      {
        label: "Notificació",
        value: `És l'única manera de saber-ho: no es publica cap llista. Arriba com a molt tard el **${d(F.noticeBy, "ca")}**, amb el manual d'instruccions, i si arriba més tard el nomenament continua sent vàlid.`,
      },
      {
        label: "Excusa",
        value: `**${F.excuseDays} dies** des de la notificació (fins al ${d(F.lastExcuseDay, "ca")} si te la lliuren el dia ${NOTICE_DAY}), amb una causa justificada i documentada: en línia amb Cl@ve a la [plataforma d'excuses](${F.excuseApp}) o en paper a la Junta. A partir dels ${F.declineFrom} anys pots renunciar-hi en el mateix termini.`,
      },
    ],
    pay: {
      label: "Dieta i feina",
      value: `**${F.allowanceEur} €** per la jornada. Permís retribuït de jornada completa el diumenge si per a tu és laborable, i **${F.dayAfterHoursOff} hores menys** de feina el **dilluns ${d(F.dayAfter, "ca")}**.`,
    },
    boardLabel: "On s'entrega",
    boardName: (seat) => `Junta Electoral de Zona ${ofCa(seat)}`,
    phoneLabel: "Telèfon",
    note: (c, place, district, board, townIsDistrictSeat) => {
      const Place = capitalised(place);
      if (c === "seat") return `${Place} és el cap del seu partit judicial i la seu de la Junta Electoral de Zona (LOREG, art. 8).`;
      if (c === "same") return `${Place} és del partit judicial ${ofCa(district)}, i la Junta Electoral de Zona té la seu al cap del partit (LOREG, art. 8).`;
      const now = townIsDistrictSeat ? `${Place} és avui cap del seu propi partit judicial` : `${Place} és avui del partit judicial ${ofCa(district)}`;
      return `${now}, però a les eleccions compten els partits judicials de les eleccions locals del 1979 (LOREG, art. 8): per això la seva Junta Electoral de Zona és la ${ofCa(board)}.`;
    },
    credit: "Adreça i telèfon: directori de la Junta Electoral Central.",
    guide: (href, title) => `Les causes d'excusa acceptades, què passa si no hi vas i quan es cobra: [${title}](${href}).`,
    source: (date, l) =>
      `Fonts: [Ministeri de l'Interior](${l.interior}) (web del 29N), [LOREG](${l.loreg}) (art. 8, 27 i 28), Junta Electoral Central ([junta de cada municipi](${l.jec}) i [directori](${l.directory})) i [registre d'ens locals](${l.towns}) de la Generalitat. Comprovat el ${date}.`,
    factLabel: "Excuses de mesa (29N)",
    faqQuestion: (place) => `Si m'ha tocat mesa el 29N ${inCa(place)}, on presento l'excusa?`,
    faqAnswer: (board, address) =>
      `A la Junta Electoral de Zona ${ofCa(board)}, dins dels ${F.excuseDays} dies següents a la notificació, que arriba com a molt tard el ${d(F.noticeBy, "ca")}. L'adreça de la Junta és ${address}. També la pots presentar en línia amb Cl@ve a la plataforma d'excuses del Ministeri de l'Interior. La dieta és de ${F.allowanceEur} € i el dilluns ${d(F.dayAfter, "ca")} tens ${F.dayAfterHoursOff} hores menys de feina.`,
  },
  es: {
    title: (place) => `Mesa electoral en ${place}`,
    intro: (place, board) =>
      `El Ayuntamiento de ${place} ya ha sorteado a los miembros de las mesas del 29N: el plazo acababa el ${d(F.drawTo, "es")}. Si te ha tocado, te lo tienen que notificar como muy tarde el **${d(F.noticeBy, "es")}**, y desde ese día tienes **${F.excuseDays} días** para excusarte ante la **Junta Electoral de Zona de ${board}**.`,
    rows: [
      {
        label: "Notificación",
        value: `Es la única forma de saberlo: no se publica ninguna lista. Llega como muy tarde el **${d(F.noticeBy, "es")}**, con el manual de instrucciones, y si llega más tarde el nombramiento sigue siendo válido.`,
      },
      {
        label: "Excusa",
        value: `**${F.excuseDays} días** desde la notificación (hasta el ${d(F.lastExcuseDay, "es")} si te la entregan el día ${NOTICE_DAY}), con una causa justificada y documentada: en línea con Cl@ve en la [plataforma de excusas](${F.excuseApp}) o en papel en la Junta. A partir de los ${F.declineFrom} años puedes renunciar en el mismo plazo.`,
      },
    ],
    pay: {
      label: "Dieta y trabajo",
      value: `**${F.allowanceEur} €** por la jornada. Permiso retribuido de jornada completa el domingo si para ti es laborable, y **${F.dayAfterHoursOff} horas menos** de trabajo el **lunes ${d(F.dayAfter, "es")}**.`,
    },
    boardLabel: "Dónde se entrega",
    boardName: (seat) => `Junta Electoral de Zona de ${seat}`,
    phoneLabel: "Teléfono",
    note: (c, place, district, board, townIsDistrictSeat) => {
      if (c === "seat") return `${place} es cabeza de su partido judicial y sede de la Junta Electoral de Zona (LOREG, art. 8).`;
      if (c === "same") return `${place} pertenece al partido judicial de ${district}, y la Junta Electoral de Zona tiene su sede en la cabeza del partido (LOREG, art. 8).`;
      const now = townIsDistrictSeat ? `${place} es hoy cabeza de su propio partido judicial` : `${place} pertenece hoy al partido judicial de ${district}`;
      return `${now}, pero en las elecciones cuentan los partidos judiciales de las elecciones locales de 1979 (LOREG, art. 8): por eso su Junta Electoral de Zona es la de ${board}.`;
    },
    credit: "Dirección y teléfono: directorio de la Junta Electoral Central.",
    guide: (href, title) => `Las causas de excusa aceptadas, qué pasa si no vas y cuándo se cobra: [${title}](${href}).`,
    source: (date, l) =>
      `Fuentes: [Ministerio del Interior](${l.interior}) (web del 29N), [LOREG](${l.loreg}) (arts. 8, 27 y 28), Junta Electoral Central ([junta de cada municipio](${l.jec}) y [directorio](${l.directory})) y [registro de entes locales](${l.towns}) de la Generalitat. Comprobado el ${date}.`,
    factLabel: "Excusas de mesa (29N)",
    faqQuestion: (place) => `Si me ha tocado mesa el 29N en ${place}, ¿dónde presento la excusa?`,
    faqAnswer: (board, address) =>
      `Ante la Junta Electoral de Zona de ${board}, en los ${F.excuseDays} días siguientes a la notificación, que llega como muy tarde el ${d(F.noticeBy, "es")}. La dirección de la Junta es ${address}. También puedes presentarla en línea con Cl@ve en la plataforma de excusas del Ministerio del Interior. La dieta es de ${F.allowanceEur} € y el lunes ${d(F.dayAfter, "es")} tienes ${F.dayAfterHoursOff} horas menos de trabajo.`,
  },
  en: {
    title: (place) => `Polling-station duty (mesa electoral) in ${place}`,
    intro: (place, board) =>
      `The town council of ${place} has already drawn the members of the 29 November polling tables: the deadline was ${d(F.drawTo, "en")}. If you were picked, you must be notified by **${d(F.noticeBy, "en")}** at the latest, and from that day you have **${F.excuseDays} days** to ask the **Junta Electoral de Zona de ${board}** (the zone electoral board) to excuse you.`,
    rows: [
      {
        label: "Notice",
        value: `It is the only way to find out: no list is published. It arrives by **${d(F.noticeBy, "en")}** at the latest, with the instruction manual, and a notice that arrives later is still valid.`,
      },
      {
        label: "Excuse",
        value: `**${F.excuseDays} days** from the notice (to ${d(F.lastExcuseDay, "en")} if it reaches you on ${d(F.noticeBy, "en")}), with a justified, documented reason: online with Cl@ve through the [excuse platform](${F.excuseApp}) (in Spanish) or on paper at the board. From age ${F.declineFrom} you can simply decline within the same seven days.`,
      },
    ],
    pay: {
      label: "Pay and time off",
      value: `**€${F.allowanceEur}** for the day. A full paid day off on Sunday if it is a working day for you, and **${F.dayAfterHoursOff} hours off** work on **Monday ${d(F.dayAfter, "en")}**.`,
    },
    boardLabel: "Where to file",
    boardName: (seat) => `Junta Electoral de Zona de ${seat}`,
    phoneLabel: "Telephone",
    note: (c, place, district, board, townIsDistrictSeat) => {
      if (c === "seat") return `${place} is the head town of its judicial district and the seat of the zone board (LOREG art. 8).`;
      if (c === "same") return `${place} belongs to the judicial district of ${district}, and the zone board sits in the district's head town (LOREG art. 8).`;
      const now = townIsDistrictSeat ? `${place} is now the head town of its own judicial district` : `${place} now belongs to the judicial district of ${district}`;
      return `${now}, but elections use the judicial districts of the 1979 local elections (LOREG art. 8), so its zone board is the one in ${board}.`;
    },
    credit: "Address and telephone: Central Electoral Board directory.",
    guide: (href, title) => `The accepted excuses, the penalty for not turning up and when the allowance is paid: [${title}](${href}).`,
    source: (date, l) =>
      `Sources: [Interior Ministry](${l.interior}) (29 November election website), [LOREG](${l.loreg}) (arts. 8, 27 and 28), Central Electoral Board ([board of each municipality](${l.jec}) and [directory](${l.directory})) and the Generalitat's [register of local authorities](${l.towns}). Checked on ${date}.`,
    factLabel: "Polling-duty excuses (29 Nov)",
    faqQuestion: (place) => `Drawn for polling-station duty in ${place} on 29 November: where do I file an excuse?`,
    faqAnswer: (board, address) =>
      `With the Junta Electoral de Zona de ${board}, within ${F.excuseDays} days of your notice, which arrives by ${d(F.noticeBy, "en")} at the latest. The board's address is ${address}. You can also file online with Cl@ve through the Interior Ministry's excuse platform. The allowance is €${F.allowanceEur}, and you get ${F.dayAfterHoursOff} hours off work on Monday ${d(F.dayAfter, "en")}.`,
  },
};

/** Null only for a code missing from `jez.json`; every one of the 947 maps (tested). */
export function buildMesaDuty(m: Municipality, locale: Locale, date: (iso: string) => string): MesaDutyModel | null {
  const jez = jezFor(m.code);
  if (!jez) return null;
  const w = WORDS[locale];
  const place = placeName(m, locale);
  const board = placeName(jez.boardSeat, locale);
  const district = placeName(jez.districtSeat, locale);
  const c: Case = jez.boardSeat.code !== jez.districtSeat.code ? "elsewhere" : m.code === jez.boardSeat.code ? "seat" : "same";
  const { towns, jec, directory } = JEZ.sources;
  return {
    title: w.title(place),
    intro: w.intro(place, board),
    rows: w.rows,
    pay: w.pay,
    board: {
      label: w.boardLabel,
      name: w.boardName(board),
      address: jez.board.address,
      phones: jez.board.phones.map((p) => ({ display: phoneDisplay(p), href: `tel:+34${p}` })),
      phoneLabel: w.phoneLabel,
      note: w.note(c, place, district, board, m.code === jez.districtSeat.code),
      credit: w.credit,
    },
    guide: w.guide(b2href("mesa", locale), B2_TITLES.mesa[locale]),
    source: w.source(date(MESA_DUTY_CHECKED), { interior: EXCUSES_URL, loreg: LOREG_URL, jec: jec.url, directory: directory.url, towns: towns.url }),
    fact: { label: w.factLabel, value: w.boardName(board) },
    faq: { question: w.faqQuestion(place), answer: w.faqAnswer(board, jez.board.address) },
  };
}
