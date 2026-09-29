import type { Block } from "@/lib/content/blocks";
import { link } from "@/lib/content/features/shared";
import { SOURCES as TMB_SOURCES, VERIFIED_AT } from "@/lib/content/transport-cards/rates";

import {
  b2Related,
  b2link,
  callout,
  h2,
  keyFacts,
  lead,
  list,
  paras,
  steps,
  table,
  verifiedLine,
  type B2Article,
} from "./shared";

/**
 * The Barcelona Practical cluster: transport passes, the low-emission zone and
 * street parking.
 *
 * These three answer the questions a visitor asks in the order they hit them —
 * how do I get around, may I drive in, where do I leave the car — and they
 * cross-link to each other and to the tourist tax guide, because a reader who
 * has one of these questions usually has the next one too.
 *
 * Every figure here was checked against the operator's own page on 29
 * September 2026. Where the editorial package and the source disagreed, the
 * source won and the deviation is noted in the comment above the figure.
 */

/* ========================================================================== */
/* 01 — Transport passes                                                      */
/* ========================================================================== */

const PROFILE_HEADERS: Record<string, string[]> = {
  ca: ["Perfil", "Miraria primer"],
  es: ["Perfil", "Miraría primero"],
  en: ["Profile", "Look at first"],
};

export const TRANSPORT: B2Article = {
  key: "transport",
  entryKey: "guide-barcelona-transport-passes",
  categoryKey: "public-services",
  sources: TMB_SOURCES,
  heroKey: "b2-transport-metro-barcelona",
  heroAlt: {
    ca: "Andana de l'estació de metro d'Espanya, a la línia 3 de Barcelona",
    es: "Andén de la estación de metro de Espanya, en la línea 3 de Barcelona",
    en: "Platform at Espanya metro station on Barcelona's line 3",
  },
  heroCaption: {
    ca: "Els títols de transport valen per a metro, bus i tramvia; la diferència és quants viatges i quants dies.",
    es: "Los títulos valen para metro, bus y tranvía; la diferencia está en cuántos viajes y cuántos días.",
    en: "The passes cover metro, bus and tram; the difference is how many journeys and how many days.",
  },
  verifiedAt: VERIFIED_AT,
  publishedAt: "2026-09-29T11:00:00+02:00",
  editions: {
    ca: {
      path: "guies/targetes-transport-barcelona",
      title:
        "T-casual, T-dia, T-usual o Hola Barcelona: quina targeta de transport et convé?",
      seoTitle: "Targetes transport Barcelona 2026: T-casual o Hola BCN?",
      seoDescription:
        "Compara T-casual, T-dia, T-usual i Hola Barcelona segons els dies de viatge, els trajectes i si faràs servir el metro de l'aeroport.",
      excerpt:
        "La targeta pensada per a turistes no sempre és la més barata. Compara els títols segons els dies, els trajectes i l'aeroport.",
      blocks: [
        lead(
          "Barcelona té diverses targetes de transport i **la més turística no sempre és la més barata**. El 2026, una T-casual d'una zona costa 13 €, la T-dia 12 € i la T-usual 22,80 €. La Hola Barcelona ofereix viatges il·limitats durant períodes consecutius d'entre 24 i 120 hores.",
        ),
        ...paras("La diferència important és què necessites fer."),
        callout(
          "info",
          "Resposta ràpida",
          "Si faràs pocs trajectes, compara primer la T-casual. Si vols viatges il·limitats durant 24 hores, la T-dia és especialment interessant. Per a estades llargues, la T-usual pot tenir molt sentit. La Hola Barcelona prioritza la simplicitat i inclou el metro de l'aeroport.",
        ),
        { type: "transportPasses" } as Block,
        ...h2(
          "T-casual: 10 viatges",
          "La T-casual costa **13 € per una zona** i permet deu viatges.",
          "És un títol unipersonal, però no és vàlid per entrar o sortir per les estacions Aeroport T1 i Aeroport T2 de l'L9 Sud.",
          "Això no vol dir que «no serveixi per anar a l'aeroport» en qualsevol circumstància: la restricció concreta afecta les estacions del metro L9 Sud.",
          "És una opció lògica per a qui camina molt i utilitza poc el transport.",
        ),
        ...h2(
          "T-dia: 24 hores il·limitades",
          "La T-dia costa **12 € per una zona**.",
          "Permet viatges il·limitats durant 24 hores des de la primera validació i permet un trajecte d'anada i un de tornada a través de les estacions Aeroport T1 i T2 de l'L9 Sud.",
          "Per a un dia intens de visites pot resultar més interessant que comprar trajectes individualment.",
        ),
        ...h2(
          "T-usual: l'opció que molts visitants ignoren",
          "La T-usual costa **22,80 € per una zona** amb les tarifes vigents de 2026.",
          "Ofereix viatges il·limitats durant 30 dies consecutius, és personal i intransferible i és vàlida a les estacions Aeroport T1 i T2.",
          "Pot ser interessant per a estades llargues, però cal portar el document d'identificació corresponent.",
        ),
        ...h2(
          "Hola Barcelona",
          "Hola Barcelona ofereix viatges il·limitats durant 24, 48, 72, 96 o 120 hores consecutives.",
          "Inclou metro i bus de TMB, NitBus, FGC zona 1, tramvia, Rodalies zona 1 i el funicular de Montjuïc. També inclou l'anada i tornada en metro entre l'aeroport i Barcelona. El Telefèric de Montjuïc no hi està inclòs.",
          "És especialment útil per a qui prefereix no comptar trajectes.",
        ),
        // TMB publishes the coverage of this card but not its fare. Saying so
        // is more useful than repeating a reseller's price.
        callout(
          "warning",
          "Per què no en donem el preu",
          "TMB publica què inclou la Hola Barcelona, però no en publica la tarifa a la mateixa pàgina de tarifes. Els preus que circulen són de revenedors, així que no els reproduïm: consulta l'import a l'operador abans de comprar-la.",
        ),
        ...h2("Quina triaria segons el viatge?"),
        table(
          "Per on començar a mirar segons el tipus de viatge",
          PROFILE_HEADERS.ca ?? [],
          [
            ["Pocs trajectes", "T-casual"],
            ["1 dia molt intens", "T-dia"],
            ["Estada llarga", "T-usual"],
            ["Vols il·limitats i aeroport", "Hola Barcelona"],
          ],
          "Aquesta taula no és un rànquing: el resultat depèn dels trajectes, les zones i l'aeroport.",
        ),
        ...paras(
          `Si has vingut amb cotxe, mira també ${b2link("zbe", "ca", "què cal fer amb un vehicle estranger a la ZBE")} i ${b2link("parking", "ca", "com funcionen la zona blava i la verda")}.`,
        ),
        ...paras(verifiedLine("ca", VERIFIED_AT)),
        ...b2Related(["zbe", "parking", "girona", "montserratFree"], "ca"),
      ],
    },

    es: {
      path: "guias/tarjetas-transporte-barcelona",
      title:
        "T-casual, T-dia, T-usual o Hola Barcelona: qué tarjeta de transporte te conviene",
      seoTitle: "Tarjetas transporte Barcelona 2026: ¿T-casual u Hola BCN?",
      seoDescription:
        "Compara T-casual, T-dia, T-usual y Hola Barcelona según los días de viaje, los trayectos y si usarás el metro del aeropuerto.",
      excerpt:
        "La tarjeta dirigida a turistas no siempre es la más barata. Compara los títulos según días, trayectos y aeropuerto.",
      blocks: [
        lead(
          "Barcelona tiene varias opciones de transporte y la tarjeta dirigida a turistas **no siempre es automáticamente la más barata**.",
        ),
        ...paras(
          "En 2026, la T-casual de una zona cuesta 13 €, la T-dia 12 € y la T-usual 22,80 €. Hola Barcelona ofrece viajes ilimitados durante periodos consecutivos de 24 a 120 horas.",
        ),
        callout(
          "info",
          "Respuesta rápida",
          "T-casual para pocos desplazamientos; T-dia para un día de uso intensivo; T-usual para estancias largas; Hola Barcelona para quien valore especialmente los viajes ilimitados y el metro del aeropuerto.",
        ),
        { type: "transportPasses" } as Block,
        ...h2(
          "T-casual: diez viajes",
          "La **T-casual** cuesta 13 € en una zona e incluye diez viajes, pero no es válida en las estaciones Aeroport T1 y Aeroport T2 de L9 Sud.",
          "Es un título unipersonal: no se puede compartir entre varias personas.",
        ),
        ...h2(
          "T-dia: 24 horas ilimitadas",
          "La **T-dia** cuesta 12 € en una zona y permite viajes ilimitados durante 24 horas desde la primera validación.",
          "Incluye un viaje de ida y otro de vuelta a través del metro del aeropuerto.",
        ),
        ...h2(
          "T-usual: la opción que muchos visitantes ignoran",
          "La **T-usual** cuesta 22,80 € en una zona y permite viajes ilimitados durante 30 días consecutivos.",
          "Es personal e intransferible y sí es válida en T1 y T2. Hay que llevar el documento identificativo.",
        ),
        ...h2(
          "Hola Barcelona",
          "**Hola Barcelona** funciona durante 24, 48, 72, 96 o 120 horas e incluye metro, bus TMB, NitBus, FGC zona 1, tranvía y Rodalies zona 1, además del funicular de Montjuïc y el metro del aeropuerto. El Teleférico de Montjuïc no está incluido.",
        ),
        callout(
          "warning",
          "Por qué no damos su precio",
          "TMB publica qué incluye la Hola Barcelona, pero no su tarifa en la propia página de tarifas. Los precios que circulan son de revendedores, así que no los reproducimos: consulta el importe en el operador antes de comprarla.",
        ),
        ...h2("Qué miraría según el viaje"),
        table(
          "Por dónde empezar a mirar según el tipo de viaje",
          PROFILE_HEADERS.es ?? [],
          [
            ["Pocos desplazamientos", "T-casual"],
            ["1 día muy intenso", "T-dia"],
            ["Estancia larga", "T-usual"],
            ["Quieres ilimitados y aeropuerto", "Hola Barcelona"],
          ],
          "No existe una tarjeta óptima para todos: depende de los trayectos, las zonas y el aeropuerto.",
        ),
        ...paras(
          `Si has venido en coche, mira también ${b2link("zbe", "es", "qué hacer con un vehículo extranjero en la ZBE")} y ${b2link("parking", "es", "cómo funcionan la zona azul y la verde")}.`,
        ),
        ...paras(verifiedLine("es", VERIFIED_AT)),
        ...b2Related(["zbe", "parking", "girona", "montserratFree"], "es"),
      ],
    },

    en: {
      path: "guides/barcelona-transport-passes",
      title:
        "T-casual, T-dia, T-usual or Hola Barcelona: which transport pass should you buy?",
      seoTitle: "Barcelona transport passes 2026: T-casual or Hola BCN?",
      seoDescription:
        "Compare T-casual, T-dia, T-usual and Hola Barcelona by days, journeys and whether you need the airport metro. With a selector.",
      excerpt:
        "The obvious tourist card is not automatically the cheapest. Compare the passes by days, journeys and airport use.",
      blocks: [
        lead(
          "Barcelona's ticket system can be confusing because the obvious tourist product is **not automatically the cheapest option for every trip**.",
        ),
        ...paras(
          "In 2026, a one-zone T-casual costs €13, a T-dia €12 and a T-usual €22.80. Hola Barcelona provides unlimited transport for consecutive periods from 24 to 120 hours.",
        ),
        callout(
          "info",
          "Quick answer",
          "Look at T-casual for light public-transport use, T-dia for one intensive day, T-usual for longer stays, and Hola Barcelona if unlimited travel and airport metro access matter most.",
        ),
        { type: "transportPasses" } as Block,
        ...h2(
          "T-casual: ten journeys",
          "The **T-casual** gives you ten journeys for €13 in one zone, but it cannot be used through the L9 Sud airport metro gates at T1 or T2.",
          "It is a single-user ticket: it cannot be shared between travellers.",
        ),
        ...h2(
          "T-dia: 24 unlimited hours",
          "The **T-dia** costs €12 in one zone and gives unlimited travel for 24 hours from first validation.",
          "It includes one outbound and one return airport metro journey.",
        ),
        ...h2(
          "T-usual: the one most visitors overlook",
          "The **T-usual** costs €22.80 in one zone and gives unlimited travel for 30 consecutive days.",
          "It is personal and non-transferable, and it is valid through the T1 and T2 airport metro stations.",
        ),
        ...h2(
          "Hola Barcelona",
          "The **Hola Barcelona Travel Card** offers unlimited travel for 24, 48, 72, 96 or 120 hours and covers TMB metro and buses, NitBus, the Montjuïc funicular, FGC zone 1, the tram and Rodalies zone 1. Airport metro travel is included; the Montjuïc Cable Car is not.",
        ),
        callout(
          "warning",
          "Why we do not quote its price",
          "TMB publishes what the Hola Barcelona card covers but not its fare on the same fares page. The prices circulating elsewhere are resellers' own, so we do not repeat them: check the amount with the operator before buying.",
        ),
        ...h2("Where to start looking"),
        table(
          "A starting point, not a ranking",
          PROFILE_HEADERS.en ?? [],
          [
            ["Light public-transport use", "T-casual"],
            ["One intensive day", "T-dia"],
            ["Longer stay", "T-usual"],
            ["Unlimited travel plus airport", "Hola Barcelona"],
          ],
          "There is no single best pass: it depends on your journeys, your zones and the airport.",
        ),
        ...paras(
          `Driving in? See ${b2link("zbe", "en", "what foreign-registered cars must do first")} and ${b2link("parking", "en", "how the blue and green parking zones work")}.`,
        ),
        ...paras(verifiedLine("en", VERIFIED_AT)),
        ...b2Related(["zbe", "parking", "girona", "montserratFree"], "en"),
      ],
    },
  },
};

/* ========================================================================== */
/* 02 — Low-emission zone, foreign vehicles                                   */
/* ========================================================================== */

const ZBE_SOURCES = [
  {
    name: "Registre metropolità de vehicles estrangers i altres vehicles autoritzats a la ZBE",
    url: "https://zberegistre.ambmobilitat.cat/",
    publisher: "Àrea Metropolitana de Barcelona",
  },
  {
    name: "Preguntes freqüents del registre de la ZBE",
    url: "https://zberegistre.ambmobilitat.cat/ca/PreguntesFrequents",
    publisher: "Àrea Metropolitana de Barcelona",
  },
  {
    name: "Zones de baixes emissions — preguntes freqüents",
    url: "https://www.amb.cat/web/mobilitat/mobilitat-sostenible/zbe/zones-baixes-emissions/faqs",
    publisher: "Àrea Metropolitana de Barcelona",
  },
];

// The package said "up to 15 days". The AMB's own FAQ says 15 *working* days,
// which for a trip planned around a weekend is a materially different number.
const ZBE_VERIFIED = "2026-09-29";

export const ZBE: B2Article = {
  key: "zbe",
  entryKey: "guide-barcelona-lez-foreign-vehicles",
  categoryKey: "public-services",
  sources: ZBE_SOURCES,
  heroKey: "b2-zbe-gran-via-barcelona",
  heroAlt: {
    ca: "Trànsit a la Gran Via de les Corts Catalanes de Barcelona",
    es: "Tráfico en la Gran Via de les Corts Catalanes de Barcelona",
    en: "Traffic on Barcelona's Gran Via de les Corts Catalanes",
  },
  heroCaption: {
    ca: "La ZBE cobreix bona part de la metròpolis: entrar-hi amb matrícula estrangera requereix registre previ.",
    es: "La ZBE cubre buena parte de la metrópolis: entrar con matrícula extranjera requiere registro previo.",
    en: "The low-emission zone covers much of the metropolitan area; foreign plates need prior registration.",
  },
  verifiedAt: ZBE_VERIFIED,
  publishedAt: "2026-09-29T11:10:00+02:00",
  editions: {
    ca: {
      path: "guies/zbe-barcelona-vehicles-estrangers",
      title: "ZBE de Barcelona: què has de fer si vens amb un vehicle estranger",
      seoTitle: "ZBE Barcelona amb cotxe estranger: registre i terminis",
      seoDescription:
        "Els vehicles amb matrícula estrangera s'han de registrar abans de circular per la ZBE de Barcelona. Requisits, terminis i autoritzacions esporàdiques.",
      excerpt:
        "Amb matrícula estrangera cal registrar-se abans de circular per la ZBE. La comprovació ordinària pot trigar fins a 15 dies hàbils.",
      blocks: [
        lead(
          "Entrar a Barcelona amb matrícula estrangera requereix més preparació que simplement comprovar si el vehicle compleix una norma Euro.",
        ),
        ...paras(
          "**Tots els vehicles amb matrícula estrangera s'han d'inscriure al Registre metropolità per circular per les ZBE de la metròpolis de Barcelona.** La comprovació ordinària dels requisits ambientals pot trigar fins a **15 dies hàbils**.",
        ),
        callout(
          "warning",
          "Resposta ràpida",
          "Si vens amb cotxe matriculat fora d'Espanya, no donis per fet que la matrícula serà reconeguda automàticament. Comprova i tramita el registre abans del viatge.",
        ),
        keyFacts("Dades clau", [
          { label: "Registre previ", value: "Obligatori per a tota matrícula estrangera" },
          { label: "Termini de resolució", value: "Fins a 15 dies hàbils" },
          { label: "Gasolina (turismes)", value: "Euro 3 o superior" },
          { label: "Dièsel (turismes)", value: "Euro 4 o superior" },
          { label: "Autoritzacions esporàdiques", value: "Fins a 24 diàries l'any" },
          { label: "Última verificació", value: "29 de setembre de 2026" },
        ]),
        ...h2(
          "Quins requisits ambientals demanen",
          "Per a l'autorització ambiental de llarga durada, els turismes de gasolina han de complir almenys **Euro 3** (habitualment matriculats després del 2000) i els dièsel **Euro 4** (habitualment matriculats després del 2005), segons les categories descrites per l'AMB.",
          "Si el vehicle no compleix els requisits, o necessites accedir-hi urgentment, existeixen autoritzacions esporàdiques. L'AMB permet fins a **24 autoritzacions diàries anuals** en aquesta modalitat.",
        ),
        ...h2("Què necessitaràs?"),
        ...paras(
          "Per al registre de llarga durada s'ha d'aportar documentació oficial del vehicle on constin dades com:",
        ),
        list(
          "titular;",
          "matrícula;",
          "categoria d'homologació;",
          "tipus de combustible;",
          "nivell Euro.",
        ),
        ...paras(
          "Si la documentació no inclou prou informació ambiental, l'AMB pot requerir acreditació del fabricant.",
        ),
        steps("Passos abans del viatge", [
          {
            title: "Comprova la categoria del vehicle",
            text: "Mira al permís de circulació el nivell Euro i el combustible. Si no hi consten, demana l'acreditació al fabricant.",
          },
          {
            title: "Tramita el registre amb temps",
            text: "La resolució pot trigar fins a 15 dies hàbils, així que no ho deixis per a la setmana del viatge.",
          },
          {
            title: "Si no compleixes, mira l'autorització esporàdica",
            text: "Fins a 24 autoritzacions diàries l'any, subjectes a les condicions aplicables.",
          },
          {
            title: "Comprova per separat on aparcaràs",
            text: "Circular i aparcar són dues autoritzacions diferents.",
          },
        ]),
        ...h2(
          "El registre substitueix les normes d'aparcament?",
          "No.",
          "Tenir autorització per circular per la ZBE no dona dret a aparcar gratis ni converteix una zona verda de residents en una plaça disponible per a visitants.",
          `Com funciona l'aparcament al carrer ho expliquem a part: ${b2link("parking", "ca", "zona blava i zona verda de Barcelona")}.`,
        ),
        ...paras(verifiedLine("ca", ZBE_VERIFIED)),
        ...b2Related(["parking", "transport"], "ca"),
      ],
    },

    es: {
      path: "guias/zbe-barcelona-vehiculos-extranjeros",
      title: "ZBE de Barcelona: qué hacer si llegas con un coche extranjero",
      seoTitle: "ZBE Barcelona con coche extranjero: registro y plazos",
      seoDescription:
        "Los vehículos con matrícula extranjera deben registrarse antes de circular por la ZBE de Barcelona. Requisitos, plazos y accesos esporádicos.",
      excerpt:
        "Con matrícula extranjera hay que registrarse antes de circular por la ZBE. La comprobación ordinaria puede tardar hasta 15 días hábiles.",
      blocks: [
        lead(
          "Todos los vehículos con matrícula extranjera deben inscribirse en el Registro metropolitano antes de circular por las ZBE de la metrópolis de Barcelona.",
        ),
        ...paras("La comprobación ordinaria puede tardar hasta **15 días hábiles**."),
        callout(
          "warning",
          "Respuesta rápida",
          "No des por hecho que las cámaras reconocerán automáticamente tu matrícula extranjera. Tramita el registro antes del viaje.",
        ),
        keyFacts("Datos clave", [
          { label: "Registro previo", value: "Obligatorio para toda matrícula extranjera" },
          { label: "Plazo de resolución", value: "Hasta 15 días hábiles" },
          { label: "Gasolina (turismos)", value: "Euro 3 o superior" },
          { label: "Diésel (turismos)", value: "Euro 4 o superior" },
          { label: "Autorizaciones esporádicas", value: "Hasta 24 diarias al año" },
          { label: "Última verificación", value: "29 de septiembre de 2026" },
        ]),
        ...h2(
          "Requisitos ambientales",
          "Los turismos de gasolina deben cumplir al menos **Euro 3** y los diésel **Euro 4** para obtener la autorización ambiental de larga duración.",
          "Existe además una modalidad de acceso esporádico que permite solicitar hasta **24 días de circulación al año** cuando corresponda.",
        ),
        ...h2("Documentación"),
        ...paras("Hay que aportar documentación oficial del vehículo donde consten:"),
        list(
          "titular;",
          "matrícula;",
          "categoría de homologación;",
          "tipo de combustible;",
          "nivel Euro.",
        ),
        ...paras(
          "Si la documentación no incluye suficiente información ambiental, la AMB puede requerir acreditación del fabricante.",
        ),
        steps("Pasos antes del viaje", [
          {
            title: "Comprueba la categoría del vehículo",
            text: "Busca en el permiso de circulación el nivel Euro y el combustible.",
          },
          {
            title: "Tramita el registro con tiempo",
            text: "La resolución puede tardar hasta 15 días hábiles.",
          },
          {
            title: "Si no cumples, mira el acceso esporádico",
            text: "Hasta 24 autorizaciones diarias al año, sujetas a las condiciones aplicables.",
          },
          {
            title: "Comprueba aparte dónde aparcarás",
            text: "Circular y aparcar son dos cuestiones distintas.",
          },
        ]),
        ...h2(
          "Circular no es aparcar",
          "Tener autorización para circular por la ZBE no da derecho a aparcar gratis ni convierte una zona verde de residentes en una plaza disponible para visitantes.",
          `Cómo funciona el aparcamiento en la calle lo explicamos aparte: ${b2link("parking", "es", "zona azul y zona verde de Barcelona")}.`,
        ),
        ...paras(verifiedLine("es", ZBE_VERIFIED)),
        ...b2Related(["parking", "transport"], "es"),
      ],
    },

    en: {
      path: "guides/barcelona-low-emission-zone-foreign-cars",
      title:
        "Barcelona low-emission zone: what foreign drivers need to do before entering",
      seoTitle: "Barcelona low-emission zone: foreign car rules 2026",
      seoDescription:
        "Foreign-registered vehicles must be entered in Barcelona's metropolitan register before driving in the low-emission zone. Rules, timing and day permits.",
      excerpt:
        "Foreign plates must be registered before driving in Barcelona's low-emission zone. Verification can take up to 15 working days.",
      blocks: [
        lead(
          "If your car has a foreign registration plate, do not assume Barcelona's cameras will automatically recognise its environmental category.",
        ),
        ...paras(
          "**Foreign-registered vehicles must be entered in the metropolitan register before driving in Barcelona metropolitan low-emission zones.** Standard environmental verification can take up to **15 working days**.",
        ),
        callout(
          "warning",
          "Travelling next week?",
          "Check the registration before you drive into Barcelona. Fifteen working days is three weeks of calendar time.",
        ),
        keyFacts("Key facts", [
          { label: "Prior registration", value: "Required for every foreign plate" },
          { label: "Processing time", value: "Up to 15 working days" },
          { label: "Petrol cars", value: "Euro 3 or higher" },
          { label: "Diesel cars", value: "Euro 4 or higher" },
          { label: "Day authorisations", value: "Up to 24 per year" },
          { label: "Last verified", value: "29 September 2026" },
        ]),
        ...h2(
          "Environmental standards",
          "For passenger cars, the AMB lists petrol **Euro 3** or higher and diesel **Euro 4** or higher among the standards eligible for long-term authorisation.",
          "Vehicles using the occasional-access system can request up to **24 daily authorisations per year**, subject to the applicable conditions.",
        ),
        ...h2("What you will need"),
        ...paras("Official vehicle documents showing:"),
        list(
          "the registered keeper;",
          "the plate;",
          "the homologation category;",
          "the fuel type;",
          "the Euro level.",
        ),
        ...paras(
          "If your documents do not carry enough environmental information, the AMB may ask for manufacturer certification.",
        ),
        steps("Before you travel", [
          {
            title: "Check your vehicle's category",
            text: "Find the Euro level and fuel type on the registration document.",
          },
          {
            title: "Register early",
            text: "Verification can take up to 15 working days, so do not leave it to the week of the trip.",
          },
          {
            title: "If you do not qualify, look at day authorisations",
            text: "Up to 24 per year, subject to the applicable conditions.",
          },
          {
            title: "Check parking separately",
            text: "Driving in and parking are two different permissions.",
          },
        ]),
        ...h2(
          "Driving in is not parking",
          "Authorisation to drive in the low-emission zone does not give you free parking, and it does not turn a residents' green space into a visitor space.",
          `Street parking is a separate question: ${b2link("parking", "en", "Barcelona's blue and green zones")}.`,
        ),
        ...paras(verifiedLine("en", ZBE_VERIFIED)),
        ...b2Related(["parking", "transport"], "en"),
      ],
    },
  },
};

/* ========================================================================== */
/* 03 — Street parking                                                        */
/* ========================================================================== */

const PARKING_SOURCES = [
  {
    name: "AREA blava — tarifes ambientals d'estacionament regulat",
    url: "https://areaverda.cat/en/blue",
    publisher: "Barcelona de Serveis Municipals",
  },
  {
    name: "AREA verda — tarifes ambientals d'estacionament regulat",
    url: "https://areaverda.cat/en/green-area",
    publisher: "Barcelona de Serveis Municipals",
  },
];

const PARKING_VERIFIED = "2026-09-29";

/**
 * The full label-by-label table.
 *
 * The package gave only the endpoints — 1,25 € to 3,75 € for blue, 1,50 € to
 * 4,25 € for green — which is where every other guide stops. The middle rows
 * are the ones an actual driver needs, because almost nobody is driving a
 * zero-emission car or an unlabelled one: most hire cars are C.
 */
const BLUE_ROWS = [
  ["Zero", "1,25 €", "1,15 €"],
  ["ECO", "2,50 €", "2,25 €"],
  ["C", "3,25 €", "3,00 €"],
  ["B", "3,50 €", "3,25 €"],
  ["Sense distintiu", "3,75 €", "3,50 €"],
];

const GREEN_ROWS = [
  ["Zero", "1,50 €", "1,40 €"],
  ["ECO", "3,00 €", "2,75 €"],
  ["C", "3,75 €", "3,50 €"],
  ["B", "4,00 €", "3,75 €"],
  ["Sense distintiu", "4,25 €", "4,00 €"],
];

const LABEL_HEADERS: Record<string, string[]> = {
  ca: ["Distintiu ambiental", "Tarifa A (€/h)", "Tarifa B (€/h)"],
  es: ["Distintivo ambiental", "Tarifa A (€/h)", "Tarifa B (€/h)"],
  en: ["Environmental label", "Rate A (€/h)", "Rate B (€/h)"],
};

const GREEN_ROWS_EN = GREEN_ROWS.map(([label, a, b]) => [
  label === "Sense distintiu" ? "No label" : (label ?? ""),
  (a ?? "").replace(",", "."),
  (b ?? "").replace(",", "."),
]);
const BLUE_ROWS_EN = BLUE_ROWS.map(([label, a, b]) => [
  label === "Sense distintiu" ? "No label" : (label ?? ""),
  (a ?? "").replace(",", "."),
  (b ?? "").replace(",", "."),
]);
const GREEN_ROWS_ES = GREEN_ROWS.map(([label, a, b]) => [
  label === "Sense distintiu" ? "Sin distintivo" : (label ?? ""),
  a ?? "",
  b ?? "",
]);
const BLUE_ROWS_ES = BLUE_ROWS.map(([label, a, b]) => [
  label === "Sense distintiu" ? "Sin distintivo" : (label ?? ""),
  a ?? "",
  b ?? "",
]);

export const PARKING: B2Article = {
  key: "parking",
  entryKey: "guide-barcelona-street-parking",
  categoryKey: "public-services",
  sources: PARKING_SOURCES,
  heroKey: "b2-parking-carrer-barcelona",
  heroAlt: {
    ca: "Cotxes aparcats al llarg d'un carrer de l'Eixample de Barcelona",
    es: "Coches aparcados a lo largo de una calle del Eixample de Barcelona",
    en: "Cars parked along a street in Barcelona's Eixample",
  },
  heroCaption: {
    ca: "El preu de la plaça depèn de la zona i del distintiu ambiental del vehicle.",
    es: "El precio de la plaza depende de la zona y del distintivo ambiental del vehículo.",
    en: "What a space costs depends on the zone and on your car's environmental label.",
  },
  verifiedAt: PARKING_VERIFIED,
  publishedAt: "2026-09-29T11:20:00+02:00",
  editions: {
    ca: {
      path: "guies/aparcar-barcelona-zona-blava-verda",
      title:
        "Aparcar a Barcelona: zona blava, zona verda, preus i què ha de saber un visitant",
      seoTitle: "Aparcar a Barcelona 2026: preus zona blava i verda",
      seoDescription:
        "Preus per hora de la zona blava i la zona verda de Barcelona el 2026, segons el distintiu ambiental, i com pagar.",
      excerpt:
        "Els preus de l'aparcament regulat depenen de la zona i del distintiu ambiental del vehicle. Taula completa de 2026.",
      blocks: [
        lead("Aparcar al carrer a Barcelona no funciona amb una tarifa única."),
        ...paras(
          "La ciutat diferencia principalment places **AREA Blava** i **AREA Verda**, i els imports varien segons la zona i el distintiu ambiental del vehicle.",
          "La tarifa A s'aplica als barris de més demanda i la tarifa B a la resta de zones regulades.",
        ),
        callout(
          "warning",
          "La regla més important",
          "Mira sempre el senyal vertical de la plaça concreta. Els horaris i el temps màxim poden variar carrer per carrer.",
        ),
        ...h2(
          "Zona blava: rotació",
          "La zona blava està pensada per a rotació i habitualment limita l'estacionament a una o dues hores segons la senyalització.",
        ),
        table(
          "AREA Blava, preus per hora el 2026",
          LABEL_HEADERS.ca ?? [],
          BLUE_ROWS,
          "Font: AREA (B:SM). Verificat el 29 de setembre de 2026.",
        ),
        ...h2(
          "Zona verda: prioritat per als residents",
          "La zona verda prioritza els residents. Els no residents hi poden aparcar quan la senyalització ho permet, amb tarifes superiors.",
          "Els residents autoritzats tenen una tarifa pròpia molt inferior, de 0,20 € al dia amb un màxim d'1 € la setmana.",
        ),
        table(
          "AREA Verda per a no residents, preus per hora el 2026",
          LABEL_HEADERS.ca ?? [],
          GREEN_ROWS,
          "Font: AREA (B:SM). Verificat el 29 de setembre de 2026.",
        ),
        ...h2(
          "Com pagar?",
          "Es pot obtenir el tiquet al parquímetre o utilitzar aplicacions autoritzades. SMOU permet pagar digitalment les places verdes i blaves i cobrar només el temps real utilitzat.",
        ),
        ...h2(
          "I si vinc amb cotxe estranger?",
          "L'aparcament i la ZBE són sistemes diferents.",
          `Abans de circular per la zona de baixes emissions, comprova també ${b2link("zbe", "ca", "el registre del vehicle estranger")}.`,
        ),
        ...paras(
          `Si finalment deixes el cotxe, ${b2link("transport", "ca", "mira quina targeta de transport et convé")}.`,
        ),
        ...paras(verifiedLine("ca", PARKING_VERIFIED)),
        ...b2Related(["zbe", "transport"], "ca"),
      ],
    },

    es: {
      path: "guias/aparcar-barcelona-zona-azul-verde",
      title: "Aparcar en Barcelona: zona azul, zona verde, precios y reglas para visitantes",
      seoTitle: "Aparcar en Barcelona 2026: precios zona azul y verde",
      seoDescription:
        "Precios por hora de la zona azul y la zona verde de Barcelona en 2026 según el distintivo ambiental, y cómo pagar.",
      excerpt:
        "Las tarifas del aparcamiento regulado dependen de la zona y del distintivo ambiental. Tabla completa de 2026.",
      blocks: [
        lead("Barcelona diferencia principalmente AREA Azul y AREA Verde."),
        ...paras(
          "En ambas, las tarifas de 2026 dependen de la demanda de la zona y del distintivo ambiental del vehículo. La tarifa A se aplica a los barrios de más demanda y la B al resto de zonas reguladas.",
        ),
        callout(
          "warning",
          "La regla más importante",
          "La señal vertical de la plaza concreta siempre prevalece. Los horarios y el tiempo máximo varían calle por calle.",
        ),
        ...h2(
          "Zona azul: rotación",
          "El máximo habitual es de una o dos horas según el tramo.",
        ),
        table(
          "AREA Azul, precios por hora en 2026",
          LABEL_HEADERS.es ?? [],
          BLUE_ROWS_ES,
          "Fuente: AREA (B:SM). Verificado el 29 de septiembre de 2026.",
        ),
        ...h2(
          "Zona verde: prioridad para residentes",
          "La zona verde prioriza residentes y, para no residentes, las tarifas son superiores.",
          "Los residentes autorizados pagan 0,20 € al día con un máximo de 1 € a la semana.",
        ),
        table(
          "AREA Verde para no residentes, precios por hora en 2026",
          LABEL_HEADERS.es ?? [],
          GREEN_ROWS_ES,
          "Fuente: AREA (B:SM). Verificado el 29 de septiembre de 2026.",
        ),
        ...h2(
          "Cómo pagar",
          "SMOU permite pagar digitalmente y consultar zonas, horarios y tarifas, cobrando solo el tiempo realmente utilizado.",
        ),
        ...h2(
          "¿Y si vengo con coche extranjero?",
          "El aparcamiento y la ZBE son sistemas diferentes.",
          `Antes de circular por la zona de bajas emisiones, comprueba ${b2link("zbe", "es", "el registro del vehículo extranjero")}.`,
        ),
        ...paras(verifiedLine("es", PARKING_VERIFIED)),
        ...b2Related(["zbe", "transport"], "es"),
      ],
    },

    en: {
      path: "guides/parking-in-barcelona-blue-green-zones",
      title: "Parking in Barcelona: blue zones, green zones, prices and visitor rules",
      seoTitle: "Parking in Barcelona 2026: blue and green zone prices",
      seoDescription:
        "Hourly prices for Barcelona's blue and green regulated parking in 2026 by environmental label, plus how to pay and the time limits.",
      excerpt:
        "Regulated parking is priced by zone and by your car's environmental label. The full 2026 table.",
      blocks: [
        lead(
          "Street parking in Barcelona is regulated mainly through **Blue** and **Green** AREA spaces.",
        ),
        ...paras(
          "Prices depend on how busy the area is — Rate A for the highest-demand districts, Rate B elsewhere — and on your vehicle's environmental label.",
        ),
        callout(
          "warning",
          "The rule that matters most",
          "Always follow the vertical sign next to the space. Hours and maximum stay vary street by street.",
        ),
        ...h2("Blue spaces: short stays", "Parking is normally limited to one or two hours."),
        table(
          "AREA Blue, hourly prices in 2026",
          LABEL_HEADERS.en ?? [],
          BLUE_ROWS_EN,
          "Source: AREA (B:SM). Verified on 29 September 2026.",
        ),
        ...h2(
          "Green spaces: residents first",
          "Green spaces prioritise residents. Non-resident rates are higher.",
          "Authorised residents pay a flat €0.20 per day, capped at €1 per week.",
        ),
        table(
          "AREA Green for non-residents, hourly prices in 2026",
          LABEL_HEADERS.en ?? [],
          GREEN_ROWS_EN,
          "Source: AREA (B:SM). Verified on 29 September 2026.",
        ),
        ...h2(
          "How to pay",
          "Use the parking meter or an authorised app. SMOU lets you pay digitally and charges only for the time actually used.",
        ),
        ...h2(
          "Driving in with a foreign car?",
          "Parking and the low-emission zone are separate systems.",
          `Before driving into the zone, check ${b2link("zbe", "en", "the foreign-vehicle register")}.`,
        ),
        ...paras(verifiedLine("en", PARKING_VERIFIED)),
        ...b2Related(["zbe", "transport"], "en"),
      ],
    },
  },
};

/** Cross-link into the existing tourist tax guide, used by the publisher. */
export const TAX_LINK: Record<string, string> = {
  ca: link("traps", "ca", "Barcelona sense trampes per a turistes"),
  es: link("traps", "es", "Barcelona sin trampas para turistas"),
  en: link("traps", "en", "Barcelona without the tourist traps"),
};
