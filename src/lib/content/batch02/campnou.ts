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
 * Spotify Camp Nou: the museum visit, match tickets and how to get there.
 *
 * Every statement comes from FC Barcelona's own pages or TMB, checked on
 * 12 Oct 2026 (research_notes/blog-batch-03/campnou.md). The stadium is still
 * part-open while works continue, so the copy says only what the club says:
 * reduced capacity, no completion date. Reduced and child museum prices are
 * omitted: the only page carrying them is from 2023 and the live shop could
 * not be read.
 *
 * Re-checked on 24 Oct 2026 against the club's tickets, timetable and
 * accessibility pages, its 10 Mar 2026 capacity statement, the 25 Jun 2026
 * Season Pass note, the 15 Sep 2026 Champions League final note and TMB's
 * match-day notice. Dropped because no page states them today: the "€199" top
 * price (the top product is €214), priority for pass holders, the club's
 * daily fraud checks, "suspended until full capacity returns", the club
 * asking fans to walk, and "no visitor car park" (the club lists parking for
 * motorbikes, coaches, taxis and accessible vehicles only).
 *
 * Added on 28 Oct 2026 (page-1 push for "museo del barça horario / precio /
 * cómo llegar"), read that day on fcbarcelona.com: the product table
 * (Museum €28, Museum Flexible €38 valid until 28 Feb 2027, Total Experience
 * €52, BarçaBus Experience €59, Spotify Camp Nou Experience €69 with its
 * Catalan/Spanish/English sessions, Players Experience €99, Match Day Tour
 * €149, Barça Sky Tour €214), ticket changes from €10 at the ticket office
 * and the products that cannot be exchanged, ticket booths opening 15 minutes
 * before and closing 45 minutes before closing, the dated November changes
 * (3 Nov until 21:00, 17 Nov until 17:00), the accessibility page (special
 * prices only at the ticket offices, step-free tour, two wheelchairs on loan,
 * pushchairs left at the information desk) and the bus lines from the
 * club's "Getting to Spotify Camp Nou" page (19 Aug 2026), which also says
 * there is no luggage storage on match days.
 */

const VERIFIED = "2026-10-28";

const SOURCES: B2Source[] = [
  { name: "Barça Immersive Tour — tickets", url: "https://www.fcbarcelona.com/en/tickets/camp-nou-experience", publisher: "FC Barcelona" },
  { name: "Barça Immersive Tour — timetable", url: "https://www.fcbarcelona.com/en/tickets/camp-nou-experience/timetable", publisher: "FC Barcelona" },
  { name: "Barça Immersive Tour — accessibility", url: "https://www.fcbarcelona.com/en/tickets/camp-nou-experience/accessibility", publisher: "FC Barcelona" },
  { name: "FC Barcelona launches 2026/27 Season Pass", url: "https://www.fcbarcelona.com/en/club/news/4526284/fc-barcelona-launches-202627-season-pass-for-matches-at-spotify-camp-nou", publisher: "FC Barcelona" },
  { name: "Spotify Camp Nou to host 2029 men's Champions League final", url: "https://www.fcbarcelona.com/en/club/news/4576674/spotify-camp-nou-to-host-2029-mens-champions-league-final", publisher: "FC Barcelona" },
  { name: "TMB — FC Barcelona match at Spotify Camp Nou", url: "https://www.tmb.cat/en/-/avis-partit-fc-barcelona-spotify-camp-nou", publisher: "TMB" },
  { name: "Football tickets", url: "https://www.fcbarcelona.com/en/tickets/football", publisher: "FC Barcelona" },
  { name: "FC Barcelona — stadium capacity statement", url: "https://www.fcbarcelona.com/en/club/news/4465846/fc-barcelona-official-statement", publisher: "FC Barcelona" },
  { name: "Getting to Spotify Camp Nou", url: "https://www.fcbarcelona.com/en/card/4562313/getting-to-spotify-camp-nou", publisher: "FC Barcelona" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/spotify-camp-nou-museu-visita",
    title: "Spotify Camp Nou: visita al museu, entrades de partit i com arribar-hi",
    seoTitle: "Visita Spotify Camp Nou: des de 28 €, horari i com arribar-hi",
    seoDescription:
      "La visita al Camp Nou (museu del Barça) costa des de 28 € i obre de 10:00 a 18:00 fins al 19 de març. Què inclou cada entrada, les obres i el metro.",
    excerpt:
      "Què es pot visitar ara al Spotify Camp Nou, quant costa, com es compren les entrades de partit i com arribar-hi, segons el FC Barcelona i TMB.",
  },
  es: {
    path: "guias/spotify-camp-nou-museo-visita",
    title: "Museo del Barça y visita al Spotify Camp Nou: precio, horario y cómo llegar",
    seoTitle: "Museo del Barça y visita Camp Nou: precio, horario, cómo ir",
    seoDescription:
      "El museo del Barça (visita al Camp Nou) cuesta desde 28 € y abre de 10:00 a 18:00 hasta el 19 de marzo. Qué incluye cada entrada y cómo llegar en metro.",
    excerpt:
      "Qué se puede visitar ahora en el Spotify Camp Nou, cuánto cuesta, cómo se compran las entradas de partido y cómo llegar, según el FC Barcelona y TMB.",
  },
  en: {
    path: "guides/spotify-camp-nou-tour-museum",
    title: "Spotify Camp Nou: museum tour, match tickets and how to get there",
    seoTitle: "Camp Nou tour 2026: tickets from €28 and opening hours",
    seoDescription:
      "The Camp Nou tour (Barça museum) costs from €28 and opens 10:00–18:00 until 19 March. What each ticket includes, the stadium works and the metro.",
    excerpt:
      "What you can visit at Spotify Camp Nou now, what it costs, how match tickets are sold and how to get there, from FC Barcelona and TMB.",
  },
};

type T = {
  lead: string;
  statusTitle: string;
  status: string[];
  museumTitle: string;
  museum: string[];
  productsCaption: string;
  productsHeaders: string[];
  productsRows: string[][];
  productsNote: string;
  hoursTitle: string;
  hours: string[];
  matchTitle: string;
  match: string[];
  getTitle: string;
  get: string[];
  tipsTitle: string;
  tips: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "**The Camp Nou tour, now called the Barça Immersive Tour, costs from €28** and opens **10:00 to 18:00 every day from 19 October to 19 March**, with last entry 45 minutes before closing; it is closed on 25 December and 1 January. The basic ticket covers the museum, an audio guide and a viewpoint over the works; a guided panoramic view of the stadium comes with the Spotify Camp Nou Experience, from €69. FC Barcelona is back at **Spotify Camp Nou**, but the stadium is open only in part while the rebuild goes on. Prices and hours are from the club's own pages on 28 October 2026.",
    statusTitle: "The stadium right now",
    status: [
      "The club has been reopening the stadium in phases. Since March 2026 its capacity has been **62,652 spectators**, and the club's 2026-27 Season Pass announcement says capacity remains limited. No completion date has been announced. Finished, the stadium will hold more than 104,000 people, and it will host the men's Champions League final on 2 June 2029.",
    ],
    museumTitle: "Camp Nou tour tickets: prices and what each includes",
    museum: [
      "The basic **Museum** ticket starts **from €28** and includes the museum, a digital audio guide and a viewpoint over the construction works; it takes about an hour. Only the Spotify Camp Nou Experience adds a view of the stadium bowl, and only the Match Day Tour walks on the pitch. The club advises buying online to avoid queues; a ticket can be changed at the ticket office from €10, except the Spotify Camp Nou Experience, Match Day Tour, Players Experience, BarçaBus and Sky Tour, which cannot be exchanged.",
      "The visit includes an immersive room that the club does not recommend for people with epilepsy or photosensitivity. People with a disability certificate of 33% or more, and one companion, get 50% off, on sale only at the ticket offices. The tour is step-free, with two wheelchairs on loan at the entrance information desk, where pushchairs can also be left.",
    ],
    productsCaption: "Barça Immersive Tour tickets",
    productsHeaders: ["Ticket", "From", "What it includes"],
    productsRows: [
      ["Museum", "€28", "Museum, digital audio guide, viewpoint over the works"],
      ["Museum Flexible", "€38", "The same, any day until 28 February 2027; extras can be added at checkout"],
      ["Total Experience", "€52", "Museum and audio guide, viewpoint, Robokeeper (3 goals), digital souvenir, Barça Virtual Dream"],
      ["BarçaBus Experience", "€59", "Ride on the official Barça bus around the club's surroundings, Museum Flexible, shirt customisation"],
      ["Spotify Camp Nou Experience", "€69", "Panoramic view inside the stadium plus Museum Flexible with audio guide; some sessions in Catalan, Spanish and English at times the club lists, the rest in English"],
      ["Players Experience – Training City", "€99", "Guided visit to the first team's private spaces at its training ground and to the Estadi Johan Cruyff, with a return transfer"],
      ["Match Day Tour", "€149", "Guided behind-the-scenes tour with a walk on the pitch, on some match days only"],
      ["Barça Sky Tour", "€214", "Helicopter flight over Barcelona plus Museum Flexible"],
    ],
    productsNote: "Adult 'from' prices on fcbarcelona.com, checked on 28 October 2026. The club does not publish child or senior prices on these pages.",
    hoursTitle: "Camp Nou museum opening hours",
    hours: [
      "From 19 October to 19 March the museum opens **10:00 to 18:00**; from 20 March to 17 October, 9:30 to 19:00. Last entry is 45 minutes before closing and the visit takes about an hour. The ticket booths open 15 minutes before opening and close 45 minutes before closing. It is closed on 25 December and 1 January.",
      "On match days and some other days the hours change, and the club announces each change on its timetable page: in November 2026 it lists **3 November, open until 21:00**, and **17 November, closing at 17:00**. The club names Saturdays from 15:00 to 17:00 as the quietest time, except on men's first-team match days and from 28 April to 1 September.",
    ],
    matchTitle: "Match tickets",
    match: [
      "Tickets are sold through fcbarcelona.com and the club's own ticket shop, fixture by fixture. Tickets are digital and arrive between 24 and 3 hours before kick-off, and the gates open an hour and a half before the match.",
      "Buy only through the club's official site: it is the one channel the club itself runs.",
    ],
    getTitle: "How to get to Camp Nou",
    get: [
      "**Metro:** TMB recommends Collblanc (L5, L9 Sud and L10 Sud) and Palau Reial (L3) as the closest stations; Les Corts and Badal also serve the stadium.",
      "**Tram:** T1, T2 and T3, at stops such as Palau Reial and Avinguda de Xile.",
      "**Bus:** lines 7, 33, 54, 67, 113, 175, D20, H6, H8, V1, V3 and V5, according to the club.",
      "**On match days** several bus lines are diverted from two hours before kick-off until an hour and a half after the final whistle, and TMB recommends the metro. The club's page lists parking only for motorbikes, coaches, taxis and accessible vehicles.",
    ],
    tipsTitle: "Before you go",
    tips: [
      "**Bags on match days:** the club says there is no luggage storage, and laptops and pushchairs are not allowed into the stadium.",
      "**Arriving from the airport:** the L9 Sud metro stops at Collblanc on its way into the city.",
    ],
    faq: [
      { question: "How much is the Camp Nou tour?", answer: `The basic museum ticket (Barça Immersive Tour) starts from €28 on the club's site, checked on ${VERIFIED}. Museum Flexible is from €38, the Spotify Camp Nou Experience from €69 and the Match Day Tour from €149.` },
      { question: "Does the Camp Nou tour go into the stadium?", answer: "The basic Museum ticket includes a viewpoint over the construction works. The Spotify Camp Nou Experience (from €69) adds a guided panoramic view of the stadium, and only the Match Day Tour (from €149) walks on the pitch." },
      { question: "Is Camp Nou open?", answer: "Yes, in part: FC Barcelona plays its home matches there with a capacity of 62,652 while works continue, and the museum is open every day except 25 December and 1 January." },
      { question: "What are the Camp Nou museum opening hours in winter?", answer: "From 19 October to 19 March, 10:00 to 18:00, with last entry 45 minutes before closing. Hours change on some match days." },
      { question: "How long does the Camp Nou tour take?", answer: "About an hour for the basic museum visit, according to the club." },
      { question: "Which metro stop is Camp Nou?", answer: "Collblanc (L5, L9 Sud, L10 Sud) or Palau Reial (L3), according to TMB." },
    ],
    note: "The stadium works change access and hours: check the club's page before you go.",
  },
  es: {
    lead: "**La visita al Camp Nou y al museo del Barça, que ahora se llama Barça Immersive Tour, cuesta desde 28 €** y abre **de 10:00 a 18:00 todos los días del 19 de octubre al 19 de marzo**, con última entrada 45 minutos antes del cierre; cierra el 25 de diciembre y el 1 de enero. La entrada básica incluye el museo, una audioguía y un mirador sobre las obras; una vista panorámica guiada del estadio viene con la Spotify Camp Nou Experience, desde 69 €. Para llegar, el metro: Collblanc (L5, L9 Sud, L10 Sud) o Palau Reial (L3). El estadio solo está abierto en parte mientras siguen las obras. Precios y horarios de las páginas del club, a 28 de octubre de 2026.",
    statusTitle: "El estadio ahora mismo",
    status: [
      "El club reabre el estadio por fases. Desde marzo de 2026 el aforo es de **62.652 espectadores**, y el anuncio del Season Pass 2026-27 del club dice que el aforo sigue limitado. No hay fecha de finalización anunciada. Terminado, el estadio tendrá más de 104.000 localidades, y acogerá la final masculina de la Champions el 2 de junio de 2029.",
    ],
    museumTitle: "Precio de la visita al Camp Nou y qué incluye cada entrada",
    museum: [
      "La entrada básica **Museum** empieza **desde 28 €** e incluye el museo, una audioguía digital y un mirador sobre las obras; la visita dura una hora. Solo la Spotify Camp Nou Experience añade una vista del interior del estadio, y solo el Match Day Tour pisa el césped. El club aconseja comprar en línea para evitar colas; la entrada se puede cambiar en taquilla desde 10 €, salvo la Spotify Camp Nou Experience, el Match Day Tour, la Players Experience, el BarçaBus y el Sky Tour, que no admiten cambios.",
      "La visita incluye una sala inmersiva que el club no recomienda a personas con epilepsia o fotosensibilidad. Las personas con un certificado de discapacidad igual o superior al 33 %, y un acompañante, tienen un 50 % de descuento, que solo se vende en taquilla. El recorrido es accesible, con dos sillas de ruedas en préstamo en el punto de información de la entrada, donde también se pueden dejar los cochecitos.",
    ],
    productsCaption: "Entradas del Barça Immersive Tour",
    productsHeaders: ["Entrada", "Desde", "Qué incluye"],
    productsRows: [
      ["Museum", "28 €", "Museo, audioguía digital, mirador sobre las obras"],
      ["Museum Flexible", "38 €", "Lo mismo, cualquier día hasta el 28 de febrero de 2027; se pueden añadir extras al comprar"],
      ["Total Experience", "52 €", "Museo y audioguía, mirador, Robokeeper (3 goles), recuerdo digital, Barça Virtual Dream"],
      ["BarçaBus Experience", "59 €", "Viaje en el autobús oficial del Barça por el entorno del club, Museum Flexible, personalización de la camiseta"],
      ["Spotify Camp Nou Experience", "69 €", "Vista panorámica dentro del estadio y Museum Flexible con audioguía; algunos pases en catalán, castellano e inglés a las horas que indica el club, el resto en inglés"],
      ["Players Experience – Training City", "99 €", "Visita guiada a los espacios privados del primer equipo en su ciudad deportiva y al Estadi Johan Cruyff, con traslado de ida y vuelta"],
      ["Match Day Tour", "149 €", "Visita guiada entre bastidores pisando el césped, solo algunos días de partido"],
      ["Barça Sky Tour", "214 €", "Vuelo en helicóptero sobre Barcelona y Museum Flexible"],
    ],
    productsNote: "Precios «desde» de adulto en fcbarcelona.com, comprobados el 28 de octubre de 2026. El club no publica precios infantiles ni sénior en estas páginas.",
    hoursTitle: "Horario del museo del Camp Nou",
    hours: [
      "Del 19 de octubre al 19 de marzo el museo abre **de 10:00 a 18:00**; del 20 de marzo al 17 de octubre, de 9:30 a 19:00. La última entrada es 45 minutos antes del cierre y la visita dura una hora. Las taquillas abren 15 minutos antes de la apertura y cierran 45 minutos antes del cierre. Cierra el 25 de diciembre y el 1 de enero.",
      "Los días de partido y algunos otros días el horario cambia, y el club anuncia cada cambio en su página de horarios: en noviembre de 2026 indica **el 3 de noviembre, abierto hasta las 21:00**, y **el 17 de noviembre, cierre a las 17:00**. El club señala los sábados de 15:00 a 17:00 como el momento más tranquilo, excepto los días de partido del primer equipo masculino y del 28 de abril al 1 de septiembre.",
    ],
    matchTitle: "Entradas de partido",
    match: [
      "Las entradas se venden en fcbarcelona.com y en la tienda de entradas del club, partido a partido. Son digitales y llegan entre 24 y 3 horas antes del partido, y las puertas abren una hora y media antes.",
      "Compra solo en la web oficial del club: es el único canal que gestiona el propio club.",
    ],
    getTitle: "Cómo llegar al museo del Barça",
    get: [
      "**Metro:** TMB recomienda Collblanc (L5, L9 Sud y L10 Sud) y Palau Reial (L3) como las estaciones más cercanas; Les Corts y Badal también quedan cerca.",
      "**Tranvía:** T1, T2 y T3, en paradas como Palau Reial y Avinguda de Xile.",
      "**Autobús:** líneas 7, 33, 54, 67, 113, 175, D20, H6, H8, V1, V3 y V5, según el club.",
      "**Los días de partido** varias líneas de bus se desvían desde dos horas antes hasta una hora y media después del final, y TMB recomienda el metro. La página del club solo indica aparcamiento para motos, autocares, taxis y vehículos adaptados.",
    ],
    tipsTitle: "Antes de ir",
    tips: [
      "**Equipaje los días de partido:** el club dice que no hay consigna, y no se permiten portátiles ni cochecitos en el estadio.",
      "**Si llegas del aeropuerto:** el metro L9 Sud para en Collblanc de camino a la ciudad.",
    ],
    faq: [
      { question: "¿Cuánto cuesta visitar el Camp Nou?", answer: `La entrada básica al museo (Barça Immersive Tour) empieza desde 28 € en la web del club, comprobado el ${VERIFIED}. Museum Flexible, desde 38 €; la Spotify Camp Nou Experience, desde 69 €, y el Match Day Tour, desde 149 €.` },
      { question: "¿La visita al Camp Nou entra en el estadio?", answer: "La entrada básica incluye un mirador sobre las obras. La Spotify Camp Nou Experience (desde 69 €) añade una vista panorámica guiada del estadio, y solo el Match Day Tour (desde 149 €) pisa el césped." },
      { question: "¿El Camp Nou está abierto?", answer: "Sí, en parte: el FC Barcelona juega allí sus partidos con un aforo de 62.652 mientras siguen las obras, y el museo abre todos los días excepto el 25 de diciembre y el 1 de enero." },
      { question: "¿Qué horario tiene el museo del Camp Nou?", answer: "Del 19 de octubre al 19 de marzo, de 10:00 a 18:00; del 20 de marzo al 17 de octubre, de 9:30 a 19:00. La última entrada es 45 minutos antes del cierre, y el horario cambia algunos días de partido." },
      { question: "¿Cuánto dura la visita al museo del Barça?", answer: "Una hora la visita básica, según el club." },
      { question: "¿Cómo llegar al museo del Barça?", answer: "En metro, a Collblanc (L5, L9 Sud, L10 Sud) o Palau Reial (L3), las estaciones que recomienda TMB; también en tranvía (T1, T2, T3, parada Palau Reial) o en las líneas de bus 7, 33, 54, 67, 113, 175, D20, H6, H8, V1, V3 y V5." },
      { question: "¿Qué parada de metro es el Camp Nou?", answer: "Collblanc (L5, L9 Sud, L10 Sud) o Palau Reial (L3), según TMB." },
    ],
    note: "Las obras del estadio cambian accesos y horarios: compruébalo en la web del club antes de ir.",
  },
  ca: {
    lead: "**La visita al Camp Nou, que ara es diu Barça Immersive Tour, costa des de 28 €** i obre **de 10:00 a 18:00 cada dia del 19 d'octubre al 19 de març**, amb última entrada 45 minuts abans del tancament; tanca el 25 de desembre i l'1 de gener. L'entrada bàsica inclou el museu, una audioguia i un mirador sobre les obres; una vista panoràmica guiada de l'estadi ve amb la Spotify Camp Nou Experience, des de 69 €. El FC Barcelona ha tornat al **Spotify Camp Nou**, però l'estadi només és obert en part mentre continuen les obres. Preus i horaris de les pàgines del club, a 28 d'octubre de 2026.",
    statusTitle: "L'estadi ara mateix",
    status: [
      "El club reobre l'estadi per fases. Des del març del 2026 l'aforament és de **62.652 espectadors**, i l'anunci del Season Pass 2026-27 del club diu que l'aforament continua limitat. No hi ha data d'acabament anunciada. Acabat, l'estadi tindrà més de 104.000 localitats, i acollirà la final masculina de la Champions el 2 de juny del 2029.",
    ],
    museumTitle: "Preu de la visita al Camp Nou i què inclou cada entrada",
    museum: [
      "L'entrada bàsica **Museum** comença **des de 28 €** i inclou el museu, una audioguia digital i un mirador sobre les obres; la visita dura una hora. Només la Spotify Camp Nou Experience hi afegeix una vista de l'interior de l'estadi, i només el Match Day Tour trepitja la gespa. El club aconsella comprar en línia per evitar cues; l'entrada es pot canviar a taquilla des de 10 €, llevat de la Spotify Camp Nou Experience, el Match Day Tour, la Players Experience, el BarçaBus i el Sky Tour, que no admeten canvis.",
      "La visita inclou una sala immersiva que el club no recomana a persones amb epilèpsia o fotosensibilitat. Les persones amb un certificat de discapacitat igual o superior al 33 %, i un acompanyant, tenen un 50 % de descompte, que només es ven a taquilla. El recorregut és accessible, amb dues cadires de rodes en préstec al punt d'informació de l'entrada, on també es poden deixar els cotxets.",
    ],
    productsCaption: "Entrades del Barça Immersive Tour",
    productsHeaders: ["Entrada", "Des de", "Què inclou"],
    productsRows: [
      ["Museum", "28 €", "Museu, audioguia digital, mirador sobre les obres"],
      ["Museum Flexible", "38 €", "El mateix, qualsevol dia fins al 28 de febrer de 2027; s'hi poden afegir extres en comprar"],
      ["Total Experience", "52 €", "Museu i audioguia, mirador, Robokeeper (3 gols), record digital, Barça Virtual Dream"],
      ["BarçaBus Experience", "59 €", "Viatge a l'autobús oficial del Barça per l'entorn del club, Museum Flexible, personalització de la samarreta"],
      ["Spotify Camp Nou Experience", "69 €", "Vista panoràmica dins de l'estadi i Museum Flexible amb audioguia; alguns passis en català, castellà i anglès a les hores que indica el club, la resta en anglès"],
      ["Players Experience – Training City", "99 €", "Visita guiada als espais privats del primer equip a la seva ciutat esportiva i a l'Estadi Johan Cruyff, amb trasllat d'anada i tornada"],
      ["Match Day Tour", "149 €", "Visita guiada entre bastidors trepitjant la gespa, només alguns dies de partit"],
      ["Barça Sky Tour", "214 €", "Vol en helicòpter sobre Barcelona i Museum Flexible"],
    ],
    productsNote: "Preus «des de» d'adult a fcbarcelona.com, comprovats el 28 d'octubre de 2026. El club no publica preus infantils ni sèniors en aquestes pàgines.",
    hoursTitle: "Horari del museu del Camp Nou",
    hours: [
      "Del 19 d'octubre al 19 de març el museu obre **de 10:00 a 18:00**; del 20 de març al 17 d'octubre, de 9:30 a 19:00. L'última entrada és 45 minuts abans del tancament i la visita dura una hora. Les taquilles obren 15 minuts abans de l'obertura i tanquen 45 minuts abans del tancament. Tanca el 25 de desembre i l'1 de gener.",
      "Els dies de partit i alguns altres dies l'horari canvia, i el club anuncia cada canvi a la seva pàgina d'horaris: al novembre del 2026 hi indica **el 3 de novembre, obert fins a les 21:00**, i **el 17 de novembre, tancament a les 17:00**. El club assenyala els dissabtes de 15:00 a 17:00 com el moment més tranquil, excepte els dies de partit del primer equip masculí i del 28 d'abril a l'1 de setembre.",
    ],
    matchTitle: "Entrades de partit",
    match: [
      "Les entrades es venen a fcbarcelona.com i a la botiga d'entrades del club, partit a partit. Són digitals i arriben entre 24 i 3 hores abans del partit, i les portes obren una hora i mitja abans.",
      "Compra només al web oficial del club: és l'únic canal que gestiona el mateix club.",
    ],
    getTitle: "Com arribar al museu del Barça",
    get: [
      "**Metro:** TMB recomana Collblanc (L5, L9 Sud i L10 Sud) i Palau Reial (L3) com les estacions més properes; les Corts i Badal també hi queden a prop.",
      "**Tramvia:** T1, T2 i T3, a parades com Palau Reial i Avinguda de Xile.",
      "**Autobús:** línies 7, 33, 54, 67, 113, 175, D20, H6, H8, V1, V3 i V5, segons el club.",
      "**Els dies de partit** diverses línies de bus es desvien des de dues hores abans fins a una hora i mitja després del final, i TMB recomana el metro. La pàgina del club només indica aparcament per a motos, autocars, taxis i vehicles adaptats.",
    ],
    tipsTitle: "Abans d'anar-hi",
    tips: [
      "**Equipatge els dies de partit:** el club diu que no hi ha consigna, i no es permeten portàtils ni cotxets a l'estadi.",
      "**Si arribes de l'aeroport:** el metro L9 Sud para a Collblanc camí de la ciutat.",
    ],
    faq: [
      { question: "Quant costa visitar el Camp Nou?", answer: `L'entrada bàsica al museu (Barça Immersive Tour) comença des de 28 € al web del club, comprovat el ${VERIFIED}. Museum Flexible, des de 38 €; la Spotify Camp Nou Experience, des de 69 €, i el Match Day Tour, des de 149 €.` },
      { question: "La visita al Camp Nou entra a l'estadi?", answer: "L'entrada bàsica inclou un mirador sobre les obres. La Spotify Camp Nou Experience (des de 69 €) hi afegeix una vista panoràmica guiada de l'estadi, i només el Match Day Tour (des de 149 €) trepitja la gespa." },
      { question: "El Camp Nou és obert?", answer: "Sí, en part: el FC Barcelona hi juga els partits amb un aforament de 62.652 mentre continuen les obres, i el museu obre cada dia excepte el 25 de desembre i l'1 de gener." },
      { question: "Quin horari té el museu del Camp Nou a l'hivern?", answer: "Del 19 d'octubre al 19 de març, de 10:00 a 18:00, amb última entrada 45 minuts abans del tancament. Canvia alguns dies de partit." },
      { question: "Quant dura la visita al museu del Barça?", answer: "Una hora la visita bàsica, segons el club." },
      { question: "Quina parada de metro és el Camp Nou?", answer: "Collblanc (L5, L9 Sud, L10 Sud) o Palau Reial (L3), segons TMB." },
    ],
    note: "Les obres de l'estadi canvien accessos i horaris: comprova-ho al web del club abans d'anar-hi.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.statusTitle, ...t.status),
    ...h2(t.museumTitle, ...t.museum),
    table(t.productsCaption, t.productsHeaders, t.productsRows, t.productsNote),
    ...h2(t.hoursTitle, ...t.hours),
    ...h2(t.matchTitle, ...t.match),
    ...h2(t.getTitle),
    list(...t.get),
    ...h2(t.tipsTitle),
    list(...t.tips),
    faq(t.faq),
    ...b2Related(["hours", "transport", "monuments", "cards", "airport"], locale),
  ];
}

export const CAMPNOU: B2Article = {
  key: "campnou",
  entryKey: "guide-spotify-camp-nou-visit",
  categoryKey: "culture",
  sources: SOURCES,
  heroKey: "campnou-dia-de-partit",
  heroAlt: {
    ca: "Aficionats amb samarretes del Barça davant de les grades del Camp Nou un dia de partit",
    es: "Aficionados con camisetas del Barça frente a las gradas del Camp Nou un día de partido",
    en: "Fans in Barça shirts outside the Camp Nou stands on a match day",
  },
  heroCaption: {
    ca: "Dia de partit al Camp Nou, abans de les obres de remodelació.",
    es: "Día de partido en el Camp Nou, antes de las obras de remodelación.",
    en: "Match day at the Camp Nou, before the rebuilding works.",
  },
  secondaryKey: "campnou-estatua-kubala",
  secondaryAlt: {
    ca: "L'estàtua de Ladislau Kubala xutant una pilota, a l'exterior del Camp Nou",
    es: "La estatua de Ladislao Kubala chutando un balón, en el exterior del Camp Nou",
    en: "The statue of Ladislao Kubala kicking a ball, outside the Camp Nou",
  },
  secondaryCaption: {
    ca: "L'estàtua de Kubala, a l'exterior de l'estadi.",
    es: "La estatua de Kubala, en el exterior del estadio.",
    en: "The Kubala statue outside the stadium.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T21:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as CAMPNOU_META };
