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
 * PortAventura from Barcelona: when each park opens, ticket "from" prices,
 * and the train.
 *
 * Calendar from PortAventura World's own calendar feed; Halloween dates and
 * ticket prices from portaventuraworld.com; train from the Rodalies R17/RT2
 * timetable of 8 Jun 2026 and Renfe. Checked on 12 Oct 2026
 * (research_notes/blog-batch-03/portaventura.md).
 *
 * The brief assumed R14 and R16 stop at the park; they do not. Only the R17
 * (a few direct trains) and the RT2 shuttle from Tarragona serve
 * Salou-Port Aventura station. Christmas 2026 season dates and 2027 opening
 * hours were not published and are not stated.
 */

const VERIFIED = "2026-10-12";

const SOURCES: B2Source[] = [
  { name: "PortAventura World — dates and times", url: "https://www.portaventuraworld.com/en/dates-times", publisher: "PortAventura World" },
  { name: "PortAventura World — Halloween", url: "https://www.portaventuraworld.com/en/halloween", publisher: "PortAventura World" },
  { name: "How to get to PortAventura", url: "https://www.portaventuraworld.com/en/destination/planning/how-to-get-to-portaventura", publisher: "PortAventura World" },
  { name: "Línia R17", url: "https://rodalies.gencat.cat/ca/sobre-rodalies/linies-i-estacions/servei_regionals/linia-r17/", publisher: "Rodalies de Catalunya" },
  { name: "Horaris R17 i RT2", url: "https://rodalies.gencat.cat/web/.content/02_Horaris/horaris/R17RT2.pdf", publisher: "Rodalies de Catalunya" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "escapades/portaventura-des-de-barcelona",
    title: "PortAventura des de Barcelona: calendari, entrades i com anar-hi en tren",
    seoTitle: "PortAventura des de Barcelona: obertura, entrades i tren",
    seoDescription:
      "PortAventura Park obre cada dia fins al 6 de gener (Halloween fins al 15 de novembre), entrades des de 37 €. Només l'R17 i l'RT2 paren a l'estació del parc.",
    excerpt: "Quan obren PortAventura Park, Ferrari Land i Caribe aquesta tardor i hivern, quant costen les entrades i quins trens hi arriben des de Barcelona.",
  },
  es: {
    path: "escapadas/portaventura-desde-barcelona",
    title: "PortAventura desde Barcelona: calendario, entradas y cómo ir en tren",
    seoTitle: "PortAventura desde Barcelona: apertura, entradas y tren",
    seoDescription:
      "PortAventura Park abre cada día hasta el 6 de enero (Halloween hasta el 15 de noviembre), entradas desde 37 €. Solo la R17 y la RT2 paran en la estación del parque.",
    excerpt: "Cuándo abren PortAventura Park, Ferrari Land y Caribe este otoño e invierno, cuánto cuestan las entradas y qué trenes llegan desde Barcelona.",
  },
  en: {
    path: "day-trips/portaventura-from-barcelona",
    title: "PortAventura from Barcelona: opening calendar, tickets and the train",
    seoTitle: "PortAventura from Barcelona: opening days, tickets, train",
    seoDescription:
      "PortAventura Park opens daily until 6 January (Halloween to 15 November), tickets from €37. Only the R17 and the RT2 shuttle stop at the park's station.",
    excerpt: "When PortAventura Park, Ferrari Land and Caribe open this autumn and winter, what tickets cost, and which trains get there from Barcelona.",
  },
};

type T = {
  lead: string;
  calCaption: string; calHeaders: string[]; calRows: string[][]; calNote: string;
  ticketsTitle: string; tickets: string[];
  trainTitle: string; train: string[];
  tipsTitle: string; tips: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "PortAventura World, by Salou on the Costa Daurada, has three parks with very different calendars. This autumn the main **PortAventura Park** opens every day until 6 January 2027, with **Halloween until 15 November**; **Ferrari Land** opens afternoons; the **Caribe Aquatic Park** is closed until spring.",
    calCaption: "Opening calendar, October 2026 to March 2027",
    calHeaders: ["Park", "When it opens"],
    calRows: [
      ["PortAventura Park", "Daily until 6 January 2027, usually 10:30–18:00; later on Halloween Saturdays. Closed 7 January – 19 February 2027."],
      ["Ferrari Land", "Afternoons and evenings; in November and December closed Monday to Thursday outside holidays. Closed 7 January – 17 March 2027."],
      ["Caribe Aquatic Park", "Closed from October 2026 to April 2027."],
    ],
    calNote: "From PortAventura World's official calendar, checked on 12 October 2026. Hours for spring 2027 are not published yet.",
    ticketsTitle: "Tickets",
    tickets: [
      "Prices depend on the date. On the official site a one-day ticket for PortAventura Park starts **from €37** for adults (11 to 59) and €33 for juniors (4 to 10) and seniors (60 and over); one day in two parks, adding Ferrari Land, from €50 (€46 junior and senior); Ferrari Land alone from €21. Buying at the ticket office costs **€10 more**.",
      "Halloween runs from 19 September to 15 November 2026. Christmas-season dates for 2026 had not been published when we checked.",
    ],
    trainTitle: "By train from Barcelona",
    train: [
      "The park's station is **Salou-Port Aventura**, about a ten-minute walk from the entrance. Only two services stop there: a few **direct R17** trains from Barcelona-Sants (three a day each way on the timetable of 8 June 2026, about 1 h 25 min), and the **RT2** shuttle from Tarragona (13 minutes), which you can reach on any regional train south.",
      "The R14 and R16 do not stop at the park. Rodalies runs the direct Barcelona trains when the park is open, so do not count on them during the winter closure.",
    ],
    tipsTitle: "Before you go",
    tips: [
      "**Buy online:** the ticket office adds €10 per ticket.",
      "**Check the day's hours:** closing time changes with the season and the events.",
      "**Coming from Tarragona:** combine it with the Roman city; see the Tarragona day trip.",
    ],
    faq: [
      { question: "Is PortAventura open in winter?", answer: "PortAventura Park opens daily until 6 January 2027, then closes from 7 January to 19 February 2027. The Caribe water park stays closed until April." },
      { question: "How much is a PortAventura ticket?", answer: "From €37 for an adult one-day ticket and €33 for children 4 to 10 and over-60s, depending on the date; €10 more at the ticket office." },
      { question: "How do I get to PortAventura by train from Barcelona?", answer: "On one of the few direct R17 trains from Sants (about 1 h 25 min), or by regional train to Tarragona and the RT2 shuttle to Salou-Port Aventura." },
      { question: "When does Halloween at PortAventura end?", answer: "On 15 November 2026." },
    ],
    note: "Park calendars and train services change: check PortAventura and Rodalies for your date.",
  },
  es: {
    lead: "PortAventura World, junto a Salou en la Costa Daurada, tiene tres parques con calendarios muy distintos. Este otoño el principal, **PortAventura Park**, abre cada día hasta el 6 de enero de 2027, con **Halloween hasta el 15 de noviembre**; **Ferrari Land** abre por las tardes; el **Caribe Aquatic Park** está cerrado hasta la primavera.",
    calCaption: "Calendario de apertura, de octubre de 2026 a marzo de 2027",
    calHeaders: ["Parque", "Cuándo abre"],
    calRows: [
      ["PortAventura Park", "Cada día hasta el 6 de enero de 2027, normalmente de 10:30 a 18:00; más tarde los sábados de Halloween. Cerrado del 7 de enero al 19 de febrero de 2027."],
      ["Ferrari Land", "Tardes y noches; en noviembre y diciembre cierra de lunes a jueves no festivos. Cerrado del 7 de enero al 17 de marzo de 2027."],
      ["Caribe Aquatic Park", "Cerrado de octubre de 2026 a abril de 2027."],
    ],
    calNote: "Del calendario oficial de PortAventura World, comprobado el 12 de octubre de 2026. Los horarios de la primavera de 2027 aún no están publicados.",
    ticketsTitle: "Entradas",
    tickets: [
      "Los precios dependen de la fecha. En la web oficial, la entrada de un día a PortAventura Park empieza **desde 37 €** para adultos (de 11 a 59 años) y 33 € para junior (de 4 a 10) y sénior (60 o más); un día en dos parques, con Ferrari Land, desde 50 € (46 € junior y sénior); Ferrari Land sola, desde 21 €. Comprar en taquilla cuesta **10 € más**.",
      "Halloween va del 19 de septiembre al 15 de noviembre de 2026. Las fechas de la temporada de Navidad de 2026 no estaban publicadas cuando lo comprobamos.",
    ],
    trainTitle: "En tren desde Barcelona",
    train: [
      "La estación del parque es **Salou-Port Aventura**, a unos diez minutos a pie de la entrada. Solo paran dos servicios: unos pocos **R17 directos** desde Barcelona-Sants (tres al día en cada sentido en el horario del 8 de junio de 2026, alrededor de 1 h 25 min) y la lanzadera **RT2** desde Tarragona (13 minutos), a la que se llega con cualquier regional hacia el sur.",
      "La R14 y la R16 no paran en el parque. Rodalies hace circular los trenes directos desde Barcelona cuando el parque está abierto, así que no cuentes con ellos durante el cierre de invierno.",
    ],
    tipsTitle: "Antes de ir",
    tips: [
      "**Compra en línea:** en taquilla cuesta 10 € más por entrada.",
      "**Mira el horario del día:** la hora de cierre cambia con la temporada y los eventos.",
      "**Si vienes por Tarragona:** combínalo con la ciudad romana; mira la escapada a Tarragona.",
    ],
    faq: [
      { question: "¿Abre PortAventura en invierno?", answer: "PortAventura Park abre cada día hasta el 6 de enero de 2027 y luego cierra del 7 de enero al 19 de febrero de 2027. El parque acuático Caribe sigue cerrado hasta abril." },
      { question: "¿Cuánto cuesta la entrada a PortAventura?", answer: "Desde 37 € la entrada de adulto de un día y 33 € para niños de 4 a 10 años y mayores de 60, según la fecha; 10 € más en taquilla." },
      { question: "¿Cómo se va a PortAventura en tren desde Barcelona?", answer: "En uno de los pocos R17 directos desde Sants (alrededor de 1 h 25 min), o en regional hasta Tarragona y la lanzadera RT2 hasta Salou-Port Aventura." },
      { question: "¿Cuándo termina Halloween en PortAventura?", answer: "El 15 de noviembre de 2026." },
    ],
    note: "Los calendarios de los parques y los trenes cambian: consulta PortAventura y Rodalies para tu fecha.",
  },
  ca: {
    lead: "PortAventura World, a tocar de Salou a la Costa Daurada, té tres parcs amb calendaris molt diferents. Aquesta tardor el principal, **PortAventura Park**, obre cada dia fins al 6 de gener de 2027, amb **Halloween fins al 15 de novembre**; **Ferrari Land** obre a les tardes; el **Caribe Aquatic Park** és tancat fins a la primavera.",
    calCaption: "Calendari d'obertura, d'octubre de 2026 a març de 2027",
    calHeaders: ["Parc", "Quan obre"],
    calRows: [
      ["PortAventura Park", "Cada dia fins al 6 de gener de 2027, normalment de 10:30 a 18:00; més tard els dissabtes de Halloween. Tancat del 7 de gener al 19 de febrer de 2027."],
      ["Ferrari Land", "Tardes i vespres; al novembre i desembre tanca de dilluns a dijous no festius. Tancat del 7 de gener al 17 de març de 2027."],
      ["Caribe Aquatic Park", "Tancat d'octubre de 2026 a abril de 2027."],
    ],
    calNote: "Del calendari oficial de PortAventura World, comprovat el 12 d'octubre de 2026. Els horaris de la primavera del 2027 encara no estan publicats.",
    ticketsTitle: "Entrades",
    tickets: [
      "Els preus depenen de la data. Al web oficial, l'entrada d'un dia a PortAventura Park comença **des de 37 €** per a adults (d'11 a 59 anys) i 33 € per a júnior (de 4 a 10) i sènior (60 o més); un dia a dos parcs, amb Ferrari Land, des de 50 € (46 € júnior i sènior); Ferrari Land sola, des de 21 €. Comprar a taquilla costa **10 € més**.",
      "Halloween va del 19 de setembre al 15 de novembre de 2026. Les dates de la temporada de Nadal del 2026 no estaven publicades quan ho vam comprovar.",
    ],
    trainTitle: "En tren des de Barcelona",
    train: [
      "L'estació del parc és **Salou-Port Aventura**, a uns deu minuts a peu de l'entrada. Només hi paren dos serveis: uns pocs **R17 directes** des de Barcelona-Sants (tres al dia en cada sentit a l'horari del 8 de juny de 2026, al voltant d'1 h 25 min) i la llançadora **RT2** des de Tarragona (13 minuts), on s'arriba amb qualsevol regional cap al sud.",
      "L'R14 i l'R16 no paren al parc. Rodalies fa circular els trens directes des de Barcelona quan el parc és obert, així que no hi comptis durant el tancament d'hivern.",
    ],
    tipsTitle: "Abans d'anar-hi",
    tips: [
      "**Compra en línia:** a taquilla costa 10 € més per entrada.",
      "**Mira l'horari del dia:** l'hora de tancament canvia amb la temporada i els esdeveniments.",
      "**Si passes per Tarragona:** combina-ho amb la ciutat romana; mira l'escapada a Tarragona.",
    ],
    faq: [
      { question: "Obre PortAventura a l'hivern?", answer: "PortAventura Park obre cada dia fins al 6 de gener de 2027 i després tanca del 7 de gener al 19 de febrer de 2027. El parc aquàtic Caribe continua tancat fins a l'abril." },
      { question: "Quant costa l'entrada a PortAventura?", answer: "Des de 37 € l'entrada d'adult d'un dia i 33 € per a infants de 4 a 10 anys i majors de 60, segons la data; 10 € més a taquilla." },
      { question: "Com s'hi va a PortAventura en tren des de Barcelona?", answer: "Amb un dels pocs R17 directes des de Sants (al voltant d'1 h 25 min), o amb regional fins a Tarragona i la llançadora RT2 fins a Salou-Port Aventura." },
      { question: "Quan acaba Halloween a PortAventura?", answer: "El 15 de novembre de 2026." },
    ],
    note: "Els calendaris dels parcs i els trens canvien: consulta PortAventura i Rodalies per a la teva data.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    table(t.calCaption, t.calHeaders, t.calRows, t.calNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.ticketsTitle, ...t.tickets),
    ...h2(t.trainTitle, ...t.train),
    ...h2(t.tipsTitle),
    list(...t.tips),
    faq(t.faq),
    ...b2Related(["tarragona", "sitges", "cards"], locale),
  ];
}

export const PORTAVENTURA: B2Article = {
  key: "portaventura",
  entryKey: "daytrip-portaventura-from-barcelona",
  categoryKey: "coast",
  sources: SOURCES,
  heroKey: "portaventura-dragon-khan-shambhala",
  heroAlt: {
    ca: "Les muntanyes russes Dragon Khan i Shambhala de PortAventura al capvespre",
    es: "Las montañas rusas Dragon Khan y Shambhala de PortAventura al atardecer",
    en: "The Dragon Khan and Shambhala roller coasters at PortAventura at sunset",
  },
  heroCaption: {
    ca: "Dragon Khan i Shambhala, a PortAventura Park.",
    es: "Dragon Khan y Shambhala, en PortAventura Park.",
    en: "Dragon Khan and Shambhala at PortAventura Park.",
  },
  secondaryKey: "portaventura-shambhala-llac",
  secondaryAlt: {
    ca: "El recorregut de Shambhala sobre el llac de PortAventura",
    es: "El recorrido de Shambhala sobre el lago de PortAventura",
    en: "Shambhala's track over the lake at PortAventura",
  },
  secondaryCaption: {
    ca: "Shambhala, sobre el llac.",
    es: "Shambhala, sobre el lago.",
    en: "Shambhala over the lake.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T01:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as PORTAVENTURA_META };
