import { link as featureLink } from "@/lib/content/features/shared";
import type { Locale } from "@/lib/i18n/config";

import {
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
 * 2026" line, Park Güell's resale clause, Casa Batlló's early-morning ticket,
 * and "bad weather" as a Sagrada Família closure reason (the site says special
 * events). The Sagrada Família ticket page still carries a "temporarily closed
 * to the public" block whose "more information" link is the Junta's 30 Oct
 * 2020 notice; the prices, schedules and tower pages sell normally, so the
 * block is not reported as a live closure. Two
 * Gaudí houses are left out on purpose: Palau Güell's site was down and the
 * council's figures for it conflict with a snippet of the official one, and
 * Casa Vicens loads its prices in a booking widget we could not read. Sant
 * Pau's children's price is omitted because its own page states two
 * different rules.
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
 * No reseller links. Sagrada Família refuses tickets bought from resellers,
 * and Park Güell bans resale: the useful advice is the official site.
 */

const VERIFIED = "2026-10-26";

const SOURCES: B2Source[] = [
  { name: "Sagrada Família — prices", url: "https://sagradafamilia.org/en/prices", publisher: "Junta Constructora del Temple de la Sagrada Família" },
  { name: "Sagrada Família — opening hours", url: "https://sagradafamilia.org/en/schedules-how-to-get", publisher: "Junta Constructora del Temple de la Sagrada Família" },
  { name: "Sagrada Família — rules and conditions of sale", url: "https://sagradafamilia.org/en/rules-and-conditions-of-sale", publisher: "Junta Constructora del Temple de la Sagrada Família" },
  { name: "Park Güell — official site", url: "https://parkguell.barcelona/en", publisher: "Park Güell (BSM)" },
  { name: "Park Güell — prices and times", url: "https://parkguell.barcelona/en/planning-your-visit/prices-and-times", publisher: "Park Güell (BSM)" },
  { name: "Park Güell — Passi Verd", url: "https://parkguell.barcelona/en/planifica-la-teva-visita/passi-verd", publisher: "Park Güell (BSM)" },
  { name: "Casa Batlló — tickets", url: "https://www.casabatllo.es/en/online-tickets/", publisher: "Casa Batlló" },
  { name: "Casa Batlló — opening hours", url: "https://www.casabatllo.es/en/visit/opening-hours/", publisher: "Casa Batlló" },
  { name: "La Pedrera — visits", url: "https://www.lapedrera.com/en/visits", publisher: "Fundació Catalunya La Pedrera" },
  { name: "La Pedrera — practical information", url: "https://www.lapedrera.com/en/practical-information/", publisher: "Fundació Catalunya La Pedrera" },
  { name: "Sant Pau Recinte Modernista — plan your visit", url: "https://santpaubarcelona.org/en/prepara-la-teva-visita/", publisher: "Fundació Privada Hospital de la Santa Creu i Sant Pau" },
];

const URL = {
  sf: "https://sagradafamilia.org/en/prices",
  pg: "https://parkguell.barcelona/en/planning-your-visit/prices-and-times",
  passi: "https://parkguell.barcelona/en/planifica-la-teva-visita/passi-verd",
  batllo: "https://www.casabatllo.es/en/online-tickets/",
  pedrera: "https://www.lapedrera.com/en/practical-information/",
  santpau: "https://santpaubarcelona.org/en/prepara-la-teva-visita/",
};
const a = (label: string, url: string) => `[${label}](${url})`;

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/entrades-sagrada-familia-park-guell-casa-batllo",
    title: "Sagrada Família, Park Güell i Casa Batlló: entrades, preus i horaris",
    seoTitle: "Entrades Sagrada Família, Park Güell i Batlló: preus 2026",
    seoDescription:
      "Sagrada Família 26 € (torres 36 €), Park Güell 18 € només en línia, Casa Batlló i la Pedrera des de 29 €: preus oficials, horaris i qui hi entra gratis.",
    excerpt:
      "Què costa entrar als grans monuments modernistes de Barcelona, quan obren, qui no paga i on comprar sense revenedors, segons els webs oficials.",
  },
  es: {
    path: "guias/entradas-sagrada-familia-park-guell-casa-batllo",
    title: "Sagrada Família, Park Güell y Casa Batlló: entradas, precios y horarios",
    seoTitle: "Entradas Sagrada Familia, Park Güell y Batlló: precios 2026",
    seoDescription:
      "Sagrada Familia 26 € (torres 36 €), Park Güell 18 € solo en línea, Casa Batlló y La Pedrera desde 29 €: precios oficiales, horarios y quién entra gratis.",
    excerpt:
      "Qué cuesta entrar en los grandes monumentos modernistas de Barcelona, cuándo abren, quién no paga y dónde comprar sin revendedores, según las webs oficiales.",
  },
  en: {
    path: "guides/sagrada-familia-park-guell-casa-batllo-tickets",
    title: "Sagrada Família, Park Güell and Casa Batlló: tickets, prices and opening hours",
    seoTitle: "Sagrada Familia, Park Güell, Casa Batlló tickets: 2026 prices",
    seoDescription:
      "Sagrada Família €26 (towers €36), Park Güell €18 online only, Casa Batlló and La Pedrera from €29: official prices, opening hours and who goes free.",
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
  pgTitle: string;
  pg: string[];
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
    lead: "**A Sagrada Família ticket costs €26** (€36 with the towers; under 11s free), **Park Güell costs €18**, sold online only for a 30-minute slot, and **Casa Batlló starts from €29**, depending on the date. La Pedrera also starts at €29 and Sant Pau €18 before 14:00. Those are the prices on each monument's own website on 24 October 2026. All of them sell timed tickets, and the rule that saves most money is to buy on the official site, in advance.",
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
    sfTitle: "Sagrada Família",
    sf: [
      `The basic ticket, with the audio-guide app, is **€26**; with a guided tour **€30**, with the towers **€36**, and both **€40** (${a("official prices", URL.sf)}). Under 30s and holders of a student card pay €24 for the basic ticket, seniors €21; under 11s and people with disabilities go free. Children under 6 may not go up the towers. Tickets carry the visitor's name, and you need official photo ID to get in.`,
      "From November to February it opens Monday to Saturday 9:00–18:00 and Sunday 10:30–18:00; in March and October, Monday to Friday 9:00–19:00, Saturday 9:00–18:00 and Sunday 10:30–19:00. On 25 and 26 December and 1 and 6 January it opens 9:00–14:00 only.",
    ],
    pgTitle: "Park Güell",
    pg: [
      `The Monumental Zone costs **€18**; ages 7–12 and over-65s pay €13.50, and children up to 6 go free but still need a ticket (${a("official prices", URL.pg)}). Tickets are **sold online only**, for a 30-minute slot between 9:30 and 17:30; you must enter within that half hour and cannot re-enter.`,
      `People registered as residents of Barcelona get in free with the **Passi Verd**, booked on the same day only: it cannot be reserved in advance (${a("Passi Verd", URL.passi)}).`,
    ],
    batlloTitle: "Casa Batlló",
    batllo: [
      `Casa Batlló prices change with the date and time: the general visit, with an audio guide in 15 languages, starts **from €29**, and buying in advance online saves up to €15 per person (${a("official tickets", URL.batllo)}). Children aged 0 to 12 with an adult go free; ages 13–17 and students get €6 off, over-65s €3 off.`,
      "It is open every day of the year from 8:30 to 22:30, with last admission at 21:30; a separate night visit is sold online only.",
    ],
    pedreraTitle: "Casa Milà – La Pedrera",
    pedrera: [
      `The day visit starts **from €29**; children up to 11 go free, and ages 12–17, over-65s and students have reduced fares, priced on the booking page (${a("practical information", URL.pedrera)}). Booking is not compulsory but recommended, and the box office charges more on some fares.`,
      "From 2 November 2026 to 25 February 2027 it opens daily 9:00–18:30. It is closed on 25 December 2026 and from 11 to 17 January 2027.",
    ],
    santpauTitle: "Sant Pau Recinte Modernista",
    santpau: [
      `Domènech i Montaner's hospital complex costs **€18** before 14:00 and **€17** after, or €21 with a guide; reduced tickets are €12.60 and €11.90 (${a("plan your visit", URL.santpau)}). From November to March it opens daily 9:30–17:00, and it is closed on 25 December. Entry is free on 23 April, on the Night of Museums and on 24 September.`,
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
      { question: "How much is a Sagrada Família ticket?", answer: `€26 for the basic ticket with the audio-guide app, €36 with the towers, on the official site as of ${VERIFIED}. Under 11s go free.` },
      { question: "What are the Sagrada Família opening hours?", answer: "In October, Monday to Friday 9:00–19:00, Saturday 9:00–18:00 and Sunday 10:30–19:00. From November to February, Monday to Saturday 9:00–18:00 and Sunday 10:30–18:00." },
      { question: "Can I buy Park Güell tickets at the gate?", answer: "No. Tickets for the Monumental Zone are sold online only, for a 30-minute time slot." },
      { question: "How much are Casa Batlló tickets?", answer: "The general visit starts from €29 and the price changes with the date and time. Buying online in advance saves up to €15 per person, and children aged 0 to 12 with an adult go free." },
      { question: "Is Park Güell free for Barcelona residents?", answer: "Yes, with the Passi Verd, booked on the same day, for people registered as residents in Barcelona." },
      { question: "Which is cheaper, Casa Batlló or La Pedrera?", answer: "Both start at €29 for an adult day visit; Casa Batlló's price varies with the date, and both are cheaper online." },
    ],
  },
  es: {
    lead: "**La entrada a la Sagrada Familia cuesta 26 €** (36 € con torres; los menores de 11, gratis), **el Park Güell 18 €**, solo en línea y para una franja de 30 minutos, y **la Casa Batlló desde 29 €**, según la fecha. La Pedrera también empieza en 29 € y Sant Pau, 18 € antes de las 14:00. Son los precios de la web de cada monumento el 24 de octubre de 2026. Todos venden entradas con hora, y la regla que más ahorra es comprar en la web oficial y con antelación.",
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
    sfTitle: "Sagrada Familia",
    sf: [
      `La entrada básica, con la audioguía en app, cuesta **26 €**; con visita guiada **30 €**, con torres **36 €** y con las dos cosas **40 €** (${a("precios oficiales", URL.sf)}). Los menores de 30 y quien tiene carnet de estudiante pagan 24 € la básica, los sénior 21 €; los menores de 11 y las personas con discapacidad entran gratis. Los menores de 6 no pueden subir a las torres. Las entradas son nominativas y para entrar hay que mostrar un documento oficial con foto.`,
      "De noviembre a febrero abre de lunes a sábado de 9:00 a 18:00 y el domingo de 10:30 a 18:00; en marzo y octubre, de lunes a viernes de 9:00 a 19:00, el sábado de 9:00 a 18:00 y el domingo de 10:30 a 19:00. El 25 y 26 de diciembre y el 1 y 6 de enero abre solo de 9:00 a 14:00.",
    ],
    pgTitle: "Park Güell",
    pg: [
      `La Zona Monumental cuesta **18 €**; de 7 a 12 años y mayores de 65 pagan 13,50 €, y los niños hasta 6 años entran gratis pero necesitan entrada (${a("precios oficiales", URL.pg)}). Las entradas **solo se venden en línea**, para una franja de 30 minutos entre las 9:30 y las 17:30; hay que entrar dentro de esa media hora y no se puede volver a entrar.`,
      `Las personas empadronadas en Barcelona entran gratis con el **Passi Verd**, que solo se reserva el mismo día: no admite reservas anticipadas (${a("Passi Verd", URL.passi)}).`,
    ],
    batlloTitle: "Casa Batlló",
    batllo: [
      `Los precios de la Casa Batlló cambian según el día y la hora: la visita general, con audioguía en 15 idiomas, empieza **desde 29 €**, y comprar en línea con antelación ahorra hasta 15 € por persona (${a("entradas oficiales", URL.batllo)}). Los niños de 0 a 12 años con un adulto entran gratis; de 13 a 17 y estudiantes tienen 6 € de descuento, y los mayores de 65, 3 €.`,
      "Abre todos los días del año de 8:30 a 22:30, con último acceso a las 21:30; aparte se vende solo en línea una visita de noche.",
    ],
    pedreraTitle: "Casa Milà – La Pedrera",
    pedrera: [
      `La visita de día cuesta **desde 29 €**; los niños hasta 11 años entran gratis, y de 12 a 17 años, mayores de 65 y estudiantes tienen tarifa reducida, con el importe en la página de reserva (${a("información práctica", URL.pedrera)}). Reservar no es obligatorio pero sí recomendable, y la taquilla cobra más en algunas tarifas.`,
      "Del 2 de noviembre de 2026 al 25 de febrero de 2027 abre cada día de 9:00 a 18:30. Cierra el 25 de diciembre de 2026 y del 11 al 17 de enero de 2027.",
    ],
    santpauTitle: "Recinte Modernista de Sant Pau",
    santpau: [
      `El conjunto hospitalario de Domènech i Montaner cuesta **18 €** antes de las 14:00 y **17 €** después, o 21 € con guía; la entrada reducida es de 12,60 € y 11,90 € (${a("prepara la visita", URL.santpau)}). De noviembre a marzo abre cada día de 9:30 a 17:00, y cierra el 25 de diciembre. La entrada es gratuita el 23 de abril, la Noche de los Museos y el 24 de septiembre.`,
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
      { question: "¿Cuánto cuesta la entrada a la Sagrada Familia?", answer: `26 € la básica con audioguía en app y 36 € con torres, en la web oficial a ${VERIFIED}. Los menores de 11 entran gratis.` },
      { question: "¿Qué horario tiene la Sagrada Familia?", answer: "En octubre, de lunes a viernes de 9:00 a 19:00, el sábado de 9:00 a 18:00 y el domingo de 10:30 a 19:00. De noviembre a febrero, de lunes a sábado de 9:00 a 18:00 y el domingo de 10:30 a 18:00." },
      { question: "¿Se pueden comprar entradas del Park Güell en la puerta?", answer: "No. Las entradas a la Zona Monumental solo se venden en línea, para una franja de 30 minutos." },
      { question: "¿Cuánto cuesta la entrada a la Casa Batlló?", answer: "La visita general cuesta desde 29 € y el precio cambia según el día y la hora. Comprar en línea con antelación ahorra hasta 15 € por persona, y los niños de 0 a 12 años con un adulto entran gratis." },
      { question: "¿El Park Güell es gratis para los vecinos de Barcelona?", answer: "Sí, con el Passi Verd, que se reserva el mismo día, para las personas empadronadas en Barcelona." },
      { question: "¿Qué es más barato, la Casa Batlló o La Pedrera?", answer: "Las dos empiezan en 29 € la visita de día de adulto; el precio de la Casa Batlló varía según la fecha, y las dos son más baratas en línea." },
    ],
  },
  ca: {
    lead: "**L'entrada a la Sagrada Família costa 26 €** (36 € amb torres; els menors d'11, gratis), **el Park Güell 18 €**, només en línia i per a una franja de 30 minuts, i **la Casa Batlló des de 29 €**, segons la data. La Pedrera també comença a 29 € i Sant Pau, 18 € abans de les 14:00. Són els preus del web de cada monument el 24 d'octubre de 2026. Tots venen entrades amb hora, i la norma que més estalvia és comprar al web oficial i amb antelació.",
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
    sfTitle: "Sagrada Família",
    sf: [
      `L'entrada bàsica, amb l'audioguia en app, costa **26 €**; amb visita guiada **30 €**, amb torres **36 €** i amb totes dues coses **40 €** (${a("preus oficials", URL.sf)}). Els menors de 30 anys i qui té carnet d'estudiant paguen 24 € la bàsica, els sèniors 21 €; els menors d'11 anys i les persones amb discapacitat hi entren gratis. Els menors de 6 anys no poden pujar a les torres. Les entrades són nominatives i per entrar cal mostrar un document oficial amb foto.`,
      "De novembre a febrer obre de dilluns a dissabte de 9:00 a 18:00 i el diumenge de 10:30 a 18:00; al març i a l'octubre, de dilluns a divendres de 9:00 a 19:00, el dissabte de 9:00 a 18:00 i el diumenge de 10:30 a 19:00. El 25 i 26 de desembre i l'1 i 6 de gener obre només de 9:00 a 14:00.",
    ],
    pgTitle: "Park Güell",
    pg: [
      `La Zona Monumental costa **18 €**; de 7 a 12 anys i majors de 65 paguen 13,50 €, i els infants fins a 6 anys hi entren gratis però necessiten entrada (${a("preus oficials", URL.pg)}). Les entrades **només es venen en línia**, per a una franja de 30 minuts entre les 9:30 i les 17:30; cal entrar dins d'aquella mitja hora i no es pot tornar a entrar.`,
      `Les persones empadronades a Barcelona hi entren gratis amb el **Passi Verd**, que només es reserva el mateix dia: no admet reserves anticipades (${a("Passi Verd", URL.passi)}).`,
    ],
    batlloTitle: "Casa Batlló",
    batllo: [
      `Els preus de la Casa Batlló canvien segons el dia i l'hora: la visita general, amb audioguia en 15 idiomes, comença **des de 29 €**, i comprar en línia amb antelació estalvia fins a 15 € per persona (${a("entrades oficials", URL.batllo)}). Els infants de 0 a 12 anys amb un adult hi entren gratis; de 13 a 17 anys i estudiants tenen 6 € de descompte, i els majors de 65, 3 €.`,
      "Obre tots els dies de l'any de 8:30 a 22:30, amb últim accés a les 21:30; a part es ven només en línia una visita de nit.",
    ],
    pedreraTitle: "Casa Milà – La Pedrera",
    pedrera: [
      `La visita de dia costa **des de 29 €**; els infants fins a 11 anys hi entren gratis, i de 12 a 17 anys, majors de 65 i estudiants tenen tarifa reduïda, amb l'import a la pàgina de reserva (${a("informació pràctica", URL.pedrera)}). Reservar no és obligatori però sí recomanable, i la taquilla cobra més en algunes tarifes.`,
      "Del 2 de novembre de 2026 al 25 de febrer de 2027 obre cada dia de 9:00 a 18:30. Tanca el 25 de desembre de 2026 i de l'11 al 17 de gener de 2027.",
    ],
    santpauTitle: "Recinte Modernista de Sant Pau",
    santpau: [
      `El conjunt hospitalari de Domènech i Montaner costa **18 €** abans de les 14:00 i **17 €** després, o 21 € amb guia; l'entrada reduïda és de 12,60 € i 11,90 € (${a("prepara la visita", URL.santpau)}). De novembre a març obre cada dia de 9:30 a 17:00, i tanca el 25 de desembre. L'entrada és gratuïta el 23 d'abril, la Nit dels Museus i el 24 de setembre.`,
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
      { question: "Quant costa l'entrada a la Sagrada Família?", answer: `26 € la bàsica amb audioguia en app i 36 € amb torres, al web oficial a ${VERIFIED}. Els menors d'11 anys hi entren gratis.` },
      { question: "Quin horari té la Sagrada Família?", answer: "A l'octubre, de dilluns a divendres de 9:00 a 19:00, el dissabte de 9:00 a 18:00 i el diumenge de 10:30 a 19:00. De novembre a febrer, de dilluns a dissabte de 9:00 a 18:00 i el diumenge de 10:30 a 18:00." },
      { question: "Es poden comprar entrades del Park Güell a la porta?", answer: "No. Les entrades a la Zona Monumental només es venen en línia, per a una franja de 30 minuts." },
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
    ...h2(t.pgTitle, ...t.pg),
    ...h2(t.batlloTitle, ...t.batllo),
    ...h2(t.pedreraTitle, ...t.pedrera),
    ...h2(t.santpauTitle, ...t.santpau),
    ...h2(t.resellerTitle, t.reseller),
    ...h2(t.planTitle),
    list(...t.plan),
    ...paras(MORE[locale]),
    faq(t.faq),
    ...b2Related(["barcelonaHub", "museums", "montjuic", "campnou"], locale),
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
