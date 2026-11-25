import { link } from "@/lib/content/features/shared";

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
  table,
  verifiedLine,
  type B2Article,
} from "./shared";

/**
 * Day trips from Barcelona: Girona by train, Montserrat without a tour, and
 * Cerdanya without a car.
 *
 * ## Timetables and fares
 *
 * The first version printed none: a departure time copied into an article
 * goes stale. Search Console showed the pages were wanted for exactly that
 * ("cremallera de montserrat horarios", "tren barcelona girona"), so since
 * 24 Oct 2026 Girona and Montserrat carry dated tables read from the
 * operators' own data (Rodalies planner, Renfe and FGC open GTFS, the Aeri
 * calendar). The rule that survives, enforced by batch02.test.ts: clock times
 * live only inside tables, each with the dates it was read for, never in the
 * running text or the FAQ.
 *
 * The Montserrat piece also drops figures the editorial package supplied.
 * The rack railway's height gain was given as "more than 600 metres"; the
 * line climbs from Monistrol de Montserrat to the monastery, which is closer
 * to 540, and no operator page states 600. The cable car's every-15-minutes
 * headway is now on the Aeri's own timetable page and is printed; the rack
 * railway's hourly service from Monistrol de Montserrat comes from FGC's
 * timetable data and its own site ("Trains run every hour").
 */

/* ========================================================================== */
/* 04 — Girona                                                                */
/* ========================================================================== */

const GIRONA_SOURCES = [
  {
    name: "Girona, què visitar",
    url: "https://www.girona.cat/turisme/cat/monuments.php",
    publisher: "Ajuntament de Girona — Turisme",
  },
  {
    name: "Cerca d'horaris i bitllets",
    url: "https://www.renfe.com/es/es",
    publisher: "Renfe",
  },
  { name: "Cercador d'horaris de Rodalies", url: "https://rodalies.gencat.cat/ca/horaris/", publisher: "Rodalies de Catalunya" },
  { name: "Horarios de alta velocidad, larga y media distancia (datos abiertos)", url: "https://data.renfe.com/dataset/horarios-de-alta-velocidad-larga-distancia-y-media-distancia", publisher: "Renfe" },
  { name: "R11: horaris", url: "https://rodalies.gencat.cat/web/.content/02_Horaris/horaris/R11.pdf", publisher: "Rodalies de Catalunya" },
  { name: "Visita", url: "https://gironaepiscopal.cat/visita/", publisher: "Girona Episcopal" },
  { name: "Museu d'Història dels Jueus: informació", url: "https://www.girona.cat/call/cat/info.php", publisher: "Ajuntament de Girona" },
  { name: "Planifica la visita", url: "https://www.mac.cat/ca/Visita-ns-Portada/Girona-Portada-Seu/Planifica-la-visita-Girona", publisher: "Museu d'Arqueologia de Catalunya" },
  { name: "Banys Àrabs", url: "https://www.girona.cat/turisme/cat/monuments_banysarabs.php", publisher: "Ajuntament de Girona — Turisme" },
];

// Trains and every row of the sights table re-checked on 24 Oct 2026: R11
// from the official Rodalies planner (serveisgrs.rodalies.gencat.cat, with
// fares), high-speed from Renfe's open GTFS (Fichero_AV_LD), sights from the
// sources below. Clock times stay inside tables (see batch02.test.ts).
// 26 Oct 2026: R11 journey range re-read from the same planner for 27, 28
// and 31 Oct: durations 1 h 19, 1 h 25, 1 h 31 and 1 h 41 (the 7:16 from
// Sants), so the range runs to 1 h 41, not 1 h 31. The seoDescription still
// was corrected to 1 h 41 on 26 Oct as a factual fix (allowed inside a freeze).
// 28 Oct 2026 (research_notes/page1-28oct/figueres_girona.md): R11, Renfe
// GTFS and every sight re-read; nothing contradicted. The train section now
// follows the lead (the queries are "tren barcelona girona", "renfe
// barcelona girona"). Added Renfe's planner "precio desde" for 3 Nov (Avant
// 17.40, AVE 36.50 EUR) and its child rule, the MAC's other free days, and
// a caveat on the two Sunday timetables the bishopric's page prints.
const GIRONA_VERIFIED = "2026-10-28";

// 21 Nov 2026 (day-trips cluster push; queries "horarios ave barcelona girona",
// "ave barcelona girona horarios y precios", "horarios renfe barcelona girona",
// "tren barcelona girona"; the CA page gets the Spanish ones). Renfe's open
// GTFS (Fichero_AV_LD, services 21 Nov-7 Dec) read on 21 Nov for Monday 23,
// Tuesday 24, Friday 27, Saturday 28 and Sunday 29 Nov and Wednesday 2 Dec:
// every AVE / Avant / Euromed departure Barcelona-Sants <-> Girona (a train
// sold as both AVE and Avant counted once), 39-49 min. Fridays drop the 18:29
// and 21:14 from Sants. The same file's R11 trains confirm the R11 row (23
// weekday trains 5:56-21:46, 15 on Saturdays from 6:46, last back 21:19 /
// 21:23). The monuments table keeps its 28 Oct check (GIRONA_VERIFIED).
const GIRONA_HS: Record<"ca" | "es" | "en", { title: string; intro: string; caption: string; headers: string[]; rows: string[][]; note: string; faq: { question: string; answer: string }[] }> = {
  ca: {
    title: "Horaris de l'AVE i l'Avant de Barcelona a Girona",
    intro: "De dilluns a dijous surten de Sants 15 trens d'alta velocitat cap a Girona, 13 els divendres i 9 els dissabtes. L'AVE, l'Avant i l'Euromed comparteixen alguns trens, que aquí es compten un cop. Totes les sortides, en tots dos sentits:",
    caption: "Alta velocitat de Renfe entre Barcelona-Sants i Girona: sortides",
    headers: ["Sentit", "De dilluns a dijous (24 de novembre)", "Dissabte 28 de novembre", "Diumenge 29 de novembre"],
    rows: [
      ["Barcelona-Sants → Girona", "6:40, 8:05, 8:14, 9:32, 11:27, 13:14, 15:00, 15:54, 16:31, 17:05, 17:59, 18:29, 19:54, 21:14, 23:05", "6:40, 8:05, 8:14, 9:32, 11:27, 13:14, 15:00, 17:05, 23:05", "6:40, 8:05, 9:32, 11:27, 13:14, 15:00, 15:54, 16:31, 17:05, 17:59, 18:29, 21:14, 23:05"],
      ["Girona → Barcelona-Sants", "5:44, 6:34, 7:23, 8:09, 9:25, 11:48, 11:54, 13:26, 15:11, 16:58, 17:20, 17:51, 18:41, 19:25, 19:52", "5:44, 8:09, 9:25, 11:48, 11:54, 13:26, 15:11, 16:58, 17:51, 18:41, 19:25", "5:44, 9:25, 11:48, 13:26, 15:11, 16:58, 17:51, 19:25, 19:52"],
      ["Durada", "39–49 min", "39–49 min", "39–49 min"],
    ],
    note: "Dades obertes d'horaris de Renfe (alta velocitat i llarga distància) per al 23, el 24, el 27, el 28 i el 29 de novembre i el 2 de desembre de 2026, llegides el 21 de novembre. Els divendres no circulen els de les 18:29 i les 21:14 des de Sants. El preu varia segons el tren i la data: consulta'l a renfe.com.",
    faq: [
      { question: "Quant triga l'AVE de Barcelona a Girona?", answer: "Entre 39 i 49 minuts des de Barcelona-Sants. L'R11 de Rodalies triga d'1 h 19 a 1 h 41." },
      { question: "Quants trens hi ha de Barcelona a Girona?", answer: "De dilluns a dijous, 15 d'alta velocitat (AVE, Avant o Euromed) i 23 de l'R11; els dissabtes, 9 i 15. Les hores de cadascun són a les taules." },
      { question: "Quant costa el tren de Barcelona a Girona?", answer: "L'R11 costa 8,95 € el senzill als regionals i 12 € als MD. L'alta velocitat depèn del tren i la data: el 28 d'octubre, Renfe donava preus des de 17,40 € en Avant i 36,50 € en AVE per al 3 de novembre." },
      { question: "De quina estació de Barcelona surten els trens cap a Girona?", answer: "De Barcelona-Sants, tant l'alta velocitat com l'R11; l'R11 para també a Passeig de Gràcia i al Clot." },
      { question: "Fins a quina hora hi ha trens de Girona a Barcelona?", answer: "L'últim R11 de tornada surt de Girona més d'una hora després que l'últim tren d'alta velocitat. Totes dues hores són a les taules." },
    ],
  },
  es: {
    title: "Horarios del AVE y el Avant de Barcelona a Girona",
    intro: "De lunes a jueves salen de Sants 15 trenes de alta velocidad hacia Girona, 13 los viernes y 9 los sábados. El AVE, el Avant y el Euromed comparten algunos trenes, que aquí se cuentan una vez. Todas las salidas, en los dos sentidos:",
    caption: "Alta velocidad de Renfe entre Barcelona-Sants y Girona: salidas",
    headers: ["Sentido", "De lunes a jueves (24 de noviembre)", "Sábado 28 de noviembre", "Domingo 29 de noviembre"],
    rows: [
      ["Barcelona-Sants → Girona", "6:40, 8:05, 8:14, 9:32, 11:27, 13:14, 15:00, 15:54, 16:31, 17:05, 17:59, 18:29, 19:54, 21:14, 23:05", "6:40, 8:05, 8:14, 9:32, 11:27, 13:14, 15:00, 17:05, 23:05", "6:40, 8:05, 9:32, 11:27, 13:14, 15:00, 15:54, 16:31, 17:05, 17:59, 18:29, 21:14, 23:05"],
      ["Girona → Barcelona-Sants", "5:44, 6:34, 7:23, 8:09, 9:25, 11:48, 11:54, 13:26, 15:11, 16:58, 17:20, 17:51, 18:41, 19:25, 19:52", "5:44, 8:09, 9:25, 11:48, 11:54, 13:26, 15:11, 16:58, 17:51, 18:41, 19:25", "5:44, 9:25, 11:48, 13:26, 15:11, 16:58, 17:51, 19:25, 19:52"],
      ["Duración", "39–49 min", "39–49 min", "39–49 min"],
    ],
    note: "Datos abiertos de horarios de Renfe (alta velocidad y larga distancia) para el 23, el 24, el 27, el 28 y el 29 de noviembre y el 2 de diciembre de 2026, leídos el 21 de noviembre. Los viernes no circulan los de las 18:29 y las 21:14 desde Sants. El precio varía según el tren y la fecha: consúltalo en renfe.com.",
    faq: [
      { question: "¿Cuánto tarda el AVE de Barcelona a Girona?", answer: "Entre 39 y 49 minutos desde Barcelona-Sants. El R11 de Rodalies tarda de 1 h 19 a 1 h 41." },
      { question: "¿Cuántos trenes hay de Barcelona a Girona?", answer: "De lunes a jueves, 15 de alta velocidad (AVE, Avant o Euromed) y 23 del R11; los sábados, 9 y 15. Las horas de cada uno están en las tablas." },
      { question: "¿Cuánto cuesta el tren de Barcelona a Girona?", answer: "El R11 cuesta 8,95 € el sencillo en los regionales y 12 € en los MD. La alta velocidad depende del tren y la fecha: el 28 de octubre, Renfe daba precios desde 17,40 € en Avant y 36,50 € en AVE para el 3 de noviembre." },
      { question: "¿De qué estación de Barcelona salen los trenes a Girona?", answer: "De Barcelona-Sants, tanto la alta velocidad como el R11; el R11 para también en Passeig de Gràcia y El Clot." },
      { question: "¿Hasta qué hora hay trenes de Girona a Barcelona?", answer: "El último R11 de vuelta sale de Girona más de una hora después que el último tren de alta velocidad. Las dos horas están en las tablas." },
    ],
  },
  en: {
    title: "Barcelona to Girona AVE and Avant timetable",
    intro: "From Monday to Thursday, 15 high-speed trains leave Sants for Girona, 13 on Fridays and 9 on Saturdays. AVE, Avant and Euromed share some trains, which are counted once here. Every departure, both ways:",
    caption: "Renfe high-speed trains between Barcelona-Sants and Girona: departures",
    headers: ["Direction", "Monday to Thursday (24 November)", "Saturday 28 November", "Sunday 29 November"],
    rows: [
      ["Barcelona-Sants → Girona", "6:40, 8:05, 8:14, 9:32, 11:27, 13:14, 15:00, 15:54, 16:31, 17:05, 17:59, 18:29, 19:54, 21:14, 23:05", "6:40, 8:05, 8:14, 9:32, 11:27, 13:14, 15:00, 17:05, 23:05", "6:40, 8:05, 9:32, 11:27, 13:14, 15:00, 15:54, 16:31, 17:05, 17:59, 18:29, 21:14, 23:05"],
      ["Girona → Barcelona-Sants", "5:44, 6:34, 7:23, 8:09, 9:25, 11:48, 11:54, 13:26, 15:11, 16:58, 17:20, 17:51, 18:41, 19:25, 19:52", "5:44, 8:09, 9:25, 11:48, 11:54, 13:26, 15:11, 16:58, 17:51, 18:41, 19:25", "5:44, 9:25, 11:48, 13:26, 15:11, 16:58, 17:51, 19:25, 19:52"],
      ["Journey", "39–49 min", "39–49 min", "39–49 min"],
    ],
    note: "Renfe's open timetable data (high-speed and long-distance) for 23, 24, 27, 28 and 29 November and 2 December 2026, read on 21 November. On Fridays the 18:29 and 21:14 from Sants do not run. Fares vary by train and date: check renfe.com.",
    faq: [
      { question: "How long is the train from Barcelona to Girona?", answer: "39 to 49 minutes on Renfe's high-speed trains from Barcelona-Sants, or 1 h 19 to 1 h 41 on the R11." },
      { question: "How many trains are there from Barcelona to Girona?", answer: "From Monday to Thursday, 15 high-speed trains (AVE, Avant or Euromed) and 23 R11 trains; on Saturdays, 9 and 15. Every departure is in the tables." },
      { question: "How much is the train from Barcelona to Girona?", answer: "The R11 costs €8.95 single on regional trains and €12 on MD trains. High-speed fares depend on the train and the date: on 28 October, Renfe showed fares from €17.40 on Avant and €36.50 on AVE for 3 November." },
      { question: "Which Barcelona station do trains to Girona leave from?", answer: "Barcelona-Sants, for both high-speed trains and the R11; the R11 also stops at Passeig de Gràcia and El Clot." },
      { question: "When is the last train from Girona to Barcelona?", answer: "The last R11 back leaves Girona more than an hour after the last high-speed train. Both are in the tables." },
    ],
  },
};

function gironaHighSpeed(locale: "ca" | "es" | "en") {
  const g = GIRONA_HS[locale];
  return [...h2(g.title, g.intro), table(g.caption, g.headers, g.rows, g.note)];
}

export const GIRONA: B2Article = {
  key: "girona",
  entryKey: "daytrip-girona-from-barcelona",
  categoryKey: "coast",
  sources: GIRONA_SOURCES,
  heroKey: "b2-girona-cases-onyar",
  secondaryKey: "b2-girona-banys-arabs",
  secondaryAlt: {
    ca: "Interior dels Banys Àrabs de Girona",
    es: "Interior de los Baños Árabes de Girona",
    en: "Inside the Arab Baths of Girona",
  },
  secondaryCaption: {
    ca: "Els Banys Àrabs queden al sector nord del Barri Vell, just després de la Catedral.",
    es: "Los Baños Árabes quedan en el sector norte del Barri Vell, justo después de la Catedral.",
    en: "The Arab Baths sit in the northern old town, right after the Cathedral.",
  },
  heroAlt: {
    ca: "Les cases de colors sobre el riu Onyar, a Girona",
    es: "Las casas de colores sobre el río Onyar, en Girona",
    en: "The colourful houses above the Onyar river in Girona",
  },
  heroCaption: {
    ca: "Les cases de l'Onyar són el primer que es veu en creuar cap al Barri Vell.",
    es: "Las casas del Onyar son lo primero que se ve al cruzar hacia el Barri Vell.",
    en: "The Onyar houses are the first thing you see crossing into the old town.",
  },
  verifiedAt: GIRONA_VERIFIED,
  publishedAt: "2026-09-29T11:30:00+02:00",
  editions: {
    ca: {
      path: "escapades/girona-des-de-barcelona-tren",
      title: "Tren de Barcelona a Girona: horaris, preus i què veure en un dia",
      seoTitle: "Tren de Barcelona a Girona: horaris, preus, AVE o Rodalies",
      seoDescription:
        "R11 de Rodalies en 1 h 19-1 h 41 des de 8,95 €, o alta velocitat en uns 40 minuts. Trens al dia, últim de tornada i ruta d'un dia pel Barri Vell.",
      excerpt:
        "R11 o alta velocitat: quant triga i quant costa el tren de Barcelona a Girona, i una ruta d'un dia pel Barri Vell, sense cotxe.",
      blocks: [
        lead(
          "Per anar de Barcelona a Girona en tren hi ha dues opcions: la **R11 de Rodalies**, que triga **d'1 h 19 a 1 h 41 (la majoria, 1 h 19 o 1 h 31)** des de Sants i costa **8,95 €** el senzill (12 € als trens MD), i l'**alta velocitat de Renfe**, que hi arriba en **uns 40 minuts**. Totes dues paren a l'estació de Girona, i la ciutat es recorre a peu en un dia.",
        ),
        ...h2(
          "Tren de Barcelona a Girona: R11 o alta velocitat",
          "Girona té trens de Rodalies i d'alta velocitat des de Barcelona. La taula compara les dues opcions per a un dia feiner i un dissabte.",
        ),
        table(
          "Tren de Barcelona-Sants a Girona",
          ["Tren", "Durada", "Trens al dia", "Primer i últim des de Sants", "Últim de tornada", "Senzill"],
          [
            ["R11 de Rodalies (MD i regional)", "d'1 h 19 a 1 h 41 (la majoria, 1 h 19 o 1 h 31)", "23 feiners, 15 dissabtes", "5:56 – 21:46 (dissabte des de 6:46)", "21:19 (dissabte 21:23)", "8,95 € regional, 12 € MD"],
            ["Alta velocitat de Renfe (Avant, AVE, Euromed)", "39 – 49 min", "15 de dilluns a dijous, 13 divendres, 9 dissabtes", "6:40 – 23:05", "19:52 (dissabte 19:25)", "Des de 17,40 € (Avant) i 36,50 € (AVE), a renfe.com per al 3 de novembre"],
          ],
          "Preus de l'R11: cercador oficial de Rodalies (27 i 31 d'octubre de 2026). Horaris: dades obertes de Renfe per al 23, el 24, el 27 i el 28 de novembre de 2026, llegides el 21 de novembre.",
        ),
        ...h2(
          "Quin tren agafar",
          "La més econòmica és la línia **R11** de Rodalies, que surt de Barcelona Sants i para a Passeig de Gràcia i al Clot abans de seguir per Granollers fins a Girona i Figueres. Els trens de mitjana distància (MD) fan el trajecte en 1 h 19 i costen 12 €; els regionals, que fan més parades, triguen 1 h 31 i costen 8,95 €. L'**alta velocitat** de Renfe surt de Sants i arriba en uns 40 minuts, però el preu varia segons el tren i la data: el 28 d'octubre, el cercador de Renfe donava preus des de 17,40 € en Avant i 36,50 € en AVE per al 3 de novembre. Els infants de 4 a 13 anys tenen un 40 % de descompte sobre la tarifa base i els menors de 4 viatgen gratis si no ocupen seient. L'últim tren d'alta velocitat de tornada surt força més d'hora que l'últim R11.",
        ),
        ...gironaHighSpeed("ca"),
        ...paras("No cal intentar veure-ho tot."),
        ...paras(
          "Una jornada ben plantejada pot concentrar-se en la ciutat històrica, que conserva més de **2.000 anys d'història** entre la Força Vella i l'eixample medieval.",
        ),
        ...h2("Ruta d'un dia"),
        ...h3(
          "1. Cases de l'Onyar",
          "Comença travessant el riu i entrant progressivament al Barri Vell.",
        ),
        ...h3("2. Call jueu", "Recorre els carrers estrets de l'antic barri jueu."),
        ...h3("3. Catedral", "Continua cap a l'entorn monumental de la Catedral."),
        ...h3(
          "4. Banys Àrabs i Sant Pere de Galligants",
          "Són dos dels punts patrimonials més destacats del sector nord del Barri Vell.",
        ),
        ...h3(
          "5. Muralles",
          "Si tens temps i la meteorologia acompanya, incorpora una passejada pel recorregut de muralles.",
        ),
        ...h3(
          "6. Rambla de la Llibertat i centre",
          "Acaba de nou a la part baixa del nucli antic abans de tornar cap a l'estació.",
        ),
        ...paras(
          "L'Oficina de Turisme de Girona identifica entre els grans elements històrics la Catedral, Sant Pere de Galligants, els Banys Àrabs, la basílica de Sant Feliu, el Call i les muralles.",
        ),
        ...h2(
          "Horaris i preus dels monuments",
          "Consultats el 28 d'octubre de 2026.",
        ),
        table(
          "",
          ["Lloc", "Horari", "Entrada general"],
          [
            ["Catedral + basílica de Sant Feliu + Museu d'Art (entrada Girona Episcopal, vàlida 48 h)", "Catedral: dl–ds 10–18 h, dg 12–18 h. Sant Feliu: dl–ds 10–18 h, dg 13–18 h", "12 €"],
            ["Banys Àrabs", "març–oct.: dl–ds 10–18 h, dg 10–14 h · nov.–febr.: dl–dv 10–14 h, ds 10–17.30 h, dg 10–14 h", "3 € (reduïda 1 €)"],
            ["Museu d'Història dels Jueus (Call)", "set.–juny: dt–ds 10–18 h; dg, dl i festius 10–14 h · jul.–ag.: dt–ds 10–19 h", "6 € (reduïda 3 €)"],
            ["Sant Pere de Galligants (MAC Girona)", "dt–ds 10–18 h (maig–set. fins a les 19 h), dg 10–14 h; tancat dilluns", "6 € (reduïda 4 €)"],
            ["Passeig de la Muralla", "set.–maig 8–21 h · juny–ag. 8–23 h", "—"],
          ],
        ),
        ...paras(
          "La Catedral tanca el 25 de desembre, l'1 i el 6 de gener i el diumenge de Pasqua, i no s'hi pot fer la visita cultural a la nau durant les celebracions. El carnet GironaMuseus dona un 50 % de descompte en sis museus de la ciutat. Els diumenges, comprova l'horari de la Catedral i Sant Feliu el mateix dia: la web del bisbat en dona dos de diferents.",
        ),
        ...h2(
          "Què és gratuït",
          "El primer diumenge de cada mes, el Museu d'Història dels Jueus i Sant Pere de Galligants són gratuïts, i també ho són sempre per als menors de 16 anys. El MAC també obre de franc el 23 d'abril, el 18 de maig, l'11 de setembre i el 29 d'octubre (festa local). Passejar pel Call, les cases de l'Onyar i la Rambla no costa res.",
        ),
        ...h2(
          "Accessibilitat",
          "Girona Turisme avisa que les muralles no són accessibles perquè tenen trams d'escales, i que el Call té pendents molt pronunciats i moltes escales. El recorregut més practicable és el carrer de la Força, de plataforma única i amb un pendent d'entre el 8 % i el 12 %. A Sant Pere de Galligants, el monestir, l'església i el claustre són accessibles, però els lavabos no estan adaptats. L'Oficina de Turisme disposa de maquetes en 3D dels principals monuments per a persones amb discapacitat visual.",
        ),
        ...h2(
          "Oficina de Turisme",
          "És a la Rambla de la Llibertat, 1, al final de la ruta. D'abril a octubre obre de dilluns a divendres de 9 a 20 h, dissabtes de 9 a 14 h i de 15 a 19 h, i diumenges i festius de 9 a 14 h. De novembre a març, entre setmana tanca a les 19 h.",
        ),
        ...paras(
          `Si t'agraden les escapades sense cotxe, tenim ${link("trains", "ca", "dotze escapades per Catalunya que pots fer en tren")} i ${b2link("montserratFree", "ca", "com anar a Montserrat per lliure")}.`,
        ),
        faq(GIRONA_HS.ca.faq),
        ...paras(verifiedLine("ca", GIRONA_VERIFIED)),
        ...b2Related(["figueres", "sitges", "tarragona", "montserratFree", "cerdanya"], "ca"),
      ],
    },

    es: {
      path: "escapadas/girona-desde-barcelona-tren",
      title: "Tren de Barcelona a Girona: horarios, precios y qué ver en un día",
      seoTitle: "Tren Barcelona–Girona: horarios, precios, AVE o Rodalies",
      seoDescription:
        "R11 de Rodalies en 1 h 19-1 h 41 desde 8,95 €, o alta velocidad en unos 40 minutos. Trenes al día, último de vuelta y ruta de un día por el Barri Vell.",
      excerpt:
        "R11 o alta velocidad: cuánto tarda y cuánto cuesta el tren de Barcelona a Girona, y una ruta de un día por el Barri Vell, sin coche.",
      blocks: [
        lead(
          "Para ir de Barcelona a Girona en tren hay dos opciones: la **R11 de Rodalies**, que tarda **de 1 h 19 a 1 h 41 (la mayoría, 1 h 19 o 1 h 31)** desde Sants y cuesta **8,95 €** el sencillo (12 € en los trenes MD), y la **alta velocidad de Renfe**, que llega en **unos 40 minutos**. Las dos paran en la estación de Girona, y la ciudad se recorre a pie en un día.",
        ),
        ...h2(
          "Tren de Barcelona a Girona: R11 o alta velocidad",
          "Girona tiene trenes de Rodalies y de alta velocidad desde Barcelona. La tabla compara las dos opciones para un día laborable y un sábado.",
        ),
        table(
          "Tren de Barcelona-Sants a Girona",
          ["Tren", "Duración", "Trenes al día", "Primero y último desde Sants", "Último de vuelta", "Sencillo"],
          [
            ["R11 de Rodalies (MD y regional)", "de 1 h 19 a 1 h 41 (la mayoría, 1 h 19 o 1 h 31)", "23 laborables, 15 sábados", "5:56 – 21:46 (sábado desde 6:46)", "21:19 (sábado 21:23)", "8,95 € regional, 12 € MD"],
            ["Alta velocidad de Renfe (Avant, AVE, Euromed)", "39 – 49 min", "15 de lunes a jueves, 13 viernes, 9 sábados", "6:40 – 23:05", "19:52 (sábado 19:25)", "Desde 17,40 € (Avant) y 36,50 € (AVE), en renfe.com para el 3 de noviembre"],
          ],
          "Precios del R11: planificador oficial de Rodalies (27 y 31 de octubre de 2026). Horarios: datos abiertos de Renfe para el 23, el 24, el 27 y el 28 de noviembre de 2026, leídos el 21 de noviembre.",
        ),
        ...h2(
          "Qué tren coger",
          "La más económica es la línea **R11** de Rodalies, que sale de Barcelona Sants y para en Passeig de Gràcia y El Clot antes de seguir por Granollers hasta Girona y Figueres. Los trenes de media distancia (MD) hacen el trayecto en 1 h 19 y cuestan 12 €; los regionales, con más paradas, tardan 1 h 31 y cuestan 8,95 €. La **alta velocidad** de Renfe sale de Sants y llega en unos 40 minutos, pero el precio varía según el tren y la fecha: el 28 de octubre, el buscador de Renfe daba precios desde 17,40 € en Avant y 36,50 € en AVE para el 3 de noviembre. Los niños de 4 a 13 años tienen un 40 % de descuento sobre la tarifa base y los menores de 4 viajan gratis si no ocupan asiento. El último tren de alta velocidad de vuelta sale bastante antes que el último R11.",
        ),
        ...gironaHighSpeed("es"),
        ...paras("Un día permite recorrer lo esencial del Barri Vell sin necesidad de coche."),
        ...h2("Itinerario recomendado"),
        list(
          "**Casas del Onyar** — cruza el río y entra al Barri Vell.",
          "**Call judío** — las calles estrechas del antiguo barrio judío.",
          "**Catedral** — el entorno monumental.",
          "**Baños Árabes**",
          "**Sant Pere de Galligants**",
          "**Murallas** — si el tiempo acompaña.",
          "**Rambla de la Llibertat** — vuelta al centro antes de la estación.",
        ),
        ...paras(
          "El centro histórico permite recorrer más de dos mil años de historia y reúne algunos de los principales monumentos de la ciudad.",
          "La Oficina de Turismo de Girona identifica entre los grandes elementos históricos la Catedral, Sant Pere de Galligants, los Baños Árabes, la basílica de Sant Feliu, el Call y las murallas.",
        ),
        ...h2(
          "Cómo repartir el día",
          "No hace falta intentar verlo todo. Una jornada bien planteada se concentra en la ciudad histórica: se cruza el Onyar, se entra al Barri Vell y se sube progresivamente hacia la Catedral.",
          "Los Baños Árabes y Sant Pere de Galligants quedan en el sector norte del casco antiguo, de modo que encajan de forma natural después de la Catedral.",
          "Si queda tiempo y el tiempo acompaña, el recorrido por las murallas es el mejor cierre antes de bajar de nuevo hacia la Rambla de la Llibertat y la estación.",
        ),
        ...h2(
          "Horarios y precios de los monumentos",
          "Consultados el 28 de octubre de 2026.",
        ),
        table(
          "",
          ["Lugar", "Horario", "Entrada general"],
          [
            ["Catedral + basílica de Sant Feliu + Museu d'Art (entrada Girona Episcopal, válida 48 h)", "Catedral: lu–sá 10–18 h, do 12–18 h. Sant Feliu: lu–sá 10–18 h, do 13–18 h", "12 €"],
            ["Baños Árabes", "mar.–oct.: lu–sá 10–18 h, do 10–14 h · nov.–feb.: lu–vi 10–14 h, sá 10–17.30 h, do 10–14 h", "3 € (reducida 1 €)"],
            ["Museu d'Història dels Jueus (Call)", "sep.–jun.: ma–sá 10–18 h; do, lu y festivos 10–14 h · jul.–ago.: ma–sá 10–19 h", "6 € (reducida 3 €)"],
            ["Sant Pere de Galligants (MAC Girona)", "ma–sá 10–18 h (may.–sep. hasta las 19 h), do 10–14 h; cerrado lunes", "6 € (reducida 4 €)"],
            ["Paseo de la Muralla", "sep.–may. 8–21 h · jun.–ago. 8–23 h", "—"],
          ],
        ),
        ...paras(
          "La Catedral cierra el 25 de diciembre, el 1 y 6 de enero y el domingo de Pascua, y no se puede hacer la visita cultural a la nave durante los oficios. El carnet GironaMuseus da un 50 % de descuento en seis museos de la ciudad. Los domingos, comprueba el horario de la Catedral y Sant Feliu el mismo día: la web del obispado da dos distintos.",
        ),
        ...h2(
          "Qué es gratis",
          "El primer domingo de cada mes, el Museu d'Història dels Jueus y Sant Pere de Galligants son gratuitos, y siempre lo son para menores de 16 años. El MAC también abre gratis el 23 de abril, el 18 de mayo, el 11 de septiembre y el 29 de octubre (fiesta local). Pasear por el Call, las casas del Onyar y la Rambla no cuesta nada.",
        ),
        ...h2(
          "Accesibilidad",
          "Girona Turisme avisa de que las murallas no son accesibles porque tienen tramos de escaleras, y de que el Call tiene pendientes muy pronunciadas y muchas escaleras. El recorrido más practicable es la calle de la Força, de plataforma única y con una pendiente de entre el 8 % y el 12 %. En Sant Pere de Galligants, el monasterio, la iglesia y el claustro son accesibles, pero los aseos no están adaptados. La Oficina de Turismo dispone de maquetas en 3D de los principales monumentos para personas con discapacidad visual.",
        ),
        ...h2(
          "Oficina de Turismo",
          "Está en la Rambla de la Llibertat, 1, al final de la ruta. De abril a octubre abre de lunes a viernes de 9 a 20 h, los sábados de 9 a 14 h y de 15 a 19 h, y los domingos y festivos de 9 a 14 h. De noviembre a marzo, entre semana cierra a las 19 h.",
        ),
        ...paras(
          `Más escapadas sin coche: ${link("trains", "es", "doce escapadas en tren")} y ${b2link("montserratFree", "es", "Montserrat por libre")}.`,
        ),
        faq(GIRONA_HS.es.faq),
        ...paras(verifiedLine("es", GIRONA_VERIFIED)),
        ...b2Related(["figueres", "sitges", "tarragona", "montserratFree", "cerdanya"], "es"),
      ],
    },

    en: {
      path: "day-trips/girona-from-barcelona-by-train",
      title: "Barcelona to Girona by train: times, fares and a one-day route",
      seoTitle: "Barcelona to Girona by train: times, fares, AVE or R11",
      seoDescription:
        "The R11 takes 1 h 19-1 h 41 from €8.95; high-speed trains take about 40 minutes. Trains a day, the last train back and a one-day walk round the old town.",
      excerpt:
        "R11 or high-speed: how long the train from Barcelona to Girona takes, what it costs, and a one-day route through the old town without a car.",
      blocks: [
        lead(
          "There are two ways to go from Barcelona to Girona by train: Rodalies line **R11**, which takes **1 h 19 to 1 h 41 (most take 1 h 19 or 1 h 31)** from Sants and costs **€8.95** single (€12 on MD trains), and **Renfe's high-speed trains**, which take **about 40 minutes**. Both stop at Girona station, and the city is easy to see on foot in a day.",
        ),
        ...h2(
          "Barcelona to Girona train: R11 or high-speed",
          "Girona has both Rodalies and high-speed trains from Barcelona. The table compares the two for a weekday and a Saturday.",
        ),
        table(
          "Barcelona-Sants to Girona by train",
          ["Train", "Journey", "Trains a day", "First and last from Sants", "Last train back", "Single fare"],
          [
            ["Rodalies R11 (MD and regional)", "1 h 19 to 1 h 41 (most take 1 h 19 or 1 h 31)", "23 on weekdays, 15 on Saturdays", "5:56 – 21:46 (Saturday from 6:46)", "21:19 (Saturday 21:23)", "€8.95 regional, €12 MD"],
            ["Renfe high-speed (Avant, AVE, Euromed)", "39 – 49 min", "15 Monday to Thursday, 13 on Fridays, 9 on Saturdays", "6:40 – 23:05", "19:52 (Saturday 19:25)", "From €17.40 (Avant) and €36.50 (AVE) on renfe.com for 3 November"],
          ],
          "R11 fares: official Rodalies journey planner (27 and 31 October 2026). Times: Renfe's open timetable data for 23, 24, 27 and 28 November 2026, read on 21 November.",
        ),
        ...h2(
          "Which train to take",
          "The cheaper is Rodalies line **R11**. It leaves from Barcelona Sants, calls at Passeig de Gràcia and El Clot, and then runs via Granollers to Girona and Figueres. Medium-distance (MD) trains take 1 h 19 and cost €12; regional trains, which make more stops, take 1 h 31 and cost €8.95. Renfe's **high-speed** trains leave from Sants and take about 40 minutes, but the fare depends on the train and the date: on 28 October Renfe's planner showed fares from €17.40 on Avant and €36.50 on AVE for 3 November. Children aged 4 to 13 get 40% off the base fare, and under-4s travel free without a seat. The last high-speed train back leaves well before the last R11.",
        ),
        ...gironaHighSpeed("en"),
        ...h2("A practical route"),
        list(
          "**Onyar houses** — cross the river into the old town.",
          "**Jewish Quarter**",
          "**Cathedral**",
          "**Arab Baths**",
          "**Sant Pere de Galligants**",
          "**City walls** — if the weather allows.",
          "**Rambla de la Llibertat** — back towards the station.",
        ),
        ...paras(
          "Girona's historic centre spans more than two thousand years and includes Roman, medieval and later layers of the city.",
          "Girona's tourist office lists the Cathedral, Sant Pere de Galligants, the Arab Baths, the basilica of Sant Feliu, the Jewish Quarter and the city walls among the major historic sites.",
        ),
        ...h2(
          "How to pace the day",
          "There is no need to try to see everything. A well-planned day concentrates on the historic city: cross the Onyar, walk into the Barri Vell, and climb gradually towards the Cathedral.",
          "The Arab Baths and Sant Pere de Galligants sit in the northern part of the old town, so they follow the Cathedral naturally.",
          "If you have time and the weather holds, the walk along the city walls is the best way to finish before dropping back down to the Rambla de la Llibertat and the station.",
        ),
        ...h2(
          "Sights: hours and prices",
          "Checked 28 October 2026.",
        ),
        table(
          "",
          ["Sight", "Hours", "General admission"],
          [
            ["Cathedral + Sant Feliu basilica + Art Museum (Girona Episcopal ticket, valid 48 h)", "Cathedral: Mon–Sat 10:00–18:00, Sun 12:00–18:00. Sant Feliu: Mon–Sat 10:00–18:00, Sun 13:00–18:00", "€12"],
            ["Arab Baths", "Mar–Oct: Mon–Sat 10:00–18:00, Sun 10:00–14:00 · Nov–Feb: Mon–Fri 10:00–14:00, Sat 10:00–17:30, Sun 10:00–14:00", "€3 (reduced €1)"],
            ["Museum of Jewish History (Call)", "Sep–Jun: Tue–Sat 10:00–18:00; Sun, Mon and holidays 10:00–14:00 · Jul–Aug: Tue–Sat 10:00–19:00", "€6 (reduced €3)"],
            ["Sant Pere de Galligants (MAC Girona)", "Tue–Sat 10:00–18:00 (May–Sep until 19:00), Sun 10:00–14:00; closed Mondays", "€6 (reduced €4)"],
            ["City walls walk", "Sep–May 08:00–21:00 · Jun–Aug 08:00–23:00", "—"],
          ],
        ),
        ...paras(
          "The Cathedral is closed on 25 December, 1 and 6 January and Easter Sunday. You cannot tour the nave during services. A GironaMuseus card gives 50% off at six of the city's museums. On Sundays, check the Cathedral and Sant Feliu hours on the day: the bishopric's page gives two different ones.",
        ),
        ...h2(
          "What's free",
          "On the first Sunday of every month, the Museum of Jewish History and Sant Pere de Galligants are free. Both are always free for under-16s, and the MAC is also free on 23 April, 18 May, 11 September and 29 October (the city's local holiday). Walking through the Call, past the Onyar houses and along the Rambla costs nothing.",
        ),
        ...h2(
          "Accessibility",
          "Girona's tourist office warns that the walls are not accessible because of their flights of steps, and that the Call has steep slopes and many steps. The most manageable route is Carrer de la Força, a level-surface street with gradients of 8–12%. At Sant Pere de Galligants, the monastery, church and cloister are step-free, but the toilets are not adapted. The tourist office has 3D models of the main monuments for blind and partially sighted visitors.",
        ),
        ...h2(
          "Tourist office",
          "The tourist office is at Rambla de la Llibertat 1, at the end of the route. From April to October it opens Monday to Friday 9 am to 8 pm, Saturday 9 am to 2 pm and 3 pm to 7 pm, and Sundays and holidays 9 am to 2 pm. From November to March it closes at 7 pm on weekdays.",
        ),
        ...paras(
          `More car-free trips: ${link("trains", "en", "twelve day trips by train")} and ${b2link("montserratFree", "en", "Montserrat without a tour")}.`,
        ),
        faq(GIRONA_HS.en.faq),
        ...paras(verifiedLine("en", GIRONA_VERIFIED)),
        ...b2Related(["figueres", "sitges", "tarragona", "montserratFree", "cerdanya"], "en"),
      ],
    },
  },
};

/* ========================================================================== */
/* 05 — Montserrat without a tour                                             */
/* ========================================================================== */

const MONTSERRAT_SOURCES = [
  {
    name: "Cremallera i funiculars de Montserrat: tarifes",
    url: "https://turistren.cat/trens/cremallera-i-funiculars-de-montserrat/",
    publisher: "Turistren (FGC)",
  },
  {
    name: "Cremallera de Montserrat",
    url: "https://www.cremallerademontserrat.cat/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Horaris FGC (dades obertes GTFS)",
    url: "https://www.fgc.cat/google/google_transit.zip",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Aeri de Montserrat: horaris i tarifes",
    url: "https://aeridemontserrat.com/horaris-i-tarifes/",
    publisher: "Aeri de Montserrat",
  },
  {
    name: "Aeri de Montserrat: calendari 2026",
    url: "https://aeridemontserrat.com/calendari/?lang=ca&Y=2026&m=11",
    publisher: "Aeri de Montserrat",
  },
  {
    name: "Aeri de Montserrat: calendari de desembre del 2026",
    url: "https://aeridemontserrat.com/calendari/?lang=ca&Y=2026&m=12",
    publisher: "Aeri de Montserrat",
  },
  {
    name: "Aeri de Montserrat: característiques tècniques",
    url: "https://aeridemontserrat.com/caracteristiques-tecniques/",
    publisher: "Aeri de Montserrat",
  },
  {
    name: "Aeri de Montserrat: com arribar-hi",
    url: "https://aeridemontserrat.com/com-arribar-hi/",
    publisher: "Aeri de Montserrat",
  },
  {
    name: "Cremallera de Montserrat (English)",
    url: "https://www.cremallerademontserrat.cat/en/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Monistrol de Montserrat (tren): estació",
    url: "https://www.fgc.cat/xarxa-fgc/l-llobregat-anoia/monistrol-de-montserrat-tren/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Montserrat-Aeri: estació",
    url: "https://www.fgc.cat/xarxa-fgc/l-llobregat-anoia/montserrat-aeri/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Montserrat: by road",
    url: "https://www.montserratvisita.com/en/how-to-get-there/by-road",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Montserrat: cable car",
    url: "https://www.montserratvisita.com/en/how-to-get-there/cable-car",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Montserrat: cremallera and train",
    url: "https://www.montserratvisita.com/en/how-to-get-there/cremallera-train",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Montserrat: opening hours",
    url: "https://www.montserratvisita.com/en/practical-information/opening-hours",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Montserrat: frequently asked questions",
    url: "https://www.montserratvisita.com/en/practical-information/faqs",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Trans Montserrat (cremallera, des de Pl. Espanya)",
    url: "https://vol.cremallerademontserrat.cat/trans-montserrat-cremallera-placa-espanya",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Tot Montserrat (cremallera, des de Pl. Espanya)",
    url: "https://vol.cremallerademontserrat.cat/tot-montserrat-cremallera-placa-espanya",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Montserrat — entrada turística",
    url: "https://www.montserratvisita.com/en/entrada-turistica",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Museu de Montserrat — horaris i preus",
    url: "https://www.museudemontserrat.cat/en/visit/hours-and-admission",
    publisher: "Museu de Montserrat",
  },
  {
    name: "2026 transport ticket fares (4-zone single and T-casual)",
    url: "https://www.tmb.cat/en/barcelona-fares-metro-bus/transport-ticket-fares",
    publisher: "Transports Metropolitans de Barcelona",
  },
];

// Re-checked on 24 Oct 2026 for the page-1 push (queries "cremallera de
// montserrat horarios", "montserrat rack railway", "aeri montserrat
// horaris", "trans montserrat"). R5 and cremallera times from FGC's GTFS
// (feed_version 2026-10-23) for 27 and 31 Oct, 8 Nov, 10 and 25 Dec 2026;
// Aeri hours from its 2026 day-by-day calendar; fares from Turistren (valid
// to 31 Dec 2026), the Aeri's 2026 fare table and FGC's ticket shop. The
// "about five kilometres" figure was dropped: no page read today states it.
// Every clock time sits inside a table (batch02.test.ts enforces it).
// 26 Oct 2026: cremallera re-read from FGC's GTFS (feed_version
// 2026-10-25T15:22:41+01:00, route MM) for 28 Oct, 2, 4 and 7 Nov, 8, 10,
// 25 and 28 Dec. Service 6350da927176 (weekdays 2 Nov–24 Dec except 7–8 Dec)
// ends an hour earlier: last up 17:48, last down 18:15, last from
// Monistrol-Vila 18:15. Weekends, 7–8 Dec and 28–31 Dec keep 18:48 / 19:15.
// 28 Oct 2026 (page-1 push, research_notes/page1-28oct/portaventura_montserrat.md):
// cremallera and R5 re-read from FGC's GTFS (feed_version 2026-10-27, ends
// 31 Dec 2026), unchanged; Aeri calendar re-read day by day: 1 Nov keeps the
// October hours and 7 Dec the holiday ones, so the table names both. Museum
// "10 EUR" is for "students, seniors and groups" with no age. No free
// cremallera exists; what is free (dogs, Aeri under-4s, Monistrol-Vila
// parking) is said instead. Weekday R50 trains skip Montserrat-Aeri (GTFS).
// 13 Nov 2026 (cable car vs rack railway vs car/coach upgrade,
// research_notes/evergreen-demand-nov2026.md item 9): FGC GTFS re-read
// (feed_version 2026-11-10, ends 31 Dec 2026) for 18 and 21 Nov, 10 and 25 Dec:
// every R5 and cremallera figure above unchanged. Aeri calendar re-read for
// November and December (unchanged; January 2027 not yet published). Turistren
// and Aeri fares unchanged (valid to 31 Dec 2026). Trans Montserrat 50 and Tot
// Montserrat 71.5 read from the FGC shop's "price". New: comparison and
// "by situation" tables; FGC places Monistrol de Montserrat and Montserrat-Aeri
// in "ZONA 4Z" (hence the 4-zone train + rack railway fare, €28.80 return);
// Aeri: 50 km and «35 minuts aproximadament en cotxe», 544 m drop, 1,350 m,
// «2, amb capacitat per a 32 persones cadascuna», no accessibility statement;
// cremallerademontserrat.cat: «Trains and rack railway are accessible for
// people with reduced mobility»; FGC Monistrol station lists «Ascensor»;
// Montserrat Visita: paid car park at the top «at rates laid down annually»,
// «Free parking» at the Aeri station, 900 free spaces at Monistrol-Vila, the
// sanctuary hours table, the Escolania (weekdays at 1 pm, breaks), the :15
// connection. Its Autocars Julià coach (9.15 am, €6.25) is named but its time
// and fare are not printed: the operator's site did not answer and the same
// Montserrat Visita pages carry stale FGC times ("08.26 am"). Montserrat
// Visita's "more than 600 metres" and "15 minutes" for the cremallera are not
// used (FGC's timetable gives 20 minutes from Monistrol de Montserrat).
const MONTSERRAT_VERIFIED = "2026-11-21";
/** Fares are valid to 31 Dec 2026 and the Aeri calendar ends then: re-read both before this date (a test fails after it). */
export const MONTSERRAT_REREAD_BY = "2027-01-01";

type MontT = {
  title: string; seoTitle: string; seoDescription: string; excerpt: string;
  lead: string;
  factsTitle: string; facts: { label: string; value: string }[];
  rackTitle: string; rack: string[];
  rackCaption: string; rackHeaders: string[]; rackRows: string[][]; rackNote: string;
  aeriTitle: string; aeri: string[];
  aeriCaption: string; aeriHeaders: string[]; aeriRows: string[][]; aeriNote: string;
  trainTitle: string; train: string[];
  trainCaption: string; trainHeaders: string[]; trainRows: string[][]; trainNote: string;
  chooseTitle: string; choose: string[];
  compareCaption: string; compareHeaders: string[]; compareRows: string[][]; compareNote: string;
  bestTitle: string; bestCaption: string; bestHeaders: string[]; bestRows: string[][];
  mixTitle: string; mix: string[];
  accessTitle: string; access: string[];
  hoursTitle: string; hoursCaption: string; hoursHeaders: string[]; hoursRows: string[][]; hoursNote: string;
  pricesTitle: string; pricesCaption: string; pricesHeaders: string[]; pricesRows: string[][]; pricesNote: string;
  combosTitle: string; combos: string[];
  beforeTitle: string; before: string;
  upTitle: string; upIntro: string; up: string[];
  beyond: string;
  faq: { question: string; answer: string }[];
};

const MONTSERRAT_COPY: Record<"ca" | "es" | "en", MontT> = {
  ca: {
    title: "Montserrat per lliure des de Barcelona: horaris del cremallera i l'Aeri 2026, preus i tren R5",
    seoTitle: "Cremallera i Aeri de Montserrat 2026: horaris i preus",
    seoDescription:
      "R5 des de Plaça Espanya i cremallera (cada hora, 15 € anada i tornada) o Aeri (cada 15 minuts, 15 €). Horaris de tardor i Trans Montserrat a 50 €.",
    excerpt:
      "Com anar a Montserrat pel teu compte: horaris del tren R5, del cremallera i de l'Aeri, preus del 2026 i bitllets combinats.",
    lead: "Per anar a Montserrat per lliure, agafa l'**R5 d'FGC a Plaça Espanya**: en **60 minuts** arriba a l'estació de l'**Aeri** i en **64** a **Monistrol de Montserrat**, on enllaça el **cremallera**, que surt **cada hora** i puja en 20 minuts. El cremallera costa **15 € anada i tornada** i l'Aeri, que surt **cada 15 minuts** i puja en 5, també **15 €**. El bitllet **Trans Montserrat** (50 €) ho inclou tot des de Barcelona.",
    factsTitle: "Montserrat sense excursió, en resum",
    facts: [
      { label: "Tren des de Barcelona", value: "R5 d'FGC des de Plaça Espanya: 60 min fins a l'Aeri, 64 fins a Monistrol de Montserrat" },
      { label: "Cremallera", value: "Cada hora des de Monistrol de Montserrat, 20 min; 9 € anada, 15 € anada i tornada" },
      { label: "Aeri (telefèric)", value: "Cada 15 min, 5 min de trajecte; 10 € anada, 15 € anada i tornada" },
      { label: "Tot inclòs", value: "Trans Montserrat 50 €: tren, cremallera o Aeri, funicular de Sant Joan i metro" },
      { label: "En cotxe", value: "Uns 50 km; aparcament gratuït a les estacions de l'Aeri i de Monistrol-Vila, de pagament a dalt" },
    ],
    rackTitle: "Horaris del cremallera de Montserrat",
    rack: [
      "El cremallera surt **cada hora** de l'estació de **Monistrol de Montserrat**, on para l'R5, i arriba al monestir en 20 minuts; des de **Monistrol-Vila**, a l'altra banda del poble, n'hi ha més i triga 13. L'R5 que surt de Plaça Espanya al minut :36 enllaça amb el cremallera del minut :48.",
      "De baixada, els trens que surten de Montserrat al quart d'hora enllacen a Monistrol amb l'R5 cap a Barcelona. Del 2 de novembre al 24 de desembre, els dies feiners l'últim tren puja i baixa una hora abans que els caps de setmana: mira la taula.",
      "Si hi vas en tren, baixa a **Monistrol de Montserrat**: l'R5 no para a Monistrol-Vila. **Monistrol-Vila** és l'estació del poble, amb aparcament gratuït per als usuaris del cremallera, per a qui hi arriba amb cotxe.",
    ],
    rackCaption: "Cremallera de Montserrat, del 26 d'octubre al 31 de desembre de 2026",
    rackHeaders: ["Trajecte", "Caps de setmana i festius (i fins al 30 d'octubre)", "Feiners del 2 de novembre al 24 de desembre", "Durada"],
    rackRows: [
      ["Monistrol de Montserrat (enllaç R5) → Montserrat", "Cada hora a :48, de 7:48 a 18:48", "Cada hora a :48, de 7:48 a 17:48", "20 min"],
      ["Montserrat → Monistrol de Montserrat", "Cada hora a :15, de 8:15 a 19:15", "Cada hora a :15, de 8:15 a 18:15", "20 min"],
      ["Monistrol-Vila → Montserrat", "Cada 20 min, de 8:35 a 19:15 (fins al 30 d'octubre, algunes hores cada 40 min)", "A :15 i :55, fins a les 18:15", "13 min"],
      ["25 de desembre", "Última pujada 13:48 (14:15 des de Monistrol-Vila)", "—", "—"],
    ],
    rackNote: "Dades obertes d'horaris d'FGC (versió del 20 de novembre de 2026) per al 24 i el 28 de novembre i el 7, el 8, el 24, el 25 i el 29 de desembre, llegides el 21 de novembre; abans, versió del 27 d'octubre per al 28 d'octubre. El 7 i el 8 de desembre i del 28 al 31 de desembre s'aplica l'horari de cap de setmana.",
    aeriTitle: "Horaris de l'Aeri de Montserrat",
    aeri: [
      "L'**Aeri** és el telefèric que puja des de la seva pròpia estació de l'R5 (Montserrat-Aeri) fins al monestir. Surt **cada 15 minuts** i el trajecte dura uns **5 minuts**. Els horaris canvien amb la temporada: a l'octubre tanca més tard, i al novembre i desembre tanca abans entre setmana.",
    ],
    aeriCaption: "Aeri de Montserrat, calendari 2026",
    aeriHeaders: ["Període", "Horari"],
    aeriRows: [
      ["Octubre i l'1 de novembre", "9:30–19:00"],
      ["Novembre i desembre, feiners (excepte el 7 de desembre)", "9:30–17:15"],
      ["Novembre i desembre, caps de setmana i festius, i el 7 de desembre", "9:30–18:15"],
      ["25 de desembre", "9:30–14:00"],
    ],
    aeriNote: "Calendari 2026 publicat per l'Aeri de Montserrat, consultat el 21 de novembre de 2026: el de gener del 2027 encara no hi és.",
    trainTitle: "Tren R5 de Plaça Espanya a Montserrat",
    train: [
      "L'R5 d'FGC (direcció Manresa) surt de Plaça Espanya i para a **Montserrat-Aeri**, per a l'Aeri, i a **Monistrol de Montserrat**, per al cremallera. Els feiners hi ha uns 30 trens al dia i els caps de setmana un cada hora. La T-mobilitat no val per al cremallera ni els funiculars, que no formen part de la xarxa integrada.",
    ],
    trainCaption: "R5 entre Plaça Espanya i Montserrat",
    trainHeaders: ["Trajecte", "Dies", "Sortides", "Durada"],
    trainRows: [
      ["Plaça Espanya → Monistrol de Montserrat / Aeri", "Feiners", "De 5:16 a 22:30, un o dos per hora", "64 min (60 fins a l'Aeri)"],
      ["Plaça Espanya → Monistrol de Montserrat / Aeri", "Caps de setmana i festius", "Cada hora a :36, de 5:36 a 21:36, i a les 22:30", "64 min (60 fins a l'Aeri)"],
      ["Monistrol de Montserrat → Plaça Espanya", "Cada dia", "Cada hora a :41 (feiners també a :01 o :21), l'últim a les 21:41 (arriba a Plaça Espanya a les 22:45)", "64 min"],
      ["Montserrat-Aeri → Plaça Espanya", "Cada dia", "Feiners, un o dos per hora; caps de setmana, cada hora a :45; l'últim a les 21:45", "60 min"],
    ],
    trainNote: "Dades obertes d'horaris d'FGC (versió del 20 de novembre de 2026) per al 24, el 28 i el 29 de novembre i el 9, el 19 i el 31 de desembre de 2026. Les R5 que surten de Monistrol de Montserrat més tard de les 21:41 van cap a Manresa o només fins a Martorell Enllaç. Alguns trens R50 dels dies feiners no paren a Montserrat-Aeri: si vas a l'Aeri, comprova que el teu tren hi pari.",
    chooseTitle: "Aeri, cremallera, cotxe o autocar: comparativa",
    choose: [
      "La pujada en cremallera és progressiva i deixa veure com canvia el paisatge; la de l'Aeri és una vista vertical de cop: la cabina salva 544 metres de desnivell en 1.350 metres de cable, amb pendents de fins al 45 %. Costen el mateix d'anada i tornada.",
      "La diferència pràctica és la freqüència: l'Aeri surt cada quart d'hora, mentre que el cremallera des de Monistrol de Montserrat surt un cop per hora, enllaçat amb l'R5. Si no vols esperar, l'Aeri és més flexible; si vols enllaçar sense pensar-hi amb el tren de tornada, el cremallera ja està sincronitzat amb l'R5.",
    ],
    compareCaption: "De Barcelona al monestir de Montserrat: les quatre opcions",
    compareHeaders: ["Opció", "Des de Barcelona", "Enllaç per pujar", "Temps total", "Bitllets combinats", "Preu adult (2026)"],
    compareRows: [
      ["Aeri (telefèric)", "R5 d'FGC des de Plaça Espanya fins a Montserrat-Aeri (60 min)", "Cabina cada 15 min, 5 min de trajecte; no va sincronitzada amb el tren", "De 65 a 80 min (60 de tren, fins a 15 d'espera i 5 de cabina)", "Trans Montserrat versió Aeri (50 €) o Tot Montserrat (71,50 €)", "Aeri 10 € anada, 15 € anada i tornada, més el tren (zona 4)"],
      ["Cremallera", "R5 d'FGC des de Plaça Espanya fins a Monistrol de Montserrat (64 min)", "Cada hora a :48, enllaçat amb l'R5 que arriba a :40; 20 min", "1 h 32 min (sortida de Plaça Espanya a :36, arribada a :08)", "Tren + cremallera anada i tornada, 4 zones (28,80 €); Trans Montserrat (50 €); Tot Montserrat (71,50 €)", "Cremallera 9 € anada, 15 € anada i tornada"],
      ["Cotxe", "Uns 50 km, uns 35 min fins a l'estació de l'Aeri", "Aparcament gratuït a l'estació de l'Aeri i a Monistrol-Vila (900 places, cremallera cada 20 min els caps de setmana); o pujar en cotxe fins a dalt", "35 min fins a baix, més l'Aeri o el cremallera", "—", "Aparcament de dalt de pagament (tarifa fixada cada any), amb places limitades"],
      ["Autocar", "Autocars Julià, des del carrer Viriat, al costat de l'estació de Sants", "Directe al monestir", "Consulta-ho a l'operador", "—", "Consulta-ho a l'operador"],
    ],
    compareNote: "Horaris i preus del tren i el cremallera: dades obertes d'FGC (versió del 20 de novembre de 2026) i Turistren (preus vàlids fins al 31 de desembre de 2026). Aeri: tarifes 2026 i calendari. Cotxe: Aeri de Montserrat i Montserrat Visita. Autocar: Montserrat Visita, que en dona horari i preu que no hem pogut confirmar amb l'operador. Consultat el 13 i el 21 de novembre de 2026.",
    bestTitle: "Quin et convé, segons el cas",
    bestCaption: "La millor opció per pujar a Montserrat, segons la situació",
    bestHeaders: ["Si…", "Agafa", "Per què"],
    bestRows: [
      ["No vols esperar", "Aeri", "Surt cada 15 minuts; el cremallera des de Monistrol de Montserrat, un cop per hora"],
      ["No vols pensar en l'enllaç de tornada", "Cremallera", "Els trens que surten de Montserrat al quart d'hora enllacen amb l'R5 cap a Barcelona"],
      ["Vas amb cadira de rodes o cotxet", "Cremallera", "FGC indica que els trens i el cremallera són accessibles per a persones amb mobilitat reduïda; l'Aeri no publica informació d'accessibilitat"],
      ["Tens vertigen", "Cremallera", "L'Aeri és una cabina penjada que puja amb pendents de fins al 45 %"],
      ["Hi vas en cotxe", "Aparca a baix", "L'aparcament de dalt té places limitades i és de pagament; a l'estació de l'Aeri i a Monistrol-Vila és gratuït"],
      ["Vols el museu i dinar", "Tot Montserrat", "Per 71,50 € inclou el transport des de Barcelona, el funicular de Sant Joan, el museu i el bufet"],
      ["Vols pujar per una banda i baixar per l'altra", "Dos bitllets senzills", "10 € l'Aeri i 9 € el cremallera, 19 € en total, en lloc dels 15 € d'anada i tornada"],
    ],
    mixTitle: "Pujar en Aeri i baixar en cremallera",
    mix: [
      "Es pot fer, però els bitllets d'anada i tornada no són intercanviables: compra un bitllet senzill de cada un (19 € per adult). Els combinats Trans Montserrat i Tot Montserrat es venen en versió cremallera o en versió Aeri, i tries una de les dues quan el compres a Plaça Espanya.",
      "Recorda que l'R5 para en una estació diferent per a cada un: **Montserrat-Aeri** per a l'Aeri i **Monistrol de Montserrat** per al cremallera, quatre minuts més amunt de la línia.",
    ],
    accessTitle: "Accessibilitat, gossos i cotxets",
    access: [
      "FGC indica que els trens i el cremallera de Montserrat són accessibles per a persones amb mobilitat reduïda, i l'estació de Monistrol de Montserrat té ascensor. Les persones amb carnet de discapacitat tenen un 50 % de descompte al cremallera i als funiculars, amb les mateixes condicions per a l'acompanyant.",
      "L'Aeri no publica informació d'accessibilitat al seu web: té dues cabines de 32 places cadascuna. Si vas amb cadira de rodes, pregunta-ho abans al +34 93 835 0005 o tria el cremallera.",
      "Els gossos viatgen gratis tant a l'Aeri com al cremallera, lligats i amb morrió (al cremallera en venen a la taquilla per 5 € si no en portes).",
    ],
    hoursTitle: "Horaris a dalt: basílica, Mare de Déu i museu",
    hoursCaption: "Horaris del santuari de Montserrat",
    hoursHeaders: ["Lloc", "Horari"],
    hoursRows: [
      ["Basílica", "7:00–20:00"],
      ["Cambril de la Mare de Déu", "8:00–10:30 i 12:00–18:25"],
      ["Santa Cova (a peu; el funicular és tancat)", "Feiners 10:30–16:00; caps de setmana i festius 10:30–16:30"],
      ["Museu de Montserrat", "10:00–17:45"],
      ["Espai Audiovisual", "Feiners 9:00–17:45; caps de setmana i festius 9:00–18:45"],
      ["Escolania", "Canta de dilluns a divendres a les 13:00 (no després de Sant Joan fins a final d'agost, després de Nadal ni per Setmana Santa)"],
    ],
    hoursNote: "Horaris publicats per Montserrat Visita (Abadia de Montserrat), consultats el 13 de novembre de 2026. Poden variar per les celebracions religioses.",
    pricesTitle: "Preus del cremallera, l'Aeri i el funicular",
    pricesCaption: "Pujar a Montserrat: preus del 2026",
    pricesHeaders: ["Bitllet", "Adult", "Infant (4–13)", "Més de 65"],
    pricesRows: [
      ["Cremallera, anada / anada i tornada", "9 € / 15 €", "4,50 € / 7,50 €", "8,10 € / 13,50 €"],
      ["Aeri de Montserrat, anada / anada i tornada", "10 € / 15 €", "5,25 € / 7,50 € (menors de 4, gratis)", "8,75 € / 12,50 €"],
      ["Funicular de Sant Joan, anada / anada i tornada", "11,40 € / 17,50 €", "5,70 € / 8,75 €", "10,25 € / 15,75 €"],
      ["Trans Montserrat (des de Plaça Espanya)", "50 €", "—", "—"],
      ["Tot Montserrat (des de Plaça Espanya)", "71,50 €", "—", "—"],
      ["Museu de Montserrat", "12 €", "6 € (de 8 a 16 anys)", "10 € (sèniors i estudiants)"],
    ],
    pricesNote: "Cremallera i funicular: preus vàlids fins al 31 de desembre de 2026 (Turistren). Aeri: tarifes 2026. Combinats: botiga d'FGC, consultada el 21 de novembre de 2026; museu: el seu web, consultat el 28 d'octubre.",
    combosTitle: "Trans Montserrat i Tot Montserrat: què inclouen",
    combos: [
      "El **Trans Montserrat** (50 €) inclou el tren d'FGC d'anada i tornada des de Plaça Espanya, el **cremallera o l'Aeri** (hi ha una versió de cada), el funicular de Sant Joan, l'Espai Audiovisual, l'accés a la basílica i al cambril de la Mare de Déu segons aforament i un bitllet de metro de tornada. El **Tot Montserrat** (71,50 €) hi afegeix el Museu de Montserrat i el dinar de bufet. Cap dels dos inclou el cant de l'Escolania.",
      "Són bitllets sense data: valen per a qualsevol dia fins al pròxim canvi de tarifes i es poden cancel·lar gratis dins dels 15 dies posteriors a la compra; els funiculars s'han de fer servir el dia que arribes al monestir, i no es poden reservar: s'hi accedeix fent cua. Si els compres en línia, has de bescanviar el bitllet al Punt d'Acollida de l'estació de Plaça Espanya (de dilluns a diumenge, de 8 a 14 h) el mateix dia del viatge. Les persones amb targeta de discapacitat tenen un 50 % de descompte al cremallera i els funiculars, i les famílies nombroses i monoparentals, un 20 % o un 50 %.",
    ],
    beforeTitle: "Abans d'anar-hi",
    before: "El **funicular de la Santa Cova** està fora de servei per manteniment fins a nou avís (s'hi pot baixar a peu). Els turistes no residents paguen entrada per accedir al santuari (basílica i cambril); els residents a Catalunya, a la resta d'Espanya i a la UE en queden exempts, però han de reservar al web de l'Abadia per venerar la Mare de Déu.",
    upTitle: "Què fer a dalt",
    upIntro: "Una primera visita pot combinar:",
    up: [
      "el recinte del santuari;",
      "la basílica;",
      "l'entorn de la Moreneta, segons el tipus d'entrada;",
      "el museu, si t'interessa;",
      "el funicular de Sant Joan (el de la Santa Cova és tancat), segons el temps;",
      "una caminada curta si la meteorologia és adequada.",
    ],
    beyond: `Aquesta guia explica com pujar a Montserrat pel teu compte. Si el que busques és una altra escapada, menys concorreguda, tenim ${link("montserrat", "ca", "deu escapades des de Barcelona que no són Montserrat")}.`,
    faq: [
      { question: "Quins horaris té el cremallera de Montserrat?", answer: "Surt cada hora de Monistrol de Montserrat, enllaçat amb l'R5. Del 2 de novembre al 24 de desembre, els dies feiners l'últim tren puja i baixa una hora abans que els caps de setmana; la taula d'aquesta pàgina té les hores." },
      { question: "Quant costa el cremallera de Montserrat?", answer: "9 € l'anada i 15 € l'anada i tornada per a adults; 4,50 € i 7,50 € per als infants de 4 a 13 anys. Preus vàlids fins al 31 de desembre de 2026." },
      { question: "Quins horaris té l'Aeri de Montserrat?", answer: "Surt cada 15 minuts. Al novembre i el desembre obre al matí i tanca a primera hora del vespre entre setmana i una hora més tard els caps de setmana i festius; la taula té les hores exactes." },
      { question: "Què és millor, el cremallera o l'Aeri?", answer: "Costen el mateix (15 € anada i tornada). L'Aeri surt cada 15 minuts i puja en 5; el cremallera surt cada hora des de Monistrol de Montserrat i puja en 20, amb una pujada més suau." },
      { question: "Com s'hi va de Barcelona a Montserrat en tren?", answer: "Amb l'R5 d'FGC des de Plaça Espanya: 60 minuts fins a l'estació de l'Aeri o 64 fins a Monistrol de Montserrat, on es canvia al cremallera." },
      { question: "Què inclou el Trans Montserrat?", answer: "Per 50 €: tren d'FGC des de Plaça Espanya, cremallera o Aeri, funicular de Sant Joan, Espai Audiovisual, accés a la basílica i metro de tornada." },
      { question: "El cremallera de Montserrat és gratis per a algú?", answer: "No hi ha bitllet gratuït ni cap promoció vigent: paguen tots els viatgers a partir de 4 anys. Els gossos hi viatgen gratis, lligats i amb morrió, i l'aparcament de Monistrol-Vila és gratuït per als usuaris del cremallera. A l'Aeri, els menors de 4 anys no paguen. La T-mobilitat no hi és vàlida." },
      { question: "A quina estació he de baixar per agafar el cremallera?", answer: "A Monistrol de Montserrat, on para l'R5. Monistrol-Vila és l'altra estació del cremallera, al poble, amb aparcament gratuït per a qui hi va amb cotxe." },
      { question: "Puc pujar en Aeri i baixar en cremallera?", answer: "Sí, però els bitllets d'anada i tornada no són intercanviables: compra un senzill de cada un, 10 € l'Aeri i 9 € el cremallera. Els combinats Trans Montserrat i Tot Montserrat inclouen només un dels dos, que tries en comprar-los." },
      { question: "Quant es triga de Barcelona a Montserrat?", answer: "Amb el cremallera, una hora i mitja: 64 minuts d'R5 fins a Monistrol de Montserrat, l'enllaç i 20 minuts de pujada. Amb l'Aeri, una hora de tren més l'espera (com a màxim un quart d'hora) i 5 minuts de cabina." },
      { question: "L'Aeri de Montserrat és accessible amb cadira de rodes?", answer: "L'Aeri no en publica informació: pregunta-ho abans per telèfon. FGC sí que indica que els trens i el cremallera són accessibles per a persones amb mobilitat reduïda." },
      { question: "Es pot anar a Montserrat en cotxe?", answer: "Sí. Són uns 50 km des de Barcelona. Pots aparcar gratis a l'estació de l'Aeri o a Monistrol-Vila i pujar en Aeri o en cremallera, o pujar fins al monestir, on l'aparcament és de pagament i té places limitades." },
      { question: "Hi ha autobús de Barcelona a Montserrat?", answer: "Montserrat Visita, el web de l'Abadia, indica un autocar d'Autocars Julià que surt del carrer Viriat, al costat de l'estació de Sants. No n'hem pogut confirmar l'horari ni el preu amb l'operador: consulta-ho abans d'anar-hi." },
    ],
  },
  es: {
    title: "Montserrat por libre desde Barcelona: horarios del cremallera y el teleférico, precios y tren R5 de FGC",
    seoTitle: "Cremallera y teleférico de Montserrat: horarios y precios",
    seoDescription:
      "R5 desde Plaça Espanya y cremallera (cada hora, 15 € ida y vuelta) o Aeri (cada 15 minutos, 15 €). Horarios de otoño y Trans Montserrat a 50 €.",
    excerpt:
      "Cómo ir a Montserrat por tu cuenta: horarios del tren R5, del cremallera y del Aeri, precios de 2026 y billetes combinados.",
    lead: "Para ir a Montserrat por libre, coge la **R5 de FGC en Plaça Espanya**: en **60 minutos** llega a la estación del **Aeri** y en **64** a **Monistrol de Montserrat**, donde enlaza el **cremallera**, que sale **cada hora** y sube en 20 minutos. El cremallera cuesta **15 € ida y vuelta** y el Aeri, el teleférico, que sale **cada 15 minutos** y sube en 5, también **15 €**. El billete **Trans Montserrat** (50 €) lo incluye todo desde Barcelona.",
    factsTitle: "Montserrat sin excursión, en resumen",
    facts: [
      { label: "Tren desde Barcelona", value: "R5 de FGC desde Plaça Espanya: 60 min hasta el Aeri, 64 hasta Monistrol de Montserrat" },
      { label: "Cremallera", value: "Cada hora desde Monistrol de Montserrat, 20 min; 9 € ida, 15 € ida y vuelta" },
      { label: "Aeri (teleférico)", value: "Cada 15 min, 5 min de trayecto; 10 € ida, 15 € ida y vuelta" },
      { label: "Todo incluido", value: "Trans Montserrat 50 €: tren, cremallera o Aeri, funicular de Sant Joan y metro" },
      { label: "En coche", value: "Unos 50 km; aparcamiento gratuito en las estaciones del Aeri y de Monistrol-Vila, de pago arriba" },
    ],
    rackTitle: "Horarios del cremallera de Montserrat",
    rack: [
      "El cremallera sale **cada hora** de la estación de **Monistrol de Montserrat**, donde para la R5, y llega al monasterio en 20 minutos; desde **Monistrol-Vila**, al otro lado del pueblo, hay más y tarda 13. La R5 que sale de Plaça Espanya en el minuto :36 enlaza con el cremallera del minuto :48.",
      "De bajada, los trenes que salen de Montserrat y cuarto enlazan en Monistrol con la R5 hacia Barcelona. Del 2 de noviembre al 24 de diciembre, los laborables el último tren sube y baja una hora antes que los fines de semana: mira la tabla.",
      "Si vas en tren, bájate en **Monistrol de Montserrat**: la R5 no para en Monistrol-Vila. **Monistrol-Vila** es la estación del pueblo, con aparcamiento gratuito para los usuarios del cremallera, para quien llega en coche.",
    ],
    rackCaption: "Cremallera de Montserrat, del 26 de octubre al 31 de diciembre de 2026",
    rackHeaders: ["Trayecto", "Fines de semana y festivos (y hasta el 30 de octubre)", "Laborables del 2 de noviembre al 24 de diciembre", "Duración"],
    rackRows: [
      ["Monistrol de Montserrat (enlace R5) → Montserrat", "Cada hora a :48, de 7:48 a 18:48", "Cada hora a :48, de 7:48 a 17:48", "20 min"],
      ["Montserrat → Monistrol de Montserrat", "Cada hora a :15, de 8:15 a 19:15", "Cada hora a :15, de 8:15 a 18:15", "20 min"],
      ["Monistrol-Vila → Montserrat", "Cada 20 min, de 8:35 a 19:15 (hasta el 30 de octubre, algunas horas cada 40 min)", "A :15 y :55, hasta las 18:15", "13 min"],
      ["25 de diciembre", "Última subida 13:48 (14:15 desde Monistrol-Vila)", "—", "—"],
    ],
    rackNote: "Datos abiertos de horarios de FGC (versión del 20 de noviembre de 2026) para el 24 y el 28 de noviembre y el 7, el 8, el 24, el 25 y el 29 de diciembre, leídos el 21 de noviembre; antes, versión del 27 de octubre para el 28 de octubre. El 7 y el 8 de diciembre y del 28 al 31 de diciembre rige el horario de fin de semana.",
    aeriTitle: "Horarios del teleférico de Montserrat (Aeri)",
    aeri: [
      "El **Aeri** es el teleférico que sube desde su propia estación de la R5 (Montserrat-Aeri) hasta el monasterio. Sale **cada 15 minutos** y el trayecto dura unos **5 minutos**. Los horarios cambian con la temporada: en octubre cierra más tarde, y en noviembre y diciembre cierra antes entre semana.",
    ],
    aeriCaption: "Aeri de Montserrat, calendario 2026",
    aeriHeaders: ["Periodo", "Horario"],
    aeriRows: [
      ["Octubre y el 1 de noviembre", "9:30–19:00"],
      ["Noviembre y diciembre, laborables (salvo el 7 de diciembre)", "9:30–17:15"],
      ["Noviembre y diciembre, fines de semana y festivos, y el 7 de diciembre", "9:30–18:15"],
      ["25 de diciembre", "9:30–14:00"],
    ],
    aeriNote: "Calendario 2026 publicado por el Aeri de Montserrat, consultado el 21 de noviembre de 2026: el de enero de 2027 aún no está.",
    trainTitle: "Tren R5 de Plaça Espanya a Montserrat",
    train: [
      "La R5 de FGC (dirección Manresa) sale de Plaça Espanya y para en **Montserrat-Aeri**, para el Aeri, y en **Monistrol de Montserrat**, para el cremallera. Los laborables hay unos 30 trenes al día y los fines de semana uno cada hora. La T-mobilitat no vale para el cremallera ni los funiculares, que no forman parte de la red integrada.",
    ],
    trainCaption: "R5 entre Plaça Espanya y Montserrat",
    trainHeaders: ["Trayecto", "Días", "Salidas", "Duración"],
    trainRows: [
      ["Plaça Espanya → Monistrol de Montserrat / Aeri", "Laborables", "De 5:16 a 22:30, uno o dos por hora", "64 min (60 hasta el Aeri)"],
      ["Plaça Espanya → Monistrol de Montserrat / Aeri", "Fines de semana y festivos", "Cada hora a :36, de 5:36 a 21:36, y a las 22:30", "64 min (60 hasta el Aeri)"],
      ["Monistrol de Montserrat → Plaça Espanya", "Todos los días", "Cada hora a :41 (laborables también a :01 o :21), el último a las 21:41 (llega a Plaça Espanya a las 22:45)", "64 min"],
      ["Montserrat-Aeri → Plaça Espanya", "Todos los días", "Laborables, uno o dos por hora; fines de semana, cada hora a :45; el último a las 21:45", "60 min"],
    ],
    trainNote: "Datos abiertos de horarios de FGC (versión del 20 de noviembre de 2026) para el 24, el 28 y el 29 de noviembre y el 9, el 19 y el 31 de diciembre de 2026. Las R5 que salen de Monistrol de Montserrat después de las 21:41 van hacia Manresa o solo hasta Martorell Enllaç. Algunos trenes R50 de los laborables no paran en Montserrat-Aeri: si vas al teleférico, comprueba que tu tren pare allí.",
    chooseTitle: "Teleférico, cremallera, coche o autocar: comparativa",
    choose: [
      "La subida en cremallera es progresiva y permite ver cómo cambia el paisaje; la del Aeri es una vista vertical de golpe: la cabina salva 544 metros de desnivel en 1.350 metros de cable, con pendientes de hasta el 45 %. Cuestan lo mismo ida y vuelta.",
      "La diferencia práctica es la frecuencia: el Aeri sale cada cuarto de hora, mientras que el cremallera desde Monistrol de Montserrat sale una vez por hora, enlazado con la R5. Si no quieres esperar, el Aeri es más flexible; si prefieres enlazar sin pensarlo con el tren de vuelta, el cremallera ya está sincronizado con la R5.",
    ],
    compareCaption: "De Barcelona al monasterio de Montserrat: las cuatro opciones",
    compareHeaders: ["Opción", "Desde Barcelona", "Enlace para subir", "Tiempo total", "Billetes combinados", "Precio adulto (2026)"],
    compareRows: [
      ["Aeri (teleférico)", "R5 de FGC desde Plaça Espanya hasta Montserrat-Aeri (60 min)", "Cabina cada 15 min, 5 min de trayecto; no va sincronizada con el tren", "De 65 a 80 min (60 de tren, hasta 15 de espera y 5 de cabina)", "Trans Montserrat versión Aeri (50 €) o Tot Montserrat (71,50 €)", "Aeri 10 € ida, 15 € ida y vuelta, más el tren (zona 4)"],
      ["Cremallera", "R5 de FGC desde Plaça Espanya hasta Monistrol de Montserrat (64 min)", "Cada hora a :48, enlazado con la R5 que llega a :40; 20 min", "1 h 32 min (salida de Plaça Espanya a :36, llegada a :08)", "Tren + cremallera ida y vuelta, 4 zonas (28,80 €); Trans Montserrat (50 €); Tot Montserrat (71,50 €)", "Cremallera 9 € ida, 15 € ida y vuelta"],
      ["Coche", "Unos 50 km, unos 35 min hasta la estación del Aeri", "Aparcamiento gratuito en la estación del Aeri y en Monistrol-Vila (900 plazas, cremallera cada 20 min los fines de semana); o subir en coche hasta arriba", "35 min hasta abajo, más el Aeri o el cremallera", "—", "Aparcamiento de arriba de pago (tarifa fijada cada año), con plazas limitadas"],
      ["Autocar", "Autocares Julià, desde la calle Viriat, junto a la estación de Sants", "Directo al monasterio", "Consúltalo con el operador", "—", "Consúltalo con el operador"],
    ],
    compareNote: "Horarios y precios del tren y el cremallera: datos abiertos de FGC (versión del 20 de noviembre de 2026) y Turistren (precios válidos hasta el 31 de diciembre de 2026). Aeri: tarifas 2026 y calendario. Coche: Aeri de Montserrat y Montserrat Visita. Autocar: Montserrat Visita, que da un horario y un precio que no hemos podido confirmar con el operador. Consultado el 13 y el 21 de noviembre de 2026.",
    bestTitle: "Cuál te conviene, según el caso",
    bestCaption: "La mejor opción para subir a Montserrat, según la situación",
    bestHeaders: ["Si…", "Coge", "Por qué"],
    bestRows: [
      ["No quieres esperar", "Aeri", "Sale cada 15 minutos; el cremallera desde Monistrol de Montserrat, una vez por hora"],
      ["No quieres pensar en el enlace de vuelta", "Cremallera", "Los trenes que salen de Montserrat y cuarto enlazan con la R5 hacia Barcelona"],
      ["Vas con silla de ruedas o carrito", "Cremallera", "FGC indica que los trenes y el cremallera son accesibles para personas con movilidad reducida; el Aeri no publica información de accesibilidad"],
      ["Tienes vértigo", "Cremallera", "El Aeri es una cabina colgada que sube con pendientes de hasta el 45 %"],
      ["Vas en coche", "Aparca abajo", "El aparcamiento de arriba tiene plazas limitadas y es de pago; en la estación del Aeri y en Monistrol-Vila es gratuito"],
      ["Quieres el museo y comer", "Tot Montserrat", "Por 71,50 € incluye el transporte desde Barcelona, el funicular de Sant Joan, el museo y el bufé"],
      ["Quieres subir por un lado y bajar por el otro", "Dos billetes sencillos", "10 € el Aeri y 9 € el cremallera, 19 € en total, en lugar de los 15 € de ida y vuelta"],
    ],
    mixTitle: "Subir en teleférico y bajar en cremallera",
    mix: [
      "Se puede, pero los billetes de ida y vuelta no son intercambiables: compra un billete sencillo de cada uno (19 € por adulto). Los combinados Trans Montserrat y Tot Montserrat se venden en versión cremallera o en versión Aeri, y eliges una de las dos al comprarlo en Plaça Espanya.",
      "Recuerda que la R5 para en una estación distinta para cada uno: **Montserrat-Aeri** para el teleférico y **Monistrol de Montserrat** para el cremallera, cuatro minutos más arriba en la línea.",
    ],
    accessTitle: "Accesibilidad, perros y carritos",
    access: [
      "FGC indica que los trenes y el cremallera de Montserrat son accesibles para personas con movilidad reducida, y la estación de Monistrol de Montserrat tiene ascensor. Las personas con tarjeta de discapacidad tienen un 50 % de descuento en el cremallera y los funiculares, con las mismas condiciones para el acompañante.",
      "El Aeri no publica información de accesibilidad en su web: tiene dos cabinas de 32 plazas cada una. Si vas en silla de ruedas, pregúntalo antes en el +34 93 835 0005 o elige el cremallera.",
      "Los perros viajan gratis tanto en el Aeri como en el cremallera, atados y con bozal (en el cremallera venden uno en la taquilla por 5 € si no lo llevas).",
    ],
    hoursTitle: "Horarios arriba: basílica, Virgen y museo",
    hoursCaption: "Horarios del santuario de Montserrat",
    hoursHeaders: ["Lugar", "Horario"],
    hoursRows: [
      ["Basílica", "7:00–20:00"],
      ["Camarín de la Virgen", "8:00–10:30 y 12:00–18:25"],
      ["Santa Cova (a pie; el funicular está cerrado)", "Laborables 10:30–16:00; fines de semana y festivos 10:30–16:30"],
      ["Museu de Montserrat", "10:00–17:45"],
      ["Espai Audiovisual", "Laborables 9:00–17:45; fines de semana y festivos 9:00–18:45"],
      ["Escolania", "Canta de lunes a viernes a las 13:00 (no después de Sant Joan hasta finales de agosto, después de Navidad ni en Semana Santa)"],
    ],
    hoursNote: "Horarios publicados por Montserrat Visita (Abadía de Montserrat), consultados el 13 de noviembre de 2026. Pueden variar por las celebraciones religiosas.",
    pricesTitle: "Precios del cremallera, el teleférico y el funicular",
    pricesCaption: "Subir a Montserrat: precios de 2026",
    pricesHeaders: ["Billete", "Adulto", "Niño (4–13)", "Mayores de 65"],
    pricesRows: [
      ["Cremallera, ida / ida y vuelta", "9 € / 15 €", "4,50 € / 7,50 €", "8,10 € / 13,50 €"],
      ["Aeri de Montserrat, ida / ida y vuelta", "10 € / 15 €", "5,25 € / 7,50 € (menores de 4, gratis)", "8,75 € / 12,50 €"],
      ["Funicular de Sant Joan, ida / ida y vuelta", "11,40 € / 17,50 €", "5,70 € / 8,75 €", "10,25 € / 15,75 €"],
      ["Trans Montserrat (desde Plaça Espanya)", "50 €", "—", "—"],
      ["Tot Montserrat (desde Plaça Espanya)", "71,50 €", "—", "—"],
      ["Museu de Montserrat", "12 €", "6 € (de 8 a 16 años)", "10 € (sénior y estudiantes)"],
    ],
    pricesNote: "Cremallera y funicular: precios válidos hasta el 31 de diciembre de 2026 (Turistren). Aeri: tarifas 2026. Combinados: tienda de FGC, consultada el 21 de noviembre de 2026; museo: su web, consultada el 28 de octubre.",
    combosTitle: "Trans Montserrat y Tot Montserrat: qué incluyen",
    combos: [
      "El **Trans Montserrat** (50 €) incluye el tren de FGC de ida y vuelta desde Plaça Espanya, el **cremallera o el Aeri** (hay una versión de cada), el funicular de Sant Joan, el Espai Audiovisual, el acceso a la basílica y al camarín de la Virgen según aforo y un billete de metro de vuelta. El **Tot Montserrat** (71,50 €) añade el Museu de Montserrat y la comida de bufé. Ninguno de los dos incluye el canto de la Escolania.",
      "Son billetes sin fecha: valen para cualquier día hasta el próximo cambio de tarifas y se pueden cancelar gratis en los 15 días siguientes a la compra; los funiculares hay que usarlos el día que llegas al monasterio, y no se pueden reservar: se accede haciendo cola. Si los compras en línea, hay que canjear el billete en el Punt d'Acollida de la estación de Plaça Espanya (de lunes a domingo, de 8 a 14 h) el mismo día del viaje. Las personas con tarjeta de discapacidad tienen un 50 % de descuento en el cremallera y los funiculares, y las familias numerosas y monoparentales, un 20 % o un 50 %.",
    ],
    beforeTitle: "Antes de ir",
    before: "El **funicular de la Santa Cova** está fuera de servicio por mantenimiento hasta nuevo aviso (se puede bajar a pie). Los turistas no residentes pagan entrada para acceder al santuario (basílica y camarín); los residentes en Cataluña, el resto de España y la UE están exentos, pero deben reservar en la web de la Abadía para venerar a la Virgen.",
    upTitle: "Qué hacer arriba",
    upIntro: "Una primera visita puede combinar:",
    up: [
      "el recinto del santuario;",
      "la basílica;",
      "el entorno de la Moreneta, según el tipo de entrada;",
      "el museo, si te interesa;",
      "el funicular de Sant Joan (el de la Santa Cova está cerrado), según el tiempo;",
      "un paseo corto si la meteorología acompaña.",
    ],
    beyond: `Esta guía explica cómo subir a Montserrat por tu cuenta. Si lo que buscas es otra escapada, menos concurrida, tenemos ${link("montserrat", "es", "diez escapadas desde Barcelona que no son Montserrat")}.`,
    faq: [
      { question: "¿Qué horarios tiene el cremallera de Montserrat?", answer: "Sale cada hora de Monistrol de Montserrat, enlazado con la R5. Del 2 de noviembre al 24 de diciembre, los laborables el último tren sube y baja una hora antes que los fines de semana; la tabla de esta página tiene las horas." },
      { question: "¿Cuánto cuesta el cremallera de Montserrat?", answer: "9 € la ida y 15 € la ida y vuelta para adultos; 4,50 € y 7,50 € para niños de 4 a 13 años. Precios válidos hasta el 31 de diciembre de 2026." },
      { question: "¿Cuánto cuesta el teleférico de Montserrat?", answer: "El Aeri cuesta 10 € la ida y 15 € la ida y vuelta para adultos; los niños de 4 a 13 años pagan 5,25 € y 7,50 €, y los menores de 4 no pagan." },
      { question: "¿Qué es mejor, el cremallera o el teleférico?", answer: "Cuestan lo mismo (15 € ida y vuelta). El Aeri sale cada 15 minutos y sube en 5; el cremallera sale cada hora desde Monistrol de Montserrat y sube en 20, con una subida más suave." },
      { question: "¿Cómo llegar a Montserrat en tren desde Barcelona?", answer: "Con la R5 de FGC desde Plaça Espanya: 60 minutos hasta la estación del Aeri o 64 hasta Monistrol de Montserrat, donde se cambia al cremallera." },
      { question: "¿Qué incluye el Trans Montserrat?", answer: "Por 50 €: tren de FGC desde Plaça Espanya, cremallera o Aeri, funicular de Sant Joan, Espai Audiovisual, acceso a la basílica y metro de vuelta." },
      { question: "¿Es gratis el cremallera de Montserrat para alguien?", answer: "No hay billete gratuito ni ninguna promoción vigente: pagan todos los viajeros desde los 4 años. Los perros viajan gratis, atados y con bozal, y el aparcamiento de Monistrol-Vila es gratuito para los usuarios del cremallera. En el teleférico (Aeri), los menores de 4 años no pagan. La T-mobilitat no es válida." },
      { question: "¿En qué estación hay que bajar para coger el cremallera?", answer: "En Monistrol de Montserrat, donde para la R5. Monistrol-Vila es la otra estación del cremallera, en el pueblo, con aparcamiento gratuito para quien va en coche." },
      { question: "¿Puedo subir en teleférico y bajar en cremallera?", answer: "Sí, pero los billetes de ida y vuelta no son intercambiables: compra un sencillo de cada uno, 10 € el Aeri y 9 € el cremallera. Los combinados Trans Montserrat y Tot Montserrat incluyen solo uno de los dos, que eliges al comprarlos." },
      { question: "¿Cuánto se tarda de Barcelona a Montserrat?", answer: "Con el cremallera, hora y media: 64 minutos de R5 hasta Monistrol de Montserrat, el enlace y 20 minutos de subida. Con el teleférico, una hora de tren más la espera (como mucho un cuarto de hora) y 5 minutos de cabina." },
      { question: "¿El teleférico de Montserrat es accesible en silla de ruedas?", answer: "El Aeri no publica información al respecto: pregúntalo antes por teléfono. FGC sí indica que los trenes y el cremallera son accesibles para personas con movilidad reducida." },
      { question: "¿Se puede ir a Montserrat en coche?", answer: "Sí. Son unos 50 km desde Barcelona. Puedes aparcar gratis en la estación del Aeri o en Monistrol-Vila y subir en teleférico o en cremallera, o subir hasta el monasterio, donde el aparcamiento es de pago y tiene plazas limitadas." },
      { question: "¿Hay autobús de Barcelona a Montserrat?", answer: "Montserrat Visita, la web de la Abadía, indica un autocar de Autocares Julià que sale de la calle Viriat, junto a la estación de Sants. No hemos podido confirmar su horario ni su precio con el operador: consúltalo antes de ir." },
    ],
  },
  en: {
    title: "Montserrat without a tour: rack railway and cable car times, fares and the R5 train",
    seoTitle: "Montserrat cable car or rack railway: 2026 times and fares",
    seoDescription:
      "The R5 from Plaça Espanya, then the rack railway (hourly, €15 return) or the Aeri cable car (every 15 min, €15). Autumn times; Trans Montserrat €50.",
    excerpt:
      "How to reach Montserrat on your own: R5 train, rack railway and cable car timetables, 2026 fares and the combined tickets.",
    lead: "To visit Montserrat without a tour, take FGC's **R5 from Plaça Espanya**: it reaches the **Aeri cable car** station in **60 minutes** and **Monistrol de Montserrat** in **64**, where the **rack railway** leaves **every hour** and climbs in 20 minutes. The rack railway costs **€15 return**, and the cable car, which runs **every 15 minutes** and takes 5, also **€15**. The **Trans Montserrat** ticket (€50) covers everything from Barcelona.",
    factsTitle: "Montserrat without a tour at a glance",
    facts: [
      { label: "Train from Barcelona", value: "FGC R5 from Plaça Espanya: 60 min to the Aeri, 64 to Monistrol de Montserrat" },
      { label: "Rack railway (Cremallera)", value: "Hourly from Monistrol de Montserrat, 20 min; €9 single, €15 return" },
      { label: "Cable car (Aeri)", value: "Every 15 min, 5-minute ride; €10 single, €15 return" },
      { label: "All-in ticket", value: "Trans Montserrat €50: train, rack railway or cable car, Sant Joan funicular and metro" },
      { label: "By car", value: "About 50 km; free parking at the Aeri and Monistrol-Vila stations, paid at the top" },
    ],
    rackTitle: "Montserrat rack railway timetable",
    rack: [
      "The rack railway leaves **every hour** from **Monistrol de Montserrat** station, where the R5 stops, and reaches the monastery in 20 minutes; from **Monistrol-Vila**, across the village, trains are more frequent and take 13. The R5 leaving Plaça Espanya at :36 past the hour connects with the rack railway at :48.",
      "Coming down, the trains leaving Montserrat at a quarter past connect at Monistrol with the R5 to Barcelona. From 2 November to 24 December, on weekdays the last trains up and down run an hour earlier than at weekends: see the table.",
      "Coming by train, get off at **Monistrol de Montserrat**: the R5 does not stop at Monistrol-Vila. **Monistrol-Vila** is the village station, with free parking for rack-railway passengers, for those arriving by car.",
    ],
    rackCaption: "Montserrat rack railway, 26 October to 31 December 2026",
    rackHeaders: ["Route", "Weekends and holidays (and until 30 October)", "Weekdays, 2 November to 24 December", "Journey"],
    rackRows: [
      ["Monistrol de Montserrat (R5 connection) → Montserrat", "Hourly at :48, 7:48 to 18:48", "Hourly at :48, 7:48 to 17:48", "20 min"],
      ["Montserrat → Monistrol de Montserrat", "Hourly at :15, 8:15 to 19:15", "Hourly at :15, 8:15 to 18:15", "20 min"],
      ["Monistrol-Vila → Montserrat", "Every 20 min, 8:35 to 19:15 (until 30 October, some hours every 40 min)", "At :15 and :55, until 18:15", "13 min"],
      ["25 December", "Last train up 13:48 (14:15 from Monistrol-Vila)", "—", "—"],
    ],
    rackNote: "FGC's open timetable data (version of 20 November 2026) for 24 and 28 November and 7, 8, 24, 25 and 29 December, read on 21 November; earlier, the 27 October version for 28 October. On 7 and 8 December and from 28 to 31 December the weekend timetable applies.",
    aeriTitle: "Montserrat cable car (Aeri) opening times",
    aeri: [
      "The **Aeri** is the cable car that climbs from its own R5 station (Montserrat-Aeri) to the monastery. It runs **every 15 minutes** and the ride takes about **5 minutes**. Hours change with the season: in October it stays open later, and in November and December it closes earlier on weekdays.",
    ],
    aeriCaption: "Aeri de Montserrat, 2026 calendar",
    aeriHeaders: ["Period", "Hours"],
    aeriRows: [
      ["October and 1 November", "9:30–19:00"],
      ["November and December, weekdays (except 7 December)", "9:30–17:15"],
      ["November and December, weekends and holidays, and 7 December", "9:30–18:15"],
      ["25 December", "9:30–14:00"],
    ],
    aeriNote: "2026 calendar published by the Aeri de Montserrat, checked on 21 November 2026: January 2027 is not out yet.",
    trainTitle: "R5 train from Plaça Espanya to Montserrat",
    train: [
      "FGC's R5 (towards Manresa) leaves from Plaça Espanya and stops at **Montserrat-Aeri**, for the cable car, and at **Monistrol de Montserrat**, for the rack railway. On weekdays there are about 30 trains a day; at weekends one an hour. The T-mobilitat card is not valid on the rack railway or the funiculars, which are outside the integrated fare network.",
    ],
    trainCaption: "R5 between Plaça Espanya and Montserrat",
    trainHeaders: ["Route", "Days", "Departures", "Journey"],
    trainRows: [
      ["Plaça Espanya → Monistrol de Montserrat / Aeri", "Weekdays", "5:16 to 22:30, one or two an hour", "64 min (60 to the Aeri)"],
      ["Plaça Espanya → Monistrol de Montserrat / Aeri", "Weekends and holidays", "Hourly at :36, 5:36 to 21:36, and at 22:30", "64 min (60 to the Aeri)"],
      ["Monistrol de Montserrat → Plaça Espanya", "Every day", "Hourly at :41 (weekdays also at :01 or :21), last at 21:41 (arrives at Plaça Espanya at 22:45)", "64 min"],
      ["Montserrat-Aeri → Plaça Espanya", "Every day", "Weekdays one or two an hour; weekends hourly at :45; last at 21:45", "60 min"],
    ],
    trainNote: "FGC's open timetable data (version of 20 November 2026) for 24, 28 and 29 November and 9, 19 and 31 December 2026. R5 trains leaving Monistrol de Montserrat after 21:41 go towards Manresa or only as far as Martorell Enllaç. Some weekday R50 trains do not stop at Montserrat-Aeri: if you are going to the cable car, check that yours does.",
    chooseTitle: "Cable car vs rack railway vs car or coach",
    choose: [
      "The rack railway climbs gradually and lets you watch the landscape change; the cable car gives you the vertical view all at once: the cabin climbs 544 metres on 1,350 metres of cable, on gradients of up to 45%. Returns cost the same on both.",
      "The practical difference is frequency: the cable car leaves every quarter of an hour, while the rack railway from Monistrol de Montserrat runs once an hour, timed to the R5. If you do not want to wait, the cable car is more flexible; if you want the connection with the train back taken care of, the rack railway is already timed to the R5.",
    ],
    compareCaption: "Barcelona to Montserrat monastery: the four ways",
    compareHeaders: ["Option", "From Barcelona", "Connection up", "Total time", "Combined tickets", "Adult fare (2026)"],
    compareRows: [
      ["Cable car (Aeri)", "FGC R5 from Plaça Espanya to Montserrat-Aeri (60 min)", "A cabin every 15 min, 5-minute ride; not timed to the train", "65 to 80 min (60 on the train, up to 15 waiting, 5 in the cabin)", "Trans Montserrat, cable-car version (€50), or Tot Montserrat (€71.50)", "Aeri €10 single, €15 return, plus the train (zone 4)"],
      ["Rack railway (Cremallera)", "FGC R5 from Plaça Espanya to Monistrol de Montserrat (64 min)", "Hourly at :48, timed to the R5 arriving at :40; 20 min", "1 h 32 min (leave Plaça Espanya at :36, arrive at :08)", "Train + rack railway return, 4 zones (€28.80); Trans Montserrat (€50); Tot Montserrat (€71.50)", "Rack railway €9 single, €15 return"],
      ["Car", "About 50 km, about 35 min to the cable-car station", "Free parking at the Aeri station and at Monistrol-Vila (900 spaces, rack railway every 20 min at weekends); or drive up to the top", "35 min to the bottom, plus the cable car or rack railway", "—", "Paid car park at the top (rate set each year), with limited spaces"],
      ["Coach", "Autocars Julià, from carrer Viriat beside Sants station", "Straight to the monastery", "Check with the operator", "—", "Check with the operator"],
    ],
    compareNote: "Train and rack railway times and fares: FGC open timetable data (version of 20 November 2026) and Turistren (fares valid until 31 December 2026). Cable car: 2026 fares and calendar. Car: Aeri de Montserrat and Montserrat Visita. Coach: Montserrat Visita, which gives a time and fare we could not confirm with the operator. Checked on 13 and 21 November 2026.",
    bestTitle: "Which to choose, by situation",
    bestCaption: "The best way up Montserrat for your situation",
    bestHeaders: ["If…", "Take", "Why"],
    bestRows: [
      ["You do not want to wait", "Cable car", "It leaves every 15 minutes; the rack railway from Monistrol de Montserrat, once an hour"],
      ["You want the connection back taken care of", "Rack railway", "The trains leaving Montserrat at a quarter past the hour connect with the R5 to Barcelona"],
      ["You use a wheelchair or have a pushchair", "Rack railway", "FGC says its trains and the rack railway are accessible for people with reduced mobility; the Aeri publishes no accessibility information"],
      ["You are afraid of heights", "Rack railway", "The Aeri is a hanging cabin climbing gradients of up to 45%"],
      ["You are driving", "Park at the bottom", "The car park at the top is paid and has limited spaces; at the Aeri station and Monistrol-Vila parking is free"],
      ["You want the museum and lunch", "Tot Montserrat", "For €71.50 it covers transport from Barcelona, the Sant Joan funicular, the museum and the buffet"],
      ["You want to go up one way and down the other", "Two singles", "€10 for the cable car and €9 for the rack railway, €19 in all, instead of €15 for a return"],
    ],
    mixTitle: "Up by cable car, down by rack railway",
    mix: [
      "You can, but returns are not interchangeable: buy a single on each (€19 for an adult). The Trans Montserrat and Tot Montserrat combined tickets come in a rack-railway version and a cable-car version, and you choose one when you buy it at Plaça Espanya.",
      "Remember that the R5 stops at a different station for each: **Montserrat-Aeri** for the cable car and **Monistrol de Montserrat** for the rack railway, four minutes further up the line.",
    ],
    accessTitle: "Accessibility, dogs and pushchairs",
    access: [
      "FGC says the trains and the Montserrat rack railway are accessible for people with reduced mobility, and Monistrol de Montserrat station has a lift. Holders of a disability card get 50% off the rack railway and the funiculars, on the same terms for a companion.",
      "The Aeri publishes no accessibility information on its website: it has two cabins for 32 people each. If you use a wheelchair, ask first on +34 93 835 0005 or take the rack railway.",
      "Dogs travel free on both the cable car and the rack railway, on a lead and muzzled (the rack railway ticket office sells a muzzle for €5 if you have none).",
    ],
    hoursTitle: "Opening hours at the top: basilica, Black Madonna and museum",
    hoursCaption: "Montserrat sanctuary opening hours",
    hoursHeaders: ["Place", "Hours"],
    hoursRows: [
      ["Basilica", "7:00–20:00"],
      ["Throne of Our Lady (the Black Madonna)", "8:00–10:30 and 12:00–18:25"],
      ["Santa Cova (on foot; the funicular is closed)", "Weekdays 10:30–16:00; weekends and holidays 10:30–16:30"],
      ["Museu de Montserrat", "10:00–17:45"],
      ["Audiovisual Space", "Weekdays 9:00–17:45; weekends and holidays 9:00–18:45"],
      ["Escolania boys' choir", "Sings Monday to Friday at 13:00 (not from Sant Joan, 24 June, to the end of August, after Christmas or in Holy Week)"],
    ],
    hoursNote: "Hours published by Montserrat Visita (the Abbey of Montserrat), read on 13 November 2026. They can change for religious services.",
    pricesTitle: "Rack railway, cable car and funicular fares",
    pricesCaption: "Getting up Montserrat: 2026 fares",
    pricesHeaders: ["Ticket", "Adult", "Child (4–13)", "Over 65"],
    pricesRows: [
      ["Rack railway, single / return", "€9 / €15", "€4.50 / €7.50", "€8.10 / €13.50"],
      ["Aeri cable car, single / return", "€10 / €15", "€5.25 / €7.50 (under-4s free)", "€8.75 / €12.50"],
      ["Sant Joan funicular, single / return", "€11.40 / €17.50", "€5.70 / €8.75", "€10.25 / €15.75"],
      ["Trans Montserrat (from Plaça Espanya)", "€50", "—", "—"],
      ["Tot Montserrat (from Plaça Espanya)", "€71.50", "—", "—"],
      ["Museu de Montserrat", "€12", "€6 (ages 8 to 16)", "€10 (seniors and students)"],
    ],
    pricesNote: "Rack railway and funicular: fares valid until 31 December 2026 (Turistren). Cable car: 2026 fares. Combined tickets: FGC's shop, checked on 21 November 2026; museum: its own site, checked on 28 October.",
    combosTitle: "Trans Montserrat and Tot Montserrat: what they include",
    combos: [
      "**Trans Montserrat** (€50) includes the return FGC train from Plaça Espanya, the **rack railway or the cable car** (there is a version of each), the Sant Joan funicular, the audiovisual space, access to the basilica and the Black Madonna's chapel subject to capacity, and a return metro ticket. **Tot Montserrat** (€71.50) adds the Museu de Montserrat and a buffet lunch. Neither includes the Escolania choir.",
      "They are open-dated: valid on any day until the next fare change, with free cancellation within 15 days of purchase; the funiculars must be used on the day you reach the monastery, and they cannot be booked: you queue. If you buy online, you exchange the e-ticket at the Punt d'Acollida in Plaça Espanya station (Monday to Sunday, 8 am to 2 pm) on the day you travel. Holders of a disability card get 50% off the rack railway and funiculars, and large and single-parent families 20% or 50%.",
    ],
    beforeTitle: "Before you go",
    before: "The **Santa Cova funicular** is out of service for maintenance until further notice (you can walk down). Non-resident tourists pay to enter the sanctuary (basilica and chapel); residents of Catalonia, the rest of Spain and the EU are exempt but must book on the Abbey's website to visit the Black Madonna.",
    upTitle: "What to do up there",
    upIntro: "A first visit can combine:",
    up: [
      "the sanctuary precinct;",
      "the basilica;",
      "the Moreneta, depending on your ticket;",
      "the museum, if it interests you;",
      "the Sant Joan funicular (the Santa Cova one is closed), depending on time;",
      "a short walk if the weather allows.",
    ],
    beyond: `This guide is about getting up Montserrat on your own. If you would rather go somewhere quieter, here are ${link("montserrat", "en", "ten Barcelona day trips that are not Montserrat")}.`,
    faq: [
      { question: "What is the Montserrat rack railway timetable?", answer: "It leaves every hour from Monistrol de Montserrat, timed to the R5. From 2 November to 24 December, on weekdays the last trains up and down run an hour earlier than at weekends; the table on this page has the times." },
      { question: "How much is the Montserrat rack railway?", answer: "€9 single and €15 return for adults; €4.50 and €7.50 for children aged 4 to 13. Fares valid until 31 December 2026." },
      { question: "How much is the Montserrat cable car?", answer: "The Aeri costs €10 single and €15 return for adults; children aged 4 to 13 pay €5.25 and €7.50, and under-4s go free." },
      { question: "Montserrat cable car or rack railway (cogwheel train): which is better?", answer: "They cost the same (€15 return). The cable car leaves every 15 minutes and takes 5; the rack railway leaves hourly from Monistrol de Montserrat and takes 20, with a gentler climb." },
      { question: "How do I get from Barcelona to Montserrat by train?", answer: "On FGC's R5 from Plaça Espanya: 60 minutes to the Aeri cable car station or 64 to Monistrol de Montserrat, where you change to the rack railway." },
      { question: "What does Trans Montserrat include?", answer: "For €50: the FGC train from Plaça Espanya, the rack railway or cable car, the Sant Joan funicular, the audiovisual space, basilica access and a return metro ticket." },
      { question: "Can you go to Montserrat without a tour?", answer: "Yes. Take FGC's R5 from Plaça Espanya and the rack railway or the cable car up; the Trans Montserrat ticket covers both legs and the Sant Joan funicular for €50." },
      { question: "Which station is Monistrol-Vila?", answer: "The rack railway's village station in Monistrol de Montserrat, with free parking for passengers arriving by car. The R5 does not stop there: by train, get off at Monistrol de Montserrat." },
      { question: "Is the Montserrat rack railway free for anyone?", answer: "There is no free ticket or current promotion: everyone from age 4 pays. Dogs travel free on a lead and muzzled, Monistrol-Vila parking is free for passengers, and under-4s ride the cable car free. The T-mobilitat card is not valid." },
      { question: "Can I go up by cable car and come down by rack railway?", answer: "Yes, but returns are not interchangeable: buy a single on each, €10 for the cable car and €9 for the rack railway. The Trans Montserrat and Tot Montserrat combined tickets include only one of the two, which you choose when you buy." },
      { question: "How long does it take from Barcelona to Montserrat?", answer: "By rack railway, about an hour and a half: 64 minutes on the R5 to Monistrol de Montserrat, the connection and a 20-minute climb. By cable car, an hour on the train plus the wait (a quarter of an hour at most) and a 5-minute ride." },
      { question: "Is the Montserrat cable car wheelchair accessible?", answer: "The Aeri publishes no information on it, so phone before you go. FGC does say its trains and the rack railway are accessible for people with reduced mobility." },
      { question: "Can I drive to Montserrat?", answer: "Yes. It is about 50 km from Barcelona. You can park free at the cable-car station or at Monistrol-Vila and ride up, or drive to the monastery, where parking is paid and spaces are limited." },
      { question: "Is there a bus from Barcelona to Montserrat?", answer: "Montserrat Visita, the Abbey's website, lists an Autocars Julià coach leaving from carrer Viriat, beside Sants station. We could not confirm its timetable or fare with the operator, so check before you go." },
    ],
  },
};

// 21 Nov 2026 (day-trips cluster push; queries "cable car or rack railway to
// montserrat", "montserrat cogwheel train", "fgc montserrat ticket",
// "montserrat pass", "santa cova funicular", "montserrat funicular closed",
// "montserrat to barcelona"). Read that day:
// - FGC GTFS feed_version 2026-11-20T08:56:15 (ends 31 Dec 2026): the rack
//   railway rows above are unchanged for 24 and 28 Nov and 7, 8, 24, 25 and
//   29 Dec; the R5 back to Plaça Espanya leaves Monistrol de Montserrat last
//   at 21:41 and Montserrat-Aeri at 21:45 (arrives 22:45) on 24, 28, 29 Nov,
//   9, 19 and 31 Dec: the old "22:41 / 22:45" were the Manresa-bound train
//   and the arrival time. Corrected in the table.
// - Turistren: rack railway 9/15 EUR; Tren + Cremallera 4 zones 15.90 single /
//   28.80 return (child 11.40/21.30, 65+ 15.00/27.30); "Bitllets de venda
//   exclusiva a l'estació de Monistrol-Vila": first and second train return
//   12 EUR (6, 10.80), M-Museu 22 EUR (child 12); Sant Joan 11.40/17.50
//   (5.70/8.75), Santa Cova 4.55/7.00, both 20.65; "El Funicular de la Santa
//   Cova romandrà fora de servei per tasques de manteniment fins a nou avís";
//   Sant Joan "circula de forma ininterrompuda durant tot l'any excepte del 13
//   al 31 de gener 2025 que està fora de servei per revisió anual" (stale
//   year, printed as such); all "vàlids fins al 31 de desembre del 2026".
// - Aeri "Tarifes 2026": Aeri + museum 24.25 (65+ 21.90), Aeri + buffet 35.75
//   (33.40), Aeri + museum + buffet 45.75 (43.40). Calendar: November and
//   December unchanged; January, February and June 2027 all show "(tancat)",
//   the placeholder for months not yet published.
// - FGC shop: Trans Montserrat "price":"50", Tot Montserrat "price":"71.5";
//   Trans includes "Funicular de Santa Cova inclòs quan està en servei".
// - TMB "2026 transport ticket fares" (in force from 15 January 2026): 4-zone
//   single 6,90 EUR, 4-zone T-casual 44,65 EUR (also on atm.cat). 6.90 + 9 =
//   15.90 and 2 x 6.90 + 15 = 28.80: the train leg of the FGC combined ticket.
// - Montserrat Visita: opening hours unchanged; no price for the tourist
//   ticket on its page (not printed). "Montserrat Exprés": no such ticket on
//   any official page read (FGC, Turistren, Aeri, Montserrat Visita): not
//   printed. museudemontserrat.cat did not answer (museum fare keeps 28 Oct).
type MontX = {
  names: string;
  ticketsTitle: string; tickets: string[];
  ticketsCaption: string; ticketsHeaders: string[]; ticketsRows: string[][]; ticketsNote: string;
  funicTitle: string; funic: string[];
  whenTitle: string; when: string[];
  planTitle: string; planIntro: string;
  planCaption: string; planHeaders: string[]; planRows: string[][]; planNote: string;
  faq: { question: string; answer: string }[];
};

const MONTSERRAT_21NOV: Record<"ca" | "es" | "en", MontX> = {
  ca: {
    names: "**Cremallera** i **tren cremallera** són el mateix tren, el que puja de Monistrol al monestir. L'**Aeri** és el telefèric (hi ha qui en diu funicular). Els dos **funiculars** de Montserrat, el de Sant Joan i el de la Santa Cova, són unes altres línies que surten del mateix monestir: s'agafen després del cremallera o de l'Aeri, no en lloc seu.",
    ticketsTitle: "Quin bitllet comprar per anar a Montserrat",
    tickets: [
      "L'R5 costa el mateix en tots dos casos: de Plaça Espanya a Montserrat-Aeri o a Monistrol de Montserrat són **4 zones**, 6,90 € el senzill. Per tant, el tren i l'Aeri d'anada i tornada sumen **28,80 €**, just el que costa el combinat tren + cremallera d'anada i tornada d'FGC.",
      "El **Trans Montserrat** (50 €) només compensa si puges també amb el funicular de Sant Joan: el tren + cremallera d'anada i tornada (28,80 €) i el Sant Joan d'anada i tornada (17,50 €) ja sumen 46,30 €, i el Trans Montserrat hi afegeix l'Espai Audiovisual i un bitllet de metro de tornada. Sense el funicular, els bitllets solts surten 21,20 € més barats; ara bé, si no resideixes a la UE, recorda que el Trans Montserrat també inclou l'accés al santuari que els turistes no residents paguen a part a l'Abadia.",
      "Dos bitllets del cremallera només es venen a **Monistrol-Vila**, l'estació on aparca qui hi va en cotxe: l'anada i tornada als dos primers trens del dia (12 €) i el **M-Museu**, cremallera d'anada i tornada i Museu de Montserrat (22 €).",
    ],
    ticketsCaption: "Bitllets per a Montserrat comparats, 2026",
    ticketsHeaders: ["Bitllet", "Què inclou", "Adult", "Infant; més de 65", "El ven"],
    ticketsRows: [
      ["Tren + cremallera (4 zones)", "R5 des de Plaça Espanya i cremallera", "15,90 € anada, 28,80 € anada i tornada", "11,40 € / 21,30 €; 15,00 € / 27,30 €", "FGC"],
      ["Només tren, per a l'Aeri", "R5 de Plaça Espanya a Montserrat-Aeri (4 zones)", "6,90 € senzill; T-casual de 4 zones, 44,65 € els 10 viatges", "—", "Bitllet integrat: màquines d'FGC, TMB o Rodalies"],
      ["Aeri (telefèric)", "Pujada i baixada en telefèric", "10 € anada, 15 € anada i tornada", "5,25 € / 7,50 €, menors de 4 gratis; 8,75 € / 12,50 €", "Aeri de Montserrat"],
      ["Aeri + museu / + bufet / + museu i bufet", "Telefèric d'anada i tornada amb museu, dinar o totes dues coses (sense tren)", "24,25 € / 35,75 € / 45,75 €", "més de 65: 21,90 € / 33,40 € / 43,40 €", "Aeri de Montserrat"],
      ["Trans Montserrat", "Tren d'anada i tornada des de Plaça Espanya, cremallera o Aeri, funicular de Sant Joan, Espai Audiovisual, accés a la basílica i metro de tornada", "50 €", "—", "FGC, a Plaça Espanya o en línia"],
      ["Tot Montserrat", "El Trans Montserrat més el museu i el dinar de bufet", "71,50 €", "—", "FGC, a Plaça Espanya o en línia"],
      ["Dos primers trens del dia", "Cremallera d'anada i tornada als dos primers trens des de Monistrol-Vila", "12 €", "6 €; 10,80 €", "FGC, només a Monistrol-Vila"],
      ["M-Museu", "Cremallera d'anada i tornada des de Monistrol-Vila + Museu de Montserrat", "22 €", "12 € (infant)", "FGC, només a Monistrol-Vila"],
    ],
    ticketsNote: "Turistren (FGC; preus del cremallera vàlids fins al 31 de desembre de 2026), la botiga en línia d'FGC (Trans i Tot Montserrat), les tarifes 2026 de l'Aeri i la taula de preus 2026 de TMB (senzill i T-casual de 4 zones, vigents des del 15 de gener de 2026). Consultat el 21 de novembre de 2026.",
    funicTitle: "Funiculars de Montserrat: Sant Joan obert, Santa Cova tancat",
    funic: [
      "El **funicular de Sant Joan** puja del monestir a la part alta de la muntanya. A l'estació superior, el Mirador de Sant Joan, hi ha el centre d'interpretació del Geoparc i del Parc Natural, i en surt el camí de Sant Joan per als caminants. Costa **11,40 € l'anada i 17,50 € l'anada i tornada** (infants, 5,70 € i 8,75 €) i és inclòs al Trans Montserrat i al Tot Montserrat. Turistren (FGC) indica que funciona tot l'any llevat de la revisió anual; la pàgina encara dona l'última del 13 al 31 de gener de 2025, així que comprova-ho abans d'anar-hi al gener.",
      "El **funicular de la Santa Cova** és **fora de servei per manteniment fins a nou avís**, segons FGC. Es pot baixar a peu a la Santa Cova pel seu camí (l'horari de la capella és a la taula de dalt). Quan torni a funcionar, Turistren dona 4,55 € l'anada, 7 € l'anada i tornada o 20,65 € pels dos funiculars.",
      "Cap dels dos funiculars no es pot reservar: s'hi fa cua a l'estació.",
    ],
    whenTitle: "Quan anar-hi",
    when: [
      "**Al novembre i al desembre, surt d'hora.** Els feiners del 2 de novembre al 24 de desembre, l'últim cremallera de baixada i l'Aeri acaben una hora abans que els caps de setmana (mira els horaris), i els caps de setmana l'R5 només passa un cop per hora.",
      "**Per sentir l'Escolania, vés-hi entre setmana:** només canta de dilluns a divendres, amb pauses a l'estiu, després de Nadal i per Setmana Santa (taula d'horaris de dalt).",
      "**Festius:** el 7 i el 8 de desembre hi ha horari de cap de setmana; el 25 de desembre el cremallera i l'Aeri tanquen a primera hora de la tarda.",
      "**Gener del 2027:** a 21 de novembre de 2026, ni FGC ni l'Aeri no havien publicat els preus del 2027 ni el calendari de gener del telefèric: comprova-ho abans d'anar-hi.",
    ],
    planTitle: "Un dia amb horaris: de Plaça Espanya a Montserrat i tornada en cremallera",
    planIntro: "Un exemple per a un dissabte o un diumenge amb els enllaços sincronitzats (dades d'FGC per al dissabte 28 de novembre de 2026). Deixa unes quatre hores a dalt; entre setmana serveixen les mateixes hores.",
    planCaption: "Montserrat en tren i cremallera, exemple de cap de setmana",
    planHeaders: ["Hora", "On", "Què"],
    planRows: [
      ["8:36", "Plaça Espanya", "R5 direcció Manresa"],
      ["9:40 → 9:48", "Monistrol de Montserrat", "Canvi al cremallera"],
      ["10:08", "Montserrat", "Arribada. El cambril de la Mare de Déu obre fins a les 10:30 i de nou des de les 12:00; el museu, des de les 10:00"],
      ["14:15", "Montserrat", "Cremallera de baixada"],
      ["14:41", "Monistrol de Montserrat", "R5 cap a Barcelona"],
      ["15:45", "Plaça Espanya", "Arribada"],
    ],
    planNote: "Dades obertes d'horaris d'FGC (versió del 20 de novembre de 2026) per al 24 i el 28 de novembre de 2026; horaris del santuari segons Montserrat Visita.",
    faq: [
      { question: "Funciona el funicular de Montserrat?", answer: "El de Sant Joan, sí (17,50 € anada i tornada). El de la Santa Cova és fora de servei per manteniment fins a nou avís; s'hi pot baixar a peu." },
      { question: "Quin bitllet he de comprar a Plaça Espanya per anar a Montserrat?", answer: "Per al cremallera, el combinat tren + cremallera d'FGC d'anada i tornada (4 zones, 28,80 €). Per a l'Aeri, un bitllet de tren de 4 zones (6,90 € cada trajecte) i l'Aeri d'anada i tornada (15 €). El Trans Montserrat (50 €) hi afegeix el funicular de Sant Joan, l'Espai Audiovisual i un bitllet de metro." },
      { question: "Serveix la T-casual per anar a Montserrat?", answer: "Per a l'R5, sí: és un trajecte de 4 zones, així que cal la T-casual de 4 zones (44,65 € els 10 viatges). No val per al cremallera, l'Aeri ni els funiculars." },
      { question: "A quina hora surt l'últim tren de Montserrat a Barcelona?", answer: "L'últim cremallera de baixada i l'últim Aeri enllacen amb trens R5 cap a Plaça Espanya, que encara circulen almenys dues hores després que l'últim cremallera arribi a Monistrol. Del 2 de novembre al 24 de desembre, el cremallera i l'Aeri acaben una hora abans els feiners. Les hores exactes són a les taules de dalt." },
    ],
  },
  es: {
    names: "**Cremallera** y **tren cremallera** son el mismo tren, el que sube de Monistrol al monasterio. El **Aeri** es el teleférico (hay quien lo llama funicular). Los dos **funiculares** de Montserrat, el de Sant Joan y el de la Santa Cova, son otras líneas que salen del propio monasterio: se cogen después del cremallera o del teleférico, no en su lugar.",
    ticketsTitle: "Qué billete comprar para ir a Montserrat",
    tickets: [
      "La R5 cuesta lo mismo en los dos casos: de Plaça Espanya a Montserrat-Aeri o a Monistrol de Montserrat son **4 zonas**, 6,90 € el sencillo. Así, el tren y el teleférico de ida y vuelta suman **28,80 €**, justo lo que cuesta el combinado tren + cremallera de ida y vuelta de FGC.",
      "El **Trans Montserrat** (50 €) solo compensa si subes también en el funicular de Sant Joan: el tren + cremallera de ida y vuelta (28,80 €) y el Sant Joan de ida y vuelta (17,50 €) ya suman 46,30 €, y el Trans Montserrat añade el Espai Audiovisual y un billete de metro de vuelta. Sin el funicular, los billetes sueltos salen 21,20 € más baratos; eso sí, si no resides en la UE, recuerda que el Trans Montserrat incluye también el acceso al santuario que los turistas no residentes pagan aparte a la Abadía.",
      "Dos billetes del cremallera solo se venden en **Monistrol-Vila**, la estación donde aparca quien va en coche: la ida y vuelta en los dos primeros trenes del día (12 €) y el **M-Museu**, cremallera de ida y vuelta y Museu de Montserrat (22 €).",
    ],
    ticketsCaption: "Billetes para Montserrat comparados, 2026",
    ticketsHeaders: ["Billete", "Qué incluye", "Adulto", "Niño; mayores de 65", "Lo vende"],
    ticketsRows: [
      ["Tren + cremallera (4 zonas)", "R5 desde Plaça Espanya y cremallera", "15,90 € ida, 28,80 € ida y vuelta", "11,40 € / 21,30 €; 15,00 € / 27,30 €", "FGC"],
      ["Solo tren, para el teleférico", "R5 de Plaça Espanya a Montserrat-Aeri (4 zonas)", "6,90 € sencillo; T-casual de 4 zonas, 44,65 € los 10 viajes", "—", "Billete integrado: máquinas de FGC, TMB o Rodalies"],
      ["Aeri (teleférico)", "Subida y bajada en teleférico", "10 € ida, 15 € ida y vuelta", "5,25 € / 7,50 €, menores de 4 gratis; 8,75 € / 12,50 €", "Aeri de Montserrat"],
      ["Aeri + museo / + bufé / + museo y bufé", "Teleférico de ida y vuelta con museo, comida o ambos (sin tren)", "24,25 € / 35,75 € / 45,75 €", "mayores de 65: 21,90 € / 33,40 € / 43,40 €", "Aeri de Montserrat"],
      ["Trans Montserrat", "Tren de ida y vuelta desde Plaça Espanya, cremallera o teleférico, funicular de Sant Joan, Espai Audiovisual, acceso a la basílica y metro de vuelta", "50 €", "—", "FGC, en Plaça Espanya o en línea"],
      ["Tot Montserrat", "El Trans Montserrat más el museo y la comida de bufé", "71,50 €", "—", "FGC, en Plaça Espanya o en línea"],
      ["Dos primeros trenes del día", "Cremallera de ida y vuelta en los dos primeros trenes desde Monistrol-Vila", "12 €", "6 €; 10,80 €", "FGC, solo en Monistrol-Vila"],
      ["M-Museu", "Cremallera de ida y vuelta desde Monistrol-Vila + Museu de Montserrat", "22 €", "12 € (niño)", "FGC, solo en Monistrol-Vila"],
    ],
    ticketsNote: "Turistren (FGC; precios del cremallera válidos hasta el 31 de diciembre de 2026), la tienda en línea de FGC (Trans y Tot Montserrat), las tarifas 2026 del Aeri y la tabla de precios 2026 de TMB (sencillo y T-casual de 4 zonas, vigentes desde el 15 de enero de 2026). Consultado el 21 de noviembre de 2026.",
    funicTitle: "Funiculares de Montserrat: Sant Joan abierto, Santa Cova cerrado",
    funic: [
      "El **funicular de Sant Joan** sube del monasterio a la parte alta de la montaña. En su estación superior, el Mirador de Sant Joan, está el centro de interpretación del Geoparque y del Parque Natural, y de allí sale el camino de Sant Joan para caminantes. Cuesta **11,40 € la ida y 17,50 € la ida y vuelta** (niños, 5,70 € y 8,75 €) y va incluido en el Trans Montserrat y el Tot Montserrat. Turistren (FGC) indica que funciona todo el año salvo en su revisión anual; la página aún da la última del 13 al 31 de enero de 2025, así que compruébalo antes de ir en enero.",
      "El **funicular de la Santa Cova** está **fuera de servicio por mantenimiento hasta nuevo aviso**, según FGC. Se puede bajar a pie a la Santa Cova por su camino (el horario de la capilla está en la tabla de arriba). Cuando vuelva a funcionar, Turistren da 4,55 € la ida, 7 € la ida y vuelta o 20,65 € por los dos funiculares.",
      "Ninguno de los dos funiculares se puede reservar: se hace cola en la estación.",
    ],
    whenTitle: "Cuándo ir",
    when: [
      "**En noviembre y diciembre, sal temprano.** Los laborables del 2 de noviembre al 24 de diciembre, el último cremallera de bajada y el teleférico terminan una hora antes que los fines de semana (mira los horarios), y los fines de semana la R5 pasa solo una vez por hora.",
      "**Para oír la Escolania, ve entre semana:** canta solo de lunes a viernes, con pausas en verano, después de Navidad y en Semana Santa (tabla de horarios de arriba).",
      "**Festivos:** el 7 y el 8 de diciembre rige el horario de fin de semana; el 25 de diciembre el cremallera y el teleférico cierran a primera hora de la tarde.",
      "**Enero de 2027:** a 21 de noviembre de 2026, ni FGC ni el Aeri habían publicado los precios de 2027 ni el calendario de enero del teleférico: compruébalo antes de ir.",
    ],
    planTitle: "Un día con horarios: de Plaça Espanya a Montserrat y vuelta en cremallera",
    planIntro: "Un ejemplo para un sábado o un domingo con los enlaces sincronizados (datos de FGC para el sábado 28 de noviembre de 2026). Deja unas cuatro horas arriba; entre semana sirven las mismas horas.",
    planCaption: "Montserrat en tren y cremallera, ejemplo de fin de semana",
    planHeaders: ["Hora", "Dónde", "Qué"],
    planRows: [
      ["8:36", "Plaça Espanya", "R5 dirección Manresa"],
      ["9:40 → 9:48", "Monistrol de Montserrat", "Cambio al cremallera"],
      ["10:08", "Montserrat", "Llegada. El camarín de la Virgen abre hasta las 10:30 y de nuevo desde las 12:00; el museo, desde las 10:00"],
      ["14:15", "Montserrat", "Cremallera de bajada"],
      ["14:41", "Monistrol de Montserrat", "R5 hacia Barcelona"],
      ["15:45", "Plaça Espanya", "Llegada"],
    ],
    planNote: "Datos abiertos de horarios de FGC (versión del 20 de noviembre de 2026) para el 24 y el 28 de noviembre de 2026; horarios del santuario según Montserrat Visita.",
    faq: [
      { question: "¿Funciona el funicular de Montserrat?", answer: "El de Sant Joan, sí (17,50 € ida y vuelta). El de la Santa Cova está fuera de servicio por mantenimiento hasta nuevo aviso; se puede bajar a pie." },
      { question: "¿Qué billete hay que comprar en Plaça Espanya para ir a Montserrat?", answer: "Para el cremallera, el combinado tren + cremallera de FGC de ida y vuelta (4 zonas, 28,80 €). Para el teleférico, un billete de tren de 4 zonas (6,90 € cada trayecto) y el Aeri de ida y vuelta (15 €). El Trans Montserrat (50 €) añade el funicular de Sant Joan, el Espai Audiovisual y un billete de metro." },
      { question: "¿Sirve la T-casual para ir a Montserrat?", answer: "Para la R5, sí: es un trayecto de 4 zonas, así que hace falta la T-casual de 4 zonas (44,65 € los 10 viajes). No vale para el cremallera, el teleférico ni los funiculares." },
      { question: "¿A qué hora sale el último tren de Montserrat a Barcelona?", answer: "El último cremallera de bajada y el último teleférico enlazan con trenes R5 hacia Plaça Espanya, que siguen circulando al menos dos horas después de que el último cremallera llegue a Monistrol. Del 2 de noviembre al 24 de diciembre, el cremallera y el Aeri terminan una hora antes los laborables. Las horas exactas están en las tablas de arriba." },
    ],
  },
  en: {
    names: "**Rack railway, cogwheel train and Cremallera** are three names for the same train, the one that climbs from Monistrol to the monastery. The **Aeri** is the cable car (some visitors call it the gondola or the funicular). Montserrat's two **funiculars**, Sant Joan and Santa Cova, are separate lines that leave from the monastery itself: you take them after the rack railway or the cable car, not instead.",
    ticketsTitle: "Which Montserrat ticket to buy",
    tickets: [
      "The R5 costs the same either way: Plaça Espanya to Montserrat-Aeri or Monistrol de Montserrat is a **4-zone** journey, €6.90 single. So the train and a cable-car return come to **€28.80**, exactly the price of FGC's train + rack railway return.",
      "**Trans Montserrat** (€50) only pays off with the Sant Joan funicular: the train + rack railway return (€28.80) and a Sant Joan return (€17.50) already make €46.30, and Trans Montserrat adds the audiovisual space and a return metro ticket. Without the funicular, separate tickets are €21.20 cheaper; but if you live outside the EU, remember that Trans Montserrat also includes the sanctuary access that non-resident tourists otherwise buy from the Abbey.",
      "Two rack railway tickets are sold only at **Monistrol-Vila**, the station where drivers park: a return on the first two trains of the day (€12) and **M-Museu**, a rack railway return plus the Museu de Montserrat (€22).",
    ],
    ticketsCaption: "Montserrat tickets compared, 2026",
    ticketsHeaders: ["Ticket", "What it covers", "Adult", "Child; over 65", "Sold by"],
    ticketsRows: [
      ["Train + rack railway (4 zones)", "R5 from Plaça Espanya and the rack railway", "€15.90 single, €28.80 return", "€11.40 / €21.30; €15.00 / €27.30", "FGC"],
      ["Train only, for the cable car", "R5 from Plaça Espanya to Montserrat-Aeri (4 zones)", "€6.90 single; 4-zone T-casual €44.65 for 10 journeys", "—", "Integrated ticket: FGC, TMB or Rodalies machines"],
      ["Aeri cable car", "The cable car up and down", "€10 single, €15 return", "€5.25 / €7.50, under-4s free; €8.75 / €12.50", "Aeri de Montserrat"],
      ["Aeri + museum / + buffet / + museum and buffet", "Cable car return with the museum, lunch or both (no train)", "€24.25 / €35.75 / €45.75", "over 65: €21.90 / €33.40 / €43.40", "Aeri de Montserrat"],
      ["Trans Montserrat", "Return train from Plaça Espanya, rack railway or cable car, Sant Joan funicular, audiovisual space, basilica access and a return metro ticket", "€50", "—", "FGC, at Plaça Espanya or online"],
      ["Tot Montserrat", "Trans Montserrat plus the museum and a buffet lunch", "€71.50", "—", "FGC, at Plaça Espanya or online"],
      ["First two trains of the day", "Rack railway return on the first two trains from Monistrol-Vila", "€12", "€6; €10.80", "FGC, Monistrol-Vila only"],
      ["M-Museu", "Rack railway return from Monistrol-Vila + Museu de Montserrat", "€22", "€12 (child)", "FGC, Monistrol-Vila only"],
    ],
    ticketsNote: "Turistren (FGC; rack railway fares valid until 31 December 2026), FGC's online shop (Trans and Tot Montserrat), the Aeri's 2026 fares and TMB's 2026 fare table (4-zone single and T-casual, in force since 15 January 2026). Checked on 21 November 2026.",
    funicTitle: "Montserrat funiculars: Sant Joan open, Santa Cova closed",
    funic: [
      "The **Sant Joan funicular** climbs from the monastery to the upper part of the mountain. At its top station, the Mirador de Sant Joan, there is the Geopark and Natural Park interpretation centre, and the Sant Joan path starts there for walkers. It costs **€11.40 single and €17.50 return** (children €5.70 and €8.75) and is included in Trans Montserrat and Tot Montserrat. FGC's Turistren says it runs all year except during its annual overhaul; the page still gives the last one as 13 to 31 January 2025, so check before a January visit.",
      "The **Santa Cova funicular** is **out of service for maintenance until further notice**, according to FGC. You can still walk down to the Holy Grotto along the Santa Cova path (the chapel's hours are in the table above). When it reopens, Turistren's fares are €4.55 single, €7 return, or €20.65 for both funiculars.",
      "Neither funicular can be booked: you queue at the station.",
    ],
    whenTitle: "Best time to go",
    when: [
      "**In November and December, start early.** On weekdays from 2 November to 24 December, the last rack railway down and the cable car finish an hour earlier than at weekends (see the timetables), and at weekends the R5 runs only once an hour.",
      "**For the Escolania choir, go on a weekday:** it sings Monday to Friday only, with breaks in summer, after Christmas and in Holy Week (hours table above).",
      "**Holidays:** 7 and 8 December run the weekend timetable; on 25 December the rack railway and the cable car close in the early afternoon.",
      "**January 2027:** as of 21 November 2026, neither FGC nor the Aeri had published 2027 fares or the cable car's January calendar: check both before you go.",
    ],
    planTitle: "A timed day: Plaça Espanya to Montserrat and back by rack railway",
    planIntro: "An example for a Saturday or Sunday using the timed connections (FGC's data for Saturday 28 November 2026). It leaves about four hours at the top; the same times work on weekdays.",
    planCaption: "Montserrat by train and rack railway, weekend example",
    planHeaders: ["Time", "Where", "What"],
    planRows: [
      ["8:36", "Plaça Espanya", "R5 towards Manresa"],
      ["9:40 → 9:48", "Monistrol de Montserrat", "Change to the rack railway"],
      ["10:08", "Montserrat", "Arrive. The Black Madonna's throne is open until 10:30 and again from 12:00; the museum from 10:00"],
      ["14:15", "Montserrat", "Rack railway down"],
      ["14:41", "Monistrol de Montserrat", "R5 to Barcelona"],
      ["15:45", "Plaça Espanya", "Arrive"],
    ],
    planNote: "FGC's open timetable data (version of 20 November 2026) for 24 and 28 November 2026; sanctuary hours from Montserrat Visita.",
    faq: [
      { question: "Is the Montserrat funicular open?", answer: "The Sant Joan funicular is running (€17.50 return). The Santa Cova funicular is out of service for maintenance until further notice; you can walk down to the Holy Grotto." },
      { question: "Which ticket do I buy at Plaça Espanya for Montserrat?", answer: "For the rack railway, FGC's train + rack railway return (4 zones, €28.80). For the cable car, a 4-zone train ticket (€6.90 each way) and an Aeri return (€15). Trans Montserrat (€50) adds the Sant Joan funicular, the audiovisual space and a metro ticket." },
      { question: "Can I use the T-casual to get to Montserrat?", answer: "On the R5 train, yes: it is a 4-zone journey, so you need a 4-zone T-casual (€44.65 for 10 journeys). It is not valid on the rack railway, the cable car or the funiculars." },
      { question: "What time is the last train from Montserrat to Barcelona?", answer: "The last rack railway down and the last cable car both connect with R5 trains to Plaça Espanya, which keep running for at least two hours after the last rack railway reaches Monistrol. From 2 November to 24 December, the rack railway and the Aeri stop an hour earlier on weekdays. The exact times are in the timetables above." },
    ],
  },
};

const MONTSERRAT_PATHS = {
  ca: "escapades/montserrat-per-lliure-des-barcelona",
  es: "escapadas/montserrat-por-libre-desde-barcelona",
  en: "day-trips/montserrat-without-a-tour-from-barcelona",
} as const;

function montserratBody(locale: "ca" | "es" | "en") {
  const t = MONTSERRAT_COPY[locale];
  const x = MONTSERRAT_21NOV[locale];
  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    callout("official", verifiedLine(locale, MONTSERRAT_VERIFIED), t.before),
    // 13 Nov 2026: the comparison the English queries ask for comes first.
    // 21 Nov 2026: it opens with the names searchers use (cogwheel, gondola, funicular).
    ...h2(t.chooseTitle, x.names, ...t.choose),
    table(t.compareCaption, t.compareHeaders, t.compareRows, t.compareNote),
    ...h3(t.bestTitle),
    table(t.bestCaption, t.bestHeaders, t.bestRows),
    ...h3(t.mixTitle, ...t.mix),
    ...h2(t.rackTitle, ...t.rack),
    table(t.rackCaption, t.rackHeaders, t.rackRows, t.rackNote),
    ...h2(t.aeriTitle, ...t.aeri),
    table(t.aeriCaption, t.aeriHeaders, t.aeriRows, t.aeriNote),
    ...h2(t.trainTitle, ...t.train),
    table(t.trainCaption, t.trainHeaders, t.trainRows, t.trainNote),
    ...h2(t.pricesTitle),
    table(t.pricesCaption, t.pricesHeaders, t.pricesRows, t.pricesNote),
    // 21 Nov 2026: "fgc montserrat ticket", "montserrat pass", "train and cable car tickets".
    ...h2(x.ticketsTitle, ...x.tickets),
    table(x.ticketsCaption, x.ticketsHeaders, x.ticketsRows, x.ticketsNote),
    ...h2(t.combosTitle, ...t.combos),
    ...h2(t.accessTitle, ...t.access),
    ...h2(t.hoursTitle),
    table(t.hoursCaption, t.hoursHeaders, t.hoursRows, t.hoursNote),
    // 21 Nov 2026: "santa cova funicular", "montserrat funicular closed".
    ...h2(x.funicTitle, ...x.funic),
    ...h2(x.whenTitle, ...x.when),
    ...h2(t.upTitle, t.upIntro),
    list(...t.up),
    ...h3(x.planTitle, x.planIntro),
    table(x.planCaption, x.planHeaders, x.planRows, x.planNote),
    ...paras(t.beyond),
    faq([...t.faq, ...x.faq]),
    ...paras(verifiedLine(locale, MONTSERRAT_VERIFIED)),
    ...b2Related(["girona", "figueres", "tarragona", "sitges", "cerdanya", "transport"], locale),
  ];
}

export const MONTSERRAT_FREE: B2Article = {
  key: "montserratFree",
  entryKey: "daytrip-montserrat-without-tour",
  categoryKey: "mountain",
  sources: MONTSERRAT_SOURCES,
  heroKey: "b2-montserrat-cremallera",
  secondaryKey: "b2-montserrat-monestir",
  secondaryAlt: {
    ca: "El monestir de Santa Maria de Montserrat sota les agulles de roca",
    es: "El monasterio de Santa Maria de Montserrat bajo las agujas de roca",
    en: "The monastery of Santa Maria de Montserrat beneath the rock pinnacles",
  },
  secondaryCaption: {
    ca: "El recinte del santuari és on arriben tant el cremallera com l'aeri.",
    es: "El recinto del santuario es adonde llegan tanto el cremallera como el Aeri.",
    en: "Both the rack railway and the cable car arrive at the sanctuary precinct.",
  },
  heroAlt: {
    ca: "Dos trens del cremallera de Montserrat a l'estació de Monistrol-Vila",
    es: "Dos trenes del cremallera de Montserrat en la estación de Monistrol-Vila",
    en: "Two Montserrat rack-railway trains at Monistrol-Vila station",
  },
  heroCaption: {
    ca: "Des de Monistrol-Vila, el cremallera puja al monestir en 13 minuts.",
    es: "Desde Monistrol-Vila, el cremallera sube al monasterio en 13 minutos.",
    en: "From Monistrol-Vila, the rack railway climbs to the monastery in 13 minutes.",
  },
  verifiedAt: MONTSERRAT_VERIFIED,
  publishedAt: "2026-09-29T11:40:00+02:00",
  editions: {
    ca: { path: MONTSERRAT_PATHS.ca, title: MONTSERRAT_COPY.ca.title, seoTitle: MONTSERRAT_COPY.ca.seoTitle, seoDescription: MONTSERRAT_COPY.ca.seoDescription, excerpt: MONTSERRAT_COPY.ca.excerpt, blocks: montserratBody("ca") },
    es: { path: MONTSERRAT_PATHS.es, title: MONTSERRAT_COPY.es.title, seoTitle: MONTSERRAT_COPY.es.seoTitle, seoDescription: MONTSERRAT_COPY.es.seoDescription, excerpt: MONTSERRAT_COPY.es.excerpt, blocks: montserratBody("es") },
    en: { path: MONTSERRAT_PATHS.en, title: MONTSERRAT_COPY.en.title, seoTitle: MONTSERRAT_COPY.en.seoTitle, seoDescription: MONTSERRAT_COPY.en.seoDescription, excerpt: MONTSERRAT_COPY.en.excerpt, blocks: montserratBody("en") },
  },
};

/* ========================================================================== */
/* 08 — Cerdanya without a car                                                */
/* ========================================================================== */

const CERDANYA_SOURCES = [
  {
    name: "Transports",
    url: "https://cerdanya.org/informacio-util/transports/",
    publisher: "Turisme Cerdanya",
  },
  {
    name: "R3: Modificació del servei entre L'Hospitalet de Llobregat i Puigcerdà",
    url: "https://rodalies.gencat.cat/ca/detalls/article/02_02_PAT_R3",
    publisher: "Rodalies de Catalunya",
  },
  {
    name: "R3: servei alternatiu per carretera entre la Garriga i Puigcerdà",
    url: "https://rodalies.gencat.cat/ca/detalls/article/08_12_Reforc_R3",
    publisher: "Rodalies de Catalunya",
  },
  {
    name: "R3: modificació del servei entre La Garriga i Figaró (16 de novembre - 14 de desembre de 2026)",
    url: "https://rodalies.gencat.cat/ca/detalls/article/11_11_R3_La-Garriga-Figaro",
    publisher: "Rodalies de Catalunya",
  },
  {
    name: "R3 La Garriga - Figaró: horaris de tren (full del 16/11/2026)",
    url: "https://rodalies.gencat.cat/web/.content/01_Actualitat/2026/11_11_R3_La-Garriga-Figaro/PAT_399-26-LA-GARRIGA-FIGARO.pdf",
    publisher: "Rodalies de Catalunya",
  },
  {
    name: "R3 La Garriga - Figaró: horaris de bus + tren (full del 16/11/2026)",
    url: "https://rodalies.gencat.cat/web/.content/01_Actualitat/2026/11_11_R3_La-Garriga-Figaro/PAT_399-26-LA-GARRIGA-FIGARO-BUS-I-TREN.pdf",
    publisher: "Rodalies de Catalunya",
  },
  { name: "Cercador d'horaris de Rodalies", url: "https://rodalies.gencat.cat/ca/horaris/", publisher: "Rodalies de Catalunya" },
  {
    name: "Bus urbà",
    url: "https://www.puigcerda.cat/ca/serveis/mobilitat/bus-urba/",
    publisher: "Ajuntament de Puigcerdà",
  },
  {
    name: "Bus Blanc — horaris 2025-2026",
    url: "https://cerdanya.org/wp-content/uploads/2026/02/Bus-Blanc-2026.pdf",
    publisher: "Turisme Cerdanya",
  },
  {
    name: "La Molina — informació pràctica i transport",
    url: "https://pirineu365.cat/lamolina/estacio/informacio-practica/",
    publisher: "FGC (PIRINEU365)",
  },
];

// R3 re-read on 25 Nov 2026 (curl, 01:06-01:20 UTC; fact pack in the scratch
// dir, not committed). Rodalies' notice 02_02_PAT_R3 (page date still
// 06.07.2026) now says "A partir del 16 de novembre: Degut als treballs que
// Adif realitzarà entre La Garriga i Figaró ... s'interromp la circulació en
// aquest tram", and its rail list reads "L'Hospitalet de Llobregat - Fabra i
// Puig / Montcada Bifurcació: línia R4" and "Sant Martí de Centelles -
// Puicerdà/La Tor de Querol: línia R3" (the Spanish page still prints "La
// Garriga-Puigcerdà"; the Catalan one and the sheet below are the newer).
// The sheet PAT_399-26 "LA GARRIGA - FIGARÓ" (16/11/2026): "De les 5.00 h del
// 16 de novembre fins les 7.00 h del 14 de desembre"; its R3 train rows start
// at Sant Martí de Centelles (6.56, 10.26, 13.26, 16.26 and 18.26 go through
// to Puigcerdà; Ripoll, Ribes, La Molina and Puigcerdà times are the ones the
// 6 July sheet printed for the same trains, ten minutes after La Garriga).
// The official planner (serveisgrs.rodalies.gencat.cat/api/timetables,
// Sant Martí de Centelles 77104 -> Puigcerdà 77309, 27 and 28 Nov and 15 Dec)
// gives the same five trains (06:56>09:21 10:26>12:53 13:26>15:53 16:26>18:53
// 18:26>20:51, 2 h 25 min to 2 h 27 min), single "REG" 8.95 EUR; down on 28
// Nov 05:53, 07:51, 10:22, 14:21, 17:20 arrive 08:24-19:54 (the sheet prints
// the departure from Sant Martí one minute later); La Garriga -> Puigcerdà
// returns "Dades no disponibles". The notice gives no service after 14 Dec.
// Poster "Servei alternatiu per carretera" (changed 16 Nov): "Servei d'enllaç
// amb Centelles" with stops "La Garriga - Figaró - St. Martí de Centelles -
// Centelles". Ski Tren: pirineu365.cat/lamolina/estacio/informacio-practica/,
// read 25 Nov, "SKI TREN LA MOLINA Adult/Jove 53,00 € Infantil 41,50 €",
// "Bitllet de tren d'anada i tornada des de les principals estacions de
// Rodalies de Catalunya (Línia R3 Renfe) fins a La Molina", no season label.
// Bus urbà prices re-read the same day (1,50 € and 9 €); cerdanya.org and the
// Bus Blanc PDF answered 403, so their text keeps saying what is known.
// Until 25 Nov the page said the 6 July timetable ran from La Garriga.
// REREAD_BY: the works end at 7.00 on 14 Dec; the notice says nothing about
// what follows, so the page must be re-read before then (tests/r3-works-25nov).
export const R3_FIGARO_WORKS = { from: "2026-11-16", to: "2026-12-14", rereadBy: "2026-12-11" } as const;
const CERDANYA_VERIFIED = "2026-11-25";

const CERDANYA_R3: Record<"ca" | "es" | "en", [title: string, body: string]> = {
  ca: [
    "L'R3, ara mateix",
    "Segons l'avís de Rodalies (llegit el 25 de novembre de 2026), l'R3 circula amb el 50 % dels trens que tenia abans del 20 de gener. Per obres d'Adif entre la Garriga i Figaró, **del 16 de novembre al 14 de desembre de 2026** no hi ha trens en aquest tram, i els trens cap a la Molina i Puigcerdà surten de **Sant Martí de Centelles**, no de la Garriga. De Barcelona fins allà hi ha autobusos de Rodalies, i entre l'Hospitalet i Fabra i Puig o Montcada Bifurcació hi ha l'R4. Des del 12 d'agost hi ha també autobusos complementaris entre la Garriga i Puigcerdà. L'avís no diu quin serà el servei després del 14 de desembre: mira els horaris a rodalies.gencat.cat abans de sortir.",
  ],
  es: [
    "La R3, ahora mismo",
    "Según el aviso de Rodalies (leído el 25 de noviembre de 2026), la R3 circula con el 50 % de los trenes que tenía antes del 20 de enero. Por obras de Adif entre La Garriga y Figaró, **del 16 de noviembre al 14 de diciembre de 2026** no hay trenes en ese tramo, y los trenes hacia La Molina y Puigcerdà salen de **Sant Martí de Centelles**, no de La Garriga. De Barcelona hasta allí hay autobuses de Rodalies, y entre L'Hospitalet y Fabra i Puig o Montcada Bifurcació está la R4. Desde el 12 de agosto hay también autobuses complementarios entre La Garriga y Puigcerdà. El aviso no dice cuál será el servicio después del 14 de diciembre: mira los horarios en rodalies.gencat.cat antes de salir.",
  ],
  en: [
    "The R3 right now",
    "According to Rodalies' notice (read on 25 November 2026), the R3 is running 50% of the trains it had before 20 January. Because of Adif works between La Garriga and Figaró, **from 16 November to 14 December 2026** no trains run on that stretch, and the trains to La Molina and Puigcerdà start at **Sant Martí de Centelles**, not La Garriga. Rodalies buses cover the way there from Barcelona, and the R4 runs from L'Hospitalet to Fabra i Puig or Montcada Bifurcació. Since 12 August there have also been complementary buses between La Garriga and Puigcerdà. The notice does not say what service follows after 14 December: check rodalies.gencat.cat before you go.",
  ],
};

/** Through trains only, from the Rodalies sheet "La Garriga - Figaró" (16 Nov - 14 Dec 2026). */
const CERDANYA_UP: string[][] = [
  ["6:56", "8:10", "8:29", "9:00", "9:21", "—"],
  ["10:26", "11:40", "12:01", "12:32", "12:54", "13:00"],
  ["13:26", "14:40", "14:59", "15:32", "15:54", "16:00"],
  ["16:26", "17:40", "17:59", "18:32", "18:54", "19:00"],
  ["18:26", "19:40", "19:59", "20:30", "20:51", "—"],
];

const CERDANYA_DOWN: string[][] = [
  ["—", "5:53", "6:17", "6:51", "7:12", "8:25"],
  ["—", "7:51", "8:15", "8:49", "9:11", "10:25"],
  ["—", "10:22", "10:46", "11:20", "11:41", "12:55"],
  ["14:14", "14:21", "14:45", "15:19", "15:41", "16:55"],
  ["17:13", "17:20", "17:44", "18:19", "18:41", "19:55"],
];

const CERDANYA_TT: Record<"ca" | "es" | "en", { up: [string, string[]]; down: [string, string[]]; note: string }> = {
  ca: {
    up: ["Trens R3 de pujada: Sant Martí de Centelles → Puigcerdà (cada dia)", ["Sant Martí de Centelles", "Ripoll", "Ribes de Freser", "La Molina", "Puigcerdà", "La Tor de Querol"]],
    down: ["Trens R3 de baixada: Puigcerdà → Sant Martí de Centelles (cada dia)", ["La Tor de Querol", "Puigcerdà", "La Molina", "Ribes de Freser", "Ripoll", "Sant Martí de Centelles"]],
    note: "Font: Rodalies, full «La Garriga - Figaró» del 16/11/2026, vigent de les 5.00 h del 16 de novembre fins a les 7.00 h del 14 de desembre de 2026. Només els trens que fan tot el recorregut; la resta acaba a Ripoll o a Ribes. Consultat el 25/11/2026 i contrastat amb el cercador d'horaris de Rodalies (27 i 28/11): comprova'l el dia que viatgis.",
  },
  es: {
    up: ["Trenes R3 de subida: Sant Martí de Centelles → Puigcerdà (todos los días)", ["Sant Martí de Centelles", "Ripoll", "Ribes de Freser", "La Molina", "Puigcerdà", "La Tor de Querol"]],
    down: ["Trenes R3 de bajada: Puigcerdà → Sant Martí de Centelles (todos los días)", ["La Tor de Querol", "Puigcerdà", "La Molina", "Ribes de Freser", "Ripoll", "Sant Martí de Centelles"]],
    note: "Fuente: Rodalies, hoja «La Garriga - Figaró» del 16/11/2026, vigente de las 5.00 h del 16 de noviembre hasta las 7.00 h del 14 de diciembre de 2026. Solo los trenes que hacen todo el recorrido; el resto termina en Ripoll o en Ribes. Consultado el 25/11/2026 y contrastado con el buscador de horarios de Rodalies (27 y 28/11): puede cambiar, compruébalo el día que viajes.",
  },
  en: {
    up: ["R3 trains up: Sant Martí de Centelles → Puigcerdà (daily)", ["Sant Martí de Centelles", "Ripoll", "Ribes de Freser", "La Molina", "Puigcerdà", "La Tor de Querol"]],
    down: ["R3 trains down: Puigcerdà → Sant Martí de Centelles (daily)", ["La Tor de Querol", "Puigcerdà", "La Molina", "Ribes de Freser", "Ripoll", "Sant Martí de Centelles"]],
    note: "Source: Rodalies, sheet \"La Garriga - Figaró\" of 16/11/2026, in force from 5.00 on 16 November to 7.00 on 14 December 2026. Only trains that run the whole way; the rest terminate at Ripoll or Ribes. Read on 25/11/2026 and cross-checked with the Rodalies journey planner (27 and 28/11): it can change, so confirm on the day you travel.",
  },
};

function cerdanyaTimetable(locale: "ca" | "es" | "en") {
  const t = CERDANYA_TT[locale];
  return [table(t.up[0], t.up[1], CERDANYA_UP, t.note), table(t.down[0], t.down[1], CERDANYA_DOWN, t.note)];
}

export const CERDANYA: B2Article = {
  key: "cerdanya",
  entryKey: "guide-cerdanya-without-car",
  categoryKey: "mountain",
  sources: CERDANYA_SOURCES,
  heroKey: "b2-cerdanya-puigcerda",
  secondaryKey: "b2-cerdanya-estany",
  secondaryAlt: {
    ca: "L'estany de Puigcerdà, a la Cerdanya",
    es: "El estanque de Puigcerdà, en la Cerdanya",
    en: "The lake at Puigcerdà, in Cerdanya",
  },
  secondaryCaption: {
    ca: "L'estany queda a pocs minuts a peu de l'estació, part de l'atractiu d'anar-hi sense cotxe.",
    es: "El estanque está a pocos minutos a pie de la estación, parte del atractivo de ir sin coche.",
    en: "The lake is a few minutes' walk from the station, which is part of the car-free appeal.",
  },
  heroAlt: {
    ca: "Vista de Puigcerdà, a la Cerdanya",
    es: "Vista de Puigcerdà, en la Cerdanya",
    en: "A view of Puigcerdà, in Cerdanya",
  },
  heroCaption: {
    ca: "Puigcerdà té estació de tren i servei urbà: és la base més pràctica sense cotxe.",
    es: "Puigcerdà tiene estación de tren y servicio urbano: es la base más práctica sin coche.",
    en: "Puigcerdà has a station and a local bus network, which makes it the practical car-free base.",
  },
  verifiedAt: CERDANYA_VERIFIED,
  publishedAt: "2026-09-29T11:50:00+02:00",
  editions: {
    ca: {
      path: "guies/cerdanya-sense-cotxe",
      title: "Cerdanya sense cotxe: horaris del tren R3 a Puigcerdà, busos i què és realista",
      seoTitle: "Cerdanya sense cotxe: horaris R3 a Puigcerdà i busos",
      seoDescription:
        "Cerdanya sense cotxe: horaris dels trens R3 directes a la Molina i Puigcerdà, el tram en autobús des de Barcelona mentre duren les obres, el bus urbà i el Bus Blanc.",
      excerpt:
        "Els trens R3 que arriben a Puigcerdà, com sortir de Barcelona mentre duren les obres, i què és realista sense cotxe.",
      blocks: [
        lead(
          "Sí, es pot anar a la Cerdanya sense cotxe: amb la línia **R3**, que puja per Vic i Ripoll fins a la Molina, Puigcerdà i la Tor de Querol. Mentre duren les obres no hi ha trens entre Barcelona i Sant Martí de Centelles (el tram es fa amb autobusos de Rodalies, almenys fins al 14 de desembre de 2026), i de Sant Martí de Centelles a Puigcerdà hi ha **cinc trens directes al dia en cada sentit**, amb un trajecte d'entre 2 h 25 min i 2 h 35 min. Un cop allà, Puigcerdà és la base més pràctica.",
        ),
        callout("warning", ...CERDANYA_R3.ca),
        ...h2("Horaris de l'R3 a la Molina i Puigcerdà"),
        ...cerdanyaTimetable("ca"),
        ...paras(
          "El bitllet senzill de Sant Martí de Centelles a Puigcerdà costa 8,95 € (cercador de Rodalies, 25 de novembre de 2026). La resta de trens de l'R3 acaben a Ripoll o a Ribes de Freser, i entre la Garriga i Puigcerdà també circulen els autobusos complementaris de Rodalies. També hi ha línies regulars d'autobús des de Barcelona, la Seu d'Urgell i Lleida (ALSA) i des de Girona per Olot i Ripoll (TEISA).",
        ),
        ...h2(
          "Puigcerdà és la base més fàcil",
          "Puigcerdà té estació de tren i un bus urbà de proximitat que funciona cada dia i fa un recorregut circular des de la plaça Barcelona per l'Hospital de Cerdanya, la plaça de l'Estació i el passeig Josep Pla. El bitllet senzill costa 1,50 € i l'abonament de 10 viatges, 9 €, a l'Oficina de Turisme.",
          "Per a una escapada sense vehicle, és més pràctic dormir en un nucli amb transport que intentar replicar una ruta de cotxe.",
        ),
        ...h2(
          "La Molina en tren",
          "La Molina té estació pròpia a l'R3, i des de l'estació un autobús intern puja fins al peu de pistes. El web de l'estació anuncia també el **Ski Tren**, que es compra a Renfe/Rodalies i inclou el tren d'anada i tornada des de les principals estacions de Rodalies, el bus intern i el forfet i l'assegurança d'un dia: 53 € adult o jove i 41,50 € infantil, segons el web de l'estació el 25 de novembre de 2026 (sense indicar temporada). El forfet es recull a l'atenció al client de la Molina, amb un suport PIRINEU365 de 2 €. Mentre duri el tall de l'R3 entre la Garriga i Figaró, el tram de Barcelona fins a Sant Martí de Centelles es fa en autobús.",
        ),
        ...h2(
          "Temporada de neu: el Bus Blanc",
          "El Consell Comarcal de la Cerdanya ofereix el **Bus Blanc** cap a la Molina i Masella, amb dues rutes: una per Llívia, Puigcerdà i Urtx, i l'altra per Martinet, Bellver i Alp. La temporada 2025-26 va començar el cap de setmana del 6 de desembre de 2025 i circulava tots els caps de setmana i festius escolars, excepte el dia de Nadal, a 2 €. El servei de la temporada 2026-2027 no estava publicat el 26 d'octubre de 2026: comprova-ho abans de comptar-hi.",
          `Per triar estació, mira ${b2link("ski", "ca", "les estacions d'esquí de Catalunya")}.`,
        ),
        callout(
          "warning",
          "Què no et prometrem",
          "No direm que «tota la Cerdanya es pot visitar fàcilment sense cotxe». Molts pobles, rutes i espais naturals hi tenen connexions limitades. La utilitat d'aquesta guia és precisament explicar què sí és realista.",
        ),
        ...paras(
          `Si vols més escapades ferroviàries, mira ${link("trains", "ca", "dotze escapades en tren")}, i si el destí és el Pirineu oriental, ${b2link("ripolles", "ca", "la guia del Ripollès")}.`,
        ),
        ...h2(
          "Núria, a la mateixa línia",
          "L'R3 que puja a la Cerdanya para també a **Ribes de Freser**, on enllaça amb el cremallera de la Vall de Núria. És de les poques escapades d'alta muntanya que es poden fer de punta a punta sense cotxe: a Núria no s'hi pot pujar per carretera.",
          "Combinar la Cerdanya i Núria en un mateix viatge és possible perquè comparteixen línia; només cal mirar els horaris de tots dos trens el dia que hi vagis.",
        ),
        faq([
          { question: "Quants trens hi ha de Sant Martí de Centelles a Puigcerdà?", answer: "Cinc trens directes al dia en cada sentit, també els caps de setmana, segons l'horari de Rodalies vigent del 16 de novembre al 14 de desembre de 2026. La resta de trens de l'R3 acaben a Ripoll o a Ribes de Freser." },
          { question: "Es pot anar en tren de Barcelona a Puigcerdà?", answer: "No directament mentre duren les obres: de Barcelona a Sant Martí de Centelles hi ha autobusos de Rodalies, i de Sant Martí de Centelles a Puigcerdà, el tren R3. Fins ara els trens sortien de la Garriga; des del 16 de novembre i fins al 14 de desembre de 2026, de Sant Martí de Centelles." },
          { question: "Quant dura el trajecte de Sant Martí de Centelles a Puigcerdà?", answer: "Entre 2 h 25 min i 2 h 35 min, segons el tren i el sentit." },
          { question: "Hi ha bus a les pistes des de Puigcerdà?", answer: "La temporada 2025-26, el Bus Blanc va unir la Cerdanya amb la Molina i Masella els caps de setmana i festius escolars, a 2 €. El de 2026-27 no estava publicat el 26 d'octubre de 2026." },
        ]),
        ...paras(verifiedLine("ca", CERDANYA_VERIFIED)),
        ...b2Related(["nuria", "ski", "andorra", "ripolles", "snow", "girona"], "ca"),
      ],
    },

    es: {
      path: "guias/cerdana-sin-coche",
      title: "Cerdanya sin coche: horarios del tren R3 a Puigcerdà, autobuses y qué es realista",
      seoTitle: "Cerdanya sin coche: horarios del tren R3 a Puigcerdà",
      seoDescription:
        "Cerdanya sin coche: horarios de los trenes R3 a La Molina y Puigcerdà, el tramo en autobús desde Barcelona durante las obras, el bus urbano y el Bus Blanc.",
      excerpt:
        "Los trenes R3 que llegan a Puigcerdà, cómo salir de Barcelona mientras duran las obras y qué es realista sin coche.",
      blocks: [
        lead(
          "Sí, se puede ir a la Cerdanya sin coche: con la línea **R3**, que sube por Vic y Ripoll hasta La Molina, Puigcerdà y La Tor de Querol. Mientras duran las obras no hay trenes entre Barcelona y Sant Martí de Centelles (el tramo se hace en autobuses de Rodalies, al menos hasta el 14 de diciembre de 2026), y de Sant Martí de Centelles a Puigcerdà hay **cinco trenes directos al día en cada sentido**, con un trayecto de entre 2 h 25 min y 2 h 35 min. Una vez allí, Puigcerdà es la base más práctica.",
        ),
        callout("warning", ...CERDANYA_R3.es),
        ...h2("Horarios de la R3 a La Molina y Puigcerdà"),
        ...cerdanyaTimetable("es"),
        ...paras(
          "El billete sencillo de Sant Martí de Centelles a Puigcerdà cuesta 8,95 € (buscador de Rodalies, 25 de noviembre de 2026). El resto de trenes de la R3 terminan en Ripoll o en Ribes de Freser, y entre La Garriga y Puigcerdà también circulan los autobuses complementarios de Rodalies. Hay además líneas regulares de autobús desde Barcelona, La Seu d'Urgell y Lleida (ALSA) y desde Girona por Olot y Ripoll (TEISA).",
        ),
        ...h2(
          "Puigcerdà, la base más sencilla",
          "Puigcerdà tiene estación de tren y un bus urbano de proximidad que funciona todos los días y hace un recorrido circular desde la plaza Barcelona por el Hospital de Cerdanya, la plaza de la Estación y el paseo Josep Pla. El billete sencillo cuesta 1,50 € y el abono de 10 viajes, 9 €, en la Oficina de Turismo.",
          "Es más realista dormir en un núcleo con transporte que intentar replicar una ruta pensada para coche.",
        ),
        ...h2(
          "La Molina en tren",
          "La Molina tiene estación propia en la R3, y desde la estación un autobús interno sube hasta el pie de pistas. La web de la estación anuncia también el **Ski Tren**, que se compra en Renfe/Rodalies e incluye el tren de ida y vuelta desde las principales estaciones de Rodalies, el bus interno y el forfait y el seguro de un día: 53 € adulto o joven y 41,50 € infantil, según la web de la estación el 25 de noviembre de 2026 (sin indicar temporada). El forfait se recoge en la atención al cliente de La Molina, con un soporte PIRINEU365 de 2 €. Mientras dure el corte de la R3 entre La Garriga y Figaró, el tramo de Barcelona hasta Sant Martí de Centelles se hace en autobús.",
        ),
        ...h2(
          "Temporada de nieve: el Bus Blanc",
          "El Consell Comarcal de la Cerdanya ofrece el **Bus Blanc** hacia La Molina y Masella, con dos rutas: una por Llívia, Puigcerdà y Urtx, y otra por Martinet, Bellver y Alp. La temporada 2025-26 empezó el fin de semana del 6 de diciembre de 2025 y circulaba todos los fines de semana y festivos escolares, salvo el día de Navidad, a 2 €. El servicio de la temporada 2026-2027 no estaba publicado el 26 de octubre de 2026: compruébalo antes de contar con él.",
          `Para elegir estación, mira ${b2link("ski", "es", "las estaciones de esquí de Cataluña")}.`,
        ),
        callout(
          "warning",
          "Lo que no prometemos",
          "No presentamos toda la comarca como fácilmente accesible sin coche. Muchos pueblos y espacios naturales tienen conexiones limitadas.",
        ),
        ...paras(
          `Más escapadas ferroviarias: ${link("trains", "es", "doce escapadas en tren")}. Y si vas al Pirineo oriental, ${b2link("ripolles", "es", "la guía del Ripollès")}.`,
        ),
        ...h2(
          "Núria, en la misma línea",
          "La R3 que sube a la Cerdanya para también en **Ribes de Freser**, donde enlaza con el cremallera de la Vall de Núria. Es una de las pocas escapadas de alta montaña que se pueden hacer de punta a punta sin coche: a Núria no se puede subir por carretera.",
          "Combinar la Cerdanya y Núria en un mismo viaje es posible porque comparten línea; solo hay que mirar los horarios de los dos trenes el día que vayas.",
        ),
        faq([
          { question: "¿Cuántos trenes hay de Sant Martí de Centelles a Puigcerdà?", answer: "Cinco trenes directos al día en cada sentido, también los fines de semana, según el horario de Rodalies vigente del 16 de noviembre al 14 de diciembre de 2026. El resto de trenes de la R3 terminan en Ripoll o en Ribes de Freser." },
          { question: "¿Se puede ir en tren de Barcelona a Puigcerdà?", answer: "No directamente mientras duran las obras: de Barcelona a Sant Martí de Centelles hay autobuses de Rodalies, y de Sant Martí de Centelles a Puigcerdà, el tren R3. Hasta ahora los trenes salían de La Garriga; desde el 16 de noviembre y hasta el 14 de diciembre de 2026, de Sant Martí de Centelles." },
          { question: "¿Cuánto dura el trayecto de Sant Martí de Centelles a Puigcerdà?", answer: "Entre 2 h 25 min y 2 h 35 min, según el tren y el sentido." },
          { question: "¿Hay autobús a las pistas desde Puigcerdà?", answer: "En la temporada 2025-26, el Bus Blanc unió la Cerdanya con La Molina y Masella los fines de semana y festivos escolares, a 2 €. El de 2026-27 no estaba publicado el 26 de octubre de 2026." },
        ]),
        ...paras(verifiedLine("es", CERDANYA_VERIFIED)),
        ...b2Related(["nuria", "ski", "andorra", "ripolles", "snow", "girona"], "es"),
      ],
    },

    en: {
      path: "guides/cerdanya-without-a-car",
      title: "Cerdanya without a car: R3 train times to Puigcerdà, buses and what is realistic",
      seoTitle: "Cerdanya without a car: R3 train times to Puigcerdà",
      seoDescription:
        "Cerdanya without a car: times of the through R3 trains to La Molina and Puigcerdà, the bus link from Barcelona while the works last, the town bus and the Bus Blanc.",
      excerpt:
        "The R3 trains that reach Puigcerdà, how to leave Barcelona while the works last, and what is realistic without a car.",
      blocks: [
        lead(
          "Yes, you can reach Cerdanya without a car: on Rodalies line **R3**, which climbs via Vic and Ripoll to La Molina, Puigcerdà and La Tor de Querol. While the works last there are no trains between Barcelona and Sant Martí de Centelles (that stretch is by Rodalies bus, at least until 14 December 2026), and **five through trains a day each way** run between Sant Martí de Centelles and Puigcerdà, taking between 2 h 25 min and 2 h 35 min. Once there, Puigcerdà is the practical base.",
        ),
        callout("warning", ...CERDANYA_R3.en),
        ...h2("R3 train times to La Molina and Puigcerdà"),
        ...cerdanyaTimetable("en"),
        ...paras(
          "A single from Sant Martí de Centelles to Puigcerdà costs €8.95 (Rodalies journey planner, 25 November 2026). Other R3 trains terminate at Ripoll or Ribes de Freser, and Rodalies also runs complementary buses between La Garriga and Puigcerdà. Regular coaches link the area with Barcelona, La Seu d'Urgell and Lleida (ALSA) and with Girona via Olot and Ripoll (TEISA).",
        ),
        ...h2(
          "Puigcerdà is the practical base",
          "Puigcerdà has a railway station and a small town bus that runs every day on a loop from Plaça Barcelona via the Cerdanya hospital, the station square and Passeig Josep Pla. A single ticket is €1.50 and a 10-trip pass €9, sold at the tourist office.",
          "Sleeping somewhere with transport beats trying to reproduce a driving itinerary.",
        ),
        ...h2(
          "La Molina by train",
          "La Molina has its own R3 station, and a resort shuttle bus runs from the station up to the slopes. The resort's website also lists the **Ski Tren**, sold by Renfe/Rodalies, which bundles the return train from the main Rodalies stations, the shuttle and a one-day lift pass with insurance: €53 adult or youth and €41.50 child, on the station's website on 25 November 2026 (no season stated). The pass is collected at La Molina customer service, with a €2 PIRINEU365 card. While the R3 is cut between La Garriga and Figaró, the stretch from Barcelona to Sant Martí de Centelles is by bus.",
        ),
        ...h2(
          "Snow season: the Bus Blanc",
          "The Cerdanya county council runs the **Bus Blanc** to La Molina and Masella on two routes: one via Llívia, Puigcerdà and Urtx, the other via Martinet, Bellver and Alp. In 2025-26 it started on the weekend of 6 December 2025 and ran every weekend and school holiday except Christmas Day, for €2. The 2026-27 service had not been published on 26 October 2026, so check before relying on it.",
          `To pick a resort, see ${b2link("ski", "en", "Catalonia's ski resorts compared")}.`,
        ),
        callout(
          "warning",
          "What this guide will not claim",
          "The value here is honesty: some villages and mountain areas remain difficult without private transport. We will not pretend the whole comarca is easy car-free.",
        ),
        ...paras(
          `More rail trips: ${link("trains", "en", "twelve day trips by train")}. Heading further east? ${b2link("ripolles", "en", "the Ripollès guide")}.`,
        ),
        ...h2(
          "Núria, on the same line",
          "The R3 that runs up to Cerdanya also stops at **Ribes de Freser**, where it connects with the Vall de Núria rack railway. It is one of the few high-mountain trips you can do end to end without a car: there is no road up to Núria.",
          "Combining Cerdanya and Núria on one trip works because they share the line; just check both timetables for the day you travel.",
        ),
        faq([
          { question: "How many trains run from Sant Martí de Centelles to Puigcerdà?", answer: "Five through trains a day each way, weekends included, on the Rodalies timetable in force from 16 November to 14 December 2026. Other R3 trains terminate at Ripoll or Ribes de Freser." },
          { question: "Can you take the train from Barcelona to Puigcerdà?", answer: "Not directly while the works last: Rodalies buses run from Barcelona to Sant Martí de Centelles, and the R3 train from Sant Martí de Centelles to Puigcerdà. Until now the trains started at La Garriga; from 16 November to 14 December 2026 they start at Sant Martí de Centelles." },
          { question: "How long is the R3 from Sant Martí de Centelles to Puigcerdà?", answer: "Between 2 h 25 min and 2 h 35 min, depending on the train and direction." },
          { question: "Is there a bus to the slopes from Puigcerdà?", answer: "In 2025-26 the Bus Blanc linked Cerdanya with La Molina and Masella at weekends and in school holidays, for €2. The 2026-27 service had not been published on 26 October 2026." },
        ]),
        ...paras(verifiedLine("en", CERDANYA_VERIFIED)),
        ...b2Related(["nuria", "ski", "andorra", "ripolles", "snow", "girona"], "en"),
      ],
    },
  },
};
