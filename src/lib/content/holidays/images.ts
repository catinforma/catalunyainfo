import type { Locale } from "@/lib/i18n/config";

/**
 * The holiday guide's two photographs, with their alt text and captions.
 *
 * Media rows are keyed by file, so a page that reuses one of these must send
 * the same alt and caption or it rewrites them for the guide too. They live
 * here, out of the guide's publisher, so the 2027 bridges page can import
 * them without pulling in the database layer.
 */

export interface HolidayImage {
  key: string;
  alt: Record<Locale, string>;
  caption: Record<Locale, string>;
}

export const DIADA_IMAGE: HolidayImage = {
  key: "calendari-laboral-catalunya-diada",
  alt: {
    ca: "Ofrena floral durant la Diada Nacional de Catalunya, amb rams de colors al peu del monument",
    es: "Ofrenda floral durante la Diada Nacional de Cataluña, con ramos de colores al pie del monumento",
    en: "Flowers laid at a monument during the Diada, Catalonia's national day",
  },
  caption: {
    ca: "L'11 de setembre, la Diada, és un dels dotze festius de tot Catalunya.",
    es: "El 11 de septiembre, la Diada, es uno de los doce festivos de toda Cataluña.",
    en: "11 September, the Diada, is one of the twelve holidays kept across Catalonia.",
  },
};

export const SANT_JOAN_IMAGE: HolidayImage = {
  key: "calendari-laboral-catalunya-sant-joan",
  alt: {
    ca: "Foguera i focs de la revetlla de Sant Joan en un carrer de Barcelona, de nit",
    es: "Hoguera y fuegos de la verbena de Sant Joan en una calle de Barcelona, de noche",
    en: "A Sant Joan bonfire and fireworks in a Barcelona street at night",
  },
  caption: {
    ca: "La revetlla es fa la nit del 23, però el festiu és el 24 de juny.",
    es: "La verbena es la noche del 23, pero el festivo es el 24 de junio.",
    en: "The party is the night of the 23rd; the public holiday is 24 June.",
  },
};
