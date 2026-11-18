/**
 * The special regime for workers posted to Spain ("Beckham law"): every
 * figure the calculator's special-regime mode and the page's words use, each
 * with its source. Read in full on 18 Nov 2026; fact pack
 * research_notes/beckham-special-regime-nov2026.md.
 *
 * ## The rule
 *
 * Ley 35/2006 del IRPF, art. 93 (consolidated text BOE-A-2006-20764; the
 * regime's wording is Ley 28/2022, de startups, disposición final 3.5, in
 * effect from 1 January 2023; art. 93 last changed by Ley 7/2024, published
 * 21 Dec 2024, savings scale only):
 *
 *   93.1: "Las personas físicas que adquieran su residencia fiscal en España
 *   como consecuencia de su desplazamiento a territorio español podrán optar
 *   por tributar por el Impuesto sobre la Renta de no Residentes [...]
 *   durante el período impositivo en que se efectúe el cambio de residencia
 *   y durante los cinco períodos impositivos siguientes", if "a) Que no hayan
 *   sido residentes en España durante los cinco períodos impositivos
 *   anteriores [...]".
 *   93.2.e.1º: "Hasta 600.000 euros. 24 / Desde 600.000,01 euros en
 *   adelante. 47".
 *   93.2.f: "el porcentaje de retención o ingreso a cuenta sobre rendimientos
 *   del trabajo será el 24 por ciento. Cuando las retribuciones satisfechas
 *   por un mismo pagador [...] excedan de 600.000 euros, el porcentaje de
 *   retención aplicable al exceso será el 47 por ciento."
 *
 * The base is the gross pay: the regime applies the non-residents' law
 * (TRLIRNR, RDLeg 5/2004, art. 24.1: "su importe íntegro [...] sin que sean
 * de aplicación [...] las reducciones"), so no Social Security contribution,
 * expense, earned-income reduction or personal and family allowance comes off.
 * The only things taken off the tax are those of RIRPF art. 114.2.b
 * (donations, the foreign tax credit, the amounts withheld).
 *
 * One scale for the whole of Spain: the AEAT's modelo 151 instructions
 * compute the tax with "Escala del artículo 93.2.e) 1º LIRPF" and then split
 * it 50 % state, 50 % region (boxes [22] and [23]); no regional scale applies.
 *
 * Social Security is not part of the regime: a worker registered in the
 * Spanish system ("alta en la Seguridad Social en España", RIRPF art. 116.1.a)
 * contributes as anyone else (Orden PJC/297/2026). Keeping the home country's
 * Social Security, which art. 116.1.a also contemplates, is not modelled.
 *
 * Client-safe: the calculator imports it.
 */

/** When every source below was last read in full. */
export const SPECIAL_REGIME_AS_OF = "2026-11-18";
/** Re-read art. 93 LIRPF and arts. 113-119 RIRPF every year with the 2027 rules: a test fails from this date. */
export const SPECIAL_REGIME_RECHECK_BY = "2027-01-01";

export const SPECIAL_REGIME = {
  /** Art. 93.2.e.1º LIRPF: rate up to the threshold, %. */
  rate: 24,
  /** Art. 93.2.e.1º: rate on the base above the threshold, %. */
  topRate: 47,
  /** Art. 93.2.e.1º and 93.2.f: euros a year (withholding: from the same payer). */
  threshold: 600000,
  /** Art. 93.1: the year residence is acquired "y [...] los cinco períodos impositivos siguientes". */
  followingYears: 5,
  /** Art. 93.1.a: not resident in Spain in this many tax years before the move. */
  priorNonResidentYears: 5,
  /** RIRPF art. 116.1.a: months from the start date in the Social Security registration to file modelo 149. */
  optionMonths: 6,
  /** RIRPF art. 115 and LIRPF art. 9.1.a: "superior a 183 días". */
  residenceDays: 183,
  /** RIRPF art. 117.1: waiver "durante los meses de noviembre y diciembre" before the year it takes effect. */
  waiverMonths: [11, 12] as const,
  /** RIRPF art. 118.2: report an exclusion "en el plazo de un mes". */
  exclusionMonths: 1,
  /** RIRPF art. 119.4: the AEAT's document proving the option, "diez días hábiles". */
  certificateWorkingDays: 10,
  /** RIRPF art. 114.2.b': the foreign tax credit is capped at this share of the tax on that income, %. */
  foreignCreditCap: 30,
  /** Art. 93.1.b.4º: the start-up or R&D pay must be more than this share of the person's earned income, %. */
  qualifiedShare: 40,
  /** Art. 93.3: children under this age (any age with a disability) can join the regime. */
  childrenUnder: 25,
  /** Savings income (art. 93.2.e.2º) starts at this rate; the calculator does not compute it. */
  savingsFirstRate: 19,
} as const;

/** Non-residents (not the special regime): TRLIRNR art. 25.1.a, %. */
export const NON_RESIDENT = {
  general: 24,
  /** Residents of another EU or EEA state with an effective exchange of tax information. */
  euEea: 19,
} as const;

export interface SpecialSource {
  name: string;
  ref: string;
  url: string;
  /** Publication or last-amendment date shown by the source; for AEAT pages, which show none, the day we read them (ISO). */
  date: string;
}

export const SPECIAL_SOURCES = {
  lirpf93: {
    name: "Ley 35/2006 del IRPF, artículo 93 (régimen fiscal especial aplicable a los trabajadores, profesionales, emprendedores e inversores desplazados a territorio español), texto consolidado",
    ref: "BOE-A-2006-20764",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a93",
    date: "2024-12-21",
  },
  lirpf9: {
    name: "Ley 35/2006 del IRPF, artículo 9 (residencia habitual en territorio español)",
    ref: "BOE-A-2006-20764",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a9",
    date: "2006-11-29",
  },
  startups: {
    name: "Ley 28/2022, de 21 de diciembre, de fomento del ecosistema de las empresas emergentes (disposición final tercera)",
    ref: "BOE-A-2022-21739",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2022-21739",
    date: "2022-12-22",
  },
  rirpf: {
    name: "Reglamento del IRPF (Real Decreto 439/2007), artículos 113 a 120, en la redacción del Real Decreto 1008/2023",
    ref: "BOE-A-2007-6820",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a113",
    date: "2023-12-06",
  },
  trlirnr: {
    name: "Texto refundido de la Ley del Impuesto sobre la Renta de no Residentes (Real Decreto Legislativo 5/2004), artículos 24 y 25",
    ref: "BOE-A-2004-4527",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-2004-4527#a24",
    date: "2023-05-25",
  },
  orden1338: {
    name: "Orden HFP/1338/2023, de 13 de diciembre, por la que se aprueban el modelo 151 y el modelo 149",
    ref: "BOE-A-2023-25416",
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2023-25416",
    date: "2023-12-15",
  },
  aeatRegime: {
    name: "Agencia Tributaria: Régimen fiscal aplicable a los trabajadores desplazados a territorio español. Régimen especial",
    ref: "sede.agenciatributaria.gob.es",
    url: "https://sede.agenciatributaria.gob.es/Sede/irpf/tengo-que-presentar-declaracion/regimen-fiscal-aplicable-trabajadores-desplazados/regimen-especial.html",
    date: "2026-11-18",
  },
  aeat149: {
    name: "Agencia Tributaria: Modelo 149. Comunicación de la opción, renuncia, exclusión y fin del desplazamiento",
    ref: "sede.agenciatributaria.gob.es, G606",
    url: "https://sede.agenciatributaria.gob.es/Sede/procedimientoini/G606.shtml",
    date: "2026-11-18",
  },
  aeat151: {
    name: "Agencia Tributaria: Modelo 151, instrucciones de cumplimentación, ejercicio 2023 y siguientes",
    ref: "sede.agenciatributaria.gob.es",
    url: "https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/impuesto-sobre-renta-personas-fisicas/modelo-151-decla_____los-trabajadores-desplazados-espanol_/instrucciones-cumplimentacion-ejercicio-2023-siguientes.html",
    date: "2026-11-18",
  },
  aeatManual: {
    name: "Agencia Tributaria: Manual de Tributación de No Residentes (noviembre 2026), régimen especial de impatriados",
    ref: "sede.agenciatributaria.gob.es",
    url: "https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-tributacion-no-residentes/regimenes-opcionales/regimen-especial-impatriados.html",
    date: "2026-11-18",
  },
} as const satisfies Record<string, SpecialSource>;

/** Official pages for the paperwork around a move (checked with curl on 18 Nov 2026). */
export const REGISTRATION_LINKS = {
  /** Import@ss: request a Social Security number (NUSS). */
  nuss: "https://portal.seg-social.gob.es/wps/portal/importass/importass/Categorias/Altas,+bajas+y+modificaciones/Altas+y+afiliacion+de+trabajadores/Solicitar+el+numero+de+la+Seguridad+Social",
  /** Cita previa de extranjería (NIE, TIE, EU registration certificate): Ministry for Territorial Policy e-office. */
  foreignersAppointment: "https://mptmd.sede.gob.es/pagina?id=Extranjeria-cita-previa-extranjeria",
} as const;

/** Verbatim from the BOE consolidated texts (read 18 Nov 2026), printed in Spanish with lang="es". */
export const SPECIAL_QUOTES = {
  /** LIRPF art. 93.1, first sentence. */
  art93:
    "Las personas físicas que adquieran su residencia fiscal en España como consecuencia de su desplazamiento a territorio español podrán optar por tributar por el Impuesto sobre la Renta de no Residentes, con las reglas especiales previstas en el apartado 2 de este artículo, manteniendo la condición de contribuyentes por el Impuesto sobre la Renta de las Personas Físicas, durante el período impositivo en que se efectúe el cambio de residencia y durante los cinco períodos impositivos siguientes",
  /** RIRPF art. 116.1.a: the modelo 149 deadline. */
  art116:
    "en el plazo máximo de seis meses desde la fecha de inicio de la actividad que conste en el alta en la Seguridad Social en España o en la documentación que le permita, en su caso, el mantenimiento de la legislación de Seguridad Social de origen",
  /** LIRPF art. 9.1.a: the 183-day rule. */
  art9:
    "Que permanezca más de 183 días, durante el año natural, en territorio español. Para determinar este período de permanencia en territorio español se computarán las ausencias esporádicas, salvo que el contribuyente acredite su residencia fiscal en otro país.",
} as const;

/**
 * The AEAT's own worked examples (modelo 151 instructions): the general base
 * of 750,000 € is 144,000 € at 24 % plus 70,500 € at 47 % = 214,500 €; a
 * general base of 200,000 € of employment income is 48,000 €. The tests hold
 * the engine to them.
 */
export const AEAT_EXAMPLES = [
  { base: 750000, tax: 214500 },
  { base: 200000, tax: 48000 },
] as const;
