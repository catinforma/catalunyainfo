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
export const READ_AT = "2026-10-30";

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
    "mm": 101.8,
    "stations": 5,
    "daysSinceRain": 10,
    "level": "favourable",
    "wettest": {
      "name": "Ulldeter (2.413 m)",
      "mm": 137.4
    }
  },
  {
    "id": "bergueda",
    "mm": 88.9,
    "stations": 5,
    "daysSinceRain": 11,
    "level": "interesting",
    "wettest": {
      "name": "Gisclareny",
      "mm": 130.8
    }
  },
  {
    "id": "garrotxa",
    "mm": 84.4,
    "stations": 2,
    "daysSinceRain": 10,
    "level": "favourable",
    "wettest": {
      "name": "la Vall d'en Bas",
      "mm": 84.7
    }
  },
  {
    "id": "osona",
    "mm": 59.2,
    "stations": 7,
    "daysSinceRain": 7,
    "level": "favourable",
    "wettest": {
      "name": "Montesquiu",
      "mm": 105.7
    }
  },
  {
    "id": "pirineu",
    "mm": 55.9,
    "stations": 24,
    "daysSinceRain": 5,
    "level": "favourable",
    "wettest": {
      "name": "Cadí Nord (2.145 m) - Prat d'Aguiló",
      "mm": 114.7
    }
  },
  {
    "id": "montseny",
    "mm": 42.4,
    "stations": 9,
    "daysSinceRain": 7,
    "level": "favourable",
    "wettest": {
      "name": "Caldes de Montbui",
      "mm": 87.9
    }
  },
  {
    "id": "ports",
    "mm": 55.5,
    "stations": 19,
    "daysSinceRain": 0,
    "level": "favourable",
    "wettest": {
      "name": "Tivissa",
      "mm": 95.4
    }
  },
  {
    "id": "ponent",
    "mm": 53.8,
    "stations": 31,
    "daysSinceRain": 11,
    "level": "interesting",
    "wettest": {
      "name": "els Alamús",
      "mm": 73.8
    }
  }
];
