import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
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
 * Article 3 — medieval villages.
 *
 * Rewritten on 24 October 2026 as a practical listicle: a summary table with
 * distance and public transport, a map with every village, and for each one
 * what to see and how to get there. Every fact was read that day on the
 * official page linked in `sources`:
 *
 * - Heritage facts: each council's own tourism page (Besalú, Forallac for
 *   Peratallada, Pals, Montblanc, Santa Pau, Castelló d'Empúries), the
 *   Generalitat's Patrimoni Cultural page for Miravet, Turisme del Priorat for
 *   Siurana, guimera.info and guimeramedieval.cat for Guimerà, and the
 *   Diputació de Barcelona's heritage record for Rupit's suspension bridge.
 * - Transport: TEISA's own timetables (Barcelona–Olot per Banyoles stops at
 *   Besalú; Les Preses–Olot–Santa Pau), Sagalés' line list (462/463/464 Vic–
 *   Rupit), Rodalies' R13/R14 pages and Montblanc's tourism page, and the
 *   "com arribar" pages of Pals, Forallac and Castelló d'Empúries. No
 *   timetables are printed: they change by season.
 * - Opening hours and prices appear only for three sites whose operator
 *   publishes them (Montblanc's wall walk, Miravet castle, Pals' Torre de les
 *   Hores), with the check date beside them.
 * - Distances: the council's own figure where it gives one (Besalú 133 km,
 *   Peratallada 145 km, Rupit 106 km); otherwise an OpenStreetMap road route
 *   from Plaça de Catalunya, rounded to 5 km and labelled approximate.
 *   Map coordinates are the OpenStreetMap village centres.
 *
 * Removed because no current official source supports it: the Miravet river
 * ferry presented as running today, and Castelló's basilica nicknamed "the
 * cathedral of the Empordà" (the council says only that it has the structure
 * and size of a cathedral).
 */

const CHECKED: Record<Locale, string> = {
  ca: "24 d'octubre de 2026",
  es: "24 de octubre de 2026",
  en: "24 October 2026",
};

const BESALU = "https://besalu.cat/patrimoni/patrimoni-arquitectonic/";
const BESALU_ARRIVE = "https://besalu.cat/guia/com-arribar-hi/";
const PERATALLADA = "https://www.visitforallac.cat/ca/pobles/l/5-peratallada.html";
const PERATALLADA_ARRIVE = "https://www.visitforallac.cat/ca/com-arribar.html";
const PALS = "https://www.visitpals.com/ca/descobrir/vila-medieval/";
const PALS_BUS = "https://www.visitpals.com/ca/municipi/com-arribar-a-pals/autobus/";
const MONTBLANC = "https://www.montblancmedieval.cat/que-fer/visita-lliure-a-la-muralla";
const GUIMERA = "https://www.guimera.info/";
const GUIMERA_FAIR = "https://guimeramedieval.cat/";
const RUPIT = "https://www.rupitpruit.cat/turisme/com-arribar-hi";
const SANTA_PAU = "https://santapau.cat/turisme/llocs-dinteres/";
const CASTELLO = "https://castelloempuriabrava.com/que-visitar/call-jueu-2/";
const CASTELLO_ARRIVE = "https://castelloempuriabrava.com/com-arribar/";
const MIRAVET = "https://patrimoni.gencat.cat/ca/monuments/monuments/castell-de-miravet";
const SIURANA = "https://www.turismepriorat.org/en/node/316";
const TEISA = "https://www.teisa-bus.com/";
const SAGALES = "https://www.sagales.com/linies/2/linies-interurbanes";
const RODALIES = "https://rodalies.gencat.cat/ca/sobre-rodalies/linies-i-estacions/servei_regionals/r13/";
const PATRIMONI = "https://patrimoni.gencat.cat/";

/** OpenStreetMap village centres, in the order of the list. */
const POINTS: [string, number, number][] = [
  ["Besalú", 42.1986, 2.696],
  ["Peratallada", 41.9778, 3.0899],
  ["Pals", 41.971, 3.146],
  ["Montblanc", 41.3762, 1.1621],
  ["Guimerà", 41.5647, 1.1835],
  ["Rupit", 42.0243, 2.4654],
  ["Santa Pau", 42.1538, 2.5832],
  ["Castelló d'Empúries", 42.2591, 3.0746],
  ["Miravet", 41.0379, 0.5976],
  ["Siurana", 41.2583, 0.9325],
];

function mapBlock(locale: Locale): Block {
  const title: Record<Locale, string> = {
    ca: "Mapa dels 10 pobles medievals (cada nom obre la ubicació)",
    es: "Mapa de los 10 pueblos medievales (cada nombre abre la ubicación)",
    en: "Map of the 10 medieval villages (each name opens its location)",
  };
  return {
    type: "map",
    latitude: POINTS[0]![1],
    longitude: POINTS[0]![2],
    zoom: 9,
    title: title[locale],
    markers: [],
    points: POINTS.map(([label, latitude, longitude]) => ({ label, latitude, longitude })),
  } as Block;
}

/* -------------------------------------------------------------------------- */
/* Català                                                                     */
/* -------------------------------------------------------------------------- */

function ca(): Block[] {
  return [
    lead(
      "Els pobles medievals de Catalunya que més val la pena visitar són **Besalú, Peratallada, Pals, Montblanc, Guimerà, Rupit, Santa Pau, Castelló d'Empúries, Miravet i Siurana**. Són entre uns 105 i 160 km de Barcelona per carretera, i els més fàcils sense cotxe són Montblanc (tren R13 i R14) i Besalú (bus directe de TEISA).",
    ),
    ...paras(
      "Dos apunts d'honestedat: Montblanc i Castelló d'Empúries són **viles històriques**, no pobles petits, i hi són perquè responen a la mateixa cerca; i Siurana i Miravet valen tant pel paisatge com pel patrimoni. A sota tens el resum, el mapa i, per a cada poble, què veure i com arribar-hi.",
    ),
    table(
      "Els 10 pobles medievals, d'un cop d'ull",
      ["Poble", "Comarca", "Des de Barcelona", "Transport públic", "Imprescindible"],
      [
        ["Besalú", "Garrotxa", "133 km", "Bus TEISA Barcelona–Olot", "Pont de 105 m i micvé"],
        ["Peratallada", "Baix Empordà", "145 km", "Bus, amb pocs serveis", "Fossat excavat a la roca"],
        ["Pals", "Baix Empordà", "≈130 km", "Bus Sarfa des de Barcelona", "Torre de les Hores"],
        ["Montblanc", "Conca de Barberà", "≈115 km", "Tren R13 i R14", "Muralla d'uns 1.500 m"],
        ["Guimerà", "Urgell", "≈115 km", "Cotxe", "Carrers esglaonats i torre"],
        ["Rupit", "Osona (Collsacabra)", "106 km", "Bus Sagalés des de Vic", "Pont penjat i nucli de pedra"],
        ["Santa Pau", "Garrotxa", "≈120 km", "Bus TEISA via Olot", "Plaça porticada del Firal dels Bous"],
        ["Castelló d'Empúries", "Alt Empordà", "≈150 km", "Bus Moventis Sarfa", "Basílica i call jueu"],
        ["Miravet", "Ribera d'Ebre", "≈160 km", "Cotxe", "Castell templer"],
        ["Siurana", "Priorat", "≈145 km", "Cotxe", "Poble sobre el cingle"],
      ],
      "Distàncies per carretera des del centre de Barcelona. Besalú, Peratallada i Rupit, segons els seus ajuntaments; la resta, aproximades (OpenStreetMap). Comprovat el 24 d'octubre de 2026.",
    ),
    mapBlock("ca"),
    ...h2(
      "1. Besalú (Garrotxa)",
      "El **pont** sobre el Fluvià fa **105 metres i set arcs**. Al segle XI ja hi havia un pont romànic, però una riuada del 1315 el va destruir i es va refer, amb la seva torre fortificada. Molta gent hi fa la foto i se'n va, i el valor real és a dins.",
      "Besalú va tenir comunitat jueva des del segle IX fins al 1436. El **micvé**, el bany ritual, és una sala subterrània romànica descoberta el 1964, i les excavacions del 2002 al 2005 van treure a la llum la sinagoga, documentada el 1264, que l'Ajuntament qualifica d'edifici únic a Catalunya i a l'Estat. Completen la visita el monestir de **Sant Pere** (fundat el 977; se'n conserva l'església), **Sant Vicenç** i la **Casa Cornellà**, de finals del segle XII, una de les cases romàniques civils més ben conservades de Catalunya. El conjunt va ser declarat històric-artístic el 1966.",
      `**Com arribar-hi:** en cotxe, 133 km des de Barcelona segons l'Ajuntament. En bus, la línia **Barcelona–Olot per Banyoles de TEISA** para a Besalú ([horaris a teisa-bus.com](${TEISA})). En tren, les estacions més properes són Girona, Figueres i Ripoll. [Com arribar, a besalu.cat](${BESALU_ARRIVE}).`,
    ),
    ...h2(
      "2. Peratallada (Baix Empordà)",
      "El poble tenia **tres recintes emmurallats** (segles XII-XIII), i el principal envoltava el castell. Encara es veu el **fossat excavat a la roca viva**, de 7 o 8 metres de fondària on es conserva. Damunt d'un turó de roca hi ha el castell, amb la torre de l'Homenatge i el palau (segles XI-XIV), i a prop l'església romànica de **Sant Esteve**, de principis del segle XIII. Tot el conjunt és bé cultural d'interès nacional.",
      "El nucli és petit i es fa caminant en poca estona: compensa anar-hi d'hora o al vespre, perquè els caps de setmana els carrers estrets s'omplen.",
      `**Com arribar-hi:** en cotxe, 145 km des de Barcelona per l'AP-7, segons Turisme de Forallac. Hi ha bus des de l'Estació del Nord de Barcelona i des de Girona (Moventis), però amb pocs serveis fins a Peratallada; el cotxe és l'opció pràctica. [Com arribar, a visitforallac.cat](${PERATALLADA_ARRIVE}).`,
    ),
    ...h2(
      "3. Pals (Baix Empordà)",
      "El nucli antic conserva la **muralla**, carrers empedrats i la **Torre de les Hores**, una de les poques restes del castell i emblema del poble. Des del **Mirador Josep Pla** es veu la plana empordanesa amb el Montgrí i les illes Medes al fons. Pals és protegit com a bé cultural d'interès nacional des del 1949.",
      `**Torre de les Hores:** divendres d'11 a 14.30 h; dissabtes, diumenges i festius de 10.30 a 14.30 h i de 15 a 17.30 h (horari publicat per Visit Pals el ${CHECKED.ca}).`,
      `**Com arribar-hi:** bus de **Sarfa** des de l'Estació del Nord de Barcelona i des de l'estació d'autobusos de Girona, segons Visit Pals ([com arribar en bus](${PALS_BUS})). Es combina molt bé amb Peratallada el mateix dia.`,
    ),
    ...h2(
      "4. Montblanc (Conca de Barberà)",
      "La gran singularitat de Montblanc és la **muralla del segle XIV**, que Pere el Cerimoniós va fer aixecar durant la guerra amb Castella: un perímetre d'**uns 1.500 metres amb una trentena de torres** i quatre portals, els de Sant Antoni, Sant Francesc, Sant Jordi i Bové. Una torre és pentagonal, la dels Cinc Cantons.",
      `**Visita a la muralla:** de dimecres a dissabte de 10 a 14 h i de 16 a 18 h; diumenges i festius de 10 a 14 h. Entrada general 3 €, reduïda 1,5 €, gratuïta per a menors de 14 anys. S'hi entra pel portal de Sant Francesc i tanca **del 9 al 23 de desembre** i amb mal temps (Turisme de Montblanc, comprovat el ${CHECKED.ca}).`,
      `**Com arribar-hi:** és el poble medieval de la llista més fàcil sense cotxe: el **tren R13 i R14** de Rodalies hi para ([línies regionals](${RODALIES})), i també hi arriben autobusos de Plana i Monbus. En cotxe, uns 115 km.`,
    ),
    ...h2(
      "5. Guimerà (Urgell)",
      "Els carrers de Guimerà pugen esglaonats cap a la **torre de guaita** i les restes del castell, a la Vall del Corb. És dels pobles que millor ensenyen com era una vila medieval de turó: estreta, vertical i adaptada al terreny. Hi ha l'església de Santa Maria, els portals i el museu, i visites guiades a la vila medieval.",
      `El **Mercat Medieval** es fa el segon cap de setmana d'agost (el 2026 va ser el 8 i el 9 d'agost, la 31a edició, segons [guimeramedieval.cat](${GUIMERA_FAIR})).`,
      `**Com arribar-hi:** no hem trobat cap línia regular útil des de Barcelona; cal cotxe (uns 115 km). Informació: [guimera.info](${GUIMERA}).`,
    ),
    ...h2(
      "6. Rupit (Osona, Collsacabra)",
      "Rupit uneix cases de pedra, carrers estrets i el paisatge del Collsacabra. A l'entrada hi ha el **pont penjat** sobre la riera, inaugurat el 1945 i refet el 1994. El 2022 va ser un dels 32 pobles del món reconeguts com a **Best Tourism Village** per l'ONU Turisme.",
      "Els caps de setmana s'omple: arribar a primera hora canvia completament la visita.",
      `**Com arribar-hi:** en cotxe, **106 km i unes 2 hores** des de Barcelona per la C-17 fins a Vic, la C-25 i la C-153 per Roda de Ter, segons l'Ajuntament. En bus, Sagalés té les línies **462, 463 i 464 de Vic a Rupit** ([línies de Sagalés](${SAGALES})). [Com arribar, a rupitpruit.cat](${RUPIT}).`,
    ),
    ...h2(
      "7. Santa Pau (Garrotxa)",
      "El nucli medieval es va formar al voltant del **castell** (construït entre els segles XIII i XVIII) durant el primer quart del segle XIV. El cor és la **plaça Major o Firal dels Bous**, porticada i d'origen medieval, que deu el nom a la fira de bestiar. El castell, el recinte emmurallat i el conjunt són bé cultural d'interès nacional.",
      "És en plena zona volcànica de la Garrotxa: a prop hi ha la Fageda d'en Jordà i el volcà de Santa Margarida, amb una ermita documentada el 1403 al mig del cràter.",
      `**Com arribar-hi:** en bus, TEISA fins a Olot i la línia **Les Preses–Olot–Santa Pau** de TEISA ([horaris](${TEISA})). En tren, l'Ajuntament recomana anar fins a Girona o Vic i enllaçar amb TEISA cap a Olot. En cotxe, uns 120 km. [Llocs d'interès, a santapau.cat](${SANTA_PAU}).`,
    ),
    ...h2(
      "8. Castelló d'Empúries (Alt Empordà)",
      "Antiga capital del comtat d'Empúries, conserva carrers estrets, restes de muralla i la **basílica de Santa Maria**, començada al segle XIII i acabada a principis del XV, amb estructura i dimensions de catedral i un retaule major d'alabastre del segle XV.",
      "El **call jueu**, documentat des de mitjan segle XIII, va arribar a tenir uns 300 habitants i ocupava els carrers de la Muralla, dels Jueus, del Call, del Calabró, Peixateries Velles i la plaça de la Llana, que encara mantenen la trama medieval.",
      `**Com arribar-hi:** bus **Moventis Sarfa Barcelona–Castelló d'Empúries–Empuriabrava**, o tren fins a Figueres i bus des d'allà, segons l'Ajuntament ([com arribar](${CASTELLO_ARRIVE})). En cotxe, uns 150 km.`,
    ),
    ...h2(
      "9. Miravet (Ribera d'Ebre)",
      "El poble viu sota el **castell de Miravet**, que la Generalitat presenta com un dels millors exemples de l'arquitectura de l'orde del Temple a Europa. Els cristians el van prendre el 1153 i Ramon Berenguer IV el va donar als templers, que el van refer. El nucli vell s'enfila pel pendent sota la fortalesa, sobre l'Ebre.",
      `**Horari del castell:** de dimarts a dissabte, de 10 a 17.30 h de l'1 d'octubre al 30 d'abril i de 10 a 19 h de l'1 de maig al 30 de setembre; diumenges i festius de 10 a 15 h tot l'any. Tanca els dilluns no festius, el 25 i 26 de desembre i l'1 i el 6 de gener. Entrada general 7 €, reduïda 5 €, gratuïta per a menors de 16 anys (Patrimoni Cultural, comprovat el ${CHECKED.ca}).`,
      "**Com arribar-hi:** en cotxe, uns 160 km. No hem trobat cap bus directe des de Barcelona.",
    ),
    ...h2(
      "10. Siurana (Priorat)",
      "Siurana, al municipi de Cornudella de Montsant, va ser **l'últim reducte musulmà de Catalunya**, conquerit entre el 1153 i el 1154. En queden restes del castell àrab i l'església romànica de **Santa Maria** (segles XII-XIII), damunt d'un cingle amb una de les vistes més conegudes del Priorat.",
      "**Com arribar-hi:** en cotxe, uns 145 km; des de Cornudella es pren la carretera cap a Ulldemolins i el trencall de Siurana. L'aparcament és regulat i de pagament, segons Turisme del Priorat.",
    ),
    callout(
      "warning",
      "Horaris i visites",
      "Els horaris d'aquesta guia són els publicats pels operadors el 24 d'octubre de 2026 i canvien per temporada. Els monuments municipals petits obren segons temporada i disponibilitat: comprova-ho a l'oficina de turisme abans de sortir.",
    ),
    ...h2(
      "Rutes: quins pobles medievals combinar",
      "Hi ha combinacions que es fan bé en un dia perquè els pobles són a la mateixa comarca o a la del costat:",
    ),
    list(
      "**Empordà:** Pals i Peratallada (Baix Empordà), i si tens temps, Castelló d'Empúries.",
      "**Garrotxa:** Besalú i Santa Pau, amb la zona volcànica entremig.",
      "**Sud:** Siurana (Priorat) i Miravet (Ribera d'Ebre), per a un cap de setmana.",
      "**Sense cotxe:** Montblanc en tren, o Besalú en el bus de TEISA.",
    ),
    ...paras(
      `Si busques patrimoni encara menys transitat, ${link("surprising", "ca", "tenim quinze llocs que la majoria de visitants no coneixen")}. Per a més escapades sense cotxe, ${link("trains", "ca", "aquestes dotze es fan en tren")}, i si el dia surt plujós, ${link("rainy", "ca", "aquí tens plans a cobert")}.`,
      `La fitxa patrimonial de bona part d'aquests conjunts es pot consultar al catàleg de [Patrimoni Cultural de la Generalitat](${PATRIMONI}).`,
    ),
    {
      type: "faq",
      items: [
        {
          question: "Quins són els pobles medievals més bonics de Catalunya?",
          answer:
            "Els deu d'aquesta guia: Besalú, Peratallada, Pals, Montblanc, Guimerà, Rupit, Santa Pau, Castelló d'Empúries, Miravet i Siurana. Peratallada, Pals i Santa Pau tenen el conjunt protegit com a bé cultural d'interès nacional.",
        },
        {
          question: "Quins pobles medievals es poden visitar sense cotxe des de Barcelona?",
          answer:
            "Montblanc (tren R13 i R14), Besalú (bus TEISA Barcelona–Olot per Banyoles), Pals i Castelló d'Empúries (bus Sarfa), Santa Pau (TEISA via Olot) i Rupit (Sagalés des de Vic).",
        },
        {
          question: "Quin és el poble medieval més a prop de Barcelona d'aquesta llista?",
          answer: "Rupit, a 106 km per carretera segons l'Ajuntament, seguit de Montblanc i Guimerà, a uns 115 km.",
        },
        {
          question: "Quant costa visitar la muralla de Montblanc?",
          answer:
            "3 € l'entrada general i 1,5 € la reduïda; és gratuïta per a menors de 14 anys. Obre de dimecres a diumenge i festius, i tanca del 9 al 23 de desembre.",
        },
      ],
    } as Block,
    ...relatedBlocks(["surprising", "montserrat", "trains", "castanyada", "rainy"], "ca"),
  ];
}

/* -------------------------------------------------------------------------- */
/* Castellano                                                                 */
/* -------------------------------------------------------------------------- */

function es(): Block[] {
  return [
    lead(
      "Los pueblos medievales de Cataluña que más vale la pena visitar son **Besalú, Peratallada, Pals, Montblanc, Guimerà, Rupit, Santa Pau, Castelló d'Empúries, Miravet y Siurana**. Están a entre unos 105 y 160 km de Barcelona por carretera, y los más fáciles sin coche son Montblanc (tren R13 y R14) y Besalú (bus directo de TEISA).",
    ),
    ...paras(
      "Dos apuntes de honestidad: Montblanc y Castelló d'Empúries son **villas históricas**, no pueblos pequeños, y están porque responden a la misma búsqueda; y Siurana y Miravet valen tanto por el paisaje como por el patrimonio. Abajo tienes el resumen, el mapa y, para cada pueblo, qué ver y cómo llegar.",
    ),
    table(
      "Los 10 pueblos medievales, de un vistazo",
      ["Pueblo", "Comarca", "Desde Barcelona", "Transporte público", "Imprescindible"],
      [
        ["Besalú", "Garrotxa", "133 km", "Bus TEISA Barcelona–Olot", "Puente de 105 m y micvé"],
        ["Peratallada", "Baix Empordà", "145 km", "Bus, con pocos servicios", "Foso excavado en la roca"],
        ["Pals", "Baix Empordà", "≈130 km", "Bus Sarfa desde Barcelona", "Torre de les Hores"],
        ["Montblanc", "Conca de Barberà", "≈115 km", "Tren R13 y R14", "Muralla de unos 1.500 m"],
        ["Guimerà", "Urgell", "≈115 km", "Coche", "Calles escalonadas y torre"],
        ["Rupit", "Osona (Collsacabra)", "106 km", "Bus Sagalés desde Vic", "Puente colgante y casco de piedra"],
        ["Santa Pau", "Garrotxa", "≈120 km", "Bus TEISA vía Olot", "Plaza porticada del Firal dels Bous"],
        ["Castelló d'Empúries", "Alt Empordà", "≈150 km", "Bus Moventis Sarfa", "Basílica y call judío"],
        ["Miravet", "Ribera d'Ebre", "≈160 km", "Coche", "Castillo templario"],
        ["Siurana", "Priorat", "≈145 km", "Coche", "Pueblo sobre el risco"],
      ],
      "Distancias por carretera desde el centro de Barcelona. Besalú, Peratallada y Rupit, según sus ayuntamientos; el resto, aproximadas (OpenStreetMap). Comprobado el 24 de octubre de 2026.",
    ),
    mapBlock("es"),
    ...h2(
      "1. Besalú (Garrotxa)",
      "El **puente** sobre el Fluvià mide **105 metros y tiene siete arcos**. En el siglo XI ya había un puente románico, pero una riada de 1315 lo destruyó y se rehízo, con su torre fortificada. Mucha gente hace la foto y se va, y lo mejor está dentro.",
      "Besalú tuvo comunidad judía desde el siglo IX hasta 1436. El **micvé**, el baño ritual, es una sala subterránea románica descubierta en 1964, y las excavaciones de 2002 a 2005 sacaron a la luz la sinagoga, documentada en 1264, que el Ayuntamiento califica de edificio único en Cataluña y en España. Completan la visita el monasterio de **Sant Pere** (fundado en 977; se conserva la iglesia), **Sant Vicenç** y la **Casa Cornellà**, de finales del siglo XII, una de las casas civiles románicas mejor conservadas de Cataluña. El conjunto fue declarado histórico-artístico en 1966.",
      `**Cómo llegar:** en coche, 133 km desde Barcelona según el Ayuntamiento. En bus, la línea **Barcelona–Olot por Banyoles de TEISA** para en Besalú ([horarios en teisa-bus.com](${TEISA})). En tren, las estaciones más cercanas son Girona, Figueres y Ripoll. [Cómo llegar, en besalu.cat](${BESALU_ARRIVE}).`,
    ),
    ...h2(
      "2. Peratallada (Baix Empordà)",
      "El pueblo tenía **tres recintos amurallados** (siglos XII-XIII), y el principal rodeaba el castillo. Todavía se ve el **foso excavado en la roca viva**, de 7 u 8 metros de profundidad donde se conserva. Sobre un montículo de roca está el castillo, con la torre del Homenaje y el palacio (siglos XI-XIV), y cerca la iglesia románica de **Sant Esteve**, de principios del siglo XIII. Todo el conjunto es bien cultural de interés nacional.",
      "El casco es pequeño y se recorre andando en poco rato: compensa ir temprano o al atardecer, porque los fines de semana las calles estrechas se llenan.",
      `**Cómo llegar:** en coche, 145 km desde Barcelona por la AP-7, según Turisme de Forallac. Hay bus desde la Estació del Nord de Barcelona y desde Girona (Moventis), pero con pocos servicios hasta Peratallada; el coche es la opción práctica. [Cómo llegar, en visitforallac.cat](${PERATALLADA_ARRIVE}).`,
    ),
    ...h2(
      "3. Pals (Baix Empordà)",
      "El casco antiguo conserva la **muralla**, calles empedradas y la **Torre de les Hores**, uno de los pocos restos del castillo y emblema del pueblo. Desde el **Mirador Josep Pla** se ve la llanura ampurdanesa con el Montgrí y las islas Medes al fondo. Pals está protegido como bien cultural de interés nacional desde 1949.",
      `**Torre de les Hores:** viernes de 11 a 14.30 h; sábados, domingos y festivos de 10.30 a 14.30 h y de 15 a 17.30 h (horario publicado por Visit Pals el ${CHECKED.es}).`,
      `**Cómo llegar:** bus de **Sarfa** desde la Estació del Nord de Barcelona y desde la estación de autobuses de Girona, según Visit Pals ([cómo llegar en bus](${PALS_BUS})). Se combina muy bien con Peratallada el mismo día.`,
    ),
    ...h2(
      "4. Montblanc (Conca de Barberà)",
      "La gran singularidad de Montblanc es la **muralla del siglo XIV**, que Pedro el Ceremonioso mandó levantar durante la guerra con Castilla: un perímetro de **unos 1.500 metros con una treintena de torres** y cuatro portales, los de Sant Antoni, Sant Francesc, Sant Jordi y Bové. Una torre es pentagonal, la dels Cinc Cantons.",
      `**Visita a la muralla:** de miércoles a sábado de 10 a 14 h y de 16 a 18 h; domingos y festivos de 10 a 14 h. Entrada general 3 €, reducida 1,5 €, gratuita para menores de 14 años. Se accede por el portal de Sant Francesc y cierra **del 9 al 23 de diciembre** y con mal tiempo (Turisme de Montblanc, comprobado el ${CHECKED.es}).`,
      `**Cómo llegar:** es el pueblo medieval de la lista más fácil sin coche: el **tren R13 y R14** de Rodalies para en Montblanc ([líneas regionales](${RODALIES})), y también llegan autobuses de Plana y Monbus. En coche, unos 115 km.`,
    ),
    ...h2(
      "5. Guimerà (Urgell)",
      "Las calles de Guimerà suben escalonadas hacia la **torre de vigía** y los restos del castillo, en la Vall del Corb. Es de los pueblos que mejor enseñan cómo era una villa medieval de colina: estrecha, vertical y adaptada al terreno. Tiene la iglesia de Santa Maria, los portales, el museo y visitas guiadas a la villa medieval.",
      `El **Mercado Medieval** se celebra el segundo fin de semana de agosto (en 2026 fue el 8 y el 9 de agosto, la 31.ª edición, según [guimeramedieval.cat](${GUIMERA_FAIR})).`,
      `**Cómo llegar:** no hemos encontrado ninguna línea regular útil desde Barcelona; hace falta coche (unos 115 km). Información: [guimera.info](${GUIMERA}).`,
    ),
    ...h2(
      "6. Rupit (Osona, Collsacabra)",
      "Rupit une casas de piedra, calles estrechas y el paisaje del Collsacabra. A la entrada está el **puente colgante** sobre la riera, inaugurado en 1945 y rehecho en 1994. En 2022 fue uno de los 32 pueblos del mundo reconocidos como **Best Tourism Village** por ONU Turismo.",
      "Los fines de semana se llena: llegar a primera hora cambia por completo la visita.",
      `**Cómo llegar:** en coche, **106 km y unas 2 horas** desde Barcelona por la C-17 hasta Vic, la C-25 y la C-153 por Roda de Ter, según el Ayuntamiento. En bus, Sagalés tiene las líneas **462, 463 y 464 de Vic a Rupit** ([líneas de Sagalés](${SAGALES})). [Cómo llegar, en rupitpruit.cat](${RUPIT}).`,
    ),
    ...h2(
      "7. Santa Pau (Garrotxa)",
      "El núcleo medieval se formó alrededor del **castillo** (construido entre los siglos XIII y XVIII) durante el primer cuarto del siglo XIV. El corazón es la **plaza Mayor o Firal dels Bous**, porticada y de origen medieval, que debe el nombre a la feria de ganado. El castillo, el recinto amurallado y el conjunto son bien cultural de interés nacional.",
      "Está en plena zona volcánica de la Garrotxa: cerca están la Fageda d'en Jordà y el volcán de Santa Margarida, con una ermita documentada en 1403 en medio del cráter.",
      `**Cómo llegar:** en bus, TEISA hasta Olot y la línea **Les Preses–Olot–Santa Pau** de TEISA ([horarios](${TEISA})). En tren, el Ayuntamiento recomienda ir hasta Girona o Vic y enlazar con TEISA hacia Olot. En coche, unos 120 km. [Lugares de interés, en santapau.cat](${SANTA_PAU}).`,
    ),
    ...h2(
      "8. Castelló d'Empúries (Alt Empordà)",
      "Antigua capital del condado de Empúries, conserva calles estrechas, restos de muralla y la **basílica de Santa Maria**, empezada en el siglo XIII y terminada a principios del XV, con estructura y dimensiones de catedral y un retablo mayor de alabastro del siglo XV.",
      "El **call judío**, documentado desde mediados del siglo XIII, llegó a tener unos 300 habitantes y ocupaba las calles de la Muralla, dels Jueus, del Call, del Calabró, Peixateries Velles y la plaza de la Llana, que aún mantienen la trama medieval.",
      `**Cómo llegar:** bus **Moventis Sarfa Barcelona–Castelló d'Empúries–Empuriabrava**, o tren hasta Figueres y bus desde allí, según el Ayuntamiento ([cómo llegar](${CASTELLO_ARRIVE})). En coche, unos 150 km.`,
    ),
    ...h2(
      "9. Miravet (Ribera d'Ebre)",
      "El pueblo vive bajo el **castillo de Miravet**, que la Generalitat presenta como uno de los mejores ejemplos de la arquitectura de la orden del Temple en Europa. Los cristianos lo tomaron en 1153 y Ramon Berenguer IV lo cedió a los templarios, que lo rehicieron. El casco viejo trepa por la pendiente bajo la fortaleza, sobre el Ebro.",
      `**Horario del castillo:** de martes a sábado, de 10 a 17.30 h del 1 de octubre al 30 de abril y de 10 a 19 h del 1 de mayo al 30 de septiembre; domingos y festivos de 10 a 15 h todo el año. Cierra los lunes no festivos, el 25 y 26 de diciembre y el 1 y el 6 de enero. Entrada general 7 €, reducida 5 €, gratuita para menores de 16 años (Patrimoni Cultural, comprobado el ${CHECKED.es}).`,
      "**Cómo llegar:** en coche, unos 160 km. No hemos encontrado ningún bus directo desde Barcelona.",
    ),
    ...h2(
      "10. Siurana (Priorat)",
      "Siurana, en el municipio de Cornudella de Montsant, fue **el último reducto musulmán de Cataluña**, conquistado entre 1153 y 1154. Quedan restos del castillo árabe y la iglesia románica de **Santa Maria** (siglos XII-XIII), sobre un risco con una de las vistas más conocidas del Priorat.",
      "**Cómo llegar:** en coche, unos 145 km; desde Cornudella se toma la carretera hacia Ulldemolins y el desvío de Siurana. El aparcamiento está regulado y es de pago, según Turisme del Priorat.",
    ),
    callout(
      "warning",
      "Horarios y visitas",
      "Los horarios de esta guía son los publicados por los operadores el 24 de octubre de 2026 y cambian por temporada. Los monumentos municipales pequeños abren según temporada y disponibilidad: compruébalo en la oficina de turismo antes de salir.",
    ),
    ...h2(
      "Rutas: qué pueblos medievales combinar",
      "Hay combinaciones que salen bien en un día porque los pueblos están en la misma comarca o en la de al lado:",
    ),
    list(
      "**Empordà:** Pals y Peratallada (Baix Empordà) y, si hay tiempo, Castelló d'Empúries.",
      "**Garrotxa:** Besalú y Santa Pau, con la zona volcánica en medio.",
      "**Sur:** Siurana (Priorat) y Miravet (Ribera d'Ebre), para un fin de semana.",
      "**Sin coche:** Montblanc en tren, o Besalú en el bus de TEISA.",
    ),
    ...paras(
      `Si buscas patrimonio aún menos transitado, ${link("surprising", "es", "tenemos quince lugares que la mayoría de visitantes no conoce")}. Para más escapadas sin coche, ${link("trains", "es", "estas doce se hacen en tren")}, y si el día sale lluvioso, ${link("rainy", "es", "aquí tienes planes a cubierto")}.`,
      `La ficha patrimonial de buena parte de estos conjuntos puede consultarse en el catálogo de [Patrimoni Cultural de la Generalitat](${PATRIMONI}).`,
    ),
    {
      type: "faq",
      items: [
        {
          question: "¿Cuáles son los pueblos medievales más bonitos de Cataluña?",
          answer:
            "Los diez de esta guía: Besalú, Peratallada, Pals, Montblanc, Guimerà, Rupit, Santa Pau, Castelló d'Empúries, Miravet y Siurana. Peratallada, Pals y Santa Pau tienen el conjunto protegido como bien cultural de interés nacional.",
        },
        {
          question: "¿Qué pueblos medievales se pueden visitar sin coche desde Barcelona?",
          answer:
            "Montblanc (tren R13 y R14), Besalú (bus TEISA Barcelona–Olot por Banyoles), Pals y Castelló d'Empúries (bus Sarfa), Santa Pau (TEISA vía Olot) y Rupit (Sagalés desde Vic).",
        },
        {
          question: "¿Cuál es el pueblo medieval más cercano a Barcelona de esta lista?",
          answer: "Rupit, a 106 km por carretera según el Ayuntamiento, seguido de Montblanc y Guimerà, a unos 115 km.",
        },
        {
          question: "¿Cuánto cuesta visitar la muralla de Montblanc?",
          answer:
            "3 € la entrada general y 1,5 € la reducida; es gratuita para menores de 14 años. Abre de miércoles a domingo y festivos, y cierra del 9 al 23 de diciembre.",
        },
      ],
    } as Block,
    ...relatedBlocks(["surprising", "montserrat", "trains", "castanyada", "rainy"], "es"),
  ];
}

/* -------------------------------------------------------------------------- */
/* English                                                                    */
/* -------------------------------------------------------------------------- */

function en(): Block[] {
  return [
    lead(
      "The medieval villages most worth visiting in Catalonia are **Besalú, Peratallada, Pals, Montblanc, Guimerà, Rupit, Santa Pau, Castelló d'Empúries, Miravet and Siurana**. They are roughly 105 to 160 km from Barcelona by road, and the easiest without a car are Montblanc (R13 and R14 trains) and Besalú (direct TEISA bus).",
    ),
    ...paras(
      "A note on Catalan geography. The **Empordà** is the coastal plain in the north-east, near Girona. **La Garrotxa** is the volcanic region inland from it. The **Priorat** is wine country in the south, and the **Ribera d'Ebre** follows the river Ebro. A **call** is a medieval Jewish quarter.",
      "Two honest qualifications: Montblanc and Castelló d'Empúries are historic **towns** rather than small villages, included because they answer the same question; and Siurana and Miravet are worth the trip as much for the setting as for the buildings. Below: a summary, a map, and for each village what to see and how to get there.",
    ),
    table(
      "The 10 medieval villages at a glance",
      ["Village", "Region", "From Barcelona", "Public transport", "Don't miss"],
      [
        ["Besalú", "Garrotxa", "133 km", "TEISA bus Barcelona–Olot", "105 m bridge and mikveh"],
        ["Peratallada", "Baix Empordà", "145 km", "Bus, few services", "Moat cut into the rock"],
        ["Pals", "Baix Empordà", "≈130 km", "Sarfa bus from Barcelona", "Torre de les Hores"],
        ["Montblanc", "Conca de Barberà", "≈115 km", "R13 and R14 trains", "Town wall of about 1,500 m"],
        ["Guimerà", "Urgell", "≈115 km", "Car", "Stepped streets and tower"],
        ["Rupit", "Osona (Collsacabra)", "106 km", "Sagalés bus from Vic", "Suspension bridge, stone village"],
        ["Santa Pau", "Garrotxa", "≈120 km", "TEISA bus via Olot", "Arcaded Firal dels Bous square"],
        ["Castelló d'Empúries", "Alt Empordà", "≈150 km", "Moventis Sarfa bus", "Basilica and Jewish quarter"],
        ["Miravet", "Ribera d'Ebre", "≈160 km", "Car", "Templar castle"],
        ["Siurana", "Priorat", "≈145 km", "Car", "Clifftop village"],
      ],
      "Road distances from central Barcelona. Besalú, Peratallada and Rupit as given by their councils; the rest approximate (OpenStreetMap). Checked on 24 October 2026.",
    ),
    mapBlock("en"),
    ...h2(
      "1. Besalú (Garrotxa)",
      "The **bridge** over the Fluvià is **105 metres long with seven arches**. There was a Romanesque bridge here by the 11th century, but a flood in 1315 destroyed it and it was rebuilt, with its fortified tower. Many visitors take the photo and leave, and the best part is inside.",
      "Besalú had a Jewish community from the 9th century until 1436. The **mikveh**, the ritual bath, is an underground Romanesque room found in 1964, and excavations from 2002 to 2005 uncovered the synagogue, documented in 1264, which the council describes as a building unique in Catalonia and in Spain. Add the monastery of **Sant Pere** (founded in 977; its church survives), **Sant Vicenç** and the **Casa Cornellà**, from the late 12th century, one of the best-preserved Romanesque houses in Catalonia. The town was declared a historic-artistic ensemble in 1966.",
      `**Getting there:** by car, 133 km from Barcelona according to the council. By bus, **TEISA's Barcelona–Olot via Banyoles** line stops in Besalú ([timetables at teisa-bus.com](${TEISA})). By train, the nearest stations are Girona, Figueres and Ripoll. [How to get there, besalu.cat](${BESALU_ARRIVE}).`,
    ),
    ...h2(
      "2. Peratallada (Baix Empordà)",
      "The village had **three walled enclosures** (12th–13th centuries), the main one around the castle. You can still see the **moat cut into the living rock**, 7 to 8 metres deep where it survives. On a rocky mound stand the castle, with its keep and palace (11th–14th centuries), and nearby the Romanesque church of **Sant Esteve**, from the early 13th century. The whole village is a listed heritage site of national interest.",
      "It is small and quick to walk round, so go early or late: at weekends the narrow lanes fill up.",
      `**Getting there:** by car, 145 km from Barcelona via the AP-7, according to Forallac's tourist office. There are buses from Barcelona's Estació del Nord and from Girona (Moventis), but few services reach Peratallada itself, so a car is the practical option. [How to get there, visitforallac.cat](${PERATALLADA_ARRIVE}).`,
    ),
    ...h2(
      "3. Pals (Baix Empordà)",
      "The old town keeps its **walls**, cobbled streets and the **Torre de les Hores**, one of the few remains of the castle and the village's emblem. The **Mirador Josep Pla** looks over the Empordà plain to the Montgrí massif and the Medes Islands. Pals has been protected as a heritage site of national interest since 1949.",
      `**Torre de les Hores:** Fridays 11:00–14:30; Saturdays, Sundays and holidays 10:30–14:30 and 15:00–17:30 (hours published by Visit Pals on ${CHECKED.en}).`,
      `**Getting there:** **Sarfa** buses from Barcelona's Estació del Nord and from Girona bus station, according to Visit Pals ([by bus](${PALS_BUS})). It pairs naturally with Peratallada on the same day.`,
    ),
    ...h2(
      "4. Montblanc (Conca de Barberà)",
      "Montblanc's distinction is its **14th-century wall**, raised on the orders of King Peter the Ceremonious during the war with Castile: a perimeter of **about 1,500 metres with some thirty towers** and four gates, Sant Antoni, Sant Francesc, Sant Jordi and Bové. One tower is pentagonal, the Torre dels Cinc Cantons.",
      `**Wall walk:** Wednesday to Saturday 10:00–14:00 and 16:00–18:00; Sundays and holidays 10:00–14:00. Adults €3, reduced €1.50, free for under-14s. Entry is at the Portal de Sant Francesc; closed **9 to 23 December** and in bad weather (Montblanc tourist office, checked on ${CHECKED.en}).`,
      `**Getting there:** the easiest village on this list without a car: Rodalies **R13 and R14** trains stop in Montblanc ([regional lines](${RODALIES})), and Plana and Monbus buses also serve it. By car, about 115 km.`,
    ),
    ...h2(
      "5. Guimerà (Urgell)",
      "Guimerà's streets climb in steps towards the **watchtower** and the remains of the castle, in the Vall del Corb. Few places show better what a medieval hill village was like: narrow, vertical and shaped by the terrain. There is the church of Santa Maria, the old gates, a museum, and guided tours of the medieval village.",
      `The **Medieval Market** is held on the second weekend of August (in 2026 on 8 and 9 August, the 31st edition, according to [guimeramedieval.cat](${GUIMERA_FAIR})).`,
      `**Getting there:** we found no useful scheduled service from Barcelona; you need a car (about 115 km). Information: [guimera.info](${GUIMERA}).`,
    ),
    ...h2(
      "6. Rupit (Osona, Collsacabra)",
      "Rupit combines stone houses, narrow lanes and the cliffs of the Collsacabra. At the entrance is the **suspension footbridge** over the stream, opened in 1945 and rebuilt in 1994. In 2022 it was one of 32 villages worldwide named a **Best Tourism Village** by UN Tourism.",
      "It is busy at weekends, so arriving early changes the visit completely.",
      `**Getting there:** by car, **106 km and about 2 hours** from Barcelona via the C-17 to Vic, the C-25 and the C-153 through Roda de Ter, according to the council. By bus, Sagalés runs lines **462, 463 and 464 from Vic to Rupit** ([Sagalés lines](${SAGALES})). [How to get there, rupitpruit.cat](${RUPIT}).`,
    ),
    ...h2(
      "7. Santa Pau (Garrotxa)",
      "The medieval village grew around the **castle** (built in stages between the 13th and 18th centuries) in the first quarter of the 14th century. Its heart is the arcaded **Plaça Major, or Firal dels Bous**, medieval in origin and named after the livestock fair. The castle, the walled enclosure and the village are listed heritage of national interest.",
      "It lies in the heart of the Garrotxa volcanic zone, close to the Fageda d'en Jordà beech wood and the Santa Margarida volcano, with a chapel documented in 1403 in the middle of the crater.",
      `**Getting there:** by bus, TEISA to Olot and then TEISA's **Les Preses–Olot–Santa Pau** line ([timetables](${TEISA})). By train, the council suggests going to Girona or Vic and connecting with TEISA buses to Olot. By car, about 120 km. [Places of interest, santapau.cat](${SANTA_PAU}).`,
    ),
    ...h2(
      "8. Castelló d'Empúries (Alt Empordà)",
      "The former capital of the counts of Empúries keeps narrow streets, sections of wall and the **basilica of Santa Maria**, begun in the 13th century and finished in the early 15th, with the structure and size of a cathedral and a 15th-century alabaster high altarpiece.",
      "The **Jewish quarter**, documented from the mid-13th century, had about 300 inhabitants at its height and covered the streets of la Muralla, dels Jueus, del Call, del Calabró, Peixateries Velles and the plaça de la Llana, which still follow the medieval layout.",
      `**Getting there:** **Moventis Sarfa** buses Barcelona–Castelló d'Empúries–Empuriabrava, or train to Figueres and a bus from there, according to the council ([how to get there](${CASTELLO_ARRIVE})). By car, about 150 km.`,
    ),
    ...h2(
      "9. Miravet (Ribera d'Ebre)",
      "The village sits beneath **Miravet castle**, which the Generalitat calls one of the finest examples of Knights Templar architecture in Europe. Christian forces took it in 1153 and Count Ramon Berenguer IV gave it to the Templars, who rebuilt it. The old village climbs the slope below the fortress, above the Ebro.",
      `**Castle hours:** Tuesday to Saturday, 10:00–17:30 from 1 October to 30 April and 10:00–19:00 from 1 May to 30 September; Sundays and holidays 10:00–15:00 all year. Closed on Mondays that are not holidays, on 25 and 26 December and on 1 and 6 January. Adults €7, reduced €5, free for under-16s (Patrimoni Cultural, checked on ${CHECKED.en}).`,
      "**Getting there:** by car, about 160 km. We found no direct bus from Barcelona.",
    ),
    ...h2(
      "10. Siurana (Priorat)",
      "Siurana, in the municipality of Cornudella de Montsant, was **the last Muslim stronghold in Catalonia**, conquered between 1153 and 1154. Remains of the Arab castle survive, with the Romanesque church of **Santa Maria** (12th–13th centuries), on a clifftop with one of the best-known views in the Priorat.",
      "**Getting there:** by car, about 145 km; from Cornudella take the road towards Ulldemolins and the turn-off for Siurana. Parking is regulated and paid, according to the Priorat tourist board.",
    ),
    callout(
      "warning",
      "Opening hours",
      "The hours in this guide are those the operators published on 24 October 2026, and they change with the season. Small municipal monuments open by season and availability, so check with the local tourist office before setting out.",
    ),
    ...h2(
      "Routes: which medieval villages to combine",
      "Some pairs work well in a day because the villages are in the same or neighbouring regions:",
    ),
    list(
      "**Empordà:** Pals and Peratallada (Baix Empordà), plus Castelló d'Empúries if you have time.",
      "**Garrotxa:** Besalú and Santa Pau, with the volcanic zone in between.",
      "**The south:** Siurana (Priorat) and Miravet (Ribera d'Ebre), for a weekend.",
      "**Without a car:** Montblanc by train, or Besalú on the TEISA bus.",
    ),
    ...paras(
      `For heritage even fewer people reach, ${link("surprising", "en", "we have fifteen places most visitors miss")}. For more trips without a car, ${link("trains", "en", "these twelve are all doable by train")}, and if the weather turns, ${link("rainy", "en", "here are indoor plans")}.`,
      `Heritage records for most of these sites are in the Generalitat's [Patrimoni Cultural catalogue](${PATRIMONI}).`,
    ),
    {
      type: "faq",
      items: [
        {
          question: "What are the most beautiful medieval villages in Catalonia?",
          answer:
            "The ten in this guide: Besalú, Peratallada, Pals, Montblanc, Guimerà, Rupit, Santa Pau, Castelló d'Empúries, Miravet and Siurana. Peratallada, Pals and Santa Pau are protected as heritage ensembles of national interest.",
        },
        {
          question: "Which medieval villages can you reach from Barcelona without a car?",
          answer:
            "Montblanc (R13 and R14 trains), Besalú (TEISA bus Barcelona–Olot via Banyoles), Pals and Castelló d'Empúries (Sarfa buses), Santa Pau (TEISA via Olot) and Rupit (Sagalés from Vic).",
        },
        {
          question: "Which medieval village on this list is closest to Barcelona?",
          answer: "Rupit, 106 km by road according to its council, followed by Montblanc and Guimerà at about 115 km.",
        },
        {
          question: "What are Miravet castle's opening hours?",
          answer:
            "Tuesday to Saturday 10:00–17:30 from October to April and 10:00–19:00 from May to September; Sundays and holidays 10:00–15:00. Closed on non-holiday Mondays. Adults €7.",
        },
      ],
    } as Block,
    ...relatedBlocks(["surprising", "montserrat", "trains", "rainy", "castanyada"], "en"),
  ];
}

export const MEDIEVAL: FeatureArticle = {
  key: "medieval",
  entryKey: "feature-medieval-villages",
  categoryKey: "villages",
  heroKey: "medieval-hero",
  secondaryKey: "medieval-second",
  heroAlt: {
    ca: "El pont medieval de Besalú sobre el riu Fluvià",
    es: "El puente medieval de Besalú sobre el río Fluvià",
    en: "The medieval bridge of Besalú over the river Fluvià",
  },
  heroCaption: {
    ca: "El pont medieval de Besalú, sobre el Fluvià.",
    es: "El puente medieval de Besalú, sobre el Fluvià.",
    en: "The medieval bridge at Besalú, over the river Fluvià.",
  },
  secondaryAlt: {
    ca: "La muralla de Montblanc, a la Conca de Barberà",
    es: "La muralla de Montblanc, en la Conca de Barberà",
    en: "The town walls of Montblanc, in the Conca de Barberà",
  },
  secondaryCaption: {
    ca: "La muralla de Montblanc, del segle XIV, amb un perímetre d'uns 1.500 metres.",
    es: "La muralla de Montblanc, del siglo XIV, con un perímetro de unos 1.500 metros.",
    en: "Montblanc's 14th-century walls, with a perimeter of about 1,500 metres.",
  },
  sources: [
    { name: "Patrimoni arquitectònic de Besalú", url: BESALU, publisher: "Ajuntament de Besalú" },
    { name: "Com arribar a Besalú", url: BESALU_ARRIVE, publisher: "Ajuntament de Besalú" },
    { name: "Peratallada", url: PERATALLADA, publisher: "Turisme de Forallac" },
    { name: "Com arribar a Forallac", url: PERATALLADA_ARRIVE, publisher: "Turisme de Forallac" },
    { name: "Vila medieval de Pals", url: PALS, publisher: "Visit Pals" },
    { name: "Com arribar a Pals en autobús", url: PALS_BUS, publisher: "Visit Pals" },
    { name: "Visita lliure a la muralla", url: MONTBLANC, publisher: "Turisme de Montblanc" },
    { name: "Línia R13", url: RODALIES, publisher: "Rodalies de Catalunya" },
    { name: "Guimerà", url: GUIMERA, publisher: "guimera.info" },
    { name: "Fira Medieval de Guimerà", url: GUIMERA_FAIR, publisher: "Comissió de la Fira Medieval de Guimerà" },
    { name: "Com arribar a Rupit", url: RUPIT, publisher: "Ajuntament de Rupit i Pruit" },
    { name: "Línies interurbanes", url: SAGALES, publisher: "Sagalés" },
    { name: "Llocs d'interès de Santa Pau", url: SANTA_PAU, publisher: "Ajuntament de Santa Pau" },
    { name: "Línies i horaris", url: TEISA, publisher: "TEISA" },
    { name: "Call jueu de Castelló d'Empúries", url: CASTELLO, publisher: "Ajuntament de Castelló d'Empúries" },
    { name: "Com arribar a Castelló d'Empúries", url: CASTELLO_ARRIVE, publisher: "Ajuntament de Castelló d'Empúries" },
    { name: "Castell de Miravet", url: MIRAVET, publisher: "Agència Catalana del Patrimoni Cultural" },
    { name: "Siurana", url: SIURANA, publisher: "Turisme del Priorat" },
    { name: "Patrimoni Cultural de Catalunya", url: PATRIMONI, publisher: "Generalitat de Catalunya" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.medieval.ca,
      title: "Pobles medievals de Catalunya: 10 imprescindibles, amb mapa i com arribar-hi",
      seoTitle: "Pobles medievals de Catalunya: 10 imprescindibles i mapa",
      seoDescription:
        "Els 10 pobles medievals de Catalunya que val la pena visitar, amb mapa, distància des de Barcelona, com arribar-hi en bus o tren i què veure a cadascun.",
      excerpt:
        "Besalú, Peratallada, Pals, Montblanc, Rupit, Siurana i quatre més: on són, a quants quilòmetres de Barcelona, com arribar-hi i què veure a cadascun.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.medieval.es,
      title: "Pueblos medievales de Cataluña: 10 imprescindibles, con mapa y cómo llegar",
      seoTitle: "Pueblos medievales de Cataluña: 10 imprescindibles y mapa",
      seoDescription:
        "Los 10 pueblos medievales de Cataluña que vale la pena visitar, con mapa, distancia desde Barcelona, cómo llegar en bus o tren y qué ver en cada uno.",
      excerpt:
        "Besalú, Peratallada, Pals, Montblanc, Rupit, Siurana y cuatro más: dónde están, a cuántos kilómetros de Barcelona, cómo llegar y qué ver en cada uno.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.medieval.en,
      title: "10 medieval villages in Catalonia: map, how to get there and what to see",
      seoTitle: "Medieval villages in Catalonia: 10 best, map and transport",
      seoDescription:
        "The 10 medieval villages in Catalonia most worth visiting, with a map, distance from Barcelona, how to get there by bus or train and what to see.",
      excerpt:
        "Besalú, Peratallada, Pals, Montblanc, Rupit, Siurana and four more: where they are, how far from Barcelona, how to get there and what to see in each.",
      blocks: en(),
    },
  },
};
