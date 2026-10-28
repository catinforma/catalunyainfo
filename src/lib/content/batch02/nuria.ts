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

/**
 * Vall de Núria from Barcelona: the Cremallera, fares, the R3 and the valley.
 *
 * Every figure is from FGC (turistren.cat, pirineu365.cat), Renfe, Rodalies
 * or the Parc Natural, checked on 12 Oct 2026
 * (research_notes/blog-batch-03/nuria.md).
 *
 * The 2026 fares carry their own expiry: FGC prints them "vigents fins el 30
 * de novembre de 2026", and the copy says so beside the table. Winter single
 * and return fares were not out yet, so the page gives only the winter season
 * ticket that was. No clock times at all — FGC's timetable splits low and high
 * season with per-day exceptions, and the R3 is running a disrupted service —
 * and no journey time from Barcelona for the same reason. Not printed either:
 * a November "annual closure" (no source says so; the station calendar shows
 * weekdays closed, weekends open), a standalone Telefèric price (FGC's own
 * pages disagree) and the Ski Tren price (no season label).
 */

const VERIFIED = "2026-10-28";

// Low-season timetable and one-way fares, read 23 Oct 2026 from the FGC
// leaflet "Primavera-Estiu-Tardor 2026" (the PDF in SOURCES): its text gives
// every row; which rows run when is shown only by colour, read from the
// rendered leaflet (research_notes/page1/castanyada_outings.md). The rows
// coloured for May weekends and 27 Jun-8 Sep are left out, the Friday-only
// ones are marked. High season adds trains; its days are a calendar graphic,
// so the page sends readers to it rather than listing them. Fares and
// timetable expire 30 Nov 2026.
const UP: [string, string][] = [["7.30*", "8.03"], ["9.35", "10.14"], ["11.10", "11.58"], ["12.55", "13.34"], ["14.30", "15.09"], ["16.25", "17.04"]];
const DOWN: [string, string][] = [["8.35", "9.15"], ["10.20", "11.00"], ["12.05", "12.45"], ["13.40", "14.20"], ["15.35", "16.15"], ["17.10", "17.50"]];
const UP_FRIDAY: [string, string][] = [["18.05", "18.44"], ["20.10", "20.49"]];
const DOWN_FRIDAY: [string, string][] = [["19.00", "19.50"], ["21.00", "21.40"]];

const SOURCES: B2Source[] = [
  { name: "Cremallera de Núria — fares and line", url: "https://turistren.cat/trens/cremallera-de-nuria/", publisher: "FGC Turistren" },
  { name: "Cremallera fares and timetables, spring–summer–autumn 2026 (PDF)", url: "https://turistren.cat/wp-content/uploads/2026/04/VdNcremallera_tarifes_horaris_primavera-estiu-tardor26_sense-marques-de-tall.pdf", publisher: "FGC Turistren" },
  { name: "Vall de Núria — practical information and station calendar", url: "https://pirineu365.cat/estiu/valldenuria/estacio/informacio-practica/", publisher: "FGC Pirineu365" },
  { name: "Vall de Núria — winter fares", url: "https://pirineu365.cat/valldenuria/estacio/tarifes/", publisher: "FGC Pirineu365" },
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
      "Cremallera de Núria 2026: 34 € anada i tornada des de Ribes, 31 € des de Queralbs, gratis fins a 3 anys. Horaris, novembre, TreNatura i com arribar-hi.",
    excerpt:
      "Com pujar a la Vall de Núria: preus del cremallera, el combinat amb Rodalies, l'estat de l'R3, el novembre i el Camí Vell, amb dades d'FGC.",
  },
  es: {
    path: "escapadas/vall-de-nuria-cremallera",
    title: "Cremallera de la Vall de Núria 2026: precios, horarios y cómo llegar",
    seoTitle: "Cremallera Vall de Núria 2026: precios y horarios",
    seoDescription:
      "Cremallera de Núria 2026: 34 € ida y vuelta desde Ribes, 31 € desde Queralbs, gratis hasta 3 años. Horarios, noviembre, TreNatura y cómo llegar.",
    excerpt:
      "Cómo subir a la Vall de Núria: precios del cremallera, el combinado con Rodalies, el estado de la R3, noviembre y el Camí Vell, con datos de FGC.",
  },
  en: {
    path: "day-trips/vall-de-nuria-rack-railway",
    title: "Vall de Núria from Barcelona: rack railway, tickets and getting there",
    seoTitle: "Núria rack railway: timetable, tickets and fares",
    seoDescription:
      "Núria rack railway 2026: return €34 from Ribes, €31 from Queralbs, free under 4. Timetable, November weekday closure, TreNatura and the R3.",
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
  timesNote: string;
  getTitle: string;
  get: string[];
  r3Title: string;
  r3: string;
  novTitle: string;
  nov: string[];
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
    lead: "El **cremallera de Núria** costa **34 € anada i tornada des de Ribes de Freser** i **31 € des de Queralbs** per a un adult (infants de 4 a 13 anys, 22 i 20 €; fins a 3 anys, gratis), segons les tarifes d'FGC vigents fins al 30 de novembre del 2026. A la **Vall de Núria** no hi arriba cap carretera: s'hi puja amb el cremallera o a peu. A sota tens els horaris, com s'hi va des de Barcelona amb l'R3 tal com circula ara, què passa al novembre i què hi ha a dalt.",
    note: "Els preus del cremallera són els que FGC publica com a vigents fins al 30 de novembre del 2026. L'R3 circula amb servei reduït per obres: consulta Rodalies abans de sortir.",
    lineTitle: "El cremallera",
    line: [
      "El cremallera surt de **Ribes-Enllaç**, al costat de l'estació de l'R3, i para a **Ribes-Vila** i **Queralbs** abans d'arribar a Núria. Fa 12,5 km, puja uns 1.000 metres de desnivell i triga uns 40 minuts. Es va inaugurar el 1931, i l'estació de Núria és a **1.964 metres**.",
      "Queralbs és l'últim punt on s'arriba amb cotxe. A les tres estacions de baix (Ribes-Enllaç, Ribes-Vila i Queralbs) hi ha aparcament gratuït. FGC demana comprar el bitllet en línia per assegurar plaça.",
    ],
    faresTitle: "Quant costa el cremallera de Núria",
    faresCaption: "Cremallera de Núria, preus 2026",
    faresHeaders: ["Edat", "Anada i tornada des de Ribes", "Anada i tornada des de Queralbs", "Només anada des de Ribes", "Només anada des de Queralbs"],
    faresRows: [
      ["Adults (14 a 64 anys)", "34,00 €", "31,00 €", "23,50 €", "21,50 €"],
      ["Infants (4 a 13 anys)", "22,00 €", "20,00 €", "15,50 €", "14,00 €"],
      ["A partir de 65 anys", "29,00 €", "25,00 €", "20,00 €", "18,50 €"],
      ["De 0 a 3 anys", "Gratuït", "Gratuït", "Gratuït", "Gratuït"],
    ],
    faresNote: "Vigents fins al 30 de novembre del 2026, segons FGC. L'anada i la tornada s'han de fer el mateix dia.",
    timesTitle: "Horaris del cremallera de Núria",
    times: "Aquests són els trens de **temporada baixa**, la de la majoria de dies de tardor. Els dies de temporada alta, alguns caps de setmana i festius, hi ha més trens i l'últim baixa de Núria a les 18.05: el calendari de colors del fullet d'FGC diu quin tipus de dia és el teu. El tren de pujada triga uns 40 minuts.",
    timesCaptions: ["Pujada: de Ribes-Enllaç a Núria", "Baixada: de Núria a Ribes-Enllaç"],
    timesHeaders: [["Surt de Ribes-Enllaç", "Arriba a Núria"], ["Surt de Núria", "Arriba a Ribes-Enllaç"]],
    friday: "només divendres",
    timesNote: "* El primer tren surt de Ribes-Vila. Tots paren a Ribes-Vila i Queralbs. Fullet d'FGC primavera-estiu-tardor 2026, llegit el 28 d'octubre de 2026.",
    fares: [
      "El bitllet inclou el **Telefèric Coma del Clot**, l'entrada a la **basílica**, les exposicions i una audioguia. Els gossos viatgen gratis, lligats i amb morrió (a la taquilla en venen per 5 €).",
      "Si hi pujaràs sovint, hi ha un **abonament de temporada** de 104 € (a partir de 14 anys) i 66 € (de 4 a 13 anys), vàlid un any des del dia de la compra.",
      "Per a l'hivern, FGC ja ha publicat l'abonament de temporada del cremallera, vàlid de l'1 de desembre del 2026 al 30 d'abril del 2027: 62,50 € adults i 39,50 € infants. Els bitllets senzills d'hivern i els forfets d'esquí de la temporada 2026-2027 encara no eren públics el 28 d'octubre.",
    ],
    getTitle: "Com arribar a Núria des de Barcelona",
    get: [
      "**En tren:** l'R3 de Rodalies enllaça amb el cremallera a Ribes de Freser. El bitllet combinat **TreNatura** inclou el tren d'anada i tornada des de qualsevol estació de Rodalies fins a Ribes de Freser i el cremallera fins a Núria: **40,20 €** adults i **30,70 €** infants de 4 a 13 anys. Renfe el ven tot l'any excepte els dies feiners de novembre.",
      "**En cotxe:** fins a Ribes de Freser o Queralbs, i allà el cremallera. Els tres aparcaments de les estacions són gratuïts.",
    ],
    r3Title: "L'R3, ara mateix",
    r3: "Segons l'avís de Rodalies del 6 de juliol del 2026, l'R3 circula amb el 50 % dels trens que tenia abans del 20 de gener, per obres a la via. Entre Barcelona i la Garriga el servei el cobreixen l'R4 i autobusos alternatius, i els trens de l'R3 van de la Garriga a Puigcerdà; el viatge és més llarg que l'habitual. Des del 12 d'agost hi ha també autobusos complementaris entre la Garriga i Puigcerdà, i l'avís continuava vigent el 28 d'octubre. El TreNatura continua sent vàlid durant aquest període. Mira els horaris a rodalies.gencat.cat abans de sortir.",
    novTitle: "El cremallera de Núria al novembre",
    nov: [
      "El calendari oficial de l'estació per al novembre del 2026 marca **tancats els dies feiners** i oberts els caps de setmana. És el que FGC va fer el 2025: del 3 al 30 de novembre el cremallera només va pujar a Núria els caps de setmana, i els dies feiners va fer tres viatges entre Ribes i Queralbs; al desembre va tornar a circular cada dia. L'avís d'enguany encara no s'havia publicat el 28 d'octubre.",
      "El combinat TreNatura tampoc no es ven els dies feiners de novembre. Si hi vols anar aquest mes, ves-hi en cap de setmana i comprova-ho a FGC abans de sortir.",
    ],
    valleyTitle: "Què hi ha a la vall",
    valley: [
      "La vall és dins del Parc Natural de les Capçaleres del Ter i del Freser, envoltada de cims de més de 2.900 metres. Al fons hi ha el **santuari de la Mare de Déu de Núria**, el llac i l'hotel.",
      "El **Telefèric Coma del Clot** puja fins al Pic de l'Àliga, a més de 2.100 metres, un dels millors miradors de la vall. Des del juny del 2026 hi ha també el nou **Mirador del Llac**. A l'estiu hi ha barques al llac, un parc lúdic i rutes curtes al voltant del santuari; a l'hivern, l'estació d'esquí.",
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
      { question: "Quant costa el cremallera de Núria?", answer: "Anada i tornada des de Ribes, 34 € adults, 22 € infants de 4 a 13 anys i 29 € a partir de 65; des de Queralbs, 31, 20 i 25 €. Preus vigents fins al 30 de novembre del 2026, segons FGC." },
      { question: "Quin és l'últim cremallera de baixada?", answer: "En temporada baixa surt de Núria a les 17.10 (els divendres, també a les 19.00 i les 21.00); en temporada alta, a les 18.05. Horaris d'FGC vigents fins al 30 de novembre del 2026." },
      { question: "Quant costa només l'anada?", answer: "23,50 € adults des de Ribes i 21,50 € des de Queralbs; infants de 4 a 13 anys, 15,50 i 14 €." },
      { question: "Es pot anar a Núria amb cotxe?", answer: "No. Es pot arribar amb cotxe fins a Ribes de Freser o Queralbs, on hi ha aparcament gratuït, i d'allà s'hi puja amb el cremallera o a peu." },
      { question: "Què inclou el bitllet TreNatura?", answer: "El tren de Rodalies d'anada i tornada des de qualsevol estació fins a Ribes de Freser i el cremallera fins a Núria. Costa 40,20 € adults i 30,70 € infants." },
      { question: "El cremallera funciona al novembre?", answer: "El calendari de l'estació per al novembre del 2026 marca tancats els dies feiners i oberts els caps de setmana. Comprova-ho a FGC abans d'anar-hi." },
      { question: "El cremallera de Núria és gratis per a algú?", answer: "Per als infants de 0 a 3 anys, que no paguen, i per als gossos, que viatgen gratis lligats i amb morrió. Els altres paguen la tarifa: 34 € anada i tornada des de Ribes per a un adult." },
      { question: "Quant costa el forfet d'esquí de Vall de Núria?", answer: "El 28 d'octubre FGC encara no havia publicat els forfets de la temporada 2026-2027. Sí que hi havia l'abonament d'hivern del cremallera: 62,50 € adults i 39,50 € infants, de l'1 de desembre del 2026 al 30 d'abril del 2027." },
    ],
  },
  es: {
    lead: "El **cremallera de Núria** cuesta **34 € ida y vuelta desde Ribes de Freser** y **31 € desde Queralbs** para un adulto (niños de 4 a 13 años, 22 y 20 €; hasta 3 años, gratis), según las tarifas de FGC vigentes hasta el 30 de noviembre de 2026. A la **Vall de Núria** no llega ninguna carretera: se sube en cremallera o a pie. Abajo tienes los horarios, cómo se va desde Barcelona con la R3 tal como circula ahora, qué pasa en noviembre y qué hay arriba.",
    note: "Los precios del cremallera son los que FGC publica como vigentes hasta el 30 de noviembre de 2026. La R3 circula con servicio reducido por obras: consulta Rodalies antes de salir.",
    lineTitle: "El cremallera",
    line: [
      "El cremallera sale de **Ribes-Enllaç**, junto a la estación de la R3, y para en **Ribes-Vila** y **Queralbs** antes de llegar a Núria. Recorre 12,5 km, sube unos 1.000 metros de desnivel y tarda unos 40 minutos. Se inauguró en 1931, y la estación de Núria está a **1.964 metros**.",
      "Queralbs es el último punto al que se llega en coche. En las tres estaciones de abajo (Ribes-Enllaç, Ribes-Vila y Queralbs) hay aparcamiento gratuito. FGC pide comprar el billete en línea para asegurar plaza.",
    ],
    faresTitle: "Cuánto cuesta el cremallera de Núria",
    faresCaption: "Cremallera de Núria, precios 2026",
    faresHeaders: ["Edad", "Ida y vuelta desde Ribes", "Ida y vuelta desde Queralbs", "Solo ida desde Ribes", "Solo ida desde Queralbs"],
    faresRows: [
      ["Adultos (14 a 64 años)", "34,00 €", "31,00 €", "23,50 €", "21,50 €"],
      ["Niños (4 a 13 años)", "22,00 €", "20,00 €", "15,50 €", "14,00 €"],
      ["A partir de 65 años", "29,00 €", "25,00 €", "20,00 €", "18,50 €"],
      ["De 0 a 3 años", "Gratis", "Gratis", "Gratis", "Gratis"],
    ],
    faresNote: "Vigentes hasta el 30 de noviembre de 2026, según FGC. La ida y la vuelta se deben hacer el mismo día.",
    timesTitle: "Horarios del cremallera de Núria",
    times: "Estos son los trenes de **temporada baja**, la de la mayoría de días de otoño. Los días de temporada alta, algunos fines de semana y festivos, hay más trenes y el último baja de Núria a las 18.05: el calendario de colores del folleto de FGC indica qué tipo de día es el tuyo. El tren de subida tarda unos 40 minutos.",
    timesCaptions: ["Subida: de Ribes-Enllaç a Núria", "Bajada: de Núria a Ribes-Enllaç"],
    timesHeaders: [["Sale de Ribes-Enllaç", "Llega a Núria"], ["Sale de Núria", "Llega a Ribes-Enllaç"]],
    friday: "solo viernes",
    timesNote: "* El primer tren sale de Ribes-Vila. Todos paran en Ribes-Vila y Queralbs. Folleto de FGC primavera-verano-otoño 2026, leído el 28 de octubre de 2026.",
    fares: [
      "El billete incluye el **Telefèric Coma del Clot**, la entrada a la **basílica**, las exposiciones y una audioguía. Los perros viajan gratis, atados y con bozal (en la taquilla venden bozales por 5 €).",
      "Si vas a subir a menudo, hay un **abono de temporada** de 104 € (a partir de 14 años) y 66 € (de 4 a 13 años), válido un año desde el día de la compra.",
      "Para el invierno, FGC ya ha publicado el abono de temporada del cremallera, válido del 1 de diciembre de 2026 al 30 de abril de 2027: 62,50 € adultos y 39,50 € niños. Los billetes sencillos de invierno y los forfaits de esquí de la temporada 2026-2027 aún no eran públicos el 28 de octubre.",
    ],
    getTitle: "Cómo llegar a Núria desde Barcelona",
    get: [
      "**En tren:** la R3 de Rodalies enlaza con el cremallera en Ribes de Freser. El billete combinado **TreNatura** incluye el tren de ida y vuelta desde cualquier estación de Rodalies hasta Ribes de Freser y el cremallera hasta Núria: **40,20 €** adultos y **30,70 €** niños de 4 a 13 años. Renfe lo vende todo el año excepto los días laborables de noviembre.",
      "**En coche:** hasta Ribes de Freser o Queralbs, y allí el cremallera. Los tres aparcamientos de las estaciones son gratuitos.",
    ],
    r3Title: "La R3, ahora mismo",
    r3: "Según el aviso de Rodalies del 6 de julio de 2026, la R3 circula con el 50 % de los trenes que tenía antes del 20 de enero, por obras en la vía. Entre Barcelona y La Garriga el servicio lo cubren la R4 y autobuses alternativos, y los trenes de la R3 van de La Garriga a Puigcerdà; el viaje es más largo de lo habitual. Desde el 12 de agosto hay también autobuses complementarios entre La Garriga y Puigcerdà, y el aviso seguía vigente el 28 de octubre. El TreNatura sigue siendo válido durante este periodo. Mira los horarios en rodalies.gencat.cat antes de salir.",
    novTitle: "El cremallera de Núria en noviembre",
    nov: [
      "El calendario oficial de la estación para noviembre de 2026 marca **cerrados los días laborables** y abiertos los fines de semana. Es lo que FGC hizo en 2025: del 3 al 30 de noviembre el cremallera solo subió a Núria los fines de semana, y los días laborables hizo tres viajes entre Ribes y Queralbs; en diciembre volvió a circular a diario. El aviso de este año aún no se había publicado el 28 de octubre.",
      "El combinado TreNatura tampoco se vende los días laborables de noviembre. Si quieres ir este mes, ve en fin de semana y compruébalo en FGC antes de salir.",
    ],
    valleyTitle: "Qué hay en el valle",
    valley: [
      "El valle está dentro del Parc Natural de les Capçaleres del Ter i del Freser, rodeado de cimas de más de 2.900 metros. Al fondo están el **santuario de la Mare de Déu de Núria**, el lago y el hotel.",
      "El **Telefèric Coma del Clot** sube hasta el Pic de l'Àliga, a más de 2.100 metros, uno de los mejores miradores del valle. Desde junio de 2026 hay también el nuevo **Mirador del Llac**. En verano hay barcas en el lago, un parque lúdico y rutas cortas alrededor del santuario; en invierno, la estación de esquí.",
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
      { question: "¿Cuánto cuesta el cremallera de Núria?", answer: "Ida y vuelta desde Ribes, 34 € adultos, 22 € niños de 4 a 13 años y 29 € a partir de 65; desde Queralbs, 31, 20 y 25 €. Precios vigentes hasta el 30 de noviembre de 2026, según FGC." },
      { question: "¿Cuál es el último cremallera de bajada?", answer: "En temporada baja sale de Núria a las 17.10 (los viernes, también a las 19.00 y las 21.00); en temporada alta, a las 18.05. Horarios de FGC vigentes hasta el 30 de noviembre de 2026." },
      { question: "¿Cuánto cuesta solo la ida?", answer: "23,50 € adultos desde Ribes y 21,50 € desde Queralbs; niños de 4 a 13 años, 15,50 y 14 €." },
      { question: "¿Se puede ir a Núria en coche?", answer: "No. Se puede llegar en coche hasta Ribes de Freser o Queralbs, donde hay aparcamiento gratuito, y desde allí se sube en cremallera o a pie." },
      { question: "¿Qué incluye el billete TreNatura?", answer: "El tren de Rodalies de ida y vuelta desde cualquier estación hasta Ribes de Freser y el cremallera hasta Núria. Cuesta 40,20 € adultos y 30,70 € niños." },
      { question: "¿Funciona el cremallera en noviembre?", answer: "El calendario de la estación para noviembre de 2026 marca cerrados los días laborables y abiertos los fines de semana. Compruébalo en FGC antes de ir." },
      { question: "¿Es gratis el cremallera de Núria para alguien?", answer: "Para los niños de 0 a 3 años, que no pagan, y para los perros, que viajan gratis atados y con bozal. Los demás pagan la tarifa: 34 € ida y vuelta desde Ribes para un adulto." },
      { question: "¿Cuánto cuesta el forfait de Vall de Núria?", answer: "El 28 de octubre FGC aún no había publicado los forfaits de la temporada 2026-2027. Sí estaba el abono de invierno del cremallera: 62,50 € adultos y 39,50 € niños, del 1 de diciembre de 2026 al 30 de abril de 2027." },
    ],
  },
  en: {
    lead: "The **Núria rack railway** (the Cremallera) costs **€34 return from Ribes de Freser** and **€31 from Queralbs** for an adult (children aged 4 to 13, €22 and €20; under 4, free), on FGC's fares valid until 30 November 2026. No road reaches **Vall de Núria**: you go up by rack railway or on foot. Below are the timetable, how to get there from Barcelona on the R3 as it runs now, what happens in November and what is up there.",
    note: "Rack railway fares are the ones FGC publishes as valid until 30 November 2026. The R3 is running a reduced service because of works: check Rodalies before you set off.",
    lineTitle: "The rack railway",
    line: [
      "The Cremallera starts at **Ribes-Enllaç**, next to the R3 station, and stops at **Ribes-Vila** and **Queralbs** before reaching Núria. It covers 12.5 km, climbs about 1,000 metres and takes about 40 minutes. It opened in 1931, and Núria station sits at **1,964 metres**.",
      "Queralbs is as far as a car can go. All three lower stations (Ribes-Enllaç, Ribes-Vila and Queralbs) have free parking. FGC asks you to buy online to be sure of a seat.",
    ],
    faresTitle: "Núria rack railway fares",
    faresCaption: "Núria rack railway, 2026 fares",
    faresHeaders: ["Age", "Return from Ribes", "Return from Queralbs", "Single from Ribes", "Single from Queralbs"],
    faresRows: [
      ["Adults (14 to 64)", "€34", "€31", "€23.50", "€21.50"],
      ["Children (4 to 13)", "€22", "€20", "€15.50", "€14"],
      ["65 and over", "€29", "€25", "€20", "€18.50"],
      ["Under 4", "Free", "Free", "Free", "Free"],
    ],
    faresNote: "Valid until 30 November 2026, according to FGC. Both legs of a return must be used on the same day.",
    timesTitle: "Núria rack railway timetable",
    times: "These are the **low-season** trains, which cover most autumn days. On high-season days, some weekends and public holidays, there are more trains and the last one leaves Núria at 18.05: the colour calendar on FGC's leaflet shows which kind of day yours is. The ride up takes about 40 minutes.",
    timesCaptions: ["Up: Ribes-Enllaç to Núria", "Down: Núria to Ribes-Enllaç"],
    timesHeaders: [["Leaves Ribes-Enllaç", "Arrives Núria"], ["Leaves Núria", "Arrives Ribes-Enllaç"]],
    friday: "Fridays only",
    timesNote: "* The first train starts at Ribes-Vila. All trains stop at Ribes-Vila and Queralbs. FGC's spring-summer-autumn 2026 leaflet, read on 28 October 2026.",
    fares: [
      "The ticket includes the **Coma del Clot cable car** (Telefèric), entry to the **basilica**, the exhibitions and an audio guide. Dogs travel free, on a lead and muzzled (the ticket office sells muzzles for €5).",
      "If you will go up often, there is a **season ticket**: €104 from age 14 and €66 for ages 4 to 13, valid for a year from the day you buy it.",
      "For winter, FGC has already published the rack railway season ticket, valid from 1 December 2026 to 30 April 2027: €62.50 for adults and €39.50 for children. Winter single and return fares and the 2026-27 ski passes were not out yet on 28 October.",
    ],
    getTitle: "Getting there from Barcelona",
    get: [
      "**By train:** the R3 Rodalies line connects with the rack railway at Ribes de Freser. The combined **TreNatura** ticket covers the return train from any Rodalies station to Ribes de Freser plus the rack railway to Núria: **€40.20** for adults and **€30.70** for children aged 4 to 13. Renfe sells it all year except on weekdays in November.",
      "**By car:** drive to Ribes de Freser or Queralbs and take the rack railway from there. The car parks at all three stations are free.",
    ],
    r3Title: "The R3 right now",
    r3: "According to Rodalies' notice of 6 July 2026, the R3 is running 50% of the trains it had before 20 January, because of track works. Between Barcelona and La Garriga the service is covered by the R4 and replacement buses, and R3 trains run from La Garriga to Puigcerdà; the journey takes longer than usual. Since 12 August there have also been complementary buses between La Garriga and Puigcerdà, and the notice was still in force on 28 October. TreNatura tickets stay valid throughout. Check the timetables at rodalies.gencat.cat before you go.",
    novTitle: "The rack railway in November",
    nov: [
      "The resort's official calendar for November 2026 shows **weekdays closed** and weekends open. That is what FGC did in 2025: from 3 to 30 November the rack railway ran up to Núria only at weekends, with three weekday trips between Ribes and Queralbs, and it went back to running daily in December. This year's notice was not out yet on 28 October.",
      "The TreNatura combined ticket is not sold on November weekdays either. If you want to go this month, go at a weekend and check with FGC before you set off.",
    ],
    valleyTitle: "What's in the valley",
    valley: [
      "The valley lies inside the Capçaleres del Ter i del Freser Natural Park, ringed by peaks of more than 2,900 metres. At its head are the **sanctuary of Our Lady of Núria**, the lake and the hotel.",
      "The **Coma del Clot cable car** climbs to Pic de l'Àliga, at over 2,100 metres, one of the best viewpoints over the valley, and since June 2026 there is a new **lake viewpoint** (Mirador del Llac). In summer there are boats on the lake, a play park and short walks around the sanctuary; in winter, the ski area.",
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
      { question: "How much is the Núria rack railway?", answer: "Return from Ribes: €34 adults, €22 children aged 4 to 13, €29 for 65 and over; from Queralbs: €31, €20 and €25. Fares valid until 30 November 2026, according to FGC." },
      { question: "What time is the last train down from Núria?", answer: "In low season it leaves Núria at 17.10 (on Fridays also at 19.00 and 21.00); in high season, at 18.05. FGC timetable valid until 30 November 2026." },
      { question: "How much is a single ticket?", answer: "€23.50 for adults from Ribes and €21.50 from Queralbs; children aged 4 to 13, €15.50 and €14." },
      { question: "Can you drive to Núria?", answer: "No. You can drive to Ribes de Freser or Queralbs, which have free parking, and go up from there by rack railway or on foot." },
      { question: "What does the TreNatura ticket include?", answer: "The return Rodalies train from any station to Ribes de Freser and the rack railway to Núria. It costs €40.20 for adults and €30.70 for children." },
      { question: "Does the Núria rack railway run in November?", answer: "The resort's calendar for November 2026 shows weekdays closed and weekends open. Check with FGC before you go." },
      { question: "Is the Núria rack railway free for anyone?", answer: "For children under 4, who ride free, and for dogs, which travel free on a lead and muzzled. Everyone else pays the fare: €34 return from Ribes for an adult." },
      { question: "How much is a Vall de Núria ski pass?", answer: "On 28 October FGC had not yet published the 2026-27 ski passes. The winter rack railway season ticket was out: €62.50 for adults and €39.50 for children, from 1 December 2026 to 30 April 2027." },
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
    table(t.timesCaptions[0], t.timesHeaders[0], [...UP, ...UP_FRIDAY.map(([a, b]) => [`${a} (${t.friday})`, b])], t.timesNote),
    table(t.timesCaptions[1], t.timesHeaders[1], [...DOWN, ...DOWN_FRIDAY.map(([a, b]) => [`${a} (${t.friday})`, b])]),
    ...h2(t.getTitle),
    list(...t.get),
    callout("warning", t.r3Title, t.r3 + STRIKES_LINE[locale]),
    ...h2(t.novTitle, ...t.nov),
    ...h2(t.valleyTitle, ...t.valley),
    ...h2(t.walkTitle, ...t.walk),
    ...h2(t.legendTitle, ...t.legend),
    faq(t.faq),
    ...b2Related(["ripolles", "ski", "snowNow", "snow", "cerdanya"], locale),
  ];
}

export const NURIA: B2Article = {
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
