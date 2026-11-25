import type { B2Source } from "./shared";
import { CITY_STATE_URLS } from "./strike-11n-cities-data";
import { STRIKE_URLS } from "./strikes";
import type { SpainNotHappening, SpainOpenStrike, SpainStrike } from "./strikes-spain-model";

/**
 * The facts of the Spain-wide strikes calendar (`strikes-spain.ts`): the file
 * the strike watch edits. The page builder and its wording live in
 * `strikes-spain.ts`; the shapes in `strikes-spain-model.ts`.
 *
 * Every URL below was fetched on 10 Nov 2026 with a browser User-Agent and
 * the fact it carries was read in the response:
 *  - Calls: the organiser's own notice (semaf.org, ccoo.es,
 *    ferroviario.fsc.ccoo.es, alferro.org, scf.es, ugt-fica.org, usca.es,
 *    cesm.org, sindicatodeestudiantes.net).
 *  - Minimum services: the BOE, the Ministry of Transport's lists of rail and
 *    air resolutions, and Renfe's own notices of what the Ministry set.
 *  - Figures that only exist inside a resolution's PDF are not restated: the
 *    PDF is linked and the page says what the Ministry's list says about it.
 *
 * Status discipline: "official" only with a registered call or an official
 * minimum-services order; everything else is "called", with its minimum
 * services "pending" (printed as "to be confirmed") until an order is out.
 *
 * Left out on 10 Nov 2026 because no official or organiser page carried the
 * fact: any Correos-only or justice-only strike, the Rodalies percentages of
 * the Generalitat's orders (its e-Tauler pages are scripts; the Catalan
 * guides carry them), and any strike in December or January (none found).
 */

/**
 * The day every source below was last read. Tests fail 4 days after it, and on the Monday after its week.
 *
 * 13 Nov 2026: every source re-read with a browser User-Agent. Changes: the
 * meat-industry strike's 12 and 13 Nov were called off on 12 Nov (UGT FICA
 * nº 3857, pre-agreement); the 17 Nov rail strike now lists the six unions
 * whose registered calls at Grupo Renfe the Generalitat's order of 12 Nov
 * cites (FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO, SFF-CGT), SCF nº
 * 35 (12 Nov) keeps 17 and 19 Nov, CCOO (12 Nov) keeps the 17th. Unchanged:
 * the Ministry's rail list (no resolution for 17, 19 or 23 Nov) and air list
 * (SAERCO, Groundforce and Outsmart resolutions in force to 30 Nov), SEMAF
 * (newest 10 Nov), ALFERRO (newest 82/2026), Sindicato de Estudiantes (20N
 * call of 30 Oct, mobilisations at 12:00), CESM (indefinite strike still
 * postponed; on 12 Nov it also postponed its 21 Nov march).
 *
 * 16 Nov 2026 (~15:00): re-read. The 17 Nov rail strike is now "official":
 * the Ministry's resolution of 12 Nov for Grupo Renfe (Cercanías 75 % / 50 %,
 * Media Distancia 65 %, AVE-LD 72 %, freight 26 %; Renfe's notice of 14 Nov
 * agrees), its resolutions of 13 Nov for Iryo (70 %) and Ouigo (65,38 %),
 * listed on its air page, and the Basque Government's order of 13 Nov for
 * Cercanías Bilbao and San Sebastián (50 % / 25 %). SEMAF nº 2026-33 (14 Nov)
 * keeps the 17th and the 23rd. Unchanged: no resolution for Adif (17, 19) or
 * for 23 Nov; SCF (nº 36, 13 Nov), CCOO rail (13 Nov), ALFERRO, Sindicato de
 * Estudiantes (20N, 12:00), CESM (newest 13 Nov; strike still postponed),
 * UGT FICA (nothing new on poultry), the Ministry's air list (SAERCO,
 * Groundforce, Outsmart in force to 30 Nov).
 *
 * 17 Nov 2026 (~10:30 UTC, the 17N strike day): re-read. New: the doctors'
 * strike of Sindicato Médicos Unidos (SMU), 08:00 on 16 Nov to 08:00 on 28
 * Nov, every region's public health service plus INGESA (its notice of 4
 * Nov, the regional minimum-services orders it publishes, the Generalitat's
 * order of 13 Nov on Treball's list; marches on 19 Nov at 18:00); ELA's
 * Bizkaia building-cleaning strike, 17 to 20 Nov (the Ministry's air
 * resolution of 13 Nov for Bilbao airport); the students' 20N notice to
 * schools (whole school day). SCFCOM 37 (16 Nov) keeps the 19th and says
 * Adif's minimum services were set by the Secretary of State and Circular nº
 * 5 of 13 Nov; the Ministry's rail list still has no Adif resolution (17,
 * 19) and none for 23 Nov. Unchanged: SEMAF (nº 2026-34, 16 Nov), CCOO rail,
 * CESM (newest 12 Nov, strike still postponed), the air list (SAERCO,
 * Groundforce, Outsmart in force to 30 Nov).
 *
 * 17 Nov 2026 (~16:00-17:10 CET): re-read again
 * (research_notes/x10/strikes-wave-17nov-factpack.md). The 23 Nov strike is
 * now "official": the Generalitat's order of 16 Nov (e-Tauler 659191, on
 * Treball's list on the 17th) cites SEMAF's notice registered at Grupo Renfe
 * on 11 Nov, 0.01 to 23.59, all drivers, and sets Rodalies 66 % / 33 %; SEMAF
 * nº 2026-34 (16 Nov) keeps "la jornada trasladada al día 23". Still no
 * Ministry resolution for Adif (17, 19) or for the rest of Renfe on the 23rd
 * (rail list newest = 12 Nov; air list 2026 top = the 17N ones and ELA
 * Bizkaia). SCF newest SCFCOM 37 (19th kept). Sindicato de Estudiantes:
 * 20N kept, mobilisations at 12:00 (city list on its page). SMU: no
 * call-off. BOE sumarios of 13, 14, 16 and 17 Nov: no strike order.
 *
 * 18 Nov 2026 (afternoon): re-read (research_notes/x10/strikes-18nov-factpack.md).
 * NEW: SCF called off the 19 Nov strike at Adif: "SCF ha acordado la
 * desconvocatoria para el día 19" (SCFCOM 38, 17 Nov, 22:25, with the signed
 * call-off agreement), after Adif accepted its demands and the Council of
 * Ministers approved on the 17th the urgent processing of the change to RD
 * 929/2020 (the Ministry's press note of that day). The rail entry keeps the
 * 17th only; the 19th is in SPAIN_NOT_HAPPENING. SEMAF nº 2026-35 (17 Nov)
 * keeps the 23rd: "afrontamos el 23 de noviembre como la próxima jornada de
 * movilización". Unchanged: the Ministry's rail list (newest still the 12 Nov
 * Grupo Renfe resolution: none for Adif or for the 23rd) and air list (newest
 * the 17N ones and ELA Bizkaia; SAERCO, Groundforce, Outsmart in force to 30
 * Nov); Treball's list (newest 17 Nov, the 23rd's order) and the newest 100
 * e-Tauler edicts (16-18 Nov: no other strike order); SMU (no call-off,
 * marches on the 19th at 18:00); Sindicato de Estudiantes (20N kept); BOE of
 * 18 Nov (no strike order).
 *
 * 19 Nov 2026 (~12:00 CET): re-read (research_notes/x10/strikes-19nov-factpack.md).
 * NEW: the BOE of 19 Nov (núm. 288) prints Orden INT/1239/2026 of 17 Nov:
 * the Sindicato Libre de Correos y Telecomunicaciones calls Correos out in the
 * Comunidad de Madrid from 00:00 on 23 Nov to 24:00 on 27 Nov, and in Cádiz,
 * Córdoba, Huelva, Málaga and Sevilla from 00:00 on 23 Nov to 24:00 on 25
 * Nov; the order sets minimum services for the postal vote. The Basque
 * Government's list has two new orders of 17 Nov: care homes in Bizkaia (LAB
 * and ELA, 19 Nov, 17 Dec, 21 Jan 2027) and private care homes in Gipuzkoa
 * (ELA, 20 Nov, 22 and 23 Dec), plus its own order of 13 Nov for the Bizkaia
 * cleaning strike (so the Ministry's airport resolution is no longer the
 * only order printed). The SMU's march list for the 19th no longer has
 * Zaragoza (19 cities, all at 18:00); the students' list for the 20th adds
 * Donostia, Zamora, Zaragoza and Teruel (28 places, all at 12:00).
 * Unchanged: the Ministry's rail list (newest still the 12 Nov Grupo Renfe
 * resolution: none for the 23rd) and air list (newest the 17N ones and ELA
 * Bizkaia; SAERCO, Groundforce, Outsmart in force to 30 Nov); SEMAF nº
 * 2026-35 (17 Nov) still newest and keeps the 23rd; SCF (SCFCOM 38 newest:
 * the 19th stays called off); Treball's list (newest 17 Nov) and the newest
 * 100 e-Tauler edicts (17-19 Nov: no other strike order); SMU ("legalmente
 * convocada del 16 al 27 de noviembre", no call-off); Sindicato de
 * Estudiantes (20N kept, whole school day); CSIF Educación Madrid (stoppages
 * on 20, 24, 26 and 30 Nov, 9:00-11:00 and 17:00-19:00); CESM (newest 13 Nov,
 * still postponed); BOE of 18 Nov (no strike order). Renfe's notice for the
 * 23rd: not found (its press room is a script page; no notice at the 17N
 * notice's URL pattern).
 *
 * 20 Nov 2026 (afternoon): re-read (research_notes/x10/strikes-20nov-factpack.md).
 * NEW: SEMAF called off the 23 Nov strike at Grupo Renfe: "SEMAF ha procedido
 * a la desconvocatoria de la jornada de huelga prevista para el próximo 23 de
 * noviembre tras alcanzar un acuerdo" (nº 2026-38, 20/11/2026, datePublished
 * 2026-11-20T01:04:56+01:00); nº 2026-39 (20/11/2026) calls the text an
 * "Acuerdo de fin de huelga (art. 8.2 RDLRT)". "huelga-renfe-2026-11-23" is
 * removed and "renfe-23-noviembre-desconvocada" added to SPAIN_NOT_HAPPENING.
 * No other rail call on the 23rd: the Ministry's rail list (newest still the
 * 12 Nov resolution for the 17th) and air list (newest the 17N ones; SAERCO,
 * Groundforce, Outsmart in force to 30 Nov); SCF (SCFCOM 39, 20 Nov, about
 * the collective agreement); CCOO rail (Adif's works council "ha acordado dar
 * por finalizada la conflictividad", 18 Nov); SFF-CGT (18 Nov, no date);
 * ALFERRO (newest 83/2026); the Basque Government's list (newest the two
 * care-home orders of 17 Nov; none for Renfe on the 23rd). Renfe and
 * Rodalies: no notice about the call-off found. Unchanged: Correos (Orden
 * INT/1239/2026, BOE-A-2026-24259, still in force; BOE of 20 Nov: no strike
 * order); SMU ("legalmente convocada del 16 al 27 de noviembre"); the
 * students' 20N (on today, 12:00); Gipuzkoa's care homes (20 Nov, 22 and 23
 * Dec) and Bizkaia's (17 Dec, 21 Jan 2027) on the Basque list; CSIF Educación
 * Madrid; CESM (newest 12 Nov, still postponed).
 *
 * 21 Nov 2026 (~12:00 CET, Saturday): re-read (research_notes/x10/strikes-21nov-factpack.md).
 * No change to any entry. The Ministry's rail list (newest still the 12 Nov
 * Grupo Renfe resolution for the 17th: no new rail call) and air list (newest
 * the 17N ones and ELA Bizkaia; SAERCO, Groundforce, Outsmart in force to 30
 * Nov); SEMAF (newest item 20 Nov: an online assembly on the 23rd about "los
 * hechos conseguidos que han supuesto la desconvocatoria de huelga"), SCF
 * (SCFCOM 40, about the call-off agreement), SFF-CGT (newest 18 Nov, no date),
 * ALFERRO, CCOO rail: no strike; Correos (Orden INT/1239/2026, BOE-A-2026-24259,
 * unchanged; BOE of 21 Nov, núm. 290: no strike order; the Sindicato Libre's
 * site, newest 17 Nov: no call-off); SMU (newest 19 Nov: "legalmente
 * convocada del 16 al 27 de noviembre"); the Basque Government's list (newest
 * still the two care-home orders of 17 Nov: Bizkaia 17 Dec and 21 Jan 2027,
 * Gipuzkoa 22 and 23 Dec); CSIF Educación Madrid (stoppages on 24, 26 and 30
 * Nov, 9:00-11:00 and 17:00-19:00) and CCOO Madrid ("plena huelga
 * indefinida"); CESM (newest 13 Nov, still postponed). No new strike for 21
 * Nov-5 Dec on those lists. Outside that window and not added yet: the Basque
 * Government's order of 26 Oct for Osakidetza (SATSE, ELA, LAB, CCOO, UGT;
 * 8-9 Dec Álava, 9-10 Bizkaia, 10-11 Gipuzkoa, 13-14 Dec all of Osakidetza,
 * each from 22:00 to 22:00).
 *
 * 22 Nov 2026 (13:20-13:40 CET, Sunday): re-read (docs/SEO_EXPERIMENTS.md,
 * "2026-11-22 — Strikes re-read (Sunday)"). No change to any entry and no copy
 * changed. Correos: Orden INT/1239/2026 (BOE-A-2026-24259) unchanged ("días 23
 * a 27 de noviembre de 2026 en Madrid y de 23 a 25 de noviembre de 2026 en
 * Cádiz, Córdoba, Huelva, Málaga y Sevilla"); BOE of 21 Nov (núm. 290): no
 * strike order, no issue on Sunday 22; the Sindicato Libre's site (newest 17
 * Nov) and Correos' press room (newest 20 Nov, postal vote): no call-off, no
 * agreement. Its order's clause "en el caso de ampliación del plazo de
 * admisión del voto, se dará continuidad a los servicios mínimos de los
 * servicios rurales" now applies: the Junta Electoral Central extended the
 * deposit of postal votes to 26 Nov, 14:00 (Acuerdo 418/2026, on the voting
 * pages since 20 Nov); the entry's conditional sentence is left as written.
 * SMU: the notice's first phase runs "hasta las 08:00 horas del sábado 28 de
 * noviembre de 2026" with "cese total de la actividad", so the weekend of 21
 * and 22 Nov is covered and the twelve dates stand; no call-off, no second
 * phase announced (newest item 19 Nov). Rail: SEMAF (newest 20 Nov), SCF
 * (SCFCOM 40, 21 Nov), SFF-CGT (newest 18 Nov, no date), ALFERRO (newest
 * 83/2026), CCOO and the Ministry's rail list (newest still 12 Nov): no new
 * call; Renfe's press room feed (newest item 17 Nov): nothing about the 23rd.
 * Air list: newest still the 17N ones and ELA Bizkaia; SAERCO, Groundforce,
 * Outsmart in force to 30 Nov, no resolution from 1 Dec yet. The Basque
 * Government's list (newest still the two care-home orders of 17 Nov); CSIF
 * Educación Madrid (calendar unchanged: 24, 26 and 30 Nov, 1, 10, 11, 16 and
 * 18 Dec, 9:00-11:00 and 17:00-19:00) and CCOO Madrid (newest items 16-18 Nov,
 * "plena huelga indefinida", no call-off); CESM (newest 12-13 Nov, still
 * postponed); CCOO and UGT's national home pages (only the 11N). No new strike
 * for 23 Nov-6 Dec on those lists.
 *
 * 23 Nov 2026 (18:05-18:40 CET, Monday): re-read (docs/SEO_EXPERIMENTS.md,
 * "2026-11-23 — Strikes re-read (Monday)"). No change to any entry here.
 * Correos: Orden INT/1239/2026 (BOE-A-2026-24259) unchanged; BOE of 23 Nov
 * (núm. 291): no strike order; Sindicato Libre (newest 17 Nov) and Correos'
 * press room (newest 20 Nov): no call-off. SMU: notice unchanged ("hasta las
 * 08:00 horas del sábado 28 de noviembre de 2026"), newest item 19 Nov. Rail:
 * SEMAF (newest 20 Nov), SCF (SCFCOM 40, 21 Nov), SFF-CGT (newest 18 Nov),
 * ALFERRO (newest 83/2026), CCOO and the Ministry's rail list (newest 12 Nov):
 * no new call. Air list unchanged (resolutions to 30 Nov). Basque list: newest
 * still 17 Nov. CSIF Madrid's calendar unchanged; CESM (newest 23 Nov, not a
 * strike). The one change of the day is Catalan (the 26N education order,
 * strikes.ts); the Spain hub prints it through the Catalan entry.
 *
 * 24 Nov 2026 (morning, Tuesday): every source re-read (the log is in
 * docs/SEO_EXPERIMENTS.md, "2026-11-24 — Strikes re-read (Tuesday)"). No
 * change to any dated entry. Correos: Orden INT/1239/2026 unchanged; BOE of 24
 * Nov (núm. 292): no strike order. SMU, the rail unions, the Ministry's rail
 * and air lists (air resolutions to 30 Nov), CSIF Madrid (stoppages on 24, 26
 * and 30 Nov and 1, 10, 11, 16 and 18 Dec) and CCOO Madrid: unchanged. Basque
 * list: newest still 17 Nov. Added, so that the calendar has no gap after 27
 * Nov: the Osakidetza strike of 9, 10, 11 and 14 Dec (the Basque Government's
 * order of 26 Oct, left out on 21 Nov as outside the window), with the
 * unions' condition (LAB on 13 Nov and ELA on 17 Nov keep it "si en la
 * siguiente Mesa Sectorial del 2 de diciembre no se producen avances"):
 * `rereadBy` 3 Dec, a test fails that day. New in the model: `dayNotes`
 * (Correos is Madrid only on the 26th and the 27th), `doctors` and
 * `rereadBy`; new on the page: the day-by-day answers (`spainDayAnswers`).
 *
 * 25 Nov 2026 (00:20-00:50 CET, Wednesday): every source re-read (log in
 * docs/SEO_EXPERIMENTS.md, "2026-11-25 — Strikes re-read (Wednesday)").
 * NEW: the perfumery and cosmetics sector strike (CCOO Industria and UGT FICA)
 * on 27 Nov (Black Friday), 23 Dec and 4 Jan, from CCOO de Catalunya's news of
 * 24 Nov (about 7,000 workers in Catalonia; rally at 9:00 at El Corte Inglés,
 * Plaça Catalunya, on the 27th). "called": the organisers' notice only, no
 * public service. Unchanged: Correos (Orden INT/1239/2026, BOE-A-2026-24259:
 * "días 23 a 27 de noviembre de 2026 en Madrid y de 23 a 25 [...] en Cádiz,
 * Córdoba, Huelva, Málaga y Sevilla"); BOE of 24 Nov (núm. 292) has no strike
 * order (25 Nov not out at 00:30); SMU (notice "hasta las 08:00 horas del
 * sábado 28 de noviembre de 2026", nothing new on its site); the Ministry's
 * rail list (newest the 12 Nov resolution for 17 Nov) and air list (newest
 * LogiRAIL 17 Nov; SAERCO, Groundforce, Outsmart to 30 Nov); the Basque list
 * (newest the two care-home orders of 17 Nov; Osakidetza order of 26 Oct;
 * LAB and ELA still say they keep 9, 10, 11 and 14 Dec if the 2 Dec talks do
 * not advance); SEMAF (newest nº 2026-39, 20 Nov), SCF (SCFCOM 40, 21 Nov),
 * SFF-CGT, ALFERRO, CCOO rail: no new call; CSIF Madrid (24, 26 and 30 Nov, 1,
 * 10, 11, 16 and 18 Dec); CESM (still postponed). UGT FICA's home page did not
 * carry the perfumery call (its newest items: water cycle in the Balearics,
 * 16 Nov; meat industry).
 *
 * 25 Nov 2026 (00:35-00:55 CET), follow-ups of the same night. (1) Perfumery:
 * UGT FICA nº 3861 (18 Nov) and CCOO de Industria's state-level news (19 Nov)
 * give the same three days; both say state-wide ("del Estado"), the SIMA
 * mediation of 17 Nov ended without agreement and the employers' association
 * is STANPA (nothing on the strike on its site). Still "called": no official
 * document (not a public service). (2) NEW: Madrid public schools, CSIF's
 * partial stoppages on 26 and 30 Nov and 1, 10, 11, 16 and 18 Dec (9:00-11:00
 * and 17:00-19:00): "official", because the Community of Madrid's Orden
 * 4252/2026 (BOCM núm. 241, 9 Oct) quotes CSIF's call and sets minimum services,
 * modified by Orden 4977/2026 (BOCM núm. 278, 19 Nov); BOCM of 20-24 Nov: no
 * further order. The indefinite strike of CCOO, UGT, CGT and others, covered by
 * the same orders, is not listed (its current notices were not read).
 *
 * 25 Nov 2026 (10:05-10:25 CET, Wednesday), second full re-read of the day (docs/SEO_EXPERIMENTS.md, "2026-11-25 — Strikes re-read for 26 Nov
 * (ci-fonts)"). NEW: the Ministry of Transport's air list now opens with the resolution for the indefinite strike of the works council of
 * SERVEO Facility Management, S.A.U., cleaning of terminals T1, T2 and T3 at Madrid-Barajas, from 23:00 on 25 Nov, 319 workers, 50% / 25% of the
 * daily staff, in force to 31 Jan 2027 (signed 24 Nov, 20:45): `huelga-serveo-barajas-limpieza`, the fourth open airport strike. Unchanged: Correos
 * (Orden INT/1239/2026; BOE of 25 Nov, núm. 293: no strike order; Correos' press room nothing); CSIF Madrid (BOCM núm. 283 of 25 Nov, 67
 * items: no strike or minimum-services item; CSIF's newest items of 23 Nov, a court claim and a demand, keep "la huelga indefinida convocada por
 * CSIF", no change to 26 Nov); CCOO Madrid (home page: nothing newer); the Ministry's rail list (newest still the 12 Nov resolution), SEMAF (newest 20 Nov),
 * SCF (SCFCOM 40), ALFERRO (newest 83/2026); Basque list (newest 17 Nov); CESM (still postponed). SMU: medicosunidos.es did not resolve (DNS) from
 * the server, so its notice PDF was not re-fetched; huelgamedica.es (the campaign's own site, read) still says "16 AL 27 DE NOVIEMBRE" and its feed's newest
 * item is 20 Nov; the notice itself was read at 00:40 the same day ("hasta las 08:00 horas del sábado 28 de noviembre de 2026").
 */
export const STRIKES_SPAIN_AS_OF: string = "2026-11-25";

/**
 * Printed as the page's "last verified" date and in every "checked on" line.
 * Typed as string (not the literal) so a test comparing it with the as-of
 * day never narrows it to `never` when the two differ.
 */
export const STRIKES_SPAIN_VERIFIED: string = "2026-11-25";

const CDN = "https://cdn.transportes.gob.es/portal-web-transportes";
const FICA = "https://ugt-fica.org/component/content/article";

export const SPAIN_URLS = {
  ministryRail: STRIKE_URLS.ministryRail,
  ministryAir: CITY_STATE_URLS.ministryAir,
  // Rail, 10 and 12 Nov.
  semaf1012: STRIKE_URLS.semaf1012,
  renfeSemafResolution: `${CDN}/transporte-terrestre/servicios-minimos/20261105_resolucion_ssmm_renfe__nacional_conduccionv1_vi.pdf`,
  renfeSemafNotice: STRIKE_URLS.renfeSemaf1012,
  // General strike, 11 Nov.
  ccooRegistered: STRIKE_URLS.ccooRegistered,
  correosOrder: CITY_STATE_URLS.correosOrder,
  securityOrder: CITY_STATE_URLS.securityOrder,
  renfe11n: "https://grupo.renfe.com/es/es/sala-de-prensa/noticias/2026/11/establecidos-los-servicios-minimos-para-la-huelga-general-convocada-el-11n",
  air11n: "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf",
  // Rail, 17 and 19 Nov.
  ccooRail17:
    "https://ferroviario.fsc.ccoo.es/noticia:771650--CCOO_anuncia_movilizaciones_los_dias_16_y_17_de_noviembre_para_exigir_un_cambio_de_modelo_ferroviario_y_garantizar_la_seguridad",
  alferro80: STRIKE_URLS.alferro80,
  semafCuerpo: STRIKE_URLS.semafCuerpo,
  // Rail, 23 Nov (SEMAF, 10 Nov: replaces the 12th's stoppages).
  semaf23: STRIKE_URLS.semaf23,
  scfAdif: STRIKE_URLS.scfAdif,
  scf35: STRIKE_URLS.scf35,
  ccooRail17Still: STRIKE_URLS.ccooRail17Still,
  semaf33: STRIKE_URLS.semaf33,
  ministryRenfe17: STRIKE_URLS.ministryRenfe17,
  renfe17: STRIKE_URLS.renfe17,
  iryo17: STRIKE_URLS.iryo17,
  ouigo17: STRIKE_URLS.ouigo17,
  euskadi17: STRIKE_URLS.euskadi17,
  treballMs: STRIKE_URLS.treballMs,
  // Meat industry, 9 to 13 Nov.
  meatCall: `${FICA}/3806?catid=43`,
  meatMediation: `${FICA}/3815?catid=43`,
  meatFirstDay: `${FICA}/3847?catid=43`,
  meatCalledOff: `${FICA}/3857?catid=43`,
  poultry: `${FICA}/3831?catid=43`,
  // Students, 20 Nov.
  students: "https://www.sindicatodeestudiantes.net/index.php/noticias/internacional/20n-huelga-estudiantil-europea",
  studentsNotice: "https://www.sindicatodeestudiantes.net/images/2026/noviembre/comunicacionoficial_20N.pdf",
  // Doctors (Sindicato Médicos Unidos), 16 to 27 Nov (read 17 Nov 2026).
  smuNotice: "https://cdn.medicosunidos.es/huelga-2026-16N/Preavisos/_ESTATAL.pdf",
  smuDocs: "https://medicosunidos.es/documentacion-convocatoria/",
  smuMarches: "https://medicosunidos.es/manifestaciones/",
  treballMsList: STRIKE_URLS.treballMs,
  // Building cleaning in Bizkaia (ELA), 17 to 20 Nov (read 17 Nov 2026).
  elaResolution: `${CDN}/aereo/huelga-servicios-minimos/2026/54_26-11-17_-_dgac_resolucion_huelga_aspel_sectorial_limpieza_vizcaya_-_ela_vi.pdf`,
  // Basque Government's list of minimum-services orders and three of its orders (read 19 Nov 2026).
  euskadiList: "https://www.euskadi.eus/gobierno-vasco/-/ordenes-servicios-minimos/",
  // Order of 13 Nov 2026: building cleaning in Bizkaia, 17-20 Nov (health centres, care homes, nursery and primary schools).
  euskadiCleaning: "https://www.euskadi.eus/contenidos/informacion/ordenes_servicios_minimos/es_servmin/2026.11.13-Sector-limpieza-edificios-y-locales-bizkaia.pdf",
  // Order of 17 Nov 2026: care homes in Bizkaia (LAB: private homes; ELA: homes, community housing and day centres), 19 Nov, 17 Dec, 21 Jan 2027.
  euskadiCareBizkaia: "https://www.euskadi.eus/contenidos/informacion/ordenes_servicios_minimos/es_servmin/2026.11.-17-Orden-SSMM-Centros-de-la-tercera-edad-Bizkaia_sectorial.pdf",
  // Order of 17 Nov 2026: private care homes in Gipuzkoa (ELA), 20 Nov, 22 and 23 Dec, full working day.
  euskadiCareGipuzkoa: "https://www.euskadi.eus/contenidos/informacion/ordenes_servicios_minimos/es_servmin/2026.11.17-SSMM_Residencias-de-la-tercera-edad-Gipuzkoa.pdf",
  /**
   * Order of 26 Oct 2026: all Osakidetza staff (read 24 Nov 2026). "Las organizaciones sindicales SATSE, ELA, LAB, CCOO y UGT han convocado huelga para
   * todo el personal (laboral, estatutario y funcionario) que presta servicios en los centros de trabajo de OSAKIDETZA - Servicio Vasco de Salud";
   * "De las 22.00 horas del 8 de diciembre de 2026, a las 22.00 horas del 9 de diciembre de 2026" (Álava), 9-10 Dec (Bizkaia), 10-11 Dec (Gipuzkoa),
   * "De las 22.00 horas del 13 de diciembre a las 22.00 horas del 14 de diciembre de 2026, para todo el personal de Osakidetza"; "son 46.545 personas
   * trabajadoras"; "a) En los centros hospitalarios, con el personal habitual de un festivo"; "b) En la atención primaria […] los servicios
   * correspondientes a un sábado"; "c) El 100% de los servicios de emergencia y PAC"; "d) En los servicios Call Center de las OSIs […] el 50%".
   */
  euskadiOsakidetza: "https://www.euskadi.eus/contenidos/informacion/ordenes_servicios_minimos/es_servmin/2026.10.26-Orden-SSMM-Osakidetza.pdf",
  /**
   * LAB, 13 Nov 2026 (read 24 Nov 2026): "si en la siguiente Mesa Sectorial del 2 de diciembre no se producen avances, mantendremos las jornadas de
   * huelga convocadas para el 9 de diciembre en Araba, el 10 en Bizkaia, el 11 en Gipuzkoa y el 14 en el conjunto de Osakidetza".
   */
  labOsakidetza: "https://www.lab.eus/es/la-fuerza-de-la-movilizacion-obliga-a-osakidetza-a-mover-ficha-pero-las-propuestas-siguen-siendo-insuficientes/",
  /** ELA, 17 Nov 2026 (read 24 Nov 2026): the same sentence, "mantendrán las jornadas de huelga convocadas para el 9 de diciembre en Araba, el 10 en Bizkaia, el 11 en Gipuzkoa y el 14 en el conjunto de Osakidetza". */
  elaOsakidetza: "https://www.ela.eus/es/gizalan/sanidad/nueva-jornada-de-movilizaciones-ante-la-falta-de-avances-en-la-negociacion",
  // Correos in Madrid (23-27 Nov) and Cádiz, Córdoba, Huelva, Málaga, Sevilla (23-25 Nov): Orden INT/1239/2026 of 17 Nov, BOE núm. 288 of 19 Nov 2026.
  correos2327: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-24259",
  /** JEC agreement of 19 Nov 2026 (read 22 Nov 2026): "esta Junta acuerda ampliar el plazo de depósito del voto por correo hasta el 26 de noviembre de 2026 […] y como máximo hasta las 14:00 horas". */
  jec418: "https://www.juntaelectoralcentral.es/cs/jec/doctrina/acuerdos?anyosesion=2026&idacuerdoinstruccion=156427&idsesion=1122&template=Doctrina/JEC_Detalle",
  /**
   * CCOO de Catalunya, 24 Nov 2026 (read 25 Nov 2026, ~00:25 CET; HTTP 200): «CCOO d'Indústria i UGT-FICA han convocat tres jornades de vaga al
   * sector de la perfumeria i la cosmètica […] Els dies 27 de novembre, 23 de desembre i 4 de gener les persones que treballen al sector faran
   * vaga»; «Aquest divendres 27 de novembre, coincidint amb el Black Friday, arrenca la primera de les tres jornades de vaga convocades al
   * sector de la perfumeria i la cosmètica al conjunt de l'Estat. En el cas de Catalunya, al voltant de 7.000 treballadors i treballadores
   * estan cridats a participar en la vaga»; «CCOO convoca una concentració a partir de les 9 hores, davant d'El Corte Inglés de la plaça
   * Catalunya de Barcelona».
   */
  perfumery: "https://www.ccoo.cat/noticies/el-sector-de-la-perfumeria-i-la-cosmetica-fara-vaga-el-27-de-novembre-per-reclamar-un-conveni-que-avanci-en-salaris-jornada-i-conciliacio/",
  /**
   * CCOO de Industria (state level), news of 19 Nov 2026 (read 25 Nov 2026, ~00:50 CET; HTTP 200): «las personas que trabajan en el sector de la
   * perfumería y la cosmética del Estado secundarán la primera de las tres jornadas de huelga que CCOO de Industria y UGT FICA han convocado»;
   * «Si la patronal no incorpora al convenio las justas reivindicaciones de las plantillas, el sector volverá a parar el 23 de diciembre y el 4 de
   * enero»; «La convocatoria también se extiende a las plantillas de las fábricas que elaboran geles, champús y otros productos para supermercados
   * como Mercadona»; the employers' association it names is STANPA.
   */
  perfumeryIndustria:
    "https://industria.ccoo.es/noticia:772972--El_27N_sera_un_viernes_negro_en_la_perfumeria_y_la_cosmetica_Los_y_las_trabajadoras_iran_a_la_huelga_para_exigir_avances_en_salarios_jornada_y_conciliacion",
  /**
   * UGT FICA (state level), nº 3861 of 18 Nov 2026 (read 25 Nov 2026, ~00:40 CET; HTTP 200): «UGT FICA denuncia el bloqueo de la negociación del
   * Convenio Estatal de Perfumería y Afines y mantiene la convocatoria de huelga»; «tras finalizar sin acuerdo el acto de mediación celebrado ayer
   * en el Servicio Interconfederal de Mediación y Arbitraje (SIMA)» (17 Nov); «la patronal Stanpa»; «ambos sindicatos confirman el mantenimiento de la
   * huelga convocada para el próximo 27 de noviembre, coincidiendo con la campaña del Black Friday, así como de las jornadas de paro previstas para el
   * 23 de diciembre de 2026 y el 4 de enero de 2027».
   */
  perfumeryFica: `${FICA}/3861?catid=8`,
  /**
   * Madrid public schools, 25 Nov 2026 (read ~00:55 CET, all HTTP 200). BOCM núm. 241 of 9 Oct 2026, Orden 4252/2026 of 7 Oct (minimum services «durante las
   * huelgas convocadas a partir del día 14 de octubre de 2026, en todos los centros docentes y educativos públicos no universitarios de la Comunidad de
   * Madrid»); it quotes CSIF Madrid's call of 24 Sep: «los días 20, 22, 26 y 30 de octubre de 2026, 3, 5, 11, 13, 16, 20, 24, 26 y 30 de noviembre de
   * 2026 y 1, 10, 11, 16 y 18 de diciembre de 2026, en las franjas desde las 9:00 a las 11:00 horas de la mañana y desde las 17:00 a las 19:00 horas de la
   * tarde, extendiéndose la misma al personal funcionario docente de las etapas educativas públicas no universitarias de la Comunidad de Madrid».
   */
  madridOrder4252: "https://www.bocm.es/bocm-20261009-25",
  /**
   * BOCM núm. 278 of 19 Nov 2026, Orden 4977/2026 of 17 Nov (modifies 4252/2026; effects «desde el día siguiente al de su publicación»; «no se ha alcanzado
   * un acuerdo sobre los servicios mínimos»; applies «a las convocatorias de huelga […] que permanezcan vigentes cuando esta orden surta efectos»).
   */
  madridOrder4977: "https://www.bocm.es/bocm-20261119-16",
  /** CSIF Educación Madrid, 23 Sep 2026: «los días 20, 22, 26 y 30 de octubre de 2026, 3, 5, 11, 13, 16, 20, 24, 26 y 30 de noviembre de 2026 y 1, 10, 11, 16 y 18 de diciembre de 2026, en las franjas desde las 9:00 a las 11:00 horas de la mañana y desde las 17:00 a las 19:00 horas de la tarde». */
  csifMadrid: "https://www.csif.es/es/articulo/comunidaddemadrid/educacion/97107",
  /** CSIF Educación Madrid, 21 Nov 2026: «Ayer, día 20 de noviembre de 2026, CSIF presentó un Recurso Contencioso Administrativo ante el TSJ de Madrid impugnando la La Orden 4977/2026». */
  csifMadridAppeal: "https://www.csif.es/es/articulo/comunidaddemadrid/educacion/100572",
  // Adif, 17 and 19 Nov: SCFCOM 37 (16 Nov 2026).
  scf37: "https://www.scf.es/com37/",
  // SCF nº 38, 17 Nov 2026 (22:25, read 18 Nov): "SCF ha acordado la desconvocatoria para el día 19".
  scf38: STRIKE_URLS.scf38,
  // SEMAF nº 2026-35, 17 Nov 2026 (read 18 Nov): "afrontamos el 23 de noviembre como la próxima jornada de movilización".
  semaf35: STRIKE_URLS.semaf35,
  // Rail, 23 Nov (read 17 Nov 2026): SEMAF nº 2026-34 (16 Nov). The Generalitat's order of 16 Nov is cited through treballMs.
  semaf34: STRIKE_URLS.semaf34,
  // 20 Nov 2026 (read that day): SEMAF nº 2026-38, "SEMAF ha procedido a la desconvocatoria de la jornada de huelga prevista para el
  // próximo 23 de noviembre tras alcanzar un acuerdo"; nº 2026-39, the agreement is an "Acuerdo de fin de huelga (art. 8.2 RDLRT)".
  semaf38: STRIKE_URLS.semaf38,
  semaf39: STRIKE_URLS.semaf39,
  // Airports.
  usca: "https://www.usca.es/usca-y-ccoo-convocan-huelga-indefinida-en-saerco-por-recortes-de-plantilla-y-riesgos-para-la-seguridad-operacional/",
  saercoResolution: `${CDN}/aereo/huelga-servicios-minimos/51_26-10-01--resolucion-huelga-saerco_vi.pdf`,
  groundforceResolution: STRIKE_URLS.groundforce,
  outsmartResolution: `${CDN}/aereo/huelga-servicios-minimos/48_26-10-01---resolucion-outsmart--sate-mad_vi.pdf`,
  /**
   * Ministry of Transport, resolution signed 24 Nov 2026 20:45 (read 25 Nov 2026, ~10:10 CET; HTTP 200, on the air list that morning): «El Comité de Empresa de
   * SERVEO FACILITY MANAGEMENT, S.A.U. […] ha convocado una huelga de carácter indefinido, que comenzará el día 25 de noviembre de 2026, a las 23:00 horas,
   * afectando a la totalidad de la jornada de trabajo. Esta convocatoria afecta a los trabajadores de la empresa que prestan servicios de limpieza en las
   * terminales T1, T2 y T3 del aeropuerto Adolfo Suárez Madrid-Barajas»; «la huelga afecta a 319 trabajadores»; «a) Una plantilla de servicios mínimos del 50% de la
   * plantilla programada diaria para: la limpieza de aseos de los edificios terminales […] b) Una plantilla de servicios mínimos del 25% de la plantilla
   * programada diaria para: el resto de las zonas públicas interiores […] deberá haber una persona por turno de trabajo, como mínimo»; «Esta resolución entrará en
   * vigor el día 25 de noviembre de 2026, a las 23:00 horas y estará vigente hasta el día 31 de enero de 2027». The cleaning of aircraft is excluded from the request.
   */
  serveoResolution: `${CDN}/aereo/huelga-servicios-minimos/2026/55_26-11-25----resolucion-huelga-serveo-facility-management---mad_vi.pdf`,
  // Not happening.
  cesm: "https://www.cesm.org/2026/10/07/el-comite-de-huelga-aplaza-los-paros-indefinidos-tras-la-convocatoria-electoral-pero-mantiene-vivo-el-conflicto/",
  semafOuigo: STRIKE_URLS.semafOuigo,
  // Law.
  constitution: STRIKE_URLS.constitution,
  rdl17: STRIKE_URLS.rdl17,
} as const;

const U = SPAIN_URLS;
const link = (url: string, label: string) => `[${label}](${url})`;

const MINISTRY = "Ministerio de Transportes y Movilidad Sostenible";

const SRC = {
  ministryRail: { name: "Resoluciones de servicios mínimos ferroviarios", url: U.ministryRail, publisher: MINISTRY },
  ministryAir: { name: "Resoluciones de servicios mínimos del transporte aéreo", url: U.ministryAir, publisher: MINISTRY },
  scf38: { name: "SCFCOM 38: Adif se compromete con todos los puntos de la convocatoria de huelga de SCF (17 de noviembre de 2026)", url: U.scf38, publisher: "Sindicato de Circulación Ferroviario (SCF)" },
  semaf35: { name: "SEMAF continúa con la conflictividad: próxima movilización el 23 de noviembre (nº 2026-35, 17 de noviembre de 2026)", url: U.semaf35, publisher: "SEMAF" },
  semaf38: { name: "Desconvocamos la huelga del 23 de noviembre tras conseguir todas las reivindicaciones (nº 2026-38, 20 de noviembre de 2026)", url: U.semaf38, publisher: "SEMAF" },
  semaf39: { name: "Análisis del Acuerdo de Desconvocatoria de Huelga de SEMAF (nº 2026-39, 20 de noviembre de 2026)", url: U.semaf39, publisher: "SEMAF" },
} satisfies Record<string, B2Source>;

/* -------------------------------------------------------------------------- */
/* Dated strikes                                                              */
/* -------------------------------------------------------------------------- */

export const SPAIN_STRIKES: SpainStrike[] = [
  {
    id: "huelga-renfe-2026-10-29",
    dates: ["2026-10-29"],
    sector: "rail",
    status: "official",
    catalanEntry: "vaga-renfe-2026-10-29",
    title: {
      ca: "vaga de maquinistes del Grup Renfe (SEMAF)",
      es: "huelga de maquinistas del Grupo Renfe (SEMAF)",
      en: "Renfe train drivers' strike (SEMAF)",
    },
    label: { ca: "maquinistes de Renfe", es: "maquinistas de Renfe", en: "Renfe train drivers" },
    scope: {
      ca: "El personal de conducció del Grup Renfe, a tot Espanya.",
      es: "El personal de conducción del Grupo Renfe, en toda España.",
      en: "Train drivers across the Renfe group, all over Spain.",
    },
    calledBy: { ca: "SEMAF.", es: "SEMAF.", en: "SEMAF." },
    basis: {
      ca: "Amb serveis mínims fixats pel Ministeri de Transports.",
      es: "Con servicios mínimos fijados por el Ministerio de Transportes.",
      en: "With minimum services set by the Ministry of Transport.",
    },
    minimumServices: {
      status: "published",
      short: { ca: "Fixats pel Ministeri de Transports", es: "Fijados por el Ministerio de Transportes", en: "Set by the Ministry of Transport" },
      text: {
        ca: `El Ministeri de Transports va fixar els serveis mínims per resolució del 23 d'octubre, que va modificar el 28 d'octubre, totes dues a ${link(U.ministryRail, "la seva llista de resolucions ferroviàries")}.`,
        es: `El Ministerio de Transportes fijó los servicios mínimos por resolución de 23 de octubre, que modificó el 28 de octubre, ambas en ${link(U.ministryRail, "su lista de resoluciones ferroviarias")}.`,
        en: `The Ministry of Transport set minimum services in a resolution of 23 October, amended on 28 October; both are on ${link(U.ministryRail, "its list of rail resolutions")}.`,
      },
    },
    sources: [SRC.ministryRail],
  },
  {
    id: "huelga-ouigo-2026-10-30",
    dates: ["2026-10-30", "2026-11-02"],
    sector: "rail",
    status: "official",
    catalanEntry: "vaga-ouigo-2026-10-30",
    title: {
      ca: "vaga de maquinistes d'Ouigo (SEMAF)",
      es: "huelga de maquinistas de Ouigo (SEMAF)",
      en: "Ouigo train drivers' strike (SEMAF)",
    },
    label: { ca: "maquinistes d'Ouigo", es: "maquinistas de Ouigo", en: "Ouigo train drivers" },
    scope: {
      ca: "El personal de conducció d'Ouigo España.",
      es: "El personal de conducción de Ouigo España.",
      en: "Train drivers at Ouigo España.",
    },
    calledBy: { ca: "SEMAF.", es: "SEMAF.", en: "SEMAF." },
    basis: {
      ca: "Amb serveis mínims fixats pel Ministeri de Transports.",
      es: "Con servicios mínimos fijados por el Ministerio de Transportes.",
      en: "With minimum services set by the Ministry of Transport.",
    },
    minimumServices: {
      status: "published",
      short: { ca: "Fixats pel Ministeri de Transports", es: "Fijados por el Ministerio de Transportes", en: "Set by the Ministry of Transport" },
      text: {
        ca: `El Ministeri de Transports va fixar els serveis mínims per resolució del 27 d'octubre, a ${link(U.ministryRail, "la seva llista de resolucions ferroviàries")}.`,
        es: `El Ministerio de Transportes fijó los servicios mínimos por resolución de 27 de octubre, en ${link(U.ministryRail, "su lista de resoluciones ferroviarias")}.`,
        en: `The Ministry of Transport set minimum services in a resolution of 27 October, on ${link(U.ministryRail, "its list of rail resolutions")}.`,
      },
    },
    sources: [SRC.ministryRail],
  },
  {
    id: "huelga-carnicas-2026-11-09",
    // 12 and 13 Nov called off on 12 Nov after a pre-agreement (UGT FICA, meatCalledOff).
    dates: ["2026-11-09", "2026-11-10", "2026-11-11"],
    sector: "industry",
    status: "called",
    title: {
      ca: "vaga a les indústries càrnies",
      es: "huelga en las industrias cárnicas",
      en: "meat industry strike",
    },
    label: { ca: "indústries càrnies", es: "industrias cárnicas", en: "meat industry" },
    scope: {
      ca: "Les plantilles del sector d'indústries càrnies, a tot Espanya. No afecta el transport, la sanitat ni les escoles.",
      es: "Las plantillas del sector de industrias cárnicas, en toda España. No afecta al transporte, la sanidad ni los colegios.",
      en: "Workers in the meat-processing industry, all over Spain. It does not touch transport, health care or schools.",
    },
    calledBy: {
      ca: `UGT FICA i CCOO Indústria, segons ${link(U.meatCall, "la convocatòria que UGT FICA va publicar el 16 d'octubre")}.`,
      es: `UGT FICA y CCOO Industria, según ${link(U.meatCall, "la convocatoria que UGT FICA publicó el 16 de octubre")}.`,
      en: `The unions UGT FICA and CCOO Industria, according to ${link(U.meatCall, "the call UGT FICA published on 16 October")}.`,
    },
    basis: {
      ca: `Consta als avisos dels sindicats: la mediació prèvia al SIMA va acabar sense acord i van mantenir la convocatòria (${link(U.meatMediation, "UGT FICA, 22 d'octubre")}), i el 9 de novembre UGT FICA va informar de la primera jornada de vaga (${link(U.meatFirstDay, "la seva nota")}). El 12 de novembre, UGT FICA i CCOO van desconvocar les jornades del 12 i el 13 després d'un preacord (${link(U.meatCalledOff, "UGT FICA, 12 de novembre")}).`,
      es: `Consta en los avisos de los sindicatos: la mediación previa en el SIMA terminó sin acuerdo y mantuvieron la convocatoria (${link(U.meatMediation, "UGT FICA, 22 de octubre")}), y el 9 de noviembre UGT FICA informó de la primera jornada de huelga (${link(U.meatFirstDay, "su nota")}). El 12 de noviembre, UGT FICA y CCOO desconvocaron las jornadas del 12 y el 13 tras un preacuerdo (${link(U.meatCalledOff, "UGT FICA, 12 de noviembre")}).`,
      en: `It rests on the unions' own notices: the mediation at SIMA beforehand ended without agreement and they kept the call (${link(U.meatMediation, "UGT FICA, 22 October")}), and on 9 November UGT FICA reported on the first strike day (${link(U.meatFirstDay, "its note")}). On 12 November, UGT FICA and CCOO called off the 12th and 13th after a pre-agreement (${link(U.meatCalledOff, "UGT FICA, 12 November")}).`,
    },
    minimumServices: {
      status: "none",
      short: { ca: "No afecta serveis públics", es: "No afecta a servicios públicos", en: "No public service affected" },
      text: {
        ca: "És una vaga en una indústria privada: no afecta el transport, la sanitat ni les escoles.",
        es: "Es una huelga en una industria privada: no afecta al transporte, la sanidad ni los colegios.",
        en: "It is a strike in a private industry: transport, health care and schools are not affected.",
      },
    },
    sources: [
      { name: "UGT FICA y CCOO Industria convocan cinco días de huelga en el sector cárnico (16 de octubre de 2026)", url: U.meatCall, publisher: "UGT FICA" },
      { name: "Mediación en el SIMA sin acuerdo: se mantiene la huelga de industrias cárnicas (22 de octubre de 2026)", url: U.meatMediation, publisher: "UGT FICA" },
      { name: "Primera jornada de huelga en las industrias cárnicas (9 de noviembre de 2026)", url: U.meatFirstDay, publisher: "UGT FICA" },
      { name: "Desconvocada la huelga en las industrias cárnicas tras alcanzar un preacuerdo (12 de noviembre de 2026)", url: U.meatCalledOff, publisher: "UGT FICA" },
    ],
  },
  {
    id: "huelga-renfe-2026-11-10",
    // 12 Nov called off by SEMAF on 10 Nov: replaced by a strike on 23 Nov, called off in turn on 20 Nov (SPAIN_NOT_HAPPENING).
    dates: ["2026-11-10"],
    sector: "rail",
    status: "official",
    catalanEntry: "vaga-renfe-2026-11-10",
    guides: ["strikeRenfe"],
    title: {
      ca: "vaga de maquinistes del Grup Renfe (SEMAF)",
      es: "huelga de maquinistas del Grupo Renfe (SEMAF)",
      en: "Renfe train drivers' strike (SEMAF)",
    },
    label: { ca: "maquinistes de Renfe", es: "maquinistas de Renfe", en: "Renfe train drivers" },
    scope: {
      ca: "El personal de conducció del Grup Renfe, a tot Espanya: Rodalies, Mitjana Distància, AVE i Llarga Distància, i mercaderies.",
      es: "El personal de conducción del Grupo Renfe, en toda España: Cercanías, Media Distancia, AVE y Larga Distancia, y mercancías.",
      en: "Train drivers across the Renfe group, all over Spain: Cercanías commuter trains, Media Distancia regional trains, AVE and long-distance trains, and freight.",
    },
    hours: {
      ca: `El dia 10, aturada total, segons SEMAF. Les aturades parcials del dia 12 es van desconvocar el 10 de novembre, segons ${link(U.semaf23, "SEMAF")}, que les va substituir per una nova vaga el 23.`,
      es: `El día 10, paro total, según SEMAF. Los paros parciales del día 12 se desconvocaron el 10 de noviembre, según ${link(U.semaf23, "SEMAF")}, que los sustituyó por una nueva huelga el 23.`,
      en: `A full stoppage on the 10th, according to SEMAF. The partial stoppages on the 12th were called off on 10 November, according to ${link(U.semaf23, "SEMAF")}, which replaced them with a new strike on the 23rd.`,
    },
    calledBy: {
      ca: `El sindicat de maquinistes SEMAF, a ${link(U.semaf1012, "el seu comunicat")}.`,
      es: `El sindicato de maquinistas SEMAF, en ${link(U.semaf1012, "su comunicado")}.`,
      en: `The train drivers' union SEMAF, in ${link(U.semaf1012, "its notice")}.`,
    },
    basis: {
      ca: `El Ministeri de Transports en va fixar els serveis mínims per ${link(U.renfeSemafResolution, "resolució del 6 de novembre")}, publicada a ${link(U.ministryRail, "la seva llista de resolucions ferroviàries")}.`,
      es: `El Ministerio de Transportes fijó sus servicios mínimos por ${link(U.renfeSemafResolution, "resolución de 6 de noviembre")}, publicada en ${link(U.ministryRail, "su lista de resoluciones ferroviarias")}.`,
      en: `The Ministry of Transport set its minimum services in a ${link(U.renfeSemafResolution, "resolution of 6 November")}, published on ${link(U.ministryRail, "its list of rail resolutions")}.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "75% de Cercanías en hora punta i 50% la resta del dia",
        es: "75% de Cercanías en hora punta y 50% el resto del día",
        en: "75% of Cercanías trains at peak times, 50% the rest of the day",
      },
      text: {
        ca: `Segons ${link(U.renfeSemafNotice, "l'avís de Renfe")}: als trens de Cercanías, el 75% del servei habitual en hora punta (de 6.00 a 9.00 h, de 13.30 a 15.30 h i de 18.30 a 20.30 h) i el 50% la resta del dia; a Mitjana Distància, una mitjana del 65%; a l'AVE i la Llarga Distància, el 72%; a mercaderies, el 20%. A Catalunya, els serveis mínims de Rodalies els fixa la Generalitat.`,
        es: `Según ${link(U.renfeSemafNotice, "el aviso de Renfe")}: en Cercanías, el 75% del servicio habitual en hora punta (de 6.00 a 9.00 h, de 13.30 a 15.30 h y de 18.30 a 20.30 h) y el 50% el resto del día; en Media Distancia, una media del 65%; en AVE y Larga Distancia, el 72%; en mercancías, el 20%. En Cataluña, los servicios mínimos de Rodalies los fija la Generalitat.`,
        en: `According to ${link(U.renfeSemafNotice, "Renfe's notice")}: on Cercanías commuter trains, 75% of the usual service at peak times (06:00 to 09:00, 13:30 to 15:30 and 18:30 to 20:30) and 50% the rest of the day; on Media Distancia, 65% on average; on AVE and long-distance trains, 72%; on freight, 20%. In Catalonia, the Generalitat sets minimum services for Rodalies.`,
      },
    },
    sources: [
      { name: "SEMAF convoca huelga en el Grupo Renfe los días 10 y 12 de noviembre", url: U.semaf1012, publisher: "SEMAF" },
      { name: "Resolución de 6 de noviembre de 2026: servicios mínimos de la huelga de SEMAF en el Grupo Renfe (10 y 12 de noviembre)", url: U.renfeSemafResolution, publisher: MINISTRY },
      { name: "Establecidos los servicios mínimos para la huelga convocada por Semaf para el 10 y 12 de noviembre", url: U.renfeSemafNotice, publisher: "Renfe" },
      SRC.ministryRail,
      { name: "Primer Real Decreto-ley aprobado: SEMAF mueve el paro del 12 al 23 de noviembre (10/11/2026)", url: U.semaf23, publisher: "SEMAF" },
    ],
  },
  {
    id: "huelga-general-2026-11-11",
    dates: ["2026-11-11"],
    sector: "general",
    status: "official",
    catalanEntry: "vaga-general-2026-11-11",
    guides: ["strike11n", "strikes"],
    title: {
      ca: "vaga general de 24 hores",
      es: "huelga general de 24 horas",
      en: "24-hour general strike",
    },
    label: { ca: "vaga general", es: "huelga general", en: "general strike" },
    scope: {
      ca: "Tots els sectors, públics i privats, a tot Espanya.",
      es: "Todos los sectores, públicos y privados, en toda España.",
      en: "Every sector, public and private, all over Spain.",
    },
    hours: {
      ca: `De les 0.00 a les 24.00 h. Als centres amb torns, comença amb el primer torn, encara que entri abans de les 0.00 h, i acaba quan surt l'últim, segons la convocatòria que recull ${link(U.correosOrder, "l'Ordre INT/1170/2026")}.`,
      es: `De las 0.00 a las 24.00 h. En los centros con turnos, empieza con el primer turno, aunque entre antes de las 0.00 h, y termina cuando sale el último, según la convocatoria que recoge ${link(U.correosOrder, "la Orden INT/1170/2026")}.`,
      en: `From 00:00 to 24:00. Where people work shifts, it starts with the first shift, even if that begins before midnight, and ends when the last one finishes, according to the call as set out in ${link(U.correosOrder, "Order INT/1170/2026")}.`,
    },
    calledBy: {
      ca: `CCOO i UGT, que la van presentar amb el Sindicato de Inquilinas, CGT, CNT, Confederación Intersindical, CO.BAS i la Unión de Actores y Actrices, segons ${link(U.ccooRegistered, "CCOO")}. CGT hi té, a més, una convocatòria pròpia de jornada completa, segons l'Ordre INT/1170/2026.`,
      es: `CCOO y UGT, que la presentaron con el Sindicato de Inquilinas, CGT, CNT, Confederación Intersindical, CO.BAS y la Unión de Actores y Actrices, según ${link(U.ccooRegistered, "CCOO")}. CGT tiene además una convocatoria propia de jornada completa, según la Orden INT/1170/2026.`,
      en: `The unions CCOO and UGT, who presented it alongside the tenants' union Sindicato de Inquilinas, CGT, CNT, Confederación Intersindical, CO.BAS and the actors' union Unión de Actores y Actrices, according to ${link(U.ccooRegistered, "CCOO")}. CGT also has a full-day call of its own, according to Order INT/1170/2026.`,
    },
    basis: {
      ca: `La convocatòria està registrada, segons ${link(U.ccooRegistered, "CCOO")}, i té serveis mínims publicats al BOE i pel Ministeri de Transports.`,
      es: `La convocatoria está registrada, según ${link(U.ccooRegistered, "CCOO")}, y tiene servicios mínimos publicados en el BOE y por el Ministerio de Transportes.`,
      en: `The call is registered, according to ${link(U.ccooRegistered, "CCOO")}, and minimum services have been published in the BOE (the official state gazette) and by the Ministry of Transport.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "Publicats pel Ministeri de Transports i al BOE; la resta, cada comunitat autònoma",
        es: "Publicados por el Ministerio de Transportes y en el BOE; el resto, cada comunidad autónoma",
        en: "Published by the Ministry of Transport and in the BOE; the rest, by each region",
      },
      text: {
        ca: `Trens de Renfe, segons ${link(U.renfe11n, "el seu avís")}: a Cercanías, el 75% del servei habitual en hora punta (de 6.00 a 9.00 h, de 13.30 a 15.30 h i de 18.30 a 20.30 h) i el 50% la resta del dia; a Mitjana Distància, una mitjana del 65%; a l'AVE i la Llarga Distància, el 73%; a mercaderies, el 26%. El Ministeri de Transports publica les resolucions de cada operadora ferroviària a ${link(U.ministryRail, "la seva llista")} i la ${link(U.air11n, "resolució del transport aeri")} a ${link(U.ministryAir, "la d'aviació")}. Al BOE hi ha els de ${link(U.correosOrder, "Correus (Ordre INT/1170/2026)")} i els de ${link(U.securityOrder, "la seguretat privada (Resolució del 30 d'octubre de 2026)")}. El transport urbà, la sanitat i les escoles depenen de cada comunitat autònoma, que publica els seus.`,
        es: `Trenes de Renfe, según ${link(U.renfe11n, "su aviso")}: en Cercanías, el 75% del servicio habitual en hora punta (de 6.00 a 9.00 h, de 13.30 a 15.30 h y de 18.30 a 20.30 h) y el 50% el resto del día; en Media Distancia, una media del 65%; en AVE y Larga Distancia, el 73%; en mercancías, el 26%. El Ministerio de Transportes publica las resoluciones de cada operadora ferroviaria en ${link(U.ministryRail, "su lista")} y la ${link(U.air11n, "resolución del transporte aéreo")} en ${link(U.ministryAir, "la de aviación")}. En el BOE están los de ${link(U.correosOrder, "Correos (Orden INT/1170/2026)")} y los de ${link(U.securityOrder, "la seguridad privada (Resolución de 30 de octubre de 2026)")}. El transporte urbano, la sanidad y los colegios dependen de cada comunidad autónoma, que publica los suyos.`,
        en: `Renfe trains, according to ${link(U.renfe11n, "its notice")}: on Cercanías commuter trains, 75% of the usual service at peak times (06:00 to 09:00, 13:30 to 15:30 and 18:30 to 20:30) and 50% the rest of the day; on Media Distancia, 65% on average; on AVE and long-distance trains, 73%; on freight, 26%. The Ministry of Transport publishes each rail operator's resolution on ${link(U.ministryRail, "its rail list")} and the ${link(U.air11n, "air transport resolution")} on ${link(U.ministryAir, "its aviation list")}. The BOE carries those for ${link(U.correosOrder, "the post office, Correos (Order INT/1170/2026)")} and for ${link(U.securityOrder, "private security (Resolution of 30 October 2026)")}. City transport, health care and schools depend on each region, which publishes its own.`,
      },
    },
    sources: [
      { name: "Registro de la huelga general del 11N", url: U.ccooRegistered, publisher: "CCOO" },
      { name: "Orden INT/1170/2026: servicios mínimos en Correos durante la huelga general del 11 de noviembre de 2026", url: U.correosOrder, publisher: "Boletín Oficial del Estado" },
      { name: "Resolución de 30 de octubre de 2026: servicios mínimos de la seguridad privada durante la huelga general del 11 de noviembre", url: U.securityOrder, publisher: "Boletín Oficial del Estado" },
      { name: "Establecidos los servicios mínimos para la huelga general convocada el 11 de noviembre", url: U.renfe11n, publisher: "Renfe" },
      { name: "Resolución de servicios mínimos del transporte aéreo para la huelga general del 11 de noviembre de 2026", url: U.air11n, publisher: MINISTRY },
      SRC.ministryRail,
      SRC.ministryAir,
    ],
  },
  {
    id: "huelga-ferroviaria-2026-11-17",
    // 18 Nov 2026: the 19th (SCF at Adif) was called off on the 17th (SCFCOM 38); it is in SPAIN_NOT_HAPPENING.
    dates: ["2026-11-17"],
    sector: "rail",
    status: "official",
    catalanEntry: "vaga-ferroviaria-2026-11-17",
    // 17 Nov 2026: the 19th has a page of its own ("huelga renfe 19 noviembre" lands here and on the Renfe guide).
    guides: ["railStrike17n", "strike19n", "strikes"],
    title: {
      ca: "vaga ferroviària a Adif, Renfe i les operadores privades",
      es: "huelga ferroviaria en Adif, Renfe y las operadoras privadas",
      en: "rail strike at Adif, Renfe and the private operators",
    },
    label: { ca: "vaga ferroviària", es: "huelga ferroviaria", en: "rail strike" },
    scope: {
      ca: "El dia 17: tot el personal del Grup Renfe (Rodalies i Cercanías, Mitja Distància, AVE i Llarga Distància, mercaderies) i Adif, i els maquinistes d'Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain i Medway. L'aturada del personal de circulació d'Adif del dia 19 es va desconvocar.",
      es: "El día 17: toda la plantilla del Grupo Renfe (Cercanías y Rodalies, Media Distancia, AVE y Larga Distancia, mercancías) y Adif, y los maquinistas de Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain y Medway. El paro del personal de circulación de Adif del día 19 se desconvocó.",
      en: "On the 17th: all Renfe Group staff (Cercanías and Rodalies commuter trains, Media Distancia, AVE and long distance, freight) and Adif (the track operator), plus train drivers at Iryo, Ouigo, Transfesa, Continental Rail, Tracción Rail, Captrain and Medway. The stoppage by Adif's traffic-control staff on the 19th was called off.",
    },
    hours: {
      ca: "El 17, de 0.00 a 23.59 h al Grup Renfe, segons l'ordre de serveis mínims de la Generalitat; a Adif, aturada de 24 hores el 17, segons l'SCF.",
      es: "El 17, de 0.00 a 23.59 h en el Grupo Renfe, según la orden de servicios mínimos de la Generalitat; en Adif, paro de 24 horas el 17, según el SCF.",
      en: "On the 17th, 00:00 to 23:59 at the Renfe Group, according to the Generalitat's minimum-services order; at Adif, a 24-hour stoppage on the 17th, according to SCF.",
    },
    calledBy: {
      ca: `El dia 17, els sindicats del Comitè General d'Empresa d'Adif (${link(U.ccooRail17, "CCOO, 3 de novembre")}), als quals es va sumar el Comitè General d'Empresa de Renfe (${link(U.alferro80, "ALFERRO, comunicat 80/2026")}): al Grup Renfe hi han registrat vaga FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO i SFF-CGT, segons l'ordre de la Generalitat del 12 de novembre (${link(U.treballMs, "llista del Departament d'Empresa i Treball")}). SEMAF també crida els maquinistes de les altres operadores (${link(U.semafCuerpo, "SEMAF, 5 de novembre")}). El 17 i el 19, el sindicat SCF a Adif (${link(U.scfAdif, "SCF, 6 de novembre")}), que els mantenia el 12 de novembre (${link(U.scf35, "comunicat 35")}). CCOO, el 12 de novembre: «la huelga del 17 de noviembre sigue siendo necesaria» (${link(U.ccooRail17Still, "el seu comunicat")}); SEMAF, el 14: «Se mantienen los paros convocados para el día 17» (${link(U.semaf33, "comunicat 2026-33")}). El 17 de novembre al vespre, l'SCF va desconvocar el dia 19: «SCF ha acordado la desconvocatoria para el día 19» (${link(U.scf38, "comunicat 38")}).`,
      es: `El día 17, los sindicatos del Comité General de Empresa de Adif (${link(U.ccooRail17, "CCOO, 3 de noviembre")}), a los que se sumó el Comité General de Empresa de Renfe (${link(U.alferro80, "ALFERRO, comunicado 80/2026")}): en el Grupo Renfe han registrado huelga FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO y SFF-CGT, según la orden de la Generalitat del 12 de noviembre (${link(U.treballMs, "lista del Departament d'Empresa i Treball")}). SEMAF llama también a los maquinistas de las demás operadoras (${link(U.semafCuerpo, "SEMAF, 5 de noviembre")}). El 17 y el 19, el sindicato SCF en Adif (${link(U.scfAdif, "SCF, 6 de noviembre")}), que los mantenía el 12 de noviembre (${link(U.scf35, "comunicado 35")}). CCOO, el 12 de noviembre: «la huelga del 17 de noviembre sigue siendo necesaria» (${link(U.ccooRail17Still, "su comunicado")}); SEMAF, el 14: «Se mantienen los paros convocados para el día 17» (${link(U.semaf33, "comunicado 2026-33")}). La noche del 17 de noviembre, el SCF desconvocó el día 19: «SCF ha acordado la desconvocatoria para el día 19» (${link(U.scf38, "comunicado 38")}).`,
      en: `On the 17th, the unions on Adif's company-wide works council (${link(U.ccooRail17, "CCOO, 3 November")}), joined by Renfe's works council (${link(U.alferro80, "ALFERRO, notice 80/2026")}): at the Renfe Group, FeSMC-UGT, CCOO, SF-Intersindical, SEMAF, ALFERRO and SFF-CGT have registered strike calls, according to the Generalitat's order of 12 November (${link(U.treballMs, "the Catalan labour department's list")}). SEMAF also calls out drivers at the other operators (${link(U.semafCuerpo, "SEMAF, 5 November")}). On the 17th and the 19th, the SCF union at Adif (${link(U.scfAdif, "SCF, 6 November")}), which kept both days on 12 November (${link(U.scf35, "notice 35")}). CCOO on 12 November: "la huelga del 17 de noviembre sigue siendo necesaria" (the 17 November strike is still necessary; ${link(U.ccooRail17Still, "its notice")}); SEMAF on the 14th: "Se mantienen los paros convocados para el día 17" (the stoppages called for the 17th stand; ${link(U.semaf33, "notice 2026-33")}). On the evening of 17 November SCF called off the 19th: "SCF ha acordado la desconvocatoria para el día 19" (SCF has agreed to call off the 19th; ${link(U.scf38, "notice 38")}).`,
    },
    basis: {
      ca: `El 17, ${link(U.ministryRenfe17, "la resolució de serveis mínims del Ministeri de Transports del 12 de novembre")}, que cita les convocatòries del Comitè General del Grup Renfe, SEMAF, CCOO, UGT, SFF-CGT, SF-Intersindical i ALFERRO, de 0.00 a 23.59 h. El 19 (Adif) constava al comunicat de l'SCF, que el va desconvocar el 17 de novembre (${link(U.scf38, "comunicat 38")}).`,
      es: `El 17, ${link(U.ministryRenfe17, "la resolución de servicios mínimos del Ministerio de Transportes del 12 de noviembre")}, que cita las convocatorias del Comité General del Grupo Renfe, SEMAF, CCOO, UGT, SFF-CGT, SF-Intersindical y ALFERRO, de 0.00 a 23.59 h. El 19 (Adif) constaba en el comunicado del SCF, que lo desconvocó el 17 de noviembre (${link(U.scf38, "comunicado 38")}).`,
      en: `For the 17th, ${link(U.ministryRenfe17, "the Ministry of Transport's minimum-services resolution of 12 November")}, which cites the calls by the Renfe Group's works council, SEMAF, CCOO, UGT, SFF-CGT, SF-Intersindical and ALFERRO, 00:00 to 23:59. The 19th (Adif) rested on SCF's notice; SCF called it off on 17 November (${link(U.scf38, "notice 38")}).`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "Publicats: Cercanías 75% en hora punta, AVE 72%, Mitja Distància 65%",
        es: "Publicados: Cercanías 75% en hora punta, AVE 72%, Media Distancia 65%",
        en: "Published: Cercanías 75% at peak, AVE 72%, Media Distancia 65%",
      },
      text: {
        ca: `Per al 17, ${link(U.ministryRenfe17, "la resolució del Ministeri de Transports del 12 de novembre")} fixa al Grup Renfe: **Cercanías, el 75% del servei habitual en hora punta** (de 6.00 a 9.00, de 13.30 a 15.30 i de 18.30 a 20.30 h; fora de Madrid, la franja del migdia és de 13.30/14.00 a 15.30/16.00 h) **i el 50% la resta del dia**; **Mitja Distància, una mitjana del 65%** (444 de 682 trens); **AVE i Llarga Distància, el 72%** (177 de 246 trens), i mercaderies, el 26%. Renfe ho confirma en ${link(U.renfe17, "el seu avís del 14 de novembre")}. A **Iryo**, el 70% (28 de 40 trens), i a **Ouigo**, el 65,38% (17 de 26), segons les resolucions del 13 de novembre (${link(U.iryo17, "Iryo")}, ${link(U.ouigo17, "Ouigo")}). A **Cercanías de Bilbao i Sant Sebastià** els fixa el Govern Basc: el 50% en hora punta i el 25% la resta del dia (${link(U.euskadi17, "ordre del 13 de novembre")}); a **Rodalies de Catalunya** i els regionals, la Generalitat: el 66% i el 33% (${link(U.treballMs, "llista del Departament d'Empresa i Treball")}). **Adif, el 17:** sense resolució publicada. El {checked} no n'hi havia cap a ${link(U.ministryRail, "la llista del Ministeri")}; l'SCF deia que el personal d'Adif es regeix pels serveis mínims «determinados por la Secretaría de estado de transportes y movilidad sostenible y la Circular de Dirección General nº 5 del 13-11-2026» i que, durant les aturades, la circulació garanteix la seguretat del trànsit i les obres d'emergència (${link(U.scf37, "comunicat 37, 16 de novembre")}). **El 19:** desconvocat per l'SCF (${link(U.scf38, "comunicat 38")}).`,
        es: `Para el 17, ${link(U.ministryRenfe17, "la resolución del Ministerio de Transportes del 12 de noviembre")} fija en el Grupo Renfe: **Cercanías, el 75% del servicio habitual en hora punta** (de 6.00 a 9.00, de 13.30 a 15.30 y de 18.30 a 20.30 h; fuera de Madrid, la franja de mediodía es de 13.30/14.00 a 15.30/16.00 h) **y el 50% el resto del día**; **Media Distancia, una media del 65%** (444 de 682 trenes); **AVE y Larga Distancia, el 72%** (177 de 246 trenes), y mercancías, el 26%. Renfe lo confirma en ${link(U.renfe17, "su aviso del 14 de noviembre")}. En **Iryo**, el 70% (28 de 40 trenes), y en **Ouigo**, el 65,38% (17 de 26), según las resoluciones del 13 de noviembre (${link(U.iryo17, "Iryo")}, ${link(U.ouigo17, "Ouigo")}). En **Cercanías de Bilbao y San Sebastián** los fija el Gobierno Vasco: el 50% en hora punta y el 25% el resto del día (${link(U.euskadi17, "orden del 13 de noviembre")}); en **Rodalies de Catalunya** y los regionales, la Generalitat: el 66% y el 33% (${link(U.treballMs, "lista del Departament d'Empresa i Treball")}). **Adif, el 17:** sin resolución publicada. El {checked} no había ninguna en ${link(U.ministryRail, "la lista del Ministerio")}; el SCF decía que la plantilla de Adif se rige por los servicios mínimos «determinados por la Secretaría de estado de transportes y movilidad sostenible y la Circular de Dirección General nº 5 del 13-11-2026» y que, durante los paros, la circulación garantiza la seguridad del tráfico y las obras de emergencia (${link(U.scf37, "comunicado 37, 16 de noviembre")}). **El 19:** desconvocado por el SCF (${link(U.scf38, "comunicado 38")}).`,
        en: `For the 17th, ${link(U.ministryRenfe17, "the Ministry of Transport's resolution of 12 November")} sets at the Renfe Group: **Cercanías, 75% of the usual service at peak times** (06:00 to 09:00, 13:30 to 15:30 and 18:30 to 20:30; outside Madrid the midday band is 13:30/14:00 to 15:30/16:00) **and 50% the rest of the day**; **Media Distancia, 65% on average** (444 of 682 trains); **AVE and long distance, 72%** (177 of 246 trains); freight, 26%. Renfe confirms it in ${link(U.renfe17, "its notice of 14 November")}. **Iryo**, 70% (28 of 40 trains), and **Ouigo**, 65.38% (17 of 26), under the resolutions of 13 November (${link(U.iryo17, "Iryo")}, ${link(U.ouigo17, "Ouigo")}). On **Cercanías Bilbao and San Sebastián** the Basque Government sets them: 50% at peak times and 25% the rest of the day (${link(U.euskadi17, "order of 13 November")}); on **Rodalies de Catalunya** and regional trains, the Generalitat: 66% and 33% (${link(U.treballMs, "the Catalan labour department's list")}). **Adif, 17th:** no resolution published. On {checked} there was none on ${link(U.ministryRail, "the Ministry's list")}; SCF said Adif staff follow the minimum services "determinados por la Secretaría de estado de transportes y movilidad sostenible y la Circular de Dirección General nº 5 del 13-11-2026" (set by the Secretary of State for Transport and Adif's Circular no. 5 of 13 November) and that during the stoppages traffic control keeps rail traffic safe and emergency works going (${link(U.scf37, "notice 37, 16 November")}). **The 19th:** called off by SCF (${link(U.scf38, "notice 38")}).`,
      },
    },
    sources: [
      { name: "CCOO anuncia movilizaciones los días 16 y 17 de noviembre (3 de noviembre de 2026)", url: U.ccooRail17, publisher: "CCOO, Sector Ferroviario" },
      { name: "Comunicado 80/2026: modificación de las fechas de huelga de noviembre de 2026", url: U.alferro80, publisher: "ALFERRO" },
      { name: "Encuentro con el ministro Carlos Cuerpo: alcance de las movilizaciones (5 de noviembre de 2026)", url: U.semafCuerpo, publisher: "SEMAF" },
      { name: "SCFCOM 33: SCF convoca huelga en Adif (6 de noviembre de 2026)", url: U.scfAdif, publisher: "Sindicato de Circulación Ferroviario (SCF)" },
      { name: "SCFCOM 35: Las motivaciones de una negociación (12 de noviembre de 2026)", url: U.scf35, publisher: "Sindicato de Circulación Ferroviario (SCF)" },
      { name: "Avances en seguridad y derechos que deben notarse en el trabajo (12 de noviembre de 2026)", url: U.ccooRail17Still, publisher: "CCOO, Sector Ferroviario" },
      SRC.ministryRail,
      { name: "Serveis mínims en cas de vaga", url: U.treballMs, publisher: "Generalitat de Catalunya, Departament d'Empresa i Treball" },
      { name: "Resolución de 12 de noviembre de 2026: servicios mínimos en el Grupo Renfe el 17 de noviembre", url: U.ministryRenfe17, publisher: MINISTRY },
      { name: "Establecidos los servicios mínimos para la huelga convocada para el 17 de noviembre en el Grupo Renfe (14 de noviembre de 2026)", url: U.renfe17, publisher: "Renfe" },
      { name: "Resolución de servicios mínimos en Intermodalidad de Levante (Iryo), 17 de noviembre de 2026", url: U.iryo17, publisher: MINISTRY },
      { name: "Resolución de servicios mínimos en Ouigo España, 17 de noviembre de 2026", url: U.ouigo17, publisher: MINISTRY },
      { name: "Orden de 13 de noviembre de 2026: servicios mínimos del Grupo Renfe en Euskadi (Cercanías), 17 de noviembre", url: U.euskadi17, publisher: "Gobierno Vasco, Departamento de Economía, Trabajo y Empleo" },
      { name: "Reunión de trabajo con el Ministerio de Transportes; las movilizaciones por la Seguridad continúan (nº 2026-33, 14 de noviembre de 2026)", url: U.semaf33, publisher: "SEMAF" },
      { name: "SCFCOM 37: Todos a la huelga (16 de noviembre de 2026)", url: U.scf37, publisher: "Sindicato de Circulación Ferroviario (SCF)" },
      SRC.scf38,
    ],
  },
  {
    id: "huelga-medicos-smu-2026-11-16",
    dates: ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27"],
    sector: "health",
    doctors: true,
    status: "official",
    catalanEntry: "vaga-metges-smu-2026-11-16",
    // The marches of the 19th are on that day's page.
    guides: ["strike19n"],
    title: {
      ca: "vaga de metges a la sanitat pública (Sindicato Médicos Unidos)",
      es: "huelga de médicos en la sanidad pública (Sindicato Médicos Unidos)",
      en: "doctors' strike in public healthcare (Sindicato Médicos Unidos)",
    },
    label: { ca: "metges (SMU)", es: "médicos (SMU)", en: "doctors (SMU)" },
    scope: {
      ca: "Els metges, també els residents en formació (MIR), dels centres sanitaris públics dels serveis de salut de totes les comunitats autònomes i dels que gestiona l'INGESA a Ceuta i Melilla.",
      es: "Los médicos, también los residentes en formación (MIR), de los centros sanitarios públicos de los servicios de salud de todas las comunidades autónomas y de los que gestiona el INGESA en Ceuta y Melilla.",
      en: "Doctors, residents in training (MIR) included, at the public health centres of every region's health service and those run by INGESA in Ceuta and Melilla.",
    },
    hours: {
      ca: "Des de les 8.00 h del dilluns 16 fins a les 8.00 h del dissabte 28 de novembre (a Canàries, hora local), cada dia: és la primera fase d'una vaga indefinida, amb aturada total excepte els serveis mínims.",
      es: "Desde las 8.00 h del lunes 16 hasta las 8.00 h del sábado 28 de noviembre (en Canarias, hora local), todos los días: es la primera fase de una huelga indefinida, con cese total de la actividad salvo los servicios mínimos.",
      en: "From 08:00 on Monday 16 to 08:00 on Saturday 28 November (local time in the Canaries), every day: it is the first phase of an open-ended strike, a full stoppage except for minimum services.",
    },
    calledBy: {
      ca: `El Sindicato Médicos Unidos (SMU), en ${link(U.smuNotice, "el seu preavís de vaga d'àmbit estatal")}, adreçat al Ministeri de Treball, al de Sanitat i als serveis de salut. Convoca també manifestacions el dijous 19 de novembre a les 18.00 h en una vintena de ciutats, entre les quals Madrid, Barcelona, Sevilla, Bilbao i Palma (${link(U.smuMarches, "llista del sindicat")}). És una convocatòria diferent de la de CESM, que continua ajornada.`,
      es: `El Sindicato Médicos Unidos (SMU), en ${link(U.smuNotice, "su preaviso de huelga de ámbito estatal")}, dirigido al Ministerio de Trabajo, al de Sanidad y a los servicios de salud. Convoca también manifestaciones el jueves 19 de noviembre a las 18.00 h en una veintena de ciudades, entre ellas Madrid, Barcelona, Sevilla, Bilbao y Palma (${link(U.smuMarches, "lista del sindicato")}). Es una convocatoria distinta de la de CESM, que sigue aplazada.`,
      en: `Sindicato Médicos Unidos (SMU), in ${link(U.smuNotice, "its notice of a nationwide strike")} to the Ministries of Labour and Health and the regional health services. It also calls marches on Thursday 19 November at 18:00 in some twenty cities, Madrid, Barcelona, Seville, Bilbao and Palma among them (${link(U.smuMarches, "the union's list")}). It is a different call from CESM's, which stays postponed.`,
    },
    basis: {
      ca: `Hi ha ordres de serveis mínims: el sindicat publica la de cada comunitat a ${link(U.smuDocs, "la documentació de la convocatòria")}, i a Catalunya l'ordre del Departament d'Empresa i Treball del 13 de novembre és a ${link(U.treballMsList, "la llista oficial de vagues amb serveis mínims")}.`,
      es: `Hay órdenes de servicios mínimos: el sindicato publica la de cada comunidad en ${link(U.smuDocs, "la documentación de la convocatoria")}, y en Cataluña la orden del Departament d'Empresa i Treball del 13 de noviembre está en ${link(U.treballMsList, "la lista oficial de huelgas con servicios mínimos")}.`,
      en: `Minimum-services orders are out: the union posts each region's in ${link(U.smuDocs, "its strike documents")}, and in Catalonia the Department of Business and Labour's order of 13 November is on ${link(U.treballMsList, "the official list of strikes with minimum services")}.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "Els fixa cada comunitat; a Catalunya, urgències i unitats especials amb normalitat",
        es: "Los fija cada comunidad; en Cataluña, urgencias y unidades especiales con normalidad",
        en: "Set by each region; in Catalonia, A&E and special units run normally",
      },
      text: {
        ca: `Els fixa cada servei de salut, amb una ordre pròpia (${link(U.smuDocs, "totes, a la pàgina del sindicat")}). **A Catalunya**, ${link(U.treballMsList, "l'ordre del Departament d'Empresa i Treball del 13 de novembre")} manté amb normalitat les urgències, les unitats especials (cures intensives, unitats coronàries, hemodiàlisi, neonatologia, parts, radioteràpia i quimioteràpia), la cirurgia urgent que no es pot ajornar i l'atenció urgent dels CUAP, els PAC i els PADES; la resta de l'atenció primària, amb el 25% de la plantilla; els altres serveis, com un dia festiu (o amb el 50% on un festiu es treballa amb la plantilla d'un dia feiner), i les donacions de sang, al 50%. El transport sanitari urgent i les emergències mèdiques es mantenen.`,
        es: `Los fija cada servicio de salud, con una orden propia (${link(U.smuDocs, "todas, en la página del sindicato")}). **En Cataluña**, ${link(U.treballMsList, "la orden del Departament d'Empresa i Treball del 13 de noviembre")} mantiene con normalidad las urgencias, las unidades especiales (cuidados intensivos, unidades coronarias, hemodiálisis, neonatología, partos, radioterapia y quimioterapia), la cirugía urgente que no se puede aplazar y la atención urgente de los CUAP, los PAC y los PADES; el resto de la atención primaria, con el 25% de la plantilla; los demás servicios, como un día festivo (o con el 50% donde un festivo se trabaja con la plantilla de un día laborable), y las donaciones de sangre, al 50%. El transporte sanitario urgente y las emergencias médicas se mantienen.`,
        en: `Each health service sets them in an order of its own (${link(U.smuDocs, "all of them on the union's page")}). **In Catalonia**, ${link(U.treballMsList, "the Department of Business and Labour's order of 13 November")} keeps A&E, the special units (intensive care, coronary units, haemodialysis, neonatal care, maternity, radiotherapy and chemotherapy), urgent surgery that cannot wait and urgent care at the CUAP, PAC and PADES running normally; the rest of primary care runs with 25% of staff; other services as on a public holiday (or with 50% where a holiday is staffed like a working day), and blood donations at 50%. Urgent patient transport and medical emergencies are kept.`,
      },
    },
    sources: [
      { name: "Comunicación de huelga de ámbito estatal del personal médico del Sistema Nacional de Salud (preaviso, 4 de noviembre de 2026)", url: U.smuNotice, publisher: "Sindicato Médicos Unidos (SMU)" },
      { name: "Documentación de la convocatoria: preavisos y órdenes de servicios mínimos por comunidad", url: U.smuDocs, publisher: "Sindicato Médicos Unidos (SMU)" },
      { name: "Manifestaciones del 19 de noviembre de 2026", url: U.smuMarches, publisher: "Sindicato Médicos Unidos (SMU)" },
      { name: "Informació de vagues amb serveis mínims (e-Tauler): ordre del 13 de novembre de 2026, assistència sanitària de l'ICS i del SISCAT", url: U.treballMsList, publisher: "Generalitat de Catalunya, Departament d'Empresa i Treball" },
    ],
  },
  {
    id: "huelga-limpieza-bizkaia-2026-11-17",
    dates: ["2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20"],
    sector: "services",
    status: "official",
    title: {
      ca: "vaga de la neteja d'edificis i locals a Biscaia (ELA)",
      es: "huelga de la limpieza de edificios y locales en Bizkaia (ELA)",
      en: "building-cleaning strike in Bizkaia (ELA)",
    },
    label: { ca: "neteja a Biscaia", es: "limpieza en Bizkaia", en: "cleaning in Bizkaia" },
    scope: {
      ca: "Les plantilles de la neteja d'edificis i locals de la província de Biscaia, també la neteja de l'aeroport de Bilbao.",
      es: "Las plantillas de la limpieza de edificios y locales de la provincia de Bizkaia, también la limpieza del aeropuerto de Bilbao.",
      en: "Building and premises cleaning staff in the province of Bizkaia, cleaning at Bilbao airport included.",
    },
    hours: {
      ca: "Tota la jornada, del dimarts 17 al divendres 20 de novembre, segons la resolució del Ministeri de Transports.",
      es: "Toda la jornada, del martes 17 al viernes 20 de noviembre, según la resolución del Ministerio de Transportes.",
      en: "The whole working day, Tuesday 17 to Friday 20 November, according to the Ministry of Transport's resolution.",
    },
    calledBy: {
      ca: `El sindicat ELA, que va comunicar la vaga al Govern Basc el 12 d'octubre de 2026, segons ${link(U.elaResolution, "la resolució del Ministeri de Transports")}.`,
      es: `El sindicato ELA, que comunicó la huelga al Gobierno Vasco el 12 de octubre de 2026, según ${link(U.elaResolution, "la resolución del Ministerio de Transportes")}.`,
      en: `The ELA union, which notified the Basque Government of the strike on 12 October 2026, according to ${link(U.elaResolution, "the Ministry of Transport's resolution")}.`,
    },
    basis: {
      ca: `${link(U.elaResolution, "La resolució de serveis mínims del Ministeri de Transports del 13 de novembre")} per a l'aeroport de Bilbao, a ${link(U.ministryAir, "la seva llista del transport aeri")}.`,
      es: `${link(U.elaResolution, "La resolución de servicios mínimos del Ministerio de Transportes del 13 de noviembre")} para el aeropuerto de Bilbao, en ${link(U.ministryAir, "su lista del transporte aéreo")}.`,
      en: `${link(U.elaResolution, "The Ministry of Transport's minimum-services resolution of 13 November")} for Bilbao airport, on ${link(U.ministryAir, "its air-transport list")}.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "Fixats pel Govern Basc i, a l'aeroport de Bilbao, pel Ministeri de Transports",
        es: "Fijados por el Gobierno Vasco y, en el aeropuerto de Bilbao, por el Ministerio",
        en: "Set by the Basque Government and, at Bilbao airport, by the Ministry of Transport",
      },
      text: {
        ca: `A l'aeroport de Bilbao, ${link(U.elaResolution, "la resolució del Ministeri de Transports del 13 de novembre")} fixa el **50% de la plantilla programada** per als lavabos de les terminals, les dependències tècniques i de control del trànsit aeri i l'exterior de les terminals al costat aire, i el **25%** per a la resta de zones públiques; la neteja dels avions es manté segons el tipus de vol (tots els d'emergència, la majoria dels que van a les illes). Fora de l'aeroport, ${link(U.euskadiCleaning, "l'ordre del Govern Basc del 13 de novembre")} fixa als centres sanitaris la neteja estrictament necessària per a urgències, quiròfans, residus sanitaris, cuina i persones ingressades, amb el personal d'un festiu; a les residències i els centres de dia, només la de les zones de risc greu, amb el 20% del personal; i a les escoles bressol i d'educació infantil, una persona per als lavabos i els residus.`,
        es: `En el aeropuerto de Bilbao, ${link(U.elaResolution, "la resolución del Ministerio de Transportes del 13 de noviembre")} fija el **50% de la plantilla programada** para los aseos de las terminales, las dependencias técnicas y de control del tráfico aéreo y el exterior de las terminales en el lado aire, y el **25%** para el resto de zonas públicas; la limpieza de los aviones se mantiene según el tipo de vuelo (todos los de emergencia, la mayoría de los que van a las islas). Fuera del aeropuerto, ${link(U.euskadiCleaning, "la orden del Gobierno Vasco del 13 de noviembre")} fija en los centros sanitarios la limpieza estrictamente necesaria para urgencias, quirófanos, residuos sanitarios, cocina y personas hospitalizadas, con el personal de un festivo; en las residencias y los centros de día, solo la de las zonas de riesgo grave, con el 20% del personal; y en las haurreskolak y los centros de educación infantil, una persona para los baños y los residuos.`,
        en: `At Bilbao airport, ${link(U.elaResolution, "the Ministry of Transport's resolution of 13 November")} sets **50% of scheduled staff** for terminal toilets, the technical and air-traffic-control premises and the outside of the terminals airside, and **25%** for the other public areas; aircraft cleaning is kept according to the type of flight (every emergency flight, most flights to the islands). Away from the airport, ${link(U.euskadiCleaning, "the Basque Government's order of 13 November")} keeps at health centres only the cleaning strictly needed for A&E, operating theatres, clinical waste, kitchens and inpatients, with holiday staffing; at care homes and day centres, only areas with a serious risk, with 20% of staff; and at nursery and infant schools, one person for toilets and waste.`,
      },
    },
    sources: [
      { name: "Resolución de servicios mínimos en el transporte aéreo durante la huelga sectorial de limpieza de edificios y locales en Bizkaia convocada por ELA (13 de noviembre de 2026)", url: U.elaResolution, publisher: MINISTRY },
      SRC.ministryAir,
      { name: "Orden de 13 de noviembre de 2026: servicio esencial del sector de limpieza de edificios y locales de Bizkaia, huelga del 17 al 20 de noviembre (PDF)", url: U.euskadiCleaning, publisher: "Gobierno Vasco, Departamento de Economía, Trabajo y Empleo" },
    ],
  },
  {
    id: "huelga-estudiantil-2026-11-20",
    dates: ["2026-11-20"],
    sector: "education",
    status: "called",
    guides: ["strike20n"],
    title: {
      ca: "vaga estudiantil europea",
      es: "huelga estudiantil europea",
      en: "European student strike",
    },
    label: { ca: "vaga estudiantil", es: "huelga estudiantil", en: "student strike" },
    scope: {
      ca: "Estudiants, des de 3r d'ESO. No és una vaga laboral: els professors i els centres no hi estan convocats.",
      es: "Estudiantes, desde 3.º de ESO. No es una huelga laboral: el profesorado y los centros no están convocados.",
      en: "Students, from the third year of secondary school (ESO). It is not a labour strike: teachers and schools are not called out.",
    },
    hours: {
      ca: `Tota la jornada lectiva, de matí i de tarda, segons ${link(U.studentsNotice, "la comunicació que el Sindicato de Estudiantes fa arribar a les direccions dels centres")}; mobilitzacions a les 12 h.`,
      es: `Toda la jornada lectiva, también la de la tarde, según ${link(U.studentsNotice, "la comunicación que el Sindicato de Estudiantes hace llegar a las direcciones de los centros")}; movilizaciones a las 12 h.`,
      en: `The whole school day, morning and afternoon, according to ${link(U.studentsNotice, "the notice Sindicato de Estudiantes hands to school heads")}; demonstrations at 12:00.`,
    },
    calledBy: {
      ca: `El Sindicato de Estudiantes, amb organitzacions estudiantils d'altres països europeus, a ${link(U.students, "la seva convocatòria del 30 d'octubre")}.`,
      es: `El Sindicato de Estudiantes, con organizaciones estudiantiles de otros países europeos, en ${link(U.students, "su convocatoria del 30 de octubre")}.`,
      en: `The students' union Sindicato de Estudiantes, with student organisations from other European countries, in ${link(U.students, "its call of 30 October")}.`,
    },
    basis: {
      ca: "Consta a l'avís de l'organització estudiantil que la convoca.",
      es: "Consta en el aviso de la organización estudiantil que la convoca.",
      en: "It rests on the notice of the student organisation that calls it.",
    },
    minimumServices: {
      status: "none",
      short: { ca: "No és una vaga laboral", es: "No es una huelga laboral", en: "Not a labour strike" },
      text: {
        ca: "La convoca una organització estudiantil i s'adreça als estudiants: no és una vaga laboral.",
        es: "La convoca una organización estudiantil y se dirige a los estudiantes: no es una huelga laboral.",
        en: "A student organisation calls it and it is addressed to students: it is not a labour strike.",
      },
    },
    sources: [
      { name: "20N: huelga estudiantil europea (30 de octubre de 2026)", url: U.students, publisher: "Sindicato de Estudiantes" },
      { name: "Comunicación oficial a los equipos directivos: huelga de estudiantes del viernes 20 de noviembre de 2026", url: U.studentsNotice, publisher: "Sindicato de Estudiantes" },
    ],
  },
  {
    // 19 Nov 2026 (read that day): the Basque Government's order of 17 Nov, on its list of minimum-services orders.
    id: "huelga-residencias-bizkaia-2026-11-19",
    dates: ["2026-11-19", "2026-12-17", "2027-01-21"],
    sector: "services",
    status: "official",
    title: {
      ca: "vaga a les residències i els centres de dia per a gent gran de Biscaia (LAB, ELA)",
      es: "huelga en las residencias y centros de día de mayores de Bizkaia (LAB, ELA)",
      en: "strike at care homes and day centres for older people in Bizkaia (LAB, ELA)",
    },
    label: { ca: "residències de gent gran a Biscaia", es: "residencias de mayores en Bizkaia", en: "care homes in Bizkaia" },
    scope: {
      ca: "Les residències privades de gent gran de Biscaia (LAB) i els centres per a gent gran de Biscaia: residències, habitatges comunitaris i centres de dia (ELA).",
      es: "Las residencias privadas de mayores de Bizkaia (LAB) y los centros de mayores de Bizkaia: residencias, viviendas comunitarias y centros de día (ELA).",
      en: "Private care homes for older people in Bizkaia (LAB) and Bizkaia's centres for older people: care homes, community housing and day centres (ELA).",
    },
    hours: {
      ca: "Tota la jornada (24 hores) el dijous 19 de novembre, i de nou el 17 de desembre de 2026 i el 21 de gener de 2027, segons l'ordre del Govern Basc.",
      es: "Toda la jornada (24 horas) el jueves 19 de noviembre, y de nuevo el 17 de diciembre de 2026 y el 21 de enero de 2027, según la orden del Gobierno Vasco.",
      en: "The whole day (24 hours) on Thursday 19 November, and again on 17 December 2026 and 21 January 2027, according to the Basque Government's order.",
    },
    calledBy: {
      ca: `Els sindicats LAB i ELA, segons ${link(U.euskadiCareBizkaia, "l'ordre de serveis mínims del Govern Basc del 17 de novembre")}.`,
      es: `Los sindicatos LAB y ELA, según ${link(U.euskadiCareBizkaia, "la orden de servicios mínimos del Gobierno Vasco del 17 de noviembre")}.`,
      en: `The LAB and ELA unions, according to ${link(U.euskadiCareBizkaia, "the Basque Government's minimum-services order of 17 November")}.`,
    },
    basis: {
      ca: `${link(U.euskadiCareBizkaia, "L'ordre del Govern Basc del 17 de novembre")}, a ${link(U.euskadiList, "la seva llista d'ordres de serveis mínims")}.`,
      es: `${link(U.euskadiCareBizkaia, "La orden del Gobierno Vasco del 17 de noviembre")}, en ${link(U.euskadiList, "su lista de órdenes de servicios mínimos")}.`,
      en: `${link(U.euskadiCareBizkaia, "The Basque Government's order of 17 November")}, on ${link(U.euskadiList, "its list of minimum-services orders")}.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "Residències: 50% dels gerocultors (70% amb més dependència) i 100% de nit",
        es: "Residencias: 50% de gerocultores (70% con más dependencia) y 100% de noche",
        en: "Care homes: 50% of care staff (70% where most are highly dependent), 100% at night",
      },
      text: {
        ca: `${link(U.euskadiCareBizkaia, "L'ordre del Govern Basc del 17 de novembre")} manté a les residències el **50% del personal gerocultor** d'atenció directa (un 10% més a les hores dels àpats i de 8.00 a 10.30 h i de 20.00 a 22.00 h), el **70%** on més del 70% dels residents tenen una dependència de grau II o III, i el **100% al torn de nit**; als centres de dia, el 50% de l'atenció directa i el transport adaptat de les persones que no hi poden anar d'una altra manera; infermeria i cuina, al 50%, i neteja, al 20%.`,
        es: `${link(U.euskadiCareBizkaia, "La orden del Gobierno Vasco del 17 de noviembre")} mantiene en las residencias el **50% del personal gerocultor** de atención directa (un 10% más en las horas de las comidas y de 8.00 a 10.30 h y de 20.00 a 22.00 h), el **70%** donde más del 70% de los residentes tienen una dependencia de grado II o III, y el **100% en el turno de noche**; en los centros de día, el 50% de la atención directa y el transporte adaptado de quienes no pueden ir de otra forma; enfermería y cocina, al 50%, y limpieza, al 20%.`,
        en: `${link(U.euskadiCareBizkaia, "The Basque Government's order of 17 November")} keeps **50% of direct-care staff** in care homes (10% more at mealtimes, 08:00 to 10:30 and 20:00 to 22:00), **70%** where more than 70% of residents have grade II or III dependency, and **100% on the night shift**; at day centres, 50% of direct care and the adapted transport of people who cannot get there otherwise; nursing and kitchen staff at 50%, cleaning at 20%.`,
      },
    },
    sources: [
      { name: "Orden de 17 de noviembre de 2026: servicio esencial en el sector de centros de la tercera edad de Bizkaia, huelga del 19 de noviembre y el 17 de diciembre de 2026 y el 21 de enero de 2027 (PDF)", url: U.euskadiCareBizkaia, publisher: "Gobierno Vasco, Departamento de Economía, Trabajo y Empleo" },
      { name: "Órdenes de servicios mínimos", url: U.euskadiList, publisher: "Gobierno Vasco" },
    ],
  },
  {
    // 19 Nov 2026 (read that day): the Basque Government's order of 17 Nov, on its list of minimum-services orders.
    id: "huelga-residencias-gipuzkoa-2026-11-20",
    dates: ["2026-11-20", "2026-12-22", "2026-12-23"],
    sector: "services",
    status: "official",
    title: {
      ca: "vaga a les residències privades de gent gran de Guipúscoa (ELA)",
      es: "huelga en las residencias privadas de mayores de Gipuzkoa (ELA)",
      en: "strike at private care homes for older people in Gipuzkoa (ELA)",
    },
    label: { ca: "residències de gent gran a Guipúscoa", es: "residencias de mayores en Gipuzkoa", en: "care homes in Gipuzkoa" },
    scope: {
      ca: "Les residències privades de gent gran de Guipúscoa.",
      es: "Las residencias privadas de mayores de Gipuzkoa.",
      en: "Private care homes for older people in Gipuzkoa.",
    },
    hours: {
      ca: "Jornada completa el divendres 20 de novembre, i de nou el 22 i el 23 de desembre de 2026, segons l'ordre del Govern Basc.",
      es: "Jornada completa el viernes 20 de noviembre, y de nuevo el 22 y el 23 de diciembre de 2026, según la orden del Gobierno Vasco.",
      en: "A full working day on Friday 20 November, and again on 22 and 23 December 2026, according to the Basque Government's order.",
    },
    calledBy: {
      ca: `El sindicat ELA, segons ${link(U.euskadiCareGipuzkoa, "l'ordre de serveis mínims del Govern Basc del 17 de novembre")}.`,
      es: `El sindicato ELA, según ${link(U.euskadiCareGipuzkoa, "la orden de servicios mínimos del Gobierno Vasco del 17 de noviembre")}.`,
      en: `The ELA union, according to ${link(U.euskadiCareGipuzkoa, "the Basque Government's minimum-services order of 17 November")}.`,
    },
    basis: {
      ca: `${link(U.euskadiCareGipuzkoa, "L'ordre del Govern Basc del 17 de novembre")}, a ${link(U.euskadiList, "la seva llista d'ordres de serveis mínims")}.`,
      es: `${link(U.euskadiCareGipuzkoa, "La orden del Gobierno Vasco del 17 de noviembre")}, en ${link(U.euskadiList, "su lista de órdenes de servicios mínimos")}.`,
      en: `${link(U.euskadiCareGipuzkoa, "The Basque Government's order of 17 November")}, on ${link(U.euskadiList, "its list of minimum-services orders")}.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "Residències: 50% dels gerocultors (70% amb més dependència) i 100% de nit",
        es: "Residencias: 50% de gerocultores (70% con más dependencia) y 100% de noche",
        en: "Care homes: 50% of care staff (70% where most are highly dependent), 100% at night",
      },
      text: {
        ca: `${link(U.euskadiCareGipuzkoa, "L'ordre del Govern Basc del 17 de novembre")} manté a les residències el **50% del personal gerocultor** d'atenció directa (un 10% més a les hores dels àpats i de 8.00 a 10.30 h i de 20.00 a 22.00 h), el **70%** on més del 70% dels residents tenen una dependència de grau II o III, i el **100% al torn de nit**; infermeria i cuina, al 50%, i neteja, al 20%.`,
        es: `${link(U.euskadiCareGipuzkoa, "La orden del Gobierno Vasco del 17 de noviembre")} mantiene en las residencias el **50% del personal gerocultor** de atención directa (un 10% más en las horas de las comidas y de 8.00 a 10.30 h y de 20.00 a 22.00 h), el **70%** donde más del 70% de los residentes tienen una dependencia de grado II o III, y el **100% en el turno de noche**; enfermería y cocina, al 50%, y limpieza, al 20%.`,
        en: `${link(U.euskadiCareGipuzkoa, "The Basque Government's order of 17 November")} keeps **50% of direct-care staff** in care homes (10% more at mealtimes, 08:00 to 10:30 and 20:00 to 22:00), **70%** where more than 70% of residents have grade II or III dependency, and **100% on the night shift**; nursing and kitchen staff at 50%, cleaning at 20%.`,
      },
    },
    sources: [
      { name: "Orden de 17 de noviembre de 2026: servicio esencial en el sector de residencias privadas de la tercera edad de Gipuzkoa, huelga del 20 de noviembre y el 22 y 23 de diciembre de 2026 (PDF)", url: U.euskadiCareGipuzkoa, publisher: "Gobierno Vasco, Departamento de Economía, Trabajo y Empleo" },
      { name: "Órdenes de servicios mínimos", url: U.euskadiList, publisher: "Gobierno Vasco" },
    ],
  },
  {
    // 19 Nov 2026 (read that day): Orden INT/1239/2026 of 17 Nov, BOE núm. 288 of 19 Nov. The caller and hours are the order's.
    id: "huelga-correos-2026-11-23",
    dates: ["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27"],
    sector: "services",
    status: "official",
    // 19 Nov 2026: its first day is on the 23 Nov page (strike-days-2326n.ts), linked until that day has passed.
    guides: ["postalVote", "strike23n"],
    title: {
      ca: "vaga a Correus a Madrid i a cinc províncies andaluses (Sindicato Libre de Correos)",
      es: "huelga en Correos en Madrid y en cinco provincias andaluzas (Sindicato Libre de Correos)",
      en: "Correos (Spanish post) strike in Madrid and five Andalusian provinces (Sindicato Libre de Correos)",
    },
    label: { ca: "Correus (Madrid i Andalusia)", es: "Correos (Madrid y Andalucía)", en: "Correos (Madrid, Andalusia)" },
    // 24 Nov 2026: in the five Andalusian provinces the strike ends on Wednesday 25 (the order: "del 23 al 25"); the 26th and the 27th are Madrid's only.
    dayNotes: {
      "2026-11-26": {
        ca: "vaga a Correus, aquest dia només a la Comunitat de Madrid (Sindicato Libre de Correos)",
        es: "huelga en Correos, ese día solo en la Comunidad de Madrid (Sindicato Libre de Correos)",
        en: "Correos (Spanish post) strike, that day in the Community of Madrid only (Sindicato Libre de Correos)",
      },
      "2026-11-27": {
        ca: "vaga a Correus, aquest dia només a la Comunitat de Madrid (Sindicato Libre de Correos)",
        es: "huelga en Correos, ese día solo en la Comunidad de Madrid (Sindicato Libre de Correos)",
        en: "Correos (Spanish post) strike, that day in the Community of Madrid only (Sindicato Libre de Correos)",
      },
    },
    scope: {
      ca: "Tot el personal de tots els centres de Correus de la Comunitat de Madrid (del 23 al 27 de novembre) i de les províncies de Cadis, Còrdova, Huelva, Màlaga i Sevilla (del 23 al 25 de novembre).",
      es: "Todo el personal de todos los centros de Correos de la Comunidad de Madrid (del 23 al 27 de noviembre) y de las provincias de Cádiz, Córdoba, Huelva, Málaga y Sevilla (del 23 al 25 de noviembre).",
      en: "All staff at every Correos workplace in the Community of Madrid (23 to 27 November) and in the provinces of Cádiz, Córdoba, Huelva, Málaga and Seville (23 to 25 November).",
    },
    hours: {
      ca: "Jornades completes: a Madrid, de les 0.00 h del dilluns 23 a les 24.00 h del divendres 27 de novembre; a les cinc províncies andaluses, de les 0.00 h del dilluns 23 a les 24.00 h del dimecres 25.",
      es: "Jornadas completas: en Madrid, de las 0.00 h del lunes 23 a las 24.00 h del viernes 27 de noviembre; en las cinco provincias andaluzas, de las 0.00 h del lunes 23 a las 24.00 h del miércoles 25.",
      en: "Full days: in Madrid, from 00:00 on Monday 23 to 24:00 on Friday 27 November; in the five Andalusian provinces, from 00:00 on Monday 23 to 24:00 on Wednesday 25.",
    },
    calledBy: {
      ca: `El Sindicato Libre de Correos y Telecomunicaciones, segons ${link(U.correos2327, "l'Orden INT/1239/2026 del Ministeri de l'Interior")} (BOE del 19 de novembre).`,
      es: `El Sindicato Libre de Correos y Telecomunicaciones, según ${link(U.correos2327, "la Orden INT/1239/2026 del Ministerio del Interior")} (BOE del 19 de noviembre).`,
      en: `The Sindicato Libre de Correos y Telecomunicaciones union, according to ${link(U.correos2327, "Interior Ministry Order INT/1239/2026")} (BOE of 19 November).`,
    },
    basis: {
      ca: `${link(U.correos2327, "L'Orden INT/1239/2026, del 17 de novembre")}, publicada al BOE núm. 288 del 19 de novembre de 2026, fixa els serveis essencials de Correus durant aquestes vagues perquè coincideixen amb el vot per correu de les eleccions generals del 29 de novembre.`,
      es: `${link(U.correos2327, "La Orden INT/1239/2026, de 17 de noviembre")}, publicada en el BOE núm. 288 del 19 de noviembre de 2026, fija los servicios esenciales de Correos durante estas huelgas porque coinciden con el voto por correo de las elecciones generales del 29 de noviembre.`,
      en: `${link(U.correos2327, "Order INT/1239/2026 of 17 November")}, published in BOE no. 288 of 19 November 2026, sets Correos' essential services during these strikes because they coincide with postal voting for the 29 November general election.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "Per al vot per correu: oficines obertes amb 1 a 3 treballadors per torn",
        es: "Para el voto por correo: oficinas abiertas con 1 a 3 empleados por turno",
        en: "For postal votes: post offices open with 1 to 3 staff per shift",
      },
      text: {
        ca: `${link(U.correos2327, "L'Orden INT/1239/2026")} protegeix les tasques del procés electoral: les oficines obren en el seu horari habitual per admetre sol·licituds de vot per correu, lliurar la documentació electoral i admetre els vots, amb **1, 2 o 3 treballadors per torn** segons la mida de la plantilla (sempre amb el director o el responsable de l'oficina); els serveis rurals amb atenció al públic, al 100%. Al repartiment, fins al **50% de la plantilla** per als enviaments electorals i els vots, del 23 al 25 de novembre també a Madrid. La Junta Electoral Central va allargar el termini per lliurar el vot fins al **dijous 26 de novembre, com a molt a les 14 h** (${link(U.jec418, "Acuerdo 418/2026")}), i l'ordre preveu que, en aquest cas, els serveis mínims dels serveis rurals continuïn fins que s'acabi aquest termini.`,
        es: `${link(U.correos2327, "La Orden INT/1239/2026")} protege las tareas del proceso electoral: las oficinas abren en su horario habitual para admitir solicitudes de voto por correo, entregar la documentación electoral y admitir los votos, con **1, 2 o 3 empleados por turno** según el tamaño de la plantilla (siempre con el director o responsable de la oficina); los servicios rurales con atención al público, al 100%. En el reparto, hasta el **50% de la plantilla** para los envíos electorales y los votos, del 23 al 25 de noviembre también en Madrid. La Junta Electoral Central amplió el plazo para depositar el voto hasta el **jueves 26 de noviembre, como máximo a las 14 h** (${link(U.jec418, "Acuerdo 418/2026")}), y la orden prevé que, en ese caso, los servicios mínimos de los servicios rurales continúen hasta que termine ese plazo.`,
        en: `${link(U.correos2327, "Order INT/1239/2026")} protects election work: post offices open at their usual hours to accept postal-vote applications, hand out election papers and accept votes, with **1, 2 or 3 staff per shift** depending on the office's size (always including its manager); rural services with public counters at 100%. For delivery, up to **50% of staff** for election mail and votes, from 23 to 25 November in Madrid too. The Central Electoral Board extended the deadline for handing in the vote to **Thursday 26 November, 14:00 at the latest** (${link(U.jec418, "Acuerdo 418/2026")}), and the order says that in that case the minimum services of rural services continue until that deadline ends.`,
      },
    },
    sources: [
      { name: "Orden INT/1239/2026, de 17 de noviembre: servicios esenciales en Correos durante las huelgas del 23 al 27 de noviembre en Madrid y del 23 al 25 en Cádiz, Córdoba, Huelva, Málaga y Sevilla (BOE núm. 288, 19 de noviembre de 2026)", url: U.correos2327, publisher: "Boletín Oficial del Estado (Ministerio del Interior)" },
      { name: "Acuerdo 418/2026, de 19 de noviembre: plazo de depósito del voto por correo ampliado hasta el 26 de noviembre de 2026, como máximo hasta las 14:00 horas", url: U.jec418, publisher: "Junta Electoral Central" },
    ],
  },
  {
    // 25 Nov 2026 (read that day, ~00:25 CET): CCOO de Catalunya's news of 24 Nov (perfumery). Second and third source read the same night (~00:40):
    // UGT FICA nº 3861 (18 Nov: the SIMA mediation of 17 Nov ended without agreement, strike kept on 27 Nov, 23 Dec and 4 Jan) and CCOO de Industria's
    // state-level news (19 Nov: "del Estado"; shops of the big brands such as El Corte Inglés, and factories). Still the organisers' notices only: no
    // registered call or order seen, and none is due (a private sector). The employers' association, STANPA, has nothing on the strike on its site
    // (its own search for "huelga" is empty, 25 Nov).
    id: "huelga-perfumeria-2026-11-27",
    dates: ["2026-11-27", "2026-12-23", "2027-01-04"],
    sector: "industry",
    status: "called",
    title: {
      ca: "vaga al sector de la perfumeria i la cosmètica (CCOO Indústria, UGT FICA)",
      es: "huelga en el sector de la perfumería y la cosmética (CCOO Industria, UGT FICA)",
      en: "perfumery and cosmetics sector strike (CCOO Industria, UGT FICA)",
    },
    label: { ca: "perfumeria i cosmètica", es: "perfumería y cosmética", en: "perfumery and cosmetics" },
    scope: {
      ca: "Les persones que treballen al sector de la perfumeria i la cosmètica (conveni estatal de perfumeria i afins), a tot Espanya: segons CCOO d'Indústria, qui ven les marques a botigues com El Corte Inglés i les plantilles de les fàbriques de gels i xampús; unes 7.000 a Catalunya, segons CCOO de Catalunya. No afecta el transport, la sanitat ni les escoles.",
      es: "Las personas que trabajan en el sector de la perfumería y la cosmética (convenio estatal de perfumería y afines), en toda España: según CCOO de Industria, quienes venden las marcas en tiendas como El Corte Inglés y las plantillas de las fábricas de geles y champús; unas 7.000 en Cataluña, según CCOO de Catalunya. No afecta al transporte, la sanidad ni los colegios.",
      en: "People who work in the perfumery and cosmetics sector (the state-wide perfumery and related products collective agreement), all over Spain: according to CCOO Industria, those who sell the brands in shops such as El Corte Inglés and the workforces of the factories that make gels and shampoos; about 7,000 in Catalonia, according to CCOO de Catalunya. It does not touch transport, health care or schools.",
    },
    hours: {
      ca: "Tres jornades de vaga: el divendres 27 de novembre (Black Friday), el 23 de desembre i el 4 de gener. L'avís no en diu l'horari. El 27, CCOO convoca una concentració a partir de les 9.00 h davant d'El Corte Inglés de la plaça Catalunya de Barcelona.",
      es: "Tres jornadas de huelga: el viernes 27 de noviembre (Black Friday), el 23 de diciembre y el 4 de enero. El aviso no dice el horario. El 27, CCOO convoca una concentración a partir de las 9.00 h ante El Corte Inglés de la plaza de Cataluña de Barcelona.",
      en: "Three strike days: Friday 27 November (Black Friday), 23 December and 4 January. The notice gives no hours. On the 27th CCOO has called a rally from 09:00 outside El Corte Inglés in Plaça Catalunya, Barcelona.",
    },
    calledBy: {
      ca: `CCOO d'Indústria i UGT FICA, segons ${link(U.perfumeryFica, "la nota de UGT FICA del 18 de novembre")}, ${link(U.perfumeryIndustria, "la de CCOO d'Indústria del 19")} i ${link(U.perfumery, "la notícia de CCOO de Catalunya del 24 de novembre")}. La patronal que negocia el conveni és STANPA.`,
      es: `CCOO de Industria y UGT FICA, según ${link(U.perfumeryFica, "la nota de UGT FICA del 18 de noviembre")}, ${link(U.perfumeryIndustria, "la de CCOO de Industria del 19")} y ${link(U.perfumery, "la noticia de CCOO de Catalunya del 24 de noviembre")}. La patronal que negocia el convenio es STANPA.`,
      en: `The unions CCOO Industria and UGT FICA, according to ${link(U.perfumeryFica, "UGT FICA's note of 18 November")}, ${link(U.perfumeryIndustria, "CCOO Industria's of 19 November")} and ${link(U.perfumery, "CCOO de Catalunya's news of 24 November")}. The employers' association at the bargaining table is STANPA.`,
    },
    basis: {
      ca: `Consta als avisos dels dos sindicats convocants, amb les mateixes tres dates (27 de novembre, 23 de desembre i 4 de gener): ${link(U.perfumeryFica, "UGT FICA, el 18 de novembre")} (després de la mediació sense acord al SIMA del dia 17: «ambos sindicatos confirman el mantenimiento de la huelga»), ${link(U.perfumeryIndustria, "CCOO d'Indústria, el 19")} i ${link(U.perfumery, "CCOO de Catalunya, el 24")} («tres jornades de vaga»). No hi ha cap ordre ni resolució oficial, perquè no és un servei públic essencial, i el {checked} la patronal STANPA no havia publicat res sobre la vaga al seu web.`,
      es: `Consta en los avisos de los dos sindicatos convocantes, con las mismas tres fechas (27 de noviembre, 23 de diciembre y 4 de enero): ${link(U.perfumeryFica, "UGT FICA, el 18 de noviembre")} (tras la mediación sin acuerdo en el SIMA del día 17: «ambos sindicatos confirman el mantenimiento de la huelga»), ${link(U.perfumeryIndustria, "CCOO de Industria, el 19")} y ${link(U.perfumery, "CCOO de Catalunya, el 24")} («tres jornadas de huelga»). No hay ninguna orden ni resolución oficial, porque no es un servicio público esencial, y el {checked} la patronal STANPA no había publicado nada sobre la huelga en su web.`,
      en: `It rests on the notices of both unions that call it, with the same three dates (27 November, 23 December and 4 January): ${link(U.perfumeryFica, "UGT FICA, 18 November")} (after the SIMA mediation of the 17th ended without agreement: "ambos sindicatos confirman el mantenimiento de la huelga"), ${link(U.perfumeryIndustria, "CCOO Industria, 19 November")} and ${link(U.perfumery, "CCOO de Catalunya, 24 November")} ("tres jornadas de huelga", three strike days). There is no official order or resolution, because it is not an essential public service, and on {checked} the employers' association STANPA had published nothing about the strike on its website.`,
    },
    minimumServices: {
      status: "none",
      short: { ca: "No afecta serveis públics", es: "No afecta a servicios públicos", en: "No public service affected" },
      text: {
        ca: "És una vaga en un sector privat (perfumeria i cosmètica): no afecta el transport, la sanitat ni les escoles.",
        es: "Es una huelga en un sector privado (perfumería y cosmética): no afecta al transporte, la sanidad ni los colegios.",
        en: "It is a strike in a private sector (perfumery and cosmetics): transport, health care and schools are not affected.",
      },
    },
    sources: [
      { name: "El sector de la perfumeria i la cosmètica farà vaga el 27 de novembre per reclamar un conveni que avanci en salaris, jornada i conciliació (24 de novembre de 2026)", url: U.perfumery, publisher: "CCOO de Catalunya" },
      { name: "El 27N será un viernes negro en la perfumería y la cosmética: los y las trabajadoras irán a la huelga para exigir avances en salarios, jornada y conciliación (19 de noviembre de 2026)", url: U.perfumeryIndustria, publisher: "CCOO de Industria" },
      { name: "UGT FICA denuncia el bloqueo de la negociación del Convenio Estatal de Perfumería y Afines y mantiene la convocatoria de huelga (18 de noviembre de 2026)", url: U.perfumeryFica, publisher: "UGT FICA" },
    ],
  },
  {
    // 24 Nov 2026 (read that day): the Basque Government's order of 26 Oct, on its list of minimum-services orders. The order also covers 30 Oct
    // (past, never listed here). The callers keep the December days on a condition (LAB 13 Nov, ELA 17 Nov): talks on 2 Dec. Re-read on 3 Dec.
    id: "huelga-osakidetza-2026-12-09",
    dates: ["2026-12-09", "2026-12-10", "2026-12-11", "2026-12-14"],
    sector: "health",
    status: "official",
    rereadBy: "2026-12-03",
    title: {
      ca: "vaga a Osakidetza, la sanitat pública basca (SATSE, ELA, LAB, CCOO, UGT)",
      es: "huelga en Osakidetza, la sanidad pública vasca (SATSE, ELA, LAB, CCOO, UGT)",
      en: "strike at Osakidetza, the Basque public health service (SATSE, ELA, LAB, CCOO, UGT)",
    },
    label: { ca: "Osakidetza (sanitat basca)", es: "Osakidetza (sanidad vasca)", en: "Osakidetza (Basque health service)" },
    dayNotes: {
      "2026-12-09": {
        ca: "vaga a Osakidetza, aquest dia a Àlaba (SATSE, ELA, LAB, CCOO, UGT)",
        es: "huelga en Osakidetza, ese día en Álava (SATSE, ELA, LAB, CCOO, UGT)",
        en: "strike at Osakidetza, that day in Álava (SATSE, ELA, LAB, CCOO, UGT)",
      },
      "2026-12-10": {
        ca: "vaga a Osakidetza, aquest dia a Biscaia (SATSE, ELA, LAB, CCOO, UGT)",
        es: "huelga en Osakidetza, ese día en Bizkaia (SATSE, ELA, LAB, CCOO, UGT)",
        en: "strike at Osakidetza, that day in Bizkaia (SATSE, ELA, LAB, CCOO, UGT)",
      },
      "2026-12-11": {
        ca: "vaga a Osakidetza, aquest dia a Guipúscoa (SATSE, ELA, LAB, CCOO, UGT)",
        es: "huelga en Osakidetza, ese día en Gipuzkoa (SATSE, ELA, LAB, CCOO, UGT)",
        en: "strike at Osakidetza, that day in Gipuzkoa (SATSE, ELA, LAB, CCOO, UGT)",
      },
      "2026-12-14": {
        ca: "vaga a Osakidetza, aquest dia a tot el País Basc (SATSE, ELA, LAB, CCOO, UGT)",
        es: "huelga en Osakidetza, ese día en todo el País Vasco (SATSE, ELA, LAB, CCOO, UGT)",
        en: "strike at Osakidetza, that day across the Basque Country (SATSE, ELA, LAB, CCOO, UGT)",
      },
    },
    scope: {
      ca: "Tot el personal d'Osakidetza, el servei basc de salut (laboral, estatutari i funcionari; 46.545 persones, segons l'ordre del Govern Basc), un territori cada dia: el dimecres 9 de desembre a Àlaba (i a la direcció general), el dijous 10 a Biscaia, el divendres 11 a Guipúscoa i el dilluns 14 a tot Osakidetza.",
      es: "Todo el personal de Osakidetza, el servicio vasco de salud (laboral, estatutario y funcionario; 46.545 personas, según la orden del Gobierno Vasco), un territorio cada día: el miércoles 9 de diciembre en Álava (y en la dirección general), el jueves 10 en Bizkaia, el viernes 11 en Gipuzkoa y el lunes 14 en todo Osakidetza.",
      en: "All staff of Osakidetza, the Basque public health service (46,545 people, according to the Basque Government's order), one province a day: Wednesday 9 December in Álava (and at head office), Thursday 10 in Bizkaia, Friday 11 in Gipuzkoa and Monday 14 across Osakidetza.",
    },
    hours: {
      ca: "Cada jornada comença a les 22.00 h del dia anterior i acaba a les 22.00 h del dia de vaga, segons l'ordre del Govern Basc: per exemple, la del dilluns 14 va de les 22.00 h del diumenge 13 a les 22.00 h del dilluns 14 de desembre.",
      es: "Cada jornada empieza a las 22.00 h del día anterior y acaba a las 22.00 h del día de huelga, según la orden del Gobierno Vasco: por ejemplo, la del lunes 14 va de las 22.00 h del domingo 13 a las 22.00 h del lunes 14 de diciembre.",
      en: "Each strike day runs from 22:00 the evening before to 22:00 on the day itself, according to the Basque Government's order: the one on Monday 14, for example, runs from 22:00 on Sunday 13 to 22:00 on Monday 14 December.",
    },
    calledBy: {
      ca: `Els sindicats SATSE, ELA, LAB, CCOO i UGT, segons ${link(U.euskadiOsakidetza, "l'ordre de serveis mínims del Govern Basc del 26 d'octubre")}. Hi posen una condició: ${link(U.labOsakidetza, "LAB (13 de novembre)")} i ${link(U.elaOsakidetza, "ELA (17 de novembre)")} diuen que mantindran les jornades del 9, el 10, l'11 i el 14 de desembre si a la mesa sectorial del 2 de desembre no hi ha avenços.`,
      es: `Los sindicatos SATSE, ELA, LAB, CCOO y UGT, según ${link(U.euskadiOsakidetza, "la orden de servicios mínimos del Gobierno Vasco del 26 de octubre")}. Ponen una condición: ${link(U.labOsakidetza, "LAB (13 de noviembre)")} y ${link(U.elaOsakidetza, "ELA (17 de noviembre)")} dicen que mantendrán las jornadas del 9, el 10, el 11 y el 14 de diciembre si en la mesa sectorial del 2 de diciembre no hay avances.`,
      en: `The SATSE, ELA, LAB, CCOO and UGT unions, according to ${link(U.euskadiOsakidetza, "the Basque Government's minimum-services order of 26 October")}. There is a condition: ${link(U.labOsakidetza, "LAB (13 November)")} and ${link(U.elaOsakidetza, "ELA (17 November)")} say they will keep the strike days of 9, 10, 11 and 14 December if the talks of 2 December (the health service's bargaining table) bring no progress.`,
    },
    basis: {
      ca: `${link(U.euskadiOsakidetza, "L'ordre del Govern Basc del 26 d'octubre")}, a ${link(U.euskadiList, "la seva llista d'ordres de serveis mínims")}. El {checked} ni LAB ni ELA no l'havien desconvocada als seus webs; els tornarem a llegir després de la mesa del 2 de desembre.`,
      es: `${link(U.euskadiOsakidetza, "La orden del Gobierno Vasco del 26 de octubre")}, en ${link(U.euskadiList, "su lista de órdenes de servicios mínimos")}. El {checked} ni LAB ni ELA la habían desconvocado en sus webs; volveremos a leerlos después de la mesa del 2 de diciembre.`,
      en: `${link(U.euskadiOsakidetza, "The Basque Government's order of 26 October")}, on ${link(U.euskadiList, "its list of minimum-services orders")}. On {checked} neither LAB nor ELA had called it off on their websites; we will read them again after the talks of 2 December.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "Hospitals com un festiu; atenció primària com un dissabte; emergències i PAC al 100%",
        es: "Hospitales como un festivo; atención primaria como un sábado; emergencias y PAC al 100%",
        en: "Hospitals as on a holiday; primary care as on a Saturday; emergencies and PAC at 100%",
      },
      text: {
        ca: `${link(U.euskadiOsakidetza, "L'ordre del Govern Basc del 26 d'octubre")} manté als hospitals **el personal habitual d'un festiu** (urgències, cuina i atenció a les persones ingressades, i es poden donar altes) i el **100%** de la diàlisi, dels tractaments oncològics programats i dels processos que no poden esperar (hospital de dia oncohematològic, hemodinàmica, unitats d'ictus, cures intensives, neonatologia i parts). A l'atenció primària, **els serveis d'un dissabte**; els serveis d'emergències i els PAC (punts d'atenció continuada), al **100%**, i els centres d'atenció telefònica, al **50%**.`,
        es: `${link(U.euskadiOsakidetza, "La orden del Gobierno Vasco del 26 de octubre")} mantiene en los hospitales **el personal habitual de un festivo** (urgencias, cocina y atención a las personas ingresadas, y se pueden dar altas) y el **100%** de la diálisis, de los tratamientos oncológicos programados y de los procesos que no pueden esperar (hospital de día oncohematológico, hemodinámica, unidades de ictus, cuidados intensivos, neonatología y partos). En la atención primaria, **los servicios de un sábado**; los servicios de emergencia y los PAC (puntos de atención continuada), al **100%**, y los centros de atención telefónica, al **50%**.`,
        en: `${link(U.euskadiOsakidetza, "The Basque Government's order of 26 October")} keeps hospitals on **their usual public-holiday staffing** (A&E, kitchens and care for inpatients; patients can still be discharged) and **100%** of dialysis, scheduled cancer treatment and care that cannot wait (the cancer and haematology day hospital, cardiac catheterisation, stroke units, intensive care, neonatal care and births). Primary care runs **a Saturday service**; the emergency services and the PAC out-of-hours clinics run at **100%**, and the health service's call centres at **50%**.`,
      },
    },
    sources: [
      { name: "Orden de 26 de octubre de 2026: servicios esenciales del personal de Osakidetza-Servicio Vasco de Salud durante la huelga convocada para diferentes días de octubre y diciembre de 2026 (PDF)", url: U.euskadiOsakidetza, publisher: "Gobierno Vasco, Departamento de Economía, Trabajo y Empleo" },
      { name: "Órdenes de servicios mínimos", url: U.euskadiList, publisher: "Gobierno Vasco" },
      { name: "La fuerza de la movilización obliga a Osakidetza a mover ficha, pero las propuestas siguen siendo insuficientes (13/11/2026)", url: U.labOsakidetza, publisher: "LAB" },
      { name: "Nueva jornada de movilizaciones ante la falta de avances en la negociación (17/11/2026)", url: U.elaOsakidetza, publisher: "ELA" },
    ],
  },
  {
    // 25 Nov 2026 (read that day, ~00:55 CET): CSIF Educación Madrid's calendar of partial stoppages (its notice of 23 Sep) and the Comunidad de Madrid's two
    // orders in the BOCM (Orden 4252/2026, 9 Oct; Orden 4977/2026, 19 Nov), which quote CSIF's call and its days. Only CSIF's dated days from 26 Nov are listed
    // here (the 20, 22, 26 and 30 Oct and the November days to the 24th are past). The same orders also cover the indefinite strike that CCOO, UGT, CGT and other
    // organisations called from 14 Oct; their current notices were not read, so it is not listed. BOCM 20-24 Nov: no further order. CSIF's appeal to the TSJ of
    // Madrid (20 Nov, by its own post): no ruling on its site on 25 Nov.
    id: "huelga-madrid-colegios-csif-2026-11-26",
    dates: ["2026-11-26", "2026-11-30", "2026-12-01", "2026-12-10", "2026-12-11", "2026-12-16", "2026-12-18"],
    sector: "education",
    status: "official",
    title: {
      ca: "paros parcials del professorat dels centres públics de la Comunitat de Madrid (CSIF)",
      es: "paros parciales del profesorado de los centros públicos de la Comunidad de Madrid (CSIF)",
      en: "partial stoppages by teachers in the Community of Madrid's public schools (CSIF)",
    },
    label: { ca: "escola pública de Madrid (CSIF)", es: "colegios públicos de Madrid (CSIF)", en: "Madrid public schools (CSIF)" },
    scope: {
      ca: "El personal docent funcionari de tots els centres docents i educatius públics no universitaris de la Comunitat de Madrid. Només a la Comunitat de Madrid: no afecta les escoles de Catalunya ni d'altres regions.",
      es: "El personal docente funcionario de todos los centros docentes y educativos públicos no universitarios de la Comunidad de Madrid. Solo en la Comunidad de Madrid: no afecta a los colegios de Cataluña ni de otras regiones.",
      en: "Civil-service teaching staff at all public, non-university schools and teaching centres in the Community of Madrid. Madrid only: schools in Catalonia and other regions are not affected.",
    },
    hours: {
      ca: `Dos paros de dues hores cada dia de vaga, de 9.00 a 11.00 h i de 17.00 a 19.00 h: el dijous 26 i el dilluns 30 de novembre, i el dimarts 1, el dijous 10, el divendres 11, el dimecres 16 i el divendres 18 de desembre (${link(U.csifMadrid, "calendari de CSIF")}).`,
      es: `Dos paros de dos horas cada día de huelga, de 9.00 a 11.00 h y de 17.00 a 19.00 h: el jueves 26 y el lunes 30 de noviembre, y el martes 1, el jueves 10, el viernes 11, el miércoles 16 y el viernes 18 de diciembre (${link(U.csifMadrid, "calendario de CSIF")}).`,
      en: `Two two-hour stoppages on each strike day, 09:00 to 11:00 and 17:00 to 19:00: Thursday 26 and Monday 30 November, and Tuesday 1, Thursday 10, Friday 11, Wednesday 16 and Friday 18 December (${link(U.csifMadrid, "CSIF's calendar")}).`,
    },
    calledBy: {
      ca: `El sindicat CSIF Educación Madrid, a ${link(U.csifMadrid, "la seva convocatòria del 23 de setembre")}.`,
      es: `El sindicato CSIF Educación Madrid, en ${link(U.csifMadrid, "su convocatoria del 23 de septiembre")}.`,
      en: `The union CSIF Educación Madrid, in ${link(U.csifMadrid, "its call of 23 September")}.`,
    },
    basis: {
      ca: `${link(U.madridOrder4252, "L'Ordre 4252/2026, de 7 d'octubre")} (BOCM del 9 d'octubre) fixa serveis mínims per a «las huelgas convocadas a partir del día 14 de octubre de 2026» als centres públics no universitaris de la Comunitat de Madrid i hi recull la convocatòria de CSIF amb els mateixos dies i franges: «1, 10, 11, 16 y 18 de diciembre de 2026, en las franjas desde las 9:00 a las 11:00 horas […] y desde las 17:00 a las 19:00 horas». La mateixa ordre cobreix la vaga indefinida que CCOO, UGT, CGT i altres organitzacions van convocar des del 14 d'octubre; aquesta fitxa només en llista els dies de CSIF.`,
      es: `${link(U.madridOrder4252, "La Orden 4252/2026, de 7 de octubre")} (BOCM del 9 de octubre) fija servicios mínimos para «las huelgas convocadas a partir del día 14 de octubre de 2026» en los centros públicos no universitarios de la Comunidad de Madrid y recoge la convocatoria de CSIF con los mismos días y franjas: «1, 10, 11, 16 y 18 de diciembre de 2026, en las franjas desde las 9:00 a las 11:00 horas […] y desde las 17:00 a las 19:00 horas». La misma orden cubre la huelga indefinida que CCOO, UGT, CGT y otras organizaciones convocaron desde el 14 de octubre; esta ficha solo lista los días de CSIF.`,
      en: `${link(U.madridOrder4252, "Order 4252/2026 of 7 October")} (BOCM, 9 October) sets minimum services for "las huelgas convocadas a partir del día 14 de octubre de 2026" (the strikes called from 14 October 2026) in the Community of Madrid's public non-university schools, and it quotes CSIF's call with the same days and hours: "1, 10, 11, 16 y 18 de diciembre de 2026, en las franjas desde las 9:00 a las 11:00 horas […] y desde las 17:00 a las 19:00 horas". The same order covers the indefinite strike that CCOO, UGT, CGT and other organisations called from 14 October; this entry lists only CSIF's days.`,
    },
    minimumServices: {
      status: "published",
      short: {
        ca: "Ordre de Madrid: direcció i un docent per cada 50, 70 o 90 alumnes",
        es: "Orden de Madrid: dirección y un docente por cada 50, 70 o 90 alumnos",
        en: "Madrid order: school heads and one teacher per 50, 70 or 90 pupils",
      },
      text: {
        ca: `${link(U.madridOrder4252, "L'Ordre 4252/2026")} fixa els serveis mínims i ${link(U.madridOrder4977, "l'Ordre 4977/2026, de 17 de novembre")} (BOCM del 19; efectes des del dia següent) la modifica; no hi va haver acord amb els comitès de vaga. Ara, a cada centre: el director i el cap d'estudis; **un mestre per cada 50 alumnes** o fracció als centres amb segon cicle d'Infantil i Primària, **un professor per cada 90** alumnes d'ESO i FP Bàsica i **un per cada 70** de Batxillerat i cicles de grau mitjà i superior; un professor més per cada tres unitats a 6è de Primària, 4t d'ESO i els cursos finals de FP. A 2n de Batxillerat, a més, el professorat de les matèries de la PAU durant el **50%** de les hores setmanals de cada grup fins al 31 de gener de 2027 (75% fins al 30 d'abril i 90% després). El {checked}, ${link(U.csifMadridAppeal, "segons CSIF")}, l'ordre del 17 de novembre està impugnada davant el TSJ de Madrid (recurs del 20 de novembre) i al seu web no hi consta cap resolució.`,
        es: `${link(U.madridOrder4252, "La Orden 4252/2026")} fija los servicios mínimos y ${link(U.madridOrder4977, "la Orden 4977/2026, de 17 de noviembre")} (BOCM del 19; efectos desde el día siguiente) la modifica; no hubo acuerdo con los comités de huelga. Ahora, en cada centro: el director y el jefe de estudios; **un maestro por cada 50 alumnos** o fracción en los centros con segundo ciclo de Infantil y Primaria, **un profesor por cada 90** alumnos de ESO y FP Básica y **uno por cada 70** de Bachillerato y ciclos de grado medio y superior; un profesor más por cada tres unidades en 6.º de Primaria, 4.º de ESO y los cursos finales de FP. En 2.º de Bachillerato, además, el profesorado de las materias de la PAU durante el **50%** de las horas semanales de cada grupo hasta el 31 de enero de 2027 (75% hasta el 30 de abril y 90% después). El {checked}, ${link(U.csifMadridAppeal, "según CSIF")}, la orden del 17 de noviembre está recurrida ante el TSJ de Madrid (recurso del 20 de noviembre) y en su web no consta ninguna resolución.`,
        en: `${link(U.madridOrder4252, "Order 4252/2026")} sets the minimum services and ${link(U.madridOrder4977, "Order 4977/2026 of 17 November")} (BOCM, 19 November; in force from the next day) amends it; there was no agreement with the strike committees. Now, in each school: the head and the head of studies; **one teacher per 50 pupils** or part of 50 in schools with the second cycle of nursery (Infantil) and primary, **one teacher per 90** pupils of ESO and basic vocational training, and **one per 70** in Bachillerato and intermediate and higher vocational cycles; one more teacher per three classes in the last year of primary, 4th year of ESO and the final years of vocational training. In the second year of Bachillerato, teachers of the university-entrance (PAU) subjects also count during **50%** of each group's weekly hours until 31 January 2027 (75% until 30 April and 90% after). On {checked}, ${link(U.csifMadridAppeal, "according to CSIF")}, the order of 17 November is under appeal to the Madrid High Court (TSJ; filed on 20 November) and its website shows no ruling.`,
      },
    },
    sources: [
      { name: "ORDEN 4252/2026, de 7 de octubre: servicios mínimos esenciales en los centros docentes y educativos públicos no universitarios de la Comunidad de Madrid, con ocasión de las huelgas convocadas a partir del día 14 de octubre de 2026 (BOCM núm. 241, 9 de octubre de 2026)", url: U.madridOrder4252, publisher: "Comunidad de Madrid, Boletín Oficial (BOCM)" },
      { name: "ORDEN 4977/2026, de 17 de noviembre, por la que se modifica la Orden 4252/2026 (BOCM núm. 278, 19 de noviembre de 2026)", url: U.madridOrder4977, publisher: "Comunidad de Madrid, Boletín Oficial (BOCM)" },
      { name: "CSIF Educación Madrid convoca huelga indefinida a partir del 14 de octubre (23 de septiembre de 2026)", url: U.csifMadrid, publisher: "CSIF Educación Madrid" },
      { name: "CSIF lleva a los tribunales los servicios mínimos abusivos impuestos por la Consejería de Educación (21 de noviembre de 2026)", url: U.csifMadridAppeal, publisher: "CSIF Educación Madrid" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Open-ended strikes at airports                                             */
/* -------------------------------------------------------------------------- */

/**
 * The three strikes with a minimum-services resolution in force on the
 * Ministry of Transport's air list on 10 Nov 2026 ("los efectos de la
 * resolución serán del 1 de octubre hasta el 30 de noviembre de 2026").
 * Wording follows the list's own text; the resolutions' figures are not
 * restated.
 */
export const SPAIN_OPEN_STRIKES: SpainOpenStrike[] = [
  {
    id: "huelga-saerco-controladores",
    msValidUntil: "2026-11-30",
    title: {
      ca: "Controladors aeris de SAERCO: nou aeroports",
      es: "Controladores aéreos de SAERCO: nueve aeropuertos",
      en: "SAERCO air traffic controllers: nine airports",
    },
    text: {
      ca: `Vaga indefinida convocada pels sindicats USCA i CCOO a les torres de control que gestiona SAERCO, des de les 0.00 h del 17 d'abril de 2026 (${link(U.usca, "USCA")}). Afecta els aeroports de Jerez de la Frontera, la Corunya, Madrid-Cuatro Vientos, Sevilla, Vigo, El Hierro, Fuerteventura, Lanzarote i La Palma. La ${link(U.saercoResolution, "resolució de serveis mínims")} vigent té efectes de l'1 d'octubre al 30 de novembre de 2026, segons ${link(U.ministryAir, "la llista del Ministeri de Transports")}.`,
      es: `Huelga indefinida convocada por los sindicatos USCA y CCOO en las torres de control que gestiona SAERCO, desde las 0.00 h del 17 de abril de 2026 (${link(U.usca, "USCA")}). Afecta a los aeropuertos de Jerez de la Frontera, A Coruña, Madrid-Cuatro Vientos, Sevilla, Vigo, El Hierro, Fuerteventura, Lanzarote y La Palma. La ${link(U.saercoResolution, "resolución de servicios mínimos")} vigente tiene efectos del 1 de octubre al 30 de noviembre de 2026, según ${link(U.ministryAir, "la lista del Ministerio de Transportes")}.`,
      en: `An indefinite strike called by the unions USCA and CCOO at the control towers run by SAERCO, from 00:00 on 17 April 2026 (${link(U.usca, "USCA")}). It affects the airports of Jerez de la Frontera, A Coruña, Madrid-Cuatro Vientos, Seville, Vigo, El Hierro, Fuerteventura, Lanzarote and La Palma. The ${link(U.saercoResolution, "minimum-services resolution")} in force runs from 1 October to 30 November 2026, according to ${link(U.ministryAir, "the Ministry of Transport's list")}.`,
    },
    sources: [
      { name: "USCA y CCOO convocan huelga indefinida en SAERCO (7 de abril de 2026)", url: U.usca, publisher: "USCA" },
      { name: "Resolución de servicios mínimos de la huelga indefinida en SAERCO (efectos del 1 de octubre al 30 de noviembre de 2026)", url: U.saercoResolution, publisher: MINISTRY },
      SRC.ministryAir,
    ],
  },
  {
    id: "huelga-groundforce-el-prat",
    msValidUntil: "2026-11-30",
    title: {
      ca: "Groundforce: personal de terra a l'aeroport de Barcelona-El Prat",
      es: "Groundforce: personal de tierra en el aeropuerto de Barcelona-El Prat",
      en: "Groundforce: ground staff at Barcelona-El Prat airport",
    },
    text: {
      ca: `Vaga convocada pel sindicat CGT a Groundforce BCN 2023 UTE, a l'aeroport Josep Tarradellas Barcelona-El Prat, indefinida des del 4 d'agost de 2026, 24 hores cada dia. La ${link(U.groundforceResolution, "resolució de serveis mínims")} vigent té efectes de l'1 d'octubre al 30 de novembre de 2026, segons ${link(U.ministryAir, "la llista del Ministeri de Transports")}.`,
      es: `Huelga convocada por el sindicato CGT en Groundforce BCN 2023 UTE, en el aeropuerto Josep Tarradellas Barcelona-El Prat, indefinida desde el 4 de agosto de 2026, 24 horas cada día. La ${link(U.groundforceResolution, "resolución de servicios mínimos")} vigente tiene efectos del 1 de octubre al 30 de noviembre de 2026, según ${link(U.ministryAir, "la lista del Ministerio de Transportes")}.`,
      en: `A strike called by the CGT union at Groundforce BCN 2023 UTE, at Josep Tarradellas Barcelona-El Prat airport, indefinite since 4 August 2026, 24 hours every day. The ${link(U.groundforceResolution, "minimum-services resolution")} in force runs from 1 October to 30 November 2026, according to ${link(U.ministryAir, "the Ministry of Transport's list")}.`,
    },
    sources: [
      { name: "Resolución de servicios mínimos de la huelga en Groundforce BCN 2023 UTE (efectos del 1 de octubre al 30 de noviembre de 2026)", url: U.groundforceResolution, publisher: MINISTRY },
      SRC.ministryAir,
    ],
  },
  {
    id: "huelga-outsmart-barajas",
    msValidUntil: "2026-11-30",
    title: {
      ca: "Outsmart: sistema d'equipatges de Madrid-Barajas",
      es: "Outsmart: sistema de equipajes de Madrid-Barajas",
      en: "Outsmart: baggage system at Madrid-Barajas",
    },
    text: {
      ca: `Vaga convocada pel sindicat ASC a Outsmart Assistance S.L.: aturades parcials de 5.00 a 7.00 h i de 13.00 a 15.00 h els dilluns, dijous, divendres, dissabtes i diumenges, que afecten el sistema automatitzat de tractament d'equipatges (SATE) de totes les terminals de l'aeroport Adolfo Suárez Madrid-Barajas. La ${link(U.outsmartResolution, "resolució de serveis mínims")} vigent té efectes de l'1 d'octubre al 30 de novembre de 2026, segons ${link(U.ministryAir, "la llista del Ministeri de Transports")}.`,
      es: `Huelga convocada por el sindicato ASC en Outsmart Assistance S.L.: paros parciales de 5.00 a 7.00 h y de 13.00 a 15.00 h los lunes, jueves, viernes, sábados y domingos, que afectan al sistema automatizado de tratamiento de equipajes (SATE) de todas las terminales del aeropuerto Adolfo Suárez Madrid-Barajas. La ${link(U.outsmartResolution, "resolución de servicios mínimos")} vigente tiene efectos del 1 de octubre al 30 de noviembre de 2026, según ${link(U.ministryAir, "la lista del Ministerio de Transportes")}.`,
      en: `A strike called by the ASC union at Outsmart Assistance S.L.: partial stoppages from 05:00 to 07:00 and from 13:00 to 15:00 on Mondays, Thursdays, Fridays, Saturdays and Sundays, affecting the automated baggage handling system (SATE) in every terminal of Adolfo Suárez Madrid-Barajas airport. The ${link(U.outsmartResolution, "minimum-services resolution")} in force runs from 1 October to 30 November 2026, according to ${link(U.ministryAir, "the Ministry of Transport's list")}.`,
    },
    sources: [
      { name: "Resolución de servicios mínimos de la huelga en Outsmart Assistance S.L., SATE de Madrid-Barajas (efectos del 1 de octubre al 30 de noviembre de 2026)", url: U.outsmartResolution, publisher: MINISTRY },
      SRC.ministryAir,
    ],
  },
  {
    // 25 Nov 2026 (read ~10:10 CET): new on the Ministry's air list that morning; the resolution was signed on 24 Nov at 20:45. It starts at 23:00 on the 25th, so 26 Nov is its first full day.
    id: "huelga-serveo-barajas-limpieza",
    msValidUntil: "2027-01-31",
    title: {
      ca: "Serveo: neteja de les terminals T1, T2 i T3 de Madrid-Barajas",
      es: "Serveo: limpieza de las terminales T1, T2 y T3 de Madrid-Barajas",
      en: "Serveo: cleaning of terminals T1, T2 and T3 at Madrid-Barajas",
    },
    text: {
      ca: `Vaga indefinida convocada pel comitè d'empresa de SERVEO Facility Management, S.A.U. al servei de neteja de les terminals T1, T2 i T3 de l'aeroport Adolfo Suárez Madrid-Barajas, des de les 23.00 h del 25 de novembre de 2026 i durant tota la jornada de treball; segons la ${link(U.serveoResolution, "resolució del Ministeri de Transports")}, afecta 319 treballadors i no inclou la neteja d'aeronaus. Els serveis mínims són el 50% de la plantilla programada diària per als lavabos dels edificis terminals, les dependències tècniques i operatives i l'exterior del costat aire, i el 25% per a la resta de zones públiques interiors i l'exterior del costat terra, amb una persona per torn com a mínim, fins al 31 de gener de 2027, segons ${link(U.ministryAir, "la llista del Ministeri de Transports")}.`,
      es: `Huelga indefinida convocada por el comité de empresa de SERVEO Facility Management, S.A.U. en el servicio de limpieza de las terminales T1, T2 y T3 del aeropuerto Adolfo Suárez Madrid-Barajas, desde las 23.00 h del 25 de noviembre de 2026 y durante toda la jornada de trabajo; según la ${link(U.serveoResolution, "resolución del Ministerio de Transportes")}, afecta a 319 trabajadores y no incluye la limpieza de aeronaves. Los servicios mínimos son el 50% de la plantilla programada diaria para los aseos de los edificios terminales, las dependencias técnicas y operativas y el exterior del lado aire, y el 25% para el resto de las zonas públicas interiores y el exterior del lado tierra, con una persona por turno como mínimo, hasta el 31 de enero de 2027, según ${link(U.ministryAir, "la lista del Ministerio de Transportes")}.`,
      en: `An indefinite strike called by the works council of SERVEO Facility Management, S.A.U. in the cleaning service of terminals T1, T2 and T3 at Adolfo Suárez Madrid-Barajas airport, from 23:00 on 25 November 2026 and for the whole working day; according to the ${link(U.serveoResolution, "Ministry of Transport's resolution")}, it affects 319 workers and does not include cleaning aircraft. The minimum services are 50% of the daily scheduled staff for the toilets of the terminal buildings, technical and operational areas and the airside outdoors, and 25% for the rest of the indoor public areas and the landside outdoors, with at least one person per shift, until 31 January 2027, according to ${link(U.ministryAir, "the Ministry of Transport's list")}.`,
    },
    sources: [
      { name: "Resolución de servicios mínimos de la huelga indefinida en SERVEO Facility Management, limpieza de las terminales T1, T2 y T3 de Madrid-Barajas (del 25 de noviembre de 2026 al 31 de enero de 2027)", url: U.serveoResolution, publisher: MINISTRY },
      SRC.ministryAir,
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Searched for, but not happening                                            */
/* -------------------------------------------------------------------------- */

export const SPAIN_NOT_HAPPENING: SpainNotHappening[] = [
  {
    // 20 Nov 2026: SEMAF nº 2026-38 (20/11/2026, datePublished 01:04 CET) and nº 2026-39 (same day). No other rail call for the 23rd on
    // the Ministry of Transport's rail list or from SCF, CCOO, SFF-CGT or ALFERRO (read that day); no notice from Renfe or Rodalies yet.
    id: "renfe-23-noviembre-desconvocada",
    title: {
      ca: "Maquinistes de Renfe (SEMAF), 23 de novembre: desconvocada",
      es: "Maquinistas de Renfe (SEMAF), 23 de noviembre: desconvocada",
      en: "Renfe train drivers (SEMAF), 23 November: called off",
    },
    text: {
      ca: `El sindicat de maquinistes SEMAF va desconvocar el 20 de novembre la vaga de tot el col·lectiu de maquinistes del Grup Renfe prevista per al dilluns 23: «SEMAF ha procedido a la desconvocatoria de la jornada de huelga prevista para el próximo 23 de noviembre tras alcanzar un acuerdo», segons ${link(U.semaf38, "el seu comunicat 2026-38")}, que en ${link(U.semaf39, "el 2026-39")} qualifica d'«Acuerdo de fin de huelga». Aquell dia no queda cap vaga ferroviària convocada a les fonts revisades: Rodalies, Cercanías, Mitja Distància, AVE i Llarga Distància circulen amb l'horari habitual, llevat que Renfe avisi del contrari.`,
      es: `El sindicato de maquinistas SEMAF desconvocó el 20 de noviembre la huelga de todo el colectivo de maquinistas del Grupo Renfe prevista para el lunes 23: «SEMAF ha procedido a la desconvocatoria de la jornada de huelga prevista para el próximo 23 de noviembre tras alcanzar un acuerdo», según ${link(U.semaf38, "su comunicado 2026-38")}, que en ${link(U.semaf39, "el 2026-39")} califica de «Acuerdo de fin de huelga». Ese día no queda ninguna huelga ferroviaria convocada en las fuentes revisadas: Rodalies, Cercanías, Media Distancia, AVE y Larga Distancia circulan con su horario habitual, salvo que Renfe avise de lo contrario.`,
      en: `On 20 November the train drivers' union SEMAF called off the strike of every Renfe Group train driver planned for Monday 23: "SEMAF ha procedido a la desconvocatoria de la jornada de huelga prevista para el próximo 23 de noviembre tras alcanzar un acuerdo" (SEMAF has called off the strike day planned for 23 November after reaching an agreement), according to ${link(U.semaf38, "its notice 2026-38")}; ${link(U.semaf39, "notice 2026-39")} calls it an "Acuerdo de fin de huelga" (an agreement ending the strike). No rail strike is left on that day in the sources checked: Rodalies, Cercanías, Media Distancia, AVE and long-distance trains run to their usual timetable unless Renfe says otherwise.`,
    },
    sources: [SRC.semaf38, SRC.semaf39],
  },
  {
    // 18 Nov 2026: SCFCOM 38 (17 Nov, 22:25), with the signed call-off agreement linked from it.
    id: "adif-19-noviembre-desconvocada",
    title: {
      ca: "Personal de circulació d'Adif (SCF), 19 de novembre: desconvocada",
      es: "Personal de circulación de Adif (SCF), 19 de noviembre: desconvocada",
      en: "Adif traffic-control staff (SCF), 19 November: called off",
    },
    text: {
      ca: `El sindicat SCF va desconvocar el 17 de novembre la vaga de 24 hores del dijous 19 a Adif, després que l'empresa acceptés les seves reivindicacions: «SCF ha acordado la desconvocatoria para el día 19», segons ${link(U.scf38, "el seu comunicat 38")}. Aquell dia no queda cap vaga ferroviària convocada: Renfe, Iryo i Ouigo no hi estaven convocats.`,
      es: `El sindicato SCF desconvocó el 17 de noviembre la huelga de 24 horas del jueves 19 en Adif, después de que la empresa aceptara sus reivindicaciones: «SCF ha acordado la desconvocatoria para el día 19», según ${link(U.scf38, "su comunicado 38")}. Ese día no queda ninguna huelga ferroviaria convocada: Renfe, Iryo y Ouigo no estaban convocados.`,
      en: `On 17 November the SCF union called off its 24-hour strike at Adif on Thursday 19, after Adif accepted its demands: "SCF ha acordado la desconvocatoria para el día 19" (SCF has agreed to call off the 19th), according to ${link(U.scf38, "its notice 38")}. No rail strike is left on that day: Renfe, Iryo and Ouigo were not called out.`,
    },
    sources: [SRC.scf38],
  },
  {
    id: "medicos-estatal-aplazada",
    title: {
      ca: "Vaga indefinida de metges a tot Espanya: ajornada",
      es: "Huelga indefinida de médicos en toda España: aplazada",
      en: "Indefinite doctors' strike across Spain: postponed",
    },
    text: {
      ca: `El comitè de vaga (CESM, SMA i SME) va ajornar les aturades indefinides previstes a partir del 28 d'octubre després de la convocatòria d'eleccions generals. Segons ${link(U.cesm, "el seu avís del 7 d'octubre")}, la convocatòria continua vigent i la mobilització es podrà reactivar.`,
      es: `El comité de huelga (CESM, SMA y SME) aplazó los paros indefinidos previstos a partir del 28 de octubre tras la convocatoria de elecciones generales. Según ${link(U.cesm, "su aviso del 7 de octubre")}, la convocatoria «continúa vigente» y la movilización podrá reactivarse.`,
      en: `The strike committee (the doctors' unions CESM, SMA and SME) postponed the indefinite stoppages due from 28 October after the general election was called. According to ${link(U.cesm, "its notice of 7 October")}, the call remains in force and the action may be resumed.`,
    },
    sources: [{ name: "El Comité de Huelga aplaza los paros indefinidos tras la convocatoria electoral (7 de octubre de 2026)", url: U.cesm, publisher: "CESM" }],
  },
  {
    id: "ouigo-desconvocada",
    title: {
      ca: "Maquinistes d'Ouigo, 6 i 9 de novembre i 4 i 8 de desembre: desconvocada",
      es: "Maquinistas de Ouigo, 6 y 9 de noviembre y 4 y 8 de diciembre: desconvocada",
      en: "Ouigo train drivers, 6 and 9 November and 4 and 8 December: called off",
    },
    text: {
      ca: `SEMAF va desconvocar aquestes aturades després de signar un acord amb l'empresa, segons ${link(U.semafOuigo, "el seu comunicat")}.`,
      es: `SEMAF desconvocó estos paros tras firmar un acuerdo con la empresa, según ${link(U.semafOuigo, "su comunicado")}.`,
      en: `SEMAF called these stoppages off after signing an agreement with the company, according to ${link(U.semafOuigo, "its notice")}.`,
    },
    sources: [{ name: "Ouigo firma todas las reivindicaciones: desconvocados los paros", url: U.semafOuigo, publisher: "SEMAF" }],
  },
  {
    id: "semaf-renfe-12-noviembre-trasladada",
    title: {
      ca: "Maquinistes de Renfe (SEMAF), 12 de novembre: desconvocada (traslladada al 23, també desconvocada)",
      es: "Maquinistas de Renfe (SEMAF), 12 de noviembre: desconvocada (trasladada al 23, también desconvocada)",
      en: "Renfe train drivers (SEMAF), 12 November: called off (moved to the 23rd, also called off)",
    },
    text: {
      ca: `El 10 de novembre SEMAF va decidir «sustituir el paro previsto para el día 12 de noviembre por una nueva convocatoria de huelga el día 23 de noviembre», segons ${link(U.semaf23, "el seu comunicat")}, i Renfe avisa que el 12 «el servicio ferroviario se prestará conforme a la programación habitual». El 20 de novembre SEMAF va desconvocar també la del 23.`,
      es: `El 10 de noviembre SEMAF decidió «sustituir el paro previsto para el día 12 de noviembre por una nueva convocatoria de huelga el día 23 de noviembre», según ${link(U.semaf23, "su comunicado")}, y Renfe avisa de que el 12 «el servicio ferroviario se prestará conforme a la programación habitual». El 20 de noviembre SEMAF desconvocó también la del 23.`,
      en: `On 10 November SEMAF decided to "sustituir el paro previsto para el día 12 de noviembre por una nueva convocatoria de huelga el día 23 de noviembre" (replace the 12 November stoppage with a new strike call on 23 November), according to ${link(U.semaf23, "its notice")}, and Renfe says that on the 12th trains will run to the usual timetable. On 20 November SEMAF called off the 23rd's strike too.`,
    },
    sources: [{ name: "Primer Real Decreto-ley aprobado: SEMAF mueve el paro del 12 al 23 de noviembre (10/11/2026)", url: U.semaf23, publisher: "SEMAF" }],
  },
  {
    id: "alferro-trasladada",
    title: {
      ca: "ALFERRO, 10 i 12 de novembre: traslladada al dia 17",
      es: "ALFERRO, 10 y 12 de noviembre: trasladada al día 17",
      en: "ALFERRO, 10 and 12 November: moved to the 17th",
    },
    text: {
      ca: `El comitè de vaga del sindicat ferroviari ALFERRO va traslladar les seves jornades del 10 i el 12 al 17 de novembre, segons ${link(U.alferro80, "el seu comunicat 80/2026")}. La vaga de SEMAF a Renfe del 10 i el 12 és una altra convocatòria.`,
      es: `El comité de huelga del sindicato ferroviario ALFERRO trasladó sus jornadas del 10 y el 12 al 17 de noviembre, según ${link(U.alferro80, "su comunicado 80/2026")}. La huelga de SEMAF en Renfe del 10 y el 12 es otra convocatoria.`,
      en: `The strike committee of the rail union ALFERRO moved its strike days from the 10th and the 12th to 17 November, according to ${link(U.alferro80, "its notice 80/2026")}. SEMAF's strike at Renfe on the 10th and the 12th is a separate call.`,
    },
    sources: [{ name: "Comunicado 80/2026: modificación de las fechas de huelga de noviembre de 2026", url: U.alferro80, publisher: "ALFERRO" }],
  },
  {
    id: "mataderos-aves-sin-convocar",
    title: {
      ca: "Escorxadors d'aus i conills: sense vaga convocada",
      es: "Mataderos de aves y conejos: sin huelga convocada",
      en: "Poultry and rabbit slaughterhouses: no strike called",
    },
    text: {
      ca: `Després de la mediació al SIMA del 28 d'octubre, la possible convocatòria de vaga va quedar ajornada i les parts es tornen a reunir el 16 de novembre, segons ${link(U.poultry, "UGT FICA")}. És un conveni diferent del de les indústries càrnies.`,
      es: `Tras la mediación en el SIMA del 28 de octubre, la posible convocatoria de huelga quedó aplazada y las partes vuelven a reunirse el 16 de noviembre, según ${link(U.poultry, "UGT FICA")}. Es un convenio distinto del de las industrias cárnicas.`,
      en: `After mediation at SIMA on 28 October, the possible strike call was put off and the parties meet again on 16 November, according to ${link(U.poultry, "UGT FICA")}. It is a different collective agreement from the meat industry's.`,
    },
    sources: [{ name: "Avances en el SIMA para desbloquear el convenio de mataderos de aves y conejos (29 de octubre de 2026)", url: U.poultry, publisher: "UGT FICA" }],
  },
];

/* -------------------------------------------------------------------------- */
/* Law                                                                        */
/* -------------------------------------------------------------------------- */

export const SPAIN_FRAMEWORK_SOURCES: B2Source[] = [
  { name: "Constitución Española, artículo 28.2", url: U.constitution, publisher: "Boletín Oficial del Estado" },
  { name: "Real Decreto-ley 17/1977, de 4 de marzo, sobre relaciones de trabajo", url: U.rdl17, publisher: "Boletín Oficial del Estado" },
  SRC.ministryRail,
  SRC.ministryAir,
];
