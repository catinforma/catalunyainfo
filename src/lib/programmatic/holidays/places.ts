import type { DateLocale } from "./format";
import { esName, joinList } from "./names";
import type { DatePlace } from "./types";

/** How the date pages count and name the places on a list: municipalities, and nuclei apart. */

export function countPlaces(places: readonly DatePlace[]): { municipalities: number; nuclei: number } {
  return { municipalities: places.filter((p) => !p.parent).length, nuclei: places.filter((p) => p.parent).length };
}

/** "29 municipis i 21 nuclis", "29 municipios y 21 núcleos", "29 towns and 21 villages". */
export function placesPhrase(places: readonly DatePlace[], locale: DateLocale): string {
  const { municipalities: m, nuclei: n } = countPlaces(places);
  if (locale === "ca") return `${m} ${m === 1 ? "municipi" : "municipis"}${n ? ` i ${n} ${n === 1 ? "nucli" : "nuclis"}` : ""}`;
  if (locale === "es") return `${m} ${m === 1 ? "municipio" : "municipios"}${n ? ` y ${n} ${n === 1 ? "núcleo" : "núcleos"}` : ""}`;
  return `${m} ${m === 1 ? "town" : "towns"}${n ? ` and ${n} ${n === 1 ? "village" : "villages"}` : ""}`;
}

/** "Copons, la Vajol i Sant Jaume de Frontanyà"; a nucleus with its municipality in brackets. */
export function placeNames(places: readonly DatePlace[], locale: DateLocale): string {
  const shown = (name: string) => (locale === "es" ? esName(name) : name);
  return joinList(places.map((p) => (p.parent ? `${shown(p.name)} (${shown(p.parent)})` : shown(p.name))), locale);
}
