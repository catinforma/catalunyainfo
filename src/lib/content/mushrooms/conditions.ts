// GENERATED FILE - do not edit by hand.
// Source: XEMA, via the Generalitat's open data portal.
// Regenerate with: npm run mushrooms:refresh
//
// Rainfall is measured. The condition band is derived from it by the rule in
// scripts/mushroom-conditions.ts, which the article states in full. Neither
// says anything about whether mushrooms are present: that depends on species,
// substrate and ground temperature, and a rainfall total cannot establish it.

export interface ZoneReading {
  readonly id: string;
  /** Mean accumulated rainfall across the zone's stations, in mm. */
  readonly mm: number;
  /** How many stations that mean covers. */
  readonly stations: number;
  /** Days since the wettest station last measured rain. */
  readonly daysSinceRain: number;
  readonly level: "very" | "favourable" | "interesting" | "patchy" | "low";
  readonly wettest: { readonly name: string; readonly mm: number } | null;
}

/** The window the figures cover, in days. */
export const WINDOW_DAYS = 15;

/** ISO date the data was read. This is what the page shows as last verified. */
export const READ_AT = "2026-10-07";

export const SOURCE = {
  name: "Dades meteorològiques de la XEMA",
  url: "https://analisi.transparenciacatalunya.cat/d/nzvn-apee",
  publisher: "Servei Meteorològic de Catalunya, Generalitat de Catalunya",
};

/** The thresholds, exported so the article can print them rather than restate them. */
export const LEVEL_RULE = [
  {
    "level": "very",
    "minMm": 60,
    "maxDaysSinceRain": 7
  },
  {
    "level": "favourable",
    "minMm": 35,
    "maxDaysSinceRain": 10
  },
  {
    "level": "interesting",
    "minMm": 20,
    "maxDaysSinceRain": 21
  },
  {
    "level": "patchy",
    "minMm": 8,
    "maxDaysSinceRain": 99
  },
  {
    "level": "low",
    "minMm": 0,
    "maxDaysSinceRain": 99
  }
] as const;

export const ZONE_READINGS: readonly ZoneReading[] = [
  {
    "id": "ripolles",
    "mm": 81,
    "stations": 5,
    "daysSinceRain": 0,
    "level": "very",
    "wettest": {
      "name": "Sant Joan de les Abadesses",
      "mm": 93.4
    }
  },
  {
    "id": "bergueda",
    "mm": 90.4,
    "stations": 5,
    "daysSinceRain": 0,
    "level": "very",
    "wettest": {
      "name": "la Quar",
      "mm": 108.6
    }
  },
  {
    "id": "garrotxa",
    "mm": 112.8,
    "stations": 2,
    "daysSinceRain": 1,
    "level": "very",
    "wettest": {
      "name": "la Vall d'en Bas",
      "mm": 134.4
    }
  },
  {
    "id": "osona",
    "mm": 98.6,
    "stations": 7,
    "daysSinceRain": 1,
    "level": "very",
    "wettest": {
      "name": "Viladrau",
      "mm": 216.2
    }
  },
  {
    "id": "pirineu",
    "mm": 47.5,
    "stations": 24,
    "daysSinceRain": 0,
    "level": "favourable",
    "wettest": {
      "name": "Alinyà",
      "mm": 104.9
    }
  },
  {
    "id": "montseny",
    "mm": 196.8,
    "stations": 9,
    "daysSinceRain": 1,
    "level": "very",
    "wettest": {
      "name": "Granollers",
      "mm": 379
    }
  },
  {
    "id": "ports",
    "mm": 149.3,
    "stations": 19,
    "daysSinceRain": 1,
    "level": "very",
    "wettest": {
      "name": "l'Ametlla de Mar",
      "mm": 339.9
    }
  },
  {
    "id": "ponent",
    "mm": 26.1,
    "stations": 31,
    "daysSinceRain": 1,
    "level": "interesting",
    "wettest": {
      "name": "Vilanova de Meià",
      "mm": 69.1
    }
  }
];
