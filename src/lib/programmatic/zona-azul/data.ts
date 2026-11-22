import type { City, DaySchedule, HubOnlyRow, L, PaidRule, Prices } from "./types";

/**
 * Regulated street parking ("zona azul", SER, ORA…) by city: the one data
 * file of the family. Every fact was read on the official text it cites
 * (`sources`, by id in each `src`): the council's own site, its bulletin
 * (BOCM, BOP…) or its tax agency. Nothing here comes from a press article or
 * a comparison site, and a fact the official texts do not give is null and
 * printed as "not published".
 *
 * A city is added only once its hours, days and prices are read on such a
 * text: each URL was fetched and the fact found on the page (22 Nov 2026).
 *
 * Prices and timetables usually change on 1 January, with the new fiscal
 * ordinances: `ZONA_AZUL_REVIEW_BY` makes the test suite fail from that day
 * until every city has been read again and its `verified` date moved.
 */

/** The day the whole file was last read against its sources. */
export const ZONA_AZUL_AS_OF = "2026-11-22";
/** From this day the tests fail until the 2027 ordinances have been read (prices change on 1 January). */
export const ZONA_AZUL_REVIEW_BY = "2027-01-08";

const FREE: readonly [] = [];

function schedule(weekday: DaySchedule["weekday"], saturday: DaySchedule["saturday"]): DaySchedule {
  return { weekday, saturday, sunday: FREE, holiday: FREE };
}

/* -------------------------------------------------------------------------- */
/* Madrid: SER                                                                */
/* -------------------------------------------------------------------------- */

const MADRID_RULE: PaidRule = {
  base: schedule([["09:00", "21:00"]], [["09:00", "15:00"]]),
  seasons: [
    {
      from: "08-01",
      to: "08-31",
      label: { es: "Agosto", ca: "Agost", en: "August" },
      schedule: schedule([["09:00", "15:00"]], [["09:00", "15:00"]]),
      src: ["oms-2021", "ooff-2026"],
    },
  ],
  special: [
    {
      dates: ["12-24", "12-31"],
      label: { es: "24 y 31 de diciembre", ca: "24 i 31 de desembre", en: "24 and 31 December" },
      weekday: [["09:00", "15:00"]],
      saturday: [["09:00", "15:00"]],
      src: ["oms-2021", "ooff-2026"],
    },
  ],
};

const MADRID: City = {
  slug: "madrid",
  name: { es: "Madrid", ca: "Madrid", en: "Madrid" },
  service: "SER",
  operator: {
    es: "Servicio de Estacionamiento Regulado del Ayuntamiento de Madrid",
    ca: "Servei d'Estacionament Regulat de l'Ajuntament de Madrid",
    en: "Madrid City Council's regulated parking service (Servicio de Estacionamiento Regulado)",
  },
  holidays: { kind: "spain", region: "MD", slug: "madrid" },
  zones: [
    {
      id: "blue",
      colour: "blue",
      name: { es: "Plazas azules", ca: "Places blaves", en: "Blue spaces" },
      who: {
        es: "Pensadas sobre todo para quien no es residente del barrio: cualquier vehículo con tique.",
        ca: "Pensades sobretot per a qui no és resident del barri: qualsevol vehicle amb tiquet.",
        en: "Meant mainly for non-residents of the neighbourhood: any vehicle with a ticket.",
      },
      rule: MADRID_RULE,
      maxStayMinutes: 240,
      prices: { min: { minutes: 5, eur: 0.05 }, hour1: 1.1, hour2: 2.75, max: { minutes: 240, eur: 8.2 } },
      src: ["oms-2021", "ooff-2026"],
    },
    {
      id: "green",
      colour: "green",
      name: { es: "Plazas verdes", ca: "Places verdes", en: "Green spaces" },
      who: {
        es: "Pensadas sobre todo para los residentes del barrio con autorización; el resto puede aparcar con tique.",
        ca: "Pensades sobretot per als residents del barri amb autorització; la resta hi pot aparcar amb tiquet.",
        en: "Meant mainly for residents of the neighbourhood with a permit; anyone else may park with a ticket.",
      },
      rule: MADRID_RULE,
      maxStayMinutes: 120,
      prices: { min: { minutes: 5, eur: 0.15 }, hour1: 2.05, hour2: 4.1, max: { minutes: 120, eur: 4.1 } },
      src: ["oms-2021", "ooff-2026"],
    },
    {
      id: "high-rotation",
      colour: "blue",
      name: { es: "Plazas de alta rotación", ca: "Places d'alta rotació", en: "High-rotation spaces" },
      who: {
        es: "Cualquier vehículo con tique, para gestiones cortas.",
        ca: "Qualsevol vehicle amb tiquet, per a gestions curtes.",
        en: "Any vehicle with a ticket, for short errands.",
      },
      rule: MADRID_RULE,
      maxStayMinutes: 45,
      prices: { min: { minutes: 5, eur: 0.2 }, hour1: null, hour2: null, max: { minutes: 45, eur: 2.05 } },
      src: ["oms-2021", "ooff-2026"],
    },
  ],
  cancel: {
    eur: 4,
    text: {
      es: "Si el coche ha superado el tiempo del tique en menos de una hora, se puede pagar un suplemento de 4 € por el exceso (sin fraccionar). La ordenanza no recoge un importe para anular la denuncia por aparcar sin tique.",
      ca: "Si el cotxe ha superat el temps del tiquet en menys d'una hora, es pot pagar un suplement de 4 € per l'excés (sense fraccionar). L'ordenança no recull cap import per anul·lar la denúncia per aparcar sense tiquet.",
      en: "If the car has overstayed its ticket by less than one hour, a €4 supplement can be paid for the excess (it cannot be split). The ordinance gives no fee that cancels a notice for parking with no ticket at all.",
    },
    src: ["oms-2021", "ooff-2026"],
  },
  apps: null,
  payNote: {
    text: {
      es: "La ordenanza fiscal dice que se paga en los parquímetros del barrio o por «los medios telemáticos habilitados al efecto», sin nombrar ninguna aplicación.",
      ca: "L'ordenança fiscal diu que es paga als parquímetres del barri o pels «mitjans telemàtics habilitats a aquest efecte», sense anomenar cap aplicació.",
      en: "The fiscal ordinance says you pay at the neighbourhood's parking meters or through \"the electronic means provided\", without naming any app.",
    },
    src: ["ooff-2026"],
  },
  exemptions: {
    electric: {
      text: {
        es: "Los vehículos con la categoría ambiental «0 emisiones» están excluidos del límite de tiempo y del pago.",
        ca: "Els vehicles amb la categoria ambiental «0 emissions» queden exclosos del límit de temps i del pagament.",
        en: "Vehicles in the \"0 emissions\" environmental category are excluded from the time limit and from paying.",
      },
      src: ["oms-2018", "ooff-2026"],
    },
    pmr: {
      text: {
        es: "Los vehículos que trasladan a personas con movilidad reducida y muestran la autorización especial no pagan ni tienen límite de tiempo.",
        ca: "Els vehicles que traslladen persones amb mobilitat reduïda i mostren l'autorització especial no paguen ni tenen límit de temps.",
        en: "Vehicles carrying people with reduced mobility that display the special permit do not pay and have no time limit.",
      },
      src: ["oms-2018", "ooff-2026"],
    },
    other: [
      {
        text: {
          es: "Los vehículos de dos y tres ruedas.",
          ca: "Els vehicles de dues i tres rodes.",
          en: "Two- and three-wheeled vehicles.",
        },
        src: ["oms-2018", "ooff-2026"],
      },
    ],
  },
  seasonal: [],
  notes: [
    {
      text: {
        es: "Los precios de la tabla son la tarifa base de 2026. Según el distintivo ambiental: ECO, 75 % menos; C, 10 % menos; B, 20 % más (el resultado se redondea a 5 céntimos).",
        ca: "Els preus de la taula són la tarifa base del 2026. Segons el distintiu ambiental: ECO, 75 % menys; C, 10 % menys; B, 20 % més (el resultat s'arrodoneix a 5 cèntims).",
        en: "The prices in the table are the 2026 base tariff. By environmental label: ECO, 75% less; C, 10% less; B, 20% more (the result is rounded to 5 cents).",
      },
      src: ["ooff-2026"],
    },
    {
      text: {
        es: "Con contaminación alta la tarifa sube al día siguiente: 60 % más si el dióxido de nitrógeno supera los 60 µg/m³ y 100 % más si supera los 70 µg/m³.",
        ca: "Amb contaminació alta la tarifa puja l'endemà: 60 % més si el diòxid de nitrogen supera els 60 µg/m³ i 100 % més si supera els 70 µg/m³.",
        en: "After high pollution the tariff rises the next day: 60% more when nitrogen dioxide exceeds 60 µg/m³ and 100% more above 70 µg/m³.",
      },
      src: ["ooff-2026"],
    },
    {
      text: {
        es: "Agotado el tiempo máximo, el vehículo no puede volver a aparcar en plazas del mismo tipo del mismo barrio hasta que pase una hora. El tique solo vale en el barrio para el que se saca.",
        ca: "Esgotat el temps màxim, el vehicle no pot tornar a aparcar en places del mateix tipus del mateix barri fins que passi una hora. El tiquet només val al barri per al qual es treu.",
        en: "Once the maximum stay is used up, the vehicle may not park again in spaces of the same type in the same neighbourhood until one hour has passed. A ticket is valid only in the neighbourhood it was bought for.",
      },
      src: ["oms-2021"],
    },
    {
      text: {
        es: "Residentes: la autorización anual cuesta 24,60 € (2,05 € al mes).",
        ca: "Residents: l'autorització anual costa 24,60 € (2,05 € al mes).",
        en: "Residents: the annual permit costs €24.60 (€2.05 a month).",
      },
      src: ["ooff-2026"],
    },
  ],
  sources: [
    {
      id: "oms-2021",
      name: "Ordenanza 10/2021, de 13 de septiembre, por la que se modifica la Ordenanza de Movilidad Sostenible (arts. 49 y 52), BOCM núm. 225, de 21.9.2021",
      url: "https://www.bocm.es/boletin/CM_Orden_BOCM/2021/09/21/BOCM-20210921-25.PDF",
      publisher: "Boletín Oficial de la Comunidad de Madrid",
    },
    {
      id: "ooff-2026",
      name: "Ordenanzas fiscales y precios públicos municipales 2026: Ordenanza Fiscal reguladora de la Tasa por Estacionamiento de Vehículos en Determinadas Zonas de la Capital",
      url: "https://agenciatributaria.madrid.es/FWProjects/contribuyente/contenidos/06InformacionDocumentacion/01OrdenanzasFiscales/03Publicaciones/OOFF.Libro2026.pdf",
      publisher: "Agencia Tributaria Madrid (Ayuntamiento de Madrid)",
    },
    {
      id: "oms-2018",
      name: "Ordenanza de Movilidad Sostenible, de 5 de octubre de 2018 (art. 51, vehículos excluidos), BOCM núm. 253, de 23.10.2018",
      url: "https://www.bocm.es/boletin/CM_Orden_BOCM/2018/10/23/BOCM-20181023-36.PDF",
      publisher: "Boletín Oficial de la Comunidad de Madrid",
    },
  ],
  verified: "2026-11-22",
};

/* -------------------------------------------------------------------------- */
/* Valencia: ORA                                                              */
/* -------------------------------------------------------------------------- */

const VALENCIA_BLUE: PaidRule = {
  base: schedule(
    [
      ["09:00", "14:00"],
      ["16:00", "20:00"],
    ],
    [
      ["09:00", "14:00"],
      ["16:00", "20:00"],
    ],
  ),
  seasons: [],
  special: [],
};

const VALENCIA: City = {
  slug: "valencia",
  name: { es: "Valencia", ca: "València", en: "Valencia" },
  service: "ORA",
  operator: {
    es: "Servicio de Estacionamiento Regulado (ORA) del Ayuntamiento de València",
    ca: "Servei d'Estacionament Regulat (ORA) de l'Ajuntament de València",
    en: "València City Council's regulated parking service (ORA)",
  },
  holidays: { kind: "spain", region: "VC", slug: "valencia" },
  zones: [
    {
      id: "blue",
      colour: "blue",
      name: { es: "Zona azul (tarifa general)", ca: "Zona blava (tarifa general)", en: "Blue zone (general tariff)" },
      who: {
        es: "Estacionamiento de rotación: cualquier vehículo con tique.",
        ca: "Estacionament de rotació: qualsevol vehicle amb tiquet.",
        en: "Rotation parking: any vehicle with a ticket.",
      },
      rule: VALENCIA_BLUE,
      maxStayMinutes: 120,
      prices: { min: { minutes: 25, eur: 0.3 }, hour1: 0.8, hour2: 1.5, max: { minutes: 120, eur: 1.5 } },
      src: ["petxina", "ora-2023", "of-ora"],
    },
    {
      id: "blue-centre",
      colour: "blue",
      name: {
        es: "Zona azul del centro (Ciutat Vella, L'Eixample y Extramurs)",
        ca: "Zona blava del centre (Ciutat Vella, l'Eixample i Extramurs)",
        en: "City-centre blue zone (Ciutat Vella, L'Eixample and Extramurs)",
      },
      who: {
        es: "Estacionamiento de rotación: cualquier vehículo con tique.",
        ca: "Estacionament de rotació: qualsevol vehicle amb tiquet.",
        en: "Rotation parking: any vehicle with a ticket.",
      },
      rule: VALENCIA_BLUE,
      maxStayMinutes: 120,
      prices: { min: { minutes: 25, eur: 0.55 }, hour1: 1, hour2: 1.7, max: { minutes: 120, eur: 1.7 } },
      src: ["petxina", "ora-2023", "of-ora"],
    },
    {
      id: "orange",
      colour: "orange",
      name: { es: "Zona naranja", ca: "Zona taronja", en: "Orange zone" },
      who: {
        es: "Residentes con distintivo y tasa pagada; quien no es residente puede aparcar con tique solo en el horario de rotación.",
        ca: "Residents amb distintiu i taxa pagada; qui no és resident hi pot aparcar amb tiquet només en l'horari de rotació.",
        en: "Residents with a permit and the fee paid; non-residents may park with a ticket only during the rotation hours.",
      },
      rule: null,
      hoursNote: {
        es: "En el barrio de La Petxina, los no residentes pueden aparcar los días laborables de lunes a viernes de 9 a 19 h y los sábados de 9 a 15 h; fuera de ese horario, solo residentes. El horario de cada zona figura en la señal.",
        ca: "Al barri de la Petxina, els no residents hi poden aparcar els dies feiners de dilluns a divendres de 9 a 19 h i els dissabtes de 9 a 15 h; fora d'aquest horari, només residents. L'horari de cada zona figura al senyal.",
        en: "In the La Petxina neighbourhood, non-residents may park on working days from Monday to Friday, 9:00 to 19:00, and on Saturdays, 9:00 to 15:00; outside those hours, residents only. Each zone's hours are on its sign.",
      },
      maxStayMinutes: 120,
      prices: { min: { minutes: 25, eur: 1.1 }, hour1: 2.1, hour2: 3.3, max: { minutes: 120, eur: 3.3 } },
      src: ["petxina", "of-ora"],
    },
    {
      id: "green",
      colour: "green",
      name: { es: "Zona verde", ca: "Zona verda", en: "Green zone" },
      who: {
        es: "Exclusiva para residentes con distintivo.",
        ca: "Exclusiva per a residents amb distintiu.",
        en: "Residents with a permit only.",
      },
      rule: null,
      hoursNote: {
        es: "Sin tarifa para visitantes: los residentes pagan 86,20 € al año o 7,18 € al mes.",
        ca: "Sense tarifa per a visitants: els residents paguen 86,20 € l'any o 7,18 € al mes.",
        en: "No visitor tariff: residents pay €86.20 a year or €7.18 a month.",
      },
      maxStayMinutes: null,
      prices: null,
      pricesNote: {
        es: "Solo residentes: 86,20 € al año o 7,18 € al mes.",
        ca: "Només residents: 86,20 € l'any o 7,18 € al mes.",
        en: "Residents only: €86.20 a year or €7.18 a month.",
      },
      src: ["contrato-ora", "of-ora"],
    },
  ],
  cancel: {
    eur: 4,
    text: {
      es: "La ordenanza fiscal fija en 4,00 € la «anulación de denuncia» en todas las tarifas. No publica el plazo para pagarla.",
      ca: "L'ordenança fiscal fixa en 4,00 € l'«anul·lació de denúncia» en totes les tarifes. No en publica el termini per pagar-la.",
      en: "The fiscal ordinance sets the \"cancellation of a notice\" at €4.00 in every tariff. It does not publish the time limit for paying it.",
    },
    src: ["of-ora"],
  },
  apps: { names: ["ElParking", "Telpark", "EasyPark"], src: ["petxina-pdf"] },
  payNote: {
    text: {
      es: "Se paga en los parquímetros o con las aplicaciones de pago por móvil que cita el Ayuntamiento. Teléfono de información de la oficina de la ORA: 900 928 860.",
      ca: "Es paga als parquímetres o amb les aplicacions de pagament per mòbil que cita l'Ajuntament. Telèfon d'informació de l'oficina de l'ORA: 900 928 860.",
      en: "You pay at the parking meters or with the mobile payment apps the council names. ORA office information line: 900 928 860.",
    },
    src: ["petxina-pdf", "of-ora"],
  },
  exemptions: {
    electric: {
      text: {
        es: "Etiqueta «cero emisiones»: la ordenanza fiscal solo recoge una exención transitoria de dos años contados desde el 8 de febrero de 2022, en la zona azul. El texto publicado no recoge ninguna prórroga, así que no consta una exención vigente.",
        ca: "Etiqueta «zero emissions»: l'ordenança fiscal només recull una exempció transitòria de dos anys comptats des del 8 de febrer de 2022, a la zona blava. El text publicat no en recull cap pròrroga, de manera que no consta cap exempció vigent.",
        en: "\"Zero emissions\" label: the fiscal ordinance only contains a transitional exemption of two years from 8 February 2022, in the blue zone. The published text shows no extension, so no exemption is on record as being in force.",
      },
      src: ["of-ora"],
    },
    pmr: {
      text: {
        es: "Los vehículos con la tarjeta de estacionamiento para personas con movilidad reducida (PMR), colocada de forma visible, están exentos de la tasa.",
        ca: "Els vehicles amb la targeta d'estacionament per a persones amb mobilitat reduïda (PMR), col·locada de manera visible, estan exempts de la taxa.",
        en: "Vehicles displaying the parking card for people with reduced mobility (PMR) are exempt from the fee.",
      },
      src: ["of-ora"],
    },
    other: [],
  },
  seasonal: [
    {
      text: {
        es: "Fallas: el Ayuntamiento suspende la zona azul durante las fiestas, por bando (en 2025, del 10 de marzo a las 9:00 del 20 de marzo: aparcamiento libre, sin pago ni límite). Las fechas de 2027 no están publicadas.",
        ca: "Falles: l'Ajuntament suspèn la zona blava durant les festes, per ban (el 2025, del 10 de març a les 9.00 del 20 de març: aparcament lliure, sense pagament ni límit). Les dates del 2027 no estan publicades.",
        en: "Fallas: the council suspends the blue zone during the festival, by edict (in 2025, from 10 March to 9:00 on 20 March: free parking, no payment and no time limit). The 2027 dates are not published.",
      },
      src: ["fallas-2025"],
    },
    {
      text: {
        es: "El Ayuntamiento no publica un horario distinto para agosto: la zona azul mantiene el horario general.",
        ca: "L'Ajuntament no publica cap horari diferent per a l'agost: la zona blava manté l'horari general.",
        en: "The council publishes no separate August timetable: the blue zone keeps its general hours.",
      },
      src: ["petxina", "ora-2023"],
    },
  ],
  notes: [
    {
      text: {
        es: "Las tarifas son las del texto de la ordenanza fiscal publicado en la sede electrónica municipal (última modificación aplicable desde el 4 de marzo de 2022).",
        ca: "Les tarifes són les del text de l'ordenança fiscal publicat a la seu electrònica municipal (darrera modificació aplicable des del 4 de març de 2022).",
        en: "The tariffs are those of the fiscal ordinance as published on the council's electronic office (last amendment applicable from 4 March 2022).",
      },
      src: ["of-ora"],
    },
  ],
  sources: [
    {
      id: "petxina",
      name: "Zona de estacionamiento del Barrio de La Petxina. Nueva tarjeta para residentes (horario de la zona azul y de la zona naranja)",
      url: "https://www.valencia.es/cas/movilidad-y-urbanismo/campa%C3%B1as/-/content/zona-estacionamiento-la-petxina-tarjeta-residentes",
      publisher: "Ajuntament de València",
    },
    {
      id: "ora-2023",
      name: "La zona azul de la ORA recupera desde este lunes su horario de 9 a 14 y de 16 a 20 horas (30.10.2023)",
      url: "https://www.valencia.es/cas/actualidad/-/content/la-ora-recupera-horarios",
      publisher: "Ajuntament de València",
    },
    {
      id: "of-ora",
      name: "Ordenanza Fiscal Reguladora de la Tasa por Estacionamiento de Vehículos en la Vía Pública (texto vigente en la sede electrónica)",
      url: "https://sede.valencia.es/sede/descarga/doc/DOCUMENT_1_ORD0043_C",
      publisher: "Ajuntament de València, Regidoria d'Hisenda",
    },
    {
      id: "petxina-pdf",
      name: "Implantación de zona regulada de estacionamiento para residentes en el barrio de La Petxina: información detallada (mayo de 2025)",
      url: "https://www.valencia.es/documents/d/guest/20250521-implantacion-zona-regulada-petxina-informacion-detallada",
      publisher: "Ajuntament de València",
    },
    {
      id: "contrato-ora",
      name: "El nuevo contrato de la ORA establece una nueva zona verde exclusiva para residentes",
      url: "https://www.valencia.es/es/-/nuevo-contrato-ora",
      publisher: "Ajuntament de València",
    },
    {
      id: "fallas-2025",
      name: "Desde este lunes no se paga el estacionamiento en la Zona Azul durante todas las Fallas (10.3.2025)",
      url: "https://www.valencia.es/cas/actualidad/-/content/zona-azul-ora-val%C3%A8ncia-fallas",
      publisher: "Ajuntament de València",
    },
  ],
  verified: "2026-11-22",
};

/* -------------------------------------------------------------------------- */
/* Sevilla                                                                    */
/* -------------------------------------------------------------------------- */

const MORNING: DaySchedule["weekday"] = [["09:00", "14:00"]];

/** Monday to Wednesday of Holy Week 2027 (Easter Sunday is 28 March 2027): afternoons without service. */
const HOLY_WEEK_2027 = ["2027-03-22", "2027-03-23", "2027-03-24"];

const SEVILLA_RULE: PaidRule = {
  base: schedule(
    [
      ["09:00", "14:00"],
      ["17:00", "20:00"],
    ],
    [["10:00", "14:00"]],
  ),
  seasons: [
    {
      from: "07-01",
      to: "08-31",
      label: { es: "Del 1 de julio al 31 de agosto", ca: "De l'1 de juliol al 31 d'agost", en: "1 July to 31 August" },
      schedule: schedule(MORNING, FREE),
      src: ["bop-2025"],
    },
  ],
  special: [
    {
      dates: ["12-24", "12-31", "01-05"],
      label: {
        es: "Vísperas de Navidad, Año Nuevo y Reyes (24 y 31 de diciembre y 5 de enero)",
        ca: "Vigílies de Nadal, Cap d'Any i Reis (24 i 31 de desembre i 5 de gener)",
        en: "Eves of Christmas, New Year and Epiphany (24 and 31 December, 5 January)",
      },
      weekday: MORNING,
      src: ["bop-2025"],
    },
    {
      dates: HOLY_WEEK_2027,
      label: {
        es: "Semana Santa (en 2027, del lunes 22 al miércoles 24 de marzo)",
        ca: "Setmana Santa (el 2027, de dilluns 22 a dimecres 24 de març)",
        en: "Holy Week (in 2027, Monday 22 to Wednesday 24 March)",
      },
      weekday: MORNING,
      src: ["bop-2025"],
    },
  ],
};

const SEVILLA: City = {
  slug: "sevilla",
  name: { es: "Sevilla", ca: "Sevilla", en: "Seville" },
  service: null,
  operator: {
    es: "Estacionamiento regulado en superficie del Ayuntamiento de Sevilla; la oficina de atención es la de AUSSA (plaza Rafael Salgado, s/n)",
    ca: "Estacionament regulat en superfície de l'Ajuntament de Sevilla; l'oficina d'atenció és la d'AUSSA (plaça Rafael Salgado, s/n)",
    en: "Seville City Council's on-street regulated parking; the customer office is AUSSA's (Plaza Rafael Salgado, s/n)",
  },
  holidays: { kind: "spain", region: "AN", slug: "sevilla" },
  zones: [
    {
      id: "blue",
      colour: "blue",
      name: { es: "Zona azul (alta rotación)", ca: "Zona blava (alta rotació)", en: "Blue zone (high rotation)" },
      who: {
        es: "Cualquier vehículo con tique; también los residentes con abono o tique de residente, sin límite de tiempo.",
        ca: "Qualsevol vehicle amb tiquet; també els residents amb abonament o tiquet de resident, sense límit de temps.",
        en: "Any vehicle with a ticket; also residents with a resident pass or ticket, with no time limit.",
      },
      rule: SEVILLA_RULE,
      hoursNote: {
        es: "En la zona de Bami, de lunes a viernes laborables se paga de 8:00 a 22:00 sin pausa.",
        ca: "A la zona de Bami, de dilluns a divendres feiners es paga de 8.00 a 22.00 sense pausa.",
        en: "In the Bami area, the paid hours on working days from Monday to Friday are 8:00 to 22:00 with no break.",
      },
      maxStayMinutes: 120,
      prices: { min: { minutes: 35, eur: 0.45 }, hour1: 0.75, hour2: 1.7, max: { minutes: 120, eur: 1.7 } },
      src: ["bop-2025", "of-2026"],
    },
    {
      id: "green",
      colour: "green",
      name: { es: "Zona verde (media y baja rotación)", ca: "Zona verda (mitjana i baixa rotació)", en: "Green zone (medium and low rotation)" },
      who: {
        es: "Destinada sobre todo a los residentes (con abono o tique de residente, sin límite de tiempo); el resto puede aparcar con tique.",
        ca: "Destinada sobretot als residents (amb abonament o tiquet de resident, sense límit de temps); la resta hi pot aparcar amb tiquet.",
        en: "Meant mainly for residents (with a resident pass or ticket, no time limit); anyone else may park with a ticket.",
      },
      rule: SEVILLA_RULE,
      maxStayMinutes: 180,
      prices: { min: { minutes: 60, eur: 0.65 }, hour1: 0.65, hour2: 1.25, max: { minutes: 180, eur: 2 } },
      src: ["bop-2025", "of-2026"],
    },
    {
      id: "mar",
      colour: "blue",
      name: { es: "Zona azul MAR (muy alta rotación)", ca: "Zona blava MAR (molt alta rotació)", en: "MAR blue zone (very high rotation)" },
      who: {
        es: "Solo rotación con tique: en su horario no vale ningún distintivo ni abono de residente.",
        ca: "Només rotació amb tiquet: en el seu horari no hi val cap distintiu ni abonament de resident.",
        en: "Rotation with a ticket only: during its hours no resident permit or pass is valid.",
      },
      rule: null,
      hoursNote: {
        es: "Régimen MAR los días laborables de lunes a viernes de 9:00 a 14:00 (en Bami, de 8:00 a 14:00). El resto de horas y días se aplica el horario de la zona azul o verde.",
        ca: "Règim MAR els dies feiners de dilluns a divendres de 9.00 a 14.00 (a Bami, de 8.00 a 14.00). La resta d'hores i dies s'hi aplica l'horari de la zona blava o verda.",
        en: "MAR rules apply on working days from Monday to Friday, 9:00 to 14:00 (in Bami, 8:00 to 14:00). At other times the blue or green zone timetable applies.",
      },
      maxStayMinutes: 60,
      prices: { min: { minutes: 35, eur: 0.6 }, hour1: 1.25, hour2: null, max: { minutes: 60, eur: 1.25 } },
      src: ["bop-2025", "of-2026"],
    },
  ],
  cancel: {
    eur: 4.6,
    text: {
      es: "Quien ha superado el tiempo del tique puede anular la denuncia pagando la tarifa de cancelación, 4,60 €, dentro de la hora siguiente al final del tiempo pagado.",
      ca: "Qui ha superat el temps del tiquet pot anul·lar la denúncia pagant la tarifa de cancel·lació, 4,60 €, dins de l'hora següent al final del temps pagat.",
      en: "A driver who has overstayed the ticket can cancel the notice by paying the cancellation tariff, €4.60, within the hour after the paid time ended.",
    },
    src: ["of-2026"],
  },
  apps: null,
  payNote: {
    text: {
      es: "La ordenanza habla de tique de parquímetro o «tique virtual obtenido según las formas de pago establecidas en cada momento por el Ayuntamiento», sin nombrar ninguna aplicación.",
      ca: "L'ordenança parla de tiquet de parquímetre o «tiquet virtual obtingut segons les formes de pagament establertes en cada moment per l'Ajuntament», sense anomenar cap aplicació.",
      en: "The ordinance refers to a parking-meter ticket or a \"virtual ticket obtained by the payment methods the council sets at each time\", without naming any app.",
    },
    src: ["of-2026"],
  },
  exemptions: {
    electric: {
      text: {
        es: "Los vehículos eléctricos enchufables que cumplan los requisitos fijados por resolución municipal (distintivo para personas empadronadas en Sevilla) no pagan; al aparcar deben indicar la hora en el «marcador de hora límite».",
        ca: "Els vehicles elèctrics endollables que compleixin els requisits fixats per resolució municipal (distintiu per a persones empadronades a Sevilla) no paguen; en aparcar han d'indicar l'hora al «marcador d'hora límit».",
        en: "Plug-in electric vehicles that meet the requirements set by council resolution (a permit for people registered as residents of Seville) do not pay; when parking they must show the time on the time-limit disc.",
      },
      src: ["of-2026", "bop-2025"],
    },
    pmr: {
      text: {
        es: "Los vehículos con tarjeta de aparcamiento de personas con movilidad reducida, colocada de forma visible y siempre que transporten a su titular, no pagan.",
        ca: "Els vehicles amb targeta d'aparcament de persones amb mobilitat reduïda, col·locada de manera visible i sempre que transportin el titular, no paguen.",
        en: "Vehicles displaying the parking card for people with reduced mobility do not pay, as long as the cardholder is travelling in them.",
      },
      src: ["of-2026"],
    },
    other: [
      {
        text: {
          es: "Las motocicletas, ciclomotores y bicicletas aparcados en las zonas habilitadas para ellos, y los coches con el conductor dentro durante un máximo de 10 minutos.",
          ca: "Les motocicletes, ciclomotors i bicicletes aparcats a les zones habilitades per a ells, i els cotxes amb el conductor a dins durant un màxim de 10 minuts.",
          en: "Motorcycles, mopeds and bicycles parked in the areas set aside for them, and cars with the driver inside for up to 10 minutes.",
        },
        src: ["of-2026"],
      },
    ],
  },
  seasonal: [
    {
      text: {
        es: "Sin servicio: en el sector Centro, del Domingo de Ramos al Domingo de Resurrección; en Los Remedios, de lunes a domingo de Feria.",
        ca: "Sense servei: al sector Centre, del Diumenge de Rams al Diumenge de Resurrecció; a Los Remedios, de dilluns a diumenge de Fira.",
        en: "No service: in the Centro sector, from Palm Sunday to Easter Sunday; in Los Remedios, from Monday to Sunday of the Feria.",
      },
      src: ["bop-2025"],
    },
  ],
  notes: [
    {
      text: {
        es: "Residentes: abono anual de 79,90 €; en zona verde, 0,35 € al día o 1,60 € de lunes a viernes; en zona azul, 0,90 € al día o 3,00 € de lunes a viernes.",
        ca: "Residents: abonament anual de 79,90 €; a la zona verda, 0,35 € al dia o 1,60 € de dilluns a divendres; a la zona blava, 0,90 € al dia o 3,00 € de dilluns a divendres.",
        en: "Residents: annual pass €79.90; in the green zone, €0.35 a day or €1.60 Monday to Friday; in the blue zone, €0.90 a day or €3.00 Monday to Friday.",
      },
      src: ["of-2026"],
    },
  ],
  sources: [
    {
      id: "bop-2025",
      name: "Resolución núm. 826, de 16 de octubre de 2025, sobre el estacionamiento regulado en superficie: zonas, horarios y periodos sin servicio (BOP de Sevilla núm. 202, de 21.10.2025)",
      url: "https://www.sevilla.org/servicios/movilidad/documentos-pdf-normativa-movilidad/7-anuncio-bop_firmado-1761001274770-final.pdf",
      publisher: "Ayuntamiento de Sevilla",
    },
    {
      id: "of-2026",
      name: "Ordenanza fiscal reguladora de la tasa por estacionamiento regulado de vehículos de tracción mecánica en vías del municipio (ordenanzas fiscales de 2026)",
      url: "https://www.sevilla.org/servicios/agencia-tributaria-de-sevilla/ordenanzas-fiscales/ordenanzas_2026/tasa_estacionamiento_de_vehxculosxzona_azul-aussax.pdf",
      publisher: "Agencia Tributaria de Sevilla (Ayuntamiento de Sevilla)",
    },
  ],
  verified: "2026-11-22",
};

/* -------------------------------------------------------------------------- */

/** Every city with a page, in the order of the hub table (search demand, 22 Nov 2026). */
/* -------------------------------------------------------------------------- */
/* Girona: zona blava i zona verda                                            */
/* -------------------------------------------------------------------------- */

/**
 * Hours from the council's "Tarifes i horaris" page (the fee ordinance leaves
 * them to a mayoral decree); every amount from the 2026 fee ordinance, which
 * matches the page. The page still words the blue tariff as "durant l'any
 * 2024": the tariffs date from 24 June 2024 and the 2026 book keeps them.
 */
const GIRONA_BLUE: PaidRule = {
  base: schedule(
    [
      ["09:30", "13:00"],
      ["16:00", "20:00"],
    ],
    [
      ["09:30", "13:00"],
      ["16:00", "20:00"],
    ],
  ),
  seasons: [],
  special: [],
};
const GIRONA_GUELL: PaidRule = { base: schedule([["08:00", "20:00"]], [["08:00", "20:00"]]), seasons: [], special: [] };
const GIRONA_PEDRERES: PaidRule = {
  base: schedule(
    [
      ["09:30", "13:00"],
      ["17:00", "20:00"],
    ],
    [["09:30", "13:00"]],
  ),
  seasons: [],
  special: [],
};
const GIRONA_GREEN_WHO: L = {
  es: "Preferencia para los residentes de la zona; cualquier otro vehículo puede aparcar con tique, con tarifa y tiempo máximo según dónde resida el titular.",
  ca: "Preferència per als residents de la zona; qualsevol altre vehicle hi pot aparcar amb tiquet, amb tarifa i temps màxim segons on resideixi el titular.",
  en: "Residents of the zone have priority; any other vehicle may park with a ticket, with a tariff and maximum stay that depend on where the owner lives.",
};
const GIRONA_GREEN_STAY: L = {
  es: "2 horas (6 horas los vehículos de residentes en Girona)",
  ca: "2 hores (6 hores els vehicles de residents a Girona)",
  en: "2 hours (6 hours for vehicles of Girona residents)",
};
const GIRONA_GREEN_PRICES: Prices = { min: { minutes: null, eur: 0.4 }, hour1: 1.2, hour2: 2.4, max: { minutes: 120, eur: 2.4 } };
const GIRONA_GREEN_PRICES_NOTE: L = {
  es: "Tarifa de quien no reside en Girona. Los residentes en Girona que no son de la zona pagan 0,65 € por hora (mínimo 0,30 €), hasta 6 horas.",
  ca: "Tarifa de qui no resideix a Girona. Els residents a Girona que no són de la zona paguen 0,65 € per hora (mínim 0,30 €), fins a 6 hores.",
  en: "Tariff for vehicles from outside Girona. Girona residents from outside the zone pay €0.65 an hour (minimum €0.30), for up to 6 hours.",
};

const GIRONA: City = {
  slug: "girona",
  name: { es: "Girona", ca: "Girona", en: "Girona" },
  service: null,
  operator: {
    es: "Ayuntamiento de Girona (gestión municipal); incidencias con los parquímetros: 972 426 748",
    ca: "Ajuntament de Girona (gestió municipal); incidències amb els parquímetres: 972 426 748",
    en: "Girona City Council (run by the council itself); parking-meter problems: 972 426 748",
  },
  holidays: { kind: "catalonia", slug: "girona" },
  zones: [
    {
      id: "blue",
      colour: "blue",
      name: { es: "Zona azul", ca: "Zona blava", en: "Blue zone" },
      who: {
        es: "Cualquier vehículo con tique, con la misma tarifa para todos.",
        ca: "Qualsevol vehicle amb tiquet, amb la mateixa tarifa per a tothom.",
        en: "Any vehicle with a ticket; the tariff is the same for everyone.",
      },
      rule: GIRONA_BLUE,
      hoursNote: {
        es: "En la zona azul del barrio de Sant Narcís se paga de lunes a viernes laborables de 9:30 a 13:00 y de 17:00 a 20:00, y los sábados laborables de 9:30 a 13:00.",
        ca: "A la zona blava del barri de Sant Narcís es paga de dilluns a divendres feiners de 9.30 a 13.00 i de 17.00 a 20.00, i els dissabtes feiners de 9.30 a 13.00.",
        en: "In the blue zone of the Sant Narcís district the paid hours are Monday to Friday on working days, 9:30 to 13:00 and 17:00 to 20:00, and working Saturdays, 9:30 to 13:00.",
      },
      maxStayMinutes: 120,
      prices: { min: { minutes: null, eur: 0.35 }, hour1: 1.2, hour2: 2.4, max: { minutes: 120, eur: 2.4 } },
      src: ["tarifes", "of-2026"],
    },
    {
      id: "green-guell",
      colour: "green",
      name: { es: "Zona verde de Güell-Devesa", ca: "Zona verda de Güell-Devesa", en: "Güell-Devesa green zone" },
      who: GIRONA_GREEN_WHO,
      rule: GIRONA_GUELL,
      maxStayMinutes: 120,
      maxStayNote: GIRONA_GREEN_STAY,
      prices: GIRONA_GREEN_PRICES,
      pricesNote: GIRONA_GREEN_PRICES_NOTE,
      src: ["tarifes", "of-2026", "verda"],
    },
    {
      id: "green-pedreres",
      colour: "green",
      name: {
        es: "Zona verde de Les Pedreres-Vista Alegre",
        ca: "Zona verda de les Pedreres-Vista Alegre",
        en: "Les Pedreres-Vista Alegre green zone",
      },
      who: GIRONA_GREEN_WHO,
      rule: GIRONA_PEDRERES,
      maxStayMinutes: 120,
      maxStayNote: GIRONA_GREEN_STAY,
      prices: GIRONA_GREEN_PRICES,
      pricesNote: GIRONA_GREEN_PRICES_NOTE,
      src: ["tarifes", "of-2026", "verda"],
    },
  ],
  cancel: {
    eur: 6.85,
    text: {
      es: "Quien ha superado el tiempo del tique o ha aparcado sin tique puede anular la denuncia pagando 6,85 €, siempre que no hayan pasado 24 horas desde la denuncia. Se paga en cualquier parquímetro, o en la aplicación si el tique se sacó con ella.",
      ca: "Qui ha superat el temps del tiquet o ha aparcat sense tiquet pot anul·lar la denúncia pagant 6,85 €, sempre que no hagin passat 24 hores des de la denúncia. Es paga a qualsevol parquímetre, o a l'aplicació si el tiquet es va treure amb ella.",
      en: "A driver who has overstayed the ticket or parked without one can cancel the notice by paying €6.85, as long as 24 hours have not passed since the notice. It is paid at any parking meter, or in the app if the ticket was bought there.",
    },
    src: ["of-2026", "faqs"],
  },
  apps: { names: ["mot: APARCAR"], src: ["app"] },
  payNote: {
    text: {
      es: "Los parquímetros aceptan monedas y tarjetas (con chip, banda o sin contacto). Con la aplicación se inicia y se termina la estancia y solo se paga el tiempo usado, sin el redondeo a 5 céntimos. EasyPark dejó de funcionar en Girona el 1 de enero de 2024.",
      ca: "Els parquímetres accepten monedes i targetes (amb xip, banda o sense contacte). Amb l'aplicació s'inicia i es finalitza l'estada i només es paga el temps utilitzat, sense l'arrodoniment a 5 cèntims. EasyPark va deixar de funcionar a Girona l'1 de gener de 2024.",
      en: "Parking meters take coins and cards (chip, magnetic stripe or contactless). In the app you start and end the stay and pay only for the time used, without the rounding to 5 cents. EasyPark stopped working in Girona on 1 January 2024.",
    },
    src: ["faqs", "app", "of-2026"],
  },
  exemptions: {
    electric: null,
    pmr: {
      text: {
        es: "Con la tarjeta de aparcamiento para personas con discapacidad se puede aparcar en las zonas de horario limitado sin sacar el comprobante de pago.",
        ca: "Amb la targeta d'aparcament per a persones amb discapacitat es pot aparcar a les zones d'horari limitat sense haver d'obtenir el comprovant de pagament.",
        en: "Holders of the parking card for people with disabilities may park in the time-limited zones without getting a payment ticket.",
      },
      src: ["pmr"],
    },
    other: [
      {
        text: {
          es: "La tasa solo grava el estacionamiento de vehículos de más de dos ruedas: las motos de dos ruedas no están sujetas.",
          ca: "La taxa només grava l'estacionament de vehicles de més de dues rodes: les motos de dues rodes no hi estan subjectes.",
          en: "The fee applies only to vehicles with more than two wheels: two-wheeled motorcycles are outside it.",
        },
        src: ["of-2026"],
      },
    ],
  },
  seasonal: [
    {
      text: {
        es: "Días de mercado (martes y sábados), de 8:00 a 14:00: las dos primeras horas son gratis en el aparcamiento de superficie de Güell-Devesa (calle Riu Güell, entre las rotondas del Rellotge y de la Devesa). Solo sacando el tique en el parquímetro.",
        ca: "Dies de mercat (dimarts i dissabtes), de 8.00 a 14.00: les dues primeres hores són gratuïtes a l'aparcament de superfície de Güell-Devesa (carrer Riu Güell, entre les rotondes del Rellotge i de la Devesa). Només traient el tiquet al parquímetre.",
        en: "Market days (Tuesdays and Saturdays), 8:00 to 14:00: the first two hours are free in the Güell-Devesa surface car park (Carrer Riu Güell, between the Rellotge and Devesa roundabouts). Only with a ticket taken at the parking meter.",
      },
      src: ["tarifes", "of-2026"],
    },
  ],
  notes: [
    {
      text: {
        es: "Las tarifas están en vigor desde el 24 de junio de 2024 y las ordenanzas fiscales de 2026 las mantienen. En el parquímetro se paga en fracciones de 5 céntimos.",
        ca: "Les tarifes són vigents des del 24 de juny de 2024 i les ordenances fiscals de 2026 les mantenen. Al parquímetre es paga en fraccions de 5 cèntims.",
        en: "The tariffs have applied since 24 June 2024 and the 2026 fee ordinances keep them. At the parking meter you pay in 5-cent steps.",
      },
      src: ["tarifes", "of-2026"],
    },
    {
      text: {
        es: "Residentes de una zona verde: 0,35 € al día, 1,70 € a la semana o 22,10 € al trimestre. La cuota trimestral se paga por internet y solo en cuatro periodos: del 20 de diciembre al 15 de enero, del 20 de marzo al 15 de abril, del 20 de junio al 15 de julio y del 20 de septiembre al 15 de octubre.",
        ca: "Residents d'una zona verda: 0,35 € al dia, 1,70 € a la setmana o 22,10 € al trimestre. La quota trimestral es paga per internet i només en quatre períodes: del 20 de desembre al 15 de gener, del 20 de març al 15 d'abril, del 20 de juny al 15 de juliol i del 20 de setembre al 15 d'octubre.",
        en: "Residents of a green zone: €0.35 a day, €1.70 a week or €22.10 a quarter. The quarterly fee is paid online and only in four windows: 20 December to 15 January, 20 March to 15 April, 20 June to 15 July and 20 September to 15 October.",
      },
      src: ["of-2026", "tarifes"],
    },
    {
      text: {
        es: "Las tarifas reducidas de residente exigen no tener pendiente ningún recibo del impuesto de vehículos (IVTM) del coche aparcado.",
        ca: "Les tarifes reduïdes de resident exigeixen no tenir pendent cap rebut de l'impost de vehicles (IVTM) del cotxe aparcat.",
        en: "The reduced resident tariffs require that no vehicle-tax (IVTM) bill for the parked car is unpaid.",
      },
      src: ["of-2026"],
    },
    {
      text: {
        es: "Aunque la tarifa de residente cubre hasta una semana, la ordenanza de circulación limita a 72 horas el tiempo que un vehículo puede estar en la misma plaza.",
        ca: "Tot i que la tarifa de resident cobreix fins a una setmana, l'ordenança de circulació limita a 72 hores el temps que un vehicle pot estar a la mateixa plaça.",
        en: "Although the resident tariff covers up to a week, the traffic ordinance limits a vehicle to 72 hours in the same space.",
      },
      src: ["faqs"],
    },
  ],
  sources: [
    {
      id: "tarifes",
      name: "Tarifes i horaris de la zona verda i la zona blava",
      url: "https://web.girona.cat/mobilitat/aparcaments/zones/tarifes",
      publisher: "Ajuntament de Girona",
    },
    {
      id: "of-2026",
      name: "Ordenança fiscal reguladora de la taxa per estacionament limitat de vehicles de tracció mecànica en les vies públiques municipals (Ordenances fiscals 2026)",
      url: "https://seu.girona.cat/cdn/dades/ordenances/ordfiscals2026.pdf",
      publisher: "Ajuntament de Girona",
    },
    {
      id: "verda",
      name: "La zona verda",
      url: "https://web.girona.cat/mobilitat/aparcaments/zones/verda",
      publisher: "Ajuntament de Girona",
    },
    {
      id: "faqs",
      name: "Zona verda i blava: preguntes freqüents",
      url: "https://web.girona.cat/mobilitat/aparcaments/zones/faqs",
      publisher: "Ajuntament de Girona",
    },
    {
      id: "app",
      name: "Pagament amb mòbil mot: APARCAR",
      url: "https://web.girona.cat/mobilitat/aparcaments/zones/pagaments-mobil",
      publisher: "Ajuntament de Girona",
    },
    {
      id: "pmr",
      name: "Targetes d'estacionament per a persones amb discapacitat",
      url: "https://web.girona.cat/mobilitat/accessibilitat",
      publisher: "Ajuntament de Girona",
    },
  ],
  verified: "2026-11-22",
};

export const CITIES: readonly City[] = [MADRID, VALENCIA, SEVILLA, GIRONA];

export function cityBySlug(slug: string): City | null {
  return CITIES.find((c) => c.slug === slug) ?? null;
}

/**
 * Barcelona keeps its own guide (`batch02/barcelona-practical.ts`, key
 * `parking`): the hub prints this one row, with the guide's figures as read
 * on AREA (B:SM) on the guide's own check date, and links to the guide. A
 * test holds the figures to the guide's text.
 */
export const BARCELONA_ROW: HubOnlyRow = {
  name: { es: "Barcelona", ca: "Barcelona", en: "Barcelona" },
  weekday: { es: "9:00–20:00", ca: "9.00–20.00", en: "9:00–20:00" },
  saturday: { es: "Solo en el centro", ca: "Només al centre", en: "City centre only" },
  sunday: {
    es: "Domingos, gratis fuera de la zona de playa",
    ca: "Diumenges, gratis fora de la zona de platja",
    en: "Sundays free outside the beach zone",
  },
  hour: { es: "1,15–3,75 €", ca: "1,15–3,75 €", en: "€1.15–3.75" },
  maxStay: { es: "El de la señal, normalmente 1 o 2 h", ca: "El del senyal, normalment 1 o 2 h", en: "As signed, usually 1 or 2 h" },
  source: { id: "area", name: "AREA: Área Azul", url: "https://www.areaverda.cat/es/informacion/tipos-de-plazas/area-azul", publisher: "Barcelona de Serveis Municipals" },
  verified: "2026-11-20",
};
