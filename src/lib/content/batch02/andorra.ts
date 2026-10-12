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
 * Left out: ALSA from Estació del Nord (its site could not be read), Andbus's
 * "A-PRIME" fare (who qualifies is not stated), Caldea, ski closing dates,
 * and operators' roaming prices. Where Andorra's own leaflet and the Spanish
 * tax agency disagree on the wine allowance, the tax agency wins: it is
 * Spanish customs that applies it.
 */

const VERIFIED = "2026-10-12";

const SOURCES: B2Source[] = [
  { name: "Andbus — timetables and fares", url: "https://www.andorrabybus.com/es/horarios-y-tarifas", publisher: "Andbus" },
  { name: "Direct Bus — timetables", url: "https://www.andorradirectbus.es/es/horarios", publisher: "Andorra Direct Bus" },
  { name: "Passports, visas and customs", url: "https://visitandorra.com/en/visitor-information/passports-visas-and-customs/", publisher: "Andorra Turisme" },
  { name: "Franquicias de tabaco, alcohol y otras mercancías", url: "https://sede.agenciatributaria.gob.es/Sede/viajeros-trabajadores-desplazados-fronterizos/viajeros/franquicias-tabaco-alcohol-otras-mercancias.html", publisher: "Agencia Tributaria" },
  { name: "Mobile roaming costs", url: "https://europa.eu/youreurope/citizens/consumers/internet-telecoms/mobile-roaming-costs/index_en.htm", publisher: "European Union — Your Europe" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "escapades/andorra-des-de-barcelona-autobus",
    title: "Andorra des de Barcelona en autobús: horaris, preus i què pots tornar a passar",
    seoTitle: "Andorra des de Barcelona en bus: horaris, preus i duana",
    seoDescription:
      "Autobusos de Barcelona (Sants, Diagonal, aeroport) a Andorra en unes 3 hores, des de 33 €. Documents, límits de duana en tornar i itinerància mòbil.",
    excerpt: "Com anar a Andorra en autobús des de Barcelona i l'aeroport, quins documents calen i què pots portar de tornada sense pagar a la duana.",
  },
  es: {
    path: "escapadas/andorra-desde-barcelona-autobus",
    title: "Andorra desde Barcelona en autobús: horarios, precios y qué puedes pasar de vuelta",
    seoTitle: "Andorra desde Barcelona en bus: horarios, precios y aduana",
    seoDescription:
      "Autobuses de Barcelona (Sants, Diagonal, aeropuerto) a Andorra en unas 3 horas, desde 33 €. Documentos, límites de aduana a la vuelta y roaming.",
    excerpt: "Cómo ir a Andorra en autobús desde Barcelona y el aeropuerto, qué documentos hacen falta y qué puedes traer de vuelta sin pagar en la aduana.",
  },
  en: {
    path: "day-trips/andorra-from-barcelona-by-bus",
    title: "Andorra from Barcelona by bus: times, fares and customs on the way back",
    seoTitle: "Andorra from Barcelona by bus: times, fares and customs",
    seoDescription:
      "Buses from Barcelona (Sants, Diagonal, the airport) to Andorra in about 3 hours, from €33. ID rules, duty-free limits on the way back, and roaming.",
    excerpt: "How to get to Andorra by bus from Barcelona and the airport, what documents you need, and what you can bring back without paying duty.",
  },
};

type T = {
  lead: string;
  busCaption: string; busHeaders: string[]; busRows: string[][]; busNote: string;
  busTitle: string; bus: string[];
  docsTitle: string; docs: string[];
  customsTitle: string; customsIntro: string; customs: string[]; customsNote: string;
  practicalTitle: string; practical: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "Andorra has no railway, so from Barcelona you go by **coach**: operators such as Andbus and Direct Bus run several buses a day from the city and the airport, taking about three hours. Andorra is **outside the EU and Schengen**, which matters for your documents and for what you can carry back into Spain.",
    busCaption: "Buses from Barcelona to Andorra la Vella",
    busHeaders: ["Operator", "Where it leaves from", "Journey", "Fare"],
    busRows: [
      ["Andbus", "Airport T1 and T2, Av. Diagonal", "About 2 h 45 from Diagonal, 3 h 15 from T1", "€33 single, €56 return (online)"],
      ["Direct Bus", "Barcelona-Sants, airport T1 and T2", "About 3 h from Sants, 3 h 30 from the airport", "€35 single"],
    ],
    busNote: "From each operator's own website, checked on 12 October 2026. Andbus's journey times are read from its timetable.",
    busTitle: "Frequency",
    bus: [
      "Andbus runs ten departures a day, roughly every two hours, the first at 00:45 from T1. Direct Bus lists eight a day from Sants, from 06:15 to 23:45, and seven from the airport. Both sell online; Andbus's fares apply only to tickets bought on its website.",
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
      { question: "How much is the bus from Barcelona to Andorra?", answer: "€33 single or €56 return with Andbus online, or €35 single with Direct Bus, on their websites as of 12 October 2026." },
      { question: "Do I need a passport for Andorra?", answer: "EU citizens can use an ID card or passport; others need a passport. Andorra is outside Schengen." },
      { question: "How many cigarettes can I bring back from Andorra?", answer: "300 cigarettes per adult, according to the Spanish tax agency; under-17s have no allowance." },
    ],
    note: "Bus times and fares change: check the operators before travelling.",
  },
  es: {
    lead: "Andorra no tiene tren, así que desde Barcelona se va en **autobús**: compañías como Andbus y Direct Bus tienen varios autobuses al día desde la ciudad y el aeropuerto, y tardan unas tres horas. Andorra está **fuera de la UE y de Schengen**, lo que importa para los documentos y para lo que puedes traer de vuelta a España.",
    busCaption: "Autobuses de Barcelona a Andorra la Vella",
    busHeaders: ["Compañía", "Desde dónde sale", "Duración", "Precio"],
    busRows: [
      ["Andbus", "Aeropuerto T1 y T2, av. Diagonal", "Unas 2 h 45 desde Diagonal, 3 h 15 desde la T1", "33 € ida, 56 € ida y vuelta (en línea)"],
      ["Direct Bus", "Barcelona-Sants, aeropuerto T1 y T2", "Unas 3 h desde Sants, 3 h 30 desde el aeropuerto", "35 € ida"],
    ],
    busNote: "De la web de cada compañía, comprobado el 12 de octubre de 2026. Las duraciones de Andbus se leen de su horario.",
    busTitle: "Frecuencia",
    bus: [
      "Andbus tiene diez salidas al día, más o menos cada dos horas, la primera a las 00:45 desde la T1. Direct Bus anuncia ocho al día desde Sants, de 06:15 a 23:45, y siete desde el aeropuerto. Las dos venden en línea; los precios de Andbus solo valen para billetes comprados en su web.",
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
      { question: "¿Cuánto cuesta el autobús de Barcelona a Andorra?", answer: "33 € ida o 56 € ida y vuelta con Andbus en línea, o 35 € ida con Direct Bus, según sus webs a 12 de octubre de 2026." },
      { question: "¿Hace falta pasaporte para ir a Andorra?", answer: "Los ciudadanos de la UE pueden usar el DNI o el pasaporte; el resto, pasaporte. Andorra está fuera de Schengen." },
      { question: "¿Cuánto tabaco se puede traer de Andorra?", answer: "300 cigarrillos por adulto, según la Agencia Tributaria; los menores de 17 no tienen franquicia." },
    ],
    note: "Los horarios y precios de los autobuses cambian: compruébalos en las compañías antes de viajar.",
  },
  ca: {
    lead: "Andorra no té tren, així que des de Barcelona s'hi va en **autobús**: companyies com Andbus i Direct Bus tenen diversos autobusos al dia des de la ciutat i l'aeroport, i triguen unes tres hores. Andorra és **fora de la UE i de Schengen**, cosa que importa per als documents i per al que pots tornar a portar a Espanya.",
    busCaption: "Autobusos de Barcelona a Andorra la Vella",
    busHeaders: ["Companyia", "D'on surt", "Durada", "Preu"],
    busRows: [
      ["Andbus", "Aeroport T1 i T2, av. Diagonal", "Unes 2 h 45 des de Diagonal, 3 h 15 des de la T1", "33 € anada, 56 € anada i tornada (en línia)"],
      ["Direct Bus", "Barcelona-Sants, aeroport T1 i T2", "Unes 3 h des de Sants, 3 h 30 des de l'aeroport", "35 € anada"],
    ],
    busNote: "Del web de cada companyia, comprovat el 12 d'octubre de 2026. Les durades d'Andbus es llegeixen del seu horari.",
    busTitle: "Freqüència",
    bus: [
      "Andbus té deu sortides al dia, més o menys cada dues hores, la primera a les 00:45 des de la T1. Direct Bus anuncia vuit al dia des de Sants, de 06:15 a 23:45, i set des de l'aeroport. Totes dues venen en línia; els preus d'Andbus només valen per a bitllets comprats al seu web.",
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
      { question: "Quant costa l'autobús de Barcelona a Andorra?", answer: "33 € anada o 56 € anada i tornada amb Andbus en línia, o 35 € anada amb Direct Bus, segons els seus webs a 12 d'octubre de 2026." },
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
