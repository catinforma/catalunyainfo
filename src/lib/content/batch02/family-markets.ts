import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  callout,
  faq,
  h2,
  lead,
  list,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Two Barcelona guides: the Zoo and the Aquarium, and the food markets.
 *
 * Zoo from zoobarcelona.cat, Aquarium from aquariumbcn.com (hours read from
 * the calendar data behind its own page), markets from the City Council's
 * markets institute and its 2017, 2019 and Aug 2026 notes. Checked on
 * 12 Oct 2026 (research_notes/blog-batch-03/zoo_aquarium.md, markets.md).
 *
 * Left out: the Zoo's seasonal timetable (the site shows only today's hours),
 * the Zoo Club price (the site states two), any Zoo + Aquarium combo (only
 * resellers sell one), Boqueria stall-by-stall habits (blogs only), and the
 * group rules at Santa Caterina and Sant Antoni, which were not reconfirmed.
 */

const VERIFIED = "2026-10-12";
type Meta = { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string };

/* ========================================================================== */
/* Zoo and Aquarium                                                           */
/* ========================================================================== */

const ZOO_SOURCES: B2Source[] = [
  { name: "Zoo de Barcelona", url: "https://www.zoobarcelona.cat/", publisher: "Zoo de Barcelona (BSM)" },
  { name: "L'Aquàrium de Barcelona — prices", url: "https://www.aquariumbcn.com/en/visit/prices/", publisher: "L'Aquàrium de Barcelona" },
  { name: "L'Aquàrium de Barcelona — opening hours", url: "https://www.aquariumbcn.com/en/visit/opening-hours/", publisher: "L'Aquàrium de Barcelona" },
];

const ZOO_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/zoo-aquarium-barcelona",
    title: "Zoo i Aquàrium de Barcelona: entrades, horaris i com arribar-hi",
    seoTitle: "Zoo i Aquàrium de Barcelona: preus i horaris",
    seoDescription:
      "Zoo de Barcelona a 23 € (infants 13,90 €) i Aquàrium a 30 € (5 a 10 anys, 23 €), horaris, qui entra gratis i com arribar-hi en metro, amb els preus oficials.",
    excerpt: "Quant costen el Zoo i l'Aquàrium de Barcelona, quan obren, qui hi entra gratis i com s'hi arriba, amb dades dels webs oficials.",
  },
  es: {
    path: "guias/zoo-aquarium-barcelona",
    title: "Zoo y Aquarium de Barcelona: entradas, horarios y cómo llegar",
    seoTitle: "Zoo y Aquarium de Barcelona: precios y horarios",
    seoDescription:
      "Zoo de Barcelona a 23 € (niños 13,90 €) y Aquarium a 30 € (de 5 a 10 años, 23 €), horarios, quién entra gratis y cómo llegar en metro, con los precios oficiales.",
    excerpt: "Cuánto cuestan el Zoo y el Aquarium de Barcelona, cuándo abren, quién entra gratis y cómo se llega, con datos de las webs oficiales.",
  },
  en: {
    path: "guides/barcelona-zoo-aquarium-tickets",
    title: "Barcelona Zoo and Aquarium: tickets, opening hours and getting there",
    seoTitle: "Barcelona Zoo and Aquarium: ticket prices and hours",
    seoDescription:
      "Barcelona Zoo €23 (children €13.90) and the Aquarium €30 (ages 5–10 €23), opening hours, who goes free and how to get there by metro, from the official sites.",
    excerpt: "What Barcelona Zoo and the Aquarium cost, when they open, who goes free and how to get there, from the official websites.",
  },
};

type ZT = {
  lead: string;
  pCaption: string; pHeaders: string[]; pRows: string[][]; pNote: string;
  zooTitle: string; zoo: string[];
  aqTitle: string; aq: string[];
  getTitle: string; get: string[];
  faq: { question: string; answer: string }[]; note: string;
};

const ZOO_COPY: Record<Locale, ZT> = {
  en: {
    lead: "Barcelona's **Zoo**, in the Parc de la Ciutadella, and the **Aquarium**, on the Port Vell, are the city's two big family visits, a short metro ride apart. Both charge the same price online and at the door; buying online only saves the queue.",
    pCaption: "Ticket prices",
    pHeaders: ["Ticket", "Zoo", "Aquarium"],
    pRows: [
      ["Adult", "€23", "€30 (11 and over)"],
      ["Child", "€13.90 (3 to 12)", "€23 (5 to 10), €15 (3 to 4)"],
      ["Senior", "€11.20 (over 65, ticket office)", "€25 (over 65)"],
      ["Under 3", "Free", "Free"],
    ],
    pNote: "From zoobarcelona.cat and aquariumbcn.com, checked on 12 October 2026. There is no official combined Zoo and Aquarium ticket.",
    zooTitle: "Zoo de Barcelona",
    zoo: [
      "The Zoo is **open every day of the year** and only closes in the afternoon on Christmas Day. On the day we checked it opened 10:00–18:00 with last entry at 17:00; it publishes the current day's hours on its home page. Large-family and single-parent cards get 20% off at the ticket office, and visitors with functional diversity pay €6 with a free companion.",
    ],
    aqTitle: "L'Aquàrium",
    aq: [
      "The Aquarium is also **open every day**, with last entry an hour before closing: 10:00–20:00 until 1 November, then 10:00–19:00 on weekdays and 10:00–20:00 at weekends from 2 November to 24 December, and 10:00–20:00 from 25 to 31 December. Hours for 2027 are not published yet.",
      "Online-only packs bring the price down for groups: the **Family Pack** (two adults and two children) costs €88, and a pack for four adults €100.",
    ],
    getTitle: "Getting there",
    get: [
      "**Zoo:** main entrance in the Parc de la Ciutadella; metro L4 Barceloneta or L1 Arc de Triomf.",
      "**Aquarium:** Moll d'Espanya in the Port Vell; metro L4 Barceloneta or L3 Drassanes.",
      "**Both in one day:** Barceloneta station (L4) and buses H14, V17 and V19 serve both.",
    ],
    faq: [
      { question: "How much is Barcelona Zoo?", answer: "€23 for adults and €13.90 for children aged 3 to 12; under-3s free. Same price online and at the gate." },
      { question: "How much is the Barcelona Aquarium?", answer: "€30 for adults, €23 for ages 5 to 10, €15 for ages 3 to 4, €25 for over-65s; under-3s free." },
      { question: "Is there a combined Zoo and Aquarium ticket?", answer: "Not from either venue. Only resellers offer combinations." },
    ],
    note: "Prices and hours change: check the Zoo and Aquarium websites for your date.",
  },
  es: {
    lead: "El **Zoo** de Barcelona, en el parque de la Ciutadella, y el **Aquarium**, en el Port Vell, son las dos grandes visitas en familia de la ciudad, a poca distancia en metro. Los dos cobran lo mismo en línea y en taquilla: comprar en línea solo ahorra la cola.",
    pCaption: "Precios de las entradas",
    pHeaders: ["Entrada", "Zoo", "Aquarium"],
    pRows: [
      ["Adulto", "23 €", "30 € (11 años o más)"],
      ["Niño", "13,90 € (de 3 a 12)", "23 € (de 5 a 10), 15 € (de 3 a 4)"],
      ["Sénior", "11,20 € (mayores de 65, en taquilla)", "25 € (mayores de 65)"],
      ["Menores de 3", "Gratis", "Gratis"],
    ],
    pNote: "De zoobarcelona.cat y aquariumbcn.com, comprobado el 12 de octubre de 2026. No hay entrada combinada oficial Zoo y Aquarium.",
    zooTitle: "Zoo de Barcelona",
    zoo: [
      "El Zoo **abre todos los días del año** y solo cierra por la tarde el día de Navidad. El día que lo comprobamos abría de 10:00 a 18:00 con último acceso a las 17:00; publica el horario del día en su portada. Las familias numerosas y monoparentales tienen un 20 % de descuento en taquilla, y las personas con diversidad funcional pagan 6 € con acompañante gratuito.",
    ],
    aqTitle: "L'Aquàrium",
    aq: [
      "El Aquarium también **abre todos los días**, con último acceso una hora antes del cierre: de 10:00 a 20:00 hasta el 1 de noviembre, luego de 10:00 a 19:00 entre semana y de 10:00 a 20:00 los fines de semana del 2 de noviembre al 24 de diciembre, y de 10:00 a 20:00 del 25 al 31 de diciembre. El horario de 2027 aún no está publicado.",
      "Los packs solo en línea abaratan el precio en grupo: el **Family Pack** (dos adultos y dos niños) cuesta 88 €, y el de cuatro adultos, 100 €.",
    ],
    getTitle: "Cómo llegar",
    get: [
      "**Zoo:** entrada principal en el parque de la Ciutadella; metro L4 Barceloneta o L1 Arc de Triomf.",
      "**Aquarium:** Moll d'Espanya, en el Port Vell; metro L4 Barceloneta o L3 Drassanes.",
      "**Los dos el mismo día:** la estación de Barceloneta (L4) y los buses H14, V17 y V19 sirven para ambos.",
    ],
    faq: [
      { question: "¿Cuánto cuesta el Zoo de Barcelona?", answer: "23 € los adultos y 13,90 € los niños de 3 a 12 años; los menores de 3, gratis. Mismo precio en línea y en taquilla." },
      { question: "¿Cuánto cuesta el Aquarium de Barcelona?", answer: "30 € adultos, 23 € de 5 a 10 años, 15 € de 3 a 4 años, 25 € mayores de 65; menores de 3, gratis." },
      { question: "¿Hay entrada combinada Zoo y Aquarium?", answer: "No por parte de ninguno de los dos. Solo los revendedores ofrecen combinados." },
    ],
    note: "Precios y horarios cambian: consulta las webs del Zoo y del Aquarium para tu fecha.",
  },
  ca: {
    lead: "El **Zoo** de Barcelona, al parc de la Ciutadella, i l'**Aquàrium**, al Port Vell, són les dues grans visites en família de la ciutat, a poca distància en metro. Tots dos cobren el mateix en línia i a taquilla: comprar en línia només estalvia la cua.",
    pCaption: "Preus de les entrades",
    pHeaders: ["Entrada", "Zoo", "Aquàrium"],
    pRows: [
      ["Adult", "23 €", "30 € (11 anys o més)"],
      ["Infant", "13,90 € (de 3 a 12)", "23 € (de 5 a 10), 15 € (de 3 a 4)"],
      ["Sènior", "11,20 € (majors de 65, a taquilla)", "25 € (majors de 65)"],
      ["Menors de 3", "Gratis", "Gratis"],
    ],
    pNote: "De zoobarcelona.cat i aquariumbcn.com, comprovat el 12 d'octubre de 2026. No hi ha entrada combinada oficial Zoo i Aquàrium.",
    zooTitle: "Zoo de Barcelona",
    zoo: [
      "El Zoo **obre cada dia de l'any** i només tanca a la tarda el dia de Nadal. El dia que ho vam comprovar obria de 10:00 a 18:00 amb últim accés a les 17:00; publica l'horari del dia a la portada. Les famílies nombroses i monoparentals tenen un 20 % de descompte a taquilla, i les persones amb diversitat funcional paguen 6 € amb acompanyant gratuït.",
    ],
    aqTitle: "L'Aquàrium",
    aq: [
      "L'Aquàrium també **obre cada dia**, amb últim accés una hora abans del tancament: de 10:00 a 20:00 fins a l'1 de novembre, després de 10:00 a 19:00 entre setmana i de 10:00 a 20:00 els caps de setmana del 2 de novembre al 24 de desembre, i de 10:00 a 20:00 del 25 al 31 de desembre. L'horari del 2027 encara no està publicat.",
      "Els paquets només en línia abaixen el preu en grup: el **Family Pack** (dos adults i dos infants) costa 88 €, i el de quatre adults, 100 €.",
    ],
    getTitle: "Com arribar-hi",
    get: [
      "**Zoo:** entrada principal al parc de la Ciutadella; metro L4 Barceloneta o L1 Arc de Triomf.",
      "**Aquàrium:** Moll d'Espanya, al Port Vell; metro L4 Barceloneta o L3 Drassanes.",
      "**Tots dos el mateix dia:** l'estació de Barceloneta (L4) i els busos H14, V17 i V19 serveixen per a tots dos.",
    ],
    faq: [
      { question: "Quant costa el Zoo de Barcelona?", answer: "23 € els adults i 13,90 € els infants de 3 a 12 anys; els menors de 3, gratis. Mateix preu en línia i a taquilla." },
      { question: "Quant costa l'Aquàrium de Barcelona?", answer: "30 € adults, 23 € de 5 a 10 anys, 15 € de 3 a 4 anys, 25 € majors de 65; menors de 3, gratis." },
      { question: "Hi ha entrada combinada Zoo i Aquàrium?", answer: "No per part de cap dels dos. Només els revenedors ofereixen combinats." },
    ],
    note: "Els preus i els horaris canvien: consulta els webs del Zoo i de l'Aquàrium per a la teva data.",
  },
};

function zooBody(locale: Locale) {
  const t = ZOO_COPY[locale];
  return [
    lead(t.lead),
    table(t.pCaption, t.pHeaders, t.pRows, t.pNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.zooTitle, ...t.zoo),
    ...h2(t.aqTitle, ...t.aq),
    ...h2(t.getTitle),
    list(...t.get),
    faq(t.faq),
    ...b2Related(["museums", "tibidabo", "montjuic"], locale),
  ];
}

export const ZOO_AQUARIUM: B2Article = {
  key: "zooAquarium",
  entryKey: "guide-barcelona-zoo-aquarium",
  categoryKey: "cities",
  sources: ZOO_SOURCES,
  heroKey: "aquarium-tunel",
  heroAlt: {
    ca: "Visitants al túnel de vidre de l'Aquàrium de Barcelona, envoltats de peixos",
    es: "Visitantes en el túnel de cristal del Aquarium de Barcelona, rodeados de peces",
    en: "Visitors in the Barcelona Aquarium's glass tunnel, surrounded by fish",
  },
  heroCaption: {
    ca: "El túnel de l'Aquàrium, al Port Vell.",
    es: "El túnel del Aquarium, en el Port Vell.",
    en: "The Aquarium's tunnel on the Port Vell.",
  },
  secondaryKey: "zoo-entrada-ciutadella",
  secondaryAlt: {
    ca: "L'entrada del Zoo de Barcelona des del parc de la Ciutadella",
    es: "La entrada del Zoo de Barcelona desde el parque de la Ciutadella",
    en: "The entrance to Barcelona Zoo from the Parc de la Ciutadella",
  },
  secondaryCaption: {
    ca: "L'entrada del Zoo, al parc de la Ciutadella.",
    es: "La entrada del Zoo, en el parque de la Ciutadella.",
    en: "The Zoo entrance in the Parc de la Ciutadella.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T01:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...ZOO_META[locale], blocks: zooBody(locale) }]),
  ) as B2Article["editions"],
};

/* ========================================================================== */
/* Food markets                                                               */
/* ========================================================================== */

const MARKETS_SOURCES: B2Source[] = [
  { name: "Mercat de Sant Josep - la Boqueria", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-sant-josep-la-boqueria-92086009447", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat de Santa Caterina", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-santa-caterina-92086009448", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat de Sant Antoni", url: "https://ajuntament.barcelona.cat/mercats/ca/punts-alimentaris/mercat-de-sant-antoni-92086009452", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Mercat dominical de Sant Antoni", url: "https://ajuntament.barcelona.cat/mercats/ca/mercats-no-alimentaris/mercat-dominical-de-sant-antoni-96058202955", publisher: "Institut Municipal de Mercats de Barcelona" },
  { name: "Nota sobre la reforma de la Boqueria (27.08.2026)", url: "https://ajuntament.barcelona.cat/mercats/sites/default/files/2026-08/260827_NOTA_reformaBoqueriapropermandat_def.pdf", publisher: "Ajuntament de Barcelona" },
];

const MARKETS_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/mercat-boqueria-mercats-barcelona",
    title: "La Boqueria i els mercats de Barcelona: horaris i normes per visitar-los",
    seoTitle: "La Boqueria i els mercats de Barcelona: horaris i normes",
    seoDescription:
      "La Boqueria obre de dilluns a dissabte de 8:00 a 20:30 i tanca els diumenges. Horaris de Santa Caterina, Sant Antoni i la resta, i la norma dels grups turístics.",
    excerpt: "Quan obren la Boqueria i els altres grans mercats de Barcelona, les normes per als grups de visitants i què canviarà amb la reforma.",
  },
  es: {
    path: "guias/mercado-boqueria-mercados-barcelona",
    title: "La Boqueria y los mercados de Barcelona: horarios y normas para visitarlos",
    seoTitle: "La Boqueria y los mercados de Barcelona: horarios y normas",
    seoDescription:
      "La Boqueria abre de lunes a sábado de 8:00 a 20:30 y cierra los domingos. Horarios de Santa Caterina, Sant Antoni y el resto, y la norma de los grupos turísticos.",
    excerpt: "Cuándo abren la Boqueria y los otros grandes mercados de Barcelona, las normas para los grupos de visitantes y qué cambiará con la reforma.",
  },
  en: {
    path: "guides/la-boqueria-barcelona-markets",
    title: "La Boqueria and Barcelona's food markets: opening hours and visiting rules",
    seoTitle: "La Boqueria and Barcelona markets: opening hours and rules",
    seoDescription:
      "La Boqueria opens Monday to Saturday, 8:00 to 20:30, and closes on Sundays. Hours for Santa Caterina, Sant Antoni and the rest, and the tour-group rule.",
    excerpt: "When La Boqueria and Barcelona's other big markets open, the rules for visitor groups, and what the renovation will change.",
  },
};

type MKT = {
  lead: string;
  boqTitle: string; boq: string[];
  rulesTitle: string; rules: string[];
  hCaption: string; hHeaders: string[]; hRows: string[][]; hNote: string;
  bookTitle: string; book: string;
  tipsTitle: string; tips: string[];
  faq: { question: string; answer: string }[]; note: string;
};

const MARKETS_COPY: Record<Locale, MKT> = {
  en: {
    lead: "Barcelona's food markets are working markets first: the city runs them for the people who shop there, and it has set rules to keep them that way. **La Boqueria** on La Rambla opens **Monday to Saturday, 8:00 to 20:30**, and is closed on Sundays.",
    boqTitle: "La Boqueria",
    boq: [
      "The Mercat de Sant Josep, La Boqueria, opens Monday to Saturday from 8:00 to 20:30; the nearest metro is Liceu (L3). It opens on a few Sundays before Christmas, which the city announces each year.",
      "A renovation is under way: smaller works start after the summer of 2026, the central fish stalls are expected to move temporarily to Plaça de la Gardunya, and the main works on the roof and structure run from 2027 to 2029, with trading continuing where possible.",
    ],
    rulesTitle: "Rules for visitors",
    rules: [
      "**Tour groups of 15 or more with a guide cannot enter La Boqueria on Fridays and Saturdays from April to October**, all day. The rule dates from 2017 and the City Council restated it in August 2026.",
      "Security staff can ask visitors to leave if they block the aisles, handle food to photograph it, eat or drink outside the eating areas, or make a lot of noise. In the streets of Ciutat Vella, guided groups are capped at 20 people.",
    ],
    hCaption: "Opening hours of the city's main markets",
    hHeaders: ["Market", "Opening hours"],
    hRows: [
      ["La Boqueria", "Monday to Saturday 8:00–20:30"],
      ["Santa Caterina", "Tue, Thu, Fri 7:30–20:30; Mon, Wed, Sat 7:30–14:30 (September to June)"],
      ["Sant Antoni", "Monday to Saturday 8:00–20:30"],
      ["La Concepció", "Mon and Sat 8:00–15:00; Tue to Fri 8:00–20:00"],
      ["La Llibertat", "Mon to Fri 8:00–20:30; Sat 8:00–15:00"],
      ["El Ninot", "Mon to Thu 8:00–20:00; Fri and Sat 8:00–17:00"],
    ],
    hNote: "From the City Council's markets institute, checked on 12 October 2026. Market hours are the building's; individual stalls set their own.",
    bookTitle: "Sunday book market at Sant Antoni",
    book: "Around Sant Antoni market, the Sunday book, comics and collectables market runs every Sunday from 8:30 to 14:00, including Sundays that are public holidays.",
    tipsTitle: "Tips",
    tips: [
      "**Check the day:** hours vary by market and by weekday, as the table shows.",
      "**Monday afternoons** are short at Santa Caterina and La Concepció, which close at 14:30 and 15:00.",
      "**Buy something:** these are food markets, and the stallholders' living depends on sales, not footfall.",
    ],
    faq: [
      { question: "Is La Boqueria open on Sundays?", answer: "No. It opens Monday to Saturday from 8:00 to 20:30, plus a few Sundays before Christmas announced each year." },
      { question: "Can tour groups visit La Boqueria?", answer: "Not groups of 15 or more with a guide on Fridays and Saturdays from April to October." },
      { question: "What time does La Boqueria close?", answer: "At 20:30, Monday to Saturday; each stall sets its own hours within that." },
    ],
    note: "Market hours change for holidays and works: check the City Council's markets pages.",
  },
  es: {
    lead: "Los mercados de Barcelona son ante todo mercados de barrio: el Ayuntamiento los gestiona para quien compra en ellos y ha fijado normas para que sigan siéndolo. **La Boqueria**, en La Rambla, abre **de lunes a sábado de 8:00 a 20:30** y cierra los domingos.",
    boqTitle: "La Boqueria",
    boq: [
      "El Mercat de Sant Josep, la Boqueria, abre de lunes a sábado de 8:00 a 20:30; el metro más cercano es Liceu (L3). Abre algunos domingos antes de Navidad, que el Ayuntamiento anuncia cada año.",
      "Hay una reforma en marcha: las obras menores empiezan después del verano de 2026, está previsto que las paradas centrales de pescado se trasladen temporalmente a la plaza de la Gardunya, y las obras grandes de cubierta y estructura van de 2027 a 2029, manteniendo la actividad donde sea posible.",
    ],
    rulesTitle: "Normas para los visitantes",
    rules: [
      "**Los grupos turísticos de 15 personas o más con guía no pueden entrar en la Boqueria los viernes y sábados de abril a octubre**, en todo el horario. La norma es de 2017 y el Ayuntamiento la recordó en agosto de 2026.",
      "El personal de seguridad puede pedir que salga a quien bloquee los pasillos, manipule alimentos para fotografiarlos, coma o beba fuera de las zonas de restauración o haga mucho ruido. En las calles de Ciutat Vella, los grupos guiados tienen un máximo de 20 personas.",
    ],
    hCaption: "Horario de los principales mercados de la ciudad",
    hHeaders: ["Mercado", "Horario"],
    hRows: [
      ["La Boqueria", "De lunes a sábado 8:00–20:30"],
      ["Santa Caterina", "Mar, jue, vie 7:30–20:30; lun, mié, sáb 7:30–14:30 (de septiembre a junio)"],
      ["Sant Antoni", "De lunes a sábado 8:00–20:30"],
      ["La Concepció", "Lun y sáb 8:00–15:00; de mar a vie 8:00–20:00"],
      ["La Llibertat", "De lun a vie 8:00–20:30; sáb 8:00–15:00"],
      ["El Ninot", "De lun a jue 8:00–20:00; vie y sáb 8:00–17:00"],
    ],
    hNote: "Del Instituto Municipal de Mercados, comprobado el 12 de octubre de 2026. El horario es el del edificio; cada parada fija el suyo.",
    bookTitle: "Mercado dominical de Sant Antoni",
    book: "Alrededor del mercado de Sant Antoni, el mercado dominical de libros, cómics y coleccionismo se hace todos los domingos de 8:30 a 14:00, también los domingos festivos.",
    tipsTitle: "Consejos",
    tips: [
      "**Mira el día:** el horario cambia según el mercado y el día de la semana, como muestra la tabla.",
      "**Los lunes por la tarde** Santa Caterina y la Concepció cierran pronto, a las 14:30 y a las 15:00.",
      "**Compra algo:** son mercados de alimentación y los paradistas viven de las ventas, no de las visitas.",
    ],
    faq: [
      { question: "¿La Boqueria abre los domingos?", answer: "No. Abre de lunes a sábado de 8:00 a 20:30, más algunos domingos antes de Navidad que se anuncian cada año." },
      { question: "¿Pueden visitar la Boqueria los grupos turísticos?", answer: "No los grupos de 15 personas o más con guía, los viernes y sábados de abril a octubre." },
      { question: "¿A qué hora cierra la Boqueria?", answer: "A las 20:30, de lunes a sábado; cada parada fija su horario dentro de ese." },
    ],
    note: "Los horarios de los mercados cambian por fiestas y obras: consulta las páginas de mercados del Ayuntamiento.",
  },
  ca: {
    lead: "Els mercats de Barcelona són abans de res mercats de barri: l'Ajuntament els gestiona per a qui hi compra i hi ha fixat normes perquè ho continuïn sent. **La Boqueria**, a la Rambla, obre **de dilluns a dissabte de 8:00 a 20:30** i tanca els diumenges.",
    boqTitle: "La Boqueria",
    boq: [
      "El Mercat de Sant Josep, la Boqueria, obre de dilluns a dissabte de 8:00 a 20:30; el metro més proper és Liceu (L3). Obre alguns diumenges abans de Nadal, que l'Ajuntament anuncia cada any.",
      "Hi ha una reforma en marxa: les obres menors comencen després de l'estiu del 2026, està previst que les parades centrals de peix es traslladin temporalment a la plaça de la Gardunya, i les obres grans de coberta i estructura van del 2027 al 2029, mantenint l'activitat on sigui possible.",
    ],
    rulesTitle: "Normes per als visitants",
    rules: [
      "**Els grups turístics de 15 persones o més amb guia no poden entrar a la Boqueria els divendres i dissabtes d'abril a octubre**, en tot l'horari. La norma és del 2017 i l'Ajuntament la va recordar l'agost de 2026.",
      "El personal de seguretat pot demanar que surti a qui bloquegi els passadissos, manipuli aliments per fotografiar-los, mengi o begui fora de les zones de restauració o faci molt de soroll. Als carrers de Ciutat Vella, els grups guiats tenen un màxim de 20 persones.",
    ],
    hCaption: "Horari dels principals mercats de la ciutat",
    hHeaders: ["Mercat", "Horari"],
    hRows: [
      ["La Boqueria", "De dilluns a dissabte 8:00–20:30"],
      ["Santa Caterina", "Dt, dj, dv 7:30–20:30; dl, dc, ds 7:30–14:30 (de setembre a juny)"],
      ["Sant Antoni", "De dilluns a dissabte 8:00–20:30"],
      ["La Concepció", "Dl i ds 8:00–15:00; de dt a dv 8:00–20:00"],
      ["La Llibertat", "De dl a dv 8:00–20:30; ds 8:00–15:00"],
      ["El Ninot", "De dl a dj 8:00–20:00; dv i ds 8:00–17:00"],
    ],
    hNote: "De l'Institut Municipal de Mercats, comprovat el 12 d'octubre de 2026. L'horari és el de l'edifici; cada parada fixa el seu.",
    bookTitle: "Mercat dominical de Sant Antoni",
    book: "Al voltant del mercat de Sant Antoni, el mercat dominical de llibres, còmics i col·leccionisme es fa cada diumenge de 8:30 a 14:00, també els diumenges festius.",
    tipsTitle: "Consells",
    tips: [
      "**Mira el dia:** l'horari canvia segons el mercat i el dia de la setmana, com mostra la taula.",
      "**Els dilluns a la tarda** Santa Caterina i la Concepció tanquen d'hora, a les 14:30 i a les 15:00.",
      "**Compra alguna cosa:** són mercats d'alimentació i els paradistes viuen de les vendes, no de les visites.",
    ],
    faq: [
      { question: "La Boqueria obre els diumenges?", answer: "No. Obre de dilluns a dissabte de 8:00 a 20:30, més alguns diumenges abans de Nadal que s'anuncien cada any." },
      { question: "Poden visitar la Boqueria els grups turístics?", answer: "No els grups de 15 persones o més amb guia, els divendres i dissabtes d'abril a octubre." },
      { question: "A quina hora tanca la Boqueria?", answer: "A les 20:30, de dilluns a dissabte; cada parada fixa el seu horari dins d'aquest." },
    ],
    note: "Els horaris dels mercats canvien per festes i obres: consulta les pàgines de mercats de l'Ajuntament.",
  },
};

function marketsBody(locale: Locale) {
  const t = MARKETS_COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.boqTitle, ...t.boq),
    ...h2(t.rulesTitle, ...t.rules),
    table(t.hCaption, t.hHeaders, t.hRows, t.hNote),
    ...h2(t.bookTitle, t.book),
    ...h2(t.tipsTitle),
    list(...t.tips),
    faq(t.faq),
    ...b2Related(["museums", "monuments", "hours"], locale),
  ];
}

export const MARKETS: B2Article = {
  key: "markets",
  entryKey: "guide-boqueria-barcelona-markets",
  categoryKey: "food",
  sources: MARKETS_SOURCES,
  heroKey: "mercats-santa-caterina-coberta",
  heroAlt: {
    ca: "La coberta ondulada de colors del mercat de Santa Caterina",
    es: "La cubierta ondulada de colores del mercado de Santa Caterina",
    en: "The colourful wave-shaped roof of Santa Caterina market",
  },
  heroCaption: {
    ca: "La coberta del mercat de Santa Caterina.",
    es: "La cubierta del mercado de Santa Caterina.",
    en: "The roof of Santa Caterina market.",
  },
  secondaryKey: "mercats-boqueria-rotol",
  secondaryAlt: {
    ca: "El rètol modernista de l'entrada del Mercat de Sant Josep, la Boqueria",
    es: "El rótulo modernista de la entrada del Mercat de Sant Josep, la Boqueria",
    en: "The Modernista sign over the entrance to the Mercat de Sant Josep, La Boqueria",
  },
  secondaryCaption: {
    ca: "L'entrada de la Boqueria, a la Rambla.",
    es: "La entrada de la Boqueria, en La Rambla.",
    en: "The entrance to La Boqueria on La Rambla.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T01:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...MARKETS_META[locale], blocks: marketsBody(locale) }]),
  ) as B2Article["editions"],
};

export { ZOO_META, MARKETS_META };
