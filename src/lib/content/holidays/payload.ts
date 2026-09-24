import type { Locale } from "@/lib/i18n/config";

/**
 * The Catalan public holiday calendar, and the bridges it makes possible.
 *
 * Every date here is transcribed from Ordre EMT/52/2026 of 25 March, published
 * in DOGC 9637 on 1 April 2026, and verified on 24 September 2026. Nothing is
 * derived: a calendar that computes Easter for itself is one that will be
 * quietly wrong in some year nobody checks.
 *
 * Two things this file is careful about, because both are ways to mislead a
 * reader about their own employment:
 *
 *  1. **Bridges are editorial suggestions, not entitlements.** They assume a
 *     Monday-to-Friday week and no shift pattern. They are never mixed into
 *     the holiday list, and never into the downloadable calendar.
 *  2. **Local holidays are not Catalonia-wide holidays.** Barcelona's two are
 *     published and verifiable, so they appear as Barcelona's. No other
 *     municipality is guessed at.
 */

export const YEAR = 2027;

export type HolidayScope = "catalonia" | "local-barcelona" | "aran-replacement";

export interface Holiday {
  /** ISO date. The weekday is computed from this, never transcribed. */
  date: string;
  scope: HolidayScope;
  name: Record<Locale, string>;
}

/** The twelve holidays set for Catalonia, in the order the order lists them. */
export const CATALONIA_HOLIDAYS: Holiday[] = [
  { date: "2027-01-01", scope: "catalonia", name: { ca: "Cap d'Any", es: "Año Nuevo", en: "New Year's Day" } },
  { date: "2027-01-06", scope: "catalonia", name: { ca: "Reis", es: "Reyes", en: "Epiphany" } },
  { date: "2027-03-26", scope: "catalonia", name: { ca: "Divendres Sant", es: "Viernes Santo", en: "Good Friday" } },
  { date: "2027-03-29", scope: "catalonia", name: { ca: "Dilluns de Pasqua Florida", es: "Lunes de Pascua Florida", en: "Easter Monday" } },
  { date: "2027-05-01", scope: "catalonia", name: { ca: "Festa del Treball", es: "Fiesta del Trabajo", en: "Labour Day" } },
  { date: "2027-06-24", scope: "catalonia", name: { ca: "Sant Joan", es: "San Juan", en: "Sant Joan (St John's Day)" } },
  { date: "2027-09-11", scope: "catalonia", name: { ca: "Diada Nacional de Catalunya", es: "Diada Nacional de Cataluña", en: "National Day of Catalonia" } },
  { date: "2027-10-12", scope: "catalonia", name: { ca: "Festa Nacional d'Espanya", es: "Fiesta Nacional de España", en: "National Day of Spain" } },
  { date: "2027-11-01", scope: "catalonia", name: { ca: "Tots Sants", es: "Todos los Santos", en: "All Saints' Day" } },
  { date: "2027-12-06", scope: "catalonia", name: { ca: "Dia de la Constitució", es: "Día de la Constitución", en: "Constitution Day" } },
  { date: "2027-12-08", scope: "catalonia", name: { ca: "La Immaculada", es: "La Inmaculada", en: "Immaculate Conception" } },
  { date: "2027-12-25", scope: "catalonia", name: { ca: "Nadal", es: "Navidad", en: "Christmas Day" } },
];

/** Aran: 29 March is replaced by 17 June. Not an addition — a substitution. */
export const ARAN_REPLACEMENT: Holiday = {
  date: "2027-06-17",
  scope: "aran-replacement",
  name: { ca: "Festa d'Aran", es: "Festa d'Aran", en: "Festa d'Aran" },
};

/** Barcelona's two local holidays. Published by the city, so quotable. */
export const BARCELONA_LOCAL: Holiday[] = [
  { date: "2027-05-17", scope: "local-barcelona", name: { ca: "Dilluns de Pasqua Granada", es: "Lunes de Pascua Granada", en: "Whit Monday (Pasqua Granada)" } },
  { date: "2027-09-24", scope: "local-barcelona", name: { ca: "La Mercè", es: "La Mercè", en: "La Mercè" } },
];

/* -------------------------------------------------------------------------- */
/* Bridges                                                                    */
/* -------------------------------------------------------------------------- */

export interface Bridge {
  id: string;
  /** Days of leave the reader would have to book. ISO dates. */
  take: string[];
  /** First and last day of the resulting run, inclusive. */
  from: string;
  to: string;
  /** Length of the run in days. Asserted against the dates by a test. */
  days: number;
  label: Record<Locale, string>;
  detail: Record<Locale, string>;
}

/**
 * Bridges, ordered by how much they return per day of leave.
 *
 * `days` is stated rather than computed here so that a test can check the two
 * against each other — if a date is ever edited and the length is not, the
 * suite fails instead of the page printing a wrong number.
 */
export const BRIDGES: Bridge[] = [
  {
    id: "easter",
    take: [],
    from: "2027-03-26",
    to: "2027-03-29",
    days: 4,
    label: { ca: "Setmana Santa", es: "Semana Santa", en: "Easter" },
    detail: {
      ca: "Divendres Sant cau en divendres i el Dilluns de Pasqua en dilluns, de manera que els quatre dies s'encadenen sols.",
      es: "Viernes Santo cae en viernes y el Lunes de Pascua en lunes, así que los cuatro días se encadenan solos.",
      en: "Good Friday falls on a Friday and Easter Monday on a Monday, so the four days join up on their own.",
    },
  },
  {
    id: "december-short",
    take: ["2027-12-07"],
    from: "2027-12-04",
    to: "2027-12-08",
    days: 5,
    label: { ca: "Pont de desembre", es: "Puente de diciembre", en: "The December bridge" },
    detail: {
      ca: "El 6 de desembre cau en dilluns i el 8 en dimecres. Demanant només el dimarts 7 s'uneixen cinc dies.",
      es: "El 6 de diciembre cae en lunes y el 8 en miércoles. Pidiendo solo el martes 7 se unen cinco días.",
      en: "6 December falls on a Monday and 8 December on a Wednesday. Taking only Tuesday the 7th joins five days.",
    },
  },
  {
    id: "sant-joan",
    take: ["2027-06-25"],
    from: "2027-06-24",
    to: "2027-06-27",
    days: 4,
    label: { ca: "Sant Joan", es: "San Juan", en: "Sant Joan" },
    detail: {
      ca: "Sant Joan cau en dijous. Amb el divendres 25 demanat, el descans arriba fins diumenge.",
      es: "San Juan cae en jueves. Con el viernes 25 pedido, el descanso llega hasta el domingo.",
      en: "Sant Joan falls on a Thursday. With Friday the 25th booked, the break runs to Sunday.",
    },
  },
  {
    id: "october",
    take: ["2027-10-11"],
    from: "2027-10-09",
    to: "2027-10-12",
    days: 4,
    label: { ca: "12 d'octubre", es: "12 de octubre", en: "12 October" },
    detail: {
      ca: "El 12 d'octubre cau en dimarts. Demanant el dilluns 11, el pont comença el dissabte.",
      es: "El 12 de octubre cae en martes. Pidiendo el lunes 11, el puente empieza el sábado.",
      en: "12 October falls on a Tuesday. Taking Monday the 11th starts the break on Saturday.",
    },
  },
  {
    id: "all-saints",
    take: [],
    from: "2027-10-30",
    to: "2027-11-01",
    days: 3,
    label: { ca: "Tots Sants", es: "Todos los Santos", en: "All Saints" },
    detail: {
      ca: "L'1 de novembre cau en dilluns, així que el cap de setmana s'allarga sense gastar vacances.",
      es: "El 1 de noviembre cae en lunes, así que el fin de semana se alarga sin gastar vacaciones.",
      en: "1 November falls on a Monday, so the weekend extends without using any leave.",
    },
  },
  {
    id: "new-year-short",
    take: ["2027-01-04", "2027-01-05"],
    from: "2027-01-01",
    to: "2027-01-06",
    days: 6,
    label: { ca: "Cap d'Any i Reis", es: "Año Nuevo y Reyes", en: "New Year and Epiphany" },
    detail: {
      ca: "Cap d'Any cau en divendres i Reis en dimecres. Amb el 4 i el 5 demanats, la setmana queda sencera.",
      es: "Año Nuevo cae en viernes y Reyes en miércoles. Con el 4 y el 5 pedidos, la semana queda entera.",
      en: "New Year falls on a Friday and Epiphany on a Wednesday. With the 4th and 5th booked, the week is whole.",
    },
  },
  {
    id: "december-long",
    take: ["2027-12-07", "2027-12-09", "2027-12-10"],
    from: "2027-12-04",
    to: "2027-12-12",
    days: 9,
    label: { ca: "Desembre llarg", es: "Diciembre largo", en: "The long December" },
    detail: {
      ca: "Afegint el 9 i el 10 al pont curt, tres dies de vacances cobreixen nou dies seguits.",
      es: "Añadiendo el 9 y el 10 al puente corto, tres días de vacaciones cubren nueve días seguidos.",
      en: "Adding the 9th and 10th to the short bridge, three days of leave cover nine consecutive days.",
    },
  },
  {
    id: "new-year-long",
    take: ["2027-01-04", "2027-01-05", "2027-01-07", "2027-01-08"],
    from: "2027-01-01",
    to: "2027-01-10",
    days: 10,
    label: { ca: "Gener llarg", es: "Enero largo", en: "The long January" },
    detail: {
      ca: "Quatre dies de vacances al principi de gener donen deu dies consecutius de descans.",
      es: "Cuatro días de vacaciones a principios de enero dan diez días consecutivos de descanso.",
      en: "Four days of leave at the start of January give ten consecutive days off.",
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

export const SOURCES = [
  {
    name: "Ordre EMT/52/2026, de 25 de març — calendari oficial de festes laborals a Catalunya per al 2027",
    url: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/normativa/",
    publisher: "Departament d'Empresa i Treball, Generalitat de Catalunya",
  },
  {
    name: "Calendari oficial de festes laborals a Catalunya 2027 — Portal Jurídic",
    url: "https://portaljuridic.gencat.cat/ca/detalls/noticia/calendari_festes_laborals_catalunya_2027_dogc",
    publisher: "Generalitat de Catalunya",
  },
  {
    name: "Festes estatals i autonòmiques a Catalunya i locals a Barcelona al 2027",
    url: "https://ajuntament.barcelona.cat/calendarifestius/ca/",
    publisher: "Ajuntament de Barcelona",
  },
];

export const LAST_VERIFIED = "2026-09-24";
