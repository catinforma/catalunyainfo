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
 * Two Barcelona guides: the Zoo and the Aquarium, and the food markets.
 *
 * Zoo from zoobarcelona.cat, Aquarium from aquariumbcn.com (hours read from
 * the calendar data behind its own page), markets from the City Council's
 * markets institute and its 2017, 2019 and Aug 2026 notes. Checked on
 * 12 Oct 2026 (research_notes/blog-batch-03/zoo_aquarium.md, markets.md);
 * all of it re-checked on 24 Oct 2026 against the same official pages. The
 * Zoo's winter hours were updated on 26 Oct 2026, after the clock change, from
 * the Zoo's own daily line and the City Council's page on the Zoo
 * (research_notes/rank-all/review-4-bcn-sights.md).
 *
 * Left out: the Zoo Club price (the site states two), any Zoo + Aquarium combo (only
 * resellers sell one), Boqueria stall-by-stall habits (blogs only), and the
 * group rules at Santa Caterina and Sant Antoni, which were not reconfirmed.
 */

// Markets re-checked 28 Oct 2026: IMMB pages for every market in the table,
// boqueria.barcelona (contact: "Monday to Saturday: 8:00am - 8:30pm", Rambla
// 91, phone; Christmas 2025-26 openings post of 9 Dec 2025), the Aug 2026
// reform note (group rule restated). No 2026-27 Sunday or holiday openings
// are published yet, so none is printed.
const VERIFIED = "2026-10-28";
// The Zoo page alone was re-checked on 26 Oct 2026 (winter hours); the
// markets page keeps VERIFIED.
// Re-checked 28 Oct 2026: Zoo prices and the "open every day ... closed in
// the afternoon on Christmas day" line (tickets page), the Zoo's daily line
// (Wed 28 Oct 10:00-16:30, ticket office and gates 16:00), the City Council's
// winter table, Zoo Club prices; Aquarium prices (incl. the online-only
// Flexiticket valid 90 days), FAQ (re-entry is paid again) and its calendar
// to 31 Jan 2027. The 14:00 Christmas closing is the City Council's figure
// and is attributed to it.
// Re-checked 30 Oct 2026: Zoo tickets page (same prices; "open every day of
// the year ... only closed in the afternoon on Christmas day"), the Zoo's
// daily line (Fri 30 Oct 10:00-16:30, gates 16:00), the home page (Ciutadella
// entrance only); Aquarium prices page (same, plus: with a disability of 65 %
// or more one companion goes free) and its calendar data to 31 Jan 2027
// (unchanged).
const ZOO_VERIFIED = "2026-10-30";
type Meta = { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string };

/* ========================================================================== */
/* Zoo and Aquarium                                                           */
/* ========================================================================== */

const ZOO_SOURCES: B2Source[] = [
  { name: "Zoo de Barcelona", url: "https://www.zoobarcelona.cat/", publisher: "Zoo de Barcelona (BSM)" },
  { name: "Zoo de Barcelona — entradas y abonos", url: "https://www.zoobarcelona.cat/es/planifica-tu-visita/entradas-y-abonos", publisher: "Zoo de Barcelona (BSM)" },
  { name: "Zoo de Barcelona — horario del Zoo", url: "https://www.zoobarcelona.cat/es/visita-el-zoo/horario-del-zoo", publisher: "Zoo de Barcelona (BSM)" },
  { name: "Zoo de Barcelona — cómo llegar", url: "https://www.zoobarcelona.cat/es/planifica-tu-visita/como-llegar", publisher: "Zoo de Barcelona (BSM)" },
  { name: "El Zoo de Barcelona — horaris", url: "https://www.barcelona.cat/en/discoverbcn/pics/el-zoo-de-barcelona-61171409", publisher: "Ajuntament de Barcelona" },
  { name: "L'Aquàrium de Barcelona — prices", url: "https://www.aquariumbcn.com/en/visit/prices/", publisher: "L'Aquàrium de Barcelona" },
  { name: "Barcelona Zoo — tickets and subscriptions", url: "https://www.zoobarcelona.cat/en/plan-your-visit/tickets-and-subscriptions", publisher: "Zoo de Barcelona (BSM)" },
  { name: "L'Aquàrium de Barcelona — FAQ", url: "https://www.aquariumbcn.com/en/faq/", publisher: "L'Aquàrium de Barcelona" },
  { name: "L'Aquàrium de Barcelona — opening hours", url: "https://www.aquariumbcn.com/en/visit/opening-hours/", publisher: "L'Aquàrium de Barcelona" },
  { name: "L'Aquàrium de Barcelona — how to get here", url: "https://www.aquariumbcn.com/en/plan-your-visit/how-to-get-here/", publisher: "L'Aquàrium de Barcelona" },
];

const ZOO_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/zoo-aquarium-barcelona",
    title: "Zoo i Aquàrium de Barcelona: entrades, horaris i com arribar-hi",
    seoTitle: "Zoo i Aquàrium de Barcelona: horaris i preu de les entrades",
    seoDescription:
      "Zoo de Barcelona a 23 € (infants 13,90 €), entrada només per la Ciutadella, i Aquàrium a 30 € (5 a 10 anys, 23 €). Horaris de tots dos i com arribar-hi.",
    excerpt: "Quant costen el Zoo i l'Aquàrium de Barcelona, quan obren, qui hi entra gratis i com s'hi arriba, amb dades dels webs oficials.",
  },
  es: {
    path: "guias/zoo-aquarium-barcelona",
    title: "Zoo y Aquarium de Barcelona: entradas, horarios y cómo llegar",
    seoTitle: "Zoo y Aquarium de Barcelona: horario y precio de entradas",
    seoDescription:
      "Zoo de Barcelona a 23 € (niños 13,90 €), entrada solo por la Ciutadella, y Aquarium a 30 € (de 5 a 10 años, 23 €). Horario de los dos y cómo llegar.",
    excerpt: "Cuánto cuestan el Zoo y el Aquarium de Barcelona, cuándo abren, quién entra gratis y cómo se llega, con datos de las webs oficiales.",
  },
  en: {
    path: "guides/barcelona-zoo-aquarium-tickets",
    title: "Barcelona Zoo and Aquarium tickets 2026: prices, opening hours and getting there",
    seoTitle: "Barcelona Zoo & Aquarium tickets 2026: Zoo €23, Aquarium €30",
    seoDescription:
      "Zoo €23 (ages 3–12 €13.90), Aquarium €30 (ages 5–10 €23, family pack 2+2 €88); under-3s free at both. Prices, winter opening hours and how to get there.",
    excerpt: "What Barcelona Zoo and the Aquarium cost, when they open, who goes free and how to get there, from the official websites.",
  },
};

type ZT = {
  lead: string;
  pTitle: string;
  pCaption: string; pHeaders: string[]; pRows: string[][]; pNote: string;
  zooTitle: string; zoo: string[];
  zooCaption: string; zooHeaders: string[]; zooRows: string[][]; zooNote: string;
  aqTitle: string; aq: string[];
  aqCaption: string; aqHeaders: string[]; aqRows: string[][]; aqNote: string;
  getTitle: string; get: string[];
  faq: { question: string; answer: string }[]; note: string;
};

/**
 * Re-checked 24 Oct 2026. Zoo: zoobarcelona.cat/es/planifica-tu-visita/
 * entradas-y-abonos (prices), /visita-el-zoo/horario-del-zoo (today's hours
 * only), home page (only entrance inside the Parc de la Ciutadella; some
 * areas closed for works), /como-llegar (metro, Renfe, buses).
 * Zoo hours updated 26 Oct 2026: the Zoo's daily line read "Abierto 10:00 h |
 * Cerrado 16:30 h" and "Cerramos taquillas y accesos a las 16:00"; the City
 * Council's Zoo page (barcelona.cat, no year shown) gives the winter table
 * (24 Oct-20 Dec and 8 Jan-28 Feb weekdays 10:00-16:30, weekends 10:00-17:30;
 * 21 Dec-7 Jan every day 10:00-17:30; 25 Dec 10:00-14:00), consistent with
 * the Zoo's own line on 24 and 26 Oct. Its "taquilles tanquen 1h abans" is
 * not printed: the Zoo's own figure is 30 minutes. entradas-y-abonos states
 * "El Zoo está abierto todos los días; solamente cierra el día de Navidad por
 * la tarde", so that line is back. Aquarium: /en/visit/prices/ and the openingHoursData calendar behind
 * /en/visit/opening-hours/ (published to 31 Jan 2027).
 */
const ZOO_COPY: Record<Locale, ZT> = {
  en: {
    lead: "**Barcelona Zoo tickets cost €23** for adults and **€13.90** for children aged 3 to 12; **Barcelona Aquarium tickets cost €30** for adults and **€23** for ages 5 to 10, with a 2 adults + 2 children pack at €88 online. Under-3s go free at both. The Zoo opens at 10:00 every day and, until 20 December, closes at **16:30 on weekdays** and **17:30 at weekends and on public holidays** (gates shut half an hour earlier); you can only get in through the entrance inside the Parc de la Ciutadella. From 2 November to 20 December the Aquarium opens 10:00 to 19:00 on weekdays and to 20:00 at weekends (last entry an hour before). They are a short metro ride apart.",
    pTitle: "Barcelona Zoo and Aquarium ticket prices",
    pCaption: "Ticket prices in 2026",
    pHeaders: ["Ticket", "Zoo", "Aquarium"],
    pRows: [
      ["Adult", "€23 (13 and over)", "€30 (11 and over)"],
      ["Child", "€13.90 (3 to 12)", "€23 (5 to 10), €15 (3 to 4)"],
      ["Senior", "€11.20 (over 65, ticket office)", "€25 (over 65)"],
      ["Under 3", "Free", "Free"],
      ["Disability card", "€6 (33% or more, ticket office)", "€20 adult, €14 child (ticket office); one companion free at 65% or more"],
      ["Packs (online)", "—", "2 adults + 2 children €88; 1 + 2 €63; 4 adults €100"],
      ["Flexible date (online)", "—", "Flexiticket: €35 adult, €28 (5 to 10), €17 (3 to 4), €30 senior; valid 90 days"],
    ],
    pNote: "From zoobarcelona.cat and aquariumbcn.com, checked on 30 October 2026. There is no official combined Zoo and Aquarium ticket.",
    zooTitle: "Barcelona Zoo opening hours",
    zoo: [
      "The Zoo is open every day of the year; on Christmas Day it closes in the afternoon. On **Friday 30 October 2026** the Zoo's own timetable page showed 10:00 to 16:30, with ticket offices and gates closing at 16:00. The City Council's page on the Zoo gives the winter timetable below; check the Zoo's own timetable page on the day.",
      "**Entrance:** at the moment you can only get into the Zoo through the entrance inside the Parc de la Ciutadella. Some enclosures and areas are temporarily closed while the Zoo carries out improvement works; the rest of the park stays open.",
      "**Discounts:** large-family and single-parent family cards get 20% off at the ticket office. Visitors with a disability of 33% or more pay €6, with a free companion when the Zoo's conditions are met. The **Zoo Club** annual pass costs €47 (individual), €27 (teens) or €65 (single-parent family), plus €25.50 registration, and lasts 12 months.",
    ],
    zooCaption: "Barcelona Zoo winter opening hours",
    zooHeaders: ["Dates", "Mon–Fri", "Sat, Sun and holidays"],
    zooRows: [
      ["24 October to 20 December 2026", "10:00–16:30", "10:00–17:30"],
      ["21 December 2026 to 7 January 2027 (25 December 10:00–14:00)", "10:00–17:30", "10:00–17:30"],
      ["8 January to 28 February 2027", "10:00–16:30", "10:00–17:30"],
    ],
    zooNote: "From barcelona.cat (City Council) and the Zoo's timetable page, checked on 30 October 2026. Gates close 30 minutes before closing.",
    aqTitle: "Barcelona Aquarium opening hours",
    aq: [
      "The Aquarium opens every day of the year; the ticket office and entry close **one hour before closing time**, and if you leave, coming back in means paying again. Its calendar is published to 31 January 2027:",
    ],
    aqCaption: "L'Aquàrium opening hours, autumn and winter 2026-27",
    aqHeaders: ["Dates", "Opening hours"],
    aqRows: [
      ["Until 1 November 2026", "Every day 10:00–20:00"],
      ["2 November to 20 December", "Mon–Fri 10:00–19:00; Sat and Sun 10:00–20:00 (7 and 8 December 10:00–20:00)"],
      ["21 to 30 December", "10:00–20:00 (24 December 10:00–19:00)"],
      ["31 December", "10:00–19:00"],
      ["1 to 4 January 2027", "10:00–20:00"],
      ["5 to 31 January 2027", "Mon–Fri 10:00–19:00; Sat and Sun 10:00–20:00"],
    ],
    aqNote: "From the calendar on aquariumbcn.com, checked on 30 October 2026. Last entry one hour before closing.",
    getTitle: "How to get to the Zoo and the Aquarium",
    get: [
      "**Zoo:** entrance inside the Parc de la Ciutadella; metro L4 Barceloneta or L1 Arc de Triomf, Rodalies Arc de Triomf or Estació de França, buses V17, V19, H14 and H16.",
      "**Aquarium:** Moll d'Espanya in the Port Vell; metro L4 Barceloneta or L3 Drassanes.",
      "**Both in one day:** Barceloneta station (L4) and buses H14, V17 and V19 serve both.",
    ],
    faq: [
      { question: "How much is Barcelona Zoo?", answer: "€23 for adults and €13.90 for children aged 3 to 12; under-3s free; over-65s €11.20 at the ticket office. Same price online and at the gate." },
      { question: "What time does Barcelona Zoo close?", answer: "Until 20 December, at 16:30 on weekdays and 17:30 at weekends and on public holidays; last entry half an hour earlier. On Christmas Day it closes in the afternoon (at 14:00, according to the City Council)." },
      { question: "How much is the Barcelona Aquarium?", answer: "€30 for adults, €23 for ages 5 to 10, €15 for ages 3 to 4, €25 for over-65s; under-3s free. The online Flexiticket (€35 adult) can be used on any day within 90 days." },
      { question: "What are the Barcelona Aquarium's opening hours?", answer: "10:00 to 20:00 every day until 1 November 2026; from 2 November, 10:00 to 19:00 on weekdays and 10:00 to 20:00 at weekends. Last entry one hour before closing." },
      { question: "Is there a combined Zoo and Aquarium ticket?", answer: "Not from either venue. Only resellers offer combinations." },
      { question: "Is there a family ticket for the Barcelona Aquarium?", answer: "Yes, online only: the Family Pack 2+2 (two adults and two children) costs €88 and the 1+2 pack €63; the Friends Pack of four adult tickets is €100. Barcelona Zoo has no family day ticket: large and single-parent families get 20% off at the ticket office with their family card." },
      { question: "Is it cheaper to buy Barcelona Zoo tickets online?", answer: "No: adult (€23) and child (€13.90) tickets cost the same online and at the gate, and the senior ticket (€11.20) is sold at the ticket office. At the Aquarium the day ticket is also the same price online and at the box office; the online Flexiticket costs more (€35) because the date is open for 90 days." },
    ],
    note: "Prices and hours change: check the Zoo and Aquarium websites for your date.",
  },
  es: {
    lead: "**El Zoo de Barcelona cuesta 23 €** (niños de 3 a 12 años, 13,90 €) y abre a las 10:00 todos los días: hasta el 20 de diciembre cierra a las **16:30 entre semana** y a las **17:30 los fines de semana y festivos**, y las taquillas y los accesos cierran media hora antes. Solo se entra por la puerta del interior del parque de la Ciutadella. **El Aquarium cuesta 30 €** (de 5 a 10 años, 23 €) y abre de 10:00 a 20:00 todos los días hasta el 1 de noviembre; del 2 de noviembre al 20 de diciembre cierra a las 19:00 entre semana y a las 20:00 los fines de semana. Los dos cobran lo mismo en línea y en taquilla, y están a poca distancia en metro.",
    pTitle: "Precio de las entradas del Zoo y del Aquarium",
    pCaption: "Precios de las entradas en 2026",
    pHeaders: ["Entrada", "Zoo", "Aquarium"],
    pRows: [
      ["Adulto", "23 € (13 años o más)", "30 € (11 años o más)"],
      ["Niño", "13,90 € (de 3 a 12)", "23 € (de 5 a 10), 15 € (de 3 a 4)"],
      ["Sénior", "11,20 € (mayores de 65, en taquilla)", "25 € (mayores de 65)"],
      ["Menores de 3", "Gratis", "Gratis"],
      ["Discapacidad", "6 € (33 % o más, en taquilla)", "20 € adulto, 14 € niño (en taquilla); un acompañante gratis desde el 65 %"],
      ["Packs (en línea)", "—", "2 adultos + 2 niños 88 €; 1 + 2, 63 €; 4 adultos, 100 €"],
      ["Fecha abierta (en línea)", "—", "Flexiticket: 35 € adulto, 28 € (5 a 10), 17 € (3 a 4), 30 € sénior; vale 90 días"],
    ],
    pNote: "De zoobarcelona.cat y aquariumbcn.com, comprobado el 30 de octubre de 2026. No hay entrada combinada oficial Zoo y Aquarium.",
    zooTitle: "Horario del Zoo de Barcelona",
    zoo: [
      "El Zoo abre todos los días del año; el día de Navidad cierra por la tarde. El **viernes 30 de octubre de 2026** la página de horario del Zoo indicaba de 10:00 a 16:30, con taquillas y accesos cerrados a las 16:00. La página del Ayuntamiento sobre el Zoo da el horario de invierno de la tabla; compruébalo el mismo día en la página de horario del Zoo.",
      "**Entrada:** actualmente al Zoo solo se accede por la entrada situada en el interior del parque de la Ciutadella. Algunas instalaciones y espacios no se pueden visitar temporalmente por obras de mejora; el resto del parque sigue abierto.",
      "**Descuentos:** las familias numerosas y monoparentales tienen un 20 % de descuento en taquilla presentando el carné. Las personas con una discapacidad del 33 % o más pagan 6 €, con acompañante gratuito si se cumplen las condiciones del Zoo. El abono anual **Zoo Club** cuesta 47 € (individual), 27 € (adolescentes) o 65 € (familia monoparental), más 25,50 € de alta, y vale 12 meses.",
    ],
    zooCaption: "Horario de invierno del Zoo de Barcelona",
    zooHeaders: ["Fechas", "Lun–vie", "Sáb, dom y festivos"],
    zooRows: [
      ["Del 24 de octubre al 20 de diciembre de 2026", "10:00–16:30", "10:00–17:30"],
      ["Del 21 de diciembre de 2026 al 7 de enero de 2027 (25 de diciembre, 10:00–14:00)", "10:00–17:30", "10:00–17:30"],
      ["Del 8 de enero al 28 de febrero de 2027", "10:00–16:30", "10:00–17:30"],
    ],
    zooNote: "De barcelona.cat (Ayuntamiento) y de la página de horario del Zoo, comprobado el 30 de octubre de 2026. Taquillas y accesos cierran 30 minutos antes del cierre.",
    aqTitle: "Horario del Aquarium (acuario) de Barcelona",
    aq: [
      "El Aquarium abre todos los días del año; la taquilla y el acceso cierran **una hora antes del cierre**, y si sales, volver a entrar se paga de nuevo. Tiene el calendario publicado hasta el 31 de enero de 2027:",
    ],
    aqCaption: "Horario de L'Aquàrium, otoño e invierno 2026-27",
    aqHeaders: ["Fechas", "Horario"],
    aqRows: [
      ["Hasta el 1 de noviembre de 2026", "Todos los días 10:00–20:00"],
      ["Del 2 de noviembre al 20 de diciembre", "Lun–vie 10:00–19:00; sáb y dom 10:00–20:00 (7 y 8 de diciembre, 10:00–20:00)"],
      ["Del 21 al 30 de diciembre", "10:00–20:00 (24 de diciembre, 10:00–19:00)"],
      ["31 de diciembre", "10:00–19:00"],
      ["Del 1 al 4 de enero de 2027", "10:00–20:00"],
      ["Del 5 al 31 de enero de 2027", "Lun–vie 10:00–19:00; sáb y dom 10:00–20:00"],
    ],
    aqNote: "Del calendario de aquariumbcn.com, comprobado el 30 de octubre de 2026. Último acceso una hora antes del cierre.",
    getTitle: "Cómo llegar al Zoo y al Aquarium",
    get: [
      "**Zoo:** entrada en el interior del parque de la Ciutadella; metro L4 Barceloneta o L1 Arc de Triomf, Rodalies Arc de Triomf o Estació de França, buses V17, V19, H14 y H16.",
      "**Aquarium:** Moll d'Espanya, en el Port Vell; metro L4 Barceloneta o L3 Drassanes.",
      "**Los dos el mismo día:** la estación de Barceloneta (L4) y los buses H14, V17 y V19 sirven para ambos.",
    ],
    faq: [
      { question: "¿Cuánto cuesta la entrada al Zoo de Barcelona?", answer: "23 € los adultos y 13,90 € los niños de 3 a 12 años; los menores de 3, gratis; los mayores de 65, 11,20 € en taquilla. Mismo precio en línea y en taquilla." },
      { question: "¿A qué hora cierra el Zoo de Barcelona?", answer: "Hasta el 20 de diciembre, a las 16:30 entre semana y a las 17:30 los fines de semana y festivos; último acceso media hora antes. El día de Navidad cierra por la tarde (a las 14:00, según el Ayuntamiento)." },
      { question: "¿Cuánto vale la entrada al acuario de Barcelona?", answer: "30 € adultos, 23 € de 5 a 10 años, 15 € de 3 a 4 años, 25 € mayores de 65; menores de 3, gratis. La Flexiticket en línea (35 € adulto) se puede usar cualquier día en 90 días." },
      { question: "¿Cuál es el horario del Aquarium (acuario) de Barcelona?", answer: "De 10:00 a 20:00 todos los días hasta el 1 de noviembre de 2026; desde el 2 de noviembre, de 10:00 a 19:00 entre semana y de 10:00 a 20:00 los fines de semana. Último acceso una hora antes del cierre." },
      { question: "¿Hay entrada combinada Zoo y Aquarium?", answer: "No por parte de ninguno de los dos. Solo los revendedores ofrecen combinados." },
    ],
    note: "Precios y horarios cambian: consulta las webs del Zoo y del Aquarium para tu fecha.",
  },
  ca: {
    lead: "**El Zoo de Barcelona costa 23 €** (infants de 3 a 12 anys, 13,90 €) i obre a les 10:00 cada dia: fins al 20 de desembre tanca a les **16:30 entre setmana** i a les **17:30 els caps de setmana i festius**, i les taquilles i els accessos tanquen mitja hora abans. Només s'hi entra per la porta de l'interior del parc de la Ciutadella. **L'Aquàrium costa 30 €** (de 5 a 10 anys, 23 €) i obre de 10:00 a 20:00 cada dia fins a l'1 de novembre; del 2 de novembre al 20 de desembre tanca a les 19:00 entre setmana i a les 20:00 els caps de setmana. Tots dos cobren el mateix en línia i a taquilla, i són a poca distància en metro.",
    pTitle: "Preu de les entrades del Zoo i de l'Aquàrium",
    pCaption: "Preus de les entrades el 2026",
    pHeaders: ["Entrada", "Zoo", "Aquàrium"],
    pRows: [
      ["Adult", "23 € (13 anys o més)", "30 € (11 anys o més)"],
      ["Infant", "13,90 € (de 3 a 12)", "23 € (de 5 a 10), 15 € (de 3 a 4)"],
      ["Sènior", "11,20 € (majors de 65, a taquilla)", "25 € (majors de 65)"],
      ["Menors de 3", "Gratis", "Gratis"],
      ["Discapacitat", "6 € (33 % o més, a taquilla)", "20 € adult, 14 € infant (a taquilla); un acompanyant gratis des del 65 %"],
      ["Paquets (en línia)", "—", "2 adults + 2 infants 88 €; 1 + 2, 63 €; 4 adults, 100 €"],
      ["Data oberta (en línia)", "—", "Flexiticket: 35 € adult, 28 € (5 a 10), 17 € (3 a 4), 30 € sènior; val 90 dies"],
    ],
    pNote: "De zoobarcelona.cat i aquariumbcn.com, comprovat el 30 d'octubre de 2026. No hi ha entrada combinada oficial Zoo i Aquàrium.",
    zooTitle: "Horari del Zoo de Barcelona",
    zoo: [
      "El Zoo obre cada dia de l'any; el dia de Nadal tanca a la tarda. El **divendres 30 d'octubre de 2026** la pàgina d'horari del Zoo indicava de 10:00 a 16:30, amb taquilles i accessos tancats a les 16:00. La pàgina de l'Ajuntament sobre el Zoo dona l'horari d'hivern de la taula; comprova'l el mateix dia a la pàgina d'horari del Zoo.",
      "**Entrada:** actualment l'accés al Zoo es fa únicament per l'entrada situada a l'interior del parc de la Ciutadella. Algunes instal·lacions i espais no es poden visitar temporalment per obres de millora; la resta del parc continua obert.",
      "**Descomptes:** les famílies nombroses i monoparentals tenen un 20 % de descompte a taquilla presentant el carnet. Les persones amb una discapacitat del 33 % o més paguen 6 €, amb acompanyant gratuït si es compleixen les condicions del Zoo. L'abonament anual **Zoo Club** costa 47 € (individual), 27 € (adolescents) o 65 € (família monoparental), més 25,50 € d'alta, i val 12 mesos.",
    ],
    zooCaption: "Horari d'hivern del Zoo de Barcelona",
    zooHeaders: ["Dates", "Dl–dv", "Ds, dg i festius"],
    zooRows: [
      ["Del 24 d'octubre al 20 de desembre de 2026", "10:00–16:30", "10:00–17:30"],
      ["Del 21 de desembre de 2026 al 7 de gener de 2027 (25 de desembre, 10:00–14:00)", "10:00–17:30", "10:00–17:30"],
      ["Del 8 de gener al 28 de febrer de 2027", "10:00–16:30", "10:00–17:30"],
    ],
    zooNote: "De barcelona.cat (Ajuntament) i de la pàgina d'horari del Zoo, comprovat el 30 d'octubre de 2026. Taquilles i accessos tanquen 30 minuts abans del tancament.",
    aqTitle: "Horari de l'Aquàrium de Barcelona",
    aq: [
      "L'Aquàrium obre cada dia de l'any; la taquilla i l'accés tanquen **una hora abans del tancament**, i si en surts, tornar a entrar es paga de nou. Té el calendari publicat fins al 31 de gener de 2027:",
    ],
    aqCaption: "Horari de L'Aquàrium, tardor i hivern 2026-27",
    aqHeaders: ["Dates", "Horari"],
    aqRows: [
      ["Fins a l'1 de novembre de 2026", "Cada dia 10:00–20:00"],
      ["Del 2 de novembre al 20 de desembre", "Dl–dv 10:00–19:00; ds i dg 10:00–20:00 (7 i 8 de desembre, 10:00–20:00)"],
      ["Del 21 al 30 de desembre", "10:00–20:00 (24 de desembre, 10:00–19:00)"],
      ["31 de desembre", "10:00–19:00"],
      ["De l'1 al 4 de gener de 2027", "10:00–20:00"],
      ["Del 5 al 31 de gener de 2027", "Dl–dv 10:00–19:00; ds i dg 10:00–20:00"],
    ],
    aqNote: "Del calendari d'aquariumbcn.com, comprovat el 30 d'octubre de 2026. Últim accés una hora abans del tancament.",
    getTitle: "Com arribar al Zoo i a l'Aquàrium",
    get: [
      "**Zoo:** entrada a l'interior del parc de la Ciutadella; metro L4 Barceloneta o L1 Arc de Triomf, Rodalies Arc de Triomf o Estació de França, busos V17, V19, H14 i H16.",
      "**Aquàrium:** Moll d'Espanya, al Port Vell; metro L4 Barceloneta o L3 Drassanes.",
      "**Tots dos el mateix dia:** l'estació de Barceloneta (L4) i els busos H14, V17 i V19 serveixen per a tots dos.",
    ],
    faq: [
      { question: "Quant costa l'entrada al Zoo de Barcelona?", answer: "23 € els adults i 13,90 € els infants de 3 a 12 anys; els menors de 3, gratis; els majors de 65, 11,20 € a taquilla. Mateix preu en línia i a taquilla." },
      { question: "A quina hora tanca el Zoo de Barcelona?", answer: "Fins al 20 de desembre, a les 16:30 entre setmana i a les 17:30 els caps de setmana i festius; últim accés mitja hora abans. El dia de Nadal tanca a la tarda (a les 14:00, segons l'Ajuntament)." },
      { question: "Quant val l'entrada a l'Aquàrium de Barcelona?", answer: "30 € adults, 23 € de 5 a 10 anys, 15 € de 3 a 4 anys, 25 € majors de 65; menors de 3, gratis. La Flexiticket en línia (35 € adult) es pot fer servir qualsevol dia en 90 dies." },
      { question: "Quin és l'horari de l'Aquàrium de Barcelona?", answer: "De 10:00 a 20:00 cada dia fins a l'1 de novembre de 2026; des del 2 de novembre, de 10:00 a 19:00 entre setmana i de 10:00 a 20:00 els caps de setmana. Últim accés una hora abans del tancament." },
      { question: "Hi ha entrada combinada Zoo i Aquàrium?", answer: "No per part de cap dels dos. Només els revenedors ofereixen combinats." },
    ],
    note: "Els preus i els horaris canvien: consulta els webs del Zoo i de l'Aquàrium per a la teva data.",
  },
};

function zooBody(locale: Locale) {
  const t = ZOO_COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, ZOO_VERIFIED), t.note),
    ...h2(t.pTitle),
    table(t.pCaption, t.pHeaders, t.pRows, t.pNote),
    ...h2(t.zooTitle, t.zoo[0]!),
    table(t.zooCaption, t.zooHeaders, t.zooRows, t.zooNote),
    ...paras(...t.zoo.slice(1)),
    ...h2(t.aqTitle, ...t.aq),
    table(t.aqCaption, t.aqHeaders, t.aqRows, t.aqNote),
    ...h2(t.getTitle),
    list(...t.get),
    faq(t.faq),
    ...b2Related(["museums", "tibidabo", "montjuic"], locale),
  ];
}

export const ZOO_AQUARIUM: B2Article = {
  key: "zooAquarium",
  entryKey: "guide-barcelona-zoo-aquarium",
  categoryKey: "cities",
  sources: ZOO_SOURCES,
  heroKey: "aquarium-tunel",
  heroAlt: {
    ca: "Visitants al túnel de vidre de l'Aquàrium de Barcelona, envoltats de peixos",
    es: "Visitantes en el túnel de cristal del Aquarium de Barcelona, rodeados de peces",
    en: "Visitors in the Barcelona Aquarium's glass tunnel, surrounded by fish",
  },
  heroCaption: {
    ca: "El túnel de l'Aquàrium, al Port Vell.",
    es: "El túnel del Aquarium, en el Port Vell.",
    en: "The Aquarium's tunnel on the Port Vell.",
  },
  secondaryKey: "zoo-entrada-ciutadella",
  secondaryAlt: {
    ca: "L'entrada del Zoo de Barcelona des del parc de la Ciutadella",
    es: "La entrada del Zoo de Barcelona desde el parque de la Ciutadella",
    en: "The entrance to Barcelona Zoo from the Parc de la Ciutadella",
  },
  secondaryCaption: {
    ca: "L'entrada del Zoo, al parc de la Ciutadella.",
    es: "La entrada del Zoo, en el parque de la Ciutadella.",
    en: "The Zoo entrance in the Parc de la Ciutadella.",
  },
  verifiedAt: ZOO_VERIFIED,
  publishedAt: "2026-10-13T01:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...ZOO_META[locale], blocks: zooBody(locale) }]),
  ) as B2Article["editions"],
};

/* ========================================================================== */
/* Food markets                                                               */
/* ========================================================================== */

const MARKETS_SOURCES: B2Source[] = [
  { name: "Mercat de Sant Josep - la Boqueria", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-sant-josep-la-boqueria-92086009447", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat de Santa Caterina", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-santa-caterina-92086009448", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat de Sant Antoni", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-sant-antoni-92086009452", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat de la Concepció", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-la-concepcio-92086009449", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat de la Llibertat", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-la-llibertat-92086009773", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat del Ninot", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-del-ninot-92086009451", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat dominical de Sant Antoni", url: "https://ajuntament.barcelona.cat/mercats/ca/mercats-no-alimentaris/mercat-dominical-de-sant-antoni-96058202955", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Boqueria — contact and opening hours", url: "https://www.boqueria.barcelona/contact", publisher: "Mercat de la Boqueria" },
  { name: "Boqueria opening hours during Christmas (2025-26)", url: "https://www.boqueria.barcelona/boqueria-opening-hours-during-christmas-n-352-en", publisher: "Mercat de la Boqueria" },
  { name: "Nota sobre la reforma de la Boqueria (27.08.2026)", url: "https://ajuntament.barcelona.cat/mercats/sites/default/files/2026-08/260827_NOTA_reformaBoqueriapropermandat_def.pdf", publisher: "Ajuntament de Barcelona" },
];

const MARKETS_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/mercat-boqueria-mercats-barcelona",
    title: "La Boqueria i els mercats de Barcelona: horaris i normes per visitar-los",
    seoTitle: "La Boqueria i els mercats de Barcelona: horaris i normes",
    seoDescription:
      "La Boqueria obre de dilluns a dissabte de 8:00 a 20:30 i tanca els diumenges. Horaris de Santa Caterina, Sant Antoni i la resta, i la norma dels grups.",
    excerpt: "Quan obren la Boqueria i els altres grans mercats de Barcelona, les normes per als grups de visitants i què canviarà amb la reforma.",
  },
  es: {
    path: "guias/mercado-boqueria-mercados-barcelona",
    title: "Horario de la Boqueria y de los mercados de Barcelona: días, festivos y normas para visitarlos",
    seoTitle: "Horario de la Boqueria y de los mercados de Barcelona",
    seoDescription:
      "La Boqueria abre de lunes a sábado de 8:00 a 20:30; domingos y festivos, solo los días que anuncia. Horario de Santa Caterina, Sant Antoni y Ninot.",
    excerpt: "Cuándo abren la Boqueria y los otros grandes mercados de Barcelona, las normas para los grupos de visitantes y qué cambiará con la reforma.",
  },
  en: {
    path: "guides/la-boqueria-barcelona-markets",
    title: "La Boqueria and Barcelona's food markets: opening hours and visiting rules",
    seoTitle: "La Boqueria opening hours and Barcelona market times",
    seoDescription:
      "La Boqueria is open Monday to Saturday, 8:00 to 20:30, and closed on Sundays. Opening times for Sant Antoni, Santa Caterina, Ninot and other city markets.",
    excerpt: "When La Boqueria and Barcelona's other big markets open, the rules for visitor groups, and what the renovation will change.",
  },
};

type MKT = {
  lead: string;
  boqTitle: string; boq: string[];
  rulesTitle: string; rules: string[];
  hTitle: string; hCaption: string; hHeaders: string[]; hRows: string[][]; hNote: string;
  bookTitle: string; book: string;
  tipsTitle: string; tips: string[];
  faq: { question: string; answer: string }[]; note: string;
};

const MARKETS_COPY: Record<Locale, MKT> = {
  en: {
    lead: "**La Boqueria opens Monday to Saturday, 8:00 to 20:30**; on Sundays and public holidays it opens only on the dates the market announces, usually a few over Christmas. Each stall sets its own hours inside that window. Sant Antoni keeps the same hours, while Santa Caterina, La Concepció, La Llibertat and El Ninot close early on some days (table below). These are working markets first: the city runs them for the people who shop there.",
    boqTitle: "La Boqueria opening hours, Sundays and holidays",
    boq: [
      "The Mercat de Sant Josep, La Boqueria, is at La Rambla 91 and opens Monday to Saturday from 8:00 to 20:30; the nearest metro is Liceu (L3). Phone: 93 413 23 03.",
      "**Sundays and public holidays:** the market opens only on the days it announces. Over Christmas 2025-26 it opened on Saturday 6 December and on Sundays 21 and 28 December and 4 January; the 2026-27 dates have not been published yet.",
      "A renovation is under way: smaller works start after the summer of 2026, the central fish stalls are expected to move temporarily to Plaça de la Gardunya, and the main works on the roof and structure run from 2027 to 2029, with trading continuing where possible.",
    ],
    rulesTitle: "Rules for visitors",
    rules: [
      "**Organised groups of 15 or more visitors cannot enter La Boqueria on Fridays and Saturdays from April to October.** The rule dates from 2017 and the City Council restated it in August 2026, when it announced the market's renovation.",
    ],
    hTitle: "Barcelona market opening hours",
    hCaption: "Opening hours of the city's main markets",
    hHeaders: ["Market", "Opening hours"],
    hRows: [
      ["La Boqueria", "Monday to Saturday 8:00–20:30"],
      ["Santa Caterina", "September to June: Tue, Thu, Fri 7:30–20:30; Mon, Wed, Sat 7:30–14:30. July and August: Fri 7:30–20:30; other days 7:30–14:30"],
      ["Sant Antoni", "Monday to Saturday 8:00–20:30"],
      ["La Concepció", "Mon and Sat 8:00–15:00; Tue to Fri 8:00–20:00"],
      ["La Llibertat", "Mon to Fri 8:00–20:30; Sat 8:00–15:00 (shorter in August)"],
      ["El Ninot", "Mon to Thu 8:00–20:00; Fri and Sat 8:00–17:00"],
    ],
    hNote: "From the City Council's markets institute, checked on 28 October 2026. Market hours are the building's; individual stalls set their own.",
    bookTitle: "Sunday book market at Sant Antoni",
    book: "Around Sant Antoni market, the Sunday book, comics and collectables market runs every Sunday from 8:30 to 14:00, including Sundays that are public holidays.",
    tipsTitle: "Tips",
    tips: [
      "**Check the day:** hours vary by market and by weekday, as the table shows.",
      "**Monday afternoons** are short at Santa Caterina and La Concepció, which close at 14:30 and 15:00.",
      "**Buy something:** these are food markets, and the stallholders' living depends on sales, not footfall.",
    ],
    faq: [
      { question: "Is La Boqueria open on Sundays?", answer: "Usually not. It opens Monday to Saturday from 8:00 to 20:30, and on Sundays only on the dates the market announces, usually a few over Christmas." },
      { question: "Is La Boqueria open on public holidays?", answer: "Only on the days the market announces. Over Christmas 2025-26 those were 6, 21 and 28 December and 4 January; the 2026-27 dates are not published yet." },
      { question: "Can tour groups visit La Boqueria?", answer: "Not organised groups of 15 or more on Fridays and Saturdays from April to October." },
      { question: "Which Barcelona markets are open on Sundays?", answer: "None of the big food markets in the table: they all open Monday to Saturday. On Sundays the book, comics and collectables market around Sant Antoni runs from 8:30 to 14:00." },
      { question: "What time does La Boqueria close?", answer: "At 20:30, Monday to Saturday; each stall sets its own hours within that." },
    ],
    note: "Market hours change for holidays and works: check the City Council's markets pages.",
  },
  es: {
    lead: "**La Boqueria abre de lunes a sábado de 8:00 a 20:30**; los domingos y festivos solo abre los días que anuncia el mercado, normalmente unos pocos en Navidad. Cada parada fija su horario dentro de esa franja. Sant Antoni tiene el mismo horario, mientras que Santa Caterina, la Concepció, la Llibertat y el Ninot cierran antes algunos días (tabla más abajo). Son ante todo mercados de barrio: el Ayuntamiento los gestiona para quien compra en ellos.",
    boqTitle: "Horario de la Boqueria: domingos y festivos",
    boq: [
      "El Mercat de Sant Josep, la Boqueria, está en La Rambla, 91, y abre de lunes a sábado de 8:00 a 20:30; el metro más cercano es Liceu (L3). Teléfono: 93 413 23 03.",
      "**Domingos y festivos:** el mercado solo abre los días que anuncia. En la Navidad de 2025-26 abrió el sábado 6 de diciembre y los domingos 21 y 28 de diciembre y 4 de enero; las fechas de 2026-27 aún no se han publicado.",
      "Hay una reforma en marcha: las obras menores empiezan después del verano de 2026, está previsto que las paradas centrales de pescado se trasladen temporalmente a la plaza de la Gardunya, y las obras grandes de cubierta y estructura van de 2027 a 2029, manteniendo la actividad donde sea posible.",
    ],
    rulesTitle: "Normas para los visitantes",
    rules: [
      "**Los grupos organizados de 15 visitantes o más no pueden entrar en la Boqueria los viernes y sábados de abril a octubre.** La norma es de 2017 y el Ayuntamiento la recordó en agosto de 2026, al anunciar la reforma del mercado.",
    ],
    hTitle: "Horario de los mercados de Barcelona",
    hCaption: "Horario de los principales mercados de la ciudad",
    hHeaders: ["Mercado", "Horario"],
    hRows: [
      ["La Boqueria", "De lunes a sábado 8:00–20:30"],
      ["Santa Caterina", "De septiembre a junio: mar, jue, vie 7:30–20:30; lun, mié, sáb 7:30–14:30. Julio y agosto: vie 7:30–20:30; resto de días 7:30–14:30"],
      ["Sant Antoni", "De lunes a sábado 8:00–20:30"],
      ["La Concepció", "Lun y sáb 8:00–15:00; de mar a vie 8:00–20:00"],
      ["La Llibertat", "De lun a vie 8:00–20:30; sáb 8:00–15:00 (más corto en agosto)"],
      ["El Ninot", "De lun a jue 8:00–20:00; vie y sáb 8:00–17:00"],
    ],
    hNote: "Del Instituto Municipal de Mercados, comprobado el 28 de octubre de 2026. El horario es el del edificio; cada parada fija el suyo.",
    bookTitle: "Mercado dominical de Sant Antoni",
    book: "Alrededor del mercado de Sant Antoni, el mercado dominical de libros, cómics y coleccionismo se hace todos los domingos de 8:30 a 14:00, también los domingos festivos.",
    tipsTitle: "Consejos",
    tips: [
      "**Mira el día:** el horario cambia según el mercado y el día de la semana, como muestra la tabla.",
      "**Los lunes por la tarde** Santa Caterina y la Concepció cierran pronto, a las 14:30 y a las 15:00.",
      "**Compra algo:** son mercados de alimentación y los paradistas viven de las ventas, no de las visitas.",
    ],
    faq: [
      { question: "¿La Boqueria abre los domingos?", answer: "Normalmente no. Abre de lunes a sábado de 8:00 a 20:30, y los domingos solo los días que anuncia el mercado, normalmente unos pocos en Navidad." },
      { question: "¿Cuál es el horario de la Boqueria en festivos?", answer: "Solo abre los festivos que anuncia el mercado. En la Navidad de 2025-26 fueron el 6, el 21 y el 28 de diciembre y el 4 de enero; las fechas de 2026-27 aún no están publicadas." },
      { question: "¿Dónde está la Boqueria?", answer: "En La Rambla, 91; la parada de metro más cercana es Liceu (L3)." },
      { question: "¿Pueden visitar la Boqueria los grupos turísticos?", answer: "No los grupos organizados de 15 personas o más, los viernes y sábados de abril a octubre." },
      { question: "¿Qué mercados de Barcelona abren el domingo?", answer: "Ninguno de los grandes mercados de alimentación de la tabla: todos abren de lunes a sábado. El domingo, alrededor de Sant Antoni, se hace el mercado de libros, cómics y coleccionismo, de 8:30 a 14:00." },
      { question: "¿A qué hora cierra la Boqueria?", answer: "A las 20:30, de lunes a sábado; cada parada fija su horario dentro de ese." },
    ],
    note: "Los horarios de los mercados cambian por fiestas y obras: consulta las páginas de mercados del Ayuntamiento.",
  },
  ca: {
    lead: "**La Boqueria obre de dilluns a dissabte de 8:00 a 20:30**; els diumenges i festius només obre els dies que anuncia el mercat, normalment uns quants per Nadal. Cada parada fixa el seu horari dins d'aquesta franja. Sant Antoni té el mateix horari, mentre que Santa Caterina, la Concepció, la Llibertat i el Ninot tanquen abans alguns dies (taula més avall). Són abans de res mercats de barri: l'Ajuntament els gestiona per a qui hi compra.",
    boqTitle: "Horari de la Boqueria: diumenges i festius",
    boq: [
      "El Mercat de Sant Josep, la Boqueria, és a la Rambla, 91, i obre de dilluns a dissabte de 8:00 a 20:30; el metro més proper és Liceu (L3). Telèfon: 93 413 23 03.",
      "**Diumenges i festius:** el mercat només obre els dies que anuncia. El Nadal de 2025-26 va obrir el dissabte 6 de desembre i els diumenges 21 i 28 de desembre i 4 de gener; les dates del 2026-27 encara no s'han publicat.",
      "Hi ha una reforma en marxa: les obres menors comencen després de l'estiu del 2026, està previst que les parades centrals de peix es traslladin temporalment a la plaça de la Gardunya, i les obres grans de coberta i estructura van del 2027 al 2029, mantenint l'activitat on sigui possible.",
    ],
    rulesTitle: "Normes per als visitants",
    rules: [
      "**Els grups organitzats de 15 visitants o més no poden entrar a la Boqueria els divendres i dissabtes d'abril a octubre.** La norma és del 2017 i l'Ajuntament la va recordar l'agost de 2026, quan va anunciar la reforma del mercat.",
    ],
    hTitle: "Horari dels mercats de Barcelona",
    hCaption: "Horari dels principals mercats de la ciutat",
    hHeaders: ["Mercat", "Horari"],
    hRows: [
      ["La Boqueria", "De dilluns a dissabte 8:00–20:30"],
      ["Santa Caterina", "De setembre a juny: dt, dj, dv 7:30–20:30; dl, dc, ds 7:30–14:30. Juliol i agost: dv 7:30–20:30; resta de dies 7:30–14:30"],
      ["Sant Antoni", "De dilluns a dissabte 8:00–20:30"],
      ["La Concepció", "Dl i ds 8:00–15:00; de dt a dv 8:00–20:00"],
      ["La Llibertat", "De dl a dv 8:00–20:30; ds 8:00–15:00 (més curt a l'agost)"],
      ["El Ninot", "De dl a dj 8:00–20:00; dv i ds 8:00–17:00"],
    ],
    hNote: "De l'Institut Municipal de Mercats, comprovat el 28 d'octubre de 2026. L'horari és el de l'edifici; cada parada fixa el seu.",
    bookTitle: "Mercat dominical de Sant Antoni",
    book: "Al voltant del mercat de Sant Antoni, el mercat dominical de llibres, còmics i col·leccionisme es fa cada diumenge de 8:30 a 14:00, també els diumenges festius.",
    tipsTitle: "Consells",
    tips: [
      "**Mira el dia:** l'horari canvia segons el mercat i el dia de la setmana, com mostra la taula.",
      "**Els dilluns a la tarda** Santa Caterina i la Concepció tanquen d'hora, a les 14:30 i a les 15:00.",
      "**Compra alguna cosa:** són mercats d'alimentació i els paradistes viuen de les vendes, no de les visites.",
    ],
    faq: [
      { question: "La Boqueria obre els diumenges?", answer: "Normalment no. Obre de dilluns a dissabte de 8:00 a 20:30, i els diumenges només els dies que anuncia el mercat, normalment uns quants per Nadal." },
      { question: "Quin és l'horari de la Boqueria els festius?", answer: "Només obre els festius que anuncia el mercat. El Nadal de 2025-26 van ser el 6, el 21 i el 28 de desembre i el 4 de gener; les dates del 2026-27 encara no s'han publicat." },
      { question: "Poden visitar la Boqueria els grups turístics?", answer: "No els grups organitzats de 15 persones o més, els divendres i dissabtes d'abril a octubre." },
      { question: "Quins mercats de Barcelona obren el diumenge?", answer: "Cap dels grans mercats d'alimentació de la taula: tots obren de dilluns a dissabte. El diumenge, al voltant de Sant Antoni, es fa el mercat de llibres, còmics i col·leccionisme, de 8:30 a 14:00." },
      { question: "A quina hora tanca la Boqueria?", answer: "A les 20:30, de dilluns a dissabte; cada parada fixa el seu horari dins d'aquest." },
    ],
    note: "Els horaris dels mercats canvien per festes i obres: consulta les pàgines de mercats de l'Ajuntament.",
  },
};

function marketsBody(locale: Locale) {
  const t = MARKETS_COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.hTitle),
    table(t.hCaption, t.hHeaders, t.hRows, t.hNote),
    ...h2(t.boqTitle, ...t.boq),
    ...h2(t.rulesTitle, ...t.rules),
    ...h2(t.bookTitle, t.book),
    ...h2(t.tipsTitle),
    list(...t.tips),
    faq(t.faq),
    ...b2Related(["museums", "monuments", "hours"], locale),
  ];
}

export const MARKETS: B2Article = {
  key: "markets",
  entryKey: "guide-boqueria-barcelona-markets",
  categoryKey: "food",
  sources: MARKETS_SOURCES,
  heroKey: "mercats-santa-caterina-coberta",
  heroAlt: {
    ca: "La coberta ondulada de colors del mercat de Santa Caterina",
    es: "La cubierta ondulada de colores del mercado de Santa Caterina",
    en: "The colourful wave-shaped roof of Santa Caterina market",
  },
  heroCaption: {
    ca: "La coberta del mercat de Santa Caterina.",
    es: "La cubierta del mercado de Santa Caterina.",
    en: "The roof of Santa Caterina market.",
  },
  secondaryKey: "mercats-boqueria-rotol",
  secondaryAlt: {
    ca: "El rètol modernista de l'entrada del Mercat de Sant Josep, la Boqueria",
    es: "El rótulo modernista de la entrada del Mercat de Sant Josep, la Boqueria",
    en: "The Modernista sign over the entrance to the Mercat de Sant Josep, La Boqueria",
  },
  secondaryCaption: {
    ca: "L'entrada de la Boqueria, a la Rambla.",
    es: "La entrada de la Boqueria, en La Rambla.",
    en: "The entrance to La Boqueria on La Rambla.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T01:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...MARKETS_META[locale], blocks: marketsBody(locale) }]),
  ) as B2Article["editions"],
};

export { ZOO_META, MARKETS_META };
