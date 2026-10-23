import type { Block } from "@/lib/content/blocks";
import {
  ARTICLE_PATHS,
  callout,
  h2,
  keyFacts,
  lead,
  link,
  paras,
  relatedBlocks,
  table,
  type FeatureArticle,
} from "./shared";

/**
 * Article 6 — the Castanyada.
 *
 * Rewritten 23 Oct 2026 from research_notes/page1/castanyada_outings.md. The
 * first version listed twelve places, and for most of them no official page
 * gave a 2026 date or even confirmed the event: Gósol and Oliana's "All Saints
 * fairs", Bagà, Pratdip, Vilanova de Prades, Monistrol and Amer are gone, and
 * Arbúcies keeps its autumn fair without a castanyada claim its council does
 * not make. What remains has a date published by the organiser or in the
 * Generalitat's open-data cultural agenda (rhpv-yr4f), read that day.
 *
 * Left out because only an aggregator or a mirror states them: the Ball de
 * les Bruixes' 2026 edition number and clock times (the council's programme
 * PDF returned 404), Castelldefels, Cabró Rock and Jesús. After 2 November the
 * table is history: replace it with next year's dates or "to be announced"
 * wording, keeping the URL.
 */

const VILADRAU_FIRA = "https://viladrau.cat/ca/turisme/festes/fira-de-la-castanya";
const VILADRAU_BALL = "https://viladrau.cat/ca/turisme/festes/el-ball-de-les-bruixes-de-viladrau";
const ARBUCIES = "https://www.arbucies.cat";
const CARDONA =
  "https://www.cardona.cat/ajuntament/representants-politics/lalcaldessa/cardona-celebrara-la-33a-fira-de-la-llenega-amb-gastronomia-bolets-i-activitats-per-a-tota-la-familia.html";
const PEDRERA = "https://www.lapedrera.com/ca/activitats/castanyera/";
const AGENDA = "https://analisi.transparenciacatalunya.cat/Cultura-oci/Agenda-cultural-de-Catalunya/rhpv-yr4f";
const BCN_TRADITION = "https://barcelona.cat/culturapopular/en/festivals-and-traditions/food-and-drink/castanyes";
const BTV_CASTANYERES = "https://beteve.cat/historia/origen-castanyeres-barcelona/";
const CHECKED = { ca: "23 d'octubre de 2026", es: "23 de octubre de 2026", en: "23 October 2026" };

function faq(title: string, items: { question: string; answer: string }[]): Block {
  return { type: "faq", title, items } as Block;
}

function ca(): Block[] {
  return [
    lead(
      "La Castanyada del 2026 és el **dissabte 31 d'octubre**, la vigília de Tots Sants, que enguany cau en diumenge. El cap de setmana del 24 i 25 d'octubre Viladrau fa la 31a Fira de la Castanya, i la nit del 31 hi torna el Ball de les Bruixes.",
    ),
    keyFacts("Què és, en curt", [
      { label: "Quan", value: "Dissabte 31 d'octubre de 2026 (Tots Sants: diumenge 1 de novembre)" },
      { label: "Què es menja", value: "Castanyes torrades, panellets, moniatos" },
      { label: "Què es beu", value: "Moscatell" },
      { label: "La figura", value: "La castanyera, que torra castanyes al carrer" },
      { label: "El context", value: "Tots Sants i el record dels difunts" },
      { label: "Fira de referència", value: "Viladrau, 24 i 25 d'octubre de 2026" },
    ]),
    ...h2(
      "Castanyada 2026: què hi ha, dia a dia",
      `Només hi posem actes amb la data publicada per l'organitzador o a l'agenda cultural oficial de la Generalitat, comprovats el ${CHECKED.ca}. Preus i horaris poden canviar: confirma'ls al web de l'organitzador abans d'anar-hi.`,
    ),
    table(
      "Actes de la Castanyada i de tardor amb data confirmada, 2026",
      ["Data", "Lloc", "Què"],
      [
        ["Ds. 24 i dg. 25 d'octubre", "Viladrau (Osona)", "31a Fira de la Castanya: castanyes de Viladrau crues i torrades, tastos i itineraris pels castanyers"],
        ["Ds. 24 i dg. 25 d'octubre", "Arbúcies (la Selva)", "Fira de la Tardor i Festa del Flabiol"],
        ["Ds. 24 i ds. 31 d'octubre, 10:00", "Barcelona, la Pedrera", "Taller familiar «La Castanyera a La Pedrera!» (1 h 30, 9,50 €; menors de 3 anys, gratis)"],
        ["Ds. 24 d'octubre, 18:00", "Vilanova del Vallès", "Teatre «Una castanyada de por» (10 €)"],
        ["Dg. 25 d'octubre", "Cardona (Bages)", "33a Fira de la Llenega: és de bolets, no de castanyes, amb exposició micològica i showcooking"],
        ["Del 24 d'octubre al 2 de novembre", "Palau-solità i Plegamans (24), Valls (30), Capellades (31), Maçanet de la Selva (1 nov.) i Bellver de Cerdanya (2 nov.)", "Espectacle infantil «On són les castanyes?»"],
        ["Ds. 31 d'octubre, a la nit", "Viladrau", "Ball de les Bruixes, que se celebra des del 1997"],
      ],
      "Fonts: ajuntaments de Viladrau, Arbúcies i Cardona; la Pedrera; agenda cultural de Catalunya (dades obertes de la Generalitat).",
    ),
    ...h2(
      "Viladrau, la referència",
      "Si només pots anar a un lloc, és aquest. L'Ajuntament de Viladrau confirma que la **31a Fira de la Castanya se celebra el cap de setmana del 24 i 25 d'octubre de 2026**, amb castanyes de Viladrau crues i torrades, concurs de menjar castanyes, itineraris guiats pels castanyers i tastos.",
      "Viladrau és al cor del Montseny, el gran massís castanyer català. Compta que hi haurà molta gent: matinar hi val la pena.",
      `El **31 d'octubre**, la nit que comença Tots Sants, el poble fa el Ball de les Bruixes, que se celebra des del 1997. Informació oficial: [la fira](${VILADRAU_FIRA}) i [el ball](${VILADRAU_BALL}).`,
    ),
    ...h2(
      "Qui és la castanyera i d'on ve",
      "La castanyera és la figura de la festa: una dona gran, abrigada, que torra castanyes en un fogó al carrer. Segons un reportatge de betevé amb l'historiador Xavier Theros, cap al 1800 n'hi havia unes 200 només a l'actual Ciutat Vella, i el 1839 una prohibició de fer foc i torrar castanyes a la via pública les va obligar a treballar amb un recipient de fang cuit, la copa.",
      `L'Ajuntament de Barcelona explica que els historiadors creuen que la tradició de les castanyes ve del menjar dels funerals d'antany, quan es resava el rosari per la família morta. Fonts: [Ajuntament de Barcelona](${BCN_TRADITION}) i [betevé](${BTV_CASTANYERES}).`,
    ),
    callout("info", "Castanyada o Halloween?", "No cal plantejar-ho com una incompatibilitat: avui conviuen a la majoria de municipis. En molts pobles la castanyada es fa a l'escola i la nit de Tots Sants barreja elements dels dos calendaris."),
    ...h2(
      "Barcelona: la castanyada urbana",
      "A Barcelona no hi ha una única festa central de la castanyada, i seria fals presentar-la com si n'hi hagués. El que hi ha és una tradició de carrer, amb castanyeres a les cantonades i panellets a les pastisseries, i activitats de barri com el taller de la Pedrera de la taula.",
    ),
    ...h2(
      "Què menjar",
      "**Castanyes torrades**, calentes, en paperina. **Panellets**, de massapà amb pinyons, coco, cafè o ametlla. **Moniatos** rostits. I **moscatell** per acompanyar-ho.",
      `Si vols encadenar-hi paisatge, ${link("autumn", "ca", "els colors de tardor")} arriben a bona part del país en aquestes setmanes, i hi ha ${link("foodfairs", "ca", "més fires gastronòmiques de tardor")}.`,
    ),
    faq("Preguntes freqüents", [
      { question: "Quan és la Castanyada el 2026?", answer: "El dissabte 31 d'octubre, la vigília de Tots Sants. L'1 de novembre de 2026 cau en diumenge." },
      { question: "Què es menja a la Castanyada?", answer: "Castanyes torrades, panellets i moniatos, sovint amb moscatell." },
      { question: "Qui és la castanyera?", answer: "La venedora de castanyes torrades al carrer. Cap al 1800 n'hi havia unes 200 a l'actual Ciutat Vella de Barcelona, segons betevé." },
      { question: "On hi ha fires de la castanya aquest any?", answer: "La més gran és la 31a Fira de la Castanya de Viladrau, el 24 i 25 d'octubre de 2026. A la taula hi ha la resta d'actes amb data confirmada." },
      { question: "És el mateix que Halloween?", answer: "No. La Castanyada és una tradició catalana lligada a Tots Sants; avui conviu amb Halloween a molts municipis." },
    ]),
    ...paras(`Agenda oficial d'actes: [agenda cultural de Catalunya](${AGENDA}).`),
    ...relatedBlocks(["foodfairs", "autumn", "mushrooms", "medieval", "weekend"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "La Castañada de 2026 es el **sábado 31 de octubre**, la víspera de Todos los Santos, que este año cae en domingo. El fin de semana del 24 y 25 de octubre Viladrau celebra la 31ª Fira de la Castanya, y la noche del 31 vuelve el Ball de les Bruixes.",
    ),
    keyFacts("Qué es, en corto", [
      { label: "Cuándo", value: "Sábado 31 de octubre de 2026 (Todos los Santos: domingo 1 de noviembre)" },
      { label: "Qué se come", value: "Castañas asadas, panellets, boniatos" },
      { label: "Qué se bebe", value: "Moscatel" },
      { label: "La figura", value: "La castanyera, que asa castañas en la calle" },
      { label: "El contexto", value: "Todos los Santos y el recuerdo de los difuntos" },
      { label: "Feria de referencia", value: "Viladrau, 24 y 25 de octubre de 2026" },
    ]),
    ...h2(
      "Castañada 2026: qué hay, día a día",
      `Solo incluimos actos con la fecha publicada por el organizador o en la agenda cultural oficial de la Generalitat, comprobados el ${CHECKED.es}. Precios y horarios pueden cambiar: confírmalos en la web del organizador antes de ir.`,
    ),
    table(
      "Actos de la Castañada y de otoño con fecha confirmada, 2026",
      ["Fecha", "Lugar", "Qué"],
      [
        ["Sáb. 24 y dom. 25 de octubre", "Viladrau (Osona)", "31ª Fira de la Castanya: castañas de Viladrau crudas y asadas, catas e itinerarios por los castañares"],
        ["Sáb. 24 y dom. 25 de octubre", "Arbúcies (la Selva)", "Fira de la Tardor y Festa del Flabiol"],
        ["Sáb. 24 y sáb. 31 de octubre, 10:00", "Barcelona, La Pedrera", "Taller familiar «La Castanyera a La Pedrera!» (1 h 30, 9,50 €; menores de 3 años, gratis)"],
        ["Sáb. 24 de octubre, 18:00", "Vilanova del Vallès", "Teatro «Una castanyada de por» (10 €)"],
        ["Dom. 25 de octubre", "Cardona (Bages)", "33ª Fira de la Llenega: es de setas, no de castañas, con exposición micológica y showcooking"],
        ["Del 24 de octubre al 2 de noviembre", "Palau-solità i Plegamans (24), Valls (30), Capellades (31), Maçanet de la Selva (1 nov.) y Bellver de Cerdanya (2 nov.)", "Espectáculo infantil «On són les castanyes?»"],
        ["Sáb. 31 de octubre, por la noche", "Viladrau", "Ball de les Bruixes, que se celebra desde 1997"],
      ],
      "Fuentes: ayuntamientos de Viladrau, Arbúcies y Cardona; La Pedrera; agenda cultural de Cataluña (datos abiertos de la Generalitat).",
    ),
    ...h2(
      "Viladrau, la referencia",
      "Si solo puedes ir a un sitio, es este. El Ayuntamiento de Viladrau confirma que la **31ª Fira de la Castanya se celebra el fin de semana del 24 y 25 de octubre de 2026**, con castañas de Viladrau crudas y asadas, concurso de comer castañas, itinerarios guiados por los castañares y catas.",
      "Viladrau está en el corazón del Montseny, el gran macizo castañero catalán. Habrá mucha gente: madrugar compensa.",
      `El **31 de octubre**, la noche en que empieza Todos los Santos, el pueblo celebra el Ball de les Bruixes, que se hace desde 1997. Información oficial: [la feria](${VILADRAU_FIRA}) y [el baile](${VILADRAU_BALL}).`,
    ),
    ...h2(
      "Quién es la castanyera y de dónde viene",
      "La castanyera es la figura de la fiesta: una mujer mayor, abrigada, que asa castañas en un hornillo en la calle. Según un reportaje de betevé con el historiador Xavier Theros, hacia 1800 había unas 200 solo en la actual Ciutat Vella, y en 1839 una prohibición de hacer fuego y asar castañas en la vía pública las obligó a trabajar con un recipiente de barro cocido, la copa.",
      `El Ayuntamiento de Barcelona explica que los historiadores creen que la tradición de las castañas viene de la comida de los funerales de antaño, cuando se rezaba el rosario por los familiares difuntos. Fuentes: [Ayuntamiento de Barcelona](${BCN_TRADITION}) y [betevé](${BTV_CASTANYERES}).`,
    ),
    callout("info", "¿Castañada o Halloween?", "No hace falta plantearlo como incompatibilidad: hoy conviven en la mayoría de municipios. En muchos pueblos la castañada se celebra en la escuela y la noche de Todos los Santos mezcla elementos de ambos calendarios."),
    ...h2(
      "Barcelona: la castañada urbana",
      "En Barcelona no hay una única fiesta central de la castañada, y sería falso presentarla como si la hubiera. Lo que hay es una tradición de calle, con castañeras en las esquinas y panellets en las pastelerías, y actividades de barrio como el taller de La Pedrera de la tabla.",
    ),
    ...h2(
      "Qué comer",
      "**Castañas asadas**, calientes, en cucurucho. **Panellets**, de mazapán con piñones, coco, café o almendra. **Boniatos** asados. Y **moscatel** para acompañar.",
      `Si quieres encadenar paisaje, ${link("autumn", "es", "los colores de otoño")} llegan a buena parte del país esas semanas, y hay ${link("foodfairs", "es", "más ferias gastronómicas de otoño")}.`,
    ),
    faq("Preguntas frecuentes", [
      { question: "¿Cuándo es la Castañada en 2026?", answer: "El sábado 31 de octubre, la víspera de Todos los Santos. El 1 de noviembre de 2026 cae en domingo." },
      { question: "¿Qué se come en la Castañada?", answer: "Castañas asadas, panellets y boniatos, a menudo con moscatel." },
      { question: "¿Quién es la castanyera?", answer: "La vendedora de castañas asadas en la calle. Hacia 1800 había unas 200 en la actual Ciutat Vella de Barcelona, según betevé." },
      { question: "¿Dónde hay ferias de la castaña este año?", answer: "La mayor es la 31ª Fira de la Castanya de Viladrau, el 24 y 25 de octubre de 2026. En la tabla están los demás actos con fecha confirmada." },
      { question: "¿Es lo mismo que Halloween?", answer: "No. La Castañada es una tradición catalana ligada a Todos los Santos; hoy convive con Halloween en muchos municipios." },
    ]),
    ...paras(`Agenda oficial de actos: [agenda cultural de Cataluña](${AGENDA}).`),
    ...relatedBlocks(["foodfairs", "autumn", "mushrooms", "medieval", "weekend"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "The Castanyada 2026 is on **Saturday 31 October**, the eve of All Saints' Day, which falls on a Sunday this year. Its symbol is the **castanyera**, the chestnut seller roasting on a street brazier; on 24–25 October Viladrau holds its 31st Chestnut Fair, and on the night of the 31st its Ball de les Bruixes.",
    ),
    keyFacts("The short version", [
      { label: "When", value: "Saturday 31 October 2026 (All Saints: Sunday 1 November)" },
      { label: "What you eat", value: "Roast chestnuts, panellets, sweet potato" },
      { label: "What you drink", value: "Moscatell, a sweet muscat wine" },
      { label: "The figure", value: "The castanyera, who roasts chestnuts in the street" },
      { label: "The context", value: "All Saints, and remembering the dead" },
      { label: "The reference fair", value: "Viladrau, 24–25 October 2026" },
    ]),
    ...h2(
      "Castanyeres: who they are and where they come from",
      "The castanyera is the figure of the night: an older woman, well wrapped up, roasting chestnuts on a brazier on a street corner. According to a report by Barcelona's city broadcaster betevé, quoting historian Xavier Theros, around 1800 there were some 200 of them in today's Ciutat Vella alone, and an 1839 ban on lighting fires and roasting chestnuts in the street forced them to work with a fired-clay pot called a copa.",
      `Barcelona City Council notes that historians believe the chestnut tradition comes from the food served at funerals in the past, when people recited the rosary for relatives who had died. Sources: [Ajuntament de Barcelona](${BCN_TRADITION}) and [betevé](${BTV_CASTANYERES}).`,
    ),
    ...h2(
      "Castanyada 2026 events, day by day",
      `Only events whose date is published by the organiser or in the Generalitat's official cultural agenda are listed, checked on ${CHECKED.en}. Prices and times can change: confirm them on the organiser's site before you go.`,
    ),
    table(
      "Castanyada and autumn events with a confirmed date, 2026",
      ["Date", "Place", "What"],
      [
        ["Sat 24 and Sun 25 October", "Viladrau (Osona)", "31st Chestnut Fair: Viladrau chestnuts raw and roasted, tastings and guided walks through the chestnut woods"],
        ["Sat 24 and Sun 25 October", "Arbúcies (La Selva)", "Autumn Fair and Festa del Flabiol"],
        ["Sat 24 and Sat 31 October, 10:00", "Barcelona, La Pedrera", "Family workshop \"La Castanyera a La Pedrera!\" (1 h 30, €9.50; under-3s free)"],
        ["Sat 24 October, 18:00", "Vilanova del Vallès", "Theatre, \"Una castanyada de por\" (€10)"],
        ["Sun 25 October", "Cardona (Bages)", "33rd Fira de la Llenega: a mushroom fair, not a chestnut one, with an exhibition and a cookery show"],
        ["24 October to 2 November", "Palau-solità i Plegamans (24), Valls (30), Capellades (31), Maçanet de la Selva (1 Nov) and Bellver de Cerdanya (2 Nov)", "Children's show \"On són les castanyes?\""],
        ["Sat 31 October, at night", "Viladrau", "Ball de les Bruixes (Witches' Dance), held since 1997"],
      ],
      "Sources: Viladrau, Arbúcies and Cardona town councils; La Pedrera; Catalonia's cultural agenda (Generalitat open data).",
    ),
    ...h2(
      "Viladrau, the one to pick",
      "If you can only go to one, go here. Viladrau town council confirms that the **31st Chestnut Fair takes place on the weekend of 24–25 October 2026**, with Viladrau chestnuts raw and roasted, a chestnut-eating contest, guided walks through the chestnut woods and tastings.",
      "Viladrau sits in the heart of the Montseny, Catalonia's great chestnut massif. Expect crowds; arriving early helps.",
      `On **31 October**, the night All Saints begins, the village holds its Ball de les Bruixes, which it has done since 1997. Official information: [the fair](${VILADRAU_FIRA}) and [the dance](${VILADRAU_BALL}).`,
    ),
    callout(
      "info",
      "Castanyada or Halloween?",
      "There is no need to frame this as a conflict: the two now coexist in most towns. In many places the Castanyada is celebrated at school, and All Saints' night mixes elements of both calendars.",
    ),
    ...h2(
      "Barcelona: the everyday version",
      "Barcelona has no single central Castanyada festival, and it would be false to present one. What it has is a street tradition, with chestnut sellers on corners and panellets in the bakeries, and neighbourhood events such as the La Pedrera workshop in the table.",
    ),
    ...h2(
      "What to eat",
      "**Roast chestnuts**, hot, in a paper cone. **Panellets**, small marzipan sweets with pine nuts, coconut, coffee or almond. **Roast sweet potato**. And **moscatell** alongside.",
      `If you want landscape with it, ${link("autumn", "en", "autumn colour")} reaches much of the country in these weeks, and there are ${link("foodfairs", "en", "more autumn food fairs")}.`,
    ),
    faq("Frequently asked questions", [
      { question: "When is the Castanyada in 2026?", answer: "Saturday 31 October, the eve of All Saints' Day. 1 November 2026 is a Sunday." },
      { question: "What are castanyeres?", answer: "The women who sell roast chestnuts in the street. Around 1800 there were some 200 in today's Ciutat Vella in Barcelona, according to betevé." },
      { question: "What do you eat on the Castanyada?", answer: "Roast chestnuts, panellets and roast sweet potato, often with moscatell." },
      { question: "Where can I find a chestnut fair this year?", answer: "The biggest is Viladrau's 31st Chestnut Fair on 24–25 October 2026. The table lists the other events with a confirmed date." },
      { question: "Is the Castanyada the same as Halloween?", answer: "No. It is a Catalan tradition tied to All Saints; today it coexists with Halloween in many towns." },
    ]),
    ...paras(`Official events listing: [Catalonia's cultural agenda](${AGENDA}).`),
    ...relatedBlocks(["foodfairs", "autumn", "mushrooms", "medieval", "weekend"], "en"),
  ];
}

export const CASTANYADA: FeatureArticle = {
  key: "castanyada",
  entryKey: "feature-castanyada",
  categoryKey: "festivals",
  heroKey: "castanyada-catalunya-castanyes-foc",
  secondaryKey: "fira-castanya-viladrau-tardor",
  heroAlt: {
    ca: "Castanyes torrant-se al foc durant la castanyada",
    es: "Castañas asándose al fuego durante la castañada",
    en: "Chestnuts roasting over a fire during the Castanyada",
  },
  heroCaption: {
    ca: "Imatge representativa de la tradició de la castanyada. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de la tradición de la castañada. Ilustración generada con inteligencia artificial.",
    en: "Representative image of the Castanyada tradition. Illustration generated with artificial intelligence.",
  },
  secondaryAlt: {
    ca: "Castanyes torrades en una paperina",
    es: "Castañas asadas en un cucurucho",
    en: "Roast chestnuts in a paper cone",
  },
  secondaryCaption: {
    ca: "Imatge representativa de castanyes torrades; no correspon a cap fira concreta. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de castañas asadas; no corresponde a ninguna feria concreta. Ilustración generada con inteligencia artificial.",
    en: "Representative image of roast chestnuts; it does not depict any specific fair. Illustration generated with artificial intelligence.",
  },
  sources: [
    { name: "Fira de la Castanya de Viladrau", url: VILADRAU_FIRA, publisher: "Ajuntament de Viladrau" },
    { name: "El Ball de les Bruixes de Viladrau", url: VILADRAU_BALL, publisher: "Ajuntament de Viladrau" },
    { name: "Fira de la Tardor i Festa del Flabiol", url: ARBUCIES, publisher: "Ajuntament d'Arbúcies" },
    { name: "33a Fira de la Llenega", url: CARDONA, publisher: "Ajuntament de Cardona" },
    { name: "La Castanyera a La Pedrera!", url: PEDRERA, publisher: "Fundació Catalunya La Pedrera" },
    { name: "Agenda cultural de Catalunya (dades obertes)", url: AGENDA, publisher: "Generalitat de Catalunya" },
    { name: "Castanyes", url: BCN_TRADITION, publisher: "Ajuntament de Barcelona" },
    { name: "L'origen de les castanyeres de Barcelona", url: BTV_CASTANYERES, publisher: "betevé" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.castanyada.ca,
      title: "Castanyada 2026: quan és, on anar-hi i qui és la castanyera",
      seoTitle: "Castanyada 2026: quan és, on anar-hi i què es menja",
      seoDescription:
        "La Castanyada 2026 és dissabte 31 d'octubre. Fires i actes confirmats pels ajuntaments (Viladrau, Cardona, Arbúcies), què es menja i l'origen.",
      excerpt:
        "Dissabte 31 d'octubre: la Fira de la Castanya de Viladrau, els actes amb data confirmada, qui és la castanyera i què es menja.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.castanyada.es,
      title: "Castañada 2026: cuándo es, dónde ir y quién es la castanyera",
      seoTitle: "Castañada 2026: cuándo es, dónde ir y qué se come",
      seoDescription:
        "La Castañada 2026 es el sábado 31 de octubre. Ferias y actos confirmados por los ayuntamientos (Viladrau, Cardona, Arbúcies), qué se come y su origen.",
      excerpt:
        "Sábado 31 de octubre: la Fira de la Castanya de Viladrau, los actos con fecha confirmada, quién es la castanyera y qué se come.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.castanyada.en,
      title: "Castanyada 2026: the date, the castanyeres and where to go",
      seoTitle: "Castanyada 2026: date, castanyeres and where to go",
      seoDescription:
        "The Castanyada 2026 is Saturday 31 October. Fairs and events confirmed by town councils, what Catalans eat, and who the castanyeres are.",
      excerpt:
        "Saturday 31 October: Viladrau's chestnut fair, the events with a confirmed date, who the castanyeres are and what to eat.",
      blocks: en(),
    },
  },
};
