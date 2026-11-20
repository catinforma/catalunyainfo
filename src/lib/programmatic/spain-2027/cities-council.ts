import type { Region } from "@/lib/programmatic/holidays/boe-2027";

import type { CityRow, CouncilAct, LocalDay, LocalList } from "./cities-data";
import type { OfficialText } from "./sources";

/**
 * The 20,000+ towns whose two 2027 local days are fixed by the council's own
 * official act while their community's list is still unpublished (20 Nov
 * 2026: Aragón, Castilla-La Mancha, Madrid, Navarra; read through BOA 225,
 * DOCM 223, BOCM 279 and BON 232, all of 20.11.2026, `PENDING_CHECKS` in
 * sources.ts). On 20 Nov 2026 Cantabria's list (BOC núm. 224) and the
 * Comunitat Valenciana's three provincial lists (BOP de Alicante 210, de
 * Castellón 136, de Valencia 224) were read: the 10 Valencian towns that were
 * here are rows of `cities-more.ts` now, every bulletin day the council's.
 * Core cities (50,000+) with such an act use the same rule in cities-data.ts
 * (`councilCity`: Parla and Fuenlabrada, 20 Nov 2026).
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
 * Acts read on 18 Nov 2026 and read again on 20 Nov 2026 (each URL answered
 * 200 with the same PDF, both 2027 dates in its text), document, session,
 * item, URL:
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
 * 3, Calatayud and the other 9 of Castilla-La Mancha.
 *
 * Madrid's core cities, searched on 20 Nov 2026: minutes with both days for
 * Parla and Fuenlabrada (cities-data.ts). Not enough under this rule, so
 * still pending: Madrid city (the Pleno's "Acuerdos" of 29.9.2026 print
 * 15 May and 9 Nov but no vote), San Sebastián de los Reyes (unsigned
 * minutes behind a browser check), Pozuelo (a signed extract, not minutes),
 * Torrejón (Junta de Gobierno, not the Pleno), Las Rozas (a machine
 * transcript of the video-acta); Alcobendas, Alcorcón, Pinto, Leganés,
 * Arganda (sites unreachable or behind a login), the rest agenda only.
 */

/** The day every act below was last read on the council's site (first read 18 Nov 2026). */
export const COUNCIL_READ_ON = "2026-11-20";

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

/** By community in the BOE's order, most populous first. */
export const COUNCIL_CITY_ROWS: readonly CityRow[] = [...CASTILLA_LA_MANCHA];
