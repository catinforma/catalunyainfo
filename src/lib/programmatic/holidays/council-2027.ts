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
