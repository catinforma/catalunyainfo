import { calcPath } from "@/lib/programmatic/calculators/paths";
import { dayMonthYear, longDate, type DateLocale } from "@/lib/programmatic/holidays/format";
import { elDay, euros, num } from "@/lib/programmatic/rent-update/copy";
import { unpackDates } from "@/lib/programmatic/working-days/copy";
import type { Calendar } from "@/lib/programmatic/working-days/engine";
import { COVER_FROM, COVER_TO } from "@/lib/programmatic/working-days/rules";

import type { Channel, Due, IfNothing, InvalidReason, SeverityInput, Stage } from "./engine";
import { DISCOUNT_DAYS, type NoDiscountLetter, type Surcharge } from "./rules";

/**
 * Paths and words of "Multas de tráfico: plazos, descuento del 50 % y
 * recursos", small enough for the browser (the client component imports this
 * file, the engine and the rules; nothing that reads data).
 *
 *   /es/calculadoras/multas-trafico/
 *   /ca/calculadores/multes-transit/
 *   /en/calculators/traffic-fines-spain/
 *
 * Numbers and dates in the rent-update and holiday modules' words (same
 * output in Node and every browser).
 */

export type TfLocale = DateLocale;
export const TF_LOCALES: readonly TfLocale[] = ["es", "ca", "en"];

export function trafficFinesPath(locale: TfLocale): string {
  return calcPath("traffic-fines", locale);
}

export function trafficFinesEditions(): Record<TfLocale, string> {
  return { ca: trafficFinesPath("ca"), es: trafficFinesPath("es"), en: trafficFinesPath("en") };
}

export { elDay, euros };

/** A place's holidays (packed, as places.ts sends them) as the engine's calendar, over the years the holiday data covers. */
export function calendarOf(place: { dates: string }): Calendar {
  return { holidays: new Set(unpackDates(place.dates)), from: COVER_FROM, to: COVER_TO };
}

/** "200 €" when whole, "130,50 €" otherwise; "€200" in English. */
export function money(n: number, locale: TfLocale): string {
  if (Math.abs(n - Math.round(n)) >= 0.005) return euros(n, locale);
  return locale === "en" ? `€${num(n, 0, locale)}` : `${num(n, 0, locale)} €`;
}

/** "martes, 8 de diciembre de 2026". */
export function weekdayDay(iso: string, locale: TfLocale): string {
  return longDate(iso, locale);
}

/** "8 de diciembre de 2026". */
export function bareDay(iso: string, locale: TfLocale): string {
  return dayMonthYear(iso, locale);
}

export const STAGE_LABEL: Record<Stage, Record<TfLocale, string>> = {
  denuncia: {
    es: "Me ha llegado la denuncia (la notificación de la multa)",
    ca: "M'ha arribat la denúncia (la notificació de la multa)",
    en: "I have received the fine notice (the denuncia)",
  },
  resolucion: {
    es: "Me han notificado la resolución sancionadora (después de alegar)",
    ca: "M'han notificat la resolució sancionadora (després d'al·legar)",
    en: "I have been notified of the decision (resolución sancionadora, after contesting)",
  },
  apremio: {
    es: "Me ha llegado la providencia de apremio (cobro con recargo)",
    ca: "M'ha arribat la provisió de constrenyiment (cobrament amb recàrrec)",
    en: "I have received the enforcement notice (providencia de apremio, with surcharge)",
  },
};

export const CHANNEL_LABEL: Record<Channel, Record<TfLocale, string>> = {
  spot: { es: "En el acto: un agente te paró y te dio la denuncia", ca: "En l'acte: un agent t'aturà i et donà la denúncia", en: "On the spot: an officer stopped you and handed it over" },
  paper: { es: "Por correo postal (carta certificada)", ca: "Per correu postal (carta certificada)", en: "By post (registered letter)" },
  "dev-opened": { es: "En la DEV (Dirección Electrónica Vial) y la abriste", ca: "A la DEV (Dirección Electrónica Vial) i la vas obrir", en: "In your DEV (electronic road mailbox) and you opened it" },
  "dev-unopened": { es: "En la DEV y no la has abierto", ca: "A la DEV i no l'has obert", en: "In your DEV and you have not opened it" },
  teu: { es: "En el Tablón Edictal Único del BOE (TEU, antes TESTRA)", ca: "Al Tauler Edictal Únic del BOE (TEU, abans TESTRA)", en: "In the BOE's official notice board (TEU, formerly TESTRA)" },
};

/** The date field's label, by stage and channel. */
export function dateLabel(stage: Stage, channel: Channel, locale: TfLocale): string {
  const byStage: Record<Exclude<Stage, "denuncia">, Record<TfLocale, string>> = {
    resolucion: { es: "Día en que te notificaron la resolución", ca: "Dia en què et van notificar la resolució", en: "Day you were notified of the decision" },
    apremio: { es: "Día en que te notificaron la providencia de apremio", ca: "Dia en què et van notificar la provisió de constrenyiment", en: "Day you were notified of the enforcement notice" },
  };
  if (stage !== "denuncia") return byStage[stage][locale];
  const byChannel: Record<Channel, Record<TfLocale, string>> = {
    spot: { es: "Día de la denuncia", ca: "Dia de la denúncia", en: "Day of the stop" },
    paper: { es: "Día en que la recibiste (el del acuse de recibo)", ca: "Dia en què la vas rebre (el de l'avís de recepció)", en: "Day you received it (the one on the delivery receipt)" },
    "dev-opened": { es: "Día en que la abriste en la DEV", ca: "Dia en què la vas obrir a la DEV", en: "Day you opened it in the DEV" },
    "dev-unopened": { es: "Día en que llegó a tu buzón DEV", ca: "Dia en què va arribar a la teva bústia DEV", en: "Day it was put in your DEV mailbox" },
    teu: { es: "Día de publicación en el Tablón Edictal", ca: "Dia de publicació al Tauler Edictal", en: "Day it was published on the notice board" },
  };
  return byChannel[channel][locale];
}

export const SEVERITY_LABEL: Record<SeverityInput, Record<TfLocale, string>> = {
  leve: { es: "Leve", ca: "Lleu", en: "Minor (leve)" },
  grave: { es: "Grave", ca: "Greu", en: "Serious (grave)" },
  "muy-grave": { es: "Muy grave", ca: "Molt greu", en: "Very serious (muy grave)" },
  unknown: { es: "No lo sé", ca: "No ho sé", en: "I don't know" },
};

export const SURCHARGE_LABEL: Record<Surcharge, Record<TfLocale, string>> = {
  executive: { es: "Recargo ejecutivo (5 %): pagas todo antes de que te notifiquen la providencia de apremio", ca: "Recàrrec executiu (5 %): pagues tot abans que et notifiquin la provisió de constrenyiment", en: "5% surcharge (recargo ejecutivo): you pay it all before the enforcement notice reaches you" },
  reduced: { es: "Recargo de apremio reducido (10 %): pagas dentro del plazo de la providencia", ca: "Recàrrec de constrenyiment reduït (10 %): pagues dins del termini de la provisió", en: "10% surcharge (apremio reducido): you pay within the enforcement notice's deadline" },
  ordinary: { es: "Recargo de apremio ordinario (20 %) más intereses de demora: pagas después", ca: "Recàrrec de constrenyiment ordinari (20 %) més interessos de demora: pagues després", en: "20% surcharge (apremio ordinario) plus late interest: you pay later" },
};

/** The line under a deadline: inhábil last day, moved day, or holidays not known that far. */
export function dueNote(d: Due, locale: TfLocale): string | null {
  if (!d.reason && d.legal) return null;
  const day = weekdayDay(d.nominal, locale);
  const why = {
    saturday: { es: "sábado", ca: "dissabte", en: "a Saturday" },
    sunday: { es: "domingo", ca: "diumenge", en: "a Sunday" },
    holiday: { es: "festivo", ca: "festiu", en: "a public holiday" },
  } as const;
  if (!d.legal) {
    return {
      es: `No tenemos los festivos de esa fecha: si el ${day} fuera inhábil, el plazo pasaría al siguiente día hábil (Ley 39/2015, art. 30.5). Lo seguro: hazlo antes.`,
      ca: `No tenim els festius d'aquella data: si el ${day} fos inhàbil, el termini passaria al dia hàbil següent (Llei 39/2015, art. 30.5). El més segur: fes-ho abans.`,
      en: `We do not have the holidays that far ahead: if ${day} were not a working day, the deadline would move to the next one (Ley 39/2015, art. 30.5). Safest: act before then.`,
    }[locale];
  }
  const w = why[d.reason!][locale];
  return {
    es: `Ese día es ${w}: por la Ley 39/2015 (art. 30.5) el plazo se prorroga hasta el ${weekdayDay(d.legal, locale)}. Ni la DGT ni el Servei Català de Trànsit lo dicen en sus páginas: lo seguro es no esperar al último día.`,
    ca: `Aquell dia és ${w}: per la Llei 39/2015 (art. 30.5) el termini es prorroga fins al ${weekdayDay(d.legal, locale)}. Ni la DGT ni el Servei Català de Trànsit ho diuen a les seves pàgines: el més segur és no esperar a l'últim dia.`,
    en: `That day is ${w}: under Ley 39/2015 (art. 30.5) the deadline moves to ${weekdayDay(d.legal, locale)}. Neither the DGT nor the Servei Català de Trànsit says so on its pages: safest is not to wait for the last day.`,
  }[locale];
}

export interface CalcCopy {
  title: string;
  intro: string;
  noscript: string;
  example: string;
  stage: string;
  channel: string;
  amount: string;
  amountHint: string;
  severity: string;
  severityHint: string;
  points: string;
  excluded: string;
  excludedHint: string;
  offence: string;
  offenceHint: string;
  place: string;
  placeHint: string;
  notified: string;
  notifiedDev: (sent: string, deemed: string) => string;
  notifiedTeu: (law: string) => string;
  discount: string;
  discountLaw: (day: string) => string;
  reduced: (amount: string, full: string) => string;
  noDiscount: string;
  alegaciones: string;
  identify: string;
  identifyNote: string;
  left: (n: number) => string;
  today: string;
  expired: string;
  ifNothing: Record<IfNothing, string>;
  fullUntil: (amount: string) => string;
  surcharges: string;
  pointsBack: (paid: string, back: string) => string;
  prescription: (months: string, until: string) => string;
  prescriptionInside: string;
  prescriptionAfter: string;
  prescriptionBetween: string;
  reposicion: string;
  payFull: (amount: string) => string;
  resolutionNote: string;
  apremioDue: (amount: string) => string;
  apremioLater: (amount: string) => string;
  apremioNote: string;
  check: string;
  invalid: Record<InvalidReason, string>;
}

export const CALC_COPY: Record<TfLocale, CalcCopy> = {
  es: {
    title: "Calculadora: ¿hasta cuándo puedo pagar la multa con el 50 %?",
    intro: "Indica en qué punto estás, cómo te llegó la multa, el día y el importe. Te damos el último día para pagar con descuento, para alegar o identificar al conductor, y qué pasa si no haces nada. No pedimos matrícula ni DNI.",
    noscript: `Sin JavaScript ves el ejemplo: carta recibida el 18 de noviembre de 2026, 200 € sin puntos. Los ${DISCOUNT_DAYS} días naturales acaban el 8 de diciembre, festivo, y el plazo pasa al 9. Las tablas de abajo dan cada plazo con su artículo.`,
    example: "Ejemplo: carta recibida el 18 de noviembre de 2026, multa grave de 200 € sin puntos. Cambia los datos por los de tu multa.",
    stage: "¿En qué punto estás?",
    channel: "¿Cómo te llegó la denuncia?",
    amount: "Importe de la multa (€)",
    amountHint: "El que pone la notificación, sin recargos.",
    severity: "Tipo de infracción",
    severityHint: "Lo pone la notificación: leve, grave o muy grave.",
    points: "La multa quita puntos",
    excluded: "Es por no identificar al conductor, por un inhibidor de radar u otro caso sin descuento",
    excludedHint: "Ley de Tráfico, art. 93.2: la lista completa está debajo de la calculadora.",
    offence: "Día de la infracción (opcional)",
    offenceHint: "Para calcular la prescripción: 3 meses las leves, 6 las graves y muy graves.",
    place: "Dónde vives (para los festivos)",
    placeHint: "Cuentan los festivos nacionales y los de tu comunidad; los locales, no.",
    notified: "Cuenta como notificada el",
    notifiedDev: (sent, deemed) => `Llegó a la DEV el ${sent}: si no la abres en 10 días naturales, se da por rechazada y notificada el ${deemed} (Ley de Tráfico, art. 90.2). Si la abres antes, cuenta el día en que la abres.`,
    notifiedTeu: (law) => `La DGT toma como fecha de notificación la de publicación. La Ley de Tráfico (art. 91) la da por hecha 20 días después, el ${law}: no cuentes con esos días de más.`,
    discount: "Último día para pagar con el 50 %",
    discountLaw: (day) => `Contando como el art. 91, sería el ${day}.`,
    reduced: (amount, full) => `Pagas ${amount} en lugar de ${full}. Renuncias a alegar y la multa queda firme el día del pago (art. 94).`,
    noDiscount: "Esta infracción no tiene descuento del 50 % (Ley de Tráfico, art. 93.2): pagas el importe entero.",
    alegaciones: "Último día para presentar alegaciones",
    identify: "Último día para identificar al conductor",
    identifyNote: "Si no conducías tú o la multa quita puntos. La Ley da 20 días naturales (art. 93.1); la página de la DGT dice 10: hazlo cuanto antes.",
    left: (n) => (n === 1 ? "Te queda 1 día." : `Te quedan ${n} días.`),
    today: "Hoy es el último día.",
    expired: "El plazo ya ha pasado.",
    ifNothing: {
      "denuncia-resolves": "Si no pagas ni alegas en esos 20 días, la propia denuncia hace de resolución (art. 95.4): ya no hay descuento ni alegaciones.",
      "resolution-follows": "Si no pagas ni alegas, el procedimiento sigue: Tráfico te notificará una resolución, con un mes para el recurso de reposición y 15 días naturales para pagar entera la multa.",
      depends: "Si es leve o grave, la denuncia hace de resolución al acabar los 20 días; si es muy grave, Tráfico te notificará una resolución (art. 95.4).",
    },
    fullUntil: (amount) => `Hasta este día puedes pagar el importe entero, ${amount} (la DGT: 45 días desde la notificación; arts. 95.4 y 110.1)`,
    surcharges: "Si no la pagas, se cobra por vía de apremio con recargo sobre el importe entero:",
    pointsBack: (paid, back) => `Pagar con descuento no salva los puntos: la sanción queda firme y se restan (arts. 64 y 94). Si pagas el ${paid} y no te sancionan en firme por otra infracción con puntos, recuperas los 12 el ${back} (art. 65.1).`,
    prescription: (months, until) => `Prescripción: ${months} desde el día de los hechos, hasta el ${until} (art. 112.1).`,
    prescriptionInside: "La notificación llegó dentro de ese plazo y lo interrumpe (art. 112.2).",
    prescriptionAfter: "La notificación llegó después: puedes alegar que la infracción ha prescrito, salvo que antes hubiera otra actuación que la interrumpiera (un intento de notificación, una consulta para averiguar tu domicilio).",
    prescriptionBetween: "Depende de si es leve (3 meses) o grave o muy grave (6): mira la notificación.",
    reposicion: "Último día para el recurso de reposición (un mes)",
    payFull: (amount) => `Paga el importe entero, ${amount}, a más tardar`,
    resolutionNote: "La resolución pone fin a la vía administrativa y se puede ejecutar desde el día siguiente; el recurso de reposición no lo para (art. 96). Contamos los 15 días naturales del art. 110.1 desde la notificación, la lectura más segura. Ya no hay descuento del 50 %.",
    apremioDue: (amount) => `Paga ${amount} (multa + 10 %) a más tardar`,
    apremioLater: (amount) => `Después, ${amount} (multa + 20 %) más intereses de demora.`,
    apremioNote: "Plazo de la Ley General Tributaria (art. 62.5): notificada del 1 al 15, hasta el día 20 de ese mes; del 16 al final, hasta el día 5 del mes siguiente.",
    check: "Mira siempre la fecha y el plazo que pone tu notificación: si no coincide, manda lo que diga el organismo que te multó.",
    invalid: {
      date: "Escribe una fecha válida.",
      amount: "Escribe el importe de la multa en euros, mayor que cero.",
      offence: "El día de la infracción tiene que ser anterior a la notificación.",
      "leve-points": "Las infracciones leves no quitan puntos: solo las graves y muy graves (art. 64.1). Revisa el tipo.",
    },
  },
  ca: {
    title: "Calculadora: fins quan puc pagar la multa amb el 50 %?",
    intro: "Indica en quin punt ets, com et va arribar la multa, el dia i l'import. Et donem l'últim dia per pagar amb descompte, per al·legar o identificar el conductor, i què passa si no fas res. No demanem matrícula ni DNI.",
    noscript: `Sense JavaScript veus l'exemple: carta rebuda el 18 de novembre de 2026, 200 € sense punts. Els ${DISCOUNT_DAYS} dies naturals acaben el 8 de desembre, festiu, i el termini passa al 9. Les taules de sota donen cada termini amb el seu article.`,
    example: "Exemple: carta rebuda el 18 de novembre de 2026, multa greu de 200 € sense punts. Canvia les dades per les de la teva multa.",
    stage: "En quin punt ets?",
    channel: "Com et va arribar la denúncia?",
    amount: "Import de la multa (€)",
    amountHint: "El que posa la notificació, sense recàrrecs.",
    severity: "Tipus d'infracció",
    severityHint: "Ho posa la notificació: lleu, greu o molt greu.",
    points: "La multa treu punts",
    excluded: "És per no identificar el conductor, per un inhibidor de radar o un altre cas sense descompte",
    excludedHint: "Llei de trànsit, art. 93.2: la llista completa és sota la calculadora.",
    offence: "Dia de la infracció (opcional)",
    offenceHint: "Per calcular la prescripció: 3 mesos les lleus, 6 les greus i molt greus.",
    place: "On vius (per als festius)",
    placeHint: "Compten els festius estatals i els de la teva comunitat; els locals, no.",
    notified: "Compta com a notificada el",
    notifiedDev: (sent, deemed) => `Va arribar a la DEV el ${sent}: si no l'obres en 10 dies naturals, es dona per rebutjada i notificada el ${deemed} (Llei de trànsit, art. 90.2). Si l'obres abans, compta el dia que l'obres.`,
    notifiedTeu: (law) => `La DGT pren com a data de notificació la de publicació. La Llei de trànsit (art. 91) la dona per feta 20 dies després, el ${law}: no hi comptis, amb aquests dies de més.`,
    discount: "Últim dia per pagar amb el 50 %",
    discountLaw: (day) => `Comptant com l'art. 91, seria el ${day}.`,
    reduced: (amount, full) => `Pagues ${amount} en lloc de ${full}. Renuncies a al·legar i la multa és ferma el dia del pagament (art. 94).`,
    noDiscount: "Aquesta infracció no té descompte del 50 % (Llei de trànsit, art. 93.2): pagues l'import sencer.",
    alegaciones: "Últim dia per presentar al·legacions",
    identify: "Últim dia per identificar el conductor",
    identifyNote: "Si no conduïes tu o la multa treu punts. La Llei dona 20 dies naturals (art. 93.1); la pàgina de la DGT en diu 10: fes-ho com més aviat millor.",
    left: (n) => (n === 1 ? "Et queda 1 dia." : `Et queden ${n} dies.`),
    today: "Avui és l'últim dia.",
    expired: "El termini ja ha passat.",
    ifNothing: {
      "denuncia-resolves": "Si no pagues ni al·legues en aquests 20 dies, la mateixa denúncia fa de resolució (art. 95.4): ja no hi ha descompte ni al·legacions.",
      "resolution-follows": "Si no pagues ni al·legues, el procediment continua: Trànsit et notificarà una resolució, amb un mes per al recurs de reposició i 15 dies naturals per pagar sencera la multa.",
      depends: "Si és lleu o greu, la denúncia fa de resolució en acabar els 20 dies; si és molt greu, Trànsit et notificarà una resolució (art. 95.4).",
    },
    fullUntil: (amount) => `Fins a aquest dia pots pagar l'import sencer, ${amount} (la DGT: 45 dies des de la notificació; arts. 95.4 i 110.1)`,
    surcharges: "Si no la pagues, es cobra per via de constrenyiment amb recàrrec sobre l'import sencer:",
    pointsBack: (paid, back) => `Pagar amb descompte no salva els punts: la sanció és ferma i es resten (arts. 64 i 94). Si pagues el ${paid} i no et sancionen en ferm per una altra infracció amb punts, recuperes els 12 el ${back} (art. 65.1).`,
    prescription: (months, until) => `Prescripció: ${months} des del dia dels fets, fins al ${until} (art. 112.1).`,
    prescriptionInside: "La notificació va arribar dins d'aquest termini i l'interromp (art. 112.2).",
    prescriptionAfter: "La notificació va arribar després: pots al·legar que la infracció ha prescrit, tret que abans hi hagués una altra actuació que la interrompés (un intent de notificació, una consulta per esbrinar el teu domicili).",
    prescriptionBetween: "Depèn de si és lleu (3 mesos) o greu o molt greu (6): mira la notificació.",
    reposicion: "Últim dia per al recurs de reposició (un mes)",
    payFull: (amount) => `Paga l'import sencer, ${amount}, com a molt tard`,
    resolutionNote: "La resolució posa fi a la via administrativa i es pot executar des de l'endemà; el recurs de reposició no l'atura (art. 96). Comptem els 15 dies naturals de l'art. 110.1 des de la notificació, la lectura més segura. Ja no hi ha descompte del 50 %.",
    apremioDue: (amount) => `Paga ${amount} (multa + 10 %) com a molt tard`,
    apremioLater: (amount) => `Després, ${amount} (multa + 20 %) més interessos de demora.`,
    apremioNote: "Termini de la Llei general tributària (art. 62.5): notificada de l'1 al 15, fins al dia 20 d'aquell mes; del 16 al final, fins al dia 5 del mes següent.",
    check: "Mira sempre la data i el termini que posa la teva notificació: si no coincideix, mana el que digui l'organisme que et va multar.",
    invalid: {
      date: "Escriu una data vàlida.",
      amount: "Escriu l'import de la multa en euros, més gran que zero.",
      offence: "El dia de la infracció ha de ser anterior a la notificació.",
      "leve-points": "Les infraccions lleus no treuen punts: només les greus i molt greus (art. 64.1). Revisa el tipus.",
    },
  },
  en: {
    title: "Calculator: how long do I have to pay the fine with 50% off?",
    intro: "Tell us where you are in the process, how the fine reached you, the date and the amount. You get the last day to pay with the discount, to contest it or name the driver, and what happens if you do nothing. We never ask for a plate or ID.",
    noscript: `Without JavaScript you see the example: letter received on 18 November 2026, €200 with no points. The ${DISCOUNT_DAYS} calendar days end on 8 December, a public holiday, so the deadline moves to the 9th. The tables below give every deadline with its article.`,
    example: "Example: letter received on 18 November 2026, a €200 serious offence with no points. Change the details to your own fine's.",
    stage: "Where are you in the process?",
    channel: "How did the fine notice reach you?",
    amount: "Fine on the notice (€)",
    amountHint: "The amount on the notification, without surcharges.",
    severity: "Type of offence",
    severityHint: "The notification says it: leve, grave or muy grave.",
    points: "The fine takes points off my licence",
    excluded: "It is for not naming the driver, a radar jammer or another case with no discount",
    excludedHint: "Traffic Act, art. 93.2: the full list is below the calculator.",
    offence: "Day of the offence (optional)",
    offenceHint: "For the time limit (prescripción): 3 months for minor offences, 6 for serious and very serious ones.",
    place: "Where you live (for public holidays)",
    placeHint: "National and regional holidays count; local ones are not included.",
    notified: "It counts as notified on",
    notifiedDev: (sent, deemed) => `It reached your DEV on ${sent}: if you do not open it within 10 calendar days, it counts as refused and notified on ${deemed} (Traffic Act, art. 90.2). If you open it sooner, the day you open it counts.`,
    notifiedTeu: (law) => `The DGT takes the publication day as the notification date. The Traffic Act (art. 91) deems it made 20 days later, on ${law}: do not count on those extra days.`,
    discount: "Last day to pay with 50% off",
    discountLaw: (day) => `Counting as art. 91 does, it would be ${day}.`,
    reduced: (amount, full) => `You pay ${amount} instead of ${full}. You give up the right to contest it and the fine becomes final the day you pay (art. 94).`,
    noDiscount: "This offence has no 50% discount (Traffic Act, art. 93.2): you pay the full amount.",
    alegaciones: "Last day to contest it (alegaciones)",
    identify: "Last day to name the driver",
    identifyNote: "If you were not driving or the fine carries points. The Act gives 20 calendar days (art. 93.1); the DGT's page says 10: do it as soon as you can.",
    left: (n) => (n === 1 ? "1 day left." : `${n} days left.`),
    today: "Today is the last day.",
    expired: "The deadline has passed.",
    ifNothing: {
      "denuncia-resolves": "If you neither pay nor contest it within those 20 days, the notice itself becomes the final decision (art. 95.4): no more discount, no more alegaciones.",
      "resolution-follows": "If you neither pay nor contest it, the procedure goes on: Tráfico will notify you of a decision, with one month for an administrative appeal (reposición) and 15 calendar days to pay the full fine.",
      depends: "If it is minor or serious, the notice becomes the decision when the 20 days end; if it is very serious, Tráfico will notify you of a decision (art. 95.4).",
    },
    fullUntil: (amount) => `Until this day you can pay the full amount, ${amount} (the DGT: 45 days from the notification; arts. 95.4 and 110.1)`,
    surcharges: "If you do not pay, it is collected by enforcement with a surcharge on the full amount:",
    pointsBack: (paid, back) => `Paying with the discount does not save the points: the sanction becomes final and they come off (arts. 64 and 94). If you pay on ${paid} and get no other final sanction with points, you are back to 12 on ${back} (art. 65.1).`,
    prescription: (months, until) => `Time limit: ${months} from the day of the offence, until ${until} (art. 112.1).`,
    prescriptionInside: "The notification came within that period and interrupts it (art. 112.2).",
    prescriptionAfter: "The notification came after it: you can argue the offence is time-barred, unless something earlier interrupted it (an attempt to notify you, an inquiry to find your address).",
    prescriptionBetween: "It depends on whether it is minor (3 months) or serious or very serious (6): check the notification.",
    reposicion: "Last day for the administrative appeal (reposición, one month)",
    payFull: (amount) => `Pay the full amount, ${amount}, by`,
    resolutionNote: "The decision ends the administrative stage and can be enforced from the next day; an appeal does not stop it (art. 96). We count the 15 calendar days of art. 110.1 from the notification, the safest reading. There is no 50% discount any more.",
    apremioDue: (amount) => `Pay ${amount} (fine + 10%) by`,
    apremioLater: (amount) => `After that, ${amount} (fine + 20%) plus late interest.`,
    apremioNote: "Deadline under the General Tax Act (art. 62.5): notified on the 1st to the 15th, until the 20th of that month; on the 16th to the end, until the 5th of the next month.",
    check: "Always check the date and deadline on your own notification: if they differ, the authority that fined you has the last word.",
    invalid: {
      date: "Enter a valid date.",
      amount: "Enter the fine in euros, more than zero.",
      offence: "The day of the offence must be before the notification.",
      "leve-points": "Minor offences never carry points: only serious and very serious ones do (art. 64.1). Check the type.",
    },
  },
};

/** "3 meses" / "6 mesos" / "6 months". */
export function monthsText(n: number, locale: TfLocale): string {
  if (locale === "en") return n === 1 ? "1 month" : `${n} months`;
  if (locale === "ca") return n === 1 ? "1 mes" : `${n} mesos`;
  return n === 1 ? "1 mes" : `${n} meses`;
}

/** The letters of art. 77 without the 50 %, in the reader's words. */
export const LETTER_LABEL: Record<NoDiscountLetter, Record<TfLocale, string>> = {
  h: { es: "Conducir con un inhibidor de radar u otro mecanismo que interfiera en la vigilancia del tráfico", ca: "Conduir amb un inhibidor de radar o un altre mecanisme que interfereixi en la vigilància del trànsit", en: "Driving with a radar jammer or any device that interferes with traffic enforcement" },
  j: { es: "No identificar verazmente al conductor cuando el titular o el arrendatario del vehículo debe hacerlo", ca: "No identificar verament el conductor quan el titular o l'arrendatari del vehicle ho ha de fer", en: "The owner or renter not truthfully naming the driver when required" },
  n: { es: "Hacer obras en la vía sin autorización, o retirar, tapar, alterar o dañar la señalización", ca: "Fer obres a la via sense autorització, o retirar, tapar, alterar o malmetre la senyalització", en: "Roadworks without authorisation, or removing, hiding, altering or damaging road signs" },
  ñ: { es: "No señalizar las obras, o hacerlo mal, con grave riesgo para la seguridad vial", ca: "No senyalitzar les obres, o fer-ho malament, amb greu risc per a la seguretat viària", en: "Not signposting roadworks, or doing it wrongly, gravely endangering road safety" },
  o: { es: "Incumplir las normas de las actividades industriales que afectan a la seguridad vial", ca: "Incomplir les normes de les activitats industrials que afecten la seguretat viària", en: "Breaking the rules on industrial activities that affect road safety" },
  p: { es: "Instalar inhibidores de radar en los vehículos", ca: "Instal·lar inhibidors de radar als vehicles", en: "Installing radar jammers in vehicles" },
  q: { es: "Incumplir las normas de autoescuelas, centros de reeducación vial y centros de reconocimiento de conductores", ca: "Incomplir les normes d'autoescoles, centres de reeducació viària i centres de reconeixement de conductors", en: "Breaking the rules on driving schools, road re-education centres and driver medical centres" },
  r: { es: "Dañar la vía o alterar la circulación por la masa o las dimensiones del vehículo sin autorización", ca: "Danyar la via o alterar la circulació per la massa o les dimensions del vehicle sense autorització", en: "Damaging the road or disrupting traffic by the vehicle's weight or size without authorisation" },
  s: { es: "Incumplir las normas de los cursos de conducción segura y eficiente", ca: "Incomplir les normes dels cursos de conducció segura i eficient", en: "Breaking the rules on safe and efficient driving courses" },
  t: { es: "Incumplir las normas de actuación de los operadores vinculados a la Jefatura Central de Tráfico", ca: "Incomplir les normes d'actuació dels operadors vinculats a la Jefatura Central de Tráfico", en: "Breaking the rules for operators working with Tráfico's central office" },
};

/** Annex II rows in Catalan and English (the Spanish edition prints the annex's own words). */
export const ANNEX_LABEL: Record<"ca" | "en", readonly string[]> = {
  ca: [
    "Alcohol: més de 0,50 mg/l en aire espirat (professionals i permisos de menys de dos anys: més de 0,30)",
    "Alcohol: de més de 0,25 fins a 0,50 mg/l (professionals i permisos de menys de dos anys: de més de 0,15 fins a 0,30)",
    "Conduir amb presència de drogues a l'organisme",
    "No sotmetre's a les proves d'alcohol o de drogues",
    "Conducció temerària, circular en sentit contrari o curses no autoritzades",
    "Conduir amb inhibidors de radar o altres mecanismes que interfereixin en la vigilància",
    "Excedir en més del 50 % els temps de conducció o reduir en més del 50 % els de descans",
    "Participar en la manipulació del tacògraf o del limitador de velocitat",
    "Utilitzar el mòbil subjectant-lo amb la mà mentre condueixes",
    "Llançar a la via objectes que puguin provocar incendis o accidents",
    "No respectar la preferència de pas, l'stop, el cediu el pas o el semàfor en vermell",
    "Avançar posant en perill qui circula en sentit contrari, o amb visibilitat reduïda",
    "Avançar posant en perill ciclistes o sense deixar-hi 1,5 metres",
    "No respectar els senyals o les ordres dels agents",
    "No mantenir la distància de seguretat",
    "No dur, o no dur bé, el cinturó, el sistema de retenció infantil, el casc o altres proteccions obligatòries",
    "Conduir amb un permís que no habilita per a aquell vehicle",
    "Conduir amb el permís suspès o amb prohibició d'usar el vehicle",
    "Fer marxa enrere en autopistes i autovies",
    "Fer un canvi de sentit indegut",
    "Conduir amb auriculars, amb el mòbil entre el casc i el cap, o manipulant el navegador o el mòbil (fora del cas 8)",
    "Dur detectors de radar",
  ],
  en: [
    "Alcohol: over 0.50 mg/l in breath (professional drivers and licences under two years old: over 0.30)",
    "Alcohol: over 0.25 up to 0.50 mg/l (professional drivers and licences under two years old: over 0.15 up to 0.30)",
    "Driving with drugs in the body",
    "Refusing the alcohol or drug tests",
    "Reckless driving, driving the wrong way or unauthorised races",
    "Driving with radar jammers or other devices that interfere with enforcement",
    "Exceeding driving times or cutting rest times by more than 50%",
    "Taking part in tampering with the tachograph or the speed limiter",
    "Using a mobile phone held in the hand while driving",
    "Throwing objects onto the road that may cause fires or accidents",
    "Not giving way, or ignoring a stop sign, a give-way sign or a red light",
    "Overtaking dangerously towards oncoming traffic, or with poor visibility",
    "Overtaking cyclists dangerously or without leaving 1.5 metres",
    "Ignoring traffic signs or officers' orders",
    "Not keeping a safe distance",
    "Not wearing, or wrongly wearing, the seatbelt, child seat, helmet or other compulsory protection",
    "Driving a vehicle your licence does not cover",
    "Driving with a suspended licence or when banned from using the vehicle",
    "Reversing on motorways",
    "Making an illegal U-turn",
    "Driving with headphones, a phone between helmet and head, or handling a satnav or phone (other than no. 8)",
    "Carrying radar detectors",
  ],
};
