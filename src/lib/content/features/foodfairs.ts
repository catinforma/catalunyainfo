import type { Block } from "@/lib/content/blocks";
import {
  ARTICLE_PATHS,
  callout,
  h2,
  lead,
  link,
  list,
  paras,
  relatedBlocks,
  table,
  type FeatureArticle,
} from "./shared";

/**
 * Article 5 — autumn food fairs.
 *
 * This is the article where it would be easiest to publish something false.
 * Small municipal fairs move by a week between years, and the aggregators
 * disagree with each other and with the town halls. Checking a handful of them
 * produced three different dates for the same fair in Cardona.
 *
 * So the rule here is strict: **an exact date appears only where the organiser
 * publishes it and we read it ourselves.** A fair with no organiser date for
 * this year is left out, not given a guessed one.
 *
 * Re-checked on 24 October 2026 against each organiser's own page:
 * Viladrau (viladrau.cat), Monistrol (monistroldemontserrat.cat), Cardona
 * (cardonaturisme.cat), Gandesa (festadelvi.cat), Maials (maials.cat), and the
 * three new-oil fairs on the DOP Siurana calendar (dopsiurana.com). Escumostra,
 * the former Cavatast, is from santsadurni.cat and is listed as already held.
 *
 * Removed on that date because no 2026 organiser date could be found or the
 * fair was already over: Ripoll's cheese fair (September), Porc i Cervesa in
 * Manlleu, the Fira de la Galeta in Camprodon and Brunyola's hazelnut fair
 * (both early October). Fairs seen only on aggregators (Calonge's Vi Nou,
 * Santa Coloma's Ratafia, Olot's Orígens, Amer's Sant Martí) are not listed.
 */

const VILADRAU = "https://viladrau.cat/ca/turisme/festes/fira-de-la-castanya";
const MONISTROL = "https://www.monistroldemontserrat.cat/";
const CARDONA = "https://www.cardonaturisme.cat/fires_festes/fira-de-la-llenega/";
const GANDESA = "https://www.festadelvi.cat/programa";
const MAIALS = "https://www.maials.cat/";
const REUS = "https://dopsiurana.com/events/fira-de-loli-nou-a-reus-6/";
const BCN_OIL = "https://dopsiurana.com/events/mercat-de-loli-nou/";
const TARRAGONA = "https://dopsiurana.com/events/fira-de-loli-nou-a-tarragona-5/";
const SANT_SADURNI = "https://santsadurni.cat/23632";
const FIRES = "https://firescatalanes.cat/fires/categoria/gastronomica-i-alimentacio/";

function ca(): Block[] {
  return [
    lead(
      "Aquest cap de setmana, **dissabte 24 i diumenge 25 d'octubre de 2026**, hi ha la Fira de la Castanya de Viladrau i la Fira de la Coca i el Mató de Monistrol de Montserrat, i el diumenge 25 la Fira de la Llenega de Cardona. Després vénen la Festa del Vi de Gandesa (del 30 d'octubre a l'1 de novembre) i, al novembre, les fires de l'oli nou de Reus, Maials, Barcelona i Tarragona.",
    ),
    ...paras(
      "Totes les dates d'aquesta llista són les que publica l'organitzador o l'ajuntament, comprovades el 24 d'octubre de 2026. Les fires que encara no tenen data oficial per a enguany no hi surten: no posem la de l'any passat com si fos la d'aquest.",
    ),
    table(
      "Fires gastronòmiques de tardor a Catalunya, per data (2026)",
      ["Dates", "Fira", "Municipi", "Producte"],
      [
        ["**Ds 24 i dg 25 d'octubre**", "Fira de la Castanya (31a edició)", "Viladrau", "Castanya"],
        ["**Ds 24 i dg 25 d'octubre**", "Fira de la Coca i el Mató (32a edició)", "Monistrol de Montserrat", "Coca i mató"],
        ["**Dg 25 d'octubre**", "Fira de la Llenega i el Bosc de Tardor", "Cardona", "Bolets"],
        ["**Del 30 d'octubre a l'1 de novembre**", "Festa del Vi (39a edició)", "Gandesa", "Vi DO Terra Alta"],
        ["**13 i 14 de novembre**", "Fira de l'Oli Nou", "Reus (pl. de la Llibertat)", "Oli DOP Siurana"],
        ["**14 i 15 de novembre**", "Fira de l'Oli Verd", "Maials", "Oli nou sense filtrar"],
        ["**Del 20 al 22 de novembre**", "Mercat de l'Oli Nou", "Barcelona (pl. de Catalunya)", "Oli nou"],
        ["**27 i 28 de novembre**", "Fira de l'Oli Nou", "Tarragona (pl. Corsini)", "Oli DOP Siurana"],
      ],
      "Dates de la web de cada organitzador o ajuntament, comprovades el 24 d'octubre de 2026. Els programes es poden canviar: mira la font el dia abans d'anar-hi.",
    ),
    ...h2(
      "Aquest cap de setmana: castanyes, coca i mató i bolets",
      `**Viladrau, Fira de la Castanya.** L'Ajuntament de Viladrau anuncia la 31a edició **el cap de setmana del 24 i 25 d'octubre de 2026**. És la fira de la castanya de referència al Montseny i una de les fires de tardor més conegudes de Catalunya. Informació oficial: [viladrau.cat](${VILADRAU}).`,
      `**Monistrol de Montserrat, Fira de la Coca i el Mató.** L'Ajuntament hi celebra la XXXII edició **el 24 i el 25 d'octubre**. La coca i el mató és el dolç que històricament es menja en pujar a Montserrat, de manera que és una parada natural si fas ${link("montserrat", "ca", "una escapada a Montserrat")}. Font: [monistroldemontserrat.cat](${MONISTROL}).`,
      `**Cardona, Fira de la Llenega i el Bosc de Tardor.** Cardona Turisme la situa el **diumenge 25 d'octubre de 2026**. La llenega és el bolet protagonista, però la fira inclou també activitats de natura, i es combina bé amb la Muntanya de Sal i el castell. Font: [cardonaturisme.cat](${CARDONA}). Si vas a buscar bolets pel teu compte, mira abans ${link("mushrooms", "ca", "el nostre part setmanal de bolets")}.`,
      `Si el que busques és la tradició sencera —castanyes, panellets i Tots Sants—, ${link("castanyada", "ca", "hi dediquem un article complet")}.`,
    ),
    ...h2(
      "Festa del Vi de Gandesa: del 30 d'octubre a l'1 de novembre",
      "La 39a Festa del Vi de Gandesa, a la Terra Alta, es fa **de divendres 30 d'octubre a diumenge 1 de novembre de 2026**. El cor de la festa és la **Mostra de Vins DO Terra Alta**, al Recinte Firal, amb aquest horari segons el programa oficial:",
    ),
    list(
      "**Divendres 30 d'octubre:** de 19.00 a 21.30 h (amb el pregó i la inauguració).",
      "**Dissabte 31 d'octubre:** d'11.00 a 14.00 h i de 17.30 a 21.30 h.",
      "**Diumenge 1 de novembre:** d'11.00 a 14.00 h, i a les 14.00 h el dinar de clotxa al pati de les Escoles Velles.",
    ),
    ...paras(
      `El divendres a les 22.00 h hi ha la Nit de les Garnatxes Blanques, un sopar maridatge al Celler Cooperatiu de Gandesa, amb entrades a 65 €. El preu de la copa i els tiquets de degustació de la mostra encara és «per confirmar» a la web. Programa i entrades: [festadelvi.cat](${GANDESA}).`,
    ),
    ...h2(
      "I al novembre? Les fires de l'oli nou",
      "El novembre és el mes de l'oli nou, el primer de la collita. Aquestes són les fires amb data oficial:",
    ),
    list(
      `**Reus, Fira de l'Oli Nou: 13 i 14 de novembre**, a la plaça de la Llibertat, amb oli de la DOP Siurana. [Calendari de la DOP Siurana](${REUS}).`,
      `**Maials, Fira de l'Oli Verd: 14 i 15 de novembre.** L'oli verd és el primer de la collita, embotellat sense filtrar, amb un amargor i un picant molt marcats. Dates de l'Ajuntament de Maials: [maials.cat](${MAIALS}).`,
      `**Barcelona, Mercat de l'Oli Nou: del 20 al 22 de novembre**, a la plaça de Catalunya. Divendres 20 de 12.00 a 21.00 h, dissabte 21 d'11.00 a 21.00 h i diumenge 22 d'11.00 a 20.00 h. [Fitxa del mercat](${BCN_OIL}).`,
      `**Tarragona, Fira de l'Oli Nou: 27 i 28 de novembre**, a la plaça Corsini, amb oli de la DOP Siurana. [Calendari de la DOP Siurana](${TARRAGONA}).`,
    ),
    ...paras(
      "Si encara no has tastat l'oli nou, és la millor manera d'entendre per què no és el mateix producte que l'oli que es compra la resta de l'any.",
    ),
    callout(
      "info",
      "Ja s'ha fet aquest any",
      `**Escumostra**, l'antic Cavatast de Sant Sadurní d'Anoia, va celebrar la 30a edició el 2, el 3 i el 4 d'octubre de 2026 al parc Lluís Companys ([santsadurni.cat](${SANT_SADURNI})). Per a l'any que ve, ${link("trains", "ca", "Sant Sadurní és una de les escapades en tren de la nostra llista")}: el cava i el cotxe no es porten bé.`,
    ),
    ...h2(
      "Com triar",
      "Per a una sortida familiar aquest cap de setmana: Viladrau o Monistrol. Per combinar bosc i taula: Cardona. Per beure amb criteri: Gandesa. Per comprar oli de l'any: Reus, Maials, Barcelona o Tarragona; el mercat de la plaça de Catalunya és el més fàcil si no tens cotxe.",
      `Hi ha moltes més fires petites als calendaris agregats, com [firescatalanes.cat](${FIRES}), però no les hem pogut confirmar amb l'organitzador: comprova-les abans de fer quilòmetres. I per a la resta de plans, ${link("weekend", "ca", "la nostra agenda del cap de setmana")}.`,
    ),
    ...relatedBlocks(["castanyada", "mushrooms", "autumn", "weekend", "montserrat"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "Este fin de semana, **sábado 24 y domingo 25 de octubre de 2026**, hay la Fira de la Castanya de Viladrau y la Fira de la Coca i el Mató de Monistrol de Montserrat, y el domingo 25 la Fira de la Llenega de Cardona. Después llegan la Festa del Vi de Gandesa (del 30 de octubre al 1 de noviembre) y, en noviembre, las ferias del aceite nuevo de Reus, Maials, Barcelona y Tarragona.",
    ),
    ...paras(
      "Todas las fechas de esta lista son las que publica el organizador o el ayuntamiento, comprobadas el 24 de octubre de 2026. Las ferias que aún no tienen fecha oficial para este año no aparecen: no ponemos la del año pasado como si fuera la de este.",
    ),
    table(
      "Ferias gastronómicas de otoño en Cataluña, por fecha (2026)",
      ["Fechas", "Feria", "Municipio", "Producto"],
      [
        ["**Sá 24 y do 25 de octubre**", "Fira de la Castanya (31.ª edición)", "Viladrau", "Castaña"],
        ["**Sá 24 y do 25 de octubre**", "Fira de la Coca i el Mató (32.ª edición)", "Monistrol de Montserrat", "Coca y mató"],
        ["**Do 25 de octubre**", "Fira de la Llenega i el Bosc de Tardor", "Cardona", "Setas"],
        ["**Del 30 de octubre al 1 de noviembre**", "Festa del Vi (39.ª edición)", "Gandesa", "Vino DO Terra Alta"],
        ["**13 y 14 de noviembre**", "Fira de l'Oli Nou", "Reus (pl. de la Llibertat)", "Aceite DOP Siurana"],
        ["**14 y 15 de noviembre**", "Fira de l'Oli Verd", "Maials", "Aceite nuevo sin filtrar"],
        ["**Del 20 al 22 de noviembre**", "Mercat de l'Oli Nou", "Barcelona (pl. de Catalunya)", "Aceite nuevo"],
        ["**27 y 28 de noviembre**", "Fira de l'Oli Nou", "Tarragona (pl. Corsini)", "Aceite DOP Siurana"],
      ],
      "Fechas de la web de cada organizador o ayuntamiento, comprobadas el 24 de octubre de 2026. Los programas pueden cambiar: mira la fuente el día antes de ir.",
    ),
    ...h2(
      "Este fin de semana: castañas, coca con mató y setas",
      `**Viladrau, Fira de la Castanya.** El Ayuntamiento de Viladrau anuncia la 31.ª edición **el fin de semana del 24 y 25 de octubre de 2026**. Es la feria de la castaña de referencia en el Montseny y una de las ferias de otoño más conocidas de Cataluña. Información oficial: [viladrau.cat](${VILADRAU}).`,
      `**Monistrol de Montserrat, Fira de la Coca i el Mató.** El Ayuntamiento celebra la XXXII edición **el 24 y el 25 de octubre**. La coca con mató es el dulce que históricamente se come al subir a Montserrat, así que es una parada natural si haces ${link("montserrat", "es", "una escapada a Montserrat")}. Fuente: [monistroldemontserrat.cat](${MONISTROL}).`,
      `**Cardona, Fira de la Llenega i el Bosc de Tardor.** Cardona Turisme la sitúa el **domingo 25 de octubre de 2026**. La llenega es la seta protagonista, pero la feria incluye también actividades de naturaleza, y se combina bien con la Montaña de Sal y el castillo. Fuente: [cardonaturisme.cat](${CARDONA}). Si vas a buscar setas por tu cuenta, mira antes ${link("mushrooms", "es", "nuestro parte semanal de setas")}.`,
      `Si buscas la tradición completa —castañas, panellets y Todos los Santos—, ${link("castanyada", "es", "le dedicamos un artículo entero")}.`,
    ),
    ...h2(
      "Festa del Vi de Gandesa: del 30 de octubre al 1 de noviembre",
      "La 39.ª Festa del Vi de Gandesa, en la Terra Alta, se celebra **de viernes 30 de octubre a domingo 1 de noviembre de 2026**. El corazón de la fiesta es la **Mostra de Vins DO Terra Alta**, en el Recinte Firal, con este horario según el programa oficial:",
    ),
    list(
      "**Viernes 30 de octubre:** de 19:00 a 21:30 (con el pregón y la inauguración).",
      "**Sábado 31 de octubre:** de 11:00 a 14:00 y de 17:30 a 21:30.",
      "**Domingo 1 de noviembre:** de 11:00 a 14:00, y a las 14:00 la comida de clotxa en el patio de les Escoles Velles.",
    ),
    ...paras(
      `El viernes a las 22:00 se celebra la Nit de les Garnatxes Blanques, una cena maridaje en el Celler Cooperatiu de Gandesa, con entradas a 65 €. El precio de la copa y los tickets de degustación de la muestra aún figura como «per confirmar» en la web. Programa y entradas: [festadelvi.cat](${GANDESA}).`,
    ),
    ...h2(
      "¿Y en noviembre? Las ferias del aceite nuevo",
      "Noviembre es el mes del aceite nuevo, el primero de la cosecha. Estas son las ferias con fecha oficial:",
    ),
    list(
      `**Reus, Fira de l'Oli Nou: 13 y 14 de noviembre**, en la plaza de la Llibertat, con aceite de la DOP Siurana. [Calendario de la DOP Siurana](${REUS}).`,
      `**Maials, Fira de l'Oli Verd: 14 y 15 de noviembre.** El aceite verde es el primero de la cosecha, embotellado sin filtrar, con un amargor y un picante muy marcados. Fechas del Ayuntamiento de Maials: [maials.cat](${MAIALS}).`,
      `**Barcelona, Mercat de l'Oli Nou: del 20 al 22 de noviembre**, en la plaza de Catalunya. Viernes 20 de 12:00 a 21:00, sábado 21 de 11:00 a 21:00 y domingo 22 de 11:00 a 20:00. [Ficha del mercado](${BCN_OIL}).`,
      `**Tarragona, Fira de l'Oli Nou: 27 y 28 de noviembre**, en la plaza Corsini, con aceite de la DOP Siurana. [Calendario de la DOP Siurana](${TARRAGONA}).`,
    ),
    ...paras(
      "Si todavía no has probado el aceite nuevo, es la mejor manera de entender por qué no es el mismo producto que el aceite que se compra el resto del año.",
    ),
    callout(
      "info",
      "Ya se ha celebrado este año",
      `**Escumostra**, el antiguo Cavatast de Sant Sadurní d'Anoia, celebró su 30.ª edición el 2, el 3 y el 4 de octubre de 2026 en el parque Lluís Companys ([santsadurni.cat](${SANT_SADURNI})). Para el año que viene, ${link("trains", "es", "Sant Sadurní está en nuestra lista de escapadas en tren")}: el cava y el coche no se llevan bien.`,
    ),
    ...h2(
      "Cómo elegir",
      "Para una salida familiar este fin de semana: Viladrau o Monistrol. Para combinar bosque y mesa: Cardona. Para beber con criterio: Gandesa. Para comprar aceite del año: Reus, Maials, Barcelona o Tarragona; el mercado de la plaza de Catalunya es el más fácil si no tienes coche.",
      `Hay muchas más ferias pequeñas en los calendarios agregados, como [firescatalanes.cat](${FIRES}), pero no las hemos podido confirmar con el organizador: compruébalas antes de hacer kilómetros. Y para el resto de planes, ${link("weekend", "es", "nuestra agenda del fin de semana")}.`,
    ),
    ...relatedBlocks(["castanyada", "mushrooms", "autumn", "weekend", "montserrat"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "This weekend, **Saturday 24 and Sunday 25 October 2026**, Viladrau holds its Chestnut Fair and Monistrol de Montserrat its Coca i Mató Fair, and on Sunday 25 Cardona holds its Llenega mushroom fair. Next comes the Gandesa Wine Festival (30 October to 1 November) and, in November, the new olive oil fairs in Reus, Maials, Barcelona and Tarragona.",
    ),
    ...paras(
      "Every date on this list is the one published by the organiser or the town council, checked on 24 October 2026. Fairs without an official date for this year are left out: we do not reprint last year's date as this year's.",
    ),
    table(
      "Autumn food festivals in Catalonia, by date (2026)",
      ["Dates", "Fair", "Town", "Product"],
      [
        ["**Sat 24–Sun 25 October**", "Chestnut Fair (31st edition)", "Viladrau", "Chestnuts"],
        ["**Sat 24–Sun 25 October**", "Coca i Mató Fair (32nd edition)", "Monistrol de Montserrat", "Coca i mató"],
        ["**Sun 25 October**", "Fira de la Llenega i el Bosc de Tardor", "Cardona", "Wild mushrooms"],
        ["**30 October–1 November**", "Festa del Vi (39th edition)", "Gandesa", "DO Terra Alta wine"],
        ["**13–14 November**", "New Oil Fair", "Reus (Plaça de la Llibertat)", "DOP Siurana olive oil"],
        ["**14–15 November**", "Oli Verd Fair", "Maials", "New unfiltered olive oil"],
        ["**20–22 November**", "Mercat de l'Oli Nou", "Barcelona (Plaça de Catalunya)", "New olive oil"],
        ["**27–28 November**", "New Oil Fair", "Tarragona (Plaça Corsini)", "DOP Siurana olive oil"],
      ],
      "Dates from each organiser's or council's website, checked on 24 October 2026. Programmes can change: check the source the day before you go.",
    ),
    callout(
      "info",
      "Four Catalan words worth knowing",
      "**Coca i mató**: a flat sweet pastry eaten with fresh unsalted curd cheese, traditionally on the way up to Montserrat. **Llenega**: a wild mushroom prized in central Catalonia. **Oli verd**: the first, unfiltered oil of the olive harvest, intensely green, bitter and peppery. **Clotxa**: a hollowed-out loaf filled with grilled vegetables, salt cod and garlic, eaten in the southern inland regions.",
    ),
    ...h2(
      "This weekend: chestnuts, coca i mató and mushrooms",
      `**Viladrau Chestnut Fair.** Viladrau town council announces the 31st edition for **the weekend of 24 and 25 October 2026**. It is the reference chestnut fair of the Montseny massif and one of Catalonia's best-known autumn fairs. Official information: [viladrau.cat](${VILADRAU}).`,
      `**Monistrol de Montserrat Coca i Mató Fair.** The town council holds the 32nd edition on **24 and 25 October**. Coca i mató is the sweet historically eaten on the way up to Montserrat, so it is a natural stop on ${link("montserrat", "en", "a Montserrat day trip")}. Source: [monistroldemontserrat.cat](${MONISTROL}).`,
      `**Cardona Llenega Fair.** Cardona Turisme gives **Sunday 25 October 2026**. The llenega mushroom is the headline, with nature activities alongside, and it combines well with Cardona's salt mountain and castle. Source: [cardonaturisme.cat](${CARDONA}). If you are foraging yourself, read ${link("mushrooms", "en", "our weekly mushroom report")} first.`,
      `For the wider tradition of chestnuts, panellets and All Saints, ${link("castanyada", "en", "we have a full guide")}.`,
    ),
    ...h2(
      "Gandesa Wine Festival: 30 October to 1 November",
      "The 39th Festa del Vi in Gandesa, in the Terra Alta, runs **from Friday 30 October to Sunday 1 November 2026**. Its core is the **DO Terra Alta wine show** at the Recinte Firal, open at these times according to the official programme:",
    ),
    list(
      "**Friday 30 October:** 19:00 to 21:30 (with the opening speech).",
      "**Saturday 31 October:** 11:00 to 14:00 and 17:30 to 21:30.",
      "**Sunday 1 November:** 11:00 to 14:00, followed at 14:00 by the clotxa lunch in the Pati de les Escoles Velles.",
    ),
    ...paras(
      `On Friday at 22:00 there is the Nit de les Garnatxes Blanques, a pairing dinner at the Gandesa Co-operative Winery, with tickets at €65. The price of the glass and tasting tickets for the wine show is still marked "to be confirmed" on the website. Programme and tickets: [festadelvi.cat](${GANDESA}).`,
    ),
    ...h2(
      "What about November? The new olive oil fairs",
      "November is new oil month, when the first oil of the harvest comes out. These are the fairs with an official date:",
    ),
    list(
      `**Reus New Oil Fair: 13–14 November**, on Plaça de la Llibertat, with DOP Siurana oil. [DOP Siurana calendar](${REUS}).`,
      `**Maials Oli Verd Fair: 14–15 November.** Green oil is the very first pressing of the harvest, bottled unfiltered, startlingly bitter and peppery. Dates from Maials town council: [maials.cat](${MAIALS}).`,
      `**Barcelona Mercat de l'Oli Nou: 20–22 November**, on Plaça de Catalunya. Friday 20 from 12:00 to 21:00, Saturday 21 from 11:00 to 21:00 and Sunday 22 from 11:00 to 20:00. [Market listing](${BCN_OIL}).`,
      `**Tarragona New Oil Fair: 27–28 November**, on Plaça Corsini, with DOP Siurana oil. [DOP Siurana calendar](${TARRAGONA}).`,
    ),
    ...paras(
      "If you have never tasted new oil, these fairs are the best way to understand why it is a different product from the oil sold the rest of the year.",
    ),
    callout(
      "info",
      "Already held this year",
      `**Escumostra**, formerly Cavatast, the sparkling wine fair in Sant Sadurní d'Anoia, held its 30th edition on 2, 3 and 4 October 2026 in Parc Lluís Companys ([santsadurni.cat](${SANT_SADURNI})). For next year, ${link("trains", "en", "Sant Sadurní is on our list of rail day trips")}: cava and driving do not mix.`,
    ),
    ...h2(
      "How to choose",
      "For a family outing this weekend: Viladrau or Monistrol. To combine forest and table: Cardona. To drink with some guidance: Gandesa. To buy this year's oil: Reus, Maials, Barcelona or Tarragona; the Plaça de Catalunya market is the easiest without a car.",
      `Listing sites such as [firescatalanes.cat](${FIRES}) carry many more small fairs, but we could not confirm them with the organiser, so check before driving. For everything else on, see ${link("weekend", "en", "our weekend guide")}.`,
    ),
    ...relatedBlocks(["castanyada", "mushrooms", "autumn", "weekend", "montserrat"], "en"),
  ];
}

export const FOODFAIRS: FeatureArticle = {
  key: "foodfairs",
  entryKey: "feature-autumn-food-fairs",
  categoryKey: "food",
  heroKey: "fires-gastronomiques-catalunya-tardor",
  secondaryKey: "productes-tardor-catalunya-formatge-castanyes-vi",
  heroAlt: {
    ca: "Parades d'una fira gastronòmica de tardor a Catalunya",
    es: "Paradas de una feria gastronómica de otoño en Cataluña",
    en: "Stalls at an autumn food fair in Catalonia",
  },
  heroCaption: {
    ca: "Imatge representativa d'una fira gastronòmica de tardor. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de una feria gastronómica de otoño. Ilustración generada con inteligencia artificial.",
    en: "Representative image of an autumn food fair. Illustration generated with artificial intelligence.",
  },
  secondaryAlt: {
    ca: "Formatge, castanyes i vi, productes de la tardor catalana",
    es: "Queso, castañas y vino, productos del otoño catalán",
    en: "Cheese, chestnuts and wine — Catalan autumn produce",
  },
  secondaryCaption: {
    ca: "Imatge representativa de producte de tardor català. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de producto de otoño catalán. Ilustración generada con inteligencia artificial.",
    en: "Representative image of Catalan autumn produce. Illustration generated with artificial intelligence.",
  },
  sources: [
    { name: "Fira de la Castanya de Viladrau", url: VILADRAU, publisher: "Ajuntament de Viladrau" },
    { name: "XXXII Fira de la Coca i el Mató", url: MONISTROL, publisher: "Ajuntament de Monistrol de Montserrat" },
    { name: "Fira de la Llenega — Cardona Turisme", url: CARDONA, publisher: "Cardona Turisme" },
    { name: "39a Festa del Vi de Gandesa, programa", url: GANDESA, publisher: "Festa del Vi de Gandesa" },
    { name: "Fira de l'Oli Verd de Maials", url: MAIALS, publisher: "Ajuntament de Maials" },
    { name: "Fira de l'oli nou a Reus", url: REUS, publisher: "DOP Siurana" },
    { name: "Mercat de l'Oli Nou, Barcelona", url: BCN_OIL, publisher: "DOP Siurana" },
    { name: "Fira de l'oli nou a Tarragona", url: TARRAGONA, publisher: "DOP Siurana" },
    { name: "Escumostra (antic Cavatast)", url: SANT_SADURNI, publisher: "Ajuntament de Sant Sadurní d'Anoia" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.foodfairs.ca,
      title: "Fires de tardor a Catalunya 2026: dates d'octubre i novembre",
      seoTitle: "Fires de tardor a Catalunya 2026: dates d'octubre i novembre",
      seoDescription:
        "Fires gastronòmiques de tardor a Catalunya amb data oficial: castanya a Viladrau i llenega a Cardona aquest cap de setmana, vi a Gandesa i oli nou al novembre.",
      excerpt:
        "Castanyes a Viladrau, coca i mató a Monistrol, llenegues a Cardona, vi a Gandesa i oli nou a Reus, Maials, Barcelona i Tarragona: les dates oficials del 2026.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.foodfairs.es,
      title: "Ferias gastronómicas de otoño en Cataluña 2026: fechas de octubre y noviembre",
      seoTitle: "Ferias de otoño en Cataluña 2026: fechas hasta noviembre",
      seoDescription:
        "Ferias gastronómicas de otoño en Cataluña con fecha oficial: castaña en Viladrau y setas en Cardona este fin de semana, vino en Gandesa y aceite nuevo en noviembre.",
      excerpt:
        "Castañas en Viladrau, coca con mató en Monistrol, setas en Cardona, vino en Gandesa y aceite nuevo en Reus, Maials, Barcelona y Tarragona: las fechas oficiales de 2026.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.foodfairs.en,
      title: "Autumn food festivals in Catalonia 2026: October and November dates",
      seoTitle: "Catalonia autumn food festivals 2026: Oct and Nov dates",
      seoDescription:
        "Catalonia's autumn food fairs with official dates: chestnuts in Viladrau and mushrooms in Cardona this weekend, wine in Gandesa and new olive oil in November.",
      excerpt:
        "Chestnuts in Viladrau, coca i mató in Monistrol, mushrooms in Cardona, wine in Gandesa and new oil in Reus, Maials, Barcelona and Tarragona: the official 2026 dates.",
      blocks: en(),
    },
  },
};
