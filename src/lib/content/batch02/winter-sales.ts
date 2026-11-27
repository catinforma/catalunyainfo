import type { Block } from "@/lib/content/blocks";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { dayMonth, dayMonthYear, weekdayDayMonth } from "@/lib/programmatic/holidays/format";

import { calendarLine } from "./christmas-season-links";
import { B2_PATHS, b2Related, b2link, callout, faq, h2, keyFacts, lead, list, paras, table, verifiedLine, type B2Article, type B2Source } from "./shared";
import { OPENING_2027 } from "./shops";

/**
 * "Winter sales 2027 in Catalonia" (25 Nov 2026), ticket O2 of the 25 Nov
 * opportunities list: the site had no page, and "rebaix*" / "rebaj*" had 5
 * impressions in 28 days (Search Console). Every fact on the page lives in
 * `WINTER_SALES` below; the three editions are built from it, so no edition can
 * say a different date.
 *
 * What the sources say (all read on 25 Nov 2026, curl; read times in
 * `WINTER_SALES.read`):
 *
 *  - The sales dates are NOT fixed by law in Catalonia. Llei 18/2017, de l'1
 *    d'agost, de comerç, serveis i fires, art. 20.6, as in force from
 *    1.1.2026 (BOE consolidated text, "Última actualización, publicada el
 *    31/12/2025"; art. 20.6 modified by art. 8 of Llei 12/2025, de 29 de
 *    desembre): «Las temporadas habituales para llevar a cabo la venta en
 *    rebajas son el invierno y el verano, en que tradicionalmente se realiza
 *    este tipo de venta. Anualmente, antes del 30 de septiembre, el Consejo
 *    Asesor de la Generalitat de Catalunya en Materia de Comercio debe
 *    recomendar las fechas de inicio y finalización de las temporadas del año
 *    siguiente, atendiendo, en cada momento, a las demandas del sector
 *    comercial.» Art. 20.7: «La venta en rebajas debe anunciarse con esta
 *    denominación y con el detalle del período durante el que se llevará a
 *    cabo este tipo de venta.»
 *  - The Agència Catalana del Consum (consum.gencat.cat/ca/els-meus-drets/
 *    rebaixes/, "Data d'actualització: 02.01.2026"): «Els establiments poden
 *    decidir lliurement si fan o no rebaixes –no hi estan obligats–.» and «el
 *    Consell Assessor ... proposa les dates recomanades d'inici i de
 *    finalització de les temporades de l'any següent». Original price: «el
 *    preu més baix que hagi tingut aquell producte en l'establiment, durant
 *    els trenta dies precedents a la data d'inici de les rebaixes». Exchanges:
 *    «en vendes presencials, la botiga no té l'obligació d'acceptar-los si el
 *    producte està en perfecte estat». Online: «un període mínim de 14 dies».
 *    Cards: «Si la botiga accepta targetes ... de manera habitual, també ho ha
 *    de fer en període de rebaixes.» Complaint: «Si en el termini de 30 dies no
 *    heu obtingut resposta ...».
 *  - The last recommendation of dates the Generalitat has published that we
 *    could find: CCAM (Consorci de Comerç, Artesania i Moda), 2.12.2022, "El
 *    Consell Assessor de Comerç aprova la recomanació del període de rebaixes
 *    d'hivern i estiu": «contempla que es facin les rebaixes entre el 7 de
 *    gener i el 30 de març, i entre l'1 de juliol i el 30 d'agost». We found NO
 *    recommendation for 2027 (searched gencat.cat, ccam.gencat.cat, govern.cat
 *    on 25 Nov); the page says so and prints no start or end date. Media and
 *    aggregators quote "7 January to 6 March": not an official text, not used.
 *  - The first general opening day of 2027: Ordre EMT/89/2026 (DOGC núm. 9674,
 *    28.5.2026), art. 1 "3 de gener" (a Sunday); art. 5 default municipal days
 *    10 January and 5 December (both from `OPENING_2027`, which the shops guide
 *    holds to the order). The Generalitat's press note of 24.3.2026 ("El
 *    Consell Assessor de Comerç aprova el calendari de festius amb obertura
 *    comercial per a l'any 2027", govern.cat) labels 3 January "(Rebaixes
 *    d'hivern)" and 27 June "(Rebaixes d'estiu)". The order itself does not use
 *    the word. Each town's own two 2027 days are not published yet (the shops
 *    guide's holiday data, 25 Nov), so Barcelona's are not given.
 *  - The State: Ley 7/1996 de Ordenación del Comercio Minorista, art. 25 as
 *    modified by art. 28.3 of RDL 20/2012, de 13 de julio (BOE-A-2012-9364),
 *    BOE consolidated text read 25 Nov: «1. Las ventas en rebajas podrán tener
 *    lugar en los periodos estacionales de mayor interés comercial según el
 *    criterio de cada comerciante. 2. La duración de cada periodo de rebajas
 *    será decidida libremente por cada comerciante.» Art. 26.2: «queda
 *    prohibido ofertar, como rebajados, artículos deteriorados».
 *
 * Date guards (tests/winter-sales.test.ts): re-read the Generalitat's pages for
 * a 2027 recommendation by `rereadBy`, and the page must be rewritten (tense,
 * dates) before `rollBy`, the first opening Sunday.
 */
export const WINTER_SALES = {
  asOf: "2026-11-25",
  /** Re-read the Generalitat's pages for a 2027 recommendation by this day (the weeks before the sales). */
  rereadBy: "2026-12-22",
  /** The page speaks of 3 January as ahead of us: rewrite it from this day. */
  rollBy: "2027-01-03",
  read: {
    law: "2026-11-25T16:29+01:00",
    consum: "2026-11-25T16:57+01:00",
    ccam2022: "2026-11-25T16:56+01:00",
    pressNote: "2026-11-25T16:56+01:00",
    order: "2026-11-25T17:24+01:00",
    state: "2026-11-25T17:24+01:00",
  },
  /** The first general opening day of 2027 and the default municipal day after it (the shops guide's table). */
  firstSunday: OPENING_2027.general[0],
  defaultSunday: OPENING_2027.municipalDefault[0],
  /** The last recommended period we found: CCAM, 2 December 2022. */
  lastRecommendation: { published: "2022-12-02", from: { month: 1, day: 7 }, to: { month: 3, day: 30 } },
  consumer: { originalPriceDays: 30, onlineDays: 14, complaintDays: 30, stockMonths: 1 },
  url: {
    law: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11320",
    consum: "https://consum.gencat.cat/ca/els-meus-drets/rebaixes/index.html",
    ccam2022: "https://ccam.gencat.cat/ca/detall/noticia/2022/12/El-Consell-Assessor-de-Comerc-aprova-la-recomanacio-del-periode-de-rebaixes-dhivern-i-estiu",
    pressNote: "https://govern.cat/gov/notes-premsa/805008/el-consell-assessor-de-comerc-aprova-el-calendari-de-festius-amb-obertura-comercial-per-a-l-any-2027",
    order: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1045357&type=01&language=ca_ES",
    state: "https://www.boe.es/buscar/act.php?id=BOE-A-1996-1072",
  },
} as const;

const W = WINTER_SALES;
const mmdd = (p: { month: number; day: number }) => `2022-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;

export const WINTER_SALES_SOURCES: B2Source[] = [
  { name: "Llei 18/2017, de l'1 d'agost, de comerç, serveis i fires (art. 20: venda en rebaixes; text consolidat)", url: W.url.law, publisher: "Generalitat de Catalunya / BOE", ref: "núm. 7426, 3.8.2017" },
  { name: "Rebaixes (pàgina actualitzada el 2.1.2026)", url: W.url.consum, publisher: "Agència Catalana del Consum" },
  { name: "El Consell Assessor de Comerç aprova la recomanació del període de rebaixes d'hivern i estiu", url: W.url.ccam2022, publisher: "Consorci de Comerç, Artesania i Moda de Catalunya" },
  { name: "El Consell Assessor de Comerç aprova el calendari de festius amb obertura comercial per a l'any 2027", url: W.url.pressNote, publisher: "Govern de la Generalitat (Empresa i Treball)" },
  { name: "Ordre EMT/89/2026, calendari d'obertura comercial en diumenges i festius per al 2027", url: W.url.order, publisher: "DOGC", ref: "núm. 9674, 28.5.2026" },
  { name: "Ley 7/1996, de Ordenación del Comercio Minorista (arts. 24 a 26; art. 25 según el RDL 20/2012)", url: W.url.state, publisher: "BOE" },
];

type Copy = {
  lead: string;
  factsTitle: string;
  facts: { label: string; value: string }[];
  lawH: string;
  law: string[];
  sundaysH: string;
  sundays: string[];
  sundaysCaption: string;
  sundaysHead: string[];
  sundaysRows: string[][];
  sundaysNote: string;
  rightsH: string;
  rightsLead: string;
  rights: string[];
  spainH: string;
  spain: string[];
  faqH: string;
  faq: { question: string; answer: string }[];
  callout: string;
};

function copy(L: Locale): Copy {
  const first = weekdayDayMonth(W.firstSunday, L);
  const firstDm = dayMonth(W.firstSunday, L);
  const second = weekdayDayMonth(W.defaultSunday, L);
  const secondDm = dayMonth(W.defaultSunday, L);
  const recFrom = dayMonth(mmdd(W.lastRecommendation.from), L);
  const recTo = dayMonth(mmdd(W.lastRecommendation.to), L);
  const recDate = dayMonthYear(W.lastRecommendation.published, L);
  const n = W.consumer;
  const shops = (label: string) => b2link("shops", L, label);

  if (L === "ca") {
    return {
      lead: `**Les rebaixes d'hivern 2027 a Catalunya no tenen una data d'inici ni de final fixada per la llei: cada botiga decideix si en fa i quan, i les ha d'anunciar amb aquest nom i amb el període exacte.** Cada any el Consell Assessor de Comerç de la Generalitat n'ha de recomanar unes dates; l'última recomanació que hem trobat publicada és del ${recDate} (del ${recFrom} al ${recTo}) i per al 2027 no n'hem trobat cap, així que no et diem un dia d'inici ni de final. Sí que és oficial que el primer dia d'obertura comercial general del 2027 és el **${first}**, que la Generalitat anomena «Rebaixes d'hivern».`,
      factsTitle: "Rebaixes d'hivern 2027 a Catalunya, en breu",
      facts: [
        { label: "Inici i final", value: "No els fixa la llei: els decideix cada botiga i els anuncia" },
        { label: "Última recomanació de dates que hem trobat", value: `Del ${recFrom} al ${recTo} (Consell Assessor de Comerç, ${recDate}). Per al 2027, cap de publicada que haguem trobat` },
        { label: "Primer diumenge amb botigues obertes el 2027", value: `${first} (calendari general, Ordre EMT/89/2026)` },
        { label: "Diumenges municipals del 2027", value: `Encara no publicats; si l'ajuntament no en tria, el ${secondDm} i el 5 de desembre` },
        { label: "Preu original", value: `El més baix dels ${n.originalPriceDays} dies anteriors a l'inici de les rebaixes` },
        { label: "Canvis i devolucions", value: "La botiga no hi està obligada si el producte està bé, tret que ho anunciï" },
      ],
      lawH: "Què diu la llei sobre les dates de les rebaixes a Catalunya",
      law: [
        `L'article 20 de la Llei 18/2017, de comerç, serveis i fires, diu que les temporades habituals de rebaixes són l'hivern i l'estiu i que cada any, abans del 30 de setembre, el Consell Assessor de la Generalitat en matèria de comerç ha de **recomanar** les dates d'inici i de final de les temporades de l'any següent. És una recomanació, no una obligació: l'Agència Catalana del Consum ho resumeix així, «els establiments poden decidir lliurement si fan o no rebaixes –no hi estan obligats–».`,
        `El que sí que exigeix la llei és que la venda s'anunciï amb el nom «rebaixes» i amb el detall del període, que els productes rebaixats s'hagin posat a la venda en aquell establiment almenys durant un mes just abans, i que no s'hi vengui material defectuós ni unitats comprades expressament per a les rebaixes. Per això el període que val per a una botiga és el que ella té anunciat.`,
        `Les dates que més es repeteixen als mitjans (com «del 7 de gener al 6 de març») no surten de cap text oficial que haguem pogut llegir. L'única recomanació que hem trobat és la del ${recDate}: del ${recFrom} al ${recTo}. No sabem si el Consell Assessor n'ha aprovat cap altra per al 2027; ho tornarem a mirar abans de les rebaixes.`,
      ],
      sundaysH: "Quin diumenge obren les botigues a les rebaixes del gener del 2027",
      sundays: [
        `El calendari general d'obertura comercial del 2027 (Ordre EMT/89/2026, article 1) comença el **${first}**. La nota de premsa de la Generalitat que n'explica el calendari el marca com a «Rebaixes d'hivern»; l'ordre no ho diu. Que les botigues puguin obrir no vol dir que hagin d'obrir ni que aquell dia comencin les seves rebaixes.`,
        `Cada municipi afegeix dos dies propis de l'any. Els del 2027, també els de Barcelona, encara no s'han publicat; on l'ajuntament no en triï cap, s'apliquen per defecte el ${secondDm} i el 5 de desembre (article 5). Tots els dies i les excepcions, a ${shops("botigues obertes en diumenges i festius a Catalunya")}.`,
      ],
      sundaysCaption: "Diumenges de gener del 2027 en què les botigues poden obrir",
      sundaysHead: ["Dia", "Què és", "Font"],
      sundaysRows: [
        [first, "Calendari general d'obertura comercial", "Ordre EMT/89/2026, art. 1"],
        [second, "Dia municipal per defecte, on l'ajuntament no n'hagi triat d'altres", "Ordre EMT/89/2026, art. 5"],
      ],
      sundaysNote: "Dies del 2027 llegits al DOGC núm. 9674 (28.5.2026). Els dos dies propis de cada municipi per al 2027 encara no consten publicats.",
      rightsH: "Els teus drets a les rebaixes: preu, canvis i garantia",
      rightsLead: "Segons l'Agència Catalana del Consum (pàgina actualitzada el 2 de gener del 2026) i l'article 20 de la Llei 18/2017:",
      rights: [
        `**Preu original i preu rebaixat:** els articles rebaixats han d'estar diferenciats i mostrar el preu original i el rebaixat, o el percentatge de descompte. El preu original és el més baix que hagi tingut aquell producte a la botiga durant els ${n.originalPriceDays} dies anteriors a l'inici de les rebaixes.`,
        "**Mateixa qualitat i garantia:** els productes rebaixats tenen la mateixa garantia que abans. No es poden vendre com a rebaixats productes defectuosos, deteriorats, desaparellats o obsolets.",
        "**Targeta:** si la botiga accepta targetes habitualment, també les ha d'acceptar durant les rebaixes.",
        "**Canvis i devolucions:** en compres a la botiga, no està obligada a canviar un producte en perfecte estat tret que ho anunciï; si ho ofereix, ha d'informar clarament de les condicions (termini, excepcions, devolució dels diners o val i la seva caducitat). Si no diu res, la botiga no hi està obligada.",
        `**Compres per internet:** disposes d'un mínim de ${n.onlineDays} dies per retornar-les, amb les excepcions que preveu la llei (productes personalitzats, els que es fan malbé amb rapidesa, entrades amb data, etc.).`,
        `**Tiquets i reclamacions:** guarda el tiquet o la factura fins al final de la garantia. Si el producte no és conforme, demana el full de reclamació; si en ${n.complaintDays} dies no tens resposta o no és satisfactòria, pots anar al servei públic de consum del teu municipi.`,
      ],
      spainH: "I a la resta d'Espanya?",
      spain: [
        `La llei de l'Estat (Llei 7/1996 d'ordenació del comerç minorista, article 25, segons el Reial decret llei 20/2012) diu que les rebaixes poden fer-se en els períodes estacionals de més interès comercial segons el criteri de cada comerciant i que la durada de cada període «serà decidida lliurement per cada comerciant». Vol dir que, des del 2012, l'Estat no fixa un calendari de rebaixes. Els dies d'obertura de botigues sí que els fixa cada comunitat: a ${b2link("shopsSpainDecember", L, "botigues obertes al desembre per comunitat")} hi ha les del Nadal.`,
      ],
      faqH: "Preguntes freqüents",
      faq: [
        { question: "Quan comencen les rebaixes d'hivern 2027 a Catalunya?", answer: `La llei no fixa una data: cada botiga decideix quan comença i ho ha d'anunciar. La Generalitat recomana unes dates cada any; l'última que hem trobat és del ${recDate} (del ${recFrom} al ${recTo}) i per al 2027 no n'hem trobat cap. El primer diumenge del 2027 amb botigues obertes és el ${first}.` },
        { question: "Quan s'acaben les rebaixes d'hivern 2027?", answer: `No hi ha una data final oficial per a totes les botigues: cada establiment ha d'anunciar el període que dura la seva venda en rebaixes. La recomanació de la Generalitat de ${recDate} acabava el ${recTo}, però és d'un altre any.` },
        { question: `Obren les botigues el ${firstDm} del 2027?`, answer: `Poden obrir: el ${first} és un dels vuit dies del calendari general d'obertura comercial del 2027 (Ordre EMT/89/2026). Poden obrir, no han d'obrir; cada botiga decideix.` },
        { question: "Les botigues han d'acceptar canvis i devolucions a les rebaixes?", answer: "No, si el producte està en perfecte estat i la botiga no ha anunciat que admet canvis. Si els admet, ha d'explicar les condicions. Les compres per internet tenen almenys 14 dies per retornar-les." },
        { question: "Quin ha de ser el preu «original» d'un article rebaixat?", answer: `El més baix que hagi tingut aquell producte a la botiga durant els ${n.originalPriceDays} dies anteriors a l'inici de les rebaixes, segons l'Agència Catalana del Consum.` },
        { question: "Una botiga pot dir que a les rebaixes no accepta targeta?", answer: "No: si accepta targetes habitualment, no pot limitar-ne l'ús durant les rebaixes." },
        { question: "Hi ha una data oficial de rebaixes a tot Espanya?", answer: "No. La llei estatal deixa que cada comerciant triï quan fa rebaixes i quant duren (Llei 7/1996, article 25, des del Reial decret llei 20/2012)." },
      ],
      callout: "Llei 18/2017 (text consolidat del BOE), Agència Catalana del Consum, CCAM, nota de premsa de la Generalitat, Ordre EMT/89/2026 i Llei 7/1996. No hi ha cap data d'inici o final de les rebaixes del 2027 en un text oficial.",
    };
  }

  if (L === "es") {
    return {
      lead: `**Las rebajas de invierno de 2027 en Cataluña no tienen una fecha de inicio ni de fin fijada por ley: cada tienda decide si las hace y cuándo, y debe anunciarlas con ese nombre y con el periodo exacto.** Cada año el Consell Assessor de Comerç de la Generalitat debe recomendar unas fechas; la última recomendación publicada que hemos encontrado es del ${recDate} (del ${recFrom} al ${recTo}) y para 2027 no hemos encontrado ninguna, así que no damos un día de inicio ni de fin. Lo que sí es oficial es que el primer día de apertura comercial general de 2027 es el **${first}**, que la Generalitat llama «Rebaixes d'hivern».`,
      factsTitle: "Rebajas de invierno 2027 en Cataluña, en breve",
      facts: [
        { label: "Inicio y fin", value: "No los fija la ley: los decide cada tienda y los anuncia" },
        { label: "Última recomendación de fechas que hemos encontrado", value: `Del ${recFrom} al ${recTo} (Consell Assessor de Comerç, ${recDate}). Para 2027, ninguna publicada que hayamos encontrado` },
        { label: "Primer domingo con tiendas abiertas en 2027", value: `${first} (calendario general, Orden EMT/89/2026)` },
        { label: "Domingos municipales de 2027", value: `Aún no publicados; si el ayuntamiento no elige, el ${secondDm} y el 5 de diciembre` },
        { label: "Precio original", value: `El más bajo de los ${n.originalPriceDays} días anteriores al inicio de las rebajas` },
        { label: "Cambios y devoluciones", value: "La tienda no está obligada si el producto está bien, salvo que lo anuncie" },
      ],
      lawH: "Qué dice la ley sobre las fechas de las rebajas en Cataluña",
      law: [
        `El artículo 20 de la Ley 18/2017, de comercio, servicios y ferias, dice que las temporadas habituales de rebajas son el invierno y el verano y que cada año, antes del 30 de septiembre, el Consell Assessor de la Generalitat en materia de comercio debe **recomendar** las fechas de inicio y fin de las temporadas del año siguiente. Es una recomendación, no una obligación: la Agència Catalana del Consum lo resume así, «los establecimientos pueden decidir libremente si hacen o no rebajas, no están obligados».`,
        `Lo que sí exige la ley es que la venta se anuncie con el nombre «rebajas» y con el detalle del periodo, que los productos rebajados se hayan puesto a la venta en ese establecimiento al menos un mes justo antes, y que no se vendan productos defectuosos ni unidades compradas expresamente para las rebajas. Por eso el periodo que vale para una tienda es el que ella tiene anunciado.`,
        `Las fechas que más se repiten en los medios (como «del 7 de enero al 6 de marzo») no salen de ningún texto oficial que hayamos podido leer. La única recomendación que hemos encontrado es la del ${recDate}: del ${recFrom} al ${recTo}. No sabemos si el Consell Assessor ha aprobado otra para 2027; volveremos a mirarlo antes de las rebajas.`,
      ],
      sundaysH: "Qué domingo abren las tiendas en las rebajas de enero de 2027",
      sundays: [
        `El calendario general de apertura comercial de 2027 (Orden EMT/89/2026, artículo 1) empieza el **${first}**. La nota de prensa de la Generalitat que explica el calendario lo marca como «Rebaixes d'hivern»; la orden no lo dice. Que las tiendas puedan abrir no significa que deban abrir ni que ese día empiecen sus rebajas.`,
        `Cada municipio añade dos días propios al año. Los de 2027, también los de Barcelona, todavía no se han publicado; donde el ayuntamiento no elija ninguno, se aplican por defecto el ${secondDm} y el 5 de diciembre (artículo 5). Todos los días y las excepciones, en ${shops("tiendas abiertas en domingos y festivos en Cataluña")}.`,
      ],
      sundaysCaption: "Domingos de enero de 2027 en que las tiendas pueden abrir",
      sundaysHead: ["Día", "Qué es", "Fuente"],
      sundaysRows: [
        [first, "Calendario general de apertura comercial", "Orden EMT/89/2026, art. 1"],
        [second, "Día municipal por defecto, donde el ayuntamiento no haya elegido otros", "Orden EMT/89/2026, art. 5"],
      ],
      sundaysNote: "Días de 2027 leídos en el DOGC núm. 9674 (28.5.2026). Los dos días propios de cada municipio para 2027 todavía no constan publicados.",
      rightsH: "Tus derechos en las rebajas: precio, cambios y garantía",
      rightsLead: "Según la Agència Catalana del Consum (página actualizada el 2 de enero de 2026) y el artículo 20 de la Ley 18/2017:",
      rights: [
        `**Precio original y precio rebajado:** los artículos rebajados deben estar diferenciados y mostrar el precio original y el rebajado, o el porcentaje de descuento. El precio original es el más bajo que haya tenido ese producto en la tienda durante los ${n.originalPriceDays} días anteriores al inicio de las rebajas.`,
        "**Misma calidad y garantía:** los productos rebajados tienen la misma garantía que antes. No se pueden vender como rebajados productos defectuosos, deteriorados, desparejados u obsoletos.",
        "**Tarjeta:** si la tienda acepta tarjetas habitualmente, también debe aceptarlas durante las rebajas.",
        "**Cambios y devoluciones:** en compras en la tienda, no está obligada a cambiar un producto en perfecto estado salvo que lo anuncie; si lo ofrece, debe informar claramente de las condiciones (plazo, excepciones, devolución del dinero o vale y su caducidad). Si no dice nada, la tienda no está obligada a hacerlo.",
        `**Compras por internet:** tienes un mínimo de ${n.onlineDays} días para devolverlas, con las excepciones que prevé la ley (productos personalizados, los que se estropean con rapidez, entradas con fecha, etc.).`,
        `**Tickets y reclamaciones:** guarda el ticket o la factura hasta el final de la garantía. Si el producto no es conforme, pide la hoja de reclamación; si en ${n.complaintDays} días no tienes respuesta o no es satisfactoria, puedes acudir al servicio público de consumo de tu municipio.`,
      ],
      spainH: "¿Y en el resto de España?",
      spain: [
        `La ley del Estado (Ley 7/1996 de ordenación del comercio minorista, artículo 25, según el Real Decreto-ley 20/2012) dice que las rebajas pueden hacerse en los periodos estacionales de mayor interés comercial según el criterio de cada comerciante y que la duración de cada periodo «será decidida libremente por cada comerciante». Es decir, desde 2012 el Estado no fija un calendario de rebajas. Los días de apertura de las tiendas sí los fija cada comunidad: en ${b2link("shopsSpainDecember", L, "tiendas abiertas en diciembre por comunidad")} están los de Navidad.`,
      ],
      faqH: "Preguntas frecuentes",
      faq: [
        { question: "¿Cuándo empiezan las rebajas de invierno de 2027 en Cataluña?", answer: `La ley no fija una fecha: cada tienda decide cuándo empiezan y debe anunciarlo. La Generalitat recomienda unas fechas cada año; la última que hemos encontrado es del ${recDate} (del ${recFrom} al ${recTo}) y para 2027 no hemos encontrado ninguna. El primer domingo de 2027 con tiendas abiertas es el ${first}.` },
        { question: "¿Cuándo terminan las rebajas de invierno de 2027?", answer: `No hay una fecha final oficial para todas las tiendas: cada establecimiento debe anunciar el periodo que dura su venta en rebajas. La recomendación de la Generalitat de ${recDate} terminaba el ${recTo}, pero es de otro año.` },
        { question: `¿Abren las tiendas el ${firstDm} de 2027?`, answer: `Pueden abrir: el ${first} es uno de los ocho días del calendario general de apertura comercial de 2027 (Orden EMT/89/2026). Pueden abrir, no deben abrir; cada tienda decide.` },
        { question: "¿Tienen las tiendas que aceptar cambios y devoluciones en las rebajas?", answer: "No, si el producto está en perfecto estado y la tienda no ha anunciado que admite cambios. Si los admite, debe explicar las condiciones. Las compras por internet tienen al menos 14 días para devolverlas." },
        { question: "¿Cuál debe ser el precio «original» de un artículo rebajado?", answer: `El más bajo que haya tenido ese producto en la tienda durante los ${n.originalPriceDays} días anteriores al inicio de las rebajas, según la Agència Catalana del Consum.` },
        { question: "¿Puede una tienda decir que en rebajas no acepta tarjeta?", answer: "No: si acepta tarjetas habitualmente, no puede limitar su uso durante las rebajas." },
        { question: "¿Hay una fecha oficial de rebajas para toda España?", answer: "No. La ley estatal deja que cada comerciante elija cuándo hace rebajas y cuánto duran (Ley 7/1996, artículo 25, desde el Real Decreto-ley 20/2012)." },
      ],
      callout: "Ley 18/2017 (texto consolidado del BOE), Agència Catalana del Consum, CCAM, nota de prensa de la Generalitat, Orden EMT/89/2026 y Ley 7/1996. No hay ninguna fecha de inicio o fin de las rebajas de 2027 en un texto oficial.",
    };
  }

  return {
    lead: `**Winter sales 2027 in Catalonia have no start or end date set by law: each shop decides whether to hold them and when, and must announce them as "sales" with the exact period.** The Generalitat's retail advisory council is meant to recommend dates every year; the latest recommendation we found published is from ${recDate} (${recFrom} to ${recTo}) and we found none for 2027, so we give no start or end day. What is official is that the first general shop-opening day of 2027 is **${first}**, which the Generalitat labels "Rebaixes d'hivern" (winter sales).`,
    factsTitle: "Winter sales 2027 in Catalonia at a glance",
    facts: [
      { label: "Start and end", value: "Not set by law: each shop decides and announces them" },
      { label: "Latest recommended dates we found", value: `${recFrom} to ${recTo} (retail advisory council, ${recDate}). None for 2027 that we could find` },
      { label: "First Sunday with shops open in 2027", value: `${first} (general calendar, Order EMT/89/2026)` },
      { label: "2027 municipal Sundays", value: `Not published yet; where a council chooses none, ${secondDm} and 5 December` },
      { label: "Original price", value: `The lowest of the ${n.originalPriceDays} days before the sales began` },
      { label: "Exchanges and refunds", value: "A shop need not offer them for a product in good condition, unless it says it does" },
    ],
    lawH: "What the law says about sales dates in Catalonia",
    law: [
      `Article 20 of Law 18/2017 on commerce, services and fairs says the usual sales seasons are winter and summer and that every year, before 30 September, the Generalitat's advisory council on commerce must **recommend** the start and end dates of next year's seasons. It is a recommendation, not an obligation: the Catalan Consumer Agency puts it as "shops may decide freely whether or not to hold sales; they are not obliged to".`,
      `What the law does require is that the sale be announced as "sales" with the detail of the period, that the discounted goods were on sale in that shop for at least one month just before, and that no defective goods or units bought for the sales are included. So the period that counts for a shop is the one it has announced.`,
      `The dates most repeated in the media (such as "7 January to 6 March") do not come from any official text we could read. The only recommendation we found is the one of ${recDate}: ${recFrom} to ${recTo}. We do not know whether the council has approved another for 2027; we will look again before the sales.`,
    ],
    sundaysH: "Which Sunday shops open in the January 2027 sales",
    sundays: [
      `The general shop-opening calendar for 2027 (Order EMT/89/2026, article 1) starts on **${first}**. The Generalitat's press note explaining the calendar marks it "Rebaixes d'hivern"; the order itself does not. That shops may open does not mean they must open, nor that their sales start that day.`,
      `Each municipality adds two days of its own a year. The 2027 ones, Barcelona's included, have not been published yet; where a council chooses none, ${secondDm} and 5 December apply by default (article 5). All the days and the exceptions are in ${shops("shops open on Sundays and holidays in Catalonia")}.`,
    ],
    sundaysCaption: "January 2027 Sundays when shops may open",
    sundaysHead: ["Day", "What it is", "Source"],
    sundaysRows: [
      [first, "General shop-opening calendar", "Order EMT/89/2026, art. 1"],
      [second, "Default municipal day, where the council has chosen none", "Order EMT/89/2026, art. 5"],
    ],
    sundaysNote: "2027 days read in DOGC no. 9674 (28 May 2026). Each municipality's two own days for 2027 are not published yet.",
    rightsH: "Your rights in the sales: price, exchanges and guarantee",
    rightsLead: "According to the Catalan Consumer Agency (page updated on 2 January 2026) and article 20 of Law 18/2017:",
    rights: [
      `**Original and reduced price:** sale items must be set apart and show the original and the reduced price, or the percentage off. The original price is the lowest the product had in that shop during the ${n.originalPriceDays} days before the sales began.`,
      "**Same quality and guarantee:** sale goods keep the same guarantee as before. Defective, damaged, odd or obsolete goods cannot be sold as sale items.",
      "**Cards:** if the shop normally accepts cards, it must accept them during the sales too.",
      "**Exchanges and refunds:** for in-store purchases a shop need not exchange a product in perfect condition unless it announces that it does; if it offers it, it must state the conditions clearly (deadline, exceptions, money back or voucher and its expiry). If it says nothing, the shop is not obliged to.",
      `**Online purchases:** you have at least ${n.onlineDays} days to return them, with the exceptions the law provides (made-to-order goods, perishables, dated tickets, and so on).`,
      `**Receipts and complaints:** keep the receipt or invoice until the guarantee ends. If the product is not as it should be, ask for the complaint form; if you get no answer in ${n.complaintDays} days or the answer is unsatisfactory, go to your town's public consumer service.`,
    ],
    spainH: "And in the rest of Spain?",
    spain: [
      `The State law (Law 7/1996 on retail trade, article 25, as amended by Royal Decree-law 20/2012) says sales may take place in the seasonal periods of greatest commercial interest at each trader's discretion and that the length of each sales period "shall be decided freely by each trader". So since 2012 the State has not set a sales calendar. Shop-opening days are set region by region: the Christmas ones are in ${b2link("shopsSpainDecember", L, "shops open in December, region by region")}.`,
    ],
    faqH: "Frequently asked questions",
    faq: [
      { question: "When do the 2027 winter sales start in Catalonia?", answer: `The law sets no date: each shop decides when its sales start and must announce it. The Generalitat recommends dates every year; the latest we found is from ${recDate} (${recFrom} to ${recTo}) and we found none for 2027. The first Sunday of 2027 with shops open is ${first}.` },
      { question: "When do the 2027 winter sales end?", answer: `There is no official end date for all shops: each one must announce the period its sale lasts. The Generalitat's recommendation of ${recDate} ended on ${recTo}, but it belongs to another year.` },
      { question: `Are shops open on ${firstDm} 2027?`, answer: `They may open: ${first} is one of the eight days of the general shop-opening calendar for 2027 (Order EMT/89/2026). They may, not must; each shop decides.` },
      { question: "Do shops have to accept exchanges and refunds in the sales?", answer: "No, if the product is in perfect condition and the shop has not announced that it accepts exchanges. If it does, it must explain the conditions. Online purchases have at least 14 days for returns." },
      { question: "What must the \"original\" price of a sale item be?", answer: `The lowest the product had in that shop during the ${n.originalPriceDays} days before the sales began, according to the Catalan Consumer Agency.` },
      { question: "Can a shop say it does not accept cards during the sales?", answer: "No: if it normally accepts cards, it cannot limit their use during the sales." },
      { question: "Is there an official sales date for all of Spain?", answer: "No. State law lets each trader choose when to hold sales and how long they last (Law 7/1996, article 25, since Royal Decree-law 20/2012)." },
    ],
    callout: "Law 18/2017 (BOE consolidated text), Catalan Consumer Agency, CCAM, the Generalitat's press note, Order EMT/89/2026 and Law 7/1996. No official text gives a start or end date for the 2027 sales.",
  };
}

export function buildWinterSalesBody(L: Locale): Block[] {
  const t = copy(L);
  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    ...h2(t.lawH, ...t.law),
    ...h2(t.sundaysH, ...t.sundays),
    table(t.sundaysCaption, t.sundaysHead, t.sundaysRows, t.sundaysNote),
    ...paras(calendarLine(L)),
    ...h2(t.rightsH, t.rightsLead),
    list(...t.rights),
    ...h2(t.spainH, ...t.spain),
    ...h2(t.faqH),
    faq(t.faq),
    callout("official", verifiedLine(L, W.asOf), t.callout),
    ...b2Related(["shops", "barcelonaWinter", "shopsSpainDecember", "barcelonaDecember", "newYear", "reis", "holidayToday"], L),
  ];
}

const META: Record<Locale, { title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    title: "Rebaixes d'hivern 2027 a Catalunya: què diu la llei, quin diumenge obren les botigues i els teus drets",
    seoTitle: "Rebaixes d'hivern 2027 a Catalunya: dates i drets",
    seoDescription: "La llei no fixa quan comencen les rebaixes: ho decideix cada botiga. Què recomana la Generalitat, el 3 de gener obren les botigues i els teus drets de preu i canvis.",
    excerpt: "Quan comencen les rebaixes d'hivern 2027 a Catalunya segons la llei, quin és el primer diumenge amb botigues obertes i què pots exigir: preu original, canvis, targeta i devolucions.",
  },
  es: {
    title: "Rebajas de enero 2027 en Cataluña: qué dice la ley, qué domingo abren las tiendas y tus derechos",
    seoTitle: "Rebajas de enero 2027 en Cataluña: fechas y derechos",
    seoDescription: "La ley no fija cuándo empiezan las rebajas: lo decide cada tienda. Qué recomienda la Generalitat, el 3 de enero abren las tiendas y tus derechos de precio y cambios.",
    excerpt: "Cuándo empiezan las rebajas de invierno de 2027 en Cataluña según la ley, cuál es el primer domingo con tiendas abiertas y qué puedes exigir: precio original, cambios, tarjeta y devoluciones.",
  },
  en: {
    title: "Winter sales 2027 in Barcelona and Catalonia: what the law says, which Sunday shops open and your rights",
    seoTitle: "Winter sales 2027 in Barcelona and Catalonia: dates and rights",
    seoDescription: "The law does not set when the sales start: each shop decides. What the Generalitat recommends, shops open on 3 January, and your rights on price and exchanges.",
    excerpt: "When the 2027 winter sales start in Catalonia under the law, the first Sunday with shops open, and what you can demand: original price, exchanges, cards and refunds.",
  },
};

export const WINTER_SALES_GUIDE: B2Article = {
  key: "winterSales",
  entryKey: "guide-winter-sales-catalonia",
  categoryKey: "public-services",
  sources: WINTER_SALES_SOURCES,
  heroKey: "barcelona-hub-passeig-gracia",
  heroAlt: {
    ca: "El passeig de Gràcia de Barcelona, amb la Casa Milà al fons",
    es: "El paseo de Gracia de Barcelona, con la Casa Milà al fondo",
    en: "Passeig de Gràcia in Barcelona, with Casa Milà in the background",
  },
  heroCaption: {
    ca: "Passeig de Gràcia, un dels grans eixos comercials de Barcelona.",
    es: "Paseo de Gracia, uno de los grandes ejes comerciales de Barcelona.",
    en: "Passeig de Gràcia, one of Barcelona's main shopping streets.",
  },
  verifiedAt: W.asOf,
  publishedAt: "2026-11-25T18:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.winterSales[locale], ...META[locale], blocks: buildWinterSalesBody(locale) }]),
  ) as B2Article["editions"],
};
