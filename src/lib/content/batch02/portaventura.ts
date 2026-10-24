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
 * Re-checked on 24 Oct 2026 for the page-1 push (queries "portaventura
 * horaris", "apertura portaventura", "horarios tren port aventura").
 *
 * - Calendar: PortAventura World's own feed behind the "Opening times" page,
 *   https://www.portaventuraworld.com/api/club/calendar/influx/{park}/{MM}/{YYYY},
 *   read for Oct 2026 - May 2027. PortAventura Park: daily to 6 Jan 2027,
 *   closed 7 Jan - 19 Feb, weekends from 20 Feb, daily from 18 Mar (2027
 *   hours not yet in the feed). Ferrari Land closed 7 Jan - 18 Mar. Caribe
 *   closed until 21 May 2027.
 * - Seasons: Halloween 19 Sep - 15 Nov 2026 (site banner); Christmas 20 Nov
 *   2026 - 6 Jan 2027 (portaventuraworld.com/en/christmas).
 * - Tickets: product cards on /en/tickets/portaventura and /en/tickets/
 *   ferrari-land, and the "+10 EUR at the ticket office" line on each card.
 * - Train: official Rodalies journey planner (the API behind
 *   rodalies.gencat.cat/horaris) for 27 and 31 Oct, 1 and 15 Nov 2026; the
 *   planner has no data after late November yet. Combined train + ticket
 *   from rodalies.gencat.cat/ca/nou-bitllets-combinats/portaventura/.
 *
 * Only the R17 (three direct trains a day) and the RT2 shuttle from
 * Tarragona serve Salou-Port Aventura; R14, R15 and R16 do not stop there.
 * No walking time from the station is printed: no official page states one.
 */

const VERIFIED = "2026-10-24";

const SOURCES: B2Source[] = [
  { name: "PortAventura World — dates and times", url: "https://www.portaventuraworld.com/en/dates-times", publisher: "PortAventura World" },
  { name: "PortAventura World — Christmas", url: "https://www.portaventuraworld.com/en/christmas", publisher: "PortAventura World" },
  { name: "PortAventura Park tickets", url: "https://www.portaventuraworld.com/en/tickets/portaventura", publisher: "PortAventura World" },
  { name: "Ferrari Land tickets", url: "https://www.portaventuraworld.com/en/tickets/ferrari-land", publisher: "PortAventura World" },
  { name: "How to get to PortAventura", url: "https://www.portaventuraworld.com/en/destination/planning/how-to-get-to-portaventura", publisher: "PortAventura World" },
  { name: "Cercador d'horaris de Rodalies", url: "https://rodalies.gencat.cat/ca/horaris/", publisher: "Rodalies de Catalunya" },
  { name: "Horaris R17 i RT2", url: "https://rodalies.gencat.cat/web/.content/02_Horaris/horaris/R17RT2.pdf", publisher: "Rodalies de Catalunya" },
  { name: "Bitllet combinat Rodalies + PortAventura", url: "https://rodalies.gencat.cat/ca/nou-bitllets-combinats/portaventura/", publisher: "Rodalies de Catalunya" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "escapades/portaventura-des-de-barcelona",
    title: "PortAventura des de Barcelona: horaris, calendari d'obertura, entrades i tren",
    seoTitle: "PortAventura des de Barcelona: horaris, obertura i tren",
    seoDescription:
      "PortAventura Park obre cada dia fins al 6 de gener (de 10:30 a 18:00 o més) i torna el 20 de febrer de 2027. Entrades des de 37 €. Trens R17 des de Sants.",
    excerpt: "Horaris i calendari de PortAventura Park, Ferrari Land i Caribe aquesta tardor i hivern, quant costen les entrades i quins trens hi arriben des de Barcelona.",
  },
  es: {
    path: "escapadas/portaventura-desde-barcelona",
    title: "PortAventura desde Barcelona: horarios, calendario de apertura, entradas y tren",
    seoTitle: "PortAventura desde Barcelona: horarios, apertura y tren",
    seoDescription:
      "PortAventura Park abre cada día hasta el 6 de enero (de 10:30 a 18:00 o más) y reabre el 20 de febrero de 2027. Entradas desde 37 €. Tren R17 desde Sants.",
    excerpt: "Horarios y calendario de PortAventura Park, Ferrari Land y Caribe este otoño e invierno, cuánto cuestan las entradas y qué trenes llegan desde Barcelona.",
  },
  en: {
    path: "day-trips/portaventura-from-barcelona",
    title: "PortAventura from Barcelona: opening times, calendar, tickets and the train",
    seoTitle: "PortAventura from Barcelona: opening times, tickets, train",
    seoDescription:
      "PortAventura Park opens daily until 6 January, 10:30-18:00 on weekdays, and reopens on 20 February 2027. Tickets from €37. Direct R17 trains from Sants.",
    excerpt: "Opening times and calendar for PortAventura Park, Ferrari Land and Caribe this autumn and winter, ticket prices, and the trains from Barcelona.",
  },
};

type T = {
  lead: string;
  calCaption: string; calHeaders: string[]; calRows: string[][]; calNote: string;
  otherCaption: string; otherHeaders: string[]; otherRows: string[][]; otherNote: string;
  ticketsTitle: string; tickets: string[];
  trainTitle: string; train: string[];
  trainCaption: string; trainHeaders: string[]; trainRows: string[][]; trainNote: string;
  tipsTitle: string; tips: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "**PortAventura Park** opens **every day until 6 January 2027**, usually **10:30 to 18:00** on weekdays and later at weekends, with **Halloween until 15 November** and the **Christmas season from 20 November**. It then closes from 7 January and **reopens at weekends from 20 February 2027**, daily from 18 March. Tickets start **from €37**, and three **direct R17 trains** a day run from Barcelona-Sants to the park's station in 1 h 24.",
    calCaption: "PortAventura Park opening times, October 2026 to March 2027",
    calHeaders: ["Dates", "Opening times"],
    calRows: [
      ["24 Oct – 15 Nov (Halloween)", "Weekdays 10:30–18:00 (26–30 Oct until 19:00); Saturdays until 23:00, 31 Oct until midnight; Sundays until 19:00 or 20:00"],
      ["16 Nov – 6 Jan (Christmas from 20 Nov)", "Daily 10:30–18:00; until 19:00 on 5–7 Dec, 27–30 Dec and 1–4 Jan"],
      ["7 Jan – 19 Feb 2027", "Closed"],
      ["20 Feb – 17 Mar 2027", "Weekends only (20–21 and 27–28 Feb, 6–7 and 13–14 Mar); hours not yet published"],
      ["From 18 Mar 2027", "Daily; hours not yet published"],
    ],
    calNote: "From PortAventura World's official opening calendar, read on 24 October 2026.",
    otherCaption: "Ferrari Land and Caribe Aquatic Park",
    otherHeaders: ["Park", "When it opens"],
    otherRows: [
      ["Ferrari Land", "Daily 16:30–22:00 until 1 Nov. In Nov and Dec: Fridays 17:00–22:00, weekends 16:30–22:00, closed Monday to Thursday except 7–8 Dec; daily from 19 Dec to 6 Jan (24 and 31 Dec and 6 Jan 13:00–19:00). Closed 7 Jan – 18 Mar 2027."],
      ["Caribe Aquatic Park", "Closed until 21 May 2027; reopens on 22 May 2027."],
    ],
    otherNote: "Official opening calendar, read on 24 October 2026.",
    ticketsTitle: "Tickets and prices",
    tickets: [
      "Prices depend on the date. On the official site a one-day ticket for PortAventura Park starts **from €37** for adults (11 to 59) and €33 for juniors (4 to 10) and seniors (60 and over); one day in two parks, adding Ferrari Land, from €44 (€40 junior and senior); Ferrari Land alone from €19 (€17). Buying at the ticket office costs **€10 more**.",
      "Rodalies sells a **combined train + ticket**: return train from any Rodalies station to Salou-Port Aventura plus a day ticket to PortAventura Park, **€41.95** for adults and €37.95 for children 4 to 10, over-60s and pensioners, valid while the park is open until 6 January 2027.",
    ],
    trainTitle: "PortAventura by train from Barcelona: timetable",
    train: [
      "The park's station is **Salou-Port Aventura**. Only two services stop there: the **direct R17** from Barcelona-Sants (three trains a day each way, €9.35 single), and the **RT2** shuttle from Tarragona (13 minutes, €2.70 single), which you reach on any regional train from Sants (69 minutes, at :03 and :33 past the hour). The R14, R15 and R16 do not stop at the park.",
      "On weekdays the park closes at 18:00: the easiest way back is the RT2 at 18:31 to Tarragona and the regional at 18:56 to Sants, or the last direct R17 at 21:41.",
    ],
    trainCaption: "Trains between Barcelona-Sants and Salou-Port Aventura",
    trainHeaders: ["Train", "Leaves", "Journey"],
    trainRows: [
      ["R17 direct, Sants → park", "8:33, 10:33, 12:33", "1 h 24"],
      ["R17 direct, park → Sants", "11:11, 13:11, 21:41", "1 h 26"],
      ["RT2, Tarragona → park", "6:37, 7:23, 15:53, 16:53, 17:53, 18:53, 19:52, 20:52 (plus the R17 at 9:44, 11:44, 13:44)", "13 min"],
      ["RT2, park → Tarragona", "6:59, 7:46, 14:31, 16:31, 17:31, 18:31, 19:31, 20:31 (plus the R17 at 11:11, 13:11, 21:41)", "13 min"],
    ],
    trainNote: "Official Rodalies journey planner for 27 and 31 October and 1 and 15 November 2026, the same every day. December times were not yet published.",
    tipsTitle: "Before you go",
    tips: [
      "**Buy online:** the ticket office adds €10 per ticket.",
      "**Check the day's hours:** closing time changes with the season and the events.",
      "**Coming from Tarragona:** combine it with the Roman city; see the Tarragona day trip.",
    ],
    faq: [
      { question: "What are PortAventura's opening hours?", answer: "PortAventura Park usually opens 10:30 to 18:00 on weekdays until 6 January 2027, later at weekends: until 23:00 on Halloween Saturdays and until 19:00 on some Christmas days." },
      { question: "When does PortAventura reopen in 2027?", answer: "PortAventura Park closes from 7 January and reopens at weekends from 20 February 2027, then daily from 18 March. Ferrari Land reopens on 19 March and Caribe Aquatic Park on 22 May 2027." },
      { question: "Is PortAventura open in winter?", answer: "Yes until 6 January 2027, every day. It is closed from 7 January to 19 February 2027." },
      { question: "How much is a PortAventura ticket?", answer: "From €37 for an adult one-day ticket and €33 for children 4 to 10 and over-60s, depending on the date; €10 more at the ticket office." },
      { question: "How do I get to PortAventura by train from Barcelona?", answer: "On one of the three direct R17 trains from Sants (8:33, 10:33 or 12:33, 1 h 24), or by regional train to Tarragona and the RT2 shuttle to Salou-Port Aventura." },
      { question: "When does Halloween at PortAventura end?", answer: "On 15 November 2026. The Christmas season runs from 20 November 2026 to 6 January 2027." },
    ],
    note: "Park calendars and train services change: check PortAventura and Rodalies for your date.",
  },
  es: {
    lead: "**PortAventura Park** abre **cada día hasta el 6 de enero de 2027**, normalmente **de 10:30 a 18:00** entre semana y más tarde los fines de semana, con **Halloween hasta el 15 de noviembre** y la **temporada de Navidad desde el 20 de noviembre**. Después cierra desde el 7 de enero y **vuelve a abrir los fines de semana desde el 20 de febrero de 2027**, y cada día desde el 18 de marzo. Las entradas van **desde 37 €**, y tres **trenes R17 directos** al día van de Barcelona-Sants a la estación del parque en 1 h 24.",
    calCaption: "Horarios de PortAventura Park, de octubre de 2026 a marzo de 2027",
    calHeaders: ["Fechas", "Horario"],
    calRows: [
      ["24 oct – 15 nov (Halloween)", "Entre semana de 10:30 a 18:00 (del 26 al 30 de octubre, hasta las 19:00); sábados hasta las 23:00, el 31 de octubre hasta medianoche; domingos hasta las 19:00 o las 20:00"],
      ["16 nov – 6 ene (Navidad desde el 20 nov)", "Cada día de 10:30 a 18:00; hasta las 19:00 el 5–7 dic, el 27–30 dic y el 1–4 ene"],
      ["7 ene – 19 feb 2027", "Cerrado"],
      ["20 feb – 17 mar 2027", "Solo fines de semana (20–21 y 27–28 feb, 6–7 y 13–14 mar); horario aún no publicado"],
      ["Desde el 18 mar 2027", "Cada día; horario aún no publicado"],
    ],
    calNote: "Del calendario oficial de apertura de PortAventura World, consultado el 24 de octubre de 2026.",
    otherCaption: "Ferrari Land y Caribe Aquatic Park",
    otherHeaders: ["Parque", "Cuándo abre"],
    otherRows: [
      ["Ferrari Land", "Cada día de 16:30 a 22:00 hasta el 1 nov. En noviembre y diciembre: viernes de 17:00 a 22:00, fines de semana de 16:30 a 22:00, cerrado de lunes a jueves salvo el 7–8 dic; cada día del 19 dic al 6 ene (24 y 31 dic y 6 ene de 13:00 a 19:00). Cerrado del 7 ene al 18 mar 2027."],
      ["Caribe Aquatic Park", "Cerrado hasta el 21 de mayo de 2027; reabre el 22 de mayo de 2027."],
    ],
    otherNote: "Calendario oficial de apertura, consultado el 24 de octubre de 2026.",
    ticketsTitle: "Entradas y precios",
    tickets: [
      "Los precios dependen de la fecha. En la web oficial, la entrada de un día a PortAventura Park empieza **desde 37 €** para adultos (de 11 a 59 años) y 33 € para junior (de 4 a 10) y sénior (60 o más); un día en dos parques, con Ferrari Land, desde 44 € (40 € junior y sénior); Ferrari Land sola, desde 19 € (17 €). Comprar en taquilla cuesta **10 € más**.",
      "Rodalies vende un **billete combinado tren + entrada**: tren de ida y vuelta desde cualquier estación de Rodalies hasta Salou-Port Aventura y entrada de un día a PortAventura Park, **41,95 €** para adultos y 37,95 € para niños de 4 a 10 años, mayores de 60 y pensionistas, válido mientras el parque abre, hasta el 6 de enero de 2027.",
    ],
    trainTitle: "Horarios del tren de Barcelona a PortAventura",
    train: [
      "La estación del parque es **Salou-Port Aventura**. Solo paran dos servicios: el **R17 directo** desde Barcelona-Sants (tres trenes al día en cada sentido, 9,35 € el sencillo) y la lanzadera **RT2** desde Tarragona (13 minutos, 2,70 € el sencillo), a la que se llega con cualquier regional desde Sants (69 minutos, a los minutos :03 y :33). La R14, la R15 y la R16 no paran en el parque.",
      "Entre semana el parque cierra a las 18:00: lo más fácil para volver es la RT2 de las 18:31 hasta Tarragona y el regional de las 18:56 hasta Sants, o el último R17 directo, a las 21:41.",
    ],
    trainCaption: "Trenes entre Barcelona-Sants y Salou-Port Aventura",
    trainHeaders: ["Tren", "Salidas", "Duración"],
    trainRows: [
      ["R17 directo, Sants → parque", "8:33, 10:33, 12:33", "1 h 24"],
      ["R17 directo, parque → Sants", "11:11, 13:11, 21:41", "1 h 26"],
      ["RT2, Tarragona → parque", "6:37, 7:23, 15:53, 16:53, 17:53, 18:53, 19:52, 20:52 (y el R17 de las 9:44, 11:44 y 13:44)", "13 min"],
      ["RT2, parque → Tarragona", "6:59, 7:46, 14:31, 16:31, 17:31, 18:31, 19:31, 20:31 (y el R17 de las 11:11, 13:11 y 21:41)", "13 min"],
    ],
    trainNote: "Planificador oficial de Rodalies para el 27 y el 31 de octubre y el 1 y el 15 de noviembre de 2026, igual todos los días. Los horarios de diciembre aún no estaban publicados.",
    tipsTitle: "Antes de ir",
    tips: [
      "**Compra en línea:** en taquilla cuesta 10 € más por entrada.",
      "**Mira el horario del día:** la hora de cierre cambia con la temporada y los eventos.",
      "**Si vienes por Tarragona:** combínalo con la ciudad romana; mira la escapada a Tarragona.",
    ],
    faq: [
      { question: "¿Qué horario tiene PortAventura?", answer: "PortAventura Park abre normalmente de 10:30 a 18:00 entre semana hasta el 6 de enero de 2027, y más tarde los fines de semana: hasta las 23:00 los sábados de Halloween y hasta las 19:00 algunos días de Navidad." },
      { question: "¿Cuándo abre PortAventura en 2027?", answer: "PortAventura Park cierra desde el 7 de enero y vuelve a abrir los fines de semana desde el 20 de febrero de 2027, y cada día desde el 18 de marzo. Ferrari Land reabre el 19 de marzo y Caribe Aquatic Park, el 22 de mayo de 2027." },
      { question: "¿Abre PortAventura en invierno?", answer: "Sí hasta el 6 de enero de 2027, todos los días. Cierra del 7 de enero al 19 de febrero de 2027." },
      { question: "¿Cuánto cuesta la entrada a PortAventura?", answer: "Desde 37 € la entrada de adulto de un día y 33 € para niños de 4 a 10 años y mayores de 60, según la fecha; 10 € más en taquilla." },
      { question: "¿Cómo se va a PortAventura en tren desde Barcelona?", answer: "En uno de los tres R17 directos desde Sants (8:33, 10:33 o 12:33, 1 h 24), o en regional hasta Tarragona y la lanzadera RT2 hasta Salou-Port Aventura." },
      { question: "¿Cuándo termina Halloween en PortAventura?", answer: "El 15 de noviembre de 2026. La temporada de Navidad va del 20 de noviembre de 2026 al 6 de enero de 2027." },
    ],
    note: "Los calendarios de los parques y los trenes cambian: consulta PortAventura y Rodalies para tu fecha.",
  },
  ca: {
    lead: "**PortAventura Park** obre **cada dia fins al 6 de gener de 2027**, normalment **de 10:30 a 18:00** entre setmana i més tard els caps de setmana, amb **Halloween fins al 15 de novembre** i la **temporada de Nadal des del 20 de novembre**. Després tanca a partir del 7 de gener i **torna a obrir els caps de setmana des del 20 de febrer de 2027**, i cada dia des del 18 de març. Les entrades van **des de 37 €**, i tres **trens R17 directes** al dia van de Barcelona-Sants a l'estació del parc en 1 h 24.",
    calCaption: "Horaris de PortAventura Park, d'octubre de 2026 a març de 2027",
    calHeaders: ["Dates", "Horari"],
    calRows: [
      ["24 oct – 15 nov (Halloween)", "Entre setmana de 10:30 a 18:00 (del 26 al 30 d'octubre, fins a les 19:00); dissabtes fins a les 23:00, el 31 d'octubre fins a mitjanit; diumenges fins a les 19:00 o les 20:00"],
      ["16 nov – 6 gen (Nadal des del 20 nov)", "Cada dia de 10:30 a 18:00; fins a les 19:00 el 5–7 des, el 27–30 des i l'1–4 gen"],
      ["7 gen – 19 febr 2027", "Tancat"],
      ["20 febr – 17 març 2027", "Només caps de setmana (20–21 i 27–28 febr, 6–7 i 13–14 març); horari encara no publicat"],
      ["Des del 18 març 2027", "Cada dia; horari encara no publicat"],
    ],
    calNote: "Del calendari oficial d'obertura de PortAventura World, consultat el 24 d'octubre de 2026.",
    otherCaption: "Ferrari Land i Caribe Aquatic Park",
    otherHeaders: ["Parc", "Quan obre"],
    otherRows: [
      ["Ferrari Land", "Cada dia de 16:30 a 22:00 fins a l'1 de novembre. Al novembre i desembre: divendres de 17:00 a 22:00, caps de setmana de 16:30 a 22:00, tancat de dilluns a dijous llevat del 7–8 des; cada dia del 19 des al 6 gen (24 i 31 des i 6 gen de 13:00 a 19:00). Tancat del 7 gen al 18 març 2027."],
      ["Caribe Aquatic Park", "Tancat fins al 21 de maig de 2027; reobre el 22 de maig de 2027."],
    ],
    otherNote: "Calendari oficial d'obertura, consultat el 24 d'octubre de 2026.",
    ticketsTitle: "Entrades i preus",
    tickets: [
      "Els preus depenen de la data. Al web oficial, l'entrada d'un dia a PortAventura Park comença **des de 37 €** per a adults (d'11 a 59 anys) i 33 € per a júnior (de 4 a 10) i sènior (60 o més); un dia a dos parcs, amb Ferrari Land, des de 44 € (40 € júnior i sènior); Ferrari Land sola, des de 19 € (17 €). Comprar a taquilla costa **10 € més**.",
      "Rodalies ven un **bitllet combinat tren + entrada**: tren d'anada i tornada des de qualsevol estació de Rodalies fins a Salou-Port Aventura i entrada d'un dia a PortAventura Park, **41,95 €** per a adults i 37,95 € per a infants de 4 a 10 anys, majors de 60 i pensionistes, vàlid mentre el parc és obert, fins al 6 de gener de 2027.",
    ],
    trainTitle: "Horaris del tren de Barcelona a PortAventura",
    train: [
      "L'estació del parc és **Salou-Port Aventura**. Només hi paren dos serveis: l'**R17 directe** des de Barcelona-Sants (tres trens al dia en cada sentit, 9,35 € el senzill) i la llançadora **RT2** des de Tarragona (13 minuts, 2,70 € el senzill), on s'arriba amb qualsevol regional des de Sants (69 minuts, als minuts :03 i :33). L'R14, l'R15 i l'R16 no paren al parc.",
      "Entre setmana el parc tanca a les 18:00: el més fàcil per tornar és l'RT2 de les 18:31 fins a Tarragona i el regional de les 18:56 fins a Sants, o l'últim R17 directe, a les 21:41.",
    ],
    trainCaption: "Trens entre Barcelona-Sants i Salou-Port Aventura",
    trainHeaders: ["Tren", "Sortides", "Durada"],
    trainRows: [
      ["R17 directe, Sants → parc", "8:33, 10:33, 12:33", "1 h 24"],
      ["R17 directe, parc → Sants", "11:11, 13:11, 21:41", "1 h 26"],
      ["RT2, Tarragona → parc", "6:37, 7:23, 15:53, 16:53, 17:53, 18:53, 19:52, 20:52 (i l'R17 de les 9:44, 11:44 i 13:44)", "13 min"],
      ["RT2, parc → Tarragona", "6:59, 7:46, 14:31, 16:31, 17:31, 18:31, 19:31, 20:31 (i l'R17 de les 11:11, 13:11 i 21:41)", "13 min"],
    ],
    trainNote: "Cercador oficial de Rodalies per al 27 i el 31 d'octubre i l'1 i el 15 de novembre de 2026, igual cada dia. Els horaris de desembre encara no eren publicats.",
    tipsTitle: "Abans d'anar-hi",
    tips: [
      "**Compra en línia:** a taquilla costa 10 € més per entrada.",
      "**Mira l'horari del dia:** l'hora de tancament canvia amb la temporada i els esdeveniments.",
      "**Si passes per Tarragona:** combina-ho amb la ciutat romana; mira l'escapada a Tarragona.",
    ],
    faq: [
      { question: "Quin horari té PortAventura?", answer: "PortAventura Park obre normalment de 10:30 a 18:00 entre setmana fins al 6 de gener de 2027, i més tard els caps de setmana: fins a les 23:00 els dissabtes de Halloween i fins a les 19:00 alguns dies de Nadal." },
      { question: "Quan obre PortAventura el 2027?", answer: "PortAventura Park tanca a partir del 7 de gener i torna a obrir els caps de setmana des del 20 de febrer de 2027, i cada dia des del 18 de març. Ferrari Land reobre el 19 de març i Caribe Aquatic Park, el 22 de maig de 2027." },
      { question: "Obre PortAventura a l'hivern?", answer: "Sí fins al 6 de gener de 2027, cada dia. Tanca del 7 de gener al 19 de febrer de 2027." },
      { question: "Quant costa l'entrada a PortAventura?", answer: "Des de 37 € l'entrada d'adult d'un dia i 33 € per a infants de 4 a 10 anys i majors de 60, segons la data; 10 € més a taquilla." },
      { question: "Com s'hi va a PortAventura en tren des de Barcelona?", answer: "Amb un dels tres R17 directes des de Sants (8:33, 10:33 o 12:33, 1 h 24), o amb regional fins a Tarragona i la llançadora RT2 fins a Salou-Port Aventura." },
      { question: "Quan acaba Halloween a PortAventura?", answer: "El 15 de novembre de 2026. La temporada de Nadal va del 20 de novembre de 2026 al 6 de gener de 2027." },
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
    table(t.otherCaption, t.otherHeaders, t.otherRows, t.otherNote),
    ...h2(t.ticketsTitle, ...t.tickets),
    ...h2(t.trainTitle, ...t.train),
    table(t.trainCaption, t.trainHeaders, t.trainRows, t.trainNote),
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
