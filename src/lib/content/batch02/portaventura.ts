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
 *
 * 28 Oct 2026 (page-1 push, research_notes/page1-28oct/portaventura_montserrat.md):
 * calendar feed re-read Oct 2026 - May 2027, unchanged. The "from 37 EUR"
 * card price is the Halloween promotion (15% off, purchases and visits to
 * 15 Nov, 1,000-ticket quota); the card's crossed-out "from 43 EUR" is the
 * price the page now leads with. 2027 days are marked open in the feed with
 * no hours and no announcement, so they are written as "marked open". Walking
 * time from Renfe's combined-ticket page ("a tan solo 10 minutos andando").
 * R17 back to Sants 1 h 28 per the 2026 R17/RT2 timetable PDF.
 */

const VERIFIED = "2026-10-28";

const SOURCES: B2Source[] = [
  { name: "PortAventura World — dates and times", url: "https://www.portaventuraworld.com/en/dates-times", publisher: "PortAventura World" },
  { name: "PortAventura World — Christmas", url: "https://www.portaventuraworld.com/en/christmas", publisher: "PortAventura World" },
  { name: "PortAventura Park tickets", url: "https://www.portaventuraworld.com/en/tickets/portaventura", publisher: "PortAventura World" },
  { name: "Ferrari Land tickets", url: "https://www.portaventuraworld.com/en/tickets/ferrari-land", publisher: "PortAventura World" },
  { name: "How to get to PortAventura", url: "https://www.portaventuraworld.com/en/destination/planning/how-to-get-to-portaventura", publisher: "PortAventura World" },
  { name: "Cercador d'horaris de Rodalies", url: "https://rodalies.gencat.cat/ca/horaris/", publisher: "Rodalies de Catalunya" },
  { name: "Horaris R17 i RT2", url: "https://rodalies.gencat.cat/web/.content/02_Horaris/horaris/R17RT2.pdf", publisher: "Rodalies de Catalunya" },
  { name: "Bitllet combinat Rodalies + PortAventura", url: "https://rodalies.gencat.cat/ca/nou-bitllets-combinats/portaventura/", publisher: "Rodalies de Catalunya" },
  { name: "Billete combinado Rodalies + PortAventura", url: "https://www.renfe.com/es/es/cercanias/rodalies-catalunya/ofertas-mas-populares/billete-combinado-portaventura", publisher: "Renfe" },
  { name: "Halloween tickets discount", url: "https://www.portaventuraworld.com/en/promotions/halloween-tickets-discount", publisher: "PortAventura World" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "escapades/portaventura-des-de-barcelona",
    title: "PortAventura des de Barcelona: horaris i calendari 2026-2027, entrades i com anar-hi en tren",
    seoTitle: "PortAventura des de Barcelona: horaris i calendari 2026",
    seoDescription:
      "PortAventura obre cada dia fins al 6 de gener i tanca del 7 de gener al 19 de febrer de 2027. Entrades des de 43 €; tren R17 directe des de Sants.",
    excerpt: "Horaris i calendari de PortAventura Park, Ferrari Land i Caribe aquesta tardor i hivern, quant costen les entrades i quins trens hi arriben des de Barcelona.",
  },
  es: {
    path: "escapadas/portaventura-desde-barcelona",
    title: "PortAventura desde Barcelona: horarios y calendario 2026-2027, entradas y cómo ir en tren",
    seoTitle: "PortAventura desde Barcelona: horarios y calendario 2026",
    seoDescription:
      "PortAventura abre cada día hasta el 6 de enero y cierra del 7 de enero al 19 de febrero de 2027. Entradas desde 43 €; tren R17 directo desde Sants.",
    excerpt: "Horarios y calendario de PortAventura Park, Ferrari Land y Caribe este otoño e invierno, cuánto cuestan las entradas y qué trenes llegan desde Barcelona.",
  },
  en: {
    path: "day-trips/portaventura-from-barcelona",
    title: "PortAventura from Barcelona: opening times, calendar, tickets and the train",
    seoTitle: "PortAventura from Barcelona: opening times, tickets, train",
    seoDescription:
      "PortAventura Park opens daily until 6 January and closes from 7 January to 19 February 2027. Tickets from €43; direct R17 trains from Sants.",
    excerpt: "Opening times and calendar for PortAventura Park, Ferrari Land and Caribe this autumn and winter, ticket prices, and the trains from Barcelona.",
  },
};

type T = {
  lead: string;
  calTitle: string;
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
    lead: "**PortAventura Park** opens **every day until 6 January 2027**, usually **10:30 to 18:00** on weekdays and later at weekends, with **Halloween until 15 November** and the **Christmas season from 20 November**. It is **closed from 7 January to 19 February 2027**; its calendar marks it open at weekends from 20 February and daily from 18 March, hours not yet published. One-day tickets start **from €43** (from €37 with the Halloween discount, for visits until 15 November), and three **direct R17 trains** a day run from Barcelona-Sants to the park's station, a 10-minute walk from the park, in 1 h 24.",
    calTitle: "PortAventura opening times and calendar 2026-2027",
    calCaption: "PortAventura Park opening times, October 2026 to March 2027",
    calHeaders: ["Dates", "Opening times"],
    calRows: [
      ["24 Oct – 15 Nov (Halloween)", "Weekdays 10:30–18:00 (26–30 Oct until 19:00); Saturdays until 23:00, 31 Oct until midnight; Sundays until 19:00 or 20:00"],
      ["16 Nov – 6 Jan (Christmas from 20 Nov)", "Daily 10:30–18:00; until 19:00 on 5–7 Dec, 27–30 Dec and 1–4 Jan"],
      ["7 Jan – 19 Feb 2027", "Closed"],
      ["20 Feb – 17 Mar 2027", "Weekends only (20–21 and 27–28 Feb, 6–7 and 13–14 Mar); hours not yet published"],
      ["From 18 Mar 2027", "Daily; hours not yet published"],
    ],
    calNote: "From PortAventura World's official opening calendar, read on 28 October 2026.",
    otherCaption: "Ferrari Land and Caribe Aquatic Park",
    otherHeaders: ["Park", "When it opens"],
    otherRows: [
      ["Ferrari Land", "Daily 16:30–22:00 until 1 Nov. In Nov and Dec: Fridays 17:00–22:00, weekends 16:30–22:00, closed Monday to Thursday except 7–8 Dec; daily from 19 Dec to 6 Jan (24 and 31 Dec and 6 Jan 13:00–19:00). Closed 7 Jan – 18 Mar 2027."],
      ["Caribe Aquatic Park", "Closed until 21 May 2027; reopens on 22 May 2027."],
    ],
    otherNote: "Official opening calendar, read on 28 October 2026.",
    ticketsTitle: "PortAventura ticket prices",
    tickets: [
      "Prices depend on the date. On the official site a one-day ticket for PortAventura Park starts **from €43** for adults (11 to 59) and €39 for juniors (4 to 10) and seniors (60 and over); one day in two parks, adding Ferrari Land, from €55 (€50 junior and senior); Ferrari Land alone from €19 (€17). Until 15 November a Halloween promotion takes 15% off one-park and 20% off two-park day tickets (from €37 and €44 for adults) for visits up to that date, while its 1,000 tickets last. Buying at the ticket office costs **€10 more** for park and two-park tickets (€7 more for Ferrari Land alone).",
      "Rodalies sells a **combined train + ticket**: return train from any Rodalies station to Salou-Port Aventura plus a day ticket to PortAventura Park, **€41.95** for adults and €37.95 for children 4 to 10, over-60s and pensioners, valid while the park is open until 6 January 2027. Renfe does not allow changes or cancellations.",
    ],
    trainTitle: "PortAventura by train from Barcelona: timetable",
    train: [
      "The park's station is **Salou-Port Aventura**, about a 10-minute walk from the park according to Renfe. Only two services stop there: the **direct R17** from Barcelona-Sants (three trains a day each way, €9.35 single), and the **RT2** shuttle from Tarragona (13 minutes, €2.70 single), which you reach on any regional train from Sants (69 minutes, at :03 and :33 past the hour). The R14, R15 and R16 do not stop at the park.",
      "On weekdays the park closes at 18:00: the easiest way back is the RT2 at 18:31 to Tarragona and the regional at 18:56 to Sants, or the last direct R17 at 21:41.",
    ],
    trainCaption: "Trains between Barcelona-Sants and Salou-Port Aventura",
    trainHeaders: ["Train", "Leaves", "Journey"],
    trainRows: [
      ["R17 direct, Sants → park", "8:33, 10:33, 12:33", "1 h 24"],
      ["R17 direct, park → Sants", "11:11, 13:11, 21:41", "1 h 28"],
      ["RT2, Tarragona → park", "6:37, 7:23, 15:53, 16:53, 17:53, 18:53, 19:52, 20:52 (plus the R17 at 9:44, 11:44, 13:44)", "13 min"],
      ["RT2, park → Tarragona", "6:59, 7:46, 14:31, 16:31, 17:31, 18:31, 19:31, 20:31 (plus the R17 at 11:11, 13:11, 21:41)", "13 min"],
    ],
    trainNote: "Rodalies' 2026 R17 and RT2 timetable, the same every day, read on 28 October 2026. It can change for works or strikes: check Rodalies for your date.",
    tipsTitle: "Before you go",
    tips: [
      "**Buy online:** the ticket office adds up to €10 per ticket.",
      "**Check the day's hours:** closing time changes with the season and the events.",
      "**Coming from Tarragona:** combine it with the Roman city; see the Tarragona day trip.",
    ],
    faq: [
      { question: "What are PortAventura's opening hours?", answer: "PortAventura Park usually opens 10:30 to 18:00 on weekdays until 6 January 2027, later at weekends: until 23:00 on Halloween Saturdays and until 19:00 on some Christmas days." },
      { question: "When does PortAventura close for the winter?", answer: "After 6 January 2027. PortAventura Park is closed from 7 January to 19 February 2027." },
      { question: "When does PortAventura reopen in 2027?", answer: "Its official calendar marks PortAventura Park open at weekends from 20 February 2027 and daily from 18 March, with hours not yet published. Ferrari Land is marked open from 19 March and Caribe Aquatic Park from 22 May 2027." },
      { question: "Is PortAventura open in winter?", answer: "Yes until 6 January 2027, every day. It is closed from 7 January to 19 February 2027." },
      { question: "How much is a PortAventura ticket?", answer: "From €43 for an adult one-day ticket and €39 for children 4 to 10 and over-60s, depending on the date (from €37 and €33 with the Halloween discount, for visits until 15 November); €10 more at the ticket office." },
      { question: "How far is the station from PortAventura?", answer: "Salou-Port Aventura station is about a 10-minute walk from the park, according to Renfe." },
      { question: "How do I get to PortAventura by train from Barcelona?", answer: "On one of the three direct R17 trains from Sants (8:33, 10:33 or 12:33, 1 h 24), or by regional train to Tarragona and the RT2 shuttle to Salou-Port Aventura." },
      { question: "When does Halloween at PortAventura end?", answer: "On 15 November 2026. The Christmas season runs from 20 November 2026 to 6 January 2027." },
    ],
    note: "Park calendars and train services change: check PortAventura and Rodalies for your date.",
  },
  es: {
    lead: "**PortAventura Park** abre **cada día hasta el 6 de enero de 2027**, normalmente **de 10:30 a 18:00** entre semana y más tarde los fines de semana, con **Halloween hasta el 15 de noviembre** y la **temporada de Navidad desde el 20 de noviembre**. Después **cierra del 7 de enero al 19 de febrero de 2027**; su calendario lo marca abierto los fines de semana desde el 20 de febrero y cada día desde el 18 de marzo, aún sin horario. Las entradas de un día van **desde 43 €** (desde 37 € con el descuento de Halloween, para visitas hasta el 15 de noviembre), y tres **trenes R17 directos** al día van de Barcelona-Sants a la estación del parque, a 10 minutos a pie, en 1 h 24.",
    calTitle: "Horarios y calendario de PortAventura 2026-2027",
    calCaption: "Horarios de PortAventura Park, de octubre de 2026 a marzo de 2027",
    calHeaders: ["Fechas", "Horario"],
    calRows: [
      ["24 oct – 15 nov (Halloween)", "Entre semana de 10:30 a 18:00 (del 26 al 30 de octubre, hasta las 19:00); sábados hasta las 23:00, el 31 de octubre hasta medianoche; domingos hasta las 19:00 o las 20:00"],
      ["16 nov – 6 ene (Navidad desde el 20 nov)", "Cada día de 10:30 a 18:00; hasta las 19:00 el 5–7 dic, el 27–30 dic y el 1–4 ene"],
      ["7 ene – 19 feb 2027", "Cerrado"],
      ["20 feb – 17 mar 2027", "Solo fines de semana (20–21 y 27–28 feb, 6–7 y 13–14 mar); horario aún no publicado"],
      ["Desde el 18 mar 2027", "Cada día; horario aún no publicado"],
    ],
    calNote: "Del calendario oficial de apertura de PortAventura World, consultado el 28 de octubre de 2026.",
    otherCaption: "Ferrari Land y Caribe Aquatic Park",
    otherHeaders: ["Parque", "Cuándo abre"],
    otherRows: [
      ["Ferrari Land", "Cada día de 16:30 a 22:00 hasta el 1 nov. En noviembre y diciembre: viernes de 17:00 a 22:00, fines de semana de 16:30 a 22:00, cerrado de lunes a jueves salvo el 7–8 dic; cada día del 19 dic al 6 ene (24 y 31 dic y 6 ene de 13:00 a 19:00). Cerrado del 7 ene al 18 mar 2027."],
      ["Caribe Aquatic Park", "Cerrado hasta el 21 de mayo de 2027; reabre el 22 de mayo de 2027."],
    ],
    otherNote: "Calendario oficial de apertura, consultado el 28 de octubre de 2026.",
    ticketsTitle: "Precio de las entradas de PortAventura",
    tickets: [
      "Los precios dependen de la fecha. En la web oficial, la entrada de un día a PortAventura Park empieza **desde 43 €** para adultos (de 11 a 59 años) y 39 € para junior (de 4 a 10) y sénior (60 o más); un día en dos parques, con Ferrari Land, desde 55 € (50 € junior y sénior); Ferrari Land sola, desde 19 € (17 €). Hasta el 15 de noviembre, una promoción de Halloween descuenta un 15 % en la entrada de un parque y un 20 % en la de dos (desde 37 € y 44 € para adultos) para visitas hasta esa fecha, mientras queden sus 1.000 entradas. Comprar en taquilla cuesta **10 € más** en las entradas de PortAventura Park y de dos parques (7 € más en Ferrari Land sola).",
      "Rodalies vende un **billete combinado tren + entrada**: tren de ida y vuelta desde cualquier estación de Rodalies hasta Salou-Port Aventura y entrada de un día a PortAventura Park, **41,95 €** para adultos y 37,95 € para niños de 4 a 10 años, mayores de 60 y pensionistas, válido mientras el parque abre, hasta el 6 de enero de 2027. Renfe no admite cambios ni anulaciones.",
    ],
    trainTitle: "Horarios del tren de Barcelona a PortAventura",
    train: [
      "La estación del parque es **Salou-Port Aventura**, a unos 10 minutos a pie del parque según Renfe. Solo paran dos servicios: el **R17 directo** desde Barcelona-Sants (tres trenes al día en cada sentido, 9,35 € el sencillo) y la lanzadera **RT2** desde Tarragona (13 minutos, 2,70 € el sencillo), a la que se llega con cualquier regional desde Sants (69 minutos, a los minutos :03 y :33). La R14, la R15 y la R16 no paran en el parque.",
      "Entre semana el parque cierra a las 18:00: lo más fácil para volver es la RT2 de las 18:31 hasta Tarragona y el regional de las 18:56 hasta Sants, o el último R17 directo, a las 21:41.",
    ],
    trainCaption: "Trenes entre Barcelona-Sants y Salou-Port Aventura",
    trainHeaders: ["Tren", "Salidas", "Duración"],
    trainRows: [
      ["R17 directo, Sants → parque", "8:33, 10:33, 12:33", "1 h 24"],
      ["R17 directo, parque → Sants", "11:11, 13:11, 21:41", "1 h 28"],
      ["RT2, Tarragona → parque", "6:37, 7:23, 15:53, 16:53, 17:53, 18:53, 19:52, 20:52 (y el R17 de las 9:44, 11:44 y 13:44)", "13 min"],
      ["RT2, parque → Tarragona", "6:59, 7:46, 14:31, 16:31, 17:31, 18:31, 19:31, 20:31 (y el R17 de las 11:11, 13:11 y 21:41)", "13 min"],
    ],
    trainNote: "Horario R17 y RT2 de 2026 de Rodalies, igual todos los días, consultado el 28 de octubre de 2026. Puede cambiar por obras o huelgas: consulta Rodalies para tu fecha.",
    tipsTitle: "Antes de ir",
    tips: [
      "**Compra en línea:** en taquilla cuesta hasta 10 € más por entrada.",
      "**Mira el horario del día:** la hora de cierre cambia con la temporada y los eventos.",
      "**Si vienes por Tarragona:** combínalo con la ciudad romana; mira la escapada a Tarragona.",
    ],
    faq: [
      { question: "¿Qué horario tiene PortAventura?", answer: "PortAventura Park abre normalmente de 10:30 a 18:00 entre semana hasta el 6 de enero de 2027, y más tarde los fines de semana: hasta las 23:00 los sábados de Halloween y hasta las 19:00 algunos días de Navidad." },
      { question: "¿Cuándo cierra PortAventura?", answer: "Después del 6 de enero de 2027. PortAventura Park está cerrado del 7 de enero al 19 de febrero de 2027." },
      { question: "¿Cuándo abre PortAventura en 2027?", answer: "Su calendario oficial marca PortAventura Park abierto los fines de semana desde el 20 de febrero de 2027 y cada día desde el 18 de marzo, aún sin horario publicado. Ferrari Land figura abierto desde el 19 de marzo y Caribe Aquatic Park, desde el 22 de mayo de 2027." },
      { question: "¿Abre PortAventura en invierno?", answer: "Sí hasta el 6 de enero de 2027, todos los días. Cierra del 7 de enero al 19 de febrero de 2027." },
      { question: "¿Cuánto cuesta la entrada a PortAventura?", answer: "Desde 43 € la entrada de adulto de un día y 39 € para niños de 4 a 10 años y mayores de 60, según la fecha (desde 37 € y 33 € con el descuento de Halloween, para visitas hasta el 15 de noviembre); 10 € más en taquilla." },
      { question: "¿A qué distancia está la estación de PortAventura?", answer: "La estación de Salou-Port Aventura está a unos 10 minutos a pie del parque, según Renfe." },
      { question: "¿Cómo se va a PortAventura en tren desde Barcelona?", answer: "En uno de los tres R17 directos desde Sants (8:33, 10:33 o 12:33, 1 h 24), o en regional hasta Tarragona y la lanzadera RT2 hasta Salou-Port Aventura." },
      { question: "¿Cuándo termina Halloween en PortAventura?", answer: "El 15 de noviembre de 2026. La temporada de Navidad va del 20 de noviembre de 2026 al 6 de enero de 2027." },
    ],
    note: "Los calendarios de los parques y los trenes cambian: consulta PortAventura y Rodalies para tu fecha.",
  },
  ca: {
    lead: "**PortAventura Park** obre **cada dia fins al 6 de gener de 2027**, normalment **de 10:30 a 18:00** entre setmana i més tard els caps de setmana, amb **Halloween fins al 15 de novembre** i la **temporada de Nadal des del 20 de novembre**. Després **tanca del 7 de gener al 19 de febrer de 2027**; el seu calendari el marca obert els caps de setmana des del 20 de febrer i cada dia des del 18 de març, encara sense horari. Les entrades d'un dia van **des de 43 €** (des de 37 € amb el descompte de Halloween, per a visites fins al 15 de novembre), i tres **trens R17 directes** al dia van de Barcelona-Sants a l'estació del parc, a 10 minuts a peu, en 1 h 24.",
    calTitle: "Horaris i calendari de PortAventura 2026-2027",
    calCaption: "Horaris de PortAventura Park, d'octubre de 2026 a març de 2027",
    calHeaders: ["Dates", "Horari"],
    calRows: [
      ["24 oct – 15 nov (Halloween)", "Entre setmana de 10:30 a 18:00 (del 26 al 30 d'octubre, fins a les 19:00); dissabtes fins a les 23:00, el 31 d'octubre fins a mitjanit; diumenges fins a les 19:00 o les 20:00"],
      ["16 nov – 6 gen (Nadal des del 20 nov)", "Cada dia de 10:30 a 18:00; fins a les 19:00 el 5–7 des, el 27–30 des i l'1–4 gen"],
      ["7 gen – 19 febr 2027", "Tancat"],
      ["20 febr – 17 març 2027", "Només caps de setmana (20–21 i 27–28 febr, 6–7 i 13–14 març); horari encara no publicat"],
      ["Des del 18 març 2027", "Cada dia; horari encara no publicat"],
    ],
    calNote: "Del calendari oficial d'obertura de PortAventura World, consultat el 28 d'octubre de 2026.",
    otherCaption: "Ferrari Land i Caribe Aquatic Park",
    otherHeaders: ["Parc", "Quan obre"],
    otherRows: [
      ["Ferrari Land", "Cada dia de 16:30 a 22:00 fins a l'1 de novembre. Al novembre i desembre: divendres de 17:00 a 22:00, caps de setmana de 16:30 a 22:00, tancat de dilluns a dijous llevat del 7–8 des; cada dia del 19 des al 6 gen (24 i 31 des i 6 gen de 13:00 a 19:00). Tancat del 7 gen al 18 març 2027."],
      ["Caribe Aquatic Park", "Tancat fins al 21 de maig de 2027; reobre el 22 de maig de 2027."],
    ],
    otherNote: "Calendari oficial d'obertura, consultat el 28 d'octubre de 2026.",
    ticketsTitle: "Preu de les entrades de PortAventura",
    tickets: [
      "Els preus depenen de la data. Al web oficial, l'entrada d'un dia a PortAventura Park comença **des de 43 €** per a adults (d'11 a 59 anys) i 39 € per a júnior (de 4 a 10) i sènior (60 o més); un dia a dos parcs, amb Ferrari Land, des de 55 € (50 € júnior i sènior); Ferrari Land sola, des de 19 € (17 €). Fins al 15 de novembre, una promoció de Halloween descompta un 15 % a l'entrada d'un parc i un 20 % a la de dos (des de 37 € i 44 € per a adults) per a visites fins a aquesta data, mentre quedin les seves 1.000 entrades. Comprar a taquilla costa **10 € més** a les entrades de PortAventura Park i de dos parcs (7 € més a Ferrari Land sola).",
      "Rodalies ven un **bitllet combinat tren + entrada**: tren d'anada i tornada des de qualsevol estació de Rodalies fins a Salou-Port Aventura i entrada d'un dia a PortAventura Park, **41,95 €** per a adults i 37,95 € per a infants de 4 a 10 anys, majors de 60 i pensionistes, vàlid mentre el parc és obert, fins al 6 de gener de 2027. Renfe no hi admet canvis ni anul·lacions.",
    ],
    trainTitle: "Horaris del tren de Barcelona a PortAventura",
    train: [
      "L'estació del parc és **Salou-Port Aventura**, a uns 10 minuts a peu del parc segons Renfe. Només hi paren dos serveis: l'**R17 directe** des de Barcelona-Sants (tres trens al dia en cada sentit, 9,35 € el senzill) i la llançadora **RT2** des de Tarragona (13 minuts, 2,70 € el senzill), on s'arriba amb qualsevol regional des de Sants (69 minuts, als minuts :03 i :33). L'R14, l'R15 i l'R16 no paren al parc.",
      "Entre setmana el parc tanca a les 18:00: el més fàcil per tornar és l'RT2 de les 18:31 fins a Tarragona i el regional de les 18:56 fins a Sants, o l'últim R17 directe, a les 21:41.",
    ],
    trainCaption: "Trens entre Barcelona-Sants i Salou-Port Aventura",
    trainHeaders: ["Tren", "Sortides", "Durada"],
    trainRows: [
      ["R17 directe, Sants → parc", "8:33, 10:33, 12:33", "1 h 24"],
      ["R17 directe, parc → Sants", "11:11, 13:11, 21:41", "1 h 28"],
      ["RT2, Tarragona → parc", "6:37, 7:23, 15:53, 16:53, 17:53, 18:53, 19:52, 20:52 (i l'R17 de les 9:44, 11:44 i 13:44)", "13 min"],
      ["RT2, parc → Tarragona", "6:59, 7:46, 14:31, 16:31, 17:31, 18:31, 19:31, 20:31 (i l'R17 de les 11:11, 13:11 i 21:41)", "13 min"],
    ],
    trainNote: "Horari R17 i RT2 de 2026 de Rodalies, igual cada dia, consultat el 28 d'octubre de 2026. Pot canviar per obres o vagues: consulta Rodalies per a la teva data.",
    tipsTitle: "Abans d'anar-hi",
    tips: [
      "**Compra en línia:** a taquilla costa fins a 10 € més per entrada.",
      "**Mira l'horari del dia:** l'hora de tancament canvia amb la temporada i els esdeveniments.",
      "**Si passes per Tarragona:** combina-ho amb la ciutat romana; mira l'escapada a Tarragona.",
    ],
    faq: [
      { question: "Quin horari té PortAventura?", answer: "PortAventura Park obre normalment de 10:30 a 18:00 entre setmana fins al 6 de gener de 2027, i més tard els caps de setmana: fins a les 23:00 els dissabtes de Halloween i fins a les 19:00 alguns dies de Nadal." },
      { question: "Quan tanca PortAventura?", answer: "Després del 6 de gener de 2027. PortAventura Park és tancat del 7 de gener al 19 de febrer de 2027." },
      { question: "Quan obre PortAventura el 2027?", answer: "El seu calendari oficial marca PortAventura Park obert els caps de setmana des del 20 de febrer de 2027 i cada dia des del 18 de març, encara sense horari publicat. Ferrari Land hi figura obert des del 19 de març i Caribe Aquatic Park, des del 22 de maig de 2027." },
      { question: "Obre PortAventura a l'hivern?", answer: "Sí fins al 6 de gener de 2027, cada dia. Tanca del 7 de gener al 19 de febrer de 2027." },
      { question: "Quant costa l'entrada a PortAventura?", answer: "Des de 43 € l'entrada d'adult d'un dia i 39 € per a infants de 4 a 10 anys i majors de 60, segons la data (des de 37 € i 33 € amb el descompte de Halloween, per a visites fins al 15 de novembre); 10 € més a taquilla." },
      { question: "A quina distància és l'estació de PortAventura?", answer: "L'estació de Salou-Port Aventura és a uns 10 minuts a peu del parc, segons Renfe." },
      { question: "Com s'hi va a PortAventura en tren des de Barcelona?", answer: "Amb un dels tres R17 directes des de Sants (8:33, 10:33 o 12:33, 1 h 24), o amb regional fins a Tarragona i la llançadora RT2 fins a Salou-Port Aventura." },
      { question: "Quan acaba Halloween a PortAventura?", answer: "El 15 de novembre de 2026. La temporada de Nadal va del 20 de novembre de 2026 al 6 de gener de 2027." },
    ],
    note: "Els calendaris dels parcs i els trens canvien: consulta PortAventura i Rodalies per a la teva data.",
  },
};

// Rodalies strikes change which trains run; the hub says what runs that day.
const STRIKES_LINE: Record<Locale, string> = {
  ca: ` Els dies de vaga de Renfe els trens canvien: mira ${b2link("strikes", "ca", "què funciona")}.`,
  es: ` Los días de huelga de Renfe los trenes cambian: mira ${b2link("strikes", "es", "qué funciona")}.`,
  en: ` On Renfe strike days the trains change: see ${b2link("strikes", "en", "what runs")}.`,
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    ...h2(t.calTitle),
    table(t.calCaption, t.calHeaders, t.calRows, t.calNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    table(t.otherCaption, t.otherHeaders, t.otherRows, t.otherNote),
    ...h2(t.ticketsTitle, ...t.tickets),
    ...h2(t.trainTitle, ...t.train.slice(0, -1), t.train.at(-1) + STRIKES_LINE[locale]),
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
