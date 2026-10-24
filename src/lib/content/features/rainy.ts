import { b2link } from "@/lib/content/batch02/shared";
import type { Block } from "@/lib/content/blocks";
import {
  ARTICLE_PATHS,
  callout,
  h2,
  lead,
  link,
  list,
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

/**
 * The Barcelona section: fully covered plans in the city, each with a figure
 * checked on 24 Oct 2026 against the venue's own site (Aquàrium prices and
 * calendar, Sagrada Família prices and schedules, Casa Batlló tickets, Palau
 * de la Música guided tour, barcelona.cat's free Sunday museums, FC Barcelona
 * timetable, the markets institute). The same figures are in the linked
 * guides, which carry the detail. CosmoCaixa is left out: its site refused
 * every fetch, so nothing about it could be checked.
 */
const AQUARIUM = "https://www.aquariumbcn.com/en/visit/prices/";
const SAGRADA = "https://sagradafamilia.org/en/prices";
const BATLLO = "https://www.casabatllo.es/en/online-tickets/";
const PALAU = "https://www.palaumusica.cat/1649781";
const FREE_SUNDAYS =
  "https://www.barcelona.cat/infobarcelona/ca/tema/cultura-i-lleure/diumenges-de-museu-sense-passar-per-taquilla_1620590.html";

const BCN_COPY: Record<"ca" | "es" | "en", { title: string; intro: string; items: string[]; outdoor: string }> = {
  en: {
    title: "What to do in Barcelona when it rains",
    intro: "In the city itself, these plans stay fully under cover. Prices and hours were checked on each venue's own site on 24 October 2026:",
    items: [
      `**L'Aquàrium** (Port Vell): €30, ages 5 to 10 €23, under-3s free; open every day 10:00–20:00 until 1 November, then, from 2 November to 20 December, 10:00–19:00 on weekdays and 10:00–20:00 at weekends. More in ${b2link("zooAquarium", "en", "our Zoo and Aquarium guide")}.`,
      `**Sagrada Família**: €26 with the audio-guide app, timed tickets in the visitor's name; from November to February it opens Monday to Saturday 9:00–18:00 and Sunday 10:30–18:00 (${b2link("monuments", "en", "Gaudí ticket guide")}).`,
      "**Casa Batlló**: from €29 depending on the date; the general visit admits every day from 9:00 to 19:45.",
      "**Palau de la Música Catalana**: guided tour €24 (under 10s free with an adult), about 50 minutes, between 9:00 and 15:30; €2 more at the box office.",
      `**Museums free on Sunday afternoons**: about a dozen venues, among them the Museu Marítim, the Museu d'Història de Barcelona, the Museu del Disseny and the Museu Blau, are free every Sunday from 15:00 (${b2link("museums", "en", "free museums guide")}).`,
      `**Camp Nou museum**: the Barça Immersive Tour costs from €28 and opens 10:00–18:00 from 19 October to 19 March (${b2link("campnou", "en", "Camp Nou guide")}).`,
      `**Covered markets**: La Boqueria and Sant Antoni open Monday to Saturday 8:00–20:30 and close on Sundays (${b2link("markets", "en", "market hours")}).`,
    ],
    outdoor: "Park Güell, the Montjuïc gardens and the beaches are open-air: leave them for a dry day.",
  },
  es: {
    title: "Qué hacer en Barcelona cuando llueve",
    intro: "En la propia ciudad, estos planes quedan del todo bajo techo. Precios y horarios comprobados en la web de cada lugar el 24 de octubre de 2026:",
    items: [
      `**L'Aquàrium** (Port Vell): 30 €, de 5 a 10 años 23 €, menores de 3 gratis; abre todos los días de 10:00 a 20:00 hasta el 1 de noviembre, y del 2 de noviembre al 20 de diciembre, de 10:00 a 19:00 entre semana y de 10:00 a 20:00 los fines de semana. Más en ${b2link("zooAquarium", "es", "nuestra guía del Zoo y el Aquarium")}.`,
      `**Sagrada Familia**: 26 € con la audioguía en app, entradas con hora y nominativas; de noviembre a febrero abre de lunes a sábado de 9:00 a 18:00 y el domingo de 10:30 a 18:00 (${b2link("monuments", "es", "guía de entradas de Gaudí")}).`,
      "**Casa Batlló**: desde 29 € según la fecha; la visita general admite todos los días de 9:00 a 19:45.",
      "**Palau de la Música Catalana**: visita guiada 24 € (menores de 10 gratis con un adulto), unos 50 minutos, entre las 9:00 y las 15:30; 2 € más en taquilla.",
      `**Museos gratis el domingo por la tarde**: una docena de equipamientos, entre ellos el Museu Marítim, el Museu d'Història de Barcelona, el Museu del Disseny y el Museu Blau, son gratis todos los domingos a partir de las 15:00 (${b2link("museums", "es", "guía de museos gratis")}).`,
      `**Museo del Camp Nou**: el Barça Immersive Tour cuesta desde 28 € y abre de 10:00 a 18:00 del 19 de octubre al 19 de marzo (${b2link("campnou", "es", "guía del Camp Nou")}).`,
      `**Mercados cubiertos**: la Boqueria y Sant Antoni abren de lunes a sábado de 8:00 a 20:30 y cierran los domingos (${b2link("markets", "es", "horario de los mercados")}).`,
    ],
    outdoor: "El Park Güell, los jardines de Montjuïc y las playas son al aire libre: déjalos para un día seco.",
  },
  ca: {
    title: "Què fer a Barcelona quan plou",
    intro: "A la mateixa ciutat, aquests plans queden del tot sota cobert. Preus i horaris comprovats al web de cada lloc el 24 d'octubre de 2026:",
    items: [
      `**L'Aquàrium** (Port Vell): 30 €, de 5 a 10 anys 23 €, menors de 3 gratis; obre cada dia de 10:00 a 20:00 fins a l'1 de novembre, i del 2 de novembre al 20 de desembre, de 10:00 a 19:00 entre setmana i de 10:00 a 20:00 els caps de setmana. Més a ${b2link("zooAquarium", "ca", "la nostra guia del Zoo i l'Aquàrium")}.`,
      `**Sagrada Família**: 26 € amb l'audioguia en app, entrades amb hora i nominatives; de novembre a febrer obre de dilluns a dissabte de 9:00 a 18:00 i el diumenge de 10:30 a 18:00 (${b2link("monuments", "ca", "guia d'entrades de Gaudí")}).`,
      "**Casa Batlló**: des de 29 € segons la data; la visita general admet cada dia de 9:00 a 19:45.",
      "**Palau de la Música Catalana**: visita guiada 24 € (menors de 10 gratis amb un adult), uns 50 minuts, entre les 9:00 i les 15:30; 2 € més a taquilla.",
      `**Museus gratis el diumenge a la tarda**: una dotzena d'equipaments, entre ells el Museu Marítim, el Museu d'Història de Barcelona, el Museu del Disseny i el Museu Blau, són gratis cada diumenge a partir de les 15:00 (${b2link("museums", "ca", "guia de museus gratis")}).`,
      `**Museu del Camp Nou**: el Barça Immersive Tour costa des de 28 € i obre de 10:00 a 18:00 del 19 d'octubre al 19 de març (${b2link("campnou", "ca", "guia del Camp Nou")}).`,
      `**Mercats coberts**: la Boqueria i Sant Antoni obren de dilluns a dissabte de 8:00 a 20:30 i tanquen els diumenges (${b2link("markets", "ca", "horari dels mercats")}).`,
    ],
    outdoor: "El Park Güell, els jardins de Montjuïc i les platges són a l'aire lliure: deixa'ls per a un dia sec.",
  },
};

function barcelona(locale: "ca" | "es" | "en"): Block[] {
  const t = BCN_COPY[locale];
  return [...h2(t.title, t.intro), list(...t.items), ...paras(t.outdoor)];
}

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
      "**Si plou a Barcelona, tria plans del tot coberts:** l'Aquàrium, la Sagrada Família, la Casa Batlló, el Palau de la Música, els mercats coberts i els museus, una dotzena dels quals són gratis el diumenge a la tarda (preus i horaris, a sota). Fora de la ciutat, alguns dels millors museus, monestirs, mines, cellers i espais patrimonials de Catalunya funcionen especialment bé quan el temps elimina l'opció de platja o senderisme.",
    ),
    ...barcelona("ca"),
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
      "**Si llueve en Barcelona, elige planes del todo cubiertos:** el Aquarium, la Sagrada Familia, la Casa Batlló, el Palau de la Música, los mercados cubiertos y los museos, una docena de los cuales son gratis el domingo por la tarde (precios y horarios, abajo). Fuera de la ciudad, algunos de los mejores museos, monasterios, minas, bodegas y espacios patrimoniales de Cataluña funcionan especialmente bien cuando el tiempo elimina la playa o el senderismo.",
    ),
    ...barcelona("es"),
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
      "**On a rainy day in Barcelona, pick plans that are fully indoors:** the Aquarium, the Sagrada Família, Casa Batlló, the Palau de la Música, the covered markets and the museums, a dozen of which are free on Sunday afternoons (prices and hours below). Beyond the city, some of Catalonia's best museums, monasteries, mines, wineries and heritage sites work particularly well precisely when the weather rules out the beach or the mountains.",
    ),
    ...barcelona("en"),
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
    { name: "L'Aquàrium de Barcelona — prices", url: AQUARIUM, publisher: "L'Aquàrium de Barcelona" },
    { name: "Sagrada Família — prices", url: SAGRADA, publisher: "Junta Constructora del Temple de la Sagrada Família" },
    { name: "Casa Batlló — tickets", url: BATLLO, publisher: "Casa Batlló" },
    { name: "Palau de la Música Catalana — guided tour", url: PALAU, publisher: "Palau de la Música Catalana" },
    { name: "Diumenges de museu sense passar per taquilla", url: FREE_SUNDAYS, publisher: "Ajuntament de Barcelona" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.rainy.ca,
      title: "Plou a Barcelona o a Catalunya? Què fer sota cobert",
      seoTitle: "Què fer a Barcelona i Catalunya quan plou: 20 plans",
      seoDescription:
        "Plou a Barcelona? Aquàrium, Sagrada Família, Casa Batlló i museus gratis el diumenge, i 20 plans per a dies de pluja a Catalunya, amb preus comprovats.",
      excerpt:
        "Museus, mines, monestirs, cellers i termalisme: vint plans per a un dia de pluja, amb quina part de cada visita queda sota cobert.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.rainy.es,
      title: "¿Llueve en Barcelona o en Cataluña? Qué hacer bajo techo",
      seoTitle: "Qué hacer en Barcelona y Cataluña cuando llueve: 20 planes",
      seoDescription:
        "¿Llueve en Barcelona? Aquarium, Sagrada Familia, Casa Batlló y museos gratis el domingo, y 20 planes de lluvia en Cataluña, con precios comprobados.",
      excerpt:
        "Museos, minas, monasterios, bodegas y termalismo: veinte planes de lluvia, con qué parte de cada visita queda bajo techo.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.rainy.en,
      title: "Rainy day in Barcelona or Catalonia? What to do indoors",
      seoTitle: "Things to do in Barcelona and Catalonia on a rainy day",
      seoDescription:
        "Rainy day in Barcelona? The Aquarium, Sagrada Família, Casa Batlló and free Sunday museums, plus 20 wet-weather plans across Catalonia, prices checked.",
      excerpt:
        "Museums, mines, monasteries, wineries and thermal towns: twenty wet-weather plans, each marked for how much is genuinely indoors.",
      blocks: en(),
    },
  },
};
