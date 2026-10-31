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
 * Andorra from Barcelona by bus, and what to know at the border.
 *
 * Buses from the operators' own sites (Andbus, Direct Bus); documents from
 * Andorra Turisme; customs allowances from the Agencia Tributaria (page
 * updated 23 Sep 2026); ski openings from Grandvalira and Pal Arinsal. All
 * checked on 12 Oct 2026 (research_notes/blog-batch-03/andorra.md).
 *
 * Re-checked on 24 Oct 2026: Andbus fares and timetable, Direct Bus
 * timetable (both directions), the tax agency page (updated 23 Sep 2026),
 * Andorra Turisme's document rules, Your Europe on roaming and on the
 * EUR 10,000 cash declaration, and the 4 Dec 2026 ski openings on the
 * Grandvalira and Pal Arinsal home pages. Direct Bus's 35 EUR fare was
 * dropped: none of its pages read today shows a Barcelona-Andorra price.
 *
 * Re-checked on 31 Oct 2026 (striking-distance push, "barcelona to andorra
 * bus" at ~21): Andbus (unchanged; its fare table is headed "Barcelona
 * Aeropuerto ↔ Andorra Estación bus", so the 33/56 EUR fares are printed as
 * airport fares), Direct Bus (unchanged; airport T1 "Planta 0, Andenes 7-12"
 * and T2 "Entre Terminal B y C" departures added, Sant Julià de Lòria returns
 * 10 min after Andorra la Vella, times "pueden estar sujetos a modificaciones"
 * on 24, 25 and 31 Dec and 1 Jan), the Govern d'Andorra's note on the
 * Estació Nacional d'Autobusos (4 May 2017: 10 bays, run by Estació 2017,
 * SA), the tax agency page (updated 23 Sep 2026) and Grandvalira ("Open from
 * 4 December"). The tax agency's Andorra section names no minimum age; its
 * third-country section says under-17s get no tobacco or alcohol allowance.
 * The page keeps the stricter rule.
 *
 * Left out: ALSA from Estació del Nord (its site could not be read, again on
 * 31 Oct: a queue page), FlixBus (its route page shows no Andorra times or
 * fare), the bus station's street address (no official page read), Andbus's
 * "A-PRIME" fare (who qualifies is not stated), Caldea, ski closing dates,
 * and operators' roaming prices. Where Andorra's own leaflet and the Spanish
 * tax agency disagree on the wine allowance, the tax agency wins: it is
 * Spanish customs that applies it.
 */

const VERIFIED = "2026-10-31";

const SOURCES: B2Source[] = [
  { name: "Andbus — timetables and fares", url: "https://www.andorrabybus.com/es/horarios-y-tarifas", publisher: "Andbus" },
  { name: "Direct Bus — timetables", url: "https://www.andorradirectbus.es/es/horarios", publisher: "Andorra Direct Bus" },
  { name: "Passports, visas and customs", url: "https://visitandorra.com/en/visitor-information/passports-visas-and-customs/", publisher: "Andorra Turisme" },
  { name: "Franquicias de tabaco, alcohol y otras mercancías", url: "https://sede.agenciatributaria.gob.es/Sede/viajeros-trabajadores-desplazados-fronterizos/viajeros/franquicias-tabaco-alcohol-otras-mercancias.html", publisher: "Agencia Tributaria" },
  { name: "Mobile roaming costs", url: "https://europa.eu/youreurope/citizens/consumers/internet-telecoms/mobile-roaming-costs/index_en.htm", publisher: "European Union — Your Europe" },
  { name: "Travelling with cash", url: "https://europa.eu/youreurope/citizens/travel/carry/carrying-cash/index_en.htm", publisher: "European Union — Your Europe" },
  { name: "Grandvalira", url: "https://www.grandvalira.com/en", publisher: "Grandvalira Resorts" },
  { name: "L'Estació Nacional d'Autobusos obre les portes", url: "https://www.govern.ad/ca/w/l-estacio-nacional-d-autobusos-obre-les-portes-1", publisher: "Govern d'Andorra" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "escapades/andorra-des-de-barcelona-autobus",
    title: "Autobús de Barcelona a Andorra: horaris, preus, des de l'aeroport i duana",
    seoTitle: "Andorra des de Barcelona en bus: horaris, preus i duana",
    seoDescription:
      "Bus de Barcelona a Andorra en unes 3 hores: Andbus des de l'aeroport i Diagonal (33 € en línia) i Direct Bus des de Sants i l'aeroport. Documents i duana.",
    excerpt: "Com anar a Andorra en autobús des de Barcelona i l'aeroport, quins documents calen i què pots portar de tornada sense pagar a la duana.",
  },
  es: {
    path: "escapadas/andorra-desde-barcelona-autobus",
    title: "Autobús de Barcelona a Andorra: horarios, precios, desde el aeropuerto y aduana",
    seoTitle: "Andorra desde Barcelona en bus: horarios, precios y aduana",
    seoDescription:
      "Bus de Barcelona a Andorra en unas 3 horas: Andbus desde el aeropuerto y Diagonal (33 € en línea) y Direct Bus desde Sants y el aeropuerto. DNI y aduana.",
    excerpt: "Cómo ir a Andorra en autobús desde Barcelona y el aeropuerto, qué documentos hacen falta y qué puedes traer de vuelta sin pagar en la aduana.",
  },
  en: {
    path: "day-trips/andorra-from-barcelona-by-bus",
    title: "Barcelona to Andorra bus: timetables, fares, from the airport, customs",
    seoTitle: "Barcelona to Andorra bus: timetable, fares and customs",
    seoDescription:
      "Barcelona to Andorra by bus in about 3 hours: Andbus from the airport and Diagonal (€33 online), Direct Bus from Sants and the airport. ID and customs.",
    excerpt: "How to get to Andorra by bus from Barcelona and the airport, what documents you need, and what you can bring back without paying duty.",
  },
};

type T = {
  lead: string;
  busCaption: string; busHeaders: string[]; busRows: string[][]; busNote: string;
  busTitle: string; bus: string[];
  airportTitle: string; airport: string[];
  arriveTitle: string; arrive: string[];
  docsTitle: string; docs: string[];
  customsTitle: string; customsIntro: string; customs: string[]; customsNote: string;
  practicalTitle: string; practical: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "There is no train to Andorra: from Barcelona you go by **coach**, in about three hours. **Andbus** leaves the airport (T1 and T2) and Av. Diagonal every two hours, day and night, for €33 single from the airport online; **Direct Bus** leaves Barcelona-Sants eight times a day and the airport seven. Andorra is **outside the EU and Schengen**, which matters for your documents and for what you can carry back into Spain.",
    busCaption: "Buses from Barcelona to Andorra la Vella",
    busHeaders: ["Operator", "Where it leaves from", "Departures from Barcelona", "Journey", "Fare"],
    busRows: [
      ["Andbus", "Airport T1 and T2, Av. Diagonal", "T1 every 2 hours from 00:45 to 22:45; T2 15 min later, Diagonal 30 min later", "About 2 h 45 from Diagonal, 3 h 15 from T1", "€33 single, €56 return from the airport (online)"],
      ["Direct Bus", "Barcelona-Sants, airport T1 and T2", "Sants 06:15, 08:15, 11:45, 13:45, 15:45, 18:15, 20:45, 23:45; T1 07:30, 11:00, 13:00, 15:00, 17:30, 20:00, 23:00 (T2 15 min later)", "About 3 h from Sants, 3 h 30 from the airport", "Shown when booking"],
    ],
    busNote: "From each operator's own timetable page, checked on 31 October 2026. Andbus's journey times are read from its timetable. Direct Bus warns that times may change on 24, 25 and 31 December and 1 January.",
    busTitle: "Barcelona to Andorra bus timetable",
    bus: [
      "Andbus runs ten departures a day, every two hours, the first at 00:45 from T1. Direct Bus lists eight a day from Sants, from 06:15 to 23:45, and seven from the airport. Back to Barcelona, Andbus leaves Andorra la Vella every two hours from 02:00 to 20:00, and Direct Bus at 06:15, 08:15, 10:45, 13:15, 15:15, 17:45, 20:15 and 22:15. Both sell online; Andbus's fares apply only to tickets bought on its website.",
    ],
    airportTitle: "Barcelona airport to Andorra by bus",
    airport: [
      "Both companies pick up at the airport, so you do not need to go into the city first. **Andbus** leaves T1 every two hours from 00:45 to 22:45 and calls at T2 15 minutes later; it reaches Andorra about 3 h 15 after leaving T1. **Direct Bus** leaves T1 at 07:30, 11:00, 13:00, 15:00, 17:30, 20:00 and 23:00, from the ground floor (bays 7 to 12), and T2 15 minutes later, from between terminals B and C; the trip takes about 3 h 30.",
      "If you are flying in and staying in Barcelona first, the [airport to city centre guide](/en/guides/barcelona-airport-to-city-centre/) has the bus, metro and train options.",
    ],
    arriveTitle: "Where the bus arrives in Andorra",
    arrive: [
      "Andbus runs to the **Estació Nacional d'Autobusos** in Andorra la Vella, the national bus station opened in 2017 on land given by the Comú d'Andorra la Vella, with ten bays (Govern d'Andorra). Direct Bus lists two stops, Andorra la Vella and Sant Julià de Lòria; on the way back its buses leave Sant Julià ten minutes after Andorra la Vella, from 06:25 to 22:25.",
    ],
    docsTitle: "Documents",
    docs: [
      "No visa is needed to enter Andorra. **EU citizens** need an ID card or passport; **everyone else** needs a passport.",
      "Because Andorra is outside Schengen, going there counts as **leaving the Schengen area**: visitors who need a Schengen visa must hold one valid for at least two entries to get back into Spain. Minors travelling without a parent need extra paperwork.",
    ],
    customsTitle: "What you can bring back without paying duty",
    customsIntro: "Returning to Spain, each adult can bring, according to the Spanish tax agency:",
    customs: [
      "**Goods** worth up to €900 (€450 for under-15s), and food up to €300.",
      "**Tobacco:** 300 cigarettes, or 150 cigarillos, or 75 cigars, or 400 g of smoking tobacco.",
      "**Alcohol:** 1.5 litres of spirits over 22% or 3 litres of drinks under 22%, plus 5 litres of still wine and 16 litres of beer.",
      "**Fuel:** a full standard tank plus a portable can of up to 10 litres.",
      "**Cash** of €10,000 or more must be declared.",
    ],
    customsNote: "Under-17s have no tobacco or alcohol allowance. Andorra's own tourist leaflet presents the wine as an alternative to spirits; the Spanish tax agency, which applies the rules at the border, lists it as additional.",
    practicalTitle: "Money, phones and snow",
    practical: [
      "**Currency:** the euro.",
      "**Mobile roaming:** the EU's 'roam like at home' rules do not cover Andorra; check your operator's prices before you go, or switch off data roaming.",
      "**Skiing:** Grandvalira and Pal Arinsal both give 4 December 2026 as their opening day.",
    ],
    faq: [
      { question: "How do you get from Barcelona to Andorra?", answer: "By coach: Andbus from the airport and Av. Diagonal, or Direct Bus from Sants and the airport, in about three hours. There is no train." },
      { question: "How much is the bus from Barcelona to Andorra?", answer: "€33 single or €56 return from the airport with Andbus, buying online, on its website as of 31 October 2026. Direct Bus shows its fare when you book." },
      { question: "Is there a bus from Barcelona airport to Andorra?", answer: "Yes. Andbus leaves T1 every two hours from 00:45 to 22:45 (T2 15 minutes later), and Direct Bus leaves T1 seven times a day from 07:30 to 23:00 (T2 15 minutes later). The trip takes about 3 h 15 to 3 h 30." },
      { question: "Where does the bus arrive in Andorra la Vella?", answer: "Andbus arrives at the Estació Nacional d'Autobusos, Andorra la Vella's national bus station. Direct Bus lists Andorra la Vella and Sant Julià de Lòria." },
      { question: "When is the last bus from Andorra to Barcelona?", answer: "Andbus leaves Andorra la Vella every two hours until 20:00; Direct Bus's last departure is at 22:15, on their timetables in October 2026." },
      { question: "Do I need a passport for Andorra?", answer: "EU citizens can use an ID card or passport; others need a passport. Andorra is outside Schengen." },
      { question: "How many cigarettes can I bring back from Andorra?", answer: "300 cigarettes per adult, according to the Spanish tax agency; under-17s have no allowance." },
    ],
    note: "Bus times and fares change: check the operators before travelling.",
  },
  es: {
    lead: "A Andorra no se llega en tren: desde Barcelona se va en **autobús**, en unas tres horas. **Andbus** sale del aeropuerto (T1 y T2) y de la av. Diagonal cada dos horas, de día y de noche, por 33 € la ida desde el aeropuerto comprando en línea; **Direct Bus** sale de Barcelona-Sants ocho veces al día y del aeropuerto siete. Andorra está **fuera de la UE y de Schengen**, lo que importa para los documentos y para lo que puedes traer de vuelta a España.",
    busCaption: "Autobuses de Barcelona a Andorra la Vella",
    busHeaders: ["Compañía", "Desde dónde sale", "Salidas desde Barcelona", "Duración", "Precio"],
    busRows: [
      ["Andbus", "Aeropuerto T1 y T2, av. Diagonal", "T1 cada 2 horas de 00:45 a 22:45; T2 15 min después, Diagonal 30 min después", "Unas 2 h 45 desde Diagonal, 3 h 15 desde la T1", "33 € ida, 56 € ida y vuelta desde el aeropuerto (en línea)"],
      ["Direct Bus", "Barcelona-Sants, aeropuerto T1 y T2", "Sants 06:15, 08:15, 11:45, 13:45, 15:45, 18:15, 20:45, 23:45; T1 07:30, 11:00, 13:00, 15:00, 17:30, 20:00, 23:00 (T2 15 min después)", "Unas 3 h desde Sants, 3 h 30 desde el aeropuerto", "Se muestra al reservar"],
    ],
    busNote: "De la página de horarios de cada compañía, comprobado el 31 de octubre de 2026. Las duraciones de Andbus se leen de su horario. Direct Bus avisa de que los horarios pueden cambiar el 24, 25 y 31 de diciembre y el 1 de enero.",
    busTitle: "Horarios del autobús de Barcelona a Andorra",
    bus: [
      "Andbus tiene diez salidas al día, cada dos horas, la primera a las 00:45 desde la T1. Direct Bus anuncia ocho al día desde Sants, de 06:15 a 23:45, y siete desde el aeropuerto. De vuelta a Barcelona, Andbus sale de Andorra la Vella cada dos horas de 02:00 a 20:00, y Direct Bus a las 06:15, 08:15, 10:45, 13:15, 15:15, 17:45, 20:15 y 22:15. Las dos venden en línea; los precios de Andbus solo valen para billetes comprados en su web.",
    ],
    airportTitle: "Autobús del aeropuerto de Barcelona a Andorra",
    airport: [
      "Las dos compañías recogen en el aeropuerto, así que no hace falta pasar por la ciudad. **Andbus** sale de la T1 cada dos horas de 00:45 a 22:45 y para en la T2 15 minutos después; llega a Andorra unas 3 h 15 después de salir de la T1. **Direct Bus** sale de la T1 a las 07:30, 11:00, 13:00, 15:00, 17:30, 20:00 y 23:00, desde la planta 0 (andenes 7 a 12), y de la T2 15 minutos después, entre las terminales B y C; tarda unas 3 h 30.",
      "Si aterrizas y te quedas primero en Barcelona, la guía [del aeropuerto al centro de Barcelona](/es/guias/aeropuerto-barcelona-centro/) tiene el bus, el metro y el tren.",
    ],
    arriveTitle: "Dónde llega el autobús en Andorra",
    arrive: [
      "Andbus llega a la **Estació Nacional d'Autobusos** de Andorra la Vella, la estación nacional de autobuses inaugurada en 2017 en un terreno cedido por el Comú d'Andorra la Vella, con diez andenes (Govern d'Andorra). Direct Bus indica dos paradas, Andorra la Vella y Sant Julià de Lòria; de vuelta, sus autobuses salen de Sant Julià diez minutos después que de Andorra la Vella, de 06:25 a 22:25.",
    ],
    docsTitle: "Documentos",
    docs: [
      "Para entrar en Andorra no hace falta visado. Los **ciudadanos de la UE** necesitan DNI o pasaporte; **el resto**, pasaporte.",
      "Como Andorra está fuera de Schengen, ir allí cuenta como **salir del espacio Schengen**: quien necesite visado Schengen debe tener uno válido para al menos dos entradas para poder volver a España. Los menores que viajan sin sus padres necesitan documentación adicional.",
    ],
    customsTitle: "Lo que puedes traer de vuelta sin pagar",
    customsIntro: "Al volver a España, cada adulto puede traer, según la Agencia Tributaria:",
    customs: [
      "**Mercancías** por valor de hasta 900 € (450 € los menores de 15), y alimentos hasta 300 €.",
      "**Tabaco:** 300 cigarrillos, o 150 puritos, o 75 cigarros, o 400 g de tabaco de fumar.",
      "**Alcohol:** 1,5 litros de bebidas de más de 22° o 3 litros de menos de 22°, más 5 litros de vino tranquilo y 16 litros de cerveza.",
      "**Combustible:** el depósito normal lleno más un bidón portátil de hasta 10 litros.",
      "**Efectivo** de 10.000 € o más hay que declararlo.",
    ],
    customsNote: "Los menores de 17 años no tienen franquicia de tabaco ni de alcohol. El folleto turístico de Andorra presenta el vino como alternativa a las bebidas de alta graduación; la Agencia Tributaria, que es quien aplica las normas en la frontera, lo considera adicional.",
    practicalTitle: "Dinero, móvil y nieve",
    practical: [
      "**Moneda:** el euro.",
      "**Roaming:** las reglas europeas de «itinerancia como en casa» no incluyen Andorra; consulta las tarifas de tu operador antes de ir o desactiva los datos en itinerancia.",
      "**Esquí:** Grandvalira y Pal Arinsal dan el 4 de diciembre de 2026 como día de apertura.",
    ],
    faq: [
      { question: "¿Cómo se va de Barcelona a Andorra?", answer: "En autobús: Andbus desde el aeropuerto y la av. Diagonal, o Direct Bus desde Sants y el aeropuerto, en unas tres horas. No hay tren." },
      { question: "¿Cuánto cuesta el autobús de Barcelona a Andorra?", answer: "33 € ida o 56 € ida y vuelta desde el aeropuerto con Andbus, comprando en línea, según su web a 31 de octubre de 2026. Direct Bus muestra el precio al reservar." },
      { question: "¿Hay autobús del aeropuerto de Barcelona a Andorra?", answer: "Sí. Andbus sale de la T1 cada dos horas de 00:45 a 22:45 (T2, 15 minutos después) y Direct Bus sale de la T1 siete veces al día de 07:30 a 23:00 (T2, 15 minutos después). El trayecto dura unas 3 h 15 a 3 h 30." },
      { question: "¿Dónde llega el autobús en Andorra la Vella?", answer: "Andbus llega a la Estació Nacional d'Autobusos, la estación de autobuses de Andorra la Vella. Direct Bus indica Andorra la Vella y Sant Julià de Lòria." },
      { question: "¿A qué hora sale el último autobús de Andorra a Barcelona?", answer: "Andbus sale de Andorra la Vella cada dos horas hasta las 20:00; la última salida de Direct Bus es a las 22:15, según sus horarios de octubre de 2026." },
      { question: "¿Hace falta pasaporte para ir a Andorra?", answer: "Los ciudadanos de la UE pueden usar el DNI o el pasaporte; el resto, pasaporte. Andorra está fuera de Schengen." },
      { question: "¿Cuánto tabaco se puede traer de Andorra?", answer: "300 cigarrillos por adulto, según la Agencia Tributaria; los menores de 17 no tienen franquicia." },
    ],
    note: "Los horarios y precios de los autobuses cambian: compruébalos en las compañías antes de viajar.",
  },
  ca: {
    lead: "A Andorra no s'hi arriba en tren: des de Barcelona s'hi va en **autobús**, en unes tres hores. **Andbus** surt de l'aeroport (T1 i T2) i de l'av. Diagonal cada dues hores, de dia i de nit, per 33 € l'anada des de l'aeroport comprant en línia; **Direct Bus** surt de Barcelona-Sants vuit vegades al dia i de l'aeroport set. Andorra és **fora de la UE i de Schengen**, cosa que importa per als documents i per al que pots tornar a portar a Espanya.",
    busCaption: "Autobusos de Barcelona a Andorra la Vella",
    busHeaders: ["Companyia", "D'on surt", "Sortides des de Barcelona", "Durada", "Preu"],
    busRows: [
      ["Andbus", "Aeroport T1 i T2, av. Diagonal", "T1 cada 2 hores de 00:45 a 22:45; T2 15 min després, Diagonal 30 min després", "Unes 2 h 45 des de Diagonal, 3 h 15 des de la T1", "33 € anada, 56 € anada i tornada des de l'aeroport (en línia)"],
      ["Direct Bus", "Barcelona-Sants, aeroport T1 i T2", "Sants 06:15, 08:15, 11:45, 13:45, 15:45, 18:15, 20:45, 23:45; T1 07:30, 11:00, 13:00, 15:00, 17:30, 20:00, 23:00 (T2 15 min després)", "Unes 3 h des de Sants, 3 h 30 des de l'aeroport", "Es mostra en reservar"],
    ],
    busNote: "De la pàgina d'horaris de cada companyia, comprovat el 31 d'octubre de 2026. Les durades d'Andbus es llegeixen del seu horari. Direct Bus avisa que els horaris poden canviar el 24, 25 i 31 de desembre i l'1 de gener.",
    busTitle: "Horaris de l'autobús de Barcelona a Andorra",
    bus: [
      "Andbus té deu sortides al dia, cada dues hores, la primera a les 00:45 des de la T1. Direct Bus anuncia vuit al dia des de Sants, de 06:15 a 23:45, i set des de l'aeroport. De tornada a Barcelona, Andbus surt d'Andorra la Vella cada dues hores de 02:00 a 20:00, i Direct Bus a les 06:15, 08:15, 10:45, 13:15, 15:15, 17:45, 20:15 i 22:15. Totes dues venen en línia; els preus d'Andbus només valen per a bitllets comprats al seu web.",
    ],
    airportTitle: "Autobús de l'aeroport de Barcelona a Andorra",
    airport: [
      "Totes dues companyies recullen a l'aeroport, així que no cal passar per la ciutat. **Andbus** surt de la T1 cada dues hores de 00:45 a 22:45 i para a la T2 15 minuts després; arriba a Andorra unes 3 h 15 després de sortir de la T1. **Direct Bus** surt de la T1 a les 07:30, 11:00, 13:00, 15:00, 17:30, 20:00 i 23:00, des de la planta 0 (andanes 7 a 12), i de la T2 15 minuts després, entre les terminals B i C; triga unes 3 h 30.",
      "Si aterres i et quedes primer a Barcelona, la guia [de l'aeroport al centre de Barcelona](/ca/guies/aeroport-barcelona-centre/) té el bus, el metro i el tren.",
    ],
    arriveTitle: "On arriba l'autobús a Andorra",
    arrive: [
      "Andbus arriba a l'**Estació Nacional d'Autobusos** d'Andorra la Vella, inaugurada el 2017 en un terreny cedit pel Comú d'Andorra la Vella, amb deu andanes (Govern d'Andorra). Direct Bus indica dues parades, Andorra la Vella i Sant Julià de Lòria; de tornada, els seus autobusos surten de Sant Julià deu minuts després que d'Andorra la Vella, de 06:25 a 22:25.",
    ],
    docsTitle: "Documents",
    docs: [
      "Per entrar a Andorra no cal visat. Els **ciutadans de la UE** necessiten DNI o passaport; **la resta**, passaport.",
      "Com que Andorra és fora de Schengen, anar-hi compta com a **sortir de l'espai Schengen**: qui necessiti visat Schengen n'ha de tenir un de vàlid per a almenys dues entrades per poder tornar a Espanya. Els menors que viatgen sense els pares necessiten documentació addicional.",
    ],
    customsTitle: "El que pots tornar a portar sense pagar",
    customsIntro: "En tornar a Espanya, cada adult pot portar, segons l'Agència Tributària:",
    customs: [
      "**Mercaderies** per valor de fins a 900 € (450 € els menors de 15), i aliments fins a 300 €.",
      "**Tabac:** 300 cigarrets, o 150 purets, o 75 cigars, o 400 g de tabac de fumar.",
      "**Alcohol:** 1,5 litres de begudes de més de 22° o 3 litres de menys de 22°, més 5 litres de vi tranquil i 16 litres de cervesa.",
      "**Combustible:** el dipòsit normal ple més un bidó portàtil de fins a 10 litres.",
      "**Efectiu** de 10.000 € o més cal declarar-lo.",
    ],
    customsNote: "Els menors de 17 anys no tenen franquícia de tabac ni d'alcohol. El fulletó turístic d'Andorra presenta el vi com a alternativa a les begudes d'alta graduació; l'Agència Tributària, que és qui aplica les normes a la frontera, el considera addicional.",
    practicalTitle: "Diners, mòbil i neu",
    practical: [
      "**Moneda:** l'euro.",
      "**Itinerància:** les normes europees d'«itinerància com a casa» no inclouen Andorra; consulta les tarifes del teu operador abans d'anar-hi o desactiva les dades en itinerància.",
      "**Esquí:** Grandvalira i Pal Arinsal donen el 4 de desembre de 2026 com a dia d'obertura.",
    ],
    faq: [
      { question: "Com s'hi va de Barcelona a Andorra?", answer: "En autobús: Andbus des de l'aeroport i l'av. Diagonal, o Direct Bus des de Sants i l'aeroport, en unes tres hores. No hi ha tren." },
      { question: "Quant costa l'autobús de Barcelona a Andorra?", answer: "33 € anada o 56 € anada i tornada des de l'aeroport amb Andbus, comprant en línia, segons el seu web a 31 d'octubre de 2026. Direct Bus mostra el preu en reservar." },
      { question: "Hi ha autobús de l'aeroport de Barcelona a Andorra?", answer: "Sí. Andbus surt de la T1 cada dues hores de 00:45 a 22:45 (T2, 15 minuts després) i Direct Bus surt de la T1 set vegades al dia de 07:30 a 23:00 (T2, 15 minuts després). El trajecte dura unes 3 h 15 a 3 h 30." },
      { question: "On arriba l'autobús a Andorra la Vella?", answer: "Andbus arriba a l'Estació Nacional d'Autobusos, l'estació d'autobusos d'Andorra la Vella. Direct Bus indica Andorra la Vella i Sant Julià de Lòria." },
      { question: "A quina hora surt l'últim autobús d'Andorra a Barcelona?", answer: "Andbus surt d'Andorra la Vella cada dues hores fins a les 20:00; l'última sortida de Direct Bus és a les 22:15, segons els seus horaris d'octubre de 2026." },
      { question: "Cal passaport per anar a Andorra?", answer: "Els ciutadans de la UE poden fer servir el DNI o el passaport; la resta, passaport. Andorra és fora de Schengen." },
      { question: "Quant tabac es pot portar d'Andorra?", answer: "300 cigarrets per adult, segons l'Agència Tributària; els menors de 17 no tenen franquícia." },
    ],
    note: "Els horaris i preus dels autobusos canvien: comprova'ls a les companyies abans de viatjar.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    table(t.busCaption, t.busHeaders, t.busRows, t.busNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.busTitle, ...t.bus),
    ...h2(t.airportTitle, ...t.airport),
    ...h2(t.arriveTitle, ...t.arrive),
    ...h2(t.docsTitle, ...t.docs),
    ...h2(t.customsTitle, t.customsIntro),
    list(...t.customs),
    callout("info", t.customsTitle, t.customsNote),
    ...h2(t.practicalTitle),
    list(...t.practical),
    faq(t.faq),
    ...b2Related(["ski", "airport", "cerdanya"], locale),
  ];
}

export const ANDORRA: B2Article = {
  key: "andorra",
  entryKey: "daytrip-andorra-from-barcelona-bus",
  categoryKey: "mountain",
  sources: SOURCES,
  heroKey: "andorra-la-vella-vall",
  heroAlt: {
    ca: "Andorra la Vella al fons de la vall, sota muntanyes nevades",
    es: "Andorra la Vella en el fondo del valle, bajo montañas nevadas",
    en: "Andorra la Vella in the valley floor beneath snow-dusted mountains",
  },
  heroCaption: {
    ca: "Andorra la Vella, a unes tres hores de Barcelona en autobús.",
    es: "Andorra la Vella, a unas tres horas de Barcelona en autobús.",
    en: "Andorra la Vella, about three hours from Barcelona by coach.",
  },
  secondaryKey: "andorra-pont-margineda",
  secondaryAlt: {
    ca: "El pont medieval de la Margineda sobre el riu Valira",
    es: "El puente medieval de la Margineda sobre el río Valira",
    en: "The medieval Margineda bridge over the Valira river",
  },
  secondaryCaption: {
    ca: "El pont de la Margineda, a Santa Coloma.",
    es: "El puente de la Margineda, en Santa Coloma.",
    en: "The Margineda bridge at Santa Coloma.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T00:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as ANDORRA_META };
