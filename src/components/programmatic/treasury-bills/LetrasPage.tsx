import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { CALENDAR_2026_PDF, CALENDAR_2027, CALENDAR_PAGE_URL, nextAuctionOf, upcoming } from "@/lib/programmatic/treasury-bills/calendar";
import { bareDay, euros, letrasEditions, letrasPath, millions, pct, price3, rate3, shortDay, termName, weekdayDay, wholeEuros, type LetrasLocale } from "@/lib/programmatic/treasury-bills/copy";
import { computeBill, taeFromRate } from "@/lib/programmatic/treasury-bills/engine";
import { freshnessText, leadText, letrasMeta } from "@/lib/programmatic/treasury-bills/page";
import { TERMS, latestByTerm, latestResultsUrl, resultDays, type AuctionResult, type Term } from "@/lib/programmatic/treasury-bills/results";
import { BDE_FEE, NORMS, NON_COMPETITIVE_MAX, QUOTE, RULES_AS_OF, SAVINGS_SCALE, SAVINGS_SCALE_NORM, URLS } from "@/lib/programmatic/treasury-bills/rules";
import type { LetrasData } from "@/lib/programmatic/treasury-bills/server";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { LetrasCalculator, type TermOption } from "./LetrasCalculator";

/**
 * "Letras del Tesoro: próximas subastas, último tipo y calculadora" (and its
 * ca/en editions): the Tesoro Público's latest auction result per term (read
 * from tesoro.es, snapshot fallback), the 2026 calendar from the Tesoro's
 * PDF with the Banco de España request deadlines, the year's results month
 * by month, a calculator, how to buy (Tesoro online service, Banco de
 * España, banks) and the tax rules from the BOE and the AEAT. Neutral: no
 * bank or broker is named or linked.
 */

const L = <T,>(locale: LetrasLocale, v: Record<LetrasLocale, T>): T => v[locale];

export function letrasCrumbs(locale: LetrasLocale, label: string): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label, href: letrasPath(locale) }];
}

export function letrasMetadata(locale: LetrasLocale, data: LetrasData): Metadata {
  const m = letrasMeta(locale, data);
  return buildMetadata({ locale, path: letrasPath(locale), title: m.title, description: m.description, translations: letrasEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ children }: { children: string }) {
  return (
    <blockquote lang="es">
      <p>«{children}»</p>
    </blockquote>
  );
}

/** Rows of the month-by-month table: one per calendar month, newest first, the average rate of each term auctioned that month. */
function monthRows(results: readonly AuctionResult[]): { month: string; byTerm: Partial<Record<Term, AuctionResult>> }[] {
  const months = new Map<string, Partial<Record<Term, AuctionResult>>>();
  for (const r of results) {
    const m = r.auction.slice(0, 7);
    const row = months.get(m) ?? {};
    if (!row[r.term] || row[r.term]!.auction < r.auction) row[r.term] = r;
    months.set(m, row);
  }
  return [...months.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([month, byTerm]) => ({ month, byTerm }));
}

const MONTHS: Record<LetrasLocale, string[]> = {
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const monthName = (ym: string, locale: LetrasLocale) => {
  const [y, m] = ym.split("-").map(Number) as [number, number];
  const n = MONTHS[locale][m - 1]!;
  return locale === "en" ? `${n} ${y}` : `${n.charAt(0).toUpperCase()}${n.slice(1)} ${y}`;
};

export function LetrasRoute({ locale, data }: { locale: LetrasLocale; data: LetrasData }) {
  const meta = letrasMeta(locale, data);
  const crumbs = letrasCrumbs(locale, meta.breadcrumb);
  const lead = leadText(locale, data);
  const liveAny = TERMS.some((t) => data.live[t]);
  const freshness = freshnessText(locale, liveAny, data.snapshotAsOf, data.today);
  const top = latestByTerm(data.results);
  const known = TERMS.map((t) => top[t]).filter((r): r is AuctionResult => Boolean(r));
  const day = (iso: string) => bareDay(iso, locale);
  const next = upcoming(data.today);

  const options: TermOption[] = known.map((r) => {
    const n = nextAuctionOf(r.term, data.today);
    return { term: r.term, days: resultDays(r), avgRate: r.avgRate, auction: r.auction, maturity: r.maturity, next: n ? { auction: n.auction, requestsBy: n.requestsBy } : null };
  });

  const h = L(locale, {
    es: { latest: "Último resultado de las subastas de Letras", per1000: "Cuánto pagas y cuánto ganas por cada letra de 1.000 €", next: "Próximas subastas de Letras del Tesoro", year: "Tipos de las Letras en 2026, mes a mes", buy: "Cómo comprar Letras del Tesoro", bids: "Petición competitiva o no competitiva", formula: "Cómo se calcula el precio y la rentabilidad (TAE)", tax: "Impuestos: cómo tributan las Letras del Tesoro", sources: "Fuentes" },
    ca: { latest: "Últim resultat de les subhastes de lletres", per1000: "Quant pagues i quant guanyes per cada lletra de 1.000 €", next: "Properes subhastes de lletres del Tresor", year: "Tipus de les lletres el 2026, mes a mes", buy: "Com comprar lletres del Tresor", bids: "Petició competitiva o no competitiva", formula: "Com es calcula el preu i la rendibilitat (TAE)", tax: "Impostos: com tributen les lletres del Tresor", sources: "Fonts" },
    en: { latest: "Latest Treasury bill auction results", per1000: "What you pay and earn per €1,000 bill", next: "Next Treasury bill auctions", year: "Treasury bill rates in 2026, month by month", buy: "How to buy Spanish Treasury bills", bids: "Competitive or non-competitive bid", formula: "How the price and the yield (TAE) are worked out", tax: "Tax: how Treasury bills are taxed", sources: "Sources" },
  });

  const disclaimer = L(locale, {
    es: "Información general con datos oficiales del Tesoro Público, el Banco de España, el BOE y la Agencia Tributaria; no es asesoramiento de inversión ni fiscal. La calculadora es una simulación orientativa: el precio exacto lo fija cada subasta y el impuesto depende de todas tus rentas del ahorro. Los tipos pasados no garantizan los futuros.",
    ca: "Informació general amb dades oficials del Tresor Públic, el Banc d'Espanya, el BOE i l'Agència Tributària; no és assessorament d'inversió ni fiscal. La calculadora és una simulació orientativa: el preu exacte el fixa cada subhasta i l'impost depèn de totes les teves rendes de l'estalvi. Els tipus passats no garanteixen els futurs.",
    en: "General information from official Tesoro Público, Banco de España, BOE and Spanish Tax Agency (AEAT) data; not investment or tax advice. The calculator is an indicative simulation: each auction sets the exact price, and the tax depends on all your savings income. Past rates do not guarantee future ones.",
  });

  const latestCols = L(locale, {
    es: ["Plazo", "Subasta", "Emisión → vencimiento", "Tipo medio", "Tipo marginal", "Precio medio", "Subasta anterior (marginal)", "Adjudicado / solicitado"],
    ca: ["Termini", "Subhasta", "Emissió → venciment", "Tipus mitjà", "Tipus marginal", "Preu mitjà", "Subhasta anterior (marginal)", "Adjudicat / sol·licitat"],
    en: ["Term", "Auction", "Issue → maturity", "Average rate", "Marginal rate", "Average price", "Previous auction (marginal)", "Allotted / requested"],
  });
  const daysWord = L(locale, { es: "días", ca: "dies", en: "days" });
  const latestNote = L(locale, {
    es: "Tipo medio: el tipo medio ponderado de las peticiones aceptadas, el que obtiene una petición no competitiva. Tipo marginal: el más alto aceptado. Precios en % del nominal; importes nominales en millones de euros, primera y segunda vuelta.",
    ca: "Tipus mitjà: el tipus mitjà ponderat de les peticions acceptades, el que obté una petició no competitiva. Tipus marginal: el més alt acceptat. Preus en % del nominal; imports nominals en milions d'euros, primera i segona volta.",
    en: "Average rate: the weighted average of accepted bids, the rate a non-competitive bid gets. Marginal rate: the highest accepted. Prices in % of face value; face amounts in millions of euros, first and second round.",
  });
  const sourceLine = L(locale, { es: "Fuente: Tesoro Público,", ca: "Font: Tresor Públic,", en: "Source: Tesoro Público," });
  const resultsLink = L(locale, { es: "Resultado de últimas subastas · Letras del Tesoro", ca: "Resultat de les últimes subhastes · Lletres del Tresor", en: "Latest auction results · Letras del Tesoro" });
  const pastLink = L(locale, { es: "resultados de subastas anteriores", ca: "resultats de subhastes anteriors", en: "earlier auction results" });

  const per1000Cols = L(locale, {
    es: ["Plazo", "Precio (tipo medio)", "Pagas por letra", "Cobras", "Ganas (bruto)", "TAE equivalente"],
    ca: ["Termini", "Preu (tipus mitjà)", "Pagues per lletra", "Cobres", "Guanyes (brut)", "TAE equivalent"],
    en: ["Term", "Price (average rate)", "You pay per bill", "You get back", "Gross gain", "Equivalent TAE"],
  });
  const per1000Note = L(locale, {
    es: "Calculado con la fórmula del Tesoro sobre el tipo medio de la última subasta de cada plazo; el Banco de España cobra el precio con todos los decimales, así que puede variar algún céntimo. Antes del IRPF y de comisiones.",
    ca: "Calculat amb la fórmula del Tresor sobre el tipus mitjà de l'última subhasta de cada termini; el Banc d'Espanya cobra el preu amb tots els decimals, així que pot variar algun cèntim. Abans de l'IRPF i de comissions.",
    en: "Worked out with the Treasury's formula on each term's latest average rate; the Banco de España charges the price with every decimal, so a few cents may differ. Before income tax and fees.",
  });

  const nextCols = L(locale, {
    es: ["Subasta", "Plazos", "Peticiones en el Banco de España hasta (14:00)", "Pago si pediste en sucursal (antes de las 14:00)", "Emisión"],
    ca: ["Subhasta", "Terminis", "Peticions al Banc d'Espanya fins al (14.00)", "Pagament si vas demanar en sucursal (abans de les 14.00)", "Emissió"],
    en: ["Auction", "Terms", "Banco de España requests by (14:00)", "Payment if you asked at a branch (before 14:00)", "Issue"],
  });
  const nextIntro = L(locale, {
    es: "Las Letras a 6 y 12 meses se subastan la semana en que vencen las del mes y las de 3 y 9 meses el martes siguiente. Fechas del calendario oficial del Tesoro para 2026 (incluye enero de 2027):",
    ca: "Les lletres a 6 i 12 mesos se subhasten la setmana que vencen les del mes i les de 3 i 9 mesos el dimarts següent. Dates del calendari oficial del Tresor per al 2026 (inclou el gener del 2027):",
    en: "6- and 12-month bills are auctioned in the week the month's bills mature, 3- and 9-month bills on the following Tuesday. Dates from the Treasury's official 2026 calendar (which includes January 2027):",
  });
  const deadlineNote = L(locale, {
    es: "Peticiones: el último día para los particulares con Cuenta Directa en el Banco de España, antes de las 14:00 (hora peninsular). Quien pide en una sucursal entregando el 2 % paga el resto el día de «Pago» antes de las 14:00; por transferencia, el dinero debe estar en el Banco de España antes de las 14:00 del día hábil anterior a la subasta (anuncio del Banco de España). Las festividades locales pueden adelantar estos plazos.",
    ca: "Peticions: l'últim dia per als particulars amb compte directe al Banc d'Espanya, abans de les 14.00 (hora peninsular). Qui demana en una sucursal lliurant el 2 % paga la resta el dia de «Pagament» abans de les 14.00; per transferència, els diners han de ser al Banc d'Espanya abans de les 14.00 del dia hàbil anterior a la subhasta (anunci del Banc d'Espanya). Les festes locals poden avançar aquests terminis.",
    en: "Requests: the last day for private investors with a Cuenta Directa at the Banco de España, before 14:00 (mainland Spain time). If you ask at a branch with a 2% deposit, you pay the rest on the “Payment” day before 14:00; by bank transfer, the money must reach the Banco de España by 14:00 on the working day before the auction (Banco de España notice). Local holidays can bring these deadlines forward.",
  });
  const cal2027 = CALENDAR_2027
    ? null
    : data.calendar2027Pdf
      ? L(locale, {
          es: <>El Tesoro ya ha publicado su calendario de 2027: <A href={data.calendar2027Pdf}>calendario de subastas 2027 (PDF)</A>. Añadimos aquí sus fechas en cuanto las comprobamos.</>,
          ca: <>El Tresor ja ha publicat el calendari del 2027: <A href={data.calendar2027Pdf}>calendari de subhastes 2027 (PDF)</A>. N'afegim aquí les dates tan bon punt les comprovem.</>,
          en: <>The Treasury has published its 2027 calendar: <A href={data.calendar2027Pdf}>2027 auction calendar (PDF)</A>. We add its dates here as soon as we have checked them.</>,
        })
      : L(locale, {
          es: <>El calendario de 2027 aún no está publicado: el Tesoro lo publica en diciembre (el de 2026 lleva fecha del 3 de diciembre de 2025). Lo verás en la <A href={CALENDAR_PAGE_URL}>página del calendario del Tesoro</A> y aquí en cuanto salga.</>,
          ca: <>El calendari del 2027 encara no està publicat: el Tresor el publica al desembre (el del 2026 porta data del 3 de desembre de 2025). El veuràs a la <A href={CALENDAR_PAGE_URL}>pàgina del calendari del Tresor</A> i aquí tan bon punt surti.</>,
          en: <>The 2027 calendar is not out yet: the Treasury publishes it in December (2026's is dated 3 December 2025). It will be on the <A href={CALENDAR_PAGE_URL}>Treasury's calendar page</A>, and here once out.</>,
        });

  const yearRows = monthRows(data.results);
  const yearCaption = L(locale, {
    es: "Tipo de interés medio de cada subasta (Tesoro Público). Cada mes hay una subasta de 6 y 12 meses y otra de 3 y 9 meses.",
    ca: "Tipus d'interès mitjà de cada subhasta (Tresor Públic). Cada mes hi ha una subhasta de 6 i 12 mesos i una altra de 3 i 9 mesos.",
    en: "Average interest rate at each auction (Tesoro Público). Each month has one 6- and 12-month auction and one 3- and 9-month auction.",
  });
  const monthWord = L(locale, { es: "Mes", ca: "Mes", en: "Month" });

  const buy = L(locale, {
    es: {
      intro: "Hay tres vías, y todas compran la misma letra en la misma subasta:",
      items: [
        <>
          <strong>Por internet, en el servicio de compraventa de valores del Tesoro</strong> (<A href={URLS.tesoroBuyOnline}>tesoropublico.gob.es</A>): para residentes en España mayores de edad, con DNI electrónico, certificado digital o Cl@ve. Las letras quedan en una Cuenta Directa a tu nombre en el Banco de España. Las peticiones por internet siguen el calendario del Tesoro.
        </>,
        <>
          <strong>En una sucursal del Banco de España</strong>, con <A href={URLS.bdeAppointment}>cita previa</A> para abrir la Cuenta Directa y para la primera compra: DNI (o documento que acredite identidad y residencia), un justificante en papel de tu cuenta bancaria con el IBAN y la firma de todos los titulares. Pagas el 100 % al pedir o un 2 % de entrega y el resto el día de pago.
        </>,
        <>
          <strong>En un banco, caja o agencia de valores</strong>: puede pedirlo cualquier persona, residente o no. Cada entidad fija sus comisiones de compra y custodia, que reducen la rentabilidad: pregúntalas antes.
        </>,
      ],
      fee: `Con las letras en una Cuenta Directa, al vencer el Banco de España cobra el 1,5 por mil de la transferencia (de ${euros(BDE_FEE.min, "es")} a ${euros(BDE_FEE.max, "es")}):`,
      sell: "Las Letras se negocian en el mercado secundario, así que puedes venderlas antes del vencimiento, pero al precio de mercado de ese día (puede ser mayor o menor que el que pagaste). Si las esperas al vencimiento, cobras siempre 1.000 € por letra.",
    },
    ca: {
      intro: "Hi ha tres vies, i totes compren la mateixa lletra a la mateixa subhasta:",
      items: [
        <>
          <strong>Per internet, al servei de compravenda de valors del Tresor</strong> (<A href={URLS.tesoroBuyOnline}>tesoropublico.gob.es</A>): per a residents a Espanya majors d'edat, amb DNI electrònic, certificat digital o Cl@ve. Les lletres queden en un compte directe a nom teu al Banc d'Espanya. Les peticions per internet segueixen el calendari del Tresor.
        </>,
        <>
          <strong>En una sucursal del Banc d'Espanya</strong>, amb <A href={URLS.bdeAppointment}>cita prèvia</A> per obrir el compte directe i per a la primera compra: DNI (o document que acrediti identitat i residència), un justificant en paper del compte bancari amb l'IBAN i la signatura de tots els titulars. Pagues el 100 % en demanar o un 2 % de lliurament i la resta el dia de pagament.
        </>,
        <>
          <strong>En un banc, caixa o agència de valors</strong>: ho pot demanar qualsevol persona, resident o no. Cada entitat fixa les comissions de compra i custòdia, que redueixen la rendibilitat: pregunta-les abans.
        </>,
      ],
      fee: `Amb les lletres en un compte directe, al venciment el Banc d'Espanya cobra l'1,5 per mil de la transferència (de ${euros(BDE_FEE.min, "ca")} a ${euros(BDE_FEE.max, "ca")}):`,
      sell: "Les lletres es negocien al mercat secundari, així que les pots vendre abans del venciment, però al preu de mercat d'aquell dia (pot ser més alt o més baix que el que vas pagar). Si les esperes al venciment, cobres sempre 1.000 € per lletra.",
    },
    en: {
      intro: "There are three routes, and all of them buy the same bill at the same auction:",
      items: [
        <>
          <strong>Online, through the Treasury's securities purchase service</strong> (<A href={URLS.tesoroBuyOnline}>tesoropublico.gob.es</A>): for adults resident in Spain, with an electronic DNI, a digital certificate or Cl@ve. The bills are held in a Cuenta Directa in your name at the Banco de España. Online requests follow the Treasury's calendar.
        </>,
        <>
          <strong>At a Banco de España branch</strong>, with an <A href={URLS.bdeAppointment}>appointment</A> to open the Cuenta Directa and for the first purchase: your DNI (or documents proving identity and Spanish residence), a paper statement of your bank account with the IBAN, and every holder's signature. You pay 100% when asking, or a 2% deposit and the rest on the payment day.
        </>,
        <>
          <strong>Through a bank or broker</strong>: open to anyone, resident or not. Each firm sets its own purchase and custody fees, which cut the return: ask first.
        </>,
      ],
      fee: `With the bills in a Cuenta Directa, at maturity the Banco de España charges 1.5 per mille of the transfer (${euros(BDE_FEE.min, "en")} to ${euros(BDE_FEE.max, "en")}):`,
      sell: "Bills trade on the secondary market, so you can sell before maturity, but at that day's market price (higher or lower than what you paid). Held to maturity, each bill always repays €1,000.",
    },
  });

  const bids = L(locale, {
    es: [
      "En la subasta puedes pedir de dos formas (Orden ECM/2/2026, art. 10):",
      `La petición no competitiva es la habitual del ahorrador: no fijas tipo y te adjudican al precio medio. Máximo ${euros(NON_COMPETITIVE_MAX, "es").replace(",00", "")} por persona y subasta. En la competitiva indicas el tipo que quieres (con tres decimales): si pides un tipo por encima del marginal, no te adjudican nada. Cómo se paga cada una (art. 12.4):`,
      "Y las no competitivas se aceptan enteras:",
    ],
    ca: [
      "A la subhasta pots demanar de dues maneres (Orden ECM/2/2026, art. 10; text oficial en castellà):",
      `La petició no competitiva és l'habitual de l'estalviador: no fixes tipus i t'adjudiquen al preu mitjà. Màxim ${euros(NON_COMPETITIVE_MAX, "ca").replace(",00", "")} per persona i subhasta. A la competitiva indiques el tipus que vols (amb tres decimals): si demanes un tipus per sobre del marginal, no t'adjudiquen res. Com es paga cadascuna (art. 12.4):`,
      "I les no competitives s'accepten senceres:",
    ],
    en: [
      "At the auction you can bid in two ways (Orden ECM/2/2026, art. 10; official text in Spanish):",
      `A non-competitive bid is the usual saver's choice: you name no rate and are allotted at the average price. At most ${euros(NON_COMPETITIVE_MAX, "en").replace(".00", "")} per person and auction. In a competitive bid you name the rate you want (three decimals): ask above the marginal rate and you get nothing. How each one is priced (art. 12.4):`,
      "And non-competitive bids are filled in full:",
    ],
  });

  const ex = top[12] ?? known.at(-1) ?? null;
  const exDays = ex ? resultDays(ex) : 0;
  const exBill = ex ? computeBill({ nominal: 1000, ratePct: ex.avgRate, days: exDays }) : null;
  const formula = L(locale, {
    es: [
      "Las Letras no pagan cupón: se compran por menos de 1.000 € y se cobran 1.000 € al vencimiento. El tipo de interés es simple, con base 360 días (Orden ECM/2/2026, art. 14):",
      ex && exBill?.status === "ok"
        ? `Ejemplo con la última subasta a ${ex.term} meses: tipo medio ${rate3(ex.avgRate, "es")} y ${exDays} días → precio ${price3(exBill.pricePct, "es")} (el Tesoro publicó ${price3(ex.avgPrice, "es")}), pagas ${euros(exBill.paid, "es")} y cobras 1.000 €: ${euros(exBill.gross, "es")} de rendimiento. La TAE equivalente, ${pct(exBill.taePct, 3, "es")}, capitaliza ese tipo a un año de 365 días: es la cifra que se compara con la TAE de un depósito.`
        : "",
    ],
    ca: [
      "Les lletres no paguen cupó: es compren per menys de 1.000 € i es cobren 1.000 € al venciment. El tipus d'interès és simple, amb base 360 dies (Orden ECM/2/2026, art. 14):",
      ex && exBill?.status === "ok"
        ? `Exemple amb l'última subhasta a ${ex.term} mesos: tipus mitjà ${rate3(ex.avgRate, "ca")} i ${exDays} dies → preu ${price3(exBill.pricePct, "ca")} (el Tresor va publicar ${price3(ex.avgPrice, "ca")}), pagues ${euros(exBill.paid, "ca")} i cobres 1.000 €: ${euros(exBill.gross, "ca")} de rendiment. La TAE equivalent, ${pct(exBill.taePct, 3, "ca")}, capitalitza aquest tipus a un any de 365 dies: és la xifra que es compara amb la TAE d'un dipòsit.`
        : "",
    ],
    en: [
      "Bills pay no coupon: you buy below €1,000 and get €1,000 back at maturity. The rate is simple interest on a 360-day basis (Orden ECM/2/2026, art. 14):",
      ex && exBill?.status === "ok"
        ? `Example with the latest ${ex.term}-month auction: average rate ${rate3(ex.avgRate, "en")} over ${exDays} days → price ${price3(exBill.pricePct, "en")} (the Treasury published ${price3(ex.avgPrice, "en")}), you pay ${euros(exBill.paid, "en")} and get €1,000: a ${euros(exBill.gross, "en")} return. The equivalent TAE, ${pct(exBill.taePct, 3, "en")}, compounds that rate over a 365-day year: that is the figure to compare with a deposit's TAE.`
        : "",
    ],
  });

  const tax = L(locale, {
    es: [
      "Para un residente en España, lo que ganas (lo que cobras al vencimiento o al vender menos lo que pagaste, con los gastos justificados) es rendimiento del capital mobiliario (Ley del IRPF, art. 25.2.b):",
      "Va a la base del ahorro, con esta escala (estatal más autonómica):",
      "No te retienen nada (Reglamento del IRPF, art. 75.3.b; lo recoge el manual de la Renta de la Agencia Tributaria), así que pagas todo el impuesto en la declaración de la Renta del año en que cobras o vendes la letra:",
      "Ojo: si no compras la letra sino una «cuenta» de un banco basada en Letras, esa sí tiene retención:",
      "¿Obliga a hacer la declaración? Puedes no tener que presentarla si todas tus rentas están dentro de los límites del art. 96.2 (por ejemplo, trabajo hasta 22.000 € en las condiciones que fija) y los rendimientos de Letras, con las otras rentas de esta lista, no pasan de 1.000 € al año (art. 96.2.c):",
      "No residentes sin establecimiento permanente en España: según el Tesoro, sus rendimientos de deuda pública no tributan en España (en su país de residencia, sí puede ser):",
    ],
    ca: [
      "Per a un resident a Espanya, el que guanyes (el que cobres al venciment o en vendre menys el que vas pagar, amb les despeses justificades) és rendiment del capital mobiliari (Llei de l'IRPF, art. 25.2.b; text oficial en castellà):",
      "Va a la base de l'estalvi, amb aquesta escala (estatal més autonòmica):",
      "No et retenen res (Reglament de l'IRPF, art. 75.3.b; ho recull el manual de la Renda de l'Agència Tributària), així que pagues tot l'impost a la declaració de la Renda de l'any en què cobres o vens la lletra:",
      "Compte: si no compres la lletra sinó un «compte» d'un banc basat en lletres, aquest sí que té retenció:",
      "Obliga a fer la declaració? Pots no haver de presentar-la si totes les teves rendes són dins dels límits de l'art. 96.2 (per exemple, treball fins a 22.000 € en les condicions que fixa) i els rendiments de lletres, amb les altres rendes d'aquesta llista, no passen de 1.000 € l'any (art. 96.2.c):",
      "No residents sense establiment permanent a Espanya: segons el Tresor, els seus rendiments de deute públic no tributen a Espanya (al seu país de residència, sí que pot ser):",
    ],
    en: [
      "For a Spanish tax resident, what you earn (what you get at maturity or on a sale, minus what you paid and documented costs) is investment income, “rendimiento del capital mobiliario” (Income Tax Act, art. 25.2.b; official text in Spanish):",
      "It goes to the savings tax base, on this scale (state plus regional halves):",
      "Nothing is withheld (Income Tax Regulation, art. 75.3.b; the Tax Agency's income tax manual says the same), so you pay all the tax in the return for the year the bill is repaid or sold:",
      "Note: a bank “account” built on bills, rather than the bill itself, does have withholding:",
      "Do you have to file? You may not, if all your income is within the art. 96.2 limits (for example wages up to €22,000 on the conditions it sets) and bill income, with the other items in this list, stays within €1,000 a year (art. 96.2.c):",
      "Non-residents without a permanent establishment in Spain: according to the Treasury, their income from Spanish government debt is not taxed in Spain (it may be where they live):",
    ],
  });
  const scaleCols = L(locale, { es: ["Base del ahorro", "Tipo"], ca: ["Base de l'estalvi", "Tipus"], en: ["Savings tax base", "Rate"] });
  const scaleRows = SAVINGS_SCALE.map((b, i) => {
    const from = i === 0 ? 0 : SAVINGS_SCALE[i - 1]!.upTo;
    const f = (n: number) => wholeEuros(n, locale);
    const label = Number.isFinite(b.upTo)
      ? L(locale, { es: `De ${f(from)} a ${f(b.upTo)}`, ca: `De ${f(from)} a ${f(b.upTo)}`, en: `${f(from)} to ${f(b.upTo)}` })
      : L(locale, { es: `Más de ${f(from)}`, ca: `Més de ${f(from)}`, en: `Over ${f(from)}` });
    return [label, pct(b.rate * 100, 0, locale)] as const;
  });

  const sources: [string, string][] = [
    [L(locale, { es: "Tesoro Público: resultado de últimas subastas de Letras", ca: "Tresor Públic: resultat de les últimes subhastes de lletres", en: "Tesoro Público: latest Letras auction results" }), latestResultsUrl(locale)],
    [L(locale, { es: "Tesoro Público: resultados de subastas anteriores", ca: "Tresor Públic: resultats de subhastes anteriors", en: "Tesoro Público: earlier auction results" }), URLS.tesoroPastResults],
    [L(locale, { es: "Tesoro Público: calendario de subastas 2026 (PDF)", ca: "Tresor Públic: calendari de subhastes 2026 (PDF)", en: "Tesoro Público: 2026 auction calendar (PDF)" }), CALENDAR_2026_PDF],
    [L(locale, { es: "Tesoro Público: Letras del Tesoro", ca: "Tresor Públic: Lletres del Tresor", en: "Tesoro Público: Letras del Tesoro" }), URLS.tesoroLetras],
    [L(locale, { es: "Tesoro Público: presentación de peticiones", ca: "Tresor Públic: presentació de peticions", en: "Tesoro Público: submitting bids" }), URLS.tesoroPeticiones],
    [L(locale, { es: "Tesoro Público: preguntas frecuentes", ca: "Tresor Públic: preguntes freqüents", en: "Tesoro Público: frequently asked questions" }), URLS.tesoroFaq],
    [L(locale, { es: "Banco de España: anuncio de la subasta de Letras a 3 y 9 meses de diciembre de 2026 (PDF)", ca: "Banc d'Espanya: anunci de la subhasta de lletres a 3 i 9 mesos de desembre de 2026 (PDF)", en: "Banco de España: notice of the December 2026 3- and 9-month bill auction (PDF)" }), URLS.bdeNotice],
    [L(locale, { es: "Banco de España: apertura de Cuentas Directas", ca: "Banc d'Espanya: obertura de comptes directes", en: "Banco de España: opening a Cuenta Directa" }), URLS.bdeDirectAccounts],
    [`${NORMS.orden.name} (${NORMS.orden.ref})`, NORMS.orden.url],
    [`${NORMS.lirpf.name} (${NORMS.lirpf.ref}), arts. 25.2, 66, 76 y 96`, NORMS.lirpf.url],
    [`${NORMS.rirpf.name} (${NORMS.rirpf.ref}), art. 75.3.b`, NORMS.rirpf.url],
    [L(locale, { es: "Agencia Tributaria: Manual práctico de Renta 2025, determinación del rendimiento íntegro", ca: "Agència Tributària: Manual pràctic de Renda 2025, determinació del rendiment íntegre", en: "AEAT: 2025 income tax manual, gross investment income" }), URLS.aeatManual],
  ];

  return (
    <>
      <SiteHeader locale={locale} translations={letrasEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{freshness}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              {options.length ? <LetrasCalculator locale={locale} options={options} initialTerm={12} initialAmount={10_000} /> : null}
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <h2 id="ultima-subasta">{h.latest}</h2>
              {known.length ? (
                <div className="ci-table-scroll mt-4">
                  <table className="ci-local-table ci-stack-table">
                    <thead>
                      <tr>
                        {latestCols.map((c) => (
                          <th key={c} scope="col">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {known.map((r) => (
                        <tr key={r.term}>
                          <th scope="row">{termName(r.term, locale)}</th>
                          <td data-label={latestCols[1]}>{day(r.auction)}</td>
                          <td data-label={latestCols[2]}>
                            {shortDay(r.settlement)} → {shortDay(r.maturity)} ({resultDays(r)} {daysWord})
                          </td>
                          <td data-label={latestCols[3]}>
                            <strong>{rate3(r.avgRate, locale)}</strong>
                          </td>
                          <td data-label={latestCols[4]}>{rate3(r.marginalRate, locale)}</td>
                          <td data-label={latestCols[5]}>{price3(r.avgPrice, locale)}</td>
                          <td data-label={latestCols[6]}>{r.previousMarginalRate === null ? "—" : rate3(r.previousMarginalRate, locale)}</td>
                          <td data-label={latestCols[7]}>
                            {millions(r.allotted + r.allottedSecondRound, locale)} / {millions(r.requested, locale)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              <p className="text-sm">{latestNote}</p>
              <p className="text-sm">
                {sourceLine} <A href={latestResultsUrl(locale)}>{resultsLink}</A> · <A href={URLS.tesoroPastResults}>{pastLink}</A>
              </p>

              <h2 id="por-letra">{h.per1000}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {per1000Cols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {known.map((r) => {
                      const b = computeBill({ nominal: 1000, ratePct: r.avgRate, days: resultDays(r) });
                      if (b.status !== "ok") return null;
                      return (
                        <tr key={r.term}>
                          <th scope="row">
                            {termName(r.term, locale)} ({rate3(r.avgRate, locale)})
                          </th>
                          <td data-label={per1000Cols[1]}>{price3(b.pricePct, locale)}</td>
                          <td data-label={per1000Cols[2]}>{euros(b.paid, locale)}</td>
                          <td data-label={per1000Cols[3]}>{euros(1000, locale)}</td>
                          <td data-label={per1000Cols[4]}>{euros(b.gross, locale)}</td>
                          <td data-label={per1000Cols[5]}>{pct(taeFromRate(r.avgRate, resultDays(r)), 3, locale)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">{per1000Note}</p>

              <h2 id="proximas-subastas">{h.next}</h2>
              <p>{nextIntro}</p>
              {next.length ? (
                <div className="ci-table-scroll mt-4">
                  <table className="ci-local-table ci-stack-table">
                    <thead>
                      <tr>
                        {nextCols.map((c) => (
                          <th key={c} scope="col">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {next.map((row) => (
                        <tr key={row.auction}>
                          <th scope="row">{weekdayDay(row.auction, locale)}</th>
                          <td data-label={nextCols[1]}>{row.terms.map((t) => termName(t, locale)).join(" · ")}</td>
                          <td data-label={nextCols[2]}>{weekdayDay(row.requestsBy, locale)}</td>
                          <td data-label={nextCols[3]}>{weekdayDay(row.payBy, locale)}</td>
                          <td data-label={nextCols[4]}>{weekdayDay(row.issue, locale)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              <p className="text-sm">{deadlineNote}</p>
              {cal2027 ? <p>{cal2027}</p> : null}

              {yearRows.length ? (
                <>
                  <h2 id="tipos-2026">{h.year}</h2>
                  <div className="ci-table-scroll mt-4">
                    <table className="ci-local-table ci-stack-table">
                      <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{yearCaption}</caption>
                      <thead>
                        <tr>
                          <th scope="col">{monthWord}</th>
                          {TERMS.map((t) => (
                            <th key={t} scope="col">
                              {termName(t, locale)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {yearRows.map((row) => (
                          <tr key={row.month}>
                            <th scope="row">{monthName(row.month, locale)}</th>
                            {TERMS.map((t) => (
                              <td key={t} data-label={termName(t, locale)}>
                                {row.byTerm[t] ? rate3(row.byTerm[t]!.avgRate, locale) : "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}

              <h2 id="como-comprar">{h.buy}</h2>
              <p>{buy.intro}</p>
              <ul>
                {buy.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <Quote>{QUOTE.tesoroOnline}</Quote>
              <p>{buy.fee}</p>
              <Quote>{QUOTE.bdeFee}</Quote>
              <p>{buy.sell}</p>

              <h2 id="competitiva">{h.bids}</h2>
              <p>{bids[0]}</p>
              <Quote>{QUOTE.ordenBids}</Quote>
              <p>{bids[1]}</p>
              <Quote>{QUOTE.ordenAllotment}</Quote>
              <p>{bids[2]}</p>
              <Quote>{QUOTE.ordenNonCompetitive}</Quote>

              <h2 id="rentabilidad">{h.formula}</h2>
              <p>{formula[0]}</p>
              <p className="font-semibold">P = 100 / (1 + i × d / 360)</p>
              <p className="text-sm">{L(locale, { es: "P: precio en % del nominal; i: tipo de interés en tanto por uno; d: días hasta el vencimiento.", ca: "P: preu en % del nominal; i: tipus d'interès en tant per u; d: dies fins al venciment.", en: "P: price in % of face value; i: interest rate as a decimal; d: days to maturity." })}</p>
              {formula[1] ? <p>{formula[1]}</p> : null}

              <h2 id="irpf">{h.tax}</h2>
              <p>{tax[0]}</p>
              <Quote>{QUOTE.lirpf25}</Quote>
              <p>{tax[1]}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{L(locale, { es: SAVINGS_SCALE_NORM, ca: "Llei 35/2006, arts. 66.1 i 76, en la redacció de la Llei 7/2024 (BOE-A-2024-26694), des de l'1 de gener de 2025", en: "Ley 35/2006, arts. 66.1 and 76, as amended by Ley 7/2024 (BOE-A-2024-26694), from 1 January 2025" })}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{scaleCols[0]}</th>
                      <th scope="col">{scaleCols[1]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scaleRows.map(([k, v]) => (
                      <tr key={k}>
                        <th scope="row" className="font-normal">
                          {k}
                        </th>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>{tax[2]}</p>
              <Quote>{QUOTE.rirpf75}</Quote>
              <p>{tax[3]}</p>
              <Quote>{QUOTE.rirpf75accounts}</Quote>
              <p>{tax[4]}</p>
              <Quote>{QUOTE.lirpf96}</Quote>
              <p>{tax[5]}</p>
              <Quote>{QUOTE.calendarNonResidents}</Quote>
              <p className="text-sm text-[var(--color-muted)]">
                {L(locale, {
                  es: `Normas leídas en el BOE, el Tesoro y la Agencia Tributaria el ${day(RULES_AS_OF)}. El País Vasco y Navarra tienen sus propias normas del IRPF.`,
                  ca: `Normes llegides al BOE, el Tresor i l'Agència Tributària el ${day(RULES_AS_OF)}. Els territoris forals (País Basc, Navarra) tenen normes pròpies.`,
                  en: `Rules read in the BOE, the Treasury and the Tax Agency on ${day(RULES_AS_OF)}. The Basque Country and Navarre have their own tax rules.`,
                })}
              </p>

              <h2 id="fuentes">{h.sources}</h2>
              <ul className="text-sm">
                {sources.map(([name, url]) => (
                  <li key={url}>
                    <A href={url}>{name}</A>
                  </li>
                ))}
              </ul>

              <MoreCalculators current="treasury-bills" locale={locale} />
            </div>
            <ShareBar locale={locale} path={letrasPath(locale)} title={meta.h1} contentType="treasury_bills" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
