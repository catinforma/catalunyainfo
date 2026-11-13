/**
 * ITV fees per autonomous community, from official sources only.
 *
 * RD 920/2017 art. 19.1: "El régimen tarifario de las inspecciones técnicas
 * será establecido por la comunidad autónoma." Some communities fix the fee
 * or a maximum (an order or resolution in their bulletin), others publish
 * none. A figure is stored only when it was read in the bulletin, or on the
 * page of the regional government or of its public ITV company, on
 * PRICES_AS_OF; otherwise the row says what we found and prints no price.
 * Press figures and private operators' pages are never used.
 *
 * Read on 13 Nov 2026 (PDFs fetched and read; notes in the session's
 * research files):
 *  - Cataluña: Ordre IUE/361/2010 (DOGC 5660, 30.6.2010), annex títol 2,
 *    maximums still in force, art. 2.2 "no inclouen … IVA ni … taxes".
 *  - Andalucía: VEIASA (Junta's public company) tariff page, amounts of
 *    BOJA 250/2014 kept by BOJA 246/2016, IVA and 4,18 € DGT fee included.
 *  - Aragón: Orden PEJ/1853/2025 (BOA 252, 31.12.2025), 2026.
 *  - Asturias: Resolución 19-XII-2025 (BOPA 248, 26.12.2025), ITVASA 2026.
 *  - Illes Balears: Consell de Mallorca ordinance (BOIB 52, 4.4.2020) and
 *    Consell d'Eivissa ordinance as amended (BOIB 106, 25.8.2026).
 *  - Canarias: Resolución 23-I-2026 (BOC 23, 4.2.2026), maximums to 31.1.2027.
 *  - Cantabria: Orden IND/58/2025 (BOC 246, 23.12.2025), 2026.
 *  - Castilla-La Mancha: Resolución 11/12/2025 (DOCM 251, 30.12.2025), 2026.
 *  - Castilla y León: Resolución 12/12/2025 (BOCYL 245, 22.12.2025), 2026.
 *  - Comunitat Valenciana: SITVAL "importes vigentes desde 01 enero 2023" on
 *    the Generalitat's industry portal, IVA and DGT fee included.
 *  - Extremadura: Resolución 23/09/2026 (DOE 189, 30.9.2026), 2026 tasas of
 *    the Junta's own stations (concession stations: maximums of Orden
 *    10/07/2013, last update found 2022 — not printed).
 *  - País Vasco: Resolución 1-XII-2025 (BOPV 238, 10.12.2025), 2026.
 *  - Melilla: Orden 2992 (BOME 6337, 19.12.2025), 2026.
 *  - No current official tariff found: Galicia (concession, no DOG tariff),
 *    Comunidad de Madrid (Ley 7/2009 liberalised regime, no tariff), Región
 *    de Murcia (concession prices "fijadas en los correspondientes pliegos",
 *    DL 2/2017 art. 9), Navarra (Orden Foral 55/2020 base of 2021 updated
 *    by CPI each January; current amounts not published), La Rioja (the
 *    BOR could not be read), Ceuta (no 2026 decree in the BOCCE).
 *
 * Tariffs change yearly (most in December–January): a test fails from
 * PRICES_REREAD_BY.
 */

/** The day the official tariff sources below were read. */
export const PRICES_AS_OF = "2026-11-13";

/** Re-read every community's tariff by this day (2027 tariffs usually appear in Dec–Jan); a test fails after it. */
export const PRICES_REREAD_BY = "2027-02-01";

/**
 * The DGT fee for recording the result in the vehicle register (Ley 16/1979,
 * art. 6, grupo IV, tarifa 6), as stated in the official tariff tables of the
 * Generalitat Valenciana ("Tasa de Tráfico de 4,18 € (BOE 312 29/12/2021
 * Art-66)"), VEIASA and Melilla (BOME 6337). The DGT's own fee page could not
 * be read from the server: re-check it with the tariffs.
 */
export const DGT_FEE = { amount: 4.18, law: "Ley 16/1979, de 2 de octubre, sobre tasas de la Jefatura Central de Tráfico", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1979-23768" } as const;

export type Regime =
  /** The community fixes the fee and publishes it. */
  | "fixed"
  /** The community publishes a maximum; stations may charge less. */
  | "max"
  /** We found no current official tariff; no price printed. */
  | "unpublished";

type T = { es: string; ca: string; en: string };

export interface PriceRow {
  /** What the row is, in each language. */
  label: T;
  /** Euros, as printed in the official source. */
  amount: number;
}

export interface Source {
  title: string;
  url: string;
  /** The day the bulletin published it (absent for a web page). */
  published?: string;
}

export interface Region {
  id: string;
  name: T;
  regime: Regime;
  /** The documents the figures (or the regime) were read in. */
  sources: Source[];
  /** The year (or period) the amounts apply to. */
  validFor?: T;
  prices?: PriceRow[];
  /** What the amounts include: IVA (or IGIC/IPSI) and the DGT fee. */
  taxes?: "included" | "excluded" | "dgt-extra" | "unstated";
  /** One or two sentences: how the parts add up, what is not shown, what we could not read. */
  note?: T;
  /** Official pages listing stations and/or how to book (neutral, checked to load). */
  stations: { url: string; label: T }[];
}

const row = (es: string, ca: string, en: string, amount: number): PriceRow => ({ label: { es, ca, en }, amount });
const y2026: T = { es: "2026", ca: "2026", en: "2026" };

export const REGIONS: Region[] = [
  {
    id: "cataluna",
    name: { es: "Cataluña", ca: "Catalunya", en: "Catalonia" },
    regime: "max",
    sources: [
      { title: "Ordre IUE/361/2010, de 17 de juny (DOGC núm. 5660)", url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=541600", published: "2010-06-30" },
      { title: "Generalitat: inspecció tècnica de vehicles", url: "https://empresa.gencat.cat/ca/treb_ambits_actuacio/seguretat-industrial/itv-automobil/inspeccio-tecnica-vehicles/" },
    ],
    validFor: { es: "máximos vigentes desde 2010", ca: "màxims vigents des del 2010", en: "maximums in force since 2010" },
    prices: [
      row("Turismo de gasolina (motor catalizado)", "Turisme de benzina (motor catalitzat)", "Petrol car (catalytic engine)", 30.1),
      row("Turismo diésel", "Turisme dièsel", "Diesel car", 34.22),
      row("Furgoneta hasta 3.500 kg, gasolina", "Furgoneta fins a 3.500 kg, benzina", "Van up to 3,500 kg, petrol", 36.59),
      row("Furgoneta hasta 3.500 kg, diésel", "Furgoneta fins a 3.500 kg, dièsel", "Van up to 3,500 kg, diesel", 41.98),
      row("Moto o ciclomotor (hasta tres ruedas)", "Moto o ciclomotor (fins a tres rodes)", "Motorcycle or moped (up to three wheels)", 14.14),
      row("Segunda inspección de un turismo de gasolina, en dos meses", "Segona inspecció d'un turisme de benzina, en dos mesos", "Re-inspection of a petrol car, within two months", 18.08),
    ],
    taxes: "excluded",
    note: {
      es: "Son importes máximos: cada operador puede cobrar menos. La segunda inspección es gratis si se supera en la misma estación en 15 días naturales (art. 6 de la orden).",
      ca: "Són imports màxims: cada operador pot cobrar menys. La segona inspecció és gratuïta si se supera a la mateixa estació en 15 dies naturals (art. 6 de l'ordre).",
      en: "These are maximums: each operator may charge less. A re-inspection is free if passed at the same station within 15 calendar days (art. 6 of the order).",
    },
    stations: [
      {
        url: "https://canalempresa.gencat.cat/ca/03_sectors_d_activitat/05_construccio_i_instal_lacions/03_instal_lacions/operadors_de_la_inspeccio/estacions-inspeccio-tecnica-vehicles/estacions-dinspeccio-tecnica-de-vehicles-itv/",
        label: { es: "Estaciones ITV de Cataluña (Generalitat); la cita se pide a cada operador", ca: "Estacions ITV de Catalunya (Generalitat); la cita es demana a cada operador", en: "ITV stations in Catalonia (Generalitat); book with each operator" },
      },
    ],
  },
  {
    id: "andalucia",
    name: { es: "Andalucía", ca: "Andalusia", en: "Andalusia" },
    regime: "fixed",
    sources: [
      { title: "VEIASA (empresa pública de la Junta de Andalucía): tarifas", url: "https://www.veiasa.es/itv/sobre-la-itv/tarifas" },
      { title: "Resolución de 19 de diciembre de 2016 (BOJA núm. 246)", url: "https://www.juntadeandalucia.es/boja/2016/246/BOJA16-246-00002-22611-01_00104843.pdf", published: "2016-12-27" },
      { title: "Resolución de 15 de diciembre de 2014 (BOJA núm. 250)", url: "https://www.juntadeandalucia.es/boja/2014/250/BOJA14-250-00003-21455-01_00060735.pdf", published: "2014-12-23" },
    ],
    validFor: { es: "tarifas de 2015, mantenidas desde 2017", ca: "tarifes del 2015, mantingudes des del 2017", en: "2015 tariffs, kept since 2017" },
    prices: [
      row("Turismo de 1.600 cc o más, gasolina", "Turisme de 1.600 cc o més, benzina", "Car of 1,600 cc or more, petrol", 43.52),
      row("Turismo de 1.600 cc o más, diésel", "Turisme de 1.600 cc o més, dièsel", "Car of 1,600 cc or more, diesel", 48.62),
      row("Turismo de menos de 1.600 cc, gasolina", "Turisme de menys de 1.600 cc, benzina", "Car under 1,600 cc, petrol", 33.28),
      row("Turismo eléctrico, híbrido o adaptado", "Turisme elèctric, híbrid o adaptat", "Electric, hybrid or adapted car", 29.11),
      row("Moto de más de 125 cc, gasolina", "Moto de més de 125 cc, benzina", "Motorcycle over 125 cc, petrol", 25.79),
      row("Ciclomotor, gasolina", "Ciclomotor, benzina", "Moped, petrol", 14.2),
      row("Furgoneta hasta 3.500 kg, diésel", "Furgoneta fins a 3.500 kg, dièsel", "Van up to 3,500 kg, diesel", 52.47),
    ],
    taxes: "included",
    note: {
      es: "Precio final en las estaciones de VEIASA. La orden descuenta un 10 % si pasas la ITV en plazo o con cita y suma un 12 % si llegas más de un mes tarde. La segunda inspección en dos meses no se cobra.",
      ca: "Preu final a les estacions de VEIASA. L'ordre descompta un 10 % si passes l'ITV dins de termini o amb cita i hi suma un 12 % si arribes més d'un mes tard. La segona inspecció en dos mesos no es cobra.",
      en: "Final price at VEIASA stations. The order takes 10% off if you go on time or with an appointment and adds 12% if you are over a month late. A re-inspection within two months is free.",
    },
    stations: [
      { url: "https://www.veiasa.es/itv/estaciones-itv/estaciones-fijas", label: { es: "Estaciones de VEIASA", ca: "Estacions de VEIASA", en: "VEIASA stations" } },
      { url: "https://www.itvcita.com/", label: { es: "Cita previa de VEIASA", ca: "Cita prèvia de VEIASA", en: "VEIASA appointments" } },
    ],
  },
  {
    id: "aragon",
    name: { es: "Aragón", ca: "Aragó", en: "Aragon" },
    regime: "fixed",
    sources: [{ title: "Orden PEJ/1853/2025, de 15 de diciembre (BOA núm. 252)", url: "https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1429100330404&type=pdf", published: "2025-12-31" }],
    validFor: y2026,
    prices: [
      row("Turismo o furgoneta hasta 3.500 kg, gasolina", "Turisme o furgoneta fins a 3.500 kg, benzina", "Car or van up to 3,500 kg, petrol", 37.5),
      row("Turismo o furgoneta hasta 3.500 kg, diésel", "Turisme o furgoneta fins a 3.500 kg, dièsel", "Car or van up to 3,500 kg, diesel", 46.76),
      row("Turismo o furgoneta eléctricos", "Turisme o furgoneta elèctrics", "Electric car or van", 33.04),
      row("Moto o ciclomotor", "Moto o ciclomotor", "Motorcycle or moped", 18.72),
    ],
    taxes: "unstated",
    note: {
      es: "La orden no dice si los importes incluyen el IVA y la tasa de Tráfico. La segunda inspección es gratis en la misma estación (o del mismo concesionario) en dos meses; si no, el 70 %.",
      ca: "L'ordre no diu si els imports inclouen l'IVA i la taxa de Trànsit. La segona inspecció és gratuïta a la mateixa estació (o del mateix concessionari) en dos mesos; si no, el 70 %.",
      en: "The order does not say whether the amounts include VAT and the DGT fee. A re-inspection is free at the same station (or concession holder) within two months; otherwise 70%.",
    },
    stations: [{ url: "https://www.aragon.es/itv/directorio-de-estaciones", label: { es: "Directorio de estaciones ITV (Gobierno de Aragón)", ca: "Directori d'estacions ITV (Govern d'Aragó)", en: "ITV station directory (Government of Aragon)" } }],
  },
  {
    id: "asturias",
    name: { es: "Asturias", ca: "Astúries", en: "Asturias" },
    regime: "fixed",
    sources: [{ title: "Resolución de 19 de diciembre de 2025, tarifas de ITVASA para 2026 (BOPA núm. 248)", url: "https://miprincipado.asturias.es/bopa/2025/12/26/2025-10695.pdf", published: "2025-12-26" }],
    validFor: y2026,
    prices: [
      row("Turismo", "Turisme", "Car", 34),
      row("Moto, ciclomotor o quad (categoría L)", "Moto, ciclomotor o quad (categoria L)", "Motorcycle, moped or quad (category L)", 29),
      row("Otros vehículos hasta 3.500 kg (furgonetas)", "Altres vehicles fins a 3.500 kg (furgonetes)", "Other vehicles up to 3,500 kg (vans)", 42),
    ],
    taxes: "excluded",
    note: {
      es: "Tarifas de ITVASA, empresa 100 % pública del Principado. La segunda inspección tras subsanar defectos no se cobra.",
      ca: "Tarifes d'ITVASA, empresa 100 % pública del Principat. La segona inspecció després d'esmenar defectes no es cobra.",
      en: "Tariffs of ITVASA, the region's wholly public company. A re-inspection after repairs is free.",
    },
    stations: [],
  },
  {
    id: "baleares",
    name: { es: "Illes Balears", ca: "Illes Balears", en: "Balearic Islands" },
    regime: "fixed",
    sources: [
      { title: "Consell de Mallorca: ordenança fiscal de la taxa d'ITV (BOIB núm. 52)", url: "https://cim.conselldemallorca.cat/sacws-api/arxiu/apiArxiuServlet?id=7151", published: "2020-04-04" },
      { title: "Consell d'Eivissa: modificació de l'ordenança fiscal de la taxa d'ITV (BOIB núm. 106)", url: "https://www.caib.es/eboibfront/pdf/ca/2026/106/1226850", published: "2026-08-25" },
    ],
    validFor: { es: "Mallorca, desde 2020; Eivissa, desde el 26 de agosto de 2026", ca: "Mallorca, des del 2020; Eivissa, des del 26 d'agost de 2026", en: "Mallorca, since 2020; Ibiza, since 26 August 2026" },
    prices: [
      row("Mallorca: turismo o quad", "Mallorca: turisme o quad", "Mallorca: car or quad", 17.01),
      row("Mallorca: vehículo ligero", "Mallorca: vehicle lleuger", "Mallorca: light vehicle", 22.57),
      row("Mallorca: vehículo de 2 o 3 ruedas", "Mallorca: vehicle de 2 o 3 rodes", "Mallorca: 2- or 3-wheeler", 10.21),
      row("Mallorca: control de gases de turismos y ligeros diésel", "Mallorca: control de gasos de turismes i lleugers dièsel", "Mallorca: diesel emissions test, cars and light vehicles", 13.91),
      row("Eivissa: turismo, cuadriciclo o vehículo hasta 3.500 kg", "Eivissa: turisme, quadricicle o vehicle fins a 3.500 kg", "Ibiza: car, quadricycle or vehicle up to 3,500 kg", 28),
      row("Eivissa: vehículo de hasta 3 ruedas", "Eivissa: vehicle de fins a 3 rodes", "Ibiza: vehicle with up to 3 wheels", 12),
    ],
    taxes: "dgt-extra",
    note: {
      es: "Cada consell insular cobra su propia tasa. En Mallorca se suma la tasa de Tráfico (art. 4.3); la ordenanza no aclara si el control de gases diésel se añade al turismo. Menorca y Formentera: no hemos podido leer una tarifa vigente.",
      ca: "Cada consell insular cobra la seva taxa. A Mallorca s'hi suma la taxa de Trànsit (art. 4.3); l'ordenança no aclareix si el control de gasos dièsel s'afegeix al turisme. Menorca i Formentera: no hem pogut llegir una tarifa vigent.",
      en: "Each island council charges its own fee. In Mallorca the DGT fee is added (art. 4.3); the ordinance does not say whether the diesel emissions test is added to a car. Menorca and Formentera: we could not read a current tariff.",
    },
    stations: [
      { url: "https://www.cime.es/gesserveis/gestion.aspx?IDGESTION=990100197", label: { es: "Menorca: cita previa ITV (Consell Insular)", ca: "Menorca: cita prèvia ITV (Consell Insular)", en: "Menorca: ITV appointments (island council)" } },
    ],
  },
  {
    id: "canarias",
    name: { es: "Canarias", ca: "Canàries", en: "Canary Islands" },
    regime: "max",
    sources: [{ title: "Resolución de 23 de enero de 2026, precios máximos de las ITV periódicas para 2026 (BOC núm. 23)", url: "https://sede.gobiernodecanarias.org/boc/boc-a-2026-023-343.pdf", published: "2026-02-04" }],
    validFor: { es: "del 1 de febrero de 2026 al 31 de enero de 2027", ca: "de l'1 de febrer de 2026 al 31 de gener de 2027", en: "1 February 2026 to 31 January 2027" },
    prices: [
      row("Turismo", "Turisme", "Car", 31.81),
      row("+ gases, gasolina con catalizador", "+ gasos, benzina amb catalitzador", "+ emissions, catalytic petrol", 4.96),
      row("+ gases, diésel", "+ gasos, dièsel", "+ emissions, diesel", 14.06),
      row("Moto (más 4,96 de gases)", "Moto (més 4,96 de gasos)", "Motorcycle (plus 4.96 emissions)", 15.85),
      row("Ciclomotor", "Ciclomotor", "Moped", 15.85),
      row("Vehículo ligero hasta 3.500 kg (más gases)", "Vehicle lleuger fins a 3.500 kg (més gasos)", "Light vehicle up to 3,500 kg (plus emissions)", 38.02),
    ],
    taxes: "excluded",
    note: {
      es: "Precios máximos sin IGIC ni tasa de Tráfico; la parte de gases se suma a la base. Fuera de las inspecciones periódicas, las estaciones fijan libremente sus precios (Decreto 47/2020, art. 14.1).",
      ca: "Preus màxims sense IGIC ni taxa de Trànsit; la part de gasos se suma a la base. Fora de les inspeccions periòdiques, les estacions fixen lliurement els preus (Decret 47/2020, art. 14.1).",
      en: "Maximum prices before IGIC and the DGT fee; the emissions part is added to the base. Outside periodic inspections, stations set their prices freely (Decree 47/2020, art. 14.1).",
    },
    stations: [{ url: "https://www.gobiernodecanarias.org/industria/temas/itv/Estaciones_ITV/index.html", label: { es: "Estaciones ITV de Canarias (Gobierno de Canarias)", ca: "Estacions ITV de Canàries (Govern de Canàries)", en: "ITV stations in the Canary Islands (regional government)" } }],
  },
  {
    id: "cantabria",
    name: { es: "Cantabria", ca: "Cantàbria", en: "Cantabria" },
    regime: "fixed",
    sources: [{ title: "Orden IND/58/2025, de 17 de diciembre, tarifas de ITV para 2026 (BOC núm. 246)", url: "https://boc.cantabria.es/boces/verAnuncioAction.do?idAnuBlob=428844", published: "2025-12-23" }],
    validFor: y2026,
    prices: [
      row("Vehículo ligero hasta 3.500 kg (turismo, furgoneta)", "Vehicle lleuger fins a 3.500 kg (turisme, furgoneta)", "Light vehicle up to 3,500 kg (car, van)", 33.77),
      row("+ gases, gasolina con catalizador", "+ gasos, benzina amb catalitzador", "+ emissions, catalytic petrol", 8.44),
      row("+ gases, diésel", "+ gasos, dièsel", "+ emissions, diesel", 14),
      row("Moto, triciclo o quad", "Moto, tricicle o quad", "Motorcycle, tricycle or quad", 11.22),
    ],
    taxes: "excluded",
    note: {
      es: "Sin IVA ni tasa de Tráfico; los gases se suman a la base. La segunda inspección es gratis en la misma estación en 15 días hábiles; después, el 70 % hasta dos meses.",
      ca: "Sense IVA ni taxa de Trànsit; els gasos se sumen a la base. La segona inspecció és gratuïta a la mateixa estació en 15 dies hàbils; després, el 70 % fins a dos mesos.",
      en: "Before VAT and the DGT fee; emissions are added to the base. A re-inspection is free at the same station within 15 working days; then 70% up to two months.",
    },
    stations: [{ url: "https://dgicc.cantabria.es/enlaces-de-interes", label: { es: "Estaciones ITV de Cantabria (Dirección General de Industria)", ca: "Estacions ITV de Cantàbria (Direcció General d'Indústria)", en: "ITV stations in Cantabria (Directorate-General for Industry)" } }],
  },
  {
    id: "castilla-la-mancha",
    name: { es: "Castilla-La Mancha", ca: "Castella-la Manxa", en: "Castilla-La Mancha" },
    regime: "max",
    sources: [{ title: "Resolución de 11/12/2025, tarifas máximas de ITV para 2026 (DOCM núm. 251)", url: "https://docm.jccm.es/docm/descargarArchivo.do?ruta=2025/12/30/pdf/2025_9655.pdf&tipo=rutaDocm", published: "2025-12-30" }],
    validFor: y2026,
    prices: [
      row("Vehículo ligero hasta 3.500 kg (turismo, furgoneta)", "Vehicle lleuger fins a 3.500 kg (turisme, furgoneta)", "Light vehicle up to 3,500 kg (car, van)", 24.24),
      row("+ gases, gasolina con catalizador", "+ gasos, benzina amb catalitzador", "+ emissions, catalytic petrol", 8.22),
      row("+ gases, diésel", "+ gasos, dièsel", "+ emissions, diesel", 18.74),
      row("Moto, ciclomotor, triciclo o cuadriciclo", "Moto, ciclomotor, tricicle o quadricicle", "Motorcycle, moped, tricycle or quadricycle", 14.94),
    ],
    taxes: "excluded",
    note: {
      es: "Precios máximos; solo pueden subir por tasas e impuestos (Orden 48/2024, art. 4.2). Los gases se suman a la base.",
      ca: "Preus màxims; només poden pujar per taxes i impostos (Ordre 48/2024, art. 4.2). Els gasos se sumen a la base.",
      en: "Maximum prices; only taxes and fees may be added (Orden 48/2024, art. 4.2). Emissions are added to the base.",
    },
    stations: [{ url: "https://energia.castillalamancha.es/seguridad-industrial/estaciones-de-itvs-autorizadas", label: { es: "Estaciones ITV autorizadas (Junta de Comunidades)", ca: "Estacions ITV autoritzades (Junta de Comunitats)", en: "Authorised ITV stations (regional government)" } }],
  },
  {
    id: "castilla-y-leon",
    name: { es: "Castilla y León", ca: "Castella i Lleó", en: "Castile and León" },
    regime: "fixed",
    sources: [
      { title: "Resolución de 12 de diciembre de 2025, tarifas de ITV para 2026 (BOCYL núm. 245)", url: "https://bocyl.jcyl.es/boletines/2025/12/22/pdf/BOCYL-D-22122025-24.pdf", published: "2025-12-22" },
      { title: "Corrección de errores (BOCYL núm. 251)", url: "https://bocyl.jcyl.es/boletines/2025/12/31/pdf/BOCYL-D-31122025-10.pdf", published: "2025-12-31" },
    ],
    validFor: y2026,
    prices: [
      row("Vehículo hasta 3.500 kg (turismo, furgoneta): seguridad", "Vehicle fins a 3.500 kg (turisme, furgoneta): seguretat", "Vehicle up to 3,500 kg (car, van): safety", 30.95),
      row("+ gases, con catalizador", "+ gasos, amb catalitzador", "+ emissions, catalytic", 7.89),
      row("+ gases, diésel hasta 3.500 kg", "+ gasos, dièsel fins a 3.500 kg", "+ emissions, diesel up to 3,500 kg", 15.6),
      row("Moto, ciclomotor, triciclo o cuadriciclo (categoría L): seguridad", "Moto, ciclomotor, tricicle o quadricicle (categoria L): seguretat", "Motorcycle, moped, tricycle or quadricycle (category L): safety", 15.58),
    ],
    taxes: "excluded",
    note: {
      es: "«Todos los valores indicados no incluyen ni tasas ni impuestos». El precio suma la parte de seguridad y la de gases; incluye una segunda inspección en plazo (como mucho dos meses).",
      ca: "«Todos los valores indicados no incluyen ni tasas ni impuestos». El preu suma la part de seguretat i la de gasos; inclou una segona inspecció dins de termini (com a màxim dos mesos).",
      en: "“Todos los valores indicados no incluyen ni tasas ni impuestos” (no taxes or fees included). The price adds the safety and emissions parts and includes one re-inspection on time (two months at most).",
    },
    stations: [{ url: "https://economia.jcyl.es/web/es/industria/inspeccion-tecnica-vehiculos.html", label: { es: "ITV en Castilla y León: estaciones y cita (Junta)", ca: "ITV a Castella i Lleó: estacions i cita (Junta)", en: "ITV in Castile and León: stations and booking (regional government)" } }],
  },
  {
    id: "comunitat-valenciana",
    name: { es: "Comunitat Valenciana", ca: "Comunitat Valenciana", en: "Valencian Community" },
    regime: "fixed",
    sources: [
      { title: "Generalitat Valenciana: importes vigentes de la ITV (desde el 1 de enero de 2023)", url: "https://portalindustria.gva.es/es/normativa/vehicles-i-itv" },
      { title: "Acuerdo de 25 de marzo de 2011, del Consell (DOGV núm. 6489)", url: "https://dogv.gva.es/datos/2011/03/28/pdf/2011_3534.pdf", published: "2011-03-28" },
    ],
    validFor: { es: "desde el 1 de enero de 2023", ca: "des de l'1 de gener de 2023", en: "since 1 January 2023" },
    prices: [
      row("Turismo o furgoneta hasta 3.500 kg, gasolina con catalizador", "Turisme o furgoneta fins a 3.500 kg, benzina amb catalitzador", "Car or van up to 3,500 kg, catalytic petrol", 41.47),
      row("Turismo o furgoneta hasta 3.500 kg, diésel", "Turisme o furgoneta fins a 3.500 kg, dièsel", "Car or van up to 3,500 kg, diesel", 56.15),
      row("Turismo o furgoneta eléctricos", "Turisme o furgoneta elèctrics", "Electric car or van", 34.49),
      row("Moto o ciclomotor de dos ruedas, gasolina con catalizador", "Moto o ciclomotor de dues rodes, benzina amb catalitzador", "Two-wheel motorcycle or moped, catalytic petrol", 33.07),
      row("Moto o ciclomotor de dos ruedas, eléctricos", "Moto o ciclomotor de dues rodes, elèctrics", "Two-wheel motorcycle or moped, electric", 14.84),
    ],
    taxes: "included",
    note: {
      es: "Precio final del servicio público (SITVAL), «mecánica, gases y ruido», con IVA y tasa de Tráfico. La segunda inspección depende de lo que se revise (solo mecánica de un turismo: 22,75 €).",
      ca: "Preu final del servei públic (SITVAL), «mecánica, gases y ruido», amb IVA i taxa de Trànsit. La segona inspecció depèn del que es revisi (només mecànica d'un turisme: 22,75 €).",
      en: "Final price of the public service (SITVAL), “mechanics, emissions and noise”, with VAT and the DGT fee. A re-inspection depends on what is re-checked (mechanics only, car: €22.75).",
    },
    stations: [],
  },
  {
    id: "extremadura",
    name: { es: "Extremadura", ca: "Extremadura", en: "Extremadura" },
    regime: "fixed",
    sources: [
      { title: "Resolución de 23 de septiembre de 2026, tasas y precios públicos para 2026 (DOE núm. 189)", url: "https://doe.juntaex.es/pdfs/doe/2026/1890o/26062437.pdf", published: "2026-09-30" },
      { title: "Orden de 10 de julio de 2013, tarifas de las estaciones en concesión (DOE núm. 139)", url: "https://doe.juntaex.es/pdfs/doe/2013/1390o/13050184.pdf", published: "2013-07-19" },
    ],
    validFor: { es: "2026, estaciones de la Junta", ca: "2026, estacions de la Junta", en: "2026, Junta-run stations" },
    prices: [
      row("Estaciones de la Junta: vehículo ligero hasta 3.500 kg (turismo)", "Estacions de la Junta: vehicle lleuger fins a 3.500 kg (turisme)", "Junta-run stations: light vehicle up to 3,500 kg (car)", 29.25),
      row("Estaciones de la Junta: ciclomotor o moto de dos ruedas", "Estacions de la Junta: ciclomotor o moto de dues rodes", "Junta-run stations: two-wheel moped or motorcycle", 21.44),
    ],
    taxes: "dgt-extra",
    note: {
      es: "En las estaciones de la Junta es una tasa pública, a la que se suma la tasa de Tráfico; la primera reinspección no se cobra. Las estaciones en concesión tienen tarifas máximas (Orden de 10 de julio de 2013, más IVA y tasa): no hemos encontrado su actualización vigente, así que no damos cifra.",
      ca: "A les estacions de la Junta és una taxa pública, a la qual se suma la taxa de Trànsit; la primera reinspecció no es cobra. Les estacions en concessió tenen tarifes màximes (Ordre de 10 de juliol de 2013, més IVA i taxa): no n'hem trobat l'actualització vigent, així que no donem xifra.",
      en: "At Junta-run stations it is a public fee, plus the DGT fee; the first re-inspection is free. Concession stations have maximum tariffs (Orden of 10 July 2013, plus VAT and fee): we found no current update, so we print no figure.",
    },
    stations: [
      { url: "https://www.juntaex.es/w/0614222", label: { es: "ITV en Extremadura (Junta)", ca: "ITV a Extremadura (Junta)", en: "ITV in Extremadura (regional government)" } },
      { url: "https://itvcitaprevia.juntaex.es/", label: { es: "Cita previa en las estaciones de la Junta", ca: "Cita prèvia a les estacions de la Junta", en: "Appointments at Junta-run stations" } },
    ],
  },
  {
    id: "galicia",
    name: { es: "Galicia", ca: "Galícia", en: "Galicia" },
    regime: "unpublished",
    sources: [],
    note: {
      es: "Servicio en concesión: no hemos encontrado ninguna resolución en el DOG ni página de la Xunta con las tarifas vigentes.",
      ca: "Servei en concessió: no hem trobat cap resolució al DOG ni pàgina de la Xunta amb les tarifes vigents.",
      en: "Concession service: we found no DOG resolution or Xunta page with the current tariffs.",
    },
    stations: [{ url: "https://abertos.xunta.gal/catalogo/territorio-vivienda-transporte/-/dataset/0304/estacions-inspeccion-tecnica-vehiculos-itv", label: { es: "Estaciones ITV de Galicia (datos abiertos de la Xunta)", ca: "Estacions ITV de Galícia (dades obertes de la Xunta)", en: "ITV stations in Galicia (Xunta open data)" } }],
  },
  {
    id: "la-rioja",
    name: { es: "La Rioja", ca: "La Rioja", en: "La Rioja" },
    regime: "unpublished",
    sources: [],
    note: {
      es: "La Rioja fija tarifas por orden, pero no hemos podido leer la vigente en el Boletín Oficial de La Rioja, así que no damos cifra.",
      ca: "La Rioja fixa tarifes per ordre, però no hem pogut llegir la vigent al Boletín Oficial de La Rioja, així que no donem xifra.",
      en: "La Rioja sets tariffs by order, but we could not read the current one in its official bulletin, so we print no figure.",
    },
    stations: [],
  },
  {
    id: "madrid",
    name: { es: "Comunidad de Madrid", ca: "Comunitat de Madrid", en: "Madrid region" },
    regime: "unpublished",
    sources: [{ title: "Ley 7/2009, de 15 de diciembre, por la que se liberaliza el régimen jurídico de la actividad de ITV en la Comunidad de Madrid (BOE-A-2010-4180)", url: "https://www.boe.es/boe/dias/2010/03/13/pdfs/BOE-A-2010-4180.pdf", published: "2010-03-13" }],
    note: {
      es: "Régimen de autorización administrativa (Ley 7/2009, art. 1.1): ni la ley, ni su decreto, ni la página de la Comunidad publican tarifas. Pregunta el precio en la estación.",
      ca: "Règim d'autorització administrativa (Llei 7/2009, art. 1.1): ni la llei, ni el decret, ni la pàgina de la Comunitat publiquen tarifes. Pregunta el preu a l'estació.",
      en: "Administrative authorisation regime (Ley 7/2009, art. 1.1): neither the act, its decree nor the region's page publish tariffs. Ask the station for the price.",
    },
    stations: [{ url: "https://www.comunidad.madrid/industria/inspeccion-tecnica-vehiculos-itv", label: { es: "Estaciones ITV de la Comunidad de Madrid", ca: "Estacions ITV de la Comunitat de Madrid", en: "ITV stations in the Madrid region" } }],
  },
  {
    id: "murcia",
    name: { es: "Región de Murcia", ca: "Regió de Múrcia", en: "Region of Murcia" },
    regime: "unpublished",
    sources: [{ title: "Decreto-Ley 2/2017, de 2 de agosto, servicio público de ITV en la Región de Murcia (BORM núm. 180)", url: "https://www.boe.es/ccaa/borm/2017/180/s24471-24479.pdf", published: "2017-08-05" }],
    note: {
      es: "Las tarifas de las concesionarias se fijan «en los correspondientes pliegos de condiciones» (art. 9) y no hemos encontrado una tarifa regional vigente publicada.",
      ca: "Les tarifes de les concessionàries es fixen «en los correspondientes pliegos de condiciones» (art. 9) i no hem trobat una tarifa regional vigent publicada.",
      en: "Concession holders' tariffs are set “en los correspondientes pliegos de condiciones” (in their tender terms, art. 9) and we found no current published regional tariff.",
    },
    stations: [{ url: "https://www.carm.es/web/pagina?IDCONTENIDO=2255&IDTIPO=100", label: { es: "ITV en la Región de Murcia: normativa e información (CARM)", ca: "ITV a la Regió de Múrcia: normativa i informació (CARM)", en: "ITV in the Region of Murcia: rules and information (CARM)" } }],
  },
  {
    id: "navarra",
    name: { es: "Navarra", ca: "Navarra", en: "Navarre" },
    regime: "unpublished",
    sources: [{ title: "Orden Foral 55/2020, de 30 de diciembre (BON núm. 7)", url: "https://bon.navarra.es/es/anuncio/-/texto/2021/7/2", published: "2021-01-13" }],
    note: {
      es: "Las tarifas de 2021 se actualizan cada 15 de enero con el IPC, pero los importes vigentes no están publicados en un documento oficial que hayamos encontrado.",
      ca: "Les tarifes del 2021 s'actualitzen cada 15 de gener amb l'IPC, però els imports vigents no estan publicats en cap document oficial que hàgim trobat.",
      en: "The 2021 tariffs are updated every 15 January by the CPI, but we found no official document with the current amounts.",
    },
    stations: [{ url: "https://www.navarra.es/es/tramites/on/-/line/Tramites-vehiculos-ITV", label: { es: "Estaciones ITV de Navarra (Gobierno de Navarra)", ca: "Estacions ITV de Navarra (Govern de Navarra)", en: "ITV stations in Navarre (regional government)" } }],
  },
  {
    id: "pais-vasco",
    name: { es: "País Vasco", ca: "País Basc", en: "Basque Country" },
    regime: "fixed",
    sources: [{ title: "Resolución de 1 de diciembre de 2025, tarifas de ITV para 2026 (BOPV núm. 238)", url: "https://www.euskadi.eus/bopv2/datos/2025/12/2505258a.pdf", published: "2025-12-10" }],
    validFor: y2026,
    prices: [
      row("Turismo o furgoneta (M1, N1), diésel", "Turisme o furgoneta (M1, N1), dièsel", "Car or van (M1, N1), diesel", 57.74),
      row("Turismo o furgoneta, gasolina o híbrido", "Turisme o furgoneta, benzina o híbrid", "Car or van, petrol or hybrid", 55.28),
      row("Turismo o furgoneta eléctricos", "Turisme o furgoneta elèctrics", "Electric car or van", 53.08),
      row("Moto o ciclomotor (categoría L)", "Moto o ciclomotor (categoria L)", "Motorcycle or moped (category L)", 30.24),
      row("Moto o ciclomotor eléctricos", "Moto o ciclomotor elèctrics", "Electric motorcycle or moped", 26.55),
    ],
    taxes: "dgt-extra",
    note: {
      es: "Con IVA (21 %); se añade la tasa de Tráfico. Según el Gobierno Vasco, la segunda inspección es gratis si vuelves antes de un mes a la misma estación.",
      ca: "Amb IVA (21 %); s'hi afegeix la taxa de Trànsit. Segons el Govern Basc, la segona inspecció és gratuïta si hi tornes abans d'un mes a la mateixa estació.",
      en: "With VAT (21%); the DGT fee is added. The Basque Government says a re-inspection is free if you return to the same station within a month.",
    },
    stations: [{ url: "https://www.euskadi.eus/inspeccion-periodica-obligatoria-de-vehiculos-itv/web01-a2indust/es/", label: { es: "ITV en Euskadi: estaciones y cita (Gobierno Vasco)", ca: "ITV a Euskadi: estacions i cita (Govern Basc)", en: "ITV in the Basque Country: stations and booking (Basque Government)" } }],
  },
  {
    id: "ceuta",
    name: { es: "Ceuta", ca: "Ceuta", en: "Ceuta" },
    regime: "unpublished",
    sources: [],
    note: {
      es: "Las tarifas se aprueban por decreto en el BOCCE, pero no hemos encontrado el de 2026 en ningún número de diciembre de 2025 a noviembre de 2026.",
      ca: "Les tarifes s'aproven per decret al BOCCE, però no hem trobat el del 2026 en cap número de desembre de 2025 a novembre de 2026.",
      en: "Tariffs are approved by decree in the BOCCE, but we found no 2026 decree in any issue from December 2025 to November 2026.",
    },
    stations: [],
  },
  {
    id: "melilla",
    name: { es: "Melilla", ca: "Melilla", en: "Melilla" },
    regime: "max",
    sources: [{ title: "Orden nº 2992, de 17 de diciembre de 2025, tarifas máximas de la ITV para 2026 (BOME núm. 6337)", url: "https://bomemelilla.es/bome/descargar/BOME-A-2025-1341.pdf", published: "2025-12-19" }],
    validFor: y2026,
    prices: [
      row("Turismo", "Turisme", "Car", 34.4),
      row("Moto, ciclomotor o quad", "Moto, ciclomotor o quad", "Motorcycle, moped or quad", 19.2),
      row("Vehículo de mercancías hasta 3.500 kg", "Vehicle de mercaderies fins a 3.500 kg", "Goods vehicle up to 3,500 kg", 38.75),
    ],
    taxes: "included",
    note: {
      es: "Totales de la orden: tarifa máxima más IPSI (4 %) y tasa de Tráfico.",
      ca: "Totals de l'ordre: tarifa màxima més IPSI (4 %) i taxa de Trànsit.",
      en: "The order's totals: maximum tariff plus IPSI (4%, Melilla's tax instead of VAT) and the DGT fee.",
    },
    stations: [
      {
        url: "https://www.melilla.es/melillaPortal/contenedor.jsp?seccion=s_fdes_d4_v1.jsp&contenido=3639&tipo=6&nivel=1400&codResi=1&language=es&codMenu=8&codMenuPN=601",
        label: { es: "ITV en Melilla (Ciudad Autónoma)", ca: "ITV a Melilla (Ciutat Autònoma)", en: "ITV in Melilla (autonomous city)" },
      },
    ],
  },
];
