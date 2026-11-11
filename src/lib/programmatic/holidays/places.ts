import type { DateLocale } from "./format";
import { esName, joinList } from "./names";
import type { DatePlace } from "./types";

/** How the date pages count and name the places on a list: municipalities, and nuclei apart. */

export function countPlaces(places: readonly DatePlace[]): { municipalities: number; nuclei: number } {
  return { municipalities: places.filter((p) => !p.parent).length, nuclei: places.filter((p) => p.parent).length };
}

/**
 * "29 municipis i 21 nuclis", "29 municipios y 21 núcleos", "29 towns and 21
 * villages"; a zero side is left out ("1 nucli", never "0 municipis i 1 nucli",
 * which 5 January 2027 printed until 11 Nov 2026).
 */
export function placesPhrase(places: readonly DatePlace[], locale: DateLocale): string {
  const { municipalities: m, nuclei: n } = countPlaces(places);
  const words = {
    ca: { m: ["municipi", "municipis"], n: ["nucli", "nuclis"], and: "i" },
    es: { m: ["municipio", "municipios"], n: ["núcleo", "núcleos"], and: "y" },
    en: { m: ["town", "towns"], n: ["village", "villages"], and: "and" },
  }[locale];
  const part = (count: number, [one, many]: string[]) => `${count} ${count === 1 ? one : many}`;
  if (m === 0 && n > 0) return part(n, words.n);
  return `${part(m, words.m)}${n ? ` ${words.and} ${part(n, words.n)}` : ""}`;
}

/** "Copons, la Vajol i Sant Jaume de Frontanyà"; a nucleus with its municipality in brackets. */
export function placeNames(places: readonly DatePlace[], locale: DateLocale): string {
  const shown = (name: string) => (locale === "es" ? esName(name) : name);
  return joinList(places.map((p) => (p.parent ? `${shown(p.name)} (${shown(p.parent)})` : shown(p.name))), locale);
}
