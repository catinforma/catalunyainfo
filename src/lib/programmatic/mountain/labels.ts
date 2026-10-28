import type { Locale } from "@/lib/i18n/config";

/**
 * Words of the live block. They live in the browser bundle, not in the page
 * props: the server HTML then contains only `fallback`, which never states a
 * temperature, a wind or a snow depth (those are the browser's, from data it
 * has just read).
 */

export interface LiveLabels {
  /** Server HTML and no-JS text: "{link}" is the Meteocat link. Never states conditions. */
  fallback: string;
  fallbackLink: string;
  loading: string;
  failed: string;
  refresh: string;
  temperature: string;
  /** "{h}": mast height in metres. */
  wind: string;
  snow: string;
  /** "{ms}", "{kmh}". */
  windSpeed: string;
  /** "{dir}". */
  windDirection: string;
  /** "{ms}", "{kmh}". */
  gust: string;
  /** "{n}" with its sign. */
  snowChange: string;
  /** "{time}", "{h}". */
  readAt: string;
  readAtNow: string;
  /** No recent validated reading for this variable. */
  missing: string;
  /** No recent validated reading at all for the station. */
  empty: string;
  stationLink: string;
  source: string;
  forecastTitle: string;
  forecastLink: string;
  headers: { station: string; temperature: string; wind: string; snow: string };
  notMeasured: string;
  none: string;
}

export function liveLabels(locale: Locale): LiveLabels {
  if (locale === "ca") {
    return {
      fallback: "Les últimes lectures validades del Meteocat es carreguen aquí quan el navegador té JavaScript. Si no apareixen, consulta {link}.",
      fallbackLink: "les dades de l'estació al web del Meteocat",
      loading: "Carregant les lectures del Meteocat…",
      failed: "Ara mateix no podem llegir les dades del Meteocat. Consulta-les directament al web del Meteocat.",
      refresh: "Torna a carregar",
      temperature: "Temperatura",
      wind: "Vent (a {h} m)",
      snow: "Neu a terra",
      windSpeed: "{ms} m/s ({kmh} km/h)",
      windDirection: "direcció {dir}",
      gust: "ratxa màxima {ms} m/s ({kmh} km/h)",
      snowChange: "{n} cm en 24 h",
      readAt: "lectura validada de {time}, fa {h} h",
      readAtNow: "lectura validada de {time}",
      missing: "sense lectura validada de les últimes 48 hores",
      empty: "El Meteocat no ha publicat cap lectura validada d'aquesta estació de les últimes 48 hores.",
      stationLink: "Lectures en temps real (sense validar) a la fitxa de l'estació, al web del Meteocat",
      source: "Font: Meteocat, estacions automàtiques (XEMA), dades obertes de la Generalitat. Només lectures validades; hora oficial de Catalunya.",
      forecastTitle: "Previsió oficial",
      forecastLink: "Previsió completa a AEMET",
      headers: { station: "Estació", temperature: "Temperatura", wind: "Vent", snow: "Neu a terra" },
      notMeasured: "no la mesura",
      none: "—",
    };
  }
  if (locale === "es") {
    return {
      fallback: "Las últimas lecturas validadas de Meteocat se cargan aquí cuando el navegador tiene JavaScript. Si no aparecen, consulta {link}.",
      fallbackLink: "los datos de la estación en la web de Meteocat",
      loading: "Cargando las lecturas de Meteocat…",
      failed: "Ahora mismo no podemos leer los datos de Meteocat. Consúltalos directamente en la web de Meteocat.",
      refresh: "Volver a cargar",
      temperature: "Temperatura",
      wind: "Viento (a {h} m)",
      snow: "Nieve en el suelo",
      windSpeed: "{ms} m/s ({kmh} km/h)",
      windDirection: "dirección {dir}",
      gust: "racha máxima {ms} m/s ({kmh} km/h)",
      snowChange: "{n} cm en 24 h",
      readAt: "lectura validada del {time}, hace {h} h",
      readAtNow: "lectura validada del {time}",
      missing: "sin lectura validada de las últimas 48 horas",
      empty: "Meteocat no ha publicado ninguna lectura validada de esta estación de las últimas 48 horas.",
      stationLink: "Lecturas en tiempo real (sin validar) en la ficha de la estación, en la web de Meteocat",
      source: "Fuente: Meteocat, estaciones automáticas (XEMA), datos abiertos de la Generalitat. Solo lecturas validadas; hora oficial de Cataluña.",
      forecastTitle: "Previsión oficial",
      forecastLink: "Previsión completa en AEMET",
      headers: { station: "Estación", temperature: "Temperatura", wind: "Viento", snow: "Nieve en el suelo" },
      notMeasured: "no la mide",
      none: "—",
    };
  }
  return {
    fallback: "Meteocat's latest validated readings load here when your browser runs JavaScript. If they do not appear, see {link}.",
    fallbackLink: "the station data on Meteocat's website",
    loading: "Loading Meteocat's readings…",
    failed: "We cannot read Meteocat's data right now. Check it directly on Meteocat's website.",
    refresh: "Reload",
    temperature: "Temperature",
    wind: "Wind (at {h} m)",
    snow: "Snow on the ground",
    windSpeed: "{ms} m/s ({kmh} km/h)",
    windDirection: "from {dir}",
    gust: "max gust {ms} m/s ({kmh} km/h)",
    snowChange: "{n} cm in 24 h",
    readAt: "validated reading from {time}, {h} h ago",
    readAtNow: "validated reading from {time}",
    missing: "no validated reading from the last 48 hours",
    empty: "Meteocat has not published a validated reading from this station in the last 48 hours.",
    stationLink: "Live (unvalidated) readings on the station's page on Meteocat's website",
    source: "Source: Meteocat automatic weather stations (XEMA), Generalitat de Catalunya open data. Validated readings only; Catalan local time.",
    forecastTitle: "Official forecast",
    forecastLink: "Full forecast on AEMET",
    headers: { station: "Station", temperature: "Temperature", wind: "Wind", snow: "Snow on the ground" },
    notMeasured: "not measured",
    none: "—",
  };
}
