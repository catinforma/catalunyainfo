import type { Locale } from "@/lib/i18n/config";
import { hubPath as rodaliesHub, linePath as rodaliesLine } from "@/lib/programmatic/rodalies/paths";

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
 * Barcelona airport to the city centre, by public transport.
 *
 * Rewritten 28 Oct 2026 for the specific queries the page can win (the head
 * terms belong to transfer sellers, TMB and Aena): bus 46, the night buses,
 * the L9 Sud airport ticket and the R2 Nord timetable. Every figure was read
 * that day on an official page:
 *
 *  - bus 46: Aena's bus page (route, stops), the ATM airport page ("about 5:00
 *    to 24:00", content dated 21 Jul 2025, still the page ATM publishes) and
 *    TMB's single ticket (valid on TMB buses);
 *  - night buses: AMB's airport page and line pages (N17 = linea 224, N18 =
 *    394, N19 = 471), which give approximate times every 15 minutes, every
 *    day. The earlier "midnight to 05:00, every 20-30 min" came from the ATM
 *    page and is out of date;
 *  - L9 Sud: TMB (5.90 airport ticket, every 7 min, 32 min), DOGC 9582 of
 *    14.1.2026 (the 3.05 + 0.75 surcharges inside the 5.90; which passes are
 *    valid);
 *  - R2 Nord: the Rodalies R2 timetable PDF (stamped 1 Sep 2026, file updated
 *    25 Oct 2026): from the airport 5:40 to 23:38 at :08 and :38; to the
 *    airport, arrivals 5:30 to 23:26;
 *  - shuttle: Aena (24 h, four frequency bands, 10 and 14 minutes);
 *  - taxi: AMB 2026 urban tariffs (T-1, T-2, 4.60 supplement, 21 minimum,
 *    T-3 app-only closed price, T-4 airport-Moll Adossat 46);
 *  - airport express bus: named only as Aena and AMB name it (A1, A2), with
 *    the AMB stop list. No fare or frequency: neither Aena nor AMB publishes
 *    one, and this site does not cite or link the operator.
 *
 * Left out (no official source today): bus 46 frequency and journey time,
 * the Rodalies single fare, a typical taxi total, whether the N18 stops at T2
 * on the way to the airport.
 */

const VERIFIED = "2026-10-28";

const SOURCES: B2Source[] = [
  { name: "How to get there by bus (line 46, night buses, Aerobús A1 and A2)", url: "https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/getting-there/bus.html", publisher: "Aena" },
  { name: "Aeroport: línies d'autobús", url: "https://www.ambmobilitat.cat/Principales/aeropuerto.aspx", publisher: "Àrea Metropolitana de Barcelona" },
  { name: "Línia N17", url: "https://www.ambmobilitat.cat/Principales/TiraLinea.aspx?linea=224", publisher: "Àrea Metropolitana de Barcelona" },
  { name: "Línia N18", url: "https://www.ambmobilitat.cat/Principales/TiraLinea.aspx?linea=394", publisher: "Àrea Metropolitana de Barcelona" },
  { name: "Línia A1 (parades)", url: "https://www.ambmobilitat.cat/Principales/TiraLinea.aspx?linea=130", publisher: "Àrea Metropolitana de Barcelona" },
  {
    name: "Accessing Barcelona from the airport by metro",
    url: "https://www.tmb.cat/en/visit-barcelona/public-transport/metro-airport",
    publisher: "TMB",
  },
  { name: "Airport ticket", url: "https://www.tmb.cat/en/barcelona-fares-metro-bus/aeroport-ticket", publisher: "TMB" },
  { name: "Metro and bus fares", url: "https://www.tmb.cat/en/barcelona-fares-metro-bus", publisher: "TMB" },
  { name: "TMB single ticket", url: "https://www.tmb.cat/en/barcelona-fares-metro-bus/single-ticket", publisher: "TMB" },
  { name: "Metro opening hours", url: "https://www.tmb.cat/en/barcelona-transport/operating-hours-metro-bus", publisher: "TMB" },
  {
    name: "R2 Nord line",
    url: "https://rodalies.gencat.cat/en/sobre-rodalies/linies-i-estacions/servei_rodalia_barcelona/r2n/index.html",
    publisher: "Rodalies de Catalunya",
  },
  { name: "Horaris R2 (PDF)", url: "https://rodalies.gencat.cat/web/.content/02_Horaris/horaris/R2.pdf", publisher: "Rodalies de Catalunya" },
  { name: "How to get there by train", url: "https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/getting-there/trains.html", publisher: "Aena" },
  {
    name: "How to get to Barcelona from the airport",
    url: "https://www.atm.cat/en/com-arribar-a-barcelona-des-de-l-aeroport",
    publisher: "Autoritat del Transport Metropolità",
  },
  {
    name: "Free transport between terminals",
    url: "https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/airport-services/free-transport-between-terminals.html",
    publisher: "Aena",
  },
  {
    name: "Airlines at Josep Tarradellas Barcelona-El Prat",
    url: "https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/airlines-and-destinations/airlines.html",
    publisher: "Aena",
  },
  { name: "Taxi", url: "https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/getting-there/taxi.html", publisher: "Aena" },
  { name: "Tarifes del taxi 2026", url: "https://taxi.amb.cat/usuaris/tarifes-del-taxi", publisher: "Àrea Metropolitana de Barcelona" },
  {
    name: "Tarifes urbanes del taxi per al 2026",
    url: "https://taxi.amb.cat/es/imet/actualitat/noticies/detall/-/noticiataxi/tarifes-urbanes-del-taxi-per-al-2026/29760500/956832",
    publisher: "Àrea Metropolitana de Barcelona",
  },
];

type Copy = {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
};

const META: Record<Locale, Copy> = {
  ca: {
    path: "guies/aeroport-barcelona-centre",
    title: "De l'aeroport de Barcelona al centre: bus 46, nitbus, metro L9 i tren R2 Nord, amb horaris i preus",
    seoTitle: "Aeroport Barcelona al centre: bus 46, nitbus, metro i tren",
    seoDescription:
      "Bus 46 (bitllet senzill 2,90 €), nitbus N17 i N18 cada 15 min, metro L9 amb el bitllet aeroport de 5,90 € i R2 Nord de 5:40 a 23:38. Horaris oficials.",
    excerpt:
      "Com anar de l'aeroport del Prat al centre de Barcelona en transport públic: horaris i preus oficials del bus 46, els nitbus, el metro L9 Sud i el tren R2 Nord.",
  },
  es: {
    path: "guias/aeropuerto-barcelona-centro",
    title: "Del aeropuerto de Barcelona al centro: bus 46, nitbus, metro L9 y tren R2 Nord, con horarios y precios",
    seoTitle: "Bus aeropuerto Barcelona centro: 46, nitbus, metro y tren R2",
    seoDescription:
      "Bus 46 (billete sencillo 2,90 €), nitbus N17 y N18 cada 15 min, metro L9 con el billete aeropuerto de 5,90 € y R2 Nord de 5:40 a 23:38. Horarios oficiales.",
    excerpt:
      "Cómo ir del aeropuerto de El Prat al centro de Barcelona en transporte público: horarios y precios oficiales del bus 46, los nitbus, el metro L9 Sud y el tren R2 Nord.",
  },
  en: {
    path: "guides/barcelona-airport-to-city-centre",
    title: "Barcelona airport to the city centre: bus 46, night buses, L9 metro and R2 Nord train, with times and fares",
    seoTitle: "Barcelona airport bus to city centre: 46, night bus, metro",
    seoDescription:
      "Bus 46 on a €2.90 single, night buses N17 and N18 every 15 min, L9 metro on the €5.90 airport ticket, R2 Nord train 5:40 to 23:38. Official times.",
    excerpt:
      "How to get from Barcelona airport to the city centre by public transport: official times and fares for bus 46, the night buses, the L9 Sud metro and the R2 Nord train.",
  },
};

type T = {
  lead: string;
  tableCaption: string;
  headers: string[];
  rows: string[][];
  tableNote: string;
  calloutText: string;
  bus46Title: string;
  bus46: string[];
  nightTitle: string;
  night: string[];
  nightCaption: string;
  nightHeaders: string[];
  nightRows: string[][];
  nightNote: string;
  metroTitle: string;
  metro: (passes: string, hours: string) => string[];
  trainTitle: string;
  train: string[];
  trainCaption: string;
  trainHeaders: string[];
  trainRows: string[][];
  trainNote: string;
  shuttleTitle: string;
  shuttle: string;
  expressTitle: string;
  express: string[];
  taxiTitle: string;
  taxi: string[];
  terminalTitle: string;
  terminal: string;
  backTitle: string;
  back: string[];
  pickTitle: string;
  pick: string[];
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, T> = {
  es: {
    lead: "Del aeropuerto de Barcelona al centro en transporte público hay cuatro opciones: el **bus 46** (de la T1 y la T2 a plaza Espanya, con el billete sencillo de **2,90 €**), el **metro L9 Sud** (billete aeropuerto de **5,90 €**, cada 7 minutos), el **tren R2 Nord** desde la T2 (cada 30 minutos, de **5:40 a 23:38**) y, de noche, los **nitbus N17 y N18** a plaza Catalunya, cada 15 minutos. Aena y el AMB listan además el autobús exprés Aerobús (A1 y A2) a plaza Catalunya.",
    tableCaption: "Del aeropuerto al centro, de un vistazo",
    headers: ["Opción", "Terminales", "Precio", "Horario y tiempo", "Frecuencia"],
    rows: [
      ["Bus 46", "T1 y T2", "Billete sencillo 2,90 € o título integrado", "De 5:00 a 24:00 aprox.; hasta plaza Espanya", "Sin frecuencia oficial publicada"],
      ["Metro L9 Sud", "T1 y T2", "Billete aeropuerto 5,90 €", "Horario del metro; unos 32 min con un transbordo", "Cada 7 min"],
      ["Tren R2 Nord", "Solo T2", "Título integrado, también la T-casual", "Primer tren 5:40, último 23:38; 19 min a Sants", "Cada 30 min"],
      ["Nitbus N17", "Solo T1", "Título integrado", "Desde la T1, de 21:55 a 4:50 aprox.", "Cada 15 min"],
      ["Nitbus N18", "T1 y T2", "Título integrado", "Desde la T1, de 0:18 a 4:33 aprox.", "Cada 15 min"],
      ["Aerobús A1 / A2", "A1: T1 · A2: T2", "Ni Aena ni el AMB lo publican", "Directo a plaza Catalunya", "—"],
      ["Taxi", "T1 y T2", "Taxímetro; mínimo 21 € desde el aeropuerto", "Según el tráfico", "—"],
    ],
    tableNote: "Fuentes: Aena, AMB, TMB, ATM, Rodalies (horario de la R2 del 1 de septiembre de 2026) y DOGC, comprobadas el 28 de octubre de 2026. Los horarios de autobús son aproximados.",
    calloutText: "Los horarios y precios cambian: cada apartado dice de qué página oficial salen. Compruébalo allí antes de viajar.",
    bus46Title: "Bus 46 del aeropuerto: horario, paradas y precio",
    bus46: [
      "La línea **46** de TMB une las dos terminales con **plaza Espanya**. En el aeropuerto para en la **T1, planta 0 (Llegadas)**, y en la **T2AB** y la **T2C**, según Aena. Funciona **aproximadamente de 5:00 a 24:00**, según la ATM.",
      "Es un autobús urbano: vale el **billete sencillo de 2,90 €** de TMB y todos los títulos integrados, también la T-casual, que en el metro del aeropuerto no sirve. Desde plaza Espanya sigues en metro (L1 y L3) o en FGC.",
      "Ninguna página oficial publica la frecuencia ni el tiempo de viaje del 46, así que no los damos: si llegas tarde, mira los nitbus.",
    ],
    nightTitle: "Autobús nocturno del aeropuerto: N17 y N18",
    night: [
      "De noche, dos líneas NitBus del AMB unen el aeropuerto con **plaza Catalunya** todos los días, cada 15 minutos. La **N17** solo sirve la **T1**; en la ciudad para también en plaza Universitat y en plaza Espanya. La **N18** sale de la T1 y, hacia Barcelona, para también en la **T2**. Aceptan los títulos integrados.",
      "La **N19** también pasa por las dos terminales, pero no va a Barcelona: une Castelldefels con la estación de Rodalies de El Prat.",
    ],
    nightCaption: "Nitbus entre el aeropuerto y plaza Catalunya",
    nightHeaders: ["Línea", "Desde el aeropuerto", "Desde plaza Catalunya"],
    nightRows: [
      ["N17 (T1)", "De 21:55 a 4:50", "De 23:00 a 5:00"],
      ["N18 (T1 y T2)", "De 0:18 a 4:33 (desde la T1)", "De 0:05 a 4:50"],
    ],
    nightNote: "Horarios aproximados del AMB, todos los días, cada 15 minutos; el AMB avisa de que dependen del tráfico.",
    metroTitle: "Metro L9 al aeropuerto: precio y horario",
    metro: (passes, hours) => [
      "La **L9 Sud** para en las dos terminales (Aeroport T1 y Aeroport T2) y pasa **cada 7 minutos**. No llega al centro por sí sola: se cambia en Torrassa (L1), Collblanc (L5), Zona Universitària (L3) o Can Tries | Gornal (L10 Sud). TMB calcula **unos 32 minutos** hasta el centro.",
      `Para entrar o salir por esas dos estaciones necesitas el **billete aeropuerto, 5,90 €**: según la resolución de tarifas de 2026 (DOGC), incluye un recargo de 3,05 € por el mantenimiento de las estaciones y otro de 0,75 €. El billete sencillo de 2,90 €, la **T-casual**, la T-familiar y la T-grup **no valen** allí. Sí valen la **T-dia** (una ida y una vuelta al aeropuerto), la **T-usual** y la **Hola Barcelona** (ida y vuelta incluidas). ${passes}.`,
      `Tiene el horario del resto del metro: de 5:00 a 24:00 de domingo a jueves, hasta las 2:00 los viernes y toda la noche del sábado; ${hours}.`,
    ],
    trainTitle: "Tren R2 Nord del aeropuerto: horario",
    train: [
      "La estación de Rodalies está en la **Terminal 2, planta 0**, y solo la sirve la **R2 Nord**, con **un tren cada 30 minutos** todos los días. Para en El Prat, Bellvitge, **Barcelona-Sants** (19 minutos) y **Passeig de Gràcia** (24 minutos).",
      "Acepta **todos los títulos integrados, también la T-casual**, así que si ya llevas una, el tren te cuesta un viaje. ¿Llegas a la T1? La lanzadera gratuita tarda unos 10 minutos hasta la T2.",
      `Antes de ir a la estación, mira [si la R2 Nord tiene incidencias hoy](${rodaliesLine("es", "R2N")}).`,
    ],
    trainCaption: "R2 Nord: primeros y últimos trenes",
    trainHeaders: ["Sentido", "Primer tren", "Último tren", "Salidas"],
    trainRows: [
      ["Desde el aeropuerto", "5:40", "23:38", "A las :08 y las :38"],
      ["Hacia el aeropuerto (llegada)", "5:30 (sale de Sants a las 5:13)", "23:26 (sale de Sants a las 23:09)", "Llega a las :26 y las :56"],
    ],
    trainNote: "Horario oficial de la R2 de Rodalies (1 de septiembre de 2026), igual todos los días. Rodalies avisa de que está sujeto a cambios.",
    shuttleTitle: "Lanzadera gratuita entre la T1 y la T2",
    shuttle: "Aena tiene un **autobús gratuito entre terminales** las 24 horas, todos los días: cada 5 minutos de 8:00 a 20:00, cada 7 de 5:00 a 8:00 y de 20:00 a 24:00, y cada 10 de 0:00 a 5:00. De la T1 a la T2 tarda unos **10 minutos**; de la T2 a la T1, unos **14**.",
    expressTitle: "Aerobús: el autobús exprés a plaza Catalunya",
    express: [
      "Aena y el AMB listan dos líneas exprés hasta **plaza Catalunya**: la **A1** desde la **T1** y la **A2** desde la **T2** (T2B y T2C). Según el AMB, hacia el centro el A1 para en la Gran Via de les Corts Catalanes, en Gran Via – Comte Borrell y en plaza Universitat; **no para en Sants**.",
      "Ni Aena ni el AMB publican su precio ni su horario, así que no los damos: los encontrarás en la parada.",
    ],
    taxiTitle: "Taxi del aeropuerto al centro: precio",
    taxi: [
      "Los taxis funcionan con la tarifa del AMB para 2026: bajada de bandera de 2,80 €, 1,35 € por km los laborables de 8:00 a 20:00 y 1,66 € de noche, sábados y festivos, más un **suplemento de 4,60 €** por empezar o acabar en el aeropuerto. Un servicio que sale del aeropuerto cuesta **como mínimo 21 €**, suplementos incluidos. Los peajes los paga el cliente.",
      "No hay un precio oficial hasta el centro: depende del taxímetro y del tráfico. El único precio fijo de la tarifa es el del aeropuerto a la terminal de cruceros (Moll Adossat), **46 €**; los taxis pedidos por app pueden ofrecer un precio cerrado (tarifa T-3). Las paradas están delante de las llegadas de la T1 (planta 0) y de la T2A, T2B y T2C; el taxi oficial es negro y amarillo.",
    ],
    terminalTitle: "¿Qué terminal? Depende de tu aerolínea",
    terminal: "La lista de aerolíneas de Aena indica la terminal de cada una. **Vueling, Iberia, British Airways, Air Europa, Lufthansa, Emirates y United Airlines operan en la T1**; **Ryanair, easyJet, Jet2.com, Aer Lingus, Wizz Air, Volotea, Transavia, Norwegian y Eurowings, en la T2** (consultada el 20 de octubre de 2026). Desde la T1 tienes el bus 46, el metro y el N17; desde la T2, el bus 46, el metro, el tren y el N18. Las asignaciones pueden cambiar: compruébalo en tu reserva o en la [lista de aerolíneas de Aena](https://www.aena.es/es/josep-tarradellas-barcelona-el-prat/aerolineas-y-destinos/aerolineas.html).",
    backTitle: "Volver al aeropuerto",
    back: [
      "**Tren:** el último R2 Nord que llega al aeropuerto sale de Passeig de Gràcia a las 23:02 y de Sants a las 23:09; el primero, de Sants a las 5:13. Llega a la T2: si vuelas desde la T1, suma la lanzadera (unos 14 minutos).",
      "**Metro:** el billete aeropuerto vale en los dos sentidos. La T-casual tampoco sirve para salir en las estaciones del aeropuerto.",
      "**De noche:** el N17 sale de plaza Catalunya hacia la T1 de 23:00 a 5:00 y el N18, de 0:05 a 4:50, cada 15 minutos.",
      "**Aerobús:** según el AMB, el A1 sale de plaza Catalunya y para en Sepúlveda – Comte d'Urgell y en plaza Espanya antes de la T1 (Salidas y Llegadas); el A2 va a la T2.",
    ],
    pickTitle: "Cuál elegir",
    pick: [
      "**Ya tienes una T-casual:** R2 Nord desde la T2, bus 46 o nitbus; no el metro del aeropuerto.",
      "**Tienes una T-dia, una T-usual o la Hola Barcelona:** el metro L9 Sud está incluido.",
      "**Coges un tren en Sants o te alojas cerca de Passeig de Gràcia, y llegas a la T2:** R2 Nord.",
      "**Llegas de madrugada:** N17 desde la T1 o N18 desde la T1 y la T2, cada 15 minutos hasta plaza Catalunya.",
      "**Tres o cuatro personas con maletas:** compara el taxímetro (mínimo 21 €) con lo que pagaríais en transporte público.",
    ],
    faq: [
      { question: "¿Cuál es el horario del bus 46 del aeropuerto?", answer: "Funciona aproximadamente de 5:00 a 24:00 entre las dos terminales y plaza Espanya, según la ATM. Ninguna página oficial publica su frecuencia." },
      { question: "¿Qué autobús nocturno va al aeropuerto de Barcelona?", answer: "El N17 (plaza Catalunya – T1), de 23:00 a 5:00 desde plaza Catalunya, y el N18 (plaza Catalunya – T1 y T2), de 0:05 a 4:50, los dos cada 15 minutos todos los días, según el AMB." },
      { question: "¿Cuánto cuesta el metro L9 del aeropuerto?", answer: "El billete aeropuerto cuesta 5,90 €. La T-casual y el billete sencillo no valen en las estaciones Aeroport T1 y T2; la T-dia, la T-usual y la Hola Barcelona, sí." },
      { question: "¿Cuál es el horario del R2 Nord del aeropuerto?", answer: "Desde el aeropuerto (T2) sale un tren cada 30 minutos, el primero a las 5:40 y el último a las 23:38. Hacia el aeropuerto, el primero llega a las 5:30 y el último a las 23:26." },
      { question: "¿Puedo usar la T-casual desde el aeropuerto?", answer: "No en las estaciones de metro del aeropuerto (L9 Sud), pero sí en el tren R2 Nord, el bus 46 y los nitbus." },
      { question: "¿El Aerobús para en Sants?", answer: "No. Según el AMB, hacia el centro el A1 para en la Gran Via, en Comte Borrell, en plaza Universitat y en plaza Catalunya. A Sants llega el tren R2 Nord desde la T2 en 19 minutos." },
      { question: "¿Cuánto cuesta un taxi del aeropuerto al centro?", answer: "No hay precio oficial: es el taxímetro, con un suplemento de 4,60 € y un mínimo de 21 € desde el aeropuerto. El único precio fijo es el del aeropuerto al Moll Adossat, 46 €." },
      { question: "¿En qué terminal opera Ryanair en el aeropuerto de Barcelona?", answer: "En la T2, según la lista de aerolíneas de Aena (consultada el 20 de octubre de 2026), igual que easyJet, Jet2.com y Aer Lingus. Vueling, Iberia y British Airways operan en la T1." },
    ],
  },
  ca: {
    lead: "De l'aeroport de Barcelona al centre en transport públic hi ha quatre opcions: el **bus 46** (de la T1 i la T2 a plaça Espanya, amb el bitllet senzill de **2,90 €**), el **metro L9 Sud** (bitllet aeroport de **5,90 €**, cada 7 minuts), el **tren R2 Nord** des de la T2 (cada 30 minuts, de **5:40 a 23:38**) i, de nit, els **nitbus N17 i N18** a plaça Catalunya, cada 15 minuts. Aena i l'AMB llisten a més l'autobús exprés Aerobús (A1 i A2) a plaça Catalunya.",
    tableCaption: "De l'aeroport al centre, d'un cop d'ull",
    headers: ["Opció", "Terminals", "Preu", "Horari i temps", "Freqüència"],
    rows: [
      ["Bus 46", "T1 i T2", "Bitllet senzill 2,90 € o títol integrat", "De 5:00 a 24:00 aprox.; fins a plaça Espanya", "Sense freqüència oficial publicada"],
      ["Metro L9 Sud", "T1 i T2", "Bitllet aeroport 5,90 €", "Horari del metro; uns 32 min amb un transbord", "Cada 7 min"],
      ["Tren R2 Nord", "Només T2", "Títol integrat, també la T-casual", "Primer tren 5:40, últim 23:38; 19 min a Sants", "Cada 30 min"],
      ["Nitbus N17", "Només T1", "Títol integrat", "Des de la T1, de 21:55 a 4:50 aprox.", "Cada 15 min"],
      ["Nitbus N18", "T1 i T2", "Títol integrat", "Des de la T1, de 0:18 a 4:33 aprox.", "Cada 15 min"],
      ["Aerobús A1 / A2", "A1: T1 · A2: T2", "Ni Aena ni l'AMB el publiquen", "Directe a plaça Catalunya", "—"],
      ["Taxi", "T1 i T2", "Taxímetre; mínim 21 € des de l'aeroport", "Segons el trànsit", "—"],
    ],
    tableNote: "Fonts: Aena, AMB, TMB, ATM, Rodalies (horari de l'R2 de l'1 de setembre de 2026) i DOGC, comprovades el 28 d'octubre de 2026. Els horaris d'autobús són aproximats.",
    calloutText: "Els horaris i els preus canvien: cada apartat diu de quina pàgina oficial surten. Comprova-ho allà abans de viatjar.",
    bus46Title: "Bus 46 de l'aeroport: horari, parades i preu",
    bus46: [
      "La línia **46** de TMB uneix les dues terminals amb **plaça Espanya**. A l'aeroport para a la **T1, planta 0 (Arribades)**, i a la **T2AB** i la **T2C**, segons Aena. Funciona **aproximadament de 5:00 a 24:00**, segons l'ATM.",
      "És un autobús urbà: hi val el **bitllet senzill de 2,90 €** de TMB i tots els títols integrats, també la T-casual, que al metro de l'aeroport no serveix. Des de plaça Espanya continues en metro (L1 i L3) o en FGC.",
      "Cap pàgina oficial publica la freqüència ni el temps de viatge del 46, així que no els donem: si arribes tard, mira els nitbus.",
    ],
    nightTitle: "Autobús nocturn de l'aeroport: N17 i N18",
    night: [
      "De nit, dues línies NitBus de l'AMB uneixen l'aeroport amb **plaça Catalunya** cada dia, cada 15 minuts. La **N17** només serveix la **T1**; a la ciutat para també a plaça Universitat i a plaça Espanya. La **N18** surt de la T1 i, cap a Barcelona, para també a la **T2**. Accepten els títols integrats.",
      "La **N19** també passa per les dues terminals, però no va a Barcelona: uneix Castelldefels amb l'estació de Rodalies del Prat.",
    ],
    nightCaption: "Nitbus entre l'aeroport i plaça Catalunya",
    nightHeaders: ["Línia", "Des de l'aeroport", "Des de plaça Catalunya"],
    nightRows: [
      ["N17 (T1)", "De 21:55 a 4:50", "De 23:00 a 5:00"],
      ["N18 (T1 i T2)", "De 0:18 a 4:33 (des de la T1)", "De 0:05 a 4:50"],
    ],
    nightNote: "Horaris aproximats de l'AMB, cada dia, cada 15 minuts; l'AMB avisa que depenen del trànsit.",
    metroTitle: "Metro L9 a l'aeroport: preu i horari",
    metro: (passes, hours) => [
      "La **L9 Sud** para a les dues terminals (Aeroport T1 i Aeroport T2) i passa **cada 7 minuts**. No arriba al centre tota sola: es canvia a Torrassa (L1), Collblanc (L5), Zona Universitària (L3) o Can Tries | Gornal (L10 Sud). TMB calcula **uns 32 minuts** fins al centre.",
      `Per entrar o sortir per aquestes dues estacions necessites el **bitllet aeroport, 5,90 €**: segons la resolució de tarifes del 2026 (DOGC), inclou un recàrrec de 3,05 € pel manteniment de les estacions i un altre de 0,75 €. El bitllet senzill de 2,90 €, la **T-casual**, la T-familiar i la T-grup **no hi valen**. Sí que hi valen la **T-dia** (una anada i una tornada a l'aeroport), la **T-usual** i la **Hola Barcelona** (anada i tornada incloses). ${passes}.`,
      `Té l'horari de la resta del metro: de 5:00 a 24:00 de diumenge a dijous, fins a les 2:00 els divendres i tota la nit del dissabte; ${hours}.`,
    ],
    trainTitle: "Tren R2 Nord de l'aeroport: horari",
    train: [
      "L'estació de Rodalies és a la **Terminal 2, planta 0**, i només la serveix l'**R2 Nord**, amb **un tren cada 30 minuts** cada dia. Para al Prat, Bellvitge, **Barcelona-Sants** (19 minuts) i **Passeig de Gràcia** (24 minuts).",
      "Accepta **tots els títols integrats, també la T-casual**, així que si ja en portes una, el tren et costa un viatge. Arribes a la T1? La llançadora gratuïta triga uns 10 minuts fins a la T2.",
      `Abans d'anar a l'estació, mira [si l'R2 Nord té incidències avui](${rodaliesLine("ca", "R2N")}).`,
    ],
    trainCaption: "R2 Nord: primers i últims trens",
    trainHeaders: ["Sentit", "Primer tren", "Últim tren", "Sortides"],
    trainRows: [
      ["Des de l'aeroport", "5:40", "23:38", "A les :08 i les :38"],
      ["Cap a l'aeroport (arribada)", "5:30 (surt de Sants a les 5:13)", "23:26 (surt de Sants a les 23:09)", "Arriba a les :26 i les :56"],
    ],
    trainNote: "Horari oficial de l'R2 de Rodalies (1 de setembre de 2026), igual cada dia. Rodalies avisa que està subjecte a canvis.",
    shuttleTitle: "Llançadora gratuïta entre la T1 i la T2",
    shuttle: "Aena té un **autobús gratuït entre terminals** les 24 hores, cada dia: cada 5 minuts de 8:00 a 20:00, cada 7 de 5:00 a 8:00 i de 20:00 a 24:00, i cada 10 de 0:00 a 5:00. De la T1 a la T2 triga uns **10 minuts**; de la T2 a la T1, uns **14**.",
    expressTitle: "Aerobús: l'autobús exprés a plaça Catalunya",
    express: [
      "Aena i l'AMB llisten dues línies exprés fins a **plaça Catalunya**: l'**A1** des de la **T1** i l'**A2** des de la **T2** (T2B i T2C). Segons l'AMB, cap al centre l'A1 para a la Gran Via de les Corts Catalanes, a Gran Via – Comte Borrell i a plaça Universitat; **no para a Sants**.",
      "Ni Aena ni l'AMB publiquen el preu ni l'horari, així que no els donem: els trobaràs a la parada.",
    ],
    taxiTitle: "Taxi de l'aeroport al centre: preu",
    taxi: [
      "Els taxis funcionen amb la tarifa de l'AMB per al 2026: baixada de bandera de 2,80 €, 1,35 € per km els feiners de 8:00 a 20:00 i 1,66 € de nit, dissabtes i festius, més un **suplement de 4,60 €** per començar o acabar a l'aeroport. Un servei que surt de l'aeroport costa **com a mínim 21 €**, suplements inclosos. Els peatges els paga el client.",
      "No hi ha un preu oficial fins al centre: depèn del taxímetre i del trànsit. L'únic preu fix de la tarifa és el de l'aeroport a la terminal de creuers (Moll Adossat), **46 €**; els taxis demanats per app poden oferir un preu tancat (tarifa T-3). Les parades són davant de les arribades de la T1 (planta 0) i de la T2A, T2B i T2C; el taxi oficial és negre i groc.",
    ],
    terminalTitle: "Quina terminal? Depèn de l'aerolínia",
    terminal: "La llista d'aerolínies d'Aena indica la terminal de cadascuna. **Vueling, Iberia, British Airways, Air Europa, Lufthansa, Emirates i United Airlines operen a la T1**; **Ryanair, easyJet, Jet2.com, Aer Lingus, Wizz Air, Volotea, Transavia, Norwegian i Eurowings, a la T2** (consultada el 20 d'octubre de 2026). Des de la T1 tens el bus 46, el metro i l'N17; des de la T2, el bus 46, el metro, el tren i l'N18. Les assignacions poden canviar: comprova-ho a la reserva o a la [llista d'aerolínies d'Aena](https://www.aena.es/ca/josep-tarradellas-barcelona-el-prat/aerolinies-i-destinacions/aerolinies.html).",
    backTitle: "Tornar a l'aeroport",
    back: [
      "**Tren:** l'últim R2 Nord que arriba a l'aeroport surt de Passeig de Gràcia a les 23:02 i de Sants a les 23:09; el primer, de Sants a les 5:13. Arriba a la T2: si voles des de la T1, afegeix-hi la llançadora (uns 14 minuts).",
      "**Metro:** el bitllet aeroport val en tots dos sentits. La T-casual tampoc no serveix per sortir a les estacions de l'aeroport.",
      "**De nit:** l'N17 surt de plaça Catalunya cap a la T1 de 23:00 a 5:00 i l'N18, de 0:05 a 4:50, cada 15 minuts.",
      "**Aerobús:** segons l'AMB, l'A1 surt de plaça Catalunya i para a Sepúlveda – Comte d'Urgell i a plaça Espanya abans de la T1 (Sortides i Arribades); l'A2 va a la T2.",
    ],
    pickTitle: "Quin triar",
    pick: [
      "**Ja tens una T-casual:** R2 Nord des de la T2, bus 46 o nitbus; no el metro de l'aeroport.",
      "**Tens una T-dia, una T-usual o la Hola Barcelona:** el metro L9 Sud hi és inclòs.",
      "**Agafes un tren a Sants o t'allotges a prop de Passeig de Gràcia, i arribes a la T2:** R2 Nord.",
      "**Arribes de matinada:** N17 des de la T1 o N18 des de la T1 i la T2, cada 15 minuts fins a plaça Catalunya.",
      "**Tres o quatre persones amb maletes:** compara el taxímetre (mínim 21 €) amb el que pagaríeu en transport públic.",
    ],
    faq: [
      { question: "Quin és l'horari del bus 46 de l'aeroport?", answer: "Funciona aproximadament de 5:00 a 24:00 entre les dues terminals i plaça Espanya, segons l'ATM. Cap pàgina oficial no en publica la freqüència." },
      { question: "Quin autobús nocturn va a l'aeroport de Barcelona?", answer: "L'N17 (plaça Catalunya – T1), de 23:00 a 5:00 des de plaça Catalunya, i l'N18 (plaça Catalunya – T1 i T2), de 0:05 a 4:50, tots dos cada 15 minuts cada dia, segons l'AMB." },
      { question: "Quant costa el bitllet de metro de l'aeroport?", answer: "El bitllet aeroport costa 5,90 €. La T-casual i el bitllet senzill no valen a les estacions Aeroport T1 i T2; la T-dia, la T-usual i la Hola Barcelona, sí." },
      { question: "Quin és l'horari de l'R2 Nord de l'aeroport?", answer: "Des de l'aeroport (T2) surt un tren cada 30 minuts, el primer a les 5:40 i l'últim a les 23:38. Cap a l'aeroport, el primer arriba a les 5:30 i l'últim a les 23:26." },
      { question: "Puc fer servir la T-casual des de l'aeroport?", answer: "No a les estacions de metro de l'aeroport (L9 Sud), però sí al tren R2 Nord, al bus 46 i als nitbus." },
      { question: "L'Aerobús para a Sants?", answer: "No. Segons l'AMB, cap al centre l'A1 para a la Gran Via, a Comte Borrell, a plaça Universitat i a plaça Catalunya. A Sants hi arriba el tren R2 Nord des de la T2 en 19 minuts." },
      { question: "Quant costa un taxi de l'aeroport al centre?", answer: "No hi ha preu oficial: és el taxímetre, amb un suplement de 4,60 € i un mínim de 21 € des de l'aeroport. L'únic preu fix és el de l'aeroport al Moll Adossat, 46 €." },
      { question: "A quina terminal opera Ryanair a l'aeroport de Barcelona?", answer: "A la T2, segons la llista d'aerolínies d'Aena (consultada el 20 d'octubre de 2026), igual que easyJet, Jet2.com i Aer Lingus. Vueling, Iberia i British Airways operen a la T1." },
    ],
  },
  en: {
    lead: "There are four public-transport ways from Barcelona airport to the city centre: **bus 46** (T1 and T2 to Plaça Espanya on the **€2.90** single ticket), the **L9 Sud metro** (the **€5.90** airport ticket, every 7 minutes), the **R2 Nord train** from T2 (every 30 minutes, **5:40 to 23:38**) and, at night, the **N17 and N18 night buses** to Plaça Catalunya every 15 minutes. Aena and the AMB also list the Aerobús express (A1 and A2) to Plaça Catalunya.",
    tableCaption: "Airport to the centre at a glance",
    headers: ["Option", "Terminals", "Fare", "Hours and time", "Frequency"],
    rows: [
      ["Bus 46", "T1 and T2", "€2.90 single ticket or integrated pass", "About 5:00 to 24:00; to Plaça Espanya", "No official frequency published"],
      ["Metro L9 Sud", "T1 and T2", "€5.90 airport ticket", "Metro hours; about 32 min with one change", "Every 7 min"],
      ["Train R2 Nord", "T2 only", "Integrated pass, T-casual included", "First 5:40, last 23:38; 19 min to Sants", "Every 30 min"],
      ["Night bus N17", "T1 only", "Integrated pass", "From T1, about 21:55 to 4:50", "Every 15 min"],
      ["Night bus N18", "T1 and T2", "Integrated pass", "From T1, about 0:18 to 4:33", "Every 15 min"],
      ["Aerobús A1 / A2", "A1: T1 · A2: T2", "Not published by Aena or the AMB", "Direct to Plaça Catalunya", "—"],
      ["Taxi", "T1 and T2", "Metered; minimum €21 from the airport", "Depends on traffic", "—"],
    ],
    tableNote: "Sources: Aena, AMB, TMB, ATM, Rodalies (R2 timetable of 1 September 2026) and the DOGC, checked on 28 October 2026. Bus times are approximate.",
    calloutText: "Times and fares change: each section says which official page it comes from. Check there before you travel.",
    bus46Title: "Bus 46 from Barcelona airport: hours, stops and fare",
    bus46: [
      "TMB's line **46** links both terminals with **Plaça Espanya**. At the airport it stops at **T1, Level 0 (Arrivals)**, and at **T2AB** and **T2C**, according to Aena. It runs **from about 5:00 to 24:00**, according to the ATM.",
      "It is an ordinary city bus: TMB's **€2.90 single ticket** works on it, and so does every integrated pass, including the T-casual, which the airport metro does not accept. From Plaça Espanya you continue on the metro (L1, L3) or FGC.",
      "No official page publishes the 46's frequency or journey time, so we do not either: if you land late, see the night buses.",
    ],
    nightTitle: "Night bus from Barcelona airport: N17 and N18",
    night: [
      "At night, two AMB NitBus lines link the airport with **Plaça Catalunya** every day, every 15 minutes. The **N17** serves **T1** only; in town it also stops at Plaça Universitat and Plaça Espanya. The **N18** starts at T1 and, towards Barcelona, also stops at **T2**. Integrated passes are valid.",
      "The **N19** also calls at both terminals but does not go to Barcelona: it runs between Castelldefels and El Prat's Rodalies station.",
    ],
    nightCaption: "Night buses between the airport and Plaça Catalunya",
    nightHeaders: ["Line", "From the airport", "From Plaça Catalunya"],
    nightRows: [
      ["N17 (T1)", "21:55 to 4:50", "23:00 to 5:00"],
      ["N18 (T1 and T2)", "0:18 to 4:33 (from T1)", "0:05 to 4:50"],
    ],
    nightNote: "Approximate AMB times, every day, every 15 minutes; the AMB warns that they depend on traffic.",
    metroTitle: "L9 metro to the airport: fare and hours",
    metro: (passes, hours) => [
      "The **L9 Sud** stops at both terminals (Aeroport T1 and Aeroport T2) and runs **every 7 minutes**. It does not reach the centre on its own: change at Torrassa (L1), Collblanc (L5), Zona Universitària (L3) or Can Tries | Gornal (L10 Sud). TMB gives **about 32 minutes** to the centre.",
      `To enter or leave those two stations you need the **airport ticket, €5.90**: under the 2026 fare resolution (DOGC) it includes a €3.05 station-maintenance surcharge and a further €0.75. The €2.90 single ticket, the **T-casual**, the T-familiar and the T-grup are **not valid** there. The **T-dia** (one trip to and one from the airport), the **T-usual** and the **Hola Barcelona** card (outbound and return included) are. ${passes}.`,
      `It keeps normal metro hours: 5:00 to 24:00 Sunday to Thursday, until 2:00 on Fridays and all night on Saturdays; ${hours}.`,
    ],
    trainTitle: "R2 Nord airport train: timetable",
    train: [
      "The Rodalies station is at **Terminal 2, Level 0**, served only by the **R2 Nord**, with **a train every 30 minutes** every day. It stops at El Prat, Bellvitge, **Barcelona-Sants** (19 minutes) and **Passeig de Gràcia** (24 minutes).",
      "It accepts **every integrated pass, the T-casual included**, so if you already hold one, the train costs you one journey. Landing at T1? The free shuttle takes about 10 minutes to T2.",
      `Before you head for the station, check [Rodalies disruptions today](${rodaliesHub("en")}), R2 Nord included.`,
    ],
    trainCaption: "R2 Nord: first and last trains",
    trainHeaders: ["Direction", "First train", "Last train", "Departures"],
    trainRows: [
      ["From the airport", "5:40", "23:38", "At :08 and :38"],
      ["To the airport (arrival)", "5:30 (leaves Sants 5:13)", "23:26 (leaves Sants 23:09)", "Arrives at :26 and :56"],
    ],
    trainNote: "Official Rodalies R2 timetable (1 September 2026), the same every day. Rodalies warns it is subject to change.",
    shuttleTitle: "Free shuttle between T1 and T2",
    shuttle: "Aena runs a **free bus between terminals** 24 hours a day, every day: every 5 minutes from 8:00 to 20:00, every 7 from 5:00 to 8:00 and from 20:00 to 24:00, and every 10 from 0:00 to 5:00. T1 to T2 takes about **10 minutes**; T2 to T1 about **14**.",
    expressTitle: "Aerobús: the express bus to Plaça Catalunya",
    express: [
      "Aena and the AMB list two express lines to **Plaça Catalunya**: **A1** from **T1** and **A2** from **T2** (T2B and T2C). According to the AMB, into town the A1 stops on the Gran Via de les Corts Catalanes, at Gran Via – Comte Borrell and at Plaça Universitat; **it does not stop at Sants**.",
      "Neither Aena nor the AMB publishes its fare or timetable, so we do not give them: you will find them at the stop.",
    ],
    taxiTitle: "Taxi from Barcelona airport to the centre: price",
    taxi: [
      "Taxis run on the AMB's 2026 tariff: €2.80 flag fall, €1.35 per km on weekdays from 8:00 to 20:00 and €1.66 at night, on Saturdays and on public holidays, plus a **€4.60 supplement** for starting or ending at the airport. A trip from the airport costs **at least €21**, supplements included. Tolls are paid by the passenger.",
      "There is no official price to the centre: it depends on the meter and the traffic. The only fixed price in the tariff is airport to the cruise terminal (Moll Adossat), **€46**; taxis booked through an app may offer a closed price (tariff T-3). The ranks are opposite arrivals at T1 (Level 0) and at T2A, T2B and T2C; the official taxi is black and yellow.",
    ],
    terminalTitle: "Which terminal? It depends on your airline",
    terminal: "Aena's airline list gives each airline's terminal. **Vueling, Iberia, British Airways, Air Europa, Lufthansa, Emirates and United Airlines use T1**; **Ryanair, easyJet, Jet2.com, Aer Lingus, Wizz Air, Volotea, Transavia, Norwegian and Eurowings use T2** (checked 20 October 2026). From T1 you have bus 46, the metro and the N17; from T2, bus 46, the metro, the train and the N18. Assignments can change, so check your booking or [Aena's airline list](https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/airlines-and-destinations/airlines.html).",
    backTitle: "Going back to the airport",
    back: [
      "**Train:** the last R2 Nord to the airport leaves Passeig de Gràcia at 23:02 and Sants at 23:09; the first leaves Sants at 5:13. It arrives at T2: if you fly from T1, add the shuttle (about 14 minutes).",
      "**Metro:** the airport ticket works in both directions. The T-casual does not get you out at the airport stations either.",
      "**At night:** the N17 leaves Plaça Catalunya for T1 from 23:00 to 5:00 and the N18 from 0:05 to 4:50, every 15 minutes.",
      "**Aerobús:** according to the AMB, the A1 leaves Plaça Catalunya and stops at Sepúlveda – Comte d'Urgell and Plaça Espanya before T1 (Departures and Arrivals); the A2 goes to T2.",
    ],
    pickTitle: "Which one to pick",
    pick: [
      "**Already holding a T-casual:** R2 Nord from T2, bus 46 or the night buses; not the airport metro.",
      "**Holding a T-dia, T-usual or Hola Barcelona:** the L9 Sud metro is included.",
      "**Catching a train at Sants, or staying near Passeig de Gràcia, landing at T2:** R2 Nord.",
      "**Landing in the small hours:** N17 from T1 or N18 from T1 and T2, every 15 minutes to Plaça Catalunya.",
      "**Three or four people with luggage:** compare the taxi meter (minimum €21) with what you would pay on public transport.",
    ],
    faq: [
      { question: "What are the hours of bus 46 at Barcelona airport?", answer: "It runs from about 5:00 to 24:00 between both terminals and Plaça Espanya, according to the ATM. No official page publishes its frequency." },
      { question: "Which night bus goes to Barcelona airport?", answer: "The N17 (Plaça Catalunya – T1), 23:00 to 5:00 from Plaça Catalunya, and the N18 (Plaça Catalunya – T1 and T2), 0:05 to 4:50, both every 15 minutes every day, according to the AMB." },
      { question: "How much is the metro from Barcelona airport?", answer: "The airport ticket costs €5.90. The T-casual and the single ticket are not valid at Aeroport T1 and T2; the T-dia, T-usual and Hola Barcelona are." },
      { question: "What is the R2 Nord airport train timetable?", answer: "From the airport (T2) a train leaves every 30 minutes, the first at 5:40 and the last at 23:38. Towards the airport, the first arrives at 5:30 and the last at 23:26." },
      { question: "Can I use the T-casual from the airport?", answer: "Not at the airport metro stations (L9 Sud), but yes on the R2 Nord train, bus 46 and the night buses." },
      { question: "Does the Aerobús stop at Barcelona-Sants?", answer: "No. According to the AMB, into town the A1 stops on the Gran Via, at Comte Borrell, at Plaça Universitat and at Plaça Catalunya. The R2 Nord train reaches Sants from T2 in 19 minutes." },
      { question: "How much is a taxi from Barcelona airport to the city centre?", answer: "There is no official price: it is metered, with a €4.60 supplement and a €21 minimum from the airport. The only fixed price is airport to Moll Adossat, €46." },
      { question: "Which terminal does Ryanair use at Barcelona airport?", answer: "T2, on Aena's airline list (checked 20 October 2026), like easyJet, Jet2.com and Aer Lingus. Vueling, Iberia and British Airways use T1." },
    ],
  },
};

const PASSES: Record<Locale, string> = {
  ca: `${b2link("transport", "ca", "Quina targeta et convé")} les compara`,
  es: `${b2link("transport", "es", "Qué tarjeta te conviene")} las compara`,
  en: `${b2link("transport", "en", "Which pass to buy")} compares them`,
};

const HOURS_LINK: Record<Locale, string> = {
  ca: `el detall és a ${b2link("hours", "ca", "l'horari del metro de Barcelona")}`,
  es: `el detalle está en ${b2link("hours", "es", "el horario del metro de Barcelona")}`,
  en: `the detail is in ${b2link("hours", "en", "Barcelona metro hours")}`,
};

function body(locale: Locale): ReturnType<typeof paras> {
  const t = COPY[locale];
  return [
    lead(t.lead),
    table(t.tableCaption, t.headers, t.rows, t.tableNote),
    callout("official", verifiedLine(locale, VERIFIED), t.calloutText),
    ...h2(t.bus46Title, ...t.bus46),
    ...h2(t.nightTitle, ...t.night),
    table(t.nightCaption, t.nightHeaders, t.nightRows, t.nightNote),
    ...h2(t.metroTitle, ...t.metro(PASSES[locale], HOURS_LINK[locale])),
    ...h2(t.trainTitle, ...t.train),
    table(t.trainCaption, t.trainHeaders, t.trainRows, t.trainNote),
    ...h2(t.shuttleTitle, t.shuttle),
    ...h2(t.expressTitle, ...t.express),
    ...h2(t.taxiTitle, ...t.taxi),
    ...h2(t.terminalTitle, t.terminal),
    ...h2(t.backTitle, ...t.back),
    ...h2(t.pickTitle),
    list(...t.pick),
    faq(t.faq),
    ...b2Related(["barcelonaHub", "transport", "touristTax", "cruiseport", "hours"], locale),
  ];
}

export const AIRPORT: B2Article = {
  key: "airport",
  entryKey: "guide-barcelona-airport-to-city",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "aeroport-aerobus-placa-catalunya",
  heroAlt: {
    ca: "Un autobús de l'Aerobús a la parada de plaça Catalunya, a Barcelona",
    es: "Un autobús del Aerobús en la parada de plaza Catalunya, en Barcelona",
    en: "An Aerobús shuttle at the Plaça Catalunya stop in Barcelona",
  },
  heroCaption: {
    ca: "L'Aerobús acaba a plaça Catalunya; per anar a Sants, l'R2 Nord des de la T2.",
    es: "El Aerobús termina en plaza Catalunya; para ir a Sants, el R2 Nord desde la T2.",
    en: "The Aerobús ends at Plaça Catalunya; for Sants, take the R2 Nord from T2.",
  },
  secondaryKey: "aeroport-metro-l9-aeroport-t1",
  secondaryAlt: {
    ca: "Andana de l'estació de metro Aeroport T1 de la línia L9 Sud, amb portes d'andana",
    es: "Andén de la estación de metro Aeroport T1 de la línea L9 Sud, con puertas de andén",
    en: "Platform of Aeroport T1 station on metro line L9 Sud, with platform screen doors",
  },
  secondaryCaption: {
    ca: "Aeroport T1, a la L9 Sud: aquí la T-casual no val.",
    es: "Aeroport T1, en la L9 Sud: aquí la T-casual no vale.",
    en: "Aeroport T1 on the L9 Sud: the T-casual is not valid here.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T12:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as AIRPORT_META };
