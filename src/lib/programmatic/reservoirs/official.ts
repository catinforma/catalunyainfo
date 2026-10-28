import type { Locale } from "@/lib/i18n/config";

import type { ReservoirSlug } from "./types";

/**
 * What the ACA says about each reservoir, as opposed to what the data says.
 * Every fact was read on 28 Oct 2026 in one of these official documents:
 *
 *  - BULLETIN: "Estat dels embassaments de conques internes de capacitat
 *    superior a 2 hm³ a 28/10/2026 (dades agregades del dia anterior)", the
 *    ACA's daily PDF (updated 28/10/2026 12:27). Source of every capacity:
 *    the same figures the daily open data is computed against.
 *  - DAMS_PAGE: "Preses i embassaments" (aca.gencat.cat, updated 07.07.2025):
 *    the municipalities each reservoir covers and its uses, for the seven
 *    the ACA manages.
 *  - GUIDE: "La gestió dels embassaments de Catalunya" (ACA, December 2021):
 *    river, municipality and comarca of the dam, year of inauguration, height
 *    from the foundation, purpose. Its capacities are older and not used.
 *  - PLAN: Pla de gestió del districte de conca fluvial de Catalunya
 *    2022-2027, annex VI: the Ter system, Susqueda, Siurana and Riudecanyes.
 *  - PES: Pla especial d'actuació en situació d'alerta i eventual sequera,
 *    consolidated text after the Government agreements of 16/1/2024 (the
 *    ACA's "text consolidat sense valor jurídic"): drought units and their
 *    thresholds (tables 3-3, 3-4, 3-5).
 *
 * Left out because no official page we read says it: the comarca of
 * Susqueda, la Baells, Siurana and Riudecanyes; the municipality of
 * Riudecanyes' dam; the year and height of Susqueda and Riudecanyes; any
 * drought unit for Foix (the PES uses no Foix indicator).
 */

export const OFFICIAL_VERIFIED = "2026-10-28";

export interface OfficialSource {
  name: string;
  publisher: string;
  url: string;
  /** The date the document shows, as it shows it. */
  dated: string;
}

const ACA = "Agència Catalana de l'Aigua (ACA)";

export const SOURCES = {
  bulletin: {
    name: "Estat dels embassaments de conques internes (butlletí diari, PDF)",
    publisher: ACA,
    url: "https://info.aca.gencat.cat/ca/aca/informacio/informesdwh/dades_embassaments_ca.pdf",
    dated: "28/10/2026",
  },
  damsPage: {
    name: "Preses i embassaments",
    publisher: ACA,
    url: "https://aca.gencat.cat/ca/laigua/infraestructures/preses-i-embassaments/index.html",
    dated: "07.07.2025",
  },
  guide: {
    name: "La gestió dels embassaments de Catalunya",
    publisher: ACA,
    url: "https://aca.gencat.cat/web/.content/10_ACA/J_Publicacions/03-guies/07-gestio-embassaments-Catalunya.pdf",
    dated: "desembre de 2021",
  },
  plan: {
    name: "Pla de gestió del districte de conca fluvial de Catalunya 2022-2027, annex VI",
    publisher: ACA,
    url: "https://info.aca.gencat.cat/ca/aca/informacio/geco/plans-programes/PDG/CA/01-06_Annex06_Analisi_garantia_models.pdf",
    dated: "2022-2027",
  },
  pes: {
    name: "Pla especial d'actuació en situació d'alerta i eventual sequera (text consolidat)",
    publisher: ACA,
    url: "https://aca.gencat.cat/web/.content/30_Plans_i_programes/30_Pla_sequera/documents-PES/PES-consolidat-abril-2024.pdf",
    dated: "Acord GOV/1/2020, modificacions fins al 16/1/2024",
  },
} as const satisfies Record<string, OfficialSource>;

/** Official pages for readers, by language where the ACA has one (checked 28 Oct 2026: no English editions). */
export const officialUrl = {
  damsPage: (l: Locale, anchor: string | null) =>
    `https://aca.gencat.cat/${l === "ca" ? "ca" : "es"}/laigua/infraestructures/preses-i-embassaments/index.html${anchor ? `#${anchor}` : ""}`,
  reserves: (l: Locale) => `https://aca.gencat.cat/${l === "ca" ? "ca" : "es"}/laigua/estat-del-medi-hidric/recursos-disponibles/estat-de-les-reserves-daigua-als-embassaments/`,
  droughtPlan: (l: Locale) => `https://aca.gencat.cat/${l === "ca" ? "ca" : "es"}/plans-i-programes/pla-de-sequera/`,
  // Catalan only (the Spanish address is a 404).
  declarations: "https://aca.gencat.cat/ca/laigua/portal-sequera/estat-actual/declaracions-sequera/",
} as const;

/** The drought unit whose indicator counts this reservoir (PES 3.4). */
export type DroughtUnit = "terLlobregat" | "darnius" | "riudecanyes" | null;

export interface ReservoirOfficial {
  /** hm³, BULLETIN of 28/10/2026. */
  capacity: number;
  /** The river the dam is on (GUIDE; PLAN for Susqueda and Riudecanyes). */
  river: Record<Locale, string>;
  /** Municipalities the reservoir covers, DAMS_PAGE; null when the page has none. */
  municipalities: string[] | null;
  /** GUIDE, only where it names one. */
  comarca: string | null;
  /** Who runs the dam: GUIDE p.4 and DAMS_PAGE. */
  manager: "aca" | "endesa" | "riudecanyes";
  /** GUIDE tables ("Any d'inauguració", "Alçada des de fonamentació"). */
  inaugurated: number | null;
  height: number | null;
  /** Anchor of its section on DAMS_PAGE, if it has one. */
  damsAnchor: string | null;
  unit: DroughtUnit;
  /** For Ter-Llobregat reservoirs: the partial indicator it is in. */
  subIndicator: "ter" | "llobregat" | null;
  /** What it is for, in the official documents' terms. */
  uses: Record<Locale, string>;
}

const same = (name: string): Record<Locale, string> => ({ ca: name, es: name, en: name });

export const OFFICIAL: Record<ReservoirSlug, ReservoirOfficial> = {
  susqueda: {
    capacity: 223.58,
    river: same("Ter"),
    municipalities: null,
    comarca: null,
    manager: "endesa",
    inaugurated: null,
    height: null,
    damsAnchor: null,
    unit: "terLlobregat",
    subIndicator: "ter",
    uses: {
      ca: "Susqueda és, amb Sau i el Pasteral, el sistema que regula el Ter. Gràcies a la regulació de Sau i Susqueda, Aigües Ter-Llobregat (ATL) deriva l'aigua cap a la potabilitzadora de Cardedeu i la regió metropolitana de Barcelona, i també cap a Girona i el Consorci de la Costa Brava centre (pla de gestió de l'ACA). El sistema de preses participa en la laminació de les avingudes.",
      es: "Susqueda forma con Sau y el Pasteral el sistema que regula el Ter. Gracias a la regulación de Sau y Susqueda, Aigües Ter-Llobregat (ATL) deriva el agua hacia la potabilizadora de Cardedeu y la región metropolitana de Barcelona, y también hacia Girona y el Consorci de la Costa Brava centro (plan de gestión de la ACA). El sistema de presas ayuda a laminar las avenidas.",
      en: "Susqueda, with Sau and el Pasteral, is the system that regulates the Ter. Thanks to Sau and Susqueda, Aigües Ter-Llobregat (ATL) takes water to the Cardedeu treatment plant and the Barcelona metropolitan region, and also to Girona and the central Costa Brava (ACA basin management plan). The dams also help hold back floods.",
    },
  },
  sau: {
    capacity: 165.81,
    river: same("Ter"),
    municipalities: ["Vilanova de Sau", "les Masies de Roda", "Tavertet", "l'Esquirol"],
    comarca: "Osona",
    manager: "aca",
    inaugurated: 1963,
    height: 83,
    damsAnchor: "embassament-de-sau",
    unit: "terLlobregat",
    subIndicator: "ter",
    uses: {
      ca: "Segons l'ACA, la finalitat principal de Sau és l'abastament d'aigua de Barcelona i la seva àrea metropolitana, de Girona i de poblacions de la Costa Brava, els regs del Ter i l'aprofitament hidroelèctric. És la presa més amunt del sistema Sau-Susqueda-el Pasteral, del qual es deriva l'aigua cap a la potabilitzadora de Cardedeu. També regula avingudes i s'hi fan activitats recreatives.",
      es: "Según la ACA, la finalidad principal de Sau es abastecer de agua a Barcelona y su área metropolitana, a Girona y a poblaciones de la Costa Brava, los riegos del Ter y el aprovechamiento hidroeléctrico. Es la presa situada más arriba del sistema Sau-Susqueda-el Pasteral, del que se deriva el agua hacia la potabilizadora de Cardedeu. También regula avenidas y acoge actividades recreativas.",
      en: "According to the ACA, Sau's main purpose is water supply for Barcelona and its metropolitan area, Girona and Costa Brava towns, irrigation along the Ter and hydroelectric power. It is the uppermost dam of the Sau-Susqueda-el Pasteral system, from which water is taken to the Cardedeu treatment plant. It also regulates floods and is used for recreation.",
    },
  },
  "la-baells": {
    capacity: 108.71,
    river: same("Llobregat"),
    municipalities: ["Cercs"],
    comarca: null,
    manager: "aca",
    inaugurated: 1976,
    height: 102.35,
    damsAnchor: "embassament-de-la-baells",
    unit: "terLlobregat",
    subIndicator: "llobregat",
    uses: {
      ca: "La Baells regula el curs alt del Llobregat per garantir l'abastament de diverses ciutats de la província de Barcelona (la capital inclosa), els usos industrials i les demandes agrícoles. També lamina avingudes, produeix electricitat amb el salt de la presa i s'hi fan activitats recreatives aquàtiques.",
      es: "La Baells regula el curso alto del Llobregat para garantizar el abastecimiento de varias ciudades de la provincia de Barcelona (la capital incluida), los usos industriales y las demandas agrícolas. También lamina avenidas, produce electricidad con el salto de la presa y acoge actividades recreativas acuáticas.",
      en: "La Baells regulates the upper Llobregat to secure supply for several towns in the province of Barcelona (the city included), industry and farming. It also holds back floods, generates electricity from the dam's head and is used for water sports.",
    },
  },
  "la-llosa-del-cavall": {
    capacity: 71.56,
    river: same("Cardener"),
    municipalities: ["Navès", "Guixers", "Sant Llorenç de Morunys"],
    comarca: "Solsonès",
    manager: "aca",
    inaugurated: 1998,
    height: 122.3,
    damsAnchor: "embassament-de-la-llosa-del-cavall",
    unit: "terLlobregat",
    subIndicator: "llobregat",
    uses: {
      ca: "La Llosa del Cavall regula el Cardener, afluent del Llobregat, per a l'abastament i el reg. Forma el sistema Cardener-Llobregat amb la Baells i Sant Ponç i, segons l'ACA, va millorar l'aigua disponible per a les poblacions de la conca, sobretot de la conca baixa. No té aprofitament hidroelèctric entre els seus usos.",
      es: "La Llosa del Cavall regula el Cardener, afluente del Llobregat, para el abastecimiento y el riego. Forma el sistema Cardener-Llobregat con la Baells y Sant Ponç y, según la ACA, mejoró el agua disponible para las poblaciones de la cuenca, sobre todo de la cuenca baja. Entre sus usos no figura el hidroeléctrico.",
      en: "La Llosa del Cavall regulates the Cardener, a tributary of the Llobregat, for supply and irrigation. With la Baells and Sant Ponç it forms the Cardener-Llobregat system and, according to the ACA, it improved the water available to the towns of the basin, above all the lower basin. Hydroelectric power is not one of its uses.",
    },
  },
  "darnius-boadella": {
    capacity: 63.3,
    river: same("Muga"),
    municipalities: ["Darnius"],
    comarca: "Alt Empordà",
    manager: "aca",
    inaugurated: 1969,
    height: 62.98,
    damsAnchor: "embassament-de-darnius-boadella",
    unit: "darnius",
    subIndicator: null,
    uses: {
      ca: "Darnius Boadella regula la Muga per garantir l'aigua d'una important zona de regadiu, l'abastament de Figueres i de les principals poblacions del nord del Consorci de la Costa Brava, i la producció hidroelèctrica. També lamina avingudes i s'hi fan activitats recreatives.",
      es: "Darnius Boadella regula la Muga para garantizar el agua de una importante zona de regadío, el abastecimiento de Figueres y de las principales poblaciones del norte del Consorci de la Costa Brava, y la producción hidroeléctrica. También lamina avenidas y acoge actividades recreativas.",
      en: "Darnius Boadella regulates the Muga to secure water for a large irrigated area, supply for Figueres and the main towns in the north of the Costa Brava water consortium, and hydroelectric power. It also holds back floods and is used for recreation.",
    },
  },
  "sant-ponc": {
    capacity: 24.41,
    river: same("Cardener"),
    municipalities: ["Clariana de Cardener", "Olius", "Navès"],
    comarca: "Solsonès",
    manager: "aca",
    inaugurated: 1957,
    height: 59.7,
    damsAnchor: "embassament-de-sant-ponc",
    unit: "terLlobregat",
    subIndicator: "llobregat",
    uses: {
      ca: "Sant Ponç regula el Cardener, afluent del Llobregat, per produir energia hidroelèctrica i atendre demandes d'abastament i de reg. Va ser el primer embassament del sistema Cardener-Llobregat, que completen la Llosa del Cavall i la Baells. També lamina avingudes.",
      es: "Sant Ponç regula el Cardener, afluente del Llobregat, para producir energía hidroeléctrica y atender demandas de abastecimiento y de riego. Fue el primer embalse del sistema Cardener-Llobregat, que completan la Llosa del Cavall y la Baells. También lamina avenidas.",
      en: "Sant Ponç regulates the Cardener, a tributary of the Llobregat, for hydroelectric power, supply and irrigation. It was the first reservoir of the Cardener-Llobregat system, later joined by la Llosa del Cavall and la Baells. It also holds back floods.",
    },
  },
  siurana: {
    capacity: 12.01,
    river: same("Siurana"),
    municipalities: null,
    comarca: null,
    manager: "aca",
    inaugurated: 1973,
    height: 62.74,
    damsAnchor: "embassament-de-siurana",
    unit: "riudecanyes",
    subIndicator: null,
    uses: {
      ca: "Siurana és a la conca de l'Ebre, però l'ACA el gestiona i el publica amb els de les conques internes. Forma el sistema Siurana-Riudecanyes: una part de l'aigua es transvasa a l'embassament de Riudecanyes (el pla de gestió parla d'uns 4 hm³ l'any de mitjana). També en depenen l'abastament i els regs de Torroja del Priorat, Poboleda, Gratallops i Porrera.",
      es: "Siurana está en la cuenca del Ebro, pero la ACA lo gestiona y lo publica con los de las cuencas internas. Forma el sistema Siurana-Riudecanyes: parte del agua se trasvasa al embalse de Riudecanyes (el plan de gestión habla de unos 4 hm³ al año de media). También dependen de él el abastecimiento y los riegos de Torroja del Priorat, Poboleda, Gratallops y Porrera.",
      en: "Siurana lies in the Ebro basin, but the ACA manages it and publishes it with the internal-basin reservoirs. It forms the Siurana-Riudecanyes system: part of its water is transferred to the Riudecanyes reservoir (the basin plan gives an average of about 4 hm³ a year). Supply and irrigation in Torroja del Priorat, Poboleda, Gratallops and Porrera also depend on it.",
    },
  },
  riudecanyes: {
    capacity: 5.32,
    river: { ca: "riera de Riudecanyes", es: "riera de Riudecanyes", en: "Riudecanyes stream" },
    municipalities: null,
    comarca: null,
    manager: "riudecanyes",
    inaugurated: null,
    height: null,
    damsAnchor: null,
    unit: "riudecanyes",
    subIndicator: null,
    uses: {
      ca: "Riudecanyes regula la riera del mateix nom i rep també l'aigua transvasada des del Siurana. Segons el pla de gestió de l'ACA, en surt l'abastament del nucli de Riudecanyes i d'una part de Reus, i aigua per al reg del Camp de Tarragona, que era la seva funció original.",
      es: "Riudecanyes regula la riera del mismo nombre y recibe también el agua trasvasada desde el Siurana. Según el plan de gestión de la ACA, de él salen el abastecimiento del núcleo de Riudecanyes y de parte de Reus, y agua para el riego del Camp de Tarragona, que era su función original.",
      en: "Riudecanyes regulates the stream of the same name and also receives water transferred from the Siurana. According to the ACA's basin plan, it supplies the village of Riudecanyes and part of Reus, and water for irrigation in the Camp de Tarragona, its original purpose.",
    },
  },
  foix: {
    capacity: 3.37,
    river: same("Foix"),
    municipalities: ["Castellet i la Gornal"],
    comarca: "Alt Penedès",
    manager: "aca",
    inaugurated: 1928,
    height: 38,
    damsAnchor: "embassament-del-foix",
    unit: null,
    subIndicator: null,
    uses: {
      ca: "El Foix regula el riu del mateix nom per regar unes 290 hectàrees de Vilanova i la Geltrú, Sant Pere de Ribes, Cubelles i Cunit, i lamina avingudes. Entre els usos que li atribueix l'ACA no hi ha l'abastament, i el pla de gestió el descriu com un embassament molt aterrat, amb problemes de qualitat de l'aigua i dels sediments.",
      es: "El Foix regula el río del mismo nombre para regar unas 290 hectáreas de Vilanova i la Geltrú, Sant Pere de Ribes, Cubelles y Cunit, y lamina avenidas. Entre los usos que le atribuye la ACA no figura el abastecimiento, y el plan de gestión lo describe como un embalse muy colmatado, con problemas de calidad del agua y de los sedimentos.",
      en: "Foix regulates the river of the same name to irrigate about 290 hectares in Vilanova i la Geltrú, Sant Pere de Ribes, Cubelles and Cunit, and holds back floods. The ACA lists no drinking-water use for it, and the basin plan describes it as heavily silted, with water and sediment quality problems.",
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Drought thresholds (PES, tables 3-3, 3-4, 3-5), hm³, October to September  */
/* -------------------------------------------------------------------------- */

export type Stage = "prealerta" | "alerta" | "excepcionalitat" | "emergencia1" | "emergencia2" | "emergencia3" | "emergencia";

/** Thresholds by month, October first ("Els llindars apliquen des del dia 1 del mes indicat"). */
export interface ThresholdRow {
  stage: Stage;
  values: number[];
}

const flat = (v: number) => Array<number>(12).fill(v);

export interface Indicator {
  key: "terLlobregat" | "ter" | "llobregat" | "darnius" | "siuranaRiudecanyes";
  /** The reservoirs whose volumes are added. */
  reservoirs: ReservoirSlug[];
  rows: ThresholdRow[];
}

export const INDICATORS: Record<Indicator["key"], Indicator> = {
  terLlobregat: {
    key: "terLlobregat",
    reservoirs: ["sau", "susqueda", "la-llosa-del-cavall", "sant-ponc", "la-baells"],
    rows: [
      { stage: "prealerta", values: flat(367) },
      { stage: "alerta", values: [210, 210, 210, 210, 240, 270, 270, 270, 270, 270, 240, 210] },
      { stage: "excepcionalitat", values: flat(145) },
      { stage: "emergencia1", values: flat(100) },
      { stage: "emergencia2", values: flat(67) },
      { stage: "emergencia3", values: flat(33) },
    ],
  },
  ter: {
    key: "ter",
    reservoirs: ["sau", "susqueda"],
    rows: [
      { stage: "prealerta", values: flat(200) },
      { stage: "alerta", values: [120, 120, 120, 120, 140, 160, 160, 160, 160, 160, 140, 120] },
      { stage: "excepcionalitat", values: flat(85) },
      { stage: "emergencia1", values: flat(65) },
      { stage: "emergencia2", values: flat(43) },
      { stage: "emergencia3", values: flat(14) },
    ],
  },
  llobregat: {
    key: "llobregat",
    reservoirs: ["la-llosa-del-cavall", "sant-ponc", "la-baells"],
    rows: [
      { stage: "prealerta", values: flat(100) },
      { stage: "alerta", values: [65, 65, 65, 65, 75, 85, 85, 85, 85, 85, 75, 65] },
      { stage: "excepcionalitat", values: flat(40) },
      { stage: "emergencia1", values: flat(30) },
      { stage: "emergencia2", values: flat(20) },
      { stage: "emergencia3", values: flat(7) },
    ],
  },
  darnius: {
    key: "darnius",
    reservoirs: ["darnius-boadella"],
    rows: [
      { stage: "prealerta", values: flat(37) },
      { stage: "alerta", values: [23, 23, 23, 23, 27, 31, 35, 35, 35, 31, 27, 23] },
      { stage: "excepcionalitat", values: [16, 16, 16, 16, 16, 17, 18, 19, 19, 19, 17.5, 16] },
      { stage: "emergencia1", values: flat(11) },
      { stage: "emergencia2", values: flat(7) },
      { stage: "emergencia3", values: flat(4) },
    ],
  },
  siuranaRiudecanyes: {
    key: "siuranaRiudecanyes",
    reservoirs: ["siurana", "riudecanyes"],
    rows: [
      { stage: "prealerta", values: flat(10.5) },
      { stage: "emergencia", values: flat(1) },
    ],
  },
};

/** The indicators a reservoir's volume counts in, main one first. */
export function indicatorsOf(slug: ReservoirSlug): Indicator[] {
  const o = OFFICIAL[slug];
  if (o.unit === "terLlobregat") return [INDICATORS.terLlobregat, INDICATORS[o.subIndicator ?? "ter"]];
  if (o.unit === "darnius") return [INDICATORS.darnius];
  if (o.unit === "riudecanyes") return [INDICATORS.siuranaRiudecanyes];
  return [];
}
