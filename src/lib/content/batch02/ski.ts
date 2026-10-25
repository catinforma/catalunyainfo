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
 * Ski resorts in Catalonia, season 2026-2027: the comparison table.
 *
 * Re-checked on 24 Oct 2026 against each operator's own pages (Baqueira's
 * new site, PIRINEU365 for the six FGC resorts, Masella, Port del Comte,
 * Tavascan, Guils for Tot Nòrdic). What changed since 12 Oct:
 *
 * - Baqueira's old "28 Nov 2026 → 4 Apr 2027" sentence is gone with its old
 *   site; the new FAQ only says the season starts on the last weekend of
 *   November and ends after Easter. No date is printed as announced.
 * - Day prices are now published and labelled for 2026-27 by Baqueira
 *   ("Tarifas y edades temporada 26-27"), Masella and the FGC resorts whose
 *   rate pages carry 2026-27 calendar dates. Boí Taüll's page carries no
 *   season marker, so its price is printed with that caveat.
 * - Port del Comte's 2026-27 adult season pass is 595 €, not the 695 € this
 *   page used to say. Its day-pass page shows two different tables (44 € on
 *   mobile, 45.50 € on desktop), so both are printed.
 * - Tot Nòrdic's early-purchase discount now runs to 17 November (was 15).
 *
 * Transport pages on PIRINEU365 still show the 2025-26 bus dates, so the
 * "how to get there" column names the services and the text says which
 * season their published dates belong to.
 */

const VERIFIED = "2026-10-24";

const SOURCES: B2Source[] = [
  { name: "Baqueira Beret — tarifas temporada 26-27", url: "https://www.baqueira.es/es/tarifas", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret — datos técnicos", url: "https://www.baqueira.es/es/datos-tecnicos", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret — preguntas frecuentes", url: "https://www.baqueira.es/es/faqs", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret — cómo llegar", url: "https://www.baqueira.es/es/como-llegar", publisher: "Baqueira Beret" },
  { name: "La Molina — tarifes", url: "https://pirineu365.cat/lamolina/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "La Molina — plànol de pistes i fitxa tècnica", url: "https://pirineu365.cat/lamolina/estacio/planol-pistes-fitxa-tecnica/", publisher: "FGC (PIRINEU365)" },
  { name: "La Molina — informació pràctica i transport", url: "https://pirineu365.cat/lamolina/estacio/informacio-tecnica/", publisher: "FGC (PIRINEU365)" },
  { name: "Alp2500", url: "https://pirineu365.cat/lamolina/estacio/alp2500/", publisher: "FGC (PIRINEU365)" },
  { name: "Vallter — tarifes", url: "https://pirineu365.cat/vallter/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "Espot Esquí — tarifes", url: "https://pirineu365.cat/espotesqui/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "Espot Esquí — informació pràctica", url: "https://pirineu365.cat/espotesqui/estacio/informacio-practica/", publisher: "FGC (PIRINEU365)" },
  { name: "Port Ainé — tarifes", url: "https://pirineu365.cat/portaine/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "Port Ainé — informació pràctica", url: "https://pirineu365.cat/portaine/estacio/informacio-practica/", publisher: "FGC (PIRINEU365)" },
  { name: "Boí Taüll — tarifes", url: "https://pirineu365.cat/boitaull/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "Boí Taüll — informació pràctica", url: "https://pirineu365.cat/boitaull/estacio/informacio-practica/", publisher: "FGC (PIRINEU365)" },
  { name: "Vall de Núria — plànol de pistes", url: "https://pirineu365.cat/valldenuria/estacio/planol-de-pistes/", publisher: "FGC (PIRINEU365)" },
  { name: "PIRINEU365 avança la temporada amb l'obertura de La Molina (26/11/2025)", url: "https://pirineu365.cat/noticia/pirineu365-avanca-la-temporada-amb-lobertura-de-la-molina-aquest-cap-de-setmana/", publisher: "FGC (PIRINEU365)" },
  { name: "PIRINEU365 inicia la temporada d'hivern amb les sis estacions obertes (03/12/2025)", url: "https://pirineu365.cat/noticia/pirineu365-inicia-la-temporada-dhivern-amb-les-sis-estacions-obertes-i-mes-60-km-esquiables/", publisher: "FGC (PIRINEU365)" },
  { name: "Masella — fitxa tècnica", url: "https://www.masella.com/ca/paginas/fitxa-tecnica", publisher: "Masella" },
  { name: "Masella — forfets", url: "https://www.masella.com/ca/paginas/forfets_masella", publisher: "Masella" },
  { name: "Masella — abonaments de temporada", url: "https://www.masella.com/ca/paginas/abonaments_masella", publisher: "Masella" },
  { name: "Port del Comte — tarifes generals", url: "https://portdelcomte.net/tarifes-generals/", publisher: "Port del Comte" },
  { name: "Port del Comte — forfets de temporada 26-27", url: "https://portdelcomte.net/forfets-temporada/", publisher: "Port del Comte" },
  { name: "Tavascan — estació de muntanya", url: "https://www.tavascan365.com/estacio-de-muntanya-de-tavascan/", publisher: "Tavascan" },
  { name: "Guils Fontanera — forfets (Tot Nòrdic 2026-2027)", url: "https://www.guils.com/forfets/", publisher: "Guils Fontanera" },
  { name: "Bus Blanc — horaris 2025-2026", url: "https://cerdanya.org/wp-content/uploads/2026/02/Bus-Blanc-2026.pdf", publisher: "Turisme Cerdanya" },
  { name: "TEISA — Girona-Olot-Camprodon-Vallter 2000", url: "https://www.teisa-bus.com/pdf/pdf_comarques_pdf143.pdf", publisher: "TEISA" },
  { name: "R3: modificació del servei", url: "https://rodalies.gencat.cat/ca/detalls/article/02_02_PAT_R3", publisher: "Rodalies de Catalunya" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/estacions-esqui-catalunya",
    title: "Estacions d'esquí de Catalunya 2026-2027: pistes, preus del forfet i com arribar-hi",
    seoTitle: "Estacions d'esquí de Catalunya 2026-27: forfets i pistes",
    seoDescription:
      "Esquiar a Catalunya el 2026-27: les deu estacions comparades amb km de pistes, forfet de dia, forfet de temporada, obertura i com arribar-hi en tren o bus.",
    excerpt:
      "Baqueira, la Molina, Masella, Boí Taüll i la resta en una taula: quilòmetres, forfet de dia 2026-27, obertura i com arribar-hi sense cotxe.",
  },
  es: {
    path: "guias/estaciones-esqui-cataluna",
    title: "Estaciones de esquí de Cataluña 2026-2027: pistas, precios del forfait y cómo llegar",
    seoTitle: "Estaciones de esquí de Cataluña 2026-27: forfaits y pistas",
    seoDescription:
      "Esquiar en Cataluña en 2026-27: las diez estaciones comparadas con km de pistas, forfait de día y de temporada, apertura y cómo llegar en tren o bus.",
    excerpt:
      "Baqueira, La Molina, Masella, Boí Taüll y el resto en una tabla: kilómetros, forfait de día 2026-27, apertura y cómo llegar sin coche.",
  },
  en: {
    path: "guides/ski-resorts-catalonia",
    title: "Ski resorts in Catalonia 2026-2027: runs, lift pass prices and how to get there",
    seoTitle: "Ski resorts in Catalonia 2026-27: lift passes and runs",
    seoDescription:
      "Skiing in Catalonia in 2026-27: all ten resorts compared by kilometres, day and season pass prices, opening and how to get there by train or bus.",
    excerpt:
      "Baqueira, La Molina, Masella, Boí Taüll and the rest in one table: kilometres, 2026-27 day pass, opening and car-free access.",
  },
};

/* -------------------------------------------------------------------------- */
/* The comparison table                                                       */
/* -------------------------------------------------------------------------- */

type Row = { name: string; area: string; km: string; alt: string; day: Record<Locale, string>; access: Record<Locale, string> };

const RESORTS: Row[] = [
  {
    name: "Baqueira Beret",
    area: "Val d'Aran",
    km: "169",
    alt: "1.500–2.610",
    day: { ca: "74 € (70 € amb BaqueiraPASS)", es: "74 € (70 € con BaqueiraPASS)", en: "€74 (€70 with BaqueiraPASS)" },
    access: {
      ca: "Bus d'ALSA fins a Vielha i línia local VA",
      es: "Bus de ALSA hasta Vielha y línea local VA",
      en: "ALSA coach to Vielha, then local bus VA",
    },
  },
  {
    name: "Masella",
    area: "Cerdanya",
    km: "74",
    alt: "1.600–2.535",
    day: { ca: "53 € en línia (56 € a taquilla)", es: "53 € online (56 € en taquilla)", en: "€53 online (€56 at the desk)" },
    access: {
      ca: "Ski Bus La Molina + Masella (Sagalés); Bus Blanc des de la Cerdanya",
      es: "Ski Bus La Molina + Masella (Sagalés); Bus Blanc desde la Cerdanya",
      en: "Ski Bus La Molina + Masella (Sagalés); Bus Blanc within Cerdanya",
    },
  },
  {
    name: "La Molina",
    area: "Cerdanya",
    km: "71",
    alt: "1.667–2.537",
    day: { ca: "49 € en línia (+3 € a taquilla)", es: "49 € online (+3 € en taquilla)", en: "€49 online (+€3 at the desk)" },
    access: {
      ca: "Tren R3 fins a l'estació de la Molina i bus intern; Ski Tren; Ski Bus",
      es: "Tren R3 hasta la estación de La Molina y bus interno; Ski Tren; Ski Bus",
      en: "R3 train to La Molina station plus shuttle; Ski Tren; Ski Bus",
    },
  },
  {
    name: "Boí Taüll",
    area: "Alta Ribagorça",
    km: "45",
    alt: "2.040–2.751",
    day: { ca: "49 € (el web no indica la temporada)", es: "49 € (la web no indica la temporada)", en: "€49 (no season stated on the page)" },
    access: {
      ca: "Bus de la Neu des de Vilaller (1 €), caps de setmana i festius",
      es: "Bus de la Neu desde Vilaller (1 €), fines de semana y festivos",
      en: "Bus de la Neu from Vilaller (€1), weekends and holidays",
    },
  },
  {
    name: "Port Ainé",
    area: "Pallars Sobirà",
    km: "26,7",
    alt: "1.650–2.440",
    day: { ca: "42 € baixa / 46 € alta", es: "42 € baja / 46 € alta", en: "€42 low / €46 high season" },
    access: {
      ca: "ALSA Ski Bus des de Lleida i Balaguer; Taxi de la Neu des de Sort",
      es: "ALSA Ski Bus desde Lleida y Balaguer; Taxi de la Neu desde Sort",
      en: "ALSA Ski Bus from Lleida and Balaguer; Taxi de la Neu from Sort",
    },
  },
  {
    name: "Espot",
    area: "Pallars Sobirà",
    km: "25",
    alt: "1.500–2.500",
    day: { ca: "39 €", es: "39 €", en: "€39" },
    access: {
      ca: "ALSA Ski Bus des de Lleida, Balaguer, Tremp i la Pobla; enllaç Sort–Espot",
      es: "ALSA Ski Bus desde Lleida, Balaguer, Tremp y La Pobla; enlace Sort–Espot",
      en: "ALSA Ski Bus from Lleida, Balaguer, Tremp and La Pobla; Sort–Espot link",
    },
  },
  {
    name: "Vallter",
    area: "Ripollès",
    km: "14,15",
    alt: "2.000–2.535",
    day: { ca: "30 € baixa / 36,50 € alta", es: "30 € baja / 36,50 € alta", en: "€30 low / €36.50 high season" },
    access: {
      ca: "Bus d'esquí de TEISA des de Girona, Olot i Camprodon (gener-març)",
      es: "Bus de esquí de TEISA desde Girona, Olot y Camprodon (enero-marzo)",
      en: "TEISA ski bus from Girona, Olot and Camprodon (January–March)",
    },
  },
  {
    name: "Vall de Núria",
    area: "Ripollès",
    km: "7,7",
    alt: "1.964–2.252",
    day: { ca: "Consulta-ho (el web barreja temporades)", es: "Consúltalo (la web mezcla temporadas)", en: "Check (the page mixes seasons)" },
    access: {
      ca: "R3 fins a Ribes-Enllaç i Cremallera; no hi ha carretera",
      es: "R3 hasta Ribes-Enllaç y Cremallera; no hay carretera",
      en: "R3 to Ribes-Enllaç, then the rack railway; no road",
    },
  },
  {
    name: "Port del Comte",
    area: "Solsonès",
    km: "—",
    alt: "—",
    day: { ca: "44–45,50 € alta / 38–39 € baixa", es: "44–45,50 € alta / 38–39 € baja", en: "€44–45.50 high / €38–39 low" },
    access: { ca: "Sense servei verificat", es: "Sin servicio verificado", en: "No verified service" },
  },
  {
    name: "Tavascan",
    area: "Pallars Sobirà",
    km: "5",
    alt: "—",
    day: { ca: "Pistes alpines tancades el 2025-26", es: "Pistas alpinas cerradas en 2025-26", en: "Alpine runs closed in 2025-26" },
    access: { ca: "Sense servei verificat", es: "Sin servicio verificado", en: "No verified service" },
  },
];

function num(locale: Locale, value: string): string {
  if (locale !== "en") return value;
  // 1.500–2.610 → 1,500–2,610 and 26,7 → 26.7
  return value.includes(".") ? value.replace(/\./g, ",") : value.replace(",", ".");
}

function resortRows(locale: Locale): string[][] {
  return RESORTS.map((r) => [r.name, r.area, num(locale, r.km), num(locale, r.alt), r.day[locale], r.access[locale]]);
}

const SEASON_PASS: Record<Locale, string[][]> = {
  ca: [
    ["Baqueira Beret", "1.300 € fins a l'1 de novembre; 1.400 € després"],
    ["Alp2500 (la Molina + Masella)", "950 € fins al 8 de desembre de 2026; 1.090 € després"],
    ["Masella", "730 € fins al 22 de novembre de 2026; 840 € després"],
    ["La Molina", "690 €"],
    ["Boí Taüll", "660 € (el web no indica la temporada)"],
    ["Port del Comte", "595 € (a la venda des de l'1 de novembre)"],
    ["Pallars (Espot + Port Ainé)", "545 €"],
    ["Ripollès (Vallter + Vall de Núria)", "495 €"],
    ["Tot Nòrdic (esquí de fons + raquetes)", "175 €"],
  ],
  es: [
    ["Baqueira Beret", "1.300 € hasta el 1 de noviembre; 1.400 € después"],
    ["Alp2500 (La Molina + Masella)", "950 € hasta el 8 de diciembre de 2026; 1.090 € después"],
    ["Masella", "730 € hasta el 22 de noviembre de 2026; 840 € después"],
    ["La Molina", "690 €"],
    ["Boí Taüll", "660 € (la web no indica la temporada)"],
    ["Port del Comte", "595 € (a la venta desde el 1 de noviembre)"],
    ["Pallars (Espot + Port Ainé)", "545 €"],
    ["Ripollès (Vallter + Vall de Núria)", "495 €"],
    ["Tot Nòrdic (esquí de fondo + raquetas)", "175 €"],
  ],
  en: [
    ["Baqueira Beret", "€1,300 until 1 November; €1,400 after"],
    ["Alp2500 (La Molina + Masella)", "€950 until 8 December 2026; €1,090 after"],
    ["Masella", "€730 until 22 November 2026; €840 after"],
    ["La Molina", "€690"],
    ["Boí Taüll", "€660 (no season stated on the page)"],
    ["Port del Comte", "€595 (on sale from 1 November)"],
    ["Pallars (Espot + Port Ainé)", "€545"],
    ["Ripollès (Vallter + Vall de Núria)", "€495"],
    ["Tot Nòrdic (cross-country + snowshoes)", "€175"],
  ],
};

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

type T = {
  lead: string;
  tableTitle: string;
  tableCaption: string;
  headers: string[];
  tableNote: string;
  openTitle: string;
  open: string[];
  passTitle: string;
  passCaption: string;
  passHeaders: string[];
  passNote: string;
  pricesTitle: string;
  prices: string[];
  getTitle: string;
  get: string[];
  trainNote: string;
  smallTitle: string;
  small: string[];
  nordicTitle: string;
  nordic: string[];
  snowTitle: string;
  snow: string[];
  pickTitle: string;
  pick: string[];
  faq: { question: string; answer: string }[];
  verifiedNote: string;
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: "Per esquiar a Catalunya hi ha deu estacions d'esquí alpí. La més gran és **Baqueira Beret** (169 km); en tren des de Barcelona s'arriba a **la Molina** i a la **Vall de Núria**. A 24 d'octubre de 2026 cap estació ha fixat el dia d'obertura de la temporada 2026-2027, però gairebé totes ja han publicat els preus: el forfet de dia d'adult va dels **30 € de Vallter** (temporada baixa) als **74 € de Baqueira**.",
    tableTitle: "Comparativa de les estacions d'esquí de Catalunya 2026-2027",
    tableCaption: "Estacions d'esquí alpí de Catalunya: pistes, forfet de dia d'adult i accés sense cotxe",
    headers: ["Estació", "Comarca", "Km", "Altitud (m)", "Forfet d'1 dia, adult", "Sense cotxe"],
    tableNote: "Quilòmetres i altituds de la fitxa tècnica de cada estació. Preus de les pàgines de tarifes, consultades el 24/10/2026: Baqueira els etiqueta «temporada 26-27» i la resta ja hi inclou dates de 2026-27, excepte Boí Taüll. Port del Comte mostra dues taules amb imports diferents.",
    openTitle: "Quan obren les pistes el 2026-2027",
    open: [
      "**Cap estació catalana ha anunciat encara la data d'obertura** (consultat el 24 d'octubre de 2026). L'obertura depèn de la neu i del fred per fabricar-ne.",
      "Les pistes de referència: **Baqueira Beret** diu a les seves preguntes freqüents que la temporada «s'inicia l'últim cap de setmana de novembre i acaba en acabar Setmana Santa», sempre segons la meteorologia. **Port Ainé** compta com a dies de temporada a les seves tarifes de l'**1 de desembre de 2026 al 4 d'abril de 2027**.",
      "La temporada passada, la **Molina** va obrir el **29 de novembre de 2025** i les altres cinc estacions d'FGC, el **4 de desembre de 2025**.",
    ],
    passTitle: "Forfet de temporada 2026-2027",
    passCaption: "Forfet de temporada d'adult, temporada 2026-2027",
    passHeaders: ["Estació o domini", "Preu adult"],
    passNote: "Preus publicats a les webs oficials, consultats el 24/10/2026. Les edats d'«adult» canvien segons l'estació (a les d'FGC, de 25 a 64 anys).",
    pricesTitle: "Preus del forfet: el que cal saber abans de comprar",
    prices: [
      "**Compra en línia.** A la Molina, Vallter, Espot i Boí Taüll comprar a la taquilla costa **3 € més** (a Port Ainé, **5 € més**); a Masella, també 3 € més. Baqueira ven el forfet de dia amb la targeta recarregable BaqueiraTICKET, i amb el BaqueiraPASS el dia d'adult baixa de 74 a 70 €.",
      "**Temporada alta i baixa.** A Vallter i Port Ainé el preu de dia canvia segons el calendari: a Port Ainé, la temporada alta 2026-27 és del 26 al 30 de desembre, el 2 i 3 de gener i els caps de setmana de febrer.",
      "**Abonaments que comparteixen estacions.** El forfet Alp2500 val per a la Molina i Masella (145 km junts); el Temporada Pallars, per a Espot i Port Ainé; el Temporada Ripollès, per a Vallter i la Vall de Núria.",
    ],
    getTitle: "Com arribar a les pistes en tren o en bus",
    get: [
      "**La Molina:** té estació pròpia a la línia **R3**. El **Ski Tren**, que es compra a Renfe/Rodalies, combina tren d'anada i tornada, bus intern i forfet. També hi ha **Ski Bus** de Sagalés (només la Molina o la Molina + Masella).",
      `**Vall de Núria:** R3 fins a Ribes-Enllaç i el **Cremallera**; no hi arriba cap carretera. Detalls a ${b2link("nuria", "ca", "la guia de Núria")}.`,
      "**Espot i Port Ainé:** l'**ALSA Ski Bus** (bus d'anada i tornada + forfet) des de Lleida i Balaguer, i el Taxi de la Neu des de Sort. La temporada 2025-26 va circular els dissabtes, diumenges i festius del 6 de desembre al 5 d'abril.",
      "**Masella:** el Ski Bus La Molina + Masella de Sagalés i, dins la Cerdanya, el **Bus Blanc** del Consell Comarcal. La temporada 2025-26 va circular els caps de setmana i festius escolars des del 6 de desembre, a 2 €; el calendari 2026-27 encara no s'ha publicat.",
      "**Boí Taüll:** el **Bus de la Neu**, a 1 €, els caps de setmana i festius des de Vilaller, amb parades al Pont de Suert i als pobles de la vall.",
      "**Vallter:** TEISA publica un bus d'esquí Girona–Banyoles–Olot–Camprodon–Setcases–Vallter els dissabtes, diumenges i festius de gener a març; el full penjat encara porta les tarifes de 2023-24.",
      "**Baqueira Beret:** busos d'ALSA fins a Vielha i, des d'allà, el bus local línia VA fins a l'estació.",
    ],
    trainNote: `Mentre durin les obres de l'R3, no hi ha trens entre Barcelona i la Garriga: el tram es fa amb autobús i l'R3 circula entre la Garriga i Puigcerdà amb la meitat de trens. Els horaris dels trens que pugen a la Molina són a la guia de ${b2link("cerdanya", "ca", "la Cerdanya sense cotxe")}.`,
    smallTitle: "Port del Comte i Tavascan",
    small: [
      "**Port del Comte**, al Solsonès, ja ven el forfet de temporada 2026-27 (595 € adult). Al seu web la temporada alta inclou tots els caps de setmana, el 7 i 8 de desembre, del 21 de desembre al 28 de febrer de 2027 i del 22 al 29 de març de 2027.",
      "**Tavascan** no va obrir les pistes alpines ni el telecadira la temporada 2025-26 i, a 24 d'octubre de 2026, el seu web no diu què farà aquest hivern. El circuit nòrdic (12,6 km) forma part del Tot Nòrdic.",
    ],
    nordicTitle: "Esquí nòrdic i raquetes",
    nordic: [
      "Les set estacions de la Mancomunitat d'Esquí Nòrdic (Guils Fontanera, Aransa, Lles, Tuixent-La Vansa, Sant Joan de l'Erm, Tavascan i Virós-Vallferrera) comparteixen el forfet **Tot Nòrdic**: **175 €** per a adults la temporada 2026-27 (esquí + raquetes) i **75 €** el de només raquetes. Guils indica un descompte del 25 % fins al 17 de novembre.",
      `Si no esquies, mira ${b2link("snow", "ca", "on veure neu sense esquiar i les rutes amb raquetes")}.`,
    ],
    snowTitle: "On mirar l'estat de la neu",
    snow: [
      "Cada estació publica cada dia les pistes obertes, el gruix de neu i els remuntadors en marxa: Baqueira a la secció «Estado de la estación» del seu web, les d'FGC a «Infoneu» de pirineu365.cat, Masella i Port del Comte al seu web. Mira-ho el mateix matí: a principi i final de temporada canvia d'un dia per l'altre.",
      `Per saber si hi ha neu a terra a l'alta muntanya, fora de les pistes, mira ${b2link("snowNow", "ca", "el gruix de neu d'avui a les estacions meteorològiques del Meteocat")}.`,
    ],
    pickTitle: "Quina estació triar",
    pick: [
      "**Més quilòmetres:** Baqueira Beret (169 km) o el domini Alp2500, la Molina i Masella junts (145 km).",
      "**Sense cotxe des de Barcelona:** la Molina (R3 o Ski Bus) o la Vall de Núria (R3 i Cremallera).",
      "**Forfet de dia més barat:** Vallter (30 € en temporada baixa) i Espot (39 €).",
      "**Aprendre o anar amb nens petits:** la Vall de Núria i Vallter són petites i fàcils de controlar.",
    ],
    faq: [
      { question: "Quan obren les estacions d'esquí de Catalunya la temporada 2026-2027?", answer: "A 24 d'octubre de 2026 cap estació ha anunciat la data. Baqueira diu que la temporada comença l'últim cap de setmana de novembre; la temporada passada la Molina va obrir el 29 de novembre de 2025 i les altres estacions d'FGC, el 4 de desembre." },
      { question: "Quant costa el forfet de dia a Catalunya el 2026-27?", answer: "Per a un adult, de 30 € (Vallter en temporada baixa) a 74 € (Baqueira Beret). La Molina, 49 € en línia; Masella, 53 € en línia; Espot, 39 €; Port Ainé, de 42 a 46 €." },
      { question: "Quina és l'estació d'esquí més gran de Catalunya?", answer: "Baqueira Beret, amb 169 km de pistes balisades. El domini Alp2500 (la Molina + Masella) en suma 145." },
      { question: "Es pot anar a esquiar en tren des de Barcelona?", answer: "Sí: a la Molina, que té estació a l'R3, i a la Vall de Núria amb l'R3 i el Cremallera. Durant les obres de l'R3 el tram Barcelona–la Garriga es fa amb autobús." },
    ],
    verifiedNote: "Les dates i els preus d'esquí canvien cada temporada: comprova'ls al web de l'estació abans de comprar.",
  },
  es: {
    lead: "Para esquiar en Cataluña hay diez estaciones de esquí alpino. La más grande es **Baqueira Beret** (169 km); en tren desde Barcelona se llega a **La Molina** y a la **Vall de Núria**. A 24 de octubre de 2026 ninguna estación ha fijado el día de apertura de la temporada 2026-2027, pero casi todas han publicado ya sus precios: el forfait de día de adulto va de los **30 € de Vallter** (temporada baja) a los **74 € de Baqueira**.",
    tableTitle: "Comparativa de las estaciones de esquí de Cataluña 2026-2027",
    tableCaption: "Estaciones de esquí alpino de Cataluña: pistas, forfait de día de adulto y acceso sin coche",
    headers: ["Estación", "Comarca", "Km", "Altitud (m)", "Forfait 1 día, adulto", "Sin coche"],
    tableNote: "Kilómetros y altitudes de la ficha técnica de cada estación. Precios de las páginas de tarifas, consultadas el 24/10/2026: Baqueira los etiqueta «temporada 26-27» y el resto ya incluye fechas de 2026-27, salvo Boí Taüll. Port del Comte muestra dos tablas con importes distintos.",
    openTitle: "Cuándo abren las pistas en 2026-2027",
    open: [
      "**Ninguna estación catalana ha anunciado todavía la fecha de apertura** (consultado el 24 de octubre de 2026). La apertura depende de la nieve y del frío para fabricarla.",
      "Las referencias: **Baqueira Beret** dice en sus preguntas frecuentes que la temporada «inicia el último fin de semana de noviembre y finaliza al acabar Semana Santa», siempre sujeta a la meteorología. **Port Ainé** cuenta como días de temporada en sus tarifas del **1 de diciembre de 2026 al 4 de abril de 2027**.",
      "La temporada pasada, **La Molina** abrió el **29 de noviembre de 2025** y las otras cinco estaciones de FGC, el **4 de diciembre de 2025**.",
    ],
    passTitle: "Forfait de temporada 2026-2027",
    passCaption: "Forfait de temporada de adulto, temporada 2026-2027",
    passHeaders: ["Estación o dominio", "Precio adulto"],
    passNote: "Precios publicados en las webs oficiales, consultados el 24/10/2026. La edad de «adulto» cambia según la estación (en las de FGC, de 25 a 64 años).",
    pricesTitle: "Precios del forfait: lo que hay que saber antes de comprar",
    prices: [
      "**Compra online.** En La Molina, Vallter, Espot y Boí Taüll comprar en taquilla cuesta **3 € más** (en Port Ainé, **5 € más**); en Masella, también 3 € más. Baqueira vende el forfait de día con la tarjeta recargable BaqueiraTICKET, y con el BaqueiraPASS el día de adulto baja de 74 a 70 €.",
      "**Temporada alta y baja.** En Vallter y Port Ainé el precio de día cambia según el calendario: en Port Ainé, la temporada alta 2026-27 es del 26 al 30 de diciembre, el 2 y 3 de enero y los fines de semana de febrero.",
      "**Abonos que comparten estaciones.** El forfait Alp2500 vale para La Molina y Masella (145 km juntas); el Temporada Pallars, para Espot y Port Ainé; el Temporada Ripollès, para Vallter y la Vall de Núria.",
    ],
    getTitle: "Cómo llegar a las pistas en tren o en bus",
    get: [
      "**La Molina:** tiene estación propia en la línea **R3**. El **Ski Tren**, que se compra en Renfe/Rodalies, combina tren de ida y vuelta, bus interno y forfait. También hay **Ski Bus** de Sagalés (solo La Molina o La Molina + Masella).",
      `**Vall de Núria:** R3 hasta Ribes-Enllaç y el **Cremallera**; no llega ninguna carretera. Detalles en ${b2link("nuria", "es", "la guía de Núria")}.`,
      "**Espot y Port Ainé:** el **ALSA Ski Bus** (bus de ida y vuelta + forfait) desde Lleida y Balaguer, y el Taxi de la Neu desde Sort. En la temporada 2025-26 circuló sábados, domingos y festivos del 6 de diciembre al 5 de abril.",
      "**Masella:** el Ski Bus La Molina + Masella de Sagalés y, dentro de la Cerdanya, el **Bus Blanc** del Consell Comarcal. En la temporada 2025-26 circuló los fines de semana y festivos escolares desde el 6 de diciembre, a 2 €; el calendario 2026-27 aún no se ha publicado.",
      "**Boí Taüll:** el **Bus de la Neu**, a 1 €, los fines de semana y festivos desde Vilaller, con paradas en El Pont de Suert y los pueblos del valle.",
      "**Vallter:** TEISA publica un bus de esquí Girona–Banyoles–Olot–Camprodon–Setcases–Vallter los sábados, domingos y festivos de enero a marzo; la hoja colgada aún lleva las tarifas de 2023-24.",
      "**Baqueira Beret:** autobuses de ALSA hasta Vielha y, desde allí, el bus local línea VA hasta la estación.",
    ],
    trainNote: `Mientras duren las obras de la R3 no hay trenes entre Barcelona y La Garriga: el tramo se hace en autobús y la R3 circula entre La Garriga y Puigcerdà con la mitad de trenes. Los horarios de los trenes que suben a La Molina están en la guía de ${b2link("cerdanya", "es", "la Cerdanya sin coche")}.`,
    smallTitle: "Port del Comte y Tavascan",
    small: [
      "**Port del Comte**, en el Solsonès, ya vende el forfait de temporada 2026-27 (595 € adulto). En su web la temporada alta incluye todos los fines de semana, el 7 y 8 de diciembre, del 21 de diciembre al 28 de febrero de 2027 y del 22 al 29 de marzo de 2027.",
      "**Tavascan** no abrió las pistas alpinas ni el telesilla en la temporada 2025-26 y, a 24 de octubre de 2026, su web no dice qué hará este invierno. El circuito nórdico (12,6 km) forma parte del Tot Nòrdic.",
    ],
    nordicTitle: "Esquí nórdico y raquetas",
    nordic: [
      "Las siete estaciones de la Mancomunitat d'Esquí Nòrdic (Guils Fontanera, Aransa, Lles, Tuixent-La Vansa, Sant Joan de l'Erm, Tavascan y Virós-Vallferrera) comparten el forfait **Tot Nòrdic**: **175 €** para adultos en la temporada 2026-27 (esquí + raquetas) y **75 €** el de solo raquetas. Guils indica un descuento del 25 % hasta el 17 de noviembre.",
      `Si no esquías, mira ${b2link("snow", "es", "dónde ver nieve sin esquiar y las rutas con raquetas")}.`,
    ],
    snowTitle: "Dónde mirar el estado de la nieve",
    snow: [
      "Cada estación publica a diario las pistas abiertas, el espesor de nieve y los remontes en marcha: Baqueira en la sección «Estado de la estación» de su web, las de FGC en «Infoneu» de pirineu365.cat, Masella y Port del Comte en su web. Míralo la misma mañana: a principio y final de temporada cambia de un día para otro.",
      `Para saber si hay nieve en el suelo en la alta montaña, fuera de las pistas, mira ${b2link("snowNow", "es", "el espesor de nieve de hoy en las estaciones meteorológicas de Meteocat")}.`,
    ],
    pickTitle: "Qué estación elegir",
    pick: [
      "**Más kilómetros:** Baqueira Beret (169 km) o el dominio Alp2500, La Molina y Masella juntas (145 km).",
      "**Sin coche desde Barcelona:** La Molina (R3 o Ski Bus) o la Vall de Núria (R3 y Cremallera).",
      "**Forfait de día más barato:** Vallter (30 € en temporada baja) y Espot (39 €).",
      "**Aprender o ir con niños pequeños:** la Vall de Núria y Vallter son pequeñas y fáciles de controlar.",
    ],
    faq: [
      { question: "¿Cuándo abren las estaciones de esquí de Cataluña en la temporada 2026-2027?", answer: "A 24 de octubre de 2026 ninguna estación ha anunciado la fecha. Baqueira dice que la temporada empieza el último fin de semana de noviembre; la temporada pasada La Molina abrió el 29 de noviembre de 2025 y las demás estaciones de FGC, el 4 de diciembre." },
      { question: "¿Cuánto cuesta el forfait de día en Cataluña en 2026-27?", answer: "Para un adulto, de 30 € (Vallter en temporada baja) a 74 € (Baqueira Beret). La Molina, 49 € online; Masella, 53 € online; Espot, 39 €; Port Ainé, de 42 a 46 €." },
      { question: "¿Cuál es la estación de esquí más grande de Cataluña?", answer: "Baqueira Beret, con 169 km de pistas balizadas. El dominio Alp2500 (La Molina + Masella) suma 145." },
      { question: "¿Se puede ir a esquiar en tren desde Barcelona?", answer: "Sí: a La Molina, que tiene estación en la R3, y a la Vall de Núria con la R3 y el Cremallera. Durante las obras de la R3 el tramo Barcelona–La Garriga se hace en autobús." },
    ],
    verifiedNote: "Las fechas y los precios de esquí cambian cada temporada: compruébalos en la web de la estación antes de comprar.",
  },
  en: {
    lead: "Catalonia has ten alpine ski resorts. The biggest is **Baqueira Beret** (169 km); by train from Barcelona you can reach **La Molina** and **Vall de Núria**. As of 24 October 2026 no resort has set an opening day for the 2026-2027 season, but nearly all have published their prices: an adult day pass runs from **€30 at Vallter** (low season) to **€74 at Baqueira**.",
    tableTitle: "Catalonia's ski resorts compared, 2026-2027",
    tableCaption: "Alpine ski resorts in Catalonia: runs, adult day pass and car-free access",
    headers: ["Resort", "Area", "Km", "Altitude (m)", "Adult 1-day pass", "Without a car"],
    tableNote: "Kilometres and altitudes from each resort's technical sheet. Prices from the rates pages, checked 24/10/2026: Baqueira labels them 'temporada 26-27' and the others already carry 2026-27 dates, except Boí Taüll. Port del Comte shows two tables with different amounts.",
    openTitle: "When the slopes open in 2026-2027",
    open: [
      "**No Catalan resort has announced its opening date yet** (checked 24 October 2026). Opening depends on snowfall and on nights cold enough to make snow.",
      "The markers: **Baqueira Beret** says in its FAQ that the season 'starts on the last weekend of November and ends after Easter', always weather permitting. **Port Ainé** counts season days in its rates from **1 December 2026 to 4 April 2027**.",
      "Last season, **La Molina** opened on **29 November 2025** and the other five FGC resorts on **4 December 2025**.",
    ],
    passTitle: "Season passes for 2026-2027",
    passCaption: "Adult season pass, 2026-2027 season",
    passHeaders: ["Resort or area", "Adult price"],
    passNote: "Prices published on the official websites, checked 24/10/2026. 'Adult' age bands differ by resort (25 to 64 at the FGC resorts).",
    pricesTitle: "Lift pass prices: what to know before you buy",
    prices: [
      "**Buy online.** At La Molina, Vallter, Espot and Boí Taüll the ticket office charges **€3 more** (**€5 more** at Port Ainé); Masella also adds €3. Baqueira sells day passes on its reloadable BaqueiraTICKET card, and with a BaqueiraPASS the adult day drops from €74 to €70.",
      "**High and low season.** At Vallter and Port Ainé the day price follows a calendar: at Port Ainé, 2026-27 high season is 26–30 December, 2–3 January and the February weekends.",
      "**Passes that cover several resorts.** Alp2500 is valid at La Molina and Masella (145 km together); Temporada Pallars at Espot and Port Ainé; Temporada Ripollès at Vallter and Vall de Núria.",
    ],
    getTitle: "Getting to the slopes by train or bus",
    get: [
      "**La Molina:** it has its own station on the **R3** line. The **Ski Tren**, sold by Renfe/Rodalies, bundles a return train, the resort shuttle and a lift pass. Sagalés also runs a **Ski Bus** (La Molina only, or La Molina + Masella).",
      `**Vall de Núria:** the R3 to Ribes-Enllaç, then the **rack railway**; no road reaches it. Details in ${b2link("nuria", "en", "our Núria guide")}.`,
      "**Espot and Port Ainé:** the **ALSA Ski Bus** (return coach + lift pass) from Lleida and Balaguer, and the 'Taxi de la Neu' from Sort. In 2025-26 it ran on Saturdays, Sundays and holidays from 6 December to 5 April.",
      "**Masella:** the Sagalés Ski Bus La Molina + Masella and, within Cerdanya, the county council's **Bus Blanc**. In 2025-26 it ran at weekends and during school holidays from 6 December, for €2; the 2026-27 calendar has not been published yet.",
      "**Boí Taüll:** the **Bus de la Neu**, €1, on weekends and holidays from Vilaller, stopping at El Pont de Suert and the valley villages.",
      "**Vallter:** TEISA publishes a ski bus Girona–Banyoles–Olot–Camprodon–Setcases–Vallter on Saturdays, Sundays and holidays from January to March; the sheet online still shows 2023-24 fares.",
      "**Baqueira Beret:** ALSA coaches to Vielha, then local bus line VA to the resort.",
    ],
    trainNote: `While the R3 works last, no trains run between Barcelona and La Garriga: that stretch is by bus, and R3 trains run between La Garriga and Puigcerdà at half the usual frequency. Train times up to La Molina are in our ${b2link("cerdanya", "en", "Cerdanya without a car")} guide.`,
    smallTitle: "Port del Comte and Tavascan",
    small: [
      "**Port del Comte**, in the Solsonès, is already selling its 2026-27 season pass (€595 adult). Its high season covers every weekend, 7–8 December, 21 December to 28 February 2027 and 22–29 March 2027.",
      "**Tavascan** did not open its alpine runs or chairlift in 2025-26 and, as of 24 October 2026, its website does not say what it will do this winter. Its 12.6 km cross-country circuit is part of Tot Nòrdic.",
    ],
    nordicTitle: "Cross-country skiing and snowshoes",
    nordic: [
      "The seven stations of the Mancomunitat d'Esquí Nòrdic (Guils Fontanera, Aransa, Lles, Tuixent-La Vansa, Sant Joan de l'Erm, Tavascan and Virós-Vallferrera) share the **Tot Nòrdic** pass: **€175** for adults in 2026-27 (skiing + snowshoes) and **€75** for snowshoes only. Guils lists a 25% discount until 17 November.",
      `Not a skier? See ${b2link("snow", "en", "where to see snow without skiing, with snowshoe routes")}.`,
    ],
    snowTitle: "Where to check the snow",
    snow: [
      "Each resort posts open runs, snow depth and running lifts daily: Baqueira in the 'Estado de la estación' section of its website, the FGC resorts under 'Infoneu' on pirineu365.cat, Masella and Port del Comte on their websites. Check on the morning itself: at the start and end of the season it changes from one day to the next.",
      `To see whether there is snow on the ground in the high mountains away from the pistes, see ${b2link("snowNow", "en", "today's snow depth at Meteocat's weather stations")}.`,
    ],
    pickTitle: "Which resort to choose",
    pick: [
      "**The most kilometres:** Baqueira Beret (169 km), or the Alp2500 area, La Molina and Masella together (145 km).",
      "**No car, from Barcelona:** La Molina (R3 or Ski Bus) or Vall de Núria (R3 and rack railway).",
      "**Cheapest day pass:** Vallter (€30 in low season) and Espot (€39).",
      "**Learning, or with small children:** Vall de Núria and Vallter are small and easy to keep track of.",
    ],
    faq: [
      { question: "When do Catalonia's ski resorts open for 2026-2027?", answer: "As of 24 October 2026 no resort has announced a date. Baqueira says the season starts on the last weekend of November; last season La Molina opened on 29 November 2025 and the other FGC resorts on 4 December." },
      { question: "How much is a ski day pass in Catalonia in 2026-27?", answer: "For an adult, from €30 (Vallter, low season) to €74 (Baqueira Beret). La Molina is €49 online, Masella €53 online, Espot €39 and Port Ainé €42–46." },
      { question: "What is the biggest ski resort in Catalonia?", answer: "Baqueira Beret, with 169 km of marked runs. The Alp2500 area (La Molina + Masella) adds up to 145 km." },
      { question: "Can you go skiing by train from Barcelona?", answer: "Yes: to La Molina, which has a station on the R3, and to Vall de Núria with the R3 and the rack railway. During the R3 works the Barcelona–La Garriga stretch is by bus." },
    ],
    verifiedNote: "Ski dates and prices change every season: check them on the resort's website before you buy.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.verifiedNote),
    ...h2(t.tableTitle),
    table(t.tableCaption, t.headers, resortRows(locale), t.tableNote),
    ...h2(t.openTitle, ...t.open),
    ...h2(t.passTitle),
    table(t.passCaption, t.passHeaders, SEASON_PASS[locale], t.passNote),
    ...h2(t.pricesTitle, ...t.prices),
    ...h2(t.getTitle),
    list(...t.get),
    callout("warning", "R3", t.trainNote),
    ...h2(t.smallTitle, ...t.small),
    ...h2(t.nordicTitle, ...t.nordic),
    ...h2(t.snowTitle, ...t.snow),
    ...h2(t.pickTitle),
    list(...t.pick),
    faq(t.faq),
    ...b2Related(["snow", "cerdanya", "nuria", "andorra", "ripolles"], locale),
  ];
}

export const SKI: B2Article = {
  key: "ski",
  entryKey: "guide-ski-resorts-catalonia",
  categoryKey: "mountain",
  sources: SOURCES,
  heroKey: "esqui-baqueira-beret-mar-de-nuvols",
  heroAlt: {
    ca: "Pistes nevades de Baqueira Beret sobre un mar de núvols, amb les muntanyes de l'Aran al fons",
    es: "Pistas nevadas de Baqueira Beret sobre un mar de nubes, con las montañas de Arán al fondo",
    en: "Snowy slopes at Baqueira Beret above a sea of cloud, with the Aran mountains behind",
  },
  heroCaption: {
    ca: "Baqueira Beret, l'estació més gran de Catalunya, amb 169 km de pistes.",
    es: "Baqueira Beret, la estación más grande de Cataluña, con 169 km de pistas.",
    en: "Baqueira Beret, Catalonia's biggest resort, with 169 km of runs.",
  },
  secondaryKey: "esqui-la-molina-pista",
  secondaryAlt: {
    ca: "Una pista de la Molina entre boscos, vista des del poble",
    es: "Una pista de La Molina entre bosques, vista desde el pueblo",
    en: "A run at La Molina between pine forests, seen from the village",
  },
  secondaryCaption: {
    ca: "La Molina, a la Cerdanya: s'hi arriba en tren amb l'R3.",
    es: "La Molina, en la Cerdanya: se llega en tren con el R3.",
    en: "La Molina in the Cerdanya, reachable by train on the R3.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T18:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as SKI_META };
