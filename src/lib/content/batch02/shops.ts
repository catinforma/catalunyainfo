import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
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
 * Shops open on Sundays and holidays in Catalonia: the yearly calendar.
 *
 * Dates are the DOGC's own (Ordre EMT/77/2025 for 2026, Resolució
 * EMT/4342/2025 for the 2026 municipal days, Ordre EMT/89/2026 for 2027) and
 * the rule is Llei 18/2017, checked on 18 Oct 2026
 * (research_notes/blog-batch-03/shops_open_holidays.md).
 *
 * The 2027 municipal days are not published yet (councils had until 1 Nov
 * 2026; the DOGC list came out on 27 Nov last year): the page says so and
 * gives the default that applies when a council chooses none. Not printed:
 * any "official" sales dates (no current recommendation was found), and any
 * claim about which small shops may open on 25 Dec or 1 Jan.
 */

const VERIFIED = "2026-10-18";

const SOURCES: B2Source[] = [
  { name: "Ordre EMT/77/2025, calendari d'obertura comercial en diumenges i festius per al 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1015009&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Resolució EMT/4342/2025, dies festius d'obertura comercial dels municipis per al 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1030324&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Ordre EMT/89/2026, calendari d'obertura comercial en diumenges i festius per al 2027", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1045357&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Horaris comercials", url: "https://ajuntament.barcelona.cat/comerc/ca/el-comerc-barcelona/horaris-comercials", publisher: "Ajuntament de Barcelona" },
  { name: "Rebaixes", url: "https://consum.gencat.cat/ca/els-meus-drets/rebaixes/", publisher: "Agència Catalana del Consum" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/botigues-obertes-festius-catalunya",
    title: "Botigues obertes en diumenges i festius a Catalunya: calendari 2026 i 2027",
    seoTitle: "Botigues obertes en festius a Catalunya: dies 2026 i 2027",
    seoDescription:
      "Quins diumenges i festius poden obrir les botigues a Catalunya: els dies de desembre del 2026, el calendari del 2027 del DOGC i què passa a Barcelona.",
    excerpt:
      "Els diumenges i festius en què les botigues poden obrir a Catalunya, segons el DOGC: el que queda del 2026, el calendari del 2027 i les normes.",
  },
  es: {
    path: "guias/tiendas-abiertas-festivos-cataluna",
    title: "Tiendas abiertas en domingos y festivos en Cataluña: calendario 2026 y 2027",
    seoTitle: "Tiendas abiertas en festivos en Cataluña: días 2026 y 2027",
    seoDescription:
      "Qué domingos y festivos pueden abrir las tiendas en Cataluña: los días de diciembre de 2026, el calendario de 2027 del DOGC y qué pasa en Barcelona.",
    excerpt:
      "Los domingos y festivos en que las tiendas pueden abrir en Cataluña, según el DOGC: lo que queda de 2026, el calendario de 2027 y las normas.",
  },
  en: {
    path: "guides/shops-open-sundays-holidays-catalonia",
    title: "Shops open on Sundays and holidays in Catalonia: 2026 and 2027 dates",
    seoTitle: "Shops open on Sundays in Catalonia and Barcelona: 2026-27",
    seoDescription:
      "Which Sundays and public holidays shops may open in Catalonia and Barcelona: the December 2026 dates, the official 2027 calendar and the rules.",
    excerpt:
      "The Sundays and holidays when shops may open in Catalonia, from the official gazette: what is left of 2026, the 2027 calendar and the rules.",
  },
};

type Row = [Record<Locale, string>, Record<Locale, string>];

const D = (ca: string, es: string, en: string) => ({ ca, es, en });

/** Barcelona and every municipality without its own list (Resolució EMT/4342/2025). */
const DAYS_2026_LEFT: Row[] = [
  [D("Diumenge 29 de novembre", "Domingo 29 de noviembre", "Sunday 29 November"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 6 de desembre", "Domingo 6 de diciembre", "Sunday 6 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Dimarts 8 de desembre", "Martes 8 de diciembre", "Tuesday 8 December"), D("Dia municipal per defecte", "Día municipal por defecto", "Default municipal day")],
  [D("Diumenge 13 de desembre", "Domingo 13 de diciembre", "Sunday 13 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 20 de desembre", "Domingo 20 de diciembre", "Sunday 20 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 27 de desembre", "Domingo 27 de diciembre", "Sunday 27 December"), D("Calendari general", "Calendario general", "General calendar")],
];

/** Ordre EMT/89/2026, article 1, and the article 5 default municipal days. */
const DAYS_2027: Row[] = [
  [D("Diumenge 3 de gener", "Domingo 3 de enero", "Sunday 3 January"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 10 de gener", "Domingo 10 de enero", "Sunday 10 January"), D("Dia municipal per defecte", "Día municipal por defecto", "Default municipal day")],
  [D("Diumenge 27 de juny", "Domingo 27 de junio", "Sunday 27 June"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Dilluns 1 de novembre", "Lunes 1 de noviembre", "Monday 1 November"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 28 de novembre", "Domingo 28 de noviembre", "Sunday 28 November"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 5 de desembre", "Domingo 5 de diciembre", "Sunday 5 December"), D("Dia municipal per defecte", "Día municipal por defecto", "Default municipal day")],
  [D("Dilluns 6 de desembre", "Lunes 6 de diciembre", "Monday 6 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Dimecres 8 de desembre", "Miércoles 8 de diciembre", "Wednesday 8 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 12 de desembre", "Domingo 12 de diciembre", "Sunday 12 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 19 de desembre", "Domingo 19 de diciembre", "Sunday 19 December"), D("Calendari general", "Calendario general", "General calendar")],
];

type T = {
  lead: string;
  note: string;
  leftTitle: string;
  leftCaption: string;
  leftHeaders: string[];
  leftNote: string;
  townsTitle: string;
  towns: string[];
  nextTitle: string;
  nextCaption: string;
  nextHeaders: string[];
  nextNote: string;
  next: string[];
  rulesTitle: string;
  rules: string[];
  calendar: string;
  bcnTitle: string;
  bcn: string[];
  salesTitle: string;
  sales: string[];
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: "A Catalunya les botigues poden obrir **deu diumenges o festius l'any**: vuit els fixa la Generalitat per a tot el país i dos més els tria cada ajuntament. Aquí tens els dies que queden del 2026, el calendari del 2027 que ja ha publicat el DOGC i què canvia a Barcelona.",
    note: "Obrir aquests dies és una opció, no una obligació: cada botiga decideix si obre. Els dos dies municipals canvien d'un poble a un altre.",
    leftTitle: "Els dies que queden del 2026",
    leftCaption: "Diumenges i festius amb obertura comercial, novembre i desembre del 2026",
    leftHeaders: ["Dia", "Per què"],
    leftNote: "Vàlid a Barcelona i a tots els municipis que no tenen llista pròpia (Resolució EMT/4342/2025). El calendari del 2026 acaba el 27 de desembre.",
    townsTitle: "Els municipis amb dies diferents",
    towns: [
      "**Terrassa** no obre el 6 de desembre, i en canvi va obrir el 28 de juny.",
      "**Manresa** no obre el 8 de desembre (va obrir el 17 de maig).",
      "**Olot** no obre el 13 de desembre i va afegir el 7 de setembre i el 18 d'octubre.",
      "**Badalona** no obre el 8 de desembre (va obrir el 10 de maig).",
      "**Sant Cugat** va canviar l'11 de gener pel 5 de juliol; al desembre obre els mateixos dies que Barcelona.",
      "Girona, Tarragona, Lleida, Reus, Sabadell, Granollers i Figueres segueixen la llista general. Per a qualsevol altre municipi, consulta la resolució del DOGC.",
    ],
    nextTitle: "Calendari del 2027",
    nextCaption: "Diumenges i festius amb obertura comercial el 2027",
    nextHeaders: ["Dia", "Per què"],
    nextNote: "Ordre EMT/89/2026 (DOGC 28.5.2026). Els dies municipals per defecte s'apliquen on l'ajuntament no n'hagi triat d'altres.",
    next: [
      "Els vuit dies generals del 2027 ja són oficials. Els dos de cada municipi, encara no: els ajuntaments els havien de comunicar abans de l'1 de novembre del 2026, i l'any passat la llista es va publicar al DOGC el 27 de novembre. Si un ajuntament no en tria cap, s'apliquen el 10 de gener i el 5 de desembre.",
    ],
    rulesTitle: "Les normes",
    rules: [
      "**Dies sempre tancats:** l'1 i el 6 de gener, el diumenge i el dilluns de Pasqua, l'1 de maig, el 24 de juny, l'11 de setembre i el 25 i el 26 de desembre.",
      "**Horari:** d'octubre a maig, cap botiga sotmesa a l'horari general pot obrir entre les 21.00 i les 6.00; de juny a setembre, entre les 22.00 i les 7.00. El màxim és de 75 hores setmanals.",
      "**Excepcions:** alguns establiments tenen horari lliure (per exemple, farmàcies, botigues de menys de 300 m² d'alimentació o de proximitat, i les de recintes turístics). L'Ajuntament de Barcelona en publica la llista completa.",
    ],
    calendar: "Per als festius en què no es treballa, consulta el [calendari laboral](/ca/guies/calendari-laboral-catalunya/) i els [festius locals de cada municipi](/ca/guies/festius-locals-catalunya/).",
    bcnTitle: "A Barcelona",
    bcn: [
      "Barcelona fa servir els mateixos deu dies que la llista general per al 2026, i encara no ha publicat els del 2027.",
      "A més, a la **zona de gran afluència turística** (bona part de Ciutat Vella, l'Eixample i altres barris), les botigues poden obrir els diumenges i festius **del 15 de maig al 15 de setembre, de 12 a 20 hores**. Aquesta excepció no s'aplica a l'hivern.",
    ],
    salesTitle: "I les rebaixes?",
    sales: [
      "Les rebaixes d'hivern comencen tradicionalment l'endemà de Reis, el 7 de gener, però no hi ha una data obligatòria: cada botiga fixa les seves i ha d'anunciar l'inici i el final. El preu de referència ha de ser el més baix dels trenta dies anteriors, segons l'Agència Catalana del Consum.",
    ],
    faq: [
      { question: "Quins diumenges obren les botigues el desembre del 2026?", answer: "A Barcelona i a la majoria de municipis, els diumenges 6, 13, 20 i 27 de desembre, i també el dimarts 8 de desembre. Alguns municipis, com Terrassa, Manresa, Olot o Badalona, en canvien algun." },
      { question: "Obren les botigues el dia de Nadal o Sant Esteve?", answer: "No: el 25 i el 26 de desembre són dies de tancament obligatori per a les botigues amb horari general, igual que l'1 i el 6 de gener." },
      { question: "Quins festius obren les botigues el 2027?", answer: "Els dies generals són el 3 de gener, el 27 de juny, l'1 i el 28 de novembre i el 6, el 8, el 12 i el 19 de desembre. Cada municipi n'hi afegeix dos; si no en tria cap, el 10 de gener i el 5 de desembre." },
      { question: "Quan comencen les rebaixes de gener?", answer: "Tradicionalment el 7 de gener, però no és una data obligatòria: cada botiga decideix i ha d'indicar l'inici i el final." },
    ],
  },
  es: {
    lead: "En Cataluña las tiendas pueden abrir **diez domingos o festivos al año**: ocho los fija la Generalitat para todo el país y dos más los elige cada ayuntamiento. Aquí tienes los días que quedan de 2026, el calendario de 2027 que ya ha publicado el DOGC y qué cambia en Barcelona.",
    note: "Abrir esos días es una opción, no una obligación: cada tienda decide si abre. Los dos días municipales cambian de un pueblo a otro.",
    leftTitle: "Los días que quedan de 2026",
    leftCaption: "Domingos y festivos con apertura comercial, noviembre y diciembre de 2026",
    leftHeaders: ["Día", "Por qué"],
    leftNote: "Válido en Barcelona y en todos los municipios sin lista propia (Resolución EMT/4342/2025). El calendario de 2026 termina el 27 de diciembre.",
    townsTitle: "Los municipios con días distintos",
    towns: [
      "**Terrassa** no abre el 6 de diciembre y, en cambio, abrió el 28 de junio.",
      "**Manresa** no abre el 8 de diciembre (abrió el 17 de mayo).",
      "**Olot** no abre el 13 de diciembre y añadió el 7 de septiembre y el 18 de octubre.",
      "**Badalona** no abre el 8 de diciembre (abrió el 10 de mayo).",
      "**Sant Cugat** cambió el 11 de enero por el 5 de julio; en diciembre abre los mismos días que Barcelona.",
      "Girona, Tarragona, Lleida, Reus, Sabadell, Granollers y Figueres siguen la lista general. Para cualquier otro municipio, consulta la resolución del DOGC.",
    ],
    nextTitle: "Calendario de 2027",
    nextCaption: "Domingos y festivos con apertura comercial en 2027",
    nextHeaders: ["Día", "Por qué"],
    nextNote: "Orden EMT/89/2026 (DOGC 28.5.2026). Los días municipales por defecto se aplican donde el ayuntamiento no haya elegido otros.",
    next: [
      "Los ocho días generales de 2027 ya son oficiales. Los dos de cada municipio, todavía no: los ayuntamientos debían comunicarlos antes del 1 de noviembre de 2026, y el año pasado la lista se publicó en el DOGC el 27 de noviembre. Si un ayuntamiento no elige ninguno, se aplican el 10 de enero y el 5 de diciembre.",
    ],
    rulesTitle: "Las normas",
    rules: [
      "**Días siempre cerrados:** el 1 y el 6 de enero, el domingo y el lunes de Pascua, el 1 de mayo, el 24 de junio, el 11 de septiembre y el 25 y el 26 de diciembre.",
      "**Horario:** de octubre a mayo, ninguna tienda sujeta al horario general puede abrir entre las 21.00 y las 6.00; de junio a septiembre, entre las 22.00 y las 7.00. El máximo es de 75 horas semanales.",
      "**Excepciones:** algunos establecimientos tienen horario libre (por ejemplo, farmacias, tiendas de menos de 300 m² de alimentación o de proximidad, y las de recintos turísticos). El Ayuntamiento de Barcelona publica la lista completa.",
    ],
    calendar: "Para los festivos en que no se trabaja, consulta el [calendario laboral](/es/guias/calendario-laboral-cataluna/) y los [festivos locales de cada municipio](/es/guias/festivos-locales-cataluna/).",
    bcnTitle: "En Barcelona",
    bcn: [
      "Barcelona usa los mismos diez días que la lista general en 2026, y aún no ha publicado los de 2027.",
      "Además, en la **zona de gran afluencia turística** (buena parte de Ciutat Vella, el Eixample y otros barrios), las tiendas pueden abrir los domingos y festivos **del 15 de mayo al 15 de septiembre, de 12 a 20 horas**. Esta excepción no se aplica en invierno.",
    ],
    salesTitle: "¿Y las rebajas?",
    sales: [
      "Las rebajas de invierno empiezan tradicionalmente el día después de Reyes, el 7 de enero, pero no hay una fecha obligatoria: cada tienda fija las suyas y debe anunciar el inicio y el final. El precio de referencia debe ser el más bajo de los treinta días anteriores, según la Agència Catalana del Consum.",
    ],
    faq: [
      { question: "¿Qué domingos abren las tiendas en diciembre de 2026 en Cataluña?", answer: "En Barcelona y en la mayoría de municipios, los domingos 6, 13, 20 y 27 de diciembre, y también el martes 8 de diciembre. Algunos municipios, como Terrassa, Manresa, Olot o Badalona, cambian alguno." },
      { question: "¿Abren las tiendas el día de Navidad o San Esteban?", answer: "No: el 25 y el 26 de diciembre son días de cierre obligatorio para las tiendas con horario general, igual que el 1 y el 6 de enero." },
      { question: "¿Qué festivos abren las tiendas en 2027?", answer: "Los días generales son el 3 de enero, el 27 de junio, el 1 y el 28 de noviembre y el 6, el 8, el 12 y el 19 de diciembre. Cada municipio añade dos; si no elige ninguno, el 10 de enero y el 5 de diciembre." },
      { question: "¿Cuándo empiezan las rebajas de enero?", answer: "Tradicionalmente el 7 de enero, pero no es una fecha obligatoria: cada tienda decide y debe indicar el inicio y el final." },
    ],
  },
  en: {
    lead: "Shops in Catalonia may open on **ten Sundays or public holidays a year**: eight set by the Generalitat for the whole region and two chosen by each town council. Here are the dates left in 2026, the 2027 calendar already published in the official gazette (DOGC), and what is different in Barcelona.",
    note: "Opening on these days is optional: each shop decides. The two municipal days vary from town to town.",
    leftTitle: "The dates left in 2026",
    leftCaption: "Sundays and holidays when shops may open, November and December 2026",
    leftHeaders: ["Date", "Why"],
    leftNote: "Applies in Barcelona and every municipality without its own list (Resolució EMT/4342/2025). The 2026 calendar ends on 27 December.",
    townsTitle: "Towns with different dates",
    towns: [
      "**Terrassa** does not open on 6 December; it opened on 28 June instead.",
      "**Manresa** does not open on 8 December (it opened on 17 May).",
      "**Olot** does not open on 13 December and added 7 September and 18 October.",
      "**Badalona** does not open on 8 December (it opened on 10 May).",
      "**Sant Cugat** swapped 11 January for 5 July; in December it opens on the same days as Barcelona.",
      "Girona, Tarragona, Lleida, Reus, Sabadell, Granollers and Figueres follow the general list. For any other town, check the DOGC resolution.",
    ],
    nextTitle: "The 2027 calendar",
    nextCaption: "Sundays and holidays when shops may open in 2027",
    nextHeaders: ["Date", "Why"],
    nextNote: "Ordre EMT/89/2026 (DOGC 28 May 2026). The default municipal days apply where the council has chosen none.",
    next: [
      "The eight general days for 2027 are official. Each town's two extra days are not out yet: councils had to report them before 1 November 2026, and last year the list appeared in the DOGC on 27 November. A council that chooses none gets 10 January and 5 December.",
    ],
    rulesTitle: "The rules",
    rules: [
      "**Always closed:** 1 and 6 January, Easter Sunday and Monday, 1 May, 24 June, 11 September, and 25 and 26 December.",
      "**Hours:** from October to May no shop on the general timetable may open between 21:00 and 6:00; from June to September, between 22:00 and 7:00. The maximum is 75 hours a week.",
      "**Exceptions:** some shops have free opening hours (for example pharmacies, food and convenience shops under 300 m², and shops inside tourist venues). Barcelona City Council publishes the full list.",
    ],
    calendar: "For the days off work, see the [Catalonia public holidays calendar](/en/guides/catalonia-public-holidays/) and the [local holidays in each town](/en/guides/local-holidays-catalonia/).",
    bcnTitle: "In Barcelona",
    bcn: [
      "Barcelona uses the same ten days as the general list in 2026 and has not yet published its 2027 days.",
      "On top of that, in the **high tourist footfall zone** (much of Ciutat Vella, the Eixample and other districts), shops may open on Sundays and holidays **from 15 May to 15 September, 12:00 to 20:00**. That exception does not apply in winter.",
    ],
    salesTitle: "What about the sales?",
    sales: [
      "The winter sales traditionally start the day after Epiphany, 7 January, but there is no compulsory date: each shop sets its own and must announce when they start and end. The reference price must be the lowest of the previous thirty days, according to the Catalan Consumer Agency.",
    ],
    faq: [
      { question: "Are shops open on Sundays in Barcelona in December 2026?", answer: "Yes, on Sundays 6, 13, 20 and 27 December, and on Tuesday 8 December, in Barcelona and most towns. A few towns, such as Terrassa, Manresa, Olot or Badalona, change one of them." },
      { question: "Are shops open on Christmas Day or 26 December in Catalonia?", answer: "No: 25 and 26 December are compulsory closing days for shops on the general timetable, as are 1 and 6 January." },
      { question: "Which holidays can shops open in 2027?", answer: "The general days are 3 January, 27 June, 1 and 28 November, and 6, 8, 12 and 19 December. Each town adds two; if it chooses none, 10 January and 5 December." },
      { question: "When do the January sales start?", answer: "Traditionally on 7 January, but it is not a fixed date: each shop decides and must state when its sale starts and ends." },
    ],
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.leftTitle),
    table(t.leftCaption, t.leftHeaders, DAYS_2026_LEFT.map(([day, why]) => [day[locale], why[locale]]), t.leftNote),
    ...h2(t.townsTitle),
    list(...t.towns),
    ...h2(t.nextTitle, ...t.next),
    table(t.nextCaption, t.nextHeaders, DAYS_2027.map(([day, why]) => [day[locale], why[locale]]), t.nextNote),
    ...h2(t.rulesTitle),
    list(...t.rules),
    ...paras(t.calendar),
    ...h2(t.bcnTitle, ...t.bcn),
    ...h2(t.salesTitle, ...t.sales),
    faq(t.faq),
    ...b2Related(["barcelonaHub", "markets", "hours"], locale),
  ];
}

export const SHOPS: B2Article = {
  key: "shops",
  entryKey: "guide-shops-open-holidays-catalonia",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "botigues-llums-nadal-barcelona",
  heroAlt: {
    ca: "Llums de Nadal blaves i blanques sobre un carrer comercial de Barcelona, de nit",
    es: "Luces de Navidad azules y blancas sobre una calle comercial de Barcelona, de noche",
    en: "Blue and white Christmas lights over a shopping street in Barcelona at night",
  },
  heroCaption: {
    ca: "Llums de Nadal en un carrer comercial de Barcelona.",
    es: "Luces de Navidad en una calle comercial de Barcelona.",
    en: "Christmas lights on a Barcelona shopping street.",
  },
  secondaryKey: "botigues-carrer-llums-nadal",
  secondaryAlt: {
    ca: "Carrer de Barcelona amb llums de Nadal en forma d'arbre i gent passejant",
    es: "Calle de Barcelona con luces de Navidad en forma de árbol y gente paseando",
    en: "A Barcelona street with tree-shaped Christmas lights and people walking",
  },
  secondaryCaption: {
    ca: "Llums de Nadal a Barcelona.",
    es: "Luces de Navidad en Barcelona.",
    en: "Christmas lights in Barcelona.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-19T12:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as SHOPS_META };
