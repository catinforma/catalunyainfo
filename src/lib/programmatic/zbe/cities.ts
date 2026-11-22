import type { Fact, L10n, ZbeCity, ZbeSource } from "./types";

/**
 * The low-emission zones the family publishes, one record per zone, each
 * statement with the council page it was read on and the council's own words
 * (`quote`, verbatim, in the page's language). Nothing here comes from the DGT
 * file: datex.ts says why. A city enters this list only when its access rule
 * was read on an official page that could be saved and searched; the hub lists
 * the rest of the DGT's zones without a rule.
 *
 * Adding or re-checking a city: save every `sources` page, find each quote in
 * the saved text (docs/SEO_EXPERIMENTS.md, 22 Nov 2026, has the method), and
 * set `checked` to that day. When the council's page gives a condition
 * (residents only, pollution episodes), write it as `condition`: the answer
 * for that label is then "depends", never a bare yes or no.
 */

const l = (es: string, ca: string, en: string): L10n => ({ es, ca, en });

/** The state traffic law: where a council's page gives no amount, the fine comes from here. */
export const TRAFFIC_LAW: ZbeSource = {
  url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11722",
  title: "Real Decreto Legislativo 6/2015, texto refundido de la Ley sobre Tráfico (artículos 76, 80 y 94), texto consolidado",
  publisher: "Agencia Estatal Boletín Oficial del Estado",
};

function nationalFine(source: number): Fact {
  return {
    kind: "fine",
    source,
    quote: "las graves, con multa de 200 euros",
    text: l(
      "La página oficial de la zona no da el importe general. La ley estatal de tráfico considera infracción grave no respetar las restricciones de una zona de bajas emisiones (artículo 76, letra z3) y sanciona las graves con 200 euros (artículo 80.1), con una reducción del 50 % si se paga en los 20 días naturales siguientes a la notificación (artículo 94).",
      "La pàgina oficial de la zona no dona l'import general. La llei estatal de trànsit considera infracció greu no respectar les restriccions d'una zona de baixes emissions (article 76, lletra z3) i sanciona les greus amb 200 euros (article 80.1), amb una reducció del 50 % si es paga dins dels 20 dies naturals següents a la notificació (article 94).",
      "The zone's official page gives no general amount. The Spanish traffic act makes ignoring the restrictions of a low-emission zone a serious offence (article 76, letter z3) and sets the fine for serious offences at 200 euros (article 80.1), reduced by 50% when paid within 20 calendar days of the notice (article 94).",
    ),
  };
}

const TARRAGONA: ZbeCity = {
  slug: "tarragona",
  name: l("Tarragona", "Tarragona", "Tarragona"),
  region: "CT",
  catalonia: true,
  holidaySlug: "tarragona",
  dgtFile: "Tarragona.xml",
  zoneName: l("ZBE de Tarragona", "ZBE de Tarragona", "Tarragona ZBE"),
  authority: "Ajuntament de Tarragona",
  checked: "2026-11-22",
  fines: true,
  restrictions: [
    {
      labels: ["none"],
      vehicles: l("Vehículos sin distintivo ambiental de la DGT", "Vehicles sense distintiu ambiental de la DGT", "Vehicles with no DGT environmental label"),
      schedule: { days: "working-weekdays", from: "07:00", to: "19:00" },
      since: "2025-12-31",
      source: 0,
      quote: "La ZBE s’aplica entre les 7 i les 19 h dels dies laborables no festius (de dilluns a divendres, sempre que no siguin festius).",
      unless: l(
        "salvo autorización: la tienen de forma automática los vehículos de residentes en Tarragona que constan en el padrón del impuesto municipal de vehículos (hasta el 31 de diciembre de 2026; residentes dentro de la zona, hasta el 31 de diciembre de 2027), los que van a un aparcamiento público de la zona y cualquier vehículo sin etiqueta hasta 12 días al año",
        "tret d'autorització: la tenen de manera automàtica els vehicles de residents a Tarragona que consten al padró de l'impost municipal de vehicles (fins al 31 de desembre de 2026; residents dins la zona, fins al 31 de desembre de 2027), els que van a un aparcament públic de la zona i qualsevol vehicle sense etiqueta fins a 12 dies l'any",
        "unless authorised: authorisation is automatic for vehicles of Tarragona residents listed in the municipal vehicle-tax roll (until 31 December 2026; residents inside the zone, until 31 December 2027), for vehicles going to a public car park inside the zone, and for any unlabelled vehicle up to 12 days a year",
      ),
    },
  ],
  allowed: { labels: ["0", "ECO", "C", "B"], source: 0, quote: "Vehicles amb distintiu ambiental 0, ECO, C i B, bicicletes i vehicles de mobilitat personal." },
  facts: [
    {
      kind: "area",
      source: 0,
      quote: "La ZBE inclou els carrers dins del perímetre format per: avinguda Vidal i Barraquer, avinguda Argentina, avinguda Catalunya, carrer Reina M. Cristina, passeig Torroja, passeig Sant Antoni, vial William J. Bryant, passeig d’Espanya, carrer Comerç i Moll de Costa. Les vies perimetrals no tenen restriccions.",
      text: l(
        "La zona son las calles dentro del perímetro que forman la avinguda Vidal i Barraquer, la avinguda Argentina, la avinguda Catalunya, el carrer Reina M. Cristina, el passeig Torroja, el passeig Sant Antoni, el vial William J. Bryant, el passeig d'Espanya, el carrer Comerç y el Moll de Costa. Las vías del perímetro no tienen restricción.",
        "La zona són els carrers dins del perímetre que formen l'avinguda Vidal i Barraquer, l'avinguda Argentina, l'avinguda Catalunya, el carrer Reina M. Cristina, el passeig Torroja, el passeig Sant Antoni, el vial William J. Bryant, el passeig d'Espanya, el carrer Comerç i el Moll de Costa. Les vies del perímetre no tenen restricció.",
        "The zone is the streets inside the perimeter formed by avinguda Vidal i Barraquer, avinguda Argentina, avinguda Catalunya, carrer Reina M. Cristina, passeig Torroja, passeig Sant Antoni, vial William J. Bryant, passeig d'Espanya, carrer Comerç and Moll de Costa. The perimeter roads themselves are not restricted.",
      ),
    },
    {
      kind: "since",
      source: 0,
      quote: "La ZBE de Tarragona entrarà en vigor el 31 de desembre de 2025. Fins al 31 de desembre de 2027 no es preveuen canvis a l’ordenança reguladora.",
      text: l(
        "En vigor desde el 31 de diciembre de 2025. El Ayuntamiento no prevé cambios en la ordenanza hasta el 31 de diciembre de 2027.",
        "En vigor des del 31 de desembre de 2025. L'Ajuntament no preveu canvis a l'ordenança fins al 31 de desembre de 2027.",
        "In force since 31 December 2025. The council expects no change to the by-law until 31 December 2027.",
      ),
    },
    {
      kind: "next",
      source: 1,
      quote: "Els vehicles amb etiqueta ambiental B deixen de tenir accés lliure a la ZBE i hauran de sol·licitar autorització.",
      text: l(
        "1 de enero de 2028: los vehículos con etiqueta B dejan de tener acceso libre y tendrán que pedir autorización.",
        "1 de gener de 2028: els vehicles amb etiqueta B deixen de tenir accés lliure i hauran de demanar autorització.",
        "1 January 2028: vehicles with a B label lose free access and will have to apply for authorisation.",
      ),
    },
    {
      kind: "residents",
      source: 0,
      quote: "Vehicles de residents a Tarragona —fins al 31 de desembre de 2026— i de residents dins la ZBE —fins al 31 de desembre de 2027—, que constin al padró de l'Impost Municipal de Vehicles de Tarragona.",
      text: l(
        "Los vehículos sin etiqueta de residentes en Tarragona que constan en el padrón del impuesto municipal de vehículos están autorizados sin trámite hasta el 31 de diciembre de 2026; los de residentes dentro de la zona, hasta el 31 de diciembre de 2027.",
        "Els vehicles sense etiqueta de residents a Tarragona que consten al padró de l'impost municipal de vehicles estan autoritzats sense tràmit fins al 31 de desembre de 2026; els de residents dins la zona, fins al 31 de desembre de 2027.",
        "Unlabelled vehicles of Tarragona residents listed in the municipal vehicle-tax roll are authorised with no paperwork until 31 December 2026; those of residents inside the zone, until 31 December 2027.",
      ),
    },
    {
      kind: "occasional",
      source: 0,
      quote: "Vehicles sense etiqueta amb accés esporàdic (fins a 12 dies l’any).",
      text: l(
        "Un vehículo sin etiqueta puede entrar hasta 12 días al año como acceso esporádico, sin inscribirse en el registro de vehículos autorizados.",
        "Un vehicle sense etiqueta pot entrar fins a 12 dies l'any com a accés esporàdic, sense inscriure's al registre de vehicles autoritzats.",
        "An unlabelled vehicle may enter up to 12 days a year as occasional access, without signing up to the register of authorised vehicles.",
      ),
    },
    {
      kind: "foreign",
      source: 0,
      quote: "Vehicles amb matrícula estrangera no identificats per la DGT (fins a 12 dies l’any).",
      text: l(
        "Los vehículos con matrícula extranjera que la DGT no identifica tienen autorización automática hasta 12 días al año.",
        "Els vehicles amb matrícula estrangera que la DGT no identifica tenen autorització automàtica fins a 12 dies l'any.",
        "Foreign-registered vehicles the DGT cannot identify are authorised automatically up to 12 days a year.",
      ),
    },
    {
      kind: "parking",
      source: 0,
      quote: "Vehicles que accedeixen a aparcaments públics dins la ZBE.",
      text: l(
        "Los vehículos que entran para dejar el coche en un aparcamiento público de dentro de la zona están autorizados automáticamente; el Ayuntamiento publica la [lista de aparcamientos adheridos](https://www.tarragona.cat/mobilitat/zona-de-baixes-emissions-zbe/aparcaments-adherits).",
        "Els vehicles que entren per deixar el cotxe en un aparcament públic de dins la zona estan autoritzats automàticament; l'Ajuntament publica la [llista d'aparcaments adherits](https://www.tarragona.cat/mobilitat/zona-de-baixes-emissions-zbe/aparcaments-adherits).",
        "Vehicles driving in to use a public car park inside the zone are authorised automatically; the council publishes the [list of participating car parks](https://www.tarragona.cat/mobilitat/zona-de-baixes-emissions-zbe/aparcaments-adherits).",
      ),
    },
    {
      kind: "control",
      source: 0,
      quote: "De moment, no és obligatori portar físicament el distintiu ambiental, ja que la identificació es fa per matrícula mitjançant càmeres.",
      text: l(
        "El control se hace con cámaras que leen la matrícula; por ahora no es obligatorio llevar la pegatina en el vehículo.",
        "El control es fa amb càmeres que llegeixen la matrícula; de moment no és obligatori portar l'adhesiu al vehicle.",
        "Enforcement is by cameras that read the number plate; for now the sticker does not have to be displayed on the vehicle.",
      ),
    },
    {
      kind: "fine",
      source: 0,
      quote: "L’incompliment de les restriccions d’accés, circulació o estacionament dins la ZBE es considera una infracció greu (multes de 200 €, segons la Llei sobre trànsit). En cas de reincidència, la sanció pot incrementar-se fins a un 30%.",
      text: l(
        "Incumplir las restricciones de acceso, circulación o estacionamiento es una infracción grave: 200 euros, según la ley de tráfico. En caso de reincidencia la sanción puede subir hasta un 30 %.",
        "Incomplir les restriccions d'accés, circulació o estacionament és una infracció greu: 200 euros, segons la llei de trànsit. En cas de reincidència la sanció pot augmentar fins a un 30 %.",
        "Breaking the access, driving or parking restrictions is a serious offence: 200 euros under the traffic act. For repeat offences the fine can rise by up to 30%.",
      ),
    },
  ],
  mapUrl: "https://www.tarragona.cat/mobilitat/zona-de-baixes-emissions-zbe/mapa",
  officialUrl: "https://www.tarragona.cat/mobilitat/zona-de-baixes-emissions-zbe",
  sources: [
    { url: "https://www.tarragona.cat/mobilitat/zona-de-baixes-emissions-zbe/preguntes-frequents", title: "Zona de baixes emissions (ZBE): preguntes freqüents", publisher: "Ajuntament de Tarragona" },
    { url: "https://www.tarragona.cat/mobilitat/zona-de-baixes-emissions-zbe/calendari", title: "Zona de baixes emissions (ZBE): calendari", publisher: "Ajuntament de Tarragona" },
    { url: "https://www.tarragona.cat/mobilitat/zona-de-baixes-emissions-zbe/mapa", title: "Zona de baixes emissions (ZBE): mapa", publisher: "Ajuntament de Tarragona" },
  ],
  dgtDifference: l(
    "El fichero de la DGT da como inicio el 20 de enero de 2026; el Ayuntamiento, el 31 de diciembre de 2025. El horario (laborables de 7 a 19 h) coincide.",
    "El fitxer de la DGT dona com a inici el 20 de gener de 2026; l'Ajuntament, el 31 de desembre de 2025. L'horari (feiners de 7 a 19 h) coincideix.",
    "The DGT file gives 20 January 2026 as the start; the council, 31 December 2025. The hours (working days, 7:00 to 19:00) agree.",
  ),
  notPublished: [
    l(
      "Qué tipos de vehículo (turismos, motos, furgonetas, camiones) alcanza la restricción: las páginas municipales consultadas hablan de vehículos sin distintivo, sin distinguir por tipo.",
      "Quins tipus de vehicle (turismes, motos, furgonetes, camions) abasta la restricció: les pàgines municipals consultades parlen de vehicles sense distintiu, sense distingir per tipus.",
      "Which vehicle types (cars, motorcycles, vans, lorries) the restriction covers: the council pages read speak of unlabelled vehicles without splitting them by type.",
    ),
  ],
};

const GIRONA: ZbeCity = {
  slug: "girona",
  name: l("Girona", "Girona", "Girona"),
  region: "CT",
  catalonia: true,
  holidaySlug: "girona",
  dgtFile: "Girona.xml",
  zoneName: l("ZBE de Girona", "ZBE de Girona", "Girona ZBE"),
  authority: "Ajuntament de Girona",
  checked: "2026-11-22",
  fines: true,
  restrictions: [
    {
      labels: ["none"],
      vehicles: l("Vehículos sin etiqueta ambiental de la DGT", "Vehicles sense etiqueta ambiental de la DGT", "Vehicles with no DGT environmental label"),
      schedule: { days: "working-weekdays", from: "07:00", to: "20:00" },
      since: "2025-09-15",
      source: 0,
      quote: "L’horari que s’aplica la ZBE de Girona és de 7 a 20 hores, de dilluns a divendres laborables. En l’horari de funcionament de la ZBE no poden circular ni estacionar els vehicles sense etiqueta ambiental que no estiguin prèviament autoritzats.",
      unless: l(
        "salvo autorización: ya la tienen los vehículos que en 2024 tenían el permiso de circulación domiciliado en Girona, y cualquier otro vehículo sin etiqueta puede entrar hasta 24 días por año natural sin pedirla",
        "tret d'autorització: ja la tenen els vehicles que el 2024 tenien el permís de circulació domiciliat a Girona, i qualsevol altre vehicle sense etiqueta pot entrar fins a 24 dies per any natural sense demanar-la",
        "unless authorised: vehicles whose registration certificate was domiciled in Girona in 2024 already are, and any other unlabelled vehicle may enter up to 24 days per calendar year without applying",
      ),
    },
  ],
  allowed: { labels: ["0", "ECO", "C", "B"], source: 2, quote: "Tots els vehicles amb etiqueta ambiental poden entrar a la ZBE de Girona." },
  facts: [
    {
      kind: "area",
      source: 4,
      quote: "El perímetre de la ZBE de Girona engloba des del parc de la Devesa fins al carrer d’Emili Grahit i des del carrer del Riu Güell fins al carrer del Carme i el Barri Vell.",
      text: l(
        "El perímetro va del parque de la Devesa al carrer d'Emili Grahit y del carrer del Riu Güell al carrer del Carme y el Barri Vell.",
        "El perímetre va del parc de la Devesa al carrer d'Emili Grahit i del carrer del Riu Güell al carrer del Carme i el Barri Vell.",
        "The perimeter runs from the Devesa park to carrer d'Emili Grahit and from carrer del Riu Güell to carrer del Carme and the Barri Vell (old town).",
      ),
    },
    {
      kind: "since",
      source: 1,
      quote: "Dilluns 15 de setembre de 2025.",
      text: l("En funcionamiento desde el lunes 15 de septiembre de 2025.", "En funcionament des del dilluns 15 de setembre de 2025.", "In operation since Monday 15 September 2025."),
    },
    {
      kind: "next",
      source: 1,
      quote: "Abans de l'any 2028.",
      text: l(
        "El Ayuntamiento prevé revisar la zona antes de 2028; no ha publicado qué cambiará.",
        "L'Ajuntament preveu revisar la zona abans del 2028; no ha publicat què canviarà.",
        "The council plans to review the zone before 2028; it has not published what will change.",
      ),
    },
    {
      kind: "occasional",
      source: 0,
      quote: "Els vehicles sense etiqueta ambiental i que no estiguin autoritzats poden entrar, fins a 24 dies en un any natural dins l’horari de la ZBE. No és necessari demanar autorització per entrar aquests 24 dies.",
      text: l(
        "Un vehículo sin etiqueta y sin autorización puede entrar hasta 24 días por año natural dentro del horario de la zona, sin pedir permiso para esos días.",
        "Un vehicle sense etiqueta i sense autorització pot entrar fins a 24 dies per any natural dins l'horari de la zona, sense demanar permís per a aquests dies.",
        "An unlabelled, unauthorised vehicle may enter up to 24 days per calendar year during the zone's hours, with no need to apply for those days.",
      ),
    },
    {
      kind: "residents",
      source: 2,
      quote: "Si el vehicle sense etiqueta ambiental tenia el permís de circulació en un domicili de la ciutat de Girona l’any 2024, aquest ja està autoritzat per entrar a la ZBE de Girona.",
      text: l(
        "Un vehículo sin etiqueta que en 2024 tenía el permiso de circulación en un domicilio de Girona ya está autorizado.",
        "Un vehicle sense etiqueta que el 2024 tenia el permís de circulació en un domicili de Girona ja està autoritzat.",
        "An unlabelled vehicle whose registration certificate was at a Girona address in 2024 is already authorised.",
      ),
    },
    {
      kind: "foreign",
      source: 2,
      quote: "Vehicles amb matrícula estrangera que compleixin els requisits tecnològics i d’emissions",
      text: l(
        "Los vehículos con matrícula extranjera que cumplen los requisitos tecnológicos y de emisiones figuran entre los que pueden obtener autorización; el trámite se hace en [zbe.cat](https://zbe.cat/autorizations).",
        "Els vehicles amb matrícula estrangera que compleixen els requisits tecnològics i d'emissions figuren entre els que poden obtenir autorització; el tràmit es fa a [zbe.cat](https://zbe.cat/autorizations).",
        "Foreign-registered vehicles that meet the technology and emission requirements are among those that can obtain authorisation; the application is made at [zbe.cat](https://zbe.cat/autorizations).",
      ),
    },
    {
      kind: "control",
      source: 3,
      quote: "El sistema de control de la ZBE utilitza 20 càmeres situades en 13 punts de la via pública de la ciutat de Girona.",
      text: l(
        "El control se hace con 20 cámaras en 13 puntos de la vía pública, que leen las matrículas.",
        "El control es fa amb 20 càmeres en 13 punts de la via pública, que llegeixen les matrícules.",
        "Enforcement uses 20 cameras at 13 points on the public road, which read number plates.",
      ),
    },
    {
      kind: "fine",
      source: 3,
      quote: "Les sancions corresponents tenen un import de 200 euros a càrrec del titular del vehicle o del conductor del mateix si el vehicle va a nom d'una persona jurídica. En cas que la sanció es pagui dins els primers 20 dies següents a la notificació, l'import és de 100 euros.",
      text: l(
        "La sanción es de 200 euros, a cargo del titular del vehículo (o del conductor si el vehículo está a nombre de una persona jurídica); 100 euros si se paga en los 20 días siguientes a la notificación.",
        "La sanció és de 200 euros, a càrrec del titular del vehicle (o del conductor si el vehicle va a nom d'una persona jurídica); 100 euros si es paga dins dels 20 dies següents a la notificació.",
        "The fine is 200 euros, charged to the vehicle's registered keeper (or the driver when the keeper is a company); 100 euros when paid within 20 days of the notice.",
      ),
    },
  ],
  mapUrl: "https://web.girona.cat/zbe/planol",
  officialUrl: "https://web.girona.cat/zbe",
  sources: [
    { url: "https://web.girona.cat/zbe/caracteristiques", title: "Zona de baixes emissions: característiques", publisher: "Ajuntament de Girona" },
    { url: "https://web.girona.cat/zbe/calendari", title: "Zona de baixes emissions: calendari", publisher: "Ajuntament de Girona" },
    { url: "https://web.girona.cat/zbe/exempcions", title: "Zona de baixes emissions: exempcions i autoritzacions", publisher: "Ajuntament de Girona" },
    { url: "https://web.girona.cat/zbe/control", title: "Zona de baixes emissions: control i sancions", publisher: "Ajuntament de Girona" },
    { url: "https://web.girona.cat/zbe/faq", title: "Zona de baixes emissions: preguntes freqüents", publisher: "Ajuntament de Girona" },
  ],
  dgtDifference: l(
    "El fichero de la DGT da como inicio el 15 de enero de 2026; el Ayuntamiento, el 15 de septiembre de 2025. El horario (laborables de 7 a 20 h) coincide.",
    "El fitxer de la DGT dona com a inici el 15 de gener de 2026; l'Ajuntament, el 15 de setembre de 2025. L'horari (feiners de 7 a 20 h) coincideix.",
    "The DGT file gives 15 January 2026 as the start; the council, 15 September 2025. The hours (working days, 7:00 to 20:00) agree.",
  ),
  notPublished: [
    l(
      "Qué tipos de vehículo alcanza la restricción: las páginas municipales consultadas hablan de vehículos sin etiqueta, sin distinguir por tipo.",
      "Quins tipus de vehicle abasta la restricció: les pàgines municipals consultades parlen de vehicles sense etiqueta, sense distingir per tipus.",
      "Which vehicle types the restriction covers: the council pages read speak of unlabelled vehicles without splitting them by type.",
    ),
  ],
};

const BARCELONA: ZbeCity = {
  slug: "barcelona",
  name: l("Barcelona", "Barcelona", "Barcelona"),
  region: "CT",
  catalonia: true,
  // No holidaySlug: the zone spans five municipalities with different local
  // holidays and the AMB's pages do not say whose count, so only national and
  // Catalan holidays lift the restriction in the "today" answer.
  dgtFile: "RondasDeBarcelona.xml",
  zoneName: l("ZBE Rondes de Barcelona", "ZBE Rondes de Barcelona", "ZBE Rondes de Barcelona"),
  authority: "Àrea Metropolitana de Barcelona (AMB)",
  checked: "2026-11-22",
  fines: true,
  restrictions: [
    {
      labels: ["none"],
      vehicles: l(
        "Turismos (M1), motos y ciclomotores (L), furgonetas (N1), camiones (N2, N3) y autobuses y autocares (M2, M3) a los que no corresponde distintivo ambiental de la DGT",
        "Turismes (M1), motos i ciclomotors (L), furgonetes (N1), camions (N2, N3) i autobusos i autocars (M2, M3) als quals no correspon distintiu ambiental de la DGT",
        "Cars (M1), motorcycles and mopeds (L), vans (N1), lorries (N2, N3) and buses and coaches (M2, M3) that do not qualify for a DGT environmental label",
      ),
      schedule: { days: "working-weekdays", from: "07:00", to: "20:00" },
      since: "2020-01-01",
      source: 1,
      quote: "no hi podran circular els vehicles més contaminants els dies laborables, de dilluns a divendres, de 7.00 a 20.00 h.",
      unless: l(
        "salvo los vehículos inscritos en el Registro metropolitano con exención o autorización; los demás pueden pedir en ese registro, antes de entrar, hasta 24 autorizaciones de un día al año",
        "tret dels vehicles inscrits al Registre metropolità amb exempció o autorització; la resta poden demanar en aquest registre, abans d'entrar, fins a 24 autoritzacions d'un dia l'any",
        "except vehicles entered in the metropolitan register with an exemption or authorisation; the rest can request up to 24 one-day authorisations a year from that register, before driving in",
      ),
    },
  ],
  allowed: { labels: ["0", "ECO", "C", "B"], source: 1, quote: "Els vehicles amb etiqueta ambiental 0, ECO, C o B poden circular sense restriccions a la ZBE Rondes de Barcelona." },
  facts: [
    {
      kind: "area",
      source: 0,
      quote: "Engloba tot el terme municipal de Barcelona (excepte la Zona Franca industrial i els barris de Vallvidrera, el Tibidabo i les Planes), els municipis de Sant Adrià de Besòs i l'Hospitalet de Llobregat i part dels municipis d'Esplugues de Llobregat i Cornellà de Llobregat.",
      text: l(
        "Más de 95 km²: todo el término municipal de Barcelona (excepto la Zona Franca industrial y los barrios de Vallvidrera, el Tibidabo y Les Planes), los municipios de Sant Adrià de Besòs y L'Hospitalet de Llobregat, y parte de Esplugues de Llobregat y Cornellà de Llobregat.",
        "Més de 95 km²: tot el terme municipal de Barcelona (excepte la Zona Franca industrial i els barris de Vallvidrera, el Tibidabo i les Planes), els municipis de Sant Adrià de Besòs i l'Hospitalet de Llobregat, i part d'Esplugues de Llobregat i Cornellà de Llobregat.",
        "Over 95 km²: the whole municipality of Barcelona (except the industrial Zona Franca and the Vallvidrera, Tibidabo and Les Planes neighbourhoods), the municipalities of Sant Adrià de Besòs and L'Hospitalet de Llobregat, and part of Esplugues de Llobregat and Cornellà de Llobregat.",
      ),
    },
    {
      kind: "since",
      source: 0,
      quote: "A qui afecta: prohibició permanent de circulació dins la ZBE Rondes de Barcelona a turismes (M1), motos i ciclomotors (L) que no els correspongui distintiu ambiental de la DGT.",
      text: l(
        "Restricción permanente desde el 1 de enero de 2020 para turismos, motos y ciclomotores sin distintivo; ampliada a furgonetas (N1) el 1 de abril de 2021, a camiones (N2, N3) y autocares pequeños (M2) el 1 de enero de 2022 y a autobuses y autocares (M3) el 1 de julio de 2022.",
        "Restricció permanent des de l'1 de gener de 2020 per a turismes, motos i ciclomotors sense distintiu; ampliada a furgonetes (N1) l'1 d'abril de 2021, a camions (N2, N3) i autocars petits (M2) l'1 de gener de 2022 i a autobusos i autocars (M3) l'1 de juliol de 2022.",
        "Permanent restriction since 1 January 2020 for unlabelled cars, motorcycles and mopeds; extended to vans (N1) on 1 April 2021, to lorries (N2, N3) and small coaches (M2) on 1 January 2022 and to buses and coaches (M3) on 1 July 2022.",
      ),
    },
    {
      kind: "occasional",
      source: 2,
      quote: "Els vehicles que no compleixen els requisits per circular per les ZBE de la metròpolis de Barcelona s’han d’inscriure al Registre per poder sol·licitar fins a 24 autoritzacions (accessos d'un dia) l’any.",
      text: l(
        "Un vehículo que no cumple los requisitos tiene que inscribirse en el Registro metropolitano para pedir hasta 24 autorizaciones de un día al año; cada autorización diaria tiene una tasa que la AMB publica cada año. No es automático: hay que pedirla antes de circular.",
        "Un vehicle que no compleix els requisits s'ha d'inscriure al Registre metropolità per demanar fins a 24 autoritzacions d'un dia l'any; cada autorització diària té una taxa que l'AMB publica cada any. No és automàtic: cal demanar-la abans de circular.",
        "A vehicle that does not meet the requirements has to sign up to the metropolitan register to request up to 24 one-day authorisations a year; each daily authorisation carries a fee the AMB publishes yearly. It is not automatic: it has to be requested before driving.",
      ),
    },
    {
      kind: "foreign",
      source: 3,
      quote: "Tots els vehicles estrangers s'han d’inscriure al Registre d'autoritzacions per circular per les ZBE de la metròpolis de Barcelona. El tràmit de comprovació de requisits ambientals pot trigar fins a 15 dies.",
      text: l(
        "Todos los vehículos con matrícula extranjera tienen que inscribirse en el Registro de autorizaciones antes de circular, aunque cumplan los requisitos ambientales: la comprobación puede tardar hasta 15 días. Si hace falta entrar antes, existe la autorización de acceso esporádico para vehículos extranjeros (trámite inmediato, hasta 24 días al año).",
        "Tots els vehicles amb matrícula estrangera s'han d'inscriure al Registre d'autoritzacions abans de circular, encara que compleixin els requisits ambientals: la comprovació pot trigar fins a 15 dies. Si cal entrar abans, hi ha l'autorització d'accés esporàdic per a vehicles estrangers (tràmit immediat, fins a 24 dies l'any).",
        "Every foreign-registered vehicle has to sign up to the authorisations register before driving in, even when it meets the environmental requirements: the check can take up to 15 days. To enter sooner there is the occasional-access authorisation for foreign vehicles (immediate, up to 24 days a year).",
      ),
    },
    {
      kind: "fine",
      source: 1,
      quote: "Si un vehicle compleix les condicions d'accés per entrar a la ZBE, però no s'ha registrat amb antelació, se li pot imposar una multa a partir de 200 euros.",
      text: l(
        "Un vehículo extranjero que cumple las condiciones de acceso pero no se ha registrado con antelación puede recibir una multa a partir de 200 euros, según la AMB.",
        "Un vehicle estranger que compleix les condicions d'accés però no s'ha registrat amb antelació pot rebre una multa a partir de 200 euros, segons l'AMB.",
        "A foreign vehicle that meets the access conditions but was not registered beforehand can be fined from 200 euros, according to the AMB.",
      ),
    },
    nationalFine(4),
  ],
  mapUrl: "https://www.zbe.barcelona/zones-baixes-emissions/la-zbe.html",
  officialUrl: "https://www.zbe.barcelona/",
  sources: [
    { url: "https://www.zbe.barcelona/zones-baixes-emissions/la-zbe.html", title: "La ZBE Rondes de Barcelona: àmbit i calendari", publisher: "Àrea Metropolitana de Barcelona (AMB)" },
    { url: "https://www.zbe.barcelona/zones-baixes-emissions/vehicles-afectats.html", title: "ZBE Rondes de Barcelona: vehicles afectats", publisher: "Àrea Metropolitana de Barcelona (AMB)" },
    { url: "https://zberegistre.ambmobilitat.cat/ca/AutoritzacionsDiaries", title: "Registre metropolità: autoritzacions diàries", publisher: "Àrea Metropolitana de Barcelona (AMB)" },
    { url: "https://zberegistre.ambmobilitat.cat/ca/VehiclesEstrangers", title: "Registre metropolità: vehicles estrangers", publisher: "Àrea Metropolitana de Barcelona (AMB)" },
    TRAFFIC_LAW,
  ],
  dgtDifference: l(
    "El fichero de la DGT da como inicio el 6 de febrero de 2025 (la fecha de su registro); la AMB aplica la restricción permanente desde el 1 de enero de 2020. El horario (laborables de 7 a 20 h) coincide. La DGT mantiene además un segundo fichero, «Barcelona.xml», que esta página no usa.",
    "El fitxer de la DGT dona com a inici el 6 de febrer de 2025 (la data del seu registre); l'AMB aplica la restricció permanent des de l'1 de gener de 2020. L'horari (feiners de 7 a 20 h) coincideix. La DGT manté a més un segon fitxer, «Barcelona.xml», que aquesta pàgina no fa servir.",
    "The DGT file gives 6 February 2025 as the start (the date of its record); the AMB has applied the permanent restriction since 1 January 2020. The hours (working days, 7:00 to 20:00) agree. The DGT also keeps a second file, \"Barcelona.xml\", which this page does not use.",
  ),
  notPublished: [
    l(
      "Cómo se controla el acceso (cámaras): las páginas de la AMB consultadas no lo describen.",
      "Com es controla l'accés (càmeres): les pàgines de l'AMB consultades no ho descriuen.",
      "How access is enforced (cameras): the AMB pages read do not describe it.",
    ),
    l(
      "Qué vías de dentro del ámbito quedan excluidas: la AMB las muestra en su mapa, no en texto.",
      "Quines vies de dins de l'àmbit en queden excloses: l'AMB les mostra al seu mapa, no en text.",
      "Which roads inside the area are excluded: the AMB shows them on its map, not in text.",
    ),
  ],
  guide: {
    key: "zbe",
    text: l(
      "Con matrícula extranjera, el registro paso a paso, los requisitos Euro y las autorizaciones diarias están en la guía de la ZBE de Barcelona con coche extranjero.",
      "Amb matrícula estrangera, el registre pas a pas, els requisits Euro i les autoritzacions diàries són a la guia de la ZBE de Barcelona amb cotxe estranger.",
      "With foreign plates, the step-by-step registration, the Euro requirements and the daily permits are in the guide to Barcelona's low-emission zone for foreign cars.",
    ),
  },
};

const REUS: ZbeCity = {
  slug: "reus",
  name: l("Reus", "Reus", "Reus"),
  region: "CT",
  catalonia: true,
  holidaySlug: "reus",
  dgtFile: "Reus.xml",
  zoneName: l("ZBE de Reus", "ZBE de Reus", "Reus ZBE"),
  authority: "Ajuntament de Reus",
  checked: "2026-11-22",
  fines: true,
  restrictions: [
    {
      labels: ["none"],
      vehicles: l("Vehículos sin etiqueta ambiental de la DGT", "Vehicles sense etiqueta ambiental de la DGT", "Vehicles with no DGT environmental label"),
      schedule: { days: "working-weekdays", from: "07:00", to: "19:00" },
      since: "2025-12-01",
      source: 0,
      quote: "La Zona de baixes Emissions (ZBE) de Reus està activa en dies laborables de dilluns a divendres, de 7 a 19 h.",
      condition: l(
        "Depende de dónde paga el impuesto de vehículos. Si no es residente en Reus ni paga allí el impuesto: no puede entrar los laborables de lunes a viernes de 7 a 19 h, salvo 24 días al año o si estaciona en un aparcamiento público o privado. Si es residente en Reus y paga allí el impuesto: la restricción no le alcanza hasta el 30 de diciembre de 2027.",
        "Depèn d'on paga l'impost de vehicles. Si no és resident a Reus ni hi paga l'impost: no pot entrar els feiners de dilluns a divendres de 7 a 19 h, tret de 24 dies l'any o si estaciona en un aparcament públic o privat. Si és resident a Reus i hi paga l'impost: la restricció no l'afecta fins al 30 de desembre de 2027.",
        "It depends on where the vehicle tax is paid. If you are not a Reus resident and do not pay the tax there: no entry on working days, Monday to Friday, 7:00 to 19:00, except 24 days a year or when parking in a public or private car park. If you are a Reus resident and pay the tax there: the restriction does not reach you until 30 December 2027.",
      ),
    },
    {
      labels: ["B"],
      vehicles: l("Vehículos diésel con etiqueta B", "Vehicles dièsel amb etiqueta B", "Diesel vehicles with a B label"),
      schedule: { days: "working-weekdays", from: "07:00", to: "19:00" },
      since: "2025-12-01",
      source: 1,
      quote: "(1) En episodis de contaminació per NO2, les restriccions afectaran als vehicles dièsel amb etiqueta B, tant de residents com de no residents.",
      condition: l(
        "Depende del combustible y del día. La etiqueta B no está afectada hasta el 30 de diciembre de 2027, pero en episodios de contaminación por NO2 las restricciones alcanzan a los diésel con etiqueta B, sean de residentes o no. Desde el 31 de diciembre de 2027 la restricción se amplía a la etiqueta B.",
        "Depèn del combustible i del dia. L'etiqueta B no està afectada fins al 30 de desembre de 2027, però en episodis de contaminació per NO2 les restriccions afecten els dièsel amb etiqueta B, siguin de residents o no. Des del 31 de desembre de 2027 la restricció s'amplia a l'etiqueta B.",
        "It depends on the fuel and the day. The B label is not affected until 30 December 2027, but during NO2 pollution episodes the restrictions reach diesel vehicles with a B label, residents' or not. From 31 December 2027 the restriction is extended to the B label.",
      ),
    },
  ],
  allowed: { labels: ["0", "ECO", "C"], source: 2, quote: "Podran continuar circulant per la ZBE tots els vehicles C, ECO i ZERO." },
  facts: [
    {
      kind: "area",
      source: 2,
      quote: "La ZBE de Reus té una superfície de 2,68 km² la qual inclou els carrers que es troben dintre de l’àrea delimitada per l’avinguda dels Països Catalans, l’avinguda de Sant Bernat Calbó, l’avinguda del President Macià, l’avinguda de Marià Fortuny, l’avinguda de l’Onze de setembre, tram de General Moragues entre av. de l’Onze de setembre i la plaça d’Almoster, i l’avinguda del Comerç.",
      text: l(
        "2,68 km²: las calles dentro del área que delimitan la avinguda dels Països Catalans, la avinguda de Sant Bernat Calbó, la avinguda del President Macià, la avinguda de Marià Fortuny, la avinguda de l'Onze de Setembre, el tramo de General Moragues entre esta avenida y la plaça d'Almoster, y la avinguda del Comerç. Por las vías del perímetro se puede circular.",
        "2,68 km²: els carrers dins de l'àrea que delimiten l'avinguda dels Països Catalans, l'avinguda de Sant Bernat Calbó, l'avinguda del President Macià, l'avinguda de Marià Fortuny, l'avinguda de l'Onze de Setembre, el tram de General Moragues entre aquesta avinguda i la plaça d'Almoster, i l'avinguda del Comerç. Per les vies del perímetre s'hi pot circular.",
        "2.68 km²: the streets inside the area bounded by avinguda dels Països Catalans, avinguda de Sant Bernat Calbó, avinguda del President Macià, avinguda de Marià Fortuny, avinguda de l'Onze de Setembre, the stretch of General Moragues between that avenue and plaça d'Almoster, and avinguda del Comerç. The perimeter roads themselves can be driven on.",
      ),
    },
    {
      kind: "since",
      source: 0,
      quote: "Des de l'1 de desembre de 2025, se sanciona als titulars de vehicles que incompleixen la normativa.",
      text: l("Con sanciones desde el 1 de diciembre de 2025.", "Amb sancions des de l'1 de desembre de 2025.", "Fines have been issued since 1 December 2025."),
    },
    {
      kind: "next",
      source: 1,
      quote: "FASE 4. A partir del 31 de desembre de 2027. S’amplien les restriccions d’accés i l’aplicació de sancions als vehicles amb etiqueta B i als residents a Reus.",
      text: l(
        "31 de diciembre de 2027 (fase 4): las restricciones y las sanciones se amplían a los vehículos con etiqueta B y a los residentes en Reus.",
        "31 de desembre de 2027 (fase 4): les restriccions i les sancions s'amplien als vehicles amb etiqueta B i als residents a Reus.",
        "31 December 2027 (phase 4): the restrictions and fines are extended to vehicles with a B label and to Reus residents.",
      ),
    },
    {
      kind: "residents",
      source: 1,
      quote: "FASE 3. De l’1 de desembre de 2025 al 30 de desembre de 2027. S’implementa de forma efectiva la ZBE, amb restriccions d’accés i aplicació de sancions als vehicles contaminants en cas d’incompliment als vehicles sense etiqueta ambiental de persones no residents a Reus i que no paguen a la ciutat l’impost de vehicles.",
      text: l(
        "Hasta el 30 de diciembre de 2027 (fase 3) la restricción y las sanciones se aplican a los vehículos sin etiqueta de personas no residentes en Reus que no pagan en la ciudad el impuesto de vehículos.",
        "Fins al 30 de desembre de 2027 (fase 3) la restricció i les sancions s'apliquen als vehicles sense etiqueta de persones no residents a Reus que no paguen a la ciutat l'impost de vehicles.",
        "Until 30 December 2027 (phase 3) the restriction and the fines apply to unlabelled vehicles of people who are not Reus residents and do not pay the vehicle tax in the city.",
      ),
    },
    {
      kind: "occasional",
      source: 2,
      quote: "Si ets de fora de Reus i tens un vehicle sense etiqueta ambiental podràs entrar dins la ZBE 24 dies per any. Pots entrar i sortir tantes vegades com necessitis un mateix dia. Només es comptarà 1 dia d’accés.",
      text: l(
        "Un vehículo sin etiqueta de fuera de Reus puede entrar 24 días al año, sin inscribirse en el registro municipal; varias entradas y salidas el mismo día cuentan como un solo día.",
        "Un vehicle sense etiqueta de fora de Reus pot entrar 24 dies l'any, sense inscriure's al registre municipal; diverses entrades i sortides el mateix dia compten com un sol dia.",
        "An unlabelled vehicle from outside Reus may enter 24 days a year, without signing up to the municipal register; several entries and exits on one day count as a single day.",
      ),
    },
    {
      kind: "parking",
      source: 2,
      quote: "També podràs accedir tants cops com vulguis si estaciones a un aparcament públic o a un aparcament privat.",
      text: l(
        "También se puede entrar tantas veces como se quiera si se estaciona en un aparcamiento público o en uno privado.",
        "També s'hi pot entrar tants cops com es vulgui si s'estaciona en un aparcament públic o en un de privat.",
        "You may also enter as often as you like when parking in a public or a private car park.",
      ),
    },
    {
      kind: "foreign",
      source: 2,
      quote: "Vehicles amb matrícula estrangera i que compleixin els requisits tecnològics i d’emissions d’accés a la ZBE",
      text: l(
        "Los vehículos con matrícula extranjera que cumplen los requisitos tecnológicos y de emisiones figuran en la lista de exenciones del Ayuntamiento.",
        "Els vehicles amb matrícula estrangera que compleixen els requisits tecnològics i d'emissions figuren a la llista d'exempcions de l'Ajuntament.",
        "Foreign-registered vehicles that meet the technology and emission requirements are on the council's list of exemptions.",
      ),
    },
    nationalFine(3),
  ],
  mapUrl: "https://mobilitat.reus.cat/zbe",
  officialUrl: "https://mobilitat.reus.cat/zbe",
  sources: [
    { url: "https://mobilitat.reus.cat/zbe", title: "Zona de baixes emissions (ZBE) de Reus", publisher: "Ajuntament de Reus" },
    { url: "https://mobilitat.reus.cat/zbe/calendari-dimplantacio", title: "ZBE de Reus: calendari d'implantació", publisher: "Ajuntament de Reus" },
    { url: "https://mobilitat.reus.cat/zbe/faqs", title: "ZBE de Reus: preguntes freqüents", publisher: "Ajuntament de Reus" },
    TRAFFIC_LAW,
  ],
  dgtDifference: l(
    "El fichero de la DGT da como inicio el 12 de diciembre de 2025 y solo lista los vehículos sin distintivo; el Ayuntamiento sanciona desde el 1 de diciembre de 2025 y limita la restricción, hasta el 30 de diciembre de 2027, a los no residentes. El horario (laborables de 7 a 19 h) coincide.",
    "El fitxer de la DGT dona com a inici el 12 de desembre de 2025 i només llista els vehicles sense distintiu; l'Ajuntament sanciona des de l'1 de desembre de 2025 i limita la restricció, fins al 30 de desembre de 2027, als no residents. L'horari (feiners de 7 a 19 h) coincideix.",
    "The DGT file gives 12 December 2025 as the start and lists unlabelled vehicles only; the council has fined since 1 December 2025 and limits the restriction, until 30 December 2027, to non-residents. The hours (working days, 7:00 to 19:00) agree.",
  ),
  notPublished: [
    l(
      "Cómo se controla el acceso (cámaras) y qué horario tienen las restricciones a los diésel con etiqueta B en un episodio de NO2: las páginas municipales consultadas no lo dicen.",
      "Com es controla l'accés (càmeres) i quin horari tenen les restriccions als dièsel amb etiqueta B en un episodi de NO2: les pàgines municipals consultades no ho diuen.",
      "How access is enforced (cameras) and what hours the restrictions on diesel B-label vehicles keep during an NO2 episode: the council pages read do not say.",
    ),
    l(
      "El trámite para un vehículo con matrícula extranjera: el Ayuntamiento lo lista como exención sin detallar el procedimiento en las páginas consultadas.",
      "El tràmit per a un vehicle amb matrícula estrangera: l'Ajuntament el llista com a exempció sense detallar-ne el procediment a les pàgines consultades.",
      "The procedure for a foreign-registered vehicle: the council lists it as an exemption without detailing the steps on the pages read.",
    ),
  ],
};

/** In hub order: Catalonia first, then the rest by search demand. */
export const ZBE_CITIES: readonly ZbeCity[] = [BARCELONA, TARRAGONA, GIRONA, REUS];

export function zbeCities(): readonly ZbeCity[] {
  return ZBE_CITIES;
}

export function zbeCityBySlug(slug: string): ZbeCity | null {
  return ZBE_CITIES.find((c) => c.slug === slug) ?? null;
}
