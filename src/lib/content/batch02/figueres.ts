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
 * Museum facts from salvador-dali.org; trains from the official R11
 * timetable (4 Jul 2026) and Renfe's planner; Figueres-Vilafant access and
 * the tourist office from visitfigueres.cat (Ajuntament), all checked on
 * 12 Oct 2026 (research_notes/blog-batch-03/figueres.md).
 *
 * Left out: the museum's ticket-desk and summer prices (the site gives only
 * "from" prices), train fares (Renfe shows date-dependent "from" prices), the
 * shuttle timetable from Figueres-Vilafant (only a 2024 PDF exists), and
 * walking times (no official figure).
 */

const VERIFIED = "2026-10-12";

const SOURCES: B2Source[] = [
  { name: "Dalí Theatre-Museum — visit", url: "https://www.salvador-dali.org/en/visit/dali-theatre-museum/", publisher: "Fundació Gala-Salvador Dalí" },
  { name: "Dalí Museums — FAQs", url: "https://www.salvador-dali.org/en/visit/faqs/", publisher: "Fundació Gala-Salvador Dalí" },
  { name: "R11 line (Rodalies regional services)", url: "https://rodalies.gencat.cat/en/sobre-rodalies/linies-i-estacions/servei_regionals/r11/index.html", publisher: "Rodalies de Catalunya" },
  { name: "How to get to Figueres", url: "https://visitfigueres.cat/en/useful-information/how-to-get-here/", publisher: "Ajuntament de Figueres" },
  { name: "Tourist information office", url: "https://visitfigueres.cat/en/useful-information/tourist-information-office/", publisher: "Ajuntament de Figueres" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "escapades/figueres-museu-dali-des-de-barcelona",
    title: "Figueres i el Teatre-Museu Dalí des de Barcelona: tren, entrades i horaris",
    seoTitle: "Museu Dalí de Figueres des de Barcelona: tren i entrades",
    seoDescription:
      "Com anar al Teatre-Museu Dalí des de Barcelona: R11 fins a Figueres o alta velocitat fins a Vilafant. Entrades des de 18,50 €, tancat els dilluns a l'hivern.",
    excerpt: "Com arribar al Teatre-Museu Dalí de Figueres des de Barcelona en tren, quant costa l'entrada, quan obre i qui hi entra gratis.",
  },
  es: {
    path: "escapadas/figueres-museo-dali-desde-barcelona",
    title: "Figueres y el Teatro-Museo Dalí desde Barcelona: tren, entradas y horarios",
    seoTitle: "Museo Dalí de Figueres desde Barcelona: tren y entradas",
    seoDescription:
      "Cómo ir al Teatro-Museo Dalí desde Barcelona: R11 hasta Figueres o alta velocidad hasta Vilafant. Entradas desde 18,50 €, cerrado los lunes en invierno.",
    excerpt: "Cómo llegar al Teatro-Museo Dalí de Figueres desde Barcelona en tren, cuánto cuesta la entrada, cuándo abre y quién entra gratis.",
  },
  en: {
    path: "day-trips/figueres-dali-museum-from-barcelona",
    title: "Figueres and the Dalí Theatre-Museum from Barcelona: train, tickets and hours",
    seoTitle: "Dalí Museum Figueres from Barcelona: train and tickets",
    seoDescription:
      "How to reach the Dalí Theatre-Museum from Barcelona: the R11 to Figueres or high-speed to Figueres-Vilafant. Tickets from €18.50, closed on Mondays in winter.",
    excerpt: "How to get to the Dalí Theatre-Museum in Figueres from Barcelona by train, what a ticket costs, when it opens and who goes free.",
  },
};

type T = {
  lead: string;
  tableCaption: string; headers: string[]; rows: string[][]; tableNote: string;
  trainTitle: string; train: string[];
  museumTitle: string; museum: string[];
  hoursTitle: string; hours: string[];
  moreTitle: string; more: string[];
  planTitle: string; plan: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "The Dalí Theatre-Museum in Figueres, which Salvador Dalí designed himself in his home town, is one of the classic day trips north of Barcelona. There are two ways by train: the **R11 regional** to Figueres station in the town centre, or **high-speed** to Figueres-Vilafant, outside it.",
    tableCaption: "Barcelona to Figueres by train",
    headers: ["Train", "Arrives at", "Journey from Barcelona", "Trains a day"],
    rows: [
      ["R11 regional (from Sants and Passeig de Gràcia)", "Figueres, in town", "1 h 51 – 2 h 19", "21 on weekdays, 17 at weekends"],
      ["Avant / AVE high-speed", "Figueres-Vilafant, about 1.5 km out", "53 min – 1 h 05", "About 10–15"],
    ],
    tableNote: "R11 from the official timetable of 4 July 2026; high-speed from Renfe's journey planner for mid-October 2026. Fares vary by train and date on renfe.com.",
    trainTitle: "Which train",
    train: [
      "The **R11** is slower but lands you in town: the first leaves Sants at 5:56 on weekdays (6:46 at weekends) and the last at 20:46; trains from Passeig de Gràcia leave five minutes after Sants.",
      "**High-speed** trains halve the journey but stop at Figueres-Vilafant, about a kilometre and a half from the centre; a shuttle bus meets the trains, and there are taxis.",
    ],
    museumTitle: "Tickets",
    museum: [
      "General admission starts **from €18.50** and reduced from €15.00 (students over 18, ages 9 to 17, Carnet Jove holders, over-65s, visitors with a disability of 33% and a companion, large and single-parent families). Children up to 8 go free. A guided tour costs €26.50 (€23 reduced).",
      "Booking online is advisable but not compulsory. There is **no free first Sunday**: by Dalí's own wish, the museum is free for everyone on **6 January**.",
    ],
    hoursTitle: "Opening hours",
    hours: [
      "From October to late March the museum opens **Tuesday to Sunday, 10:30 to 18:00**: it is **closed on Mondays**, except on a few holiday Mondays it announces. Last entry is 45 minutes before closing. It closes at 15:00 on 24 December and is closed on 25 December and 1 January.",
    ],
    moreTitle: "Also run by the Dalí Foundation",
    more: [
      "**Portlligat house (Cadaqués):** the house where Dalí lived, visited only in small groups with a booked date and time; €15.50 online for house and olive grove. It closes for winter in January and February.",
      "**Púbol castle:** Gala's castle, closed from 7 January to late February. It has no public transport; the nearest train station is Flaçà, about 5 km away, then a taxi.",
    ],
    planTitle: "A day in Figueres",
    plan: [
      "**Morning:** an early R11 or high-speed train; aim to be at the museum by late morning.",
      "**Midday:** the Theatre-Museum, then lunch in town.",
      "**Afternoon:** the Rambla and the tourist office on Plaça de l'Escorxador, a few metres from the museum, then the train back.",
    ],
    faq: [
      { question: "How do I get from Barcelona to the Dalí Museum?", answer: "By the R11 regional train from Sants or Passeig de Gràcia to Figueres station (about 2 hours), or by high-speed train to Figueres-Vilafant (about an hour) and a shuttle bus into town." },
      { question: "How much is a ticket to the Dalí Theatre-Museum?", answer: `General admission from €18.50 and reduced from €15.00 on the official site, checked on ${VERIFIED}; children up to 8 free.` },
      { question: "Is the Dalí Museum open on Mondays?", answer: "Not from October to late March, except on a few holiday Mondays the museum announces." },
      { question: "Is the Dalí Museum ever free?", answer: "Yes, for everyone on 6 January, by Dalí's wish. There is no free first Sunday." },
    ],
    note: "Museum hours and train timetables change: check the Dalí Foundation and Renfe before you travel.",
  },
  es: {
    lead: "El Teatro-Museo Dalí de Figueres, que Salvador Dalí diseñó él mismo en su ciudad natal, es una de las excursiones clásicas al norte de Barcelona. Hay dos maneras de ir en tren: el **regional R11** hasta la estación de Figueres, en el centro, o la **alta velocidad** hasta Figueres-Vilafant, fuera de la ciudad.",
    tableCaption: "De Barcelona a Figueres en tren",
    headers: ["Tren", "Llega a", "Duración desde Barcelona", "Trenes al día"],
    rows: [
      ["Regional R11 (desde Sants y Passeig de Gràcia)", "Figueres, en el centro", "1 h 51 – 2 h 19", "21 laborables, 17 fines de semana"],
      ["Avant / AVE alta velocidad", "Figueres-Vilafant, a 1,5 km", "53 min – 1 h 05", "Unos 10–15"],
    ],
    tableNote: "R11 según el horario oficial del 4 de julio de 2026; alta velocidad según el buscador de Renfe para mediados de octubre de 2026. Los precios varían según tren y fecha en renfe.com.",
    trainTitle: "Qué tren",
    train: [
      "El **R11** es más lento pero te deja en el centro: el primero sale de Sants a las 5:56 los laborables (6:46 los fines de semana) y el último a las 20:46; los trenes desde Passeig de Gràcia salen cinco minutos después que desde Sants.",
      "La **alta velocidad** reduce el viaje a la mitad pero para en Figueres-Vilafant, a un kilómetro y medio del centro; un autobús lanzadera espera los trenes y hay taxis.",
    ],
    museumTitle: "Entradas",
    museum: [
      "La entrada general cuesta **desde 18,50 €** y la reducida desde 15,00 € (estudiantes mayores de 18, de 9 a 17 años, Carnet Jove, mayores de 65, personas con discapacidad del 33 % y acompañante, familias numerosas y monoparentales). Los niños hasta 8 años entran gratis. La visita guiada cuesta 26,50 € (23 € reducida).",
      "Comprar en línea es aconsejable pero no obligatorio. **No hay primer domingo gratuito**: por deseo del propio Dalí, el museo es gratis para todo el mundo el **6 de enero**.",
    ],
    hoursTitle: "Horario",
    hours: [
      "De octubre a finales de marzo el museo abre **de martes a domingo, de 10:30 a 18:00**: **cierra los lunes**, salvo algunos lunes festivos que anuncia. La última entrada es 45 minutos antes del cierre. El 24 de diciembre cierra a las 15:00 y el 25 de diciembre y el 1 de enero está cerrado.",
    ],
    moreTitle: "También de la Fundació Dalí",
    more: [
      "**Casa de Portlligat (Cadaqués):** la casa donde vivió Dalí, que solo se visita en grupos pequeños con fecha y hora reservadas; 15,50 € en línea casa y olivar. Cierra en invierno, en enero y febrero.",
      "**Castillo de Púbol:** el castillo de Gala, cerrado del 7 de enero a finales de febrero. No tiene transporte público; la estación más cercana es Flaçà, a unos 5 km, y después taxi.",
    ],
    planTitle: "Un día en Figueres",
    plan: [
      "**Mañana:** un R11 temprano o un tren de alta velocidad; intenta estar en el museo a media mañana.",
      "**Mediodía:** el Teatro-Museo y comida en la ciudad.",
      "**Tarde:** la Rambla y la oficina de turismo de la plaza de l'Escorxador, a pocos metros del museo, y tren de vuelta.",
    ],
    faq: [
      { question: "¿Cómo ir de Barcelona al Museo Dalí?", answer: "En el regional R11 desde Sants o Passeig de Gràcia hasta la estación de Figueres (unas 2 horas), o en alta velocidad hasta Figueres-Vilafant (alrededor de una hora) y lanzadera al centro." },
      { question: "¿Cuánto cuesta la entrada al Teatro-Museo Dalí?", answer: `Entrada general desde 18,50 € y reducida desde 15,00 € en la web oficial, comprobado el ${VERIFIED}; los niños hasta 8 años, gratis.` },
      { question: "¿Abre el Museo Dalí los lunes?", answer: "No de octubre a finales de marzo, salvo algunos lunes festivos que anuncia el museo." },
      { question: "¿El Museo Dalí es gratis algún día?", answer: "Sí, para todo el mundo el 6 de enero, por deseo de Dalí. No hay primer domingo gratuito." },
    ],
    note: "Los horarios del museo y de los trenes cambian: compruébalo en la Fundació Dalí y en Renfe antes de viajar.",
  },
  ca: {
    lead: "El Teatre-Museu Dalí de Figueres, que Salvador Dalí va dissenyar ell mateix a la seva ciutat natal, és una de les excursions clàssiques al nord de Barcelona. Hi ha dues maneres d'anar-hi en tren: el **regional R11** fins a l'estació de Figueres, al centre, o l'**alta velocitat** fins a Figueres-Vilafant, fora de la ciutat.",
    tableCaption: "De Barcelona a Figueres en tren",
    headers: ["Tren", "Arriba a", "Durada des de Barcelona", "Trens al dia"],
    rows: [
      ["Regional R11 (des de Sants i Passeig de Gràcia)", "Figueres, al centre", "1 h 51 – 2 h 19", "21 feiners, 17 caps de setmana"],
      ["Avant / AVE alta velocitat", "Figueres-Vilafant, a 1,5 km", "53 min – 1 h 05", "Uns 10–15"],
    ],
    tableNote: "R11 segons l'horari oficial del 4 de juliol de 2026; alta velocitat segons el cercador de Renfe per a mitjan octubre de 2026. Els preus varien segons tren i data a renfe.com.",
    trainTitle: "Quin tren",
    train: [
      "L'**R11** és més lent però et deixa al centre: el primer surt de Sants a les 5:56 els feiners (6:46 els caps de setmana) i l'últim a les 20:46; els trens des de Passeig de Gràcia surten cinc minuts després que des de Sants.",
      "L'**alta velocitat** redueix el viatge a la meitat però para a Figueres-Vilafant, a un quilòmetre i mig del centre; un autobús llançadora espera els trens i hi ha taxis.",
    ],
    museumTitle: "Entrades",
    museum: [
      "L'entrada general costa **des de 18,50 €** i la reduïda des de 15,00 € (estudiants majors de 18, de 9 a 17 anys, Carnet Jove, majors de 65, persones amb discapacitat del 33 % i acompanyant, famílies nombroses i monoparentals). Els infants fins a 8 anys hi entren gratis. La visita guiada costa 26,50 € (23 € reduïda).",
      "Comprar en línia és aconsellable però no obligatori. **No hi ha primer diumenge gratuït**: per voluntat del mateix Dalí, el museu és gratis per a tothom el **6 de gener**.",
    ],
    hoursTitle: "Horari",
    hours: [
      "D'octubre a finals de març el museu obre **de dimarts a diumenge, de 10:30 a 18:00**: **tanca els dilluns**, llevat d'alguns dilluns festius que anuncia. L'última entrada és 45 minuts abans del tancament. El 24 de desembre tanca a les 15:00 i el 25 de desembre i l'1 de gener és tancat.",
    ],
    moreTitle: "També de la Fundació Dalí",
    more: [
      "**Casa de Portlligat (Cadaqués):** la casa on va viure Dalí, que només es visita en grups petits amb data i hora reservades; 15,50 € en línia casa i oliverar. Tanca a l'hivern, al gener i el febrer.",
      "**Castell de Púbol:** el castell de Gala, tancat del 7 de gener a finals de febrer. No té transport públic; l'estació més propera és Flaçà, a uns 5 km, i després taxi.",
    ],
    planTitle: "Un dia a Figueres",
    plan: [
      "**Matí:** un R11 d'hora o un tren d'alta velocitat; intenta ser al museu a mig matí.",
      "**Migdia:** el Teatre-Museu i dinar a la ciutat.",
      "**Tarda:** la Rambla i l'oficina de turisme de la plaça de l'Escorxador, a pocs metres del museu, i tren de tornada.",
    ],
    faq: [
      { question: "Com anar de Barcelona al Museu Dalí?", answer: "Amb el regional R11 des de Sants o Passeig de Gràcia fins a l'estació de Figueres (unes 2 hores), o amb alta velocitat fins a Figueres-Vilafant (al voltant d'una hora) i llançadora al centre." },
      { question: "Quant costa l'entrada al Teatre-Museu Dalí?", answer: `Entrada general des de 18,50 € i reduïda des de 15,00 € al web oficial, comprovat el ${VERIFIED}; els infants fins a 8 anys, gratis.` },
      { question: "Obre el Museu Dalí els dilluns?", answer: "No d'octubre a finals de març, llevat d'alguns dilluns festius que anuncia el museu." },
      { question: "El Museu Dalí és gratis algun dia?", answer: "Sí, per a tothom el 6 de gener, per voluntat de Dalí. No hi ha primer diumenge gratuït." },
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
