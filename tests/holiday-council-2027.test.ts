import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { BARCELONA_LOCAL, CATALONIA_HOLIDAYS } from "../src/lib/content/holidays/payload.ts";
import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  comarcaCopy,
  councilLabel,
  hubCopy,
  municipalityCopy,
  municipalityDescription,
  municipalityFaq,
  municipalityH1,
  municipalityTitle,
} from "../src/lib/programmatic/holidays/copy.ts";
import { COUNCIL_2027, COUNCIL_2027_METADATA_HELD, councilDisagreements, councilSlugs } from "../src/lib/programmatic/holidays/council-2027.ts";
import {
  NEXT,
  NEXT_YEAR,
  YEAR,
  comarcaOf,
  councilApproved2027,
  councilApprovedTowns,
  councilForMetadata,
  municipalityBySlug,
  nextYearPublished,
  statusDays,
  yearRows,
} from "../src/lib/programmatic/holidays/data.ts";
import { hasEnglishPage } from "../src/lib/programmatic/holidays/english.ts";
import { englishHubCopy, englishTownCopy, englishTownDescription, englishTownFaq, englishTownTitle } from "../src/lib/programmatic/holidays/english-copy.ts";
import { dayMonth, dayPair, weekdayName } from "../src/lib/programmatic/holidays/format.ts";
import { municipalityDataset } from "../src/lib/programmatic/holidays/structured.ts";

/**
 * Next year's local days as the councils approved them (council-2027.ts),
 * shown before the DOGC order with the label "approved by the council,
 * pending the DOGC order". The order, once parsed, always wins.
 */

const ROOT = join(import.meta.dirname, "..");
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const valid = (iso: string) => ISO.test(iso) && new Date(`${iso}T12:00:00Z`).toISOString().slice(0, 10) === iso;
const town = (slug: string) => {
  const m = municipalityBySlug(slug);
  assert.ok(m, slug);
  return m;
};

/**
 * Each town's own domain, or the provincial bulletins. A source must sit on
 * one of these (or a subdomain); the AOC's shared e-seu (`seu-e.cat`) counts
 * only under the town's own path. Press and aggregators never qualify.
 */
const COUNCIL_DOMAIN: Record<string, string> = {
  barcelona: "bcn.cat",
  "l-hospitalet-de-llobregat": "l-h.cat",
  badalona: "badalona.cat",
  lleida: "paeria.cat",
  mataro: "mataro.cat",
  reus: "reus.cat",
  girona: "girona.cat",
  "cornella-de-llobregat": "cornella.cat",
  "sant-boi-de-llobregat": "santboi.cat",
  rubi: "rubi.cat",
  manresa: "manresa.cat",
  granollers: "granollers.cat",
  figueres: "figueres.cat",
  "esplugues-de-llobregat": "esplugues.cat",
  blanes: "blanes.cat",
  "vilafranca-del-penedes": "vilafranca.cat",
  ripollet: "ripollet.cat",
  olot: "olot.cat",
  "sant-adria-de-besos": "sant-adria.cat",
  "montcada-i-reixac": "montcada.cat",
  tortosa: "seu-e.cat/web/tortosa/",
  "sant-joan-despi": "sjdespi.cat",
  "premia-de-mar": "premiademar.cat",
  "sant-vicenc-dels-horts": "svh.cat",
  "molins-de-rei": "molinsderei.cat",
  "sant-andreu-de-la-barca": "sabarca.cat",
  palafrugell: "palafrugell.cat",
  "vila-seca": "vila-seca.cat",
  amposta: "amposta.cat",
  "sant-just-desvern": "santjust.cat",
  banyoles: "banyoles.cat",
  roses: "roses.cat",
  "caldes-de-montbui": "caldesdemontbui.cat",
  "la-llagosta": "llagosta.cat",
  "premia-de-dalt": "premiadedalt.cat",
  alella: "alella.cat",
  cervera: "cervera.cat",
  "sant-fost-de-campsentelles": "santfost.cat",
  vidreres: "vidreres.cat",
  artes: "artes.cat",
  capellades: "capellades.cat",
  "castellbell-i-el-vilar": "castellbellielvilar.cat",
  "castellvi-de-rosanes": "castellviderosanes.cat",
  "la-llacuna": "lallacuna.cat",
  riudarenes: "ajuntamentderiudarenes.cat",
  pau: "pau.cat",
  "sant-cugat-del-valles": "santcugat.cat",
  "vilanova-i-la-geltru": "vilanova.cat",
  castelldefels: "castelldefels.org",
  "el-prat-de-llobregat": "elprat.cat",
  vic: "vic.cat",
  "el-vendrell": "elvendrell.net",
  "olesa-de-montserrat": "olesademontserrat.cat",
  "el-masnou": "elmasnou.cat",
  "sant-feliu-de-guixols": "seu-e.cat/ca/web/santfeliudeguixols/",
  "vilassar-de-mar": "vilassardemar.cat",
  tarrega: "tarrega.cat",
  cardedeu: "cardedeu.cat",
  // Tordera's own documents folder on the AOC e-seu (the signed acta of its Ple of 25 June 2026).
  tordera: "seu-e.cat/documents/1437609/",
  "sant-celoni": "santceloni.cat",
  balaguer: "balaguer.cat",
  cubelles: "cubelles.cat",
  canovelles: "canovelles.cat",
  berga: "ajberga.cat",
  "arenys-de-mar": "arenysdemar.cat",
  vallirana: "vallirana.cat",
  "la-rapita": "larapita.cat",
  "palau-solita-i-plegamans": "palauplegamans.cat",
  "canet-de-mar": "canetdemar.cat",
  abrera: "ajuntamentabrera.cat",
  santpedor: "santpedor.cat",
  riudoms: "riudoms.cat",
  navarcles: "navarcles.cat",
  "sant-hilari-sacalm": "santhilari.cat",
  "sant-pol-de-mar": "santpol.cat",
  "llica-d-amunt": "llicamunt.cat",
  cunit: "cunit.cat",
  castellbisbal: "castellbisbal.cat",
  "badia-del-valles": "badiadelvalles.cat",
  "sant-sadurni-d-anoia": "santsadurni.cat",
  "torroella-de-montgri": "torroella-estartit.cat",
  "sant-andreu-de-llavaneres": "ajllavaneres.cat",
  "la-bisbal-d-emporda": "labisbal.cat",
  ripoll: "ripoll.cat",
  "vilassar-de-dalt": "vilassardedalt.cat",
  "sant-fruitos-de-bages": "santfruitos.cat",
  viladecavalls: "viladecavalls.cat",
  guissona: "guissona.cat",
  taradell: "taradell.cat",
  "puig-reig": "puig-reig.cat",
  "el-pont-de-vilomara-i-rocafort": "elpont.cat",
  gurb: "gurb.cat",
  "llinars-del-valles": "llinarsdelvalles.cat",
  cervello: "cervello.cat",
  llagostera: "llagostera.cat",
  "el-papiol": "elpapiol.cat",
  "sant-vicenc-de-castellet": "svc.cat",
  constanti: "constanti.cat",
  "santa-cristina-d-aro": "santacristina.cat",
  "vilanova-del-cami": "vilanovadelcami.cat",
  roquetes: "roquetes.cat",
  begues: "begues.cat",
  "sant-vicenc-de-montalt": "svmontalt.cat",
  suria: "suria.cat",
  "sant-joan-de-vilatorrada": "santjoanvilatorrada.cat",
  "l-escala": "lescala.cat",
  "caldes-de-malavella": "caldesdemalavella.cat",
  // The council's own actes folder on the AOC e-seu (entity 821070005, the code its Actes de Ple page uses).
  "sant-feliu-de-codines": "media.seu-e.cat/acteca/821070005/",
  sils: "sils.cat",
  "l-ametlla-del-valles": "ametlla.cat",
  sallent: "sallent.cat",
  sabadell: "sabadell.cat",
  valls: "valls.cat",
  "castell-d-aro-platja-d-aro-i-s-agaro": "platjadaro.com",
  manlleu: "manlleu.cat",
  salou: "salou.cat",
  // Salt's own documents folder on the AOC e-seu (the acta its Actes de Ple page links).
  salt: "seu-e.cat/documents/28465/",
  seva: "seva.cat",
  "els-hostalets-de-pierola": "elshostaletsdepierola.cat",
  castelltercol: "castelltersol.cat",
  "la-torre-de-claramunt": "latorredeclaramunt.cat",
  "sant-julia-de-vilatorta": "vilatorta.cat",
  gaia: "gaia.cat",
  lluca: "lluca.cat",
  alpens: "alpens.cat",
  "sant-agusti-de-llucanes": "santagustidellucanes.cat",
  linyola: "ajuntamentdelinyola.cat",
  peralada: "peralada.org",
  "montferrer-i-castellbo": "montferrercastellbo.cat",
  "mont-ras": "mont-ras.cat",
  "la-tallada-d-emporda": "latallada.cat",
  // The council's own actes folder on the AOC e-seu (entity 1714630008: INE 17146 plus check digit).
  "riells-i-viabrea": "media.seu-e.cat/acteca/1714630008/",
  // The council's own actes folder on the AOC e-seu (entity 821140003, DIR3 L01082114).
  "sant-feliu-de-llobregat": "media.seu-e.cat/acteca/821140003/",
  // The council's own actes folder on the AOC e-seu (entity 813630008: INE 08136 plus check digit).
  "montornes-del-valles": "media.seu-e.cat/acteca/813630008/",
  "castellar-de-n-hug": "ajcastellardenhug.cat",
  "pacs-del-penedes": "pacsdelpenedes.cat",
  // The council's own actes folder on the AOC e-seu (entity 816140003: INE 08161 plus check digit).
  piera: "media.seu-e.cat/acteca/816140003/",
  // The council's own actes folder on the AOC e-seu (entity 800760009: INE 08007 plus check digit).
  "arenys-de-munt": "media.seu-e.cat/acteca/800760009/",
  // The council's own actes folder on the AOC e-seu (entity 830150006: INE 08301 plus check digit).
  viladecans: "media.seu-e.cat/acteca/830150006/",
  // The council's own actes folder on the AOC e-seu (entity 804590004: INE 08045 plus check digit).
  capolat: "media.seu-e.cat/acteca/804590004/",
  // The council's own actes folder on the AOC e-seu (entity 804840003: INE 08048 plus check digit).
  carme: "media.seu-e.cat/acteca/804840003/",
  // The council's own actes folder on the AOC e-seu (entity 806080001: INE 08060 plus check digit).
  "castellfollit-de-riubregos": "media.seu-e.cat/acteca/806080001/",
  // The council's own actes folder on the AOC e-seu (entity 801210007: INE 08012 plus check digit).
  avinyo: "media.seu-e.cat/acteca/801210007/",
  // The council's own actes folder on the AOC e-seu (entity 806150006: INE 08061 plus check digit).
  castellgali: "media.seu-e.cat/acteca/806150006/",
  // The council's own actes folder on the AOC e-seu (entity 806360009: INE 08063 plus check digit).
  castelloli: "media.seu-e.cat/acteca/806360009/",
  // The council's own actes folder on the AOC e-seu (entity 802660009: INE 08026 plus check digit).
  "el-brull": "media.seu-e.cat/acteca/802660009/",
  // The council's own actes folder on the AOC e-seu (entity 808040003: INE 08080 plus check digit).
  figols: "media.seu-e.cat/acteca/808040003/",
  // The council's own actes folder on the AOC e-seu (entity 808110007: INE 08081 plus check digit).
  "fogars-de-montclus": "media.seu-e.cat/acteca/808110007/",
  // The council's own actes folder on the AOC e-seu (entity 808470005: INE 08084 plus check digit).
  fonollosa: "media.seu-e.cat/acteca/808470005/",
  // The council's own actes folder on the AOC e-seu (entity 809580001: INE 08095 plus check digit).
  granera: "media.seu-e.cat/acteca/809580001/",
  // The council's website on the Diputació de Tarragona's municipal hosting (altanet.org).
  "vinyols-i-els-arcs": "vinyols.altanet.org",
  rossello: "rossello.cat",
  "l-aldea": "laldea.cat",
  "castellvell-del-camp": "castellvelldelcamp.cat",
  "sant-llorenc-de-morunys": "santllorens.ddl.net",
  "artesa-de-segre": "artesadesegre.cat",
  llavorsi: "llavorsi.cat",
  "santa-eugenia-de-berga": "santaeugenia.cat",
  "sant-quirze-de-besora": "ajsantquirze.cat",
  castellcir: "castellcir.cat",
  // The council's own actes folder on the AOC e-seu (entity 811410007: INE 08114 plus check digit).
  martorell: "media.seu-e.cat/acteca/811410007/",
  // The council's own actes folder on the AOC e-seu (entity 4315360009: INE 43153 plus check digit).
  torredembarra: "media.seu-e.cat/acteca/4315360009/",
  // The council's own actes folder on the AOC e-seu (entity 1706170005: INE 17061 plus check digit).
  das: "media.seu-e.cat/acteca/1706170005/",
  // The council's own actes folder on the AOC e-seu (entity 823250006: INE 08232 plus check digit).
  "sant-pere-de-riudebitlles": "media.seu-e.cat/acteca/823250006/",
  // The council's own actes folder on the AOC e-seu (entity 814300000: INE 08143 plus check digit).
  odena: "media.seu-e.cat/acteca/814300000/",
  // The council's own actes folder on the AOC e-seu (entity 825730008: INE 08257 plus check digit).
  "santa-maria-de-miralles": "media.seu-e.cat/acteca/825730008/",
  // The council's own actes folder on the AOC e-seu (entity 827790004: INE 08277 plus check digit).
  talamanca: "media.seu-e.cat/acteca/827790004/",
  // The council's own actes folder on the AOC e-seu (entity 816880001: INE 08168 plus check digit).
  pontons: "media.seu-e.cat/acteca/816880001/",
  // The council's own actes folder on the AOC e-seu (entity 818970005: INE 08189 plus check digit).
  "sant-pere-sallavinera": "media.seu-e.cat/acteca/818970005/",
  // The council's own actes folder on the AOC e-seu (entity 814960009: INE 08149 plus check digit).
  olost: "media.seu-e.cat/acteca/814960009/",
  // The council's own actes folder on the AOC e-seu (entity 1721210007: INE 17212 plus check digit).
  vidra: "media.seu-e.cat/acteca/1721210007/",
  // The council's own actes folder on the AOC e-seu (entity 827630008: INE 08276 plus check digit).
  tagamanent: "media.seu-e.cat/acteca/827630008/",
  // The council's own actes folder on the AOC e-seu (entity 825920002: INE 08259 plus check digit).
  "santa-maria-de-palautordera": "media.seu-e.cat/acteca/825920002/",
  // The council's own actes folder on the AOC e-seu (entity 813790004: INE 08137 plus check digit).
  montseny: "media.seu-e.cat/acteca/813790004/",
  // The council's own actes folder on the AOC e-seu (entity 830410007: INE 08304 plus check digit).
  "vilobi-del-penedes": "media.seu-e.cat/acteca/830410007/",
  // The council's own actes folder on the AOC e-seu (entity 828830008: INE 08288 plus check digit).
  "torrelles-de-foix": "media.seu-e.cat/acteca/828830008/",
  // The council's own actes folder on the AOC e-seu (entity 827110007: INE 08271 plus check digit).
  sobremunt: "media.seu-e.cat/acteca/827110007/",
  // The council's own actes folder on the AOC e-seu (entity 811670005: INE 08116 plus check digit).
  "les-masies-de-roda": "media.seu-e.cat/acteca/811670005/",
  // The council's own actes folder on the AOC e-seu (entity 890190004: INE 08901 plus check digit).
  "rupit-i-pruit": "media.seu-e.cat/acteca/890190004/",
  // The council's own actes folder on the AOC e-seu (entity 812280001: INE 08122 plus check digit).
  mediona: "media.seu-e.cat/acteca/812280001/",
  // The council's own actes folder on the AOC e-seu (entity 811730008: INE 08117 plus check digit).
  "les-masies-de-voltrega": "media.seu-e.cat/acteca/811730008/",
  // The council's own actes folder on the AOC e-seu (entity 817120002: INE 08171 plus check digit).
  "prats-de-llucanes": "media.seu-e.cat/acteca/817120002/",
  // The council's own actes folder on the AOC e-seu (entity 807900000: INE 08079 plus check digit).
  "l-estany": "media.seu-e.cat/acteca/807900000/",
  // The council's own actes folder on the AOC e-seu (entity 808980001: INE 08089 plus check digit).
  gava: "media.seu-e.cat/acteca/808980001/",
  // The council's own actes folder on the AOC e-seu (entity 1709500000: INE 17095 plus check digit).
  "lloret-de-mar": "media.seu-e.cat/acteca/1709500000/",
  // The council's own actes folder on the AOC e-seu (entity 812490004: INE 08124 plus check digit).
  "mollet-del-valles": "media.seu-e.cat/acteca/812490004/",
  // The council's own actes folder on the AOC e-seu (entity 816720002: INE 08167 plus check digit).
  polinya: "media.seu-e.cat/acteca/816720002/",
  // The council's own actes folder on the AOC e-seu (entity 4313100000: INE 43131 plus check digit).
  "roda-de-bera": "media.seu-e.cat/acteca/4313100000/",
  // The council's own actes folder on the AOC e-seu (entity 813500000: INE 08135 plus check digit).
  montmelo: "media.seu-e.cat/acteca/813500000/",
  // The council's own actes folder on the AOC e-seu (entity 1704990004: INE 17049 plus check digit).
  celra: "media.seu-e.cat/acteca/1704990004/",
  // The council's own actes folder on the AOC e-seu (entity 1714110007: INE 17141 plus check digit).
  puigcerda: "media.seu-e.cat/acteca/1714110007/",
  // The council's own actes folder on the AOC e-seu (entity 829170005: INE 08291 plus check digit).
  vacarisses: "media.seu-e.cat/acteca/829170005/",
  // The council's own actes folder on the AOC e-seu (entity 4311400000: INE 43114 plus check digit).
  porrera: "media.seu-e.cat/acteca/4311400000/",
  // The council's own actes folder on the AOC e-seu (entity 1709260009: INE 17092 plus check digit).
  llanca: "media.seu-e.cat/acteca/1709260009/",
  // The council's own actes folder on the AOC e-seu (entity 1712080001: INE 17120 plus check digit).
  "palau-saverdera": "media.seu-e.cat/acteca/1712080001/",
  moia: "moia.cat",
  vilafant: "vilafant.cat",
  "les-borges-del-camp": "lesborgesdelcamp.cat",
  // The council's own actes folder on the AOC e-seu (entity 1718640003: INE 17186 plus check digit).
  "sarria-de-ter": "media.seu-e.cat/acteca/1718640003/",
  // The council's own actes folder on the AOC e-seu (entity 808320002: INE 08083 plus check digit).
  folgueroles: "media.seu-e.cat/acteca/808320002/",
  // The council's own actes folder on the AOC e-seu (entity 4390180001: INE 43901 plus check digit).
  deltebre: "media.seu-e.cat/acteca/4390180001/",
  // The council's own actes folder on the AOC e-seu (entity 820680001: INE 08206 plus check digit).
  "sant-cugat-sesgarrigues": "media.seu-e.cat/acteca/820680001/",
  // The council's own actes folder on the AOC e-seu (entity 820160009: INE 08201 plus check digit).
  "sant-boi-de-llucanes": "media.seu-e.cat/acteca/820160009/",
  // The council's own actes folder on the AOC e-seu (entity 821530008: INE 08215 plus check digit).
  "sant-hipolit-de-voltrega": "media.seu-e.cat/acteca/821530008/",
  // The council's own actes folder on the AOC e-seu (entity 822510007: INE 08225 plus check digit).
  "sant-marti-d-albars": "media.seu-e.cat/acteca/822510007/",
  // The council's own actes folder on the AOC e-seu (entity 822270005: INE 08222 plus check digit).
  "sant-llorenc-d-hortons": "media.seu-e.cat/acteca/822270005/",
  // The council's own actes folder on the AOC e-seu (entity 1722070005: INE 17220 plus check digit).
  viladrau: "media.seu-e.cat/acteca/1722070005/",
  // The council's own actes folder on the AOC e-seu (entity 824760009: INE 08247 plus check digit).
  "santa-eulalia-de-riuprimer": "media.seu-e.cat/acteca/824760009/",
  // The council's own actes folder on the AOC e-seu (entity 827500000: INE 08275 plus check digit).
  tavernoles: "media.seu-e.cat/acteca/827500000/",
  // The council's own actes folder on the AOC e-seu (entity 825360009: INE 08253 plus check digit).
  "santa-maria-de-besora": "media.seu-e.cat/acteca/825360009/",
  // The council's own actes folder on the AOC e-seu (entity 822480001: INE 08224 plus check digit).
  "sant-marti-de-centelles": "media.seu-e.cat/acteca/822480001/",
  // The council's own actes folder on the AOC e-seu (entity 814830008: INE 08148 plus check digit).
  olivella: "media.seu-e.cat/acteca/814830008/",
  // The council's own actes folder on the AOC e-seu (entity 2515560009: INE 25155 plus check digit).
  organya: "media.seu-e.cat/acteca/2515560009/",
  // The council's own actes folder on the AOC e-seu (entity 2501170005: INE 25011 plus check digit).
  alcarras: "media.seu-e.cat/acteca/2501170005/",
  // The council's own actes folder on the AOC e-seu (entity 2507720002: INE 25077 plus check digit).
  "coll-de-nargo": "media.seu-e.cat/acteca/2507720002/",
  // The council's own actes folder on the AOC e-seu (entity 1711940003: INE 17119 plus check digit).
  "palau-de-santa-eulalia": "media.seu-e.cat/acteca/1711940003/",
  // The council's own actes folder on the AOC e-seu (entity 1707150006: INE 17071 plus check digit).
  fontcoberta: "media.seu-e.cat/acteca/1707150006/",
  // The council's own actes folder on the AOC e-seu (entity 1702740003: INE 17027 plus check digit).
  breda: "media.seu-e.cat/acteca/1702740003/",
  // The council's own actes folder on the AOC e-seu (entity 1706750006: INE 17067 plus check digit).
  flaca: "media.seu-e.cat/acteca/1706750006/",
  // The council's own actes folder on the AOC e-seu (entity 1710770005: INE 17107 plus check digit).
  mollo: "media.seu-e.cat/acteca/1710770005/",
  // The council's own actes folder on the AOC e-seu (entity 4305800000: INE 43058 plus check digit).
  "la-figuera": "media.seu-e.cat/acteca/4305800000/",
  // The council's own actes folder on the AOC e-seu (entity 1710300000: INE 17103 plus check digit).
  "macanet-de-la-selva": "media.seu-e.cat/acteca/1710300000/",
  // The council's own actes folder on the AOC e-seu (entity 2523850006: INE 25238 plus check digit).
  "vallbona-de-les-monges": "media.seu-e.cat/acteca/2523850006/",
  // The council's own actes folder on the AOC e-seu (entity 2504470005: INE 25044 plus check digit).
  bassella: "media.seu-e.cat/acteca/2504470005/",
  // The council's own actes folder on the AOC e-seu (entity 1700310007: INE 17003 plus check digit).
  albanya: "media.seu-e.cat/acteca/1700310007/",
  // The council's own actes folder on the AOC e-seu (entity 2501220002: INE 25012 plus check digit).
  alcoletge: "media.seu-e.cat/acteca/2501220002/",
  // The council's own actes folder on the AOC e-seu (entity 1713900000: INE 17139 plus check digit).
  "les-preses": "media.seu-e.cat/acteca/1713900000/",
  // The council's own actes folder on the AOC e-seu (entity 4301080001: INE 43010 plus check digit).
  alio: "media.seu-e.cat/acteca/4301080001/",
  // The council's own actes folder on the AOC e-seu (entity 1705020002: INE 17050 plus check digit).
  "cervia-de-ter": "media.seu-e.cat/acteca/1705020002/",
  // The council's own actes folder on the AOC e-seu (entity 1717070005: INE 17170 plus check digit).
  "vallfogona-de-ripolles": "media.seu-e.cat/acteca/1717070005/",
  // The council's own actes folder on the AOC e-seu (entity 2501690004: INE 25016 plus check digit).
  alguaire: "media.seu-e.cat/acteca/2501690004/",
  // The council's own actes folder on the AOC e-seu (entity 1702160009: INE 17021 plus check digit).
  beuda: "media.seu-e.cat/acteca/1702160009/",
  // The council's own actes folder on the AOC e-seu (entity 2506210007: INE 25062 plus check digit).
  camarasa: "media.seu-e.cat/acteca/2506210007/",
  // The council's own actes folder on the AOC e-seu (entity 1701180001: INE 17011 plus check digit).
  "l-armentera": "media.seu-e.cat/acteca/1701180001/",
  // The council's own actes folder on the AOC e-seu (entity 1700100000: INE 17001 plus check digit).
  agullana: "media.seu-e.cat/acteca/1700100000/",
  // The council's own actes folder on the AOC e-seu (entity 1721680001: INE 17216 plus check digit).
  viladasens: "media.seu-e.cat/acteca/1721680001/",
  // The council's own actes folder on the AOC e-seu (entity 2514620002: INE 25146 plus check digit).
  naves: "media.seu-e.cat/acteca/2514620002/",
  // The council's own actes folder on the AOC e-seu (entity 1710190004: INE 17101 plus check digit).
  massanes: "media.seu-e.cat/acteca/1710190004/",
  // The council's own actes folder on the AOC e-seu (entity 4313460009: INE 43134 plus check digit).
  "el-rourell": "media.seu-e.cat/acteca/4313460009/",
  // The council's own actes folder on the AOC e-seu (entity 4312640003: INE 43126 plus check digit).
  "la-riera-de-gaia": "media.seu-e.cat/acteca/4312640003/",
  // The council's own actes folder on the AOC e-seu (entity 1700590004: INE 17005 plus check digit).
  "el-far-d-emporda": "media.seu-e.cat/acteca/1700590004/",
  // The council's own actes folder on the AOC e-seu (entity 2500770005: INE 25007 plus check digit).
  albatarrec: "media.seu-e.cat/acteca/2500770005/",
  // The council's own actes folder on the AOC e-seu (entity 1721740003: INE 17217 plus check digit).
  viladamat: "media.seu-e.cat/acteca/1721740003/",
  // The council's own actes folder on the AOC e-seu (entity 4311350006: INE 43113 plus check digit).
  "el-pont-d-armentera": "media.seu-e.cat/acteca/4311350006/",
  // The council's own actes folder on the AOC e-seu (entity 2590310007: INE 25903 plus check digit).
  "la-guingueta-d-aneu": "media.seu-e.cat/acteca/2590310007/",
  // The council's own actes folder on the AOC e-seu (entity 2513120002: INE 25131 plus check digit).
  massalcoreig: "media.seu-e.cat/acteca/2513120002/",
  // The council's own actes folder on the AOC e-seu (entity 2516670005: INE 25166 plus check digit).
  "pinell-de-solsones": "media.seu-e.cat/acteca/2516670005/",
  // The council's own actes folder on the AOC e-seu (entity 4310420002: INE 43104 plus check digit).
  "el-perello": "media.seu-e.cat/acteca/4310420002/",
  // The council's own actes folder on the AOC e-seu (entity 4305930008: INE 43059 plus check digit).
  "figuerola-del-camp": "media.seu-e.cat/acteca/4305930008/",
  // The council's own actes folder on the AOC e-seu (entity 2504630008: INE 25046 plus check digit).
  belianes: "media.seu-e.cat/acteca/2504630008/",
  // The council's own actes folder on the AOC e-seu (entity 2522280001: INE 25222 plus check digit).
  tiurana: "media.seu-e.cat/acteca/2522280001/",
  // The council's own actes folder on the AOC e-seu (entity 2504110007: INE 25041 plus check digit).
  barbens: "media.seu-e.cat/acteca/2504110007/",
  // The council's own actes folder on the AOC e-seu (entity 2517900000: INE 25179 plus check digit).
  prullans: "media.seu-e.cat/acteca/2517900000/",
  // The council's own actes folder on the AOC e-seu (entity 2524830008: INE 25248 plus check digit).
  "vilanova-de-bellpuig": "media.seu-e.cat/acteca/2524830008/",
  // The council's own actes folder on the AOC e-seu (entity 4313590004: INE 43135 plus check digit).
  salomo: "media.seu-e.cat/acteca/4313590004/",
  // The council's own actes folder on the AOC e-seu (entity 1708710007: INE 17087 plus check digit).
  juia: "media.seu-e.cat/acteca/1708710007/",
  // The council's own actes folder on the AOC e-seu (entity 2501000000: INE 25010 plus check digit).
  alcano: "media.seu-e.cat/acteca/2501000000/",
  // The council's own actes folder on the AOC e-seu (entity 2512400000: INE 25124 plus check digit).
  lladurs: "media.seu-e.cat/acteca/2512400000/",
  // The council's own actes folder on the AOC e-seu (entity 4300220002: INE 43002 plus check digit).
  albinyana: "media.seu-e.cat/acteca/4300220002/",
  // The council's own actes folder on the AOC e-seu (entity 2513640003: INE 25136 plus check digit).
  "la-molsosa": "media.seu-e.cat/acteca/2513640003/",
  // The council's own actes folder on the AOC e-seu (entity 2515810007: INE 25158 plus check digit).
  "el-palau-d-anglesola": "media.seu-e.cat/acteca/2515810007/",
  // The council's own actes folder on the AOC e-seu (entity 2502150006: INE 25021 plus check digit).
  almenar: "media.seu-e.cat/acteca/2502150006/",
  // The council's own actes folder on the AOC e-seu (entity 2509250006: INE 25092 plus check digit).
  "la-floresta": "media.seu-e.cat/acteca/2509250006/",
  // The council's own actes folder on the AOC e-seu (entity 1704270005: INE 17042 plus check digit).
  capmany: "media.seu-e.cat/acteca/1704270005/",
  // The council's own actes folder on the AOC e-seu (entity 4304020002: INE 43040 plus check digit).
  capcanes: "media.seu-e.cat/acteca/4304020002/",
  // The council's own actes folder on the AOC e-seu (entity 2506800000: INE 25068 plus check digit).
  "castellnou-de-seana": "media.seu-e.cat/acteca/2506800000/",
  // The council's own actes folder on the AOC e-seu (entity 4307120002: INE 43071 plus check digit).
  "horta-de-sant-joan": "media.seu-e.cat/acteca/4307120002/",
  // The council's own actes folder on the AOC e-seu (entity 1715820002: INE 17158 plus check digit).
  "sant-climent-sescebes": "media.seu-e.cat/acteca/1715820002/",
  // The council's own actes folder on the AOC e-seu (entity 1710960009: INE 17109 plus check digit).
  "montagut-i-oix": "media.seu-e.cat/acteca/1710960009/",
  // The council's own actes folder on the AOC e-seu (entity 1704640003: INE 17046 plus check digit).
  "castellfollit-de-la-roca": "media.seu-e.cat/acteca/1704640003/",
  // The council's own actes folder on the AOC e-seu (entity 1720950006: INE 17209 plus check digit).
  "vall-llobrega": "media.seu-e.cat/acteca/1720950006/",
  // The council's own actes folder on the AOC e-seu (entity 2508510007: INE 25085 plus check digit).
  estaras: "media.seu-e.cat/acteca/2508510007/",
  // The council's own actes folder on the AOC e-seu (entity 2506740003: INE 25067 plus check digit).
  castelldans: "media.seu-e.cat/acteca/2506740003/",
  // The council's own actes folder on the AOC e-seu (entity 1715010007: INE 17150 plus check digit).
  "riudellots-de-la-selva": "media.seu-e.cat/acteca/1715010007/",
  // The council's own actes folder on the AOC e-seu (entity 1700780001: INE 17007 plus check digit).
  amer: "media.seu-e.cat/acteca/1700780001/",
  // The council's own actes folder on the AOC e-seu (entity 2510950006: INE 25109 plus check digit).
  guimera: "media.seu-e.cat/acteca/2510950006/",
  // The council's own actes folder on the AOC e-seu (entity 4300690004: INE 43006 plus check digit).
  aldover: "media.seu-e.cat/acteca/4300690004/",
  // The council's own actes folder on the AOC e-seu (entity 1712410007: INE 17124 plus check digit).
  pals: "media.seu-e.cat/acteca/1712410007/",
  // The council's own actes folder on the AOC e-seu (entity 4300750006: INE 43007 plus check digit).
  "l-aleixar": "media.seu-e.cat/acteca/4300750006/",
  // The council's own actes folder on the AOC e-seu (entity 815930008: INE 08159 plus check digit).
  "parets-del-valles": "media.seu-e.cat/acteca/815930008/",
  // The council's own actes folder on the AOC e-seu (entity 812650006: INE 08126 plus check digit).
  montgat: "media.seu-e.cat/acteca/812650006/",
  // The council's own actes folder on the AOC e-seu (entity 1713710007: INE 17137 plus check digit).
  porqueres: "media.seu-e.cat/acteca/1713710007/",
  // The council's own actes folder on the AOC e-seu (entity 823620002: INE 08236 plus check digit).
  "sant-quinti-de-mediona": "media.seu-e.cat/acteca/823620002/",
  // The council's own actes folder on the AOC e-seu (entity 1713520002: INE 17135 plus check digit).
  "pont-de-molins": "media.seu-e.cat/acteca/1713520002/",
  // The council's own actes folder on the AOC e-seu (entity 811540003: INE 08115 plus check digit).
  martorelles: "media.seu-e.cat/acteca/811540003/",
  // The council's own actes folder on the AOC e-seu (entity 827320002: INE 08273 plus check digit).
  subirats: "media.seu-e.cat/acteca/827320002/",
  // The council's own actes folder on the AOC e-seu (entity 4390600000: INE 43906 plus check digit).
  "l-ampolla": "media.seu-e.cat/acteca/4390600000/",
  // The council's own actes folder on the AOC e-seu (entity 818310007: INE 08183 plus check digit).
  "roda-de-ter": "media.seu-e.cat/acteca/818310007/",
  // The council's own actes folder on the AOC e-seu (entity 4390760009: INE 43907 plus check digit).
  "la-canonja": "media.seu-e.cat/acteca/4390760009/",
  // The council's own actes folder on the AOC e-seu (entity 1703290004: INE 17032 plus check digit).
  cadaques: "media.seu-e.cat/acteca/1703290004/",
  "vilanova-del-valles": "vilanovadelvalles.cat",
  // The council's own actes folder on the AOC e-seu (entity 1717880001: INE 17178 plus check digit).
  "sant-pere-pescador": "media.seu-e.cat/acteca/1717880001/",
  "bellver-de-cerdanya": "bellver.org",
  // The council's own actes folder on the AOC e-seu (entity 827040003: INE 08270 plus check digit).
  sitges: "media.seu-e.cat/acteca/827040003/",
  // The council's own actes folder on the AOC e-seu (entity 808850006: INE 08088 plus check digit).
  "la-garriga": "media.seu-e.cat/acteca/808850006/",
  // The council's own actes folder on the AOC e-seu (entity 1711810007: INE 17118 plus check digit).
  "palamos-i-sant-joan": "media.seu-e.cat/acteca/1711810007/",
  // The council's own actes folder on the AOC e-seu (entity 1718050006: INE 17180 plus check digit).
  "santa-coloma-de-farners": "media.seu-e.cat/acteca/1718050006/",
  // The council's own actes folder on the AOC e-seu (entity 807280001: INE 08072 plus check digit).
  "corbera-de-llobregat": "media.seu-e.cat/acteca/807280001/",
  // The council's own actes folder on the AOC e-seu (entity 1703400000: INE 17034 plus check digit).
  "calonge-i-sant-antoni": "media.seu-e.cat/acteca/1703400000/",
  // The council's own actes folder on the AOC e-seu (entity 4301200000: INE 43012 plus check digit).
  altafulla: "media.seu-e.cat/acteca/4301200000/",
  // The council's own actes folder on the AOC e-seu (entity 4309570005: INE 43095 plus check digit).
  "el-morell": "media.seu-e.cat/acteca/4309570005/",
  // The council's own actes folder on the AOC e-seu (entity 4301360009: INE 43013 plus check digit).
  "l-ametlla-de-mar": "media.seu-e.cat/acteca/4301360009/",
  // The council's own actes folder on the AOC e-seu (entity 4300430008: INE 43004 plus check digit).
  alcanar: "media.seu-e.cat/acteca/4300430008/",
  // The council's own actes folder on the AOC e-seu (entity 824440003: INE 08244 plus check digit).
  "santa-coloma-de-cervello": "media.seu-e.cat/acteca/824440003/",
  // The council's own actes folder on the AOC e-seu (entity 1708650006: INE 17086 plus check digit).
  "la-jonquera": "media.seu-e.cat/acteca/1708650006/",
  // The council's own actes folder on the AOC e-seu (entity 4305550006: INE 43055 plus check digit).
  falset: "media.seu-e.cat/acteca/4305550006/",
  // The council's own actes folder on the AOC e-seu (entity 825150006: INE 08251 plus check digit).
  "santa-margarida-i-els-monjos": "media.seu-e.cat/acteca/825150006/",
  // The council's own actes folder on the AOC e-seu (entity 2523470005: INE 25234 plus check digit).
  tremp: "media.seu-e.cat/acteca/2523470005/",
  // The council's own actes folder on the AOC e-seu (entity 2516890004: INE 25168 plus check digit).
  "el-poal": "media.seu-e.cat/acteca/2516890004/",
  // The council's own actes folder on the AOC e-seu (entity 811920002: INE 08119 plus check digit).
  masquefa: "media.seu-e.cat/acteca/811920002/",
  // The council's own actes folder on the AOC e-seu (entity 4308590004: INE 43085 plus check digit).
  "el-molar": "media.seu-e.cat/acteca/4308590004/",
  // The council's own actes folder on the AOC e-seu (entity 809450006: INE 08094 plus check digit).
  "la-granada": "media.seu-e.cat/acteca/809450006/",
  // The council's own actes folder on the AOC e-seu (entity 4313030008: INE 43130 plus check digit).
  "rocafort-de-queralt": "media.seu-e.cat/acteca/4313030008/",
  // The council's own actes folder on the AOC e-seu (entity 1711560009: INE 17115 plus check digit).
  ordis: "media.seu-e.cat/acteca/1711560009/",
  // The council's own actes folder on the AOC e-seu (entity 1714500000: INE 17145 plus check digit).
  "ribes-de-freser": "media.seu-e.cat/acteca/1714500000/",
  // The council's own actes folder on the AOC e-seu (entity 1715760009: INE 17157 plus check digit).
  "sant-andreu-salou": "media.seu-e.cat/acteca/1715760009/",
  // The council's own actes folder on the AOC e-seu (entity 1713650006: INE 17136 plus check digit).
  pontos: "media.seu-e.cat/acteca/1713650006/",
  // The council's own actes folder on the AOC e-seu (entity 4311910007: INE 43119 plus check digit).
  puigpelat: "media.seu-e.cat/acteca/4311910007/",
  // The council's own actes folder on the AOC e-seu (entity 4315920002: INE 43159 plus check digit).
  "vallfogona-de-riucorb": "media.seu-e.cat/acteca/4315920002/",
  // The council's own actes folder on the AOC e-seu (entity 2517340003: INE 25173 plus check digit).
  "el-pont-de-suert": "media.seu-e.cat/acteca/2517340003/",
  // The council's own actes folder on the AOC e-seu (entity 4302340003: INE 43023 plus check digit).
  "bellmunt-del-priorat": "media.seu-e.cat/acteca/4302340003/",
  // The council's own actes folder on the AOC e-seu (entity 816660009: INE 08166 plus check digit).
  "la-pobla-de-lillet": "media.seu-e.cat/acteca/816660009/",
  // The council's own actes folder on the AOC e-seu (entity 1701600000: INE 17016 plus check digit).
  bascara: "media.seu-e.cat/acteca/1701600000/",
  // The council's own actes folder on the AOC e-seu (entity 1709850006: INE 17098 plus check digit).
  "maia-de-montcal": "media.seu-e.cat/acteca/1709850006/",
  // The council's own actes folder on the AOC e-seu (entity 2503870005: INE 25038 plus check digit).
  aitona: "media.seu-e.cat/acteca/2503870005/",
  // The council's own actes folder on the AOC e-seu (entity 1704120002: INE 17041 plus check digit).
  cantallops: "media.seu-e.cat/acteca/1704120002/",
  // The council's own actes folder on the AOC e-seu (entity 821290004: INE 08212 plus check digit).
  "sant-feliu-sasserra": "media.seu-e.cat/acteca/821290004/",
  // The council's own actes folder on the AOC e-seu (entity 2502080001: INE 25020 plus check digit).
  almatret: "media.seu-e.cat/acteca/2502080001/",
  // The council's own actes folder on the AOC e-seu (entity 4300560009: INE 43005 plus check digit).
  alcover: "media.seu-e.cat/acteca/4300560009/",
  // The council's own actes folder on the AOC e-seu (entity 1716740003: INE 17167 plus check digit).
  "sant-joan-de-les-abadesses": "media.seu-e.cat/acteca/1716740003/",
  // The council's own actes folder on the AOC e-seu (entity 2505230008: INE 25052 plus check digit).
  bellvis: "media.seu-e.cat/acteca/2505230008/",
  // The council's own actes folder on the AOC e-seu (entity 1723330008: INE 17233 plus check digit).
  "vilobi-d-onyar": "media.seu-e.cat/acteca/1723330008/",
  // The council's own actes folder on the AOC e-seu (entity 2515170005: INE 25151 plus check digit).
  olius: "media.seu-e.cat/acteca/2515170005/",
  // The council's own actes folder on the AOC e-seu (entity 1702550006: INE 17025 plus check digit).
  bordils: "media.seu-e.cat/acteca/1702550006/",
  // The council's own actes folder on the AOC e-seu (entity 1790110007: INE 17901 plus check digit).
  "cruilles-monells-i-sant-sadurni-de-l-heura": "media.seu-e.cat/acteca/1790110007/",
  // The council's own actes folder on the AOC e-seu (entity 2519770005: INE 25197 plus check digit).
  "sant-guim-de-la-plana": "media.seu-e.cat/acteca/2519770005/",
  // The council's own actes folder on the AOC e-seu (entity 4311530008: INE 43115 plus check digit).
  "pradell-de-la-teixeta": "media.seu-e.cat/acteca/4311530008/",
  // The council's own actes folder on the AOC e-seu (entity 1718480001: INE 17184 plus check digit).
  "santa-pau": "media.seu-e.cat/acteca/1718480001/",
  // The council's own actes folder on the AOC e-seu (entity 1719840003: INE 17198 plus check digit).
  "torroella-de-fluvia": "media.seu-e.cat/acteca/1719840003/",
  // The council's own actes folder on the AOC e-seu (entity 2524580001: INE 25245 plus check digit).
  vilaller: "media.seu-e.cat/acteca/2524580001/",
  // The council's own actes folder on the AOC e-seu (entity 4317630008: INE 43176 plus check digit).
  "vimbodi-i-poblet": "media.seu-e.cat/acteca/4317630008/",
  // The council's own actes folder on the AOC e-seu (entity 4302280001: INE 43022 plus check digit).
  batea: "media.seu-e.cat/acteca/4302280001/",
  // The council's own actes folder on the AOC e-seu (entity 4301150006: INE 43011 plus check digit).
  almoster: "media.seu-e.cat/acteca/4301150006/",
  // The council's own actes folder on the AOC e-seu (entity 826520002: INE 08265 plus check digit).
  "sant-vicenc-de-torello": "media.seu-e.cat/acteca/826520002/",
  // The council's own actes folder on the AOC e-seu (entity 4310680001: INE 43106 plus check digit).
  "el-pinell-de-brai": "media.seu-e.cat/acteca/4310680001/",
  // The council's own actes folder on the AOC e-seu (entity 2522870005: INE 25228 plus check digit).
  torrefarrera: "media.seu-e.cat/acteca/2522870005/",
  // The council's own actes folder on the AOC e-seu (entity 4308250006: INE 43082 plus check digit).
  "el-masroig": "media.seu-e.cat/acteca/4308250006/",
  // The council's own actes folder on the AOC e-seu (entity 1701010007: INE 17010 plus check digit).
  argelaguer: "media.seu-e.cat/acteca/1701010007/",
  // The council's own actes folder on the AOC e-seu (entity 1715440003: INE 17154 plus check digit).
  "sales-de-llierca": "media.seu-e.cat/acteca/1715440003/",
  // The council's own actes folder on the AOC e-seu (entity 1716210007: INE 17162 plus check digit).
  "sant-ferriol": "media.seu-e.cat/acteca/1716210007/",
  // The council's own actes folder on the AOC e-seu (entity 1717140003: INE 17171 plus check digit).
  "sant-llorenc-de-la-muga": "media.seu-e.cat/acteca/1717140003/",
  // The council's own actes folder on the AOC e-seu (entity 2501560009: INE 25015 plus check digit).
  algerri: "media.seu-e.cat/acteca/2501560009/",
  // The council's own actes folder on the AOC e-seu (entity 2511210007: INE 25112 plus check digit).
  "ivars-de-noguera": "media.seu-e.cat/acteca/2511210007/",
  // The council's own actes folder on the AOC e-seu (entity 2503900000: INE 25039 plus check digit).
  "baix-pallars": "media.seu-e.cat/acteca/2503900000/",
  // The council's own actes folder on the AOC e-seu (entity 4300940003: INE 43009 plus check digit).
  alforja: "media.seu-e.cat/acteca/4300940003/",
  // The council's own actes folder on the AOC e-seu (entity 4302650006: INE 43026 plus check digit).
  benissanet: "media.seu-e.cat/acteca/4302650006/",
  // The council's own actes folder on the AOC e-seu (entity 1723480001: INE 17234 plus check digit).
  biure: "media.seu-e.cat/acteca/1723480001/",
  // The council's own actes folder on the AOC e-seu (entity 1708870005: INE 17088 plus check digit).
  llado: "media.seu-e.cat/acteca/1708870005/",
  // The council's own actes folder on the AOC e-seu (entity 809960009: INE 08099 plus check digit).
  "guardiola-de-bergueda": "media.seu-e.cat/acteca/809960009/",
  // The council's own actes folder on the AOC e-seu (entity 1709040003: INE 17090 plus check digit).
  llambilles: "media.seu-e.cat/acteca/1709040003/",
  // The council's own actes folder on the AOC e-seu (entity 4307860009: INE 43078 plus check digit).
  masdenverge: "media.seu-e.cat/acteca/4307860009/",
  // The council's own actes folder on the AOC e-seu (entity 4314180001: INE 43141 plus check digit).
  pontils: "media.seu-e.cat/acteca/4314180001/",
  // The council's own actes folder on the AOC e-seu (entity 817860009: INE 08178 plus check digit).
  rajadell: "media.seu-e.cat/acteca/817860009/",
  // The council's own actes folder on the AOC e-seu (entity 2517130008: INE 25171 plus check digit).
  "la-pobla-de-segur": "media.seu-e.cat/acteca/2517130008/",
  // The council's own actes folder on the AOC e-seu (entity 2511930008: INE 25119 plus check digit).
  juneda: "media.seu-e.cat/acteca/2511930008/",
  // The council's own actes folder on the AOC e-seu (entity 4308840003: INE 43088 plus check digit).
  "montbrio-del-camp": "media.seu-e.cat/acteca/4308840003/",
  // The council's own actes folder on the AOC e-seu (entity 2508640003: INE 25086 plus check digit).
  "esterri-d-aneu": "media.seu-e.cat/acteca/2508640003/",
  // The council's own actes folder on the AOC e-seu (entity 1707360009: INE 17073 plus check digit).
  "fornells-de-la-selva": "media.seu-e.cat/acteca/1707360009/",
  // The council's own actes folder on the AOC e-seu (entity 1712150006: INE 17121 plus check digit).
  "palau-sator": "media.seu-e.cat/acteca/1712150006/",
  // The council's own actes folder on the AOC e-seu (entity 1715950006: INE 17159 plus check digit).
  "sant-feliu-de-buixalleu": "media.seu-e.cat/acteca/1715950006/",
  // The council's own actes folder on the AOC e-seu (entity 4300170005: INE 43001 plus check digit).
  aiguamurcia: "media.seu-e.cat/acteca/4300170005/",
  // The council's own actes folder on the AOC e-seu (entity 4300810007: INE 43008 plus check digit).
  "alfara-de-carles": "media.seu-e.cat/acteca/4300810007/",
  // The council's own actes folder on the AOC e-seu (entity 2505570005: INE 25055 plus check digit).
  biosca: "media.seu-e.cat/acteca/2505570005/",
  // The council's own actes folder on the AOC e-seu (entity 2511420002: INE 25114 plus check digit).
  ivorra: "media.seu-e.cat/acteca/2511420002/",
  // The council's own actes folder on the AOC e-seu (entity 4313250006: INE 43132 plus check digit).
  rodonya: "media.seu-e.cat/acteca/4313250006/",
  // The council's own actes folder on the AOC e-seu (entity 2519190004: INE 25191 plus check digit).
  sanauja: "media.seu-e.cat/acteca/2519190004/",
  // The council's own actes folder on the AOC e-seu (entity 1716680001: INE 17166 plus check digit).
  "sant-jordi-desvalls": "media.seu-e.cat/acteca/1716680001/",
  // The council's own actes folder on the AOC e-seu (entity 1714980001: INE 17149 plus check digit).
  riudaura: "media.seu-e.cat/acteca/1714980001/",
  // The council's own actes folder on the AOC e-seu (entity 1717400000: INE 17174 plus check digit).
  "sant-miquel-de-campmajor": "media.seu-e.cat/acteca/1717400000/",
  // The council's own actes folder on the AOC e-seu (entity 2521200000: INE 25212 plus check digit).
  sunyer: "media.seu-e.cat/acteca/2521200000/",
  // The council's own actes folder on the AOC e-seu (entity 2521890004: INE 25218 plus check digit).
  tarres: "media.seu-e.cat/acteca/2521890004/",
  // The council's own actes folder on the AOC e-seu (entity 4314230008: INE 43142 plus check digit).
  sarral: "media.seu-e.cat/acteca/4314230008/",
  // The council's own actes folder on the AOC e-seu (entity 2524450006: INE 25244 plus check digit).
  vilagrassa: "media.seu-e.cat/acteca/2524450006/",
  // The council's own actes folder on the AOC e-seu (entity 4316870005: INE 43168 plus check digit).
  "vilanova-de-prades": "media.seu-e.cat/acteca/4316870005/",
  // The council's own actes folder on the AOC e-seu (entity 4313780001: INE 43137 plus check digit).
  "sant-jaume-dels-domenys": "media.seu-e.cat/acteca/4313780001/",
  // The council's own actes folder on the AOC e-seu (entity 1722290004: INE 17222 plus check digit).
  vilaur: "media.seu-e.cat/acteca/1722290004/",
  // The council's own actes folder on the AOC e-seu (entity 2525550006: INE 25255 plus check digit).
  vinaixa: "media.seu-e.cat/acteca/2525550006/",
  // The council's own actes folder on the AOC e-seu (entity 2525420002: INE 25254 plus check digit).
  "vilanova-de-la-barca": "media.seu-e.cat/acteca/2525420002/",
  // The council's own actes folder on the AOC e-seu (entity 2524960009: INE 25249 plus check digit).
  "vilanova-de-l-aguda": "media.seu-e.cat/acteca/2524960009/",
  // The council's own actes folder on the AOC e-seu (entity 4315150006: INE 43151 plus check digit).
  "la-torre-de-fontaubella": "media.seu-e.cat/acteca/4315150006/",
  // The council's own actes folder on the AOC e-seu (entity 2511370005: INE 25113 plus check digit).
  "ivars-d-urgell": "media.seu-e.cat/acteca/2511370005/",
  // The council's own actes folder on the AOC e-seu (entity 814610007: INE 08146 plus check digit).
  "olesa-de-bonesvalls": "media.seu-e.cat/acteca/814610007/",
  // The council's own actes folder on the AOC e-seu (entity 4302520002: INE 43025 plus check digit).
  benifallet: "media.seu-e.cat/acteca/4302520002/",
  // The council's own actes folder on the AOC e-seu (entity 807060009: INE 08070 plus check digit).
  collsuspina: "media.seu-e.cat/acteca/807060009/",
  // The council's own actes folder on the AOC e-seu (entity 4306290004: INE 43062 plus check digit).
  freginals: "media.seu-e.cat/acteca/4306290004/",
  // The council's own actes folder on the AOC e-seu (entity 2591390004: INE 25913 plus check digit).
  "riu-de-cerdanya": "media.seu-e.cat/acteca/2591390004/",
  // The council's own actes folder on the AOC e-seu (entity 4317500000: INE 43175 plus check digit).
  "vilalba-dels-arcs": "media.seu-e.cat/acteca/4317500000/",
  // The council's own actes folder on the AOC e-seu (entity 4314950006: INE 43149 plus check digit).
  tivenys: "media.seu-e.cat/acteca/4314950006/",
  // The council's own actes folder on the AOC e-seu (entity 4305680001: INE 43056 plus check digit).
  "la-fatarella": "media.seu-e.cat/acteca/4305680001/",
  // The council's own actes folder on the AOC e-seu (entity 4302900000: INE 43029 plus check digit).
  blancafort: "media.seu-e.cat/acteca/4302900000/",
  // The council's own actes folder on the AOC e-seu (entity 1705580001: INE 17055 plus check digit).
  colomers: "media.seu-e.cat/acteca/1705580001/",
  // The council's own actes folder on the AOC e-seu (entity 2509840003: INE 25098 plus check digit).
  "gavet-de-la-conca": "media.seu-e.cat/acteca/2509840003/",
  // The council's own actes folder on the AOC e-seu (entity 1712670005: INE 17126 plus check digit).
  parlava: "media.seu-e.cat/acteca/1712670005/",
  // The council's own actes folder on the AOC e-seu (entity 1717530008: INE 17175 plus check digit).
  "sant-miquel-de-fluvia": "media.seu-e.cat/acteca/1717530008/",
  // The council's own actes folder on the AOC e-seu (entity 4314390004: INE 43143 plus check digit).
  "savalla-del-comtat": "media.seu-e.cat/acteca/4314390004/",
  // The council's own actes folder on the AOC e-seu (entity 1720180001: INE 17201 plus check digit).
  toses: "media.seu-e.cat/acteca/1720180001/",
  // The council's own actes folder on the AOC e-seu (entity 2516360009: INE 25163 plus check digit).
  "la-coma-i-la-pedra": "media.seu-e.cat/acteca/2516360009/",
  // The council's own actes folder on the AOC e-seu (entity 4309760009: INE 43097 plus check digit).
  "la-nou-de-gaia": "media.seu-e.cat/acteca/4309760009/",
  // The council's own actes folder on the AOC e-seu (entity 808260009: INE 08082 plus check digit).
  "fogars-de-la-selva": "media.seu-e.cat/acteca/808260009/",
  // The council's own actes folder on the AOC e-seu (entity 2525160009: INE 25251 plus check digit).
  "vilanova-de-segria": "media.seu-e.cat/acteca/2525160009/",
  // The council's own actes folder on the AOC e-seu (entity 4314440003: INE 43144 plus check digit).
  "la-secuita": "media.seu-e.cat/acteca/4314440003/",
  // The council's own actes folder on the AOC e-seu (entity 2510180001: INE 25101 plus check digit).
  "la-granadella": "media.seu-e.cat/acteca/2510180001/",
  // The council's own actes folder on the AOC e-seu (entity 2507880001: INE 25078 plus check digit).
  corbins: "media.seu-e.cat/acteca/2507880001/",
};
const BULLETINS = ["bop.diba.cat", "ddgi.cat", "dipta.cat", "diputaciolleida.cat"];

function onOfficialDomain(slug: string, url: string): boolean {
  const u = new URL(url);
  if (u.protocol !== "https:") return false;
  if (BULLETINS.some((b) => u.hostname === b || u.hostname.endsWith(`.${b}`))) return true;
  const own = COUNCIL_DOMAIN[slug];
  if (!own) return false;
  if (own.includes("/")) {
    const [host, ...path] = own.split("/");
    return (u.hostname === host || u.hostname === `www.${host}`) && u.pathname.startsWith(`/${path.join("/")}`);
  }
  return u.hostname === own || u.hostname.endsWith(`.${own}`);
}

/* -------------------------------------------------------------------------- */
/* The data                                                                   */
/* -------------------------------------------------------------------------- */

test("council data: every entry is a town with a page, two distinct valid 2027 days, an official https source and a read date", () => {
  const regional2027 = new Set(CATALONIA_HOLIDAYS.map((h) => h.date));
  assert.ok(councilSlugs().length >= 420, `${councilSlugs().length} towns`);
  for (const [slug, c] of Object.entries(COUNCIL_2027)) {
    town(slug);
    assert.equal(c.local.length, 2, slug);
    const [a, b] = c.local;
    for (const d of c.local) {
      assert.ok(valid(d) && d.startsWith(`${NEXT}-`), `${slug}: ${d}`);
      // The Generalitat's rule for proposals: never a Sunday, never one of the twelve.
      assert.notEqual(weekdayName(d, "en"), "Sunday", `${slug}: ${d} is a Sunday`);
      assert.ok(!regional2027.has(d), `${slug}: ${d} is a Catalonia-wide holiday`);
    }
    assert.ok(a < b, `${slug}: two distinct days in date order`);
    if (c.names) assert.equal(c.names.length, 2, slug);
    for (const n of c.nuclei ?? []) {
      assert.equal(n.dates.length, 2, `${slug} / ${n.name}`);
      assert.ok(n.dates[0]! < n.dates[1]!, `${slug} / ${n.name}`);
      for (const d of n.dates) {
        assert.ok(valid(d) && d.startsWith(`${NEXT}-`), `${slug} / ${n.name}: ${d}`);
        assert.notEqual(weekdayName(d, "en"), "Sunday", `${slug} / ${n.name}: ${d}`);
      }
    }
    assert.ok(onOfficialDomain(slug, c.source.url), `${slug}: ${c.source.url} is not on the council's own domain or a provincial bulletin`);
    assert.ok(c.source.name.length > 3 && c.source.ref.length > 3, slug);
    assert.ok(["ple", "decret", "junta", "web"].includes(c.act.kind), slug);
    assert.ok(valid(c.readOn) && c.readOn >= "2026-10-30" && c.readOn <= "2026-11-04", `${slug}: read on ${c.readOn}`);
    if (c.act.date) assert.ok(valid(c.act.date) && c.act.date.startsWith(`${YEAR}-`) && c.act.date < c.readOn, `${slug}: act of ${c.act.date}`);
  }
});

test("council data: known values, as the councils print them", () => {
  // "Fixar, com a festes locals a celebrar durant l'any 2027 en el terme municipal de Barcelona,
  // els dies: 17 de maig, dilluns de Pasqua Granada; 24 de setembre, Mare de Déu de la Mercè."
  assert.deepEqual(COUNCIL_2027.barcelona!.local, ["2027-05-17", "2027-09-24"]);
  assert.deepEqual(COUNCIL_2027.barcelona!.act, { kind: "decret", date: "2026-06-04" });
  // Barcelona: the same two days as the 2027 work-calendar guide (payload.ts), from the city's page.
  assert.deepEqual(COUNCIL_2027.barcelona!.local, BARCELONA_LOCAL.map((h) => h.date));
  assert.deepEqual(COUNCIL_2027.granollers!.local, ["2027-05-07", "2027-08-27"]);
  assert.deepEqual(COUNCIL_2027.girona!.local, ["2027-07-26", "2027-10-29"]);
  assert.deepEqual(COUNCIL_2027.lleida!.nuclei, [
    { name: "Raimat", dates: ["2027-04-27", "2027-07-23"] },
    { name: "Sucs", dates: ["2027-05-14", "2027-08-13"] },
  ]);
  assert.deepEqual(COUNCIL_2027.mataro!.local, ["2027-05-17", "2027-07-27"]);
  assert.deepEqual(COUNCIL_2027["vila-seca"]!.local, ["2027-01-18", "2027-08-03"]);
  // Read on 4 Nov 2026 (titles held, see COUNCIL_2027_METADATA_HELD): Sabadell's calendar page, the
  // actes of Gavà (Ple of 18 June 2026) and Sant Feliu de Llobregat (30 June), Salou's (1 July).
  assert.deepEqual(COUNCIL_2027.sabadell!.local, ["2027-05-10", "2027-09-06"]);
  assert.deepEqual(COUNCIL_2027.gava!.local, ["2027-06-29", "2027-12-14"]);
  assert.deepEqual(COUNCIL_2027["sant-feliu-de-llobregat"]!.local, ["2027-05-17", "2027-10-08"]);
  assert.deepEqual(COUNCIL_2027.salou!.local, ["2027-01-29", "2027-10-30"]);
  assert.deepEqual(COUNCIL_2027.salou!.act, { kind: "ple", date: "2026-07-01" });
});

test("local-2027.json stays empty until the DOGC order: the council data is what the pages show", () => {
  assert.equal(NEXT_YEAR.order, null);
  assert.deepEqual(NEXT_YEAR.municipalities, {});
  assert.equal(nextYearPublished(), false);
  assert.equal(councilApprovedTowns().length, councilSlugs().length);
  for (const slug of councilSlugs()) assert.equal(councilApproved2027(slug), COUNCIL_2027[slug]);
  assert.equal(councilApproved2027("tarragona"), null);
});

/* -------------------------------------------------------------------------- */
/* The DOGC order wins                                                        */
/* -------------------------------------------------------------------------- */

test("the DOGC order supersedes the council's word everywhere", () => {
  // Once the order is parsed, no town has council data, listed or not.
  for (const slug of councilSlugs()) assert.equal(councilApproved2027(slug, true), null, slug);

  const bcn = town("barcelona");
  const dogc = { local: ["2027-05-17", "2027-09-24"] };
  const ca = municipalityCopy(bcn, "ca", dogc, "el Barcelonès", COUNCIL_2027.barcelona!);
  assert.equal(ca.nextCouncil, null);
  assert.equal(ca.nextLead, null);
  assert.equal(ca.councilSource, null);
  assert.match(ca.nextPublished ?? "", /^Els festius locals de Barcelona el 2027 són /);
  const faq = municipalityFaq(bcn, "es", dogc, "2026-10-31", COUNCIL_2027.barcelona!);
  assert.doesNotMatch(faq[2]!.answer, /pendientes/);
  assert.match(faq[2]!.answer, /^Los festivos locales de Barcelona en 2027 son /);
  const en = englishTownCopy(bcn, dogc, COUNCIL_2027.barcelona!);
  assert.equal(en.nextLead, null);
  assert.equal(en.councilSource, null);
  assert.doesNotMatch(en.next.join(" "), /pending/);
  assert.doesNotMatch(englishTownFaq(bcn, dogc, COUNCIL_2027.barcelona!)[3]!.answer, /pending/);
  // Titles and descriptions fall back to the plain forms when there is no council data.
  assert.equal(municipalityTitle(bcn, "es", councilApproved2027("barcelona", true)), municipalityTitle(bcn, "es", null));
  assert.equal(englishTownDescription(bcn, councilApproved2027("barcelona", true)), englishTownDescription(bcn, null));

  // What prepare2027 prints for a person to check: towns whose order days differ from the council's.
  const parsed = Object.fromEntries(councilSlugs().map((slug) => [slug, { local: [...COUNCIL_2027[slug]!.local] }]));
  assert.deepEqual(councilDisagreements(parsed), []);
  parsed.girona = { local: ["2027-07-25", "2027-10-29"] };
  delete parsed.barcelona;
  assert.deepEqual(
    councilDisagreements(parsed).map((d) => d.slug).sort(),
    ["barcelona", "girona"],
  );
});

/* -------------------------------------------------------------------------- */
/* Pages                                                                      */
/* -------------------------------------------------------------------------- */

test("titles <= 60 and descriptions <= 155 in all three languages, with the 2027 dates in one of them", () => {
  // The towns held out of the metadata (added 4 Nov) are checked in the next test.
  for (const slug of councilSlugs().filter((s) => !COUNCIL_2027_METADATA_HELD.has(s))) {
    const m = town(slug);
    const c = COUNCIL_2027[slug]!;
    for (const locale of ["ca", "es"] as const) {
      const title = municipalityTitle(m, locale);
      const pair = dayPair(c.local[0], c.local[1], locale);
      assert.ok(title.length <= TITLE_MAX, `${title} (${title.length})`);
      // The 2027 days lead the description, with and without the render date's next holiday.
      for (const today of [null, "2026-11-03", "2026-12-09"]) {
        const description = municipalityDescription(m, locale, undefined, today);
        assert.ok(description.length <= DESCRIPTION_MAX, `${description} (${description.length})`);
        assert.ok(description.includes(pair), `${slug} ${locale}: ${description}`);
        assert.ok(description.includes(String(NEXT)) && description.includes(String(YEAR)), description);
      }
      // Both years in the title whenever a two-year form of the question fits (CTR sweep, 3 Nov 2026).
      const name = locale === "ca" ? m.name : m.name.charAt(0).toUpperCase() + m.name.slice(1);
      const shortest = locale === "ca" ? `Avui és festiu a ${m.name}? Festius ${YEAR}-${NEXT}` : `¿Hoy es festivo en ${name}? Festivos ${YEAR}-${NEXT}`;
      if (shortest.length <= TITLE_MAX) assert.ok(title.includes(String(NEXT)), title);
    }
    if (hasEnglishPage(slug)) {
      const title = englishTownTitle(m);
      const description = englishTownDescription(m);
      assert.ok(title.length <= 60, `${title} (${title.length})`);
      assert.ok(description.length <= 155, `${description} (${description.length})`);
      assert.ok(description.includes(dayPair(c.local[0], c.local[1], "en")), description);
      for (const d of m.local) assert.ok(description.includes(dayMonth(d, "en")), description);
    }
  }
  // The question first, in the searchers' words; the 2027 dates lead the description.
  assert.equal(municipalityTitle(town("granollers"), "es"), "¿Hoy o mañana es festivo en Granollers? Festivos 2026 y 2027");
  assert.equal(municipalityTitle(town("barcelona"), "ca"), "Avui o demà és festiu a Barcelona? Festius 2026 i 2027");
  assert.equal(municipalityTitle(town("barcelona"), "es"), "¿Hoy o mañana es festivo en Barcelona? Festivos 2026 y 2027");
  assert.equal(
    municipalityDescription(town("badalona"), "es", undefined, "2026-11-03"),
    "Festivos locales de Badalona en 2027: 11 y 17 de mayo, aprobados por el Ayuntamiento. En 2026: 11 y 25 de mayo. Próximo festivo: 8 de diciembre.",
  );
  assert.equal(englishTownTitle(town("blanes")), "Blanes public holidays 2026 and 2027: 30 March and 26 July");
  // Too long for the question with both years: the question stays, the description carries the 2027 dates.
  assert.equal(municipalityTitle(town("l-hospitalet-de-llobregat"), "es"), "¿Hoy es festivo en L'Hospitalet de Llobregat? Festivos 2026");
  assert.match(municipalityDescription(town("l-hospitalet-de-llobregat"), "es"), /2027: 17 de mayo y 24 de septiembre/);
});

test("towns added inside the retitle's measurement window keep their title, H1 and description; the body gives the days", () => {
  assert.ok(COUNCIL_2027_METADATA_HELD.size > 0);
  for (const slug of COUNCIL_2027_METADATA_HELD) {
    const m = town(slug);
    const c = COUNCIL_2027[slug];
    assert.ok(c, `${slug}: held but has no council data`);
    assert.equal(c.readOn, "2026-11-04", `${slug}: only the 4 Nov additions are held`);
    assert.equal(councilForMetadata(slug), null, slug);
    assert.equal(councilApproved2027(slug), c, slug);
    for (const locale of ["ca", "es"] as const) {
      // Byte for byte what the page printed before the town had council data.
      assert.equal(municipalityTitle(m, locale), municipalityTitle(m, locale, null), slug);
      assert.equal(municipalityH1(m, locale), municipalityH1(m, locale, null), slug);
      for (const today of [null, "2026-11-04", "2026-12-09"]) {
        assert.equal(municipalityDescription(m, locale, undefined, today), municipalityDescription(m, locale, null, today), slug);
      }
      assert.ok(!municipalityTitle(m, locale).includes(String(NEXT)), municipalityTitle(m, locale));
      // The body: the line under the lead, the 2027 section, the FAQ, the Dataset's coverage and source.
      const copy = municipalityCopy(m, locale, null, m.comarca);
      assert.ok(copy.nextLead?.includes(dayPair(c.local[0], c.local[1], locale)), `${slug}: ${copy.nextLead}`);
      assert.equal(copy.councilSource?.url, c.source.url, slug);
      assert.match(municipalityFaq(m, locale, null, "2026-11-04")[2]!.answer, locale === "ca" ? /aprovats pe[rl]|fixats per/ : /aprobados por|fijados por/, slug);
      const dataset = municipalityDataset(m, locale) as Record<string, unknown>;
      assert.equal(dataset.temporalCoverage, `${YEAR}/${NEXT}`, slug);
      assert.ok((dataset.isBasedOn as string[]).includes(c.source.url), slug);
    }
    if (hasEnglishPage(slug)) {
      assert.equal(englishTownTitle(m), englishTownTitle(m, null), slug);
      assert.equal(englishTownDescription(m), englishTownDescription(m, null), slug);
      assert.ok(englishTownCopy(m, null).nextLead?.includes(dayPair(c.local[0], c.local[1], "en")), slug);
    }
  }
  // The towns read up to 3 Nov keep 2027 in their titles.
  assert.ok(!COUNCIL_2027_METADATA_HELD.has("barcelona"));
  assert.equal(councilForMetadata("barcelona"), COUNCIL_2027.barcelona);
});

test("town page: the answer with its label first, then the 2027 calendar with the days marked pending", () => {
  const bcn = town("barcelona");
  const ca = municipalityCopy(bcn, "ca", null, "el Barcelonès");
  assert.equal(
    ca.nextLead,
    "Festius locals del 2027: 17 de maig i 24 de setembre, aprovats per l'Ajuntament (decret d'alcaldia del 4 de juny de 2026), pendents de l'ordre del DOGC.",
  );
  assert.match(ca.nextCouncil![0]!, /^Els festius locals de Barcelona el 2027 seran el dilluns 17 de maig \(Dilluns de Pasqua Granada\) i el divendres 24 de setembre \(Mare de Déu de la Mercè\)/);
  assert.equal(ca.councilSource?.url, COUNCIL_2027.barcelona!.source.url);
  const es = municipalityCopy(town("granollers"), "es", null, "Vallès Oriental");
  assert.match(es.nextLead ?? "", /aprobados por el Ayuntamiento \(pleno del 21 de julio de 2026\), pendientes de la orden del DOGC\.$/);
  const en = englishTownCopy(bcn, null);
  assert.match(en.nextLead ?? "", /approved by the council \(mayoral decree of 4 June 2026\), pending the DOGC order\.$/);
  assert.match(en.nextCaption, /pending the DOGC order/);

  // The labels for each kind of act.
  assert.match(councilLabel(COUNCIL_2027.badalona!, "ca"), /^aprovats per l'Ajuntament \(Junta de Govern Local del 17 de juliol de 2026\)/);
  assert.match(councilLabel(COUNCIL_2027.girona!, "es"), /^aprobados por el pleno del Ayuntamiento, pendientes/);
  assert.match(councilLabel(COUNCIL_2027.lleida!, "en"), /^set by the council, according to its website, pending the DOGC order$/);

  // The 2027 table: the twelve Catalonia-wide days plus the council's two, marked pending.
  const rows = yearRows(bcn, NEXT, "ca", { council: true });
  assert.equal(rows.length, 14);
  assert.deepEqual(
    rows.filter((r) => r.pending).map((r) => [r.date, r.name]),
    [
      ["2027-05-17", "Dilluns de Pasqua Granada"],
      ["2027-09-24", "Mare de Déu de la Mercè"],
    ],
  );
  assert.ok(yearRows(bcn, NEXT, "es", { council: true }).filter((r) => r.pending).every((r) => r.name === "Fiesta local"));
  // Without the option (and in the status box) next year has no local days until the order.
  assert.equal(yearRows(bcn, NEXT, "ca").filter((r) => r.kind === "local").length, 0);
  assert.ok(!statusDays(bcn, "ca").some((d) => d.d === "2027-05-17"));

  // FAQ and Dataset carry the same days.
  assert.match(municipalityFaq(bcn, "ca", null, "2026-10-31")[2]!.answer, /seran el dilluns 17 de maig i el divendres 24 de setembre, aprovats per l'Ajuntament/);
  const dataset = municipalityDataset(bcn, "es") as Record<string, unknown>;
  assert.equal(dataset.temporalCoverage, `${YEAR}/${NEXT}`);
  assert.ok((dataset.isBasedOn as string[]).includes(COUNCIL_2027.barcelona!.source.url));
  assert.match(String(dataset.description), /2027: 17 de mayo y 24 de septiembre/);
  const tgn = municipalityDataset(town("tarragona"), "es") as Record<string, unknown>;
  assert.equal(tgn.temporalCoverage, String(YEAR));
});

test("nuclei the council lists are named with their own days", () => {
  const lleida = municipalityCopy(town("lleida"), "ca", null, "el Segrià");
  assert.match(lleida.nextCouncil![0]!, /Alguns nuclis en tenen de propis: Raimat \(27 d'abril i 23 de juliol\) i Sucs \(14 de maig i 13 d'agost\)\./);
  const tortosa = municipalityCopy(town("tortosa"), "es", null, "Baix Ebre");
  assert.match(tortosa.nextCouncil![0]!, /Bítem \(17 de mayo y 17 de septiembre\)/);
});

test("hubs and comarca pages count and name the councils from the data", () => {
  const n = councilApprovedTowns().length;
  assert.match(hubCopy("ca").next, new RegExp(` ${n} ajuntaments ja han aprovat els seus, pendents de l'ordre`));
  assert.match(hubCopy("es").next, new RegExp(` ${n} ayuntamientos ya han aprobado los suyos, pendientes de la orden`));
  const valles = comarcaCopy(comarcaOf(town("granollers")), "ca").next;
  assert.match(valles, /Granollers \(7 de maig i 27 d'agost\)/);
  assert.match(valles, /pendents de l'ordre del DOGC/);
  const hub = englishHubCopy();
  assert.match(hub.next, /Barcelona \(17 May and 24 September\)/);
  assert.match(hub.next, /have already approved theirs, pending the order\.$/);
});

test("deterministic: no clock in the council data or the code that prints it", () => {
  for (const file of ["src/lib/programmatic/holidays/council-2027.ts", "src/lib/programmatic/holidays/structured.ts", "src/lib/programmatic/holidays/copy.ts"]) {
    const source = readFileSync(join(ROOT, file), "utf8");
    assert.doesNotMatch(source, /new Date\(\)|Date\.now\(/, file);
  }
  for (const slug of councilSlugs()) {
    const m = town(slug);
    assert.equal(municipalityTitle(m, "ca"), municipalityTitle(m, "ca"));
    assert.deepEqual(municipalityCopy(m, "es", null, m.comarca), municipalityCopy(m, "es", null, m.comarca));
  }
});
