import type { StateServiceTr } from "../strike-11n-cities-model";

/**
 * Trains and flights (STATE_SERVICES in strike-11n-cities-data.ts), in Catalan
 * and English (10 Nov 2026): the same links and figures as the Spanish.
 */
const RENFE_9N = "https://grupo.renfe.com/es/es/sala-de-prensa/noticias/2026/11/establecidos-los-servicios-minimos-para-la-huelga-general-convocada-el-11n";
const AIR_ORDER = "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf";
const MINISTRY_RAIL = "https://www.transportes.gob.es/transporte-terrestre/resoluciones-de-servicios-minimos-ferroviarios";
const MINISTRY_AIR = "https://www.transportes.gob.es/aviacion-civil/informacion-util-al-pasajero/huelga-servicios-minimos";

export const ca: Record<"rail" | "air", StateServiceTr> = {
  rail: {
    text: `Renfe: Cercanías, el 75% del servei habitual en hora punta (de 6.00 a 9.00, de 13.30 a 15.30 i de 18.30 a 20.30 h) i el 50% la resta del dia; Mitjana Distància, una mitjana del 65%; Alta Velocitat i Llarga Distància, el 73%, segons els serveis mínims que ha fixat el Ministeri de Transports ([comunicat de Renfe del 9 de novembre](${RENFE_9N})).`,
    pending: `Els fixa el Ministeri de Transports per resolució, que publica a la seva [llista de resolucions de serveis mínims ferroviaris](${MINISTRY_RAIL}); després, Renfe publica els trens que circulen.`,
    setBy: "Ministeri de Transports",
  },
  air: {
    text: `Un percentatge dels vols comercials programats a cada aeroport, per a cada ruta i companyia, segons el tipus de ruta, i el 100% dels vols d'emergència i d'Estat, segons la [resolució del Ministeri de Transports signada el 6 de novembre](${AIR_ORDER}).`,
    pending: `Els fixa el Ministeri de Transports per resolució, que publica a la seva [pàgina de serveis mínims del transport aeri](${MINISTRY_AIR}).`,
    setBy: "Ministeri de Transports",
  },
};

export const en: Record<"rail" | "air", StateServiceTr> = {
  rail: {
    text: `Renfe: Cercanías, 75% of the usual service at peak times (6.00 to 9.00, 13.30 to 15.30 and 18.30 to 20.30) and 50% the rest of the day; Media Distancia (regional trains), an average of 65%; high-speed and long-distance trains (Alta Velocidad and Larga Distancia), 73%, under the minimum services set by the Ministry of Transport ([Renfe's statement of 9 November](${RENFE_9N})).`,
    pending: `The Ministry of Transport sets them by resolution and publishes it in its [list of rail minimum-services resolutions](${MINISTRY_RAIL}); Renfe then publishes the trains that will run.`,
    setBy: "Ministry of Transport",
  },
  air: {
    text: `A percentage of the scheduled commercial flights at each airport, for each route and airline, depending on the type of route, and 100% of emergency and State flights, under the [Ministry of Transport resolution signed on 6 November](${AIR_ORDER}).`,
    pending: `The Ministry of Transport sets them by resolution and publishes it on its [air transport minimum-services page](${MINISTRY_AIR}).`,
    setBy: "Ministry of Transport",
  },
};
