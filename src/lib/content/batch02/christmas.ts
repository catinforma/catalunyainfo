import type { Locale } from "@/lib/i18n/config";
import { weekendHubPath } from "@/lib/programmatic/weekend/paths";

import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Christmas markets in Catalonia (roadmap P08, backlog #21).
 *
 * Re-checked on 24 October 2026 against each organiser's own page. A 2026 date
 * goes in only when the organiser has published it. For the big markets that
 * have not (Santa Llúcia, Sagrada Família, Girona, Figueres, Lleida, Manresa,
 * Granollers) the page gives last year's dates only where an official page
 * states them, and always labelled "2025" - never as this year's.
 *
 * Verified 2025 facts: Santa Llúcia ran 28 Nov - 23 Dec 2025 with 215 stalls
 * (organiser's "Calendari - 2025" page); Manresa 13-14 Dec 2025; Granollers'
 * five fairs from 21 Nov 2025.
 *
 * Verified 2026 dates: Canyelles (weekend of 21 Nov), Espinelves (28 Nov - 8
 * Dec, 45th), Vic medieval market (5-8 Dec), Garriguella (8 Dec), Altafulla
 * (11-13 Dec), Sant Pere de Vilamajor and Roquetes (12-13 Dec), les Masies de
 * Voltregà (18-20 Dec).
 *
 * Removed on 24 Oct: Santa Margarida i els Monjos (its announcement now
 * returns 404), Sabadell, Terrassa, Tarragona, Reus and Tortosa (no official
 * page found, only aggregators that disagree), and two unsourced claims about
 * when Lleida and the Tarragona cities announced last year's dates.
 *
 * Canyelles is written as "the weekend of 21 November": its second day is a
 * genuine 2026 date that the stale-date guard in
 * tests/christmas-markets.test.ts would otherwise catch.
 *
 * Perennial URL, no year in the slug: the same page serves every December.
 */

// 28 Oct 2026 (research_notes/page1-28oct/ski_christmas.md): every 2026 date
// re-read; Santa Llúcia, Sagrada Família, Girona, Figueres and Lleida still
// unannounced. Added: Sant Antoni de Vilamajor (28-29 Nov) and Cubelles
// (18-20 Dec), Girona's 2025 dates and its rule tying the start to Black
// Friday, Tarragona's and Reus's 2025 dates from their councils, and
// Barcelona as European Capital of Christmas 2026 (infoBarcelona). The
// Sagrada Família's 2025 dates and the 2025 opening hours stay out: the
// stale-date guard in tests/christmas-markets.test.ts forbids them.
//
// 30 Oct 2026 (top-3 push): firadesantallucia.cat re-read (home and
// calendari.php still show the 2025 calendar, so the Santa Llúcia line now
// says 30 Oct); CA title in the words of "fires de nadal catalunya 2026",
// ES in "mercados navideños cataluña 2026"; descriptions give one official
// 2026 date and say Santa Llúcia has none yet. Other dates not re-read.
const VERIFIED = "2026-10-28";

const SOURCES: B2Source[] = [
  { name: "Fira de Santa Llúcia", url: "https://www.barcelona.cat/culturapopular/ca/festes-i-tradicions/fires/fira-de-santa-llucia", publisher: "Ajuntament de Barcelona" },
  { name: "Fira de Nadal de la Sagrada Família", url: "https://www.barcelona.cat/culturapopular/ca/festes-i-tradicions/fires/fira-de-nadal-de-la-sagrada-familia", publisher: "Ajuntament de Barcelona" },
  { name: "Nadal a Barcelona", url: "https://www.barcelona.cat/nadal/ca", publisher: "Ajuntament de Barcelona" },
  { name: "Fira de Santa Llúcia: calendari 2025", url: "https://firadesantallucia.cat/calendari.php", publisher: "Associació Fira de Santa Llúcia" },
  { name: "Fira de Santa Llúcia", url: "https://firadesantallucia.cat/", publisher: "Associació Fira de Santa Llúcia" },
  { name: "Mercat de Nadal", url: "https://www.figueres.cat/figueres/fires-i-mercats/mercat-de-nadal-1", publisher: "Ajuntament de Figueres" },
  { name: "Mercat de Nadal", url: "https://comercmercatsconsum.paeria.cat/comerc-i-mercats/mercats-ambulants/mercat-de-nadal", publisher: "Paeria de Lleida" },
  { name: "Fira de Santa Llúcia", url: "https://web.manresa.cat/web/menu/9216-fira-de-santa-llucia", publisher: "Ajuntament de Manresa" },
  { name: "Fires de Nadal", url: "https://www.granollers.cat/nadal/fires-de-nadal", publisher: "Ajuntament de Granollers" },
  { name: "45a Fira de l'Avet 2026", url: "https://espinelves.cat/%f0%9f%8c%b2fira-de-lavet-2025-sollicituds-i-reglament-de-participacio/", publisher: "Ajuntament d'Espinelves" },
  { name: "La Fira de Santa Llúcia", url: "https://www.canyelles.cat/promocio-economica-i-turisme/la-fira-de-santa-llucia", publisher: "Ajuntament de Canyelles" },
  { name: "Mercat Medieval Vic 2026", url: "https://www.vic.cat/ciutat/agenda/mercat-medieval-vic-2026", publisher: "Ajuntament de Vic" },
  { name: "6è Mercat de Nadal de Garriguella", url: "https://garriguella.cat/obertes-les-inscripcions-per-participar-en-el-6e-mercat-de-nadal-de-garriguella/", publisher: "Ajuntament de Garriguella" },
  { name: "Fira de Nadal 2026", url: "https://altafulla.cat/noticies/l-ajuntament-d-altafulla-obre-les-inscripcions-per-participar-en-la-fira-de-nadal-2026_1589", publisher: "Ajuntament d'Altafulla" },
  { name: "4a Fira de Nadal Vila Claus", url: "https://www.vilamajor.cat/actualitat/noticies/ja-es-poden-sollicitar-parades-per-a-la-4a-fira-de-nadal-vila-claus-2026.html", publisher: "Ajuntament de Sant Pere de Vilamajor" },
  { name: "32a Fira de Nadal de Roquetes", url: "https://roquetes.cat/web/obertes-les-inscripcions-per-participar-a-la-32a-fira-de-nadal-de-roquetes-%F0%9F%8E%84/", publisher: "Ajuntament de Roquetes" },
  { name: "Mercat de Nadal", url: "https://www.lesmasiesdevoltrega.cat/actualitat/noticies/obertes-les-inscripcions-per-participar-en-el-mercat-de-nadal-de-les-masies-de-voltrega.html", publisher: "Ajuntament de les Masies de Voltregà" },
  { name: "1a Fira «Un Nadal com cal»", url: "https://www.santantonidevilamajor.cat/actualitat/noticies/busquem-artesanses-i-creadorses-per-omplir-de-magia-la-1a-fira-un-nadal-com-cal-de-sant-antoni-de-vilamajor.html", publisher: "Ajuntament de Sant Antoni de Vilamajor" },
  { name: "Cubelles recupera la Fira de Nadal", url: "https://www.cubelles.cat/cubelles-facil/promocio-economica/cubelles-recupera-la-fira-de-nadal-amb-un-format-renovat-inspirat-en-els-mercats-nadalencs-tradicionals.html", publisher: "Ajuntament de Cubelles" },
  { name: "Mercat de Nadal a la plaça de la Independència", url: "https://web.girona.cat/comerc/firesimercatsalcarrer/permisos/nadalplindependencia", publisher: "Ajuntament de Girona" },
  { name: "La Rambla Nova, a punt per les fires de Nadal i d'artesania (2025)", url: "https://www.tarragona.cat/comerc/noticies/la-rambla-nova-a-punt-per-les-fires-de-nadal-i-dartesania-1", publisher: "Ajuntament de Tarragona" },
  { name: "Reus té a punt la campanya de Nadal 2025-2026", url: "https://www.reus.cat/noticia/reus-te-punt-la-campanya-de-nadal-2025-2026", publisher: "Ajuntament de Reus" },
  { name: "Barcelona, Capital Europea del Nadal 2026", url: "https://www.barcelona.cat/infobarcelona/en/barcelona-capital-europea-de-nadal-2026_1579437.html", publisher: "Ajuntament de Barcelona" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "tradicions/mercats-de-nadal-catalunya",
    title: "Fires i mercats de Nadal a Catalunya 2026: Fira de Santa Llúcia, dates i llocs",
    seoTitle: "Fires i mercats de Nadal Catalunya 2026: dates i llocs",
    seoDescription:
      "Fires de Nadal Catalunya 2026: dates oficials, com l'Avet d'Espinelves (28 de novembre-8 de desembre). Santa Llúcia, encara sense dates.",
    excerpt:
      "Els mercats de Nadal de Catalunya el 2026: quines dates han confirmat els organitzadors, quines eren les del 2025 i on es fa cada fira.",
  },
  es: {
    path: "tradiciones/mercados-navidad-cataluna",
    title: "Mercados navideños en Cataluña 2026: Fira de Santa Llúcia, fechas y lugares",
    seoTitle: "Mercados navideños Cataluña 2026: fechas y Santa Llúcia",
    seoDescription:
      "Mercados navideños Cataluña 2026: fechas oficiales, como el Avet de Espinelves (28 de noviembre-8 de diciembre). Santa Llúcia, aún sin fechas.",
    excerpt:
      "Los mercados de Navidad de Cataluña en 2026: qué fechas han confirmado los organizadores, cuáles fueron las de 2025 y dónde se hace cada feria.",
  },
  en: {
    path: "traditions/christmas-markets-catalonia",
    title: "Christmas markets in Barcelona and Catalonia 2026: dates and places",
    seoTitle: "Barcelona Christmas markets 2026: Santa Llúcia, Catalonia",
    seoDescription:
      "Fira de Santa Llúcia 2026, the Sagrada Família fair, Espinelves and more: which 2026 dates are official, what the 2025 dates were and where each market is.",
    excerpt:
      "Christmas markets in Barcelona and Catalonia in 2026: the dates organisers have confirmed, last year's dates for the rest, and where each one is held.",
  },
};

type Row = [market: string, town: string, where: string, dates: string];

/** The main markets. "Where" only when an official page states it; 2025 dates always labelled. */
const MARKETS: Record<Locale, Row[]> = {
  ca: [
    ["Fira de Santa Llúcia", "Barcelona", "Pla de la Seu i avinguda de la Catedral", "Pendent. El 2025: del 28 de novembre fins al 23 de desembre"],
    ["Fira de Nadal de la Sagrada Família", "Barcelona", "Plaça de la Sagrada Família", "Pendent. Sol començar a finals de novembre o principis de desembre"],
    ["Fira de l'Avet (45a)", "Espinelves", "—", "**Del 28 de novembre al 8 de desembre de 2026**"],
    ["Mercat de Nadal", "Girona", "Plaça de la Independència", "Pendent. El 2025: del 28 de novembre de 2025 al 5 de gener de 2026"],
    ["Mercat de Nadal", "Figueres", "La Rambla", "Pendent («dates a determinar per 2026»)"],
    ["Mercat de Nadal", "Lleida", "Plaça de la Catedral i voltants", "Pendent"],
    ["Fira de Santa Llúcia", "Manresa", "Baixada de la Seu i plaça Major (2025)", "Pendent. El 2025: 13 i 14 de desembre"],
    ["Fires de Nadal", "Granollers", "Porxada, Corona i Barangé (2025)", "Pendent. El 2025: des del 21 de novembre"],
  ],
  es: [
    ["Fira de Santa Llúcia", "Barcelona", "Pla de la Seu y avenida de la Catedral", "Pendiente. En 2025: del 28 de noviembre hasta el 23 de diciembre"],
    ["Fira de Nadal de la Sagrada Família", "Barcelona", "Plaza de la Sagrada Família", "Pendiente. Suele empezar a finales de noviembre o principios de diciembre"],
    ["Fira de l'Avet (45.ª)", "Espinelves", "—", "**Del 28 de noviembre al 8 de diciembre de 2026**"],
    ["Mercat de Nadal", "Girona", "Plaza de la Independència", "Pendiente. En 2025: del 28 de noviembre de 2025 al 5 de enero de 2026"],
    ["Mercat de Nadal", "Figueres", "La Rambla", "Pendiente («dates a determinar per 2026»)"],
    ["Mercat de Nadal", "Lleida", "Plaza de la Catedral y alrededores", "Pendiente"],
    ["Fira de Santa Llúcia", "Manresa", "Baixada de la Seu y plaza Major (2025)", "Pendiente. En 2025: 13 y 14 de diciembre"],
    ["Ferias de Navidad", "Granollers", "Porxada, Corona y Barangé (2025)", "Pendiente. En 2025: desde el 21 de noviembre"],
  ],
  en: [
    ["Fira de Santa Llúcia", "Barcelona", "Pla de la Seu and Avinguda de la Catedral", "Not yet published. In 2025: from 28 November until 23 December"],
    ["Sagrada Família Christmas Fair", "Barcelona", "Plaça de la Sagrada Família", "Not yet published. Usually opens late November or early December"],
    ["Fir Tree Fair (45th)", "Espinelves", "—", "**28 November to 8 December 2026**"],
    ["Christmas market", "Girona", "Plaça de la Independència", "Not yet published. In 2025: 28 November 2025 to 5 January 2026"],
    ["Christmas market", "Figueres", "La Rambla", "Not yet published (\"dates to be set for 2026\")"],
    ["Christmas market", "Lleida", "Plaça de la Catedral and around", "Not yet published"],
    ["Fira de Santa Llúcia", "Manresa", "Baixada de la Seu and Plaça Major (2025)", "Not yet published. In 2025: 13 and 14 December"],
    ["Christmas fairs", "Granollers", "Porxada, Corona and Barangé squares (2025)", "Not yet published. In 2025: from 21 November"],
  ],
};

const HEADERS: Record<Locale, string[]> = {
  ca: ["Mercat", "Població", "On", "Dates del 2026"],
  es: ["Mercado", "Población", "Dónde", "Fechas de 2026"],
  en: ["Market", "Town", "Where", "2026 dates"],
};

function marketTable(locale: Locale) {
  const caption: Record<Locale, string> = {
    ca: "Els grans mercats de Nadal de Catalunya i les seves dates",
    es: "Los grandes mercados de Navidad de Cataluña y sus fechas",
    en: "The main Christmas markets in Catalonia and their dates",
  };
  const note: Record<Locale, string> = {
    ca: "«Pendent» vol dir que l'organitzador encara no ha publicat les dates del 2026; les del 2025 surten de la seva pàgina oficial i poden canviar. «On» només quan una pàgina oficial ho diu. Comprovat el 28 d'octubre de 2026.",
    es: "«Pendiente» significa que el organizador aún no ha publicado las fechas de 2026; las de 2025 salen de su página oficial y pueden cambiar. «Dónde» solo cuando una página oficial lo dice. Comprobado el 28 de octubre de 2026.",
    en: "\"Not yet published\" means the organiser has not announced its 2026 dates; the 2025 dates come from its official page and may change. \"Where\" only when an official page says so. Checked on 28 October 2026.",
  };
  return table(caption[locale], HEADERS[locale], MARKETS[locale], note[locale]);
}

/** Smaller fairs whose 2026 dates their council has published, in date order. */
const CONFIRMED: Record<Locale, string[]> = {
  ca: [
    "**Canyelles** (Garraf): 24a Fira de Santa Llúcia, el cap de setmana del 21 de novembre.",
    "**Espinelves** (Osona): 45a Fira de l'Avet, del 28 de novembre al 8 de desembre.",
    "**Sant Antoni de Vilamajor** (Vallès Oriental): 1a fira «Un Nadal com cal», dissabte 28 i diumenge 29 de novembre, a la plaça de la Vila.",
    "**Garriguella** (Alt Empordà): 6è Mercat de Nadal, dimarts 8 de desembre, de 9 a 14 h, a la plaça de l'Església.",
    "**Altafulla** (Tarragonès): Fira de Nadal, l'11, el 12 i el 13 de desembre, a les places de l'Església i del Pou.",
    "**Sant Pere de Vilamajor** (Vallès Oriental): 4a Fira de Nadal Vila Claus, el 12 i el 13 de desembre, al parc de la Rectoria.",
    "**Roquetes** (Baix Ebre): 32a Fira de Nadal, el 12 i el 13 de desembre, al passeig Ramon Bosch i Rosell i la plaça dels Països Catalans.",
    "**Cubelles** (Garraf): Fira de Nadal, el 18, el 19 i el 20 de desembre.",
    "**Les Masies de Voltregà** (Osona): Mercat de Nadal, el 18, el 19 i el 20 de desembre.",
  ],
  es: [
    "**Canyelles** (Garraf): 24.ª Fira de Santa Llúcia, el fin de semana del 21 de noviembre.",
    "**Espinelves** (Osona): 45.ª Fira de l'Avet (feria del abeto), del 28 de noviembre al 8 de diciembre.",
    "**Sant Antoni de Vilamajor** (Vallès Oriental): 1.ª feria «Un Nadal com cal», sábado 28 y domingo 29 de noviembre, en la plaza de la Vila.",
    "**Garriguella** (Alt Empordà): 6.º Mercat de Nadal, martes 8 de diciembre, de 9 a 14 h, en la plaza de l'Església.",
    "**Altafulla** (Tarragonès): Fira de Nadal, el 11, el 12 y el 13 de diciembre, en las plazas de l'Església y del Pou.",
    "**Sant Pere de Vilamajor** (Vallès Oriental): 4.ª Fira de Nadal Vila Claus, el 12 y el 13 de diciembre, en el parque de la Rectoria.",
    "**Roquetes** (Baix Ebre): 32.ª Fira de Nadal, el 12 y el 13 de diciembre, en el paseo Ramon Bosch i Rosell y la plaza dels Països Catalans.",
    "**Cubelles** (Garraf): Fira de Nadal, el 18, el 19 y el 20 de diciembre.",
    "**Les Masies de Voltregà** (Osona): Mercat de Nadal, el 18, el 19 y el 20 de diciembre.",
  ],
  en: [
    "**Canyelles** (Garraf): 24th Fira de Santa Llúcia, the weekend of 21 November.",
    "**Espinelves** (Osona): 45th Fir Tree Fair (Fira de l'Avet), 28 November to 8 December.",
    "**Sant Antoni de Vilamajor** (Vallès Oriental): first 'Un Nadal com cal' fair, Saturday 28 and Sunday 29 November, on Plaça de la Vila.",
    "**Garriguella** (Alt Empordà): 6th Christmas market, Tuesday 8 December, 9:00 to 14:00, on Plaça de l'Església.",
    "**Altafulla** (Tarragonès): Christmas fair, 11, 12 and 13 December, on the squares of l'Església and del Pou.",
    "**Sant Pere de Vilamajor** (Vallès Oriental): 4th Vila Claus Christmas fair, 12 and 13 December, in the Rectoria park.",
    "**Roquetes** (Baix Ebre): 32nd Christmas fair, 12 and 13 December, on Passeig Ramon Bosch i Rosell and Plaça dels Països Catalans.",
    "**Cubelles** (Garraf): Christmas fair, 18, 19 and 20 December.",
    "**Les Masies de Voltregà** (Osona): Christmas market, 18, 19 and 20 December.",
  ],
};

function body(locale: Locale) {
  if (locale === "ca") {
    return [
      lead(
        "Les dates de la **Fira de Santa Llúcia 2026** encara no s'han publicat: el 30 d'octubre el web de l'organització encara mostra el calendari del 2025, quan la fira va obrir el 28 de novembre i va tancar el 23 de desembre davant de la Catedral de Barcelona. El mercat de Nadal amb data oficial més gran per ara és la **Fira de l'Avet d'Espinelves**, del 28 de novembre al 8 de desembre de 2026.",
      ),
      callout(
        "info",
        "Com llegir aquesta pàgina",
        "Només hi posem una data del 2026 quan l'organitzador l'ha publicada. Per als grans mercats que encara no ho han fet, donem la del 2025 i ho diem clarament. L'Ajuntament de Barcelona diu que actualitzarà el seu web de Nadal cap al novembre del 2026; aquí ho afegim el dia que surti.",
      ),
      marketTable("ca"),
      ...h2("Mercats de Nadal amb dates del 2026 confirmades", "Aquestes fires ja tenen dates oficials del 2026, publicades pels seus ajuntaments:"),
      list(...CONFIRMED.ca),
      ...paras(
        "També al desembre, tot i que no és un mercat de Nadal: el **Mercat Medieval de Vic** ocupa el centre històric de la ciutat del 5 al 8 de desembre de 2026, segons l'agenda de l'Ajuntament de Vic.",
      ),
      ...h2(
        "Fira de Santa Llúcia 2026: quan i on",
        "Segons l'Ajuntament de Barcelona, «des del 1786 es fa, al davant de la Catedral, la Fira de Santa Llúcia, una de les més populars de la ciutat». Les parades omplen el pla de la Seu i l'avinguda de la Catedral, s'hi instal·len a final de novembre o principi de desembre, **sempre abans del dia 13, Santa Llúcia**, i s'hi queden durant els dies de Nadal.",
        `L'edició del 2025 va obrir el 28 de novembre i va tancar el 23 de desembre, amb 215 parades, segons l'Associació Fira de Santa Llúcia, que l'organitza i publica el calendari al seu web. És la fira on Barcelona compra el pessebre: figures, molsa, avets i herbes, a més d'artesania i regals. Per veure'n un de vivent, mira ${b2link("pessebres", "ca", "el calendari de pessebres vivents")}.`,
      ),
      ...h2(
        "Fira de Nadal de la Sagrada Família",
        "Es fa a la plaça de la Sagrada Família des del 1962 i té un centenar de parades en quatre sectors: arbres i plantes, pessebres i decoració (caganers i tions inclosos), alimentació i regals. L'organitza l'Associació d'Artesans i Firaires Nadalencs de la Sagrada Família.",
        "Segons l'Ajuntament, comença a la darreria de novembre o principi de desembre i es pot visitar fins als dies de Nadal. Les dates del 2026 encara no s'han anunciat.",
      ),
      ...h2(
        "Mercats de Nadal de Girona, Figueres i Lleida",
        `**Girona** fa el seu Mercat de Nadal a la plaça de la Independència. El 2025 va anar del 28 de novembre de 2025 al 5 de gener de 2026, i l'Ajuntament lliga la data d'inici al dia oficial del Black Friday. Si hi vas des de Barcelona, mira ${b2link("girona", "ca", "com anar a Girona en tren")}.`,
        `**Figueres** el fa a la Rambla, amb casetes de fusta, avets, plantes i productes agroalimentaris; el web municipal diu «Dates a determinar per 2026». Per combinar-ho amb el museu, ${b2link("figueres", "ca", "Figueres i el Teatre-Museu Dalí")}.`,
        "**Lleida** instal·la el Mercat de Nadal a la plaça de la Catedral i voltants; la Paeria encara no n'ha publicat el calendari del 2026.",
      ),
      ...h2(
        "Manresa i Granollers",
        "**Manresa** fa la Fira de Santa Llúcia, on l'Ajuntament diu que es troben «els elements imprescindibles per preparar Nadal». El 2025 es va fer el dissabte 13 de desembre a la Baixada de la Seu i el diumenge 14 a la plaça Major.",
        "**Granollers** en fa diverses: el 2025 hi va haver la parada de plantes i arbres de Nadal des del 21 de novembre, la fira de pessebres i ornamentació a la plaça de la Porxada, la fira d'artesania a la plaça Barangé i dos mercats de cap de setmana.",
      ),
      ...h2(
        "I la resta de ciutats?",
        `A **Tarragona**, el 2025 la Fira de Nadal va ser del 4 al 24 de desembre a la Rambla Nova, i a **Reus** el Mercat de Nadal, del 30 de novembre al 23 de desembre a la plaça del Mercadal; cap de les dues ciutats no ha publicat encara les dates del 2026. Sabadell, Terrassa, Tortosa i molts altres municipis també munten fires a l'Advent, però no n'hem trobat cap pàgina oficial amb dates del 2026; les webs d'agenda es contradiuen entre elles. Consulta l'agenda de l'ajuntament abans d'anar-hi. Si vas a Tarragona en tren, ${b2link("tarragona", "ca", "Tarragona des de Barcelona")}.`,
      ),
      ...h2(
        "Abans d'anar-hi",
        `Els organitzadors canvien dates i emplaçaments d'un any a l'altre: comprova-ho al seu web el dia que hi vagis. Si vas a comprar un diumenge o festiu de desembre, mira ${b2link("shops", "ca", "quins dies poden obrir les botigues")}: el 2026 ho poden fer els diumenges 6, 13, 20 i 27 de desembre i el dimarts 8. Per als ponts, ${b2link("workCalendar", "ca", "el calendari de festius")}.`,
        `Per a la resta del Nadal a la ciutat (els llums, el pessebre de Sant Jaume i què obre els festius), mira ${b2link("christmasBarcelona", "ca", "Nadal a Barcelona")}.`,
        `Per saber quines fires i mercats hi ha cada cap de setmana a la teva zona, segons el calendari oficial de fires, mira [les fires i mercats d'aquest cap de setmana](${weekendHubPath("ca")}).`,
      ),
      faq([
        {
          question: "Quan és la Fira de Santa Llúcia 2026?",
          answer:
            "Encara no s'ha publicat. Segons l'Ajuntament de Barcelona, s'instal·la a final de novembre o principi de desembre, sempre abans del 13 de desembre, i dura fins als dies de Nadal. El 2025 va obrir el 28 de novembre i va tancar el 23 de desembre.",
        },
        {
          question: "On es fa la Fira de Santa Llúcia?",
          answer: "Davant de la Catedral de Barcelona, al pla de la Seu i l'avinguda de la Catedral, on es fa des del 1786.",
        },
        {
          question: "Quins mercats de Nadal tenen ja dates per al 2026?",
          answer:
            "A 28 d'octubre, la Fira de l'Avet d'Espinelves (del 28 de novembre al 8 de desembre) i diverses fires municipals: Canyelles, Sant Antoni de Vilamajor, Garriguella, Altafulla, Sant Pere de Vilamajor, Roquetes, Cubelles i les Masies de Voltregà. Els grans de Barcelona encara no.",
        },
        {
          question: "Quins dies obren les botigues al desembre del 2026?",
          answer: "A Barcelona i a la majoria de municipis, els diumenges 6, 13, 20 i 27 de desembre i el dimarts 8 de desembre. El 25 i el 26 de desembre tanquen.",
        },
      ]),
      ...paras(verifiedLine("ca", VERIFIED)),
      ...b2Related(["christmasBarcelona", "christmasTraditions", "pessebres", "newYear", "shops"], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        "Las fechas de la **Fira de Santa Llúcia 2026** aún no se han publicado: a 30 de octubre la web de la organización aún muestra el calendario de 2025, cuando la feria abrió el 28 de noviembre y cerró el 23 de diciembre frente a la Catedral de Barcelona. El mercado de Navidad con fecha oficial más grande por ahora es la **Fira de l'Avet de Espinelves**, del 28 de noviembre al 8 de diciembre de 2026.",
      ),
      callout(
        "info",
        "Cómo leer esta página",
        "Solo ponemos una fecha de 2026 cuando el organizador la ha publicado. Para los grandes mercados que aún no lo han hecho, damos la de 2025 y lo decimos claramente. El Ayuntamiento de Barcelona dice que actualizará su web de Navidad hacia noviembre de 2026; aquí lo añadimos el día que salga.",
      ),
      marketTable("es"),
      ...h2("Mercados de Navidad con fechas de 2026 confirmadas", "Estas ferias ya tienen fechas oficiales de 2026, publicadas por sus ayuntamientos:"),
      list(...CONFIRMED.es),
      ...paras(
        "También en diciembre, aunque no es un mercado de Navidad: el **Mercat Medieval de Vic** ocupa el centro histórico de la ciudad del 5 al 8 de diciembre de 2026, según la agenda del Ayuntamiento de Vic.",
      ),
      ...h2(
        "Fira de Santa Llúcia 2026: cuándo y dónde",
        "Según el Ayuntamiento de Barcelona, desde 1786 se celebra frente a la Catedral y es una de las ferias más populares de la ciudad. Los puestos llenan el pla de la Seu y la avenida de la Catedral, se instalan a finales de noviembre o principios de diciembre, **siempre antes del día 13, Santa Llúcia**, y se quedan durante los días de Navidad.",
        `La edición de 2025 abrió el 28 de noviembre y cerró el 23 de diciembre, con 215 puestos, según la Associació Fira de Santa Llúcia, que la organiza y publica el calendario en su web. Es la feria donde Barcelona compra el belén: figuras, musgo, abetos y hierbas, además de artesanía y regalos. Para ver uno viviente, mira ${b2link("pessebres", "es", "el calendario de belenes vivientes")}.`,
      ),
      ...h2(
        "Fira de Nadal de la Sagrada Família",
        "Se celebra en la plaza de la Sagrada Família desde 1962 y tiene un centenar de puestos en cuatro sectores: árboles y plantas, belenes y decoración (caganers y tiós incluidos), alimentación y regalos. La organiza la Associació d'Artesans i Firaires Nadalencs de la Sagrada Família.",
        "Según el Ayuntamiento, empieza a finales de noviembre o principios de diciembre y se puede visitar hasta los días de Navidad. Las fechas de 2026 aún no se han anunciado.",
      ),
      ...h2(
        "Mercados de Navidad de Girona, Figueres y Lleida",
        `**Girona** celebra su Mercat de Nadal en la plaza de la Independència. En 2025 fue del 28 de noviembre de 2025 al 5 de enero de 2026, y el Ayuntamiento liga la fecha de inicio al día oficial del Black Friday. Si vas desde Barcelona, mira ${b2link("girona", "es", "cómo ir a Girona en tren")}.`,
        `**Figueres** lo hace en la Rambla, con casetas de madera, abetos, plantas y productos agroalimentarios; la web municipal dice «Dates a determinar per 2026». Para combinarlo con el museo, ${b2link("figueres", "es", "Figueres y el Teatro-Museo Dalí")}.`,
        "**Lleida** instala el Mercat de Nadal en la plaza de la Catedral y alrededores; la Paeria aún no ha publicado el calendario de 2026.",
      ),
      ...h2(
        "Manresa y Granollers",
        "**Manresa** celebra la Fira de Santa Llúcia, donde el Ayuntamiento dice que se encuentra lo imprescindible para preparar la Navidad. En 2025 se hizo el sábado 13 de diciembre en la Baixada de la Seu y el domingo 14 en la plaza Major.",
        "**Granollers** organiza varias: en 2025 hubo el puesto de plantas y árboles de Navidad desde el 21 de noviembre, la feria de belenes y ornamentación en la plaza de la Porxada, la feria de artesanía en la plaza Barangé y dos mercados de fin de semana.",
      ),
      ...h2(
        "¿Y el resto de ciudades?",
        `En **Tarragona**, en 2025 la Fira de Nadal fue del 4 al 24 de diciembre en la Rambla Nova, y en **Reus** el Mercat de Nadal, del 30 de noviembre al 23 de diciembre en la plaza del Mercadal; ninguna de las dos ciudades ha publicado aún las fechas de 2026. Sabadell, Terrassa, Tortosa y muchos otros municipios también montan ferias en Adviento, pero no hemos encontrado ninguna página oficial con fechas de 2026; las webs de agenda se contradicen entre sí. Consulta la agenda del ayuntamiento antes de ir. Si vas a Tarragona en tren, ${b2link("tarragona", "es", "Tarragona desde Barcelona")}.`,
      ),
      ...h2(
        "Antes de ir",
        `Los organizadores cambian fechas y emplazamientos de un año a otro: compruébalo en su web el día que vayas. Si vas a comprar un domingo o festivo de diciembre, mira ${b2link("shops", "es", "qué días pueden abrir las tiendas")}: en 2026 pueden hacerlo los domingos 6, 13, 20 y 27 de diciembre y el martes 8. Para los puentes, ${b2link("workCalendar", "es", "el calendario de festivos")}.`,
        `Para el resto de la Navidad en la ciudad (las luces, el belén de Sant Jaume y qué abre los festivos), mira ${b2link("christmasBarcelona", "es", "Navidad en Barcelona")}.`,
        `Para saber qué ferias y mercados hay cada fin de semana en tu zona, según el calendario oficial de ferias, mira [las ferias y mercados de este fin de semana](${weekendHubPath("es")}).`,
      ),
      faq([
        {
          question: "¿Cuándo es la Fira de Santa Llúcia 2026?",
          answer:
            "Aún no se ha publicado. Según el Ayuntamiento de Barcelona, se instala a finales de noviembre o principios de diciembre, siempre antes del 13 de diciembre, y dura hasta los días de Navidad. En 2025 abrió el 28 de noviembre y cerró el 23 de diciembre.",
        },
        {
          question: "¿Dónde se celebra la Fira de Santa Llúcia?",
          answer: "Frente a la Catedral de Barcelona, en el pla de la Seu y la avenida de la Catedral, donde se celebra desde 1786.",
        },
        {
          question: "¿Qué mercados de Navidad tienen ya fechas para 2026?",
          answer:
            "A 28 de octubre, la Fira de l'Avet de Espinelves (del 28 de noviembre al 8 de diciembre) y varias ferias municipales: Canyelles, Sant Antoni de Vilamajor, Garriguella, Altafulla, Sant Pere de Vilamajor, Roquetes, Cubelles y les Masies de Voltregà. Los grandes de Barcelona, todavía no.",
        },
        {
          question: "¿Qué días abren las tiendas en diciembre de 2026?",
          answer: "En Barcelona y en la mayoría de municipios, los domingos 6, 13, 20 y 27 de diciembre y el martes 8 de diciembre. El 25 y el 26 de diciembre cierran.",
        },
      ]),
      ...paras(verifiedLine("es", VERIFIED)),
      ...b2Related(["christmasBarcelona", "christmasTraditions", "pessebres", "newYear", "shops"], "es"),
    ];
  }

  return [
    lead(
      "Barcelona's Christmas market is the **Fira de Santa Llúcia**, in front of the Cathedral, and its **2026 dates have not been published yet**: on 30 October the organiser's website still showed the 2025 calendar, when it opened on 28 November and closed on 23 December. The city's second fair, at the **Sagrada Família**, has not announced its dates either. The biggest Christmas market with an official 2026 date so far is the **Espinelves Fir Tree Fair**, 28 November to 8 December 2026, and Barcelona is this year's **European Capital of Christmas**, according to the City Council.",
    ),
    callout(
      "info",
      "How to read this page",
      "We give a 2026 date only once the organiser has published it. For the big markets that have not, we give the 2025 dates and say so. Barcelona City Council says it will update its Christmas website around November 2026; we add each date the day it appears.",
    ),
    marketTable("en"),
    ...h2("Christmas markets with confirmed 2026 dates", "These fairs already have official 2026 dates, published by their town councils:"),
    list(...CONFIRMED.en),
    ...paras(
      "Also in December, though not a Christmas market: **Vic's Medieval Market** fills the historic centre from 5 to 8 December 2026, according to Vic City Council's events listing.",
    ),
    ...h2(
      "Fira de Santa Llúcia 2026: when and where",
      "According to Barcelona City Council, the fair has been held in front of the Cathedral since 1786 and is one of the most popular in the city. Its stalls fill the Pla de la Seu and Avinguda de la Catedral; they set up at the end of November or the start of December, **always before 13 December, Santa Llúcia's day**, and stay through the Christmas days.",
      `The 2025 edition opened on 28 November and closed on 23 December, with 215 stalls, according to the Associació Fira de Santa Llúcia, which runs it and publishes the calendar on its website. It is where Barcelona buys its nativity scene: figures, moss, fir trees and greenery, as well as crafts and gifts. For a living one, see ${b2link("pessebres", "en", "the living nativity calendar")}.`,
    ),
    ...h2(
      "Sagrada Família Christmas Fair",
      "Held on Plaça de la Sagrada Família since 1962, it has about a hundred stalls in four sections: trees and plants, nativity scenes and decorations (caganers and tiós included), food, and gifts. It is run by the Associació d'Artesans i Firaires Nadalencs de la Sagrada Família.",
      "According to the City Council, it starts at the end of November or early December and runs until the Christmas days. The 2026 dates have not been announced.",
    ),
    ...h2(
      "Christmas markets in Girona, Figueres and Lleida",
      `**Girona** holds its Christmas market on Plaça de la Independència. In 2025 it ran from 28 November 2025 to 5 January 2026, and the council ties its opening day to the official Black Friday. From Barcelona, see ${b2link("girona", "en", "Girona by train")}.`,
      `**Figueres** holds it on La Rambla, in wooden huts selling Christmas items, food, plants and fir trees; the council's page says the 2026 dates are still to be set. To combine it with the museum, see ${b2link("figueres", "en", "Figueres and the Dalí Theatre-Museum")}.`,
      "**Lleida** sets up its Christmas market on Plaça de la Catedral and the streets around it; the city has not yet published its 2026 calendar.",
    ),
    ...h2(
      "Manresa and Granollers",
      "**Manresa** holds a Fira de Santa Llúcia, which the council describes as the place to find what you need to prepare for Christmas. In 2025 it was held on Saturday 13 December on the Baixada de la Seu and on Sunday 14 December on Plaça Major.",
      "**Granollers** runs several: in 2025 there was a Christmas tree and plant stall from 21 November, a nativity and decorations fair on Plaça de la Porxada, a craft fair on Plaça Barangé and two weekend markets.",
    ),
    ...h2(
      "What about other towns?",
      `In **Tarragona** the 2025 Christmas fair ran from 4 to 24 December on the Rambla Nova, and in **Reus** the Christmas market from 30 November to 23 December on Plaça del Mercadal; neither city has published its 2026 dates yet. Sabadell, Terrassa, Tortosa and many other towns also hold Advent fairs, but we have found no official page with 2026 dates, and listing sites contradict each other. Check the council's events page before you go. By train to Tarragona, see ${b2link("tarragona", "en", "Tarragona from Barcelona")}.`,
    ),
    ...h2(
      "Before you go",
      `Organisers change dates and venues from year to year, so check their website for your day. If you plan to shop on a December Sunday or holiday, see ${b2link("shops", "en", "which days shops may open")}: in 2026 they may open on Sundays 6, 13, 20 and 27 December and on Tuesday 8 December. For long weekends, ${b2link("workCalendar", "en", "the public holiday calendar")}.`,
      `For the rest of Christmas in the city (the lights, the Plaça Sant Jaume nativity scene and what is open on the holidays), see ${b2link("christmasBarcelona", "en", "Christmas in Barcelona")}.`,
    ),
    faq([
      {
        question: "When is the Fira de Santa Llúcia 2026?",
        answer:
          "The dates have not been published yet. According to Barcelona City Council, it sets up at the end of November or early December, always before 13 December, and runs until the Christmas days. In 2025 it opened on 28 November and closed on 23 December.",
      },
      {
        question: "Where is the Christmas market in Barcelona?",
        answer:
          "The oldest, the Fira de Santa Llúcia, is in front of Barcelona Cathedral (Pla de la Seu and Avinguda de la Catedral), where it has been held since 1786. The second is the Sagrada Família Christmas Fair, on Plaça de la Sagrada Família.",
      },
      {
        question: "Which Christmas markets have confirmed 2026 dates?",
        answer:
          "As of 28 October, the Espinelves Fir Tree Fair (28 November to 8 December) and several municipal fairs: Canyelles, Sant Antoni de Vilamajor, Garriguella, Altafulla, Sant Pere de Vilamajor, Roquetes, Cubelles and Les Masies de Voltregà. Barcelona's big two have not announced theirs.",
      },
      {
        question: "Is Barcelona the European Capital of Christmas 2026?",
        answer: "Yes. The City Council announced in December 2025 that Barcelona had been named European Capital of Christmas 2026. Its Christmas website says it will be updated around November 2026 with this year's programme.",
      },
      {
        question: "Are shops open on Sundays in December 2026?",
        answer: "In Barcelona and most towns, shops may open on Sundays 6, 13, 20 and 27 December and on Tuesday 8 December. They are closed on 25 and 26 December.",
      },
    ]),
    ...paras(verifiedLine("en", VERIFIED)),
    ...b2Related(["christmasBarcelona", "christmasTraditions", "pessebres", "newYear", "shops"], "en"),
  ];
}

export const CHRISTMAS: B2Article = {
  key: "christmas",
  entryKey: "guide-christmas-markets-catalonia",
  categoryKey: "festivals",
  sources: SOURCES,
  heroKey: "mercats-nadal-santa-llucia-nit",
  heroAlt: {
    ca: "Parades de la Fira de Santa Llúcia il·luminades de nit davant la Catedral de Barcelona",
    es: "Puestos de la Fira de Santa Llúcia iluminados de noche ante la catedral de Barcelona",
    en: "Fira de Santa Llúcia stalls lit up at night by Barcelona Cathedral",
  },
  heroCaption: {
    ca: "La Fira de Santa Llúcia, davant de la Catedral de Barcelona.",
    es: "La Fira de Santa Llúcia, frente a la Catedral de Barcelona.",
    en: "The Fira de Santa Llúcia, in front of Barcelona Cathedral.",
  },
  secondaryKey: "mercats-nadal-santa-llucia-figures",
  secondaryAlt: {
    ca: "Prestatges amb figures de pessebre i escenaris de molsa en una parada de la Fira de Santa Llúcia",
    es: "Estanterías con figuras de belén y escenarios de musgo en un puesto de la Fira de Santa Llúcia",
    en: "Shelves of nativity figures and moss scenery on a Fira de Santa Llúcia stall",
  },
  secondaryCaption: {
    ca: "Figures de pessebre a la Fira de Santa Llúcia.",
    es: "Figuras de belén en la Fira de Santa Llúcia.",
    en: "Nativity figures at the Fira de Santa Llúcia.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-11-10T09:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};
