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

const VERIFIED = "2026-10-12";

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
    title: "Barcelona Card o Hola Barcelona: qué tarjeta compensa",
    seoTitle: "Barcelona Card o Hola Barcelona: ¿cuál compensa?",
    seoDescription:
      "Precios oficiales de la Barcelona Card (desde 39 €) y la Hola Barcelona (desde 12,50 €), qué incluye cada una y cuándo compensa la Card.",
    excerpt:
      "Las dos tarjetas para visitantes de Barcelona comparadas con los precios oficiales: qué cubre cada una y la cuenta que dice cuándo compensa la Barcelona Card.",
  },
  en: {
    path: "guides/barcelona-card-vs-hola-barcelona",
    title: "Barcelona Card or Hola Barcelona: which card is worth it",
    seoTitle: "Barcelona Card vs Hola Barcelona: which is worth it?",
    seoDescription:
      "Official prices for the Barcelona Card (from €39) and Hola Barcelona (from €12.50), what each covers, and when the Barcelona Card pays off.",
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
    lead: "The **Hola Barcelona** card is unlimited public transport and nothing else. The **Barcelona Card** adds free entry to more than 25 museums and cultural venues, and costs roughly twice as much. Whether it pays off depends on one thing: how many paid museums you would have visited anyway.",
    tableCaption: "Price by duration (adult, full price)",
    headers: ["Duration", "Hola Barcelona", "Barcelona Card (with transport)", "Difference"],
    rows: [
      ["48 hours", "€18.70", "€39", "€20.30"],
      ["72 hours", "€27.30", "€59", "€31.70"],
      ["96 hours", "€35.60", "€69", "€33.40"],
      ["120 hours", "€43.60", "€79", "€35.40"],
    ],
    tableNote: "Full prices from TMB (Hola Barcelona) and Turisme de Barcelona (Barcelona Card). Both are cheaper online: TMB advertises 10% off Hola Barcelona, and the Barcelona Card shows 10% off on its official shop.",
    holaTitle: "Hola Barcelona: transport only",
    hola: [
      "Run by TMB, it covers the metro and TMB buses, the NitBus night buses, the Montjuïc funicular, the tram, FGC trains in zone 1 and Rodalies trains in zone 1, for 24 to 120 consecutive hours from the first validation. A 24-hour card costs €12.50.",
      "It includes **one metro trip from the airport and one back** on the L9 Sud, which on its own is worth €11.80 at the €5.90 airport-ticket price. The Montjuïc cable car is not included. Children under 4 travel free on public transport anyway.",
    ],
    cardTitle: "Barcelona Card: transport plus museums",
    card: [
      "Sold by Turisme de Barcelona, the version with transport covers the metro, TMB buses, the tram, Rodalies zone 1, the Montjuïc funicular and the metro or train to the airport. It does **not** include night buses. Child prices (ages 4 to 12) are €27, €37, €46 and €54 for 48 to 120 hours.",
      "It gives free entry to more than 25 museums and venues, among them the **Museu Picasso, the MNAC and the Fundació Joan Miró**, and discounts elsewhere: €7 off at Casa Batlló and La Pedrera. The Sagrada Família and Park Güell are not included. There is also a cheaper Barcelona Card Essential without transport.",
    ],
    sumTitle: "The sum: when the Barcelona Card pays off",
    sum: [
      "Over 72 hours the Barcelona Card costs **€31.70 more** than the Hola Barcelona. The three best-known museums it includes cost €12 (MNAC), €12 (Museu Picasso, online) and €17 (Fundació Miró, online): **€41** in total. Visit all three on paid tickets and the card wins by about €9; visit two and the Hola Barcelona plus tickets is cheaper.",
      "Two things tip the balance back. Several of these museums have **free slots** (the Picasso on Thursday afternoons in winter and on the first Sunday, the MNAC on Saturday afternoons), and under-18s enter the Picasso free and under-16s the MNAC free. If your plans fit those slots, the card's museum value shrinks.",
    ],
    notTitle: "What neither card includes",
    not: [
      "The **Aerobús** shuttle (both cards include the airport metro, the Barcelona Card also the train).",
      "The **Sagrada Família** and **Park Güell**, which sell their own timed tickets.",
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
      { question: "How much is the Hola Barcelona card?", answer: "€12.50 for 24 hours, €18.70 for 48, €27.30 for 72, €35.60 for 96 and €43.60 for 120 hours at full price; TMB advertises 10% off online." },
      { question: "How much is the Barcelona Card?", answer: "With transport, €39 for 48 hours, €59 for 72, €69 for 96 and €79 for 120 hours at full price, with 10% off on the official shop." },
      { question: "Does the Barcelona Card include the Sagrada Família?", answer: "No. Neither the Sagrada Família nor Park Güell is included; Casa Batlló and La Pedrera get a €7 discount." },
      { question: "Does Hola Barcelona include the airport?", answer: "Yes: one metro journey from the airport and one back, on the L9 Sud. The Aerobús is not included." },
    ],
    note: "Card prices and what they include change: check the official sellers before buying.",
  },
  es: {
    lead: "La **Hola Barcelona** es transporte público ilimitado y nada más. La **Barcelona Card** añade entrada gratis a más de 25 museos y espacios culturales, y cuesta aproximadamente el doble. Que compense depende de una sola cosa: cuántos museos de pago habrías visitado igualmente.",
    tableCaption: "Precio según la duración (adulto, precio completo)",
    headers: ["Duración", "Hola Barcelona", "Barcelona Card (con transporte)", "Diferencia"],
    rows: [
      ["48 horas", "18,70 €", "39 €", "20,30 €"],
      ["72 horas", "27,30 €", "59 €", "31,70 €"],
      ["96 horas", "35,60 €", "69 €", "33,40 €"],
      ["120 horas", "43,60 €", "79 €", "35,40 €"],
    ],
    tableNote: "Precios completos de TMB (Hola Barcelona) y Turisme de Barcelona (Barcelona Card). Las dos son más baratas en línea: TMB anuncia un 10 % de descuento en la Hola Barcelona, y la Barcelona Card muestra un 10 % en su tienda oficial.",
    holaTitle: "Hola Barcelona: solo transporte",
    hola: [
      "Es de TMB y cubre el metro y los autobuses de TMB, el NitBus, el funicular de Montjuïc, el tranvía, los FGC en zona 1 y Rodalies en zona 1, durante 24 a 120 horas seguidas desde la primera validación. La de 24 horas cuesta 12,50 €.",
      "Incluye **un viaje en metro desde el aeropuerto y otro de vuelta** en la L9 Sud, que por sí solo vale 11,80 € al precio del billete aeropuerto (5,90 €). No incluye el teleférico de Montjuïc. Los menores de 4 años viajan gratis en el transporte público de todas formas.",
    ],
    cardTitle: "Barcelona Card: transporte y museos",
    card: [
      "La vende Turisme de Barcelona; la versión con transporte cubre el metro, los autobuses de TMB, el tranvía, Rodalies en zona 1, el funicular de Montjuïc y el metro o el tren al aeropuerto. **No** incluye los autobuses nocturnos. Los precios infantiles (de 4 a 12 años) son 27, 37, 46 y 54 € para 48 a 120 horas.",
      "Da entrada gratis a más de 25 museos y espacios, entre ellos el **Museu Picasso, el MNAC y la Fundació Joan Miró**, y descuentos en otros: 7 € menos en la Casa Batlló y La Pedrera. La Sagrada Familia y el Park Güell no están incluidos. También existe una Barcelona Card Essential, más barata y sin transporte.",
    ],
    sumTitle: "La cuenta: cuándo compensa la Barcelona Card",
    sum: [
      "En 72 horas la Barcelona Card cuesta **31,70 € más** que la Hola Barcelona. Los tres museos más conocidos que incluye cuestan 12 € (MNAC), 12 € (Museu Picasso, en línea) y 17 € (Fundació Miró, en línea): **41 €** en total. Si visitas los tres pagando, la tarjeta gana por unos 9 €; si visitas dos, sale más barato la Hola Barcelona más las entradas.",
      "Dos cosas inclinan la balanza al revés. Varios de estos museos tienen **franjas gratuitas** (el Picasso los jueves por la tarde en invierno y el primer domingo, el MNAC los sábados por la tarde), y los menores de 18 entran gratis al Picasso y los menores de 16 al MNAC. Si tus planes encajan en esas franjas, el valor de la tarjeta en museos se reduce.",
    ],
    notTitle: "Lo que no incluye ninguna de las dos",
    not: [
      "El **Aerobús** (las dos incluyen el metro del aeropuerto, y la Barcelona Card también el tren).",
      "La **Sagrada Familia** y el **Park Güell**, que venden sus propias entradas con hora.",
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
      { question: "¿Cuánto cuesta la Hola Barcelona?", answer: "12,50 € las 24 horas, 18,70 € las 48, 27,30 € las 72, 35,60 € las 96 y 43,60 € las 120 a precio completo; TMB anuncia un 10 % de descuento en línea." },
      { question: "¿Cuánto cuesta la Barcelona Card?", answer: "Con transporte, 39 € las 48 horas, 59 € las 72, 69 € las 96 y 79 € las 120 a precio completo, con un 10 % de descuento en la tienda oficial." },
      { question: "¿La Barcelona Card incluye la Sagrada Familia?", answer: "No. Ni la Sagrada Familia ni el Park Güell están incluidos; la Casa Batlló y La Pedrera tienen 7 € de descuento." },
      { question: "¿La Hola Barcelona incluye el aeropuerto?", answer: "Sí: un viaje en metro desde el aeropuerto y otro de vuelta, en la L9 Sud. El Aerobús no está incluido." },
    ],
    note: "Los precios y lo que incluye cada tarjeta cambian: compruébalo en los vendedores oficiales antes de comprar.",
  },
  ca: {
    lead: "La **Hola Barcelona** és transport públic il·limitat i res més. La **Barcelona Card** hi afegeix entrada gratuïta a més de 25 museus i espais culturals, i costa aproximadament el doble. Que surti a compte depèn d'una sola cosa: quants museus de pagament hauries visitat igualment.",
    tableCaption: "Preu segons la durada (adult, preu complet)",
    headers: ["Durada", "Hola Barcelona", "Barcelona Card (amb transport)", "Diferència"],
    rows: [
      ["48 hores", "18,70 €", "39 €", "20,30 €"],
      ["72 hores", "27,30 €", "59 €", "31,70 €"],
      ["96 hores", "35,60 €", "69 €", "33,40 €"],
      ["120 hores", "43,60 €", "79 €", "35,40 €"],
    ],
    tableNote: "Preus complets de TMB (Hola Barcelona) i de Turisme de Barcelona (Barcelona Card). Totes dues són més barates en línia: TMB anuncia un 10 % de descompte a la Hola Barcelona, i la Barcelona Card mostra un 10 % a la seva botiga oficial.",
    holaTitle: "Hola Barcelona: només transport",
    hola: [
      "És de TMB i cobreix el metro i els autobusos de TMB, el NitBus, el funicular de Montjuïc, el tramvia, FGC a la zona 1 i Rodalies a la zona 1, durant 24 a 120 hores seguides des de la primera validació. La de 24 hores costa 12,50 €.",
      "Inclou **un viatge en metro des de l'aeroport i un de tornada** a la L9 Sud, que per si sol val 11,80 € al preu del bitllet aeroport (5,90 €). No inclou el telefèric de Montjuïc. Els menors de 4 anys viatgen gratis al transport públic igualment.",
    ],
    cardTitle: "Barcelona Card: transport i museus",
    card: [
      "La ven Turisme de Barcelona; la versió amb transport cobreix el metro, els autobusos de TMB, el tramvia, Rodalies a la zona 1, el funicular de Montjuïc i el metro o el tren a l'aeroport. **No** inclou els autobusos nocturns. Els preus infantils (de 4 a 12 anys) són 27, 37, 46 i 54 € per a 48 a 120 hores.",
      "Dona entrada gratuïta a més de 25 museus i espais, entre els quals el **Museu Picasso, el MNAC i la Fundació Joan Miró**, i descomptes en d'altres: 7 € menys a la Casa Batlló i la Pedrera. La Sagrada Família i el Park Güell no hi són inclosos. També hi ha una Barcelona Card Essential, més barata i sense transport.",
    ],
    sumTitle: "El compte: quan surt a compte la Barcelona Card",
    sum: [
      "En 72 hores la Barcelona Card costa **31,70 € més** que la Hola Barcelona. Els tres museus més coneguts que inclou costen 12 € (MNAC), 12 € (Museu Picasso, en línia) i 17 € (Fundació Miró, en línia): **41 €** en total. Si visites tots tres pagant, la targeta guanya per uns 9 €; si en visites dos, surt més barat la Hola Barcelona més les entrades.",
      "Dues coses tornen a inclinar la balança. Diversos d'aquests museus tenen **franges gratuïtes** (el Picasso els dijous a la tarda a l'hivern i el primer diumenge, el MNAC els dissabtes a la tarda), i els menors de 18 entren gratis al Picasso i els menors de 16 al MNAC. Si els teus plans encaixen en aquestes franges, el valor de la targeta en museus es redueix.",
    ],
    notTitle: "El que no inclou cap de les dues",
    not: [
      "L'**Aerobús** (totes dues inclouen el metro de l'aeroport, i la Barcelona Card també el tren).",
      "La **Sagrada Família** i el **Park Güell**, que venen les seves pròpies entrades amb hora.",
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
      { question: "Quant costa la Hola Barcelona?", answer: "12,50 € les 24 hores, 18,70 € les 48, 27,30 € les 72, 35,60 € les 96 i 43,60 € les 120 a preu complet; TMB anuncia un 10 % de descompte en línia." },
      { question: "Quant costa la Barcelona Card?", answer: "Amb transport, 39 € les 48 hores, 59 € les 72, 69 € les 96 i 79 € les 120 a preu complet, amb un 10 % de descompte a la botiga oficial." },
      { question: "La Barcelona Card inclou la Sagrada Família?", answer: "No. Ni la Sagrada Família ni el Park Güell hi són inclosos; la Casa Batlló i la Pedrera tenen 7 € de descompte." },
      { question: "La Hola Barcelona inclou l'aeroport?", answer: "Sí: un viatge en metro des de l'aeroport i un de tornada, a la L9 Sud. L'Aerobús no hi és inclòs." },
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
