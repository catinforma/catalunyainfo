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
// 5 Nov 2026 (research_notes/ski-opening-5nov.md): opening dates re-read.
// - Vall de Núria's "Calendari de l'estació d'esquí" now shows 2026-27:
//   open 4-8 Dec, 12-13 Dec and daily from 19 Dec, last day Sun 4 Apr 2027.
// - Baqueira (28 Nov), the other five FGC calendars, Masella, Port del
//   Comte and Tavascan unchanged. Baqueira's 1.300 EUR early season pass
//   ended on 1 Nov: 1.400 EUR now.
// 23 Nov 2026 (evergreen striking-distance push, docs/SEO_EXPERIMENTS.md):
// re-read with curl on every page below (fact pack
// research_notes/ski-reread-23nov.md). Opening dates unchanged: Baqueira's
// news of 11 Nov 2026 repeats "La apertura está prevista para el sábado 28 de
// noviembre de 2026 y el cierre para el domingo 4 de abril de 2027"; the six
// FGC calendars still mark 4 Dec (Espot 5 Dec) to 4 Apr. FGC's season
// presentation of 6 Nov 2026 says the six "obriran les seves instal·lacions
// del 4 de desembre al 4 d'abril amb 189 km esquiables i 180 pistes" and
// launches the "Dia de l'esquiador" (Wednesdays, every pass at half price with
// the FlexiPass; FlexiPass 15 EUR renewal / 25 EUR new, free from the 17th
// ski day). The Espot calendar still opens on Sat 5 Dec, so the table keeps
// the later day and the text names the conflict. Corrections: Ripollès season
// pass 455 EUR / 387 EUR to 8 Dec (Vallter and Vall de Núria rates pages; was
// 495 / 420), Vallter day pass 29 / 35 EUR (children 23 / 26.50; was 30 /
// 36.50 and 24 / 27.50). Past offers turned past tense: Alp2500 (950 -> 1,090)
// and Masella (730 -> 840) ended 22 Nov, Tot Nòrdic 131 EUR before 15 Nov.
// New row: the Pirineu365 season pass for the six FGC resorts, 730 EUR.
// Masella, Port del Comte and Tavascan still give no opening date.
// 25 Nov 2026 (ci-fonts + ci-edicio re-read, curl, ~01:00 CET; docs/SEO_EXPERIMENTS.md):
// - Baqueira's news of 24 Nov 2026: "La estación pospone la apertura prevista
//   para el sábado 28 de noviembre y anunciará la nueva fecha en función de
//   las condiciones de nieve en pistas". No new date; the closing day (4 Apr
//   2027) is from its 11 Nov item. Its status page and PIRINEU365's Infoneu
//   show no figures yet; Port del Comte: "ACCÉS TANCAT", "KM. ESQUIABLES 0,0 km".
// - The six FGC "Calendari de l'estació" tables are unchanged (4 Dec, Espot 5
//   Dec, Vall de Núria 4-8, 12-13, from 19; all to 4 Apr). Day passes and season
//   passes re-read on every FGC rates page, Baqueira, Masella and Port del
//   Comte: unchanged. FGC's practical-information pages now carry 2026-27 bus
//   dates: ALSA Ski Bus Port Ainé 05/12/2026-28/03/2027, Espot 26/12/2026-
//   28/04/2027; La Molina's Ski Tren 53 EUR, Sagalés Ski Bus prices without dates.
// - Vallter, 24 Nov: Telecadira Enric Planella closed ("la seva reparació no és
//   viable"), prices frozen; its technical sheet still says 14,15 km.
// - La Molina's "informacio-tecnica" and "planol-pistes-fitxa-tecnica" pages
//   are 404: sources moved to "informacio-practica" and "planol-de-pistes".
// Not re-read (dated where they appear): Guils, Tuixent-La Vansa (Tot Nòrdic),
// Bus Blanc, TEISA, Sagalés dates.
const VERIFIED = "2026-11-25";

const SOURCES: B2Source[] = [
  { name: "Baqueira Beret — «Baqueira Beret activa el invierno en pleno verano» (28/07/2026)", url: "https://www.baqueira.es/es/noticia/baqueira-beret-activa-el-invierno-en-pleno-verano", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret invierte 24 millones de euros en el nuevo Mirador y la renovación total de Baqueira 1800 (11/11/2026)", url: "https://www.baqueira.es/es/noticia/baqueira-beret-invierte-24-millones-de-euros-en-el-nuevo-mirador-y-la-renovacion-total-de", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret prepara el inicio de temporada a la espera de las próximas nevadas (24/11/2026)", url: "https://www.baqueira.es/es/noticia/baqueira-beret-prepara-el-inicio-de-temporada-la-espera-de-las-proximas-nevadas", publisher: "Baqueira Beret" },
  { name: "Vallter tanca el Telecadira Enric Planella (24/11/2026)", url: "https://pirineu365.cat/noticia/vallter-tanca-el-telecadira-enric-planella/", publisher: "FGC (PIRINEU365)" },
  { name: "Vallter — plànol de pistes i fitxa tècnica", url: "https://pirineu365.cat/vallter/estacio/planol-de-pistes/", publisher: "FGC (PIRINEU365)" },
  { name: "Pirineu365 presenta la temporada d'hivern 2026-2027 amb el nou 'Dia de l'esquiador' (06/11/2026)", url: "https://pirineu365.cat/noticia/pirineu365-presenta-la-temporada-dhivern-2026-2027-amb-el-nou-dia-de-lesquiador-i-una-botiga-digital-unificada/", publisher: "FGC (PIRINEU365)" },
  { name: "Vall de Núria — tarifes (forfet de temporada Ripollès i Pirineu365)", url: "https://pirineu365.cat/valldenuria/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "Vallter — tarifas (forfait de día y Temporada Ripollès)", url: "https://pirineu365.cat/es/vallter/estacion/tarifas/", publisher: "FGC (PIRINEU365)" },
  { name: "Baqueira Beret — tarifas temporada 26-27", url: "https://www.baqueira.es/es/tarifas", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret — datos técnicos", url: "https://www.baqueira.es/es/datos-tecnicos", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret — preguntas frecuentes", url: "https://www.baqueira.es/es/faqs", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret — cómo llegar", url: "https://www.baqueira.es/es/como-llegar", publisher: "Baqueira Beret" },
  { name: "La Molina — tarifes", url: "https://pirineu365.cat/lamolina/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "La Molina — plànol de pistes i fitxa tècnica", url: "https://pirineu365.cat/lamolina/estacio/planol-de-pistes/", publisher: "FGC (PIRINEU365)" },
  { name: "La Molina — informació pràctica i transport (calendari de l'estació 2026-27)", url: "https://pirineu365.cat/lamolina/estacio/informacio-practica/", publisher: "FGC (PIRINEU365)" },
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
  { name: "PIRINEU365 — webcams de les sis estacions", url: "https://pirineu365.cat/webcams-pirineu365/", publisher: "FGC (PIRINEU365)" },
  { name: "Baqueira Beret — webcams", url: "https://www.baqueira.es/es/webcams", publisher: "Baqueira Beret" },
  { name: "Masella — webcams", url: "https://www.masella.com/ca/webcam", publisher: "Masella" },
  { name: "Port del Comte — webcams i meteo", url: "https://portdelcomte.net/webcams-i-meteo/", publisher: "Port del Comte" },
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
      "Baqueira ha ajornat l'obertura del 28 de novembre; la Molina marca el 4 de desembre: les deu estacions d'esquí de Catalunya 2026-27, amb forfets i accés.",
    excerpt:
      "Quan obre cada estació el 2026-27 (Baqueira ha ajornat el 28 de novembre; FGC, des del 4 de desembre) i totes en una taula: quilòmetres, forfet de dia i com arribar-hi sense cotxe.",
  },
  es: {
    path: "guias/estaciones-esqui-cataluna",
    title: "Estaciones de esquí de Cataluña 2026-2027: apertura, precios del forfait y pistas abiertas",
    seoTitle: "Estaciones de esquí Cataluña 2026-27: apertura y forfait",
    seoDescription:
      "Baqueira aplaza su apertura del 28 de noviembre; La Molina marca el 4 de diciembre: las 10 estaciones de esquí de Cataluña 2026-27, con forfaits y acceso.",
    excerpt:
      "Cuándo abre cada estación en 2026-27 (Baqueira ha aplazado el 28 de noviembre; FGC, desde el 4 de diciembre) y todas en una tabla: kilómetros, forfait de día y cómo llegar sin coche.",
  },
  en: {
    path: "guides/ski-resorts-catalonia",
    title: "Ski resorts in Catalonia 2026-2027: opening dates, lift pass prices and open runs",
    seoTitle: "Ski resorts in Catalonia 2026-27: opening, lift passes",
    seoDescription:
      "Baqueira has postponed its 28 November opening; La Molina marks 4 December: Catalonia's ten ski resorts for 2026-27, with lift pass prices and access.",
    excerpt:
      "When each resort opens in 2026-27 (Baqueira has postponed 28 November, FGC from 4 December) and all of them in one table: kilometres, day pass and car-free access.",
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
    day: { ca: "29 € baixa / 35 € alta", es: "29 € baja / 35 € alta", en: "€29 low / €35 high season" },
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
 * Planned opening and last day, 2026-27. Baqueira's opening was postponed on
 * 24 Nov 2026 (no new date; closing day from its 11 Nov item); the five FGC resorts from the "Calendari de l'estació" on each one's
 * practical-information page, read 30-31 Oct and 5 Nov 2026 (the first day marked open and
 * the last). Rows without a date say so: nothing is estimated.
 */
/** The same planned first days as ISO dates, for pages that quote them (the December hub). */
export const SKI_OPENING_2026 = {
  // Baqueira planned 28 Nov 2026 and postponed on 24 Nov: no date until it announces one.
  /** La Molina, Vallter, Port Ainé, Boí Taüll and (from 5 Nov 2026) Vall de Núria. */
  fgc: "2026-12-04",
  espot: "2026-12-05",
} as const;

const OPENING: Record<Locale, string[][]> = {
  ca: [
    ["Baqueira Beret", "Ajornada (estava prevista el dissabte 28 de novembre de 2026); nova data per anunciar", "4 d'abril de 2027 (anunci de l'11 de novembre)"],
    ["La Molina", "Divendres 4 de desembre de 2026", "4 d'abril de 2027"],
    ["Vallter", "Divendres 4 de desembre de 2026", "4 d'abril de 2027"],
    ["Port Ainé", "Divendres 4 de desembre de 2026", "4 d'abril de 2027"],
    ["Boí Taüll", "Divendres 4 de desembre de 2026", "4 d'abril de 2027"],
    ["Espot", "Dissabte 5 de desembre de 2026", "4 d'abril de 2027"],
    ["Masella", "Sense data anunciada", "—"],
    ["Vall de Núria", "Divendres 4 de desembre de 2026", "4 d'abril de 2027"],
    ["Port del Comte", "Sense data anunciada", "—"],
    ["Tavascan", "Sense data anunciada (pistes alpines tancades el 2025-26)", "—"],
  ],
  es: [
    ["Baqueira Beret", "Aplazada (estaba prevista el sábado 28 de noviembre de 2026); nueva fecha por anunciar", "4 de abril de 2027 (anuncio del 11 de noviembre)"],
    ["La Molina", "Viernes 4 de diciembre de 2026", "4 de abril de 2027"],
    ["Vallter", "Viernes 4 de diciembre de 2026", "4 de abril de 2027"],
    ["Port Ainé", "Viernes 4 de diciembre de 2026", "4 de abril de 2027"],
    ["Boí Taüll", "Viernes 4 de diciembre de 2026", "4 de abril de 2027"],
    ["Espot", "Sábado 5 de diciembre de 2026", "4 de abril de 2027"],
    ["Masella", "Sin fecha anunciada", "—"],
    ["Vall de Núria", "Viernes 4 de diciembre de 2026", "4 de abril de 2027"],
    ["Port del Comte", "Sin fecha anunciada", "—"],
    ["Tavascan", "Sin fecha anunciada (pistas alpinas cerradas en 2025-26)", "—"],
  ],
  en: [
    ["Baqueira Beret", "Postponed (it was planned for Saturday 28 November 2026); new date to be announced", "4 April 2027 (announced on 11 November)"],
    ["La Molina", "Friday 4 December 2026", "4 April 2027"],
    ["Vallter", "Friday 4 December 2026", "4 April 2027"],
    ["Port Ainé", "Friday 4 December 2026", "4 April 2027"],
    ["Boí Taüll", "Friday 4 December 2026", "4 April 2027"],
    ["Espot", "Saturday 5 December 2026", "4 April 2027"],
    ["Masella", "Not announced", "—"],
    ["Vall de Núria", "Friday 4 December 2026", "4 April 2027"],
    ["Port del Comte", "Not announced", "—"],
    ["Tavascan", "Not announced (alpine runs closed in 2025-26)", "—"],
  ],
};

const SEASON_PASS: Record<Locale, string[][]> = {
  ca: [
    ["Baqueira Beret", "1.400 € (la venda anticipada a 1.300 € va acabar l'1 de novembre)"],
    ["Alp2500 (la Molina + Masella)", "1.090 € (el preu d'oferta, 950 € fins al 22 de novembre, ja ha acabat)"],
    ["Masella", "840 € (el preu d'oferta, 730 € fins al 22 de novembre, ja ha acabat)"],
    ["La Molina", "600 € fins al 8 de desembre; 690 € després"],
    ["Boí Taüll", "530 € fins al 8 de desembre; 660 € després"],
    ["Port del Comte", "595 € d'oferta (preu original, 695 €); a la venda des de l'1 de novembre"],
    ["Pallars (Espot + Port Ainé)", "436 € fins al 8 de desembre; 545 € després"],
    ["Ripollès (Vallter + Vall de Núria)", "387 € fins al 8 de desembre; 455 € després"],
    ["Pirineu365 (les sis estacions d'FGC)", "730 €"],
    ["Esquí nòrdic: Tot Nòrdic, les set estacions de la Mancomunitat (esquí + raquetes)", "175 € (el preu de 131 € era fins al 15 de novembre)"],
  ],
  es: [
    ["Baqueira Beret", "1.400 € (la venta anticipada a 1.300 € terminó el 1 de noviembre)"],
    ["Alp2500 (La Molina + Masella)", "1.090 € (el precio de oferta, 950 € hasta el 22 de noviembre, ya terminó)"],
    ["Masella", "840 € (el precio de oferta, 730 € hasta el 22 de noviembre, ya terminó)"],
    ["La Molina", "600 € hasta el 8 de diciembre; 690 € después"],
    ["Boí Taüll", "530 € hasta el 8 de diciembre; 660 € después"],
    ["Port del Comte", "595 € de oferta (precio original, 695 €); a la venta desde el 1 de noviembre"],
    ["Pallars (Espot + Port Ainé)", "436 € hasta el 8 de diciembre; 545 € después"],
    ["Ripollès (Vallter + Vall de Núria)", "387 € hasta el 8 de diciembre; 455 € después"],
    ["Pirineu365 (las seis estaciones de FGC)", "730 €"],
    ["Esquí nórdico: Tot Nòrdic, las siete estaciones de la Mancomunitat (esquí + raquetas)", "175 € (el precio de 131 € era hasta el 15 de noviembre)"],
  ],
  en: [
    ["Baqueira Beret", "€1,400 (the €1,300 early price ended on 1 November)"],
    ["Alp2500 (La Molina + Masella)", "€1,090 (the €950 offer price, until 22 November, has ended)"],
    ["Masella", "€840 (the €730 offer price, until 22 November, has ended)"],
    ["La Molina", "€600 until 8 December; €690 after"],
    ["Boí Taüll", "€530 until 8 December; €660 after"],
    ["Port del Comte", "€595 offer price (regular €695); on sale from 1 November"],
    ["Pallars (Espot + Port Ainé)", "€436 until 8 December; €545 after"],
    ["Ripollès (Vallter + Vall de Núria)", "€387 until 8 December; €455 after"],
    ["Pirineu365 (all six FGC resorts)", "€730"],
    ["Cross-country: Tot Nòrdic, the seven Mancomunitat stations (skiing + snowshoes)", "€175 (the €131 price was until 15 November)"],
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
    lead: "**Baqueira Beret ha ajornat l'obertura que tenia prevista per al dissabte 28 de novembre** (nota del 24 de novembre) i anunciarà la nova data segons la neu. Les estacions d'FGC marquen al seu calendari el **divendres 4 de desembre** (la Molina, Vallter, Port Ainé, Boí Taüll i la Vall de Núria) i el dissabte 5 (Espot); Masella encara no n'ha donat. Hi ha deu estacions d'esquí alpí: la més gran és Baqueira (169 km), i en tren des de Barcelona s'arriba a **la Molina** i a la **Vall de Núria**. El forfet de dia d'adult va dels **29 € de Vallter** (temporada baixa) als **74 € de Baqueira**.",
    tableTitle: "Comparativa de les estacions d'esquí de Catalunya 2026-2027",
    tableCaption: "Estacions d'esquí alpí de Catalunya: pistes, forfet de dia d'adult i accés sense cotxe",
    headers: ["Estació", "Comarca", "Km", "Altitud (m)", "Forfet d'1 dia, adult", "Sense cotxe"],
    tableNote: "Quilòmetres i altituds de la fitxa tècnica de cada estació. Preus de les pàgines de tarifes, revisades el 25/11/2026 (a Vallter, el 31/10 eren 30 i 36,50 €; la seva fitxa tècnica encara dona 14,15 km després que el 24/11 tanqués un telecadira). Baqueira els etiqueta «temporada 26-27»; Boí Taüll no indica la temporada. Port del Comte mostra dues taules amb imports diferents.",
    openTitle: "Obertura de les estacions d'esquí 2026-2027: quan obre cada estació",
    open: [
      "**Baqueira Beret ha ajornat l'obertura que tenia prevista per al dissabte 28 de novembre.** La nota de l'estació del 24 de novembre de 2026 diu: «La estación pospone la apertura prevista para el sábado 28 de noviembre y anunciará la nueva fecha en función de las condiciones de nieve en pistas». Les previsions apunten a nevades i a un descens de les temperatures a la Val d'Aran i a les Valls d'Àneu, i els equips avaluaran la neu acumulada a les pistes per decidir quan pot començar la temporada. El tancament que va anunciar l'11 de novembre és el diumenge 4 d'abril de 2027, també «siempre que las condiciones lo permitan»; la nota del 24 no el torna a dir. Per saber la data nova: l'Oficina d'Informació de Baqueira 1500 atén de dilluns a divendres de 8.30 a 14.30 h, i Reservas Baqueira Beret, al 973 63 90 00, cada dia de 8 a 18 h (segons la mateixa nota).",
      "**Les estacions d'esquí alpí d'FGC ja tenen calendari:** al web de PIRINEU365, la Molina, Vallter, Port Ainé, Boí Taüll i la Vall de Núria marquen l'obertura el **divendres 4 de desembre de 2026**, i Espot, el **dissabte 5**; totes, fins al **diumenge 4 d'abril de 2027**. El de la Vall de Núria, que el 31 d'octubre encara era el de la temporada passada, marca obert del 4 al 8 de desembre (el pont), el 12 i el 13 i cada dia a partir del 19 (calendaris consultats el 25 de novembre de 2026). La nota amb què FGC va presentar la temporada, el 6 de novembre, diu que les sis estacions obriran «del 4 de desembre al 4 d'abril», amb 189 km esquiables i 180 pistes; el calendari d'Espot, però, continua marcant com a primer dia el dissabte 5.",
      "**Vallter tanca un telecadira.** El 24 de novembre l'estació va explicar que el telecadira Enric Planella, en servei fa 48 anys, «no ha superat les darreres proves de càrrega» i que «la seva reparació no és viable»: la pista del Xalet quedarà habilitada com a itinerari d'esquí de muntanya. També diu que ha congelat els preus dels forfets, que es mantenen respecte als de la temporada anterior. La fitxa tècnica de Vallter continua dient 14,15 km esquiables (consultada el 25 de novembre): no hi ha una xifra nova després del tancament.",
      "**Masella, Port del Comte i Tavascan no han anunciat la data** (consultat el 25 de novembre de 2026). Masella diu només que les seves oficines fan l'horari de cap de setmana «fins a data d'inauguració de la temporada 2026-27»; la pàgina de pistes de Port del Comte mostra «tancat» i 0,0 km esquiables.",
      "Les dates depenen de la neu i del fred per fabricar-ne. La temporada passada, FGC va avançar l'obertura de la **Molina** al **29 de novembre de 2025**, i les altres cinc estacions d'FGC van obrir el **4 de desembre de 2025**.",
    ],
    openCaption: "Obertura prevista de les estacions d'esquí alpí de Catalunya, temporada 2026-2027",
    openHeaders: ["Estació", "Obertura prevista", "Últim dia previst"],
    openNote: "Baqueira: notes de l'estació del 24/11/2026 (ajornament) i de l'11/11/2026 (tancament, «siempre que las condiciones lo permitan»). Estacions d'FGC: el «Calendari de l'estació» de la pàgina d'informació pràctica de cada una. Consultat el 25/11/2026. Totes les dates depenen de la neu.",
    passTitle: "Forfet de temporada 2026-2027",
    passCaption: "Forfet de temporada d'adult, temporada 2026-2027",
    passHeaders: ["Estació o domini", "Preu adult"],
    passNote: "Preus de les webs oficials, consultats el 25/11/2026. Les ofertes d'FGC (la Molina, Boí Taüll, Pallars i Ripollès) acaben el 8 de desembre; les d'Alp2500 i Masella van acabar el 22 de novembre. Ripollès: el 31/10 es publicava a 420 i 495 €. El Pirineu365 val per a les sis estacions d'FGC. Tot Nòrdic: preu de Tuixent-La Vansa. L'edat d'adult canvia (FGC, 25 a 64 anys; Alp2500, 12 a 64).",
    pricesTitle: "Preus del forfet: el que cal saber abans de comprar",
    prices: [
      "**Compra en línia.** A la Molina, Vallter, Espot i Boí Taüll comprar a la taquilla costa **3 € més** (a Port Ainé, **5 € més**); a Masella, també 3 € més. Baqueira ven el forfet de dia amb la targeta recarregable BaqueiraTICKET, i amb el BaqueiraPASS el dia d'adult baixa de 74 a 70 €.",
      "**Infants.** El forfet de dia infantil costa 49 € a Baqueira, 43 € a Masella (en línia), 36 € a la Molina i Boí Taüll, 30,50–33,50 € a Port Ainé, 28,50 € a Espot i 23–26,50 € a Vallter; les franges d'edat canvien segons l'estació.",
      "**Temporada alta i baixa.** A Vallter i Port Ainé el preu de dia canvia segons el calendari: a Port Ainé, la temporada alta 2026-27 és del 26 al 30 de desembre, el 2 i 3 de gener i els caps de setmana de febrer.",
      "**Abonaments que comparteixen estacions.** El forfet Alp2500 val per a la Molina i Masella (145 km junts); el Temporada Pallars, per a Espot i Port Ainé; el Temporada Ripollès, per a Vallter i la Vall de Núria; el Pirineu365 (730 €), per a les sis d'FGC.",
      "**Dimecres a meitat de preu.** Aquesta temporada els dimecres són el «Dia de l'esquiador» a les sis estacions d'FGC: amb el FlexiPass, tots els forfets surten a meitat de preu. El FlexiPass es paga per ús, amb una quota anual de 15 € (renovació) o 25 € (alta nova), i a partir del 17è dia d'esquí la resta de la temporada és gratis, segons la nota de PIRINEU365 del 6 de novembre de 2026.",
    ],
    getTitle: "Com arribar a les pistes en tren o en bus",
    getIntro: "FGC ja publica les dates de l'ALSA Ski Bus de la temporada 2026-2027 a Port Ainé (del 5 de desembre de 2026 al 28 de març de 2027) i a Espot (del 26 de desembre al 28 d'abril de 2027), consultades el 25 de novembre de 2026. A la Molina, la web només dona els preus dels Ski Bus, sense dates; per a Masella (Bus Blanc), Vallter (TEISA) i Baqueira no vam trobar dates 2026-27 el 31 d'octubre, i no s'han tornat a mirar.",
    get: [
      "**La Molina:** té estació pròpia a la línia **R3**. El **Ski Tren**, que es compra a Renfe/Rodalies, costa 53 € (adult o jove; 41,50 € infantil) i inclou tren d'anada i tornada, bus intern, forfet d'1 dia i assegurança. També hi ha **Ski Bus** de Sagalés amb bus, forfet i assegurança: la Molina, 66 € dimecres i divendres i 67 € dissabtes i diumenges; la Molina + Masella, 80 € de dimarts a diumenge. El web de l'estació (25 de novembre) en dona els preus, però no les dates.",
      `**Vall de Núria:** R3 fins a Ribes-Enllaç i el **Cremallera**; no hi arriba cap carretera. Detalls a ${b2link("nuria", "ca", "la guia de Núria")}.`,
      "**Espot i Port Ainé:** l'**ALSA Ski Bus** (bus d'anada i tornada + forfet d'1 dia) els dissabtes, diumenges i festius, excepte el 25 de desembre i l'1 de gener. A Port Ainé, del 5 de desembre de 2026 al 28 de març de 2027: 48,50 € des de Lleida i Balaguer i 43,50 € des de Tremp, la Pobla, Sort i Rialp. A Espot, del 26 de desembre de 2026 al 28 d'abril de 2027 (les dates que publica la seva web): 43,55 € des de Lleida, 38,70 € des de Balaguer, 36,05 € des de Tremp i 32,30 € des de la Pobla de Segur. El Taxi de la Neu (2 € per trajecte) va de Sort a les dues estacions, amb reserva el dia abans abans de les 19 h.",
      "**Masella:** el Ski Bus La Molina + Masella de Sagalés i, dins la Cerdanya, el **Bus Blanc** del Consell Comarcal. La temporada passada (2025-26) va circular els caps de setmana i festius escolars des del 6 de desembre, a 2 €; el calendari 2026-27 no estava publicat el 31 d'octubre de 2026.",
      "**Boí Taüll:** el **Bus de la Neu**, a 1 €, els caps de setmana i festius des de Vilaller, amb parades al Pont de Suert i als pobles de la vall; la web en dona un «calendari provisional» sense dir de quina temporada és.",
      "**Vallter:** TEISA publica un bus d'esquí Girona–Banyoles–Olot–Camprodon–Setcases–Vallter els dissabtes, diumenges i festius de gener a març; el full penjat (31 d'octubre de 2026) encara porta les tarifes de 2023-24. A l'estació, FGC només anuncia un bus llançadora gratuït entre els aparcaments.",
      "**Baqueira Beret:** busos d'ALSA fins a Vielha i, des d'allà, el bus local línia VA fins a l'estació.",
    ],
    trainNote: `Des del 16 de novembre, per obres d'Adif entre la Garriga i Figaró, l'R3 no circula en aquest tram i Renfe hi posa un servei alternatiu per carretera. L'avís de Rodalies (consultat el 25 de novembre de 2026) llista com a servei ferroviari l'R4 de l'Hospitalet a Fabra i Puig / Montcada Bifurcació i l'R3 de Sant Martí de Centelles a Puigcerdà, que circula amb el 50 % de les circulacions d'abans del 20 de gener. Mira'n horaris i punts de parada abans de sortir. Els horaris dels trens que pugen a la Molina són a la guia de ${b2link("cerdanya", "ca", "la Cerdanya sense cotxe")}.`,
    smallTitle: "Port del Comte i Tavascan",
    small: [
      "**Port del Comte**, al Solsonès, posa a la venda el forfet de temporada 2026-27 l'1 de novembre (595 € adult, d'oferta; preu original, 695 €). Encara no ha anunciat la data d'obertura (consultat el 25 de novembre de 2026; la seva pàgina de pistes diu «tancat»). Al seu web la temporada alta inclou tots els caps de setmana, el 7 i 8 de desembre, del 21 de desembre al 28 de febrer de 2027 i del 22 al 29 de març de 2027.",
      "**Tavascan** no va obrir les pistes alpines ni el telecadira la temporada 2025-26 i, a 25 de novembre de 2026, el seu web encara diu que no obriran aquella temporada i no explica què farà aquest hivern. El seu circuit nòrdic, d'uns dotze quilòmetres, és una de les set estacions de la Mancomunitat d'Esquí Nòrdic.",
    ],
    nordicTitle: "Esquí nòrdic i raquetes",
    nordic: [
      "Les set estacions de la Mancomunitat d'Esquí Nòrdic (Guils Fontanera, Aransa, Lles, Tuixent-La Vansa, Sant Joan de l'Erm, Tavascan i Virós-Vallferrera) comparteixen el forfet de temporada **Tot Nòrdic**: per a la temporada 2026-27, **175 €** per a adults (esquí + raquetes) si es compra després del 15 de novembre (abans, 131 €), segons Tuixent-La Vansa. El de només raquetes, Guils l'anunciava a **75 €** amb un 25 % de descompte fins al 17 de novembre; el 23 de novembre la seva pàgina encara mostrava aquest preu, així que confirma'l abans de comprar. Tuixent-La Vansa, Sant Joan de l'Erm i Tavascan encara no han anunciat la data d'obertura.",
      `Si no esquies, mira ${b2link("snow", "ca", "on veure neu sense esquiar i les rutes amb raquetes")}.`,
    ],
    snowTitle: "Pistes obertes avui: on mirar l'estat de la neu",
    snow: [
      "Cada estació publica cada dia les pistes obertes, el gruix de neu i els remuntadors en marxa: les sis d'FGC (la Molina, Vall de Núria, Vallter, Espot, Port Ainé i Boí Taüll) a l'[Infoneu de PIRINEU365](https://pirineu365.cat/infoneu-pirineu365/), Baqueira a «[Estado de la estación](https://www.baqueira.es/es/estado-de-la-estacion)» i Port del Comte a [la seva pàgina de pistes](https://portdelcomte.net/pistes/); Masella hi té càmeres web. Abans de l'obertura surten buits: el 25 de novembre l'Infoneu i la pàgina de Baqueira encara no donaven cap xifra i Port del Comte mostrava 0,0 km. Mira-ho el mateix matí: a principi i final de temporada canvia d'un dia per l'altre.",
      "Càmeres web oficials: [Baqueira Beret](https://www.baqueira.es/es/webcams), [les sis estacions d'FGC](https://pirineu365.cat/webcams-pirineu365/), [Masella](https://www.masella.com/ca/webcam) i [Port del Comte](https://portdelcomte.net/webcams-i-meteo/).",
      `Per saber si hi ha neu a terra a l'alta muntanya, fora de les pistes, mira ${b2link("snowNow", "ca", "el gruix de neu d'avui a les estacions meteorològiques del Meteocat")}.`,
    ],
    pickTitle: "Quina estació triar",
    pick: [
      "**Més quilòmetres:** Baqueira Beret (169 km) o el domini Alp2500, la Molina i Masella junts (145 km).",
      "**Sense cotxe des de Barcelona:** la Molina (R3 o Ski Bus) o la Vall de Núria (R3 i Cremallera).",
      "**Forfet de dia més barat:** Vallter (29 € en temporada baixa) i Espot (39 €).",
      "**Aprendre o anar amb nens petits:** la Vall de Núria i Vallter són petites i fàcils de controlar.",
    ],
    faq: [
      { question: "Quan obren les estacions d'esquí de Catalunya la temporada 2026-2027?", answer: "Encara no ha obert cap estació amb data ferma. Baqueira Beret va ajornar el 24 de novembre l'obertura que tenia prevista per al dissabte 28 de novembre de 2026 i anunciarà la nova data segons la neu. Les estacions d'FGC marquen al seu calendari el divendres 4 de desembre (la Molina, Vallter, Port Ainé, Boí Taüll i la Vall de Núria) i el dissabte 5 (Espot). Masella, Port del Comte i Tavascan encara no han donat data (consultat el 25 de novembre de 2026). Totes les dates depenen de la neu." },
      { question: "Quan obre Baqueira Beret el 2026?", answer: "Encara no té data. Tenia previst obrir el dissabte 28 de novembre de 2026, però el 24 de novembre va ajornar l'obertura i va dir que anunciarà la nova data «en función de las condiciones de nieve en pistas». El tancament que va anunciar l'11 de novembre és el 4 d'abril de 2027." },
      { question: "Quan obre la Molina la temporada 2026-2027?", answer: "El calendari de l'estació, al web de PIRINEU365, marca l'obertura el divendres 4 de desembre de 2026 i el tancament el 4 d'abril de 2027 (consultat el 25 de novembre de 2026). La temporada passada FGC la va avançar al 29 de novembre de 2025." },
      { question: "Quan obre Masella?", answer: "Masella encara no ha anunciat la data d'obertura de la temporada 2026-27 (consultat el 25 de novembre de 2026). El seu abonament de temporada d'adult costa 840 €; el preu d'oferta, 730 €, va acabar el 22 de novembre." },
      { question: "Quan obre Boí Taüll?", answer: "El calendari de l'estació marca l'obertura el divendres 4 de desembre de 2026 i el tancament el 4 d'abril de 2027 (consultat el 25 de novembre de 2026). La temporada passada va obrir el 4 de desembre de 2025." },
      { question: "Quan obre la Vall de Núria per esquiar?", answer: "El calendari de l'estació d'esquí, al web de PIRINEU365, marca obert del divendres 4 al dimarts 8 de desembre de 2026, el 12 i el 13 i cada dia a partir del 19, fins al 4 d'abril de 2027 (consultat el 25 de novembre de 2026). S'hi arriba amb l'R3 fins a Ribes-Enllaç i el Cremallera." },
      { question: "Quant costa el forfet de dia a Catalunya el 2026-27?", answer: "Per a un adult, de 29 € (Vallter en temporada baixa) a 74 € (Baqueira Beret). La Molina, 49 € en línia; Masella, 53 € en línia; Espot, 39 €; Port Ainé, de 42 a 46 €." },
      { question: "Hi ha forfets més barats entre setmana?", answer: "Sí, a les sis estacions d'FGC: aquesta temporada els dimecres són el «Dia de l'esquiador», i amb el FlexiPass tots els forfets surten a meitat de preu (nota de PIRINEU365 del 6 de novembre de 2026). A Vallter, a més, el forfet de dia dels dies feiners (temporada baixa) costa 29 €, i el dels caps de setmana i festius, 35 €." },
      { question: "Quan tanquen les estacions d'esquí de Catalunya?", answer: "Les sis estacions d'FGC marquen al calendari el diumenge 4 d'abril de 2027 com a últim dia de la temporada 2026-27 (consultat el 25 de novembre de 2026), i Baqueira va anunciar l'11 de novembre el tancament el mateix 4 d'abril, sempre que les condicions ho permetin. Masella, Port del Comte i Tavascan no han publicat cap data." },
      { question: "Com sé si hi ha neu i quines pistes són obertes avui?", answer: "Mira el part de cada estació el mateix matí: l'Infoneu de PIRINEU365 per a les sis d'FGC, «Estado de la estación» a Baqueira i la pàgina de pistes de Port del Comte; Masella, Baqueira i FGC tenen també càmeres web. Abans de l'obertura surten buits (25 de novembre de 2026). Els enllaços oficials són a la secció «Pistes obertes avui»." },
      { question: "Com s'arriba a les estacions d'esquí amb transport públic?", answer: "A la Molina amb l'R3 (Ski Tren, 53 € amb forfet d'1 dia) o amb el Ski Bus de Sagalés; a la Vall de Núria amb l'R3 i el Cremallera; a Port Ainé i Espot amb l'ALSA Ski Bus els caps de setmana i festius (Port Ainé des del 5 de desembre, Espot des del 26 de desembre de 2026); a Boí Taüll amb el Bus de la Neu des de Vilaller (1 €); a Baqueira amb ALSA fins a Vielha i el bus local VA. L'R3 té obres: consulta Rodalies abans de sortir." },
      { question: "Quina és l'estació d'esquí més gran de Catalunya?", answer: "Baqueira Beret, amb 169 km de pistes balisades. El domini Alp2500 (la Molina + Masella) en suma 145." },
      { question: "Es pot anar a esquiar en tren des de Barcelona?", answer: "Sí: a la Molina, que té estació a l'R3, i a la Vall de Núria amb l'R3 i el Cremallera. Durant les obres de l'R3 una part del recorregut es fa amb autobús (avís de Rodalies, 25 de novembre de 2026)." },
    ],
    verifiedNote: "Les dates i els preus d'esquí canvien cada temporada: comprova'ls al web de l'estació abans de comprar.",
  },
  es: {
    lead: "**Baqueira Beret ha aplazado la apertura que tenía prevista para el sábado 28 de noviembre** (nota del 24 de noviembre) y anunciará la nueva fecha según la nieve. Las estaciones de FGC marcan en su calendario el **viernes 4 de diciembre** (La Molina, Vallter, Port Ainé, Boí Taüll y la Vall de Núria) y el sábado 5 (Espot); Masella aún no ha dado fecha. Hay diez estaciones de esquí alpino: la más grande es Baqueira (169 km), y en tren desde Barcelona se llega a **La Molina** y a la **Vall de Núria**. El forfait de día de adulto va de los **29 € de Vallter** (temporada baja) a los **74 € de Baqueira**.",
    tableTitle: "Comparativa de las estaciones de esquí de Cataluña 2026-2027",
    tableCaption: "Estaciones de esquí alpino de Cataluña: pistas, forfait de día de adulto y acceso sin coche",
    headers: ["Estación", "Comarca", "Km", "Altitud (m)", "Forfait 1 día, adulto", "Sin coche"],
    tableNote: "Kilómetros y altitudes de la ficha técnica de cada estación. Precios de las páginas de tarifas, revisadas el 25/11/2026 (en Vallter, el 31/10 eran 30 y 36,50 €; su ficha técnica sigue dando 14,15 km tras cerrar el 24/11 un telesilla). Baqueira los etiqueta «temporada 26-27»; Boí Taüll no indica la temporada. Port del Comte muestra dos tablas con importes distintos.",
    openTitle: "Apertura de las estaciones de esquí 2026-2027: cuándo abre cada estación",
    open: [
      "**Baqueira Beret ha aplazado la apertura que tenía prevista para el sábado 28 de noviembre.** La nota de la estación del 24 de noviembre de 2026 dice: «La estación pospone la apertura prevista para el sábado 28 de noviembre y anunciará la nueva fecha en función de las condiciones de nieve en pistas». Las previsiones apuntan a nevadas y a un descenso de las temperaturas en el Valle de Arán y las Valls d'Àneu, y sus equipos evaluarán la nieve acumulada en las pistas para decidir cuándo puede empezar la temporada. El cierre que anunció el 11 de noviembre es el domingo 4 de abril de 2027, también «siempre que las condiciones lo permitan»; la nota del 24 no lo repite. Para saber la fecha nueva: la Oficina de Información de Baqueira 1500 atiende de lunes a viernes de 8.30 a 14.30 h, y Reservas Baqueira Beret, en el 973 63 90 00, todos los días de 8 a 18 h (según la misma nota).",
      "**Las estaciones de esquí alpino de FGC ya tienen calendario:** en la web de PIRINEU365, La Molina, Vallter, Port Ainé, Boí Taüll y la Vall de Núria marcan la apertura el **viernes 4 de diciembre de 2026**, y Espot, el **sábado 5**; todas, hasta el **domingo 4 de abril de 2027**. El de la Vall de Núria, que el 31 de octubre aún era el de la temporada pasada, marca abierto del 4 al 8 de diciembre (el puente), el 12 y el 13 y cada día a partir del 19 (calendarios consultados el 25 de noviembre de 2026). La nota con la que FGC presentó la temporada, el 6 de noviembre, dice que las seis estaciones abrirán «del 4 de desembre al 4 d'abril» (del 4 de diciembre al 4 de abril), con 189 km esquiables y 180 pistas; el calendario de Espot, sin embargo, sigue marcando como primer día el sábado 5.",
      "**Vallter cierra un telesilla.** El 24 de noviembre la estación explicó que el telesilla Enric Planella, en servicio desde hace 48 años, «no ha superat les darreres proves de càrrega» (no ha superado las últimas pruebas de carga) y que «la seva reparació no és viable» (su reparación no es viable): la pista del Xalet quedará habilitada como itinerario de esquí de montaña. También dice que ha congelado los precios de los forfaits, que se mantienen respecto a los de la temporada anterior. La ficha técnica de Vallter sigue diciendo 14,15 km esquiables (consultada el 25 de noviembre): no hay una cifra nueva tras el cierre.",
      "**Masella, Port del Comte y Tavascan no han anunciado la fecha** (consultado el 25 de noviembre de 2026). Masella solo dice que sus oficinas hacen el horario de fin de semana «fins a data d'inauguració de la temporada 2026-27» (hasta la fecha de inauguración); la página de pistas de Port del Comte muestra «cerrado» y 0,0 km esquiables.",
      "Las fechas dependen de la nieve y del frío para fabricarla. La temporada pasada, FGC adelantó la apertura de **La Molina** al **29 de noviembre de 2025**, y las otras cinco estaciones de FGC abrieron el **4 de diciembre de 2025**.",
    ],
    openCaption: "Apertura prevista de las estaciones de esquí alpino de Cataluña, temporada 2026-2027",
    openHeaders: ["Estación", "Apertura prevista", "Último día previsto"],
    openNote: "Baqueira: notas de la estación del 24/11/2026 (aplazamiento) y del 11/11/2026 (cierre, «siempre que las condiciones lo permitan»). Estaciones de FGC: el «Calendari de l'estació» de la página de información práctica de cada una. Consultado el 25/11/2026. Todas las fechas dependen de la nieve.",
    passTitle: "Forfait de temporada 2026-2027",
    passCaption: "Forfait de temporada de adulto, temporada 2026-2027",
    passHeaders: ["Estación o dominio", "Precio adulto"],
    passNote: "Precios de las webs oficiales, consultados el 25/11/2026. Las ofertas de FGC (La Molina, Boí Taüll, Pallars y Ripollès) acaban el 8 de diciembre; las de Alp2500 y Masella terminaron el 22 de noviembre. Ripollès: el 31/10 se publicaba a 420 y 495 €. El Pirineu365 vale para las seis estaciones de FGC. Tot Nòrdic: precio de Tuixent-La Vansa. Edad de adulto: FGC, 25 a 64 años; Alp2500, 12 a 64.",
    pricesTitle: "Precios del forfait: lo que hay que saber antes de comprar",
    prices: [
      "**Compra online.** En La Molina, Vallter, Espot y Boí Taüll comprar en taquilla cuesta **3 € más** (en Port Ainé, **5 € más**); en Masella, también 3 € más. Baqueira vende el forfait de día con la tarjeta recargable BaqueiraTICKET, y con el BaqueiraPASS el día de adulto baja de 74 a 70 €.",
      "**Niños.** El forfait de día infantil cuesta 49 € en Baqueira, 43 € en Masella (online), 36 € en La Molina y Boí Taüll, 30,50–33,50 € en Port Ainé, 28,50 € en Espot y 23–26,50 € en Vallter; las franjas de edad cambian según la estación.",
      "**Temporada alta y baja.** En Vallter y Port Ainé el precio de día cambia según el calendario: en Port Ainé, la temporada alta 2026-27 es del 26 al 30 de diciembre, el 2 y 3 de enero y los fines de semana de febrero.",
      "**Abonos que comparten estaciones.** El forfait Alp2500 vale para La Molina y Masella (145 km juntas); el Temporada Pallars, para Espot y Port Ainé; el Temporada Ripollès, para Vallter y la Vall de Núria; el Pirineu365 (730 €), para las seis de FGC.",
      "**Miércoles a mitad de precio.** Esta temporada los miércoles son el «Dia de l'esquiador» (día del esquiador) en las seis estaciones de FGC: con el FlexiPass, todos los forfaits salen a mitad de precio. El FlexiPass se paga por uso, con una cuota anual de 15 € (renovación) o 25 € (alta nueva), y a partir del 17.º día de esquí el resto de la temporada es gratis, según la nota de PIRINEU365 del 6 de noviembre de 2026.",
    ],
    getTitle: "Cómo llegar a las pistas en tren o en bus",
    getIntro: "FGC ya publica las fechas del ALSA Ski Bus de la temporada 2026-2027 en Port Ainé (del 5 de diciembre de 2026 al 28 de marzo de 2027) y en Espot (del 26 de diciembre al 28 de abril de 2027), consultadas el 25 de noviembre de 2026. En La Molina, la web solo da los precios de los Ski Bus, sin fechas; para Masella (Bus Blanc), Vallter (TEISA) y Baqueira no encontramos fechas 2026-27 el 31 de octubre, y no se han vuelto a mirar.",
    get: [
      "**La Molina:** tiene estación propia en la línea **R3**. El **Ski Tren**, que se compra en Renfe/Rodalies, cuesta 53 € (adulto o joven; 41,50 € infantil) e incluye tren de ida y vuelta, bus interno, forfait de 1 día y seguro. También hay **Ski Bus** de Sagalés con bus, forfait y seguro: La Molina, 66 € miércoles y viernes y 67 € sábados y domingos; La Molina + Masella, 80 € de martes a domingo. La web de la estación (25 de noviembre) da los precios, pero no las fechas.",
      `**Vall de Núria:** R3 hasta Ribes-Enllaç y el **Cremallera**; no llega ninguna carretera. Detalles en ${b2link("nuria", "es", "la guía de Núria")}.`,
      "**Espot y Port Ainé:** el **ALSA Ski Bus** (bus de ida y vuelta + forfait de 1 día) los sábados, domingos y festivos, excepto el 25 de diciembre y el 1 de enero. En Port Ainé, del 5 de diciembre de 2026 al 28 de marzo de 2027: 48,50 € desde Lleida y Balaguer y 43,50 € desde Tremp, La Pobla, Sort y Rialp. En Espot, del 26 de diciembre de 2026 al 28 de abril de 2027 (las fechas que publica su web): 43,55 € desde Lleida, 38,70 € desde Balaguer, 36,05 € desde Tremp y 32,30 € desde La Pobla de Segur. El Taxi de la Neu (2 € por trayecto) va de Sort a las dos estaciones, con reserva el día antes antes de las 19 h.",
      "**Masella:** el Ski Bus La Molina + Masella de Sagalés y, dentro de la Cerdanya, el **Bus Blanc** del Consell Comarcal. La temporada pasada (2025-26) circuló los fines de semana y festivos escolares desde el 6 de diciembre, a 2 €; el calendario 2026-27 no estaba publicado el 31 de octubre de 2026.",
      "**Boí Taüll:** el **Bus de la Neu**, a 1 €, los fines de semana y festivos desde Vilaller, con paradas en El Pont de Suert y los pueblos del valle; la web da un «calendari provisional» sin decir de qué temporada es.",
      "**Vallter:** TEISA publica un bus de esquí Girona–Banyoles–Olot–Camprodon–Setcases–Vallter los sábados, domingos y festivos de enero a marzo; la hoja colgada (31 de octubre de 2026) aún lleva las tarifas de 2023-24. En la estación, FGC solo anuncia un bus lanzadera gratuito entre los aparcamientos.",
      "**Baqueira Beret:** autobuses de ALSA hasta Vielha y, desde allí, el bus local línea VA hasta la estación.",
    ],
    trainNote: `Desde el 16 de noviembre, por obras de Adif entre La Garriga y Figaró, la R3 no circula en ese tramo y Renfe pone allí un servicio alternativo por carretera. El aviso de Rodalies (consultado el 25 de noviembre de 2026) lista como servicio ferroviario la R4 de L'Hospitalet a Fabra i Puig / Montcada Bifurcació y la R3 de Sant Martí de Centelles a Puigcerdà, que circula con el 50 % de las circulaciones de antes del 20 de enero. Mira horarios y puntos de parada antes de salir. Los horarios de los trenes que suben a La Molina están en la guía de ${b2link("cerdanya", "es", "la Cerdanya sin coche")}.`,
    smallTitle: "Port del Comte y Tavascan",
    small: [
      "**Port del Comte**, en el Solsonès, pone a la venta el forfait de temporada 2026-27 el 1 de noviembre (595 € adulto, de oferta; precio original, 695 €). Aún no ha anunciado la fecha de apertura (consultado el 25 de noviembre de 2026; su página de pistas dice «cerrado»). En su web la temporada alta incluye todos los fines de semana, el 7 y 8 de diciembre, del 21 de diciembre al 28 de febrero de 2027 y del 22 al 29 de marzo de 2027.",
      "**Tavascan** no abrió las pistas alpinas ni el telesilla en la temporada 2025-26 y, a 25 de noviembre de 2026, su web aún dice que no abrirían aquella temporada y no explica qué hará este invierno. Su circuito nórdico, de unos doce kilómetros, es una de las siete estaciones de la Mancomunitat d'Esquí Nòrdic.",
    ],
    nordicTitle: "Esquí nórdico y raquetas",
    nordic: [
      "Las siete estaciones de la Mancomunitat d'Esquí Nòrdic (Guils Fontanera, Aransa, Lles, Tuixent-La Vansa, Sant Joan de l'Erm, Tavascan y Virós-Vallferrera) comparten el forfait de temporada **Tot Nòrdic**: para la temporada 2026-27, **175 €** para adultos (esquí + raquetas) si se compra después del 15 de noviembre (antes, 131 €), según Tuixent-La Vansa. El de solo raquetas, Guils lo anunciaba a **75 €** con un 25 % de descuento hasta el 17 de noviembre; el 23 de noviembre su página aún mostraba ese precio, así que confírmalo antes de comprar. Tuixent-La Vansa, Sant Joan de l'Erm y Tavascan aún no han anunciado la fecha de apertura.",
      `Si no esquías, mira ${b2link("snow", "es", "dónde ver nieve sin esquiar y las rutas con raquetas")}.`,
    ],
    snowTitle: "Pistas abiertas hoy: dónde mirar el estado de la nieve",
    snow: [
      "Cada estación publica a diario las pistas abiertas, el espesor de nieve y los remontes en marcha: las seis de FGC (La Molina, Vall de Núria, Vallter, Espot, Port Ainé y Boí Taüll) en el [Infoneu de PIRINEU365](https://pirineu365.cat/infoneu-pirineu365/), Baqueira en «[Estado de la estación](https://www.baqueira.es/es/estado-de-la-estacion)» y Port del Comte en [su página de pistas](https://portdelcomte.net/pistes/); Masella tiene cámaras web. Antes de la apertura salen vacíos: el 25 de noviembre el Infoneu y la página de Baqueira aún no daban ninguna cifra y Port del Comte mostraba 0,0 km. Míralo la misma mañana: a principio y final de temporada cambia de un día para otro.",
      "Cámaras web oficiales: [Baqueira Beret](https://www.baqueira.es/es/webcams), [las seis estaciones de FGC](https://pirineu365.cat/webcams-pirineu365/), [Masella](https://www.masella.com/ca/webcam) y [Port del Comte](https://portdelcomte.net/webcams-i-meteo/).",
      `Para saber si hay nieve en el suelo en la alta montaña, fuera de las pistas, mira ${b2link("snowNow", "es", "el espesor de nieve de hoy en las estaciones meteorológicas de Meteocat")}.`,
    ],
    pickTitle: "Qué estación elegir",
    pick: [
      "**Más kilómetros:** Baqueira Beret (169 km) o el dominio Alp2500, La Molina y Masella juntas (145 km).",
      "**Sin coche desde Barcelona:** La Molina (R3 o Ski Bus) o la Vall de Núria (R3 y Cremallera).",
      "**Forfait de día más barato:** Vallter (29 € en temporada baja) y Espot (39 €).",
      "**Aprender o ir con niños pequeños:** la Vall de Núria y Vallter son pequeñas y fáciles de controlar.",
    ],
    faq: [
      { question: "¿Cuándo abren las estaciones de esquí de Cataluña en la temporada 2026-2027?", answer: "Aún no ha abierto ninguna estación con fecha firme. Baqueira Beret aplazó el 24 de noviembre la apertura que tenía prevista para el sábado 28 de noviembre de 2026 y anunciará la nueva fecha según la nieve. Las estaciones de FGC marcan en su calendario el viernes 4 de diciembre (La Molina, Vallter, Port Ainé, Boí Taüll y la Vall de Núria) y el sábado 5 (Espot). Masella, Port del Comte y Tavascan aún no han dado fecha (consultado el 25 de noviembre de 2026). Todas las fechas dependen de la nieve." },
      { question: "¿Cuándo abre Baqueira en 2026?", answer: "Todavía no tiene fecha. Tenía previsto abrir el sábado 28 de noviembre de 2026, pero el 24 de noviembre aplazó la apertura y dijo que anunciará la nueva fecha «en función de las condiciones de nieve en pistas». El cierre que anunció el 11 de noviembre es el 4 de abril de 2027." },
      { question: "¿Cuándo abre La Molina en la temporada 2026-2027?", answer: "El calendario de la estación, en la web de PIRINEU365, marca la apertura el viernes 4 de diciembre de 2026 y el cierre el 4 de abril de 2027 (consultado el 25 de noviembre de 2026). La temporada pasada FGC la adelantó al 29 de noviembre de 2025." },
      { question: "¿Cuándo abre Masella?", answer: "Masella aún no ha anunciado la fecha de apertura de la temporada 2026-27 (consultado el 25 de noviembre de 2026). Su abono de temporada de adulto cuesta 840 €; el precio de oferta, 730 €, terminó el 22 de noviembre." },
      { question: "¿Cuándo abre Boí Taüll?", answer: "El calendario de la estación marca la apertura el viernes 4 de diciembre de 2026 y el cierre el 4 de abril de 2027 (consultado el 25 de noviembre de 2026). La temporada pasada abrió el 4 de diciembre de 2025." },
      { question: "¿Cuándo abre la Vall de Núria para esquiar?", answer: "El calendario de la estación de esquí, en la web de PIRINEU365, marca abierto del viernes 4 al martes 8 de diciembre de 2026, el 12 y el 13 y cada día a partir del 19, hasta el 4 de abril de 2027 (consultado el 25 de noviembre de 2026). Se llega con la R3 hasta Ribes-Enllaç y el Cremallera." },
      { question: "¿Cuánto cuesta el forfait de día en Cataluña en 2026-27?", answer: "Para un adulto, de 29 € (Vallter en temporada baja) a 74 € (Baqueira Beret). La Molina, 49 € online; Masella, 53 € online; Espot, 39 €; Port Ainé, de 42 a 46 €." },
      { question: "¿Hay forfaits más baratos entre semana?", answer: "Sí, en las seis estaciones de FGC: esta temporada los miércoles son el «Dia de l'esquiador», y con el FlexiPass todos los forfaits salen a mitad de precio (nota de PIRINEU365 del 6 de noviembre de 2026). En Vallter, además, el forfait de día de los laborables (temporada baja) cuesta 29 €, y el de fines de semana y festivos, 35 €." },
      { question: "¿Cuándo cierran las estaciones de esquí de Cataluña?", answer: "Las seis estaciones de FGC marcan en su calendario el domingo 4 de abril de 2027 como último día de la temporada 2026-27 (consultado el 25 de noviembre de 2026), y Baqueira anunció el 11 de noviembre el cierre ese mismo 4 de abril, siempre que las condiciones lo permitan. Masella, Port del Comte y Tavascan no han publicado ninguna fecha." },
      { question: "¿Cómo sé si hay nieve y qué pistas están abiertas hoy?", answer: "Mira el parte de cada estación la misma mañana: el Infoneu de PIRINEU365 para las seis de FGC, «Estado de la estación» en Baqueira y la página de pistas de Port del Comte; Masella, Baqueira y FGC tienen además cámaras web. Antes de la apertura salen vacíos (25 de noviembre de 2026). Los enlaces oficiales están en la sección «Pistas abiertas hoy»." },
      { question: "¿Cómo se llega a las estaciones de esquí en transporte público?", answer: "A La Molina con la R3 (Ski Tren, 53 € con forfait de 1 día) o con el Ski Bus de Sagalés; a la Vall de Núria con la R3 y el Cremallera; a Port Ainé y Espot con el ALSA Ski Bus los fines de semana y festivos (Port Ainé desde el 5 de diciembre, Espot desde el 26 de diciembre de 2026); a Boí Taüll con el Bus de la Neu desde Vilaller (1 €); a Baqueira con ALSA hasta Vielha y el bus local VA. La R3 tiene obras: consulta Rodalies antes de salir." },
      { question: "¿Cuál es la estación de esquí más grande de Cataluña?", answer: "Baqueira Beret, con 169 km de pistas balizadas. El dominio Alp2500 (La Molina + Masella) suma 145." },
      { question: "¿Se puede ir a esquiar en tren desde Barcelona?", answer: "Sí: a La Molina, que tiene estación en la R3, y a la Vall de Núria con la R3 y el Cremallera. Durante las obras de la R3 una parte del recorrido se hace en autobús (aviso de Rodalies, 25 de noviembre de 2026)." },
    ],
    verifiedNote: "Las fechas y los precios de esquí cambian cada temporada: compruébalos en la web de la estación antes de comprar.",
  },
  en: {
    lead: "**Baqueira Beret has postponed the opening it had planned for Saturday 28 November** (note of 24 November) and will announce a new date depending on the snow. FGC's resorts mark **Friday 4 December** on their calendars (La Molina, Vallter, Port Ainé, Boí Taüll and Vall de Núria) and Saturday 5 December (Espot); Masella has not given a date yet. Catalonia has ten alpine ski resorts: the biggest is Baqueira (169 km), and by train from Barcelona you can reach **La Molina** and **Vall de Núria**. An adult day pass runs from **€29 at Vallter** (low season) to **€74 at Baqueira**.",
    tableTitle: "Catalonia's ski resorts compared, 2026-2027",
    tableCaption: "Alpine ski resorts in Catalonia: runs, adult day pass and car-free access",
    headers: ["Resort", "Area", "Km", "Altitude (m)", "Adult 1-day pass", "Without a car"],
    tableNote: "Kilometres and altitudes from each resort's technical sheet. Prices from the rates pages, re-read 25/11/2026 (Vallter showed €30 and €36.50 on 31/10; its technical sheet still says 14.15 km after a chairlift closed on 24/11). Baqueira labels them 'temporada 26-27'; Boí Taüll states no season. Port del Comte shows two tables with different amounts.",
    openTitle: "Opening dates for the 2026-2027 ski season: when each resort opens",
    open: [
      "**Baqueira Beret has postponed the opening it had planned for Saturday 28 November.** The resort's note of 24 November 2026 says: 'La estación pospone la apertura prevista para el sábado 28 de noviembre y anunciará la nueva fecha en función de las condiciones de nieve en pistas' (the resort postpones the opening planned for Saturday 28 November and will announce the new date depending on snow conditions on the runs). Forecasts point to snowfall and falling temperatures in the Val d'Aran and the Valls d'Àneu, and its teams will assess the snow on the runs to decide when the season can start. The closing day it announced on 11 November is Sunday 4 April 2027, also 'siempre que las condiciones lo permitan' (conditions permitting); the 24 November note does not repeat it. To learn the new date: the Baqueira 1500 information office is open Monday to Friday 8:30 to 14:30, and Reservas Baqueira Beret answers on 973 63 90 00 every day from 8:00 to 18:00 (per the same note).",
      "**FGC's alpine resorts have published their calendars:** on the PIRINEU365 website, La Molina, Vallter, Port Ainé, Boí Taüll and Vall de Núria show opening on **Friday 4 December 2026**, and Espot on **Saturday 5 December**; all of them run to **Sunday 4 April 2027**. Vall de Núria's, still last season's on 31 October, marks it open from 4 to 8 December (the long weekend), on 12 and 13 December and every day from the 19th (calendars checked 25 November 2026). FGC's season presentation of 6 November says all six resorts open 'from 4 December to 4 April', with 189 km of skiable terrain and 180 runs; Espot's calendar, however, still shows Saturday 5 December as its first day.",
      "**Vallter closes a chairlift.** On 24 November the resort said that the Enric Planella chairlift, in service for 48 years, 'no ha superat les darreres proves de càrrega' (did not pass its latest load tests) and that 'la seva reparació no és viable' (repair is not viable): the Xalet run will become a ski-touring route. It also says it has frozen lift pass prices, which stay at last season's level. Vallter's technical sheet still says 14.15 km of runs (read 25 November): there is no new figure after the closure.",
      "**Masella, Port del Comte and Tavascan have not announced a date** (checked 25 November 2026). Masella only says its offices keep weekend hours 'until the opening day of the 2026-27 season'; Port del Comte's pistes page shows 'closed' and 0.0 km of runs.",
      "Dates depend on snowfall and on nights cold enough to make snow. Last season FGC brought **La Molina**'s opening forward to **29 November 2025**, and the other five FGC resorts opened on **4 December 2025**.",
    ],
    openCaption: "Planned opening of Catalonia's alpine ski resorts, 2026-2027 season",
    openHeaders: ["Resort", "Planned opening", "Planned last day"],
    openNote: "Baqueira: the resort's notes of 24/11/2026 (postponement) and 11/11/2026 (closing day, 'siempre que las condiciones lo permitan'). FGC resorts: the 'Calendari de l'estació' on each one's practical information page. Checked 25/11/2026. Every date depends on snow.",
    passTitle: "Season passes for 2026-2027",
    passCaption: "Adult season pass, 2026-2027 season",
    passHeaders: ["Resort or area", "Adult price"],
    passNote: "Prices from the official websites, checked 25/11/2026. FGC's offers (La Molina, Boí Taüll, Pallars and Ripollès) end on 8 December; the Alp2500 and Masella offers ended on 22 November. Ripollès: listed at €420 and €495 on 31/10. Pirineu365 covers all six FGC resorts. Tot Nòrdic: Tuixent-La Vansa's price. Adult age bands differ (FGC 25 to 64; Alp2500 12 to 64).",
    pricesTitle: "Lift pass prices: what to know before you buy",
    prices: [
      "**Buy online.** At La Molina, Vallter, Espot and Boí Taüll the ticket office charges **€3 more** (**€5 more** at Port Ainé); Masella also adds €3. Baqueira sells day passes on its reloadable BaqueiraTICKET card, and with a BaqueiraPASS the adult day drops from €74 to €70.",
      "**Children.** A child day pass costs €49 at Baqueira, €43 at Masella (online), €36 at La Molina and Boí Taüll, €30.50–33.50 at Port Ainé, €28.50 at Espot and €23–26.50 at Vallter; age bands differ by resort.",
      "**High and low season.** At Vallter and Port Ainé the day price follows a calendar: at Port Ainé, 2026-27 high season is 26–30 December, 2–3 January and the February weekends.",
      "**Passes that cover several resorts.** Alp2500 is valid at La Molina and Masella (145 km together); Temporada Pallars at Espot and Port Ainé; Temporada Ripollès at Vallter and Vall de Núria; Pirineu365 (€730) at all six FGC resorts.",
      "**Half price on Wednesdays.** This season Wednesday is 'Dia de l'esquiador' (skier's day) at the six FGC resorts: with the FlexiPass, every lift pass is half price. The FlexiPass is pay-per-use, with a yearly fee of €15 (renewal) or €25 (new card), and from the 17th ski day the rest of the season is free, according to PIRINEU365's note of 6 November 2026.",
    ],
    getTitle: "Getting to the slopes by train or bus",
    getIntro: "FGC now publishes the dates of the 2026-2027 ALSA Ski Bus to Port Ainé (5 December 2026 to 28 March 2027) and to Espot (26 December to 28 April 2027), read on 25 November 2026. For La Molina the resort's website gives the Ski Bus prices but no dates; for Masella (Bus Blanc), Vallter (TEISA) and Baqueira we found no 2026-27 dates on 31 October, and have not looked again.",
    get: [
      "**La Molina:** it has its own station on the **R3** line. The **Ski Tren**, sold by Renfe/Rodalies, costs €53 (adult or youth; €41.50 child) and includes a return train, the resort shuttle, a 1-day lift pass and insurance. Sagalés also runs a **Ski Bus** with coach, lift pass and insurance: La Molina, €66 on Wednesdays and Fridays and €67 on Saturdays and Sundays; La Molina + Masella, €80 from Tuesday to Sunday. The resort's website (25 November) lists the prices but no dates.",
      `**Vall de Núria:** the R3 to Ribes-Enllaç, then the **rack railway**; no road reaches it. Details in ${b2link("nuria", "en", "our Núria guide")}.`,
      "**Espot and Port Ainé:** the **ALSA Ski Bus** (return coach + 1-day lift pass) on Saturdays, Sundays and holidays, except 25 December and 1 January. To Port Ainé, 5 December 2026 to 28 March 2027: €48.50 from Lleida and Balaguer and €43.50 from Tremp, La Pobla, Sort and Rialp. To Espot, 26 December 2026 to 28 April 2027 (the dates its website prints): €43.55 from Lleida, €38.70 from Balaguer, €36.05 from Tremp and €32.30 from La Pobla de Segur. The 'Taxi de la Neu' (€2 each way) runs from Sort to both resorts, booked the day before by 19:00.",
      "**Masella:** the Sagalés Ski Bus La Molina + Masella and, within Cerdanya, the county council's **Bus Blanc**. Last season (2025-26) it ran at weekends and during school holidays from 6 December, for €2; the 2026-27 calendar was not published on 31 October 2026.",
      "**Boí Taüll:** the **Bus de la Neu**, €1, on weekends and holidays from Vilaller, stopping at El Pont de Suert and the valley villages; the website gives a 'provisional calendar' without saying which season it is for.",
      "**Vallter:** TEISA publishes a ski bus Girona–Banyoles–Olot–Camprodon–Setcases–Vallter on Saturdays, Sundays and holidays from January to March; the sheet online (31 October 2026) still shows 2023-24 fares. At the resort FGC only announces a free shuttle between the car parks.",
      "**Baqueira Beret:** ALSA coaches to Vielha, then local bus line VA to the resort.",
    ],
    trainNote: `Since 16 November, because of Adif works between La Garriga and Figaró, the R3 does not run on that stretch and Renfe provides a replacement road service. Rodalies' notice (read 25 November 2026) lists the R4 from L'Hospitalet to Fabra i Puig / Montcada Bifurcació and the R3 from Sant Martí de Centelles to Puigcerdà as the rail service, with the R3 at 50% of the trains it had before 20 January. Check times and stops before you leave. Train times up to La Molina are in our ${b2link("cerdanya", "en", "Cerdanya without a car")} guide.`,
    smallTitle: "Port del Comte and Tavascan",
    small: [
      "**Port del Comte**, in the Solsonès, puts its 2026-27 season pass on sale on 1 November (€595 adult, an offer price; regular €695). It has not announced an opening date yet (checked 25 November 2026; its pistes page says 'closed'). Its high season covers every weekend, 7–8 December, 21 December to 28 February 2027 and 22–29 March 2027.",
      "**Tavascan** did not open its alpine runs or chairlift in 2025-26 and, as of 25 November 2026, its website still says they would not open that season and does not say what it will do this winter. Its cross-country circuit, about twelve kilometres, is one of the seven Mancomunitat d'Esquí Nòrdic stations.",
    ],
    nordicTitle: "Cross-country skiing and snowshoes",
    nordic: [
      "The seven stations of the Mancomunitat d'Esquí Nòrdic (Guils Fontanera, Aransa, Lles, Tuixent-La Vansa, Sant Joan de l'Erm, Tavascan and Virós-Vallferrera) share the **Tot Nòrdic** season pass: for 2026-27 it costs **€175** for adults (skiing + snowshoes) when bought after 15 November (€131 before), according to Tuixent-La Vansa. Guils advertised the snowshoes-only pass at **€75** with a 25% discount until 17 November; on 23 November its page still showed that price, so confirm it before you buy. Tuixent-La Vansa, Sant Joan de l'Erm and Tavascan have not announced their opening dates yet.",
      `Not a skier? See ${b2link("snow", "en", "where to see snow without skiing, with snowshoe routes")}.`,
    ],
    snowTitle: "Open runs today: where to check the snow",
    snow: [
      "Each resort posts open runs, snow depth and running lifts daily: the six FGC resorts (La Molina, Vall de Núria, Vallter, Espot, Port Ainé and Boí Taüll) on [PIRINEU365's Infoneu](https://pirineu365.cat/infoneu-pirineu365/), Baqueira under '[Estado de la estación](https://www.baqueira.es/es/estado-de-la-estacion)' and Port del Comte on [its pistes page](https://portdelcomte.net/pistes/); Masella has webcams. Before opening they are empty: on 25 November Infoneu and Baqueira's page still showed no figures and Port del Comte showed 0.0 km. Check on the morning itself: at the start and end of the season it changes from one day to the next.",
      "Official webcams: [Baqueira Beret](https://www.baqueira.es/es/webcams), [FGC's six resorts](https://pirineu365.cat/webcams-pirineu365/), [Masella](https://www.masella.com/ca/webcam) and [Port del Comte](https://portdelcomte.net/webcams-i-meteo/).",
      `To see whether there is snow on the ground in the high mountains away from the pistes, see ${b2link("snowNow", "en", "today's snow depth at Meteocat's weather stations")}.`,
    ],
    pickTitle: "Which resort to choose",
    pick: [
      "**The most kilometres:** Baqueira Beret (169 km), or the Alp2500 area, La Molina and Masella together (145 km).",
      "**No car, from Barcelona:** La Molina (R3 or Ski Bus) or Vall de Núria (R3 and rack railway).",
      "**Cheapest day pass:** Vallter (€29 in low season) and Espot (€39).",
      "**Learning, or with small children:** Vall de Núria and Vallter are small and easy to keep track of.",
    ],
    faq: [
      { question: "When do Catalonia's ski resorts open for 2026-2027?", answer: "No resort has a firm opening date yet. Baqueira Beret postponed on 24 November the opening it had planned for Saturday 28 November 2026 and will announce a new date depending on the snow. FGC's resorts mark Friday 4 December on their calendars (La Molina, Vallter, Port Ainé, Boí Taüll and Vall de Núria) and Saturday 5 December (Espot). Masella, Port del Comte and Tavascan have not given a date yet (checked 25 November 2026). Every date depends on snow." },
      { question: "When does Baqueira open in 2026?", answer: "It has no date yet. It had planned to open on Saturday 28 November 2026, but on 24 November it postponed the opening and said it will announce the new date 'en función de las condiciones de nieve en pistas' (depending on snow conditions on the runs). The closing day it announced on 11 November is 4 April 2027." },
      { question: "When does La Molina open for the 2026-2027 season?", answer: "The resort's calendar on the PIRINEU365 website shows opening on Friday 4 December 2026 and closing on 4 April 2027 (checked 25 November 2026). Last season FGC brought the opening forward to 29 November 2025." },
      { question: "When does Masella open?", answer: "Masella has not announced its opening date for 2026-27 yet (checked 25 November 2026). Its adult season pass costs €840; the €730 offer price ended on 22 November." },
      { question: "When does Boí Taüll open?", answer: "The resort's calendar shows opening on Friday 4 December 2026 and closing on 4 April 2027 (checked 25 November 2026). Last season it opened on 4 December 2025." },
      { question: "When does Vall de Núria open for skiing?", answer: "The ski area's calendar on the PIRINEU365 website marks it open from Friday 4 to Tuesday 8 December 2026, on 12 and 13 December and every day from the 19th, until 4 April 2027 (checked 25 November 2026). You get there on the R3 to Ribes-Enllaç and the rack railway." },
      { question: "How much is a ski day pass in Catalonia in 2026-27?", answer: "For an adult, from €29 (Vallter, low season) to €74 (Baqueira Beret). La Molina is €49 online, Masella €53 online, Espot €39 and Port Ainé €42–46." },
      { question: "Are lift passes cheaper midweek?", answer: "Yes, at the six FGC resorts: this season Wednesday is 'Dia de l'esquiador' (skier's day), and with the FlexiPass every lift pass is half price (PIRINEU365 note of 6 November 2026). At Vallter, too, a weekday (low-season) day pass is €29, against €35 at weekends and on holidays." },
      { question: "When do Catalonia's ski resorts close?", answer: "The six FGC resorts mark Sunday 4 April 2027 on their calendars as the last day of the 2026-27 season (checked 25 November 2026), and Baqueira announced on 11 November that it closes on the same 4 April, conditions permitting. Masella, Port del Comte and Tavascan have published no date." },
      { question: "How do I know if there is snow and which runs are open today?", answer: "Check each resort's report on the morning itself: PIRINEU365's Infoneu for FGC's six resorts, 'Estado de la estación' at Baqueira and the pistes page at Port del Comte; Masella, Baqueira and FGC also have webcams. Before opening they are empty (25 November 2026). The official links are in the 'Open runs today' section." },
      { question: "How do I get to the ski resorts by public transport?", answer: "To La Molina on the R3 (Ski Tren, €53 with a 1-day lift pass) or the Sagalés Ski Bus; to Vall de Núria on the R3 and the rack railway; to Port Ainé and Espot on the ALSA Ski Bus at weekends and holidays (Port Ainé from 5 December, Espot from 26 December 2026); to Boí Taüll on the Bus de la Neu from Vilaller (€1); to Baqueira on ALSA to Vielha and local bus VA. The R3 has works: check Rodalies before you leave." },
      { question: "What is the biggest ski resort in Catalonia?", answer: "Baqueira Beret, with 169 km of marked runs. The Alp2500 area (La Molina + Masella) adds up to 145 km." },
      { question: "Can you go skiing by train from Barcelona?", answer: "Yes: to La Molina, which has a station on the R3, and to Vall de Núria with the R3 and the rack railway. During the R3 works part of the journey is by bus (Rodalies notice, 25 November 2026)." },
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
