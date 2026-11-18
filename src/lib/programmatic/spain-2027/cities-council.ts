import type { Region } from "@/lib/programmatic/holidays/boe-2027";

import type { CityRow, CouncilAct, LocalDay, LocalList } from "./cities-data";
import type { OfficialText } from "./sources";

/**
 * The 20,000+ towns whose two 2027 local days are fixed by the council's own
 * official act while their community's list is still unpublished (18 Nov
 * 2026: Aragón, Cantabria, Castilla-La Mancha, Madrid, Navarra, Comunitat
 * Valenciana; read through BOA 223, BOC 222, DOCM 221, BOCM 277, BON 230 and
 * DOGV 10496, all of 18.11.2026, `PENDING_CHECKS` in sources.ts).
 *
 * Rule: a town gets a page here only when the minutes of the session (acta,
 * or its signed draft) of the Pleno that adopted the two days are published
 * on the council's own site or platform and were read there on
 * `COUNCIL_READ_ON`, with the text of the agreement and the vote; the
 * verbatim line is the comment above each row. Never from the press, a
 * council news post or an aggregator; an agenda (orden del día) or a
 * committee report is not an act, and an agreement whose text does not print
 * the dates is not enough (Galapagar: "Festivos Locales … Aprobado", 3 Nov
 * 2026, no dates). Under RD 2001/1983 art. 46 the Pleno proposes the two days
 * and the community's labour authority fixes and publishes them: the pages
 * print them "aprobadas por el Ayuntamiento, pendientes de <boletín>", and
 * the working-days calculator, the .ics feed and the widget leave them out
 * until the bulletin lists them; the leave planner counts them only when the
 * reader ticks the box (as with the Catalan councils' days before the DOGC
 * order, holidays/council-2027.ts).
 *
 * The day the community publishes its list, its rows here fail
 * tests/spain-2027-council-towns.test.ts: transcribe them from the bulletin
 * into `cities-more.ts` (status "published"), and note any day that differs
 * from the council's.
 *
 * `source.date` and `act.date` are the session date the minutes record.
 *
 * Acts read on 18 Nov 2026 (document, session, item, URL):
 *  - Burjassot: Acta de la sesión ordinaria del Pleno de 31.3.2026, punto 3
 *    (expediente 2026/3471B), p. 3, unanimidad; signed, CSV L01460787P2UYV7YYZET.
 *    https://carpeta.burjassot.org/plenos/archivos/2248/20260331%20Pleno%2004.pdf
 *  - Ontinyent: Acta del Ple ordinari de 28.5.2026, punt 2 (expedient
 *    2729657Q), p. 3, unanimitat (21); signed 7.8.2026 and 19.8.2026.
 *    https://www.ontinyent.es/sites/www.ontinyent.es/files/Acta%20Ple%20de%20lAjuntament%202026-05-28%20-%20SEFYCU%208500699.pdf
 *  - Manises: Acta de la sesión ordinaria del Pleno de 30.7.2026, núm.
 *    15/2026, punto 7 (expte. 2964461H), p. 9, unanimidad; signed 7.8.2026,
 *    on the council's video-acta platform linked from manises.es/va/transparencia/ple-municipal.
 *    https://actasesionesdigital.simply-winspace.es/REPACTASAYTOMANISES/20260730_MANISES/F2_ACTA_PL_15_DE_30_DE_JULIO_DE_-_SEFYCU_8498858.pdf
 *  - Santa Pola: Acta del Pleno ordinario de 28.5.2026 (PLN/2026/10,
 *    expediente 8635/2026), p. 3, unanimidad; signed, number 2026-0013 of 2.7.2026.
 *    https://gobiernoabierto.santapola.es/storage/uploads/1785751877ACTA%20PLENO%20ORDINARIA%2028-05-2026._Anonimizado.pdf
 *  - Crevillent: Acta de la sesión ordinaria del Pleno de 28.7.2026, punto
 *    3.2.1 (expediente 1795121Z), p. 12, unanimidad; signed 22.9.2026.
 *    https://crevillent.es/wp-content/uploads/2026/10/Acta-Pleno-ordinario-28.07.2026.pdf
 *  - Vinaròs: Esborrany de l'acta del Ple ordinari de 18.6.2026 (2026-0011,
 *    punt 5, expedient 4945/2026), p. 14, unanimitat; signed 29.7.2026.
 *    https://www.vinaros.es/media-uploads/pdf/20260729_acta_acta-ple_acta-del-ple-2026-0011-260618-acta-ple-ordinari-18.06.2026-1794398012948.pdf
 *  - Villena: Borrador del acta de la sesión ordinaria del Pleno de
 *    25.6.2026, punto 5 (expediente 1797734D), pp. 10-11, 11 votos a favor;
 *    signed 22.7.2026.
 *    https://www.villena.es/wp-content/uploads/2026/07/Borrador-acta-pleno-25-junio-2026.pdf
 *  - Novelda: Acta de la sesión plenaria de 7.5.2026 (núm. 5), punto 7
 *    (referencia 2026/3134L), p. 17, unanimidad.
 *    https://www.novelda.es/wp-content/uploads/2026/06/ACTA-PLENO-No-05-DE-07-05-2026-1.pdf
 *  - Alboraya: Acta 6/2026 de la sesión ordinaria del Pleno de 25.6.2026,
 *    punto 1.1, pp. 2-3, 17 votos a favor y 3 abstenciones; signed 15.9.2026,
 *    on the council's video-acta platform linked from alboraya.es (sesiones del pleno 2026).
 *    https://videoactas.alboraya.com/session/downloadItem/8a818085a0e5a3ce01a0ec5670d2001d
 *  - Llíria: Acta de la sesión ordinaria del Pleno de 26.3.2026, punto 2
 *    (2026/00002697L), p. 2, unanimidad; approved on 30.4.2026.
 *    https://www.lliria.es/sites/www.lliria.es/files/260326_Videoacta_Pleno_aprobada_el_30_de_abril_de_2026.pdf
 *  - Puertollano: Acta del Pleno ordinario de 25.6.2026 (PLN/2026/6), punto
 *    3, p. 5, 12 votos a favor y 9 en contra; signed 30.7.2026.
 *    https://www.puertollano.es/wp-content/uploads/2026/06/acta-pleno-25-06-2026.pdf
 *
 * Searched on 18 Nov 2026 without an act that prints both days (agenda only,
 * a council news post, or no minutes online yet), so no page: Madrid's 13
 * towns (Galapagar adopted them on 3.11.2026 but the published extract gives
 * no dates; San Fernando de Henares and Torrelodones, agendas only), Navarra's
 * 3, Cantabria's 3, Calatayud, the other 9 of Castilla-La Mancha, and the
 * other 43 Valencian towns.
 */

/** The day every act below was read on the council's site. */
export const COUNCIL_READ_ON = "2026-11-18";

const d = (date: string, name: string | null, extra: Omit<LocalDay, "date" | "name"> = {}): LocalDay => ({ date, name, ...extra });

type Base = Omit<CityRow, "status2027" | "local2027" | "local2026" | "region" | "province" | "readOn" | "capital">;

/** A town whose council has fixed its 2027 days by `act`, recorded in `source`. */
function row(region: Region, province: string, base: Base, days: LocalDay[], act: CouncilAct, source: OfficialText): CityRow {
  const list: LocalList = { year: 2027, days, source, act };
  return { ...base, region, province, capital: false, status2027: "council", local2027: list, local2026: null, readOn: COUNCIL_READ_ON };
}

const pleno = (date: string): CouncilAct => ({ kind: "pleno", date });

const CASTILLA_LA_MANCHA: CityRow[] = [
  // «PRIMERO.- Aprobar la designación como días de Fiesta Local para el año 2027 de los días 8 de septiembre, día de la Virgen de Gracia, y 13 de mayo, día del Santo Voto.»
  row(
    "CM",
    "Ciudad Real",
    { ine: "13071", slug: "puertollano", name: "Puertollano", ineName: "Puertollano", population: 45565, ineTable: 2866 },
    [d("2027-05-13", "Santo Voto"), d("2027-09-08", "Virgen de Gracia")],
    pleno("2026-06-25"),
    {
      title: "Acta del Pleno del Ayuntamiento de Puertollano, sesión ordinaria de 25 de junio de 2026 (PLN/2026/6), punto 3: designación de dos días de fiestas locales para el año 2027",
      ref: "acta del Pleno de Puertollano de 25.6.2026, p. 5",
      date: "2026-06-25",
      url: "https://www.puertollano.es/wp-content/uploads/2026/06/acta-pleno-25-06-2026.pdf",
    },
  ),
];

const VALENCIANA: CityRow[] = [
  // «Primero.- Señalar como festividades locales, con carácter retribuido y no recuperable para el año 2027, las que seguidamente se indica: 1. Día 16 de agosto, festividad de Sant Roc. 2. Día 30 de septiembre, festividad de la Virgen de la Cabeza.»
  row(
    "VC",
    "Valencia",
    { ine: "46078", slug: "burjassot", name: "Burjassot", ineName: "Burjassot", population: 41299, ineTable: 2903 },
    [d("2027-08-16", "Sant Roc"), d("2027-09-30", "Virgen de la Cabeza")],
    pleno("2026-03-31"),
    {
      title: "Acta de la sesión ordinaria del Pleno del Ayuntamiento de Burjassot de 31 de marzo de 2026, punto 3 (expediente 2026/3471B): festividades locales año 2027",
      ref: "acta del Pleno de Burjassot de 31.3.2026, p. 3",
      date: "2026-03-31",
      url: "https://carpeta.burjassot.org/plenos/archivos/2248/20260331%20Pleno%2004.pdf",
    },
  ),
  // «- Dilluns de Festes de Moros i Cristians, 23 d'agost de 2027. - Dilluns de Fira, 22 de novembre de 2027.»
  row(
    "VC",
    "Valencia",
    { ine: "46184", slug: "ontinyent", name: "Ontinyent", ineName: "Ontinyent", population: 37012, ineTable: 2903 },
    [d("2027-08-23", "Dilluns de Festes de Moros i Cristians"), d("2027-11-22", "Dilluns de Fira")],
    pleno("2026-05-28"),
    {
      title: "Acta del Ple de l'Ajuntament d'Ontinyent, sessió ordinària de 28 de maig de 2026, punt 2 (expedient 2729657Q): les dos festes locals per a l'any 2027",
      ref: "acta del Pleno de Ontinyent de 28.5.2026, p. 3",
      date: "2026-05-28",
      url: "https://www.ontinyent.es/sites/www.ontinyent.es/files/Acta%20Ple%20de%20lAjuntament%202026-05-28%20-%20SEFYCU%208500699.pdf",
    },
  ),
  // «PRIMERO. - Proponer para el año 2027 las siguientes fiestas locales en Manises: - 5 de abril, festividad de San Vicente Ferrer. - 19 de julio, festividad de las patronas de la ciudad de Manises, Santas Justa y Rufina.»
  row(
    "VC",
    "Valencia",
    { ine: "46159", slug: "manises", name: "Manises", ineName: "Manises", population: 32609, ineTable: 2903 },
    [d("2027-04-05", "San Vicente Ferrer"), d("2027-07-19", "Santas Justa y Rufina")],
    pleno("2026-07-30"),
    {
      title: "Acta de la sesión ordinaria del Pleno del Ayuntamiento de Manises de 30 de julio de 2026 (núm. 15/2026), punto 7 (expediente 2964461H): propuesta de fiestas locales para el año 2027",
      ref: "acta del Pleno de Manises de 30.7.2026, p. 9",
      date: "2026-07-30",
      url: "https://actasesionesdigital.simply-winspace.es/REPACTASAYTOMANISES/20260730_MANISES/F2_ACTA_PL_15_DE_30_DE_JULIO_DE_-_SEFYCU_8498858.pdf",
    },
  ),
  // «PRIMERO.- Proponer que se determinen como inhábiles para el trabajo, retribuidos y no recuperables, en el año 2027, con el carácter de fiestas locales, los días: 16 de julio de 2027, viernes, Virgen del Carmen. 8 de septiembre de 2027, miércoles, Virgen de Loreto.»
  row(
    "VC",
    "Alicante",
    { ine: "03121", slug: "santa-pola", name: "Santa Pola", ineName: "Santa Pola", population: 39709, ineTable: 2856 },
    [d("2027-07-16", "Virgen del Carmen", { printedWeekday: "viernes" }), d("2027-09-08", "Virgen de Loreto", { printedWeekday: "miércoles" })],
    pleno("2026-05-28"),
    {
      title: "Acta del Pleno del Ayuntamiento de Santa Pola, sesión ordinaria de 28 de mayo de 2026 (PLN/2026/10), expediente 8635/2026: fiestas locales 2027",
      ref: "acta del Pleno de Santa Pola de 28.5.2026, p. 3",
      date: "2026-05-28",
      url: "https://gobiernoabierto.santapola.es/storage/uploads/1785751877ACTA%20PLENO%20ORDINARIA%2028-05-2026._Anonimizado.pdf",
    },
  ),
  // «PRIMERO.- Designar, a los efectos de elaboración del Calendario Laboral de Fiestas para el año 2027, los siguientes dos días de Fiestas Locales: JUEVES, 25 de marzo de 2027 (Jueves Santo) LUNES, 4 de octubre de 2027 (Fiestas Patronales)»
  row(
    "VC",
    "Alicante",
    { ine: "03059", slug: "crevillent", name: "Crevillent", ineName: "Crevillent", population: 30921, ineTable: 2856 },
    [d("2027-03-25", "Jueves Santo", { printedWeekday: "jueves" }), d("2027-10-04", "Fiestas Patronales", { printedWeekday: "lunes" })],
    pleno("2026-07-28"),
    {
      title: "Acta de la sesión ordinaria del Pleno del Ayuntamiento de Crevillent de 28 de julio de 2026, punto 3.2.1 (expediente 1795121Z): fiestas locales del año 2027",
      ref: "acta del Pleno de Crevillent de 28.7.2026, p. 12",
      date: "2026-07-28",
      url: "https://crevillent.es/wp-content/uploads/2026/10/Acta-Pleno-ordinario-28.07.2026.pdf",
    },
  ),
  // «Primer.- Fixar que els dos dies amb caràcter de festa local per a l'any 2027 que es remetran al Servei Territorial de Treball, siguen els següents: 20 de gener (Sant Sebastià) i 24 de juny (Sant Joan).»
  row(
    "VC",
    "Castellón",
    { ine: "12138", slug: "vinaros", name: "Vinaròs", ineName: "Vinaròs", population: 30529, ineTable: 2865 },
    [d("2027-01-20", "Sant Sebastià"), d("2027-06-24", "Sant Joan")],
    pleno("2026-06-18"),
    {
      title: "Esborrany de l'acta del Ple ordinari de l'Ajuntament de Vinaròs de 18 de juny de 2026 (2026-0011), punt 5 (expedient 4945/2026): dies de festa local per a l'any 2027",
      ref: "acta del Pleno de Vinaròs de 18.6.2026, p. 14",
      date: "2026-06-18",
      url: "https://www.vinaros.es/media-uploads/pdf/20260729_acta_acta-ple_acta-del-ple-2026-0011-260618-acta-ple-ordinari-18.06.2026-1794398012948.pdf",
    },
  ),
  // «Primero.- Aprobar como días Festivos Locales para el año 2027, los días 5 de abril, Lunes de San Vicente y 10 de septiembre, día posterior a la celebración de las Fiestas Patronales.»
  row(
    "VC",
    "Alicante",
    { ine: "03140", slug: "villena", name: "Villena", ineName: "Villena", population: 34712, ineTable: 2856 },
    [d("2027-04-05", "Lunes de San Vicente"), d("2027-09-10", "Día posterior a la celebración de las Fiestas Patronales")],
    pleno("2026-06-25"),
    {
      title: "Borrador del acta de la sesión ordinaria del Pleno del Ayuntamiento de Villena de 25 de junio de 2026, punto 5 (expediente 1797734D): días festivos locales para el calendario laboral de 2027",
      ref: "acta del Pleno de Villena de 25.6.2026, pp. 10-11",
      date: "2026-06-25",
      url: "https://www.villena.es/wp-content/uploads/2026/07/Borrador-acta-pleno-25-junio-2026.pdf",
    },
  ),
  // «Primero.- Determinar las siguientes fechas festivos de carácter local no recuperables para el año 2027: - Lunes 5 de abril, día de San Vicente Ferrer. - Sábado 10 de julio, día de San Cristóbal.»
  row(
    "VC",
    "Valencia",
    { ine: "46013", slug: "alboraya", name: "Alboraya", ineName: "Alboraia/Alboraya", population: 26273, ineTable: 2903 },
    [d("2027-04-05", "San Vicente Ferrer", { printedWeekday: "lunes" }), d("2027-07-10", "San Cristóbal", { printedWeekday: "sábado" })],
    pleno("2026-06-25"),
    {
      title: "Acta 6/2026 de la sesión ordinaria del Pleno del Ayuntamiento de Alboraya de 25 de junio de 2026, punto 1.1: festivos locales 2027",
      ref: "acta del Pleno de Alboraya de 25.6.2026, pp. 2-3",
      date: "2026-06-25",
      url: "https://videoactas.alboraya.com/session/downloadItem/8a818085a0e5a3ce01a0ec5670d2001d",
    },
  ),
  // «PRIMERO.- Proponer como festividades locales con carácter no recuperable para el ejercicio 2027: • Lunes 5 de abril de 2027, festividad de San Vicente Ferrer. • Miércoles 29 de septiembre de 2027, festividad de San Miguel Arcángel.»
  row(
    "VC",
    "Valencia",
    { ine: "46147", slug: "lliria", name: "Llíria", ineName: "Llíria", population: 25333, ineTable: 2903 },
    [d("2027-04-05", "San Vicente Ferrer", { printedWeekday: "lunes" }), d("2027-09-29", "San Miguel Arcángel", { printedWeekday: "miércoles" })],
    pleno("2026-03-26"),
    {
      title: "Acta de la sesión ordinaria del Pleno del Ayuntamiento de Llíria de 26 de marzo de 2026, punto 2 (número 2026/00002697L): determinación de las festividades locales del año 2027",
      ref: "acta del Pleno de Llíria de 26.3.2026, p. 2",
      date: "2026-03-26",
      url: "https://www.lliria.es/sites/www.lliria.es/files/260326_Videoacta_Pleno_aprobada_el_30_de_abril_de_2026.pdf",
    },
  ),
  // «PRIMERO: Las Fiestas Locales de Novelda para el año 2027 serán las siguientes: • 5 de abril, segundo Lunes de Pascua, fiesta tradicional de carácter local. • 22 de julio, Jueves, festividad de Santa María Magdalena Patrona de Novelda.»
  row(
    "VC",
    "Alicante",
    { ine: "03093", slug: "novelda", name: "Novelda", ineName: "Novelda", population: 26606, ineTable: 2856 },
    [d("2027-04-05", "Segundo Lunes de Pascua"), d("2027-07-22", "Santa María Magdalena", { printedWeekday: "jueves" })],
    pleno("2026-05-07"),
    {
      title: "Acta de la sesión plenaria del Ayuntamiento de Novelda de 7 de mayo de 2026 (núm. 5), punto 7 (referencia 2026/3134L): fiestas locales de Novelda para el año 2027",
      ref: "acta del Pleno de Novelda de 7.5.2026, p. 17",
      date: "2026-05-07",
      url: "https://www.novelda.es/wp-content/uploads/2026/06/ACTA-PLENO-No-05-DE-07-05-2026-1.pdf",
    },
  ),
];

/** By community in the BOE's order, most populous first. */
export const COUNCIL_CITY_ROWS: readonly CityRow[] = [...CASTILLA_LA_MANCHA, ...[...VALENCIANA].sort((a, b) => b.population - a.population)];
