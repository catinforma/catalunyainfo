import type { Block } from "@/lib/content/blocks";

import { callout, faq, h2, lead, list, table, type B2Source, type B2SpanishArticle } from "./shared";

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
 */
export const SHOPS_SPAIN_AS_OF = "2026-11-09";
const PDF = "https://comercio.gob.es/ComercioInterior/EjercicioActividadComercial/Documents/CALENDARIO_DOMINGOS_FESTIVOS_APERTURA_COMERCIAL_2026.pdf";
const LAW = "https://www.boe.es/buscar/act.php?id=BOE-A-2004-21421";
const CATALONIA = "/es/guias/tiendas-abiertas-festivos-cataluna/";
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

const WD = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const day = (d: number) => `${WD[new Date(Date.UTC(2026, 11, d)).getUTCDay()]} ${d}`;
const yes = (r: Row, d: number) => (r.days.includes(d) ? "Sí" : r.name === "Madrid" ? "Sí (libertad)" : r.days.length ? "No" : "—");
const whereOpen = (d: number) => DECEMBER_2026.filter((r) => r.days.includes(d)).map((r) => r.name);

export function buildShopsSpainBody(): Block[] {
  const rows = DECEMBER_2026.map((r) => [
    r.name,
    yes(r, 6),
    yes(r, 7),
    yes(r, 8),
    r.days.length ? r.days.map(day).join(", ") + (r.note ? `; ${r.note}` : "") : (r.note ?? ""),
  ]);
  const islands = CANARY_ISLANDS.map((r) => [r.name, r.days.map(day).join(", ")]);
  const on8 = whereOpen(8);
  const on7 = whereOpen(7);
  return [
    lead(
      `**El puente de diciembre de 2026 no abre igual en toda España.** El **martes 8** (Inmaculada) las tiendas pueden abrir en ${on8.join(", ")}, en varias islas de Canarias y, como cualquier día, en Madrid. El **lunes 7** pueden abrir en ${on7.join(", ")}. El **domingo 6**, en ${whereOpen(6).join(", ")} y algunas islas. Son días de apertura **autorizada**: cada comercio decide si abre.`,
    ),
    table(
      "Domingos y festivos de apertura comercial autorizada en diciembre de 2026, por comunidad",
      ["Comunidad", "Dom. 6", "Lun. 7", "Mar. 8", "Todos los de diciembre"],
      rows,
      `Fuente: ${link(PDF, "calendario de apertura comercial de 2026 del Ministerio de Economía, Comercio y Empresa")}, que recoge las órdenes de cada comunidad. Consultado el 9 de noviembre de 2026.`,
    ),
    ...h2("Canarias, isla por isla"),
    table("Domingos y festivos de apertura autorizada en diciembre de 2026 en Canarias", ["Isla", "Días"], islands, "Fuente: el mismo calendario del Ministerio, que recoge las resoluciones del Gobierno de Canarias por isla."),
    ...h2(
      "Navidad y Nochevieja: 24, 25, 26 y 31 de diciembre",
      "El **jueves 24 y el jueves 31** son días laborables: las tiendas abren con su horario normal (muchas cierran antes por la tarde, según cada cadena). El **viernes 25** no está en ningún calendario autonómico de apertura: es el día más cerrado del año, salvo en Madrid y en zonas turísticas con régimen propio. El **sábado 26** es apertura autorizada en Baleares.",
    ),
    ...h2("Excepciones: zonas turísticas y tiendas pequeñas"),
    list(
      "**Madrid:** libertad de horarios en toda la comunidad; cada comercio decide.",
      "**Zonas de gran afluencia turística:** algunos municipios o calles pueden abrir fuera de este calendario, pero casi siempre solo en un periodo o en un barrio concreto (en Barcelona, por ejemplo, del 15 de mayo al 15 de septiembre). No sirven como regla general para diciembre.",
      `**Tiendas pequeñas y algunas actividades** (panaderías, prensa, gasolineras, tiendas de conveniencia…) tienen libertad de horarios según la ${link(LAW, "Ley 1/2004 de horarios comerciales")}.`,
      `**En Cataluña,** cada ayuntamiento elige dos días más; los detalles, en ${link(CATALONIA, "nuestra guía de tiendas abiertas en Cataluña")}.`,
    ),
    callout("info", "Autorizada no quiere decir abierta", "Que un día sea de apertura autorizada no obliga a abrir: mira el horario de tu supermercado o tienda antes de ir."),
    faq([
      { question: "¿Abren los supermercados el 8 de diciembre de 2026?", answer: `Pueden abrir en ${on8.join(", ")}, en varias islas de Canarias y en Madrid, donde hay libertad de horarios. En el resto de comunidades el 8 no es día de apertura autorizada. Cada cadena decide si abre.` },
      { question: "¿Abren las tiendas el 7 de diciembre?", answer: `Es apertura autorizada en ${on7.join(", ")}, y en Madrid cada comercio decide. Allí donde el 7 es festivo y no está en el calendario comercial, la mayoría de tiendas grandes cierra.` },
      { question: "¿Abren las tiendas el 25 de diciembre?", answer: "No hay ninguna comunidad que lo tenga como día de apertura autorizada. Solo pueden abrir los comercios con libertad de horarios (Madrid, tiendas pequeñas, zonas turísticas con régimen propio)." },
    ]),
  ];
}

const SOURCES: B2Source[] = [
  { name: "Calendario de domingos y festivos de apertura comercial autorizada para 2026", url: PDF, publisher: "Ministerio de Economía, Comercio y Empresa" },
  { name: "Ley 1/2004, de 21 de diciembre, de Horarios Comerciales", url: LAW, publisher: "BOE" },
];

export const SHOPS_SPAIN_DECEMBER: B2SpanishArticle = {
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
  editions: {
    es: {
      path: "guias/tiendas-abiertas-diciembre-espana",
      title: "Tiendas abiertas en diciembre de 2026: el 6, 7 y 8 y en Navidad, por comunidad",
      seoTitle: "Tiendas abiertas 6, 7 y 8 de diciembre 2026, por comunidad",
      seoDescription: "Qué comunidades permiten abrir las tiendas el domingo 6, el lunes 7 y el martes 8 de diciembre de 2026, y qué pasa en Navidad. Con el calendario oficial.",
      excerpt: "Domingos y festivos de apertura comercial autorizada en diciembre de 2026 en cada comunidad y en cada isla de Canarias, según el calendario oficial del Ministerio.",
      blocks: buildShopsSpainBody(),
    },
  },
};
