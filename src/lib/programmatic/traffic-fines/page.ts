import type { MetadataRoute } from "next";

import type { Calendar } from "@/lib/programmatic/working-days/engine";
import { absoluteUrl } from "@/lib/site";

import { TF_LOCALES, money, trafficFinesEditions, type TfLocale } from "./copy";
import { calculateOk, fine, type FineInput, type FineResult } from "./engine";
import { ANNEX_II, BASE_FINE, DISCOUNT_DAYS, DISCOUNT_RATE, FULL_PAYMENT_DAYS, POINTS, PRESCRIPTION_MONTHS, RED_LIGHT, RULES_AS_OF, SPECIAL_FINE, SPEED_BANDS, SURCHARGE_RATE } from "./rules";

/**
 * Pure pieces of the traffic-fines page: titles, the default input, the
 * worked examples (all computed by the engine on the calendar the page
 * passes, so the HTML and the calculator always agree), the FAQ and the
 * sitemap entries.
 */

/** The calculator's first render, on the server: a letter received on 18 Nov 2026, a 200 € grave without points. Day 20 is 8 December, a national holiday. */
export const DEFAULT_INPUT: FineInput = fine("2026-11-18", BASE_FINE.grave);

export interface TfMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  appName: string;
}

export function trafficFinesMeta(locale: TfLocale): TfMeta {
  return {
    es: {
      title: "Multas de tráfico: plazos, descuento del 50 % y recursos",
      description: `Calcula hasta qué día pagas una multa de la DGT con el 50 % (${DISCOUNT_DAYS} días naturales), alegas o recurres, qué multas no tienen descuento y qué pasa si no pagas.`,
      h1: "Multas de tráfico: plazos, descuento del 50 % y recursos",
      breadcrumb: "Multas de tráfico",
      appName: "Calculadora de plazos de las multas de tráfico (Ley de Tráfico, Real Decreto Legislativo 6/2015)",
    },
    ca: {
      title: "Multes de trànsit: terminis, descompte del 50 % i recursos",
      description: `Calcula fins a quin dia pagues una multa de trànsit amb el 50 % (${DISCOUNT_DAYS} dies naturals), al·legues o recorres, quines no tenen descompte i què passa si no pagues.`,
      h1: "Multes de trànsit: terminis, descompte del 50 % i recursos",
      breadcrumb: "Multes de trànsit",
      appName: "Calculadora de terminis de les multes de trànsit (Llei de trànsit, Reial decret legislatiu 6/2015)",
    },
    en: {
      title: "Spanish traffic fines: 50% discount deadline and appeals",
      description: `Last day to pay a Spanish traffic fine with 50% off (${DISCOUNT_DAYS} calendar days), contest or appeal it, which fines get no discount and what happens if you don't pay.`,
      h1: "Spanish traffic fines: deadlines, the 50% discount and appeals",
      breadcrumb: "Traffic fines",
      appName: "Spanish traffic fine deadline calculator (Traffic Act, Royal Legislative Decree 6/2015)",
    },
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Worked examples                                                            */
/* -------------------------------------------------------------------------- */

export type ExampleId = "paper-holiday" | "spot-mobile" | "speed-points" | "dev-unopened" | "teu" | "no-identify" | "resolution" | "apremio";

export function exampleInputs(): [ExampleId, FineInput][] {
  return [
    ["paper-holiday", DEFAULT_INPUT],
    // Mobile phone held in the hand: grave (art. 76 g), 200 €, 6 points (annex II no. 8), notice handed over at the stop.
    ["spot-mobile", fine("2026-11-18", BASE_FINE.grave, { channel: "spot", points: true })],
    // Radar, 300 € and 2 points (annex IV), letter received on 1 Dec 2026.
    ["speed-points", fine("2026-12-01", 300, { points: true })],
    ["dev-unopened", fine("2026-11-20", BASE_FINE.grave, { channel: "dev-unopened" })],
    ["teu", fine("2026-11-16", BASE_FINE.leveMax, { channel: "teu", severity: "leve" })],
    // Not naming the driver of a grave: muy grave (art. 77 j), three times 200 € (art. 80.2 b), no 50 % (art. 93.2).
    ["no-identify", fine("2026-11-25", 3 * BASE_FINE.grave, { severity: "muy-grave", excluded: true })],
    ["resolution", { ...fine("2026-11-18", BASE_FINE.grave), stage: "resolucion" }],
    ["apremio", { ...fine("2026-11-18", BASE_FINE.grave), stage: "apremio" }],
  ];
}

export interface Example {
  id: ExampleId;
  input: FineInput;
  result: Extract<FineResult, { status: "ok" }>;
}

/** The worked examples, in the page's order, on `cal` (the page uses all of Spain). */
export function examples(cal: Calendar): Example[] {
  return exampleInputs().map(([id, input]) => ({ id, input, result: calculateOk(input, cal) }));
}

/* -------------------------------------------------------------------------- */
/* Sitemap and FAQ                                                            */
/* -------------------------------------------------------------------------- */

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML. */
export function trafficFinesSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  const e = trafficFinesEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return TF_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

/** The FAQ, with every figure from the rules (also the FAQPage JSON-LD). */
export function trafficFinesFaq(locale: TfLocale): { q: string; a: string }[] {
  const M = (n: number) => money(n, locale);
  const grave = BASE_FINE.grave;
  const half = grave * (1 - DISCOUNT_RATE);
  const pct = (r: number) => (locale === "en" ? `${Math.round(r * 100)}%` : `${Math.round(r * 100)} %`);
  const [s5, s10, s20] = [SURCHARGE_RATE.executive, SURCHARGE_RATE.reduced, SURCHARGE_RATE.ordinary].map(pct);
  // 27 Nov 2026 (GSC 28 d): "cuanto tarda en llegar una multa por saltarse un semaforo", "importe multas", "sanciones trafico", "multas y sanciones", "sancions transit".
  const redPoints = ANNEX_II.find((r) => r.n === RED_LIGHT.annexRow)!.points;
  const [leve, muyGrave] = [BASE_FINE.leveMax, BASE_FINE.muyGrave];
  const halves = [leve, grave, muyGrave].map((n) => M(n * (1 - DISCOUNT_RATE)));
  const phonePoints = ANNEX_II.find((r) => r.n === "8")!.points;
  const speedFines = SPEED_BANDS.map((b) => b.fine);
  const [speedMin, speedMax] = [M(Math.min(...speedFines)), M(Math.max(...speedFines))];
  return {
    es: [
      {
        q: "¿Cuántos días tengo para pagar una multa con el 50 % de descuento?",
        a: `${DISCOUNT_DAYS} días naturales, contados desde el día siguiente a la notificación (Ley de Tráfico, art. 94): cuentan sábados, domingos y festivos. Una multa grave de ${M(grave)} se queda en ${M(half)}. Si el día ${DISCOUNT_DAYS} cae en sábado, domingo o festivo, la Ley 39/2015 (art. 30.5) lo pasa al siguiente día hábil, pero ni la DGT ni el Servei Català de Trànsit lo dicen: lo seguro es pagar antes.`,
      },
      {
        q: "¿Qué multas no tienen descuento del 50 %?",
        a: "Las del artículo 93.2 de la Ley de Tráfico: conducir con un inhibidor de radar o instalarlo, no identificar verazmente al conductor cuando te lo piden, y varias infracciones de empresas y obras (obras y señales en la vía, actividades industriales, autoescuelas y centros, daños por peso o dimensiones, cursos de conducción segura y operadores de Tráfico). El alcohol, las drogas, la velocidad o el móvil sí tienen descuento.",
      },
      {
        q: "¿Si pago la multa con descuento pierdo los puntos?",
        a: `Sí. Pagar con el 50 % es aceptar la sanción: queda firme el día del pago y los puntos se restan igual (arts. 64 y 94). Recuperas los ${POINTS.initial} puntos si pasan ${POINTS.recoveryYears} años sin otra sanción firme que quite puntos, o antes con un curso de recuperación (${POINTS.course} puntos, una vez cada ${POINTS.courseEveryYears} años).`,
      },
      {
        q: "¿Qué pasa si no pago una multa de tráfico?",
        a: `Pasados los ${DISCOUNT_DAYS} días pierdes el descuento. La DGT da ${FULL_PAYMENT_DAYS} días desde la notificación para pagar el importe entero; después la cobra la Agencia Tributaria por vía de apremio con recargo: ${s5} si pagas antes de recibir la providencia de apremio, ${s10} si pagas en su plazo y ${s20} más intereses después. En Cataluña cobra la Agència Tributària de Catalunya. La multa no se puede aplazar ni fraccionar, según la DGT.`,
      },
      {
        q: "¿Cuándo prescribe una multa de tráfico?",
        a: `La infracción prescribe a los ${PRESCRIPTION_MONTHS.leve} meses si es leve y a los ${PRESCRIPTION_MONTHS.grave} si es grave o muy grave, desde el día de los hechos; la notificación y cualquier gestión para encontrarte lo interrumpen (art. 112). Si no hay resolución en un año desde que empezó el procedimiento, caduca. Una multa ya firme prescribe a los cuatro años.`,
      },
      {
        q: "¿Qué pasa si el último día del plazo es festivo?",
        a: "La Ley de Tráfico no lo dice; se aplica la Ley 39/2015 (art. 30.5): si el último día es inhábil (sábado, domingo o festivo), el plazo se prorroga al primer día hábil siguiente, y cuenta como inhábil un festivo donde vives o donde está el organismo (art. 30.6). La calculadora te da los dos días: el seguro y el prorrogado.",
      },
      {
        q: "¿Desde cuándo cuentan los 20 días si la multa está en la DEV o en el Tablón Edictal?",
        a: "En la DEV, desde el día en que la abres; si no la abres en 10 días naturales, se da por rechazada y notificada (art. 90.2). En el Tablón Edictal Único (TEU), la DGT cuenta desde el día de publicación, aunque el artículo 91 de la ley la da por notificada 20 días después: cuenta desde la publicación.",
      },
      {
        q: "¿Cómo recurro una multa de tráfico?",
        a: `Con alegaciones en los ${DISCOUNT_DAYS} días naturales siguientes a la notificación (art. 95.1), ante el organismo que te multó; si alegas, pierdes el descuento. Contra la resolución sancionadora cabe recurso de reposición en un mes (art. 96.2), que no detiene el cobro, o recurso contencioso-administrativo en dos meses.`,
      },
      {
        q: "¿Cuánto tarda en llegar una multa de tráfico?",
        a: `No hay un plazo fijo de envío. Si no te paran (radar, cámara de semáforo, coche aparcado), la ley permite notificarla después (art. 89.2), y Tráfico tiene hasta que la infracción prescribe: ${PRESCRIPTION_MONTHS.leve} meses desde el día de los hechos si es leve y ${PRESCRIPTION_MONTHS.grave} si es grave o muy grave (art. 112). Saltarse un semáforo en rojo es grave (art. 76 k): ${M(grave)}, ${M(grave * (1 - DISCOUNT_RATE))} con el 50 %, y ${redPoints} puntos. Si te llega pasado ese plazo y antes no hubo ninguna notificación ni gestión para localizarte, la infracción ha prescrito y puedes alegarlo.`,
      },
      {
        q: "¿Cuánto es una multa de tráfico leve, grave o muy grave?",
        a: `Las leves, hasta ${M(leve)}; las graves, ${M(grave)}, y las muy graves, ${M(muyGrave)} (Ley de Tráfico, art. 80.1). Pagando en ${DISCOUNT_DAYS} días con el 50 % se quedan en un máximo de ${halves[0]}, ${halves[1]} y ${halves[2]}. La velocidad va por la tabla del anexo IV (de ${speedMin} a ${speedMax}), y el alcohol o las drogas en los casos del artículo 80.2 a), ${M(SPECIAL_FINE.alcoholDrugs)}. Algunas restan puntos: el móvil en la mano, ${phonePoints}; el semáforo en rojo, ${redPoints}.`,
      },
    ],
    ca: [
      {
        q: "Quants dies tinc per pagar una multa amb el 50 % de descompte?",
        a: `${DISCOUNT_DAYS} dies naturals, comptats des de l'endemà de la notificació (Llei de trànsit, art. 94): compten dissabtes, diumenges i festius. Una multa greu de ${M(grave)} es queda en ${M(half)}. Si el dia ${DISCOUNT_DAYS} cau en dissabte, diumenge o festiu, la Llei 39/2015 (art. 30.5) el passa al dia hàbil següent, però ni la DGT ni el Servei Català de Trànsit ho diuen: el més segur és pagar abans.`,
      },
      {
        q: "Quines multes no tenen descompte del 50 %?",
        a: "Les de l'article 93.2 de la Llei de trànsit: conduir amb un inhibidor de radar o instal·lar-lo, no identificar verament el conductor quan t'ho demanen, i diverses infraccions d'empreses i obres (obres i senyals a la via, activitats industrials, autoescoles i centres, danys per pes o dimensions, cursos de conducció segura i operadors de Trànsit). L'alcohol, les drogues, la velocitat o el mòbil sí que tenen descompte.",
      },
      {
        q: "Si pago la multa amb descompte perdo els punts?",
        a: `Sí. Pagar amb el 50 % és acceptar la sanció: és ferma el dia del pagament i els punts es resten igualment (arts. 64 i 94). Recuperes els ${POINTS.initial} punts si passen ${POINTS.recoveryYears} anys sense cap altra sanció ferma que tregui punts, o abans amb un curs de recuperació (${POINTS.course} punts, un cop cada ${POINTS.courseEveryYears} anys).`,
      },
      {
        q: "Què passa si no pago una multa de trànsit?",
        a: `Passats els ${DISCOUNT_DAYS} dies perds el descompte. La DGT dona ${FULL_PAYMENT_DAYS} dies des de la notificació per pagar l'import sencer; després la cobra l'Agència Tributària per via de constrenyiment amb recàrrec: ${s5} si pagues abans de rebre la provisió de constrenyiment, ${s10} si pagues en el seu termini i ${s20} més interessos després. A Catalunya cobra l'Agència Tributària de Catalunya. La multa no es pot ajornar ni fraccionar, segons la DGT.`,
      },
      {
        q: "Quan prescriu una multa de trànsit?",
        a: `La infracció prescriu als ${PRESCRIPTION_MONTHS.leve} mesos si és lleu i als ${PRESCRIPTION_MONTHS.grave} si és greu o molt greu, des del dia dels fets; la notificació i qualsevol gestió per trobar-te ho interrompen (art. 112). Si no hi ha resolució en un any des que va començar el procediment, caduca. Una multa ja ferma prescriu als quatre anys.`,
      },
      {
        q: "Què passa si l'últim dia del termini és festiu?",
        a: "La Llei de trànsit no ho diu; s'aplica la Llei 39/2015 (art. 30.5): si l'últim dia és inhàbil (dissabte, diumenge o festiu), el termini es prorroga al primer dia hàbil següent, i compta com a inhàbil un festiu on vius o on hi ha l'organisme (art. 30.6). La calculadora et dona els dos dies: el segur i el prorrogat.",
      },
      {
        q: "Des de quan compten els 20 dies si la multa és a la DEV o al Tauler Edictal?",
        a: "A la DEV, des del dia que l'obres; si no l'obres en 10 dies naturals, es dona per rebutjada i notificada (art. 90.2). Al Tauler Edictal Únic (TEU), la DGT compta des del dia de publicació, encara que l'article 91 de la llei la dona per notificada 20 dies després: compta des de la publicació.",
      },
      {
        q: "Com recorro una multa de trànsit?",
        a: `Amb al·legacions en els ${DISCOUNT_DAYS} dies naturals següents a la notificació (art. 95.1), davant l'organisme que et va multar; si al·legues, perds el descompte. Contra la resolució sancionadora hi ha recurs de reposició en un mes (art. 96.2), que no atura el cobrament, o recurs contenciós administratiu en dos mesos.`,
      },
      {
        q: "Quant triga a arribar una multa de trànsit?",
        a: `No hi ha un termini fix d'enviament. Si no t'aturen (radar, càmera de semàfor, cotxe aparcat), la llei permet notificar-la després (art. 89.2), i Trànsit té fins que la infracció prescriu: ${PRESCRIPTION_MONTHS.leve} mesos des del dia dels fets si és lleu i ${PRESCRIPTION_MONTHS.grave} si és greu o molt greu (art. 112). Saltar-se un semàfor en vermell és greu (art. 76 k): ${M(grave)}, ${M(grave * (1 - DISCOUNT_RATE))} amb el 50 %, i ${redPoints} punts. Si t'arriba passat aquest termini i abans no hi va haver cap notificació ni gestió per localitzar-te, la infracció ha prescrit i ho pots al·legar.`,
      },
      {
        q: "Quant és una multa de trànsit lleu, greu o molt greu?",
        a: `Les lleus, fins a ${M(leve)}; les greus, ${M(grave)}, i les molt greus, ${M(muyGrave)} (Llei de trànsit, art. 80.1). Pagant en ${DISCOUNT_DAYS} dies amb el 50 % es queden en un màxim de ${halves[0]}, ${halves[1]} i ${halves[2]}. La velocitat va per la taula de l'annex IV (de ${speedMin} a ${speedMax}), i l'alcohol o les drogues en els casos de l'article 80.2 a), ${M(SPECIAL_FINE.alcoholDrugs)}. Algunes resten punts: el mòbil a la mà, ${phonePoints}; el semàfor en vermell, ${redPoints}.`,
      },
    ],
    en: [
      {
        q: "How many days do I have to pay a Spanish traffic fine with 50% off?",
        a: `${DISCOUNT_DAYS} calendar days (días naturales), counted from the day after the notification (Traffic Act, art. 94): Saturdays, Sundays and holidays count. A ${M(grave)} serious-offence fine drops to ${M(half)}. If day ${DISCOUNT_DAYS} falls on a Saturday, Sunday or holiday, Ley 39/2015 (art. 30.5) moves it to the next working day, but neither the DGT nor the Servei Català de Trànsit says so: paying earlier is safest.`,
      },
      {
        q: "Which fines get no 50% discount?",
        a: "Those in article 93.2 of the Traffic Act: driving with or installing a radar jammer, not truthfully naming the driver when asked, and several business and roadworks offences (works and signs on the road, industrial activities, driving schools and centres, damage from weight or size, safe-driving courses and Tráfico's operators). Alcohol, drugs, speeding and the mobile phone do get the discount.",
      },
      {
        q: "If I pay with the discount, do I still lose the points?",
        a: `Yes. Paying with 50% off means accepting the sanction: it becomes final the day you pay and the points still come off (arts. 64 and 94). You are back to ${POINTS.initial} points after ${POINTS.recoveryYears} years with no other final sanction carrying points, or sooner with a recovery course (${POINTS.course} points, once every ${POINTS.courseEveryYears} years).`,
      },
      {
        q: "What happens if I don't pay a traffic fine in Spain?",
        a: `After the ${DISCOUNT_DAYS} days the discount is gone. The DGT gives ${FULL_PAYMENT_DAYS} days from the notification to pay the full amount; then the Tax Agency collects it by enforcement with a surcharge: ${s5} if you pay before the enforcement notice reaches you, ${s10} within its deadline and ${s20} plus interest after that. In Catalonia the Catalan Tax Agency (ATC) collects. The DGT says fines cannot be deferred or paid in instalments.`,
      },
      {
        q: "When does a Spanish traffic fine expire?",
        a: `The offence is time-barred after ${PRESCRIPTION_MONTHS.leve} months if minor and ${PRESCRIPTION_MONTHS.grave} if serious or very serious, from the day it happened; the notification and any step to find you interrupt that (art. 112). With no decision within a year of the procedure starting, it lapses. A final fine is time-barred after four years.`,
      },
      {
        q: "What if the last day of the deadline is a public holiday?",
        a: "The Traffic Act does not say; Ley 39/2015 applies (art. 30.5): if the last day is not a working day (Saturday, Sunday or holiday), the deadline moves to the next working day, and a holiday where you live or where the authority sits counts (art. 30.6). The calculator gives you both days: the safe one and the moved one.",
      },
      {
        q: "When do the 20 days start if the fine is in my DEV or on the notice board?",
        a: "In the DEV, the day you open it; if you do not open it within 10 calendar days, it counts as refused and notified (art. 90.2). On the BOE's notice board (TEU), the DGT counts from the publication day, although article 91 of the Act deems it notified 20 days later: count from the publication.",
      },
      {
        q: "How do I appeal a Spanish traffic fine?",
        a: `By filing alegaciones within ${DISCOUNT_DAYS} calendar days of the notification (art. 95.1), with the authority that fined you; if you do, you lose the discount. Against the decision you can file a recurso de reposición within one month (art. 96.2), which does not stop collection, or go to court (contencioso-administrativo) within two months.`,
      },
      {
        q: "How long does a Spanish traffic fine take to arrive?",
        a: `There is no fixed sending time. If you are not stopped (speed camera, red-light camera, parked car), the law allows notice later (art. 89.2), and Tráfico has until the offence is time-barred: ${PRESCRIPTION_MONTHS.leve} months from the day it happened if minor and ${PRESCRIPTION_MONTHS.grave} if serious or very serious (art. 112). Running a red light is serious (art. 76 k): ${M(grave)}, ${M(grave * (1 - DISCOUNT_RATE))} with 50% off, and ${redPoints} points. If it reaches you after that period and there was no earlier notification or step to trace you, the offence is time-barred and you can say so in your alegaciones.`,
      },
      {
        q: "How much is a minor, serious or very serious traffic fine in Spain?",
        a: `Minor offences, up to ${M(leve)}; serious, ${M(grave)}; very serious, ${M(muyGrave)} (Traffic Act, art. 80.1). Paid within ${DISCOUNT_DAYS} days with 50% off they come to ${halves[0]} at most, ${halves[1]} and ${halves[2]}. Speeding follows the annex IV table (${speedMin} to ${speedMax}), and alcohol or drugs in the cases of article 80.2 a), ${M(SPECIAL_FINE.alcoholDrugs)}. Some take points: a hand-held phone, ${phonePoints}; a red light, ${redPoints}.`,
      },
    ],
  }[locale];
}
