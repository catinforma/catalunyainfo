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
 * Barcelona Card or Hola Barcelona: which one is worth it.
 *
 * Prices from TMB / holabarcelona.com (Hola Barcelona) and Turisme de
 * Barcelona's shop thisisbarcelona.com (Barcelona Card), checked on 12 Oct
 * 2026; fact pack: research_notes/blog-batch-03/cards.md. barcelonacard.org
 * and bcn.travel are third-party resellers selling different products and are
 * never used as a source.
 *
 * The break-even sums use only figures verified on official sites: the card
 * prices above and the museum prices from the free-museums fact pack (MNAC
 * €12, Museu Picasso €12 online, Fundació Miró €17 online).
 *
 * Left out on purpose: whether the Barcelona Card counts hours or calendar
 * days (its own product page and terms disagree), and whether it covers FGC
 * (not on the official list).
 */

// Re-checked 24 Oct 2026: Hola Barcelona fares from TMB's own catalogue API
// behind holabarcelona.com (products 505-509: 12.50/18.70/27.30/35.60/43.60),
// coverage and "10% discount" text from the Hola product page, airport ticket
// €5.90 from tmb.cat; Barcelona Card full and online prices, child and
// Essential prices from thisisbarcelona.com's availability endpoint for the
// product; museum prices from museupicassobcn.cat, fmirobcn.org and
// museunacional.cat.
//
// Re-checked 28 Oct 2026 (page-1 push for "hola barcelona travel card"):
// the catalogue the Hola product page loads (TMB business parameters 505.b)
// still prices 505-509 at 12.5/18.7/27.3/35.6/43.6, active since 1 Jan 2026;
// the page renders "-10% Desde 12,50 € 11,25 €" and says the voucher code is
// exchanged at a vending machine in any metro station, the booking is valid
// 180 days and at most to the last day of February of the next year, and the
// card covers metro and TMB bus, NitBus, the Montjuïc funicular, FGC and
// Rodalies zone 1 and the tram, not the cable car. thisisbarcelona.com: the
// same 39/59/69/79 (online 35.10/53.10/62.10/71.10), child 27/37/46/54,
// Essential 29/35/45; collection offices; terms "valid for consecutive days,
// not for 24-hour periods" and "valid until the end of the current year";
// free cancellation up to 24 hours before; La Pedrera's €7 off applies to the
// adult Essential ticket from 14:00. Museums: MNAC €12, free on Saturdays
// from 15:00 and the first Sunday, under 16 and over 65 free; Picasso €12
// online (€13 at the desk), free Thursdays 16:00-19:00 and the first Sunday
// with booking, under 18 free; Miró €17 online (€18 at the desk).
const VERIFIED = "2026-10-28";

const SOURCES: B2Source[] = [
  { name: "Hola Barcelona Travel Card", url: "https://www.holabarcelona.com/en", publisher: "TMB" },
  { name: "Metro and bus fares", url: "https://www.tmb.cat/en/barcelona-fares-metro-bus", publisher: "TMB" },
  { name: "Barcelona Card", url: "https://thisisbarcelona.com/tickets/barcelona-card", publisher: "Turisme de Barcelona" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/barcelona-card-o-hola-barcelona",
    title: "Barcelona Card o Hola Barcelona: quina targeta surt a compte",
    seoTitle: "Barcelona Card o Hola Barcelona: quina surt a compte?",
    seoDescription:
      "Preus oficials de la Barcelona Card (des de 39 €) i la Hola Barcelona (des de 12,50 €), què inclou cadascuna i quan surt a compte la Card.",
    excerpt:
      "Les dues targetes per a visitants de Barcelona comparades amb els preus oficials: què cobreix cadascuna i el compte que diu quan surt a compte la Barcelona Card.",
  },
  es: {
    path: "guias/barcelona-card-o-hola-barcelona",
    title: "Hola Barcelona Travel Card o Barcelona Card: precios 2026 y cuál compensa",
    seoTitle: "Hola Barcelona Travel Card 2026: precios y cuándo compensa",
    seoDescription:
      "Hola Barcelona Travel Card: de 12,50 € (24 h) a 43,60 € (120 h), con metro al aeropuerto. Barcelona Card desde 39 €: precios oficiales y cuál compensa.",
    excerpt:
      "Las dos tarjetas para visitantes de Barcelona comparadas con los precios oficiales: qué cubre cada una y la cuenta que dice cuándo compensa la Barcelona Card.",
  },
  en: {
    path: "guides/barcelona-card-vs-hola-barcelona",
    title: "Barcelona Card or Hola Barcelona: which card is worth it",
    seoTitle: "Barcelona Card vs Hola Barcelona: prices, which is worth it",
    seoDescription:
      "Hola Barcelona Travel Card from €12.50 (24 h) and Barcelona Card from €39 (48 h): official 2026 prices, what each covers, and when the Card pays off.",
    excerpt:
      "Barcelona's two visitor cards compared on official prices: what each one covers, and the sum that tells you when the Barcelona Card pays for itself.",
  },
};

type T = {
  lead: string;
  tableCaption: string;
  headers: string[];
  rows: string[][];
  tableNote: string;
  holaTitle: string;
  hola: string[];
  cardTitle: string;
  card: string[];
  sumTitle: string;
  sum: string[];
  notTitle: string;
  not: string[];
  pickTitle: string;
  pick: string[];
  warnTitle: string;
  warn: string;
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "The **Hola Barcelona Travel Card** is unlimited public transport and nothing else: **€12.50 for 24 hours up to €43.60 for 120 hours**, airport metro included. The **Barcelona Card** adds free entry to more than 25 museums and cultural venues and costs roughly twice as much: **€39 for 48 hours up to €79 for 120 hours**. Whether it pays off depends on one thing: how many paid museums you would have visited anyway.",
    tableCaption: "Price by duration (adult, full price)",
    headers: ["Duration", "Hola Barcelona", "Barcelona Card (with transport)", "Barcelona Card online", "Difference"],
    rows: [
      ["24 hours", "€12.50", "—", "—", "—"],
      ["48 hours", "€18.70", "€39", "€35.10", "€20.30"],
      ["72 hours", "€27.30", "€59", "€53.10", "€31.70"],
      ["96 hours", "€35.60", "€69", "€62.10", "€33.40"],
      ["120 hours", "€43.60", "€79", "€71.10", "€35.40"],
    ],
    tableNote: "Full prices from TMB (Hola Barcelona) and Turisme de Barcelona (Barcelona Card), checked on 28 October 2026; the difference is between full prices. Both are cheaper online: TMB advertises 10% off Hola Barcelona, and the Barcelona Card's official shop sells it 10% below full price. There is no 24-hour Barcelona Card.",
    holaTitle: "Hola Barcelona Travel Card: price and what it covers",
    hola: [
      "Run by TMB, it covers the metro and TMB buses, the NitBus night buses, the Montjuïc funicular, the tram, FGC trains in zone 1 and Rodalies trains in zone 1, for 24 to 120 consecutive hours from the first validation. A 24-hour card costs €12.50.",
      "It includes **one metro trip from the airport and one back** on the L9 Sud, which on its own is worth €11.80 at the €5.90 airport-ticket price. The Montjuïc cable car is not included. Children under 4 travel free on public transport anyway.",
      "**Buying and collecting it:** on TMB's holabarcelona.com it is 10% cheaper (the 24-hour card is €11.25 instead of €12.50). You get a voucher code by email and swap it for the card at a ticket machine in any metro station; the booking is valid for 180 days from purchase and at most until the last day of February of the following year. The card is personal and can be reloaded at the metro machines with another Hola Barcelona once it runs out.",
    ],
    cardTitle: "Barcelona Card: transport plus museums",
    card: [
      "Sold by Turisme de Barcelona, the version with transport covers the metro, TMB buses, the tram, Rodalies zone 1, the Montjuïc funicular and the metro or train to the airport. It does **not** include night buses. Child prices (ages 4 to 12) are €27, €37, €46 and €54 for 48 to 120 hours.",
      "It is a contactless card that starts when you first use it at a venue. Turisme de Barcelona's terms of use say it is valid for **consecutive days, not 24-hour periods**, even though it is sold as 48 to 120 hours, and that it is valid until the end of the current year. Bought online, it can be cancelled free up to 24 hours before and is collected at the tourist offices: Barcelona airport (T1 and T2), Plaça de Catalunya, Plaça d'Espanya, the Sagrada Família booth and the Columbus viewpoint.",
      "It gives free entry to more than 25 museums and venues, among them the **Museu Picasso, the MNAC and the Fundació Joan Miró**, as well as CosmoCaixa, the MACBA and the Castell de Montjuïc, and discounts elsewhere: €7 off at Casa Batlló and on La Pedrera's adult Essential ticket from 14:00. The Sagrada Família and Park Güell are not included. There is also a cheaper **Barcelona Card Essential**, without transport: €29 for 72 hours, €35 for 96 and €45 for 120 (children 4 to 12: €15, €17 and €20).",
    ],
    sumTitle: "The sum: when the Barcelona Card pays off",
    sum: [
      "Over 72 hours the Barcelona Card costs **€31.70 more** than the Hola Barcelona. The three best-known museums it includes cost €12 (MNAC), €12 (Museu Picasso, online) and €17 (Fundació Miró, online): **€41** in total. Visit all three on paid tickets and the card wins by about €9; visit two and the Hola Barcelona plus tickets is cheaper.",
      "Two things tip the balance back. Several of these museums have **free slots** (the Picasso on Thursdays from 16:00 to 19:00 and on the first Sunday, with booking; the MNAC on Saturdays from 15:00 and on the first Sunday), and under-18s enter the Picasso free, as do under-16s and over-65s at the MNAC. If your plans fit those slots, the card's museum value shrinks.",
    ],
    notTitle: "What neither card includes",
    not: [
      "The **Aerobús** shuttle (both cards include the airport metro, the Barcelona Card also the train).",
      `The **Sagrada Família** and **Park Güell**, which sell ${b2link("monuments", "en", "their own timed tickets")}.`,
      "The **Montjuïc cable car**.",
    ],
    pickTitle: "Which one to buy",
    pick: [
      "**Mostly walking, beaches and the Gaudí sights:** Hola Barcelona, or even a T-casual if you make fewer than ten journeys.",
      "**Three or more paid museums in a short stay, on dates without free slots:** Barcelona Card.",
      "**Arriving by air:** both cover the airport metro; with Hola Barcelona that is one trip each way.",
    ],
    warnTitle: "Buy from the official sellers",
    warn: "Search results are full of resellers, and at least one site using the 'Barcelona Card' name sells different products at different prices. The Barcelona Card is Turisme de Barcelona's (thisisbarcelona.com); Hola Barcelona is TMB's.",
    faq: [
      { question: "Is the Hola Barcelona travel card worth it?", answer: "If you ride a lot or use the airport metro, yes: an airport metro ticket alone is €5.90 each way, and the card includes one trip each way. If you will make fewer than ten journeys in total, a T-casual is cheaper." },
      { question: "How much is the Hola Barcelona card?", answer: "€12.50 for 24 hours, €18.70 for 48, €27.30 for 72, €35.60 for 96 and €43.60 for 120 hours at full price; TMB advertises 10% off online." },
      { question: "How much is the Barcelona Card?", answer: "With transport, €39 for 48 hours, €59 for 72, €69 for 96 and €79 for 120 hours at full price, with 10% off on the official shop." },
      { question: "Does the Barcelona Card include the Sagrada Família?", answer: "No. Neither the Sagrada Família nor Park Güell is included; Casa Batlló and La Pedrera's adult Essential ticket from 14:00 get a €7 discount." },
      { question: "Does Hola Barcelona include the airport?", answer: "Yes: one metro journey from the airport and one back, on the L9 Sud. The Aerobús is not included." },
      { question: "Where do I pick up the Hola Barcelona card?", answer: "At a ticket machine in any metro station, with the voucher code TMB emails you after buying online. The booking is valid for 180 days and at most until the end of February of the following year." },
      { question: "Is the Barcelona Card valid for 48 hours or two days?", answer: "Turisme de Barcelona sells it as 48 to 120 hours, but its terms of use say it is valid for consecutive days, not 24-hour periods. It starts the first time you use it at a venue." },
    ],
    note: "Card prices and what they include change: check the official sellers before buying.",
  },
  es: {
    lead: "La **Hola Barcelona Travel Card** es transporte público ilimitado y nada más: **de 12,50 € (24 horas) a 43,60 € (120 horas)**, con el metro del aeropuerto incluido. La **Barcelona Card** añade entrada gratis a más de 25 museos y espacios culturales y cuesta aproximadamente el doble: **de 39 € (48 horas) a 79 € (120 horas)**. Que compense depende de una sola cosa: cuántos museos de pago habrías visitado igualmente.",
    tableCaption: "Precio según la duración (adulto, precio completo)",
    headers: ["Duración", "Hola Barcelona", "Barcelona Card (con transporte)", "Barcelona Card en línea", "Diferencia"],
    rows: [
      ["24 horas", "12,50 €", "—", "—", "—"],
      ["48 horas", "18,70 €", "39 €", "35,10 €", "20,30 €"],
      ["72 horas", "27,30 €", "59 €", "53,10 €", "31,70 €"],
      ["96 horas", "35,60 €", "69 €", "62,10 €", "33,40 €"],
      ["120 horas", "43,60 €", "79 €", "71,10 €", "35,40 €"],
    ],
    tableNote: "Precios completos de TMB (Hola Barcelona) y Turisme de Barcelona (Barcelona Card), comprobados el 28 de octubre de 2026; la diferencia es entre precios completos. Las dos son más baratas en línea: TMB anuncia un 10 % de descuento en la Hola Barcelona, y la tienda oficial vende la Barcelona Card un 10 % por debajo del precio completo. No hay Barcelona Card de 24 horas.",
    holaTitle: "Hola Barcelona Travel Card: precio y qué incluye",
    hola: [
      "Es de TMB y cubre el metro y los autobuses de TMB, el NitBus, el funicular de Montjuïc, el tranvía, los FGC en zona 1 y Rodalies en zona 1, durante 24 a 120 horas seguidas desde la primera validación. La de 24 horas cuesta 12,50 €.",
      "Incluye **un viaje en metro desde el aeropuerto y otro de vuelta** en la L9 Sud, que por sí solo vale 11,80 € al precio del billete aeropuerto (5,90 €). No incluye el teleférico de Montjuïc. Los menores de 4 años viajan gratis en el transporte público de todas formas.",
      "**Cómo se compra y se recoge:** en holabarcelona.com, la web de TMB, es un 10 % más barata (la de 24 horas, 11,25 € en vez de 12,50 €). Recibes por correo un código que se canjea por la tarjeta en una máquina de cualquier estación de metro; la reserva vale 180 días desde la compra y, como máximo, hasta el último día de febrero del año siguiente. La tarjeta es personal y, cuando se agota, se puede recargar con otra Hola Barcelona en las máquinas del metro.",
    ],
    cardTitle: "Barcelona Card: transporte y museos",
    card: [
      "La vende Turisme de Barcelona; la versión con transporte cubre el metro, los autobuses de TMB, el tranvía, Rodalies en zona 1, el funicular de Montjuïc y el metro o el tren al aeropuerto. **No** incluye los autobuses nocturnos. Los precios infantiles (de 4 a 12 años) son 27, 37, 46 y 54 € para 48 a 120 horas.",
      "Es una tarjeta sin contacto que empieza a contar la primera vez que la usas en un museo o espacio. Las condiciones de uso de Turisme de Barcelona dicen que vale por **días consecutivos, no por periodos de 24 horas**, aunque se vende como de 48 a 120 horas, y que es válida hasta el final del año en curso. Comprada en línea, se puede cancelar gratis hasta 24 horas antes y se recoge en las oficinas de turismo: aeropuerto (T1 y T2), plaza de Catalunya, plaza de Espanya, el punto de la Sagrada Familia y el Mirador de Colón.",
      "Da entrada gratis a más de 25 museos y espacios, entre ellos el **Museu Picasso, el MNAC y la Fundació Joan Miró**, además de CosmoCaixa, el MACBA y el Castell de Montjuïc, y descuentos en otros: 7 € menos en la Casa Batlló y en la entrada Essential de adulto de La Pedrera a partir de las 14:00. La Sagrada Familia y el Park Güell no están incluidos. También existe una **Barcelona Card Essential**, más barata y sin transporte: 29 € las 72 horas, 35 € las 96 y 45 € las 120 (niños de 4 a 12 años: 15, 17 y 20 €).",
    ],
    sumTitle: "La cuenta: cuándo compensa la Barcelona Card",
    sum: [
      "En 72 horas la Barcelona Card cuesta **31,70 € más** que la Hola Barcelona. Los tres museos más conocidos que incluye cuestan 12 € (MNAC), 12 € (Museu Picasso, en línea) y 17 € (Fundació Miró, en línea): **41 €** en total. Si visitas los tres pagando, la tarjeta gana por unos 9 €; si visitas dos, sale más barato la Hola Barcelona más las entradas.",
      "Dos cosas inclinan la balanza al revés. Varios de estos museos tienen **franjas gratuitas** (el Picasso los jueves de 16:00 a 19:00 y el primer domingo, con reserva; el MNAC los sábados desde las 15:00 y el primer domingo), y los menores de 18 entran gratis al Picasso, igual que los menores de 16 y los mayores de 65 al MNAC. Si tus planes encajan en esas franjas, el valor de la tarjeta en museos se reduce.",
    ],
    notTitle: "Lo que no incluye ninguna de las dos",
    not: [
      "El **Aerobús** (las dos incluyen el metro del aeropuerto, y la Barcelona Card también el tren).",
      `La **Sagrada Familia** y el **Park Güell**, que venden ${b2link("monuments", "es", "sus propias entradas con hora")}.`,
      "El **teleférico de Montjuïc**.",
    ],
    pickTitle: "Cuál comprar",
    pick: [
      "**Sobre todo caminar, playa y obras de Gaudí:** Hola Barcelona, o incluso una T-casual si haces menos de diez viajes.",
      "**Tres o más museos de pago en una estancia corta, en días sin franjas gratuitas:** Barcelona Card.",
      "**Llegas en avión:** las dos cubren el metro del aeropuerto; con la Hola Barcelona es un viaje de ida y uno de vuelta.",
    ],
    warnTitle: "Compra en los vendedores oficiales",
    warn: "Los resultados de búsqueda están llenos de revendedores, y al menos una web que usa el nombre «Barcelona Card» vende otros productos a otros precios. La Barcelona Card es de Turisme de Barcelona (thisisbarcelona.com); la Hola Barcelona, de TMB.",
    faq: [
      { question: "¿Merece la pena la Hola Barcelona Travel Card?", answer: "Si haces muchos trayectos o usas el metro del aeropuerto, sí: solo el billete de metro del aeropuerto cuesta 5,90 € por trayecto, y la tarjeta incluye uno de ida y otro de vuelta. Si vas a hacer menos de diez viajes en total, sale más barata una T-casual." },
      { question: "¿Cuánto cuesta la Hola Barcelona?", answer: "12,50 € las 24 horas, 18,70 € las 48, 27,30 € las 72, 35,60 € las 96 y 43,60 € las 120 a precio completo; TMB anuncia un 10 % de descuento en línea." },
      { question: "¿Cuánto cuesta la Barcelona Card?", answer: "Con transporte, 39 € las 48 horas, 59 € las 72, 69 € las 96 y 79 € las 120 a precio completo, con un 10 % de descuento en la tienda oficial." },
      { question: "¿La Barcelona Card incluye la Sagrada Familia?", answer: "No. Ni la Sagrada Familia ni el Park Güell están incluidos; la Casa Batlló y la entrada Essential de adulto de La Pedrera a partir de las 14:00 tienen 7 € de descuento." },
      { question: "¿La Hola Barcelona incluye el aeropuerto?", answer: "Sí: un viaje en metro desde el aeropuerto y otro de vuelta, en la L9 Sud. El Aerobús no está incluido." },
      { question: "¿La Hola Barcelona incluye el bus nocturno?", answer: "Sí, el NitBus, además del metro, los autobuses de TMB, el tranvía, el funicular de Montjuïc y FGC y Rodalies en zona 1. No incluye el teleférico de Montjuïc." },
      { question: "¿Dónde se recoge la Hola Barcelona Travel Card?", answer: "En una máquina de cualquier estación de metro, con el código que TMB envía por correo al comprarla en línea. La reserva vale 180 días y, como máximo, hasta el final de febrero del año siguiente." },
      { question: "¿La Barcelona Card de 48 horas vale dos días?", answer: "Turisme de Barcelona la vende como de 48 a 120 horas, pero sus condiciones de uso dicen que vale por días consecutivos, no por periodos de 24 horas. Empieza a contar la primera vez que la usas." },
    ],
    note: "Los precios y lo que incluye cada tarjeta cambian: compruébalo en los vendedores oficiales antes de comprar.",
  },
  ca: {
    lead: "La **Hola Barcelona Travel Card** és transport públic il·limitat i res més: **de 12,50 € (24 hores) a 43,60 € (120 hores)**, amb el metro de l'aeroport inclòs. La **Barcelona Card** hi afegeix entrada gratuïta a més de 25 museus i espais culturals i costa aproximadament el doble: **de 39 € (48 hores) a 79 € (120 hores)**. Que surti a compte depèn d'una sola cosa: quants museus de pagament hauries visitat igualment.",
    tableCaption: "Preu segons la durada (adult, preu complet)",
    headers: ["Durada", "Hola Barcelona", "Barcelona Card (amb transport)", "Barcelona Card en línia", "Diferència"],
    rows: [
      ["24 hores", "12,50 €", "—", "—", "—"],
      ["48 hores", "18,70 €", "39 €", "35,10 €", "20,30 €"],
      ["72 hores", "27,30 €", "59 €", "53,10 €", "31,70 €"],
      ["96 hores", "35,60 €", "69 €", "62,10 €", "33,40 €"],
      ["120 hores", "43,60 €", "79 €", "71,10 €", "35,40 €"],
    ],
    tableNote: "Preus complets de TMB (Hola Barcelona) i de Turisme de Barcelona (Barcelona Card), comprovats el 28 d'octubre de 2026; la diferència és entre preus complets. Totes dues són més barates en línia: TMB anuncia un 10 % de descompte a la Hola Barcelona, i la botiga oficial ven la Barcelona Card un 10 % per sota del preu complet. No hi ha Barcelona Card de 24 hores.",
    holaTitle: "Hola Barcelona Travel Card: preu i què inclou",
    hola: [
      "És de TMB i cobreix el metro i els autobusos de TMB, el NitBus, el funicular de Montjuïc, el tramvia, FGC a la zona 1 i Rodalies a la zona 1, durant 24 a 120 hores seguides des de la primera validació. La de 24 hores costa 12,50 €.",
      "Inclou **un viatge en metro des de l'aeroport i un de tornada** a la L9 Sud, que per si sol val 11,80 € al preu del bitllet aeroport (5,90 €). No inclou el telefèric de Montjuïc. Els menors de 4 anys viatgen gratis al transport públic igualment.",
      "**Com es compra i es recull:** a holabarcelona.com, el web de TMB, és un 10 % més barata (la de 24 hores, 11,25 € en lloc de 12,50 €). Reps per correu un codi que es bescanvia per la targeta en una màquina de qualsevol estació de metro; la reserva val 180 dies des de la compra i, com a màxim, fins a l'últim dia de febrer de l'any següent. La targeta és personal i, quan s'esgota, es pot recarregar amb una altra Hola Barcelona a les màquines del metro.",
    ],
    cardTitle: "Barcelona Card: transport i museus",
    card: [
      "La ven Turisme de Barcelona; la versió amb transport cobreix el metro, els autobusos de TMB, el tramvia, Rodalies a la zona 1, el funicular de Montjuïc i el metro o el tren a l'aeroport. **No** inclou els autobusos nocturns. Els preus infantils (de 4 a 12 anys) són 27, 37, 46 i 54 € per a 48 a 120 hores.",
      "És una targeta sense contacte que comença a comptar la primera vegada que la fas servir en un museu o espai. Les condicions d'ús de Turisme de Barcelona diuen que val per **dies consecutius, no per períodes de 24 hores**, tot i que es ven com de 48 a 120 hores, i que és vàlida fins a la fi de l'any en curs. Comprada en línia, es pot cancel·lar gratis fins a 24 hores abans i es recull a les oficines de turisme: aeroport (T1 i T2), plaça de Catalunya, plaça d'Espanya, el punt de la Sagrada Família i el Mirador de Colom.",
      "Dona entrada gratuïta a més de 25 museus i espais, entre els quals el **Museu Picasso, el MNAC i la Fundació Joan Miró**, a més de CosmoCaixa, el MACBA i el Castell de Montjuïc, i descomptes en d'altres: 7 € menys a la Casa Batlló i a l'entrada Essential d'adult de la Pedrera a partir de les 14:00. La Sagrada Família i el Park Güell no hi són inclosos. També hi ha una **Barcelona Card Essential**, més barata i sense transport: 29 € les 72 hores, 35 € les 96 i 45 € les 120 (infants de 4 a 12 anys: 15, 17 i 20 €).",
    ],
    sumTitle: "El compte: quan surt a compte la Barcelona Card",
    sum: [
      "En 72 hores la Barcelona Card costa **31,70 € més** que la Hola Barcelona. Els tres museus més coneguts que inclou costen 12 € (MNAC), 12 € (Museu Picasso, en línia) i 17 € (Fundació Miró, en línia): **41 €** en total. Si visites tots tres pagant, la targeta guanya per uns 9 €; si en visites dos, surt més barat la Hola Barcelona més les entrades.",
      "Dues coses tornen a inclinar la balança. Diversos d'aquests museus tenen **franges gratuïtes** (el Picasso els dijous de 16:00 a 19:00 i el primer diumenge, amb reserva; el MNAC els dissabtes des de les 15:00 i el primer diumenge), i els menors de 18 entren gratis al Picasso, igual que els menors de 16 i els majors de 65 al MNAC. Si els teus plans encaixen en aquestes franges, el valor de la targeta en museus es redueix.",
    ],
    notTitle: "El que no inclou cap de les dues",
    not: [
      "L'**Aerobús** (totes dues inclouen el metro de l'aeroport, i la Barcelona Card també el tren).",
      `La **Sagrada Família** i el **Park Güell**, que venen ${b2link("monuments", "ca", "les seves pròpies entrades amb hora")}.`,
      "El **telefèric de Montjuïc**.",
    ],
    pickTitle: "Quina comprar",
    pick: [
      "**Sobretot caminar, platja i obres de Gaudí:** Hola Barcelona, o fins i tot una T-casual si fas menys de deu viatges.",
      "**Tres o més museus de pagament en una estada curta, en dies sense franges gratuïtes:** Barcelona Card.",
      "**Arribes en avió:** totes dues cobreixen el metro de l'aeroport; amb la Hola Barcelona és un viatge d'anada i un de tornada.",
    ],
    warnTitle: "Compra als venedors oficials",
    warn: "Els resultats de cerca són plens de revenedors, i almenys un web que fa servir el nom «Barcelona Card» ven altres productes a altres preus. La Barcelona Card és de Turisme de Barcelona (thisisbarcelona.com); la Hola Barcelona, de TMB.",
    faq: [
      { question: "Surt a compte la Hola Barcelona Travel Card?", answer: "Si fas molts trajectes o fas servir el metro de l'aeroport, sí: només el bitllet de metro de l'aeroport costa 5,90 € per trajecte, i la targeta n'inclou un d'anada i un de tornada. Si faràs menys de deu viatges en total, surt més barata una T-casual." },
      { question: "Quant costa la Hola Barcelona?", answer: "12,50 € les 24 hores, 18,70 € les 48, 27,30 € les 72, 35,60 € les 96 i 43,60 € les 120 a preu complet; TMB anuncia un 10 % de descompte en línia." },
      { question: "Quant costa la Barcelona Card?", answer: "Amb transport, 39 € les 48 hores, 59 € les 72, 69 € les 96 i 79 € les 120 a preu complet, amb un 10 % de descompte a la botiga oficial." },
      { question: "La Barcelona Card inclou la Sagrada Família?", answer: "No. Ni la Sagrada Família ni el Park Güell hi són inclosos; la Casa Batlló i l'entrada Essential d'adult de la Pedrera a partir de les 14:00 tenen 7 € de descompte." },
      { question: "La Hola Barcelona inclou l'aeroport?", answer: "Sí: un viatge en metro des de l'aeroport i un de tornada, a la L9 Sud. L'Aerobús no hi és inclòs." },
      { question: "On es recull la Hola Barcelona Travel Card?", answer: "En una màquina de qualsevol estació de metro, amb el codi que TMB envia per correu quan la compres en línia. La reserva val 180 dies i, com a màxim, fins a la fi de febrer de l'any següent." },
      { question: "La Barcelona Card de 48 hores val dos dies?", answer: "Turisme de Barcelona la ven com de 48 a 120 hores, però les seves condicions d'ús diuen que val per dies consecutius, no per períodes de 24 hores. Comença a comptar la primera vegada que la fas servir." },
    ],
    note: "Els preus i el que inclou cada targeta canvien: comprova-ho als venedors oficials abans de comprar.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    table(t.tableCaption, t.headers, t.rows, t.tableNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.holaTitle, ...t.hola),
    ...h2(t.cardTitle, ...t.card),
    ...h2(t.sumTitle, ...t.sum),
    ...h2(t.notTitle),
    list(...t.not),
    ...h2(t.pickTitle),
    list(...t.pick),
    callout("warning", t.warnTitle, t.warn),
    faq(t.faq),
    ...b2Related(["transport", "museums", "monuments", "airport"], locale),
  ];
}

export const CARDS: B2Article = {
  key: "cards",
  entryKey: "guide-barcelona-card-vs-hola-barcelona",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "targetes-funicular-montjuic-parallel",
  heroAlt: {
    ca: "Un tren del funicular de Montjuïc a l'estació del Paral·lel",
    es: "Un tren del funicular de Montjuïc en la estación del Paral·lel",
    en: "A Montjuïc funicular car at Paral·lel station",
  },
  heroCaption: {
    ca: "El funicular de Montjuïc entra a totes dues targetes; el telefèric, a cap.",
    es: "El funicular de Montjuïc entra en las dos tarjetas; el teleférico, en ninguna.",
    en: "The Montjuïc funicular is on both cards; the cable car is on neither.",
  },
  secondaryKey: "targetes-museu-picasso-montcada",
  secondaryAlt: {
    ca: "El carrer de Montcada, on hi ha el Museu Picasso, amb palaus gòtics",
    es: "La calle Montcada, donde está el Museu Picasso, con palacios góticos",
    en: "Carrer de Montcada, home of the Museu Picasso, lined with Gothic palaces",
  },
  secondaryCaption: {
    ca: "El Museu Picasso, gratis amb la Barcelona Card.",
    es: "El Museu Picasso, gratis con la Barcelona Card.",
    en: "The Museu Picasso is free with the Barcelona Card.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T19:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as CARDS_META };
