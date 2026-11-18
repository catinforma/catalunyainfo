import type { MetadataRoute } from "next";

import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { absoluteUrl } from "@/lib/site";

import { ZT_LOCALES, ztEditions, type ZtLocale } from "./copy";
import { DATA, counts, declaration } from "./data";
import { EXTRA_PCT, RULES_AS_OF, UPDATE_RULE } from "./rules";

/**
 * Title, description, H1, lead figures and the FAQ of the zona tensionada
 * page. Every number comes from declarations.json (counts()) and every date
 * from it or rules.ts; the tests check lengths and figures.
 */

export interface ZtMeta {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  appName: string;
}

/** The figures the title, lead and FAQ print. */
export function headline() {
  const c = counts();
  const listed = Object.values(c).reduce((n, x) => n + x.listed, 0);
  const first = declaration(DATA.extension.of);
  return {
    c,
    listed,
    cat: c.catalonia.listed,
    catPending: c.catalonia.pending,
    extended: DATA.extension.extended,
    notExtended: DATA.extension.notExtended,
    firstFrom: first.from!,
    firstUntil: first.until!,
  };
}

export function ztMeta(locale: ZtLocale): ZtMeta {
  const h = headline();
  return {
    es: {
      title: "Zonas tensionadas 2026: ¿está tu municipio? Lista del BOE",
      description: `Consulta si tu municipio es zona tensionada: ${h.cat} en Cataluña (+${h.catPending} pendientes del BOE), País Vasco, Navarra, Galicia y Asturias, con fechas y tope del alquiler.`,
      h1: "¿Está mi municipio en zona tensionada? Lista oficial y qué cambia",
      breadcrumb: "Zona tensionada",
      appName: "Buscador de zonas tensionadas (Ley 12/2023, art. 18; listas del Ministerio de Vivienda en el BOE)",
    },
    ca: {
      title: "Zones tensionades 2026: hi és el teu municipi? Llista BOE",
      description: `Consulta si el teu municipi és zona tensionada: ${h.cat} a Catalunya (+${h.catPending} pendents del BOE), País Basc, Navarra, Galícia i Astúries, amb dates i límit del lloguer.`,
      h1: "El meu municipi és zona tensionada? Llista oficial i què canvia",
      breadcrumb: "Zona tensionada",
      appName: "Cercador de zones tensionades (Llei 12/2023, art. 18; llistes del Ministeri d'Habitatge al BOE)",
    },
    en: {
      title: "Spain's zonas tensionadas: is your town a rent-control area?",
      description: `Is your town a zona tensionada? ${h.cat} in Catalonia (+${h.catPending} awaiting the BOE), plus the Basque Country, Navarre, Galicia and Asturias: dates and rent caps.`,
      h1: "Is my town a zona tensionada? Spain's official list and what changes",
      breadcrumb: "Zonas tensionadas",
      appName: "Spain tight-market area (zona tensionada) checker (Ley 12/2023 art. 18; Ministry of Housing lists in the BOE)",
    },
  }[locale];
}

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML. */
export function ztSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  const e = ztEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return ZT_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

/** The FAQ (also the FAQPage JSON-LD): the questions people search, every figure from the data and the rules. */
export function ztFaq(locale: ZtLocale): { q: string; a: string }[] {
  const h = headline();
  const d = (iso: string) => dayMonthYear(iso, locale);
  const asOf = d(RULES_AS_OF);
  const pendingDay = d(DATA.pending.date);
  const upTo = d(UPDATE_RULE.until);
  return {
    es: [
      {
        q: "¿Qué es una zona tensionada?",
        a: "Un municipio, o una parte de él, que su comunidad autónoma declara «zona de mercado residencial tensionado» según la Ley 12/2023 por el derecho a la vivienda (art. 18): porque el alquiler o la hipoteca, más los gastos y suministros básicos, superan el 30 % de la renta media de los hogares, o porque el precio de compra o alquiler ha subido en cinco años al menos tres puntos más que el IPC de la comunidad. La declaración dura tres años y se puede prorrogar año a año.",
      },
      {
        q: "¿Cómo sé si mi vivienda está en zona tensionada?",
        a: `Busca el municipio en el buscador de esta página o en la lista por comunidad. Lo que cuenta es la lista que el Ministerio de Vivienda publica cada trimestre en el BOE: los límites del alquiler se aplican desde el día siguiente a esa publicación. En Asturias y en Galdakao solo están declarados algunos barrios o núcleos; en Vitoria-Gasteiz, todo el municipio salvo la zona rural. A ${asOf} hay ${h.listed} municipios o zonas en esas listas.`,
      },
      {
        q: "¿Qué municipios de Cataluña son zona tensionada?",
        a: `${h.cat} están en las listas del BOE: 140 desde el 16 de marzo de 2024 (Barcelona, Girona, Tarragona, Lleida, Sabadell, Terrassa…) y 131 desde el 10 de octubre de 2024. El ${pendingDay} la Generalitat prorrogó ${h.extended} de los 140, dejó fuera ${h.notExtended} (entre ellos Lleida, Reus, Granollers y Figueres), que dejan de serlo el 16 de marzo de 2027, y declaró ${h.catPending} municipios nuevos (como Martorell, Vila-seca o Tordera), que esperan la lista del BOE.`,
      },
      {
        q: "Gran tenedor en zona tensionada: ¿5 o 10 viviendas?",
        a: "Las dos cifras son ciertas. En toda España es gran tenedor quien tiene más de 10 viviendas o más de 1.500 m² de uso residencial, sin contar garajes ni trasteros (Ley 12/2023, art. 3 k). En una zona tensionada la comunidad puede bajarlo a 5 o más viviendas allí: lo han hecho Cataluña, Navarra, Santiago de Compostela y casi todos los municipios vascos; Pasaia usa «más de cinco». Bilbao, Zestoa, A Coruña y las zonas de Asturias mantienen la regla general. Desde el 8 de octubre de 2026 se acredita con un certificado del Registro de la Propiedad, y cada vivienda de un edificio cuenta por separado.",
      },
      {
        q: "¿Cuánto puede subir el alquiler en una zona tensionada?",
        a: `En un contrato nuevo, como máximo la renta del último contrato de los últimos cinco años en esa vivienda, actualizada; un ${EXTRA_PCT} % más solo por obras de rehabilitación, ahorro energético o accesibilidad, o por un contrato de 10 años o más. Si el casero es gran tenedor, o la vivienda no se ha alquilado en cinco años, tampoco puede pasar del valor superior del índice del Ministerio (art. 17.6 y 17.7 LAU). La subida anual de un contrato en vigor es otra regla, para toda España: hasta el ${upTo}, sin un nuevo pacto, como mucho el 2 %, y ninguna si la renta ya supera el índice (Real Decreto-ley 29/2026, disposición final sexta).`,
      },
      {
        q: "¿Hasta cuándo dura una zona tensionada?",
        a: `Tres años desde el día siguiente a la lista del BOE, prorrogables año a año si siguen las circunstancias. Las primeras, las 140 catalanas, acaban el ${d(h.firstUntil)}; ${h.extended} ya están prorrogadas por la Generalitat y la nueva fecha final la dará la próxima lista del BOE. El buscador da las fechas de cada municipio.`,
      },
      {
        q: "¿Dónde se consulta el índice de referencia del alquiler?",
        a: "En la aplicación del Sistema Estatal de Referencia del Precio del Alquiler de Vivienda (SERPAVI) del Ministerio de Vivienda y Agenda Urbana: con la dirección y las características de la vivienda da un rango de valores, y el tope es el valor superior. En Cataluña se aplica el mismo índice estatal, según la Generalitat.",
      },
      {
        q: "¿Hay zonas tensionadas en Madrid, Valencia o Andalucía?",
        a: `No. A ${asOf} solo han declarado zonas que figuran en el BOE Cataluña, el País Vasco, Navarra, Galicia (A Coruña y Santiago de Compostela) y Asturias. Sin una declaración de la comunidad autónoma, no se aplican los límites de las zonas tensionadas.`,
      },
    ],
    ca: [
      {
        q: "Què és una zona tensionada?",
        a: "Un municipi, o una part, que la comunitat autònoma declara «zona de mercat residencial tensionat» segons la Llei 12/2023 pel dret a l'habitatge (art. 18): perquè el lloguer o la hipoteca, més les despeses i els subministraments bàsics, superen el 30 % de la renda mitjana de les llars, o perquè el preu de compra o lloguer ha pujat en cinc anys almenys tres punts més que l'IPC de la comunitat. La declaració dura tres anys i es pot prorrogar any a any.",
      },
      {
        q: "Com sé si el meu habitatge és en zona tensionada?",
        a: `Busca el municipi al cercador d'aquesta pàgina o a la llista per comunitat. El que compta és la llista que el Ministeri d'Habitatge publica cada trimestre al BOE: els límits del lloguer s'apliquen des de l'endemà d'aquesta publicació. A Astúries i a Galdakao només hi ha declarats alguns barris o nuclis; a Vitoria-Gasteiz, tot el municipi menys la zona rural. El ${asOf} hi ha ${h.listed} municipis o zones en aquestes llistes.`,
      },
      {
        q: "Quins municipis de Catalunya són zona tensionada?",
        a: `${h.cat} són a les llistes del BOE: 140 des del 16 de març de 2024 (Barcelona, Girona, Tarragona, Lleida, Sabadell, Terrassa…) i 131 des del 10 d'octubre de 2024. El ${pendingDay} la Generalitat en va prorrogar ${h.extended} dels 140, en va deixar fora ${h.notExtended} (entre ells Lleida, Reus, Granollers i Figueres), que deixen de ser-ho el 16 de març de 2027, i en va declarar ${h.catPending} de nous (com Martorell, Vila-seca o Tordera), que esperen la llista del BOE.`,
      },
      {
        q: "Gran tenidor en zona tensionada: 5 o 10 habitatges?",
        a: "Les dues xifres són certes. A tot Espanya és gran tenidor qui té més de 10 habitatges o més de 1.500 m² d'ús residencial, sense comptar garatges ni trasters (Llei 12/2023, art. 3 k). En una zona tensionada la comunitat ho pot baixar a 5 o més habitatges allà: ho han fet Catalunya, Navarra, Santiago de Compostel·la i gairebé tots els municipis bascos; Pasaia fa servir «més de cinc». Bilbao, Zestoa, A Coruña i les zones d'Astúries mantenen la regla general. Des del 8 d'octubre de 2026 s'acredita amb un certificat del Registre de la Propietat, i cada habitatge d'un edifici compta per separat.",
      },
      {
        q: "Quant pot pujar el lloguer en una zona tensionada?",
        a: `En un contracte nou, com a màxim la renda de l'últim contracte dels últims cinc anys en aquell habitatge, actualitzada; un ${EXTRA_PCT} % més només per obres de rehabilitació, estalvi energètic o accessibilitat, o per un contracte de 10 anys o més. Si el propietari és gran tenidor, o l'habitatge no s'ha llogat en cinc anys, tampoc no pot superar el valor superior de l'índex del Ministeri (art. 17.6 i 17.7 LAU). L'actualització anual d'un contracte vigent és una altra regla, per a tot Espanya: fins al ${upTo}, sense un nou pacte, com a molt el 2 %, i cap si la renda ja supera l'índex (Reial decret llei 29/2026, disposició final sisena).`,
      },
      {
        q: "Fins quan dura una zona tensionada?",
        a: `Tres anys des de l'endemà de la llista del BOE, prorrogables any a any si continuen les circumstàncies. Les primeres, les 140 catalanes, acaben el ${d(h.firstUntil)}; ${h.extended} ja estan prorrogades per la Generalitat i la nova data final la donarà la propera llista del BOE. El cercador dona les dates de cada municipi.`,
      },
      {
        q: "On es consulta l'índex de referència del lloguer?",
        a: "A l'aplicació del Sistema Estatal de Referència del Preu del Lloguer d'Habitatge (SERPAVI) del Ministeri d'Habitatge i Agenda Urbana: amb l'adreça i les característiques de l'habitatge dona un interval de valors, i el límit és el valor superior. A Catalunya s'aplica el mateix índex estatal, segons la Generalitat.",
      },
      {
        q: "Hi ha zones tensionades a Madrid, València o Andalusia?",
        a: `No. El ${asOf} només han declarat zones que figuren al BOE Catalunya, el País Basc, Navarra, Galícia (A Coruña i Santiago de Compostel·la) i Astúries. Sense una declaració de la comunitat autònoma, no s'apliquen els límits de les zones tensionades.`,
      },
    ],
    en: [
      {
        q: "What is a zona tensionada?",
        a: "A town, or part of one, that its region declares a “zona de mercado residencial tensionado” (tight housing market area) under Ley 12/2023, the housing act (art. 18): because rent or mortgage plus basic bills take more than 30% of the average household income, or because purchase or rental prices rose at least three points more than the regional CPI over five years. A declaration lasts three years and can be extended a year at a time.",
      },
      {
        q: "How do I know if my home is in a zona tensionada?",
        a: `Look the town up in this page's checker or in the list by region. What counts is the list the Ministry of Housing publishes every quarter in the BOE (Spain's official gazette): rent limits apply from the day after it is published. In Asturias and Galdakao only some neighbourhoods or villages are declared; in Vitoria-Gasteiz, the whole town except its rural area. On ${asOf} those lists hold ${h.listed} towns or areas.`,
      },
      {
        q: "Which towns in Catalonia are zonas tensionadas?",
        a: `${h.cat} are in the BOE lists: 140 since 16 March 2024 (Barcelona, Girona, Tarragona, Lleida, Sabadell, Terrassa…) and 131 since 10 October 2024. On ${pendingDay} the Generalitat extended ${h.extended} of the 140, left out ${h.notExtended} (among them Lleida, Reus, Granollers and Figueres), which stop being declared on 16 March 2027, and declared ${h.catPending} new towns (such as Martorell, Vila-seca and Tordera), now awaiting the BOE list.`,
      },
      {
        q: "Large landlord (gran tenedor) in a zona tensionada: 5 or 10 homes?",
        a: "Both figures are right. Across Spain a large landlord owns more than 10 homes or more than 1,500 m² of residential space, not counting garages or storage rooms (Ley 12/2023 art. 3 k). In a declared area the region may lower that to 5 or more homes there: Catalonia, Navarre, Santiago de Compostela and almost every Basque town did; Pasaia uses “more than five”. Bilbao, Zestoa, A Coruña and the Asturian areas keep the general rule. Since 8 October 2026 it is proven with a Land Registry certificate, and each home in a building counts separately.",
      },
      {
        q: "How much can rent go up in a zona tensionada?",
        a: `On a new lease, at most the rent of the last lease on that home in the past five years, updated; ${EXTRA_PCT}% more only for refurbishment, energy-saving or accessibility works, or a lease of 10 years or more. If the landlord is a large landlord, or the home has not been let for five years, it also cannot exceed the upper value of the Ministry's index (LAU art. 17.6 and 17.7). The yearly update of a running lease is a separate, Spain-wide rule: until ${upTo}, without a new agreement, at most 2%, and none if the rent already exceeds the index (Royal Decree-law 29/2026, sixth final provision).`,
      },
      {
        q: "How long does a zona tensionada last?",
        a: `Three years from the day after the BOE list, extendable a year at a time if the conditions persist. The first ones, Catalonia's 140, end on ${d(h.firstUntil)}; the Generalitat has already extended ${h.extended} and the new end date will come in the next BOE list. The checker gives each town's dates.`,
      },
      {
        q: "Where can I look up the rent reference index?",
        a: "In the Ministry of Housing's State Rent Price Reference System app (SERPAVI): from the address and features of the home it gives a range, and the cap is the upper value. Catalonia uses the same state index, according to the Generalitat.",
      },
      {
        q: "Are there zonas tensionadas in Madrid, Valencia or Andalusia?",
        a: `No. On ${asOf} only Catalonia, the Basque Country, Navarre, Galicia (A Coruña and Santiago de Compostela) and Asturias have declared areas that appear in the BOE. Without a declaration by the region, the tight-market limits do not apply.`,
      },
    ],
  }[locale];
}
