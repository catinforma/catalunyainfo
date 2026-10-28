import type { Locale } from "@/lib/i18n/config";

import { officialUrl } from "./official";

/**
 * Words of the live block. They live in the browser bundle, not in the page
 * props: the server HTML then contains only `fallback`, which never says
 * whether a line has notices ("no incidents" can only be the browser's
 * answer, from data it has just read).
 */

export interface LiveLabels {
  /** Server HTML and no-JS text. Never says whether there are notices. */
  fallback: string;
  loading: string;
  /** "{source}" and "{n}". */
  sourceAgo: string;
  sourceNow: string;
  sourceNames: { rodalies: string; renfe: string };
  /** "{line}" for a line page. */
  none: string;
  noneNote: string;
  failed: string;
  stale: string;
  official: string;
  publishedToday: string;
  publishedYesterday: string;
  publishedOn: string;
  alsoLines: string;
  allLines: string;
  noLine: string;
  stations: string;
  refresh: string;
  languageNote: string | null;
  attribution: { rodalies: string; renfe: string };
}

const link = (label: string, url: string) => `[${label}](${url})`;

/** `lineName` is the line of a line page ("R2 Sud"), or null on the hub. */
export function liveLabels(locale: Locale, lineName: string | null): LiveLabels {
  const statusUrl = officialUrl.status(locale);
  if (locale === "ca") {
    return {
      fallback: `Els avisos en directe de Rodalies de Catalunya es carreguen aquí quan el navegador té JavaScript. Si no apareixen, consulta ${link("l'estat oficial del servei", statusUrl)}.`,
      loading: "Carregant els avisos de Rodalies de Catalunya…",
      sourceAgo: "Font: {source}, fa {n} min",
      sourceNow: "Font: {source}, ara mateix",
      sourceNames: { rodalies: "Rodalies de Catalunya", renfe: "Renfe, dades obertes" },
      none: lineName ? "Cap avís actiu per a l'{line}." : "Cap avís actiu a cap línia.",
      noneNote: "Les obres i els canvis anunciats amb antelació són a «Afectacions programades», dins l'estat oficial del servei.",
      failed: "Ara mateix no podem llegir els avisos de Rodalies. Consulta l'estat oficial del servei.",
      stale: "Les dades rebudes tenen més de 15 minuts i no les mostrem com a actuals. Consulta l'estat oficial del servei.",
      official: "Estat oficial del servei a rodalies.gencat.cat",
      publishedToday: "Publicat avui a les {time}",
      publishedYesterday: "Publicat ahir a les {time}",
      publishedOn: "Publicat el {date} a les {time}",
      alsoLines: "Línies: {lines}",
      allLines: "Totes les línies",
      noLine: "Sense línia indicada",
      stations: "Estacions: {list}",
      refresh: "Torna a carregar",
      languageNote: null,
      attribution: {
        rodalies: "Text dels avisos tal com el publica Rodalies de Catalunya.",
        renfe: "Origen de les dades: Renfe Operadora (dades obertes, CC BY 4.0).",
      },
    };
  }
  if (locale === "es") {
    return {
      fallback: `Los avisos en directo de Rodalies de Catalunya se cargan aquí cuando el navegador tiene JavaScript. Si no aparecen, consulta ${link("el estado oficial del servicio", statusUrl)}.`,
      loading: "Cargando los avisos de Rodalies de Catalunya…",
      sourceAgo: "Fuente: {source}, hace {n} min",
      sourceNow: "Fuente: {source}, ahora mismo",
      sourceNames: { rodalies: "Rodalies de Catalunya", renfe: "Renfe, datos abiertos" },
      none: lineName ? "Ningún aviso activo para la {line}." : "Ningún aviso activo en ninguna línea.",
      noneNote: "Las obras y los cambios anunciados con antelación están en «Afectacions programades», dentro del estado oficial del servicio.",
      failed: "Ahora mismo no podemos leer los avisos de Rodalies. Consulta el estado oficial del servicio.",
      stale: "Los datos recibidos tienen más de 15 minutos y no los mostramos como actuales. Consulta el estado oficial del servicio.",
      official: "Estado oficial del servicio en rodalies.gencat.cat",
      publishedToday: "Publicado hoy a las {time}",
      publishedYesterday: "Publicado ayer a las {time}",
      publishedOn: "Publicado el {date} a las {time}",
      alsoLines: "Líneas: {lines}",
      allLines: "Todas las líneas",
      noLine: "Sin línea indicada",
      stations: "Estaciones: {list}",
      refresh: "Volver a cargar",
      languageNote: null,
      attribution: {
        rodalies: "Texto de los avisos tal como lo publica Rodalies de Catalunya.",
        renfe: "Origen de los datos: Renfe Operadora (datos abiertos, CC BY 4.0).",
      },
    };
  }
  return {
    fallback: `Live notices from Rodalies de Catalunya load here when your browser runs JavaScript. If they do not appear, check ${link("the official service status", statusUrl)}.`,
    loading: "Loading notices from Rodalies de Catalunya…",
    sourceAgo: "Source: {source}, {n} min ago",
    sourceNow: "Source: {source}, just now",
    sourceNames: { rodalies: "Rodalies de Catalunya", renfe: "Renfe open data" },
    none: lineName ? "No active notice for the {line}." : "No active notice on any line.",
    noneNote: "Engineering works and changes announced in advance are under \"Afectacions programades\" on the official status page.",
    failed: "We cannot read the Rodalies notices right now. Check the official service status.",
    stale: "The data we received is more than 15 minutes old, so we do not show it as current. Check the official service status.",
    official: "Official service status on rodalies.gencat.cat",
    publishedToday: "Posted today at {time}",
    publishedYesterday: "Posted yesterday at {time}",
    publishedOn: "Posted on {date} at {time}",
    alsoLines: "Lines: {lines}",
    allLines: "All lines",
    noLine: "No line given",
    stations: "Stations: {list}",
    refresh: "Reload",
    languageNote: "Rodalies publishes its notices in Catalan and Spanish; they are shown here in Spanish, as published.",
    attribution: {
      rodalies: "Notice text as published by Rodalies de Catalunya.",
      renfe: "Data origin: Renfe Operadora (open data, CC BY 4.0).",
    },
  };
}
