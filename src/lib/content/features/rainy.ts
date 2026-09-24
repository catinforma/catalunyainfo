import type { Block } from "@/lib/content/blocks";
import {
  ARTICLE_PATHS,
  callout,
  h2,
  lead,
  link,
  paras,
  relatedBlocks,
  table,
  type FeatureArticle,
} from "./shared";

/**
 * Article 10 — twenty things to do in the rain.
 *
 * The useful distinction is not "museum or not" but how much of the visit is
 * actually under cover, so every entry is labelled indoor / mostly indoor /
 * mixed. A monastery with a famous cloister is not a wet-weather plan in the
 * same sense a museum is.
 *
 * Caves carry an explicit warning rather than a recommendation: they are the
 * one category on this list where going in bad weather can be the wrong call,
 * and visits are suspended after heavy rain.
 */

const PATRIMONI = "https://patrimoni.gencat.cat/";
const METEOCAT = "https://www.meteo.cat/";
const RODALIES = "https://rodalies.gencat.cat/ca/horaris/tots-els-horaris/";

const CAVE_WARNING = {
  ca: "Les coves són l'excepció d'aquesta llista. No hi vagis si hi ha avisos per pluges intenses: les visites se suspenen i l'accés pot ser perillós. Comprova l'estat a la web de la cova i el avisos de Meteocat el mateix dia.",
  es: "Las cuevas son la excepción de esta lista. No vayas si hay avisos por lluvias intensas: las visitas se suspenden y el acceso puede ser peligroso. Comprueba el estado en la web de la cueva y los avisos de Meteocat el mismo día.",
  en: "Caves are the exception on this list. Do not go when heavy-rain warnings are in force: visits are suspended and access can be dangerous. Check the site's own page and the Meteocat warnings on the day.",
};

function rows(locale: "ca" | "es" | "en"): string[][] {
  const IN = { ca: "Interior", es: "Interior", en: "Indoor" }[locale];
  const MOSTLY = { ca: "Majoritàriament interior", es: "Mayoritariamente interior", en: "Mostly indoor" }[locale];
  const MIXED = { ca: "Mixt", es: "Mixto", en: "Mixed" }[locale];
  const YES = { ca: "Sí", es: "Sí", en: "Yes" }[locale];
  const REC = { ca: "Recomanada", es: "Recomendada", en: "Advised" }[locale];
  const NO = { ca: "No cal", es: "No hace falta", en: "Not needed" }[locale];

  const kind = {
    museum: { ca: "Museu", es: "Museo", en: "Museum" }[locale],
    heritage: { ca: "Patrimoni", es: "Patrimonio", en: "Heritage" }[locale],
    cave: { ca: "Cova o mina", es: "Cueva o mina", en: "Cave or mine" }[locale],
    winery: { ca: "Celler", es: "Bodega", en: "Winery" }[locale],
    thermal: { ca: "Termalisme", es: "Termalismo", en: "Thermal" }[locale],
  };

  return [
    ["MNACTEC", "Terrassa", kind.museum, IN, NO],
    ["Teatre-Museu Dalí", "Figueres", kind.museum, IN, REC],
    ["Museu d'Art Medieval", "Vic", kind.museum, IN, NO],
    ["Museu del Cinema", "Girona", kind.museum, IN, NO],
    ["VINSEUM", "Vilafranca del Penedès", kind.museum, IN, NO],
    ["Gaudí Centre", "Reus", kind.museum, IN, NO],
    ["Casa Navàs", "Reus", kind.heritage, IN, REC],
    ["Muntanya de Sal", "Cardona", kind.cave, MOSTLY, REC],
    ["Coves de l'Espluga de Francolí", "L'Espluga de Francolí", kind.cave, MOSTLY, REC],
    ["Coves Meravelles", "Benifallet", kind.cave, MOSTLY, REC],
    ["Monestir de Poblet", "Vimbodí i Poblet", kind.heritage, MIXED, NO],
    ["Monestir de Santes Creus", "Aiguamúrcia", kind.heritage, MIXED, NO],
    ["Museu de Lleida", "Lleida", kind.museum, IN, NO],
    ["Museu Nacional Arqueològic", "Tarragona", kind.museum, IN, NO],
    ["Espai Cràter", "Olot", kind.museum, IN, NO],
    ["Nau Gaudí", "Mataró", kind.heritage, IN, NO],
    ["Palau de la Música Catalana", "Barcelona", kind.heritage, IN, YES],
    ["Recinte Modernista de Sant Pau", "Barcelona", kind.heritage, MIXED, REC],
    ["Celler del Penedès", "Penedès", kind.winery, MOSTLY, YES],
    ["Patrimoni termal", "Caldes de Montbui / La Garriga", kind.thermal, MIXED, REC],
  ];
}

function ca(): Block[] {
  return [
    lead(
      "Un dia de pluja no obliga a quedar-se a l'hotel. De fet, alguns dels millors museus, monestirs, mines, cellers i espais patrimonials de Catalunya funcionen especialment bé quan el temps elimina l'opció de platja o senderisme.",
    ),
    ...paras(
      "La distinció útil no és «museu o no», sinó quanta part de la visita queda realment sota cobert. Un monestir amb un claustre magnífic no és un pla de pluja en el mateix sentit que ho és un museu. A la taula ho indiquem plan per pla.",
    ),
    table(
      "Els 20 plans",
      ["Pla", "Municipi", "Tipus", "Interior?", "Reserva?"],
      rows("ca"),
      "«Mixt» vol dir que hi ha trams a l'aire lliure. Els horaris i les condicions canvien: comprova-ho al web oficial de cada espai el mateix dia.",
    ),
    ...h2(
      "Els museus que aguanten un dia sencer",
      "El **MNACTEC** de Terrassa ocupa una fàbrica modernista i explica la industrialització catalana amb la màquina davant. És dels pocs museus on l'edifici i el contingut expliquen el mateix.",
      "El **Teatre-Museu Dalí** de Figueres és una experiència completa i no necessita bon temps. Reserva amb antelació.",
      "El **Museu del Cinema** de Girona, el **Museu d'Art Medieval** de Vic, el **Museu de Lleida** i el **Museu Nacional Arqueològic de Tarragona** cobreixen quatre capítols molt diferents de la història del país, i tots quatre es fan còmodament en mitja jornada.",
      "L'**Espai Cràter** d'Olot explica el vulcanisme de la Garrotxa, que és exactament el que no pots caminar quan plou.",
    ),
    ...h2(
      "Modernisme sota cobert",
      "El **Palau de la Música Catalana** només es visita amb entrada i horari, i és una de les experiències arquitectòniques més intenses de Barcelona.",
      "El **Recinte Modernista de Sant Pau** té pavellons visitables, tot i que els desplaçaments entre ells són a l'aire lliure: compta-ho si plou fort.",
      `A Reus, la **Casa Navàs** de Domènech i Montaner és un interior modernista conservat de manera excepcional, i el **Gaudí Centre** explica l'arquitecte a la seva ciutat natal. A Mataró, la **Nau Gaudí** combina arquitectura primerenca i art contemporani: ${link("gaudi", "ca", "en parlem a la guia del Gaudí menys conegut")}.`,
    ),
    ...h2(
      "Sota terra: mines i coves",
      "La **Muntanya de Sal de Cardona** és el pla de pluja més espectacular del país: una mina de sal sota un castell medieval.",
      "Les **Coves de l'Espluga de Francolí** i les **Coves Meravelles de Benifallet** completen l'opció subterrània.",
    ),
    callout("warning", "Compte amb les coves", CAVE_WARNING.ca),
    ...h2(
      "Monestirs: espectaculars, però no del tot coberts",
      "**Poblet** i **Santes Creus** són dos dels grans monestirs cistercencs de Catalunya i es visiten perfectament amb mal temps, però tenen trams i claustres oberts.",
      "Són plans de pluja fina, no de temporal.",
    ),
    ...h2(
      "Beure i escalfar-se",
      "Una visita a un **celler del Penedès** és un pla de pluja gairebé perfecte: interior, amb reserva i amb alguna cosa calenta al final.",
      `Si hi vas, ${link("trains", "ca", "arribar-hi en tren")} estalvia el problema evident.`,
      "El **patrimoni termal** de Caldes de Montbui i la Garriga és l'altra opció: aigua calenta i arquitectura, en municipis on el termalisme és la identitat local.",
    ),
    ...h2(
      "Com decidir el mateix matí",
      "Mira l'avís de Meteocat abans de triar. Si hi ha alerta per pluges intenses, descarta coves i desplaçaments llargs i queda't amb museus urbans.",
      `Avisos i previsió: [meteo.cat](${METEOCAT}). Horaris de tren: [rodalies.gencat.cat](${RODALIES}).`,
      `I si la pluja marxa, ${link("autumn", "ca", "els colors de tardor")} i ${link("mushrooms", "ca", "les condicions per als bolets")} milloren justament després.`,
    ),
    ...paras(`Fitxes oficials de bona part d'aquests espais: [patrimoni.gencat.cat](${PATRIMONI}).`),
    ...relatedBlocks(["gaudi", "surprising", "montserrat", "trains", "medieval"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "Un día de lluvia no obliga a quedarse en el hotel. De hecho, algunos de los mejores museos, monasterios, minas, bodegas y espacios patrimoniales de Cataluña funcionan especialmente bien cuando el tiempo elimina la playa o el senderismo.",
    ),
    ...paras(
      "La distinción útil no es «museo o no», sino cuánta parte de la visita queda realmente bajo techo. Un monasterio con un claustro magnífico no es un plan de lluvia en el mismo sentido que un museo. Lo indicamos plan por plan.",
    ),
    table(
      "Los 20 planes",
      ["Plan", "Municipio", "Tipo", "¿Interior?", "¿Reserva?"],
      rows("es"),
      "«Mixto» significa que hay tramos al aire libre. Horarios y condiciones cambian: compruébalo en la web oficial el mismo día.",
    ),
    ...h2(
      "Los museos que aguantan un día entero",
      "El **MNACTEC** de Terrassa ocupa una fábrica modernista y explica la industrialización catalana con la máquina delante.",
      "El **Teatre-Museu Dalí** de Figueres es una experiencia completa y no necesita buen tiempo. Reserva con antelación.",
      "El **Museu del Cinema** de Girona, el **Museu d'Art Medieval** de Vic, el **Museu de Lleida** y el **Museu Nacional Arqueològic de Tarragona** cubren cuatro capítulos muy distintos de la historia del país.",
      "El **Espai Cràter** de Olot explica el vulcanismo de la Garrotxa, que es justamente lo que no puedes caminar cuando llueve.",
    ),
    ...h2(
      "Modernismo bajo techo",
      "El **Palau de la Música Catalana** se visita con entrada y horario, y es una de las experiencias arquitectónicas más intensas de Barcelona.",
      "El **Recinte Modernista de Sant Pau** tiene pabellones visitables, aunque los desplazamientos entre ellos son al aire libre.",
      `En Reus, la **Casa Navàs** es un interior modernista excepcionalmente conservado, y el **Gaudí Centre** explica al arquitecto en su ciudad natal. En Mataró, la **Nau Gaudí**: ${link("gaudi", "es", "hablamos de ella en la guía del Gaudí menos conocido")}.`,
    ),
    ...h2(
      "Bajo tierra: minas y cuevas",
      "La **Montaña de Sal de Cardona** es el plan de lluvia más espectacular del país: una mina de sal bajo un castillo medieval.",
      "Las **Coves de l'Espluga de Francolí** y las **Coves Meravelles de Benifallet** completan la opción subterránea.",
    ),
    callout("warning", "Cuidado con las cuevas", CAVE_WARNING.es),
    ...h2(
      "Monasterios: espectaculares, pero no del todo cubiertos",
      "**Poblet** y **Santes Creus** se visitan perfectamente con mal tiempo, pero tienen tramos y claustros abiertos. Son planes de lluvia fina, no de temporal.",
    ),
    ...h2(
      "Beber y entrar en calor",
      "Una visita a una **bodega del Penedès** es un plan de lluvia casi perfecto: interior, con reserva y con algo caliente al final.",
      `Si vas, ${link("trains", "es", "llegar en tren")} ahorra el problema evidente.`,
      "El **patrimonio termal** de Caldes de Montbui y La Garriga es la otra opción: agua caliente y arquitectura.",
    ),
    ...h2(
      "Cómo decidir esa misma mañana",
      "Mira el aviso de Meteocat antes de elegir. Si hay alerta por lluvias intensas, descarta cuevas y desplazamientos largos y quédate con museos urbanos.",
      `Avisos y previsión: [meteo.cat](${METEOCAT}). Horarios de tren: [rodalies.gencat.cat](${RODALIES}).`,
      `Y si la lluvia se va, ${link("autumn", "es", "los colores de otoño")} y ${link("mushrooms", "es", "las condiciones para las setas")} mejoran justo después.`,
    ),
    ...relatedBlocks(["gaudi", "surprising", "montserrat", "trains", "medieval"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "A wet day does not mean staying in the hotel. Some of Catalonia's best museums, monasteries, mines, wineries and heritage sites work particularly well precisely when the weather rules out the beach or the mountains.",
    ),
    ...paras(
      "The useful distinction is not museum or not, but how much of the visit is genuinely under cover. A monastery with a magnificent cloister is not a rainy-day plan in the same way a museum is, so every entry below says which.",
    ),
    ...paras(
      "A practical note on distances: Terrassa, Mataró, Vilafranca and the Penedès wineries are comfortable day trips from Barcelona. Lleida, Tarragona, Figueres, Reus, Olot and Cardona make more sense if you are already travelling in that part of the country.",
    ),
    table(
      "The 20 plans",
      ["Plan", "Town", "Type", "Indoor?", "Booking?"],
      rows("en"),
      "'Mixed' means part of the visit is outdoors. Hours and conditions change: check each site's official page on the day.",
    ),
    ...h2(
      "Museums that hold a whole day",
      "**MNACTEC** in Terrassa occupies a modernist factory and explains Catalan industrialisation with the machinery in front of you. Rare in that the building and the content say the same thing.",
      "The **Dalí Theatre-Museum** in Figueres is a complete experience and needs no good weather at all. Book ahead.",
      "Girona's **Cinema Museum**, Vic's **Museum of Medieval Art**, the **Museu de Lleida** and Tarragona's **National Archaeological Museum** cover four very different chapters of the country's history, each comfortable in half a day.",
      "**Espai Cràter** in Olot explains the volcanism of the Garrotxa — which is exactly what you cannot go walking through in the rain.",
    ),
    ...h2(
      "Modernisme under cover",
      "The **Palau de la Música Catalana** is visited by timed ticket and is one of the most intense architectural experiences in Barcelona.",
      "The **Sant Pau modernist complex** has pavilions you can go inside, though moving between them is open-air — factor that in if it is really coming down.",
      `In Reus, **Casa Navàs** is an exceptionally preserved modernist interior and the **Gaudí Centre** explains the architect in his home city. In Mataró, the **Nau Gaudí** — ${link("gaudi", "en", "covered in our lesser-known Gaudí guide")}.`,
    ),
    ...h2(
      "Underground: mines and caves",
      "**Cardona's Salt Mountain** is the most spectacular wet-weather plan in the country: a salt mine beneath a medieval castle.",
      "The **Espluga de Francolí caves** and the **Benifallet caves** complete the underground option.",
    ),
    callout("warning", "A caution about caves", CAVE_WARNING.en),
    ...h2(
      "Monasteries: magnificent, not fully covered",
      "**Poblet** and **Santes Creus** visit perfectly well in poor weather, but include open cloisters and outdoor stretches. These are drizzle plans, not storm plans.",
    ),
    ...h2(
      "Drinking and warming up",
      "A **Penedès winery** visit is close to the perfect rainy-day plan: indoors, booked in advance, and something warming at the end.",
      `If you go, ${link("trains", "en", "arriving by train")} solves the obvious problem.`,
      "The **thermal heritage** of Caldes de Montbui and La Garriga is the other option: hot water and architecture, in towns whose identity is built on it.",
    ),
    ...h2(
      "Deciding on the morning",
      "Check the Meteocat warning before choosing. If heavy-rain alerts are in force, rule out caves and long journeys and stay with urban museums.",
      `Warnings and forecast: [meteo.cat](${METEOCAT}). Train times: [rodalies.gencat.cat](${RODALIES}).`,
      `And when the rain clears, ${link("autumn", "en", "autumn colour")} and ${link("mushrooms", "en", "mushroom conditions")} both improve straight afterwards.`,
    ),
    ...paras(`Official records for many of these sites: [patrimoni.gencat.cat](${PATRIMONI}).`),
    ...relatedBlocks(["gaudi", "surprising", "montserrat", "trains", "medieval"], "en"),
  ];
}

export const RAINY: FeatureArticle = {
  key: "rainy",
  entryKey: "feature-rainy-day",
  categoryKey: "culture",
  heroKey: "rainy-hero",
  secondaryKey: "rainy-second",
  heroAlt: {
    ca: "Interior del Palau de la Musica Catalana, a Barcelona",
    es: "Interior del Palau de la Musica Catalana, en Barcelona",
    en: "Inside the Palau de la Musica Catalana, Barcelona",
  },
  heroCaption: {
    ca: "La sala de concerts del Palau de la Musica Catalana.",
    es: "La sala de conciertos del Palau de la Musica Catalana.",
    en: "The concert hall of the Palau de la Musica Catalana.",
  },
  secondaryAlt: {
    ca: "El MNACTEC, a l'antic Vapor Aymerich, Amat i Jover de Terrassa",
    es: "El MNACTEC, en el antiguo Vapor Aymerich, Amat i Jover de Terrassa",
    en: "MNACTEC, in the former Aymerich, Amat i Jover mill in Terrassa",
  },
  secondaryCaption: {
    ca: "El MNACTEC ocupa una fabrica textil modernista a Terrassa.",
    es: "El MNACTEC ocupa una fabrica textil modernista en Terrassa.",
    en: "MNACTEC occupies a modernist textile mill in Terrassa.",
  },
  sources: [
    { name: "Patrimoni Cultural de Catalunya", url: PATRIMONI, publisher: "Generalitat de Catalunya" },
    { name: "Servei Meteorològic de Catalunya", url: METEOCAT, publisher: "Meteocat" },
    { name: "Horaris de Rodalies de Catalunya", url: RODALIES, publisher: "Generalitat de Catalunya" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.rainy.ca,
      title: "Plou a Catalunya? 20 plans que són encara millors quan fa mal temps",
      seoTitle: "20 plans per fer a Catalunya quan plou",
      seoDescription:
        "Vint plans per a un dia de pluja a Catalunya, indicant quins són 100% interior, quins no, i quins necessiten reserva.",
      excerpt:
        "Museus, mines, monestirs, cellers i termalisme: vint plans per a un dia de pluja, amb quina part de cada visita queda sota cobert.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.rainy.es,
      title: "¿Llueve en Cataluña? 20 planes que son aún mejores con mal tiempo",
      seoTitle: "20 planes para hacer en Cataluña cuando llueve",
      seoDescription:
        "Veinte planes para un día de lluvia en Cataluña, indicando cuáles son 100% interior, cuáles no y cuáles necesitan reserva.",
      excerpt:
        "Museos, minas, monasterios, bodegas y termalismo: veinte planes de lluvia, con qué parte de cada visita queda bajo techo.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.rainy.en,
      title: "Rain in Catalonia? 20 great things to do when the weather turns bad",
      seoTitle: "20 things to do in Catalonia when it rains",
      seoDescription:
        "Twenty rainy-day plans in Catalonia, each marked for how much of the visit is actually indoors and whether booking is needed.",
      excerpt:
        "Museums, mines, monasteries, wineries and thermal towns: twenty wet-weather plans, each marked for how much is genuinely indoors.",
      blocks: en(),
    },
  },
};
