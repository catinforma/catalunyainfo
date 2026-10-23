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
 * Free museums and free-entry times in Barcelona.
 *
 * The blogs that rank for this contradict each other (MACBA is the usual
 * example), so every rule below is the museum's own wording or the City
 * Council's, checked on 12 Oct 2026; the fact pack is
 * research_notes/blog-batch-03/museums.md. Fundació Tàpies, CosmoCaixa, the
 * Museu de la Xocolata and the Museu Egipci are left out: their own pages
 * could not be read or contradicted themselves.
 *
 * No calendar dates for "the next first Sunday": the page is evergreen, and
 * a date in the body would go stale the week after.
 */

const VERIFIED = "2026-10-12";
// The city list was re-read on 23 Oct 2026 from the Ajuntament's own page:
// it adds the Jardí Botànic and the Centre Martorell on Sundays, and the
// Pavelló Mies van der Rohe, the Museu Olímpic i de l'Esport and Foto
// Colectania on the first Sunday; the Museu del Disseny, like the CCCB, is
// free only 15:00-20:00 on Sundays.
const CITY_LIST_URL = "https://www.barcelona.cat/infobarcelona/ca/tema/cultura-i-lleure/diumenges-de-museu-sense-passar-per-taquilla_1620590.html";

const SOURCES: B2Source[] = [
  {
    name: "Diumenges de museu sense passar per taquilla",
    url: "https://www.barcelona.cat/infobarcelona/ca/tema/cultura-i-lleure/diumenges-de-museu-sense-passar-per-taquilla_1620590.html",
    publisher: "Ajuntament de Barcelona",
  },
  { name: "MNAC — hours and prices", url: "https://www.museunacional.cat/ca/horaris-i-preus", publisher: "Museu Nacional d'Art de Catalunya" },
  { name: "Museu Picasso — tickets and opening hours", url: "https://museupicassobcn.cat/en/plan-your-visit/buy-tickets-and-opening-hours", publisher: "Museu Picasso" },
  { name: "MACBA — free entrance", url: "https://www.macba.cat/en/plan-your-visit/free-entrance-and-discount-admission/", publisher: "MACBA" },
  { name: "CCCB — visit", url: "https://www.cccb.org/ca/visita", publisher: "CCCB" },
  { name: "Fundació Joan Miró — plan your visit", url: "https://www.fmirobcn.org/en/visit-us/plan-your-visit/", publisher: "Fundació Joan Miró" },
  { name: "Museu Marítim — plan your visit", url: "https://www.mmb.cat/en/visit/plan-your-visit/", publisher: "Museu Marítim de Barcelona" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/museus-gratis-barcelona",
    title: "Museus gratis a Barcelona: quins dies i a quina hora no es paga",
    seoTitle: "Museus gratis a Barcelona: diumenges i primer diumenge",
    seoDescription:
      "Quan és gratis el MNAC, el Picasso, el MACBA, el CCCB i els museus municipals de Barcelona: diumenges a la tarda, primer diumenge de mes i si cal reservar.",
    excerpt:
      "Els dies i les hores en què els museus de Barcelona no cobren entrada, segons cada museu i l'Ajuntament, i on cal reservar abans encara que sigui gratis.",
  },
  es: {
    path: "guias/museos-gratis-barcelona",
    title: "Museos gratis en Barcelona: qué días y a qué hora no se paga",
    seoTitle: "Museos gratis en Barcelona: domingos y primer domingo",
    seoDescription:
      "Cuándo es gratis el MNAC, el Picasso, el MACBA, el CCCB y los museos municipales de Barcelona: domingos por la tarde, primer domingo de mes y si hay que reservar.",
    excerpt:
      "Los días y las horas en que los museos de Barcelona no cobran entrada, según cada museo y el Ayuntamiento, y dónde hay que reservar aunque sea gratis.",
  },
  en: {
    path: "guides/free-museums-barcelona",
    title: "Free museums in Barcelona: which days and times are free",
    seoTitle: "Free museums in Barcelona: Sunday afternoons and 1st Sunday",
    seoDescription:
      "When the MNAC, Picasso Museum, MACBA, CCCB and Barcelona's city museums are free: Sunday afternoons, the first Sunday of the month, and where to book.",
    excerpt:
      "The days and times Barcelona's museums charge nothing, from each museum and the City Council, and which ones still need a booking when entry is free.",
  },
};

type T = {
  lead: string;
  ruleTitle: string;
  rule: string[];
  tableCaption: string;
  headers: string[];
  rows: string[][];
  tableNote: string;
  bookTitle: string;
  book: string;
  bigTitle: string;
  big: string[];
  freeTitle: string;
  free: string[];
  daysTitle: string;
  days: string;
  tipsTitle: string;
  tips: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "Most of Barcelona's museums have a free slot every week, and the city's own museums open free **every Sunday afternoon** and **all day on the first Sunday of the month**. The catch is that each museum sets its own times, and some of the biggest require you to **book online even when entry is free**.",
    ruleTitle: "The city rule: Sunday afternoons and the first Sunday",
    rule: [
      "Museums run by Barcelona City Council are free every Sunday from 15:00, and all day (within normal Sunday opening hours) on the first Sunday of the month. That covers the Museu d'Història de Barcelona (MUHBA, every site except Park Güell), the Museu de la Música, the Museu del Disseny, the Museu Frederic Marès, the Museu Blau (natural sciences), the Museu Etnològic i de Cultures del Món, the Castell de Montjuïc, the Monestir de Pedralbes, the Jardí Botànic and the Centre Martorell.",
      `On the first Sunday the [City Council's list](${CITY_LIST_URL}) adds the MNAC, the Pavelló Mies van der Rohe, the Museu Olímpic i de l'Esport and the Picasso, and Foto Colectania from 11:00 to 15:00.`,
      "Two exceptions: the **Museu Marítim** is free on Sundays from 15:00 only, with no free first Sunday, and the **CCCB** and the **Museu del Disseny** are free on Sundays from 15:00 to 20:00 only, the CCCB with online booking.",
    ],
    tableCaption: "The big museums: when entry is free",
    headers: ["Museum", "Free", "Book ahead?", "Normal adult ticket"],
    rows: [
      ["MNAC (Museu Nacional d'Art de Catalunya)", "Saturdays from 15:00; first Sunday of the month", "Yes, online", "€12"],
      ["Museu Picasso", "Thursdays 16:00–19:00 (Oct–Mar); first Sunday", "Yes, opens 4 days before", "€12 online, €13 at the desk"],
      ["MACBA", "Thursday to Saturday from 18:00; first Sunday", "Free ticket issued online", "€13.50 online, €15 at the desk"],
      ["CCCB", "Sundays 15:00–20:00", "Yes, online", "€8 online, €10 at the desk"],
      ["Museu de la Música", "Thursdays 18:00–21:00; Sundays from 15:00; first Sunday", "Not stated", "€6"],
      ["Museu Marítim", "Sundays from 15:00", "Optional", "€10"],
      ["Museu d'Història de Catalunya", "First Sunday, 10:00–14:30", "Not stated", "€6"],
      ["Fundació Joan Miró", "No free day", "—", "€17 online, €18 on site"],
    ],
    tableNote: "From each museum's own site and the City Council, checked on 12 October 2026. In winter the MNAC closes at 18:00, so its free Saturday slot runs 15:00–18:00.",
    bookTitle: "Free does not mean walk-in",
    book: "The MNAC, the Museu Picasso and the CCCB all ask for an online booking for their free slots, and capacity is limited. The Picasso releases free tickets four days before, from 10:00. Without a booking you may be turned away at the door even though nobody is paying.",
    bigTitle: "Museum by museum",
    big: [
      "**Museu Picasso:** besides the first Sunday, entry is free on Thursdays from 16:00 to 19:00 from late September to late March; in spring and summer the free slot moves to Thursday, Friday and Saturday evenings from 19:00 to 21:00. Under-18s always go free.",
      "**MACBA:** free from 18:00 every Thursday, Friday and Saturday and all day on the first Sunday; under-16s always go free. It is closed on Tuesdays.",
      "**MNAC:** free every Saturday from 15:00 and on the first Sunday, with an online booking; under-16s and EU residents over 65 always go free. From October to April it closes at 15:00 on Sundays, so the free first Sunday is a morning.",
      "**Fundació Joan Miró:** no free day, but under-12s and unemployed visitors with proof get in free, and the Espai 13 gallery is always free.",
    ],
    freeTitle: "Who always goes free",
    free: [
      "**Children and teenagers:** under 16 at most museums; under 17 at the Museu Marítim, under 18 at the Museu Picasso, under 12 at the Fundació Miró.",
      "**Unemployed visitors** with proof: free at the MNAC, CCCB, Fundació Miró, Museu d'Història de Catalunya and Museu Marítim; reduced at most city museums and at the Picasso and MACBA.",
    ],
    daysTitle: "Open days",
    days: "Several museums also open free on 12 February (Santa Eulàlia), on International Museum Day around 18 May, on the Night of Museums in May and on 24 September (La Mercè). Each museum decides whether it takes part, so check its own page for that year.",
    tipsTitle: "Getting the most out of it",
    tips: [
      "**Plan around the first Sunday:** that is the one day when the MNAC, the Picasso, the MACBA and the city museums are all free.",
      "**Arrive early in the free slot:** Sunday afternoons and first Sundays are the busiest times of the week.",
      "**Carry ID** if you are relying on an age or unemployment exemption.",
    ],
    faq: [
      { question: "Which museums are free on Sundays in Barcelona?", answer: "City Council museums (MUHBA, Música, Disseny, Marès, Museu Blau, Etnològic, Castell de Montjuïc, Pedralbes) are free every Sunday from 15:00 and all day on the first Sunday; the Museu Marítim and the CCCB on Sunday afternoons only." },
      { question: "When is the Picasso Museum free?", answer: "On the first Sunday of the month, and on Thursdays from 16:00 to 19:00 from late September to late March, always with a booking that opens four days before." },
      { question: "Is the MNAC free?", answer: "Every Saturday from 15:00 and on the first Sunday of the month, booking online in advance." },
      { question: "Is the Fundació Miró ever free?", answer: "It has no free day, but under-12s and unemployed visitors with proof go free." },
    ],
    note: "Museums change free slots and booking rules: check the museum's own page before you go.",
  },
  es: {
    lead: "La mayoría de museos de Barcelona tienen una franja gratuita cada semana, y los museos del Ayuntamiento abren gratis **todos los domingos por la tarde** y **todo el día el primer domingo de mes**. La trampa es que cada museo fija sus horas, y algunos de los grandes piden **reservar en línea aunque la entrada sea gratis**.",
    ruleTitle: "La norma de la ciudad: domingos por la tarde y primer domingo",
    rule: [
      "Los museos del Ayuntamiento de Barcelona son gratuitos todos los domingos a partir de las 15:00, y todo el día (dentro del horario normal de domingo) el primer domingo de mes. Incluye el Museu d'Història de Barcelona (MUHBA, todos los centros excepto el Park Güell), el Museu de la Música, el Museu del Disseny, el Museu Frederic Marès, el Museu Blau (ciencias naturales), el Museu Etnològic i de Cultures del Món, el Castell de Montjuïc, el Monestir de Pedralbes, el Jardí Botànic y el Centre Martorell.",
      `El primer domingo, la [lista del Ayuntamiento](${CITY_LIST_URL}) añade el MNAC, el Pavelló Mies van der Rohe, el Museu Olímpic i de l'Esport y el Picasso, y Foto Colectania de 11:00 a 15:00.`,
      "Dos excepciones: el **Museu Marítim** es gratis los domingos a partir de las 15:00 y no tiene primer domingo gratuito, y el **CCCB** y el **Museu del Disseny** solo son gratis los domingos de 15:00 a 20:00, el CCCB con reserva en línea.",
    ],
    tableCaption: "Los grandes museos: cuándo es gratis",
    headers: ["Museo", "Gratis", "¿Reserva?", "Entrada general"],
    rows: [
      ["MNAC (Museu Nacional d'Art de Catalunya)", "Sábados desde las 15:00; primer domingo de mes", "Sí, en línea", "12 €"],
      ["Museu Picasso", "Jueves 16:00–19:00 (oct–mar); primer domingo", "Sí, abre 4 días antes", "12 € en línea, 13 € en taquilla"],
      ["MACBA", "De jueves a sábado desde las 18:00; primer domingo", "Entrada gratuita en línea", "13,50 € en línea, 15 € en taquilla"],
      ["CCCB", "Domingos 15:00–20:00", "Sí, en línea", "8 € en línea, 10 € en taquilla"],
      ["Museu de la Música", "Jueves 18:00–21:00; domingos desde las 15:00; primer domingo", "No consta", "6 €"],
      ["Museu Marítim", "Domingos desde las 15:00", "Opcional", "10 €"],
      ["Museu d'Història de Catalunya", "Primer domingo, 10:00–14:30", "No consta", "6 €"],
      ["Fundació Joan Miró", "Sin día gratuito", "—", "17 € en línea, 18 € en taquilla"],
    ],
    tableNote: "De la web de cada museo y del Ayuntamiento, comprobado el 12 de octubre de 2026. En invierno el MNAC cierra a las 18:00, así que la franja gratuita del sábado es de 15:00 a 18:00.",
    bookTitle: "Gratis no quiere decir sin reserva",
    book: "El MNAC, el Museu Picasso y el CCCB piden reserva en línea para sus franjas gratuitas, con aforo limitado. El Picasso libera las entradas gratuitas cuatro días antes, a partir de las 10:00. Sin reserva, te pueden dejar en la puerta aunque nadie pague.",
    bigTitle: "Museo a museo",
    big: [
      "**Museu Picasso:** además del primer domingo, es gratis los jueves de 16:00 a 19:00 de finales de septiembre a finales de marzo; en primavera y verano la franja pasa a jueves, viernes y sábado de 19:00 a 21:00. Los menores de 18 años siempre entran gratis.",
      "**MACBA:** gratis a partir de las 18:00 todos los jueves, viernes y sábados y todo el primer domingo; los menores de 16 siempre entran gratis. Cierra los martes.",
      "**MNAC:** gratis todos los sábados a partir de las 15:00 y el primer domingo, con reserva en línea; los menores de 16 y los mayores de 65 de la UE siempre entran gratis. De octubre a abril cierra a las 15:00 los domingos, así que el primer domingo gratuito es por la mañana.",
      "**Fundació Joan Miró:** no tiene día gratuito, pero los menores de 12 y las personas en paro acreditadas entran gratis, y el Espai 13 es siempre gratuito.",
    ],
    freeTitle: "Quién entra siempre gratis",
    free: [
      "**Niños y adolescentes:** menores de 16 en la mayoría de museos; menores de 17 en el Museu Marítim, de 18 en el Museu Picasso y de 12 en la Fundació Miró.",
      "**Personas en paro** acreditadas: gratis en el MNAC, el CCCB, la Fundació Miró, el Museu d'Història de Catalunya y el Museu Marítim; precio reducido en la mayoría de museos municipales, el Picasso y el MACBA.",
    ],
    daysTitle: "Jornadas de puertas abiertas",
    days: "Varios museos también abren gratis el 12 de febrero (Santa Eulàlia), en el Día Internacional de los Museos hacia el 18 de mayo, en la Noche de los Museos en mayo y el 24 de septiembre (La Mercè). Cada museo decide si participa: compruébalo en su web ese año.",
    tipsTitle: "Para sacarle partido",
    tips: [
      "**Organízate alrededor del primer domingo:** es el único día en que el MNAC, el Picasso, el MACBA y los museos municipales son gratis a la vez.",
      "**Llega pronto a la franja gratuita:** los domingos por la tarde y los primeros domingos son los momentos con más gente de la semana.",
      "**Lleva identificación** si cuentas con una exención por edad o por estar en paro.",
    ],
    faq: [
      { question: "¿Qué museos son gratis los domingos en Barcelona?", answer: "Los museos del Ayuntamiento (MUHBA, Música, Disseny, Marès, Museu Blau, Etnològic, Castell de Montjuïc, Pedralbes) son gratis todos los domingos desde las 15:00 y todo el primer domingo; el Museu Marítim y el CCCB, solo los domingos por la tarde." },
      { question: "¿Cuándo es gratis el Museo Picasso?", answer: "El primer domingo de mes y los jueves de 16:00 a 19:00 de finales de septiembre a finales de marzo, siempre con reserva, que se abre cuatro días antes." },
      { question: "¿El MNAC es gratis?", answer: "Todos los sábados desde las 15:00 y el primer domingo de mes, reservando en línea con antelación." },
      { question: "¿La Fundació Miró es gratis algún día?", answer: "No tiene día gratuito, pero los menores de 12 y las personas en paro acreditadas entran gratis." },
    ],
    note: "Los museos cambian franjas y normas de reserva: compruébalo en la web del museo antes de ir.",
  },
  ca: {
    lead: "La majoria de museus de Barcelona tenen una franja gratuïta cada setmana, i els museus de l'Ajuntament obren gratis **tots els diumenges a la tarda** i **tot el dia el primer diumenge de mes**. El parany és que cada museu fixa les seves hores, i alguns dels grans demanen **reservar en línia encara que l'entrada sigui gratis**.",
    ruleTitle: "La norma de la ciutat: diumenges a la tarda i primer diumenge",
    rule: [
      "Els museus de l'Ajuntament de Barcelona són gratuïts tots els diumenges a partir de les 15:00, i tot el dia (dins l'horari normal de diumenge) el primer diumenge de mes. Inclou el Museu d'Història de Barcelona (MUHBA, tots els centres excepte el Park Güell), el Museu de la Música, el Museu del Disseny, el Museu Frederic Marès, el Museu Blau (ciències naturals), el Museu Etnològic i de Cultures del Món, el Castell de Montjuïc, el Monestir de Pedralbes, el Jardí Botànic i el Centre Martorell.",
      `El primer diumenge, la [llista de l'Ajuntament](${CITY_LIST_URL}) hi afegeix el MNAC, el Pavelló Mies van der Rohe, el Museu Olímpic i de l'Esport i el Picasso, i Foto Colectania d'11:00 a 15:00.`,
      "Dues excepcions: el **Museu Marítim** és gratis els diumenges a partir de les 15:00 i no té primer diumenge gratuït, i el **CCCB** i el **Museu del Disseny** només són gratis els diumenges de 15:00 a 20:00, el CCCB amb reserva en línia.",
    ],
    tableCaption: "Els grans museus: quan és gratis",
    headers: ["Museu", "Gratis", "Cal reservar?", "Entrada general"],
    rows: [
      ["MNAC (Museu Nacional d'Art de Catalunya)", "Dissabtes a partir de les 15:00; primer diumenge de mes", "Sí, en línia", "12 €"],
      ["Museu Picasso", "Dijous 16:00–19:00 (oct–març); primer diumenge", "Sí, s'obre 4 dies abans", "12 € en línia, 13 € a taquilla"],
      ["MACBA", "De dijous a dissabte a partir de les 18:00; primer diumenge", "Entrada gratuïta en línia", "13,50 € en línia, 15 € a taquilla"],
      ["CCCB", "Diumenges 15:00–20:00", "Sí, en línia", "8 € en línia, 10 € a taquilla"],
      ["Museu de la Música", "Dijous 18:00–21:00; diumenges a partir de les 15:00; primer diumenge", "No hi consta", "6 €"],
      ["Museu Marítim", "Diumenges a partir de les 15:00", "Opcional", "10 €"],
      ["Museu d'Història de Catalunya", "Primer diumenge, 10:00–14:30", "No hi consta", "6 €"],
      ["Fundació Joan Miró", "Cap dia gratuït", "—", "17 € en línia, 18 € a taquilla"],
    ],
    tableNote: "Del web de cada museu i de l'Ajuntament, comprovat el 12 d'octubre de 2026. A l'hivern el MNAC tanca a les 18:00, així que la franja gratuïta del dissabte és de 15:00 a 18:00.",
    bookTitle: "Gratis no vol dir sense reserva",
    book: "El MNAC, el Museu Picasso i el CCCB demanen reserva en línia per a les franges gratuïtes, amb aforament limitat. El Picasso allibera les entrades gratuïtes quatre dies abans, a partir de les 10:00. Sense reserva et poden deixar a la porta encara que ningú pagui.",
    bigTitle: "Museu a museu",
    big: [
      "**Museu Picasso:** a més del primer diumenge, és gratis els dijous de 16:00 a 19:00 de finals de setembre a finals de març; a la primavera i a l'estiu la franja passa a dijous, divendres i dissabte de 19:00 a 21:00. Els menors de 18 anys sempre hi entren gratis.",
      "**MACBA:** gratis a partir de les 18:00 tots els dijous, divendres i dissabtes i tot el primer diumenge; els menors de 16 sempre hi entren gratis. Tanca els dimarts.",
      "**MNAC:** gratis tots els dissabtes a partir de les 15:00 i el primer diumenge, amb reserva en línia; els menors de 16 i els majors de 65 de la UE sempre hi entren gratis. D'octubre a abril tanca a les 15:00 els diumenges, així que el primer diumenge gratuït és al matí.",
      "**Fundació Joan Miró:** no té cap dia gratuït, però els menors de 12 i les persones a l'atur acreditades hi entren gratis, i l'Espai 13 és sempre gratuït.",
    ],
    freeTitle: "Qui hi entra sempre gratis",
    free: [
      "**Infants i adolescents:** menors de 16 a la majoria de museus; menors de 17 al Museu Marítim, de 18 al Museu Picasso i de 12 a la Fundació Miró.",
      "**Persones a l'atur** acreditades: gratis al MNAC, el CCCB, la Fundació Miró, el Museu d'Història de Catalunya i el Museu Marítim; preu reduït a la majoria de museus municipals, al Picasso i al MACBA.",
    ],
    daysTitle: "Jornades de portes obertes",
    days: "Diversos museus també obren gratis el 12 de febrer (Santa Eulàlia), el Dia Internacional dels Museus cap al 18 de maig, la Nit dels Museus al maig i el 24 de setembre (la Mercè). Cada museu decideix si hi participa: comprova-ho al seu web aquell any.",
    tipsTitle: "Per treure'n profit",
    tips: [
      "**Organitza't al voltant del primer diumenge:** és l'únic dia que el MNAC, el Picasso, el MACBA i els museus municipals són gratis alhora.",
      "**Arriba d'hora a la franja gratuïta:** els diumenges a la tarda i els primers diumenges són els moments amb més gent de la setmana.",
      "**Porta identificació** si comptes amb una exempció per edat o per estar a l'atur.",
    ],
    faq: [
      { question: "Quins museus són gratis els diumenges a Barcelona?", answer: "Els museus de l'Ajuntament (MUHBA, Música, Disseny, Marès, Museu Blau, Etnològic, Castell de Montjuïc, Pedralbes) són gratis tots els diumenges a partir de les 15:00 i tot el primer diumenge; el Museu Marítim i el CCCB, només els diumenges a la tarda." },
      { question: "Quan és gratis el Museu Picasso?", answer: "El primer diumenge de mes i els dijous de 16:00 a 19:00 de finals de setembre a finals de març, sempre amb reserva, que s'obre quatre dies abans." },
      { question: "El MNAC és gratis?", answer: "Tots els dissabtes a partir de les 15:00 i el primer diumenge de mes, reservant en línia amb antelació." },
      { question: "La Fundació Miró és gratis algun dia?", answer: "No té cap dia gratuït, però els menors de 12 i les persones a l'atur acreditades hi entren gratis." },
    ],
    note: "Els museus canvien franges i normes de reserva: comprova-ho al web del museu abans d'anar-hi.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.ruleTitle, ...t.rule),
    table(t.tableCaption, t.headers, t.rows, t.tableNote),
    callout("warning", t.bookTitle, t.book),
    ...h2(t.bigTitle),
    list(...t.big),
    ...h2(t.freeTitle),
    list(...t.free),
    ...h2(t.daysTitle, t.days),
    ...h2(t.tipsTitle),
    list(...t.tips),
    faq(t.faq),
    ...b2Related(["monuments", "transport", "airport"], locale),
  ];
}

export const MUSEUMS: B2Article = {
  key: "museums",
  entryKey: "guide-free-museums-barcelona",
  categoryKey: "culture",
  sources: SOURCES,
  heroKey: "museus-palau-nacional-mnac",
  heroAlt: {
    ca: "El Palau Nacional de Montjuïc, seu del MNAC, vist des de l'avinguda Maria Cristina",
    es: "El Palau Nacional de Montjuïc, sede del MNAC, visto desde la avenida Maria Cristina",
    en: "The Palau Nacional on Montjuïc, home of the MNAC, seen from Avinguda Maria Cristina",
  },
  heroCaption: {
    ca: "El MNAC és gratis els dissabtes a partir de les 15:00, amb reserva.",
    es: "El MNAC es gratis los sábados desde las 15:00, con reserva.",
    en: "The MNAC is free on Saturdays from 15:00, with a booking.",
  },
  secondaryKey: "museus-placa-angels-macba",
  secondaryAlt: {
    ca: "La plaça dels Àngels amb l'edifici blanc del MACBA a l'esquerra",
    es: "La plaza dels Àngels con el edificio blanco del MACBA a la izquierda",
    en: "Plaça dels Àngels with the white MACBA building on the left",
  },
  secondaryCaption: {
    ca: "El MACBA, gratis de dijous a dissabte a partir de les 18:00.",
    es: "El MACBA, gratis de jueves a sábado desde las 18:00.",
    en: "The MACBA is free Thursday to Saturday from 18:00.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T20:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as MUSEUMS_META };
