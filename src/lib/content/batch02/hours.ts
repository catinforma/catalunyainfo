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
 * Barcelona metro, night bus and tram hours.
 *
 * Metro hours from TMB's hours page, NitBus from AMB, tram from TRAM, all
 * checked on 12 Oct 2026 (research_notes/blog-batch-03/hours.md). Left out:
 * daytime bus hours (TMB publishes them stop by stop, not as a rule), FGC and
 * Rodalies first and last trains (line-by-line PDFs, several with works this
 * year), and Christmas 2026 (not announced yet). Whether integrated passes
 * other than Hola Barcelona are valid on the NitBus is not stated anywhere
 * official, so the copy does not say.
 */

const VERIFIED = "2026-10-12";

const SOURCES: B2Source[] = [
  { name: "Metro opening hours", url: "https://www.tmb.cat/en/barcelona-transport/operating-hours-metro-bus", publisher: "TMB" },
  { name: "NitBus — line search", url: "https://www.ambmobilitat.cat/principales/busquedanitbus.aspx", publisher: "Àrea Metropolitana de Barcelona" },
  { name: "TRAM — lines and timetables", url: "https://tram.cat/ca/linies-i-horaris", publisher: "TRAM" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/horaris-metro-barcelona",
    title: "Horari del metro de Barcelona: a quina hora obre i tanca, i el NitBus",
    seoTitle: "Horari del metro de Barcelona i del NitBus",
    seoDescription:
      "El metro de Barcelona obre a les 5:00; tanca a mitjanit de dilluns a dijous, a les 2:00 el divendres i no tanca la nit del dissabte. Nits especials i NitBus.",
    excerpt:
      "A quina hora obre i tanca el metro de Barcelona cada dia, les nits que funciona sense parar, i com moure's quan tanca: NitBus i tramvia.",
  },
  es: {
    path: "guias/horarios-metro-barcelona",
    title: "Horario del metro de Barcelona: a qué hora abre y cierra, y el NitBus",
    seoTitle: "Horario del metro de Barcelona y del NitBus",
    seoDescription:
      "El metro de Barcelona abre a las 5:00; cierra a medianoche de lunes a jueves, a las 2:00 el viernes y no cierra la noche del sábado. Noches especiales y NitBus.",
    excerpt:
      "A qué hora abre y cierra el metro de Barcelona cada día, las noches que funciona sin parar, y cómo moverse cuando cierra: NitBus y tranvía.",
  },
  en: {
    path: "guides/barcelona-metro-hours",
    title: "Barcelona metro hours: when it opens and closes, and the night bus",
    seoTitle: "Barcelona metro hours and the NitBus night bus",
    seoDescription:
      "Barcelona's metro opens at 5:00; it closes at midnight Monday to Thursday, at 2:00 on Fridays and runs all night on Saturdays. Special nights and NitBus.",
    excerpt:
      "When the Barcelona metro opens and closes each day, the nights it runs non-stop, and how to get around once it shuts: NitBus and tram.",
  },
};

type T = {
  lead: string;
  tableCaption: string;
  headers: string[];
  rows: string[][];
  tableNote: string;
  closeTitle: string;
  close: string;
  specialTitle: string;
  special: string[];
  nightTitle: string;
  night: string[];
  tramTitle: string;
  tram: string[];
  tipsTitle: string;
  tips: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "The Barcelona metro opens at **5:00** every day. It closes at **midnight** from Sunday to Thursday, at **2:00** on Friday nights and the nights before public holidays, and on **Saturday it runs all night** into Sunday. When it is closed, the **NitBus** night buses take over.",
    tableCaption: "Metro opening hours",
    headers: ["Day", "Opens", "Closes"],
    rows: [
      ["Monday to Thursday", "5:00", "Midnight"],
      ["Friday, and the night before a public holiday", "5:00", "2:00"],
      ["Saturday", "5:00", "Runs all night"],
      ["Sunday and public holidays", "—", "Midnight"],
    ],
    tableNote: "From TMB's hours page. A public holiday falling Monday to Thursday follows the midnight closing.",
    closeTitle: "What 'closing time' means",
    close: "TMB's closing time is when the last train leaves each end of the line, so a station in the middle sees its last train later than that. If you are cutting it fine, aim for the earlier end of the line.",
    specialTitle: "Special nights",
    special: [
      "**All night:** 23 June (Sant Joan), 23 September (La Mercè) and 31 December (New Year's Eve).",
      "**Early close:** on 24 December the metro runs from 5:00 to 23:00.",
      "TMB can change these at short notice: on Saturday 3 October 2026 it closed at midnight instead of running all night because of the weather, and during La Mercè it added extra all-night service. Check TMB's news before a big night.",
    ],
    nightTitle: "After the metro closes: NitBus",
    night: [
      "The AMB's **NitBus** network runs from about **22:30 to 6:00 every night of the year**, every 20 minutes on every line. There are 24 lines, and most pass through or near **Plaça de Catalunya**, the network's hub. Lines N17 and N18 go to the airport.",
      "The Hola Barcelona travel card includes the NitBus. If you hold another pass, check its conditions before relying on it at night.",
    ],
    tramTitle: "Tram",
    tram: [
      "The tram (Trambaix and Trambesòs) runs from 5:00 to midnight Monday to Thursday, Sundays and holidays, and until 2:00 on Fridays, Saturdays and nights before holidays. Unlike the metro, it does **not** run all night on Saturdays. It runs all night on the eves of 1 January, 24 June and 24 September, and until 22:30 on 24 December.",
    ],
    tipsTitle: "Tips",
    tips: [
      "**Friday after midnight:** you have until about 2:00 on the metro; after that, NitBus.",
      "**Arriving late at the airport:** the airport metro follows the same hours; the Aerobús runs 24 hours.",
      "**Christmas and New Year:** TMB announces the exact hours in December; New Year's Eve has run all night in recent years.",
    ],
    faq: [
      { question: "What time does the Barcelona metro close?", answer: "At midnight from Sunday to Thursday, at 2:00 on Fridays and the night before public holidays; on Saturdays it runs all night." },
      { question: "Does the Barcelona metro run 24 hours?", answer: "Only on Saturday nights and a few special nights: 23 June, 23 September and 31 December." },
      { question: "What time does the Barcelona metro open?", answer: "At 5:00 every day." },
      { question: "How do I get around Barcelona at night?", answer: "On the NitBus: 24 lines, from about 22:30 to 6:00 every night, every 20 minutes, mostly through Plaça de Catalunya." },
    ],
    note: "Special-night hours change from year to year: check TMB before a big night out.",
  },
  es: {
    lead: "El metro de Barcelona abre a las **5:00** todos los días. Cierra a **medianoche** de domingo a jueves, a las **2:00** las noches del viernes y las vísperas de festivo, y la noche del **sábado funciona sin parar** hasta el domingo. Cuando está cerrado, toman el relevo los autobuses nocturnos **NitBus**.",
    tableCaption: "Horario del metro",
    headers: ["Día", "Abre", "Cierra"],
    rows: [
      ["De lunes a jueves", "5:00", "Medianoche"],
      ["Viernes y vísperas de festivo", "5:00", "2:00"],
      ["Sábado", "5:00", "Toda la noche"],
      ["Domingo y festivos", "—", "Medianoche"],
    ],
    tableNote: "De la página de horarios de TMB. Un festivo de lunes a jueves cierra a medianoche.",
    closeTitle: "Qué quiere decir la hora de cierre",
    close: "La hora de cierre de TMB es la de salida del último tren desde cada extremo de la línea, así que en una estación intermedia el último tren pasa más tarde. Si vas justo, cuenta con el extremo que salga antes.",
    specialTitle: "Noches especiales",
    special: [
      "**Toda la noche:** el 23 de junio (Sant Joan), el 23 de septiembre (La Mercè) y el 31 de diciembre (Nochevieja).",
      "**Cierre anticipado:** el 24 de diciembre el metro funciona de 5:00 a 23:00.",
      "TMB puede cambiarlo con poco aviso: el sábado 3 de octubre de 2026 cerró a medianoche en vez de funcionar toda la noche por el mal tiempo, y en La Mercè añadió noches sin cierre. Consulta las noticias de TMB antes de una noche señalada.",
    ],
    nightTitle: "Cuando cierra el metro: NitBus",
    night: [
      "La red **NitBus** del AMB funciona aproximadamente de **22:30 a 6:00 todas las noches del año**, cada 20 minutos en todas las líneas. Tiene 24 líneas, y la mayoría pasan por **plaza Catalunya** o cerca, el centro de la red. Las líneas N17 y N18 van al aeropuerto.",
      "La Hola Barcelona incluye el NitBus. Si tienes otro título, comprueba sus condiciones antes de contar con él de noche.",
    ],
    tramTitle: "Tranvía",
    tram: [
      "El tranvía (Trambaix y Trambesòs) funciona de 5:00 a medianoche de lunes a jueves, domingos y festivos, y hasta las 2:00 los viernes, sábados y vísperas de festivo. A diferencia del metro, **no** funciona toda la noche el sábado. Funciona toda la noche las vísperas del 1 de enero, el 24 de junio y el 24 de septiembre, y hasta las 22:30 el 24 de diciembre.",
    ],
    tipsTitle: "Consejos",
    tips: [
      "**Viernes después de medianoche:** tienes metro hasta las 2:00 aproximadamente; después, NitBus.",
      "**Llegada tarde al aeropuerto:** el metro del aeropuerto sigue el mismo horario; el Aerobús funciona las 24 horas.",
      "**Navidad y Fin de Año:** TMB anuncia el horario exacto en diciembre; los últimos años la Nochevieja ha funcionado toda la noche.",
    ],
    faq: [
      { question: "¿A qué hora cierra el metro de Barcelona?", answer: "A medianoche de domingo a jueves, a las 2:00 los viernes y vísperas de festivo; el sábado funciona toda la noche." },
      { question: "¿El metro de Barcelona funciona 24 horas?", answer: "Solo la noche del sábado y algunas noches especiales: 23 de junio, 23 de septiembre y 31 de diciembre." },
      { question: "¿A qué hora abre el metro de Barcelona?", answer: "A las 5:00 todos los días." },
      { question: "¿Cómo moverse por Barcelona de noche?", answer: "Con el NitBus: 24 líneas, aproximadamente de 22:30 a 6:00 todas las noches, cada 20 minutos, la mayoría por plaza Catalunya." },
    ],
    note: "El horario de las noches especiales cambia cada año: consulta TMB antes de una noche señalada.",
  },
  ca: {
    lead: "El metro de Barcelona obre a les **5:00** cada dia. Tanca a **mitjanit** de diumenge a dijous, a les **2:00** les nits de divendres i les vigílies de festiu, i la nit del **dissabte funciona sense parar** fins al diumenge. Quan és tancat, agafen el relleu els autobusos nocturns **NitBus**.",
    tableCaption: "Horari del metro",
    headers: ["Dia", "Obre", "Tanca"],
    rows: [
      ["De dilluns a dijous", "5:00", "Mitjanit"],
      ["Divendres i vigílies de festiu", "5:00", "2:00"],
      ["Dissabte", "5:00", "Tota la nit"],
      ["Diumenge i festius", "—", "Mitjanit"],
    ],
    tableNote: "De la pàgina d'horaris de TMB. Un festiu de dilluns a dijous tanca a mitjanit.",
    closeTitle: "Què vol dir l'hora de tancament",
    close: "L'hora de tancament de TMB és la de sortida de l'últim tren des de cada extrem de la línia, així que en una estació del mig l'últim tren hi passa més tard. Si vas just, compta amb l'extrem que surti abans.",
    specialTitle: "Nits especials",
    special: [
      "**Tota la nit:** el 23 de juny (Sant Joan), el 23 de setembre (la Mercè) i el 31 de desembre (Cap d'Any).",
      "**Tancament avançat:** el 24 de desembre el metro funciona de 5:00 a 23:00.",
      "TMB ho pot canviar amb poc avís: el dissabte 3 d'octubre de 2026 va tancar a mitjanit en lloc de funcionar tota la nit pel mal temps, i per la Mercè va afegir nits sense tancament. Consulta les notícies de TMB abans d'una nit assenyalada.",
    ],
    nightTitle: "Quan tanca el metro: NitBus",
    night: [
      "La xarxa **NitBus** de l'AMB funciona aproximadament de **22:30 a 6:00 totes les nits de l'any**, cada 20 minuts a totes les línies. Té 24 línies, i la majoria passen per la **plaça de Catalunya** o a prop, el centre de la xarxa. Les línies N17 i N18 van a l'aeroport.",
      "La Hola Barcelona inclou el NitBus. Si tens un altre títol, comprova'n les condicions abans de comptar-hi de nit.",
    ],
    tramTitle: "Tramvia",
    tram: [
      "El tramvia (Trambaix i Trambesòs) funciona de 5:00 a mitjanit de dilluns a dijous, diumenges i festius, i fins a les 2:00 els divendres, dissabtes i vigílies de festiu. A diferència del metro, **no** funciona tota la nit el dissabte. Funciona tota la nit les vigílies de l'1 de gener, el 24 de juny i el 24 de setembre, i fins a les 22:30 el 24 de desembre.",
    ],
    tipsTitle: "Consells",
    tips: [
      "**Divendres després de mitjanit:** tens metro fins a les 2:00 aproximadament; després, NitBus.",
      "**Arribada tard a l'aeroport:** el metro de l'aeroport segueix el mateix horari; l'Aerobús funciona les 24 hores.",
      "**Nadal i Cap d'Any:** TMB anuncia l'horari exacte al desembre; els últims anys la nit de Cap d'Any ha funcionat tota la nit.",
    ],
    faq: [
      { question: "A quina hora tanca el metro de Barcelona?", answer: "A mitjanit de diumenge a dijous, a les 2:00 els divendres i vigílies de festiu; el dissabte funciona tota la nit." },
      { question: "El metro de Barcelona funciona 24 hores?", answer: "Només la nit del dissabte i algunes nits especials: 23 de juny, 23 de setembre i 31 de desembre." },
      { question: "A quina hora obre el metro de Barcelona?", answer: "A les 5:00 cada dia." },
      { question: "Com moure's per Barcelona de nit?", answer: "Amb el NitBus: 24 línies, aproximadament de 22:30 a 6:00 totes les nits, cada 20 minuts, la majoria per la plaça de Catalunya." },
    ],
    note: "L'horari de les nits especials canvia cada any: consulta TMB abans d'una nit assenyalada.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    table(t.tableCaption, t.headers, t.rows, t.tableNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.closeTitle, t.close),
    ...h2(t.specialTitle),
    list(...t.special),
    ...h2(t.nightTitle, ...t.night),
    ...h2(t.tramTitle, ...t.tram),
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
