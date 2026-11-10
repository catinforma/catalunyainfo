import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { h2, type B2Source } from "./shared";

/**
 * Road traffic over the December bridge and Christmas 2026-27 (10 Nov 2026).
 *
 * Read on 10 Nov 2026:
 *  - SCT, 2026 calendar of special operations: "4 al 8 de desembre de 2026
 *    Operació Especial LA CONSTITUCIÓ - IMMACULADA" (no hours).
 *  - DGT, Instrucción MOV 2025/21 (signed 29 Dec 2025), "Clasificación de
 *    operaciones de tráfico durante el año 2026": "Del 4 al 8: Operación
 *    Especial Constitución e Inmaculada" and "Del 18 de diciembre al 6 de
 *    enero: Operación Navidad 2026-27" (a scanned PDF, read from the image;
 *    no hours).
 *  - SCT, December 2026 restrictions: on Fri 4 Dec, 17-22 h, heavy vehicles
 *    and coaches of 7,500 kg or more keep to the right lane on the AP-7
 *    between Sant Celoni and Vilafranca del Penedès, no overtaking, 80 km/h.
 *
 * No hours for the operations themselves: neither calendar gives any. The
 * 2027 calendars are not out.
 */
export const TRAFFIC_URLS = {
  sctCalendar: "https://transit.gencat.cat/web/.content/documents/informacio-viaria/d-2026-calendari-operacions-especials-proves-esportives-i-esdeveniments.pdf",
  dgtOperations: "https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/muevete-con-seguridad/normas-de-trafico/MOV-gestion-trafico/2025/report_MOV_2025-21-cleaned.pdf",
  sctDecember: "https://transit.gencat.cat/web/.content/restriccions_circulacio/documents/12-desembre/Restriccions-12-Desembre-2026_Tot-tipus-mercaderies.pdf",
} as const;

const U = TRAFFIC_URLS;

const SCT_CALENDAR: B2Source = { name: "Calendari 2026 d'operacions especials, proves esportives i esdeveniments", url: U.sctCalendar, publisher: "Servei Català de Trànsit" };
const DGT_OPERATIONS: B2Source = { name: "Instrucción MOV 2025/21: clasificación de operaciones de tráfico durante el año 2026", url: U.dgtOperations, publisher: "Dirección General de Tráfico" };
const SCT_DECEMBER: B2Source = { name: "Restriccions a la circulació, desembre 2026 (tot tipus de mercaderies)", url: U.sctDecember, publisher: "Servei Català de Trànsit" };

export type TrafficPage = "bridge" | "spain" | "christmas";

/** The sources each kind of page links, to add to its own list. */
export function trafficSources(page: TrafficPage): B2Source[] {
  if (page === "christmas") return [DGT_OPERATIONS];
  return [SCT_CALENDAR, DGT_OPERATIONS, SCT_DECEMBER];
}

const TRUCKS: Record<Locale, string> = {
  ca: `**Si vas amb camió o autocar:** el Servei Català de Trànsit té les [restriccions a la circulació del desembre del 2026](${U.sctDecember}), dia a dia. Per exemple, el divendres 4, de 17 a 22 h, els vehicles pesants i els autobusos de 7.500 kg o més han d'anar pel carril dret de l'AP-7 entre Sant Celoni i Vilafranca del Penedès, sense avançar i a 80 km/h com a màxim.`,
  es: `**Si vas en camión o autocar:** el Servei Català de Trànsit tiene las [restricciones a la circulación de diciembre de 2026](${U.sctDecember}), día a día. Por ejemplo, el viernes 4, de 17 a 22 h, los vehículos pesados y los autobuses de 7.500 kg o más deben ir por el carril derecho de la AP-7 entre Sant Celoni y Vilafranca del Penedès, sin adelantar y a 80 km/h como máximo.`,
  en: `**Driving a lorry or a coach:** the Servei Català de Trànsit lists its [December 2026 traffic restrictions](${U.sctDecember}) day by day. For example, on Friday the 4th, from 17:00 to 22:00, heavy vehicles and coaches of 7,500 kg or more must keep to the right-hand lane of the AP-7 between Sant Celoni and Vilafranca del Penedès, with no overtaking and a limit of 80 km/h.`,
};

const COPY: Record<TrafficPage, Record<Locale, [string, ...string[]]>> = {
  bridge: {
    ca: [
      "Trànsit: operació especial del 4 al 8 de desembre",
      `El Servei Català de Trànsit té prevista l'operació especial de la Constitució i la Immaculada **del divendres 4 al dimarts 8 de desembre**, segons el seu [calendari d'operacions especials del 2026](${U.sctCalendar}). La DGT, que porta el trànsit a la resta d'Espanya, té la mateixa operació els mateixos dies, segons la seva [classificació d'operacions del 2026](${U.dgtOperations}). Cap dels dos calendaris no en dona les hores.`,
      TRUCKS.ca,
      "Per Nadal, la DGT té l'Operació Nadal 2026-27 del 18 de desembre al 6 de gener.",
    ],
    es: [
      "Tráfico: operación especial del 4 al 8 de diciembre",
      `El Servei Català de Trànsit tiene prevista la operación especial de la Constitución y la Inmaculada **del viernes 4 al martes 8 de diciembre**, según su [calendario de operaciones especiales de 2026](${U.sctCalendar}). La DGT, que gestiona el tráfico en el resto de España, tiene la misma operación los mismos días, según su [clasificación de operaciones de 2026](${U.dgtOperations}). Ninguno de los dos calendarios da las horas.`,
      TRUCKS.es,
      "En Navidad, la DGT tiene la Operación Navidad 2026-27 del 18 de diciembre al 6 de enero.",
    ],
    en: [
      "Traffic: special operation from 4 to 8 December",
      `Catalonia's traffic service, the Servei Català de Trànsit, has its Constitution and Immaculate Conception special operation planned **from Friday 4 to Tuesday 8 December**, according to its [2026 calendar of special operations](${U.sctCalendar}). The DGT, which runs traffic in the rest of Spain, has the same operation on the same days, according to its [2026 list of traffic operations](${U.dgtOperations}). Neither calendar gives times.`,
      TRUCKS.en,
      "Over Christmas, the DGT runs its Christmas 2026-27 operation from 18 December to 6 January.",
    ],
  },
  spain: {
    ca: [
      "Trànsit: operació especial del 4 al 8 de desembre",
      `La DGT té l'operació especial de la Constitució i la Immaculada **del divendres 4 al dimarts 8 de desembre**, segons la seva [classificació d'operacions del 2026](${U.dgtOperations}), i el Servei Català de Trànsit, la mateixa a Catalunya els mateixos dies, segons el seu [calendari del 2026](${U.sctCalendar}). Cap dels dos calendaris no en dona les hores.`,
      TRUCKS.ca,
      "Per Nadal, l'Operació Nadal 2026-27 de la DGT va del 18 de desembre al 6 de gener.",
    ],
    es: [
      "Tráfico: operación especial del 4 al 8 de diciembre",
      `La DGT tiene la operación especial de la Constitución y la Inmaculada **del viernes 4 al martes 8 de diciembre**, según su [clasificación de operaciones de 2026](${U.dgtOperations}), y el Servei Català de Trànsit, la misma en Cataluña los mismos días, según su [calendario de 2026](${U.sctCalendar}). Ninguno de los dos calendarios da las horas.`,
      TRUCKS.es,
      "En Navidad, la Operación Navidad 2026-27 de la DGT va del 18 de diciembre al 6 de enero.",
    ],
    en: [
      "Traffic: special operation from 4 to 8 December",
      `The DGT, Spain's traffic authority, has its Constitution and Immaculate Conception special operation **from Friday 4 to Tuesday 8 December**, according to its [2026 list of traffic operations](${U.dgtOperations}), and Catalonia's Servei Català de Trànsit has the same one on the same days, according to its [2026 calendar](${U.sctCalendar}). Neither calendar gives times.`,
      TRUCKS.en,
      "Over Christmas, the DGT's Christmas 2026-27 operation runs from 18 December to 6 January.",
    ],
  },
  christmas: {
    ca: [
      "Carreteres: Operació Nadal del 18 de desembre al 6 de gener",
      `Si fas les festes en cotxe, compta amb l'Operació Nadal 2026-27 de la DGT, **del 18 de desembre al 6 de gener**, segons la seva [classificació d'operacions del 2026](${U.dgtOperations}). El calendari no en dona les hores.`,
    ],
    es: [
      "Carreteras: Operación Navidad del 18 de diciembre al 6 de enero",
      `Si pasas las fiestas en coche, cuenta con la Operación Navidad 2026-27 de la DGT, **del 18 de diciembre al 6 de enero**, según su [clasificación de operaciones de 2026](${U.dgtOperations}). El calendario no da las horas.`,
    ],
    en: [
      "Roads: the Christmas operation from 18 December to 6 January",
      `If you are driving over the holidays, the DGT, Spain's traffic authority, runs its Christmas 2026-27 operation **from 18 December to 6 January**, according to its [2026 list of traffic operations](${U.dgtOperations}). The calendar gives no times.`,
    ],
  },
};

/** One H2 with its paragraphs, in the page's language. */
export function trafficBlocks(page: TrafficPage, locale: Locale): Block[] {
  const [heading, ...texts] = COPY[page][locale];
  return h2(heading, ...texts);
}
