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
export const READ_AT = "2026-11-10";

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
    "mm": 2.6,
    "stations": 5,
    "daysSinceRain": 1,
    "level": "low",
    "wettest": {
      "name": "Núria (1.971 m)",
      "mm": 5.1
    }
  },
  {
    "id": "bergueda",
    "mm": 12.9,
    "stations": 5,
    "daysSinceRain": 1,
    "level": "patchy",
    "wettest": {
      "name": "Santuari de Queralt",
      "mm": 21.6
    }
  },
  {
    "id": "garrotxa",
    "mm": 1.2,
    "stations": 2,
    "daysSinceRain": 7,
    "level": "low",
    "wettest": {
      "name": "la Vall d'en Bas",
      "mm": 1.2
    }
  },
  {
    "id": "osona",
    "mm": 2.3,
    "stations": 7,
    "daysSinceRain": 1,
    "level": "low",
    "wettest": {
      "name": "Viladrau",
      "mm": 5.9
    }
  },
  {
    "id": "pirineu",
    "mm": 8.5,
    "stations": 24,
    "daysSinceRain": 1,
    "level": "patchy",
    "wettest": {
      "name": "Boí (2.537 m)",
      "mm": 20.7
    }
  },
  {
    "id": "montseny",
    "mm": 5.2,
    "stations": 9,
    "daysSinceRain": 1,
    "level": "low",
    "wettest": {
      "name": "Tagamanent - PN del Montseny",
      "mm": 10.2
    }
  },
  {
    "id": "ports",
    "mm": 20.2,
    "stations": 19,
    "daysSinceRain": 2,
    "level": "interesting",
    "wettest": {
      "name": "Illa de Buda",
      "mm": 57.7
    }
  },
  {
    "id": "ponent",
    "mm": 15.8,
    "stations": 31,
    "daysSinceRain": 1,
    "level": "patchy",
    "wettest": {
      "name": "el Canós",
      "mm": 27.5
    }
  }
];
