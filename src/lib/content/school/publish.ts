import "server-only";

import type { Block } from "@/lib/content/blocks";
import { IMAGES } from "@/lib/content/images";
import { publishArticle, upsertImages, type ArticleSpec, type ImageSpec, type PublishResult } from "@/lib/content/publish-article";
import { LOCALES, type Locale } from "@/lib/i18n/config";

import { SCHOOL_SOURCE, SCHOOL_VERIFIED_AT } from "./calendar";

/**
 * "School calendar in Catalonia."
 *
 * One order (EDF/66/2026) sets three school years at once, which makes this a
 * page that answers the same recurring questions - when does school start,
 * when are the Christmas and Easter holidays, is there school today - for
 * three years without a refresh. Every statement in the copy below is in the
 * order's text; nothing is added from memory or from other sites.
 */

export const ENTRY_KEY = "guide-school-calendar-catalonia";

const PUBLISHED = new Date("2026-10-07T22:45:00+02:00");
const HERO_KEY = "calendari-escolar-escola-vic-pati";
const SECOND_KEY = "calendari-escolar-grup-ramon-llull";
const IMAGE_BY_KEY = new Map(IMAGES.map((image) => [image.key, image]));

interface Copy {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  lead: string;
  howTitle: string;
  how: string[];
  freeTitle: string;
  free: string[];
  juneTitle: string;
  june: string[];
  otherTitle: string;
  other: string[];
  related: string;
  heroAlt: string;
  heroCaption: string;
  secondAlt: string;
  secondCaption: string;
}

export const COPY: Record<Locale, Copy> = {
  ca: {
    path: "guies/calendari-escolar-catalunya",
    title: "Calendari escolar de Catalunya: inici de curs, Nadal i Setmana Santa",
    seoTitle: "Calendari escolar Catalunya: dates fins al 2029",
    seoDescription:
      "Quan comença i acaba el curs escolar a Catalunya, les vacances de Nadal i Setmana Santa dels cursos 2026-2027, 2027-2028 i 2028-2029, segons el DOGC.",
    excerpt:
      "Les dates oficials dels cursos 2026-2027, 2027-2028 i 2028-2029: inici, final, Nadal i Setmana Santa, i si avui hi ha escola.",
    lead: "Una sola ordre del Departament d'Educació fixa el calendari escolar de **tres cursos seguits**. Aquí hi ha totes les dates, i què diu el calendari d'**avui**.",
    howTitle: "Com es fixa el calendari",
    how: [
      "L'Ordre EDF/66/2026, publicada al DOGC el 27 d'abril de 2026, estableix el calendari dels cursos 2026-2027, 2027-2028 i 2028-2029 per a totes les escoles i instituts de Catalunya, públics i privats. La Llei d'educació demana entre 175 i 178 dies lectius per curs.",
      "El curs comença el sisè dia laborable de setembre, que en els tres cursos és el **8 de setembre**, o el dia laborable següent si el 8 és festiu. L'FP, en canvi, comença com a més tard el 14, el 13 o el 12 de setembre, segons el curs.",
    ],
    freeTitle: "Els dies que no surten a la taula",
    free: [
      "Cada escola pot fixar **quatre dies de lliure disposició** per curs, repartits entre els tres trimestres. No poden coincidir amb el primer ni l'últim dia de curs, ni amb les vacances de Nadal o Setmana Santa. Els decideix cada centre, i el consell escolar municipal proposa quins convindria que fessin totes les escoles del mateix municipi: per saber-los, cal preguntar a l'escola o a l'ajuntament.",
      "També són festius els dos dies de **festa local** del municipi. Si un festiu local cau en un dia no lectiu, l'escola el pot afegir als seus dies de lliure disposició. Els festius locals de cada municipi són a la pàgina de [festius locals](/ca/guies/festius-locals-catalunya/).",
    ],
    juneTitle: "Juny: jornada continuada",
    june: [
      "Les escoles i instituts poden reduir una hora diària l'horari de l'alumnat al final de curs, a partir del **7 de juny de 2027**, el **9 de juny de 2028** i l'**11 de juny de 2029**. És una opció de cada centre, no una obligació.",
    ],
    otherTitle: "Batxillerat, FP i adults",
    other: [
      "Primer de batxillerat acaba el 17 de juny de 2027, el 20 de juny de 2028 i el 20 de juny de 2029. El final de segon de batxillerat el fixa cada centre segons el calendari d'accés a la universitat.",
      "La formació de persones adultes i les escoles oficials d'idiomes comencen com a més tard el 21 de setembre de 2026, el 20 de setembre de 2027 i el 18 i el 21 de setembre de 2028, respectivament.",
    ],
    related:
      "Per planificar ponts i vacances amb els festius laborals, mira el [calendari laboral](/ca/guies/calendari-laboral-catalunya/) i la pàgina [és festiu avui](/ca/guies/es-festiu-avui-catalunya/).",
    heroAlt: "Façana de l'Escola Jaume Balmes de Vic amb el pati enrajolat al davant",
    heroCaption: "L'Escola Jaume Balmes, a Vic.",
    secondAlt: "Edifici del Grup Escolar Ramon Llull de Barcelona entre palmeres i arbres",
    secondCaption: "El Grup Escolar Ramon Llull, a Barcelona.",
  },
  es: {
    path: "guias/calendario-escolar-cataluna",
    title: "Calendario escolar de Cataluña: inicio de curso, Navidad y Semana Santa",
    seoTitle: "Calendario escolar Cataluña: fechas hasta 2029",
    seoDescription:
      "Cuándo empieza y acaba el curso escolar en Cataluña, las vacaciones de Navidad y Semana Santa de los cursos 2026-2027, 2027-2028 y 2028-2029, según el DOGC.",
    excerpt:
      "Las fechas oficiales de los cursos 2026-2027, 2027-2028 y 2028-2029: inicio, final, Navidad y Semana Santa, y si hoy hay colegio.",
    lead: "Una sola orden del Departamento de Educación fija el calendario escolar de **tres cursos seguidos**. Aquí están todas las fechas, y qué dice el calendario de **hoy**.",
    howTitle: "Cómo se fija el calendario",
    how: [
      "La Ordre EDF/66/2026, publicada en el DOGC el 27 de abril de 2026, establece el calendario de los cursos 2026-2027, 2027-2028 y 2028-2029 para todos los colegios e institutos de Cataluña, públicos y privados. La Ley de educación exige entre 175 y 178 días lectivos por curso.",
      "El curso empieza el sexto día laborable de septiembre, que en los tres cursos es el **8 de septiembre**, o el siguiente día laborable si el 8 es festivo. La FP, en cambio, empieza como muy tarde el 14, el 13 o el 12 de septiembre, según el curso.",
    ],
    freeTitle: "Los días que no aparecen en la tabla",
    free: [
      "Cada colegio puede fijar **cuatro días de libre disposición** por curso, repartidos entre los tres trimestres. No pueden coincidir con el primer ni el último día de curso, ni con las vacaciones de Navidad o Semana Santa. Los decide cada centro, y el consejo escolar municipal propone cuáles convendría que hicieran todos los colegios del mismo municipio: para saberlos, hay que preguntar al colegio o al ayuntamiento.",
      "También son festivos los dos días de **fiesta local** del municipio. Si un festivo local cae en un día no lectivo, el colegio puede añadirlo a sus días de libre disposición. Los festivos locales de cada municipio están en la página de [festivos locales](/es/guias/festivos-locales-cataluna/).",
    ],
    juneTitle: "Junio: jornada continua",
    june: [
      "Los colegios e institutos pueden reducir una hora diaria el horario del alumnado al final de curso, a partir del **7 de junio de 2027**, el **9 de junio de 2028** y el **11 de junio de 2029**. Es una opción de cada centro, no una obligación.",
    ],
    otherTitle: "Bachillerato, FP y adultos",
    other: [
      "Primero de bachillerato termina el 17 de junio de 2027, el 20 de junio de 2028 y el 20 de junio de 2029. El final de segundo de bachillerato lo fija cada centro según el calendario de acceso a la universidad.",
      "La formación de personas adultas y las escuelas oficiales de idiomas empiezan como muy tarde el 21 de septiembre de 2026, el 20 de septiembre de 2027 y el 18 y el 21 de septiembre de 2028, respectivamente.",
    ],
    related:
      "Para planificar puentes y vacaciones con los festivos laborales, mira el [calendario laboral](/es/guias/calendario-laboral-cataluna/) y la página [es festivo hoy](/es/guias/es-festivo-hoy-cataluna/).",
    heroAlt: "Fachada de la Escola Jaume Balmes de Vic con el patio embaldosado delante",
    heroCaption: "La Escola Jaume Balmes, en Vic.",
    secondAlt: "Edificio del Grup Escolar Ramon Llull de Barcelona entre palmeras y árboles",
    secondCaption: "El Grup Escolar Ramon Llull, en Barcelona.",
  },
  en: {
    path: "guides/catalonia-school-calendar",
    title: "Catalonia school calendar: term dates, Christmas and Easter",
    seoTitle: "Catalonia school calendar: term dates to 2029",
    seoDescription:
      "When the school year starts and ends in Catalonia, and the Christmas and Easter holidays for 2026-2027, 2027-2028 and 2028-2029, from the official gazette.",
    excerpt:
      "Official term dates for 2026-2027, 2027-2028 and 2028-2029: start, end, Christmas and Easter, and whether schools are open today.",
    lead: "A single order from the Catalan education department sets the school calendar for **three years in a row**. Here are all the dates, and what the calendar says about **today**.",
    howTitle: "How the calendar is set",
    how: [
      "Order EDF/66/2026, published in the Catalan official gazette (DOGC) on 27 April 2026, sets the calendar for 2026-2027, 2027-2028 and 2028-2029 for every school in Catalonia, state and private. Catalan education law requires between 175 and 178 teaching days a year.",
      "The year starts on the sixth working day of September, which in all three years is **8 September**, or the next working day if the 8th is a holiday. Vocational training (FP) starts by 14, 13 or 12 September at the latest, depending on the year.",
    ],
    freeTitle: "The days the table cannot show",
    free: [
      "Each school can set **four free-choice days** a year, spread across the three terms. They cannot fall on the first or last day of the year, or in the Christmas or Easter holidays. Each school decides its own, and the municipal school council suggests days for all schools in the same town to share: ask the school or the town hall.",
      "The town's two **local holidays** are also days off. If one falls on a non-school day, the school can add it to its free-choice days. Every town's local holidays are on the [local holidays](/en/guides/local-holidays-catalonia/) page.",
    ],
    juneTitle: "June: shorter school days",
    june: [
      "Schools may cut the school day by one hour at the end of the year, from **7 June 2027**, **9 June 2028** and **11 June 2029**. It is each school's choice, not a rule.",
    ],
    otherTitle: "Batxillerat, vocational training and adults",
    other: [
      "First-year batxillerat (the two-year upper-secondary course) ends on 17 June 2027, 20 June 2028 and 20 June 2029. The end of the second year is set by each school around the university-entrance calendar.",
      "Adult education and the official language schools start by 21 September 2026, 20 September 2027, and 18 and 21 September 2028 respectively, at the latest.",
    ],
    related:
      "To plan long weekends around public holidays, see the [public holiday guide](/en/guides/catalonia-public-holidays/) and [is today a holiday](/en/guides/is-today-a-holiday-in-catalonia/).",
    heroAlt: "Front of the Jaume Balmes school in Vic with its paved playground",
    heroCaption: "Jaume Balmes school, Vic.",
    secondAlt: "The Ramon Llull school building in Barcelona among palm trees",
    secondCaption: "The Ramon Llull school group, Barcelona.",
  },
};

export function buildBody(locale: Locale, secondMediaId?: string): Block[] {
  const copy = COPY[locale];
  const blocks: Block[] = [{ type: "paragraph", lead: true, text: copy.lead }];
  blocks.push({ type: "schoolCalendar" });

  const section = (heading: string, paragraphs: string[]) => {
    blocks.push({ type: "heading", level: 2, text: heading });
    for (const text of paragraphs) blocks.push({ type: "paragraph", text });
  };
  section(copy.howTitle, copy.how);
  section(copy.freeTitle, copy.free);
  if (secondMediaId) blocks.push({ type: "image", mediaId: secondMediaId, size: "wide" });
  section(copy.juneTitle, copy.june);
  section(copy.otherTitle, copy.other);
  blocks.push({ type: "paragraph", text: copy.related });
  return blocks;
}

function imageSpec(key: string, alt: (c: Copy) => string, caption: (c: Copy) => string): ImageSpec {
  const file = IMAGE_BY_KEY.get(key);
  if (!file) throw new Error(`school: image ${key} missing from the manifest`);
  return {
    key,
    url: file.url,
    width: file.width,
    height: file.height,
    blurDataUrl: file.blurDataUrl,
    credit: file.credit ?? "CatalunyaInfo",
    creditUrl: file.creditUrl ?? null,
    license: file.license ?? null,
    alt: Object.fromEntries(LOCALES.map((l) => [l, alt(COPY[l])])),
    caption: Object.fromEntries(LOCALES.map((l) => [l, caption(COPY[l])])),
  };
}

export async function publishSchoolCalendarGuide(): Promise<PublishResult> {
  const images = [
    imageSpec(HERO_KEY, (c) => c.heroAlt, (c) => c.heroCaption),
    imageSpec(SECOND_KEY, (c) => c.secondAlt, (c) => c.secondCaption),
  ];
  const mediaIds = await upsertImages(images);

  const spec: ArticleSpec = {
    entryKey: ENTRY_KEY,
    type: "guide",
    categoryKey: "calendar",
    isFeatured: false,
    heroKey: HERO_KEY,
    images,
    sources: [{ name: SCHOOL_SOURCE.name, url: SCHOOL_SOURCE.url, publisher: SCHOOL_SOURCE.publisher, type: "official" as const }],
    publishedAt: PUBLISHED,
    lastVerifiedAt: new Date(`${SCHOOL_VERIFIED_AT}T12:00:00+02:00`),
    editions: LOCALES.map((locale) => {
      const copy = COPY[locale];
      return {
        locale,
        path: copy.path,
        title: copy.title,
        excerpt: copy.excerpt,
        seoTitle: copy.seoTitle,
        seoDescription: copy.seoDescription,
        body: buildBody(locale, mediaIds.get(SECOND_KEY)),
      };
    }),
  };

  return publishArticle(spec);
}
