import type { Block } from "@/lib/content/blocks";
import { NATIVITY_SOURCE } from "@/lib/content/pessebres/agenda";
import { EVERGREEN as WEEKEND } from "@/lib/content/weekend/evergreen";
import type { Locale } from "@/lib/i18n/config";

import { CHRISTMAS } from "./christmas";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  lead,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Living nativity scenes ("pessebres vivents") in Catalonia.
 *
 * The calendar itself is the `livingNativities` block: read every day from
 * the Generalitat's open-data agenda (`rhpv-yr4f`), upcoming rows only, so
 * the page cannot show last season. On 25 October 2026 the agenda held no
 * living nativity for the 2026-27 season yet; the block says so and explains
 * when they usually appear.
 *
 * Everything this text says about timing, tickets and where they are comes
 * from the same agenda's 2025-26 rows, read on 25 Oct 2026 and always labelled
 * as last season: 44 living nativities in 22 comarques; first opened 29 Nov
 * 2025, last closed 11 Jan 2026; 36 started on or after 20 Dec and 40 had
 * ended by 6 Jan; 32 started on a Saturday or Sunday; 3 were free, 3 asked for
 * a donation, 22 had an online ticket link; the first was posted on 19 Nov,
 * 22 by 30 Nov and 41 by 15 Dec. Public holidays: the Generalitat's 2026 and
 * 2027 calendars (treball.gencat.cat), checked the same day.
 *
 * The best-known nativities (`KNOWN`) are named with a link to their own site
 * and their 2026-27 dates only when that site has published them, all read
 * on 25 Oct 2026: Corbera (tickets site, 28 Nov 2026 - 9 Jan 2027, online
 * only), Tona (55th; box office only), les Torres de Fals, Sant Guim de la
 * Plana (online only; not wheelchair or pushchair accessible), les Gunyoles
 * (49th), l'Espluga de Francolí (biennial; advance tickets from 22 Nov) and
 * the Torre del Suro in Barcelona (21 Dec, free). Bàscara, els Prats de Rei,
 * Rupit and Peralada still showed 2025-26 and are "not yet published". Pals
 * was left out: its only site is a free-hosted page whose owner could not be
 * confirmed. No date from 2025 is ever written as a 2026 date
 * (tests/living-nativities-guide.test.ts). Re-check the pending four in
 * November, and replace the whole table for the 2027-28 season.
 *
 * The lead image reuses the Christmas markets guide's photograph of nativity
 * figures, with the same alt text and caption: the publisher requires a lead
 * photo, the media row is keyed by file, and identical wording keeps the
 * other article's row unchanged.
 */

const VERIFIED = "2026-10-25";

const HOLIDAYS_2026 = "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2026/";
const HOLIDAYS_2027 = "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2027/";

const SOURCES: B2Source[] = [
  { name: "Agenda Cultural de Catalunya: Nadal", url: NATIVITY_SOURCE.url, publisher: "Departament de Cultura, Generalitat de Catalunya" },
  { name: "Agenda cultural de Catalunya (dades obertes)", url: NATIVITY_SOURCE.dataUrl, publisher: NATIVITY_SOURCE.publisher },
  { name: "Calendari oficial de festes laborals a Catalunya 2026", url: HOLIDAYS_2026, publisher: "Departament d'Empresa i Treball, Generalitat de Catalunya" },
  { name: "Calendari oficial de festes laborals a Catalunya 2027", url: HOLIDAYS_2027, publisher: "Departament d'Empresa i Treball, Generalitat de Catalunya" },
  { name: "51 municipis d'arreu de Catalunya acolliran més de 300 representacions de pessebres vivents", url: "https://www.pessebresvivents.cat/51-municipis-darreu-de-catalunya-acolliran-mes-de-300-representacions-de-pessebres-vivents/", publisher: "Federació de Pessebres Vivents de Catalunya" },
];

/**
 * The best-known living nativities, each checked on 25 Oct 2026 on its own
 * organiser's or town council's site. `dates` only when that site gives the
 * 2026-27 season; otherwise null, rendered as "not yet published" — never
 * last season's days. Corbera links to its tickets pages: its home page
 * carried injected spam text on the day of checking.
 */
interface Known {
  /** The organiser's own name, kept in Catalan in every edition. */
  name: string;
  place: string;
  dates: Record<Locale, string> | null;
  url: string;
  label: string;
  publisher: string;
}

export const KNOWN: Known[] = [
  {
    name: "Pessebre Vivent de Corbera de Llobregat",
    place: "Corbera de Llobregat (Baix Llobregat)",
    dates: {
      ca: "Sessions del 28 de novembre de 2026 al 9 de gener de 2027; entrades només per internet",
      es: "Pases del 28 de noviembre de 2026 al 9 de enero de 2027; entradas solo por internet",
      en: "Sessions from 28 November 2026 to 9 January 2027; tickets online only",
    },
    url: "https://tickets.pessebrecorbera.cat/",
    label: "tickets.pessebrecorbera.cat",
    publisher: "Pessebre Vivent de Corbera de Llobregat",
  },
  {
    name: "55è Pessebre Vivent d'Osona",
    place: "Tona (Osona)",
    dates: {
      ca: "20, 25, 26 i 27 de desembre de 2026 i 1, 3, 6 i 10 de gener de 2027; entrades només a taquilla",
      es: "20, 25, 26 y 27 de diciembre de 2026 y 1, 3, 6 y 10 de enero de 2027; entradas solo en taquilla",
      en: "20, 25, 26 and 27 December 2026 and 1, 3, 6 and 10 January 2027; tickets at the box office only",
    },
    url: "https://pessebre-vivent-osona.cat/",
    label: "pessebre-vivent-osona.cat",
    publisher: "Agrupació Pessebre Vivent de Tona",
  },
  {
    name: "Pessebre Vivent del Bages a les Torres de Fals",
    place: "Fonollosa (Bages)",
    dates: {
      ca: "19, 20, 26 i 27 de desembre de 2026 i 1, 2, 3 i 6 de gener de 2027, a les 18 h i a les 19.15 h",
      es: "19, 20, 26 y 27 de diciembre de 2026 y 1, 2, 3 y 6 de enero de 2027, a las 18 h y a las 19.15 h",
      en: "19, 20, 26 and 27 December 2026 and 1, 2, 3 and 6 January 2027, at 18:00 and 19:15",
    },
    url: "https://pessebre.cat/",
    label: "pessebre.cat",
    publisher: "Pessebre vivent del Bages a les Torres de Fals",
  },
  {
    name: "Pessebre Vivent dels Oficis Perduts (40è aniversari)",
    place: "Sant Guim de la Plana (Segarra)",
    dates: {
      ca: "19, 20, 26 i 27 de desembre de 2026 i 2, 3, 9 i 10 de gener de 2027, a les 18.30 h; entrades només per internet",
      es: "19, 20, 26 y 27 de diciembre de 2026 y 2, 3, 9 y 10 de enero de 2027, a las 18.30 h; entradas solo por internet",
      en: "19, 20, 26 and 27 December 2026 and 2, 3, 9 and 10 January 2027, at 18:30; tickets online only",
    },
    url: "https://pessebre.org/",
    label: "pessebre.org",
    publisher: "Associació Cultural La Marinada",
  },
  {
    name: "49è Pessebre Vivent parlat de les Gunyoles",
    place: "Avinyonet del Penedès (Alt Penedès)",
    dates: {
      ca: "20, 25, 26 i 27 de desembre de 2026 i 1, 2 i 3 de gener de 2027, a les 18, 18.45 i 19.30 h",
      es: "20, 25, 26 y 27 de diciembre de 2026 y 1, 2 y 3 de enero de 2027, a las 18, 18.45 y 19.30 h",
      en: "20, 25, 26 and 27 December 2026 and 1, 2 and 3 January 2027, at 18:00, 18:45 and 19:30",
    },
    url: "https://pessebrelesgunyoles.cat/",
    label: "pessebrelesgunyoles.cat",
    publisher: "Pessebre Vivent de les Gunyoles",
  },
  {
    name: "Pessebre Vivent de l'Espluga de Francolí",
    place: "l'Espluga de Francolí (Conca de Barberà)",
    dates: {
      ca: "27, 28 i 29 de desembre de 2026 (es fa cada dos anys); entrades només anticipades, des del 22 de novembre a les 9 h",
      es: "27, 28 y 29 de diciembre de 2026 (se hace cada dos años); entradas solo anticipadas, desde el 22 de noviembre a las 9 h",
      en: "27, 28 and 29 December 2026 (held every two years); advance tickets only, on sale from 22 November at 9:00",
    },
    url: "https://pessebredelespluga.com/",
    label: "pessebredelespluga.com",
    publisher: "Associació del Pessebre Vivent de l'Espluga de Francolí",
  },
  {
    name: "33è Pessebre Vivent de la Torre del Suro",
    place: "Barcelona (el Guinardó)",
    dates: {
      ca: "21 de desembre de 2026 a les 18 h; entrada lliure, sense inscripció",
      es: "21 de diciembre de 2026 a las 18 h; entrada libre, sin inscripción",
      en: "21 December 2026 at 18:00; free entry, no booking needed",
    },
    url: "https://www.pessebrevivent.cat/",
    label: "pessebrevivent.cat",
    publisher: "Pessebre Vivent de la Torre del Suro",
  },
  {
    name: "El Pessebre de Bàscara",
    place: "Bàscara (Alt Empordà)",
    dates: null,
    url: "https://bascara.cat/coneix/el-pessebre-vivent/",
    label: "bascara.cat",
    publisher: "Ajuntament de Bàscara",
  },
  {
    name: "Pessebre Vivent dels Prats de Rei",
    place: "els Prats de Rei (Anoia)",
    dates: null,
    url: "https://www.acrsigarra.cat/pessebreprats/",
    label: "acrsigarra.cat",
    publisher: "Agrupació Cultural i Recreativa Sigarra",
  },
  {
    name: "Pessebre Vivent de la Vila de Rupit",
    place: "Rupit i Pruit (Osona)",
    dates: null,
    url: "https://www.rupitpruit.cat/pessebre-vivent",
    label: "rupitpruit.cat",
    publisher: "Ajuntament de Rupit i Pruit",
  },
  {
    name: "Pessebre Vivent de Peralada",
    place: "Peralada (Alt Empordà)",
    dates: null,
    url: "https://www.visitperalada.cat/ca/agenda/pessebre-vivent/",
    label: "visitperalada.cat",
    publisher: "Ajuntament de Peralada",
  },
];

export const PENDING: Record<Locale, string> = {
  ca: "Pendent: el web encara mostra la temporada 2025-26",
  es: "Pendiente: la web aún muestra la temporada 2025-26",
  en: "Not yet published: the website still shows 2025-26",
};

function knownTable(locale: Locale): Block {
  const caption: Record<Locale, string> = {
    ca: "Pessebres vivents coneguts i les seves dates de la temporada 2026-27",
    es: "Belenes vivientes conocidos y sus fechas de la temporada 2026-27",
    en: "Well-known living nativity scenes and their 2026-27 dates",
  };
  const headers: Record<Locale, string[]> = {
    ca: ["Pessebre vivent", "On", "Temporada 2026-27", "Web oficial"],
    es: ["Belén viviente", "Dónde", "Temporada 2026-27", "Web oficial"],
    en: ["Living nativity", "Where", "2026-27 season", "Official website"],
  };
  const note: Record<Locale, string> = {
    ca: "Dates del web oficial de cada organitzador o ajuntament, comprovades el 25 d'octubre de 2026. «Pendent» vol dir que encara no han publicat les de la temporada 2026-27: no hi posem les de l'any passat.",
    es: "Fechas de la web oficial de cada organizador o ayuntamiento, comprobadas el 25 de octubre de 2026. «Pendiente» significa que aún no han publicado las de la temporada 2026-27: no ponemos las del año pasado.",
    en: "Dates from each organiser's or town council's official website, checked on 25 October 2026. \"Not yet published\" means the 2026-27 dates are not out yet: we do not repeat last year's.",
  };
  const rows = KNOWN.map((item) => [item.name, item.place, item.dates?.[locale] ?? PENDING[locale], `[${item.label}](${item.url})`]);
  return table(caption[locale], headers[locale], rows, note[locale]);
}

for (const item of KNOWN) {
  SOURCES.push({ name: item.name, url: item.url, publisher: item.publisher });
}

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "tradicions/pessebres-vivents-catalunya",
    title: "Pessebres vivents 2026 a Catalunya: calendari, dates i on veure'ls",
    seoTitle: "Pessebres vivents 2026 a Catalunya: calendari i dates",
    seoDescription:
      "Calendari dels pessebres vivents de Catalunya 2026, llegit cada dia de l'agenda de la Generalitat: dates, poble i comarca, i com saber si cal entrada.",
    excerpt:
      "Els pessebres vivents d'aquest Nadal a Catalunya, llegits cada dia de l'agenda oficial: on es fan, quins dies i com saber si cal comprar entrada.",
  },
  es: {
    path: "tradiciones/belenes-vivientes-cataluna",
    title: "Belenes vivientes en Cataluña 2026: calendario, fechas y dónde verlos",
    seoTitle: "Belenes vivientes Cataluña 2026: calendario y fechas",
    seoDescription:
      "Calendario de belenes vivientes en Cataluña 2026, leído a diario de la agenda de la Generalitat: fechas, pueblo y comarca, y cómo saber si hay que pagar.",
    excerpt:
      "Los belenes vivientes de esta Navidad en Cataluña, leídos cada día de la agenda oficial: dónde son, qué días y cómo saber si hace falta entrada.",
  },
  en: {
    path: "traditions/living-nativity-scenes-catalonia",
    title: "Living nativity scenes in Catalonia 2026: calendar and where to see them",
    seoTitle: "Living nativity scenes in Catalonia 2026 (near Barcelona)",
    seoDescription:
      "Living nativity scenes in Catalonia this Christmas, read daily from the Generalitat's events agenda: dates, towns near Barcelona and how to check tickets.",
    excerpt:
      "This Christmas's living nativity scenes in Catalonia, read daily from the official agenda: where they are, which days, and whether you need a ticket.",
  },
};

const LIVE: Block = { type: "livingNativities" } as Block;

function body(locale: Locale): Block[] {
  if (locale === "ca") {
    return [
      lead(
        "Els **pessebres vivents 2026** de Catalunya apareixen al calendari d'aquí sota a mesura que els organitzadors els publiquen a l'Agenda Cultural de la Generalitat, que es llegeix cada dia: només hi surten els que encara no han acabat, amb poble, comarca, dates i l'enllaç a la fitxa oficial. Dels més coneguts, el de Corbera de Llobregat comença el 28 de novembre, i Tona, les Torres de Fals, Sant Guim de la Plana, les Gunyoles i l'Espluga de Francolí ja han publicat els seus dies (taula de sota).",
      ),
      LIVE,
      callout(
        "info",
        "Com es fa aquesta llista",
        "Hi surten les activitats que el seu organitzador ha publicat a l'Agenda Cultural amb «pessebre vivent» al nom, i mai les que ja han acabat. Les mostres i exposicions de pessebres hi surten a part. Si en busques un que no hi és, pot ser que encara no s'hagi publicat o que l'organitzador no l'hagi donat d'alta a l'agenda: mira el web de l'ajuntament del poble.",
      ),
      ...h2(
        "Què és un pessebre vivent",
        "Un pessebre vivent és un pessebre fet amb persones en lloc de figures. La gent del poble fa de Maria i Josep, de pastors, de Reis i, sovint, dels oficis de sempre, i normalment el visitant no s'asseu a mirar una obra, sinó que recorre a peu carrers, places, masies o boscos on cada escena està parada.",
        "N'hi ha de molts tipus, i el nom que els posa l'organitzador ja ho diu: el de les Gunyoles és un «pessebre vivent parlat», amb diàlegs, i el de Sant Guim de la Plana, el «pessebre vivent dels oficis perduts». No s'han de confondre amb les **mostres de pessebres**, que exposen pessebres i diorames fets amb figures, ni amb **els Pastorets**, que són una obra de teatre.",
      ),
      ...h2(
        "Quan es fan els pessebres vivents 2026",
        "Cada organitzador tria els seus dies i els publica a l'agenda quan els té: la temporada passada, el primer hi va aparèixer el 19 de novembre, la meitat hi eren a finals de novembre i 41 dels 44 abans del 15 de desembre. Per això, fins a mitjan novembre és normal que la llista sigui buida.",
        "Com a referència, la temporada 2025-26 l'Agenda Cultural en va recollir **44, en 22 comarques**. El primer va obrir el 29 de novembre de 2025 i l'últim va tancar l'11 de gener de 2026; 36 van començar el 20 de desembre o més tard, i 40 havien acabat per Reis. Les dates de cada un són el primer i l'últim dia: dins d'aquest interval, molts només es representen alguns dies.",
        "L'agenda no els recull tots: per a la mateixa temporada, la Federació de Pessebres Vivents de Catalunya, que agrupa els organitzadors, va anunciar més de 300 representacions en 51 municipis, entre el 6 de desembre i l'11 de gener.",
        "La temporada passada, 32 dels 44 van començar en dissabte o diumenge, i les representacions es concentraven en caps de setmana i festius. A tot Catalunya són festius el **dimarts 8**, el **divendres 25** i el **dissabte 26 de desembre de 2026** (a l'Aran, el 26 no ho és), i l'**1 de gener** (divendres) i el **6 de gener de 2027** (dimecres), segons el calendari oficial de la Generalitat.",
      ),
      ...h2(
        "Els pessebres vivents més coneguts: dates 2026-27",
        "Aquests són alguns dels pessebres vivents més coneguts de Catalunya. Les dates surten del web de cada organitzador o ajuntament, i només hi són quan ja han publicat les d'aquesta temporada; quan les donin d'alta a l'agenda, també sortiran al calendari de dalt.",
      ),
      knownTable("ca"),
      ...paras(
        "Alguns tenen molta història. Segons els seus organitzadors, el de **Corbera de Llobregat** va fer la primera representació la nit del 24 de desembre de 1962 i es presenta com «el primer Pessebre Vivent de Catalunya»; el de l'**Espluga de Francolí** es fa des del 1964, i el de **Tona** va néixer el 1972. El de **Bàscara**, segons l'Ajuntament, es representa des del Nadal de 1973 al nucli antic i a la riba del Fluvià. A **Barcelona**, el de la Torre del Suro, al Guinardó, arriba a la 33a edició.",
      ),
      ...h2(
        "Cal entrada per veure un pessebre vivent?",
        "Gairebé sempre. Dels 44 pessebres vivents de la temporada 2025-26 a l'agenda, només 3 eren gratuïts (Celrà, la Seu d'Urgell i Fornells de la Selva) i 3 més demanaven un donatiu; la resta cobraven entrada, i 22 tenien un enllaç de venda d'entrades a la fitxa.",
        "Cada organitzador ho fa a la seva manera. Aquesta temporada, Corbera de Llobregat i Sant Guim de la Plana venen les entrades només per internet; l'Espluga de Francolí, només anticipades i a partir del 22 de novembre; Tona, només a taquilla, i el de la Torre del Suro, a Barcelona, és d'entrada lliure. Els preus i les condicions són al web de cada un: mira-ho abans d'anar-hi.",
        "La temporada passada, gairebé tots es feien a la tarda o al vespre, molts per passis amb hora fixa. Si vas amb canalla o amb cotxet, pregunta quant dura el recorregut i si és accessible: el de Sant Guim de la Plana, per exemple, avisa que no ho és ni amb cadira de rodes ni amb cotxet.",
      ),
      ...h2(
        "Com combinar-ho amb altres plans de Nadal",
        `Si vols combinar-ho amb una fira, mira ${b2link("christmas", "ca", "els mercats i fires de Nadal de Catalunya")} i les seves dates. Si vols aprofitar per comprar, ${b2link("shops", "ca", "quins diumenges i festius obren les botigues")}; per als ponts, ${b2link("workCalendar", "ca", "el calendari de festius")}, i per a la resta de plans del cap de setmana, [l'agenda d'aquest cap de setmana](/ca/${WEEKEND.ca.path}/).`,
      ),
      faq([
        {
          question: "Quan són els pessebres vivents 2026?",
          answer:
            "Cada organitzador fixa els seus dies i els publica a l'Agenda Cultural de la Generalitat, la temporada passada entre el 19 de novembre i mitjan desembre. El calendari d'aquesta pàgina els afegeix a mesura que surten. La temporada 2025-26, la majoria es van fer entre el 20 de desembre i Reis.",
        },
        {
          question: "Cal pagar per veure un pessebre vivent?",
          answer:
            "Normalment sí. La temporada 2025-26 només 3 dels 44 de l'agenda eren gratuïts i 3 més anaven amb donatiu. El preu i on comprar l'entrada són a la fitxa de cada un.",
        },
        {
          question: "Hi ha pessebre vivent a Barcelona?",
          answer:
            "Sí. El 33è Pessebre Vivent de la Torre del Suro, al Guinardó, es fa el 21 de desembre de 2026 a les 18 h, amb entrada lliure i sense inscripció, segons el seu web.",
        },
        {
          question: "On hi ha pessebres vivents a prop de Barcelona?",
          answer:
            "La temporada passada n'hi va haver, entre d'altres, al Baix Llobregat (Corbera de Llobregat, Viladecans, Sant Feliu de Llobregat), al Vallès Oriental, al Vallès Occidental, al Maresme (Premià de Dalt) i al Garraf (Canyelles, Sant Pere de Ribes). El calendari de dalt els agrupa per comarques.",
        },
        {
          question: "Quin és el pessebre vivent més antic de Catalunya?",
          answer:
            "El de Corbera de Llobregat es presenta com el primer pessebre vivent de Catalunya: segons els seus organitzadors, la primera representació va ser la nit del 24 de desembre de 1962. El de l'Espluga de Francolí es fa des del 1964.",
        },
        {
          question: "Quina diferència hi ha entre un pessebre vivent i una mostra de pessebres?",
          answer:
            "En un pessebre vivent les escenes les fan persones; en una mostra o exposició s'hi veuen pessebres i diorames fets amb figures. A la llista surten per separat.",
        },
      ]),
      ...paras(verifiedLine("ca", VERIFIED)),
      ...b2Related(["christmas", "shops", "workCalendar", "climate", "barcelonaHub"], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        "Los **belenes vivientes 2026** de Cataluña («pessebres vivents») aparecen en el calendario de abajo a medida que los organizadores los publican en la Agenda Cultural de la Generalitat, que se lee cada día: solo salen los que aún no han terminado, con pueblo, comarca, fechas y el enlace a la ficha oficial. De los más conocidos, el de Corbera de Llobregat empieza el 28 de noviembre, y Tona, les Torres de Fals, Sant Guim de la Plana, les Gunyoles y l'Espluga de Francolí ya han publicado sus días (tabla de abajo).",
      ),
      LIVE,
      callout(
        "info",
        "Cómo se hace esta lista",
        "Aparecen las actividades que su organizador ha publicado en la Agenda Cultural con «pessebre vivent» en el nombre, y nunca las que ya han terminado. Las muestras y exposiciones de belenes salen aparte. Si buscas uno que no está, puede que aún no se haya publicado o que el organizador no lo haya dado de alta en la agenda: mira la web del ayuntamiento del pueblo.",
      ),
      ...h2(
        "Qué es un belén viviente",
        "Un belén viviente es un belén hecho con personas en lugar de figuras. La gente del pueblo hace de María y José, de pastores, de Reyes y, a menudo, de los oficios de siempre, y normalmente el visitante no se sienta a ver una función, sino que recorre a pie calles, plazas, masías o bosques donde cada escena está montada.",
        "Los hay de muchos tipos, y el nombre que les pone el organizador ya lo dice: el de les Gunyoles es un «pessebre vivent parlat», con diálogos, y el de Sant Guim de la Plana, el de los oficios perdidos («dels oficis perduts»). No hay que confundirlos con las **muestras de belenes**, que exponen belenes y dioramas hechos con figuras, ni con **els Pastorets**, que son una obra de teatro.",
      ),
      ...h2(
        "Cuándo son los belenes vivientes 2026",
        "Cada organizador elige sus días y los publica en la agenda cuando los tiene: la temporada pasada, el primero apareció el 19 de noviembre, la mitad estaban a finales de noviembre y 41 de los 44 antes del 15 de diciembre. Por eso, hasta mediados de noviembre es normal que la lista esté vacía.",
        "Como referencia, en la temporada 2025-26 la Agenda Cultural recogió **44, en 22 comarcas**. El primero abrió el 29 de noviembre de 2025 y el último cerró el 11 de enero de 2026; 36 empezaron el 20 de diciembre o más tarde, y 40 habían terminado por Reyes. Las fechas de cada uno son el primer y el último día: dentro de ese intervalo, muchos solo se representan algunos días.",
        "La agenda no los recoge todos: para la misma temporada, la Federació de Pessebres Vivents de Catalunya, que agrupa a los organizadores, anunció más de 300 representaciones en 51 municipios, entre el 6 de diciembre y el 11 de enero.",
        "La temporada pasada, 32 de los 44 empezaron en sábado o domingo, y las representaciones se concentraban en fines de semana y festivos. En toda Cataluña son festivos el **martes 8**, el **viernes 25** y el **sábado 26 de diciembre de 2026** (en Arán, el 26 no lo es), y el **1 de enero** (viernes) y el **6 de enero de 2027** (miércoles), según el calendario oficial de la Generalitat.",
      ),
      ...h2(
        "Los belenes vivientes más conocidos: fechas 2026-27",
        "Estos son algunos de los belenes vivientes más conocidos de Cataluña. Las fechas salen de la web de cada organizador o ayuntamiento, y solo aparecen cuando ya han publicado las de esta temporada; cuando los den de alta en la agenda, también saldrán en el calendario de arriba. Los nombres van en catalán, como los escribe cada organizador.",
      ),
      knownTable("es"),
      ...paras(
        "Algunos tienen mucha historia. Según sus organizadores, el de **Corbera de Llobregat** hizo su primera representación la noche del 24 de diciembre de 1962 y se presenta como «el primer Pessebre Vivent de Catalunya»; el de **l'Espluga de Francolí** se hace desde 1964, y el de **Tona** nació en 1972. El de **Bàscara**, según su ayuntamiento, se representa desde la Navidad de 1973 en el casco antiguo y a orillas del Fluvià. En **Barcelona**, el de la Torre del Suro, en el Guinardó, llega a su 33.ª edición.",
      ),
      ...h2(
        "¿Hace falta entrada para ver un belén viviente?",
        "Casi siempre. De los 44 belenes vivientes de la temporada 2025-26 en la agenda, solo 3 eran gratuitos (Celrà, la Seu d'Urgell y Fornells de la Selva) y otros 3 pedían un donativo; el resto cobraban entrada, y 22 tenían un enlace de venta de entradas en la ficha.",
        "Cada organizador lo hace a su manera. Esta temporada, Corbera de Llobregat y Sant Guim de la Plana venden las entradas solo por internet; l'Espluga de Francolí, solo anticipadas y a partir del 22 de noviembre; Tona, solo en taquilla, y el de la Torre del Suro, en Barcelona, es de entrada libre. Los precios y las condiciones están en la web de cada uno: míralo antes de ir.",
        "La temporada pasada, casi todos se hacían por la tarde o al anochecer, muchos en pases con hora fija. Si vas con niños o con carrito, pregunta cuánto dura el recorrido y si es accesible: el de Sant Guim de la Plana, por ejemplo, avisa de que no lo es ni en silla de ruedas ni con carrito.",
      ),
      ...h2(
        "Cómo combinarlo con otros planes de Navidad",
        `Si quieres combinarlo con una feria, mira ${b2link("christmas", "es", "los mercados y ferias de Navidad de Cataluña")} y sus fechas. Si quieres aprovechar para comprar, ${b2link("shops", "es", "qué domingos y festivos abren las tiendas")}; para los puentes, ${b2link("workCalendar", "es", "el calendario de festivos")}, y para el resto de planes, [la agenda de este fin de semana](/es/${WEEKEND.es.path}/).`,
      ),
      faq([
        {
          question: "¿Cuándo son los belenes vivientes 2026 en Cataluña?",
          answer:
            "Cada organizador fija sus días y los publica en la Agenda Cultural de la Generalitat, la temporada pasada entre el 19 de noviembre y mediados de diciembre. El calendario de esta página los añade a medida que salen. En la temporada 2025-26, la mayoría se hicieron entre el 20 de diciembre y Reyes.",
        },
        {
          question: "¿Hay que pagar para ver un belén viviente?",
          answer:
            "Normalmente sí. En la temporada 2025-26 solo 3 de los 44 de la agenda eran gratuitos y otros 3 iban con donativo. El precio y dónde comprar la entrada están en la ficha de cada uno.",
        },
        {
          question: "¿Hay belén viviente en Barcelona?",
          answer:
            "Sí. El 33.º Pessebre Vivent de la Torre del Suro, en el Guinardó, se hace el 21 de diciembre de 2026 a las 18 h, con entrada libre y sin inscripción, según su web.",
        },
        {
          question: "¿Dónde hay belenes vivientes cerca de Barcelona?",
          answer:
            "La temporada pasada los hubo, entre otros, en el Baix Llobregat (Corbera de Llobregat, Viladecans, Sant Feliu de Llobregat), el Vallès Oriental, el Vallès Occidental, el Maresme (Premià de Dalt) y el Garraf (Canyelles, Sant Pere de Ribes). El calendario de arriba los agrupa por comarcas.",
        },
        {
          question: "¿Cuál es el belén viviente más antiguo de Cataluña?",
          answer:
            "El de Corbera de Llobregat se presenta como el primer belén viviente de Cataluña: según sus organizadores, la primera representación fue la noche del 24 de diciembre de 1962. El de l'Espluga de Francolí se hace desde 1964.",
        },
        {
          question: "¿Qué diferencia hay entre un belén viviente y una muestra de belenes?",
          answer:
            "En un belén viviente las escenas las hacen personas; en una muestra o exposición se ven belenes y dioramas hechos con figuras. En la lista salen por separado.",
        },
      ]),
      ...paras(verifiedLine("es", VERIFIED)),
      ...b2Related(["christmas", "shops", "workCalendar", "climate", "barcelonaHub"], "es"),
    ];
  }

  return [
    lead(
      "Catalonia's **living nativity scenes for Christmas 2026** (\"pessebres vivents\") appear in the calendar below as organisers post them in the Generalitat's cultural agenda, which is read every day: only those that have not finished are shown, with town, comarca (county), dates and a link to the official listing. Of the best known, Corbera de Llobregat's opens on 28 November, and Tona, les Torres de Fals, Sant Guim de la Plana, les Gunyoles and l'Espluga de Francolí have already published their days (table below).",
    ),
    LIVE,
    callout(
      "info",
      "How this list is made",
      "It shows events whose organiser has posted them in the cultural agenda with \"pessebre vivent\" in the name, and never one that has already ended. Nativity exhibitions are listed separately. If one you are looking for is missing, it may not be posted yet, or the organiser may not use the agenda: check the town council's website.",
    ),
    ...h2(
      "What is a living nativity scene?",
      "A living nativity is a nativity scene made with people instead of figures. Villagers play Mary and Joseph, the shepherds, the Three Kings and, very often, the traditional trades, and usually you do not sit and watch a show: you walk a route through streets, squares, farmhouses or woods where each scene is set up.",
      "They come in many kinds, and the organiser's own name for it usually tells you which: les Gunyoles has a \"pessebre vivent parlat\", with spoken dialogue, and Sant Guim de la Plana one \"of the lost trades\". Do not confuse them with **nativity exhibitions** (\"mostres de pessebres\"), which show nativity scenes and dioramas made with figures, or with **els Pastorets**, a Christmas play.",
    ),
    ...h2(
      "When are the living nativity scenes in 2026?",
      "Each organiser picks its own days and posts them in the agenda when they are set: last season the first appeared on 19 November, half were listed by the end of November and 41 of the 44 before 15 December. So until mid-November an empty list is normal.",
      "For reference, in the 2025-26 season the cultural agenda listed **44, in 22 comarques**. The first opened on 29 November 2025 and the last closed on 11 January 2026; 36 started on 20 December or later, and 40 had finished by Epiphany. Each one's dates are its first and last day: in between, many are performed only on some days.",
      "The agenda does not list them all: for the same season, the Federació de Pessebres Vivents de Catalunya, the organisers' association, announced more than 300 performances in 51 towns between 6 December and 11 January.",
      "Last season, 32 of the 44 started on a Saturday or Sunday, and performances were concentrated on weekends and public holidays. Catalonia-wide public holidays are **Tuesday 8**, **Friday 25** and **Saturday 26 December 2026** (26 December is not a holiday in Aran), and **1 January** (Friday) and **6 January 2027** (Wednesday), according to the Generalitat's official calendar.",
    ),
    ...h2(
      "The best-known living nativity scenes: 2026-27 dates",
      "These are some of the best-known living nativities in Catalonia. Dates come from each organiser's or town council's website and are given only once they have published this season's; when they post them in the agenda, they will also appear in the calendar above. Names are in Catalan, as each organiser writes them.",
    ),
    knownTable("en"),
    ...paras(
      "Some go back a long way. According to its organisers, **Corbera de Llobregat** first performed on the night of 24 December 1962 and calls itself \"the first living nativity in Catalonia\"; **l'Espluga de Francolí** has held one since 1964, and **Tona**'s began in 1972. **Bàscara**'s, according to its town council, has been performed since Christmas 1973 in the old town and along the river Fluvià. In **Barcelona**, the Torre del Suro nativity in the Guinardó district reaches its 33rd edition.",
    ),
    ...h2(
      "Do you need a ticket for a living nativity?",
      "Almost always. Of the 44 living nativities in the agenda in 2025-26, only 3 were free (Celrà, la Seu d'Urgell and Fornells de la Selva) and 3 more asked for a donation; the rest charged for entry, and 22 had an online ticket link on their listing.",
      "Each organiser does it differently. This season Corbera de Llobregat and Sant Guim de la Plana sell tickets online only; l'Espluga de Francolí sells advance tickets only, from 22 November; Tona sells them only at the box office; and the Torre del Suro nativity in Barcelona is free. Prices and conditions are on each website, so check before you go.",
      "Last season nearly all of them took place in the late afternoon or evening, many in timed sessions. If you are going with children or a pushchair, ask how long the route takes and whether it is accessible: Sant Guim de la Plana, for example, warns that its route is not suitable for wheelchairs or pushchairs.",
    ),
    ...h2(
      "Combining it with other Christmas plans",
      `To combine it with a fair, see ${b2link("christmas", "en", "Christmas markets in Barcelona and Catalonia")} and their dates. If you want to shop too, see ${b2link("shops", "en", "which Sundays and holidays shops may open")}; for long weekends, ${b2link("workCalendar", "en", "the public holiday calendar")}; and for everything else, [things to do this weekend](/en/${WEEKEND.en.path}/).`,
    ),
    faq([
      {
        question: "When are the living nativity scenes in Catalonia in 2026?",
        answer:
          "Each organiser sets its own days and posts them in the Generalitat's cultural agenda; last season that happened between 19 November and mid-December. The calendar on this page adds each one as it appears. In 2025-26 most ran between 20 December and 6 January.",
      },
      {
        question: "Is there a living nativity scene in Barcelona?",
        answer:
          "Yes. The 33rd Torre del Suro living nativity, in the Guinardó district, is on 21 December 2026 at 18:00, free and with no booking needed, according to its website.",
      },
      {
        question: "Are there living nativity scenes near Barcelona?",
        answer:
          "Last season there were, among others, in the Baix Llobregat (Corbera de Llobregat, Viladecans, Sant Feliu de Llobregat), the Vallès Oriental, the Vallès Occidental, the Maresme (Premià de Dalt) and the Garraf (Canyelles, Sant Pere de Ribes). The calendar above groups them by comarca.",
      },
      {
        question: "What is the oldest living nativity in Catalonia?",
        answer:
          "Corbera de Llobregat's calls itself the first in Catalonia: according to its organisers, it was first performed on the night of 24 December 1962. L'Espluga de Francolí has held one since 1964.",
      },
      {
        question: "Do living nativity scenes cost money?",
        answer:
          "Usually, yes. In 2025-26 only 3 of the 44 in the agenda were free and 3 more asked for a donation. The price and where to buy a ticket are on each listing.",
      },
      {
        question: "What is the difference between a living nativity and a nativity exhibition?",
        answer:
          "In a living nativity the scenes are played by people; an exhibition (\"mostra\") shows nativity scenes and dioramas made with figures. The list shows them separately.",
      },
    ]),
    ...paras(verifiedLine("en", VERIFIED)),
    ...b2Related(["christmas", "shops", "workCalendar", "climate", "barcelonaHub"], "en"),
  ];
}

export const PESSEBRES: B2Article = {
  key: "pessebres",
  entryKey: "guide-living-nativity-scenes-catalonia",
  categoryKey: "festivals",
  sources: SOURCES,
  heroKey: CHRISTMAS.secondaryKey,
  heroAlt: CHRISTMAS.secondaryAlt,
  heroCaption: CHRISTMAS.secondaryCaption,
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-25T09:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};
