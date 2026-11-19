import { elDay, fromDay, money, percent } from "@/lib/programmatic/inheritance-tax/copy";

import { extremes, listNames } from "./copy";
import { EXAMPLE } from "./engine";
import { RULES_UNTIL, STATE_GROUP_III, STATE_COEFFICIENT_III } from "./state";
import { TERRITORIES, exampleRows, territory } from "./territories";
import type { CmpLocale } from "./types";

/** The comparison's questions, every figure from the data and the engine (also the FAQPage JSON-LD). */
export function cmpFaq(locale: CmpLocale): { q: string; a: string }[] {
  const M = (n: number) => money(n, locale);
  const P = (n: number) => percent(n, locale);
  const x = extremes();
  const names = (ids: readonly string[]) => listNames(ids.map((id) => TERRITORIES.find((t) => t.id === id)!.name[locale]), locale);
  const rows = exampleRows();
  const pay = (id: string) => rows.find((r) => r.territory.id === id)!.result!;
  const cat = pay("cataluna");
  const mad = pay("madrid");
  const pending = rows.filter((r) => !r.result).map((r) => r.territory.id);
  const pendingCells = TERRITORIES.reduce((n, t) => n + [t.inheritance.groupII, t.inheritance.bonus, t.inheritance.home, t.inheritance.groupIII, t.gift.benefit, t.gift.formal].filter((c) => c.pending).length, 0);
  const lowNames = listNames(x.low.map((t) => t.name[locale]), locale);
  const highNames = listNames(x.high.map((t) => t.name[locale]), locale);
  const andalucia = territory("andalucia").name[locale];

  const q = {
    ca: [
      {
        q: "On es paga menys impost de successions?",
        a: `Depèn del cas. En l'exemple d'aquesta pàgina (un fill de ${EXAMPLE.age} anys que hereta ${M(EXAMPLE.share)}, ${M(EXAMPLE.home)} d'habitatge) es paguen ${M(x.lowPay)} a ${lowNames} i ${M(x.highPay)} a ${highNames}; es calcula ${x.computed === x.total ? `als ${x.total} territoris` : `a ${x.computed} dels ${x.total} territoris`}${pending.length ? ` (a ${names(pending)} falta alguna norma per llegir amb seguretat)` : ""}. Amb una herència més gran, un parent més llunyà o més patrimoni previ, l'ordre canvia: mira la fila del teu territori.`,
      },
      {
        q: "Quina comunitat cobra l'impost d'una herència?",
        a: "La comunitat on la persona morta va viure més dies dels cinc anys anteriors a la mort, comptats de data a data (Llei 22/2009, arts. 28 i 32), amb les seves reduccions, tarifa i bonificacions. No importa on viuen els hereus ni on són els béns. A Ceuta i Melilla s'aplica la llei estatal amb la seva bonificació; al País Basc i Navarra, la seva norma foral.",
      },
      {
        q: "Per què un fill paga més a Catalunya que a Madrid o Andalusia?",
        a: `Perquè a Catalunya la bonificació dels fills no és fixa: és una mitjana per trams de base imposable que baixa quan l'herència és més gran (el ${P(cat.bonusPct)} amb ${M(EXAMPLE.share)}). Madrid bonifica el 99 % de la quota (en l'exemple, ${M(mad.toPay)}) i ${andalucia} resta 1.000.000 € de la base abans de bonificar el 99 %. Catalunya, en canvi, resta més que Madrid per parentiu (100.000 € contra 16.000 €) i per l'habitatge (sense el límit de 123.000 € per hereu).`,
      },
      {
        q: "Paguen successions els germans?",
        a: `Sí, i bastant més que els fills: a gairebé tots els territoris tenen una reducció petita (l'estatal és de ${M(STATE_GROUP_III)}) i la quota es multiplica per ${String(STATE_COEFFICIENT_III).replace(".", ",")} o un coeficient semblant. Algunes comunitats hi afegeixen una bonificació: mira la columna «Germans».`,
      },
      {
        q: "Què cal per a la bonificació d'una donació de pares a fills?",
        a: "Sovint, una forma concreta: escriptura o document públic (a vegades només per sobre d'un import), atorgat dins d'un termini, i, si són diners, que el document digui d'on surten i com es lliuren. Si no es compleix, es perd la bonificació. Cada fila de la taula de donacions diu el requisit del territori, amb l'article.",
      },
      {
        q: "Quan canvien aquestes normes?",
        a: `La majoria de comunitats canvien l'impost en les lleis de pressupostos o de mesures fiscals, que solen aplicar-se des de l'1 de gener. Aquesta pàgina es revisa ${fromDay(RULES_UNTIL, "ca")}. Ja publicat: la Comunitat Valenciana puja al 50 % la bonificació de germans, nebots i oncles de sang per a morts des de l'1 de juny de 2027.`,
      },
      {
        q: "Què vol dir «pendent de verificar»?",
        a: `Que aquella norma no s'ha pogut llegir amb seguretat el dia de la revisió (${elDay(TERRITORIES[0]!.sources[TERRITORIES[0]!.mainSource]!.read, "ca")}) i, per no inventar res, no s'hi posa cap xifra. ${pendingCells > 0 ? `Ara n'hi ha ${pendingCells}.` : "Ara no n'hi ha cap."} Consulta l'administració del territori, enllaçada a «El text de cada norma».`,
      },
    ],
    es: [
      {
        q: "¿Dónde se paga menos impuesto de sucesiones?",
        a: `Depende del caso. En el ejemplo de esta página (un hijo de ${EXAMPLE.age} años que hereda ${M(EXAMPLE.share)}, ${M(EXAMPLE.home)} de vivienda) se pagan ${M(x.lowPay)} en ${lowNames} y ${M(x.highPay)} en ${highNames}; se calcula ${x.computed === x.total ? `en los ${x.total} territorios` : `en ${x.computed} de los ${x.total} territorios`}${pending.length ? ` (en ${names(pending)} falta alguna norma por leer con seguridad)` : ""}. Con una herencia mayor, un pariente más lejano o más patrimonio previo, el orden cambia: mira la fila de tu territorio.`,
      },
      {
        q: "¿Qué comunidad cobra el impuesto de una herencia?",
        a: "La comunidad donde la persona fallecida vivió más días de los cinco años anteriores al fallecimiento, contados de fecha a fecha (Ley 22/2009, arts. 28 y 32), con sus reducciones, tarifa y bonificaciones. No importa dónde viven los herederos ni dónde están los bienes. En Ceuta y Melilla se aplica la ley estatal con su bonificación; en el País Vasco y Navarra, su norma foral.",
      },
      {
        q: "¿Por qué un hijo paga más en Cataluña que en Madrid o Andalucía?",
        a: `Porque en Cataluña la bonificación de los hijos no es fija: es una media por tramos de base imponible que baja cuando la herencia es mayor (el ${P(cat.bonusPct)} con ${M(EXAMPLE.share)}). Madrid bonifica el 99 % de la cuota (en el ejemplo, ${M(mad.toPay)}) y ${andalucia} resta 1.000.000 € de la base antes de bonificar el 99 %. Cataluña, en cambio, resta más que Madrid por parentesco (100.000 € frente a 16.000 €) y por la vivienda (sin el límite de 123.000 € por heredero).`,
      },
      {
        q: "¿Pagan sucesiones los hermanos?",
        a: `Sí, y bastante más que los hijos: en casi todos los territorios tienen una reducción pequeña (la estatal es de ${M(STATE_GROUP_III)}) y la cuota se multiplica por ${String(STATE_COEFFICIENT_III).replace(".", ",")} o un coeficiente parecido. Algunas comunidades añaden una bonificación: mira la columna «Hermanos».`,
      },
      {
        q: "¿Qué hace falta para la bonificación de una donación de padres a hijos?",
        a: "A menudo, una forma concreta: escritura o documento público (a veces solo por encima de un importe), otorgado en un plazo, y, si es dinero, que el documento diga de dónde sale y cómo se entrega. Si no se cumple, se pierde la bonificación. Cada fila de la tabla de donaciones dice el requisito del territorio, con su artículo.",
      },
      {
        q: "¿Cuándo cambian estas normas?",
        a: `La mayoría de comunidades cambian el impuesto en sus leyes de presupuestos o de medidas fiscales, que suelen aplicarse desde el 1 de enero. Esta página se revisa ${fromDay(RULES_UNTIL, "es")}. Ya publicado: la Comunidad Valenciana sube al 50 % la bonificación de hermanos, sobrinos y tíos de sangre para fallecimientos desde el 1 de junio de 2027.`,
      },
      {
        q: "¿Qué significa «pendiente de verificar»?",
        a: `Que esa norma no se ha podido leer con seguridad el día de la revisión (${elDay(TERRITORIES[0]!.sources[TERRITORIES[0]!.mainSource]!.read, "es")}) y, para no inventar nada, no se pone ninguna cifra. ${pendingCells > 0 ? `Ahora hay ${pendingCells}.` : "Ahora no hay ninguna."} Consulta la administración del territorio, enlazada en «El texto de cada norma».`,
      },
    ],
    en: [
      {
        q: "Where in Spain is inheritance tax lowest?",
        a: `It depends on the case. In this page's example (a ${EXAMPLE.age}-year-old child inheriting ${M(EXAMPLE.share)}, ${M(EXAMPLE.home)} of it the home) the tax is ${M(x.lowPay)} in ${lowNames} and ${M(x.highPay)} in ${highNames}; it is worked out ${x.computed === x.total ? `in all ${x.total} territories` : `in ${x.computed} of the ${x.total} territories`}${pending.length ? ` (in ${names(pending)} some rule could not be read with confidence)` : ""}. With a larger estate, a more distant relative or more prior wealth the order changes: look at your territory's row.`,
      },
      {
        q: "Which region taxes an inheritance?",
        a: "The region where the deceased lived the most days of the five years before the death, counted date to date (Law 22/2009, arts. 28 and 32), with its reductions, scale and rebates. Where the heirs live or the assets are does not matter. In Ceuta and Melilla the state law applies with its rebate; in the Basque Country and Navarre, their foral law.",
      },
      {
        q: "Why does a child pay more in Catalonia than in Madrid or Andalusia?",
        a: `Because Catalonia's rebate for children is not fixed: it is an average by slices of the taxable base that falls as the estate grows (${P(cat.bonusPct)} on ${M(EXAMPLE.share)}). Madrid takes 99% off the tax (${M(mad.toPay)} in the example) and ${andalucia} deducts €1,000,000 from the base before a 99% rebate. Catalonia, on the other hand, deducts more than Madrid for kinship (€100,000 against €16,000) and for the home (no €123,000 cap per heir).`,
      },
      {
        q: "Do siblings pay inheritance tax?",
        a: `Yes, and much more than children: almost everywhere they get a small reduction (the state one is ${M(STATE_GROUP_III)}) and the tax is multiplied by ${STATE_COEFFICIENT_III} or a similar coefficient. Some regions add a rebate: see the "Siblings" column.`,
      },
      {
        q: "What does a gift from parents to a child need to get the rebate?",
        a: "Often a specific form: a public deed or document (sometimes only above an amount), signed within a deadline, and, for cash, the document stating where the money comes from and how it is handed over. Miss it and the rebate is lost. Each row of the gifts table gives the territory's requirement, with the article.",
      },
      {
        q: "When do these rules change?",
        a: `Most regions change the tax in their budget or fiscal-measures laws, which usually apply from 1 January. This page is due for a fresh check ${fromDay(RULES_UNTIL, "en")}. Already published: the Valencia region raises the rebate for blood siblings, nephews, nieces, uncles and aunts to 50% for deaths from 1 June 2027.`,
      },
      {
        q: 'What does "pending verification" mean?',
        a: `That the rule could not be read with confidence on the day of the check (${elDay(TERRITORIES[0]!.sources[TERRITORIES[0]!.mainSource]!.read, "en")}), so, rather than guess, no figure is given. ${pendingCells > 0 ? `There are ${pendingCells} now.` : "There are none now."} Ask the territory's tax office, linked under "The text of each law".`,
      },
    ],
  }[locale];
  return q;
}
