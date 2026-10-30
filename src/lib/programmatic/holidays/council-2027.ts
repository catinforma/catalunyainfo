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
};

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
