import type { Locale } from "@/lib/i18n/config";
import { hubPath as rodaliesHub } from "@/lib/programmatic/rodalies/paths";

import {
  b2Related,
  b2link,
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
 * Barcelona metro, night bus, tram and Montjuïc funicular hours.
 *
 * Re-checked 28 Oct 2026 on TMB's hours page (CA and EN), tram.cat (FAQ and
 * lines) and TMB's 22 Oct 2026 Tots Sants release (buses only, no metro
 * change). TMB says: Mon-Thu and midweek holidays 5:00-24:00; Fridays and the
 * eves of midweek holidays 5:00-2:00; Saturday from 5:00 non-stop into
 * Sunday; Sunday until 24:00; all night on 23 June, 23 September and 31
 * December; 5:00-23:00 on 24 December. The earlier copy said the metro "opens
 * at 5:00 every day", which is wrong for Sunday: it never closed. Funicular
 * winter timetable 26 Oct 2026 - 28 Mar 2027 from the same TMB page. NitBus
 * hours from AMB (checked 12 Oct 2026); TMB's hours page says every NitBus
 * line except the N0 and N19 goes through Plaça de Catalunya.
 *
 * Left out: daytime bus hours (TMB publishes them stop by stop), FGC and
 * Rodalies first and last trains, Christmas 2026 and 5 January hours (not
 * announced), and the line count of the NitBus (not re-read today).
 *
 * Re-read 30 Oct 2026 on TMB's EN hours page: same rules, the funicular dates,
 * and one rule the page had left out: Mas Blau, Mercabarna and Parc Logístic
 * (L9 Sud) and ZAL | Riu Vell, Ecoparc, Port Comercial and La Factoria (L10
 * Sud) run 5:00-24:00 every day (23:00 on 24 December), so they do not stay
 * open until 2:00 on Fridays or all night on Saturdays. TMB still lists no
 * special hours for 5 January; none are printed. "Every 20 minutes on every
 * line" became "on most lines": AMB's airport lines N17 and N18 run every 15
 * minutes (see the airport guide).
 */

const VERIFIED = "2026-10-30";

const SOURCES: B2Source[] = [
  { name: "Metro opening hours", url: "https://www.tmb.cat/en/barcelona-transport/operating-hours-metro-bus", publisher: "TMB" },
  { name: "Horaris de metro, bus i funicular de Montjuïc", url: "https://www.tmb.cat/ca/transport-barcelona/horari-metro-bus", publisher: "TMB" },
  { name: "NitBus — line search", url: "https://www.ambmobilitat.cat/principales/busquedanitbus.aspx", publisher: "Àrea Metropolitana de Barcelona" },
  { name: "TRAM — lines and timetables", url: "https://tram.cat/ca/linies-i-horaris", publisher: "TRAM" },
  { name: "TRAM — preguntes freqüents (horaris)", url: "https://tram.cat/ca/faq", publisher: "TRAM" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/horaris-metro-barcelona",
    title: "Horari del metro de Barcelona: a quina hora obre i tanca avui, divendres, dissabte i diumenge",
    seoTitle: "Horari metro Barcelona avui: a quina hora obre i tanca",
    seoDescription:
      "Obre a les 5:00 i tanca a les 24:00 de diumenge a dijous, a les 2:00 el divendres i tota la nit el dissabte. Horari d'avui, tramvia, funicular i NitBus.",
    excerpt:
      "A quina hora obre i tanca el metro de Barcelona avui i cada dia, les nits que funciona sense parar, i com moure's quan tanca: NitBus, tramvia i funicular.",
  },
  es: {
    path: "guias/horarios-metro-barcelona",
    title: "Horario del metro de Barcelona: a qué hora abre y cierra hoy, viernes, sábado y domingo",
    seoTitle: "Horario metro Barcelona hoy: a qué hora abre y cierra",
    seoDescription:
      "Abre a las 5:00 y cierra a las 24:00 de domingo a jueves, a las 2:00 el viernes y toda la noche el sábado. Horario de hoy, tranvía, funicular y NitBus.",
    excerpt:
      "A qué hora abre y cierra el metro de Barcelona hoy y cada día, las noches que funciona sin parar, y cómo moverse cuando cierra: NitBus, tranvía y funicular.",
  },
  en: {
    path: "guides/barcelona-metro-hours",
    title: "Barcelona metro hours: what time it closes tonight, and when it runs all night",
    seoTitle: "Barcelona metro hours: closes 12am, 2am Fri, all night Sat",
    seoDescription:
      "Last metro at midnight Sunday to Thursday and 2:00 on Fridays; on Saturdays it runs all night. Opens at 5:00. Closing time tonight, special nights, NitBus.",
    excerpt:
      "When the Barcelona metro opens and closes each day, the nights it runs non-stop, and how to get around once it shuts: NitBus, tram and funicular.",
  },
};

type T = {
  lead: string;
  tableTitle: string;
  tableCaption: string;
  headers: string[];
  rows: string[][];
  tableNote: string;
  fridayTitle: string;
  friday: string;
  sundayTitle: string;
  sunday: string;
  closeTitle: string;
  close: string;
  specialTitle: string;
  special: string[];
  nightTitle: string;
  night: string[];
  tramTitle: string;
  tramCaption: string;
  tramHeaders: string[];
  tramRows: string[][];
  tram: string;
  funicularTitle: string;
  funicular: string;
  tipsTitle: string;
  tips: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "The last Barcelona metro leaves at **midnight** from Sunday to Thursday and at **2:00** on Friday nights and the nights before midweek public holidays; on **Saturday it runs all night** into Sunday. It opens at **5:00** Monday to Saturday (on Sunday morning it is already running). When it is closed, the **NitBus** night buses take over.",
    tableTitle: "Barcelona metro hours by day",
    tableCaption: "Metro opening hours",
    headers: ["Day", "Opens", "Closes"],
    rows: [
      ["Monday to Thursday", "5:00", "Midnight (24:00)"],
      ["Friday", "5:00", "2:00 (early Saturday)"],
      ["Saturday", "5:00", "Runs all night"],
      ["Sunday", "Running since Saturday night", "Midnight (24:00)"],
      ["Public holiday Monday to Thursday", "5:00", "Midnight (24:00)"],
      ["Night before a midweek public holiday", "5:00", "2:00"],
      ["Mas Blau, Mercabarna, Parc Logístic (L9 Sud) and ZAL | Riu Vell, Ecoparc, Port Comercial, La Factoria (L10 Sud)", "5:00 (all week)", "Midnight, all week (23:00 on 24 December)"],
    ],
    tableNote: "From TMB's hours page, checked on 30 October 2026. The seven stations in the last row keep 5:00 to midnight all week: no 2:00 close on Fridays and no all-night Saturday.",
    fridayTitle: "What time does the metro close on Fridays?",
    friday: "At **2:00** in the early hours of Saturday. The same 2:00 closing applies on the night before a public holiday that falls Monday to Friday.",
    sundayTitle: "Metro hours on Sundays and public holidays",
    sunday: `On Sunday the metro does not open at 5:00, because it has been running non-stop since Saturday night; it closes at **midnight**. A public holiday from Monday to Thursday also runs from 5:00 to midnight, and the night before it the metro closes at 2:00; the dates are in ${b2link("workCalendar", "en", "the Catalonia public holiday calendar")}.`,
    closeTitle: "What time is the last metro in Barcelona?",
    close: "The last trains leave the terminal stations at **midnight** from Sunday to Thursday and at **2:00** on Fridays and the nights before midweek holidays; on Saturday nights there is no last train. TMB's closing time is when the last train leaves the terminal station at each end of the line, so a station in the middle sees its last train later than that. If you are cutting it fine, aim for the earlier end of the line.",
    specialTitle: "Does the Barcelona metro run 24 hours?",
    special: [
      "**Every Saturday night**, from Saturday morning to Sunday at midnight without a break.",
      "**All night as well:** 23 June (Sant Joan), 23 September (La Mercè) and 31 December (New Year's Eve).",
      "**Early close:** on 24 December the metro runs from 5:00 to 23:00.",
      "TMB can change these at short notice: on Saturday 3 October 2026 it closed at midnight instead of running all night because of the weather, and during La Mercè it added extra all-night service. Check TMB's news before a big night.",
    ],
    nightTitle: "NitBus: Barcelona night buses after the metro closes",
    night: [
      "The AMB's **NitBus** network runs from about **22:30 to 6:00 every night of the year**, about every 20 minutes on most lines (the airport lines N17 and N18 run every 15). Every line except the N0 and N19 goes through **Plaça de Catalunya**, the network's hub.",
      "The Hola Barcelona travel card includes the NitBus. If you hold another pass, check its conditions before relying on it at night.",
    ],
    tramTitle: "Barcelona tram hours",
    tramCaption: "Tram (Trambaix and Trambesòs) hours",
    tramHeaders: ["Day", "Hours"],
    tramRows: [
      ["Monday to Thursday, Sundays and public holidays", "5:00 to midnight"],
      ["Fridays, Saturdays and nights before a holiday", "5:00 to 2:00"],
      ["Nights before 1 January, 24 June and 24 September", "From 5:00, all night"],
      ["24 December", "5:00 to 22:30"],
    ],
    tram: "Unlike the metro, the tram does **not** run all night on Saturdays: it stops at 2:00.",
    funicularTitle: "Montjuïc funicular hours",
    funicular: "The funicular from Paral·lel up Montjuïc is part of the metro network. From 26 October 2026 to 28 March 2027 it runs **7:30 to 20:00 on weekdays** and **9:00 to 20:00 on Saturdays, Sundays and holidays**; from 29 March 2027 it runs until 22:00.",
    tipsTitle: "Tips",
    tips: [
      "**Friday after midnight:** you have until about 2:00 on the metro; after that, NitBus.",
      "**Arriving late at the airport:** the airport metro follows the same hours; after it closes, use the NitBus.",
      "**Christmas and New Year:** TMB announces the exact hours in December; New Year's Eve has run all night in recent years.",
      `**Strike days:** if a strike covers TMB, the metro runs the minimum service the Generalitat sets; see ${b2link("strikes", "en", "what runs on strike days")}.`,
      `**Rodalies:** if your trip continues by train, check [Rodalies disruptions today](${rodaliesHub("en")}) first.`,
    ],
    faq: [
      { question: "What time does the Barcelona metro close?", answer: "At midnight from Sunday to Thursday, at 2:00 on Fridays and the night before a midweek public holiday; on Saturdays it runs all night." },
      { question: "What time is the last metro in Barcelona?", answer: "The last trains leave the end stations at midnight from Sunday to Thursday and at 2:00 on Friday nights; stations in the middle of a line see them a little later. On Saturday nights the metro does not stop." },
      { question: "Does the Barcelona metro run 24 hours?", answer: "Only on Saturday nights and a few special nights: 23 June, 23 September and 31 December. Seven outer stations on L9 Sud and L10 Sud (Mas Blau, Mercabarna, Parc Logístic, ZAL | Riu Vell, Ecoparc, Port Comercial and La Factoria) keep 5:00 to midnight every day, Saturdays included." },
      { question: "How late does the Barcelona metro run on Saturday?", answer: "All night: it opens at 5:00 on Saturday and runs without a break until midnight on Sunday." },
      { question: "What time does the Barcelona metro open?", answer: "At 5:00 Monday to Saturday. On Sunday it is already running, because it ran all through Saturday night." },
      { question: "What time does the metro close on Sundays?", answer: "At midnight." },
      { question: "What are the Barcelona tram hours?", answer: "5:00 to midnight Monday to Thursday, Sundays and holidays; 5:00 to 2:00 on Fridays, Saturdays and nights before a holiday." },
      { question: "How do I get around Barcelona at night?", answer: "On the NitBus: from about 22:30 to 6:00 every night, about every 20 minutes on most lines, almost every line through Plaça de Catalunya." },
    ],
    note: "Special-night hours change from year to year: check TMB before a big night out.",
  },
  es: {
    lead: "El metro de Barcelona abre a las **5:00** de lunes a sábado y cierra a **medianoche (24:00)** de domingo a jueves y a las **2:00** las noches del viernes y las vísperas de festivo entre semana. La noche del **sábado funciona sin parar** hasta el domingo, así que el domingo por la mañana ya está abierto. Cuando cierra, toman el relevo los autobuses nocturnos **NitBus**.",
    tableTitle: "Horario del metro de Barcelona por días",
    tableCaption: "Horario del metro",
    headers: ["Día", "Abre", "Cierra"],
    rows: [
      ["De lunes a jueves", "5:00", "24:00 (medianoche)"],
      ["Viernes", "5:00", "2:00 (madrugada del sábado)"],
      ["Sábado", "5:00", "Toda la noche, sin cierre"],
      ["Domingo", "Abierto desde el sábado", "24:00 (medianoche)"],
      ["Festivo de lunes a jueves", "5:00", "24:00 (medianoche)"],
      ["Víspera de festivo entre semana", "5:00", "2:00"],
      ["Mas Blau, Mercabarna, Parc Logístic (L9 Sud) y ZAL | Riu Vell, Ecoparc, Port Comercial, La Factoria (L10 Sud)", "5:00 (toda la semana)", "24:00, toda la semana (23:00 el 24 de diciembre)"],
    ],
    tableNote: "De la página de horarios de TMB, comprobada el 30 de octubre de 2026. Las siete estaciones de la última fila mantienen de 5:00 a 24:00 toda la semana: ni cierre a las 2:00 el viernes ni noche entera el sábado.",
    fridayTitle: "¿A qué hora cierra el metro los viernes?",
    friday: "A las **2:00** de la madrugada del sábado. El mismo cierre a las 2:00 se aplica la víspera de un festivo que cae de lunes a viernes.",
    sundayTitle: "Horario del metro el domingo y los festivos",
    sunday: "El domingo el metro no abre a las 5:00 porque funciona sin parar desde la noche del sábado; cierra a **medianoche**. Un festivo de lunes a jueves también funciona de 5:00 a medianoche, y la víspera el metro cierra a las 2:00: las fechas están en [el calendario de festivos de Barcelona](/es/festivos/barcelona/).",
    closeTitle: "¿A qué hora pasa el último metro?",
    close: "Los últimos trenes salen de las cabeceras a las **24:00** de domingo a jueves y a las **2:00** los viernes y vísperas de festivo entre semana; la noche del sábado no hay último tren. La hora de cierre de TMB es la de salida del último tren desde la estación de cabecera de cada extremo de la línea, así que en una estación intermedia el último tren pasa más tarde. Si vas justo, cuenta con el extremo que salga antes.",
    specialTitle: "¿Hay metro toda la noche?",
    special: [
      "**Todos los sábados**, desde las 5:00 del sábado hasta la medianoche del domingo sin interrupción.",
      "**También toda la noche:** el 23 de junio (Sant Joan), el 23 de septiembre (La Mercè) y el 31 de diciembre (Nochevieja).",
      "**Cierre anticipado:** el 24 de diciembre el metro funciona de 5:00 a 23:00.",
      "TMB puede cambiarlo con poco aviso: el sábado 3 de octubre de 2026 cerró a medianoche en vez de funcionar toda la noche por el mal tiempo, y en La Mercè añadió noches sin cierre. Consulta las noticias de TMB antes de una noche señalada.",
    ],
    nightTitle: "Cuando cierra el metro: NitBus",
    night: [
      "La red **NitBus** del AMB funciona aproximadamente de **22:30 a 6:00 todas las noches del año**, cada 20 minutos aproximadamente en la mayoría de líneas (las del aeropuerto, N17 y N18, cada 15). Todas las líneas excepto la N0 y la N19 pasan por **plaza Catalunya**, el centro de la red.",
      "La Hola Barcelona incluye el NitBus. Si tienes otro título, comprueba sus condiciones antes de contar con él de noche.",
    ],
    tramTitle: "Horario del tranvía de Barcelona",
    tramCaption: "Horario del tranvía (Trambaix y Trambesòs)",
    tramHeaders: ["Día", "Horario"],
    tramRows: [
      ["De lunes a jueves, domingos y festivos", "De 5:00 a 24:00"],
      ["Viernes, sábados y vísperas de festivo", "De 5:00 a 2:00"],
      ["Vísperas del 1 de enero, el 24 de junio y el 24 de septiembre", "Desde las 5:00, toda la noche"],
      ["24 de diciembre", "De 5:00 a 22:30"],
    ],
    tram: "A diferencia del metro, el tranvía **no** funciona toda la noche el sábado: para a las 2:00.",
    funicularTitle: "Horario del funicular de Montjuïc",
    funicular: "El funicular que sube a Montjuïc desde Paral·lel forma parte de la red de metro. Del 26 de octubre de 2026 al 28 de marzo de 2027 funciona **de 7:30 a 20:00 los laborables** y **de 9:00 a 20:00 sábados, domingos y festivos**; desde el 29 de marzo de 2027, hasta las 22:00.",
    tipsTitle: "Consejos",
    tips: [
      "**Viernes después de medianoche:** tienes metro hasta las 2:00 aproximadamente; después, NitBus.",
      "**Llegada tarde al aeropuerto:** el metro del aeropuerto sigue el mismo horario; cuando cierra, queda el NitBus.",
      "**Navidad y Fin de Año:** TMB anuncia el horario exacto en diciembre; los últimos años la Nochevieja ha funcionado toda la noche.",
      `**Días de huelga:** si la huelga afecta a TMB, el metro funciona con los servicios mínimos que fija la Generalitat; mira ${b2link("strikes", "es", "qué funciona los días de huelga")}.`,
      `**Rodalies:** si sigues el viaje en tren, mira antes [las incidencias de Rodalies hoy](${rodaliesHub("es")}).`,
    ],
    faq: [
      { question: "¿A qué hora cierra el metro de Barcelona hoy?", answer: "Depende del día: a medianoche de domingo a jueves, a las 2:00 los viernes y vísperas de festivo entre semana, y el sábado no cierra en toda la noche. Arriba tienes el horario de hoy y de mañana." },
      { question: "¿A qué hora abre el metro de Barcelona?", answer: "A las 5:00 de lunes a sábado. El domingo ya está abierto, porque funciona toda la noche del sábado." },
      { question: "¿Hay metro toda la noche?", answer: "Solo la noche del sábado y algunas noches especiales: 23 de junio, 23 de septiembre y 31 de diciembre. Siete estaciones de los extremos de la L9 Sud y la L10 Sud (Mas Blau, Mercabarna, Parc Logístic, ZAL | Riu Vell, Ecoparc, Port Comercial y La Factoria) mantienen de 5:00 a 24:00 todos los días, sábados incluidos." },
      { question: "¿Hasta qué hora funciona el metro hoy?", answer: "Hasta las 24:00 de domingo a jueves, hasta las 2:00 el viernes y las vísperas de festivo entre semana, y toda la noche el sábado. El recuadro del principio dice el cierre de esta noche." },
      { question: "¿A qué hora cierra el metro los viernes?", answer: "A las 2:00 de la madrugada del sábado." },
      { question: "¿Hasta qué hora funciona el metro el domingo?", answer: "Hasta medianoche (24:00)." },
      { question: "¿Cuál es el horario del tranvía de Barcelona?", answer: "De 5:00 a 24:00 de lunes a jueves, domingos y festivos, y de 5:00 a 2:00 los viernes, sábados y vísperas de festivo." },
      { question: "¿Cómo moverse por Barcelona de noche?", answer: "Con el NitBus: aproximadamente de 22:30 a 6:00 todas las noches, cada 20 minutos en la mayoría de líneas, casi todas por plaza Catalunya." },
    ],
    note: "El horario de las noches especiales cambia cada año: consulta TMB antes de una noche señalada.",
  },
  ca: {
    lead: "El metro de Barcelona obre a les **5:00** de dilluns a dissabte i tanca a **mitjanit (24:00)** de diumenge a dijous i a les **2:00** les nits de divendres i les vigílies de festiu entre setmana. La nit del **dissabte funciona sense parar** fins al diumenge, així que el diumenge al matí ja és obert. Quan tanca, agafen el relleu els autobusos nocturns **NitBus**.",
    tableTitle: "Horari del metro de Barcelona per dies",
    tableCaption: "Horari del metro",
    headers: ["Dia", "Obre", "Tanca"],
    rows: [
      ["De dilluns a dijous", "5:00", "24:00 (mitjanit)"],
      ["Divendres", "5:00", "2:00 (matinada del dissabte)"],
      ["Dissabte", "5:00", "Tota la nit, sense tancar"],
      ["Diumenge", "Obert des del dissabte", "24:00 (mitjanit)"],
      ["Festiu de dilluns a dijous", "5:00", "24:00 (mitjanit)"],
      ["Vigília de festiu entre setmana", "5:00", "2:00"],
      ["Mas Blau, Mercabarna, Parc Logístic (L9 Sud) i ZAL | Riu Vell, Ecoparc, Port Comercial, La Factoria (L10 Sud)", "5:00 (tota la setmana)", "24:00, tota la setmana (23:00 el 24 de desembre)"],
    ],
    tableNote: "De la pàgina d'horaris de TMB, comprovada el 30 d'octubre de 2026. Les set estacions de l'última fila mantenen de 5:00 a 24:00 tota la setmana: ni tancament a les 2:00 el divendres ni nit sencera el dissabte.",
    fridayTitle: "A quina hora tanca el metro els divendres?",
    friday: "A les **2:00** de la matinada del dissabte. El mateix tancament a les 2:00 s'aplica la vigília d'un festiu que cau de dilluns a divendres.",
    sundayTitle: "Horari del metro el diumenge i els festius",
    sunday: "El diumenge el metro no obre a les 5:00 perquè funciona sense parar des de la nit del dissabte; tanca a **mitjanit**. Un festiu de dilluns a dijous també funciona de 5:00 a mitjanit, i la vigília el metro tanca a les 2:00: les dates són al [calendari de festius de Barcelona](/ca/festius/barcelona/).",
    closeTitle: "A quina hora passa l'últim metro?",
    close: "Els últims trens surten de les capçaleres a les **24:00** de diumenge a dijous i a les **2:00** els divendres i vigílies de festiu entre setmana; la nit del dissabte no hi ha últim tren. L'hora de tancament de TMB és la de sortida de l'últim tren des de l'estació de capçalera de cada extrem de la línia, així que en una estació del mig l'últim tren hi passa més tard. Si vas just, compta amb l'extrem que surti abans.",
    specialTitle: "Hi ha metro tota la nit?",
    special: [
      "**Tots els dissabtes**, des de les 5:00 del dissabte fins a la mitjanit del diumenge sense interrupció.",
      "**També tota la nit:** el 23 de juny (Sant Joan), el 23 de setembre (la Mercè) i el 31 de desembre (Cap d'Any).",
      "**Tancament avançat:** el 24 de desembre el metro funciona de 5:00 a 23:00.",
      "TMB ho pot canviar amb poc avís: el dissabte 3 d'octubre de 2026 va tancar a mitjanit en lloc de funcionar tota la nit pel mal temps, i per la Mercè va afegir nits sense tancament. Consulta les notícies de TMB abans d'una nit assenyalada.",
    ],
    nightTitle: "Quan tanca el metro: NitBus",
    night: [
      "La xarxa **NitBus** de l'AMB funciona aproximadament de **22:30 a 6:00 totes les nits de l'any**, cada 20 minuts aproximadament a la majoria de línies (les de l'aeroport, N17 i N18, cada 15). Totes les línies excepte la N0 i la N19 passen per la **plaça de Catalunya**, el centre de la xarxa.",
      "La Hola Barcelona inclou el NitBus. Si tens un altre títol, comprova'n les condicions abans de comptar-hi de nit.",
    ],
    tramTitle: "Horari del tramvia de Barcelona",
    tramCaption: "Horari del tramvia (Trambaix i Trambesòs)",
    tramHeaders: ["Dia", "Horari"],
    tramRows: [
      ["De dilluns a dijous, diumenges i festius", "De 5:00 a 24:00"],
      ["Divendres, dissabtes i vigílies de festiu", "De 5:00 a 2:00"],
      ["Vigílies de l'1 de gener, el 24 de juny i el 24 de setembre", "Des de les 5:00, tota la nit"],
      ["24 de desembre", "De 5:00 a 22:30"],
    ],
    tram: "A diferència del metro, el tramvia **no** funciona tota la nit el dissabte: para a les 2:00.",
    funicularTitle: "Horari del funicular de Montjuïc",
    funicular: "El funicular que puja a Montjuïc des del Paral·lel forma part de la xarxa de metro. Del 26 d'octubre de 2026 al 28 de març de 2027 funciona **de 7:30 a 20:00 els feiners** i **de 9:00 a 20:00 dissabtes, diumenges i festius**; des del 29 de març de 2027, fins a les 22:00.",
    tipsTitle: "Consells",
    tips: [
      "**Divendres després de mitjanit:** tens metro fins a les 2:00 aproximadament; després, NitBus.",
      "**Arribada tard a l'aeroport:** el metro de l'aeroport segueix el mateix horari; quan tanca, queda el NitBus.",
      "**Nadal i Cap d'Any:** TMB anuncia l'horari exacte al desembre; els últims anys la nit de Cap d'Any ha funcionat tota la nit.",
      `**Dies de vaga:** si la vaga afecta TMB, el metro funciona amb els serveis mínims que fixa la Generalitat; mira ${b2link("strikes", "ca", "què funciona els dies de vaga")}.`,
      `**Rodalies:** si continues el viatge en tren, mira abans [les incidències de Rodalies avui](${rodaliesHub("ca")}).`,
    ],
    faq: [
      { question: "A quina hora tanca el metro de Barcelona avui?", answer: "Depèn del dia: a mitjanit de diumenge a dijous, a les 2:00 els divendres i vigílies de festiu entre setmana, i el dissabte no tanca en tota la nit. A dalt tens l'horari d'avui i de demà." },
      { question: "A quina hora obre el metro de Barcelona?", answer: "A les 5:00 de dilluns a dissabte. El diumenge ja és obert, perquè funciona tota la nit del dissabte." },
      { question: "Hi ha metro tota la nit?", answer: "Només la nit del dissabte i algunes nits especials: 23 de juny, 23 de setembre i 31 de desembre. Set estacions dels extrems de la L9 Sud i la L10 Sud (Mas Blau, Mercabarna, Parc Logístic, ZAL | Riu Vell, Ecoparc, Port Comercial i La Factoria) mantenen de 5:00 a 24:00 cada dia, dissabtes inclosos." },
      { question: "Quin és l'horari del metro el divendres?", answer: "De 5:00 a 2:00 de la matinada del dissabte." },
      { question: "Quin és l'horari del metro el dissabte?", answer: "Obre a les 5:00 i no tanca fins a la mitjanit del diumenge." },
      { question: "Quin és l'horari del tramvia de Barcelona?", answer: "De 5:00 a 24:00 de dilluns a dijous, diumenges i festius, i de 5:00 a 2:00 els divendres, dissabtes i vigílies de festiu." },
      { question: "Com moure's per Barcelona de nit?", answer: "Amb el NitBus: aproximadament de 22:30 a 6:00 totes les nits, cada 20 minuts a la majoria de línies, gairebé totes per la plaça de Catalunya." },
    ],
    note: "L'horari de les nits especials canvia cada any: consulta TMB abans d'una nit assenyalada.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    { type: "metroTonight" as const },
    ...h2(t.tableTitle),
    table(t.tableCaption, t.headers, t.rows, t.tableNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.fridayTitle, t.friday),
    ...h2(t.sundayTitle, t.sunday),
    ...h2(t.specialTitle),
    list(...t.special),
    ...h2(t.closeTitle, t.close),
    ...h2(t.nightTitle, ...t.night),
    ...h2(t.tramTitle),
    table(t.tramCaption, t.tramHeaders, t.tramRows),
    ...paras(t.tram),
    ...h2(t.funicularTitle, t.funicular),
    ...h2(t.tipsTitle),
    list(...t.tips),
    faq(t.faq),
    ...b2Related(["transport", "airport", "cards"], locale),
  ];
}

export const HOURS: B2Article = {
  key: "hours",
  entryKey: "guide-barcelona-metro-hours",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "horaris-metro-catalunya-l1",
  heroAlt: {
    ca: "Andana de la línia 1 a l'estació de Catalunya, amb un tren arribant",
    es: "Andén de la línea 1 en la estación de Catalunya, con un tren llegando",
    en: "Line 1 platform at Catalunya station, with a train pulling in",
  },
  heroCaption: {
    ca: "El metro tanca a mitjanit entre setmana i no tanca la nit del dissabte.",
    es: "El metro cierra a medianoche entre semana y no cierra la noche del sábado.",
    en: "The metro closes at midnight on weeknights and runs all night on Saturdays.",
  },
  secondaryKey: "horaris-nitbus-n5",
  secondaryAlt: {
    ca: "Un autobús nocturn de la línia N5 amb passatgers, de nit",
    es: "Un autobús nocturno de la línea N5 con pasajeros, de noche",
    en: "An N5 night bus with passengers at night",
  },
  secondaryCaption: {
    ca: "El NitBus cobreix les hores en què el metro és tancat.",
    es: "El NitBus cubre las horas en que el metro está cerrado.",
    en: "The NitBus covers the hours when the metro is closed.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T21:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as HOURS_META };
