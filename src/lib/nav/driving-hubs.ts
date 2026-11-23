import type { Locale } from "@/lib/i18n/config";
import { ZBE_HUB_LABEL, ZONA_AZUL_HUB_LABEL } from "@/lib/engagement/useful-now";
import { zbeHubPath } from "@/lib/programmatic/zbe/paths";
import { zaHubPath } from "@/lib/programmatic/zona-azul/paths";

/**
 * The two driving hubs link each other (23 Nov 2026). Both families went live
 * on 22 Nov and are read by the same person (driving into a city: may I enter
 * with my label, and where do I pay to park), but neither hub linked the
 * other: only the city pages crossed over (zona azul Girona ↔ ZBE Girona).
 * One sentence on each hub, under the city table, anchored with the other
 * hub's own title. No fact of its own.
 */
export interface SiblingHubLine {
  text: string;
  href: string;
  label: string;
}

/** On the zona azul hub: the ZBE hub. */
export function zbeHubLine(locale: Locale): SiblingHubLine {
  return {
    text: {
      es: "Antes de entrar en coche, comprueba si la ciudad tiene zona de bajas emisiones y qué etiqueta pide:",
      ca: "Abans d'entrar-hi en cotxe, comprova si la ciutat té zona de baixes emissions i quina etiqueta demana:",
      en: "Before driving in, check whether the city has a low-emission zone and which label it asks for:",
    }[locale],
    href: zbeHubPath(locale),
    label: ZBE_HUB_LABEL[locale],
  };
}

/** On the ZBE hub: the zona azul hub. */
export function parkingHubLine(locale: Locale): SiblingHubLine {
  return {
    text: {
      es: "Para aparcar en la calle al llegar, el horario y el precio de la zona azul de cada ciudad:",
      ca: "Per aparcar al carrer en arribar, l'horari i el preu de la zona blava de cada ciutat:",
      en: "To park on the street once you arrive, the blue zone hours and prices in each city:",
    }[locale],
    href: zaHubPath(locale),
    label: ZONA_AZUL_HUB_LABEL[locale],
  };
}
