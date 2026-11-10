import type { Block } from "@/lib/content/blocks";
import { WEEKDAY_NAMES } from "@/lib/content/holidays/calendar";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { joinList } from "@/lib/programmatic/holidays/names";

import { B2_PATHS, b2link, callout, faq, h2, lead, list, table, type B2Article, type B2Edition, type B2Source } from "./shared";

/**
 * "Tiendas abiertas en diciembre de 2026 por comunidad" (9 Nov 2026), Spain-wide.
 *
 * Source: the Ministry of Economy, Trade and Business's compilation
 * "Calendario de domingos y festivos de apertura comercial autorizada para
 * 2026" (14 pages; copy in research_notes/x10/calendario-apertura-comercial-
 * 2026-ministerio.pdf). The December list of every community and island was
 * checked by script against the PDF text on 9 Nov 2026. comercio.gob.es serves
 * a broken certificate chain: read it with `curl -k`.
 * Only the general regional calendars: municipal swaps, tourist zones (ZGAT)
 * and small shops' own regimes are explained, never turned into dates.
 * SHOPS_SPAIN_AS_OF moves when re-read; a test fails after 31 Dec 2026.
 *
 * Three editions since 10 Nov 2026 (owner rule: every page in ca, es and en).
 * The days come from the same two tables in the three languages; only the
 * words differ. One body builder, so no edition can gain or lose a section.
 */
export const SHOPS_SPAIN_AS_OF = "2026-11-09";
const PDF = "https://comercio.gob.es/ComercioInterior/EjercicioActividadComercial/Documents/CALENDARIO_DOMINGOS_FESTIVOS_APERTURA_COMERCIAL_2026.pdf";
const LAW = "https://www.boe.es/buscar/act.php?id=BOE-A-2004-21421";
const link = (href: string, label: string) => `[${label}](${href})`;

type Row = { name: string; days: number[]; note?: string };
export const DECEMBER_2026: Row[] = [
  { name: "Andalucía", days: [7, 13, 20, 27] },
  { name: "Aragón", days: [6, 8, 13, 20, 27] },
  { name: "Asturias", days: [8, 20, 27] },
  { name: "Baleares", days: [6, 20, 26] },
  { name: "Canarias", days: [], note: "Depende de la isla: ver la tabla de islas" },
  { name: "Cantabria", days: [7, 27] },
  { name: "Castilla-La Mancha", days: [6, 13, 20, 27] },
  { name: "Castilla y León", days: [8, 13, 20, 27] },
  { name: "Cataluña", days: [6, 13, 20, 27], note: "más dos días que elige cada ayuntamiento; si no los comunica, uno es el 8 de diciembre" },
  { name: "Comunidad Valenciana", days: [13, 20, 27] },
  { name: "Extremadura", days: [7, 20], note: "más dos días que fija cada ayuntamiento en el año" },
  { name: "Galicia", days: [6, 13, 20, 27] },
  { name: "Madrid", days: [], note: "Libertad de horarios: cada comercio decide si abre, también domingos y festivos" },
  { name: "Murcia", days: [6, 7, 8, 13, 20, 27] },
  { name: "Navarra", days: [3, 20], note: "más un festivo local" },
  { name: "País Vasco", days: [], note: "No hay calendario autonómico de domingos y festivos de apertura" },
  { name: "La Rioja", days: [7, 20, 27] },
];
export const CANARY_ISLANDS: Row[] = [
  { name: "El Hierro", days: [6, 8, 13, 20, 27] },
  { name: "Fuerteventura", days: [8, 13, 20, 27] },
  { name: "Gran Canaria", days: [6, 13, 20, 27] },
  { name: "La Gomera", days: [6, 8, 13, 20, 27] },
  { name: "La Palma", days: [8, 13, 20, 27] },
  { name: "Lanzarote", days: [8, 13, 20, 27] },
  { name: "Tenerife", days: [8, 13, 20, 27] },
];

type Other = Exclude<Locale, "es">;

/**
 * Each community in Catalan and English, keyed by its row's Spanish name:
 * `cell` for the table, `prose` inside a sentence ("a l'Aragó", "in the
 * Balearic Islands"), `note` for the row's remark. The islands keep their
 * names in the three languages.
 */
export const COMMUNITY_I18N: Record<string, Record<Other, { cell: string; prose?: string; note?: string }>> = {
  Andalucía: { ca: { cell: "Andalusia" }, en: { cell: "Andalusia" } },
  Aragón: { ca: { cell: "Aragó", prose: "l'Aragó" }, en: { cell: "Aragon" } },
  Asturias: { ca: { cell: "Astúries" }, en: { cell: "Asturias" } },
  Baleares: { ca: { cell: "Balears", prose: "les Balears" }, en: { cell: "Balearic Islands", prose: "the Balearic Islands" } },
  Canarias: {
    ca: { cell: "Canàries", note: "Depèn de l'illa: vegeu la taula d'illes" },
    en: { cell: "Canary Islands", prose: "the Canary Islands", note: "Depends on the island: see the islands table" },
  },
  Cantabria: { ca: { cell: "Cantàbria" }, en: { cell: "Cantabria" } },
  "Castilla-La Mancha": { ca: { cell: "Castella-la Manxa" }, en: { cell: "Castile-La Mancha" } },
  "Castilla y León": { ca: { cell: "Castella i Lleó" }, en: { cell: "Castile and León" } },
  Cataluña: {
    ca: { cell: "Catalunya", note: "més dos dies que tria cada ajuntament; si no els comunica, un és el 8 de desembre" },
    en: { cell: "Catalonia", note: "plus two days chosen by each town council; if it does not notify them, one is 8 December" },
  },
  "Comunidad Valenciana": { ca: { cell: "Comunitat Valenciana", prose: "la Comunitat Valenciana" }, en: { cell: "Valencian Community", prose: "the Valencian Community" } },
  Extremadura: {
    ca: { cell: "Extremadura", note: "més dos dies que fixa cada ajuntament durant l'any" },
    en: { cell: "Extremadura", note: "plus two days set by each town council during the year" },
  },
  Galicia: { ca: { cell: "Galícia" }, en: { cell: "Galicia" } },
  Madrid: {
    ca: { cell: "Madrid", note: "Llibertat d'horaris: cada comerç decideix si obre, també els diumenges i festius" },
    en: { cell: "Madrid", note: "Free opening hours: each shop decides whether to open, Sundays and holidays included" },
  },
  Murcia: { ca: { cell: "Múrcia" }, en: { cell: "Murcia" } },
  Navarra: { ca: { cell: "Navarra", note: "més un festiu local" }, en: { cell: "Navarre", note: "plus one local holiday" } },
  "País Vasco": {
    ca: { cell: "País Basc", prose: "el País Basc", note: "No hi ha calendari autonòmic de diumenges i festius d'obertura" },
    en: { cell: "Basque Country", prose: "the Basque Country", note: "There is no regional calendar of Sunday and holiday opening" },
  },
  "La Rioja": { ca: { cell: "La Rioja", prose: "la Rioja" }, en: { cell: "La Rioja" } },
};

const cellName = (r: Row, L: Locale) => (L === "es" ? r.name : (COMMUNITY_I18N[r.name]?.[L].cell ?? r.name));
const proseName = (r: Row, L: Locale) => (L === "es" ? r.name : (COMMUNITY_I18N[r.name]?.[L].prose ?? COMMUNITY_I18N[r.name]?.[L].cell ?? r.name));
const noteOf = (r: Row, L: Locale) => (L === "es" ? r.note : r.note ? (COMMUNITY_I18N[r.name]?.[L].note ?? r.note) : undefined);

const day = (d: number, L: Locale) => `${WEEKDAY_NAMES[L][new Date(Date.UTC(2026, 11, d)).getUTCDay()]} ${d}`;
const whereOpen = (d: number, L: Locale) => DECEMBER_2026.filter((r) => r.days.includes(d)).map((r) => proseName(r, L));

interface ShopsCopy {
  yes: string;
  yesFree: string;
  no: string;
  /** on6, on7 and on8 arrive comma-joined, as the Spanish sentences want them; `and7` ends with "i"/"and". */
  lead: (on: { on6: string; on7: string; on8: string; and7: string }) => string;
  table: { caption: string; headers: string[]; note: string };
  islands: { heading: string; caption: string; headers: string[]; note: string };
  christmas: { heading: string; text: string };
  exceptions: { heading: string; items: (catalonia: (label: string) => string) => string[] };
  callout: { title: string; text: string };
  faq: (on: { on7: string; on8: string; and7: string }) => { question: string; answer: string }[];
}

const COPY: Record<Locale, ShopsCopy> = {
  es: {
    yes: "Sí",
    yesFree: "Sí (libertad)",
    no: "No",
    lead: ({ on6, on7, on8 }) =>
      `**El puente de diciembre de 2026 no abre igual en toda España.** El **martes 8** (Inmaculada) las tiendas pueden abrir en ${on8}, en varias islas de Canarias y, como cualquier día, en Madrid. El **lunes 7** pueden abrir en ${on7}. El **domingo 6**, en ${on6} y algunas islas. Son días de apertura **autorizada**: cada comercio decide si abre.`,
    table: {
      caption: "Domingos y festivos de apertura comercial autorizada en diciembre de 2026, por comunidad",
      headers: ["Comunidad", "Dom. 6", "Lun. 7", "Mar. 8", "Todos los de diciembre"],
      note: `Fuente: ${link(PDF, "calendario de apertura comercial de 2026 del Ministerio de Economía, Comercio y Empresa")}, que recoge las órdenes de cada comunidad. Consultado el 9 de noviembre de 2026.`,
    },
    islands: {
      heading: "Canarias, isla por isla",
      caption: "Domingos y festivos de apertura autorizada en diciembre de 2026 en Canarias",
      headers: ["Isla", "Días"],
      note: "Fuente: el mismo calendario del Ministerio, que recoge las resoluciones del Gobierno de Canarias por isla.",
    },
    christmas: {
      heading: "Navidad y Nochevieja: 24, 25, 26 y 31 de diciembre",
      text: "El **jueves 24 y el jueves 31** son días laborables: las tiendas abren con su horario normal (muchas cierran antes por la tarde, según cada cadena). El **viernes 25** no está en ningún calendario autonómico de apertura: es el día más cerrado del año, salvo en Madrid y en zonas turísticas con régimen propio. El **sábado 26** es apertura autorizada en Baleares.",
    },
    exceptions: {
      heading: "Excepciones: zonas turísticas y tiendas pequeñas",
      items: (catalonia) => [
        "**Madrid:** libertad de horarios en toda la comunidad; cada comercio decide.",
        "**Zonas de gran afluencia turística:** algunos municipios o calles pueden abrir fuera de este calendario, pero casi siempre solo en un periodo o en un barrio concreto (en Barcelona, por ejemplo, del 15 de mayo al 15 de septiembre). No sirven como regla general para diciembre.",
        `**Tiendas pequeñas y algunas actividades** (panaderías, prensa, gasolineras, tiendas de conveniencia…) tienen libertad de horarios según la ${link(LAW, "Ley 1/2004 de horarios comerciales")}.`,
        `**En Cataluña,** cada ayuntamiento elige dos días más; los detalles, en ${catalonia("nuestra guía de tiendas abiertas en Cataluña")}.`,
      ],
    },
    callout: {
      title: "Autorizada no quiere decir abierta",
      text: "Que un día sea de apertura autorizada no obliga a abrir: mira el horario de tu supermercado o tienda antes de ir.",
    },
    faq: ({ on7, on8 }) => [
      { question: "¿Abren los supermercados el 8 de diciembre de 2026?", answer: `Pueden abrir en ${on8}, en varias islas de Canarias y en Madrid, donde hay libertad de horarios. En el resto de comunidades el 8 no es día de apertura autorizada. Cada cadena decide si abre.` },
      { question: "¿Abren las tiendas el 7 de diciembre?", answer: `Es apertura autorizada en ${on7}, y en Madrid cada comercio decide. Allí donde el 7 es festivo y no está en el calendario comercial, la mayoría de tiendas grandes cierra.` },
      { question: "¿Abren las tiendas el 25 de diciembre?", answer: "No hay ninguna comunidad que lo tenga como día de apertura autorizada. Solo pueden abrir los comercios con libertad de horarios (Madrid, tiendas pequeñas, zonas turísticas con régimen propio)." },
    ],
  },
  ca: {
    yes: "Sí",
    yesFree: "Sí (llibertat)",
    no: "No",
    lead: ({ on6, on8, and7 }) =>
      `**Pel pont de desembre de 2026, les botigues no obren igual a tot Espanya.** El **dimarts 8** (la Immaculada) poden obrir a ${on8}, a diverses illes de Canàries i, com qualsevol dia, a Madrid. El **dilluns 7** poden obrir a ${and7}. El **diumenge 6**, a ${on6} i algunes illes. Són dies d'obertura **autoritzada**: cada comerç decideix si obre.`,
    table: {
      caption: "Diumenges i festius d'obertura comercial autoritzada el desembre de 2026, per comunitat",
      headers: ["Comunitat", "Dg. 6", "Dl. 7", "Dt. 8", "Tots els de desembre"],
      note: `Font: ${link(PDF, "calendari d'obertura comercial de 2026 del Ministeri d'Economia, Comerç i Empresa")}, que recull les ordres de cada comunitat. Consultat el 9 de novembre de 2026.`,
    },
    islands: {
      heading: "Canàries, illa per illa",
      caption: "Diumenges i festius d'obertura autoritzada el desembre de 2026 a Canàries",
      headers: ["Illa", "Dies"],
      note: "Font: el mateix calendari del Ministeri, que recull les resolucions del Govern de Canàries per illa.",
    },
    christmas: {
      heading: "Nadal i Cap d'Any: 24, 25, 26 i 31 de desembre",
      text: "El **dijous 24 i el dijous 31** són dies feiners: les botigues obren amb l'horari habitual (moltes tanquen abans a la tarda, segons cada cadena). El **divendres 25** no surt en cap calendari autonòmic d'obertura: és el dia més tancat de l'any, tret de Madrid i de les zones turístiques amb règim propi. El **dissabte 26** és dia d'obertura autoritzada a les Balears.",
    },
    exceptions: {
      heading: "Excepcions: zones turístiques i botigues petites",
      items: (catalonia) => [
        "**Madrid:** llibertat d'horaris a tota la comunitat; cada comerç decideix.",
        "**Zones de gran afluència turística:** alguns municipis o carrers poden obrir fora d'aquest calendari, però gairebé sempre només durant un període o en un barri concret (a Barcelona, per exemple, del 15 de maig al 15 de setembre). No serveixen com a regla general per al desembre.",
        `**Botigues petites i algunes activitats** (forns de pa, premsa, benzineres, botigues de conveniència…) tenen llibertat d'horaris segons la ${link(LAW, "Llei 1/2004 d'horaris comercials")}.`,
        `**A Catalunya,** cada ajuntament tria dos dies més; els detalls, a ${catalonia("la nostra guia de botigues obertes a Catalunya")}.`,
      ],
    },
    callout: {
      title: "Autoritzada no vol dir oberta",
      text: "Que un dia sigui d'obertura autoritzada no obliga a obrir: mira l'horari del teu supermercat o de la teva botiga abans d'anar-hi.",
    },
    faq: ({ on8, and7 }) => [
      { question: "Obren els supermercats el 8 de desembre de 2026?", answer: `Poden obrir a ${on8}, a diverses illes de Canàries i a Madrid, on hi ha llibertat d'horaris. A la resta de comunitats el 8 no és dia d'obertura autoritzada. Cada cadena decideix si obre.` },
      { question: "Obren les botigues el 7 de desembre?", answer: `És dia d'obertura autoritzada a ${and7}, i a Madrid cada comerç decideix. Allà on el 7 és festiu i no surt al calendari comercial, la majoria de botigues grans tanquen.` },
      { question: "Obren les botigues el 25 de desembre?", answer: "Cap comunitat el té com a dia d'obertura autoritzada. Només poden obrir els comerços amb llibertat d'horaris (Madrid, botigues petites, zones turístiques amb règim propi)." },
    ],
  },
  en: {
    yes: "Yes",
    yesFree: "Yes (free hours)",
    no: "No",
    lead: ({ on6, on8, and7 }) =>
      `**Shops in Spain do not all open on the same days over the December 2026 long weekend.** On **Tuesday 8** (Immaculate Conception) they may open in ${on8}, on several of the Canary Islands and, as on any day, in Madrid. On **Monday 7** they may open in ${and7}. On **Sunday 6**, in ${on6} and on some of the islands. These are days of **authorised** opening: each shop decides whether to open.`,
    table: {
      caption: "Sundays and public holidays with authorised shop opening in December 2026, by region",
      headers: ["Region", "Sun 6", "Mon 7", "Tue 8", "All in December"],
      note: `Source: the ${link(PDF, "2026 shop-opening calendar from the Ministry of Economy, Trade and Business")}, which compiles each region's orders. Checked on 9 November 2026.`,
    },
    islands: {
      heading: "The Canary Islands, island by island",
      caption: "Sundays and public holidays with authorised opening in December 2026 in the Canary Islands",
      headers: ["Island", "Days"],
      note: "Source: the same Ministry calendar, which compiles the Canary Islands government's resolutions island by island.",
    },
    christmas: {
      heading: "Christmas and New Year's Eve: 24, 25, 26 and 31 December",
      text: "**Thursday 24 and Thursday 31** are working days: shops keep their normal hours (many close earlier in the afternoon, depending on the chain). **Friday 25** is in no regional opening calendar: it is the most closed day of the year, except in Madrid and in tourist zones with rules of their own. **Saturday 26** is an authorised opening day in the Balearic Islands.",
    },
    exceptions: {
      heading: "Exceptions: tourist zones and small shops",
      items: (catalonia) => [
        "**Madrid:** free opening hours across the region; each shop decides.",
        "**Major tourist zones (zonas de gran afluencia turística):** some towns or streets may open outside this calendar, but almost always only for part of the year or in one district (in Barcelona, for example, from 15 May to 15 September). They are no general rule for December.",
        `**Small shops and certain businesses** (bakeries, newsagents, petrol stations, convenience stores…) are free to set their own hours under ${link(LAW, "Law 1/2004 on shop opening hours")}.`,
        `**In Catalonia,** each town council picks two more days; the details are in ${catalonia("our guide to shops open in Catalonia")}.`,
      ],
    },
    callout: {
      title: "Authorised does not mean open",
      text: "A day of authorised opening obliges no shop to open: check your supermarket's or shop's hours before you go.",
    },
    faq: ({ on8, and7 }) => [
      { question: "Are supermarkets open on 8 December 2026 in Spain?", answer: `They may open in ${on8}, on several of the Canary Islands and in Madrid, where opening hours are free. In the other regions the 8th is not an authorised opening day. Each chain decides whether to open.` },
      { question: "Are shops open on 7 December?", answer: `It is an authorised opening day in ${and7}, and in Madrid each shop decides. Where the 7th is a public holiday and is not in the shop-opening calendar, most large shops close.` },
      { question: "Are shops open on 25 December?", answer: "No region has it as an authorised opening day. Only shops with free opening hours may open (Madrid, small shops, tourist zones with rules of their own)." },
    ],
  },
};

export function buildShopsSpainBody(locale: Locale = "es"): Block[] {
  const L = locale;
  const t = COPY[L];
  const yes = (r: Row, d: number) => (r.days.includes(d) ? t.yes : r.name === "Madrid" ? t.yesFree : r.days.length ? t.no : "—");
  const days = (r: Row) => r.days.map((d) => day(d, L)).join(", ");
  const rows = DECEMBER_2026.map((r) => {
    const note = noteOf(r, L);
    return [cellName(r, L), yes(r, 6), yes(r, 7), yes(r, 8), r.days.length ? days(r) + (note ? `; ${note}` : "") : (note ?? "")];
  });
  const islands = CANARY_ISLANDS.map((r) => [r.name, days(r)]);
  const on = {
    on6: whereOpen(6, L).join(", "),
    on7: whereOpen(7, L).join(", "),
    on8: whereOpen(8, L).join(", "),
    and7: joinList(whereOpen(7, L), L),
  };
  return [
    lead(t.lead(on)),
    table(t.table.caption, t.table.headers, rows, t.table.note),
    ...h2(t.islands.heading),
    table(t.islands.caption, t.islands.headers, islands, t.islands.note),
    ...h2(t.christmas.heading, t.christmas.text),
    ...h2(t.exceptions.heading),
    list(...t.exceptions.items((label) => b2link("shops", L, label))),
    callout("info", t.callout.title, t.callout.text),
    faq(t.faq(on)),
  ];
}

const SOURCES: B2Source[] = [
  { name: "Calendario de domingos y festivos de apertura comercial autorizada para 2026", url: PDF, publisher: "Ministerio de Economía, Comercio y Empresa" },
  { name: "Ley 1/2004, de 21 de diciembre, de Horarios Comerciales", url: LAW, publisher: "BOE" },
];

const META: Record<Locale, Omit<B2Edition, "path" | "blocks">> = {
  es: {
    title: "Tiendas abiertas en diciembre de 2026: el 6, 7 y 8 y en Navidad, por comunidad",
    seoTitle: "Tiendas abiertas 6, 7 y 8 de diciembre 2026, por comunidad",
    seoDescription: "Qué comunidades permiten abrir las tiendas el domingo 6, el lunes 7 y el martes 8 de diciembre de 2026, y qué pasa en Navidad. Con el calendario oficial.",
    excerpt: "Domingos y festivos de apertura comercial autorizada en diciembre de 2026 en cada comunidad y en cada isla de Canarias, según el calendario oficial del Ministerio.",
  },
  ca: {
    title: "Botigues obertes el desembre de 2026: el 6, 7 i 8 i per Nadal, per comunitat",
    seoTitle: "Botigues obertes 6, 7 i 8 de desembre 2026, per comunitat",
    seoDescription: "Quines comunitats deixen obrir les botigues el diumenge 6, el dilluns 7 i el dimarts 8 de desembre de 2026, i què passa per Nadal. Amb el calendari oficial.",
    excerpt: "Diumenges i festius d'obertura comercial autoritzada el desembre de 2026 a cada comunitat i a cada illa de Canàries, segons el calendari oficial del Ministeri.",
  },
  en: {
    title: "Shops open in Spain in December 2026: 6, 7 and 8 December and Christmas, region by region",
    seoTitle: "Shops open 6, 7 and 8 December 2026 in Spain, by region",
    seoDescription: "Which Spanish regions let shops open on Sunday 6, Monday 7 and Tuesday 8 December 2026, and what happens at Christmas. With the official calendar.",
    excerpt: "Sundays and public holidays with authorised shop opening in December 2026 in every region of Spain and on each Canary Island, from the Ministry's official calendar.",
  },
};

export const SHOPS_SPAIN_DECEMBER: B2Article = {
  key: "shopsSpainDecember",
  entryKey: "guide-shops-open-december-2026-spain",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "botigues-carrer-llums-nadal",
  heroAlt: {
    ca: "Carrer de Barcelona amb llums de Nadal en forma d'arbre i gent passejant",
    es: "Calle de Barcelona con luces de Navidad en forma de árbol y gente paseando",
    en: "A Barcelona street with tree-shaped Christmas lights and people walking",
  },
  heroCaption: { ca: "Llums de Nadal a Barcelona.", es: "Luces de Navidad en Barcelona.", en: "Christmas lights in Barcelona." },
  verifiedAt: SHOPS_SPAIN_AS_OF,
  publishedAt: "2026-11-09T21:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.shopsSpainDecember[locale], ...META[locale], blocks: buildShopsSpainBody(locale) }]),
  ) as B2Article["editions"],
};
