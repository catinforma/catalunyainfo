import { link as featureLink } from "@/lib/content/features/shared";
import type { Locale } from "@/lib/i18n/config";

import {
  b2link,
  b2Related,
  callout,
  faq,
  h2,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Sagrada Família, Park Güell, Casa Batlló, La Pedrera and Sant Pau: what a
 * ticket costs and when each one opens.
 *
 * Every figure comes from the monument's own site, checked on 12 Oct 2026
 * (fact pack with quotes: research_notes/blog-batch-03/monuments.md) and
 * re-checked on 24 Oct 2026. Dropped on the re-check because no official page
 * states them today: La Pedrera's reduced amounts (the site names the
 * categories, not the prices), the Passi Verd "replaces Gaudir Més since March
 * 2026" line, Park Güell's resale clause, and "bad weather" as a Sagrada
 * Família closure reason (the site says special events). The Sagrada Família
 * ticket page still carries a "temporarily closed to the public" block whose
 * "more information" link is the Junta's 30 Oct 2020 notice; the prices,
 * schedules and tower pages sell normally, so the block is not reported as a
 * live closure. Two Gaudí houses are left out on purpose: Palau Güell's site
 * was down and the council's figures for it conflict with a snippet of the
 * official one, and Casa Vicens loads its prices in a booking widget we could
 * not read. Sant Pau's children's price is omitted because its own page
 * states two different rules.
 *
 * Fixed on 26 Oct 2026 (research_notes/rank-all/review-4-bcn-sights.md):
 * Park Güell's ticket slots run "From 9:30 am to 17:30 pm" (parkguell.barcelona
 * prices-and-times), not to 19:30; the Sagrada Família conditions of sale
 * (cl. 19.2) give a partial refund of the towers part when the towers close
 * for adverse weather, breakdowns, maintenance or force majeure, "but in no
 * case the amount paid for the visit to the Temple"; Casa Batlló's opening
 * hours page states only 8:30-22:30, every day, last admission 21:30, so the
 * 9:00-19:45 general-visit window and the dated night-visit price went.
 *
 * Added on 28 Oct 2026 (page-1 push for "sagrada familia tickets price",
 * "park guell tickets", "casa batllo entrance fee"), each read that day on the
 * monument's own page: the full Sagrada Família price grid (seniors €21/23/
 * 28/32, under-30s and student card €24/28/34/38, companions of disabled
 * visitors €0/4/10/14) and its April-September hours, the "evacuated fifteen
 * minutes before closing time" rule (cl. 13.10), metro L2/L5 and buses 19,
 * 33, 34, D50, H10, B24, entrance on the Nativity façade, c/ de la Marina;
 * Park Güell's full price list (Targeta Rosa, disabled visitors and their
 * companions €13.50, MUHBA/Ruta del Modernisme ticket €14.50), the resident
 * hours 7:00-9:30 and 18:00-22:00 with no tourist visits, unlimited stay, and
 * how to get there (L3 Lesseps or Vallcarca 20 min walk; H6 and D40 to
 * Travessera de Dalt, about 10 min); Casa Batlló's ticket office closing at
 * 21:00, the "Be the First" morning ticket €45 with the rooftop, Bon Appétit
 * from €59, the €6 disability discount with a free companion; Sant Pau's
 * April-October hours and last entry 30 minutes before closing; the Barcelona
 * Card's €7 discount at Casa Batlló (thisisbarcelona.com). The night-visit
 * price is still left out: Casa Batlló sells it "until 15 Nov".
 *
 * No reseller links. Sagrada Família refuses tickets bought from resellers,
 * and Park Güell bans resale: the useful advice is the official site.
 */

const VERIFIED = "2026-10-28";

const SOURCES: B2Source[] = [
  { name: "Sagrada Família — prices", url: "https://sagradafamilia.org/en/prices", publisher: "Junta Constructora del Temple de la Sagrada Família" },
  { name: "Sagrada Família — opening hours and how to get there", url: "https://sagradafamilia.org/en/schedules-how-to-get", publisher: "Junta Constructora del Temple de la Sagrada Família" },
  { name: "Sagrada Família — rules and conditions of sale", url: "https://sagradafamilia.org/en/rules-and-conditions-of-sale", publisher: "Junta Constructora del Temple de la Sagrada Família" },
  { name: "Park Güell — official site", url: "https://parkguell.barcelona/en", publisher: "Park Güell (BSM)" },
  { name: "Park Güell — prices and times", url: "https://parkguell.barcelona/en/planning-your-visit/prices-and-times", publisher: "Park Güell (BSM)" },
  { name: "Park Güell — how to get there", url: "https://parkguell.barcelona/en/planning-your-visit/how-to-get-there", publisher: "Park Güell (BSM)" },
  { name: "Park Güell — Passi Verd", url: "https://parkguell.barcelona/en/planifica-la-teva-visita/passi-verd", publisher: "Park Güell (BSM)" },
  { name: "Casa Batlló — tickets", url: "https://www.casabatllo.es/en/online-tickets/", publisher: "Casa Batlló" },
  { name: "Casa Batlló — opening hours", url: "https://www.casabatllo.es/en/visit/opening-hours/", publisher: "Casa Batlló" },
  { name: "La Pedrera — visits", url: "https://www.lapedrera.com/en/visits", publisher: "Fundació Catalunya La Pedrera" },
  { name: "La Pedrera — practical information", url: "https://www.lapedrera.com/en/practical-information/", publisher: "Fundació Catalunya La Pedrera" },
  { name: "Sant Pau Recinte Modernista — plan your visit", url: "https://santpaubarcelona.org/en/prepara-la-teva-visita/", publisher: "Fundació Privada Hospital de la Santa Creu i Sant Pau" },
  { name: "Barcelona Card", url: "https://thisisbarcelona.com/tickets/barcelona-card", publisher: "Turisme de Barcelona" },
];

const URL = {
  sf: "https://sagradafamilia.org/en/prices",
  sfHours: "https://sagradafamilia.org/en/schedules-how-to-get",
  pg: "https://parkguell.barcelona/en/planning-your-visit/prices-and-times",
  pgHow: "https://parkguell.barcelona/en/planning-your-visit/how-to-get-there",
  passi: "https://parkguell.barcelona/en/planifica-la-teva-visita/passi-verd",
  batllo: "https://www.casabatllo.es/en/online-tickets/",
  pedrera: "https://www.lapedrera.com/en/practical-information/",
  santpau: "https://santpaubarcelona.org/en/prepara-la-teva-visita/",
};
const a = (label: string, url: string) => `[${label}](${url})`;

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/entrades-sagrada-familia-park-guell-casa-batllo",
    title: "Entrades Sagrada Família, Park Güell i Casa Batlló 2026: preus i horaris",
    seoTitle: "Entrades Sagrada Família, Park Güell i Batlló: preus 2026",
    seoDescription:
      "Sagrada Família 26 € (torres 36 €, menors d'11 gratis), Park Güell 18 € només en línia, Casa Batlló des de 29 €: preus oficials, horaris i com arribar-hi.",
    excerpt:
      "Què costa entrar als grans monuments modernistes de Barcelona, quan obren, qui no paga i on comprar sense revenedors, segons els webs oficials.",
  },
  es: {
    path: "guias/entradas-sagrada-familia-park-guell-casa-batllo",
    title: "Entradas Sagrada Familia, Park Güell y Casa Batlló 2026: precios y horarios",
    seoTitle: "Entradas Sagrada Familia, Park Güell y Batlló: precios 2026",
    seoDescription:
      "Sagrada Familia 26 € (torres 36 €, menores de 11 gratis), Park Güell 18 € solo en línea, Casa Batlló desde 29 €: precios oficiales, horarios y cómo llegar.",
    excerpt:
      "Qué cuesta entrar en los grandes monumentos modernistas de Barcelona, cuándo abren, quién no paga y dónde comprar sin revendedores, según las webs oficiales.",
  },
  en: {
    path: "guides/sagrada-familia-park-guell-casa-batllo-tickets",
    title: "Sagrada Família, Park Güell and Casa Batlló tickets 2026: prices and opening hours",
    seoTitle: "Sagrada Familia tickets price 2026, Park Güell & Casa Batlló",
    seoDescription:
      "Sagrada Família €26 (towers €36, under 11s free), Park Güell €18 online only, Casa Batlló from €29: official prices, opening hours and how to get there.",
    excerpt:
      "What it costs to visit Barcelona's great Modernista monuments, when they open, who goes free and where to buy without resellers, from the official sites.",
  },
};

type T = {
  lead: string;
  tableCaption: string;
  headers: string[];
  rows: string[][];
  tableNote: string;
  checkTitle: string;
  checkText: string;
  sfTitle: string;
  sf: string[];
  sfPriceCaption: string;
  sfPriceHeaders: string[];
  sfPriceRows: string[][];
  sfPriceNote: string;
  sfHoursTitle: string;
  sfHoursCaption: string;
  sfHoursHeaders: string[];
  sfHoursRows: string[][];
  sfHoursNote: string;
  sfHours: string[];
  pgTitle: string;
  pg: string[];
  pgPriceCaption: string;
  pgPriceHeaders: string[];
  pgPriceRows: string[][];
  pgPriceNote: string;
  pgHoursTitle: string;
  pgHours: string[];
  batlloTitle: string;
  batllo: string[];
  pedreraTitle: string;
  pedrera: string[];
  santpauTitle: string;
  santpau: string[];
  resellerTitle: string;
  reseller: string;
  planTitle: string;
  plan: string[];
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "**A Sagrada Família ticket costs €26** (€36 with the towers; under-30s €24, seniors €21, under 11s free), **Park Güell costs €18**, sold online only for a 30-minute slot, and **Casa Batlló starts from €29**, depending on the date. La Pedrera also starts at €29 and Sant Pau €18 before 14:00. Those are the prices on each monument's own website on 28 October 2026. All of them sell timed tickets, and the rule that saves most money is to buy on the official site, in advance.",
    tableCaption: "Adult prices and winter hours at a glance",
    headers: ["Monument", "Adult ticket", "Free", "Winter hours"],
    rows: [
      ["Sagrada Família", "€26 (towers €36)", "Under 11s", "Nov–Feb: Mon–Sat 9:00–18:00, Sun 10:30–18:00"],
      ["Park Güell (Monumental Zone)", "€18, online only", "Ages 0–6 (ticket still needed)", "Ticket slots 9:30–17:30"],
      ["Casa Batlló", "From €29 (varies by date)", "Ages 0–12, with an adult", "Daily 8:30–22:30"],
      ["Casa Milà – La Pedrera", "From €29", "Ages 0–11", "2 Nov–25 Feb: daily 9:00–18:30"],
      ["Sant Pau Recinte Modernista", "€18 before 14:00, €17 after", "See the official page", "Nov–Mar: daily 9:30–17:00"],
    ],
    tableNote: "Prices from each monument's official site; Casa Batlló uses date-based pricing and quotes a 'from' price.",
    checkTitle: "Temporary closures",
    checkText: "The Sagrada Família may change its hours for special events. If its towers close for weather, breakdowns or maintenance, the conditions of sale refund only the towers part of the ticket, never the Basilica visit. Every monument posts closures on its own site: check the day before.",
    sfTitle: "Sagrada Família tickets: 2026 prices",
    sf: [
      `The basic ticket, with the audio-guide app, is **€26**; with a guided tour **€30**, with the towers **€36**, and both **€40** (${a("official prices", URL.sf)}). Under 11s and people with disabilities go free, and a disabled visitor's companion pays only for the extras. Children under 6 may not go up the towers. Tickets carry the visitor's name, and you need official photo ID to get in.`,
    ],
    sfPriceCaption: "Sagrada Família ticket prices by visitor",
    sfPriceHeaders: ["Ticket", "General", "Under 30s and student card", "Seniors", "Under 11s and disabled visitors"],
    sfPriceRows: [
      ["Basilica with audio-guide app", "€26", "€24", "€21", "Free"],
      ["With guided tour", "€30", "€28", "€23", "Free"],
      ["With towers", "€36", "€34", "€28", "Free"],
      ["Guided tour and towers", "€40", "€38", "€32", "Free"],
    ],
    sfPriceNote: "Prices per person from sagradafamilia.org, checked on 28 October 2026. A disabled visitor's companion pays €0, €4, €10 or €14 for the same four tickets. The audio guide covers the Basilica only.",
    sfHoursTitle: "Sagrada Família opening hours",
    sfHoursCaption: "Sagrada Família opening hours by season",
    sfHoursHeaders: ["Months", "Monday to Friday", "Saturday", "Sunday"],
    sfHoursRows: [
      ["November to February", "9:00–18:00", "9:00–18:00", "10:30–18:00"],
      ["March and October", "9:00–19:00", "9:00–18:00", "10:30–19:00"],
      ["April to September", "9:00–20:00", "9:00–18:00", "10:30–20:00"],
      ["25 and 26 December, 1 and 6 January", "9:00–14:00", "9:00–14:00", "9:00–14:00"],
    ],
    sfHoursNote: "From sagradafamilia.org, checked on 28 October 2026. Hours can change for events inside the Basilica.",
    sfHours: [
      "The Basilica is cleared fifteen minutes before closing time, so do not book the last slot of the day. Individual visitors use the general entrance on the Nativity façade, on carrer de la Marina.",
      "**Getting there:** metro L2 and L5, Sagrada Família station; buses 19, 33, 34, D50, H10 and B24.",
    ],
    pgTitle: "Park Güell tickets: price and how to book",
    pg: [
      `The Monumental Zone costs **€18** and tickets are **sold online only**, for a 30-minute slot between 9:30 and 17:30 (${a("official prices", URL.pg)}). You must enter within that half hour; once inside you can stay as long as you like, but you cannot go back in after leaving. Every visitor needs a ticket, even children who go free.`,
      `People registered as residents of Barcelona get in free with the **Passi Verd**, booked on the same day only: it cannot be reserved in advance (${a("Passi Verd", URL.passi)}).`,
    ],
    pgPriceCaption: "Park Güell ticket prices",
    pgPriceHeaders: ["Visitor", "Price"],
    pgPriceRows: [
      ["General", "€18"],
      ["Children aged 7 to 12", "€13.50"],
      ["Over 65, and Targeta Rosa Reduïda holders", "€13.50"],
      ["Children aged 0 to 6", "Free (ticket needed)"],
      ["People with disabilities", "Free"],
      ["Companion of a person with a disability", "€13.50"],
      ["With a Museu d'Història de Barcelona or Ruta del Modernisme ticket", "€14.50"],
    ],
    pgPriceNote: "Prices including VAT from parkguell.barcelona, checked on 28 October 2026. Discounts need documentation when you buy.",
    pgHoursTitle: "Park Güell opening hours and how to get there",
    pgHours: [
      "The park is open all year. Tourist tickets cover the slots from 9:30 to 17:30; from 7:00 to 9:30 and from 18:00 to 22:00 the Monumental Zone is reserved for local residents and Passi Verd holders, with no tourist visits.",
      `**Getting there** (${a("official directions", URL.pgHow)}): metro L3 to Lesseps or Vallcarca, then about 20 minutes on foot, using the escalators towards the entrance on avinguda del Santuari de Sant Josep de la Muntanya; or buses H6 and D40 to the Travessera de Dalt stop, about 10 minutes away.`,
    ],
    batlloTitle: "Casa Batlló entrance fee and tickets",
    batllo: [
      `Casa Batlló prices change with the date and time: the general visit, with an audio guide in 15 languages and about an hour and a quarter long, starts **from €29**, and buying in advance online saves up to €15 per person (${a("official tickets", URL.batllo)}). Children aged 0 to 12 with an adult go free; ages 13–17, students and visitors with a disability get €6 off (a disabled visitor's companion goes free), and over-65s €3 off.`,
      `Other tickets, sold online only: **Be the First** (€45), an early-morning visit with fewer people and the rooftop, and **Bon Appétit** (from €59), which adds the third floor and breakfast or tapas. Night visits are sold online on the dates the house publishes. With the Barcelona Card you get €7 off (${b2link("cards", "en", "Barcelona Card or Hola Barcelona")}).`,
      "It is open every day of the year from 8:30 to 22:30, with last admission at 21:30; the ticket office closes at 21:00.",
    ],
    pedreraTitle: "Casa Milà – La Pedrera",
    pedrera: [
      `The day visit (La Pedrera Essential) starts **from €29**; children under 12 go free, and ages 12–17, over-65s and students have reduced fares, priced on the booking page (${a("practical information", URL.pedrera)}). Booking is not compulsory but recommended, and the box office charges more on some fares.`,
      "From 2 November 2026 to 25 February 2027 it opens daily 9:00–18:30. It is closed on 25 December 2026 and from 11 to 17 January 2027.",
    ],
    santpauTitle: "Sant Pau Recinte Modernista",
    santpau: [
      `Domènech i Montaner's hospital complex costs **€18** before 14:00 and **€17** after, or €21 with a guide; reduced tickets are €12.60 and €11.90, or €14.70 guided (${a("plan your visit", URL.santpau)}). It opens daily 9:30–17:00 from November to March and 9:30–18:30 from April to October, with last entry 30 minutes before closing, and it is closed on 25 December. Entry is free on 23 April, on the Night of Museums and on 24 September.`,
    ],
    resellerTitle: "Avoid resellers",
    reseller: "The Sagrada Família's conditions of sale say it will not accept any ticket bought through a reseller, and its tickets carry the visitor's name. Search results are full of third-party sellers at a mark-up; the official links above are the ones to use.",
    planTitle: "Planning a Gaudí day",
    plan: [
      "**Book the Sagrada Família and Park Güell first:** both are timed and fill up; the houses on Passeig de Gràcia are more flexible.",
      "**Casa Batlló and La Pedrera are a few minutes' walk apart** on Passeig de Gràcia, so they pair naturally in one morning.",
      "**Students and under-30s:** carry ID; the reduced prices above depend on it.",
    ],
    faq: [
      { question: "How much is a Sagrada Família ticket?", answer: `€26 for the basic ticket with the audio-guide app, €30 with a guided tour and €36 with the towers, on the official site as of ${VERIFIED}. Under 11s go free.` },
      { question: "How much are Sagrada Família tickets for seniors and students?", answer: "Seniors pay €21 for the basic ticket (€28 with the towers); under-30s and holders of a student card pay €24 (€34 with the towers)." },
      { question: "Can children go up the Sagrada Família towers?", answer: "Not under 6: the conditions of sale bar children under six from the towers. Under 11s enter the Basilica free." },
      { question: "What are the Sagrada Família opening hours?", answer: "From November to February, Monday to Saturday 9:00–18:00 and Sunday 10:30–18:00; on 25 and 26 December and 1 and 6 January, 9:00–14:00. In March and October, Monday to Friday 9:00–19:00, Saturday 9:00–18:00 and Sunday 10:30–19:00. From April to September, Monday to Friday 9:00–20:00, Saturday 9:00–18:00 and Sunday 10:30–20:00." },
      { question: "Can I buy Park Güell tickets at the gate?", answer: "No. Tickets for the Monumental Zone are sold online only, for a 30-minute time slot." },
      { question: "What time does Park Güell open?", answer: "Tourist tickets cover entry slots from 9:30 to 17:30, every day of the year. Earlier and later hours are reserved for residents." },
      { question: "What is the Casa Batlló entrance fee?", answer: "The general visit starts from €29 and the price changes with the date and time. Buying online in advance saves up to €15 per person, and children aged 0 to 12 with an adult go free." },
      { question: "Is Park Güell free for Barcelona residents?", answer: "Yes, with the Passi Verd, booked on the same day, for people registered as residents in Barcelona." },
      { question: "Which is cheaper, Casa Batlló or La Pedrera?", answer: "Both start at €29 for an adult day visit; Casa Batlló's price varies with the date, and both are cheaper online." },
    ],
  },
  es: {
    lead: "**La entrada a la Sagrada Familia cuesta 26 €** (36 € con torres; menores de 30, 24 €; sénior, 21 €; menores de 11, gratis), **el Park Güell 18 €**, solo en línea y para una franja de 30 minutos, y **la Casa Batlló desde 29 €**, según la fecha. La Pedrera también empieza en 29 € y Sant Pau, 18 € antes de las 14:00. Son los precios de la web de cada monumento el 28 de octubre de 2026. Todos venden entradas con hora, y la regla que más ahorra es comprar en la web oficial y con antelación.",
    tableCaption: "Precios de adulto y horario de invierno, de un vistazo",
    headers: ["Monumento", "Entrada adulto", "Gratis", "Horario de invierno"],
    rows: [
      ["Sagrada Familia", "26 € (torres 36 €)", "Menores de 11", "Nov–feb: lun–sáb 9:00–18:00, dom 10:30–18:00"],
      ["Park Güell (Zona Monumental)", "18 €, solo en línea", "0–6 años (con entrada)", "Franjas de entrada 9:30–17:30"],
      ["Casa Batlló", "Desde 29 € (según la fecha)", "0–12 años, con un adulto", "Cada día 8:30–22:30"],
      ["Casa Milà – La Pedrera", "Desde 29 €", "0–11 años", "2 nov–25 feb: cada día 9:00–18:30"],
      ["Recinte Modernista de Sant Pau", "18 € antes de las 14:00, 17 € después", "Ver la página oficial", "Nov–mar: cada día 9:30–17:00"],
    ],
    tableNote: "Precios de la web oficial de cada monumento; la Casa Batlló usa precios según la fecha y publica un precio «desde».",
    checkTitle: "Cierres temporales",
    checkText: "La Sagrada Familia puede cambiar el horario por actos especiales. Si las torres cierran por meteorología, averías o mantenimiento, las condiciones de venta devuelven solo la parte de las torres, nunca la visita al templo. Cada monumento anuncia los cierres en su web: compruébalo el día antes.",
    sfTitle: "Entradas de la Sagrada Familia: precios 2026",
    sf: [
      `La entrada básica, con la audioguía en app, cuesta **26 €**; con visita guiada **30 €**, con torres **36 €** y con las dos cosas **40 €** (${a("precios oficiales", URL.sf)}). Los menores de 11 y las personas con discapacidad entran gratis, y su acompañante solo paga los extras. Los menores de 6 no pueden subir a las torres. Las entradas son nominativas y para entrar hay que mostrar un documento oficial con foto.`,
    ],
    sfPriceCaption: "Precios de la Sagrada Familia según el visitante",
    sfPriceHeaders: ["Entrada", "General", "Menores de 30 y carnet de estudiante", "Sénior", "Menores de 11 y personas con discapacidad"],
    sfPriceRows: [
      ["Basílica con audioguía en app", "26 €", "24 €", "21 €", "Gratis"],
      ["Con visita guiada", "30 €", "28 €", "23 €", "Gratis"],
      ["Con torres", "36 €", "34 €", "28 €", "Gratis"],
      ["Visita guiada y torres", "40 €", "38 €", "32 €", "Gratis"],
    ],
    sfPriceNote: "Precios por persona de sagradafamilia.org, comprobados el 28 de octubre de 2026. El acompañante de una persona con discapacidad paga 0, 4, 10 o 14 € por las mismas cuatro entradas. La audioguía cubre solo la basílica.",
    sfHoursTitle: "Horario de la Sagrada Familia",
    sfHoursCaption: "Horario de la Sagrada Familia por temporada",
    sfHoursHeaders: ["Meses", "Lunes a viernes", "Sábado", "Domingo"],
    sfHoursRows: [
      ["Noviembre a febrero", "9:00–18:00", "9:00–18:00", "10:30–18:00"],
      ["Marzo y octubre", "9:00–19:00", "9:00–18:00", "10:30–19:00"],
      ["Abril a septiembre", "9:00–20:00", "9:00–18:00", "10:30–20:00"],
      ["25 y 26 de diciembre, 1 y 6 de enero", "9:00–14:00", "9:00–14:00", "9:00–14:00"],
    ],
    sfHoursNote: "De sagradafamilia.org, comprobado el 28 de octubre de 2026. El horario puede cambiar por actos en la basílica.",
    sfHours: [
      "El templo se desaloja quince minutos antes del cierre, así que no reserves la última franja del día. Los visitantes individuales entran por la puerta general de la fachada del Nacimiento, en la calle de la Marina.",
      "**Cómo llegar:** metro L2 y L5, estación Sagrada Família; autobuses 19, 33, 34, D50, H10 y B24.",
    ],
    pgTitle: "Entradas del Park Güell: precio y cómo reservar",
    pg: [
      `La Zona Monumental cuesta **18 €** y las entradas **solo se venden en línea**, para una franja de 30 minutos entre las 9:30 y las 17:30 (${a("precios oficiales", URL.pg)}). Hay que entrar dentro de esa media hora; una vez dentro puedes quedarte el tiempo que quieras, pero si sales no puedes volver a entrar. Todo el mundo necesita entrada, también los niños que no pagan.`,
      `Las personas empadronadas en Barcelona entran gratis con el **Passi Verd**, que solo se reserva el mismo día: no admite reservas anticipadas (${a("Passi Verd", URL.passi)}).`,
    ],
    pgPriceCaption: "Precios del Park Güell",
    pgPriceHeaders: ["Visitante", "Precio"],
    pgPriceRows: [
      ["General", "18 €"],
      ["Niños de 7 a 12 años", "13,50 €"],
      ["Mayores de 65 y Targeta Rosa Reduïda", "13,50 €"],
      ["Niños de 0 a 6 años", "Gratis (con entrada)"],
      ["Personas con discapacidad", "Gratis"],
      ["Acompañante de una persona con discapacidad", "13,50 €"],
      ["Con entrada del Museu d'Història de Barcelona o de la Ruta del Modernisme", "14,50 €"],
    ],
    pgPriceNote: "Precios con IVA de parkguell.barcelona, comprobados el 28 de octubre de 2026. Los descuentos piden documentación al comprar.",
    pgHoursTitle: "Horario del Park Güell y cómo llegar",
    pgHours: [
      "El parque abre todo el año. Las entradas para turistas cubren las franjas de 9:30 a 17:30; de 7:00 a 9:30 y de 18:00 a 22:00 la Zona Monumental queda reservada a los vecinos y a quien tiene el Passi Verd, sin visitas turísticas.",
      `**Cómo llegar** (${a("indicaciones oficiales", URL.pgHow)}): metro L3 hasta Lesseps o Vallcarca y unos 20 minutos a pie, con escaleras mecánicas hacia la entrada de la avenida del Santuari de Sant Josep de la Muntanya; o autobuses H6 y D40 hasta la parada de Travessera de Dalt, a unos 10 minutos.`,
    ],
    batlloTitle: "Casa Batlló: precio de la entrada",
    batllo: [
      `Los precios de la Casa Batlló cambian según el día y la hora: la visita general, con audioguía en 15 idiomas y de una hora y cuarto, empieza **desde 29 €**, y comprar en línea con antelación ahorra hasta 15 € por persona (${a("entradas oficiales", URL.batllo)}). Los niños de 0 a 12 años con un adulto entran gratis; de 13 a 17 años, estudiantes y personas con discapacidad tienen 6 € de descuento (el acompañante de una persona con discapacidad entra gratis), y los mayores de 65, 3 €.`,
      `Otras entradas, solo en línea: **Be the First** (45 €), una visita a primera hora con menos gente y con la azotea, y **Bon Appétit** (desde 59 €), que añade la tercera planta y desayuno o tapas. Las visitas de noche se venden en línea en las fechas que publica la casa. Con la Barcelona Card hay 7 € de descuento (${b2link("cards", "es", "Barcelona Card o Hola Barcelona")}).`,
      "Abre todos los días del año de 8:30 a 22:30, con último acceso a las 21:30; la taquilla cierra a las 21:00.",
    ],
    pedreraTitle: "Casa Milà – La Pedrera",
    pedrera: [
      `La visita de día (La Pedrera Essential) cuesta **desde 29 €**; los menores de 12 años entran gratis, y de 12 a 17 años, mayores de 65 y estudiantes tienen tarifa reducida, con el importe en la página de reserva (${a("información práctica", URL.pedrera)}). Reservar no es obligatorio pero sí recomendable, y la taquilla cobra más en algunas tarifas.`,
      "Del 2 de noviembre de 2026 al 25 de febrero de 2027 abre cada día de 9:00 a 18:30. Cierra el 25 de diciembre de 2026 y del 11 al 17 de enero de 2027.",
    ],
    santpauTitle: "Recinte Modernista de Sant Pau",
    santpau: [
      `El conjunto hospitalario de Domènech i Montaner cuesta **18 €** antes de las 14:00 y **17 €** después, o 21 € con guía; la entrada reducida es de 12,60 € y 11,90 €, o 14,70 € con guía (${a("prepara la visita", URL.santpau)}). Abre cada día de 9:30 a 17:00 de noviembre a marzo y de 9:30 a 18:30 de abril a octubre, con último acceso 30 minutos antes del cierre, y cierra el 25 de diciembre. La entrada es gratuita el 23 de abril, la Noche de los Museos y el 24 de septiembre.`,
    ],
    resellerTitle: "Evita los revendedores",
    reseller: "Las condiciones de venta de la Sagrada Familia dicen que no aceptará ninguna entrada comprada a un revendedor, y sus entradas son nominativas. Los resultados de búsqueda están llenos de vendedores con recargo: los enlaces oficiales de arriba son los buenos.",
    planTitle: "Organizar un día de Gaudí",
    plan: [
      "**Reserva primero la Sagrada Familia y el Park Güell:** los dos tienen hora y se llenan; las casas del Passeig de Gràcia son más flexibles.",
      "**La Casa Batlló y La Pedrera están a pocos minutos a pie** en el Passeig de Gràcia: encajan en una misma mañana.",
      "**Estudiantes y menores de 30:** lleva identificación; los precios reducidos dependen de ella.",
    ],
    faq: [
      { question: "¿Cuánto cuesta la entrada a la Sagrada Familia?", answer: `26 € la básica con audioguía en app, 30 € con visita guiada y 36 € con torres, en la web oficial a ${VERIFIED}. Los menores de 11 entran gratis.` },
      { question: "¿Cuánto cuesta la Sagrada Familia para jubilados y estudiantes?", answer: "La tarifa sénior es de 21 € la básica (28 € con torres); los menores de 30 y quien tiene carnet de estudiante pagan 24 € (34 € con torres)." },
      { question: "¿Pueden subir niños a las torres de la Sagrada Familia?", answer: "Los menores de 6 años no: las condiciones de venta no les permiten visitar las torres. Los menores de 11 entran gratis a la basílica." },
      { question: "¿Qué horario tiene la Sagrada Familia?", answer: "De noviembre a febrero, de lunes a sábado de 9:00 a 18:00 y el domingo de 10:30 a 18:00; el 25 y 26 de diciembre y el 1 y 6 de enero, de 9:00 a 14:00. En marzo y octubre, de lunes a viernes de 9:00 a 19:00, el sábado de 9:00 a 18:00 y el domingo de 10:30 a 19:00. De abril a septiembre, de lunes a viernes de 9:00 a 20:00, el sábado de 9:00 a 18:00 y el domingo de 10:30 a 20:00." },
      { question: "¿Se pueden comprar entradas del Park Güell en la puerta?", answer: "No. Las entradas a la Zona Monumental solo se venden en línea, para una franja de 30 minutos." },
      { question: "¿A qué hora abre el Park Güell?", answer: "Las entradas para turistas son para franjas de 9:30 a 17:30, todos los días del año. Antes y después, el horario es para los vecinos." },
      { question: "¿Cuánto cuesta la entrada a la Casa Batlló?", answer: "La visita general cuesta desde 29 € y el precio cambia según el día y la hora. Comprar en línea con antelación ahorra hasta 15 € por persona, y los niños de 0 a 12 años con un adulto entran gratis." },
      { question: "¿El Park Güell es gratis para los vecinos de Barcelona?", answer: "Sí, con el Passi Verd, que se reserva el mismo día, para las personas empadronadas en Barcelona." },
      { question: "¿Qué es más barato, la Casa Batlló o La Pedrera?", answer: "Las dos empiezan en 29 € la visita de día de adulto; el precio de la Casa Batlló varía según la fecha, y las dos son más baratas en línea." },
    ],
  },
  ca: {
    lead: "**L'entrada a la Sagrada Família costa 26 €** (36 € amb torres; menors de 30, 24 €; sèniors, 21 €; menors d'11, gratis), **el Park Güell 18 €**, només en línia i per a una franja de 30 minuts, i **la Casa Batlló des de 29 €**, segons la data. La Pedrera també comença a 29 € i Sant Pau, 18 € abans de les 14:00. Són els preus del web de cada monument el 28 d'octubre de 2026. Tots venen entrades amb hora, i la norma que més estalvia és comprar al web oficial i amb antelació.",
    tableCaption: "Preus d'adult i horari d'hivern, d'un cop d'ull",
    headers: ["Monument", "Entrada adult", "Gratis", "Horari d'hivern"],
    rows: [
      ["Sagrada Família", "26 € (torres 36 €)", "Menors d'11", "Nov–febr: dl–ds 9:00–18:00, dg 10:30–18:00"],
      ["Park Güell (Zona Monumental)", "18 €, només en línia", "0–6 anys (amb entrada)", "Franges d'entrada 9:30–17:30"],
      ["Casa Batlló", "Des de 29 € (segons la data)", "0–12 anys, amb un adult", "Cada dia 8:30–22:30"],
      ["Casa Milà – La Pedrera", "Des de 29 €", "0–11 anys", "2 nov–25 febr: cada dia 9:00–18:30"],
      ["Recinte Modernista de Sant Pau", "18 € abans de les 14:00, 17 € després", "Vegeu la pàgina oficial", "Nov–març: cada dia 9:30–17:00"],
    ],
    tableNote: "Preus del web oficial de cada monument; la Casa Batlló fa preus segons la data i en publica un «des de».",
    checkTitle: "Tancaments temporals",
    checkText: "La Sagrada Família pot canviar l'horari per actes especials. Si les torres tanquen per meteorologia, avaries o manteniment, les condicions de venda retornen només la part de les torres, mai la visita al temple. Cada monument anuncia els tancaments al seu web: comprova-ho el dia abans.",
    sfTitle: "Entrades de la Sagrada Família: preus 2026",
    sf: [
      `L'entrada bàsica, amb l'audioguia en app, costa **26 €**; amb visita guiada **30 €**, amb torres **36 €** i amb totes dues coses **40 €** (${a("preus oficials", URL.sf)}). Els menors d'11 anys i les persones amb discapacitat hi entren gratis, i el seu acompanyant només paga els extres. Els menors de 6 anys no poden pujar a les torres. Les entrades són nominatives i per entrar cal mostrar un document oficial amb foto.`,
    ],
    sfPriceCaption: "Preus de la Sagrada Família segons el visitant",
    sfPriceHeaders: ["Entrada", "General", "Menors de 30 i carnet d'estudiant", "Sèniors", "Menors d'11 i persones amb discapacitat"],
    sfPriceRows: [
      ["Basílica amb audioguia en app", "26 €", "24 €", "21 €", "Gratis"],
      ["Amb visita guiada", "30 €", "28 €", "23 €", "Gratis"],
      ["Amb torres", "36 €", "34 €", "28 €", "Gratis"],
      ["Visita guiada i torres", "40 €", "38 €", "32 €", "Gratis"],
    ],
    sfPriceNote: "Preus per persona de sagradafamilia.org, comprovats el 28 d'octubre de 2026. L'acompanyant d'una persona amb discapacitat paga 0, 4, 10 o 14 € per les mateixes quatre entrades. L'audioguia cobreix només la basílica.",
    sfHoursTitle: "Horari de la Sagrada Família",
    sfHoursCaption: "Horari de la Sagrada Família per temporada",
    sfHoursHeaders: ["Mesos", "Dilluns a divendres", "Dissabte", "Diumenge"],
    sfHoursRows: [
      ["Novembre a febrer", "9:00–18:00", "9:00–18:00", "10:30–18:00"],
      ["Març i octubre", "9:00–19:00", "9:00–18:00", "10:30–19:00"],
      ["Abril a setembre", "9:00–20:00", "9:00–18:00", "10:30–20:00"],
      ["25 i 26 de desembre, 1 i 6 de gener", "9:00–14:00", "9:00–14:00", "9:00–14:00"],
    ],
    sfHoursNote: "De sagradafamilia.org, comprovat el 28 d'octubre de 2026. L'horari pot canviar per actes a la basílica.",
    sfHours: [
      "El temple es desallotja quinze minuts abans del tancament, així que no reservis l'última franja del dia. Els visitants individuals entren per la porta general de la façana del Naixement, al carrer de la Marina.",
      "**Com arribar-hi:** metro L2 i L5, estació Sagrada Família; autobusos 19, 33, 34, D50, H10 i B24.",
    ],
    pgTitle: "Entrades del Park Güell: preu i com reservar",
    pg: [
      `La Zona Monumental costa **18 €** i les entrades **només es venen en línia**, per a una franja de 30 minuts entre les 9:30 i les 17:30 (${a("preus oficials", URL.pg)}). Cal entrar dins d'aquella mitja hora; un cop a dins t'hi pots quedar tant com vulguis, però si surts no hi pots tornar a entrar. Tothom necessita entrada, també els infants que no paguen.`,
      `Les persones empadronades a Barcelona hi entren gratis amb el **Passi Verd**, que només es reserva el mateix dia: no admet reserves anticipades (${a("Passi Verd", URL.passi)}).`,
    ],
    pgPriceCaption: "Preus del Park Güell",
    pgPriceHeaders: ["Visitant", "Preu"],
    pgPriceRows: [
      ["General", "18 €"],
      ["Infants de 7 a 12 anys", "13,50 €"],
      ["Majors de 65 i Targeta Rosa Reduïda", "13,50 €"],
      ["Infants de 0 a 6 anys", "Gratis (amb entrada)"],
      ["Persones amb discapacitat", "Gratis"],
      ["Acompanyant d'una persona amb discapacitat", "13,50 €"],
      ["Amb entrada del Museu d'Història de Barcelona o de la Ruta del Modernisme", "14,50 €"],
    ],
    pgPriceNote: "Preus amb IVA de parkguell.barcelona, comprovats el 28 d'octubre de 2026. Els descomptes demanen documentació en comprar.",
    pgHoursTitle: "Horari del Park Güell i com arribar-hi",
    pgHours: [
      "El parc obre tot l'any. Les entrades per a turistes cobreixen les franges de 9:30 a 17:30; de 7:00 a 9:30 i de 18:00 a 22:00 la Zona Monumental queda reservada als veïns i a qui té el Passi Verd, sense visites turístiques.",
      `**Com arribar-hi** (${a("indicacions oficials", URL.pgHow)}): metro L3 fins a Lesseps o Vallcarca i uns 20 minuts a peu, amb escales mecàniques cap a l'entrada de l'avinguda del Santuari de Sant Josep de la Muntanya; o autobusos H6 i D40 fins a la parada de Travessera de Dalt, a uns 10 minuts.`,
    ],
    batlloTitle: "Casa Batlló: preu de l'entrada",
    batllo: [
      `Els preus de la Casa Batlló canvien segons el dia i l'hora: la visita general, amb audioguia en 15 idiomes i d'una hora i quart, comença **des de 29 €**, i comprar en línia amb antelació estalvia fins a 15 € per persona (${a("entrades oficials", URL.batllo)}). Els infants de 0 a 12 anys amb un adult hi entren gratis; de 13 a 17 anys, estudiants i persones amb discapacitat tenen 6 € de descompte (l'acompanyant d'una persona amb discapacitat hi entra gratis), i els majors de 65, 3 €.`,
      `Altres entrades, només en línia: **Be the First** (45 €), una visita a primera hora amb menys gent i amb el terrat, i **Bon Appétit** (des de 59 €), que hi afegeix la tercera planta i esmorzar o tapes. Les visites de nit es venen en línia les dates que publica la casa. Amb la Barcelona Card hi ha 7 € de descompte (${b2link("cards", "ca", "Barcelona Card o Hola Barcelona")}).`,
      "Obre tots els dies de l'any de 8:30 a 22:30, amb últim accés a les 21:30; la taquilla tanca a les 21:00.",
    ],
    pedreraTitle: "Casa Milà – La Pedrera",
    pedrera: [
      `La visita de dia (La Pedrera Essential) costa **des de 29 €**; els menors de 12 anys hi entren gratis, i de 12 a 17 anys, majors de 65 i estudiants tenen tarifa reduïda, amb l'import a la pàgina de reserva (${a("informació pràctica", URL.pedrera)}). Reservar no és obligatori però sí recomanable, i la taquilla cobra més en algunes tarifes.`,
      "Del 2 de novembre de 2026 al 25 de febrer de 2027 obre cada dia de 9:00 a 18:30. Tanca el 25 de desembre de 2026 i de l'11 al 17 de gener de 2027.",
    ],
    santpauTitle: "Recinte Modernista de Sant Pau",
    santpau: [
      `El conjunt hospitalari de Domènech i Montaner costa **18 €** abans de les 14:00 i **17 €** després, o 21 € amb guia; l'entrada reduïda és de 12,60 € i 11,90 €, o 14,70 € amb guia (${a("prepara la visita", URL.santpau)}). Obre cada dia de 9:30 a 17:00 de novembre a març i de 9:30 a 18:30 d'abril a octubre, amb últim accés 30 minuts abans del tancament, i tanca el 25 de desembre. L'entrada és gratuïta el 23 d'abril, la Nit dels Museus i el 24 de setembre.`,
    ],
    resellerTitle: "Evita els revenedors",
    reseller: "Les condicions de venda de la Sagrada Família diuen que no acceptarà cap entrada comprada a un revenedor, i les seves entrades són nominatives. Els resultats de cerca són plens de venedors amb recàrrec: els enllaços oficials d'aquí dalt són els bons.",
    planTitle: "Organitzar un dia de Gaudí",
    plan: [
      "**Reserva primer la Sagrada Família i el Park Güell:** tots dos tenen hora i s'omplen; les cases del passeig de Gràcia són més flexibles.",
      "**La Casa Batlló i la Pedrera són a pocs minuts a peu** al passeig de Gràcia: encaixen en un mateix matí.",
      "**Estudiants i menors de 30:** porta identificació; els preus reduïts en depenen.",
    ],
    faq: [
      { question: "Quant costa l'entrada a la Sagrada Família?", answer: `26 € la bàsica amb audioguia en app, 30 € amb visita guiada i 36 € amb torres, al web oficial a ${VERIFIED}. Els menors d'11 anys hi entren gratis.` },
      { question: "Quant costa la Sagrada Família per a jubilats i estudiants?", answer: "La tarifa sènior és de 21 € la bàsica (28 € amb torres); els menors de 30 i qui té carnet d'estudiant paguen 24 € (34 € amb torres)." },
      { question: "Poden pujar infants a les torres de la Sagrada Família?", answer: "Els menors de 6 anys no: les condicions de venda no els permeten visitar les torres. Els menors d'11 anys entren gratis a la basílica." },
      { question: "Quin horari té la Sagrada Família?", answer: "De novembre a febrer, de dilluns a dissabte de 9:00 a 18:00 i el diumenge de 10:30 a 18:00; el 25 i 26 de desembre i l'1 i 6 de gener, de 9:00 a 14:00. Al març i a l'octubre, de dilluns a divendres de 9:00 a 19:00, el dissabte de 9:00 a 18:00 i el diumenge de 10:30 a 19:00. D'abril a setembre, de dilluns a divendres de 9:00 a 20:00, el dissabte de 9:00 a 18:00 i el diumenge de 10:30 a 20:00." },
      { question: "Es poden comprar entrades del Park Güell a la porta?", answer: "No. Les entrades a la Zona Monumental només es venen en línia, per a una franja de 30 minuts." },
      { question: "A quina hora obre el Park Güell?", answer: "Les entrades per a turistes són per a franges de 9:30 a 17:30, tots els dies de l'any. Abans i després, l'horari és per als veïns." },
      { question: "Quant costa l'entrada a la Casa Batlló?", answer: "La visita general costa des de 29 € i el preu canvia segons el dia i l'hora. Comprar en línia amb antelació estalvia fins a 15 € per persona, i els infants de 0 a 12 anys amb un adult hi entren gratis." },
      { question: "El Park Güell és gratis per als veïns de Barcelona?", answer: "Sí, amb el Passi Verd, que es reserva el mateix dia, per a les persones empadronades a Barcelona." },
      { question: "Què és més barat, la Casa Batlló o la Pedrera?", answer: "Totes dues comencen a 29 € la visita de dia d'adult; el preu de la Casa Batlló varia segons la data, i totes dues són més barates en línia." },
    ],
  },
};

const MORE: Record<Locale, string> = {
  ca: `Per a les obres de Gaudí que gairebé ningú visita, mira ${featureLink("gaudi", "ca", "les obres menys conegudes de Gaudí")}.`,
  es: `Para las obras de Gaudí que casi nadie visita, mira ${featureLink("gaudi", "es", "las obras menos conocidas de Gaudí")}.`,
  en: `For the Gaudí buildings almost nobody visits, see ${featureLink("gaudi", "en", "the lesser-known Gaudí sites")}.`,
};

const OFFICIAL_NOTE: Record<Locale, string> = {
  ca: "Preus i horaris dels webs oficials. Canvien sovint: comprova'ls abans de comprar.",
  es: "Precios y horarios de las webs oficiales. Cambian a menudo: compruébalos antes de comprar.",
  en: "Prices and hours from the official sites. They change often: check before you buy.",
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    table(t.tableCaption, t.headers, t.rows, t.tableNote),
    callout("official", verifiedLine(locale, VERIFIED), OFFICIAL_NOTE[locale]),
    callout("warning", t.checkTitle, t.checkText),
    ...h2(t.sfTitle, ...t.sf),
    table(t.sfPriceCaption, t.sfPriceHeaders, t.sfPriceRows, t.sfPriceNote),
    ...h2(t.sfHoursTitle),
    table(t.sfHoursCaption, t.sfHoursHeaders, t.sfHoursRows, t.sfHoursNote),
    ...paras(...t.sfHours),
    ...h2(t.pgTitle, ...t.pg),
    table(t.pgPriceCaption, t.pgPriceHeaders, t.pgPriceRows, t.pgPriceNote),
    ...h2(t.pgHoursTitle, ...t.pgHours),
    ...h2(t.batlloTitle, ...t.batllo),
    ...h2(t.pedreraTitle, ...t.pedrera),
    ...h2(t.santpauTitle, ...t.santpau),
    ...h2(t.resellerTitle, t.reseller),
    ...h2(t.planTitle),
    list(...t.plan),
    ...paras(MORE[locale]),
    faq(t.faq),
    ...b2Related(["barcelonaHub", "museums", "cards", "montjuic", "campnou"], locale),
  ];
}

export const MONUMENTS: B2Article = {
  key: "monuments",
  entryKey: "guide-barcelona-gaudi-monument-tickets",
  categoryKey: "culture",
  sources: SOURCES,
  heroKey: "gaudi-park-guell-pavello-entrada",
  heroAlt: {
    ca: "El pavelló d'entrada del Park Güell, amb la torre de trencadís, i visitants a la plaça",
    es: "El pabellón de entrada del Park Güell, con la torre de trencadís, y visitantes en la plaza",
    en: "The Park Güell entrance pavilion with its trencadís tower, and visitors in front",
  },
  heroCaption: {
    ca: "Les entrades al Park Güell només es venen en línia, per franges de 30 minuts.",
    es: "Las entradas al Park Güell solo se venden en línea, por franjas de 30 minutos.",
    en: "Park Güell tickets are sold online only, in 30-minute slots.",
  },
  secondaryKey: "gaudi-sagrada-familia-facana-naixement",
  secondaryAlt: {
    ca: "La façana del Naixement de la Sagrada Família, amb visitants a l'escalinata",
    es: "La fachada del Nacimiento de la Sagrada Familia, con visitantes en la escalinata",
    en: "The Nativity façade of the Sagrada Família, with visitors on the steps",
  },
  secondaryCaption: {
    ca: "La façana del Naixement de la Sagrada Família.",
    es: "La fachada del Nacimiento de la Sagrada Familia.",
    en: "The Nativity façade of the Sagrada Família.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T16:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as MONUMENTS_META };
