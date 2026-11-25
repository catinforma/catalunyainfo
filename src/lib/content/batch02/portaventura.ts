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
import { withGlance } from "./day-trip-glance";

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
 *
 * 30 Oct 2026 (top-3 push, EN at 7.6 with half the site's CTR curve): the
 * calendar feed re-read for PortAventura Park Oct 2026 - Apr 2027 and Ferrari
 * Land Jan and Mar 2027, unchanged (Jan 1-4 to 19:00, 5-6 Jan to 18:00; Feb
 * 20-21, 27-28, Mar 6-7, 13-14 and daily from 18 Mar, no hours; Ferrari Land
 * from 19 Mar). Ticket cards unchanged (from 43/37 EUR, two parks 55/44 EUR).
 * The EN snippet now leads with the dates, which is what its queries ask
 * ("ouverture portaventura 2027", "when is portaventura open", "are they
 * open in january").
 *
 * 23 Nov 2026 (factual correction, docs/SEO_EXPERIMENTS.md): Halloween ended
 * on 15 Nov, so its row, its lead clause and its discount go. The calendar
 * feed re-read for PortAventura Park Nov 2026 - Jan 2027 and Ferrari Land
 * Nov-Dec 2026: unchanged (Christmas 10:30-18:00, to 19:00 on 5-7 Dec,
 * 27-30 Dec and 1-4 Jan; Ferrari Land Fri 17:00, weekends 16:30, daily from
 * 19 Dec). The ticket cards on 23 Nov: one day from 43 EUR crossed out to
 * 37 EUR (junior/senior 39 -> 33), two parks 55 -> 44, Ferrari Land 19 / 17;
 * the discount is the site's current online promotion, so it is printed
 * with its date and no name or end date.
 *
 * 25 Nov 2026 (factual correction, docs/SEO_EXPERIMENTS.md): the calendar feed
 * (api/club/calendar/influx/portaventura/MM/YYYY) now carries hours for 2027:
 * Friday 19 Feb is open 16:00-21:00 (so the closure ends on 18 Feb, not 19),
 * Fridays 26 Feb, 5 and 12 Mar and Wednesday 17 Mar 16:00-21:00, weekends
 * 10:30-18:00, then daily from 18 Mar (18:00 on 18-19 Mar, 20:00 on 20 Mar and
 * 25-28 Mar, 19:00 on 21-24 and 29-31 Mar; April and May also have hours).
 * Ferrari Land (closed 7 Jan - 18 Mar, opens 19 Mar) and Caribe (opens 22 May)
 * unchanged; Nov-Jan hours unchanged. R17 (8:33, 10:33, 12:33; back 11:11,
 * 13:11, 21:41; 9.35 EUR; 1 h 24 out, the planner now says 1 h 26 back where
 * the PDF said 1 h 28, so the return time is not printed in the glance
 * table) and RT2 (13 min, 2.70 EUR) re-read from the Rodalies planner; day
 * tickets from 43 EUR, 37 EUR online (junior 39 / 33, two parks 55 / 44).
 * Not re-read: "10 EUR more at the ticket office" (the tickets page now shows
 * a separate ticket-booth price, "from 30 EUR" for the one-day ticket, that
 * this page does not explain).
 */

const VERIFIED = "2026-10-30";

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
  { name: "Promotions", url: "https://www.portaventuraworld.com/en/promotions", publisher: "PortAventura World" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "escapades/portaventura-des-de-barcelona",
    title: "PortAventura des de Barcelona: horaris i calendari 2026-2027, entrades i com anar-hi en tren",
    seoTitle: "PortAventura des de Barcelona: horaris i calendari 2026",
    seoDescription:
      "PortAventura obre cada dia fins al 6 de gener i tanca del 7 de gener al 18 de febrer de 2027. Entrades des de 43 €; tren R17 directe des de Sants.",
    excerpt: "Horaris i calendari de PortAventura Park, Ferrari Land i Caribe aquesta tardor i hivern, quant costen les entrades i quins trens hi arriben des de Barcelona.",
  },
  es: {
    path: "escapadas/portaventura-desde-barcelona",
    title: "PortAventura desde Barcelona: horarios y calendario 2026-2027, entradas y cómo ir en tren",
    seoTitle: "PortAventura desde Barcelona: horarios y calendario 2026",
    seoDescription:
      "PortAventura abre cada día hasta el 6 de enero y cierra del 7 de enero al 18 de febrero de 2027. Entradas desde 43 €; tren R17 directo desde Sants.",
    excerpt: "Horarios y calendario de PortAventura Park, Ferrari Land y Caribe este otoño e invierno, cuánto cuestan las entradas y qué trenes llegan desde Barcelona.",
  },
  en: {
    path: "day-trips/portaventura-from-barcelona",
    title: "PortAventura from Barcelona: opening times, calendar, tickets and the train",
    seoTitle: "PortAventura opening dates 2026-27 and train from Barcelona",
    seoDescription:
      "Open daily to 6 Jan, closed 7 Jan-18 Feb 2027, reopens 19 Feb, daily from 18 Mar. Tickets from €43; direct R17 train from Sants, 1 h 24.",
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
    lead: "**PortAventura Park** opens **every day until 6 January 2027**, usually **10:30 to 18:00**, and until 19:00 on some Christmas days, with the **Christmas season from 20 November to 6 January**. It is **closed from 7 January to 18 February 2027**; its calendar then shows it open on Friday evenings (16:00 to 21:00) and weekends (10:30 to 18:00) from 19 February, and daily from 18 March. One-day tickets start **from €43**, and three **direct R17 trains** a day run from Barcelona-Sants to the park's station, a 10-minute walk from the park, in 1 h 24.",
    calTitle: "PortAventura opening times and calendar 2026-2027",
    calCaption: "PortAventura Park opening times, November 2026 to March 2027",
    calHeaders: ["Dates", "Opening times"],
    calRows: [
      ["16 Nov – 6 Jan (Christmas from 20 Nov)", "Daily 10:30–18:00; until 19:00 on 5–7 Dec, 27–30 Dec and 1–4 Jan"],
      ["7 Jan – 18 Feb 2027", "Closed"],
      ["19 Feb – 17 Mar 2027", "Friday evenings 16:00–21:00 (19 and 26 Feb, 5 and 12 Mar) and Wednesday 17 Mar 16:00–21:00; weekends 10:30–18:00 (20–21 and 27–28 Feb, 6–7 and 13–14 Mar)"],
      ["From 18 Mar 2027", "Daily from 10:30; closing 18:00 on 18–19 Mar, 20:00 on 20 Mar and 25–28 Mar, 19:00 on 21–24 and 29–31 Mar (April and May are in the calendar too)"],
    ],
    calNote: "From PortAventura World's official opening calendar, read on 30 October and re-read on 23 November 2026 (November to January); on 25 November it also lists the hours for February to May 2027.",
    otherCaption: "Ferrari Land and Caribe Aquatic Park",
    otherHeaders: ["Park", "When it opens"],
    otherRows: [
      ["Ferrari Land", "In Nov and Dec: Fridays 17:00–22:00, weekends 16:30–22:00, closed Monday to Thursday except 7–8 Dec; daily from 19 Dec to 6 Jan (24 and 31 Dec and 6 Jan 13:00–19:00). Closed 7 Jan – 18 Mar 2027."],
      ["Caribe Aquatic Park", "Closed until 21 May 2027; reopens on 22 May 2027."],
    ],
    otherNote: "Official opening calendar, read on 30 October 2026; November and December re-read on 23 November.",
    ticketsTitle: "PortAventura ticket prices",
    tickets: [
      "Prices depend on the date. On the official site a one-day ticket for PortAventura Park starts **from €43** for adults (11 to 59) and €39 for juniors (4 to 10) and seniors (60 and over); one day in two parks, adding Ferrari Land, from €55 (€50 junior and senior); Ferrari Land alone from €19 (€17). On 23 November 2026 the official site showed those day tickets discounted online to €37 (€33 junior and senior) and €44 (€40) for two parks; promotions change, so check the price for your date. Buying at the ticket office costs **€10 more** for park and two-park tickets (€7 more for Ferrari Land alone).",
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
      { question: "What are PortAventura's opening hours?", answer: "PortAventura Park opens every day until 6 January 2027, 10:30 to 18:00, and until 19:00 on 5–7 December, 27–30 December and 1–4 January." },
      { question: "When does PortAventura close for the winter?", answer: "After 6 January 2027. PortAventura Park is closed from 7 January to 18 February 2027." },
      { question: "When does PortAventura reopen in 2027?", answer: "Its official calendar, read on 25 November 2026, shows PortAventura Park open from 19 February 2027: Friday evenings 16:00 to 21:00 and weekends 10:30 to 18:00 until 17 March, then daily from 18 March. Ferrari Land is marked open from 19 March and Caribe Aquatic Park from 22 May 2027." },
      { question: "Is PortAventura open in winter?", answer: "Yes until 6 January 2027, every day. It is closed from 7 January to 18 February 2027." },
      { question: "Is PortAventura open in January 2027?", answer: "Only from 1 to 6 January (10:30 to 19:00 on 1-4 January, to 18:00 on 5 and 6 January). From 7 January it is closed until it reopens on Friday 19 February 2027 (evening only)." },
      { question: "How much is a PortAventura ticket?", answer: "From €43 for an adult one-day ticket and €39 for children 4 to 10 and over-60s, depending on the date (online discounts can lower it: €37 and €33 on 23 November 2026); €10 more at the ticket office." },
      { question: "How far is the station from PortAventura?", answer: "Salou-Port Aventura station is about a 10-minute walk from the park, according to Renfe." },
      { question: "How do I get to PortAventura by train from Barcelona?", answer: "On one of the three direct R17 trains from Sants (8:33, 10:33 or 12:33, 1 h 24), or by regional train to Tarragona and the RT2 shuttle to Salou-Port Aventura." },
      { question: "When does Halloween at PortAventura end?", answer: "It ended on 15 November 2026. The Christmas season runs from 20 November 2026 to 6 January 2027." },
    ],
    note: "Park calendars and train services change: check PortAventura and Rodalies for your date.",
  },
  es: {
    lead: "**PortAventura Park** abre **cada día hasta el 6 de enero de 2027**, normalmente **de 10:30 a 18:00**, y hasta las 19:00 algunos días de Navidad, con la **temporada de Navidad del 20 de noviembre al 6 de enero**. Después **cierra del 7 de enero al 18 de febrero de 2027**; su calendario lo muestra abierto desde el 19 de febrero los viernes por la tarde (de 16:00 a 21:00) y los fines de semana (de 10:30 a 18:00), y cada día desde el 18 de marzo. Las entradas de un día van **desde 43 €**, y tres **trenes R17 directos** al día van de Barcelona-Sants a la estación del parque, a 10 minutos a pie, en 1 h 24.",
    calTitle: "Horarios y calendario de PortAventura 2026-2027",
    calCaption: "Horarios de PortAventura Park, de noviembre de 2026 a marzo de 2027",
    calHeaders: ["Fechas", "Horario"],
    calRows: [
      ["16 nov – 6 ene (Navidad desde el 20 nov)", "Cada día de 10:30 a 18:00; hasta las 19:00 el 5–7 dic, el 27–30 dic y el 1–4 ene"],
      ["7 ene – 18 feb 2027", "Cerrado"],
      ["19 feb – 17 mar 2027", "Viernes por la tarde de 16:00 a 21:00 (19 y 26 feb, 5 y 12 mar) y miércoles 17 mar de 16:00 a 21:00; fines de semana de 10:30 a 18:00 (20–21 y 27–28 feb, 6–7 y 13–14 mar)"],
      ["Desde el 18 mar 2027", "Cada día desde las 10:30; cierre a las 18:00 el 18–19 mar, a las 20:00 el 20 mar y el 25–28 mar, a las 19:00 el 21–24 y el 29–31 mar (abril y mayo también figuran en el calendario)"],
    ],
    calNote: "Del calendario oficial de apertura de PortAventura World, consultado el 30 de octubre y de nuevo el 23 de noviembre de 2026 (de noviembre a enero); el 25 de noviembre incluye también los horarios de febrero a mayo de 2027.",
    otherCaption: "Ferrari Land y Caribe Aquatic Park",
    otherHeaders: ["Parque", "Cuándo abre"],
    otherRows: [
      ["Ferrari Land", "En noviembre y diciembre: viernes de 17:00 a 22:00, fines de semana de 16:30 a 22:00, cerrado de lunes a jueves salvo el 7–8 dic; cada día del 19 dic al 6 ene (24 y 31 dic y 6 ene de 13:00 a 19:00). Cerrado del 7 ene al 18 mar 2027."],
      ["Caribe Aquatic Park", "Cerrado hasta el 21 de mayo de 2027; reabre el 22 de mayo de 2027."],
    ],
    otherNote: "Calendario oficial de apertura, consultado el 30 de octubre de 2026; noviembre y diciembre, de nuevo el 23 de noviembre.",
    ticketsTitle: "Precio de las entradas de PortAventura",
    tickets: [
      "Los precios dependen de la fecha. En la web oficial, la entrada de un día a PortAventura Park empieza **desde 43 €** para adultos (de 11 a 59 años) y 39 € para junior (de 4 a 10) y sénior (60 o más); un día en dos parques, con Ferrari Land, desde 55 € (50 € junior y sénior); Ferrari Land sola, desde 19 € (17 €). El 23 de noviembre de 2026 la web oficial mostraba esas entradas de un día con descuento en línea, a 37 € (33 € junior y sénior) y a 44 € (40 €) la de dos parques; las promociones cambian, así que mira el precio para tu fecha. Comprar en taquilla cuesta **10 € más** en las entradas de PortAventura Park y de dos parques (7 € más en Ferrari Land sola).",
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
      { question: "¿Qué horario tiene PortAventura?", answer: "PortAventura Park abre todos los días hasta el 6 de enero de 2027, de 10:30 a 18:00, y hasta las 19:00 el 5, 6 y 7 de diciembre, del 27 al 30 de diciembre y del 1 al 4 de enero." },
      { question: "¿Cuándo cierra PortAventura?", answer: "Después del 6 de enero de 2027. PortAventura Park está cerrado del 7 de enero al 18 de febrero de 2027." },
      { question: "¿Cuándo abre PortAventura en 2027?", answer: "Su calendario oficial, consultado el 25 de noviembre de 2026, muestra PortAventura Park abierto desde el 19 de febrero de 2027: viernes por la tarde de 16:00 a 21:00 y fines de semana de 10:30 a 18:00 hasta el 17 de marzo, y cada día desde el 18 de marzo. Ferrari Land figura abierto desde el 19 de marzo y Caribe Aquatic Park, desde el 22 de mayo de 2027." },
      { question: "¿Abre PortAventura en invierno?", answer: "Sí hasta el 6 de enero de 2027, todos los días. Cierra del 7 de enero al 18 de febrero de 2027." },
      { question: "¿Cuánto cuesta la entrada a PortAventura?", answer: "Desde 43 € la entrada de adulto de un día y 39 € para niños de 4 a 10 años y mayores de 60, según la fecha (los descuentos en línea pueden bajarlo: 37 € y 33 € el 23 de noviembre de 2026); 10 € más en taquilla." },
      { question: "¿A qué distancia está la estación de PortAventura?", answer: "La estación de Salou-Port Aventura está a unos 10 minutos a pie del parque, según Renfe." },
      { question: "¿Cómo se va a PortAventura en tren desde Barcelona?", answer: "En uno de los tres R17 directos desde Sants (8:33, 10:33 o 12:33, 1 h 24), o en regional hasta Tarragona y la lanzadera RT2 hasta Salou-Port Aventura." },
      { question: "¿Cuándo termina Halloween en PortAventura?", answer: "Terminó el 15 de noviembre de 2026. La temporada de Navidad va del 20 de noviembre de 2026 al 6 de enero de 2027." },
    ],
    note: "Los calendarios de los parques y los trenes cambian: consulta PortAventura y Rodalies para tu fecha.",
  },
  ca: {
    lead: "**PortAventura Park** obre **cada dia fins al 6 de gener de 2027**, normalment **de 10:30 a 18:00**, i fins a les 19:00 alguns dies de Nadal, amb la **temporada de Nadal del 20 de novembre al 6 de gener**. Després **tanca del 7 de gener al 18 de febrer de 2027**; el seu calendari el mostra obert des del 19 de febrer els divendres a la tarda (de 16:00 a 21:00) i els caps de setmana (de 10:30 a 18:00), i cada dia des del 18 de març. Les entrades d'un dia van **des de 43 €**, i tres **trens R17 directes** al dia van de Barcelona-Sants a l'estació del parc, a 10 minuts a peu, en 1 h 24.",
    calTitle: "Horaris i calendari de PortAventura 2026-2027",
    calCaption: "Horaris de PortAventura Park, de novembre de 2026 a març de 2027",
    calHeaders: ["Dates", "Horari"],
    calRows: [
      ["16 nov – 6 gen (Nadal des del 20 nov)", "Cada dia de 10:30 a 18:00; fins a les 19:00 el 5–7 des, el 27–30 des i l'1–4 gen"],
      ["7 gen – 18 febr 2027", "Tancat"],
      ["19 febr – 17 març 2027", "Divendres a la tarda de 16:00 a 21:00 (19 i 26 febr, 5 i 12 març) i dimecres 17 març de 16:00 a 21:00; caps de setmana de 10:30 a 18:00 (20–21 i 27–28 febr, 6–7 i 13–14 març)"],
      ["Des del 18 març 2027", "Cada dia des de les 10:30; tancament a les 18:00 el 18–19 març, a les 20:00 el 20 març i el 25–28 març, a les 19:00 el 21–24 i el 29–31 març (abril i maig també hi són al calendari)"],
    ],
    calNote: "Del calendari oficial d'obertura de PortAventura World, consultat el 30 d'octubre i de nou el 23 de novembre de 2026 (de novembre a gener); el 25 de novembre inclou també els horaris de febrer a maig de 2027.",
    otherCaption: "Ferrari Land i Caribe Aquatic Park",
    otherHeaders: ["Parc", "Quan obre"],
    otherRows: [
      ["Ferrari Land", "Al novembre i desembre: divendres de 17:00 a 22:00, caps de setmana de 16:30 a 22:00, tancat de dilluns a dijous llevat del 7–8 des; cada dia del 19 des al 6 gen (24 i 31 des i 6 gen de 13:00 a 19:00). Tancat del 7 gen al 18 març 2027."],
      ["Caribe Aquatic Park", "Tancat fins al 21 de maig de 2027; reobre el 22 de maig de 2027."],
    ],
    otherNote: "Calendari oficial d'obertura, consultat el 30 d'octubre de 2026; novembre i desembre, de nou el 23 de novembre.",
    ticketsTitle: "Preu de les entrades de PortAventura",
    tickets: [
      "Els preus depenen de la data. Al web oficial, l'entrada d'un dia a PortAventura Park comença **des de 43 €** per a adults (d'11 a 59 anys) i 39 € per a júnior (de 4 a 10) i sènior (60 o més); un dia a dos parcs, amb Ferrari Land, des de 55 € (50 € júnior i sènior); Ferrari Land sola, des de 19 € (17 €). El 23 de novembre de 2026 el web oficial mostrava aquestes entrades d'un dia amb descompte en línia, a 37 € (33 € júnior i sènior) i a 44 € (40 €) la de dos parcs; les promocions canvien, així que mira el preu per a la teva data. Comprar a taquilla costa **10 € més** a les entrades de PortAventura Park i de dos parcs (7 € més a Ferrari Land sola).",
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
      { question: "Quin horari té PortAventura?", answer: "PortAventura Park obre cada dia fins al 6 de gener de 2027, de 10:30 a 18:00, i fins a les 19:00 el 5, 6 i 7 de desembre, del 27 al 30 de desembre i de l'1 al 4 de gener." },
      { question: "Quan tanca PortAventura?", answer: "Després del 6 de gener de 2027. PortAventura Park és tancat del 7 de gener al 18 de febrer de 2027." },
      { question: "Quan obre PortAventura el 2027?", answer: "El seu calendari oficial, consultat el 25 de novembre de 2026, mostra PortAventura Park obert des del 19 de febrer de 2027: divendres a la tarda de 16:00 a 21:00 i caps de setmana de 10:30 a 18:00 fins al 17 de març, i cada dia des del 18 de març. Ferrari Land hi figura obert des del 19 de març i Caribe Aquatic Park, des del 22 de maig de 2027." },
      { question: "Obre PortAventura a l'hivern?", answer: "Sí fins al 6 de gener de 2027, cada dia. Tanca del 7 de gener al 18 de febrer de 2027." },
      { question: "Quant costa l'entrada a PortAventura?", answer: "Des de 43 € l'entrada d'adult d'un dia i 39 € per a infants de 4 a 10 anys i majors de 60, segons la data (els descomptes en línia el poden abaixar: 37 € i 33 € el 23 de novembre de 2026); 10 € més a taquilla." },
      { question: "A quina distància és l'estació de PortAventura?", answer: "L'estació de Salou-Port Aventura és a uns 10 minuts a peu del parc, segons Renfe." },
      { question: "Com s'hi va a PortAventura en tren des de Barcelona?", answer: "Amb un dels tres R17 directes des de Sants (8:33, 10:33 o 12:33, 1 h 24), o amb regional fins a Tarragona i la llançadora RT2 fins a Salou-Port Aventura." },
      { question: "Quan acaba Halloween a PortAventura?", answer: "Va acabar el 15 de novembre de 2026. La temporada de Nadal va del 20 de novembre de 2026 al 6 de gener de 2027." },
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

const PORTAVENTURA_BASE: B2Article = {
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

/** With the dated transport re-read of 25 Nov 2026 under the first callout (day-trip-glance.ts). */
export const PORTAVENTURA: B2Article = withGlance(PORTAVENTURA_BASE, "portaventura");
