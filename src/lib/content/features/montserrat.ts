import type { Block } from "@/lib/content/blocks";
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
 * Article 7 — day trips that are not Montserrat.
 *
 * The premise is not that Montserrat is overrated. It is that "day trip from
 * Barcelona" has collapsed into one answer, and the ten below are genuinely
 * different kinds of day. Each entry states plainly whether it works by public
 * transport or really wants a car, because that is the detail that decides
 * whether a reader's day works.
 *
 * Re-checked on 24 October 2026 against the operators and venues themselves:
 * - Lines: FGC station pages (Colònia Güell: S3, S4, S8, S9; Sant Cugat
 *   Centre and Terrassa: S1 from Plaça de Catalunya) and Rodalies' own line
 *   list (R1 per Mataró, R2 Sud per Vilanova, R3 per Vic, R4 per Vilafranca).
 * - Colònia Güell crypt hours and prices: gaudicoloniaguell.org.
 * - Cardona: 90 km, ALSA four times a day, no station (cardonaturisme.cat);
 *   salt-mountain visit price and days (same site).
 * - Nau Gaudí: free, hours (naugaudi.cat).
 * - Railway museum: beside the station, hours, prices (museudelferrocarril.org).
 * - R13: on 24 Oct 2026 Rodalies listed a road replacement between Lleida and
 *   La Plana-Picamoixons, which is the stretch Montblanc sits on, with no end
 *   date; hence "check the notices", not a timetable.
 * Journey times appear only where the venue itself states one (Colònia Güell,
 * Cardona). Everything else gives the line, not a number of minutes.
 */

const RODALIES = "https://rodalies.gencat.cat/ca/horaris/tots-els-horaris/";
const RODALIES_LINES = "https://rodalies.gencat.cat/ca/sobre-rodalies/linies-i-estacions/servei_rodalia_barcelona/";
const RODALIES_HOME = "https://rodalies.gencat.cat/ca/inici/";
const PATRIMONI = "https://patrimoni.gencat.cat/";
const CARDONA = "https://cardonaturisme.cat/planifica/com-arribar";
const CARDONA_SAL = "https://cardonaturisme.cat/activitats/visita-muntanya-sal/";
const COLONIA = "https://gaudicoloniaguell.org/informacion-practica/";
const FGC_COLONIA = "https://www.fgc.cat/en/fgc-network/l-llobregat-anoia/colonia-guell/";
const FGC_SANTCUGAT = "https://www.fgc.cat/en/fgc-network/l-barcelona-valles/sant-cugat-centre/";
const NAU_GAUDI = "https://www.naugaudi.cat/";
const FERROCARRIL = "https://museudelferrocarril.org/visitans/horaris-tarifes-localitzacio.asp";

function ca(): Block[] {
  return [
    lead(
      "Si vols una escapada des de Barcelona que no sigui Montserrat, aquestes deu funcionen: la **Colònia Güell** (uns 20 minuts en tren des de plaça d'Espanya), **Terrassa** i **Sant Cugat** (FGC des de plaça de Catalunya), **Vic**, **Mataró**, **Vilafranca del Penedès** i **Vilanova i la Geltrú** (Rodalies), **Montblanc** (tren regional o cotxe) i **Cardona** i **Rupit**, on el cotxe marca la diferència.",
    ),
    ...paras(
      "Montserrat mereix la fama que té, però «escapada des de Barcelona» s'ha reduït gairebé a una sola resposta. A cada destinació et diem com s'hi va, què hi veuràs i les dades pràctiques que hem pogut comprovar a la font oficial.",
    ),
    table(
      "Les 10 escapades des de Barcelona: com s'hi va i què hi veuràs",
      ["Destinació", "Com s'hi va des de Barcelona", "Què hi veuràs"],
      [
        ["Colònia Güell", "FGC S3, S4, S8 o S9 des de pl. d'Espanya (uns 20 min)", "Cripta de Gaudí i colònia tèxtil"],
        ["Terrassa", "FGC S1 des de pl. de Catalunya", "Esglésies de Sant Pere, mNACTEC, Masia Freixa"],
        ["Vic", "Rodalies R3", "Plaça Major, catedral, Museu d'Art Medieval"],
        ["Cardona", "Cotxe (90 km) o bus ALSA", "Castell i Muntanya de Sal"],
        ["Mataró", "Rodalies R1", "Mar i la Nau Gaudí"],
        ["Sant Cugat del Vallès", "FGC S1 o S2 des de pl. de Catalunya", "Monestir i claustre romànic"],
        ["Vilafranca del Penedès", "Rodalies R4", "Centre històric i VINSEUM"],
        ["Montblanc", "Cotxe, o tren regional R13 (pocs trens)", "Vila emmurallada"],
        ["Rupit i el Collsacabra", "Cotxe", "Poble de pedra i cingles"],
        ["Vilanova i la Geltrú", "Rodalies R2 Sud", "Platja i Museu del Ferrocarril"],
      ],
      "Línies comprovades a FGC i Rodalies el 24 d'octubre de 2026. Consulta l'horari del dia abans de sortir.",
    ),
    ...h2(
      "1. Colònia Güell: la cripta de Gaudí a 20 minuts",
      "A Santa Coloma de Cervelló, la colònia industrial que Eusebi Güell va fer construir és una de les escapades més ben resoltes des de Barcelona: s'hi arriba en tren, és compacta i té la cripta de Gaudí com a peça central.",
      `**Com s'hi va:** a l'estació Colònia Güell hi paren les línies S3, S4, S8 i S9 de FGC, que surten de plaça d'Espanya; el recinte diu que és «a 20 minuts de Barcelona en tren». **Horari de la cripta:** de dilluns a divendres de 10 a 17 h; dissabtes, diumenges i festius de 10 a 15 h. Tanca l'1 i el 6 de gener, el diumenge de Rams, el Divendres Sant i el 25 i el 26 de desembre. **Entrada:** 10 € amb audioguia; el Combinat Güell (tren d'anada i tornada, entrada i audioguia) costa 15,80 €. Font: [gaudicoloniaguell.org](${COLONIA}).`,
      `És la millor manera d'entendre alhora l'arquitectura de Gaudí i el model de colònia tèxtil catalana. ${link("gaudi", "ca", "En parlem amb detall a les obres menys conegudes de Gaudí")}.`,
    ),
    ...h2(
      "2. Terrassa",
      "El conjunt monumental de les esglésies de Sant Pere és patrimoni visigòtic i romànic de primer nivell, i el mNACTEC ocupa una fàbrica modernista espectacular. Afegeix-hi la Masia Freixa i tens una jornada completa que, a més, funciona amb mal temps.",
      "**Com s'hi va:** la línia S1 de FGC va de plaça de Catalunya a Terrassa.",
    ),
    ...h2(
      "3. Vic",
      "Una ciutat amb vida pròpia i molt menys turisme internacional que altres destinacions d'aquesta llista. La Plaça Major, el centre històric, la catedral i el Museu d'Art Medieval s'encadenen a peu. Si coincideix amb dia de mercat, la visita canvia completament de caràcter.",
      `**Com s'hi va:** Rodalies R3, la línia de L'Hospitalet de Llobregat a Puigcerdà. Rodalies hi anuncia modificacions de servei: mira els avisos a [rodalies.gencat.cat](${RODALIES_HOME}) abans de sortir.`,
    ),
    ...h2(
      "4. Cardona: castell i Muntanya de Sal",
      "El castell sobre el turó i la Muntanya de Sal fan de Cardona una de les escapades més singulars de Catalunya: una mina de sal visitable sota una fortalesa medieval.",
      `**Com s'hi va:** Cardona no té estació de tren. Són 90 km per la C-16 i la C-55, a «poc més d'una hora» de Barcelona, i hi ha una línia regular d'ALSA (la de Barcelona a Andorra) amb quatre freqüències diàries. Font: [cardonaturisme.cat](${CARDONA}).`,
      `**La Muntanya de Sal:** visites guiades de dimarts a diumenge; l'entrada d'adult costa 12,75 €. Cal arribar 30 minuts abans i el casc és obligatori. Font: [Cardona Turisme](${CARDONA_SAL}). És també on se celebra la fira de bolets de tardor: ${link("foodfairs", "ca", "la tenim a la guia de fires gastronòmiques")}.`,
    ),
    ...h2(
      "5. Mataró: mar i la primera obra de Gaudí",
      "Mar, centre urbà i la Nau Gaudí, que el mateix equipament presenta com el primer edifici de Gaudí. És l'escapada més curta de la llista i funciona molt bé com a mitja jornada.",
      `**Com s'hi va:** Rodalies R1. **Nau Gaudí:** entrada gratuïta; de dimarts a divendres de 17 a 20 h, dissabtes d'11 a 14 h i de 17 a 20 h, diumenges i festius d'11 a 14 h; dilluns tancat. Font: [naugaudi.cat](${NAU_GAUDI}).`,
    ),
    ...h2(
      "6. Sant Cugat del Vallès",
      "El monestir de Sant Cugat té un dels claustres romànics més notables de Catalunya. És la millor opció quan tens mitja tarda i no vols perdre-la en desplaçaments.",
      `**Com s'hi va:** a Sant Cugat Centre hi paren les línies S1 i S2 de FGC, que surten de plaça de Catalunya. Font: [FGC](${FGC_SANTCUGAT}).`,
    ),
    ...h2(
      "7. Vilafranca del Penedès",
      "Capital del Penedès i seu del VINSEUM. La combinació de centre històric compacte i cultura del vi la fa especialment fàcil de resoldre en un dia.",
      "**Com s'hi va:** Rodalies R4.",
    ),
    ...h2(
      "8. Montblanc",
      "Una de les viles emmurallades més ben conservades de Catalunya. Si el que et crida de Montserrat és la monumentalitat, aquesta és una alternativa d'un altre ordre: medieval, urbana i recorrible a peu.",
      `Encaixa amb ${link("medieval", "ca", "la nostra ruta de pobles medievals")}.`,
      `**Com s'hi va:** el cotxe dona més marge, i permet combinar-hi Poblet o Santes Creus. En tren hi para la R13, amb poques circulacions al dia; el 24 d'octubre de 2026 Rodalies tenia publicat un servei alternatiu per carretera entre Lleida i la Plana-Picamoixons, el tram on és Montblanc. Comprova-ho als [avisos de Rodalies](${RODALIES_HOME}).`,
    ),
    ...h2(
      "9. Rupit i el Collsacabra",
      "Pedra, cingles, pont penjant i un dels paisatges més característics de la Catalunya interior. És l'escapada més «de natura» de la llista.",
      "**Com s'hi va:** en cotxe. No hi arriba el tren, i és la destinació d'aquesta llista on el vehicle propi és més clarament la millor opció.",
    ),
    ...h2(
      "10. Vilanova i la Geltrú",
      "Platja, rambla i el Museu del Ferrocarril de Catalunya just al costat de l'estació. És la manera de tenir mar sense la concentració de visitants de Sitges.",
      `**Com s'hi va:** Rodalies R2 Sud. **Museu del Ferrocarril:** de dimarts a diumenge de 10 a 14.30 h, i els dissabtes també de 16 a 19 h (a l'estiu canvia). Entrada general, 8,50 €; el bitllet combinat amb el tren de Rodalies costa 13,50 €. Font: [museudelferrocarril.org](${FERROCARRIL}).`,
    ),
    ...h2(
      "Quina escapada triar segons el dia que vols",
      "Si vols arquitectura: Colònia Güell o Terrassa. Si vols una ciutat viva: Vic. Si vols alguna cosa que no s'assembli a res: Cardona. Si vols mar: Mataró o Vilanova i la Geltrú. Si vols Edat Mitjana: Montblanc. Si vols paisatge: Rupit.",
      "Si no tens cotxe, les set primeres opcions en tren (Colònia Güell, Terrassa, Sant Cugat, Vic, Mataró, Vilafranca i Vilanova) són les més segures.",
      `Totes les que es fan en tren surten desenvolupades a ${link("trains", "ca", "la nostra guia d'escapades sense cotxe")}, amb les línies i el que cal comprovar abans de sortir. Horaris: [rodalies.gencat.cat](${RODALIES}). I si el dia es posa malament, ${link("rainy", "ca", "aquí tens plans per quan plou")}.`,
    ),
    callout(
      "info",
      "Abans de sortir",
      `Les línies d'aquesta guia són les que publiquen FGC i Rodalies ([línies de Rodalies](${RODALIES_LINES})), comprovades el 24 d'octubre de 2026. Horaris i preus canvien: consulta la font oficial el mateix dia.`,
    ),
    ...relatedBlocks(["trains", "medieval", "surprising", "gaudi", "rainy"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "Si quieres una escapada desde Barcelona que no sea Montserrat, estas diez funcionan: la **Colònia Güell** (unos 20 minutos en tren desde plaza de España), **Terrassa** y **Sant Cugat** (FGC desde plaza de Catalunya), **Vic**, **Mataró**, **Vilafranca del Penedès** y **Vilanova i la Geltrú** (Rodalies), **Montblanc** (tren regional o coche) y **Cardona** y **Rupit**, donde el coche marca la diferencia.",
    ),
    ...paras(
      "Montserrat merece la fama que tiene, pero «escapada desde Barcelona» se ha reducido casi a una sola respuesta. En cada destino te decimos cómo llegar, qué verás y los datos prácticos que hemos podido comprobar en la fuente oficial.",
    ),
    table(
      "Las 10 escapadas desde Barcelona: cómo llegar y qué ver",
      ["Destino", "Cómo llegar desde Barcelona", "Qué verás"],
      [
        ["Colònia Güell", "FGC S3, S4, S8 o S9 desde pl. España (unos 20 min)", "Cripta de Gaudí y colonia textil"],
        ["Terrassa", "FGC S1 desde pl. Catalunya", "Iglesias de Sant Pere, mNACTEC, Masia Freixa"],
        ["Vic", "Rodalies R3", "Plaça Major, catedral, Museu d'Art Medieval"],
        ["Cardona", "Coche (90 km) o bus ALSA", "Castillo y Montaña de Sal"],
        ["Mataró", "Rodalies R1", "Mar y la Nau Gaudí"],
        ["Sant Cugat del Vallès", "FGC S1 o S2 desde pl. Catalunya", "Monasterio y claustro románico"],
        ["Vilafranca del Penedès", "Rodalies R4", "Casco histórico y VINSEUM"],
        ["Montblanc", "Coche, o tren regional R13 (pocos trenes)", "Villa amurallada"],
        ["Rupit y el Collsacabra", "Coche", "Pueblo de piedra y riscos"],
        ["Vilanova i la Geltrú", "Rodalies R2 Sud", "Playa y Museo del Ferrocarril"],
      ],
      "Líneas comprobadas en FGC y Rodalies el 24 de octubre de 2026. Consulta el horario del día antes de salir.",
    ),
    ...h2(
      "1. Colònia Güell: la cripta de Gaudí a 20 minutos",
      "En Santa Coloma de Cervelló, la colonia industrial que Eusebi Güell mandó construir es una de las escapadas mejor resueltas desde Barcelona: se llega en tren, es compacta y tiene la cripta de Gaudí como pieza central.",
      `**Cómo llegar:** en la estación Colònia Güell paran las líneas S3, S4, S8 y S9 de FGC, que salen de plaza de España; el recinto dice que está «a 20 minutos de Barcelona en tren». **Horario de la cripta:** de lunes a viernes de 10:00 a 17:00; sábados, domingos y festivos de 10:00 a 15:00. Cierra el 1 y el 6 de enero, el Domingo de Ramos, el Viernes Santo y el 25 y el 26 de diciembre. **Entrada:** 10 € con audioguía; el Combinat Güell (tren de ida y vuelta, entrada y audioguía) cuesta 15,80 €. Fuente: [gaudicoloniaguell.org](${COLONIA}).`,
      `Es la mejor forma de entender a la vez la arquitectura de Gaudí y el modelo de colonia textil catalana. ${link("gaudi", "es", "Hablamos de ella en detalle en las obras menos conocidas de Gaudí")}.`,
    ),
    ...h2(
      "2. Terrassa",
      "El conjunto monumental de las iglesias de Sant Pere es patrimonio visigótico y románico de primer nivel, y el mNACTEC ocupa una fábrica modernista espectacular. Con la Masia Freixa tienes una jornada completa que además funciona con mal tiempo.",
      "**Cómo llegar:** la línea S1 de FGC va de plaza de Catalunya a Terrassa.",
    ),
    ...h2(
      "3. Vic",
      "Una ciudad con vida propia y mucho menos turismo internacional. Plaça Major, casco histórico, catedral y Museu d'Art Medieval se encadenan a pie. Si coincide con día de mercado, la visita cambia por completo.",
      `**Cómo llegar:** Rodalies R3, la línea de L'Hospitalet de Llobregat a Puigcerdà. Rodalies anuncia modificaciones de servicio en ella: mira los avisos en [rodalies.gencat.cat](${RODALIES_HOME}) antes de salir.`,
    ),
    ...h2(
      "4. Cardona: castillo y Montaña de Sal",
      "El castillo sobre el cerro y la Montaña de Sal hacen de Cardona una de las escapadas más singulares de Cataluña: una mina de sal visitable bajo una fortaleza medieval.",
      `**Cómo llegar:** Cardona no tiene estación de tren. Son 90 km por la C-16 y la C-55, a «poco más de una hora» de Barcelona, y hay una línea regular de ALSA (la de Barcelona a Andorra) con cuatro frecuencias diarias. Fuente: [cardonaturisme.cat](${CARDONA}).`,
      `**La Montaña de Sal:** visitas guiadas de martes a domingo; la entrada de adulto cuesta 12,75 €. Hay que llegar 30 minutos antes y el casco es obligatorio. Fuente: [Cardona Turisme](${CARDONA_SAL}). Aquí se celebra también la feria de setas de otoño: ${link("foodfairs", "es", "está en nuestra guía de ferias gastronómicas")}.`,
    ),
    ...h2(
      "5. Mataró: mar y la primera obra de Gaudí",
      "Mar, centro urbano y la Nau Gaudí, que el propio equipamiento presenta como el primer edificio de Gaudí. Es la escapada más corta de la lista y funciona como media jornada.",
      `**Cómo llegar:** Rodalies R1. **Nau Gaudí:** entrada gratuita; de martes a viernes de 17:00 a 20:00, sábados de 11:00 a 14:00 y de 17:00 a 20:00, domingos y festivos de 11:00 a 14:00; lunes cerrado. Fuente: [naugaudi.cat](${NAU_GAUDI}).`,
    ),
    ...h2(
      "6. Sant Cugat del Vallès",
      "El monasterio de Sant Cugat tiene uno de los claustros románicos más notables de Cataluña. La mejor opción cuando tienes media tarde.",
      `**Cómo llegar:** en Sant Cugat Centre paran las líneas S1 y S2 de FGC, que salen de plaza de Catalunya. Fuente: [FGC](${FGC_SANTCUGAT}).`,
    ),
    ...h2(
      "7. Vilafranca del Penedès",
      "Capital del Penedès y sede del VINSEUM. Centro histórico compacto y cultura del vino: fácil de resolver en un día.",
      "**Cómo llegar:** Rodalies R4.",
    ),
    ...h2(
      "8. Montblanc",
      "Una de las villas amuralladas mejor conservadas de Cataluña. Si lo que te atrae de Montserrat es la monumentalidad, esta es una alternativa de otro orden: medieval, urbana y para recorrer a pie.",
      `Encaja con ${link("medieval", "es", "nuestra ruta de pueblos medievales")}.`,
      `**Cómo llegar:** el coche da más margen y permite combinarlo con Poblet o Santes Creus. En tren para la R13, con pocas circulaciones al día; el 24 de octubre de 2026 Rodalies tenía publicado un servicio alternativo por carretera entre Lleida y La Plana-Picamoixons, el tramo donde está Montblanc. Compruébalo en los [avisos de Rodalies](${RODALIES_HOME}).`,
    ),
    ...h2(
      "9. Rupit y el Collsacabra",
      "Piedra, riscos, puente colgante y uno de los paisajes más característicos de la Cataluña interior. Es la escapada más de naturaleza de la lista.",
      "**Cómo llegar:** en coche. No llega el tren, y es el destino de esta lista donde el vehículo propio es más claramente la mejor opción.",
    ),
    ...h2(
      "10. Vilanova i la Geltrú",
      "Playa, rambla y el Museo del Ferrocarril de Cataluña junto a la estación. La forma de tener mar sin la concentración de visitantes de Sitges.",
      `**Cómo llegar:** Rodalies R2 Sud. **Museo del Ferrocarril:** de martes a domingo de 10:00 a 14:30, y los sábados también de 16:00 a 19:00 (en verano cambia). Entrada general, 8,50 €; el billete combinado con el tren de Rodalies cuesta 13,50 €. Fuente: [museudelferrocarril.org](${FERROCARRIL}).`,
    ),
    ...h2(
      "Qué escapada elegir según el día que quieres",
      "Arquitectura: Colònia Güell o Terrassa. Ciudad viva: Vic. Algo que no se parece a nada: Cardona. Mar: Mataró o Vilanova. Edad Media: Montblanc. Paisaje: Rupit.",
      "Sin coche, las siete opciones en tren (Colònia Güell, Terrassa, Sant Cugat, Vic, Mataró, Vilafranca y Vilanova) son las más seguras.",
      `Todas las que se hacen en tren están desarrolladas en ${link("trains", "es", "nuestra guía de escapadas sin coche")}. Horarios: [rodalies.gencat.cat](${RODALIES}). Y si el día se tuerce, ${link("rainy", "es", "aquí tienes planes para cuando llueve")}.`,
    ),
    callout(
      "info",
      "Antes de salir",
      `Las líneas de esta guía son las que publican FGC y Rodalies ([líneas de Rodalies](${RODALIES_LINES})), comprobadas el 24 de octubre de 2026. Horarios y precios cambian: consulta la fuente oficial el mismo día.`,
    ),
    ...relatedBlocks(["trains", "medieval", "surprising", "gaudi", "rainy"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "For a day trip from Barcelona that is not Montserrat, these ten work: **Colònia Güell** (about 20 minutes by train from Plaça d'Espanya), **Terrassa** and **Sant Cugat** (FGC from Plaça de Catalunya), **Vic**, **Mataró**, **Vilafranca del Penedès** and **Vilanova i la Geltrú** (Rodalies commuter trains), **Montblanc** (regional train or car), and **Cardona** and **Rupit**, where a car makes the real difference.",
    ),
    ...paras(
      "Montserrat deserves its reputation, but \"day trip from Barcelona\" has collapsed into a single answer. For each place we give how to get there, what you will see, and the practical details we could check against the official source.",
    ),
    table(
      "10 day trips from Barcelona: how to get there and what you will see",
      ["Destination", "How to get there from Barcelona", "What you will see"],
      [
        ["Colònia Güell", "FGC S3, S4, S8 or S9 from Pl. Espanya (about 20 min)", "Gaudí's crypt and a textile colony"],
        ["Terrassa", "FGC S1 from Pl. Catalunya", "Sant Pere churches, mNACTEC, Masia Freixa"],
        ["Vic", "Rodalies R3", "Plaça Major, cathedral, medieval art museum"],
        ["Cardona", "Car (90 km) or ALSA bus", "Castle and Salt Mountain"],
        ["Mataró", "Rodalies R1", "The sea and the Nau Gaudí"],
        ["Sant Cugat del Vallès", "FGC S1 or S2 from Pl. Catalunya", "Monastery and Romanesque cloister"],
        ["Vilafranca del Penedès", "Rodalies R4", "Old town and VINSEUM wine museum"],
        ["Montblanc", "Car, or R13 regional train (few trains)", "Walled medieval town"],
        ["Rupit and the Collsacabra", "Car", "Stone village and cliffs"],
        ["Vilanova i la Geltrú", "Rodalies R2 Sud", "Beach and railway museum"],
      ],
      "Lines checked with FGC and Rodalies on 24 October 2026. Check the timetable for your day before leaving.",
    ),
    ...h2(
      "1. Colònia Güell: Gaudí's crypt, 20 minutes away",
      "In Santa Coloma de Cervelló, the industrial village Eusebi Güell had built is one of the most neatly solved trips from Barcelona: reachable by train, compact, and centred on Gaudí's crypt.",
      `**Getting there:** FGC lines S3, S4, S8 and S9 from Plaça d'Espanya stop at Colònia Güell station; the site describes itself as "20 minutes from Barcelona by train". **Crypt hours:** Monday to Friday 10:00 to 17:00; Saturdays, Sundays and holidays 10:00 to 15:00. Closed 1 and 6 January, Palm Sunday, Good Friday, and 25 and 26 December. **Tickets:** €10 with audio guide; the Combinat Güell (return train, entry and audio guide) is €15.80. Source: [gaudicoloniaguell.org](${COLONIA}).`,
      `It is the best way to understand Gaudí's engineering and the Catalan textile-colony model at the same time. ${link("gaudi", "en", "We cover it in our lesser-known Gaudí guide")}.`,
    ),
    ...h2(
      "2. Terrassa",
      "The Sant Pere churches are first-rate Visigothic and Romanesque heritage, and mNACTEC, the science and technology museum, occupies a spectacular modernist factory. Add the Masia Freixa and you have a full day that also works in bad weather.",
      "**Getting there:** FGC line S1 runs from Plaça de Catalunya to Terrassa.",
    ),
    ...h2(
      "3. Vic",
      "A working Catalan city with far fewer international visitors. The enormous main square, the historic centre, the cathedral and the medieval art museum all connect on foot. If your visit lands on a market day, it becomes a different trip entirely.",
      `**Getting there:** Rodalies R3, the L'Hospitalet de Llobregat to Puigcerdà line. Rodalies lists service changes on it, so check the notices at [rodalies.gencat.cat](${RODALIES_HOME}) before you go.`,
    ),
    ...h2(
      "4. Cardona: castle and Salt Mountain",
      "A castle on a hill and a salt mountain you can go inside: Cardona is one of the strangest and best days out in Catalonia. The salt mine sits beneath a medieval fortress.",
      `**Getting there:** Cardona has no railway station. It is 90 km by the C-16 and C-55, "a little over an hour" from Barcelona, and ALSA's regular Barcelona to Andorra line calls four times a day. Source: [cardonaturisme.cat](${CARDONA}).`,
      `**The Salt Mountain:** guided visits Tuesday to Sunday; adult tickets are €12.75. Arrive 30 minutes early; helmets are compulsory. Source: [Cardona Turisme](${CARDONA_SAL}). Cardona also hosts an autumn mushroom fair: ${link("foodfairs", "en", "see our autumn food festivals guide")}.`,
    ),
    ...h2(
      "5. Mataró: the sea and Gaudí's first building",
      "Sea, town centre, and the Nau Gaudí, which the venue itself presents as Gaudí's first building. The shortest trip here, and a good half-day.",
      `**Getting there:** Rodalies R1. **Nau Gaudí:** free entry; Tuesday to Friday 17:00 to 20:00, Saturday 11:00 to 14:00 and 17:00 to 20:00, Sundays and holidays 11:00 to 14:00; closed Mondays. Source: [naugaudi.cat](${NAU_GAUDI}).`,
    ),
    ...h2(
      "6. Sant Cugat del Vallès",
      "The monastery has one of Catalonia's finest Romanesque cloisters. The right choice when you have half an afternoon and do not want to spend it travelling.",
      `**Getting there:** FGC lines S1 and S2 from Plaça de Catalunya stop at Sant Cugat Centre. Source: [FGC](${FGC_SANTCUGAT}).`,
    ),
    ...h2(
      "7. Vilafranca del Penedès",
      "The capital of the Penedès wine region and home to VINSEUM. A compact historic centre plus wine culture makes it easy to resolve in a day.",
      "**Getting there:** Rodalies R4.",
    ),
    ...h2(
      "8. Montblanc",
      "One of the best-preserved walled towns in Catalonia. If what draws you to Montserrat is scale, this is scale of an entirely different kind: medieval, urban, and walkable.",
      `It fits with ${link("medieval", "en", "our medieval villages guide")}.`,
      `**Getting there:** a car gives you room to add the Poblet or Santes Creus monasteries. The R13 regional train stops here but runs few services a day, and on 24 October 2026 Rodalies was listing a road replacement service between Lleida and La Plana-Picamoixons, the stretch Montblanc is on. Check the [Rodalies notices](${RODALIES_HOME}).`,
    ),
    ...h2(
      "9. Rupit and the Collsacabra",
      "Stone houses, cliffs, a suspension footbridge and one of the most characteristic landscapes of inland Catalonia. The most nature-led trip on this list.",
      "**Getting there:** by car. There is no train, and this is the trip on the list where your own vehicle is most clearly the right choice.",
    ),
    ...h2(
      "10. Vilanova i la Geltrú",
      "A beach, a promenade and the Catalan Railway Museum right beside the station — the way to get the sea without Sitges's crowds.",
      `**Getting there:** Rodalies R2 Sud. **Railway Museum:** Tuesday to Sunday 10:00 to 14:30, and on Saturdays also 16:00 to 19:00 (summer hours differ). General admission €8.50; the combined ticket with the Rodalies train is €13.50. Source: [museudelferrocarril.org](${FERROCARRIL}).`,
    ),
    ...h2(
      "Which day trip to choose",
      "Architecture: Colònia Güell or Terrassa. A living city: Vic. Something unlike anywhere else: Cardona. The sea: Mataró or Vilanova. The Middle Ages: Montblanc. Landscape: Rupit.",
      "Without a car, the seven train options (Colònia Güell, Terrassa, Sant Cugat, Vic, Mataró, Vilafranca and Vilanova) are the safest bets.",
      `Every trip here that works by rail is covered in ${link("trains", "en", "our car-free day trips guide")}, with lines and what to check before you leave. Timetables: [rodalies.gencat.cat](${RODALIES}). If the weather turns, ${link("rainy", "en", "here are rainy-day plans")}.`,
    ),
    callout(
      "info",
      "Before you go",
      `The lines in this guide are those published by FGC and Rodalies ([Rodalies lines](${RODALIES_LINES})), checked on 24 October 2026. Timetables and prices change: check the official source on the day.`,
    ),
    ...paras(`Heritage records for most of these sites: [patrimoni.gencat.cat](${PATRIMONI}).`),
    ...relatedBlocks(["trains", "medieval", "surprising", "gaudi", "rainy"], "en"),
  ];
}

export const MONTSERRAT: FeatureArticle = {
  key: "montserrat",
  entryKey: "feature-beyond-montserrat",
  categoryKey: "cities",
  heroKey: "montserrat-hero",
  secondaryKey: "montserrat-second",
  heroAlt: {
    ca: "El castell de Cardona, al Bages",
    es: "El castillo de Cardona, en el Bages",
    en: "Cardona castle, in the Bages",
  },
  heroCaption: {
    ca: "El castell de Cardona, sobre el turo que domina la vila.",
    es: "El castillo de Cardona, sobre el cerro que domina la villa.",
    en: "Cardona castle on the hill above the town.",
  },
  secondaryAlt: {
    ca: "La Placa Major de Vic",
    es: "La Placa Major de Vic",
    en: "The main square of Vic",
  },
  secondaryCaption: {
    ca: "La Placa Major de Vic, on se celebra el mercat tradicional.",
    es: "La Placa Major de Vic, donde se celebra el mercado tradicional.",
    en: "Vic's main square, home to its traditional market.",
  },
  sources: [
    { name: "Línies de Rodalies de Barcelona", url: RODALIES_LINES, publisher: "Rodalies de Catalunya" },
    { name: "Horaris de Rodalies de Catalunya", url: RODALIES, publisher: "Rodalies de Catalunya" },
    { name: "Estació Colònia Güell", url: FGC_COLONIA, publisher: "FGC" },
    { name: "Estació Sant Cugat Centre", url: FGC_SANTCUGAT, publisher: "FGC" },
    { name: "Cripta Gaudí, Colònia Güell: informació pràctica", url: COLONIA, publisher: "Colònia Güell" },
    { name: "Com arribar a Cardona", url: CARDONA, publisher: "Cardona Turisme" },
    { name: "Visita a la Muntanya de Sal", url: CARDONA_SAL, publisher: "Cardona Turisme" },
    { name: "Nau Gaudí", url: NAU_GAUDI, publisher: "Nau Gaudí" },
    { name: "Museu del Ferrocarril de Catalunya: horaris i tarifes", url: FERROCARRIL, publisher: "Museu del Ferrocarril de Catalunya" },
    { name: "Patrimoni Cultural de Catalunya", url: PATRIMONI, publisher: "Generalitat de Catalunya" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.montserrat.ca,
      title: "Escapades des de Barcelona més enllà de Montserrat: 10 idees i com arribar-hi",
      seoTitle: "Escapades des de Barcelona: 10 alternatives a Montserrat",
      seoDescription:
        "Deu escapades des de Barcelona que no són Montserrat: Colònia Güell, Vic, Cardona, Montblanc, Rupit i més, amb el tren o el cotxe que funciona per a cadascuna.",
      excerpt:
        "Deu escapades des de Barcelona que no són Montserrat, amb la línia de tren o la carretera que funciona per a cadascuna i les dades pràctiques comprovades.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.montserrat.es,
      title: "Escapadas desde Barcelona más allá de Montserrat: 10 ideas y cómo llegar",
      seoTitle: "Escapadas desde Barcelona: 10 alternativas a Montserrat",
      seoDescription:
        "Diez escapadas desde Barcelona que no son Montserrat: Colònia Güell, Vic, Cardona, Montblanc, Rupit y más, con el tren o el coche que funciona en cada caso.",
      excerpt:
        "Diez escapadas desde Barcelona que no son Montserrat, con la línea de tren o la carretera que funciona en cada caso y los datos prácticos comprobados.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.montserrat.en,
      title: "10 day trips from Barcelona beyond Montserrat, and how to get there",
      seoTitle: "10 day trips from Barcelona beyond Montserrat",
      seoDescription:
        "Ten day trips from Barcelona that are not Montserrat: Colònia Güell, Vic, Cardona, Montblanc, Rupit and more, with the train or road that works for each.",
      excerpt:
        "Ten day trips from Barcelona that are not Montserrat, each with the train line or road that actually works and practical details checked at the source.",
      blocks: en(),
    },
  },
};
