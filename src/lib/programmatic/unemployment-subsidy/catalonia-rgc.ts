import type { CalcLocale } from "@/lib/programmatic/calculators/paths";
import { IRSC_2026 } from "@/lib/programmatic/iprem/rules";

import { money } from "./copy";

/**
 * "Si se acaba el subsidio en Cataluña: la Renda Garantida de Ciutadania"
 * (27 Nov 2026, batch 8R), on the subsidy checker. The Generalitat's own
 * last-resort benefit, for people who can work (persones activables).
 *
 * Read 27 Nov 2026 with curl + grep of the quoted words:
 *  - Generalitat, tràmit 21222 "Renda garantida de ciutadania i prestació
 *    complementària a prestacions estatals (persones activables)",
 *    Departament de Drets Socials i Inclusió, "Data d'actualització
 *    03.11.2026" (RGC_SOURCE.url): QUOTE below; «L'import màxim mensual és:
 *    1 persona: 801,85 € 2 persones: 1.202,77 € 3 persones: 1.323,05 € 4
 *    persones: 1.443,33 € 5 o més persones: 1.459,36 €»; «No tenir uns
 *    ingressos superiors als de la taula següent durant els 2 mesos anteriors
 *    a la sol·licitud : 1 persona: 1.603,70 € 2 persones: 2.405,54 € 3
 *    persones: 2.646,10 € 4 persones: 2.886,66 € 5 o més persones: 2.918,72 €»
 *    (each exactly twice the monthly amount: the two months added up);
 *    «Tenir més de 23 anys»; «Haver residit de manera continuada i efectiva a
 *    Catalunya durant els 2 anys anteriors a la sol·licitud»; «No estar
 *    treballant»; «Acreditar que s'han demanat altres prestacions, ajuts o
 *    pensions a què es pugui tenir dret (ingrés mínim vital, subsidis,
 *    prestacions d'atur, pensions d'aliments, etc.)»; «No tenir patrimoni
 *    immobiliari, excepte l'habitatge habitual»; «La pots sol·licitar
 *    qualsevol moment».
 *  - Generalitat, Drets Socials i Inclusió, "Ingrés mínim vital (IMV) i Renda
 *    Garantida de Ciutadania (RGC)", "Data d'actualització: 05.11.2026"
 *    (RGC_GUIDE_URL), obligations if you get the RGC: «Has de mantenir-te
 *    inscrit al Servei Públic d'Ocupació de Catalunya (SOC) i no pots
 *    rebutjar una oferta de feina adequada.»
 *  - DOGC 9706 (13.7.2026), Llei 10/2026, de pressupostos de la Generalitat
 *    per al 2026, DA 17.1 (PDF re-read today, the IPREM module's IRSC_2026):
 *    the IRSC 2026 is «dotze mensualitats de 801,85 euros», the same figure as
 *    the one-person RGC above, which ties the tràmit's table to 2026.
 *
 * Do not print: what a household actually receives (the page gives maximums
 * only, no formula), the "no activables" variant, the 18-22 cases beyond the
 * page's list. The figures are 2026's (IRSC 2026): a test fails from
 * RGC_READ_BY until the tràmit and the 2027 IRSC are re-read.
 */

export const RGC_SOURCE = {
  url: "https://tramits.gencat.cat/ca/tramits/tramits-temes/rgc_complement_estatal_activable",
  updated: "2026-11-03",
  readOn: "2026-11-27",
} as const;
export const RGC_GUIDE_URL = "https://dretssocials.gencat.cat/ca/ambits_tematics/pobresa_i_inclusio_social/imv-rgc/";
/** A 2027 budget (or its extension) sets the 2027 IRSC and the RGC with it: re-read in January. */
export const RGC_READ_BY = "2027-01-01";
export const RGC_YEAR = 2026;

/** Maximum monthly RGC by household size (1 to 5 or more), as the tràmit prints it. */
export const RGC_MAX_MONTHLY = [801.85, 1202.77, 1323.05, 1443.33, 1459.36] as const;
/** Income ceiling over the two months before applying, by household size, as printed. */
export const RGC_INCOME_2_MONTHS = [1603.7, 2405.54, 2646.1, 2886.66, 2918.72] as const;
/** Two years of continuous residence in Catalonia before applying. */
export const RGC_RESIDENCE_YEARS = 2;
/** «Tenir més de 23 anys». */
export const RGC_MIN_AGE = 23;
export { IRSC_2026 };

/** Verbatim (Catalan, as published; whitespace from the HTML markup normalised). */
export const RGC_QUOTE = {
  what: "La renda garantida de ciutadania (RGC) és una prestació econòmica per garantir uns ingressos mínims a les persones que tenen pocs recursos.",
  imvFirst: "Per demanar l’RGC has d’haver sol·licitat primer l’ingrés mínim vital (IMV).",
  complement: "La prestació complementària de prestacions estatals és per a aquelles persones que ja reben una prestació, per tal que puguin arribar al mínim que estableix l'RGC.",
  residence: "Haver residit de manera continuada i efectiva a Catalunya durant els 2 anys anteriors a la sol·licitud",
  soc: "Has de mantenir-te inscrit al Servei Públic d'Ocupació de Catalunya (SOC) i no pots rebutjar una oferta de feina adequada.",
} as const;

export interface RgcCopy {
  heading: string;
  paragraphs: string[];
  tableHead: string[];
  tableRows: string[][];
  caption: string;
  sourceName: string;
  guideName: string;
  readLine: string;
  faq: { q: string; a: string };
}

export function rgcCopy(locale: CalcLocale): RgcCopy {
  const m = (v: number) => money(v, locale);
  const [one, , , , five] = RGC_MAX_MONTHLY;
  const people = {
    es: ["1 persona", "2 personas", "3 personas", "4 personas", "5 o más personas"],
    ca: ["1 persona", "2 persones", "3 persones", "4 persones", "5 o més persones"],
    en: ["1 person", "2 people", "3 people", "4 people", "5 or more people"],
  }[locale];
  const tableRows = people.map((p, i) => [p, m(RGC_MAX_MONTHLY[i]!), m(RGC_INCOME_2_MONTHS[i]!)]);
  if (locale === "es") {
    return {
      heading: "Si se acaba el subsidio en Cataluña: la Renda Garantida de Ciutadania 2026",
      paragraphs: [
        `Cuando el subsidio se agota, en Cataluña queda una prestación de la Generalitat: la Renda Garantida de Ciutadania (RGC), que garantiza unos ingresos mínimos a quien tiene pocos recursos. En 2026 llega como máximo a ${m(one)} al mes para una persona sola, la misma cifra que el indicador de renta de suficiencia de Cataluña (IRSC) de 2026, y a ${m(five)} con cinco personas o más.`,
        `Requisitos básicos según la Generalitat: tener más de ${RGC_MIN_AGE} años (de 18 a 22, solo en algunos casos, como tener menores a cargo); estar empadronado en Cataluña y haber vivido aquí de forma continuada los ${RGC_RESIDENCE_YEARS} años anteriores a la solicitud; no estar trabajando (con excepciones, como las familias monoparentales o numerosas); haber pedido antes el Ingreso Mínimo Vital y las demás prestaciones a las que tengas derecho, subsidios incluidos; no tener inmuebles salvo la vivienda habitual, y no superar los ingresos de la tabla durante los 2 meses anteriores a la solicitud.`,
        "Mientras la cobras, tienes que seguir inscrito en el SOC y no puedes rechazar una oferta de trabajo adecuada. Si todavía cobras una prestación estatal (el subsidio, por ejemplo) y no llegas al mínimo de la RGC, existe la prestación complementaria, que completa hasta ese mínimo. Se pide a la Generalitat en cualquier momento, por internet o en persona.",
      ],
      tableHead: ["Unidad familiar", "Importe máximo al mes", "Ingresos máximos en los 2 meses anteriores"],
      tableRows,
      caption: `Renda Garantida de Ciutadania ${RGC_YEAR} (Generalitat de Catalunya, trámite actualizado el 03/11/2026)`,
      sourceName: "Generalitat: Renda garantida de ciutadania y prestación complementaria (personas activables)",
      guideName: "Generalitat: IMV y RGC, requisitos y obligaciones",
      readLine: "Leído el 27 de noviembre de 2026.",
      faq: {
        q: "¿Qué puedo cobrar en Cataluña cuando se acaba el subsidio por desempleo?",
        a: `Puedes solicitar el Ingreso Mínimo Vital y, después, la Renda Garantida de Ciutadania de la Generalitat: en 2026, como máximo ${m(one)} al mes para una persona sola y ${m(five)} con cinco o más. Hace falta, entre otras cosas, haber vivido en Cataluña los ${RGC_RESIDENCE_YEARS} años anteriores, haber pedido antes el IMV y seguir inscrito en el SOC.`,
      },
    };
  }
  if (locale === "ca") {
    return {
      heading: "Si s'acaba el subsidi a Catalunya: la Renda Garantida de Ciutadania 2026",
      paragraphs: [
        `Quan el subsidi s'esgota, a Catalunya queda una prestació de la Generalitat: la Renda Garantida de Ciutadania (RGC), que garanteix uns ingressos mínims a qui té pocs recursos. El 2026 arriba com a màxim a ${m(one)} al mes per a una persona sola, la mateixa xifra que l'indicador de renda de suficiència de Catalunya (IRSC) del 2026, i a ${m(five)} amb cinc persones o més.`,
        `Requisits bàsics segons la Generalitat: tenir més de ${RGC_MIN_AGE} anys (de 18 a 22, només en alguns casos, com tenir menors a càrrec); estar empadronat a Catalunya i haver-hi viscut de manera continuada els ${RGC_RESIDENCE_YEARS} anys anteriors a la sol·licitud; no estar treballant (amb excepcions, com les famílies monoparentals o nombroses); haver demanat abans l'Ingrés Mínim Vital i les altres prestacions a què tinguis dret, subsidis inclosos; no tenir immobles llevat de l'habitatge habitual, i no superar els ingressos de la taula durant els 2 mesos anteriors a la sol·licitud.`,
        "Mentre la cobres, has de continuar inscrit al SOC i no pots rebutjar una oferta de feina adequada. Si encara cobres una prestació estatal (el subsidi, per exemple) i no arribes al mínim de l'RGC, hi ha la prestació complementària, que completa fins a aquest mínim. Es demana a la Generalitat en qualsevol moment, per internet o presencialment.",
      ],
      tableHead: ["Unitat familiar", "Import màxim al mes", "Ingressos màxims als 2 mesos anteriors"],
      tableRows,
      caption: `Renda Garantida de Ciutadania ${RGC_YEAR} (Generalitat de Catalunya, tràmit actualitzat el 03/11/2026)`,
      sourceName: "Generalitat: Renda garantida de ciutadania i prestació complementària (persones activables)",
      guideName: "Generalitat: IMV i RGC, requisits i obligacions",
      readLine: "Llegit el 27 de novembre de 2026.",
      faq: {
        q: "Què puc cobrar a Catalunya quan s'acaba el subsidi per desocupació?",
        a: `Pots sol·licitar l'Ingrés Mínim Vital i, després, la Renda Garantida de Ciutadania de la Generalitat: el 2026, com a màxim ${m(one)} al mes per a una persona sola i ${m(five)} amb cinc o més. Cal, entre altres coses, haver viscut a Catalunya els ${RGC_RESIDENCE_YEARS} anys anteriors, haver demanat abans l'IMV i continuar inscrit al SOC.`,
      },
    };
  }
  return {
    heading: "When the subsidy ends in Catalonia: the Renda Garantida de Ciutadania 2026",
    paragraphs: [
      `Once the subsidy runs out, Catalonia has a benefit of its own: the Generalitat's Renda Garantida de Ciutadania (RGC, guaranteed citizen income), which guarantees a minimum income to people with few resources. In 2026 it pays at most ${m(one)} a month for one person, the same figure as Catalonia's 2026 sufficiency income indicator (IRSC), and ${m(five)} for five people or more.`,
      `Basic requirements according to the Generalitat: being over ${RGC_MIN_AGE} (18 to 22 only in some cases, such as having children in your care); being registered as resident (empadronado) in Catalonia and having lived here continuously for the ${RGC_RESIDENCE_YEARS} years before applying; not working (with exceptions, such as single-parent or large families); having first applied for the Minimum Living Income (IMV) and any other benefit you may be entitled to, subsidies included; owning no property other than your home; and income over the 2 months before applying not above the table's limit.`,
      "While you receive it you must stay registered with the SOC and cannot turn down a suitable job offer. If you still receive a state benefit (the subsidy, for example) and fall short of the RGC minimum, there is a complementary benefit that tops you up to it. You apply to the Generalitat at any time, online or in person.",
    ],
    tableHead: ["Household", "Maximum a month", "Income limit over the 2 previous months"],
    tableRows,
    caption: `Renda Garantida de Ciutadania ${RGC_YEAR} (Generalitat de Catalunya, procedure page updated 03/11/2026)`,
    sourceName: "Generalitat: Renda garantida de ciutadania and complementary benefit (people able to work), in Catalan",
    guideName: "Generalitat: IMV and RGC, requirements and obligations, in Catalan",
    readLine: "Read on 27 November 2026.",
    faq: {
      q: "What can I get in Catalonia when the unemployment subsidy ends?",
      a: `You can apply for the Minimum Living Income (IMV) and then the Generalitat's Renda Garantida de Ciutadania: in 2026, at most ${m(one)} a month for one person and ${m(five)} for five or more. Among other things you need ${RGC_RESIDENCE_YEARS} years of residence in Catalonia, to have applied for the IMV first and to stay registered with the SOC.`,
    },
  };
}
