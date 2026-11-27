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
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { COMMUNITY_LABEL, GRAN_LABEL, displayName, ztEditions, ztPath, type ZtLocale } from "@/lib/programmatic/zona-tensionada/copy";
import { DATA, ZT_DATA_PATH, boeUrl, checkerContext, checkerTown, granTable, latestList, listByCommunity, type ListGroup } from "@/lib/programmatic/zona-tensionada/data";
import { headline, ztFaq, ztMeta } from "@/lib/programmatic/zona-tensionada/page";
import { ANCHOR, QUOTE, RULES_AS_OF, SOURCES, UPDATE_RULE } from "@/lib/programmatic/zona-tensionada/rules";
import { absoluteUrl } from "@/lib/site";
import { ORGANIZATION_ID, breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { ZonaTensionadaChecker } from "./ZonaTensionadaChecker";

/**
 * "¿Está mi municipio en zona tensionada?" / "El meu municipi és zona
 * tensionada?" / "Is my town a zona tensionada?": the checker (every Catalan
 * town and every declared town elsewhere, server-rendered on Barcelona), what
 * changes for a tenant (LAU arts. 10.3, 17.6, 17.7, 17.9; Ley 12/2023 art.
 * 31.3), the large-landlord threshold of each declaration (the "5 or 10"
 * question), how long a zone lasts and Catalonia's 2026 extension, the full
 * list by region and declaration, how a zone is declared, the reference index
 * (we link the Ministry's lookup, we do not copy it), questions, sources and
 * limits. One page: no page per town. Static: it ships with the deploy.
 */

const L = <T,>(locale: ZtLocale, v: Record<ZtLocale, T>): T => v[locale];
/** The checker's first answer, in the HTML. */
export const INITIAL_TOWN = "08019";

export function ztCrumbs(locale: ZtLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: ztMeta(locale).breadcrumb, href: ztPath(locale) }];
}

export function ztMetadata(locale: ZtLocale): Metadata {
  const m = ztMeta(locale);
  return buildMetadata({ locale, path: ztPath(locale), title: m.title, description: m.description, translations: ztEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ text, href, label, lang = "es" }: { text: string; href: string; label: string; lang?: string }) {
  return (
    <blockquote lang={lang}>
      <p>«{text}»</p>
      <footer className="text-sm">
        <A href={href}>{label}</A>
      </footer>
    </blockquote>
  );
}

function groupTitle(g: ListGroup, locale: ZtLocale): string {
  const n = g.towns.length;
  const d = (iso: string) => dayMonthYear(iso, locale);
  const act = g.decl.act.split(",")[0]!;
  if (!g.decl.boe)
    return L(locale, {
      es: `${n} municipios declarados por la Generalitat el ${d(DATA.pending.date)} (${act}); pendientes de la lista del BOE`,
      ca: `${n} municipis declarats per la Generalitat el ${d(DATA.pending.date)} (${act}); pendents de la llista del BOE`,
      en: `${n} towns declared by the Generalitat on ${d(DATA.pending.date)} (${act}); awaiting the BOE list`,
    });
  const span = L(locale, { es: `desde el ${d(g.decl.from!)} hasta el ${d(g.decl.until!)}`, ca: `del ${d(g.decl.from!)} al ${d(g.decl.until!)}`, en: `from ${d(g.decl.from!)} to ${d(g.decl.until!)}` });
  if (g.part === "extended")
    return L(locale, {
      es: `${n} municipios ${span}, prorrogados por la Generalitat (${DATA.extension.number}); nueva fecha final pendiente del BOE`,
      ca: `${n} municipis ${span}, prorrogats per la Generalitat (${DATA.extension.number}); nova data final pendent del BOE`,
      en: `${n} towns ${span}, extended by the Generalitat (${DATA.extension.number}); new end date awaiting the BOE`,
    });
  if (g.part === "not-extended")
    return L(locale, {
      es: `${n} municipios ${span}, no prorrogados (${DATA.extension.number}): dejan de ser zona tensionada`,
      ca: `${n} municipis ${span}, no prorrogats (${DATA.extension.number}): deixen de ser zona tensionada`,
      en: `${n} towns ${span}, not extended (${DATA.extension.number}): they stop being declared`,
    });
  const one = n === 1 && !g.towns[0]!.area ? displayName(g.towns[0]!.name) : null;
  return one
    ? `${one}: ${span}`
    : L(locale, { es: `${n === 1 ? "1 zona" : `${n} zonas`} ${span}`, ca: `${n === 1 ? "1 zona" : `${n} zones`} ${span}`, en: `${n === 1 ? "1 area" : `${n} areas`} ${span}` });
}

export function ZonaTensionadaRoute({ locale }: { locale: ZtLocale }) {
  const meta = ztMeta(locale);
  const crumbs = ztCrumbs(locale);
  const h = headline();
  const ctx = checkerContext();
  const faq = ztFaq(locale);
  const d = (iso: string) => dayMonthYear(iso, locale);
  const latest = latestList();
  const c = h.c;

  const lead = L(locale, {
    es: `Una zona de mercado residencial tensionado («zona tensionada») es un municipio o un barrio que su comunidad autónoma declara por tres años, prorrogables, según la Ley 12/2023 por el derecho a la vivienda. A ${d(RULES_AS_OF)}, las listas del Ministerio de Vivienda en el BOE recogen ${h.listed}: ${c.catalonia.listed} municipios de Cataluña, ${c["basque-country"].listed} del País Vasco, ${c.navarre.listed} de Navarra, ${c.galicia.listed} de Galicia y ${c.asturias.listed} zonas de Asturias. Allí, la renta de un contrato nuevo no puede superar la del anterior, y la de un gran tenedor tampoco el índice de referencia. La Generalitat declaró otros ${h.catPending} municipios el ${d(DATA.pending.date)}, que aún esperan el BOE.`,
    ca: `Una zona de mercat residencial tensionat («zona tensionada») és un municipi o un barri que la comunitat autònoma declara per tres anys, prorrogables, segons la Llei 12/2023 pel dret a l'habitatge. El ${d(RULES_AS_OF)}, les llistes del Ministeri d'Habitatge al BOE en recullen ${h.listed}: ${c.catalonia.listed} municipis de Catalunya, ${c["basque-country"].listed} del País Basc, ${c.navarre.listed} de Navarra, ${c.galicia.listed} de Galícia i ${c.asturias.listed} zones d'Astúries. Allà, la renda d'un contracte nou no pot superar la de l'anterior, i la d'un gran tenidor tampoc l'índex de referència. La Generalitat en va declarar ${h.catPending} més el ${d(DATA.pending.date)}, que encara esperen el BOE.`,
    en: `A “zona de mercado residencial tensionado” (zona tensionada, a tight housing market area) is a town or neighbourhood that its region declares for three years, extendable, under Ley 12/2023, Spain's housing act. On ${d(RULES_AS_OF)} the Ministry of Housing's lists in the BOE hold ${h.listed}: ${c.catalonia.listed} towns in Catalonia, ${c["basque-country"].listed} in the Basque Country, ${c.navarre.listed} in Navarre, ${c.galicia.listed} in Galicia and ${c.asturias.listed} areas in Asturias. There, a new lease cannot exceed the previous rent, and a large landlord's cannot exceed the reference index either. The Generalitat declared ${h.catPending} more towns on ${d(DATA.pending.date)}, still awaiting the BOE.`,
  });
  const fresh = L(locale, {
    es: `Datos revisados el ${d(RULES_AS_OF)}: las ${DATA.boeIds.length} listas trimestrales del Ministerio en el BOE (la última, ${latest.boe}, del ${d(latest.published)}), la página de zonas del Ministerio y el DOGC del ${d(DATA.extension.published)}; normas en los textos consolidados del BOE.`,
    ca: `Dades revisades el ${d(RULES_AS_OF)}: les ${DATA.boeIds.length} llistes trimestrals del Ministeri al BOE (l'última, ${latest.boe}, del ${d(latest.published)}), la pàgina de zones del Ministeri i el DOGC del ${d(DATA.extension.published)}; normes als textos consolidats del BOE.`,
    en: `Data checked on ${d(RULES_AS_OF)}: the Ministry's ${DATA.boeIds.length} quarterly lists in the BOE (the latest, ${latest.boe}, of ${d(latest.published)}), the Ministry's page of zones and the DOGC of ${d(DATA.extension.published)}; rules from the BOE's consolidated texts.`,
  });
  const disclaimer = L(locale, {
    es: "Información orientativa con las normas estatales y las listas oficiales; no es asesoramiento legal. Un contrato concreto puede depender de su fecha, de la vivienda y de quién es el propietario. Ante un conflicto, consulta la oficina de vivienda de tu ayuntamiento o comunidad, o un abogado. El índice de referencia se consulta en la aplicación del Ministerio.",
    ca: "Informació orientativa amb les normes estatals i les llistes oficials; no és assessorament legal. Un contracte concret pot dependre de la data, de l'habitatge i de qui n'és el propietari. Si hi ha un conflicte, consulta l'oficina d'habitatge del teu ajuntament o de la Generalitat, o un advocat. L'índex de referència es consulta a l'aplicació del Ministeri.",
    en: "Guidance based on national rules and the official lists; not legal advice. A given lease may depend on its date, the home and who owns it. In a dispute, ask your town's or region's housing office, or a lawyer. The reference index is looked up in the Ministry's app.",
  });

  const hd = L(locale, {
    es: { changes: "Qué cambia en una zona tensionada", gran: "Gran tenedor: ¿5 o 10 viviendas?", validity: "Cuánto dura una zona tensionada y qué pasa en 2027", list: "Lista de zonas tensionadas por comunidad", how: "Cómo se declara una zona tensionada", index: "El índice de referencia del alquiler (SERPAVI)", faq: "Preguntas frecuentes", sources: "Fuentes oficiales", limits: "Qué no hace este buscador" },
    ca: { changes: "Què canvia en una zona tensionada", gran: "Gran tenidor: 5 o 10 habitatges?", validity: "Quant dura una zona tensionada i què passa el 2027", list: "Llista de zones tensionades per comunitat", how: "Com es declara una zona tensionada", index: "L'índex de referència del lloguer (SERPAVI)", faq: "Preguntes freqüents", sources: "Fonts oficials", limits: "Què no fa aquest cercador" },
    en: { changes: "What changes in a zona tensionada", gran: "Large landlord (gran tenedor): 5 or 10 homes?", validity: "How long a zone lasts, and what happens in 2027", list: "List of zonas tensionadas by region", how: "How a zone is declared", index: "The rent reference index (SERPAVI)", faq: "Questions", sources: "Official sources", limits: "What this checker does not do" },
  });

  const lau = (art: string) => L(locale, { es: `Ley de Arrendamientos Urbanos, ${art} (BOE)`, ca: `Llei d'arrendaments urbans, ${art} (BOE, en castellà)`, en: `Urban Leases Act (LAU), ${art} (BOE, in Spanish)` });
  const ley12 = (art: string) => L(locale, { es: `Ley 12/2023, ${art} (BOE)`, ca: `Llei 12/2023, ${art} (BOE, en castellà)`, en: `Ley 12/2023, ${art} (BOE, in Spanish)` });
  const gencat = L(locale, { es: "Generalitat de Catalunya, preguntas frecuentes (en catalán)", ca: "Generalitat de Catalunya, preguntes freqüents", en: "Generalitat de Catalunya, FAQ (in Catalan)" });
  const dogc = L(locale, { es: `${DATA.extension.number}, DOGC (en catalán)`, ca: `${DATA.extension.number}, DOGC`, en: `${DATA.extension.number}, DOGC (in Catalan)` });

  const changesText = L(locale, {
    es: [
      "Las limitaciones valen para los contratos de vivienda que se firman mientras la zona está en vigor. La primera es para cualquier propietario: la renta inicial del contrato nuevo tiene un tope.",
      "Y el contrato nuevo no puede añadir cargos que no estaban:",
      "La única subida extra posible, de hasta el 10 %, es por obras de rehabilitación, de ahorro de energía de al menos un 30 % o de accesibilidad acabadas en los dos años anteriores, o por un contrato (o un derecho de prórroga) de 10 años o más:",
      "Si el propietario es gran tenedor (ver la siguiente sección), hay un segundo tope, el índice de referencia del Ministerio:",
      "El mismo tope vale para una vivienda que no se ha alquilado en los últimos cinco años si la lista del Ministerio lo recoge; todas las declaraciones de hoy lo recogen:",
      "Y ese tope es el valor más alto del rango que da la aplicación oficial:",
      "Si se alquila por habitaciones, la suma de las rentas respeta los mismos límites:",
      "Al acabar la prórroga obligatoria (5 años, o 7 si el casero es una persona jurídica, como una empresa) o la tácita, puedes pedir una prórroga extraordinaria:",
      "Además, el propietario o la inmobiliaria tienen que informarte antes de firmar:",
      `La subida anual de un contrato ya firmado es otra regla y vale en toda España, sea o no zona tensionada. Del ${d(UPDATE_RULE.from)} al ${d(UPDATE_RULE.until)} (Real Decreto-ley 29/2026, disposición final sexta), si la renta supera el índice de referencia no sube, y si no, sin un nuevo pacto, sube como mucho un 2 %:`,
    ],
    ca: [
      "Les limitacions valen per als contractes d'habitatge que se signen mentre la zona és vigent. La primera és per a qualsevol propietari: la renda inicial del contracte nou té un límit (text oficial en castellà).",
      "I el contracte nou no pot afegir càrrecs que no hi eren:",
      "L'única pujada extra possible, de fins al 10 %, és per obres de rehabilitació, d'estalvi d'energia d'almenys un 30 % o d'accessibilitat acabades els dos anys anteriors, o per un contracte (o un dret de pròrroga) de 10 anys o més:",
      "Si el propietari és gran tenidor (vegeu la secció següent), hi ha un segon límit, l'índex de referència del Ministeri:",
      "El mateix límit val per a un habitatge que no s'ha llogat els últims cinc anys si la llista del Ministeri ho recull; totes les declaracions d'avui ho recullen:",
      "I aquest límit és el valor més alt de l'interval que dona l'aplicació oficial:",
      "Si es lloga per habitacions, la suma de les rendes respecta els mateixos límits:",
      "Quan acaba la pròrroga obligatòria (5 anys, o 7 si el propietari és una persona jurídica, com una empresa) o la tàcita, pots demanar una pròrroga extraordinària:",
      "A més, el propietari o la immobiliària t'han d'informar abans de signar:",
      `L'actualització anual d'un contracte ja signat és una altra regla i val a tot Espanya, sigui o no zona tensionada. Del ${d(UPDATE_RULE.from)} al ${d(UPDATE_RULE.until)} (Reial decret llei 29/2026, disposició final sisena), si la renda supera l'índex de referència no puja, i si no, sense un nou pacte, puja com a molt un 2 %:`,
    ],
    en: [
      "The limits apply to housing leases signed while the zone is in force. The first applies to any landlord: the starting rent of a new lease is capped (official text in Spanish).",
      "And the new lease cannot add charges that were not there before:",
      "The only extra increase, up to 10%, is for refurbishment, energy-saving works of at least 30% or accessibility works finished in the previous two years, or for a lease (or an extension right) of 10 years or more:",
      "If the landlord is a large landlord (next section), there is a second cap, the Ministry's reference index:",
      "The same cap applies to a home not let in the last five years when the Ministry's list says so; every declaration today does:",
      "And that cap is the top of the range the official app gives:",
      "If the home is let by rooms, the rents together keep the same limits:",
      "When the mandatory extension (5 years, or 7 if the landlord is a legal entity such as a company) or the tacit one ends, you can ask for an extraordinary extension:",
      "The landlord or the agency must also tell you, before you sign:",
      `The yearly update of a lease already signed is a separate rule that applies all over Spain, tight-market area or not. From ${d(UPDATE_RULE.from)} to ${d(UPDATE_RULE.until)} (Royal Decree-law 29/2026, sixth final provision), if the rent is above the reference index it does not go up, and otherwise, without a new agreement, it goes up by at most 2%:`,
    ],
  });

  const granText = L(locale, {
    es: [
      "Las dos cifras que circulan son correctas, cada una en su sitio. La ley fija una regla general para toda España y deja que cada declaración la baje hasta 5 viviendas:",
      "Desde el 8 de octubre de 2026 (Real Decreto-ley 29/2026), la condición se prueba con el Registro de la Propiedad y cada vivienda de un edificio cuenta aunque no haya división horizontal:",
      "Esto dice cada declaración, según las listas del BOE (la regla general vale siempre además):",
    ],
    ca: [
      "Les dues xifres que circulen són correctes, cadascuna al seu lloc. La llei fixa una regla general per a tot Espanya i deixa que cada declaració la baixi fins a 5 habitatges:",
      "Des del 8 d'octubre de 2026 (Reial decret llei 29/2026), la condició es prova amb el Registre de la Propietat i cada habitatge d'un edifici compta encara que no hi hagi divisió horitzontal:",
      "Això diu cada declaració, segons les llistes del BOE (la regla general val sempre a més):",
    ],
    en: [
      "Both figures you see quoted are right, each in its place. The law sets a general rule for all of Spain and lets each declaration lower it to 5 homes:",
      "Since 8 October 2026 (Royal Decree-law 29/2026), the status is proven with the Land Registry and each home in a building counts even without a horizontal division:",
      "This is what each declaration says, according to the BOE lists (the general rule always applies as well):",
    ],
  });
  const granCols = L(locale, { es: ["Comunidad", "Municipios o zonas", "Gran tenedor", "Texto de la lista del BOE"], ca: ["Comunitat", "Municipis o zones", "Gran tenidor", "Text de la llista del BOE"], en: ["Region", "Towns or areas", "Large landlord", "Wording of the BOE list"] });

  const validityText = L(locale, {
    es: [
      "La ley fija la duración y obliga al Ministerio a publicar cada trimestre la lista de zonas declaradas; las medidas se aplican desde esa lista:",
      "Cada lista dice lo mismo de su vigencia; por eso las fechas son el día siguiente a la publicación en el BOE y tres años después, como las escribe el Ministerio en su página de zonas:",
      `Cataluña es el primer caso que llega al final. El ${d(DATA.extension.date)} la Generalitat prorrogó ${h.extended} de los 140 municipios de la primera zona y dejó fuera ${h.notExtended}, que dejan de ser zona tensionada el ${d(h.firstUntil)}:`,
      `La nueva fecha final de los ${h.extended} la dará la lista del Ministerio en el BOE, que a ${d(RULES_AS_OF)} no se ha publicado. Lo mismo vale para los ${h.catPending} municipios nuevos: la Generalitat recuerda que el municipio tiene que constar en la declaración publicada en el BOE, y en 2024 la segunda zona se aplicó desde el día siguiente al BOE, no desde el DOGC:`,
    ],
    ca: [
      "La llei fixa la durada i obliga el Ministeri a publicar cada trimestre la llista de zones declarades; les mesures s'apliquen des d'aquesta llista:",
      "Cada llista diu el mateix de la vigència; per això les dates són l'endemà de la publicació al BOE i tres anys després, com les escriu el Ministeri a la seva pàgina de zones:",
      `Catalunya és el primer cas que arriba al final. El ${d(DATA.extension.date)} la Generalitat va prorrogar ${h.extended} dels 140 municipis de la primera zona i en va deixar fora ${h.notExtended}, que deixen de ser zona tensionada el ${d(h.firstUntil)}:`,
      `La nova data final dels ${h.extended} la donarà la llista del Ministeri al BOE, que el ${d(RULES_AS_OF)} encara no s'ha publicat. El mateix val per als ${h.catPending} municipis nous: la Generalitat recorda que el municipi ha de constar a la declaració publicada al BOE, i el 2024 la segona zona es va aplicar des de l'endemà del BOE, no des del DOGC:`,
    ],
    en: [
      "The law sets the length and makes the Ministry publish each quarter the list of declared zones; the measures apply from that list:",
      "Every list says the same about its validity, so the dates run from the day after publication in the BOE to three years later, as the Ministry writes them on its page of zones:",
      `Catalonia is the first case to reach the end. On ${d(DATA.extension.date)} the Generalitat extended ${h.extended} of the 140 towns of the first zone and left out ${h.notExtended}, which stop being a tight-market area on ${d(h.firstUntil)}:`,
      `The new end date of the ${h.extended} will come in the Ministry's list in the BOE, not yet published on ${d(RULES_AS_OF)}. The same goes for the ${h.catPending} new towns: the Generalitat notes that a town must be in the declaration published in the BOE, and in 2024 the second zone applied from the day after the BOE, not from the DOGC:`,
    ],
  });

  const listIntro = L(locale, {
    es: "Todas las zonas, por comunidad y por declaración: la norma de la comunidad, su boletín, la lista del BOE que la recoge y las fechas. Donde solo está declarada una parte del municipio, la lista lo dice entre paréntesis.",
    ca: "Totes les zones, per comunitat i per declaració: la norma de la comunitat, el butlletí, la llista del BOE que la recull i les dates. On només hi ha declarada una part del municipi, la llista ho diu entre parèntesis.",
    en: "Every zone, by region and declaration: the region's act, its bulletin, the BOE list that records it and the dates. Where only part of a town is declared, the list says so in brackets.",
  });
  const boeListLabel = L(locale, { es: "Lista del BOE", ca: "Llista del BOE", en: "BOE list" });
  const granShort = L(locale, { es: "Gran tenedor", ca: "Gran tenidor", en: "Large landlord" });

  const howText = L(locale, {
    es: [
      "Declara la zona la comunidad autónoma (o el organismo de vivienda que designa), con un estudio previo, información pública y una memoria que justifique una de estas dos circunstancias (art. 18.3 Ley 12/2023):",
      "Un ayuntamiento puede pedirlo, pero no declararlo: A Coruña y Santiago de Compostela se declararon «a solicitud del ayuntamiento». Por eso hoy solo hay zonas en cinco comunidades.",
    ],
    ca: [
      "Declara la zona la comunitat autònoma (o l'organisme d'habitatge que designa), amb un estudi previ, informació pública i una memòria que justifiqui una d'aquestes dues circumstàncies (art. 18.3 Llei 12/2023, text oficial en castellà):",
      "Un ajuntament ho pot demanar, però no declarar-ho: A Coruña i Santiago de Compostel·la es van declarar «a solicitud del ayuntamiento». Per això avui només hi ha zones en cinc comunitats.",
    ],
    en: [
      "The region (or the housing body it names) declares a zone, after a preliminary study, public consultation and a report showing one of these two circumstances (Ley 12/2023 art. 18.3; official text in Spanish):",
      "A town council can ask for it but cannot declare it: A Coruña and Santiago de Compostela were declared “a solicitud del ayuntamiento” (at the council's request). That is why only five regions have zones today.",
    ],
  });

  const indexText = L(locale, {
    es: [
      "El Sistema Estatal de Referencia del Precio del Alquiler de Vivienda (SERPAVI) es el índice que limita la renta de los grandes tenedores y de las viviendas sin alquilar en cinco años. Con la dirección, la superficie y las características de la vivienda, la aplicación del Ministerio da un rango; el tope es el valor superior. No reproducimos sus valores: consúltalos en la fuente.",
      "En Cataluña se usa el mismo índice estatal, según la Generalitat:",
    ],
    ca: [
      "El Sistema Estatal de Referència del Preu del Lloguer d'Habitatge (SERPAVI) és l'índex que limita la renda dels grans tenidors i dels habitatges sense llogar en cinc anys. Amb l'adreça, la superfície i les característiques de l'habitatge, l'aplicació del Ministeri dona un interval; el límit és el valor superior. No en reproduïm els valors: consulta'ls a la font.",
      "A Catalunya s'utilitza el mateix índex estatal, segons la Generalitat:",
    ],
    en: [
      "The State Rent Price Reference System (SERPAVI) is the index that caps the rent of large landlords and of homes not let for five years. From the address, floor area and features of the home, the Ministry's app gives a range; the cap is the upper value. We do not reproduce its figures: look them up at the source.",
      "Catalonia uses the same state index, according to the Generalitat:",
    ],
  });

  const limits = L(locale, {
    es: [
      "No calcula la renta máxima de tu vivienda: necesita el contrato anterior o el índice de la aplicación del Ministerio.",
      "No dice qué calles de Asturias, de Galdakao o de Vitoria-Gasteiz entran: la declaración de la comunidad (enlazada en la lista) tiene los planos.",
      "No sustituye las listas oficiales: si el BOE publica una lista nueva, manda la del BOE. Revisamos las listas cada mes.",
    ],
    ca: [
      "No calcula la renda màxima del teu habitatge: cal el contracte anterior o l'índex de l'aplicació del Ministeri.",
      "No diu quins carrers d'Astúries, de Galdakao o de Vitoria-Gasteiz hi entren: la declaració de la comunitat (enllaçada a la llista) té els plànols.",
      "No substitueix les llistes oficials: si el BOE publica una llista nova, mana la del BOE. Revisem les llistes cada mes.",
    ],
    en: [
      "It does not work out your home's maximum rent: that needs the previous lease or the index from the Ministry's app.",
      "It does not say which streets of Asturias, Galdakao or Vitoria-Gasteiz are in: the region's declaration (linked in the list) has the maps.",
      "It does not replace the official lists: if the BOE publishes a new list, the BOE wins. We check the lists every month.",
    ],
  });

  const rentLink = L(locale, { es: "Calculadora para actualizar el alquiler (IPC e IRAV)", ca: "Calculadora per actualitzar el lloguer (IPC i IRAV)", en: "Rent increase calculator (CPI and IRAV)" });
  const serpaviLink = L(locale, { es: "Consultar el índice de referencia (aplicación del Ministerio de Vivienda)", ca: "Consultar l'índex de referència (aplicació del Ministeri d'Habitatge, en castellà)", en: "Look up the reference index (Ministry of Housing app, in Spanish)" });
  const zonesLink = L(locale, { es: "Zonas tensionadas según el Ministerio de Vivienda", ca: "Zones tensionades segons el Ministeri d'Habitatge (en castellà)", en: "Tight-market areas according to the Ministry of Housing (in Spanish)" });

  const appSchema = {
    "@type": "WebApplication",
    name: meta.appName,
    url: absoluteUrl(ztPath(locale)),
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
      <SiteHeader locale={locale} translations={ztEditions()} />
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
              <ZonaTensionadaChecker locale={locale} initial={checkerTown(INITIAL_TOWN)} ctx={ctx} dataUrl={ZT_DATA_PATH} />
              <p className="text-sm text-[var(--color-muted)]">
                {disclaimer} <A href={SOURCES.serpaviApp.url}>{serpaviLink}</A> · <A href={SOURCES.mivauZones.url}>{zonesLink}</A>.
              </p>
              <CalculatorNextStep current="zona-tensionada" locale={locale} />

              <AdSlot kind="top" locale={locale} path={crumbPath(crumbs)} />
              <h2 id="que-cambia">{hd.changes}</h2>
              <p>{changesText[0]}</p>
              <Quote text={QUOTE.cap} href={ANCHOR.lauArt17} label={lau("art. 17.6")} />
              <p>{changesText[1]}</p>
              <Quote text={QUOTE.noNewCharges} href={ANCHOR.lauArt17} label={lau("art. 17.6")} />
              <p>{changesText[2]}</p>
              <Quote text={QUOTE.tenPercent} href={ANCHOR.lauArt17} label={lau("art. 17.6")} />
              <p>{changesText[3]}</p>
              <Quote text={QUOTE.indexCap} href={ANCHOR.lauArt17} label={lau("art. 17.7")} />
              <p>{changesText[4]}</p>
              <Quote text={QUOTE.neverRented} href={ANCHOR.lauArt17} label={lau("art. 17.7")} />
              <p>{changesText[5]}</p>
              <Quote text={QUOTE.indexUpper} href={SOURCES.index.url} label={`${SOURCES.index.name} (${SOURCES.index.ref})`} />
              <p>{changesText[6]}</p>
              <Quote text={QUOTE.rooms} href={ANCHOR.lauArt17} label={lau("art. 17.9")} />
              <p>{changesText[7]}</p>
              <Quote text={QUOTE.extension} href={ANCHOR.lauArt10} label={lau("art. 10.3")} />
              <p>{changesText[8]}</p>
              <Quote text={QUOTE.information} href={ANCHOR.ley12Art31} label={ley12("art. 31.3")} />
              <p>{changesText[9]}</p>
              <Quote text={`${QUOTE.updateAboveIndex} […] ${QUOTE.updateTwoPercent}`} href={SOURCES.rdl29.url} label={`${SOURCES.rdl29.name} (${SOURCES.rdl29.ref})`} />
              <p>
                <Link href={calcPath("rent-update", locale)}>{rentLink}</Link>
              </p>

              <h2 id="gran-tenedor">{hd.gran}</h2>
              <p>{granText[0]}</p>
              <Quote text={QUOTE.granTenedor} href={ANCHOR.ley12Art3} label={ley12("art. 3 k)")} />
              <p>{granText[1]}</p>
              <Quote text={`${QUOTE.granTenedorRegistry} ${QUOTE.granTenedorUnits}`} href={ANCHOR.ley12Art3} label={ley12("art. 3 k)")} />
              <p>{granText[2]}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {granCols.map((col) => (
                        <th key={col} scope="col">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {granTable().map(({ decl, towns: rows }) => (
                      <tr key={decl.id}>
                        <th scope="row">{COMMUNITY_LABEL[decl.community][locale]}</th>
                        <td data-label={granCols[1]}>{rows.length > 3 ? `${rows.length} (${decl.act.split(",")[0]})` : rows.map((r) => (r.area ? `${displayName(r.name)} (${r.area})` : displayName(r.name))).join(", ")}</td>
                        <td data-label={granCols[2]}>{GRAN_LABEL[decl.granTenedor.rule][locale]}</td>
                        <td data-label={granCols[3]} lang="es" className="text-sm">
                          {decl.granTenedor.quote}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="vigencia">{hd.validity}</h2>
              <p>{validityText[0]}</p>
              <Quote text={`${QUOTE.validity} ${QUOTE.quarterlyList}`} href={ANCHOR.ley12Art18} label={ley12("art. 18.2 d)")} />
              <p>{validityText[1]}</p>
              <Quote text={QUOTE.listPeriod} href={boeUrl(latest.boe)} label={`${boeListLabel} ${latest.boe}`} />
              <p>{validityText[2]}</p>
              <Quote text={QUOTE.catExtended} href={DATA.extension.url} label={dogc} lang="ca" />
              <Quote text={QUOTE.catDropped} href={DATA.extension.url} label={dogc} lang="ca" />
              <p>{validityText[3]}</p>
              <Quote text={`${QUOTE.gencatSince} ${QUOTE.gencatBoe}`} href={SOURCES.gencatFaq.url} label={gencat} lang="ca" />

              <h2 id="lista">{hd.list}</h2>
              <p>{listIntro}</p>
              {listByCommunity().map(({ community, groups }) => (
                <section key={community} aria-labelledby={`zt-${community}`}>
                  <h3 id={`zt-${community}`}>{COMMUNITY_LABEL[community][locale]}</h3>
                  {groups.map((g) => (
                    <div key={`${g.decl.id}-${g.part ?? "all"}`} className="mt-4">
                      <h4 className="text-base">{groupTitle(g, locale)}</h4>
                      <p className="text-sm text-[var(--color-muted)]">
                        <span lang={g.decl.boe ? "es" : "ca"}>{g.decl.url ? <A href={g.decl.url}>{g.decl.act}</A> : g.decl.act}</span>
                        {g.decl.bulletin ? ` (${g.decl.bulletin})` : ""}
                        {g.decl.also ? (
                          <>
                            {" · "}
                            <span lang="es">{g.decl.also.url ? <A href={g.decl.also.url}>{g.decl.also.act}</A> : g.decl.also.act}</span>
                          </>
                        ) : null}
                        {g.decl.boe ? (
                          <>
                            {" · "}
                            {boeListLabel}: <A href={boeUrl(g.decl.boe)}>{g.decl.boe}</A>
                          </>
                        ) : null}
                        {g.part ? (
                          <>
                            {" · "}
                            <A href={DATA.extension.url}>{DATA.extension.number}</A>
                          </>
                        ) : null}
                        {" · "}
                        {granShort}: {GRAN_LABEL[g.decl.granTenedor.rule][locale]}
                      </p>
                      <ul className="columns-2 gap-6 text-sm sm:columns-3">
                        {g.towns.map((t) => (
                          <li key={`${t.ine}-${t.area ?? ""}`}>{t.area ? `${displayName(t.name)} (${t.area})` : displayName(t.name)}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              ))}

              <h2 id="como-se-declara">{hd.how}</h2>
              <p>{howText[0]}</p>
              <Quote text={QUOTE.criterionBurden} href={ANCHOR.ley12Art18} label={ley12("art. 18.3 a)")} />
              <Quote text={QUOTE.criterionPrices} href={ANCHOR.ley12Art18} label={ley12("art. 18.3 b)")} />
              <p>{howText[1]}</p>

              <h2 id="indice">{hd.index}</h2>
              <p>{indexText[0]}</p>
              <p>
                <A href={SOURCES.serpaviApp.url}>{serpaviLink}</A> · <A href={SOURCES.serpavi.url}>SERPAVI</A>
              </p>
              <p>{indexText[1]}</p>
              <Quote text={QUOTE.gencatIndex} href={SOURCES.gencatFaq.url} label={gencat} lang="ca" />

              <h2 id="preguntas">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fuentes">{hd.sources}</h2>
              <ul className="text-sm">
                {Object.values(SOURCES).map((s) => (
                  <li key={s.url}>
                    <A href={s.url}>{s.name}</A> ({s.publisher}
                    {s.ref.startsWith("BOE") ? `, ${s.ref}` : ""})
                  </li>
                ))}
                {DATA.resolutions.map((r) => (
                  <li key={r.boe}>
                    <A href={r.url}>{r.title}</A> ({r.boe}, BOE {d(r.published)})
                  </li>
                ))}
                {DATA.dogc.map((x) => (
                  <li key={x.act} lang="ca">
                    <A href={x.url}>Resolució {x.act}</A> (DOGC {x.dogc}, {d(x.published)})
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

              <MoreCalculators current="zona-tensionada" locale={locale} />
            </div>
            <ShareBar locale={locale} path={ztPath(locale)} title={meta.h1} contentType="zona_tensionada_checker" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), appSchema, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
