import type { Locale } from "@/lib/i18n/config";

import {
  b2link,
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
import { withGlance } from "./day-trip-glance";

/**
 * Vall de Núria from Barcelona: the Cremallera, fares, the R3 and the valley.
 *
 * Every figure is from FGC (turistren.cat, pirineu365.cat), Renfe, Rodalies
 * or the Parc Natural, checked on 12 Oct 2026
 * (research_notes/blog-batch-03/nuria.md).
 *
 * The 2026 fares carry their own expiry: FGC prints them "vigents fins el 30
 * de novembre de 2026", and the copy says so beside the table. Since 27 Nov
 * 2026 the table carries FGC's winter 2026-27 leaflet ("vigents fins a 30 de
 * novembre de 2027") and the 2026 figures sit in its note until they lapse.
 * (Originally: no clock times at all — FGC's timetable splits low and high
 * season with per-day exceptions, and the R3 is running a disrupted service —
 * and no journey time from Barcelona for the same reason; the low-season
 * table came on 23 Oct.) Not printed either:
 * a November "annual closure" (no source says so; the station calendar shows
 * weekdays closed, weekends open), a standalone Telefèric price (FGC's own
 * pages disagree) and the Ski Tren price (no season label).
 */

// 27 Nov 2026 re-read (ci-fonts, batch 8V; curl + pdftotext + pdftoppm, the
// calendars also parsed from the HTML of the winter practical-information page):
// - FGC's winter leaflet "HIVERN 2026-2027 / TARIFES I HORARIS"
//   (pirineu365.cat/wp-content/uploads/2026/11/VdN_Cremallera-Flyer-Tarifes-i-
//   Horaris-HIVERN-26-27_V4-1-1.pdf, linked from the winter practical page):
//   return Ribes/Queralbs 35,50 / 32,50 (14-64), 23 / 21 (4-13), 30 / 26,50
//   (65+); single 24,50 / 22,50, 16 / 14,50, 21 / 19; season ticket 114,50 /
//   72,50 "Vàlid un any des de la data de compra"; winter season ticket 80 / 51
//   "Vàlid de l'1 de desembre al 30 d'abril"; "Tots els preus són per persona,
//   inclouen el 10% d'IVA i són vigents fins a 30 de novembre de 2027".
//   Timetable: low season = the autumn rows plus 8.35 from Ribes-Enllaç
//   ("Circula sempre que l'estació d'esquí estigui oberta"); the 18.05/20.10 up
//   and 19.00/21.00 down rows "Circula tots els divendres (menys el 25 de
//   desembre)". High season: last regular train down 18.05; the 19.00 down
//   "Circula tots els divendres, el 5, 26, 27, 28, 29 i 30 de desembre, tots els
//   dissabtes de gener i febrer i el 6 i 13 de març"; 21.00 Fridays.
//   Calendar (leaflet and the page's HTML calendar agree): December high season
//   5-8 and 26-31, "Horari especial" 25, low season the rest.
// - Conflict: the Vall de Núria rates page (pirineu365.cat/valldenuria/estacio/
//   tarifes/, modified 23 Nov) still sells "Ribes-Núria | Anada i tornada"
//   at 34 EUR, "Cremallera de Temporada" 104 / 66 and "Cremallera de Temporada
//   d'Hivern" 62,50 / 39,50, with no end date; turistren.cat still shows the
//   2026 table ("Preus vàlids per a la temporada 2026") and the 2026 PDF still
//   says "vigents fins el 30 de novembre de 2026". The page prints the leaflet's
//   higher winter figures from 1 Dec and says the shop still showed the old ones.
// - Ski passes on the rates page unchanged (Ripollès 455 / 387 to 08/12,
//   Pirineu365 730, day 23,50, day + cremallera 41). Ski area calendar: open
//   4-8 Dec, 12-13 Dec, daily from 19 Dec; FGC news of 6 Nov 2026: the six
//   resorts "obriran les seves instal·lacions del 4 de desembre al 4 d'abril".
// - turistren.cat news of 26 Nov 2026: "Despertem els tions", "Els dies 5, 29 i
//   30 de desembre", cremallera return + theatre visit "per 18 € els adults i
//   11,50 € els infants i grans de 65 anys", "sortida a les 15:30 h i tornada a
//   les 19:00 h", online purchase in advance.
// - November: the only FGC notice is still the 2025 one (published 30 Oct
//   2025); the summer-site calendar marks November 2026 weekdays "Tancat" and
//   28-29 Nov open. Renfe TreNatura unchanged: 40,20 / 30,70, "Todo el año,
//   excepto días laborables del mes de noviembre".
const VERIFIED = "2026-11-27";

// Low-season timetable and one-way fares, read 23 Oct 2026 from the FGC
// leaflet "Primavera-Estiu-Tardor 2026" (the PDF in SOURCES): its text gives
// every row; which rows run when is shown only by colour, read from the
// rendered leaflet (research_notes/page1/castanyada_outings.md). The rows
// coloured for May weekends and 27 Jun-8 Sep are left out, the Friday-only
// ones are marked. High season adds trains; its days are a calendar graphic,
// so the page sends readers to it rather than listing them. Fares and
// timetable expire 30 Nov 2026.
// 27 Nov 2026: the winter 2026-27 low season keeps these rows and adds UP_SKI.
const UP_SKI: [string, string] = ["8.35", "9.14"];
const UP: [string, string][] = [["7.30*", "8.03"], ["9.35", "10.14"], ["11.10", "11.58"], ["12.55", "13.34"], ["14.30", "15.09"], ["16.25", "17.04"]];
const DOWN: [string, string][] = [["8.35", "9.15"], ["10.20", "11.00"], ["12.05", "12.45"], ["13.40", "14.20"], ["15.35", "16.15"], ["17.10", "17.50"]];
const UP_FRIDAY: [string, string][] = [["18.05", "18.44"], ["20.10", "20.49"]];
const DOWN_FRIDAY: [string, string][] = [["19.00", "19.50"], ["21.00", "21.40"]];

const SOURCES: B2Source[] = [
  { name: "Cremallera de Núria — fares and line", url: "https://turistren.cat/trens/cremallera-de-nuria/", publisher: "FGC Turistren" },
  { name: "Cremallera fares and timetables, spring–summer–autumn 2026 (PDF)", url: "https://turistren.cat/wp-content/uploads/2026/04/VdNcremallera_tarifes_horaris_primavera-estiu-tardor26_sense-marques-de-tall.pdf", publisher: "FGC Turistren" },
  { name: "Vall de Núria — practical information and station calendar", url: "https://pirineu365.cat/estiu/valldenuria/estacio/informacio-practica/", publisher: "FGC Pirineu365" },
  { name: "Vall de Núria — winter fares", url: "https://pirineu365.cat/valldenuria/estacio/tarifes/", publisher: "FGC Pirineu365" },
  { name: "Cremallera de Núria, tarifes i horaris hivern 2026-2027 (PDF)", url: "https://pirineu365.cat/wp-content/uploads/2026/11/VdN_Cremallera-Flyer-Tarifes-i-Horaris-HIVERN-26-27_V4-1-1.pdf", publisher: "FGC Pirineu365" },
  { name: "Vall de Núria — informació pràctica d'hivern (calendari del cremallera)", url: "https://pirineu365.cat/valldenuria/estacio/informacio-practica/", publisher: "FGC Pirineu365" },
  { name: "Vall de Núria: «Despertem els tions» amb un 50% de descompte en el Cremallera", url: "https://turistren.cat/vall-de-nuria-presenta-lactivitat-especial-de-tarda-despertem-els-tions-amb-un-50-de-descompte-en-el-cremallera/", publisher: "FGC Turistren" },
  { name: "Combinado TreNatura", url: "https://www.renfe.com/es/es/cercanias/rodalies-catalunya/ofertas-mas-populares/combi-trenatura", publisher: "Renfe" },
  { name: "R3: modificació del servei entre L'Hospitalet de Llobregat i Puigcerdà", url: "https://rodalies.gencat.cat/ca/detalls/article/02_02_PAT_R3", publisher: "Rodalies de Catalunya" },
  { name: "Itinerari 7: Camí vell de Núria", url: "https://parcsnaturals.gencat.cat/ca/xarxa-de-parcs/ter-freser/gaudeix-del-parc/equipaments-i-itineraris/itineraris/itineraris-interpretatius-del-parc-natural/cami-vell-nuria/", publisher: "Parcs Naturals de Catalunya" },
  { name: "Santuari de la Mare de Déu de Núria", url: "https://pirineu365.cat/valldenuria/estacio/santuari/", publisher: "FGC Pirineu365" },
  { name: "Visita al Santuari de Núria", url: "https://turistren.cat/experiencies/visita-santuari-nuria/", publisher: "FGC Turistren" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "escapades/vall-de-nuria-cremallera",
    title: "Cremallera de la Vall de Núria 2026: horaris, preus i com arribar-hi",
    seoTitle: "Cremallera Vall de Núria 2026: horaris i preus",
    seoDescription:
      "Cremallera de Núria, hivern 2026-27: 35,50 € anada i tornada des de Ribes, 32,50 € des de Queralbs, gratis fins a 3 anys. Horaris, desembre i com s'hi va.",
    excerpt:
      "Com pujar a la Vall de Núria: preus del cremallera, el combinat amb Rodalies, l'estat de l'R3, el novembre i el Camí Vell, amb dades d'FGC.",
  },
  es: {
    path: "escapadas/vall-de-nuria-cremallera",
    title: "Cremallera de la Vall de Núria 2026: precios, horarios y cómo llegar",
    seoTitle: "Cremallera Vall de Núria 2026: precios y horarios",
    seoDescription:
      "Cremallera de Núria, invierno 2026-27: 35,50 € ida y vuelta desde Ribes, 32,50 € desde Queralbs, gratis hasta 3 años. Horarios, diciembre y cómo llegar.",
    excerpt:
      "Cómo subir a la Vall de Núria: precios del cremallera, el combinado con Rodalies, el estado de la R3, noviembre y el Camí Vell, con datos de FGC.",
  },
  en: {
    path: "day-trips/vall-de-nuria-rack-railway",
    title: "Vall de Núria from Barcelona: rack railway, tickets and getting there",
    seoTitle: "Núria rack railway: timetable, tickets and fares",
    seoDescription:
      "Núria rack railway, winter 2026-27: return €35.50 from Ribes, €32.50 from Queralbs, free under 4. Timetable, December, TreNatura and the R3.",
    excerpt:
      "How to get up to Vall de Núria: rack railway fares, the combined Rodalies ticket, the R3 disruption, November and the old path, from FGC's own figures.",
  },
};

type T = {
  lead: string;
  note: string;
  lineTitle: string;
  line: string[];
  faresTitle: string;
  faresCaption: string;
  faresHeaders: string[];
  faresRows: string[][];
  faresNote: string;
  fares: string[];
  timesTitle: string;
  times: string;
  timesCaptions: [string, string];
  timesHeaders: [string[], string[]];
  friday: string;
  ski: string;
  timesNote: string;
  getTitle: string;
  get: string[];
  r3Title: string;
  r3: string;
  novTitle: string;
  nov: string[];
  decTitle: string;
  dec: string[];
  valleyTitle: string;
  valley: string[];
  walkTitle: string;
  walk: string[];
  legendTitle: string;
  legend: string[];
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: "El **cremallera de Núria** costa **35,50 € anada i tornada des de Ribes de Freser** i **32,50 € des de Queralbs** per a un adult (infants de 4 a 13 anys, 23 i 21 €; fins a 3 anys, gratis) amb les tarifes d'hivern 2026-2027 d'FGC, des de l'1 de desembre; fins al 30 de novembre del 2026 són 34 € i 31 €. A la **Vall de Núria** no hi arriba cap carretera: s'hi puja amb el cremallera o a peu. A sota tens els horaris d'hivern, com s'hi va des de Barcelona amb l'R3 tal com circula ara, què passa al novembre i al desembre i què hi ha a dalt.",
    note: "Preus i horaris del fullet d'hivern 2026-2027 d'FGC (preus vigents fins al 30 de novembre del 2027). El 27 de novembre la botiga en línia encara mostrava els preus del 2026: compta el que et marqui en comprar. L'R3 circula amb servei reduït per obres: consulta Rodalies abans de sortir.",
    lineTitle: "El cremallera",
    line: [
      "El cremallera surt de **Ribes-Enllaç**, al costat de l'estació de l'R3, i para a **Ribes-Vila** i **Queralbs** abans d'arribar a Núria. Fa 12,5 km, puja uns 1.000 metres de desnivell i triga uns 40 minuts. Es va inaugurar el 1931, i l'estació de Núria és a **1.964 metres**.",
      "Queralbs és l'últim punt on s'arriba amb cotxe. A les tres estacions de baix (Ribes-Enllaç, Ribes-Vila i Queralbs) hi ha aparcament gratuït. FGC demana comprar el bitllet en línia per assegurar plaça.",
    ],
    faresTitle: "Quant costa el cremallera de Núria",
    faresCaption: "Cremallera de Núria, preus d'hivern 2026-2027 (des de l'1 de desembre)",
    faresHeaders: ["Edat", "Anada i tornada des de Ribes", "Anada i tornada des de Queralbs", "Només anada des de Ribes", "Només anada des de Queralbs"],
    faresRows: [
      ["Adults (14 a 64 anys)", "35,50 €", "32,50 €", "24,50 €", "22,50 €"],
      ["Infants (4 a 13 anys)", "23,00 €", "21,00 €", "16,00 €", "14,50 €"],
      ["A partir de 65 anys", "30,00 €", "26,50 €", "21,00 €", "19,00 €"],
      ["De 0 a 3 anys", "Gratuït", "Gratuït", "Gratuït", "Gratuït"],
    ],
    faresNote: "Fullet d'hivern 2026-2027 d'FGC, llegit el 27 de novembre de 2026: preus vigents fins al 30 de novembre del 2027. Fins al 30 de novembre del 2026, anada i tornada des de Ribes i des de Queralbs: 34 i 31 € adults, 22 i 20 € infants, 29 i 25 € a partir de 65 anys. L'anada i la tornada s'han de fer el mateix dia.",
    timesTitle: "Horaris del cremallera de Núria",
    times: "Aquests són els trens de **temporada baixa** de l'hivern 2026-2027, la de la majoria de dies de desembre a abril. Els dies de **temporada alta** (al desembre, del 5 al 8 i del 26 al 31) hi ha més trens i l'últim baixa de Núria a les 18.05; els divendres i els dies 5 i 26 a 30 de desembre n'hi ha també un a les 19.00, i els divendres, un a les 21.00. El 25 de desembre hi ha horari especial: consulta'l a FGC. El tren de pujada triga uns 40 minuts.",
    timesCaptions: ["Pujada: de Ribes-Enllaç a Núria", "Baixada: de Núria a Ribes-Enllaç"],
    timesHeaders: [["Surt de Ribes-Enllaç", "Arriba a Núria"], ["Surt de Núria", "Arriba a Ribes-Enllaç"]],
    friday: "divendres, menys el 25 de desembre",
    ski: "només els dies que l'estació d'esquí és oberta",
    timesNote: "* El primer tren surt de Ribes-Vila. Tots paren a Ribes-Vila i Queralbs. Fullet d'FGC hivern 2026-2027, llegit el 27 de novembre de 2026. Fins al 30 de novembre circulen els mateixos trens, sense el de les 8.35, i al novembre només els caps de setmana.",
    fares: [
      "El bitllet inclou el **Telefèric Coma del Clot**, l'entrada a la **basílica**, les exposicions i una audioguia. Els gossos viatgen gratis, lligats i amb morrió (a la taquilla en venen per 5 €).",
      "Si hi pujaràs sovint, hi ha un **abonament de temporada**, vàlid un any des del dia de la compra: el fullet d'hivern el dona a 114,50 € (a partir de 14 anys) i 72,50 € (de 4 a 13 anys); fins al 30 de novembre, 104 i 66 €.",
      "Per a l'hivern hi ha també l'**abonament de temporada d'hivern** del cremallera, vàlid de l'1 de desembre al 30 d'abril: el fullet d'hivern d'FGC el dona a 80 € adults i 51 € infants, i el 27 de novembre la botiga en línia el venia a 62,50 € i 39,50 €. El 27 de novembre, la pàgina de tarifes de la Vall de Núria venia els forfets de temporada 2026-2027: el **Ripollès** (Vallter i Vall de Núria), a **387 €** fins al 8 de desembre i 455 € després, i el **Pirineu365**, per a les sis estacions d'FGC, a 730 € (adults de 25 a 64 anys). El forfet de dia hi surt a 23,50 € i el de dia amb cremallera, a 41 € (adults de 14 a 64 anys), sense dir de quina temporada són.",
    ],
    getTitle: "Com arribar a Núria des de Barcelona",
    get: [
      "**En tren:** l'R3 de Rodalies enllaça amb el cremallera a Ribes de Freser. El bitllet combinat **TreNatura** inclou el tren d'anada i tornada des de qualsevol estació de Rodalies fins a Ribes de Freser i el cremallera fins a Núria: **40,20 €** adults i **30,70 €** infants de 4 a 13 anys. Renfe el ven tot l'any excepte els dies feiners de novembre.",
      "**En cotxe:** fins a Ribes de Freser o Queralbs, i allà el cremallera. Els tres aparcaments de les estacions són gratuïts.",
    ],
    r3Title: "L'R3, ara mateix",
    r3: "Segons l'avís de Rodalies (llegit el 25 de novembre de 2026), l'R3 circula amb el 50 % dels trens que tenia abans del 20 de gener, per obres a la via. Entre Barcelona i la Garriga el servei el cobreixen l'R4 i autobusos alternatius; a més, per obres d'Adif entre la Garriga i Figaró, del 16 de novembre al 14 de desembre de 2026 els trens de l'R3 van de Sant Martí de Centelles a Puigcerdà (abans, de la Garriga), i el viatge és més llarg que l'habitual. Des del 12 d'agost hi ha també autobusos complementaris entre la Garriga i Puigcerdà. L'avís no diu quin serà el servei després del 14 de desembre. El TreNatura continua sent vàlid durant aquest període. Mira els horaris a rodalies.gencat.cat abans de sortir.",
    novTitle: "El cremallera de Núria al novembre",
    nov: [
      "El calendari oficial de l'estació per al novembre del 2026 marca **tancats els dies feiners** i oberts els caps de setmana. És el que FGC va fer el 2025: del 3 al 30 de novembre el cremallera només va pujar a Núria els caps de setmana, i els dies feiners va fer tres viatges entre Ribes i Queralbs; al desembre va tornar a circular cada dia. El 27 de novembre FGC no havia publicat cap avís per a aquest novembre; el calendari de l'estació marca oberts el 28 i el 29.",
      "El combinat TreNatura tampoc no es ven els dies feiners de novembre. Si hi vols anar aquest mes, ves-hi en cap de setmana i comprova-ho a FGC abans de sortir.",
    ],
    decTitle: "El cremallera al desembre i a l'hivern 2026-2027",
    dec: [
      "Segons el calendari d'hivern d'FGC, al desembre el cremallera fa **temporada alta del 5 al 8 i del 26 al 31**, **horari especial el dia 25** i temporada baixa la resta de dies. FGC va anunciar el 6 de novembre que les seves estacions d'esquí, Vall de Núria inclosa, obriran del **4 de desembre del 2026 al 4 d'abril del 2027**; el calendari de pistes de la Vall de Núria marca obert del 4 al 8 de desembre, el 12 i el 13, i cada dia a partir del 19.",
      "Els dies **5, 29 i 30 de desembre** hi ha «Despertem els tions», una visita teatralitzada de tarda amb el cremallera d'anada i tornada inclòs: surt a les 15.30 de Ribes de Freser o Queralbs i torna a les 19.00. Costa **18 €** adults i **11,50 €** infants i majors de 65 anys, comprant-lo abans a la botiga en línia.",
    ],
    valleyTitle: "Què hi ha a la vall",
    valley: [
      "La vall és dins del Parc Natural de les Capçaleres del Ter i del Freser, envoltada de cims de més de 2.900 metres. Al fons hi ha el **santuari de la Mare de Déu de Núria**, el llac i l'hotel.",
      "El **Telefèric Coma del Clot** puja fins al Pic de l'Àliga, a més de 2.100 metres, un dels millors miradors de la vall. Des del juny del 2026 hi ha també el nou **Mirador del Llac**. A l'estiu hi ha barques al llac, un parc lúdic i rutes curtes al voltant del santuari; a l'hivern, l'estació d'esquí.",
      `Si t'hi quedes més d'un dia, la resta de la comarca (Ripoll, Sant Joan de les Abadesses, Camprodon, Setcases) és a ${b2link("ripolles", "ca", "la guia del Ripollès")}.`,
    ],
    walkTitle: "A peu: el Camí Vell des de Queralbs",
    walk: [
      "L'antic camí dels pelegrins surt de la plaça del Raig de Queralbs i puja per les gorges de Núria, amb salts d'aigua com el del Sastre i la Cua de Cavall, fins a albirar el llac. El Parc Natural el dona com a **7,7 km i 932 metres de desnivell**, unes **3 hores i 45 minuts**, i el classifica com a molt exigent.",
      "La xifra és per pujar a peu i baixar amb el cremallera fins a Queralbs. El Parc el recomana a la primavera, l'estiu i la tardor.",
    ],
    legendTitle: "La Mare de Déu de Núria",
    legend: [
      "Segons la tradició que recull FGC, cap a l'any 700 Sant Gil va esculpir la imatge de la Mare de Déu i la va amagar amb la **creu, la campana i l'olla**. Segles després uns pastors, seguint un brau de pèl vermell, la van trobar, i la basílica és on diuen que va passar. La festa de la Mare de Déu de Núria és el **8 de setembre**.",
    ],
    faq: [
      { question: "Quant costa el cremallera de Núria?", answer: "Des de l'1 de desembre, anada i tornada des de Ribes, 35,50 € adults, 23 € infants de 4 a 13 anys i 30 € a partir de 65; des de Queralbs, 32,50, 21 i 26,50 € (fullet d'hivern 2026-2027 d'FGC). Fins al 30 de novembre del 2026: 34 € adults des de Ribes i 31 € des de Queralbs." },
      { question: "Quin és l'últim cremallera de baixada?", answer: "En temporada baixa surt de Núria a les 17.10 (els divendres, també a les 19.00 i les 21.00, menys el 25 de desembre); en temporada alta, a les 18.05, i els divendres i els dies 5 i 26 a 30 de desembre, a les 19.00. Fullet d'hivern 2026-2027 d'FGC." },
      { question: "Quant costa només l'anada?", answer: "Des de l'1 de desembre, 24,50 € adults des de Ribes i 22,50 € des de Queralbs; infants de 4 a 13 anys, 16 i 14,50 €. Fins al 30 de novembre, 23,50 i 21,50 €." },
      { question: "Es pot anar a Núria amb cotxe?", answer: "No. Es pot arribar amb cotxe fins a Ribes de Freser o Queralbs, on hi ha aparcament gratuït, i d'allà s'hi puja amb el cremallera o a peu." },
      { question: "Què inclou el bitllet TreNatura?", answer: "El tren de Rodalies d'anada i tornada des de qualsevol estació fins a Ribes de Freser i el cremallera fins a Núria. Costa 40,20 € adults i 30,70 € infants." },
      { question: "El cremallera funciona al novembre?", answer: "El calendari de l'estació per al novembre del 2026 marca tancats els dies feiners i oberts els caps de setmana. Comprova-ho a FGC abans d'anar-hi." },
      { question: "El cremallera funciona al desembre?", answer: "Sí. El calendari d'hivern d'FGC marca temporada alta del 5 al 8 i del 26 al 31 de desembre, horari especial el 25 i temporada baixa la resta de dies." },
      { question: "El cremallera de Núria és gratis per a algú?", answer: "Per als infants de 0 a 3 anys, que no paguen, i per als gossos, que viatgen gratis lligats i amb morrió. Els altres paguen la tarifa: 35,50 € anada i tornada des de Ribes per a un adult des de l'1 de desembre (34 € fins al 30 de novembre)." },
      { question: "Quant costa el forfet d'esquí de Vall de Núria?", answer: "Segons la pàgina de tarifes de la Vall de Núria (consultada el 27 de novembre de 2026), el forfet de temporada Ripollès 2026-2027, vàlid també a Vallter, costa 387 € fins al 8 de desembre i 455 € després; el de dia, 23,50 €, i el de dia amb cremallera, 41 € per a adults, sense indicar la temporada. L'estació preveu obrir el 4 de desembre. L'abonament d'hivern del cremallera (de l'1 de desembre al 30 d'abril) surt a 80 € adults i 51 € infants al fullet d'hivern d'FGC." },
    ],
  },
  es: {
    lead: "El **cremallera de Núria** cuesta **35,50 € ida y vuelta desde Ribes de Freser** y **32,50 € desde Queralbs** para un adulto (niños de 4 a 13 años, 23 y 21 €; hasta 3 años, gratis) con las tarifas de invierno 2026-2027 de FGC, desde el 1 de diciembre; hasta el 30 de noviembre de 2026 son 34 € y 31 €. A la **Vall de Núria** no llega ninguna carretera: se sube en cremallera o a pie. Abajo tienes los horarios de invierno, cómo se va desde Barcelona con la R3 tal como circula ahora, qué pasa en noviembre y en diciembre y qué hay arriba.",
    note: "Precios y horarios del folleto de invierno 2026-2027 de FGC (precios vigentes hasta el 30 de noviembre de 2027). El 27 de noviembre la tienda en línea aún mostraba los precios de 2026: cuenta el que te marque al comprar. La R3 circula con servicio reducido por obras: consulta Rodalies antes de salir.",
    lineTitle: "El cremallera",
    line: [
      "El cremallera sale de **Ribes-Enllaç**, junto a la estación de la R3, y para en **Ribes-Vila** y **Queralbs** antes de llegar a Núria. Recorre 12,5 km, sube unos 1.000 metros de desnivel y tarda unos 40 minutos. Se inauguró en 1931, y la estación de Núria está a **1.964 metros**.",
      "Queralbs es el último punto al que se llega en coche. En las tres estaciones de abajo (Ribes-Enllaç, Ribes-Vila y Queralbs) hay aparcamiento gratuito. FGC pide comprar el billete en línea para asegurar plaza.",
    ],
    faresTitle: "Cuánto cuesta el cremallera de Núria",
    faresCaption: "Cremallera de Núria, precios de invierno 2026-2027 (desde el 1 de diciembre)",
    faresHeaders: ["Edad", "Ida y vuelta desde Ribes", "Ida y vuelta desde Queralbs", "Solo ida desde Ribes", "Solo ida desde Queralbs"],
    faresRows: [
      ["Adultos (14 a 64 años)", "35,50 €", "32,50 €", "24,50 €", "22,50 €"],
      ["Niños (4 a 13 años)", "23,00 €", "21,00 €", "16,00 €", "14,50 €"],
      ["A partir de 65 años", "30,00 €", "26,50 €", "21,00 €", "19,00 €"],
      ["De 0 a 3 años", "Gratis", "Gratis", "Gratis", "Gratis"],
    ],
    faresNote: "Folleto de invierno 2026-2027 de FGC, leído el 27 de noviembre de 2026: precios vigentes hasta el 30 de noviembre de 2027. Hasta el 30 de noviembre de 2026, ida y vuelta desde Ribes y desde Queralbs: 34 y 31 € adultos, 22 y 20 € niños, 29 y 25 € a partir de 65 años. La ida y la vuelta se deben hacer el mismo día.",
    timesTitle: "Horarios del cremallera de Núria",
    times: "Estos son los trenes de **temporada baja** del invierno 2026-2027, la de la mayoría de días de diciembre a abril. Los días de **temporada alta** (en diciembre, del 5 al 8 y del 26 al 31) hay más trenes y el último baja de Núria a las 18.05; los viernes y los días 5 y 26 a 30 de diciembre hay también uno a las 19.00, y los viernes, uno a las 21.00. El 25 de diciembre hay horario especial: consúltalo en FGC. El tren de subida tarda unos 40 minutos.",
    timesCaptions: ["Subida: de Ribes-Enllaç a Núria", "Bajada: de Núria a Ribes-Enllaç"],
    timesHeaders: [["Sale de Ribes-Enllaç", "Llega a Núria"], ["Sale de Núria", "Llega a Ribes-Enllaç"]],
    friday: "viernes, menos el 25 de diciembre",
    ski: "solo los días en que la estación de esquí está abierta",
    timesNote: "* El primer tren sale de Ribes-Vila. Todos paran en Ribes-Vila y Queralbs. Folleto de FGC invierno 2026-2027, leído el 27 de noviembre de 2026. Hasta el 30 de noviembre circulan los mismos trenes, sin el de las 8.35, y en noviembre solo los fines de semana.",
    fares: [
      "El billete incluye el **Telefèric Coma del Clot**, la entrada a la **basílica**, las exposiciones y una audioguía. Los perros viajan gratis, atados y con bozal (en la taquilla venden bozales por 5 €).",
      "Si vas a subir a menudo, hay un **abono de temporada**, válido un año desde el día de la compra: el folleto de invierno lo da a 114,50 € (a partir de 14 años) y 72,50 € (de 4 a 13 años); hasta el 30 de noviembre, 104 y 66 €.",
      "Para el invierno hay también el **abono de temporada de invierno** del cremallera, válido del 1 de diciembre al 30 de abril: el folleto de invierno de FGC lo da a 80 € adultos y 51 € niños, y el 27 de noviembre la tienda en línea lo vendía a 62,50 € y 39,50 €. El 27 de noviembre, la página de tarifas de la Vall de Núria vendía los forfaits de temporada 2026-2027: el **Ripollès** (Vallter y Vall de Núria), a **387 €** hasta el 8 de diciembre y 455 € después, y el **Pirineu365**, para las seis estaciones de FGC, a 730 € (adultos de 25 a 64 años). El forfait de día aparece a 23,50 € y el de día con cremallera, a 41 € (adultos de 14 a 64 años), sin decir de qué temporada son.",
    ],
    getTitle: "Cómo llegar a Núria desde Barcelona",
    get: [
      "**En tren:** la R3 de Rodalies enlaza con el cremallera en Ribes de Freser. El billete combinado **TreNatura** incluye el tren de ida y vuelta desde cualquier estación de Rodalies hasta Ribes de Freser y el cremallera hasta Núria: **40,20 €** adultos y **30,70 €** niños de 4 a 13 años. Renfe lo vende todo el año excepto los días laborables de noviembre.",
      "**En coche:** hasta Ribes de Freser o Queralbs, y allí el cremallera. Los tres aparcamientos de las estaciones son gratuitos.",
    ],
    r3Title: "La R3, ahora mismo",
    r3: "Según el aviso de Rodalies (leído el 25 de noviembre de 2026), la R3 circula con el 50 % de los trenes que tenía antes del 20 de enero, por obras en la vía. Entre Barcelona y La Garriga el servicio lo cubren la R4 y autobuses alternativos; además, por obras de Adif entre La Garriga y Figaró, del 16 de noviembre al 14 de diciembre de 2026 los trenes de la R3 van de Sant Martí de Centelles a Puigcerdà (antes, desde La Garriga), y el viaje es más largo de lo habitual. Desde el 12 de agosto hay también autobuses complementarios entre La Garriga y Puigcerdà. El aviso no dice cuál será el servicio después del 14 de diciembre. El TreNatura sigue siendo válido durante este periodo. Mira los horarios en rodalies.gencat.cat antes de salir.",
    novTitle: "El cremallera de Núria en noviembre",
    nov: [
      "El calendario oficial de la estación para noviembre de 2026 marca **cerrados los días laborables** y abiertos los fines de semana. Es lo que FGC hizo en 2025: del 3 al 30 de noviembre el cremallera solo subió a Núria los fines de semana, y los días laborables hizo tres viajes entre Ribes y Queralbs; en diciembre volvió a circular a diario. El 27 de noviembre FGC no había publicado ningún aviso para este noviembre; el calendario de la estación marca abiertos el 28 y el 29.",
      "El combinado TreNatura tampoco se vende los días laborables de noviembre. Si quieres ir este mes, ve en fin de semana y compruébalo en FGC antes de salir.",
    ],
    decTitle: "El cremallera en diciembre y en el invierno 2026-2027",
    dec: [
      "Según el calendario de invierno de FGC, en diciembre el cremallera hace **temporada alta del 5 al 8 y del 26 al 31**, **horario especial el día 25** y temporada baja el resto de días. FGC anunció el 6 de noviembre que sus estaciones de esquí, Vall de Núria incluida, abrirán del **4 de diciembre de 2026 al 4 de abril de 2027**; el calendario de pistas de la Vall de Núria marca abierto del 4 al 8 de diciembre, el 12 y el 13, y cada día a partir del 19.",
      "Los días **5, 29 y 30 de diciembre** hay «Despertem els tions», una visita teatralizada de tarde con el cremallera de ida y vuelta incluido: sale a las 15.30 de Ribes de Freser o Queralbs y vuelve a las 19.00. Cuesta **18 €** adultos y **11,50 €** niños y mayores de 65 años, comprándolo antes en la tienda en línea.",
    ],
    valleyTitle: "Qué hay en el valle",
    valley: [
      "El valle está dentro del Parc Natural de les Capçaleres del Ter i del Freser, rodeado de cimas de más de 2.900 metros. Al fondo están el **santuario de la Mare de Déu de Núria**, el lago y el hotel.",
      "El **Telefèric Coma del Clot** sube hasta el Pic de l'Àliga, a más de 2.100 metros, uno de los mejores miradores del valle. Desde junio de 2026 hay también el nuevo **Mirador del Llac**. En verano hay barcas en el lago, un parque lúdico y rutas cortas alrededor del santuario; en invierno, la estación de esquí.",
      `Si te quedas más de un día, el resto de la comarca (Ripoll, Sant Joan de les Abadesses, Camprodon, Setcases) está en ${b2link("ripolles", "es", "la guía del Ripollès")}.`,
    ],
    walkTitle: "A pie: el Camí Vell desde Queralbs",
    walk: [
      "El antiguo camino de los peregrinos sale de la plaça del Raig de Queralbs y sube por las gargantas de Núria, con saltos de agua como el del Sastre y la Cua de Cavall, hasta divisar el lago. El Parc Natural lo da como **7,7 km y 932 metros de desnivel**, unas **3 horas y 45 minutos**, y lo clasifica como muy exigente.",
      "La cifra es para subir a pie y bajar en cremallera hasta Queralbs. El Parc lo recomienda en primavera, verano y otoño.",
    ],
    legendTitle: "La Virgen de Núria",
    legend: [
      "Según la tradición que recoge FGC, hacia el año 700 San Gil esculpió la imagen de la Virgen y la escondió con la **cruz, la campana y la olla**. Siglos después unos pastores, siguiendo a un toro de pelo rojo, la encontraron, y la basílica está donde dicen que ocurrió. La fiesta de la Mare de Déu de Núria es el **8 de septiembre**.",
    ],
    faq: [
      { question: "¿Cuánto cuesta el cremallera de Núria?", answer: "Desde el 1 de diciembre, ida y vuelta desde Ribes, 35,50 € adultos, 23 € niños de 4 a 13 años y 30 € a partir de 65; desde Queralbs, 32,50, 21 y 26,50 € (folleto de invierno 2026-2027 de FGC). Hasta el 30 de noviembre de 2026: 34 € adultos desde Ribes y 31 € desde Queralbs." },
      { question: "¿Cuál es el último cremallera de bajada?", answer: "En temporada baja sale de Núria a las 17.10 (los viernes, también a las 19.00 y las 21.00, menos el 25 de diciembre); en temporada alta, a las 18.05, y los viernes y los días 5 y 26 a 30 de diciembre, a las 19.00. Folleto de invierno 2026-2027 de FGC." },
      { question: "¿Cuánto cuesta solo la ida?", answer: "Desde el 1 de diciembre, 24,50 € adultos desde Ribes y 22,50 € desde Queralbs; niños de 4 a 13 años, 16 y 14,50 €. Hasta el 30 de noviembre, 23,50 y 21,50 €." },
      { question: "¿Se puede ir a Núria en coche?", answer: "No. Se puede llegar en coche hasta Ribes de Freser o Queralbs, donde hay aparcamiento gratuito, y desde allí se sube en cremallera o a pie." },
      { question: "¿Qué incluye el billete TreNatura?", answer: "El tren de Rodalies de ida y vuelta desde cualquier estación hasta Ribes de Freser y el cremallera hasta Núria. Cuesta 40,20 € adultos y 30,70 € niños." },
      { question: "¿Funciona el cremallera en noviembre?", answer: "El calendario de la estación para noviembre de 2026 marca cerrados los días laborables y abiertos los fines de semana. Compruébalo en FGC antes de ir." },
      { question: "¿Funciona el cremallera en diciembre?", answer: "Sí. El calendario de invierno de FGC marca temporada alta del 5 al 8 y del 26 al 31 de diciembre, horario especial el 25 y temporada baja el resto de días." },
      { question: "¿Es gratis el cremallera de Núria para alguien?", answer: "Para los niños de 0 a 3 años, que no pagan, y para los perros, que viajan gratis atados y con bozal. Los demás pagan la tarifa: 35,50 € ida y vuelta desde Ribes para un adulto desde el 1 de diciembre (34 € hasta el 30 de noviembre)." },
      { question: "¿Cuánto cuesta el forfait de Vall de Núria?", answer: "Según la página de tarifas de la Vall de Núria (consultada el 27 de noviembre de 2026), el forfait de temporada Ripollès 2026-2027, válido también en Vallter, cuesta 387 € hasta el 8 de diciembre y 455 € después; el de día, 23,50 €, y el de día con cremallera, 41 € para adultos, sin indicar la temporada. La estación prevé abrir el 4 de diciembre. El abono de invierno del cremallera (del 1 de diciembre al 30 de abril) sale a 80 € adultos y 51 € niños en el folleto de invierno de FGC." },
    ],
  },
  en: {
    lead: "The **Núria rack railway** (the Cremallera) costs **€35.50 return from Ribes de Freser** and **€32.50 from Queralbs** for an adult (children aged 4 to 13, €23 and €21; under 4, free) on FGC's winter 2026-27 fares, from 1 December; until 30 November 2026 it is €34 and €31. No road reaches **Vall de Núria**: you go up by rack railway or on foot. Below are the winter timetable, how to get there from Barcelona on the R3 as it runs now, what happens in November and December and what is up there.",
    note: "Fares and times from FGC's winter 2026-27 leaflet (fares valid until 30 November 2027). On 27 November the online shop still showed the 2026 prices: what you are charged at checkout is what counts. The R3 is running a reduced service because of works: check Rodalies before you set off.",
    lineTitle: "The rack railway",
    line: [
      "The Cremallera starts at **Ribes-Enllaç**, next to the R3 station, and stops at **Ribes-Vila** and **Queralbs** before reaching Núria. It covers 12.5 km, climbs about 1,000 metres and takes about 40 minutes. It opened in 1931, and Núria station sits at **1,964 metres**.",
      "Queralbs is as far as a car can go. All three lower stations (Ribes-Enllaç, Ribes-Vila and Queralbs) have free parking. FGC asks you to buy online to be sure of a seat.",
    ],
    faresTitle: "Núria rack railway fares",
    faresCaption: "Núria rack railway, winter 2026-27 fares (from 1 December)",
    faresHeaders: ["Age", "Return from Ribes", "Return from Queralbs", "Single from Ribes", "Single from Queralbs"],
    faresRows: [
      ["Adults (14 to 64)", "€35.50", "€32.50", "€24.50", "€22.50"],
      ["Children (4 to 13)", "€23", "€21", "€16", "€14.50"],
      ["65 and over", "€30", "€26.50", "€21", "€19"],
      ["Under 4", "Free", "Free", "Free", "Free"],
    ],
    faresNote: "FGC's winter 2026-27 leaflet, read on 27 November 2026: fares valid until 30 November 2027. Until 30 November 2026, return from Ribes and from Queralbs: €34 and €31 adults, €22 and €20 children, €29 and €25 for 65 and over. Both legs of a return must be used on the same day.",
    timesTitle: "Núria rack railway timetable",
    times: "These are the winter 2026-27 **low-season** trains, which cover most days from December to April. On **high-season** days (in December, 5 to 8 and 26 to 31) there are more trains and the last one leaves Núria at 18.05; on Fridays and on 5 and 26 to 30 December there is also one at 19.00, and on Fridays one at 21.00. 25 December has special hours: check them with FGC. The ride up takes about 40 minutes.",
    timesCaptions: ["Up: Ribes-Enllaç to Núria", "Down: Núria to Ribes-Enllaç"],
    timesHeaders: [["Leaves Ribes-Enllaç", "Arrives Núria"], ["Leaves Núria", "Arrives Ribes-Enllaç"]],
    friday: "Fridays, not 25 December",
    ski: "only on days the ski area is open",
    timesNote: "* The first train starts at Ribes-Vila. All trains stop at Ribes-Vila and Queralbs. FGC's winter 2026-27 leaflet, read on 27 November 2026. Until 30 November the same trains run, without the 8.35, and in November only at weekends.",
    fares: [
      "The ticket includes the **Coma del Clot cable car** (Telefèric), entry to the **basilica**, the exhibitions and an audio guide. Dogs travel free, on a lead and muzzled (the ticket office sells muzzles for €5).",
      "If you will go up often, there is a **season ticket**, valid for a year from the day you buy it: the winter leaflet gives €114.50 from age 14 and €72.50 for ages 4 to 13; until 30 November, €104 and €66.",
      "For winter there is also the rack railway's **winter season ticket**, valid from 1 December to 30 April: FGC's winter leaflet gives €80 for adults and €51 for children, while on 27 November the online shop sold it at €62.50 and €39.50. On 27 November Vall de Núria's rates page was selling the 2026-27 season passes: **Ripollès** (Vallter and Vall de Núria) at **€387** until 8 December and €455 after, and **Pirineu365**, for all six FGC resorts, at €730 (adults 25 to 64). The day pass is listed at €23.50 and the day pass with the rack railway at €41 (adults 14 to 64), with no season stated.",
    ],
    getTitle: "Getting there from Barcelona",
    get: [
      "**By train:** the R3 Rodalies line connects with the rack railway at Ribes de Freser. The combined **TreNatura** ticket covers the return train from any Rodalies station to Ribes de Freser plus the rack railway to Núria: **€40.20** for adults and **€30.70** for children aged 4 to 13. Renfe sells it all year except on weekdays in November.",
      "**By car:** drive to Ribes de Freser or Queralbs and take the rack railway from there. The car parks at all three stations are free.",
    ],
    r3Title: "The R3 right now",
    r3: "According to Rodalies' notice (read on 25 November 2026), the R3 is running 50% of the trains it had before 20 January, because of track works. Between Barcelona and La Garriga the service is covered by the R4 and replacement buses; in addition, because of Adif works between La Garriga and Figaró, from 16 November to 14 December 2026 R3 trains run from Sant Martí de Centelles to Puigcerdà (before, from La Garriga), and the journey takes longer than usual. Since 12 August there have also been complementary buses between La Garriga and Puigcerdà. The notice does not say what service follows after 14 December. TreNatura tickets stay valid throughout. Check the timetables at rodalies.gencat.cat before you go.",
    novTitle: "The rack railway in November",
    nov: [
      "The resort's official calendar for November 2026 shows **weekdays closed** and weekends open. That is what FGC did in 2025: from 3 to 30 November the rack railway ran up to Núria only at weekends, with three weekday trips between Ribes and Queralbs, and it went back to running daily in December. On 27 November FGC had published no notice for this November; the resort's calendar shows 28 and 29 November open.",
      "The TreNatura combined ticket is not sold on November weekdays either. If you want to go this month, go at a weekend and check with FGC before you set off.",
    ],
    decTitle: "The rack railway in December and winter 2026-27",
    dec: [
      "FGC's winter calendar gives the rack railway **high season from 5 to 8 and from 26 to 31 December**, **special hours on the 25th** and low season on the other days. FGC announced on 6 November that its ski resorts, Vall de Núria included, will open from **4 December 2026 to 4 April 2027**; Vall de Núria's slope calendar shows it open from 4 to 8 December, on the 12th and 13th, and every day from the 19th.",
      "On **5, 29 and 30 December** there is 'Despertem els tions', an afternoon theatre visit with the return rack railway included: it leaves Ribes de Freser or Queralbs at 15.30 and comes back at 19.00. It costs **€18** for adults and **€11.50** for children and over-65s, bought in advance in the online shop.",
    ],
    valleyTitle: "What's in the valley",
    valley: [
      "The valley lies inside the Capçaleres del Ter i del Freser Natural Park, ringed by peaks of more than 2,900 metres. At its head are the **sanctuary of Our Lady of Núria**, the lake and the hotel.",
      "The **Coma del Clot cable car** climbs to Pic de l'Àliga, at over 2,100 metres, one of the best viewpoints over the valley, and since June 2026 there is a new **lake viewpoint** (Mirador del Llac). In summer there are boats on the lake, a play park and short walks around the sanctuary; in winter, the ski area.",
      `If you stay longer, the rest of the district (Ripoll, Sant Joan de les Abadesses, Camprodon, Setcases) is in ${b2link("ripolles", "en", "our Ripollès guide")}.`,
    ],
    walkTitle: "On foot: the old path from Queralbs",
    walk: [
      "The old pilgrims' path (Camí Vell) leaves Plaça del Raig in Queralbs and climbs the Núria gorges, past waterfalls such as the Sastre and the Cua de Cavall, until the lake comes into view. The Natural Park gives it as **7.7 km with 932 metres of ascent**, about **3 hours 45 minutes**, and rates it very demanding.",
      "That is walking up and riding the rack railway back down to Queralbs. The park recommends it in spring, summer and autumn.",
    ],
    legendTitle: "Our Lady of Núria",
    legend: [
      "According to the tradition FGC tells, around the year 700 Saint Giles carved the image of the Virgin and hid it with a **cross, a bell and a cooking pot**. Centuries later shepherds following a red-haired bull found it, and the basilica stands where that is said to have happened. Our Lady of Núria's feast day is **8 September**.",
    ],
    faq: [
      { question: "How much is the Núria rack railway?", answer: "From 1 December, return from Ribes: €35.50 adults, €23 children aged 4 to 13, €30 for 65 and over; from Queralbs: €32.50, €21 and €26.50 (FGC's winter 2026-27 leaflet). Until 30 November 2026: €34 for adults from Ribes and €31 from Queralbs." },
      { question: "What time is the last train down from Núria?", answer: "In low season it leaves Núria at 17.10 (on Fridays also at 19.00 and 21.00, except 25 December); in high season, at 18.05, and on Fridays and on 5 and 26 to 30 December at 19.00. FGC's winter 2026-27 leaflet." },
      { question: "How much is a single ticket?", answer: "From 1 December, €24.50 for adults from Ribes and €22.50 from Queralbs; children aged 4 to 13, €16 and €14.50. Until 30 November, €23.50 and €21.50." },
      { question: "Can you drive to Núria?", answer: "No. You can drive to Ribes de Freser or Queralbs, which have free parking, and go up from there by rack railway or on foot." },
      { question: "What does the TreNatura ticket include?", answer: "The return Rodalies train from any station to Ribes de Freser and the rack railway to Núria. It costs €40.20 for adults and €30.70 for children." },
      { question: "Does the Núria rack railway run in November?", answer: "The resort's calendar for November 2026 shows weekdays closed and weekends open. Check with FGC before you go." },
      { question: "Does the Núria rack railway run in December?", answer: "Yes. FGC's winter calendar gives high season from 5 to 8 and from 26 to 31 December, special hours on the 25th and low season on the other days." },
      { question: "Is the Núria rack railway free for anyone?", answer: "For children under 4, who ride free, and for dogs, which travel free on a lead and muzzled. Everyone else pays the fare: €35.50 return from Ribes for an adult from 1 December (€34 until 30 November)." },
      { question: "How much is a Vall de Núria ski pass?", answer: "According to Vall de Núria's rates page (checked 27 November 2026), the 2026-27 Ripollès season pass, also valid at Vallter, costs €387 until 8 December and €455 after; a day pass is €23.50 and a day pass with the rack railway €41 for adults, with no season stated. The resort plans to open on 4 December. The rack railway's winter season ticket (1 December to 30 April) is €80 for adults and €51 for children in FGC's winter leaflet." },
    ],
  },
};

// The R3 is hit by every Rodalies strike; the hub says what runs that day.
const STRIKES_LINE: Record<Locale, string> = {
  ca: ` Els dies de vaga de Rodalies, mira ${b2link("strikes", "ca", "què funciona")}.`,
  es: ` Los días de huelga de Rodalies, mira ${b2link("strikes", "es", "qué funciona")}.`,
  en: ` On Rodalies strike days, see ${b2link("strikes", "en", "what runs")}.`,
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.lineTitle, ...t.line),
    ...h2(t.faresTitle),
    table(t.faresCaption, t.faresHeaders, t.faresRows, t.faresNote),
    ...t.fares.map((text) => ({ type: "paragraph", text }) as const),
    ...h2(t.timesTitle, t.times),
    table(t.timesCaptions[0], t.timesHeaders[0], [UP[0]!, [`${UP_SKI[0]} (${t.ski})`, UP_SKI[1]], ...UP.slice(1), ...UP_FRIDAY.map(([a, b]) => [`${a} (${t.friday})`, b])], t.timesNote),
    table(t.timesCaptions[1], t.timesHeaders[1], [...DOWN, ...DOWN_FRIDAY.map(([a, b]) => [`${a} (${t.friday})`, b])]),
    ...h2(t.getTitle),
    list(...t.get),
    callout("warning", t.r3Title, t.r3 + STRIKES_LINE[locale]),
    ...h2(t.novTitle, ...t.nov),
    ...h2(t.decTitle, ...t.dec),
    ...h2(t.valleyTitle, ...t.valley),
    ...h2(t.walkTitle, ...t.walk),
    ...h2(t.legendTitle, ...t.legend),
    faq(t.faq),
    ...b2Related(["ripolles", "ski", "snowNow", "snow", "cerdanya"], locale),
  ];
}

const NURIA_BASE: B2Article = {
  key: "nuria",
  entryKey: "daytrip-vall-de-nuria-rack-railway",
  categoryKey: "mountain",
  sources: SOURCES,
  heroKey: "nuria-llac-santuari",
  heroAlt: {
    ca: "El llac de Núria amb el santuari i l'hotel al fons, entre muntanyes verdes",
    es: "El lago de Núria con el santuario y el hotel al fondo, entre montañas verdes",
    en: "The Núria lake with the sanctuary and hotel behind it, between green mountains",
  },
  heroCaption: {
    ca: "El llac i el santuari de la Vall de Núria a l'estiu.",
    es: "El lago y el santuario de la Vall de Núria en verano.",
    en: "The lake and sanctuary of Vall de Núria in summer.",
  },
  secondaryKey: "nuria-cremallera-gorja",
  secondaryAlt: {
    ca: "El tren cremallera blau i blanc pujant per la gorja entre pins, vist des del Camí Vell",
    es: "El tren cremallera azul y blanco subiendo por la garganta entre pinos, visto desde el Camí Vell",
    en: "The blue and white rack train climbing the gorge through pines, seen from the old path",
  },
  secondaryCaption: {
    ca: "El cremallera a les gorges, vist des del Camí Vell de Queralbs.",
    es: "El cremallera en las gargantas, visto desde el Camí Vell de Queralbs.",
    en: "The rack railway in the gorges, seen from the old path from Queralbs.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T23:45:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as NURIA_META };

/** With the dated transport re-read (27 Nov 2026 for Núria) under the first callout (day-trip-glance.ts). */
export const NURIA: B2Article = withGlance(NURIA_BASE, "nuria");
