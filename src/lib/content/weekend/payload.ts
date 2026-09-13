/**
 * Editorial payload for the weekend guide of 19-20 September 2026.
 *
 * The text here was written and supplied by the editorial team. Nothing in this
 * file is generated: prices, times, editions and official URLs are transcribed
 * verbatim from what was handed over, and fields the team did not supply are
 * left empty rather than filled in.
 *
 * The URLs are deliberately evergreen (no date in the path) so the same three
 * pages are updated each week instead of accumulating a new set of URLs.
 */

import type { Locale } from "@/lib/i18n/config";

export interface Plan {
  /** Heading shown for the plan, per locale. */
  title: Record<Locale, string>;
  /** Body paragraphs, per locale. Inline markdown subset only. */
  body: Record<Locale, string[]>;
  /** Official page for the event. Empty when the team did not supply one. */
  url?: string;
  /** Summary-table row. Empty strings mean "not supplied" and stay empty. */
  row: {
    municipality: string;
    dates: Record<Locale, string>;
    category: Record<Locale, string>;
    price: Record<Locale, string>;
  };
}

const CAT = {
  popular: { ca: "Cultura popular", es: "Cultura popular", en: "Popular culture" },
  music: { ca: "Música", es: "Música", en: "Music" },
  sport: { ca: "Esport", es: "Deporte", en: "Sport" },
  nature: { ca: "Natura", es: "Naturaleza", en: "Nature" },
  food: { ca: "Gastronomia", es: "Gastronomía", en: "Food" },
  fair: { ca: "Fira", es: "Feria", en: "Fair" },
  stage: { ca: "Arts escèniques", es: "Artes escénicas", en: "Performing arts" },
  culture: { ca: "Cultura", es: "Cultura", en: "Culture" },
  art: { ca: "Art", es: "Arte", en: "Art" },
  festa: { ca: "Festa major", es: "Fiesta mayor", en: "Local festival" },
  motor: { ca: "Motor", es: "Motor", en: "Motoring" },
  family: { ca: "Famílies", es: "Familias", en: "Families" },
  sea: { ca: "Cultura marinera", es: "Cultura marinera", en: "Maritime culture" },
} as const;

const D = {
  sat: { ca: "19 set", es: "19 sept", en: "Sep 19" },
  sun: { ca: "20 set", es: "20 sept", en: "Sep 20" },
  weekend: { ca: "19–20 set", es: "19–20 sept", en: "Sep 19–20" },
  from18: { ca: "18–20 set", es: "18–20 sept", en: "Sep 18–20" },
  from17: { ca: "17–20 set", es: "17–20 sept", en: "Sep 17–20" },
  until20: { ca: "Fins al 20 set", es: "Hasta el 20 sept", en: "Until Sep 20" },
} as const;

const NO_PRICE = { ca: "", es: "", en: "" };
const FREE = { ca: "Gratuït", es: "Gratuito", en: "Free" };

export const PLANS: Plan[] = [
  {
    title: {
      ca: "Viure Santa Tecla a Tarragona",
      es: "Vivir Santa Tecla en Tarragona",
      en: "Experience Santa Tecla in Tarragona",
    },
    body: {
      ca: [
        "És la proposta més potent del cap de setmana si busques cultura popular. Dissabte hi ha Santa Tecla Petita, folklore, música i activitats durant tot el dia; diumenge a les **11.15 h** arriba la diada castellera del Primer Diumenge.",
      ],
      es: [
        "Es probablemente el plan más completo del fin de semana para descubrir cultura popular catalana.",
        "El sábado concentra actividades familiares, música y tradición, mientras que el domingo a las **11:15 h** llega la diada castellera del Primer Diumenge.",
      ],
      en: [
        "For international visitors, this is arguably the weekend's most complete introduction to Catalan popular culture.",
        "Saturday brings traditional performances, family activities and celebrations, while Sunday includes a major **castells**, or human-tower, gathering at **11:15 am**.",
      ],
    },
    url: "https://www.tarragona.cat/cultura/festes-i-cultura-popular/santa-tecla/",
    row: {
      municipality: "Tarragona",
      dates: D.weekend,
      category: CAT.popular,
      price: NO_PRICE,
    },
  },
  {
    title: {
      ca: "Fer nit musical a Vic",
      es: "Pasar una noche musical en Vic",
      en: "Spend Saturday night at the Mercat de Música Viva de Vic",
    },
    body: {
      ca: [
        "El Mercat de Música Viva de Vic arriba al tram final de la seva 38a edició. Dissabte hi ha una forta concentració de concerts repartits per diferents escenaris de la ciutat, molts dels quals gratuïts.",
      ],
      es: [
        "El Mercat de Música Viva de Vic llega al tramo final de su 38ª edición.",
        "El sábado concentra numerosos conciertos repartidos por diferentes espacios de la ciudad, con una presencia importante de propuestas gratuitas.",
      ],
      en: [
        "Vic's annual live-music market reaches the final stretch of its 38th edition.",
        "Saturday brings a particularly strong concentration of concerts across indoor and outdoor venues, including a number of free performances.",
      ],
    },
    url: "https://www.mmvv.cat/",
    row: {
      municipality: "Vic",
      dates: D.weekend,
      category: CAT.music,
      price: { ca: "Molts concerts gratuïts", es: "Muchos conciertos gratuitos", en: "Many concerts free" },
    },
  },
  {
    title: {
      ca: "Entrar al món de la bici a Sea Otter Europe",
      es: "Entrar en el mundo de la bici en Sea Otter Europe",
      en: "Try the latest bikes at Sea Otter Europe in Girona",
    },
    body: {
      ca: [
        "Del 18 al 20 de setembre, Fontajau acull una gran zona d'exposició, competicions, proves de bicicletes i curses internacionals.",
        "**L'entrada general al festival és gratuïta.**",
      ],
      es: [
        "Del 18 al 20 de septiembre, Fontajau acoge una gran zona de exposición, competiciones, pruebas de bicicletas y carreras internacionales.",
        "**La entrada general es gratuita.**",
      ],
      en: [
        "Girona is one of Europe's best-known cycling destinations, and from September 18–20 Fontajau hosts a major bike expo, races and bike-testing opportunities.",
        "**General admission is free.**",
      ],
    },
    url: "https://www.seaottereurope.com/",
    row: { municipality: "Girona", dates: D.from18, category: CAT.sport, price: FREE },
  },
  {
    title: {
      ca: "Descobrir el Delta Birding Festival",
      es: "Descubrir el Delta Birding Festival",
      en: "Go birding in the Ebro Delta",
    },
    body: {
      ca: [
        "MónNatura Delta acull més d'un centenar d'activitats entre xerrades, tallers, sortides guiades, fotografia i observació d'aus.",
        "L'entrada general costa **8 € dissabte i 5 € diumenge**. Algunes activitats especials es paguen a part.",
      ],
      es: [
        "MónNatura Delta acoge más de un centenar de propuestas entre charlas, talleres, salidas guiadas, fotografía y observación de aves.",
        "La entrada general cuesta **8 € el sábado y 5 € el domingo**.",
      ],
      en: [
        "The Delta Birding Festival at MónNatura Delta offers more than 100 talks, workshops, guided outings, photography sessions and family activities.",
        "General admission is **€8 on Saturday and €5 on Sunday**.",
      ],
    },
    url: "https://deltabirdingfestival.com/",
    row: {
      municipality: "MónNatura Delta",
      dates: D.weekend,
      category: CAT.nature,
      price: { ca: "8 € ds · 5 € dg", es: "8 € sáb · 5 € dom", en: "€8 Sat · €5 Sun" },
    },
  },
  {
    title: {
      ca: "Veure com se segava l'arròs a la Ràpita",
      es: "Ver cómo se segaba tradicionalmente el arroz en La Ràpita",
      en: "Watch the traditional rice harvest in La Ràpita",
    },
    body: {
      ca: [
        "Dissabte, d'11 a 13 h, la Ràpita recupera la sega tradicional de l'arròs.",
        "A partir de les 13 h hi ha una degustació solidària d'arròs, aigua i pastisset per **5 €**, amb reserva prèvia.",
      ],
      es: [
        "El sábado, de 11 a 13 h, La Ràpita recupera la siega tradicional del arroz.",
        "A partir de las 13 h se celebra una degustación solidaria por **5 €**, con reserva previa.",
      ],
      en: [
        "On Saturday from 11 am to 1 pm, La Ràpita recreates the traditional rice harvest.",
        "A **€5 charity rice tasting** follows from 1 pm, with advance booking required.",
      ],
    },
    url: "https://turismelarapita.cat/",
    row: {
      municipality: "la Ràpita",
      dates: D.sat,
      category: CAT.food,
      price: { ca: "Degustació 5 €", es: "Degustación 5 €", en: "€5 tasting" },
    },
  },
  {
    title: {
      ca: "Continuar la ruta de l'arròs a l'Ampolla",
      es: "Continuar la ruta del arroz en L'Ampolla",
      en: "See another side of the rice harvest in L'Ampolla",
    },
    body: {
      ca: [
        "Diumenge és el torn de l'Ampolla, amb demostracions del procés tradicional de la sega i transformació de l'arròs, gastronomia i música tradicional.",
      ],
      es: [
        "El domingo es el turno de L'Ampolla, con demostraciones tradicionales, gastronomía y música.",
      ],
      en: [
        "On Sunday, L'Ampolla stages its own traditional harvest celebration with demonstrations, food and traditional music.",
      ],
    },
    url: "https://terresdelebre.travel/festesarros/lampolla.html",
    row: { municipality: "l'Ampolla", dates: D.sun, category: CAT.food, price: NO_PRICE },
  },
  {
    title: {
      ca: "Buscar l'ambient de tardor a Setcases",
      es: "Recibir el otoño en Setcases",
      en: "Welcome mushroom season in Setcases",
    },
    body: {
      ca: [
        "La XXXIV Festa del Bolet omple Setcases dissabte i diumenge amb mercat artesà, exposició i classificació de bolets, tastets, activitats familiars i divulgació micològica.",
      ],
      es: [
        "La Festa del Bolet llena Setcases sábado y domingo con mercado artesano, exposición y clasificación de setas, degustaciones y actividades familiares.",
      ],
      en: [
        "High in the Pyrenees, Setcases holds its annual mushroom festival with a market, mushroom displays, tastings and family activities.",
      ],
    },
    url: "https://setcases.cat/",
    row: { municipality: "Setcases", dates: D.weekend, category: CAT.food, price: NO_PRICE },
  },
  {
    title: {
      ca: "Veure arribar barques amb veles il·luminades a l'Escala",
      es: "Ver llegar barcos con velas iluminadas en L'Escala",
      en: "Watch illuminated sailing boats arrive in L'Escala",
    },
    body: {
      ca: [
        "La Festa de la Sal és un dels plans més visuals del cap de setmana.",
        "Dissabte hi haurà oficis mariners, música i dansa i, al vespre, l'arribada de barques tradicionals amb les veles il·luminades.",
      ],
      es: [
        "La Festa de la Sal celebra la memoria marinera de L'Escala.",
        "El sábado combina antiguos oficios del mar, música y danza y culmina con la llegada de embarcaciones tradicionales con velas iluminadas.",
      ],
      en: [
        "The Festa de la Sal celebrates L'Escala's maritime heritage.",
        "Saturday brings traditional fishing trades, dances and music before traditional boats arrive with illuminated sails after dark.",
      ],
    },
    url: "https://www.lescala.cat/",
    row: { municipality: "l'Escala", dates: D.sat, category: CAT.sea, price: NO_PRICE },
  },
  {
    title: {
      ca: "Fer un diumenge de formatges a Lladó",
      es: "Pasar el domingo entre quesos artesanos en Lladó",
      en: "Eat your way through Lladó's artisan cheese fair",
    },
    body: {
      ca: [
        "La 30a Fira Catalana del Formatge Artesà ocupa el nucli antic de Lladó diumenge amb productors artesans, degustacions, maridatges, activitats infantils i música.",
      ],
      es: [
        "La 30ª Fira Catalana del Formatge Artesà ocupa el casco antiguo de Lladó con productores, degustaciones y productos gastronómicos.",
      ],
      en: [
        "The historic village of Lladó hosts the 30th Catalan Artisan Cheese Fair on Sunday.",
        "Producers, tastings and other local food products fill the old centre.",
      ],
    },
    url: "https://firadelformatge.cat/",
    row: { municipality: "Lladó", dates: D.sun, category: CAT.food, price: NO_PRICE },
  },
  {
    title: {
      ca: "Descobrir el Berguedà a la Fira de Santa Tecla",
      es: "Descubrir el Berguedà en la Fira de Santa Tecla",
      en: "Discover rural Catalonia in Berga",
    },
    body: {
      ca: [
        "Berga dedica dissabte i diumenge al sector primari, les races autòctones, els productes locals i la gastronomia.",
        "La fira funciona de **10 a 20 h**.",
      ],
      es: [
        "Berga dedica sábado y domingo al sector primario, razas autóctonas, productores locales y gastronomía.",
        "Horario: **10–20 h**.",
      ],
      en: [
        "Berga's Santa Tecla Fair focuses on livestock, native breeds, local producers, Berguedà food and rural culture.",
        "It runs from **10 am to 8 pm**.",
      ],
    },
    url: "https://ajberga.cat/",
    row: { municipality: "Berga", dates: D.weekend, category: CAT.fair, price: NO_PRICE },
  },
  {
    title: {
      ca: "Menjar plant-based al Vegan Fest de Terrassa",
      es: "Comer plant-based en el Vegan Fest de Terrassa",
      en: "Eat at Vegan Fest in Terrassa",
    },
    body: {
      ca: [
        "El Parc de Vallparadís acull dissabte de 10 a 23 h i diumenge de 10 a 20 h gastronomia vegana, showcookings, mercat, música i activitats infantils.",
        "**L'entrada és gratuïta.**",
      ],
      es: [
        "El Parc de Vallparadís acoge gastronomía vegana, showcookings, mercado, música y actividades infantiles. Sábado: 10–23 h. Domingo: 10–20 h.",
        "**Entrada gratuita.**",
      ],
      en: [
        "Vegan Fest takes over Parc de Vallparadís with plant-based food, cooking demonstrations, markets, music and children's activities. Saturday: 10 am–11 pm. Sunday: 10 am–8 pm.",
        "**Admission is free.**",
      ],
    },
    url: "https://veganfest.cat/",
    row: { municipality: "Terrassa", dates: D.weekend, category: CAT.food, price: FREE },
  },
  {
    title: {
      ca: "Combinar-ho amb el Festival de Circ",
      es: "Combinarlo con el Festival de Circo",
      en: "Catch circus performances in Terrassa",
    },
    body: {
      ca: [
        "Terrassa té doble motiu per visitar-la. Del 17 al 20 de setembre, el Festival de Circ porta a l'Antic Poble de Sant Pere **19 activitats i 12 espectacles diferents**.",
      ],
      es: [
        "Del 17 al 20 de septiembre, el Festival de Circ de Terrassa programa **19 actividades y 12 espectáculos diferentes**.",
      ],
      en: [
        "Terrassa's Circus Festival runs from September 17–20 around the historic Sant Pere area with **19 activities and 12 different shows**.",
      ],
    },
    url: "https://visitaterrassa.cat/",
    row: { municipality: "Terrassa", dates: D.from17, category: CAT.stage, price: NO_PRICE },
  },
  {
    title: {
      ca: "Estrenar La Setmana del Llibre en Català",
      es: "Estrenar La Setmana del Llibre en Català",
      en: "Browse Catalan publishing at La Setmana",
    },
    body: {
      ca: [
        "La Setmana comença divendres 18 al passeig de Lluís Companys.",
        "Dissabte i diumenge obre de **10 a 20.30 h**.",
      ],
      es: [
        "La gran cita del libro en catalán comienza el viernes 18 en el Passeig Lluís Companys.",
        "Sábado y domingo abre de **10 a 20:30 h**.",
      ],
      en: [
        "Barcelona's major festival dedicated to Catalan-language books begins on Friday September 18 on Passeig Lluís Companys.",
        "Weekend opening hours are **10 am–8:30 pm**.",
      ],
    },
    url: "https://lasetmana.cat/",
    row: { municipality: "Barcelona", dates: D.from18, category: CAT.culture, price: NO_PRICE },
  },
  {
    title: {
      ca: "Recórrer galeries durant Barcelona Gallery Weekend",
      es: "Recorrer galerías durante Barcelona Gallery Weekend",
      en: "Gallery-hop during Barcelona Gallery Weekend",
    },
    body: {
      ca: [
        "Barcelona Gallery Weekend celebra la seva 12a edició del 17 al 20 de setembre amb exposicions, trobades amb artistes, performances i visites en galeries de Barcelona i l'Hospitalet.",
        "Bona part del programa és gratuït.",
      ],
      es: [
        "Del 17 al 20 de septiembre, galerías de Barcelona y L'Hospitalet programan exposiciones, performances, visitas y encuentros con artistas.",
        "Muchas actividades son gratuitas.",
      ],
      en: [
        "From September 17–20, galleries across Barcelona and L'Hospitalet host exhibitions, performances, visits and artist encounters.",
        "Many activities are free.",
      ],
    },
    url: "https://barcelonagalleryweekend.com/",
    row: {
      municipality: "Barcelona · l'Hospitalet",
      dates: D.from17,
      category: CAT.art,
      price: { ca: "Bona part gratuït", es: "Buena parte gratuito", en: "Largely free" },
    },
  },
  {
    title: {
      ca: "Aprofitar l'últim cap de setmana de Festa Major del Poblenou",
      es: "Aprovechar el último fin de semana de la Festa Major del Poblenou",
      en: "Join the final weekend of Poblenou's neighbourhood festival",
    },
    body: {
      ca: [
        "Diumenge 20 és l'últim dia de festa al Poblenou.",
        "El barri combina cultura popular, concerts, àpats veïnals, mercats i activitats familiars.",
      ],
      es: [
        "El domingo 20 termina la Festa Major del Poblenou.",
        "El barrio combina cultura popular, conciertos, comidas vecinales, mercados y actividades familiares.",
      ],
      en: [
        "Poblenou's festa major ends on September 20.",
        "The neighbourhood combines community meals, markets, concerts and traditional festivities.",
      ],
    },
    url: "https://guia.barcelona.cat/",
    row: { municipality: "Barcelona", dates: D.until20, category: CAT.festa, price: NO_PRICE },
  },
  {
    title: {
      ca: "Fer una festa major diferent a Vallvidrera",
      es: "Subir a Vallvidrera para su fiesta mayor",
      en: "Head uphill to Vallvidrera",
    },
    body: {
      ca: [
        "La Festa Major de Vallvidrera permet combinar Collserola amb ambient de barri.",
        "Dissabte hi ha activitats com la pujada a la Torre de Collserola, concurs de paelles i música folk. Algunes activitats requereixen inscripció.",
      ],
      es: [
        "La Festa Major de Vallvidrera ofrece un ambiente muy distinto al centro de Barcelona.",
        "El sábado incluye propuestas como la subida a la Torre de Collserola, concurso de paellas y música folk.",
      ],
      en: [
        "On the edge of Collserola, Vallvidrera's local festival offers a very different atmosphere from central Barcelona.",
        "Saturday includes activities such as a climb to the Collserola Tower, a paella competition and folk music.",
      ],
    },
    url: "https://guia.barcelona.cat/",
    row: { municipality: "Barcelona", dates: D.weekend, category: CAT.festa, price: NO_PRICE },
  },
  {
    title: {
      ca: "Passejar per FirAnoia",
      es: "Pasear por FirAnoia",
      en: "Browse FirAnoia in Igualada",
    },
    body: {
      ca: [
        "Igualada converteix el centre en un gran aparador de comerç, automoció, artesania i entitats. FirAnoia se celebra del 18 al 20 de setembre.",
        "**L'accés és gratuït.**",
      ],
      es: [
        "FirAnoia convierte el centro de Igualada en un gran escaparate de comercio, automoción, artesanía y entidades. Se celebra del 18 al 20 de septiembre.",
        "**Entrada gratuita.**",
      ],
      en: [
        "Igualada's centre becomes a large open-air fair covering crafts, local businesses, cars and community organisations. FirAnoia runs from September 18–20.",
        "**Admission is free.**",
      ],
    },
    url: "https://www.firaigualada.org/",
    row: { municipality: "Igualada", dates: D.from18, category: CAT.fair, price: FREE },
  },
  {
    title: {
      ca: "Veure clàssics a Mollerussa",
      es: "Ver coches y motos clásicos en Mollerussa",
      en: "See classic cars and motorcycles in Mollerussa",
    },
    body: {
      ca: [
        "Expoclàssic reuneix cotxes, motos, recanvis i col·leccionisme. Dissabte: **10–20 h**. Diumenge: **10–14 h**.",
        "**Entrada gratuïta.**",
      ],
      es: [
        "Expoclàssic reúne vehículos clásicos, motocicletas, recambios y coleccionismo. Sábado: **10–20 h**. Domingo: **10–14 h**.",
        "**Entrada gratuita.**",
      ],
      en: [
        "Expoclàssic combines classic cars, motorcycles, spare parts and collectibles. Saturday: **10 am–8 pm**. Sunday: **10 am–2 pm**.",
        "**Admission is free.**",
      ],
    },
    url: "https://fira.com/",
    row: { municipality: "Mollerussa", dates: D.weekend, category: CAT.motor, price: FREE },
  },
  {
    title: {
      ca: "Celebrar l'ametlla a Vilagrassa",
      es: "Celebrar la almendra en Vilagrassa",
      en: "Celebrate almonds in Vilagrassa",
    },
    body: {
      ca: [
        "La Fira de l'Ametlla combina pagesia, gastronomia, tallers i cultura al voltant d'un dels productes emblemàtics de l'Urgell. L'edició 2026 se celebra del 18 al 20 de setembre.",
      ],
      es: [
        "La Fira de l'Ametlla combina agricultura, gastronomía, talleres y cultura. Se celebra del 18 al 20 de septiembre.",
      ],
      en: [
        "The town spends the weekend celebrating one of its signature crops with food, agriculture, workshops and local culture. The fair runs from September 18–20.",
      ],
    },
    url: "https://www.vilagrassa.cat/",
    row: { municipality: "Vilagrassa", dates: D.from18, category: CAT.food, price: NO_PRICE },
  },
  {
    title: {
      ca: "Portar els nens a l'Encontats de Balaguer",
      es: "Llevar a los niños al Encontats de Balaguer",
      en: "Take children to Encontats in Balaguer",
    },
    body: {
      ca: [
        "Diumenge, el centre històric de Balaguer es converteix en una gran festa del conte i del llibre il·lustrat, amb narració, tallers, il·lustradors i activitats familiars.",
        "L'activitat principal és gratuïta.",
      ],
      es: [
        "El domingo, el centro histórico de Balaguer se convierte en una fiesta de los cuentos, la ilustración y los libros infantiles.",
        "La actividad principal es gratuita.",
      ],
      en: [
        "On Sunday, Balaguer's historic centre turns into a festival of children's books, storytelling and illustration.",
        "The main programme is free.",
      ],
    },
    row: {
      municipality: "Balaguer",
      dates: D.sun,
      category: CAT.family,
      price: { ca: "Activitat principal gratuïta", es: "Actividad principal gratuita", en: "Main programme free" },
    },
  },
  {
    title: {
      ca: "Redescobrir el Centre Històric de Lleida",
      es: "Redescubrir el centro histórico de Lleida",
      en: "Explore Lleida's historic centre",
    },
    body: {
      ca: [
        "L'Obert Centre Històric ocupa el barri del 18 al 20 de setembre amb cultura, patrimoni, art, gastronomia i activitats comunitàries.",
      ],
      es: [
        "El Obert Centre Històric se celebra del 18 al 20 de septiembre con cultura, patrimonio, gastronomía, arte y actividades comunitarias.",
      ],
      en: [
        "Obert Centre Històric fills Lleida's old quarter with heritage, food, art, music and community activities from Friday to Sunday.",
      ],
    },
    row: { municipality: "Lleida", dates: D.from18, category: CAT.culture, price: NO_PRICE },
  },
  {
    title: {
      ca: "Veure carabasses gegants a Sidamon",
      es: "Ver calabazas gigantes en Sidamon",
      en: "See giant pumpkins in Sidamon",
    },
    body: {
      ca: [
        "Diumenge, de **9 a 18 h**, el Parc del Canal acull carabasses gegants, productes de proximitat, artesania i tallers gastronòmics.",
      ],
      es: [
        "El domingo, de **9 a 18 h**, el Parc del Canal acoge calabazas gigantes, productos de proximidad, artesanía y talleres gastronómicos.",
      ],
      en: [
        "On Sunday from **9 am to 6 pm**, Parc del Canal hosts giant pumpkins alongside local produce, crafts and food workshops.",
      ],
    },
    url: "https://promocioeconomica.cat/",
    row: { municipality: "Sidamon", dates: D.sun, category: CAT.food, price: NO_PRICE },
  },
  {
    title: {
      ca: "Fer una escapada gastronòmica a Alguaire",
      es: "Hacer una escapada gastronómica a Alguaire",
      en: "Discover Alguaire's fig fair",
    },
    body: {
      ca: [
        "La Fira de la Figa se celebra el 19 i 20 de setembre i posa en valor un producte especialment vinculat al municipi del Segrià.",
      ],
      es: [
        "La Fira de la Figa se celebra el 19 y 20 de septiembre y pone en valor uno de los productos agrícolas más vinculados al municipio.",
      ],
      en: [
        "Alguaire, in western Catalonia's Segrià area, dedicates September 19 and 20 to figs and the town's agricultural identity.",
      ],
    },
    row: { municipality: "Alguaire", dates: D.weekend, category: CAT.food, price: NO_PRICE },
  },
  {
    title: {
      ca: "Viatjar simbòlicament a Mèxic des del Ripollès",
      es: "Vivir una conexión entre Cataluña y México",
      en: "Experience a Catalan-Mexican tradition in the Pyrenees",
    },
    body: {
      ca: [
        "Sant Joan de les Abadesses celebra dissabte la Festa d'El Grito, dedicada a la independència de Mèxic.",
        "L'activitat és gratuïta i aquesta tradició se celebra al municipi des de 2005.",
      ],
      es: [
        "Sant Joan de les Abadesses celebra el sábado la Festa d'El Grito, vinculada a la independencia de México.",
        "La actividad es gratuita.",
      ],
      en: [
        "Sant Joan de les Abadesses celebrates **El Grito**, linked to Mexican Independence.",
        "The event is free.",
      ],
    },
    url: "https://agenda.cultura.gencat.cat/",
    row: {
      municipality: "Sant Joan de les Abadesses",
      dates: D.sat,
      category: CAT.culture,
      price: FREE,
    },
  },
  {
    title: {
      ca: "Tastar una tradició molt local a Vilabertran",
      es: "Probar una tradición local en Vilabertran",
      en: "Try Vilabertran's unusual stuffed-apple tradition",
    },
    body: {
      ca: [
        "Diumenge 20, Vilabertran celebra la 23a Fira de la Poma de Relleno, amb activitats durant tota la jornada al voltant d'aquesta recepta tradicional de l'Alt Empordà.",
      ],
      es: [
        "El domingo 20 se celebra la 23ª Fira de la Poma de Relleno.",
        "La jornada gira alrededor de esta receta tradicional del Alt Empordà.",
      ],
      en: [
        "On Sunday, Vilabertran holds the 23rd edition of its **Fira de la Poma de Relleno**.",
        "The fair revolves around a traditional local stuffed-apple dish from the Alt Empordà.",
      ],
    },
    url: "https://vilabertran.cat/",
    row: { municipality: "Vilabertran", dates: D.sun, category: CAT.food, price: NO_PRICE },
  },
];

/* -------------------------------------------------------------------------- */
/* Per-locale framing                                                         */
/* -------------------------------------------------------------------------- */

export interface LocaleCopy {
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
  tableNote: string;
  plansHeading: string;
  closingHeading: string;
  closing: string[];
  warningTitle: string;
  warning: string;
  officialLinkLabel: string;
}

export const COPY: Record<Locale, LocaleCopy> = {
  ca: {
    path: "agenda/que-fer-aquest-cap-de-setmana-catalunya",
    title: "Què fer aquest cap de setmana a Catalunya: 25 plans que valen realment la pena",
    seoTitle: "Què fer aquest cap de setmana a Catalunya: 25 plans | 19 i 20 setembre",
    seoDescription:
      "25 plans verificats per fer a Catalunya aquest 19 i 20 de setembre: Santa Tecla, concerts, fires, gastronomia, natura i activitats familiars.",
    excerpt:
      "25 plans verificats per fer a Catalunya el 19 i 20 de setembre de 2026: Santa Tecla, el Mercat de Música Viva de Vic, Sea Otter Europe, el Delta Birding Festival, fires gastronòmiques i propostes gratuïtes.",
    intro: [
      "El cap de setmana del **19 i 20 de setembre de 2026** arriba carregat de cites especialment bones: Santa Tecla entra en un dels seus caps de setmana forts, Vic viu els últims dies del Mercat de Música Viva, Girona es converteix en capital europea de la bicicleta i al Delta coincideixen ornitologia, arrossars i festes de la sega.",
      "En lloc d'omplir aquesta guia amb llocs que es poden visitar qualsevol dissabte de l'any, hem seleccionat **25 propostes que tenen una raó concreta per visitar-les precisament aquest cap de setmana**.",
      "Si només n'has de triar un, Tarragona és probablement el pla més complet per viure cultura popular; Vic és l'opció forta per a música; Girona, per a ciclisme; i el Delta de l'Ebre, per combinar natura i gastronomia.",
    ],
    directAnswerTitle: "En resum",
    directAnswer:
      "El cap de setmana del **19 i 20 de setembre de 2026** destaquen Santa Tecla a Tarragona, el Mercat de Música Viva de Vic, Sea Otter Europe a Girona i el Delta Birding Festival. També hi ha fires gastronòmiques, festes de l'arròs, activitats familiars i propostes gratuïtes arreu de Catalunya.",
    keyFactsTitle: "Dades clau",
    keyFacts: [
      { label: "Dates", value: "19–20 de setembre de 2026" },
      { label: "Plans seleccionats", value: "25" },
      {
        label: "Zones",
        value:
          "Barcelona, Girona, Tarragona, Terres de l'Ebre, Catalunya Central, Pirineu i Ponent",
      },
      { label: "Opcions gratuïtes", value: "Sí" },
      { label: "Ideal per", value: "cultura, gastronomia, famílies, música i natura" },
      { label: "Última verificació", value: "13 de setembre de 2026" },
    ],
    tableCaption: "Els 25 plans, d'un cop d'ull",
    tableHeaders: ["Pla", "Municipi", "Dates", "Categoria", "Preu"],
    tableNote:
      "Les caselles buides corresponen a dades que l'organització no ha publicat. Consulta la font oficial de cada activitat.",
    plansHeading: "Els 25 plans",
    closingHeading: "Quin pla triem?",
    closing: [
      "Per **cultura popular**, Santa Tecla. Per **música**, Vic. Per **famílies**, Balaguer, Terrassa o Setcases. Per **gastronomia**, Lladó, el Delta o Vilagrassa.",
      "Per un pla especialment fotogènic, la Festa de la Sal de l'Escala és una de les opcions més singulars.",
    ],
    warningTitle: "Abans de sortir",
    warning:
      "Comprova sempre la pàgina oficial de l'activitat: els horaris, aforaments o programes poden tenir canvis d'última hora.",
    officialLinkLabel: "Font oficial",
  },
  es: {
    path: "agenda/que-hacer-este-fin-de-semana-cataluna",
    title: "Qué hacer este fin de semana en Cataluña: 25 planes que realmente merecen la pena",
    seoTitle: "Qué hacer este fin de semana en Cataluña: 25 planes | 19 y 20 septiembre",
    seoDescription:
      "25 planes verificados para el 19 y 20 de septiembre en Cataluña: fiestas, música, gastronomía, naturaleza, ferias y actividades familiares.",
    excerpt:
      "25 planes verificados para el 19 y 20 de septiembre de 2026 en Cataluña: Santa Tecla, el Mercat de Música Viva de Vic, Sea Otter Europe, el Delta Birding Festival, ferias gastronómicas y propuestas gratuitas.",
    intro: [
      "El **19 y 20 de septiembre de 2026** no es un fin de semana cualquiera: Tarragona está en plena Santa Tecla, Vic celebra el tramo final de su gran mercado musical, Girona recibe Sea Otter Europe y el Delta del Ebro concentra naturaleza y fiestas tradicionales del arroz.",
      "En vez de llenar esta selección con lugares que pueden visitarse cualquier sábado del año, hemos elegido **25 acontecimientos que tienen una razón concreta para visitarse precisamente este fin de semana**.",
      "Si solo puedes elegir uno, Tarragona ofrece probablemente la experiencia cultural más intensa; Vic es la gran opción musical; Girona destaca por el ciclismo y el Delta del Ebro combina especialmente bien naturaleza y gastronomía.",
    ],
    directAnswerTitle: "En resumen",
    directAnswer:
      "El fin de semana del **19 y 20 de septiembre de 2026** destacan Santa Tecla en Tarragona, el Mercat de Música Viva de Vic, Sea Otter Europe en Girona y el Delta Birding Festival. También hay ferias gastronómicas, fiestas tradicionales del arroz, actividades familiares y propuestas gratuitas por toda Cataluña.",
    keyFactsTitle: "Datos clave",
    keyFacts: [
      { label: "Fechas", value: "19–20 de septiembre de 2026" },
      { label: "Planes seleccionados", value: "25" },
      {
        label: "Zonas",
        value:
          "Barcelona, Girona, Tarragona, Terres de l'Ebre, Cataluña Central, Pirineo y Poniente",
      },
      { label: "Opciones gratuitas", value: "Sí" },
      { label: "Ideal para", value: "cultura, gastronomía, familias, música y naturaleza" },
      { label: "Última verificación", value: "13 de septiembre de 2026" },
    ],
    tableCaption: "Los 25 planes, de un vistazo",
    tableHeaders: ["Plan", "Municipio", "Fechas", "Categoría", "Precio"],
    tableNote:
      "Las casillas vacías corresponden a datos que la organización no ha publicado. Consulta la fuente oficial de cada actividad.",
    plansHeading: "Los 25 planes",
    closingHeading: "Si no sabes cuál elegir",
    closing: [
      "Para **cultura popular**, Tarragona. Para **música**, Vic. Para **familias**, Balaguer, Terrassa o Setcases. Para **gastronomía**, Lladó, el Delta del Ebro o Vilagrassa.",
      "Para una experiencia especialmente fotogénica, la Festa de la Sal de L'Escala es una de las propuestas más singulares.",
    ],
    warningTitle: "Antes de salir",
    warning:
      "Comprueba siempre la página oficial de la actividad: horarios, aforos o programas pueden cambiar a última hora.",
    officialLinkLabel: "Fuente oficial",
  },
  en: {
    path: "agenda/things-to-do-catalonia-this-weekend",
    title: "25 genuinely great things to do in Catalonia this weekend",
    seoTitle: "25 best things to do in Catalonia this weekend | Sept 19–20",
    seoDescription:
      "25 great things happening across Catalonia on September 19–20: festivals, food fairs, cycling, music, nature and easy weekend escapes.",
    excerpt:
      "25 verified things to do across Catalonia on September 19–20, 2026: Santa Tecla in Tarragona, the Mercat de Música Viva in Vic, Sea Otter Europe, the Delta Birding Festival, food fairs and free events.",
    intro: [
      "If you're in Catalonia on **September 19–20, 2026**, this is an unusually good weekend to venture beyond the standard Barcelona checklist.",
      "Tarragona is deep into its Santa Tecla celebrations, Vic is hosting one of Catalonia's biggest live-music gatherings, Girona becomes a cycling hub for Sea Otter Europe, and the Ebro Delta combines birdwatching with traditional rice-harvest festivals.",
      "Rather than filling this guide with places you could visit on any weekend of the year, we've selected **25 events that give you a specific reason to go right now**.",
      "If you only have time for one, Tarragona offers perhaps the strongest introduction to Catalan popular culture. Vic is the weekend's big music option, Girona is the obvious choice for cycling, and the Ebro Delta combines nature and food particularly well.",
    ],
    directAnswerTitle: "In short",
    directAnswer:
      "The standout events in Catalonia on **September 19–20, 2026** include Tarragona's Santa Tecla festival, Vic's Mercat de Música Viva, Sea Otter Europe in Girona and the Delta Birding Festival. The weekend also brings food fairs, traditional rice-harvest celebrations, family events and plenty of free activities across Catalonia.",
    keyFactsTitle: "Key facts",
    keyFacts: [
      { label: "Dates", value: "September 19–20, 2026" },
      { label: "Events selected", value: "25" },
      {
        label: "Areas",
        value:
          "Barcelona, Girona, Tarragona, Ebro Delta, Central Catalonia, the Pyrenees and western Catalonia",
      },
      { label: "Free options", value: "Yes" },
      { label: "Good for", value: "culture, food, families, music and nature" },
      { label: "Last verified", value: "September 13, 2026" },
    ],
    tableCaption: "All 25 events at a glance",
    tableHeaders: ["Event", "Town", "Dates", "Category", "Price"],
    tableNote:
      "Blank cells are details the organisers have not published. Check each event's official page.",
    plansHeading: "The 25 events",
    closingHeading: "Which one should you choose?",
    closing: [
      "For the strongest **Catalan cultural experience**, go to Tarragona. For **live music**, choose Vic. For **cycling**, Girona is the obvious pick. For **nature and food together**, head to the Ebro Delta.",
      "Families have particularly good options in Balaguer, Terrassa and Setcases. For something especially photogenic, L'Escala's Festa de la Sal is one of the weekend's most distinctive options.",
    ],
    warningTitle: "Before you go",
    warning:
      "Always check the event's official page: opening hours, capacity limits and programmes can change at short notice.",
    officialLinkLabel: "Official page",
  },
};

/** Sources register, deduplicated by URL and shared across the three editions. */
export const SOURCES: { name: string; url: string; publisher?: string }[] = [
  { name: "Santa Tecla — Ajuntament de Tarragona", url: "https://www.tarragona.cat/cultura/festes-i-cultura-popular/santa-tecla/", publisher: "Ajuntament de Tarragona" },
  { name: "Mercat de Música Viva de Vic", url: "https://www.mmvv.cat/" },
  { name: "Sea Otter Europe Girona", url: "https://www.seaottereurope.com/" },
  { name: "Delta Birding Festival", url: "https://deltabirdingfestival.com/" },
  { name: "Turisme la Ràpita", url: "https://turismelarapita.cat/", publisher: "Ajuntament de la Ràpita" },
  { name: "Festes de l'arròs — Terres de l'Ebre", url: "https://terresdelebre.travel/festesarros/lampolla.html" },
  { name: "Ajuntament de Setcases", url: "https://setcases.cat/" },
  { name: "Ajuntament de l'Escala", url: "https://www.lescala.cat/" },
  { name: "Fira Catalana del Formatge Artesà de Lladó", url: "https://firadelformatge.cat/" },
  { name: "Ajuntament de Berga", url: "https://ajberga.cat/" },
  { name: "Vegan Fest Terrassa", url: "https://veganfest.cat/" },
  { name: "Visita Terrassa", url: "https://visitaterrassa.cat/", publisher: "Ajuntament de Terrassa" },
  { name: "La Setmana del Llibre en Català", url: "https://lasetmana.cat/" },
  { name: "Barcelona Gallery Weekend", url: "https://barcelonagalleryweekend.com/" },
  { name: "Guia de Barcelona", url: "https://guia.barcelona.cat/", publisher: "Ajuntament de Barcelona" },
  { name: "FirAnoia — Fira d'Igualada", url: "https://www.firaigualada.org/" },
  { name: "Fira de Mollerussa", url: "https://fira.com/" },
  { name: "Ajuntament de Vilagrassa", url: "https://www.vilagrassa.cat/" },
  { name: "Promoció Econòmica", url: "https://promocioeconomica.cat/" },
  { name: "Agenda cultural de la Generalitat de Catalunya", url: "https://agenda.cultura.gencat.cat/", publisher: "Generalitat de Catalunya" },
  { name: "Ajuntament de Vilabertran", url: "https://vilabertran.cat/" },
];

/* -------------------------------------------------------------------------- */
/* Images                                                                     */
/* -------------------------------------------------------------------------- */

export interface ImageMeta {
  /** Matches a key in the generated `images.ts` manifest. */
  key: string;
  /** Zero-based index of the plan this image illustrates. */
  planIndex: number;
  /** Whether this is also the page's lead image. */
  isHero?: boolean;
  alt: Record<Locale, string>;
  caption: Record<Locale, string>;
}

/**
 * Credit line stored on every one of these media rows.
 *
 * These are illustrations, not photojournalism: they were generated, and the
 * caption says so in the reader's language. A site whose entire argument is
 * verified information and cited sources cannot present a generated image as a
 * documentary photograph of an event that happened a specific way.
 */
export const IMAGE_CREDIT = "CatalunyaInfo";
/**
 * Left empty on purpose: the caption already states, in the reader's language,
 * that the image is generated. Repeating it in the licence line said the same
 * thing twice under every picture.
 */
export const IMAGE_LICENCE: string | null = null;

const AI_NOTE = {
  ca: "Il·lustració generada amb intel·ligència artificial.",
  es: "Ilustración generada con inteligencia artificial.",
  en: "Illustration generated with artificial intelligence.",
};

export const IMAGE_META: ImageMeta[] = [
  {
    key: "santa-tecla-tarragona-castells",
    planIndex: 0,
    isHero: true,
    alt: {
      ca: "Castellers aixecant un castell davant la catedral de Tarragona durant Santa Tecla.",
      es: "Castellers levantando un castell ante la catedral de Tarragona durante Santa Tecla.",
      en: "Castellers raising a human tower in front of Tarragona cathedral during Santa Tecla.",
    },
    caption: {
      ca: `Diada castellera a la plaça de les Cols, Tarragona. ${AI_NOTE.ca}`,
      es: `Diada castellera en la plaza de les Cols, Tarragona. ${AI_NOTE.es}`,
      en: `Human-tower gathering on Plaça de les Cols, Tarragona. ${AI_NOTE.en}`,
    },
  },
  {
    key: "sea-otter-europe-girona-ciclisme",
    planIndex: 2,
    alt: {
      ca: "Ciclistes provant bicicletes entre les carpes de la fira, amb Girona al fons.",
      es: "Ciclistas probando bicicletas entre las carpas de la feria, con Girona al fondo.",
      en: "Cyclists testing bikes among the festival stands, with Girona in the background.",
    },
    caption: {
      ca: `Zona d'exposició i proves de Sea Otter Europe, Girona. ${AI_NOTE.ca}`,
      es: `Zona de exposición y pruebas de Sea Otter Europe, Girona. ${AI_NOTE.es}`,
      en: `Expo and test-ride area at Sea Otter Europe, Girona. ${AI_NOTE.en}`,
    },
  },
  {
    key: "festa-sega-arros-delta-ebre",
    planIndex: 4,
    alt: {
      ca: "Persones segant arròs a mà amb cistells de vímet en un arrossar inundat del Delta.",
      es: "Personas segando arroz a mano con cestos de mimbre en un arrozal inundado del Delta.",
      en: "People harvesting rice by hand with wicker baskets in a flooded Delta paddy field.",
    },
    caption: {
      ca: `Sega tradicional de l'arròs a les Terres de l'Ebre. ${AI_NOTE.ca}`,
      es: `Siega tradicional del arroz en las Terres de l'Ebre. ${AI_NOTE.es}`,
      en: `Traditional rice harvest in the Ebro Delta. ${AI_NOTE.en}`,
    },
  },
  {
    key: "festa-bolet-setcases-pirineus",
    planIndex: 6,
    alt: {
      ca: "Parades de bolets en un mercat de poble de muntanya amb el campanar al fons.",
      es: "Paradas de setas en un mercado de pueblo de montaña con el campanario al fondo.",
      en: "Mushroom stalls at a mountain village market with the bell tower behind.",
    },
    caption: {
      ca: `Mercat de bolets al Pirineu, Setcases. ${AI_NOTE.ca}`,
      es: `Mercado de setas en el Pirineo, Setcases. ${AI_NOTE.es}`,
      en: `Mushroom market in the Pyrenees, Setcases. ${AI_NOTE.en}`,
    },
  },
  {
    key: "festa-sal-lescala-barques-illuminades",
    planIndex: 7,
    alt: {
      ca: "Barques de vela llatina amb les veles il·luminades arribant a la platja al capvespre.",
      es: "Barcas de vela latina con las velas iluminadas llegando a la playa al atardecer.",
      en: "Lateen-sail boats with illuminated sails arriving at the beach at dusk.",
    },
    caption: {
      ca: `Arribada de les barques a la Festa de la Sal, l'Escala. ${AI_NOTE.ca}`,
      es: `Llegada de las barcas a la Festa de la Sal, L'Escala. ${AI_NOTE.es}`,
      en: `Boats arriving at the Festa de la Sal, L'Escala. ${AI_NOTE.en}`,
    },
  },
  {
    key: "fira-formatge-artesa-llado",
    planIndex: 8,
    alt: {
      ca: "Parades de formatge artesà en una plaça de poble de pedra amb visitants tastant.",
      es: "Paradas de queso artesano en una plaza de pueblo de piedra con visitantes catando.",
      en: "Artisan cheese stalls in a stone village square with visitors tasting.",
    },
    caption: {
      ca: `Fira Catalana del Formatge Artesà, Lladó. ${AI_NOTE.ca}`,
      es: `Fira Catalana del Formatge Artesà, Lladó. ${AI_NOTE.es}`,
      en: `Catalan Artisan Cheese Fair, Lladó. ${AI_NOTE.en}`,
    },
  },
];
