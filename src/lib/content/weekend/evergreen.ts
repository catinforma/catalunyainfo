import type { Block } from "@/lib/content/blocks";
import { link } from "@/lib/content/features/shared";
import type { Locale } from "@/lib/i18n/config";

/**
 * The weekend guide, rewritten so it cannot go out of date.
 *
 * ## What was wrong
 *
 * On 7 October 2026 the page for "what to do this weekend in Catalonia" was
 * titled "25 plans | 19 i 20 setembre" and listed twenty-five things that had
 * all happened three weeks earlier. Its title, its description, its key facts
 * and every plan named a past weekend. The editorial package that produced it
 * was good; the format could only be right for one weekend.
 *
 * ## What it is now
 *
 * The same URL — it already ranks and is linked from elsewhere — with no date
 * in its title, description or prose. The listing in the middle comes from the
 * Generalitat's open-data cultural agenda at render time, grouped by kind of
 * plan and with the free activities first. Around it, the page carries what an
 * aggregated list cannot: how to choose, what to do if it rains, how to get
 * there without a car, and how the long weekends fall. That is the part that
 * makes it a guide rather than a feed, and it is the reason the page is worth
 * indexing at all.
 *
 * The twenty-five plans from 19–20 September stay in `payload.ts` as the record
 * of what was published; they are no longer rendered.
 */

export interface EvergreenCopy {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  lead: string;
  intro: string[];
  chooseTitle: string;
  choose: string[];
  freeTitle: string;
  free: string[];
  rainTitle: string;
  rain: string[];
  carFreeTitle: string;
  carFree: string[];
  longTitle: string;
  long: string[];
  warningTitle: string;
  warning: string;
}

export const EVERGREEN: Record<Locale, EvergreenCopy> = {
  ca: {
    path: "agenda/que-fer-aquest-cap-de-setmana-catalunya",
    title: "Què fer aquest cap de setmana a Catalunya: agenda i plans",
    seoTitle: "Què fer aquest cap de setmana a Catalunya",
    seoDescription:
      "L'agenda d'aquest cap de setmana a Catalunya: fires, concerts, teatre, plans amb nens i activitats gratuïtes, actualitzada amb l'agenda oficial.",
    excerpt:
      "Fires, concerts, teatre, plans amb nens i activitats gratuïtes d'aquest cap de setmana, amb l'agenda oficial de la Generalitat.",
    lead:
      "Què es pot fer **aquest cap de setmana** a Catalunya, agrupat per tipus de pla i amb les activitats gratuïtes primer.",
    intro: [
      "L'agenda de sota es llegeix de l'**Agenda Cultural de Catalunya**, el registre oficial d'activitats de la Generalitat, i s'actualitza sola: quan acaba un cap de setmana, mostra el següent. No hi ha cap llista copiada a mà que es pugui quedar vella.",
      "Si el dilluns o el divendres és festiu, l'agenda inclou el pont sencer.",
    ],
    chooseTitle: "Com triar un pla",
    choose: [
      "**Si vas amb nens**, comença per l'apartat «Per anar amb nens»: són activitats que l'organitzador ha marcat expressament com a infantils, no adults amb canalla tolerada.",
      "**Si vols sortir de casa sense gastar**, les gratuïtes estan separades al principi. Gratuït vol dir entrada lliure; el desplaçament i el que consumeixis a la fira van a part.",
      "**Si vols un pla d'un dia sencer**, les fires i els mercats solen ser la millor aposta: tenen horari ampli i combinen bé amb un dinar al poble.",
    ],
    freeTitle: "Les gratuïtes, amb un matís",
    free: [
      "Que una activitat sigui gratuïta no vol dir que no calgui reserva. Molts concerts i visites gratuïts tenen aforament limitat i inscripció prèvia, i s'omplen.",
      "Abans de desplaçar-te, entra al web de l'organitzador des de l'enllaç de cada activitat.",
    ],
    rainTitle: "Si plou",
    rain: [],
    carFreeTitle: "Sense cotxe",
    carFree: [],
    longTitle: "Ponts i festius",
    long: [],
    warningTitle: "Abans de sortir",
    warning:
      "L'agenda reprodueix el que publiquen els organitzadors. Els horaris, els aforaments i els programes poden canviar a última hora: comprova sempre el web de l'activitat.",
  },

  es: {
    path: "agenda/que-hacer-este-fin-de-semana-cataluna",
    title: "Qué hacer este fin de semana en Cataluña: agenda y planes",
    seoTitle: "Qué hacer este fin de semana en Cataluña",
    seoDescription:
      "La agenda de este fin de semana en Cataluña: ferias, conciertos, teatro, planes con niños y actividades gratuitas, actualizada con la agenda oficial.",
    excerpt:
      "Ferias, conciertos, teatro, planes con niños y actividades gratuitas de este fin de semana, con la agenda oficial de la Generalitat.",
    lead:
      "Qué se puede hacer **este fin de semana** en Cataluña, agrupado por tipo de plan y con las actividades gratuitas primero.",
    intro: [
      "La agenda de abajo se lee de la **Agenda Cultural de Catalunya**, el registro oficial de actividades de la Generalitat, y se actualiza sola: cuando termina un fin de semana, muestra el siguiente. No hay ninguna lista copiada a mano que pueda quedarse vieja.",
      "Si el lunes o el viernes es festivo, la agenda incluye el puente entero.",
    ],
    chooseTitle: "Cómo elegir un plan",
    choose: [
      "**Si vas con niños**, empieza por el apartado «Para ir con niños»: son actividades que el organizador ha marcado expresamente como infantiles.",
      "**Si quieres salir sin gastar**, las gratuitas están separadas al principio. Gratuito significa entrada libre; el desplazamiento y lo que consumas van aparte.",
      "**Si buscas un plan de día entero**, las ferias y los mercados suelen ser la mejor apuesta: tienen horario amplio y combinan bien con una comida en el pueblo.",
    ],
    freeTitle: "Las gratuitas, con un matiz",
    free: [
      "Que una actividad sea gratuita no significa que no haga falta reserva. Muchos conciertos y visitas gratuitos tienen aforo limitado e inscripción previa, y se llenan.",
      "Antes de desplazarte, entra en la web del organizador desde el enlace de cada actividad.",
    ],
    rainTitle: "Si llueve",
    rain: [],
    carFreeTitle: "Sin coche",
    carFree: [],
    longTitle: "Puentes y festivos",
    long: [],
    warningTitle: "Antes de salir",
    warning:
      "La agenda reproduce lo que publican los organizadores. Horarios, aforos y programas pueden cambiar a última hora: comprueba siempre la web de la actividad.",
  },

  en: {
    path: "agenda/things-to-do-catalonia-this-weekend",
    title: "Things to do in Catalonia this weekend: what's on",
    seoTitle: "Things to do in Catalonia this weekend",
    seoDescription:
      "What's on in Catalonia this weekend: fairs, concerts, theatre, family activities and free events, kept current from the official regional agenda.",
    excerpt:
      "Fairs, concerts, theatre, family activities and free events this weekend, from the Catalan government's official agenda.",
    lead:
      "What's on in Catalonia **this weekend**, grouped by kind of plan, with the free events first.",
    intro: [
      "The listing below is read from the **Agenda Cultural de Catalunya**, the Catalan government's official register of activities, and updates itself: when one weekend ends it shows the next. There is no hand-copied list on this page to go out of date.",
      "When the Friday or the Monday is a public holiday, the listing covers the whole long weekend.",
    ],
    chooseTitle: "How to choose",
    choose: [
      "**With children**, start with the \"With children\" section: these are activities the organiser has tagged as for children, not adult events that tolerate them.",
      "**On a budget**, the free events are pulled out at the top. Free means free entry; getting there and anything you buy at a fair are extra.",
      "**For a whole day out**, fairs and markets are usually the best bet: long opening hours, and they pair well with lunch in the town.",
    ],
    freeTitle: "Free, with one caveat",
    free: [
      "Free entry does not mean no booking. Many free concerts and tours have limited capacity and require registration, and they fill up.",
      "Before you travel, open the organiser's site from each activity's link.",
    ],
    rainTitle: "If it rains",
    rain: [],
    carFreeTitle: "Without a car",
    carFree: [],
    longTitle: "Long weekends",
    long: [],
    warningTitle: "Before you go",
    warning:
      "The listing reproduces what organisers publish. Times, capacity and programmes can change at the last minute: always check the activity's own site.",
  },
};

/** Cross-links are built here so they always point at pages that exist. */
function contextual(locale: Locale): Pick<EvergreenCopy, "rain" | "carFree" | "long"> {
  const holidayToday: Record<Locale, string> = {
    ca: "/ca/guies/es-festiu-avui-catalunya/",
    es: "/es/guias/es-festivo-hoy-cataluna/",
    en: "/en/guides/is-today-a-holiday-in-catalonia/",
  };
  const trains: Record<Locale, string> = {
    ca: link("trains", "ca", "dotze escapades en tren"),
    es: link("trains", "es", "doce escapadas en tren"),
    en: link("trains", "en", "twelve day trips by train"),
  };
  const rainy: Record<Locale, string> = {
    ca: link("rainy", "ca", "vint plans per a un dia de pluja"),
    es: link("rainy", "es", "veinte planes para un día de lluvia"),
    en: link("rainy", "en", "twenty things to do on a rainy day"),
  };

  const byLocale: Record<Locale, Pick<EvergreenCopy, "rain" | "carFree" | "long">> = {
    ca: {
      rain: [
        `Molts dels plans d'exterior —fires, mercats, rutes— se suspenen o es redueixen amb pluja. Si la previsió és dolenta, tenim ${rainy.ca}, pensats per a llocs coberts.`,
      ],
      carFree: [
        `Bona part de l'agenda es concentra en ciutats amb tren. Si no tens cotxe, mira les ${trains.ca}: la majoria d'aquests municipis hi surten.`,
      ],
      long: [
        `Quan cau un festiu en divendres o dilluns, l'agenda inclou el pont. Per saber si un dia concret és festiu, tenim la pàgina [és festiu avui](${holidayToday.ca}).`,
      ],
    },
    es: {
      rain: [
        `Muchos planes al aire libre —ferias, mercados, rutas— se suspenden o se reducen con lluvia. Si la previsión es mala, tenemos ${rainy.es}, pensados para lugares cubiertos.`,
      ],
      carFree: [
        `Buena parte de la agenda se concentra en ciudades con tren. Si no tienes coche, mira las ${trains.es}: la mayoría de estos municipios aparecen.`,
      ],
      long: [
        `Cuando cae un festivo en viernes o lunes, la agenda incluye el puente. Para saber si un día concreto es festivo, tenemos la página [es festivo hoy](${holidayToday.es}).`,
      ],
    },
    en: {
      rain: [
        `Many outdoor plans — fairs, markets, walks — are called off or scaled back in rain. If the forecast is poor, we have ${rainy.en}, all indoors.`,
      ],
      carFree: [
        `Much of the listing is in towns with a station. Without a car, see the ${trains.en}: most of these towns are on the list.`,
      ],
      long: [
        `When a public holiday falls on a Friday or Monday, the listing covers the long weekend. To check a specific date, see [is today a public holiday](${holidayToday.en}).`,
      ],
    },
  };
  return byLocale[locale];
}

export function buildEvergreenBody(locale: Locale): Block[] {
  const copy = { ...EVERGREEN[locale], ...contextual(locale) };
  const blocks: Block[] = [];

  blocks.push({ type: "paragraph", lead: true, text: copy.lead });
  for (const text of copy.intro) blocks.push({ type: "paragraph", text });

  // The listing comes before the guidance: somebody who typed "what to do this
  // weekend" wants the list first and the advice second.
  blocks.push({ type: "weekendAgenda" });

  const section = (heading: string, paragraphs: string[]) => {
    blocks.push({ type: "heading", level: 2, text: heading });
    for (const text of paragraphs) blocks.push({ type: "paragraph", text });
  };

  section(copy.chooseTitle, copy.choose);
  section(copy.freeTitle, copy.free);
  section(copy.rainTitle, copy.rain);
  section(copy.carFreeTitle, copy.carFree);
  section(copy.longTitle, copy.long);

  blocks.push({ type: "callout", tone: "warning", title: copy.warningTitle, text: copy.warning });

  return blocks;
}
