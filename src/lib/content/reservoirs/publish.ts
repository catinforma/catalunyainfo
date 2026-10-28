import "server-only";

import type { Block } from "@/lib/content/blocks";
import { IMAGES } from "@/lib/content/images";
import { publishArticle, upsertImages, type ArticleSpec, type ImageSpec, type PublishResult } from "@/lib/content/publish-article";
import { LOCALES, type Locale } from "@/lib/i18n/config";

import { RESERVOIR_SOURCE } from "./levels";

/**
 * "Reservoir levels in Catalonia today."
 *
 * A question asked every week of the year, answered by the pages that rank
 * with a news article fixed on the day it was written. This one reads the
 * ACA's daily open data (see `levels.ts`) and wraps it in what the figure
 * alone does not say: what the percentage measures, which reservoirs supply
 * Barcelona, and which large reservoirs are not in this series at all.
 */

export const ENTRY_KEY = "guide-reservoir-levels-catalonia";

const PUBLISHED = new Date("2026-10-07T23:00:00+02:00");
const HERO_KEY = "embassaments-sau-cingles-tavertet";
const SECOND_KEY = "embassaments-presa-sau-tavertet";
const IMAGE_BY_KEY = new Map(IMAGES.map((image) => [image.key, image]));

const PLAN_SOURCE = {
  name: "Pla de gestió del districte de conca fluvial de Catalunya 2022-2027 — annex 6",
  url: "https://info.aca.gencat.cat/ca/aca/informacio/geco/plans-programes/PDG/CA/01-06_Annex06_Analisi_garantia_models.pdf",
  publisher: "Agència Catalana de l'Aigua",
};
const EBRO_SOURCE = {
  name: "Els embassaments a la conca catalana de l'Ebre",
  url: "https://aigua.blog.gencat.cat/2020/05/21/els-embassaments-a-la-conca-catalana-de-lebre/",
  publisher: "Agència Catalana de l'Aigua",
};

interface Copy {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  lead: string;
  readTitle: string;
  read: string[];
  barcelonaTitle: string;
  barcelona: string[];
  missingTitle: string;
  missing: string[];
  droughtTitle: string;
  drought: string[];
  faq: { question: string; answer: string }[];
  heroAlt: string;
  heroCaption: string;
  secondAlt: string;
  secondCaption: string;
}

export const COPY: Record<Locale, Copy> = {
  ca: {
    path: "guies/embassaments-catalunya-avui",
    title: "Estat dels embassaments de Catalunya avui: a quin nivell són",
    seoTitle: "Estat dels embassaments de Catalunya avui (dades ACA)",
    seoDescription:
      "Estat i nivell dels embassaments de Catalunya avui amb la dada diària de l'ACA: % i hm³ de cada pantà, capacitat, canvi setmanal i el Ter-Llobregat.",
    excerpt:
      "El percentatge d'aigua de cada embassament que mesura l'ACA, llegit cada dia de les dades obertes, i què vol dir per a l'àrea de Barcelona.",
    lead: "Així estan **avui** els embassaments de Catalunya: el percentatge d'aigua dels nou pantans de les conques internes, amb la dada **diària** de l'Agència Catalana de l'Aigua (ACA) i la data de la lectura al costat.",
    readTitle: "Nivell i capacitat dels embassaments: com llegir les xifres",
    read: [
      "El **percentatge** és el volum d'aigua embassada dividit per la capacitat de l'embassament. Un **hm³** (hectòmetre cúbic) és un milió de metres cúbics, és a dir, mil milions de litres.",
      "El total no és la mitjana dels percentatges: és la suma de volums dividida per la suma de capacitats. Per això pesen molt més Susqueda i Sau, que entre tots dos fan més de la meitat de la capacitat, que no pas Foix o Riudecanyes.",
      "Una xifra sense data no serveix. Molts articles sobre «l'estat dels pantans» continuen apareixent setmanes després d'escrits, i hi ha webs que fan servir el butlletí setmanal del Ministeri; aquí la lectura és la més recent que ha publicat l'ACA, que en dona una cada dia, i la columna de canvi diu cap on va.",
    ],
    barcelonaTitle: "Quins embassaments abasteixen Barcelona",
    barcelona: [
      "El pla de gestió de l'ACA fa servir la suma de cinc embassaments com a indicador de reserves del **sistema Ter-Llobregat**, el que abasteix l'àrea de Barcelona: **Sau i Susqueda**, al Ter, i **la Baells, la Llosa del Cavall i Sant Ponç**, a la conca del Llobregat. A la taula van marcats.",
      "Per això el percentatge del Ter-Llobregat diu més sobre l'aigua de l'àrea metropolitana que no pas el total, que inclou també embassaments petits d'altres zones.",
    ],
    missingTitle: "Què no hi surt: la conca de l'Ebre",
    missing: [
      "Aquestes dades són les dels embassaments que publica l'ACA. Els grans embassaments de la conca catalana de l'Ebre, com **Canelles, Rialb o Oliana**, no hi són: la majoria són d'empreses elèctriques, i Rialb i Oliana els gestiona la Confederació Hidrogràfica de l'Ebre. Per a aquests, la font és la mateixa Confederació.",
    ],
    droughtTitle: "I les restriccions per sequera?",
    drought: [
      "Les mesures per sequera no depenen del total d'aquesta pàgina, sinó de l'estat que l'ACA declara per a cada zona. Si el que vols saber és si hi ha restriccions al teu municipi, consulta directament l'ACA: un percentatge alt al total no garanteix que totes les zones estiguin igual.",
    ],
    faq: [
      { question: "Com estan avui els embassaments de Catalunya?", answer: "El percentatge d'avui és a dalt de tot, amb la data de la lectura. És la dada diària que publica l'ACA per als nou embassaments de les conques internes: Susqueda, Sau, la Baells, la Llosa del Cavall, Darnius Boadella, Sant Ponç, Siurana, Riudecanyes i Foix." },
      { question: "Cada quant s'actualitzen les dades?", answer: "Cada dia. L'ACA publica una lectura diària per embassament al portal de dades obertes de la Generalitat, i aquesta pàgina la torna a llegir com a molt cada tres hores." },
      { question: "Quins embassaments abasteixen Barcelona?", answer: "Els cinc del sistema Ter-Llobregat: Sau i Susqueda, al Ter, i la Baells, la Llosa del Cavall i Sant Ponç, a la conca del Llobregat." },
      { question: "Quina capacitat tenen els embassaments de Catalunya?", answer: "Els més grans de la sèrie de l'ACA són Susqueda, amb 223,6 hm³, i Sau, amb 165,8 hm³, segons el butlletí de l'ACA. La taula de dalt dona la capacitat de cadascun dels nou." },
      { question: "Per què no hi surten Canelles, Rialb o Oliana?", answer: "Perquè són a la conca de l'Ebre i no formen part d'aquesta sèrie de l'ACA. Rialb i Oliana els gestiona la Confederació Hidrogràfica de l'Ebre." },
    ],
    heroAlt: "El pantà de Sau amb l'aigua alta, envoltat de bosc i amb els cingles de Tavertet al fons",
    heroCaption: "Sau, al Ter, és un dels cinc embassaments del sistema Ter-Llobregat.",
    secondAlt: "La presa de Sau vista des dels cingles de Tavertet, amb el poble de la Riba a primer terme",
    secondCaption: "La presa de Sau des de Tavertet.",
  },
  es: {
    path: "guias/embalses-cataluna-hoy",
    title: "Embalses de Cataluña hoy: a qué nivel están",
    seoTitle: "Embalses de Catalunya hoy: nivel de los pantanos (ACA)",
    seoDescription:
      "Nivel de los embalses y pantanos de Cataluña hoy con el dato diario de la ACA: % y hm³ de cada embalse, capacidad, cambio semanal y el Ter-Llobregat.",
    excerpt:
      "El porcentaje de agua de cada embalse que mide la ACA, leído cada día de los datos abiertos, y qué significa para el área de Barcelona.",
    lead: "Así están **hoy** los embalses de Cataluña: el porcentaje de agua de los nueve pantanos de las cuencas internas, con el dato **diario** de la Agència Catalana de l'Aigua (ACA) y la fecha de la lectura al lado.",
    readTitle: "Nivel y capacidad de los pantanos: cómo leer las cifras",
    read: [
      "El **porcentaje** es el volumen de agua embalsada dividido por la capacidad del embalse. Un **hm³** (hectómetro cúbico) es un millón de metros cúbicos, es decir, mil millones de litros.",
      "El total no es la media de los porcentajes: es la suma de volúmenes dividida por la suma de capacidades. Por eso pesan mucho más Susqueda y Sau, que entre los dos suman más de la mitad de la capacidad, que Foix o Riudecanyes.",
      "Una cifra sin fecha no sirve. Muchos artículos sobre «el estado de los pantanos» siguen apareciendo semanas después de escritos, y hay webs que usan el boletín semanal del Ministerio; aquí la lectura es la más reciente que ha publicado la ACA, que da una cada día, y la columna de cambio dice hacia dónde va.",
    ],
    barcelonaTitle: "Qué embalses abastecen Barcelona",
    barcelona: [
      "El plan de gestión de la ACA usa la suma de cinco embalses como indicador de reservas del **sistema Ter-Llobregat**, el que abastece el área de Barcelona: **Sau y Susqueda**, en el Ter, y **la Baells, la Llosa del Cavall y Sant Ponç**, en la cuenca del Llobregat. En la tabla van marcados.",
      "Por eso el porcentaje del Ter-Llobregat dice más sobre el agua del área metropolitana que el total, que incluye también embalses pequeños de otras zonas.",
    ],
    missingTitle: "Qué no aparece: la cuenca del Ebro",
    missing: [
      "Estos datos son los de los embalses que publica la ACA. Los grandes embalses de la cuenca catalana del Ebro, como **Canelles, Rialb u Oliana**, no están: la mayoría son de empresas eléctricas, y Rialb y Oliana los gestiona la Confederación Hidrográfica del Ebro. Para esos, la fuente es la propia Confederación.",
    ],
    droughtTitle: "¿Y las restricciones por sequía?",
    drought: [
      "Las medidas por sequía no dependen del total de esta página, sino del estado que la ACA declara para cada zona. Si lo que quieres saber es si hay restricciones en tu municipio, consulta directamente la ACA: un porcentaje alto en el total no garantiza que todas las zonas estén igual.",
    ],
    faq: [
      { question: "¿Cómo están hoy los embalses de Cataluña?", answer: "El porcentaje de hoy está arriba del todo, con la fecha de la lectura. Es el dato diario que publica la ACA para los nueve embalses de las cuencas internas: Susqueda, Sau, la Baells, la Llosa del Cavall, Darnius Boadella, Sant Ponç, Siurana, Riudecanyes y Foix." },
      { question: "¿Cada cuánto se actualizan los datos?", answer: "Cada día. La ACA publica una lectura diaria por embalse en el portal de datos abiertos de la Generalitat, y esta página la vuelve a leer como mucho cada tres horas." },
      { question: "¿Qué embalses abastecen Barcelona?", answer: "Los cinco del sistema Ter-Llobregat: Sau y Susqueda, en el Ter, y la Baells, la Llosa del Cavall y Sant Ponç, en la cuenca del Llobregat." },
      { question: "¿Qué capacidad tienen los pantanos de Cataluña?", answer: "Los mayores de la serie de la ACA son Susqueda, con 223,6 hm³, y Sau, con 165,8 hm³, según el boletín de la ACA. La tabla de arriba da la capacidad de cada uno de los nueve." },
      { question: "¿Por qué no aparecen Canelles, Rialb u Oliana?", answer: "Porque están en la cuenca del Ebro y no forman parte de esta serie de la ACA. Rialb y Oliana los gestiona la Confederación Hidrográfica del Ebro." },
    ],
    heroAlt: "El pantano de Sau con el agua alta, rodeado de bosque y con los riscos de Tavertet al fondo",
    heroCaption: "Sau, en el Ter, es uno de los cinco embalses del sistema Ter-Llobregat.",
    secondAlt: "La presa de Sau vista desde los riscos de Tavertet, con el pueblo de la Riba en primer plano",
    secondCaption: "La presa de Sau desde Tavertet.",
  },
  en: {
    path: "guides/catalonia-reservoir-levels",
    title: "Catalonia reservoir levels today: how full they are",
    seoTitle: "Catalonia reservoir levels today: how full (ACA data)",
    seoDescription:
      "How full Catalonia's reservoirs are today, from the water agency's daily data: percentage, hm³, and the Ter-Llobregat system that supplies Barcelona.",
    excerpt:
      "How full each reservoir the Catalan water agency monitors is, read daily from its open data, and what it means for the Barcelona area.",
    lead: "How full Catalonia's reservoirs are **today**: the share of capacity held in the nine reservoirs of the Catalan internal basins that the Catalan Water Agency (ACA) measures, read directly from its daily open data. The reading date is always shown next to the figure.",
    readTitle: "How to read these figures",
    read: [
      "The **percentage** is the stored volume divided by the reservoir's capacity. One **hm³** (cubic hectometre) is a million cubic metres, or a billion litres.",
      "The total is not the average of the percentages: it is the sum of volumes over the sum of capacities. That is why Susqueda and Sau, which together hold more than half the capacity, weigh far more than Foix or Riudecanyes.",
      "A figure without a date is no use. Many articles on \"the state of the reservoirs\" keep showing up weeks after they were written, and some sites use the Spanish ministry's weekly bulletin; here the reading is the latest the ACA has published, one a day, and the change column shows which way it is going.",
    ],
    barcelonaTitle: "Which reservoirs supply Barcelona",
    barcelona: [
      "The ACA's basin management plan uses the sum of five reservoirs as the storage indicator of the **Ter-Llobregat system**, which supplies the Barcelona area: **Sau and Susqueda** on the Ter, and **la Baells, la Llosa del Cavall and Sant Ponç** in the Llobregat basin. They are marked in the table.",
      "That is why the Ter-Llobregat percentage says more about the metropolitan area's water than the total, which also includes small reservoirs elsewhere.",
    ],
    missingTitle: "What is not here: the Ebro basin",
    missing: [
      "This is the data for the reservoirs the ACA publishes. The large reservoirs of the Catalan part of the Ebro basin, such as **Canelles, Rialb and Oliana**, are not included: most belong to electricity companies, and Rialb and Oliana are managed by the Ebro Basin Authority (Confederación Hidrográfica del Ebro), which is the source for them.",
    ],
    droughtTitle: "What about drought restrictions?",
    drought: [
      "Drought measures do not depend on this page's total but on the status the ACA declares for each area. If you want to know whether your town has restrictions, check with the ACA directly: a high overall percentage does not mean every area is in the same position.",
    ],
    faq: [
      { question: "How full are Catalonia's reservoirs today?", answer: "Today's percentage is at the top of the page, with the reading date. It is the ACA's daily figure for the nine reservoirs of the internal basins: Susqueda, Sau, la Baells, la Llosa del Cavall, Darnius Boadella, Sant Ponç, Siurana, Riudecanyes and Foix." },
      { question: "How often is the data updated?", answer: "Daily. The ACA publishes one reading per reservoir per day on the Generalitat's open-data portal, and this page re-reads it at least every three hours." },
      { question: "Which reservoirs supply Barcelona?", answer: "The five of the Ter-Llobregat system: Sau and Susqueda on the Ter, and la Baells, la Llosa del Cavall and Sant Ponç in the Llobregat basin." },
      { question: "How big are Catalonia's reservoirs?", answer: "The largest in the ACA series are Susqueda, at 223.6 hm³, and Sau, at 165.8 hm³, according to the ACA's bulletin. The table above gives the capacity of each of the nine." },
      { question: "Why are Canelles, Rialb and Oliana not listed?", answer: "They are in the Ebro basin and are not part of this ACA series. Rialb and Oliana are managed by the Ebro Basin Authority." },
    ],
    heroAlt: "Sau reservoir with high water, surrounded by forest, with the Tavertet cliffs behind",
    heroCaption: "Sau, on the Ter, is one of the five reservoirs of the Ter-Llobregat system.",
    secondAlt: "Sau dam seen from the Tavertet cliffs, with the hamlet of la Riba in the foreground",
    secondCaption: "Sau dam from Tavertet.",
  },
};

export function buildBody(locale: Locale, secondMediaId?: string): Block[] {
  const copy = COPY[locale];
  const blocks: Block[] = [{ type: "paragraph", lead: true, text: copy.lead }];

  // The figure first: somebody who searched for it wants the number, then the
  // explanation.
  blocks.push({ type: "reservoirLevels" });

  const section = (heading: string, paragraphs: string[]) => {
    blocks.push({ type: "heading", level: 2, text: heading });
    for (const text of paragraphs) blocks.push({ type: "paragraph", text });
  };
  section(copy.readTitle, copy.read);
  section(copy.barcelonaTitle, copy.barcelona);
  if (secondMediaId) blocks.push({ type: "image", mediaId: secondMediaId, size: "wide" });
  section(copy.missingTitle, copy.missing);
  section(copy.droughtTitle, copy.drought);
  blocks.push({ type: "faq", items: copy.faq });
  return blocks;
}

function imageSpec(key: string, alt: (c: Copy) => string, caption: (c: Copy) => string): ImageSpec {
  const file = IMAGE_BY_KEY.get(key);
  if (!file) throw new Error(`reservoirs: image ${key} missing from the manifest`);
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

export async function publishReservoirGuide(): Promise<PublishResult> {
  const images = [
    imageSpec(HERO_KEY, (c) => c.heroAlt, (c) => c.heroCaption),
    imageSpec(SECOND_KEY, (c) => c.secondAlt, (c) => c.secondCaption),
  ];
  const mediaIds = await upsertImages(images);

  const spec: ArticleSpec = {
    entryKey: ENTRY_KEY,
    type: "guide",
    categoryKey: "nature",
    isFeatured: false,
    heroKey: HERO_KEY,
    images,
    sources: [
      { name: RESERVOIR_SOURCE.name, url: RESERVOIR_SOURCE.url, publisher: RESERVOIR_SOURCE.publisher, type: "official" as const },
      { name: PLAN_SOURCE.name, url: PLAN_SOURCE.url, publisher: PLAN_SOURCE.publisher, type: "official" as const },
      { name: EBRO_SOURCE.name, url: EBRO_SOURCE.url, publisher: EBRO_SOURCE.publisher, type: "official" as const },
    ],
    publishedAt: PUBLISHED,
    lastVerifiedAt: new Date(),
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
