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
 * Two Barcelona guides: the Zoo and the Aquarium, and the food markets.
 *
 * Zoo from zoobarcelona.cat, Aquarium from aquariumbcn.com (hours read from
 * the calendar data behind its own page), markets from the City Council's
 * markets institute and its 2017, 2019 and Aug 2026 notes. Checked on
 * 12 Oct 2026 (research_notes/blog-batch-03/zoo_aquarium.md, markets.md);
 * all of it re-checked on 24 Oct 2026 against the same official pages.
 *
 * Left out: the Zoo's seasonal timetable (the site shows only today's hours),
 * the Zoo Club price (the site states two), any Zoo + Aquarium combo (only
 * resellers sell one), Boqueria stall-by-stall habits (blogs only), and the
 * group rules at Santa Caterina and Sant Antoni, which were not reconfirmed.
 */

const VERIFIED = "2026-10-24";
type Meta = { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string };

/* ========================================================================== */
/* Zoo and Aquarium                                                           */
/* ========================================================================== */

const ZOO_SOURCES: B2Source[] = [
  { name: "Zoo de Barcelona", url: "https://www.zoobarcelona.cat/", publisher: "Zoo de Barcelona (BSM)" },
  { name: "Zoo de Barcelona — entradas y abonos", url: "https://www.zoobarcelona.cat/es/planifica-tu-visita/entradas-y-abonos", publisher: "Zoo de Barcelona (BSM)" },
  { name: "Zoo de Barcelona — horario del Zoo", url: "https://www.zoobarcelona.cat/es/visita-el-zoo/horario-del-zoo", publisher: "Zoo de Barcelona (BSM)" },
  { name: "Zoo de Barcelona — cómo llegar", url: "https://www.zoobarcelona.cat/es/planifica-tu-visita/como-llegar", publisher: "Zoo de Barcelona (BSM)" },
  { name: "L'Aquàrium de Barcelona — prices", url: "https://www.aquariumbcn.com/en/visit/prices/", publisher: "L'Aquàrium de Barcelona" },
  { name: "L'Aquàrium de Barcelona — opening hours", url: "https://www.aquariumbcn.com/en/visit/opening-hours/", publisher: "L'Aquàrium de Barcelona" },
  { name: "L'Aquàrium de Barcelona — how to get here", url: "https://www.aquariumbcn.com/en/plan-your-visit/how-to-get-here/", publisher: "L'Aquàrium de Barcelona" },
];

const ZOO_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/zoo-aquarium-barcelona",
    title: "Zoo i Aquàrium de Barcelona: entrades, horaris i com arribar-hi",
    seoTitle: "Zoo i Aquàrium de Barcelona: horaris i preu de les entrades",
    seoDescription:
      "Zoo de Barcelona a 23 € (infants 13,90 €), entrada només per la Ciutadella, i Aquàrium a 30 € (5 a 10 anys, 23 €). Horaris de tots dos i com arribar-hi.",
    excerpt: "Quant costen el Zoo i l'Aquàrium de Barcelona, quan obren, qui hi entra gratis i com s'hi arriba, amb dades dels webs oficials.",
  },
  es: {
    path: "guias/zoo-aquarium-barcelona",
    title: "Zoo y Aquarium de Barcelona: entradas, horarios y cómo llegar",
    seoTitle: "Zoo y Aquarium de Barcelona: horario y precio de las entradas",
    seoDescription:
      "Zoo de Barcelona a 23 € (niños 13,90 €), entrada solo por la Ciutadella, y Aquarium a 30 € (de 5 a 10 años, 23 €). Horario de los dos y cómo llegar.",
    excerpt: "Cuánto cuestan el Zoo y el Aquarium de Barcelona, cuándo abren, quién entra gratis y cómo se llega, con datos de las webs oficiales.",
  },
  en: {
    path: "guides/barcelona-zoo-aquarium-tickets",
    title: "Barcelona Zoo and Aquarium: tickets, opening hours and getting there",
    seoTitle: "Barcelona Zoo and Aquarium: ticket prices and hours",
    seoDescription:
      "Barcelona Zoo €23 (children €13.90) and the Aquarium €30 (ages 5–10 €23), opening hours, who goes free and how to get there by metro, from the official sites.",
    excerpt: "What Barcelona Zoo and the Aquarium cost, when they open, who goes free and how to get there, from the official websites.",
  },
};

type ZT = {
  lead: string;
  pTitle: string;
  pCaption: string; pHeaders: string[]; pRows: string[][]; pNote: string;
  zooTitle: string; zoo: string[];
  aqTitle: string; aq: string[];
  aqCaption: string; aqHeaders: string[]; aqRows: string[][]; aqNote: string;
  getTitle: string; get: string[];
  faq: { question: string; answer: string }[]; note: string;
};

/**
 * Re-checked 24 Oct 2026. Zoo: zoobarcelona.cat/es/planifica-tu-visita/
 * entradas-y-abonos (prices), /visita-el-zoo/horario-del-zoo (today's hours
 * only: 10:00-17:30, gates and ticket offices close 17:00), home page (only
 * entrance inside the Parc de la Ciutadella; some areas closed for works),
 * /como-llegar (metro, Renfe, buses). The Zoo publishes no seasonal
 * calendar, so none is printed; the "open every day of the year / closes on
 * Christmas afternoon" line was dropped because no official page states it
 * today. Aquarium: /en/visit/prices/ and the openingHoursData calendar behind
 * /en/visit/opening-hours/ (published to 31 Jan 2027).
 */
const ZOO_COPY: Record<Locale, ZT> = {
  en: {
    lead: "**Barcelona Zoo costs €23** (children 3 to 12, €13.90) and on 24 October 2026 it was open **10:00 to 17:30**, with ticket offices and gates closing at 17:00; you can only get in through the entrance inside the Parc de la Ciutadella. **The Aquarium costs €30** (ages 5 to 10, €23) and opens **10:00 to 20:00 every day until 1 November**; from 2 November it closes at 19:00 on weekdays. Both charge the same online and at the door, and they are a short metro ride apart.",
    pTitle: "Barcelona Zoo and Aquarium ticket prices",
    pCaption: "Ticket prices in 2026",
    pHeaders: ["Ticket", "Zoo", "Aquarium"],
    pRows: [
      ["Adult", "€23 (13 and over)", "€30 (11 and over)"],
      ["Child", "€13.90 (3 to 12)", "€23 (5 to 10), €15 (3 to 4)"],
      ["Senior", "€11.20 (over 65, ticket office)", "€25 (over 65)"],
      ["Under 3", "Free", "Free"],
      ["Disability card", "€6 (33% or more, ticket office)", "€20 adult, €14 child (ticket office)"],
      ["Packs (online)", "—", "2 adults + 2 children €88; 1 + 2 €63; 4 adults €100"],
    ],
    pNote: "From zoobarcelona.cat and aquariumbcn.com, checked on 24 October 2026. There is no official combined Zoo and Aquarium ticket.",
    zooTitle: "Barcelona Zoo opening hours",
    zoo: [
      "The Zoo publishes only the current day's hours. On **24 October 2026** it opened **10:00 to 17:30**, and ticket offices and gates closed at **17:00**. Hours change through the year, so check the Zoo's timetable page on the day.",
      "**Entrance:** at the moment you can only get into the Zoo through the entrance inside the Parc de la Ciutadella. Some enclosures and areas are temporarily closed while the Zoo carries out improvement works; the rest of the park stays open.",
      "**Discounts:** large-family and single-parent family cards get 20% off at the ticket office. Visitors with a disability of 33% or more pay €6, with a free companion when the Zoo's conditions are met.",
    ],
    aqTitle: "Barcelona Aquarium opening hours",
    aq: [
      "The Aquarium opens every day; the ticket office and entry close **one hour before closing time**. Its calendar is published to 31 January 2027:",
    ],
    aqCaption: "L'Aquàrium opening hours, autumn and winter 2026-27",
    aqHeaders: ["Dates", "Opening hours"],
    aqRows: [
      ["Until 1 November 2026", "Every day 10:00–20:00"],
      ["2 November to 20 December", "Mon–Fri 10:00–19:00; Sat and Sun 10:00–20:00 (7 and 8 December 10:00–20:00)"],
      ["21 to 30 December", "10:00–20:00 (24 December 10:00–19:00)"],
      ["31 December", "10:00–19:00"],
      ["1 to 4 January 2027", "10:00–20:00"],
      ["5 to 31 January 2027", "Mon–Fri 10:00–19:00; Sat and Sun 10:00–20:00"],
    ],
    aqNote: "From the calendar on aquariumbcn.com, checked on 24 October 2026. Last entry one hour before closing.",
    getTitle: "How to get to the Zoo and the Aquarium",
    get: [
      "**Zoo:** entrance inside the Parc de la Ciutadella; metro L4 Barceloneta or L1 Arc de Triomf, Rodalies Arc de Triomf or Estació de França, buses V17, V19, H14 and H16.",
      "**Aquarium:** Moll d'Espanya in the Port Vell; metro L4 Barceloneta or L3 Drassanes.",
      "**Both in one day:** Barceloneta station (L4) and buses H14, V17 and V19 serve both.",
    ],
    faq: [
      { question: "How much is Barcelona Zoo?", answer: "€23 for adults and €13.90 for children aged 3 to 12; under-3s free; over-65s €11.20 at the ticket office. Same price online and at the gate." },
      { question: "What time does Barcelona Zoo close?", answer: "On 24 October 2026 it closed at 17:30, with the last entry at 17:00. The Zoo publishes each day's hours on its website." },
      { question: "How much is the Barcelona Aquarium?", answer: "€30 for adults, €23 for ages 5 to 10, €15 for ages 3 to 4, €25 for over-65s; under-3s free." },
      { question: "What are the Barcelona Aquarium's opening hours?", answer: "10:00 to 20:00 every day until 1 November 2026; from 2 November, 10:00 to 19:00 on weekdays and 10:00 to 20:00 at weekends. Last entry one hour before closing." },
      { question: "Is there a combined Zoo and Aquarium ticket?", answer: "Not from either venue. Only resellers offer combinations." },
    ],
    note: "Prices and hours change: check the Zoo and Aquarium websites for your date.",
  },
  es: {
    lead: "**El Zoo de Barcelona cuesta 23 €** (niños de 3 a 12 años, 13,90 €) y el 24 de octubre de 2026 abría **de 10:00 a 17:30**, con taquillas y accesos cerrados a las 17:00; solo se entra por la puerta del interior del parque de la Ciutadella. **El Aquarium cuesta 30 €** (de 5 a 10 años, 23 €) y abre **de 10:00 a 20:00 todos los días hasta el 1 de noviembre**; desde el 2 de noviembre cierra a las 19:00 entre semana. Los dos cobran lo mismo en línea y en taquilla, y están a poca distancia en metro.",
    pTitle: "Precio de las entradas del Zoo y del Aquarium",
    pCaption: "Precios de las entradas en 2026",
    pHeaders: ["Entrada", "Zoo", "Aquarium"],
    pRows: [
      ["Adulto", "23 € (13 años o más)", "30 € (11 años o más)"],
      ["Niño", "13,90 € (de 3 a 12)", "23 € (de 5 a 10), 15 € (de 3 a 4)"],
      ["Sénior", "11,20 € (mayores de 65, en taquilla)", "25 € (mayores de 65)"],
      ["Menores de 3", "Gratis", "Gratis"],
      ["Discapacidad", "6 € (33 % o más, en taquilla)", "20 € adulto, 14 € niño (en taquilla)"],
      ["Packs (en línea)", "—", "2 adultos + 2 niños 88 €; 1 + 2, 63 €; 4 adultos, 100 €"],
    ],
    pNote: "De zoobarcelona.cat y aquariumbcn.com, comprobado el 24 de octubre de 2026. No hay entrada combinada oficial Zoo y Aquarium.",
    zooTitle: "Horario del Zoo de Barcelona",
    zoo: [
      "El Zoo publica solo el horario del día. El **24 de octubre de 2026** abría **de 10:00 a 17:30**, y las taquillas y los accesos cerraban a las **17:00**. El horario cambia a lo largo del año: compruébalo en la página de horario del Zoo el mismo día.",
      "**Entrada:** actualmente al Zoo solo se accede por la entrada situada en el interior del parque de la Ciutadella. Algunas instalaciones y espacios no se pueden visitar temporalmente por obras de mejora; el resto del parque sigue abierto.",
      "**Descuentos:** las familias numerosas y monoparentales tienen un 20 % de descuento en taquilla presentando el carné. Las personas con una discapacidad del 33 % o más pagan 6 €, con acompañante gratuito si se cumplen las condiciones del Zoo.",
    ],
    aqTitle: "Horario del Aquarium de Barcelona",
    aq: [
      "El Aquarium abre todos los días; la taquilla y el acceso cierran **una hora antes del cierre**. Tiene el calendario publicado hasta el 31 de enero de 2027:",
    ],
    aqCaption: "Horario de L'Aquàrium, otoño e invierno 2026-27",
    aqHeaders: ["Fechas", "Horario"],
    aqRows: [
      ["Hasta el 1 de noviembre de 2026", "Todos los días 10:00–20:00"],
      ["Del 2 de noviembre al 20 de diciembre", "Lun–vie 10:00–19:00; sáb y dom 10:00–20:00 (7 y 8 de diciembre, 10:00–20:00)"],
      ["Del 21 al 30 de diciembre", "10:00–20:00 (24 de diciembre, 10:00–19:00)"],
      ["31 de diciembre", "10:00–19:00"],
      ["Del 1 al 4 de enero de 2027", "10:00–20:00"],
      ["Del 5 al 31 de enero de 2027", "Lun–vie 10:00–19:00; sáb y dom 10:00–20:00"],
    ],
    aqNote: "Del calendario de aquariumbcn.com, comprobado el 24 de octubre de 2026. Último acceso una hora antes del cierre.",
    getTitle: "Cómo llegar al Zoo y al Aquarium",
    get: [
      "**Zoo:** entrada en el interior del parque de la Ciutadella; metro L4 Barceloneta o L1 Arc de Triomf, Rodalies Arc de Triomf o Estació de França, buses V17, V19, H14 y H16.",
      "**Aquarium:** Moll d'Espanya, en el Port Vell; metro L4 Barceloneta o L3 Drassanes.",
      "**Los dos el mismo día:** la estación de Barceloneta (L4) y los buses H14, V17 y V19 sirven para ambos.",
    ],
    faq: [
      { question: "¿Cuánto cuesta la entrada al Zoo de Barcelona?", answer: "23 € los adultos y 13,90 € los niños de 3 a 12 años; los menores de 3, gratis; los mayores de 65, 11,20 € en taquilla. Mismo precio en línea y en taquilla." },
      { question: "¿A qué hora cierra el Zoo de Barcelona?", answer: "El 24 de octubre de 2026 cerraba a las 17:30, con último acceso a las 17:00. El Zoo publica el horario de cada día en su web." },
      { question: "¿Cuánto cuesta el Aquarium de Barcelona?", answer: "30 € adultos, 23 € de 5 a 10 años, 15 € de 3 a 4 años, 25 € mayores de 65; menores de 3, gratis." },
      { question: "¿Cuál es el horario del Aquarium de Barcelona?", answer: "De 10:00 a 20:00 todos los días hasta el 1 de noviembre de 2026; desde el 2 de noviembre, de 10:00 a 19:00 entre semana y de 10:00 a 20:00 los fines de semana. Último acceso una hora antes del cierre." },
      { question: "¿Hay entrada combinada Zoo y Aquarium?", answer: "No por parte de ninguno de los dos. Solo los revendedores ofrecen combinados." },
    ],
    note: "Precios y horarios cambian: consulta las webs del Zoo y del Aquarium para tu fecha.",
  },
  ca: {
    lead: "**El Zoo de Barcelona costa 23 €** (infants de 3 a 12 anys, 13,90 €) i el 24 d'octubre de 2026 obria **de 10:00 a 17:30**, amb taquilles i accessos tancats a les 17:00; només s'hi entra per la porta de l'interior del parc de la Ciutadella. **L'Aquàrium costa 30 €** (de 5 a 10 anys, 23 €) i obre **de 10:00 a 20:00 cada dia fins a l'1 de novembre**; des del 2 de novembre tanca a les 19:00 entre setmana. Tots dos cobren el mateix en línia i a taquilla, i són a poca distància en metro.",
    pTitle: "Preu de les entrades del Zoo i de l'Aquàrium",
    pCaption: "Preus de les entrades el 2026",
    pHeaders: ["Entrada", "Zoo", "Aquàrium"],
    pRows: [
      ["Adult", "23 € (13 anys o més)", "30 € (11 anys o més)"],
      ["Infant", "13,90 € (de 3 a 12)", "23 € (de 5 a 10), 15 € (de 3 a 4)"],
      ["Sènior", "11,20 € (majors de 65, a taquilla)", "25 € (majors de 65)"],
      ["Menors de 3", "Gratis", "Gratis"],
      ["Discapacitat", "6 € (33 % o més, a taquilla)", "20 € adult, 14 € infant (a taquilla)"],
      ["Paquets (en línia)", "—", "2 adults + 2 infants 88 €; 1 + 2, 63 €; 4 adults, 100 €"],
    ],
    pNote: "De zoobarcelona.cat i aquariumbcn.com, comprovat el 24 d'octubre de 2026. No hi ha entrada combinada oficial Zoo i Aquàrium.",
    zooTitle: "Horari del Zoo de Barcelona",
    zoo: [
      "El Zoo publica només l'horari del dia. El **24 d'octubre de 2026** obria **de 10:00 a 17:30**, i les taquilles i els accessos tancaven a les **17:00**. L'horari canvia al llarg de l'any: comprova'l a la pàgina d'horari del Zoo el mateix dia.",
      "**Entrada:** actualment l'accés al Zoo es fa únicament per l'entrada situada a l'interior del parc de la Ciutadella. Algunes instal·lacions i espais no es poden visitar temporalment per obres de millora; la resta del parc continua obert.",
      "**Descomptes:** les famílies nombroses i monoparentals tenen un 20 % de descompte a taquilla presentant el carnet. Les persones amb una discapacitat del 33 % o més paguen 6 €, amb acompanyant gratuït si es compleixen les condicions del Zoo.",
    ],
    aqTitle: "Horari de l'Aquàrium de Barcelona",
    aq: [
      "L'Aquàrium obre cada dia; la taquilla i l'accés tanquen **una hora abans del tancament**. Té el calendari publicat fins al 31 de gener de 2027:",
    ],
    aqCaption: "Horari de L'Aquàrium, tardor i hivern 2026-27",
    aqHeaders: ["Dates", "Horari"],
    aqRows: [
      ["Fins a l'1 de novembre de 2026", "Cada dia 10:00–20:00"],
      ["Del 2 de novembre al 20 de desembre", "Dl–dv 10:00–19:00; ds i dg 10:00–20:00 (7 i 8 de desembre, 10:00–20:00)"],
      ["Del 21 al 30 de desembre", "10:00–20:00 (24 de desembre, 10:00–19:00)"],
      ["31 de desembre", "10:00–19:00"],
      ["De l'1 al 4 de gener de 2027", "10:00–20:00"],
      ["Del 5 al 31 de gener de 2027", "Dl–dv 10:00–19:00; ds i dg 10:00–20:00"],
    ],
    aqNote: "Del calendari d'aquariumbcn.com, comprovat el 24 d'octubre de 2026. Últim accés una hora abans del tancament.",
    getTitle: "Com arribar al Zoo i a l'Aquàrium",
    get: [
      "**Zoo:** entrada a l'interior del parc de la Ciutadella; metro L4 Barceloneta o L1 Arc de Triomf, Rodalies Arc de Triomf o Estació de França, busos V17, V19, H14 i H16.",
      "**Aquàrium:** Moll d'Espanya, al Port Vell; metro L4 Barceloneta o L3 Drassanes.",
      "**Tots dos el mateix dia:** l'estació de Barceloneta (L4) i els busos H14, V17 i V19 serveixen per a tots dos.",
    ],
    faq: [
      { question: "Quant costa l'entrada al Zoo de Barcelona?", answer: "23 € els adults i 13,90 € els infants de 3 a 12 anys; els menors de 3, gratis; els majors de 65, 11,20 € a taquilla. Mateix preu en línia i a taquilla." },
      { question: "A quina hora tanca el Zoo de Barcelona?", answer: "El 24 d'octubre de 2026 tancava a les 17:30, amb últim accés a les 17:00. El Zoo publica l'horari de cada dia al seu web." },
      { question: "Quant costa l'Aquàrium de Barcelona?", answer: "30 € adults, 23 € de 5 a 10 anys, 15 € de 3 a 4 anys, 25 € majors de 65; menors de 3, gratis." },
      { question: "Quin és l'horari de l'Aquàrium de Barcelona?", answer: "De 10:00 a 20:00 cada dia fins a l'1 de novembre de 2026; des del 2 de novembre, de 10:00 a 19:00 entre setmana i de 10:00 a 20:00 els caps de setmana. Últim accés una hora abans del tancament." },
      { question: "Hi ha entrada combinada Zoo i Aquàrium?", answer: "No per part de cap dels dos. Només els revenedors ofereixen combinats." },
    ],
    note: "Els preus i els horaris canvien: consulta els webs del Zoo i de l'Aquàrium per a la teva data.",
  },
};

function zooBody(locale: Locale) {
  const t = ZOO_COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.pTitle),
    table(t.pCaption, t.pHeaders, t.pRows, t.pNote),
    ...h2(t.zooTitle, ...t.zoo),
    ...h2(t.aqTitle, ...t.aq),
    table(t.aqCaption, t.aqHeaders, t.aqRows, t.aqNote),
    ...h2(t.getTitle),
    list(...t.get),
    faq(t.faq),
    ...b2Related(["museums", "tibidabo", "montjuic"], locale),
  ];
}

export const ZOO_AQUARIUM: B2Article = {
  key: "zooAquarium",
  entryKey: "guide-barcelona-zoo-aquarium",
  categoryKey: "cities",
  sources: ZOO_SOURCES,
  heroKey: "aquarium-tunel",
  heroAlt: {
    ca: "Visitants al túnel de vidre de l'Aquàrium de Barcelona, envoltats de peixos",
    es: "Visitantes en el túnel de cristal del Aquarium de Barcelona, rodeados de peces",
    en: "Visitors in the Barcelona Aquarium's glass tunnel, surrounded by fish",
  },
  heroCaption: {
    ca: "El túnel de l'Aquàrium, al Port Vell.",
    es: "El túnel del Aquarium, en el Port Vell.",
    en: "The Aquarium's tunnel on the Port Vell.",
  },
  secondaryKey: "zoo-entrada-ciutadella",
  secondaryAlt: {
    ca: "L'entrada del Zoo de Barcelona des del parc de la Ciutadella",
    es: "La entrada del Zoo de Barcelona desde el parque de la Ciutadella",
    en: "The entrance to Barcelona Zoo from the Parc de la Ciutadella",
  },
  secondaryCaption: {
    ca: "L'entrada del Zoo, al parc de la Ciutadella.",
    es: "La entrada del Zoo, en el parque de la Ciutadella.",
    en: "The Zoo entrance in the Parc de la Ciutadella.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T01:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...ZOO_META[locale], blocks: zooBody(locale) }]),
  ) as B2Article["editions"],
};

/* ========================================================================== */
/* Food markets                                                               */
/* ========================================================================== */

const MARKETS_SOURCES: B2Source[] = [
  { name: "Mercat de Sant Josep - la Boqueria", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-sant-josep-la-boqueria-92086009447", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat de Santa Caterina", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-santa-caterina-92086009448", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat de Sant Antoni", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-sant-antoni-92086009452", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat de la Concepció", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-la-concepcio-92086009449", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat de la Llibertat", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-la-llibertat-92086009773", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat del Ninot", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-del-ninot-92086009451", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat dominical de Sant Antoni", url: "https://ajuntament.barcelona.cat/mercats/ca/mercats-no-alimentaris/mercat-dominical-de-sant-antoni-96058202955", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Nota sobre la reforma de la Boqueria (27.08.2026)", url: "https://ajuntament.barcelona.cat/mercats/sites/default/files/2026-08/260827_NOTA_reformaBoqueriapropermandat_def.pdf", publisher: "Ajuntament de Barcelona" },
];

const MARKETS_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/mercat-boqueria-mercats-barcelona",
    title: "La Boqueria i els mercats de Barcelona: horaris i normes per visitar-los",
    seoTitle: "La Boqueria i els mercats de Barcelona: horaris i normes",
    seoDescription:
      "La Boqueria obre de dilluns a dissabte de 8:00 a 20:30 i tanca els diumenges. Horaris de Santa Caterina, Sant Antoni i la resta, i la norma dels grups turístics.",
    excerpt: "Quan obren la Boqueria i els altres grans mercats de Barcelona, les normes per als grups de visitants i què canviarà amb la reforma.",
  },
  es: {
    path: "guias/mercado-boqueria-mercados-barcelona",
    title: "La Boqueria y los mercados de Barcelona: horarios y normas para visitarlos",
    seoTitle: "Horario de la Boqueria y de los mercados de Barcelona",
    seoDescription:
      "La Boqueria abre de lunes a sábado de 8:00 a 20:30 y cierra el domingo. Horario de Santa Caterina, Sant Antoni, Concepció, Llibertat y Ninot, y qué abre en domingo.",
    excerpt: "Cuándo abren la Boqueria y los otros grandes mercados de Barcelona, las normas para los grupos de visitantes y qué cambiará con la reforma.",
  },
  en: {
    path: "guides/la-boqueria-barcelona-markets",
    title: "La Boqueria and Barcelona's food markets: opening hours and visiting rules",
    seoTitle: "La Boqueria and Barcelona markets: opening hours and rules",
    seoDescription:
      "La Boqueria opens Monday to Saturday, 8:00 to 20:30, and closes on Sundays. Hours for Santa Caterina, Sant Antoni and the rest, and the tour-group rule.",
    excerpt: "When La Boqueria and Barcelona's other big markets open, the rules for visitor groups, and what the renovation will change.",
  },
};

type MKT = {
  lead: string;
  boqTitle: string; boq: string[];
  rulesTitle: string; rules: string[];
  hTitle: string; hCaption: string; hHeaders: string[]; hRows: string[][]; hNote: string;
  bookTitle: string; book: string;
  tipsTitle: string; tips: string[];
  faq: { question: string; answer: string }[]; note: string;
};

const MARKETS_COPY: Record<Locale, MKT> = {
  en: {
    lead: "**La Boqueria opens Monday to Saturday, 8:00 to 20:30, and is closed on Sundays**, apart from a few Sundays before Christmas that the City Council announces each year; each stall sets its own hours inside that window. Sant Antoni keeps the same hours, while Santa Caterina, La Concepció, La Llibertat and El Ninot close early on some days (table below). These are working markets first: the city runs them for the people who shop there.",
    boqTitle: "La Boqueria",
    boq: [
      "The Mercat de Sant Josep, La Boqueria, opens Monday to Saturday from 8:00 to 20:30; the nearest metro is Liceu (L3). It opens on a few Sundays before Christmas, which the city announces each year.",
      "A renovation is under way: smaller works start after the summer of 2026, the central fish stalls are expected to move temporarily to Plaça de la Gardunya, and the main works on the roof and structure run from 2027 to 2029, with trading continuing where possible.",
    ],
    rulesTitle: "Rules for visitors",
    rules: [
      "**Organised groups of 15 or more visitors cannot enter La Boqueria on Fridays and Saturdays from April to October.** The rule dates from 2017 and the City Council restated it in August 2026, when it announced the market's renovation.",
    ],
    hTitle: "Barcelona market opening hours",
    hCaption: "Opening hours of the city's main markets",
    hHeaders: ["Market", "Opening hours"],
    hRows: [
      ["La Boqueria", "Monday to Saturday 8:00–20:30"],
      ["Santa Caterina", "September to June: Tue, Thu, Fri 7:30–20:30; Mon, Wed, Sat 7:30–14:30. July and August: Fri 7:30–20:30; other days 7:30–14:30"],
      ["Sant Antoni", "Monday to Saturday 8:00–20:30"],
      ["La Concepció", "Mon and Sat 8:00–15:00; Tue to Fri 8:00–20:00"],
      ["La Llibertat", "Mon to Fri 8:00–20:30; Sat 8:00–15:00 (shorter in August)"],
      ["El Ninot", "Mon to Thu 8:00–20:00; Fri and Sat 8:00–17:00"],
    ],
    hNote: "From the City Council's markets institute, checked on 24 October 2026. Market hours are the building's; individual stalls set their own.",
    bookTitle: "Sunday book market at Sant Antoni",
    book: "Around Sant Antoni market, the Sunday book, comics and collectables market runs every Sunday from 8:30 to 14:00, including Sundays that are public holidays.",
    tipsTitle: "Tips",
    tips: [
      "**Check the day:** hours vary by market and by weekday, as the table shows.",
      "**Monday afternoons** are short at Santa Caterina and La Concepció, which close at 14:30 and 15:00.",
      "**Buy something:** these are food markets, and the stallholders' living depends on sales, not footfall.",
    ],
    faq: [
      { question: "Is La Boqueria open on Sundays?", answer: "No. It opens Monday to Saturday from 8:00 to 20:30, plus a few Sundays before Christmas announced each year." },
      { question: "Can tour groups visit La Boqueria?", answer: "Not organised groups of 15 or more on Fridays and Saturdays from April to October." },
      { question: "Which Barcelona markets are open on Sundays?", answer: "None of the big food markets in the table: they all open Monday to Saturday. On Sundays the book, comics and collectables market around Sant Antoni runs from 8:30 to 14:00." },
      { question: "What time does La Boqueria close?", answer: "At 20:30, Monday to Saturday; each stall sets its own hours within that." },
    ],
    note: "Market hours change for holidays and works: check the City Council's markets pages.",
  },
  es: {
    lead: "**La Boqueria abre de lunes a sábado de 8:00 a 20:30 y cierra los domingos**, salvo algunos domingos antes de Navidad que el Ayuntamiento anuncia cada año; cada parada fija su horario dentro de esa franja. Sant Antoni tiene el mismo horario, mientras que Santa Caterina, la Concepció, la Llibertat y el Ninot cierran antes algunos días (tabla más abajo). Son ante todo mercados de barrio: el Ayuntamiento los gestiona para quien compra en ellos.",
    boqTitle: "La Boqueria",
    boq: [
      "El Mercat de Sant Josep, la Boqueria, abre de lunes a sábado de 8:00 a 20:30; el metro más cercano es Liceu (L3). Abre algunos domingos antes de Navidad, que el Ayuntamiento anuncia cada año.",
      "Hay una reforma en marcha: las obras menores empiezan después del verano de 2026, está previsto que las paradas centrales de pescado se trasladen temporalmente a la plaza de la Gardunya, y las obras grandes de cubierta y estructura van de 2027 a 2029, manteniendo la actividad donde sea posible.",
    ],
    rulesTitle: "Normas para los visitantes",
    rules: [
      "**Los grupos organizados de 15 visitantes o más no pueden entrar en la Boqueria los viernes y sábados de abril a octubre.** La norma es de 2017 y el Ayuntamiento la recordó en agosto de 2026, al anunciar la reforma del mercado.",
    ],
    hTitle: "Horario de los mercados de Barcelona",
    hCaption: "Horario de los principales mercados de la ciudad",
    hHeaders: ["Mercado", "Horario"],
    hRows: [
      ["La Boqueria", "De lunes a sábado 8:00–20:30"],
      ["Santa Caterina", "De septiembre a junio: mar, jue, vie 7:30–20:30; lun, mié, sáb 7:30–14:30. Julio y agosto: vie 7:30–20:30; resto de días 7:30–14:30"],
      ["Sant Antoni", "De lunes a sábado 8:00–20:30"],
      ["La Concepció", "Lun y sáb 8:00–15:00; de mar a vie 8:00–20:00"],
      ["La Llibertat", "De lun a vie 8:00–20:30; sáb 8:00–15:00 (más corto en agosto)"],
      ["El Ninot", "De lun a jue 8:00–20:00; vie y sáb 8:00–17:00"],
    ],
    hNote: "Del Instituto Municipal de Mercados, comprobado el 24 de octubre de 2026. El horario es el del edificio; cada parada fija el suyo.",
    bookTitle: "Mercado dominical de Sant Antoni",
    book: "Alrededor del mercado de Sant Antoni, el mercado dominical de libros, cómics y coleccionismo se hace todos los domingos de 8:30 a 14:00, también los domingos festivos.",
    tipsTitle: "Consejos",
    tips: [
      "**Mira el día:** el horario cambia según el mercado y el día de la semana, como muestra la tabla.",
      "**Los lunes por la tarde** Santa Caterina y la Concepció cierran pronto, a las 14:30 y a las 15:00.",
      "**Compra algo:** son mercados de alimentación y los paradistas viven de las ventas, no de las visitas.",
    ],
    faq: [
      { question: "¿La Boqueria abre los domingos?", answer: "No. Abre de lunes a sábado de 8:00 a 20:30, más algunos domingos antes de Navidad que se anuncian cada año." },
      { question: "¿Pueden visitar la Boqueria los grupos turísticos?", answer: "No los grupos organizados de 15 personas o más, los viernes y sábados de abril a octubre." },
      { question: "¿Qué mercados de Barcelona abren el domingo?", answer: "Ninguno de los grandes mercados de alimentación de la tabla: todos abren de lunes a sábado. El domingo, alrededor de Sant Antoni, se hace el mercado de libros, cómics y coleccionismo, de 8:30 a 14:00." },
      { question: "¿A qué hora cierra la Boqueria?", answer: "A las 20:30, de lunes a sábado; cada parada fija su horario dentro de ese." },
    ],
    note: "Los horarios de los mercados cambian por fiestas y obras: consulta las páginas de mercados del Ayuntamiento.",
  },
  ca: {
    lead: "**La Boqueria obre de dilluns a dissabte de 8:00 a 20:30 i tanca els diumenges**, tret d'alguns diumenges abans de Nadal que l'Ajuntament anuncia cada any; cada parada fixa el seu horari dins d'aquesta franja. Sant Antoni té el mateix horari, mentre que Santa Caterina, la Concepció, la Llibertat i el Ninot tanquen abans alguns dies (taula més avall). Són abans de res mercats de barri: l'Ajuntament els gestiona per a qui hi compra.",
    boqTitle: "La Boqueria",
    boq: [
      "El Mercat de Sant Josep, la Boqueria, obre de dilluns a dissabte de 8:00 a 20:30; el metro més proper és Liceu (L3). Obre alguns diumenges abans de Nadal, que l'Ajuntament anuncia cada any.",
      "Hi ha una reforma en marxa: les obres menors comencen després de l'estiu del 2026, està previst que les parades centrals de peix es traslladin temporalment a la plaça de la Gardunya, i les obres grans de coberta i estructura van del 2027 al 2029, mantenint l'activitat on sigui possible.",
    ],
    rulesTitle: "Normes per als visitants",
    rules: [
      "**Els grups organitzats de 15 visitants o més no poden entrar a la Boqueria els divendres i dissabtes d'abril a octubre.** La norma és del 2017 i l'Ajuntament la va recordar l'agost de 2026, quan va anunciar la reforma del mercat.",
    ],
    hTitle: "Horari dels mercats de Barcelona",
    hCaption: "Horari dels principals mercats de la ciutat",
    hHeaders: ["Mercat", "Horari"],
    hRows: [
      ["La Boqueria", "De dilluns a dissabte 8:00–20:30"],
      ["Santa Caterina", "De setembre a juny: dt, dj, dv 7:30–20:30; dl, dc, ds 7:30–14:30. Juliol i agost: dv 7:30–20:30; resta de dies 7:30–14:30"],
      ["Sant Antoni", "De dilluns a dissabte 8:00–20:30"],
      ["La Concepció", "Dl i ds 8:00–15:00; de dt a dv 8:00–20:00"],
      ["La Llibertat", "De dl a dv 8:00–20:30; ds 8:00–15:00 (més curt a l'agost)"],
      ["El Ninot", "De dl a dj 8:00–20:00; dv i ds 8:00–17:00"],
    ],
    hNote: "De l'Institut Municipal de Mercats, comprovat el 24 d'octubre de 2026. L'horari és el de l'edifici; cada parada fixa el seu.",
    bookTitle: "Mercat dominical de Sant Antoni",
    book: "Al voltant del mercat de Sant Antoni, el mercat dominical de llibres, còmics i col·leccionisme es fa cada diumenge de 8:30 a 14:00, també els diumenges festius.",
    tipsTitle: "Consells",
    tips: [
      "**Mira el dia:** l'horari canvia segons el mercat i el dia de la setmana, com mostra la taula.",
      "**Els dilluns a la tarda** Santa Caterina i la Concepció tanquen d'hora, a les 14:30 i a les 15:00.",
      "**Compra alguna cosa:** són mercats d'alimentació i els paradistes viuen de les vendes, no de les visites.",
    ],
    faq: [
      { question: "La Boqueria obre els diumenges?", answer: "No. Obre de dilluns a dissabte de 8:00 a 20:30, més alguns diumenges abans de Nadal que s'anuncien cada any." },
      { question: "Poden visitar la Boqueria els grups turístics?", answer: "No els grups organitzats de 15 persones o més, els divendres i dissabtes d'abril a octubre." },
      { question: "Quins mercats de Barcelona obren el diumenge?", answer: "Cap dels grans mercats d'alimentació de la taula: tots obren de dilluns a dissabte. El diumenge, al voltant de Sant Antoni, es fa el mercat de llibres, còmics i col·leccionisme, de 8:30 a 14:00." },
      { question: "A quina hora tanca la Boqueria?", answer: "A les 20:30, de dilluns a dissabte; cada parada fixa el seu horari dins d'aquest." },
    ],
    note: "Els horaris dels mercats canvien per festes i obres: consulta les pàgines de mercats de l'Ajuntament.",
  },
};

function marketsBody(locale: Locale) {
  const t = MARKETS_COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.hTitle),
    table(t.hCaption, t.hHeaders, t.hRows, t.hNote),
    ...h2(t.boqTitle, ...t.boq),
    ...h2(t.rulesTitle, ...t.rules),
    ...h2(t.bookTitle, t.book),
    ...h2(t.tipsTitle),
    list(...t.tips),
    faq(t.faq),
    ...b2Related(["museums", "monuments", "hours"], locale),
  ];
}

export const MARKETS: B2Article = {
  key: "markets",
  entryKey: "guide-boqueria-barcelona-markets",
  categoryKey: "food",
  sources: MARKETS_SOURCES,
  heroKey: "mercats-santa-caterina-coberta",
  heroAlt: {
    ca: "La coberta ondulada de colors del mercat de Santa Caterina",
    es: "La cubierta ondulada de colores del mercado de Santa Caterina",
    en: "The colourful wave-shaped roof of Santa Caterina market",
  },
  heroCaption: {
    ca: "La coberta del mercat de Santa Caterina.",
    es: "La cubierta del mercado de Santa Caterina.",
    en: "The roof of Santa Caterina market.",
  },
  secondaryKey: "mercats-boqueria-rotol",
  secondaryAlt: {
    ca: "El rètol modernista de l'entrada del Mercat de Sant Josep, la Boqueria",
    es: "El rótulo modernista de la entrada del Mercat de Sant Josep, la Boqueria",
    en: "The Modernista sign over the entrance to the Mercat de Sant Josep, La Boqueria",
  },
  secondaryCaption: {
    ca: "L'entrada de la Boqueria, a la Rambla.",
    es: "La entrada de la Boqueria, en La Rambla.",
    en: "The entrance to La Boqueria on La Rambla.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T01:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...MARKETS_META[locale], blocks: marketsBody(locale) }]),
  ) as B2Article["editions"],
};

export { ZOO_META, MARKETS_META };
