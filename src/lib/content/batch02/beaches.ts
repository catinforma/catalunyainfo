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
 * Barcelona's beaches: which one, the season, the rules and the water.
 *
 * Every statement is from the City Council's beach pages, its press office,
 * the BOPB and Gaseta Municipal ordinance texts, the ACA, the ASPB or ADEAC,
 * checked on 12 Oct 2026 (research_notes/blog-batch-03/beaches.md).
 *
 * Left out on purpose: a metro station for each beach (only Llevant's is on
 * an official page; the rest go to the City's route planner), the smoking
 * fine in euros (only in the press), live water readings (they change daily)
 * and lifeguard or tower counts (2026 only). Season dates are given as 2026
 * figures with the year attached; the 2027 calendar is not out.
 */

const VERIFIED = "2026-10-12";

const SOURCES: B2Source[] = [
  { name: "Barcelona, platja a platja", url: "https://www.barcelona.cat/ca/que-pots-fer-a-bcn/banys-i-platges/barcelona-platja-platja", publisher: "Ajuntament de Barcelona" },
  { name: "Temporada de banys", url: "https://www.barcelona.cat/ca/que-pots-fer-a-bcn/banys-i-platges/temporada-de-banys", publisher: "Ajuntament de Barcelona" },
  { name: "Les platges de Barcelona inicien la temporada de bany (28/03/2026)", url: "https://ajuntament.barcelona.cat/premsa/2026/03/28/les-platges-de-barcelona-inicien-la-temporada-de-bany-amb-el-desplegament-de-serveis-per-la-setmana-santa/", publisher: "Ajuntament de Barcelona" },
  { name: "Platges sense fum", url: "https://www.barcelona.cat/ca/que-pots-fer-a-bcn/banys-i-platges/platges-sense-fum", publisher: "Ajuntament de Barcelona" },
  { name: "Fines for anti-social behaviour", url: "https://www.barcelona.cat/endrecembarcelona/en/what-are-we-doing/fines-anti-social-behaviour", publisher: "Ajuntament de Barcelona" },
  { name: "Àrea de gossos de la platja de Llevant", url: "https://www.barcelona.cat/ca/que-pots-fer-a-bcn/banys-i-platges/area-de-gossos-de-la-platja-de-llevant", publisher: "Ajuntament de Barcelona" },
  { name: "Accessibilitat a les platges", url: "https://www.barcelona.cat/ca/que-pots-fer-a-bcn/banys-i-platges/accessibilitat", publisher: "Ajuntament de Barcelona" },
  { name: "Qualitat de les aigües de bany", url: "https://aca.gencat.cat/ca/laigua/estat-del-medi-hidric/qualitat-de-les-aiguees-de-bany/", publisher: "Agència Catalana de l'Aigua" },
  { name: "Balanç de la qualitat de les aigües de bany 2025", url: "https://aca.gencat.cat/web/.content/10_ACA/J_Publicacions/07-estudis-informes/39-balanc-bany-2025.pdf", publisher: "Agència Catalana de l'Aigua" },
  { name: "Platges — salut ambiental", url: "https://www.aspb.cat/arees/salut-ambiental/platges/", publisher: "Agència de Salut Pública de Barcelona" },
  { name: "Relación de playas galardonadas con Bandera Azul 2026", url: "https://www.banderaazul.org/sites/default/files/2026/Rueda-de-prensa-2026/Relaci%C3%B3n%20Playas%20Galardonadas%202026.pdf", publisher: "ADEAC" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/platges-barcelona",
    title: "Platges de Barcelona: quina triar, temporada de bany i normes",
    seoTitle: "Platges de Barcelona: quina triar, normes i bandera blava",
    seoDescription:
      "Les deu zones de bany de Barcelona, quines tenen bandera blava, la platja nudista i la de gossos, quan hi ha socorristes i què et poden multar.",
    excerpt:
      "Les platges de Barcelona una per una, amb la temporada de bany, les banderes blaves, la qualitat de l'aigua i les normes, segons l'Ajuntament i l'ACA.",
  },
  es: {
    path: "guias/playas-barcelona",
    title: "Playas de Barcelona: cuál elegir, temporada de baño y normas",
    seoTitle: "Playas de Barcelona: cuál elegir, normas y bandera azul",
    seoDescription:
      "Las diez zonas de baño de Barcelona, cuáles tienen bandera azul, la playa nudista y la de perros, cuándo hay socorristas y qué te pueden multar.",
    excerpt:
      "Las playas de Barcelona una a una, con la temporada de baño, las banderas azules, la calidad del agua y las normas, según el Ayuntamiento y la ACA.",
  },
  en: {
    path: "guides/barcelona-beaches",
    title: "Barcelona beaches: which one to pick, the season and the rules",
    seoTitle: "Barcelona beaches: which to pick, rules and Blue Flags",
    seoDescription:
      "Barcelona's ten bathing areas, which have a Blue Flag, the nudist and dog beaches, when lifeguards are on duty and what you can be fined for.",
    excerpt:
      "Barcelona's beaches one by one, with the bathing season, Blue Flags, water quality and the rules, from the City Council and the Catalan Water Agency.",
  },
};

type Beach = { name: string; length: string; flag: boolean; note: Record<Locale, string> };

/** West to east. Lengths from each beach's barcelona.cat page; flags from ADEAC 2026-2027. */
const BEACHES: Beach[] = [
  { name: "Sant Sebastià", length: "660 m", flag: true, note: { ca: "La més a ponent, al costat del port.", es: "La más al oeste, junto al puerto.", en: "The westernmost, next to the port." } },
  { name: "Sant Miquel", length: "420 m", flag: false, note: { ca: "Una de les més concorregudes.", es: "Una de las más concurridas.", en: "One of the busiest." } },
  { name: "Barceloneta", length: "422 m", flag: false, note: { ca: "De les més antigues; molt de visitant estranger.", es: "De las más antiguas; mucho visitante extranjero.", en: "One of the oldest; popular with visitors." } },
  { name: "Somorrostro", length: "522 m", flag: true, note: { ca: "Hi ha el Centre de la Platja.", es: "Aquí está el Centre de la Platja.", en: "Home to the Centre de la Platja." } },
  { name: "Nova Icària", length: "415 m", flag: true, note: { ca: "Considerada de les més tranquil·les.", es: "Considerada de las más tranquilas.", en: "Rated one of the quietest." } },
  { name: "Bogatell", length: "702 m", flag: true, note: { ca: "La més llarga; ping-pong, futbol i vòlei.", es: "La más larga; ping-pong, fútbol y vóley.", en: "The longest; table tennis, football, volleyball." } },
  { name: "Mar Bella", length: "512 m", flag: true, note: { ca: "Zona naturista i base nàutica.", es: "Zona naturista y base náutica.", en: "Naturist area and a watersports base." } },
  { name: "Nova Mar Bella", length: "420 m", flag: true, note: { ca: "Considerada de les més tranquil·les.", es: "Considerada de las más tranquilas.", en: "Rated one of the quietest." } },
  { name: "Llevant", length: "375 m", flag: false, note: { ca: "La més nova (2006); zona per a gossos a l'estiu.", es: "La más nueva (2006); zona para perros en verano.", en: "The newest (2006); summer dog area." } },
  { name: "Zona de Banys del Fòrum", length: "375 m", flag: true, note: { ca: "Sense sorra: s'entra a l'aigua per escales.", es: "Sin arena: se entra al agua por escaleras.", en: "No sand: you enter the water by steps." } },
];

const YES: Record<Locale, string> = { ca: "Sí", es: "Sí", en: "Yes" };
const NO: Record<Locale, string> = { ca: "No", es: "No", en: "No" };

type T = {
  lead: string;
  note: string;
  whichTitle: string;
  which: string[];
  tableCaption: string;
  tableHeaders: string[];
  tableNote: string;
  seasonTitle: string;
  season: string[];
  rulesTitle: string;
  rules: string[];
  specialTitle: string;
  special: string[];
  waterTitle: string;
  water: string[];
  getTitle: string;
  get: string[];
  sandTitle: string;
  sand: string;
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: "Barcelona té **deu zones de bany** al llarg d'uns 5 quilòmetres de costa: nou platges de sorra i la Zona de Banys del Fòrum, que no en té. Aquí tens com són, quines tenen bandera blava, quan hi ha socorristes, què es pot fer i què no, i on mirar la qualitat de l'aigua, amb les dades de l'Ajuntament i l'Agència Catalana de l'Aigua.",
    note: "Fora de la temporada de bany no hi ha socorristes a cap platja: només el 112.",
    whichTitle: "Quina platja triar",
    which: [
      "De ponent a llevant, la costa va de **Sant Sebastià**, al costat del port, fins al **Fòrum**. Les quatre primeres (Sant Sebastià, Sant Miquel, Barceloneta i Somorrostro) són al districte de Ciutat Vella, i l'Ajuntament descriu Sant Miquel com un dels punts més concorreguts del litoral. Cap al Poblenou, l'Ajuntament descriu la **Nova Icària** i la **Nova Mar Bella** com de les més tranquil·les de la ciutat.",
    ],
    tableCaption: "Les deu zones de bany de Barcelona",
    tableHeaders: ["Platja", "Longitud", "Bandera blava 2026-27", "Què cal saber"],
    tableNote: "Longituds: Ajuntament de Barcelona. Bandera blava: llista oficial d'ADEAC, atorgada per al 2026 i el 2027.",
    seasonTitle: "Temporada de bany i socorristes",
    season: [
      "La temporada de bany va, aproximadament, de Setmana Santa a principis d'octubre. El 2026 va anar del **28 de març al 4 d'octubre**, amb la temporada alta del 30 de maig al 13 de setembre. En temporada mitjana el servei de salvament funciona de 10.30 a 18.30 h, i en temporada alta, de 10.30 a 19.30 h.",
      "**Fora de la temporada i d'aquest horari no hi ha socorristes**, «només el 112», i l'Ajuntament recorda que els usuaris són responsables dels seus actes. A l'hivern només queden oberts alguns lavabos (Sant Sebastià, Somorrostro, Bogatell i Nova Mar Bella).",
    ],
    rulesTitle: "Normes i multes",
    rules: [
      "**No es pot fumar** a cap platja de Barcelona, ni a la sorra ni a l'aigua, des del juliol del 2022; inclou els vapejadors. Només s'hi pot fumar a l'espai de les guinguetes. És una infracció lleu, i els agents primer han d'avisar.",
      "**No es pot banyar des dels espigons** ni passar les boies grogues. El **kitesurf** és prohibit.",
      "Amb l'ordenança de convivència del 2026, que també s'aplica a les platges: fer servir **sabó a les dutxes**, fins a 700 €; **beure alcohol** al carrer on no està autoritzat, de 30 a 100 €; **comprar a venedors ambulants**, fins a 600 €. Anar en **banyador o sense samarreta** lluny de la platja es multa de 120 a 300 €, però no al passeig marítim ni als carrers que hi toquen.",
    ],
    specialTitle: "Platja nudista, gossos i bany adaptat",
    special: [
      "**Nudista:** la Mar Bella té un espai dedicat a platja naturista.",
      "**Gossos:** durant la temporada de bany no poden entrar a les platges, excepte els gossos d'assistència. En temporada alta hi ha una zona tancada per a gossos a l'extrem nord de **Llevant**, al costat de l'espigó de la rambla de Prim, de 10.30 a 19.30 h i només per a gossos amb microxip.",
      "**Bany adaptat:** el servei de suport al bany per a persones amb mobilitat reduïda té quatre punts (Barceloneta, Nova Icària, Bogatell i el Fòrum), amb cadires amfíbies. Es reserva al 607 569 374 o en línia, i els dies de servei depenen del punt i de la temporada.",
    ],
    waterTitle: "Qualitat de l'aigua",
    water: [
      "L'Agència de Salut Pública de Barcelona analitza cada setmana l'aigua i la sorra de les deu platges d'abril a setembre, i l'ACA en fa el seguiment oficial europeu. A la classificació anual del 2025 de l'ACA, la majoria de platges de Barcelona tenen qualitat **excel·lent**; la Barceloneta i Sant Miquel, **bona**.",
      "Per saber com està l'aigua avui: la pàgina de cada platja a barcelona.cat (estat del mar, banderes, meduses i ocupació), el mapa PlatgesCat de l'ACA i la bandera de la torre de socorrisme.",
    ],
    getTitle: "Com arribar-hi",
    get: [
      "Per a **Llevant i Nova Mar Bella**, l'Ajuntament indica el metro Selva de Mar o El Maresme | Fòrum, els autobusos V27 i H16 i el tramvia T4.",
      "Per a la resta, el planificador de rutes de l'Ajuntament i TMB et donen la parada més propera des d'on siguis. Mira l'estat del servei abans de sortir.",
    ],
    sandTitle: "Per què canvien les platges",
    sand: "Segons l'Ajuntament, les platges de Barcelona perden uns 30.000 m³ de sorra cada any, i el temporal Harry del gener del 2026 va fer recular la línia de costa entre 3 i 10 metres. Per això l'Ajuntament trasllada sorra d'unes platges a unes altres, i alguns serveis, com els punts de bany adaptat, poden canviar de lloc.",
    faq: [
      { question: "Quina és la platja nudista de Barcelona?", answer: "La Mar Bella, que té un espai dedicat a platja naturista, segons l'Ajuntament." },
      { question: "Quines platges de Barcelona tenen bandera blava?", answer: "Per al 2026 i el 2027: Sant Sebastià, Somorrostro, Nova Icària, Bogatell, Mar Bella, Nova Mar Bella i la Zona de Banys del Fòrum. La Barceloneta, Sant Miquel i Llevant no en tenen." },
      { question: "Hi ha socorristes a l'octubre?", answer: "Només durant la temporada de bany. El 2026 va acabar el 4 d'octubre; fora de temporada no hi ha socorristes, només el 112." },
      { question: "Es pot fumar a les platges de Barcelona?", answer: "No. Des del juliol del 2022 és prohibit fumar i vapejar a la sorra i a l'aigua de totes les platges, excepte a l'espai de les guinguetes." },
    ],
  },
  es: {
    lead: "Barcelona tiene **diez zonas de baño** a lo largo de unos 5 kilómetros de costa: nueve playas de arena y la Zona de Banys del Fòrum, que no tiene. Aquí tienes cómo son, cuáles tienen bandera azul, cuándo hay socorristas, qué se puede hacer y qué no, y dónde mirar la calidad del agua, con los datos del Ayuntamiento y la Agència Catalana de l'Aigua.",
    note: "Fuera de la temporada de baño no hay socorristas en ninguna playa: solo el 112.",
    whichTitle: "Qué playa elegir",
    which: [
      "De oeste a este, la costa va de **Sant Sebastià**, junto al puerto, hasta el **Fòrum**. Las cuatro primeras (Sant Sebastià, Sant Miquel, Barceloneta y Somorrostro) están en el distrito de Ciutat Vella, y el Ayuntamiento describe Sant Miquel como uno de los puntos más concurridos del litoral. Hacia el Poblenou, el Ayuntamiento describe la **Nova Icària** y la **Nova Mar Bella** como de las más tranquilas de la ciudad.",
    ],
    tableCaption: "Las diez zonas de baño de Barcelona",
    tableHeaders: ["Playa", "Longitud", "Bandera azul 2026-27", "Qué hay que saber"],
    tableNote: "Longitudes: Ayuntamiento de Barcelona. Bandera azul: lista oficial de ADEAC, otorgada para 2026 y 2027.",
    seasonTitle: "Temporada de baño y socorristas",
    season: [
      "La temporada de baño va, aproximadamente, de Semana Santa a principios de octubre. En 2026 fue del **28 de marzo al 4 de octubre**, con la temporada alta del 30 de mayo al 13 de septiembre. En temporada media el servicio de salvamento funciona de 10.30 a 18.30 h, y en temporada alta, de 10.30 a 19.30 h.",
      "**Fuera de la temporada y de ese horario no hay socorristas**, solo el 112, y el Ayuntamiento recuerda que los usuarios son responsables de sus actos. En invierno solo quedan abiertos algunos lavabos (Sant Sebastià, Somorrostro, Bogatell y Nova Mar Bella).",
    ],
    rulesTitle: "Normas y multas",
    rules: [
      "**No se puede fumar** en ninguna playa de Barcelona, ni en la arena ni en el agua, desde julio de 2022; incluye los vapeadores. Solo se puede fumar en el espacio de los chiringuitos. Es una infracción leve, y los agentes primero deben avisar.",
      "**No se puede bañar desde los espigones** ni pasar las boyas amarillas. El **kitesurf** está prohibido.",
      "Con la ordenanza de convivencia de 2026, que también se aplica a las playas: usar **jabón en las duchas**, hasta 700 €; **beber alcohol** en la calle donde no está autorizado, de 30 a 100 €; **comprar a vendedores ambulantes**, hasta 600 €. Ir en **bañador o sin camiseta** lejos de la playa se multa con 120 a 300 €, pero no en el paseo marítimo ni en las calles que lo tocan.",
    ],
    specialTitle: "Playa nudista, perros y baño adaptado",
    special: [
      "**Nudista:** la Mar Bella tiene un espacio dedicado a playa naturista.",
      "**Perros:** durante la temporada de baño no pueden entrar en las playas, excepto los perros de asistencia. En temporada alta hay una zona cerrada para perros en el extremo norte de **Llevant**, junto al espigón de la rambla de Prim, de 10.30 a 19.30 h y solo para perros con microchip.",
      "**Baño adaptado:** el servicio de apoyo al baño para personas con movilidad reducida tiene cuatro puntos (Barceloneta, Nova Icària, Bogatell y el Fòrum), con sillas anfibias. Se reserva en el 607 569 374 o en línea, y los días de servicio dependen del punto y de la temporada.",
    ],
    waterTitle: "Calidad del agua",
    water: [
      "La Agència de Salut Pública de Barcelona analiza cada semana el agua y la arena de las diez playas de abril a septiembre, y la ACA hace el seguimiento oficial europeo. En la clasificación anual de 2025 de la ACA, la mayoría de playas de Barcelona tienen calidad **excelente**; la Barceloneta y Sant Miquel, **buena**.",
      "Para saber cómo está el agua hoy: la página de cada playa en barcelona.cat (estado del mar, banderas, medusas y ocupación), el mapa PlatgesCat de la ACA y la bandera de la torre de socorrismo.",
    ],
    getTitle: "Cómo llegar",
    get: [
      "Para **Llevant y Nova Mar Bella**, el Ayuntamiento indica el metro Selva de Mar o El Maresme | Fòrum, los autobuses V27 y H16 y el tranvía T4.",
      "Para el resto, el planificador de rutas del Ayuntamiento y TMB te dan la parada más cercana desde donde estés. Mira el estado del servicio antes de salir.",
    ],
    sandTitle: "Por qué cambian las playas",
    sand: "Según el Ayuntamiento, las playas de Barcelona pierden unos 30.000 m³ de arena cada año, y el temporal Harry de enero de 2026 hizo retroceder la línea de costa entre 3 y 10 metros. Por eso el Ayuntamiento traslada arena de unas playas a otras, y algunos servicios, como los puntos de baño adaptado, pueden cambiar de sitio.",
    faq: [
      { question: "¿Cuál es la playa nudista de Barcelona?", answer: "La Mar Bella, que tiene un espacio dedicado a playa naturista, según el Ayuntamiento." },
      { question: "¿Qué playas de Barcelona tienen bandera azul?", answer: "Para 2026 y 2027: Sant Sebastià, Somorrostro, Nova Icària, Bogatell, Mar Bella, Nova Mar Bella y la Zona de Banys del Fòrum. La Barceloneta, Sant Miquel y Llevant no la tienen." },
      { question: "¿Hay socorristas en octubre?", answer: "Solo durante la temporada de baño. En 2026 terminó el 4 de octubre; fuera de temporada no hay socorristas, solo el 112." },
      { question: "¿Se puede fumar en las playas de Barcelona?", answer: "No. Desde julio de 2022 está prohibido fumar y vapear en la arena y en el agua de todas las playas, excepto en el espacio de los chiringuitos." },
    ],
  },
  en: {
    lead: "Barcelona has **ten bathing areas** along about 5 kilometres of coast: nine sand beaches plus the Fòrum bathing area, which has no sand. Here is what each is like, which have a Blue Flag, when lifeguards are on duty, what you can and can't do, and where to check the water, from the City Council and the Catalan Water Agency (ACA).",
    note: "Outside the bathing season there are no lifeguards on any beach: only the 112 emergency number.",
    whichTitle: "Which beach to pick",
    which: [
      "From west to east, the coast runs from **Sant Sebastià**, by the port, to the **Fòrum**. The first four (Sant Sebastià, Sant Miquel, Barceloneta and Somorrostro) are in the Ciutat Vella district, and the City Council calls Sant Miquel one of the busiest spots on the coast. Towards Poblenou, the City Council describes **Nova Icària** and **Nova Mar Bella** as among the quietest in the city.",
    ],
    tableCaption: "Barcelona's ten bathing areas",
    tableHeaders: ["Beach", "Length", "Blue Flag 2026-27", "Worth knowing"],
    tableNote: "Lengths: Barcelona City Council. Blue Flag: ADEAC's official list, awarded for 2026 and 2027.",
    seasonTitle: "Bathing season and lifeguards",
    season: [
      "The bathing season runs roughly from Easter to early October. In 2026 it ran from **28 March to 4 October**, with high season from 30 May to 13 September. Lifeguards work 10.30 to 18.30 in mid-season and 10.30 to 19.30 in high season.",
      "**Outside the season and those hours there are no lifeguards**, only the 112 emergency number, and the City Council reminds beach users that they are responsible for their own actions. In winter only a few toilets stay open (Sant Sebastià, Somorrostro, Bogatell and Nova Mar Bella).",
    ],
    rulesTitle: "Rules and fines",
    rules: [
      "**No smoking** on any Barcelona beach, on the sand or in the water, since July 2022, and that includes vapes. Smoking is allowed only inside the beach bars' space. It is a minor offence, and officers must warn you first.",
      "**No swimming from the breakwaters**, and stay inside the yellow buoys. **Kitesurfing** is banned.",
      "Under the 2026 coexistence bylaw, which also covers the beaches: using **soap in the beach showers**, up to €700; **drinking alcohol** in the street where it is not allowed, €30 to €100; **buying from street hawkers**, up to €600. Walking around in **swimwear or bare-chested** away from the beach can cost €120 to €300, but not on the seafront promenade or the streets right next to it.",
    ],
    specialTitle: "Nudist beach, dogs and assisted bathing",
    special: [
      "**Nudist:** Mar Bella has an area set aside as a naturist beach.",
      "**Dogs:** dogs are not allowed on the beaches during the bathing season, except assistance dogs. In high season there is a fenced dog area at the north end of **Llevant**, by the Rambla de Prim breakwater, open 10.30 to 19.30 and only for microchipped dogs.",
      "**Assisted bathing:** the bathing-support service for people with reduced mobility has four points (Barceloneta, Nova Icària, Bogatell and the Fòrum), with amphibious chairs. Book on 607 569 374 or online; the days each point opens depend on the season.",
    ],
    waterTitle: "Water quality",
    water: [
      "Barcelona's public health agency (ASPB) samples the water and sand of all ten beaches every week from April to September, and the ACA runs the official EU monitoring. In the ACA's 2025 annual classification most Barcelona beaches are rated **excellent**; Barceloneta and Sant Miquel are rated **good**.",
      "To check the water today: each beach's page on barcelona.cat (sea state, flags, jellyfish and how full it is), the ACA's PlatgesCat map, and the flag on the lifeguard tower.",
    ],
    getTitle: "Getting there",
    get: [
      "For **Llevant and Nova Mar Bella**, the City Council gives the Selva de Mar or El Maresme | Fòrum metro stops, buses V27 and H16, and tram T4.",
      "For the others, the City Council's route planner and TMB will give you the nearest stop from wherever you are. Check service status before you set off.",
    ],
    sandTitle: "Why the beaches change",
    sand: "According to the City Council, Barcelona's beaches lose about 30,000 m³ of sand a year, and Storm Harry in January 2026 pushed the shoreline back between 3 and 10 metres. That is why the City Council moves sand from one beach to another, and why some services, such as the assisted-bathing points, can change place.",
    faq: [
      { question: "Which is the nudist beach in Barcelona?", answer: "Mar Bella, which has an area set aside as a naturist beach, according to the City Council." },
      { question: "Which Barcelona beaches have a Blue Flag?", answer: "For 2026 and 2027: Sant Sebastià, Somorrostro, Nova Icària, Bogatell, Mar Bella, Nova Mar Bella and the Fòrum bathing area. Barceloneta, Sant Miquel and Llevant do not." },
      { question: "Are there lifeguards in October?", answer: "Only during the bathing season. In 2026 it ended on 4 October; outside the season there are no lifeguards, only the 112 emergency number." },
      { question: "Can you smoke on Barcelona's beaches?", answer: "No. Since July 2022 smoking and vaping are banned on the sand and in the water of every beach, except inside the beach bars' space." },
    ],
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    callout("warning", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.whichTitle, ...t.which),
    table(
      t.tableCaption,
      t.tableHeaders,
      BEACHES.map((b) => [b.name, b.length, b.flag ? YES[locale] : NO[locale], b.note[locale]]),
      t.tableNote,
    ),
    ...h2(t.seasonTitle, ...t.season),
    ...h2(t.rulesTitle),
    list(...t.rules),
    ...h2(t.specialTitle),
    list(...t.special),
    ...h2(t.waterTitle, ...t.water),
    ...h2(t.getTitle),
    list(...t.get),
    ...h2(t.sandTitle, t.sand),
    faq(t.faq),
    ...b2Related(["barcelonaHub", "climate", "transport", "sitges", "markets"], locale),
  ];
}

export const BEACHES_GUIDE: B2Article = {
  key: "beaches",
  entryKey: "guide-barcelona-beaches",
  categoryKey: "coast",
  sources: SOURCES,
  heroKey: "platges-barceloneta-passeig",
  heroAlt: {
    ca: "La platja de la Barceloneta i el passeig marítim amb palmeres, amb l'hotel W al fons",
    es: "La playa de la Barceloneta y el paseo marítimo con palmeras, con el hotel W al fondo",
    en: "Barceloneta beach and the palm-lined seafront promenade, with the W hotel in the distance",
  },
  heroCaption: {
    ca: "La platja i el passeig de la Barceloneta un matí de tardor.",
    es: "La playa y el paseo de la Barceloneta una mañana de otoño.",
    en: "Barceloneta beach and promenade on an autumn morning.",
  },
  secondaryKey: "platges-bogatell",
  secondaryAlt: {
    ca: "La platja del Bogatell amb la bandera verda, les dutxes i el tòtem d'informació",
    es: "La playa del Bogatell con la bandera verde, las duchas y el tótem de información",
    en: "Bogatell beach with the green flag, showers and the information post",
  },
  secondaryCaption: {
    ca: "Bogatell, la platja més llarga de la ciutat.",
    es: "Bogatell, la playa más larga de la ciudad.",
    en: "Bogatell, the longest beach in the city.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T00:15:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as BEACHES_META };
