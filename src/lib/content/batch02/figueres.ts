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
 * Figueres and the Dalí Theatre-Museum from Barcelona.
 *
 * Re-checked on 24 Oct 2026 for the page-1 push (queries "como ir al museo
 * dali desde barcelona", "figueres museum tickets", "barcelona to dali museum
 * train"):
 *
 * - Museum hours, prices, free categories and the exceptional Monday
 *   openings from salvador-dali.org (visit page and FAQ). The exceptional
 *   list (30 Mar, 6 Apr, 25 May, 12 Oct, 9 Nov, 7 Dec) falls on Mondays only
 *   in 2026, so it is the 2026 list: 9 Nov and 7 Dec are the ones left.
 * - R11: official Rodalies journey planner (API behind rodalies.gencat.cat/
 *   horaris) for 27 and 31 Oct and 1 Nov 2026, with its fares (12,80 EUR on
 *   regional trains, 17,10 EUR on MD trains).
 * - High-speed to Figueres-Vilafant: Renfe's open-data GTFS for long distance
 *   and high speed (ssl.renfe.com/gtransit/Fichero_AV_LD), same dates.
 * - Figueres-Vilafant 1.5 km from the centre with a shuttle bus and taxis,
 *   and the tourist office, from visitfigueres.cat (Ajuntament).
 * - Portlligat and Púbol winter closures from their salvador-dali.org pages.
 *
 * Left out: high-speed fares (Renfe prices them by train and date) and
 * walking times (no official figure). The old line about Púbol being 5 km
 * from Flaçà station was dropped: no official page read today states it.
 */

const VERIFIED = "2026-10-24";

const SOURCES: B2Source[] = [
  { name: "Dalí Theatre-Museum — visit", url: "https://www.salvador-dali.org/en/visit/dali-theatre-museum/", publisher: "Fundació Gala-Salvador Dalí" },
  { name: "Dalí Museums — FAQs", url: "https://www.salvador-dali.org/en/visit/faqs/", publisher: "Fundació Gala-Salvador Dalí" },
  { name: "Salvador Dalí House-Museum, Portlligat", url: "https://www.salvador-dali.org/en/visit/salvador-dali-house-museum/", publisher: "Fundació Gala-Salvador Dalí" },
  { name: "Gala Dalí Castle, Púbol", url: "https://www.salvador-dali.org/en/visit/gala-dali-castle/", publisher: "Fundació Gala-Salvador Dalí" },
  { name: "Cercador d'horaris de Rodalies", url: "https://rodalies.gencat.cat/ca/horaris/", publisher: "Rodalies de Catalunya" },
  { name: "R11 line (Rodalies regional services)", url: "https://rodalies.gencat.cat/en/sobre-rodalies/linies-i-estacions/servei_regionals/r11/index.html", publisher: "Rodalies de Catalunya" },
  { name: "Horarios Renfe (datos abiertos, alta velocidad y larga distancia)", url: "https://data.renfe.com/dataset/horarios-de-alta-velocidad-larga-distancia-y-media-distancia", publisher: "Renfe" },
  { name: "How to get to Figueres", url: "https://visitfigueres.cat/en/useful-information/how-to-get-here/", publisher: "Ajuntament de Figueres" },
  { name: "Tourist information office", url: "https://visitfigueres.cat/en/useful-information/tourist-information-office/", publisher: "Ajuntament de Figueres" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "escapades/figueres-museu-dali-des-de-barcelona",
    title: "Com anar al Museu Dalí de Figueres des de Barcelona: tren, entrades i horari",
    seoTitle: "Com anar al Museu Dalí des de Barcelona: tren i entrades",
    seoDescription:
      "El Teatre-Museu Dalí és a Figueres: 2 h amb l'R11 (12,80 €) o menys d'1 h amb alta velocitat. Entrades des de 18,50 €; obre de dimarts a diumenge.",
    excerpt: "Com arribar al Teatre-Museu Dalí de Figueres des de Barcelona en tren, quant costa l'entrada, quan obre i qui hi entra gratis.",
  },
  es: {
    path: "escapadas/figueres-museo-dali-desde-barcelona",
    title: "Cómo ir al Museo Dalí de Figueres desde Barcelona: tren, entradas y horario",
    seoTitle: "Cómo ir al Museo Dalí desde Barcelona: tren y entradas",
    seoDescription:
      "El Teatro-Museo Dalí está en Figueres: 2 h en el R11 (12,80 €) o menos de 1 h en alta velocidad. Entradas desde 18,50 €; abre de martes a domingo.",
    excerpt: "Cómo llegar al Teatro-Museo Dalí de Figueres desde Barcelona en tren, cuánto cuesta la entrada, cuándo abre y quién entra gratis.",
  },
  en: {
    path: "day-trips/figueres-dali-museum-from-barcelona",
    title: "Barcelona to the Dalí Museum in Figueres: train, tickets and opening hours",
    seoTitle: "Barcelona to Dalí Museum by train: tickets and hours",
    seoDescription:
      "The Dalí Theatre-Museum is in Figueres: 2 h on the R11 (€12.80) or under an hour by high-speed train. Tickets from €18.50; open Tue-Sun 10:30-18:00.",
    excerpt: "How to get to the Dalí Theatre-Museum in Figueres from Barcelona by train, what a ticket costs, when it opens and who goes free.",
  },
};

type T = {
  lead: string;
  tableCaption: string; headers: string[]; rows: string[][]; tableNote: string;
  trainTitle: string; train: string[];
  museumTitle: string; museum: string[];
  hoursTitle: string; hours: string[];
  hoursCaption: string; hoursHeaders: string[]; hoursRows: string[][]; hoursNote: string;
  moreTitle: string; more: string[];
  planTitle: string; plan: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "The Dalí Theatre-Museum, which Salvador Dalí designed himself, is not in Barcelona but in his home town, **Figueres**. From Barcelona you can take the **R11 regional train** to Figueres station in the town centre (about **2 hours**, **€12.80** single) or a **high-speed train** to Figueres-Vilafant, 1.5 km out, in **under an hour**. Tickets start **from €18.50**, and from November to March the museum opens **Tuesday to Sunday, 10:30 to 18:00**.",
    tableCaption: "Barcelona to Figueres by train",
    headers: ["Train", "Arrives at", "Journey from Sants", "Trains a day", "Single fare"],
    rows: [
      ["R11 regional (from Sants and Passeig de Gràcia)", "Figueres, in the town centre", "1 h 50 – 2 h 18", "21 on weekdays, 14 on Saturdays", "€12.80 (€17.10 on MD trains)"],
      ["Renfe high-speed (Avant, AVE)", "Figueres-Vilafant, 1.5 km from the centre", "42 min – 1 h 05", "17 on weekdays, 11 on Saturdays", "Varies by train and date"],
    ],
    tableNote: "R11 and fares from the official Rodalies planner; high-speed from Renfe's open timetable data; both for 27 and 31 October 2026.",
    trainTitle: "Which train to the Dalí Museum",
    train: [
      "The **R11** is slower but lands you in town. On weekdays the first leaves Sants at 5:56 and the last at 20:46 (6:46 to 20:16 on Saturdays); trains from Passeig de Gràcia leave a few minutes after Sants. The last R11 back leaves Figueres at 20:46 on weekdays.",
      "**High-speed** trains halve the journey but stop at Figueres-Vilafant, a kilometre and a half from the centre; a shuttle bus meets the trains and there are taxis. Useful morning trains leave Sants at 8:05, 8:14 and 9:32; the last one back leaves Figueres-Vilafant at 19:35 on weekdays and 19:08 on Saturdays.",
    ],
    museumTitle: "Dalí Museum tickets and prices",
    museum: [
      "General admission starts **from €18.50** and reduced from €15.00 (students over 18, ages 9 to 17, Carnet Jove holders, over-65s, visitors with a 33% disability and one companion, large and single-parent families). Children up to 8 go free. A guided tour costs €26.50 (€23 reduced).",
      "Booking online is advisable but not compulsory; keep the reservation code to show at the entrance. There is **no free first Sunday**: the museum is free for everyone on **6 January**.",
    ],
    hoursTitle: "Dalí Museum opening hours",
    hours: [
      "Last entry is 45 minutes before closing, and the rooms close 15 minutes before closing time. The museum is **closed on Mondays** outside July and August, except on Monday 9 November and Monday 7 December 2026.",
    ],
    hoursCaption: "Dalí Theatre-Museum opening hours",
    hoursHeaders: ["Period", "Days", "Hours"],
    hoursRows: [
      ["1 October – 31 December", "Tuesday to Sunday", "10:30–18:00 (24 Dec until 15:00; closed 25 Dec)"],
      ["1 January – 22 March", "Tuesday to Sunday", "10:30–18:00 (closed 1 Jan; free 6 Jan)"],
      ["23 March – 31 May", "Tuesday to Sunday", "9:30–18:00"],
      ["1 July – 31 August", "Every day", "9:00–20:00"],
    ],
    hoursNote: "From the Dalí Foundation's official visit page, read on 24 October 2026.",
    moreTitle: "Also run by the Dalí Foundation",
    more: [
      "**Portlligat house (Cadaqués):** the house where Dalí lived, visited only in small groups with a booked date and time; €15.50 online for house and olive grove outside July and August. Closed from 7 January to 11 February.",
      "**Púbol castle:** Gala's castle, €10 online. Closed from 7 January to 27 February; from November it closes at 17:00.",
    ],
    planTitle: "A day in Figueres",
    plan: [
      "**Morning:** an early R11 or a high-speed train; aim to be at the museum by late morning.",
      "**Midday:** the Theatre-Museum, then lunch in town.",
      "**Afternoon:** the Rambla and the tourist office on Plaça de l'Escorxador, a few metres from the museum (Monday to Saturday 9:30–18:00, Sunday 10:00–15:00 in autumn and winter), then the train back.",
    ],
    faq: [
      { question: "How do I get from Barcelona to the Dalí Museum?", answer: "By the R11 regional train from Sants or Passeig de Gràcia to Figueres station (about 2 hours, €12.80), or by high-speed train to Figueres-Vilafant (42 minutes to 1 h 05) and the shuttle bus into town." },
      { question: "Is the Dalí Museum in Barcelona?", answer: "No. The Dalí Theatre-Museum is in Figueres, Dalí's home town, north of Barcelona near the French border." },
      { question: "How much is a ticket to the Dalí Theatre-Museum?", answer: "General admission from €18.50 and reduced from €15.00 on the official site; children up to 8 free; guided tour €26.50." },
      { question: "Is the Dalí Museum open on Mondays?", answer: "Not from September to June, except a few holiday Mondays (9 November and 7 December 2026). In July and August it opens every day." },
      { question: "Is the Dalí Museum ever free?", answer: "Yes, for everyone on 6 January. There is no free first Sunday." },
    ],
    note: "Museum hours and train timetables change: check the Dalí Foundation and Renfe before you travel.",
  },
  es: {
    lead: "El Teatro-Museo Dalí, que diseñó el propio Salvador Dalí, no está en Barcelona sino en su ciudad natal, **Figueres**. Desde Barcelona puedes ir en el **regional R11** hasta la estación de Figueres, en el centro (unas **2 horas**, **12,80 €** el sencillo), o en **alta velocidad** hasta Figueres-Vilafant, a 1,5 km, en **menos de una hora**. Las entradas van **desde 18,50 €** y de noviembre a marzo el museo abre **de martes a domingo, de 10:30 a 18:00**.",
    tableCaption: "De Barcelona a Figueres en tren",
    headers: ["Tren", "Llega a", "Duración desde Sants", "Trenes al día", "Sencillo"],
    rows: [
      ["Regional R11 (desde Sants y Passeig de Gràcia)", "Figueres, en el centro", "1 h 50 – 2 h 18", "21 laborables, 14 los sábados", "12,80 € (17,10 € en los MD)"],
      ["Alta velocidad de Renfe (Avant, AVE)", "Figueres-Vilafant, a 1,5 km del centro", "42 min – 1 h 05", "17 laborables, 11 los sábados", "Según tren y fecha"],
    ],
    tableNote: "R11 y precios según el planificador oficial de Rodalies; alta velocidad según los datos abiertos de horarios de Renfe; ambos para el 27 y el 31 de octubre de 2026.",
    trainTitle: "Qué tren coger al Museo Dalí",
    train: [
      "El **R11** es más lento pero te deja en el centro. Los laborables el primero sale de Sants a las 5:56 y el último a las 20:46 (de 6:46 a 20:16 los sábados); desde Passeig de Gràcia salen unos minutos después que desde Sants. El último R11 de vuelta sale de Figueres a las 20:46 los laborables.",
      "La **alta velocidad** reduce el viaje a la mitad pero para en Figueres-Vilafant, a un kilómetro y medio del centro; un autobús lanzadera espera los trenes y hay taxis. Por la mañana salen de Sants a las 8:05, 8:14 y 9:32; el último de vuelta sale de Figueres-Vilafant a las 19:35 los laborables y a las 19:08 los sábados.",
    ],
    museumTitle: "Entradas y precio del Museo Dalí",
    museum: [
      "La entrada general cuesta **desde 18,50 €** y la reducida desde 15,00 € (estudiantes mayores de 18, de 9 a 17 años, Carnet Jove, mayores de 65, personas con discapacidad del 33 % y acompañante, familias numerosas y monoparentales). Los niños hasta 8 años entran gratis. La visita guiada cuesta 26,50 € (23 € reducida).",
      "Comprar en línea es aconsejable pero no obligatorio; guarda el código de reserva para enseñarlo en la entrada. **No hay primer domingo gratuito**: el museo es gratis para todo el mundo el **6 de enero**.",
    ],
    hoursTitle: "Horario del Museo Dalí",
    hours: [
      "La última entrada es 45 minutos antes del cierre, y las salas cierran 15 minutos antes de la hora de cierre. El museo **cierra los lunes** fuera de julio y agosto, salvo el lunes 9 de noviembre y el lunes 7 de diciembre de 2026.",
    ],
    hoursCaption: "Horario del Teatro-Museo Dalí",
    hoursHeaders: ["Periodo", "Días", "Horario"],
    hoursRows: [
      ["1 de octubre – 31 de diciembre", "Martes a domingo", "10:30–18:00 (24 dic hasta las 15:00; cerrado el 25 dic)"],
      ["1 de enero – 22 de marzo", "Martes a domingo", "10:30–18:00 (cerrado el 1 ene; gratis el 6 ene)"],
      ["23 de marzo – 31 de mayo", "Martes a domingo", "9:30–18:00"],
      ["1 de julio – 31 de agosto", "Todos los días", "9:00–20:00"],
    ],
    hoursNote: "Según la página oficial de visita de la Fundació Dalí, consultada el 24 de octubre de 2026.",
    moreTitle: "También de la Fundació Dalí",
    more: [
      "**Casa de Portlligat (Cadaqués):** la casa donde vivió Dalí, que solo se visita en grupos pequeños con fecha y hora reservadas; 15,50 € en línea casa y olivar fuera de julio y agosto. Cerrada del 7 de enero al 11 de febrero.",
      "**Castillo de Púbol:** el castillo de Gala, 10 € en línea. Cerrado del 7 de enero al 27 de febrero; desde noviembre cierra a las 17:00.",
    ],
    planTitle: "Un día en Figueres",
    plan: [
      "**Mañana:** un R11 temprano o un tren de alta velocidad; intenta estar en el museo a media mañana.",
      "**Mediodía:** el Teatro-Museo y comida en la ciudad.",
      "**Tarde:** la Rambla y la oficina de turismo de la plaza de l'Escorxador, a pocos metros del museo (de lunes a sábado de 9:30 a 18:00 y domingos de 10:00 a 15:00 en otoño e invierno), y tren de vuelta.",
    ],
    faq: [
      { question: "¿Cómo ir de Barcelona al Museo Dalí?", answer: "En el regional R11 desde Sants o Passeig de Gràcia hasta la estación de Figueres (unas 2 horas, 12,80 €), o en alta velocidad hasta Figueres-Vilafant (de 42 minutos a 1 h 05) y lanzadera al centro." },
      { question: "¿El Museo Dalí está en Barcelona?", answer: "No. El Teatro-Museo Dalí está en Figueres, la ciudad natal de Dalí, al norte de Barcelona, cerca de la frontera francesa." },
      { question: "¿Cuánto cuesta la entrada al Teatro-Museo Dalí?", answer: "Entrada general desde 18,50 € y reducida desde 15,00 € en la web oficial; niños hasta 8 años, gratis; visita guiada, 26,50 €." },
      { question: "¿Abre el Museo Dalí los lunes?", answer: "No de septiembre a junio, salvo algunos lunes festivos (el 9 de noviembre y el 7 de diciembre de 2026). En julio y agosto abre todos los días." },
      { question: "¿El Museo Dalí es gratis algún día?", answer: "Sí, para todo el mundo el 6 de enero. No hay primer domingo gratuito." },
    ],
    note: "Los horarios del museo y de los trenes cambian: compruébalo en la Fundació Dalí y en Renfe antes de viajar.",
  },
  ca: {
    lead: "El Teatre-Museu Dalí, que va dissenyar el mateix Salvador Dalí, no és a Barcelona sinó a la seva ciutat natal, **Figueres**. Des de Barcelona hi pots anar amb el **regional R11** fins a l'estació de Figueres, al centre (unes **2 hores**, **12,80 €** el senzill), o amb **alta velocitat** fins a Figueres-Vilafant, a 1,5 km, en **menys d'una hora**. Les entrades van **des de 18,50 €** i de novembre a març el museu obre **de dimarts a diumenge, de 10:30 a 18:00**.",
    tableCaption: "De Barcelona a Figueres en tren",
    headers: ["Tren", "Arriba a", "Durada des de Sants", "Trens al dia", "Senzill"],
    rows: [
      ["Regional R11 (des de Sants i Passeig de Gràcia)", "Figueres, al centre", "1 h 50 – 2 h 18", "21 feiners, 14 els dissabtes", "12,80 € (17,10 € als MD)"],
      ["Alta velocitat de Renfe (Avant, AVE)", "Figueres-Vilafant, a 1,5 km del centre", "42 min – 1 h 05", "17 feiners, 11 els dissabtes", "Segons tren i data"],
    ],
    tableNote: "R11 i preus segons el cercador oficial de Rodalies; alta velocitat segons les dades obertes d'horaris de Renfe; tots dos per al 27 i el 31 d'octubre de 2026.",
    trainTitle: "Quin tren agafar al Museu Dalí",
    train: [
      "L'**R11** és més lent però et deixa al centre. Els feiners el primer surt de Sants a les 5:56 i l'últim a les 20:46 (de 6:46 a 20:16 els dissabtes); des de Passeig de Gràcia surten uns minuts després que des de Sants. L'últim R11 de tornada surt de Figueres a les 20:46 els feiners.",
      "L'**alta velocitat** redueix el viatge a la meitat però para a Figueres-Vilafant, a un quilòmetre i mig del centre; un autobús llançadora espera els trens i hi ha taxis. Al matí surten de Sants a les 8:05, 8:14 i 9:32; l'últim de tornada surt de Figueres-Vilafant a les 19:35 els feiners i a les 19:08 els dissabtes.",
    ],
    museumTitle: "Entrades i preu del Museu Dalí",
    museum: [
      "L'entrada general costa **des de 18,50 €** i la reduïda des de 15,00 € (estudiants majors de 18, de 9 a 17 anys, Carnet Jove, majors de 65, persones amb discapacitat del 33 % i acompanyant, famílies nombroses i monoparentals). Els infants fins a 8 anys hi entren gratis. La visita guiada costa 26,50 € (23 € reduïda).",
      "Comprar en línia és aconsellable però no obligatori; guarda el codi de reserva per ensenyar-lo a l'entrada. **No hi ha primer diumenge gratuït**: el museu és gratis per a tothom el **6 de gener**.",
    ],
    hoursTitle: "Horari del Museu Dalí",
    hours: [
      "L'última entrada és 45 minuts abans del tancament, i les sales tanquen 15 minuts abans de l'hora de tancament. El museu **tanca els dilluns** fora de juliol i agost, llevat del dilluns 9 de novembre i el dilluns 7 de desembre de 2026.",
    ],
    hoursCaption: "Horari del Teatre-Museu Dalí",
    hoursHeaders: ["Període", "Dies", "Horari"],
    hoursRows: [
      ["1 d'octubre – 31 de desembre", "Dimarts a diumenge", "10:30–18:00 (24 des fins a les 15:00; tancat el 25 des)"],
      ["1 de gener – 22 de març", "Dimarts a diumenge", "10:30–18:00 (tancat l'1 gen; gratis el 6 gen)"],
      ["23 de març – 31 de maig", "Dimarts a diumenge", "9:30–18:00"],
      ["1 de juliol – 31 d'agost", "Cada dia", "9:00–20:00"],
    ],
    hoursNote: "Segons la pàgina oficial de visita de la Fundació Dalí, consultada el 24 d'octubre de 2026.",
    moreTitle: "També de la Fundació Dalí",
    more: [
      "**Casa de Portlligat (Cadaqués):** la casa on va viure Dalí, que només es visita en grups petits amb data i hora reservades; 15,50 € en línia casa i oliverar fora de juliol i agost. Tancada del 7 de gener a l'11 de febrer.",
      "**Castell de Púbol:** el castell de Gala, 10 € en línia. Tancat del 7 de gener al 27 de febrer; des del novembre tanca a les 17:00.",
    ],
    planTitle: "Un dia a Figueres",
    plan: [
      "**Matí:** un R11 d'hora o un tren d'alta velocitat; intenta ser al museu a mig matí.",
      "**Migdia:** el Teatre-Museu i dinar a la ciutat.",
      "**Tarda:** la Rambla i l'oficina de turisme de la plaça de l'Escorxador, a pocs metres del museu (de dilluns a dissabte de 9:30 a 18:00 i diumenges de 10:00 a 15:00 a la tardor i l'hivern), i tren de tornada.",
    ],
    faq: [
      { question: "Com anar de Barcelona al Museu Dalí?", answer: "Amb el regional R11 des de Sants o Passeig de Gràcia fins a l'estació de Figueres (unes 2 hores, 12,80 €), o amb alta velocitat fins a Figueres-Vilafant (de 42 minuts a 1 h 05) i llançadora al centre." },
      { question: "El Museu Dalí és a Barcelona?", answer: "No. El Teatre-Museu Dalí és a Figueres, la ciutat natal de Dalí, al nord de Barcelona, a prop de la frontera francesa." },
      { question: "Quant costa l'entrada al Teatre-Museu Dalí?", answer: "Entrada general des de 18,50 € i reduïda des de 15,00 € al web oficial; infants fins a 8 anys, gratis; visita guiada, 26,50 €." },
      { question: "Obre el Museu Dalí els dilluns?", answer: "No de setembre a juny, llevat d'alguns dilluns festius (el 9 de novembre i el 7 de desembre de 2026). Al juliol i l'agost obre cada dia." },
      { question: "El Museu Dalí és gratis algun dia?", answer: "Sí, per a tothom el 6 de gener. No hi ha primer diumenge gratuït." },
    ],
    note: "Els horaris del museu i dels trens canvien: comprova-ho a la Fundació Dalí i a Renfe abans de viatjar.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    table(t.tableCaption, t.headers, t.rows, t.tableNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.trainTitle, ...t.train),
    ...h2(t.museumTitle, ...t.museum),
    ...h2(t.hoursTitle, ...t.hours),
    table(t.hoursCaption, t.hoursHeaders, t.hoursRows, t.hoursNote),
    ...h2(t.moreTitle),
    list(...t.more),
    ...h2(t.planTitle),
    list(...t.plan),
    faq(t.faq),
    ...b2Related(["girona", "sitges", "tarragona", "museums"], locale),
  ];
}

export const FIGUERES: B2Article = {
  key: "figueres",
  entryKey: "daytrip-figueres-dali-from-barcelona",
  categoryKey: "culture",
  sources: SOURCES,
  heroKey: "figueres-torre-galatea-cupula",
  heroAlt: {
    ca: "La Torre Galatea amb els ous gegants i la cúpula de vidre del Teatre-Museu Dalí",
    es: "La Torre Galatea con los huevos gigantes y la cúpula de cristal del Teatro-Museo Dalí",
    en: "Torre Galatea with its giant eggs and the glass dome of the Dalí Theatre-Museum",
  },
  heroCaption: {
    ca: "La Torre Galatea i la cúpula del museu, a Figueres.",
    es: "La Torre Galatea y la cúpula del museo, en Figueres.",
    en: "Torre Galatea and the museum's dome in Figueres.",
  },
  secondaryKey: "figueres-teatre-museu-dali-facana",
  secondaryAlt: {
    ca: "La façana del Teatre-Museu Dalí amb les escultures a la cornisa",
    es: "La fachada del Teatro-Museo Dalí con las esculturas en la cornisa",
    en: "The front of the Dalí Theatre-Museum with sculptures along the cornice",
  },
  secondaryCaption: {
    ca: "L'entrada del Teatre-Museu, sobre l'antic teatre municipal.",
    es: "La entrada del Teatro-Museo, sobre el antiguo teatro municipal.",
    en: "The museum entrance, built on the old municipal theatre.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T23:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as FIGUERES_META };
