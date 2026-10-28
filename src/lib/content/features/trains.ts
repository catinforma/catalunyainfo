import type { Block } from "@/lib/content/blocks";
import { b2link } from "@/lib/content/batch02/shared";
import {
  ARTICLE_PATHS,
  callout,
  h2,
  lead,
  link,
  paras,
  relatedBlocks,
  table,
  type FeatureArticle,
} from "./shared";

/**
 * Article 1 — car-free day trips by train.
 *
 * The editorial rule that shapes it: a destination only earns a place if the
 * visit works on foot once you step off the train. That is what separates this
 * from a list of towns that happen to have a station.
 *
 * No departure minutes anywhere in the text: Rodalies services change with
 * engineering works, and a departure copied into an article becomes a promise
 * the reader will hold us to on the platform. Since 24 Oct 2026 the overview
 * table does carry the scheduled journey time from Barcelona-Sants and the
 * Rodalies single fare, both read that day from the official Rodalies
 * journey planner (the API behind rodalies.gencat.cat/horaris) for Tuesday
 * 27 Oct 2026, and high-speed times from Renfe's open GTFS. Vic has no time:
 * the R3 is cut between Barcelona and La Garriga (Rodalies notice of 6 Jul
 * 2026, still in force on 24 Oct). Each destination with its own guide links
 * to it, which is where the timetables live. On 26 Oct 2026 the Girona R11
 * range was re-read from the same planner for 27 and 28 Oct: 1 h 19 to
 * 1 h 41 (the 7:16 from Sants takes 1 h 41), not 1 h 19 to 1 h 31.
 */

const TABLE_NOTE = {
  ca: "Durada de Barcelona-Sants i bitllet senzill de Rodalies segons el cercador oficial de Rodalies per al dimarts 27 d'octubre de 2026; alta velocitat segons les dades obertes de Renfe. Comprova el servei del dia: algun trajecte pot requerir transbordament.",
  es: "Duración desde Barcelona-Sants y billete sencillo de Rodalies según el planificador oficial de Rodalies para el martes 27 de octubre de 2026; alta velocidad según los datos abiertos de Renfe. Comprueba el servicio del día: algún trayecto puede requerir transbordo.",
  en: "Journey time from Barcelona-Sants and Rodalies single fare from the official Rodalies journey planner for Tuesday 27 October 2026; high-speed times from Renfe's open data. Check the service on the day: some journeys may involve a change.",
};

const VIC_R3 = {
  ca: "Ara mateix, però, no hi ha trens de l'R3 entre Barcelona i la Garriga: el tram el cobreixen l'R4 i autobusos de Rodalies, i el viatge és més llarg (avís de Rodalies del 6 de juliol de 2026, vigent el 24 d'octubre).",
  es: "Ahora mismo, sin embargo, no hay trenes de la R3 entre Barcelona y La Garriga: el tramo lo cubren la R4 y autobuses de Rodalies, y el viaje es más largo (aviso de Rodalies del 6 de julio de 2026, vigente el 24 de octubre).",
  en: "Right now, though, no R3 trains run between Barcelona and La Garriga: the R4 and Rodalies replacement buses cover that stretch, and the journey takes longer (Rodalies notice of 6 July 2026, still in force on 24 October).",
};

const RODALIES = "https://rodalies.gencat.cat/ca/horaris/tots-els-horaris/";

const WARNING = {
  ca: "Consulta sempre Rodalies/Renfe abans de sortir: les obres i incidències poden modificar horaris o trajectes.",
  es: "Consulta siempre Rodalies/Renfe antes de salir: obras e incidencias pueden modificar horarios o recorridos.",
  en: "Always check Rodalies/Renfe before travelling, as engineering works and disruption can temporarily change services.",
};

function ca(): Block[] {
  return [
    lead(
      "No tenir cotxe no és cap excusa per quedar-se a Barcelona. Una part sorprenentment gran de Catalunya es pot descobrir en tren: ciutats romanes, pobles de costa, arquitectura modernista, capitals del vi i centres històrics on es pot passar un dia sencer sense tocar un volant.",
    ),
    ...paras(
      "Aquesta selecció no busca simplement els llocs que tenen estació. El criteri és un altre: que un cop baixes del tren puguis fer bona part de la visita caminant, sense dependre d'un taxi ni d'un autobús que passa cada dues hores.",
    ),
    callout("warning", "Abans de sortir", WARNING.ca),
    table(
      "Les 12 escapades, d'un cop d'ull",
      ["Destinació", "Línia habitual", "Durada des de Sants", "Senzill", "Per a què hi vas"],
      [
        ["Sitges", "R2 Sud", "31–37 min", "5,50 €", "Mar, nucli antic i museus"],
        ["Girona", "R11 o alta velocitat", "1 h 19–1 h 41 (R11), uns 40 min (alta velocitat)", "8,95–12 € (R11)", "Barri Vell, catedral i Call"],
        ["Tarragona", "Regionals R14–R17", "69 min", "8,60 €", "Patrimoni romà i Mediterrani"],
        ["Vic", "R3 (tallada entre Barcelona i la Garriga)", "—", "—", "Plaça Major, mercat i art medieval"],
        ["Figueres", "R11 o alta velocitat", "1 h 50–2 h 18 (R11), 42–65 min (alta velocitat a Figueres-Vilafant)", "12,80–17,10 € (R11)", "Teatre-Museu Dalí"],
        ["Vilanova i la Geltrú", "R2 Sud i regionals", "32–44 min", "5,50 €", "Platja i Museu del Ferrocarril"],
        ["Mataró", "R1", "46–50 min", "5,50 €", "Nau Gaudí i façana marítima"],
        ["Sant Pol de Mar", "R1", "1 h 06", "6,60 €", "Poble de costa tranquil"],
        ["Vilafranca del Penedès", "R4", "1 h 06", "6,60 €", "Cultura del vi i VINSEUM"],
        ["Sant Sadurní d'Anoia", "R4", "54 min", "5,50 €", "Capital del cava"],
        ["Manresa", "R4", "1 h 25–1 h 29", "8,25 €", "La Seu i patrimoni ignasià"],
        ["Terrassa", "R4 (Estació del Nord) o FGC", "52 min (R4)", "5,50 € (R4)", "Modernisme industrial"],
      ],
      TABLE_NOTE.ca,
    ),
    ...paras(
      `Guies pas a pas, amb horaris i preus: ${b2link("sitges", "ca", "Sitges en tren")}, ${b2link("girona", "ca", "Girona en tren")}, ${b2link("tarragona", "ca", "Tarragona en tren")}, ${b2link("figueres", "ca", "Figueres i el Museu Dalí")}, ${b2link("montserratFree", "ca", "Montserrat amb cremallera o Aeri")}, ${b2link("nuria", "ca", "el cremallera de Núria")} i ${b2link("portaventura", "ca", "PortAventura")}.`,
    ),
    ...h2(
      "1. Sitges",
      "És una de les escapades més directes que es poden fer des de Barcelona. L'estació és dins del poble, i a peu es passa dels carrers blancs del centre al passeig marítim, l'església de Sant Bartomeu i Santa Tecla i les platges.",
      "Sitges funciona pràcticament tot l'any: mar a l'estiu, museus i patrimoni quan refresca, i una agenda cultural especialment intensa a la tardor. Si hi vas durant el Festival de Cinema, compta que la vila canvia de ritme del tot.",
      "Línia habitual: R2 Sud.",
    ),
    ...h2(
      "2. Girona",
      "Girona mereix molt més que una parada ràpida. Des de l'estació s'arriba caminant al Barri Vell, les cases de l'Onyar, la catedral, el Call jueu i les muralles.",
      "És una de les escapades més completes precisament perquè la ciutat és compacta: patrimoni, gastronomia i carrers que es recorren a peu sense necessitat de cap transport addicional.",
      "Hi ha serveis regionals i altres serveis ferroviaris entre Barcelona i Girona; val la pena mirar quin encaixa millor amb l'hora a què vols arribar.",
    ),
    ...h2(
      "3. Tarragona",
      "Tarragona permet passar del tren a una de les ciutats romanes més importants de la Mediterrània. L'amfiteatre, el circ, les muralles, la Part Alta i el Balcó del Mediterrani omplen perfectament una jornada.",
      "El gran avantatge és que la part essencial de la visita és urbana i concentrada. No cal desplaçar-se fora de la ciutat per veure el més important.",
    ),
    ...h2(
      "4. Vic",
      "La R3 converteix Vic en una de les grans escapades interiors sense cotxe. La Plaça Major, el centre històric, la catedral i el Museu d'Art Medieval queden a distància caminable de l'estació.",
      "Els dies de mercat tradicional a la Plaça Major, la visita canvia de caràcter: val la pena comprovar el calendari municipal abans de triar el dia.",
      VIC_R3.ca,
    ),
    ...h2(
      "5. Figueres",
      "Si l'objectiu és Dalí, el tren és una de les maneres més senzilles d'arribar-hi. El Teatre-Museu Dalí és el gran reclam, però Figueres també permet descobrir el centre, el Museu del Joguet i el Castell de Sant Ferran si hi ha temps.",
      "Figueres té més d'una estació segons el servei. Comprova quin tren et convé el dia del viatge i a quina estació arriba, perquè la distància a peu fins al centre no és la mateixa.",
    ),
    ...h2(
      "6. Vilanova i la Geltrú",
      "Vilanova sol quedar en segon pla davant de Sitges, i és una escapada excel·lent per mèrits propis. Té platja, rambla, centre històric i un dels museus ferroviaris més interessants de Catalunya just al costat de l'estació.",
      "És una bona opció si busques mar sense la concentració de visitants d'altres punts del Garraf.",
      "Línia habitual: R2 Sud.",
    ),
    ...h2(
      "7. Mataró",
      "Mataró combina mar i modernisme. La Nau Gaudí es troba a prop de l'estació i és especialment interessant perquè conserva una de les primeres obres construïdes del jove Antoni Gaudí.",
      "Des d'allà es pot continuar cap al centre i la façana marítima. És una escapada curta que funciona bé com a mitja jornada.",
      "Línia habitual: R1.",
    ),
    ...h2(
      "8. Sant Pol de Mar",
      "Per a una escapada costanera més petita i tranquil·la, Sant Pol funciona molt bé. L'estació deixa el viatger pràcticament al costat del poble i del mar.",
      "No cal construir-hi un itinerari complicat: és una escapada per caminar, menjar, mirar el Mediterrani i tornar.",
    ),
    ...h2(
      "9. Vilafranca del Penedès",
      "És probablement la millor escapada ferroviària per entendre la cultura del vi. El VINSEUM es troba al centre històric, a poca distància a peu de l'estació, i la trama urbana és prou compacta per no necessitar res més.",
      "Línia habitual: R4.",
    ),
    ...h2(
      "10. Sant Sadurní d'Anoia",
      "Si Vilafranca explica la cultura del vi, Sant Sadurní és el gran nom del cava. Diverses caves ofereixen visites guiades.",
      "Aquí cal ser precís: **no totes les caves són accessibles caminant des de l'estació** i gairebé totes exigeixen reserva prèvia. Comprova la distància real i reserva abans de pujar al tren, perquè presentar-se sense cita és la manera més ràpida de perdre el dia.",
      "Línia habitual: R4.",
    ),
    ...h2(
      "11. Manresa",
      "Manresa permet combinar la basílica de la Seu, el centre històric, la Cova de Sant Ignasi i el paisatge del Cardener.",
      "La ciutat té més desnivell que altres destinacions d'aquesta llista; continua sent perfectament viable a peu, però val la pena tenir-ho present si vas amb criatures o amb mobilitat reduïda.",
      "Línia habitual: R4.",
    ),
    ...h2(
      "12. Terrassa",
      "Terrassa és una de les escapades modernistes més infravalorades des de Barcelona. El MNACTEC ocupa una espectacular fàbrica modernista i es pot combinar amb la Masia Freixa i el centre urbà.",
      "És especialment bona quan el temps no acompanya, perquè bona part de la visita és sota cobert.",
      "Segons des d'on surtis, hi pots arribar amb Rodalies o amb FGC.",
    ),
    ...h2(
      "Quina tries?",
      "Per mar: Sitges o Sant Pol de Mar.",
      "Per història: Tarragona o Girona.",
      "Per art: Figueres.",
      "Per modernisme: Terrassa o Mataró.",
      "Per gastronomia i vi: Vilafranca del Penedès o Sant Sadurní d'Anoia.",
      "Per una ciutat catalana amb vida pròpia i menys turisme internacional: Vic.",
    ),
    ...h2(
      "Abans de pujar al tren",
      "Els serveis ferroviaris catalans poden tenir modificacions temporals per obres i incidències. Consulta el planificador oficial el mateix dia del viatge i no converteixis els temps publicats en blogs antics en una promesa.",
      `Horaris oficials: [rodalies.gencat.cat](${RODALIES}).`,
      `Si l'escapada és de cap de setmana, ${link("weekend", "ca", "la nostra agenda setmanal")} recull què hi ha programat aquests dies. I si busques destinacions que no sempre tenen estació, ${link("montserrat", "ca", "aquí n'hi ha deu més enllà de Montserrat")}.`,
    ),
    ...relatedBlocks(["montserrat", "medieval", "gaudi", "traps", "weekend"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "No hace falta alquilar un coche para salir de Barcelona. La red ferroviaria permite descubrir ciudades romanas, localidades costeras, modernismo, vino y algunos de los centros históricos más interesantes de Cataluña.",
    ),
    ...paras(
      "El criterio de esta lista es sencillo: todos los destinos permiten hacer una visita que merece la pena a pie, después de bajar del tren, sin depender de un vehículo privado ni de un autobús que pasa cada dos horas.",
    ),
    callout("warning", "Antes de salir", WARNING.es),
    table(
      "Las 12 escapadas, de un vistazo",
      ["Destino", "Línea habitual", "Duración desde Sants", "Sencillo", "A qué vas"],
      [
        ["Sitges", "R2 Sud", "31–37 min", "5,50 €", "Mar, casco antiguo y museos"],
        ["Girona", "R11 o alta velocidad", "1 h 19–1 h 41 (R11), unos 40 min (alta velocidad)", "8,95–12 € (R11)", "Barrio Viejo, catedral y Call"],
        ["Tarragona", "Regionales R14–R17", "69 min", "8,60 €", "Patrimonio romano y Mediterráneo"],
        ["Vic", "R3 (cortada entre Barcelona y La Garriga)", "—", "—", "Plaça Major, mercado y arte medieval"],
        ["Figueres", "R11 o alta velocidad", "1 h 50–2 h 18 (R11), 42–65 min (alta velocidad a Figueres-Vilafant)", "12,80–17,10 € (R11)", "Teatre-Museu Dalí"],
        ["Vilanova i la Geltrú", "R2 Sud y regionales", "32–44 min", "5,50 €", "Playa y Museo del Ferrocarril"],
        ["Mataró", "R1", "46–50 min", "5,50 €", "Nau Gaudí y fachada marítima"],
        ["Sant Pol de Mar", "R1", "1 h 06", "6,60 €", "Pueblo costero tranquilo"],
        ["Vilafranca del Penedès", "R4", "1 h 06", "6,60 €", "Cultura del vino y VINSEUM"],
        ["Sant Sadurní d'Anoia", "R4", "54 min", "5,50 €", "Capital del cava"],
        ["Manresa", "R4", "1 h 25–1 h 29", "8,25 €", "La Seu y patrimonio ignaciano"],
        ["Terrassa", "R4 (Estació del Nord) o FGC", "52 min (R4)", "5,50 € (R4)", "Modernismo industrial"],
      ],
      TABLE_NOTE.es,
    ),
    ...paras(
      `Guías paso a paso, con horarios y precios: ${b2link("sitges", "es", "Sitges en tren")}, ${b2link("girona", "es", "Girona en tren")}, ${b2link("tarragona", "es", "Tarragona en tren")}, ${b2link("figueres", "es", "Figueres y el Museo Dalí")}, ${b2link("montserratFree", "es", "Montserrat en cremallera o Aeri")}, ${b2link("nuria", "es", "el cremallera de Núria")} y ${b2link("portaventura", "es", "PortAventura")}.`,
    ),
    ...h2(
      "1. Sitges",
      "Una de las escapadas más directas desde Barcelona. La estación está en el propio pueblo, y a pie se pasa de las calles blancas del centro al paseo marítimo, la iglesia de Sant Bartomeu i Santa Tecla y las playas.",
      "Sitges funciona casi todo el año: mar en verano, museos y patrimonio cuando refresca, y una agenda cultural especialmente intensa en otoño.",
      "Línea habitual: R2 Sud.",
    ),
    ...h2(
      "2. Girona",
      "Girona merece mucho más que una parada rápida. Desde la estación se llega andando al Barrio Viejo, las casas del Oñar, la catedral, el Call judío y las murallas.",
      "Es una de las excursiones más completas precisamente porque la ciudad es compacta: patrimonio, gastronomía y calles que se recorren a pie sin ningún transporte adicional.",
    ),
    ...h2(
      "3. Tarragona",
      "Tarragona permite pasar del tren a una de las ciudades romanas más importantes del Mediterráneo. El anfiteatro, el circo, las murallas, la Part Alta y el Balcó del Mediterrani llenan perfectamente una jornada.",
      "La gran ventaja es que lo esencial de la visita es urbano y está concentrado.",
    ),
    ...h2(
      "4. Vic",
      "La R3 convierte Vic en una de las grandes escapadas de interior sin coche. Plaça Major, casco histórico, catedral y Museu d'Art Medieval quedan a distancia andando de la estación.",
      "Los días de mercado tradicional en la Plaça Major la visita cambia por completo: conviene comprobar el calendario municipal antes de elegir el día.",
      VIC_R3.es,
    ),
    ...h2(
      "5. Figueres",
      "La opción evidente para visitar el Teatre-Museu Dalí sin coche. Figueres permite además el centro urbano, el Museu del Joguet y el Castell de Sant Ferran si sobra tiempo.",
      "Figueres tiene más de una estación según el servicio. Comprueba qué tren te conviene y a qué estación llega, porque la distancia a pie hasta el centro no es la misma.",
    ),
    ...h2(
      "6. Vilanova i la Geltrú",
      "Vilanova suele quedar en segundo plano frente a Sitges, y es una escapada excelente por méritos propios: playa, rambla, casco urbano y uno de los museos ferroviarios más interesantes de Cataluña junto a la estación.",
      "Línea habitual: R2 Sud.",
    ),
    ...h2(
      "7. Mataró",
      "Mataró combina mar y modernismo. La Nau Gaudí está cerca de la estación y conserva una de las primeras obras construidas del joven Antoni Gaudí.",
      "Desde ahí se puede continuar hacia el centro y el frente marítimo. Funciona bien como media jornada.",
      "Línea habitual: R1.",
    ),
    ...h2(
      "8. Sant Pol de Mar",
      "Para una escapada costera más pequeña y tranquila, Sant Pol funciona muy bien. La estación deja al viajero prácticamente junto al pueblo y al mar.",
      "No hace falta un itinerario complicado: es una escapada para caminar, comer, mirar el Mediterráneo y volver.",
    ),
    ...h2(
      "9. Vilafranca del Penedès",
      "Probablemente la mejor escapada ferroviaria para entender la cultura del vino. El VINSEUM está en el casco histórico, a poca distancia a pie de la estación.",
      "Línea habitual: R4.",
    ),
    ...h2(
      "10. Sant Sadurní d'Anoia",
      "Si Vilafranca explica la cultura del vino, Sant Sadurní es el gran nombre del cava. Varias bodegas ofrecen visitas guiadas.",
      "Aquí conviene ser preciso: **no todas las bodegas son accesibles andando desde la estación** y casi todas exigen reserva previa. Comprueba la distancia real y reserva antes de subir al tren.",
      "Línea habitual: R4.",
    ),
    ...h2(
      "11. Manresa",
      "Manresa permite combinar la basílica de la Seu, el centro histórico, la Cova de Sant Ignasi y el paisaje del Cardener.",
      "La ciudad tiene más desnivel que otros destinos de esta lista. Sigue siendo viable a pie, pero conviene tenerlo en cuenta.",
      "Línea habitual: R4.",
    ),
    ...h2(
      "12. Terrassa",
      "Una de las escapadas modernistas más infravaloradas desde Barcelona. El MNACTEC ocupa una espectacular fábrica modernista y puede combinarse con la Masia Freixa y el centro urbano.",
      "Es especialmente buena cuando el tiempo no acompaña, porque buena parte de la visita es bajo techo.",
      "Según desde dónde salgas, puedes llegar con Rodalies o con FGC.",
    ),
    ...h2(
      "Qué elegir",
      "Costa: Sitges o Sant Pol de Mar.",
      "Historia: Tarragona o Girona.",
      "Arte: Figueres.",
      "Modernismo: Terrassa y Mataró.",
      "Vino: Vilafranca del Penedès y Sant Sadurní d'Anoia.",
      "Una ciudad catalana con vida propia y menos turismo internacional: Vic.",
    ),
    ...h2(
      "Antes de subir al tren",
      "Los servicios ferroviarios catalanes pueden sufrir modificaciones temporales por obras e incidencias. Consulta el planificador oficial el mismo día del viaje y no conviertas los tiempos publicados en blogs antiguos en una promesa.",
      `Horarios oficiales: [rodalies.gencat.cat](${RODALIES}).`,
      `Si la escapada es de fin de semana, ${link("weekend", "es", "nuestra agenda semanal")} recoge qué hay programado. Y si buscas destinos más allá de los clásicos, ${link("montserrat", "es", "aquí hay diez que no son Montserrat")}.`,
    ),
    ...relatedBlocks(["montserrat", "medieval", "gaudi", "traps", "weekend"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "The easiest day trips from Barcelona by train are **Sitges** (31–37 minutes on the R2 Sud, €5.50), **Tarragona** (69 minutes, €8.60), **Girona** (about 40 minutes by high-speed train or 1 h 19 on the R11) and **Figueres** for the Dalí Museum. Regional and commuter trains also reach wine country, Gaudí's early work and historic Catalan towns: here are twelve, with journey times and fares.",
    ),
    ...paras(
      "The rule behind this list: every destination gives you something substantial to do on foot once you step off the train. No taxi at the other end, no bus that runs twice a day.",
    ),
    callout("warning", "Before you travel", WARNING.en),
    table(
      "The 12 trips at a glance",
      ["Destination", "Usual line", "Journey from Sants", "Single fare", "What you go for"],
      [
        ["Sitges", "R2 Sud", "31–37 min", "€5.50", "Beaches, old town, museums"],
        ["Girona", "R11 or high-speed", "1 h 19–1 h 41 (R11), about 40 min (high-speed)", "€8.95–12 (R11)", "Old Quarter, cathedral, Jewish Quarter"],
        ["Tarragona", "Regional R14–R17", "69 min", "€8.60", "Roman heritage and the Mediterranean"],
        ["Vic", "R3 (cut between Barcelona and La Garriga)", "—", "—", "Main square, market, medieval art"],
        ["Figueres", "R11 or high-speed", "1 h 50–2 h 18 (R11), 42–65 min (high-speed to Figueres-Vilafant)", "€12.80–17.10 (R11)", "Dalí Theatre-Museum"],
        ["Vilanova i la Geltrú", "R2 Sud and regionals", "32–44 min", "€5.50", "Beach and the railway museum"],
        ["Mataró", "R1", "46–50 min", "€5.50", "Nau Gaudí and the seafront"],
        ["Sant Pol de Mar", "R1", "1 h 06", "€6.60", "A quiet coastal village"],
        ["Vilafranca del Penedès", "R4", "1 h 06", "€6.60", "Wine culture and VINSEUM"],
        ["Sant Sadurní d'Anoia", "R4", "54 min", "€5.50", "Cava country"],
        ["Manresa", "R4", "1 h 25–1 h 29", "€8.25", "La Seu and Ignatian heritage"],
        ["Terrassa", "R4 (Estació del Nord) or FGC", "52 min (R4)", "€5.50 (R4)", "Industrial Modernisme"],
      ],
      TABLE_NOTE.en,
    ),
    ...paras(
      `Step-by-step guides with timetables and fares: ${b2link("sitges", "en", "Sitges by train")}, ${b2link("girona", "en", "Girona by train")}, ${b2link("tarragona", "en", "Tarragona by train")}, ${b2link("figueres", "en", "Figueres and the Dalí Museum")}, ${b2link("montserratFree", "en", "Montserrat by rack railway or cable car")}, ${b2link("nuria", "en", "the Núria rack railway")} and ${b2link("portaventura", "en", "PortAventura")}.`,
    ),
    ...h2(
      "1. Sitges",
      "The most straightforward escape on this list. The station is in the town itself, and on foot you go from whitewashed streets to the seafront promenade, the church of Sant Bartomeu i Santa Tecla and the beaches.",
      "Sitges works nearly all year: the sea in summer, museums and heritage when it cools down, and a notably busy cultural calendar in autumn.",
      "Usual line: R2 Sud.",
    ),
    ...h2(
      "2. Girona",
      "One of the strongest all-round trips. The Old Quarter, the cathedral, the Jewish Quarter — the Call — the city walls and the colourful houses along the Onyar are all walkable from the station.",
      "Girona is compact enough that the whole day happens on foot, which is exactly what you want without a car.",
    ),
    ...h2(
      "3. Tarragona",
      "Roman Tarragona is an excellent alternative to another beach day. The amphitheatre above the sea, the circus, the walls, the upper town and the Balcó del Mediterrani fill a day comfortably.",
      "The essentials are urban and close together, so nothing requires leaving the city.",
    ),
    ...h2(
      "4. Vic",
      "Take the R3 inland to Vic for its enormous main square, the medieval art museum and one of Catalonia's most distinctive market towns.",
      "The traditional market transforms the visit, so it is worth checking the town's calendar before choosing your day.",
      VIC_R3.en,
    ),
    ...h2(
      "5. Figueres",
      "The obvious choice for the Dalí Theatre-Museum, and an easy one without a car. There is also the toy museum and the vast Sant Ferran fortress if you have time.",
      "Figueres has more than one station depending on the service. Check which train suits you and where it arrives, because the walk into the centre is not the same from each.",
    ),
    ...h2(
      "6. Vilanova i la Geltrú",
      "Often overlooked next to Sitges. Vilanova combines a beach, a promenade, a working town centre and Catalonia's railway museum immediately beside the station.",
      "Usual line: R2 Sud.",
    ),
    ...h2(
      "7. Mataró",
      "A useful mix of Mediterranean waterfront and architecture. Gaudí's early Nau Gaudí is a short walk from the station and is one of his first completed buildings.",
      "Usual line: R1.",
    ),
    ...h2(
      "8. Sant Pol de Mar",
      "A small coastal town where the train practically drops you beside the Mediterranean.",
      "There is no complicated itinerary to build here. You walk, you eat, you look at the sea, you go home.",
    ),
    ...h2(
      "9. Vilafranca del Penedès",
      "A particularly good option for wine culture. VINSEUM sits in the historic centre, a short walk from the railway station.",
      "Usual line: R4.",
    ),
    ...h2(
      "10. Sant Sadurní d'Anoia",
      "Catalonia's cava capital. Several producers run guided visits.",
      "Be precise about this one: **not every winery is walkable from the station**, and almost all of them require booking ahead. Check the actual walking distance and book before you travel.",
      "Usual line: R4.",
    ),
    ...h2(
      "11. Manresa",
      "A less touristy inland city with the basilica of La Seu, a historic centre and Ignatian heritage along the Cardener river.",
      "Manresa is hillier than most places on this list. Still fine on foot, but worth knowing in advance.",
      "Usual line: R4.",
    ),
    ...h2(
      "12. Terrassa",
      "One of the best Modernista alternatives to central Barcelona. MNACTEC occupies a spectacular modernist factory and pairs well with the Masia Freixa and the town centre.",
      "A strong choice in bad weather, since most of the visit is indoors.",
      "Depending on where you start, you can arrive by Rodalies or by FGC.",
    ),
    ...h2(
      "Which day trip is best?",
      "For the sea: Sitges or Sant Pol de Mar.",
      "For history: Tarragona or Girona.",
      "For art: Figueres.",
      "For architecture: Terrassa and Mataró.",
      "For wine: Vilafranca del Penedès and Sant Sadurní d'Anoia.",
      "For a Catalan city with its own life and fewer international visitors: Vic.",
    ),
    ...h2(
      "Before you go",
      "Catalan rail services change temporarily for engineering works and disruption. Check the official journey planner on the day you travel, and do not treat journey times copied from old blog posts as a promise.",
      `Official timetables: [rodalies.gencat.cat](${RODALIES}).`,
      `If you are travelling at the weekend, ${link("weekend", "en", "our weekly listing")} covers what is on. For destinations beyond the obvious, ${link("montserrat", "en", "here are ten that are not Montserrat")}.`,
    ),
    ...relatedBlocks(["montserrat", "medieval", "gaudi", "traps", "weekend"], "en"),
  ];
}

export const TRAINS: FeatureArticle = {
  key: "trains",
  entryKey: "feature-trains-no-car",
  categoryKey: "transport",
  heroKey: "trains-hero",
  secondaryKey: "escapades-tren-catalunya-estacio-paisatge",
  heroAlt: {
    ca: "Trens de Rodalies a l'Estacio de Franca, Barcelona",
    es: "Trenes de Rodalies en la Estacio de Franca, Barcelona",
    en: "Rodalies trains at Estacio de Franca, Barcelona",
  },
  heroCaption: {
    ca: "Trens de Rodalies a l'Estacio de Franca de Barcelona.",
    es: "Trenes de Rodalies en la Estacio de Franca de Barcelona.",
    en: "Rodalies commuter trains at Barcelona's Estacio de Franca.",
  },
  secondaryAlt: {
    ca: "Viatgers baixant del tren en una estació catalana",
    es: "Viajeros bajando del tren en una estación catalana",
    en: "Passengers stepping off a train at a Catalan station",
  },
  secondaryCaption: {
    ca: "Imatge representativa d'una estació de tren a Catalunya. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de una estación de tren en Cataluña. Ilustración generada con inteligencia artificial.",
    en: "Representative image of a railway station in Catalonia. Illustration generated with artificial intelligence.",
  },
  sources: [
    { name: "Horaris de Rodalies de Catalunya", url: RODALIES, publisher: "Generalitat de Catalunya" },
    { name: "Turisme de Barcelona", url: "https://www.barcelonaturisme.com/", publisher: "Turisme de Barcelona" },
    { name: "VINSEUM, Museu de les Cultures del Vi de Catalunya", url: "https://vinseum.cat/", publisher: "VINSEUM" },
    { name: "Nau Gaudí — Col·lecció Bassat", url: "https://visitmataro.cat/ca/nau-gaudi-col-star-leccio-bassat", publisher: "Ajuntament de Mataró" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.trains.ca,
      title: "Catalunya sense cotxe: 12 escapades espectaculars que pots fer en tren",
      seoTitle: "12 escapades per Catalunya que pots fer en tren",
      seoDescription:
        "12 escapades per Catalunya sense cotxe: costa, ciutats medievals, modernisme, vi i paisatge accessibles en tren des de Barcelona.",
      excerpt:
        "Dotze destinacions on, un cop baixes del tren, pots fer tota la visita caminant. Costa, ciutats romanes, modernisme i cultura del vi sense tocar un volant.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.trains.es,
      title: "Cataluña sin coche: 12 escapadas espectaculares que puedes hacer en tren",
      seoTitle: "12 escapadas por Cataluña que puedes hacer en tren",
      seoDescription:
        "12 escapadas por Cataluña sin coche: costa, ciudades históricas, modernismo, vino y paisajes accesibles en tren desde Barcelona.",
      excerpt:
        "Doce destinos donde, al bajar del tren, puedes hacer toda la visita a pie. Costa, ciudades romanas, modernismo y cultura del vino sin coche.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.trains.en,
      title: "12 day trips from Barcelona by train: journey times, fares and what to see",
      seoTitle: "Day trips from Barcelona by train: 12 towns, times, fares",
      seoDescription:
        "12 day trips from Barcelona by train with journey times and fares: Sitges in 31 min, Tarragona in 69, Girona in 40 by high-speed, plus wine and Gaudí.",
      excerpt:
        "Twelve destinations where the whole visit happens on foot once you step off the train — beaches, Roman cities, Modernisme and wine country.",
      blocks: en(),
    },
  },
};
