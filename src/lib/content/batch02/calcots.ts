import type { Block } from "@/lib/content/blocks";
import { link } from "@/lib/content/features/shared";
import { TRAINS } from "@/lib/content/features/trains";
import type { Locale } from "@/lib/i18n/config";

import { dateYear, dayDate } from "./festive";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  h3,
  keyFacts,
  lead,
  list,
  paras,
  steps,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Calçots and calçotades 2026-2027: the season and the Gran Festa de Valls.
 *
 * Two questions, answered in the lead: when is calçot season, and when is the
 * Gran Festa de la Calçotada de Valls 2027. Everything was read on 26 Oct 2026
 * from the organisers and regulators themselves:
 *
 * - Season: IGP Calçot de Valls home page ("La seva temporada és de novembre a
 *   abril"); the Generalitat's plec de condicions ("la campanya s'inicia l'1 de
 *   novembre i acaba al final del mes d'abril de l'any següent"); Ajuntament de
 *   Valls ("especialment des de novembre fins a abril").
 * - Gran Festa 2027: Cambra de Comerç de Valls press post of 19 Oct 2026 ("el
 *   diumenge 31 de gener de 2027", 45a edició, organised with the Ajuntament;
 *   programme "en els propers dies"); Ajuntament de Valls ("L'últim diumenge de
 *   gener se celebra cada any", since 1982).
 * - Not published for 2027: programme, ticket price, tasting lot. The official
 *   home page already shows a price and a lot, but they are the 2026 edition's
 *   (same price, same contents, same musicians), so they are printed only as
 *   2026 precedent, from the 2026 pages.
 * - Calçofest: Ajuntament de Valls news of 15 Oct 2026 (2nd edition, Saturday
 *   21 Nov 2026; popular calçotada 13-15 h, 1,500 tastings at 15 € plus fees).
 * - IGP: Departament d'Agricultura product page (variety, comarques, numbered
 *   label, Reg. 905/2002, Ordre AAR/414/2009, 2023 production; updated
 *   2 Jul 2026). Stem diameter and bunch sizes differ between official
 *   documents, so they are left out; stem length 15-25 cm agrees everywhere.
 * - Transport: Rodalies R13 line page and the timetable in force since 11 Jul
 *   2026; Monbus Valls-Barcelona timetable of 14 Jul 2026; Ajuntament de Valls
 *   public-transport page. No departure times are printed.
 *
 * When the 2027 programme is presented, fill `PROGRAMME_2027` with the
 * organiser's post and republish (`?only=calcots`): the lead, key facts and
 * FAQ switch from "not published" to the link. The 2026 lines stay, labelled.
 *
 * No new photograph: the hero is the Rodalies-at-Estació-de-França picture
 * already in the manifest (the rail day-trips guide's lead image), which is
 * also where the R13 to Valls starts. Its alt and caption are TRAINS's own,
 * because media rows are keyed by file.
 */

export const CALCOTS_VERIFIED = "2026-10-26";

export const FESTA_2027 = { date: "2027-01-31", edition: 45 } as const;
export const CALCOFEST_2026 = { date: "2026-11-21", edition: 2 } as const;

/** Last season's milestones, printed only with their year. */
export const PAST_2026 = {
  festa: "2026-01-25",
  advanceSale: "2026-01-08",
  presented: "2026-01-21",
} as const;

export interface ProgrammeNotice {
  /** ISO date of the organiser's post presenting the 2027 programme. */
  published: string;
  /** That post, on the festival's or the council's own site. */
  url: string;
}

/** Fill when the Cambra de Comerç / Ajuntament present the 2027 programme. */
export const PROGRAMME_2027: ProgrammeNotice | null = null;

const OFFICIAL_HOSTS = ["festacalcotadavalls.cat", "www.valls.cat", "valls.cat", "cambravalls.com", "www.cambravalls.com"];

/** Reasons a programme notice must not be printed; empty when it is fine. */
export function programmeProblems(notice: ProgrammeNotice): string[] {
  const problems: string[] = [];
  const day = new Date(`${notice.published}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(notice.published) || Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== notice.published) {
    problems.push(`not a real ISO date: ${notice.published}`);
  } else if (notice.published < "2026-10-19" || notice.published > FESTA_2027.date) {
    // The 2027 edition was first announced on 19 Oct 2026; a programme dated
    // before that, or after the festival, is last year's pasted in.
    problems.push(`outside the run-up to the 2027 festival: ${notice.published}`);
  }
  let url: URL | null = null;
  try {
    url = new URL(notice.url);
  } catch {
    problems.push(`url does not parse: ${notice.url}`);
  }
  if (url) {
    if (url.protocol !== "https:") problems.push("url is not https");
    if (!OFFICIAL_HOSTS.includes(url.hostname)) problems.push(`not an official host: ${url.hostname}`);
    if (/[?&]utm_/.test(url.search)) problems.push("url carries tracking parameters");
  }
  return problems;
}

const URLS = {
  festaPress2027: "https://festacalcotadavalls.cat/premsa/es-presenta-la-45a-gran-festa-de-la-calcotada/",
  festaPressRoom: "https://festacalcotadavalls.cat/premsa/",
  festaHome: "https://festacalcotadavalls.cat/",
  festaHowTo: "https://festacalcotadavalls.cat/la-festa/com-fer-una-calcotada/",
  festaHistory: "https://festacalcotadavalls.cat/la-festa/historia-tradicio/",
  festaTasting: "https://festacalcotadavalls.cat/informacio/degustacio/",
  festa2026Edition: "https://festacalcotadavalls.cat/edicio2026/",
  festa2026Advance: "https://festacalcotadavalls.cat/premsa/arrenca-la-venda-anticipada-dels-lots-degustacio-de-ls-festa-de-la-calcotada-2026/",
  festa2026Presented: "https://festacalcotadavalls.cat/premsa/presentada-la-44a-gran-festa-de-la-calcotada-de-valls/",
  festa2026Summary: "https://festacalcotadavalls.cat/premsa/12412/",
  vallsCalcotada: "https://www.valls.cat/la-ciutat/la-calcotada",
  vallsCalcofest: "https://www.valls.cat/la-ciutat/noticies/8195-el-festival-calcofest-posa-a-la-venda-els-tiquets-de-la-calcotada-popular",
  vallsTransport: "https://www.valls.cat/transport-public",
  calcofest: "https://calcofest.cat/",
  igp: "https://www.calcotdevalls.com/",
  igpProcess: "https://www.calcotdevalls.com/proces-productiu/",
  gencatIgp:
    "https://agricultura.gencat.cat/ca/ambits/alimentacio/segells-qualitat-diferenciada/distintius-origen/dop-igp/igp/productes-reconeixement-comunitari/calcot-valls",
  plec: "https://agricultura.gencat.cat/web/.content/al_alimentacio/al02_qualitat_alimentaria/normativa-dop-igp/plecs-vigor/plec_condicions_catala_igp_calcot_valls.pdf",
  r13: "https://rodalies.gencat.cat/ca/sobre-rodalies/linies-i-estacions/servei_regionals/r13/index.html",
  r13Restored: "https://rodalies.gencat.cat/ca/detalls/article/07_06_Recuperacio_R13",
  r13Timetable: "https://rodalies.gencat.cat/web/.content/01_Actualitat/2026/07_06_Recuperacio_R13/R13-R14-RT1-a-partir-del-10-de-juliol.pdf",
  monbusValls: "https://catalunya.monbus.es/wp-content/uploads/2026/07/H_Valls-Barcelona_2026-07-14.pdf",
} as const;

const SOURCES: B2Source[] = [
  { name: "Es presenta la 45a Gran Festa de la Calçotada (19 d'octubre de 2026)", url: URLS.festaPress2027, publisher: "Cambra de Comerç de Valls" },
  { name: "Gran Festa de la Calçotada de Valls: web oficial", url: URLS.festaHome, publisher: "Cambra de Comerç de Valls" },
  { name: "Sala de premsa de la Gran Festa de la Calçotada", url: URLS.festaPressRoom, publisher: "Cambra de Comerç de Valls" },
  { name: "Com fer una calçotada", url: URLS.festaHowTo, publisher: "Cambra de Comerç de Valls" },
  { name: "Història i tradició de la calçotada", url: URLS.festaHistory, publisher: "Cambra de Comerç de Valls" },
  { name: "44a Gran Festa de la Calçotada 2026: programa", url: URLS.festa2026Edition, publisher: "Cambra de Comerç de Valls" },
  { name: "Degustació popular de la Calçotada (edició del 2026)", url: URLS.festaTasting, publisher: "Cambra de Comerç de Valls" },
  { name: "Arrenca la venda anticipada del lot degustació de la Festa de la Calçotada 2026 (8 de gener de 2026)", url: URLS.festa2026Advance, publisher: "Cambra de Comerç de Valls" },
  { name: "Presentada la 44a Gran Festa de la Calçotada de Valls (21 de gener de 2026)", url: URLS.festa2026Presented, publisher: "Cambra de Comerç de Valls" },
  { name: "Valls viu la festa gastronòmica més esperada de l'any (balanç del 2026)", url: URLS.festa2026Summary, publisher: "Cambra de Comerç de Valls" },
  { name: "La Calçotada", url: URLS.vallsCalcotada, publisher: "Ajuntament de Valls" },
  { name: "El Festival Calçofest posa a la venda els tiquets de la calçotada popular (15 d'octubre de 2026)", url: URLS.vallsCalcofest, publisher: "Ajuntament de Valls" },
  { name: "Transport públic: bus, tren i taxis", url: URLS.vallsTransport, publisher: "Ajuntament de Valls" },
  { name: "Calçofest 2026", url: URLS.calcofest, publisher: "Calçofest" },
  { name: "IGP Calçot de Valls", url: URLS.igp, publisher: "Consell Regulador de la IGP Calçot de Valls" },
  { name: "El Calçot, un cultiu ancestral", url: URLS.igpProcess, publisher: "Consell Regulador de la IGP Calçot de Valls" },
  { name: "Calçot de Valls (IGP)", url: URLS.gencatIgp, publisher: "Departament d'Agricultura, Ramaderia, Pesca i Alimentació" },
  { name: "Plec de condicions de la IGP Calçot de Valls", url: URLS.plec, publisher: "Generalitat de Catalunya" },
  { name: "Línia R13", url: URLS.r13, publisher: "Rodalies de Catalunya" },
  { name: "R13: restabliment del servei entre La Plana-Picamoixons i Sant Vicenç de Calders a partir de l'11 de juliol", url: URLS.r13Restored, publisher: "Rodalies de Catalunya" },
  { name: "Horaris R13, R14 i RT1 a partir de l'11 de juliol de 2026", url: URLS.r13Timetable, publisher: "Rodalies de Catalunya" },
  { name: "Horari Valls - Barcelona (14 de juliol de 2026)", url: URLS.monbusValls, publisher: "Monbus" },
];

export const CALCOTS_META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "tradicions/calcotada-valls-temporada-calcots",
    title: "Calçots i calçotades 2026-2027: temporada i Gran Festa de Valls",
    seoTitle: "Calçotada de Valls 2027: data i temporada de calçots",
    seoDescription:
      "La temporada de calçots va de novembre a abril i la 45a Gran Festa de la Calçotada de Valls és el diumenge 31 de gener de 2027. IGP i com arribar-hi.",
    excerpt:
      "Quan és la temporada de calçots, quan és la Calçotada de Valls 2027, què se sap del programa, com es mengen, què garanteix la IGP i com arribar a Valls sense cotxe.",
  },
  es: {
    path: "tradiciones/calcotada-valls-temporada-calcots",
    title: "Calçots y calçotadas 2026-2027: temporada y Gran Festa de Valls",
    seoTitle: "Calçotada de Valls 2027: fecha y temporada de calçots",
    seoDescription:
      "La temporada de calçots va de noviembre a abril y la 45.ª Gran Festa de la Calçotada de Valls es el domingo 31 de enero de 2027. IGP y cómo llegar.",
    excerpt:
      "Cuándo es la temporada de calçots, cuándo es la Calçotada de Valls 2027, qué se sabe del programa, cómo se comen, qué garantiza la IGP y cómo llegar a Valls sin coche.",
  },
  en: {
    path: "traditions/calcotada-valls-calcot-season",
    title: "Calçots and calçotadas 2026-2027: the season and the Valls Gran Festa",
    seoTitle: "Calçotada de Valls 2027: date and calçot season",
    seoDescription:
      "Calçot season runs from November to April, and the 45th Gran Festa de la Calçotada in Valls is on Sunday 31 January 2027. The IGP and how to get there.",
    excerpt:
      "When calçot season is, when the 2027 Valls Calçotada is, what is known about the programme, how to eat calçots, what the IGP label means and how to reach Valls without a car.",
  },
};

/* -------------------------------------------------------------------------- */
/* Sentences that change when the 2027 programme is presented                 */
/* -------------------------------------------------------------------------- */

const CHECKED: Record<Locale, string> = {
  ca: "consultat el 26 d'octubre de 2026",
  es: "consultado el 26 de octubre de 2026",
  en: "checked on 26 October 2026",
};

function check(programme: ProgrammeNotice | null): ProgrammeNotice | null {
  if (programme) {
    const problems = programmeProblems(programme);
    if (problems.length > 0) throw new Error(`PROGRAMME_2027 refused: ${problems.join("; ")}`);
  }
  return programme;
}

export function calcotsLead(locale: Locale, programme: ProgrammeNotice | null = PROGRAMME_2027): string {
  const p = check(programme);
  const festa = dayDate(FESTA_2027.date, locale);
  const head: Record<Locale, string> = {
    ca: `**La temporada de calçots va de novembre a abril**, segons la IGP Calçot de Valls, i **la 45a Gran Festa de la Calçotada de Valls és el ${festa}**, com cada any l'últim diumenge de gener.`,
    es: `**La temporada de calçots va de noviembre a abril**, según la IGP Calçot de Valls, y **la 45.ª Gran Festa de la Calçotada de Valls es el ${festa}**, como cada año el último domingo de enero.`,
    en: `**Calçot season runs from November to April**, according to the IGP Calçot de Valls, and **the 45th Gran Festa de la Calçotada in Valls is on ${festa}**, the last Sunday of January as every year.`,
  };
  if (p) {
    const tail: Record<Locale, string> = {
      ca: `Els organitzadors van presentar el programa del 2027 el ${dateYear(p.published, "ca")}: [programa oficial](${p.url}).`,
      es: `Los organizadores presentaron el programa de 2027 el ${dateYear(p.published, "es")}: [programa oficial](${p.url}).`,
      en: `The organisers presented the 2027 programme on ${dateYear(p.published, "en")}: [official programme](${p.url}).`,
    };
    return `${head[locale]} ${tail[locale]}`;
  }
  const tail: Record<Locale, string> = {
    ca: `El programa, el preu del tiquet i el lot de degustació del 2027 encara no s'han publicat (${CHECKED.ca}).`,
    es: `El programa, el precio del ticket y el lote de degustación de 2027 aún no se han publicado (${CHECKED.es}).`,
    en: `The 2027 programme, ticket price and tasting pack have not been published yet (${CHECKED.en}).`,
  };
  return `${head[locale]} ${tail[locale]}`;
}

function programmeFact(locale: Locale, programme: ProgrammeNotice | null): string {
  const p = check(programme);
  if (p) {
    return {
      ca: `Presentat el ${dateYear(p.published, "ca")}: [programa oficial](${p.url})`,
      es: `Presentado el ${dateYear(p.published, "es")}: [programa oficial](${p.url})`,
      en: `Presented on ${dateYear(p.published, "en")}: [official programme](${p.url})`,
    }[locale];
  }
  return {
    ca: `Encara no publicats; el programa del 2026 es va presentar el ${dateYear(PAST_2026.presented, "ca")}`,
    es: `Aún no publicados; el programa de 2026 se presentó el ${dateYear(PAST_2026.presented, "es")}`,
    en: `Not published yet; the 2026 programme was presented on ${dateYear(PAST_2026.presented, "en")}`,
  }[locale];
}

function pendingParagraph(locale: Locale, programme: ProgrammeNotice | null): string {
  const p = check(programme);
  const press = URLS.festaPressRoom;
  if (p) {
    return {
      ca: `**Programa del 2027:** la Cambra de Comerç i l'Ajuntament el van presentar el ${dateYear(p.published, "ca")}. Horaris, preu del tiquet i contingut del lot de degustació, al [programa oficial](${p.url}); qualsevol canvi posterior sortirà a la [sala de premsa de la festa](${press}).`,
      es: `**Programa de 2027:** la Cambra de Comerç y el Ayuntamiento lo presentaron el ${dateYear(p.published, "es")}. Horarios, precio del ticket y contenido del lote de degustación, en el [programa oficial](${p.url}); cualquier cambio posterior saldrá en la [sala de prensa de la fiesta](${press}).`,
      en: `**2027 programme:** the Chamber of Commerce and the council presented it on ${dateYear(p.published, "en")}. Times, ticket price and what the tasting pack includes are in the [official programme](${p.url}); later changes will appear in the [festival's press room](${press}).`,
    }[locale];
  }
  return {
    ca: `**El que encara no se sap:** el programa d'actes, el preu del tiquet i el contingut del lot de degustació del 2027. La nota del 19 d'octubre diu que els detalls del programa «es donaran a conèixer en els propers dies». La pàgina d'inici de la web oficial ja esmenta un preu i un lot, però són els mateixos de l'edició del 2026, i per això aquí no els donem com a definitius. Quan es presenti el programa, sortirà a la [sala de premsa de la festa](${press}).`,
    es: `**Lo que aún no se sabe:** el programa de actos, el precio del ticket y el contenido del lote de degustación de 2027. La nota del 19 de octubre dice que los detalles del programa se darán a conocer «en els propers dies» (en los próximos días). La portada de la web oficial ya menciona un precio y un lote, pero son los mismos de la edición de 2026, así que aquí no los damos por definitivos. Cuando se presente el programa, saldrá en la [sala de prensa de la fiesta](${press}).`,
    en: `**What is not known yet:** the 2027 programme of events, the ticket price and what the tasting pack includes. The 19 October note says the programme details will be announced "in the coming days". The festival's home page already mentions a price and a pack, but they are the same as in the 2026 edition, so we do not treat them as final. When the programme is presented it will appear in the [festival's press room](${press}).`,
  }[locale];
}

function ticketAnswer(locale: Locale, programme: ProgrammeNotice | null): string {
  const p = check(programme);
  if (p) {
    return {
      ca: `Ho detalla el [programa oficial del 2027](${p.url}). Com a referència, el 2026 el lot de degustació costava 15 € el mateix dia de la festa.`,
      es: `Lo detalla el [programa oficial de 2027](${p.url}). Como referencia, en 2026 el lote de degustación costaba 15 € el mismo día de la fiesta.`,
      en: `See the [official 2027 programme](${p.url}). For reference, in 2026 the tasting pack cost €15 on the day.`,
    }[locale];
  }
  return {
    ca: "Encara no s'ha publicat. El 2026, el lot de degustació costava 15 € el mateix dia de la festa, i també es venia per anticipat a la web oficial des del 8 de gener de 2026.",
    es: "Aún no se ha publicado. En 2026, el lote de degustación costaba 15 € el mismo día de la fiesta, y también se vendía por anticipado en la web oficial desde el 8 de enero de 2026.",
    en: "It has not been published yet. In 2026 the tasting pack cost €15 on the day, and it was also sold in advance on the official website from 8 January 2026.",
  }[locale];
}

function programmeAnswer(locale: Locale, programme: ProgrammeNotice | null): string {
  const p = check(programme);
  if (p) {
    return {
      ca: `Es va presentar el ${dateYear(p.published, "ca")}: [programa oficial](${p.url}).`,
      es: `Se presentó el ${dateYear(p.published, "es")}: [programa oficial](${p.url}).`,
      en: `It was presented on ${dateYear(p.published, "en")}: [official programme](${p.url}).`,
    }[locale];
  }
  return {
    ca: `Encara no s'ha presentat. El 19 d'octubre de 2026 la Cambra de Comerç va dir que els detalls sortirien «en els propers dies». Per a l'edició del 2026, la venda anticipada del lot es va obrir el ${dateYear(PAST_2026.advanceSale, "ca")} i la presentació oficial va ser el ${dateYear(PAST_2026.presented, "ca")}, quatre dies abans de la festa.`,
    es: `Aún no se ha presentado. El 19 de octubre de 2026 la Cambra de Comerç dijo que los detalles saldrían «en els propers dies» (en los próximos días). Para la edición de 2026, la venta anticipada del lote se abrió el ${dateYear(PAST_2026.advanceSale, "es")} y la presentación oficial fue el ${dateYear(PAST_2026.presented, "es")}, cuatro días antes de la fiesta.`,
    en: `Not yet. On 19 October 2026 the Chamber of Commerce said the details would follow "in the coming days". For the 2026 edition, the advance sale of the tasting pack opened on ${dateYear(PAST_2026.advanceSale, "en")} and the official presentation was on ${dateYear(PAST_2026.presented, "en")}, four days before the festival.`,
  }[locale];
}

/** Intro to the 2026 programme, which is precedent either way. */
function pastIntro(locale: Locale, programme: ProgrammeNotice | null): string {
  if (check(programme)) {
    return {
      ca: "Per comparar-lo amb el programa del 2027, aquesta va ser l'estructura de l'edició del 2026, segons la web oficial:",
      es: "Para compararlo con el programa de 2027, esta fue la estructura de la edición de 2026, según la web oficial:",
      en: "To compare with the 2027 programme, this is how the 2026 edition was laid out, according to the official website:",
    }[locale];
  }
  return {
    ca: "El programa del 2027 encara no és públic. Aquesta va ser l'estructura de l'edició del 2026, segons la web oficial; confirma-la quan surti el nou programa:",
    es: "El programa de 2027 aún no es público. Esta fue la estructura de la edición de 2026, según la web oficial; confírmala cuando salga el nuevo programa:",
    en: "The 2027 programme is not public yet. This is how the 2026 edition was laid out, according to the official website; check it against the new programme when it comes out:",
  }[locale];
}

/** Last sentence of the "when do tickets come out" section. */
function ticketTip(locale: Locale, programme: ProgrammeNotice | null): string {
  const p = check(programme);
  if (p) {
    return {
      ca: `Per al 2027, les condicions de venda són al [programa oficial](${p.url}).`,
      es: `Para 2027, las condiciones de venta están en el [programa oficial](${p.url}).`,
      en: `For 2027, the sale details are in the [official programme](${p.url}).`,
    }[locale];
  }
  return {
    ca: "Si vols el lot del 2027, vigila la web de la festa: el 2026, la venda anticipada va obrir el 8 de gener.",
    es: "Si quieres el lote de 2027, vigila la web de la fiesta: en 2026, la venta anticipada abrió el 8 de enero.",
    en: "If you want a 2027 pack, watch the festival website: in 2026, advance sales opened on 8 January.",
  }[locale];
}

function festivalDayTransport(locale: Locale, programme: ProgrammeNotice | null): string {
  const press = URLS.festaPressRoom;
  const p = check(programme);
  if (p) {
    return {
      ca: `**El dia de la Gran Festa:** si hi ha serveis especials de transport per al 31 de gener de 2027, els trobaràs al [programa oficial](${p.url}) o a la [sala de premsa de la festa](${press}).`,
      es: `**El día de la Gran Festa:** si hay servicios especiales de transporte para el 31 de enero de 2027, estarán en el [programa oficial](${p.url}) o en la [sala de prensa de la fiesta](${press}).`,
      en: `**On the day of the Gran Festa:** any special transport for 31 January 2027 will be in the [official programme](${p.url}) or the [festival's press room](${press}).`,
    }[locale];
  }
  return {
    ca: `**El dia de la Gran Festa:** per al 31 de gener de 2027 encara no s'ha anunciat cap servei especial de transport. Abans de sortir, mira la [sala de premsa de la festa](${press}).`,
    es: `**El día de la Gran Festa:** para el 31 de enero de 2027 aún no se ha anunciado ningún servicio especial de transporte. Antes de salir, mira la [sala de prensa de la fiesta](${press}).`,
    en: `**On the day of the Gran Festa:** no special transport has been announced for 31 January 2027 yet. Before you go, check the [festival's press room](${press}).`,
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["tarragona", "workCalendar", "climate", "christmas"] as const;

export function buildCalcotsBody(locale: Locale, programme: ProgrammeNotice | null = PROGRAMME_2027): Block[] {
  const festa = dayDate(FESTA_2027.date, locale);
  const calcofest = dayDate(CALCOFEST_2026.date, locale);

  if (locale === "ca") {
    return [
      lead(calcotsLead("ca", programme)),
      keyFacts("Calçots i Gran Festa, d'un cop d'ull", [
        { label: "Temporada de calçots", value: "De novembre a abril; la campanya de la IGP va de l'1 de novembre a final d'abril" },
        { label: "Gran Festa de la Calçotada 2027", value: `${festa.charAt(0).toUpperCase()}${festa.slice(1)}, a Valls (45a edició)` },
        { label: "Qui l'organitza", value: "La Cambra de Comerç de Valls i l'Ajuntament de Valls" },
        { label: "Programa i tiquets del 2027", value: programmeFact("ca", programme) },
        { label: "Abans: el Calçofest", value: `${calcofest.charAt(0).toUpperCase()}${calcofest.slice(1)}, a Valls (2a edició)` },
        { label: "Sense cotxe des de Barcelona", value: "Tren R13 de Rodalies o bus Valls – Barcelona de Monbus" },
      ]),
      callout(
        "info",
        "Com tractem les dates",
        "Només hi posem dates del 2027 que han publicat els organitzadors. El que es va fer a l'edició del 2026 porta sempre l'any al costat: és el que pots esperar, no una confirmació.",
      ),
      ...h2(
        "Quan és la temporada de calçots?",
        `La IGP Calçot de Valls, el consell regulador del producte, ho resumeix així: «La seva temporada és de novembre a abril». El [plec de condicions](${URLS.plec}) que publica la Generalitat ho concreta: la campanya comença l'1 de novembre i s'acaba al final d'abril de l'any següent, i els calçots de fora de campanya no es poden vendre com a IGP. Aquesta temporada, doncs, va de l'1 de novembre de 2026 a final d'abril de 2027.`,
        "L'Ajuntament de Valls hi coincideix: els millors moments per fer una calçotada són els mesos d'hivern, «especialment des de novembre fins a abril». La Gran Festa de finals de gener cau al mig de la temporada, i després encara queden tres mesos de calçotades.",
      ),
      ...h2(
        "Quan és la Gran Festa de la Calçotada de Valls 2027?",
        `**El ${festa}.** La Cambra de Comerç de Valls ho va anunciar el 19 d'octubre de 2026, quan va presentar la imatge de la 45a edició ([nota oficial](${URLS.festaPress2027})), i la web de la festa ho repeteix. L'organitzen la Cambra de Comerç i l'Ajuntament de Valls.`,
        `No és una data a l'atzar: segons l'[Ajuntament](${URLS.vallsCalcotada}), la Gran Festa se celebra cada any l'últim diumenge de gener, i a Valls es fa des del 1982. El 31 de gener de 2027 és, efectivament, l'últim diumenge del mes.`,
        pendingParagraph("ca", programme),
      ),
      ...h3(
        "Quan surten el programa i els tiquets?",
        "Per a l'edició del 2026 (25 de gener de 2026), la venda anticipada del lot de degustació es va obrir el 8 de gener de 2026 a la web oficial, i els 1.800 tiquets anticipats es van exhaurir en sis dies. La presentació oficial va ser el 21 de gener de 2026, quatre dies abans de la festa, i el mateix diumenge es van vendre 1.800 lots més, que es van acabar al migdia.",
        ticketTip("ca", programme),
      ),
      ...h2("Com va ser la Gran Festa del 2026 (el que pots esperar)", pastIntro("ca", programme)),
      list(
        "**Des de les 10:00 (2026):** demostracions de coure calçots a la graella a l'aparcament del carrer de Sant Antoni, al costat de la plaça de l'Oli, i, a la plaça del Blat, el Concurs de Cultivadors de Calçots i el Concurs de Salsa de la Calçotada de Valls.",
        "**A les 13:00 (2026):** Concurs de Menjar Calçots a la plaça del Pati, que comença amb els pilars de la Colla Joves i la Colla Vella dels Xiquets de Valls; els premis del 2026 es van lliurar a les 14:00.",
        "**La degustació (2026):** el lot costava 15 € el mateix dia, a les taquilles de la plaça del Pati, l'Ajuntament i l'Institut d'Estudis Vallencs. Incloïa 12 calçots IGP cuits, salsa, vi, pa, aigua, una taronja, postres i un pitet, i es menjava a l'espai de degustació de l'aparcament de la Societat Agrícola, amb taules i graelles per coure-hi la carn.",
        "**Un avís de l'organització (2026):** per no menjar calçots a la via pública, totes les degustacions es feien a l'espai habilitat.",
      ),
      ...paras(
        `Segons el [balanç de l'organització](${URLS.festa2026Summary}), el 2026 hi van anar uns 35.000 visitants i es van servir 3.600 degustacions. És una festa al carrer en ple gener: abans de sortir, mira ${b2link("climate", "ca", "quin temps sol fer al gener")}.`,
      ),
      ...h2(
        `Calçofest 2026: el dissabte 21 de novembre a Valls`,
        `Abans de la Gran Festa, Valls té una altra cita: el **Calçofest**, que fa la segona edició el **${calcofest}**. Segons l'Ajuntament de Valls, s'ha consolidat com una de les cites que donen el tret de sortida a la temporada de calçotades, i combina activitats gratuïtes al matí, una calçotada popular i concerts a la tarda i al vespre.`,
      ),
      list(
        `**Calçotada popular:** de 13:00 a 15:00 a l'aparcament de la Cooperativa, amb 1.500 degustacions a 15 € més despeses de gestió. Els tiquets es compren al [web del Calçofest](${URLS.calcofest}).`,
        "**Concerts:** Figa Flawas, The Tyets, Els Pets i Els Amics de les Arts, entre d'altres.",
        "**Bus des de Barcelona:** l'organització del Calçofest ha programat un autobús oficial d'anada i tornada des de la zona de l'Estació de França, amb sortida a les 14:30, pensat per als concerts (no arriba a la calçotada de 13:00 a 15:00), subjecte a un mínim d'ocupació i amb tornada en acabar la música. A Valls, un bus llançadora gratuït uneix l'estació d'autobusos amb el recinte.",
      ),
      ...paras(
        `Font: [Ajuntament de Valls, 15 d'octubre de 2026](${URLS.vallsCalcofest}). Els preus de les entrades dels concerts pugen a mesura que s'acosta la data; consulta'ls al web del festival. Per a les altres fires gastronòmiques de la tardor, ${link("foodfairs", "ca", "mira el nostre calendari")}.`,
      ),
      ...h2(
        "Què és un calçot i què garanteix la IGP Calçot de Valls?",
        "El calçot és el brot tendre d'una ceba blanca i dolça que es cou a la flama viva. El nom ve de com es conrea: mentre creix, la planta es va «calçant», és a dir, se li posa terra al voltant perquè la base quedi blanca. És un cultiu llarg: se sembra la ceba, s'arrenca, es guarda un temps, es torna a plantar mig colgada i es calça diverses vegades fins a la collita.",
        `La **IGP Calçot de Valls** (Indicació Geogràfica Protegida) és el segell europeu que empara els calçots d'una zona i d'una manera de conrear concretes. Segons la [fitxa del Departament d'Agricultura](${URLS.gencatIgp}):`,
      ),
      list(
        "**Varietat:** cebes Allium cepa L. de la varietat Blanca Gran Tardana de Lleida.",
        "**Zona de producció:** quatre comarques, l'Alt Camp, el Baix Camp, el Tarragonès i el Baix Penedès.",
        "**Mida:** una cama blanca de 15 a 25 cm de llarg.",
        "**Normativa:** inscrita al registre de la UE pel Reglament (CE) 905/2002; el reglament de la IGP és l'Ordre AAR/414/2009 de la Generalitat.",
        "**Producció:** 1.750 tones el 2023 i 47 productors inscrits, segons la fitxa del Departament (actualitzada el 2 de juliol de 2026).",
      ),
      ...h3(
        "Com saber si un manat és IGP",
        "Mira la lligadura i l'etiqueta. Els calçots IGP es venen en manats lligats amb una cinta blava i una **etiqueta numerada** amb el nom «Calçot de Valls. Indicació Geogràfica Protegida» i el logotip de la IGP; l'Ajuntament de Valls afegeix que hi figura el nom del productor. Segons el plec de condicions, només surten al mercat amb aquesta etiqueta els calçots que han superat tots els controls. Un calçot sense etiqueta pot ser bo, però no té la garantia de la IGP.",
      ),
      ...h2(
        "Com es fa una calçotada i com es mengen els calçots",
        "La calçotada és més un ritual que un plat: un dinar de colla, a l'aire lliure si el temps ho permet, amb els calçots de protagonistes. Així la descriuen l'Ajuntament de Valls i la Cambra de Comerç:",
      ),
      steps("La calçotada, pas a pas", [
        { title: "Es preparen els calçots", text: "Es retallen les fulles verdes i les arrels, amb compte de no escurçar el calçot." },
        { title: "Es couen a la flama viva", text: "A la graella, amb un foc viu de sarments de vinya. Mentre es couen, es treu la graella del foc dues o tres vegades per girar-los un a un." },
        { title: "Es guarden embolicats", text: "Quan la punta s'estova i la pell s'ha ennegrit, es fan farcells amb paper de diari perquè no es refredin, i arriben a taula embolicats, sobre una teula." },
        { title: "Es pelen i se sucen", text: "Se'ls treu la capa de fora, ennegrida pel foc, se sucen a la salsa i s'aixequen enlaire per portar-los a la boca, tal com mana la tradició. Una llesca de pa recull el que degota." },
        { title: "Després, la brasa", text: "Amb les brases es cou la carn de xai, la llonganissa i, de vegades, botifarra negra o carxofes. El porró de vi va passant de mà en mà." },
        { title: "I per acabar", text: "Taronja i postres (crema catalana, pastissos o merengues) i, per tradició, cava." },
      ]),
      ...paras(
        `**Quants calçots per persona?** La Cambra de Comerç parla d'entre 20 i 35, segons l'experiència i la gana de cadascú. Tradicionalment es mengen dret, i no t'oblidis del **pitet**, com recorda l'Ajuntament; porta roba que es pugui tacar. Més detalls a la guia [Com fer una calçotada](${URLS.festaHowTo}) de la festa.`,
        "**D'on ve?** Segons l'Ajuntament de Valls, la calçotada va néixer a Valls a finals del segle XIX, quan un pagès conegut com el Xat de Benaiges va rostir a la flama els brots d'unes cebes i se'ls va menjar amanits amb oli, vinagre i sal. A finals dels anys quaranta la Penya Artística de l'Olla la va fer conèixer fora de Valls, convidant-hi gent del món artístic i cultural de Barcelona.",
      ),
      ...h2(
        "La salsa: salvitxada o salsa de calçotada",
        "Els calçots se sucen en una salsa de fruits secs i hortalisses escalivades. El Departament d'Agricultura en diu **salsa salvitxada**; la Cambra de Comerç i l'Ajuntament de Valls en diuen **salsa de la calçotada**, i la Gran Festa en fa un concurs propi.",
        "Segons l'Ajuntament i la Cambra, els ingredients bàsics són ametlles i avellanes torrades, tomàquets i alls escalivats, oli d'oliva, vinagre, pebrot sec o pebre vermell dolç, julivert i sal, tot ben picat. Les proporcions són cosa de cada casa: «cada família té el seu secret», diu la Cambra.",
        "El 2026, la festa va incloure també una demostració de salsa per a celíacs i per a persones amb intolerància als fruits secs.",
      ),
      ...h2(
        "Com arribar a Valls des de Barcelona en transport públic",
        `**En tren: la línia R13 de Rodalies.** És la línia regional Barcelona-Estació de França – Lleida per Valls, amb parada també a Passeig de Gràcia i Sants ([fitxa de l'R13](${URLS.r13})). Hi ha pocs trens directes al dia i alguns només circulen els feiners, de manera que mira l'[horari de l'R13](${URLS.r13Timetable}) per al dia que hi vagis: l'horari del 10 de juliol de 2026 no mostra cap tren de l'R13 en diumenge. Des de l'11 de juliol de 2026 la línia torna a passar per Valls, després de les obres que la desviaven per Reus i Tarragona.`,
        `**En autobús: la línia Valls – Barcelona de Monbus**, amb parades a Barcelona Sants i a Maria Cristina. Segons l'horari del 14 de juliol de 2026, també té servei en diumenges i festius, amb com a mínim un bus per sentit. L'Ajuntament de Valls recull aquest horari i els de la resta de línies a la seva [pàgina de transport públic](${URLS.vallsTransport}).`,
        `**Des de Tarragona**, Autocars Plana té diverses línies Valls – Tarragona, segons l'Ajuntament. Si vols combinar la visita amb Tarragona, ${b2link("tarragona", "ca", "aquí tens com arribar-hi en tren des de Barcelona")}.`,
        festivalDayTransport("ca", programme),
      ),
      faq([
        {
          question: "Quan és la temporada de calçots?",
          answer: "De novembre a abril, segons la IGP Calçot de Valls. La campanya oficial de la IGP comença l'1 de novembre i acaba al final d'abril de l'any següent: aquesta temporada, de l'1 de novembre de 2026 a final d'abril de 2027.",
        },
        {
          question: "Quan és la Calçotada de Valls 2027?",
          answer: `El ${festa}. És la 45a Gran Festa de la Calçotada, que se celebra cada any l'últim diumenge de gener i l'organitzen la Cambra de Comerç i l'Ajuntament de Valls.`,
        },
        { question: "Quant costa el tiquet de la Calçotada de Valls 2027?", answer: ticketAnswer("ca", programme) },
        { question: "Quan es presenta el programa de la Calçotada de Valls 2027?", answer: programmeAnswer("ca", programme) },
        {
          question: "Com es mengen els calçots?",
          answer: "Se'ls treu la capa de fora, ennegrida pel foc, se sucen a la salsa i s'aixequen enlaire per menjar-los. Es mengen calents, tradicionalment drets i amb pitet, i després vénen la carn i la llonganissa a la brasa.",
        },
        {
          question: "Com es reconeixen els calçots IGP Calçot de Valls?",
          answer: "Per la cinta blava que lliga el manat i l'etiqueta numerada amb el nom «Calçot de Valls. Indicació Geogràfica Protegida» i el logotip de la IGP.",
        },
        {
          question: "Com puc anar a Valls sense cotxe?",
          answer: "En tren, amb l'R13 de Rodalies (Barcelona-Estació de França – Lleida per Valls), o en autobús, amb la línia Valls – Barcelona de Monbus, que para a Sants i a Maria Cristina. En diumenge, l'horari de l'R13 del 10 de juliol de 2026 no mostra cap tren, però el bus de Monbus sí que hi va: mira els horaris abans de sortir.",
        },
        {
          question: "Què és el Calçofest?",
          answer: `Un festival de música i gastronomia a Valls que fa la segona edició el ${calcofest}, amb activitats gratuïtes al matí, una calçotada popular de 13:00 a 15:00 i concerts a la tarda i al vespre.`,
        },
      ]),
      ...paras(verifiedLine("ca", CALCOTS_VERIFIED)),
      ...b2Related([...RELATED], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(calcotsLead("es", programme)),
      keyFacts("Calçots y Gran Festa, de un vistazo", [
        { label: "Temporada de calçots", value: "De noviembre a abril; la campaña de la IGP va del 1 de noviembre a finales de abril" },
        { label: "Gran Festa de la Calçotada 2027", value: `${festa.charAt(0).toUpperCase()}${festa.slice(1)}, en Valls (45.ª edición)` },
        { label: "Quién la organiza", value: "La Cambra de Comerç de Valls y el Ayuntamiento de Valls" },
        { label: "Programa y tickets de 2027", value: programmeFact("es", programme) },
        { label: "Antes: el Calçofest", value: `${calcofest.charAt(0).toUpperCase()}${calcofest.slice(1)}, en Valls (2.ª edición)` },
        { label: "Sin coche desde Barcelona", value: "Tren R13 de Rodalies o autobús Valls – Barcelona de Monbus" },
      ]),
      callout(
        "info",
        "Cómo tratamos las fechas",
        "Solo ponemos fechas de 2027 que hayan publicado los organizadores. Lo que se hizo en la edición de 2026 lleva siempre el año al lado: es lo que puedes esperar, no una confirmación.",
      ),
      ...h2(
        "¿Cuándo es la temporada de calçots?",
        `La IGP Calçot de Valls, el consejo regulador del producto, lo resume así: «La seva temporada és de novembre a abril» (de noviembre a abril). El [pliego de condiciones](${URLS.plec}) que publica la Generalitat pone las fechas: la campaña empieza el 1 de noviembre y termina a finales de abril del año siguiente, y los calçots de fuera de campaña no pueden venderse como IGP. Esta temporada, por tanto, va del 1 de noviembre de 2026 a finales de abril de 2027.`,
        "El Ayuntamiento de Valls coincide: los mejores momentos para una calçotada son los meses de invierno, «especialment des de novembre fins a abril». La Gran Festa de finales de enero cae en mitad de la temporada, y después aún quedan tres meses de calçotadas.",
      ),
      ...h2(
        "¿Cuándo es la Gran Festa de la Calçotada de Valls 2027?",
        `**El ${festa}.** La Cambra de Comerç de Valls lo anunció el 19 de octubre de 2026, al presentar la imagen de la 45.ª edición ([nota oficial](${URLS.festaPress2027})), y la web de la fiesta lo repite. La organizan la Cambra de Comerç y el Ayuntamiento de Valls.`,
        `No es una fecha al azar: según el [Ayuntamiento](${URLS.vallsCalcotada}), la Gran Festa se celebra cada año el último domingo de enero, y en Valls se hace desde 1982. El 31 de enero de 2027 es, efectivamente, el último domingo del mes.`,
        pendingParagraph("es", programme),
      ),
      ...h3(
        "¿Cuándo salen el programa y los tickets?",
        "Para la edición de 2026 (25 de enero de 2026), la venta anticipada del lote de degustación se abrió el 8 de enero de 2026 en la web oficial, y los 1.800 tickets anticipados se agotaron en seis días. La presentación oficial fue el 21 de enero de 2026, cuatro días antes de la fiesta, y el mismo domingo se vendieron otros 1.800 lotes, que se acabaron a mediodía.",
        ticketTip("es", programme),
      ),
      ...h2("Cómo fue la Gran Festa de 2026 (lo que puedes esperar)", pastIntro("es", programme)),
      list(
        "**Desde las 10:00 (2026):** demostraciones de cocer calçots a la parrilla en el aparcamiento de la calle de Sant Antoni, junto a la plaza de l'Oli, y, en la plaza del Blat, el concurso de cultivadores de calçots y el concurso de salsa de la calçotada.",
        "**A las 13:00 (2026):** concurso de comer calçots en la plaza del Pati, que empieza con los pilares de la Colla Joves y la Colla Vella dels Xiquets de Valls; los premios de 2026 se entregaron a las 14:00.",
        "**La degustación (2026):** el lote costaba 15 € el mismo día, en las taquillas de la plaza del Pati, el Ayuntamiento y el Institut d'Estudis Vallencs. Incluía 12 calçots IGP cocidos, salsa, vino, pan, agua, una naranja, postre y un babero, y se comía en el espacio de degustación del aparcamiento de la Societat Agrícola, con mesas y parrillas para hacer la carne.",
        "**Un aviso de la organización (2026):** para no comer calçots en la vía pública, todas las degustaciones se hacían en el espacio habilitado.",
      ),
      ...paras(
        `Según el [balance de la organización](${URLS.festa2026Summary}), en 2026 fueron unos 35.000 visitantes y se sirvieron 3.600 degustaciones. Es una fiesta en la calle en pleno enero: antes de salir, mira ${b2link("climate", "es", "qué tiempo suele hacer en enero")}.`,
      ),
      ...h2(
        "Calçofest 2026: el sábado 21 de noviembre en Valls",
        `Antes de la Gran Festa, Valls tiene otra cita: el **Calçofest**, que celebra su segunda edición el **${calcofest}**. Según el Ayuntamiento de Valls, se ha consolidado como una de las citas que dan el pistoletazo de salida a la temporada de calçotadas, y combina actividades gratuitas por la mañana, una calçotada popular y conciertos por la tarde y la noche.`,
      ),
      list(
        `**Calçotada popular:** de 13:00 a 15:00 en el aparcamiento de la Cooperativa, con 1.500 degustaciones a 15 € más gastos de gestión. Los tickets se compran en la [web del Calçofest](${URLS.calcofest}).`,
        "**Conciertos:** Figa Flawas, The Tyets, Els Pets y Els Amics de les Arts, entre otros.",
        "**Autobús desde Barcelona:** la organización del Calçofest ha programado un autobús oficial de ida y vuelta desde la zona de la Estació de França, con salida a las 14:30, pensado para los conciertos (no llega a la calçotada de 13:00 a 15:00), sujeto a un mínimo de ocupación y con vuelta al acabar la música. En Valls, un autobús lanzadera gratuito une la estación de autobuses con el recinto.",
      ),
      ...paras(
        `Fuente: [Ayuntamiento de Valls, 15 de octubre de 2026](${URLS.vallsCalcofest}). El precio de las entradas de los conciertos sube a medida que se acerca la fecha; consúltalo en la web del festival. Para el resto de ferias gastronómicas del otoño, ${link("foodfairs", "es", "mira nuestro calendario")}.`,
      ),
      ...h2(
        "¿Qué es un calçot y qué garantiza la IGP Calçot de Valls?",
        "El calçot es el brote tierno de una cebolla blanca y dulce que se asa a la llama viva. El nombre viene de cómo se cultiva: mientras crece, a la planta se le va «calzando», es decir, se le arrima tierra alrededor para que la base quede blanca. Es un cultivo largo: se siembra la cebolla, se arranca, se guarda un tiempo, se vuelve a plantar medio enterrada y se calza varias veces hasta la cosecha.",
        `La **IGP Calçot de Valls** (Indicación Geográfica Protegida) es el sello europeo que ampara los calçots de una zona y de una forma de cultivo concretas. Según la [ficha del Departament d'Agricultura](${URLS.gencatIgp}):`,
      ),
      list(
        "**Variedad:** cebollas Allium cepa L. de la variedad Blanca Gran Tardana de Lleida.",
        "**Zona de producción:** cuatro comarcas, el Alt Camp, el Baix Camp, el Tarragonès y el Baix Penedès.",
        "**Tamaño:** una parte blanca de 15 a 25 cm de largo.",
        "**Normativa:** inscrita en el registro de la UE por el Reglamento (CE) 905/2002; el reglamento de la IGP es la Orden AAR/414/2009 de la Generalitat.",
        "**Producción:** 1.750 toneladas en 2023 y 47 productores inscritos, según la ficha del Departament (actualizada el 2 de julio de 2026).",
      ),
      ...h3(
        "Cómo saber si un manojo es IGP",
        "Fíjate en la atadura y la etiqueta. Los calçots IGP se venden en manojos atados con una cinta azul y una **etiqueta numerada** con el nombre «Calçot de Valls. Indicació Geogràfica Protegida» y el logotipo de la IGP; el Ayuntamiento de Valls añade que figura el nombre del productor. Según el pliego de condiciones, solo salen al mercado con esa etiqueta los calçots que han superado todos los controles. Un calçot sin etiqueta puede ser bueno, pero no tiene la garantía de la IGP.",
      ),
      ...h2(
        "Cómo es una calçotada y cómo se comen los calçots",
        "La calçotada es más un ritual que un plato: una comida en grupo, al aire libre si el tiempo acompaña, con los calçots de protagonistas. Así la describen el Ayuntamiento de Valls y la Cambra de Comerç:",
      ),
      steps("La calçotada, paso a paso", [
        { title: "Se preparan los calçots", text: "Se recortan las hojas verdes y las raíces, con cuidado de no acortar el calçot." },
        { title: "Se asan a la llama viva", text: "En la parrilla, con un fuego vivo de sarmientos de viña. Mientras se asan, se retira la parrilla del fuego dos o tres veces para darles la vuelta uno a uno." },
        { title: "Se guardan envueltos", text: "Cuando la punta se ablanda y la piel se ha ennegrecido, se hacen paquetes con papel de periódico para que no se enfríen, y llegan a la mesa envueltos, sobre una teja." },
        { title: "Se pelan y se mojan", text: "Se les quita la capa de fuera, ennegrecida por el fuego, se mojan en la salsa y se levantan en alto para llevárselos a la boca, como manda la tradición. Una rebanada de pan recoge lo que gotea." },
        { title: "Después, la brasa", text: "Con las brasas se hace la carne de cordero, la longaniza y, a veces, butifarra negra o alcachofas. El porrón de vino pasa de mano en mano." },
        { title: "Y para terminar", text: "Naranja y postres (crema catalana, pasteles o merengues) y, por tradición, cava." },
      ]),
      ...paras(
        `**¿Cuántos calçots por persona?** La Cambra de Comerç habla de entre 20 y 35, según la experiencia y el hambre de cada uno. Tradicionalmente se comen de pie, y no olvides el **babero**, como recuerda el Ayuntamiento; lleva ropa que se pueda manchar. Más detalles en la guía [Com fer una calçotada](${URLS.festaHowTo}) de la fiesta (en catalán).`,
        "**¿De dónde viene?** Según el Ayuntamiento de Valls, la calçotada nació en Valls a finales del siglo XIX, cuando un payés conocido como el Xat de Benaiges asó a la llama los brotes de unas cebollas y se los comió aliñados con aceite, vinagre y sal. A finales de los años cuarenta la Penya Artística de l'Olla la dio a conocer fuera de Valls, invitando a gente del mundo artístico y cultural de Barcelona.",
      ),
      ...h2(
        "La salsa: salvitxada o salsa de calçotada",
        "Los calçots se mojan en una salsa de frutos secos y hortalizas asadas. El Departament d'Agricultura la llama **salsa salvitxada**; la Cambra de Comerç y el Ayuntamiento de Valls la llaman **salsa de la calçotada**, y la Gran Festa le dedica un concurso propio.",
        "Según el Ayuntamiento y la Cambra, los ingredientes básicos son almendras y avellanas tostadas, tomates y ajos asados, aceite de oliva, vinagre, pimiento seco o pimentón dulce, perejil y sal, todo bien picado. Las proporciones son cosa de cada casa: «cada família té el seu secret» (cada familia tiene su secreto), dice la Cambra.",
        "En 2026, la fiesta incluyó también una demostración de salsa para celíacos y para personas con intolerancia a los frutos secos.",
      ),
      ...h2(
        "Cómo llegar a Valls desde Barcelona en transporte público",
        `**En tren: la línea R13 de Rodalies.** Es la línea regional Barcelona-Estació de França – Lleida por Valls, que también para en Passeig de Gràcia y Sants ([ficha de la R13](${URLS.r13})). Hay pocos trenes directos al día y algunos solo circulan los laborables, así que mira el [horario de la R13](${URLS.r13Timetable}) para el día que vayas: el horario del 10 de julio de 2026 no muestra ningún tren de la R13 en domingo. Desde el 11 de julio de 2026 la línea vuelve a pasar por Valls, tras las obras que la desviaban por Reus y Tarragona.`,
        `**En autobús: la línea Valls – Barcelona de Monbus**, con paradas en Barcelona Sants y en Maria Cristina. Según el horario del 14 de julio de 2026, también tiene servicio en domingos y festivos, con al menos un autobús por sentido. El Ayuntamiento de Valls recoge este horario y los del resto de líneas en su [página de transporte público](${URLS.vallsTransport}).`,
        `**Desde Tarragona**, Autocars Plana tiene varias líneas Valls – Tarragona, según el Ayuntamiento. Si quieres combinar la visita con Tarragona, ${b2link("tarragona", "es", "aquí tienes cómo llegar en tren desde Barcelona")}.`,
        festivalDayTransport("es", programme),
      ),
      faq([
        {
          question: "¿Cuándo es la temporada de calçots?",
          answer: "De noviembre a abril, según la IGP Calçot de Valls. La campaña oficial de la IGP empieza el 1 de noviembre y termina a finales de abril del año siguiente: esta temporada, del 1 de noviembre de 2026 a finales de abril de 2027.",
        },
        {
          question: "¿Cuándo es la Calçotada de Valls 2027?",
          answer: `El ${festa}. Es la 45.ª Gran Festa de la Calçotada, que se celebra cada año el último domingo de enero y que organizan la Cambra de Comerç y el Ayuntamiento de Valls.`,
        },
        { question: "¿Cuánto cuesta el ticket de la Calçotada de Valls 2027?", answer: ticketAnswer("es", programme) },
        { question: "¿Cuándo se presenta el programa de la Calçotada de Valls 2027?", answer: programmeAnswer("es", programme) },
        {
          question: "¿Cómo se comen los calçots?",
          answer: "Se les quita la capa de fuera, ennegrecida por el fuego, se mojan en la salsa y se levantan en alto para comerlos. Se comen calientes, tradicionalmente de pie y con babero, y después llegan la carne y la longaniza a la brasa.",
        },
        {
          question: "¿Cómo se reconocen los calçots IGP Calçot de Valls?",
          answer: "Por la cinta azul que ata el manojo y la etiqueta numerada con el nombre «Calçot de Valls. Indicació Geogràfica Protegida» y el logotipo de la IGP.",
        },
        {
          question: "¿Cómo ir a Valls sin coche?",
          answer: "En tren, con la R13 de Rodalies (Barcelona-Estació de França – Lleida por Valls), o en autobús, con la línea Valls – Barcelona de Monbus, que para en Sants y en Maria Cristina. En domingo, el horario de la R13 del 10 de julio de 2026 no muestra ningún tren, pero el autobús de Monbus sí va: mira los horarios antes de salir.",
        },
        {
          question: "¿Qué es el Calçofest?",
          answer: `Un festival de música y gastronomía en Valls que celebra su segunda edición el ${calcofest}, con actividades gratuitas por la mañana, una calçotada popular de 13:00 a 15:00 y conciertos por la tarde y la noche.`,
        },
      ]),
      ...paras(verifiedLine("es", CALCOTS_VERIFIED)),
      ...b2Related([...RELATED], "es"),
    ];
  }

  return [
    lead(calcotsLead("en", programme)),
    keyFacts("Calçots and the Gran Festa at a glance", [
      { label: "Calçot season", value: "November to April; the IGP campaign runs from 1 November to the end of April" },
      { label: "Gran Festa de la Calçotada 2027", value: `${festa}, in Valls (45th edition)` },
      { label: "Organised by", value: "The Valls Chamber of Commerce (Cambra de Comerç) and Valls City Council" },
      { label: "2027 programme and tickets", value: programmeFact("en", programme) },
      { label: "Before that: Calçofest", value: `${calcofest}, in Valls (2nd edition)` },
      { label: "Without a car from Barcelona", value: "Rodalies R13 train or the Monbus Valls – Barcelona bus" },
    ]),
    callout(
      "info",
      "How we handle dates",
      "We give a 2027 date only once the organisers have published it. Anything from the 2026 edition always carries its year: it is what you can expect, not a confirmation.",
    ),
    ...h2(
      "When is calçot season?",
      `The IGP Calçot de Valls, the body that regulates the product, puts it simply: "La seva temporada és de novembre a abril" (its season is November to April). The Generalitat's [product specification](${URLS.plec}) gives the dates: the campaign starts on 1 November and ends at the end of April the following year, and calçots grown outside it cannot be sold as IGP. This season, then, runs from 1 November 2026 to the end of April 2027.`,
      "Valls City Council agrees: the best time for a calçotada is the winter months, \"especially from November to April\". The Gran Festa at the end of January falls in the middle of the season, with three more months of calçotades after it.",
    ),
    ...h2(
      "When is the Valls Calçotada 2027?",
      `**On ${festa}.** The Valls Chamber of Commerce announced it on 19 October 2026, when it unveiled the poster for the 45th edition ([official note](${URLS.festaPress2027})), and the festival website repeats it. The festival is organised by the Chamber of Commerce and Valls City Council.`,
      `The date is not random: according to the [City Council](${URLS.vallsCalcotada}), the Gran Festa is held every year on the last Sunday of January, and Valls has held it since 1982. 31 January 2027 is indeed the last Sunday of the month.`,
      pendingParagraph("en", programme),
    ),
    ...h3(
      "When do the programme and tickets come out?",
      "For the 2026 edition (25 January 2026), the advance sale of the tasting pack opened on the official website on 8 January 2026, and the 1,800 advance tickets sold out in six days. The official presentation was on 21 January 2026, four days before the festival, and on the day itself another 1,800 packs were sold, running out by midday.",
      ticketTip("en", programme),
    ),
    ...h2("What the 2026 Gran Festa was like (what to expect)", pastIntro("en", programme)),
    list(
      "**From 10:00 (2026):** calçot-grilling demonstrations in the car park on Carrer de Sant Antoni, next to Plaça de l'Oli, and, on Plaça del Blat, the calçot growers' contest and the calçotada sauce contest.",
      "**At 13:00 (2026):** the calçot-eating contest on Plaça del Pati, opened by the human-tower pillars of the Colla Joves and Colla Vella dels Xiquets de Valls; the 2026 prizes were handed out at 14:00.",
      "**The tasting (2026):** the pack cost €15 on the day, from the ticket points on Plaça del Pati, at the City Council and at the Institut d'Estudis Vallencs. It included 12 cooked IGP calçots, sauce, wine, bread, water, an orange, dessert and a bib, eaten in the tasting area in the Societat Agrícola car park, with tables and grills for your own meat.",
      "**A request from the organisers (2026):** so that nobody eats calçots in the street, all tastings took place in the tasting area.",
    ),
    ...paras(
      `According to the [organisers' round-up](${URLS.festa2026Summary}), about 35,000 people came in 2026 and 3,600 tastings were served. It is a street festival in the middle of January: before you set off, check ${b2link("climate", "en", "what the weather is usually like in January")}.`,
    ),
    ...h2(
      "Calçofest 2026: Saturday 21 November in Valls",
      `Before the Gran Festa, Valls has another date: **Calçofest**, whose second edition is on **${calcofest}**. According to Valls City Council it has become one of the events that open the calçotada season, combining free activities in the morning, a popular calçotada and concerts in the afternoon and evening.`,
    ),
    list(
      `**Popular calçotada:** 13:00 to 15:00 in the Cooperativa car park, with 1,500 tastings at €15 plus booking fees. Tickets are sold on the [Calçofest website](${URLS.calcofest}).`,
      "**Concerts:** Figa Flawas, The Tyets, Els Pets and Els Amics de les Arts, among others.",
      "**Bus from Barcelona:** the Calçofest organisers have arranged an official return bus from the Estació de França area, leaving at 14:30 and timed for the concerts (it does not reach the 13:00-15:00 calçotada), subject to a minimum number of passengers and returning after the music ends. In Valls, a free shuttle bus links the bus station with the festival site.",
    ),
    ...paras(
      `Source: [Valls City Council, 15 October 2026](${URLS.vallsCalcofest}). Concert ticket prices rise as the date approaches; check them on the festival website. For the other autumn food fairs, ${link("foodfairs", "en", "see our calendar")}.`,
    ),
    ...h2(
      "What is a calçot, and what does the IGP Calçot de Valls guarantee?",
      "A calçot is the tender shoot of a sweet white onion, cooked over open flames. The name comes from how it is grown: as the plant grows, soil is heaped around it (calçar in Catalan) so that the base stays white. It is a long process: the onion is sown, lifted, stored for a while, replanted half-buried and earthed up several times before the harvest.",
      `The **IGP Calçot de Valls** (Protected Geographical Indication) is the EU label that protects calçots from a specific area grown in a specific way. According to the [Catalan Department of Agriculture](${URLS.gencatIgp}):`,
    ),
    list(
      "**Variety:** Allium cepa L. onions of the Blanca Gran Tardana de Lleida variety.",
      "**Growing area:** four comarques (counties): Alt Camp, Baix Camp, Tarragonès and Baix Penedès.",
      "**Size:** a white stem 15 to 25 cm long.",
      "**Rules:** entered in the EU register by Regulation (EC) 905/2002; the IGP's own regulation is the Generalitat's Ordre AAR/414/2009.",
      "**Output:** 1,750 tonnes in 2023 and 47 registered growers, according to the Department's page (updated 2 July 2026).",
    ),
    ...h3(
      "How to tell an IGP bunch",
      "Look at the tie and the tag. IGP calçots are sold in bunches tied with a blue ribbon and a **numbered label** bearing the name \"Calçot de Valls. Indicació Geogràfica Protegida\" and the IGP logo; Valls City Council adds that the grower's name is on it. Under the product specification, only calçots that have passed every check reach the market with that label. A calçot without one may be good, but it has no IGP guarantee.",
    ),
    ...h2(
      "How a calçotada works and how to eat calçots",
      "A calçotada is more a ritual than a dish: a group lunch, outdoors if the weather allows, with calçots as the star. This is how Valls City Council and the Chamber of Commerce describe it:",
    ),
    steps("A calçotada, step by step", [
      { title: "Prepare the calçots", text: "Trim the green leaves and the roots, taking care not to shorten the calçot itself." },
      { title: "Grill them over open flames", text: "On a grill over a lively fire of vine cuttings. While they cook, the grill is taken off the fire two or three times to turn them one by one." },
      { title: "Keep them wrapped", text: "Once the tips go soft and the skin has blackened, they are bundled in newspaper so they stay hot, and reach the table still wrapped, on a roof tile." },
      { title: "Peel and dip", text: "Pull off the charred outer layer, dip the calçot in the sauce and lift it high to lower it into your mouth, as tradition demands. A slice of bread underneath catches the drips." },
      { title: "Then the embers", text: "The embers cook the lamb and the llonganissa sausage and sometimes black botifarra or artichokes. The porró of wine is passed from hand to hand." },
      { title: "And to finish", text: "Oranges and desserts (crema catalana, pastries or meringues) and, by tradition, cava." },
    ]),
    ...paras(
      `**How many calçots each?** The Chamber of Commerce says between 20 and 35, depending on experience and appetite. They are traditionally eaten standing up, and do not forget the **bib**, as the City Council reminds visitors; wear clothes that can take a stain. More in the festival's [Com fer una calçotada](${URLS.festaHowTo}) guide (in Catalan).`,
      "**Where does it come from?** According to Valls City Council, the calçotada was born in Valls at the end of the 19th century, when a farmer known as the Xat de Benaiges roasted onion shoots over a flame and ate them dressed with oil, vinegar and salt. In the late 1940s the Penya Artística de l'Olla made it known beyond Valls by inviting people from Barcelona's arts and culture world.",
    ),
    ...h2(
      "The sauce: salvitxada or calçotada sauce",
      "Calçots are dipped in a sauce of nuts and roasted vegetables. The Department of Agriculture calls it **salvitxada**; the Chamber of Commerce and Valls City Council call it **salsa de la calçotada** (calçotada sauce), and the Gran Festa holds a contest for it.",
      "According to the City Council and the Chamber, the basic ingredients are toasted almonds and hazelnuts, roasted tomatoes and garlic, olive oil, vinegar, dried pepper or sweet paprika, parsley and salt, all finely ground. The proportions are each household's business: \"every family has its secret\", says the Chamber.",
      "In 2026 the festival also included a sauce demonstration for people with coeliac disease and nut intolerance.",
    ),
    ...h2(
      "Getting to Valls from Barcelona by public transport",
      `**By train: the Rodalies R13.** This is the regional line from Barcelona-Estació de França to Lleida via Valls, also calling at Passeig de Gràcia and Sants ([R13 line page](${URLS.r13})). There are only a few direct trains a day and some run on working weekdays only, so check the [R13 timetable](${URLS.r13Timetable}) for the day you travel: the 10 July 2026 timetable shows no R13 train on Sundays. Since 11 July 2026 the line runs through Valls again, after engineering works that had diverted it via Reus and Tarragona.`,
      `**By bus: the Monbus Valls – Barcelona line**, with stops at Barcelona Sants and Maria Cristina. Its timetable of 14 July 2026 includes Sundays and public holidays, with at least one bus each way. Valls City Council collects this and the other bus timetables on its [public transport page](${URLS.vallsTransport}).`,
      `**From Tarragona**, Autocars Plana runs several Valls – Tarragona routes, according to the City Council. To combine the trip with Tarragona, ${b2link("tarragona", "en", "here is how to get there by train from Barcelona")}.`,
      festivalDayTransport("en", programme),
    ),
    faq([
      {
        question: "When is calçot season?",
        answer: "November to April, according to the IGP Calçot de Valls. The IGP's official campaign starts on 1 November and ends at the end of April the following year: this season, from 1 November 2026 to the end of April 2027.",
      },
      {
        question: "When is the Valls Calçotada 2027?",
        answer: `On ${festa}. It is the 45th Gran Festa de la Calçotada, held every year on the last Sunday of January and organised by the Valls Chamber of Commerce and City Council.`,
      },
      { question: "How much is a ticket for the 2027 Valls Calçotada?", answer: ticketAnswer("en", programme) },
      { question: "When is the 2027 Valls Calçotada programme announced?", answer: programmeAnswer("en", programme) },
      {
        question: "How do you eat calçots?",
        answer: "Pull off the charred outer layer, dip the calçot in the sauce and lift it high to eat it. They are eaten hot, traditionally standing up and wearing a bib, followed by grilled meat and sausage.",
      },
      {
        question: "How can I tell IGP Calçot de Valls calçots?",
        answer: "By the blue ribbon tying the bunch and the numbered label with the name \"Calçot de Valls. Indicació Geogràfica Protegida\" and the IGP logo.",
      },
      {
        question: "How do I get to Valls without a car?",
        answer: "By train on the Rodalies R13 (Barcelona-Estació de França to Lleida via Valls), or by bus on the Monbus Valls – Barcelona line, which stops at Sants and Maria Cristina. On Sundays the 10 July 2026 R13 timetable shows no train, but the Monbus coach does run: check the timetables before you set off.",
      },
      {
        question: "What is Calçofest?",
        answer: `A music and food festival in Valls whose second edition is on ${calcofest}, with free activities in the morning, a popular calçotada from 13:00 to 15:00 and concerts in the afternoon and evening.`,
      },
    ]),
    ...paras(verifiedLine("en", CALCOTS_VERIFIED)),
    ...b2Related([...RELATED], "en"),
  ];
}

export const CALCOTS: B2Article = {
  key: "calcots",
  entryKey: "guide-calcots-calcotada-valls",
  categoryKey: "festivals",
  sources: SOURCES,
  // Reused from the manifest, not a new photograph (see the header comment).
  heroKey: TRAINS.heroKey,
  // Same alt and caption as TRAINS: media rows are keyed by file, so
  // different wording here would overwrite that page's on every publish.
  heroAlt: TRAINS.heroAlt,
  heroCaption: TRAINS.heroCaption,
  verifiedAt: CALCOTS_VERIFIED,
  publishedAt: "2026-10-26T12:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...CALCOTS_META[locale], blocks: buildCalcotsBody(locale) }]),
  ) as B2Article["editions"],
};
