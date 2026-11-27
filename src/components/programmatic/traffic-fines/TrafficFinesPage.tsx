import { AdSlot } from "@/components/AdSlot";
import { crumbPath } from "@/components/share/ShareBar";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SourcesPolicyLink } from "@/components/SourcesPolicyLink";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { itvPath } from "@/lib/programmatic/itv/copy";
import { ANNEX_LABEL, CHANNEL_LABEL, LETTER_LABEL, bareDay, money, trafficFinesEditions, trafficFinesPath, weekdayDay, type TfLocale } from "@/lib/programmatic/traffic-fines/copy";
import type { Due } from "@/lib/programmatic/traffic-fines/engine";
import { DEFAULT_INPUT, examples, trafficFinesFaq, trafficFinesMeta, type Example, type ExampleId } from "@/lib/programmatic/traffic-fines/page";
import { DEFAULT_PLACE, NATIONAL_ID, calendarOf, finePlaces } from "@/lib/programmatic/traffic-fines/places";
import {
  ANNEX_II,
  BASE_FINE,
  DISCOUNT_DAYS,
  DISCOUNT_RATE,
  FULL_PAYMENT_DAYS,
  GRADUATION_MAX,
  NO_DISCOUNT_DRIVER,
  NO_DISCOUNT_LETTERS,
  POINTS,
  QUOTE,
  RULES_AS_OF,
  SERVICES,
  SOURCES,
  SPECIAL_FINE,
  SPEED_BANDS,
  SPEED_LIMITS,
  SURCHARGES,
  SURCHARGE_RATE,
  type NoDiscountLetter,
} from "@/lib/programmatic/traffic-fines/rules";
import { workingDaysPath } from "@/lib/programmatic/working-days/copy";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { TrafficFinesCalculator } from "./TrafficFinesCalculator";

/**
 * "Multas de tráfico: plazos, descuento del 50 % y recursos" / "Multes de
 * trànsit" / "Spanish traffic fines": the deadline calculator (server-rendered
 * on DEFAULT_INPUT: a letter received on 18 Nov 2026, day 20 a national
 * holiday), the official services to pay or check a fine, then every
 * deadline with its article, the 50 % and the fines without it (and why
 * other pages disagree), when a fine counts as notified, a last day on a
 * holiday, what happens if you do nothing, apremio and surcharges, amounts
 * and the speeding table, points and how to get them back, prescription,
 * who fines (DGT, Servei Català de Trànsit, councils), worked examples,
 * questions, sources and limits. Every figure comes from rules.ts through
 * the engine.
 */

const L = <T,>(locale: TfLocale, v: Record<TfLocale, T>): T => v[locale];

export function trafficFinesCrumbs(locale: TfLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: trafficFinesMeta(locale).breadcrumb, href: trafficFinesPath(locale) }];
}

export function trafficFinesMetadata(locale: TfLocale): Metadata {
  const m = trafficFinesMeta(locale);
  return buildMetadata({ locale, path: trafficFinesPath(locale), title: m.title, description: m.description, translations: trafficFinesEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ text, href, label, lang = "es" }: { text: string; href: string; label: string; lang?: "es" | "ca" }) {
  return (
    <blockquote lang={lang}>
      <p>«{text}»</p>
      <footer className="text-sm">
        <A href={href}>{label}</A>
      </footer>
    </blockquote>
  );
}

const md = (text: string) => text.split(/\*\*/).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));

function exampleLabel(id: ExampleId, ex: Example, locale: TfLocale): string {
  const M = money(ex.input.amount, locale);
  const d = bareDay(ex.input.date, locale);
  const labels: Record<ExampleId, Record<TfLocale, string>> = {
    "paper-holiday": { es: `Carta recibida el ${d}, multa grave de ${M} sin puntos`, ca: `Carta rebuda el ${d}, multa greu de ${M} sense punts`, en: `Letter received on ${d}, ${M} serious offence, no points` },
    "spot-mobile": { es: `Móvil en la mano, denuncia en el acto el ${d}: ${M} y 6 puntos`, ca: `Mòbil a la mà, denúncia en l'acte el ${d}: ${M} i 6 punts`, en: `Phone in hand, notice handed over on ${d}: ${M} and 6 points` },
    "speed-points": { es: `Radar, carta recibida el ${d}: ${M} y 2 puntos`, ca: `Radar, carta rebuda el ${d}: ${M} i 2 punts`, en: `Speed camera, letter received on ${d}: ${M} and 2 points` },
    "dev-unopened": { es: `Llegó a la DEV el ${d} y no la abres: ${M}`, ca: `Va arribar a la DEV el ${d} i no l'obres: ${M}`, en: `Put in your DEV on ${d}, never opened: ${M}` },
    teu: { es: `Publicada en el Tablón Edictal el ${d}, leve de ${M}`, ca: `Publicada al Tauler Edictal el ${d}, lleu de ${M}`, en: `Published on the notice board on ${d}, ${M} minor offence` },
    "no-identify": { es: `No identificar al conductor de una grave (el triple): ${M}, carta del ${d}`, ca: `No identificar el conductor d'una greu (el triple): ${M}, carta del ${d}`, en: `Not naming the driver of a serious offence (three times): ${M}, letter of ${d}` },
    resolution: { es: `Resolución sancionadora notificada el ${d}, ${M}`, ca: `Resolució sancionadora notificada el ${d}, ${M}`, en: `Decision notified on ${d}, ${M}` },
    apremio: { es: `Providencia de apremio notificada el ${d}, multa de ${M}`, ca: `Provisió de constrenyiment notificada el ${d}, multa de ${M}`, en: `Enforcement notice served on ${d}, ${M} fine` },
  };
  return labels[id][locale];
}

/** "8 de diciembre de 2026 → 9 de diciembre (festivo)" for a table cell. */
function dueCell(d: Due, locale: TfLocale): string {
  const day = bareDay(d.nominal, locale);
  if (!d.reason || !d.legal) return day;
  const moved = { es: "prorrogado al", ca: "prorrogat al", en: "moved to" }[locale];
  return `${day} → ${moved} ${bareDay(d.legal, locale)}`;
}

export function TrafficFinesRoute({ locale }: { locale: TfLocale }) {
  const meta = trafficFinesMeta(locale);
  const crumbs = trafficFinesCrumbs(locale);
  const M = (n: number) => money(n, locale);
  const P = (r: number) => (locale === "en" ? `${Math.round(r * 100)}%` : `${Math.round(r * 100)} %`);
  const on = (iso: string) => bareDay(iso, locale);
  const faq = trafficFinesFaq(locale);
  const places = finePlaces(locale);
  const national = calendarOf(places.find((p) => p.id === NATIONAL_ID)!);
  const exs = examples(national);
  const grave = BASE_FINE.grave;
  const half = grave * (1 - DISCOUNT_RATE);
  const lsv = (art: string) => L(locale, { es: `Ley de Tráfico (RDL 6/2015), ${art}`, ca: `Llei de trànsit (RDL 6/2015), ${art}`, en: `Traffic Act (RDL 6/2015), ${art}` });
  const l39 = (art: string) => `Ley 39/2015, ${art}`;
  const lgt = (art: string) => L(locale, { es: `Ley General Tributaria, ${art}`, ca: `Llei general tributària, ${art}`, en: `General Tax Act, ${art}` });
  const dgtLabel = L(locale, { es: "DGT, «¿Qué hacer si has recibido una multa?»", ca: "DGT, «¿Qué hacer si has recibido una multa?» (en castellà)", en: "DGT, «¿Qué hacer si has recibido una multa?» (in Spanish)" });

  const lead = L(locale, {
    es: `Tienes ${DISCOUNT_DAYS} días naturales, contados desde el día siguiente a la notificación, para pagar una multa de tráfico con el 50 % de descuento (${M(grave)} → ${M(half)}) o para presentar alegaciones; cuentan sábados, domingos y festivos. Pagar es renunciar a alegar, y los puntos se pierden igual. No tienen descuento, entre otras, las multas por no identificar al conductor y por inhibidores de radar. Si no pagas ni alegas, la DGT da ${FULL_PAYMENT_DAYS} días para pagar el importe entero; después se cobra con recargo del 5 al 20 %.`,
    ca: `Tens ${DISCOUNT_DAYS} dies naturals, comptats des de l'endemà de la notificació, per pagar una multa de trànsit amb el 50 % de descompte (${M(grave)} → ${M(half)}) o per presentar al·legacions; compten dissabtes, diumenges i festius. Pagar és renunciar a al·legar, i els punts es perden igualment. No tenen descompte, entre d'altres, les multes per no identificar el conductor i per inhibidors de radar. Si no pagues ni al·legues, la DGT dona ${FULL_PAYMENT_DAYS} dies per pagar l'import sencer; després es cobra amb recàrrec del 5 al 20 %.`,
    en: `You have ${DISCOUNT_DAYS} calendar days, counted from the day after the notification, to pay a Spanish traffic fine with 50% off (${M(grave)} → ${M(half)}) or to contest it; Saturdays, Sundays and holidays count. Paying means giving up the right to contest, and the points still come off. Fines for not naming the driver and for radar jammers, among others, get no discount. If you neither pay nor contest, the DGT gives ${FULL_PAYMENT_DAYS} days to pay the full amount; after that it is collected with a 5% to 20% surcharge.`,
  });
  const fresh = L(locale, {
    es: `Normas revisadas el ${on(RULES_AS_OF)} en el BOE (Ley de Tráfico consolidada a ${on("2026-06-26")}, Ley 39/2015, Ley General Tributaria, Orden INT/914/2024), la DGT y el Servei Català de Trànsit.`,
    ca: `Normes revisades el ${on(RULES_AS_OF)} al BOE (Llei de trànsit consolidada a ${on("2026-06-26")}, Llei 39/2015, Llei general tributària, Ordre INT/914/2024), la DGT i el Servei Català de Trànsit.`,
    en: `Rules checked on ${on(RULES_AS_OF)} in the BOE (Traffic Act consolidated to ${on("2026-06-26")}, Ley 39/2015, General Tax Act, Orden INT/914/2024), with the DGT and the Servei Català de Trànsit.`,
  });
  const disclaimer = L(locale, {
    es: "Cálculo orientativo con la Ley de Tráfico estatal y las normas citadas; no es asesoramiento jurídico. Los plazos que valen son los de tu notificación y los del organismo que te multó (DGT, Servei Català de Trànsit, Ertzaintza o ayuntamiento): si no coinciden, manda lo que diga la notificación. Aquí nunca te pedimos matrícula, DNI ni número de expediente: las multas se consultan y pagan en los servicios oficiales.",
    ca: "Càlcul orientatiu amb la Llei de trànsit estatal i les normes citades; no és assessorament jurídic. Els terminis que valen són els de la teva notificació i els de l'organisme que et va multar (DGT, Servei Català de Trànsit, Ertzaintza o ajuntament): si no coincideixen, mana el que digui la notificació. Aquí no et demanem mai matrícula, DNI ni número d'expedient: les multes es consulten i es paguen als serveis oficials.",
    en: "An estimate under the national Traffic Act and the rules cited; not legal advice. The deadlines that count are those on your notification and of the authority that fined you (DGT, Servei Català de Trànsit, Ertzaintza or the council): if they differ, the notification wins. We never ask for your plate, ID or file number: fines are checked and paid on the official services.",
  });

  const hd = L(locale, {
    es: { services: "Pagar o consultar la multa en el servicio oficial", deadlines: "Todos los plazos de una multa de tráfico", discount: "El descuento del 50 %: cuándo y qué supone", noDiscount: "Qué multas no tienen descuento", why: "Por qué otras páginas dan listas distintas", notified: "Cuándo cuenta como notificada", holiday: "Si el último día es sábado, domingo o festivo", nothing: "Alegaciones, recursos y qué pasa si no haces nada", apremio: "Si no pagas: apremio y recargos", amounts: "Cuánto es la multa", speed: "Multas y puntos por exceso de velocidad", points: "Puntos: qué los quita y cómo recuperarlos", prescription: "Prescripción y caducidad", who: "¿Quién te ha multado? DGT, Servei Català de Trànsit o ayuntamiento", examples: "Ejemplos", faq: "Preguntas frecuentes", sources: "Fuentes oficiales", limits: "Qué no calcula" },
    ca: { services: "Pagar o consultar la multa al servei oficial", deadlines: "Tots els terminis d'una multa de trànsit", discount: "El descompte del 50 %: quan i què suposa", noDiscount: "Quines multes no tenen descompte", why: "Per què altres pàgines donen llistes diferents", notified: "Quan compta com a notificada", holiday: "Si l'últim dia és dissabte, diumenge o festiu", nothing: "Al·legacions, recursos i què passa si no fas res", apremio: "Si no pagues: constrenyiment i recàrrecs", amounts: "Quant és la multa", speed: "Multes i punts per excés de velocitat", points: "Punts: què els treu i com recuperar-los", prescription: "Prescripció i caducitat", who: "Qui t'ha multat? DGT, Servei Català de Trànsit o ajuntament", examples: "Exemples", faq: "Preguntes freqüents", sources: "Fonts oficials", limits: "Què no calcula" },
    en: { services: "Pay or check the fine on the official service", deadlines: "Every deadline of a Spanish traffic fine", discount: "The 50% discount: when, and what it means", noDiscount: "Which fines get no discount", why: "Why other pages give different lists", notified: "When it counts as notified", holiday: "If the last day is a Saturday, Sunday or holiday", nothing: "Contesting, appeals and what happens if you do nothing", apremio: "If you don't pay: enforcement and surcharges", amounts: "How much the fine is", speed: "Speeding fines and points", points: "Points: what takes them and how to get them back", prescription: "Time limits (prescripción and caducidad)", who: "Who fined you? DGT, Servei Català de Trànsit or the council", examples: "Worked examples", faq: "Questions", sources: "Official sources", limits: "What it does not cover" },
  });

  /* Official services ---------------------------------------------------- */
  const inSpanish = L(locale, { es: "", ca: " (en castellà)", en: " (in Spanish)" });
  const services: { label: string; href: string }[] = [
    { label: L(locale, { es: "Pagar una multa de la DGT", ca: "Pagar una multa de la DGT", en: "Pay a DGT fine" }) + inSpanish, href: SERVICES.dgtPay },
    { label: L(locale, { es: "Alegar o recurrir una multa de la DGT", ca: "Al·legar o recórrer una multa de la DGT", en: "Contest or appeal a DGT fine" }) + inSpanish, href: SERVICES.dgtAppeal },
    { label: L(locale, { es: "Tu buzón DEV (Dirección Electrónica Vial): alta y notificaciones", ca: "La teva bústia DEV (Dirección Electrónica Vial): alta i notificacions", en: "Your DEV mailbox (Dirección Electrónica Vial): sign-up and notifications" }) + inSpanish, href: SERVICES.dgtDev },
    { label: L(locale, { es: "Consultar el Tablón Edictal (TEU)", ca: "Consultar el Tauler Edictal (TEU)", en: "Search the notice board (TEU)" }) + inSpanish, href: SERVICES.dgtTeu },
    { label: L(locale, { es: "Consultar tus puntos", ca: "Consultar els teus punts", en: "Check your points" }) + inSpanish, href: SERVICES.dgtPoints },
    { label: L(locale, { es: "Pagar una multa del Servei Català de Trànsit", ca: "Pagar una multa del Servei Català de Trànsit", en: "Pay a Servei Català de Trànsit fine (in Spanish)" }), href: locale === "ca" ? SERVICES.sctPay.ca : SERVICES.sctPay.es },
  ];
  const servicesNote = L(locale, {
    es: `La DGT nunca notifica multas por correo electrónico: un correo que te pide pagar una multa es un fraude. Si la multa es de un ayuntamiento, se paga y se recurre ante ese ayuntamiento.`,
    ca: `La DGT no notifica mai multes per correu electrònic: un correu que et demana pagar una multa és un frau. Si la multa és d'un ajuntament, es paga i es recorre davant d'aquell ajuntament.`,
    en: `The DGT never notifies fines by email: an email asking you to pay a fine is a scam. If the fine is a council's, you pay or appeal it with that council.`,
  });

  /* Deadlines table -------------------------------------------------------- */
  const dCols = L(locale, { es: ["Qué", "Plazo", "Desde", "Norma"], ca: ["Què", "Termini", "Des de", "Norma"], en: ["What", "Deadline", "From", "Rule"] });
  const days = (n: number) => L(locale, { es: `${n} días naturales`, ca: `${n} dies naturals`, en: `${n} calendar days` });
  const afterNotice = L(locale, { es: "el día siguiente a la notificación", ca: "l'endemà de la notificació", en: "the day after the notification" });
  const deadlineRows: [string, string, string, string][] = L(locale, {
    es: [
      ["Pagar con el 50 %", days(DISCOUNT_DAYS), afterNotice, "Ley de Tráfico, art. 94"],
      ["Presentar alegaciones", days(DISCOUNT_DAYS), afterNotice, "art. 95.1"],
      ["Identificar al conductor (si no te pararon)", days(DISCOUNT_DAYS), afterNotice, "art. 93.1 (la DGT dice 10 días)"],
      ["Pagar el 100 % si la denuncia hace de resolución", `${FULL_PAYMENT_DAYS} días (30 + 15)`, "la notificación", "arts. 95.4 y 110.1; DGT"],
      ["Pagar el 100 % tras la resolución sancionadora", days(15), "que la sanción es firme", "art. 110.1"],
      ["Recurso de reposición", "1 mes", "el día siguiente a la notificación de la resolución", "art. 96.2"],
      ["Recurso contencioso-administrativo", "2 meses", "el día siguiente a la notificación de lo que se recurre", "Ley 29/1998, art. 46.1"],
      ["Pagar la providencia de apremio con el 10 %", "hasta el día 20 o el 5", "la notificación de la providencia", "Ley General Tributaria, art. 62.5"],
      ["Prescripción de la infracción", "3 meses leves, 6 graves y muy graves", "el mismo día de los hechos", "art. 112.1"],
      ["Caducidad del procedimiento", "1 año sin resolución", "el inicio del procedimiento", "art. 112.3"],
      ["Prescripción de la multa firme", "4 años", "el día siguiente a la firmeza", "art. 112.4"],
    ],
    ca: [
      ["Pagar amb el 50 %", days(DISCOUNT_DAYS), afterNotice, "Llei de trànsit, art. 94"],
      ["Presentar al·legacions", days(DISCOUNT_DAYS), afterNotice, "art. 95.1"],
      ["Identificar el conductor (si no et van aturar)", days(DISCOUNT_DAYS), afterNotice, "art. 93.1 (la DGT diu 10 dies)"],
      ["Pagar el 100 % si la denúncia fa de resolució", `${FULL_PAYMENT_DAYS} dies (30 + 15)`, "la notificació", "arts. 95.4 i 110.1; DGT"],
      ["Pagar el 100 % després de la resolució sancionadora", days(15), "que la sanció és ferma", "art. 110.1"],
      ["Recurs de reposició", "1 mes", "l'endemà de la notificació de la resolució", "art. 96.2"],
      ["Recurs contenciós administratiu", "2 mesos", "l'endemà de la notificació del que es recorre", "Llei 29/1998, art. 46.1"],
      ["Pagar la provisió de constrenyiment amb el 10 %", "fins al dia 20 o el 5", "la notificació de la provisió", "Llei general tributària, art. 62.5"],
      ["Prescripció de la infracció", "3 mesos lleus, 6 greus i molt greus", "el mateix dia dels fets", "art. 112.1"],
      ["Caducitat del procediment", "1 any sense resolució", "l'inici del procediment", "art. 112.3"],
      ["Prescripció de la multa ferma", "4 anys", "l'endemà de la fermesa", "art. 112.4"],
    ],
    en: [
      ["Pay with 50% off", days(DISCOUNT_DAYS), afterNotice, "Traffic Act, art. 94"],
      ["Contest it (alegaciones)", days(DISCOUNT_DAYS), afterNotice, "art. 95.1"],
      ["Name the driver (if you were not stopped)", days(DISCOUNT_DAYS), afterNotice, "art. 93.1 (the DGT says 10 days)"],
      ["Pay 100% when the notice becomes the decision", `${FULL_PAYMENT_DAYS} days (30 + 15)`, "the notification", "arts. 95.4 and 110.1; DGT"],
      ["Pay 100% after a decision", days(15), "the sanction becoming final", "art. 110.1"],
      ["Administrative appeal (reposición)", "1 month", "the day after the decision is notified", "art. 96.2"],
      ["Court appeal (contencioso-administrativo)", "2 months", "the day after the act appealed is notified", "Law 29/1998, art. 46.1"],
      ["Pay the enforcement notice with 10%", "until the 20th or the 5th", "the notice being served", "General Tax Act, art. 62.5"],
      ["Time limit of the offence", "3 months minor, 6 serious and very serious", "the same day as the offence", "art. 112.1"],
      ["Procedure lapses (caducidad)", "1 year with no decision", "the start of the procedure", "art. 112.3"],
      ["Time limit of a final fine", "4 years", "the day after it became final", "art. 112.4"],
    ],
  });

  /* The 50 % -------------------------------------------------------------- */
  const discountText = L(locale, {
    es: `Si pagas en el acto o en los ${DISCOUNT_DAYS} días naturales siguientes a la notificación, pagas la mitad. A cambio, **renuncias a alegar** (si alegas, se tiene por no presentado), el procedimiento acaba el día del pago sin resolución y la sanción queda firme: solo cabe ir a los tribunales. Las graves sin puntos pagadas así no cuentan como antecedente. Los puntos **se pierden igual**. Según la DGT, la multa no se puede aplazar ni fraccionar.`,
    ca: `Si pagues en l'acte o en els ${DISCOUNT_DAYS} dies naturals següents a la notificació, pagues la meitat. A canvi, **renuncies a al·legar** (si al·legues, es té per no presentat), el procediment s'acaba el dia del pagament sense resolució i la sanció és ferma: només es pot anar als tribunals. Les greus sense punts pagades així no compten com a antecedent. Els punts **es perden igualment**. Segons la DGT, la multa no es pot ajornar ni fraccionar.`,
    en: `Pay on the spot or within ${DISCOUNT_DAYS} calendar days of the notification and you pay half. In exchange you **give up contesting it** (any alegaciones are treated as not filed), the procedure ends the day you pay with no decision, and the sanction becomes final: only the courts remain. Serious offences without points paid this way do not go on your record. The points **still come off**. The DGT says a fine cannot be deferred or paid in instalments.`,
  });
  const noDiscountText = L(locale, {
    es: "El artículo 93.2 de la Ley de Tráfico deja fuera del procedimiento abreviado, y por tanto del 50 %, diez infracciones muy graves del artículo 77. Un conductor particular puede encontrarse con las tres primeras de la lista; las demás son de empresas, obras o centros:",
    ca: "L'article 93.2 de la Llei de trànsit deixa fora del procediment abreujat, i per tant del 50 %, deu infraccions molt greus de l'article 77. Un conductor particular es pot trobar amb les tres primeres de la llista; les altres són d'empreses, obres o centres:",
    en: "Article 93.2 of the Traffic Act excludes ten very serious offences of article 77 from the abbreviated procedure, and so from the 50%. A private driver may meet the first three on the list; the rest concern businesses, roadworks or centres:",
  });
  const driverFirst: NoDiscountLetter[] = [...NO_DISCOUNT_DRIVER, ...NO_DISCOUNT_LETTERS.filter((l) => !NO_DISCOUNT_DRIVER.includes(l))];
  const whyText = L(locale, {
    es: `La lista cambió el 21 de marzo de 2022 (Ley 18/2021), que añadió las letras s) y t). La página de la DGT («¿Qué hacer si has recibido una multa?», actualizada el 26/07/2023) solo enumera cuatro grupos y la del Servei Català de Trànsit (29/10/2024), ocho: la del texto de 2015. Manda el texto consolidado del BOE. El alcohol, las drogas, la velocidad, el móvil o la ITV caducada **sí** tienen descuento. La multa por no identificar al conductor es el doble de la original si era leve y el triple si era grave o muy grave (art. 80.2.b): una grave de ${M(grave)} pasa a ${M(3 * grave)}, sin descuento.`,
    ca: `La llista va canviar el 21 de març de 2022 (Llei 18/2021), que hi va afegir les lletres s) i t). La pàgina de la DGT («¿Qué hacer si has recibido una multa?», actualitzada el 26/07/2023) només enumera quatre grups i la del Servei Català de Trànsit (29/10/2024), vuit: la del text del 2015. Mana el text consolidat del BOE. L'alcohol, les drogues, la velocitat, el mòbil o l'ITV caducada **sí que** tenen descompte. La multa per no identificar el conductor és el doble de l'original si era lleu i el triple si era greu o molt greu (art. 80.2.b): una greu de ${M(grave)} passa a ${M(3 * grave)}, sense descompte.`,
    en: `The list changed on 21 March 2022 (Ley 18/2021), which added letters s) and t). The DGT's page («¿Qué hacer si has recibido una multa?», updated 26/07/2023) lists only four groups and the Servei Català de Trànsit's (29/10/2024) eight: the 2015 text. The BOE's consolidated text is what counts. Alcohol, drugs, speeding, the mobile phone or an expired ITV **do** get the discount. The fine for not naming the driver is double the original if it was minor and triple if serious or very serious (art. 80.2.b): a ${M(grave)} serious offence becomes ${M(3 * grave)}, with no discount.`,
  });

  /* Notification ------------------------------------------------------------ */
  const nCols = L(locale, { es: ["Cómo te llega", "Qué día cuenta como notificada", "Norma"], ca: ["Com t'arriba", "Quin dia compta com a notificada", "Norma"], en: ["How it reaches you", "The day it counts as notified", "Rule"] });
  const notifyRows: [string, string, string][] = L(locale, {
    es: [
      [CHANNEL_LABEL.spot.es, "El mismo día", "arts. 89.1 y 93.1"],
      [CHANNEL_LABEL.paper.es, "El día de la entrega, la recibas tú o cualquier persona de tu domicilio que se identifique; si no hay nadie, se intenta otra vez en tres días y, si tampoco, va al BOE", "art. 90.3"],
      [CHANNEL_LABEL["dev-opened"].es, "El día en que accedes a su contenido", "art. 90.2"],
      [CHANNEL_LABEL["dev-unopened"].es, "A los 10 días naturales de llegar al buzón: se da por rechazada y el trámite por hecho", "art. 90.2; Ley 39/2015, art. 43.2"],
      [CHANNEL_LABEL.teu.es, "Para la DGT, el día de publicación; la ley la da por hecha 20 días naturales después", "art. 91; DGT"],
    ],
    ca: [
      [CHANNEL_LABEL.spot.ca, "El mateix dia", "arts. 89.1 i 93.1"],
      [CHANNEL_LABEL.paper.ca, "El dia del lliurament, la rebis tu o qualsevol persona del teu domicili que s'identifiqui; si no hi ha ningú, s'intenta un altre cop en tres dies i, si tampoc, va al BOE", "art. 90.3"],
      [CHANNEL_LABEL["dev-opened"].ca, "El dia en què accedeixes al contingut", "art. 90.2"],
      [CHANNEL_LABEL["dev-unopened"].ca, "Als 10 dies naturals d'arribar a la bústia: es dona per rebutjada i el tràmit per fet", "art. 90.2; Llei 39/2015, art. 43.2"],
      [CHANNEL_LABEL.teu.ca, "Per a la DGT, el dia de publicació; la llei la dona per feta 20 dies naturals després", "art. 91; DGT"],
    ],
    en: [
      [CHANNEL_LABEL.spot.en, "That same day", "arts. 89.1 and 93.1"],
      [CHANNEL_LABEL.paper.en, "The day it is delivered, to you or anyone at your address who gives their name; if nobody is in, it is tried again within three days and, failing that, it goes to the BOE", "art. 90.3"],
      [CHANNEL_LABEL["dev-opened"].en, "The day you open its content", "art. 90.2"],
      [CHANNEL_LABEL["dev-unopened"].en, "10 calendar days after it reaches the mailbox: it counts as refused and the step as done", "art. 90.2; Ley 39/2015, art. 43.2"],
      [CHANNEL_LABEL.teu.en, "For the DGT, the publication day; the Act deems it made 20 calendar days later", "art. 91; DGT"],
    ],
  });
  const teuText = L(locale, {
    es: "**Tablón Edictal: la DGT y la ley no cuentan igual.** El artículo 91 dice que la notificación publicada en el BOE se entiende hecha cuando pasan 20 días naturales; la DGT, en su página de notificaciones y en su revista, cuenta los 20 días para pagar o alegar desde la publicación. La calculadora usa la fecha de la DGT, la más temprana, y te enseña la otra. El TESTRA, que la ley aún nombra, era un tablón previo y voluntario; hoy la DGT publica en el Tablón Edictal Único del BOE (TEU). Si te das de alta en la DEV, te llegan ahí también las multas del Servei Català de Trànsit, de la Dirección de Tráfico del Gobierno Vasco y de los ayuntamientos adheridos, y ya no por correo.",
    ca: "**Tauler Edictal: la DGT i la llei no compten igual.** L'article 91 diu que la notificació publicada al BOE s'entén feta quan passen 20 dies naturals; la DGT, a la seva pàgina de notificacions i a la seva revista, compta els 20 dies per pagar o al·legar des de la publicació. La calculadora fa servir la data de la DGT, la més primerenca, i t'ensenya l'altra. El TESTRA, que la llei encara anomena, era un tauler previ i voluntari; avui la DGT publica al Tauler Edictal Únic del BOE (TEU). Si et dones d'alta a la DEV, t'hi arriben també les multes del Servei Català de Trànsit, de la Direcció de Trànsit del Govern Basc i dels ajuntaments adherits, i ja no per correu.",
    en: "**Notice board: the DGT and the Act count differently.** Article 91 says a notification published in the BOE is deemed made once 20 calendar days have passed; the DGT, on its notifications page and in its magazine, counts the 20 days to pay or contest from the publication. The calculator uses the DGT's date, the earlier one, and shows you the other. TESTRA, which the Act still names, was an earlier optional board; today the DGT publishes on the BOE's single notice board (TEU). If you sign up to the DEV, fines from the Servei Català de Trànsit, the Basque traffic authority and member councils reach you there too, and no longer by post.",
  });

  /* Holiday --------------------------------------------------------------- */
  const holidayText = L(locale, {
    es: `Los ${DISCOUNT_DAYS} días son naturales: cuentan todos. La Ley de Tráfico no dice qué pasa si el último cae en sábado, domingo o festivo, y remite a la ley de procedimiento común (art. 83.1). Esa ley, la 39/2015, prorroga el plazo al primer día hábil siguiente (art. 30.5), y cuenta como inhábil un día que lo sea donde vives o donde está el organismo (art. 30.6). Ni la DGT ni el Servei Català de Trànsit lo explican en sus páginas, así que la calculadora te da los dos: **el día ${DISCOUNT_DAYS}, el seguro**, y el prorrogado, con los festivos nacionales y los de tu comunidad. Los festivos locales no los incluye: los tienes, municipio a municipio, en la calculadora de días hábiles.`,
    ca: `Els ${DISCOUNT_DAYS} dies són naturals: compten tots. La Llei de trànsit no diu què passa si l'últim cau en dissabte, diumenge o festiu, i remet a la llei de procediment comú (art. 83.1). Aquesta llei, la 39/2015, prorroga el termini al primer dia hàbil següent (art. 30.5), i compta com a inhàbil un dia que ho sigui on vius o on hi ha l'organisme (art. 30.6). Ni la DGT ni el Servei Català de Trànsit ho expliquen a les seves pàgines, així que la calculadora et dona tots dos: **el dia ${DISCOUNT_DAYS}, el segur**, i el prorrogat, amb els festius estatals i els de la teva comunitat. Els festius locals no hi són: els tens, municipi a municipi, a la calculadora de dies hàbils.`,
    en: `The ${DISCOUNT_DAYS} days are calendar days: every day counts. The Traffic Act does not say what happens if the last one falls on a Saturday, Sunday or holiday, and refers to the general administrative procedure law (art. 83.1). That law, Ley 39/2015, moves the deadline to the next working day (art. 30.5), and a day off where you live or where the authority sits counts (art. 30.6). Neither the DGT nor the Servei Català de Trànsit explains this on its pages, so the calculator gives you both: **day ${DISCOUNT_DAYS}, the safe one**, and the moved one, with national and regional holidays. Local holidays are not included: the working-days calculator has them town by town.`,
  });

  /* Doing nothing ------------------------------------------------------------ */
  const nothingText = L(locale, {
    es: `Puedes **alegar** en los ${DISCOUNT_DAYS} días naturales, con pruebas, ante el organismo que te multó (pierdes el descuento). Si no pagas ni alegas, **la propia denuncia hace de resolución** en las leves, en las graves sin puntos que no te notificaron en el acto y en las graves y muy graves notificadas en el acto: se puede cobrar a los 30 días de la notificación y tienes 15 más para pagarla entera; la DGT lo resume en ${FULL_PAYMENT_DAYS} días. En las demás (graves con puntos o muy graves que te llegaron después, como una foto de radar con puntos), Tráfico tiene que dictar una **resolución sancionadora**. Contra ella cabe **recurso de reposición** en un mes, que no detiene el cobro, o recurso contencioso-administrativo en dos meses.`,
    ca: `Pots **al·legar** en els ${DISCOUNT_DAYS} dies naturals, amb proves, davant l'organisme que et va multar (perds el descompte). Si no pagues ni al·legues, **la mateixa denúncia fa de resolució** en les lleus, en les greus sense punts que no et van notificar en l'acte i en les greus i molt greus notificades en l'acte: es pot cobrar als 30 dies de la notificació i en tens 15 més per pagar-la sencera; la DGT ho resumeix en ${FULL_PAYMENT_DAYS} dies. En les altres (greus amb punts o molt greus que et van arribar després, com una foto de radar amb punts), Trànsit ha de dictar una **resolució sancionadora**. Contra aquesta hi ha **recurs de reposició** en un mes, que no atura el cobrament, o recurs contenciós administratiu en dos mesos.`,
    en: `You can **contest** within the ${DISCOUNT_DAYS} calendar days, with evidence, before the authority that fined you (you lose the discount). If you neither pay nor contest, **the notice itself becomes the decision** for minor offences, for serious ones without points not notified on the spot, and for serious and very serious ones notified on the spot: it can be enforced 30 days after the notification and you have 15 more to pay it in full; the DGT sums it up as ${FULL_PAYMENT_DAYS} days. In the other cases (serious offences with points or very serious ones that reached you later, such as a speed-camera photo with points), Tráfico must issue a **decision**. Against it you can file a **recurso de reposición** within one month, which does not stop collection, or go to court within two months.`,
  });

  /* Apremio ---------------------------------------------------------------- */
  const sCols = L(locale, { es: ["Cuándo pagas", "Recargo", `Multa de ${M(grave)}`], ca: ["Quan pagues", "Recàrrec", `Multa de ${M(grave)}`], en: ["When you pay", "Surcharge", `${M(grave)} fine`] });
  const sWhen: Record<(typeof SURCHARGES)[number], Record<TfLocale, string>> = {
    executive: { es: "Todo, antes de que te notifiquen la providencia de apremio", ca: "Tot, abans que et notifiquin la provisió de constrenyiment", en: "All of it, before the enforcement notice is served" },
    reduced: { es: "Todo y el recargo, dentro del plazo de la providencia (día 20 o día 5)", ca: "Tot i el recàrrec, dins del termini de la provisió (dia 20 o dia 5)", en: "All of it and the surcharge, within the notice's deadline (the 20th or the 5th)" },
    ordinary: { es: "Después, con intereses de demora", ca: "Després, amb interessos de demora", en: "Later, with late interest" },
  };
  const apremioText = L(locale, {
    es: `Pasado el periodo voluntario, la multa se cobra por **vía de apremio** con las reglas tributarias de quien la puso (art. 110.2). Las de la DGT las cobra la Agencia Tributaria y la DGT habla de un recargo del 20 %; la Ley General Tributaria (art. 28) tiene tres escalones, sobre el importe entero de la multa. En Cataluña, las del Servei Català de Trànsit las cobra la Agència Tributària de Catalunya, con los mismos escalones del 10 y el 20 %; las de un ayuntamiento, su propio servicio de recaudación.`,
    ca: `Passat el període voluntari, la multa es cobra per **via de constrenyiment** amb les regles tributàries de qui la va posar (art. 110.2). Les de la DGT les cobra l'Agència Tributària i la DGT parla d'un recàrrec del 20 %; la Llei general tributària (art. 28) té tres esglaons, sobre l'import sencer de la multa. A Catalunya, les del Servei Català de Trànsit les cobra l'Agència Tributària de Catalunya, amb els mateixos esglaons del 10 i el 20 %; les d'un ajuntament, el seu propi servei de recaptació.`,
    en: `Once the voluntary period is over, the fine is collected by **enforcement (vía de apremio)** under the tax rules of whoever imposed it (art. 110.2). The DGT's are collected by the Tax Agency and the DGT speaks of a 20% surcharge; the General Tax Act (art. 28) has three steps, on the full fine. In Catalonia, the Servei Català de Trànsit's are collected by the Catalan Tax Agency (ATC), with the same 10% and 20% steps; a council's, by its own collection service.`,
  });

  /* Amounts ----------------------------------------------------------------- */
  const aCols = L(locale, { es: ["Infracción", "Multa", "Con el 50 %"], ca: ["Infracció", "Multa", "Amb el 50 %"], en: ["Offence", "Fine", "With 50% off"] });
  const noDisc = L(locale, { es: "Sin descuento", ca: "Sense descompte", en: "No discount" });
  const upTo = (n: number) => L(locale, { es: `hasta ${M(n)}`, ca: `fins a ${M(n)}`, en: `up to ${M(n)}` });
  const amountRows: [string, string, string][] = [
    [L(locale, { es: "Leve", ca: "Lleu", en: "Minor (leve)" }), upTo(BASE_FINE.leveMax), upTo(BASE_FINE.leveMax / 2)],
    [L(locale, { es: "Grave", ca: "Greu", en: "Serious (grave)" }), M(BASE_FINE.grave), M(BASE_FINE.grave / 2)],
    [L(locale, { es: "Muy grave", ca: "Molt greu", en: "Very serious (muy grave)" }), M(BASE_FINE.muyGrave), M(BASE_FINE.muyGrave / 2)],
    [L(locale, { es: "Alcohol (reincidente en el año o más del doble de la tasa) y drogas", ca: "Alcohol (reincident en l'any o més del doble de la taxa) i drogues", en: "Alcohol (repeat within the year, or over twice the limit) and drugs" }), M(SPECIAL_FINE.alcoholDrugs), M(SPECIAL_FINE.alcoholDrugs / 2)],
    [L(locale, { es: "No identificar al conductor", ca: "No identificar el conductor", en: "Not naming the driver" }), L(locale, { es: "el doble (leve) o el triple (grave o muy grave) de la original", ca: "el doble (lleu) o el triple (greu o molt greu) de l'original", en: "double (minor) or triple (serious or very serious) the original" }), noDisc],
    [L(locale, { es: "Conducir con inhibidor de radar", ca: "Conduir amb inhibidor de radar", en: "Driving with a radar jammer" }), M(SPECIAL_FINE.jammer), noDisc],
    [L(locale, { es: "Obras, industrias, centros, cursos y operadores (art. 77 n a t)", ca: "Obres, indústries, centres, cursos i operadors (art. 77 n a t)", en: "Works, industry, centres, courses and operators (art. 77 n to t)" }), `${M(SPECIAL_FINE.businessMin)} – ${M(SPECIAL_FINE.businessMax)}`, noDisc],
  ];
  const amountsNote = L(locale, {
    es: `Las multas del artículo 80.1 y las de velocidad pueden subir hasta un ${P(GRADUATION_MAX)} por la gravedad, los antecedentes, la reincidencia o el peligro (art. 81). Los ayuntamientos aplican sus ordenanzas dentro de estos importes.`,
    ca: `Les multes de l'article 80.1 i les de velocitat poden pujar fins a un ${P(GRADUATION_MAX)} per la gravetat, els antecedents, la reincidència o el perill (art. 81). Els ajuntaments apliquen les seves ordenances dins d'aquests imports.`,
    en: `The fines of article 80.1 and speeding fines can rise by up to ${P(GRADUATION_MAX)} for seriousness, record, repeat offending or danger (art. 81). Councils apply their bylaws within these amounts.`,
  });
  const speedCaption = L(locale, {
    es: "Velocidad medida por radar, km/h, según el límite de la vía (anexo IV de la Ley de Tráfico). Entre paréntesis, la multa pagada con el 50 %.",
    ca: "Velocitat mesurada pel radar, km/h, segons el límit de la via (annex IV de la Llei de trànsit). Entre parèntesis, la multa pagada amb el 50 %.",
    en: "Speed measured by the camera, km/h, by the road's limit (annex IV of the Traffic Act). In brackets, the fine paid with 50% off.",
  });
  const pts = (n: number) => (n === 0 ? L(locale, { es: "sin puntos", ca: "sense punts", en: "no points" }) : L(locale, { es: `${n} puntos`, ca: `${n} punts`, en: `${n} points` }));
  const limitWord = L(locale, { es: "Límite", ca: "Límit", en: "Limit" });

  /* Points ---------------------------------------------------------------- */
  const pCols = L(locale, { es: ["Infracción (anexo II)", "Puntos"], ca: ["Infracció (annex II)", "Punts"], en: ["Offence (annex II)", "Points"] });
  const pointsText = L(locale, {
    es: [
      `Empiezas con **${POINTS.initial} puntos** (${POINTS.novice} si tu permiso tiene tres años o menos o lo has recuperado tras perderlos todos). Sin sanciones firmes, ganas ${POINTS.bonusFirst} a los tres años y ${POINTS.bonusSecond} más a los tres siguientes, hasta ${POINTS.max} (art. 63).`,
      `Los puntos se restan cuando la sanción es firme, y pagar con descuento la hace firme. No pierdes más de ${POINTS.dayCap} en un día, salvo con alcohol, drogas, negarte a las pruebas, exceso de velocidad muy grave, conducción temeraria, sentido contrario, carreras, inhibidores o tiempos de conducción (art. 64.4).`,
      `**Recuperas los ${POINTS.initial}** cuando pasan ${POINTS.recoveryYears} años sin sanciones firmes con puntos (art. 65.1). Desde el 21 de marzo de 2022 son dos años en todos los casos: la regla de tres años para las muy graves la suprimió la Ley 18/2021, aunque muchas páginas la siguen dando.`,
      `**Curso de recuperación parcial:** devuelve ${POINTS.course} puntos, nunca más de los perdidos, con un mínimo de ${POINTS.courseHours} horas, una vez cada ${POINTS.courseEveryYears} años (cada año los profesionales). La ley permite hasta ${POINTS.courseLawMax}, pero la Orden INT/914/2024 fija ${POINTS.course}, y es lo que aplica la DGT. Un curso de conducción segura y eficiente suma ${POINTS.safeDrivingCourse}, hasta ${POINTS.max}.`,
      `**Si los pierdes todos**, no puedes sacar otro permiso hasta pasados ${POINTS.waitMonths} meses (${POINTS.waitMonthsProfessional} los profesionales), o ${POINTS.waitMonthsAgain} (${POINTS.waitMonthsAgainProfessional}) si vuelve a pasar en los tres años siguientes, y empiezas con ${POINTS.novice} (art. 71).`,
    ],
    ca: [
      `Comences amb **${POINTS.initial} punts** (${POINTS.novice} si el teu permís té tres anys o menys o l'has recuperat després de perdre'ls tots). Sense sancions fermes, en guanyes ${POINTS.bonusFirst} als tres anys i ${POINTS.bonusSecond} més als tres següents, fins a ${POINTS.max} (art. 63).`,
      `Els punts es resten quan la sanció és ferma, i pagar amb descompte la fa ferma. No en perds més de ${POINTS.dayCap} en un dia, tret d'alcohol, drogues, negar-te a les proves, excés de velocitat molt greu, conducció temerària, sentit contrari, curses, inhibidors o temps de conducció (art. 64.4).`,
      `**Recuperes els ${POINTS.initial}** quan passen ${POINTS.recoveryYears} anys sense sancions fermes amb punts (art. 65.1). Des del 21 de març de 2022 són dos anys en tots els casos: la regla de tres anys per a les molt greus la va suprimir la Llei 18/2021, encara que moltes pàgines la continuen donant.`,
      `**Curs de recuperació parcial:** retorna ${POINTS.course} punts, mai més dels perduts, amb un mínim de ${POINTS.courseHours} hores, un cop cada ${POINTS.courseEveryYears} anys (cada any els professionals). La llei en permet fins a ${POINTS.courseLawMax}, però l'Ordre INT/914/2024 en fixa ${POINTS.course}, i és el que aplica la DGT. Un curs de conducció segura i eficient en suma ${POINTS.safeDrivingCourse}, fins a ${POINTS.max}.`,
      `**Si els perds tots**, no pots treure un altre permís fins que passin ${POINTS.waitMonths} mesos (${POINTS.waitMonthsProfessional} els professionals), o ${POINTS.waitMonthsAgain} (${POINTS.waitMonthsAgainProfessional}) si torna a passar en els tres anys següents, i comences amb ${POINTS.novice} (art. 71).`,
    ],
    en: [
      `You start with **${POINTS.initial} points** (${POINTS.novice} if your licence is three years old or less, or after getting it back having lost them all). With no final sanctions you gain ${POINTS.bonusFirst} after three years and ${POINTS.bonusSecond} more after three more, up to ${POINTS.max} (art. 63).`,
      `Points come off when the sanction becomes final, and paying with the discount makes it final. You lose no more than ${POINTS.dayCap} in one day, except for alcohol, drugs, refusing the tests, very serious speeding, reckless driving, wrong-way driving, races, jammers or driving times (art. 64.4).`,
      `**You are back to ${POINTS.initial}** after ${POINTS.recoveryYears} years with no final sanction carrying points (art. 65.1). Since 21 March 2022 it is two years in every case: Ley 18/2021 deleted the three-year rule for very serious offences, though many pages still give it.`,
      `**Partial recovery course:** gives back ${POINTS.course} points, never more than you lost, at least ${POINTS.courseHours} hours, once every ${POINTS.courseEveryYears} years (yearly for professional drivers). The Act allows up to ${POINTS.courseLawMax}, but Orden INT/914/2024 sets ${POINTS.course}, which is what the DGT applies. A safe and efficient driving course adds ${POINTS.safeDrivingCourse}, up to ${POINTS.max}.`,
      `**If you lose them all**, you cannot get a new licence for ${POINTS.waitMonths} months (${POINTS.waitMonthsProfessional} for professional drivers), or ${POINTS.waitMonthsAgain} (${POINTS.waitMonthsAgainProfessional}) if it happens again within three years, and you start again with ${POINTS.novice} (art. 71).`,
    ],
  });

  /* Prescription, who ---------------------------------------------------- */
  const prescriptionText = L(locale, {
    es: "Tráfico tiene **3 meses** (leves) o **6 meses** (graves y muy graves) desde el día de los hechos para notificarte. Lo interrumpen la notificación y cualquier actuación que conozcas o que busque tu identidad o tu domicilio con otras administraciones; vuelve a correr si el procedimiento se para más de un mes sin culpa tuya. Si pasa un año desde que empezó el procedimiento sin resolución, caduca. Una multa firme prescribe a los 4 años. La prescripción se alega: no se aplica sola.",
    ca: "Trànsit té **3 mesos** (lleus) o **6 mesos** (greus i molt greus) des del dia dels fets per notificar-te. Ho interrompen la notificació i qualsevol actuació que coneguis o que busqui la teva identitat o el teu domicili amb altres administracions; torna a córrer si el procediment s'atura més d'un mes sense culpa teva. Si passa un any des que va començar el procediment sense resolució, caduca. Una multa ferma prescriu als 4 anys. La prescripció s'al·lega: no s'aplica sola.",
    en: "Tráfico has **3 months** (minor offences) or **6 months** (serious and very serious) from the day of the offence to notify you. The notification and any step you know of, or that seeks your identity or address with other bodies, interrupt it; it runs again if the procedure stalls for over a month through no fault of yours. If a year passes from the start of the procedure without a decision, it lapses. A final fine is time-barred after 4 years. You have to raise prescription yourself: it is not applied automatically.",
  });
  const whoText = L(locale, {
    es: "Paga, alega y recurre siempre ante quien te multó, que figura en la notificación. En **carreteras** (vías interurbanas y travesías) multa la DGT, a través del jefe provincial de Tráfico; en **ciudad**, el ayuntamiento. **En Cataluña**, en las carreteras multa el **Servei Català de Trànsit** (denuncian los Mossos d'Esquadra); en el País Vasco, la Dirección de Tráfico del Gobierno Vasco, y en Navarra, la Comunidad Foral. El SCT cobra por internet, con la App Trànsit, en el 012 (932 142 124 desde fuera de Cataluña), en CaixaBank o en sus oficinas, también con el 50 % en los 20 días naturales.",
    ca: "Paga, al·lega i recorre sempre davant de qui et va multar, que consta a la notificació. A les **carreteres** (vies interurbanes i travesseres) multa la DGT, a través del cap provincial de Trànsit; a **ciutat**, l'ajuntament. **A Catalunya**, a les carreteres multa el **Servei Català de Trànsit** (denuncien els Mossos d'Esquadra); al País Basc, la Direcció de Trànsit del Govern Basc, i a Navarra, la Comunitat Foral. L'SCT cobra per internet, amb l'App Trànsit, al 012 (932 142 124 des de fora de Catalunya), a CaixaBank o a les seves oficines, també amb el 50 % en els 20 dies naturals.",
    en: "Always pay, contest and appeal with whoever fined you, named on the notification. On **roads between towns** (interurban roads and through-roads) the DGT fines, through the provincial head of Tráfico; **in town**, the council. **In Catalonia**, on the roads the **Servei Català de Trànsit** fines (the Mossos d'Esquadra report); in the Basque Country, the Basque Government's traffic authority, and in Navarre, the regional government. The SCT takes payment online, through the App Trànsit, on 012 (932 142 124 from outside Catalonia), at CaixaBank or at its offices, also with the 50% within the 20 calendar days.",
  });

  /* Examples ---------------------------------------------------------------- */
  const exCols = L(locale, {
    es: ["Caso", "Último día con el 50 %", "Pagas", "Alegaciones o recurso", "Si no haces nada"],
    ca: ["Cas", "Últim dia amb el 50 %", "Pagues", "Al·legacions o recurs", "Si no fas res"],
    en: ["Case", "Last day with 50% off", "You pay", "Contest or appeal by", "If you do nothing"],
  });
  const exNothing = (ex: Example): string => {
    const r = ex.result;
    if (r.stage === "resolucion") return L(locale, { es: `Pagar ${M(ex.input.amount)} hasta el ${dueCell(r.payFull, locale)}`, ca: `Pagar ${M(ex.input.amount)} fins al ${dueCell(r.payFull, locale)}`, en: `Pay ${M(ex.input.amount)} by ${dueCell(r.payFull, locale)}` });
    if (r.stage === "apremio") return L(locale, { es: `Después, ${M(r.surcharged.ordinary)} e intereses`, ca: `Després, ${M(r.surcharged.ordinary)} i interessos`, en: `Then ${M(r.surcharged.ordinary)} plus interest` });
    if (r.fullUntil) return L(locale, { es: `${M(ex.input.amount)} hasta el ${dueCell(r.fullUntil, locale)}; luego, apremio`, ca: `${M(ex.input.amount)} fins al ${dueCell(r.fullUntil, locale)}; després, constrenyiment`, en: `${M(ex.input.amount)} by ${dueCell(r.fullUntil, locale)}; then enforcement` });
    return L(locale, { es: "Tráfico dictará resolución", ca: "Trànsit dictarà resolució", en: "Tráfico issues a decision" });
  };

  /* Sources and limits ------------------------------------------------------- */
  const sourcesLead = L(locale, {
    es: `Todo leído el ${on(RULES_AS_OF)}; las citas son literales (en castellano, y en catalán las del Servei Català de Trànsit y la Agència Tributària de Catalunya). La sede electrónica de la DGT (sede.dgt.gob.es) no responde desde nuestro servidor: enlazamos sus servicios con los enlaces de dgt.es.`,
    ca: `Tot llegit el ${on(RULES_AS_OF)}; les cites són literals (en castellà, i en català les del Servei Català de Trànsit i l'Agència Tributària de Catalunya). La seu electrònica de la DGT (sede.dgt.gob.es) no respon des del nostre servidor: n'enllacem els serveis amb els enllaços de dgt.es.`,
    en: `All read on ${on(RULES_AS_OF)}; quotes are verbatim (in Spanish, and in Catalan for the Servei Català de Trànsit and the Catalan Tax Agency). The DGT's e-office (sede.dgt.gob.es) does not answer from our server: we link its services through dgt.es's own links.`,
  });
  const limits = L(locale, {
    es: [
      "Los festivos locales de tu municipio ni los del lugar del organismo que te multó: si el último día es festivo allí, también se prorroga.",
      "Las ordenanzas de cada ayuntamiento, que pueden fijar importes y vías de pago propias dentro de la ley.",
      "Tu saldo de puntos ni tus multas pendientes: solo los ve la DGT, con tu identificación, en su sede.",
      "Los intereses de demora del apremio ni el plazo del contencioso-administrativo, que tiene sus propias reglas (agosto, por ejemplo).",
      "Multas puestas en otros países de la Unión Europea.",
    ],
    ca: [
      "Els festius locals del teu municipi ni els del lloc de l'organisme que et va multar: si l'últim dia hi és festiu, també es prorroga.",
      "Les ordenances de cada ajuntament, que poden fixar imports i vies de pagament pròpies dins de la llei.",
      "El teu saldo de punts ni les teves multes pendents: només els veu la DGT, amb la teva identificació, a la seva seu.",
      "Els interessos de demora del constrenyiment ni el termini del contenciós administratiu, que té regles pròpies (l'agost, per exemple).",
      "Multes posades en altres països de la Unió Europea.",
    ],
    en: [
      "Local holidays in your town or where the authority that fined you sits: if the last day is a holiday there, it moves too.",
      "Each council's bylaws, which may set their own amounts and payment channels within the Act.",
      "Your points balance or pending fines: only the DGT sees them, with your ID, on its e-office.",
      "Late-payment interest under enforcement, or the court-appeal deadline, which has rules of its own (August, for one).",
      "Fines issued in other EU countries.",
    ],
  });
  const links = L(locale, {
    es: { wd: "Calculadora de días hábiles, con los festivos de tu municipio", itv: "¿Cuándo me toca pasar la ITV? (multa por ITV caducada)" },
    ca: { wd: "Calculadora de dies hàbils, amb els festius del teu municipi", itv: "Quan em toca passar l'ITV? (multa per ITV caducada)" },
    en: { wd: "Working-days calculator, with your town's holidays", itv: "When is my ITV due? (fine for an expired ITV)" },
  });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(trafficFinesPath(locale)),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: meta.description,
  };
  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <SiteHeader locale={locale} translations={trafficFinesEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{fresh}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <TrafficFinesCalculator locale={locale} initial={DEFAULT_INPUT} places={places} defaultPlace={DEFAULT_PLACE[locale]} />
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} <A href={SOURCES.dgtFine.url}>{dgtLabel}</A>.
              </p>
              <CalculatorNextStep current="traffic-fines" locale={locale} />

              <AdSlot kind="top" locale={locale} path={crumbPath(crumbs)} />
              <h2 id="servicios-oficiales">{hd.services}</h2>
              <ul>
                {services.map((s) => (
                  <li key={s.href}>
                    <A href={s.href}>{s.label}</A>
                  </li>
                ))}
              </ul>
              <p>{servicesNote}</p>
              <Quote text={QUOTE.dgtEmail} href={SOURCES.dgtFine.url} label={dgtLabel} />

              <h2 id="plazos">{hd.deadlines}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {dCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deadlineRows.map(([what, plazo, from, rule]) => (
                      <tr key={what}>
                        <th scope="row" className="font-normal">
                          {what}
                        </th>
                        <td data-label={dCols[1]}>
                          <strong>{plazo}</strong>
                        </td>
                        <td data-label={dCols[2]}>{from}</td>
                        <td data-label={dCols[3]}>{rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Quote text={QUOTE.twentyDays} href={SOURCES.lsv.url} label={lsv("art. 93.1")} />

              <h2 id="descuento-50">{hd.discount}</h2>
              <p>{md(discountText)}</p>
              <Quote text={`${QUOTE.abbreviated} a) ${QUOTE.reduction} b) ${QUOTE.waiver} c) ${QUOTE.ends} […] f) ${QUOTE.firm} g) ${QUOTE.noRecord}`} href={SOURCES.lsv.url} label={lsv("art. 94")} />
              <Quote text={QUOTE.dgtNoSplit} href={SOURCES.dgtFine.url} label={dgtLabel} />

              <h3 id="sin-descuento">{hd.noDiscount}</h3>
              <p>{noDiscountText}</p>
              <ul>
                {driverFirst.map((l) => (
                  <li key={l}>
                    {l}) {LETTER_LABEL[l][locale]}
                  </li>
                ))}
              </ul>
              <Quote text={QUOTE.excluded} href={SOURCES.lsv.url} label={lsv(L(locale, { es: "art. 93.2 (redacción de la Ley 18/2021)", ca: "art. 93.2 (redacció de la Llei 18/2021)", en: "art. 93.2 (as worded by Ley 18/2021)" }))} />
              <Quote text={`h) ${QUOTE.jammer} […] j) ${QUOTE.noIdentify}`} href={SOURCES.lsv.url} label={lsv("art. 77")} />
              <h3 id="por-que">{hd.why}</h3>
              <p>{md(whyText)}</p>
              <Quote text={QUOTE.noIdentifyFine} href={SOURCES.lsv.url} label={lsv("art. 80.2.b")} />
              <Quote text={QUOTE.sct} href={SOURCES.sctPay.url} label={L(locale, { es: "Servei Català de Trànsit, «Pagament de sancions» (en catalán)", ca: "Servei Català de Trànsit, «Pagament de sancions»", en: "Servei Català de Trànsit, «Pagament de sancions» (in Catalan)" })} lang="ca" />

              <h2 id="notificacion">{hd.notified}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {nCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {notifyRows.map(([how, day, rule]) => (
                      <tr key={how}>
                        <th scope="row" className="font-normal">
                          {how}
                        </th>
                        <td data-label={nCols[1]}>{day}</td>
                        <td data-label={nCols[2]}>{rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>{md(teuText)}</p>
              <Quote text={QUOTE.devFirst} href={SOURCES.lsv.url} label={lsv("art. 90.1")} />
              <Quote text={QUOTE.devRejected} href={SOURCES.lsv.url} label={lsv("art. 90.2")} />
              <Quote text={QUOTE.paperTwice} href={SOURCES.lsv.url} label={lsv("art. 90.3")} />
              <Quote text={QUOTE.boe} href={SOURCES.lsv.url} label={lsv("art. 91")} />
              <Quote text={QUOTE.testra} href={SOURCES.lsv.url} label={lsv("art. 92.1")} />
              <Quote text={QUOTE.dgtTeu} href={SOURCES.dgtNotify.url} label={L(locale, { es: "DGT, «¿Cómo quieres que te notifiquemos tus multas?»", ca: "DGT, «¿Cómo quieres que te notifiquemos tus multas?» (en castellà)", en: "DGT, «¿Cómo quieres que te notifiquemos tus multas?» (in Spanish)" })} />

              <h2 id="festivo">{hd.holiday}</h2>
              <p>{md(holidayText)}</p>
              <p>
                <Link href={workingDaysPath(locale)}>{links.wd}</Link>
              </p>
              <Quote text={QUOTE.lastDayInhabil} href={SOURCES.l39.url} label={l39("art. 30.5")} />
              <Quote text={QUOTE.eitherPlace} href={SOURCES.l39.url} label={l39("art. 30.6")} />
              <Quote text={QUOTE.supletoria} href={SOURCES.lsv.url} label={lsv("art. 83.1")} />
              <Quote text={QUOTE.naturalStated} href={SOURCES.l39.url} label={l39("art. 30.2")} />

              <h2 id="recursos">{hd.nothing}</h2>
              <p>{md(nothingText)}</p>
              <Quote text={QUOTE.alegaciones} href={SOURCES.lsv.url} label={lsv("art. 95.1")} />
              <Quote text={`${QUOTE.nothing} ${QUOTE.nothingCases} ${QUOTE.enforceable}`} href={SOURCES.lsv.url} label={lsv("art. 95.4")} />
              <Quote text={QUOTE.dgt45} href={SOURCES.dgtFine.url} label={dgtLabel} />
              <Quote text={QUOTE.resolutionEnds} href={SOURCES.lsv.url} label={lsv("art. 96.1")} />
              <Quote text={`${QUOTE.reposicion} […] ${QUOTE.noSuspension}`} href={SOURCES.lsv.url} label={lsv(L(locale, { es: "arts. 96.2 y 96.3", ca: "arts. 96.2 i 96.3", en: "arts. 96.2 and 96.3" }))} />
              <Quote text={QUOTE.dgtIdentify10} href={SOURCES.dgtFine.url} label={dgtLabel} />
              <Quote text={QUOTE.identify} href={SOURCES.lsv.url} label={lsv("art. 93.1")} />

              <h2 id="apremio">{hd.apremio}</h2>
              <p>{md(apremioText)}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {sCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SURCHARGES.map((s) => (
                      <tr key={s}>
                        <th scope="row" className="font-normal">
                          {sWhen[s][locale]}
                        </th>
                        <td data-label={sCols[1]}>{P(SURCHARGE_RATE[s])}</td>
                        <td data-label={sCols[2]}>
                          <strong>{M(grave * (1 + SURCHARGE_RATE[s]))}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Quote text={QUOTE.finalPayment} href={SOURCES.lsv.url} label={lsv("art. 110.1")} />
              <Quote text={QUOTE.collection} href={SOURCES.lsv.url} label={lsv("art. 110.2")} />
              <Quote text={QUOTE.dgtAeat} href={SOURCES.dgtFine.url} label={dgtLabel} />
              <Quote text={`${QUOTE.surchargeExecutive} ${QUOTE.surchargeReduced} ${QUOTE.surchargeOrdinary}`} href={SOURCES.lgt.url} label={lgt(L(locale, { es: "art. 28.2 a 28.4", ca: "art. 28.2 a 28.4", en: "art. 28.2 to 28.4" }))} />
              <Quote text={`a) ${QUOTE.apremioFirst} b) ${QUOTE.apremioSecond}`} href={SOURCES.lgt.url} label={lgt("art. 62.5")} />
              <Quote text={QUOTE.sctAtc} href={SOURCES.sctAppeal.url} label={L(locale, { es: "Servei Català de Trànsit (en catalán)", ca: "Servei Català de Trànsit", en: "Servei Català de Trànsit (in Catalan)" })} lang="ca" />
              <Quote text={QUOTE.atc} href={SOURCES.atc.url} label={L(locale, { es: "Agència Tributària de Catalunya (en catalán)", ca: "Agència Tributària de Catalunya", en: "Catalan Tax Agency (in Catalan)" })} lang="ca" />

              <h2 id="importes">{hd.amounts}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {aCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {amountRows.map(([what, f, d]) => (
                      <tr key={what}>
                        <th scope="row" className="font-normal">
                          {what}
                        </th>
                        <td data-label={aCols[1]}>{f}</td>
                        <td data-label={aCols[2]}>
                          <strong>{d}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>{amountsNote}</p>
              <Quote text={QUOTE.amounts} href={SOURCES.lsv.url} label={lsv("art. 80.1")} />

              <h3 id="velocidad">{hd.speed}</h3>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{speedCaption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{limitWord}</th>
                      {SPEED_BANDS.map((b) => (
                        <th key={b.fine} scope="col">
                          {M(b.fine)} ({M(b.fine * (1 - DISCOUNT_RATE))}), {pts(b.points)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SPEED_LIMITS.map((limit, i) => (
                      <tr key={limit}>
                        <th scope="row">{limit}</th>
                        {SPEED_BANDS.map((b) => (
                          <td key={b.fine}>{b.to ? `${b.from[i]}–${b.to[i]}` : `${b.from[i]}+`}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="puntos">{hd.points}</h2>
              {pointsText.map((t) => (
                <p key={t}>{md(t)}</p>
              ))}
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {pCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ANNEX_II.map((row, i) => (
                      <tr key={`${row.n}-${row.points}`}>
                        <th scope="row" className="font-normal" lang={locale === "es" ? "es" : undefined}>
                          {row.n}. {locale === "es" ? row.text : ANNEX_LABEL[locale][i]}
                        </th>
                        <td data-label={pCols[1]}>
                          <strong>{row.points}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                <A href={SERVICES.dgtPoints}>{L(locale, { es: "Consulta tus puntos en la DGT", ca: "Consulta els teus punts a la DGT (en castellà)", en: "Check your points with the DGT (in Spanish)" })}</A>
              </p>
              <Quote text={QUOTE.pointsLost} href={SOURCES.lsv.url} label={lsv("art. 64.1")} />
              <Quote text={QUOTE.dayCap} href={SOURCES.lsv.url} label={lsv("art. 64.4")} />
              <Quote text={QUOTE.twoYears} href={SOURCES.lsv.url} label={lsv("art. 65.1")} />
              <Quote text={QUOTE.threeYearsDeleted} href={SOURCES.lsv.url} label={lsv(L(locale, { es: "art. 65.1, párrafo suprimido el 21/03/2022", ca: "art. 65.1, paràgraf suprimit el 21/03/2022", en: "art. 65.1, paragraph deleted on 21/03/2022" }))} />
              <Quote text={QUOTE.courseLaw} href={SOURCES.lsv.url} label={lsv("art. 65.4")} />
              <Quote text={QUOTE.courseOrder} href={SOURCES.int914.url} label={L(locale, { es: "Orden INT/914/2024, art. 3.a", ca: "Ordre INT/914/2024, art. 3.a", en: "Orden INT/914/2024, art. 3.a" })} />

              <h2 id="prescripcion">{hd.prescription}</h2>
              <p>{md(prescriptionText)}</p>
              <Quote text={`${QUOTE.prescription} ${QUOTE.prescriptionStart}`} href={SOURCES.lsv.url} label={lsv("art. 112.1")} />
              <Quote text={QUOTE.interruption} href={SOURCES.lsv.url} label={lsv("art. 112.2")} />
              <Quote text={QUOTE.caducidad} href={SOURCES.lsv.url} label={lsv("art. 112.3")} />
              <Quote text={QUOTE.sanctionPrescription} href={SOURCES.lsv.url} label={lsv("art. 112.4")} />

              <h2 id="quien-multa">{hd.who}</h2>
              <p>{md(whoText)}</p>
              <ul>
                <li>
                  <A href={locale === "ca" ? SERVICES.sctPay.ca : SERVICES.sctPay.es}>{L(locale, { es: "Servei Català de Trànsit: pago de sanciones", ca: "Servei Català de Trànsit: pagament de sancions", en: "Servei Català de Trànsit: paying fines (in Spanish)" })}</A>
                </li>
                <li>
                  <A href={SOURCES.dgtWho.url}>{L(locale, { es: "DGT: ¿Quién puede multarte?", ca: "DGT: ¿Quién puede multarte? (en castellà)", en: "DGT: ¿Quién puede multarte? (in Spanish)" })}</A>
                </li>
              </ul>
              <Quote text={`${QUOTE.interurban} […] ${QUOTE.regions} ${QUOTE.urban}`} href={SOURCES.lsv.url} label={lsv("art. 84")} />

              <h2 id="ejemplos">{hd.examples}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {exCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {exs.map((ex) => {
                      const r = ex.result;
                      const discount = r.stage === "denuncia" ? (r.discount ? dueCell(r.discount, locale) : noDisc) : r.stage === "apremio" ? dueCell(r.due, locale) : "—";
                      const pay = r.stage === "denuncia" ? M(r.reduced ?? ex.input.amount) : r.stage === "apremio" ? M(r.surcharged.reduced) : M(ex.input.amount);
                      const contest = r.stage === "denuncia" ? dueCell(r.alegaciones, locale) : r.stage === "resolucion" ? dueCell(r.reposicion, locale) : "—";
                      return (
                        <tr key={ex.id}>
                          <th scope="row" className="font-normal">
                            {exampleLabel(ex.id, ex, locale)}
                          </th>
                          <td data-label={exCols[1]}>
                            <strong>{discount}</strong>
                          </td>
                          <td data-label={exCols[2]}>{pay}</td>
                          <td data-label={exCols[3]}>{contest}</td>
                          <td data-label={exCols[4]}>{exNothing(ex)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                {L(locale, {
                  es: `Con los festivos de toda España: si el día es festivo en tu comunidad o tu municipio, pasa al siguiente hábil. En la DEV sin abrir cuentan 10 días más (notificada el ${weekdayDay(exs.find((e) => e.id === "dev-unopened")!.result.notified, locale)}); en el Tablón Edictal, desde la publicación, como la DGT. En la fila del apremio, la primera columna es el plazo de la providencia y «Pagas» incluye el 10 %. Los casos son supuestos para ilustrar las reglas; los plazos y los importes son los de la ley.`,
                  ca: `Amb els festius de tot Espanya: si el dia és festiu a la teva comunitat o al teu municipi, passa al següent hàbil. A la DEV sense obrir compten 10 dies més (notificada el ${weekdayDay(exs.find((e) => e.id === "dev-unopened")!.result.notified, locale)}); al Tauler Edictal, des de la publicació, com la DGT. A la fila del constrenyiment, la primera columna és el termini de la provisió i «Pagues» inclou el 10 %. Els casos són suposats per il·lustrar les regles; els terminis i els imports són els de la llei.`,
                  en: `With national holidays only: if the day is a holiday in your region or town, it moves to the next working day. An unopened DEV notice adds 10 days (notified on ${weekdayDay(exs.find((e) => e.id === "dev-unopened")!.result.notified, locale)}); on the notice board, from publication, as the DGT counts. In the enforcement row, the first column is the notice's deadline and "You pay" includes the 10%. The cases are hypothetical, to show the rules; the deadlines and amounts are the law's.`,
                })}
              </p>
              <p>
                <Link href={itvPath(locale)}>{links.itv}</Link>
              </p>

              <h2 id="preguntas">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fuentes">{hd.sources}</h2>
              <p>{sourcesLead}</p>
              <ul>
                {Object.values(SOURCES).map((src) => (
                  <li key={src.url}>
                    <A href={src.url}>{src.name}</A> ({src.publisher}, {src.ref}; {L(locale, { es: "leído el", ca: "llegit el", en: "read on" })} {on(src.read)})
                  </li>
                ))}
              </ul>
              <SourcesPolicyLink locale={locale} />

              <h2 id="limites">{hd.limits}</h2>
              <ul>
                {limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <MoreCalculators current="traffic-fines" locale={locale} />
            </div>
            <ShareBar locale={locale} path={trafficFinesPath(locale)} title={meta.h1} contentType="traffic_fines_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
