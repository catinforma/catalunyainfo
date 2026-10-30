import "server-only";

import type { Block } from "@/lib/content/blocks";
import { IMAGES } from "@/lib/content/images";
import { publishArticle, type ArticleSpec, type PublishResult } from "@/lib/content/publish-article";
import { LOCALES, type Locale } from "@/lib/i18n/config";

import { NEXT_YEAR, SNAPSHOT } from "@/lib/programmatic/holidays/data";
import { datePath } from "@/lib/programmatic/holidays/paths";
import { largestTownLinks, townPageCount } from "@/lib/programmatic/holidays/towns";

import { HOLIDAY_SOURCE } from "./calendar";
import { LOCAL_SOURCE } from "./local";

/**
 * "Local holidays in Catalonia, every municipality."
 *
 * The third page in the holiday cluster, and the one the other two kept
 * pointing at a gap for: the year planner covers the twelve Catalonia-wide
 * days, "is today a holiday" answers for one day, and this one answers the
 * question neither could - when is the local holiday in this particular town.
 *
 * One page, not one per municipality. See `LocalHolidays.tsx` for why.
 */

export const ENTRY_KEY = "guide-local-holidays-catalonia";

const PUBLISHED = new Date("2026-10-07T18:00:00+02:00");
const HERO_KEY = "festius-locals-gegants-festa-major";
const IMAGE_BY_KEY = new Map(IMAGES.map((image) => [image.key, image]));

interface Copy {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  /** `{count}` is the number of town pages, `{towns}` links to the largest ones. */
  lead: string;
  /** The rest of the year's busiest local-holiday days; `{n:<iso>}` is the count of places, `{p:<iso>}` the date page. */
  upcoming: string;
  /** Said while the next year's local order is not out. */
  nextYear: string;
  howTitle: string;
  how: string[];
  nucleiTitle: string;
  nuclei: string[];
  workTitle: string;
  work: string[];
  related: string;
  heroAlt: string;
  heroCaption: string;
}

const COPY: Record<Locale, Copy> = {
  ca: {
    path: "guies/festius-locals-catalunya",
    title: "Festius locals de Catalunya: el calendari de tots els municipis",
    seoTitle: "Festius locals Catalunya 2026 per municipi: busca el teu",
    seoDescription:
      "Busca els dos festius locals del teu municipi de Catalunya: cada municipi té la seva pàgina. Propers: 11 i 30 de novembre i 7 de desembre.",
    excerpt:
      "Els dos dies de festa local de cada municipi de Catalunya, en una sola taula amb cercador i dades oficials de la Generalitat.",
    lead: "A banda dels dotze festius de tot Catalunya, **cada municipi en fixa dos de propis**. Busca el teu a la taula, amb tots els municipis; els {count} que tenen festius oficials tenen, a més, la seva pàgina amb l'any sencer i si avui és festiu: **[festius locals per municipi](/ca/festius/)** ({towns}…).",
    upcoming:
      "Els dies amb més festius locals del que queda del 2026: l'**11 de novembre**, Sant Martí, en {n:2026-11-11} llocs (municipis o nuclis); el **30 de novembre**, Sant Andreu, en {n:2026-11-30}, i el **7 de desembre**, el dilluns del pont, en {n:2026-12-07}. Cada dia té la seva pàgina amb la llista: [11 de novembre]({p:2026-11-11}), [30 de novembre]({p:2026-11-30}) i [7 de desembre]({p:2026-12-07}).",
    nextYear:
      "Els festius locals del 2027 encara no s'han publicat: els fixa cada any una ordre del Departament d'Empresa i Treball al DOGC (la del 2026 va sortir el 17 de desembre del 2025). Els afegirem quan surti.",
    howTitle: "Com funcionen els festius locals",
    how: [
      "Cada ajuntament tria dos dies de festa local l'any, normalment vinculats a la festa major o al patró del poble. Són retribuïts i no recuperables, igual que els festius de Catalunya.",
      "Els aprova cada ajuntament i la Generalitat els publica tots junts. Per això el calendari de l'any següent no es coneix fins que l'any s'acaba: cada consistori el decideix pel seu compte.",
    ],
    nucleiTitle: "Pobles dins d'un municipi amb festius diferents",
    nuclei: [
      "Alguns nuclis d'un mateix municipi tenen festius locals diferents dels de la capital municipal. A la taula surten per separat i marcats, perquè sumar-los al municipi donaria a tot el terme uns festius que només són d'un poble.",
    ],
    workTitle: "Si treballes en un municipi i vius en un altre",
    work: [
      "El festiu local que t'afecta a la feina és el del municipi on és el centre de treball, no el d'on vius. Una persona que viu a Badalona i treballa a Barcelona fa els festius locals de Barcelona.",
    ],
    related:
      "Per als dotze festius de tot Catalunya, mira el [calendari laboral](/ca/guies/calendari-laboral-catalunya/); per saber si avui és festiu, la pàgina [és festiu avui](/ca/guies/es-festiu-avui-catalunya/). Per saber quins dies no hi ha classe, mira el [calendari escolar](/ca/guies/calendari-escolar-catalunya/). Cada municipi té, a més, la seva pàgina, amb tots els festius de l'any i si avui és festiu: [festius locals per municipi](/ca/festius/).",
    heroAlt: "Gegants desfilant per un carrer ple de gent durant una festa major a Catalunya",
    heroCaption: "Molts festius locals coincideixen amb la festa major del poble.",
  },
  es: {
    path: "guias/festivos-locales-cataluna",
    title: "Festivos locales de Cataluña: el calendario de todos los municipios",
    seoTitle: "Festivos locales Cataluña 2026 por municipio: busca el tuyo",
    seoDescription:
      "Busca los dos festivos locales de tu municipio en Cataluña: cada municipio tiene su página. Próximos: 11 y 30 de noviembre y 7 de diciembre.",
    excerpt:
      "Los dos días de fiesta local de cada municipio de Cataluña, en una sola tabla con buscador y datos oficiales de la Generalitat.",
    lead: "Además de los doce festivos de toda Cataluña, **cada municipio fija dos propios**. Busca el tuyo en la tabla, con todos los municipios; los {count} que tienen festivos oficiales tienen, además, su página con el año entero y si hoy es festivo: **[festivos locales por municipio](/es/festivos/)** ({towns}…).",
    upcoming:
      "Los días con más festivos locales en lo que queda de 2026: el **11 de noviembre**, San Martín, en {n:2026-11-11} lugares (municipios o núcleos); el **30 de noviembre**, San Andrés, en {n:2026-11-30}, y el **7 de diciembre**, el lunes del puente, en {n:2026-12-07}. Cada día tiene su página con la lista: [11 de noviembre]({p:2026-11-11}), [30 de noviembre]({p:2026-11-30}) y [7 de diciembre]({p:2026-12-07}).",
    nextYear:
      "Los festivos locales de 2027 aún no se han publicado: los fija cada año una orden del Departament d'Empresa i Treball en el DOGC (la de 2026 salió el 17 de diciembre de 2025). Los añadiremos cuando salga.",
    howTitle: "Cómo funcionan los festivos locales",
    how: [
      "Cada ayuntamiento elige dos días de fiesta local al año, normalmente ligados a la fiesta mayor o al patrón. Son retribuidos y no recuperables, igual que los festivos de Cataluña.",
      "Los aprueba cada ayuntamiento y la Generalitat los publica todos juntos. Por eso el calendario del año siguiente no se conoce hasta que termina el año: cada consistorio lo decide por su cuenta.",
    ],
    nucleiTitle: "Pueblos dentro de un municipio con festivos distintos",
    nuclei: [
      "Algunos núcleos de un mismo municipio tienen festivos locales distintos de los de la capital municipal. En la tabla aparecen por separado y marcados, porque sumarlos al municipio daría a todo el término unos festivos que solo son de un pueblo.",
    ],
    workTitle: "Si trabajas en un municipio y vives en otro",
    work: [
      "El festivo local que te afecta en el trabajo es el del municipio donde está el centro de trabajo, no el de donde vives. Una persona que vive en Badalona y trabaja en Barcelona hace los festivos locales de Barcelona.",
    ],
    related:
      "Para los doce festivos de toda Cataluña, mira el [calendario laboral](/es/guias/calendario-laboral-cataluna/); para saber si hoy es festivo, la página [es festivo hoy](/es/guias/es-festivo-hoy-cataluna/). Para saber qué días no hay clase, mira el [calendario escolar](/es/guias/calendario-escolar-cataluna/). Cada municipio tiene, además, su página, con todos los festivos del año y si hoy es festivo: [festivos locales por municipio](/es/festivos/).",
    heroAlt: "Gigantes desfilando por una calle llena de gente durante una fiesta mayor en Cataluña",
    heroCaption: "Muchos festivos locales coinciden con la fiesta mayor del pueblo.",
  },
  en: {
    path: "guides/local-holidays-catalonia",
    title: "Local public holidays in Catalonia: every municipality",
    seoTitle: "Local public holidays in Catalonia by town",
    seoDescription:
      "When the local holiday is in your town: the two local holidays every council in Catalonia sets, searchable, from official data.",
    excerpt:
      "The two local holidays of every municipality in Catalonia, in one searchable table from the Catalan government's open data.",
    lead: "On top of Catalonia's twelve public holidays, **every municipality sets two of its own**. Here are all of them, with a search box.",
    upcoming:
      "The busiest local-holiday days left in 2026: **11 November**, Saint Martin's Day, in {n:2026-11-11} places (municipalities or villages within them); **30 November**, Saint Andrew's Day, in {n:2026-11-30}; and **7 December**, the Monday of the bridge, in {n:2026-12-07}. Each day has its own page with the list: [11 November]({p:2026-11-11}), [30 November]({p:2026-11-30}) and [7 December]({p:2026-12-07}).",
    nextYear:
      "The 2027 local holidays are not out yet: an order of the Catalan Department of Business and Labour sets them every year in the official gazette, the DOGC (the 2026 order came out on 17 December 2025). We will add them when it is published.",
    howTitle: "How local holidays work",
    how: [
      "Each council picks two local holidays a year, usually tied to the town's festa major or patron saint. They are paid and cannot be made up later, exactly like the Catalonia-wide days.",
      "Each council approves its own and the Catalan government publishes them together. That is why next year's calendar is not known until the year ends: every council decides separately.",
    ],
    nucleiTitle: "Villages with different days from their municipality",
    nuclei: [
      "Some villages within a municipality keep different local holidays from the main town. They are listed separately and marked, because adding them to the municipality would give the whole area holidays that belong to one village.",
    ],
    workTitle: "If you work in one town and live in another",
    work: [
      "The local holiday that applies at work is the one of the municipality where your workplace is, not where you live. Someone living in Badalona and working in Barcelona takes Barcelona's local holidays.",
    ],
    related:
      "For the twelve Catalonia-wide days, see the [public holiday guide](/en/guides/catalonia-public-holidays/); to check today, see [is today a holiday](/en/guides/is-today-a-holiday-in-catalonia/). For the days schools are closed, see the [school calendar](/en/guides/catalonia-school-calendar/).",
    heroAlt: "Giant figures parading through a crowded street during a festa major in Catalonia",
    heroCaption: "Many local holidays fall on the town's festa major.",
  },
};

/** Fills `{n:<iso>}` (places with a local holiday that day) and `{p:<iso>}` (its date page). */
function fillDates(text: string, locale: Locale): string {
  return text
    .replace(/\{n:(\d{4}-\d{2}-\d{2})\}/g, (_, iso: string) => String(SNAPSHOT.localByDate[iso]?.length ?? 0))
    .replace(/\{p:(\d{4}-\d{2}-\d{2})\}/g, (_, iso: string) => datePath(locale, iso));
}

/** Town pages exist in Catalan and Spanish only; the English lead has no placeholders. */
function fillLead(text: string, locale: Locale): string {
  if (locale === "en") return text;
  return text.replace("{count}", String(townPageCount())).replace("{towns}", largestTownLinks(locale, 6).join(", "));
}

export function buildBody(locale: Locale): Block[] {
  const copy = COPY[locale];
  const blocks: Block[] = [{ type: "paragraph", lead: true, text: fillLead(copy.lead, locale) }];
  // The rest of the year's busiest days, from the same DOGC snapshot as the
  // town and date pages, so every count on the site agrees. Only while the
  // snapshot is this year's: a new year's snapshot makes these dates past.
  if (SNAPSHOT.year === 2026) blocks.push({ type: "paragraph", text: fillDates(copy.upcoming, locale) });
  if (!NEXT_YEAR.order) blocks.push({ type: "paragraph", text: copy.nextYear });

  // The table first: somebody who searched for their town's holiday wants the
  // date, then the explanation.
  blocks.push({ type: "localHolidays" });

  const section = (heading: string, paragraphs: string[]) => {
    blocks.push({ type: "heading", level: 2, text: heading });
    for (const text of paragraphs) blocks.push({ type: "paragraph", text });
  };
  section(copy.howTitle, copy.how);
  section(copy.nucleiTitle, copy.nuclei);
  section(copy.workTitle, copy.work);

  blocks.push({ type: "paragraph", text: copy.related });
  return blocks;
}

export async function publishLocalHolidaysGuide(): Promise<PublishResult> {
  const file = IMAGE_BY_KEY.get(HERO_KEY);
  const images = file
    ? [
        {
          key: HERO_KEY,
          url: file.url,
          width: file.width,
          height: file.height,
          blurDataUrl: file.blurDataUrl,
          credit: file.credit ?? "CatalunyaInfo",
          creditUrl: file.creditUrl ?? null,
          license: file.license ?? null,
          alt: Object.fromEntries(LOCALES.map((l) => [l, COPY[l].heroAlt])),
          caption: Object.fromEntries(LOCALES.map((l) => [l, COPY[l].heroCaption])),
        },
      ]
    : [];

  const spec: ArticleSpec = {
    entryKey: ENTRY_KEY,
    type: "guide",
    categoryKey: "public-services",
    isFeatured: false,
    heroKey: HERO_KEY,
    images,
    sources: [
      { name: LOCAL_SOURCE.name, url: LOCAL_SOURCE.url, publisher: LOCAL_SOURCE.publisher, type: "official" as const },
      { name: HOLIDAY_SOURCE.name, url: HOLIDAY_SOURCE.url, publisher: HOLIDAY_SOURCE.publisher, type: "official" as const },
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
        body: buildBody(locale),
      };
    }),
  };

  return publishArticle(spec);
}

export { COPY };
