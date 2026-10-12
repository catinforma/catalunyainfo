import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  callout,
  faq,
  h2,
  lead,
  list,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Spotify Camp Nou: the museum visit, match tickets and how to get there.
 *
 * Every statement comes from FC Barcelona's own pages or TMB, checked on
 * 12 Oct 2026 (research_notes/blog-batch-03/campnou.md). The stadium is still
 * part-open while works continue, so the copy says only what the club says:
 * reduced capacity, no completion date. Reduced and child museum prices are
 * omitted: the only page carrying them is from 2023 and the live shop could
 * not be read. Date-specific museum closures are not listed either; they are
 * announced week by week.
 */

const VERIFIED = "2026-10-12";

const SOURCES: B2Source[] = [
  { name: "Barça Immersive Tour — tickets and hours", url: "https://www.fcbarcelona.com/en/tickets/camp-nou-experience", publisher: "FC Barcelona" },
  { name: "Football tickets", url: "https://www.fcbarcelona.com/en/tickets/football", publisher: "FC Barcelona" },
  { name: "FC Barcelona — stadium capacity statement", url: "https://www.fcbarcelona.com/en/club/news/4465846/fc-barcelona-official-statement", publisher: "FC Barcelona" },
  { name: "Getting to Spotify Camp Nou", url: "https://www.fcbarcelona.com/en/card/4562313/getting-to-spotify-camp-nou", publisher: "FC Barcelona" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/spotify-camp-nou-museu-visita",
    title: "Spotify Camp Nou: visita al museu, entrades de partit i com arribar-hi",
    seoTitle: "Spotify Camp Nou: museu, entrades i com arribar-hi",
    seoDescription:
      "El museu del Barça des de 28 €, horaris d'hivern, com es compren les entrades de partit i quin metro agafar. L'estadi segueix en obres: el que diu el club.",
    excerpt:
      "Què es pot visitar ara al Spotify Camp Nou, quant costa, com es compren les entrades de partit i com arribar-hi, segons el FC Barcelona i TMB.",
  },
  es: {
    path: "guias/spotify-camp-nou-museo-visita",
    title: "Spotify Camp Nou: visita al museo, entradas de partido y cómo llegar",
    seoTitle: "Spotify Camp Nou: museo, entradas y cómo llegar",
    seoDescription:
      "El museo del Barça desde 28 €, horario de invierno, cómo se compran las entradas de partido y qué metro coger. El estadio sigue en obras: lo que dice el club.",
    excerpt:
      "Qué se puede visitar ahora en el Spotify Camp Nou, cuánto cuesta, cómo se compran las entradas de partido y cómo llegar, según el FC Barcelona y TMB.",
  },
  en: {
    path: "guides/spotify-camp-nou-tour-museum",
    title: "Spotify Camp Nou: museum tour, match tickets and how to get there",
    seoTitle: "Spotify Camp Nou tour: museum, tickets and how to get there",
    seoDescription:
      "The Barça museum from €28, winter opening hours, how match tickets are sold and which metro to take. The stadium is still under works: what the club says.",
    excerpt:
      "What you can visit at Spotify Camp Nou now, what it costs, how match tickets are sold and how to get there, from FC Barcelona and TMB.",
  },
};

type T = {
  lead: string;
  statusTitle: string;
  status: string[];
  museumTitle: string;
  museum: string[];
  hoursTitle: string;
  hours: string[];
  matchTitle: string;
  match: string[];
  getTitle: string;
  get: string[];
  tipsTitle: string;
  tips: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "FC Barcelona is back at **Spotify Camp Nou**, but the stadium is open only in part while the rebuild goes on. The museum, now the **Barça Immersive Tour**, is open all year; match tickets are sold only through the club. Here is what the club itself says about each.",
    statusTitle: "The stadium right now",
    status: [
      "The club has been reopening the stadium in phases. Its current licence allows **62,652 spectators**, and the club says construction continues through the 2026-27 season with reduced capacity; season-ticket holder status stays suspended until full capacity returns. No completion date has been announced. Finished, the stadium will hold more than 104,000 people, and it is due to host the 2029 men's Champions League final.",
    ],
    museumTitle: "The museum: Barça Immersive Tour",
    museum: [
      "The basic museum ticket starts **from €28** and includes the museum, a digital audio guide and a viewpoint over the construction works. Other products, with guided visits or extras, start from €38 and go up to €199. The club advises buying online to avoid queues.",
      "The visit includes an immersive room that the club does not recommend for people with epilepsy or photosensitivity. People with a disability certificate of 33% or more, and one companion, get 50% off at the ticket office.",
    ],
    hoursTitle: "Opening hours",
    hours: [
      "From 19 October to 19 March the museum opens **10:00 to 18:00**; from 20 March to 17 October, 9:30 to 19:00. Last entry is 45 minutes before closing and the visit takes about an hour. It is closed on 25 December and 1 January.",
      "On match days and some other days the hours change, and the club announces each change on its tickets page. The club names Saturdays from 15:00 to 17:00 as the quietest time, except on first-team match days.",
    ],
    matchTitle: "Match tickets",
    match: [
      "Tickets are sold through fcbarcelona.com and the club's own ticket shop, fixture by fixture; season-pass holders get first access to passes. Tickets are digital and arrive between 24 and 3 hours before kick-off, and the gates open an hour and a half before the match.",
      "The club runs daily checks against fraudulent purchases and resale. The safe channel is the official site.",
    ],
    getTitle: "Getting there",
    get: [
      "**Metro:** TMB recommends Collblanc (L5, L9 Sud and L10 Sud) and Palau Reial (L3) as the closest stations; Les Corts and Badal also serve the stadium.",
      "**Tram:** T1, T2 and T3, at stops such as Palau Reial and Avinguda de Xile.",
      "**On match days** several bus lines are diverted from two hours before kick-off until an hour and a half after the final whistle; the club asks fans to walk or use public transport. There is no visitor car park.",
    ],
    tipsTitle: "Before you go",
    tips: [
      "**Bags:** there is no luggage storage, and laptops and pushchairs are not allowed into the stadium on match days.",
      "**Arriving from the airport:** the L9 Sud metro stops at Collblanc on its way into the city.",
    ],
    faq: [
      { question: "How much is the Camp Nou tour?", answer: `The basic museum ticket (Barça Immersive Tour) starts from €28 on the club's site, checked on ${VERIFIED}; other experiences start from €38.` },
      { question: "Is Camp Nou open?", answer: "Yes, in part: FC Barcelona plays its home matches there with a reduced capacity of 62,652 while works continue, and the museum is open." },
      { question: "What are the Camp Nou museum opening hours in winter?", answer: "From 19 October to 19 March, 10:00 to 18:00, with last entry 45 minutes before closing. Hours change on some match days." },
      { question: "Which metro stop is Camp Nou?", answer: "Collblanc (L5, L9 Sud, L10 Sud) or Palau Reial (L3), according to TMB." },
    ],
    note: "The stadium works change access and hours: check the club's page before you go.",
  },
  es: {
    lead: "El FC Barcelona ha vuelto al **Spotify Camp Nou**, pero el estadio solo está abierto en parte mientras siguen las obras. El museo, ahora **Barça Immersive Tour**, abre todo el año, y las entradas de partido solo las vende el club. Esto es lo que dice el propio club de cada cosa.",
    statusTitle: "El estadio ahora mismo",
    status: [
      "El club reabre el estadio por fases. La licencia actual permite **62.652 espectadores**, y el club dice que las obras continúan durante la temporada 2026-27 con aforo reducido; la condición de abonado queda suspendida hasta que vuelva el aforo completo. No hay fecha de finalización anunciada. Terminado, el estadio tendrá más de 104.000 localidades, y acogerá la final masculina de la Champions de 2029.",
    ],
    museumTitle: "El museo: Barça Immersive Tour",
    museum: [
      "La entrada básica al museo empieza **desde 28 €** e incluye el museo, una audioguía digital y un mirador sobre las obras. Otros productos, con visitas guiadas o extras, van desde 38 € hasta 199 €. El club aconseja comprar en línea para evitar colas.",
      "La visita incluye una sala inmersiva que el club no recomienda a personas con epilepsia o fotosensibilidad. Las personas con un certificado de discapacidad igual o superior al 33 %, y un acompañante, tienen un 50 % de descuento en taquilla.",
    ],
    hoursTitle: "Horario",
    hours: [
      "Del 19 de octubre al 19 de marzo el museo abre **de 10:00 a 18:00**; del 20 de marzo al 17 de octubre, de 9:30 a 19:00. La última entrada es 45 minutos antes del cierre y la visita dura una hora. Cierra el 25 de diciembre y el 1 de enero.",
      "Los días de partido y algunos otros días el horario cambia, y el club anuncia cada cambio en su página de entradas. El club señala los sábados de 15:00 a 17:00 como el momento más tranquilo, excepto los días de partido del primer equipo.",
    ],
    matchTitle: "Entradas de partido",
    match: [
      "Las entradas se venden en fcbarcelona.com y en la tienda de entradas del club, partido a partido; los abonados con pase tienen prioridad para los pases. Son digitales y llegan entre 24 y 3 horas antes del partido, y las puertas abren una hora y media antes.",
      "El club hace controles diarios contra compras fraudulentas y reventa. El canal seguro es la web oficial.",
    ],
    getTitle: "Cómo llegar",
    get: [
      "**Metro:** TMB recomienda Collblanc (L5, L9 Sud y L10 Sud) y Palau Reial (L3) como las estaciones más cercanas; Les Corts y Badal también quedan cerca.",
      "**Tranvía:** T1, T2 y T3, en paradas como Palau Reial y Avinguda de Xile.",
      "**Los días de partido** varias líneas de bus se desvían desde dos horas antes hasta una hora y media después del final; el club pide ir a pie o en transporte público. No hay aparcamiento para visitantes.",
    ],
    tipsTitle: "Antes de ir",
    tips: [
      "**Equipaje:** no hay consigna, y los días de partido no se permiten portátiles ni cochecitos en el estadio.",
      "**Si llegas del aeropuerto:** el metro L9 Sud para en Collblanc de camino a la ciudad.",
    ],
    faq: [
      { question: "¿Cuánto cuesta visitar el Camp Nou?", answer: `La entrada básica al museo (Barça Immersive Tour) empieza desde 28 € en la web del club, comprobado el ${VERIFIED}; otras experiencias, desde 38 €.` },
      { question: "¿El Camp Nou está abierto?", answer: "Sí, en parte: el FC Barcelona juega allí sus partidos con un aforo reducido de 62.652 mientras siguen las obras, y el museo está abierto." },
      { question: "¿Qué horario tiene el museo del Camp Nou en invierno?", answer: "Del 19 de octubre al 19 de marzo, de 10:00 a 18:00, con última entrada 45 minutos antes del cierre. Cambia algunos días de partido." },
      { question: "¿Qué parada de metro es el Camp Nou?", answer: "Collblanc (L5, L9 Sud, L10 Sud) o Palau Reial (L3), según TMB." },
    ],
    note: "Las obras del estadio cambian accesos y horarios: compruébalo en la web del club antes de ir.",
  },
  ca: {
    lead: "El FC Barcelona ha tornat al **Spotify Camp Nou**, però l'estadi només és obert en part mentre continuen les obres. El museu, ara **Barça Immersive Tour**, obre tot l'any, i les entrades de partit només les ven el club. Això és el que diu el mateix club de cada cosa.",
    statusTitle: "L'estadi ara mateix",
    status: [
      "El club reobre l'estadi per fases. La llicència actual permet **62.652 espectadors**, i el club diu que les obres continuen durant la temporada 2026-27 amb aforament reduït; la condició d'abonat queda suspesa fins que torni l'aforament complet. No hi ha data d'acabament anunciada. Acabat, l'estadi tindrà més de 104.000 localitats, i acollirà la final masculina de la Champions del 2029.",
    ],
    museumTitle: "El museu: Barça Immersive Tour",
    museum: [
      "L'entrada bàsica al museu comença **des de 28 €** i inclou el museu, una audioguia digital i un mirador sobre les obres. Altres productes, amb visites guiades o extres, van des de 38 € fins a 199 €. El club aconsella comprar en línia per evitar cues.",
      "La visita inclou una sala immersiva que el club no recomana a persones amb epilèpsia o fotosensibilitat. Les persones amb un certificat de discapacitat igual o superior al 33 %, i un acompanyant, tenen un 50 % de descompte a taquilla.",
    ],
    hoursTitle: "Horari",
    hours: [
      "Del 19 d'octubre al 19 de març el museu obre **de 10:00 a 18:00**; del 20 de març al 17 d'octubre, de 9:30 a 19:00. L'última entrada és 45 minuts abans del tancament i la visita dura una hora. Tanca el 25 de desembre i l'1 de gener.",
      "Els dies de partit i alguns altres dies l'horari canvia, i el club anuncia cada canvi a la seva pàgina d'entrades. El club assenyala els dissabtes de 15:00 a 17:00 com el moment més tranquil, excepte els dies de partit del primer equip.",
    ],
    matchTitle: "Entrades de partit",
    match: [
      "Les entrades es venen a fcbarcelona.com i a la botiga d'entrades del club, partit a partit; els abonats amb passi tenen prioritat per als passis. Són digitals i arriben entre 24 i 3 hores abans del partit, i les portes obren una hora i mitja abans.",
      "El club fa controls diaris contra compres fraudulentes i revenda. El canal segur és el web oficial.",
    ],
    getTitle: "Com arribar-hi",
    get: [
      "**Metro:** TMB recomana Collblanc (L5, L9 Sud i L10 Sud) i Palau Reial (L3) com les estacions més properes; les Corts i Badal també hi queden a prop.",
      "**Tramvia:** T1, T2 i T3, a parades com Palau Reial i Avinguda de Xile.",
      "**Els dies de partit** diverses línies de bus es desvien des de dues hores abans fins a una hora i mitja després del final; el club demana anar-hi a peu o en transport públic. No hi ha aparcament per a visitants.",
    ],
    tipsTitle: "Abans d'anar-hi",
    tips: [
      "**Equipatge:** no hi ha consigna, i els dies de partit no es permeten portàtils ni cotxets a l'estadi.",
      "**Si arribes de l'aeroport:** el metro L9 Sud para a Collblanc camí de la ciutat.",
    ],
    faq: [
      { question: "Quant costa visitar el Camp Nou?", answer: `L'entrada bàsica al museu (Barça Immersive Tour) comença des de 28 € al web del club, comprovat el ${VERIFIED}; altres experiències, des de 38 €.` },
      { question: "El Camp Nou és obert?", answer: "Sí, en part: el FC Barcelona hi juga els partits amb un aforament reduït de 62.652 mentre continuen les obres, i el museu és obert." },
      { question: "Quin horari té el museu del Camp Nou a l'hivern?", answer: "Del 19 d'octubre al 19 de març, de 10:00 a 18:00, amb última entrada 45 minuts abans del tancament. Canvia alguns dies de partit." },
      { question: "Quina parada de metro és el Camp Nou?", answer: "Collblanc (L5, L9 Sud, L10 Sud) o Palau Reial (L3), segons TMB." },
    ],
    note: "Les obres de l'estadi canvien accessos i horaris: comprova-ho al web del club abans d'anar-hi.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.statusTitle, ...t.status),
    ...h2(t.museumTitle, ...t.museum),
    ...h2(t.hoursTitle, ...t.hours),
    ...h2(t.matchTitle, ...t.match),
    ...h2(t.getTitle),
    list(...t.get),
    ...h2(t.tipsTitle),
    list(...t.tips),
    faq(t.faq),
    ...b2Related(["monuments", "cards", "airport", "transport"], locale),
  ];
}

export const CAMPNOU: B2Article = {
  key: "campnou",
  entryKey: "guide-spotify-camp-nou-visit",
  categoryKey: "culture",
  sources: SOURCES,
  heroKey: "campnou-dia-de-partit",
  heroAlt: {
    ca: "Aficionats amb samarretes del Barça davant de les grades del Camp Nou un dia de partit",
    es: "Aficionados con camisetas del Barça frente a las gradas del Camp Nou un día de partido",
    en: "Fans in Barça shirts outside the Camp Nou stands on a match day",
  },
  heroCaption: {
    ca: "Dia de partit al Camp Nou, abans de les obres de remodelació.",
    es: "Día de partido en el Camp Nou, antes de las obras de remodelación.",
    en: "Match day at the Camp Nou, before the rebuilding works.",
  },
  secondaryKey: "campnou-estatua-kubala",
  secondaryAlt: {
    ca: "L'estàtua de Ladislau Kubala xutant una pilota, a l'exterior del Camp Nou",
    es: "La estatua de Ladislao Kubala chutando un balón, en el exterior del Camp Nou",
    en: "The statue of Ladislao Kubala kicking a ball, outside the Camp Nou",
  },
  secondaryCaption: {
    ca: "L'estàtua de Kubala, a l'exterior de l'estadi.",
    es: "La estatua de Kubala, en el exterior del estadio.",
    en: "The Kubala statue outside the stadium.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T21:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as CAMPNOU_META };
