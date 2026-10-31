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
 * computed from the permanent rule (src/lib/content/clock/rule.ts). The
 * 2027-2031 dates come from the Commission's calendar, because no Spanish
 * order for those years has been published yet. Left out on purpose: the old
 * IDAE savings estimate (superseded in 2020) and any motive for the 1940
 * change beyond the one the order itself gives.
 *
 * Re-read on 31 Oct 2026 (striking-distance push): RD 236/2002 arts. 2-3
 * (Canary Islands at 01:00 / 02:00 local), C/2026/1660 (28 March and
 * 31 October 2027, 01:00 UTC), the procedure file 2018/0332(COD) ("Awaiting
 * Council's 1st reading position"), GOV.UK (UK changes on the same Sundays,
 * "forward 1 hour at 1am", "back 1 hour at 2am"), NIST (US: second Sunday of
 * March and first Sunday of November at 2:00 local; the 2027 dates in
 * `US_2027` follow from that rule) and the Generalitat's 2027 calendar
 * (26 and 29 March holidays, so 28 March 2027 is Easter Sunday). The lead now
 * names the next change, like the titles: tests/clock-change.test.ts fails
 * once it has passed, and both are rewritten together.
 */

const VERIFIED = "2026-10-31";

/** US changes in 2027 under the federal rule (NIST): second Sunday of March, first Sunday of November. */
export const US_2027 = { forward: "2027-03-14", back: "2027-11-07" } as const;

const SOURCES: B2Source[] = [
  { name: "Directive 2000/84/EC on summer-time arrangements", url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32000L0084", publisher: "EUR-Lex" },
  { name: "Real Decreto 236/2002, por el que se establece la hora de verano", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2002-4221", publisher: "BOE" },
  { name: "Orden PCM/186/2022, calendario de la hora de verano 2022-2026", url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2022-4026", publisher: "BOE" },
  { name: "Communication C/2026/1660, summer-time calendar 2027-2031", url: "https://www.boe.es/doue/2026/1660/Z00001-00001.pdf", publisher: "Official Journal of the EU" },
  { name: "Procedure 2018/0332(COD), seasonal changes of time", url: "https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2018/0332(COD)", publisher: "European Parliament" },
  { name: "Ongoing study on discontinuing seasonal time changes (doc. 10045/26)", url: "https://data.consilium.europa.eu/doc/document/ST-10045-2026-INIT/en/pdf", publisher: "Council of the EU" },
  { name: "Orden de 7 de marzo de 1940, adelanto de la hora legal", url: "https://www.boe.es/datos/pdfs/BOE//1940/068/A01675-01675.pdf", publisher: "BOE" },
  { name: "Nota de prensa sobre el cambio de hora, 27 de marzo de 2020", url: "https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/transicion-ecologica/Paginas/2020/260320-hora.aspx", publisher: "La Moncloa" },
  { name: "When do the clocks change?", url: "https://www.gov.uk/when-do-the-clocks-change", publisher: "GOV.UK" },
  { name: "Daylight Saving Time (DST)", url: "https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst", publisher: "National Institute of Standards and Technology (US)" },
  { name: "Calendari oficial de festes laborals a Catalunya 2027", url: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2027/", publisher: "Departament d'Empresa i Treball, Generalitat de Catalunya" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/canvi-hora-catalunya",
    title: "Canvi d'hora: quan canvien l'hora, dates fins al 2031 i si s'acabarà",
    seoTitle: "Canvi d'hora 2027: diumenge 28 de març, una hora menys",
    seoDescription:
      "La matinada del diumenge 28 de març del 2027, diumenge de Pasqua, a les 2 seran les 3. Dates oficials fins al 2031 i si s'acabarà el canvi d'hora.",
    excerpt:
      "El pròxim canvi d'hora calculat amb la norma, les dates fins al 2031 i l'estat real de la proposta europea per suprimir-lo.",
  },
  es: {
    path: "guias/cambio-hora-espana",
    title: "Cambio de hora: cuándo se cambia la hora, fechas hasta 2031 y si se acabará",
    seoTitle: "Cambio de hora 2027: domingo 28 de marzo, una hora menos",
    seoDescription:
      "La madrugada del domingo 28 de marzo de 2027, domingo de Pascua, a las 2 serán las 3. Fechas oficiales hasta 2031 y si se acabará el cambio de hora.",
    excerpt:
      "El próximo cambio de hora calculado con la norma, las fechas hasta 2031 y el estado real de la propuesta europea para suprimirlo.",
  },
  en: {
    path: "guides/clock-change-spain",
    title: "When do the clocks change in Spain? Dates to 2031 and what happens",
    seoTitle: "When do the clocks change in Spain? Next: 28 March 2027",
    seoDescription:
      "Spain's clocks go forward at 02:00 on Sunday 28 March 2027, Easter Sunday, and back on 31 October. Barcelona is on CET (UTC+1) until then. Dates to 2031.",
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
  diffTitle: string;
  diffIntro: string;
  diffHeaders: string[];
  diffRows: string[][];
  diffNote: string;
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
    lead: "**El pròxim canvi d'hora és el diumenge 28 de març del 2027**: a les 2 de la matinada seran les 3 i dormirem una hora menys. L'últim va ser el diumenge 25 d'octubre del 2026, i el següent serà el diumenge 31 d'octubre del 2027. La regla no canvia mai: l'hora s'avança l'**últim diumenge de març** i es retarda l'**últim diumenge d'octubre**, a Catalunya, a la resta d'Espanya i a tota la UE en el mateix instant. Aquí tens les dates oficials fins al 2031, què passa amb la diferència horària amb el Regne Unit i els Estats Units, i com està de debò la proposta d'acabar amb el canvi.",
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
      "**A l'octubre**, a les 03:00 de la matinada els rellotges tornen a marcar les 02:00. Aquell diumenge té 25 hores: dormim una hora més i a la tarda es fa fosc abans. A Barcelona comença el tram més fosc de l'any: el desembre és el mes amb menys hores de sol, com es veu al [temps a Barcelona mes a mes](/ca/guies/temps-barcelona-mes-a-mes/).",
      "**Al març**, a les 02:00 els rellotges passen directament a les 03:00. El dia té 23 hores: dormim una hora menys i es fa fosc més tard.",
      "Catalunya segueix l'hora peninsular, la central europea: UTC+1 a l'hivern (CET) i UTC+2 a l'estiu (CEST). A les Canàries el canvi es fa una hora abans en el rellotge local (de les 02:00 a la 01:00 a l'octubre), perquè tota la UE canvia en el mateix instant.",
    ],
    diffTitle: "Diferència horària amb el Regne Unit, les Canàries i els Estats Units",
    diffIntro: "Tota la UE canvia l'hora en el mateix instant, a la 01:00 en temps universal, i el Regne Unit també, de manera que la diferència amb Londres no es mou mai. Els Estats Units canvien en altres dates: avancen el rellotge dues setmanes abans que nosaltres i el retarden una setmana després, així que tres setmanes l'any la diferència amb les ciutats nord-americanes és d'una hora menys que de costum.",
    diffHeaders: ["Lloc", "Diferència amb Catalunya", "Quan canvien l'hora"],
    diffRows: [
      ["Regne Unit", "Una hora menys, tot l'any", "Els mateixos diumenges i en el mateix instant: a la 01:00 hora britànica al març i a les 02:00 a l'octubre"],
      ["Canàries", "Una hora menys, tot l'any", "En el mateix instant: a la 01:00 hora local al març i a les 02:00 a l'octubre"],
      ["Estats Units", "Una hora menys de diferència que de costum del 14 al 28 de març del 2027 i del 31 d'octubre al 7 de novembre del 2027", "El segon diumenge de març i el primer diumenge de novembre, a les 02:00 hora local"],
    ],
    diffNote: "Regne Unit: GOV.UK (28 de març i 31 d'octubre del 2027). Canàries: Reial decret 236/2002, articles 2 i 3. Estats Units: la norma federal tal com la publica el NIST; les dates del 2027 en surten.",
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
      { question: "El canvi d'hora del març del 2027 cau per Setmana Santa?", answer: "Sí. El 28 de març del 2027 és el diumenge de Pasqua, entre dos festius a Catalunya: el Divendres Sant (26 de març) i el Dilluns de Pasqua (29 de març, excepte a l'Aran). Perdem l'hora enmig d'un cap de setmana de quatre dies. Tots els festius són al [calendari laboral 2027 de Catalunya](/ca/guies/calendari-laboral-catalunya/)." },
      { question: "Quina hora té Catalunya?", answer: "L'hora central europea: UTC+1 a l'hivern (CET) i UTC+2 a l'estiu (CEST). Les Canàries i el Regne Unit van una hora per darrere tot l'any." },
      { question: "S'ha aprovat eliminar el canvi d'hora?", answer: "No. La proposta europea del 2018 continua pendent del Consell de la UE, i la Comissió fa un estudi que ha d'acabar a finals del 2026. Fins que no s'aprovi una nova norma, l'hora continua canviant." },
    ],
  },
  es: {
    lead: "**El próximo cambio de hora es el domingo 28 de marzo de 2027**: a las 2 de la madrugada serán las 3 y dormiremos una hora menos. El último fue el domingo 25 de octubre de 2026, y el siguiente será el domingo 31 de octubre de 2027. La regla no cambia nunca: la hora se adelanta el **último domingo de marzo** y se retrasa el **último domingo de octubre**, en toda España y en toda la UE en el mismo instante. Aquí tienes las fechas oficiales hasta 2031, qué pasa con la diferencia horaria con Reino Unido y Estados Unidos, y cómo está de verdad la propuesta de acabar con el cambio.",
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
      "**En octubre**, a las 03:00 de la madrugada los relojes vuelven a marcar las 02:00. Ese domingo tiene 25 horas: dormimos una hora más y por la tarde anochece antes. En Barcelona empieza el tramo más oscuro del año: diciembre es el mes con menos horas de sol, como se ve en [el tiempo en Barcelona mes a mes](/es/guias/tiempo-barcelona-mes-a-mes/).",
      "**En marzo**, a las 02:00 los relojes pasan directamente a las 03:00. El día tiene 23 horas: dormimos una hora menos y anochece más tarde.",
      "La península y Baleares tienen la hora central europea: UTC+1 en invierno (CET) y UTC+2 en verano (CEST). En Canarias el cambio se hace una hora antes en el reloj local (de las 02:00 a la 01:00 en octubre), porque toda la UE cambia en el mismo instante.",
    ],
    diffTitle: "Diferencia horaria con Reino Unido, Canarias y Estados Unidos",
    diffIntro: "Toda la UE cambia la hora en el mismo instante, a la 01:00 en tiempo universal, y Reino Unido también, así que la diferencia con Londres no se mueve nunca. Estados Unidos cambia en otras fechas: adelanta el reloj dos semanas antes que nosotros y lo retrasa una semana después, de modo que tres semanas al año la diferencia con las ciudades estadounidenses es de una hora menos que de costumbre.",
    diffHeaders: ["Lugar", "Diferencia con la península", "Cuándo cambian la hora"],
    diffRows: [
      ["Reino Unido", "Una hora menos, todo el año", "Los mismos domingos y en el mismo instante: a la 01:00 hora británica en marzo y a las 02:00 en octubre"],
      ["Canarias", "Una hora menos, todo el año", "En el mismo instante: a la 01:00 hora local en marzo y a las 02:00 en octubre"],
      ["Estados Unidos", "Una hora menos de diferencia que de costumbre del 14 al 28 de marzo de 2027 y del 31 de octubre al 7 de noviembre de 2027", "El segundo domingo de marzo y el primer domingo de noviembre, a las 02:00 hora local"],
    ],
    diffNote: "Reino Unido: GOV.UK (28 de marzo y 31 de octubre de 2027). Canarias: Real Decreto 236/2002, artículos 2 y 3. Estados Unidos: la norma federal tal como la publica el NIST; las fechas de 2027 salen de ella.",
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
      { question: "¿El cambio de hora de marzo de 2027 cae en Semana Santa?", answer: "Sí. El 28 de marzo de 2027 es domingo de Pascua, entre dos festivos en Cataluña: el Viernes Santo (26 de marzo) y el Lunes de Pascua (29 de marzo, salvo en Arán). Perdemos la hora en medio de un fin de semana de cuatro días. Todos los festivos están en el [calendario laboral 2027 de Cataluña](/es/guias/calendario-laboral-cataluna/)." },
      { question: "¿Qué hora tiene España?", answer: "La península y Baleares, la hora central europea: UTC+1 en invierno (CET) y UTC+2 en verano (CEST). Canarias y Reino Unido van una hora por detrás todo el año." },
      { question: "¿Se ha aprobado eliminar el cambio de hora?", answer: "No. La propuesta europea de 2018 sigue pendiente del Consejo de la UE, y la Comisión hace un estudio que debe terminar a finales de 2026. Hasta que no se apruebe una nueva norma, la hora sigue cambiando." },
    ],
  },
  en: {
    lead: "**The clocks in Spain next change on Sunday 28 March 2027**, when they go forward an hour: at 02:00 it becomes 03:00. They last went back on Sunday 25 October 2026 and will go back again on Sunday 31 October 2027. The rule never changes: forward on the **last Sunday of March**, back on the **last Sunday of October**, in Barcelona, the rest of Spain and the whole EU at the same moment. Here are the official dates to 2031, what happens to the time difference with the UK and the US, and where the plan to scrap the change really stands.",
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
      "**In October**, at 03:00 the clocks go back to 02:00. That Sunday has 25 hours: you get an extra hour in bed, and it gets dark earlier in the afternoon. In Barcelona it starts the darkest stretch of the year: December has the fewest hours of sunshine, as the [Barcelona weather by month](/en/guides/barcelona-weather-by-month/) guide shows.",
      "**In March**, at 02:00 the clocks jump straight to 03:00. The day has 23 hours: you lose an hour, and it gets dark later.",
      "Barcelona and the rest of mainland Spain are on Central European Time: UTC+1 in winter (CET) and UTC+2 in summer (CEST). In the Canary Islands the change comes an hour earlier on the local clock (02:00 back to 01:00 in October), because the whole EU changes at the same instant.",
    ],
    diffTitle: "Time difference with the UK, the Canary Islands and the US",
    diffIntro: "The whole EU changes at the same instant, 01:00 universal time, and so does the UK, so the gap with London never moves. The United States changes on other dates: it goes forward two weeks before Spain and back a week after, so for three weeks a year the gap with US cities is one hour smaller than usual.",
    diffHeaders: ["Place", "Difference with Barcelona", "When its clocks change"],
    diffRows: [
      ["United Kingdom", "1 hour behind, all year", "Same Sundays, same moment: 01:00 UK time in March, 02:00 in October"],
      ["Canary Islands", "1 hour behind, all year", "Same moment: 01:00 local time in March, 02:00 in October"],
      ["United States", "One hour less than usual from 14 to 28 March 2027 and from 31 October to 7 November 2027", "Second Sunday of March and first Sunday of November, at 02:00 local time"],
    ],
    diffNote: "UK: GOV.UK (28 March and 31 October 2027). Canary Islands: Real Decreto 236/2002, articles 2 and 3. United States: the federal rule as published by NIST; the 2027 dates follow from it.",
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
      { question: "Do the clocks go back in Barcelona?", answer: "Yes. Barcelona follows the same rule as the rest of Spain: the clocks went back an hour at 03:00 on Sunday 25 October 2026, and they go forward an hour at 02:00 on Sunday 28 March 2027." },
      { question: "What time zone is Barcelona in?", answer: "Central European Time: UTC+1 in winter (CET) and UTC+2 in summer (CEST). The Canary Islands and the UK are one hour behind all year." },
      { question: "Is the March 2027 clock change on Easter Sunday?", answer: "Yes. 28 March 2027 is Easter Sunday, between two public holidays in Catalonia: Good Friday (26 March) and Easter Monday (29 March, except in Aran). You lose the hour in the middle of a four-day weekend. Every date is in the [Catalonia public holidays 2027](/en/guides/catalonia-public-holidays/) guide." },
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
    ...h2(t.diffTitle, t.diffIntro),
    table(t.diffTitle, t.diffHeaders, t.diffRows, t.diffNote),
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
