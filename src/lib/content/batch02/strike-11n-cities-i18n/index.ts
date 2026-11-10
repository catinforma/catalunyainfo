import type { CityTr, StateServiceTr } from "../strike-11n-cities-model";
import type { Strike11nCityKey } from "../strike-11n-city-paths";
import * as alicante from "./alicante";
import * as bilbao from "./bilbao";
import * as coruna from "./coruna";
import * as lasPalmas from "./lasPalmas";
import * as madrid from "./madrid";
import * as malaga from "./malaga";
import * as murcia from "./murcia";
import * as palma from "./palma";
import * as sevilla from "./sevilla";
import * as state from "./state";
import * as valencia from "./valencia";
import * as valladolid from "./valladolid";
import * as vigo from "./vigo";
import * as zaragoza from "./zaragoza";

/**
 * The Catalan and English words of the 11N city pages (10 Nov 2026), one file
 * per city. The facts (status, sources) stay in strike-11n-cities-data.ts:
 * when a Spanish slot is filled or changed there, write the same sentence in
 * the city's file here, with the same links and figures (a test compares them).
 */
export type TrLocale = "ca" | "en";

export const CITY_TR: Partial<Record<Strike11nCityKey, Record<TrLocale, CityTr>>> = {
  madrid,
  valencia,
  sevilla,
  zaragoza,
  malaga,
  palma,
  lasPalmas,
  bilbao,
  murcia,
  alicante,
  valladolid,
  vigo,
  coruna,
};

export const STATE_TR: Record<TrLocale, Record<"rail" | "air", StateServiceTr>> = state;
