import type { Locale } from "@/lib/i18n/config";

import type { LineId } from "./types";

/**
 * Official pages and per-line facts that are not in the API snapshot. Every
 * URL and fact below was opened on rodalies.gencat.cat on 28 Oct 2026:
 *
 *  - line pages: "Sobre Rodalies > Dades de les línies" (ca and es exist for
 *    all 19; the English RL4 page is a 404, so English links go to the hub);
 *  - X accounts: "Rodalies a Twitter" ("Als perfils de les línies informem de
 *    l'estat del servei de cada una de les línies ... permanentment");
 *  - timetable PDFs: `/web/.content/02_Horaris/horaris/<line>.pdf` answers 200
 *    for R1, R2, R3, R4, R7, R8, R11, R15, R16 and RG1 (R2 covers R2 Nord and
 *    R2 Sud); for the other lines there is no PDF at that address, so the page
 *    sends people to the timetable search instead of guessing a file name;
 *  - Devolució Xpress: where to ask for it, per line, from "Devolució Xpress"
 *    (atencio_al_client/dx); RT1 is not in any of its lists;
 *  - compensation: "Condicions generals d'utilització dels serveis ferroviaris
 *    de Rodalies i Regionals de Catalunya", condition 13 (atencio_al_client/condicions_dus_2);
 *  - phone: 900 410 041, free, 7:00 to 23:00 every day ("Atenció telefònica").
 */

export const OFFICIAL_VERIFIED = "2026-10-28";

const BASE = "https://rodalies.gencat.cat";

export const officialUrl = {
  status: (l: Locale) => `${BASE}/${l}/alteracions_del_servei/`,
  timetables: (l: Locale) => `${BASE}/${l}/horaris/`,
  dx: (l: Locale) => `${BASE}/${l}/atencio_al_client/dx/`,
  dxForm: (l: Locale) => `${BASE}/${l === "en" ? "ca" : l}/atencio_al_client/sollicitud-devolucio-xpress/`,
  conditions: (l: Locale) => `${BASE}/${l}/atencio_al_client/condicions_dus_2/`,
  // No English page (404 on 28 Oct 2026): English readers get the Spanish one.
  delayCertificates: (l: Locale) => `${BASE}/${l === "en" ? "es" : l}/atencio_al_client/justificants-de-retard/`,
  complaints: (l: Locale) => `${BASE}/${l}/atencio_al_client/consultes_i_reclamacions/`,
  phone: (l: Locale) => `${BASE}/${l}/atencio_al_client/atencio-telefonica/`,
  xAccounts: (l: Locale) => `${BASE}/${l}/atencio_al_client/rodalies_a_twitter/`,
  whatsapp: "https://whatsapp.com/channel/0029Vav4hGTId7nPenKMuo2C",
  legalNotice: "https://web.gencat.cat/ca/ajuda/avis_legal/",
  renfeAlertsDataset: "https://data.renfe.com/dataset/incidencias-avisos",
  renfeLegal: "https://data.renfe.com/legal",
} as const;

export const PHONE = "900 410 041";

/** How Rodalies groups the lines on its own site. */
export type ServiceGroup = "barcelona" | "regional";

export interface LineOfficial {
  group: ServiceGroup;
  /** Path under /<locale>/sobre-rodalies/linies-i-estacions/. */
  page: string;
  /** The line's own X account. */
  x: string;
  /** Timetable PDF, only where the address answered on the day of checking. */
  pdf: string | null;
  /**
   * Devolució Xpress, as the official page lists it:
   *  - "barcelona": at the destination station on arrival; the online form
   *    within 24 hours only from stations without staff;
   *  - string[]: the stations where it can be asked for, up to 15 days later;
   *    the form for any other station;
   *  - null: the page names no station for this line.
   * R3 has both: Barcelona service as far as Sant Quirze de Besora, regional
   * stations from La Farga de Bebié to Puigcerdà.
   */
  dx: { barcelona: boolean; stations: string[] | null };
}

const pdf = (file: string) => `${BASE}/web/.content/02_Horaris/horaris/${file}.pdf`;
const BCN = { barcelona: true, stations: null };
const BCN_SHORT = ["Barcelona Sants", "Bcn Plaça Catalunya", "Bcn Passeig de Gràcia", "Bcn Estació de França", "Vilanova i la Geltrú", "Sant Vicenç de Calders"];

export const LINE_OFFICIAL: Record<LineId, LineOfficial> = {
  R1: { group: "barcelona", page: "servei_rodalia_barcelona/r1", x: "rod1cat", pdf: pdf("R1"), dx: BCN },
  R2: { group: "barcelona", page: "servei_rodalia_barcelona/r2", x: "rod2cat", pdf: pdf("R2"), dx: BCN },
  R2N: { group: "barcelona", page: "servei_rodalia_barcelona/r2n", x: "rod2nordcat", pdf: pdf("R2"), dx: BCN },
  R2S: { group: "barcelona", page: "servei_rodalia_barcelona/r2s", x: "rod2sudcat", pdf: pdf("R2"), dx: BCN },
  R3: {
    group: "barcelona",
    page: "servei_rodalia_barcelona/r3",
    x: "rod3cat",
    pdf: pdf("R3"),
    dx: { barcelona: true, stations: ["Barcelona Sants", "Bcn Plaça Catalunya", "Bcn Fabra i Puig", "Granollers Canovelles", "Vic", "Torelló", "Ripoll", "Ribes de Freser", "Puigcerdà"] },
  },
  R4: { group: "barcelona", page: "servei_rodalia_barcelona/r4", x: "rod4cat", pdf: pdf("R4"), dx: BCN },
  R7: { group: "barcelona", page: "servei_rodalia_barcelona/r7", x: "rod7cat", pdf: pdf("R7"), dx: BCN },
  R8: { group: "barcelona", page: "servei_rodalia_barcelona/r8", x: "rod8cat", pdf: pdf("R8"), dx: BCN },
  R11: {
    group: "regional",
    page: "servei_regionals/r11",
    x: "rod11cat",
    pdf: pdf("R11"),
    dx: {
      barcelona: false,
      stations: ["Barcelona Sants", "Bcn Plaça Catalunya", "Bcn Passeig de Gràcia", "Bcn El Clot Aragó", "Granollers Centre", "Sant Celoni", "Sils", "Caldes de Malavella", "Girona", "Flaçà", "Figueres", "Llançà", "Portbou"],
    },
  },
  R13: { group: "regional", page: "servei_regionals/r13", x: "rod13cat", pdf: null, dx: { barcelona: false, stations: [...BCN_SHORT, "Torredembarra", "Tarragona", "Reus", "Lleida-Pirineus"] } },
  R14: { group: "regional", page: "servei_regionals/r14", x: "rod14cat", pdf: null, dx: { barcelona: false, stations: [...BCN_SHORT, "Torredembarra", "Tarragona", "Reus", "Lleida-Pirineus"] } },
  R15: { group: "regional", page: "servei_regionals/r15", x: "rod15cat", pdf: pdf("R15"), dx: { barcelona: false, stations: [...BCN_SHORT, "Torredembarra", "Tarragona", "Reus"] } },
  R16: {
    group: "regional",
    page: "servei_regionals/r16",
    x: "rod16cat",
    pdf: pdf("R16"),
    dx: { barcelona: false, stations: [...BCN_SHORT, "Torredembarra", "Tarragona", "Cambrils", "L'Hospitalet de l'Infant", "L'Aldea-Amposta", "Tortosa"] },
  },
  R17: { group: "regional", page: "servei_regionals/linia-r17", x: "rod17cat", pdf: null, dx: { barcelona: false, stations: [...BCN_SHORT, "Tarragona"] } },
  RG1: { group: "regional", page: "servei_regionals/rg1", x: "rg1cat", pdf: pdf("RG1"), dx: { barcelona: false, stations: ["Figueres", "Flaçà", "Girona", "Caldes de Malavella", "Sils"] } },
  RT1: { group: "regional", page: "servei_regionals/rt1", x: "rt1cat", pdf: null, dx: { barcelona: false, stations: null } },
  RT2: { group: "regional", page: "servei_regionals/rt2", x: "rt2cat", pdf: null, dx: { barcelona: false, stations: ["Sant Vicenç de Calders", "Torredembarra", "Tarragona"] } },
  RL3: { group: "regional", page: "servei_regionals/linia-rl3", x: "rodl3cat", pdf: null, dx: { barcelona: false, stations: ["Lleida-Pirineus"] } },
  RL4: { group: "regional", page: "servei_regionals/linea-rl4", x: "rodRL4", pdf: null, dx: { barcelona: false, stations: ["Lleida-Pirineus"] } },
};

export function linePageUrl(id: LineId, locale: "ca" | "es"): string {
  return `${BASE}/${locale}/sobre-rodalies/linies-i-estacions/${LINE_OFFICIAL[id].page}/`;
}

export function xUrl(id: LineId): string {
  return `https://x.com/${LINE_OFFICIAL[id].x}`;
}
