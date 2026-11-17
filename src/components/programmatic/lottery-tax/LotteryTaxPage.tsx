import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { b2href } from "@/lib/content/batch02/shared";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { gordoHubPath } from "@/lib/programmatic/gordo/paths";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { DRAW_SHORT, PRESET_LABEL, elDay, lotteryTaxEditions, lotteryTaxPath, money, type LtLocale } from "@/lib/programmatic/lottery-tax/copy";
import { calculateOk, type Breakdown } from "@/lib/programmatic/lottery-tax/engine";
import { DEFAULT_PRESET, examples, headline, lotteryTaxFaq, lotteryTaxMeta, presetInput, prizeTable, type ExampleId } from "@/lib/programmatic/lottery-tax/page";
import { DRAWS, EXEMPT_PER_TICKET, QUOTE, RULES_AS_OF, SELAE_READ, SOURCES } from "@/lib/programmatic/lottery-tax/rules";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { LotteryTaxCalculator } from "./LotteryTaxCalculator";

/**
 * "Premios de lotería: cuánto se queda Hacienda" / "Premis de loteria: quant
 * se'n queda Hisenda" / "Spanish lottery prize tax": the special levy of Ley
 * 35/2006, DA 33ª, as a calculator (server-rendered on one whole El Gordo
 * décimo), then every Christmas, El Niño and La Grossa prize in one table,
 * the rule with the BOE's words, shared décimos and participaciones, worked
 * examples, the tax return, non-residents, La Grossa, questions, sources and
 * limits. Every figure comes from rules.ts through the engine.
 */

const L = <T,>(locale: LtLocale, v: Record<LtLocale, T>): T => v[locale];

export function lotteryTaxCrumbs(locale: LtLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: lotteryTaxMeta(locale).breadcrumb, href: lotteryTaxPath(locale) }];
}

export function lotteryTaxMetadata(locale: LtLocale): Metadata {
  const m = lotteryTaxMeta(locale);
  return buildMetadata({ locale, path: lotteryTaxPath(locale), title: m.title, description: m.description, translations: lotteryTaxEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ text, href, label }: { text: string; href: string; label: string }) {
  return (
    <blockquote lang="es">
      <p>«{text}»</p>
      <footer className="text-sm">
        <A href={href}>{label}</A>
      </footer>
    </blockquote>
  );
}

const EXAMPLE_LABEL: Record<ExampleId, Record<LtLocale, string>> = {
  "one-gordo": { es: "Un décimo del Gordo", ca: "Un dècim del Gordo", en: "One El Gordo décimo" },
  "share-5": { es: "Participación de 5 € en un décimo del Gordo (25 %)", ca: "Participació de 5 € en un dècim del Gordo (25 %)", en: "€5 share of an El Gordo décimo (25%)" },
  "half-second": { es: "Medio décimo del segundo premio (dos personas a medias)", ca: "Mig dècim del segon premi (dues persones a mitges)", en: "Half a second-prize décimo (two people, half each)" },
  "two-gordo": { es: "Dos décimos del Gordo", ca: "Dos dècims del Gordo", en: "Two El Gordo décimos" },
  third: { es: "Un décimo del tercer premio", ca: "Un dècim del tercer premi", en: "One third-prize décimo" },
  grossa: { es: "Un billete del primer premio de La Grossa de Cap d'Any", ca: "Un bitllet del primer premi de La Grossa de Cap d'Any", en: "One La Grossa de Cap d'Any first-prize ticket" },
  aeat: { es: "El ejemplo de la Agencia Tributaria: un premio de 100.000 €", ca: "L'exemple de l'Agència Tributària: un premi de 100.000 €", en: "The Tax Agency's own example: a €100,000 prize" },
};

function BreakdownCells({ b, locale, cols }: { b: Breakdown; locale: LtLocale; cols: string[] }) {
  return (
    <>
      <td data-label={cols[1]}>{money(b.gross, locale)}</td>
      <td data-label={cols[2]}>{money(b.exempt, locale)}</td>
      <td data-label={cols[3]}>{money(b.withholding, locale)}</td>
      <td data-label={cols[4]}>
        <strong>{money(b.net, locale)}</strong>
      </td>
    </>
  );
}

export function LotteryTaxRoute({ locale }: { locale: LtLocale }) {
  const meta = lotteryTaxMeta(locale);
  const crumbs = lotteryTaxCrumbs(locale);
  const h = headline();
  const M = (n: number) => money(n, locale);
  const dmy = (iso: string) => dayMonthYear(iso, locale);
  const on = (iso: string) => elDay(iso, locale);
  const selaeRead = dmy(SELAE_READ);
  const ex = M(EXEMPT_PER_TICKET);
  const g = h.gordo.total;
  const s5 = h.share5.total;
  const half = calculateOk(presetInput("segundo", 10)).total;
  const two = calculateOk(presetInput("gordo", 20, 2)).total;
  const gr = h.grossa.total;
  const gr2 = calculateOk(presetInput("grossa-segon")).total;
  const gr3 = presetInput("grossa-tercer").prize;
  const faq = lotteryTaxFaq(locale);
  const guide = b2href("loteriaNadal", locale);
  const grossaGuide = b2href("grossa", locale);
  const gordoHub = gordoHubPath(locale);

  const lead = L(locale, {
    es: `Hacienda se queda el 20 % de lo que pasa de ${ex} en cada décimo premiado. Un décimo del Gordo de Navidad (${M(g.gross)}) paga ${M(g.withholding)} y cobras ${M(g.net)}; una participación de 5 € en ese décimo deja ${M(s5.net)}. El segundo premio deja ${M(h.second.total.net)} por décimo y el tercero, ${M(h.third.total.net)}. Los cuartos, los quintos, la pedrea y el reintegro no pagan nada. Se retiene al cobrar y no se declara en la Renta.`,
    ca: `Hisenda es queda el 20 % del que passa de ${ex} en cada dècim premiat. Un dècim del Gordo de Nadal (${M(g.gross)}) paga ${M(g.withholding)} i en cobres ${M(g.net)}; una participació de 5 € en aquest dècim en deixa ${M(s5.net)}. El segon premi en deixa ${M(h.second.total.net)} per dècim i el tercer, ${M(h.third.total.net)}. Els quarts, els cinquens, la pedrea i el reintegrament no paguen res. Es reté en cobrar i no es declara a la Renda.`,
    en: `Spain's tax office keeps 20% of whatever each winning décimo pays above ${ex}. An El Gordo décimo (${M(g.gross)}) pays ${M(g.withholding)} and you keep ${M(g.net)}; a €5 share of that décimo leaves ${M(s5.net)}. The second prize leaves ${M(h.second.total.net)} per décimo and the third ${M(h.third.total.net)}. Fourth and fifth prizes, the pedrea and the reintegro pay nothing. It is withheld when you collect, and you do not declare it on your tax return.`,
  });
  const fresh = L(locale, {
    es: `Normas revisadas ${on(RULES_AS_OF)} en el BOE (Ley 35/2006 del IRPF, disposición adicional 33.ª, texto consolidado del 11 de noviembre de 2026) y en la Agencia Tributaria. Premios de Navidad: programa de SELAE, leído ${on(SELAE_READ)}.`,
    ca: `Normes revisades ${on(RULES_AS_OF)} al BOE (Llei 35/2006 de l'IRPF, disposició addicional 33a, text consolidat de l'11 de novembre de 2026) i a l'Agència Tributària. Premis de Nadal: programa de SELAE, llegit ${on(SELAE_READ)}.`,
    en: `Rules checked ${on(RULES_AS_OF)} in the BOE (Law 35/2006 on income tax, additional provision 33, consolidated 11 November 2026) and with the Agencia Tributaria. Christmas prizes: SELAE's programme, read ${on(SELAE_READ)}.`,
  });
  const disclaimer = L(locale, {
    es: "Cálculo orientativo con la ley estatal del IRPF. Lo que cuenta es lo que te retenga y te pague quien abona el premio, y para cobrar solo vale la Lista Oficial de Premios de SELAE. Si tu caso no es el general (premio en especie, residencia en el País Vasco o Navarra, una empresa como titular), consúltalo en la Agencia Tributaria o con un asesor.",
    ca: "Càlcul orientatiu amb la llei estatal de l'IRPF. El que compta és el que et retingui i et pagui qui abona el premi, i per cobrar només val la Llista Oficial de Premis de SELAE. Si el teu cas no és el general (premi en espècie, residència al País Basc o Navarra, una empresa com a titular), consulta-ho a l'Agència Tributària o amb un assessor.",
    en: "An estimate under Spain's state income tax law. What counts is what the payer withholds and pays you, and only SELAE's official prize list (Lista Oficial de Premios) is valid for payment. If yours is not the general case (a prize in kind, living in the Basque Country or Navarre, a company as the holder), check with the Agencia Tributaria or an adviser.",
  });

  const hd = L(locale, {
    es: { table: "Cuánto se queda Hacienda de cada premio", how: "Cómo se calcula", shared: "Décimos compartidos y participaciones", examples: "Ejemplos", renta: "¿Hay que declararlo en la Renta?", nonRes: "Si no vives en España", grossa: "La Grossa de Cap d'Any y otras loterías", faq: "Preguntas frecuentes", sources: "Fuentes oficiales", limits: "Qué no calcula" },
    ca: { table: "Quant se'n queda Hisenda de cada premi", how: "Com es calcula", shared: "Dècims compartits i participacions", examples: "Exemples", renta: "S'ha de declarar a la Renda?", nonRes: "Si no vius a Espanya", grossa: "La Grossa de Cap d'Any i altres loteries", faq: "Preguntes freqüents", sources: "Fonts oficials", limits: "Què no calcula" },
    en: { table: "How much tax each prize pays", how: "How it is worked out", shared: "Shared décimos and participaciones", examples: "Worked examples", renta: "Do you declare it on your tax return?", nonRes: "If you do not live in Spain", grossa: "La Grossa de Cap d'Any and other lotteries", faq: "Questions", sources: "Official sources", limits: "What it does not cover" },
  });
  const cols = L(locale, {
    es: ["Premio", "Bruto", "Exento", "Hacienda (20 %)", "Cobras"],
    ca: ["Premi", "Brut", "Exempt", "Hisenda (20 %)", "Cobres"],
    en: ["Prize", "Gross", "Tax-free", "Withheld (20%)", "You get"],
  });
  const tableCaption = L(locale, {
    es: `Por décimo entero de 20 € (La Grossa: billete de 10 €). Navidad: programa de premios de SELAE de 26 de enero de 2026, leído ${on(SELAE_READ)}; El Niño: primer premio, página de la Lotería Nacional de SELAE (${selaeRead}); La Grossa: DOGC núm. 9640, leído ${on(RULES_AS_OF)}.`,
    ca: `Per dècim sencer de 20 € (La Grossa: bitllet de 10 €). Nadal: programa de premis de SELAE de 26 de gener de 2026, llegit ${on(SELAE_READ)}; El Nen: primer premi, pàgina de la Loteria Nacional de SELAE (${selaeRead}); La Grossa: DOGC núm. 9640, llegit ${on(RULES_AS_OF)}.`,
    en: `Per whole €20 décimo (La Grossa: €10 ticket). Christmas: SELAE's prize programme of 26 January 2026, read ${on(SELAE_READ)}; El Niño: first prize, SELAE's Lotería Nacional page (${selaeRead}); La Grossa: DOGC no. 9640, read ${on(RULES_AS_OF)}.`,
  });
  const ninoNote = L(locale, {
    es: "Los demás premios de El Niño no están en la tabla: la web de SELAE no respondió a nuestras consultas en noviembre y no hemos podido leer su programa de 2027. Para otro premio, elige «Otro importe» en la calculadora y escribe lo que paga el décimo.",
    ca: "La resta de premis del Nen no són a la taula: el web de SELAE no va respondre a les nostres consultes al novembre i no n'hem pogut llegir el programa del 2027. Per a un altre premi, tria «Un altre import» a la calculadora i escriu el que paga el dècim.",
    en: "El Niño's other prizes are not in the table: SELAE's website did not answer our requests in November and we could not read its 2027 programme. For any other prize, pick «Another amount» in the calculator and type what the décimo pays.",
  });

  const howItems = L(locale, {
    es: [
      `**Por décimo.** Cada décimo premiado se calcula por separado y tiene sus propios ${ex} exentos: dos décimos del Gordo no suman un solo premio de ${M(2 * g.gross)}.`,
      `**Solo lo que pasa de ${ex}, al 20 %.** Un premio de hasta ${ex} por décimo no paga nada; uno mayor paga el 20 % de la diferencia. Cobras = premio − 20 % × (premio − ${ex}).`,
      "**Se retiene al cobrar.** Quien paga el premio (SELAE, o Loteries de Catalunya en La Grossa) descuenta el 20 % y lo ingresa en Hacienda con el modelo 230: tú recibes ya el neto.",
      "**Décimos o apuestas de menos de 0,50 €.** La parte exenta se reduce en proporción. No pasa con los décimos de 20 € ni con los billetes de La Grossa.",
    ],
    ca: [
      `**Per dècim.** Cada dècim premiat es calcula per separat i té els seus propis ${ex} exempts: dos dècims del Gordo no sumen un sol premi de ${M(2 * g.gross)}.`,
      `**Només el que passa de ${ex}, al 20 %.** Un premi de fins a ${ex} per dècim no paga res; un de més gran paga el 20 % de la diferència. Cobres = premi − 20 % × (premi − ${ex}).`,
      "**Es reté en cobrar.** Qui paga el premi (SELAE, o Loteries de Catalunya a La Grossa) descompta el 20 % i l'ingressa a Hisenda amb el model 230: tu ja reps el net.",
      "**Dècims o apostes de menys de 0,50 €.** La part exempta es redueix en proporció. No passa amb els dècims de 20 € ni amb els bitllets de La Grossa.",
    ],
    en: [
      `**Per décimo.** Each winning décimo is worked out on its own and has its own ${ex} tax-free: two El Gordo décimos are not one ${M(2 * g.gross)} prize.`,
      `**Only the part above ${ex}, at 20%.** A prize of up to ${ex} per décimo pays nothing; a bigger one pays 20% of the difference. You get = prize − 20% × (prize − ${ex}).`,
      "**Withheld when you collect.** Whoever pays the prize (SELAE, or Loteries de Catalunya for La Grossa) deducts the 20% and pays it to the tax office on form 230 (modelo 230): you receive the net amount.",
      "**Décimos or bets under €0.50.** The tax-free part shrinks in proportion. This never applies to €20 décimos or La Grossa tickets.",
    ],
  });

  const sharedText = L(locale, {
    es: [
      `Si un décimo es de varias personas (una participación de una peña, un décimo a medias con la familia), cada una tiene su parte del premio, su parte de los ${ex} exentos y su parte del 20 %. Con una participación de 5 € en un décimo de 20 € del Gordo tienes la cuarta parte: cobras ${M(s5.gross)}, tienes ${M(s5.exempt)} exentos, te retienen ${M(s5.withholding)} y te quedan ${M(s5.net)}. Si dos personas llevan a medias un décimo del segundo premio, cada una cobra ${M(half.gross)}, tiene ${M(half.exempt)} exentos, paga ${M(half.withholding)} y se queda ${M(half.net)}.`,
      "En la calculadora, escribe en «Lo que juegas de cada décimo» la cantidad que juegas según tu participación. Quien cobre el décimo para todos tiene que poder demostrar a Hacienda cómo lo ha repartido, con la identificación de cada ganador y su porcentaje:",
    ],
    ca: [
      `Si un dècim és de diverses persones (una participació d'una penya, un dècim a mitges amb la família), cadascuna té la seva part del premi, la seva part dels ${ex} exempts i la seva part del 20 %. Amb una participació de 5 € en un dècim de 20 € del Gordo en tens la quarta part: cobres ${M(s5.gross)}, en tens ${M(s5.exempt)} exempts, et retenen ${M(s5.withholding)} i et queden ${M(s5.net)}. Si dues persones porten a mitges un dècim del segon premi, cadascuna cobra ${M(half.gross)}, en té ${M(half.exempt)} exempts, paga ${M(half.withholding)} i es queda ${M(half.net)}.`,
      "A la calculadora, escriu a «El que jugues de cada dècim» la quantitat que jugues segons la teva participació. Qui cobri el dècim per a tothom ha de poder demostrar a Hisenda com l'ha repartit, amb la identificació de cada guanyador i el seu percentatge:",
    ],
    en: [
      `When a décimo belongs to several people (a share slip from a club, a décimo split with family), each one has their part of the prize, their part of the ${ex} tax-free and their part of the 20%. A €5 stake in a €20 El Gordo décimo is a quarter of it: you win ${M(s5.gross)}, ${M(s5.exempt)} is tax-free, ${M(s5.withholding)} is withheld and you keep ${M(s5.net)}. If two people share a second-prize décimo half and half, each wins ${M(half.gross)}, has ${M(half.exempt)} tax-free, pays ${M(half.withholding)} and keeps ${M(half.net)}.`,
      "In the calculator, type the amount your share slip says you play under «Your stake in each décimo». Whoever collects the décimo for everyone must be able to show the tax office how it was split, identifying each winner and their percentage:",
    ],
  });

  const rentaText = L(locale, {
    es: [
      "No. Los premios de estas loterías no se integran en la base imponible del IRPF, y si te han retenido el 20 % al cobrar no tienes que presentar ninguna otra autoliquidación por ellos. Tampoco hay que hacer nada con un premio de hasta 40.000 € por décimo.",
      "Solo si cobras un premio sujeto al gravamen sin que te lo hayan retenido (por ejemplo, de una lotería pública de otro Estado de la Unión Europea o del Espacio Económico Europeo, que la ley también incluye) tienes que presentar tú la autoliquidación, con el modelo 136. El modelo 230 no es tuyo: es el que presenta quien paga el premio con las retenciones.",
    ],
    ca: [
      "No. Els premis d'aquestes loteries no s'integren a la base imposable de l'IRPF, i si t'han retingut el 20 % en cobrar no has de presentar cap altra autoliquidació per aquests premis. Tampoc no s'ha de fer res amb un premi de fins a 40.000 € per dècim.",
      "Només si cobres un premi subjecte al gravamen sense que te l'hagin retingut (per exemple, d'una loteria pública d'un altre estat de la Unió Europea o de l'Espai Econòmic Europeu, que la llei també inclou) has de presentar tu l'autoliquidació, amb el model 136. El model 230 no és teu: és el que presenta qui paga el premi amb les retencions.",
    ],
    en: [
      "No. Prizes from these lotteries are not part of the income tax base, and once 20% has been withheld when you collect, there is no other return to file for them. Nor is there anything to do for a prize of up to €40,000 per décimo.",
      "Only if you collect a prize subject to the levy without any withholding (for example from a public lottery of another EU or EEA state, which the law also covers) do you file the return yourself, on form 136 (modelo 136). Form 230 is not yours: the payer files it with the withholdings.",
    ],
  });

  const nonResText = L(locale, {
    es: "El gravamen es el mismo para quien no reside en España: 40.000 € exentos por décimo y el 20 % del resto, retenido al cobrar, según la Agencia Tributaria (disposición adicional 5.ª de la Ley del Impuesto sobre la Renta de no Residentes). Si un convenio para evitar la doble imposición dice que el premio solo tributa en tu país, puedes pedir la devolución de la retención con el modelo 210:",
    ca: "El gravamen és el mateix per a qui no resideix a Espanya: 40.000 € exempts per dècim i el 20 % de la resta, retingut en cobrar, segons l'Agència Tributària (disposició addicional 5a de la Llei de l'impost sobre la renda de no residents). Si un conveni per evitar la doble imposició diu que el premi només tributa al teu país, pots demanar la devolució de la retenció amb el model 210:",
    en: "The levy is the same for people who do not live in Spain: €40,000 tax-free per décimo and 20% of the rest, withheld when paid, according to the Agencia Tributaria (additional provision 5 of the Non-Residents' Income Tax Act). If a double-taxation treaty says the prize is taxed only in your country, you can claim the withholding back on form 210 (modelo 210):",
  });

  const grossaText = L(locale, {
    es: [
      `La ley incluye las loterías de SELAE, las de los órganos o entidades de las comunidades autónomas, la ONCE y la Cruz Roja. La Grossa de Cap d'Any es de Loteries de Catalunya, la sociedad de lotería de la Generalitat: se sortea el ${dmy(DRAWS["grossa-2026"].date)}, el billete cuesta 10 € y el primer premio es de ${M(gr.gross)} por billete, que pagan ${M(gr.withholding)} y dejan ${M(gr.net)}. El segundo (${M(gr2.gross)}) deja ${M(gr2.net)} y el tercero (${M(gr3)}) no paga nada.`,
      "Los premios de otros juegos o concursos, que no organizan estas entidades, no pagan este gravamen: según la Agencia Tributaria son ganancias patrimoniales y van a la base general del IRPF, junto con el resto de tus ingresos.",
    ],
    ca: [
      `La llei inclou les loteries de SELAE, les dels òrgans o entitats de les comunitats autònomes, l'ONCE i la Creu Roja. La Grossa de Cap d'Any és de Loteries de Catalunya, la societat de loteria de la Generalitat: se sorteja el ${dmy(DRAWS["grossa-2026"].date)}, el bitllet costa 10 € i el primer premi és de ${M(gr.gross)} per bitllet, que paguen ${M(gr.withholding)} i en deixen ${M(gr.net)}. El segon (${M(gr2.gross)}) en deixa ${M(gr2.net)} i el tercer (${M(gr3)}) no paga res.`,
      "Els premis d'altres jocs o concursos, que no organitzen aquestes entitats, no paguen aquest gravamen: segons l'Agència Tributària són guanys patrimonials i van a la base general de l'IRPF, amb la resta dels teus ingressos.",
    ],
    en: [
      `The law covers SELAE's lotteries, those of the regions' public bodies or companies, ONCE and the Red Cross. La Grossa de Cap d'Any belongs to Loteries de Catalunya, the Catalan government's lottery company: it is drawn on ${dmy(DRAWS["grossa-2026"].date)}, a ticket costs €10 and the first prize is ${M(gr.gross)} per ticket, which pays ${M(gr.withholding)} and leaves ${M(gr.net)}. The second (${M(gr2.gross)}) leaves ${M(gr2.net)} and the third (${M(gr3)}) pays nothing.`,
      "Prizes from other games or contests, not run by these bodies, do not pay this levy: according to the Agencia Tributaria they are capital gains and go into the general income tax base, with the rest of your income.",
    ],
  });

  const links = L(locale, {
    es: { hub: "Dónde ha tocado el Gordo, cómo comprobar el décimo y dónde se cobra", guide: "Guía de la Lotería de Navidad 2026", grossa: "Guía de La Grossa de Cap d'Any 2026", aeat: "Agencia Tributaria: premios del sorteo de la lotería de Navidad" },
    ca: { hub: "On ha tocat la loteria de Nadal, com comprovar el dècim i on es cobra", guide: "Guia de la loteria de Nadal 2026", grossa: "Guia de La Grossa de Cap d'Any 2026", aeat: "Agència Tributària: premis del sorteig de la loteria de Nadal (en castellà)" },
    en: { hub: "Where El Gordo was sold, how to check your décimo and where to collect", guide: "Spanish Christmas Lottery 2026 guide", grossa: "La Grossa de Cap d'Any 2026 guide", aeat: "Agencia Tributaria: Christmas lottery prizes (in Spanish)" },
  });

  const limits = L(locale, {
    es: [
      "Premios en especie (un coche, un viaje): la base del gravamen se calcula de otra manera.",
      "Residentes en el País Vasco o Navarra: su IRPF lo regula la normativa foral; la calculadora aplica la ley estatal.",
      "Empresas y entidades: según la Agencia Tributaria incluyen el premio en el Impuesto sobre Sociedades y la retención del 20 % es un pago a cuenta.",
      "Premios de juegos o concursos que no organizan SELAE, las comunidades autónomas, la ONCE o la Cruz Roja.",
    ],
    ca: [
      "Premis en espècie (un cotxe, un viatge): la base del gravamen es calcula d'una altra manera.",
      "Residents al País Basc o Navarra: el seu IRPF el regula la normativa foral; la calculadora aplica la llei estatal.",
      "Empreses i entitats: segons l'Agència Tributària inclouen el premi a l'impost sobre societats i la retenció del 20 % és un pagament a compte.",
      "Premis de jocs o concursos que no organitzen SELAE, les comunitats autònomes, l'ONCE o la Creu Roja.",
    ],
    en: [
      "Prizes in kind (a car, a trip): the levy's base is worked out differently.",
      "Residents of the Basque Country or Navarre: their income tax is set by their own regional (foral) rules; the calculator applies the state law.",
      "Companies and other entities: according to the Agencia Tributaria they include the prize in corporate tax, and the 20% withheld is a payment on account.",
      "Prizes from games or contests not run by SELAE, the regions, ONCE or the Red Cross.",
    ],
  });

  const sourcesLead = L(locale, {
    es: `BOE, Agencia Tributaria y DOGC leídos ${on(RULES_AS_OF)}; las citas son literales, en castellano. SELAE (programa de premios de Navidad y página de la Lotería Nacional) leído ${on(SELAE_READ)}: su web no respondió cuando volvimos a consultarla, ${on(RULES_AS_OF)}.`,
    ca: `BOE, Agència Tributària i DOGC llegits ${on(RULES_AS_OF)}; les cites són literals, en castellà. SELAE (programa de premis de Nadal i pàgina de la Loteria Nacional) llegit ${on(SELAE_READ)}: el seu web no va respondre quan el vam tornar a consultar, ${on(RULES_AS_OF)}.`,
    en: `BOE, Agencia Tributaria and DOGC read ${on(RULES_AS_OF)}; quotes are verbatim, in Spanish. SELAE (Christmas prize programme and Lotería Nacional page) read ${on(SELAE_READ)}: its website did not answer when we checked again ${on(RULES_AS_OF)}.`,
  });

  const da = (n: string) => L(locale, { es: `Ley 35/2006 del IRPF, disposición adicional 33.ª, apartado ${n}`, ca: `Llei 35/2006 de l'IRPF, disposició addicional 33a, apartat ${n}`, en: `Law 35/2006 (IRPF), additional provision 33, section ${n}` });
  const aeatNotice = L(locale, { es: "Agencia Tributaria, «Premios del sorteo de la lotería de Navidad» (17/12/2024)", ca: "Agència Tributària, «Premios del sorteo de la lotería de Navidad» (17/12/2024)", en: "Agencia Tributaria, «Premios del sorteo de la lotería de Navidad» (17/12/2024)" });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(lotteryTaxPath(locale)),
    applicationCategory: "FinanceApplication",
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
  const md = (text: string) => {
    const parts = text.split(/\*\*/);
    return parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));
  };

  return (
    <>
      <SiteHeader locale={locale} translations={lotteryTaxEditions()} />
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
              <LotteryTaxCalculator locale={locale} initial={DEFAULT_PRESET} />
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} <A href={SOURCES.aeatNotice.url}>{links.aeat}</A>.
              </p>

              <h2 id="tabla">{hd.table}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{tableCaption}</caption>
                  <thead>
                    <tr>
                      {cols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prizeTable().map(({ preset, result }) => (
                      <tr key={preset.id}>
                        <th scope="row" className="font-normal">
                          {preset.draw === "navidad-2026" ? `${PRESET_LABEL[preset.id][locale]} · ${DRAW_SHORT[preset.draw][locale]}` : `${PRESET_LABEL[preset.id][locale]} ${DRAWS[preset.draw].date.slice(0, 4)}`}
                        </th>
                        <BreakdownCells b={result.total} locale={locale} cols={cols} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">{ninoNote}</p>

              <h2 id="como-se-calcula">{hd.how}</h2>
              <ul>
                {howItems.map((item) => (
                  <li key={item}>{md(item)}</li>
                ))}
              </ul>
              <Quote text={QUOTE.perTicket} href={SOURCES.lirpf.url} label={da("1")} />
              <Quote text={QUOTE.exempt} href={SOURCES.lirpf.url} label={da("2")} />
              <Quote text={QUOTE.rate} href={SOURCES.lirpf.url} label={da("6")} />
              <Quote text={QUOTE.minStake} href={SOURCES.lirpf.url} label={da("2")} />
              <Quote text={QUOTE.payer} href={SOURCES.aeatNotice.url} label={aeatNotice} />
              <Quote text={QUOTE.example} href={SOURCES.aeatNotice.url} label={aeatNotice} />

              <h2 id="compartidos">{hd.shared}</h2>
              <p>{sharedText[0]}</p>
              <Quote text={QUOTE.shared} href={SOURCES.lirpf.url} label={da("2")} />
              <p>{sharedText[1]}</p>
              <Quote text={QUOTE.aeatShared} href={SOURCES.aeatNotice.url} label={aeatNotice} />

              <h2 id="ejemplos">{hd.examples}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {cols.map((c, i) => (
                        <th key={c} scope="col">
                          {i === 0 ? L(locale, { es: "Caso", ca: "Cas", en: "Case" }) : c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {examples().map(({ id, result }) => (
                      <tr key={id}>
                        <th scope="row" className="font-normal">
                          {EXAMPLE_LABEL[id][locale]}
                        </th>
                        <BreakdownCells b={result.total} locale={locale} cols={cols} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                {L(locale, {
                  es: `Dos décimos del Gordo: cada uno con sus ${ex} exentos, ${M(two.net)} en total.`,
                  ca: `Dos dècims del Gordo: cadascun amb els seus ${ex} exempts, ${M(two.net)} en total.`,
                  en: `Two El Gordo décimos: each with its own ${ex} tax-free, ${M(two.net)} in all.`,
                })}
              </p>

              <h2 id="renta">{hd.renta}</h2>
              <p>{rentaText[0]}</p>
              <Quote text={QUOTE.notInBase} href={SOURCES.lirpf.url} label={da("8")} />
              <Quote text={QUOTE.noOtherReturn} href={SOURCES.aeatNotice.url} label={aeatNotice} />
              <p>
                {rentaText[1]} <A href={SOURCES.aeat136.url}>{L(locale, { es: "Modelo 136", ca: "Model 136", en: "Form 136" })}</A> ·{" "}
                <A href={SOURCES.aeat230.url}>{L(locale, { es: "Modelo 230", ca: "Model 230", en: "Form 230" })}</A>.
              </p>
              <Quote text={QUOTE.noReturn} href={SOURCES.lirpf.url} label={da("7")} />

              <h2 id="no-residentes">{hd.nonRes}</h2>
              <p>{nonResText}</p>
              <Quote text={QUOTE.treatyRefund} href={SOURCES.aeatNonResidents.url} label={`${SOURCES.aeatNonResidents.publisher}, «${SOURCES.aeatNonResidents.name}»`} />

              <h2 id="la-grossa">{hd.grossa}</h2>
              <p>{grossaText[0]}</p>
              <Quote text={QUOTE.scope} href={SOURCES.lirpf.url} label={da("1.a")} />
              <p>{grossaText[1]}</p>

              <ul>
                <li>
                  <Link href={gordoHub}>{links.hub}</Link>
                </li>
                <li>
                  <Link href={guide}>{links.guide}</Link>
                </li>
                <li>
                  <Link href={grossaGuide}>{links.grossa}</Link>
                </li>
              </ul>

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
                    <A href={src.url}>{src.name}</A> ({src.publisher}, {src.ref}; {L(locale, { es: "leído", ca: "llegit", en: "read" })} {on(src.read)})
                  </li>
                ))}
              </ul>

              <h2 id="limites">{hd.limits}</h2>
              <ul>
                {limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <MoreCalculators current="lottery-tax" locale={locale} />
            </div>
            <ShareBar locale={locale} path={lotteryTaxPath(locale)} title={meta.h1} contentType="lottery_tax_calculator" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
