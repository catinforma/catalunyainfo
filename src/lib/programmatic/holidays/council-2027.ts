import type { NucleusDays, SourceRef } from "./types";

/**
 * Next year's local days as the councils themselves have approved them,
 * before the Generalitat's order puts them in the DOGC (the 2026 order came
 * out on 17 December 2025). Each entry was read on the council's own channel
 * (its website, seu electrònica, plenary agreement or mayoral decree, or the
 * provincial bulletin), never in the press, and the read date is kept with it.
 *
 * The pages print these days labelled "approved by the council, pending the
 * DOGC order". The moment `prepare2027` writes `local-2027.json`, the order
 * wins everywhere and this file is ignored (`councilApproved2027` in
 * `data.ts`). `councilDisagreements` lists the towns where the two differ, so
 * a person can check them; `prepare2027` prints it.
 *
 * Committed by hand, no imports beyond types, so the snapshot script can read
 * it as well as the pages. `tests/holiday-council-2027.test.ts` checks every
 * entry: two distinct 2027 dates, an https source on a council or bulletin
 * domain, a read date.
 */

/**
 * How the council fixed the days: a plenary agreement, a mayoral decree, the
 * Junta de Govern Local, or a council page that gives the days without
 * naming the act.
 */
export type CouncilActKind = "ple" | "decret" | "junta" | "web";

export interface CouncilApproved {
  /** The municipality's two local days in 2027, in date order. */
  local: [string, string];
  /** What the source calls each day, in Catalan as it prints it; null where it gives no name. */
  names?: [string | null, string | null];
  /** Nuclei the source gives days of their own, as it lists them. */
  nuclei?: NucleusDays[];
  /** The page or document the dates were read on. */
  source: SourceRef;
  act: { kind: CouncilActKind; date: string | null };
  /** The day the source was read (YYYY-MM-DD). */
  readOn: string;
}

export const COUNCIL_2027: Readonly<Record<string, CouncilApproved>> = {
  // "Fixar, com a festes locals a celebrar durant l'any 2027 en el terme municipal de Barcelona,
  // els dies: 17 de maig, dilluns de Pasqua Granada; 24 de setembre, Mare de Déu de la Mercè."
  // The city's calendar page (ajuntament.barcelona.cat/calendarifestius) gives the same two days.
  barcelona: {
    local: ["2027-05-17", "2027-09-24"],
    names: ["Dilluns de Pasqua Granada", "Mare de Déu de la Mercè"],
    source: {
      name: "Decret d'Alcaldia ANY2026-15675, de 4 de juny, pel qual es fixen les festes locals a celebrar durant l'any 2027",
      ref: "Gaseta Municipal de Barcelona, 9 de juny de 2026",
      url: "https://w123.bcn.cat/APPS/egaseta/home.do?reqCode=downloadFile&publicacionsId=35009",
    },
    act: { kind: "decret", date: "2026-06-04" },
    readOn: "2026-10-30",
  },
  // "Festes oficials i locals de L'Hospitalet 2027 … Festes locals a L'Hospitalet (Ple ordinari
  // 29 de juliol de 2026): 17 de maig (Dilluns de Pasqua Granada), 24 de setembre (Mare de Déu
  // de la Mercè)."
  "l-hospitalet-de-llobregat": {
    local: ["2027-05-17", "2027-09-24"],
    names: ["Dilluns de Pasqua Granada", "Mare de Déu de la Mercè"],
    source: { name: "Calendari dies hàbils: dies festius", ref: "Seu electrònica de l'Ajuntament de l'Hospitalet", url: "https://seuelectronica.l-h.cat/185914_1.aspx?id=1" },
    act: { kind: "ple", date: "2026-07-29" },
    readOn: "2026-10-30",
  },
  // Acta of the Ple ordinari of 2 July 2026 (p. 17): "Proposar al Departament d'Empresa i Treball …
  // com a festes locals retribuïdes i no recuperables en el municipi de Mataró per a l'any 2027,
  // les següents: 17 de maig. Fira de Mataró; 27 de juliol. Festa Major de Les Santes."
  // "Vots favorables: Unanimitat (26)."
  mataro: {
    local: ["2027-05-17", "2027-07-27"],
    names: ["Fira de Mataró", "Festa Major de Les Santes"],
    source: {
      name: "Acta del Ple municipal ordinari de 2 de juliol de 2026",
      ref: "Ajuntament de Mataró",
      url: "https://www.mataro.cat/ca/lajuntament/ple/actes-del-ple/2026/20260702_acta_ple_juliol_anonimitzat.pdf",
    },
    act: { kind: "ple", date: "2026-07-02" },
    readOn: "2026-10-30",
  },
  // "Proposta per l'any 2027: 29 de juny, SANT PERE; 25 de setembre, MARE DE DÉU DE MISERICÒRDIA.
  // Aprovat per la Junta de Govern Local de data 26 de juny de 2026."
  reus: {
    local: ["2027-06-29", "2027-09-25"],
    names: ["Sant Pere", "Mare de Déu de Misericòrdia"],
    source: {
      name: "Calendari de festes locals a Reus i calendari festius amb obertura comercial",
      ref: "Seu electrònica de l'Ajuntament de Reus",
      url: "https://seu.reus.cat/seu/carpetaCiutadana/tramit/24355",
    },
    act: { kind: "junta", date: "2026-06-26" },
    readOn: "2026-10-30",
  },
  // "Festes locals 2027 (acord de la Junta de Govern Local del 17 de juliol de 2026):
  // 11 de maig (dimarts) Sant Anastasi. 17 de maig (dilluns) Segona Pasqua."
  badalona: {
    local: ["2027-05-11", "2027-05-17"],
    names: ["Sant Anastasi", "Segona Pasqua"],
    source: {
      name: "Calendari laboral i festes locals",
      ref: "Ajuntament de Badalona",
      url: "https://www.badalona.cat/ca/serveis-ajuntament/activitat-economica/comerc-1/actualitzacio-de-la-normativa-dhoraris-comercials/calendari-laboral-i-festes-locals",
    },
    act: { kind: "junta", date: "2026-07-17" },
    readOn: "2026-10-30",
  },
  // "LLEIDA: 11 de maig (Festa Major - Sant Anastasi) i 29 de setembre (Festa Major - Sant Miquel).
  // RAIMAT: 27 d'abril i 23 de juliol. SUCS: 14 de maig i 13 d'agost." (calendari 2027)
  lleida: {
    local: ["2027-05-11", "2027-09-29"],
    names: ["Sant Anastasi", "Sant Miquel"],
    nuclei: [
      { name: "Raimat", dates: ["2027-04-27", "2027-07-23"] },
      { name: "Sucs", dates: ["2027-05-14", "2027-08-13"] },
    ],
    source: { name: "Calendari laboral", ref: "La Paeria - Ajuntament de Lleida", url: "https://www.paeria.cat/ca/ciutat/calendaris/calendari-laboral" },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // "Festes locals 2027 (acord del Ple de 13/07/202): Dilluns 26 de juliol. Divendres 29 d'octubre (Sant Narcís)."
  // The page cuts the year of the agreement short, so no date is kept for it.
  girona: {
    local: ["2027-07-26", "2027-10-29"],
    names: [null, "Sant Narcís"],
    source: {
      name: "Calendari de dies inhàbils 2026 i 2027. Calendari laboral i festes locals",
      ref: "Seu electrònica de l'Ajuntament de Girona",
      url: "https://seu.girona.cat/portal/girona_ca/ajuntament/calendari/",
    },
    act: { kind: "ple", date: null },
    readOn: "2026-10-30",
  },
  // Ple of 21 July 2026, item 4, "Aprovat per unanimitat": "divendres 7 de maig (l'Ascensió)"
  // and "divendres 27 d'agost (Festa Major)".
  granollers: {
    local: ["2027-05-07", "2027-08-27"],
    names: ["l'Ascensió", "Festa Major"],
    source: {
      name: "Resum dels acords del Ple de 21 de juliol de 2026",
      ref: "Ajuntament de Granollers, sala de premsa, 22 de juliol de 2026",
      url: "https://www.granollers.cat/noticies/sala-de-premsa/resum-dels-acords-del-ple-de-21-de-juliol-de-2026",
    },
    act: { kind: "ple", date: "2026-07-21" },
    readOn: "2026-10-30",
  },
  // Acta núm. 8, Ple ordinari of 23 July 2026, item 11: "APROVAR les dues FESTES LOCALS de la
  // Ciutat d'Olot per a l'any 2027 pels dies: DIMARTS 7 DE SETEMBRE DE 2027. DIMECRES 8 DE
  // SETEMBRE DE 2027."
  olot: {
    local: ["2027-09-07", "2027-09-08"],
    source: { name: "Acta del Ple ordinari de 23 de juliol de 2026 (acta núm. 8)", ref: "Ajuntament d'Olot", url: "https://www.olot.cat/files/doc8822/aple260723-web.pdf" },
    act: { kind: "ple", date: "2026-07-23" },
    readOn: "2026-10-30",
  },
  // Ple ordinari of 20 July 2026, item 15 (2026/4369), unanimous: "Assenyalar el dilluns 17 de
  // maig (Pasqua Granada) i el dimecres 8 de setembre (Festa Major de Sant Adrià) com a festes
  // locals d'aquest municipi per a l'any 2027."
  "sant-adria-de-besos": {
    local: ["2027-05-17", "2027-09-08"],
    names: ["Pasqua Granada", "Festa Major de Sant Adrià"],
    source: {
      name: "Acta del Ple municipal de 20 de juliol de 2026",
      ref: "Ajuntament de Sant Adrià de Besòs",
      url: "https://www.sant-adria.cat/el-govern/ple-municipal/actes/2026/20-de-juliol-de-2026/at_download/file",
    },
    act: { kind: "ple", date: "2026-07-20" },
    readOn: "2026-10-30",
  },
  // 2027 calendar, local days in bold: "17 de maig (Festa Major), dilluns", "24 de setembre
  // (Festivitat de la Mare de Déu de la Mercè), divendres". "Les festes locals 2027 van ser
  // aprovades al Ple del 25/6/2026."
  "montcada-i-reixac": {
    local: ["2027-05-17", "2027-09-24"],
    names: ["Festa Major", "Mare de Déu de la Mercè"],
    source: { name: "Calendari festiu, festes i fires", ref: "Ajuntament de Montcada i Reixac", url: "https://www.montcada.cat/el-municipi/turisme/calendari-festiu-festes-i-fires" },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-10-30",
  },
  // "Més els 2 dies festius locals de 2027: Tortosa, 17 de maig i 6 de setembre; Bítem, 17 de
  // maig i 17 de setembre; Campredó, 17 de maig i 26 de juliol; Jesús, 17 de maig i 4 d'octubre;
  // els Reguers, 17 de maig i 6 de setembre; Vinallop, 25 de maig i 7 de setembre."
  // Vinallop's 2027 line repeats its 2026 line word for word (both Tuesdays in 2027), so it is
  // left out until the order or the council confirms it.
  tortosa: {
    local: ["2027-05-17", "2027-09-06"],
    nuclei: [
      { name: "Bítem", dates: ["2027-05-17", "2027-09-17"] },
      { name: "Campredó", dates: ["2027-05-17", "2027-07-26"] },
      { name: "Jesús", dates: ["2027-05-17", "2027-10-04"] },
      { name: "els Reguers", dates: ["2027-05-17", "2027-09-06"] },
    ],
    source: {
      name: "Calendari dies inhàbils",
      ref: "Seu electrònica de l'Ajuntament de Tortosa",
      url: "https://www.seu-e.cat/web/tortosa/govern-obert-i-transparencia/serveis-i-tramits/serveis/calendari-dies-inhabils",
    },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // Ple of Friday 26 June 2026: "es van aprovar per unanimitat els dos dies de festes locals per
  // al municipi de Sant Joan Despí per a l'any 2027, que seran el 17 de maig i el 24 de setembre
  // de 2027".
  "sant-joan-despi": {
    local: ["2027-05-17", "2027-09-24"],
    source: {
      name: "Crònica del Ple: sessió ordinària del mes de juny de 2026",
      ref: "Ajuntament de Sant Joan Despí, 26 de juny de 2026",
      url: "https://sjdespi.cat/bloc-informatiu/despinoticies/ajuntament/cronica-del-ple-sessio-ordinaria-del-mes-de-juny-de-2026",
    },
    act: { kind: "ple", date: "2026-06-26" },
    readOn: "2026-10-30",
  },
  // Tauler d'anuncis, 29 July 2026: "Per acord de Ple de data 22 de juliol de 2026 les dues festes
  // locals del 2027 seran: 8 de febrer (dilluns de Carnaval, festa major petita), 12 de juliol
  // (dia de Sant Cristòfol, dilluns)."
  "premia-de-mar": {
    local: ["2027-02-08", "2027-07-12"],
    names: ["dilluns de Carnaval, festa major petita", "Sant Cristòfol"],
    source: { name: "Calendari Festes Oficials 2027", ref: "Tauler d'anuncis oficials de l'Ajuntament de Premià de Mar, 29 de juliol de 2026", url: "https://premiademar.cat/fitxa.php?id=37621" },
    act: { kind: "ple", date: "2026-07-22" },
    readOn: "2026-10-30",
  },
  // "Per acord plenari de 30 de setembre de 2026, s'ha adoptat l'aprovació del calendari de festes
  // locals per al 2027": "17 de maig, dilluns (Festa Local)", "29 de setembre, dimecres (Festa Local)".
  "molins-de-rei": {
    local: ["2027-05-17", "2027-09-29"],
    source: { name: "Calendari festius", ref: "Ajuntament de Molins de Rei", url: "https://molinsderei.cat/calendarifestius/" },
    act: { kind: "ple", date: "2026-09-30" },
    readOn: "2026-10-30",
  },
  // News of Friday 26 June 2026 on "aquest dijous": "El plenari també ha acordat, per unanimitat,
  // proposar a la Generalitat de Catalunya que les dues festes locals … de l'any 2027 siguin el 6
  // de setembre, coincidint amb la Festa Major, i el 30 de novembre, festivitat de Sant Andreu."
  "sant-andreu-de-la-barca": {
    local: ["2027-09-06", "2027-11-30"],
    names: ["Festa Major", "Sant Andreu"],
    source: {
      name: "Crònica del ple municipal ordinari de juny de 2026",
      ref: "Ajuntament de Sant Andreu de la Barca, 26 de juny de 2026",
      url: "https://www.sabarca.cat/noticies/Cr-nica-del-ple-municipal-ordinari-de-juny-de-2026-i-les-valoracions-dels-partits-pol-tics/1885",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-10-30",
  },
  // "Acords del Ple Municipal de juliol de 2026" (24 July 2026): "l'aprovació dels dies festius
  // locals de l'any 2027, que seran … el 17 de maig, segona Pasqua, i el 30 d'agost, dilluns de
  // Festa Major." (the day of the plenary is not given)
  ripollet: {
    local: ["2027-05-17", "2027-08-30"],
    names: ["Segona Pasqua", "dilluns de Festa Major"],
    source: { name: "Acords del Ple Municipal de juliol de 2026", ref: "Ajuntament de Ripollet, 24 de juliol de 2026", url: "https://www.ripollet.cat/actualitat/noticies/acords-del-ple-municipal-de-juliol-de-2026" },
    act: { kind: "ple", date: null },
    readOn: "2026-10-30",
  },
  // "El Ple va aprovar igualment per unanimitat les dues festes locals de 2027, que seran el 22 de
  // gener i el 26 de juliol, coincidint amb les dues festes majors del municipi." (last plenary of
  // the political year; its day is not given)
  "sant-vicenc-dels-horts": {
    local: ["2027-01-22", "2027-07-26"],
    source: {
      name: "L'últim Ple del curs polític aprova definitivament la nova Ordenança Municipal de Circulació",
      ref: "Ajuntament de Sant Vicenç dels Horts",
      url: "https://svh.cat/actualitat/noticies/lultim-ple-del-curs-politic-aprova-definitivament-la-nova-ordenanca-municipal-de-circulacio/",
    },
    act: { kind: "ple", date: null },
    readOn: "2026-10-30",
  },
  // News of Friday 29 May 2026 on the Ple ordinari of "aquest dijous": "l'aprovació dels dies
  // festius locals de 2027, que seran el dilluns 28 i el dimarts 29 de juny, coincidint amb la
  // Festa Major de Sant Pere".
  rubi: {
    local: ["2027-06-28", "2027-06-29"],
    names: ["Festa Major de Sant Pere", "Festa Major de Sant Pere"],
    source: {
      name: "El Ple adjudica el nou contracte de manteniment dels espais verds i les àrees de jocs infantils de Rubí",
      ref: "Ajuntament de Rubí, 29 de maig de 2026",
      url: "https://www.rubi.cat/ca/actualitat/noticies/el-ple-adjudica-el-nou-contracte-de-manteniment-dels-espais-verds-i-les-arees-de-jocs-infantils-de-rubi",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-10-30",
  },
  // "El Ple en sessió de 9 de juny de 2026 ha designat com a festes locals per al 2027: 26 de
  // juliol de 2027 (Festa Major), 28 de setembre de 2027 (Festa del Patró)."
  "sant-fost-de-campsentelles": {
    local: ["2027-07-26", "2027-09-28"],
    names: ["Festa Major", "Festa del Patró"],
    source: { name: "Calendari de festius", ref: "Ajuntament de Sant Fost de Campsentelles", url: "https://www.santfost.cat/ajuntament/informacio-oficial/calendaris/calendari-de-festius" },
    act: { kind: "ple", date: "2026-06-09" },
    readOn: "2026-10-30",
  },
  // "El Ple ordinari de l'Ajuntament d'Artés, celebrat el passat dijous 16 de juliol, ha aprovat per
  // unanimitat la proposta de festius locals per a l'any 2027 … els dies festius seran dilluns i
  // dimarts de Festa Major, corresponents als dies 6 i 7 de setembre de 2027."
  artes: {
    local: ["2027-09-06", "2027-09-07"],
    names: ["dilluns de Festa Major", "dimarts de Festa Major"],
    source: {
      name: "El Ple ordinari aprova els festius locals del 2027 i el Ple extraordinari aprova la memòria d'obres de manteniment de l'escola Dr. Ferrer",
      ref: "Ajuntament d'Artés, 20 de juliol de 2026",
      url: "https://www.artes.cat/ajuntament/organs-de-govern/ple-municipal/el-ple-ordinari-aprova-els-festius-locals-del-2027-i-el-ple-extraordinari-aprova-la-memoria-dobres-de-manteniment-de-lescola-dr-ferrer.html",
    },
    act: { kind: "ple", date: "2026-07-16" },
    readOn: "2026-10-30",
  },
  // Ple of 25 June 2026, item 3: "El Ple va acordar establir com a festes locals d'Alella per l'any
  // 2027, els dies 17 de maig (segona Pasqua) i 1 d'octubre de 2027." (1 August, Sant Feliu, falls
  // on a Sunday)
  alella: {
    local: ["2027-05-17", "2027-10-01"],
    names: ["segona Pasqua", null],
    source: { name: "Resum del Ple municipal del 25 de juny de 2026", ref: "Ajuntament d'Alella", url: "https://alella.cat/26559" },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-10-30",
  },
  // "Dies festius a Cornellà de Llobregat (2027): … 17 de maig (FESTA LOCAL), dilluns. 28 de maig
  // (FESTA LOCAL), divendres." The page links the proposal for the Ple of 22 July 2026 (the same two
  // days), not the agreement itself, so no act is kept.
  "cornella-de-llobregat": {
    local: ["2027-05-17", "2027-05-28"],
    source: { name: "Festes locals i fires", ref: "Ajuntament de Cornellà de Llobregat", url: "https://www.cornella.cat/ca/viure-a-cornella/la-ciutat/festes-locals-i-fires" },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // Calendar 2027: "20 de maig (Festa local)", "7 de desembre (Festa local)".
  "sant-boi-de-llobregat": {
    local: ["2027-05-20", "2027-12-07"],
    source: { name: "Calendari festiu", ref: "Ajuntament de Sant Boi de Llobregat", url: "https://www.santboi.cat/calendarifestiu" },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // Under "Calendari de festes oficials 2027 a Sant Just Desvern": "Les festes locals del 2025 són:
  // dilluns 17 de maig de 2027 i divendres 6 d'agost de 2027." (the label's year is a leftover;
  // the dates carry 2027 and their weekdays match it)
  "sant-just-desvern": {
    local: ["2027-05-17", "2027-08-06"],
    source: { name: "Festes oficials", ref: "Ajuntament de Sant Just Desvern", url: "https://santjust.cat/festes-oficials/" },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // "Festes locals durant l'any 2027: 30 d'agost (dilluns), 31 d'agost (dimarts)."
  "vilafranca-del-penedes": {
    local: ["2027-08-30", "2027-08-31"],
    source: { name: "Calendari de dies inhàbils", ref: "Seu electrònica de l'Ajuntament de Vilafranca del Penedès", url: "https://seu.vilafranca.cat/sobre-la-seu/calendari-de-dies-inhabils" },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // "Les festes laborals a Roses durant l'any 2027 seran les següents: … Divendres 5 de febrer
  // (Festa local), Dilluns 8 de febrer (Festa local) …"
  roses: {
    local: ["2027-02-05", "2027-02-08"],
    source: { name: "Calendari de festes laborals", ref: "Ajuntament de Roses", url: "https://www.roses.cat/ajuntament/informacio-administrativa/calendari-festes-laborals" },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // News of 26 June 2026 on the June Ple "celebrat ahir al vespre": "El punt catorzè va aprovar
  // establir els dos dies festius locals per a l'any vinent: el dia de l'Aplec del Vilar, que al
  // 2027 serà el 30 de març, i la Festivitat de Santa Anna del 26 de juliol, que coincidirà amb un
  // dilluns."
  // The page refused connections on 31 Oct; re-read on 2 Nov 2026 ("Data de realització:
  // 06/26/2026"), word for word the same, so the days and readOn stand.
  blanes: {
    local: ["2027-03-30", "2027-07-26"],
    names: ["Aplec del Vilar", "Santa Anna"],
    source: {
      name: "L'Ajuntament de Blanes ret homenatge pòstum a l'exregidora Amparo Ardanuy al ple municipal",
      ref: "Ajuntament de Blanes, 26 de juny de 2026",
      url: "https://www.blanes.cat/docweb/2026-06-26-ple",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-10-30",
  },
  // "Els dos festius locals per a 2027 són el 7 juny (dilluns posterior al Carroussel) i el 20 de
  // juliol (Santa Margarida, patrona)."
  palafrugell: {
    local: ["2027-06-07", "2027-07-20"],
    names: ["dilluns posterior al Carroussel", "Santa Margarida"],
    source: {
      name: "Calendari festes generals i locals 2027",
      ref: "Seu electrònica de l'Ajuntament de Palafrugell",
      url: "https://seu.palafrugell.cat/informacio-municipal/calendaris/calendari-de-festes-generals-i-locals/calendari-festes-generals-i-locals-2027",
    },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // "Festes locals durant l'any 2027: 22 de febrer (dilluns), Festa de la Llum. 30 d'agost
  // (dilluns), Festa Major." The Ple of 18 June 2026 had the proposal on its agenda; the page
  // does not name the act, so none is kept.
  manresa: {
    local: ["2027-02-22", "2027-08-30"],
    names: ["Festa de la Llum", "Festa Major"],
    source: {
      name: "Calendari de dies inhàbils",
      ref: "Seu electrònica de l'Ajuntament de Manresa",
      url: "https://www.manresa.cat/seuelectronica/menu/9251-calendari-de-dies-inhabils",
    },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // "El Ple de maig del 2026, ha aprovat que els festius locals per a l'any 2027 seran: Dilluns
  // 17 de maig, Dimarts 21 de setembre." (the day of the plenary is not given)
  "esplugues-de-llobregat": {
    local: ["2027-05-17", "2027-09-21"],
    source: {
      name: "Dies festius a Esplugues",
      ref: "Ajuntament d'Esplugues de Llobregat",
      url: "https://www.esplugues.cat/ciutat/dies-festius-festes-laborals-i-locals-a-esplugues/",
    },
    act: { kind: "ple", date: null },
    readOn: "2026-10-30",
  },
  // "Les festes locals pel 2027 seran el 3 de maig (Santa Creu) i el 29 de juny (Sant Pere)."
  figueres: {
    local: ["2027-05-03", "2027-06-29"],
    names: ["Santa Creu", "Sant Pere"],
    source: { name: "Festes: dies festius locals", ref: "Ajuntament de Figueres", url: "https://www.figueres.cat/figueres/festes/copy_of_festes-de-figueres" },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // "L'Ajuntament ha fixat com a festius locals el dilluns posterior a la Festa del Mercat a la
  // Plaça (17 de maig) i el dimarts de fires (7 de desembre)." (point 5.2, "Festius 2027")
  amposta: {
    local: ["2027-05-17", "2027-12-07"],
    names: ["dilluns posterior a la Festa del Mercat a la Plaça", "dimarts de fires"],
    source: {
      name: "Acta de la Taula de treball del comerç local, reunió del 8 d'abril de 2026 (punt 5.2, Festius 2027)",
      ref: "Ajuntament d'Amposta",
      url: "https://www.amposta.cat/documents/taula-treball-pla-de-dinamitzacio-comercial-acta-2026-03-reunio-08-04-2026.pdf",
    },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // Ple of Friday 27 March 2026: "les festes locals seran els dies 18 de gener (dilluns) i el
  // dimarts 3 d'agost" (17 January, Sant Antoni, falls on a Sunday in 2027).
  "vila-seca": {
    local: ["2027-01-18", "2027-08-03"],
    source: {
      name: "L'Ajuntament aprova el calendari de festes locals per a l'any 2027",
      ref: "Ajuntament de Vila-seca, 30 de març de 2026",
      url: "https://vila-seca.cat/es/actualidad-ayuntamiento/noticias-actualidad/pleno-municipal-noticias/lajuntament-aprova-el-calendari-de-festes-locals-per-a-lany-2027",
    },
    act: { kind: "ple", date: "2026-03-27" },
    readOn: "2026-10-30",
  },
  // "Els dies declarats festius per l'any 2027 a Banyoles són els següents: 16 d'agost (Festes
  // d'Agost), 25 d'octubre (Festa Major)."
  banyoles: {
    local: ["2027-08-16", "2027-10-25"],
    names: ["Festes d'Agost", "Festa Major"],
    source: {
      name: "Calendari de dies inhàbils",
      ref: "Seu electrònica de l'Ajuntament de Banyoles",
      url: "https://seu.banyoles.cat/Informaci%C3%B3-de-la-seu-electronica/Calendari-de-dies-inh%C3%A0bils",
    },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // Ple of 23 July 2026: "17 de maig de 2027 (dilluns de Pasqua Granada o Segona Pasqua),
  // 11 d'octubre de 2027 (Festa Major)".
  "caldes-de-montbui": {
    local: ["2027-05-17", "2027-10-11"],
    names: ["Segona Pasqua", "Festa Major"],
    source: {
      name: "Festes locals de l'any 2027",
      ref: "Ajuntament de Caldes de Montbui, 29 de juliol de 2026",
      url: "https://www.caldesdemontbui.cat/actualitat/avisos/festes-locals-de-lany-2027.html",
    },
    act: { kind: "ple", date: "2026-07-23" },
    readOn: "2026-10-30",
  },
  // News of Thursday 30 July 2026: "L'Ajuntament va aprovar ahir per unanimitat, durant el ple
  // ordinari de juliol, el calendari de festes locals … per a l'any 2027. Els dos dies festius
  // locals seran el divendres 19 de març i el divendres 10 de setembre."
  "la-llagosta": {
    local: ["2027-03-19", "2027-09-10"],
    source: {
      name: "El Ple aprova els dos dies festius locals del 2027",
      ref: "Ajuntament de la Llagosta, 30 de juliol de 2026",
      url: "https://www.llagosta.cat/actualitat/noticies/el-ple-aprova-els-dos-dies-festius-locals-del-2027.html",
    },
    act: { kind: "ple", date: "2026-07-29" },
    readOn: "2026-10-30",
  },
  // Ple ordinari of 20 July 2026: "els dies festius locals seran el 17 de maig, coincidint amb la
  // celebració de la Segona Pasqua, i el 29 de juny, festivitat de Sant Pere".
  "premia-de-dalt": {
    local: ["2027-05-17", "2027-06-29"],
    names: ["Segona Pasqua", "Sant Pere"],
    source: {
      name: "Les festes locals de Premià de Dalt per al 2027 ja tenen data",
      ref: "Ajuntament de Premià de Dalt",
      url: "https://www.premiadedalt.cat/news/les-festes-locals-de-premia-de-dalt-per-al-2027-ja-tenen-data",
    },
    act: { kind: "ple", date: "2026-07-20" },
    readOn: "2026-10-30",
  },
  // Cervera 2027: "6 de febrer (dissabte), 27 de setembre (dilluns)", with each nucleus's own.
  cervera: {
    local: ["2027-02-06", "2027-09-27"],
    nuclei: [
      { name: "la Cardosa", dates: ["2027-01-02", "2027-10-16"] },
      { name: "Castellnou d'Oluges", dates: ["2027-05-17", "2027-08-21"] },
      { name: "Malgrat", dates: ["2027-01-23", "2027-08-14"] },
      { name: "la Prenyanosa", dates: ["2027-08-07", "2027-10-02"] },
      { name: "Vergós", dates: ["2027-05-15", "2027-08-07"] },
    ],
    source: { name: "Festius locals", ref: "Paeria de Cervera", url: "https://cervera.cat/ciutat/festius-locals/" },
    act: { kind: "web", date: null },
    readOn: "2026-10-30",
  },
  // Ple of 23 July 2026: "Dimarts 9 de febrer de 2027, coincidint amb el Dimarts del Ranxo …
  // Dilluns 6 de setembre de 2027, amb motiu del dilluns de la Festa Major."
  vidreres: {
    local: ["2027-02-09", "2027-09-06"],
    names: ["Dimarts del Ranxo", "dilluns de la Festa Major"],
    source: {
      name: "Vidreres fixa els dos dies festius locals per a l'any 2027",
      ref: "Ajuntament de Vidreres, 23 de juliol de 2026",
      url: "https://vidreres.cat/vidreres-fixa-els-dos-dies-festius-locals-per-a-lany-2027/",
    },
    act: { kind: "ple", date: null },
    readOn: "2026-10-30",
  },
  // Ple ordinari of 30 July 2026: "Les festes locals per a l'any 2027 seran el dissabte 6 de
  // febrer, Santa Dorotea, i el 16 d'agost, per la Festa Major."
  capellades: {
    local: ["2027-02-06", "2027-08-16"],
    names: ["Santa Dorotea", "Festa Major"],
    source: {
      name: "El Ple aprova les festes locals per al 2027",
      ref: "Ajuntament de Capellades, 4 d'agost de 2026",
      url: "https://www.capellades.cat/actualitat/noticies/el-ple-aprova-les-festes-locals-per-al-2027.html",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-10-30",
  },
  // "En el marc del darrer ple es va decidir fixar les dates del 8 de febrer i el 16 d'agost de
  // 2027 com a festius locals." (news of 31 July 2026; the plenary's date is not given)
  "castellbell-i-el-vilar": {
    local: ["2027-02-08", "2027-08-16"],
    source: {
      name: "Aprovats els festius locals de 2027",
      ref: "Ajuntament de Castellbell i el Vilar, 31 de juliol de 2026",
      url: "https://www.castellbellielvilar.cat/actualitat/noticies/aprovats-els-festius-locals-de-2027.html",
    },
    act: { kind: "ple", date: null },
    readOn: "2026-10-30",
  },
  // "L'Ajuntament de Castellví de Rosanes, per acord plenari, ha aprovat les que seran les festes
  // locals de l'any 2027. Es tracta dels dilluns 31 de maig i 27 de setembre."
  "castellvi-de-rosanes": {
    local: ["2027-05-31", "2027-09-27"],
    source: {
      name: "Les festes locals de Castellví de l'any 2027 seran els dies 31 de maig i 27 de setembre",
      ref: "Ajuntament de Castellví de Rosanes, 11 d'agost de 2026",
      url: "https://www.castellviderosanes.cat/comunicacio/noticies/les-festes-locals-de-castellvi-de-lany-2027-seran-els-dies-31-de-maig-i-27-de-setembre.html",
    },
    act: { kind: "ple", date: null },
    readOn: "2026-10-30",
  },
  // "El Ple de l'Ajuntament de la Llacuna ha aprovat els dos dies que seran festius locals al
  // municipi durant l'any 2027. Es tracta del 30 de març i del 2 d'agost." (news of 1 July 2026)
  "la-llacuna": {
    local: ["2027-03-30", "2027-08-02"],
    source: {
      name: "El Ple aprova els dies festius locals de la Llacuna per a l'any 2027",
      ref: "Ajuntament de la Llacuna, 1 de juliol de 2026",
      url: "https://www.lallacuna.cat/actualitat/noticies/el-ple-aprova-els-dies-festius-locals-de-la-llacuna-per-a-lany-2027.html",
    },
    act: { kind: "ple", date: null },
    readOn: "2026-10-30",
  },
  // "Les festes locals de Riudarenes del 2027, aprovades en sessió ordinària del Ple del dia 3 de
  // juny de 2026 són: Dilluns dia 20 de setembre de 2027 (Festa Major), Divendres dia 12 de
  // novembre de 2027 (per Sant Martí)."
  riudarenes: {
    local: ["2027-09-20", "2027-11-12"],
    names: ["Festa Major", "Sant Martí"],
    source: { name: "Festes locals 2027 - Riudarenes", ref: "Ajuntament de Riudarenes", url: "https://ajuntamentderiudarenes.cat/festes-locals-2027-riudarenes/" },
    act: { kind: "ple", date: "2026-06-03" },
    readOn: "2026-10-30",
  },
  // "El Ple de l'Ajuntament, reunit el passat 16 de juny, va acordar que les festes locals del 2027
  // seran els dies 8 de febrer i 30 d'abril." (news of 6 July 2026)
  pau: {
    local: ["2027-02-08", "2027-04-30"],
    source: {
      name: "Aprovades les festes locals del 2027 i l'adhesió al Pla Comarcal d'Igualtat de Gènere",
      ref: "Ajuntament de Pau, 6 de juliol de 2026",
      url: "https://pau.cat/aprovades-les-festes-locals-del-2027-i-ladhesio-al-pla-comarcal-digualtat-de-genere/",
    },
    act: { kind: "ple", date: "2026-06-16" },
    readOn: "2026-10-30",
  },
  // Ple of 19 June 2026: "Calendari festes laborals 2027 Segons acord del ple ordinari de 19 de juny
  // de 2026, les dues festes laborals d'àmbit local per a l'any 2027 , retribuïdes i no
  // recuperables, pel que fa la capitalitat del municipi i a l'àmbit de l'EMD de Valldoreix són:
  // Sant Cugat: dimecres 3 de març (Sant Medir) i dimarts 29 de juny (Sant Pere) Valldoreix:
  // dimecres 3 de març i dijous 16 de setembre (Sant Cebrià)"
  "sant-cugat-del-valles": {
    local: ["2027-03-03", "2027-06-29"],
    names: ["Sant Medir", "Sant Pere"],
    nuclei: [
      { name: "Valldoreix", dates: ["2027-03-03", "2027-09-16"] },
    ],
    source: { name: "Festes locals per als anys 2026 i 2027", ref: "Ajuntament de Sant Cugat", url: "https://santcugat.cat/avis/festes-locals-2026" },
    act: { kind: "ple", date: "2026-06-19" },
    readOn: "2026-11-03",
  },
  // Ple of 1 June 2026: "Igualment, el Ple de l'Ajuntament de Vilanova i la Geltrú va acordar en la
  // seva sessió ordinària de l'1 de juny de 2026 establir les dues festes locals de la ciutat per a
  // l'any 2027, que seran: 8 de febrer de 2027, dilluns de Carnaval 5 d'agost de 2027, dijous,
  // festivitat de la Mare de Déu de les Neus"
  "vilanova-i-la-geltru": {
    local: ["2027-02-08", "2027-08-05"],
    names: ["dilluns de Carnaval", "festivitat de la Mare de Déu de les Neus"],
    source: { name: "Calendaris municipals", ref: "Ajuntament de Vilanova i la Geltrú", url: "https://www.vilanova.cat/calendaris_municipals" },
    act: { kind: "ple", date: "2026-06-01" },
    readOn: "2026-11-03",
  },
  // Ple of 26 June 2026: "7.EXPEDIENT 2026/13168. APROVACIÓ DE LA PROPOSTA DE LES FESTES LOCALS PER
  // A L'ANY 2027 [...] Primer.- Proposar com a festes locals del municipi de Castelldefels per a
  // l'any 2027 les següents: -Divendres dia 13 d'agost de 2027 -Dimarts dia 7 de desembre de 2027"
  // The council's news of the session gives the item as "Aprovat per unanimitat".
  castelldefels: {
    local: ["2027-08-13", "2027-12-07"],
    source: {
      name: "Acta del Ple de l'Ajuntament de Castelldefels, sessió ordinària núm. 2026/12260 de 26 de juny de 2026",
      ref: "Ajuntament de Castelldefels",
      url: "https://actes.castelldefels.org/session/downloadItem/8a818085a109aa5201a10bda7a810000",
    },
    act: { kind: "ple", date: "2026-06-26" },
    readOn: "2026-11-03",
  },
  // "Festivitats locals del Prat 2027 17 de maig (dilluns Segona Pasqua) 27 de setembre (dilluns de
  // Festa Major)"
  "el-prat-de-llobregat": {
    local: ["2027-05-17", "2027-09-27"],
    names: ["dilluns Segona Pasqua", "dilluns de Festa Major"],
    source: {
      name: "Horaris comercials i normativa",
      ref: "Ajuntament del Prat de Llobregat",
      url: "https://www.elprat.cat/empresa-comerc-i-ocupacio/el-comerc-del-prat/horaris-comercials-i-normativa",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 29 June 2026: "D'altra banda, també es va validar que els festius locals de cara al 2027
  // siguin el dilluns 17 de maig, que correspon a la segona Pasqua, i el dilluns 5 de juliol, diada
  // de Sant Miquel dels Sants."
  vic: {
    local: ["2027-05-17", "2027-07-05"],
    names: ["segona Pasqua", "Sant Miquel dels Sants"],
    source: {
      name: "El ple aprova el nou projecte d'itinerari de bicicletes per connectar el centre amb la zona del Nadal",
      ref: "Ajuntament de Vic, 3 de juliol de 2026",
      url: "https://www.vic.cat/ajuntament/comunicacio-i-protocol/noticies/ple-aprova-nou-projecte-itinerari-bicicletes-connectar-centre-nadal",
    },
    act: { kind: "ple", date: "2026-06-29" },
    readOn: "2026-11-03",
  },
  // Ple of 27 April 2026: "El Vendrell, 28 d'abril de 2026 L'Ajuntament del Vendrell va celebrar
  // ahir dilluns 27 d'abril una sessió de ple ordinària. [...] PART RESOLUTIVA -Per unanimitat, es
  // van aprovar com a festes locals per l'any 2027 els dies 26 i 27 de juliol."
  "el-vendrell": {
    local: ["2027-07-26", "2027-07-27"],
    source: {
      name: "Acords de la sessió de Ple ordinari del 27 d’abril de 2026",
      ref: "Ajuntament del Vendrell, 28 d’abril de 2026",
      url: "https://www.elvendrell.net/informacio/9703-acords-de-la-sessio-de-ple-ordinari-del-27-d-abril-de-2026",
    },
    act: { kind: "ple", date: "2026-04-27" },
    readOn: "2026-11-03",
  },
  // Ple of 30 June 2026: "Es fa públic que mitjançant acord de Ple en sessió de data 30 de juny de
  // 2026 s'han aprovat les festes locals de Castellar del Vallès, per a l'any 2027, la part
  // dispositiva del qual es transcriu a continuació: 'PRIMER.- Aprovar com a festes locals de
  // Castellar del Vallès, per a l'any 2027: - El divendres 19 de març de 2027, festivitat Sant
  // Josep. - El dilluns 13 de setembre de 2027, en motiu de la Festa Major."
  "castellar-del-valles": {
    local: ["2027-03-19", "2027-09-13"],
    names: ["festivitat Sant Josep", "Festa Major"],
    source: {
      name: "Aprovació de les festes locals per a l'any 2027 (Edicte, exp. 3037-2026/3460)",
      ref: "BOPB, 15 de juliol de 2026",
      url: "https://bop.diba.cat/anunci/descarrega-pdf/3967719",
    },
    act: { kind: "ple", date: "2026-06-30" },
    readOn: "2026-11-03",
  },
  // Ple of 23 July 2026: "Aprovació del calendari de festes locals per al 2027 El Ple també va
  // aprovar el calendari de festes locals per a l'any 2027. La proposta fixa com a festius locals el
  // 10 de juny, coincidint amb la festivitat de Santa Oliva, patrona d'Olesa de Montserrat, i el 25
  // de juny, divendres després de la diada de Sant Joan."
  "olesa-de-montserrat": {
    local: ["2027-06-10", "2027-06-25"],
    names: ["Santa Oliva", "divendres després de la diada de Sant Joan"],
    source: {
      name: "Resum del Ple ordinari del 23 de juliol de 2026",
      ref: "Ajuntament d'Olesa de Montserrat, 24 de juliol de 2026",
      url: "https://www.olesademontserrat.cat/article/resum-ple-juliol-olesa-2026",
    },
    act: { kind: "ple", date: "2026-07-23" },
    readOn: "2026-11-03",
  },
  // Ple of 16 July 2026: "Festes locals del Masnou el 2027 Aprovades en la sessió plenària del 16 de
  // juliol del 2026. Dilluns 17 de maig del 2027 (segona Pasqua) Dimarts 29 de juny del 2027 (Sant
  // Pere)"
  "el-masnou": {
    local: ["2027-05-17", "2027-06-29"],
    names: ["segona Pasqua", "Sant Pere"],
    source: { name: "Calendari laboral", ref: "Ajuntament del Masnou", url: "https://www.elmasnou.cat/informacio-oficial/calendari-laboral" },
    act: { kind: "ple", date: "2026-07-16" },
    readOn: "2026-11-03",
  },
  // "L'Ajuntament ha fixat, també, els dies de festa local per als anys 2024 a 2027", in a table (an
  // image on the page, read on 3 Nov 2026): "2027 | 5 de febrer | 2 d'agost" under "DIVENDRES DE
  // CARNAVAL | FESTA MAJOR".
  "sant-feliu-de-guixols": {
    local: ["2027-02-05", "2027-08-02"],
    names: ["Divendres de Carnaval", "Festa Major"],
    source: {
      name: "Calendari dies inhàbils",
      ref: "Seu electrònica de l'Ajuntament de Sant Feliu de Guíxols",
      url: "https://seu-e.cat/ca/web/santfeliudeguixols/govern-obert-i-transparencia/serveis-i-tramits/serveis/calendari-dies-inhabils",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 18 June 2026: "9.0.- ELECCIÓ DE FESTES LOCALS A VILASSAR DE MAR PER L'ANY 2027. El Ple
  // d'aquesta Corporació, prèvia deliberació, ha aprovat per unanimitat Per 20 Vots A Favor [...]
  // els següents acords: [...] PRIMER.- PROPOSAR al Departament d'Empresa i Treball que en el
  // calendari oficial de festes de Catalunya de l'any 2027 figurin com a FESTES LOCALS DE VILASSAR
  // DE MAR les següents: - Dia 25 de juny de 2027 (Festa Major de Sant Joan) - Dia 22 de novembre de
  // 2027(naixement del municipi)"
  "vilassar-de-mar": {
    local: ["2027-06-25", "2027-11-22"],
    names: ["Festa Major de Sant Joan", "naixement del municipi"],
    source: {
      name: "Acta del Ple ordinari de 18 de juny de 2026",
      ref: "Ajuntament de Vilassar de Mar",
      url: "https://www.vilassardemar.cat/sites/default/files/file/minutes/ACTA%20PLE%20ORDINARI%2018-06-2026_ANONIMITZADA.pdf",
    },
    act: { kind: "ple", date: "2026-06-18" },
    readOn: "2026-11-03",
  },
  // Ple of 30 April 2026: "Festes locals del 2027 Igualment s'ha aprovat unànimement el calendari de
  // festes locals de l'any 2027 de Tàrrega i els pobles del terme. En el cas de Tàrrega recauran el
  // divendres 14 de maig i el divendres 10 de setembre." The villages of the municipality were
  // approved in the same agreement; the news does not give their days.
  tarrega: {
    local: ["2027-05-14", "2027-09-10"],
    source: {
      name: "El Ple de Tàrrega aprova el pressupost municipal del 2026, que assoleix la xifra rècord de 25,2 milions d’euros",
      ref: "Ajuntament de Tàrrega, 30 d'abril de 2026",
      url: "https://www.tarrega.cat/noticies/sessio-ple-30-abril-2026",
    },
    act: { kind: "ple", date: "2026-04-30" },
    readOn: "2026-11-03",
  },
  // "Festius locals Any 2026: Dilluns 25 de maig 2026 Divendres 14 d'agost 2026 Any 2027: Dilluns 17
  // de maig 2027 Divendres 13 d'agost 2027 Darrera actualització: 28.09.2026"
  cardedeu: {
    local: ["2027-05-17", "2027-08-13"],
    source: { name: "Festius locals", ref: "Ajuntament de Cardedeu", url: "https://www.cardedeu.cat/el-municipi/festius-locals" },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 25 June 2026: "3.- (PRP2026/206). Fixació de les dues festes locals per a l'any 2027
  // [...] Per això, es proposa al Ple Municipal, l'adopció dels següents ACORDS Primer.- Proposar al
  // Departament d'Empresa i Treball de la Generalitat de Catalunya que fixi com a festes locals del
  // municipi de Tordera a la publicació de les festes locals corresponents a l'any 2027 les
  // següents: 11 de maig, Sant Ponç 24 d'agost, Sant Bartomeu [...] Votació: Sotmesa la proposta a
  // votació, aquesta és aprovada per unanimitat."
  tordera: {
    local: ["2027-05-11", "2027-08-24"],
    names: ["Sant Ponç", "Sant Bartomeu"],
    source: {
      name: "Acta de Ple de 25 de juny de 2026 (PLE2026/6)",
      ref: "Seu electrònica de l'Ajuntament de Tordera",
      url: "https://www.seu-e.cat/documents/1437609/21918144/Acta+PLE2026_6+de+25+de+juny+de+2026.pdf/e0e55d60-f5d7-408a-9614-1335d450e56a",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-03",
  },
  // "Segons els acords del Ple municipal, les festes locals de Sant Celoni i la Batllòria són les
  // següents: 2026 2027 Sant Celoni 7 de setembre i 9 de novembre 6 de setembre i 8 de novembre La
  // Batllòria 24 d'agost i 18 de desembre 23 d'agost i 18 de desembre"
  "sant-celoni": {
    local: ["2027-09-06", "2027-11-08"],
    nuclei: [
      { name: "la Batllòria", dates: ["2027-08-23", "2027-12-18"] },
    ],
    source: { name: "Calendari de festes locals de Sant Celoni i la Batllòria", ref: "Ajuntament de Sant Celoni", url: "https://santceloni.cat/11624" },
    act: { kind: "ple", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 28 May 2026: "EXPEDIENT 1020/2026. APROVAR ELS DIES FESTIUS LOCALS DEL MUNICIPI DE
  // BALAGUER CORRESPONENTS A L'ANY 2027 ... Primer. Proposar com a dies festius locals del municipi
  // de Balaguer corresponents a l'any 2027 els següents: - Dilluns, 12 de juliol de 2027 - Dimarts,
  // 9 de novembre de 2027"
  balaguer: {
    local: ["2027-07-12", "2027-11-09"],
    source: {
      name: "Certificat de l'acord del Ple de 28 de maig de 2026 (expedient 1020/2026), dies festius locals 2027",
      ref: "Paeria de Balaguer",
      url: "https://www.balaguer.cat/portal/8/data/festius_2027.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-03",
  },
  // Ple of 21 July 2026: "Per unanimitat, el Ple va acordar designar com a festes locals de l'any
  // 2027 el divendres 30 de juliol i el dilluns 16 d'agost."
  cubelles: {
    local: ["2027-07-30", "2027-08-16"],
    source: {
      name: "El Ple aprova l'actualització dels preus de l'aigua en compliment del contracte adjudicat",
      ref: "Ajuntament de Cubelles, 23 de juliol de 2026",
      url: "https://www.cubelles.cat/informacio-i-actualitat/noticies/el-ple-aprova-lactualitzacio-dels-preus-de-laigua-en-compliment-del-contracte-adjudicat.html",
    },
    act: { kind: "ple", date: "2026-07-21" },
    readOn: "2026-11-03",
  },
  // "Festes laborals locals Per a l'any 2027, són el 7 de maig (coincidint amb l'Ascensió) i el 26
  // de juliol (coincidint amb la Festa Major)."
  canovelles: {
    local: ["2027-05-07", "2027-07-26"],
    names: ["Ascensió", "Festa Major"],
    source: { name: "Festes locals", ref: "Ajuntament de Canovelles", url: "https://www.canovelles.cat/el-municipi/festes-locals" },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 2 July 2026: "Dies festius locals L'àrea de Participació Popular ha presentat la proposta
  // per determinar els dos dies festius locals per a l'any 2027 . [...] En aquest cas, es proposa
  // que els dos dies festius locals de 2027 siguin el 27 de maig (dijous de Corpus) i el 8 de
  // setembre (Gala de Queralt). La proposta ha estat aprovada per unanimitat ."
  berga: {
    local: ["2027-05-27", "2027-09-08"],
    names: ["dijous de Corpus", "Gala de Queralt"],
    source: {
      name: "Resum del ple de la corporació corresponent a la sessió ordinària de juliol de 2026",
      ref: "Ajuntament de Berga",
      url: "https://www.ajberga.cat/actualitat/noticies/resum-del-ple-de-la-corporacio-corresponent-a-la-sessio-ordinaria-de-juliol-de-2026",
    },
    act: { kind: "ple", date: "2026-07-02" },
    readOn: "2026-11-03",
  },
  // Ple of 25 June 2026: "El Ple municipal s'ha reunit, en sessió ordinària, el 25 de juny de 2026
  // (vegeu vídeo) d'acord amb el següent ordre del dia. [...] Es va aprovar per unanimitat els
  // festius locals 2027 (9 juliol i 16 agost), la modificació del contracte servei gestió escoles
  // bressol, la pròrroga del conveni amb la Generalitat per la Residència, i l'aprovació definitiva
  // del ROM."
  "arenys-de-mar": {
    local: ["2027-07-09", "2027-08-16"],
    source: {
      name: "Crònica del Ple ordinari del 25 de juny de 2026",
      ref: "Ajuntament d'Arenys de Mar",
      url: "https://arenysdemar.cat/document.php?id=50312",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-03",
  },
  // Ple of 7 May 2026: "La sessió ordinària del ple d'ahir que corresponia al mes d'abril que es va
  // ajornar, es va tancar amb l'aprovació de tots els punts ... També es van establir com a dies
  // festius locals per al 2027 el 20 de gener Sant Sebastià i el 21 de setembre Sant Mateu."
  vallirana: {
    local: ["2027-01-20", "2027-09-21"],
    names: ["Sant Sebastià", "Sant Mateu"],
    source: {
      name: "El ple aprova tots els punts",
      ref: "Ajuntament de Vallirana, 8 de maig de 2026",
      url: "https://www.vallirana.cat/actualitat/noticies/el-ple-aprova-tots-els-punts.html",
    },
    act: { kind: "ple", date: "2026-05-07" },
    readOn: "2026-11-03",
  },
  // "Festes locals al municipi de la Ràpita durant l'any 2027: 8 de setembre, dimecres 11 d'octubre,
  // dilluns"
  "la-rapita": {
    local: ["2027-09-08", "2027-10-11"],
    source: { name: "Calendari dies inhàbils", ref: "Ajuntament de la Ràpita", url: "https://larapita.cat/calendari-dies-inhabils/" },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 25 June 2026: "Aprovació de les festes locals per a l'any 2027. El Ple ha aprovat la
  // proposta de les dues festes locals de Palau-solità i Plegamans per a l'any 2027. La proposta
  // trasllada al Departament d'Empresa i Treball de la Generalitat de Catalunya la designació dels
  // dies 17 de maig de 2027 i 30 d'agost de 2027 com a festes locals del municipi, amb caràcter
  // retribuït i no recuperable. S'aprova per unanimitat de tots els grups polítics."
  "palau-solita-i-plegamans": {
    local: ["2027-05-17", "2027-08-30"],
    source: {
      name: "Resum dels acords del Ple municipal de juny de 2026",
      ref: "Ajuntament de Palau-solità i Plegamans, 26 de juny de 2026",
      url: "https://www.palauplegamans.cat/actualitat/noticies/pln17/resum-dels-acords-del-ple-municipal-de-juny-de-2026",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-03",
  },
  // Ple of 25 June 2026: "Aprovació de les festes locals per l'any 2027 de Canet de Mar L'any que
  // ve, seran dies festius a la localitat el dimarts 29 de juny, dia de Sant Pere i dimecres 8 de
  // setembre de 2027. Aprovades per unanimitat dels 14 regidors presents"
  "canet-de-mar": {
    local: ["2027-06-29", "2027-09-08"],
    names: ["Sant Pere", null],
    source: {
      name: "Crònica del Ple ordinari de 25 de juny de 2026",
      ref: "Ajuntament de Canet de Mar",
      url: "https://www.canetdemar.cat/document.php?id=29607",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-03",
  },
  // "Festius locals d'Abrera per a l'any 2026 Dilluns 25 de maig Dilluns 29 de juny Festius locals
  // d'Abrera per a l'any 2027 Dilluns 17 de maig Dimarts 29 de juny"
  abrera: {
    local: ["2027-05-17", "2027-06-29"],
    source: {
      name: "Festius amb obertura comercial autoritzada",
      ref: "Ajuntament d'Abrera",
      url: "https://www.ajuntamentabrera.cat/serveis/promocio-economica-comerc-i-turisme/festius-amb-obertura-comercial-autoritzada",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 9 June 2026: "Els regidors i regidores van acordar per unanimitat les festes locals de
  // Santpedor de cara l'any que ve . El festiu de Festa Major serà el dilluns 14 de juny de 2027; i
  // el de Santa Anna, el dilluns 26 de juliol de 2027 ."
  santpedor: {
    local: ["2027-06-14", "2027-07-26"],
    names: ["Festa Major", "Santa Anna"],
    source: {
      name: "El ple aprova per unanimitat iniciar el procediment d’imposició de penalitats a l’empresa que ofereix el servei de recollida de residus",
      ref: "Ajuntament de Santpedor, 10 de juny de 2026",
      url: "https://www.santpedor.cat/actualitat/noticies/el-ple-aprova-per-unanimitat-iniciar-el-procediment-dimposicio-de-penalitats-a-lempresa-que-ofereix-el-servei-de-recollida-de-residus-.html",
    },
    act: { kind: "ple", date: "2026-06-09" },
    readOn: "2026-11-03",
  },
  // Ple of 16 July 2026: "Les dates de les dues festes locals per a l'any 2027, aprovades pel Ple de
  // l'Ajuntament de Riudoms en la sessió del 16 de juliol de 2026, són: Divendres, 23 de juliol,
  // Festa Major de Sant Jaume Apòstol. Dilluns, 22 de novembre, Festa del Beat Bonaventura Gran."
  riudoms: {
    local: ["2027-07-23", "2027-11-22"],
    names: ["Festa Major de Sant Jaume Apòstol", "Festa del Beat Bonaventura Gran"],
    source: { name: "Festes locals", ref: "Ajuntament de Riudoms", url: "https://www.riudoms.cat/festes-locals" },
    act: { kind: "ple", date: "2026-07-16" },
    readOn: "2026-11-03",
  },
  // Calendari Festius 2027: "15 febrer (dilluns) Festa Local", "17 de maig (dilluns) Festa Local"
  // (the list also gives the twelve Catalonia-wide days with their 2027 weekdays).
  navarcles: {
    local: ["2027-02-15", "2027-05-17"],
    source: {
      name: "Calendari de festius",
      ref: "Ajuntament de Navarcles",
      url: "https://www.navarcles.cat/ajuntament/informacio-oficial/calendari-de-festius/",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 27 May 2026: "A més, s'ha proposat a la Generalitat de Catalunya que les dues festes
  // locals de l'any 2027 siguin els dies 17 de maig, coincidint amb el Dilluns de Pasqua de
  // Pentecosta i l'Aplec de la Roca d'en Pla, i el 27 d'agost de Festa Major."
  "sant-hilari-sacalm": {
    local: ["2027-05-17", "2027-08-27"],
    names: ["Dilluns de Pasqua de Pentecosta", "Festa Major"],
    source: {
      name: "Crònica del ple del 27 de maig del 2026",
      ref: "Ajuntament de Sant Hilari Sacalm, 28 de maig de 2026",
      url: "https://www.santhilari.cat/noticies/cronica-del-ple-del-27-de-maig-del-2026/",
    },
    act: { kind: "ple", date: "2026-05-27" },
    readOn: "2026-11-03",
  },
  // "Calendari de dies inhàbils Festius locals 2026: 23 de gener i el 25 de maig. Tanmateix,
  // l'Ajuntament de Sant Pol de Mar romandrà tancat al públic segons conveni laboral els dies 24 i
  // 31 de desembre. Festius locals 2027: 25 de gener i 17 de maig."
  "sant-pol-de-mar": {
    local: ["2027-01-25", "2027-05-17"],
    source: { name: "Calendari de dies inhàbils", ref: "Ajuntament de Sant Pol de Mar", url: "https://www.santpol.cat/14476" },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 23 July 2026: "3.- Aprovació de les Festes locals per a l'any 2027 El Ple va aprovar com
  // a festes locals del municipi de Lliçà d'Amunt per a l'any 2027 els dies 7 de gener i 10 de
  // setembre. UNANIMITAT"
  "llica-d-amunt": {
    local: ["2027-01-07", "2027-09-10"],
    source: {
      name: "Crònica del Ple ordinari de dijous 23 de juliol de 2026",
      ref: "Ajuntament de Lliçà d'Amunt, vídeo-actes del Ple (sessió PLE2026/6)",
      url: "https://plemunicipal.llicamunt.cat/session/downloadItem/8a8180899fa13582019fb7b6aba90328",
    },
    act: { kind: "ple", date: "2026-07-23" },
    readOn: "2026-11-03",
  },
  // Ple of 23 July 2026: "El Ple ordinari de l'Ajuntament de Cunit, celebrat aquest dijous 23 de
  // juliol, ha aprovat diversos punts de l'ordre del dia relacionats amb la gestió econòmica,
  // l'organització municipal, així com diferents mocions presentades pels grups municipals. Entre
  // els principals acords adoptats destaca l'aprovació de l'acta del ple de data 28 de maig, la
  // designació com a festes locals de 2027, els dies 20 de gener i 12 de juliol." The names are the
  // council's calendar page's (cunit.cat/calendari-laboral): "20 de gener (Sant Sebastià, segon
  // patró de Cunit) | 12 de juliol (Sant Cristòfol, patró de Cunit)".
  cunit: {
    local: ["2027-01-20", "2027-07-12"],
    names: ["Sant Sebastià", "Sant Cristòfol"],
    source: {
      name: "Informació del Ple ordinari de 23 de juliol",
      ref: "Ajuntament de Cunit, 23 de juliol de 2026",
      url: "https://www.cunit.cat/informacio-del-ple-ordinari-de-23-de-juliol/",
    },
    act: { kind: "ple", date: "2026-07-23" },
    readOn: "2026-11-03",
  },
  // Ple of 27 July 2026: "Calendari laboral i festes locals. Any 2027 [...] 22 de gener, divendres
  // (Sant Vicenç)* [...] 20 d'agost, divendres (Festa Major de l'Aigua i la Llum)* [...] * Festius
  // locals a Castellbisbal, acordats per unanimitat a la sessió plenària del passat 27 de juliol de
  // 2026."
  castellbisbal: {
    local: ["2027-01-22", "2027-08-20"],
    names: ["Sant Vicenç", "Festa Major de l'Aigua i la Llum"],
    source: {
      name: "Calendari de dies festius",
      ref: "Ajuntament de Castellbisbal",
      url: "https://www.castellbisbal.cat/guia-del-municipi/calendari-de-dies-festius",
    },
    act: { kind: "ple", date: "2026-07-27" },
    readOn: "2026-11-03",
  },
  // Ple of 25 June 2026: "CERTIFICAT EXPEDIENT NÚM. ÒRGAN COL·LEGIAT DATA DE LA SESSIÓ 2614/2026 El
  // ple 25/06/2026 EN QUALITAT DE SECRETÀRIA d'AQUEST ÒRGAN, CERTIFICO: Que en la sessió celebrada
  // en la data a dalt indicada es va adoptar el següent acord: PROPOSAR AL DEPARTAMENT D'EMPRESA I
  // TREBALL DE LA GENERALITAT DE CATALUNYA QUE ES DECLARIN EN AQUEST MUNICIPI ELS DIES 14 D'ABRIL I
  // 17 DE MAIG, COM A FESTES LOCALS DURANT L'ANY 2027 (EXPEDIENT 2614/2026) Favorable Tipus de
  // votació: Unanimitat/Assentiment"
  "badia-del-valles": {
    local: ["2027-04-14", "2027-05-17"],
    source: {
      name: "Certificat d'acord festius locals 2027",
      ref: "Ajuntament de Badia del Vallès",
      url: "https://www.badiadelvalles.cat/ARXIUS/2026/CalendariLaboral/Certificat_d_acord.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-03",
  },
  // Ple of 30 June 2026: "Publicació 30.06.2026 Resum del ple municipal de juny S'aprova el 8 de
  // setembre (dimecres) i 29 de novembre (dilluns) com a festes locals del 2027 [...] En un altre
  // ordre de qüestions, el ple va aprovar els dies 8 de setembre, amb motiu de les Fires i Festes, i
  // 29 de novembre, coincidint amb la Festa Major, com a festes locals del calendari de 2027."
  "sant-sadurni-d-anoia": {
    local: ["2027-09-08", "2027-11-29"],
    names: ["Fires i Festes", "Festa Major"],
    source: {
      name: "Resum del ple municipal de juny",
      ref: "Ajuntament de Sant Sadurní d'Anoia, 30 de juny de 2026",
      url: "https://santsadurni.cat/document.php?id=23682",
    },
    act: { kind: "ple", date: "2026-06-30" },
    readOn: "2026-11-03",
  },
  // "2027 Les festes locals de l'any 2027, aprovades pel Ple Municipal i l'EMD són les següents:
  // Torroella de Montgrí: 25 d'agost de 2027, i 30 de novembre de 2027 L'Estartit: 26 de juliol de
  // 2027 i 13 de desembre de 2027."
  "torroella-de-montgri": {
    local: ["2027-08-25", "2027-11-30"],
    nuclei: [
      { name: "l'Estartit", dates: ["2027-07-26", "2027-12-13"] },
    ],
    source: { name: "Festius locals", ref: "Ajuntament de Torroella de Montgrí", url: "https://www.torroella-estartit.cat/ca/festes-locals-any.html" },
    act: { kind: "ple", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 28 April 2026: "PUBLICAT 04.05.2026 Festes locals de l'any 2027 Aprovat pel ple municipal
  // de 28 d'abril de 2026. Les dues festes locals per a l'any 2027 aprovades per l'Ajuntament de
  // Llavaneres seran els dies: - 19 de juliol (dilluns) Festa Major de La Minerva - 30 de novembre
  // (dimarts), Sant Andreu"
  "sant-andreu-de-llavaneres": {
    local: ["2027-07-19", "2027-11-30"],
    names: ["Festa Major de La Minerva", "Sant Andreu"],
    source: { name: "Festes locals de l'any 2027", ref: "Ajuntament de Sant Andreu de Llavaneres, 4 de maig de 2026", url: "https://ajllavaneres.cat/25105" },
    act: { kind: "ple", date: "2026-04-28" },
    readOn: "2026-11-03",
  },
  // Ple of 30 June 2026: "Que, en la sessió del Ple de data 30 de juny de 2026 , es van adoptar,
  // entre d'altres, i per unanimitat dels seus membres, els següents acords: APROVACIÓ DELS DIES
  // FESTIUS LOCALS PER A L'ANY 2027 DEL MUNICIPI DE LA BISBAL D'EMPORDÀ. [...] Primer.- PROPOSAR als
  // Serveis Territorials a Girona del Departament d 'Empresa i Treball de la Generalitat de
  // Catalunya les següents festes locals del municipi de la Bisbal d'Empordà per a l'any 2027: 1a
  // festa local: 17 de maig de 2027 2a festa local: 16 d´agost de 2027"
  "la-bisbal-d-emporda": {
    local: ["2027-05-17", "2027-08-16"],
    source: {
      name: "Certificat Ple aprovació dels dies festius locals per a l'any 2027",
      ref: "Ajuntament de la Bisbal d'Empordà",
      url: "https://labisbal.cat/wp-content/uploads/2026/08/CERT_PLE-APROVACIO-FESTES-LOCALS-2027.pdf",
    },
    act: { kind: "ple", date: "2026-06-30" },
    readOn: "2026-11-03",
  },
  // Ple of 30 June 2026: "El Ple també va aprovar, en aquest cas per unanimitat, proposar al
  // Departament d'Empresa i Treball de la Generalitat de Catalunya, com a festes locals de Ripoll
  // per a l'any 2025, els dies 11 i 12 de maig de 2027, coincidint amb la Festa Major de Sant
  // Eudald." The "any 2025" is a slip: the dates carry 2027 and the Ple met in June 2026.
  ripoll: {
    local: ["2027-05-11", "2027-05-12"],
    names: ["Festa Major de Sant Eudald", "Festa Major de Sant Eudald"],
    source: {
      name: "Ple ordinari del mes de juny del 2026",
      ref: "Ajuntament de Ripoll (Memòria de plens)",
      url: "https://ripoll.cat/ple-ordinari-del-mes-de-juny-del-2026/",
    },
    act: { kind: "ple", date: "2026-06-30" },
    readOn: "2026-11-03",
  },
  // Ple of 25 June 2026: "5.- Aprovació de les fests locals per a l'any 2027. El Ple aprova, per
  // unanimitat de tots els grups, les festes locals per a l'any 2027: 29 d'abril de 2027 – Festa
  // Major dels Sants Màrtirs 17 de maig de 2027 – Pasqua Granada"
  "vilassar-de-dalt": {
    local: ["2027-04-29", "2027-05-17"],
    names: ["Festa Major dels Sants Màrtirs", "Pasqua Granada"],
    source: {
      name: "Ple ordinari del juny 2026 (Aprovació de punts)",
      ref: "Ajuntament de Vilassar de Dalt",
      url: "https://vilassardedalt.cat/353-ajuntament/ajuntament/ple-municipal/ple-ordinari-del-juny-2026",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-03",
  },
  // Ple of 15 July 2026: "EXPEDIENT 2266/2026. DETERMINACIÓ DE LES FESTES LOCALS ANY 2027. Favorable
  // Tipus de votació: Unanimitat/Assentiment ... Primer. Proposar al Departament d'Empresa i Treball
  // de la Generalitat de Catalunya, els dies que s'indiquen tot seguit com a festius locals,
  // retribuïts i no recuperables al municipi de Sant Fruitós de Bages per a l'any 2027: Dijous, 21
  // de gener de 2027 Dilluns, 5 de juliol de 2027"
  "sant-fruitos-de-bages": {
    local: ["2027-01-21", "2027-07-05"],
    names: ["festivitat de Sant Fruitós", "festa major d'estiu"],
    source: {
      name: "Certificat d'acord del Ple - Determinació de les festes locals any 2027 (Calendari Festes Locals 2027)",
      ref: "Seu electrònica de l'Ajuntament de Sant Fruitós de Bages",
      url: "https://www.santfruitos.cat/seu-electronica/informacio-oficial/certificat-dacord-ple_-festes-locals-2027.pdf",
    },
    act: { kind: "ple", date: "2026-07-15" },
    readOn: "2026-11-03",
  },
  // Ple of 30 July 2026: "El Ple també va donar llum verda a les dues festes locals de Viladecavalls
  // per al 2027, que se celebraran el 12 de juliol, coincidint amb el dilluns de Festa Major, i l'11
  // de novembre, festivitat de Sant Martí, patró del municipi."
  viladecavalls: {
    local: ["2027-07-12", "2027-11-11"],
    names: ["dilluns de Festa Major", "Sant Martí"],
    source: {
      name: "Nous recursos per al Punt Jove de Can Trias",
      ref: "Ajuntament de Viladecavalls, 31 de juliol de 2026",
      url: "https://www.viladecavalls.cat/actualitat/noticies/nous-recursos-per-al-punt-jove-de-can-trias",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-11-03",
  },
  // "Festes locals FESTES LOCALS 2027: Segona Pasqua: 17 de maig, dilluns Festa Major: 8 de
  // setembre, dimecres FESTES APROVADES PER CATALUNYA 2027:"
  guissona: {
    local: ["2027-05-17", "2027-09-08"],
    names: ["Segona Pasqua", "Festa Major"],
    source: {
      name: "Calendari festes locals Guissona",
      ref: "Ajuntament de Guissona",
      url: "https://www.guissona.cat/serveis-de-guissona/festes/festes-locals-guissona-2024/",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 25 June 2026: "4. DESIGNACIÓ DE LES FESTES LOCALS DE L'ANY 2027. EXP. 536/26. ...
  // Primer.- Proposar com a festes locals del municipi de Taradell per a l'any 2027 els dies
  // següents: -Dimecres, 20 de gener -Dimecres, 25 d'agost. ... Es sotmet a votació la proposta
  // d'acord i s´aprova per unanimitat." The acta names the days: "el dia 20 de gener (Sant Sebastià)
  // i el dia 25 d'agost (Sant Genís)".
  taradell: {
    local: ["2027-01-20", "2027-08-25"],
    names: ["Sant Sebastià", "Sant Genís"],
    source: {
      name: "Acta de sessió ordinària del Ple de l'Ajuntament, núm. 06/2026, de 25/06/2026",
      ref: "Ajuntament de Taradell",
      url: "https://www.taradell.cat/documents/ple-de-juny-de-2026-27072026-101231.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-03",
  },
  // Ple of 30 April 2026: "Festes Locals 2027. S'ha aprovat la proposta de les dates per a les
  // festes locals de l'any 2027 que seran a Puig-reig el dilluns 17 de maig (Festa Major) i l'11 de
  // novembre (Sant Martí); i a l'Ametlla de Merola serà el 17 de maig (Festa Major de Puig-reig) i
  // el 20 de setembre (Festa Major de l'Ametlla de Merola). S'ha aprovat per unanimitat."
  "puig-reig": {
    local: ["2027-05-17", "2027-11-11"],
    names: ["Festa Major", "Sant Martí"],
    nuclei: [
      { name: "l'Ametlla de Merola", dates: ["2027-05-17", "2027-09-20"] },
    ],
    source: {
      name: "Resum del ple ordinari d’abril",
      ref: "Ajuntament de Puig-reig, 4 de maig de 2026",
      url: "https://puig-reig.cat/arxiu/resum-del-ple-ordinari-dabril-3/",
    },
    act: { kind: "ple", date: "2026-04-30" },
    readOn: "2026-11-03",
  },
  // Ple of 14 July 2026: "ANY 2027 ... També seran inhàbils els dies declarats com a festius locals
  // al Pont de Vilomara i Rocafort ( acord de Ple de data 14 de juliol de 2026 ). ... Festes locals
  // durant l'any 2027 15 de març (dilluns), Festa del Contribuent. 26 de juliol (dilluns), Festa
  // Major."
  "el-pont-de-vilomara-i-rocafort": {
    local: ["2027-03-15", "2027-07-26"],
    names: ["Festa del Contribuent", "Festa Major"],
    source: {
      name: "Calendari de dies inhàbils",
      ref: "Seu electrònica de l'Ajuntament del Pont de Vilomara i Rocafort",
      url: "https://www.elpont.cat/ajuntament/calendari-de-dies-inhabils",
    },
    act: { kind: "ple", date: "2026-07-14" },
    readOn: "2026-11-03",
  },
  // "Calendari de festes locals 2026 25 de maig - Segona Pasqua 30 de novembre - Sant Andreu
  // Calendari de festes locals 2027 17 de maig - Segona Pasqua 30 de novembre - Sant Andreu"
  gurb: {
    local: ["2027-05-17", "2027-11-30"],
    names: ["Segona Pasqua", "Sant Andreu"],
    source: { name: "Festes Locals", ref: "Ajuntament de Gurb", url: "https://www.gurb.cat/el-municipi/festes-locals" },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 27 July 2026: "4. Expedient 5833/2026. Aprovació de les festes locals per a l'any 2027
  // Favorable Tipus de votació: Nominal Tipus de majoria: Simple A favor: 13, En contra: 0,
  // Abstencions: 3, Absents: 0 [...] PRIMER.- Proposar al Departament d' Empresa i Treball de la
  // Generalitat de Catalunya per a que siguin fixades com a festes locals d'aquest municipi per al
  // proper any 2027, els dies 6 i 8 de setembre."
  "llinars-del-valles": {
    local: ["2027-09-06", "2027-09-08"],
    source: {
      name: "Acta del Ple ordinari de 27 de juliol de 2026",
      ref: "Ajuntament de Llinars del Vallès",
      url: "https://www.llinarsdelvalles.cat/media/repository/documents/actes/2026/5_23-07-2026/5_Acta_Ple_ordinari_27_de_juliol_de_2026.pdf",
    },
    act: { kind: "ple", date: "2026-07-27" },
    readOn: "2026-11-03",
  },
  // Ple of 13 July 2026: "Ple ordinari del mes de juliol Dimarts, 14 de juliol de 2026 El ple
  // ordinari ha tingut lloc el dilluns 13 de juliol [...] Al Ple es van aprovar les festes locals de
  // 2027 que seran el 17 de maig (en substitució del 19 de setembre que serà festiu) i el 3
  // d'agost." 19 September, the usual day, falls on a Sunday in 2027.
  cervello: {
    local: ["2027-05-17", "2027-08-03"],
    source: {
      name: "Ple ordinari del mes de juliol",
      ref: "Ajuntament de Cervelló, 14 de juliol de 2026",
      url: "https://www.cervello.cat/actualitat/noticies/ple-ordinari-del-mes-de-juliol.html",
    },
    act: { kind: "ple", date: "2026-07-13" },
    readOn: "2026-11-03",
  },
  // Ple of 28 May 2026: "Crònica Llagostera del 28 de maig de 2026 29 Maig 2026 En el Ple ordinari
  // del mes de maig es va aprovar l'assignació del nom Conxita Pijuan Casadevall a un espai públic.
  // Es va aprovar els dies 17 i 18 de maig com a festes locals de l'any 2027."
  llagostera: {
    local: ["2027-05-17", "2027-05-18"],
    source: {
      name: "Crònica Llagostera del 28 de maig de 2026",
      ref: "Ajuntament de Llagostera, 29 de maig de 2026",
      url: "https://www.llagostera.cat/noticies/2869/cronica-llagostera-del-28-de-maig-de-2026",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-03",
  },
  // Ple of 4 June 2026: "04 0404P26 EXP.E:2026_1678: FESTES LOCALS PER A L'ANY 2027. CALENDARI
  // LABORAL DEL PAPIOL. ... ES RESOL Primer.- Determinar que les festes locals oficials del Papiol
  // que es proposen pel proper any 2027 són les següents: Dia 17/05/2027 (Pasqua Granada). Dia
  // 23/07/2027 (Festa Major). ... Quart.- Adoptar les anteriors decisions per unanimitat dels
  // membres que assisteixen a la present sessió."
  "el-papiol": {
    local: ["2027-05-17", "2027-07-23"],
    names: ["Pasqua Granada", "Festa Major"],
    source: {
      name: "Acta del Ple 04 de 2026 de data 4 de juny de 2026",
      ref: "Ajuntament del Papiol",
      url: "https://www.elpapiol.cat/media/repository/ajuntament/organitzacio_ajuntament/consistori/plemunicipal/2026/ACTA04PLE20260604_sig.pdf",
    },
    act: { kind: "ple", date: "2026-06-04" },
    readOn: "2026-11-03",
  },
  // Ple of 30 July 2026: "El Ple de la Corporació, en sessió ordinària celebrada en data 30 de
  // juliol de 2026 [...] PRIMER.- FIXAR com a festes locals, retribuïdes i no recuperables, del
  // Municipi de Sant Climent de Llobregat per a l'any 2027, les que s'assenyalen a continuació: Dia
  // 10 d'agost, dimarts (Festivitat de Sant Llorenç). Dia: 23 de novembre, dimarts (Festivitat de
  // Sant Climent)."
  "sant-climent-de-llobregat": {
    local: ["2027-08-10", "2027-11-23"],
    names: ["Festivitat de Sant Llorenç", "Festivitat de Sant Climent"],
    source: {
      name: "Edicte de fixació de les festes locals a Sant Climent de Llobregat per a l'any 2027",
      ref: "BOPB, 11 d'agost de 2026 (CVE 202610132423)",
      url: "https://bop.diba.cat/anunci/descarrega-pdf/3981617",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-11-03",
  },
  // Ple of 1 June 2026: "El Ple de l'Ajuntament de Cabrera d'Anoia, en sessió celebrada en data 1 de
  // juny de 2026, va acordar fixar les festes locals del municipi per a l'any 2027 [...] Les festes
  // locals de Cabrera d'Anoia per a l'any 2027 seran les següents: Dilluns, 18 de gener de 2027.
  // Dilluns, 9 d'agost de 2027."
  "cabrera-d-anoia": {
    local: ["2027-01-18", "2027-08-09"],
    source: {
      name: "Anunci sobre l'aprovació de les festes locals per a l'any 2027",
      ref: "BOPB, 8 de juny de 2026 (CVE 202610103935)",
      url: "https://bop.diba.cat/anunci/descarrega-pdf/3954590",
    },
    act: { kind: "ple", date: "2026-06-01" },
    readOn: "2026-11-03",
  },
  // Ple of 9 July 2026: "El Ple de l'Ajuntament de Sant Martí de Tous, reunit en sessió ordinària
  // celebrada el 9 de juliol de 2026, va adoptar el següent acord [...] PRIMER.- APROVAR com a
  // festes locals del municipi de Sant Martí de Tous per a l'any 2027, els dies 30 de març i 12 de
  // novembre."
  "sant-marti-de-tous": {
    local: ["2027-03-30", "2027-11-12"],
    source: {
      name: "Edicte d'aprovació de festes locals per a l'any 2027",
      ref: "BOPB, 17 de juliol de 2026 (CVE 202610119974)",
      url: "https://bop.diba.cat/anunci/descarrega-pdf/3968915",
    },
    act: { kind: "ple", date: "2026-07-09" },
    readOn: "2026-11-03",
  },
  // Ple of 12 June 2026: "Que el Ple de l'Ajuntament de Sora, en sessió ordinària celebrada el 12 de
  // juny de 2026, va acordar proposar al Departament d'Empresa i Treball de la Generalitat de
  // Catalunya [...] com a festes locals del municipi de Sora per a l'any 2027, retribuïdes i no
  // recuperables, els dies següents: 17 de maig de 2027, dilluns. 25 de juny de 2027, divendres."
  sora: {
    local: ["2027-05-17", "2027-06-25"],
    source: {
      name: "Edicte. Festes locals de Sora per a l'any 2027",
      ref: "BOPB, 29 d'octubre de 2026 (CVE 202610157926)",
      url: "https://bop.diba.cat/anunci/descarrega-pdf/4005859",
    },
    act: { kind: "ple", date: "2026-06-12" },
    readOn: "2026-11-03",
  },
  // Ple of 1 July 2026: "S'ACORDA: PRIMER.- Proposar com a festes locals del municipi de Sant Vicenç
  // de Castellet, per a l'any 2027, els dies següents: - 22 de gener, divendres (Festa Major
  // d'Hivern) - 12 de juliol, dilluns (Festa Major d'Estiu) SEGON.- Comunicar el contingut d'aquest
  // dictamen al Departament d'Empresa i Treball de la Generalitat de Catalunya als efectes
  // corresponents. ... Passat aquest punt es Aprovat per Unanimitat dels assistents"
  "sant-vicenc-de-castellet": {
    local: ["2027-01-22", "2027-07-12"],
    names: ["Festa Major d’Hivern", "Festa Major d’Estiu"],
    source: {
      name: "Acta anonimitzada de la sessió del Ple de l’Ajuntament del dia 1 de juliol de 2026 (punt 3.2, Expedient X2026003085, Dies festius locals de Sant Vicenç de Castellet per a l’any 2027)",
      ref: "Ajuntament de Sant Vicenç de Castellet",
      url: "https://www.svc.cat/media/uploaded_files/normativa/ACTA_LOPD_PLE06-2026_1_JULIOL.pdf",
    },
    act: { kind: "ple", date: "2026-07-01" },
    readOn: "2026-11-03",
  },
  // Ple of 12 February 2026: "El Ple de l'Ajuntament de Constantí ha celebrat aquest dijous 12 de
  // febrer una nova sessió ordinària. ... Aprovació de les festes locals de l'any 2027 Un altre dels
  // punts aprovats pel Ple van ser les festes de caire local corresponents a l'any 2027: seran els
  // dies 20 de gener (dimecres) i 2 d'agost (dilluns)"
  constanti: {
    local: ["2027-01-20", "2027-08-02"],
    source: {
      name: "El Ple aprova la condició de FuneCamp com a mitjà propi per a realitzar en un futur l’activitat de cementiri",
      ref: "Ajuntament de Constantí, 13 de febrer de 2026",
      url: "https://web.constanti.cat/2026/02/13/el-ple-aprova-la-condicio-de-funecamp-com-a-mitja-propi-per-a-realitzar-en-un-futur-lactivitat-de-cementiri/",
    },
    act: { kind: "ple", date: "2026-02-12" },
    readOn: "2026-11-03",
  },
  // Ple of 30 June 2026: "FESTES LOCALS 2027 El Ple de l'Ajuntament, en sessió ordinària celebrada
  // el 30 de juny de 2026, va aprovar per unanimitat la p roposta d'aprovació de la fixació dels
  // dies de festa local per a l'any 2027, per la seva posterior aprovació per part del Departament
  // d'Empresa i Treball de la Generalitat de Catalunya. Segons la seva resolució, els dies festius
  // locals de Santa Cristina d'Aro proposats per a l'any 2026 són: – Dilluns 8 de febrer (Carnaval)
  // – Dissabte 24 de juliol (Dia de Santa Cristina – Festa Major)" The list's "any 2026" is a
  // leftover: the page is headed 2027 and its weekdays match 2027 (8 February was a Sunday in 2026).
  "santa-cristina-d-aro": {
    local: ["2027-02-08", "2027-07-24"],
    names: ["Carnaval", "Dia de Santa Cristina – Festa Major"],
    source: { name: "FESTES LOCALS 2027", ref: "Ajuntament de Santa Cristina d'Aro", url: "https://santacristina.cat/festes-locals-2027/" },
    act: { kind: "ple", date: "2026-06-30" },
    readOn: "2026-11-03",
  },
  // Ple of 27 April 2026: "Aprovació de les festes locals de Sant Pere de Torelló per a l'any 2027
  // En data 27 d'abril de 2026, el Ple de la Corporació reunit en sessió ordinària va aprovar per
  // unanimitat l'acord següent: 'Primer.- Proposar com a Festes Locals del municipi de Sant Pere de
  // Torelló per a l'any 2027 el dimarts 29 de juny (Sant Pere) i el dilluns 27de setembre (dilluns
  // de Festa Major)."
  "sant-pere-de-torello": {
    local: ["2027-06-29", "2027-09-27"],
    names: ["Sant Pere", "dilluns de Festa Major"],
    source: {
      name: "Aprovació de les festes locals per a l'any 2027 (anunci, Exp. X2026000559)",
      ref: "BOPB, 4 de maig de 2026",
      url: "https://bop.diba.cat/anuncio/descargar-pdf/3935276",
    },
    act: { kind: "ple", date: "2026-04-27" },
    readOn: "2026-11-03",
  },
  // Ple of 25 June 2026: "En compliment de l'acord adoptat a la sessió plenària ordinària de data 25
  // de juny de 2026 [...] Primer.- FIXAR com a festes locals del municipi de Pallejà per a l'any
  // 2027 els dies següents: Divendres, 12 de febrer de 2027 (Festa Major de Santa Eulàlia). Dilluns,
  // 12 de juliol de 2027 (Festa Major d'Estiu)."
  palleja: {
    local: ["2027-02-12", "2027-07-12"],
    names: ["Festa Major de Santa Eulàlia", "Festa Major d'Estiu"],
    source: {
      name: "Edicte. Acord de fixació de les festes locals del municipi per a l'any 2027",
      ref: "BOPB, 27 de juliol de 2026 (CVE 202610124254)",
      url: "https://bop.diba.cat/anunci/descarrega-pdf/3973273",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-03",
  },
  // Ple of 13 July 2026: "2.2.- PROPOSTA D'ACORD D'APROVACIÓ DELS DIES FESTIUS LOCALS DE VILANOVA
  // DEL CAMÍ CORRESPONENTS A L'ANY 2027. [...] Primer.- PROPOSAR al Departament d'Empresa i Treball
  // que es fixin com a festes locals de Vilanova del Camí per a l'any 2027; - Dimarts 30 de març de
  // 2027, Sant Crist d'Igualada - Dilluns 6 de setembre de 2027, Festa Major de Vilanova del Camí
  // Segon.- COMUNICAR aquest acord al Departament d'Empresa i Treball, de la Generalitat de
  // Catalunya i al departament de Secretaria. Sotmès l'assumpte a votació, l'acord s'aprova amb 15
  // vots favorables dels grups municipals (PSC, IMPULSEM VILANOVA, V365 i FEM VILANOVA)."
  "vilanova-del-cami": {
    local: ["2027-03-30", "2027-09-06"],
    names: ["Sant Crist d’Igualada", "Festa Major de Vilanova del Camí"],
    source: {
      name: "Acta Ple Ordinari 13 de juliol de 2026",
      ref: "Ajuntament de Vilanova del Camí",
      url: "https://www.vilanovadelcami.cat/media/repository/import/imatges/plens/plens_2026/Actes/ACTA_PLE_ORDINARI_No._5_DEL_13-07-2026.pdf",
    },
    act: { kind: "ple", date: "2026-07-13" },
    readOn: "2026-11-03",
  },
  // Ple of 28 April 2026: "Publicat el 28/04/2026 Aquest dimarts 28 d'abril s'ha celebrat a la sala
  // de sessions de l'Ajuntament de Roquetes el Ple ordinari número 5/2026, corresponent al mes
  // d'abril. [...] Aprovar, si s'escau, l'assenyalament de les dues festes locals de Roquetes per a
  // l'any 2027, el 14 d'abril i 5 de juliol. APROVAT PER UNANIMITAT"
  roquetes: {
    local: ["2027-04-14", "2027-07-05"],
    source: {
      name: "Ple ordinari de l’Ajuntament de Roquetes del mes d’abril de 2026",
      ref: "Ajuntament de Roquetes, 28 d'abril de 2026",
      url: "https://roquetes.cat/web/ple-ordinari-de-lajuntament-de-roquetes-del-mes-dabril-de-2026/",
    },
    act: { kind: "ple", date: "2026-04-28" },
    readOn: "2026-11-03",
  },
  // Ple of 20 July 2026: "La sessió ordinària d'aquest mes de juliol del Ple Municipal de
  // l'Ajuntament de Begues ha servit per aprovar la designació dels dos festius locals de l'any
  // 2027, que seran el dimecres 20 de gener i el dilluns 26 de juliol. El punt va ser aprovat per
  // unanimitat."
  begues: {
    local: ["2027-01-20", "2027-07-26"],
    source: {
      name: "Acords de la sessió de juliol del Ple Municipal",
      ref: "Ajuntament de Begues, 21 de juliol de 2026",
      url: "https://www.begues.cat/actualitat/noticies/acords-de-la-sessio-de-juliol-del-ple-municipal.html",
    },
    act: { kind: "ple", date: "2026-07-20" },
    readOn: "2026-11-03",
  },
  // Ple of 25 June 2026: "Setè.- PRP2026/795 PROPOSTA AL PLE D'APROVACIÓ, SI ESCAU, FESTES LOCALS DE
  // L'ANY 2027. ... Primer.- Aprovar com a festes locals per a l'any 2027 les dates següents:
  // Divendres 22 de gener de 2027, dia de Sant Vicenç Dilluns 17 de maig de 2027, 2a. Pasqua. ...
  // Per tant, el Ple acorda, per unanimitat, aprovar la proposta transcrita en tots els seus
  // extrems."
  "sant-vicenc-de-montalt": {
    local: ["2027-01-22", "2027-05-17"],
    names: ["Sant Vicenç", "2a. Pasqua"],
    source: {
      name: "Acta Ple ordinari 25 de juny de 2026",
      ref: "Ajuntament de Sant Vicenç de Montalt",
      url: "https://www.svmontalt.cat/ARXIUS/2026/PLE/DOCUMENTS/PLE2026_6.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-03",
  },
  // "ANY 2027 Festius locals Dimecres 20 de gener (Sant Sebastià). Dilluns 12 de juliol (Dilluns de
  // Festa Major)."
  suria: {
    local: ["2027-01-20", "2027-07-12"],
    names: ["Sant Sebastià", "Dilluns de Festa Major"],
    source: { name: "Calendari de festius", ref: "Ajuntament de Súria", url: "https://www.suria.cat/calendaridefestius" },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 2 July 2026: "1. Aprovar que les dues festes locals que corresponen a la població de Sant
  // Joan de Vilatorrada per l'any 2027 siguin les següents: - Dilluns 22 de febrer de 2027: Festa de
  // la Llum. Divendres 25 de juny de 2027: Festa Major de Sant Joan de Vilatorrada 2. Aprovar que
  // les dues festes locals que corresponen a l'Entitat Municipal Descentralitzada de Sant Martí de
  // Torroella, per l'any 2027, siguin les següents: - Divendres 25 de juny de 2027: Festa Major de
  // Sant Joan de Vilatorrada. - Dijous 11 de novembre de 2027: Festa de Sant Martí de Torroella. ...
  // Resultat: Aprovat per majoria absoluta del nombre legal de membres de la corporació"
  "sant-joan-de-vilatorrada": {
    local: ["2027-02-22", "2027-06-25"],
    names: ["Festa de la Llum", "Festa Major de Sant Joan de Vilatorrada"],
    nuclei: [
      { name: "Sant Martí de Torroella", dates: ["2027-06-25", "2027-11-11"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de la Corporació, 2 de juliol de 2026 (punt 8, Aprovació del calendari de festius locals per l'any 2027)",
      ref: "Ajuntament de Sant Joan de Vilatorrada",
      url: "https://www.santjoanvilatorrada.cat/ca/recursos/acords-i-decrets/acta-ple-2-juliol.pdf",
    },
    act: { kind: "ple", date: "2026-07-02" },
    readOn: "2026-11-03",
  },
  // Ple of 25 May 2026: "El ple ordinari del mes de maig, celebrat ahir, va aprovar [...] També es
  // van aprovar les festes locals per a l'any vinent, que continuaran sent el 16 de juliol i el 2 de
  // setembre." "L'any vinent" in news of 26 May 2026 is 2027; both are weekdays in 2027.
  "l-escala": {
    local: ["2027-07-16", "2027-09-02"],
    source: {
      name: "Comença el tràmit per aconseguir l'adscripció de la Casa del Mar",
      ref: "Ajuntament de l'Escala, 26 de maig de 2026",
      url: "https://www.lescala.cat/ca/actualitat-noticies/x/_id:3249/",
    },
    act: { kind: "ple", date: "2026-05-25" },
    readOn: "2026-11-03",
  },
  // Ple of 28 July 2026: "El Ple ordinari de l'Ajuntament de Caldes de Malavella celebrat aquest
  // dimarts, 28 de juliol, ... Entre els punts destacats, el Ple ha aprovat per unanimitat
  // l'establiment de les festes locals per a l'any 2027. Les dates acordades són el 2 d'agost ,
  // coincidint amb el dilluns de Festa Major, i el 22 de setembre , festivitat de Sant Maurici ,
  // patró del municipi."
  "caldes-de-malavella": {
    local: ["2027-08-02", "2027-09-22"],
    names: ["Festa Major", "Sant Maurici"],
    source: {
      name: "Caldes defensa per unanimitat un model de transició energètica respectuós amb el territori",
      ref: "Ajuntament de Caldes de Malavella, 28 de juliol de 2026",
      url: "https://www.caldesdemalavella.cat/index.php/ca/historico-noticias/5029-ple-3",
    },
    act: { kind: "ple", date: "2026-07-28" },
    readOn: "2026-11-03",
  },
  // Ple of 25 June 2026: "2. EXPEDIENT 2603/2026. DICTAMEN PER A L'APROVACIÓ DEL CALENDARI DE FESTES
  // LOCALS PER A L'ANY 2027 [...] Primer.- Proposar com a festes locals d'aquest municipi per a
  // l'any 2027 els següents dies: 17 de maig (dilluns) – Segona pasqua 17 de setembre (divendres) –
  // Festa major Segon.- Comunicar la següent proposta al Departament d'Empresa i Treball de la
  // Generalitat per tal de què acordi la seva fixació.' La proposta s'aprova per unanimitat"
  "sant-feliu-de-codines": {
    local: ["2027-05-17", "2027-09-17"],
    names: ["Segona pasqua", "Festa major"],
    source: {
      name: "Acta de la sessió ordinària del ple de 25 de juny de 2026 (Acta del Ple núm. 2026-0009)",
      ref: "Ajuntament de Sant Feliu de Codines, actes de Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/821070005/2026/9cef2717-e662-4e52-8ead-d2b1023941ff/Acta%20de%20la%20sessi%f3%20ordin%e0ria%20del%20ple%20de%2025%20de%20juny%20de%202026.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-03",
  },
  // "Agenda anual Festius locals del 2026 : 13 de juliol i 25 de setembre de 2026. Festius locals
  // del 2027 : 12 de juliol i 24 de setembre de 2027. Calendari acadèmic Sils 2026-2027 ."
  sils: {
    local: ["2027-07-12", "2027-09-24"],
    source: { name: "Agenda anual", ref: "Ajuntament de Sils", url: "https://sils.cat/parentpage/agenda-anual/" },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // "La relació de dies festius a Catalunya i les festes locals de l'Ametlla del Vallès per al 2027
  // són els següents (festes locals*) [...] 8 de febrer (Carnaval)* [...] 25 d'agost (Festa Major)*"
  // Carnival Monday moves to 8 February in 2027 (16 February in 2026), so the list was redone for
  // 2027, although its Catalonia-wide lines still carry two 2026 days.
  "l-ametlla-del-valles": {
    local: ["2027-02-08", "2027-08-25"],
    names: ["Carnaval", "Festa Major"],
    source: {
      name: "Calendari de dies festius",
      ref: "Ajuntament de l'Ametlla del Vallès",
      url: "https://www.ametlla.cat/ajuntament/informacio-oficial/calendaris/calendari-de-dies-festius",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-03",
  },
  // Ple of 8 July 2026: "Proposta al Departament d'Empresa i Treball de la Generalitat de Catalunya
  // de les dues festes locals per l'any 2027 Aquest punt proposa les dues festes locals del municipi
  // per traslladar a la Generalitat per al calendari de 2027. El regidor de Cultura i Festes, Diego
  // Miranda , ha exposat la proposta, que inclou el dijous d'Enramades, 27 de maig de 2027, i el
  // dilluns de Festa Major, 13 de setembre de 2027. En el cas de Cabrianes, seria el mateix dilluns
  // de Festa Major de Sallent i el dilluns de Festes d'Estiu de Cabrianes, el 20 de setembre.
  // Aprovat per unanimitat." (The page's intro repeats an older session's date; the title and the
  // item are the Ple of 8 July 2026.)
  sallent: {
    local: ["2027-05-27", "2027-09-13"],
    names: ["Dijous d'Enramades", "Dilluns de Festa Major"],
    nuclei: [
      { name: "Cabrianes", dates: ["2027-09-13", "2027-09-20"] },
    ],
    source: {
      name: "Resum del Ple ordinari del 8 de juliol de 2026 a l'Ajuntament de Sallent",
      ref: "Ajuntament de Sallent, 8 de juliol de 2026",
      url: "https://www.sallent.cat/tinformem/noticies/resum-del-ple-ordinari-del-8-de-juliol-de-2026-a-lajuntament-de-sallent",
    },
    act: { kind: "ple", date: "2026-07-08" },
    readOn: "2026-11-03",
  },
  // "CALENDARI OFICIAL DE FESTES LABORALS 2027 Calendari oficial dels festius laborals de l'any
  // 2027. CALENDARI LABORAL 2027 Aplec de la Salut: 10 de maig Festa Major: 6 de setembre Són festes
  // laborals a Catalunya durant l'any 2027: ..." Both are Mondays in 2027.
  sabadell: {
    local: ["2027-05-10", "2027-09-06"],
    names: ["Aplec de la Salut", "Festa Major"],
    source: {
      name: "Calendari oficial de festes laborals 2027",
      ref: "Ajuntament de Sabadell (agenda municipal)",
      url: "https://web.sabadell.cat/blog-agenda/114796-agenda-1178671",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // The council's 2026-27 calendar page: "Festius i Vacances [...] Festes locals 2 de febrer del
  // 2027 i 25 de juny del 2027."
  valls: {
    local: ["2027-02-02", "2027-06-25"],
    source: {
      name: "Calendari escolar 2026-27",
      ref: "Ajuntament de Valls",
      url: "https://www.valls.cat/calendari-escolar-valls",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // Ple of 29 June 2026: "Primer.- Proposar al Departament d'Empresa i Treball de la Generalitat que
  // fixi com a Festes Locals del Municipi de Castell d'Aro, Platja d'Aro i S'Agaró per al 2027, el 4
  // DE FEBRER (dijous gras), i el 8 DE SETEMBRE (dimecres, Festa Major de Castell d'Aro). [...]
  // Votació: S'aprova per unanimitat dels 17 membres assistents"
  "castell-d-aro-platja-d-aro-i-s-agaro": {
    local: ["2027-02-04", "2027-09-08"],
    names: ["dijous gras", "Festa Major de Castell d'Aro"],
    source: {
      name: "Acta de la sessió del Ple de 29 de juny de 2026 (punt 3.2, Festius locals any 2027)",
      ref: "Ajuntament de Castell d'Aro, Platja d'Aro i S'Agaró",
      url: "https://ciutada.platjadaro.com/wp-content/uploads/2026/09/PLE2026000006.pdf",
    },
    act: { kind: "ple", date: "2026-06-29" },
    readOn: "2026-11-04",
  },
  // "Calendari oficial de festius 2027 1 de gener, divendres 6 de gener, dimecres 25 de març (Festa
  // local - Dijous Sant), dijous 26 de març, divendres 29 de març, dilluns 1 de maig, dissabte 17 de
  // maig (Festa local - Pasqua Granada), dilluns ..."
  manlleu: {
    local: ["2027-03-25", "2027-05-17"],
    names: ["Dijous Sant", "Pasqua Granada"],
    source: {
      name: "Festius: calendari oficial de festius 2027",
      ref: "Ajuntament de Manlleu, Oficina de Promoció Econòmica",
      url: "https://www.manlleu.cat/ope/ca/festius",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // Ple of 1 July 2026, item 602: "es proposa fixar com a festa local el dia 29 de gener de 2027, en
  // substitució del divendres 5 de febrer de 2027 i, i el dissabte, dia 30 d'octubre de 2027, amb
  // motiu de la Segregació de Salou. [...] el Ple de l'Ajuntament ACORDA, per unanimitat, el
  // següent: 1. Aprovar la proposta de la Regidoria de Festes i fixar com a festes locals per a
  // l'any 2027 els dies següents: a) Divendres, 29 de gener de 2027. b) Dissabte, 30 d'octubre de
  // 2027." (29 January replaces the Friday before the Cós Blanc, which falls on Carnival in 2027.)
  salou: {
    local: ["2027-01-29", "2027-10-30"],
    names: [null, "Segregació de Salou"],
    source: {
      name: "Acta de la sessió ordinària del Ple de 1 de juliol de 2026 (punt 602, expedient 9470/2026)",
      ref: "Ajuntament de Salou",
      url: "https://actes.salou.cat/session/downloadItem/8a818085a151c79901a1539d25b50000",
    },
    act: { kind: "ple", date: "2026-07-01" },
    readOn: "2026-11-04",
  },
  // Ple of 15 June 2026, item 10: "El Ple acorda per 16 vots a favor (ERC-AM, JxS-CM, PSC-CP i IPS-
  // CUP) i 4 abstencions (VOX), PROPOSAR al Departament d'Empresa i Treball de la Generalitat de
  // Catalunya que per a l'any 2027 siguin incorporades al calendari laboral com a festes de caràcter
  // local el dia 26 de juliol, Festa Major de Salt, i el dia 29 d'octubre, Fires de Girona"
  salt: {
    local: ["2027-07-26", "2027-10-29"],
    names: ["Festa Major de Salt", "Fires de Girona"],
    source: {
      name: "Acta del Ple ordinari de 15 de juny de 2026 (punt 10è, Proposar els festius locals per a l'any 2027)",
      ref: "Ajuntament de Salt, seu electrònica",
      url: "https://seu-e.cat/documents/28465/21172742/06.-+ACTA+PO+15.06.2026/fe9e8b77-a3f8-4b9a-97f5-b95e55c9af21",
    },
    act: { kind: "ple", date: "2026-06-15" },
    readOn: "2026-11-04",
  },
  // Ple of 15 June 2026: "APROVAR, SI ESCAU, LA DESIGNACIÓ DE LES FESTES LOCALS DE L'EXERCICI 2027
  // [...] Primer.- Proposar els dies 17 de maig i 1 d'octubre de 2027 com a festes locals del
  // municipi de Seva. [...] Es passa a votació i s'aprova per unanimitat."
  seva: {
    local: ["2027-05-17", "2027-10-01"],
    source: {
      name: "Acta del Ple ordinari de 15 de juny de 2026 (punt 2, designació de les festes locals de l'exercici 2027)",
      ref: "Ajuntament de Seva",
      url: "https://www.seva.cat/media/repository/documents_oficials/actes_del_ple/20260615_Ordinari.pdf",
    },
    act: { kind: "ple", date: "2026-06-15" },
    readOn: "2026-11-04",
  },
  // Ple of 8 July 2026: "En la primera part de la sessió es va aprovar el calendari de festes locals
  // per a l'any 2027, que se celebraran els dies 23 i 26 de juliol, coincidint amb la Festa Major."
  "els-hostalets-de-pierola": {
    local: ["2027-07-23", "2027-07-26"],
    source: {
      name: "Resum Ple 8 de juliol 2026",
      ref: "Ajuntament dels Hostalets de Pierola",
      url: "https://elshostaletsdepierola.cat/wp-content/uploads/2026/07/Ple-8-juliol-2026.pdf",
    },
    act: { kind: "ple", date: "2026-07-08" },
    readOn: "2026-11-04",
  },
  // Ple of 26 May 2026: "El Ple determina les dues festes locals del 2027 [...] Seran el 21 de gener
  // i el 9 de febrer. En una sessió ordinària celebrada ahir, 26 de maig, el Ple municipal de
  // Castellterçol va aprovar per unanimitat el calendari de festes locals pel 2027. Com és habitual,
  // les dues dates marcades estan lligades al dia de Sant Fruitós, el 21 de gener, i a la Festa de
  // l'Escudella, el 9 de febrer."
  castelltercol: {
    local: ["2027-01-21", "2027-02-09"],
    names: ["Sant Fruitós", "Festa de l'Escudella"],
    source: {
      name: "El Ple determina les dues festes locals del 2027",
      ref: "Ajuntament de Castellterçol, 27 de maig de 2026",
      url: "https://www.castelltersol.cat/actualitat/noticies/el-ple-determina-les-dues-festes-locals-del-2027.html",
    },
    act: { kind: "ple", date: "2026-05-26" },
    readOn: "2026-11-04",
  },
  // The council's notice of 9 September 2026: "Festes locals del municipi 2027: 30 de març i 25 de
  // juny".
  "la-torre-de-claramunt": {
    local: ["2027-03-30", "2027-06-25"],
    source: {
      name: "Festes locals del municipi 2027: 30 de març i 25 de juny",
      ref: "Ajuntament de la Torre de Claramunt (avisos), 9 de setembre de 2026",
      url: "https://www.latorredeclaramunt.cat/actualitat/avisos/festes-locals-del-municipi-2027-30-de-marc-i-25-de-juny-.html",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // Ple of 20 April 2026: "Primer.- Proposar al Departament d'Empresa i Treball de la Generalitat de
  // Catalunya, 17 de maig (dilluns de la Segona Pasqua) i 26 de juliol (dilluns de la Festa Major),
  // com a festes locals per a l'any 2027 al municipi de Sant Julià de Vilatorta amb caràcter
  // retribuït i no recuperable. [...] Resultat: Aprovat per unanimitat"
  "sant-julia-de-vilatorta": {
    local: ["2027-05-17", "2027-07-26"],
    names: ["dilluns de la Segona Pasqua", "dilluns de la Festa Major"],
    source: {
      name: "Acord de Ple de festes locals 2027 (certificat, Ple ordinari de 20 d'abril de 2026)",
      ref: "Ajuntament de Sant Julià de Vilatorta, 24 d'abril de 2026",
      url: "https://www.vilatorta.cat/media/repository/ajuntament/2027/Acord_de_ple_festes_locals_2027.pdf",
    },
    act: { kind: "ple", date: "2026-04-20" },
    readOn: "2026-11-04",
  },
  // "El Ple de l'Ajuntament de Gaià, en sessió extraordinària de 15 de juny de 2026, va aprovar la
  // proposta de festes locals per a l'any 2027. Gaià: 3 de setembre i 6 de setembre de 2027 – Festa
  // Major Galera: 2 i 5 de juliol de 2027 – Festa Major"
  gaia: {
    local: ["2027-09-03", "2027-09-06"],
    nuclei: [
      { name: "Galera", dates: ["2027-07-02", "2027-07-05"] },
    ],
    source: {
      name: "Anunci de festes locals 2027 (expedient 2026_206)",
      ref: "Ajuntament de Gaià, 23 de juny de 2026",
      url: "https://www.gaia.cat/media/repository/festes_locals_2027.pdf",
    },
    act: { kind: "ple", date: "2026-06-15" },
    readOn: "2026-11-04",
  },
  // "Festes Locals [...] Any 2026: 25 de maig i 10 de desembre Any 2027: 17 de maig i 10 de
  // desembre" (notice updated 15 September 2026).
  lluca: {
    local: ["2027-05-17", "2027-12-10"],
    source: {
      name: "Festes locals",
      ref: "Ajuntament de Lluçà (avisos), actualitzat el 15 de setembre de 2026",
      url: "https://www.lluca.cat/actualitat/avisos/festes-locals.html",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // "Calendari de festes Locals 2027 Dimarts, 9 de febrer de 2027 - Carnestoltes Dilluns, 27 de
  // setembre de 2027 - Festa Major"
  alpens: {
    local: ["2027-02-09", "2027-09-27"],
    names: ["Carnestoltes", "Festa Major"],
    source: {
      name: "Festes locals",
      ref: "Ajuntament d'Alpens",
      url: "https://www.alpens.cat/el-municipi/festes-locals",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // Two agenda pages of the council, each citing the Ple of 28 July 2026: "El Ple de l'Ajuntament de
  // Sant Agustí de Lluçanès, en sessió ordinària de 28 de juliol de 2026, va aprovar la proposta de
  // festes locals per a l'any 2027 i va establir aquest dia com a festa local. Dimecres, 25 d'agost
  // de 2027: Sant Genís – Festa Major de l'Alou." and, on .../festa-local-2027-fira-de-lhostal-del-
  // vilar.html, the same sentence with "Dimarts, 28 de setembre de 2027: Sant Agustí – Fira de
  // l'Hostal del Vilar".
  "sant-agusti-de-llucanes": {
    local: ["2027-08-25", "2027-09-28"],
    names: ["Sant Genís – Festa Major de l'Alou", "Sant Agustí – Fira de l'Hostal del Vilar"],
    source: {
      name: "Festa Local 2027 (Sant Genís), agenda municipal",
      ref: "Ajuntament de Sant Agustí de Lluçanès, 12 d'agost de 2026",
      url: "https://www.santagustidellucanes.cat/actualitat/agenda/festa-local-2027-sant-genis.html",
    },
    act: { kind: "ple", date: "2026-07-28" },
    readOn: "2026-11-04",
  },
  // The council's notice (an image on the news page): "FESTES LOCALS ANY 2027. ES COMUNICA QUE EL
  // PLE DE L'AJUNTAMENT DE LINYOLA DE DATA 29 DE JULIOL DE 2026 VA ACORDAR LES SEGÜENTS DATES COM A
  // FESTES LOCALS DEL MUNICIPI DE LINYOLA DE L'ANY 2027: - 31 de maig - 16 d'agost"
  linyola: {
    local: ["2027-05-31", "2027-08-16"],
    source: {
      name: "Festes locals any 2027",
      ref: "Ajuntament de Linyola, 19 d'octubre de 2026",
      url: "https://www.ajuntamentdelinyola.cat/actualitat/festes-locals-any-2027/",
    },
    act: { kind: "ple", date: "2026-07-29" },
    readOn: "2026-11-04",
  },
  // "Any 2027 En relació amb l'assumpte de referència, ens plau comunicar-los que aquest Ajuntament,
  // mitjançant acord plenari adoptat en la sessió ordinària de data 25 de juny de 2026, va acordar
  // proposar les festes locals per l'any 2027 següents: Dilluns 11 d'octubre de 2027 Dimarts 7 de
  // desembre de 2027"
  peralada: {
    local: ["2027-10-11", "2027-12-07"],
    source: {
      name: "Festes locals",
      ref: "Ajuntament de Peralada",
      url: "https://peralada.org/el-municipi/cultura/festes-locals/",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // "Festius locals 2027 22 de gener del 2.027 23 d'agost del 2.027"
  "montferrer-i-castellbo": {
    local: ["2027-01-22", "2027-08-23"],
    source: {
      name: "Festius locals 2027",
      ref: "Ajuntament de Montferrer i Castellbò",
      url: "https://www.montferrercastellbo.cat/ajuntament/festius-locals-2027",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // "Festes locals Any 2027: 7 de juny (dilluns) i 7 de desembre (dimarts) Any 2026: 8 de juny
  // (dilluns) i 7 de desembre (dilluns)"
  "mont-ras": {
    local: ["2027-06-07", "2027-12-07"],
    source: {
      name: "Festes locals",
      ref: "Ajuntament de Mont-ras (guia del poble)",
      url: "https://mont-ras.cat/guia-del-poble/festes-locals/",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // "Festes locals del nostre municipi. Any 2027 Dijous 25 de març Divendres 25 de juny Any 2026
  // Dijous 2 d'abril Dilluns 7 de desembre" (25 March 2027 is Holy Thursday).
  "la-tallada-d-emporda": {
    local: ["2027-03-25", "2027-06-25"],
    source: {
      name: "Festes locals",
      ref: "Ajuntament de la Tallada d'Empordà",
      url: "https://latallada.cat/lajuntament-2/festes-locals/",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // Ple of 17 July 2026, item 8: "PRIMER.- PROPOSAR com a dies de festa local a Riells i Viabrea per
  // a l'exercici 2027, el dilluns, dia 9 d'agost (Festa Major) i el dilluns, dia 15 de novembre
  // (Festivitat de St. Martí, Patró del Municipi)." Approved by 8 votes to 3.
  "riells-i-viabrea": {
    local: ["2027-08-09", "2027-11-15"],
    names: ["Festa Major", "Festivitat de St. Martí, Patró del Municipi"],
    source: {
      name: "Acta de la sessió del Ple de 17 de juliol de 2026 (punt 8.0, festes locals de l'exercici 2027)",
      ref: "Ajuntament de Riells i Viabrea, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1714630008/2026/e330a454-f7ca-4bc1-95e1-a3e8a7a661d3/ACTA%20PLE%2017072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-17" },
    readOn: "2026-11-04",
  },
  // Ple of 30 June 2026, item 9: "ACORDS PRIMER.- Proposar que les dues festes locals d'aquest
  // municipi per a l'any 2027 siguin les següents: • Dilluns, 17 de maig de 2027, coincidint amb la
  // Segona Pasqua • Divendres, 8 d'octubre de 2027, coincidint amb les Festes de la Tardor [...] La
  // proposta d'acords s'aprova per unanimitat"
  "sant-feliu-de-llobregat": {
    local: ["2027-05-17", "2027-10-08"],
    names: ["Segona Pasqua", "Festes de la Tardor"],
    source: {
      name: "Extracte de l'acta del Ple ordinari de 30 de juny de 2026 (punt 9, Designar festes locals per a l'exercici 2027)",
      ref: "Ajuntament de Sant Feliu de Llobregat, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/821140003/2026/41fc62d1-5403-4f03-a65b-dd3a9afc1de2/07.%20Extracte%20PLE%20Juny%202026.pdf",
    },
    act: { kind: "ple", date: "2026-06-30" },
    readOn: "2026-11-04",
  },
  // Ple of 7 May 2026, item 6: "Primer. Proposar al Departament d'Empresa i Treball de la
  // Generalitat de Catalunya com a festes locals del municipi de Montornès del Vallès per a l'any
  // 2027 les següents: Divendres 17 de setembre (Festa Major d'estiu) Dilluns 29 de novembre (Festa
  // Major d'hivern, Sant Sadurní)" Approved with 8 votes in favour and 9 abstentions.
  "montornes-del-valles": {
    local: ["2027-09-17", "2027-11-29"],
    names: ["Festa Major d'estiu", "Festa Major d'hivern, Sant Sadurní"],
    source: {
      name: "Acta del Ple ordinari de 7 de maig de 2026 (punt 6, Aprovar els dies festius locals 2027)",
      ref: "Ajuntament de Montornès del Vallès, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/813630008/2026/6c72cc5c-b205-4aaa-8f49-a1a4901be115/PLE%2007052026.pdf",
    },
    act: { kind: "ple", date: "2026-05-07" },
    readOn: "2026-11-04",
  },
  // Ple of 3 June 2026: "Primer.- APROVAR les FESTES LOCALS per a l'any 2027 d'aquest Ajuntament,
  // als efectes del calendari oficial de festes laborals que aprova el Departament d'Empresa i
  // Treball de la Generalitat de Catalunya: Població Data que es proposa Castellar de n'Hug 23
  // d'abril de 2027 – Sant Jordi 29 de setembre de 2027 – Sant Miquel"
  "castellar-de-n-hug": {
    local: ["2027-04-23", "2027-09-29"],
    names: ["Sant Jordi", "Sant Miquel"],
    source: {
      name: "Certificat de l'acord del Ple de 3 de juny de 2026, proposta de festes locals per a l'any 2027 (expedient 84/2026)",
      ref: "Ajuntament de Castellar de n'Hug",
      url: "https://www.ajcastellardenhug.cat/media/repository/noticies/doc/Certificat_d_acord_festius_2027.pdf",
    },
    act: { kind: "ple", date: "2026-06-03" },
    readOn: "2026-11-04",
  },
  // Que el Ple de l'Ajuntament de Pacs del Penedès, en sessió ordinària celebrada el dia 3 de juny
  // de 2026, [...] VUITÈ.- FESTES LOCALS 2027. [...] PRIMER.- Proposar com a festes locals del
  // municipi de PACS DEL PENEDÈS per a l'any 2027 retribuïdes i no recuperables els dies
  // 02/08/2027-Festa Major de Pacs i 30/08/2027-Festa Major de Vilafranca.
  "pacs-del-penedes": {
    local: ["2027-08-02", "2027-08-30"],
    names: ["Festa Major de Pacs", "Festa Major de Vilafranca"],
    source: {
      name: "Certificat Ple 03.06.2026 — VUITÈ.- FESTES LOCALS 2027 (linked from 'Festius Locals — Any 2027')",
      ref: "Ajuntament de Pacs del Penedès, certificat signat 4 de juny de 2026 (emès 5 de juny de 2026)",
      url: "https://www.pacsdelpenedes.cat/media/repository/municipi/Festius_Locals/Certificat_Ple_03.06.2026_Festius_Locals_2027.pdf",
    },
    act: { kind: "ple", date: "2026-06-03" },
    readOn: "2026-11-04",
  },
  // 8.-Expedient 4688/2026. Aprovació de les festes locals per a l'any 2027 al municipi.- Favorable
  // Tipus de votació: Unanimitat/Assentiment [...] Resolució: Primer.- Fixar com a festes locals per
  // l'any 2027 en aquest municipi els dies 28 d'abril i 8 de setembre. Segon.- Notificar aquest
  // acord a la Generalitat de Catalunya – Departament d'Empresa i Treball.
  piera: {
    local: ["2027-04-28", "2027-09-08"],
    source: {
      name: "Acta del Ple extraordinari de 30 de juny de 2026 (punt 8: Expedient 4688/2026. Aprovació de les festes locals per a l'any 2027 al municipi)",
      ref: "Ajuntament de Piera, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/816140003/2026/60388c28-3525-4267-99bb-964f7481574c/2026-06-30_extr..pdf",
    },
    act: { kind: "ple", date: "2026-06-30" },
    readOn: "2026-11-04",
  },
  // 5.- PROPOSTA D'APROVACIÓ DE LES FESTES LOCALS PER A L'ANY 2027. [...] Primer.- Aprovar com a
  // festius locals d'Arenys de Munt per a l'any 2027 els dies 11 de novembre (dijous) i 12 de
  // novembre (divendres). Segon.- Comunicar l'acord adoptat al Departament d'Empresa i Treball de la
  // Generalitat de Catalunya. [...] Posada a votació la proposta, s'aprova la mateixa per unanimitat
  // dels 12 regidors presents al Ple.
  "arenys-de-munt": {
    local: ["2027-11-11", "2027-11-12"],
    source: {
      name: "Acta del Ple ordinari de 16 de juny de 2026 (punt 5: Proposta d'aprovació de les festes locals per a l'any 2027, exp. 1099/26)",
      ref: "Ajuntament d'Arenys de Munt, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/800760009/2026/00ddcae6-f47d-47ba-b027-a97273428f48/06%20Ple%2016-06-2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-16" },
    readOn: "2026-11-04",
  },
  // ACORD NÚM. 5.- APROVAR LA DETERMINACIÓ COM A FESTES DE CARÀCTER LOCAL EN EL MUNICIPI DE
  // VILADECANS, PER A L'ANY 2027, ELS DIES 17 DE MAIG I 8 DE SETEMBRE.- [...] 7. Per al proper any
  // 2027 es proposen com a festius locals el dimecres, 8 de setembre, festa major de Viladecans, i
  // el dilluns, 17 de maig, dilluns de Pasqua Granada [...] PRIMER.- APROVAR la determinació dels
  // dies 17 de maig i 8 de setembre com a festius de caràcter local en el municipi de Viladecans,
  // per a l'any 2027. [...] Resultat de la votació: Aprovat per unanimitat.
  viladecans: {
    local: ["2027-05-17", "2027-09-08"],
    names: ["Dilluns de Pasqua Granada", "Festa Major de Viladecans"],
    source: {
      name: "Acta núm. 6/2026, Ple Municipal, sessió ordinària 25/06/2026 - Acord núm. 5: Aprovar la determinació com a festes de caràcter local en el municipi de Viladecans, per a l'any 2027, els dies 17 de maig i 8 de setembre",
      ref: "Ajuntament de Viladecans, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/830150006/2026/d59eb1d1-400d-406c-bfd1-c0b5ee02461f/PL%20250626%20(amb%20Annex).pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // 5. FESTES LOCALS 2027 En sessió Ordinària de Ple, celebrada el dia 21 de juliol de 2026, s’ha
  // pres l'acord següent: [...] Primer.- Aprovar com a festes locals del municipi de Capolat per a
  // l’exercici 2027 els següents dos dies: El dia 27 de maig del 2027. El dia 8 de setembre del
  // 2027. [...] Sotmesa la proposta a debat i a posterior votació r esulta aprovada per unanimitat
  // dels membres
  capolat: {
    local: ["2027-05-27", "2027-09-08"],
    source: {
      name: "Acta Ple ordinari 21.07.2026",
      ref: "Ajuntament de Capolat, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/804590004/2026/7d4553d1-84da-4461-b7c4-1f42092d5f8b/ACTA%20PLE%2021.07.2026.pdf",
    },
    act: { kind: "ple", date: "2026-07-21" },
    readOn: "2026-11-04",
  },
  // 3.- Proposta, si s’escau, d’aprovació de les festes locals per l’any 2027. “APROVACIÓ DE LES
  // FESTES LOCALS PER L’ANY 2027. [...] ACORD: Primer.- PROPOSAR com a Festes Locals d'aquest
  // municipi pel proper any 2027 les següents: •Divendres 16 de juliol, Festa Major d’estiu. •Dijous
  // 11 de novembre, Sant Marti. [...] Vots a favor 6 Vots en contra 0 Abstencions 0
  carme: {
    local: ["2027-07-16", "2027-11-11"],
    names: ["Festa Major d'estiu", "Sant Martí"],
    source: {
      name: "Acta ple ordinari 8 de juny de 2026",
      ref: "Ajuntament de Carme, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/804840003/2026/611e0ec6-cc56-4793-915f-49838c7636f1/Acta%20ple%20ordinari%208%20de%20juny%20de%202026.pdf",
    },
    act: { kind: "ple", date: "2026-06-08" },
    readOn: "2026-11-04",
  },
  // 4.- APROVACIO DELS DIES FESTIUS LOCALS DEL MUNICIPI DE CASTELLFOLLIT DE RIUBREGÓS PER A L'ANY
  // 2027 [...] Primer.- Proposar com a festes locals del municipi de Castellfollit de Riubregós per
  // a l'any 2027 els dies següents: 22 de gener de 2027 (Sant Vicenç). 16 d'agost de 2027 (Festa
  // Major). [...] Sotmesa l’anterior proposta a votació fou aprovada per unanimitat per tots els
  // assistents
  "castellfollit-de-riubregos": {
    local: ["2027-01-22", "2027-08-16"],
    names: ["Sant Vicenç", "Festa Major"],
    source: {
      name: "Acta del Ple de 17.06.26 (ACTA_PLE_2026/6)",
      ref: "Ajuntament de Castellfollit de Riubregós, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/806080001/2026/0728183d-0748-431c-9b35-231562401433/17.06.26E.pdf",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // 4. Dictamen d’aprovació festius locals per l’any 2027 [...] ACORD Primer. Proposar al
  // Departament d’Empresa i Treball de la Generalitat de Catalunya, els dies 20 i 21 de setembre de
  // 2027, com a festes locals retribuïdes i no recuperables en el municipi d’Avinyó i nuclis de
  // població agregats. [...] Sotmesa la proposta d’acord a votació el Ple acorda per unanimitat i
  // per assentiment la seva aprovació.
  avinyo: {
    local: ["2027-09-20", "2027-09-21"],
    source: {
      name: "Acta Ple 15.07.2026",
      ref: "Ajuntament d'Avinyó, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/801210007/2026/0a7cc07b-1190-46ff-9134-49cdfe3cfd75/Acta%20Ple%2015.07.2026.pdf",
    },
    act: { kind: "ple", date: "2026-07-15" },
    readOn: "2026-11-04",
  },
  // 3.- APROVACIÓ, SI S'ESCAU, DE LA DETERMINACIÓ DE LES DATES DE LES DUES FESTES LOCALS PER A L'ANY
  // 2027. [...] ACORD Primer.- Fixar per a l’any 2027 com a festes laborals locals el dilluns dia 3
  // de maig, Festa del Panellet, i el dilluns dia 2 d’agost, Festa Major. [...] el Ple acorda per
  // majoria absoluta amb el vot favorable de la unanimitat dels membres assistents a la sessió la
  // seva aprovació
  castellgali: {
    local: ["2027-05-03", "2027-08-02"],
    names: ["Festa del Panellet", "Festa Major"],
    source: {
      name: "Acta sessió ordinària Ple 22.07.26 (signada)",
      ref: "Ajuntament de Castellgalí, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/806150006/2026/6f0e4b05-4740-4677-b006-b0d6095d8299/ACTA%20SO%20PLE%20220726_SIGNADA.pdf",
    },
    act: { kind: "ple", date: "2026-07-22" },
    readOn: "2026-11-04",
  },
  // SISÈ.- APROVACIÓ DE LES FESTES LOCALS PER A L’ANY 2027 PROPOSTA [...] Primer.- Fixar les dues
  // festes locals del municipi de Castellolí per a l’any 2027 en les dates següents: - 30 de març de
  // 2027 - 23 d’agost de 2027 Segon.- Notificar la present resolució al Departament d’ Empresa i
  // Treball.
  castelloli: {
    local: ["2027-03-30", "2027-08-23"],
    source: {
      name: "Acta 6 Ple ordinari 19052026 (ACTA_PLE_2026/8)",
      ref: "Ajuntament de Castellolí, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/806360009/2026/aeff5030-fa86-4681-9409-f3b11c3577ef/06%202026.pdf",
    },
    act: { kind: "ple", date: "2026-05-19" },
    readOn: "2026-11-04",
  },
  // 2. Proposta designació festes locals per a l'any 2027 [...] 1r. Proposar la designació dels dies
  // divendres dia 1 d’octubre i el dijous 11 de novembre, festes locals del municipi del Brull per
  // l’any 2027. [...] Sotmesa la proposta a debat i a posterior votació resulta aprovada per un
  // total de 6 vots a favor d’un total de 7 membres
  "el-brull": {
    local: ["2027-10-01", "2027-11-11"],
    source: {
      name: "Acta PLE-01/06/2026 (ACTA_PLE_2026/5)",
      ref: "Ajuntament del Brull, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/802660009/2026/3288f8c5-86a2-4ca1-a19c-c516ae8978cf/Ple.pdf",
    },
    act: { kind: "ple", date: "2026-06-01" },
    readOn: "2026-11-04",
  },
  // 5.- FESTES LOCALS 2027 [...] Primer.- Aprovar com a festes locals del municipi de Fígols per a
  // l’exercici 2027 els següents dos dies: El dia 16 d’octubre de 2027 (Sant Galderic) El dia 22 de
  // novembre de 2027 (Santa Cecília) [...] S’aprova per unanimitat dels membres del Ple.
  figols: {
    local: ["2027-10-16", "2027-11-22"],
    names: ["Sant Galderic", "Santa Cecília"],
    source: {
      name: "Acta Ple ordinari 18.06.2026",
      ref: "Ajuntament de Fígols, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/808040003/2026/ea3079c6-61af-4007-8aeb-e206931d0097/PLE%20ORDINARI%2018.06.2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-18" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar com a festes locals d’aquest municipi per a l’any 2027 els divendres 7 d e
  // maig i 13 d’agost. Segon.- Notificar aquest acord als Serveis Territorials a Barcelona del
  // Departament d’Empresa i Treball de la Generalitat de Catalunya. Votació Sotmesa a votació la
  // proposta s’aprova per unanimitat.
  "fogars-de-montclus": {
    local: ["2027-05-07", "2027-08-13"],
    source: {
      name: "Acta Ple 28072026",
      ref: "Ajuntament de Fogars de Montclús, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/808110007/2026/f53d538d-d065-4096-a8f4-d6546fa9006c/Acta%20Ple%2028072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-28" },
    readOn: "2026-11-04",
  },
  // Procediment:: Aprovació de la proposta de festes locals per a l’any 2027 [...] Primer.- Proposar
  // els dies que s’indiquen a continuació com a festes locals del municipi de Fonollosa per a l’any
  // 2027: - 22 de febrer - 23 d’agost Segon.- Comunicar el present acord al Departament d’Empresa i
  // Treball de la Generalitat de Catalunya. El present acord ha estat adoptat per unanimitat.
  fonollosa: {
    local: ["2027-02-22", "2027-08-23"],
    source: {
      name: "Acta PLE 21.07.26 (ACTA_PLE_2026/8)",
      ref: "Ajuntament de Fonollosa, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/808470005/2026/c29d93f0-5bac-41df-87a6-7829421d7737/08.Acta_PLE_21.07.26.pdf",
    },
    act: { kind: "ple", date: "2026-07-21" },
    readOn: "2026-11-04",
  },
  // 7.0.- Proposta d'acord d'aprovació de la proposta de festes locals per a l'any 2026
  // Identificació expedient Proposta d’acord d’aprovació de la proposta de festes locals per a l’any
  // 2027 al municipi de Granera [...] Primer.- Proposar al Departament d’Empresa i Treball de la
  // Generalitat de Catalunya, els dies 24/03/2027 i 11/11/2027, com a festes locals retribuïdes i no
  // recuperables. [...] Resultat: Aprovat per unanimitat
  granera: {
    local: ["2027-03-24", "2027-11-11"],
    source: {
      name: "Acta Ple ordinari 29072026",
      ref: "Ajuntament de Granera, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/809580001/2026/c6082284-aaf8-495e-b5fe-7efa3851b1b6/ACTA%20PLE%20ORDINARI%2029072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-29" },
    readOn: "2026-11-04",
  },
  // Festes locals per al 2026 i 2027 Festes, tradicions i activitats destacades FESTES LOCALS 2026
  // Segona Pasqua 25 maig Santa Caterina 23 de novembre FESTES LOCALS 2027 Segona Pasqua 17 maig
  // Santa Caterina 25 de novembre
  "vinyols-i-els-arcs": {
    local: ["2027-05-17", "2027-11-25"],
    names: ["Segona Pasqua", "Santa Caterina"],
    source: {
      name: "Festes locals per al 2026 i 2027",
      ref: "Ajuntament de Vinyols i els Arcs, web page (Festes, tradicions i activitats destacades; no date shown)",
      url: "https://vinyols.altanet.org/festes-tradicions-i-activitats-destacades/festes-locals-al-2026-i-2027",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // Festes Locals Les festes locals per a l'any 2026 seran els dies 2 de setembre (Festa Major de
  // Sant Antolí) i 9 d'octubre (Festa Major del Pilar) . Així mateix, les festes locals per al 2027
  // seran els dies 2 de setembre (Festa Major de Sant Antolí) i 11 d'octubre (Festa Major del Pilar)
  // .
  rossello: {
    local: ["2027-09-02", "2027-10-11"],
    names: ["Festa Major de Sant Antolí", "Festa Major del Pilar"],
    source: {
      name: "Festes Locals (El municipi > Festes populars)",
      ref: "Ajuntament de Rosselló, web page (no date shown)",
      url: "https://www.rossello.cat/el-municipi/festes-populars",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // Festes Locals 2027 17 juny 2026 Alcaldia Des de l'Ajuntament de l'Aldea s'informa a la
  // ciutadania que les festes locals a la nostra població seran el 26 d'abril i el 17 de maig de
  // 2027.
  "l-aldea": {
    local: ["2027-04-26", "2027-05-17"],
    source: {
      name: "Festes Locals 2027",
      ref: "Ajuntament de l'Aldea, news item of 17 de juny de 2026 (Alcaldia)",
      url: "https://laldea.cat/noticies/06-2026/festes-locals-2027",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // El Ple de l'Ajuntament, en sessió ordinària celebrada el 9 de setembre de 2026, ha aprovat el
  // calendari de festes locals del municipi per a l'any 2027. Les festes locals establertes són: ▪️
  // Divendres, 22 de gener de 2027 ▪️ Dilluns, 26 de juliol de 2027
  "castellvell-del-camp": {
    local: ["2027-01-22", "2027-07-26"],
    source: {
      name: "FESTES LOCALS 2027",
      ref: "Ajuntament de Castellvell del Camp, news item of 10 de setembre de 2026",
      url: "https://castellvelldelcamp.cat/general/festes-locals-2027/",
    },
    act: { kind: "ple", date: "2026-09-09" },
    readOn: "2026-11-04",
  },
  // The council's notice of 3 June 2026 (an image on the news page): "FESTIUS 2027 En el Ple del dia
  // 1 de juny de 2026 es van aprovar els dos dies festius locals per a l'any 2027. Aquests són: Dia
  // 17 de maig (Segona Pasqua) Dia 10 d'agost (Sant Llorenç)"
  "sant-llorenc-de-morunys": {
    local: ["2027-05-17", "2027-08-10"],
    names: ["Segona Pasqua", "Sant Llorenç"],
    source: {
      name: "FESTIUS 2027",
      ref: "Ajuntament de Sant Llorenç de Morunys, news item of 3 de juny de 2026 (notice image)",
      url: "https://santllorens.ddl.net/actualitat/noticies/festius-2027",
    },
    act: { kind: "ple", date: "2026-06-01" },
    readOn: "2026-11-04",
  },
  // Ple of 1 June 2026: "Primer.- Proposar al Departament d'Empresa i Treball de la Generalitat de
  // Catalunya com a dies festius locals a efectes laborals corresponents a l'any 2027 al municipi
  // d'Artesa de Segre els que es relacionen segons detall: - Dimarts 9 de febrer (Carnestoltes) -
  // Divendres 24 de setembre (Festa Major)"
  "artesa-de-segre": {
    local: ["2027-02-09", "2027-09-24"],
    names: ["Carnestoltes", "Festa Major"],
    source: {
      name: "Certificat de l'acord del Ple d'1 de juny de 2026: dies festius locals a efectes laborals de l'any 2027 (expedient 1800/2026)",
      ref: "Ajuntament d'Artesa de Segre (anuncis)",
      url: "https://www.artesadesegre.cat/ajuntament/anuncis/20260602_certificat_certificat-dacords_certificat-dacord.pdf/@@download/file",
    },
    act: { kind: "ple", date: "2026-06-01" },
    readOn: "2026-11-04",
  },
  // DIES FESTIUS LOCALS 2027 Els dies festius per l'any 2027 son; 9 de febrer per Carnaval i 26 de
  // juliol per St. Anna, en motiu del dia de la patrona de Llavorsí.
  llavorsi: {
    local: ["2027-02-09", "2027-07-26"],
    names: ["Carnaval", "Santa Anna"],
    source: {
      name: "DIES FESTIUS LOCALS 2027 (Avisos / Pregons)",
      ref: "Ajuntament de Llavorsí, web notice (no date shown)",
      url: "https://www.llavorsi.cat/actualitat/avisos-pregons/dies-festius-2021",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // Festes locals Santa Eugènia de Berga 2026; 25 de Maig (Segona Pasqua) i 7 de Setembre (Dilluns
  // de Festa Major). Festes locals Santa Eugènia de Berga 2027; 17 de Maig (Segona Pasqua) i 6 de
  // Setembre (Dilluns de Festa Major).
  "santa-eugenia-de-berga": {
    local: ["2027-05-17", "2027-09-06"],
    names: ["Segona Pasqua", "Dilluns de Festa Major"],
    source: {
      name: "FESTES LOCALS 2026/2027",
      ref: "Ajuntament de Santa Eugènia de Berga, web page (last updated 16.06.2026)",
      url: "https://www.santaeugenia.cat/continguts/festes-locals-20262027.html",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // Festes locals de l'any 2027 El ple municipal de Sant Quirze de Besora ha aprovat els següents
  // dies com a festius locals: Dilluns de segona pasqua: 17 de maig de 2027 Dimecres de Festa Major:
  // 16 de juny
  "sant-quirze-de-besora": {
    local: ["2027-05-17", "2027-06-16"],
    names: ["Dilluns de segona pasqua", "Dimecres de Festa Major"],
    source: {
      name: "Festes locals (El municipi > Informació del municipi)",
      ref: "Ajuntament de Sant Quirze de Besora, web page (no date shown)",
      url: "https://www.ajsantquirze.cat/el-municipi/informacio-del-municipi/festes-locals",
    },
    act: { kind: "ple", date: null },
    readOn: "2026-11-04",
  },
  // Calendari de festius Festes locals de Castellcir de l'any 2027 Dilluns 17 de maig Dimarts 30 de
  // novembre Festes locals de Castellcir de l'any 2026 Dilluns 25 de maig Dilluns 30 de novembre
  castellcir: {
    local: ["2027-05-17", "2027-11-30"],
    source: {
      name: "Calendari de festius",
      ref: "Ajuntament de Castellcir, web page (last updated 17.06.2026)",
      url: "https://www.castellcir.cat/ajuntament/calendari-de-festius",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // 3.- PROPOSTA D'APROVACIÓ DE LES DUES FESTES LOCALS PER A L'ANY 2027. (EXP.4471/2026). Sotmesa a
  // votació és aprovada per unanimitat del assistents. [...] Primer.- Proposar com a festes locals
  // al terme municipal de Martorell durant l'any 2027 les següents: - 26 d'abril (Dilluns de Fira de
  // primavera). - 16 d'agost (Festa Major).
  martorell: {
    local: ["2027-04-26", "2027-08-16"],
    names: ["Dilluns de Fira de Primavera", "Festa Major"],
    source: {
      name: "Acta del Ple PLN/2026/4, sessió ordinària 20 d'abril de 2026 - punt 3. Proposta d'aprovació de les dues festes locals per a l'any 2027 (Exp. 4471/2026)",
      ref: "Ajuntament de Martorell, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/811410007/2026/13948498-47fe-4682-b81b-0b98a10da737/Ex_acta_ple_4_2026.pdf",
    },
    act: { kind: "ple", date: "2026-04-20" },
    readOn: "2026-11-04",
  },
  // 10. Expedient 4722/2026. Dictamen proposant l'establiment de les dues festes locals del municipi
  // de Torredembarra previstes per a l'any 2027. Favorable Tipus de votació: Unanimitat/Assentiment
  // [...] En conseqüència, el Ple, per UNANIMITAT dels membres presents, amb setze (16) vots a
  // favor, pren el següent acord: Primer.- Proposar com a festes locals per a l'any 2027 els dies 15
  // de juliol (Festa del Quadre de Santa Rosalia) i 4 de setembre (Diada de la Festa Major de Santa
  // Rosalia).
  torredembarra: {
    local: ["2027-07-15", "2027-09-04"],
    names: ["Festa del Quadre de Santa Rosalia", "Diada de la Festa Major de Santa Rosalia"],
    source: {
      name: "Certificat acta Ple PL/2026/8, sessió ordinària 22 de juny de 2026 - punt 10. Expedient 4722/2026. Dictamen proposant l'establiment de les dues festes locals del municipi de Torredembarra previstes per a l'any 2027",
      ref: "Ajuntament de Torredembarra, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4315360009/2026/6e316b83-df4f-431b-9d81-f14e856b98d6/05.%202026-06-22.%20Certificat%20acta%20Ple.pdf",
    },
    act: { kind: "ple", date: "2026-06-22" },
    readOn: "2026-11-04",
  },
  // 4. PROPOSTA D'APROVACIÓ DEL CALENDARI LABORAL DE FESTES LOCALS PER A L'ANY 2027 (EXP.
  // X2026000037) [...] Atès que aquest Ajuntament ha de fixar dues festes locals per a l'any 2027
  // [...] Primer.- Fixar com a festes locals per a l'any 2027, els dies següents: 30 d'abril i 29
  // d'octubre. [...] S'aprova segons la votació anterior
  das: {
    local: ["2027-04-30", "2027-10-29"],
    source: {
      name: "Acta ple 4-2026 de 17.08.2026 (sessió ordinària) - punt 4. Proposta d'aprovació del calendari laboral de festes locals per a l'any 2027 (Exp. X2026000037)",
      ref: "Ajuntament de Das, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1706170005/2026/20ca4739-0510-48f6-8478-e43e489f147a/acta%20ple%204-2026%20de%2017.08.2026%20signada.pdf",
    },
    act: { kind: "ple", date: "2026-08-17" },
    readOn: "2026-11-04",
  },
  // 4.- PROPOSTA DATACIÓ FESTES LOCALS ANY 2027. [...] Primer.- Proposar com a festes laborals de
  // caràcter local per a l’any 2027 d’aquest municipi de Sant Pere de Riudebitlles els dies
  // següents: 25.03.2027 - Dijous Sant 29.06.2027 - Sant Pere
  "sant-pere-de-riudebitlles": {
    local: ["2027-03-25", "2027-06-29"],
    names: ["Dijous Sant", "Sant Pere"],
    source: {
      name: "Acta núm. 3/2026 Ple ordinari 27052026",
      ref: "Ajuntament de Sant Pere de Riudebitlles, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/823250006/2026/d5735cb1-8b23-4bca-8108-7d3fabbaf682/ACTA%20NUM.%2032026%20PLE%20ORDINARI%2027052026.pdf",
    },
    act: { kind: "ple", date: "2026-05-27" },
    readOn: "2026-11-04",
  },
  // CERTIFICACIÓ DELS ASSUMPTES TRACTATS I ACORDS ADOPTATS EN LA SESSIÓ ORDINÀRIA DEL PLE NÚM.
  // 06/2026, QUE VA TENIR LLOC EL DIA 4 DE JUNY DE 2026 [...] 02. FESTES LABORALS DE CARÀCTER LOCAL
  // ANY 2027 Exp. D1292026002 – 445/2026 Anunciada, llegida la proposta núm. 0 2 i sotmesa a votació
  // , s’adopta per unanimitat dels 10 regidors presents, el següent ACORD: [...] Primer. Proposar
  // com a festes laborals de caràcter local per a l’any 2027 d’aquest municipi d’Òdena els dies
  // següents: • 30/03/2027 • 30/04/2027
  odena: {
    local: ["2027-03-30", "2027-04-30"],
    source: {
      name: "Certificació dels assumptes tractats i acords adoptats en la sessió ordinària del Ple núm. 06/2026 (4 de juny de 2026)",
      ref: "Ajuntament d'Òdena, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/814300000/2026/cb889291-95f2-440f-8f9e-3fd9d17b08a0/5.%20Certificats%20acords%20per%20trametre%2006_26.pdf",
    },
    act: { kind: "ple", date: "2026-06-04" },
    readOn: "2026-11-04",
  },
  // A C O R D Primer.- Fixar les festes locals per a l’any 2027 del municipi de Santa Maria de
  // Miralles, en els dies 30 de març i 13 d’agost. Segon.- Notificar aquest acord al Departament
  // d’Empresa i Treball de la Generalitat de Catalunya.” Sotmesa la proposta a debat i a posterior
  // votació resulta aprovada per unanimitat dels membres
  "santa-maria-de-miralles": {
    local: ["2027-03-30", "2027-08-13"],
    source: {
      name: "Acta 3, Ple ordinari 15.06.2026",
      ref: "Ajuntament de Santa Maria de Miralles, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/825730008/2026/aff1a912-d4a9-4907-8790-9e96bfa538d3/ACTA%203_15%2006%202026_Ordinari.pdf",
    },
    act: { kind: "ple", date: "2026-06-15" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar al Departament d’Empresa i Treball de la Generalitat de Catalunya que els dies
  // festius locals del municipi de Talamanca per a l’any 2027 siguin: - 25 de març de 2027 (Dijous
  // Sant) - 16 d’agost de 2027 [...] Sotmesa la proposta a debat i a posterior votació resulta
  // aprovada per unanimitat dels membres
  talamanca: {
    local: ["2027-03-25", "2027-08-16"],
    names: ["Dijous Sant", null],
    source: {
      name: "Acta PLE 17/06/2026 (ACTA_PLE_2026_5)",
      ref: "Ajuntament de Talamanca, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/827790004/2026/5457b031-dc35-4401-a777-307ef5c059eb/ACTA_PLE_2026_5_Acta%20PLE-17_06_2026-5_06072026.PDF",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // 1r. Proposar al Departament de Treball, Afers Socials i Famílies de la Generalitat de Catalunya
  // les festes locals del municipi de Pontons per l'any 2027, quedant establertes les mateixes en:
  // Divendres 22 de gener de 2027. Sant Sebastià (Festa major hivern) Dilluns 26 de juliol de 2027.
  // Santa Magdalena (Festa major estiu)
  pontons: {
    local: ["2027-01-22", "2027-07-26"],
    names: ["Sant Sebastià (Festa major d'hivern)", "Santa Magdalena (Festa major d'estiu)"],
    source: {
      name: "Acta del Ple de 16 de juny de 2026 (expedient 1032-000004-2026)",
      ref: "Ajuntament de Pontons, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/816880001/2026/ca219137-5b8e-4980-8ed3-9d976e8ae006/2026-06-16.pdf",
    },
    act: { kind: "ple", date: "2026-06-16" },
    readOn: "2026-11-04",
  },
  // L'Ajuntament Ple, per unanimitat, acorda: Proposar al Departament d’Empresa i Treball de la
  // Generalitat de Catalunya la designació com a festes de caràcter local per a tots els nuclis i
  // entitats de població d'aquest municipi, per a l'any 202 7, les dates de: 23 d'abril , di
  // vendres, dia de Sant Jordi, i 29 de juny , dimarts, festa de Sant Pere.
  "sant-pere-sallavinera": {
    local: ["2027-04-23", "2027-06-29"],
    names: ["Sant Jordi", "Sant Pere"],
    source: {
      name: "Acta ple 06-26 de 17-06-26",
      ref: "Ajuntament de Sant Pere Sallavinera, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/818970005/2026/f655a7c7-1fff-484f-8805-5af002b78e4c/Acta%20ple%2006-26%20de%2017-06-26.pdf",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // PRIMER.- Proposar al Departament d’Empresa i Treball, la fixació de les següents festes locals
  // d'aquest municipi per a l’any 2027: Olost: 17 de maig de 2027 – dilluns de Pasqua Granada 16
  // d’agost de 2027 – Festa Major d’Olost Santa Creu de Jutglar: 17 de maig de 2027 – dilluns de
  // Pasqua Granada 14 de setembre de 2027 – Festa Major de Santa Creu de Jutglar [...] El Ple ho
  // aprova per unanimitat.
  olost: {
    local: ["2027-05-17", "2027-08-16"],
    names: ["dilluns de Pasqua Granada", "Festa Major d'Olost"],
    nuclei: [
      { name: "Santa Creu de Jutglar", dates: ["2027-05-17", "2027-09-14"] },
    ],
    source: {
      name: "Acta de la sessió ordinària del Ple municipal del 18 de juny de 2026",
      ref: "Ajuntament d'Olost, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/814960009/2026/5540161e-478c-4532-a1ba-b772d10de379/ACTA_PLE_18062026.pdf",
    },
    act: { kind: "ple", date: "2026-06-18" },
    readOn: "2026-11-04",
  },
  // acorda per unanimitat dels assistents: Escollir i designar com a Festes Locals de Vidrà per al
  // proper any 2027, els següents dies: - Dia 15 de gener de 2027, divendres, festa major d’hivern,
  // - Dia 27 de setembre de 2027, dilluns, festa major d’estiu.
  vidra: {
    local: ["2027-01-15", "2027-09-27"],
    names: ["Festa major d'hivern", "Festa major d'estiu"],
    source: {
      name: "Acta sessió 18062026",
      ref: "Ajuntament de Vidrà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1721210007/2026/f2f3becb-7e43-48b3-bd90-afc2844d4eb9/Acta_SESSIO_18062026.pdf",
    },
    act: { kind: "ple", date: "2026-06-18" },
    readOn: "2026-11-04",
  },
  // el Ple de la Corporació, per unanimitat dels assistents, A C O R D A : Primer: Proposar al
  // Departament d’Empresa i Treball, com a dies festius locals de Tagamanent per a l’any 2027: -
  // Dijous, 25 de març de 2027, Dijous Sant. - Dilluns, 17 de maig de 2027.
  tagamanent: {
    local: ["2027-03-25", "2027-05-17"],
    names: ["Dijous Sant", null],
    source: {
      name: "Acta del Ple 2026-0004, sessió ordinària de 25 de juny de 2026",
      ref: "Ajuntament de Tagamanent, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/827630008/2026/dd3dabe1-4f41-4449-ad36-5c6345376d1e/ACTA%20DEL%20PLE%202026-0004%2025062026.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar al Departament de Treball de la Generalitat de Catalunya que les dues festes
  // laborals locals per a 2027 siguin les següents: - Dia 25 de gener, Festa Major de Sant Proget. -
  // Dia 11 d'octubre, Festa Major de l'Aplec del Remei. Segon.- Trametre aquest acord al Departament
  // d’Empresa i Treball de la Generalitat de Catalunya.
  "santa-maria-de-palautordera": {
    local: ["2027-01-25", "2027-10-11"],
    names: ["Festa Major de Sant Proget", "Festa Major de l'Aplec del Remei"],
    source: {
      name: "Acta 4-2026, ple de 25-06-2026 (ratificada)",
      ref: "Ajuntament de Santa Maria de Palautordera, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/825920002/2026/0f9134ad-3a18-467c-a068-980c42a3089c/4.%20Acta%204-2026,%20ple%20de%2025-06-2026%20ratificada.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar com a festes locals d’aquest municipi per a l’any 2027 els dilluns 17 de maig
  // i 23 d’agost. Segon.- Notificar aquest acord als Serveis Territorials a Barcelona del
  // Departament d’Empresa i Treball de la Generalitat de Catalunya. Sotmesa a votació, s’aprova per
  // unanimitat.
  montseny: {
    local: ["2027-05-17", "2027-08-23"],
    source: {
      name: "Acta Ple Extraordinari Urgent 29062026",
      ref: "Ajuntament de Montseny, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/813790004/2026/fefff006-7479-439b-850f-97185603fcf6/Acta%20Ple%20Extraordinari%20Urgent%2029062026.pdf",
    },
    act: { kind: "ple", date: "2026-06-29" },
    readOn: "2026-11-04",
  },
  // Primer. Fixar com a festes locals del municipi de Vilobí del Penedès per a l’any 2027 els dies
  // 25 de març i 23 d’agost de 2027. Segon. Comunicar aquest acord al Departament competent en
  // matèria de treball de la Generalitat de Catalunya, als efectes corresponents. RESULTAT DE LA
  // VOTACIÓ: Aprovat per unanimitat dels 8 membres presents.
  "vilobi-del-penedes": {
    local: ["2027-03-25", "2027-08-23"],
    source: {
      name: "Acta Ple sessió ordinària 29.06.26 - núm 5",
      ref: "Ajuntament de Vilobí del Penedès, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/830410007/2026/982852af-a4e5-4383-8b17-1b4be85110c1/Acta%20Ple%20sessi%f3%20ordinaria%2029.06.26%20-%20num%205.pdf",
    },
    act: { kind: "ple", date: "2026-06-29" },
    readOn: "2026-11-04",
  },
  // Primer.- Declarar com a festes locals del municipi per a l'any 2027, retribuïdes i no
  // recuperables els dies 25 d’agost i 8 de setembre de 2027. Segon.- Donar trasllat del present
  // acord al Departament d’Empresa i Treball de la Generalitat de Catalunya, perquè la proposta
  // realitzada sigui ratificada pel Conseller.
  "torrelles-de-foix": {
    local: ["2027-08-25", "2027-09-08"],
    source: {
      name: "Acta Ple ordinari 4-2026 de 22 de juny",
      ref: "Ajuntament de Torrelles de Foix, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/828830008/2026/98b3d955-ad3e-44c1-be37-b7514abc4323/ACTA%20PLE%20ORDINARI%20I%204-2026%20DE%2022%20DE%20JUNY.pdf",
    },
    act: { kind: "ple", date: "2026-06-22" },
    readOn: "2026-11-04",
  },
  // ACORDS Primer: Proposar com a festa local de Sobremunt per a l’any 2027 els dies 11 de novembre,
  // Sant Martí i 13 de desembre, Santa Llúcia. Segon: Comunicar el present acord al Departament
  // d’Empresa i Treball de la Generalitat de Catalunya. Sotmesa la proposta a debat i a posterior
  // votació resulta aprovada per unanimitat dels membres
  sobremunt: {
    local: ["2027-11-11", "2027-12-13"],
    names: ["Sant Martí", "Santa Llúcia"],
    source: {
      name: "Acta sessió Ple 26 juny de 2026",
      ref: "Ajuntament de Sobremunt, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/827110007/2026/c37c429e-08f8-4937-93ab-c5f4dab0e426/Acta%20sessi%f3%20Ple%2026%20juny%20de%202026.pdf",
    },
    act: { kind: "ple", date: "2026-06-26" },
    readOn: "2026-11-04",
  },
  // El Ple aprova per unanimitat dels set membres presents dels set que formen el nombre legal de
  // membres de la Corporació l’adopció dels següents ACORDS: Primer. Proposar com a festes locals
  // per l’any 2027 els dies 15 de juliol i 29 de setembre de 2027. Segon. Comunicar-ho al
  // Departament d’Empresa i Treball de la Generalitat de Catalunya.
  "les-masies-de-roda": {
    local: ["2027-07-15", "2027-09-29"],
    source: {
      name: "Acta Ple ordinari 4/26 09/07 signada",
      ref: "Ajuntament de les Masies de Roda, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/811670005/2026/d7e257c0-ac97-4cbe-831c-5b98968a9992/ACTA%20PLE%20ORDINARI%204_26%2009_07%20SIGNADA.pdf",
    },
    act: { kind: "ple", date: "2026-07-09" },
    readOn: "2026-11-04",
  },
  // Primer. Designar per a l’any 2027, les següents festes locals d’aquest municipi: Rupit i Pruit :
  // 29 de setembre Sant Miquel i 30 de novembre Sant Andreu Segon. Notificar aquest acord a la
  // Generalitat de Catalunya, als efectes oportuns. [...] Sotmesa la proposta a debat i a posterior
  // votació resulta aprovada per unanimitat dels assistents
  "rupit-i-pruit": {
    local: ["2027-09-29", "2027-11-30"],
    names: ["Sant Miquel", "Sant Andreu"],
    source: {
      name: "Acta PLE 02/07/2026 (ACTA_PLE_2026_4)",
      ref: "Ajuntament de Rupit i Pruit, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/890190004/2026/aa958c9f-610b-4cd8-822c-5720dd20a896/ACTA_PLE_2026_4_Acta%20PLE-02_07_2026-3_21072026.PDF",
    },
    act: { kind: "ple", date: "2026-07-02" },
    readOn: "2026-11-04",
  },
  // 13.- Aprovació festes locals 2027. X2026000306 (2612 -000001- 2026) Proposta Proposar al
  // Departament d’Empresa i Treball de la Generalitat de Catalunya, com a dies de festes locals a
  // Mediona , any 2027, el 30 de març i el 17 de maig. Votació La proposta és aprovada per
  // unanimitat
  mediona: {
    local: ["2027-03-30", "2027-05-17"],
    source: {
      name: "Transcripció dels acords presos pel Ple de l'Ajuntament, sessió ordinària de 8 de juliol de 2026",
      ref: "Ajuntament de Mediona, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/812280001/2026/2d091f4e-10e6-4ec2-8f12-7540843c34ea/TRANSC_PLE%20008%2007072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-08" },
    readOn: "2026-11-04",
  },
  // ACORDS: PRIMER. PROPOSAR al Departament d’Empresa i Treball de la Generalitat de Catalunya que
  // siguin fixades com a festes locals de les Masies de Voltregà per a l’any 2027 les dates
  // següents: Nucli de Vinyoles i Conanglell: 12 de juliol i 8 de setembre Resta de nuclis de les
  // Masies de Voltregà: 6 i 8 de setembre. [...] Sotmesa la proposta a debat i a posterior votació
  // resulta aprovada per unanimitat dels membres amb el següent resultat: 11 vots a favor
  // The acta gives the rest of the municipality's nuclei 6 and 8 September; those are the town's
  // days here, with Vinyoles i Conanglell's own pair.
  "les-masies-de-voltrega": {
    local: ["2027-09-06", "2027-09-08"],
    nuclei: [
      { name: "Vinyoles i Conanglell", dates: ["2027-07-12", "2027-09-08"] },
    ],
    source: {
      name: "Acta Ple ordinari 16072026",
      ref: "Ajuntament de les Masies de Voltregà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/811730008/2026/8d177f66-b1ed-44e5-a78a-09e7523c67d9/PLE%20ORDINARI%2016072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-16" },
    readOn: "2026-11-04",
  },
  // ACORDS: Primer.- Aprovar les següents Festes Locals per a l’any 2027: - 22 de gener - divendres
  // - 25 de juny - divendres Segon.- Comunicar aquest acord al Departament d’Empresa i Treball de la
  // Generalitat de Catalunya. Resultat: Aprovat per unanimitat
  "prats-de-llucanes": {
    local: ["2027-01-22", "2027-06-25"],
    source: {
      name: "Acta Ple ordinari 22-07-2026 (expedient 1032-000004-2026)",
      ref: "Ajuntament de Prats de Lluçanès, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/817120002/2026/6fd4fcb3-e277-4aa2-941a-be4a570f57a6/4.%20ACTA%20PLE%20ORDINARI%2022-07-2026.pdf",
    },
    act: { kind: "ple", date: "2026-07-22" },
    readOn: "2026-11-04",
  },
  // Acords Primer.- Proposar al Departament d’Empresa i Treball de la Generalitat de Catalunya, el
  // 08/09/2027 i el 17/05/2027, com a festes locals retribuïdes i no recuperables. Segon.- Trametre
  // aquest acord al Serveis Territorials del Departament d’Empresa i Treball de la Generalitat de
  // Catalunya de la Generalitat de Catalunya.” Resultat: aprovat per unanimitat
  "l-estany": {
    local: ["2027-05-17", "2027-09-08"],
    source: {
      name: "Acta Ple 28 de juliol de 2026 (expedient 1032-000004-2026)",
      ref: "Ajuntament de l'Estany, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/807900000/2026/7765fd72-db18-41e9-9588-92779ee4d167/ACTA%20PLE%2028%20DE%20JULIOL%20DE%202026.pdf",
    },
    act: { kind: "ple", date: "2026-07-28" },
    readOn: "2026-11-04",
  },
  // 4. APROVACIÓ DE LES FESTES LOCALS DE GAVÀ PER A L’ANY 2027 [...] Primer.- Aprovar com a festes
  // locals del municipi de Gavà per a l’any 2027 les dates següents: 29 de juny de 2027 (Sant Pere),
  // dimarts 14 de desembre de 2027 (Sant Nicasi), dimarts [...] Sotmès el punt a votació, queda
  // aprovat per unanimitat.
  gava: {
    local: ["2027-06-29", "2027-12-14"],
    names: ["Sant Pere", "Sant Nicasi"],
    source: {
      name: "Acta de la sessió ordinària de Ple de data 18 de juny de 2026 (Acta núm. 2026000007), punt 4: Aprovació de les festes locals de Gavà per a l'any 2027",
      ref: "Ajuntament de Gavà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/808980001/2026/b20d8f47-1377-459b-8bbb-3f6ed29251dd/Acta_formalitzada%2018062026.pdf",
    },
    act: { kind: "ple", date: "2026-06-18" },
    readOn: "2026-11-04",
  },
  // 11.- DESIGNACIÓ FESTES LOCALS ANY 2027 (exp. 14922026000002) [...] Se sotmet a votació la
  // proposta que es transcriu a continuació, resultant aprovada per unanimitat dels reunits: [...]
  // PRIMER. Fixar les següents Festes Locals per a l’any 2027: Festivitat de Santa Cristina: 24 de
  // juliol (DISSABTE) Festivitat de Sant Romà: 18 de novembre (DIJOUS)
  "lloret-de-mar": {
    local: ["2027-07-24", "2027-11-18"],
    names: ["Santa Cristina", "Sant Romà"],
    source: {
      name: "Acta del Ple ordinari de 29 de juny de 2026, punt 11: Designació festes locals any 2027 (exp. 14922026000002)",
      ref: "Ajuntament de Lloret de Mar, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1709500000/2026/8b735ed4-1de4-4dff-be54-9854548b0e14/08.%202026%200629%20PLE.pdf",
    },
    act: { kind: "ple", date: "2026-06-29" },
    readOn: "2026-11-04",
  },
  // 2. Dictamen sobre l’aprovació de les festes locals del municipi de l’any 2027 (expedient
  // 218410Y) [...] Primer. Fixar com a festes locals del municipi per a l’any 2027 els dies 22 de
  // gener i 23 d’agost, coincidint, respectivament, amb la festivitat de Sant Vicenç i la Festa
  // Major d’estiu. [...] Vots a favor ( 22): [...] Vots en contra: ningú Abstencions : ningú
  "mollet-del-valles": {
    local: ["2027-01-22", "2027-08-23"],
    names: ["Sant Vicenç", "Festa Major d'estiu"],
    source: {
      name: "Acta del Ple de l'Ajuntament, sessió ordinària de 29 de juny de 2026 (expedient 220348P), punt 2: Dictamen sobre l'aprovació de les festes locals del municipi de l'any 2027 (expedient 218410Y)",
      ref: "Ajuntament de Mollet del Vallès, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/812490004/2026/a18b6617-9b37-4d07-8ac8-9a9260d0e563/Acta%20Ple_Exp220348P_sessi%f3%20ordinaria%2029-06-26.pdf",
    },
    act: { kind: "ple", date: "2026-06-29" },
    readOn: "2026-11-04",
  },
  // 2. Proposta de Festes locals per al calendari laboral de l’any 2027. Expt. 2743/2026 [...]
  // Primer.- Fixar les festes locals de Polinyà per a l’any 2027 per als següents dies: - 20 de
  // gener de 2027 - 5 de juliol de 2027 [...] Posada a votació, la proposta resta aprovada per
  // unanimitat.
  polinya: {
    local: ["2027-01-20", "2027-07-05"],
    source: {
      name: "Acta de Ple de l'Ajuntament núm. 4/2026 (sessió ordinària d'1 de juliol de 2026), punt 2: Proposta de Festes locals per al calendari laboral de l'any 2027. Expt. 2743/2026",
      ref: "Ajuntament de Polinyà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/816720002/2026/43c761a9-96ea-4ab0-9edd-8113bf7c0d8e/AP20260701-4.pdf",
    },
    act: { kind: "ple", date: "2026-07-01" },
    readOn: "2026-11-04",
  },
  // Expedient 3576/2026. Fixació dues festivitats locals per a l'any 2027 (24 d'agost i 7 de
  // desembre) Favorable Tipus de votació: Unanimitat/Assentiment [...] PRIMER. Proposar com a
  // festius locals per a l’any 2027, els dies:- - 24 d’agost de 2027 (dimarts). - 7 de desembre de
  // 2027 ( dimarts).
  "roda-de-bera": {
    local: ["2027-08-24", "2027-12-07"],
    source: {
      name: "Acta del Ple ordinari de 25 de juny de 2026 (PL/2026/6, acta núm. 2026-0006), Expedient 3576/2026. Fixació dues festivitats locals per a l'any 2027 (24 d'agost i 7 de desembre)",
      ref: "Ajuntament de Roda de Berà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4313100000/2026/ff9387d1-8804-4820-9259-968349f197bd/20260723_Acta_Acta%20ple_ACTA%20DEL%20PLE%202026-0006%20%5BActa%20sessi%f3%20PLE%206_2026%20de%20data%2025.06.2026%5D.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // Expedient 1127/2026. Aprovació calendari Festes Locals 2027. Favorable Tipus de votació:
  // Ordinària Tipus de majoria: Unanimitat A favor: 13, En contra: 0, Abstencions: 0, Absents: 0
  // [...] Primer. PROPOSAR al Departament d'Empresa i Treball de la Generalitat de Catalunya que
  // fixi com a festes locals, retribuïdes i no recuperables, del municipi de Montmeló per a l'any
  // 2027, els dies: Dilluns 17 de maig – Segona Pasqua Divendres 2 de juliol – Festa Major
  montmelo: {
    local: ["2027-05-17", "2027-07-02"],
    names: ["Segona Pasqua", "Festa Major"],
    source: {
      name: "Acta del Ple ordinari de 28 de juliol de 2026 (PLN/2026/5), Expedient 1127/2026. Aprovació calendari Festes Locals 2027",
      ref: "Ajuntament de Montmeló, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/813500000/2026/6a68db20-35d0-436d-9e3f-b08f584d4c80/05_20260728_Acta%20Ple%20ordinari.pdf",
    },
    act: { kind: "ple", date: "2026-07-28" },
    readOn: "2026-11-04",
  },
  // 6.- DICTAMEN PER A L'APROVACIÓ DE LES FESTES LOCALS I L'OBERTURA DELS ESTABLIMENTS COMERCIALS
  // PER A L'ANY 2027 (expedient X2026000550) [...] Primer. Proposar al Departament d’Empresa i
  // Treball de la Generalitat de Catalunya les festes locals i obertura dels establiments comercials
  // del municipi de Celrà per a l’any 2027: - 3 de maig de 2027 - 29 d’octubre de 2027 [...] La
  // proposta, un cop sotmesa a votació, ha estat aprovada per UNANIMITAT
  celra: {
    local: ["2027-05-03", "2027-10-29"],
    source: {
      name: "Acta de sessió del Ple de l'Ajuntament de Celrà, sessió ordinària de 9 de juny de 2026 (PLE2026000008), punt 6: Dictamen per a l'aprovació de les festes locals i l'obertura dels establiments comercials per a l'any 2027 (expedient X2026000550)",
      ref: "Ajuntament de Celrà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1704990004/2026/0709dfcf-1470-4087-9aa0-687d9228ac08/ActaPle_9juny.pdf",
    },
    act: { kind: "ple", date: "2026-06-09" },
    readOn: "2026-11-04",
  },
  // Expedient 3129/2026. Festes locals de l'any 2027 [...] Favorable Tipus de votació:
  // Unanimitat/Assentiment Primer.- Aprovar la fixació de dues festes locals pel nostre municipi
  // corresponents a l'any 2027 i que són les següents: Puigcerdà: Dilluns 19 de juliol Festa Major
  // [...] Dimecres 8 de setembre Festa Mare de Déu de la Sagristia Age : Dijous 7 de gener Sant
  // Julià Dissabte 12 de juny Festa d'Age Vilallobent: Dissabte 4 de setembre Festa Major Dimarts 30
  // de novembre Sant Andreu Ventajola: Dissabte 3 de juliol Sant Tomàs Dimarts 21 de desembre Festa
  // Major
  puigcerda: {
    local: ["2027-07-19", "2027-09-08"],
    names: ["Festa Major", "Festa Mare de Déu de la Sagristia"],
    nuclei: [
      { name: "Age", dates: ["2027-01-07", "2027-06-12"] },
      { name: "Vilallobent", dates: ["2027-09-04", "2027-11-30"] },
      { name: "Ventajola", dates: ["2027-07-03", "2027-12-21"] },
    ],
    source: {
      name: "Acta de Ple núm. 2026-0003 (Ple ordinari de 8 de juny de 2026; Expedient 3129/2026. Festes locals de l'any 2027)",
      ref: "Ajuntament de Puigcerdà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1714110007/2026/dd566fa3-0522-408a-9466-19d910298f8c/ACTA%20DE%20PLE%202026-0003%20%5BActa%20Ple%2008_06_2026%20(SA)%5D.pdf",
    },
    act: { kind: "ple", date: "2026-06-08" },
    readOn: "2026-11-04",
  },
  // 2. PROPOSTA ALCALDIA PER ACORDAR LES FESTES LOCALS DE VACARISSES PER A ANY 2027 [...] PRIMER.-
  // Determinar com a festes locals de Vacarisses per al 2027 els dies 25 de març i 28 de maig de
  // 2027. SEGON.- Comunicar aquest acord al Departament d'Empresa i Treball de la Generalitat de
  // Catalunya.” Sotmesa la proposta a debat i a posterior votació resulta aprovada per majoria
  // absoluta amb el següent resultat: 12 vots a favor [...], 1 abstenció del Grup Polític La Voz de
  // Vacarisses. No hi ha vots en contra.
  vacarisses: {
    local: ["2027-03-25", "2027-05-28"],
    source: {
      name: "Acta del Ple ordinari de 30 d'abril de 2026 (ACTA PLE 300426 anonimitzada; punt 2: Proposta Alcaldia per acordar les festes locals de Vacarisses per a any 2027)",
      ref: "Ajuntament de Vacarisses, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/829170005/2026/775df760-1b96-463d-ac2e-0c9084769d8a/ACTA%20PLE%20300426%20anonimitzada.pdf",
    },
    act: { kind: "ple", date: "2026-04-30" },
    readOn: "2026-11-04",
  },
  // Cinquè.- Aprovació de festes locals any 2027 PROPOSTA APROVACIÓ DE LES DUES FESTES LOCALS DEL
  // MUNICIPI, ANUALITAT 2027 [...] Membres corporatius: 7 Assistents: 5 Vots a favor : 5 [...]
  // S'ACORDA Primer. Proposar al Departament d'Empresa i Treball de la Generalitat de Catalunya les
  // següents festes locals per a l'any 2027: 3 de febrer Sant Blai 8 de novembre Festa major Segon.
  // Comunicar-ho al Departament d'Empresa i Treball, als efectes oportuns.
  porrera: {
    local: ["2027-02-03", "2027-11-08"],
    names: ["Sant Blai", "Festa major"],
    source: {
      name: "Acta del Ple ordinari de 22 de juliol de 2026 (punt cinquè: Aprovació de festes locals any 2027)",
      ref: "Ajuntament de Porrera, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4311400000/2026/5dd5c9f6-2e04-45a9-a2af-7f7b9926fef5/20260722_03_Acta_PO.pdf",
    },
    act: { kind: "ple", date: "2026-07-22" },
    readOn: "2026-11-04",
  },
  // 2. Expedient 1432/2026. Proposta de festes locals per a l'any 2027 Favorable Tipus de votació:
  // Unanimitat/Assentiment [...] l'any que ve les tradicionals festes locals, el dia de Sant Vicenç,
  // 22 de gener, i el de la Mare de Déu del Carme, 16 de juliol; s'escauen en divendres. Per tot
  // això, el Ple de l'Ajuntament ACORDA: Primer.- PROPOSAR al Departament d'Empresa i Treball de la
  // Generalitat de Catalunya la fixació com a festes locals per a l'any 2027, els dies 22 de gener i
  // 16 de juliol (ambdós divendres).
  llanca: {
    local: ["2027-01-22", "2027-07-16"],
    names: ["Sant Vicenç", "Mare de Déu del Carme"],
    source: {
      name: "Acta del Ple 26-03 de data 1-06-2026 (punt 2: Expedient 1432/2026. Proposta de festes locals per a l'any 2027)",
      ref: "Ajuntament de Llançà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1709260009/2026/da65b5ba-a7b5-425f-a3c3-cad14e89d185/Acta%20Ple%2026-03%20de%20data%201-06-2026%20aprovada.pdf",
    },
    act: { kind: "ple", date: "2026-06-01" },
    readOn: "2026-11-04",
  },
  // 14.- PROPOSTA AL DEPARTAMENT D'EMPRESA I TREBALL DE LA GENERALITAT DE CATALUNYA DE LES DUES
  // FESTES LOCALS DEL MUNICIPI DE PALAU-SAVERDERA PER A L'ANY 2027 [...] Primer.- Proposar com a
  // festes locals del municipi de Palau-saverdera per a l'any 2027, el dia 1 de febrer i el 30
  // d'agost de 2027. Segon.- Donar trasllat d'aquest acord als Serveis Territorials d'Empresa i
  // Treball de la Generalitat de Catalunya.” Sense que s'hagin produït intervencions al respecte, es
  // passa la proposta a votació, que és aprovada per UNANIMITAT dels membres presents d'acord amb el
  // següent resultat: Aprovat per 9 vots a favor
  "palau-saverdera": {
    local: ["2027-02-01", "2027-08-30"],
    source: {
      name: "Acta del Ple ordinari de 27 de juliol de 2026 (punt 14: Proposta al Departament d'Empresa i Treball de la Generalitat de Catalunya de les dues festes locals del municipi de Palau-saverdera per a l'any 2027)",
      ref: "Ajuntament de Palau-saverdera, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1712080001/2026/17f0d330-6cef-41fd-9fca-96c57dd82125/acta%20ple%2027072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-27" },
    readOn: "2026-11-04",
  },
  // 2. Expedient 1984/2026. Aprovació del Calendari de Festes Locals de Moià per a l’any 2027.
  // Favorable Tipus de votació: Unanimitat/Assentiment [...] PRIMER.- PROPOSAR com a dies festius
  // locals retribuïts i no recuperables per l’any 2027 el 20 de gener i el 17 d’agost. [...] L’acord
  // s’aprova per unanimitat de tots els membres del Ple.
  moia: {
    local: ["2027-01-20", "2027-08-17"],
    source: {
      name: "Acta del Ple PLN/2026/6, sessió ordinària de 17 de juny de 2026 (punt 2: Expedient 1984/2026. Aprovació del Calendari de Festes Locals de Moià per a l’any 2027)",
      ref: "Ajuntament de Moià, acta de ple núm. 2026-0008 (signada 28/08/2026), sessió de 17 de juny de 2026",
      url: "https://www.moia.cat/web/wp-content/uploads/2026/10/20260819_Acta_Acta-ple_ACTA-DE-PLE-2026-0008-20260710_Acta-PLN_2026_6-de-17-de-juny-de-2026_.pdf",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // L’any 2027 inclourà 12 festes d’àmbit català, a les quals els ajuntaments podran afegir-hi dues
  // festes locals (en el cas de Vilafant: 3 de maig i 16 de setembre 2027) [...] Seran festes
  // laborals a Vilafant durant l’any 2027 les següents: [...] 3 de maig (1r festiu local Vilafant,
  // Sta. Creu) [...] 16 de setembre (2n festiu local Vilafant, St Cebrià)
  vilafant: {
    local: ["2027-05-03", "2027-09-16"],
    names: ["Santa Creu", "Sant Cebrià"],
    source: {
      name: "Calendari de festes laborals de Vilafant 2027 - Festius a Vilafant",
      ref: "Ajuntament de Vilafant, notícia de divendres 24 de juliol de 2026",
      url: "https://www.vilafant.cat/lajuntament/noticies/calendari-laboral-2027-festius",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // El Ple de l’Ajuntament de les Borges del Camp d’aquest passat 16 de juliol ha aprovat per
  // unanimitat el calendari de festes locals del municipi per a l’any 2027. Les dues dates fixades
  // són el dijous 3 de juny de 2027, amb motiu de la festa de la Capvuitada, i el dimecres 8 de
  // setembre de 2027, coincidint amb la Festa Major en honor a la Mare de Déu de la Riera.
  "les-borges-del-camp": {
    local: ["2027-06-03", "2027-09-08"],
    names: ["Capvuitada", "Festa Major de la Mare de Déu de la Riera"],
    source: {
      name: "Les Borges del Camp aprova les dues festes locals del 2027: Capvuitada el 3 de juny i MD de la Riera el 8 de setembre",
      ref: "Ajuntament de les Borges del Camp, notícia de 20 de juliol (2026)",
      url: "https://www.lesborgesdelcamp.cat/noticies/les-borges-del-camp-aprova-les-dues-festes-locals-del-2027-capvuitada-el-3-de-juny-i-md-de",
    },
    act: { kind: "ple", date: "2026-07-16" },
    readOn: "2026-11-04",
  },
  // 3.0.- Proposta de Festes Locals del municipi de Sarrià de Ter per a l'any 2027. (X2026001288)
  // [...] Primer.- Proposar al Departament d'Empresa i Treball de la Generalitat de Catalunya que
  // siguin incorporades al calendari laboral de l'any 2027, com a festes de caràcter local del
  // municipi de Sarrià de Ter, les dates següents: • 26 de juliol de 2027 (dilluns) • 29 d'octubre
  // de 2027 (divendres) [...] Aprovat per 12 vots a favor
  "sarria-de-ter": {
    local: ["2027-07-26", "2027-10-29"],
    source: {
      name: "Acta de la sessió del Ple de l'Ajuntament del dia 30 de juny de 2026 (PLE2026000007) - punt 3.0 Proposta de Festes Locals del municipi de Sarrià de Ter per a l'any 2027 (X2026001288)",
      ref: "Ajuntament de Sarrià de Ter, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1718640003/2026/2fa70d1e-e608-4bde-8b94-94e53a43eb4a/PLE%202026%2007%202026%2006%2030.pdf",
    },
    act: { kind: "ple", date: "2026-06-30" },
    readOn: "2026-11-04",
  },
  // 7. FESTES LOCALS DE FOLGUEROLES PER A L'ANY 2027 En sessió Ordinària de Ple, celebrada el dia 21
  // de juliol de 2026, s'ha pres l'acord següent: [...] Primer.- Proposar al Departament d'Empresa i
  // Treball de la Generalitat de Catalunya que les dues festes locals de Folgueroles per a l'any
  // 2027 siguin: 17 de maig Segona Pasqua 13 de setembre Festa Major de Folgueroles [...] Sotmesa la
  // proposta a debat i a posterior votació resulta aprovada per unanimitat dels assistents amb el
  // següent resultat: 10 vots a favor
  folgueroles: {
    local: ["2027-05-17", "2027-09-13"],
    names: ["Segona Pasqua", "Festa Major de Folgueroles"],
    source: {
      name: "Acords adoptats a la sessió de Ple núm. 5, ordinària, 21 de juliol de 2026 - punt 7. Festes locals de Folgueroles per a l'any 2027",
      ref: "Ajuntament de Folgueroles, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/808320002/2026/0718e777-97fd-4651-9a43-c367481e1035/15.%20ACORDS%20ADOPTATS.pdf",
    },
    act: { kind: "ple", date: "2026-07-21" },
    readOn: "2026-11-04",
  },
  // PROPOSTA D'APROVACIÓ DIES FESTIUS LOCALS PER A L'ANY 2027.6. S'aprova per unanimitat. [...] Atès
  // que s'han d'aprovar les Festes Locals per a l'exercici 2027 pel ple municipal abans del dia 31
  // d'agost de 2026. [...] En conseqüència, :S'ACORDA 1r.- Aprovar com a Festes Locals per a l'any
  // 2027 els dies 17 de maig i 16 d'agost.
  deltebre: {
    local: ["2027-05-17", "2027-08-16"],
    source: {
      name: "Acta del Ple municipal de data 18 de juny de 2026 núm. 6 - punt 6. Proposta d'aprovació dies festius locals per a l'any 2027",
      ref: "Ajuntament de Deltebre, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4390180001/2026/804b7041-90d4-4c51-8d9d-6b6d847f5e7d/Acta%20PM%2006182026.pdf",
    },
    act: { kind: "ple", date: "2026-06-18" },
    readOn: "2026-11-04",
  },
  // ACORDS: Primer.- Establir les dues festes locals del municipi de Sant Cugat Sesgarrigues els
  // dies 23 i 26 de juliol de 2027. Segon.- Notificar l’esmentat acord a la Delegació Territorial de
  // Barcelona del Departament d’Empresa i Treball de la Generalitat de Catalunya.
  "sant-cugat-sesgarrigues": {
    local: ["2027-07-23", "2027-07-26"],
    source: {
      name: "Acta Ple extraordinari núm. 7",
      ref: "Ajuntament de Sant Cugat Sesgarrigues, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/820680001/2026/780b87ed-143a-43ed-8fee-e892b69ea6fe/ACTA%20PLE%20EXTRAORDINARI%20NUM.%207%20DE%2026.06.26.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // El Ple adopta per unanimitat del nombre legal de membres de la corporació, formada per set
  // regidors, els següents ACORDS: PRIMER. Aprovació de les festes locals al municipi de Sant Boi de
  // Lluçanès per l’any 2027 següents: 20 de maig, (dijous, Sant Baldiri) 28 de setembre (dimarts,
  // fira de l’hostal)
  "sant-boi-de-llucanes": {
    local: ["2027-05-20", "2027-09-28"],
    names: ["Sant Baldiri", "Fira de l'Hostal"],
    source: {
      name: "Acta de la sessió ordinària del Ple del 22 de juliol de 2026 (Acta 4/2026)",
      ref: "Ajuntament de Sant Boi de Lluçanès, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/820160009/2026/113ac5ab-263b-4cc6-a246-2e371fdd4c4d/ACTA_PLE_2026_4_PLE%20ORDINARI_22072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-22" },
    readOn: "2026-11-04",
  },
  // ACORDS: Primer.- PROPOSAR que les següents dates siguin fixades com a festes locals de Sant
  // Hipòlit de Voltregà per l’exercici 2027: 6 i 8 de setembre Segon.- COMUNICAR aquest acord al
  // Departament d’Empresa i Treball de la Generalitat de Catalunya. Sotmesa la proposta a debat i a
  // posterior votació resulta aprovada per unanimitat dels assistents
  "sant-hipolit-de-voltrega": {
    local: ["2027-09-06", "2027-09-08"],
    source: {
      name: "Acta Ple 05 de 14/09/2026 (PLE/2026/5)",
      ref: "Ajuntament de Sant Hipòlit de Voltregà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/821530008/2026/cef4b741-c70c-41fe-9c1f-f0d2b72dab55/ACTA%20PLE%2005%20DE%2014%2009%202026.pdf",
    },
    act: { kind: "ple", date: "2026-09-14" },
    readOn: "2026-11-04",
  },
  // El Ple adopta per unanimitat del nombre legal de membres de la corporació, formada per cinc
  // regidors, els següents ACORDS: PRIMER. Aprovar com a festes locals del municipi de Sant Martí
  // d’Albars pel 202 7 els dies que a continuació s’indiquen: - Dia 25 de març (dijous Sant) - Dia
  // 11 de novembre (dijous, Sant Martí)
  "sant-marti-d-albars": {
    local: ["2027-03-25", "2027-11-11"],
    names: ["Dijous Sant", "Sant Martí"],
    source: {
      name: "Acta Ple 5/2026 ordinari 30092026",
      ref: "Ajuntament de Sant Martí d'Albars, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/822510007/2026/1e01e234-80a3-4a2a-842f-cad1e8074477/ACTA_PLE%205_2026%20ORDINARI%2030092026.pdf",
    },
    act: { kind: "ple", date: "2026-09-30" },
    readOn: "2026-11-04",
  },
  // ACORD Primer. Proposar al Conseller de Treball de la Generalitat de Catalunya perquè fixi com a
  // Festes Locals per l’any 2027 del municipi de Sant Llorenç d’Hortons les següents: 20 de gener,
  // dimecres Sant Sebastià, Festa Major d’hivern 10 d’agost, dimarts Sant Llorenç, Festa Major
  // d’estiu
  "sant-llorenc-d-hortons": {
    local: ["2027-01-20", "2027-08-10"],
    names: ["Sant Sebastià, Festa Major d'hivern", "Sant Llorenç, Festa Major d'estiu"],
    source: {
      name: "Acta Ple 04 ordinari 05082026",
      ref: "Ajuntament de Sant Llorenç d'Hortons, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/822270005/2026/5e5a321d-3a47-4385-a987-5c7468a3f9b8/ACTA%20PLE%2004%20ORDINARI%2005082026.pdf",
    },
    act: { kind: "ple", date: "2026-08-05" },
    readOn: "2026-11-04",
  },
  // ACORD Proposar a la Generalitat de Catalunya que les dues festes locals corresponents al
  // municipi de Viladrau per a l´any 2027 siguin fixades pels dies: 8 DE SETEMBRE (DIMECRES) 11 DE
  // NOVEMBRE (DIJOUS) La proposta és aprovada per unanimitat dels Regidors presents
  viladrau: {
    local: ["2027-09-08", "2027-11-11"],
    source: {
      name: "Acta Ple PO 06072026 - 7 (expedient X2026000311)",
      ref: "Ajuntament de Viladrau, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1722070005/2026/9821f5d4-a5c0-4b46-a04b-3da55e1b9fbc/ACTA%20PLE%20%20PO06072026%20-%207%20-.pdf",
    },
    act: { kind: "ple", date: "2026-07-06" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar com a festes locals del municipi de Santa Eulàlia de Riuprimer per a l’any
  // 2027, els dies 17 de maig (Segona Pasqua) i 6 de setembre (Festa Major d’estiu). Segon.- Enviar
  // certificat del present acord al Departament d’Empresa i Treball de la Generalitat de Catalunya.
  // VOTACIÓ.- S’aprova per unanimitat dels assistents a la sessió.
  "santa-eulalia-de-riuprimer": {
    local: ["2027-05-17", "2027-09-06"],
    names: ["Segona Pasqua", "Festa Major d'estiu"],
    source: {
      name: "Acta Ple 06-07-2026",
      ref: "Ajuntament de Santa Eulàlia de Riuprimer, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/824760009/2026/aff891be-8af5-487d-a6cd-c3694b469404/ACTA%20PLE%2006-07-2026.pdf",
    },
    act: { kind: "ple", date: "2026-07-06" },
    readOn: "2026-11-04",
  },
  // El Ple aprova per unanimitat dels set regidors presents, del set que composen el Ple, els
  // següents ACORDS Primer.- Formular la proposta de les festes locals del municipi de Tavèrnoles
  // per a l’any 2027, els següents dies: Dilluns 2 d’agost (Festa Major) Dilluns 17 de maig, segona
  // pasqua
  tavernoles: {
    local: ["2027-05-17", "2027-08-02"],
    names: ["Segona Pasqua", "Festa Major"],
    source: {
      name: "Acta Ple ordinària 13 de juliol 2026",
      ref: "Ajuntament de Tavèrnoles, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/827500000/2026/27fe08a8-0044-4135-ba7d-623ac300226d/ACTA%20PLE%20ORDINARIA%2013%20DE%20JULIOL%202026%2023072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-13" },
    readOn: "2026-11-04",
  },
  // ACORDS: Primer.- Aprovar les dues festes locals per a l’any 2027 els dies 17 de maig de 2027 i 7
  // de desembre de 2027. Segon.- Trametre el present acord al Departament d’Empresa i Treball de la
  // Generalitat de Catalunya. Seguidament se sotmet la proposta a votació que és aprovada per
  // unanimitat dels 5 membres presents
  "santa-maria-de-besora": {
    local: ["2027-05-17", "2027-12-07"],
    source: {
      name: "Acta de la sessió ordinària del Ple de l'Ajuntament de Santa Maria de Besora del dia 29 de juliol de 2026 (08/2026)",
      ref: "Ajuntament de Santa Maria de Besora, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/825360009/2026/6172bacc-1883-43db-98c9-121717a28cf1/ACTA%20Ple%2029-07-2026_publi.pdf",
    },
    act: { kind: "ple", date: "2026-07-29" },
    readOn: "2026-11-04",
  },
  // Resolució: ACORDS Primer.- PROPOSAR al Departament d’Empresa i Treball com a dies festius locals
  // de l’any 2027 del municipi de Sant Martí de Centelles dilluns, 17 de maig, i dijous, 11 de
  // novembre. Segon.- DONAR TRASLLAT de la resolució presa al Departament d’Empresa i Treball per al
  // seu coneixement i efectes.
  "sant-marti-de-centelles": {
    local: ["2027-05-17", "2027-11-11"],
    source: {
      name: "Acta del Ple 2026-0005 - 30-07-2026 (PLN/2026/7)",
      ref: "Ajuntament de Sant Martí de Centelles, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/822480001/2026/603ff67a-66a9-4b5c-afbb-0141ad01038c/ACTA%20DEL%20PLE%202026-0005-%2030-07-2026.pdf",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-11-04",
  },
  // ACORDS, PRIMER. PROPOSAR que es fixin com a festes locals del municipi d’Olivella per l'any 2027
  // els dies: .25 de juny de 2027, divendres i 7 de desembre de 2027, dimarts SEGON. COMUNICAR
  // aquest acord al Departament d’Empresa i Treball de la Generalitat de Catalunya als efectes
  // oportuns.
  olivella: {
    local: ["2027-06-25", "2027-12-07"],
    source: {
      name: "Acta Ple de 28 de juliol de 2026 (PLN/2026/4)",
      ref: "Ajuntament d'Olivella, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/814830008/2026/eef12af4-7a56-4117-a9d3-a35dbc9f43cf/20260917_Acta_ACTA%20PLE%20DE%2028%20DE%20JULIOL%20DE%202026.pdf",
    },
    act: { kind: "ple", date: "2026-07-28" },
    readOn: "2026-11-04",
  },
  // El Ple adopta per unanimitat el següent acord: ÚNIC. Proposar al Departament d’Empresa i Treball
  // de la Generalitat, com a festes locals de l’any 2027, els dies: - 8 de febrer, dilluns de
  // carnaval - 17 de maig, dilluns de Pasqua Granada
  organya: {
    local: ["2027-02-08", "2027-05-17"],
    names: ["dilluns de carnaval", "dilluns de Pasqua Granada"],
    source: {
      name: "Acta de la sessió del Ple de l'Ajuntament núm. 3/2026 (27 d'abril de 2026)",
      ref: "Ajuntament d'Organyà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2515560009/2026/cfbd89dc-c1ad-4975-8c29-6e72ec31bf55/27-04-2026.pdf",
    },
    act: { kind: "ple", date: "2026-04-27" },
    readOn: "2026-11-04",
  },
  // ACORD PRIMER.- Establir els dies de festa local per a I' any 2027 següents: -El divendres, 22 de
  // gener de 2027. -El divendres, 27 d'agost de 2027. [...] El Ple aprova la proposta anterior per
  // unanimitat, cosa que representa la majoria absoluta del nombre legal de membres de la
  // Corporació.
  alcarras: {
    local: ["2027-01-22", "2027-08-27"],
    source: {
      name: "Acta ple 20260430 (esborrany)",
      ref: "Ajuntament d'Alcarràs, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2501170005/2026/b293fd10-02a8-455f-a575-1db2b43a5be3/20260703_Acta_Acta%20ple_20260430esborrany.pdf",
    },
    act: { kind: "ple", date: "2026-04-30" },
    readOn: "2026-11-04",
  },
  // ACORDA: Primer.- Proposar com a festes locals per al municipi de Coll de Nargó per a l’any 2027;
  // els següents dies: • Divendres 23 de juliol • Dimarts 23 de novembre Segon.- Comunicar el
  // present acord als Serveis Territorials del Departament d’Empresa i Treball de Lleida.
  "coll-de-nargo": {
    local: ["2027-07-23", "2027-11-23"],
    source: {
      name: "Acta de la sessió extraordinària del Ple de l'Ajuntament de Coll de Nargó (18 de maig de 2026)",
      ref: "Ajuntament de Coll de Nargó, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2507720002/2026/83c27371-b771-4a5d-bab2-525a5b792b37/ACTA18052026.pdf",
    },
    act: { kind: "ple", date: "2026-05-18" },
    readOn: "2026-11-04",
  },
  // 5.- Proposta d’acord de les festes locals al municipi de Palau de Santa Eulàlia per l’any 2027.
  // [...] ACORD: Primer.- Proposar com a festes locals del municipi de Palau de Santa Eulàlia per
  // l’any 2027, les següents dates: - Divendres 30 d’abril [...] - Divendres 10 de desembre. [...]
  // Aprovat per 3 vots a favor [...] i 2 abstencions
  "palau-de-santa-eulalia": {
    local: ["2027-04-30", "2027-12-10"],
    source: {
      name: "Acta de la sessió del Ple de l'Ajuntament del dia 28 d'abril de 2026 (PLE2026000004)",
      ref: "Ajuntament de Palau de Santa Eulàlia, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1711940003/2026/b4198e89-17de-4e38-9fb0-3a7c38cd7178/tmp6354716305355969696PLE2026000004_ACTA.pdf",
    },
    act: { kind: "ple", date: "2026-04-28" },
    readOn: "2026-11-04",
  },
  // Per a tot això, s’ACORDA: Primer.- Aprovar els dies de Festes Locals a Fontcoberta: -Divendres
  // 30 de juliol de 2027 -Dilluns 25 d’octubre de 2027 Segon.- Comunicar l’acord d’aprovació de les
  // festes locals al Departament de Treball, Afers Socials i Famílies de la Generalitat de
  // Cataluny[a]
  fontcoberta: {
    local: ["2027-07-30", "2027-10-25"],
    source: {
      name: "Acta del Ple (expedient X2026000275)",
      ref: "Ajuntament de Fontcoberta, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1707150006/2026/ae699883-c738-4d33-bfb7-59a320cb2ba9/36359631_f3a8260a_8_Resum6327665198781987679.pdf",
    },
    act: { kind: "ple", date: "2026-05-25" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar que es determinin com a inhàbils per al treball, retribuïts i no recuperables,
  // amb caràcter de festius locals de l’any 2027, els dies següents: - 9 i 10 de setembre Segon.-
  // Comunicar aquest acord al Servei Territorial del Departament de Treball a Girona
  breda: {
    local: ["2027-09-09", "2027-09-10"],
    source: {
      name: "Acta de la sessió del Ple de l'Ajuntament del dia 25 de maig de 2026 (PLE2026000004)",
      ref: "Ajuntament de Breda, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1702740003/2026/691ef0cc-f704-4551-bf90-c813a7e7d08f/PLE2026000004%2025052026.pdf",
    },
    act: { kind: "ple", date: "2026-05-25" },
    readOn: "2026-11-04",
  },
  // es proposa al ple l’adopció del següent acord: “Proposar al Departament d’Empresa i Treball de
  // la Generalitat de Catalunya com a festes locals de Flaçà per a l’any 2027, els dies 7 de juliol
  // i l’11 d’octubre”. Sotmesa a votació la proposta és apro[vada]
  flaca: {
    local: ["2027-07-07", "2027-10-11"],
    source: {
      name: "Acta de la sessió del Ple de l'Ajuntament del dia 26 de maig de 2026 (PLE2026000005)",
      ref: "Ajuntament de Flaçà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1706750006/2026/ec120d88-99b9-4209-a04f-fa4a6d6a0495/06-PLE%20ORD%2026-05-2026.pdf",
    },
    act: { kind: "ple", date: "2026-05-26" },
    readOn: "2026-11-04",
  },
  // Primer. Escollir els dies 12 de juliol i 22 de novembre de 2027 com a festes locals pel nucli de
  // Molló i els dies 5 d’agost i 13 d’octubre de 2027 pel nucli d’Espinavell. Segon. Trametre la
  // proposta de dates al Departament d’Empresa i Treball de la Generalitat de Catalunya als efectes
  // oportuns. Aprovat per 7 vots a favor
  mollo: {
    local: ["2027-07-12", "2027-11-22"],
    nuclei: [
      { name: "Espinavell", dates: ["2027-08-05", "2027-10-13"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l'Ajuntament del dia 25 de maig de 2026 (PLE2026000003)",
      ref: "Ajuntament de Molló, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1710770005/2026/47efe8c3-3404-4b8c-8d79-fac3a38bc4f7/tmp1932310845299668616PLE2026000003_ACTA.pdf",
    },
    act: { kind: "ple", date: "2026-05-25" },
    readOn: "2026-11-04",
  },
  // S'ACORDA Primer.- Proposar al Departament de Treball, Afers Socials i Famílies les dates de les
  // dues festes locals, retribuïdes i no recuperables per al proper any: 15 de gener de 2027
  // (divendres) 11 de novembre de 2027 (dijous)
  "la-figuera": {
    local: ["2027-01-15", "2027-11-11"],
    source: {
      name: "Acta del Ple, sessió de Ple extraordinari 3-2026",
      ref: "Ajuntament de la Figuera, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4305800000/2026/8912919e-b597-42ca-abad-4272bf4b38b7/02%20LFAX%20ACTA%20SESSI%d3%20PLE.pdf",
    },
    act: { kind: "ple", date: "2026-05-26" },
    readOn: "2026-11-04",
  },
  // Primer.- PROPOSAR al Departament d’Empresa i Treball de la Generalitat de Catalunya, que fixi
  // com a festes locals del municipi de Maçanet de la Selva a la publicació de les festes locals
  // corresponents a l’any 2027 les següents: ✓ 3 de maig de 2027 ✓ 10 d’agost de 2027
  "macanet-de-la-selva": {
    local: ["2027-05-03", "2027-08-10"],
    source: {
      name: "Acta del Ple PLE2026000007 (expedient X2026001968)",
      ref: "Ajuntament de Maçanet de la Selva, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1710300000/2026/9adc32a1-5b9f-4236-851b-71f3df12ac49/PLE2026000007.pdf",
    },
    act: { kind: "ple", date: "2026-05-25" },
    readOn: "2026-11-04",
  },
  // Primer. Fixar els dos dies de Festa Local per a l’any 2027, del municipi de Vallbona de les
  // Monges, de l’ EMD de Rocallaura i del nucli agregat de Montblanquet, en les dates següents:
  // Vallbona de les Monges ........ 17 de maig de 2027 i 20 de setembre de 2027. Rocallaura
  // ............................... 2 d’agost de 2027 i 7 de desembre de 2027. Montblanquet
  // ...........................2 d’agost de 2027 i 9 d’agost de 2027.
  "vallbona-de-les-monges": {
    local: ["2027-05-17", "2027-09-20"],
    nuclei: [
      { name: "Rocallaura (EMD)", dates: ["2027-08-02", "2027-12-07"] },
      { name: "Montblanquet", dates: ["2027-08-02", "2027-08-09"] },
    ],
    source: {
      name: "Acta PO 3-2026",
      ref: "Ajuntament de Vallbona de les Monges, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2523850006/2026/cc00d873-0002-4cbf-9916-c104eb9928f9/Acta%20PO%203-2026.pdf",
    },
    act: { kind: "ple", date: "2026-05-26" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar les següents festes locals per a l’any 2027: Ogern: 27 de setembre i 29 de
  // novembre Aguilar: 3 de maig i 7 de juny Castellnou: 29 d’abril i 11 d’octubre Altès: 17 de maig
  // i 6 de setembre La Clua: 20 de gener i 7 d’octubre Mirambell: 17 de maig i 6 d’octubre
  // Guardiola: 17 de maig i 6 d’octubre Bassella: 17 de maig i 30 d’agost [...] El Ple, per
  // unanimitat dels membres presents (3 de 5), aprova la proposta d'alcaldia
  bassella: {
    local: ["2027-05-17", "2027-08-30"],
    nuclei: [
      { name: "Ogern", dates: ["2027-09-27", "2027-11-29"] },
      { name: "Aguilar", dates: ["2027-05-03", "2027-06-07"] },
      { name: "Castellnou", dates: ["2027-04-29", "2027-10-11"] },
      { name: "Altès", dates: ["2027-05-17", "2027-09-06"] },
      { name: "La Clua", dates: ["2027-01-20", "2027-10-07"] },
      { name: "Mirambell", dates: ["2027-05-17", "2027-10-06"] },
      { name: "Guardiola", dates: ["2027-05-17", "2027-10-06"] },
    ],
    source: {
      name: "Acta del Ple 2026-0003 (sessió ordinària de 27 de maig de 2026)",
      ref: "Ajuntament de Bassella, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2504470005/2026/7d48363e-125d-40b9-9777-32ec552a5639/ACTA_DEL_PLE_2026-0003_27_05_2026_SO_Acta.pdf",
    },
    act: { kind: "ple", date: "2026-05-27" },
    readOn: "2026-11-04",
  },
  // ACORDS 1r.- APROVAR com a festes locals del municipi d’Albanyà per a l’any 2027 els dies
  // següents: • 29 de juny de 2027 • 30 de novembre de 2027
  albanya: {
    local: ["2027-06-29", "2027-11-30"],
    source: {
      name: "Acta Ple 28-05-2026 (expedient X2026000145)",
      ref: "Ajuntament d'Albanyà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1700310007/2026/9e485442-a937-4800-88c4-6da5d84122b0/ACTA%20PLE%2028-05-2026.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // Primer.- Establir com a festes locals del municipi d’Alcoletge per a l’any 2027, els dies 7 de
  // maig de 2027 i el dia 17 de setembre de 2027.
  alcoletge: {
    local: ["2027-05-07", "2027-09-17"],
    source: {
      name: "Acta de la sessió ordinària del ple de 28/05/2026 (PLN/2026/5)",
      ref: "Ajuntament d'Alcoletge, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2501220002/2026/45f9b0b3-5152-4d68-8f35-6e341e1f4630/20260603_Acta_Acta%20de%20la%20sessi%f3%20ordin%e0ri%20del%20ple%20de%2028_05_2026%20(2).pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // Primer. Proposar al Departament d’Empresa i Ocupació de la Generalitat, el dimecres 8 de
  // setembre i el dilluns 11 d’octubre, dies festius locals al municipi de les Preses, l’any 2027.
  // Segon. Comunicar-ho als Serveis Territorials a Girona del Departa ment d’Empresa i Treball.
  "les-preses": {
    local: ["2027-09-08", "2027-10-11"],
    source: {
      name: "Acta Ple 03/2026 de 27052026",
      ref: "Ajuntament de les Preses, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1713900000/2026/a630dd30-d279-4f5d-8813-d84a392ddd43/ACTA%20PLE%2003_2026%20DE%2027052026.pdf",
    },
    act: { kind: "ple", date: "2026-05-27" },
    readOn: "2026-11-04",
  },
  // Per unanimitat s'acorda fixar com a dies festius locals per al 2027 el 18 de gener i el 24
  // d'agost. Sotmès a votació, s'aprova per unanimitat (5 vots a favor de Junts per Alió i 2 vots a
  // favor d'En Comú Podem).
  alio: {
    local: ["2027-01-18", "2027-08-24"],
    source: {
      name: "Acta sessió ordinària del mes de maig de 2026 (acta 2026-0000006)",
      ref: "Ajuntament d'Alió, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4301080001/2026/ed6bc7fe-75e2-4495-ab8b-f75174d48d5f/20260527PO_6.pdf",
    },
    act: { kind: "ple", date: "2026-05-27" },
    readOn: "2026-11-04",
  },
  // festius locals per l’anualitat 2027 són els següents: - 29 d’octubre (Diada de Sant Narcís) - 8
  // de març [...] Per l’exposat, es proposa: Primer.- Aprovar els festius locals que es contenen en
  // la present proposta Segon.- Remetre la informació al departament d’empresa i treball de la
  // Generalitat de Catalunya abans del dia 31 d’agost de 2026
  "cervia-de-ter": {
    local: ["2027-03-08", "2027-10-29"],
    names: [null, "Diada de Sant Narcís"],
    source: {
      name: "Acta Ple ordinari 5/2026 (28 de maig de 2026)",
      ref: "Ajuntament de Cervià de Ter, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1705020002/2026/5e080023-8bf7-469d-98bd-24c8cb4fa74f/5-Acta%20Ple%20Maig%202026.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // Primer. Proposar amb caràcter def initiu els dies 14 de maig i 27 d’agost de 2027 com a f estes
  // locals del municipi de Vallf ogona de Ripollès. Segon. Comunicar el present acord als Serveis
  // Territorials a Girona del Departament d’Empresa i Treball
  "vallfogona-de-ripolles": {
    local: ["2027-05-14", "2027-08-27"],
    source: {
      name: "Acta Ple ordinari 27/05/26 (expedient X2026000176)",
      ref: "Ajuntament de Vallfogona de Ripollès, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1717070005/2026/7c4e23fe-8fc7-417d-8dd9-7c4c638b610e/ple_ordinari_27_05_26.pdf",
    },
    act: { kind: "ple", date: "2026-05-27" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar al Departament d’Empresa i Treball de la Generalitat de Catalunya, que
  // s’estableixin les dues festes locals del municipi d’Alguaire, següents: - el dia 28 de maig de
  // 2027 i - el dia 24 de setembre de 2027.
  alguaire: {
    local: ["2027-05-28", "2027-09-24"],
    source: {
      name: "Acta núm. 04/2026, sessió ordinària del Ple de 28 de maig de 2026 (diligenciada)",
      ref: "Ajuntament d'Alguaire, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2501690004/2026/f9734741-3c55-4fb6-8319-e3cdcce46f09/04%2028%2005%202026%20diligenciada.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // festes locals del municipi de Beuda per a l’any 2027, els dies: - 19 de març de 2027 - 17 de
  // setembre de 2027 SEGON. Comunicar aquest Acord als Serveis Territorials a Girona del Departament
  // d’Empresa i Treball [...] Vots a favor? Cinc
  beuda: {
    local: ["2027-03-19", "2027-09-17"],
    source: {
      name: "Acta Ple sessió ordinària 2026_04 (expedient X2026000150)",
      ref: "Ajuntament de Beuda, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1702160009/2026/aef5eddf-9055-488b-94cd-03550881ddae/ACTA%20PLE%20SESSIO%20ORDINARIA%202026_04.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // PRIMER.- Proposar com a festes laborals de l’any 2027 el dies següents: - Camarasa: 23 d’abril i
  // 11 d’octubre - Sant Llorenç de Montgai: 21 de maig i 10 d’agost - L’Ametlla del Montsec: 30 de
  // juliol i 9 de desembre - Fontllonga: 27 d’agost i 27 de setembre - Figuerola de Meià: 3 de maig
  // i 2 d’agost - La Baronia de Sant Oïsme: 23 d’abril i 11 d’octubre Posada a votació la proposta
  // s’aprova per unanimitat.
  camarasa: {
    local: ["2027-04-23", "2027-10-11"],
    nuclei: [
      { name: "Sant Llorenç de Montgai", dates: ["2027-05-21", "2027-08-10"] },
      { name: "L'Ametlla del Montsec", dates: ["2027-07-30", "2027-12-09"] },
      { name: "Fontllonga", dates: ["2027-08-27", "2027-09-27"] },
      { name: "Figuerola de Meià", dates: ["2027-05-03", "2027-08-02"] },
      { name: "La Baronia de Sant Oïsme", dates: ["2027-04-23", "2027-10-11"] },
    ],
    source: {
      name: "Acta de la sessió ordinària del Ple (PLE/2026/03)",
      ref: "Ajuntament de Camarasa, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2506210007/2026/69216def-2662-451e-b2b1-7fa95bbb6fd0/ACTA_PLE_AJUNT_0003_2026_SDP.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // ACORD: Primer.- APROVAR els dies de festa local de L’Armentera per al 2027, que s’escauran en
  // les dates següents: 1. Divendres 23 de juliol de 2027, diada de Sta. Cristina (24 de juliol). 2.
  // Divendres 12 de novembre de 2027, diada de St. Martí (11 de novembre). [...] Aprovat per 7 vots
  // a favor
  "l-armentera": {
    local: ["2027-07-23", "2027-11-12"],
    names: ["diada de Sta. Cristina", "diada de St. Martí"],
    source: {
      name: "Acta del Ple ordinari de maig de 2026 (PLE2026000002)",
      ref: "Ajuntament de l'Armentera, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1701180001/2026/7ec306cd-5172-429b-8107-78d69b9fb7ae/ACTA_PLE_ORDINARI_MAIG_2026.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // ACORD PRIMER. Proposar que es determinin com a inhàbils per al treball, retribuïts i no
  // recuperables, l'any 2026, amb el caràcter de festes locals, els dies: 30 de març de 2027, i 16
  // d’agost de 2027.
  agullana: {
    local: ["2027-03-30", "2027-08-16"],
    source: {
      name: "Acta Ple extraordinari 1 de juny de 2026 (núm. 3/2026)",
      ref: "Ajuntament d'Agullana, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1700100000/2026/4deab3f9-ef76-4f73-9223-6d12d70d1f04/01.%20ACTA%20PLE%20EXTRAORDINARI%201%20DE%20JUNY%20DE%202026.pdf",
    },
    act: { kind: "ple", date: "2026-06-01" },
    readOn: "2026-11-04",
  },
  // festes locals de Viladasens per a l’any 2027 les del dia 22 de gener, Sant Vicenç, i 14
  // d’octubre, Sant Calixt.
  viladasens: {
    local: ["2027-01-22", "2027-10-14"],
    names: ["Sant Vicenç", "Sant Calixt"],
    source: {
      name: "Acta 2/2026 corresponent a la sessió extraordinària del Ple de data 29 de maig de 2026",
      ref: "Ajuntament de Viladasens, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1721680001/2026/f1149bb9-09e0-41c7-bc82-6959f0c107f6/Acta%202%202026%20corresponent%20a%20la%20sessi%f3%20extraordin%e0ria%20del%20ple%20de%20data%2029%20de%20maig%20de%202026.pdf",
    },
    act: { kind: "ple", date: "2026-05-29" },
    readOn: "2026-11-04",
  },
  // el Ple, per unanimitat ACORDA: PRIMER. Fixar com a dies de festa local al municipi de Navès, per
  // a l’any 2027, les dates següents: 23 d’abril de 2027 (divendres) 20 de juliol de 2027 (dimarts)
  naves: {
    local: ["2027-04-23", "2027-07-20"],
    source: {
      name: "Acta 4-26 del Ple ordinari de 29-05-2026 (PLN/2026/4)",
      ref: "Ajuntament de Navès, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2514620002/2026/3ff64004-cf53-4572-b180-3af70a413fb7/Acta%204-26%20del%20Ple%20ordinari%20de%2029-05-2026.pdf",
    },
    act: { kind: "ple", date: "2026-05-29" },
    readOn: "2026-11-04",
  },
  // festes locals del municipi de Massanes per l’any 2027 en les dates següents: - 25 de març de
  // 2027 (Dijous Sant) - 2 d’agost de 2027 (Dilluns de la Festa Major) Segon.- NOTIFICAR aquest
  // acord al Departament d’Empresa i Treball de la Generalitat de Catalunya
  massanes: {
    local: ["2027-03-25", "2027-08-02"],
    names: ["Dijous Sant", "Dilluns de la Festa Major"],
    source: {
      name: "Acta de la sessió del Ple de l'Ajuntament del dia 28 de maig de 2026 (PLE2026000003)",
      ref: "Ajuntament de Massanes, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1710190004/2026/40a12381-55ad-44cd-835b-ea894beb38f4/PLE2026000003_ACTA%20maig%202026.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // S'ACORDA Primer.- Proposar al Departament d’Empresa i Treball les dates de les dues festes
  // locals, retribuïdes i no recuperables per al proper any: 17 de maig de 2027 5 de juliol de 2027
  "el-rourell": {
    local: ["2027-05-17", "2027-07-05"],
    source: {
      name: "Acta Ple ordinari del 2 de juny de 2026 (acta 2026-0000005)",
      ref: "Ajuntament del Rourell, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4313460009/2026/55074b5a-51f8-4a4e-a11f-589b7e5fda22/20260602PO_5.pdf",
    },
    act: { kind: "ple", date: "2026-06-02" },
    readOn: "2026-11-04",
  },
  // ACORDA Primer.- Fixar com dies festius locals dimarts 20 de juliol de 2027 i dimarts 14 de
  // setembre de 2027. Segon.- Notificar aquest acord al Departament d’Empresa i Treball. Sotmesa la
  // proposta s’aprova per unanimitat
  "la-riera-de-gaia": {
    local: ["2027-07-20", "2027-09-14"],
    source: {
      name: "Sessió ordinària del Ple de la Corporació de l'Ajuntament de la Riera de Gaià de 2 de juny de 2026",
      ref: "Ajuntament de la Riera de Gaià, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4312640003/2026/36a4d344-c558-4ed1-8684-4d195d4f6890/ACTA%20PLO%20020626.pdf",
    },
    act: { kind: "ple", date: "2026-06-02" },
    readOn: "2026-11-04",
  },
  // Primer. PROPOSAR que es determinin com a inhàbils per al treball, retribuïts i no recuperables,
  // l'any 2027, amb el caràcter de festes locals, els dies: - 3 de maig de 2027, Santa Creu. - 11 de
  // novembre de 2027, Sant Martí. Segon. REMETRE la proposta a Departament d’Empresa i Treball de la
  // Generalitat de Catalunya, per a la seva aprovació i publicació Aprovat per 7 vots a favor
  "el-far-d-emporda": {
    local: ["2027-05-03", "2027-11-11"],
    source: {
      name: "Acta del Ple de juny de 2026",
      ref: "Ajuntament del Far d'Empordà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1700590004/2026/56c8ad05-35c0-4c08-956c-72b88d69e009/juny.pdf",
    },
    act: { kind: "ple", date: "2026-06-04" },
    readOn: "2026-11-04",
  },
  // Primer: Aprovar les dues festes locals per a l’any 2027 10 de maig de 2027 11 d’octubre de 2027
  // Segon: Comunicar l’acord al Departament d’Empresa i Treball [...] La proposta s’aprova per 10
  // vots a favor
  albatarrec: {
    local: ["2027-05-10", "2027-10-11"],
    source: {
      name: "Acta del Ple 2026-0006, 2 de juny de 2026",
      ref: "Ajuntament d'Albatàrrec, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2500770005/2026/2b71f5b6-1789-4b7c-a9f7-621b4b9412bd/Comprimida_ACTA%20DEL%20PLE%202026-0006%20Acta%202%20de%20juny%20de%202026_compressed.pdf",
    },
    act: { kind: "ple", date: "2026-06-02" },
    readOn: "2026-11-04",
  },
  // Primer.- aprovar el calendari de festes locals per l’any 2027, essent festius locals el
  // divendres, 30 de juliol de 202 7, amb motiu de la festa major i el di marts, 7 de desembre de
  // 2027, amb motiu de la festa petita d’hivern.
  viladamat: {
    local: ["2027-07-30", "2027-12-07"],
    source: {
      name: "Acta del Ple PLE2026000006 (expedient X2026000210)",
      ref: "Ajuntament de Viladamat, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1721740003/2026/e8655502-26ff-4c77-aaff-12c59ca49c18/ACTA%20PLE20260000006.pdf",
    },
    act: { kind: "ple", date: "2026-06-03" },
    readOn: "2026-11-04",
  },
  // S'ACORDA Primer.- Fixar les dues festes locals del municipi del Pont d'Armentera per l'any 2027
  // siguin els dies 4 de gener i 22 juliol 2027. Segon.- Donar trasllat d'aquest acord al
  // Departament d’Empresa i Treball de la Generalitat de Catalunya, als efectes oportuns.
  "el-pont-d-armentera": {
    local: ["2027-01-04", "2027-07-22"],
    source: {
      name: "Acta del Ple (AOC acteca)",
      ref: "Ajuntament del Pont d'Armentera, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4311350006/2026/474aefab-eca5-4f0f-a596-187acfc17304/97C8DBF93FBA465E82788F739EDA833D.pdf",
    },
    act: { kind: "ple", date: "2026-06-04" },
    readOn: "2026-11-04",
  },
  // Primer.- Que els dos dies festiu locals per a l’anualitat 2027 per al nucli d’Escaló siguin el 3
  // de febrer i el 18 d’agost. I que per La Guingueta i la resta dels nuclis de població, els dos
  // dies festius locals per a l’anualitat 2027 siguin el 10 de febrer i el 7 de desembre. Segon.-
  // Trametre l’acord del Ple al Departament d’Empresa i Treball, abans del 31 d’agost de 2026.
  "la-guingueta-d-aneu": {
    local: ["2027-02-10", "2027-12-07"],
    nuclei: [
      { name: "Escaló", dates: ["2027-02-03", "2027-08-18"] },
    ],
    source: {
      name: "Esborrany d'acta del Ple",
      ref: "Ajuntament de la Guingueta d'Àneu, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2590310007/2026/7b9b658b-14cd-4c21-8942-851a37428b7b/20260717_Acta_Esborrany%20d%27acta%20(1).pdf",
    },
    act: { kind: "ple", date: "2026-06-03" },
    readOn: "2026-11-04",
  },
  // acorda: Primer.- Proposar, al Conseller d’Empresa i Treball de la Generalitat de Catalunya, com
  // a festes laborals de caràcter local, per a l’any 2027, al municipi de Massalcoreig els dies
  // següents: El 15 de gener, dia de la Festa Major de Sant Antoni El 24 d’agost, dia de la Festa
  // Major de Sant Bartomeu
  massalcoreig: {
    local: ["2027-01-15", "2027-08-24"],
    source: {
      name: "Acta del Ple 2026-0003, 08-06-2026",
      ref: "Ajuntament de Massalcoreig, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2513120002/2026/5c779e28-10de-4259-99ba-e1127e3220b5/2026-3%20Acta%20del%20Ple%202026-0003,%2008-06-2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-08" },
    readOn: "2026-11-04",
  },
  // ACORDA: PRIMER.- Proposar com a dues festes local s, a incloure en el calendari laboral per a
  // l’any 2027, el 5 de febrer i el 14 de maig de 2027.
  "pinell-de-solsones": {
    local: ["2027-02-05", "2027-05-14"],
    source: {
      name: "Acta núm. 5 de 9 de juny de 2026 (extraordinari)",
      ref: "Ajuntament de Pinell de Solsonès, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2516670005/2026/0ff6d591-baf4-4686-8095-d2222766c0af/N%fam.%205%20de%209%20de%20juny%20de%202026%20extraordinari.pdf",
    },
    act: { kind: "ple", date: "2026-06-09" },
    readOn: "2026-11-04",
  },
  // S'ACORDA PRIMER.- Fixar com a festes locals per a l’any 2027 les següents: * 15 de gener * 19 de
  // gener SEGON.- Traslladar certificació del present acord al/la directora/a dels Serveis
  // Territorials de les Terres de l’Ebre del d'Empresa i Treball
  "el-perello": {
    local: ["2027-01-15", "2027-01-19"],
    source: {
      name: "Acta del Ple 28.05.26",
      ref: "Ajuntament del Perelló, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4310420002/2026/226afbb4-fdbf-4813-b2aa-a95e2ca9906e/02.%20PLE%2028.05.26.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // S'ACORDA Primer.- Fixar les dues festes locals del municipi de Figuerola del Camp per l'any 2027
  // siguin els dies 25 de març i 26 de juliol 2027. Segon.- Donar trasllat d'aquest acord al
  // Departament d’Empresa i Treball de la Generalitat de Catalunya, als efectes oportuns.
  "figuerola-del-camp": {
    local: ["2027-03-25", "2027-07-26"],
    source: {
      name: "Acta del Ple (AOC acteca)",
      ref: "Ajuntament de Figuerola del Camp, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4305930008/2026/0fe525ed-0fc2-48ff-b5de-802da61f5e0c/D9BB41D32F424A5EB325A1ADA8CB5D70.pdf",
    },
    act: { kind: "ple", date: "2026-06-05" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar que es determini com a inhàbils per al treball, retribuïts i no recuperables,
  // l’any 2027, amb el caràcter de festes locals, els dies: · Dia 20 de gener de 2027 · Dia 26 de
  // juliol de 2027 Segon.- Trametre l’anterior acord als Serveis Territorials a Lleida del
  // Departament d’ Empresa i Treball
  belianes: {
    local: ["2027-01-20", "2027-07-26"],
    source: {
      name: "Acta Ple extraordinari 03/2026 de 09/06/2026 (esborrany)",
      ref: "Ajuntament de Belianes, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2504630008/2026/ecc5218f-ea42-4276-8614-918cdbd6a205/ACTA%20PLE_EXTRAORD%2003_2026%20DE%2009062026%20ESBORRANY.pdf",
    },
    act: { kind: "ple", date: "2026-06-09" },
    readOn: "2026-11-04",
  },
  // PRIMER. Fixar com a festius locals per l’any 2027 del municipi de Tiurana: - El dimarts 9 de
  // febrer - El dimecres 8 de setembre [...] la proposta es sotmet a votació, la qual és aprovada
  // per unanimitat dels membres assistents
  tiurana: {
    local: ["2027-02-09", "2027-09-08"],
    source: {
      name: "Acta Ple 2026.006, sessió ordinària 12/06/2026",
      ref: "Ajuntament de Tiurana, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2522280001/2026/2d6217d5-a3df-4ed5-a6c3-5bc0f2b873b4/ACTA%20PLE%202026.006%20SESSIO%20ORDINARIA%2012062026.pdf",
    },
    act: { kind: "ple", date: "2026-06-12" },
    readOn: "2026-11-04",
  },
  // Primer. Proposar al Departament d’Empresa i Treball les dates de les dues festes locals de
  // Barbens, retribuïdes i no recuperables per al proper any 2027: - Divendres, 13 d’agost de 2027 -
  // Dilluns, 8 de novembre de 2027 [...] Votacions: Vots a favor: (7)
  barbens: {
    local: ["2027-08-13", "2027-11-08"],
    source: {
      name: "Acta del Ple 2026-0005",
      ref: "Ajuntament de Barbens, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2504110007/2026/5964bad4-a444-47ff-8ded-7b81d360fe30/20260611_Acta_ACTA%20DEL%20PLE%202026-0005-4_redacted.pdf",
    },
    act: { kind: "ple", date: "2026-06-10" },
    readOn: "2026-11-04",
  },
  // ACORDA Primer. - Declarar les festes locals per l’any 2027 els dies 18 de gener (Sant Antoni), i
  // 31 de maig (festa major). Segon.- Comunicar el present acord al Departament de Treball , Afers
  // socials i Famílies, de la Generalitat.
  prullans: {
    local: ["2027-01-18", "2027-05-31"],
    source: {
      name: "Sessió núm. 3-2026 de 04-06-2026",
      ref: "Ajuntament de Prullans, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2517900000/2026/06a47d1d-56c7-428e-bec6-f27515b107cc/20261016_Uns%20altres_sessi%f3%20n%fam.%203-2026%20de%2004-06-2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-04" },
    readOn: "2026-11-04",
  },
  // ACORDA Primer.- Fixar com a Festes Locals per a l’any 2027 al municipi de Vilanova de Bellpuig,
  // les següents: 1ª Festa local 29 de juny (dimarts), festa de Sant Pere. 2ª Festa local el primer
  // divendres dia 3 de setembre de 2027, primer dia de la Festa Major.
  "vilanova-de-bellpuig": {
    local: ["2027-06-29", "2027-09-03"],
    source: {
      name: "Acta Ple 05/2026, 12.06.2026 ordinari",
      ref: "Ajuntament de Vilanova de Bellpuig, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2524830008/2026/55855ada-838d-439c-b661-b7ac49d8fc2b/05%202026%20ACTA%20PLE%2012.06.2026%20Ordinari.pdf",
    },
    act: { kind: "ple", date: "2026-06-12" },
    readOn: "2026-11-04",
  },
  // S'ACORDA Primer.- Establir com a festes locals del municipi de Salomó per a l’any 2027 les
  // següents: - 03/05/2027 - 16/08/2027 Segon.- Notificar el present acord al Departament de
  // Treball, Afers Socials i Famílies de la Generalitat de Catalunya.
  salomo: {
    local: ["2027-05-03", "2027-08-16"],
    source: {
      name: "Acta del Ple (AOC acteca)",
      ref: "Ajuntament de Salomó, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4313590004/2026/cdea8f1e-1501-49aa-8ba5-d21d0a241239/02%20Acta%20Ple.pdf",
    },
    act: { kind: "ple", date: "2026-06-04" },
    readOn: "2026-11-04",
  },
  // ACORD Primer.- Determinar com a festes locals del municipi de Juià per a l’any 2027 els dies
  // següents: • 29 d’octubre de 2027 • 6 de setembre de 2027 [...] Sotmesa la proposta a votació,
  // aquesta queda aprovada per unanimitat dels membres presents.
  juia: {
    local: ["2027-09-06", "2027-10-29"],
    source: {
      name: "Acta 16 juny 2026",
      ref: "Ajuntament de Juià, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1708710007/2026/c45ad437-556c-4a95-a231-03497b25fbf6/ACTA_16%20juny.pdf",
    },
    act: { kind: "ple", date: "2026-06-16" },
    readOn: "2026-11-04",
  },
  // PRIMER.- Designar les dues festes locals per a l’any 2027: Dia 3 de febrer Dia 19 de març
  // SEGON.- Comunicar el present acord als Serveis Territorials a Lleida del Departament d’ Empresa
  // i Treball
  alcano: {
    local: ["2027-02-03", "2027-03-19"],
    source: {
      name: "Acta del Ple 17/06/2026",
      ref: "Ajuntament d'Alcanó, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2501000000/2026/2d6599f1-20fd-4967-88d3-9180e59d43ee/20260617_Acta_PLE.pdf",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // ACORDA: Primer. Proposar com a dues festes locals, a incloure en el calendari laboral de l’any
  // 2027, les següents: • LLADURS: 14 de maig i 9 de setembre . • TORRENTS: 14 de maig i 9 de gener.
  // • TIMONEDA: 14 de maig i 10 de desembre. • LA LLENA: 14 de maig i 29 de novembre.
  lladurs: {
    local: ["2027-05-14", "2027-09-09"],
    nuclei: [
      { name: "Torrents", dates: ["2027-01-09", "2027-05-14"] },
      { name: "Timoneda", dates: ["2027-05-14", "2027-12-10"] },
      { name: "La Llena", dates: ["2027-05-14", "2027-11-29"] },
    ],
    source: {
      name: "Acta 04-2026, Ple ordinari 17-06-26",
      ref: "Ajuntament de Lladurs, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2512400000/2026/1fea79e9-11cd-4c7b-80e9-d8ff0b781fe5/Acta%2004-2026.%20Ple%20ordinari%2017-06-26.pdf",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // PRIMER. PROPOSAR com a festes locals del municipi d’Albinyana per a l’any 2027 els dies
  // següents: - El divendres 16 de juliol de 2027. - El dimarts 24 d’agost de 2027. SEGON. NOTIFICAR
  // el present acord al Departament d’Empresa i Treball, als efectes corresponents.
  albinyana: {
    local: ["2027-07-16", "2027-08-24"],
    source: {
      name: "Acta del Ple 2026-0004",
      ref: "Ajuntament d'Albinyana, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4300220002/2026/3144d4ba-6a23-49b5-a043-5ccf8d06386c/20261012_Acta_ACTA%20DEL%20PLE%202026-0004.pdf",
    },
    act: { kind: "ple", date: "2026-06-15" },
    readOn: "2026-11-04",
  },
  // Primer.- Elegir com a dies festius del municipi de la Molsosa per a l’any 2027 el 20 de gener i
  // el 14 de maig. Segon.- Notificar aquest acord al Departament d’Empresa i Treball.
  "la-molsosa": {
    local: ["2027-01-20", "2027-05-14"],
    source: {
      name: "Acta del Ple 5-2026",
      ref: "Ajuntament de la Molsosa, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2513640003/2026/c9de2b02-b6d4-47c8-bb58-029461784f04/5-2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // Primer.- ESTABLIR els dies 3 de febrer i 27 d’agost com a festes locals per a l’any 2027.
  // Segon.- COMUNICAR aquest acord al Departament d’Empresa i Treball.
  "el-palau-d-anglesola": {
    local: ["2027-02-03", "2027-08-27"],
    source: {
      name: "Acta Ple ordinari (25-6-26)",
      ref: "Ajuntament del Palau d'Anglesola, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2515810007/2026/68724801-3634-44bd-bbd4-4f72fe597029/Acta%20Ple%20ordinari%20(25-6-26).pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // ACORD Primer: Proposar les següents festes locals al municipi d’Almenar per a l’any 2027: [...]
  // 20 de gener, dimecres, Sant Sebastià 20 de setembre, dilluns, Fira de setembre
  almenar: {
    local: ["2027-01-20", "2027-09-20"],
    source: {
      name: "Esborrany d'acta del Ple",
      ref: "Ajuntament d'Almenar, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2502150006/2026/a76020b1-19af-4e0a-89c7-6d5e17478fd8/20260702_Acta_Esborrany%20d%27acta.pdf",
    },
    act: { kind: "ple", date: "2026-06-29" },
    readOn: "2026-11-04",
  },
  // Primer: Fixar com a festes locals els següents dies: - 3 de febrer de 2027. - 23 d’agost de
  // 2027. Segon: Comunicar aquest acord al Departament de Treball
  "la-floresta": {
    local: ["2027-02-03", "2027-08-23"],
    source: {
      name: "Acta extraordinària 26 de juny",
      ref: "Ajuntament de la Floresta, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2509250006/2026/33edadc3-0fe2-43fd-a803-79e663519ba7/Acta%20extraordin%e0ria%2026%20de%20juny.pdf",
    },
    act: { kind: "ple", date: "2026-06-26" },
    readOn: "2026-11-04",
  },
  // PRIMER. - PROPOSAR les següents dues festes locals del terme municipal de Capmany per a l’any
  // 2027: 1.- Dimarts de Carnaval, dia 9 de febrer de 2027. 2.- Dilluns de Pentecostes (segona
  // Pasqua), dia 17 de maig de 2027.
  capmany: {
    local: ["2027-02-09", "2027-05-17"],
    source: {
      name: "Acta Ple ordinari 29 06 2026",
      ref: "Ajuntament de Capmany, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1704270005/2026/20bdcbbe-aff9-4b86-80a2-b59ff6569af1/6%20Acta%20Ple%20Ordinari%2029%2006%202026.pdf",
    },
    act: { kind: "ple", date: "2026-06-29" },
    readOn: "2026-11-04",
  },
  // S'ACORDA Primer.- Proposar que les dues festes locals de Capçanes per l'any 2027 siguin els dies
  // 30 de juliol i 2 d'agost. Segon.- Notificar aquesta resolució mitjançant tramesa a l’Eacat, al
  // Departament d’Empresa i Treball de la Generalitat de Catalunya.
  capcanes: {
    local: ["2027-07-30", "2027-08-02"],
    source: {
      name: "Acta Ple extraordinari del dia 29/06/2026",
      ref: "Ajuntament de Capçanes, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4304020002/2026/2205f567-b15e-4470-8998-c76d6b748ac0/Acta%20Ple%20extraordinari%20del%20dia%2029_06_2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-29" },
    readOn: "2026-11-04",
  },
  // ACORD Primer. Proposar com a festes locals a Castellnou de Seana per a l´any 2027, el dia 5 de
  // febrer i el dia 13 de setembre. Segon. Traslladar-ho al Departament d´Empresa i Treball, Serveis
  // Territorials a Lleida. Es sotmeten a votació i s´aproven amb el vot emés en sentit afirmatiu per
  // part de tots els regidors.
  "castellnou-de-seana": {
    local: ["2027-02-05", "2027-09-13"],
    source: {
      name: "Acta Ple 05-26",
      ref: "Ajuntament de Castellnou de Seana, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2506800000/2026/432f80d2-8d67-4818-b569-6aebfae0ea11/ActaPle05-26.pdf",
    },
    act: { kind: "ple", date: "2026-06-30" },
    readOn: "2026-11-04",
  },
  // ACORDA: Primer. Proposar les dues dates següents com a festes locals del municipi d’ Horta de
  // Sant Joan per a l’any 2027. •Dia 18 de març de 2027 •Dia 8 de setembre de 2027
  "horta-de-sant-joan": {
    local: ["2027-03-18", "2027-09-08"],
    source: {
      name: "Acta del Ple 2026-0004",
      ref: "Ajuntament d'Horta de Sant Joan, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4307120002/2026/bf360c01-49c4-445f-9d02-341d6b9984e8/ACTA_PLE_2026-0004.pdf",
    },
    act: { kind: "ple", date: "2026-07-02" },
    readOn: "2026-11-04",
  },
  // Primer.- Aprovar els dies de Festes Locals de Sant Climent Sescebes pel 2027: dilluns 30 d’agost
  // de 2027 (Sant Joan Degollat) i dimarts 23 novembre de 2027 (Sant Climent). [...] Aprovat per 6
  // vots a favor
  "sant-climent-sescebes": {
    local: ["2027-08-30", "2027-11-23"],
    source: {
      name: "Acta del Ple PLE2026000004",
      ref: "Ajuntament de Sant Climent Sescebes, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1715820002/2026/23141cc0-7b6c-4ee0-a14d-d9073767ebf0/PLE2026000004_ACTA.pdf",
    },
    act: { kind: "ple", date: "2026-07-07" },
    readOn: "2026-11-04",
  },
  // PRIMER.- APROVAR com a festes locals de Montagut i Oix per l’any 2027 els dies següents: -
  // Dilluns 3 de maig de 2027 - Dimarts 29 de juny de 2027 [...] Aprovat per 6 vots a favor
  "montagut-i-oix": {
    local: ["2027-05-03", "2027-06-29"],
    source: {
      name: "Acta Ple de 06072026",
      ref: "Ajuntament de Montagut i Oix, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1710960009/2026/3548dbf8-21d9-4bb8-9253-8dbd76603a30/ACTA%20PLE%20DE%2006072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-06" },
    readOn: "2026-11-04",
  },
  // Primer.- Aprovar com a dies de festa local per el proper 2027 els dies 17 de maig i 20 de
  // setembre. Segon.- Notificar aquesta proposta al Departament d’Empresa i Treball de la
  // Generalitat de Catalunya. VOTACIO Aprovat per unanimitat.
  "castellfollit-de-la-roca": {
    local: ["2027-05-17", "2027-09-20"],
    source: {
      name: "Acta del Ple PLE2026000004",
      ref: "Ajuntament de Castellfollit de la Roca, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1704640003/2026/cadec4a5-e27c-499f-aff8-e7c5ddb18fc4/PLE2026000004_ACTA.pdf",
    },
    act: { kind: "ple", date: "2026-07-15" },
    readOn: "2026-11-04",
  },
  // Primer.- Aprovar les dues festes locals del municipi de Vall-llobrega els dies: - 25 de gener de
  // 2027 - 27 de setembre de 2027 Segon.- Notificar aquest Acord al Departament d’Empresa i Treball
  // de la Generalitat de Catalunya per a la seva publicació en el calendari de les festes locals a
  // Catalunya per a l’any 2027. Aprovat per 7 vots a favor
  "vall-llobrega": {
    local: ["2027-01-25", "2027-09-27"],
    source: {
      name: "Acta del Ple 20260714",
      ref: "Ajuntament de Vall-llobrega, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1720950006/2026/39760f4d-6697-4280-9329-e93ae4503c56/ACTA_PLE20260714.pdf",
    },
    act: { kind: "ple", date: "2026-07-14" },
    readOn: "2026-11-04",
  },
  // S’aprova per unanimitat dels assistents al Ple, fixar els següents dies festius locals pel 2027
  // per al municipi d’Estaràs: Ferran 17 de maig i 28 de desembre de 2027; Alta-Riba el 23 d’abril i
  // el 7 de juliol de 2027, Vergós Guerrejat el 22 de juliol i el 9 d’agost de 2027; Estaràs el 11
  // de gener i el 23 d’agost de 2027 i Gàver el 12 de maig i el 23 d’agost de 2027.
  estaras: {
    local: ["2027-01-11", "2027-08-23"],
    nuclei: [
      { name: "Ferran", dates: ["2027-05-17", "2027-12-28"] },
      { name: "Alta-Riba", dates: ["2027-04-23", "2027-07-07"] },
      { name: "Vergós Guerrejat", dates: ["2027-07-22", "2027-08-09"] },
      { name: "Gàver", dates: ["2027-05-12", "2027-08-23"] },
    ],
    source: {
      name: "Acta del Ple 2026-0004",
      ref: "Ajuntament d'Estaràs, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2508510007/2026/ac61d59e-963e-44df-af9f-788054cd778e/ACTA%20DEL%20PLE%202026-0004.pdf",
    },
    act: { kind: "ple", date: "2026-07-20" },
    readOn: "2026-11-04",
  },
  // acorda: PRIMER.- Fixar per a l’any 2027 com a festes laborals locals el dijous 9 i divendres 10
  // de setembre de 2027, Festa Major de Castelldans. SEGON.- Donar trasllat d’aquest acord al
  // Departament d’Empresa i Treball de la Generalitat de Catalunya.
  castelldans: {
    local: ["2027-09-09", "2027-09-10"],
    source: {
      name: "Acta Ple ordinari 04 (signada)",
      ref: "Ajuntament de Castelldans, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2506740003/2026/be728a8c-fb63-4da0-be95-193c6f739cb1/20260727_04_PO_Acta_signat.pdf",
    },
    act: { kind: "ple", date: "2026-07-27" },
    readOn: "2026-11-04",
  },
  // ACORDA: PRIMER.- Fixar com a festes locals pel municipi de Riudellots de la Selva per al proper
  // any 2027 els dies 29 de setembre i 29 d’octubre. [...] Aprovat per 11 vots a favor
  "riudellots-de-la-selva": {
    local: ["2027-09-29", "2027-10-29"],
    source: {
      name: "Acta Ple 20 juliol 2026",
      ref: "Ajuntament de Riudellots de la Selva, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1715010007/2026/3b16c204-5bb8-4b3a-9dc7-78dd7c5b4902/ACTA%20PLE%2020%20JULIOL%202026%20A.pdf",
    },
    act: { kind: "ple", date: "2026-07-20" },
    readOn: "2026-11-04",
  },
  // PRIMER.- ESTABLIR com a dies de festa local al municipi d’Amer pel proper any 2027 els dies
  // següents: - Divendres dels Dolors, 19 de març, divendres. - Festa Major, 16 d’agost, dilluns
  // [...] Aprovat per 11 vots a favor
  amer: {
    local: ["2027-03-19", "2027-08-16"],
    source: {
      name: "Acta Ple 22/07/2026",
      ref: "Ajuntament d'Amer, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1700780001/2026/83bb2128-678c-4d92-9db7-57c3de310a20/PLE_22_07_2026.pdf",
    },
    act: { kind: "ple", date: "2026-07-22" },
    readOn: "2026-11-04",
  },
  // Primer. Fixar com a festes locals del municipi de Guimerà per a l’any 2027 els dies 16 de gener
  // i 24 d’abril de 2027. Segon. Comunicar aquest acord al Departament d’Empresa i Treball. Acord
  // aprovat per unanimitat dels assitents.
  guimera: {
    local: ["2027-01-16", "2027-04-24"],
    source: {
      name: "Acta del Ple de juliol de 2026",
      ref: "Ajuntament de Guimerà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2510950006/2026/2808434a-d0cc-4343-983d-959050fa3d9e/acta%20juliol.pdf",
    },
    act: { kind: "ple", date: "2026-07-29" },
    readOn: "2026-11-04",
  },
  // S'ACORDA Primer.- Proposar, com a Festes Locals d’Aldover per a l’any 2027, les següents:
  // Divendres, 23 d’abril de 2027 Dimecres, 8 de setembre de 2027
  aldover: {
    local: ["2027-04-23", "2027-09-08"],
    source: {
      name: "Ple 2026-06 (sessió ordinària, 30.07.2026)",
      ref: "Ajuntament d'Aldover, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4300690004/2026/13105ced-892d-48c6-90bc-a7af87cf4a2c/Ple%202026-06%20(Sessi%f3%20ordin%e0ria,%2030.07.2026).pdf",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-11-04",
  },
  // Primer. Proposar el 6 d’agost (Festa Major de Pals) i el 6 de setembre (Festa Major dels Masos
  // de Pals) de 2027 com a festes locals del municipi de Pals
  pals: {
    local: ["2027-08-06", "2027-09-06"],
    source: {
      name: "Acta Ple juliol 2026",
      ref: "Ajuntament de Pals, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1712410007/2026/ecd7f33c-d341-44be-a076-a66af38690e0/ACTAPLEJULIOL.pdf",
    },
    act: { kind: "ple", date: "2026-07-23" },
    readOn: "2026-11-04",
  },
  // S'ACORDA [...] Primer.- Proposar al Departament de Treball, Afers Socials i Famílies [...] les
  // dates de les dues festes locals, retribuïdes i no recuperables per al proper any: - 8 de febrer
  // de 2027 (dilluns) - 15 de novembre de 2027 (dilluns)
  "l-aleixar": {
    local: ["2027-02-08", "2027-11-15"],
    source: {
      name: "Acta 6/2026 del Ple",
      ref: "Ajuntament de l'Aleixar, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4300750006/2026/7ab53f2a-aa39-4665-8463-a377c39a0dac/Acta_6_4300750006_2026_0000738%20(1).pdf",
    },
    act: { kind: "ple", date: "2026-08-28" },
    readOn: "2026-11-04",
  },
  // 2. Expedient 4040/2026. Proposar l’establiment de les Festes Locals de la vila 2027. Favorable
  // Tipus de votació: Unanimitat/Assentiment [...] PRIMER. Proposar que es determinin com a inhàbils
  // per al treball, retribuïts i no recuperables, l'any 2027, amb el caràcter de festes locals, els
  // dies: Dilluns 25 de gener de 2027 (Festa Major d'Hivern) Dilluns 26 de juliol de 2027 (Festa
  // Major d'Estiu) [...] Resultat de la votació de l’ACORD: Aprovat per unanimitat dels assistents:
  // 17 vots a favor
  "parets-del-valles": {
    local: ["2027-01-25", "2027-07-26"],
    names: ["Festa Major d'Hivern", "Festa Major d'Estiu"],
    source: {
      name: "Acta del Ple extraordinari de 25 de juny de 2026 (ELPLE/2026/10, acta núm. 2026-0009), punt 2: Expedient 4040/2026. Proposar l'establiment de les Festes Locals de la vila 2027",
      ref: "Ajuntament de Parets del Vallès, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/815930008/2026/1c1f53f4-f4c1-4fc0-8a7b-c49a81e62ca9/ACTA%20DEL%20PLE%202026-0009%20%5BActa%20Ple%20de%20l%27Ajuntament%20extraordinari%2025-06-2026%5D.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // 1.8.- Dictamen relatiu a l’aprovació de les festes locals per a l’any 2027. (exp.
  // 1492-3438/2026).- [...] ACORDS: 1. Proposar al Departament d’Empresa i Treball de la Generalitat
  // de Catalunya que fixi com a festes locals del municipi per a l’any 2027, les que tot seguit
  // s'esmenten: ✓ 23 d’abril (Sant Jordi) ✓ 17 de maig (Segona Pasqua) [...] Sotmesa la proposta a
  // votació, aquesta s’aprova per unanimitat dels disset membres assistents.
  montgat: {
    local: ["2027-04-23", "2027-05-17"],
    names: ["Sant Jordi", "Segona Pasqua"],
    source: {
      name: "Acta de sessió del Ple de l'Ajuntament de Montgat núm. 6/2026, ordinari de 25 de juny de 2026, punt 1.8: Dictamen relatiu a l'aprovació de les festes locals per a l'any 2027 (exp. 1492-3438/2026)",
      ref: "Ajuntament de Montgat, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/812650006/2026/8a5f9008-c2d9-4d61-94c8-de96eb3abbd0/Esborrany%20acta%20Ple%206-2026%20ordinari%20de%20data%2025-6-2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // 19.- PROPOSTA D'ACORD D'APROVACIÓ DE LES FESTES LOCALS ANY 2027 [...] EL PLE ACORDA: PRIMER.-
  // Proposar com a festes locals del municipi de Porqueres per al proper any 2027, el dilluns dia 17
  // de maig i el dimarts dia 7 de desembre. [...] Sotmesa la proposta a votació és aprovada per
  // unanimitat amb 11 vots a favor
  porqueres: {
    local: ["2027-05-17", "2027-12-07"],
    source: {
      name: "Acta de la sessió del Ple de l'Ajuntament del dia 1 de juny de 2026 (PLE2026000006), punt 19: Proposta d'acord d'aprovació de les festes locals any 2027",
      ref: "Ajuntament de Porqueres, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1713710007/2026/d6f79e6c-5648-4f37-97a6-5e83307f00df/ACTA%20PLE%2001062026.pdf",
    },
    act: { kind: "ple", date: "2026-06-01" },
    readOn: "2026-11-04",
  },
  // 6. Aprovació, si escau, de les Festes Locals per a l'any 2027 [...] Primer.- Aprovar com a
  // festes locals de Sant Quintí de Mediona, per a l’any 2027, les dates següents: Dilluns 3 de maig
  // de 2027 Divendres 29 d’octubre de 2027 [...] Sotmesa la proposta a debat i a posterior votació
  // resulta aprovada per unanimitat dels assistents amb el següent resultat: 10 vots a favor
  "sant-quinti-de-mediona": {
    local: ["2027-05-03", "2027-10-29"],
    source: {
      name: "Acta de la sessió del Ple núm. 4, ordinària de 22 de juliol de 2026, punt 6: Aprovació, si escau, de les Festes Locals per a l'any 2027 (exp. 2026/1492/913)",
      ref: "Ajuntament de Sant Quintí de Mediona, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/823620002/2026/8000ee7a-18fb-41e3-8f00-041d84d33b9b/4%20ACTA%20PLE%20ORD%2022-7-26.pdf",
    },
    act: { kind: "ple", date: "2026-07-22" },
    readOn: "2026-11-04",
  },
  // 6.0.- Proposta al Departament d’Empresa i Treball, per a la declaració dels dies 20 de gener i 8
  // de setembre de 2027 com a festius amb caràcter local.- Aprovació.- [...] Primer.- Proposar al
  // Departament d’Empresa i Treball la declaració dels dies 20 de gener i 8 de setembre de 2027 com
  // a festius amb caràcter local. [...] Aprovat per 4 vots a favor (Jordi Carreras Llorens, Miguel
  // -Ángel Castaño Castaño, Josep Borràs Pagès, Concepción Molons De San Román)
  "pont-de-molins": {
    local: ["2027-01-20", "2027-09-08"],
    source: {
      name: "Acta de la sessió del Ple de l'Ajuntament del dia 9 de juliol de 2026 (PLE2026000005), punt 6.0: Proposta al Departament d'Empresa i Treball, per a la declaració dels dies 20 de gener i 8 de setembre de 2027 com a festius amb caràcter local",
      ref: "Ajuntament de Pont de Molins, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1713520002/2026/bb314c3f-12b7-4994-bb57-5e2dd74d7799/PLE2026000005_ACTA.pdf",
    },
    act: { kind: "ple", date: "2026-07-09" },
    readOn: "2026-11-04",
  },
  // 12. FIXACIÓ DE LES FESTES LOCALS DE MARTORELLES PER A L'ANY 2027, EXPEDIENT 2026/1820 [...] El
  // Ple de l’Ajuntament, prèvia deliberació i per unanimitat, adopta els següents ACORDS: PRIMER.
  // Fixar els dies 30 d’abril i 10 de setembre, com a festes locals de Martorelles per a l’any 2027.
  martorelles: {
    local: ["2027-04-30", "2027-09-10"],
    source: {
      name: "Acta de la sessió ordinària del Ple municipal del dia 18 de maig de 2026 (acta núm. 4/2026), punt 12: Fixació de les festes locals de Martorelles per a l'any 2027, expedient 2026/1820",
      ref: "Ajuntament de Martorelles, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/811540003/2026/f8435e36-2f1d-431a-ad29-21de250ae1ff/ACTA%20N%daM.%204-2026.pdf",
    },
    act: { kind: "ple", date: "2026-05-18" },
    readOn: "2026-11-04",
  },
  // 9.- APROVAR DE LES FESTES LOCALS PER L’ANY 2027. [...] PRIMER.- Aprovar les dues festes locals
  // per a l’any 2027 pels respectius nuclis de població del municipi de Subirats, i que
  // s’especifiquen a continuació: - Sant Pau d’Ordal 1 febrer i 25 de març - Can Rossell 5 d’abril i
  // 25 de març - El Rebato i Torre-Ramona 5 d’abril i 25 de març - Els Casots 12 d’abril i 25 de
  // març - Can Cartró 3 de maig i 25 de març - Lavern 28 de juny i 25 de març - Can Batista 5 de
  // juliol i 25 de març - Urb. Casablanca 5 de juliol i 25 de març - Urb. Can Rossell 26 de juliol i
  // 25 de març - Ordal 2 d’agost i 25 de març - Ca l’Avi 25 d’octubre i 25 de març - Can Bas 28 de
  // juny i 25 de març - Cantallops 1 febrer i 25 de març - El Pago 1 febrer i 25 de març - Urb.
  // Muntanya Rodona 1 febrer i 25 de març [...] s’aprova per UNANIMITAT DE TOTS ELS GRUPS.
  subirats: {
    local: ["2027-02-01", "2027-03-25"],
    nuclei: [
      { name: "Sant Pau d'Ordal", dates: ["2027-02-01", "2027-03-25"] },
      { name: "Can Rossell", dates: ["2027-03-25", "2027-04-05"] },
      { name: "El Rebato i Torre-Ramona", dates: ["2027-03-25", "2027-04-05"] },
      { name: "Els Casots", dates: ["2027-03-25", "2027-04-12"] },
      { name: "Can Cartró", dates: ["2027-03-25", "2027-05-03"] },
      { name: "Lavern", dates: ["2027-03-25", "2027-06-28"] },
      { name: "Can Batista", dates: ["2027-03-25", "2027-07-05"] },
      { name: "Urb. Casablanca", dates: ["2027-03-25", "2027-07-05"] },
      { name: "Urb. Can Rossell", dates: ["2027-03-25", "2027-07-26"] },
      { name: "Ordal", dates: ["2027-03-25", "2027-08-02"] },
      { name: "Ca l'Avi", dates: ["2027-03-25", "2027-10-25"] },
      { name: "Can Bas", dates: ["2027-03-25", "2027-06-28"] },
      { name: "Cantallops", dates: ["2027-02-01", "2027-03-25"] },
      { name: "El Pago", dates: ["2027-02-01", "2027-03-25"] },
      { name: "Urb. Muntanya Rodona", dates: ["2027-02-01", "2027-03-25"] },
    ],
    source: {
      name: "Acta (esborrany) de la sessió ordinària del Ple de l'Ajuntament de Subirats del dia 8 de juliol de 2026 (Núm. 9/2026; acta núm. 2026-0014), punt 9: Aprovar de les festes locals per l'any 2027",
      ref: "Ajuntament de Subirats, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/827320002/2026/fa891158-ceb4-4adb-99af-2ef198b6552d/4_20261001_Acta_Acta%20ple_ACTA%20DEL%20PLE%202026-0014%20%5BESBORRANY%20ACTA%20PLE%20ORDINARI%208%20DE%20JULIOL%5D%20(2).pdf",
    },
    act: { kind: "ple", date: "2026-07-08" },
    readOn: "2026-11-04",
  },
  // Expedient 1058/2026. Aprovar les festes locals de l'Ampolla per al 2027 Favorable Tipus de
  // votació: Unanimitat/Assentiment [...] Es proposa: Primer.- Fixar les dues festes locals de
  // l'Ampolla per al 2027: 16 de juliol i 15 de novembre. Segon.- Notificar el present acord al
  // Serveis Territorials a les Terres de l'Ebre del Departament d'Empresa i Treball.
  "l-ampolla": {
    local: ["2027-07-16", "2027-11-15"],
    source: {
      name: "Acta del Ple ordinari de 11 de juny de 2026 (04-2026-06-11; Expedient 1058/2026. Aprovar les festes locals de l'Ampolla per al 2027)",
      ref: "Ajuntament de l'Ampolla, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4390600000/2026/cdbcf077-ccc4-4c01-a353-ea768738c2f1/04-2026-06-11.pdf",
    },
    act: { kind: "ple", date: "2026-06-11" },
    readOn: "2026-11-04",
  },
  // 1.8.- ACORD RELATIU A L'APROVACIO FESTES LOCALS PER A L'ANY 2027 [...] el Ple de l'Ajuntament de
  // Roda de Ter, amb el vot favorable de la majoria simple de membres de la Corporació, adopta els
  // següents: ACORDS: Primer. APROVAR les dues festes locals per a l'any 2027 següents: Dilluns 17
  // de maig de 2027 (segona pasqua) Dijous 23 de setembre de 2027 (festa major) Segon. TRAMETRE
  // aquesta proposta als Serveis Territorials del Departament d'Empresa i Treball.
  "roda-de-ter": {
    local: ["2027-05-17", "2027-09-23"],
    names: ["Segona Pasqua", "Festa Major"],
    source: {
      name: "Acta del Ple ordinari de 21 de juliol de 2026 (punt 1.8: Acord relatiu a l'aprovació festes locals per a l'any 2027, exp. 1492-000011-2026)",
      ref: "Ajuntament de Roda de Ter, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/818310007/2026/17380a0e-366d-4288-bc1e-9996a1d1e3d7/ACTA%20PLE%2021%20JULIOL%202026.pdf",
    },
    act: { kind: "ple", date: "2026-07-21" },
    readOn: "2026-11-04",
  },
  // 6.- Proposta de designació de les festes locals per a l'exercici 2027.- A la vista de la
  // proposta que realitza l'alcalde en relació a aquest punt de l'Ordre del Dia, el Ple, per
  // unanimitat, adopta el següent acord: “Vista l'ordre EMT/52/2026, de 25 de març, per la qual
  // s'estableix el calendari oficial de festes laborals a Catalunya per a l'any 2027. Atès que
  // aquest Ajuntament considera que les festes locals pel proper any 2027, s'han de celebrar els
  // dies 20 de gener i 15 d'abril. [...] Primer.- Designar com a festes locals de la Canonja pel
  // proper any 2027, els dies 20 de gener i 15 d'abril.
  "la-canonja": {
    local: ["2027-01-20", "2027-04-15"],
    source: {
      name: "Acta del Ple núm. 2026-0005 (Ple ordinari de 30 de juliol de 2026; punt 6: Proposta de designació de les festes locals per a l'exercici 2027)",
      ref: "Ajuntament de la Canonja, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4390760009/2026/57ac5240-1e0c-4f06-9224-8fd1e0e9baf1/ACTA%20DEL%20PLE%202026-0005%20%5BACTA%5D.pdf",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-11-04",
  },
  // 13. Designació dels dies festius locals corresponents a l'any 2027 [...] PRIMER.- Aprovar els
  // dies de festa local de Cadaqués per a l'any 2027, que s'escauran en les dates següents: -
  // Dimecres 20 de gener de 2027, Sant Sebastià - Dimecres 10 de febrer de 2027, Dimecres de cendra.
  // Segon.- Notificar el present acord als Serveis Territorials del Departament d'Empresa i Treball
  // de la Generalitat de Catalunya – Serveis Territorials a Girona. [...] L'acord resta aprovat per
  // unanimitat.
  cadaques: {
    local: ["2027-01-20", "2027-02-10"],
    names: ["Sant Sebastià", "Dimecres de cendra"],
    source: {
      name: "Acta del Ple ordinari núm. 4-2026 de 9 de juliol de 2026 (punt 13: Designació dels dies festius locals corresponents a l'any 2027)",
      ref: "Ajuntament de Cadaqués, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1703290004/2026/59d7805c-e31c-4a91-893b-786e09ca4d44/ACTA%20PLE%20ORDINARI%20N%daM.%204-2026%20DE%2009%20DE%20JULIOL%20DE%202026%20-%20ANONIMITZADA.pdf",
    },
    act: { kind: "ple", date: "2026-07-09" },
    readOn: "2026-11-04",
  },
  // Locals Any 2027 Dilluns, 17 de maig (Aplec de Santa Quitèria - Segona Pasqua) Dilluns, 23
  // d'agost (dilluns de Festa Major) Enllaç al calendari oficial de festes laborals a Catalunya per
  // a l'any 2027 .
  "vilanova-del-valles": {
    local: ["2027-05-17", "2027-08-23"],
    names: ["Aplec de Santa Quitèria - Segona Pasqua", "Dilluns de Festa Major"],
    source: {
      name: "Festius locals (Turisme > Festius > Locals)",
      ref: "Ajuntament de Vilanova del Vallès, pàgina web (darrera actualització 3.11.2026)",
      url: "https://www.vilanovadelvalles.cat/municipi/turisme/festius/locals",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // 7.- Proposta d'acord d'aprovació dels festius locals de l'any 2027 (X2026000847) [...] ACORD
  // Primer: ESTABLIR [...] 2027 retribuïdes i no recuperables, els dies següents : 20 de gener de
  // 2027 29 de juny de 2027 [...] Sebastià cau en dimecres i Sant Pere en dimarts. [...] Establir
  // com a festes locals del municipi per l'any 2027, retribuïdes i no recuperables els dies
  // següents. Aprovat per 11 vots a favor
  "sant-pere-pescador": {
    local: ["2027-01-20", "2027-06-29"],
    source: {
      name: "Acta del Ple PLE2026000005, sessió ordinària 17 de juny de 2026 - punt 7. Proposta d'acord d'aprovació dels festius locals de l'any 2027 (X2026000847)",
      ref: "Ajuntament de Sant Pere Pescador, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1717880001/2026/373aa619-84ba-4369-b2ba-b9a8a0b35131/ACTA%20PLE%2017062026.pdf",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // Capital: Bellver de Cerdanya Interès turístic: Romànic Festes Locals 2026: 12 de juny i 7 de
  // desembre Festes Locals 2027: 14 de juny i 7 de desembre
  "bellver-de-cerdanya": {
    local: ["2027-06-14", "2027-12-07"],
    source: {
      name: "Alcaldia (Ajuntament > Informació)",
      ref: "Ajuntament de Bellver de Cerdanya, web page (no date shown)",
      url: "https://www.bellver.org/ajuntament/alcaldia",
    },
    act: { kind: "web", date: null },
    readOn: "2026-11-04",
  },
  // PRIMER.- Aprovar les 2 Festes Locals del municipi de Sitges per a l’any 2027, que seran el dia
  // 24/08/2027 Festivitat de Sant Bartomeu i el dia 23/09/2027 Festivitat de Santa Tecla. […]
  // L’Alcaldessa sotmet la proposta a votació, quedant aprovada amb per unanimitat: - Vots a favor:
  // 21
  sitges: {
    local: ["2027-08-24", "2027-09-23"],
    names: ["Sant Bartomeu", "Santa Tecla"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sitges de 25 de juny de 2026",
      ref: "Ajuntament de Sitges, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/827040003/2026/be5f378a-98aa-4415-bcdd-e8c9f87d0b58/ACTA%208%20PLE%2025062026.docx%20(1).pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // 13. Expedient 6552/2026. Determinació de les festes de caràcter local per l'any 2027 Favorable
  // Tipus de votació: Ordinària A favor: 12, En contra: 3, Abstencions: 1, Absents: 1 […] 1. Fixar
  // per a l’any 2027 les següents festes de caràcter local del municipi de la Garriga: 3 d’agost
  // (dimarts) 1 d’octubre (divendres)
  "la-garriga": {
    local: ["2027-08-03", "2027-10-01"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de la Garriga de 22 de juny de 2026",
      ref: "Ajuntament de la Garriga, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/808850006/2026/5ae3a43e-2c26-40a8-ac8f-072c6f3657e1/20260622_Sessi%f3%20ordin%e0ria.pdf",
    },
    act: { kind: "ple", date: "2026-06-22" },
    readOn: "2026-11-04",
  },
  // Resolució: Proposar al Departament d’Empresa i Treball de la Generalitat de Catalunya que, per
  // l’any 2027, siguin incorporades al calendari laboral com a festes de caràcter local al municipi
  // de Palamós els dies 23 i 25 de juny […] El Ple, per 16 vots a favor, dels regidors dels grups
  // municipals d’ERC Palamós i Sant Joan, Partit dels Socialistes de Catalunya-Candidatura de
  // Progrés, Som-hi per Palamós i Sant Joan, Junts per Catalunya, Palamós i Sant Joan i VOX i una
  // abstenció del regidor del grup municipal de la CUP, adopta el següent pronunciament
  "palamos-i-sant-joan": {
    local: ["2027-06-23", "2027-06-25"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Palamós i Sant Joan de 16 de juny de 2026",
      ref: "Ajuntament de Palamós i Sant Joan, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1711810007/2026/5b1ca738-c7c9-431a-b9e7-c7fc6aaa3cc9/ActaPle20260616.pdf",
    },
    act: { kind: "ple", date: "2026-06-16" },
    readOn: "2026-11-04",
  },
  // L'Ajuntament en Ple, per unanimitat, acorda: Proposar al Departament d’Empresa i Treball de la
  // Generalitat de Catalunya les següents festes locals per a l’any 2027: - El dimarts 30 de març de
  // 2027 (Festa del Cor). - El divendres 24 de setembre de 2027 (Festa Major).
  "santa-coloma-de-farners": {
    local: ["2027-03-30", "2027-09-24"],
    names: ["Festa del Cor", "Festa Major"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Santa Coloma de Farners de 29 de maig de 2026",
      ref: "Ajuntament de Santa Coloma de Farners, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1718050006/2026/653cb59b-0411-40b7-b087-baf59ca181e3/Acta%20Ple%2029%20maig%202026%20aprovada.pdf",
    },
    act: { kind: "ple", date: "2026-05-29" },
    readOn: "2026-11-04",
  },
  // CELEBRADA PEL PLE DE L'AJUNTAMENT EL DIA 14 de juliol de 2026 […] S’acorda: PRIMER. Proposar que
  // es fixin els dies 18 de gener (dilluns) i el 22 de juliol (dijous) com a festes locals a Corbera
  // de Llobregat per a l’any 2027.
  "corbera-de-llobregat": {
    local: ["2027-01-18", "2027-07-22"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Corbera de Llobregat de 14 de juliol de 2026",
      ref: "Ajuntament de Corbera de Llobregat, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/807280001/2026/6e39769d-2099-4916-899d-0079a2b04976/LOPD%20Ple%2014-7-26.pdf",
    },
    act: { kind: "ple", date: "2026-07-14" },
    readOn: "2026-11-04",
  },
  // Seguidament se sotmet a votació la proposta, que s’aprova per unanimitat. D’acord amb
  // l’anterior, el Ple de l’Ajuntament aprova la proposta, així ho declara el President i s’acorda:
  // Primer. Aprovar la proposta de festes locals de Calonge i Sant Antoni corresponents a l’any
  // 2027, d’acord amb el detall següent: a) Nucli de Calonge:  Dilluns, 12 de juliol de 2027, Festa
  // Major d’Estiu de Calonge.  Dijous, 11 de novembre de 2027, Festa Major de Sant Martí de
  // Calonge. b) Nucli de Sant Antoni:  Dilluns, 14 de juny de 2027, Festa de les Entitats de Sant
  // Antoni. La festivitat de Sant Antoni de Pàdua correspon al dia 13 de juny, però atès que l’any
  // 2027 coincideix en diumenge, es proposa traslladar la festa local al dilluns següent. 
  // Dimecres, 1 de setembre de 2027, Festa Major de Sant Antoni, festivitat de Sant Llop.
  "calonge-i-sant-antoni": {
    local: ["2027-07-12", "2027-11-11"],
    names: ["Festa Major d’Estiu de Calonge", "Festa Major de Sant Martí de Calonge"],
    nuclei: [
      { name: "Sant Antoni", dates: ["2027-06-14", "2027-09-01"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Calonge i Sant Antoni de 30 de juliol de 2026",
      ref: "Ajuntament de Calonge i Sant Antoni, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1703400000/2026/371b402c-38c5-4743-934f-506eebae4290/PO_300726.pdf",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-11-04",
  },
  // TERCER.- Proposta aprovació Festes Locals 2027 (Exp. 3052/2026) Favorable Resultat votació:
  // UNANIMITAT […] Resolució: Primer.- Proposar com a festes locals per l’any 2027 els següents
  // dies: - Dimarts 30 de març - Dijous 11 de novembre
  altafulla: {
    local: ["2027-03-30", "2027-11-11"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Altafulla de 29 de juny de 2026",
      ref: "Ajuntament d'Altafulla, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4301200000/2026/eb850d38-ffd5-4282-afee-bdf192deccf5/2026-06-29%20Acta%20Ple.pdf",
    },
    act: { kind: "ple", date: "2026-06-29" },
    readOn: "2026-11-04",
  },
  // Per tot això, el Ple de l’Ajuntament del Morell adopta per unanimitat els següents ACORDS:
  // PRIMER. Aprovar l’establiment dels dies 2 d’agost i 15 de novembre com a festes locals del
  // Morell per l’any 2027.
  "el-morell": {
    local: ["2027-08-02", "2027-11-15"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament del Morell de 28 de maig de 2026",
      ref: "Ajuntament del Morell, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4309570005/2026/e0d2e45d-36d4-49d1-bbfd-fad1d2f1f51f/acta_Ple_28_05_2026.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // El Ple, per unanimitat dels tretze membres assistents (5 ERC, 1 PSC, 1 ENTESA, 5 JUNTS i 1 NO
  // ADSCRITA) que legalment el composen, ACORDA: PRIMER.- Es proposa a l’autoritat laboral que fixi,
  // com a festes laborals retribuïdes i no recuperables de caràcter local al municipi de l’Ametlla
  // de Mar per al 2027, les que s’esmenten: * 2 de febrer, dimarts * 29 de juny, dimarts
  "l-ametlla-de-mar": {
    local: ["2027-02-02", "2027-06-29"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de l'Ametlla de Mar de 30 de juliol de 2026",
      ref: "Ajuntament de l'Ametlla de Mar, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4301360009/2026/fdc5b6d5-f2a2-4486-ab35-c67e7c85e99d/Acta%20Ple%208_2026%20de%2030_07_2026.pdf",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-11-04",
  },
  // Primer: PROPOSAR al Departament d’Empresa i Treball de la Generalitat de Catalunya les següents
  // dues festes locals per a l’any 2027: Alcanar -14 de maig de 2027, Festivitat de Sant Isidre. -11
  // d’octubre de 2027, Festes del Remei. Les Cases d’Alcanar - 29 de juny de 2027, Festivitat de
  // Sant Pere. -16 de juliol de 2027, Festes de la Mare de Déu del Carme. Segon: COMUNICAR aquest
  // acord a l’òrgan competent, i donar-ne compte a la regidoria de festes i regidoria de
  // comunicació, als efectes escaients. Per tot l’exposat, el Ple aprova l’adopció dels acords
  // d’aquest punt, per unanimitat.
  alcanar: {
    local: ["2027-05-14", "2027-10-11"],
    names: ["Sant Isidre", "Festes del Remei"],
    nuclei: [
      { name: "les Cases d’Alcanar", dates: ["2027-06-29", "2027-07-16"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Alcanar de 25 de juny de 2026",
      ref: "Ajuntament d'Alcanar, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4300430008/2026/89182ec4-e25a-44ac-8dbe-2ebde956f1f9/Esborrany%20acta%20Ple%2025-06-2026%20pdf.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar com a festes locals del municipi de Santa Coloma de Cervelló per l’any 2027
  // els dies 16 d’agost de 2027 (dilluns) i 31 de desembre de 2027(divendres). […] APROVAT PER
  // UNANIMITAT DELS/DE LES REUNITS/DES (13)
  "santa-coloma-de-cervello": {
    local: ["2027-08-16", "2027-12-31"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Santa Coloma de Cervelló de 16 de juliol de 2026",
      ref: "Ajuntament de Santa Coloma de Cervelló, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/824440003/2026/54f94944-c48b-4c5b-b977-59f728d4cfa2/A46_2023_2027_20260716.pdf",
    },
    act: { kind: "ple", date: "2026-07-16" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar al Departament d’Empresa i Treball de la Generalitat de Catalunya que es fixin
  // les següents festes locals al municipi de la Jonquera per a l'any 2027: ➢ Dia 17 de maig de
  // 2027; Dilluns de Pentecosta o Pasqua Granada ➢ Dia 8 de setembre de 2027; Festa Major de la
  // Jonquera […] S’APROVA per unanimitat
  "la-jonquera": {
    local: ["2027-05-17", "2027-09-08"],
    names: ["Dilluns de Pentecosta o Pasqua Granada", "Festa Major de la Jonquera"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de la Jonquera de 30 de juliol de 2026",
      ref: "Ajuntament de la Jonquera, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1708650006/2026/0b3fc318-baa6-4676-a101-a4d7732fe4ea/Acta%20PLE%2030072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-11-04",
  },
  // El Ple de la Corporació per unanimitat acorda: Primer.- Proposar les dues Festes Locals de
  // Falset per a l’any 2027 els dies 16/8/2027 i 6/9/2027.
  falset: {
    local: ["2027-08-16", "2027-09-06"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Falset de 10 d’agost de 2026",
      ref: "Ajuntament de Falset, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4305550006/2026/e3d745d3-11d6-4864-9951-49a46790df64/Acta%20ple%20extraordinari%206.2026%20de%20data%2010.8.2026.pdf",
    },
    act: { kind: "ple", date: "2026-08-10" },
    readOn: "2026-11-04",
  },
  // ACTA DE LA SESSIÓ ORDINÀRIA REALITZADA PEL PLE DE L’AJUNTAMENT EL DIA 13 DE JULIOL DE L’ANY
  // 2026. […] PRIMER.- Fixar com a festes locals del municipi de Santa Margarida i els Monjos, per a
  // l’ any 2027, els dies 25 de març (dijous sant) i el 20 de juliol (festivitat de Santa Margarida,
  // patrona dels Monjos), excepte en el poble de la Ràpita on les festes locals seran el 25 de març
  // (dijous sant) i el 2 d’agost (amb motiu de la Festa Major de La Ràpita). […] La proposta d’acord
  // és aprovada per MAJORIA ABSOLUTA amb 9 vots a favor
  "santa-margarida-i-els-monjos": {
    local: ["2027-03-25", "2027-07-20"],
    names: ["Dijous Sant", "Santa Margarida"],
    nuclei: [
      { name: "la Ràpita", dates: ["2027-03-25", "2027-08-02"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Santa Margarida i els Monjos de 13 de juliol de 2026",
      ref: "Ajuntament de Santa Margarida i els Monjos, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/825150006/2026/685752d1-b9dc-4e8f-a4b8-bff3d6cdf7e3/260713.pdf",
    },
    act: { kind: "ple", date: "2026-07-13" },
    readOn: "2026-11-04",
  },
  // El Ple de l’Ajuntament, acorda: PRIMER: Determinar que les festes locals al municipi de TREMP
  // durant l’any 2027 seran les següents: - 14 de maig de 2027, festivitat de Sant Bonifaci. - 8 de
  // setembre de 2027, festivitat de la Verge de Valldeflors, Festa Major de Tremp. […] Vots a favor:
  // 13 (SRG, JCG, AMC, CTO, SHM, JMB, ECL, JDB, RMR, IEB, MPCL, AFG, JFG) Vots en contra: 0
  // Abstencions: 0
  tremp: {
    local: ["2027-05-14", "2027-09-08"],
    names: ["Sant Bonifaci", "Verge de Valldeflors, Festa Major de Tremp"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Tremp de 6 de juliol de 2026",
      ref: "Ajuntament de Tremp, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2523470005/2026/ea281b59-38b8-4a9b-b988-547603682a40/PLE%2020260706%20(07)%20signada%20PD.pdf",
    },
    act: { kind: "ple", date: "2026-07-06" },
    readOn: "2026-11-04",
  },
  // 1. Proposar al Departament d’Empresa i Treball de la Generalitat de Catalunya, que fixi per al
  // municipi del Poal les següents festes locals per a l’any 2027: o Dia 19 de març. o Dia 20
  // d’agost. […] Es passa a votació i s’aprova per unanimitat amb 6 vots a favor
  "el-poal": {
    local: ["2027-03-19", "2027-08-20"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament del Poal de 3 de juny de 2026",
      ref: "Ajuntament del Poal, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2516890004/2026/7404bf17-7def-40ef-991b-ad47337bf84a/Acta_03_JUNY_2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-03" },
    readOn: "2026-11-04",
  },
  // ACTA DE LA SESSIÓ ORDINÀRIA DEL PLE DE 30 D´ABRIL DE 2026 […] Primer.- Aprovar com a Festes
  // Locals de Masquefa per a l’any 2027 els dies 22 i 23 de juliol de 2027. […] 13 vots a favor
  masquefa: {
    local: ["2027-07-22", "2027-07-23"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Masquefa de 30 d’abril de 2026",
      ref: "Ajuntament de Masquefa, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/811920002/2026/5656b26e-03db-40cb-b22d-f81ff95a99bd/PO260430.pdf",
    },
    act: { kind: "ple", date: "2026-04-30" },
    readOn: "2026-11-04",
  },
  // S'ACORDA Primer. Proposar al Departament de Treball, Afers Socials i Famílies les dates de les
  // dues festes locals, retribuïdes i no recuperables per al proper any: 16 d’agost de 2027 17
  // d’agost de 2027 […] S'aprova per unanimitat de tots els assistents.
  "el-molar": {
    local: ["2027-08-16", "2027-08-17"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament del Molar de 22 de juny de 2026",
      ref: "Ajuntament del Molar, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4308590004/2026/1a7fbaf0-e61e-4f54-9586-2b2af86a8fa4/02%20EMAXS%20ACTA%20SESSI%d3%20PLE%20EXTRAORDINARI%206-2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-22" },
    readOn: "2026-11-04",
  },
  // En sessió Extraordinària de Ple, celebrada el dia 28 de juliol de 2026 […] es proposa al Ple de
  // la Corporació que les dues festes locals per l’any 2027 siguin els següents dies: - Dilluns 12
  // de juliol de 2027. - Dilluns 30 d’agost de 2027. […] Sotmesa la proposta a debat i a posterior
  // votació resulta aprovada per unanimitat dels assistents amb el següent resultat: 9 vots a favor
  "la-granada": {
    local: ["2027-07-12", "2027-08-30"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de la Granada de 28 de juliol de 2026",
      ref: "Ajuntament de la Granada, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/809450006/2026/720fabea-5618-4d84-bd43-7a5c47607923/ACTA%20NUM%203%20PLE%20EXTRAORDINARI%2028-7-2026.pdf",
    },
    act: { kind: "ple", date: "2026-07-28" },
    readOn: "2026-11-04",
  },
  // APROVAR, SI S'ESCAU, LA PROPOSTA D'APROVACIÓ DEL CALENDARI DE FESTES2. LOCALS PER A L'ANY 2027.
  // Queda aprovada la proposta d'acord, PER UNANIMITAT dels 4 regidors assistents. […] S'ACORDA
  // Primer.- Proposar al Departament d’Empresa i Treball les dates de les dues festes locals,
  // retribuïdes i no recuperables per a l'any vinent: 6 d'agost. 16 d'agost.
  "rocafort-de-queralt": {
    local: ["2027-08-06", "2027-08-16"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Rocafort de Queralt de 22 de juliol de 2026",
      ref: "Ajuntament de Rocafort de Queralt, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4313030008/2026/603ec9d8-27c1-44d3-92e6-ce9457b6110d/Acta%20Ple%20extraordinari%20de%20data%2022%20de%20juliol%20de%202026.pdf",
    },
    act: { kind: "ple", date: "2026-07-22" },
    readOn: "2026-11-04",
  },
  // El Ple, amb assistència de sis dels set membres de dret, per unanimitat, acorda: Primer.-
  // Proposar les següents festes locals per a l’any 2027: AJUNTAMENT D’ORDIS - Festa de la
  // Candelera: 01-02-2027 - Santa Creu de Figueres: 03-05-2027.
  ordis: {
    local: ["2027-02-01", "2027-05-03"],
    names: ["Festa de la Candelera", "Santa Creu de Figueres"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Ordis de 25 de juny de 2026",
      ref: "Ajuntament d'Ordis, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1711560009/2026/f5f21d89-ed4d-4d88-b0e1-a747930924a2/AC250626.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // Primer.- PROPOSAR que es fixin com a dies festius de caràcter local del municipi de Ribes de
  // Freser per a l’any 2027, les jornades següents: -12 de febrer de 2027 -11 de juny de 2027 […]
  // Aprovat per 9 vots a favor
  "ribes-de-freser": {
    local: ["2027-02-12", "2027-06-11"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Ribes de Freser de 11 de juny de 2026",
      ref: "Ajuntament de Ribes de Freser, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1714500000/2026/a11731cf-e1a9-42ce-92dc-1b67c959d8db/PLE%2011062026.pdf",
    },
    act: { kind: "ple", date: "2026-06-11" },
    readOn: "2026-11-04",
  },
  // PRIMER.- PROPOSAR les següents dues festes locals del terme municipal de Sant Andreu Salou per
  // l’any 2026: - Dilluns 13 de setembre de 2027 - Dimarts 30 de novembre de 2027 SEGON.- COMUNICAR-
  // HO al Departament d’Empresa i Treball, abans del dia 31 d’agost de 2026. Aprovat per unanimitat
  // per 5 vots a favor (Francesc Xavier Casanovas Busquets, David Miquel Carabús, Marta Gruart
  // Soler, Abel Buadas Artau, Carme Jorda Costa) dels 5 membres amb dret a vot que conformen el Ple
  // de la Corporació.
  "sant-andreu-salou": {
    local: ["2027-09-13", "2027-11-30"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sant Andreu Salou de 16 de juny de 2026",
      ref: "Ajuntament de Sant Andreu Salou, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1715760009/2026/d50aa4e3-8fbb-4670-b9c7-29715195f17d/acta%20ple%204.pdf",
    },
    act: { kind: "ple", date: "2026-06-16" },
    readOn: "2026-11-04",
  },
  // Primer.- APROVAR els dies de festa local per a l’any 2027 que seran: Dilluns 26 de juliol de
  // 2027. Dijous 11 de novembre de 2027. […] Aprovat per 7 vots a favor
  pontos: {
    local: ["2027-07-26", "2027-11-11"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Pontós de 22 de juny de 2026",
      ref: "Ajuntament de Pontós, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1713650006/2026/f4a1908a-9d16-44db-ad16-34c482f0079b/PLE%2022%20JUNY.pdf",
    },
    act: { kind: "ple", date: "2026-06-22" },
    readOn: "2026-11-04",
  },
  // FESTES LOCALS DE 2027.11. EXPEDIENT 2026/638 Aprovada per unanimitat de les / dels sis membres
  // assistents dels set que de dret integren el Ple. […] S'ACORDA Primer.- Proposar al Departament
  // d’Empresa i Treball de la Generalitat de Catalunya les dates de les dues festes locals,
  // retribuïdes i no recuperables per al proper any: - El dia 25 de març de 2027. - El dia 31 de
  // desembre de 2027.
  puigpelat: {
    local: ["2027-03-25", "2027-12-31"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Puigpelat de 2 de juny de 2026",
      ref: "Ajuntament de Puigpelat, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4311910007/2026/e056d9b1-d88b-462e-968d-887b453de993/C%f2pia%20art.%2056%20LBRL%20Acta%20Sessi%f3%20Ordin%e0ria%20Ple%202%20juny%202026%20Ajunt.%20Puigpelat%20ca.pdf",
    },
    act: { kind: "ple", date: "2026-06-02" },
    readOn: "2026-11-04",
  },
  // PROPOSTA D'APROVACIÓ DE LES FESTES LOCALS PER L'ANY 2027 AL MUNICIPI DE6. VALLFOGONA DE RIUCORB
  // Aprovat per unanimitat amb tres vots a favor. […] S'ACORDA Primer.- Proposar els dies 10 de
  // juliol i 4 de desembre com a Festes Locals del municipi de Vallfogona de Riucorb per a l’any
  // 2027.
  "vallfogona-de-riucorb": {
    local: ["2027-07-10", "2027-12-04"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Vallfogona de Riucorb de 17 de juny de 2026",
      ref: "Ajuntament de Vallfogona de Riucorb, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4315920002/2026/003873d8-932e-40df-abd4-3b0f04b32bf4/04_2026_17_06_2026_ordinari%2017%20DE%20JUNY.pdf",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // Festes locals 2027 Municipi del Pont de Suert 20 de gener 2027 (dimecres), Sant Sebastià. 6
  // d’agost 2027 (divendres), Festa Major del Pont de Suert. Festes locals 2027 Nucli de Llesp 20 de
  // gener 2027 (dimecres), Sant Sebastià. 3 de febrer 2027 (dimecres), Sant Blai Festa Major. Festes
  // locals 2027 Nucli de Malpàs 20 de gener 2027 (dimecres), Sant Sebastià. 29 de juny 2027
  // (dimarts) Sant Pere Festa Major. Festes locals 2027 Nucli de Viu de Llevata 20 de gener 2027
  // (dimecres), Sant Sebastià. 14 d’agost 2027 (dissabte), Vespra de l’Assumpció Festa Major. […]
  // Primer.- Aprovar les festes locals del municipi del Pont de Suert i dels seus nuclis per a l’any
  // 2027, en els termes exposats. Segon.- Comunicar aquest acord al Departament d’Empresa i Treball
  // de la Generalitat de Catalunya mitjançant el tràmit “EMT – Comunicació de festivitats locals
  // (CALAB)” de la plataforma EACAT. Sotmesa la proposta anterior a la consideració del Ple resulta
  // aprovada per unanimitat de les persones membres assistents i majoria absoluta.
  "el-pont-de-suert": {
    local: ["2027-01-20", "2027-08-06"],
    names: ["Sant Sebastià", "Festa Major del Pont de Suert"],
    nuclei: [
      { name: "Llesp", dates: ["2027-01-20", "2027-02-03"] },
      { name: "Malpàs", dates: ["2027-01-20", "2027-06-29"] },
      { name: "Viu de Llevata", dates: ["2027-01-20", "2027-08-14"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament del Pont de Suert de 25 de juny de 2026",
      ref: "Ajuntament del Pont de Suert, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2517340003/2026/d41ae5dc-ef81-44d3-a1d9-46ea86086202/ACTA%20PLE%2002%202026%2025%2006%20ORD.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // PROPOSTA 'APROVACIÓ CALENDARI FESTES LOCALS 2027'4. 4 vots a favor. Unanimitat dels membres
  // assistents. […] S'ACORDA Primer.- Proposar al Departament d'Empresa i Treball les dates de les
  // dues festes locals, retribuïdes i no recuperables per al proper any: - 13 de desembre de 2027 -
  // 28 de desembre de 2027
  "bellmunt-del-priorat": {
    local: ["2027-12-13", "2027-12-28"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Bellmunt del Priorat de 29 de juliol de 2026",
      ref: "Ajuntament de Bellmunt del Priorat, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4302340003/2026/7b3bb152-445f-4bab-85fd-58f05507f5d2/460BB0B39D2F4FB69EE3A1E3C090EE31%20(1).pdf",
    },
    act: { kind: "ple", date: "2026-07-29" },
    readOn: "2026-11-04",
  },
  // SEGON.- Expedient 279/2026. Aprovació festes locals any 2027 Favorable Tipus de votació:
  // Ordinària Tipus de majoria: Unanimitat A favor: 9, En contra: 0, Abstencions: 0, Absents: 0 […]
  // Resolució: Primer.- Aprovar la proposta de les dues festes locals per l’any 2027, els dies 17 de
  // maig i 4 d’octubre.
  "la-pobla-de-lillet": {
    local: ["2027-05-17", "2027-10-04"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de la Pobla de Lillet de 30 de juliol de 2026",
      ref: "Ajuntament de la Pobla de Lillet, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/816660009/2026/418e5d04-6126-4c9b-9b09-911a4111736a/ACTA%20DEL%20PLE%202026-0004%20%5BActa%20ple%2030-07-26%5D.pdf",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-11-04",
  },
  // PRIMER.- Fixar com a dies festius de caràcter local al municipi de Bàscara per a l’any 2027 els
  // següents: • 19 d’abril (dilluns) • 19 de novembre (divendres) […] Aprovat per 6 vots a favor
  bascara: {
    local: ["2027-04-19", "2027-11-19"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Bàscara de 27 de maig de 2026",
      ref: "Ajuntament de Bàscara, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1701600000/2026/9f123ecf-c9c7-476c-bb66-cfe90bbc4a47/PLE2026000005.pdf",
    },
    act: { kind: "ple", date: "2026-05-27" },
    readOn: "2026-11-04",
  },
  // PRIMER. Proposar a la Conselleria d’Empresa i Treball de la Generalitat de Catalunya que siguin
  // fixades com a festes locals del municipi de Maià de Montcal per a l’any 2027, els dies: - 18 de
  // gener de 2027 Festa Major de Sant Vicenç - 17 de maig de 2027 Festes del Roser i Sant Isidre I
  // que les dues festes locals del poble agregat de Dosquers per a l’any 2027, siguin les següents:
  // - 17 de maig de 2027 Festes del Roser i Sant Isidre - 26 de juliol de 2027 Festa de Sant Jaume
  // […] I el Ple ho aprova per majoria absoluta. Aprovat per 6 vots a favor
  "maia-de-montcal": {
    local: ["2027-01-18", "2027-05-17"],
    names: ["Festa Major de Sant Vicenç", "Festes del Roser i Sant Isidre"],
    nuclei: [
      { name: "Dosquers", dates: ["2027-05-17", "2027-07-26"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Maià de Montcal de 28 de maig de 2026",
      ref: "Ajuntament de Maià de Montcal, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1709850006/2026/8a783ce2-a84c-49f4-9527-7a99a5c67b22/03_2026_Acta_Ple_Ordinari_28052026.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // Per tant, el Ple aprova amb els 6 vots a favor d’Aitona Primer i 3 més positius d’Aitona
  // Republicana, cosa que representa la majoria absoluta del nombre legal de membres de la
  // Corporació: Primer.- Aprovar la modificació de l'actuació inicialment prevista al PUOSC 2025
  // -2029 consistent en “Projecte d'urbanització de parcel·la per a aparcament municipal al carrer
  // Quixeret” pel nou “Projecte bàsic i d’execució per actuacions al n ucli antic d’Aitona per
  // millora de l’aparcament i substitució parcial de la xarxa de sanejament i d’aigua potable al
  // carrer Dr. Pere Piñol”, per un import d’execució per contracta de 194.381,21 euros. DOCUMENT
  // Acta Ple ÒRGAN SERVEIS GENERALS EXPEDIENT X2026000344 Codi Segur de Verificació:
  // 5b76eb56-f73c-4969-a70f-c15975134136 Origen: Administració Identificador document original:
  // ES_L01081000_2026_5158065 Data d'impressió: 15/07/2026 09:56:56 Pàgina 4 de 13 SIGNATURES 1.-
  // ANA ISABEL ARELLANO MARTINEZ (SIG), 14/07/2026 13:20 2.- MARIA ROSA PUJOL ESTEVE (R: P2504600D),
  // 14/07/2026 13:48 AJUNTAMENT D'AITONA Aquest document és una còpia autèntica del document
  // electrònic original. Validaci¢ de documents: https://aitona.e- registre.cat/OAC/ValidarDoc.jsp
  // Ì5b76eb56-f73c-4969-a70f-c˙/¯SB-¨6^˛ 4 Ajuntament d’Aitona Carrer Major, 6 25182 Aitona (Lleida)
  // CIF P2504600D Segon.- Comunicar al Departament de la Presidència de la Generalitat als efectes
  // de tramitar l’oportú expedient de modificació i habilitar a l’Alcaldia a l’execució de totes les
  // actuacions i tràmits que a l’efecte siguin necessaris. Tercer.- Aprovar les modificacions
  // pressupostàries que, si escau, resultin necessàries per a l’execució de les obres esmentades.
  // Quart.- Comunicar aquest acord a la Intervenció municipal als efectes oportuns i per al seu
  // coneixement. Per la Sra. Alcaldessa s’introdueix breument el motiu de l’expedient. Pel Sr. López
  // Blanco es comenta que s’entén que van sorgint actuacions urgents que s’han de fer per millorar
  // l’estat dels carrers i les voreres. Per la Sra. Alcaldessa s’explica que el canvi de l’actuació
  // be donat per que es va considerar que es podia modificar el plantejament de l’obra, la qual cosa
  // permetria ficar uns diner per arreglar el carrer Pere Piñol, sense fer tota la despesa només a
  // l’aparcament. També es comenta que l’altra actuació del PUOSC prevista al C/ Sèquia i Joan
  // Maragall, com també està previst que surti el Pla de Pobles, també implicarà alguna modificació
  // per poder-ho dirigir de manera diferent. 2. Modificació article 24 del Pacte del personal
  // funcionari de l’Ajuntament d’Aitona (X2026000334) ANTECEDENTS I. El vigent pacte de funcionaris
  // (25100010132015) publicat al BOPL núm 77 de 23 d’abril de 2015 en el seu article 24.3 estableix
  // un límit màxim anual de 80 hores extraordinàries. II. Aquest límit deriva de la regulació
  // prevista a l’article 35 del Text R efós de la Llei de l’Estatut dels Treballadors, aplicable al
  // personal laboral. III. Pel que fa al personal funcionari, el règim jurídic aplicable és el
  // previst al Reial decret legislatiu 5/2015, de 30 d’octubre, pel qual s’aprova el Text refós de
  // la Lle i de l’Estatut Bàsic de l’Empleat Públic, així com al Reial decret 861/1986, de 25
  // d’abril, pel qual s’estableix el règim de retribucions dels funcionaris de l’Administració
  // local, normativa que no estableix un límit anual màxim d’hores de serveis extraordinaris. IV.
  // L’article 24.d del TREBEP preveu les gratificacions per serveis extraordinaris prestats fora de
  // la jornada normal de treball, mentre que l’article 6 del RD 861/1986 disposa que aquestes
  // gratificacions no poden ser fixes en la seva quantia ni periòdiques en la seva meritació.
  // DOCUMENT Acta Ple ÒRGAN SERVEIS GENERALS EXPEDIENT X2026000344 Codi Segur de Verificació:
  // 5b76eb56-f73c-4969-a70f-c15975134136 Origen: Administració Identificador document original:
  // ES_L01081000_2026_5158065 Data d'impressió: 15/07/2026 09:56:56 Pàgina 5 de 13 SIGNATURES 1.-
  // ANA ISABEL ARELLANO MARTINEZ (SIG), 14/07/2026 13:20 2.- MARIA ROSA PUJOL ESTEVE (R: P2504600D),
  // 14/07/2026 13:48 AJUNTAMENT D'AITONA Aquest document és una còpia autèntica del document
  // electrònic original. Validaci¢ de documents: https://aitona.e- registre.cat/OAC/ValidarDoc.jsp
  // Ì5b76eb56-f73c-4969-a70f-c˙/¯SB-¨6^˛ 5 Ajuntament d’Aitona Carrer Major, 6 25182 Aitona (Lleida)
  // CIF P2504600D V. Ateses les necessitats organitzatives i de funcionament dels serveis
  // municipals, es considera convenient adequar la regulació vigent al règim jurídic aplicable al
  // personal funcionari. VI. Vist l’informe de la Intervenció municipal que consta a l’expedient,
  // emès amb caràcter favorable. VII. Vist l’Acord favorable de la mesa de negociació de
  // l’Ajuntament d’Aitona de data 2.6.2026. Per tant, el Ple aprova amb els 6 vots a favor d’Aiton a
  // Primer i 3 més positius d’Aitona Republicana, cosa que representa la majoria absoluta del nombre
  // legal de membres de la Corporació: Primer.- Modificar l’article 24 del Pacte de funcionaris al
  // servei de l’Ajuntament d’Aitona, que quedarà redactat en els termes següents: 1.- Els serveis
  // extraordinaris prestats pel personal funcionari fora de la jornada ordinària podran ser
  // compensats econòmicament mitjançant gratificacions o bé compensats amb descans, d’acord amb les
  // necessitats del servei i la normativa vigent. 2.- Les gratificacions per serveis extraordinaris
  // tindran caràcter excepcional i no podran ser fixes en la seva quantia ni periòdiques en la seva
  // meritació. 3.- La realització i el pagament d’hores extraordinàries requereix la justificació de
  // les hores realitzades, desglossades per períodes i nombre d’hores per persona. 4.- En tot cas,
  // la prestació de serveis extraordinaris restarà subjecta als límits pressupostaris legalment
  // aplicables , al règim de jornada i descansos vigent i a la normativa de prevenció de riscos
  // laborals. 5.- El treballador podrà optar entre compensar les hores extraordinàries amb temps de
  // treball o bé cobrar-les. 6.- La retribució/compensació per les hores extraordinàries serà la
  // següent: Preu hora extraordinària laborable normal....................... 1’5 hora de treball
  // Preu hora extraordinària festiva o nocturna...................... 2 hores de treball Preu hora
  // extraordinària festiva i nocturna...................... 2’5 hores de treball 7.- Les hores
  // extraordinàries s’han de computar mensualment i s’han de compensar o abonar en nòmina un cop
  // determinades, en un termini màxim de dos mesos, llevat del cas del punt següent, en què podrà
  // arribar fins a dotze mesos. 8.- Pel seu caràcter especial, els treballs tècnics que realitzin
  // els funcionaris municipals fora del seu horari de treball no estaran subjectes a limitació
  // d’hores. Quan no siguin retribuïts per complement de productivitat, es retribuiran per serveis
  // extraordinaris, amb els següents percentatges sobre el pressupost d’execució material de cada
  // treball: DOCUMENT Acta Ple ÒRGAN SERVEIS GENERALS EXPEDIENT X2026000344 Codi Segur de
  // Verificació: 5b76eb56-f73c-4969-a70f-c15975134136 Origen: Administració Identificador document
  // original: ES_L01081000_2026_5158065 Data d'impressió: 15/07/2026 09:56:56 Pàgina 6 de 13
  // SIGNATURES 1.- ANA ISABEL ARELLANO MARTINEZ (SIG), 14/07/2026 13:20 2.- MARIA ROSA PUJOL ESTEVE
  // (R: P2504600D), 14/07/2026 13:48 AJUNTAMENT D'AITONA Aquest document és una còpia autèntica del
  // document electrònic original. Validaci¢ de documents: https://aitona.e-
  // registre.cat/OAC/ValidarDoc.jsp Ì5b76eb56-f73c-4969-a70f-c˙/¯SB-¨6^˛ 6 Ajuntament d’Aitona
  // Carrer Major, 6 25182 Aitona (Lleida) CIF P2504600D - Elaboració de projectes d’obres: 5% -
  // Elaboració de memòries valorades o refosos: 2% - Direcció d’obra: 2% - Control de qualitat:
  // 0,20% - Coordinació de seguretat i salut: 0,53% 9.- Els representants del personal funcionari,
  // si n’hi ha, han de rebre mensualment un resum de les hores extres fetes durant aquest període de
  // temps Segon.- Mantenir pel personal laboral el règim d’hores extraordinàries previst a la
  // legislació laboral vigent. Tercer.- Facultar l’Alcaldia -Presidència per dictar les instruccions
  // necessàries per a l’aplicació i interpretació del present acord. Quart.- L’eficàcia de la
  // present modificació restarà condicionada a la seva aprovació pels òrgans municipals competents
  // i, a la tramitació legalment exigible. Per la Sra. Alcaldessa es comenta conjuntament els punts
  // 2, 3 i 4. La nova interventora ha revisat aquests documents (el Pacte de Personal, la RLT i les
  // BEP) i es considera necessari fer aquestes modificacions per millorar la gestió. Per la Sra.
  // Regidora Laia Remolà es comenta que la modificació del Pacte de Personal obeeix a millores
  // organitzatives i que consideren imprescindible es remuneri correctament als treballadors públics
  // en general i als treballadors municipals, especialment. Per la Sra. alcaldessa es puntualitza
  // que l’acord afecta només als treballadors funcionaris de l’ajuntament. 3. Modificació puntual de
  // la RLT en relació al complement específic assignat al lloc de treball F20 (X2026000337) Atès que
  // la Relació de Llocs de Treball de l’Ajuntament regula les característiques essencials dels llocs
  // de treball i les seves retribucions complementàries, de conformitat amb el que disposen els
  // articles 90.2 de la Llei 7/1985, de 2 d ’abril, reguladora de les bases del règim local, i 74
  // del Text refós de la Llei de l’Estatut bàsic de l’empleat públic, aprovat pel Reial decret
  // legislatiu 5/2015, de 30 d’octubre; Atès que s’ha constatat que el lloc de treball de tècnica de
  // turisme ve desenvolupant de forma continuada funcions que comporten una especial dedicació,
  // disponibilitat i actuacions habituals fora de la jornada ordinària de treball, circumstàncies
  // que excedeixen les condicions inicialment previstes en la valoració del lloc; Atès que aquestes
  // circumstàncies estructurals i permanents del lloc no poden ser adequadament retribuïdes
  // mitjançant gratificacions per serveis extraordinaris, atès que aquestes, de conformitat amb
  // l’article 6 del Reial decret 861/1986, de 25 d’abril, no poden ser fixes en la seva quantia ni
  // periòdiques en la seva meritació; DOCUMENT Acta Ple ÒRGAN SERVEIS GENERALS EXPEDIENT X2026000344
  // Codi Segur de Verificació: 5b76eb56-f73c-4969-a70f-c15975134136 Origen: Administració
  // Identificador document original: ES_L01081000_2026_5158065 Data d'impressió: 15/07/2026 09:56:56
  // Pàgina 7 de 13 SIGNATURES 1.- ANA ISABEL ARELLANO MARTINEZ (SIG), 14/07/2026 13:20 2.- MARIA
  // ROSA PUJOL ESTEVE (R: P2504600D), 14/07/2026 13:48 AJUNTAMENT D'AITONA Aquest document és una
  // còpia autèntica del document electrònic original. Validaci¢ de documents: https://aitona.e-
  // registre.cat/OAC/ValidarDoc.jsp Ì5b76eb56-f73c-4969-a70f-c˙/¯SB-¨6^˛ 7 Ajuntament d’Aitona
  // Carrer Major, 6 25182 Aitona (Lleida) CIF P2504600D Atès que resulta necessari adequar el
  // complement específic del lloc de treball per tal que aquest retribueixi correctament les
  // condicions particulars del lloc relatives a la dedicació especial, responsabilitat i
  // disponibilitat exigides per al seu desenvolupament ordinari; Vist l’informe d’Intervenció emès
  // en data 28 de maig de 2026 relatiu a les nòmines de maig i l’informe d’intervenció emès en data
  // 29 de maig relatiu a la modificació de llocs de treball; Vist l’Acord favorable de la mesa de
  // negociació de l’Ajuntament d’Aitona de data 2.6.2026. Per tant, el Ple aprova amb els 6 vots a
  // favor d’Aitona Primer i 3 abstencions d’Aitona Republicana, cosa que representa la majoria
  // absoluta del nombre legal de membres de la Corporació: Primer. Modificar puntualment la Relació
  // de Llocs de Treball de l’Ajuntament pel que fa al lloc de treball de tècnica de turisme, en el
  // sentit d’incrementar el complement específic assignat al lloc en la quantitat anual de
  // 9.629,04.-€ euros bruts, distribuïts en catorze pagues, amb efectes de data 1 de juny de 2026_.
  // Segon. Fer constar que la modificació del complement específic té per finalitat retribuir les
  // condicions particulars del lloc derivades de la seva especial dedicació, disponibilitat i
  // responsabilitat continuada, deixant sense efecte la percepció periòdica de gratificacions fixes
  // vinculades a serveis extraordinaris. Tercer. Aprovar la corresponent modificació pressupostària,
  // i adequar les aplicacions pressupostàries de personal als efectes derivats del present acord, a
  // través de la trasnferència de crèdit corresponent. Quart. Publicar-lo amb la modificació de la
  // Relació de Llocs de Treball al Butlletí Oficial de la Província. Pel Sr. Carles Verdaguer es
  // comenta que estan d’acord amb que els treballadors tinguin una remuneració adequada i que es
  // remunerin les hores extraordinàries fetes però que no saben si això implicarà que els altres
  // treballadors també ho demanin. 4. Modificació de la Base 13 de les Bases d’execució del
  // Pressupost de l’Ajuntament d’Aitona per a l’exercici 2026 (X2026000335) Vista la proposta de
  // modificació de la Base 13 de les vigents bases d’execució del Pressupost de l’Ajuntament
  // d’Aitona per a l’exercici 2026. Vist l’informe de la Intervenció municipal que consta a
  // l’expedient, emès amb caràcter favorable. DOCUMENT Acta Ple ÒRGAN SERVEIS GENERALS EXPEDIENT
  // X2026000344 Codi Segur de Verificació: 5b76eb56-f73c-4969-a70f-c15975134136 Origen:
  // Administració Identificador document original: ES_L01081000_2026_5158065 Data d'impressió:
  // 15/07/2026 09:56:56 Pàgina 8 de 13 SIGNATURES 1.- ANA ISABEL ARELLANO MARTINEZ (SIG), 14/07/2026
  // 13:20 2.- MARIA ROSA PUJOL ESTEVE (R: P2504600D), 14/07/2026 13:48 AJUNTAMENT D'AITONA Aquest
  // document és una còpia autèntica del document electrònic original. Validaci¢ de documents:
  // https://aitona.e- registre.cat/OAC/ValidarDoc.jsp Ì5b76eb56-f73c-4969-a70f-c˙/¯SB-¨6^˛ 8
  // Ajuntament d’Aitona Carrer Major, 6 25182 Aitona (Lleida) CIF P2504600D Per tant, el Ple aprova
  // amb els 6 vots a favor d’Aitona Primer i 3 més positius d’Aitona Republicana, cosa que
  // representa la majoria absoluta del nombre legal de membres de la Corporació: Primer.- Modificar
  // la Base 13 de les vigents bases d’execució del Pressupost de l’Ajuntament d’Aitona per a
  // l’exercici 2026, que quedarà redactada en els termes següents: BASE 13a. Pagaments a justificar,
  // bestretes de caixa fixa i altres pagaments menors 1. Pagaments a justificar 1. L’Alcaldia podrà
  // expedir ordres de pagament “a justificar” en aquells supòsits en què no sigui possible aportar
  // la documentació justificativa amb anterioritat al pagament, d’acord amb el que estableix la
  // normativa pressupostària i comptable aplicable. 2. Els pagaments a justificar tindran caràcter
  // excepcional i només es podran utilitzar per a despeses concretes, determinades i justificades
  // pel centre gestor corresponent. 3. L’import màxim de cada lliurament individual serà de 8.000
  // euros. L’import global anual dels pagaments a justificar no podrà superar els 24.000 euros,
  // llevat d’autorització expressa de l’Alcaldia mitjançant resolució motivada. 4. Els fons lliurats
  // s’hauran de justificar en el termini màxim de tres mesos des de la seva percepció i, en tot cas,
  // abans de la finalització de l’exercici pressupostari. 5. No es podran expedir noves ordres de
  // pagament a justificar a favor de perceptors que tinguin pendent de justificació fons
  // anteriorment lliurats pel mateix concepte pressupostari. 6. L’expedició de pagaments a
  // justificar requerirà: a) Memòria justificativa del centre gestor acreditant la necessitat i
  // impossibilitat de seguir la tramitació ordinària. b) Retenció de crèdit adequada i suficient.
  // Fiscalització prèvia de la Intervenció en els termes previstos a l’article 25 del Reial decret
  // 424/2017, de 28 d’abril c) Resolució d’Alcaldia. 7. La justificació es realitzarà mitjançant
  // compte justificatiu integrat per: a) Relació detallada de les despeses efectuades. b) Factures o
  // documents justificatius originals conformats. c) Acreditació del pagament efectiu. d) Documents
  // comptables corresponents. 8. La Intervenció efectuarà el control de la justificació en els
  // termes establerts a l’article 27 del Reial decret 424/2017. 2. Bestretes de caixa fixa en
  // efectiu DOCUMENT Acta Ple ÒRGAN SERVEIS GENERALS EXPEDIENT X2026000344 Codi Segur de
  // Verificació: 5b76eb56-f73c-4969-a70f-c15975134136 Origen: Administració Identificador document
  // original: ES_L01081000_2026_5158065 Data d'impressió: 15/07/2026 09:56:56 Pàgina 9 de 13
  // SIGNATURES 1.- ANA ISABEL ARELLANO MARTINEZ (SIG), 14/07/2026 13:20 2.- MARIA ROSA PUJOL ESTEVE
  // (R: P2504600D), 14/07/2026 13:48 AJUNTAMENT D'AITONA Aquest document és una còpia autèntica del
  // document electrònic original. Validaci¢ de documents: https://aitona.e-
  // registre.cat/OAC/ValidarDoc.jsp Ì5b76eb56-f73c-4969-a70f-c˙/¯SB-¨6^˛ 9 Ajuntament d’Aitona
  // Carrer Major, 6 25182 Aitona (Lleida) CIF P2504600D 1. Amb la finalitat d’atendre despeses
  // corrents de caràcter periòdic o repetitiu, de petita quantia i tramitació simplificada, es
  // podran constituir bestretes de caixa fixa en efectiu a favor dels empleats públics habilitats
  // mitjançant decret d’Alcaldia. 2. Les bestretes de caixa fixa en efectiu es destinaran
  // exclusivament a despeses menors de funcionament ordinari respecte de les quals no sigui eficient
  // la tramitació ordinària de pagament. 3. L’import màxim de cada despesa individual satisfeta
  // mitjançant aquest sistema no podrà superar els 2.000 euros IVA inclòs. 4. L’import global anual
  // dels pagaments efectuats mitjançant bestreta de caixa fixa en efectiu no podrà superar els
  // 36.000 euros. 5. La constitució de cada bestreta determinarà: a) Persona habilitada responsable.
  // b) Import màxim disponible. c) Tipologia de despeses autoritzades. d) Aplicacions
  // pressupostàries imputables. 6. Les reposicions de fons es tramitaran a mesura que es presentin
  // les justificacions corresponents, prèvia aprovació de la relació de despeses i fiscalització de
  // la Intervenció. 7. La justificació incorporarà: a) Relació numerada de despeses. b) Factures
  // conformades que compleixin els requisits legals. c) Justificants de pagament. d) Documents
  // comptables corresponents. 8. No es podran satisfer mitjançant bestreta de caixa fixa: a)
  // Contractes subjectes a licitació. b) Despeses inventariables. c) Retribucions de personal. d)
  // Subvencions o transferències. e) Despeses que puguin constituir fraccionament indegut del
  // contracte. 3. Bestretes de caixa fixa mitjançant targeta bancària corporativa 1. L’Alcaldia
  // podrà autoritzar l’ús de targetes bancàries corporatives associades al sistema de bestreta de
  // caixa fixa per a l’atenció de despeses menors de caràcter urgent, recurrent o necessàries per a
  // la prestació ordinària dels serveis municipals. 2. Les targetes corporatives tindran la
  // consideració de mitjà de pagament vinculat a una bestreta de caixa fixa i quedaran subjectes al
  // mateix règim de control i justificació. 3. Per decret d’Alcaldia es determinaran: Persones
  // autoritzades. DOCUMENT Acta Ple ÒRGAN SERVEIS GENERALS EXPEDIENT X2026000344 Codi Segur de
  // Verificació: 5b76eb56-f73c-4969-a70f-c15975134136 Origen: Administració Identificador document
  // original: ES_L01081000_2026_5158065 Data d'impressió: 15/07/2026 09:56:56 Pàgina 10 de 13
  // SIGNATURES 1.- ANA ISABEL ARELLANO MARTINEZ (SIG), 14/07/2026 13:20 2.- MARIA ROSA PUJOL ESTEVE
  // (R: P2504600D), 14/07/2026 13:48 AJUNTAMENT D'AITONA Aquest document és una còpia autèntica del
  // document electrònic original. Validaci¢ de documents: https://aitona.e-
  // registre.cat/OAC/ValidarDoc.jsp Ì5b76eb56-f73c-4969-a70f-c˙/¯SB-¨6^˛ 10 Ajuntament d’Aitona
  // Carrer Major, 6 25182 Aitona (Lleida) CIF P2504600D a) Límit de disposició de cada targeta. b)
  // Tipologia de despeses autoritzades. c) Mesures de custòdia i seguretat. 4. L’import màxim de
  // cada despesa individual abonada amb targeta no podrà superar els 4.000 euros IVA inclòs. 5.
  // L’import global anual dels pagaments efectuats mitjançant targeta corporativa no podrà superar
  // els 40.000 euros. 6. En cap cas es podran efectuar extraccions d’efectiu amb les targetes
  // corporatives, llevat d’autorització expressa de l’Alcaldia per causes justificades. 7. La
  // justificació de les despeses satisfetes amb targeta s’haurà de realitzar mensualment,
  // incorporant: a) Extracte bancari o relació de moviments. b) Factures conformades. c)
  // Justificació de la necessitat de la despesa. d) Documents comptables corresponents. 8. La
  // Intervenció podrà efectuar controls financers periòdics sobre els moviments de les targetes
  // corporatives i requerir qualsevol informació complementària. 4. Normes comunes de gestió i
  // control 1. El centre gestor és responsable de: a) La correcta aplicació pressupostària de la
  // despesa. b) L’existència de crèdit adequat i suficient. c) La conformitat de les factures. d) El
  // compliment de la normativa contractual. e) La no alteració de l’objecte del contracte amb la
  // finalitat d’evitar l’aplicació de les regles generals de contractació pública. 2. Les despeses
  // menors tramitades mitjançant aquests sistemes podran agrupar-se en relacions o comptes
  // justificatius periòdics. 3. La situació, disposició, comptabilització i control dels fons
  // s’ajustarà al que estableixi la Instrucció del model normal de comptabilitat local i la resta de
  // normativa aplicable. 4. Els resultats del control efectuat sobre aquests procediments
  // s’incorporaran a l’informe anual de control financer que la Intervenció elevarà al Ple de la
  // corporació, d’acord amb el Reial decret 424/2017. Segon. Exposar la present modificació de les
  // bases d’execució del pressupost al públic en el Butlletí Oficial de la Província i al tauler
  // d’anuncis de la Corporació, pel termini de 15 dies hàbils. Durant aquest termini, els
  // interessats podran examinar -ho i presentar reclamacions davant el Ple. DOCUMENT Acta Ple ÒRGAN
  // SERVEIS GENERALS EXPEDIENT X2026000344 Codi Segur de Verificació:
  // 5b76eb56-f73c-4969-a70f-c15975134136 Origen: Administració Identificador document original:
  // ES_L01081000_2026_5158065 Data d'impressió: 15/07/2026 09:56:56 Pàgina 11 de 13 SIGNATURES 1.-
  // ANA ISABEL ARELLANO MARTINEZ (SIG), 14/07/2026 13:20 2.- MARIA ROSA PUJOL ESTEVE (R: P2504600D),
  // 14/07/2026 13:48 AJUNTAMENT D'AITONA Aquest document és una còpia autèntica del document
  // electrònic original. Validaci¢ de documents: https://aitona.e- registre.cat/OAC/ValidarDoc.jsp
  // Ì5b76eb56-f73c-4969-a70f-c˙/¯SB-¨6^˛ 11 Ajuntament d’Aitona Carrer Major, 6 25182 Aitona
  // (Lleida) CIF P2504600D Sisè. La modificació de les bases d’execució del pressupost s’han de
  // considerar definitivament aprovades si durant l’esmentat termini no es presenten reclamacions,
  // cas en què s’ha de publicar l’aprovació definitiva al BOP. Per la Sra. alcaldessa s’explica que
  // aquesta modificació afecta a les petites quantitats de diners que paga el Tresorer com a
  // bestreta de caixa fixa, conforme ha informat la interventora, per millorar la gestió d’aquests
  // diners quan sigui necessari. 5. Aprovació De la proposta de festes locals pel 2027 L’article
  // 37.2.1r de l’Estatut dels treballadors, aprovat per Reial decret legislatiu 2/2015, indica que
  // de les catorze festes laborals, dues tindran caràcter local. L’article 46 del Reial decret
  // 2001/1983, de 28 de juliol, indica que la competència per establir les dues festes locals
  // correspon al Ple. Vista l’Ordre EMT/52/2026, de 25 de març, per la qual s'estableix el calendari
  // oficial de festes laborals a Catalunya per a l'any 2027 (DOGC núm. 9637 de 01.04.2026). Per
  // tant, el Ple aprova amb els 6 vots a favor d’Aitona Primer i 3 més positius d’Aitona
  // Republicana, cosa que representa la majoria absoluta del nombre legal de membres de la
  // Corporació: Únic. Proposar al Departament d’Empresa i Treball de la Generalitat les següents
  // dates com a festes locals per a l’any 2027: 21 de maig (divendres) i 2 de setembre (dijous). Per
  // la Sra. alcaldessa es fa una esmena in voce, en el sentit que on diu 2026 ha de dir 2027.
  aitona: {
    local: ["2027-05-21", "2027-09-02"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Aitona de 5 de juny de 2026",
      ref: "Ajuntament d'Aitona, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2503870005/2026/a8c5126f-8785-4977-b76c-9d87d640db86/Acta%20Ple%2003-2026%2020260605%20extr..pdf",
    },
    act: { kind: "ple", date: "2026-06-05" },
    readOn: "2026-11-04",
  },
  // PRIMER.- Proposar i establir pel municipi de Cantallops, les següents festes locals per l’any
  // 2027: - 10 DE MAIG - 2 D’AGOST […] Aprovat per 6 vots a favor
  cantallops: {
    local: ["2027-05-10", "2027-08-02"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Cantallops de 18 de juny de 2026",
      ref: "Ajuntament de Cantallops, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1704120002/2026/c50c7503-2398-4b99-ae10-b1f7a86bdd0d/acta%20juny%202026.pdf",
    },
    act: { kind: "ple", date: "2026-06-18" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar com a festes locals d’aquest municipi per a l’any 2027:  17 de maig  13 de
  // setembre […] Resultat: Aprovat per unanimitat
  "sant-feliu-sasserra": {
    local: ["2027-05-17", "2027-09-13"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sant Feliu Sasserra de 25 de juny de 2026",
      ref: "Ajuntament de Sant Feliu Sasserra, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/821290004/2026/711b1e95-ea48-4446-8325-18b2d9918c82/Acta%20Ple%2025%20juny%202026pdf.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // PRIMER.- Designar com a dies festius locals per a l’any 2027 els següents: - 3 de febrer
  // (dimecres). - 29 de setembre (dimecres). SEGON.- Trametre el present acord al Departament
  // d’Empresa i Treball de la Generalitat de Catalunya. Sotmesa la proposta a votació, s'aprova per
  // 6 vots favorables, 0 en contra i 0 abstencions.
  almatret: {
    local: ["2027-02-03", "2027-09-29"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Almatret de 6 de juliol de 2026",
      ref: "Ajuntament d'Almatret, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2502080001/2026/d3038064-4239-466e-85a9-5604571731e8/20261028_Uns%20altres_ACTA%20DEL%20PLE%202026-0006%20%5BActa%20sessi%f3%20extraordinaria%206%20de%20juliol%202026%5D.pdf",
    },
    act: { kind: "ple", date: "2026-07-06" },
    readOn: "2026-11-04",
  },
  // El Ple, ACORDA: PRIMER. PROPOSAR al Departament d’Empresa i Treball, com a dies de festes locals
  // d’Alcover per a l’any 2027, el 16 d’agost (Sant Roc) i el 18 d’octubre (dilluns de la Festa
  // Major). SEGON. TRASLLADAR el present acord als Serveis Territorials a Tarragona del Departament
  // d’Empresa i Treball de la Generalitat de Catalunya. Sotmesa a votació dels membres assistents 11
  // d’A.P.C i 2 d’E.R.C), s’aprova per unanimitat.
  alcover: {
    local: ["2027-08-16", "2027-10-18"],
    names: ["Sant Roc", "dilluns de la Festa Major"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Alcover de 3 de juliol de 2026",
      ref: "Ajuntament d'Alcover, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4300560009/2026/ec6a70d3-eefa-403a-b9fd-9ff1a4c072c5/ACTA%20DEL%20PLE%202026-0005%20%5BActa%20sessi%f3%20ordin%e0ria%20Ple%2003.07.26%5D_Censurado.pdf",
    },
    act: { kind: "ple", date: "2026-07-03" },
    readOn: "2026-11-04",
  },
  // Òrgan: Ple Caràcter: Sessió Ordinària Data: 30 de juliol de 2026 Expedient núm. X2026001159 -
  // X2026001159 Aprovat Per Unanimitat […] PRIMER.- APROVAR com a festes locals de Sant Joan de les
  // Abadesses per l ’any 2027 els dies següents: - Dilluns dia 13 de setembre de 2027 - Dimarts dia
  // 14 de setembre de 2027
  "sant-joan-de-les-abadesses": {
    local: ["2027-09-13", "2027-09-14"],
    source: {
      name: "Notificació al Departament d’Empresa i Treball de l’acord del Ple de 30 de juliol de 2026 (Aprovació festes locals any 2027)",
      ref: "Ajuntament de Sant Joan de les Abadesses, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1716740003/2026/60257bcd-bf21-474a-aaca-bdc5727a95da/36417787_55d4133b_b_Resum7780603678031211514.pdf",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-11-04",
  },
  // PRIMER.- ESTABLIR com a festes locals del per a l’any 2027: elmunicipi de Bellvís dimecres 20 de
  // gener i el dimarts 26 d’octubre. SEGON.- ESTABLIR com a festes locals del per a l’any 2027:
  // elnucli agregat dels Arcs dilluns 18 de gener i el dilluns 4 d’octubre. TERCER.- NOTIFICAR
  // l’acord adoptat pel Ple al Departament d’Empresa i Treball de la Generalitat de Catalunya.
  // L’Alcaldessa exposa el punt i es sotmet a votació quedant aprovat per unanimitatACORD: dels
  // membres assistents amb 6 vots favorables
  bellvis: {
    local: ["2027-01-20", "2027-10-26"],
    nuclei: [
      { name: "els Arcs", dates: ["2027-01-18", "2027-10-04"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Bellvís de 28 de maig de 2026",
      ref: "Ajuntament de Bellvís, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2505230008/2026/34150de8-a0b9-4845-91ac-47d1586e3096/20260528_ACTA%20DEL%20PLE%202026-0004_EXTRA_URGENT.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // ACTA DE LA SESSIÓ DEL PLE DE L’AJUNTAMENT DEL DIA 22 D´ABRIL DE 2026 […] Primer.- Proposar al
  // Departament d’Empresa i Treball, de conformitat amb el que disposa l’article 37 de l’Estatut
  // dels treballadors i demés legislació vigent i concordant, les dues festes locals dels pobles del
  // municipi de Vilobí d’Onyar per l’any 2027 en les dates següents: • 25 de juny • 20 de juliol […]
  // Aprovat per 11 vots a favor
  "vilobi-d-onyar": {
    local: ["2027-06-25", "2027-07-20"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Vilobí d'Onyar de 22 d’abril de 2026",
      ref: "Ajuntament de Vilobí d'Onyar, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1723330008/2026/40af7f26-5f1a-4e2d-9a64-1862a0cdf50b/PLE2026000003_ACTA.pdf",
    },
    act: { kind: "ple", date: "2026-04-22" },
    readOn: "2026-11-04",
  },
  // 3.1. Declarar com a festes locals per a l’any 2027 les següents: - Dia 8 de setembre de 2027
  // (dimecres) - Dia 9 de setembre de 2027 (dijous) […] Sotmesa la proposta a votació, és aprovada
  // per unanimitat dels membres assistents al Ple i, per tant, per majoria absoluta de la
  // corporació.
  olius: {
    local: ["2027-09-08", "2027-09-09"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Olius de 16 de juny de 2026",
      ref: "Ajuntament d'Olius, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2515170005/2026/2b32bb94-2ca1-4ec7-b890-cf0ad95c5b87/ACTA%20PLE%20EXTRAORDINARI%2016062025_ANONIM.pdf",
    },
    act: { kind: "ple", date: "2026-06-16" },
    readOn: "2026-11-04",
  },
  // Primer.-“Proposar al Departament d’Empresa i Treball de la Generalitat de Catalunya com a festes
  // locals de Bordils per l’any 202 7, els dies 23 d’agost i 29 d’octubre” Sotmesa a votació la
  // proposta és aprovada per: 7 vots a favor
  bordils: {
    local: ["2027-08-23", "2027-10-29"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Bordils de 22 de juny de 2026",
      ref: "Ajuntament de Bordils, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1702550006/2026/4d7a0ed6-9d14-41ca-ad6d-37c22182283b/5-2026%20ACTA%20PLE%2022%20DE%20JUNY%202026.pdf",
    },
    act: { kind: "ple", date: "2026-06-22" },
    readOn: "2026-11-04",
  },
  // PRIMER.- PROPOSAR ESTABLIR pels tres nuclis, Cruïlles, Monells i Sant Sadurní de l’Heura, les
  // següents festes locals per l’any 2027: - 17 DE MAIG - 29 D’OCTUBRE SEGON.- DONAR TRASLLAT del
  // present acord al Departament de Treball, Afers socials i Famílies de la Generalitat de
  // Catalunya. Aprovat per 9 vots a favor
  "cruilles-monells-i-sant-sadurni-de-l-heura": {
    local: ["2027-05-17", "2027-10-29"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Cruïlles, Monells i Sant Sadurní de l'Heura de 11 de juny de 2026",
      ref: "Ajuntament de Cruïlles, Monells i Sant Sadurní de l'Heura, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1790110007/2026/ab28f19c-40ae-4b0b-8515-3beb74c57eab/acta%20PLE%2011.06.2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-11" },
    readOn: "2026-11-04",
  },
  // Favorable Tipus de votació: Unanimitat/Assentiment […] PRIMER.- Proposar al Departament
  // d’Empresa i Treball de la Generalitat de Catalunya coma dies festius locals a efectes laborals
  // corresponents a l’any 2027 al municipi de Sant Guim de la Plana els dies que es relacionen
  // segons detall: […] Nucli de Sant Guim de la Plana: 13 i 16 d’agost Nucli Vicfred 1 i 4 d’octubre
  // Nucli de Comabella 7 i 10 de maig
  "sant-guim-de-la-plana": {
    local: ["2027-08-13", "2027-08-16"],
    nuclei: [
      { name: "Vicfred", dates: ["2027-10-01", "2027-10-04"] },
      { name: "Comabella", dates: ["2027-05-07", "2027-05-10"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sant Guim de la Plana de 18 de juny de 2026",
      ref: "Ajuntament de Sant Guim de la Plana, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2519770005/2026/4165c329-42a4-4f8b-ab3e-d060fcd16720/20260910_Acta_ACTA%20DEL%20PLE%202026-0003%20%5BEsborrany%20d%27acta%5D%20(1).pdf",
    },
    act: { kind: "ple", date: "2026-06-18" },
    readOn: "2026-11-04",
  },
  // APROVACIÓ DEL CALENDARI DE FESTES LOCALS DE L'ANY 20275. Resultat: aprovat per la majoria
  // absoluta del nombre legal de membres del Ple. Vots a favor: 3 (2 INDEPENDENTS PER PRADELL DE LA
  // TEIXETA - AM i 1 JUNTS PER PRADELL DE LA TEIXETA -CM) Vots en contra: 0 Abstencions: 1 (1
  // REGIDORA NO ADSCRITA) […] S'ACORDA Primer.- Proposar al Departament d'Empresa i Treball les
  // dates de les dues festes locals, retribuïdes i no recuperables per al proper any: 19 de juliol
  // de 2027 27 de setembre de 2027
  "pradell-de-la-teixeta": {
    local: ["2027-07-19", "2027-09-27"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Pradell de la Teixeta de 25 de juny de 2026",
      ref: "Ajuntament de Pradell de la Teixeta, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4311530008/2026/16dd7eeb-1ff7-4cba-8f0d-ed29de4c355c/obtenirDocument.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // 3.- COMUNICACIONS DE SECRETARIA El Secretari comenta que, com cada any, s’ha remès des de la
  // Generalitat de Catalunya ofici sol·licitant les festes locals del municipi, que ha d’anar per
  // Ple. S’acorda que els dies festius proposats per l’any 2027, serien el 13 i 16 d’agost de 2027.
  "santa-pau": {
    local: ["2027-08-13", "2027-08-16"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Santa Pau de 3 de juny de 2026",
      ref: "Ajuntament de Santa Pau, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1718480001/2026/4309576c-f3e7-44a2-81d8-3c5f48716b9e/JGL_03062026.pdf",
    },
    act: { kind: "ple", date: "2026-06-03" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar com a dies festius locals per a l’any 2027 els següents: - 25 de novembre del
  // 2027 - 21 de desembre del 2027 Segon.- Donar trasllat d’aquest acord al Departament d’Empresa i
  // Treball de la Generalitat de Catalunya. Aprovat per 7 vots a favor
  "torroella-de-fluvia": {
    local: ["2027-11-25", "2027-12-21"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Torroella de Fluvià de 17 de juny de 2026",
      ref: "Ajuntament de Torroella de Fluvià, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1719840003/2026/35871794-ce01-4243-a8fb-b31f0c892c0f/Ple%20ordinari%20sessio%2017%20juny%2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // Festes locals 2027 — Municipi de Vilaller Vilaller: 16 d’agost, dilluns – Festivitat de Sant
  // Mamés 22 de novembre, dilluns - Festivitat de Sant Climent Senet: 14 de maig, divendres –
  // vespres de Sant Isidre 23 de juny, dimecres – vespres de Sant Joan Sotmesa la proposta anterior
  // a la consideració del Ple, resulta aprovada per unanimitat de les persones assistents i majoria
  // absoluta.
  vilaller: {
    local: ["2027-08-16", "2027-11-22"],
    names: ["Sant Mamés", "Sant Climent"],
    nuclei: [
      { name: "Senet", dates: ["2027-05-14", "2027-06-23"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Vilaller de 9 de juny de 2026",
      ref: "Ajuntament de Vilaller, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2524580001/2026/01009625-35cc-43eb-8c79-0d831bf1bce3/ACTA%20PLE%2001%2026%20ORD%2009%2006%2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-09" },
    readOn: "2026-11-04",
  },
  // APROVACIÓ DEL CALENDARI DE FESTES LOCALS PER A L’ANY 202714. El Sr. alcaldes exposa la proposta.
  // Com cada any l'ajuntament ha d'escollir dos dies de festes locals que s'afegiran al calendari de
  // les festes estatals i autonòmiques. Com que aquest any 2027 el 17 de gener cau en diumenge es
  // proposa el 18 de gener i per l 'agost el divendres dia 6. No hi ha més intervencions. Amb el vot
  // afirmatiu de tots els assistents (4 Junts i 1 ERC) […] S'ACORDA Primer.- Proposar al Departament
  // d’Empresa i Treball les dates de les dues festes locals, retribuïdes i no recuperables per al
  // proper any: 18 de gener de 2027 (dilluns) 6 d’agost de 2027 (divendres)
  "vimbodi-i-poblet": {
    local: ["2027-01-18", "2027-08-06"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Vimbodí i Poblet de 22 de juny de 2026",
      ref: "Ajuntament de Vimbodí i Poblet, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4317630008/2026/74a524fe-42b3-4ce3-9274-6296ec3a900d/Acta%202-26.pdf",
    },
    act: { kind: "ple", date: "2026-06-22" },
    readOn: "2026-11-04",
  },
  // PROPOSTA D'ACORD D'APROVAR, SI ESCAU, LES DUES FESTES LOCALS PER A5. L'ANY 2027 El ple de
  // l’Ajuntament aquesta proposta per dels assistents.aprova unanimitat […] S'ACORDA PRIMER.-
  // Proposar al Departament d’Empresa i Treball les dates de les dues festes locals, retribuïdes i
  // no recuperables per al proper any: 2 d’agost de 2027 (dilluns) 3 d’agost de 2027 (dimarts)
  batea: {
    local: ["2027-08-02", "2027-08-03"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Batea de 13 de juliol de 2026",
      ref: "Ajuntament de Batea, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4302280001/2026/384fa931-32f5-44ef-9569-563592425b0b/Acta%20Sessi%f3%20Ordin%e0ria%20Ple%2013%20de%20juliol%202026.pdf",
    },
    act: { kind: "ple", date: "2026-07-13" },
    readOn: "2026-11-04",
  },
  // CALENDARI DE FESTES LOCALS 202719. L’alcalde explica la proposta lliurada juntament amb la
  // convocatòria de la sessió ordinària. Seguidament es procedeix a la votació i, per unanimitat
  // dels membres presents, 8 vots a favor, s’aprova la proposta […] S'ACORDA - Proposar al
  // Departament d'Empresa i Treball les dates de les dues festes locals,Primer. retribuïdes i no
  // recuperables per al proper any: - Divendres 30 de juliol de 2027, corresponent al dia de Sant
  // Abdó i Sant Senén. - Dimecres 29 de setembre de 2027, corresponent al dia Sant Miquel.
  almoster: {
    local: ["2027-07-30", "2027-09-29"],
    names: ["Sant Abdó i Sant Senén", "Sant Miquel"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Almoster de 8 de juliol de 2026",
      ref: "Ajuntament d'Almoster, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4301150006/2026/0b4902fa-8f15-4da4-aa75-257304745430/ACTA%20SIGNADA%20SESSI%d3%20JULIUOL.pdf",
    },
    act: { kind: "ple", date: "2026-07-08" },
    readOn: "2026-11-04",
  },
  // PRIMER.- Aprovar la proposta de presentació dels dos dies de festa local del municipi de Sant
  // Vicenç de Torelló per a l’any 2027 tal com es relacionen: - Divendres 22 de gener de 2027 -
  // Dilluns 6 de setembre de 2027 SEGON.- Comunicar el present acord al Departament d’Empresa i
  // Treball, de la Generalitat de Catalunya, als efectes oportuns.” Ajuntament de Sant Vicenç de
  // Torelló 33 S’aprova per unanimitat.
  "sant-vicenc-de-torello": {
    local: ["2027-01-22", "2027-09-06"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sant Vicenç de Torelló de 29 de juliol de 2026",
      ref: "Ajuntament de Sant Vicenç de Torelló, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/826520002/2026/7dc499e8-127a-4c5b-90fd-a49e192550cb/Acta%20Ple%20ordinari%2029%20de%20juliol%20de%202026.pdf",
    },
    act: { kind: "ple", date: "2026-07-29" },
    readOn: "2026-11-04",
  },
  // FESTES LOCALS 20274. Queda aprovada per unanimitat […] S'ACORDA PRIMER.- Proposar al Departament
  // d'Empresa i Treball les següents dates de les dues festes locals, retribuïdes i no recuperables
  // per al proper any 2027: 9 d'abril (divendres) i 7 de desembre (dimarts).
  "el-pinell-de-brai": {
    local: ["2027-04-09", "2027-12-07"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament del Pinell de Brai de 1 de juliol de 2026",
      ref: "Ajuntament del Pinell de Brai, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4310680001/2026/fe6322d7-40db-4626-852f-960532de02b6/6B3DC1C318A2403D9EE948B827030F2D.pdf",
    },
    act: { kind: "ple", date: "2026-07-01" },
    readOn: "2026-11-04",
  },
  // Primer. Aprovar la proposta de festes locals per a l’any 2027 pel municipi de Torrefarrera els
  // dies 22 de gener i 13 de setembre de 2027. Segon. Comunicar aquest acord al Departament
  // d’Empresa i Treball. La Comissió dictamina favorablement la proposta. No obstant, el Ple
  // adoptarà l’acord que estimi oportú. ACORD: Sotmesa la proposta a votació, aquesta queda aprovada
  // per unanimitat del nombre legal de membres de la corporació
  torrefarrera: {
    local: ["2027-01-22", "2027-09-13"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Torrefarrera de 9 de juliol de 2026",
      ref: "Ajuntament de Torrefarrera, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2522870005/2026/15b25f56-93d1-43a7-9f7d-2a22629ccbf5/Esborrany%20acta%2009.07.26.pdf",
    },
    act: { kind: "ple", date: "2026-07-09" },
    readOn: "2026-11-04",
  },
  // 3 vots a favor: - Teresa Guerola Vernet - Josepa Folch Aguiló - Marc Loba Folch 2 abstencions
  // […] S'ACORDA Primer.- Proposar al Departament d'Empresa i Treball les dates de les dues festes
  // locals, retribuïdes i no recuperables per al proper any: 23 d’agost de 2027 24 d’agost de 2027
  "el-masroig": {
    local: ["2027-08-23", "2027-08-24"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament del Masroig de 27 de juliol de 2026",
      ref: "Ajuntament del Masroig, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4308250006/2026/3e421971-879e-483d-92c1-55dd5d5b80ae/ACTA%2027.06.2026.pdf",
    },
    act: { kind: "ple", date: "2026-07-27" },
    readOn: "2026-11-04",
  },
  // Primer.- Establir que les festes locals del municipi d’Argelaguer per a l’any 2027: - Dilluns 10
  // de maig - Dilluns 13 de desembre Segon.- Traslladar aquest acord al Departament de Treball,
  // Afers Socials i Famílies. Aprovat per 6 vots a favor
  argelaguer: {
    local: ["2027-05-10", "2027-12-13"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Argelaguer de 27 de maig de 2026",
      ref: "Ajuntament d'Argelaguer, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1701010007/2026/054e3744-e553-424c-ac0f-2d42669f711f/ACTA%20PLE%20%20NUM.%204%2027-05-2026.pdf",
    },
    act: { kind: "ple", date: "2026-05-27" },
    readOn: "2026-11-04",
  },
  // Primer.- Establir que les festes locals del municipi de Sales de Llierca per a l’any 2027: -
  // Divendres 23 d’abril - Dijous 11 de novembre Segon.- Traslladar aquest acord al Departament de
  // Treball, Afers Socials i Famílies. Aprovat per 5 vots a favor
  "sales-de-llierca": {
    local: ["2027-04-23", "2027-11-11"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sales de Llierca de 28 de maig de 2026",
      ref: "Ajuntament de Sales de Llierca, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1715440003/2026/fe511a9b-cd94-44cb-bd00-cf4395274da6/ACTA%203%20APROVADA.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // PRIMER. Proposar a la Conselleria d’Empresa i Treball de la Generalitat de Catalunya que siguin
  // fixades com a festes locals del municipi de Sant Ferriol per a l’any 2027, els dies: - 19 de
  // març de 2027, i - 17 de setembre 2027 SEGON. Comunicar aquest Acord als Serveis Territorials a
  // Girona del Departament d’Empresa i Treball de la Generalitat de Catalunya, als efectes oportuns.
  // RESULTAT Aprovat per 5 vots a favor
  "sant-ferriol": {
    local: ["2027-03-19", "2027-09-17"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sant Ferriol de 27 de maig de 2026",
      ref: "Ajuntament de Sant Ferriol, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1716210007/2026/9285ced2-1415-4e90-869d-a34a3f26d0da/tmp237780472699359247PLE2026000003_ACTAv2.pdf",
    },
    act: { kind: "ple", date: "2026-05-27" },
    readOn: "2026-11-04",
  },
  // 1r.- APROVAR com a festes locals del municipi de Sant Llorenç de la Muga per a l’any 2027 els
  // dies següents: • 09 d’agost de 2027 • 10 d’agost de 2027 […] Aprovat per 6 vots a favor
  "sant-llorenc-de-la-muga": {
    local: ["2027-08-09", "2027-08-10"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sant Llorenç de la Muga de 28 de maig de 2026",
      ref: "Ajuntament de Sant Llorenç de la Muga, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1717140003/2026/f52f82d2-a92c-482d-8f83-a7a614dba2ba/ACTA%20PLE%2028-05-2026.pdf",
    },
    act: { kind: "ple", date: "2026-05-28" },
    readOn: "2026-11-04",
  },
  // el Ple, per unanimitat dels assistents adopta els següents ACORDS: Primer.- Proposar al
  // Departament d’Empresa i Treball de la Generalitat de Catalunya com a dies festius locals a
  // efectes laborals corresponents a l’any 2027 al municipi d’Algerri els que […] es relacionen
  // segons detall: - 2 de febrer - 3 de febrer
  algerri: {
    local: ["2027-02-02", "2027-02-03"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Algerri de 25 de juny de 2026",
      ref: "Ajuntament d'Algerri, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2501560009/2026/971d4de4-8258-47a3-9e93-3b4605131b4d/Acta%20n%fam.%202%20de%20la%20sessi%f3%20plen%e0ria%20de%20data%2025%20de%20juny%20de%202026.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // dies festius locals a efectes laborals corresponents a l’any 2027 al municipi d’Ivars de Noguera
  // els següents dies festius: NUCLI FESTES LOCALS Ivars de Noguera 22 de gener i 3 de maig de 2027
  // Segon.- Comunicar el contingut del present acord als Serveis Territorials a Lleida del
  // Departament de Treball, Afers Socials i Famílies, pel seu coneixement i als oportuns efectes
  // legals». Es sotmet a votació i s’aprova aquest acord amb el vot favorable de QUATRE membres
  // presents en la sessió dels SET que legalment formen la corporació; amb el següent detall: - Vots
  // a favor: 4
  "ivars-de-noguera": {
    local: ["2027-01-22", "2027-05-03"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Ivars de Noguera de 30 de juny de 2026",
      ref: "Ajuntament d'Ivars de Noguera, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2511210007/2026/65ec4dd4-a469-4877-8974-caf1a63e8b49/20260827_Acta_Acta%20ple_ACTES%20PLE%202026-0002%20%5BACTA%20PLN%203_2026_ivars%5D%20(1).pdf",
    },
    act: { kind: "ple", date: "2026-06-30" },
    readOn: "2026-11-04",
  },
  // El Ple per unanimitat, ACORDA: PRIMER.-. Aprovar com a festes locals per a l’any 2027 per a tots
  // els nuclis del municipi de Baix Pallars els dies: · 20 de gener de 2027 (Sant Sebastià) · 7 de
  // desembre de 2027
  "baix-pallars": {
    local: ["2027-01-20", "2027-12-07"],
    names: ["Sant Sebastià", null],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Baix Pallars de 18 de juny de 2026",
      ref: "Ajuntament de Baix Pallars, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2503900000/2026/6394a464-cb73-418d-b57c-b1c40985fd7e/20261027_ACTA%20DEL%20PLE%202026-0003%20%5BACTA%20PLE%20ORDINARI%2018_06_26%5D.pdf",
    },
    act: { kind: "ple", date: "2026-06-18" },
    readOn: "2026-11-04",
  },
  // APROVACIÓ DEL CALENDARI DE FESTES LOCAL PER A L’ANY 20277. Aprovat per unanimitat […] S'ACORDA
  // Primer.- Proposar al Departament d’Empresa i Treball les dates de les dues festes locals,
  // retribuïdes i no recuperables per al proper any: 15 de gener 24 de setembre
  alforja: {
    local: ["2027-01-15", "2027-09-24"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Alforja de 17 de juny de 2026",
      ref: "Ajuntament d'Alforja, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4300940003/2026/00dc9836-78c8-4e82-9684-66ec538933a4/ACTA%20PLE%207%202026%20DE%2017%20DE%20JUNY%20(EXTRAORDINARI).pdf",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // APROVACIÓ DE LES DUES FESTES LOCALS DE L'ANY 2027.6. S'aprova per unanimitat dels set membres
  // assistents dels nou que composen legalment la Corporació […] S'ACORDA PRIMER. Proposar com a
  // festes locals de Benissanet per a l’any 2027, les següents: - 18 de gener, dilluns: Festa Major
  // d’Hivern en honor a Sant Antoni - 26 de juliol, dilluns: Festa Major d’estiu en honor a Sant
  // Jaume.
  benissanet: {
    local: ["2027-01-18", "2027-07-26"],
    names: ["Festa Major d’Hivern (Sant Antoni)", "Festa Major d’estiu (Sant Jaume)"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Benissanet de 25 de juny de 2026",
      ref: "Ajuntament de Benissanet, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4302650006/2026/14b0206c-3d14-42d8-bc4d-40a1f631bb0f/PLE%206%202026%20ORDINARIA.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // PRIMER.- Proposar al Departament d’Empresa i Treball de la Generalitat de Catalunya les següents
  // festes locals del municipi de Biure per a l’any 2027: - 16 de febrer de 2027 - 30 de març de
  // 2027 SEGON.- Notificar el present acord als Serveis Territorials a Girona del Departament
  // d’Empresa i Treball de la Generalitat de Catalunya. Aprovat per 5 vots a favor
  biure: {
    local: ["2027-02-16", "2027-03-30"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Biure de 18 de juny de 2026",
      ref: "Ajuntament de Biure, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1723480001/2026/6b942708-51f2-4ef6-a4ca-a95fdfa8b24f/acta%20juny.pdf",
    },
    act: { kind: "ple", date: "2026-06-18" },
    readOn: "2026-11-04",
  },
  // Primer.- Designar com a festes locals del municipi de Lladó, per a l’any 2027 El 18 de maig de
  // 2027 i 12 de juliol de 2027 Segon.- Comunicar el present acord al Departament d’Empresa i
  // Ocupació de la Generalitat de Catalunya per a la tramitació corresponent. Aprovat per 7 vots a
  // favor
  llado: {
    local: ["2027-05-18", "2027-07-12"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Lladó de 9 de juny de 2026",
      ref: "Ajuntament de Lladó, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1708870005/2026/472365f4-307a-4874-b84f-e87eba56d4ef/ACTA%20PLE%20ORDINARI%20JUNY%202026.pdf",
    },
    act: { kind: "ple", date: "2026-06-09" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar com a dues festes locals, a incloure al calendari laboral de l’any 2.027, les
  // següents: -Dia 28 de maig de 2027 -Dia 10 d’agost de 2.027 […] és aprovada per unanimitat dels
  // assistents amb 4 a favor dels regidors de l’AD’EG i dels 2 regidors de JUNTS per Guardiola de
  // Berguedà.
  "guardiola-de-bergueda": {
    local: ["2027-05-28", "2027-08-10"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Guardiola de Berguedà de 16 de juny de 2026",
      ref: "Ajuntament de Guardiola de Berguedà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/809960009/2026/430909bc-8417-49c4-9164-6b2177277202/ACTA%20DEL%20PLE%202026-0002%20%5BACTA%20PLE%20ORDINARI%2016-06-2026%5D.pdf",
    },
    act: { kind: "ple", date: "2026-06-16" },
    readOn: "2026-11-04",
  },
  // Primer.- Fer proposta de fixació com a festes locals del municipi per a l’any 20 27 els dies
  // següents: - Dilluns, dia 12 de juliol de 2027 - Divendres, dia 29 d’octubre de 2027 Segon.-
  // Comunicar-ho al Departament de Treball de la Generalitat de Catalunya Resultat Aprovat per
  // unanimitat: 7 Vots A Favor
  llambilles: {
    local: ["2027-07-12", "2027-10-29"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Llambilles de 16 de juny de 2026",
      ref: "Ajuntament de Llambilles, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1709040003/2026/d918ea0e-d891-464e-b08f-26148244240e/BORRADOR%20NO%20APROVAT%20ACTA%20PLE%2016-06-26.pdf",
    },
    act: { kind: "ple", date: "2026-06-16" },
    readOn: "2026-11-04",
  },
  // APROVACIÓ FESTES LOCALS 2027_APROVACIO FESTES LOCALS5. Aprovat per unanimitat de tots els
  // membres presents […] S'ACORDA Primer.- Proposar al Departament de Treball, Afers Socials i
  // Famílies les dates de les dues festes locals, retribuïdes i no recuperables per al proper any:
  // ... DILLUNS 17 DE MAIG DE 2027 ...DIMARTS 7 DE DESEMBRE 2027
  masdenverge: {
    local: ["2027-05-17", "2027-12-07"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Masdenverge de 25 de juny de 2026",
      ref: "Ajuntament de Masdenverge, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4307860009/2026/a86269cc-2b72-41a5-8e0e-5ee7898f2d7f/ACTA%20SIGNADA.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // PROPOSTA 'FESTES LOCALS 2027'9. S'aprova per unanimitat […] les dates de les dues festes locals,
  // retribuïdes i no recuperables per al proper any: Pontils : 23 i 24 de juliol de 2027
  // Vallespinosa : 30 de juliol i 31 de juliol 2027 Santa Perpètua de Gaià : 6 i 7 d'agost de 2027
  // Seguer : 13 i 14 d'agost de 2027 Sant Magí : 19 d'agost i 16 de setembre de 2027
  pontils: {
    local: ["2027-07-23", "2027-07-24"],
    nuclei: [
      { name: "Vallespinosa", dates: ["2027-07-30", "2027-07-31"] },
      { name: "Santa Perpètua de Gaià", dates: ["2027-08-06", "2027-08-07"] },
      { name: "Seguer", dates: ["2027-08-13", "2027-08-14"] },
      { name: "Sant Magí", dates: ["2027-08-19", "2027-09-16"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Pontils de 8 de juny de 2026",
      ref: "Ajuntament de Pontils, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4314180001/2026/543d8362-cba1-48e8-a2ec-e4dadf4a3bd9/acta-ple-juny-2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-08" },
    readOn: "2026-11-04",
  },
  // 11.- Dictamen d’aprovació dels dies festius locals corresponents a l’any 2027. (Exp. 2026_404).
  // […] Primer.- APROVAR com a festius locals corresponents a l’any 2027 el divendres dia 25 de juny
  // de 2027 i el dimarts 7 de desembre de 2027. Segon.- COMUNICAR l’adopció del present acord al
  // Departament d’Empresa i Treball. CODI DE L’EXPEDIENT: 421 NOM DE L’EXPEDIENT: 2026_421_PLE
  // ORDINARI_17-06-2026 C/ Major, 3 – 08256 Rajadell – Tel. 938 36 80 26 – NIF: P0817700H Sotmès el
  // dictamen a la consideració del Ple per la Presidència; la Corporació l’aprova per unanimitat
  // dels assistents.
  rajadell: {
    local: ["2027-06-25", "2027-12-07"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Rajadell de 17 de juny de 2026",
      ref: "Ajuntament de Rajadell, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/817860009/2026/d06fe597-6301-4315-b363-72383cea1ef7/ACTA_PLE_2026_3_Ple%20ordinari_17-06-2026_sig.pdf",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // festes locals per l'any 2027. Expedient 324/2026. Favorable Tipus de votació:
  // Unanimitat/Assentiment […] Primer.- Proposar al Departament d’Empresa i Treball de la
  // Generalitat de Catalunya, les següents dates com a festes de caràcter local al municipi de la
  // Pobla de Segur per a l’any 2027: 8 de maig 18 de juny
  "la-pobla-de-segur": {
    local: ["2027-05-08", "2027-06-18"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de la Pobla de Segur de 29 de maig de 2026",
      ref: "Ajuntament de la Pobla de Segur, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2517130008/2026/ed3ceba0-4955-4e1e-a038-2b6cfb4ca3d4/20261005_ACTA%20DEL%20PLE%202026-0004%20%5BActa%20del%20Ple%20Ordinari%2029%20maig%202026%5D%20(1).pdf",
    },
    act: { kind: "ple", date: "2026-05-29" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar com a festes locals de Juneda per a l’any 2027, els dies 30 i 31 d’agost de
  // 2027. Segon.- Traslladar el present acord al Departament d’Empresa i Treball de la Generalitat
  // de Catalunya. INTERVENCIONS:
  // https://actes.juneda.cat/session/sessionDetail/8a8180879ec8e40b019ed5a09b500001?start
  // At=2649.0&endsAt=2822.0 Sotmesa la proposta a votació és aprovada per 9 vots a favor (grups
  // municipals Impulsem- CM i Juneda Per Tu) i 2 abstencions (grup municipal PSC-CP).
  juneda: {
    local: ["2027-08-30", "2027-08-31"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Juneda de 18 de juny de 2026",
      ref: "Ajuntament de Juneda, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2511930008/2026/dcde6217-dd93-49ab-a800-35acf654a19c/ACTA_PLE_2026-0003_sessio_ordinaria_18-6-2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-18" },
    readOn: "2026-11-04",
  },
  // Expedient 690/2026. Festes.Aprovació del calendari de festes local per a l’any 2027 Favorable
  // Tipus de votació: Unanimitat/Assentiment […] Primer.- Proposar al Departament de Treball, Afers
  // Socials i Famílies les dates de les dues festes locals, retribuïdes i no recuperables per al
  // proper any: 23 d’abril de 2027 29 de juny de 2027
  "montbrio-del-camp": {
    local: ["2027-04-23", "2027-06-29"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Montbrió del Camp de 13 de juliol de 2026",
      ref: "Ajuntament de Montbrió del Camp, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4308840003/2026/23abf4e3-7212-41a6-bb66-2d2d3062b9ab/20260925_Uns%20altres_ACTA%20DE%20PLE%202026-0007%20%5BActa%20del%20ple%20ordinari%20del%2013%20de%20juliol%20de%202026,%208-26%5D%20(anonimitzat).pdf",
    },
    act: { kind: "ple", date: "2026-07-13" },
    readOn: "2026-11-04",
  },
  // Proposta de Dies de Festes Locals any 2027 Favorable Tipus de votació: Ordinària A favor: 6, En
  // contra: 0, Abstencions: 0, Absents: 0 […] PRIMER. Proposar que es determinin com a inhàbils per
  // al treball, retribuïts i no recuperables, l'any 2027 amb el caràcter de festes locals, els dies:
  // - 22 de gener : Sant Vicenç - 9 de febrer : Dimarts de Carnaval
  "esterri-d-aneu": {
    local: ["2027-01-22", "2027-02-09"],
    names: ["Sant Vicenç", "Dimarts de Carnaval"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Esterri d'Àneu de 25 de juny de 2026",
      ref: "Ajuntament d'Esterri d'Àneu, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2508640003/2026/74ebde6f-92a1-4610-ac7c-8afb6d2c767f/PLN_2026_3_Acta_Esborrany_Censurado.pdf",
    },
    act: { kind: "ple", date: "2026-06-25" },
    readOn: "2026-11-04",
  },
  // PROPOSAR al Departament d ’Empresa i Treball de la Generalitat de Catalunya la incorporació al
  // calendari laboral, com a festes de caràcter local per a l’any 2027, el dia 1 d’octubre i el dia
  // 29 d’octubre […] Aprovat per 9 vots a favor
  "fornells-de-la-selva": {
    local: ["2027-10-01", "2027-10-29"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Fornells de la Selva de 30 de juliol de 2026",
      ref: "Ajuntament de Fornells de la Selva, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1707360009/2026/8311e64b-8ca3-498e-b2a0-c523e3bc8322/PLE2026000004_ACTA%2030072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-11-04",
  },
  // El Ple, per unanimitat dels presents, acorda: PRIMER.- PROPOSAR al Departament d’Empresa i
  // Treball de la Generalitat de Catalunya les següents festes locals del municipi de Palau-sator
  // per a l’any 2027, - Per al nucli de Palau-sator, el 18 de gener i el 29 de juny. - Per al nucli
  // de Fontclara, el 15 de gener i el 10 de setembre. - Per al nucli de Sant Feliu de Boada, el 31
  // de juliol i el 2 d’agost. - Per al nucli de Sant Julià de Boada, el 9 de gener i el 31 de
  // juliol.
  "palau-sator": {
    local: ["2027-01-18", "2027-06-29"],
    nuclei: [
      { name: "Fontclara", dates: ["2027-01-15", "2027-09-10"] },
      { name: "Sant Feliu de Boada", dates: ["2027-07-31", "2027-08-02"] },
      { name: "Sant Julià de Boada", dates: ["2027-01-09", "2027-07-31"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Palau-sator de 22 de juliol de 2026",
      ref: "Ajuntament de Palau-sator, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1712150006/2026/4af8a06b-5fab-44f8-b28d-4ed71ff4e6f0/Acta%20Ple%2026-05%20ord%20de%2022%20de%20juliol.pdf",
    },
    act: { kind: "ple", date: "2026-07-22" },
    readOn: "2026-11-04",
  },
  // Per tot l’anterior, s’ACORDA: Primer. Establir que les dues festes locals del municipi de Sant
  // Feliu de Buixalleu per a l’any 2027, siguin les següents: • DIJOUS SANT: Dia 25 de març de 2027
  // (dijous) • FESTA MAJOR DE GASERANS: Dia 10 d’agost de 2027 (dimarts) Segon. Comunicar aquest
  // acord al Serveis Territorials del Departament d’Empresa i Treball a Girona. L’Alcalde, Xavier
  // Santos Rodoreda, del grup municipal ERC, exposa el resum de la proposta d’acord i la sotmet a
  // votació. Aprovat per 7 vots a favor
  "sant-feliu-de-buixalleu": {
    local: ["2027-03-25", "2027-08-10"],
    names: ["Dijous Sant", "Festa Major de Gaserans"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sant Feliu de Buixalleu de 29 de juny de 2026",
      ref: "Ajuntament de Sant Feliu de Buixalleu, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1715950006/2026/0fa96a4c-250f-412f-b2c6-98d7cf95be6e/Acta_ple_municipal_4_29062026.pdf",
    },
    act: { kind: "ple", date: "2026-06-29" },
    readOn: "2026-11-04",
  },
  // CORRESPONENTS A L’ANY 2027. La proposta ha estat lliurada als membres del Ple, juntament amb la
  // convocatòria d’aquesta sessió ordinària i l'alcalde, Sr. Oscar Sendra Anglès, la explica.
  // Seguidament l'alcalde demana als/a les membres assistents si tenen alguna consideració o esmena
  // a fer,i, com que no es formulen, es procedeix a la votació, i, per unanimitat dels membres
  // presents,5 vots a favor, s’aprova la proposta que literalment diu […] Fixar com a Festes Locals
  // previstes per l’Any 2027 al municipi d´Aiguamúrcia lesPRIMER.- següents. -Santes Creus 13 de
  // desembre i 23 d’agost -Les Pobles 10 maig i 13 desembre -El Pla de Manlleu 3 maig i 29 setembre
  // -Aiguamúrcia 16 d’agost, 13 de desembre -Alba, Masbarrat i Les Destres 16 agost i 13 desembre
  aiguamurcia: {
    local: ["2027-08-16", "2027-12-13"],
    nuclei: [
      { name: "Santes Creus", dates: ["2027-08-23", "2027-12-13"] },
      { name: "les Pobles", dates: ["2027-05-10", "2027-12-13"] },
      { name: "el Pla de Manlleu", dates: ["2027-05-03", "2027-09-29"] },
      { name: "Alba, Masbarrat i les Destres", dates: ["2027-08-16", "2027-12-13"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Aiguamúrcia de 8 de juny de 2026",
      ref: "Ajuntament d'Aiguamúrcia, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4300170005/2026/c12b843c-0035-475f-851e-110a4f9ff07b/ACTA%20SO%208-6-2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-08" },
    readOn: "2026-11-04",
  },
  // APROVACIÓ, SI ESCAU, DE LA PROPOSTA DELS FESTIUS LOCALS PER A L'ANY 2027.3. Aprovat per
  // unanimitat […] Primer. Proposar com a dies de festa local per a l'exercici 2027 els següents
  // dies: 17 de maig i 7 de desembre
  "alfara-de-carles": {
    local: ["2027-05-17", "2027-12-07"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Alfara de Carles de 17 de juny de 2026",
      ref: "Ajuntament d'Alfara de Carles, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4300810007/2026/d212bba3-0757-4434-bf0c-822e33b92a1b/Acta_1_4300810007_2026_0000216.pdf",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // Proposta de dies festius locals per a l’any 2027 Expedient 113/2026. Favorable Tipus de votació:
  // Unanimitat/Assentiment […] PRIMER. Elevar al Ple de la Corporació la següent proposta de dies
  // festius locals per a l’any 2027, per nuclis: – BIOSCA: Dijous 29 i Divendres 30 de juliol de
  // 2027 – LLOBEROLA: Dimarts 28 i Dimecres 29 de setembre de 2027
  biosca: {
    local: ["2027-07-29", "2027-07-30"],
    nuclei: [
      { name: "Lloberola", dates: ["2027-09-28", "2027-09-29"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Biosca de 18 de juny de 2026",
      ref: "Ajuntament de Biosca, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2505570005/2026/efdb20f1-60f4-4c00-8f13-0e62ae790161/20260728_Acta_ACTA%20DEL%20PLE%202026-0004%20%5BEsborrany%20d%27acta%5D%20(1).pdf",
    },
    act: { kind: "ple", date: "2026-06-18" },
    readOn: "2026-11-04",
  },
  // Aprovació de les festes locals 2027 Favorable Tipus de votació: Unanimitat/Assentiment […]
  // PRIMER. Proposar al Departament d’Empresa i Treball de la Generalitat de Catalunya com a dies
  // festius locals a efectes laborals corresponents a l’any 2027 al municipi d’Ivorra dels dies que
  // es relacionen segons detall: - 23 d’abril de 2027, divendres - 16 d’octubre de 2027, dissabte
  ivorra: {
    local: ["2027-04-23", "2027-10-16"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Ivorra de 2 de juny de 2026",
      ref: "Ajuntament d'Ivorra, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2511420002/2026/2921ebf4-70e6-4eba-a2ba-ca272da9f16d/20260603_Acta_ACTA%20DEL%20PLE%202026-0003%20%5BEsborrany%20d%27acta%5D.pdf",
    },
    act: { kind: "ple", date: "2026-06-02" },
    readOn: "2026-11-04",
  },
  // APROVACIÓ DEL CALENDARI DE FESTES LOCALS PER L'ANY 20277. […] S'ACORDA Primer.- Proposar al
  // Departament d’Empresa i Treball les dates de les dues festes locals, retribuïdes i no
  // recuperables per al proper any: 25 de gener 30 d'agost
  rodonya: {
    local: ["2027-01-25", "2027-08-30"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Rodonyà de 11 de juny de 2026",
      ref: "Ajuntament de Rodonyà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4313250006/2026/42436664-b2c6-4539-9cb2-e43e7faa9940/20260611PO_7.pdf",
    },
    act: { kind: "ple", date: "2026-06-11" },
    readOn: "2026-11-04",
  },
  // Expedient 66/2026. PROPOSTA DE FESTES LOCALS 2027 Favorable Tipus de votació:
  // Unanimitat/Assentiment […] Primer.- Proposar al Departament de treball les dues festes locals
  // del municipi de Sanaüja per a l’any 2027: 8 de setembre de 2027 22 de maig de 2027
  // The acta lists 8 September first; the days are kept in date order.
  sanauja: {
    local: ["2027-05-22", "2027-09-08"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sanaüja de 9 de juny de 2026",
      ref: "Ajuntament de Sanaüja, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2519190004/2026/712ae821-f768-4cdc-b54a-c0dd7b427159/20260610_Acta_ACTA%20DEL%20PLE%202026-0005%20%5BEsborrany%20d%27acta%5D.pdf",
    },
    act: { kind: "ple", date: "2026-06-09" },
    readOn: "2026-11-04",
  },
  // ACORD Primer. Proposar com a festes locals del municipi de Sant Jordi Desvalls així com també el
  // d’obertura dels establiments comercials per a l’any 2027: - 23 d’abril de 2027 […] - 29
  // d’octubre de 2027 Segon. Traslladar aquest acord al Departament Treball, Afers Socials i
  // Famílies de la Generalitat de Catalunya per a la seva aprovació”. L’Alcaldessa diu que han
  // escollit les festes de cada any, 23 d’abril i 29 d’octubre. Sense més intervencions, la proposta
  // es sotmet a votació quedant aprovada per UNANIMITAT amb 6 vots a favor
  "sant-jordi-desvalls": {
    local: ["2027-04-23", "2027-10-29"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sant Jordi Desvalls de 4 de juny de 2026",
      ref: "Ajuntament de Sant Jordi Desvalls, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1716680001/2026/82c5499f-2b17-4444-be19-6a85cf446a50/PLE2026000004.pdf",
    },
    act: { kind: "ple", date: "2026-06-04" },
    readOn: "2026-11-04",
  },
  // PRIMER. Proposar a la Conselleria d’Empresa i Treball de la Generalitat de Catalunya que siguin
  // fixades com a festes locals del municipi de Riudaura per a l’any 2027, els dies: - Dimecres 20
  // de gener de 2027 (Sant Sebastià), i - Dilluns 17 de maig de 2027 (Festes del Roser). […] Vots a
  // favor? Sis
  riudaura: {
    local: ["2027-01-20", "2027-05-17"],
    names: ["Sant Sebastià", "Festes del Roser"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Riudaura de 15 de juny de 2026",
      ref: "Ajuntament de Riudaura, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1714980001/2026/2f0606c0-065e-4de1-89f9-d0bb8bdf66d0/ACTA_PLE_5_EXTR_2026.pdf",
    },
    act: { kind: "ple", date: "2026-06-15" },
    readOn: "2026-11-04",
  },
  // Primer. Proposar que les festes del municipi, per l’any 202 7, siguin les següents d’acord amb
  // els següents nuclis de població: Sant Miquel de Campmajor: Santa Quitèria 22 de maig Sant Miquel
  // 29 de setembre Falgons: Sant Vicenç 22 de gener Sant Ferriol 18 de setembre Segon. Donar
  // trasllat de la present resolució als Serveis Territorials a Girona del Departament d’Empresa i
  // Treball de la Generalitat de Catalunya. Aprovat per 4 vots a favor
  "sant-miquel-de-campmajor": {
    local: ["2027-05-22", "2027-09-29"],
    names: ["Santa Quitèria", "Sant Miquel"],
    nuclei: [
      { name: "Falgons", dates: ["2027-01-22", "2027-09-18"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sant Miquel de Campmajor de 23 de juny de 2026",
      ref: "Ajuntament de Sant Miquel de Campmajor, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1717400000/2026/771a45dc-66db-4aaa-beb3-166d3f4266d8/ACTA%20PLE%20EXTRAORDINARI%2023062026%20SMC.pdf",
    },
    act: { kind: "ple", date: "2026-06-23" },
    readOn: "2026-11-04",
  },
  // PRIMER. Es proposa celebrar com a festes locals per l’any 2027 els dies 26 d’abril i 13 de […]
  // Ajuntament de Sunyer desembre. SEGON.
  sunyer: {
    local: ["2027-04-26", "2027-12-13"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sunyer de 2 de juny de 2026",
      ref: "Ajuntament de Sunyer, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2521200000/2026/f3473c18-5ddc-442b-b8ea-cc7905501b61/ACTA%20DEL%20PLE%20EXTRAORDINARI%202026_6.pdf",
    },
    act: { kind: "ple", date: "2026-06-02" },
    readOn: "2026-11-04",
  },
  // el Ple de la Corporació acorda aprovar com a festes locals del municipi per a l'any 2027 els
  // dies 14 de maig de i , i comunicar aquest acord als organismes competents als2027 13 d'agost de
  // 2027 efectes oportuns. L'acord és aprovat per unanimitat dels membres presents.
  tarres: {
    local: ["2027-05-14", "2027-08-13"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Tarrés de 8 de juny de 2026",
      ref: "Ajuntament de Tarrés, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2521890004/2026/aa20c213-0770-48a5-bc59-4095950000b1/20260608_Acta_ACTA%20DEL%20PLE%202026-0007%20%5BEsborrany%20d%27acta%5D.pdf",
    },
    act: { kind: "ple", date: "2026-06-08" },
    readOn: "2026-11-04",
  },
  // S'ACORDA Primer. Aprovar les següents festes locals per a l’any 2027 als nuclis del municipi de
  // Sarral: Nucli de Sarral: 23 de juliol de 2027 (Festa Major d’estiu) 27 de setembre de 2027
  // (Festa dels patrons Sant Cosme i Sant Damià) Nucli de Montbrió de la Marca: 20 de gener de 2027
  // (Sant Sebastià) 10 d’agost de 2027 (Sant Llorenç) Nucli de Vallverd: […] 30 d'abril de 2027
  // (Festa tradicional local) 13 d’agost de 2027 (Festa d’estiu)
  sarral: {
    local: ["2027-07-23", "2027-09-27"],
    names: ["Festa Major d’estiu", "Sant Cosme i Sant Damià"],
    nuclei: [
      { name: "Montbrió de la Marca", dates: ["2027-01-20", "2027-08-10"] },
      { name: "Vallverd", dates: ["2027-04-30", "2027-08-13"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sarral de 30 de juny de 2026",
      ref: "Ajuntament de Sarral, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4314230008/2026/439a1d5e-849f-4669-a72e-f5806882671a/004_PLE%20ORD%20300626.pdf",
    },
    act: { kind: "ple", date: "2026-06-30" },
    readOn: "2026-11-04",
  },
  // l’Ajuntament Ple, per majoria absoluta, per unanimitat dels sis membres presents, dels set que
  // legalment el componen, acorda: Primer.- Fixar els dos dies de Festa Local per a l’any 2027, del
  // munici pi de Vilagrassa en les dates següents: Vilagrassa: del 20 de gener i el 7 de desembre de
  // 2027.
  vilagrassa: {
    local: ["2027-01-20", "2027-12-07"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Vilagrassa de 2 de juny de 2026",
      ref: "Ajuntament de Vilagrassa, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2524450006/2026/d14905e1-ac0c-4a16-bc82-c5134744fb78/20260925_Acta_ACTA%20DEL%20PLE%202026-0002%20%5BAP2602%2002.06.2026%20ext%5D.pdf",
    },
    act: { kind: "ple", date: "2026-06-02" },
    readOn: "2026-11-04",
  },
  // APROVACIÓ DEL CALENDARI DE FESTES LOCALS PER A L'ANY 20271. S'aprova per unanimitat […] S'ACORDA
  // Primer.- Proposar al Departament d'Empresa i Treball, les dates de les dues festes locals,
  // retribuïdes i no recuperables per al proper any: Dia 6 d'agost, Sant Salvador […] Dia 16
  // d'agost, Sant Roc
  "vilanova-de-prades": {
    local: ["2027-08-06", "2027-08-16"],
    names: ["Sant Salvador", "Sant Roc"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Vilanova de Prades de 19 de juny de 2026",
      ref: "Ajuntament de Vilanova de Prades, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4316870005/2026/4fcebd79-fa86-4f29-8969-512454b7ebf0/Acta_5_4316870005_2026_0000178.pdf",
    },
    act: { kind: "ple", date: "2026-06-19" },
    readOn: "2026-11-04",
  },
  // Expedient 1266/2026. Aprovar Festes Locals 2027. Favorable Tipus de votació:
  // Unanimitat/Assentiment […] Primer.- Proposar com a festes locals retribuïdes i no recuperables
  // per l’any 2027, les següents: Divendres 23 juliol Dilluns 26 de juliol
  "sant-jaume-dels-domenys": {
    local: ["2027-07-23", "2027-07-26"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sant Jaume dels Domenys de 16 de juny de 2026",
      ref: "Ajuntament de Sant Jaume dels Domenys, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4313780001/2026/98877e0e-cefd-46cf-9903-903989429bb0/ACTA%20DEL%20PLE%202026-0005%20%5BACTA%20PLE%20ORD.%2016-06-2026%5D.pdf",
    },
    act: { kind: "ple", date: "2026-06-16" },
    readOn: "2026-11-04",
  },
  // Primer.- Escollir els dies 23 de juliol i 26 de juliol de 2027 com a festes locals del municipi
  // de Vilaür. Segon.- Trametre la proposta de dates al Departament d’Empresa i Treball de la
  // Generalitat de Catalunya als efectes oportuns. Aprovat per 4 vots a favor
  vilaur: {
    local: ["2027-07-23", "2027-07-26"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Vilaür de 29 de juny de 2026",
      ref: "Ajuntament de Vilaür, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1722290004/2026/c13ed309-f06a-421b-8c4b-f46b871e2e28/ACTA%2029%2006%202026.pdf",
    },
    act: { kind: "ple", date: "2026-06-29" },
    readOn: "2026-11-04",
  },
  // Per tant, el Ple Corporatiu amb el vot favorable de la totalitat dels membres presents, que eren
  // els set que legalment el componen, acorda: - Proposar com a festes locals de Vinaixa per a l’any
  // 2027 el dia 22 de març i el dia 30 d’agost.
  vinaixa: {
    local: ["2027-03-22", "2027-08-30"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Vinaixa de 17 de juny de 2026",
      ref: "Ajuntament de Vinaixa, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2525550006/2026/9b98e4a0-7efa-4f32-90ce-6e1b3f0ddef9/ACTA%20DEL%20PLE%202026-0005%20%5BActa%2017_06_2026%5D.pdf",
    },
    act: { kind: "ple", date: "2026-06-17" },
    readOn: "2026-11-04",
  },
  // Data: trenta de juny de dos mil vint-i-sis […] PRIMER: Proposar com a festes locals del municipi
  // de Vilanova de la Barca per a l’any 2027 les següents: - DILLUNS, DIA 16 D’AGOST DE 2027 -
  // DILLUNS, DIA 4 D’OCTUBRE DE 2027 SEGON: Trametre aquest acord als Serveis Territorials a Lleida
  // del Departament d’Empresa i Treball. El Sr. Alcalde passa la paraula a la Sra. Georgina Elies
  // que en dona compte. El Sr. Alcalde informa que la festa local del mes d’agost es proposa passar-
  // la de divendres a dilluns per temes logístics i de personal. Votació: Acord adoptat per
  // UNANIMITAT dels vuit regidors
  "vilanova-de-la-barca": {
    local: ["2027-08-16", "2027-10-04"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Vilanova de la Barca de 30 de juny de 2026",
      ref: "Ajuntament de Vilanova de la Barca, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2525420002/2026/2c63b76e-31b5-435b-9ba2-62e423cec875/ACTA%2020260630%20Acta%20sessi%f3%20ordin%e0ria%20Ple%2030%20juny%202026.pdf",
    },
    act: { kind: "ple", date: "2026-06-30" },
    readOn: "2026-11-04",
  },
  // Data: 29 de juliol de 2026 […] per unanimitat de llurs membres assistents S’ACORDA Codi
  // Validació: 59WFJMJPLKFZ9L3LEZHAHSL3H Verificació: https://vilanovaaguda.eadministracio.cat/
  // Document signat electrònicament des de la plataforma esPublico Gestiona | Pàgina 29 de 30 ACTA
  // DEL PLE Número: 2026-0005 Data: 28/09/2026 Ajuntament de Vilanova de l'Aguda Ajuntament de
  // Vilanova de l'Aguda Carrer Major 30, VILANOVA DE L'AGUDA. 25749 (Lleida). Tel. 973462177. Fax:
  // 973460927 Primer.- Proposar al Departament d’Empresa i Treball de la Generalitat de Catalunya
  // com a dies festius locals a efectes laborals corresponents a l’any 2027 al municipi de Vilanova
  // de l’Aguda els dies que es relacionen segons detall, per nuclis: -Vilanova de l’Aguda: 6 de març
  // (Santa Perpètua) i 14 d’Agost (Festa Major). -Ribelles: 15 maig (Celebració Sant Isidre) i 10 de
  // setembre (Festa Major) . -L’Alzina: 7 d'agost (dissabte de Festa Major) i 6 d'agost (Sant
  // Salvador). -Vilalta: 31 de juliol (dissabte de Festa Major) i 6 d'agost (Sant Salvador) .
  // -Guardiola: 24 d'abril (Dissabte de Festa Major) i 11 de novembre (Sant Martí)
  "vilanova-de-l-aguda": {
    local: ["2027-03-06", "2027-08-14"],
    names: ["Santa Perpètua", "Festa Major"],
    nuclei: [
      { name: "Ribelles", dates: ["2027-05-15", "2027-09-10"] },
      { name: "l’Alzina", dates: ["2027-08-06", "2027-08-07"] },
      { name: "Vilalta", dates: ["2027-07-31", "2027-08-06"] },
      { name: "Guardiola", dates: ["2027-04-24", "2027-11-11"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Vilanova de l'Aguda de 29 de juliol de 2026",
      ref: "Ajuntament de Vilanova de l'Aguda, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2524960009/2026/db809039-fab3-4a2a-8474-80b244e33e93/20260928_Acta_ACTA%20DEL%20PLE%202026-0005%20%5BEsborrany%20d%27acta%5D.pdf",
    },
    act: { kind: "ple", date: "2026-07-29" },
    readOn: "2026-11-04",
  },
  // APROVACIÓ DEL CALENDARI DE FESTES LOCALS PER A L'ANY 20274. Resultat: aprovat per la majoria
  // absoluta del nombre legal de membres del Ple Vots a favor: 4 (3 TDF- AMUNT i 1 PSC - CP) […]
  // S'ACORDA Primer.- Proposar al Departament d'Empresa i Treball les dates de les dues festes
  // locals, retribuïdes i no recuperables per al proper any: 2 de gener de 2027 7 d'agost de 2027
  "la-torre-de-fontaubella": {
    local: ["2027-01-02", "2027-08-07"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de la Torre de Fontaubella de 26 de juny de 2026",
      ref: "Ajuntament de la Torre de Fontaubella, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4315150006/2026/b3aee4d7-ba31-42d5-943a-b551ac577d77/Acta_1_4315150006_2026_0000133.pdf",
    },
    act: { kind: "ple", date: "2026-06-26" },
    readOn: "2026-11-04",
  },
  // 1. Establir com a festes locals pel municipi d’Ivars d’Urgell per l’any 2027, les següents
  // dates: Ivars d’Urgell: Dia 07 de juny de 2027 Festa Major (dilluns) Dia 30 de novembre 2027:
  // Sant Andreu (dimarts) Vallverd: Dia 19 de març de 2027: Festa local (divendres) Dia 1 d’octubre
  // de 2027 Festa Major (divendres) 2. Notificar aquest acord al Departament d'Empresa i Treball.
  // Intervencions: No n’hi ha Votació: La proposta és aprovada per unanimitat dels membres presents:
  // Vots a favor vuit (8): sis (6) Endavant – Acord Municipal (E-AM) i dos (2) Compromís Municipal
  // (CM) Vots en contra zero (0) Abstencions zero (0)
  "ivars-d-urgell": {
    local: ["2027-06-07", "2027-11-30"],
    names: ["Festa Major", "Sant Andreu"],
    nuclei: [
      { name: "Vallverd", dates: ["2027-03-19", "2027-10-01"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Ivars d'Urgell de 1 de juliol de 2026",
      ref: "Ajuntament d'Ivars d'Urgell, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2511370005/2026/c95c121d-bb44-4d8f-b6ad-99b8b6cf5c02/20261020_Acta_Acta%20ple_ACTA%20DEL%20PLE%202026-0005%20%5BACTA_PLE_N%daM_04_PLE_ORDINARI_01_07_2026%5D.pdf",
    },
    act: { kind: "ple", date: "2026-07-01" },
    readOn: "2026-11-04",
  },
  // Resolució: PRIMER.- Proposar com festes locals del municipi d’Olesa de Bonesvalls per a 2027,
  // els següents dies: • 20 de gener de 2027 • 19 de juliol de 2027
  "olesa-de-bonesvalls": {
    local: ["2027-01-20", "2027-07-19"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament d'Olesa de Bonesvalls de 28 de juliol de 2026",
      ref: "Ajuntament d'Olesa de Bonesvalls, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/814610007/2026/9936d3ca-d9c4-4e78-9a8c-8388190c0d24/20260930_Acta_Acta%20ple_ACTA%20DEL%20PLE%202026-0004%20%5BACTA_PLN_ORD_28072026%5D-1.pdf",
    },
    act: { kind: "ple", date: "2026-07-28" },
    readOn: "2026-11-04",
  },
  // FESTES LOCALS PER A L’ANY 2027. EXP. [2026-8. 0000438] La Sra. Alcaldessa, sotmet a la
  // consideració, així com a la seva aprovació, el calendari de Festes Locals per a l'any 2027. […]
  // S'ACORDA Primer.- Proposar al Departament de Treball, Afers Socials i Famílies (o equivalent,
  // segons la distribució departamental adoptada en cada moment per la generalitat de Catalunya) les
  // dates de les dues festes locals, retribuïdes i no recuperables per al proper any: […] Dimecres,
  // 08 de setembre de 2027 Dijous, 09 de setembre de 2027
  benifallet: {
    local: ["2027-09-08", "2027-09-09"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Benifallet de 10 de juliol de 2026",
      ref: "Ajuntament de Benifallet, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4302520002/2026/87236467-2d47-4d20-845c-27271d2cf698/Sessio_05_2026_10072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-10" },
    readOn: "2026-11-04",
  },
  // El Ple aprova per unanimitat dels s is membres presents, dels set que composen el Ple, els
  // següents ACORDS Primer.- Formular la proposta de les festes locals del municipi de Collsuspina
  // per a l’any 2027, els següents dies: Dilluns 2 d’agost – FESTA MAJOR Divendres 1 d’octubre
  collsuspina: {
    local: ["2027-08-02", "2027-10-01"],
    names: ["Festa Major", null],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Collsuspina de 2 de juliol de 2026",
      ref: "Ajuntament de Collsuspina, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/807060009/2026/7ca385be-9aab-4d7c-8a78-ad50dca88045/20260715_Acta_Acta%20ple_ACTA%20DEL%20PLE%202026-0004%20%5BACTA%20PLE%20SESSIO%20ORDINARIA%202%20DE%20JULIOL%20DE%202024%2002072026%5D.pdf",
    },
    act: { kind: "ple", date: "2026-07-02" },
    readOn: "2026-11-04",
  },
  // APROVACIÓ DEL CALENDARI DE FESTES LOCALS PER A L'ANY 20274. No es produeixen intervencions i es
  // procedeix a la votació. El calendari de festes locals per a l'any 2027 s'aprova per unanimitat
  // dels assistents […] S'ACORDA Primer. Proposar al Departament d'Empresa i Treball de la
  // Generalitat de Catalunya que les dues festes locals del municipi de Freginals, retribuïdes i no
  // recuperables, corresponents a l'any 2027 siguin les següents: […] 24 d'agost de 2027. 7 de
  // desembre de 2027.
  freginals: {
    local: ["2027-08-24", "2027-12-07"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Freginals de 30 de juliol de 2026",
      ref: "Ajuntament de Freginals, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4306290004/2026/26079dc3-4f16-4444-88b0-46ffeeb2f5eb/comp_30_07_Acta_1_4306290004_2026_0000530-2.pdf",
    },
    act: { kind: "ple", date: "2026-07-30" },
    readOn: "2026-11-04",
  },
  // 3.- Festius Locals corresponents a l’any 2027 […] El Ple de l’Ajuntament de Riu de Cerdanya
  // acorda, per unanimitat dels seus membres: Primer.- Proposar al Departament d’Empresa i Treba ll
  // la fixació com a festes locals del municipi de Riu de Cerdanya els dies 20 de gener i el dia 25
  // de juny.
  "riu-de-cerdanya": {
    local: ["2027-01-20", "2027-06-25"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Riu de Cerdanya de 31 de juliol de 2026",
      ref: "Ajuntament de Riu de Cerdanya, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2591390004/2026/e5b08e07-90ba-4a62-be3d-135e23a83f61/ACTA%20SESSI%d3%2031072026.pdf",
    },
    act: { kind: "ple", date: "2026-07-31" },
    readOn: "2026-11-04",
  },
  // Primer.- Proposar al Departament d’Empresa i Treball les dues festes laborals de caràcter local
  // del municipi de Vilalba dels Arcs per a l’any 2027, els dies 25 de març i 10 d’agost.
  "vilalba-dels-arcs": {
    local: ["2027-03-25", "2027-08-10"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Vilalba dels Arcs de 2 de juliol de 2026",
      ref: "Ajuntament de Vilalba dels Arcs, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4317500000/2026/66d7c90c-3462-4891-b35e-a6184dc25e9a/ACTA%20DEL%20PLE%202026-0004%20de%20%2002_07_26.pdf",
    },
    act: { kind: "ple", date: "2026-07-02" },
    readOn: "2026-11-04",
  },
  // DESIGNACIÓ DE LES FESTES LOCALS DE TIVENYS PER A L'ANY 20275. Aprovat per unanimitat […]
  // S'ACORDA Primer.- Proposar com a dies de festes locals del municipi de Tivenys per a l’any 2027
  // els següents: el dia 15 de gener de 2027 i el 29 de setembre de 2027.
  tivenys: {
    local: ["2027-01-15", "2027-09-29"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Tivenys de 8 de juliol de 2026",
      ref: "Ajuntament de Tivenys, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4314950006/2026/b77b5245-cef0-4722-b5bc-6cb4261a674f/Acta%20Ple%20extraordinari%208%20de%20juliol%20de%202026.pdf",
    },
    act: { kind: "ple", date: "2026-07-08" },
    readOn: "2026-11-04",
  },
  // EL PLE DE L’AJUNTAMENT, PER UNANIMITAT DELS MEMBRES ASSISTENTS (5), ACORDA: PRIMER.- Determinar,
  // com a proposta amb caràcter definitiu, que les dues festes locals del Municipi de la Fatarella
  // per a l’any 2027 siguin el dilluns 8 de febrer i el dimecres 8 de setembre.
  "la-fatarella": {
    local: ["2027-02-08", "2027-09-08"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de la Fatarella de 13 de juliol de 2026",
      ref: "Ajuntament de la Fatarella, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4305680001/2026/cb52dc11-fd65-43e0-a82e-0123775de81e/ACTA%20PLE%202026-07-13%20(10).pdf",
    },
    act: { kind: "ple", date: "2026-07-13" },
    readOn: "2026-11-04",
  },
  // APROVAR, SI S'ESCAU, LA PROPOSTA D’APROVACIÓ DEL CALENDARI DE FESTES8. LOCALS PER A L'ANY 2027.
  // Queda aprovada la proposta d'acord, PER UNANIMITAT dels 6 regidors assistents. […] S'ACORDA
  // Primer.- Proposar al Departament d’Empresa i Treball les dates de les dues festes locals,
  // retribuïdes i no recuperables per a l’any vinent: 23 d’abril de 2027, Sant Jordi. 17 de maig de
  // 2027, dilluns de la segona Pasqua.
  blancafort: {
    local: ["2027-04-23", "2027-05-17"],
    names: ["Sant Jordi", "dilluns de la segona Pasqua"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Blancafort de 26 de maig de 2026",
      ref: "Ajuntament de Blancafort, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4302900000/2026/2ab47359-85fa-44f6-ac06-817db427c502/Acta%20Ple%20extraordin%e0ri%20de%20data%2026%20de%20maig%20de%202026.pdf",
    },
    act: { kind: "ple", date: "2026-05-26" },
    readOn: "2026-11-04",
  },
  // El Ple de la Corporació, d’acord amb allò que estableix l’article 46 del Reial Decret 2001/1983,
  // de 28 de juliol, per unanimitat dels assistents, ACORDA: Primer.- Fixar com a Festes Locals del
  // Municipi de Colomers per a l’any 2027, el dimarts dia 19 de gener de 2027, i el dijous dia 9 de
  // setembre de 2027. Segon.- AUTORITZAR al Sr. Alcalde de la Corporació per executar l’acord
  // esmentat. Tercer.- TRAMETRE certificació del present acord al Departament d’Empresa i Treball de
  // la Generalitat de Catalunya. Aprovat per 5 vots a favor
  colomers: {
    local: ["2027-01-19", "2027-09-09"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Colomers de 7 de maig de 2026",
      ref: "Ajuntament de Colomers, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1705580001/2026/7292e365-9042-4df4-a7c2-71dbc7e5cff0/Acta%20Ple%20Ordinari%2007.05.26.pdf",
    },
    act: { kind: "ple", date: "2026-05-07" },
    readOn: "2026-11-04",
  },
  // El Ple de l’ Ajuntament, per unanimitat dels seus membres presents, ACORDA: PRIMER.- Proposar el
  // calendari de festes locals per a l’ any 2027 del municipi de Gavet de la Conca, seran els
  // següents: -El dia 18 de gener de 2027 -El dia 27 de setembre de 2027.
  "gavet-de-la-conca": {
    local: ["2027-01-18", "2027-09-27"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Gavet de la Conca de 27 de maig de 2026",
      ref: "Ajuntament de Gavet de la Conca, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2509840003/2026/31d85fa1-fb4a-4161-ae9b-261f74e868de/ACTA%20DEL%20PLE%202026-0005%20%5BEsborrany%20d%27acta%5D.pdf",
    },
    act: { kind: "ple", date: "2026-05-27" },
    readOn: "2026-11-04",
  },
  // Primer. Proposar com a festes locals del municipi per a l’any 2027 els següents dies: El dia 17
  // de maig de 2027 per tot el municipi (dilluns de Pasqua granada) El dia 10 de juliol de 2027 pel
  // nucli de Fonolleres (Festa Major). El dia 2 d’agost de 2027 pel nucli de Parlavà (Festa Major).
  // Segon. Traslladar aquest acord al Departament d’Empresa i Treball de la Generalitat de
  // Catalunya. Votació: Sotmesa a votació la present proposta va ser aprovada per unanimitat en
  // nombre de sis vots (6).
  parlava: {
    local: ["2027-05-17", "2027-08-02"],
    names: ["dilluns de Pasqua granada", "Festa Major"],
    nuclei: [
      { name: "Fonolleres", dates: ["2027-05-17", "2027-07-10"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Parlavà de 27 de maig de 2026",
      ref: "Ajuntament de Parlavà, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1712670005/2026/e2182f53-4e0f-43fd-bf87-92b5d70ac5d1/5_ACTA_PLE_ORDINARI_27_MAIG_2026.pdf",
    },
    act: { kind: "ple", date: "2026-05-27" },
    readOn: "2026-11-04",
  },
  // ACORDS Primer.- Proposar com a dies festius locals per a l’any 2027 els següents: - 3 de maig
  // del 2027 - 29 de setembre del 2027 Segon.- Donar trasllat d’aquest acord al Departament
  // d’Empresa i Treball de la Generalitat de Catalunya. Aprovat per 7 vots a favor
  "sant-miquel-de-fluvia": {
    local: ["2027-05-03", "2027-09-29"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Sant Miquel de Fluvià de 25 de maig de 2026",
      ref: "Ajuntament de Sant Miquel de Fluvià, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1717530008/2026/ea872fa9-a5b3-4d9f-97c9-0ea28e9fa67e/Acta%20Ple%2025%20maig%20del%202026.pdf",
    },
    act: { kind: "ple", date: "2026-05-25" },
    readOn: "2026-11-04",
  },
  // PROPOSTA D'APROVACIÓ DE LES FESTES LOCALS PER L'ANY 2027 AL MUNICIPI DE5. SAVALLÀ DEL COMTAT
  // Aprovat per unanimitat amb tres vots a favor […] S'ACORDA Primer.- Aprovar el calendari de
  // festes locals 2027 de la següent manera: SEGURA: 21 i 22 de maig. SAVALLÀ DEL COMTAT: 1 i 2
  // d'octubre.
  "savalla-del-comtat": {
    local: ["2027-10-01", "2027-10-02"],
    nuclei: [
      { name: "Segura", dates: ["2027-05-21", "2027-05-22"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Savallà del Comtat de 22 de maig de 2026",
      ref: "Ajuntament de Savallà del Comtat, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4314390004/2026/f59b5104-a910-411c-a18b-1ac10417ca0d/02_22_05_2026_extraordinari.pdf",
    },
    act: { kind: "ple", date: "2026-05-22" },
    readOn: "2026-11-04",
  },
  // Primer.- APROVAR que les dues festes locals del municipi de Toses per a l’any 2027 seran: • 23
  // de juliol de 2027 • 11 d’octubre de 2027 Segon.- NOTIFICAR aquest acord al Departament d’Empresa
  // i Treball de la Generalitat de Catalunya als efectes oportuns. VOTACIÓ: Aprovat per 5 vots a
  // favor
  toses: {
    local: ["2027-07-23", "2027-10-11"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Toses de 26 de maig de 2026",
      ref: "Ajuntament de Toses, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/1720180001/2026/374dd322-0df2-43db-9a10-631a19f1b883/ACTA_PLE_ORDINARI_26-05-26.pdf",
    },
    act: { kind: "ple", date: "2026-05-26" },
    readOn: "2026-11-04",
  },
  // La Coma i la Pedra Festes locals 2027 Favorable Tipus de votació: Unanimitat/Assentiment […] El
  // Ple acorda per unanimitat: 1r.- Determinar els dies 17 de maig (2a. Pasqua) i 16 d’agost
  "la-coma-i-la-pedra": {
    local: ["2027-05-17", "2027-08-16"],
    names: ["2a. Pasqua", null],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de la Coma i la Pedra de 29 de maig de 2026",
      ref: "Ajuntament de la Coma i la Pedra, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2516360009/2026/c3ac9dd1-30f6-4601-9a1e-43b362312b7d/20260601_Acta_ACTA%20DEL%20PLE%202026-0004%20%5BEsborrany%20d%27acta%5D.pdf",
    },
    act: { kind: "ple", date: "2026-05-29" },
    readOn: "2026-11-04",
  },
  // APROVACIÓ DEL CALENDARI DE FESTES LOCALS PER A L’ANY 20271. Sotmesa la proposta a votació,
  // s'aprova per unanimitat dels membres presents, amb 5 vots a favor […] S'ACORDA Primer.- Proposar
  // al Departament d’Empresa i Treball de la Generalitat de Catalunya les dates de les dues festes
  // locals, retribuïdes i no recuperables per al proper any: 22 de juliol (dijous) 5 d’agost (dious)
  "la-nou-de-gaia": {
    local: ["2027-07-22", "2027-08-05"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de la Nou de Gaià de 26 de maig de 2026",
      ref: "Ajuntament de la Nou de Gaià, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4309760009/2026/4ccd4ec0-3c2b-4bf1-9287-6d121cd5fe82/Acta%205-2026.pdf",
    },
    act: { kind: "ple", date: "2026-05-26" },
    readOn: "2026-11-04",
  },
  // s’acorda per unanimitat dels nou membres assistents dels nou que integren el nombre de dret de
  // la Corporació Municipal: Únic: Fixar les dues festes locals del municipi de Fogars de la Selva
  // per a l’exercici 2027, el divendres 14 de maig i el divendres 17 de setembre.
  "fogars-de-la-selva": {
    local: ["2027-05-14", "2027-09-17"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Fogars de la Selva de 21 d’agost de 2026",
      ref: "Ajuntament de Fogars de la Selva, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/808260009/2026/57ef8c70-2c96-4cfb-bc8b-0e007c3daf64/ACTA%20PLE%2021082026.pdf",
    },
    act: { kind: "ple", date: "2026-08-21" },
    readOn: "2026-11-04",
  },
  // Expedient 493/2026. Establiment de les festes locals per a l'any 2027 Favorable Tipus de
  // votació: Ordinària Tipus de majoria: Simple A favor: 4, En contra: 0, Abstencions: 0, Absents: 0
  // […] PRIMER.- Proposar al Departament d’Empresa i Treball de la Generalitat de Catalunya les
  // dates següents com a festes locals, retribuïdes i no recuperables, del municipi de Vilanova de
  // Segrià per a l’any 2027: • 18 de gener de 2027 (diluns) • 19 de juliol de 2027 (dilluns)
  "vilanova-de-segria": {
    local: ["2027-01-18", "2027-07-19"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Vilanova de Segrià de 6 d’agost de 2026",
      ref: "Ajuntament de Vilanova de Segrià, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2525160009/2026/5431e87a-6be8-449a-a6a0-e5b172917062/ACTA%20PLE%20extraordinari%206%20d%27agost.pdf",
    },
    act: { kind: "ple", date: "2026-08-06" },
    readOn: "2026-11-04",
  },
  // PRIMER.- Proposar per a l’any 2027, els dies festius locals següents: Al municipi de la Secuita:
  // el 9 de juliol i el 16 d’agost (per les festivitats de Sant Cristòfol i Assumpció de la Mare de
  // Déu). No obstant, com el municipi consta d’altres nuclis de població, i cada any també es
  // proposen dies festius per aquests nuclis, seran els següents: A l’Argilaga: el 25 de gener i el
  // 16 d’agost (per les festivitats de Conversió de Sant Pau i Sant Roc). A Vistabella: el 5 de
  // gener i el 24 d’agost ( per les festivitats de Reis i Sant Bertomeu). A les Gunyoles: el 20 de
  // gener i el 26 de juliol ( per les festivitats de Sant Fructuós i Sant Jaume). SEGON.- Enviar
  // certificació d’aquest acord a la Direcció dels serveis territorials a Tarragona del Departament
  // d’Empresa i Treball de la Generalitat de Catalunya. Sotmès a aprovació prèvia deliberació,
  // s’aprova per unanimitat amb el vot favorable dels 6 membres de la corporació
  "la-secuita": {
    local: ["2027-07-09", "2027-08-16"],
    names: ["Sant Cristòfol", "Assumpció de la Mare de Déu"],
    nuclei: [
      { name: "l’Argilaga", dates: ["2027-01-25", "2027-08-16"] },
      { name: "Vistabella", dates: ["2027-01-05", "2027-08-24"] },
      { name: "les Gunyoles", dates: ["2027-01-20", "2027-07-26"] },
    ],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de la Secuita de 17 d’agost de 2026",
      ref: "Ajuntament de la Secuita, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/4314440003/2026/33c64696-1dcc-4a99-bcdf-d2c1d796ba60/20260821_Acta_ACTA%20DEL%20PLE%202026-0008%20%5BActa%20sessi%f3%20ordinaria%209_2026%20de%20data%2017%20d%27agost%20de%202026%5D.pdf",
    },
    act: { kind: "ple", date: "2026-08-17" },
    readOn: "2026-11-04",
  },
  // Data i hora: 19 d’agost de 2026 […] Resolució: Primer. Aprovar com a festes locals del municipi
  // de la Granadella per a l'any 2027 els dies següents: 18 de gener de 2027 (dilluns). 14 de
  // setembre de 2027 (dimarts).
  "la-granadella": {
    local: ["2027-01-18", "2027-09-14"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de la Granadella de 19 d’agost de 2026",
      ref: "Ajuntament de la Granadella, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2510180001/2026/40f6f704-47ca-47c7-93bf-210d4e49f45b/ACTAPLE8.pdf",
    },
    act: { kind: "ple", date: "2026-08-19" },
    readOn: "2026-11-04",
  },
  // Primer.- Declarar com a festes locals per a l’any 2027 les següents: · Dia 21 de maig de 2027 ·
  // Dia 1 d’octubre de 2027 Segon.- Trametre l’anterior acord als Serveis Territorials de Lleida del
  // Departament d’ Empresa i Ocupació per a la seva inclusió a l’Ordre de Festes Locals a Catalunya
  // per al 2027. El Sr. Alcalde comenta que durant l’anualitat 2026 s’han d etrametre els festius
  // locals de 2027, pel que es proposa l’aprovació dels dies 21 de maig en motiu de la festa de Sta.
  // Quitèria i el dia 1 d’octubre en motiu de la Festa de la poma i les cassoles. S’enviarà als
  // diferents departaments per al seu coneixement i per a la correcta confecció del calendari del
  // curs escolar de 2026-2027. Posat a votació, s’aprova per unanimitat dels 5 membres presents.
  corbins: {
    local: ["2027-05-21", "2027-10-01"],
    names: ["Santa Quitèria", "Festa de la poma i les cassoles"],
    source: {
      name: "Acta de la sessió del Ple de l’Ajuntament de Corbins de 17 d’abril de 2026",
      ref: "Ajuntament de Corbins, actes del Ple (seu electrònica)",
      url: "https://media.seu-e.cat/acteca/2507880001/2026/1ba57e29-5d5a-4061-8a38-67b4879ab193/20260817_Acta_Acta%20ple_ACTA%20DEL%20PLE%202026-0005%20%5BACTA%20PLE%2017042026%20-%20PLE%205%5D.pdf",
    },
    act: { kind: "ple", date: "2026-04-17" },
    readOn: "2026-11-04",
  },
};

/**
 * Towns added on 4 Nov 2026, inside the measurement window of the town pages'
 * 3 Nov retitle (docs/SEO_EXPERIMENTS.md, "2026-11-03 — CTR sweep" and
 * "2026-11-04"). Their pages give the council's days in the body (the line
 * under the lead, the 2027 section and table, the FAQ, the Dataset), but the
 * title, the H1 and the meta description stay as they were, without 2027
 * (`councilForMetadata` in `data.ts`). Emptying this list puts 2027 in their
 * titles and descriptions, as in the other council towns'.
 */
export const COUNCIL_2027_METADATA_HELD: ReadonlySet<string> = new Set<string>([
  "sabadell", "valls", "castell-d-aro-platja-d-aro-i-s-agaro", "manlleu", "salou", "salt", "seva",
  "els-hostalets-de-pierola", "castelltercol", "la-torre-de-claramunt", "sant-julia-de-vilatorta",
  "gaia", "lluca", "alpens", "sant-agusti-de-llucanes", "linyola", "peralada",
  "montferrer-i-castellbo", "mont-ras", "la-tallada-d-emporda", "riells-i-viabrea",
  "sant-feliu-de-llobregat", "montornes-del-valles", "castellar-de-n-hug", "pacs-del-penedes",
  "piera", "arenys-de-munt", "viladecans", "capolat", "carme", "castellfollit-de-riubregos",
  "avinyo", "castellgali", "castelloli", "el-brull", "figols", "fogars-de-montclus", "fonollosa",
  "granera", "vinyols-i-els-arcs", "rossello", "l-aldea", "castellvell-del-camp",
  "sant-llorenc-de-morunys", "artesa-de-segre", "llavorsi", "santa-eugenia-de-berga",
  "sant-quirze-de-besora", "castellcir", "martorell", "torredembarra", "das",
  "sant-pere-de-riudebitlles", "odena", "santa-maria-de-miralles", "talamanca", "pontons",
  "sant-pere-sallavinera", "olost", "vidra", "tagamanent", "santa-maria-de-palautordera",
  "montseny", "vilobi-del-penedes", "torrelles-de-foix", "sobremunt", "les-masies-de-roda",
  "rupit-i-pruit", "mediona", "les-masies-de-voltrega", "prats-de-llucanes", "l-estany", "gava",
  "lloret-de-mar", "mollet-del-valles", "polinya", "roda-de-bera", "montmelo", "celra",
  "puigcerda", "vacarisses", "porrera", "llanca", "palau-saverdera", "moia", "vilafant",
  "les-borges-del-camp", "sarria-de-ter", "folgueroles", "deltebre", "sant-cugat-sesgarrigues",
  "sant-boi-de-llucanes", "sant-hipolit-de-voltrega", "sant-marti-d-albars",
  "sant-llorenc-d-hortons", "viladrau", "santa-eulalia-de-riuprimer", "tavernoles",
  "santa-maria-de-besora", "sant-marti-de-centelles", "olivella", "organya", "alcarras",
  "coll-de-nargo", "palau-de-santa-eulalia", "fontcoberta", "breda", "flaca", "mollo",
  "la-figuera", "macanet-de-la-selva", "vallbona-de-les-monges", "bassella", "albanya",
  "alcoletge", "les-preses", "alio", "cervia-de-ter", "vallfogona-de-ripolles", "alguaire",
  "beuda", "camarasa", "l-armentera", "agullana", "viladasens", "naves", "massanes", "el-rourell",
  "la-riera-de-gaia", "el-far-d-emporda", "albatarrec", "viladamat", "el-pont-d-armentera",
  "la-guingueta-d-aneu", "massalcoreig", "pinell-de-solsones", "el-perello", "figuerola-del-camp",
  "belianes", "tiurana", "barbens", "prullans", "vilanova-de-bellpuig", "salomo", "juia", "alcano",
  "lladurs", "albinyana", "la-molsosa", "el-palau-d-anglesola", "almenar", "la-floresta",
  "capmany", "capcanes", "castellnou-de-seana", "horta-de-sant-joan", "sant-climent-sescebes",
  "montagut-i-oix", "castellfollit-de-la-roca", "vall-llobrega", "estaras", "castelldans",
  "riudellots-de-la-selva", "amer", "guimera", "aldover", "pals", "l-aleixar", "parets-del-valles",
  "montgat", "porqueres", "sant-quinti-de-mediona", "pont-de-molins", "martorelles", "subirats",
  "l-ampolla", "roda-de-ter", "la-canonja", "cadaques", "vilanova-del-valles",
  "sant-pere-pescador", "bellver-de-cerdanya", "sitges", "la-garriga", "palamos-i-sant-joan",
  "santa-coloma-de-farners", "corbera-de-llobregat", "calonge-i-sant-antoni", "altafulla",
  "el-morell", "l-ametlla-de-mar", "alcanar", "santa-coloma-de-cervello", "la-jonquera", "falset",
  "santa-margarida-i-els-monjos", "tremp", "el-poal", "masquefa", "el-molar", "la-granada",
  "rocafort-de-queralt", "ordis", "ribes-de-freser", "sant-andreu-salou", "pontos", "puigpelat",
  "vallfogona-de-riucorb", "el-pont-de-suert", "bellmunt-del-priorat", "la-pobla-de-lillet",
  "bascara", "maia-de-montcal", "aitona", "cantallops", "sant-feliu-sasserra", "almatret",
  "alcover", "sant-joan-de-les-abadesses", "bellvis", "vilobi-d-onyar", "olius", "bordils",
  "cruilles-monells-i-sant-sadurni-de-l-heura", "sant-guim-de-la-plana", "pradell-de-la-teixeta",
  "santa-pau", "torroella-de-fluvia", "vilaller", "vimbodi-i-poblet", "batea", "almoster",
  "sant-vicenc-de-torello", "el-pinell-de-brai", "torrefarrera", "el-masroig", "argelaguer",
  "sales-de-llierca", "sant-ferriol", "sant-llorenc-de-la-muga", "algerri", "ivars-de-noguera",
  "baix-pallars", "alforja", "benissanet", "biure", "llado", "guardiola-de-bergueda", "llambilles",
  "masdenverge", "pontils", "rajadell", "la-pobla-de-segur", "juneda", "montbrio-del-camp",
  "esterri-d-aneu", "fornells-de-la-selva", "palau-sator", "sant-feliu-de-buixalleu",
  "aiguamurcia", "alfara-de-carles", "biosca", "ivorra", "rodonya", "sanauja",
  "sant-jordi-desvalls", "riudaura", "sant-miquel-de-campmajor", "sunyer", "tarres", "sarral",
  "vilagrassa", "vilanova-de-prades", "sant-jaume-dels-domenys", "vilaur", "vinaixa",
  "vilanova-de-la-barca", "vilanova-de-l-aguda", "la-torre-de-fontaubella", "ivars-d-urgell",
  "olesa-de-bonesvalls", "benifallet", "collsuspina", "freginals", "riu-de-cerdanya",
  "vilalba-dels-arcs", "tivenys", "la-fatarella", "blancafort", "colomers", "gavet-de-la-conca",
  "parlava", "sant-miquel-de-fluvia", "savalla-del-comtat", "toses", "la-coma-i-la-pedra",
  "la-nou-de-gaia", "fogars-de-la-selva", "vilanova-de-segria", "la-secuita", "la-granadella",
  "corbins",
]);

/** The slugs with council data, in no particular order. */
export function councilSlugs(): string[] {
  return Object.keys(COUNCIL_2027);
}

/**
 * Towns where the DOGC order, once parsed, gives other days than the council
 * did (or none): a person checks each before the deploy. `dogc` is the
 * `municipalities` map `prepare2027` builds.
 */
export function councilDisagreements(dogc: Record<string, { local: string[] }>): { slug: string; council: string[]; dogc: string[] }[] {
  return Object.entries(COUNCIL_2027)
    .map(([slug, entry]) => ({ slug, council: [...entry.local], dogc: [...(dogc[slug]?.local ?? [])].sort() }))
    .filter((row) => row.council.join() !== row.dogc.join());
}
