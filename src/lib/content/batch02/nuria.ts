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

const VERIFIED = "2026-10-12";

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
    title: "Vall de Núria des de Barcelona: el cremallera, preus i com arribar-hi",
    seoTitle: "Vall de Núria: cremallera, preus i com arribar-hi",
    seoDescription:
      "Quant costa el cremallera de Núria, el bitllet TreNatura des de Barcelona, com està l'R3, què hi ha a la vall i el Camí Vell des de Queralbs. Dades d'FGC.",
    excerpt:
      "Com pujar a la Vall de Núria: preus del cremallera, el combinat amb Rodalies, l'estat de l'R3, el novembre i el Camí Vell, amb dades d'FGC.",
  },
  es: {
    path: "escapadas/vall-de-nuria-cremallera",
    title: "Vall de Núria desde Barcelona: el cremallera, precios y cómo llegar",
    seoTitle: "Vall de Núria: cremallera, precios y cómo llegar",
    seoDescription:
      "Cuánto cuesta el cremallera de Núria, el billete TreNatura desde Barcelona, cómo está la R3, qué hay en el valle y el Camí Vell desde Queralbs. Datos de FGC.",
    excerpt:
      "Cómo subir a la Vall de Núria: precios del cremallera, el combinado con Rodalies, el estado de la R3, noviembre y el Camí Vell, con datos de FGC.",
  },
  en: {
    path: "day-trips/vall-de-nuria-rack-railway",
    title: "Vall de Núria from Barcelona: rack railway, tickets and getting there",
    seoTitle: "Vall de Núria rack railway: tickets and getting there",
    seoDescription:
      "What the Núria rack railway costs, the TreNatura ticket from Barcelona, the state of the R3 line, what's in the valley and the old path from Queralbs.",
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
    lead: "A la **Vall de Núria** no hi arriba cap carretera: s'hi puja amb el **cremallera** des de Ribes de Freser o Queralbs, o a peu. Aquí tens què costa, com s'hi va des de Barcelona amb l'R3 tal com circula ara, què passa al novembre i què hi ha a dalt, amb les dades d'FGC, que explota el tren i l'estació.",
    note: "Els preus del cremallera són els que FGC publica com a vigents fins al 30 de novembre del 2026. L'R3 circula amb servei reduït per obres: consulta Rodalies abans de sortir.",
    lineTitle: "El cremallera",
    line: [
      "El cremallera surt de **Ribes-Enllaç**, al costat de l'estació de l'R3, i para a **Ribes-Vila** i **Queralbs** abans d'arribar a Núria. Fa 12,5 km, puja uns 1.000 metres de desnivell i triga uns 40 minuts. Es va inaugurar el 1931, i l'estació de Núria és a **1.964 metres**.",
      "Queralbs és l'últim punt on s'arriba amb cotxe. A les tres estacions de baix (Ribes-Enllaç, Ribes-Vila i Queralbs) hi ha aparcament gratuït. FGC demana comprar el bitllet en línia per assegurar plaça.",
    ],
    faresTitle: "Quant costa",
    faresCaption: "Cremallera de Núria, anada i tornada (preus 2026)",
    faresHeaders: ["Edat", "Des de Ribes", "Des de Queralbs"],
    faresRows: [
      ["Adults (14 a 64 anys)", "34,00 €", "31,00 €"],
      ["Infants (4 a 13 anys)", "22,00 €", "20,00 €"],
      ["A partir de 65 anys", "29,00 €", "25,00 €"],
      ["De 0 a 3 anys", "Gratuït", "Gratuït"],
    ],
    faresNote: "Vigents fins al 30 de novembre del 2026, segons FGC. L'anada i la tornada s'han de fer el mateix dia.",
    fares: [
      "El bitllet inclou el **Telefèric Coma del Clot**, l'entrada a la **basílica**, les exposicions i una audioguia. Els gossos viatgen gratis, lligats i amb morrió.",
      "Per a l'hivern, FGC ja ha publicat l'abonament de temporada del cremallera, vàlid de l'1 de desembre del 2026 al 30 d'abril del 2027: 62,50 € adults i 39,50 € infants. Els bitllets senzills d'hivern encara no són públics.",
    ],
    getTitle: "Com arribar-hi des de Barcelona",
    get: [
      "**En tren:** l'R3 de Rodalies enllaça amb el cremallera a Ribes de Freser. El bitllet combinat **TreNatura** inclou el tren d'anada i tornada des de qualsevol estació de Rodalies fins a Ribes de Freser i el cremallera fins a Núria: **40,20 €** adults i **30,70 €** infants de 4 a 13 anys. Renfe el ven tot l'any excepte els dies feiners de novembre.",
      "**En cotxe:** fins a Ribes de Freser o Queralbs, i allà el cremallera. Els tres aparcaments de les estacions són gratuïts.",
    ],
    r3Title: "L'R3, ara mateix",
    r3: "Segons l'avís de Rodalies del 6 de juliol del 2026, l'R3 circula amb el 50 % dels trens que tenia abans del 20 de gener, per obres a la via. Entre Barcelona i la Garriga el servei el cobreixen l'R4 i autobusos alternatius, i els trens de l'R3 van de la Garriga a Puigcerdà; el viatge és més llarg que l'habitual. El TreNatura continua sent vàlid durant aquest període. Mira els horaris a rodalies.gencat.cat abans de sortir.",
    novTitle: "Al novembre",
    nov: [
      "El calendari oficial de l'estació per al novembre del 2026 marca **tancats els dies feiners** i oberts els caps de setmana. Els anys anteriors FGC ha reduït el cremallera fins a Núria als caps de setmana durant el novembre, amb un servei curt entre Ribes i Queralbs els dies feiners. Si hi vols anar al novembre, ves-hi en cap de setmana i comprova-ho abans.",
    ],
    valleyTitle: "Què hi ha a la vall",
    valley: [
      "La vall és dins del Parc Natural de les Capçaleres del Ter i del Freser, envoltada de cims de més de 2.900 metres. Al fons hi ha el **santuari de la Mare de Déu de Núria**, el llac i l'hotel.",
      "El **Telefèric Coma del Clot** puja fins al Pic de l'Àliga, a més de 2.100 metres, un dels millors miradors de la vall. Des del juny del 2026 hi ha també el nou **Mirador del Llac**. A l'estiu hi ha barques al llac, un parc lúdic i rutes curtes al voltant del santuari; a l'hivern, l'estació d'esquí.",
    ],
    walkTitle: "A peu: el Camí Vell des de Queralbs",
    walk: [
      "L'antic camí dels pelegrins surt de la plaça del Raig de Queralbs i puja per les gorges del Freser, amb salts d'aigua com el del Sastre i la Cua de Cavall, fins a albirar el llac. El Parc Natural el dona com a **7,7 km i 932 metres de desnivell**, unes **3 hores i 45 minuts**, i el classifica com a exigent.",
      "La xifra és per pujar a peu i baixar amb el cremallera fins a Queralbs. El Parc el recomana a la primavera, l'estiu i la tardor.",
    ],
    legendTitle: "La Mare de Déu de Núria",
    legend: [
      "Segons la tradició que recull FGC, cap a l'any 700 Sant Gil va esculpir la imatge de la Mare de Déu i la va amagar amb la **creu, la campana i l'olla**. Segles després uns pastors, seguint un brau de pèl vermell, la van trobar, i la basílica és on diuen que va passar. La festa de la Mare de Déu de Núria és el **8 de setembre**.",
    ],
    faq: [
      { question: "Quant costa el cremallera de Núria?", answer: "Anada i tornada des de Ribes, 34 € adults, 22 € infants de 4 a 13 anys i 29 € a partir de 65; des de Queralbs, 31, 20 i 25 €. Preus vigents fins al 30 de novembre del 2026, segons FGC." },
      { question: "Es pot anar a Núria amb cotxe?", answer: "No. Es pot arribar amb cotxe fins a Ribes de Freser o Queralbs, on hi ha aparcament gratuït, i d'allà s'hi puja amb el cremallera o a peu." },
      { question: "Què inclou el bitllet TreNatura?", answer: "El tren de Rodalies d'anada i tornada des de qualsevol estació fins a Ribes de Freser i el cremallera fins a Núria. Costa 40,20 € adults i 30,70 € infants." },
      { question: "El cremallera funciona al novembre?", answer: "El calendari de l'estació per al novembre del 2026 marca tancats els dies feiners i oberts els caps de setmana. Comprova-ho a FGC abans d'anar-hi." },
    ],
  },
  es: {
    lead: "A la **Vall de Núria** no llega ninguna carretera: se sube en **cremallera** desde Ribes de Freser o Queralbs, o a pie. Aquí tienes lo que cuesta, cómo se va desde Barcelona con la R3 tal como circula ahora, qué pasa en noviembre y qué hay arriba, con los datos de FGC, que explota el tren y la estación.",
    note: "Los precios del cremallera son los que FGC publica como vigentes hasta el 30 de noviembre de 2026. La R3 circula con servicio reducido por obras: consulta Rodalies antes de salir.",
    lineTitle: "El cremallera",
    line: [
      "El cremallera sale de **Ribes-Enllaç**, junto a la estación de la R3, y para en **Ribes-Vila** y **Queralbs** antes de llegar a Núria. Recorre 12,5 km, sube unos 1.000 metros de desnivel y tarda unos 40 minutos. Se inauguró en 1931, y la estación de Núria está a **1.964 metros**.",
      "Queralbs es el último punto al que se llega en coche. En las tres estaciones de abajo (Ribes-Enllaç, Ribes-Vila y Queralbs) hay aparcamiento gratuito. FGC pide comprar el billete en línea para asegurar plaza.",
    ],
    faresTitle: "Cuánto cuesta",
    faresCaption: "Cremallera de Núria, ida y vuelta (precios 2026)",
    faresHeaders: ["Edad", "Desde Ribes", "Desde Queralbs"],
    faresRows: [
      ["Adultos (14 a 64 años)", "34,00 €", "31,00 €"],
      ["Niños (4 a 13 años)", "22,00 €", "20,00 €"],
      ["A partir de 65 años", "29,00 €", "25,00 €"],
      ["De 0 a 3 años", "Gratis", "Gratis"],
    ],
    faresNote: "Vigentes hasta el 30 de noviembre de 2026, según FGC. La ida y la vuelta se deben hacer el mismo día.",
    fares: [
      "El billete incluye el **Telefèric Coma del Clot**, la entrada a la **basílica**, las exposiciones y una audioguía. Los perros viajan gratis, atados y con bozal.",
      "Para el invierno, FGC ya ha publicado el abono de temporada del cremallera, válido del 1 de diciembre de 2026 al 30 de abril de 2027: 62,50 € adultos y 39,50 € niños. Los billetes sencillos de invierno aún no son públicos.",
    ],
    getTitle: "Cómo llegar desde Barcelona",
    get: [
      "**En tren:** la R3 de Rodalies enlaza con el cremallera en Ribes de Freser. El billete combinado **TreNatura** incluye el tren de ida y vuelta desde cualquier estación de Rodalies hasta Ribes de Freser y el cremallera hasta Núria: **40,20 €** adultos y **30,70 €** niños de 4 a 13 años. Renfe lo vende todo el año excepto los días laborables de noviembre.",
      "**En coche:** hasta Ribes de Freser o Queralbs, y allí el cremallera. Los tres aparcamientos de las estaciones son gratuitos.",
    ],
    r3Title: "La R3, ahora mismo",
    r3: "Según el aviso de Rodalies del 6 de julio de 2026, la R3 circula con el 50 % de los trenes que tenía antes del 20 de enero, por obras en la vía. Entre Barcelona y La Garriga el servicio lo cubren la R4 y autobuses alternativos, y los trenes de la R3 van de La Garriga a Puigcerdà; el viaje es más largo de lo habitual. El TreNatura sigue siendo válido durante este periodo. Mira los horarios en rodalies.gencat.cat antes de salir.",
    novTitle: "En noviembre",
    nov: [
      "El calendario oficial de la estación para noviembre de 2026 marca **cerrados los días laborables** y abiertos los fines de semana. Los años anteriores FGC ha reducido el cremallera hasta Núria a los fines de semana durante noviembre, con un servicio corto entre Ribes y Queralbs los días laborables. Si quieres ir en noviembre, ve en fin de semana y compruébalo antes.",
    ],
    valleyTitle: "Qué hay en el valle",
    valley: [
      "El valle está dentro del Parc Natural de les Capçaleres del Ter i del Freser, rodeado de cimas de más de 2.900 metros. Al fondo están el **santuario de la Mare de Déu de Núria**, el lago y el hotel.",
      "El **Telefèric Coma del Clot** sube hasta el Pic de l'Àliga, a más de 2.100 metros, uno de los mejores miradores del valle. Desde junio de 2026 hay también el nuevo **Mirador del Llac**. En verano hay barcas en el lago, un parque lúdico y rutas cortas alrededor del santuario; en invierno, la estación de esquí.",
    ],
    walkTitle: "A pie: el Camí Vell desde Queralbs",
    walk: [
      "El antiguo camino de los peregrinos sale de la plaça del Raig de Queralbs y sube por las gargantas del Freser, con saltos de agua como el del Sastre y la Cua de Cavall, hasta divisar el lago. El Parc Natural lo da como **7,7 km y 932 metros de desnivel**, unas **3 horas y 45 minutos**, y lo clasifica como exigente.",
      "La cifra es para subir a pie y bajar en cremallera hasta Queralbs. El Parc lo recomienda en primavera, verano y otoño.",
    ],
    legendTitle: "La Virgen de Núria",
    legend: [
      "Según la tradición que recoge FGC, hacia el año 700 San Gil esculpió la imagen de la Virgen y la escondió con la **cruz, la campana y la olla**. Siglos después unos pastores, siguiendo a un toro de pelo rojo, la encontraron, y la basílica está donde dicen que ocurrió. La fiesta de la Mare de Déu de Núria es el **8 de septiembre**.",
    ],
    faq: [
      { question: "¿Cuánto cuesta el cremallera de Núria?", answer: "Ida y vuelta desde Ribes, 34 € adultos, 22 € niños de 4 a 13 años y 29 € a partir de 65; desde Queralbs, 31, 20 y 25 €. Precios vigentes hasta el 30 de noviembre de 2026, según FGC." },
      { question: "¿Se puede ir a Núria en coche?", answer: "No. Se puede llegar en coche hasta Ribes de Freser o Queralbs, donde hay aparcamiento gratuito, y desde allí se sube en cremallera o a pie." },
      { question: "¿Qué incluye el billete TreNatura?", answer: "El tren de Rodalies de ida y vuelta desde cualquier estación hasta Ribes de Freser y el cremallera hasta Núria. Cuesta 40,20 € adultos y 30,70 € niños." },
      { question: "¿Funciona el cremallera en noviembre?", answer: "El calendario de la estación para noviembre de 2026 marca cerrados los días laborables y abiertos los fines de semana. Compruébalo en FGC antes de ir." },
    ],
  },
  en: {
    lead: "No road reaches **Vall de Núria**: you go up by **rack railway** (the Cremallera) from Ribes de Freser or Queralbs, or on foot. Here is what it costs, how to get there from Barcelona on the R3 as it runs now, what happens in November and what is up there, from the figures of FGC, which runs the railway and the resort.",
    note: "Rack railway fares are the ones FGC publishes as valid until 30 November 2026. The R3 is running a reduced service because of works: check Rodalies before you set off.",
    lineTitle: "The rack railway",
    line: [
      "The Cremallera starts at **Ribes-Enllaç**, next to the R3 station, and stops at **Ribes-Vila** and **Queralbs** before reaching Núria. It covers 12.5 km, climbs about 1,000 metres and takes about 40 minutes. It opened in 1931, and Núria station sits at **1,964 metres**.",
      "Queralbs is as far as a car can go. All three lower stations (Ribes-Enllaç, Ribes-Vila and Queralbs) have free parking. FGC asks you to buy online to be sure of a seat.",
    ],
    faresTitle: "What it costs",
    faresCaption: "Núria rack railway, return (2026 fares)",
    faresHeaders: ["Age", "From Ribes", "From Queralbs"],
    faresRows: [
      ["Adults (14 to 64)", "€34", "€31"],
      ["Children (4 to 13)", "€22", "€20"],
      ["65 and over", "€29", "€25"],
      ["Under 4", "Free", "Free"],
    ],
    faresNote: "Valid until 30 November 2026, according to FGC. Both legs of a return must be used on the same day.",
    fares: [
      "The ticket includes the **Coma del Clot cable car** (Telefèric), entry to the **basilica**, the exhibitions and an audio guide. Dogs travel free, on a lead and muzzled.",
      "For winter, FGC has already published the rack railway season ticket, valid from 1 December 2026 to 30 April 2027: €62.50 for adults and €39.50 for children. Single and return winter fares are not out yet.",
    ],
    getTitle: "Getting there from Barcelona",
    get: [
      "**By train:** the R3 Rodalies line connects with the rack railway at Ribes de Freser. The combined **TreNatura** ticket covers the return train from any Rodalies station to Ribes de Freser plus the rack railway to Núria: **€40.20** for adults and **€30.70** for children aged 4 to 13. Renfe sells it all year except on weekdays in November.",
      "**By car:** drive to Ribes de Freser or Queralbs and take the rack railway from there. The car parks at all three stations are free.",
    ],
    r3Title: "The R3 right now",
    r3: "According to Rodalies' notice of 6 July 2026, the R3 is running 50% of the trains it had before 20 January, because of track works. Between Barcelona and La Garriga the service is covered by the R4 and replacement buses, and R3 trains run from La Garriga to Puigcerdà; the journey takes longer than usual. TreNatura tickets stay valid throughout. Check the timetables at rodalies.gencat.cat before you go.",
    novTitle: "In November",
    nov: [
      "The resort's official calendar for November 2026 shows **weekdays closed** and weekends open. In previous years FGC has cut the rack railway to Núria back to weekends in November, with a short Ribes–Queralbs service on weekdays. If you want to go in November, go at a weekend and check first.",
    ],
    valleyTitle: "What's in the valley",
    valley: [
      "The valley lies inside the Capçaleres del Ter i del Freser Natural Park, ringed by peaks of more than 2,900 metres. At its head are the **sanctuary of Our Lady of Núria**, the lake and the hotel.",
      "The **Coma del Clot cable car** climbs to Pic de l'Àliga, at over 2,100 metres, one of the best viewpoints over the valley, and since June 2026 there is a new **lake viewpoint** (Mirador del Llac). In summer there are boats on the lake, a play park and short walks around the sanctuary; in winter, the ski area.",
    ],
    walkTitle: "On foot: the old path from Queralbs",
    walk: [
      "The old pilgrims' path (Camí Vell) leaves Plaça del Raig in Queralbs and climbs the Freser gorges, past waterfalls such as the Sastre and the Cua de Cavall, until the lake comes into view. The Natural Park gives it as **7.7 km with 932 metres of ascent**, about **3 hours 45 minutes**, and rates it demanding.",
      "That is walking up and riding the rack railway back down to Queralbs. The park recommends it in spring, summer and autumn.",
    ],
    legendTitle: "Our Lady of Núria",
    legend: [
      "According to the tradition FGC tells, around the year 700 Saint Giles carved the image of the Virgin and hid it with a **cross, a bell and a cooking pot**. Centuries later shepherds following a red-haired bull found it, and the basilica stands where that is said to have happened. Our Lady of Núria's feast day is **8 September**.",
    ],
    faq: [
      { question: "How much is the Núria rack railway?", answer: "Return from Ribes: €34 adults, €22 children aged 4 to 13, €29 for 65 and over; from Queralbs: €31, €20 and €25. Fares valid until 30 November 2026, according to FGC." },
      { question: "Can you drive to Núria?", answer: "No. You can drive to Ribes de Freser or Queralbs, which have free parking, and go up from there by rack railway or on foot." },
      { question: "What does the TreNatura ticket include?", answer: "The return Rodalies train from any station to Ribes de Freser and the rack railway to Núria. It costs €40.20 for adults and €30.70 for children." },
      { question: "Does the Núria rack railway run in November?", answer: "The resort's calendar for November 2026 shows weekdays closed and weekends open. Check with FGC before you go." },
    ],
  },
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
    ...h2(t.getTitle),
    list(...t.get),
    callout("warning", t.r3Title, t.r3),
    ...h2(t.novTitle, ...t.nov),
    ...h2(t.valleyTitle, ...t.valley),
    ...h2(t.walkTitle, ...t.walk),
    ...h2(t.legendTitle, ...t.legend),
    faq(t.faq),
    ...b2Related(["ripolles", "ski", "snow", "cerdanya"], locale),
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
