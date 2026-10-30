import type { Block } from "@/lib/content/blocks";
import { link } from "@/lib/content/features/shared";
import { SOURCES as TMB_SOURCES, TICKETS, VERIFIED_AT } from "@/lib/content/transport-cards/rates";
import { fuelPath } from "@/lib/programmatic/fuel/paths";
import { hubPath as rodaliesHub } from "@/lib/programmatic/rodalies/paths";

import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  keyFacts,
  lead,
  list,
  paras,
  steps,
  table,
  verifiedLine,
  type B2Article,
} from "./shared";

/**
 * The Barcelona Practical cluster: transport passes, the low-emission zone and
 * street parking.
 *
 * These three answer the questions a visitor asks in the order they hit them —
 * how do I get around, may I drive in, where do I leave the car — and they
 * cross-link to each other and to the tourist tax guide, because a reader who
 * has one of these questions usually has the next one too.
 *
 * Every figure here was checked against the operator's own page on 29
 * September 2026. Where the editorial package and the source disagreed, the
 * source won and the deviation is noted in the comment above the figure.
 */

/* ========================================================================== */
/* 01 — Transport passes                                                      */
/* ========================================================================== */

/**
 * "How many days?" table, computed from the fare table so it cannot drift
 * from the selector. GSC (20 Sep-17 Oct 2026): the EN page has 1.4k
 * impressions at position 7.6, mostly "3 days" / "3 tage" / "4 giorni" style
 * queries, and the page never said what a given number of days costs.
 */
function fareFor(key: string, days?: number): number {
  const ticket = TICKETS.find((t) => t.key === key);
  const fare = ticket?.fares.find((f) => f.zone === "1" && (days === undefined || f.days === days));
  if (!fare) throw new Error(`no zone-1 fare for ${key}${days ? ` (${days} days)` : ""}`);
  return fare.price;
}

function euros(value: number, locale: "ca" | "es" | "en"): string {
  const fixed = value.toFixed(2);
  return locale === "en" ? `€${fixed}` : `${fixed.replace(".", ",")} €`;
}

const DAYS_COPY = {
  ca: {
    title: "Quant costa per dies",
    caption: "Hola Barcelona o una T-dia per dia, zona 1, preus del 2026",
    headers: ["Dies", "Hola Barcelona", "Per dia", "Una T-dia cada dia"],
    day: (n: number) => (n === 1 ? "1 dia (24 h)" : `${n} dies (${n * 24} h)`),
    note: "Preus complets de TMB; en línia, la Hola Barcelona té un 10 % de descompte.",
    text: (casual: string) =>
      `Per a dos dies o més, si en total faràs deu trajectes o menys, una **T-casual (${casual})** surt més barata que qualsevol de les dues, però no val a les estacions de metro de l'aeroport.`,
  },
  es: {
    title: "Cuánto cuesta por días",
    caption: "Hola Barcelona o una T-dia por día, zona 1, precios de 2026",
    headers: ["Días", "Hola Barcelona", "Por día", "Una T-dia cada día"],
    day: (n: number) => (n === 1 ? "1 día (24 h)" : `${n} días (${n * 24} h)`),
    note: "Precios completos de TMB; en línea, la Hola Barcelona tiene un 10 % de descuento.",
    text: (casual: string) =>
      `Para dos días o más, si en total harás diez trayectos o menos, una **T-casual (${casual})** sale más barata que cualquiera de las dos, pero no vale en las estaciones de metro del aeropuerto.`,
  },
  en: {
    title: "Transport pass for 1, 2, 3, 4 or 5 days: what it costs",
    caption: "Hola Barcelona or one T-dia a day, zone 1, 2026 prices",
    headers: ["Days", "Hola Barcelona", "Per day", "One T-dia each day"],
    day: (n: number) => (n === 1 ? "1 day (24 h)" : `${n} days (${n * 24} h)`),
    note: "Full TMB prices; Hola Barcelona is 10% cheaper bought online.",
    text: (casual: string) =>
      `For two days or more, if you will make ten journeys or fewer in total, a **T-casual (${casual})** costs less than either, but it is not valid at the airport metro stations.`,
  },
} as const;

function daysBlocks(locale: "ca" | "es" | "en"): Block[] {
  const t = DAYS_COPY[locale];
  const tDia = fareFor("t-dia");
  const rows = [1, 2, 3, 4, 5].map((n) => {
    const hola = fareFor("hola-barcelona", n);
    return [t.day(n), euros(hola, locale), euros(hola / n, locale), euros(tDia * n, locale)];
  });
  return [
    ...h2(t.title),
    table(t.caption, [...t.headers], rows, t.note),
    ...paras(t.text(euros(fareFor("t-casual"), locale))),
  ];
}

const PROFILE_HEADERS: Record<string, string[]> = {
  ca: ["Perfil", "Miraria primer"],
  es: ["Perfil", "Miraría primero"],
  en: ["Profile", "Look at first"],
};

// Fares for zones 1-7 (single ticket, T-casual, T-dia, T-usual): TMB's 2026
// fare table, "Prices in force from 15 January 2026", read 28 Oct 2026
// (https://www.tmb.cat/en/barcelona-fares-metro-bus/transport-ticket-fares).
// ATM's T-casual page shows the same T-casual row (and the 2025 fares lower
// down, which are not used). Only zone 1 is in TICKETS, which drives the
// calculator. T-familiar and T-grup from the same TMB table and ATM's pages.
// ATM had announced no 2027 fares on 28 Oct 2026. Re-read 30 Oct 2026 on the
// same TMB table: every zone, T-familiar, T-grup and the €5.90 airport ticket
// unchanged; still no 2027 fares.
const ZONE_FARES: string[][] = [
  ["1", "2,90 €", "13,00 €", "12,00 €", "22,80 €"],
  ["2", "4,15 €", "25,50 €", "18,30 €", "30,55 €"],
  ["3", "5,40 €", "34,70 €", "22,95 €", "42,70 €"],
  ["4", "6,90 €", "44,65 €", "25,65 €", "52,15 €"],
  ["5", "8,80 €", "51,20 €", "28,70 €", "59,60 €"],
  ["6", "10,25 €", "54,45 €", "32,10 €", "63,85 €"],
  ["7", "11,60 €", "57,60 €", "34,70 €", "67,65 €"],
];

/** The zone table with English money formatting: "2,90 €" -> "€2.90". */
const ZONE_FARES_EN: string[][] = ZONE_FARES.map(([zone, ...cells]) => [
  zone ?? "",
  ...cells.map((cell) => `€${cell.replace(" €", "").replace(",", ".")}`),
]);

/** TMB's airport ticket: one metro journey including Aeroport T1 and T2 (re-read 30 Oct 2026). */
const AIRPORT_TICKET = 5.9;

const VS_COPY = {
  ca: {
    title: "Hola Barcelona o T-casual?",
    text: (casual: string, hola2: string, hola3: string, airport: string, casualAirport: string, usual: string) =>
      `Si els teus deu viatges o menys es reparteixen en dos dies o més i no fas servir el metro de l'aeroport, la **T-casual (${casual})** és més barata que qualsevol Hola Barcelona de 48 hores o més (des de ${hola2}). L'aeroport canvia el compte: amb la T-casual hauries de pagar a part el bitllet aeroport (${airport} per trajecte), així que deu viatges més l'anada i tornada a l'aeroport surten per **${casualAirport}**, més que una Hola de 48 h (${hola2}) i menys que una de 72 h (${hola3}). Per a tres dies o més amb aeroport, compara també la T-usual (${usual}, 30 dies, aeroport inclòs).`,
  },
  es: {
    title: "¿Hola Barcelona o T-casual?",
    text: (casual: string, hola2: string, hola3: string, airport: string, casualAirport: string, usual: string) =>
      `Si tus diez viajes o menos se reparten en dos días o más y no usas el metro del aeropuerto, la **T-casual (${casual})** es más barata que cualquier Hola Barcelona de 48 horas o más (desde ${hola2}). El aeropuerto cambia la cuenta: con la T-casual tendrías que pagar aparte el billete aeropuerto (${airport} por trayecto), así que diez viajes más la ida y vuelta al aeropuerto salen por **${casualAirport}**, más que una Hola de 48 h (${hola2}) y menos que una de 72 h (${hola3}). Para tres días o más con aeropuerto, compara también la T-usual (${usual}, 30 días, aeropuerto incluido).`,
  },
  en: {
    title: "Hola Barcelona or T-casual?",
    text: (casual: string, hola2: string, hola3: string, airport: string, casualAirport: string, usual: string) =>
      `If your ten journeys or fewer are spread over two days or more and you do not use the airport metro, the **T-casual (${casual})** is cheaper than any Hola Barcelona card of 48 hours or more (from ${hola2}). The airport changes the sum: with a T-casual you pay the airport ticket on top (${airport} per journey), so ten journeys plus the airport metro there and back come to **${casualAirport}**, more than a 48-hour Hola (${hola2}) and less than a 72-hour one (${hola3}). For three days or more with the airport, also compare the T-usual (${usual}, 30 days, airport included).`,
  },
} as const;

function versusBlocks(locale: "ca" | "es" | "en"): Block[] {
  const t = VS_COPY[locale];
  const casual = fareFor("t-casual");
  return h2(
    t.title,
    t.text(
      euros(casual, locale),
      euros(fareFor("hola-barcelona", 2), locale),
      euros(fareFor("hola-barcelona", 3), locale),
      euros(AIRPORT_TICKET, locale),
      euros(casual + 2 * AIRPORT_TICKET, locale),
      euros(fareFor("t-usual"), locale),
    ),
  );
}

export const TRANSPORT: B2Article = {
  key: "transport",
  entryKey: "guide-barcelona-transport-passes",
  categoryKey: "public-services",
  sources: [
    ...TMB_SOURCES,
    { name: "T-casual", url: "https://www.atm.cat/en/titols-tarifes/titols-i-tarifes/t-casual", publisher: "Autoritat del Transport Metropolità" },
    { name: "Mapa de zones tarifàries", url: "https://www.tmb.cat/ca/tarifes-metro-bus-barcelona/mapa-zones", publisher: "TMB" },
    { name: "2026 transport ticket fares (in force from 15 January 2026)", url: "https://www.tmb.cat/en/barcelona-fares-metro-bus/transport-ticket-fares", publisher: "TMB" },
    { name: "T-familiar", url: "https://www.atm.cat/en/titols-tarifes/titols-i-tarifes/t-familiar", publisher: "Autoritat del Transport Metropolità" },
    { name: "T-grup", url: "https://www.atm.cat/en/titols-tarifes/titols-i-tarifes/t-grup", publisher: "Autoritat del Transport Metropolità" },
    { name: "Hola Barcelona Travel Card — conditions", url: "https://www.holabarcelona.com/en/tickets/hola-bcn-barcelona-travel-card", publisher: "Transports Metropolitans de Barcelona" },
  ],
  heroKey: "b2-transport-metro-barcelona",
  secondaryKey: "b2-transport-tram-barcelona",
  secondaryAlt: {
    ca: "Un tramvia del Trambaix circulant per Barcelona",
    es: "Un tranvía del Trambaix circulando por Barcelona",
    en: "A Trambaix tram running through Barcelona",
  },
  secondaryCaption: {
    ca: "El tramvia entra a la zona 1: tots els títols comparats aquí hi valen.",
    es: "El tranvía entra en la zona 1: todos los títulos comparados aquí sirven.",
    en: "The tram is inside zone 1, so every pass compared here covers it.",
  },
  heroAlt: {
    ca: "Andana de l'estació de metro d'Espanya, a la línia 3 de Barcelona",
    es: "Andén de la estación de metro de Espanya, en la línea 3 de Barcelona",
    en: "Platform at Espanya metro station on Barcelona's line 3",
  },
  heroCaption: {
    ca: "Els títols de transport valen per a metro, bus i tramvia; la diferència és quants viatges i quants dies.",
    es: "Los títulos valen para metro, bus y tranvía; la diferencia está en cuántos viajes y cuántos días.",
    en: "The passes cover metro, bus and tram; the difference is how many journeys and how many days.",
  },
  verifiedAt: VERIFIED_AT,
  publishedAt: "2026-09-29T11:00:00+02:00",
  editions: {
    ca: {
      path: "guies/targetes-transport-barcelona",
      title:
        "Targetes de transport de Barcelona 2026: preu de la T-casual per zones, T-dia, T-usual i Hola Barcelona",
      seoTitle: "Preus targetes TMB 2026: T-casual per zones, T-dia i T-usual",
      seoDescription:
        "T-casual: 13 € (1 zona), 25,50 € (2) i 34,70 € (3). Preus del 2026 de totes les targetes per zones, on no valen i si surt més a compte la Hola Barcelona.",
      excerpt:
        "La targeta pensada per a turistes no sempre és la més barata. Compara els títols segons els dies, els trajectes i l'aeroport.",
      blocks: [
        lead(
          "La T-casual costa **13 €** en una zona, **25,50 €** en dues i **34,70 €** en tres (preus del 2026, vigents des del 15 de gener) i dona deu viatges integrats en metro, bus, tramvia i tren: és la targeta de 10 viatges de Barcelona. No val a les estacions Aeroport T1 i T2 de l'L9 Sud, i la targeta per a turistes, la Hola Barcelona, **no sempre és la més barata**.",
        ),
        ...paras("El 2026, la T-dia d'una zona costa 12 €, la T-usual 22,80 € i el bitllet senzill 2,90 €. La Hola Barcelona ofereix viatges il·limitats durant períodes consecutius d'entre 24 i 120 hores."),
        callout(
          "info",
          "Resposta ràpida",
          "Si faràs pocs trajectes, compara primer la T-casual. Si vols viatges il·limitats durant 24 hores, la T-dia és especialment interessant. Per a estades llargues, la T-usual pot tenir molt sentit. La Hola Barcelona prioritza la simplicitat i inclou el metro de l'aeroport.",
        ),
        { type: "transportPasses" } as Block,
        ...h2(
          "Preu de la T-casual i de la resta de targetes per zones (2026)",
          "La T-casual val per a **deu viatges integrats** en tots els modes de transport. Costa **13 €** en una zona, **25,50 €** en dues i **34,70 €** en tres: 1,30 € per viatge en una zona, davant dels 2,90 € del bitllet senzill.",
        ),
        table("Preus de TMB per zones, 2026", ["Zones", "Bitllet senzill", "T-casual (10 viatges)", "T-dia (24 h)", "T-usual (30 dies)"], ZONE_FARES, "Font: TMB, preus vigents des del 15 de gener de 2026; la T-usual porta el 50 % de descompte del Reial decret llei 17/2025. Barcelona i el Prat de Llobregat són a la zona 1."),
        ...paras(
          "Aquests preus valen fins al pròxim canvi de tarifes de l'ATM; a 30 d'octubre de 2026 encara no s'han anunciat els del 2027.",
          "**Quantes zones necessites?** Compta el sector tarifari d'on surts i el d'arribada: per anar de Barcelona (zona 1) a Sabadell (zona 2C) cal un títol de 2 zones, segons TMB. Badalona i Montgat són a la zona 1; el Masnou (amb Ocata) i Premià de Mar, a la zona 2. Cada viatge permet fins a 3 transbordaments en 75 minuts en una zona, 15 minuts més per cada zona addicional. La T-casual en targeta de cartró T-mobilitat costa 1 € més.",
        ),
        ...h2(
          "T-casual: la targeta de 10 viatges",
          "La T-casual costa **13 € per una zona** i permet deu viatges. Es carrega en una T-mobilitat: targeta personalitzada, mòbil amb NFC o targeta anònima.",
          "No és nominativa, però només la pot fer servir una persona alhora, i no és vàlida per entrar o sortir per les estacions Aeroport T1 i Aeroport T2 de l'L9 Sud.",
          "Això no vol dir que «no serveixi per anar a l'aeroport» en qualsevol circumstància: la restricció concreta afecta les estacions del metro L9 Sud.",
          "És una opció lògica per a qui camina molt i utilitza poc el transport.",
        ),
        ...h2(
          "T-dia: 24 hores il·limitades",
          "La T-dia costa **12 € per una zona**.",
          "Permet viatges il·limitats durant 24 hores des de la primera validació i permet un trajecte d'anada i un de tornada a través de les estacions Aeroport T1 i T2 de l'L9 Sud.",
          "Per a un dia intens de visites pot resultar més interessant que comprar trajectes individualment.",
        ),
        ...h2(
          "T-usual: l'opció que molts visitants ignoren",
          "La T-usual costa **22,80 € per una zona** amb les tarifes vigents de 2026.",
          "Ofereix viatges il·limitats durant 30 dies consecutius, és personal i intransferible i és vàlida a les estacions Aeroport T1 i T2.",
          "Pot ser interessant per a estades llargues, però cal portar el document d'identificació corresponent.",
        ),
        ...h2(
          "Si viatgeu diverses persones: T-familiar i T-grup",
          "La **T-familiar** (11,50 € en una zona) dona 8 viatges en 30 dies i, a diferència de la T-casual, la poden compartir diverses persones per fer el mateix trajecte. La **T-grup** (91 € en una zona) dona 70 viatges en 30 dies, també per a diverses persones alhora. Cap de les dues no val a les estacions Aeroport T1 i T2 de l'L9 Sud.",
        ),
        ...h2(
          "Hola Barcelona",
          "Hola Barcelona ofereix viatges il·limitats durant 24, 48, 72, 96 o 120 hores consecutives.",
          "Inclou metro i bus de TMB, NitBus, FGC zona 1, tramvia, Rodalies zona 1 i el funicular de Montjuïc. També inclou l'anada i tornada en metro entre l'aeroport i Barcelona. El Telefèric de Montjuïc no hi està inclòs.",
          "És especialment útil per a qui prefereix no comptar trajectes.",
        ),
        // Fares from TMB's own Hola Barcelona site, checked 12 Oct 2026.
        callout(
          "official",
          "Preu de la Hola Barcelona",
          `Al web de TMB (holabarcelona.com), a preu complet: 12,50 € (24 h), 18,70 € (48 h), 27,30 € (72 h), 35,60 € (96 h) i 43,60 € (120 h), comprovats el 12 d'octubre de 2026; TMB anuncia un 10 % de descompte en línia. És personal, i les targetes que no s'han validat caduquen el 28 de febrer de l'any següent a la compra. Si dubtes entre aquesta i la Barcelona Card, mira ${b2link("cards", "ca", "quina surt a compte")}.`,
        ),
        ...daysBlocks("ca"),
        ...versusBlocks("ca"),
        ...h2("Quina triaria segons el viatge?"),
        table(
          "Per on començar a mirar segons el tipus de viatge",
          PROFILE_HEADERS.ca ?? [],
          [
            ["Pocs trajectes", "T-casual"],
            ["1 dia molt intens", "T-dia"],
            ["Estada llarga", "T-usual"],
            ["Vols il·limitats i aeroport", "Hola Barcelona"],
          ],
          "Aquesta taula no és un rànquing: el resultat depèn dels trajectes, les zones i l'aeroport.",
        ),
        faq([
          { question: "Quant costa la T-casual el 2026?", answer: "13 € en 1 zona, 25,50 € en 2 zones i 34,70 € en 3 zones, per deu viatges. Són els preus vigents des del 15 de gener de 2026." },
          { question: "Quina és la targeta de 10 viatges de Barcelona?", answer: "La T-casual: deu viatges integrats en metro, bus, tramvia, FGC i Rodalies, per a una sola persona alhora. En una zona costa 13 €, 1,30 € per viatge." },
          { question: "La T-casual val per al metro de l'aeroport?", answer: "No: no val per entrar ni sortir per les estacions Aeroport T1 i T2 de l'L9 Sud. En aquestes estacions necessites el bitllet aeroport (5,90 €), la T-dia, la T-usual o la Hola Barcelona." },
          { question: "Quina zona és Ocata?", answer: "Ocata és al Masnou, que TMB situa a la zona 2 (sector E). Des de Barcelona hi necessites un títol de 2 zones." },
          { question: "Poden fer servir la mateixa T-casual dues persones?", answer: "No alhora: no és nominativa, però només la pot fer servir una persona a cada viatge. Per compartir, la T-familiar (8 viatges, 11,50 € en una zona) o la T-grup." },
        ]),
        ...paras(
          `Per saber fins a quina hora pots fer servir la targeta cada nit, mira ${b2link("hours", "ca", "l'horari del metro, el tramvia i el NitBus")}; per arribar des de l'aeroport, ${b2link("airport", "ca", "l'autobús, el metro i el tren de l'aeroport al centre")}.`,
          `Si has vingut amb cotxe, mira també ${b2link("zbe", "ca", "què cal fer amb un vehicle estranger a la ZBE")} i ${b2link("parking", "ca", "com funcionen la zona blava i la verda")}.`,
          `Si hi ha una vaga convocada, consulta ${b2link("strikes", "ca", "què funciona els dies de vaga")}: hi afegim els serveis mínims oficials de metro, bus i Rodalies quan es publiquen.`,
          `Abans d'agafar un tren de Rodalies, mira [les incidències de Rodalies avui, línia per línia](${rodaliesHub("ca")}).`,
        ),
        ...paras(verifiedLine("ca", VERIFIED_AT)),
        ...b2Related(["airport", "zbe", "parking", "girona", "montserratFree"], "ca"),
      ],
    },

    es: {
      path: "guias/tarjetas-transporte-barcelona",
      title:
        "Tarjetas de transporte de Barcelona 2026: precio de la T-casual por zonas, T-dia, T-usual y Hola Barcelona",
      seoTitle: "Precio T-casual Barcelona 2026: 13 € (1 zona) y 25,50 € (2)",
      seoDescription:
        "T-casual: 13 € (1 zona), 25,50 € (2) y 34,70 € (3). Tarjetas de metro de Barcelona 2026: T-dia 12 €, T-usual 22,80 €, Hola Barcelona y cuál compensa.",
      excerpt:
        "La tarjeta dirigida a turistas no siempre es la más barata. Compara los títulos según días, trayectos y aeropuerto.",
      blocks: [
        lead(
          "La T-casual cuesta **13 €** en una zona, **25,50 €** en dos y **34,70 €** en tres (precios de 2026, vigentes desde el 15 de enero) y da diez viajes integrados en metro, bus, tranvía y tren: es la tarjeta de 10 viajes de Barcelona. No vale en las estaciones Aeroport T1 y T2 de la L9 Sud, y la tarjeta para turistas, la Hola Barcelona, **no siempre es la más barata**.",
        ),
        ...paras(
          "En 2026, la T-dia de una zona cuesta 12 €, la T-usual 22,80 € y el billete sencillo 2,90 €. Hola Barcelona ofrece viajes ilimitados durante periodos consecutivos de 24 a 120 horas.",
        ),
        callout(
          "info",
          "Respuesta rápida",
          "T-casual para pocos desplazamientos; T-dia para un día de uso intensivo; T-usual para estancias largas; Hola Barcelona para quien valore especialmente los viajes ilimitados y el metro del aeropuerto.",
        ),
        { type: "transportPasses" } as Block,
        ...h2(
          "Precio de la T-casual y del resto de tarjetas por zonas (2026)",
          "La T-casual sirve para **diez viajes integrados** en todos los modos de transporte. Cuesta **13 €** en una zona, **25,50 €** en dos y **34,70 €** en tres: 1,30 € por viaje en una zona, frente a los 2,90 € del billete sencillo.",
        ),
        table("Precios de TMB por zonas, 2026", ["Zonas", "Billete sencillo", "T-casual (10 viajes)", "T-dia (24 h)", "T-usual (30 días)"], ZONE_FARES, "Fuente: TMB, precios vigentes desde el 15 de enero de 2026; la T-usual lleva el 50 % de descuento del Real Decreto-ley 17/2025. Barcelona y El Prat de Llobregat están en la zona 1."),
        ...paras(
          "Estos precios valen hasta el próximo cambio de tarifas de la ATM; a 30 de octubre de 2026 aún no se han anunciado los de 2027.",
          "**¿Cuántas zonas necesitas?** Cuenta el sector tarifario de salida y el de llegada: para ir de Barcelona (zona 1) a Sabadell (zona 2C) hace falta un título de 2 zonas, según TMB. Badalona y Montgat están en la zona 1; El Masnou (con Ocata) y Premià de Mar, en la zona 2. Cada viaje permite hasta 3 transbordos en 75 minutos en una zona, 15 minutos más por cada zona adicional. La T-casual en tarjeta de cartón T-mobilitat cuesta 1 € más.",
        ),
        ...h2(
          "T-casual: la tarjeta de 10 viajes",
          "La **T-casual** cuesta 13 € en una zona e incluye diez viajes, pero no es válida en las estaciones Aeroport T1 y Aeroport T2 de L9 Sud. Se carga en una T-mobilitat: tarjeta personalizada, móvil con NFC o tarjeta anónima.",
          "Es de un solo usuario por viaje: no es nominativa, pero no puede usarla más de una persona a la vez.",
        ),
        ...h2(
          "T-dia: 24 horas ilimitadas",
          "La **T-dia** cuesta 12 € en una zona y permite viajes ilimitados durante 24 horas desde la primera validación.",
          "Incluye un viaje de ida y otro de vuelta a través del metro del aeropuerto.",
        ),
        ...h2(
          "T-usual: la opción que muchos visitantes ignoran",
          "La **T-usual** cuesta 22,80 € en una zona y permite viajes ilimitados durante 30 días consecutivos.",
          "Es personal e intransferible y sí es válida en T1 y T2. Hay que llevar el documento identificativo.",
        ),
        ...h2(
          "Si viajáis varios: T-familiar y T-grup",
          "La **T-familiar** (11,50 € en una zona) da 8 viajes en 30 días y, a diferencia de la T-casual, la pueden compartir varias personas para hacer el mismo trayecto. La **T-grup** (91 € en una zona) da 70 viajes en 30 días, también para varias personas a la vez. Ninguna de las dos vale en las estaciones Aeroport T1 y T2 de la L9 Sud.",
        ),
        ...h2(
          "Hola Barcelona",
          "**Hola Barcelona** funciona durante 24, 48, 72, 96 o 120 horas e incluye metro, bus TMB, NitBus, FGC zona 1, tranvía y Rodalies zona 1, además del funicular de Montjuïc y el metro del aeropuerto. El Teleférico de Montjuïc no está incluido.",
        ),
        callout(
          "official",
          "Precio de la Hola Barcelona",
          `En la web de TMB (holabarcelona.com), a precio completo: 12,50 € (24 h), 18,70 € (48 h), 27,30 € (72 h), 35,60 € (96 h) y 43,60 € (120 h), comprobados el 12 de octubre de 2026; TMB anuncia un 10 % de descuento en línea. Es personal, y las tarjetas que no se han validado caducan el 28 de febrero del año siguiente a la compra. Si dudas entre esta y la Barcelona Card, mira ${b2link("cards", "es", "cuál compensa")}.`,
        ),
        ...daysBlocks("es"),
        ...versusBlocks("es"),
        ...h2("Qué miraría según el viaje"),
        table(
          "Por dónde empezar a mirar según el tipo de viaje",
          PROFILE_HEADERS.es ?? [],
          [
            ["Pocos desplazamientos", "T-casual"],
            ["1 día muy intenso", "T-dia"],
            ["Estancia larga", "T-usual"],
            ["Quieres ilimitados y aeropuerto", "Hola Barcelona"],
          ],
          "No existe una tarjeta óptima para todos: depende de los trayectos, las zonas y el aeropuerto.",
        ),
        faq([
          { question: "¿Cuánto cuesta la T-casual en 2026?", answer: "13 € en 1 zona, 25,50 € en 2 zonas y 34,70 € en 3 zonas, por diez viajes. Son los precios vigentes desde el 15 de enero de 2026." },
          { question: "¿Cuál es la tarjeta de 10 viajes de Barcelona?", answer: "La T-casual: diez viajes integrados en metro, bus, tranvía, FGC y Rodalies, para una sola persona a la vez. En una zona cuesta 13 €, 1,30 € por viaje." },
          { question: "¿La T-casual sirve para el metro del aeropuerto?", answer: "No: no vale para entrar ni salir por las estaciones Aeroport T1 y T2 de la L9 Sud. En esas estaciones necesitas el billete aeropuerto (5,90 €), la T-dia, la T-usual o la Hola Barcelona." },
          { question: "¿Qué es mejor, la Hola Barcelona o la T-casual?", answer: "Con diez viajes o menos repartidos en dos días o más y sin metro del aeropuerto, la T-casual. Si usas el metro del aeropuerto y te quedas 48 horas, la Hola Barcelona sale más barata." },
          { question: "¿Pueden usar la misma T-casual dos personas?", answer: "No a la vez: no es nominativa, pero solo la puede usar una persona en cada viaje. Para compartir, la T-familiar (8 viajes, 11,50 € en una zona) o la T-grup." },
        ]),
        ...paras(
          `Para saber hasta qué hora puedes usar la tarjeta cada noche, mira ${b2link("hours", "es", "el horario del metro, el tranvía y el NitBus")}; para llegar desde el aeropuerto, ${b2link("airport", "es", "el autobús, el metro y el tren del aeropuerto al centro")}.`,
          `Si has venido en coche, mira también ${b2link("zbe", "es", "qué hacer con un vehículo extranjero en la ZBE")} y ${b2link("parking", "es", "cómo funcionan la zona azul y la verde")}.`,
          `Si hay una huelga convocada, consulta ${b2link("strikes", "es", "qué funciona los días de huelga")}: añadimos los servicios mínimos oficiales de metro, bus y Rodalies cuando se publican.`,
          `Antes de coger un tren de Rodalies, mira [las incidencias de Rodalies hoy, línea por línea](${rodaliesHub("es")}).`,
        ),
        ...paras(verifiedLine("es", VERIFIED_AT)),
        ...b2Related(["airport", "zbe", "parking", "girona", "montserratFree"], "es"),
      ],
    },

    en: {
      path: "guides/barcelona-transport-passes",
      title:
        "Barcelona transport passes 2026: T-casual, T-dia, T-usual or Hola Barcelona, and what each costs",
      seoTitle: "Barcelona transport pass 2026: T-casual €13, 1 to 5 days",
      seoDescription:
        "T-casual €13 for 10 journeys, T-dia €12 for 24 hours, Hola Barcelona from €12.50. 2026 prices by zone and days, airport metro rules and which to buy.",
      excerpt:
        "The obvious tourist card is not automatically the cheapest. Compare the passes by days, journeys and airport use.",
      blocks: [
        lead(
          "A **T-casual** costs **€13** for ten journeys in zone 1, a **T-dia** **€12** for 24 hours of unlimited travel and a **T-usual** **€22.80** for 30 days (2026 fares, in force since 15 January). They cover metro, bus, tram and trains alike. The T-casual is not valid at the airport metro stations, and the tourist card, Hola Barcelona, is **not automatically the cheapest**.",
        ),
        ...paras(
          "A single ticket costs €2.90 and the airport metro ticket €5.90. Hola Barcelona gives unlimited travel for consecutive periods of 24 to 120 hours, from €12.50.",
        ),
        callout(
          "info",
          "Quick answer",
          "Look at T-casual for light public-transport use, T-dia for one intensive day, T-usual for longer stays, and Hola Barcelona if unlimited travel and airport metro access matter most.",
        ),
        { type: "transportPasses" } as Block,
        ...h2(
          "T-casual price by zone, and the other passes (2026)",
          "The T-casual is valid for **ten integrated journeys** on every mode of transport. It costs **€13** in one zone, **€25.50** in two and **€34.70** in three: €1.30 a journey in one zone, against €2.90 for a single ticket.",
        ),
        table("TMB fares by zone, 2026", ["Zones", "Single ticket", "T-casual (10 journeys)", "T-dia (24 h)", "T-usual (30 days)"], ZONE_FARES_EN, "Source: TMB, prices in force from 15 January 2026; the T-usual carries the 50% discount of Royal Decree-Law 17/2025. Barcelona and El Prat de Llobregat are in zone 1."),
        ...paras(
          "These prices apply until ATM's next fare change; as of 30 October 2026 the 2027 fares had not been announced.",
          "**How many zones do you need?** Count the fare sector you leave from and the one you arrive in: Barcelona (zone 1) to Sabadell (zone 2C) needs a 2-zone ticket, according to TMB. Badalona and Montgat are in zone 1; El Masnou (with Ocata) and Premià de Mar in zone 2. Each journey allows up to 3 transfers within 75 minutes in one zone, plus 15 minutes for each extra zone. A T-casual on a cardboard T-mobilitat card costs €1 more.",
        ),
        ...h2(
          "T-casual: Barcelona's 10-journey ticket",
          "The **T-casual** gives you ten journeys for €13 in one zone, but it cannot be used through the L9 Sud airport metro gates at T1 or T2. It is loaded onto a T-mobilitat: a personal card, an NFC phone or an anonymous card.",
          "It is one person per journey: it is not tied to a name, but it cannot be used by more than one person at the same time.",
        ),
        ...h2(
          "T-dia: 24 hours of unlimited travel for €12",
          "The **T-dia** costs €12 in one zone and gives unlimited travel for 24 hours from first validation.",
          "It includes one outbound and one return airport metro journey.",
        ),
        ...h2(
          "T-usual: the one most visitors overlook",
          "The **T-usual** costs €22.80 in one zone and gives unlimited travel for 30 consecutive days.",
          "It is personal and non-transferable, and it is valid through the T1 and T2 airport metro stations.",
        ),
        ...h2(
          "Travelling together: T-familiar and T-grup",
          "The **T-familiar** (€11.50 in one zone) gives 8 journeys in 30 days and, unlike the T-casual, several people can use it for the same journey. The **T-grup** (€91 in one zone) gives 70 journeys in 30 days, also for several people at once. Neither is valid at the Aeroport T1 and T2 stations on L9 Sud.",
        ),
        ...h2(
          "Hola Barcelona Travel Card: price and what it covers",
          "The **Hola Barcelona Travel Card** offers unlimited travel for 24, 48, 72, 96 or 120 hours and covers TMB metro and buses, NitBus, the Montjuïc funicular, FGC zone 1, the tram and Rodalies zone 1. Airport metro travel is included; the Montjuïc Cable Car is not.",
        ),
        callout(
          "official",
          "Hola Barcelona prices",
          `On TMB's own Hola Barcelona site (holabarcelona.com), full price: €12.50 (24 h), €18.70 (48 h), €27.30 (72 h), €35.60 (96 h) and €43.60 (120 h), checked on 12 October 2026; TMB advertises 10% off online (on 30 October 2026 the site showed "from €12.50", €11.25 online). The card is non-transferable, and an online reservation is valid for 180 days from purchase and no later than the last day of February of the following year. Torn between this and the Barcelona Card? See ${b2link("cards", "en", "which one is worth it")}.`,
        ),
        ...daysBlocks("en"),
        ...versusBlocks("en"),
        ...h2("Which pass should you buy?"),
        table(
          "A starting point, not a ranking",
          PROFILE_HEADERS.en ?? [],
          [
            ["Light public-transport use", "T-casual"],
            ["One intensive day", "T-dia"],
            ["Longer stay", "T-usual"],
            ["Unlimited travel plus airport", "Hola Barcelona"],
          ],
          "There is no single best pass: it depends on your journeys, your zones and the airport.",
        ),
        faq([
          { question: "How much is the T-casual in 2026?", answer: "€13 in 1 zone, €25.50 in 2 zones and €34.70 in 3 zones, for ten journeys. These are the fares in force since 15 January 2026." },
          { question: "What is the T-dia in Barcelona?", answer: "A 24-hour pass with unlimited journeys on metro, bus, tram and trains from first validation: €12 in one zone. It includes one airport metro journey each way." },
          { question: "Is the T-casual valid on the airport metro?", answer: "No: it cannot be used to enter or leave the Aeroport T1 and T2 stations on L9 Sud. There you need the airport ticket (€5.90), the T-dia, the T-usual or Hola Barcelona." },
          {
            question: "Which Barcelona transport pass is best for 3 days?",
            answer: `For ten journeys or fewer over the three days, the T-casual (${euros(fareFor("t-casual"), "en")}); with the airport metro there and back on top, ${euros(fareFor("t-casual") + 2 * AIRPORT_TICKET, "en")}, still less than the 72-hour Hola Barcelona (${euros(fareFor("hola-barcelona", 3), "en")}). For more journeys than that, compare the 72-hour Hola Barcelona with three T-dia (${euros(fareFor("t-dia") * 3, "en")}): the table above has the sums for 1 to 5 days.`,
          },
          { question: "Can two people share a T-casual?", answer: "Not at the same time: it is not in anyone's name, but only one person can use it on each journey. To share, there is the T-familiar (8 journeys, €11.50 in one zone) or the T-grup." },
        ]),
        ...paras(
          `To know how late you can use your pass each night, see ${b2link("hours", "en", "Barcelona metro hours and night buses")}; from the airport, see ${b2link("airport", "en", "the bus, metro and train from the airport to the centre")}.`,
          `Driving in? See ${b2link("zbe", "en", "what foreign-registered cars must do first")} and ${b2link("parking", "en", "how the blue and green parking zones work")}.`,
          `If a strike has been called, check ${b2link("strikes", "en", "what runs on strike days")}: we add the official minimum services for the metro, buses and Rodalies as they are published.`,
          `Before you take a Rodalies train, check [Rodalies disruptions today](${rodaliesHub("en")}).`,
        ),
        ...paras(verifiedLine("en", VERIFIED_AT)),
        ...b2Related(["airport", "zbe", "parking", "girona", "montserratFree"], "en"),
      ],
    },
  },
};

/* ========================================================================== */
/* 02 — Low-emission zone, foreign vehicles                                   */
/* ========================================================================== */

const ZBE_SOURCES = [
  {
    name: "Registre metropolità de vehicles estrangers i altres vehicles autoritzats a la ZBE",
    url: "https://zberegistre.ambmobilitat.cat/",
    publisher: "Àrea Metropolitana de Barcelona",
  },
  {
    name: "Preguntes freqüents del registre de la ZBE",
    url: "https://zberegistre.ambmobilitat.cat/ca/PreguntesFrequents",
    publisher: "Àrea Metropolitana de Barcelona",
  },
  {
    name: "Zones de baixes emissions — preguntes freqüents",
    url: "https://www.amb.cat/web/mobilitat/mobilitat-sostenible/zbe/zones-baixes-emissions/faqs",
    publisher: "Àrea Metropolitana de Barcelona",
  },
  { name: "Vehicles estrangers", url: "https://zberegistre.ambmobilitat.cat/ca/VehiclesEstrangers", publisher: "Àrea Metropolitana de Barcelona" },
  { name: "Autoritzacions diàries", url: "https://zberegistre.ambmobilitat.cat/ca/AutoritzacionsDiaries", publisher: "Àrea Metropolitana de Barcelona" },
  { name: "Vehicles afectats per la ZBE Rondes de Barcelona", url: "https://www.zbe.barcelona/zones-baixes-emissions/vehicles-afectats.html", publisher: "Àrea Metropolitana de Barcelona" },
  { name: "La ZBE Rondes de Barcelona", url: "https://www.zbe.barcelona/zones-baixes-emissions/la-zbe.html", publisher: "Àrea Metropolitana de Barcelona" },
  { name: "Ordenança fiscal de les taxes de la ZBE (BOP, 28-12-2021)", url: "https://bop.diba.cat/anunci/descarrega-pdf/3170068", publisher: "Butlletí Oficial de la Província de Barcelona" },
];

// The package said "up to 15 days". The AMB's own FAQ says 15 *working* days,
// which for a trip planned around a weekend is a materially different number.
// Re-checked and extended 23 Oct 2026 (research_notes/page1/airport_transport_zbe.md):
// hours, area, fees, day-permit rules, the fine for a qualifying car that was
// not registered, Andorran plates and the end of the 2026 suspension. Left
// out: a general fine amount, the helpline (the official contact page is a
// placeholder) and the medical-urgency deadline, on which two AMB pages
// disagree. Fees are revised yearly: re-check each January.
// Re-checked 28 Oct 2026 on zbe.barcelona (vehicles-afectats, incl. the
// "multa a partir de 200 euros" line for a qualifying foreign car that was not
// registered), zberegistre (VehiclesEstrangers, AutoritzacionsDiaries) and the
// AMB FAQ (95 km2, Mon-Fri 7-20). Added: the who-can-enter table (petrol cars
// before Euro 3 "habitualment matriculats abans del 2000" cannot enter, diesel
// before Euro 4 "abans del 2005 o 2006", motorbikes before Euro 2, 2003; vans
// N1 since 1 April 2021), in force since 1 January 2020, not registered until
// confirmed, occasional-access papers, manufacturer document in Catalan,
// Spanish or English. Not printed: whether weekday public holidays are exempt
// (the page says "dies laborables, de dilluns a divendres" and nothing more)
// and any map we could link.
const ZBE_VERIFIED = "2026-10-28";

const ZBE_TABLE: Record<"ca" | "es" | "en", { title: string; caption: string; headers: string[]; rows: string[][]; note: string }> = {
  ca: {
    title: "Quins vehicles poden entrar a la ZBE de Barcelona",
    caption: "Requisits per circular per la ZBE Rondes de Barcelona",
    headers: ["Vehicle", "Pot entrar si és", "Habitualment, matriculat"],
    rows: [
      ["Turisme o furgoneta de gasolina", "Euro 3 o superior", "Des del 2000"],
      ["Turisme o furgoneta dièsel", "Euro 4 o superior", "Des del 2005 o 2006"],
      ["Moto o ciclomotor", "Euro 2 o superior", "Des del 2003"],
      ["Elèctric", "Sempre", "—"],
    ],
    note: "Font: AMB (zbe.barcelona i registre de la ZBE), comprovat el 28 d'octubre de 2026. L'any és orientatiu: mana el nivell Euro del permís de circulació.",
  },
  es: {
    title: "Qué vehículos pueden entrar en la ZBE de Barcelona",
    caption: "Requisitos para circular por la ZBE Rondes de Barcelona",
    headers: ["Vehículo", "Puede entrar si es", "Normalmente, matriculado"],
    rows: [
      ["Turismo o furgoneta de gasolina", "Euro 3 o superior", "Desde 2000"],
      ["Turismo o furgoneta diésel", "Euro 4 o superior", "Desde 2005 o 2006"],
      ["Moto o ciclomotor", "Euro 2 o superior", "Desde 2003"],
      ["Eléctrico", "Siempre", "—"],
    ],
    note: "Fuente: AMB (zbe.barcelona y registro de la ZBE), comprobado el 28 de octubre de 2026. El año es orientativo: manda el nivel Euro del permiso de circulación.",
  },
  en: {
    title: "Which cars can enter Barcelona's low emission zone?",
    caption: "Standards for driving in the ZBE Rondes de Barcelona",
    headers: ["Vehicle", "Can enter if it is", "Usually registered"],
    rows: [
      ["Petrol car or van", "Euro 3 or higher", "From 2000"],
      ["Diesel car or van", "Euro 4 or higher", "From 2005 or 2006"],
      ["Motorbike or moped", "Euro 2 or higher", "From 2003"],
      ["Electric", "Always", "—"],
    ],
    note: "Source: AMB (zbe.barcelona and the ZBE register), checked on 28 October 2026. The year is a guide: the Euro level on your registration document is what counts.",
  },
};

function zbeTable(locale: "ca" | "es" | "en"): Block[] {
  const t = ZBE_TABLE[locale];
  return [...h2(t.title), table(t.caption, t.headers, t.rows, t.note)];
}

export const ZBE: B2Article = {
  key: "zbe",
  entryKey: "guide-barcelona-lez-foreign-vehicles",
  categoryKey: "public-services",
  sources: ZBE_SOURCES,
  heroKey: "b2-zbe-gran-via-barcelona",
  secondaryKey: "b2-zbe-ronda-de-dalt",
  secondaryAlt: {
    ca: "La Ronda de Dalt de Barcelona vista des d'un pont",
    es: "La Ronda de Dalt de Barcelona vista desde un puente",
    en: "Barcelona's Ronda de Dalt ring road seen from a bridge",
  },
  secondaryCaption: {
    ca: "La ZBE es coneix com a ZBE Rondes perquè el perímetre el marquen les rondes.",
    es: "La ZBE se conoce como ZBE Rondes porque el perímetro lo marcan las rondas.",
    en: "The zone is called ZBE Rondes because the ring roads mark its perimeter.",
  },
  heroAlt: {
    ca: "Trànsit a la Gran Via de les Corts Catalanes de Barcelona",
    es: "Tráfico en la Gran Via de les Corts Catalanes de Barcelona",
    en: "Traffic on Barcelona's Gran Via de les Corts Catalanes",
  },
  heroCaption: {
    ca: "La ZBE cobreix bona part de la metròpolis: entrar-hi amb matrícula estrangera requereix registre previ.",
    es: "La ZBE cubre buena parte de la metrópolis: entrar con matrícula extranjera requiere registro previo.",
    en: "The low-emission zone covers much of the metropolitan area; foreign plates need prior registration.",
  },
  verifiedAt: ZBE_VERIFIED,
  publishedAt: "2026-09-29T11:10:00+02:00",
  editions: {
    ca: {
      path: "guies/zbe-barcelona-vehicles-estrangers",
      title: "ZBE de Barcelona: quins cotxes hi poden entrar i què has de fer si vens amb un vehicle estranger",
      seoTitle: "ZBE Barcelona: quins cotxes hi entren, horari i registre",
      seoDescription:
        "Quins cotxes poden entrar a la ZBE de Barcelona (gasolina Euro 3, dièsel Euro 4), horari de dl. a dv. de 7 a 20 h i com registrar un cotxe estranger (7 €).",
      excerpt:
        "Amb matrícula estrangera cal registrar-se abans de circular per la ZBE. La comprovació ordinària pot trigar fins a 15 dies hàbils.",
      blocks: [
        lead(
          "Per circular per la ZBE de Barcelona amb un cotxe de matrícula estrangera l'has d'inscriure abans al Registre metropolità de l'AMB, perquè els vehicles estrangers no tenen etiqueta de la DGT. Si compleix els requisits (gasolina Euro 3, dièsel Euro 4) la inscripció costa 7 € una sola vegada; si no, pots demanar fins a 24 autoritzacions diàries l'any a 5 € cadascuna. La zona funciona de dilluns a divendres de 7:00 a 20:00.",
        ),
        ...paras(
          "**Tots els vehicles amb matrícula estrangera s'han d'inscriure al Registre metropolità per circular per les ZBE de la metròpolis de Barcelona.** La comprovació ordinària dels requisits ambientals pot trigar fins a **15 dies hàbils**, i fins que no arriba la confirmació el vehicle no consta com a registrat i no pot circular per la ZBE.",
        ),
        callout(
          "warning",
          "Resposta ràpida",
          "Els vehicles amb matrícula estrangera no tenen etiqueta ambiental de la DGT, i per això tots s'han de registrar abans de circular per la ZBE. Tramita-ho abans del viatge.",
        ),
        keyFacts("Dades clau", [
          { label: "Registre previ", value: "Obligatori per a tota matrícula estrangera" },
          { label: "Termini de resolució", value: "Fins a 15 dies hàbils" },
          { label: "Gasolina (turismes)", value: "Euro 3 o superior" },
          { label: "Dièsel (turismes)", value: "Euro 4 o superior" },
          { label: "Autoritzacions esporàdiques", value: "Fins a 24 diàries l'any" },
          { label: "Horari", value: "Dl.–dv., 7:00–20:00" },
          { label: "Última verificació", value: "28 d'octubre de 2026" },
        ]),
        ...h2(
          "Quins requisits ambientals demanen",
          "Per a l'autorització ambiental de llarga durada, els turismes de gasolina han de complir almenys **Euro 3** (habitualment matriculats després del 2000) i els dièsel **Euro 4** (habitualment matriculats després del 2005), segons les categories descrites per l'AMB.",
          "Si el vehicle no compleix els requisits, o necessites accedir-hi urgentment, existeixen autoritzacions esporàdiques. L'AMB permet fins a **24 autoritzacions diàries anuals** en aquesta modalitat.",
        ),
        ...zbeTable("ca"),
        ...paras("Les furgonetes (N1) tenen els mateixos requisits que els turismes des de l'1 d'abril de 2021; la restricció permanent s'aplica des de l'1 de gener de 2020. Un dièsel del 2012 o del 2015 normalment supera de llarg l'Euro 4, però mira el nivell Euro del permís de circulació, no l'any."),
        ...h2(
          "Quan i on s'aplica",
          "La ZBE Rondes de Barcelona funciona **de dilluns a divendres, de 7:00 a 20:00**, tot l'any. Cobreix tot el terme de Barcelona (excepte la Zona Franca industrial i els barris de Vallvidrera, el Tibidabo i les Planes), l'Hospitalet de Llobregat, Sant Adrià de Besòs i part d'Esplugues i de Cornellà: més de 95 km².",
          "Les rondes (de Dalt i Litoral) en queden fora, però les sortides que porten directament a la ZBE estan tancades als vehicles que no hi poden circular. Un cotxe matriculat a Espanya amb etiqueta 0, ECO, C o B hi circula sense restriccions; un de matrícula estrangera no té etiqueta de la DGT i per això s'ha de registrar.",
          "La ZBE va tornar a funcionar amb normalitat el dilluns 16 de març de 2026, quan es va acabar la suspensió temporal d'aquell hivern.",
        ),
        ...h2(
          "Quant costa",
          "Si el vehicle compleix els requisits, la inscripció té una **taxa de gestió de 7 €, una sola vegada**. Si no els compleix, inscriure'l no costa res, i cada autorització diària costa **5 €** per a turismes i motos i **6 €** per a furgonetes, segons les taxes vigents des del gener del 2022; l'AMB les revisa i les publica cada any.",
        ),
        ...h2(
          "Autoritzacions diàries: com funcionen",
          "Un cop acceptada la inscripció, tens fins a **24 dies de circulació l'any**, comptats des de la data de resolució; els que no facis servir no s'acumulen per a l'any següent. Has de **comunicar i pagar cada dia abans de les 23:59 de l'endemà** del dia que hi hagis circulat.",
          "Les dates es poden canviar fins al dia abans de circular, però una autorització ja pagada no es pot anul·lar.",
        ),
        ...h2(
          "I si hi entro sense registrar?",
          "Segons l'AMB, un vehicle estranger que compleix els requisits però no s'ha registrat abans pot rebre una **multa a partir de 200 euros**.",
        ),
        ...h2(
          "Matrícula andorrana",
          "Els vehicles amb matrícula d'Andorra que compleixen els requisits fan el tràmit a través del Servei de Tràmits del Govern d'Andorra, al carrer Prat de la Creu, 62-64, d'Andorra la Vella.",
        ),
        ...h2("Què necessitaràs?"),
        ...paras(
          "Per al registre de llarga durada s'ha d'aportar documentació oficial del vehicle on constin dades com:",
        ),
        list(
          "titular;",
          "matrícula;",
          "categoria d'homologació;",
          "tipus de combustible;",
          "nivell Euro.",
        ),
        ...paras(
          "Si la documentació no inclou prou informació ambiental, cal un document del fabricant, en català, castellà o anglès, que acrediti les emissions de NOx i de partícules. Per a les autoritzacions diàries només cal la documentació on consten la matrícula i el titular.",
        ),
        ...h2("Com demanar l'autorització, pas a pas"),
        steps("Passos abans del viatge", [
          {
            title: "Comprova la categoria del vehicle",
            text: "Mira al permís de circulació el nivell Euro i el combustible. Si no hi consten, demana l'acreditació al fabricant.",
          },
          {
            title: "Tramita el registre amb temps",
            text: "La resolució pot trigar fins a 15 dies hàbils, així que no ho deixis per a la setmana del viatge.",
          },
          {
            title: "Si no compleixes, mira l'autorització esporàdica",
            text: "Fins a 24 autoritzacions diàries l'any, subjectes a les condicions aplicables.",
          },
          {
            title: "Comprova per separat on aparcaràs",
            text: "Circular i aparcar són dues autoritzacions diferents.",
          },
        ]),
        ...h2(
          "El registre substitueix les normes d'aparcament?",
          "No.",
          "Tenir autorització per circular per la ZBE no dona dret a aparcar gratis ni converteix una zona verda de residents en una plaça disponible per a visitants.",
          `Com funciona l'aparcament al carrer ho expliquem a part: ${b2link("parking", "ca", "zona blava i zona verda de Barcelona")}.`,
          `Si has de posar benzina abans d'entrar-hi, aquí tens [les benzineres més barates de Barcelona ara](${fuelPath("ca", "city", "barcelona")}), amb el preu oficial del Ministeri.`,
        ),
        faq([
          { question: "Un cotxe estranger pot entrar a la ZBE de Barcelona?", answer: "Sí, si abans l'inscrius al registre de l'AMB: amb gasolina Euro 3 o dièsel Euro 4 o superior, una taxa de 7 € una sola vegada; si no compleix, fins a 24 autoritzacions diàries l'any." },
          { question: "Quin és l'horari de la ZBE de Barcelona?", answer: "De dilluns a divendres, de 7:00 a 20:00, tot l'any. Fora d'aquest horari i el cap de setmana no s'aplica la restricció permanent." },
          { question: "Quins dièsel poden entrar a la ZBE?", answer: "Els Euro 4 o superiors, habitualment els matriculats a partir del 2005 o 2006. Mana el nivell Euro del permís de circulació." },
          { question: "Quant triga el registre de la ZBE?", answer: "Fins a 15 dies hàbils; fins que no arriba la confirmació, el vehicle no pot circular per la ZBE." },
          { question: "Quina multa hi ha si entro sense registrar?", answer: "Segons l'AMB, un vehicle que compleix els requisits però no s'ha registrat pot rebre una multa a partir de 200 euros." },
        ]),
        ...paras(verifiedLine("ca", ZBE_VERIFIED)),
        ...b2Related(["parking", "transport"], "ca"),
      ],
    },

    es: {
      path: "guias/zbe-barcelona-vehiculos-extranjeros",
      title: "ZBE de Barcelona: qué hacer si llegas con un coche extranjero",
      seoTitle: "Autorización ZBE Barcelona: cómo pedirla (coche extranjero)",
      seoDescription:
        "Cómo pedir la autorización para entrar en la ZBE de Barcelona con matrícula extranjera: registro AMB (7 €), hasta 15 días hábiles, 24 días al año.",
      excerpt:
        "Con matrícula extranjera hay que registrarse antes de circular por la ZBE. La comprobación ordinaria puede tardar hasta 15 días hábiles.",
      blocks: [
        lead(
          "Para entrar en la ZBE de Barcelona con un coche de matrícula extranjera hay que inscribirlo antes en el Registro metropolitano de la AMB, porque los vehículos extranjeros no tienen etiqueta de la DGT. Si cumple los requisitos (gasolina Euro 3, diésel Euro 4) la inscripción cuesta 7 € una sola vez; si no, puedes pedir hasta 24 autorizaciones diarias al año a 5 € cada una. La zona funciona de lunes a viernes de 7:00 a 20:00.",
        ),
        ...paras("La comprobación ordinaria puede tardar hasta **15 días hábiles**, y hasta que llega la confirmación el vehículo no consta como registrado y no puede circular por la ZBE."),
        callout(
          "warning",
          "Respuesta rápida",
          "Los vehículos con matrícula extranjera no tienen etiqueta ambiental de la DGT, y por eso todos deben registrarse antes de circular por la ZBE. Tramítalo antes del viaje.",
        ),
        keyFacts("Datos clave", [
          { label: "Registro previo", value: "Obligatorio para toda matrícula extranjera" },
          { label: "Plazo de resolución", value: "Hasta 15 días hábiles" },
          { label: "Gasolina (turismos)", value: "Euro 3 o superior" },
          { label: "Diésel (turismos)", value: "Euro 4 o superior" },
          { label: "Autorizaciones esporádicas", value: "Hasta 24 diarias al año" },
          { label: "Horario", value: "L–V, 7:00–20:00" },
          { label: "Última verificación", value: "28 de octubre de 2026" },
        ]),
        ...h2(
          "Requisitos ambientales",
          "Los turismos de gasolina deben cumplir al menos **Euro 3** y los diésel **Euro 4** para obtener la autorización ambiental de larga duración.",
          "Existe además una modalidad de acceso esporádico que permite solicitar hasta **24 días de circulación al año** cuando corresponda.",
        ),
        ...zbeTable("es"),
        ...paras("Las furgonetas (N1) tienen los mismos requisitos que los turismos desde el 1 de abril de 2021; la restricción permanente se aplica desde el 1 de enero de 2020. Un diésel de 2012 o de 2015 normalmente supera de largo el Euro 4, pero mira el nivel Euro del permiso de circulación, no el año."),
        ...h2(
          "Horario y zona",
          "La ZBE Rondes de Barcelona funciona **de lunes a viernes, de 7:00 a 20:00**, todo el año. Cubre todo el término de Barcelona (salvo la Zona Franca industrial y los barrios de Vallvidrera, el Tibidabo y les Planes), L'Hospitalet de Llobregat, Sant Adrià de Besòs y parte de Esplugues y de Cornellà: más de 95 km².",
          "Las rondas (de Dalt y Litoral) quedan fuera, pero las salidas que llevan directamente a la ZBE están cerradas a los vehículos que no pueden circular. Un coche matriculado en España con etiqueta 0, ECO, C o B circula sin restricciones; uno de matrícula extranjera no tiene etiqueta de la DGT y por eso debe registrarse.",
          "La ZBE volvió a funcionar con normalidad el lunes 16 de marzo de 2026, al terminar la suspensión temporal de aquel invierno.",
        ),
        ...h2(
          "Cuánto cuesta",
          "Si el vehículo cumple los requisitos, la inscripción tiene una **tasa de gestión de 7 €, una sola vez**. Si no los cumple, inscribirlo no cuesta nada, y cada autorización diaria cuesta **5 €** para turismos y motos y **6 €** para furgonetas, según las tasas vigentes desde enero de 2022; la AMB las revisa y las publica cada año.",
        ),
        ...h2(
          "Autorizaciones diarias: cómo se usan y se pagan",
          "Una vez aceptada la inscripción, tienes hasta **24 días de circulación al año**, contados desde la fecha de resolución; los que no uses no se acumulan para el año siguiente. Hay que **comunicar y pagar cada día antes de las 23:59 del día siguiente** al que hayas circulado.",
          "Las fechas se pueden cambiar hasta el día antes de circular, pero una autorización ya pagada no se puede cancelar.",
        ),
        ...h2(
          "Multa si entras sin registrar",
          "Según la AMB, un vehículo extranjero que cumple los requisitos pero no se ha registrado antes puede recibir una **multa a partir de 200 euros**.",
        ),
        ...h2(
          "Matrícula andorrana",
          "Los vehículos con matrícula de Andorra que cumplen los requisitos hacen el trámite a través del Servei de Tràmits del Govern d'Andorra, en la calle Prat de la Creu, 62-64, de Andorra la Vella.",
        ),
        ...h2("Documentación"),
        ...paras("Hay que aportar documentación oficial del vehículo donde consten:"),
        list(
          "titular;",
          "matrícula;",
          "categoría de homologación;",
          "tipo de combustible;",
          "nivel Euro.",
        ),
        ...paras(
          "Si la documentación no incluye suficiente información ambiental, hace falta un documento del fabricante, en catalán, castellano o inglés, que acredite las emisiones de NOx y de partículas. Para las autorizaciones diarias solo hace falta la documentación con la matrícula y el titular.",
        ),
        ...h2("Cómo pedir la autorización paso a paso"),
        steps("Pasos antes del viaje", [
          {
            title: "Comprueba la categoría del vehículo",
            text: "Busca en el permiso de circulación el nivel Euro y el combustible.",
          },
          {
            title: "Tramita el registro con tiempo",
            text: "La resolución puede tardar hasta 15 días hábiles.",
          },
          {
            title: "Si no cumples, mira el acceso esporádico",
            text: "Hasta 24 autorizaciones diarias al año, sujetas a las condiciones aplicables.",
          },
          {
            title: "Comprueba aparte dónde aparcarás",
            text: "Circular y aparcar son dos cuestiones distintas.",
          },
        ]),
        ...h2(
          "Circular no es aparcar",
          "Tener autorización para circular por la ZBE no da derecho a aparcar gratis ni convierte una zona verde de residentes en una plaza disponible para visitantes.",
          `Cómo funciona el aparcamiento en la calle lo explicamos aparte: ${b2link("parking", "es", "zona azul y zona verde de Barcelona")}.`,
          `Si tienes que repostar antes de entrar, aquí tienes [las gasolineras más baratas de Barcelona ahora](${fuelPath("es", "city", "barcelona")}), con el precio oficial del Ministerio.`,
        ),
        faq([
          { question: "¿Puede entrar un coche extranjero en la ZBE de Barcelona?", answer: "Sí, si antes lo inscribes en el registro de la AMB: con gasolina Euro 3 o diésel Euro 4 o superior, una tasa de 7 € una sola vez; si no cumple, hasta 24 autorizaciones diarias al año." },
          { question: "¿Cuál es el horario de la ZBE de Barcelona?", answer: "De lunes a viernes, de 7:00 a 20:00, todo el año. Fuera de ese horario y el fin de semana no se aplica la restricción permanente." },
          { question: "¿Qué diésel pueden entrar en la ZBE?", answer: "Los Euro 4 o superiores, normalmente los matriculados a partir de 2005 o 2006. Manda el nivel Euro del permiso de circulación." },
          { question: "¿Cuánto tarda el registro de la ZBE?", answer: "Hasta 15 días hábiles; hasta que llega la confirmación, el vehículo no puede circular por la ZBE." },
          { question: "¿Qué multa hay si entro sin registrar?", answer: "Según la AMB, un vehículo que cumple los requisitos pero no se ha registrado puede recibir una multa a partir de 200 euros." },
        ]),
        ...paras(verifiedLine("es", ZBE_VERIFIED)),
        ...b2Related(["parking", "transport"], "es"),
      ],
    },

    en: {
      path: "guides/barcelona-low-emission-zone-foreign-cars",
      title:
        "Barcelona low emission zone (LEZ): which cars can enter, and what foreign drivers must do",
      seoTitle: "Barcelona low emission zone (LEZ): foreign cars, hours, fees",
      seoDescription:
        "Which cars can enter Barcelona's low emission zone (LEZ/ZBE): petrol Euro 3, diesel Euro 4. Mon–Fri 07:00–20:00. Foreign cars register with the AMB (€7).",
      excerpt:
        "Foreign plates must be registered before driving in Barcelona's low-emission zone. Verification can take up to 15 working days.",
      blocks: [
        lead(
          "Barcelona's low-emission zone (ZBE Rondes de Barcelona, the LEZ) keeps out vehicles without a DGT environmental label from Monday to Friday, 07:00 to 20:00. A foreign-registered car has no DGT label, so you must register it with the AMB before you drive in: €7 once if it meets the standard (petrol Euro 3, diesel Euro 4), or up to 24 day permits a year at €5 each if it does not.",
        ),
        ...paras(
          "**Foreign-registered vehicles must be entered in the metropolitan register before driving in Barcelona metropolitan low-emission zones.** Standard environmental verification can take up to **15 working days**, and until it is confirmed the vehicle is not registered and may not drive in the zone.",
        ),
        callout(
          "warning",
          "Travelling next week?",
          "Check the registration before you drive into Barcelona. Fifteen working days is three weeks of calendar time.",
        ),
        keyFacts("Key facts", [
          { label: "Prior registration", value: "Required for every foreign plate" },
          { label: "Processing time", value: "Up to 15 working days" },
          { label: "Petrol cars", value: "Euro 3 or higher" },
          { label: "Diesel cars", value: "Euro 4 or higher" },
          { label: "Day authorisations", value: "Up to 24 per year" },
          { label: "Hours", value: "Mon–Fri, 07:00–20:00" },
          { label: "Last verified", value: "28 October 2026" },
        ]),
        ...h2(
          "Environmental standards",
          "For passenger cars, the AMB lists petrol **Euro 3** or higher and diesel **Euro 4** or higher among the standards eligible for long-term authorisation.",
          "Vehicles using the occasional-access system can request up to **24 daily authorisations per year**, subject to the applicable conditions.",
        ),
        ...zbeTable("en"),
        ...paras("Vans (N1) have had the same standards as cars since 1 April 2021; the permanent restriction has applied since 1 January 2020. A 2012 or 2015 diesel is normally well past Euro 4, but check the Euro level on the registration document rather than the year."),
        ...h2(
          "When and where the zone applies",
          "The ZBE Rondes de Barcelona runs **Monday to Friday, 07:00 to 20:00**, all year. It covers the whole of Barcelona (except the industrial Zona Franca and the Vallvidrera, Tibidabo and Les Planes neighbourhoods), L'Hospitalet de Llobregat, Sant Adrià de Besòs and parts of Esplugues and Cornellà: more than 95 km².",
          "The ring roads (Ronda de Dalt and Ronda Litoral) are outside it, but the exits that lead straight into the zone are closed to vehicles that may not enter. A car registered in Spain with a 0, ECO, C or B label drives in freely; a foreign-registered one has no DGT label, which is why it must be registered.",
          "The zone returned to normal operation on Monday 16 March 2026, when that winter's temporary suspension ended.",
        ),
        ...h2(
          "What it costs",
          "If your vehicle meets the standard, registration carries a **€7 handling fee, once**. If it does not, registering it is free and each day permit costs **€5** for cars and motorbikes and **€6** for vans, under the fees in force since January 2022; the AMB reviews and publishes them each year.",
        ),
        ...h2(
          "Day permits: 24 a year",
          "Once your registration is accepted you get up to **24 driving days a year**, counted from the date of the decision; unused days do not carry over. You must **notify and pay for each day before 23:59 on the following day**.",
          "You can change the dates until the day before you drive, but a permit you have paid for cannot be cancelled.",
        ),
        ...h2(
          "What if you drive in without registering",
          "According to the AMB, a foreign vehicle that meets the standard but was not registered in advance can be fined **from €200**.",
        ),
        ...h2(
          "Andorran plates",
          "Andorran-registered vehicles that meet the standard register through the Government of Andorra's Servei de Tràmits, at Carrer Prat de la Creu 62-64, Andorra la Vella.",
        ),
        ...h2("What you will need"),
        ...paras("Official vehicle documents showing:"),
        list(
          "the registered keeper;",
          "the plate;",
          "the homologation category;",
          "the fuel type;",
          "the Euro level.",
        ),
        ...paras(
          "If your documents do not carry enough environmental information, you need a manufacturer's document, in Catalan, Spanish or English, showing the vehicle's NOx and particulate emissions. For day permits, papers showing the plate and the keeper are enough.",
        ),
        ...h2("How to register a foreign car, step by step"),
        steps("Before you travel", [
          {
            title: "Check your vehicle's category",
            text: "Find the Euro level and fuel type on the registration document.",
          },
          {
            title: "Register early",
            text: "Verification can take up to 15 working days, so do not leave it to the week of the trip.",
          },
          {
            title: "If you do not qualify, look at day authorisations",
            text: "Up to 24 per year, subject to the applicable conditions.",
          },
          {
            title: "Check parking separately",
            text: "Driving in and parking are two different permissions.",
          },
        ]),
        ...h2(
          "Driving in is not parking",
          "Authorisation to drive in the low-emission zone does not give you free parking, and it does not turn a residents' green space into a visitor space.",
          `Street parking is a separate question: ${b2link("parking", "en", "Barcelona's blue and green zones")}.`,
        ),
        faq([
          { question: "Can foreign cars drive in Barcelona's low emission zone?", answer: "Yes, once registered with the AMB: a petrol Euro 3 or diesel Euro 4 car (or better) pays a €7 fee once; one that does not qualify can use up to 24 day permits a year." },
          { question: "What are the Barcelona low emission zone hours?", answer: "Monday to Friday, 07:00 to 20:00, all year. Outside those hours and at weekends the permanent restriction does not apply." },
          { question: "Can a diesel car enter the Barcelona LEZ?", answer: "Yes if it is Euro 4 or higher, which usually means registered from 2005 or 2006. The Euro level on your registration document is what counts." },
          { question: "How long does LEZ registration take?", answer: "Up to 15 working days; until it is confirmed, the car may not drive in the zone." },
          { question: "What is the fine for driving in without registering?", answer: "According to the AMB, a qualifying vehicle that was not registered can be fined from €200." },
        ]),
        ...paras(verifiedLine("en", ZBE_VERIFIED)),
        ...b2Related(["parking", "transport"], "en"),
      ],
    },
  },
};

/* ========================================================================== */
/* 03 — Street parking                                                        */
/* ========================================================================== */

const PARKING_SOURCES = [
  {
    name: "AREA blava — tarifes ambientals d'estacionament regulat",
    url: "https://areaverda.cat/en/blue",
    publisher: "Barcelona de Serveis Municipals",
  },
  {
    name: "AREA verda — tarifes ambientals d'estacionament regulat",
    url: "https://areaverda.cat/en/green-area",
    publisher: "Barcelona de Serveis Municipals",
  },
  { name: "AREA for non-residents", url: "https://areaverda.cat/en/information/users/non-residents-area", publisher: "Barcelona de Serveis Municipals" },
  { name: "AREA resident-only spaces", url: "https://areaverda.cat/en/information/places/exclusives-residents", publisher: "Barcelona de Serveis Municipals" },
  { name: "Using the parking meters: FAQs", url: "https://areaverda.cat/en/information/using-parking-meters/faqs", publisher: "Barcelona de Serveis Municipals" },
  { name: "AREA procedures: cancelling a parking notice", url: "https://areaverda.cat/en/procedures", publisher: "Barcelona de Serveis Municipals" },
  { name: "SMOU: parking FAQs", url: "https://www.smou.cat/en/faqs/parking-meter", publisher: "Ajuntament de Barcelona" },
  { name: "Regulated parking in the beach zone ends its 2026 season (14.9.2026)", url: "https://areaverda.cat/en/news/regulated-parking-beach-zone-ends-its-2026-season", publisher: "Barcelona de Serveis Municipals" },
  { name: "New Zone 36 regulated parking area in Sant Andreu (22.9.2026)", url: "https://areaverda.cat/en/news/new-zone-36-regulated-parking-area-in-the-sant-andreu-district", publisher: "Barcelona de Serveis Municipals" },
  { name: "AREA Motos", url: "https://areaverda.cat/en/motorcycles", publisher: "Barcelona de Serveis Municipals" },
  { name: "Ordenança fiscal 3.12, estacionament regulat", url: "https://ajuntament.barcelona.cat/hisenda/sites/default/files/normativa/2021-01/3.12-taxes-per-lestacionament-regulat-de-vehicles-a-la-via-publica-area.pdf", publisher: "Ajuntament de Barcelona" },
  { name: "Voreres lliures de motos als accessos d'escoles i hospitals", url: "https://www.barcelona.cat/infobarcelona/ca/tema/mobilitat-i-transports/voreres-lliures-de-motos-als-accessos-descoles-i-hospitals_1491548.html", publisher: "Ajuntament de Barcelona" },
  { name: "Tipos de plazas: Área Verde", url: "https://www.areaverda.cat/es/informacion/tipos-de-plazas/area-verde", publisher: "Barcelona de Serveis Municipals" },
  { name: "Tipos de plazas: Área Azul", url: "https://www.areaverda.cat/es/informacion/tipos-de-plazas/area-azul", publisher: "Barcelona de Serveis Municipals" },
  { name: "Plano AREA (orientativo): plazas azules, verdes y exclusivas para residentes", url: "https://areaverda.cat/es/plano", publisher: "Barcelona de Serveis Municipals" },
  { name: "SMOU: preguntes freqüents (pagament per minuts, avís de 15 minuts)", url: "https://www.smou.cat/en/faqs/parking-meter", publisher: "Ajuntament de Barcelona" },
];

// Re-checked 30 Oct 2026 against areaverda.cat (ES/CA blue and green "tipos
// de plazas" pages, meter FAQs, the Zone 36 news item, the map page) and
// smou.cat: every rate and schedule unchanged. Added from those pages: the
// blue tables' own limits ("Tarifa A (màx. 1h o 2h)", "Tarifa B (màx. 2h)");
// some meters take only cards; the official indicative map
// (areaverda.cat/es/plano, /ca/planol) with blue, green and resident-only
// filters; Zone 36 in Trinitat Vella: 632 green spaces between Passeig de
// Santa Coloma, Avinguda Meridiana and the Trinitat interchange, 231
// motorbike spaces, active from 9 Nov 2026, non-residents 2 hours at most.
// Not printed: the green page's "se incrementa en 2 €/hora el componente
// base" (the page does not say when it applies) and "Tarifa Gremis" (no
// conditions given), and any rule for weekday public holidays outside the
// beach zone (no AREA page states one).
// Re-checked 28 Oct 2026 against areaverda.cat (blue, green-area, the ES
// "tipos de plazas" pages for blue and green, meter FAQs): every rate and
// schedule unchanged. Added from those pages: about 5,400 blue and 57,000
// green spaces in 35 resident zones; Rate A covers high-demand areas such as
// the Eixample and Ciutat Vella; residents parking outside their zone pay the
// non-resident rate; the resident rate applies "de enero a diciembre,
// incluido el mes de agosto"; the council can restrict parking on pollution-
// episode days. Neither page states an August exception for non-residents or
// the colour of the road markings, so the page says neither.
// Re-checked 24 Oct 2026 against areaverda.cat (blue, green-area,
// procedures, meter FAQs, resident-only spaces, beach-season and Zone 36
// news) and smou.cat: every rate, schedule and the €9 cancellation unchanged.
// Added from those pages: resident-only spaces are reserved 8:00-20:00 every
// day (Barceloneta and El Born 24 h), resident tickets run up to 20 working
// days at the meter. Earlier check, 18 Oct 2026, against AREA, SMOU and the fiscal ordinance
// (research_notes/blog-batch-03/parking_area_verda_blava.md): the earlier
// text gave the blue schedule as if it were the green one, said the meter
// prints a windscreen ticket (it no longer does) and left out resident-only
// spaces. Not printed, because no official page states them: the fine if a
// notice is not cancelled, a deadline for the €9 cancellation, August or
// weekday-holiday rules for green spaces, and motorbikes in blue/green bays.
const PARKING_VERIFIED = "2026-10-30";

/**
 * The full label-by-label table.
 *
 * The package gave only the endpoints — 1,25 € to 3,75 € for blue, 1,50 € to
 * 4,25 € for green — which is where every other guide stops. The middle rows
 * are the ones an actual driver needs, because almost nobody is driving a
 * zero-emission car or an unlabelled one: most hire cars are C.
 */
const BLUE_ROWS = [
  ["Zero", "1,25 €", "1,15 €"],
  ["ECO", "2,50 €", "2,25 €"],
  ["C", "3,25 €", "3,00 €"],
  ["B", "3,50 €", "3,25 €"],
  ["Sense distintiu", "3,75 €", "3,50 €"],
];

const GREEN_ROWS = [
  ["Zero", "1,50 €", "1,40 €"],
  ["ECO", "3,00 €", "2,75 €"],
  ["C", "3,75 €", "3,50 €"],
  ["B", "4,00 €", "3,75 €"],
  ["Sense distintiu", "4,25 €", "4,00 €"],
];

const LABEL_HEADERS: Record<string, string[]> = {
  ca: ["Distintiu ambiental", "Tarifa A (€/h)", "Tarifa B (€/h)"],
  es: ["Distintivo ambiental", "Tarifa A (€/h)", "Tarifa B (€/h)"],
  en: ["Environmental label", "Rate A (€/h)", "Rate B (€/h)"],
};

const GREEN_ROWS_EN = GREEN_ROWS.map(([label, a, b]) => [
  label === "Sense distintiu" ? "No label" : (label ?? ""),
  (a ?? "").replace(",", "."),
  (b ?? "").replace(",", "."),
]);
const BLUE_ROWS_EN = BLUE_ROWS.map(([label, a, b]) => [
  label === "Sense distintiu" ? "No label" : (label ?? ""),
  (a ?? "").replace(",", "."),
  (b ?? "").replace(",", "."),
]);
const GREEN_ROWS_ES = GREEN_ROWS.map(([label, a, b]) => [
  label === "Sense distintiu" ? "Sin distintivo" : (label ?? ""),
  a ?? "",
  b ?? "",
]);
const BLUE_ROWS_ES = BLUE_ROWS.map(([label, a, b]) => [
  label === "Sense distintiu" ? "Sin distintivo" : (label ?? ""),
  a ?? "",
  b ?? "",
]);

/**
 * Worked examples, computed from the rate tables above (the city rounds the
 * charge down to 5 cents; two whole hours never need rounding).
 */
function hourly(rows: string[][], label: string, column: 1 | 2): number {
  const row = rows.find((r) => r[0] === label);
  if (!row) throw new Error(`no parking rate for ${label}`);
  return Number((row[column] ?? "").replace(" €", "").replace(",", "."));
}

function parkingEuros(value: number, locale: "ca" | "es" | "en"): string {
  const fixed = value.toFixed(2);
  return locale === "en" ? `€${fixed}` : `${fixed.replace(".", ",")} €`;
}

type ParkingCopy = {
  lead: string;
  summaryTitle: string;
  summaryCaption: string;
  summaryHeaders: string[];
  summaryRows: string[][];
  cheaperTitle: string;
  cheaper: (blueCA: string, greenCA: string) => string;
  ruleTitle: string;
  rule: string;
  /** "When do you pay?": one row per day of the week, from AREA's pages. */
  daysTitle: string;
  daysCaption: string;
  daysHeaders: string[];
  daysRows: string[][];
  daysNote: string;
  /** Zone 36, Trinitat Vella (AREA news item of 22.9.2026). */
  trinitatTitle: string;
  trinitat: string;
  stepsTitle: string;
  steps: { title: string; text: string }[];
  augustTitle: string;
  august: string;
  hoursTitle: string;
  hours: string[];
  blueTitle: string;
  blue: string;
  blueCaption: string;
  greenTitle: string;
  green: string[];
  greenCaption: string;
  tableNote: string;
  costTitle: string;
  cost: (greenC: string, blueEco: string) => string;
  payTitle: string;
  pay: string[];
  fineTitle: string;
  fine: string;
  motoTitle: string;
  moto: string;
  foreignTitle: string;
  foreign: string[];
  carTitle: string;
  car: string;
  faq: { question: string; answer: string }[];
};

const PARKING_COPY: Record<"ca" | "es" | "en", ParkingCopy> = {
  ca: {
    lead: "Aparcar al carrer en zona regulada de Barcelona costa **d'1,15 a 4,25 € l'hora**. La **zona blava** és per a estades curtes de qualsevol conductor: de dilluns a divendres de 9.00 a 20.00 h, d'1,15 a 3,75 € l'hora i normalment 1 o 2 hores com a màxim. La **zona verda** és per als veïns, però els no residents també hi poden aparcar per 1,40 a 4,25 € l'hora, normalment 1 o 2 hores. El preu exacte depèn de la tarifa de la zona (A als barris de més demanda, B a la resta) i del distintiu ambiental del cotxe. El diumenge, fora de la platja, ni la blava ni la verda es paguen.",
    summaryTitle: "Zona blava i zona verda: preu, horari i temps màxim",
    summaryCaption: "Les zones d'aparcament regulat de Barcelona, el 2026",
    summaryHeaders: ["Zona", "Qui hi pot aparcar", "Horari habitual", "Temps màxim", "Preu"],
    summaryRows: [
      ["Blava", "Qualsevol conductor", "Dl–dv, 9.00–20.00 h (dissabtes al centre)", "El del senyal, normalment 1 o 2 h", "1,15–3,75 €/h"],
      ["Verda, no residents", "Visitants i no residents", "Dl–dv o dl–ds, 8.00–20.00 h o 8.00–22.00 h", "El del senyal, normalment 1 o 2 h", "1,40–4,25 €/h"],
      ["Verda, residents", "Veïns autoritzats, a la seva zona", "Dl–dv, 8.00–20.00 h", "Per dies (fins a 20 laborables al parquímetre)", "0,20 €/dia (màx. 1 €/setmana)"],
      ["Exclusiva per a residents", "Només veïns autoritzats", "8.00–20.00 h cada dia; Barceloneta i el Born, 24 h", "—", "—"],
      ["AREA Motos", "Motos", "Tots els dies", "—", "Gratuïta"],
    ],
    cheaperTitle: "Què és més barat, la zona blava o la verda?",
    cheaper: (blueCA, greenCA) =>
      `La blava. Amb el mateix distintiu i la mateixa tarifa, una hora en zona blava costa 0,50 € menys que en zona verda (0,25 € menys amb un cotxe zero emissions): amb distintiu C i tarifa A, **${blueCA}** l'hora a la blava i **${greenCA}** a la verda. Totes dues limiten l'estada, normalment a 1 o 2 hores, així que per deixar el cotxe tot el dia cap de les dues serveix a un visitant.`,
    ruleTitle: "La regla més important",
    rule: "Mana sempre el senyal vertical del tram: l'horari i el temps màxim poden canviar d'un carrer a un altre.",
    daysTitle: "Quan es paga la zona blava i la verda? Horari per dies",
    daysCaption: "Quins dies i hores es paga l'aparcament regulat a Barcelona",
    daysHeaders: ["Dia", "Zona blava", "Zona verda (no residents)", "Places exclusives per a residents"],
    daysRows: [
      ["Dilluns a divendres", "9.00–20.00 h", "8.00–20.00 h o 8.00–22.00 h, segons la zona", "Reservades 8.00–20.00 h"],
      ["Dissabte", "Només al centre de la ciutat", "Només a les zones que funcionen de dilluns a dissabte", "Reservades 8.00–20.00 h"],
      ["Diumenge", "Només a la zona de platja", "No es paga", "Reservades 8.00–20.00 h"],
    ],
    daysNote: "Fora d'aquestes hores s'aparca gratis, llevat que el senyal digui una altra cosa. A la zona de platja, la blava també es paga els festius; des de l'1 d'octubre només hi manté l'horari de set dies el tram de l'avinguda Litoral entre Joan Miró i Jonquera. A la Barceloneta i el Born, les places exclusives per a residents ho són les 24 hores. Font: AREA (B:SM), comprovat el 30 d'octubre de 2026.",
    trinitatTitle: "Zona verda nova a Trinitat Vella (zona 36)",
    trinitat: "El **9 de novembre de 2026** s'activa la zona verda 36, a Trinitat Vella (Sant Andreu): **632 places** noves de zona verda als carrers entre el passeig de Santa Coloma, l'avinguda Meridiana i l'intercanviador de la Trinitat, i 231 places per a motos. Els no residents hi poden aparcar **2 hores com a màxim**, amb la tarifa de zona verda que els toqui pel distintiu ambiental; els veïns empadronats a la zona amb el cotxe donat d'alta a Barcelona paguen la tarifa de resident.",
    stepsTitle: "Com aparcar en zona blava o verda, pas a pas",
    steps: [
      { title: "Llegeix el senyal del tram", text: "El senyal vertical diu quin tipus de plaça és, l'horari i el temps màxim. Si diu que és exclusiva per a residents, no hi pots aparcar. Per veure abans de sortir quines places hi ha a cada carrer, AREA té un [plànol orientatiu](https://areaverda.cat/ca/planol) amb les places blaves, les verdes i les exclusives per a residents." },
      { title: "Treu el tiquet amb la matrícula", text: "Al parquímetre tria el tipus de zona, escriu la matrícula i paga amb targeta o monedes justes (no torna canvi; alguns parquímetres només accepten targeta), o paga amb l'app SMOU. Si el cotxe és elèctric, el parquímetre aplica el descompte en comprovar la matrícula." },
      { title: "No cal deixar res al cotxe", text: "Els agents d'AREA comproven la matrícula de manera electrònica; el rebut imprès és opcional." },
      { title: "Torna abans del temps màxim", text: "SMOU t'avisa 15 minuts abans. El tiquet no es pot renovar a la mateixa zona: quan s'acaba el temps, has de moure el cotxe." },
    ],
    augustTitle: "Es paga la zona verda a l'agost?",
    august: "Sí. AREA aplica la tarifa de residents tot l'any, de gener a desembre, agost inclòs, i les seves pàgines de la zona blava i de la zona verda no preveuen cap excepció d'agost per als no residents: a l'agost es paga amb l'horari i el temps màxim del senyal. En dies d'episodi de contaminació, l'Ajuntament pot limitar les operacions d'estacionament.",
    hoursTitle: "Horari de la zona blava i la zona verda",
    hours: [
      "La **zona blava** es regula normalment de dilluns a divendres de 9.00 a 20.00 h sense pausa al migdia; al centre, també els dissabtes, i a les zones de platja, també diumenges i festius.",
      "La **zona verda** per a no residents funciona de dilluns a divendres o de dilluns a dissabte, de 8.00 a 20.00 h o fins a les 22.00 h segons la zona. Fora de l'horari regulat l'estacionament és lliure, però mana el senyal vertical.",
      "La regulació de platja és de temporada: a Sant Martí va anar de l'1 d'abril al 30 de setembre del 2026, i des de l'1 d'octubre només el tram de l'avinguda Litoral entre Joan Miró i Jonquera manté l'horari de set dies.",
      "**Cap de setmana:** el dissabte només es paga la zona blava del centre i les zones verdes que funcionen de dilluns a dissabte; el diumenge, fora de la platja, ni la blava ni la verda es paguen. Les **places exclusives per a residents**, en canvi, estan reservades de 8.00 a 20.00 h tots els dies, festius inclosos (a la Barceloneta i el Born, les 24 hores).",
    ],
    blueTitle: "Preu de la zona blava a Barcelona",
    blue: "És per a estades curtes de qualsevol conductor (hi ha unes 5.400 places blaves a la ciutat): el temps màxim és el que indica el senyal, **1 o 2 hores a la tarifa A i 2 hores a la tarifa B**. La tarifa A s'aplica a les zones de més demanda, com l'Eixample i Ciutat Vella; la B, a la resta.",
    blueCaption: "AREA Blava, preus per hora el 2026",
    greenTitle: "Com funciona la zona verda a Barcelona",
    green: [
      "La zona verda (unes 57.000 places en 35 zones de residents) prioritza els veïns, però a les seves places hi poden aparcar tant residents com no residents. Si no hi vius, pagues la tarifa de no resident i t'hi pots quedar el temps que indica el senyal, normalment 1 o 2 hores. El que no pots fer és aparcar a les **places exclusives per a residents**: unes 2.900 a Ciutat Vella, els centres històrics de Gràcia i Sarrià, Camp de l'Arpa, el Raval, la Barceloneta, el Born i el Carmel.",
      "Els residents autoritzats paguen 0,20 € al dia, amb un màxim d'1 € la setmana, i només dins de la seva zona: si aparquen fora, paguen com a no residents.",
    ],
    greenCaption: "AREA Verda per a no residents, preus per hora el 2026",
    tableNote: "Font: AREA (B:SM), comprovat el 30 d'octubre de 2026.",
    costTitle: "Quant et costarà",
    cost: (greenC, blueEco) =>
      `Dues hores en zona verda amb tarifa A i un cotxe amb distintiu C costen **${greenC}**. Dues hores en zona blava amb tarifa B i distintiu ECO, **${blueEco}**. Els cotxes elèctrics també han de treure tiquet: paguen la tarifa més baixa, però no és gratis.`,
    payTitle: "Com pagar al parquímetre o amb l'app SMOU",
    pay: [
      "Paga en un parquímetre (tria el tipus de zona, introdueix la matrícula i paga amb targeta o monedes, sense canvi; alguns només accepten targeta) o amb una aplicació autoritzada com SMOU. Ja no cal deixar el tiquet al cotxe: els agents comproven la matrícula digitalment i el rebut imprès és opcional.",
      "Amb SMOU només pagues el temps que fas servir i reps un avís 15 minuts abans del temps màxim. Quan s'acaba el temps màxim has de treure el cotxe: el tiquet no es pot renovar a la mateixa zona.",
    ],
    fineTitle: "Si et passes de temps",
    fine: "Si t'has passat com a màxim la meitat del temps pagat, pots anul·lar l'avís de denúncia amb un pagament especial al parquímetre o a SMOU (opció d'anul·lar denúncia), amb el número que hi ha a baix a la dreta de l'avís groc. Segons AREA, costa 9 €; comprova l'import que et mostri el parquímetre. Si l'avís és per no tenir tiquet, no es pot anul·lar així.",
    motoTitle: "I amb moto?",
    moto: "Les motos tenen places AREA Motos (marques blanques), gratuïtes tots els dies a qualsevol hora. No es poden deixar a la vorera als accessos d'escoles i hospitals ni on quedin menys de 3 metres lliures per als vianants.",
    foreignTitle: "I si vinc amb cotxe estranger?",
    foreign: ["L'aparcament i la ZBE són sistemes diferents."],
    carTitle: "De debò necessites el cotxe?",
    car: "Per a la majoria de visites, no: el metro cobreix el centre i una T-dia dona 24 hores de viatges il·limitats. Mira",
    faq: [
      { question: "Com funciona la zona verda a Barcelona si no hi visc?", answer: "Hi pots aparcar amb la tarifa de no resident, d'1,40 a 4,25 € l'hora, normalment d'1 o 2 hores segons el senyal i de dilluns a divendres o dissabte. No pots aparcar a les places exclusives per a residents." },
      { question: "Quant costa la zona blava a Barcelona?", answer: "D'1,15 a 3,75 € l'hora, segons la tarifa de la zona (A o B) i el distintiu ambiental del cotxe." },
      { question: "Es paga la zona blava i verda el diumenge?", answer: "Normalment no: la blava es regula de dilluns a divendres (i dissabtes al centre) i la verda de dilluns a divendres o dissabte. Algunes places de platja es paguen també diumenges i festius. Mira sempre el senyal." },
      { question: "Què és més barat, la zona blava o la verda?", answer: "La blava: amb el mateix distintiu i la mateixa tarifa, 0,50 € menys l'hora (0,25 € menys amb un cotxe zero emissions)." },
      { question: "Es paga la zona blava el dissabte?", answer: "Només al centre de la ciutat, on la regulació s'amplia al dissabte. A la resta, el dissabte la zona blava és lliure; algunes zones verdes sí que es paguen de dilluns a dissabte. Mira el senyal del tram." },
      { question: "Quin és l'horari de la zona blava a Barcelona?", answer: "De dilluns a divendres de 9.00 a 20.00 h sense interrupció; al centre també el dissabte i a les zones de platja també diumenges i festius. Fora d'aquest horari s'aparca gratis, llevat que el senyal digui una altra cosa." },
      { question: "Quin preu té la zona verda a Barcelona per als no residents?", answer: "D'1,40 a 4,25 € l'hora segons la tarifa (A o B) i el distintiu: amb distintiu C, 3,75 € a la tarifa A i 3,50 € a la B. Els residents autoritzats paguen 0,20 € al dia (màxim 1 € la setmana)." },
      { question: "Es paga la zona verda a l'agost?", answer: "Sí. La tarifa de residents s'aplica tot l'any, agost inclòs, i AREA no preveu cap excepció d'agost per als no residents: es paga amb l'horari del senyal." },
      { question: "Quant temps es pot aparcar a la zona blava de Barcelona?", answer: "El que indica el senyal: a la tarifa A, 1 o 2 hores; a la tarifa B, 2 hores. Quan s'acaba el temps has de moure el cotxe: el tiquet no es pot renovar a la mateixa zona." },
      { question: "Hi ha un mapa de la zona blava i verda de Barcelona?", answer: "Sí: AREA publica un plànol orientatiu a areaverda.cat amb les places blaves, les verdes i les exclusives per a residents de cada carrer. Al carrer, mana el senyal del tram." },
      { question: "On és la zona verda nova de Trinitat Vella?", answer: "És la zona 36: els carrers entre el passeig de Santa Coloma, l'avinguda Meridiana i l'intercanviador de la Trinitat. S'activa el 9 de novembre de 2026 i els no residents hi poden aparcar 2 hores com a màxim." },
    ],
  },
  es: {
    lead: "Aparcar en la calle en zona regulada de Barcelona cuesta **de 1,15 a 4,25 € la hora**. La **zona azul** es para estancias cortas de cualquier conductor: de lunes a viernes de 9:00 a 20:00, de 1,15 a 3,75 € la hora y normalmente 1 o 2 horas como máximo. La **zona verde** es para los vecinos, pero los no residentes también pueden aparcar pagando de 1,40 a 4,25 € la hora, normalmente 1 o 2 horas. El precio exacto depende de la tarifa de la zona (A en los barrios de más demanda, B en el resto) y del distintivo ambiental del coche. El domingo, fuera de la playa, no se paga ni la azul ni la verde.",
    summaryTitle: "Zona azul y zona verde: precio, horario y tiempo máximo",
    summaryCaption: "Las zonas de aparcamiento regulado de Barcelona en 2026",
    summaryHeaders: ["Zona", "Quién puede aparcar", "Horario habitual", "Tiempo máximo", "Precio"],
    summaryRows: [
      ["Azul", "Cualquier conductor", "Lun–vie, 9:00–20:00 (sábados en el centro)", "El de la señal, normalmente 1 o 2 h", "1,15–3,75 €/h"],
      ["Verde, no residentes", "Visitantes y no residentes", "Lun–vie o lun–sáb, 8:00–20:00 u 8:00–22:00", "El de la señal, normalmente 1 o 2 h", "1,40–4,25 €/h"],
      ["Verde, residentes", "Vecinos autorizados, en su zona", "Lun–vie, 8:00–20:00", "Por días (hasta 20 laborables en el parquímetro)", "0,20 €/día (máx. 1 €/semana)"],
      ["Exclusiva para residentes", "Solo vecinos autorizados", "8:00–20:00 todos los días; Barceloneta y El Born, 24 h", "—", "—"],
      ["AREA Motos", "Motos", "Todos los días", "—", "Gratis"],
    ],
    cheaperTitle: "¿Qué es más barato, la zona azul o la verde?",
    cheaper: (blueCA, greenCA) =>
      `La azul. Con el mismo distintivo y la misma tarifa, una hora en zona azul cuesta 0,50 € menos que en zona verde (0,25 € menos con un coche cero emisiones): con distintivo C y tarifa A, **${blueCA}** la hora en azul y **${greenCA}** en verde. Las dos limitan la estancia, normalmente a 1 o 2 horas, así que para dejar el coche todo el día ninguna sirve a un visitante.`,
    ruleTitle: "La regla más importante",
    rule: "Manda siempre la señal vertical del tramo: el horario y el tiempo máximo pueden cambiar de una calle a otra.",
    daysTitle: "¿Cuándo se paga la zona azul y la verde? Horario por días",
    daysCaption: "Qué días y horas se paga el aparcamiento regulado en Barcelona",
    daysHeaders: ["Día", "Zona azul", "Zona verde (no residentes)", "Plazas exclusivas para residentes"],
    daysRows: [
      ["Lunes a viernes", "9:00–20:00", "8:00–20:00 u 8:00–22:00, según la zona", "Reservadas 8:00–20:00"],
      ["Sábado", "Solo en el centro de la ciudad", "Solo en las zonas que funcionan de lunes a sábado", "Reservadas 8:00–20:00"],
      ["Domingo", "Solo en la zona de playa", "No se paga", "Reservadas 8:00–20:00"],
    ],
    daysNote: "Fuera de estas horas se aparca gratis, salvo que la señal diga otra cosa. En la zona de playa, la azul también se paga los festivos; desde el 1 de octubre solo mantiene el horario de siete días el tramo de la avenida Litoral entre Joan Miró y Jonquera. En la Barceloneta y El Born, las plazas exclusivas para residentes lo son las 24 horas. Fuente: AREA (B:SM), comprobado el 30 de octubre de 2026.",
    trinitatTitle: "Zona verde nueva en Trinitat Vella (zona 36)",
    trinitat: "El **9 de noviembre de 2026** se activa la zona verde 36, en Trinitat Vella (Sant Andreu): **632 plazas** nuevas de zona verde en las calles entre el paseo de Santa Coloma, la avenida Meridiana y el intercambiador de la Trinitat, y 231 plazas para motos. Los no residentes pueden aparcar **2 horas como máximo**, con la tarifa de zona verde que les toque por el distintivo ambiental; los vecinos empadronados en la zona con el coche dado de alta en Barcelona pagan la tarifa de residente.",
    stepsTitle: "Cómo aparcar en zona azul o verde, paso a paso",
    steps: [
      { title: "Lee la señal del tramo", text: "La señal vertical dice qué tipo de plaza es, el horario y el tiempo máximo. Si dice que es exclusiva para residentes, no puedes aparcar. Para ver antes de salir qué plazas hay en cada calle, AREA tiene un [plano orientativo](https://areaverda.cat/es/plano) con las plazas azules, las verdes y las exclusivas para residentes." },
      { title: "Saca el tique con la matrícula", text: "En el parquímetro elige el tipo de zona, escribe la matrícula y paga con tarjeta o monedas justas (no devuelve cambio; algunos parquímetros solo aceptan tarjeta), o paga con la app SMOU. Si el coche es eléctrico, el parquímetro aplica el descuento al comprobar la matrícula." },
      { title: "No hace falta dejar nada en el coche", text: "Los agentes de AREA comprueban la matrícula de forma electrónica; el recibo impreso es opcional." },
      { title: "Vuelve antes del tiempo máximo", text: "SMOU te avisa 15 minutos antes. El tique no se puede renovar en la misma zona: cuando se acaba el tiempo, tienes que mover el coche." },
    ],
    augustTitle: "¿Se paga la zona verde en agosto?",
    august: "Sí. AREA aplica la tarifa de residentes todo el año, «de enero a diciembre, incluido el mes de agosto», y sus páginas de la zona azul y de la zona verde no prevén ninguna excepción de agosto para los no residentes: en agosto se paga con el horario y el tiempo máximo de la señal. En días de episodio de contaminación, el Ayuntamiento puede limitar las operaciones de estacionamiento.",
    hoursTitle: "Horario de la zona azul y la zona verde",
    hours: [
      "La **zona azul** se regula normalmente de lunes a viernes de 9:00 a 20:00 sin pausa al mediodía; en el centro, también los sábados, y en las zonas de playa, también domingos y festivos.",
      "La **zona verde** para no residentes funciona de lunes a viernes o de lunes a sábado, de 8:00 a 20:00 o hasta las 22:00 según la zona. Fuera del horario regulado se aparca gratis, pero manda la señal vertical.",
      "La regulación de playa es de temporada: en Sant Martí fue del 1 de abril al 30 de septiembre de 2026, y desde el 1 de octubre solo el tramo de la avenida Litoral entre Joan Miró y Jonquera mantiene el horario de siete días.",
      "**Fin de semana:** el sábado solo se paga la zona azul del centro y las zonas verdes que funcionan de lunes a sábado; el domingo, fuera de la playa, ni la azul ni la verde se pagan. Las **plazas exclusivas para residentes**, en cambio, están reservadas de 8:00 a 20:00 todos los días, festivos incluidos (en la Barceloneta y El Born, las 24 horas).",
    ],
    blueTitle: "Precio de la zona azul en Barcelona",
    blue: "Es para estancias cortas de cualquier conductor (hay unas 5.400 plazas azules en la ciudad): el tiempo máximo es el que indica la señal, **1 o 2 horas en tarifa A y 2 horas en tarifa B**. La tarifa A se aplica en las zonas de más demanda, como el Eixample y Ciutat Vella; la B, en el resto.",
    blueCaption: "AREA Azul, precios por hora en 2026",
    greenTitle: "Cómo funciona la zona verde en Barcelona",
    green: [
      "La zona verde (unas 57.000 plazas en 35 zonas de residentes) prioriza a los vecinos, pero en sus plazas pueden aparcar tanto residentes como no residentes. Si no vives allí, pagas la tarifa de no residente y puedes quedarte el tiempo que indique la señal, normalmente 1 o 2 horas. Lo que no puedes hacer es aparcar en las **plazas exclusivas para residentes**: unas 2.900 en Ciutat Vella, los centros históricos de Gràcia y Sarrià, Camp de l'Arpa, El Raval, la Barceloneta, El Born y El Carmel.",
      "Los residentes autorizados pagan 0,20 € al día, con un máximo de 1 € a la semana, y solo dentro de su zona: si aparcan fuera, pagan como no residentes.",
    ],
    greenCaption: "AREA Verde para no residentes, precios por hora en 2026",
    tableNote: "Fuente: AREA (B:SM), comprobado el 30 de octubre de 2026.",
    costTitle: "Cuánto te costará",
    cost: (greenC, blueEco) =>
      `Dos horas en zona verde con tarifa A y un coche con distintivo C cuestan **${greenC}**. Dos horas en zona azul con tarifa B y distintivo ECO, **${blueEco}**. Los coches eléctricos también tienen que sacar tique: pagan la tarifa más baja, pero no es gratis.`,
    payTitle: "Cómo pagar en el parquímetro o con la app SMOU",
    pay: [
      "Paga en un parquímetro (elige el tipo de zona, introduce la matrícula y paga con tarjeta o monedas, sin cambio; algunos solo aceptan tarjeta) o con una aplicación autorizada como SMOU. Ya no hace falta dejar el tique en el coche: los agentes comprueban la matrícula de forma digital y el recibo impreso es opcional.",
      "Con SMOU solo pagas el tiempo que usas y recibes un aviso 15 minutos antes del tiempo máximo. Cuando se acaba el tiempo máximo tienes que mover el coche: el tique no se puede renovar en la misma zona.",
    ],
    fineTitle: "Si te pasas de tiempo",
    fine: "Si te has pasado como máximo la mitad del tiempo pagado, puedes anular el aviso de denuncia con un pago especial en el parquímetro o en SMOU (opción de anular denuncia), con el número que hay abajo a la derecha del aviso amarillo. Según AREA, cuesta 9 €; comprueba el importe que te muestre el parquímetro. Si el aviso es por no tener tique, no se puede anular así.",
    motoTitle: "¿Y con moto?",
    moto: "Las motos tienen plazas AREA Motos (marcas blancas), gratuitas todos los días a cualquier hora. No se pueden dejar en la acera en los accesos de escuelas y hospitales ni donde queden menos de 3 metros libres para los peatones.",
    foreignTitle: "¿Y si vengo con coche extranjero?",
    foreign: ["El aparcamiento y la ZBE son sistemas diferentes."],
    carTitle: "¿De verdad necesitas el coche?",
    car: "Para la mayoría de visitas, no: el metro cubre el centro y una T-dia da 24 horas de viajes ilimitados. Mira",
    faq: [
      { question: "¿Cómo funciona la zona verde en Barcelona si no vivo allí?", answer: "Puedes aparcar con la tarifa de no residente, de 1,40 a 4,25 € la hora, normalmente 1 o 2 horas según la señal y de lunes a viernes o sábado. No puedes aparcar en las plazas exclusivas para residentes." },
      { question: "¿Cuánto cuesta la zona azul en Barcelona?", answer: "De 1,15 a 3,75 € la hora, según la tarifa de la zona (A o B) y el distintivo ambiental del coche." },
      { question: "¿Se paga la zona azul y verde el domingo?", answer: "Normalmente no: la azul se regula de lunes a viernes (y sábados en el centro) y la verde de lunes a viernes o sábado. Algunas plazas de playa se pagan también domingos y festivos. Mira siempre la señal." },
      { question: "¿Qué es más barato, la zona azul o la verde?", answer: "La azul: con el mismo distintivo y la misma tarifa, 0,50 € menos la hora (0,25 € menos con un coche cero emisiones)." },
      { question: "¿Se paga la zona azul el sábado?", answer: "Solo en el centro de la ciudad, donde la regulación se amplía al sábado. En el resto, el sábado la zona azul es gratis; algunas zonas verdes sí se pagan de lunes a sábado. Mira la señal del tramo." },
      { question: "¿Cuál es el horario de la zona azul en Barcelona?", answer: "De lunes a viernes de 9:00 a 20:00 sin interrupción; en el centro también los sábados y en las zonas de playa también domingos y festivos. Fuera de ese horario se aparca gratis, salvo que la señal diga otra cosa." },
      { question: "¿Cuánto vale la zona verde en Barcelona?", answer: "Para no residentes, de 1,40 a 4,25 € la hora según la tarifa (A o B) y el distintivo: con distintivo C, 3,75 € en tarifa A y 3,50 € en tarifa B. Los residentes autorizados pagan 0,20 € al día (máximo 1 € a la semana)." },
      { question: "¿Se paga la zona verde en agosto?", answer: "Sí. La tarifa de residentes se aplica todo el año, agosto incluido, y AREA no prevé ninguna excepción de agosto para los no residentes: se paga con el horario de la señal." },
      { question: "¿Cuánto tiempo se puede aparcar en zona azul en Barcelona?", answer: "El que indica la señal: en tarifa A, 1 o 2 horas; en tarifa B, 2 horas. Cuando se acaba el tiempo tienes que mover el coche: el tique no se puede renovar en la misma zona." },
      { question: "¿Hay un mapa de la zona azul y verde de Barcelona?", answer: "Sí: AREA publica un plano orientativo en areaverda.cat con las plazas azules, las verdes y las exclusivas para residentes de cada calle. En la calle, manda la señal del tramo." },
      { question: "¿Dónde está la nueva zona verde de Trinitat Vella?", answer: "Es la zona 36: las calles entre el paseo de Santa Coloma, la avenida Meridiana y el intercambiador de la Trinitat. Se activa el 9 de noviembre de 2026 y los no residentes pueden aparcar 2 horas como máximo." },
    ],
  },
  en: {
    lead: "Regulated street parking in Barcelona costs **€1.15 to €4.25 an hour**. **Blue** spaces are for short stays by anyone: Monday to Friday, 9:00 to 20:00, €1.15 to €3.75 an hour, usually for 1 or 2 hours at most. **Green** spaces are for residents, but non-residents can park there too for €1.40 to €4.25 an hour, usually for 1 or 2 hours. The exact price depends on the zone's rate (A in the busiest districts, B elsewhere) and your car's environmental label. On Sundays, away from the beach, neither blue nor green spaces are charged.",
    summaryTitle: "Blue vs green zone: price, hours and maximum stay",
    summaryCaption: "Barcelona's regulated parking zones in 2026",
    summaryHeaders: ["Zone", "Who can park", "Usual hours", "Maximum stay", "Price"],
    summaryRows: [
      ["Blue", "Any driver", "Mon–Fri, 9:00–20:00 (Saturdays in the centre)", "As signed, usually 1 or 2 h", "€1.15–3.75/h"],
      ["Green, non-residents", "Visitors and non-residents", "Mon–Fri or Mon–Sat, 8:00–20:00 or 8:00–22:00", "As signed, usually 1 or 2 h", "€1.40–4.25/h"],
      ["Green, residents", "Authorised residents, in their own zone", "Mon–Fri, 8:00–20:00", "By the day (up to 20 working days at the meter)", "€0.20/day (max €1/week)"],
      ["Resident-only", "Authorised residents only", "8:00–20:00 every day; Barceloneta and El Born, 24 h", "—", "—"],
      ["AREA Motos", "Motorbikes", "Every day", "—", "Free"],
    ],
    cheaperTitle: "Which is cheaper, blue or green?",
    cheaper: (blueCA, greenCA) =>
      `Blue. For the same label and the same rate, an hour in a blue space costs €0.50 less than in a green one (€0.25 less for a zero-emission car): with a C label on Rate A it is **${blueCA}** an hour in blue and **${greenCA}** in green. Both limit your stay, usually to 1 or 2 hours, so neither works for a visitor who wants to leave the car all day.`,
    ruleTitle: "The rule that matters most",
    rule: "The vertical sign for that stretch of street always wins: hours and the maximum stay change from street to street.",
    daysTitle: "When do you pay? Blue and green zone hours by day",
    daysCaption: "Which days and hours regulated parking is charged in Barcelona",
    daysHeaders: ["Day", "Blue zone", "Green zone (non-residents)", "Resident-only spaces"],
    daysRows: [
      ["Monday to Friday", "9:00–20:00", "8:00–20:00 or 8:00–22:00, depending on the area", "Reserved 8:00–20:00"],
      ["Saturday", "Only in the city centre", "Only in areas that run Monday to Saturday", "Reserved 8:00–20:00"],
      ["Sunday", "Only in the beach zone", "Not charged", "Reserved 8:00–20:00"],
    ],
    daysNote: "Outside these hours parking is free unless the sign says otherwise. In the beach zone, blue spaces are also charged on public holidays; since 1 October only the Avinguda Litoral stretch between Joan Miró and Jonquera keeps the seven-day schedule. In Barceloneta and El Born, resident-only spaces are reserved 24 hours. Source: AREA (B:SM), checked on 30 October 2026.",
    trinitatTitle: "New green zone in Trinitat Vella (Zone 36)",
    trinitat: "On **9 November 2026** green Zone 36 goes live in Trinitat Vella (Sant Andreu): **632 new green spaces** on the streets between Passeig de Santa Coloma, Avinguda Meridiana and the Trinitat interchange, plus 231 motorbike spaces. Non-residents can park for **2 hours at most**, at the green rate for their car's environmental label; residents registered in the zone with a Barcelona-registered car pay the resident rate.",
    stepsTitle: "How to park in a blue or green space, step by step",
    steps: [
      { title: "Read the sign for that stretch", text: "The vertical sign tells you the type of space, the hours and the maximum stay. If it says the space is for residents only, you cannot park there. To see which spaces each street has before you set off, AREA publishes an [indicative map](https://areaverda.cat/es/plano) with blue, green and resident-only spaces." },
      { title: "Buy the ticket with your number plate", text: "At the meter, choose the zone type, type your plate and pay by card or exact coins (no change given; some meters take cards only), or pay in the SMOU app. For an electric car, the meter applies the discount when it checks the plate." },
      { title: "Leave nothing in the car", text: "AREA officers check the number plate electronically; the printed receipt is optional." },
      { title: "Be back before the maximum stay", text: "SMOU warns you 15 minutes before. The ticket cannot be renewed in the same area: when the time is up, you have to move the car." },
    ],
    augustTitle: "Do you pay for green zones in August?",
    august: "Yes. AREA charges the resident rate all year round, from January to December including August, and its blue and green zone pages make no August exception for non-residents: in August you pay by the hours and maximum stay on the sign. On days when a pollution episode is declared, the City Council can restrict parking transactions.",
    hoursTitle: "Blue and green zone hours",
    hours: [
      "**Blue** spaces are normally regulated Monday to Friday, 9:00 to 20:00 with no midday break; in the city centre also on Saturdays, and in beach zones also on Sundays and public holidays.",
      "**Green** spaces for non-residents run Monday to Friday or Monday to Saturday, from 8:00 to 20:00 or to 22:00 depending on the area. Outside the regulated hours parking is free, but the sign on the street is what counts.",
      "Beach regulation is seasonal: in Sant Martí it ran from 1 April to 30 September 2026, and since 1 October only the Avinguda Litoral stretch between Joan Miró and Jonquera keeps the seven-day schedule.",
      "**Weekends:** on Saturdays you pay only in blue spaces in the centre and in green areas that run Monday to Saturday; on Sundays, away from the beach, neither blue nor green spaces are charged. **Resident-only spaces**, though, are reserved 8:00 to 20:00 every day including public holidays (24 hours in Barceloneta and El Born).",
    ],
    blueTitle: "Blue zone prices in Barcelona",
    blue: "Blue spaces are for short stays by any driver (there are about 5,400 of them in the city): the maximum stay is what the sign says, **1 or 2 hours on Rate A and 2 hours on Rate B**. Rate A applies in high-demand areas such as the Eixample and Ciutat Vella; Rate B everywhere else.",
    blueCaption: "AREA Blue, hourly prices in 2026",
    greenTitle: "How green zones work in Barcelona",
    green: [
      "Green spaces (about 57,000 in 35 resident zones) give residents priority, but both residents and non-residents can park in them. If you do not live there, you pay the non-resident rate and can stay as long as the sign says, usually 1 or 2 hours. What visitors cannot use are the **resident-only spaces**: about 2,900 of them in Ciutat Vella, the historic centres of Gràcia and Sarrià, Camp de l'Arpa, El Raval, Barceloneta, El Born and El Carmel.",
      "Authorised residents pay €0.20 a day, capped at €1 a week, and only inside their own zone: outside it they pay the non-resident rate.",
    ],
    greenCaption: "AREA Green for non-residents, hourly prices in 2026",
    tableNote: "Source: AREA (B:SM), checked on 30 October 2026.",
    costTitle: "What it will cost you",
    cost: (greenC, blueEco) =>
      `Two hours in a green space on Rate A with a C-label car cost **${greenC}**. Two hours in a blue space on Rate B with an ECO label, **${blueEco}**. Electric cars still need a ticket: they pay the lowest rate, but parking is not free.`,
    payTitle: "How to pay: parking meter or the SMOU app",
    pay: [
      "Pay at a parking meter (choose the zone type, type your number plate, pay by card or exact coins; some meters take cards only) or with an authorised app such as SMOU. You no longer need to leave a paper ticket in the car: enforcement officers check your plate digitally, and a printed receipt is optional.",
      "With SMOU you pay only for the time you use, and you get a warning 15 minutes before the maximum stay. When the maximum is up you have to move the car: the ticket cannot be renewed in the same area.",
    ],
    fineTitle: "If you overstay",
    fine: "If you went over by no more than half the time you paid for, you can cancel the parking notice with a special payment at a meter or in SMOU (the cancel-a-fine option), using the number at the bottom right of the yellow notice. AREA puts the fee at €9; check the amount the meter shows. A notice for having no ticket at all cannot be cancelled this way.",
    motoTitle: "On a motorbike?",
    moto: "Motorbikes have AREA Motos bays (white markings), free every day at any hour. Do not leave one on the pavement at school or hospital entrances, or where less than 3 metres is left for pedestrians.",
    foreignTitle: "Driving in with a foreign car?",
    foreign: ["Parking and the low-emission zone are separate systems."],
    carTitle: "Do you need a car at all?",
    car: "For most visits the answer is no: the metro covers the centre, and a T-dia gives 24 hours of unlimited travel. See",
    faq: [
      { question: "Can visitors park in green zones in Barcelona?", answer: "Yes, at the non-resident rate of €1.40 to €4.25 an hour, usually for 1 or 2 hours as the sign says, Monday to Friday or Saturday. Visitors cannot use resident-only spaces." },
      { question: "How much is blue zone parking in Barcelona?", answer: "From €1.15 to €3.75 an hour, depending on the zone's rate (A or B) and your car's environmental label; zero-emission cars pay least." },
      { question: "Is street parking free on Sundays in Barcelona?", answer: "Usually yes for visitors. Blue spaces are regulated Monday to Friday (plus Saturdays in the centre, and Sundays and holidays in some beach spaces); green spaces Monday to Friday or Monday to Saturday. Check the sign." },
      { question: "Which is cheaper in Barcelona, blue or green zone parking?", answer: "Blue: for the same label and rate it costs €0.50 less an hour (€0.25 less for a zero-emission car)." },
      { question: "Do you pay for blue zone parking on Saturdays?", answer: "Only in the city centre, where regulation extends to Saturdays. Elsewhere blue spaces are free on Saturdays, but some green areas are charged Monday to Saturday. Check the sign for that stretch." },
      { question: "What are the blue zone hours in Barcelona?", answer: "Monday to Friday, 9:00 to 20:00 without a break; in the centre also on Saturdays, and in beach areas also on Sundays and public holidays. Outside those hours parking is free unless the sign says otherwise." },
      { question: "How much is green zone parking in Barcelona?", answer: "For non-residents, €1.40 to €4.25 an hour depending on the rate (A or B) and the label: with a C label, €3.75 on Rate A and €3.50 on Rate B. Authorised residents pay €0.20 a day (capped at €1 a week)." },
      { question: "Do you pay for green zones in August?", answer: "Yes. The resident rate applies all year, August included, and AREA makes no August exception for non-residents: you pay by the hours on the sign." },
      { question: "How long can you park in a blue zone in Barcelona?", answer: "As long as the sign says: 1 or 2 hours on Rate A, 2 hours on Rate B. When the time is up you have to move the car: the ticket cannot be renewed in the same area." },
      { question: "Is there a map of Barcelona's blue and green zones?", answer: "Yes: AREA publishes an indicative map on areaverda.cat showing blue, green and resident-only spaces street by street. On the street, the sign for that stretch is what counts." },
      { question: "Where is the new green zone in Trinitat Vella?", answer: "It is Zone 36: the streets between Passeig de Santa Coloma, Avinguda Meridiana and the Trinitat interchange. It goes live on 9 November 2026 and non-residents can park for 2 hours at most." },
    ],
  },
};

function parkingBody(locale: "ca" | "es" | "en"): Block[] {
  const t = PARKING_COPY[locale];
  const blue = locale === "en" ? BLUE_ROWS_EN : locale === "es" ? BLUE_ROWS_ES : BLUE_ROWS;
  const green = locale === "en" ? GREEN_ROWS_EN : locale === "es" ? GREEN_ROWS_ES : GREEN_ROWS;
  const greenC = parkingEuros(2 * hourly(GREEN_ROWS, "C", 1), locale);
  const blueEco = parkingEuros(2 * hourly(BLUE_ROWS, "ECO", 2), locale);
  const blueCA = parkingEuros(hourly(BLUE_ROWS, "C", 1), locale);
  const greenCA = parkingEuros(hourly(GREEN_ROWS, "C", 1), locale);
  const zbe = { ca: "el registre del vehicle estranger", es: "el registro del vehículo extranjero", en: "the foreign-vehicle register" }[locale];
  const zbeLead = { ca: "Abans de circular per la zona de baixes emissions, comprova", es: "Antes de circular por la zona de bajas emisiones, comprueba", en: "Before driving into the zone, check" }[locale];
  const passes = { ca: "quina targeta de transport et convé", es: "qué tarjeta de transporte te conviene", en: "which pass to buy" }[locale];
  return [
    lead(t.lead),
    ...h2(t.summaryTitle),
    table(t.summaryCaption, t.summaryHeaders, t.summaryRows, t.tableNote),
    ...h2(t.daysTitle),
    table(t.daysCaption, t.daysHeaders, t.daysRows, t.daysNote),
    callout("warning", t.ruleTitle, t.rule),
    steps(t.stepsTitle, t.steps),
    ...h2(t.hoursTitle, ...t.hours),
    ...h2(t.blueTitle, t.blue),
    table(t.blueCaption, LABEL_HEADERS[locale] ?? [], blue, t.tableNote),
    ...h2(t.greenTitle, ...t.green),
    table(t.greenCaption, LABEL_HEADERS[locale] ?? [], green, t.tableNote),
    ...h2(t.trinitatTitle, t.trinitat),
    ...h2(t.augustTitle, t.august),
    ...h2(t.cheaperTitle, t.cheaper(blueCA, greenCA)),
    ...h2(t.costTitle, t.cost(greenC, blueEco)),
    ...h2(t.payTitle, ...t.pay),
    ...h2(t.fineTitle, t.fine),
    ...h2(t.motoTitle, t.moto),
    ...h2(t.foreignTitle, ...t.foreign, `${zbeLead} ${b2link("zbe", locale, zbe)}.`),
    ...h2(t.carTitle, `${t.car} ${b2link("transport", locale, passes)}.`),
    faq(t.faq),
    ...paras(verifiedLine(locale, PARKING_VERIFIED)),
    ...b2Related(["zbe", "transport", "airport"], locale),
  ];
}

export const PARKING: B2Article = {
  key: "parking",
  entryKey: "guide-barcelona-street-parking",
  categoryKey: "public-services",
  sources: PARKING_SOURCES,
  heroKey: "b2-parking-carrer-barcelona",
  secondaryKey: "b2-parking-diagonal-barcelona",
  secondaryAlt: {
    ca: "L'avinguda Diagonal de Barcelona amb trànsit i cotxes aparcats",
    es: "La avenida Diagonal de Barcelona con tráfico y coches aparcados",
    en: "Barcelona's Avinguda Diagonal with traffic and parked cars",
  },
  secondaryCaption: {
    ca: "La tarifa A s'aplica als barris de més demanda; la B, a la resta de zones regulades.",
    es: "La tarifa A se aplica a los barrios de más demanda; la B, al resto de zonas reguladas.",
    en: "Rate A applies in the highest-demand districts, rate B everywhere else regulated.",
  },
  heroAlt: {
    ca: "Cotxes aparcats al llarg d'un carrer de l'Eixample de Barcelona",
    es: "Coches aparcados a lo largo de una calle del Eixample de Barcelona",
    en: "Cars parked along a street in Barcelona's Eixample",
  },
  heroCaption: {
    ca: "El preu de la plaça depèn de la zona i del distintiu ambiental del vehicle.",
    es: "El precio de la plaza depende de la zona y del distintivo ambiental del vehículo.",
    en: "What a space costs depends on the zone and on your car's environmental label.",
  },
  verifiedAt: PARKING_VERIFIED,
  publishedAt: "2026-09-29T11:20:00+02:00",
  editions: {
    ca: {
      path: "guies/aparcar-barcelona-zona-blava-verda",
      title:
        "Preu de la zona blava i la zona verda de Barcelona el 2026: horari i com funcionen",
      seoTitle: "Preu zona blava i verda Barcelona: 1,15-4,25 €/h i horari",
      seoDescription:
        "Zona blava: dl-dv 9-20 h, 1,15-3,75 €/h, màx. 1-2 h. Zona verda per a no residents: 1,40-4,25 €/h. Diumenge gratis fora de la platja. Mapa i com pagar.",
      excerpt:
        "Els preus de l'aparcament regulat depenen de la zona i del distintiu ambiental del vehicle. Taula completa de 2026.",
      blocks: parkingBody("ca"),
    },

    es: {
      path: "guias/aparcar-barcelona-zona-azul-verde",
      title: "Cómo funciona la zona verde y la zona azul en Barcelona: horario y precio 2026",
      seoTitle: "Zona azul y verde Barcelona: cómo funciona, horario y precio",
      seoDescription:
        "Zona azul: lun-vie 9-20 h, 1,15-3,75 €/h, máx. 1-2 h. Zona verde: no residentes 1,40-4,25 €/h. Domingo gratis fuera de la playa. Mapa y cómo pagar.",
      excerpt:
        "Las tarifas del aparcamiento regulado dependen de la zona y del distintivo ambiental. Tabla completa de 2026.",
      blocks: parkingBody("es"),
    },

    en: {
      path: "guides/parking-in-barcelona-blue-green-zones",
      title: "Parking in Barcelona: blue zones, green zones, prices and visitor rules",
      seoTitle: "Barcelona street parking prices: €1.15 to €4.25 an hour",
      seoDescription:
        "Blue zone €1.15–3.75/h and green zone €1.40–4.25/h, depending on your car's environmental label. Full rate table, time limits and how to pay.",
      excerpt:
        "Regulated parking is priced by zone and by your car's environmental label. The full 2026 table.",
      blocks: parkingBody("en"),
    },
  },
};

/** Cross-link into the existing tourist tax guide, used by the publisher. */
export const TAX_LINK: Record<string, string> = {
  ca: link("traps", "ca", "Barcelona sense trampes per a turistes"),
  es: link("traps", "es", "Barcelona sin trampas para turistas"),
  en: link("traps", "en", "Barcelona without the tourist traps"),
};
