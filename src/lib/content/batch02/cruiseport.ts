import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  lead,
  list,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Barcelona cruise port to the city centre.
 *
 * Terminals and distances from the Port de Barcelona; the shuttle from the
 * Port's transport page and its operator (Cruise Bus, TCC); taxi supplements
 * from the AMB 2026 tariff.
 *
 * Left out: shuttle hours and frequency (no official statement), public bus
 * lines and metro stations at the terminals (not on any Port or operator
 * page), a taxi total to the centre, luggage storage prices, which cruise line
 * uses which terminal beyond what the Port says (MSC owns the MSC terminal;
 * D and E have preferential use for Carnival group ships), and the "Portbus"
 * rename (no current official page states it).
 */

// Re-checked 28 Oct 2026 (fact pack of that day): every terminal page on
// portdebarcelona.cat (A and B 2 km, C and D 2.5 km, E Helix 3 km, MSC 3.9 km,
// WTCB South 400 m and "just 5 minutes from the city centre"); the transport
// page ("Cruise bus: €3.5 one-way ticket / €5 round-trip ticket"; drop-off
// allowed, no parking); cruisebus.barcelona ("ONE WAY WEB (3.50€)", "DAY
// TICKET WEB (5€)", card payment, PDF by email, stops at terminals A-E, Portal
// de la Pau, "From the ship to La Rambla in 5 minutes"); the AMB 2026 taxi
// tariff (4.60 Moll Adossat supplement, T-4 46 euro airport fare). The Port's
// note of 23 Jul 2026 dates the last cruise at terminal C (30 Oct 2026) and at
// Barcelona Sud (31 Dec 2026); its 15 Apr 2026 note is still online.
//
// Changed from 26 Oct: the MSC row no longer says "taxi only" flatly. The
// Port's MSC page lists "Shuttle bus and taxi rank", while the Cruise Bus
// names only terminals A to E, so the page states both and sends the reader to
// the cruise line. "Formerly the Portbus", the World Trade Center / Columbus /
// Drassanes description of the city stop and "unlimited rides" as the Port's
// wording were dropped: none is on a Port or operator page.
const VERIFIED = "2026-10-28";

const SOURCES: B2Source[] = [
  { name: "Passenger terminals", url: "https://www.portdebarcelona.cat/en/business-and-services/cruise-ships/information-passenger/passenger-terminals", publisher: "Port de Barcelona" },
  { name: "Transport services for cruise passengers", url: "https://www.portdebarcelona.cat/en/business-and-services/cruise-ships/information-passenger/services/transport-services", publisher: "Port de Barcelona" },
  { name: "Cruise Bus — the service", url: "https://cruisebus.barcelona/en/el-servei/", publisher: "Transports Ciutat Comtal" },
  { name: "Cruise Bus — stops", url: "https://cruisebus.barcelona/en/parades/", publisher: "Transports Ciutat Comtal" },
  { name: "Cruise Bus — tickets", url: "https://cruisebus.barcelona/en/", publisher: "Transports Ciutat Comtal" },
  { name: "El Port de Barcelona avança cap a un model de creuers més sostenible (15.04.2026)", url: "https://www.portdebarcelona.cat/ca/media/8843/download", publisher: "Port de Barcelona" },
  { name: "El Port de Barcelona fa visible la seva transformació (23.07.2026)", url: "https://www.portdebarcelona.cat/ca/media/9048/download", publisher: "Port de Barcelona" },
  { name: "El Port de Barcelona reactiva el Consell per a la Sostenibilitat dels Creuers (11.06.2026)", url: "https://www.portdebarcelona.cat/ca/media/8966/download", publisher: "Port de Barcelona" },
  { name: "Tarifes del taxi", url: "https://taxi.amb.cat/usuaris/tarifes-del-taxi", publisher: "Àrea Metropolitana de Barcelona" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/port-creuers-barcelona-centre",
    title: "Del port de creuers de Barcelona al centre: Cruise Bus, taxi o a peu",
    seoTitle: "Port de creuers de Barcelona al centre: bus, taxi o a peu",
    seoDescription:
      "Terminals de creuers de Barcelona i la seva distància al centre, el Cruise Bus (3,50 €) fins al peu de la Rambla i què costa el taxi des del Moll Adossat.",
    excerpt: "Com anar de les terminals de creuers de Barcelona al centre: la llançadora, el taxi i a peu, amb les distàncies i els preus oficials.",
  },
  es: {
    path: "guias/puerto-cruceros-barcelona-centro",
    title: "Puerto de cruceros de Barcelona: terminales del Moll Adossat, cómo llegar y Cruise Bus al centro",
    seoTitle: "Moll Adossat Barcelona: terminales de cruceros y cómo llegar",
    seoDescription:
      "De dónde salen los cruceros en Barcelona: terminales del Moll Adossat y del WTC, distancia al centro, Cruise Bus (3,50 €), taxi y cómo ir a embarcar.",
    excerpt: "Cómo ir de las terminales de cruceros de Barcelona al centro, y del centro al barco: la lanzadera, el taxi y a pie, con las distancias y los precios oficiales.",
  },
  en: {
    path: "guides/barcelona-cruise-port-to-city-centre",
    title: "Barcelona cruise port to the city centre: Cruise Bus, taxi or on foot",
    seoTitle: "Barcelona cruise port to city centre: Cruise Bus €3.50, taxi",
    seoDescription:
      "How far each Barcelona cruise terminal is from the centre, the Cruise Bus (€3.50, €5 day ticket) to La Rambla, and taxi fares from the Moll Adossat.",
    excerpt: "How to get from Barcelona's cruise terminals to the city centre: the shuttle, a taxi or on foot, with official distances and fares.",
  },
};

type T = {
  lead: string;
  tTitle: string; tCaption: string; tHeaders: string[]; tRows: string[][]; tNote: string;
  whichTitle: string; which: string;
  busTitle: string; bus: string[];
  taxiTitle: string; taxi: string[];
  walkTitle: string; walk: string;
  embarkTitle: string; embark: (airport: string) => string[];
  changesTitle: string; changes: string;
  tipsTitle: string; tips: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "Most cruise ships in Barcelona dock at the **Moll Adossat**, **2 to 3.9 km** from the city, too far to walk with luggage. The **Cruise Bus** shuttle links terminals A to E with the Portal de la Pau, at the foot of La Rambla, for **€3.50** one way (€5 for the day ticket); a taxi adds a €4.60 port supplement to the meter. Only the **World Trade Center terminal**, 400 m from the city, is close enough to walk.",
    tTitle: "Barcelona's cruise terminals and how far they are from the city",
    tCaption: "Cruise terminals and distance to the city",
    tHeaders: ["Terminal", "Where", "Distance to the city", "Getting to the city"],
    tRows: [
      ["A, B", "Moll Adossat", "2 km", "Cruise Bus or taxi"],
      ["D (Palacruceros)", "Moll Adossat", "2.5 km", "Cruise Bus or taxi"],
      ["E (Helix)", "Moll Adossat", "3 km", "Cruise Bus or taxi"],
      ["MSC", "Moll Adossat", "3.9 km", "Taxi; ask your cruise line about a shuttle"],
      ["World Trade Center (WTCB South)", "Moll de Barcelona", "400 m", "On foot"],
    ],
    tNote: "Terminals and distances as published by the Port de Barcelona, checked on 28 October 2026. In its note of 23 July 2026 the Port set the last cruise at terminal C for 30 October 2026 and at the World Trade Center's South terminal for 31 December 2026. Your cruise line tells you which terminal you use.",
    whichTitle: "Where do cruise ships leave from in Barcelona?",
    which: "The Port has passenger terminals on two quays: the **Moll Adossat**, where most cruise ships berth, and the **Moll de Barcelona**, next to the city, with the World Trade Center terminal. On the Moll Adossat, the **MSC** terminal is owned by MSC Cruises, and terminals **D (Palacruceros)** and **E (Helix)** operate under private concessions with preferential use for Carnival group ships; the Port notes that terminal D was financed by Costa Crociere. For any other line, the terminal is on your booking.",
    busTitle: "Cruise Bus: tickets and price",
    bus: [
      "The shuttle the Port lists is the **Cruise Bus**, run by Transports Ciutat Comtal (if you are looking for the \"Portbus\", this is the service the Port names today). The Port gives **€3.50 one way and €5 return**; the operator sells the €5 ticket as a **day ticket** that allows several trips on the date printed on it. Online tickets are for one date, are paid by card and arrive by email as a PDF.",
      "It links terminals **A to E** on the Moll Adossat with the **Portal de la Pau**, right next to La Rambla; the operator puts it at five minutes from the ship to La Rambla. Neither the Port nor the operator publishes a timetable.",
      "For the **MSC** terminal, the Port's page lists a shuttle bus and a taxi rank, but the Cruise Bus names only terminals A to E: ask your cruise line how its passengers get to the city.",
    ],
    taxiTitle: "Taxi from the cruise port: price",
    taxi: [
      "Barcelona taxis run on the AMB's 2026 meter: **€2.80** flag fall, **€1.35 per km** on weekdays from 8:00 to 20:00 and **€1.66** at night, on Saturdays and on public holidays, plus a **€4.60 supplement** for pick-up or drop-off at the Moll Adossat (the tariff lists no supplement for the World Trade Center terminal). No official source gives a total to the centre, because it depends on the meter.",
      "Between the Moll Adossat and the airport there is a **fixed €46 fare** (tariff T-4), all supplements included.",
    ],
    walkTitle: "On foot",
    walk: "From the World Trade Center terminal it is about 400 metres to the city; the Port says it is \"just 5 minutes from the city centre\" and that passengers can walk. From the Moll Adossat terminals, 2 to 3.9 km away, the Port lists the shuttle and taxis, not the walk.",
    embarkTitle: "Getting to the port to board your ship",
    embark: (airport) => [
      "**By car or taxi:** private cars may drive in to drop off or pick up passengers and luggage, but parking at the terminals is not allowed, according to the Port.",
      "**From the city centre:** the Cruise Bus leaves from the Portal de la Pau for terminals A to E.",
      `**From the airport:** the fixed-fare taxi to the Moll Adossat costs €46; by public transport, get to the centre first (${airport}) and then take the Cruise Bus.`,
    ],
    changesTitle: "Changes ahead",
    changes: "In its note of 15 April 2026 the Port said terminal C on the Moll Adossat would stop operating at the end of October 2026 and then be demolished, and that the Barcelona Sud terminal at the World Trade Center would stop operating at the end of the year; its note of 23 July 2026 dates the last cruises at 30 October and 31 December 2026. Check your terminal with your cruise line.",
    tipsTitle: "Tips",
    tips: [
      "**Going on to the airport:** a taxi on the fixed €46 fare is the simplest with luggage.",
      "**Back on board in time:** leave a generous margin for the shuttle or taxi back; all-aboard times are strict.",
    ],
    faq: [
      { question: "How do I get from the Barcelona cruise port to the city?", answer: "By the Cruise Bus shuttle (€3.50 one way, €5 day ticket) from terminals A to E to the Portal de la Pau, at the foot of La Rambla, or by taxi. Only the World Trade Center terminal is within walking distance." },
      { question: "How far is the cruise port from Barcelona city centre?", answer: "The Moll Adossat terminals are 2 km (A, B), 2.5 km (D), 3 km (E) and 3.9 km (MSC) from the city, according to the Port; the World Trade Center terminal is 400 m away." },
      { question: "How much is the Cruise Bus in Barcelona?", answer: "€3.50 one way and €5 for the day ticket, which the Port calls a return ticket. Online tickets are for one date and paid by card." },
      { question: "How much is a taxi from the cruise port to the city centre?", answer: "It is metered: €2.80 flag fall, €1.35 to €1.66 per km, plus a €4.60 supplement at the Moll Adossat. No official source gives a total." },
      { question: "How much is a taxi from the cruise port to the airport?", answer: "A fixed €46 between the Moll Adossat and the airport, supplements included, on the AMB 2026 tariff." },
      { question: "Where do cruise ships leave from in Barcelona?", answer: "Mostly from the Moll Adossat (terminals A, B, D Palacruceros, E Helix and MSC) and from the World Trade Center's South terminal on the Moll de Barcelona, next to the city." },
    ],
    note: "Terminal assignments, fares and services change: confirm with your cruise line and the Port before you dock.",
  },
  es: {
    lead: "La mayoría de cruceros en Barcelona atracan en el **Moll Adossat (Muelle Adosado)**, a entre **2 y 3,9 km** de la ciudad, demasiado lejos para ir a pie con equipaje. La lanzadera **Cruise Bus** une las terminales A a E con el Portal de la Pau, al pie de La Rambla, por **3,50 €** el trayecto (5 € el billete de día); el taxi suma al taxímetro un suplemento de 4,60 € en el puerto. Solo la **terminal del World Trade Center**, a 400 m de la ciudad, está lo bastante cerca para ir andando.",
    tTitle: "Terminales de cruceros del Moll Adossat y el WTC: distancia al centro",
    tCaption: "Terminales de cruceros y distancia a la ciudad",
    tHeaders: ["Terminal", "Dónde", "Distancia a la ciudad", "Cómo ir a la ciudad"],
    tRows: [
      ["A, B", "Moll Adossat (Muelle Adosado)", "2 km", "Cruise Bus o taxi"],
      ["D (Palacruceros)", "Moll Adossat (Muelle Adosado)", "2,5 km", "Cruise Bus o taxi"],
      ["E (Helix)", "Moll Adossat (Muelle Adosado)", "3 km", "Cruise Bus o taxi"],
      ["MSC", "Moll Adossat (Muelle Adosado)", "3,9 km", "Taxi; pregunta a la naviera por la lanzadera"],
      ["World Trade Center (WTCB Sur)", "Muelle de Barcelona", "400 m", "A pie"],
    ],
    tNote: "Terminales y distancias según el Port de Barcelona, comprobado el 28 de octubre de 2026. En su nota del 23 de julio de 2026 el Port fijó el último crucero de la terminal C para el 30 de octubre de 2026 y el de la terminal Sur del World Trade Center para el 31 de diciembre de 2026. La naviera te indica qué terminal usas.",
    whichTitle: "¿De dónde salen los cruceros en Barcelona?",
    which: "El Port tiene terminales de pasajeros en dos muelles: el **Moll Adossat (Muelle Adosado)**, donde atracan la mayoría de cruceros, y el **Muelle de Barcelona**, junto a la ciudad, con la terminal del World Trade Center. En el Moll Adossat, la terminal **MSC** es propiedad de MSC Cruceros, y las terminales **D (Palacruceros)** y **E (Helix)** funcionan en concesión privada con uso preferente para los barcos del grupo Carnival; el Port indica que la terminal D la financió Costa Crociere. Para cualquier otra naviera, la terminal consta en la reserva.",
    busTitle: "Cruise Bus: billetes y precio",
    bus: [
      "La lanzadera que cita el Port es el **Cruise Bus**, de Transports Ciutat Comtal (si buscas el «Portbus», este es el servicio que nombra hoy el Port). El Port da **3,50 € el trayecto sencillo y 5 € ida y vuelta**; el operador vende el billete de 5 € como **billete de día**, con varios viajes en la fecha que lleva impresa. Los billetes en línea son para una fecha, se pagan con tarjeta y llegan por correo en PDF.",
      "Une las terminales **A a E** del Moll Adossat con el **Portal de la Pau**, junto a La Rambla; el operador calcula cinco minutos del barco a La Rambla. Ni el Port ni el operador publican horario.",
      "Para la terminal **MSC**, la página del Port cita lanzadera y parada de taxis, pero el Cruise Bus solo nombra las terminales A a E: pregunta a la naviera cómo llegan sus pasajeros a la ciudad.",
    ],
    taxiTitle: "Taxi desde el puerto de cruceros: precio",
    taxi: [
      "Los taxis de Barcelona funcionan con la tarifa del AMB de 2026: bajada de bandera de **2,80 €**, **1,35 € por km** los laborables de 8:00 a 20:00 y **1,66 €** de noche, sábados y festivos, más un **suplemento de 4,60 €** por recoger o dejar en el Moll Adossat (la tarifa no fija suplemento para la terminal del World Trade Center). Ninguna fuente oficial da un total hasta el centro, porque depende del taxímetro.",
      "Entre el Moll Adossat y el aeropuerto hay una **tarifa fija de 46 €** (tarifa T-4), con todos los suplementos incluidos.",
    ],
    walkTitle: "A pie",
    walk: "Desde la terminal del World Trade Center hay unos 400 metros hasta la ciudad; el Port dice que está «a solo 5 minutos del centro» y que se puede ir andando. Desde las terminales del Moll Adossat, a entre 2 y 3,9 km, el Port indica la lanzadera y el taxi, no el camino a pie.",
    embarkTitle: "Cómo llegar al puerto de Barcelona para embarcar",
    embark: (airport) => [
      "**En coche o taxi:** se puede entrar a dejar o recoger pasajeros y equipaje, pero no aparcar en las terminales, según el Port.",
      "**Desde el centro:** el Cruise Bus sale del Portal de la Pau hacia las terminales A a E.",
      `**Desde el aeropuerto:** el taxi de precio fijo hasta el Moll Adossat cuesta 46 €; en transporte público, primero llega al centro (${airport}) y luego coge el Cruise Bus.`,
    ],
    changesTitle: "Cambios previstos",
    changes: "En su nota del 15 de abril de 2026 el Port indicó que la terminal C del Muelle Adosado dejaría de operar a finales de octubre de 2026 y después se derribaría, y que la terminal Barcelona Sud, en el World Trade Center, cesaría su actividad a finales de año; su nota del 23 de julio de 2026 fija los últimos cruceros el 30 de octubre y el 31 de diciembre de 2026. Confirma tu terminal con la naviera.",
    tipsTitle: "Consejos",
    tips: [
      "**Si sigues hacia el aeropuerto:** un taxi con la tarifa fija de 46 € es lo más sencillo con equipaje.",
      "**Para volver a bordo a tiempo:** deja un buen margen para la lanzadera o el taxi de vuelta; la hora de embarque es estricta.",
    ],
    faq: [
      { question: "¿De dónde salen los cruceros en Barcelona?", answer: "Sobre todo del Moll Adossat (Muelle Adosado), con las terminales A, B, D (Palacruceros), E (Helix) y MSC, y de la terminal Sur del World Trade Center, en el Muelle de Barcelona, junto a la ciudad." },
      { question: "¿Cómo se va del puerto de cruceros de Barcelona a la ciudad?", answer: "En la lanzadera Cruise Bus (3,50 € el trayecto, 5 € el billete de día) desde las terminales A a E hasta el Portal de la Pau, al pie de La Rambla, o en taxi. Solo la terminal del World Trade Center está a distancia de ir a pie." },
      { question: "¿A qué distancia está el puerto de cruceros del centro de Barcelona?", answer: "Las terminales del Moll Adossat están a 2 km (A, B), 2,5 km (D), 3 km (E) y 3,9 km (MSC) de la ciudad, según el Port; la del World Trade Center, a 400 m." },
      { question: "¿Cuánto cuesta el Cruise Bus de Barcelona?", answer: "3,50 € el trayecto sencillo y 5 € el billete de día, que el Port llama de ida y vuelta. Los billetes en línea son para una fecha y se pagan con tarjeta." },
      { question: "¿Cuánto cuesta el taxi del puerto de cruceros al centro?", answer: "Va con taxímetro: 2,80 € de bajada de bandera, de 1,35 a 1,66 € por km y un suplemento de 4,60 € en el Moll Adossat. Ninguna fuente oficial da un total." },
      { question: "¿Cuánto cuesta el taxi del puerto de cruceros al aeropuerto?", answer: "Una tarifa fija de 46 € entre el aeropuerto y el Moll Adossat, con suplementos incluidos, según la tarifa del AMB de 2026." },
      { question: "¿Se puede aparcar en el puerto para embarcar?", answer: "No en las terminales: el Port permite entrar en coche para dejar o recoger pasajeros y equipaje, pero no aparcar." },
    ],
    note: "Las terminales asignadas, los precios y los servicios cambian: confírmalo con la naviera y el Port antes de atracar.",
  },
  ca: {
    lead: "La majoria de creuers a Barcelona atraquen al **Moll Adossat**, a entre **2 i 3,9 km** de la ciutat, massa lluny per anar-hi a peu amb equipatge. La llançadora **Cruise Bus** uneix les terminals A a E amb el Portal de la Pau, al peu de la Rambla, per **3,50 €** el trajecte (5 € el bitllet de dia); el taxi suma al taxímetre un suplement de 4,60 € al port. Només la **terminal del World Trade Center**, a 400 m de la ciutat, és prou a prop per anar-hi caminant.",
    tTitle: "Terminals de creuers del Moll Adossat i el WTC: distància al centre",
    tCaption: "Terminals de creuers i distància a la ciutat",
    tHeaders: ["Terminal", "On", "Distància a la ciutat", "Com anar a la ciutat"],
    tRows: [
      ["A, B", "Moll Adossat", "2 km", "Cruise Bus o taxi"],
      ["D (Palacruceros)", "Moll Adossat", "2,5 km", "Cruise Bus o taxi"],
      ["E (Helix)", "Moll Adossat", "3 km", "Cruise Bus o taxi"],
      ["MSC", "Moll Adossat", "3,9 km", "Taxi; pregunta a la naviliera per la llançadora"],
      ["World Trade Center (WTCB Sud)", "Moll de Barcelona", "400 m", "A peu"],
    ],
    tNote: "Terminals i distàncies segons el Port de Barcelona, comprovat el 28 d'octubre de 2026. En la nota del 23 de juliol de 2026 el Port va fixar l'últim creuer de la terminal C per al 30 d'octubre de 2026 i el de la terminal Sud del World Trade Center per al 31 de desembre de 2026. La naviliera t'indica quina terminal fas servir.",
    whichTitle: "D'on surten els creuers a Barcelona?",
    which: "El Port té terminals de passatgers en dos molls: el **Moll Adossat**, on atraquen la majoria de creuers, i el **Moll de Barcelona**, al costat de la ciutat, amb la terminal del World Trade Center. Al Moll Adossat, la terminal **MSC** és propietat de MSC Cruceros, i les terminals **D (Palacruceros)** i **E (Helix)** funcionen en concessió privada amb ús preferent per als vaixells del grup Carnival; el Port indica que la terminal D la va finançar Costa Crociere. Per a qualsevol altra naviliera, la terminal consta a la reserva.",
    busTitle: "Cruise Bus: bitllets i preu",
    bus: [
      "La llançadora que cita el Port és el **Cruise Bus**, de Transports Ciutat Comtal (si busques el «Portbus», aquest és el servei que avui anomena el Port). El Port dona **3,50 € el trajecte senzill i 5 € anada i tornada**; l'operador ven el bitllet de 5 € com a **bitllet de dia**, amb diversos viatges en la data que hi consta. Els bitllets en línia són per a una data, es paguen amb targeta i arriben per correu en PDF.",
      "Uneix les terminals **A a E** del Moll Adossat amb el **Portal de la Pau**, al costat de la Rambla; l'operador calcula cinc minuts del vaixell a la Rambla. Ni el Port ni l'operador no publiquen horari.",
      "Per a la terminal **MSC**, la pàgina del Port cita llançadora i parada de taxis, però el Cruise Bus només anomena les terminals A a E: pregunta a la naviliera com arriben els seus passatgers a la ciutat.",
    ],
    taxiTitle: "Taxi des del port de creuers: preu",
    taxi: [
      "Els taxis de Barcelona funcionen amb la tarifa de l'AMB del 2026: baixada de bandera de **2,80 €**, **1,35 € per km** els feiners de 8:00 a 20:00 i **1,66 €** de nit, dissabtes i festius, més un **suplement de 4,60 €** per recollir o deixar al Moll Adossat (la tarifa no fixa suplement per a la terminal del World Trade Center). Cap font oficial no dona un total fins al centre, perquè depèn del taxímetre.",
      "Entre el Moll Adossat i l'aeroport hi ha una **tarifa fixa de 46 €** (tarifa T-4), amb tots els suplements inclosos.",
    ],
    walkTitle: "A peu",
    walk: "Des de la terminal del World Trade Center hi ha uns 400 metres fins a la ciutat; el Port diu que és «a només 5 minuts del centre» i que s'hi pot anar caminant. Des de les terminals del Moll Adossat, a entre 2 i 3,9 km, el Port indica la llançadora i el taxi, no el camí a peu.",
    embarkTitle: "Com arribar al port de Barcelona per embarcar",
    embark: (airport) => [
      "**En cotxe o taxi:** s'hi pot entrar per deixar o recollir passatgers i equipatge, però no aparcar a les terminals, segons el Port.",
      "**Des del centre:** el Cruise Bus surt del Portal de la Pau cap a les terminals A a E.",
      `**Des de l'aeroport:** el taxi de preu fix fins al Moll Adossat costa 46 €; en transport públic, primer arriba al centre (${airport}) i després agafa el Cruise Bus.`,
    ],
    changesTitle: "Canvis previstos",
    changes: "En la nota del 15 d'abril de 2026 el Port va indicar que la terminal C del Moll Adossat deixaria de funcionar a finals d'octubre de 2026 i després s'enderrocaria, i que la terminal Barcelona Sud, al World Trade Center, cessaria l'activitat a finals d'any; la nota del 23 de juliol de 2026 fixa els últims creuers el 30 d'octubre i el 31 de desembre de 2026. Confirma la terminal amb la naviliera.",
    tipsTitle: "Consells",
    tips: [
      "**Si continues cap a l'aeroport:** un taxi amb la tarifa fixa de 46 € és el més senzill amb equipatge.",
      "**Per tornar a bord a temps:** deixa un bon marge per a la llançadora o el taxi de tornada; l'hora d'embarcament és estricta.",
    ],
    faq: [
      { question: "Com s'hi va del port de creuers de Barcelona a la ciutat?", answer: "Amb la llançadora Cruise Bus (3,50 € el trajecte, 5 € el bitllet de dia) des de les terminals A a E fins al Portal de la Pau, al peu de la Rambla, o en taxi. Només la terminal del World Trade Center és a distància d'anar-hi a peu." },
      { question: "A quina distància és el port de creuers del centre de Barcelona?", answer: "Les terminals del Moll Adossat són a 2 km (A, B), 2,5 km (D), 3 km (E) i 3,9 km (MSC) de la ciutat, segons el Port; la del World Trade Center, a 400 m." },
      { question: "Quant costa el Cruise Bus de Barcelona?", answer: "3,50 € el trajecte senzill i 5 € el bitllet de dia, que el Port anomena d'anada i tornada. Els bitllets en línia són per a una data i es paguen amb targeta." },
      { question: "Quant costa el taxi del port de creuers al centre?", answer: "Va amb taxímetre: 2,80 € de baixada de bandera, d'1,35 a 1,66 € per km i un suplement de 4,60 € al Moll Adossat. Cap font oficial no en dona un total." },
      { question: "Quant costa el taxi del port de creuers a l'aeroport?", answer: "Una tarifa fixa de 46 € entre l'aeroport i el Moll Adossat, amb suplements inclosos, segons la tarifa de l'AMB del 2026." },
      { question: "D'on surten els creuers a Barcelona?", answer: "Sobretot del Moll Adossat, amb les terminals A, B, D (Palacruceros), E (Helix) i MSC, i de la terminal Sud del World Trade Center, al Moll de Barcelona, al costat de la ciutat." },
    ],
    note: "Les terminals assignades, els preus i els serveis canvien: confirma-ho amb la naviliera i el Port abans d'atracar.",
  },
};

const AIRPORT_LINK: Record<Locale, string> = {
  ca: b2link("airport", "ca", "bus 46, metro, tren o nitbus"),
  es: b2link("airport", "es", "bus 46, metro, tren o nitbus"),
  en: b2link("airport", "en", "bus 46, metro, train or night bus"),
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    ...h2(t.tTitle),
    table(t.tCaption, t.tHeaders, t.tRows, t.tNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.whichTitle, t.which),
    ...h2(t.busTitle, ...t.bus),
    ...h2(t.taxiTitle, ...t.taxi),
    ...h2(t.walkTitle, t.walk),
    ...h2(t.embarkTitle),
    list(...t.embark(AIRPORT_LINK[locale])),
    ...h2(t.changesTitle, t.changes),
    ...h2(t.tipsTitle),
    list(...t.tips),
    faq(t.faq),
    ...b2Related(["airport", "touristTax", "monuments", "cards", "transport"], locale),
  ];
}

export const CRUISEPORT: B2Article = {
  key: "cruiseport",
  entryKey: "guide-barcelona-cruise-port-to-city",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "creuers-moll-port-barcelona",
  heroAlt: {
    ca: "Creuers amarrats a les terminals del Moll Adossat del port de Barcelona, vistos des de dalt",
    es: "Cruceros amarrados en las terminales del Moll Adossat del puerto de Barcelona, vistos desde arriba",
    en: "Cruise ships berthed at the Moll Adossat terminals of the Port of Barcelona, seen from above",
  },
  heroCaption: {
    ca: "El Moll Adossat, on atraquen la majoria de creuers.",
    es: "El Moll Adossat, donde atracan la mayoría de cruceros.",
    en: "The Moll Adossat, where most cruise ships dock.",
  },
  secondaryKey: "creuers-portal-de-la-pau-colom",
  secondaryAlt: {
    ca: "Palmeres a la plaça del Portal de la Pau amb el monument a Colom i la torre del telefèric",
    es: "Palmeras en la plaza del Portal de la Pau con el monumento a Colón y la torre del teleférico",
    en: "Palm trees in Plaça del Portal de la Pau with the Columbus monument and the cable-car tower",
  },
  secondaryCaption: {
    ca: "El Portal de la Pau, al peu de la Rambla.",
    es: "El Portal de la Pau, al pie de La Rambla.",
    en: "Portal de la Pau, at the foot of La Rambla.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T01:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as CRUISEPORT_META };
