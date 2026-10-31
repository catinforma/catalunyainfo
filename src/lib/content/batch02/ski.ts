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
 * Ski resorts in Catalonia, season 2026-2027: the comparison table.
 *
 * Re-checked on 24 Oct 2026 against each operator's own pages (Baqueira's
 * new site, PIRINEU365 for the six FGC resorts, Masella, Port del Comte,
 * Tavascan, Guils for Tot Nòrdic). What changed since 12 Oct:
 *
 * - Baqueira's planned season, 28 Nov 2026 → 4 Apr 2027 "siempre que las
 *   condiciones meteorológicas y de nieve lo permitan", is on its own news item
 *   of 28 Jul 2026 (re-checked 25 Oct 2026). Printed as planned, weather
 *   permitting; no other resort has announced a date.
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

// 28 Oct 2026 (research_notes/page1-28oct/ski_christmas.md): all day and
// season prices re-read and unchanged; still no 2026-27 opening date except
// Baqueira's. Added: child day prices, the three FGC early-bird season passes
// to 8 Dec (La Molina 600, Boí Taüll 530, Ripollès 420), official snow-report
// links. Guils' season-pass page (modified 5 Oct 2026) prints the 175/75 EUR
// prices with "DESCOMPTE del 25% aplicat fins el 17 de Novembre", i.e. the
// discount is already in those prices; worded so. Tavascan's nordic circuit
// is "dotze quilòmetres" on its page, not 12.6 km. Masella publishes no daily
// piste page (webcams only).
//
// 30 Oct 2026, re-read 31 Oct (research_notes/ski-opening-30oct.md): opening dates.
// - The "Calendari de l'estació" on each FGC resort's practical-information
//   page (PIRINEU365) now shows the 2026-27 season: La Molina, Vallter, Port
//   Ainé and Boí Taüll open Fri 4 Dec 2026, Espot Sat 5 Dec ("Últim dia de la
//   temporada 26-27": 4 Apr 2027); all close on Sun 4 Apr 2027. Vall de Núria's
//   calendar still shows 2025-26. Printed as each resort's published calendar,
//   not as a promise: snow decides, and last year FGC advanced La Molina.
// - Baqueira's 28 Nov is unchanged (news of 28 Jul; newest news 29 Oct).
//   Masella ("fins a data d'inauguració de la temporada 2026-27"), Port del
//   Comte, Tavascan and the nordic stations give no date.
// - Season passes: Alp2500's early price now ends 22 Nov (FGC and Masella
//   both say "Promoció fins el 22/11"), not 8 Dec; Pallars now has a 436 €
//   early price to 8 Dec; Port del Comte's 595 € is shown as an offer on
//   695 €. Tot Nòrdic: Tuixent-La Vansa prints 131 € before 15 Nov and 175 €
//   after, so 175 € is not the discounted price; Guils says its 25 % runs to
//   17 Nov (raquetes page). The stricter 15 Nov is printed for the 131 €.
// - Ski buses: no operator has published 2026-27 dates (ALSA pages still
//   6 Dec 2025 - 5 Apr 2026, Bus Blanc PDF 2025-26, Sagalés' ski-bus pages
//   gone, TEISA sheet 2023-24); the section says so.
// - All day prices re-read and unchanged.
const VERIFIED = "2026-10-31";

const SOURCES: B2Source[] = [
  { name: "Baqueira Beret — «Baqueira Beret activa el invierno en pleno verano» (28/07/2026)", url: "https://www.baqueira.es/es/noticia/baqueira-beret-activa-el-invierno-en-pleno-verano", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret — tarifas temporada 26-27", url: "https://www.baqueira.es/es/tarifas", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret — datos técnicos", url: "https://www.baqueira.es/es/datos-tecnicos", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret — preguntas frecuentes", url: "https://www.baqueira.es/es/faqs", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret — cómo llegar", url: "https://www.baqueira.es/es/como-llegar", publisher: "Baqueira Beret" },
  { name: "La Molina — tarifes", url: "https://pirineu365.cat/lamolina/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "La Molina — plànol de pistes i fitxa tècnica", url: "https://pirineu365.cat/lamolina/estacio/planol-pistes-fitxa-tecnica/", publisher: "FGC (PIRINEU365)" },
  { name: "La Molina — informació pràctica i transport (calendari de l'estació 2026-27)", url: "https://pirineu365.cat/lamolina/estacio/informacio-tecnica/", publisher: "FGC (PIRINEU365)" },
  { name: "Alp2500", url: "https://pirineu365.cat/lamolina/estacio/alp2500/", publisher: "FGC (PIRINEU365)" },
  { name: "Vallter — tarifes", url: "https://pirineu365.cat/vallter/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "Vallter — informació pràctica (calendari de l'estació 2026-27)", url: "https://pirineu365.cat/vallter/estacio/informacio-practica/", publisher: "FGC (PIRINEU365)" },
  { name: "Espot Esquí — tarifes", url: "https://pirineu365.cat/espotesqui/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "Espot Esquí — informació pràctica (calendari de l'estació 2026-27)", url: "https://pirineu365.cat/espotesqui/estacio/informacio-practica/", publisher: "FGC (PIRINEU365)" },
  { name: "Port Ainé — tarifes", url: "https://pirineu365.cat/portaine/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "Port Ainé — informació pràctica (calendari de l'estació 2026-27)", url: "https://pirineu365.cat/portaine/estacio/informacio-practica/", publisher: "FGC (PIRINEU365)" },
  { name: "Boí Taüll — tarifes", url: "https://pirineu365.cat/boitaull/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "Boí Taüll — informació pràctica (calendari de l'estació 2026-27)", url: "https://pirineu365.cat/boitaull/estacio/informacio-practica/", publisher: "FGC (PIRINEU365)" },
  { name: "Vall de Núria — informació pràctica (calendari de l'estació)", url: "https://pirineu365.cat/valldenuria/estacio/informacio-practica/", publisher: "FGC (PIRINEU365)" },
  { name: "Vall de Núria — plànol de pistes", url: "https://pirineu365.cat/valldenuria/estacio/planol-de-pistes/", publisher: "FGC (PIRINEU365)" },
  { name: "PIRINEU365 avança la temporada amb l'obertura de La Molina (26/11/2025)", url: "https://pirineu365.cat/noticia/pirineu365-avanca-la-temporada-amb-lobertura-de-la-molina-aquest-cap-de-setmana/", publisher: "FGC (PIRINEU365)" },
  { name: "PIRINEU365 inicia la temporada d'hivern amb les sis estacions obertes (03/12/2025)", url: "https://pirineu365.cat/noticia/pirineu365-inicia-la-temporada-dhivern-amb-les-sis-estacions-obertes-i-mes-60-km-esquiables/", publisher: "FGC (PIRINEU365)" },
  { name: "Masella — fitxa tècnica", url: "https://www.masella.com/ca/paginas/fitxa-tecnica", publisher: "Masella" },
  { name: "Masella — forfets", url: "https://www.masella.com/ca/paginas/forfets_masella", publisher: "Masella" },
  { name: "Masella — abonaments de temporada", url: "https://www.masella.com/ca/paginas/abonaments_masella", publisher: "Masella" },
  { name: "Masella — abonaments Alp2500 (promoció fins al 22/11/2026)", url: "https://www.masella.com/ca/paginas/abonaments_alp2500", publisher: "Masella" },
  { name: "Masella — «Abonament a preu d'oferta fins al 22/11/26» (28/10/2026)", url: "https://www.masella.com/blog/ca/9926/", publisher: "Masella" },
  { name: "Port del Comte — tarifes generals", url: "https://portdelcomte.net/tarifes-generals/", publisher: "Port del Comte" },
  { name: "Port del Comte — forfets de temporada 26-27", url: "https://portdelcomte.net/forfets-temporada/", publisher: "Port del Comte" },
  { name: "Tavascan — estació de muntanya", url: "https://www.tavascan365.com/estacio-de-muntanya-de-tavascan/", publisher: "Tavascan" },
  { name: "Guils Fontanera — forfets (Tot Nòrdic 2026-2027)", url: "https://www.guils.com/forfets/", publisher: "Guils Fontanera" },
  { name: "Guils Fontanera — forfet de temporada", url: "https://www.guils.com/forfet-de-temporada/", publisher: "Guils Fontanera" },
  { name: "Tuixent-La Vansa — forfet de temporada Tot Nòrdic 2026/2027", url: "https://www.tuixent-lavansa.com/forfet-de-temporada/", publisher: "Tuixent-La Vansa" },
  { name: "PIRINEU365 — Infoneu", url: "https://pirineu365.cat/infoneu-pirineu365/", publisher: "FGC (PIRINEU365)" },
  { name: "Baqueira Beret — estado de la estación", url: "https://www.baqueira.es/es/estado-de-la-estacion", publisher: "Baqueira Beret" },
  { name: "Port del Comte — pistes", url: "https://portdelcomte.net/pistes/", publisher: "Port del Comte" },
  { name: "Bus Blanc — horaris 2025-2026", url: "https://cerdanya.org/wp-content/uploads/2026/02/Bus-Blanc-2026.pdf", publisher: "Turisme Cerdanya" },
  { name: "TEISA — Girona-Olot-Camprodon-Vallter 2000", url: "https://www.teisa-bus.com/pdf/pdf_comarques_pdf143.pdf", publisher: "TEISA" },
  { name: "R3: modificació del servei", url: "https://rodalies.gencat.cat/ca/detalls/article/02_02_PAT_R3", publisher: "Rodalies de Catalunya" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/estacions-esqui-catalunya",
    title: "Estacions d'esquí de Catalunya 2026-2027: obertura, preus del forfet i pistes obertes",
    seoTitle: "Estacions d'esquí de Catalunya 2026-27: obertura i forfets",
    seoDescription:
      "Baqueira preveu obrir el 28 de novembre i la Molina, el 4 de desembre: les deu estacions d'esquí de Catalunya 2026-27, amb forfets i com arribar-hi.",
    excerpt:
      "Quan obre cada estació el 2026-27 (Baqueira, 28 de novembre; FGC, des del 4 de desembre) i totes en una taula: quilòmetres, forfet de dia i com arribar-hi sense cotxe.",
  },
  es: {
    path: "guias/estaciones-esqui-cataluna",
    title: "Estaciones de esquí de Cataluña 2026-2027: apertura, precios del forfait y pistas abiertas",
    seoTitle: "Estaciones de esquí Cataluña 2026-27: apertura y forfait",
    seoDescription:
      "Baqueira prevé abrir el 28 de noviembre y La Molina, el 4 de diciembre: las diez estaciones de esquí de Cataluña 2026-27, con forfaits y cómo llegar.",
    excerpt:
      "Cuándo abre cada estación en 2026-27 (Baqueira, 28 de noviembre; FGC, desde el 4 de diciembre) y todas en una tabla: kilómetros, forfait de día y cómo llegar sin coche.",
  },
  en: {
    path: "guides/ski-resorts-catalonia",
    title: "Ski resorts in Catalonia 2026-2027: opening dates, lift pass prices and open runs",
    seoTitle: "Ski resorts in Catalonia 2026-27: opening, lift passes",
    seoDescription:
      "Baqueira plans to open on 28 November and La Molina on 4 December: Catalonia's ten ski resorts for 2026-27, with lift pass prices and how to get there.",
    excerpt:
      "When each resort opens in 2026-27 (Baqueira 28 November, FGC from 4 December) and all of them in one table: kilometres, day pass and car-free access.",
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

/**
 * Planned opening and last day, 2026-27. Baqueira from its news item of 28 Jul
 * 2026; the five FGC resorts from the "Calendari de l'estació" on each one's
 * practical-information page, read 30 and 31 Oct 2026 (the first day marked open and
 * the last). Rows without a date say so: nothing is estimated.
 */
const OPENING: Record<Locale, string[][]> = {
  ca: [
    ["Baqueira Beret", "Dissabte 28 de novembre de 2026", "4 d'abril de 2027"],
    ["La Molina", "Divendres 4 de desembre de 2026", "4 d'abril de 2027"],
    ["Vallter", "Divendres 4 de desembre de 2026", "4 d'abril de 2027"],
    ["Port Ainé", "Divendres 4 de desembre de 2026", "4 d'abril de 2027"],
    ["Boí Taüll", "Divendres 4 de desembre de 2026", "4 d'abril de 2027"],
    ["Espot", "Dissabte 5 de desembre de 2026", "4 d'abril de 2027"],
    ["Masella", "Sense data anunciada", "—"],
    ["Vall de Núria", "Sense data anunciada", "—"],
    ["Port del Comte", "Sense data anunciada", "—"],
    ["Tavascan", "Sense data anunciada (pistes alpines tancades el 2025-26)", "—"],
  ],
  es: [
    ["Baqueira Beret", "Sábado 28 de noviembre de 2026", "4 de abril de 2027"],
    ["La Molina", "Viernes 4 de diciembre de 2026", "4 de abril de 2027"],
    ["Vallter", "Viernes 4 de diciembre de 2026", "4 de abril de 2027"],
    ["Port Ainé", "Viernes 4 de diciembre de 2026", "4 de abril de 2027"],
    ["Boí Taüll", "Viernes 4 de diciembre de 2026", "4 de abril de 2027"],
    ["Espot", "Sábado 5 de diciembre de 2026", "4 de abril de 2027"],
    ["Masella", "Sin fecha anunciada", "—"],
    ["Vall de Núria", "Sin fecha anunciada", "—"],
    ["Port del Comte", "Sin fecha anunciada", "—"],
    ["Tavascan", "Sin fecha anunciada (pistas alpinas cerradas en 2025-26)", "—"],
  ],
  en: [
    ["Baqueira Beret", "Saturday 28 November 2026", "4 April 2027"],
    ["La Molina", "Friday 4 December 2026", "4 April 2027"],
    ["Vallter", "Friday 4 December 2026", "4 April 2027"],
    ["Port Ainé", "Friday 4 December 2026", "4 April 2027"],
    ["Boí Taüll", "Friday 4 December 2026", "4 April 2027"],
    ["Espot", "Saturday 5 December 2026", "4 April 2027"],
    ["Masella", "Not announced", "—"],
    ["Vall de Núria", "Not announced", "—"],
    ["Port del Comte", "Not announced", "—"],
    ["Tavascan", "Not announced (alpine runs closed in 2025-26)", "—"],
  ],
};

const SEASON_PASS: Record<Locale, string[][]> = {
  ca: [
    ["Baqueira Beret", "1.300 € fins a l'1 de novembre; 1.400 € després"],
    ["Alp2500 (la Molina + Masella)", "950 € fins al 22 de novembre de 2026; 1.090 € després"],
    ["Masella", "730 € fins al 22 de novembre de 2026; 840 € després"],
    ["La Molina", "600 € fins al 8 de desembre; 690 € després"],
    ["Boí Taüll", "530 € fins al 8 de desembre; 660 € després"],
    ["Port del Comte", "595 € d'oferta (preu original, 695 €); a la venda des de l'1 de novembre"],
    ["Pallars (Espot + Port Ainé)", "436 € fins al 8 de desembre; 545 € després"],
    ["Ripollès (Vallter + Vall de Núria)", "420 € fins al 8 de desembre; 495 € després"],
    ["Esquí nòrdic: Tot Nòrdic, les set estacions de la Mancomunitat (esquí + raquetes)", "131 € fins al 15 de novembre; 175 € després"],
  ],
  es: [
    ["Baqueira Beret", "1.300 € hasta el 1 de noviembre; 1.400 € después"],
    ["Alp2500 (La Molina + Masella)", "950 € hasta el 22 de noviembre de 2026; 1.090 € después"],
    ["Masella", "730 € hasta el 22 de noviembre de 2026; 840 € después"],
    ["La Molina", "600 € hasta el 8 de diciembre; 690 € después"],
    ["Boí Taüll", "530 € hasta el 8 de diciembre; 660 € después"],
    ["Port del Comte", "595 € de oferta (precio original, 695 €); a la venta desde el 1 de noviembre"],
    ["Pallars (Espot + Port Ainé)", "436 € hasta el 8 de diciembre; 545 € después"],
    ["Ripollès (Vallter + Vall de Núria)", "420 € hasta el 8 de diciembre; 495 € después"],
    ["Esquí nórdico: Tot Nòrdic, las siete estaciones de la Mancomunitat (esquí + raquetas)", "131 € hasta el 15 de noviembre; 175 € después"],
  ],
  en: [
    ["Baqueira Beret", "€1,300 until 1 November; €1,400 after"],
    ["Alp2500 (La Molina + Masella)", "€950 until 22 November 2026; €1,090 after"],
    ["Masella", "€730 until 22 November 2026; €840 after"],
    ["La Molina", "€600 until 8 December; €690 after"],
    ["Boí Taüll", "€530 until 8 December; €660 after"],
    ["Port del Comte", "€595 offer price (regular €695); on sale from 1 November"],
    ["Pallars (Espot + Port Ainé)", "€436 until 8 December; €545 after"],
    ["Ripollès (Vallter + Vall de Núria)", "€420 until 8 December; €495 after"],
    ["Cross-country: Tot Nòrdic, the seven Mancomunitat stations (skiing + snowshoes)", "€131 until 15 November; €175 after"],
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
  openCaption: string;
  openHeaders: string[];
  openNote: string;
  passTitle: string;
  passCaption: string;
  passHeaders: string[];
  passNote: string;
  pricesTitle: string;
  prices: string[];
  getTitle: string;
  getIntro: string;
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
    lead: "La primera estació d'esquí de Catalunya que obrirà la temporada 2026-2027 és **Baqueira Beret**, que ho té previst el **dissabte 28 de novembre**, si la neu ho permet. Les estacions d'FGC marquen al seu calendari el **divendres 4 de desembre** (la Molina, Vallter, Port Ainé i Boí Taüll) i el dissabte 5 (Espot); Masella i la Vall de Núria encara no han donat data. Hi ha deu estacions d'esquí alpí: la més gran és Baqueira (169 km), i en tren des de Barcelona s'arriba a **la Molina** i a la **Vall de Núria**. El forfet de dia d'adult va dels **30 € de Vallter** (temporada baixa) als **74 € de Baqueira**.",
    tableTitle: "Comparativa de les estacions d'esquí de Catalunya 2026-2027",
    tableCaption: "Estacions d'esquí alpí de Catalunya: pistes, forfet de dia d'adult i accés sense cotxe",
    headers: ["Estació", "Comarca", "Km", "Altitud (m)", "Forfet d'1 dia, adult", "Sense cotxe"],
    tableNote: "Quilòmetres i altituds de la fitxa tècnica de cada estació. Preus de les pàgines de tarifes, consultades el 31/10/2026: Baqueira els etiqueta «temporada 26-27» i la resta ja hi inclou dates de 2026-27, excepte Boí Taüll. Port del Comte mostra dues taules amb imports diferents.",
    openTitle: "Obertura de les estacions d'esquí 2026-2027: quan obre cada estació",
    open: [
      "**Baqueira Beret té previst obrir la temporada 2026-2027 el dissabte 28 de novembre i tancar el 4 d'abril de 2027**, si la meteorologia i la neu ho permeten (notícia de l'estació del 28 de juliol de 2026). Les seves preguntes freqüents diuen que la temporada «s'inicia l'últim cap de setmana de novembre i acaba en acabar Setmana Santa», sempre segons la meteorologia.",
      "**Les estacions d'esquí alpí d'FGC ja tenen calendari:** al web de PIRINEU365, la Molina, Vallter, Port Ainé i Boí Taüll marquen l'obertura el **divendres 4 de desembre de 2026**, i Espot, el **dissabte 5**; totes, fins al **diumenge 4 d'abril de 2027**. La Vall de Núria encara mostra el calendari de la temporada passada.",
      "**Masella, la Vall de Núria, Port del Comte i Tavascan no han anunciat la data** (consultat el 31 d'octubre de 2026). Masella diu només que les seves oficines fan l'horari de cap de setmana «fins a data d'inauguració de la temporada 2026-27».",
      "Les dates depenen de la neu i del fred per fabricar-ne. La temporada passada, FGC va avançar l'obertura de la **Molina** al **29 de novembre de 2025**, i les altres cinc estacions d'FGC van obrir el **4 de desembre de 2025**.",
    ],
    openCaption: "Obertura prevista de les estacions d'esquí alpí de Catalunya, temporada 2026-2027",
    openHeaders: ["Estació", "Obertura prevista", "Últim dia previst"],
    openNote: "Baqueira: notícia de l'estació del 28/07/2026, «siempre que las condiciones meteorológicas y de nieve lo permitan». Estacions d'FGC: el «Calendari de l'estació» de la pàgina d'informació pràctica de cada una. Consultat el 31/10/2026. Totes les dates depenen de la neu.",
    passTitle: "Forfet de temporada 2026-2027",
    passCaption: "Forfet de temporada d'adult, temporada 2026-2027",
    passHeaders: ["Estació o domini", "Preu adult"],
    passNote: "Preus publicats a les webs oficials, consultats el 31/10/2026. Les ofertes de la Molina, Boí Taüll, el Pallars i el Ripollès són d'FGC i acaben el 8 de desembre; la d'Alp2500, com la de Masella, el 22 de novembre. El preu del Tot Nòrdic és el que publica Tuixent-La Vansa. Les edats d'«adult» canvien segons l'estació (a les d'FGC, de 25 a 64 anys; a l'Alp2500, de 12 a 64).",
    pricesTitle: "Preus del forfet: el que cal saber abans de comprar",
    prices: [
      "**Compra en línia.** A la Molina, Vallter, Espot i Boí Taüll comprar a la taquilla costa **3 € més** (a Port Ainé, **5 € més**); a Masella, també 3 € més. Baqueira ven el forfet de dia amb la targeta recarregable BaqueiraTICKET, i amb el BaqueiraPASS el dia d'adult baixa de 74 a 70 €.",
      "**Infants.** El forfet de dia infantil costa 49 € a Baqueira, 43 € a Masella (en línia), 36 € a la Molina i Boí Taüll, 30,50–33,50 € a Port Ainé, 28,50 € a Espot i 24–27,50 € a Vallter; les franges d'edat canvien segons l'estació.",
      "**Temporada alta i baixa.** A Vallter i Port Ainé el preu de dia canvia segons el calendari: a Port Ainé, la temporada alta 2026-27 és del 26 al 30 de desembre, el 2 i 3 de gener i els caps de setmana de febrer.",
      "**Abonaments que comparteixen estacions.** El forfet Alp2500 val per a la Molina i Masella (145 km junts); el Temporada Pallars, per a Espot i Port Ainé; el Temporada Ripollès, per a Vallter i la Vall de Núria.",
    ],
    getTitle: "Com arribar a les pistes en tren o en bus",
    getIntro: "Els busos d'esquí de la temporada 2026-2027 encara no tenen dates publicades (consultat el 31 d'octubre de 2026): els calendaris que hi ha a les webs són de la temporada 2025-26, o no diuen de quina temporada són. Cap operador no ha dit quan publicarà els nous; l'any passat, l'ALSA Ski Bus i el Bus Blanc van començar el cap de setmana del 6 de desembre.",
    get: [
      "**La Molina:** té estació pròpia a la línia **R3**. El **Ski Tren**, que es compra a Renfe/Rodalies, combina tren d'anada i tornada, bus intern i forfet. També hi ha **Ski Bus** de Sagalés (només la Molina o la Molina + Masella); el web de l'estació en mostra els preus, però no les dates.",
      `**Vall de Núria:** R3 fins a Ribes-Enllaç i el **Cremallera**; no hi arriba cap carretera. Detalls a ${b2link("nuria", "ca", "la guia de Núria")}.`,
      "**Espot i Port Ainé:** l'**ALSA Ski Bus** (bus d'anada i tornada + forfet) des de Lleida i Balaguer, i el Taxi de la Neu des de Sort. La temporada passada (2025-26) va circular els dissabtes, diumenges i festius del 6 de desembre al 5 d'abril; les webs de les estacions encara mostren aquestes dates.",
      "**Masella:** el Ski Bus La Molina + Masella de Sagalés i, dins la Cerdanya, el **Bus Blanc** del Consell Comarcal. La temporada passada (2025-26) va circular els caps de setmana i festius escolars des del 6 de desembre, a 2 €; el calendari 2026-27 encara no s'ha publicat.",
      "**Boí Taüll:** el **Bus de la Neu**, a 1 €, els caps de setmana i festius des de Vilaller, amb parades al Pont de Suert i als pobles de la vall; la web en dona un «calendari provisional» sense dir de quina temporada és.",
      "**Vallter:** TEISA publica un bus d'esquí Girona–Banyoles–Olot–Camprodon–Setcases–Vallter els dissabtes, diumenges i festius de gener a març; el full penjat encara porta les tarifes de 2023-24.",
      "**Baqueira Beret:** busos d'ALSA fins a Vielha i, des d'allà, el bus local línia VA fins a l'estació.",
    ],
    trainNote: `Mentre durin les obres de l'R3, no hi ha trens entre Barcelona i la Garriga: el tram es fa amb autobús i l'R3 circula entre la Garriga i Puigcerdà amb la meitat de trens. Els horaris dels trens que pugen a la Molina són a la guia de ${b2link("cerdanya", "ca", "la Cerdanya sense cotxe")}.`,
    smallTitle: "Port del Comte i Tavascan",
    small: [
      "**Port del Comte**, al Solsonès, posa a la venda el forfet de temporada 2026-27 l'1 de novembre (595 € adult, d'oferta; preu original, 695 €). Encara no ha anunciat la data d'obertura. Al seu web la temporada alta inclou tots els caps de setmana, el 7 i 8 de desembre, del 21 de desembre al 28 de febrer de 2027 i del 22 al 29 de març de 2027.",
      "**Tavascan** no va obrir les pistes alpines ni el telecadira la temporada 2025-26 i, a 31 d'octubre de 2026, el seu web no diu què farà aquest hivern. El seu circuit nòrdic, d'uns dotze quilòmetres, és una de les set estacions de la Mancomunitat d'Esquí Nòrdic.",
    ],
    nordicTitle: "Esquí nòrdic i raquetes",
    nordic: [
      "Les set estacions de la Mancomunitat d'Esquí Nòrdic (Guils Fontanera, Aransa, Lles, Tuixent-La Vansa, Sant Joan de l'Erm, Tavascan i Virós-Vallferrera) comparteixen el forfet de temporada **Tot Nòrdic**: per a la temporada 2026-27, **175 €** per a adults (esquí + raquetes), o **131 €** si es compra abans del 15 de novembre, segons Tuixent-La Vansa. Guils ven el de només raquetes a **75 €**, amb el 25 % de descompte que hi aplica fins al 17 de novembre. Tuixent-La Vansa, Sant Joan de l'Erm i Tavascan encara no han anunciat la data d'obertura.",
      `Si no esquies, mira ${b2link("snow", "ca", "on veure neu sense esquiar i les rutes amb raquetes")}.`,
    ],
    snowTitle: "Pistes obertes avui: on mirar l'estat de la neu",
    snow: [
      "Cada estació publica cada dia les pistes obertes, el gruix de neu i els remuntadors en marxa: les sis d'FGC (la Molina, Vall de Núria, Vallter, Espot, Port Ainé i Boí Taüll) a l'[Infoneu de PIRINEU365](https://pirineu365.cat/infoneu-pirineu365/), Baqueira a «[Estado de la estación](https://www.baqueira.es/es/estado-de-la-estacion)» i Port del Comte a [la seva pàgina de pistes](https://portdelcomte.net/pistes/); Masella hi té càmeres web. Abans de l'obertura surten buits. Mira-ho el mateix matí: a principi i final de temporada canvia d'un dia per l'altre.",
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
      { question: "Quan obren les estacions d'esquí de Catalunya la temporada 2026-2027?", answer: "La primera serà Baqueira Beret, que té previst obrir el dissabte 28 de novembre de 2026, si la meteorologia i la neu ho permeten. Les estacions d'FGC marquen al seu calendari el divendres 4 de desembre (la Molina, Vallter, Port Ainé i Boí Taüll) i el dissabte 5 (Espot). Masella, la Vall de Núria, Port del Comte i Tavascan encara no han donat data (consultat el 31 d'octubre de 2026)." },
      { question: "Quan obre Baqueira Beret el 2026?", answer: "Baqueira té previst obrir la temporada 2026-2027 el dissabte 28 de novembre de 2026 i tancar el 4 d'abril de 2027, si la meteorologia i la neu ho permeten. Ho va anunciar el 28 de juliol de 2026, i el 31 d'octubre la data no havia canviat." },
      { question: "Quan obre la Molina la temporada 2026-2027?", answer: "El calendari de l'estació, al web de PIRINEU365, marca l'obertura el divendres 4 de desembre de 2026 i el tancament el 4 d'abril de 2027. La temporada passada FGC la va avançar al 29 de novembre de 2025." },
      { question: "Quan obre Masella?", answer: "Masella encara no ha anunciat la data d'obertura de la temporada 2026-27 (consultat el 31 d'octubre de 2026). El seu abonament de temporada té preu d'oferta fins al 22 de novembre: 730 € adult, i 840 € després." },
      { question: "Quan obre Boí Taüll?", answer: "El calendari de l'estació marca l'obertura el divendres 4 de desembre de 2026 i el tancament el 4 d'abril de 2027. La temporada passada va obrir el 4 de desembre de 2025." },
      { question: "Quant costa el forfet de dia a Catalunya el 2026-27?", answer: "Per a un adult, de 30 € (Vallter en temporada baixa) a 74 € (Baqueira Beret). La Molina, 49 € en línia; Masella, 53 € en línia; Espot, 39 €; Port Ainé, de 42 a 46 €." },
      { question: "Quina és l'estació d'esquí més gran de Catalunya?", answer: "Baqueira Beret, amb 169 km de pistes balisades. El domini Alp2500 (la Molina + Masella) en suma 145." },
      { question: "Es pot anar a esquiar en tren des de Barcelona?", answer: "Sí: a la Molina, que té estació a l'R3, i a la Vall de Núria amb l'R3 i el Cremallera. Durant les obres de l'R3 el tram Barcelona–la Garriga es fa amb autobús." },
    ],
    verifiedNote: "Les dates i els preus d'esquí canvien cada temporada: comprova'ls al web de l'estació abans de comprar.",
  },
  es: {
    lead: "La primera estación de esquí de Cataluña que abrirá la temporada 2026-2027 es **Baqueira Beret**, que lo tiene previsto el **sábado 28 de noviembre**, si la nieve lo permite. Las estaciones de FGC marcan en su calendario el **viernes 4 de diciembre** (La Molina, Vallter, Port Ainé y Boí Taüll) y el sábado 5 (Espot); Masella y la Vall de Núria aún no han dado fecha. Hay diez estaciones de esquí alpino: la más grande es Baqueira (169 km), y en tren desde Barcelona se llega a **La Molina** y a la **Vall de Núria**. El forfait de día de adulto va de los **30 € de Vallter** (temporada baja) a los **74 € de Baqueira**.",
    tableTitle: "Comparativa de las estaciones de esquí de Cataluña 2026-2027",
    tableCaption: "Estaciones de esquí alpino de Cataluña: pistas, forfait de día de adulto y acceso sin coche",
    headers: ["Estación", "Comarca", "Km", "Altitud (m)", "Forfait 1 día, adulto", "Sin coche"],
    tableNote: "Kilómetros y altitudes de la ficha técnica de cada estación. Precios de las páginas de tarifas, consultadas el 31/10/2026: Baqueira los etiqueta «temporada 26-27» y el resto ya incluye fechas de 2026-27, salvo Boí Taüll. Port del Comte muestra dos tablas con importes distintos.",
    openTitle: "Apertura de las estaciones de esquí 2026-2027: cuándo abre cada estación",
    open: [
      "**Baqueira Beret tiene previsto abrir la temporada 2026-2027 el sábado 28 de noviembre y cerrar el 4 de abril de 2027**, si la meteorología y la nieve lo permiten (noticia de la estación del 28 de julio de 2026). Sus preguntas frecuentes dicen que la temporada «inicia el último fin de semana de noviembre y finaliza al acabar Semana Santa», siempre sujeta a la meteorología.",
      "**Las estaciones de esquí alpino de FGC ya tienen calendario:** en la web de PIRINEU365, La Molina, Vallter, Port Ainé y Boí Taüll marcan la apertura el **viernes 4 de diciembre de 2026**, y Espot, el **sábado 5**; todas, hasta el **domingo 4 de abril de 2027**. La Vall de Núria aún muestra el calendario de la temporada pasada.",
      "**Masella, la Vall de Núria, Port del Comte y Tavascan no han anunciado la fecha** (consultado el 31 de octubre de 2026). Masella solo dice que sus oficinas hacen el horario de fin de semana «fins a data d'inauguració de la temporada 2026-27» (hasta la fecha de inauguración).",
      "Las fechas dependen de la nieve y del frío para fabricarla. La temporada pasada, FGC adelantó la apertura de **La Molina** al **29 de noviembre de 2025**, y las otras cinco estaciones de FGC abrieron el **4 de diciembre de 2025**.",
    ],
    openCaption: "Apertura prevista de las estaciones de esquí alpino de Cataluña, temporada 2026-2027",
    openHeaders: ["Estación", "Apertura prevista", "Último día previsto"],
    openNote: "Baqueira: noticia de la estación del 28/07/2026, «siempre que las condiciones meteorológicas y de nieve lo permitan». Estaciones de FGC: el «Calendari de l'estació» de la página de información práctica de cada una. Consultado el 31/10/2026. Todas las fechas dependen de la nieve.",
    passTitle: "Forfait de temporada 2026-2027",
    passCaption: "Forfait de temporada de adulto, temporada 2026-2027",
    passHeaders: ["Estación o dominio", "Precio adulto"],
    passNote: "Precios publicados en las webs oficiales, consultados el 31/10/2026. Las ofertas de La Molina, Boí Taüll, el Pallars y el Ripollès son de FGC y acaban el 8 de diciembre; la de Alp2500, como la de Masella, el 22 de noviembre. El precio del Tot Nòrdic es el que publica Tuixent-La Vansa. La edad de «adulto» cambia según la estación (en las de FGC, de 25 a 64 años; en Alp2500, de 12 a 64).",
    pricesTitle: "Precios del forfait: lo que hay que saber antes de comprar",
    prices: [
      "**Compra online.** En La Molina, Vallter, Espot y Boí Taüll comprar en taquilla cuesta **3 € más** (en Port Ainé, **5 € más**); en Masella, también 3 € más. Baqueira vende el forfait de día con la tarjeta recargable BaqueiraTICKET, y con el BaqueiraPASS el día de adulto baja de 74 a 70 €.",
      "**Niños.** El forfait de día infantil cuesta 49 € en Baqueira, 43 € en Masella (online), 36 € en La Molina y Boí Taüll, 30,50–33,50 € en Port Ainé, 28,50 € en Espot y 24–27,50 € en Vallter; las franjas de edad cambian según la estación.",
      "**Temporada alta y baja.** En Vallter y Port Ainé el precio de día cambia según el calendario: en Port Ainé, la temporada alta 2026-27 es del 26 al 30 de diciembre, el 2 y 3 de enero y los fines de semana de febrero.",
      "**Abonos que comparten estaciones.** El forfait Alp2500 vale para La Molina y Masella (145 km juntas); el Temporada Pallars, para Espot y Port Ainé; el Temporada Ripollès, para Vallter y la Vall de Núria.",
    ],
    getTitle: "Cómo llegar a las pistas en tren o en bus",
    getIntro: "Los autobuses de esquí de la temporada 2026-2027 aún no tienen fechas publicadas (consultado el 31 de octubre de 2026): los calendarios que hay en las webs son de la temporada 2025-26, o no dicen de qué temporada son. Ningún operador ha dicho cuándo publicará los nuevos; el año pasado, el ALSA Ski Bus y el Bus Blanc empezaron el fin de semana del 6 de diciembre.",
    get: [
      "**La Molina:** tiene estación propia en la línea **R3**. El **Ski Tren**, que se compra en Renfe/Rodalies, combina tren de ida y vuelta, bus interno y forfait. También hay **Ski Bus** de Sagalés (solo La Molina o La Molina + Masella); la web de la estación muestra sus precios, pero no las fechas.",
      `**Vall de Núria:** R3 hasta Ribes-Enllaç y el **Cremallera**; no llega ninguna carretera. Detalles en ${b2link("nuria", "es", "la guía de Núria")}.`,
      "**Espot y Port Ainé:** el **ALSA Ski Bus** (bus de ida y vuelta + forfait) desde Lleida y Balaguer, y el Taxi de la Neu desde Sort. La temporada pasada (2025-26) circuló sábados, domingos y festivos del 6 de diciembre al 5 de abril; las webs de las estaciones aún muestran esas fechas.",
      "**Masella:** el Ski Bus La Molina + Masella de Sagalés y, dentro de la Cerdanya, el **Bus Blanc** del Consell Comarcal. La temporada pasada (2025-26) circuló los fines de semana y festivos escolares desde el 6 de diciembre, a 2 €; el calendario 2026-27 aún no se ha publicado.",
      "**Boí Taüll:** el **Bus de la Neu**, a 1 €, los fines de semana y festivos desde Vilaller, con paradas en El Pont de Suert y los pueblos del valle; la web da un «calendari provisional» sin decir de qué temporada es.",
      "**Vallter:** TEISA publica un bus de esquí Girona–Banyoles–Olot–Camprodon–Setcases–Vallter los sábados, domingos y festivos de enero a marzo; la hoja colgada aún lleva las tarifas de 2023-24.",
      "**Baqueira Beret:** autobuses de ALSA hasta Vielha y, desde allí, el bus local línea VA hasta la estación.",
    ],
    trainNote: `Mientras duren las obras de la R3 no hay trenes entre Barcelona y La Garriga: el tramo se hace en autobús y la R3 circula entre La Garriga y Puigcerdà con la mitad de trenes. Los horarios de los trenes que suben a La Molina están en la guía de ${b2link("cerdanya", "es", "la Cerdanya sin coche")}.`,
    smallTitle: "Port del Comte y Tavascan",
    small: [
      "**Port del Comte**, en el Solsonès, pone a la venta el forfait de temporada 2026-27 el 1 de noviembre (595 € adulto, de oferta; precio original, 695 €). Aún no ha anunciado la fecha de apertura. En su web la temporada alta incluye todos los fines de semana, el 7 y 8 de diciembre, del 21 de diciembre al 28 de febrero de 2027 y del 22 al 29 de marzo de 2027.",
      "**Tavascan** no abrió las pistas alpinas ni el telesilla en la temporada 2025-26 y, a 31 de octubre de 2026, su web no dice qué hará este invierno. Su circuito nórdico, de unos doce kilómetros, es una de las siete estaciones de la Mancomunitat d'Esquí Nòrdic.",
    ],
    nordicTitle: "Esquí nórdico y raquetas",
    nordic: [
      "Las siete estaciones de la Mancomunitat d'Esquí Nòrdic (Guils Fontanera, Aransa, Lles, Tuixent-La Vansa, Sant Joan de l'Erm, Tavascan y Virós-Vallferrera) comparten el forfait de temporada **Tot Nòrdic**: para la temporada 2026-27, **175 €** para adultos (esquí + raquetas), o **131 €** si se compra antes del 15 de noviembre, según Tuixent-La Vansa. Guils vende el de solo raquetas a **75 €**, con el 25 % de descuento que aplica hasta el 17 de noviembre. Tuixent-La Vansa, Sant Joan de l'Erm y Tavascan aún no han anunciado la fecha de apertura.",
      `Si no esquías, mira ${b2link("snow", "es", "dónde ver nieve sin esquiar y las rutas con raquetas")}.`,
    ],
    snowTitle: "Pistas abiertas hoy: dónde mirar el estado de la nieve",
    snow: [
      "Cada estación publica a diario las pistas abiertas, el espesor de nieve y los remontes en marcha: las seis de FGC (La Molina, Vall de Núria, Vallter, Espot, Port Ainé y Boí Taüll) en el [Infoneu de PIRINEU365](https://pirineu365.cat/infoneu-pirineu365/), Baqueira en «[Estado de la estación](https://www.baqueira.es/es/estado-de-la-estacion)» y Port del Comte en [su página de pistas](https://portdelcomte.net/pistes/); Masella tiene cámaras web. Antes de la apertura salen vacíos. Míralo la misma mañana: a principio y final de temporada cambia de un día para otro.",
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
      { question: "¿Cuándo abren las estaciones de esquí de Cataluña en la temporada 2026-2027?", answer: "La primera será Baqueira Beret, que tiene previsto abrir el sábado 28 de noviembre de 2026, si la meteorología y la nieve lo permiten. Las estaciones de FGC marcan en su calendario el viernes 4 de diciembre (La Molina, Vallter, Port Ainé y Boí Taüll) y el sábado 5 (Espot). Masella, la Vall de Núria, Port del Comte y Tavascan aún no han dado fecha (consultado el 31 de octubre de 2026)." },
      { question: "¿Cuándo abre Baqueira en 2026?", answer: "Baqueira tiene previsto abrir la temporada 2026-2027 el sábado 28 de noviembre de 2026 y cerrar el 4 de abril de 2027, «siempre que las condiciones meteorológicas y de nieve lo permitan». Lo anunció el 28 de julio de 2026, y el 31 de octubre la fecha no había cambiado." },
      { question: "¿Cuándo abre La Molina en la temporada 2026-2027?", answer: "El calendario de la estación, en la web de PIRINEU365, marca la apertura el viernes 4 de diciembre de 2026 y el cierre el 4 de abril de 2027. La temporada pasada FGC la adelantó al 29 de noviembre de 2025." },
      { question: "¿Cuándo abre Masella?", answer: "Masella aún no ha anunciado la fecha de apertura de la temporada 2026-27 (consultado el 31 de octubre de 2026). Su abono de temporada tiene precio de oferta hasta el 22 de noviembre: 730 € adulto, y 840 € después." },
      { question: "¿Cuándo abre Boí Taüll?", answer: "El calendario de la estación marca la apertura el viernes 4 de diciembre de 2026 y el cierre el 4 de abril de 2027. La temporada pasada abrió el 4 de diciembre de 2025." },
      { question: "¿Cuánto cuesta el forfait de día en Cataluña en 2026-27?", answer: "Para un adulto, de 30 € (Vallter en temporada baja) a 74 € (Baqueira Beret). La Molina, 49 € online; Masella, 53 € online; Espot, 39 €; Port Ainé, de 42 a 46 €." },
      { question: "¿Cuál es la estación de esquí más grande de Cataluña?", answer: "Baqueira Beret, con 169 km de pistas balizadas. El dominio Alp2500 (La Molina + Masella) suma 145." },
      { question: "¿Se puede ir a esquiar en tren desde Barcelona?", answer: "Sí: a La Molina, que tiene estación en la R3, y a la Vall de Núria con la R3 y el Cremallera. Durante las obras de la R3 el tramo Barcelona–La Garriga se hace en autobús." },
    ],
    verifiedNote: "Las fechas y los precios de esquí cambian cada temporada: compruébalos en la web de la estación antes de comprar.",
  },
  en: {
    lead: "The first Catalan ski resort to open for 2026-2027 will be **Baqueira Beret**, which plans to open on **Saturday 28 November**, snow permitting. FGC's resorts mark **Friday 4 December** on their calendars (La Molina, Vallter, Port Ainé and Boí Taüll) and Saturday 5 December (Espot); Masella and Vall de Núria have not given a date yet. Catalonia has ten alpine ski resorts: the biggest is Baqueira (169 km), and by train from Barcelona you can reach **La Molina** and **Vall de Núria**. An adult day pass runs from **€30 at Vallter** (low season) to **€74 at Baqueira**.",
    tableTitle: "Catalonia's ski resorts compared, 2026-2027",
    tableCaption: "Alpine ski resorts in Catalonia: runs, adult day pass and car-free access",
    headers: ["Resort", "Area", "Km", "Altitude (m)", "Adult 1-day pass", "Without a car"],
    tableNote: "Kilometres and altitudes from each resort's technical sheet. Prices from the rates pages, checked 31/10/2026: Baqueira labels them 'temporada 26-27' and the others already carry 2026-27 dates, except Boí Taüll. Port del Comte shows two tables with different amounts.",
    openTitle: "Opening dates for the 2026-2027 ski season: when each resort opens",
    open: [
      "**Baqueira Beret plans to open the 2026-2027 season on Saturday 28 November and close on 4 April 2027**, weather and snow permitting (the resort's own news item of 28 July 2026). Its FAQ says the season 'starts on the last weekend of November and ends after Easter', always weather permitting.",
      "**FGC's alpine resorts have published their calendars:** on the PIRINEU365 website, La Molina, Vallter, Port Ainé and Boí Taüll show opening on **Friday 4 December 2026**, and Espot on **Saturday 5 December**; all of them run to **Sunday 4 April 2027**. Vall de Núria still shows last season's calendar.",
      "**Masella, Vall de Núria, Port del Comte and Tavascan have not announced a date** (checked 31 October 2026). Masella only says its offices keep weekend hours 'until the opening day of the 2026-27 season'.",
      "Dates depend on snowfall and on nights cold enough to make snow. Last season FGC brought **La Molina**'s opening forward to **29 November 2025**, and the other five FGC resorts opened on **4 December 2025**.",
    ],
    openCaption: "Planned opening of Catalonia's alpine ski resorts, 2026-2027 season",
    openHeaders: ["Resort", "Planned opening", "Planned last day"],
    openNote: "Baqueira: the resort's news item of 28/07/2026, 'siempre que las condiciones meteorológicas y de nieve lo permitan' (weather and snow permitting). FGC resorts: the 'Calendari de l'estació' on each one's practical information page. Checked 31/10/2026. Every date depends on snow.",
    passTitle: "Season passes for 2026-2027",
    passCaption: "Adult season pass, 2026-2027 season",
    passHeaders: ["Resort or area", "Adult price"],
    passNote: "Prices published on the official websites, checked 31/10/2026. The La Molina, Boí Taüll, Pallars and Ripollès offers are FGC's and end on 8 December; the Alp2500 offer, like Masella's, ends on 22 November. The Tot Nòrdic price is the one Tuixent-La Vansa publishes. 'Adult' age bands differ by resort (25 to 64 at the FGC resorts; 12 to 64 for Alp2500).",
    pricesTitle: "Lift pass prices: what to know before you buy",
    prices: [
      "**Buy online.** At La Molina, Vallter, Espot and Boí Taüll the ticket office charges **€3 more** (**€5 more** at Port Ainé); Masella also adds €3. Baqueira sells day passes on its reloadable BaqueiraTICKET card, and with a BaqueiraPASS the adult day drops from €74 to €70.",
      "**Children.** A child day pass costs €49 at Baqueira, €43 at Masella (online), €36 at La Molina and Boí Taüll, €30.50–33.50 at Port Ainé, €28.50 at Espot and €24–27.50 at Vallter; age bands differ by resort.",
      "**High and low season.** At Vallter and Port Ainé the day price follows a calendar: at Port Ainé, 2026-27 high season is 26–30 December, 2–3 January and the February weekends.",
      "**Passes that cover several resorts.** Alp2500 is valid at La Molina and Masella (145 km together); Temporada Pallars at Espot and Port Ainé; Temporada Ripollès at Vallter and Vall de Núria.",
    ],
    getTitle: "Getting to the slopes by train or bus",
    getIntro: "No 2026-2027 dates have been published for the ski buses yet (checked 31 October 2026): the calendars on the operators' and resorts' websites are last season's (2025-26), or do not say which season they are for. No operator has said when the new ones will be out; last year the ALSA Ski Bus and the Bus Blanc started on the weekend of 6 December.",
    get: [
      "**La Molina:** it has its own station on the **R3** line. The **Ski Tren**, sold by Renfe/Rodalies, bundles a return train, the resort shuttle and a lift pass. Sagalés also runs a **Ski Bus** (La Molina only, or La Molina + Masella); the resort's website lists its prices but no dates.",
      `**Vall de Núria:** the R3 to Ribes-Enllaç, then the **rack railway**; no road reaches it. Details in ${b2link("nuria", "en", "our Núria guide")}.`,
      "**Espot and Port Ainé:** the **ALSA Ski Bus** (return coach + lift pass) from Lleida and Balaguer, and the 'Taxi de la Neu' from Sort. Last season (2025-26) it ran on Saturdays, Sundays and holidays from 6 December to 5 April; the resorts' websites still show those dates.",
      "**Masella:** the Sagalés Ski Bus La Molina + Masella and, within Cerdanya, the county council's **Bus Blanc**. Last season (2025-26) it ran at weekends and during school holidays from 6 December, for €2; the 2026-27 calendar has not been published yet.",
      "**Boí Taüll:** the **Bus de la Neu**, €1, on weekends and holidays from Vilaller, stopping at El Pont de Suert and the valley villages; the website gives a 'provisional calendar' without saying which season it is for.",
      "**Vallter:** TEISA publishes a ski bus Girona–Banyoles–Olot–Camprodon–Setcases–Vallter on Saturdays, Sundays and holidays from January to March; the sheet online still shows 2023-24 fares.",
      "**Baqueira Beret:** ALSA coaches to Vielha, then local bus line VA to the resort.",
    ],
    trainNote: `While the R3 works last, no trains run between Barcelona and La Garriga: that stretch is by bus, and R3 trains run between La Garriga and Puigcerdà at half the usual frequency. Train times up to La Molina are in our ${b2link("cerdanya", "en", "Cerdanya without a car")} guide.`,
    smallTitle: "Port del Comte and Tavascan",
    small: [
      "**Port del Comte**, in the Solsonès, puts its 2026-27 season pass on sale on 1 November (€595 adult, an offer price; regular €695). It has not announced an opening date yet. Its high season covers every weekend, 7–8 December, 21 December to 28 February 2027 and 22–29 March 2027.",
      "**Tavascan** did not open its alpine runs or chairlift in 2025-26 and, as of 31 October 2026, its website does not say what it will do this winter. Its cross-country circuit, about twelve kilometres, is one of the seven Mancomunitat d'Esquí Nòrdic stations.",
    ],
    nordicTitle: "Cross-country skiing and snowshoes",
    nordic: [
      "The seven stations of the Mancomunitat d'Esquí Nòrdic (Guils Fontanera, Aransa, Lles, Tuixent-La Vansa, Sant Joan de l'Erm, Tavascan and Virós-Vallferrera) share the **Tot Nòrdic** season pass: for 2026-27 it costs **€175** for adults (skiing + snowshoes), or **€131** if bought before 15 November, according to Tuixent-La Vansa. Guils sells the snowshoes-only pass at **€75**, with the 25% discount it applies until 17 November. Tuixent-La Vansa, Sant Joan de l'Erm and Tavascan have not announced their opening dates yet.",
      `Not a skier? See ${b2link("snow", "en", "where to see snow without skiing, with snowshoe routes")}.`,
    ],
    snowTitle: "Open runs today: where to check the snow",
    snow: [
      "Each resort posts open runs, snow depth and running lifts daily: the six FGC resorts (La Molina, Vall de Núria, Vallter, Espot, Port Ainé and Boí Taüll) on [PIRINEU365's Infoneu](https://pirineu365.cat/infoneu-pirineu365/), Baqueira under '[Estado de la estación](https://www.baqueira.es/es/estado-de-la-estacion)' and Port del Comte on [its pistes page](https://portdelcomte.net/pistes/); Masella has webcams. Before opening they are empty. Check on the morning itself: at the start and end of the season it changes from one day to the next.",
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
      { question: "When do Catalonia's ski resorts open for 2026-2027?", answer: "The first will be Baqueira Beret, which plans to open on Saturday 28 November 2026, weather and snow permitting. FGC's resorts mark Friday 4 December on their calendars (La Molina, Vallter, Port Ainé and Boí Taüll) and Saturday 5 December (Espot). Masella, Vall de Núria, Port del Comte and Tavascan have not given a date yet (checked 31 October 2026)." },
      { question: "When does Baqueira open in 2026?", answer: "Baqueira plans to open the 2026-2027 season on Saturday 28 November 2026 and close on 4 April 2027, weather and snow permitting. It announced the date on 28 July 2026, and it was unchanged on 31 October." },
      { question: "When does La Molina open for the 2026-2027 season?", answer: "The resort's calendar on the PIRINEU365 website shows opening on Friday 4 December 2026 and closing on 4 April 2027. Last season FGC brought the opening forward to 29 November 2025." },
      { question: "When does Masella open?", answer: "Masella has not announced its opening date for 2026-27 yet (checked 31 October 2026). Its season pass has an offer price until 22 November: €730 for adults, €840 after." },
      { question: "When does Boí Taüll open?", answer: "The resort's calendar shows opening on Friday 4 December 2026 and closing on 4 April 2027. Last season it opened on 4 December 2025." },
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
    // Opening first: from November the query is "when does it open".
    ...h2(t.openTitle),
    table(t.openCaption, t.openHeaders, OPENING[locale], t.openNote),
    ...paras(...t.open),
    ...h2(t.tableTitle),
    table(t.tableCaption, t.headers, resortRows(locale), t.tableNote),
    ...h2(t.passTitle),
    table(t.passCaption, t.passHeaders, SEASON_PASS[locale], t.passNote),
    ...h2(t.pricesTitle, ...t.prices),
    ...h2(t.getTitle, t.getIntro),
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
