import { B2_PATHS } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";
import { butaneTranslations } from "@/lib/programmatic/butane/paths";
import { PAY_DATES_PATH } from "@/lib/programmatic/employment/paths";
import { RULES_AS_OF as EMPLOYMENT_AS_OF } from "@/lib/programmatic/employment/rules";
import { fuelHubPath } from "@/lib/programmatic/fuel/paths";
import { caDayArticle, dayMonthYear } from "@/lib/programmatic/holidays/format";
import { hubPath as holidaysHubPath } from "@/lib/programmatic/holidays/paths";
import { leavePath } from "@/lib/programmatic/leave-2027/copy";
import { SALARY_RULES_AS_OF } from "@/lib/programmatic/net-salary/rules-2026";
import { RENT_RULES_AS_OF } from "@/lib/programmatic/rent-update/rules";
import { RULES_AS_OF as EURIBOR_RULES_AS_OF } from "@/lib/programmatic/euribor/rules";
import { RULES_AS_OF as MORTGAGE_RULES_AS_OF } from "@/lib/programmatic/mortgage/rules";
import { RULES_AS_OF as SELF_EMPLOYED_AS_OF } from "@/lib/programmatic/self-employed/rules-2026";
import { RULES_AS_OF as SICK_LEAVE_AS_OF } from "@/lib/programmatic/sick-leave/rules";
import { RULES_AS_OF as PAID_LEAVE_AS_OF } from "@/lib/programmatic/paid-leave/rules";
import { PENSION_RULES_AS_OF } from "@/lib/programmatic/pensions-2027/rules";
import { SMI_RULES_AS_OF } from "@/lib/programmatic/smi/rules";
import { RULES_AS_OF as TREASURY_RULES_AS_OF } from "@/lib/programmatic/treasury-bills/rules";
import { pvpcTranslations } from "@/lib/programmatic/pvpc/paths";
import { reservoirHubPath } from "@/lib/programmatic/reservoirs/paths";
import { RULES_AS_OF as WORKING_DAYS_AS_OF } from "@/lib/programmatic/working-days/rules";
import { ITV_RULES_AS_OF } from "@/lib/programmatic/itv/rules";
import { hubPath as rodaliesHubPath } from "@/lib/programmatic/rodalies/paths";

import { calcPath, calculatorsHubPath, type CalcLocale, type CalculatorId } from "./paths";

/**
 * What the calculators hub (/es/calculadoras/, /ca/calculadores/,
 * /en/calculators/) lists: one card per calculator of the registry
 * (paths.ts CALCULATORS; tests/calculators-hub.test.ts fails if one is
 * missing), then the site's other tools, grouped by what the reader is
 * dealing with. The calculators' own "More calculators" block reads the same
 * cards, so a tool's name and one-liner are written once.
 *
 * Every card names its official basis: the law or the data publisher the
 * figures come from, as the tool's own page cites them.
 */

export type HubGroupId = "work" | "housing" | "official" | "vehicle" | "holidays" | "live";
export type Scope = "spain" | "catalonia";

export interface HubCard {
  /** The calculator's registry id, or a key of its own for the other tools. */
  key: CalculatorId | "pay-dates" | "leave-2027" | "ics" | "tourist-tax" | "fuel" | "reservoirs" | "rodalies" | "pvpc" | "butane";
  calculator: boolean;
  href: Record<CalcLocale, string>;
  /** Set when an edition links a page in another language (fuel has no English edition). */
  hrefLang?: Partial<Record<CalcLocale, Locale>>;
  title: Record<CalcLocale, string>;
  /** The question the tool answers, in one line. */
  answers: Record<CalcLocale, string>;
  /** The official basis of the figures. */
  basis: Record<CalcLocale, string>;
  scope: Scope;
  /** The day the rules were last checked (calculators only). */
  checked?: string;
}

export interface HubGroup {
  id: HubGroupId;
  title: Record<CalcLocale, string>;
  cards: HubCard[];
}

const each = (f: (l: CalcLocale) => string): Record<CalcLocale, string> => ({ ca: f("ca"), es: f("es"), en: f("en") });
const calc = (id: CalculatorId) => each((l) => calcPath(id, l));

export const SCOPE_LABEL: Record<Scope, Record<CalcLocale, string>> = {
  spain: { ca: "Tot Espanya", es: "Toda España", en: "All of Spain" },
  catalonia: { ca: "Catalunya", es: "Cataluña", en: "Catalonia" },
};

export const HUB_GROUPS: HubGroup[] = [
  {
    id: "work",
    title: { ca: "Feina i sou", es: "Trabajo y sueldo", en: "Work and pay" },
    cards: [
      {
        key: "net-salary",
        calculator: true,
        href: calc("net-salary"),
        title: { ca: "Sou net 2026", es: "Sueldo neto 2026", en: "Net salary 2026" },
        answers: {
          ca: "Quant cobres net cada mes amb el teu sou brut anual, en 12 o 14 pagues?",
          es: "¿Cuánto cobras neto al mes con tu sueldo bruto anual, en 12 o 14 pagas?",
          en: "What do you take home each month from your gross yearly salary, in 12 or 14 payments?",
        },
        basis: {
          ca: "Algorisme de retencions de l'IRPF 2026 de l'Agència Tributària i Ordre PJC/297/2026 (cotització). Règim comú: no País Basc ni Navarra.",
          es: "Algoritmo de retenciones del IRPF 2026 de la Agencia Tributaria y Orden PJC/297/2026 (cotización). Régimen común: no País Vasco ni Navarra.",
          en: "The Tax Agency's 2026 IRPF withholding algorithm and Orden PJC/297/2026 (contributions). Common regime: not the Basque Country or Navarre.",
        },
        scope: "spain",
        checked: SALARY_RULES_AS_OF,
      },
      {
        key: "self-employed",
        calculator: true,
        href: calc("self-employed"),
        title: { ca: "Quota d'autònoms 2026", es: "Cuota de autónomos 2026", en: "Self-employed contributions 2026" },
        answers: {
          ca: "Quant pagaràs d'autònom cada mes segons els teus rendiments nets, i amb tarifa plana?",
          es: "¿Cuánto pagarás de autónomo al mes según tus rendimientos netos, y con tarifa plana?",
          en: "How much will you pay each month as self-employed, from your net earnings, and on the flat rate?",
        },
        basis: {
          ca: "Ordre PJC/297/2026, art. 18 (trams 2026), Reial decret llei 3/2026, Llei general de la Seguretat Social, art. 308, i Estatut del treball autònom, art. 38 ter.",
          es: "Orden PJC/297/2026, art. 18 (tramos 2026), Real Decreto-ley 3/2026, Ley General de la Seguridad Social, art. 308, y Estatuto del trabajo autónomo, art. 38 ter.",
          en: "Orden PJC/297/2026, art. 18 (2026 bands), Royal Decree-law 3/2026, General Social Security Act, art. 308, and the Self-Employment Statute, art. 38 ter.",
        },
        scope: "spain",
        checked: SELF_EMPLOYED_AS_OF,
      },
      {
        key: "dismissal",
        calculator: true,
        href: calc("dismissal"),
        title: { ca: "Indemnització per acomiadament", es: "Indemnización por despido", en: "Severance pay" },
        answers: {
          ca: "Quant et correspon per un acomiadament improcedent, objectiu o per fi de contracte?",
          es: "¿Cuánto te corresponde por un despido improcedente, objetivo o por fin de contrato?",
          en: "How much are you owed for an unfair or objective dismissal, or at the end of a fixed-term contract?",
        },
        basis: {
          ca: "Estatut dels Treballadors, arts. 49, 53 i 56 i disposició transitòria 11a (BOE).",
          es: "Estatuto de los Trabajadores, arts. 49, 53 y 56 y disposición transitoria 11.ª (BOE).",
          en: "Workers' Statute (Estatuto de los Trabajadores), arts. 49, 53 and 56 and transitional provision 11 (BOE).",
        },
        scope: "spain",
        checked: EMPLOYMENT_AS_OF,
      },
      {
        key: "settlement",
        calculator: true,
        href: calc("settlement"),
        title: { ca: "Quitança (finiquito)", es: "Finiquito", en: "Final settlement (finiquito)" },
        answers: {
          ca: "Què t'ha de pagar l'empresa l'últim dia: dies del mes, pagues extra i vacances no gaudides?",
          es: "¿Qué te debe la empresa el último día: días del mes, pagas extra y vacaciones no disfrutadas?",
          en: "What your employer owes on your last day: days of the month, extra payments and unused holiday.",
        },
        basis: {
          ca: "Estatut dels Treballadors, arts. 31, 38 i 49 (BOE).",
          es: "Estatuto de los Trabajadores, arts. 31, 38 y 49 (BOE).",
          en: "Workers' Statute, arts. 31, 38 and 49 (BOE).",
        },
        scope: "spain",
        checked: EMPLOYMENT_AS_OF,
      },
      {
        key: "unemployment",
        calculator: true,
        href: calc("unemployment"),
        title: { ca: "Atur (prestació per desocupació)", es: "Paro (prestación por desempleo)", en: "Unemployment benefit (paro)" },
        answers: {
          ca: "Quant cobraràs d'atur i durant quants mesos, segons el que has cotitzat?",
          es: "¿Cuánto cobrarás de paro y durante cuántos meses, según lo que has cotizado?",
          en: "How much unemployment benefit you will get, and for how many months, from what you have paid in.",
        },
        basis: {
          ca: "Llei general de la Seguretat Social, arts. 269 i 270, i quanties del SEPE per al 2026.",
          es: "Ley General de la Seguridad Social, arts. 269 y 270, y cuantías del SEPE para 2026.",
          en: "General Social Security Act (LGSS), arts. 269 and 270, and SEPE's 2026 amounts.",
        },
        scope: "spain",
        checked: EMPLOYMENT_AS_OF,
      },
      {
        key: "sick-leave",
        calculator: true,
        href: calc("sick-leave"),
        title: { ca: "Baixa laboral (incapacitat temporal)", es: "Baja laboral (incapacidad temporal)", en: "Sick pay (incapacidad temporal)" },
        answers: {
          ca: "Quant cobraràs cada dia de baixa, qui ho paga i què canvia des de l'1 de desembre de 2026?",
          es: "¿Cuánto cobrarás cada día de baja, quién lo paga y qué cambia desde el 1 de diciembre de 2026?",
          en: "How much you get for each day of sick leave, who pays it, and what changes from 1 December 2026.",
        },
        basis: {
          ca: "Llei general de la Seguretat Social, arts. 169 a 174 (amb el Reial decret llei 31/2026), Decret 3158/1966 i Reial decret 53/1980.",
          es: "Ley General de la Seguridad Social, arts. 169 a 174 (con el Real Decreto-ley 31/2026), Decreto 3158/1966 y Real Decreto 53/1980.",
          en: "General Social Security Act (LGSS), arts. 169 to 174 (as amended by Royal Decree-law 31/2026), Decreto 3158/1966 and Royal Decree 53/1980.",
        },
        scope: "spain",
        checked: SICK_LEAVE_AS_OF,
      },
      {
        key: "paid-leave",
        calculator: true,
        href: calc("paid-leave"),
        title: { ca: "Permisos laborals (dies per llei)", es: "Permisos laborales (días por ley)", en: "Paid leave (days by law)" },
        answers: {
          ca: "Quants dies de permís et toquen per casament, hospitalització, defunció, mudança o naixement, qui els paga i quin dia acaben?",
          es: "¿Cuántos días de permiso te tocan por boda, hospitalización, fallecimiento, mudanza o nacimiento, quién los paga y qué día terminan?",
          en: "How many days off you get to marry, for a relative in hospital, a death, a move or a birth, who pays, and the last day.",
        },
        basis: {
          ca: "Estatut dels treballadors, arts. 37, 38, 48 i 48 bis (Reial decret llei 5/2023 i 9/2025); Llei general de la Seguretat Social, art. 179.",
          es: "Estatuto de los Trabajadores, arts. 37, 38, 48 y 48 bis (Reales Decretos-ley 5/2023 y 9/2025); Ley General de la Seguridad Social, art. 179.",
          en: "Workers' Statute, arts. 37, 38, 48 and 48 bis (Royal Decree-laws 5/2023 and 9/2025); General Social Security Act, art. 179.",
        },
        scope: "spain",
        checked: PAID_LEAVE_AS_OF,
      },
      {
        key: "pensions-2027",
        calculator: true,
        href: calc("pensions-2027"),
        title: { ca: "Pujada de les pensions 2027", es: "Subida de las pensiones 2027", en: "Pension increase 2027" },
        answers: {
          ca: "Quant pujarà la teva pensió el gener del 2027, amb l'IPC mitjà de desembre a novembre?",
          es: "¿Cuánto subirá tu pensión en enero de 2027, con el IPC medio de diciembre a noviembre?",
          en: "How much your pension rises in January 2027, with the average CPI from December to November.",
        },
        basis: {
          ca: "Llei general de la Seguretat Social, art. 58; IPC de l'INE.",
          es: "Ley General de la Seguridad Social, art. 58; IPC del INE.",
          en: "General Social Security Act, art. 58; the INE's CPI.",
        },
        scope: "spain",
        checked: PENSION_RULES_AS_OF,
      },
      {
        key: "pay-dates",
        calculator: false,
        href: PAY_DATES_PATH,
        title: {
          ca: "Quan es cobra l'atur i la pensió",
          es: "Cuándo se cobra el paro y la pensión",
          en: "When benefit and pensions are paid",
        },
        answers: {
          ca: "Quin dia arriba cada mes el pagament del SEPE i de la pensió, el 2026 i el 2027?",
          es: "¿Qué día llega cada mes el pago del SEPE y de la pensión, en 2026 y 2027?",
          en: "Which day SEPE and pension payments arrive each month, in 2026 and 2027.",
        },
        basis: {
          ca: "Calendari de pagament del SEPE i Reial decret 696/2018 (gestió financera de la Seguretat Social).",
          es: "Calendario de pago del SEPE y Real Decreto 696/2018 (gestión financiera de la Seguridad Social).",
          en: "SEPE's payment rule and Royal Decree 696/2018 (Social Security financial management).",
        },
        scope: "spain",
      },
    ],
  },
  {
    id: "housing",
    title: { ca: "Habitatge", es: "Vivienda", en: "Housing" },
    cards: [
      {
        key: "rent-update",
        calculator: true,
        href: calc("rent-update"),
        title: { ca: "Actualitzar el lloguer", es: "Actualizar el alquiler", en: "Rent increase" },
        answers: {
          ca: "Quant pot pujar el teu lloguer aquest any, amb l'IPC o l'IRAV?",
          es: "¿Cuánto puede subir tu alquiler este año, con el IPC o el IRAV?",
          en: "How much can your rent go up this year, with the CPI or the IRAV?",
        },
        basis: {
          ca: "Llei d'arrendaments urbans, art. 18, i Llei 12/2023; IPC i IRAV de l'INE, llegits cada dia.",
          es: "Ley de Arrendamientos Urbanos, art. 18, y Ley 12/2023; IPC e IRAV del INE, leídos cada día.",
          en: "Urban Leases Act (LAU), art. 18, and Ley 12/2023; the INE's CPI and IRAV, read daily.",
        },
        scope: "spain",
        checked: RENT_RULES_AS_OF,
      },
      {
        key: "mortgage",
        calculator: true,
        href: calc("mortgage"),
        title: { ca: "Calculadora d'hipoteca", es: "Calculadora de hipoteca", en: "Mortgage calculator" },
        answers: {
          ca: "Quina quota pagaràs amb una hipoteca fixa, variable o mixta, quants interessos en total, i quant canvia a la revisió?",
          es: "¿Qué cuota pagarás con una hipoteca fija, variable o mixta, cuántos intereses en total, y cuánto cambia en la revisión?",
          en: "What you pay each month on a fixed, variable or mixed mortgage, the total interest, and how much it changes at the revision.",
        },
        basis: {
          ca: "Sistema francès d'amortització; Llei 5/2019 (BOE) i Orden EHA/2899/2011; Euríbor oficial del Banc d'Espanya.",
          es: "Sistema francés de amortización; Ley 5/2019 (BOE) y Orden EHA/2899/2011; Euríbor oficial del Banco de España.",
          en: "French amortisation; Ley 5/2019 (BOE) and Orden EHA/2899/2011; the Banco de España's official Euribor.",
        },
        scope: "spain",
        checked: MORTGAGE_RULES_AS_OF,
      },
      {
        key: "euribor",
        calculator: true,
        href: calc("euribor"),
        title: { ca: "Euríbor avui (dada oficial)", es: "Euríbor hoy (dato oficial)", en: "Euribor today (official figure)" },
        answers: {
          ca: "Quin és l'Euríbor oficial de l'últim mes, com ha anat els últims 24 mesos i quan surt el proper?",
          es: "¿Cuál es el Euríbor oficial del último mes, cómo ha ido en los últimos 24 meses y cuándo sale el próximo?",
          en: "What is the latest official monthly Euribor, how has it moved over 24 months, and when is the next one out?",
        },
        basis: {
          ca: "Tipus de referència oficials del mercat hipotecari que el Banc d'Espanya publica cada mes al BOE (Orden EHA/2899/2011, art. 27), llegits cada dia.",
          es: "Tipos de referencia oficiales del mercado hipotecario que el Banco de España publica cada mes en el BOE (Orden EHA/2899/2011, art. 27), leídos cada día.",
          en: "The official mortgage reference rates the Banco de España publishes each month in the BOE (Orden EHA/2899/2011, art. 27), read daily.",
        },
        scope: "spain",
        checked: EURIBOR_RULES_AS_OF,
      },
    ],
  },
  {
    id: "official",
    title: { ca: "Dades oficials", es: "Datos oficiales", en: "Official figures" },
    cards: [
      {
        key: "smi-2027",
        calculator: true,
        href: calc("smi-2027"),
        title: { ca: "Salari mínim (SMI) 2027", es: "Salario mínimo (SMI) 2027", en: "Minimum wage (SMI) 2027" },
        answers: {
          ca: "Quant és el salari mínim al mes, al dia i per hora, què hi ha d'oficial del 2027 i quant et toca a temps parcial?",
          es: "¿Cuánto es el salario mínimo al mes, al día y por hora, qué hay oficial de 2027 y cuánto te toca a tiempo parcial?",
          en: "How much is Spain's minimum wage a month, a day and an hour, what is official for 2027, and what you get part-time.",
        },
        basis: {
          ca: "Reials decrets de l'SMI al BOE (RD 126/2026 i anteriors), Estatut dels Treballadors art. 27, i el projecte del Ministeri de Treball per al 2027.",
          es: "Reales decretos del SMI en el BOE (RD 126/2026 y anteriores), Estatuto de los Trabajadores art. 27, y el proyecto del Ministerio de Trabajo para 2027.",
          en: "The SMI royal decrees in the BOE (RD 126/2026 and earlier), Workers' Statute art. 27, and the Ministry of Labour's 2027 draft.",
        },
        scope: "spain",
        checked: SMI_RULES_AS_OF,
      },
      {
        key: "ipc",
        calculator: true,
        href: calc("ipc"),
        title: { ca: "IPC: última dada i calendari", es: "IPC: último dato y calendario", en: "CPI: latest figure and calendar" },
        answers: {
          ca: "Quant ha pujat l'IPC aquest mes i en l'últim any, la inflació subjacent i quan publica l'INE la propera dada?",
          es: "¿Cuánto ha subido el IPC este mes y en el último año, la inflación subyacente y cuándo publica el INE el próximo dato?",
          en: "How much Spain's CPI rose this month and over the year, core inflation, and when the INE releases the next figure.",
        },
        basis: {
          ca: "IPC de l'INE (sèries IPC290750, IPC290752, IPC292510 i IPC292512) i calendari oficial de l'INE, llegits cada dia.",
          es: "IPC del INE (series IPC290750, IPC290752, IPC292510 e IPC292512) y calendario oficial del INE, leídos cada día.",
          en: "The INE's CPI (series IPC290750, IPC290752, IPC292510 and IPC292512) and the INE's official calendar, read daily.",
        },
        scope: "spain",
      },
      {
        key: "treasury-bills",
        calculator: true,
        href: calc("treasury-bills"),
        title: { ca: "Lletres del Tresor", es: "Letras del Tesoro", en: "Spanish Treasury bills (Letras)" },
        answers: {
          ca: "A quin tipus han sortit les lletres a 3, 6, 9 i 12 mesos, quan és la propera subhasta i quant guanyaràs després de l'IRPF?",
          es: "¿A qué tipo han salido las Letras a 3, 6, 9 y 12 meses, cuándo es la próxima subasta y cuánto ganarás después del IRPF?",
          en: "What rate did 3-, 6-, 9- and 12-month bills fetch, when is the next auction, and what you earn after income tax.",
        },
        basis: {
          ca: "Resultats i calendari de subhastes del Tresor Públic (tesoro.es, llegits cada 3 hores), anunci del Banc d'Espanya, Orden ECM/2/2026 i Llei i Reglament de l'IRPF (BOE).",
          es: "Resultados y calendario de subastas del Tesoro Público (tesoro.es, leídos cada 3 horas), anuncio del Banco de España, Orden ECM/2/2026 y Ley y Reglamento del IRPF (BOE).",
          en: "The Tesoro Público's auction results and calendar (tesoro.es, read every 3 hours), the Banco de España's notice, Orden ECM/2/2026 and the income tax act and regulation (BOE).",
        },
        scope: "spain",
        checked: TREASURY_RULES_AS_OF,
      },
    ],
  },
  {
    id: "vehicle",
    title: { ca: "Cotxe i transport", es: "Coche y transporte", en: "Car and transport" },
    cards: [
      {
        key: "itv",
        calculator: true,
        href: calc("itv"),
        title: { ca: "Quan em toca l'ITV", es: "Cuándo me toca la ITV", en: "When is my ITV due" },
        answers: {
          ca: "Quan has de passar l'ITV segons el vehicle i la data de matriculació, quan la pots avançar 30 dies i quant costa a cada comunitat?",
          es: "¿Cuándo tienes que pasar la ITV según el vehículo y la fecha de matriculación, cuándo puedes adelantarla 30 días y cuánto cuesta en cada comunidad?",
          en: "When your ITV is due from the vehicle type and first registration, how early you can go without losing days, and the official fee by region.",
        },
        basis: {
          ca: "Reial decret 920/2017, art. 6 (BOE); Llei de trànsit, arts. 76 i 80; tarifes oficials de cada comunitat.",
          es: "Real Decreto 920/2017, art. 6 (BOE); Ley de Tráfico, arts. 76 y 80; tarifas oficiales de cada comunidad.",
          en: "Royal Decree 920/2017, art. 6 (BOE); Traffic Act, arts. 76 and 80; each region's official tariffs.",
        },
        scope: "spain",
        checked: ITV_RULES_AS_OF,
      },
    ],
  },
  {
    id: "holidays",
    title: { ca: "Festius i vacances", es: "Festivos y vacaciones", en: "Holidays and time off" },
    cards: [
      {
        key: "working-days",
        calculator: true,
        href: calc("working-days"),
        title: { ca: "Dies hàbils i terminis", es: "Días hábiles y plazos", en: "Working days and deadlines" },
        answers: {
          ca: "Quin és l'últim dia d'un termini administratiu o judicial, o quants dies hàbils hi ha entre dues dates, amb els festius del teu municipi?",
          es: "¿Cuál es el último día de un plazo administrativo o judicial, o cuántos días hábiles hay entre dos fechas, con los festivos de tu municipio?",
          en: "The last day of an administrative or court deadline, or the working days between two dates, with your town's holidays.",
        },
        basis: {
          ca: "Llei 39/2015, art. 30; LOPJ, arts. 182 i 183; LEC, arts. 130 i 133 (BOE). Festius del BOE, el DOGC i els butlletins de cada comunitat.",
          es: "Ley 39/2015, art. 30; LOPJ, arts. 182 y 183; LEC, arts. 130 y 133 (BOE). Festivos del BOE, el DOGC y los boletines de cada comunidad.",
          en: "Ley 39/2015, art. 30; LOPJ, arts. 182 and 183; LEC, arts. 130 and 133 (BOE). Holidays from the BOE, the DOGC and each region's bulletin.",
        },
        scope: "spain",
        checked: WORKING_DAYS_AS_OF,
      },
      {
        key: "leave-2027",
        calculator: false,
        href: each((l) => leavePath(l)),
        title: { ca: "Aprofitar les vacances el 2027", es: "Aprovechar las vacaciones en 2027", en: "2027 leave planner" },
        answers: {
          ca: "Quins dies de vacances has de demanar el 2027 per encadenar més dies lliures al teu municipi?",
          es: "¿Qué días de vacaciones pedir en 2027 para encadenar más días libres en tu municipio?",
          en: "Which days of leave to book in 2027 for the longest breaks where you live.",
        },
        basis: {
          ca: "Festes laborals del 2027 al BOE (BOE-A-2026-21254), DOGC i butlletins de cada comunitat.",
          es: "Fiestas laborales de 2027 del BOE (BOE-A-2026-21254), DOGC y boletines de cada comunidad.",
          en: "The 2027 public holidays in the BOE (BOE-A-2026-21254), the DOGC and each region's bulletin.",
        },
        scope: "spain",
      },
      {
        key: "ics",
        calculator: false,
        href: each((l) => holidaysHubPath(l)),
        title: {
          ca: "Els festius del teu municipi al calendari del mòbil",
          es: "Los festivos de tu municipio en el calendario del móvil",
          en: "Your town's holidays in your phone calendar",
        },
        answers: {
          ca: "Tria el teu municipi i subscriu-te als seus festius des de Google Calendar, l'iPhone o Outlook (.ics).",
          es: "Elige tu municipio y suscríbete a sus festivos desde Google Calendar, el iPhone o Outlook (.ics).",
          en: "Pick your town and subscribe to its holidays from Google Calendar, an iPhone or Outlook (.ics).",
        },
        basis: {
          ca: "Ordre de festes locals del DOGC i dades obertes de la Generalitat.",
          es: "Orden de fiestas locales del DOGC y datos abiertos de la Generalitat.",
          en: "The DOGC local holidays order and the Generalitat's open data.",
        },
        scope: "catalonia",
      },
      {
        key: "tourist-tax",
        calculator: false,
        href: each((l) => `/${l}/${B2_PATHS.touristTax[l]}/`),
        title: { ca: "Taxa turística", es: "Tasa turística", en: "Tourist tax" },
        answers: {
          ca: "Quant pagaràs de taxa turística per nit, segons l'allotjament i el municipi?",
          es: "¿Cuánto pagarás de tasa turística por noche, según el alojamiento y el municipio?",
          en: "How much tourist tax you pay per night, by type of stay and town.",
        },
        basis: {
          ca: "Impost sobre les estades en establiments turístics (Agència Tributària de Catalunya, Llei 2/2026) i recàrrec de Barcelona.",
          es: "Impuesto sobre las estancias en establecimientos turísticos (Agència Tributària de Catalunya, Ley 2/2026) y recargo de Barcelona.",
          en: "The tax on stays in tourist establishments (Catalan Tax Agency, Law 2/2026) and Barcelona's surcharge.",
        },
        scope: "catalonia",
      },
    ],
  },
  {
    id: "live",
    title: { ca: "Dades en directe", es: "Datos en directo", en: "Live data" },
    cards: [
      {
        key: "pvpc",
        calculator: false,
        href: pvpcTranslations("today"),
        title: { ca: "Preu de la llum avui i demà", es: "Precio de la luz hoy y mañana", en: "Electricity price today and tomorrow" },
        answers: {
          ca: "Quines són avui i demà les hores més barates de la llum amb la tarifa regulada (PVPC)?",
          es: "¿Cuáles son hoy y mañana las horas más baratas de la luz con la tarifa regulada (PVPC)?",
          en: "The cheapest hours today and tomorrow on Spain's regulated tariff (PVPC).",
        },
        basis: {
          ca: "Red Eléctrica (PVPC, dades obertes REData i e·sios).",
          es: "Red Eléctrica (PVPC, datos abiertos REData y e·sios).",
          en: "Red Eléctrica (PVPC, REData and e·sios open data).",
        },
        scope: "spain",
      },
      {
        key: "butane",
        calculator: false,
        href: butaneTranslations(),
        title: { ca: "Preu de la bombona de butà avui", es: "Precio de la bombona de butano hoy", en: "Butane bottle price today" },
        answers: {
          ca: "Quant costa avui la bombona de butà de 12,5 kg i quan torna a canviar el preu regulat?",
          es: "¿Cuánto cuesta hoy la bombona de butano de 12,5 kg y cuándo vuelve a cambiar el precio regulado?",
          en: "What a 12.5 kg butane bottle costs today and when the regulated price changes next.",
        },
        basis: {
          ca: "Resolucions de la Direcció General de Política Energètica i Mines al BOE; Ordre IET/389/2015 i Reial decret llei 25/2026.",
          es: "Resoluciones de la Dirección General de Política Energética y Minas en el BOE; Orden IET/389/2015 y Real Decreto-ley 25/2026.",
          en: "Resolutions of the Directorate-General for Energy Policy and Mines in the BOE; Orden IET/389/2015 and Royal Decree-law 25/2026.",
        },
        scope: "spain",
      },
      {
        key: "fuel",
        calculator: false,
        // No English edition: the English hub links the Spanish one, marked as such.
        href: { ca: fuelHubPath("ca"), es: fuelHubPath("es"), en: fuelHubPath("es") },
        hrefLang: { en: "es" },
        title: { ca: "Benzineres més barates avui", es: "Gasolineras más baratas hoy", en: "Cheapest petrol stations today" },
        answers: {
          ca: "On és avui la benzina i el gasoil més barat, per província, comarca, municipi i cadena?",
          es: "¿Dónde está hoy la gasolina y el diésel más barato, por provincia, comarca, municipio y cadena?",
          en: "Where petrol and diesel are cheapest today, by province, county, town and chain.",
        },
        basis: {
          ca: "Preus oficials del Ministeri per a la Transició Ecològica (dades obertes).",
          es: "Precios oficiales del Ministerio para la Transición Ecológica (datos abiertos).",
          en: "Official prices from the Ministry for the Ecological Transition (open data).",
        },
        scope: "catalonia",
      },
      {
        key: "reservoirs",
        calculator: false,
        href: each((l) => reservoirHubPath(l)),
        title: { ca: "Nivell dels embassaments", es: "Nivel de los embalses", en: "Reservoir levels" },
        answers: {
          ca: "Com estan avui Sau, Susqueda i la resta d'embassaments de les conques internes?",
          es: "¿Cómo están hoy Sau, Susqueda y el resto de embalses de las cuencas internas?",
          en: "How full Sau, Susqueda and the other reservoirs of Catalonia's internal basins are today.",
        },
        basis: {
          ca: "Dades obertes diàries de l'Agència Catalana de l'Aigua (ACA).",
          es: "Datos abiertos diarios de la Agència Catalana de l'Aigua (ACA).",
          en: "Daily open data from the Catalan Water Agency (ACA).",
        },
        scope: "catalonia",
      },
      {
        key: "rodalies",
        calculator: false,
        href: each((l) => rodaliesHubPath(l)),
        title: { ca: "Rodalies en directe", es: "Rodalies en directo", en: "Rodalies live" },
        answers: {
          ca: "Hi ha incidències ara mateix a la teva línia de Rodalies?",
          es: "¿Hay incidencias ahora mismo en tu línea de Rodalies?",
          en: "Are there problems on your Rodalies line right now?",
        },
        basis: {
          ca: "Avisos de Rodalies de Catalunya i dades obertes de Renfe.",
          es: "Avisos de Rodalies de Catalunya y datos abiertos de Renfe.",
          en: "Rodalies de Catalunya notices and Renfe's open data.",
        },
        scope: "catalonia",
      },
    ],
  },
];

export function hubCards(): HubCard[] {
  return HUB_GROUPS.flatMap((g) => g.cards);
}

/** A calculator's card (its hub title and one-liner), for the sibling links on each calculator page. */
export function calculatorCard(id: CalculatorId): HubCard {
  const card = hubCards().find((c) => c.calculator && c.key === id);
  if (!card) throw new Error(`calculators hub: no card for ${id}`);
  return card;
}

/* -------------------------------------------------------------------------- */
/* Page words                                                                 */
/* -------------------------------------------------------------------------- */

export interface HubCopy {
  /** Breadcrumb and menu label. */
  label: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  note: string;
  basis: string;
  /** "Normas revisadas el 13 de noviembre de 2026", from an ISO date. */
  checked: (iso: string) => string;
  otherLanguage: string;
}

export const HUB_COPY: Record<CalcLocale, HubCopy> = {
  es: {
    label: "Calculadoras",
    title: "Calculadoras de sueldo neto, despido, paro y alquiler 2026",
    description:
      "Calculadoras gratis para toda España con las normas oficiales: sueldo neto 2026, indemnización por despido, finiquito, paro y subida del alquiler (IPC o IRAV).",
    h1: "Calculadoras: sueldo, despido, paro y alquiler",
    lead: "Calcula tu sueldo neto, una indemnización por despido, el finiquito, el paro o cuánto puede subir tu alquiler, con las normas vigentes en toda España. Cada calculadora dice de qué ley o fuente oficial sale el cálculo y funciona sin registrarte.",
    note: "Son estimaciones: tu convenio colectivo, tu contrato o una resolución del SEPE o de un juzgado pueden cambiar el resultado. Antes de firmar, compruébalo con un profesional.",
    basis: "Base oficial",
    checked: (iso) => `Normas revisadas el ${dayMonthYear(iso, "es")}`,
    otherLanguage: "en castellano",
  },
  ca: {
    label: "Calculadores",
    title: "Calculadores de sou net, acomiadament, atur i lloguer 2026",
    description:
      "Calculadores gratuïtes per a tot Espanya amb les normes oficials: sou net 2026, indemnització per acomiadament, quitança, atur i pujada del lloguer (IPC o IRAV).",
    h1: "Calculadores: sou, acomiadament, atur i lloguer",
    lead: "Calcula el teu sou net, una indemnització per acomiadament, la quitança, l'atur o quant pot pujar el teu lloguer, amb les normes vigents a tot Espanya. Cada calculadora diu de quina llei o font oficial surt el càlcul i funciona sense registrar-te.",
    note: "Són estimacions: el teu conveni col·lectiu, el teu contracte o una resolució del SEPE o d'un jutjat poden canviar el resultat. Abans de signar, comprova-ho amb un professional.",
    basis: "Base oficial",
    checked: (iso) => `Normes revisades ${caDayArticle(iso)}${dayMonthYear(iso, "ca")}`,
    otherLanguage: "en castellà",
  },
  en: {
    label: "Calculators",
    title: "Spain calculators: net salary, severance, benefit and rent",
    description:
      "Free calculators for all of Spain built on the official rules: 2026 net salary, severance pay, final settlement (finiquito), unemployment benefit and rent increases.",
    h1: "Spain calculators: pay, severance, benefit and rent",
    lead: "Work out your net salary, severance pay, your final settlement (finiquito), unemployment benefit or how much your rent can rise, with the rules in force across Spain. Each calculator names the law or official source behind it, and none asks you to sign up.",
    note: "These are estimates: your collective agreement, your contract, or a decision by SEPE or a court can change the result. Before you sign anything, check with a professional.",
    basis: "Official basis",
    checked: (iso) => `Rules checked on ${dayMonthYear(iso, "en")}`,
    otherLanguage: "in Spanish",
  },
};

/** The hub's breadcrumb, second on every calculator page (Home › Calculadoras › tool). */
export function hubCrumb(locale: CalcLocale): { label: string; href: string } {
  return { label: HUB_COPY[locale].label, href: calculatorsHubPath(locale) };
}
