import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Snow without skiing in Catalonia: where to see and play in the snow, how to
 * get there without a car, chains and winter tyres, and the avalanche bulletin.
 *
 * Moved out of pyrenees.ts and upgraded in place on 13 Nov 2026
 * (research_notes/evergreen-demand-nov2026.md, opportunity 8). Same URLs and
 * entry; titles and descriptions untouched, because the 28 Oct entry in
 * docs/SEO_EXPERIMENTS.md measures them on 28 Nov. pyrenees.ts re-exports SNOW.
 *
 * Every fact below was read on 13 Nov 2026 with curl and checked by grep
 * against the downloaded page (fact pack: research_notes/snow-without-skiing.md,
 * gitignored, in the worktree that built this; 70 quotes, all matched). The
 * quotes that carry the page:
 *
 * - Rodalies, "R3: modificació del servei entre L'Hospitalet de Llobregat i
 *   Puigcerdà" (02_02_PAT_R3): "L'Hospitalet de Llobregat – Fabra i Puig /
 *   Montcada Bifurcació · Servei de la línia R4 ... La Garriga-Puicerdà/La Tor
 *   de Querol · Servei de la línia R3"; "La línia R3 circula amb una oferta de
 *   circulacions del 50% respecte a la que hi havia abans del 20 de gener";
 *   tickets "vàlids per accedir al servei alternatiu per carretera, sempre que
 *   hagin estat prèviament validats"; "TreNatura — continuaran vigents durant
 *   tot el període d'interrupció". No end date is published.
 * - Rodalies, La Garriga - Figaró (updated 11.11.2026): "pla alternatiu per
 *   carretera del 16 de novembre al 14 de desembre".
 * - Renfe, Combinado TreNatura: "Billete combinado Adulto: 40,20 €", "Niño (de
 *   4 a 13 años, ambos incluidos): 30,70 €", "Todo el año, excepto días
 *   laborables del mes de noviembre". No season label: printed as published on
 *   13 Nov 2026.
 * - FGC (turistren.cat, pirineu365.cat): cremallera "12,5 km ... 1.000 metres
 *   en tan sols 40 minuts"; "Compra online obligatòria"; fares "Preus vàlids per
 *   a la temporada 2026" (34 € return from Ribes, adult); "Aquesta temporada
 *   d'hivern 2026-2027, el bitllet del Cremallera inclou també el bitllet del
 *   Telefèric Coma del Clot"; winter cremallera pass "Vàlida de l'1 de desembre
 *   de 2026 al 30 d'abril de 2027", 62.50 € adult; the 2026-27 cremallera
 *   calendar has every day from 1 Dec to 30 Apr in a timetable band (read from
 *   the calendar markup); Parc Lúdic "pistes de trineus" and "tubbies", "Accés a
 *   partir de 3 anys"; snowcat outings dated Dec 2026 - Mar 2027, 23 € adult;
 *   "tres aparcaments gratuïts" (P1 Ribes Enllaç, P2 Ribes Vila, P3 Queralbs).
 * - La Molina: calendar 4 Dec 2026 - 4 Apr 2027; "Forfet La Molina – 1 dia |
 *   Passeig Telecabina" adult 20 €, 7-11 10 € on the fares page whose
 *   conditions carry 2026-27 dates (the under-6 price differs between two pages,
 *   left out); "fins a la Tosa d'Alp, a més de 2.500 metres"; last ride up for
 *   the walk "16 h - De dilluns a divendres", "15 h - Caps de setmana i
 *   festius"; "adaptat per a persones amb mobilitat reduïda"; "La pista de
 *   trineus Coll Sisè"; station bus "fins al peu de pistes", "Des de l'estació
 *   Renfe fins a Pista Llarga"; Bus Natura "Operatiu els dimecres, divendres,
 *   dissabtes i diumenges" (no dates, no season label: no price printed).
 * - Vallter: sledges, "Els menors de 8 anys han d'entrar acompanyats d'un
 *   adult"; "En dies de temporada alta, la compra online prèvia de forfets i
 *   bitllets de trineu és obligatòria per accedir a l'estació"; P5 and P6 for
 *   "persones que volen gaudir de la muntanya sense realitzar cap activitat";
 *   closed on 25 Dec.
 * - Espot: "El circuit de tubing té 140 metres", parc lúdic reached with a
 *   pass on the La Roca chairlift; guided snowshoes to the Creu de l'Eixol,
 *   about 2 h, from 10. Port Ainé: parc lúdic at 2000 m, tubing 120 m, treetop
 *   park, 3-hour access; 1.5 km snowshoe loop (age 7+) and Pic de l'Orri (12+).
 *   Boí Taüll: zipline "1.220 metres i un desnivell de 102 metres", 50-120 kg,
 *   weekends and holidays; Bus de la Neu "calendari provisional".
 * - Baqueira Beret news of 11 Nov 2026: "La apertura está prevista para el
 *   sábado 28 de noviembre de 2026 y el cierre para el domingo 4 de abril de
 *   2027, siempre que las condiciones lo permitan."
 * - Visit Val d'Aran (Foment Torisme Val d'Aran): "Activitats de neu" lists
 *   esquí nòrdic, raquetes de neu, trineu amb gossos, motos de neu, trineu a
 *   cavall; "La Val d'Aran no disposa de comunicació directa en tren"; ALSA
 *   "serveis diaris des de Barcelona i Lleida".
 * - Masella: no non-skier activity and no 2026-27 opening date published
 *   (news "Novetats de la temporada 2026-27", updated 11 Nov 2026).
 * - Oficina de Turisme del Berguedà, "A la neu": "Els Rasos de Peguera és el
 *   lloc més concorregut i accessible on es poden practicar raquetes de neu i a
 *   més s'hi pot trobar servei de lloguer de material i de guies"; Serra
 *   d'Ensija and Coll de Pal; "S'aconsella informar-se prèviament de l'estat
 *   de la neu, portar el material adequat i contractar guies professionals".
 * - Tot Nòrdic: Guils "Forfet de temporada 2026-2027", Esquí + Raquetes adult
 *   175 €; Tuixent-La Vansa "TOT NÒRDIC 2026/2027".
 * - BOE, Reglamento General de Vehículos art. 12.5.2: "cadenas u otros
 *   dispositivos antideslizantes autorizados ... sobre, al menos, una rueda
 *   motriz a cada lado del vehículo ... bien utilizar neumáticos especiales";
 *   annex VII.5 (Orden PJC/528/2026, in force 30 May 2026): "en el caso de los
 *   vehículos de MMA ≤ 3.500 kg estos deberán equipar neumáticos certificados
 *   3PMSF en todos sus ejes". Textile socks are not named: not claimed either
 *   way beyond that.
 * - BOE, Reglamento General de Circulación art. 32.2: on motorways with snow
 *   "estará prohibido adelantar y será obligatorio circular por el carril
 *   situado más a la derecha"; annex I signs 18 "Obligatorio el uso de cadenas
 *   o neumáticos de invierno" and 19 "Obligatorio neumáticos de invierno".
 * - Protecció Civil: chains "les adequades per al teu vehicle"; "posa les
 *   cadenes a les rodes motrius"; "No avancis les màquines llevaneu"; V16 from
 *   1 Jan 2026; NEUCAT (Acord GOV/207/2023). SCT: 012, "Des de fora de
 *   Catalunya: 932 142 124", 24 h; the Mapa Continu de Trànsit.
 * - ICGC: daily bulletin "a partir de l'1 de desembre de 2026 o quan les
 *   condicions d'innivació així ho requereixin"; scale "1 Feble ... 5 Molt
 *   fort"; weak load includes the "raquetista"; level 3 "És possible el
 *   desencadenament d'allaus, fins i tot per sobrecàrrega feble"; Aran links
 *   the Centre de Lauegi d'Aran. Protecció Civil: "el 90% dels accidents es
 *   donen en allaus desencadenades pels mateixos implicats". Meteocat's
 *   Pyrenees forecast is "vàlida per a cotes superiors a 1500 metres".
 *
 * Left out (unverified or unlabelled on 13 Nov 2026): the end of the R3 cut,
 * Toses as a rail stop, 2027 cremallera fares, every activity price with no
 * season on its page (Núria parc lúdic, Vallter sledges, Espot and Port Ainé
 * passes, zipline, rentals, Bus Natura, the La Molina station bus, Bus de la
 * Neu), ski-bus dates for 2026-27 (ALSA pages still show 2025-26), Baqueira's
 * non-ski activities (no page on its new site), SCT colour levels, the Lauegi
 * bulletin's details, and anything about Montseny.
 *
 * SNOW_REREAD_BY: the R3 La Garriga - Figaró cut ends on 14 Dec, the
 * cremallera fares are labelled "temporada 2026", and the ski buses and Bus
 * Natura dates should be out by then.
 */

export const SNOW_AS_OF = "2026-11-13";

/** The R3 Figaró cut ends on 14 Dec and the 2026 fares end with the year: re-read before then. */
export const SNOW_REREAD_BY = "2026-12-15";

export const SNOW_URLS = {
  r3: "https://rodalies.gencat.cat/ca/detalls/article/02_02_PAT_R3",
  r3Figaro: "https://rodalies.gencat.cat/ca/detalls/article/11_11_R3_La-Garriga-Figaro",
  r3Buses: "https://rodalies.gencat.cat/ca/detalls/article/11_05_R3_Nous_Horaris_Bus",
  trenatura: "https://www.renfe.com/es/es/cercanias/rodalies-catalunya/ofertas-mas-populares/combi-trenatura",
  cremallera: "https://turistren.cat/trens/cremallera-de-nuria/",
  nuriaFares: "https://pirineu365.cat/valldenuria/estacio/tarifes/",
  nuriaInfo: "https://pirineu365.cat/valldenuria/estacio/informacio-practica/",
  nuriaPark: "https://pirineu365.cat/valldenuria/experiencies/parc-ludic/",
  nuriaSnowshoes: "https://pirineu365.cat/valldenuria/experiencies/raquetes-de-neu/",
  nuriaSnowcat: "https://pirineu365.cat/valldenuria/experiencies/sortides-amb-maquina-trepitjaneu/",
  molinaInfo: "https://pirineu365.cat/lamolina/estacio/informacio-tecnica/",
  molinaFares: "https://pirineu365.cat/lamolina/estacio/tarifes/",
  molinaGondola: "https://pirineu365.cat/lamolina/experiencies/passeig-panoramic-amb-telecabina-cadi-moixero/",
  molinaSledges: "https://pirineu365.cat/lamolina/experiencies/pista-de-trineus/",
  molinaActivities: "https://pirineu365.cat/lamolina/experiencies/",
  vallterInfo: "https://pirineu365.cat/vallter/estacio/informacio-practica/",
  vallterSledges: "https://pirineu365.cat/vallter/experiencies/pista-de-trineos-duplicado/",
  espotInfo: "https://pirineu365.cat/espotesqui/estacio/informacio-practica/",
  espotPark: "https://pirineu365.cat/espot/experiencies/parc-ludic/",
  espotSnowshoes: "https://pirineu365.cat/espot/experiencies/raquetes-de-neu/",
  portaineInfo: "https://pirineu365.cat/portaine/estacio/informacio-practica/",
  portainePark: "https://pirineu365.cat/portaine/experiencies/parc-ludic/",
  portaineSnowshoes: "https://pirineu365.cat/portaine/experiencies/raquetes-de-neu/",
  boiInfo: "https://pirineu365.cat/boitaull/estacio/informacio-practica/",
  boiZipline: "https://pirineu365.cat/boitaull/experiencies/tirolina/",
  baqueira: "https://www.baqueira.es/es/noticia/baqueira-beret-invierte-24-millones-de-euros-en-el-nuevo-mirador-y-la-renovacion-total-de",
  aranActivities: "https://www.visitvaldaran.com/ca/cat/activitats-de-neu/",
  aranAccess: "https://www.visitvaldaran.com/ca/descobreix-la-val-daran/com-arribar/",
  masella: "https://www.masella.com/blog/ca/novetats-de-la-temporada-2026-27/",
  guils: "https://www.guils.com/",
  tuixent: "https://www.tuixent-lavansa.com/",
  bergueda: "https://www.elbergueda.cat/ca/descobreix/l-aventura/a-la-neu.htm",
  rgv: "https://www.boe.es/buscar/act.php?id=BOE-A-1999-1826",
  rgc: "https://www.boe.es/buscar/act.php?id=BOE-A-2003-23514",
  civilSnow: "https://interior.gencat.cat/ca/arees_dactuacio/proteccio_civil/consells_autoproteccio_emergencia/riscos_naturals/nevades_glacades_i_onades_de_fred/",
  neucat: "https://interior.gencat.cat/ca/arees_dactuacio/proteccio_civil/plans-proteccio-civil/plans-especials/neucat/",
  sctPhones: "https://transit.gencat.cat/ca/informacio-viaria/telefons-interes/",
  sctMap: "https://transit.gencat.cat/ca/informacio-viaria/estat-transit/mapa-continu-mct/",
  bpa: "https://www.icgc.cat/ca/Ambits-tematics/Riscos-i-emergencies/Allaus/Butlleti-de-Perill-dAllaus-BPA",
  bpaScale: "https://www.icgc.cat/ca/Ambits-tematics/Riscos-i-emergencies/Allaus/Butlleti-de-Perill-dAllaus-BPA/Escala-europea-de-perill-dallaus",
  gruix: "https://www.icgc.cat/ca/Ambits-tematics/Riscos-i-emergencies/Allaus/Informacio-nivologica/InfoGruixNEU",
  lauegi: "https://ca.lauegi.report/",
  civilAvalanche: "https://interior.gencat.cat/ca/arees_dactuacio/proteccio_civil/consells_autoproteccio_emergencia/riscos_naturals/allaus/",
  meteocatPyrenees: "https://www.meteo.cat/prediccio/pirineu",
  meteocatRainSnow: "https://www.meteo.cat/observacions/plujaONeu",
} as const;

const U = SNOW_URLS;

const SOURCES: B2Source[] = [
  { name: "R3: modificació del servei entre L'Hospitalet de Llobregat i Puigcerdà", url: U.r3, publisher: "Rodalies de Catalunya" },
  { name: "R3: modificació del servei entre La Garriga i Figaró (16 de novembre - 14 de desembre de 2026)", url: U.r3Figaro, publisher: "Rodalies de Catalunya" },
  { name: "R3: nous horaris del servei alternatiu per carretera (des del 9 de novembre de 2026)", url: U.r3Buses, publisher: "Rodalies de Catalunya" },
  { name: "Combinado TreNatura", url: U.trenatura, publisher: "Renfe" },
  { name: "Cremallera de Núria", url: U.cremallera, publisher: "FGC Turistren" },
  { name: "Vall de Núria: tarifes", url: U.nuriaFares, publisher: "FGC (PIRINEU365)" },
  { name: "Vall de Núria: informació pràctica i calendaris 2026-27", url: U.nuriaInfo, publisher: "FGC (PIRINEU365)" },
  { name: "Vall de Núria: Parc Lúdic", url: U.nuriaPark, publisher: "FGC (PIRINEU365)" },
  { name: "Vall de Núria: raquetes de neu", url: U.nuriaSnowshoes, publisher: "FGC (PIRINEU365)" },
  { name: "Vall de Núria: sortides amb màquina trepitjaneu", url: U.nuriaSnowcat, publisher: "FGC (PIRINEU365)" },
  { name: "La Molina: informació pràctica, calendari i transport", url: U.molinaInfo, publisher: "FGC (PIRINEU365)" },
  { name: "La Molina: tarifes", url: U.molinaFares, publisher: "FGC (PIRINEU365)" },
  { name: "La Molina: passeig panoràmic amb el Telecabina Cadí-Moixeró", url: U.molinaGondola, publisher: "FGC (PIRINEU365)" },
  { name: "La Molina: pista de trineus", url: U.molinaSledges, publisher: "FGC (PIRINEU365)" },
  { name: "La Molina: experiències", url: U.molinaActivities, publisher: "FGC (PIRINEU365)" },
  { name: "Vallter: informació pràctica", url: U.vallterInfo, publisher: "FGC (PIRINEU365)" },
  { name: "Vallter: pista de trineus", url: U.vallterSledges, publisher: "FGC (PIRINEU365)" },
  { name: "Espot: informació pràctica", url: U.espotInfo, publisher: "FGC (PIRINEU365)" },
  { name: "Espot: Parc Lúdic", url: U.espotPark, publisher: "FGC (PIRINEU365)" },
  { name: "Espot: raquetes de neu", url: U.espotSnowshoes, publisher: "FGC (PIRINEU365)" },
  { name: "Port Ainé: informació pràctica", url: U.portaineInfo, publisher: "FGC (PIRINEU365)" },
  { name: "Port Ainé: Parc Lúdic", url: U.portainePark, publisher: "FGC (PIRINEU365)" },
  { name: "Port Ainé: raquetes de neu", url: U.portaineSnowshoes, publisher: "FGC (PIRINEU365)" },
  { name: "Boí Taüll: informació pràctica", url: U.boiInfo, publisher: "FGC (PIRINEU365)" },
  { name: "Boí Taüll: tirolina", url: U.boiZipline, publisher: "FGC (PIRINEU365)" },
  { name: "Baqueira Beret invierte 24 millones de euros en el nuevo mirador (11/11/2026)", url: U.baqueira, publisher: "Baqueira Beret" },
  { name: "Activitats de neu", url: U.aranActivities, publisher: "Foment Torisme Val d'Aran" },
  { name: "Com arribar a la Val d'Aran", url: U.aranAccess, publisher: "Foment Torisme Val d'Aran" },
  { name: "Novetats de la temporada 2026-27", url: U.masella, publisher: "Masella" },
  { name: "Guils Fontanera: forfet de temporada 2026-2027", url: U.guils, publisher: "Guils Fontanera" },
  { name: "Tuixent-La Vansa: Tot Nòrdic 2026/2027", url: U.tuixent, publisher: "Tuixent-La Vansa" },
  { name: "A la neu", url: U.bergueda, publisher: "Oficina de Turisme del Berguedà" },
  { name: "Reglamento General de Vehículos (RD 2822/1998), texto consolidado: art. 12 y anexo VII", url: U.rgv, publisher: "BOE" },
  { name: "Reglamento General de Circulación (RD 1428/2003), texto consolidado: art. 32 y anexo I", url: U.rgc, publisher: "BOE" },
  { name: "Nevades, glaçades i onades de fred: consells", url: U.civilSnow, publisher: "Protecció Civil, Generalitat de Catalunya" },
  { name: "Pla especial d'emergències per nevades a Catalunya (NEUCAT)", url: U.neucat, publisher: "Protecció Civil, Generalitat de Catalunya" },
  { name: "Telèfons d'interès: 012", url: U.sctPhones, publisher: "Servei Català de Trànsit" },
  { name: "Mapa Continu de Trànsit", url: U.sctMap, publisher: "Servei Català de Trànsit" },
  { name: "Butlletí de Perill d'Allaus (BPA)", url: U.bpa, publisher: "Institut Cartogràfic i Geològic de Catalunya" },
  { name: "Escala europea de perill d'allaus", url: U.bpaScale, publisher: "Institut Cartogràfic i Geològic de Catalunya" },
  { name: "InfoGruixNEU", url: U.gruix, publisher: "Institut Cartogràfic i Geològic de Catalunya" },
  { name: "Centre de Lauegi d'Aran", url: U.lauegi, publisher: "Conselh Generau d'Aran" },
  { name: "Allaus: consells", url: U.civilAvalanche, publisher: "Protecció Civil, Generalitat de Catalunya" },
  { name: "Predicció del Pirineu", url: U.meteocatPyrenees, publisher: "Servei Meteorològic de Catalunya" },
  { name: "Observació de pluja o neu", url: U.meteocatRainSnow, publisher: "Servei Meteorològic de Catalunya" },
];

type Copy = {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  lead: string;
  factsTitle: string;
  facts: { label: string; value: string }[];
  notReportTitle: string;
  notReport: string;
  carfreeTitle: string;
  carfree: string[];
  r3Title: string;
  r3: string[];
  routesTitle: string;
  routesIntro: string;
  routesCaption: string;
  routesHeaders: string[];
  routes: string[][];
  routesNote: string;
  places: [string, string][];
  kidsTitle: string;
  kids: string;
  chainsTitle: string;
  chains: string[];
  chainsTipsIntro: string;
  chainsTips: string[];
  chainsAfter: string;
  avalancheTitle: string;
  avalanche: string[];
  checkTitle: string;
  check: string[];
  photosTitle: string;
  photos: string;
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, Copy> = {
  ca: {
    path: "guies/on-veure-neu-catalunya-sense-esquiar",
    title: "Rutes d'hivern a Catalunya: on veure neu sense esquiar, amb raquetes o en tren",
    seoTitle: "Rutes d'hivern a Catalunya: on veure neu sense esquiar",
    seoDescription:
      "On veure neu a Catalunya sense esquiar: rutes d'hivern amb raquetes, trineus i telecabines a les estacions del Pirineu, i com arribar-hi en tren o bus.",
    excerpt:
      "On jugar a la neu sense esquiar: trineus, raquetes i telecabines al Pirineu, com arribar-hi en tren, les cadenes i els pneumàtics d'hivern i el butlletí d'allaus.",
    lead: `Per veure i trepitjar neu sense esquiar, el més fàcil des de Barcelona sense cotxe és la **Vall de Núria** (tren R3 fins a Ribes de Freser i cremallera, que circula cada dia de desembre a abril) o **la Molina** (estació pròpia de l'R3 i el telecabina Cadí-Moixeró, 20 € per adult la temporada 2026-27). Les estacions d'FGC obren el **4 de desembre de 2026** (Espot, el 5) i Baqueira preveu obrir el **28 de novembre**, si les condicions ho permeten. Abans de sortir: l'R3 encara no circula entre Barcelona i la Garriga, i amb neu a la carretera cal portar cadenes o pneumàtics d'hivern 3PMSF.`,
    factsTitle: "Neu sense esquiar, d'un cop d'ull",
    facts: [
      { label: "Sense cotxe", value: "Vall de Núria (R3 + cremallera) i la Molina (R3)" },
      { label: "Obertura 2026-27", value: "FGC, 4 de desembre (Espot, 5); Baqueira, 28 de novembre; tanquen el 4 d'abril de 2027" },
      { label: "Trineus i parcs lúdics", value: "Núria, la Molina, Vallter, Espot i Port Ainé" },
      { label: "Raquetes de neu", value: "Circuits a les sis estacions d'FGC, al Tot Nòrdic i als Rasos de Peguera" },
      { label: "Cotxe amb neu", value: "Cadenes o pneumàtics 3PMSF a tots els eixos (BOE, des del 30 de maig de 2026)" },
      { label: "Allaus", value: "Butlletí diari de l'ICGC a partir de l'1 de desembre de 2026" },
    ],
    notReportTitle: "Això no és un part de neu",
    notReport: `Aquesta guia explica **on plantejar una escapada hivernal**. No prediu les condicions d'una data concreta: això només ho pot dir l'estació aquell dia. Abans de sortir cal comprovar l'estat de l'estació, la meteorologia, les carreteres i quines activitats estan obertes. Per al gruix de neu que mesura avui el Meteocat a les seves estacions de muntanya, mira ${b2link("snowNow", "ca", "si hi ha neu al Pirineu avui")}.`,
    carfreeTitle: "Neu sense cotxe: en tren a Núria i a la Molina",
    carfree: [
      `**Vall de Núria.** Amb l'R3 fins a l'estació de Ribes de Freser i, des de Ribes-Enllaç, el cremallera d'FGC, que puja 1.000 metres en 12,5 km i 40 minuts. El calendari 2026-27 del cremallera té servei cada dia de l'1 de desembre al 30 d'abril, i FGC demana comprar el bitllet en línia. El combinat **TreNatura** de Renfe inclou el tren d'anada i tornada des de qualsevol estació de Rodalies i el cremallera: **40,20 €** per adult i **30,70 €** de 4 a 13 anys (preu publicat el 13 de novembre de 2026), i no val els dies feiners de novembre. Si vas pel teu compte, les tarifes del cremallera publicades són les de la temporada 2026: 34 € anada i tornada des de Ribes per adult. Tota la resta, a ${b2link("nuria", "ca", "la guia del cremallera de Núria")}.`,
      `**La Molina.** Té estació pròpia a l'R3. Des de l'estació, un bus intern puja fins a peu de pistes (Pista Llarga). A dalt, el **telecabina Cadí-Moixeró** puja fins a la Tosa d'Alp, a més de 2.500 metres, «especialment per als qui desitgen gaudir de la muntanya sense esquiar»: el forfet de passeig 2026-27 costa **20 €** per adult i **10 €** de 7 a 11 anys. L'última pujada per al passeig és a les 16 h de dilluns a divendres i a les 15 h els caps de setmana i festius, i el telecabina està adaptat per a persones amb mobilitat reduïda. La Molina també anuncia el **Bus Natura** des de Barcelona, Sabadell, Terrassa i Manresa, amb el forfet de passeig inclòs, els dimecres, divendres, dissabtes i diumenges; les dates d'aquesta temporada encara no s'han publicat.`,
      `Per als horaris de l'R3, mira ${b2link("cerdanya", "ca", "els trens a la Cerdanya")}.`,
    ],
    r3Title: "L'R3 aquest hivern: on hi ha autobusos",
    r3: [
      `**Entre Barcelona i la Garriga no hi ha trens de l'R3.** Segons [Rodalies](${U.r3}), entre l'Hospitalet de Llobregat i Fabra i Puig o Montcada Bifurcació circula l'R4, els trens de l'R3 van només de la Garriga a Puigcerdà i la Tor de Querol, i la línia té el 50 % dels trens que tenia abans del 20 de gener. La resta del trajecte es fa amb autobusos, que van canviar d'horari el [9 de novembre de 2026](${U.r3Buses}). Rodalies no hi posa data de final.`,
      `**Del 16 de novembre al 14 de desembre de 2026, tampoc entre la Garriga i Figaró**, per obres d'Adif: hi ha autobusos, i els trens cap al nord surten de Sant Martí de Centelles ([avís de Rodalies](${U.r3Figaro})).`,
      "Els bitllets de Rodalies valen per als autobusos si els valides a l'estació d'origen, i el TreNatura continua vigent durant l'interrupció. Informació de Rodalies: 900 41 00 41.",
    ],
    routesTitle: "Rutes d'hivern amb neu a Catalunya: on fer raquetes i jugar a la neu",
    routesIntro: "Les raquetes de neu són la manera més senzilla de caminar per la neu sense saber esquiar, i els trineus i els parcs lúdics, la manera de jugar-hi. Això és el que hi ofereix cada operador:",
    routesCaption: "On fer raquetes i jugar a la neu sense esquiar a Catalunya",
    routesHeaders: ["Lloc", "Comarca", "Sense esquiar", "Sense cotxe"],
    routes: [
      ["Vall de Núria", "Ripollès", "Parc lúdic amb trineus i tubbies, circuits de raquetes gratuïts, telefèric de la Coma del Clot, sortides amb màquina trepitjaneu", "R3 fins a Ribes de Freser i cremallera"],
      ["La Molina", "Cerdanya", "Telecabina Cadí-Moixeró, pista de trineus Coll Sisè, raquetes, circuit «Descoberta de la Fauna»", "R3 fins a l'estació de la Molina; Bus Natura"],
      ["Vallter", "Ripollès", "Pista de trineus i raquetes de neu", "Bus d'esquí: dates 2026-27 no publicades"],
      ["Espot", "Pallars Sobirà", "Parc lúdic amb tubing i trineus, raquetes amb guia fins a la Creu de l'Eixol", "Bus d'esquí: dates 2026-27 no publicades"],
      ["Port Ainé", "Pallars Sobirà", "Parc lúdic amb tubing, trineus i parc d'aventura als arbres; dues rutes de raquetes", "Bus d'esquí: dates 2026-27 no publicades"],
      ["Boí Taüll", "Alta Ribagorça", "Raquetes amb guia i tirolina doble", "Bus de la Neu des de Vilaller (calendari provisional)"],
      ["Val d'Aran", "Aran", "Raquetes, esquí nòrdic, trineu amb gossos o a cavall, motos de neu", "Bus d'ALSA des de Barcelona i Lleida (no hi ha tren)"],
      ["Tot Nòrdic", "Pirineu", "Circuits de raquetes a les set estacions d'esquí nòrdic, com Guils Fontanera i Tuixent-La Vansa", "Sense connexió verificada"],
      ["Rasos de Peguera", "Berguedà", "Raquetes de neu, amb lloguer de material i guies", "Sense connexió verificada"],
    ],
    routesNote: "Segons les pàgines de cada operador (PIRINEU365, Visit Val d'Aran, Guils, Tuixent-La Vansa i l'Oficina de Turisme del Berguedà), consultades el 13/11/2026.",
    places: [
      ["Vall de Núria: neu sense carretera", `No hi arriba cap carretera. Aquest hivern 2026-27, el bitllet del cremallera inclou també el telefèric de la Coma del Clot, que puja fins a 2.170 metres. Al **Parc Lúdic** hi ha pistes de trineus i un circuit de tubbies gegants (a partir de 3 anys); els **circuits de raquetes** senyalitzats són gratuïts i les raquetes es lloguen a l'estació. Les **sortides amb màquina trepitjaneu** (45 minuts, amb guia) tenen dates de desembre de 2026 a març de 2027 i costen 23 € per adult i 14 € de 4 a 13 anys aquesta temporada. Si hi pujaràs sovint, el forfet de cremallera de temporada d'hivern (de l'1 de desembre de 2026 al 30 d'abril de 2027) costa 62,50 € per adult. Si hi vas en cotxe, FGC té tres aparcaments gratuïts: Ribes-Enllaç, Ribes-Vila i Queralbs.`],
      ["La Molina i Masella", `A més del telecabina, la Molina té una **pista de trineus** (Coll Sisè), circuits senyalitzats de **raquetes**, el circuit «Descoberta de la Fauna» i, a la llista d'[activitats per a no esquiadors](${U.molinaActivities}), un parc d'aventura als arbres, marxa nòrdica, spa i bolera. L'estació obre cada dia del 4 de desembre de 2026 al 4 d'abril de 2027. **Masella**, al costat, no publica activitats per a no esquiadors ni data d'obertura per al 2026-27 (consultat el 13 de novembre de 2026).`],
      ["Vallter", `És a la capçalera del Ter, sobre ${b2link("setcases", "ca", "Setcases")}. Té **pista de trineus** (els menors de 8 anys hi han d'entrar amb un adult) i raquetes amb guia. Dues coses importants si no esquies: els dies de temporada alta, **la compra en línia del forfet o del bitllet de trineu és obligatòria** per entrar a l'estació, i els aparcaments P5 i P6 són per a qui vol gaudir de la muntanya sense fer cap activitat. Obre el 4 de desembre i tanca el dia de Nadal.`],
      ["Espot", "Al Parc Nacional d'Aigüestortes i Estany de Sant Maurici. El **Parc Lúdic** (tubing de 140 metres, trineus i jardí de neu) és a la cota 2000 i s'hi puja amb el telecadira de la Roca, que té forfet de vianant. Hi ha una sortida guiada amb raquetes fins al mirador de la Creu de l'Eixol, d'unes 2 hores, a partir de 10 anys. Obre el 5 de desembre."],
      ["Port Ainé", "Al Pallars Sobirà. El **Parc Lúdic** de la cota 2000 té trineus, tubing de 120 metres, jardí de neu i parc d'aventura als arbres, amb accés de 3 hores. Per a raquetes, un itinerari interpretatiu d'1,5 km (unes 2 hores, a partir de 7 anys) i la ruta al Pic de l'Orri (unes 3 hores, a partir de 12). Obre el 4 de desembre."],
      ["Boí Taüll", "És l'estació amb la cota més alta de Catalunya (2.751 m). Té raquetes amb guia i una **tirolina doble** d'1.220 metres i 102 metres de desnivell, per a persones d'entre 50 i 120 kg, els caps de setmana i festius. El Bus de la Neu puja des de Vilaller, amb un calendari 2026-27 encara provisional. Obre el 4 de desembre."],
      ["Val d'Aran", `Baqueira Beret preveu obrir el dissabte 28 de novembre de 2026 i tancar el diumenge 4 d'abril de 2027, «siempre que las condiciones lo permitan». Per a qui no esquia, la [web de turisme de l'Aran](${U.aranActivities}) recull raquetes de neu, esquí nòrdic, trineus amb gossos o a cavall i motos de neu, amb empreses de la vall. L'Aran no té tren: ALSA hi té línies regulars i serveis diaris des de Barcelona i Lleida.`],
      ["Rasos de Peguera: neu al Berguedà", `Segons l'[Oficina de Turisme del Berguedà](${U.bergueda}), els Rasos de Peguera (Castellar del Riu) són el lloc més concorregut i accessible per fer raquetes de neu a la comarca, amb lloguer de material i guies; la Serra d'Ensija i el Coll de Pal són més tranquils. L'oficina aconsella informar-se abans de l'estat de la neu, portar el material adequat i contractar guies professionals. S'hi va en cotxe.`],
      ["Esquí nòrdic i raquetes: el Tot Nòrdic", "Les set estacions de la Mancomunitat d'Esquí Nòrdic comparteixen forfet. El de temporada 2026-27 d'esquí + raquetes costa 175 € per a adults a Guils Fontanera, que és a 16 minuts de Puigcerdà i hi ofereix raquetes de neu i trineus."],
    ],
    kidsTitle: "Neu amb nens: trineus i parcs lúdics",
    kids: "Per a una primera vegada a la neu amb criatures: el Parc Lúdic de Núria (a partir de 3 anys, i el cremallera ja és mitja excursió), la pista de trineus de la Molina, la de Vallter (els menors de 8 anys, amb un adult) i els parcs lúdics d'Espot i Port Ainé, amb tubing. La tirolina de Boí Taüll demana un mínim de 50 kg.",
    chainsTitle: "Cadenes i pneumàtics d'hivern: què diu la norma",
    chains: [
      `Quan els senyals indiquen que les cadenes són obligatòries o recomanades, el [Reglament General de Vehicles](${U.rgv}) (art. 12.5.2) obliga a posar cadenes o altres dispositius antilliscants autoritzats en almenys una roda motriu de cada costat, o bé a portar pneumàtics especials. Els panells poden mostrar dos senyals diferents: «Obligatori l'ús de cadenes o pneumàtics d'hivern» i «Obligatori pneumàtics d'hivern» ([Reglament General de Circulació](${U.rgc}), annex I).`,
      "**Novetat d'aquest hivern:** des del 30 de maig de 2026 (Ordre PJC/528/2026), per complir les restriccions de mobilitat hivernal, els cotxes i furgonetes de fins a 3.500 kg han de portar pneumàtics certificats **3PMSF** (el pictograma de la muntanya de tres pics amb un floc de neu) **a tots els eixos**. El marcatge M+S tot sol ja no compta com a pneumàtic d'hivern.",
      "Els mitjons o fundes tèxtils no s'esmenten pel nom: la norma parla de cadenes o «altres dispositius antilliscants autoritzats». A les autopistes i autovies amb neu, a més, està prohibit avançar i cal circular pel carril de la dreta (art. 32.2 del Reglament General de Circulació).",
    ],
    chainsTipsIntro: "Els consells de Protecció Civil per conduir amb neu:",
    chainsTips: [
      "porta les cadenes adequades per al teu vehicle i assegura't que saps com es posen;",
      "si hi ha neu a la calçada, para on no interrompis la circulació i posa-les a les rodes motrius;",
      "no avancis les màquines llevaneu;",
      "porta el llum V16, que des de l'1 de gener de 2026 substitueix els triangles.",
    ],
    chainsAfter: `**Abans de sortir, l'estat de la carretera:** el telèfon 012 del Servei Català de Trànsit funciona les 24 hores (932 142 124 des de fora de Catalunya), i el [Mapa Continu de Trànsit](${U.sctMap}) mostra les incidències i les càmeres en temps real. Quan neva fort s'activa el [pla NEUCAT](${U.neucat}), que pot prohibir la circulació de camions en algunes vies.`,
    avalancheTitle: "Perill d'allaus i previsió: què mirar abans de sortir",
    avalanche: [
      `Si surts dels circuits de les estacions, amb raquetes o caminant, mira el [Butlletí de Perill d'Allaus de l'ICGC](${U.bpa}), que és vàlid fora de pistes i de zones controlades. Torna a ser diari **a partir de l'1 de desembre de 2026**, o abans si la neu ho demana. Per a l'Aran, l'ICGC remet al [Centre de Lauegi d'Aran](${U.lauegi}).`,
      `El butlletí fa servir l'[escala europea](${U.bpaScale}) de cinc graus: 1 feble, 2 moderat, 3 marcat, 4 fort i 5 molt fort. Una persona amb raquetes ja compta com a «sobrecàrrega feble», i a partir del grau 3 «és possible el desencadenament d'allaus, fins i tot per sobrecàrrega feble». Segons [Protecció Civil](${U.civilAvalanche}), el 90 % dels accidents són allaus que desencadenen els mateixos afectats.`,
      `Per al temps, el Meteocat té una [predicció del Pirineu](${U.meteocatPyrenees}) vàlida per sobre dels 1.500 metres i un mapa d'[observació de pluja o neu](${U.meteocatRainSnow}); l'ICGC publica el gruix de neu a [InfoGruixNEU](${U.gruix}). I per al gruix d'avui a les estacions del Meteocat, ${b2link("snowNow", "ca", "la nostra pàgina de neu al Pirineu avui")}.`,
    ],
    checkTitle: "Abans de sortir",
    check: [
      "l'estat de l'estació i quines activitats estan obertes;",
      "si cal comprar en línia (Núria sempre; Vallter, els dies de temporada alta);",
      "l'R3 i els autobusos de substitució;",
      "la carretera (012) i les cadenes o els pneumàtics 3PMSF;",
      "la predicció del Meteocat i, fora de pistes, el butlletí d'allaus.",
    ],
    photosTitle: "Sobre les fotografies",
    photos: "No fem servir mai la fotografia d'una nevada antiga per donar a entendre que avui hi ha neu. Les imatges d'aquesta pàgina il·lustren el paisatge, no les condicions d'avui.",
    faq: [
      { question: "On hi ha neu a Catalunya?", answer: "Al Pirineu: a les estacions d'esquí i de muntanya, de la Vall de Núria i Vallter, al Ripollès, a la Molina, Espot, Port Ainé, Boí Taüll i la Val d'Aran, i al Prepirineu, als Rasos de Peguera. Si hi ha neu un dia concret, només ho diu el part de cada estació." },
      { question: "On es poden fer rutes amb raquetes de neu a Catalunya?", answer: "A les sis estacions d'FGC (la Molina, Vall de Núria, Vallter, Espot, Port Ainé i Boí Taüll), als circuits de les estacions d'esquí nòrdic del Tot Nòrdic, a la Val d'Aran i als Rasos de Peguera, al Berguedà." },
      { question: "Es pot veure la neu sense cotxe des de Barcelona?", answer: "Sí: la Vall de Núria (R3 fins a Ribes de Freser i cremallera) i la Molina (R3 fins a l'estació de la Molina) són les més fàcils. Aquest hivern l'R3 no circula entre Barcelona i la Garriga, i del 16 de novembre al 14 de desembre de 2026 tampoc fins a Figaró: aquests trams es fan en autobús." },
      { question: "Quan obren les estacions?", answer: "Baqueira Beret preveu obrir el 28 de novembre de 2026, si les condicions ho permeten, i les estacions d'FGC el 4 de desembre (Espot, el 5), també la Vall de Núria. Totes preveuen tancar el 4 d'abril de 2027 (consultat el 13 de novembre de 2026)." },
      { question: "Quant costa pujar a Núria?", answer: "El combinat TreNatura de Renfe (tren R3 i cremallera, anada i tornada) costa 40,20 € per adult i 30,70 € de 4 a 13 anys, preu publicat el 13 de novembre de 2026, i no val els dies feiners de novembre. Només el cremallera, anada i tornada des de Ribes, costa 34 € per adult amb les tarifes de la temporada 2026." },
      { question: "Es pot pujar al telecabina de la Molina sense esquiar?", answer: "Sí: el forfet de passeig del telecabina Cadí-Moixeró costa 20 € per adult i 10 € de 7 a 11 anys la temporada 2026-27, i l'última pujada és a les 16 h entre setmana i a les 15 h els caps de setmana i festius." },
      { question: "Cal portar cadenes per anar a la neu?", answer: "Si els senyals les fan obligatòries, sí: cadenes o altres dispositius antilliscants autoritzats en una roda motriu de cada costat, o pneumàtics d'hivern. Des del 30 de maig de 2026, per a cotxes i furgonetes de fins a 3.500 kg, han de ser pneumàtics certificats 3PMSF a tots els eixos; el marcatge M+S sol no n'hi ha prou." },
      { question: "Amb raquetes cal mirar el perill d'allaus?", answer: "Fora dels circuits de les estacions, sí. L'escala europea compta una persona amb raquetes com a sobrecàrrega feble, i a partir del grau 3 (marcat) aquesta sobrecàrrega ja pot desencadenar allaus. L'ICGC publica el butlletí cada dia a partir de l'1 de desembre de 2026." },
    ],
  },
  es: {
    path: "guias/donde-ver-nieve-cataluna-sin-esquiar",
    title: "Dónde ver nieve en Cataluña sin esquiar: sitios, rutas con raquetas y escapadas en tren",
    seoTitle: "Dónde ver nieve en Cataluña sin esquiar: sitios y rutas",
    seoDescription:
      "Dónde ver nieve en Cataluña sin esquiar: rutas de invierno con raquetas, trineos y telecabinas en las estaciones del Pirineo, y cómo llegar en tren o bus.",
    excerpt:
      "Dónde jugar en la nieve sin esquiar: trineos, raquetas y telecabinas en el Pirineo, cómo llegar en tren, las cadenas y los neumáticos de invierno y el boletín de aludes.",
    lead: `Para ver y pisar nieve sin esquiar, lo más fácil desde Barcelona sin coche es la **Vall de Núria** (tren R3 hasta Ribes de Freser y cremallera, que circula cada día de diciembre a abril) o **La Molina** (estación propia de la R3 y el telecabina Cadí-Moixeró, 20 € por adulto la temporada 2026-27). Las estaciones de FGC abren el **4 de diciembre de 2026** (Espot, el 5) y Baqueira prevé abrir el **28 de noviembre**, si las condiciones lo permiten. Antes de salir: la R3 sigue sin circular entre Barcelona y La Garriga, y con nieve en la carretera hay que llevar cadenas o neumáticos de invierno 3PMSF.`,
    factsTitle: "Nieve sin esquiar, de un vistazo",
    facts: [
      { label: "Sin coche", value: "Vall de Núria (R3 + cremallera) y La Molina (R3)" },
      { label: "Apertura 2026-27", value: "FGC, 4 de diciembre (Espot, 5); Baqueira, 28 de noviembre; cierran el 4 de abril de 2027" },
      { label: "Trineos y parques lúdicos", value: "Núria, La Molina, Vallter, Espot y Port Ainé" },
      { label: "Raquetas de nieve", value: "Circuitos en las seis estaciones de FGC, el Tot Nòrdic y los Rasos de Peguera" },
      { label: "Coche con nieve", value: "Cadenas o neumáticos 3PMSF en todos los ejes (BOE, desde el 30 de mayo de 2026)" },
      { label: "Aludes", value: "Boletín diario del ICGC a partir del 1 de diciembre de 2026" },
    ],
    notReportTitle: "Esto no es un parte de nieve",
    notReport: `Esta guía explica **dónde plantear una escapada invernal**. No predice las condiciones de una fecha concreta: eso solo lo puede decir la estación ese día. Antes de salir hay que revisar el estado de la estación, la meteorología, las carreteras y qué actividades están abiertas. Para el espesor de nieve que mide hoy Meteocat en sus estaciones de montaña, mira ${b2link("snowNow", "es", "si hay nieve en el Pirineo hoy")}.`,
    carfreeTitle: "Nieve sin coche: en tren a Núria y a La Molina",
    carfree: [
      `**Vall de Núria.** Con la R3 hasta la estación de Ribes de Freser y, desde Ribes-Enllaç, el cremallera de FGC, que sube 1.000 metros en 12,5 km y 40 minutos. El calendario 2026-27 del cremallera tiene servicio cada día del 1 de diciembre al 30 de abril, y FGC pide comprar el billete online. El combinado **TreNatura** de Renfe incluye el tren de ida y vuelta desde cualquier estación de Rodalies y el cremallera: **40,20 €** por adulto y **30,70 €** de 4 a 13 años (precio publicado el 13 de noviembre de 2026), y no vale los días laborables de noviembre. Si vas por tu cuenta, las tarifas del cremallera publicadas son las de la temporada 2026: 34 € ida y vuelta desde Ribes por adulto. Todo lo demás, en ${b2link("nuria", "es", "la guía del cremallera de Núria")}.`,
      `**La Molina.** Tiene estación propia en la R3. Desde la estación, un bus interno sube hasta pie de pistas (Pista Llarga). Arriba, el **telecabina Cadí-Moixeró** sube hasta la Tosa d'Alp, a más de 2.500 metros, «especialment per als qui desitgen gaudir de la muntanya sense esquiar» (sobre todo para quien quiere disfrutar de la montaña sin esquiar): el forfait de paseo 2026-27 cuesta **20 €** por adulto y **10 €** de 7 a 11 años. La última subida para el paseo es a las 16 h de lunes a viernes y a las 15 h los fines de semana y festivos, y el telecabina está adaptado para personas con movilidad reducida. La Molina también anuncia el **Bus Natura** desde Barcelona, Sabadell, Terrassa y Manresa, con el forfait de paseo incluido, los miércoles, viernes, sábados y domingos; las fechas de esta temporada aún no se han publicado.`,
      `Para los horarios de la R3, mira ${b2link("cerdanya", "es", "los trenes a la Cerdanya")}.`,
    ],
    r3Title: "La R3 este invierno: dónde hay autobuses",
    r3: [
      `**Entre Barcelona y La Garriga no hay trenes de la R3.** Según [Rodalies](${U.r3}), entre L'Hospitalet de Llobregat y Fabra i Puig o Montcada Bifurcació circula la R4, los trenes de la R3 van solo de La Garriga a Puigcerdà y La Tor de Querol, y la línea tiene el 50 % de los trenes que tenía antes del 20 de enero. El resto del trayecto se hace en autobús, con horarios nuevos desde el [9 de noviembre de 2026](${U.r3Buses}). Rodalies no da fecha de final.`,
      `**Del 16 de noviembre al 14 de diciembre de 2026, tampoco entre La Garriga y Figaró**, por obras de Adif: hay autobuses, y los trenes hacia el norte salen de Sant Martí de Centelles ([aviso de Rodalies](${U.r3Figaro})).`,
      "Los billetes de Rodalies valen para los autobuses si los validas en la estación de origen, y el TreNatura sigue vigente durante la interrupción. Información de Rodalies: 900 41 00 41.",
    ],
    routesTitle: "Sitios de nieve en Cataluña: dónde hacer raquetas y jugar en la nieve",
    routesIntro: "Las raquetas de nieve son la forma más sencilla de caminar por la nieve sin saber esquiar, y los trineos y los parques lúdicos, la forma de jugar en ella. Esto es lo que ofrece cada operador:",
    routesCaption: "Dónde hacer raquetas y jugar en la nieve sin esquiar en Cataluña",
    routesHeaders: ["Lugar", "Comarca", "Sin esquiar", "Sin coche"],
    routes: [
      ["Vall de Núria", "Ripollès", "Parque lúdico con trineos y tubbies, circuitos de raquetas gratuitos, teleférico de la Coma del Clot, salidas en máquina pisanieves", "R3 hasta Ribes de Freser y cremallera"],
      ["La Molina", "Cerdanya", "Telecabina Cadí-Moixeró, pista de trineos Coll Sisè, raquetas, circuito «Descoberta de la Fauna»", "R3 hasta la estación de La Molina; Bus Natura"],
      ["Vallter", "Ripollès", "Pista de trineos y raquetas de nieve", "Bus de esquí: fechas 2026-27 no publicadas"],
      ["Espot", "Pallars Sobirà", "Parque lúdico con tubing y trineos, raquetas con guía hasta la Creu de l'Eixol", "Bus de esquí: fechas 2026-27 no publicadas"],
      ["Port Ainé", "Pallars Sobirà", "Parque lúdico con tubing, trineos y parque de aventura en los árboles; dos rutas de raquetas", "Bus de esquí: fechas 2026-27 no publicadas"],
      ["Boí Taüll", "Alta Ribagorça", "Raquetas con guía y tirolina doble", "Bus de la Neu desde Vilaller (calendario provisional)"],
      ["Val d'Aran", "Aran", "Raquetas, esquí nórdico, trineo con perros o a caballo, motos de nieve", "Autobús de ALSA desde Barcelona y Lleida (no hay tren)"],
      ["Tot Nòrdic", "Pirineo", "Circuitos de raquetas en las siete estaciones de esquí nórdico, como Guils Fontanera y Tuixent-La Vansa", "Sin conexión verificada"],
      ["Rasos de Peguera", "Berguedà", "Raquetas de nieve, con alquiler de material y guías", "Sin conexión verificada"],
    ],
    routesNote: "Según las páginas de cada operador (PIRINEU365, Visit Val d'Aran, Guils, Tuixent-La Vansa y la Oficina de Turismo del Berguedà), consultadas el 13/11/2026.",
    places: [
      ["Vall de Núria: nieve sin carretera", `No llega ninguna carretera. Este invierno 2026-27, el billete del cremallera incluye también el teleférico de la Coma del Clot, que sube hasta 2.170 metros. En el **Parque Lúdico** hay pistas de trineos y un circuito de tubbies gigantes (a partir de 3 años); los **circuitos de raquetas** señalizados son gratuitos y las raquetas se alquilan en la estación. Las **salidas en máquina pisanieves** (45 minutos, con guía) tienen fechas de diciembre de 2026 a marzo de 2027 y cuestan 23 € por adulto y 14 € de 4 a 13 años esta temporada. Si vas a subir a menudo, el forfait de cremallera de temporada de invierno (del 1 de diciembre de 2026 al 30 de abril de 2027) cuesta 62,50 € por adulto. Si vas en coche, FGC tiene tres aparcamientos gratuitos: Ribes-Enllaç, Ribes-Vila y Queralbs.`],
      ["La Molina y Masella", `Además del telecabina, La Molina tiene una **pista de trineos** (Coll Sisè), circuitos señalizados de **raquetas**, el circuito «Descoberta de la Fauna» y, en su lista de [actividades para no esquiadores](${U.molinaActivities}), un parque de aventura en los árboles, marcha nórdica, spa y bolera. La estación abre cada día del 4 de diciembre de 2026 al 4 de abril de 2027. **Masella**, al lado, no publica actividades para no esquiadores ni fecha de apertura para 2026-27 (consultado el 13 de noviembre de 2026).`],
      ["Vallter", `Está en la cabecera del Ter, sobre ${b2link("setcases", "es", "Setcases")}. Tiene **pista de trineos** (los menores de 8 años deben entrar con un adulto) y raquetas con guía. Dos cosas importantes si no esquías: los días de temporada alta, **la compra online del forfait o del billete de trineo es obligatoria** para entrar en la estación, y los aparcamientos P5 y P6 son para quien quiere disfrutar de la montaña sin hacer ninguna actividad. Abre el 4 de diciembre y cierra el día de Navidad.`],
      ["Espot", "En el Parque Nacional de Aigüestortes i Estany de Sant Maurici. El **Parque Lúdico** (tubing de 140 metros, trineos y jardín de nieve) está en la cota 2000 y se sube con el telesilla de La Roca, que tiene forfait de peatón. Hay una salida guiada con raquetas hasta el mirador de la Creu de l'Eixol, de unas 2 horas, a partir de 10 años. Abre el 5 de diciembre."],
      ["Port Ainé", "En el Pallars Sobirà. El **Parque Lúdico** de la cota 2000 tiene trineos, tubing de 120 metros, jardín de nieve y parque de aventura en los árboles, con acceso de 3 horas. Para raquetas, un itinerario interpretativo de 1,5 km (unas 2 horas, a partir de 7 años) y la ruta al Pic de l'Orri (unas 3 horas, a partir de 12). Abre el 4 de diciembre."],
      ["Boí Taüll", "Es la estación con la cota más alta de Cataluña (2.751 m). Tiene raquetas con guía y una **tirolina doble** de 1.220 metros y 102 metros de desnivel, para personas de entre 50 y 120 kg, los fines de semana y festivos. El Bus de la Neu sube desde Vilaller, con un calendario 2026-27 aún provisional. Abre el 4 de diciembre."],
      ["Val d'Aran", `Baqueira Beret prevé abrir el sábado 28 de noviembre de 2026 y cerrar el domingo 4 de abril de 2027, «siempre que las condiciones lo permitan». Para quien no esquía, la [web de turismo de Aran](${U.aranActivities}) recoge raquetas de nieve, esquí nórdico, trineos con perros o a caballo y motos de nieve, con empresas del valle. Aran no tiene tren: ALSA tiene líneas regulares y servicios diarios desde Barcelona y Lleida.`],
      ["Rasos de Peguera: nieve en el Berguedà", `Según la [Oficina de Turismo del Berguedà](${U.bergueda}), los Rasos de Peguera (Castellar del Riu) son el lugar más concurrido y accesible para hacer raquetas de nieve en la comarca, con alquiler de material y guías; la Serra d'Ensija y el Coll de Pal son más tranquilos. La oficina aconseja informarse antes del estado de la nieve, llevar el material adecuado y contratar guías profesionales. Se va en coche.`],
      ["Esquí nórdico y raquetas: el Tot Nòrdic", "Las siete estaciones de la Mancomunitat d'Esquí Nòrdic comparten forfait. El de temporada 2026-27 de esquí + raquetas cuesta 175 € para adultos en Guils Fontanera, que está a 16 minutos de Puigcerdà y ofrece raquetas de nieve y trineos."],
    ],
    kidsTitle: "Nieve con niños: trineos y parques lúdicos",
    kids: "Para una primera vez en la nieve con críos: el Parque Lúdico de Núria (a partir de 3 años, y el cremallera ya es media excursión), la pista de trineos de La Molina, la de Vallter (los menores de 8 años, con un adulto) y los parques lúdicos de Espot y Port Ainé, con tubing. La tirolina de Boí Taüll pide un mínimo de 50 kg.",
    chainsTitle: "Cadenas y neumáticos de invierno: qué dice la norma",
    chains: [
      `Cuando las señales indican que las cadenas son obligatorias o recomendadas, el [Reglamento General de Vehículos](${U.rgv}) (art. 12.5.2) obliga a colocar cadenas u otros dispositivos antideslizantes autorizados en al menos una rueda motriz de cada lado, o bien a llevar neumáticos especiales. Los paneles pueden mostrar dos señales distintas: «Obligatorio el uso de cadenas o neumáticos de invierno» y «Obligatorio neumáticos de invierno» ([Reglamento General de Circulación](${U.rgc}), anexo I).`,
      "**Novedad de este invierno:** desde el 30 de mayo de 2026 (Orden PJC/528/2026), para cumplir las restricciones de movilidad invernal, los coches y furgonetas de hasta 3.500 kg deben llevar neumáticos certificados **3PMSF** (el pictograma de la montaña de tres picos con un copo de nieve) **en todos los ejes**. El marcado M+S por sí solo ya no cuenta como neumático de invierno.",
      "Las fundas o calcetines textiles no se mencionan por su nombre: la norma habla de cadenas u «otros dispositivos antideslizantes autorizados». En autopistas y autovías con nieve, además, está prohibido adelantar y hay que circular por el carril de la derecha (art. 32.2 del Reglamento General de Circulación).",
    ],
    chainsTipsIntro: "Los consejos de Protecció Civil para conducir con nieve:",
    chainsTips: [
      "lleva las cadenas adecuadas para tu vehículo y asegúrate de que sabes ponerlas;",
      "si hay nieve en la calzada, para donde no interrumpas la circulación y ponlas en las ruedas motrices;",
      "no adelantes a las máquinas quitanieves;",
      "lleva la luz V16, que desde el 1 de enero de 2026 sustituye a los triángulos.",
    ],
    chainsAfter: `**Antes de salir, el estado de la carretera:** el teléfono 012 del Servei Català de Trànsit funciona las 24 horas (932 142 124 desde fuera de Cataluña), y el [Mapa Continu de Trànsit](${U.sctMap}) muestra las incidencias y las cámaras en tiempo real. Cuando nieva fuerte se activa el [plan NEUCAT](${U.neucat}), que puede prohibir la circulación de camiones en algunas vías.`,
    avalancheTitle: "Peligro de aludes y previsión: qué mirar antes de salir",
    avalanche: [
      `Si sales de los circuitos de las estaciones, con raquetas o a pie, mira el [Boletín de Peligro de Aludes del ICGC](${U.bpa}), que es válido fuera de pistas y de zonas controladas. Vuelve a ser diario **a partir del 1 de diciembre de 2026**, o antes si la nieve lo pide. Para Aran, el ICGC remite al [Centre de Lauegi d'Aran](${U.lauegi}).`,
      `El boletín usa la [escala europea](${U.bpaScale}) de cinco grados: 1 débil, 2 moderado, 3 notable, 4 fuerte y 5 muy fuerte. Una persona con raquetas ya cuenta como «sobrecarga débil», y a partir del grado 3 «és possible el desencadenament d'allaus, fins i tot per sobrecàrrega feble» (pueden desencadenarse aludes incluso con una sobrecarga débil). Según [Protecció Civil](${U.civilAvalanche}), el 90 % de los accidentes son aludes que desencadenan los propios afectados.`,
      `Para el tiempo, Meteocat tiene una [predicción del Pirineo](${U.meteocatPyrenees}) válida por encima de 1.500 metros y un mapa de [observación de lluvia o nieve](${U.meteocatRainSnow}); el ICGC publica el espesor de nieve en [InfoGruixNEU](${U.gruix}). Y para el espesor de hoy en las estaciones de Meteocat, ${b2link("snowNow", "es", "nuestra página de nieve en el Pirineo hoy")}.`,
    ],
    checkTitle: "Antes de salir",
    check: [
      "el estado de la estación y qué actividades están abiertas;",
      "si hay que comprar online (Núria siempre; Vallter, los días de temporada alta);",
      "la R3 y los autobuses de sustitución;",
      "la carretera (012) y las cadenas o los neumáticos 3PMSF;",
      "la predicción de Meteocat y, fuera de pistas, el boletín de aludes.",
    ],
    photosTitle: "Sobre las fotografías",
    photos: "Nunca usamos la foto de una nevada antigua para dar a entender que hoy hay nieve. Las imágenes de esta página ilustran el paisaje, no las condiciones de hoy.",
    faq: [
      { question: "¿Dónde nieva en Cataluña?", answer: "En el Pirineo: en las estaciones de esquí y de montaña, de la Vall de Núria y Vallter, en el Ripollès, a La Molina, Espot, Port Ainé, Boí Taüll y la Val d'Aran, y en el Prepirineo, en los Rasos de Peguera. Si hay nieve un día concreto, solo lo dice el parte de cada estación." },
      { question: "¿Dónde hacer rutas con raquetas de nieve en Cataluña?", answer: "En las seis estaciones de FGC (La Molina, Vall de Núria, Vallter, Espot, Port Ainé y Boí Taüll), en los circuitos de las estaciones de esquí nórdico del Tot Nòrdic, en la Val d'Aran y en los Rasos de Peguera, en el Berguedà." },
      { question: "¿Se puede ver la nieve sin coche desde Barcelona?", answer: "Sí: la Vall de Núria (R3 hasta Ribes de Freser y cremallera) y La Molina (R3 hasta la estación de La Molina) son las más fáciles. Este invierno la R3 no circula entre Barcelona y La Garriga, y del 16 de noviembre al 14 de diciembre de 2026 tampoco hasta Figaró: esos tramos se hacen en autobús." },
      { question: "¿Cuándo abren las estaciones?", answer: "Baqueira Beret prevé abrir el 28 de noviembre de 2026, si las condiciones lo permiten, y las estaciones de FGC el 4 de diciembre (Espot, el 5), también la Vall de Núria. Todas prevén cerrar el 4 de abril de 2027 (consultado el 13 de noviembre de 2026)." },
      { question: "¿Cuánto cuesta subir a Núria?", answer: "El combinado TreNatura de Renfe (tren R3 y cremallera, ida y vuelta) cuesta 40,20 € por adulto y 30,70 € de 4 a 13 años, precio publicado el 13 de noviembre de 2026, y no vale los días laborables de noviembre. Solo el cremallera, ida y vuelta desde Ribes, cuesta 34 € por adulto con las tarifas de la temporada 2026." },
      { question: "¿Se puede subir al telecabina de La Molina sin esquiar?", answer: "Sí: el forfait de paseo del telecabina Cadí-Moixeró cuesta 20 € por adulto y 10 € de 7 a 11 años la temporada 2026-27, y la última subida es a las 16 h entre semana y a las 15 h los fines de semana y festivos." },
      { question: "¿Hay que llevar cadenas para ir a la nieve?", answer: "Si las señales las hacen obligatorias, sí: cadenas u otros dispositivos antideslizantes autorizados en una rueda motriz de cada lado, o neumáticos de invierno. Desde el 30 de mayo de 2026, para coches y furgonetas de hasta 3.500 kg, deben ser neumáticos certificados 3PMSF en todos los ejes; el marcado M+S solo no basta." },
      { question: "¿Con raquetas hay que mirar el peligro de aludes?", answer: "Fuera de los circuitos de las estaciones, sí. La escala europea cuenta a una persona con raquetas como sobrecarga débil, y a partir del grado 3 (notable) esa sobrecarga ya puede desencadenar aludes. El ICGC publica el boletín cada día a partir del 1 de diciembre de 2026." },
    ],
  },
  en: {
    path: "guides/where-to-see-snow-catalonia-without-skiing",
    title: "Where to see snow in Catalonia without skiing: snowshoe routes and Pyrenees trips",
    seoTitle: "Snow in Catalonia without skiing: snowshoe routes, trips",
    seoDescription:
      "Where to see snow in Catalonia without skiing: snowshoe routes, sledging and gondola rides at the Pyrenees resorts, and how to get there by train or bus.",
    excerpt:
      "Where to play in the snow without skiing: sledging, snowshoes and gondolas in the Pyrenees, getting there by train, chains and winter tyres, and the avalanche bulletin.",
    lead: `To see and walk on snow without skiing, the easiest trips from Barcelona without a car are **Vall de Núria** (the R3 train to Ribes de Freser, then the rack railway, which runs every day from December to April) and **La Molina** (its own R3 station and the Cadí-Moixeró gondola, €20 per adult in the 2026-27 season). The FGC resorts open on **4 December 2026** (Espot on the 5th) and Baqueira plans to open on **28 November**, conditions permitting. Before you go: the R3 still does not run between Barcelona and La Garriga, and with snow on the road you need chains or 3PMSF winter tyres.`,
    factsTitle: "Snow without skiing at a glance",
    facts: [
      { label: "Without a car", value: "Vall de Núria (R3 + rack railway) and La Molina (R3)" },
      { label: "2026-27 opening", value: "FGC, 4 December (Espot, 5); Baqueira, 28 November; all close on 4 April 2027" },
      { label: "Sledging and play areas", value: "Núria, La Molina, Vallter, Espot and Port Ainé" },
      { label: "Snowshoeing", value: "Circuits at the six FGC resorts, Tot Nòrdic and Rasos de Peguera" },
      { label: "Driving in snow", value: "Chains, or 3PMSF tyres on every axle (BOE, since 30 May 2026)" },
      { label: "Avalanches", value: "Daily ICGC bulletin from 1 December 2026" },
    ],
    notReportTitle: "This is not a live snow report",
    notReport: `This page is about **where to plan a winter trip**. It does not predict conditions on a given date: only the resort can tell you that on the day. Before you set off, check the resort's status, the weather, the roads and which activities are running. For the snow depth Meteocat measures today at its mountain weather stations, see ${b2link("snowNow", "en", "whether there is snow in the Pyrenees today")}.`,
    carfreeTitle: "Snow without a car: by train to Núria and La Molina",
    carfree: [
      `**Vall de Núria.** Take the R3 to Ribes de Freser station and, from Ribes-Enllaç, the FGC rack railway, which climbs 1,000 metres over 12.5 km in 40 minutes. Its 2026-27 calendar has trains every day from 1 December to 30 April, and FGC asks you to buy tickets online. Renfe's **TreNatura** combined ticket covers the return train from any Rodalies station plus the rack railway: **€40.20** per adult and **€30.70** for ages 4 to 13 (price published on 13 November 2026), not valid on weekdays in November. On your own, the published rack-railway fares are those of the 2026 season: €34 return from Ribes per adult. Everything else is in ${b2link("nuria", "en", "our Núria rack railway guide")}.`,
      `**La Molina.** It has its own R3 station. From the station an internal bus goes up to the slopes (Pista Llarga). Up top, the **Cadí-Moixeró gondola** climbs to the Tosa d'Alp, above 2,500 metres, "especially for those who want to enjoy the mountain without skiing": the 2026-27 sightseeing pass costs **€20** per adult and **€10** for ages 7 to 11. The last ride up for sightseeing is at 16:00 on weekdays and 15:00 at weekends and on public holidays, and the gondola is adapted for people with reduced mobility. La Molina also advertises the **Bus Natura** from Barcelona, Sabadell, Terrassa and Manresa, with the sightseeing pass included, on Wednesdays, Fridays, Saturdays and Sundays; this season's dates are not out yet.`,
      `For R3 times, see ${b2link("cerdanya", "en", "trains to Cerdanya")}.`,
    ],
    r3Title: "The R3 this winter: where the buses are",
    r3: [
      `**No R3 trains run between Barcelona and La Garriga.** According to [Rodalies](${U.r3}), the R4 runs between L'Hospitalet de Llobregat and Fabra i Puig or Montcada Bifurcació, R3 trains run only from La Garriga to Puigcerdà and La Tor de Querol, and the line has 50% of the trains it had before 20 January. The rest of the way is by bus, on new timetables since [9 November 2026](${U.r3Buses}). Rodalies gives no end date.`,
      `**From 16 November to 14 December 2026, there are no trains between La Garriga and Figaró either**, because of Adif engineering works: buses replace them, and northbound trains start at Sant Martí de Centelles ([Rodalies notice](${U.r3Figaro})).`,
      "Rodalies tickets are valid on the buses if you validate them at your departure station, and TreNatura remains valid during the closure. Rodalies information line: 900 41 00 41.",
    ],
    routesTitle: "Winter snowshoe routes and snow play in Catalonia",
    routesIntro: "Snowshoes are the simplest way to walk on snow without knowing how to ski; sledges and play areas are the way to play in it. This is what each operator offers:",
    routesCaption: "Where to snowshoe and play in the snow without skiing in Catalonia",
    routesHeaders: ["Place", "Area", "Without skiing", "Without a car"],
    routes: [
      ["Vall de Núria", "Ripollès", "Play park with sledges and tubbies, free snowshoe circuits, Coma del Clot cable car, snowcat rides", "R3 to Ribes de Freser, then rack railway"],
      ["La Molina", "Cerdanya", "Cadí-Moixeró gondola, Coll Sisè sledging run, snowshoeing, 'Descoberta de la Fauna' circuit", "R3 to La Molina station; Bus Natura"],
      ["Vallter", "Ripollès", "Sledging run and snowshoeing", "Ski bus: 2026-27 dates not published"],
      ["Espot", "Pallars Sobirà", "Play park with tubing and sledges, guided snowshoeing to the Creu de l'Eixol", "Ski bus: 2026-27 dates not published"],
      ["Port Ainé", "Pallars Sobirà", "Play park with tubing, sledges and a treetop adventure park; two snowshoe routes", "Ski bus: 2026-27 dates not published"],
      ["Boí Taüll", "Alta Ribagorça", "Guided snowshoeing and a double zip line", "Bus de la Neu from Vilaller (provisional calendar)"],
      ["Val d'Aran", "Aran", "Snowshoeing, cross-country skiing, dog or horse sledding, snowmobiles", "ALSA coach from Barcelona and Lleida (no train)"],
      ["Tot Nòrdic", "Pyrenees", "Snowshoe circuits at the seven cross-country stations, such as Guils Fontanera and Tuixent-La Vansa", "No verified connection"],
      ["Rasos de Peguera", "Berguedà", "Snowshoeing, with equipment hire and guides", "No verified connection"],
    ],
    routesNote: "From each operator's pages (PIRINEU365, Visit Val d'Aran, Guils, Tuixent-La Vansa and the Berguedà tourist office), checked 13/11/2026.",
    places: [
      ["Vall de Núria: snow with no road", `No road reaches it. This 2026-27 winter the rack-railway ticket also includes the Coma del Clot cable car, which climbs to 2,170 metres. The **play park** has sledging runs and a giant tubby circuit (from age 3); the signposted **snowshoe circuits** are free and snowshoes can be hired at the resort. **Snowcat rides** (45 minutes, guided) have dates from December 2026 to March 2027 and cost €23 per adult and €14 for ages 4 to 13 this season. If you will go often, the winter rack-railway season pass (1 December 2026 to 30 April 2027) costs €62.50 per adult. By car, FGC has three free car parks: Ribes-Enllaç, Ribes-Vila and Queralbs.`],
      ["La Molina and Masella", `Besides the gondola, La Molina has a **sledging run** (Coll Sisè), signposted **snowshoe** circuits, the 'Descoberta de la Fauna' trail and, on its list of [activities for non-skiers](${U.molinaActivities}), a treetop adventure park, Nordic walking, a spa and bowling. The resort opens every day from 4 December 2026 to 4 April 2027. **Masella**, next door, publishes no non-skier activities and no 2026-27 opening date (checked 13 November 2026).`],
      ["Vallter", `At the head of the Ter valley, above ${b2link("setcases", "en", "Setcases")}. It has a **sledging run** (under-8s must go in with an adult) and guided snowshoeing. Two things matter if you do not ski: on high-season days **buying the pass or sledging ticket online beforehand is compulsory** to enter the resort, and car parks P5 and P6 are for people who want to enjoy the mountain without doing any activity. It opens on 4 December and is closed on Christmas Day.`],
      ["Espot", "In Aigüestortes i Estany de Sant Maurici National Park. The **play park** (a 140-metre tubing run, sledges and a snow garden) is at 2,000 m and is reached on the La Roca chairlift, which has a pedestrian pass. There is a guided snowshoe outing to the Creu de l'Eixol viewpoint, about 2 hours, from age 10. It opens on 5 December."],
      ["Port Ainé", "In the Pallars Sobirà. The **play park** at 2,000 m has sledges, a 120-metre tubing run, a snow garden and a treetop adventure park, with 3-hour access. For snowshoes there is a 1.5 km interpretive loop (about 2 hours, from age 7) and the route to Pic de l'Orri (about 3 hours, from age 12). It opens on 4 December."],
      ["Boí Taüll", "The highest resort in Catalonia (2,751 m). It offers guided snowshoeing and a **double zip line** 1,220 metres long with a 102-metre drop, for riders between 50 and 120 kg, at weekends and on public holidays. The Bus de la Neu runs up from Vilaller, on a 2026-27 calendar that is still provisional. It opens on 4 December."],
      ["Val d'Aran", `Baqueira Beret plans to open on Saturday 28 November 2026 and close on Sunday 4 April 2027, "siempre que las condiciones lo permitan" (conditions permitting). For non-skiers, the [Aran tourism website](${U.aranActivities}) lists snowshoeing, cross-country skiing, dog and horse sledding and snowmobiles, run by local companies. Aran has no railway: ALSA runs regular routes and daily services from Barcelona and Lleida.`],
      ["Rasos de Peguera: snow in the Berguedà", `According to the [Berguedà tourist office](${U.bergueda}), Rasos de Peguera (Castellar del Riu) is the busiest and most accessible place for snowshoeing in the comarca, with equipment hire and guides; the Serra d'Ensija and Coll de Pal are quieter. The office advises checking the snow beforehand, bringing the right equipment and hiring professional guides. You need a car.`],
      ["Cross-country and snowshoes: Tot Nòrdic", "The seven stations of the Mancomunitat d'Esquí Nòrdic share one pass. The 2026-27 ski + snowshoe season pass costs €175 for adults at Guils Fontanera, which is 16 minutes from Puigcerdà and offers snowshoeing and sledging."],
    ],
    kidsTitle: "Snow with children: sledging and play areas",
    kids: "For a first day in the snow with small children: the Núria play park (from age 3, and the rack railway is half the outing), the sledging run at La Molina, the one at Vallter (under-8s with an adult) and the play parks at Espot and Port Ainé, with tubing. The Boí Taüll zip line needs a minimum of 50 kg.",
    chainsTitle: "Chains and winter tyres: what the rules say",
    chains: [
      `When signs make chains compulsory or recommended, Spain's [General Vehicle Regulations](${U.rgv}) (art. 12.5.2) require chains or other approved anti-skid devices on at least one driving wheel on each side, or special tyres. Overhead signs can show two different messages: "chains or winter tyres compulsory" and "winter tyres compulsory" ([General Traffic Regulations](${U.rgc}), annex I).`,
      "**New this winter:** since 30 May 2026 (Orden PJC/528/2026), to comply with winter traffic restrictions, cars and vans up to 3,500 kg must have **3PMSF**-certified tyres (the three-peak mountain and snowflake symbol) **on every axle**. An M+S marking on its own no longer counts as a winter tyre.",
      "Textile snow socks are not named: the rules speak of chains or \"other approved anti-skid devices\". On motorways and dual carriageways with snow, overtaking is also banned and you must keep to the right-hand lane (General Traffic Regulations, art. 32.2).",
    ],
    chainsTipsIntro: "Protecció Civil's advice for driving in snow:",
    chainsTips: [
      "carry the right chains for your vehicle and make sure you know how to fit them;",
      "if there is snow on the road, stop where you do not block traffic and fit them on the driving wheels;",
      "do not overtake snowploughs;",
      "carry the V16 warning light, which replaced warning triangles on 1 January 2026.",
    ],
    chainsAfter: `**Before you set off, check the road:** the Servei Català de Trànsit's 012 line runs 24 hours a day (932 142 124 from outside Catalonia), and its [Mapa Continu de Trànsit](${U.sctMap}) shows incidents and traffic cameras in real time. In heavy snow the Generalitat activates the [NEUCAT plan](${U.neucat}), which can ban lorries from some roads.`,
    avalancheTitle: "Avalanche danger and forecasts: what to check before you go",
    avalanche: [
      `If you leave the resorts' marked circuits, on snowshoes or on foot, check the [ICGC Avalanche Danger Bulletin](${U.bpa}), which covers terrain off the pistes and outside controlled areas. It becomes daily again **from 1 December 2026**, or earlier if the snow requires it. For Aran, the ICGC points to the [Centre de Lauegi d'Aran](${U.lauegi}).`,
      `The bulletin uses the five-level [European scale](${U.bpaScale}): 1 low, 2 moderate, 3 considerable, 4 high and 5 very high. A person on snowshoes already counts as a "light additional load", and from level 3 avalanches can be triggered "even by a light additional load". According to [Protecció Civil](${U.civilAvalanche}), 90% of accidents are avalanches triggered by the victims themselves.`,
      `For the weather, Meteocat publishes a [Pyrenees forecast](${U.meteocatPyrenees}) valid above 1,500 metres and a [rain or snow observation map](${U.meteocatRainSnow}); the ICGC publishes snow depth on [InfoGruixNEU](${U.gruix}). For today's depth at Meteocat's stations, see ${b2link("snowNow", "en", "our snow in the Pyrenees today page")}.`,
    ],
    checkTitle: "Always check before travelling",
    check: [
      "the resort's status and which activities are running;",
      "whether you must buy online (always at Núria; at Vallter on high-season days);",
      "the R3 and the replacement buses;",
      "the road (012) and your chains or 3PMSF tyres;",
      "Meteocat's forecast and, off the pistes, the avalanche bulletin.",
    ],
    photosTitle: "About the photographs",
    photos: "We never use a photograph of an old snowfall to imply there is snow today. The pictures on this page show the landscape, not today's conditions.",
    faq: [
      { question: "Does it snow in Catalonia?", answer: "Yes, in the Pyrenees and Pre-Pyrenees: at the resorts from Vall de Núria and Vallter to La Molina, Espot, Port Ainé, Boí Taüll and the Val d'Aran, and at Rasos de Peguera in the Berguedà. Whether there is snow on a given day is in each resort's snow report." },
      { question: "Where can you go snowshoeing in Catalonia?", answer: "At the six FGC resorts (La Molina, Vall de Núria, Vallter, Espot, Port Ainé and Boí Taüll), on the Tot Nòrdic cross-country circuits, in the Val d'Aran and at Rasos de Peguera in the Berguedà." },
      { question: "Can you see snow from Barcelona without a car?", answer: "Yes: Vall de Núria (R3 to Ribes de Freser and the rack railway) and La Molina (R3 to La Molina station) are the easiest. This winter the R3 does not run between Barcelona and La Garriga, nor as far as Figaró from 16 November to 14 December 2026: buses cover those stretches." },
      { question: "When do the resorts open?", answer: "Baqueira Beret plans to open on 28 November 2026, conditions permitting, and the FGC resorts on 4 December (Espot, 5 December), Vall de Núria included. All plan to close on 4 April 2027 (checked 13 November 2026)." },
      { question: "How much does it cost to go up to Núria?", answer: "Renfe's TreNatura (R3 train and rack railway, return) costs €40.20 per adult and €30.70 for ages 4 to 13, as published on 13 November 2026, and is not valid on weekdays in November. The rack railway alone, return from Ribes, costs €34 per adult on the 2026 season fares." },
      { question: "Can you ride the La Molina gondola without skiing?", answer: "Yes: the Cadí-Moixeró gondola sightseeing pass costs €20 per adult and €10 for ages 7 to 11 in the 2026-27 season, and the last ride up is at 16:00 on weekdays and 15:00 at weekends and on public holidays." },
      { question: "Do I need snow chains to drive to the snow?", answer: "If the signs make them compulsory, yes: chains or other approved anti-skid devices on one driving wheel on each side, or winter tyres. Since 30 May 2026, for cars and vans up to 3,500 kg those tyres must be 3PMSF-certified on every axle; an M+S marking alone is not enough." },
      { question: "Do snowshoers need to check the avalanche danger?", answer: "Off the resorts' marked circuits, yes. The European scale counts a person on snowshoes as a light additional load, and from level 3 (considerable) that load can already trigger avalanches. The ICGC publishes the bulletin daily from 1 December 2026." },
    ],
  },
};

const RELATED = ["ski", "snowNow", "nuria", "cerdanya", "ripolles", "setcases"] as const;

export function buildSnowBody(locale: Locale): Block[] {
  const t = COPY[locale];
  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    callout("warning", t.notReportTitle, t.notReport),
    ...h2(t.carfreeTitle, ...t.carfree),
    ...h2(t.r3Title, ...t.r3),
    ...h2(t.routesTitle, t.routesIntro),
    table(t.routesCaption, t.routesHeaders, t.routes, t.routesNote),
    ...t.places.flatMap(([heading, text]) => h2(heading, text)),
    ...h2(t.kidsTitle, t.kids),
    ...h2(t.chainsTitle, ...t.chains, t.chainsTipsIntro),
    list(...t.chainsTips),
    ...paras(t.chainsAfter),
    ...h2(t.avalancheTitle, ...t.avalanche),
    ...h2(t.checkTitle),
    list(...t.check),
    callout("info", t.photosTitle, t.photos),
    faq(t.faq),
    ...paras(verifiedLine(locale, SNOW_AS_OF)),
    ...b2Related([...RELATED], locale),
  ];
}

function edition(locale: Locale) {
  const t = COPY[locale];
  return { path: t.path, title: t.title, seoTitle: t.seoTitle, seoDescription: t.seoDescription, excerpt: t.excerpt, blocks: buildSnowBody(locale) };
}

export const SNOW: B2Article = {
  key: "snow",
  entryKey: "guide-snow-without-skiing",
  categoryKey: "mountain",
  sources: SOURCES,
  heroKey: "b2-neu-vall-de-nuria",
  secondaryKey: "b2-neu-la-molina",
  secondaryAlt: {
    ca: "Les muntanyes al voltant de La Molina",
    es: "Las montañas alrededor de La Molina",
    en: "The mountains around La Molina",
  },
  secondaryCaption: {
    ca: "Fotografia d'arxiu de l'entorn de La Molina. No mostra les condicions d'avui.",
    es: "Fotografía de archivo del entorno de La Molina. No muestra las condiciones de hoy.",
    en: "An archive photograph of the La Molina area. It does not show today's conditions.",
  },
  heroAlt: {
    ca: "Activitats d'hivern al parc lúdic de la Vall de Núria",
    es: "Actividades de invierno en el parque lúdico de la Vall de Núria",
    en: "Winter activities at the Vall de Núria leisure park",
  },
  heroCaption: {
    ca: "Fotografia d'arxiu del parc lúdic de Núria. No indica les condicions d'avui: consulta l'estació.",
    es: "Fotografía de archivo del parque lúdico de Núria. No indica las condiciones de hoy: consulta la estación.",
    en: "An archive photograph of the Núria leisure park. It does not show today's conditions: check with the resort.",
  },
  verifiedAt: SNOW_AS_OF,
  publishedAt: "2026-09-29T12:20:00+02:00",
  editions: {
    ca: edition("ca"),
    es: edition("es"),
    en: edition("en"),
  },
};
