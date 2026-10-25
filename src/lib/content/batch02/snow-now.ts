import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import { SNOW } from "./pyrenees";
import {
  b2Related,
  b2link,
  faq,
  h2,
  h3,
  lead,
  list,
  paras,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * "Is there snow in the Catalan Pyrenees today?" — the live snow-depth page.
 *
 * The figure is not written here: the `snowDepth` block reads Meteocat's
 * validated readings at render time (see `snow/depth.ts`) and computes the
 * one-line answer from them. This file is the guidance around it: what a
 * station's depth means, why a resort's snow report is a different number,
 * and where the avalanche bulletin is.
 *
 * Checked on 25 Oct 2026:
 * - XEMA open data (`nzvn-apee`): variable 38 "Gruix de neu a terra" (cm,
 *   half-hourly, "SH"), times in UT, `codi_estat` blank/T/V; twenty stations
 *   reporting it. Station names, comarques and altitudes from `yqwd-vj5e`.
 * - Meteocat's station pages (`/observacions/xema/dades?codi=…`) show the
 *   day's automatic readings before validation (Núria read 10-14 cm on the
 *   page while the validated readings were 0).
 * - ICGC's avalanche bulletin page (ca/es/en), notice dated 26 May 2026: the
 *   daily service resumes on 1 December 2026, or earlier if snow conditions
 *   require it. bpa.icgc.cat: "vàlida fora pistes d'esquí i zones no
 *   controlades", "Amb la col·laboració del Servei Meteorològic de
 *   Catalunya", five danger levels.
 * - PIRINEU365 Infoneu: "Consulta l'estat de la neu a totes les estacions
 *   d'FGC" (six resorts). Baqueira's "Estado de la estación" page: espesor,
 *   nieve nueva, pistas abiertas, remontes.
 * - La Molina's technical sheet: "Neu produïda: 43 km (60% de l'àrea
 *   esquiable)", "Canons de neu: 602".
 * - Servei Català de Trànsit, "Estat del trànsit": incidents filterable by
 *   "meteorologia i ports". 112 Catalunya, "Cobertura del 112": most areas with
 *   no mobile coverage are high mountain or remote rural; CAT112 marks points
 *   with coverage on hiking routes there.
 *
 * Left out, unverified: resort opening dates for 2026-27, any snowfall
 * forecast, and avalanche advice beyond pointing at the bulletin.
 *
 * The hero is the snow guide's archive photograph of La Molina, with that
 * guide's own alt text and caption (which say it does not show today's
 * conditions): the media row is shared, so different wording here would
 * overwrite the snow guide's.
 */

const VERIFIED = "2026-10-25";

const SOURCES: B2Source[] = [
  { name: "Dades meteorològiques de la XEMA (gruix de neu a terra)", url: "https://analisi.transparenciacatalunya.cat/d/nzvn-apee", publisher: "Servei Meteorològic de Catalunya (Meteocat)" },
  { name: "Metadades estacions meteorològiques automàtiques", url: "https://analisi.transparenciacatalunya.cat/d/yqwd-vj5e", publisher: "Servei Meteorològic de Catalunya (Meteocat)" },
  { name: "Metadades variables meteorològiques", url: "https://analisi.transparenciacatalunya.cat/d/4fb2-n3yi", publisher: "Servei Meteorològic de Catalunya (Meteocat)" },
  { name: "Dades d'estacions meteorològiques automàtiques de Catalunya", url: "https://www.meteo.cat/observacions/xema", publisher: "Servei Meteorològic de Catalunya (Meteocat)" },
  { name: "Butlletí de Perill d'Allaus (BPA)", url: "https://www.icgc.cat/ca/Ambits-tematics/Riscos-i-emergencies/Allaus/Butlleti-de-Perill-dAllaus-BPA", publisher: "Institut Cartogràfic i Geològic de Catalunya" },
  { name: "Informació nivològica", url: "https://bpa.icgc.cat/", publisher: "Institut Cartogràfic i Geològic de Catalunya" },
  { name: "Infoneu PIRINEU365", url: "https://pirineu365.cat/infoneu-pirineu365/", publisher: "FGC (PIRINEU365)" },
  { name: "Baqueira Beret — estado de la estación", url: "https://www.baqueira.es/es/estado-de-la-estacion", publisher: "Baqueira Beret" },
  { name: "La Molina — plànol de pistes i fitxa tècnica", url: "https://pirineu365.cat/lamolina/estacio/planol-pistes-fitxa-tecnica/", publisher: "FGC (PIRINEU365)" },
  { name: "Estat del trànsit", url: "https://transit.gencat.cat/ca/informacio-viaria/estat-transit/", publisher: "Servei Català de Trànsit" },
  { name: "Cobertura del 112", url: "https://112.gencat.cat/ca/us-del-112/cobertura-del-112/index.html", publisher: "112 Catalunya" },
];

const INFONEU = "https://pirineu365.cat/infoneu-pirineu365/";
const TRANSIT = "https://transit.gencat.cat/ca/informacio-viaria/estat-transit/";

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/neu-pirineu-avui",
    title: "Hi ha neu al Pirineu avui? Gruix de neu per estacions",
    seoTitle: "Hi ha neu al Pirineu? Gruix de neu avui (Meteocat)",
    seoDescription:
      "Gruix de neu a terra ara mateix a les estacions del Meteocat al Pirineu català: centímetres per estació, hora de la lectura i on mirar el perill d'allaus.",
    excerpt:
      "La neu que hi ha a terra a les estacions de muntanya del Meteocat, llegida cada dia de les dades obertes, amb l'hora de cada lectura.",
  },
  es: {
    path: "guias/nieve-pirineo-hoy",
    title: "¿Hay nieve en el Pirineo catalán hoy? Espesor por estación",
    seoTitle: "¿Hay nieve en el Pirineo catalán hoy? Datos de Meteocat",
    seoDescription:
      "Espesor de nieve en el suelo ahora mismo en las estaciones de Meteocat del Pirineo catalán: centímetros por estación, hora de lectura y riesgo de aludes.",
    excerpt:
      "La nieve que hay en el suelo en las estaciones de montaña de Meteocat, leída cada día de los datos abiertos, con la hora de cada lectura.",
  },
  en: {
    path: "guides/snow-pyrenees-today",
    title: "Is there snow in the Catalan Pyrenees today?",
    seoTitle: "Is there snow in the Pyrenees? Catalonia snow depth now",
    seoDescription:
      "Snow depth right now at Meteocat's mountain weather stations in the Catalan Pyrenees: centimetres per station, reading time and where to check avalanches.",
    excerpt:
      "How much snow is on the ground at Meteocat's mountain weather stations, read daily from open data, with the time of every reading.",
  },
};

const RELATED = ["snow", "ski", "nuria", "cerdanya", "ripolles"] as const;

function body(locale: Locale): Block[] {
  const live: Block = { type: "snowDepth" } as Block;

  if (locale === "ca") {
    return [
      lead(
        "Si hi ha neu al Pirineu **avui** ho diu el resum de sota: el gruix de neu a terra que mesura el Meteocat a les seves estacions meteorològiques de muntanya, de la Val d'Aran al Ripollès, llegit de les dades obertes de la Generalitat. Cada fila porta l'hora de la seva lectura.",
      ),
      live,
      ...h2(
        "Què vol dir el gruix de neu d'una estació",
        "És la neu que hi ha a terra al punt on és l'estació, en centímetres, mesurada automàticament cada mitja hora. No és una previsió ni el part d'una estació d'esquí: és el que hi havia a terra a l'hora de la lectura.",
        "L'altitud ho canvia tot. En una mateixa vall hi pot haver neu a 2.200 metres i gens a 1.000; per això la taula agrupa les estacions per zones i, dins de cada zona, les ordena de la més alta a la més baixa.",
        "Només hi surten lectures que el Meteocat ja ha validat. Les dades obertes marquen cada lectura com a validada o no, i les que encara no ho estan poden indicar uns quants centímetres on no hi ha neu. Les validades arriben més tard, amb un dia o més de retard: per això cada estació porta l'hora de la seva lectura i, si no en té cap de validada de les últimes 48 hores, surt sense xifra.",
      ),
      ...h2(
        "Per què no coincideix amb el part de les estacions d'esquí",
        "Les estacions d'esquí publiquen el seu propi part de neu: el gruix a les pistes, les pistes obertes i els remuntadors en marxa. Les pistes es trepitgen i moltes es cobreixen amb neu produïda: la Molina, per exemple, indica a la seva fitxa tècnica 43 km de pistes amb neu produïda (el 60 % de l'àrea esquiable) i 602 canons. Una estació meteorològica, en canvi, mesura la neu natural en un sol punt, sovint lluny de les pistes.",
        `Si vas a esquiar, el part que compta és el de l'estació: les sis d'FGC (la Molina, Vall de Núria, Vallter, Espot, Port Ainé i Boí Taüll) el publiquen a [Infoneu de PIRINEU365](${INFONEU}), i Baqueira Beret a la pàgina [«Estado de la estación»](https://www.baqueira.es/ca/estado-de-la-estacion) del seu web. Per a la resta, i per comparar preus i accessos, mira ${b2link("ski", "ca", "les estacions d'esquí de Catalunya")}.`,
      ),
      ...h2(
        "On mirar el perill d'allaus",
        "El gruix de neu no diu res de l'estabilitat del mantell. Per a això hi ha el [Butlletí de Perill d'Allaus](https://www.icgc.cat/ca/Ambits-tematics/Riscos-i-emergencies/Allaus/Butlleti-de-Perill-dAllaus-BPA) de l'Institut Cartogràfic i Geològic de Catalunya (ICGC), que es fa amb la col·laboració del Meteocat i val per a fora de pistes i zones no controlades. Fa servir una escala de cinc graus de perill.",
        "Fora de temporada no es publica. Segons l'avís de l'ICGC del 26 de maig de 2026, el servei es reprendrà cada dia a partir de l'1 de desembre de 2026, o abans si les condicions d'innivació ho requereixen.",
      ),
      ...h3("Abans de sortir"),
      list(
        `les carreteres: el Servei Català de Trànsit publica les incidències, incloses les de meteorologia i ports de muntanya, a la seva pàgina [Estat del trànsit](${TRANSIT});`,
        "en cas d'emergència, el 112. Segons el [112 de Catalunya](https://112.gencat.cat/ca/us-del-112/cobertura-del-112/index.html), la major part de les zones sense cap cobertura mòbil són d'alta muntanya o rurals remotes, i a les rutes de senderisme que hi passen senyalitza punts on sí que n'hi ha.",
      ),
      ...h2(
        "Neu sense esquiar, Núria i la Cerdanya",
        `Per veure la neu sense esquiar, mira ${b2link("snow", "ca", "on veure neu a Catalunya sense esquiar")}, amb rutes amb raquetes i trineus. Sense cotxe, mira ${b2link("nuria", "ca", "la Vall de Núria i el cremallera")} i ${b2link("cerdanya", "ca", "la Cerdanya sense cotxe")}.`,
      ),
      faq([
        {
          question: "Hi ha neu al Pirineu ara mateix?",
          answer:
            "Ho diu el resum de dalt de tot de la pàgina, calculat amb les lectures validades del Meteocat: a quantes estacions hi ha neu a terra, on n'hi ha més i de quina hora és la lectura. Si no n'hi ha enlloc, també ho diu.",
        },
        {
          question: "Quin gruix de neu hi ha a les pistes d'esquí?",
          answer:
            "El publica cada estació d'esquí al seu part de neu: les d'FGC a Infoneu, a pirineu365.cat, i Baqueira Beret a la pàgina «Estado de la estación» del seu web. És una xifra diferent de la d'aquesta taula, que mesura la neu natural a les estacions meteorològiques.",
        },
        {
          question: "Per què el web del Meteocat mostra un altre gruix?",
          answer:
            "La pàgina de cada estació al web del Meteocat mostra les lectures automàtiques a mesura que arriben, abans de validar-les. Aquí només surten les que el Meteocat ja ha validat, que arriben més tard.",
        },
        {
          question: "On es consulta el perill d'allaus al Pirineu?",
          answer:
            "Al Butlletí de Perill d'Allaus de l'ICGC, vàlid fora de pistes i zones no controlades. Segons l'ICGC, es tornarà a publicar cada dia a partir de l'1 de desembre de 2026, o abans si l'estat de la neu ho requereix.",
        },
        {
          question: "Cada quan s'actualitza aquesta pàgina?",
          answer:
            "Cada dia. Torna a llegir les dades obertes del Meteocat, i cada estació porta l'hora de la seva lectura; si una no té cap lectura validada de les últimes 48 hores, surt sense xifra.",
        },
      ]),
      ...paras(verifiedLine("ca", VERIFIED)),
      ...b2Related([...RELATED], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        "Si hay nieve en el Pirineo catalán **hoy** lo dice el resumen de abajo: el espesor de nieve en el suelo que mide Meteocat en sus estaciones meteorológicas de montaña, de la Val d'Aran al Ripollès, leído de los datos abiertos de la Generalitat. Cada fila lleva la hora de su lectura.",
      ),
      live,
      ...h2(
        "Qué significa el espesor de nieve de una estación",
        "Es la nieve que hay en el suelo en el punto donde está la estación, en centímetros, medida automáticamente cada media hora. No es una previsión ni el parte de una estación de esquí: es lo que había en el suelo a la hora de la lectura.",
        "La altitud lo cambia todo. En un mismo valle puede haber nieve a 2.200 metros y nada a 1.000; por eso la tabla agrupa las estaciones por zonas y, dentro de cada una, las ordena de la más alta a la más baja.",
        "Solo aparecen lecturas que Meteocat ya ha validado. Los datos abiertos marcan cada lectura como validada o no, y las que aún no lo están pueden indicar unos centímetros donde no hay nieve. Las validadas llegan más tarde, con un día o más de retraso: por eso cada estación lleva la hora de su lectura y, si no tiene ninguna validada de las últimas 48 horas, aparece sin cifra.",
      ),
      ...h2(
        "¿Por qué no coincide con el parte de nieve de las estaciones de esquí?",
        "Las estaciones de esquí publican su propio parte: el espesor en las pistas, las pistas abiertas y los remontes en marcha. Las pistas se pisan y muchas se cubren con nieve producida: La Molina, por ejemplo, indica en su ficha técnica 43 km de pistas con nieve producida (el 60 % del área esquiable) y 602 cañones. Una estación meteorológica, en cambio, mide la nieve natural en un solo punto, a menudo lejos de las pistas.",
        `Si vas a esquiar, el parte que cuenta es el de la estación: las seis de FGC (La Molina, Vall de Núria, Vallter, Espot, Port Ainé y Boí Taüll) lo publican en [Infoneu de PIRINEU365](${INFONEU}), y Baqueira Beret en la página [«Estado de la estación»](https://www.baqueira.es/es/estado-de-la-estacion) de su web. Para las demás, y para comparar precios y accesos, mira ${b2link("ski", "es", "las estaciones de esquí de Cataluña")}.`,
      ),
      ...h2(
        "Dónde consultar el riesgo de aludes",
        "El espesor de nieve no dice nada de la estabilidad del manto. Para eso está el [Boletín de Peligro de Aludes](https://www.icgc.cat/es/Ambitos-tematicos/Riesgos-y-emergencias/Aludes/Boletin-de-Peligro-de-Aludes-BPA) del Institut Cartogràfic i Geològic de Catalunya (ICGC), que se elabora con la colaboración de Meteocat y es válido fuera de pistas y en zonas no controladas. Usa una escala de cinco grados de peligro.",
        "Fuera de temporada no se publica. Según el aviso del ICGC del 26 de mayo de 2026, el servicio se reanudará a diario a partir del 1 de diciembre de 2026, o antes si las condiciones de innivación lo requieren.",
      ),
      ...h3("Antes de salir"),
      list(
        `las carreteras: el Servei Català de Trànsit publica las incidencias, también las de meteorología y puertos de montaña, en su página [Estat del trànsit](${TRANSIT});`,
        "en caso de emergencia, el 112. Según el [112 de Cataluña](https://112.gencat.cat/es/us-del-112/cobertura-del-112/index.html), la mayoría de las zonas sin ninguna cobertura móvil son de alta montaña o rurales remotas, y en las rutas de senderismo que las atraviesan señaliza puntos donde sí la hay.",
      ),
      ...h2(
        "Nieve sin esquiar, Núria y la Cerdanya",
        `Para ver la nieve sin esquiar, mira ${b2link("snow", "es", "dónde ver nieve en Cataluña sin esquiar")}, con rutas con raquetas y trineos. Sin coche, mira ${b2link("nuria", "es", "la Vall de Núria y el cremallera")} y ${b2link("cerdanya", "es", "la Cerdanya sin coche")}.`,
      ),
      faq([
        {
          question: "¿Hay nieve en el Pirineo ahora mismo?",
          answer:
            "Lo dice el resumen de arriba del todo, calculado con las lecturas validadas de Meteocat: en cuántas estaciones hay nieve en el suelo, dónde hay más y de qué hora es la lectura. Si no hay en ninguna, también lo dice.",
        },
        {
          question: "¿Cuánta nieve hay en las pistas de esquí?",
          answer:
            "La publica cada estación de esquí en su parte de nieve: las de FGC en Infoneu, en pirineu365.cat, y Baqueira Beret en la página «Estado de la estación» de su web. Es una cifra distinta de la de esta tabla, que mide la nieve natural en las estaciones meteorológicas.",
        },
        {
          question: "¿Por qué la web de Meteocat da otro espesor?",
          answer:
            "La página de cada estación en la web de Meteocat muestra las lecturas automáticas a medida que llegan, antes de validarlas. Aquí solo aparecen las que Meteocat ya ha validado, que llegan más tarde.",
        },
        {
          question: "¿Dónde se consulta el riesgo de aludes en el Pirineo catalán?",
          answer:
            "En el Boletín de Peligro de Aludes del ICGC, válido fuera de pistas y en zonas no controladas. Según el ICGC, volverá a publicarse a diario a partir del 1 de diciembre de 2026, o antes si el estado de la nieve lo requiere.",
        },
        {
          question: "¿Cada cuánto se actualiza esta página?",
          answer:
            "Cada día. Vuelve a leer los datos abiertos de Meteocat, y cada estación lleva la hora de su lectura; si una no tiene ninguna lectura validada de las últimas 48 horas, aparece sin cifra.",
        },
      ]),
      ...paras(verifiedLine("es", VERIFIED)),
      ...b2Related([...RELATED], "es"),
    ];
  }

  return [
    lead(
      "Whether there is snow in the Catalan Pyrenees **today** is in the summary below: the depth of snow on the ground that Meteocat, Catalonia's weather service, measures at its mountain weather stations from the Val d'Aran to the Ripollès, read from the Generalitat's open data. Every row shows when its reading was taken.",
    ),
    live,
    ...h2(
      "What the snow depth figure means",
      "It is the snow lying on the ground where the weather station stands, in centimetres, measured automatically every half hour. It is not a forecast and not a ski resort's report: it is what was on the ground at the time of the reading.",
      "Altitude changes everything. The same valley can have snow at 2,200 metres and none at 1,000, so the table groups the stations by area and lists each area from the highest station down.",
      "Only readings Meteocat has validated are shown. The open data flags every reading as validated or not, and those not yet checked can show a few centimetres where there is no snow. Validated readings come in later, a day or more behind: that is why each station shows the time of its reading, and a station with no validated reading from the last 48 hours appears without a figure.",
    ),
    ...h2(
      "Why it differs from the ski resorts' snow report",
      "Ski resorts publish their own snow report: depth on the pistes, open runs and lifts running. Pistes are groomed and many are covered with machine-made snow: La Molina, for example, lists 43 km of runs with snowmaking (60% of its skiable area) and 602 snow cannons on its technical sheet. A weather station measures natural snow at a single point, often far from any piste.",
      `If you are going skiing, the resort's report is the one that counts: FGC's six resorts (La Molina, Vall de Núria, Vallter, Espot, Port Ainé and Boí Taüll) post theirs on [PIRINEU365 Infoneu](${INFONEU}), and Baqueira Beret on the ['Estado de la estación' page](https://www.baqueira.es/en/estado-de-la-estacion) of its website. For the others, and to compare prices and access, see ${b2link("ski", "en", "our guide to Catalonia's ski resorts")}.`,
    ),
    ...h2(
      "Avalanche danger: where to check",
      "Snow depth says nothing about how stable the snowpack is. That is what the [Avalanche Danger Bulletin](https://www.icgc.cat/en/Thematic-areas/Risks-and-emergencies/Avalanches/Avalanche-Danger-Bulletin-BPA) of the Cartographic and Geological Institute of Catalonia (ICGC) is for. It is produced with Meteocat's collaboration, applies off-piste and in uncontrolled areas, and uses a five-level danger scale.",
      "It is not published out of season. According to the ICGC's notice of 26 May 2026, the daily service resumes on 1 December 2026, or earlier if snow conditions require it.",
    ),
    ...h3("Before you set off"),
    list(
      `roads: the Servei Català de Trànsit lists incidents, including weather and mountain passes, on its [traffic status page](${TRANSIT});`,
      "emergencies: call 112. Catalonia's [112 service](https://112.gencat.cat/ca/us-del-112/cobertura-del-112/index.html) says most areas with no mobile coverage at all are high mountain or remote rural areas, and it marks points that do have coverage on the hiking routes through them.",
    ),
    ...h2(
      "Snow without skiing, Núria and Cerdanya",
      `To see snow without skiing, see ${b2link("snow", "en", "where to see snow in Catalonia without skiing")}, with snowshoe routes and sledging. Without a car, see ${b2link("nuria", "en", "Vall de Núria by rack railway")} and ${b2link("cerdanya", "en", "Cerdanya without a car")}.`,
    ),
    faq([
      {
        question: "Is there snow in the Pyrenees right now?",
        answer:
          "The summary at the top of the page says so, worked out from Meteocat's validated readings: how many stations have snow on the ground, where it is deepest and when the reading was taken. If there is none anywhere, it says that too.",
      },
      {
        question: "How much snow is there on the ski slopes?",
        answer:
          "Each ski resort publishes it in its own snow report: the FGC resorts on Infoneu, at pirineu365.cat, and Baqueira Beret on the 'Estado de la estación' page of its website. It is a different figure from this table, which measures natural snow at weather stations.",
      },
      {
        question: "Why does Meteocat's website show a different depth?",
        answer:
          "Each station's page on Meteocat's website shows the automatic readings as they arrive, before they are validated. This page shows only the readings Meteocat has already validated, which come in later.",
      },
      {
        question: "Where can I check avalanche danger in the Catalan Pyrenees?",
        answer:
          "In the ICGC's Avalanche Danger Bulletin, which applies off-piste and in uncontrolled areas. According to the ICGC, it will be published daily again from 1 December 2026, or earlier if snow conditions require it.",
      },
      {
        question: "How often is this page updated?",
        answer:
          "Every day. It re-reads Meteocat's open data, and every station shows the time of its reading; a station with no validated reading from the last 48 hours is listed without a figure.",
      },
    ]),
    ...paras(verifiedLine("en", VERIFIED)),
    ...b2Related([...RELATED], "en"),
  ];
}

export const SNOW_NOW: B2Article = {
  key: "snowNow",
  entryKey: "guide-snow-depth-pyrenees-today",
  categoryKey: "mountain",
  sources: SOURCES,
  heroKey: SNOW.secondaryKey,
  heroAlt: SNOW.secondaryAlt,
  heroCaption: SNOW.secondaryCaption,
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-25T13:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};
