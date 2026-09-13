import "server-only";

import { requireDb, schema } from "@/lib/db/client";

/**
 * The taxonomy: sections, categories and the controlled tag vocabulary.
 *
 * This is structure, not content. It creates the shelves; the editorial team
 * puts things on them. Nothing here is an article, a news item or a guide.
 *
 * Safe to run repeatedly: every row is upserted on its stable key.
 */

interface CategorySeed {
  key: string;
  section: string;
  sortOrder: number;
  names: { ca: string; es: string; en: string };
  slugs: { ca: string; es: string; en: string };
}

const CATEGORIES: CategorySeed[] = [
  // Destinations
  {
    key: "coast",
    section: "destinations",
    sortOrder: 10,
    names: { ca: "Costa i platges", es: "Costa y playas", en: "Coast and beaches" },
    slugs: { ca: "costa-i-platges", es: "costa-y-playas", en: "coast-and-beaches" },
  },
  {
    key: "mountain",
    section: "destinations",
    sortOrder: 20,
    names: { ca: "Muntanya", es: "Montaña", en: "Mountains" },
    slugs: { ca: "muntanya", es: "montana", en: "mountains" },
  },
  {
    key: "villages",
    section: "destinations",
    sortOrder: 30,
    names: { ca: "Pobles", es: "Pueblos", en: "Villages" },
    slugs: { ca: "pobles", es: "pueblos", en: "villages" },
  },
  {
    key: "cities",
    section: "destinations",
    sortOrder: 40,
    names: { ca: "Ciutats", es: "Ciudades", en: "Cities" },
    slugs: { ca: "ciutats", es: "ciudades", en: "cities" },
  },
  {
    key: "nature",
    section: "destinations",
    sortOrder: 50,
    names: { ca: "Natura i parcs", es: "Naturaleza y parques", en: "Nature and parks" },
    slugs: { ca: "natura-i-parcs", es: "naturaleza-y-parques", en: "nature-and-parks" },
  },

  // Practical guides
  {
    key: "transport",
    section: "guides",
    sortOrder: 10,
    names: { ca: "Transport", es: "Transporte", en: "Transport" },
    slugs: { ca: "transport", es: "transporte", en: "transport" },
  },
  {
    key: "public-services",
    section: "guides",
    sortOrder: 20,
    names: { ca: "Serveis públics", es: "Servicios públicos", en: "Public services" },
    slugs: { ca: "serveis-publics", es: "servicios-publicos", en: "public-services" },
  },
  {
    key: "food",
    section: "guides",
    sortOrder: 30,
    names: { ca: "Gastronomia", es: "Gastronomía", en: "Food and drink" },
    slugs: { ca: "gastronomia", es: "gastronomia", en: "food-and-drink" },
  },
  {
    key: "culture",
    section: "guides",
    sortOrder: 40,
    names: { ca: "Cultura i patrimoni", es: "Cultura y patrimonio", en: "Culture and heritage" },
    slugs: { ca: "cultura-i-patrimoni", es: "cultura-y-patrimonio", en: "culture-and-heritage" },
  },
  {
    key: "outdoors",
    section: "guides",
    sortOrder: 50,
    names: { ca: "Activitats a l'aire lliure", es: "Actividades al aire libre", en: "Outdoors" },
    slugs: { ca: "aire-lliure", es: "aire-libre", en: "outdoors" },
  },
  {
    key: "language",
    section: "guides",
    sortOrder: 60,
    names: { ca: "Llengua", es: "Lengua", en: "Language" },
    slugs: { ca: "llengua", es: "lengua", en: "language" },
  },

  // Events
  {
    key: "festivals",
    section: "events",
    sortOrder: 10,
    names: { ca: "Festes i tradicions", es: "Fiestas y tradiciones", en: "Festivals and traditions" },
    slugs: { ca: "festes-i-tradicions", es: "fiestas-y-tradiciones", en: "festivals-and-traditions" },
  },
  {
    key: "calendar",
    section: "events",
    sortOrder: 20,
    names: { ca: "Calendari oficial", es: "Calendario oficial", en: "Official calendar" },
    slugs: { ca: "calendari-oficial", es: "calendario-oficial", en: "official-calendar" },
  },
];

interface TagSeed {
  key: string;
  names: { ca: string; es: string; en: string };
  slugs: { ca: string; es: string; en: string };
}

/**
 * A deliberately small, closed vocabulary. Editors pick from it rather than
 * inventing tags, which is what stops a tag archive turning into hundreds of
 * near-empty, near-duplicate pages.
 */
const TAGS: TagSeed[] = [
  {
    key: "accessible",
    names: { ca: "Accessible", es: "Accesible", en: "Accessible" },
    slugs: { ca: "accessible", es: "accesible", en: "accessible" },
  },
  {
    key: "free",
    names: { ca: "Gratuït", es: "Gratuito", en: "Free" },
    slugs: { ca: "gratuit", es: "gratuito", en: "free" },
  },
  {
    key: "family",
    names: { ca: "Amb criatures", es: "Con niños", en: "With children" },
    slugs: { ca: "amb-criatures", es: "con-ninos", en: "with-children" },
  },
  {
    key: "public-transport",
    names: { ca: "Sense cotxe", es: "Sin coche", en: "Without a car" },
    slugs: { ca: "sense-cotxe", es: "sin-coche", en: "without-a-car" },
  },
  {
    key: "winter",
    names: { ca: "Hivern", es: "Invierno", en: "Winter" },
    slugs: { ca: "hivern", es: "invierno", en: "winter" },
  },
  {
    key: "summer",
    names: { ca: "Estiu", es: "Verano", en: "Summer" },
    slugs: { ca: "estiu", es: "verano", en: "summer" },
  },
  {
    key: "unesco",
    names: { ca: "Patrimoni UNESCO", es: "Patrimonio UNESCO", en: "UNESCO heritage" },
    slugs: { ca: "patrimoni-unesco", es: "patrimonio-unesco", en: "unesco-heritage" },
  },
];


export interface SeedSummary {
  categories: number;
  tags: number;
}

export async function seedTaxonomy(): Promise<SeedSummary> {
  const db = requireDb();

  for (const category of CATEGORIES) {
    const inserted = await db
      .insert(schema.categories)
      .values({
        key: category.key,
        section: category.section,
        sortOrder: category.sortOrder,
      })
      .onConflictDoUpdate({
        target: schema.categories.key,
        set: { section: category.section, sortOrder: category.sortOrder },
      })
      .returning({ id: schema.categories.id });

    const id = inserted[0]?.id;
    if (!id) continue;

    for (const locale of ["ca", "es", "en"] as const) {
      await db
        .insert(schema.categoryTranslations)
        .values({
          categoryId: id,
          locale,
          name: category.names[locale],
          slug: category.slugs[locale],
        })
        .onConflictDoUpdate({
          target: [
            schema.categoryTranslations.categoryId,
            schema.categoryTranslations.locale,
          ],
          set: { name: category.names[locale], slug: category.slugs[locale] },
        });
    }
  }

  for (const tag of TAGS) {
    const inserted = await db
      .insert(schema.tags)
      .values({ key: tag.key })
      .onConflictDoUpdate({ target: schema.tags.key, set: { isActive: true } })
      .returning({ id: schema.tags.id });

    const id = inserted[0]?.id;
    if (!id) continue;

    for (const locale of ["ca", "es", "en"] as const) {
      await db
        .insert(schema.tagTranslations)
        .values({ tagId: id, locale, name: tag.names[locale], slug: tag.slugs[locale] })
        .onConflictDoUpdate({
          target: [schema.tagTranslations.tagId, schema.tagTranslations.locale],
          set: { name: tag.names[locale], slug: tag.slugs[locale] },
        });
    }
  }

  return { categories: CATEGORIES.length, tags: TAGS.length };
}
