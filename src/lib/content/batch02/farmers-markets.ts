import type { Block } from "@/lib/content/blocks";
import { LOCALES, type Locale } from "@/lib/i18n/config";

import { B2_PATHS, b2Related, callout, faq, h2, keyFacts, lead, list, steps, table, verifiedLine, type B2Article, type B2Source } from "./shared";

/**
 * Farmers' markets and the Generalitat's "Venda de Proximitat" label: where
 * the official list of producers who sell direct is, how to read it, and how
 * to tell an accredited stall, shop or menu from a merely "local" one
 * (17 Nov 2026).
 *
 * Why this page: internal site search, 28 days to 17 Nov 2026, "mercats de
 * pagès de Catalunya" and "mercats agraris de Catalunya" (2× each); the site
 * had nothing on it. The Department's pages are the only official source
 * and they are scattered (a concept page, an Excel, two PDFs, a news item).
 *
 * FARMERS_AS_OF 2026-11-17. Every fact was read that day (curl with a browser
 * User-Agent; fact pack research_notes/mercats-pages-proximitat.md):
 *
 *  - Departament d'Agricultura, "Productors i productes": «Fins a la data
 *    d'actualització s'han adherit a la Venda de Proximitat 2410 productors i
 *    només es fa difusió de les dades de les persones que han donat el seu
 *    consentiment previ. Data d'actualització: 02.07.2026». The Excel's title
 *    reads «LLISTAT DE PRODUCTORS ADHERITS A LA VENDA DE PROXIMITAT FINS A 2
 *    de juliol de 2026»; 2,410 rows; columns Nom productor, Num. acreditació,
 *    NIF, Adreça, Codi postal, Municipi, Comarca, Codi Comarca, Productes,
 *    Grups Productes, Venda directa, Venda circuit curt, Telefon, Email,
 *    Marca comercial. The per-comarca counts and the 2,099 / 1,589 modality
 *    counts below were computed from that file on 17 Nov 2026.
 *  - "Concepte": «La venda de proximitat inclou la venda directa i la venda en
 *    circuit curt»; the logo shows the decree, the Generalitat and the
 *    modality.
 *  - "Preguntes i respostes" (PDF, page updated 05.05.2026): «no es té en
 *    compte la distància geogràfica, sinó el nombre d'intermediaris, que com a
 *    màxim pot ser un»; only holders of farms in the Registre d'Explotacions
 *    Agràries, through the DUN; food and non-food products (wood, cork,
 *    ornamental plants, cut flowers), not wild-gathered produce or game;
 *    livestock rules (beef and pigs 4 months, poultry 40 days fattened in
 *    Catalonia, slaughter within 3 hours' transport); annual accreditation;
 *    voluntary and free; controls by the Department, no outside certifier;
 *    «la menció "producte de proximitat", com a tal, no està regulada»; online
 *    sales by the producer are direct sales; a shop buying from accredited
 *    producers sells «Venda de Proximitat - Circuit Curt».
 *  - "Guia ràpida d'identificació" (logo guide, PDF): accreditation and logo
 *    «en un lloc visible i preferent» (farm entrance, farm shop, market or fair
 *    stall, street sale, website); market signs carry «la indicació "Mercat de
 *    venda directa"», and an all-accredited market may use one global sign;
 *    circuit-curt products carry a label with the producer's name, town and
 *    the logo, separated from other products; never on the shop door or a
 *    window of mixed goods; in restaurants, next to the dish.
 *  - News of 02.12.2025 on Decret llei 21/2025: «També es permet l'ús del
 *    logotip de venda de proximitat sense la indicació del tipus de circuit».
 *  - Contact page: «Per a consultes, queixes o suggeriments»,
 *    vendadeproximitat.daam@gencat.cat.
 *
 * Not printed: any producer's name, phone, e-mail or NIF (personal data: the
 * official file is linked instead), any list of Barcelona's farmers' markets
 * with days and squares (no current official list was found), the
 * Department's phone line (contact page dated 2017), and product totals from
 * the "Grups Productes" column (it covers crop groups only).
 *
 * Re-read by FARMERS_REREAD_BY (a test fails after it): the Excel is updated
 * a few times a year, so the count and the comarca table move with it.
 */
export const FARMERS_AS_OF = "2026-11-17";
export const FARMERS_REREAD_BY = "2027-02-17";

const VP = "https://agricultura.gencat.cat/ca/ambits/alimentacio/segells-qualitat-diferenciada/venda-proximitat";
const FILES = "https://agricultura.gencat.cat/web/.content/04-alimentacio/venda-proximitat/enllacos-documents";
export const FARMERS_URLS = {
  home: `${VP}/`,
  producers: `${VP}/dar_productors_adherits_venda_proximitat/`,
  list: `${FILES}/productors/fitxers-binaris/productors-adherits-venda-proximitat.xlsx`,
  concept: `${VP}/dar_concepte/`,
  faq: `${FILES}/fitxers-binaris/preguntes_respostes_decret_acreditacio_venda_proximitat.pdf`,
  logoGuide: `${FILES}/fitxers-binaris/guia-us-logo-proximitat-DARP.pdf`,
  identity: `${VP}/dar_identitat_visual/`,
  contact: `${VP}/dar_concepte/contacte/`,
  law2025: "https://agricultura.gencat.cat/ca/detalls/Noticia/La-Generalitat-flexibilitza-la-normativa-de-la-venda-de-proximitat-per-donar-suport-al-sector-agrari",
  decree: "https://portaljuridic.gencat.cat/eli/es-ct/d/2013/01/08/24",
  decree2019: "https://portaljuridic.gencat.cat/eli/es-ct/d/2019/12/03/254",
} as const;

/** The Department's headline figure and the file's date (page and file title agree). */
export const FARMERS_LIST = { producers: 2410, date: "2026-07-02", direct: 2099, shortChain: 1589, noComarca: 8 } as const;

/** Producers per comarca as the 2 July 2026 file gives them (its comarca column; no Lluçanès row in it). */
export const FARMERS_BY_COMARCA: readonly (readonly [string, number])[] = [
  ["Segrià", 155], ["Baix Ebre", 123], ["Maresme", 114], ["Baix Llobregat", 107], ["Noguera", 96], ["Alt Empordà", 96],
  ["Osona", 91], ["Alt Penedès", 83], ["Vallès Oriental", 83], ["Bages", 79], ["Baix Camp", 78], ["Garrotxa", 78],
  ["Baix Empordà", 65], ["Terra Alta", 64], ["Alt Camp", 63], ["Barcelonès", 61], ["Garrigues", 59], ["Vallès Occidental", 57],
  ["Urgell", 57], ["Pallars Jussà", 55], ["Ribera d'Ebre", 54], ["Anoia", 52], ["Berguedà", 51], ["Selva", 47],
  ["Pla d'Urgell", 45], ["Montsià", 44], ["Priorat", 42], ["Solsonès", 42], ["Gironès", 41], ["Tarragonès", 36],
  ["Cerdanya", 36], ["Baix Penedès", 33], ["Pallars Sobirà", 33], ["Alt Urgell", 29], ["Conca de Barberà", 28], ["Moianès", 27],
  ["Ripollès", 26], ["Segarra", 24], ["Alta Ribagorça", 19], ["Pla de l'Estany", 13], ["Garraf", 12], ["Aran", 4],
];

const SOURCES: B2Source[] = [
  { name: "Venda de proximitat", url: FARMERS_URLS.home, publisher: "Departament d'Agricultura, Ramaderia, Pesca i Alimentació" },
  { name: "Productors i productes: productors adherits a la venda de proximitat", url: FARMERS_URLS.producers, publisher: "Departament d'Agricultura, Ramaderia, Pesca i Alimentació" },
  { name: "Llistat de productors adherits a la venda de proximitat (Excel, 2 de juliol de 2026)", url: FARMERS_URLS.list, publisher: "Departament d'Agricultura, Ramaderia, Pesca i Alimentació" },
  { name: "Venda de proximitat: concepte", url: FARMERS_URLS.concept, publisher: "Departament d'Agricultura, Ramaderia, Pesca i Alimentació" },
  { name: "Preguntes freqüents sobre la venda de proximitat (PDF)", url: FARMERS_URLS.faq, publisher: "Departament d'Agricultura, Ramaderia, Pesca i Alimentació" },
  { name: "Guia ràpida d'identificació de la venda de proximitat (PDF)", url: FARMERS_URLS.logoGuide, publisher: "Departament d'Agricultura, Ramaderia, Pesca i Alimentació" },
  { name: "La Generalitat flexibilitza la normativa de la venda de proximitat (Decret llei 21/2025)", url: FARMERS_URLS.law2025, publisher: "Departament d'Agricultura, Ramaderia, Pesca i Alimentació" },
  { name: "Decret 24/2013, de 8 de gener, sobre l'acreditació de la venda de proximitat de productes agroalimentaris", url: FARMERS_URLS.decree, publisher: "Portal Jurídic de Catalunya (DOGC)" },
  { name: "Decret 254/2019, de 3 de desembre, pel qual es modifica el Decret 24/2013", url: FARMERS_URLS.decree2019, publisher: "Portal Jurídic de Catalunya (DOGC)" },
];

/** A Markdown link. */
const a = (href: string, label: string) => `[${label}](${href})`;

const n = (value: number, locale: Locale) => value.toLocaleString(locale === "en" ? "en-GB" : "es-ES", { useGrouping: true }).replace(/ /g, " ");
/** "2.410" in ca/es (Intl leaves four-digit numbers ungrouped in es-ES), "2,410" in en. */
const big = (value: number, locale: Locale) => (locale === "en" ? n(value, locale) : String(value).replace(/\B(?=(\d{3})+(?!\d))/g, "."));

export const FARMERS_META: Record<Locale, { title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    title: "Mercats de pagès i venda de proximitat a Catalunya: on comprar directament al pagès",
    seoTitle: "Mercats de pagès a Catalunya: venda de proximitat",
    seoDescription: "El llistat oficial de la Generalitat té 2.410 pagesos amb el segell de venda de proximitat. Com trobar els de la teva comarca i com reconèixer el segell a la parada.",
    excerpt: "On és el llistat oficial de pagesos que venen directament, quants n'hi ha a cada comarca i com distingir el segell Venda de Proximitat d'un simple «producte local».",
  },
  es: {
    title: "Mercados payeses y venta de proximidad en Cataluña: dónde comprar directamente al payés",
    seoTitle: "Mercados payeses en Cataluña: venta de proximidad",
    seoDescription: "La lista oficial de la Generalitat tiene 2.410 payeses con el sello de venta de proximidad. Cómo encontrar los de tu comarca y reconocer el sello en el puesto.",
    excerpt: "Dónde está la lista oficial de payeses que venden directamente, cuántos hay en cada comarca y cómo distinguir el sello Venda de Proximitat de un simple «producto local».",
  },
  en: {
    title: "Farmers' markets in Catalonia: buying direct with the Venda de Proximitat label",
    seoTitle: "Farmers' markets in Catalonia: the official label",
    seoDescription: "The Generalitat's official list has 2,410 farmers with its local-sale label. How to find the ones in your county and how to spot the official label at a stall.",
    excerpt: "Where the official list of farmers who sell direct is, how many there are in each county, and how to tell the Venda de Proximitat label from a plain \"local produce\" sign.",
  },
};

/** One body for the three editions: the same sections, tables and links in each. */
export function buildFarmersBody(locale: Locale): Block[] {
  const L = locale;
  const total = big(FARMERS_LIST.producers, L);
  const direct = big(FARMERS_LIST.direct, L);
  const short = big(FARMERS_LIST.shortChain, L);
  const comarcaRows = FARMERS_BY_COMARCA.map(([name, count]) => [name, String(count)]);

  const t = {
    ca: {
      lead: `**Per trobar pagesos que venen directament, el llistat oficial és el del segell Venda de Proximitat del Departament d'Agricultura: ${total} productors acreditats, amb dades a 2 de juliol de 2026, en un ${a(FARMERS_URLS.list, "fitxer Excel")} que pots filtrar per municipi, comarca i producte.** El segell el regula el Decret 24/2013 i garanteix que entre el pagès i tu hi ha com a molt un intermediari: «venda directa» si te'l ven el mateix productor, al mercat, a la finca o per internet, i «circuit curt» si passa per una sola botiga o un restaurant. En un mercat de pagès, busca a la parada el logotip i l'acreditació del productor, o el rètol «Mercat de venda directa» si tot el mercat és de pagesos acreditats. Dir «producte de proximitat» o «de km 0», sense el logotip, no és cap garantia oficial.`,
      factsTitle: "La venda de proximitat en sis respostes",
      facts: [
        { label: "Què és", value: "Un segell oficial de la Generalitat per al pagès que ven la seva pròpia producció, sense intermediaris o amb un de sol" },
        { label: "Llistat oficial", value: `${total} productors adherits (Departament d'Agricultura, 2 de juliol de 2026)` },
        { label: "Venda directa", value: "Te'l ven el mateix pagès: a la parada, a la finca, a la seva botiga o per internet" },
        { label: "Circuit curt", value: "Hi ha un sol intermediari: una botiga o un restaurant que compra al pagès acreditat" },
        { label: "Què no compta", value: "La distància: el segell mira el nombre d'intermediaris, no els quilòmetres" },
        { label: "Norma", value: "Decret 24/2013, modificat pel Decret 254/2019 i el Decret llei 21/2025" },
      ],
      listH: "On és el llistat oficial de pagesos i com fer-lo servir",
      list: [
        `El Departament d'Agricultura publica a la pàgina ${a(FARMERS_URLS.producers, "Productors i productes")} un Excel amb els productors adherits a la Venda de Proximitat. Segons la pàgina, fins al 2 de juliol de 2026 s'hi havien adherit ${total} productors, i només se'n difonen les dades dels qui hi han donat el consentiment.`,
        "Cada fila és un productor o una agrupació de productors, amb aquestes dades:",
      ],
      listItems: [
        "el nom i, si en té, la marca comercial;",
        "el número d'acreditació, del tipus VP/P/0000/2025;",
        "l'adreça, el codi postal, el municipi i la comarca;",
        "els productes (per exemple, horta, fruita, oli, formatge, vi o mel) i el grup de productes;",
        "si fa venda directa, venda en circuit curt o totes dues;",
        "el telèfon i el correu electrònic de contacte.",
      ],
      howTitle: "Trobar un pagès acreditat a prop teu",
      how: [
        { title: "Descarrega el fitxer", text: `Obre la pàgina ${a(FARMERS_URLS.producers, "Productors i productes")} del Departament i baixa't l'Excel del llistat.` },
        { title: "Filtra per comarca o municipi", text: "Fes servir els filtres de les columnes «Comarca» o «Municipi». La taula de sota et diu quants productors hi ha a cada comarca." },
        { title: "Tria el producte", text: "Filtra la columna «Productes» per paraula: formatge, oli, ous, mel, vi, horta, fruita…" },
        { title: "Mira com ven", text: "Les columnes «Venda directa» i «Venda circuit curt» diuen si el pots comprar al mateix pagès o també a botigues i restaurants." },
        { title: "Contacta-hi", text: "El fitxer dona el telèfon i el correu de cada productor: pregunta-li on i quins dies ven, a quin mercat va o si ven a la finca." },
      ],
      comarcaH: "Quants pagesos acreditats hi ha a cada comarca",
      comarcaIntro: [
        `Amb el fitxer del 2 de juliol de 2026: ${direct} productors hi consten amb venda directa i ${short} amb venda en circuit curt (molts fan totes dues). Les comarques són les que diu el fitxer, i ${FARMERS_LIST.noComarca} files no en tenen.`,
      ],
      comarcaCaption: "Productors adherits a la Venda de Proximitat per comarca (2 de juliol de 2026)",
      comarcaHead: ["Comarca", "Productors"],
      comarcaNote: "Font: Departament d'Agricultura, llistat de productors adherits (Excel), consultat el 17 de novembre de 2026. Recompte fet per catalunyainfo.com a partir de la columna «Comarca».",
      labelH: "Com reconèixer el segell oficial",
      label: [
        "El logotip de Venda de Proximitat és una fletxa que envolta el text i acaba en quatre ratlles, al costat del nom del decret i de la Generalitat. El subtítol diu la modalitat, «venda directa» o «circuit curt». Des del Decret llei 21/2025 també es pot fer servir el logotip genèric, sense dir la modalitat.",
        `El productor acreditat ha d'exhibir el logotip i el seu document d'acreditació «en un lloc visible i preferent», sigui on sigui que vengui (${a(FARMERS_URLS.logoGuide, "guia d'identificació del Departament")}).`,
      ],
      whereCaption: "On has de veure el segell, segons on compris",
      whereHead: ["On compres", "Què hi has de veure"],
      whereRows: [
        ["Parada d'un mercat de pagès o d'una fira", "El logotip i l'acreditació del productor a la parada. Els rètols del mercat porten la indicació «Mercat de venda directa». Si tot el mercat és de pagesos acreditats, n'hi pot haver un de sol per a tot el mercat"],
        ["A la finca", "El rètol de venda directa a l'entrada de l'explotació"],
        ["Botiga o agrobotiga", "Cada producte acreditat, amb una etiqueta amb el nom del pagès, el seu poble i el logotip de circuit curt, separat de la resta. El logotip no pot anar a la porta de la botiga ni en un aparador amb productes barrejats"],
        ["Bar o restaurant", "El logotip al costat del plat concret que porta el producte, a la carta o en un document que l'acompanya"],
        ["Per internet", "És venda directa si ven el mateix productor. El logotip ha de sortir al web i als albarans"],
      ],
      whereNote: "Font: Departament d'Agricultura, guia ràpida d'identificació i preguntes freqüents, consultades el 17 de novembre de 2026.",
      guaranteeH: "Què garanteix el segell i què no",
      guaranteeCaption: "Què vol dir que un producte porti el segell Venda de Proximitat",
      guaranteeHead: ["Pregunta", "Resposta oficial"],
      guaranteeRows: [
        ["Quants intermediaris hi pot haver?", "Cap en la venda directa; un de sol en el circuit curt"],
        ["Vol dir que és d'aquí a prop?", "No mesura la distància: compta el nombre d'intermediaris"],
        ["Qui el pot fer servir?", "Només qui té una explotació agrària inscrita al registre de Catalunya i fa la declaració agrària (DUN). Un artesà sense explotació pròpia, no"],
        ["Quins productes?", "Aliments i també fusta, suro, planta ornamental i flor tallada. No els productes silvestres recollits al bosc ni la caça"],
        ["I la carn?", "Animals nascuts i engreixats a l'explotació, amb excepcions: vedella i porc, com a mínim 4 mesos engreixats a Catalunya, i aviram, 40 dies; sacrificats a 3 hores de transport com a màxim"],
        ["Elaborats (formatge, conserves, embotit)?", "Sí, si la matèria primera surt de l'explotació. La primera transformació i l'envasat els pot fer un tercer si el producte continua sent del pagès"],
        ["Qui ho controla?", "El Departament d'Agricultura, amb controls lligats a la declaració agrària. No cal cap certificadora privada"],
        ["Dura per sempre?", "No: l'acreditació és anual i el pagès l'ha de renovar amb la declaració de cada any"],
      ],
      guaranteeNote: "Font: Departament d'Agricultura, preguntes freqüents sobre la venda de proximitat (actualitzades el 5 de maig de 2026), consultades el 17 de novembre de 2026.",
      localH: "«Producte de proximitat» o «km 0» no és el mateix",
      local: [
        "La menció «producte de proximitat» com a tal no està regulada: qualsevol la pot posar, sempre que el que diu l'etiqueta sigui cert. El logotip de Venda de Proximitat, en canvi, està registrat i només el pot fer servir qui compleix el decret. Si vols la garantia oficial, busca el logotip i el nom del pagès, no la paraula.",
        "El segell és compatible amb altres segells, públics o privats, com la producció ecològica o una denominació d'origen: un producte en pot portar més d'un.",
      ],
      marketsH: "I els mercats de pagès de la meva ciutat?",
      markets: [
        "Els mercats de pagès els organitzen els ajuntaments i les associacions de productors, cadascun amb els seus dies i places, i la Generalitat no en publica cap calendari conjunt al web de la venda de proximitat. Per saber-ne els dies, consulta el teu ajuntament o pregunta directament als pagesos del llistat de la teva comarca, que et diran a quins mercats van.",
        "Al mercat, el que distingeix una parada de pagès acreditat d'una de revenedor és el segell: el logotip i l'acreditació a la vista, o el rètol «Mercat de venda directa» si tot el mercat és de productors acreditats.",
      ],
      doubtH: "Si veus un mal ús del segell",
      doubt: [
        `El Departament es reserva el dret de fer controls i inspeccions, i atén consultes, queixes i suggeriments a la bústia ${a(FARMERS_URLS.contact, "de la venda de proximitat")}, vendadeproximitat.daam@gencat.cat. Si ets pagès i t'hi vols adherir, es fa amb la declaració única agrària (DUN), és voluntari i no costa res (${a(FARMERS_URLS.faq, "preguntes freqüents")}).`,
      ],
      tipTitle: "Pregunta pel número d'acreditació",
      tip: "Cada pagès adherit té un número del tipus VP/P/0000/2025, que surt al seu document d'acreditació i al llistat oficial. Si tens dubtes, demana-li'l i busca'l a l'Excel.",
      faqH: "Preguntes freqüents",
      faq: [
        { question: "Hi ha un llistat oficial de mercats de pagès a Catalunya?", answer: `El que publica el Departament d'Agricultura és el llistat de productors acreditats amb el segell Venda de Proximitat: ${total} pagesos a 2 de juliol de 2026, amb el municipi, els productes i el contacte de cadascun. Els mercats els organitzen els ajuntaments i les associacions, i els dies es consulten a cada ajuntament.` },
        { question: "Què vol dir venda directa?", answer: "Que el producte te'l ven el mateix pagès que l'ha produït, sense cap intermediari: a la parada del mercat, a la finca, a la seva botiga o pel seu web." },
        { question: "Què és el circuit curt?", answer: "Que entre el pagès i tu hi ha un sol intermediari, com una botiga o un restaurant que li compra el producte. El producte ha de portar una etiqueta amb el nom del pagès, el seu poble i el logotip." },
        { question: "Com sé si una parada és d'un pagès de debò?", answer: "Busca el logotip de Venda de Proximitat i el document d'acreditació del productor exposats a la parada, o el rètol «Mercat de venda directa». També pots demanar-li el número d'acreditació i comprovar-lo al llistat oficial." },
        { question: "Producte de proximitat vol dir que és de la meva comarca?", answer: "No necessàriament. El segell oficial no mesura quilòmetres sinó intermediaris: com a màxim un. La frase «producte de proximitat» sense el logotip no està regulada." },
        { question: "On compro directament al pagès a la meva comarca?", answer: "Filtra la columna «Comarca» de l'Excel del Departament d'Agricultura: hi surten els productors acreditats, què venen i com contactar-hi. La taula d'aquesta pàgina et diu quants n'hi ha a cada comarca." },
        { question: "Quant costa l'acreditació per a un pagès?", answer: "Res. És voluntària i gratuïta, es demana amb la declaració única agrària (DUN) i s'ha de renovar cada any amb la declaració." },
      ],
      official: "Departament d'Agricultura, Ramaderia, Pesca i Alimentació (venda de proximitat: concepte, productors adherits i Excel, preguntes freqüents, guia d'identificació, Decret llei 21/2025) i Portal Jurídic de Catalunya (Decrets 24/2013 i 254/2019).",
    },
    es: {
      lead: `**Para encontrar payeses que venden directamente, la lista oficial es la del sello Venda de Proximitat del Departamento de Agricultura: ${total} productores acreditados, con datos a 2 de julio de 2026, en un ${a(FARMERS_URLS.list, "archivo Excel")} que puedes filtrar por municipio, comarca y producto.** El sello lo regula el Decreto 24/2013 y garantiza que entre el payés y tú hay como mucho un intermediario: «venta directa» si te lo vende el propio productor, en el mercado, en la finca o por internet, y «circuito corto» si pasa por una sola tienda o un restaurante. En un mercado payés, busca en el puesto el logotipo y la acreditación del productor, o el cartel «Mercat de venda directa» si todo el mercado es de payeses acreditados. Decir «producto de proximidad» o «de km 0», sin el logotipo, no es ninguna garantía oficial.`,
      factsTitle: "La venta de proximidad en seis respuestas",
      facts: [
        { label: "Qué es", value: "Un sello oficial de la Generalitat para el payés que vende su propia producción, sin intermediarios o con uno solo" },
        { label: "Lista oficial", value: `${total} productores adheridos (Departamento de Agricultura, 2 de julio de 2026)` },
        { label: "Venta directa", value: "Te lo vende el propio payés: en el puesto, en la finca, en su tienda o por internet" },
        { label: "Circuito corto", value: "Hay un solo intermediario: una tienda o un restaurante que compra al payés acreditado" },
        { label: "Qué no cuenta", value: "La distancia: el sello mira el número de intermediarios, no los kilómetros" },
        { label: "Norma", value: "Decreto 24/2013, modificado por el Decreto 254/2019 y el Decreto ley 21/2025" },
      ],
      listH: "Dónde está la lista oficial de payeses y cómo usarla",
      list: [
        `El Departamento de Agricultura publica en la página ${a(FARMERS_URLS.producers, "Productors i productes")} (en catalán) un Excel con los productores adheridos a la Venda de Proximitat. Según la página, hasta el 2 de julio de 2026 se habían adherido ${total} productores, y solo se difunden los datos de quienes han dado su consentimiento.`,
        "Cada fila es un productor o una agrupación de productores, con estos datos:",
      ],
      listItems: [
        "el nombre y, si la tiene, la marca comercial;",
        "el número de acreditación, del tipo VP/P/0000/2025;",
        "la dirección, el código postal, el municipio y la comarca;",
        "los productos (por ejemplo, huerta, fruta, aceite, queso, vino o miel) y el grupo de productos;",
        "si hace venta directa, venta en circuito corto o las dos;",
        "el teléfono y el correo electrónico de contacto.",
      ],
      howTitle: "Encontrar un payés acreditado cerca de ti",
      how: [
        { title: "Descarga el archivo", text: `Abre la página ${a(FARMERS_URLS.producers, "Productors i productes")} del Departamento y descarga el Excel de la lista.` },
        { title: "Filtra por comarca o municipio", text: "Usa los filtros de las columnas «Comarca» o «Municipi». La tabla de abajo te dice cuántos productores hay en cada comarca." },
        { title: "Elige el producto", text: "Filtra la columna «Productes» por palabra (en catalán): formatge (queso), oli (aceite), ous (huevos), mel (miel), vi (vino), horta (huerta), fruita (fruta)…" },
        { title: "Mira cómo vende", text: "Las columnas «Venda directa» y «Venda circuit curt» dicen si se lo puedes comprar al propio payés o también en tiendas y restaurantes." },
        { title: "Contacta", text: "El archivo da el teléfono y el correo de cada productor: pregúntale dónde y qué días vende, a qué mercado va o si vende en la finca." },
      ],
      comarcaH: "Cuántos payeses acreditados hay en cada comarca",
      comarcaIntro: [
        `Con el archivo del 2 de julio de 2026: ${direct} productores constan con venta directa y ${short} con venta en circuito corto (muchos hacen las dos). Las comarcas son las que dice el archivo, y ${FARMERS_LIST.noComarca} filas no tienen.`,
      ],
      comarcaCaption: "Productores adheridos a la Venda de Proximitat por comarca (2 de julio de 2026)",
      comarcaHead: ["Comarca", "Productores"],
      comarcaNote: "Fuente: Departamento de Agricultura, lista de productores adheridos (Excel), consultada el 17 de noviembre de 2026. Recuento hecho por catalunyainfo.com a partir de la columna «Comarca».",
      labelH: "Cómo reconocer el sello oficial",
      label: [
        "El logotipo de Venda de Proximitat es una flecha que rodea el texto y acaba en cuatro rayas, junto al nombre del decreto y de la Generalitat. El subtítulo indica la modalidad, «venda directa» o «circuit curt». Desde el Decreto ley 21/2025 también se puede usar el logotipo genérico, sin indicar la modalidad.",
        `El productor acreditado debe exhibir el logotipo y su documento de acreditación «en un lugar visible y preferente», venda donde venda (${a(FARMERS_URLS.logoGuide, "guía de identificación del Departamento")}, en catalán).`,
      ],
      whereCaption: "Dónde debes ver el sello, según dónde compres",
      whereHead: ["Dónde compras", "Qué debes ver"],
      whereRows: [
        ["Puesto de un mercado payés o de una feria", "El logotipo y la acreditación del productor en el puesto. Los carteles del mercado llevan la indicación «Mercat de venda directa». Si todo el mercado es de payeses acreditados, puede haber uno solo para todo el mercado"],
        ["En la finca", "El cartel de venta directa en la entrada de la explotación"],
        ["Tienda o agrotienda", "Cada producto acreditado, con una etiqueta con el nombre del payés, su pueblo y el logotipo de circuito corto, separado del resto. El logotipo no puede ir en la puerta de la tienda ni en un escaparate con productos mezclados"],
        ["Bar o restaurante", "El logotipo junto al plato concreto que lleva el producto, en la carta o en un documento que la acompaña"],
        ["Por internet", "Es venta directa si vende el propio productor. El logotipo debe aparecer en la web y en los albaranes"],
      ],
      whereNote: "Fuente: Departamento de Agricultura, guía rápida de identificación y preguntas frecuentes, consultadas el 17 de noviembre de 2026.",
      guaranteeH: "Qué garantiza el sello y qué no",
      guaranteeCaption: "Qué significa que un producto lleve el sello Venda de Proximitat",
      guaranteeHead: ["Pregunta", "Respuesta oficial"],
      guaranteeRows: [
        ["¿Cuántos intermediarios puede haber?", "Ninguno en la venta directa; uno solo en el circuito corto"],
        ["¿Significa que es de aquí cerca?", "No mide la distancia: cuenta el número de intermediarios"],
        ["¿Quién puede usarlo?", "Solo quien tiene una explotación agraria inscrita en el registro de Cataluña y hace la declaración agraria (DUN). Un artesano sin explotación propia, no"],
        ["¿Qué productos?", "Alimentos y también madera, corcho, planta ornamental y flor cortada. No los productos silvestres recogidos en el bosque ni la caza"],
        ["¿Y la carne?", "Animales nacidos y engordados en la explotación, con excepciones: ternera y cerdo, al menos 4 meses engordados en Cataluña, y aves, 40 días; sacrificados a 3 horas de transporte como máximo"],
        ["¿Elaborados (queso, conservas, embutido)?", "Sí, si la materia prima sale de la explotación. La primera transformación y el envasado los puede hacer un tercero si el producto sigue siendo del payés"],
        ["¿Quién lo controla?", "El Departamento de Agricultura, con controles ligados a la declaración agraria. No hace falta ninguna certificadora privada"],
        ["¿Dura para siempre?", "No: la acreditación es anual y el payés la debe renovar con la declaración de cada año"],
      ],
      guaranteeNote: "Fuente: Departamento de Agricultura, preguntas frecuentes sobre la venta de proximidad (actualizadas el 5 de mayo de 2026), consultadas el 17 de noviembre de 2026.",
      localH: "«Producto de proximidad» o «km 0» no es lo mismo",
      local: [
        "La mención «producto de proximidad» como tal no está regulada: cualquiera la puede poner, siempre que lo que dice la etiqueta sea cierto. El logotipo de Venda de Proximitat, en cambio, está registrado y solo lo puede usar quien cumple el decreto. Si quieres la garantía oficial, busca el logotipo y el nombre del payés, no la palabra.",
        "El sello es compatible con otros sellos, públicos o privados, como la producción ecológica o una denominación de origen: un producto puede llevar más de uno.",
      ],
      marketsH: "¿Y los mercados payeses de mi ciudad?",
      markets: [
        "Los mercados payeses los organizan los ayuntamientos y las asociaciones de productores, cada uno con sus días y plazas, y la Generalitat no publica ningún calendario conjunto en la web de la venta de proximidad. Para saber los días, consulta a tu ayuntamiento o pregunta directamente a los payeses de la lista de tu comarca, que te dirán a qué mercados van.",
        "En el mercado, lo que distingue un puesto de payés acreditado de uno de revendedor es el sello: el logotipo y la acreditación a la vista, o el cartel «Mercat de venda directa» si todo el mercado es de productores acreditados.",
      ],
      doubtH: "Si ves un mal uso del sello",
      doubt: [
        `El Departamento se reserva el derecho de hacer controles e inspecciones, y atiende consultas, quejas y sugerencias en el buzón ${a(FARMERS_URLS.contact, "de la venta de proximidad")}, vendadeproximitat.daam@gencat.cat. Si eres payés y te quieres adherir, se hace con la declaración única agraria (DUN), es voluntario y no cuesta nada (${a(FARMERS_URLS.faq, "preguntas frecuentes")}, en catalán).`,
      ],
      tipTitle: "Pregunta por el número de acreditación",
      tip: "Cada payés adherido tiene un número del tipo VP/P/0000/2025, que aparece en su documento de acreditación y en la lista oficial. Si tienes dudas, pídeselo y búscalo en el Excel.",
      faqH: "Preguntas frecuentes",
      faq: [
        { question: "¿Hay una lista oficial de mercados payeses en Cataluña?", answer: `Lo que publica el Departamento de Agricultura es la lista de productores acreditados con el sello Venda de Proximitat: ${total} payeses a 2 de julio de 2026, con el municipio, los productos y el contacto de cada uno. Los mercados los organizan los ayuntamientos y las asociaciones, y los días se consultan en cada ayuntamiento.` },
        { question: "¿Qué significa venta directa?", answer: "Que el producto te lo vende el mismo payés que lo ha producido, sin ningún intermediario: en el puesto del mercado, en la finca, en su tienda o por su web." },
        { question: "¿Qué es el circuito corto?", answer: "Que entre el payés y tú hay un solo intermediario, como una tienda o un restaurante que le compra el producto. El producto debe llevar una etiqueta con el nombre del payés, su pueblo y el logotipo." },
        { question: "¿Cómo sé si un puesto es de un payés de verdad?", answer: "Busca el logotipo de Venda de Proximitat y el documento de acreditación del productor expuestos en el puesto, o el cartel «Mercat de venda directa». También puedes pedirle el número de acreditación y comprobarlo en la lista oficial." },
        { question: "¿Producto de proximidad significa que es de mi comarca?", answer: "No necesariamente. El sello oficial no mide kilómetros sino intermediarios: como máximo uno. La frase «producto de proximidad» sin el logotipo no está regulada." },
        { question: "¿Dónde compro directamente al payés en mi comarca?", answer: "Filtra la columna «Comarca» del Excel del Departamento de Agricultura: aparecen los productores acreditados, qué venden y cómo contactarlos. La tabla de esta página te dice cuántos hay en cada comarca." },
        { question: "¿Cuánto cuesta la acreditación para un payés?", answer: "Nada. Es voluntaria y gratuita, se pide con la declaración única agraria (DUN) y se debe renovar cada año con la declaración." },
      ],
      official: "Departamento de Agricultura, Ganadería, Pesca y Alimentación (venta de proximidad: concepto, productores adheridos y Excel, preguntas frecuentes, guía de identificación, Decreto ley 21/2025; páginas en catalán) y Portal Jurídic de Catalunya (Decretos 24/2013 y 254/2019).",
    },
    en: {
      lead: `**To find farmers who sell direct, the official list is the one for the Generalitat's Venda de Proximitat label, kept by the Department of Agriculture: ${total} accredited producers, as of 2 July 2026, in an ${a(FARMERS_URLS.list, "Excel file")} you can filter by town, county and product.** The label is set by Decree 24/2013 and guarantees at most one intermediary between the farmer and you: "venda directa" (direct sale) when the producer sells to you in person, at a market, on the farm or online, and "circuit curt" (short chain) when it goes through a single shop or restaurant. At a farmers' market, look for the logo and the producer's accreditation on the stall, or a "Mercat de venda directa" sign when the whole market is made up of accredited farmers. A "local produce" or "km 0" claim without the logo is no official guarantee.`,
      factsTitle: "Direct sale in six answers",
      facts: [
        { label: "What it is", value: "An official Generalitat label for farmers selling their own produce, with no intermediary or just one" },
        { label: "Official list", value: `${total} producers signed up (Department of Agriculture, 2 July 2026)` },
        { label: "Direct sale", value: "The farmer sells to you: at a stall, on the farm, in their own shop or online" },
        { label: "Short chain", value: "One intermediary only: a shop or restaurant buying from the accredited farmer" },
        { label: "What does not count", value: "Distance: the label counts intermediaries, not kilometres" },
        { label: "Rules", value: "Decree 24/2013, amended by Decree 254/2019 and Decree-law 21/2025" },
      ],
      listH: "Where the official list of farmers is and how to use it",
      list: [
        `The Department of Agriculture publishes an Excel file of the producers signed up to Venda de Proximitat on its ${a(FARMERS_URLS.producers, "Productors i productes")} page (in Catalan). According to the page, ${total} producers had joined by 2 July 2026, and only the details of those who agreed to it are published.`,
        "Each row is a producer or a producer group, with these details:",
      ],
      listItems: [
        "the name and, where there is one, the brand;",
        "the accreditation number, in the form VP/P/0000/2025;",
        "the address, postcode, town and county (comarca);",
        "the products (vegetables, fruit, olive oil, cheese, wine or honey, for example) and the product group;",
        "whether they sell direct, through a short chain, or both;",
        "a contact phone number and e-mail address.",
      ],
      howTitle: "Finding an accredited farmer near you",
      how: [
        { title: "Download the file", text: `Open the Department's ${a(FARMERS_URLS.producers, "Productors i productes")} page and download the Excel list.` },
        { title: "Filter by county or town", text: "Use the filters on the \"Comarca\" or \"Municipi\" columns. The table below shows how many producers each county has." },
        { title: "Pick the product", text: "Filter the \"Productes\" column by a Catalan word: formatge (cheese), oli (oil), ous (eggs), mel (honey), vi (wine), horta (vegetables), fruita (fruit)…" },
        { title: "Check how they sell", text: "The \"Venda directa\" and \"Venda circuit curt\" columns tell you whether you can buy from the farmer in person or also in shops and restaurants." },
        { title: "Get in touch", text: "The file gives each producer's phone and e-mail: ask where and on which days they sell, which market they go to, or whether they sell on the farm." },
      ],
      comarcaH: "How many accredited farmers each county has",
      comarcaIntro: [
        `From the 2 July 2026 file: ${direct} producers are listed for direct sale and ${short} for short-chain sale (many do both). The counties are those the file gives, and ${FARMERS_LIST.noComarca} rows have none.`,
      ],
      comarcaCaption: "Producers signed up to Venda de Proximitat by county (2 July 2026)",
      comarcaHead: ["County (comarca)", "Producers"],
      comarcaNote: "Source: Department of Agriculture, list of producers signed up (Excel), checked on 17 November 2026. Count made by catalunyainfo.com from the \"Comarca\" column.",
      labelH: "How to recognise the official label",
      label: [
        "The Venda de Proximitat logo is an arrow wrapping round the text and ending in four stripes, next to the name of the decree and of the Generalitat. Its subtitle gives the type of sale, \"venda directa\" or \"circuit curt\". Since Decree-law 21/2025 the generic logo, without the type of sale, may also be used.",
        `An accredited producer must display the logo and their accreditation document "in a visible, prominent place" wherever they sell (${a(FARMERS_URLS.logoGuide, "the Department's identification guide")}, in Catalan).`,
      ],
      whereCaption: "Where you should see the label, depending on where you buy",
      whereHead: ["Where you buy", "What you should see"],
      whereRows: [
        ["A stall at a farmers' market or fair", "The logo and the producer's accreditation on the stall. The market's signs say \"Mercat de venda directa\". If the whole market is made up of accredited farmers, there may be one sign for all of it"],
        ["On the farm", "The direct-sale sign at the farm entrance"],
        ["A shop or farm shop", "Each accredited product carries a label with the farmer's name, their town and the short-chain logo, and is kept apart from other goods. The logo may not go on the shop door or on a window display of mixed goods"],
        ["A bar or restaurant", "The logo next to the specific dish that contains the product, on the menu or on a sheet that goes with it"],
        ["Online", "It is a direct sale if the producer sells it themselves. The logo must appear on the website and on delivery notes"],
      ],
      whereNote: "Source: Department of Agriculture, quick identification guide and frequently asked questions, checked on 17 November 2026.",
      guaranteeH: "What the label guarantees and what it does not",
      guaranteeCaption: "What it means when a product carries the Venda de Proximitat label",
      guaranteeHead: ["Question", "Official answer"],
      guaranteeRows: [
        ["How many intermediaries can there be?", "None for a direct sale; one only in a short chain"],
        ["Does it mean it comes from nearby?", "It does not measure distance: it counts intermediaries"],
        ["Who may use it?", "Only holders of a farm on Catalonia's farm register who file the annual farm declaration (DUN). A craft producer without a farm of their own may not"],
        ["Which products?", "Food, and also wood, cork, ornamental plants and cut flowers. Not wild produce gathered in the woods, nor game"],
        ["What about meat?", "Animals born and fattened on the farm, with exceptions: beef cattle and pigs fattened in Catalonia for at least 4 months, poultry for 40 days; slaughtered no more than 3 hours' transport away"],
        ["Processed food (cheese, preserves, charcuterie)?", "Yes, if the raw material comes from the farm. A third party may do the first processing and the packing, as long as the product still belongs to the farmer"],
        ["Who checks it?", "The Department of Agriculture, with checks tied to the farm declaration. No private certifier is needed"],
        ["Does it last for ever?", "No: accreditation is annual, and the farmer renews it with each year's declaration"],
      ],
      guaranteeNote: "Source: Department of Agriculture, frequently asked questions on direct sale (updated 5 May 2026), checked on 17 November 2026.",
      localH: "\"Local produce\" or \"km 0\" is not the same thing",
      local: [
        "The phrase \"local produce\" (producte de proximitat) is not regulated as such: anyone may use it, provided what the label says is true. The Venda de Proximitat logo, by contrast, is registered and only those who meet the decree may use it. If you want the official guarantee, look for the logo and the farmer's name, not the wording.",
        "The label can sit alongside other public or private labels, such as organic farming or a designation of origin: one product may carry more than one.",
      ],
      marketsH: "What about the farmers' markets in my town?",
      markets: [
        "Farmers' markets are run by town councils and producers' associations, each with its own days and squares, and the Generalitat publishes no combined calendar on its direct-sale website. To find the days, check your town council or ask the farmers on your county's list directly: they will tell you which markets they attend.",
        "At the market, what tells an accredited farmer's stall from a reseller's is the label: the logo and accreditation on display, or a \"Mercat de venda directa\" sign if the whole market is made up of accredited producers.",
      ],
      doubtH: "If you see the label misused",
      doubt: [
        `The Department reserves the right to carry out checks and inspections, and takes questions, complaints and suggestions at its ${a(FARMERS_URLS.contact, "direct-sale mailbox")}, vendadeproximitat.daam@gencat.cat. Farmers who want to join do so through the annual farm declaration (DUN); it is voluntary and free (${a(FARMERS_URLS.faq, "frequently asked questions")}, in Catalan).`,
      ],
      tipTitle: "Ask for the accreditation number",
      tip: "Every farmer signed up has a number in the form VP/P/0000/2025, printed on their accreditation document and in the official list. If in doubt, ask for it and look it up in the Excel file.",
      faqH: "Frequently asked questions",
      faq: [
        { question: "Is there an official list of farmers' markets in Catalonia?", answer: `What the Department of Agriculture publishes is the list of producers accredited with the Venda de Proximitat label: ${total} farmers as of 2 July 2026, with each one's town, products and contact details. Markets are run by town councils and associations, and their days are published by each council.` },
        { question: "What does direct sale (venda directa) mean?", answer: "That the farmer who grew or made the product sells it to you with no intermediary: at a market stall, on the farm, in their own shop or on their website." },
        { question: "What is a short chain (circuit curt)?", answer: "That there is a single intermediary between the farmer and you, such as a shop or restaurant that buys the product from them. The product must carry a label with the farmer's name, their town and the logo." },
        { question: "How do I know a stall is run by a real farmer?", answer: "Look for the Venda de Proximitat logo and the producer's accreditation document on display at the stall, or a \"Mercat de venda directa\" sign. You can also ask for the accreditation number and check it against the official list." },
        { question: "Does \"local produce\" mean it comes from my county?", answer: "Not necessarily. The official label does not measure kilometres but intermediaries: one at most. The phrase \"local produce\" without the logo is not regulated." },
        { question: "Where can I buy direct from farmers in my county?", answer: "Filter the \"Comarca\" column of the Department of Agriculture's Excel file: it lists the accredited producers, what they sell and how to contact them. The table on this page shows how many each county has." },
        { question: "How much does accreditation cost a farmer?", answer: "Nothing. It is voluntary and free, requested through the annual farm declaration (DUN), and renewed each year with the declaration." },
      ],
      official: "Department of Agriculture, Livestock, Fisheries and Food (direct sale: concept, producers signed up and Excel list, frequently asked questions, identification guide, Decree-law 21/2025; pages in Catalan) and Portal Jurídic de Catalunya (Decrees 24/2013 and 254/2019).",
    },
  }[L];

  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    ...h2(t.listH, ...t.list),
    list(...t.listItems),
    steps(t.howTitle, t.how),
    ...h2(t.comarcaH, ...t.comarcaIntro),
    table(t.comarcaCaption, t.comarcaHead, comarcaRows, t.comarcaNote),
    ...h2(t.labelH, ...t.label),
    table(t.whereCaption, t.whereHead, t.whereRows, t.whereNote),
    ...h2(t.guaranteeH),
    table(t.guaranteeCaption, t.guaranteeHead, t.guaranteeRows, t.guaranteeNote),
    ...h2(t.localH, ...t.local),
    ...h2(t.marketsH, ...t.markets),
    ...h2(t.doubtH, ...t.doubt),
    callout("tip", t.tipTitle, t.tip),
    { type: "heading", level: 2, text: t.faqH } as Block,
    faq(t.faq),
    callout("official", verifiedLine(L, FARMERS_AS_OF), t.official),
    ...b2Related(["calcots", "markets", "barcelonaHub"], L),
  ];
}

export const FARMERS_MARKETS: B2Article = {
  key: "farmersMarkets",
  entryKey: "guide-farmers-markets-venda-proximitat",
  categoryKey: "food",
  sources: SOURCES,
  heroKey: "mercat-pagesos-montserrat",
  heroAlt: {
    ca: "Parades amb carpes blanques d'un mercat de productors al passeig de l'Escolania, al monestir de Montserrat",
    es: "Puestos con carpas blancas de un mercado de productores en el paseo de la Escolania, en el monasterio de Montserrat",
    en: "White-tented stalls of a producers' market on Passeig de l'Escolania at Montserrat monastery",
  },
  heroCaption: {
    ca: "Mercat de productors al monestir de Montserrat.",
    es: "Mercado de productores en el monasterio de Montserrat.",
    en: "A producers' market at Montserrat monastery.",
  },
  verifiedAt: FARMERS_AS_OF,
  publishedAt: "2026-11-17T12:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.farmersMarkets[locale], ...FARMERS_META[locale], blocks: buildFarmersBody(locale) }]),
  ) as B2Article["editions"],
};

