import type { Locale } from "@/lib/i18n/config";
import { IMAGE_BY_KEY } from "@/lib/content/images";
import { DISCOVER_MIN_WIDTH, discoverCrops, isOpenLicence, licenceUrl, type DiscoverCrop } from "@/lib/seo/discover-images";
import { absoluteUrl } from "@/lib/site";

/**
 * Photographs of the place a programmatic page is about (18-19 Nov 2026,
 * docs/SEO_EXPERIMENTS.md, "Licensed place photos").
 *
 * Why: Google Discover shows a large image only for a picture at least 1,200
 * px wide that is not generic ("Avoid using generic images (for example, your
 * site logo)"), and the town, fair, hub and reservoir pages shared the
 * site-wide brand card: 0 Discover impressions in 28 days. Each entry here is
 * one Wikimedia Commons photograph of the subject itself (the town hall, the
 * square, the fair, the reservoir), downloaded with `npm run images:commons --
 * pick` and imported with `npm run images:import`, so the author, licence and
 * file page come from the Commons sidecar in the manifest (images.ts), never
 * retyped here.
 *
 * Rules:
 *  - Only open licences that allow commercial reuse (CC0, CC BY, CC BY-SA,
 *    public domain; never NC or ND): `isOpenLicence`, held by a test.
 *  - The photograph shows the subject: a town page gets that town, never a
 *    neighbour or a generic Catalan scene. A town with no suitable file has no
 *    entry and keeps the site card.
 *  - Alt text says what is in the picture; the caption says what and where;
 *    the credit line (author linked to the file page, licence linked to the
 *    deed) is printed from the manifest by components/PlacePhoto.tsx.
 *  - No people as the subject: town halls, squares, streets, landscapes; the
 *    fair photograph is a stall of fir trees.
 *  - The share image (og:image, twitter:image, the ImageObject) is the 16:9
 *    crop from /img/16x9/<key>.jpg, at least 1,200 px wide (discover-images.ts).
 */

export interface PlacePhotoEntry {
  /** Manifest key (src/lib/content/images.ts). */
  key: string;
  /** What is in the photograph. */
  alt: Record<Locale, string>;
  /** The visible caption: what and where; the credit is appended from the manifest. */
  caption: Record<Locale, string>;
}

/**
 * One photograph of each town, shown on its holiday, election and Christmas
 * fair pages. Keyed by the slug the three families share
 * (lib/engagement/town-hub.ts). Ordered by the 28-day impressions of the
 * town's pages that had no photograph (GSC, 22 Oct-18 Nov 2026).
 */
export const TOWN_PHOTOS: Readonly<Record<string, PlacePhotoEntry>> = {
  barcelona: {
    key: "municipals-ajuntament-barcelona-nit",
    alt: {
      ca: "Façana neoclàssica de l'Ajuntament de Barcelona il·luminada de nit, a la plaça de Sant Jaume",
      es: "Fachada neoclásica del Ayuntamiento de Barcelona iluminada de noche, en la plaza de Sant Jaume",
      en: "The neoclassical façade of Barcelona City Hall lit up at night on Plaça de Sant Jaume",
    },
    caption: {
      ca: "L'Ajuntament de Barcelona, a la plaça de Sant Jaume.",
      es: "El Ayuntamiento de Barcelona, en la plaza de Sant Jaume.",
      en: "Barcelona City Hall on Plaça de Sant Jaume.",
    },
  },
  lleida: {
    key: "municipi-lleida-seu-vella-ciutat",
    alt: {
      ca: "La Seu Vella de Lleida dalt del turó, per sobre de les teulades de la ciutat",
      es: "La Seu Vella de Lleida en lo alto de la colina, sobre los tejados de la ciudad",
      en: "Lleida's Seu Vella cathedral on its hill above the city's rooftops",
    },
    caption: {
      ca: "La Seu Vella de Lleida, vista des del castell dels Templers.",
      es: "La Seu Vella de Lleida, vista desde el castillo de los Templarios.",
      en: "Lleida's Seu Vella, seen from the Templar castle.",
    },
  },
  tarragona: {
    key: "municipi-tarragona-placa-font-ajuntament",
    alt: {
      ca: "La plaça de la Font de Tarragona, amb terrasses i arbres als costats i l'edifici de l'Ajuntament al fons",
      es: "La plaza de la Font de Tarragona, con terrazas y árboles a los lados y el edificio del Ayuntamiento al fondo",
      en: "Plaça de la Font in Tarragona, lined with café terraces and trees, with the City Hall at the far end",
    },
    caption: {
      ca: "La plaça de la Font i l'Ajuntament de Tarragona.",
      es: "La plaza de la Font y el Ayuntamiento de Tarragona.",
      en: "Plaça de la Font and Tarragona City Hall.",
    },
  },
  terrassa: {
    key: "rainy-second",
    alt: {
      ca: "Façana de maó del Vapor Aymerich, Amat i Jover de Terrassa, amb finestrals i la xemeneia, sota el cel blau",
      es: "Fachada de ladrillo del Vapor Aymerich, Amat i Jover de Terrassa, con ventanales y la chimenea, bajo el cielo azul",
      en: "The brick façade and chimney of the Vapor Aymerich, Amat i Jover mill in Terrassa under a blue sky",
    },
    caption: {
      ca: "El Vapor Aymerich, Amat i Jover, seu del mNACTEC, a Terrassa.",
      es: "El Vapor Aymerich, Amat i Jover, sede del mNACTEC, en Terrassa.",
      en: "The Vapor Aymerich, Amat i Jover mill, home of the mNACTEC museum, Terrassa.",
    },
  },
  badalona: {
    key: "municipi-badalona-pont-del-petroli",
    alt: {
      ca: "El Pont del Petroli de Badalona, una passarel·la sobre pilars que entra al mar des de la platja",
      es: "El Pont del Petroli de Badalona, una pasarela sobre pilares que se adentra en el mar desde la playa",
      en: "Badalona's Pont del Petroli, a pier on pillars running out to sea from the beach",
    },
    caption: {
      ca: "El Pont del Petroli i la seva platja, a Badalona.",
      es: "El Pont del Petroli y su playa, en Badalona.",
      en: "The Pont del Petroli and its beach, Badalona.",
    },
  },
  girona: {
    key: "b2-girona-cases-onyar",
    alt: {
      ca: "Les cases de colors de Girona arrenglerades a la vora del riu Onyar",
      es: "Las casas de colores de Girona alineadas a orillas del río Onyar",
      en: "Girona's colourful houses lined up along the River Onyar",
    },
    caption: {
      ca: "Les cases de l'Onyar, a Girona.",
      es: "Las casas del Onyar, en Girona.",
      en: "The houses on the Onyar, Girona.",
    },
  },
  "sant-boi-de-llobregat": {
    key: "municipi-sant-boi-casa-de-la-vila",
    alt: {
      ca: "La Casa de la Vila de Sant Boi de Llobregat, amb el rellotge a dalt de la façana",
      es: "La Casa de la Vila (Ayuntamiento) de Sant Boi de Llobregat, con el reloj en lo alto de la fachada",
      en: "Sant Boi de Llobregat's Casa de la Vila (town hall), with the clock at the top of its façade",
    },
    caption: {
      ca: "La Casa de la Vila de Sant Boi de Llobregat.",
      es: "La Casa de la Vila (Ayuntamiento) de Sant Boi de Llobregat.",
      en: "Casa de la Vila (town hall), Sant Boi de Llobregat.",
    },
  },
  mataro: {
    key: "municipi-mataro-ajuntament-la-riera",
    alt: {
      ca: "La façana de l'Ajuntament de Mataró, amb balcons, a la Riera, en un dia assolellat",
      es: "La fachada del Ayuntamiento de Mataró, con balcones, en la Riera, en un día soleado",
      en: "The façade of Mataró City Hall, with its balconies, on La Riera on a sunny day",
    },
    caption: {
      ca: "L'Ajuntament de Mataró, a la Riera.",
      es: "El Ayuntamiento de Mataró, en la Riera.",
      en: "Mataró City Hall on La Riera.",
    },
  },
  reus: {
    key: "municipi-reus-placa-mercadal",
    alt: {
      ca: "Façanes de colors de la plaça del Mercadal de Reus, amb terrasses de cafè als baixos",
      es: "Fachadas de colores de la plaza del Mercadal de Reus, con terrazas de café en los bajos",
      en: "Colourful façades on Reus's Plaça del Mercadal, with café terraces at street level",
    },
    caption: {
      ca: "La plaça del Mercadal de Reus.",
      es: "La plaza del Mercadal de Reus.",
      en: "Plaça del Mercadal, Reus.",
    },
  },
  vic: {
    key: "municipi-vic-placa-major",
    alt: {
      ca: "La plaça Major de Vic, gran i gairebé buida, envoltada d'edificis amb porxos",
      es: "La plaza Mayor de Vic, amplia y casi vacía, rodeada de edificios con soportales",
      en: "Vic's wide, almost empty Plaça Major, lined with arcaded buildings",
    },
    caption: {
      ca: "La plaça Major de Vic.",
      es: "La plaza Mayor de Vic.",
      en: "Plaça Major, Vic.",
    },
  },
  "el-prat-de-llobregat": {
    key: "municipi-el-prat-placa-vila-ajuntament",
    alt: {
      ca: "L'edifici de l'Ajuntament del Prat de Llobregat, amb pinacles i banderes, a la plaça de la Vila",
      es: "El edificio del Ayuntamiento de El Prat de Llobregat, con pináculos y banderas, en la plaza de la Vila",
      en: "El Prat de Llobregat City Hall, with its pinnacles and flags, on Plaça de la Vila",
    },
    caption: {
      ca: "L'Ajuntament del Prat de Llobregat, a la plaça de la Vila.",
      es: "El Ayuntamiento de El Prat de Llobregat, en la plaza de la Vila.",
      en: "El Prat de Llobregat City Hall, Plaça de la Vila.",
    },
  },
  manresa: {
    key: "municipi-manresa-pont-vell-seu",
    alt: {
      ca: "El Pont Vell de Manresa, de pedra i amb arcs, sobre el riu Cardener, amb la Seu dalt del turó",
      es: "El Pont Vell de Manresa, de piedra y con arcos, sobre el río Cardener, con la Seu en lo alto",
      en: "Manresa's arched stone Pont Vell over the River Cardener, with La Seu on the hill above",
    },
    caption: {
      ca: "El Pont Vell i la Seu de Manresa.",
      es: "El Pont Vell y la Seu de Manresa.",
      en: "The Pont Vell and La Seu, Manresa.",
    },
  },
  rubi: {
    key: "municipi-rubi-casa-de-la-vila",
    alt: {
      ca: "La façana rosada de la Casa de la Vila de Rubí, amb el rellotge i les banderes a dalt",
      es: "La fachada rosada de la Casa de la Vila (Ayuntamiento) de Rubí, con el reloj y las banderas en lo alto",
      en: "The pink façade of Rubí's Casa de la Vila (town hall), with its clock and flags on top",
    },
    caption: {
      ca: "La Casa de la Vila de Rubí.",
      es: "La Casa de la Vila (Ayuntamiento) de Rubí.",
      en: "Casa de la Vila (town hall), Rubí.",
    },
  },
  "vilanova-i-la-geltru": {
    key: "municipi-vilanova-placa-de-la-vila",
    alt: {
      ca: "La plaça de la Vila de Vilanova i la Geltrú, amb palmeres, fanals i edificis porticats",
      es: "La plaza de la Vila de Vilanova i la Geltrú, con palmeras, farolas y edificios porticados",
      en: "Plaça de la Vila in Vilanova i la Geltrú, with palm trees, street lamps and arcaded buildings",
    },
    caption: {
      ca: "La plaça de la Vila, a Vilanova i la Geltrú.",
      es: "La plaza de la Vila, en Vilanova i la Geltrú.",
      en: "Plaça de la Vila, Vilanova i la Geltrú.",
    },
  },
  "vilassar-de-mar": {
    key: "municipi-vilassar-de-mar-vista",
    alt: {
      ca: "Vilassar de Mar vist des de la muntanya, amb camps i hivernacles en primer terme i el mar al fons",
      es: "Vilassar de Mar visto desde la montaña, con campos e invernaderos en primer término y el mar al fondo",
      en: "Vilassar de Mar seen from the hills, with fields and greenhouses in the foreground and the sea beyond",
    },
    caption: {
      ca: "Vilassar de Mar, des de Montcabrer.",
      es: "Vilassar de Mar, desde Montcabrer.",
      en: "Vilassar de Mar from Montcabrer.",
    },
  },
  "l-hospitalet-de-llobregat": {
    key: "municipi-hospitalet-casa-de-la-vila",
    alt: {
      ca: "La façana de la Casa de la Vila de l'Hospitalet de Llobregat, amb les banderes a dalt",
      es: "La fachada de la Casa de la Vila (Ayuntamiento) de L'Hospitalet de Llobregat, con las banderas en lo alto",
      en: "The façade of L'Hospitalet de Llobregat's Casa de la Vila (town hall), with flags on top",
    },
    caption: {
      ca: "La Casa de la Vila de l'Hospitalet de Llobregat.",
      es: "La Casa de la Vila (Ayuntamiento) de L'Hospitalet de Llobregat.",
      en: "Casa de la Vila (town hall), L'Hospitalet de Llobregat.",
    },
  },
  matadepera: {
    key: "municipi-matadepera-cavall-bernat",
    alt: {
      ca: "Les roques del Cavall Bernat sobre el bosc de Sant Llorenç del Munt, a Matadepera",
      es: "Las rocas del Cavall Bernat sobre el bosque de Sant Llorenç del Munt, en Matadepera",
      en: "The Cavall Bernat rocks rising above the woods of Sant Llorenç del Munt, Matadepera",
    },
    caption: {
      ca: "El Cavall Bernat, a Sant Llorenç del Munt (Matadepera).",
      es: "El Cavall Bernat, en Sant Llorenç del Munt (Matadepera).",
      en: "Cavall Bernat in Sant Llorenç del Munt, Matadepera.",
    },
  },
  "sant-celoni": {
    key: "municipi-sant-celoni-placa-ajuntament",
    alt: {
      ca: "Una plaça de Sant Celoni amb l'edifici de l'Ajuntament al fons, fanals i taules de terrassa",
      es: "Una plaza de Sant Celoni con el edificio del Ayuntamiento al fondo, farolas y mesas de terraza",
      en: "A square in Sant Celoni with the town hall at the far end, street lamps and café tables",
    },
    caption: {
      ca: "L'Ajuntament de Sant Celoni.",
      es: "El Ayuntamiento de Sant Celoni.",
      en: "Sant Celoni town hall.",
    },
  },
  figueres: {
    key: "figueres-teatre-museu-dali-facana",
    alt: {
      ca: "La façana del Teatre-Museu Dalí de Figueres, amb escultures al capdamunt",
      es: "La fachada del Teatro-Museo Dalí de Figueres, con esculturas en lo alto",
      en: "The façade of the Dalí Theatre-Museum in Figueres, topped with sculptures",
    },
    caption: {
      ca: "El Teatre-Museu Dalí, a Figueres.",
      es: "El Teatro-Museo Dalí, en Figueres.",
      en: "The Dalí Theatre-Museum, Figueres.",
    },
  },
  "santa-coloma-de-gramenet": {
    key: "municipi-santa-coloma-ajuntament",
    alt: {
      ca: "L'Ajuntament de Santa Coloma de Gramenet, amb la torre del rellotge coronada per una estructura de ferro",
      es: "El Ayuntamiento de Santa Coloma de Gramenet, con la torre del reloj coronada por una estructura de hierro",
      en: "Santa Coloma de Gramenet City Hall, its clock tower topped by a wrought-iron frame",
    },
    caption: {
      ca: "L'Ajuntament de Santa Coloma de Gramenet.",
      es: "El Ayuntamiento de Santa Coloma de Gramenet.",
      en: "Santa Coloma de Gramenet City Hall.",
    },
  },
  salou: {
    key: "municipi-salou-passeig-jaume-i",
    alt: {
      ca: "El passeig Jaume I de Salou, amb palmeres i jardineres, i el monument a Jaume I al fons",
      es: "El paseo Jaume I de Salou, con palmeras y jardineras, y el monumento a Jaume I al fondo",
      en: "Salou's Passeig Jaume I promenade with palm trees and planters, and the Jaume I monument in the distance",
    },
    caption: {
      ca: "El passeig Jaume I, a Salou.",
      es: "El paseo Jaume I, en Salou.",
      en: "Passeig Jaume I, Salou.",
    },
  },
  "lloret-de-mar": {
    key: "municipi-lloret-de-mar-platja",
    alt: {
      ca: "La platja de Lloret de Mar, amb roques en primer terme, els edificis del passeig i les muntanyes al fons",
      es: "La playa de Lloret de Mar, con rocas en primer término, los edificios del paseo y las montañas al fondo",
      en: "Lloret de Mar beach, with rocks in the foreground, the seafront buildings and the hills behind",
    },
    caption: {
      ca: "La platja de Lloret de Mar.",
      es: "La playa de Lloret de Mar.",
      en: "Lloret de Mar beach.",
    },
  },
  viladecans: {
    key: "municipi-viladecans-can-modolell",
    alt: {
      ca: "Can Modolell, l'edifici de l'Ajuntament de Viladecans, amb la torreta i la façana de color teula",
      es: "Can Modolell, el edificio del Ayuntamiento de Viladecans, con su torreta y la fachada de color teja",
      en: "Can Modolell, the Viladecans City Hall building, with its turret and terracotta-coloured façade",
    },
    caption: {
      ca: "Can Modolell, seu de l'Ajuntament de Viladecans.",
      es: "Can Modolell, sede del Ayuntamiento de Viladecans.",
      en: "Can Modolell, Viladecans City Hall.",
    },
  },
  castelldefels: {
    key: "municipi-castelldefels-passeig-maritim",
    alt: {
      ca: "El passeig marítim de Castelldefels al capvespre, amb palmeres sota un cel vermellós",
      es: "El paseo marítimo de Castelldefels al atardecer, con palmeras bajo un cielo rojizo",
      en: "Castelldefels seafront promenade at sunset, with palm trees under a red sky",
    },
    caption: {
      ca: "El passeig Marítim de Castelldefels.",
      es: "El paseo Marítimo de Castelldefels.",
      en: "Castelldefels seafront promenade.",
    },
  },
  canyelles: {
    key: "municipi-canyelles-castell",
    alt: {
      ca: "El castell de Canyelles i el campanar de l'església, dalt d'un mur de pedra entre vegetació",
      es: "El castillo de Canyelles y el campanario de la iglesia, sobre un muro de piedra entre vegetación",
      en: "Canyelles castle and the church bell tower above a stone wall and greenery",
    },
    caption: {
      ca: "El castell de Canyelles.",
      es: "El castillo de Canyelles.",
      en: "Canyelles castle.",
    },
  },
};

/**
 * A photograph of the fair itself, for the fair page: it wins over the town's
 * photograph there and is the Event markup's `image`. Only where Commons has
 * a file of the fair at 1,600 px or more (Espinelves: the 2016 edition; the
 * fair's own category holds one 1,280 px file).
 */
export const FAIR_PHOTOS: Readonly<Record<string, PlacePhotoEntry>> = {
  espinelves: {
    key: "fira-avet-espinelves-avets",
    alt: {
      ca: "Avets en test a la venda en una parada de la Fira de l'Avet d'Espinelves",
      es: "Abetos en maceta a la venta en un puesto de la Fira de l'Avet (Feria del Abeto) de Espinelves",
      en: "Potted fir trees for sale at a stall at the Espinelves Fir Tree Fair (Fira de l'Avet)",
    },
    caption: {
      ca: "Fira de l'Avet d'Espinelves, desembre del 2016.",
      es: "Feria del Abeto de Espinelves, diciembre de 2016.",
      en: "Espinelves Fir Tree Fair, December 2016.",
    },
  },
};

/** The family hubs: a picture of what the family is about, in Catalonia. */
export const HUB_PHOTOS = {
  /** /ca/festius/, /es/festivos/, /en/holidays/: local holidays are mostly the festa major. */
  holidays: {
    key: "festius-locals-gegants-festa-major",
    alt: {
      ca: "Gegants enmig de la gent en una plaça durant la Festa Major de les Borges Blanques",
      es: "Gigantes entre la gente en una plaza durante la Fiesta Mayor de Les Borges Blanques",
      en: "Gegants (giant figures) among the crowd in a square during the Festa Major of Les Borges Blanques",
    },
    caption: {
      ca: "Gegants a la Festa Major de les Borges Blanques (2007).",
      es: "Gigantes en la Fiesta Mayor de Les Borges Blanques (2007).",
      en: "Gegants at the Festa Major of Les Borges Blanques (2007).",
    },
  },
  /** /ca/fires-de-nadal/, /es/mercados-navidad/, /en/christmas-markets/. */
  fairs: {
    key: "mercats-nadal-santa-llucia-nit",
    alt: {
      ca: "Parades de la Fira de Santa Llúcia sota garlandes de llums, de nit, a l'avinguda de la Catedral de Barcelona",
      es: "Puestos de la Fira de Santa Llúcia bajo guirnaldas de luces, de noche, en la avenida de la Catedral de Barcelona",
      en: "Fira de Santa Llúcia Christmas market stalls under strings of lights at night on Avinguda de la Catedral, Barcelona",
    },
    caption: {
      ca: "Fira de Santa Llúcia, avinguda de la Catedral (Barcelona), Nadal del 2024.",
      es: "Fira de Santa Llúcia, avenida de la Catedral (Barcelona), Navidad de 2024.",
      en: "Fira de Santa Llúcia, Avinguda de la Catedral, Barcelona, Christmas 2024.",
    },
  },
  /** /ca/embassaments/, /es/embalses/, /en/reservoirs/. */
  reservoirs: {
    key: "embassaments-presa-sau-tavertet",
    alt: {
      ca: "La presa i l'embassament de Sau vistos des de dalt, des de Tavertet, entre muntanyes boscoses",
      es: "La presa y el embalse de Sau vistos desde arriba, desde Tavertet, entre montañas boscosas",
      en: "Sau dam and reservoir seen from above at Tavertet, between wooded hills",
    },
    caption: {
      ca: "La presa del pantà de Sau, des de Tavertet.",
      es: "La presa del pantano de Sau, desde Tavertet.",
      en: "Sau dam, seen from Tavertet.",
    },
  },
} as const satisfies Record<string, PlacePhotoEntry>;

export type HubPhotoKind = keyof typeof HUB_PHOTOS;

/** One reservoir page each, keyed by the reservoir slug (lib/programmatic/reservoirs/types.ts). */
export const RESERVOIR_PHOTOS: Readonly<Record<string, PlacePhotoEntry>> = {
  sau: {
    key: "embassaments-sau-cingles-tavertet",
    alt: {
      ca: "L'embassament de Sau, amb cingleres al fons i boscos a les vores",
      es: "El embalse de Sau, con riscos al fondo y bosques en las orillas",
      en: "Sau reservoir, with cliffs behind and wooded shores",
    },
    caption: {
      ca: "L'embassament de Sau, a prop de Tavertet.",
      es: "El embalse de Sau, cerca de Tavertet.",
      en: "Sau reservoir, near Tavertet.",
    },
  },
};

/** A registry entry resolved against the manifest, in one language. */
export interface PlacePhoto {
  key: string;
  /** The photograph as stored (`/images/<key>.webp`, at most 1,920 px wide). */
  src: string;
  width: number;
  height: number;
  blurDataUrl: string;
  alt: string;
  caption: string;
  credit: string;
  /** The file's Commons page (source and licence statement). */
  creditUrl: string;
  /** "CC BY-SA 4.0", "CC0"… */
  licence: string;
  /** The licence deed, when the licence has one. */
  licenceUrl: string | null;
  /** og:image / twitter:image / ImageObject: the 16:9 crop, at least 1,200 px wide. */
  share: DiscoverCrop;
  /** Every crop at least 1,200 px wide (16:9, 4:3, 1:1), for Event markup. */
  crops: DiscoverCrop[];
}

/**
 * The entry resolved in one language, or null when the manifest lacks the
 * file, its licence is not open, its attribution is incomplete or it gives no
 * 16:9 crop of 1,200 px (a test holds every entry above to resolve).
 */
export function resolvePlacePhoto(entry: PlacePhotoEntry | undefined, locale: Locale): PlacePhoto | null {
  if (!entry) return null;
  const image = IMAGE_BY_KEY.get(entry.key);
  if (!image || !isOpenLicence(image.license) || !image.credit || !image.creditUrl || !image.license) return null;
  const crops = discoverCrops(image);
  const share = crops.find((c) => c.ratio === "16x9");
  if (!share || share.width < DISCOVER_MIN_WIDTH) return null;
  return {
    key: image.key,
    src: image.url,
    width: image.width,
    height: image.height,
    blurDataUrl: image.blurDataUrl,
    alt: entry.alt[locale],
    caption: entry.caption[locale],
    credit: image.credit,
    creditUrl: image.creditUrl,
    licence: image.license,
    licenceUrl: licenceUrl(image.license),
    share,
    crops,
  };
}

/** The town's photograph (holiday and election pages). */
export function townPhoto(slug: string, locale: Locale): PlacePhoto | null {
  return resolvePlacePhoto(TOWN_PHOTOS[slug], locale);
}

/** The fair page's photograph: the fair's own, else the town's. */
export function fairPagePhoto(slug: string, locale: Locale): PlacePhoto | null {
  return resolvePlacePhoto(FAIR_PHOTOS[slug] ?? TOWN_PHOTOS[slug], locale);
}

/** Only a photograph of the fair itself goes into its Event markup. */
export function fairEventImages(slug: string): string[] | undefined {
  const photo = resolvePlacePhoto(FAIR_PHOTOS[slug], "ca");
  return photo ? photo.crops.map((c) => absoluteUrl(c.url)) : undefined;
}

export function hubPhoto(kind: HubPhotoKind, locale: Locale): PlacePhoto | null {
  return resolvePlacePhoto(HUB_PHOTOS[kind], locale);
}

export function reservoirPhoto(slug: string, locale: Locale): PlacePhoto | null {
  return resolvePlacePhoto(RESERVOIR_PHOTOS[slug], locale);
}

/** `buildMetadata`'s `image` (og:image, twitter:image): the 16:9 crop. */
export function photoMetaImage(photo: PlacePhoto | null): { url: string; width: number; height: number; alt: string } | null {
  return photo ? { url: photo.share.url, width: photo.share.width, height: photo.share.height, alt: photo.alt } : null;
}

/**
 * The photograph as an ImageObject with Google's image licence metadata
 * (creator, creditText, license, acquireLicensePage). These pages carry no
 * Article markup, so the node stands on its own in the page's graph; the
 * Article pages keep `articleImage` (lib/seo/jsonld.ts).
 */
export function photoImageObject(photo: PlacePhoto | null, path: string): Record<string, unknown> | null {
  if (!photo) return null;
  return {
    "@type": "ImageObject",
    "@id": `${absoluteUrl(path)}#photo`,
    contentUrl: absoluteUrl(photo.share.url),
    url: absoluteUrl(photo.share.url),
    width: photo.share.width,
    height: photo.share.height,
    caption: photo.caption,
    description: photo.alt,
    creditText: photo.credit,
    creator: { "@type": "Person", name: photo.credit },
    copyrightNotice: photo.licence ? `${photo.credit}, ${photo.licence}` : photo.credit,
    ...(photo.licenceUrl ? { license: photo.licenceUrl } : {}),
    acquireLicensePage: photo.creditUrl,
    representativeOfPage: true,
  };
}
