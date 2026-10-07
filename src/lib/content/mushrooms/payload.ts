import type { Locale } from "@/lib/i18n/config";

/**
 * Weekly mycological report: conditions for mushroom fruiting in Catalonia.
 *
 * Written by the editorial team. Two rules run through the whole text and are
 * worth stating once here, because they are what separates this page from the
 * "10 best spots" articles it competes with:
 *
 *  1. **Favourable conditions are not mushrooms.** Every rating compares
 *     rainfall, temperature and forest context. None of it is an observation of
 *     mushrooms, and the page says so wherever a reader might assume otherwise.
 *  2. **No exact locations.** Ratings are by comarca or broad sector. Publishing
 *     coordinates of productive woodland would concentrate pressure on it, and
 *     much Catalan forest is privately owned, mushrooms included.
 *
 * Figures are Meteocat station readings for 2026-09-01..2026-10-06, verified
 * on 2026-10-07 with `scripts/mushroom-data.py`. A station
 * reading describes that station, not every hectare of its comarca.
 */

/** Condition levels. Deliberately qualitative: we have no probability to quote. */
export type Level = "very" | "favourable" | "interesting" | "patchy" | "low";

export const LEVEL_LABEL: Record<Level, Record<Locale, string>> = {
  very: { ca: "Molt favorables", es: "Muy favorables", en: "Very favourable" },
  favourable: { ca: "Favorables", es: "Favorables", en: "Favourable" },
  interesting: { ca: "Interessants", es: "Interesantes", en: "Interesting" },
  patchy: { ca: "Encara irregulars", es: "Todavía irregulares", en: "Still patchy" },
  low: { ca: "Poc favorables", es: "Poco favorables", en: "Less favourable" },
};

export interface Zone {
  id: string;
  level: Level;
  name: Record<Locale, string>;
  /** The headline figure, already formatted per language. */
  figure: Record<Locale, string>;
  /** One line of editorial reading. */
  reading: Record<Locale, string>;
  /** Section heading and prose for the body. */
  heading: Record<Locale, string>;
  body: Record<Locale, string[]>;
}

export const ZONES: Zone[] = [
  {
    id: "garrotxa",
    level: "very",
    name: { ca: "Garrotxa / Vall d'en Bas", es: "Garrotxa / Vall d'en Bas", en: "Garrotxa / Vall d'en Bas" },
    figure: {
      ca: "117,3 mm a la Vall d'en Bas de l'1 al 6 d'octubre",
      es: "117,3 mm en la Vall d'en Bas del 1 al 6 de octubre",
      en: "117.3 mm at Vall d'en Bas, 1–6 October",
    },
    reading: {
      ca: "Setembre humit i inici d'octubre molt plujós",
      es: "Septiembre húmedo e inicio de octubre muy lluvioso",
      en: "A wet September, then a very wet start to October",
    },
    heading: {
      ca: "1. Garrotxa i Vall d'en Bas: pluja sostinguda durant cinc setmanes",
      es: "1. Garrotxa y Vall d'en Bas: lluvia sostenida durante cinco semanas",
      en: "1. Garrotxa and Vall d'en Bas: five weeks of steady rain",
    },
    body: {
      ca: [
        "La Garrotxa és la zona que combina millor les dues coses que compten: un setembre humit i un inici d'octubre molt plujós. Meteocat registra a la Vall d'en Bas **74,8 mm al setembre i 117,3 mm de l'1 al 6 d'octubre**, 192,1 mm en total. Olot suma **80,2 mm al setembre i 67,7 mm a l'octubre**.",
        "Aquesta és la diferència amb zones que han rebut molta aigua de cop: aquí la humitat del sòl ve de setmanes enrere, no d'un sol episodi.",
        "Això no significa que tots els boscos de la Garrotxa tinguin bolets.",
      ],
      es: [
        "La Garrotxa es la zona que mejor combina lo que importa: un septiembre húmedo y un inicio de octubre muy lluvioso. Meteocat registra en la Vall d'en Bas **74,8 mm en septiembre y 117,3 mm del 1 al 6 de octubre**, 192,1 mm en total. Olot suma **80,2 mm en septiembre y 67,7 mm en octubre**.",
        "Esa es la diferencia con zonas que han recibido mucha agua de golpe: aquí la humedad del suelo viene de semanas atrás, no de un único episodio. Aun así, no garantiza que haya setas en un bosque concreto.",
      ],
      en: [
        "Garrotxa combines the two things that matter best: a wet September and a very wet start to October. Meteocat recorded **74.8 mm in September and 117.3 mm from 1 to 6 October** at Vall d'en Bas, 192.1 mm in all. Olot recorded **80.2 mm in September and 67.7 mm in October**.",
        "That is what sets it apart from areas that took a lot of rain at once: soil moisture here has been building for weeks, not from a single episode. It still does not guarantee mushrooms in any particular forest.",
      ],
    },
  },
  {
    id: "montseny",
    level: "very",
    name: { ca: "Montseny", es: "Montseny", en: "Montseny" },
    figure: {
      ca: "216,4 mm al Puig Sesolles · 195,3 mm a Viladrau (1–6 d'octubre)",
      es: "216,4 mm en el Puig Sesolles · 195,3 mm en Viladrau (1–6 de octubre)",
      en: "216.4 mm at Puig Sesolles · 195.3 mm at Viladrau (1–6 October)",
    },
    reading: {
      ca: "El gran canvi de la setmana",
      es: "El gran cambio de la semana",
      en: "The biggest change this week",
    },
    heading: {
      ca: "2. Montseny: de «encara és aviat» a la zona més regada",
      es: "2. Montseny: de «todavía es pronto» a la zona más regada",
      en: "2. Montseny: from “still early” to the wettest massif",
    },
    body: {
      ca: [
        "El Montseny és el canvi més gran des de l'últim informe. A mitjan setembre encara era aviat; en els sis primers dies d'octubre Meteocat registra **216,4 mm al Puig Sesolles** (1.666 m), **195,3 mm a Viladrau** i **128,5 mm a Tagamanent**.",
        "Les nits a cota alta també són fresques: la mínima mitjana de l'última setmana al Puig Sesolles ha estat de 9,8 °C.",
        "El punt feble és el setembre: entre 42 i 58 mm a les mateixes estacions, molt menys que a la Garrotxa o al Ripollès. Bona part de l'aigua ha caigut en molt pocs dies, i un aiguat no és el mateix que una pluja que s'infiltra a poc a poc. Per això el situem segon i no primer.",
        "Abans de sortir, consulta els avisos de Protecció Civil i de Meteocat: després de pluges tan intenses, l'estat de les pistes forestals pot haver canviat.",
      ],
      es: [
        "El Montseny es el cambio más grande desde el último informe. A mediados de septiembre todavía era pronto; en los seis primeros días de octubre Meteocat registra **216,4 mm en el Puig Sesolles** (1.666 m), **195,3 mm en Viladrau** y **128,5 mm en Tagamanent**.",
        "Las noches en cota alta también son frescas: la mínima media de la última semana en el Puig Sesolles ha sido de 9,8 °C.",
        "El punto débil es septiembre: entre 42 y 58 mm en esas mismas estaciones, mucho menos que en la Garrotxa o el Ripollès. Gran parte del agua ha caído en muy pocos días, y un aguacero no equivale a una lluvia que se infiltra poco a poco. Por eso lo situamos segundo y no primero.",
        "Antes de salir, consulta los avisos de Protecció Civil y de Meteocat: tras lluvias tan intensas, el estado de las pistas forestales puede haber cambiado.",
      ],
      en: [
        "Montseny is the biggest change since the last report. In mid-September it was still early; in the first six days of October Meteocat recorded **216.4 mm at Puig Sesolles** (1,666 m), **195.3 mm at Viladrau** and **128.5 mm at Tagamanent**.",
        "Nights at altitude are cool too: the mean minimum at Puig Sesolles over the past week was 9.8 °C.",
        "The weak point is September: between 42 and 58 mm at the same stations, far less than Garrotxa or the Ripollès. Much of the water fell in very few days, and a downpour is not the same as rain that soaks in slowly. That is why it ranks second, not first.",
        "Before you go, check the Protecció Civil and Meteocat warnings: after rain this intense, forest tracks may not be in the state you remember.",
      ],
    },
  },
  {
    id: "ripolles",
    level: "very",
    name: { ca: "Ripollès / Alt Ter", es: "Ripollès / Alt Ter", en: "Ripollès / upper Ter" },
    figure: {
      ca: "176,7 mm a Sant Joan de les Abadesses des de l'1 de setembre",
      es: "176,7 mm en Sant Joan de les Abadesses desde el 1 de septiembre",
      en: "176.7 mm at Sant Joan de les Abadesses since 1 September",
    },
    reading: {
      ca: "Constant, i amb les nits més fresques",
      es: "Constante, y con las noches más frescas",
      en: "Consistent, with the coolest nights",
    },
    heading: {
      ca: "3. Ripollès i Alt Ter: el sector més constant",
      es: "3. Ripollès y Alt Ter: el sector más constante",
      en: "3. Ripollès and the upper Ter valley: the most consistent",
    },
    body: {
      ca: [
        "El Ripollès, que encapçalava l'informe al setembre, manté un dels millors registres de pluja acumulada del nord del país. Sant Joan de les Abadesses tanca el setembre amb **114,7 mm** i hi suma **62,0 mm** a l'octubre; Sant Pau de Segúries acumula **150,2 mm** i Molló-Fabert **110,4 mm** des de l'1 de setembre.",
        "A favor seu hi té l'altitud: la mínima mitjana de l'última setmana ha estat de 10,2 °C a Molló-Fabert i de 12,6 °C a Sant Pau de Segúries.",
        "L'octubre hi ha estat menys extrem que al Montseny o a la Garrotxa. Per això baixa del primer lloc, no perquè les condicions hi hagin empitjorat.",
      ],
      es: [
        "El Ripollès, que encabezaba el informe en septiembre, mantiene uno de los mejores registros de lluvia acumulada del norte. Sant Joan de les Abadesses cierra septiembre con **114,7 mm** y suma **62,0 mm** más en octubre; Sant Pau de Segúries acumula **150,2 mm** y Molló-Fabert **110,4 mm** desde el 1 de septiembre.",
        "A su favor juega la altitud: la mínima media de la última semana ha sido de 10,2 °C en Molló-Fabert y de 12,6 °C en Sant Pau de Segúries.",
        "Octubre ha sido aquí menos extremo que en el Montseny o la Garrotxa. Por eso baja del primer puesto, no porque las condiciones hayan empeorado.",
      ],
      en: [
        "The Ripollès, top of the report in September, still has one of the best accumulated-rainfall records in the north. Sant Joan de les Abadesses closed September on **114.7 mm** and has added **62.0 mm** in October; Sant Pau de Segúries has **150.2 mm** and Molló-Fabert **110.4 mm** since 1 September.",
        "Elevation works in its favour: the mean minimum over the past week was 10.2 °C at Molló-Fabert and 12.6 °C at Sant Pau de Segúries.",
        "October has been less extreme here than in Montseny or Garrotxa. That is why it drops from first place, not because conditions have got worse.",
      ],
    },
  },
  {
    id: "osona",
    level: "favourable",
    name: { ca: "Osona / Collsacabra", es: "Osona / Collsacabra", en: "Osona / Collsacabra" },
    figure: {
      ca: "186,7 mm a Vic · 161,5 mm a Muntanyola des de l'1 de setembre",
      es: "186,7 mm en Vic · 161,5 mm en Muntanyola desde el 1 de septiembre",
      en: "186.7 mm at Vic · 161.5 mm at Muntanyola since 1 September",
    },
    reading: {
      ca: "Millora clara respecte del setembre",
      es: "Mejora clara respecto a septiembre",
      en: "Clearly better than in September",
    },
    heading: {
      ca: "4. Osona i Collsacabra: ara sí, entre les zones favorables",
      es: "4. Osona y Collsacabra: ahora sí, entre las zonas favorables",
      en: "4. Osona and Collsacabra: now among the favourable areas",
    },
    body: {
      ca: [
        "Osona puja un graó. Vic acumula **105,5 mm al setembre i 81,2 mm a l'octubre**, i Muntanyola **161,5 mm** en total. Al Collsacabra, Cantonigròs ha recollit **74,5 mm** en els sis primers dies d'octubre.",
        "Continua sent una comarca desigual entre la plana i els boscos de més altitud, que són els que parteixen amb avantatge. Viladrau és a Osona, però es llegeix millor amb el Montseny.",
      ],
      es: [
        "Osona sube un escalón. Vic acumula **105,5 mm en septiembre y 81,2 mm en octubre**, y Muntanyola **161,5 mm** en total. En el Collsacabra, Cantonigròs ha recogido **74,5 mm** en los seis primeros días de octubre.",
        "Sigue siendo una comarca desigual entre la Plana de Vic y los bosques de más altitud, que son los que parten con ventaja. Viladrau está en Osona, pero se lee mejor junto al Montseny.",
      ],
      en: [
        "Osona moves up a level. Vic has recorded **105.5 mm in September and 81.2 mm in October**, and Muntanyola **161.5 mm** in all. In the Collsacabra, Cantonigròs collected **74.5 mm** in the first six days of October.",
        "It is still uneven between the Vic plain and the higher forests, which start with the advantage. Viladrau is in Osona but is better read alongside Montseny.",
      ],
    },
  },
  {
    id: "bergueda",
    level: "favourable",
    name: { ca: "Nord del Berguedà", es: "Norte del Berguedà", en: "Northern Berguedà" },
    figure: {
      ca: "158,8 mm a la Quar · 132,9 mm a Castellar de n'Hug des de l'1 de setembre",
      es: "158,8 mm en La Quar · 132,9 mm en Castellar de n'Hug desde el 1 de septiembre",
      en: "158.8 mm at La Quar · 132.9 mm at Castellar de n'Hug since 1 September",
    },
    reading: {
      ca: "Bon setembre, octubre més moderat",
      es: "Buen septiembre, octubre más moderado",
      en: "A good September, a more moderate October",
    },
    heading: {
      ca: "5. Nord del Berguedà: bona base, menys pluja recent",
      es: "5. Norte del Berguedà: buena base, menos lluvia reciente",
      en: "5. Northern Berguedà: a good base, less recent rain",
    },
    body: {
      ca: [
        "La Quar tanca el setembre amb **108,8 mm** i Castellar de n'Hug amb **81,0 mm**, dos dels millors registres del Prepirineu. A l'octubre hi han caigut uns **50 mm**, menys que més a l'est.",
        "Té una bona base d'humitat i nits fresques (11,5 °C de mínima mitjana a Castellar de n'Hug l'última setmana), però la pluja recent no ha estat tan abundant com a la Garrotxa o al Montseny.",
      ],
      es: [
        "La Quar cierra septiembre con **108,8 mm** y Castellar de n'Hug con **81,0 mm**, dos de los mejores registros del Prepirineo. En octubre han caído unos **50 mm**, menos que más al este.",
        "Tiene una buena base de humedad y noches frescas (11,5 °C de mínima media en Castellar de n'Hug la última semana), pero la lluvia reciente no ha sido tan abundante como en la Garrotxa o el Montseny.",
      ],
      en: [
        "La Quar closed September on **108.8 mm** and Castellar de n'Hug on **81.0 mm**, two of the best readings in the pre-Pyrenees. October has added about **50 mm**, less than further east.",
        "The ground has a good moisture base and nights are cool (an 11.5 °C mean minimum at Castellar de n'Hug over the past week), but recent rain has been lighter than in Garrotxa or Montseny.",
      ],
    },
  },
  {
    id: "pirineu",
    level: "patchy",
    name: {
      ca: "Cerdanya / Alt Urgell / Pallars / Aran",
      es: "Cerdanya / Alt Urgell / Pallars / Aran",
      en: "Cerdanya / Alt Urgell / Pallars / Aran",
    },
    figure: {
      ca: "30,7 mm a Puigcerdà · 23,4 mm a Sort des de l'1 de setembre",
      es: "30,7 mm en Puigcerdà · 23,4 mm en Sort desde el 1 de septiembre",
      en: "30.7 mm at Puigcerdà · 23.4 mm at Sort since 1 September",
    },
    reading: {
      ca: "Les pluges d'octubre gairebé no hi han arribat",
      es: "Las lluvias de octubre apenas han llegado",
      en: "October's rain has barely reached it",
    },
    heading: {
      ca: "6. Pirineu central i occidental: encara sec",
      es: "6. Pirineo central y occidental: todavía seco",
      en: "6. Central and western Pyrenees: still dry",
    },
    body: {
      ca: [
        "El contrast amb el Pirineu oriental és gran. Des de l'1 de setembre, Puigcerdà suma **30,7 mm**, Sort **23,4 mm** i Vielha **35,5 mm**. Els episodis d'octubre han descarregat sobretot a l'est i al litoral.",
        "Hi ha excepcions locals, com Alinyà, a l'Alt Urgell, amb **82,8 mm**, però a escala de comarca les dades no permeten parlar de bones condicions. A més, aquí la temporada és curta: les primeres glaçades acostumen a arribar entre finals d'octubre i principis de novembre.",
      ],
      es: [
        "El contraste con el Pirineo oriental es grande. Desde el 1 de septiembre, Puigcerdà suma **30,7 mm**, Sort **23,4 mm** y Vielha **35,5 mm**. Los episodios de octubre han descargado sobre todo en el este y en el litoral.",
        "Hay excepciones locales, como Alinyà, en el Alt Urgell, con **82,8 mm**, pero a escala comarcal los datos no permiten hablar de buenas condiciones. Además, aquí la temporada es corta: las primeras heladas suelen llegar entre finales de octubre y principios de noviembre.",
      ],
      en: [
        "The contrast with the eastern Pyrenees is stark. Since 1 September, Puigcerdà has recorded **30.7 mm**, Sort **23.4 mm** and Vielha **35.5 mm**. October's rain fell mostly in the east and along the coast.",
        "There are local exceptions, such as Alinyà in the Alt Urgell with **82.8 mm**, but at county level the data does not support calling conditions good. The season here is also short: the first frosts usually arrive between late October and early November.",
      ],
    },
  },
  {
    id: "ports",
    level: "interesting",
    name: { ca: "Els Ports / Terres de l'Ebre", es: "Els Ports / Terres de l'Ebre", en: "Els Ports / Ebro lands" },
    figure: {
      ca: "130,2 mm al Parc Natural dels Ports (1–6 d'octubre)",
      es: "130,2 mm en el Parc Natural dels Ports (1–6 de octubre)",
      en: "130.2 mm in Els Ports Natural Park (1–6 October)",
    },
    reading: {
      ca: "Molta pluja de cop després d'un setembre sec",
      es: "Mucha lluvia de golpe tras un septiembre seco",
      en: "A lot of rain at once after a dry September",
    },
    heading: {
      ca: "7. Els Ports: a seguir de prop",
      es: "7. Els Ports: a seguir de cerca",
      en: "7. Els Ports: one to watch",
    },
    body: {
      ca: [
        "Les Terres de l'Ebre han rebut alguns dels registres més alts de Catalunya a l'octubre, i el massís dels Ports també: l'estació del Parc Natural (1.056 m) suma **130,2 mm** de l'1 al 6 d'octubre, després d'un setembre de només **22,5 mm**.",
        "És un canvi important, però ha arribat sobre un sòl molt sec i en un sol episodi. Al sud la temporada sol anar més tard que al Pirineu, de manera que aquí té més sentit seguir l'evolució de les properes setmanes que no pas anar-hi ara mateix.",
      ],
      es: [
        "Las Terres de l'Ebre han recibido algunos de los registros más altos de Cataluña en octubre, y el macizo de Els Ports también: la estación del Parque Natural (1.056 m) suma **130,2 mm** del 1 al 6 de octubre, tras un septiembre de solo **22,5 mm**.",
        "Es un cambio importante, pero ha llegado sobre un suelo muy seco y en un único episodio. En el sur la temporada suele ir más tarde que en el Pirineo, así que aquí tiene más sentido seguir la evolución de las próximas semanas que ir ahora mismo.",
      ],
      en: [
        "The Ebro lands have had some of Catalonia's highest October totals, and the Ports massif too: the Natural Park station (1,056 m) recorded **130.2 mm** from 1 to 6 October, after a September of only **22.5 mm**.",
        "That is a real change, but it fell on very dry ground in a single episode. In the south the season usually runs later than in the Pyrenees, so this is an area to follow over the coming weeks rather than one to head for right now.",
      ],
    },
  },
  {
    id: "ponent",
    level: "low",
    name: { ca: "Ponent", es: "Poniente", en: "Western Catalonia" },
    figure: {
      ca: "6,6 mm a les Borges Blanques des de l'1 de setembre",
      es: "6,6 mm en les Borges Blanques desde el 1 de septiembre",
      en: "6.6 mm at les Borges Blanques since 1 September",
    },
    reading: {
      ca: "Gairebé sense pluja",
      es: "Prácticamente sin lluvia",
      en: "Almost no rain",
    },
    heading: {
      ca: "8. Ponent: la pluja encara no ha arribat",
      es: "8. Poniente: la lluvia todavía no ha llegado",
      en: "8. Western Catalonia: the rain has not arrived",
    },
    body: {
      ca: [
        "Mentre l'est acumula centenars de litres, a Ponent gairebé no ha plogut: **6,6 mm** a les Borges Blanques, **10,6 mm** a Anglesola i **15,6 mm** a la Granadella des de l'1 de setembre.",
        "Amb aquestes xifres no hi ha base per situar-lo entre les zones a considerar aquesta setmana.",
      ],
      es: [
        "Mientras el este acumula cientos de litros, en Poniente apenas ha llovido: **6,6 mm** en les Borges Blanques, **10,6 mm** en Anglesola y **15,6 mm** en la Granadella desde el 1 de septiembre.",
        "Con estas cifras no hay base para situarlo entre las zonas a considerar esta semana.",
      ],
      en: [
        "While the east has had hundreds of litres, western Catalonia has barely seen rain: **6.6 mm** at les Borges Blanques, **10.6 mm** at Anglesola and **15.6 mm** at la Granadella since 1 September.",
        "On those figures there is no basis for putting it among the areas to consider this week.",
      ],
    },
  },
];

export const SOURCES = [
  {
    name: { ca: "Dades meteorològiques de Meteocat", es: "Datos meteorológicos de Meteocat", en: "Meteocat weather-station data" },
    url: "https://m.meteo.cat/resum-dades",
    publisher: "Servei Meteorològic de Catalunya",
  },
  {
    name: { ca: "Dades meteorològiques diàries de la XEMA", es: "Datos meteorológicos diarios de la XEMA", en: "Daily XEMA weather-station readings" },
    url: "https://analisi.transparenciacatalunya.cat/Medi-Ambient/Dades-meteorol-giques-di-ries-de-la-XEMA/7bvh-jvq2",
    publisher: "Servei Meteorològic de Catalunya",
  },
  {
    name: { ca: "Butlletí climàtic estacional — estiu 2026", es: "Boletín climático estacional — verano 2026", en: "Seasonal climate bulletin — summer 2026" },
    url: "https://www.meteo.cat/wpweb/climatologia/butlletins-i-episodis-meteorologics/butlleti-estacional/",
    publisher: "Servei Meteorològic de Catalunya",
  },
  {
    name: { ca: "Butlletí climàtic mensual", es: "Boletín climático mensual", en: "Monthly climate bulletin" },
    url: "https://www.meteo.cat/wpweb/climatologia/butlletins-i-episodis-meteorologics/butlleti-mensual/",
    publisher: "Servei Meteorològic de Catalunya",
  },
  {
    name: { ca: "Manual d'itineraris de gestió micològica a Catalunya", es: "Manual de itinerarios de gestión micológica en Cataluña", en: "Handbook of mycological management itineraries in Catalonia" },
    url: "https://ctfc.cat/docs/Manual_itineraris_de_gestio_micologica_a_Catalunya.pdf",
    publisher: "Centre de Ciència i Tecnologia Forestal de Catalunya",
  },
  {
    name: { ca: "Intoxicacions per bolets", es: "Intoxicaciones por setas", en: "Mushroom poisoning" },
    url: "https://canalsalut.gencat.cat/ca/detalls/article/Intoxicacions_per_bolets",
    publisher: "Canal Salut — Generalitat de Catalunya",
  },
  {
    name: { ca: "Regulació d'activitats al Parc Natural del Cadí-Moixeró", es: "Regulación de actividades en el Parc Natural del Cadí-Moixeró", en: "Activity rules, Cadí-Moixeró Natural Park" },
    url: "https://parcsnaturals.gencat.cat/ca/xarxa-de-parcs/cadi/gaudeix-del-parc/consells/regulacio-dactivitats/",
    publisher: "Parcs Naturals de Catalunya",
  },
  {
    name: { ca: "Preguntes freqüents — Aigüestortes i Estany de Sant Maurici", es: "Preguntas frecuentes — Aigüestortes i Estany de Sant Maurici", en: "FAQ — Aigüestortes i Estany de Sant Maurici National Park" },
    url: "https://parcsnaturals.gencat.cat/ca/xarxa-de-parcs/aiguestortes/preguntes-frequents/",
    publisher: "Parcs Naturals de Catalunya",
  },
  {
    name: { ca: "La temporada de bolets comença amb retard", es: "La temporada de setas empieza con retraso", en: "Mushroom season starts late (ACN report)" },
    url: "https://www.vilaweb.cat/noticies/la-temporada-de-bolets-comenca-amb-retard-per-la-calor-i-la-manca-de-pluja/",
    publisher: "VilaWeb / ACN",
    type: "press" as const,
  },
  {
    name: { ca: "Temporada de bolets — Generalitat", es: "Temporada de setas — Generalitat", en: "Mushroom season — Government of Catalonia" },
    url: "https://tramits.gencat.cat/en/actualitat/reportatges/temporada-de-bolets/index.html",
    publisher: "Generalitat de Catalunya",
  },
];

export interface Copy {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  intro: string[];
  directAnswerTitle: string;
  directAnswer: string;
  keyFactsTitle: string;
  keyFacts: { label: string; value: string }[];
  tableCaption: string;
  tableHeaders: string[];
  ratingDisclaimerTitle: string;
  ratingDisclaimer: string;
  lateHeading: string;
  late: string[];
  whyHeading: string;
  why: string[];
  whyList: string[];
  noSpotsHeading: string;
  noSpots: string[];
  safetyHeading: string;
  safety: string[];
  safetyCalloutTitle: string;
  safetyCallout: string;
  summaryHeading: string;
  summary: string[];
}

export const COPY: Record<Locale, Copy> = {
  ca: {
    path: "natura/bolets-catalunya-condicions",
    title: "Temporada de bolets 2026: on hi ha millors condicions aquesta setmana?",
    seoTitle: "Bolets a Catalunya 2026: les millors zones aquesta setmana",
    seoDescription:
      "Analitzem pluja, temperatura i humitat per saber quines zones de Catalunya tenen millors condicions per als bolets aquesta setmana.",
    excerpt:
      "Analitzem pluja, temperatura i context forestal per saber quines zones de Catalunya tenen ara mateix les millors condicions per als bolets. Dades de Meteocat verificades el 7 d'octubre de 2026.",
    intro: [
      "L'inici d'octubre ha canviat el mapa. Després d'un estiu molt càlid i sec, les pluges dels primers dies del mes han deixat més de 100 mm en bona part del nord-est de Catalunya, i més de 200 mm en alguns punts del Montseny.",
      "Les dades meteorològiques situen ara mateix la **Garrotxa, el Montseny i el Ripollès** al capdavant. En canvi, el Pirineu central i occidental i Ponent han quedat gairebé al marge de la pluja.",
      "Aquesta guia no és un mapa de bolets trobats. Analitza **condicions favorables per a la fructificació** a partir de precipitació, temperatura i context forestal. No hi ha cap garantia que un bosc concret tingui bolets.",
    ],
    directAnswerTitle: "En resum",
    directAnswer:
      "Les millors condicions relatives per als bolets aquesta setmana es concentren a la Garrotxa, el Montseny i el Ripollès. La Vall d'en Bas ha recollit 117,3 mm de l'1 al 6 d'octubre després d'un setembre humit, el Puig Sesolles (Montseny) 216,4 mm i Sant Joan de les Abadesses acumula 176,7 mm des de l'1 de setembre. El Pirineu central i occidental i Ponent continuen secs. Bones condicions no garanteixen que hi hagi bolets.",
    keyFactsTitle: "Dades clau",
    keyFacts: [
      { label: "Situació", value: "Gran canvi per les pluges d'inici d'octubre" },
      { label: "Millors condicions", value: "Garrotxa, Montseny i Ripollès" },
      { label: "Segon grup", value: "Osona i nord del Berguedà" },
      { label: "Precipitació destacada", value: "Puig Sesolles (Montseny) — 216,4 mm de l'1 al 6 d'octubre" },
      { label: "Període analitzat", value: "1 de setembre – 6 d'octubre de 2026" },
      { label: "Última verificació", value: "7 d'octubre de 2026" },
    ],
    tableCaption: "Condicions generals per als bolets aquesta setmana",
    tableHeaders: ["Zona", "Condicions", "Dada destacada", "Lectura"],
    ratingDisclaimerTitle: "Com llegir aquesta valoració",
    ratingDisclaimer:
      "Aquesta valoració compara condicions meteorològiques i forestals generals. No representa observacions de bolets ni garanteix que n'hi hagi.",
    lateHeading: "D'un estiu rècord de calor a un octubre molt plujós",
    late: [
      "Abans d'interpretar les pluges d'octubre cal tenir en compte com venim de l'estiu.",
      "El Servei Meteorològic de Catalunya ha qualificat l'estiu de 2026 com **el més càlid registrat a Catalunya**, per davant dels estius de 2003 i 2022. Ha estat sec a la major part del territori i molt sec en àmplies zones de Ponent i del terç sud.",
      "A més, més del 80% del país ha registrat anomalies tèrmiques estivals iguals o superiors als +3 °C. Aquest context ha deixat molts boscos amb dèficit hídric.",
      "El 12 de setembre, Juan Martínez de Aragón, investigador del Centre de Ciència i Tecnologia Forestal de Catalunya, explicava que l'abundància de bolets continuava sent baixa a bona part del país i que el bosc necessitava recuperar-se després de la calor i la manca d'aigua.",
      "Les pluges de finals de setembre i, sobretot, dels primers dies d'octubre han canviat la situació a l'est del país. Però una bona acumulació de pluja no significa necessàriament una boletada immediata, i on l'aigua ha caigut de cop, una part pot haver escolat en lloc d'infiltrar-se.",
    ],
    whyHeading: "Per què no n'hi ha prou que plogui?",
    why: [
      "Una tempesta no fa aparèixer automàticament bolets l'endemà. La fructificació depèn d'una combinació complexa de factors:",
    ],
    whyList: [
      "disponibilitat d'aigua al sòl",
      "temperatura",
      "humitat",
      "vent",
      "tipus de bosc",
      "espècie",
      "altitud",
      "distribució temporal de les pluges",
    ],
    noSpotsHeading: "Aquest mapa no revela boscos secrets",
    noSpots: [
      "CatalunyaInfo treballa a escala de comarca o gran sector geogràfic. No publicarem coordenades exactes de boscos productius.",
      "A més de protegir espais sensibles davant la massificació, cal recordar que molts boscos són de propietat privada. Els propietaris també ho són dels recursos forestals, inclosos els bolets. Quan una finca prohibeix la recol·lecció mitjançant senyalització, cal respectar-la.",
      "També hi ha espais protegits amb normes específiques. Al Parc Nacional d'Aigüestortes i Estany de Sant Maurici, per exemple, la recol·lecció de bolets no està permesa dins del Parc Nacional i només es contempla en determinades zones perifèriques de protecció.",
    ],
    safetyHeading: "Si no el pots identificar amb certesa, no te'l mengis",
    safety: [
      "Aquest és el consell més important de tota la guia.",
      "Canal Salut indica que cal consumir únicament bolets d'espècies que es puguin identificar amb absoluta certesa.",
      "No existeixen regles casolanes fiables per saber si un bolet és tòxic. Ni l'all, ni la plata, ni els cargols, ni el color permeten determinar-ne la toxicitat.",
      "Algunes intoxicacions poden ser molt greus i els primers símptomes poden aparèixer moltes hores després. Si apareixen símptomes després de consumir bolets, cal buscar assistència sanitària immediatament.",
    ],
    safetyCalloutTitle: "Davant del dubte",
    safetyCallout:
      "No te'l mengis. Consulta sempre les recomanacions oficials de [Canal Salut](https://canalsalut.gencat.cat/ca/detalls/article/Intoxicacions_per_bolets).",
    summaryHeading: "En resum: on hi ha millors condicions aquesta setmana?",
    summary: [
      "Si ordenem Catalunya segons les condicions meteorològiques observades actualment: **1. Garrotxa / Vall d'en Bas**, **2. Montseny**, **3. Ripollès / Alt Ter**.",
      "Osona i el nord del Berguedà formen un segon grup favorable. Els Ports han rebut molta pluja de cop i cal seguir-los de prop. El Pirineu central i occidental i Ponent continuen secs.",
      "CatalunyaInfo actualitza aquesta guia cada setmana durant la temporada amb les dades de les estacions de Meteocat.",
      "I si la sortida al bosc és tant per caminar com per buscar, mira també quan arriben els [colors de tardor a cada zona de Catalunya](/ca/natura/colors-tardor-catalunya/).",
    ],
  },
  es: {
    path: "naturaleza/setas-cataluna-condiciones",
    title: "Temporada de setas 2026 en Cataluña: dónde están las mejores condiciones esta semana",
    seoTitle: "Setas en Cataluña 2026: mejores zonas esta semana",
    seoDescription:
      "Analizamos lluvia, temperatura y humedad para localizar las zonas de Cataluña con mejores condiciones para las setas esta semana.",
    excerpt:
      "Analizamos lluvia, temperatura y contexto forestal para saber qué zonas de Cataluña tienen ahora mismo las mejores condiciones para las setas. Datos de Meteocat verificados el 7 de octubre de 2026.",
    intro: [
      "El inicio de octubre ha cambiado el mapa. Tras un verano muy cálido y seco, las lluvias de los primeros días del mes han dejado más de 100 mm en buena parte del nordeste de Cataluña, y más de 200 mm en algunos puntos del Montseny.",
      "Los datos actuales sitúan a la **Garrotxa, el Montseny y el Ripollès** a la cabeza. En cambio, el Pirineo central y occidental y Poniente han quedado casi al margen de la lluvia.",
      "Esta guía no es un mapa de setas encontradas. Analiza **condiciones meteorológicas favorables para la fructificación**. No existe ninguna garantía de que haya setas en un bosque concreto.",
    ],
    directAnswerTitle: "En resumen",
    directAnswer:
      "Las mejores condiciones relativas para las setas esta semana se concentran en la Garrotxa, el Montseny y el Ripollès. La Vall d'en Bas ha recogido 117,3 mm del 1 al 6 de octubre tras un septiembre húmedo, el Puig Sesolles (Montseny) 216,4 mm y Sant Joan de les Abadesses acumula 176,7 mm desde el 1 de septiembre. El Pirineo central y occidental y Poniente siguen secos. Buenas condiciones no garantizan que haya setas.",
    keyFactsTitle: "Datos clave",
    keyFacts: [
      { label: "Situación", value: "Gran cambio por las lluvias de inicio de octubre" },
      { label: "Mejores condiciones", value: "Garrotxa, Montseny y Ripollès" },
      { label: "Segundo grupo", value: "Osona y norte del Berguedà" },
      { label: "Precipitación destacada", value: "Puig Sesolles (Montseny) — 216,4 mm del 1 al 6 de octubre" },
      { label: "Periodo analizado", value: "1 de septiembre – 6 de octubre de 2026" },
      { label: "Última verificación", value: "7 de octubre de 2026" },
    ],
    tableCaption: "Condiciones generales para las setas esta semana",
    tableHeaders: ["Zona", "Condiciones", "Dato destacado", "Lectura"],
    ratingDisclaimerTitle: "Cómo leer esta valoración",
    ratingDisclaimer:
      "Esta valoración compara condiciones meteorológicas y forestales generales. No representa observaciones de setas ni garantiza su presencia.",
    lateHeading: "De un verano récord de calor a un octubre muy lluvioso",
    late: [
      "El contexto del verano es fundamental.",
      "Meteocat ha confirmado que el verano de 2026 ha sido **el más cálido registrado en Cataluña**, por delante de 2003 y 2022. Ha sido seco en la mayor parte del territorio y especialmente seco en amplias zonas del oeste y del sur.",
      "Además, más del 80% de Cataluña registró anomalías térmicas estivales iguales o superiores a +3 °C. Los bosques llegan, por tanto, a septiembre después de un periodo de fuerte estrés térmico.",
      "El 12 de septiembre, Juan Martínez de Aragón, investigador del Centre de Ciència i Tecnologia Forestal de Catalunya, explicaba que la presencia de setas todavía era muy baja en muchos puntos y que el bosque necesitaba recuperarse.",
      "Las lluvias de finales de septiembre y, sobre todo, de los primeros días de octubre han cambiado la situación en el este. Pero no provocan una fructificación inmediata, y donde el agua ha caído de golpe, una parte puede haber escurrido en lugar de infiltrarse.",
    ],
    whyHeading: "¿Por qué no basta con que llueva?",
    why: [
      "Las setas no aparecen automáticamente después de una tormenta. La fructificación depende de la combinación de varios factores:",
    ],
    whyList: [
      "agua disponible en el suelo",
      "temperaturas",
      "humedad",
      "viento",
      "altitud",
      "tipo de bosque",
      "especie",
      "distribución temporal de las lluvias",
    ],
    noSpotsHeading: "No publicaremos coordenadas de bosques productivos",
    noSpots: [
      "CatalunyaInfo trabaja a escala de comarca o gran zona. No se publican localizaciones exactas de puntos de recogida.",
      "Además, muchos bosques catalanes son privados. La normativa recuerda que el propietario del bosque también es propietario de sus recursos, incluidas las setas, y hay que respetar siempre la señalización.",
      "Los espacios naturales protegidos pueden tener restricciones específicas. En el Parque Nacional de Aigüestortes i Estany de Sant Maurici, por ejemplo, la recolección no está permitida dentro del Parque Nacional y solo se contempla en determinadas zonas periféricas de protección.",
    ],
    safetyHeading: "Si no estás completamente seguro, no te la comas",
    safety: [
      "Canal Salut es muy claro: solo deben consumirse setas cuya especie pueda identificarse con absoluta certeza.",
      "No existen trucos caseros fiables para determinar si una seta es tóxica. Ni el ajo, ni la plata, ni los caracoles, ni el color permiten determinar la toxicidad.",
      "Algunas intoxicaciones pueden ser muy graves y los primeros síntomas pueden aparecer muchas horas después. Si aparecen síntomas tras consumir setas, hay que buscar asistencia sanitaria de inmediato.",
    ],
    safetyCalloutTitle: "Ante la duda",
    safetyCallout:
      "Descártala. Consulta siempre las recomendaciones oficiales de [Canal Salut](https://canalsalut.gencat.cat/ca/detalls/article/Intoxicacions_per_bolets).",
    summaryHeading: "Las mejores condiciones esta semana",
    summary: [
      "El ranking actual de CatalunyaInfo es: **1. Garrotxa / Vall d'en Bas**, **2. Montseny**, **3. Ripollès / Alt Ter**.",
      "Osona y el norte del Berguedà forman un segundo grupo favorable. Els Ports han recibido mucha lluvia de golpe y conviene seguirlos de cerca. El Pirineo central y occidental y Poniente siguen secos.",
      "CatalunyaInfo actualiza esta guía cada semana durante la temporada con los datos de las estaciones de Meteocat.",
      "Y si la salida al bosque es tanto para caminar como para buscar, consulta también cuándo llegan los [colores de otoño a cada zona de Cataluña](/es/naturaleza/colores-otono-cataluna/).",
    ],
  },
  en: {
    path: "nature/mushroom-season-catalonia",
    title: "Mushroom season in Catalonia 2026: where conditions are best right now",
    seoTitle: "Mushroom season in Catalonia: best conditions right now",
    seoDescription:
      "Rainfall, temperatures and forest conditions show which parts of Catalonia currently have the best conditions for mushroom season.",
    excerpt:
      "Rainfall, temperature and forest conditions across Catalonia, and what they mean for the 2026 mushroom season. Meteocat data verified on 7 October 2026.",
    intro: [
      "The start of October has redrawn the map. After a very hot, dry summer, rain in the first days of the month left more than 100 mm across much of north-eastern Catalonia, and more than 200 mm in parts of Montseny.",
      "Current weather data puts **Garrotxa, Montseny and the Ripollès** at the top. The central and western Pyrenees and western Catalonia, by contrast, have been almost entirely missed by the rain.",
      "This is not a map showing confirmed mushroom finds. It is an analysis of **conditions that may support mushroom fruiting**. Finding mushrooms is never guaranteed.",
    ],
    directAnswerTitle: "In short",
    directAnswer:
      "The best relative conditions for mushrooms in Catalonia this week are in Garrotxa, Montseny and the Ripollès. Vall d'en Bas collected 117.3 mm from 1 to 6 October after a wet September, Puig Sesolles (Montseny) 216.4 mm, and Sant Joan de les Abadesses has 176.7 mm since 1 September. The central and western Pyrenees and western Catalonia remain dry. Good conditions do not guarantee mushrooms.",
    keyFactsTitle: "Key facts",
    keyFacts: [
      { label: "Season status", value: "Transformed by early-October rain" },
      { label: "Best conditions", value: "Garrotxa, Montseny and the Ripollès" },
      { label: "Next best areas", value: "Osona and northern Berguedà" },
      { label: "Notable rainfall", value: "Puig Sesolles (Montseny) — 216.4 mm, 1–6 October" },
      { label: "Period covered", value: "September 1 – October 6, 2026" },
      { label: "Last verified", value: "October 7, 2026" },
    ],
    tableCaption: "General conditions for mushrooms this week",
    tableHeaders: ["Area", "Conditions", "Key figure", "Reading"],
    ratingDisclaimerTitle: "How to read this rating",
    ratingDisclaimer:
      "This rating compares broad weather and forest conditions. It is not based on confirmed mushroom sightings and does not guarantee mushrooms will be present.",
    lateHeading: "From a record-hot summer to a very wet October",
    late: [
      "The summer of 2026 was the hottest ever recorded in Catalonia, according to the Catalan Meteorological Service, ahead of 2003 and 2022.",
      "Much of the territory was dry, with particularly severe rainfall deficits in parts of western and southern Catalonia. More than 80% of the region recorded summer temperature anomalies of at least +3 °C.",
      "Forests therefore entered September after a period of considerable heat and water stress.",
      "On 12 September, researcher Juan Martínez de Aragón from the Forest Science and Technology Centre of Catalonia said mushroom abundance remained very low in much of the country.",
      "Rain at the end of September and, above all, in the first days of October has changed the picture in the east. But fruiting does not follow immediately, and where the water fell all at once, some of it may have run off rather than soaking in.",
    ],
    whyHeading: "Why one rainy day is not enough",
    why: [
      "Mushrooms do not simply appear the morning after heavy rain. Fruiting depends on a combination of factors:",
    ],
    whyList: [
      "soil water availability",
      "temperature",
      "humidity",
      "wind",
      "elevation",
      "forest type",
      "mushroom species",
      "timing of rainfall",
    ],
    noSpotsHeading: "Why we do not publish exact mushroom locations",
    noSpots: [
      "This guide works at county and broad regional level. It does not provide coordinates for productive forest sites, which helps avoid unnecessary pressure on specific woodland areas.",
      "It is also important to remember that many Catalan forests are privately owned. Landowners retain rights over forest resources, including mushrooms, and signs restricting collection must be respected.",
      "Protected natural areas may also have specific rules. In the Aigüestortes i Estany de Sant Maurici National Park, for example, mushroom picking is not permitted inside the national park and is only considered in certain peripheral protection zones.",
    ],
    safetyHeading: "Never eat a mushroom you cannot identify with certainty",
    safety: [
      "Catalonia's official public-health advice is straightforward: only eat mushrooms belonging to species you can identify with complete certainty.",
      "There are no reliable household tricks for deciding whether a wild mushroom is poisonous. Garlic, silver, snails and colour tell you nothing about toxicity.",
      "Some mushroom poisonings can be extremely serious, and the first symptoms may appear many hours later. Anyone who develops symptoms after eating wild mushrooms should seek medical help immediately.",
    ],
    safetyCalloutTitle: "If you are unsure",
    safetyCallout:
      "Do not eat it. Always check the official guidance from [Canal Salut](https://canalsalut.gencat.cat/ca/detalls/article/Intoxicacions_per_bolets).",
    summaryHeading: "Where are conditions best this week?",
    summary: [
      "Based on the current weather picture, CatalunyaInfo's ranking is: **1. Garrotxa / Vall d'en Bas**, **2. Montseny**, **3. Ripollès / upper Ter**.",
      "Osona and northern Berguedà form a second favourable group. Els Ports took a lot of rain at once and is worth following closely. The central and western Pyrenees and western Catalonia remain dry.",
      "CatalunyaInfo updates this guide every week of the season with Meteocat station data.",
      "If the trip into the forest is as much about walking as about foraging, see also when [fall colors reach each part of Catalonia](/en/nature/fall-colors-catalonia/).",
    ],
  },
};

/** Alt text and caption for the lead image, per language. */
export const HERO = {
  key: "bolets-catalunya-2026-bosc-humit",
  alt: {
    ca: "Bolets en un bosc humit de muntanya durant la temporada de tardor a Catalunya",
    es: "Setas en un bosque húmedo de montaña durante la temporada de otoño en Cataluña",
    en: "Wild mushrooms in a damp mountain forest during autumn in Catalonia",
  },
  caption: {
    ca: "Bosc de muntanya a la tardor. Il·lustració generada amb intel·ligència artificial.",
    es: "Bosque de montaña en otoño. Ilustración generada con inteligencia artificial.",
    en: "Mountain forest in autumn. Illustration generated with artificial intelligence.",
  },
};
