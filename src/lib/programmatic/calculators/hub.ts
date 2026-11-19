import { B2_PATHS } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";
import { butaneTranslations } from "@/lib/programmatic/butane/paths";
import { PAY_DATES_PATH } from "@/lib/programmatic/employment/paths";
import { RULES_AS_OF as EMPLOYMENT_AS_OF } from "@/lib/programmatic/employment/rules";
import { fuelHubPath } from "@/lib/programmatic/fuel/paths";
import { caDayArticle, dayMonthYear } from "@/lib/programmatic/holidays/format";
import { hubPath as holidaysHubPath } from "@/lib/programmatic/holidays/paths";
import { leavePath } from "@/lib/programmatic/leave-2027/copy";
import { checkEditions as lotteryCheckEditions } from "@/lib/programmatic/lottery-check/paths";
import { SALARY_RULES_AS_OF } from "@/lib/programmatic/net-salary/rules-2026";
import { EXTRA_PAY_RULES_AS_OF } from "@/lib/programmatic/extra-pay/rules";
import { RENT_RULES_AS_OF } from "@/lib/programmatic/rent-update/rules";
import { RULES_AS_OF as EURIBOR_RULES_AS_OF } from "@/lib/programmatic/euribor/rules";
import { RULES_AS_OF as MORTGAGE_RULES_AS_OF } from "@/lib/programmatic/mortgage/rules";
import { RULES_AS_OF as SELF_EMPLOYED_AS_OF } from "@/lib/programmatic/self-employed/rules-2026";
import { RULES_AS_OF as SICK_LEAVE_AS_OF } from "@/lib/programmatic/sick-leave/rules";
import { RULES_AS_OF as PAID_LEAVE_AS_OF } from "@/lib/programmatic/paid-leave/rules";
import { SUBSIDY_RULES_AS_OF } from "@/lib/programmatic/unemployment-subsidy/rules";
import { PENSION_RULES_AS_OF } from "@/lib/programmatic/pensions-2027/rules";
import { RULES_AS_OF as RETIREMENT_AGE_AS_OF } from "@/lib/programmatic/retirement-age/rules";
import { RULES_AS_OF as WIDOW_PENSION_AS_OF } from "@/lib/programmatic/widow-pension/rules";
import { RULES_AS_OF as NC_PENSION_AS_OF } from "@/lib/programmatic/non-contributory-pension/rules";
import { SMI_RULES_AS_OF } from "@/lib/programmatic/smi/rules";
import { IPREM_RULES_AS_OF, IPREM_YEAR } from "@/lib/programmatic/iprem/rules";
import { RULES_AS_OF as TREASURY_RULES_AS_OF } from "@/lib/programmatic/treasury-bills/rules";
import { pvpcTranslations } from "@/lib/programmatic/pvpc/paths";
import { warningsTranslations } from "@/lib/programmatic/warnings/paths";
import { reservoirHubPath } from "@/lib/programmatic/reservoirs/paths";
import { RULES_AS_OF as WORKING_DAYS_AS_OF } from "@/lib/programmatic/working-days/rules";
import { ITV_RULES_AS_OF } from "@/lib/programmatic/itv/rules";
import { RULES_AS_OF as TRAFFIC_FINES_AS_OF } from "@/lib/programmatic/traffic-fines/rules";
import { RULES_AS_OF as LOTTERY_TAX_AS_OF } from "@/lib/programmatic/lottery-tax/rules";
import { RULES_AS_OF as BONO_SOCIAL_AS_OF } from "@/lib/programmatic/bono-social/rules";
import { COMMUNITIES_AS_OF as HOME_TAX_AS_OF } from "@/lib/programmatic/home-purchase-tax/as-of";
import { RULES_AS_OF as PURCHASE_COSTS_AS_OF } from "@/lib/programmatic/purchase-costs/rules";
import { RULES_AS_OF as PLUSVALIA_AS_OF } from "@/lib/programmatic/plusvalia/rules";
import { RULES_AS_OF as INHERITANCE_TAX_AS_OF } from "@/lib/programmatic/inheritance-tax/rules";
import { RULES_AS_OF as REGIONAL_ISD_AS_OF } from "@/lib/programmatic/inheritance-tax/regions/state";
import { RULES_AS_OF as GIFT_TAX_AS_OF } from "@/lib/programmatic/gift-tax/regions/state";
import { RULES_AS_OF as ZONA_TENSIONADA_AS_OF } from "@/lib/programmatic/zona-tensionada/rules";
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

export type HubGroupId = "work" | "housing" | "taxes" | "official" | "lottery" | "vehicle" | "holidays" | "energy" | "live";
export type Scope = "spain" | "catalonia" | "madrid" | "andalucia" | "valencia";

export interface HubCard {
  /** The calculator's registry id, or a key of its own for the other tools. */
  key: CalculatorId | "pay-dates" | "leave-2027" | "ics" | "tourist-tax" | "fuel" | "reservoirs" | "rodalies" | "pvpc" | "butane" | "warnings" | "lottery-check";
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
  /** One line under the group's heading, when the group needs it (taxes: which community's rules apply). */
  intro?: Record<CalcLocale, string>;
  cards: HubCard[];
}

const each = (f: (l: CalcLocale) => string): Record<CalcLocale, string> => ({ ca: f("ca"), es: f("es"), en: f("en") });
const calc = (id: CalculatorId) => each((l) => calcPath(id, l));

export const SCOPE_LABEL: Record<Scope, Record<CalcLocale, string>> = {
  spain: { ca: "Tot Espanya", es: "Toda España", en: "All of Spain" },
  catalonia: { ca: "Catalunya", es: "Cataluña", en: "Catalonia" },
  madrid: { ca: "Comunitat de Madrid", es: "Comunidad de Madrid", en: "Madrid region" },
  andalucia: { ca: "Andalusia", es: "Andalucía", en: "Andalusia" },
  valencia: { ca: "Comunitat Valenciana", es: "Comunidad Valenciana", en: "Valencia region" },
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
        key: "extra-pay",
        calculator: true,
        href: calc("extra-pay"),
        title: { ca: "Paga extra de Nadal 2026", es: "Paga extra de Navidad 2026", en: "Christmas extra pay 2026" },
        answers: {
          ca: "Quant cobraràs net de paga extra, quina part et toca si vas entrar aquest any i per què no porta Seguretat Social?",
          es: "¿Cuánto cobrarás neto de paga extra, qué parte te toca si entraste este año y por qué no lleva Seguridad Social?",
          en: "How much your extra payment comes to after tax, the part you have earned if you started this year, and why it carries no Social Security.",
        },
        basis: {
          ca: "Estatut dels Treballadors, art. 31; Llei general de la Seguretat Social, art. 147.1; Reglament de l'IRPF, arts. 82 i 83, i algoritme de retencions 2026 de l'Agència Tributària.",
          es: "Estatuto de los Trabajadores, art. 31; Ley General de la Seguridad Social, art. 147.1; Reglamento del IRPF, arts. 82 y 83, y algoritmo de retenciones 2026 de la Agencia Tributaria.",
          en: "Workers' Statute, art. 31; General Social Security Act, art. 147.1; IRPF Regulation, arts. 82 and 83, and the Tax Agency's 2026 withholding algorithm.",
        },
        scope: "spain",
        checked: EXTRA_PAY_RULES_AS_OF,
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
        key: "unemployment-subsidy",
        calculator: true,
        href: calc("unemployment-subsidy"),
        title: { ca: "Subsidi per desocupació 2026", es: "Subsidio por desempleo 2026", en: "Unemployment subsidy (subsidio) 2026" },
        answers: {
          ca: "Et correspon el subsidi quan s'acaba l'atur o no hi arribes, quant cobraràs (570, 540, 480 €) i quants mesos? Amb l'IMV 2026.",
          es: "¿Te corresponde el subsidio al acabar el paro o si no llegas a él, cuánto cobrarás (570, 540, 480 €) y cuántos meses? Con el IMV 2026.",
          en: "Whether you qualify for the subsidy when your benefit ends or you fall short of it, how much (€570, €540, €480) and for how many months. With the 2026 IMV.",
        },
        basis: {
          ca: "Llei general de la Seguretat Social, arts. 274 a 282 i DA 57a i 58a (Reial decret llei 2/2024); Llei 19/2021 de l'IMV i Reial decret llei 3/2026.",
          es: "Ley General de la Seguridad Social, arts. 274 a 282 y DA 57ª y 58ª (Real Decreto-ley 2/2024); Ley 19/2021 del IMV y Real Decreto-ley 3/2026.",
          en: "General Social Security Act (LGSS), arts. 274 to 282 and additional provisions 57 and 58 (Royal Decree-law 2/2024); IMV Act 19/2021 and Royal Decree-law 3/2026.",
        },
        scope: "spain",
        checked: SUBSIDY_RULES_AS_OF,
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
        key: "retirement-age",
        calculator: true,
        href: calc("retirement-age"),
        title: { ca: "Edat de jubilació", es: "Edad de jubilación", en: "Retirement age" },
        answers: {
          ca: "A quina edat et pots jubilar (65 o 67), quan com a molt aviat i amb quina retallada, i quant guanyes si l'endarrereixes?",
          es: "¿A qué edad te puedes jubilar (65 o 67), cuándo como pronto y con qué recorte, y cuánto ganas si la retrasas?",
          en: "When you can retire (65 or 67), the earliest date and its cut, and what you gain by delaying.",
        },
        basis: {
          ca: "Llei general de la Seguretat Social, arts. 205, 207, 208 i 210 i disposició transitòria setena.",
          es: "Ley General de la Seguridad Social, arts. 205, 207, 208 y 210 y disposición transitoria séptima.",
          en: "General Social Security Act, arts. 205, 207, 208 and 210 and seventh transitional provision.",
        },
        scope: "spain",
        checked: RETIREMENT_AGE_AS_OF,
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
        key: "widow-pension",
        calculator: true,
        href: calc("widow-pension"),
        title: { ca: "Pensió de viduïtat", es: "Pensión de viudedad", en: "Widow's pension" },
        answers: {
          ca: "Tens dret a la pensió de viduïtat, amb quin percentatge (52, 60 o 70 %) i quant cobraràs davant del mínim del 2026?",
          es: "¿Tienes derecho a la pensión de viudedad, con qué porcentaje (52, 60 o 70 %) y cuánto cobrarás frente al mínimo de 2026?",
          en: "Whether you are entitled to a widow's pension, at what rate (52, 60 or 70%) and how much against the 2026 minimum.",
        },
        basis: {
          ca: "Llei general de la Seguretat Social, arts. 219 a 223; Decret 3158/1966, art. 31; Reial decret 900/2018; Reial decret 241/2026.",
          es: "Ley General de la Seguridad Social, arts. 219 a 223; Decreto 3158/1966, art. 31; Real Decreto 900/2018; Real Decreto 241/2026.",
          en: "General Social Security Act, arts. 219 to 223; Decreto 3158/1966, art. 31; Royal Decree 900/2018; Royal Decree 241/2026.",
        },
        scope: "spain",
        checked: WIDOW_PENSION_AS_OF,
      },
      {
        key: "non-contributory-pension",
        calculator: true,
        href: calc("non-contributory-pension"),
        title: { ca: "Pensió no contributiva", es: "Pensión no contributiva", en: "Non-contributory pension" },
        answers: {
          ca: "Tens dret a la pensió no contributiva de jubilació o d'incapacitat amb els ingressos de la teva llar, i quant cobraràs el 2026?",
          es: "¿Tienes derecho a la pensión no contributiva de jubilación o de incapacidad con los ingresos de tu hogar, y cuánto cobrarás en 2026?",
          en: "Whether you qualify for the non-contributory retirement or invalidity pension on your household's income, and how much in 2026.",
        },
        basis: {
          ca: "Llei general de la Seguretat Social, arts. 363 a 372; Reial decret 241/2026, art. 21; Reial decret 1191/2012.",
          es: "Ley General de la Seguridad Social, arts. 363 a 372; Real Decreto 241/2026, art. 21; Real Decreto 1191/2012.",
          en: "General Social Security Act, arts. 363 to 372; Royal Decree 241/2026, art. 21; Royal Decree 1191/2012.",
        },
        scope: "spain",
        checked: NC_PENSION_AS_OF,
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
        key: "zona-tensionada",
        calculator: true,
        href: calc("zona-tensionada"),
        title: { ca: "Zona tensionada: hi és el teu municipi?", es: "Zona tensionada: ¿está tu municipio?", en: "Zona tensionada: is your town in one?" },
        answers: {
          ca: "El teu municipi és zona de mercat residencial tensionat, des de quan i fins quan, qui és gran tenidor allà i què canvia en un contracte nou?",
          es: "¿Tu municipio es zona de mercado residencial tensionado, desde cuándo y hasta cuándo, quién es gran tenedor allí y qué cambia en un contrato nuevo?",
          en: "Whether your town is a declared tight housing market area, since and until when, who counts as a large landlord there and what changes on a new lease.",
        },
        basis: {
          ca: "Llistes trimestrals del Ministeri d'Habitatge al BOE (Llei 12/2023, art. 18), resolucions TER/3739/2026 i TER/3740/2026 (DOGC) i Llei d'arrendaments urbans, arts. 10.3 i 17.6-17.7.",
          es: "Listas trimestrales del Ministerio de Vivienda en el BOE (Ley 12/2023, art. 18), resoluciones TER/3739/2026 y TER/3740/2026 (DOGC) y Ley de Arrendamientos Urbanos, arts. 10.3 y 17.6-17.7.",
          en: "The Ministry of Housing's quarterly lists in the BOE (Ley 12/2023 art. 18), resolutions TER/3739/2026 and TER/3740/2026 (DOGC) and the Urban Leases Act, arts. 10.3 and 17.6-17.7.",
        },
        scope: "spain",
        checked: ZONA_TENSIONADA_AS_OF,
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
      {
        key: "home-purchase-tax",
        calculator: true,
        href: calc("home-purchase-tax"),
        title: { ca: "Impostos en comprar habitatge (ITP o IVA)", es: "Impuestos al comprar vivienda (ITP o IVA)", en: "Home purchase taxes (ITP or IVA)" },
        answers: {
          ca: "Quant pagaràs d'ITP per un pis de segona mà, o d'IVA i AJD per un de nou, a la teva comunitat i amb els tipus reduïts?",
          es: "¿Cuánto pagarás de ITP por un piso de segunda mano, o de IVA y AJD por uno nuevo, en tu comunidad y con los tipos reducidos?",
          en: "How much ITP you pay on a resale home, or IVA and AJD on a new one, in your region and with the reduced rates.",
        },
        basis: {
          ca: "Lleis de tributs cedits de cada comunitat i normes forals (BOE i butlletins), Llei de l'IVA art. 91 i text refós de l'ITPAJD (art. 29, Reial decret llei 17/2018).",
          es: "Leyes de tributos cedidos de cada comunidad y normas forales (BOE y boletines), Ley del IVA art. 91 y texto refundido del ITPAJD (art. 29, Real Decreto-ley 17/2018).",
          en: "Each region's law on ceded taxes and the foral norms (BOE and bulletins), VAT Act art. 91 and the ITPAJD consolidated act (art. 29, Royal Decree-law 17/2018).",
        },
        scope: "spain",
        checked: HOME_TAX_AS_OF,
      },
      {
        key: "home-purchase-costs",
        calculator: true,
        href: calc("home-purchase-costs"),
        title: { ca: "Despeses de compravenda: notaria i Registre", es: "Gastos de compraventa: notaría y Registro", en: "Home buying costs: notary and Land Registry" },
        answers: {
          ca: "Quant costen la notaria i el Registre en comprar un habitatge, amb l'IVA i els impostos, i qui paga cada despesa?",
          es: "¿Cuánto cuestan la notaría y el Registro al comprar una vivienda, con el IVA y los impuestos, y quién paga cada gasto?",
          en: "What the notary and the Land Registry cost when you buy a home, with VAT and taxes, and who pays each cost.",
        },
        basis: {
          ca: "Aranzels dels notaris i registradors (Reials decrets 1426/1989 i 1427/1989, BOE), Reial decret llei 6/2000, Llei 41/1980 art. 8, Codi civil espanyol art. 1455 i Llei 5/2019 art. 14.",
          es: "Aranceles de notarios y registradores (Reales Decretos 1426/1989 y 1427/1989, BOE), Real Decreto-ley 6/2000, Ley 41/1980 art. 8, Código Civil art. 1455 y Ley 5/2019 art. 14.",
          en: "The notaries' and registrars' scales (Royal Decrees 1426/1989 and 1427/1989, BOE), Royal Decree-law 6/2000, Ley 41/1980 art. 8, Civil Code art. 1455 and Ley 5/2019 art. 14.",
        },
        scope: "spain",
        checked: PURCHASE_COSTS_AS_OF,
      },
      {
        key: "plusvalia",
        calculator: true,
        href: calc("plusvalia"),
        title: { ca: "Plusvàlua municipal 2026", es: "Plusvalía municipal 2026", en: "Plusvalía municipal tax 2026" },
        answers: {
          ca: "Quant pagaràs de plusvàlua en vendre, heretar o donar un pis, pel mètode objectiu i pel real, i quan no es paga?",
          es: "¿Cuánto pagarás de plusvalía al vender, heredar o donar un piso, por el método objetivo y por el real, y cuándo no se paga?",
          en: "How much plusvalía you pay when you sell, inherit or give away a flat, by the objective and the real-gain methods, and when nothing is due.",
        },
        basis: {
          ca: "Text refós de la Llei reguladora de les hisendes locals, arts. 104 a 110 (Reial decret llei 26/2021); coeficients del Reial decret llei 8/2023 i, des de l'1 de desembre de 2026, del 29/2026; tipus del teu ajuntament.",
          es: "Texto refundido de la Ley Reguladora de las Haciendas Locales, arts. 104 a 110 (Real Decreto-ley 26/2021); coeficientes del Real Decreto-ley 8/2023 y, desde el 1 de diciembre de 2026, del 29/2026; tipo de tu ayuntamiento.",
          en: "Consolidated Local Finance Act, arts. 104 to 110 (Royal Decree-law 26/2021); coefficients of Royal Decree-law 8/2023 and, from 1 December 2026, 29/2026; your council's rate.",
        },
        scope: "spain",
        checked: PLUSVALIA_AS_OF,
      },
    ],
  },
  {
    // Inheritance and gift tax by community: an inheritance pays where the deceased lived, a gift where the property is or the donee lives (Ley 22/2009 arts. 28 and 32).
    id: "taxes",
    title: { ca: "Impost de successions i donacions per comunitat", es: "Impuesto de sucesiones y donaciones por comunidad", en: "Inheritance and gift tax by region" },
    intro: {
      ca: "Cada comunitat té les seves reduccions, tarifa i bonificacions. Una herència paga amb les de la comunitat on la persona morta va viure més dies dels últims cinc anys; una donació, amb les de la comunitat on és l'immoble o, si són diners o altres béns, on viu qui la rep. Calculadores per a aquestes quatre comunitats, amb els articles de la seva llei:",
      es: "Cada comunidad tiene sus reducciones, tarifa y bonificaciones. Una herencia paga con las de la comunidad donde la persona fallecida vivió más días de los últimos cinco años; una donación, con las de la comunidad donde está el inmueble o, si es dinero u otros bienes, donde vive quien la recibe. Calculadoras para estas cuatro comunidades, con los artículos de su ley:",
      en: "Each region has its own reductions, scale and rebates. An inheritance pays under those of the region where the deceased lived the most days of the last five years; a gift, under those of the region where the property is or, for money and other assets, where the donee lives. Calculators for these four regions, with the articles of each law:",
    },
    cards: [
      {
        key: "inheritance-tax",
        calculator: true,
        href: calc("inheritance-tax"),
        title: { ca: "Impost de successions a Catalunya", es: "Impuesto de sucesiones en Cataluña", en: "Catalonia inheritance tax" },
        answers: {
          ca: "Quant pagaràs per una herència a Catalunya segons el parentiu, l'edat i el que reps, amb l'habitatge i l'assegurança de vida?",
          es: "¿Cuánto pagarás por una herencia en Cataluña según el parentesco, la edad y lo que recibes, con la vivienda y el seguro de vida?",
          en: "How much tax you pay on an inheritance in Catalonia by relationship, age and what you receive, with the home and life insurance.",
        },
        basis: {
          ca: "Codi tributari de Catalunya, llibre sisè (Decret legislatiu 1/2024), arts. 631-2 a 633-4, i els exemples de l'Agència Tributària de Catalunya.",
          es: "Código tributario de Cataluña, libro sexto (Decreto legislativo 1/2024), arts. 631-2 a 633-4, y los ejemplos de la Agència Tributària de Catalunya.",
          en: "Catalan Tax Code, book six (Legislative Decree 1/2024), arts. 631-2 to 633-4, and the Catalan Tax Agency's worked examples.",
        },
        scope: "catalonia",
        checked: INHERITANCE_TAX_AS_OF,
      },
      {
        key: "inheritance-tax-madrid",
        calculator: true,
        href: calc("inheritance-tax-madrid"),
        title: { ca: "Impost de successions a Madrid", es: "Impuesto de sucesiones en Madrid", en: "Madrid inheritance tax" },
        answers: {
          ca: "Quant pagaràs per una herència a la Comunitat de Madrid, amb la bonificació del 99 % de fills, cònjuge i pares o la del 50 % de germans i nebots?",
          es: "¿Cuánto pagarás por una herencia en la Comunidad de Madrid, con la bonificación del 99 % de hijos, cónyuge y padres o la del 50 % de hermanos y sobrinos?",
          en: "How much tax you pay on an inheritance in the Madrid region, with the 99% rebate for children, spouses and parents or the 50% one for siblings and nephews.",
        },
        basis: {
          ca: "Decret legislatiu 1/2010 de la Comunitat de Madrid, arts. 21 a 26 (text consolidat del BOE), i Llei 29/1987 de l'impost sobre successions.",
          es: "Decreto Legislativo 1/2010 de la Comunidad de Madrid, arts. 21 a 26 (texto consolidado del BOE), y Ley 29/1987 del Impuesto sobre Sucesiones.",
          en: "Madrid Legislative Decree 1/2010, arts. 21 to 26 (BOE consolidated text), and the Inheritance and Gift Tax Act (Law 29/1987).",
        },
        scope: "madrid",
        checked: REGIONAL_ISD_AS_OF,
      },
      {
        key: "inheritance-tax-andalucia",
        calculator: true,
        href: calc("inheritance-tax-andalucia"),
        title: { ca: "Impost de successions a Andalusia", es: "Impuesto de sucesiones en Andalucía", en: "Andalusia inheritance tax" },
        answers: {
          ca: "Quant pagaràs per una herència a Andalusia, amb la reducció d'1.000.000 € i la bonificació del 99 % de fills, cònjuge i pares?",
          es: "¿Cuánto pagarás por una herencia en Andalucía, con la reducción de 1.000.000 € y la bonificación del 99 % de hijos, cónyuge y padres?",
          en: "How much tax you pay on an inheritance in Andalusia, with the €1,000,000 reduction and the 99% rebate for children, spouses and parents.",
        },
        basis: {
          ca: "Llei 5/2021 de tributs cedits d'Andalusia, arts. 26 a 29 i 37 a 39 (text consolidat del BOE), i Llei 29/1987 de l'impost sobre successions.",
          es: "Ley 5/2021 de Tributos Cedidos de Andalucía, arts. 26 a 29 y 37 a 39 (texto consolidado del BOE), y Ley 29/1987 del Impuesto sobre Sucesiones.",
          en: "Andalusian Ceded Taxes Act (Law 5/2021), arts. 26 to 29 and 37 to 39 (BOE consolidated text), and the Inheritance and Gift Tax Act (Law 29/1987).",
        },
        scope: "andalucia",
        checked: REGIONAL_ISD_AS_OF,
      },
      {
        key: "inheritance-tax-valencia",
        calculator: true,
        href: calc("inheritance-tax-valencia"),
        title: { ca: "Impost de successions a la Comunitat Valenciana", es: "Impuesto de sucesiones en la Comunidad Valenciana", en: "Valencia region inheritance tax" },
        answers: {
          ca: "Quant pagaràs per una herència a la Comunitat Valenciana, amb la bonificació del 99 % de fills, cònjuge i pares o la del 25 % de germans i nebots de sang?",
          es: "¿Cuánto pagarás por una herencia en la Comunidad Valenciana, con la bonificación del 99 % de hijos, cónyuge y padres o la del 25 % de hermanos y sobrinos de sangre?",
          en: "How much tax you pay on an inheritance in the Valencia region, with the 99% rebate for children, spouses and parents or the 25% one for blood siblings and nephews.",
        },
        basis: {
          ca: "Llei valenciana 13/1997, arts. 10 a 12 quàter (text consolidat del BOE), i Llei 29/1987 de l'impost sobre successions.",
          es: "Ley valenciana 13/1997, arts. 10 a 12 quáter (texto consolidado del BOE), y Ley 29/1987 del Impuesto sobre Sucesiones.",
          en: "Valencian Law 13/1997, arts. 10 to 12 quáter (BOE consolidated text), and the Inheritance and Gift Tax Act (Law 29/1987).",
        },
        scope: "valencia",
        checked: REGIONAL_ISD_AS_OF,
      },
      {
        key: "gift-tax-catalonia",
        calculator: true,
        href: calc("gift-tax-catalonia"),
        title: { ca: "Impost de donacions a Catalunya", es: "Impuesto de donaciones en Cataluña", en: "Catalonia gift tax" },
        answers: {
          ca: "Quant pagaràs per una donació de pares a fills a Catalunya, amb la tarifa reduïda en escriptura pública i la reducció per al primer habitatge?",
          es: "¿Cuánto pagarás por una donación de padres a hijos en Cataluña, con la tarifa reducida en escritura pública y la reducción por la primera vivienda?",
          en: "How much tax you pay on a gift from parents to children in Catalonia, with the reduced scale in a public deed and the first-home reduction.",
        },
        basis: {
          ca: "Codi tributari de Catalunya, llibre sisè (Decret legislatiu 1/2024), arts. 632-20, 632-21 i 633-1 a 633-3, i els exemples de l'Agència Tributària de Catalunya.",
          es: "Código tributario de Cataluña, libro sexto (Decreto legislativo 1/2024), arts. 632-20, 632-21 y 633-1 a 633-3, y los ejemplos de la Agència Tributària de Catalunya.",
          en: "Catalan Tax Code, book six (Legislative Decree 1/2024), arts. 632-20, 632-21 and 633-1 to 633-3, and the Catalan Tax Agency's worked examples.",
        },
        scope: "catalonia",
        checked: GIFT_TAX_AS_OF,
      },
      {
        key: "gift-tax-madrid",
        calculator: true,
        href: calc("gift-tax-madrid"),
        title: { ca: "Impost de donacions a Madrid", es: "Impuesto de donaciones en Madrid", en: "Madrid gift tax" },
        answers: {
          ca: "Quant pagaràs per una donació a la Comunitat de Madrid, amb la bonificació del 99 % de pares a fills, la del 50 % de germans i nebots i la reducció per diners per a l'habitatge?",
          es: "¿Cuánto pagarás por una donación en la Comunidad de Madrid, con la bonificación del 99 % de padres a hijos, la del 50 % de hermanos y sobrinos y la reducción por dinero para la vivienda?",
          en: "How much tax you pay on a gift in the Madrid region, with the 99% rebate from parents to children, the 50% one for siblings and nephews and the cash-for-home reduction.",
        },
        basis: {
          ca: "Decret legislatiu 1/2010 de la Comunitat de Madrid, arts. 22 bis a 26 (text consolidat del BOE), i Llei 29/1987 de l'impost sobre successions i donacions.",
          es: "Decreto Legislativo 1/2010 de la Comunidad de Madrid, arts. 22 bis a 26 (texto consolidado del BOE), y Ley 29/1987 del Impuesto sobre Sucesiones y Donaciones.",
          en: "Madrid Legislative Decree 1/2010, arts. 22 bis to 26 (BOE consolidated text), and the Inheritance and Gift Tax Act (Law 29/1987).",
        },
        scope: "madrid",
        checked: GIFT_TAX_AS_OF,
      },
      {
        key: "gift-tax-andalucia",
        calculator: true,
        href: calc("gift-tax-andalucia"),
        title: { ca: "Impost de donacions a Andalusia", es: "Impuesto de donaciones en Andalucía", en: "Andalusia gift tax" },
        answers: {
          ca: "Quant pagaràs per una donació a Andalusia, amb la bonificació del 99 % de pares a fills i la reducció per a l'habitatge habitual dels menors de 35 anys?",
          es: "¿Cuánto pagarás por una donación en Andalucía, con la bonificación del 99 % de padres a hijos y la reducción por la vivienda habitual de los menores de 35 años?",
          en: "How much tax you pay on a gift in Andalusia, with the 99% rebate from parents to children and the habitual-home reduction for donees under 35.",
        },
        basis: {
          ca: "Llei 5/2021 de tributs cedits d'Andalusia, arts. 32 a 40 i 68 (text consolidat del BOE), i Llei 29/1987 de l'impost sobre successions i donacions.",
          es: "Ley 5/2021 de Tributos Cedidos de Andalucía, arts. 32 a 40 y 68 (texto consolidado del BOE), y Ley 29/1987 del Impuesto sobre Sucesiones y Donaciones.",
          en: "Andalusian Ceded Taxes Act (Law 5/2021), arts. 32 to 40 and 68 (BOE consolidated text), and the Inheritance and Gift Tax Act (Law 29/1987).",
        },
        scope: "andalucia",
        checked: GIFT_TAX_AS_OF,
      },
      {
        key: "gift-tax-valencia",
        calculator: true,
        href: calc("gift-tax-valencia"),
        title: { ca: "Impost de donacions a la Comunitat Valenciana", es: "Impuesto de donaciones en la Comunidad Valenciana", en: "Valencia region gift tax" },
        answers: {
          ca: "Quant pagaràs per una donació a la Comunitat Valenciana, amb la reducció de 100.000 € i la bonificació del 99 % de pares a fills, o la del 25 % de germans i nebots de sang?",
          es: "¿Cuánto pagarás por una donación en la Comunidad Valenciana, con la reducción de 100.000 € y la bonificación del 99 % de padres a hijos, o la del 25 % de hermanos y sobrinos de sangre?",
          en: "How much tax you pay on a gift in the Valencia region, with the €100,000 reduction and the 99% rebate from parents to children, or the 25% one for blood siblings and nephews.",
        },
        basis: {
          ca: "Llei valenciana 13/1997, arts. 10 bis a 12 quàter (text consolidat del BOE), i Llei 29/1987 de l'impost sobre successions i donacions.",
          es: "Ley valenciana 13/1997, arts. 10 bis a 12 quáter (texto consolidado del BOE), y Ley 29/1987 del Impuesto sobre Sucesiones y Donaciones.",
          en: "Valencian Law 13/1997, arts. 10 bis to 12 quáter (BOE consolidated text), and the Inheritance and Gift Tax Act (Law 29/1987).",
        },
        scope: "valencia",
        checked: GIFT_TAX_AS_OF,
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
        key: "iprem",
        calculator: true,
        href: calc("iprem"),
        title: { ca: `IPREM ${IPREM_YEAR}`, es: `IPREM ${IPREM_YEAR}`, en: `IPREM ${IPREM_YEAR} (Spain)` },
        answers: {
          ca: "Quant és l'IPREM al mes, a l'any en 12 i en 14 pagues, quant són 1,5 o 2 vegades l'IPREM i quantes vegades l'IPREM són els teus ingressos?",
          es: "¿Cuánto es el IPREM al mes, al año en 12 y en 14 pagas, cuánto son 1,5 o 2 veces el IPREM y cuántas veces el IPREM son tus ingresos?",
          en: "How much is the IPREM a month and a year in 12 or 14 payments, what are 1.5 or 2 times the IPREM, and how many times the IPREM is your income?",
        },
        basis: {
          ca: "Llei 31/2022 de pressupostos per al 2023, disposició addicional norantena (prorrogada), Reial decret llei 3/2004 i les lleis de pressupostos des del 2005 (BOE), i les quanties anuals del SEPE.",
          es: "Ley 31/2022 de Presupuestos para 2023, disposición adicional nonagésima (prorrogada), Real Decreto-ley 3/2004 y las leyes de presupuestos desde 2005 (BOE), y las cuantías anuales del SEPE.",
          en: "Law 31/2022, the 2023 budget act, additional provision 90 (extended), Royal Decree-law 3/2004 and the budget acts since 2005 (BOE), and SEPE's yearly amounts.",
        },
        scope: "spain",
        checked: IPREM_RULES_AS_OF,
      },
      {
        key: "average-salary",
        calculator: true,
        href: calc("average-salary"),
        title: { ca: "Salari mitjà a Espanya", es: "Salario medio en España", en: "Average salary in Spain" },
        answers: {
          ca: "Quant es cobra de mitjana i de mediana per comunitat, edat, sexe i sector, i en quin decil és el teu sou?",
          es: "¿Cuánto se cobra de media y de mediana por comunidad, edad, sexo y sector, y en qué decil está tu sueldo?",
          en: "What people earn (mean and median) by region, age, sex and sector, and which decile your salary is in.",
        },
        basis: {
          ca: "Enquesta Anual d'Estructura Salarial de l'INE (taules 28191, 28201, 28192, 28193, 28189, 28185, 28186, 28187) i decils de salaris de l'EPA (taules 66252, 66237).",
          es: "Encuesta Anual de Estructura Salarial del INE (tablas 28191, 28201, 28192, 28193, 28189, 28185, 28186, 28187) y deciles de salarios de la EPA (tablas 66252, 66237).",
          en: "The INE's Annual Wage Structure Survey (tables 28191, 28201, 28192, 28193, 28189, 28185, 28186, 28187) and EPA wage deciles (tables 66252, 66237).",
        },
        scope: "spain",
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
    id: "lottery",
    title: { ca: "Loteria i premis", es: "Lotería y premios", en: "Lottery prizes" },
    cards: [
      {
        key: "lottery-tax",
        calculator: true,
        href: calc("lottery-tax"),
        title: { ca: "Premis de loteria i Hisenda", es: "Premios de lotería y Hacienda", en: "Lottery prize tax" },
        answers: {
          ca: "Quant se'n queda Hisenda del Gordo, d'un dècim compartit o d'una participació, i quant cobres de La Grossa?",
          es: "¿Cuánto se queda Hacienda del Gordo, de un décimo compartido o de una participación, y cuánto cobras de La Grossa?",
          en: "How much tax is taken from El Gordo, a shared décimo or a participación, and what you keep from La Grossa.",
        },
        basis: {
          ca: "Llei 35/2006 de l'IRPF, disposició addicional 33a (BOE), notes de l'Agència Tributària, programa de premis de SELAE i DOGC núm. 9640 (La Grossa).",
          es: "Ley 35/2006 del IRPF, disposición adicional 33.ª (BOE), notas de la Agencia Tributaria, programa de premios de SELAE y DOGC núm. 9640 (La Grossa).",
          en: "Law 35/2006 on income tax, additional provision 33 (BOE), Agencia Tributaria notes, SELAE's prize programme and DOGC no. 9640 (La Grossa).",
        },
        scope: "spain",
        checked: LOTTERY_TAX_AS_OF,
      },
      {
        // The number checker (lib/programmatic/lottery-check): live on the draw day, on SELAE's own numbers.
        key: "lottery-check",
        calculator: false,
        href: lotteryCheckEditions(),
        title: { ca: "Comprovar la Loteria de Nadal", es: "Comprobar Lotería de Navidad", en: "Check your Christmas Lottery ticket" },
        answers: {
          ca: "Té premi el teu dècim de la Loteria de Nadal i quant en cobraràs després d'Hisenda? Amb els números de SELAE el dia del sorteig.",
          es: "¿Tiene premio tu décimo de la Lotería de Navidad y cuánto cobrarás tras Hacienda? Con los números de SELAE el día del sorteo.",
          en: "Has your Spanish Christmas Lottery décimo won, and what do you keep after tax? On SELAE's numbers, on the draw day.",
        },
        basis: {
          ca: "Números i Llista Oficial de Premis de SELAE el dia del sorteig, programa de premis de SELAE i Llei 35/2006 de l'IRPF, disposició addicional 33a (BOE).",
          es: "Números y Lista Oficial de Premios de SELAE el día del sorteo, programa de premios de SELAE y Ley 35/2006 del IRPF, disposición adicional 33.ª (BOE).",
          en: "SELAE's numbers and Lista Oficial de Premios on the draw day, SELAE's prize programme and Law 35/2006 on income tax, additional provision 33 (BOE).",
        },
        scope: "spain",
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
      {
        key: "traffic-fines",
        calculator: true,
        href: calc("traffic-fines"),
        title: { ca: "Multes de trànsit: terminis i 50 %", es: "Multas de tráfico: plazos y 50 %", en: "Traffic fines: deadlines and 50% off" },
        answers: {
          ca: "Fins a quin dia pots pagar la multa amb el 50 %, al·legar o recórrer, quines no tenen descompte i què passa si no la pagues?",
          es: "¿Hasta qué día puedes pagar la multa con el 50 %, alegar o recurrir, cuáles no tienen descuento y qué pasa si no la pagas?",
          en: "The last day to pay a fine with 50% off, contest or appeal it, which fines get no discount and what happens if you don't pay.",
        },
        basis: {
          ca: "Llei de trànsit (Reial decret legislatiu 6/2015), arts. 63-65, 90-96, 110 i 112 i annexos II i IV; Llei 39/2015, art. 30; Llei general tributària, arts. 28 i 62 (BOE); DGT i Servei Català de Trànsit.",
          es: "Ley de Tráfico (Real Decreto Legislativo 6/2015), arts. 63-65, 90-96, 110 y 112 y anexos II y IV; Ley 39/2015, art. 30; Ley General Tributaria, arts. 28 y 62 (BOE); DGT y Servei Català de Trànsit.",
          en: "Traffic Act (Royal Legislative Decree 6/2015), arts. 63-65, 90-96, 110 and 112 and annexes II and IV; Ley 39/2015, art. 30; General Tax Act, arts. 28 and 62 (BOE); DGT and Servei Català de Trànsit.",
        },
        scope: "spain",
        checked: TRAFFIC_FINES_AS_OF,
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
    // Energy at home: the bono social checker, right before the live group that opens with the PVPC and butane prices.
    id: "energy",
    title: { ca: "Llum i energia a casa", es: "Luz y energía en casa", en: "Electricity and energy at home" },
    cards: [
      {
        key: "bono-social",
        calculator: true,
        href: calc("bono-social"),
        title: { ca: "Bo social elèctric 2026", es: "Bono social eléctrico 2026", en: "Bono social for electricity 2026" },
        answers: {
          ca: "Tens dret al bo social, ets vulnerable o vulnerable sever, quin descompte et toca (42,5 % o 57,5 % fins al 31 de desembre de 2026) i fins a quants kWh?",
          es: "¿Tienes derecho al bono social, eres vulnerable o vulnerable severo, qué descuento te toca (42,5 % o 57,5 % hasta el 31 de diciembre de 2026) y hasta cuántos kWh?",
          en: "Whether you qualify for the bono social, as vulnerable or severely vulnerable, your discount (42.5% or 57.5% until 31 December 2026) and for how many kWh.",
        },
        basis: {
          ca: "Reial decret 897/2017, arts. 3, 4 i 6 i annex I; Reial decret llei 7/2026, art. 1; Ordre ETU/943/2017; IPREM de la Llei 31/2022 (BOE); Ministeri per a la Transició Ecològica.",
          es: "Real Decreto 897/2017, arts. 3, 4 y 6 y anexo I; Real Decreto-ley 7/2026, art. 1; Orden ETU/943/2017; IPREM de la Ley 31/2022 (BOE); Ministerio para la Transición Ecológica.",
          en: "Royal Decree 897/2017, arts. 3, 4 and 6 and Annex I; Royal Decree-law 7/2026, art. 1; Orden ETU/943/2017; IPREM from Law 31/2022 (BOE); Ministry for the Ecological Transition.",
        },
        scope: "spain",
        checked: BONO_SOCIAL_AS_OF,
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
      {
        key: "warnings",
        calculator: false,
        href: warningsTranslations(),
        title: { ca: "Avisos ara a Catalunya", es: "Avisos hoy en Cataluña", en: "Warnings in Catalonia now" },
        answers: {
          ca: "Hi ha avisos de l'AEMET, plans de Protecció Civil activats o carreteres tallades ara mateix?",
          es: "¿Hay avisos de la AEMET, planes de Protección Civil activados o carreteras cortadas ahora mismo?",
          en: "Any AEMET weather warnings, Civil Protection plans or closed roads right now?",
        },
        basis: {
          ca: "AEMET (Meteoalerta), dades obertes de Protecció Civil i del Servei Català de Trànsit.",
          es: "AEMET (Meteoalerta), datos abiertos de Protecció Civil y del Servei Català de Trànsit.",
          en: "AEMET (Meteoalerta), Protecció Civil and Servei Català de Trànsit open data.",
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
  /** "How we build them": the method in two sentences, then the editorial policy's full section. */
  methodHeading: string;
  method: string;
  methodLink: string;
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
    methodHeading: "Cómo hacemos las calculadoras",
    method:
      "Cada calculadora aplica la norma general tal como la publica el BOE o el boletín autonómico, cita el artículo o la tabla que usa con la fecha en que se leyó y dice qué casos no cubre. Las reglas que cambian cada año tienen fecha de caducidad en el código: una prueba automática avisa cuando toca volver a leerlas.",
    methodLink: "El método completo, en la política editorial",
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
    methodHeading: "Com fem les calculadores",
    method:
      "Cada calculadora aplica la norma general tal com la publica el BOE o el butlletí autonòmic, cita l'article o la taula que fa servir amb la data en què es va llegir i diu quins casos no cobreix. Les regles que canvien cada any tenen data de caducitat al codi: una prova automàtica avisa quan toca tornar-les a llegir.",
    methodLink: "El mètode complet, a la política editorial",
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
    methodHeading: "How we build the calculators",
    method:
      "Each calculator applies the general rule as the BOE or the regional bulletin publishes it, cites the article or table it uses with the date it was read, and says which cases it does not cover. Rules that change every year carry an expiry date in the code: an automated test flags when they are due to be read again.",
    methodLink: "The full method, in our editorial policy",
  },
};

/** The hub's breadcrumb, second on every calculator page (Home › Calculadoras › tool). */
export function hubCrumb(locale: CalcLocale): { label: string; href: string } {
  return { label: HUB_COPY[locale].label, href: calculatorsHubPath(locale) };
}
