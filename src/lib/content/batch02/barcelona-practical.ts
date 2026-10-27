import type { Block } from "@/lib/content/blocks";
import { link } from "@/lib/content/features/shared";
import { SOURCES as TMB_SOURCES, TICKETS, VERIFIED_AT } from "@/lib/content/transport-cards/rates";

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
    title: "What it costs for 1 to 5 days",
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

// T-casual fares for zones 1-7: ATM's T-casual page, visible table, read
// 23 Oct 2026 (the same page keeps the 2025 fares in a collapsed accordion).
// Only zone 1 is in TICKETS, which drives the calculator.
const ZONE_FARES: string[][] = [["1", "13,00 €"], ["2", "25,50 €"], ["3", "34,70 €"], ["4", "44,65 €"], ["5", "51,20 €"], ["6", "54,45 €"], ["7", "57,60 €"]];

export const TRANSPORT: B2Article = {
  key: "transport",
  entryKey: "guide-barcelona-transport-passes",
  categoryKey: "public-services",
  sources: [
    ...TMB_SOURCES,
    { name: "T-casual", url: "https://www.atm.cat/en/titols-tarifes/titols-i-tarifes/t-casual", publisher: "Autoritat del Transport Metropolità" },
    { name: "Mapa de zones tarifàries", url: "https://www.tmb.cat/ca/tarifes-metro-bus-barcelona/mapa-zones", publisher: "TMB" },
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
        "T-casual, T-dia, T-usual o Hola Barcelona: quina targeta de transport et convé?",
      seoTitle: "T-casual Barcelona 2026: preu per zones i Hola BCN",
      seoDescription:
        "T-casual: 13 € (1 zona), 25,50 € (2) i 34,70 € (3). On no val, transbordaments i quan surt més a compte la T-dia o la Hola Barcelona.",
      excerpt:
        "La targeta pensada per a turistes no sempre és la més barata. Compara els títols segons els dies, els trajectes i l'aeroport.",
      blocks: [
        lead(
          "Barcelona té diverses targetes de transport i **la més turística no sempre és la més barata**. El 2026, una T-casual d'una zona costa 13 €, la T-dia 12 € i la T-usual 22,80 €. La Hola Barcelona ofereix viatges il·limitats durant períodes consecutius d'entre 24 i 120 hores.",
        ),
        ...paras("La diferència important és què necessites fer."),
        callout(
          "info",
          "Resposta ràpida",
          "Si faràs pocs trajectes, compara primer la T-casual. Si vols viatges il·limitats durant 24 hores, la T-dia és especialment interessant. Per a estades llargues, la T-usual pot tenir molt sentit. La Hola Barcelona prioritza la simplicitat i inclou el metro de l'aeroport.",
        ),
        { type: "transportPasses" } as Block,
        ...h2(
          "T-casual: preu per zones",
          "La T-casual val per a **deu viatges integrats** en tots els modes de transport. Costa **13 €** en una zona, **25,50 €** en dues i **34,70 €** en tres.",
        ),
        table("Preu de la T-casual per zones, 2026", ["Zones", "Preu (10 viatges)"], ZONE_FARES, "Font: ATM, Autoritat del Transport Metropolità. Barcelona i el Prat de Llobregat són a la zona 1."),
        ...paras(
          "**Quantes zones necessites?** Compta el sector tarifari d'on surts i el d'arribada: per anar de Barcelona (zona 1) a Sabadell (zona 2C) cal un títol de 2 zones, segons TMB. Cada viatge permet fins a 3 transbordaments en 75 minuts en una zona, 15 minuts més per cada zona addicional. La T-casual en targeta de cartró T-mobilitat costa 1 € més.",
        ),
        ...h2(
          "T-casual: 10 viatges",
          "La T-casual costa **13 € per una zona** i permet deu viatges.",
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
          "Hola Barcelona",
          "Hola Barcelona ofereix viatges il·limitats durant 24, 48, 72, 96 o 120 hores consecutives.",
          "Inclou metro i bus de TMB, NitBus, FGC zona 1, tramvia, Rodalies zona 1 i el funicular de Montjuïc. També inclou l'anada i tornada en metro entre l'aeroport i Barcelona. El Telefèric de Montjuïc no hi està inclòs.",
          "És especialment útil per a qui prefereix no comptar trajectes.",
        ),
        // Fares from TMB's own Hola Barcelona site, checked 12 Oct 2026.
        callout(
          "official",
          "Preu de la Hola Barcelona",
          `Al web de TMB (holabarcelona.com), a preu complet: 12,50 € (24 h), 18,70 € (48 h), 27,30 € (72 h), 35,60 € (96 h) i 43,60 € (120 h); TMB anuncia un 10 % de descompte en línia. Si dubtes entre aquesta i la Barcelona Card, mira ${b2link("cards", "ca", "quina surt a compte")}.`,
        ),
        ...daysBlocks("ca"),
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
        ...paras(
          `Si has vingut amb cotxe, mira també ${b2link("zbe", "ca", "què cal fer amb un vehicle estranger a la ZBE")} i ${b2link("parking", "ca", "com funcionen la zona blava i la verda")}.`,
          `Si hi ha una vaga convocada, consulta ${b2link("strikes", "ca", "què funciona els dies de vaga")}: hi afegim els serveis mínims oficials de metro, bus i Rodalies quan es publiquen.`,
        ),
        ...paras(verifiedLine("ca", VERIFIED_AT)),
        ...b2Related(["airport", "zbe", "parking", "girona", "montserratFree"], "ca"),
      ],
    },

    es: {
      path: "guias/tarjetas-transporte-barcelona",
      title:
        "T-casual, T-dia, T-usual o Hola Barcelona: qué tarjeta de transporte te conviene",
      seoTitle: "T-casual Barcelona 2026: precio por zonas y Hola BCN",
      seoDescription:
        "T-casual: 13 € (1 zona), 25,50 € (2) y 34,70 € (3). Dónde no vale, transbordos y cuándo compensa más la T-dia o la Hola Barcelona.",
      excerpt:
        "La tarjeta dirigida a turistas no siempre es la más barata. Compara los títulos según días, trayectos y aeropuerto.",
      blocks: [
        lead(
          "La T-casual cuesta 13 € en una zona, 25,50 € en dos y 34,70 € en tres, y da diez viajes integrados en metro, bus, tranvía y tren. No vale en las estaciones Aeroport T1 y T2 de la L9 Sud, y la tarjeta para turistas, la Hola Barcelona, **no siempre es la más barata**.",
        ),
        ...paras(
          "En 2026, la T-casual de una zona cuesta 13 €, la T-dia 12 € y la T-usual 22,80 €. Hola Barcelona ofrece viajes ilimitados durante periodos consecutivos de 24 a 120 horas.",
        ),
        callout(
          "info",
          "Respuesta rápida",
          "T-casual para pocos desplazamientos; T-dia para un día de uso intensivo; T-usual para estancias largas; Hola Barcelona para quien valore especialmente los viajes ilimitados y el metro del aeropuerto.",
        ),
        { type: "transportPasses" } as Block,
        ...h2(
          "T-casual: precio por zonas",
          "La T-casual sirve para **diez viajes integrados** en todos los modos de transporte. Cuesta **13 €** en una zona, **25,50 €** en dos y **34,70 €** en tres.",
        ),
        table("Precio de la T-casual por zonas, 2026", ["Zonas", "Precio (10 viajes)"], ZONE_FARES, "Fuente: ATM, Autoritat del Transport Metropolità. Barcelona y El Prat de Llobregat están en la zona 1."),
        ...paras(
          "**¿Cuántas zonas necesitas?** Cuenta el sector tarifario de salida y el de llegada: para ir de Barcelona (zona 1) a Sabadell (zona 2C) hace falta un título de 2 zonas, según TMB. Cada viaje permite hasta 3 transbordos en 75 minutos en una zona, 15 minutos más por cada zona adicional. La T-casual en tarjeta de cartón T-mobilitat cuesta 1 € más.",
        ),
        ...h2(
          "T-casual: diez viajes",
          "La **T-casual** cuesta 13 € en una zona e incluye diez viajes, pero no es válida en las estaciones Aeroport T1 y Aeroport T2 de L9 Sud.",
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
          "Hola Barcelona",
          "**Hola Barcelona** funciona durante 24, 48, 72, 96 o 120 horas e incluye metro, bus TMB, NitBus, FGC zona 1, tranvía y Rodalies zona 1, además del funicular de Montjuïc y el metro del aeropuerto. El Teleférico de Montjuïc no está incluido.",
        ),
        callout(
          "official",
          "Precio de la Hola Barcelona",
          `En la web de TMB (holabarcelona.com), a precio completo: 12,50 € (24 h), 18,70 € (48 h), 27,30 € (72 h), 35,60 € (96 h) y 43,60 € (120 h); TMB anuncia un 10 % de descuento en línea. Si dudas entre esta y la Barcelona Card, mira ${b2link("cards", "es", "cuál compensa")}.`,
        ),
        ...daysBlocks("es"),
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
        ...paras(
          `Si has venido en coche, mira también ${b2link("zbe", "es", "qué hacer con un vehículo extranjero en la ZBE")} y ${b2link("parking", "es", "cómo funcionan la zona azul y la verde")}.`,
          `Si hay una huelga convocada, consulta ${b2link("strikes", "es", "qué funciona los días de huelga")}: añadimos los servicios mínimos oficiales de metro, bus y Rodalies cuando se publican.`,
        ),
        ...paras(verifiedLine("es", VERIFIED_AT)),
        ...b2Related(["airport", "zbe", "parking", "girona", "montserratFree"], "es"),
      ],
    },

    en: {
      path: "guides/barcelona-transport-passes",
      title:
        "T-casual, T-dia, T-usual or Hola Barcelona: which transport pass should you buy?",
      seoTitle: "Barcelona transport pass for 1 to 5 days: 2026 prices",
      seoDescription:
        "Compare T-casual, T-dia, T-usual and Hola Barcelona by days, journeys and whether you need the airport metro. With a selector.",
      excerpt:
        "The obvious tourist card is not automatically the cheapest. Compare the passes by days, journeys and airport use.",
      blocks: [
        lead(
          "Barcelona's ticket system can be confusing because the obvious tourist product is **not automatically the cheapest option for every trip**.",
        ),
        ...paras(
          "In 2026, a one-zone T-casual costs €13, a T-dia €12 and a T-usual €22.80. Hola Barcelona provides unlimited transport for consecutive periods from 24 to 120 hours.",
        ),
        callout(
          "info",
          "Quick answer",
          "Look at T-casual for light public-transport use, T-dia for one intensive day, T-usual for longer stays, and Hola Barcelona if unlimited travel and airport metro access matter most.",
        ),
        { type: "transportPasses" } as Block,
        ...h2(
          "T-casual: ten journeys",
          "The **T-casual** gives you ten journeys for €13 in one zone, but it cannot be used through the L9 Sud airport metro gates at T1 or T2.",
          "It is one person per journey: it is not tied to a name, but it cannot be used by more than one person at the same time.",
        ),
        ...h2(
          "T-dia: 24 unlimited hours",
          "The **T-dia** costs €12 in one zone and gives unlimited travel for 24 hours from first validation.",
          "It includes one outbound and one return airport metro journey.",
        ),
        ...h2(
          "T-usual: the one most visitors overlook",
          "The **T-usual** costs €22.80 in one zone and gives unlimited travel for 30 consecutive days.",
          "It is personal and non-transferable, and it is valid through the T1 and T2 airport metro stations.",
        ),
        ...h2(
          "Hola Barcelona",
          "The **Hola Barcelona Travel Card** offers unlimited travel for 24, 48, 72, 96 or 120 hours and covers TMB metro and buses, NitBus, the Montjuïc funicular, FGC zone 1, the tram and Rodalies zone 1. Airport metro travel is included; the Montjuïc Cable Car is not.",
        ),
        callout(
          "official",
          "Hola Barcelona prices",
          `On TMB's own Hola Barcelona site (holabarcelona.com), full price: €12.50 (24 h), €18.70 (48 h), €27.30 (72 h), €35.60 (96 h) and €43.60 (120 h); TMB advertises 10% off online. Torn between this and the Barcelona Card? See ${b2link("cards", "en", "which one is worth it")}.`,
        ),
        ...daysBlocks("en"),
        ...h2("Where to start looking"),
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
        ...paras(
          `Driving in? See ${b2link("zbe", "en", "what foreign-registered cars must do first")} and ${b2link("parking", "en", "how the blue and green parking zones work")}.`,
          `If a strike has been called, check ${b2link("strikes", "en", "what runs on strike days")}: we add the official minimum services for the metro, buses and Rodalies as they are published.`,
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
const ZBE_VERIFIED = "2026-10-23";

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
      title: "ZBE de Barcelona: què has de fer si vens amb un vehicle estranger",
      seoTitle: "ZBE Barcelona amb cotxe estranger: registre, preu i horari",
      seoDescription:
        "Els vehicles amb matrícula estrangera s'han de registrar abans de circular per la ZBE de Barcelona. Requisits, terminis i autoritzacions esporàdiques.",
      excerpt:
        "Amb matrícula estrangera cal registrar-se abans de circular per la ZBE. La comprovació ordinària pot trigar fins a 15 dies hàbils.",
      blocks: [
        lead(
          "Per circular per la ZBE de Barcelona amb un cotxe de matrícula estrangera l'has d'inscriure abans al Registre metropolità de l'AMB, perquè els vehicles estrangers no tenen etiqueta de la DGT. Si compleix els requisits (gasolina Euro 3, dièsel Euro 4) la inscripció costa 7 € una sola vegada; si no, pots demanar fins a 24 autoritzacions diàries l'any a 5 € cadascuna. La zona funciona de dilluns a divendres de 7:00 a 20:00.",
        ),
        ...paras(
          "**Tots els vehicles amb matrícula estrangera s'han d'inscriure al Registre metropolità per circular per les ZBE de la metròpolis de Barcelona.** La comprovació ordinària dels requisits ambientals pot trigar fins a **15 dies hàbils**.",
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
          { label: "Última verificació", value: "23 d'octubre de 2026" },
        ]),
        ...h2(
          "Quins requisits ambientals demanen",
          "Per a l'autorització ambiental de llarga durada, els turismes de gasolina han de complir almenys **Euro 3** (habitualment matriculats després del 2000) i els dièsel **Euro 4** (habitualment matriculats després del 2005), segons les categories descrites per l'AMB.",
          "Si el vehicle no compleix els requisits, o necessites accedir-hi urgentment, existeixen autoritzacions esporàdiques. L'AMB permet fins a **24 autoritzacions diàries anuals** en aquesta modalitat.",
        ),
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
          "Si la documentació no inclou prou informació ambiental, l'AMB pot requerir acreditació del fabricant.",
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
        ),
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
        ...paras("La comprobación ordinaria puede tardar hasta **15 días hábiles**."),
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
          { label: "Última verificación", value: "23 de octubre de 2026" },
        ]),
        ...h2(
          "Requisitos ambientales",
          "Los turismos de gasolina deben cumplir al menos **Euro 3** y los diésel **Euro 4** para obtener la autorización ambiental de larga duración.",
          "Existe además una modalidad de acceso esporádico que permite solicitar hasta **24 días de circulación al año** cuando corresponda.",
        ),
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
          "Si la documentación no incluye suficiente información ambiental, la AMB puede requerir acreditación del fabricante.",
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
        ),
        ...paras(verifiedLine("es", ZBE_VERIFIED)),
        ...b2Related(["parking", "transport"], "es"),
      ],
    },

    en: {
      path: "guides/barcelona-low-emission-zone-foreign-cars",
      title:
        "Barcelona low-emission zone: what foreign drivers need to do before entering",
      seoTitle: "Barcelona low emission zone (LEZ): foreign car rules",
      seoDescription:
        "Foreign car in Barcelona's low emission zone (LEZ/ZBE)? Register with the AMB first (€7). Mon–Fri 07:00–20:00. Day permits: 24 a year at €5.",
      excerpt:
        "Foreign plates must be registered before driving in Barcelona's low-emission zone. Verification can take up to 15 working days.",
      blocks: [
        lead(
          "Barcelona's low-emission zone (ZBE Rondes de Barcelona, the LEZ) keeps out vehicles without a DGT environmental label from Monday to Friday, 07:00 to 20:00. A foreign-registered car has no DGT label, so you must register it with the AMB before you drive in: €7 once if it meets the standard (petrol Euro 3, diesel Euro 4), or up to 24 day permits a year at €5 each if it does not.",
        ),
        ...paras(
          "**Foreign-registered vehicles must be entered in the metropolitan register before driving in Barcelona metropolitan low-emission zones.** Standard environmental verification can take up to **15 working days**.",
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
          { label: "Last verified", value: "23 October 2026" },
        ]),
        ...h2(
          "Environmental standards",
          "For passenger cars, the AMB lists petrol **Euro 3** or higher and diesel **Euro 4** or higher among the standards eligible for long-term authorisation.",
          "Vehicles using the occasional-access system can request up to **24 daily authorisations per year**, subject to the applicable conditions.",
        ),
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
          "If your documents do not carry enough environmental information, the AMB may ask for manufacturer certification.",
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
];

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
const PARKING_VERIFIED = "2026-10-24";

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
    lead: "Aparcar al carrer en zona regulada de Barcelona costa **d'1,15 a 4,25 € l'hora**. La **zona blava** és per a estades curtes de qualsevol conductor: de dilluns a divendres de 9.00 a 20.00 h, d'1,15 a 3,75 € l'hora i normalment 1 o 2 hores com a màxim. La **zona verda** és per als veïns, però els no residents també hi poden aparcar per 1,40 a 4,25 € l'hora, normalment 1 o 2 hores. El preu exacte depèn de la tarifa de la zona (A als barris de més demanda, B a la resta) i del distintiu ambiental del cotxe.",
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
    hoursTitle: "Horaris: quan cal pagar",
    hours: [
      "La **zona blava** es regula normalment de dilluns a divendres de 9.00 a 20.00 h sense pausa al migdia; al centre, també els dissabtes, i a les zones de platja, també diumenges i festius.",
      "La **zona verda** per a no residents funciona de dilluns a divendres o de dilluns a dissabte, de 8.00 a 20.00 h o fins a les 22.00 h segons la zona. Fora de l'horari regulat l'estacionament és lliure, però mana el senyal vertical.",
      "La regulació de platja és de temporada: a Sant Martí va anar de l'1 d'abril al 30 de setembre del 2026, i des de l'1 d'octubre només el tram de l'avinguda Litoral entre Joan Miró i Jonquera manté l'horari de set dies.",
      "**Cap de setmana:** el dissabte només es paga la zona blava del centre i les zones verdes que funcionen de dilluns a dissabte; el diumenge, fora de la platja, ni la blava ni la verda es paguen. Les **places exclusives per a residents**, en canvi, estan reservades de 8.00 a 20.00 h tots els dies, festius inclosos (a la Barceloneta i el Born, les 24 hores).",
    ],
    blueTitle: "Zona blava: estades curtes",
    blue: "És per a rotació: el temps màxim és el que indica el senyal, normalment d'1 o 2 hores a la tarifa A i de 2 hores a la tarifa B.",
    blueCaption: "AREA Blava, preus per hora el 2026",
    greenTitle: "Com funciona la zona verda per a no residents",
    green: [
      "La zona verda prioritza els veïns, però els visitants també hi poden aparcar, amb la tarifa de no resident i normalment d'1 o 2 hores segons el senyal. El que no poden fer és aparcar a les **places exclusives per a residents**: unes 2.900 a Ciutat Vella, els centres històrics de Gràcia i Sarrià, Camp de l'Arpa, el Raval, la Barceloneta, el Born i el Carmel.",
      "Els residents autoritzats paguen 0,20 € al dia, amb un màxim d'1 € la setmana, i només dins de la seva zona.",
      "A Trinitat Vella (Sant Andreu) s'activa una zona verda nova el 9 de novembre del 2026, amb un màxim de 2 hores per als no residents.",
    ],
    greenCaption: "AREA Verda per a no residents, preus per hora el 2026",
    tableNote: "Font: AREA (B:SM), comprovat el 24 d'octubre de 2026.",
    costTitle: "Quant et costarà",
    cost: (greenC, blueEco) =>
      `Dues hores en zona verda amb tarifa A i un cotxe amb distintiu C costen **${greenC}**. Dues hores en zona blava amb tarifa B i distintiu ECO, **${blueEco}**. Els cotxes elèctrics també han de treure tiquet: paguen la tarifa més baixa, però no és gratis.`,
    payTitle: "Com pagar",
    pay: [
      "Paga en un parquímetre (tria el tipus de zona, introdueix la matrícula i paga amb targeta o monedes, sense canvi) o amb una aplicació autoritzada com SMOU. Ja no cal deixar el tiquet al cotxe: els agents comproven la matrícula digitalment i el rebut imprès és opcional.",
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
    ],
  },
  es: {
    lead: "Aparcar en la calle en zona regulada de Barcelona cuesta **de 1,15 a 4,25 € la hora**. La **zona azul** es para estancias cortas de cualquier conductor: de lunes a viernes de 9:00 a 20:00, de 1,15 a 3,75 € la hora y normalmente 1 o 2 horas como máximo. La **zona verde** es para los vecinos, pero los no residentes también pueden aparcar pagando de 1,40 a 4,25 € la hora, normalmente 1 o 2 horas. El precio exacto depende de la tarifa de la zona (A en los barrios de más demanda, B en el resto) y del distintivo ambiental del coche.",
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
    hoursTitle: "Horarios: cuándo hay que pagar",
    hours: [
      "La **zona azul** se regula normalmente de lunes a viernes de 9:00 a 20:00 sin pausa al mediodía; en el centro, también los sábados, y en las zonas de playa, también domingos y festivos.",
      "La **zona verde** para no residentes funciona de lunes a viernes o de lunes a sábado, de 8:00 a 20:00 o hasta las 22:00 según la zona. Fuera del horario regulado se aparca gratis, pero manda la señal vertical.",
      "La regulación de playa es de temporada: en Sant Martí fue del 1 de abril al 30 de septiembre de 2026, y desde el 1 de octubre solo el tramo de la avenida Litoral entre Joan Miró y Jonquera mantiene el horario de siete días.",
      "**Fin de semana:** el sábado solo se paga la zona azul del centro y las zonas verdes que funcionan de lunes a sábado; el domingo, fuera de la playa, ni la azul ni la verde se pagan. Las **plazas exclusivas para residentes**, en cambio, están reservadas de 8:00 a 20:00 todos los días, festivos incluidos (en la Barceloneta y El Born, las 24 horas).",
    ],
    blueTitle: "Zona azul: estancias cortas",
    blue: "Es para rotación: el tiempo máximo es el que indica la señal, normalmente de 1 o 2 horas en la tarifa A y de 2 horas en la tarifa B.",
    blueCaption: "AREA Azul, precios por hora en 2026",
    greenTitle: "Cómo funciona la zona verde para no residentes",
    green: [
      "La zona verde prioriza a los vecinos, pero los visitantes también pueden aparcar, con la tarifa de no residente y normalmente 1 o 2 horas según la señal. Lo que no pueden hacer es aparcar en las **plazas exclusivas para residentes**: unas 2.900 en Ciutat Vella, los centros históricos de Gràcia y Sarrià, Camp de l'Arpa, El Raval, la Barceloneta, El Born y El Carmel.",
      "Los residentes autorizados pagan 0,20 € al día, con un máximo de 1 € a la semana, y solo dentro de su zona.",
      "En Trinitat Vella (Sant Andreu) se activa una zona verde nueva el 9 de noviembre de 2026, con un máximo de 2 horas para los no residentes.",
    ],
    greenCaption: "AREA Verde para no residentes, precios por hora en 2026",
    tableNote: "Fuente: AREA (B:SM), comprobado el 24 de octubre de 2026.",
    costTitle: "Cuánto te costará",
    cost: (greenC, blueEco) =>
      `Dos horas en zona verde con tarifa A y un coche con distintivo C cuestan **${greenC}**. Dos horas en zona azul con tarifa B y distintivo ECO, **${blueEco}**. Los coches eléctricos también tienen que sacar tique: pagan la tarifa más baja, pero no es gratis.`,
    payTitle: "Cómo pagar",
    pay: [
      "Paga en un parquímetro (elige el tipo de zona, introduce la matrícula y paga con tarjeta o monedas, sin cambio) o con una aplicación autorizada como SMOU. Ya no hace falta dejar el tique en el coche: los agentes comprueban la matrícula de forma digital y el recibo impreso es opcional.",
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
    ],
  },
  en: {
    lead: "Regulated street parking in Barcelona costs **€1.15 to €4.25 an hour**. **Blue** spaces are for short stays by anyone: Monday to Friday, 9:00 to 20:00, €1.15 to €3.75 an hour, usually for 1 or 2 hours at most. **Green** spaces are for residents, but non-residents can park there too for €1.40 to €4.25 an hour, usually for 1 or 2 hours. The exact price depends on the zone's rate (A in the busiest districts, B elsewhere) and your car's environmental label.",
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
    hoursTitle: "When you have to pay",
    hours: [
      "**Blue** spaces are normally regulated Monday to Friday, 9:00 to 20:00 with no midday break; in the city centre also on Saturdays, and in beach zones also on Sundays and public holidays.",
      "**Green** spaces for non-residents run Monday to Friday or Monday to Saturday, from 8:00 to 20:00 or to 22:00 depending on the area. Outside the regulated hours parking is free, but the sign on the street is what counts.",
      "Beach regulation is seasonal: in Sant Martí it ran from 1 April to 30 September 2026, and since 1 October only the Avinguda Litoral stretch between Joan Miró and Jonquera keeps the seven-day schedule.",
      "**Weekends:** on Saturdays you pay only in blue spaces in the centre and in green areas that run Monday to Saturday; on Sundays, away from the beach, neither blue nor green spaces are charged. **Resident-only spaces**, though, are reserved 8:00 to 20:00 every day including public holidays (24 hours in Barceloneta and El Born).",
    ],
    blueTitle: "Blue spaces: short stays",
    blue: "They are for turnover: the maximum stay is what the sign says, usually 1 or 2 hours on Rate A and 2 hours on Rate B.",
    blueCaption: "AREA Blue, hourly prices in 2026",
    greenTitle: "How green spaces work for visitors",
    green: [
      "Green spaces give residents priority, but visitors can park there too, at the non-resident rate and usually for 1 or 2 hours as the sign says. What visitors cannot use are the **resident-only spaces**: about 2,900 of them in Ciutat Vella, the historic centres of Gràcia and Sarrià, Camp de l'Arpa, El Raval, Barceloneta, El Born and El Carmel.",
      "Authorised residents pay €0.20 a day, capped at €1 a week, and only inside their own zone.",
      "A new green zone opens in Trinitat Vella (Sant Andreu) on 9 November 2026, with a 2-hour limit for non-residents.",
    ],
    greenCaption: "AREA Green for non-residents, hourly prices in 2026",
    tableNote: "Source: AREA (B:SM), checked on 24 October 2026.",
    costTitle: "What it will cost you",
    cost: (greenC, blueEco) =>
      `Two hours in a green space on Rate A with a C-label car cost **${greenC}**. Two hours in a blue space on Rate B with an ECO label, **${blueEco}**. Electric cars still need a ticket: they pay the lowest rate, but parking is not free.`,
    payTitle: "How to pay",
    pay: [
      "Pay at a parking meter (choose the zone type, type your number plate, pay by card or exact coins) or with an authorised app such as SMOU. You no longer need to leave a paper ticket in the car: enforcement officers check your plate digitally, and a printed receipt is optional.",
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
    callout("warning", t.ruleTitle, t.rule),
    ...h2(t.hoursTitle, ...t.hours),
    ...h2(t.blueTitle, t.blue),
    table(t.blueCaption, LABEL_HEADERS[locale] ?? [], blue, t.tableNote),
    ...h2(t.greenTitle, ...t.green),
    table(t.greenCaption, LABEL_HEADERS[locale] ?? [], green, t.tableNote),
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
        "Aparcar a Barcelona: zona blava, zona verda, preus i què ha de saber un visitant",
      seoTitle: "Preu zona blava i verda Barcelona: de 1,15 a 4,25 €/h",
      seoDescription:
        "Zona blava de 1,15 a 3,75 €/h i zona verda de 1,40 a 4,25 €/h, segons el distintiu ambiental del cotxe. Taula completa de tarifes, horaris i com pagar.",
      excerpt:
        "Els preus de l'aparcament regulat depenen de la zona i del distintiu ambiental del vehicle. Taula completa de 2026.",
      blocks: parkingBody("ca"),
    },

    es: {
      path: "guias/aparcar-barcelona-zona-azul-verde",
      title: "Aparcar en Barcelona: zona azul, zona verde, precios y reglas para visitantes",
      seoTitle: "Zona azul y verde Barcelona: precio, horario y cómo funciona",
      seoDescription:
        "Zona azul: 1,15-3,75 €/h, lun-vie de 9 a 20 h. Zona verde para no residentes: 1,40-4,25 €/h, 1 o 2 h. Cómo funciona, tabla por distintivo y cómo pagar.",
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
