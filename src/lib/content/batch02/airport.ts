import type { Locale } from "@/lib/i18n/config";

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
 * Barcelona airport to the city centre.
 *
 * The pages that rank for this quote different Aerobús fares (€6.75, €7.45,
 * €7.75) and none of them is the operator. Every figure below was checked on
 * the operators' own pages on 12 Oct 2026 - Aerobús (Monbus), TMB, Rodalies,
 * Aena, AMB - and the fact pack with quotes is in
 * research_notes/blog-batch-03/airport.md.
 *
 * Deliberately left out because no official source gives it: a "typical" taxi
 * total to the centre, the Rodalies single fare (the page carrying it has no
 * date), exact night-bus timetables. The guide says how to get those figures
 * rather than inventing them.
 *
 * Never link aerobusbcn.com: that old domain now redirects to an unrelated
 * site. The operator's site is aerobusbarcelona.es.
 */

const VERIFIED = "2026-10-12";

const SOURCES: B2Source[] = [
  { name: "Aerobús — rates", url: "https://aerobusbarcelona.es/en/rates/", publisher: "Aerobús (Monbus)" },
  { name: "Aerobús — FAQs, lines and stops", url: "https://aerobusbarcelona.es/en/faqs/", publisher: "Aerobús (Monbus)" },
  {
    name: "Accessing Barcelona from the airport by metro",
    url: "https://www.tmb.cat/en/visit-barcelona/public-transport/metro-airport",
    publisher: "TMB",
  },
  { name: "Metro and bus fares", url: "https://www.tmb.cat/en/barcelona-fares-metro-bus", publisher: "TMB" },
  {
    name: "R2 Nord line",
    url: "https://rodalies.gencat.cat/en/sobre-rodalies/linies-i-estacions/servei_rodalia_barcelona/r2n/index.html",
    publisher: "Rodalies de Catalunya",
  },
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
  { name: "Aerobús A1, city to T1", url: "https://aerobusbarcelona.es/en/lines-stops-and-schedules/line-a1-outbound/", publisher: "Aerobús (Monbus)" },
  { name: "Aerobús A2, city to T2", url: "https://aerobusbarcelona.es/en/lines-stops-and-schedules/line-a2-outbound/", publisher: "Aerobús (Monbus)" },
  {
    name: "Tarifes urbanes del taxi per al 2026",
    url: "https://taxi.amb.cat/es/imet/actualitat/noticies/detall/-/noticiataxi/tarifes-urbanes-del-taxi-per-al-2026/29760500/956832",
    publisher: "Àrea Metropolitana de Barcelona",
  },
];

const AEROBUS = "https://aerobusbarcelona.es/en/rates/";
const link = (label: string, url: string) => `[${label}](${url})`;

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
    title: "De l'aeroport del Prat al centre de Barcelona: metro, Aerobús, tren o taxi",
    seoTitle: "Aeroport del Prat al centre: Aerobús, metro, tren, taxi",
    seoDescription:
      "Com anar de l'aeroport del Prat al centre de Barcelona: Aerobús (7,75 €), metro L9 (5,90 €), tren R2 Nord i taxi. Preus i horaris dels operadors.",
    excerpt:
      "Les quatre maneres d'arribar de l'aeroport al centre de Barcelona, amb els preus i els temps que publiquen els operadors, i quina triar segons on vas i quin bitllet tens.",
  },
  es: {
    path: "guias/aeropuerto-barcelona-centro",
    title: "Del aeropuerto de El Prat al centro de Barcelona: metro, Aerobús, tren o taxi",
    seoTitle: "Aeropuerto de El Prat al centro: Aerobús, metro, tren, taxi",
    seoDescription:
      "Cómo ir del aeropuerto de El Prat al centro de Barcelona: Aerobús (7,75 €), metro L9 (5,90 €), tren R2 Nord y taxi. Precios y horarios de los operadores.",
    excerpt:
      "Las cuatro maneras de llegar del aeropuerto al centro de Barcelona, con los precios y tiempos que publican los operadores, y cuál elegir según adónde vas y qué billete tienes.",
  },
  en: {
    path: "guides/barcelona-airport-to-city-centre",
    title: "Barcelona airport to the city centre: metro, Aerobús, train or taxi",
    seoTitle: "Barcelona airport to city centre: Aerobús, metro, train, taxi",
    seoDescription:
      "How to get from Barcelona El Prat airport to the city centre: Aerobús (€7.75), L9 metro (€5.90), R2 Nord train and taxi. Fares and times from the operators.",
    excerpt:
      "The four ways from the airport to central Barcelona, with the fares and journey times the operators publish, and which to pick for where you are going and what ticket you hold.",
  },
};

function body(locale: Locale): ReturnType<typeof paras> {
  if (locale === "en") {
    return [
      lead(
        "There are four ways into central Barcelona from El Prat: the **Aerobús** shuttle, the **L9 Sud metro**, the **R2 Nord train** and a **taxi**. Which is best depends on which terminal you land at, where you are staying and whether you already hold a transport pass.",
      ),
      table(
        "Airport to the centre at a glance",
        ["Option", "Terminals", "Fare", "Time to the centre", "Frequency"],
        [
          ["Aerobús A1 / A2", "A1: T1 · A2: T2", "€7.75 single, €13.30 return", "30–35 min to Plaça Catalunya", "Every 5–10 min by day"],
          ["Metro L9 Sud", "T1 and T2", "€5.90 airport ticket", "About 32 min, with one change", "Every 7 min"],
          ["Train R2 Nord", "T2 only", "Rodalies ticket or integrated pass", "About 20 min to Sants, 25 to Passeig de Gràcia", "Every 30 min"],
          ["Taxi", "T1 and T2", "Metered; minimum €21 from the airport", "Depends on traffic", "—"],
        ],
        "Fares and times from Aerobús, TMB, Rodalies and AMB. Train times read from the official R2 timetable of 1 September 2026.",
      ),
      callout("official", verifiedLine("en", VERIFIED), "Fares change. Each section links the operator's own page: check there before you travel."),
      ...h2(
        "Aerobús: the simplest, if you are going to Plaça Catalunya",
        "The Aerobús is a direct shuttle run by Monbus. **Line A1 serves Terminal 1 and line A2 serves Terminal 2** (T2B and T2C), so check your terminal with your airline. Into town, both lines stop at Plaça Espanya, Gran Via – Borrell and Plaça Universitat and end at Plaça Catalunya. The operator gives the journey as about 30 to 35 minutes.",
        `A single costs **€7.75** and a return **€13.30** on the operator's ${link("rates page", AEROBUS)}. Tickets are valid for 90 days from purchase; the return half is valid for another 90 days from the outbound trip. You can buy online, in the app, at machines at the airport and in the centre, from staff at the stops and on the bus. Children under 4 travel free.`,
        "It runs 24 hours a day. From T1 the A1 leaves every 5 minutes from 07:15 to 22:30 and every 10 to 20 minutes outside those hours; the A2 leaves T2 every 10 minutes from 05:35 to 23:00 and every 20 minutes overnight.",
      ),
      callout(
        "warning",
        "The Aerobús does not stop at Sants",
        `If you are catching a long-distance train at Barcelona-Sants, take the R2 Nord train or the metro instead. And buy only from aerobusbarcelona.es: the old domain aerobusbcn.com now redirects to an unrelated site.`,
      ),
      ...h2(
        "Metro L9 Sud: cheapest from both terminals, with a change",
        "The L9 Sud stops at both terminals and runs every 7 minutes. It does **not** reach the centre on its own: you change at Torrassa (L1), Collblanc (L5), Zona Universitària (L3) or Can Tries | Gornal (L10 Sud). TMB gives about 32 minutes from the airport to the city centre.",
        `The airport stations need the **airport ticket, €5.90**. The single ticket (€2.90) and the **T-casual are not valid** at Aeroport T1 and T2; if you arrive with one, you must buy the airport ticket to get out. The **T-dia** covers one trip to the airport and one from it, and the **Hola Barcelona** card includes airport metro trips. ${b2link("transport", "en", "Which pass to buy")} compares them.`,
        "The metro runs from 05:00 to midnight Monday to Thursday, until 02:00 on Fridays and the eves of public holidays, and all night on Saturdays.",
      ),
      ...h2(
        "Train R2 Nord: fastest to Sants and Passeig de Gràcia, from T2",
        "The Rodalies R2 Nord leaves from the station next to **Terminal 2** every 30 minutes and stops at Barcelona-Sants, Passeig de Gràcia and El Clot-Aragó. On the official timetable it takes about 20 minutes to Sants and 25 to Passeig de Gràcia.",
        "Unlike the airport metro, the train accepts **every integrated pass, the T-casual included**, so if you already hold one this is the way in that costs you a single journey. Landing at T1? The free shuttle bus between terminals takes about 10 minutes to T2.",
      ),
      ...h2(
        "Taxi",
        "Airport taxis in the metropolitan area run on the AMB meter. In 2026 the flag fall is €2.80, the rate is €1.35 per km on weekdays from 08:00 to 20:00 and €1.66 at night, on Saturdays and on public holidays, and trips to or from the airport carry a **€4.60 supplement**. The minimum fare for a trip starting at the airport, all supplements included, is **€21**.",
        "No official source publishes a typical total to the centre, because it depends on the meter and the traffic; be wary of anyone quoting a fixed price, which the AMB tariff only sets for the airport–cruise terminal (Moll Adossat) run, at €46.",
      ),
      ...h2(
        "Between terminals, and at night",
        "Aena runs a **free shuttle bus between T1 and T2**, 24 hours a day, every 5 to 10 minutes; T1 to T2 takes about 10 minutes and T2 to T1 about 14.",
        "At night, besides the Aerobús, the night buses **N17** (from T1) and **N18** (T1 and T2) run to Plaça Catalunya roughly from midnight to 05:00, every 20 to 30 minutes, and accept integrated passes.",
      ),
      ...h2(
        "Which terminal? It depends on your airline",
        "Aena's airline list gives each airline's terminal. **Vueling, Iberia, British Airways, Air Europa, Lufthansa, Emirates and United Airlines use T1**; **Ryanair, easyJet, Jet2.com, Aer Lingus, Wizz Air, Volotea, Transavia, Norwegian and Eurowings use T2**. From T1 you have the A1 Aerobús and the L9 Sud metro; from T2, the A2 Aerobús, the L9 Sud metro and the R2 Nord train. Assignments can change, so check your booking or [Aena's airline list](https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/airlines-and-destinations/airlines.html) before you travel.",
      ),
      ...h2(
        "Going back to the airport",
        "**Aerobús.** Both lines start at Plaça Catalunya and, on the way out, stop only at Carrer Sepúlveda and Plaça Espanya, so board at one of those three. Take the **A1 for T1** (it stops at Level 3, Departures) and the **A2 for T2** (it stops on the airport road at T2B). From the centre, the A1 leaves every 5 minutes from 06:40 to 21:55 and the A2 every 10 minutes from 05:00 to 22:30; overnight both leave every 20 minutes.",
        "**Metro.** TMB's airport ticket works in both directions: it takes you to the airport from any metro station. The T-casual is not valid at the airport stations on the way out either.",
        "**Train.** The R2 Nord runs to Aeroport every 30 minutes and arrives at T2. If you fly from T1, add Aena's free shuttle, which takes about 14 minutes from T2 to T1.",
      ),
      ...h2("Which one to pick"),
      list(
        "**Staying near Plaça Catalunya, Universitat or Plaça Espanya:** Aerobús. No change, frequent, luggage-friendly.",
        "**Catching a train at Sants, or staying around Passeig de Gràcia, landing at T2:** R2 Nord.",
        "**Already holding a T-casual:** R2 Nord or bus 46 and the night buses; not the airport metro.",
        "**Holding a T-dia or Hola Barcelona:** the L9 Sud metro is included.",
        "**Three or four people with luggage, or arriving very late:** compare the taxi meter with three or four Aerobús tickets.",
      ),
      faq([
        {
          question: "How much is the Aerobús from Barcelona airport?",
          answer: `€7.75 one way and €13.30 return on the operator's rates page, checked on ${VERIFIED}. Children under 4 travel free.`,
        },
        {
          question: "Can I use the T-casual from the airport?",
          answer: "Not on the airport metro stations (L9 Sud), but yes on the R2 Nord train, the bus 46 and the night buses.",
        },
        {
          question: "Does the Aerobús stop at Barcelona-Sants?",
          answer: "No. Neither Aerobús line stops at Sants; the R2 Nord train goes there from T2 in about 20 minutes.",
        },
        {
          question: "Which terminal does the train leave from?",
          answer: "The R2 Nord station is at Terminal 2. From T1, take the free shuttle bus between terminals.",
        },
        {
          question: "Which terminal does Ryanair use at Barcelona airport?",
          answer: "T2, on Aena's airline list (checked 20 October 2026), like easyJet, Jet2.com and Aer Lingus. Vueling, Iberia and British Airways use T1.",
        },
        {
          question: "Where do I catch the Aerobús back to the airport?",
          answer: "At Plaça Catalunya, Carrer Sepúlveda or Plaça Espanya. The A1 goes to T1 and the A2 to T2.",
        },
      ]),
      ...b2Related(["barcelonaHub", "transport", "touristTax", "cruiseport", "hours"], "en"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        "Hay cuatro maneras de llegar al centro de Barcelona desde El Prat: el **Aerobús**, el **metro L9 Sud**, el **tren R2 Nord** y el **taxi**. La mejor depende de la terminal a la que llegas, de dónde te alojas y de si ya tienes un título de transporte.",
      ),
      table(
        "Del aeropuerto al centro, de un vistazo",
        ["Opción", "Terminales", "Precio", "Tiempo al centro", "Frecuencia"],
        [
          ["Aerobús A1 / A2", "A1: T1 · A2: T2", "7,75 € ida, 13,30 € ida y vuelta", "30–35 min a plaza Catalunya", "Cada 5–10 min de día"],
          ["Metro L9 Sud", "T1 y T2", "Billete aeropuerto 5,90 €", "Unos 32 min, con un transbordo", "Cada 7 min"],
          ["Tren R2 Nord", "Solo T2", "Billete de Rodalies o título integrado", "Unos 20 min a Sants, 25 a Passeig de Gràcia", "Cada 30 min"],
          ["Taxi", "T1 y T2", "Taxímetro; mínimo 21 € desde el aeropuerto", "Según el tráfico", "—"],
        ],
        "Precios y tiempos de Aerobús, TMB, Rodalies y AMB. Tiempos del tren leídos del horario oficial de la R2 del 1 de septiembre de 2026.",
      ),
      callout("official", verifiedLine("es", VERIFIED), "Los precios cambian. Cada apartado enlaza la página del operador: compruébalo allí antes de viajar."),
      ...h2(
        "Aerobús: lo más sencillo si vas a plaza Catalunya",
        "El Aerobús es un autobús directo que opera Monbus. **La línea A1 sale de la Terminal 1 y la A2 de la Terminal 2** (T2B y T2C): confirma tu terminal con la aerolínea. Hacia la ciudad, las dos paran en plaza Espanya, Gran Via – Borrell y plaza Universitat y terminan en plaza Catalunya. El operador calcula entre 30 y 35 minutos.",
        `El billete sencillo cuesta **7,75 €** y el de ida y vuelta **13,30 €** según la ${link("página de tarifas", AEROBUS)} del operador. Los billetes valen 90 días desde la compra; la vuelta, otros 90 días desde el viaje de ida. Se compran en línea, en la app, en las máquinas del aeropuerto y del centro, al personal de las paradas y en el propio autobús. Los menores de 4 años viajan gratis.`,
        "Funciona las 24 horas. Desde la T1, el A1 sale cada 5 minutos de 07:15 a 22:30 y cada 10 a 20 minutos fuera de esa franja; el A2 sale de la T2 cada 10 minutos de 05:35 a 23:00 y cada 20 minutos de noche.",
      ),
      callout(
        "warning",
        "El Aerobús no para en Sants",
        "Si tienes que coger un tren en Barcelona-Sants, ve en el R2 Nord o en metro. Y compra solo en aerobusbarcelona.es: el antiguo dominio aerobusbcn.com redirige ahora a otra web que no tiene nada que ver.",
      ),
      ...h2(
        "Metro L9 Sud: lo más barato desde las dos terminales, con transbordo",
        "La L9 Sud para en las dos terminales y pasa cada 7 minutos. **No** llega al centro por sí sola: hay que cambiar en Torrassa (L1), Collblanc (L5), Zona Universitària (L3) o Can Tries | Gornal (L10 Sud). TMB calcula unos 32 minutos hasta el centro.",
        `Las estaciones del aeropuerto piden el **billete aeropuerto, 5,90 €**. El billete sencillo (2,90 €) y la **T-casual no valen** en Aeroport T1 y T2; si llegas con uno de ellos, tendrás que comprar el billete aeropuerto para salir. La **T-dia** incluye un viaje de ida y uno de vuelta al aeropuerto, y la **Hola Barcelona** incluye los viajes en metro al aeropuerto. ${b2link("transport", "es", "Qué tarjeta te conviene")} las compara.`,
        "El metro funciona de 05:00 a medianoche de lunes a jueves, hasta las 02:00 los viernes y vísperas de festivo, y toda la noche del sábado.",
      ),
      ...h2(
        "Tren R2 Nord: lo más rápido a Sants y Passeig de Gràcia, desde la T2",
        "El R2 Nord de Rodalies sale de la estación junto a la **Terminal 2** cada 30 minutos y para en Barcelona-Sants, Passeig de Gràcia y El Clot-Aragó. Según el horario oficial tarda unos 20 minutos hasta Sants y 25 hasta Passeig de Gràcia.",
        "A diferencia del metro del aeropuerto, el tren acepta **todos los títulos integrados, también la T-casual**: si ya tienes uno, te cuesta un viaje. ¿Llegas a la T1? El autobús gratuito entre terminales tarda unos 10 minutos hasta la T2.",
      ),
      ...h2(
        "Taxi",
        "Los taxis del aeropuerto en el área metropolitana funcionan con la tarifa del AMB. En 2026 la bajada de bandera es de 2,80 €, el kilómetro cuesta 1,35 € los laborables de 08:00 a 20:00 y 1,66 € de noche, sábados y festivos, y los servicios con origen o destino en el aeropuerto llevan un **suplemento de 4,60 €**. El importe **mínimo** de un servicio con origen en el aeropuerto, con todos los suplementos, es de **21 €**.",
        "Ninguna fuente oficial publica un precio habitual hasta el centro, porque depende del taxímetro y del tráfico; desconfía de quien te ofrezca un precio cerrado, que la tarifa del AMB solo fija para el trayecto aeropuerto–terminal de cruceros (Moll Adossat), en 46 €.",
      ),
      ...h2(
        "Entre terminales, y de noche",
        "Aena tiene un **autobús gratuito entre la T1 y la T2**, las 24 horas, cada 5 a 10 minutos; de la T1 a la T2 tarda unos 10 minutos y de la T2 a la T1 unos 14.",
        "De noche, además del Aerobús, los nitbus **N17** (desde la T1) y **N18** (T1 y T2) van a plaza Catalunya aproximadamente de medianoche a las 05:00, cada 20 a 30 minutos, y aceptan títulos integrados.",
      ),
      ...h2(
        "¿Qué terminal? Depende de tu aerolínea",
        "La lista de aerolíneas de Aena indica la terminal de cada una. **Vueling, Iberia, British Airways, Air Europa, Lufthansa, Emirates y United Airlines operan en la T1**; **Ryanair, easyJet, Jet2.com, Aer Lingus, Wizz Air, Volotea, Transavia, Norwegian y Eurowings, en la T2**. Desde la T1 tienes el Aerobús A1 y el metro L9 Sud; desde la T2, el Aerobús A2, el metro L9 Sud y el tren R2 Nord. Las asignaciones pueden cambiar: compruébalo en tu reserva o en la [lista de aerolíneas de Aena](https://www.aena.es/es/josep-tarradellas-barcelona-el-prat/aerolineas-y-destinos/aerolineas.html) antes de viajar.",
      ),
      ...h2(
        "Volver al aeropuerto",
        "**Aerobús.** Las dos líneas salen de plaza Catalunya y, en dirección al aeropuerto, solo paran en la calle Sepúlveda y en plaza Espanya: sube en una de esas tres paradas. Coge el **A1 para la T1** (para en la planta 3, Salidas) y el **A2 para la T2** (para en el vial de la T2B). Desde el centro, el A1 sale cada 5 minutos de 06:40 a 21:55 y el A2 cada 10 minutos de 05:00 a 22:30; de madrugada, los dos salen cada 20 minutos.",
        "**Metro.** El billete aeropuerto de TMB vale en los dos sentidos: te lleva al aeropuerto desde cualquier estación de metro. La T-casual tampoco vale a la ida en las estaciones del aeropuerto.",
        "**Tren.** El R2 Nord va a Aeroport cada 30 minutos y llega a la T2. Si vuelas desde la T1, súmale el autobús gratuito de Aena, que tarda unos 14 minutos de la T2 a la T1.",
      ),
      ...h2("Cuál elegir"),
      list(
        "**Te alojas cerca de plaza Catalunya, Universitat o plaza Espanya:** Aerobús. Sin transbordos, frecuente y cómodo con maletas.",
        "**Coges un tren en Sants o te alojas cerca de Passeig de Gràcia, y llegas a la T2:** R2 Nord.",
        "**Ya tienes una T-casual:** R2 Nord, bus 46 o nitbus; no el metro del aeropuerto.",
        "**Tienes una T-dia o la Hola Barcelona:** el metro L9 Sud está incluido.",
        "**Tres o cuatro personas con maletas, o llegada muy tarde:** compara el taxímetro con tres o cuatro billetes de Aerobús.",
      ),
      faq([
        {
          question: "¿Cuánto cuesta el Aerobús desde el aeropuerto de Barcelona?",
          answer: `7,75 € la ida y 13,30 € ida y vuelta según la página de tarifas del operador, comprobado el ${VERIFIED}. Los menores de 4 años viajan gratis.`,
        },
        {
          question: "¿Puedo usar la T-casual desde el aeropuerto?",
          answer: "No en las estaciones de metro del aeropuerto (L9 Sud), pero sí en el tren R2 Nord, el bus 46 y los nitbus.",
        },
        {
          question: "¿El Aerobús para en Sants?",
          answer: "No. Ninguna línea del Aerobús para en Sants; el tren R2 Nord llega desde la T2 en unos 20 minutos.",
        },
        {
          question: "¿De qué terminal sale el tren?",
          answer: "La estación del R2 Nord está en la Terminal 2. Desde la T1, coge el autobús gratuito entre terminales.",
        },
        {
          question: "¿En qué terminal opera Ryanair en el aeropuerto de Barcelona?",
          answer: "En la T2, según la lista de aerolíneas de Aena (consultada el 20 de octubre de 2026), igual que easyJet, Jet2.com y Aer Lingus. Vueling, Iberia y British Airways operan en la T1.",
        },
        {
          question: "¿Dónde se coge el Aerobús para volver al aeropuerto?",
          answer: "En plaza Catalunya, en la calle Sepúlveda o en plaza Espanya. El A1 va a la T1 y el A2 a la T2.",
        },
      ]),
      ...b2Related(["barcelonaHub", "transport", "touristTax", "cruiseport", "hours"], "es"),
    ];
  }

  return [
    lead(
      "Hi ha quatre maneres d'arribar al centre de Barcelona des del Prat: l'**Aerobús**, el **metro L9 Sud**, el **tren R2 Nord** i el **taxi**. La millor depèn de la terminal on arribes, d'on t'allotges i de si ja tens un títol de transport.",
    ),
    table(
      "De l'aeroport al centre, d'un cop d'ull",
      ["Opció", "Terminals", "Preu", "Temps fins al centre", "Freqüència"],
      [
        ["Aerobús A1 / A2", "A1: T1 · A2: T2", "7,75 € anada, 13,30 € anada i tornada", "30–35 min a plaça Catalunya", "Cada 5–10 min de dia"],
        ["Metro L9 Sud", "T1 i T2", "Bitllet aeroport 5,90 €", "Uns 32 min, amb un transbord", "Cada 7 min"],
        ["Tren R2 Nord", "Només T2", "Bitllet de Rodalies o títol integrat", "Uns 20 min a Sants, 25 a Passeig de Gràcia", "Cada 30 min"],
        ["Taxi", "T1 i T2", "Taxímetre; mínim 21 € des de l'aeroport", "Segons el trànsit", "—"],
      ],
      "Preus i temps d'Aerobús, TMB, Rodalies i AMB. Temps del tren llegits de l'horari oficial de l'R2 de l'1 de setembre de 2026.",
    ),
    callout("official", verifiedLine("ca", VERIFIED), "Els preus canvien. Cada apartat enllaça la pàgina de l'operador: comprova-ho allà abans de viatjar."),
    ...h2(
      "Aerobús: el més senzill si vas a plaça Catalunya",
      "L'Aerobús és un autobús directe que opera Monbus. **La línia A1 surt de la Terminal 1 i l'A2 de la Terminal 2** (T2B i T2C): confirma la terminal amb l'aerolínia. Cap a la ciutat, totes dues paren a plaça Espanya, Gran Via – Borrell i plaça Universitat i acaben a plaça Catalunya. L'operador calcula entre 30 i 35 minuts.",
      `El bitllet senzill costa **7,75 €** i el d'anada i tornada **13,30 €** segons la ${link("pàgina de tarifes", AEROBUS)} de l'operador. Els bitllets valen 90 dies des de la compra; la tornada, 90 dies més des del viatge d'anada. Es compren en línia, a l'app, a les màquines de l'aeroport i del centre, al personal de les parades i al mateix autobús. Els menors de 4 anys viatgen gratis.`,
      "Funciona les 24 hores. Des de la T1, l'A1 surt cada 5 minuts de 07:15 a 22:30 i cada 10 a 20 minuts fora d'aquesta franja; l'A2 surt de la T2 cada 10 minuts de 05:35 a 23:00 i cada 20 minuts de nit.",
    ),
    callout(
      "warning",
      "L'Aerobús no para a Sants",
      "Si has d'agafar un tren a Barcelona-Sants, ves-hi amb l'R2 Nord o amb metro. I compra només a aerobusbarcelona.es: l'antic domini aerobusbcn.com ara redirigeix a una altra web que no hi té res a veure.",
    ),
    ...h2(
      "Metro L9 Sud: el més barat des de les dues terminals, amb transbord",
      "La L9 Sud para a les dues terminals i passa cada 7 minuts. **No** arriba al centre tota sola: cal canviar a Torrassa (L1), Collblanc (L5), Zona Universitària (L3) o Can Tries | Gornal (L10 Sud). TMB calcula uns 32 minuts fins al centre.",
      `Les estacions de l'aeroport demanen el **bitllet aeroport, 5,90 €**. El bitllet senzill (2,90 €) i la **T-casual no hi valen**; si hi arribes amb un d'aquests, hauràs de comprar el bitllet aeroport per sortir. La **T-dia** inclou un viatge d'anada i un de tornada a l'aeroport, i la **Hola Barcelona** inclou els viatges en metro a l'aeroport. ${b2link("transport", "ca", "Quina targeta et convé")} les compara.`,
      "El metro funciona de 05:00 a mitjanit de dilluns a dijous, fins a les 02:00 els divendres i vigílies de festiu, i tota la nit del dissabte.",
    ),
    ...h2(
      "Tren R2 Nord: el més ràpid a Sants i Passeig de Gràcia, des de la T2",
      "L'R2 Nord de Rodalies surt de l'estació al costat de la **Terminal 2** cada 30 minuts i para a Barcelona-Sants, Passeig de Gràcia i el Clot-Aragó. Segons l'horari oficial triga uns 20 minuts fins a Sants i 25 fins a Passeig de Gràcia.",
      "A diferència del metro de l'aeroport, el tren accepta **tots els títols integrats, també la T-casual**: si ja en tens un, et costa un viatge. Arribes a la T1? L'autobús gratuït entre terminals triga uns 10 minuts fins a la T2.",
    ),
    ...h2(
      "Taxi",
      "Els taxis de l'aeroport a l'àrea metropolitana funcionen amb la tarifa de l'AMB. El 2026 la baixada de bandera és de 2,80 €, el quilòmetre costa 1,35 € els feiners de 08:00 a 20:00 i 1,66 € de nit, dissabtes i festius, i els serveis amb origen o destinació a l'aeroport porten un **suplement de 4,60 €**. L'import **mínim** d'un servei amb origen a l'aeroport, amb tots els suplements, és de **21 €**.",
      "Cap font oficial publica un preu habitual fins al centre, perquè depèn del taxímetre i del trànsit; desconfia de qui t'ofereixi un preu tancat, que la tarifa de l'AMB només fixa per al trajecte aeroport–terminal de creuers (Moll Adossat), a 46 €.",
    ),
    ...h2(
      "Entre terminals, i de nit",
      "Aena té un **autobús gratuït entre la T1 i la T2**, les 24 hores, cada 5 a 10 minuts; de la T1 a la T2 triga uns 10 minuts i de la T2 a la T1 uns 14.",
      "De nit, a més de l'Aerobús, els nitbus **N17** (des de la T1) i **N18** (T1 i T2) van a plaça Catalunya aproximadament de mitjanit a les 05:00, cada 20 a 30 minuts, i accepten títols integrats.",
    ),
    ...h2(
      "Quina terminal? Depèn de l'aerolínia",
      "La llista d'aerolínies d'Aena indica la terminal de cadascuna. **Vueling, Iberia, British Airways, Air Europa, Lufthansa, Emirates i United Airlines operen a la T1**; **Ryanair, easyJet, Jet2.com, Aer Lingus, Wizz Air, Volotea, Transavia, Norwegian i Eurowings, a la T2**. Des de la T1 tens l'Aerobús A1 i el metro L9 Sud; des de la T2, l'Aerobús A2, el metro L9 Sud i el tren R2 Nord. Les assignacions poden canviar: comprova-ho a la reserva o a la [llista d'aerolínies d'Aena](https://www.aena.es/ca/josep-tarradellas-barcelona-el-prat/aerolinies-i-destinacions/aerolinies.html) abans de viatjar.",
    ),
    ...h2(
      "Tornar a l'aeroport",
      "**Aerobús.** Totes dues línies surten de plaça Catalunya i, en direcció a l'aeroport, només paren al carrer Sepúlveda i a plaça Espanya: puja a una d'aquestes tres parades. Agafa l'**A1 per a la T1** (para a la planta 3, Sortides) i l'**A2 per a la T2** (para al vial de la T2B). Des del centre, l'A1 surt cada 5 minuts de 06:40 a 21:55 i l'A2 cada 10 minuts de 05:00 a 22:30; de matinada, tots dos surten cada 20 minuts.",
      "**Metro.** El bitllet aeroport de TMB val en tots dos sentits: et porta a l'aeroport des de qualsevol estació de metro. La T-casual tampoc no hi val a l'anada.",
      "**Tren.** L'R2 Nord va a Aeroport cada 30 minuts i arriba a la T2. Si voles des de la T1, afegeix-hi l'autobús gratuït d'Aena, que triga uns 14 minuts de la T2 a la T1.",
    ),
    ...h2("Quin triar"),
    list(
      "**T'allotges a prop de plaça Catalunya, Universitat o plaça Espanya:** Aerobús. Sense transbords, freqüent i còmode amb maletes.",
      "**Agafes un tren a Sants o t'allotges a prop de Passeig de Gràcia, i arribes a la T2:** R2 Nord.",
      "**Ja tens una T-casual:** R2 Nord, bus 46 o nitbus; no el metro de l'aeroport.",
      "**Tens una T-dia o la Hola Barcelona:** el metro L9 Sud hi és inclòs.",
      "**Tres o quatre persones amb maletes, o arribada molt tard:** compara el taxímetre amb tres o quatre bitllets d'Aerobús.",
    ),
    faq([
      {
        question: "Quant costa l'Aerobús des de l'aeroport de Barcelona?",
        answer: `7,75 € l'anada i 13,30 € anada i tornada segons la pàgina de tarifes de l'operador, comprovat el ${VERIFIED}. Els menors de 4 anys viatgen gratis.`,
      },
      {
        question: "Puc fer servir la T-casual des de l'aeroport?",
        answer: "No a les estacions de metro de l'aeroport (L9 Sud), però sí al tren R2 Nord, al bus 46 i als nitbus.",
      },
      {
        question: "L'Aerobús para a Sants?",
        answer: "No. Cap línia de l'Aerobús para a Sants; el tren R2 Nord hi arriba des de la T2 en uns 20 minuts.",
      },
      {
        question: "De quina terminal surt el tren?",
        answer: "L'estació de l'R2 Nord és a la Terminal 2. Des de la T1, agafa l'autobús gratuït entre terminals.",
      },
      {
        question: "A quina terminal opera Ryanair a l'aeroport de Barcelona?",
        answer: "A la T2, segons la llista d'aerolínies d'Aena (consultada el 20 d'octubre de 2026), igual que easyJet, Jet2.com i Aer Lingus. Vueling, Iberia i British Airways operen a la T1.",
      },
      {
        question: "On s'agafa l'Aerobús per tornar a l'aeroport?",
        answer: "A plaça Catalunya, al carrer Sepúlveda o a plaça Espanya. L'A1 va a la T1 i l'A2 a la T2.",
      },
    ]),
    ...b2Related(["barcelonaHub", "transport", "touristTax", "cruiseport", "hours"], "ca"),
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
    ca: "L'Aerobús acaba a plaça Catalunya; no para a Sants.",
    es: "El Aerobús termina en plaza Catalunya; no para en Sants.",
    en: "The Aerobús ends at Plaça Catalunya; it does not stop at Sants.",
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
