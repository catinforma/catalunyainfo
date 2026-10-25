import { COPY as CALENDAR } from "@/lib/content/holidays/copy";
import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  callout,
  faq,
  h2,
  lead,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * The clock change: when it is, what happens, and whether it will end.
 *
 * Every statement is from the BOE, EUR-Lex, the Council of the EU, the
 * European Parliament or La Moncloa, checked on 12 Oct 2026
 * (research_notes/blog-batch-03/clock_change.md). The next-change box is
 * computed from the permanent rule (src/lib/content/clock/rule.ts), so the
 * prose never names "the next change" itself and cannot go stale. The
 * 2027-2031 dates come from the Commission's calendar, because no Spanish
 * order for those years has been published yet. Left out on purpose: the old
 * IDAE savings estimate (superseded in 2020) and any motive for the 1940
 * change beyond the one the order itself gives.
 */

const VERIFIED = "2026-10-12";

const SOURCES: B2Source[] = [
  { name: "Directive 2000/84/EC on summer-time arrangements", url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32000L0084", publisher: "EUR-Lex" },
  { name: "Real Decreto 236/2002, por el que se establece la hora de verano", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2002-4221", publisher: "BOE" },
  { name: "Orden PCM/186/2022, calendario de la hora de verano 2022-2026", url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2022-4026", publisher: "BOE" },
  { name: "Communication C/2026/1660, summer-time calendar 2027-2031", url: "https://www.boe.es/doue/2026/1660/Z00001-00001.pdf", publisher: "Official Journal of the EU" },
  { name: "Procedure 2018/0332(COD), seasonal changes of time", url: "https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2018/0332(COD)", publisher: "European Parliament" },
  { name: "Ongoing study on discontinuing seasonal time changes (doc. 10045/26)", url: "https://data.consilium.europa.eu/doc/document/ST-10045-2026-INIT/en/pdf", publisher: "Council of the EU" },
  { name: "Orden de 7 de marzo de 1940, adelanto de la hora legal", url: "https://www.boe.es/datos/pdfs/BOE//1940/068/A01675-01675.pdf", publisher: "BOE" },
  { name: "Nota de prensa sobre el cambio de hora, 27 de marzo de 2020", url: "https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/transicion-ecologica/Paginas/2020/260320-hora.aspx", publisher: "La Moncloa" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/canvi-hora-catalunya",
    title: "Canvi d'hora: quan és el pròxim, què passa i si s'acabarà",
    seoTitle: "Canvi d'hora 2027: diumenge 28 de març, dormim una hora menys",
    seoDescription:
      "La matinada del diumenge 28 de març del 2027, a les 2 seran les 3. Dates oficials de la UE fins al 2031, i si s'acabarà mai el canvi d'hora.",
    excerpt:
      "El pròxim canvi d'hora calculat amb la norma, les dates fins al 2031 i l'estat real de la proposta europea per suprimir-lo.",
  },
  es: {
    path: "guias/cambio-hora-espana",
    title: "Cambio de hora: cuándo es el próximo, qué pasa y si se acabará",
    seoTitle: "Cambio de hora 2027: domingo 28 de marzo, una hora menos",
    seoDescription:
      "La madrugada del domingo 28 de marzo de 2027, a las 2 serán las 3. Fechas oficiales de la UE hasta 2031, y si se acabará el cambio de hora.",
    excerpt:
      "El próximo cambio de hora calculado con la norma, las fechas hasta 2031 y el estado real de la propuesta europea para suprimirlo.",
  },
  en: {
    path: "guides/clock-change-spain",
    title: "Clock change in Spain: when the clocks go back or forward",
    seoTitle: "Spain clock change: clocks go forward on Sunday 28 March 2027",
    seoDescription:
      "At 02:00 on Sunday 28 March 2027 the clocks in Barcelona and Spain go forward to 03:00. Official dates to 2031, and whether the EU will end the change.",
    excerpt:
      "The next clock change in Spain, computed from the law, the official dates to 2031 and where the EU plan to scrap it actually stands.",
  },
};

type T = {
  lead: string;
  note: string;
  ruleTitle: string;
  rule: string[];
  tableCaption: string;
  tableHeaders: string[];
  tableNote: string;
  whatTitle: string;
  what: string[];
  endTitle: string;
  end: string[];
  historyTitle: string;
  history: string[];
  energyTitle: string;
  energy: string[];
  faq: { question: string; answer: string }[];
};

/** Dates as published: 2026 in Orden PCM/186/2022, 2027-2031 in C/2026/1660. */
const DATES: [string, Record<Locale, string>, Record<Locale, string>][] = [
  ["2026", { ca: "29 de març", es: "29 de marzo", en: "29 March" }, { ca: "25 d'octubre", es: "25 de octubre", en: "25 October" }],
  ["2027", { ca: "28 de març", es: "28 de marzo", en: "28 March" }, { ca: "31 d'octubre", es: "31 de octubre", en: "31 October" }],
  ["2028", { ca: "26 de març", es: "26 de marzo", en: "26 March" }, { ca: "29 d'octubre", es: "29 de octubre", en: "29 October" }],
  ["2029", { ca: "25 de març", es: "25 de marzo", en: "25 March" }, { ca: "28 d'octubre", es: "28 de octubre", en: "28 October" }],
  ["2030", { ca: "31 de març", es: "31 de marzo", en: "31 March" }, { ca: "27 d'octubre", es: "27 de octubre", en: "27 October" }],
  ["2031", { ca: "30 de març", es: "30 de marzo", en: "30 March" }, { ca: "26 d'octubre", es: "26 de octubre", en: "26 October" }],
];

const COPY: Record<Locale, T> = {
  ca: {
    lead: "A Catalunya l'hora canvia dues vegades l'any, sempre en diumenge: l'**últim diumenge de març** s'avança una hora i l'**últim diumenge d'octubre** es retarda una hora. La norma és europea i Espanya la va fer seva el 2002 per a temps indefinit. Aquí tens el pròxim canvi, les dates oficials fins al 2031 i com està de debò la proposta d'acabar-hi.",
    note: "La data del pròxim canvi es calcula amb la regla del Reial decret 236/2002; les dates de la taula són les publicades al BOE i al Diari Oficial de la UE.",
    ruleTitle: "Quan canvia l'hora",
    rule: [
      "La Directiva 2000/84/CE fixa que l'horari d'estiu comença l'**últim diumenge de març** i acaba l'**últim diumenge d'octubre**, en tots els estats membres alhora: a la 01:00 en temps universal. Espanya la va incorporar amb el **Reial decret 236/2002**, que la declara aplicable «con carácter indefinido».",
      "Cada cinc anys es publica el calendari amb les dates concretes. L'últim ordre espanyol, l'Orden PCM/186/2022, cobreix fins al 2026. Les dates del 2027 al 2031 ja les ha fixat la Comissió Europea al Diari Oficial de la UE; el BOE encara no n'ha publicat l'ordre corresponent, però com que la regla és permanent, les dates no canvien.",
    ],
    tableCaption: "Dates oficials del canvi d'hora",
    tableHeaders: ["Any", "S'avança (02:00 → 03:00)", "Es retarda (03:00 → 02:00)"],
    tableNote: "2026: Orden PCM/186/2022 (BOE). 2027-2031: Comunicació C/2026/1660 de la Comissió Europea. Tots els canvis són en diumenge.",
    whatTitle: "Què passa exactament",
    what: [
      "**A l'octubre**, a les 03:00 de la matinada els rellotges tornen a marcar les 02:00. Aquell diumenge té 25 hores: dormim una hora més i a la tarda es fa fosc abans.",
      "**Al març**, a les 02:00 els rellotges passen directament a les 03:00. El dia té 23 hores: dormim una hora menys i es fa fosc més tard.",
      "Catalunya segueix l'hora peninsular: UTC+1 a l'hivern i UTC+2 a l'estiu. A les Canàries el canvi es fa una hora abans en el rellotge local (de les 02:00 a la 01:00 a l'octubre), perquè tota la UE canvia en el mateix instant.",
    ],
    endTitle: "S'acabarà el canvi d'hora?",
    end: [
      "De moment, no hi ha res decidit. La Comissió Europea va proposar suprimir els canvis estacionals el **12 de setembre del 2018**, i el Parlament Europeu hi va votar a favor el **26 de març del 2019**. Però el Consell, on hi ha els governs, no ha fixat la seva posició: segons el mateix Consell, el debat «stalled in 2019».",
      "El 2025 la presidència polonesa del Consell va proposar provar dos anys un horari d'estiu permanent, i el **febrer del 2026** la Comissió va encarregar un estudi sobre l'impacte de deixar de canviar l'hora, que ha d'acabar **a finals del 2026**.",
      "L'octubre del 2025 el president del Govern espanyol va explicar que Espanya havia proposat al Consell de la UE acabar amb el canvi estacional, sense dir si preferia quedar-se amb l'horari d'estiu o el d'hivern. És una proposta, no una decisió: mentre la UE no aprovi una nova directiva, l'hora continuarà canviant.",
    ],
    historyTitle: "Des de quan tenim aquesta hora",
    history: [
      "Una ordre del 7 de març del 1940 va avançar l'hora legal espanyola 60 minuts a partir del 16 de març d'aquell any. El text ho presentava com un avançament «temporal», per anar d'acord amb «otros países europeos». Des d'aleshores Espanya ha mantingut aquest fus, i el comitè d'experts que va estudiar la reforma horària el 2019 no va proposar canviar-lo.",
    ],
    energyTitle: "I l'estalvi d'energia?",
    energy: [
      "L'argument clàssic del canvi d'hora és l'estalvi. La darrera valoració oficial que hem trobat, una nota del Govern del 27 de març del 2020, diu que «en España no existen informes actualizados» que demostrin que el canvi estalviï energia, i que a escala europea els estalvis són «marginales».",
    ],
    faq: [
      { question: "Quan és el canvi d'hora d'octubre?", answer: "L'últim diumenge d'octubre: el 2026 és el diumenge 25 d'octubre, i el 2027 el diumenge 31 d'octubre. A les 03:00 tornen a ser les 02:00." },
      { question: "Dormim una hora més o una hora menys?", answer: "A l'octubre, una hora més (el rellotge es retarda de les 03:00 a les 02:00). Al març, una hora menys (s'avança de les 02:00 a les 03:00)." },
      { question: "Quan canvia l'hora el març del 2027?", answer: "El diumenge 28 de març del 2027, segons el calendari de la Comissió Europea: a les 02:00 seran les 03:00." },
      { question: "S'ha aprovat eliminar el canvi d'hora?", answer: "No. La proposta europea del 2018 continua pendent del Consell de la UE, i la Comissió fa un estudi que ha d'acabar a finals del 2026. Fins que no s'aprovi una nova norma, l'hora continua canviant." },
    ],
  },
  es: {
    lead: "En España la hora cambia dos veces al año, siempre en domingo: el **último domingo de marzo** se adelanta una hora y el **último domingo de octubre** se retrasa una hora. La norma es europea y España la hizo suya en 2002 por tiempo indefinido. Aquí tienes el próximo cambio, las fechas oficiales hasta 2031 y cómo está de verdad la propuesta de acabar con él.",
    note: "La fecha del próximo cambio se calcula con la regla del Real Decreto 236/2002; las fechas de la tabla son las publicadas en el BOE y en el Diario Oficial de la UE.",
    ruleTitle: "Cuándo cambia la hora",
    rule: [
      "La Directiva 2000/84/CE fija que el horario de verano empieza el **último domingo de marzo** y termina el **último domingo de octubre**, en todos los Estados miembros a la vez: a la 01:00 en tiempo universal. España la incorporó con el **Real Decreto 236/2002**, que la declara aplicable «con carácter indefinido».",
      "Cada cinco años se publica el calendario con las fechas concretas. La última orden española, la Orden PCM/186/2022, cubre hasta 2026. Las fechas de 2027 a 2031 ya las ha fijado la Comisión Europea en el Diario Oficial de la UE; el BOE aún no ha publicado la orden correspondiente, pero como la regla es permanente, las fechas no cambian.",
    ],
    tableCaption: "Fechas oficiales del cambio de hora",
    tableHeaders: ["Año", "Se adelanta (02:00 → 03:00)", "Se retrasa (03:00 → 02:00)"],
    tableNote: "2026: Orden PCM/186/2022 (BOE). 2027-2031: Comunicación C/2026/1660 de la Comisión Europea. Todos los cambios son en domingo.",
    whatTitle: "Qué pasa exactamente",
    what: [
      "**En octubre**, a las 03:00 de la madrugada los relojes vuelven a marcar las 02:00. Ese domingo tiene 25 horas: dormimos una hora más y por la tarde anochece antes.",
      "**En marzo**, a las 02:00 los relojes pasan directamente a las 03:00. El día tiene 23 horas: dormimos una hora menos y anochece más tarde.",
      "La península y Baleares tienen UTC+1 en invierno y UTC+2 en verano. En Canarias el cambio se hace una hora antes en el reloj local (de las 02:00 a la 01:00 en octubre), porque toda la UE cambia en el mismo instante.",
    ],
    endTitle: "¿Se acabará el cambio de hora?",
    end: [
      "Por ahora, no hay nada decidido. La Comisión Europea propuso suprimir los cambios estacionales el **12 de septiembre de 2018**, y el Parlamento Europeo votó a favor el **26 de marzo de 2019**. Pero el Consejo, donde están los gobiernos, no ha fijado su posición: según el propio Consejo, el debate «stalled in 2019».",
      "En 2025 la presidencia polaca del Consejo propuso probar dos años un horario de verano permanente, y en **febrero de 2026** la Comisión encargó un estudio sobre el impacto de dejar de cambiar la hora, que debe terminar **a finales de 2026**.",
      "En octubre de 2025 el presidente del Gobierno explicó que España había propuesto en el Consejo de la UE acabar con el cambio estacional, sin decir si prefería quedarse con el horario de verano o el de invierno. Es una propuesta, no una decisión: mientras la UE no apruebe una nueva directiva, la hora seguirá cambiando.",
    ],
    historyTitle: "Desde cuándo tenemos esta hora",
    history: [
      "Una orden del 7 de marzo de 1940 adelantó la hora legal española 60 minutos a partir del 16 de marzo de ese año. El texto lo presentaba como un adelanto «temporal», para ir de acuerdo con «otros países europeos». Desde entonces España ha mantenido ese huso, y el comité de expertos que estudió la reforma horaria en 2019 no propuso cambiarlo.",
    ],
    energyTitle: "¿Y el ahorro de energía?",
    energy: [
      "El argumento clásico del cambio de hora es el ahorro. La última valoración oficial que hemos encontrado, una nota del Gobierno del 27 de marzo de 2020, dice que «en España no existen informes actualizados» que demuestren que el cambio ahorre energía, y que a escala europea los ahorros son «marginales».",
    ],
    faq: [
      { question: "¿Cuándo es el cambio de hora de octubre?", answer: "El último domingo de octubre: en 2026 es el domingo 25 de octubre, y en 2027 el domingo 31 de octubre. A las 03:00 vuelven a ser las 02:00." },
      { question: "¿Dormimos una hora más o una hora menos?", answer: "En octubre, una hora más (el reloj se retrasa de las 03:00 a las 02:00). En marzo, una hora menos (se adelanta de las 02:00 a las 03:00)." },
      { question: "¿Cuándo cambia la hora en marzo de 2027?", answer: "El domingo 28 de marzo de 2027, según el calendario de la Comisión Europea: a las 02:00 serán las 03:00." },
      { question: "¿Se ha aprobado eliminar el cambio de hora?", answer: "No. La propuesta europea de 2018 sigue pendiente del Consejo de la UE, y la Comisión hace un estudio que debe terminar a finales de 2026. Hasta que no se apruebe una nueva norma, la hora sigue cambiando." },
    ],
  },
  en: {
    lead: "Spain changes its clocks twice a year, always on a Sunday: they go **forward an hour on the last Sunday of March** and **back an hour on the last Sunday of October**. The rule is an EU one, adopted by Spain in 2002 with no end date. Here is the next change, the official dates to 2031, and where the plan to scrap it really stands.",
    note: "The next change is computed from the rule in Real Decreto 236/2002; the dates in the table are the ones published in the BOE and the EU Official Journal.",
    ruleTitle: "When the clocks change",
    rule: [
      "Directive 2000/84/EC sets summer time to start on the **last Sunday of March** and end on the **last Sunday of October**, in every member state at the same moment: 01:00 universal time. Spain adopted it through **Real Decreto 236/2002**, which applies it «con carácter indefinido», with no end date.",
      "The exact dates are published every five years. Spain's latest order, Orden PCM/186/2022, runs to 2026. The 2027-2031 dates have already been set by the European Commission in the EU Official Journal; Spain has not yet published its own order for those years, but because the rule is permanent the dates are the same.",
    ],
    tableCaption: "Official clock change dates in Spain",
    tableHeaders: ["Year", "Clocks forward (02:00 → 03:00)", "Clocks back (03:00 → 02:00)"],
    tableNote: "2026: Orden PCM/186/2022 (BOE). 2027-2031: European Commission communication C/2026/1660. Every change falls on a Sunday.",
    whatTitle: "What exactly happens",
    what: [
      "**In October**, at 03:00 the clocks go back to 02:00. That Sunday has 25 hours: you get an extra hour in bed, and it gets dark earlier in the afternoon.",
      "**In March**, at 02:00 the clocks jump straight to 03:00. The day has 23 hours: you lose an hour, and it gets dark later.",
      "Barcelona and the rest of mainland Spain are on UTC+1 in winter and UTC+2 in summer. In the Canary Islands the change comes an hour earlier on the local clock (02:00 back to 01:00 in October), because the whole EU changes at the same instant.",
    ],
    endTitle: "Will the clock change end?",
    end: [
      "Nothing has been decided. The European Commission proposed scrapping seasonal changes on **12 September 2018**, and the European Parliament voted in favour on **26 March 2019**. But the Council, where the governments sit, has not adopted a position; in the Council's own words, progress \"stalled in 2019\".",
      "In 2025 the Polish Council presidency proposed a two-year trial of permanent summer time, and in **February 2026** the Commission launched a study on the impact of ending the changes, due to finish **by the end of 2026**.",
      "In October 2025 Spain's prime minister said Spain had proposed in the EU Council that the seasonal change should end, without saying whether Spain would rather keep summer or winter time. It is a proposal, not a decision: until the EU adopts a new directive, the clocks keep changing.",
    ],
    historyTitle: "How Spain got this time zone",
    history: [
      "An order of 7 March 1940 put Spain's legal time forward 60 minutes from 16 March that year. The order called it a \"temporal\" (temporary) advance, to keep in step with \"otros países europeos\", other European countries. Spain has kept that time zone ever since, and the expert committee that studied time reform in 2019 did not propose changing it.",
    ],
    energyTitle: "Does it save energy?",
    energy: [
      "Saving energy is the classic argument for the change. The latest official assessment we found, a Spanish government note of 27 March 2020, says there are no up-to-date reports in Spain showing that the change saves energy, and that across the EU the savings are \"marginales\", marginal.",
    ],
    faq: [
      { question: "When do the clocks go back in Spain?", answer: "On the last Sunday of October: Sunday 25 October in 2026 and Sunday 31 October in 2027. At 03:00 it becomes 02:00 again." },
      { question: "Do I gain or lose an hour?", answer: "In October you gain an hour (the clocks go back from 03:00 to 02:00). In March you lose one (they go forward from 02:00 to 03:00)." },
      { question: "When do the clocks go forward in March 2027?", answer: "On Sunday 28 March 2027, according to the European Commission's calendar: 02:00 becomes 03:00." },
      { question: "Has the clock change been abolished?", answer: "No. The 2018 EU proposal is still waiting for the Council, and the Commission is running a study due to finish by the end of 2026. Until a new law is adopted, the clocks keep changing." },
    ],
  },
};

const CALENDAR_LINK: Record<Locale, string> = {
  ca: "Calendari laboral de Catalunya",
  es: "Calendario laboral de Cataluña",
  en: "Catalonia public holiday calendar",
};

function body(locale: Locale): Block[] {
  const t = COPY[locale];
  const related = b2Related(["holidayToday", "workCalendar", "shops", "hours"], locale);
  const list = related[1] as Extract<Block, { type: "list" }>;
  list.items = [`[${CALENDAR_LINK[locale]}](/${locale}/${CALENDAR[locale].path}/)`, ...list.items];
  return [
    lead(t.lead),
    { type: "clockChange" } as Block,
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.ruleTitle, ...t.rule),
    table(
      t.tableCaption,
      t.tableHeaders,
      DATES.map(([year, march, october]) => [year, march[locale], october[locale]]),
      t.tableNote,
    ),
    ...h2(t.whatTitle, ...t.what),
    ...h2(t.endTitle, ...t.end),
    ...h2(t.historyTitle, ...t.history),
    ...h2(t.energyTitle, ...t.energy),
    faq(t.faq),
    ...related,
  ];
}

export const CLOCK_CHANGE: B2Article = {
  key: "clockChange",
  entryKey: "guide-clock-change-spain",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "canvi-hora-rellotge-hora-oficial",
  heroAlt: {
    ca: "Rellotge amb el rètol «Hora oficial» a la façana de la Reial Acadèmia de Ciències i Arts, a la Rambla de Barcelona",
    es: "Reloj con el rótulo «Hora oficial» en la fachada de la Real Academia de Ciencias y Artes, en la Rambla de Barcelona",
    en: "Clock marked \"Hora oficial\" on the façade of the Royal Academy of Sciences and Arts on La Rambla, Barcelona",
  },
  heroCaption: {
    ca: "El rellotge de l'«Hora oficial» de la Reial Acadèmia de Ciències i Arts, a la Rambla.",
    es: "El reloj de la «Hora oficial» de la Real Academia de Ciencias y Artes, en la Rambla.",
    en: "The \"Hora oficial\" clock of the Royal Academy of Sciences and Arts, on La Rambla.",
  },
  secondaryKey: "canvi-hora-torre-rellotge-gracia",
  secondaryAlt: {
    ca: "La torre del rellotge de la plaça de la Vila de Gràcia, a Barcelona, amb arbres de tardor",
    es: "La torre del reloj de la plaza de la Vila de Gràcia, en Barcelona, con árboles de otoño",
    en: "The clock tower in Plaça de la Vila de Gràcia, Barcelona, with autumn trees",
  },
  secondaryCaption: {
    ca: "La torre del rellotge de Gràcia.",
    es: "La torre del reloj de Gràcia.",
    en: "The Gràcia clock tower.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T23:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as CLOCK_CHANGE_META };
