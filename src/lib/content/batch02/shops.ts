import type { Locale } from "@/lib/i18n/config";
import { weekdayDayMonth } from "@/lib/programmatic/holidays/format";

import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Shops open on Sundays and holidays in Catalonia: the yearly calendar.
 *
 * Re-checked on 24 Oct 2026 against the DOGC texts themselves (Ordre EMT/77/2025
 * for 2026, Resolució EMT/4342/2025 for the 2026 municipal days, Ordre
 * EMT/89/2026 for 2027), the BOE consolidated text of Llei 18/2017 (in force
 * from 1 Jan 2026) and Barcelona City Council's 2026 timetable sheet.
 *
 * Fixed on 24 Oct: the "75 hours a week" limit was removed - art. 36.2.b was
 * declared void by STC 117/2022. The "sales traditionally start on 7 January"
 * line was removed: the Agència Catalana del Consum gives no date, only that
 * the Consell Assessor recommends dates each year. Added from the texts: 1 Nov
 * 2026 is an opening day only in l'Ametlla del Vallès and Mollet del Vallès
 * (Resolució EMT/4342/2025); the art. 37 exclusions (bakeries,
 * convenience stores, pharmacies...) are outside the art. 36
 * limits; the 2027 order's consecutive-holidays rule (art. 4.2) and the food
 * retailers' three-date swap (art. 6).
 *
 * The 2027 municipal days are not published yet (councils had until 1 Nov
 * 2026; the DOGC list came out on 27 Nov last year): the page says so and
 * gives the default that applies when a council chooses none.
 *
 * 30 Oct 2026 (top-3 push):
 * - Resolució EMT/4342/2025 re-read in full: every one of its 83
 *   municipalities compared with the default November-December days
 *   (29 Nov; 6, 8, 13, 20, 27 Dec). The 30 that differ are in
 *   TOWNS_NOV_DEC below, transcribed from the DOGC text (several lists print
 *   "6, 8,13" without a space: La Garriga, Masquefa, Pallejà, Piera and Roda
 *   de Ter keep all six days; Sallent prints "6,13" and drops the 8th).
 * - Art. 37.1.j and 37.1.k of Llei 18/2017 (shops of up to 300 m² selling
 *   everyday food, and SME shops of up to 300 m²) ARE in force: STC 117/2022
 *   voided the 2017 wording, and Llei 3/2023, art. 83 (BOE-A-2023-10344)
 *   added both letters back; the BOE consolidated text prints them. The
 *   24 Oct note that removed them from this page was wrong; they are back in
 *   the "always open" list.
 *
 * 30 Oct 2026 (CTR sweep wave 4, logged in docs/SEO_EXPERIMENTS.md): the CA
 * title in the searchers' words ("festius obertura comercial 2026", "festius
 * oberts", "diumenges oberts 2026"), like the ES one, and a first FAQ for
 * "quins festius d'obertura queden". No new facts: the dates and the count
 * are the ones above.
 */

const VERIFIED = "2026-10-30";

const SOURCES: B2Source[] = [
  { name: "Ordre EMT/77/2025, calendari d'obertura comercial en diumenges i festius per al 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1015009&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Resolució EMT/4342/2025, dies festius d'obertura comercial dels municipis per al 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1030324&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Ordre EMT/89/2026, calendari d'obertura comercial en diumenges i festius per al 2027", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1045357&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Llei 18/2017, de comerç, serveis i fires (text consolidat, articles 36 i 37)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11320", publisher: "BOE" },
  { name: "Llei 3/2023, de mesures fiscals, financeres, administratives i del sector públic per al 2023 (article 83: lletres j i k de l'article 37.1 de la Llei 18/2017)", url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2023-10344", publisher: "BOE" },
  { name: "Horaris comercials", url: "https://ajuntament.barcelona.cat/comerc/ca/el-comerc-barcelona/horaris-comercials", publisher: "Ajuntament de Barcelona" },
  { name: "Horaris comercials 2026", url: "https://ajuntament.barcelona.cat/comerc/sites/default/files/2026-01/Horaris%20Comercial%202026.pdf", publisher: "Ajuntament de Barcelona" },
  { name: "Rebaixes", url: "https://consum.gencat.cat/ca/els-meus-drets/rebaixes/", publisher: "Agència Catalana del Consum" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/botigues-obertes-festius-catalunya",
    title: "Botigues obertes en diumenges i festius a Catalunya: calendari 2026 i 2027",
    seoTitle: "Festius i diumenges d'obertura 2026 a Catalunya i Barcelona",
    seoDescription:
      "Festius d'obertura que queden el 2026: 29 de novembre i 6, 8, 13, 20 i 27 de desembre. Els 30 municipis que en canvien algun, i el calendari 2027.",
    excerpt:
      "Els diumenges i festius en què les botigues poden obrir a Catalunya, segons el DOGC: el que queda del 2026, el calendari del 2027 i les botigues que poden obrir sempre.",
  },
  es: {
    path: "guias/tiendas-abiertas-festivos-cataluna",
    title: "Tiendas abiertas en domingos y festivos en Cataluña: calendario 2026 y 2027",
    seoTitle: "Domingos y festivos de apertura 2026 en Cataluña y Barcelona",
    seoDescription:
      "Festivos de apertura que quedan en 2026: 29 de noviembre y 6, 8, 13, 20 y 27 de diciembre. Los 30 municipios que cambian alguno, y el calendario 2027.",
    excerpt:
      "Los domingos y festivos en que las tiendas pueden abrir en Cataluña, según el DOGC: lo que queda de 2026, el calendario de 2027 y las tiendas que pueden abrir siempre.",
  },
  en: {
    path: "guides/shops-open-sundays-holidays-catalonia",
    title: "Shops open on Sundays and holidays in Catalonia: 2026 and 2027 dates",
    seoTitle: "Shops open on Sundays in Barcelona & Catalonia: 2026-27",
    seoDescription:
      "Shop opening days left in 2026: 29 November and 6, 8, 13, 20 and 27 December. The 30 towns that change one of them, and the 2027 calendar.",
    excerpt:
      "The Sundays and holidays when shops may open in Catalonia, from the official gazette: what is left of 2026, the 2027 calendar and the shops that may always open.",
  },
};

type Row = [Record<Locale, string>, Record<Locale, string>];

const D = (ca: string, es: string, en: string) => ({ ca, es, en });

/** Barcelona and every municipality without its own list (Resolució EMT/4342/2025). */
const DAYS_2026_LEFT: Row[] = [
  [D("Diumenge 1 de novembre (Tots Sants)", "Domingo 1 de noviembre (Todos los Santos)", "Sunday 1 November (All Saints)"), D("No és dia d'obertura, excepte a l'Ametlla del Vallès i Mollet del Vallès", "No es día de apertura, salvo en l'Ametlla del Vallès y Mollet del Vallès", "Not an opening day, except in l'Ametlla del Vallès and Mollet del Vallès")],
  [D("Diumenge 29 de novembre", "Domingo 29 de noviembre", "Sunday 29 November"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 6 de desembre", "Domingo 6 de diciembre", "Sunday 6 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Dimarts 8 de desembre", "Martes 8 de diciembre", "Tuesday 8 December"), D("Dia municipal (Barcelona i per defecte)", "Día municipal (Barcelona y por defecto)", "Municipal day (Barcelona and default)")],
  [D("Diumenge 13 de desembre", "Domingo 13 de diciembre", "Sunday 13 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 20 de desembre", "Domingo 20 de diciembre", "Sunday 20 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 27 de desembre", "Domingo 27 de diciembre", "Sunday 27 December"), D("Calendari general", "Calendario general", "General calendar")],
];

/** Ordre EMT/89/2026, article 1, and the article 5 default municipal days. */
const DAYS_2027: Row[] = [
  [D("Diumenge 3 de gener", "Domingo 3 de enero", "Sunday 3 January"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 10 de gener", "Domingo 10 de enero", "Sunday 10 January"), D("Dia municipal per defecte", "Día municipal por defecto", "Default municipal day")],
  [D("Diumenge 27 de juny", "Domingo 27 de junio", "Sunday 27 June"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Dilluns 1 de novembre", "Lunes 1 de noviembre", "Monday 1 November"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 28 de novembre", "Domingo 28 de noviembre", "Sunday 28 November"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 5 de desembre", "Domingo 5 de diciembre", "Sunday 5 December"), D("Dia municipal per defecte", "Día municipal por defecto", "Default municipal day")],
  [D("Dilluns 6 de desembre", "Lunes 6 de diciembre", "Monday 6 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Dimecres 8 de desembre", "Miércoles 8 de diciembre", "Wednesday 8 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 12 de desembre", "Domingo 12 de diciembre", "Sunday 12 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 19 de desembre", "Domingo 19 de diciembre", "Sunday 19 December"), D("Calendari general", "Calendario general", "General calendar")],
];

/**
 * Every municipality in Resolució EMT/4342/2025 whose shop opening days from
 * 1 November to 31 December 2026 differ from the default (29 Nov; 6, 8, 13,
 * 20 and 27 Dec): `closed` = default days it does not open, `extra` = days it
 * adds. Transcribed from the DOGC text on 30 Oct 2026.
 */
export const TOWNS_NOV_DEC: { town: string; closed: string[]; extra: string[] }[] = [
  { town: "L'Ametlla del Vallès", closed: [], extra: ["2026-11-01"] },
  { town: "Argentona", closed: ["2026-12-08"], extra: [] },
  { town: "Artés", closed: ["2026-12-08"], extra: [] },
  { town: "Badalona", closed: ["2026-12-08"], extra: [] },
  { town: "Caldes de Montbui", closed: ["2026-12-08"], extra: [] },
  { town: "Cardedeu", closed: ["2026-12-08"], extra: [] },
  { town: "Cassà de la Selva", closed: ["2026-12-08"], extra: [] },
  { town: "Celrà", closed: ["2026-12-08"], extra: [] },
  { town: "Centelles", closed: ["2026-12-08"], extra: ["2026-12-31"] },
  { town: "Gavà", closed: ["2026-12-08"], extra: ["2026-12-14"] },
  { town: "Gironella", closed: ["2026-11-29", "2026-12-27"], extra: [] },
  { town: "Manlleu", closed: ["2026-12-08"], extra: [] },
  { town: "Manresa", closed: ["2026-12-08"], extra: [] },
  { town: "Martorell", closed: ["2026-11-29"], extra: [] },
  { town: "Mollet del Vallès", closed: ["2026-12-08"], extra: ["2026-11-01"] },
  { town: "Montcada i Reixac", closed: ["2026-12-08"], extra: [] },
  { town: "Olèrdola", closed: ["2026-12-08"], extra: [] },
  { town: "Olot", closed: ["2026-12-13"], extra: [] },
  { town: "Riells i Viabrea", closed: ["2026-12-06"], extra: ["2026-11-09"] },
  { town: "Sallent", closed: ["2026-12-08"], extra: [] },
  { town: "Salt", closed: ["2026-11-29"], extra: [] },
  { town: "Sant Andreu de la Barca", closed: [], extra: ["2026-11-30"] },
  { town: "Sant Boi de Llobregat", closed: [], extra: ["2026-12-07"] },
  { town: "Sant Esteve Sesrovires", closed: ["2026-12-08"], extra: [] },
  { town: "Sant Jordi Desvalls", closed: ["2026-12-08"], extra: [] },
  { town: "Sant Vicenç de Castellet", closed: ["2026-12-08"], extra: [] },
  { town: "Santa Coloma de Gramenet", closed: ["2026-12-08"], extra: [] },
  { town: "La Selva del Camp", closed: ["2026-12-08"], extra: [] },
  { town: "Terrassa", closed: ["2026-12-06"], extra: [] },
  { town: "Ulldecona", closed: ["2026-12-08"], extra: [] },
];

/** The towns that do not open on Tuesday 8 December, for the lead and the FAQ. */
const NO_8_DEC = TOWNS_NOV_DEC.filter((t) => t.closed.includes("2026-12-08")).map((t) => t.town);

type T = {
  lead: string;
  note: string;
  leftTitle: string;
  leftCaption: string;
  leftHeaders: string[];
  leftNote: string;
  townsTitle: string;
  townsLead: string;
  townsCaption: string;
  townsHeaders: string[];
  townsNote: string;
  townsSame: string;
  mallsTitle: string;
  malls: string[];
  alwaysTitle: string;
  always: string[];
  alwaysList: string[];
  nextTitle: string;
  nextCaption: string;
  nextHeaders: string[];
  nextNote: string;
  next: string[];
  rulesTitle: string;
  rules: string[];
  calendar: string;
  bcnTitle: string;
  bcn: string[];
  salesTitle: string;
  sales: string[];
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: "Els diumenges i festius d'obertura comercial que queden el 2026 a Barcelona i a la majoria de municipis són el **29 de novembre i el 6, 8, 13, 20 i 27 de desembre**. **L'1 de novembre no ho és**, excepte a l'Ametlla del Vallès i Mollet del Vallès, i 21 municipis, com Badalona, Manresa o Santa Coloma de Gramenet, no obren el 8 de desembre. A Catalunya les botigues poden obrir deu diumenges o festius l'any: vuit els fixa la Generalitat i dos més cada ajuntament. Les botigues d'alimentació de fins a 300 m², les fleques o les de conveniència, entre d'altres, no tenen aquest límit.",
    note: "Obrir aquests dies és una opció, no una obligació: cada botiga decideix si obre. Els dos dies municipals canvien d'un poble a un altre.",
    leftTitle: "Quins diumenges obren les botigues el 2026",
    leftCaption: "Diumenges i festius amb obertura comercial, novembre i desembre del 2026",
    leftHeaders: ["Dia", "Per què"],
    leftNote: "Vàlid a Barcelona i a tots els municipis que no tenen llista pròpia (Resolució EMT/4342/2025). El calendari del 2026 acaba el 27 de desembre.",
    townsTitle: "Botigues obertes el 8 de desembre i els diumenges de desembre: municipis que canvien",
    townsLead: "Aquests 30 municipis tenen, del novembre al desembre del 2026, algun dia diferent de la llista general. La resta d'ajuntaments de la resolució, i tots els que no hi consten, obren el 29 de novembre i el 6, 8, 13, 20 i 27 de desembre.",
    townsCaption: "Municipis amb dies d'obertura diferents al novembre i al desembre del 2026",
    townsHeaders: ["Municipi", "No obre", "Obre també"],
    townsNote: "Resolució EMT/4342/2025 (DOGC 27.11.2025), comparada amb els dies per defecte el 30 d'octubre de 2026.",
    townsSame: "Barcelona, l'Hospitalet de Llobregat, Girona, Tarragona, Lleida, Reus, Sabadell, Mataró, Granollers, Figueres i Sant Cugat obren tots aquests dies. Per a un municipi concret, mira'n la pàgina a [festius locals per municipi](/ca/festius/), amb els seus dies d'obertura de tot l'any.",
    mallsTitle: "Obren els centres comercials els festius?",
    malls: [
      "Els mateixos dies que la resta de botigues del municipi: la llei de comerç i l'ordre del calendari no els en donen un de propi. Un centre comercial de Badalona, per exemple, no pot obrir el 8 de desembre, i un de Barcelona o de l'Hospitalet, sí. Dins dels centres, els establiments exclosos de l'horari general (per exemple, una farmàcia) poden obrir qualsevol dia.",
    ],
    alwaysTitle: "Quines botigues poden obrir qualsevol diumenge o festiu",
    always: [
      "La llei de comerç (article 37) deixa fora dels límits d'horari, de diumenges i de dies de tancament un seguit d'establiments. Per això trobaràs obert algun comerç fins i tot l'1 de novembre o el dia de Nadal. Entre d'altres:",
    ],
    alwaysList: [
      "Pastisseries, fleques, xurreries, plats preparats, premsa, floristeries i botigues de conveniència.",
      "Farmàcies, la venda de carburant i les botigues a les quals només s'accedeix des de dins d'estacions, aeroports i ports.",
      "Botigues dins de museus, monuments, parcs temàtics i hotels, i les dels municipis declarats turístics, durant el període aprovat.",
      "Botigues de fins a 300 m² de superfície de venda dedicades sobretot a l'alimentació de compra diària, i botigues de fins a 300 m² de petites i mitjanes empreses. El Tribunal Constitucional va anul·lar aquestes dues excepcions el 2022, però la Llei 3/2023 les va tornar a afegir a la llei de comerç, on són vigents.",
    ],
    nextTitle: "Calendari del 2027",
    nextCaption: "Diumenges i festius amb obertura comercial el 2027",
    nextHeaders: ["Dia", "Per què"],
    nextNote: "Ordre EMT/89/2026 (DOGC 28.5.2026). Els dies municipals per defecte s'apliquen on l'ajuntament no n'hagi triat d'altres.",
    next: [
      "Els vuit dies generals del 2027 ja són oficials. Els dos de cada municipi, encara no: els ajuntaments els havien de comunicar abans de l'1 de novembre del 2026, i l'any passat la llista es va publicar al DOGC el 27 de novembre. Si un ajuntament no en tria cap, s'apliquen el 10 de gener i el 5 de desembre.",
      "Dues novetats de l'ordre del 2027: els ajuntaments han de fixar l'obertura en un festiu quan coincideixin dos o més festius seguits, i les empreses de botigues d'alimentació i compra diària poden canviar fins a tres dates del calendari general. Ni els ajuntaments ni aquestes empreses poden moure l'1 de novembre ni el 6 de desembre.",
    ],
    rulesTitle: "Horaris comercials a Catalunya: les normes",
    rules: [
      "**Dies sempre tancats:** l'1 i el 6 de gener, el diumenge i el dilluns de Pasqua, l'1 de maig, el 24 de juny, l'11 de setembre i el 25 i el 26 de desembre (excepte els establiments de la llista anterior).",
      "**Horari:** d'octubre a maig, cap botiga sotmesa a l'horari general pot obrir entre les 21.00 i les 6.00; de juny a setembre, entre les 22.00 i les 7.00. Dins d'aquest marc, cada botiga reparteix lliurement les hores.",
      "**Horari visible:** les botigues han d'exposar l'horari de manera que sigui visible al públic, fins i tot amb l'establiment tancat.",
    ],
    calendar: "Per als festius en què no es treballa, consulta el [calendari laboral](/ca/guies/calendari-laboral-catalunya/) i els [festius locals de cada municipi](/ca/guies/festius-locals-catalunya/).",
    bcnTitle: "A Barcelona",
    bcn: [
      "Barcelona fa servir el 2026 els mateixos deu dies que la llista general (4 i 11 de gener, 15 d'agost, 12 d'octubre, 29 de novembre i 6, 8, 13, 20 i 27 de desembre), i encara no ha publicat els seus dos dies del 2027.",
      "A més, a la **zona turística** (ZGAT), les botigues poden obrir els diumenges i festius **del 15 de maig al 15 de setembre, de 12 a 20 hores**. La zona inclou tots els barris de Ciutat Vella i de l'Eixample, i parts de Sants-Montjuïc, les Corts, Sarrià-Sant Gervasi, Gràcia, Horta-Guinardó i Sant Martí (Poblenou, Vila Olímpica i Diagonal Mar). Aquesta excepció no s'aplica entre el 16 de setembre i el 14 de maig: al novembre i al desembre, a la zona turística valen els mateixos dies que a la resta de la ciutat.",
    ],
    salesTitle: "I les rebaixes?",
    sales: [
      "No hi ha cap data obligatòria: cada botiga decideix si fa rebaixes, i les ha d'anunciar amb aquest nom i amb el període que duren. El Consell Assessor de la Generalitat en matèria de comerç proposa cada any unes dates recomanades. El preu de referència ha de ser el més baix dels trenta dies anteriors, segons l'Agència Catalana del Consum.",
    ],
    faq: [
      { question: "Quins festius d'obertura comercial queden el 2026?", answer: `A Barcelona i a la majoria de municipis, el diumenge 29 de novembre i el 6, 8, 13, 20 i 27 de desembre. Són dies en què les botigues poden obrir, no dies en què hagin d'obrir. ${TOWNS_NOV_DEC.length} municipis en canvien algun (són a la taula de dalt), i l'1 de novembre només és dia d'obertura a l'Ametlla del Vallès i Mollet del Vallès.` },
      { question: "Obren les botigues l'1 de novembre de 2026?", answer: "En general no: el diumenge 1 de novembre no és dia d'obertura comercial a Barcelona ni a la majoria de municipis. Només l'han triat l'Ametlla del Vallès i Mollet del Vallès. Sí que poden obrir els establiments exclosos de l'horari general, com fleques, botigues de conveniència o farmàcies." },
      { question: "Quins diumenges obren les botigues el desembre del 2026?", answer: "A Barcelona i a la majoria de municipis, els diumenges 6, 13, 20 i 27 de desembre, i també el dimarts 8 de desembre. Alguns municipis, com Terrassa, Manresa, Olot o Badalona, en canvien algun." },
      { question: "Obren les botigues el dia de Nadal o Sant Esteve?", answer: "Les botigues amb horari general, no: el 25 i el 26 de desembre són dies de tancament, igual que l'1 i el 6 de gener. Els establiments exclosos de l'horari general (fleques, conveniència, farmàcies...) sí que poden obrir." },
      { question: "Quins festius obren les botigues el 2027?", answer: "Els dies generals són el 3 de gener, el 27 de juny, l'1 i el 28 de novembre i el 6, el 8, el 12 i el 19 de desembre. Cada municipi n'hi afegeix dos; si no en tria cap, el 10 de gener i el 5 de desembre." },
      { question: "Quan comencen les rebaixes de gener?", answer: "No hi ha una data obligatòria: cada botiga decideix i ha d'indicar l'inici i el final. La Generalitat només en publica unes dates recomanades." },
      { question: "Obren les botigues el 8 de desembre de 2026?", answer: `A Barcelona i a la majoria de municipis, sí: el dimarts 8 de desembre és dia d'obertura. No ho és a ${NO_8_DEC.length} municipis que l'han canviat per un altre dia, entre els quals ${["Badalona", "Manresa", "Santa Coloma de Gramenet", "Mollet del Vallès", "Gavà", "Montcada i Reixac"].join(", ")}: la llista sencera és a la taula de dalt.` },
      { question: "Quins supermercats obren els festius?", answer: "Els de fins a 300 m² de superfície de venda dedicats sobretot a l'alimentació de compra diària, i els de petites i mitjanes empreses de fins a 300 m², poden obrir qualsevol diumenge o festiu (article 37 de la llei de comerç). Els altres, només els dies d'obertura autoritzats del seu municipi." },
      { question: "Obren els centres comercials els diumenges de desembre?", answer: "Hi poden obrir els mateixos dies que la resta de botigues del municipi: a Barcelona i a la majoria de municipis, els diumenges 6, 13, 20 i 27 de desembre i el dimarts 8." },
    ],
  },
  es: {
    lead: "Los domingos y festivos de apertura comercial que quedan en 2026 en Barcelona y en la mayoría de municipios son el **29 de noviembre y el 6, 8, 13, 20 y 27 de diciembre**. **El 1 de noviembre no lo es**, salvo en l'Ametlla del Vallès y Mollet del Vallès, y 21 municipios, como Badalona, Manresa o Santa Coloma de Gramenet, no abren el 8 de diciembre. En Cataluña las tiendas pueden abrir diez domingos o festivos al año: ocho los fija la Generalitat y dos más cada ayuntamiento. Las tiendas de alimentación de hasta 300 m², las panaderías o las de conveniencia, entre otras, no tienen ese límite.",
    note: "Abrir esos días es una opción, no una obligación: cada tienda decide si abre. Los dos días municipales cambian de un pueblo a otro.",
    leftTitle: "Qué domingos abren las tiendas en 2026",
    leftCaption: "Domingos y festivos con apertura comercial, noviembre y diciembre de 2026",
    leftHeaders: ["Día", "Por qué"],
    leftNote: "Válido en Barcelona y en todos los municipios sin lista propia (Resolución EMT/4342/2025). El calendario de 2026 termina el 27 de diciembre.",
    townsTitle: "Tiendas abiertas el 8 de diciembre y los domingos de diciembre: municipios que cambian",
    townsLead: "Estos 30 municipios tienen, de noviembre a diciembre de 2026, algún día distinto de la lista general. El resto de ayuntamientos de la resolución, y todos los que no figuran en ella, abren el 29 de noviembre y el 6, 8, 13, 20 y 27 de diciembre.",
    townsCaption: "Municipios con días de apertura distintos en noviembre y diciembre de 2026",
    townsHeaders: ["Municipio", "No abre", "Abre también"],
    townsNote: "Resolución EMT/4342/2025 (DOGC 27.11.2025), comparada con los días por defecto el 30 de octubre de 2026.",
    townsSame: "Barcelona, L'Hospitalet de Llobregat, Girona, Tarragona, Lleida, Reus, Sabadell, Mataró, Granollers, Figueres y Sant Cugat abren todos esos días. Para un municipio concreto, mira su página en [festivos locales por municipio](/es/festivos/), con sus días de apertura de todo el año.",
    mallsTitle: "¿Abren los centros comerciales los festivos?",
    malls: [
      "Los mismos días que el resto de tiendas del municipio: la ley de comercio y la orden del calendario no les dan uno propio. Un centro comercial de Badalona, por ejemplo, no puede abrir el 8 de diciembre, y uno de Barcelona o de L'Hospitalet, sí. Dentro de los centros, los establecimientos excluidos del horario general (por ejemplo, una farmacia) pueden abrir cualquier día.",
    ],
    alwaysTitle: "Qué tiendas pueden abrir cualquier domingo o festivo",
    always: [
      "La ley de comercio catalana (artículo 37) deja fuera de los límites de horario, de domingos y de días de cierre a una serie de establecimientos. Por eso encontrarás algún comercio abierto incluso el 1 de noviembre o el día de Navidad. Entre otros:",
    ],
    alwaysList: [
      "Pastelerías, panaderías, churrerías, platos preparados, prensa, floristerías y tiendas de conveniencia.",
      "Farmacias, la venta de carburante y las tiendas a las que solo se accede desde dentro de estaciones, aeropuertos y puertos.",
      "Tiendas dentro de museos, monumentos, parques temáticos y hoteles, y las de los municipios declarados turísticos, durante el periodo aprobado.",
      "Tiendas de hasta 300 m² de superficie de venta dedicadas sobre todo a la alimentación de compra diaria, y tiendas de hasta 300 m² de pequeñas y medianas empresas. El Tribunal Constitucional anuló estas dos excepciones en 2022, pero la Ley 3/2023 las volvió a añadir a la ley de comercio, donde están vigentes.",
    ],
    nextTitle: "Calendario de 2027",
    nextCaption: "Domingos y festivos con apertura comercial en 2027",
    nextHeaders: ["Día", "Por qué"],
    nextNote: "Orden EMT/89/2026 (DOGC 28.5.2026). Los días municipales por defecto se aplican donde el ayuntamiento no haya elegido otros.",
    next: [
      "Los ocho días generales de 2027 ya son oficiales. Los dos de cada municipio, todavía no: los ayuntamientos debían comunicarlos antes del 1 de noviembre de 2026, y el año pasado la lista se publicó en el DOGC el 27 de noviembre. Si un ayuntamiento no elige ninguno, se aplican el 10 de enero y el 5 de diciembre.",
      "Dos novedades de la orden de 2027: los ayuntamientos deben fijar la apertura en un festivo cuando coincidan dos o más festivos seguidos, y las empresas de tiendas de alimentación y compra diaria pueden cambiar hasta tres fechas del calendario general. Ni los ayuntamientos ni esas empresas pueden mover el 1 de noviembre ni el 6 de diciembre.",
    ],
    rulesTitle: "Horarios comerciales en Cataluña: las normas",
    rules: [
      "**Días siempre cerrados:** el 1 y el 6 de enero, el domingo y el lunes de Pascua, el 1 de mayo, el 24 de junio, el 11 de septiembre y el 25 y el 26 de diciembre (salvo los establecimientos de la lista anterior).",
      "**Horario:** de octubre a mayo, ninguna tienda sujeta al horario general puede abrir entre las 21.00 y las 6.00; de junio a septiembre, entre las 22.00 y las 7.00. Dentro de ese marco, cada tienda reparte libremente las horas.",
      "**Horario visible:** las tiendas deben exponer su horario de forma que sea visible al público, incluso con el establecimiento cerrado.",
    ],
    calendar: "Para los festivos en que no se trabaja, consulta el [calendario laboral](/es/guias/calendario-laboral-cataluna/) y los [festivos locales de cada municipio](/es/guias/festivos-locales-cataluna/).",
    bcnTitle: "En Barcelona",
    bcn: [
      "Barcelona usa en 2026 los mismos diez días que la lista general (4 y 11 de enero, 15 de agosto, 12 de octubre, 29 de noviembre y 6, 8, 13, 20 y 27 de diciembre), y aún no ha publicado sus dos días de 2027.",
      "Además, en la **zona turística** (ZGAT), las tiendas pueden abrir los domingos y festivos **del 15 de mayo al 15 de septiembre, de 12 a 20 horas**. La zona incluye todos los barrios de Ciutat Vella y del Eixample, y partes de Sants-Montjuïc, Les Corts, Sarrià-Sant Gervasi, Gràcia, Horta-Guinardó y Sant Martí (Poblenou, Vila Olímpica y Diagonal Mar). Esta excepción no se aplica entre el 16 de septiembre y el 14 de mayo: en noviembre y diciembre, en la zona turística valen los mismos días que en el resto de la ciudad.",
    ],
    salesTitle: "¿Y las rebajas?",
    sales: [
      "No hay ninguna fecha obligatoria: cada tienda decide si hace rebajas, y debe anunciarlas con ese nombre y con el periodo que duran. El Consell Assessor de la Generalitat en materia de comercio propone cada año unas fechas recomendadas. El precio de referencia debe ser el más bajo de los treinta días anteriores, según la Agència Catalana del Consum.",
    ],
    faq: [
      { question: "¿Abren las tiendas el 1 de noviembre de 2026 en Cataluña?", answer: "En general no: el domingo 1 de noviembre no es día de apertura comercial en Barcelona ni en la mayoría de municipios. Solo lo han elegido l'Ametlla del Vallès y Mollet del Vallès. Sí pueden abrir los establecimientos excluidos del horario general, como panaderías, tiendas de conveniencia o farmacias." },
      { question: "¿Qué domingos abren las tiendas en diciembre de 2026 en Cataluña?", answer: "En Barcelona y en la mayoría de municipios, los domingos 6, 13, 20 y 27 de diciembre, y también el martes 8 de diciembre. Algunos municipios, como Terrassa, Manresa, Olot o Badalona, cambian alguno." },
      { question: "¿Abren las tiendas el día de Navidad o San Esteban?", answer: "Las tiendas con horario general, no: el 25 y el 26 de diciembre son días de cierre, igual que el 1 y el 6 de enero. Los establecimientos excluidos del horario general (panaderías, conveniencia, farmacias...) sí pueden abrir." },
      { question: "¿Qué festivos abren las tiendas en 2027?", answer: "Los días generales son el 3 de enero, el 27 de junio, el 1 y el 28 de noviembre y el 6, el 8, el 12 y el 19 de diciembre. Cada municipio añade dos; si no elige ninguno, el 10 de enero y el 5 de diciembre." },
      { question: "¿Cuándo empiezan las rebajas de enero?", answer: "No hay una fecha obligatoria: cada tienda decide y debe indicar el inicio y el final. La Generalitat solo publica unas fechas recomendadas." },
      { question: "¿Abren las tiendas el 8 de diciembre de 2026?", answer: `En Barcelona y en la mayoría de municipios, sí: el martes 8 de diciembre es día de apertura. No lo es en ${NO_8_DEC.length} municipios que lo han cambiado por otro día, entre ellos ${["Badalona", "Manresa", "Santa Coloma de Gramenet", "Mollet del Vallès", "Gavà", "Montcada i Reixac"].join(", ")}: la lista completa está en la tabla de arriba.` },
      { question: "¿Qué supermercados abren en festivo?", answer: "Los de hasta 300 m² de superficie de venta dedicados sobre todo a la alimentación de compra diaria, y los de pequeñas y medianas empresas de hasta 300 m², pueden abrir cualquier domingo o festivo (artículo 37 de la ley de comercio). Los demás, solo los días de apertura autorizados de su municipio." },
      { question: "¿Abren los centros comerciales los domingos de diciembre?", answer: "Pueden abrir los mismos días que el resto de tiendas del municipio: en Barcelona y en la mayoría de municipios, los domingos 6, 13, 20 y 27 de diciembre y el martes 8." },
    ],
  },
  en: {
    lead: "The Sundays and holidays left in 2026 when shops may open in Barcelona and most of Catalonia are **29 November and 6, 8, 13, 20 and 27 December**. **1 November is not one of them**, except in l'Ametlla del Vallès and Mollet del Vallès, and 21 towns, such as Badalona, Manresa and Santa Coloma de Gramenet, do not open on 8 December. Shops in Catalonia may open on ten Sundays or public holidays a year: eight set by the Generalitat and two chosen by each town council. Food shops of up to 300 m², bakeries and convenience stores, among others, are not bound by that limit.",
    note: "Opening on these days is optional: each shop decides. The two municipal days vary from town to town.",
    leftTitle: "Which Sundays are shops open in 2026",
    leftCaption: "Sundays and holidays when shops may open, November and December 2026",
    leftHeaders: ["Date", "Why"],
    leftNote: "Applies in Barcelona and every municipality without its own list (Resolució EMT/4342/2025). The 2026 calendar ends on 27 December.",
    townsTitle: "Shops open on 8 December and December Sundays: towns that differ",
    townsLead: "These 30 towns have at least one different day between November and December 2026. Every other council in the resolution, and every town not listed in it, opens on 29 November and 6, 8, 13, 20 and 27 December.",
    townsCaption: "Towns with different shop opening days in November and December 2026",
    townsHeaders: ["Town", "Does not open", "Also opens"],
    townsNote: "Resolució EMT/4342/2025 (DOGC 27 Nov 2025), compared with the default days on 30 October 2026.",
    townsSame: "Barcelona, L'Hospitalet de Llobregat, Girona, Tarragona, Lleida, Reus, Sabadell, Mataró, Granollers, Figueres and Sant Cugat open on all of these days. For any other town, check the DOGC resolution.",
    mallsTitle: "Are shopping centres open on public holidays?",
    malls: [
      "On the same days as every other shop in their town: retail law and the calendar order give them no calendar of their own. A shopping centre in Badalona, for example, may not open on 8 December; one in Barcelona or L'Hospitalet may. Inside a centre, businesses outside the general timetable (a pharmacy, for instance) may open on any day.",
    ],
    alwaysTitle: "Which shops may open on any Sunday or holiday",
    always: [
      "Catalonia's retail law (article 37) takes a list of businesses outside the limits on hours, Sundays and closing days. That is why you will find some shops open even on 1 November or Christmas Day. Among them:",
    ],
    alwaysList: [
      "Cake shops, bakeries, churro shops, ready meals, newsagents, florists and convenience stores.",
      "Pharmacies, fuel sales, and shops reachable only from inside stations, airports and ports.",
      "Shops inside museums, monuments, theme parks and hotels, and those in designated tourist municipalities, for the approved period.",
      "Shops with up to 300 m² of sales floor selling mainly everyday food, and shops of up to 300 m² run by small and medium-sized businesses. The Constitutional Court struck these two exemptions down in 2022, but Catalan Law 3/2023 put them back into the retail law, where they are in force.",
    ],
    nextTitle: "The 2027 calendar",
    nextCaption: "Sundays and holidays when shops may open in 2027",
    nextHeaders: ["Date", "Why"],
    nextNote: "Ordre EMT/89/2026 (DOGC 28 May 2026). The default municipal days apply where the council has chosen none.",
    next: [
      "The eight general days for 2027 are official. Each town's two extra days are not out yet: councils had to report them before 1 November 2026, and last year the list appeared in the DOGC on 27 November. A council that chooses none gets 10 January and 5 December.",
      "Two changes in the 2027 order: councils must set an opening day when two or more public holidays fall in a row, and companies running everyday food shops may swap up to three dates of the general calendar. Neither councils nor those companies may move 1 November or 6 December.",
    ],
    rulesTitle: "Shop opening hours in Catalonia: the rules",
    rules: [
      "**Always closed:** 1 and 6 January, Easter Sunday and Monday, 1 May, 24 June, 11 September, and 25 and 26 December (except the businesses listed above).",
      "**Hours:** from October to May no shop on the general timetable may open between 21:00 and 6:00; from June to September, between 22:00 and 7:00. Within that frame each shop sets its own hours.",
      "**Posted hours:** shops must display their opening hours where the public can see them, even when closed.",
    ],
    calendar: "For the days off work, see the [Catalonia public holidays calendar](/en/guides/catalonia-public-holidays/) and the [local holidays in each town](/en/guides/local-holidays-catalonia/).",
    bcnTitle: "In Barcelona",
    bcn: [
      "In 2026 Barcelona uses the same ten days as the general list (4 and 11 January, 15 August, 12 October, 29 November and 6, 8, 13, 20 and 27 December), and has not yet published its two days for 2027.",
      "On top of that, in the **tourist zone** (ZGAT), shops may open on Sundays and holidays **from 15 May to 15 September, 12:00 to 20:00**. The zone covers every neighbourhood of Ciutat Vella and the Eixample, and parts of Sants-Montjuïc, Les Corts, Sarrià-Sant Gervasi, Gràcia, Horta-Guinardó and Sant Martí (Poblenou, Vila Olímpica and Diagonal Mar). The exception does not apply from 16 September to 14 May: in November and December the tourist zone follows the same days as the rest of the city.",
    ],
    salesTitle: "What about the sales?",
    sales: [
      "There is no compulsory date: each shop decides whether to hold sales and must announce them as such, with the period they cover. The Generalitat's retail advisory council proposes recommended dates every year. The reference price must be the lowest of the previous thirty days, according to the Catalan Consumer Agency.",
    ],
    faq: [
      { question: "Are shops open on 1 November 2026 in Barcelona?", answer: "Mostly not: Sunday 1 November is not a shop opening day in Barcelona or most of Catalonia. Only l'Ametlla del Vallès and Mollet del Vallès chose it. Businesses outside the general timetable, such as bakeries, convenience stores and pharmacies, may open." },
      { question: "Are shops open on Sundays in Barcelona in December 2026?", answer: "Yes, on Sundays 6, 13, 20 and 27 December, and on Tuesday 8 December, in Barcelona and most towns. A few towns, such as Terrassa, Manresa, Olot or Badalona, change one of them." },
      { question: "Are shops open on Christmas Day or 26 December in Catalonia?", answer: "Shops on the general timetable are not: 25 and 26 December are closing days, as are 1 and 6 January. Businesses outside the general timetable (bakeries, convenience stores, pharmacies...) may open." },
      { question: "Which holidays can shops open in 2027?", answer: "The general days are 3 January, 27 June, 1 and 28 November, and 6, 8, 12 and 19 December. Each town adds two; if it chooses none, 10 January and 5 December." },
      { question: "When do the January sales start?", answer: "There is no fixed date: each shop decides and must state when its sale starts and ends. The Generalitat only publishes recommended dates." },
      { question: "Are shops open on 8 December 2026?", answer: `In Barcelona and most towns, yes: Tuesday 8 December is an opening day. It is not in ${NO_8_DEC.length} towns that swapped it for another day, including ${["Badalona", "Manresa", "Santa Coloma de Gramenet", "Mollet del Vallès", "Gavà", "Montcada i Reixac"].join(", ")}: the full list is in the table above.` },
      { question: "Which supermarkets are open on public holidays?", answer: "Those with up to 300 m² of sales floor selling mainly everyday food, and those of up to 300 m² run by small and medium-sized businesses, may open on any Sunday or holiday (article 37 of the retail law). Others only on their town's authorised opening days." },
      { question: "Are shopping centres open on Sundays in December?", answer: "They may open on the same days as every other shop in their town: in Barcelona and most towns, Sundays 6, 13, 20 and 27 December and Tuesday 8 December." },
    ],
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  // 30 Oct 2026 (seasonal top-3 push): the strongest page of the December
  // cluster also links the lights and the December bridge.
  const christmas: Record<Locale, string> = {
    ca: `Si surts a comprar per Nadal, mira també ${b2link("christmas", "ca", "els mercats de Nadal de Catalunya i les seves dates")}, ${b2link("christmasBarcelona", "ca", "quan és l'encesa de llums de Nadal a Barcelona")} i ${b2link("decemberBridge", "ca", "quins dies són festius al pont de desembre")}.`,
    es: `Si sales de compras por Navidad, mira también ${b2link("christmas", "es", "los mercados de Navidad de Cataluña y sus fechas")}, ${b2link("christmasBarcelona", "es", "cuándo es el encendido de luces de Navidad en Barcelona")} y ${b2link("decemberBridge", "es", "qué días son festivos en el puente de diciembre")}.`,
    en: `If you are out Christmas shopping, see also ${b2link("christmas", "en", "Catalonia's Christmas markets and their dates")}, ${b2link("christmasBarcelona", "en", "when Barcelona switches on its Christmas lights")} and ${b2link("decemberBridge", "en", "which days are holidays over the December long weekend")}.`,
  };
  const days = (isos: string[]) => (isos.length ? isos.map((iso) => weekdayDayMonth(iso, locale)).join(", ") : "—");
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.leftTitle),
    table(t.leftCaption, t.leftHeaders, DAYS_2026_LEFT.map(([day, why]) => [day[locale], why[locale]]), t.leftNote),
    ...h2(t.townsTitle, t.townsLead),
    table(t.townsCaption, t.townsHeaders, TOWNS_NOV_DEC.map((row) => [row.town, days(row.closed), days(row.extra)]), t.townsNote),
    ...paras(t.townsSame),
    ...h2(t.mallsTitle, ...t.malls),
    ...h2(t.alwaysTitle, ...t.always),
    list(...t.alwaysList),
    ...h2(t.nextTitle, ...t.next),
    table(t.nextCaption, t.nextHeaders, DAYS_2027.map(([day, why]) => [day[locale], why[locale]]), t.nextNote),
    ...h2(t.rulesTitle),
    list(...t.rules),
    ...paras(t.calendar),
    ...h2(t.bcnTitle, ...t.bcn),
    ...h2(t.salesTitle, ...t.sales),
    ...paras(christmas[locale]),
    faq(t.faq),
    ...b2Related(["christmas", "barcelonaHub", "markets", "hours"], locale),
  ];
}

export const SHOPS: B2Article = {
  key: "shops",
  entryKey: "guide-shops-open-holidays-catalonia",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "botigues-llums-nadal-barcelona",
  heroAlt: {
    ca: "Llums de Nadal blaves i blanques sobre un carrer comercial de Barcelona, de nit",
    es: "Luces de Navidad azules y blancas sobre una calle comercial de Barcelona, de noche",
    en: "Blue and white Christmas lights over a shopping street in Barcelona at night",
  },
  heroCaption: {
    ca: "Llums de Nadal en un carrer comercial de Barcelona.",
    es: "Luces de Navidad en una calle comercial de Barcelona.",
    en: "Christmas lights on a Barcelona shopping street.",
  },
  secondaryKey: "botigues-carrer-llums-nadal",
  secondaryAlt: {
    ca: "Carrer de Barcelona amb llums de Nadal en forma d'arbre i gent passejant",
    es: "Calle de Barcelona con luces de Navidad en forma de árbol y gente paseando",
    en: "A Barcelona street with tree-shaped Christmas lights and people walking",
  },
  secondaryCaption: {
    ca: "Llums de Nadal a Barcelona.",
    es: "Luces de Navidad en Barcelona.",
    en: "Christmas lights in Barcelona.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-19T12:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as SHOPS_META };
