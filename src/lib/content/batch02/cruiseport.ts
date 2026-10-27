import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
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
 * Terminals and distances from the Port de Barcelona; the shuttle from its
 * operator (Cruise Bus, TCC); taxi supplements from the AMB 2026 tariff;
 * metro at the city end from TMB. Checked on 12 Oct 2026
 * (research_notes/blog-batch-03/cruiseport.md).
 *
 * Left out: shuttle hours and frequency (no official statement), public bus
 * lines at the terminals (TMB's stop pages could not be read), and luggage
 * storage prices. The terminal closures and openings agreed for 2026-2028
 * are described as plans, which is what the Port calls them.
 */

// Re-checked 24 Oct 2026: each terminal page on portdebarcelona.cat
// (distance to the city: A and B 2 km, C and D 2.5 km, E Helix 3 km, MSC
// 3.9 km, WTCB South 400 m), the Port's transport page and cruisebus.barcelona
// (one way €3.50, day ticket €5, stops at terminals A-E and H), the AMB 2026
// taxi tariff (€4.60 Moll Adossat supplement, €46 airport fixed fare). The
// "changes" paragraph now follows the Port's press note of 11 Jun 2026; the
// earlier terminal G / 2028 dates are not in it and were dropped.
//
// P0, 26 Oct 2026 (research_notes/rank-all/review-3-bcn-practical.md): the
// Port's press note of 15.04.2026 says terminal C on the Moll Adossat "deixarà
// de prestar servei a finals d'octubre" and Barcelona Sud (WTC) stops at the
// end of the year; the Cruise Bus stops page names only "terminals A, B, C, D
// and E" (no H/MSC). Terminal C is out of the table and the bus list, MSC is
// taxi only, and "changes" now follows the 15 April note.
const VERIFIED = "2026-10-26";

const SOURCES: B2Source[] = [
  { name: "Passenger terminals", url: "https://www.portdebarcelona.cat/en/business-and-services/cruise-ships/information-passenger/passenger-terminals", publisher: "Port de Barcelona" },
  { name: "Transport services for cruise passengers", url: "https://www.portdebarcelona.cat/en/business-and-services/cruise-ships/information-passenger/services/transport-services", publisher: "Port de Barcelona" },
  { name: "Cruise Bus — the service", url: "https://cruisebus.barcelona/en/el-servei/", publisher: "Transports Ciutat Comtal" },
  { name: "Cruise Bus — stops", url: "https://cruisebus.barcelona/en/parades/", publisher: "Transports Ciutat Comtal" },
  { name: "El Port de Barcelona avança cap a un model de creuers més sostenible (15.04.2026)", url: "https://www.portdebarcelona.cat/ca/media/8843/download", publisher: "Port de Barcelona" },
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
    title: "Del puerto de cruceros de Barcelona al centro: Cruise Bus, taxi o a pie",
    seoTitle: "Muelle Adosado Barcelona: terminales de cruceros y Cruise Bus",
    seoDescription:
      "Terminales de cruceros del Muelle Adosado (A, B, D, E Helix, MSC) y WTC: distancia al centro, Cruise Bus (3,50 €) hasta La Rambla y taxi al aeropuerto.",
    excerpt: "Cómo ir de las terminales de cruceros de Barcelona al centro: la lanzadera, el taxi y a pie, con las distancias y los precios oficiales.",
  },
  en: {
    path: "guides/barcelona-cruise-port-to-city-centre",
    title: "Barcelona cruise port to the city centre: Cruise Bus, taxi or on foot",
    seoTitle: "Barcelona cruise port to city centre: shuttle, taxi, walk",
    seoDescription:
      "Barcelona's cruise terminals, how far each is from the centre, the Cruise Bus shuttle (€3.50) to the foot of La Rambla, and taxi fares from the Moll Adossat.",
    excerpt: "How to get from Barcelona's cruise terminals to the city centre: the shuttle, a taxi or on foot, with official distances and fares.",
  },
};

type T = {
  lead: string;
  tTitle: string; tCaption: string; tHeaders: string[]; tRows: string[][]; tNote: string;
  busTitle: string; bus: string[];
  taxiTitle: string; taxi: string[];
  walkTitle: string; walk: string;
  changesTitle: string; changes: string;
  tipsTitle: string; tips: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "Most cruise ships in Barcelona dock at the **Moll Adossat**, two to four kilometres from the foot of La Rambla, too far to walk with luggage. The official **Cruise Bus** shuttle links the terminals with the city for €3.50; only the **World Trade Center terminal** is close enough to walk.",
    tTitle: "Barcelona's cruise terminals",
    tCaption: "Cruise terminals and distance to the city",
    tHeaders: ["Terminal", "Where", "Distance to the city", "Getting to the city"],
    tRows: [
      ["A, B", "Moll Adossat", "2 km", "Cruise Bus or taxi"],
      ["D (Palacruceros)", "Moll Adossat", "2.5 km", "Cruise Bus or taxi"],
      ["E (Helix)", "Moll Adossat", "3 km", "Cruise Bus or taxi"],
      ["MSC (H)", "Moll Adossat", "3.9 km", "Taxi"],
      ["World Trade Center (WTCB South)", "Moll de Barcelona", "400 m", "On foot"],
    ],
    tNote: "Terminals and distances as published by the Port de Barcelona, checked on 24 October 2026. Terminal C on the Moll Adossat stops operating at the end of October 2026, according to the Port's note of 15 April 2026. Your cruise line tells you which terminal you use.",
    busTitle: "Cruise Bus shuttle",
    bus: [
      "The shuttle formerly known as the Portbus is now the **Cruise Bus**, run by Transports Ciutat Comtal. A one-way ticket costs **€3.50**; the **€5** day ticket gives unlimited rides on that day, which suits a port day with a return to the ship. Tickets bought online are for the date you choose and arrive by email as a PDF.",
      "It stops at terminals A, B, D and E on the Moll Adossat (the operator's stops page also lists C, which the Port says stops operating at the end of October 2026) and runs to the city end next to the World Trade Center, by the Portal de la Pau and the Columbus monument at the foot of La Rambla. From there, Drassanes metro station (L3) is a short walk.",
    ],
    taxiTitle: "Taxi",
    taxi: [
      "Metropolitan taxis add a **€4.60 supplement** for pick-up or drop-off at the Moll Adossat. Between the airport and the Moll Adossat there is a **fixed fare of €46**, supplements included.",
    ],
    walkTitle: "On foot",
    walk: "From the World Trade Center terminal it is about 400 metres to the city. From the Moll Adossat terminals, the Port does not describe the walk as an option; take the shuttle or a taxi.",
    changesTitle: "Changes ahead",
    changes: "In its note of 15 April 2026 the Port said terminal C on the Moll Adossat would stop operating at the end of October 2026 and then be demolished, and that the Barcelona Sud terminal at the World Trade Center would stop operating at the end of the year. Check your terminal with your cruise line.",
    tipsTitle: "Tips",
    tips: [
      "**Going on to the airport:** a taxi on the fixed €46 fare is the simplest with luggage; see the airport guide for the metro and Aerobús from the city.",
      "**Back on board in time:** leave a generous margin for the shuttle or taxi back; all-aboard times are strict.",
    ],
    faq: [
      { question: "How do I get from the Barcelona cruise port to the city?", answer: "By the Cruise Bus shuttle (€3.50 single, €5 for a day) to the foot of La Rambla, or by taxi. Only the World Trade Center terminal is within walking distance." },
      { question: "Where do cruise ships leave from in Barcelona?", answer: "Mostly from the Moll Adossat, with terminals A, B, D (Palacruceros), E (Helix) and MSC, and from the World Trade Center's South terminal on the Moll de Barcelona, next to the city." },
      { question: "How much is the Cruise Bus in Barcelona?", answer: "€3.50 one way and €5 for a day ticket with unlimited rides on that date." },
      { question: "How much is a taxi from the cruise port to the airport?", answer: "A fixed €46 between the airport and the Moll Adossat, including supplements, on the AMB 2026 tariff." },
      { question: "Can I walk from the cruise terminal to La Rambla?", answer: "From the World Trade Center terminal, yes (about 400 m). From the Moll Adossat terminals, 2 to 4 km away, take the shuttle." },
    ],
    note: "Terminal assignments, fares and services change: confirm with your cruise line and the Port before you dock.",
  },
  es: {
    lead: "La mayoría de cruceros en Barcelona atracan en el **Muelle Adosado (Moll Adossat)**, a entre dos y cuatro kilómetros del pie de La Rambla, demasiado lejos para ir a pie con equipaje. La lanzadera oficial **Cruise Bus** une las terminales con la ciudad por 3,50 €; solo la **terminal del World Trade Center** está lo bastante cerca para ir andando.",
    tTitle: "Terminales de cruceros del Muelle Adosado y el WTC",
    tCaption: "Terminales de cruceros y distancia a la ciudad",
    tHeaders: ["Terminal", "Dónde", "Distancia a la ciudad", "Cómo ir a la ciudad"],
    tRows: [
      ["A, B", "Muelle Adosado (Moll Adossat)", "2 km", "Cruise Bus o taxi"],
      ["D (Palacruceros)", "Muelle Adosado (Moll Adossat)", "2,5 km", "Cruise Bus o taxi"],
      ["E (Helix)", "Muelle Adosado (Moll Adossat)", "3 km", "Cruise Bus o taxi"],
      ["MSC (H)", "Muelle Adosado (Moll Adossat)", "3,9 km", "Taxi"],
      ["World Trade Center (WTCB Sur)", "Muelle de Barcelona", "400 m", "A pie"],
    ],
    tNote: "Terminales y distancias según el Port de Barcelona, comprobado el 24 de octubre de 2026. La terminal C del Muelle Adosado deja de operar a finales de octubre de 2026, según la nota del Port del 15 de abril de 2026. La naviera te indica qué terminal usas.",
    busTitle: "Lanzadera Cruise Bus",
    bus: [
      "La lanzadera que antes se llamaba Portbus ahora es el **Cruise Bus**, de Transports Ciutat Comtal. El billete sencillo cuesta **3,50 €**; el de día, de **5 €**, da viajes ilimitados esa jornada, útil en una escala con vuelta al barco. Los billetes en línea son para la fecha que eliges y llegan por correo en PDF.",
      "Para en las terminales A, B, D y E del Muelle Adosado (la página de paradas del operador también cita la C, que según el Port deja de operar a finales de octubre de 2026) y va hasta el extremo de la ciudad junto al World Trade Center, cerca del Portal de la Pau y el monumento a Colón, al pie de La Rambla. Desde allí, la estación de metro Drassanes (L3) queda a un paso.",
    ],
    taxiTitle: "Taxi",
    taxi: [
      "Los taxis metropolitanos cobran un **suplemento de 4,60 €** por recoger o dejar en el Moll Adossat. Entre el aeropuerto y el Moll Adossat hay una **tarifa fija de 46 €**, con los suplementos incluidos.",
    ],
    walkTitle: "A pie",
    walk: "Desde la terminal del World Trade Center hay unos 400 metros hasta la ciudad. Desde las terminales del Moll Adossat, el Port no presenta el camino a pie como opción: coge la lanzadera o un taxi.",
    changesTitle: "Cambios previstos",
    changes: "En su nota del 15 de abril de 2026 el Port indicó que la terminal C del Muelle Adosado dejaría de operar a finales de octubre de 2026 y después se derribaría, y que la terminal Barcelona Sud, en el World Trade Center, cesaría su actividad a finales de año. Confirma tu terminal con la naviera.",
    tipsTitle: "Consejos",
    tips: [
      "**Si sigues hacia el aeropuerto:** un taxi con la tarifa fija de 46 € es lo más sencillo con equipaje; mira la guía del aeropuerto para el metro y el Aerobús desde la ciudad.",
      "**Para volver a bordo a tiempo:** deja un buen margen para la lanzadera o el taxi de vuelta; la hora de embarque es estricta.",
    ],
    faq: [
      { question: "¿Cómo se va del puerto de cruceros de Barcelona a la ciudad?", answer: "En la lanzadera Cruise Bus (3,50 € sencillo, 5 € todo el día) hasta el pie de La Rambla, o en taxi. Solo la terminal del World Trade Center está a distancia de ir a pie." },
      { question: "¿De dónde salen los cruceros en Barcelona?", answer: "Sobre todo del Muelle Adosado (Moll Adossat), con las terminales A, B, D (Palacruceros), E (Helix) y MSC, y de la terminal Sur del World Trade Center, en el Muelle de Barcelona, junto a la ciudad." },
      { question: "¿Cuánto cuesta el Cruise Bus de Barcelona?", answer: "3,50 € el trayecto sencillo y 5 € el billete de día, con viajes ilimitados en esa fecha." },
      { question: "¿Cuánto cuesta el taxi del puerto de cruceros al aeropuerto?", answer: "Una tarifa fija de 46 € entre el aeropuerto y el Moll Adossat, con suplementos incluidos, según la tarifa del AMB de 2026." },
      { question: "¿Se puede ir a pie de la terminal de cruceros a La Rambla?", answer: "Desde la terminal del World Trade Center, sí (unos 400 m). Desde las del Moll Adossat, a entre 2 y 4 km, coge la lanzadera." },
    ],
    note: "Las terminales asignadas, los precios y los servicios cambian: confírmalo con la naviera y el Port antes de atracar.",
  },
  ca: {
    lead: "La majoria de creuers a Barcelona atraquen al **Moll Adossat**, a entre dos i quatre quilòmetres del peu de la Rambla, massa lluny per anar-hi a peu amb equipatge. La llançadora oficial **Cruise Bus** uneix les terminals amb la ciutat per 3,50 €; només la **terminal del World Trade Center** és prou a prop per anar-hi caminant.",
    tTitle: "Terminals de creuers del Moll Adossat i el WTC",
    tCaption: "Terminals de creuers i distància a la ciutat",
    tHeaders: ["Terminal", "On", "Distància a la ciutat", "Com anar a la ciutat"],
    tRows: [
      ["A, B", "Moll Adossat", "2 km", "Cruise Bus o taxi"],
      ["D (Palacruceros)", "Moll Adossat", "2,5 km", "Cruise Bus o taxi"],
      ["E (Helix)", "Moll Adossat", "3 km", "Cruise Bus o taxi"],
      ["MSC (H)", "Moll Adossat", "3,9 km", "Taxi"],
      ["World Trade Center (WTCB Sud)", "Moll de Barcelona", "400 m", "A peu"],
    ],
    tNote: "Terminals i distàncies segons el Port de Barcelona, comprovat el 24 d'octubre de 2026. La terminal C del Moll Adossat deixa de funcionar a finals d'octubre de 2026, segons la nota del Port del 15 d'abril de 2026. La naviliera t'indica quina terminal fas servir.",
    busTitle: "Llançadora Cruise Bus",
    bus: [
      "La llançadora que abans es deia Portbus ara és el **Cruise Bus**, de Transports Ciutat Comtal. El bitllet senzill costa **3,50 €**; el de dia, de **5 €**, dona viatges il·limitats aquella jornada, útil en una escala amb tornada al vaixell. Els bitllets en línia són per a la data que tries i arriben per correu en PDF.",
      "Para a les terminals A, B, D i E del Moll Adossat (la pàgina de parades de l'operador també cita la C, que segons el Port deixa de funcionar a finals d'octubre de 2026) i va fins a l'extrem de la ciutat al costat del World Trade Center, prop del Portal de la Pau i el monument a Colom, al peu de la Rambla. D'allà, l'estació de metro Drassanes (L3) queda a tocar.",
    ],
    taxiTitle: "Taxi",
    taxi: [
      "Els taxis metropolitans cobren un **suplement de 4,60 €** per recollir o deixar al Moll Adossat. Entre l'aeroport i el Moll Adossat hi ha una **tarifa fixa de 46 €**, amb els suplements inclosos.",
    ],
    walkTitle: "A peu",
    walk: "Des de la terminal del World Trade Center hi ha uns 400 metres fins a la ciutat. Des de les terminals del Moll Adossat, el Port no presenta el camí a peu com a opció: agafa la llançadora o un taxi.",
    changesTitle: "Canvis previstos",
    changes: "En la nota del 15 d'abril de 2026 el Port va indicar que la terminal C del Moll Adossat deixaria de funcionar a finals d'octubre de 2026 i després s'enderrocaria, i que la terminal Barcelona Sud, al World Trade Center, cessaria l'activitat a finals d'any. Confirma la terminal amb la naviliera.",
    tipsTitle: "Consells",
    tips: [
      "**Si continues cap a l'aeroport:** un taxi amb la tarifa fixa de 46 € és el més senzill amb equipatge; mira la guia de l'aeroport per al metro i l'Aerobús des de la ciutat.",
      "**Per tornar a bord a temps:** deixa un bon marge per a la llançadora o el taxi de tornada; l'hora d'embarcament és estricta.",
    ],
    faq: [
      { question: "Com s'hi va del port de creuers de Barcelona a la ciutat?", answer: "Amb la llançadora Cruise Bus (3,50 € senzill, 5 € tot el dia) fins al peu de la Rambla, o en taxi. Només la terminal del World Trade Center és a distància d'anar-hi a peu." },
      { question: "D'on surten els creuers a Barcelona?", answer: "Sobretot del Moll Adossat, amb les terminals A, B, D (Palacruceros), E (Helix) i MSC, i de la terminal Sud del World Trade Center, al Moll de Barcelona, al costat de la ciutat." },
      { question: "Quant costa el Cruise Bus de Barcelona?", answer: "3,50 € el trajecte senzill i 5 € el bitllet de dia, amb viatges il·limitats en aquella data." },
      { question: "Quant costa el taxi del port de creuers a l'aeroport?", answer: "Una tarifa fixa de 46 € entre l'aeroport i el Moll Adossat, amb suplements inclosos, segons la tarifa de l'AMB del 2026." },
      { question: "Es pot anar a peu de la terminal de creuers a la Rambla?", answer: "Des de la terminal del World Trade Center, sí (uns 400 m). Des de les del Moll Adossat, a entre 2 i 4 km, agafa la llançadora." },
    ],
    note: "Les terminals assignades, els preus i els serveis canvien: confirma-ho amb la naviliera i el Port abans d'atracar.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    ...h2(t.tTitle),
    table(t.tCaption, t.tHeaders, t.tRows, t.tNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.busTitle, ...t.bus),
    ...h2(t.taxiTitle, ...t.taxi),
    ...h2(t.walkTitle, t.walk),
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
