import type { CalcEmbedLocale } from "./paths";

/**
 * Words of the "embed this calculator" boxes on the calculator pages
 * (components/programmatic/embed-calc/). Data-free: the working-days box is a
 * client component.
 */
export interface CalcBoxCopy {
  summary: string;
  lead: string;
  terms: string;
  place: string;
  placeHelp: string;
  codeLabel: string;
  copy: string;
  copied: string;
  /** The iframe's title and the link's text. */
  netTitle: string;
  wdTitle: (place: string) => string;
}

export const CALC_BOX_COPY: Record<CalcEmbedLocale, CalcBoxCopy> = {
  ca: {
    summary: "Posa aquesta calculadora al teu web",
    lead: "Per al web d'una gestoria, una empresa, un sindicat, un ajuntament o un mitjà: copia el codi i enganxa'l on el teu web accepti HTML (a WordPress, en un bloc «HTML personalitzat»). Fa el càlcul amb les mateixes regles oficials que aquesta pàgina i s'actualitza sol quan canvien.",
    terms: "És gratuïta, sense publicitat, ni galetes, ni scripts, ni cap seguiment. Només et demanem que mantinguis l'enllaç de sota del marc: és la font.",
    place: "Festius de",
    placeHelp: "Els festius que la calculadora resta: tot Espanya, una comunitat, una ciutat o un municipi de Catalunya.",
    codeLabel: "El codi per enganxar",
    copy: "Copia el codi",
    copied: "Copiat",
    netTitle: "Calculadora de sou net",
    wdTitle: (p) => `Calculadora de dies hàbils: ${p}`,
  },
  es: {
    summary: "Pon esta calculadora en tu web",
    lead: "Para la web de una gestoría, una empresa, un sindicato, un ayuntamiento o un medio: copia el código y pégalo donde tu web acepte HTML (en WordPress, en un bloque «HTML personalizado»). Calcula con las mismas reglas oficiales que esta página y se actualiza sola cuando cambian.",
    terms: "Es gratis, sin publicidad, ni cookies, ni scripts, ni ningún seguimiento. Solo te pedimos que mantengas el enlace de debajo del marco: es la fuente.",
    place: "Festivos de",
    placeHelp: "Los festivos que la calculadora descuenta: toda España, una comunidad, una ciudad o un municipio de Cataluña.",
    codeLabel: "El código para pegar",
    copy: "Copiar el código",
    copied: "Copiado",
    netTitle: "Calculadora de sueldo neto",
    wdTitle: (p) => `Calculadora de días hábiles: ${p}`,
  },
  en: {
    summary: "Add this calculator to your website",
    lead: "For the website of an accountant (gestoría), a company, a union, a council or local media: copy the code and paste it wherever your site accepts HTML (in WordPress, a “Custom HTML” block). It works with the same official rules as this page and updates itself when they change.",
    terms: "Free, with no ads, no cookies, no scripts and no tracking of any kind. We only ask you to keep the link below the frame: it is the source.",
    place: "Holidays of",
    placeHelp: "The holidays the calculator leaves out: all of Spain, a region, a city or a town in Catalonia.",
    codeLabel: "The code to paste",
    copy: "Copy the code",
    copied: "Copied",
    netTitle: "Spain net salary calculator",
    wdTitle: (p) => `Spain working days calculator: ${p}`,
  },
};
