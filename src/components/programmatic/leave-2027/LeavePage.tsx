import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LOCAL_ORDERS } from "@/lib/content/batch02/bridges-2027";
import { getMessages } from "@/lib/i18n";
import { widgetPagePath } from "@/lib/programmatic/embed-2027/places";
import { BOE_2027 } from "@/lib/programmatic/holidays/boe-2027";
import { SNAPSHOT, councilApprovedTowns, municipalities, nextYearPublished, regionalDays } from "@/lib/programmatic/holidays/data";
import { dayMonthYear, weekdayDayMonth } from "@/lib/programmatic/holidays/format";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import { joinList } from "@/lib/programmatic/holidays/names";
import { hubPath } from "@/lib/programmatic/holidays/paths";
import {
  DEFAULT_LEAVE,
  DEFAULT_PLACE,
  LEAVE_YEAR,
  MIN_GAP_WORDS,
  PLANNER_COPY,
  leaveEditions,
  leavePath,
  rangeText,
  ratioText,
  type LeaveLocale,
} from "@/lib/programmatic/leave-2027/copy";
import { planLeave } from "@/lib/programmatic/leave-2027/optimizer";
import { plannerData } from "@/lib/programmatic/leave-2027/places";
import { HUB } from "@/lib/programmatic/spain-2027/copy";
import { HUB_INTL } from "@/lib/programmatic/spain-2027/copy-intl";
import { CITIES } from "@/lib/programmatic/spain-2027/cities";
import { editionBridgesPath, editionHubPath } from "@/lib/programmatic/spain-2027/editions";
import { spainBridgesPath, spainHubPath } from "@/lib/programmatic/spain-2027/paths";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { LeavePlanner } from "./LeavePlanner";

/**
 * "Com aprofitar les vacances el 2027" / "Cómo aprovechar los festivos 2027"
 * / "2027 leave planner": the planner (`LeavePlanner`, server-rendered for
 * Barcelona and 5 days), then what the reader needs to trust it: the plan for
 * Catalonia-wide days at several budgets, the rules, which holidays count and
 * where they come from. Every figure is computed at build time from the
 * holiday modules; no date is typed here.
 *
 * It complements the long weekends guides (one bridge per holiday, the same
 * for everyone) with the reader's own town and budget, and links to them.
 */

const L = <T,>(locale: LeaveLocale, v: Record<LeaveLocale, T>): T => v[locale];

const YEAR = LEAVE_YEAR;
const CATALONIA = regionalDays(YEAR).map((d) => d.date);
/** The budgets of the Catalonia-wide table. */
export const TABLE_BUDGETS = [1, 2, 3, 4, 5, 7, 10, 15, 20, 25] as const;

function weekend(iso: string): boolean {
  const w = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return w === 0 || w === 6;
}

export const LEAVE_META: Record<LeaveLocale, { title: string; description: string; h1: string; breadcrumb: string }> = {
  ca: {
    title: `Com aprofitar les vacances el ${YEAR}: calculadora de ponts`,
    description: `Tria el teu municipi i quants dies de vacances tens: et diem quins dies demanar el ${YEAR} per fer més dies de festa seguits, amb els festius oficials.`,
    h1: `Com aprofitar les vacances el ${YEAR}`,
    breadcrumb: "Com aprofitar les vacances",
  },
  es: {
    title: `Cómo aprovechar los festivos ${YEAR}: calculadora de puentes`,
    description: `Elige tu municipio y cuántos días de vacaciones tienes: te decimos qué días pedir en ${YEAR} para encadenar más días de fiesta, con los festivos oficiales.`,
    h1: `Cómo aprovechar los festivos y las vacaciones en ${YEAR}`,
    breadcrumb: "Cómo aprovechar los festivos",
  },
  en: {
    title: `${YEAR} leave planner: make the most of Spain's holidays`,
    description: `Pick your town in Catalonia or a Spanish city and your days of leave: which working days to book in ${YEAR} for the longest runs of days off.`,
    h1: `How to make the most of your leave in ${YEAR}`,
    breadcrumb: "Leave planner",
  },
};

function spainHub(locale: LeaveLocale): { href: string; label: string } {
  return locale === "es" ? { href: spainHubPath(), label: HUB.breadcrumb } : { href: editionHubPath(locale), label: HUB_INTL[locale].breadcrumb };
}

export function leaveCrumbs(locale: LeaveLocale): Crumb[] {
  const hub = spainHub(locale);
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: hub.label, href: hub.href },
    { label: LEAVE_META[locale].breadcrumb, href: leavePath(locale) },
  ];
}

export function leaveMetadata(locale: LeaveLocale): Metadata {
  const m = LEAVE_META[locale];
  return buildMetadata({ locale, path: leavePath(locale), title: m.title, description: m.description, translations: leaveEditions() });
}

/** The figures the page's words use, computed once per render from the Catalonia-wide days. */
function figures() {
  const rows = TABLE_BUDGETS.map((leave) => ({ leave, plan: planLeave({ year: YEAR, holidays: CATALONIA, leave }) }));
  const five = rows.find((r) => r.leave === DEFAULT_LEAVE)!.plan;
  const best = rows[0]!.plan.breaks[0] ?? null;
  const weekendDays = CATALONIA.filter(weekend);
  const towns = municipalities().length;
  const council = councilApprovedTowns().length;
  const published = CITIES.filter((c) => c.status2027 === "published").length;
  return { rows, five, best, weekendDays, towns, council, published, cities: CITIES.length };
}

const BRIDGES_LABEL: Record<LeaveLocale, string> = {
  ca: `Ponts ${YEAR} a Catalunya`,
  es: `Puentes ${YEAR} en Cataluña`,
  en: `Long weekends ${YEAR} in Catalonia`,
};

export function LeaveRoute({ locale }: { locale: LeaveLocale }) {
  const meta = LEAVE_META[locale];
  const crumbs = leaveCrumbs(locale);
  const f = figures();
  const data = plannerData(locale);
  const dogc = nextYearPublished();
  const lastOrders = LOCAL_ORDERS.map((o) => dayMonthYear(o.dogcDate, locale));
  const regional = SNAPSHOT.sources.regional[String(YEAR)];
  const spainBridges = locale === "es" ? spainBridgesPath() : editionBridgesPath(locale);
  const t = PLANNER_COPY[locale];
  const bestLine = f.best ? `${rangeText(f.best.from, f.best.to, locale)} (${f.best.days})` : "";
  const weekendList = joinList(
    f.weekendDays.map((d) => weekdayDayMonth(d, locale)),
    locale,
  );

  const lead = L(locale, {
    ca: `Amb els festius de tot Catalunya, ${DEFAULT_LEAVE} dies de vacances ben posats donen ${f.five.daysOff} dies de festa seguits el ${YEAR}, repartits en ${f.five.breaks.length} ponts. Tria el teu municipi o una ciutat d'Espanya i els dies que tens: et diem quins dies laborables demanar.`,
    es: `Con los festivos de toda Cataluña, ${DEFAULT_LEAVE} días de vacaciones bien colocados dan ${f.five.daysOff} días de fiesta seguidos en ${YEAR}, repartidos en ${f.five.breaks.length} puentes. Elige tu municipio o una ciudad de España y los días que tienes: te decimos qué días laborables pedir.`,
    en: `With the Catalonia-wide holidays, ${DEFAULT_LEAVE} days of leave in the right places give ${f.five.daysOff} days off in a row in ${YEAR}, across ${f.five.breaks.length} breaks. Pick your town or a Spanish city and the leave you have: we tell you which working days to book.`,
  });

  const tableCaption = L(locale, {
    ca: `El millor pla del ${YEAR} amb els ${CATALONIA.length} festius de tot Catalunya, sense festes locals, setmana de dilluns a divendres`,
    es: `El mejor plan de ${YEAR} con los ${CATALONIA.length} festivos de toda Cataluña, sin fiestas locales, semana de lunes a viernes`,
    en: `The best ${YEAR} plan with Catalonia's ${CATALONIA.length} region-wide holidays, no local holidays, Monday-to-Friday week`,
  });
  const cols = L(locale, {
    ca: ["Dies de vacances", "Dies de festa seguits", "Per dia de vacances", "Ponts"],
    es: ["Días de vacaciones", "Días de fiesta seguidos", "Por día de vacaciones", "Puentes"],
    en: ["Days of leave", "Days off in a row", "Per day of leave", "Breaks"],
  });

  const rules = L(locale, {
    ca: [
      "La setmana és de dilluns a divendres: dissabte i diumenge ja són festa. Si treballes els dissabtes, marca la casella i el dissabte passa a ser laborable.",
      "Només es demanen dies laborables: mai un festiu ni un cap de setmana.",
      "Cada pont es fa al voltant d'un festiu que cau en dia laborable. Un festiu en dissabte no afegeix cap dia en una setmana de dilluns a divendres.",
      `Entre dos ponts hi ha d'haver almenys ${MIN_GAP_WORDS.ca} laborables: tornar a la feina un sol dimarts entre dos ponts suma dies sobre el paper, però ningú ho fa. En aquest cas, el càlcul els ajunta o en tria un.`,
      "Guanya el pla que suma més dies de festa seguits. Si n'hi ha dos d'iguals, el que demana menys dies, després el que té el pont més llarg i després el que cau abans.",
      "La llista ordena els ponts pel que rendeixen: dies de festa per cada dia de vacances.",
      `A banda, et diem el bloc més llarg que pots fer amb els mateixos dies, festiu o no. Un pont que s'allarga fins al ${YEAR + 1} només hi compta el cap de setmana: els festius del ${YEAR + 1} encara no hi són.`,
    ],
    es: [
      "La semana es de lunes a viernes: sábado y domingo ya son fiesta. Si trabajas los sábados, marca la casilla y el sábado pasa a ser laborable.",
      "Solo se piden días laborables: nunca un festivo ni un fin de semana.",
      "Cada puente se hace alrededor de un festivo que cae en día laborable. Un festivo en sábado no suma ningún día en una semana de lunes a viernes.",
      `Entre dos puentes tiene que haber al menos ${MIN_GAP_WORDS.es} laborables: volver al trabajo un solo martes entre dos puentes suma días sobre el papel, pero nadie lo hace. En ese caso, el cálculo los junta o elige uno.`,
      "Gana el plan que suma más días de fiesta seguidos. Si hay dos iguales, el que pide menos días, después el que tiene el puente más largo y después el que cae antes.",
      "La lista ordena los puentes por lo que rinden: días de fiesta por cada día de vacaciones.",
      `Aparte, te decimos el bloque más largo que puedes hacer con los mismos días, haya festivo o no. Un puente que llega a ${YEAR + 1} solo cuenta el fin de semana: los festivos de ${YEAR + 1} aún no están.`,
    ],
    en: [
      "The week runs Monday to Friday: Saturday and Sunday are already off. If you work Saturdays, tick the box and Saturday becomes a working day.",
      "Only working days are booked: never a holiday or a weekend day.",
      "Every break is built around a holiday that falls on a working day. A holiday on a Saturday adds nothing to a Monday-to-Friday week.",
      `Two breaks are at least ${MIN_GAP_WORDS.en} apart: going back to work for a single Tuesday between two breaks adds days on paper, but nobody does it. The planner joins them or picks one.`,
      "The plan with the most days off in a row wins. When two tie, the one that books less leave, then the one with the longest break, then the earlier one.",
      "The list ranks the breaks by value: days off per day of leave.",
      `Separately, you get the longest block the same leave buys, holiday or not. A break that runs into ${YEAR + 1} only counts the weekend there: the ${YEAR + 1} holidays are not in yet.`,
    ],
  });

  const sources = L(locale, {
    ca: [
      `Els ${CATALONIA.length} festius de tot Catalunya: ${regional?.name ?? "Ordre EMT/52/2026"} (${regional?.ref ?? "DOGC"}). A l'Aran, el dilluns de Pasqua passa al 17 de juny (Festa d'Aran).`,
      dogc
        ? `Les dues festes locals de cada municipi: l'ordre del DOGC amb les festes locals del ${YEAR}, ja inclosa als ${f.towns} municipis.`
        : `Les dues festes locals de cada municipi surten en una ordre del DOGC que encara no s'ha publicat (la del 2026 va sortir el ${lastOrders[0]} i la del 2025, el ${lastOrders[1]}). Fins aleshores el càlcul fa servir només els festius de tot Catalunya, i ho diu. ${f.council} ajuntaments ja han aprovat les seves: les pots comptar marcant la casella, tenint en compte que encara estan pendents de l'ordre.`,
      `La resta d'Espanya: la llista del BOE de festes laborals del ${YEAR} (${BOE_2027.ref}) per a cada comunitat i, per a ${f.cities} ciutats, les festes locals quan el butlletí oficial de la comunitat les ha publicat (${f.published} de ${f.cities} avui).`,
    ],
    es: [
      `Los ${CATALONIA.length} festivos de toda Cataluña: ${regional?.name ?? "Ordre EMT/52/2026"} (${regional?.ref ?? "DOGC"}). En Arán, el lunes de Pascua pasa al 17 de junio (Fiesta de Arán).`,
      dogc
        ? `Las dos fiestas locales de cada municipio: la orden del DOGC con las fiestas locales de ${YEAR}, ya incluida en los ${f.towns} municipios.`
        : `Las dos fiestas locales de cada municipio salen en una orden del DOGC que aún no se ha publicado (la de 2026 salió el ${lastOrders[0]} y la de 2025, el ${lastOrders[1]}). Hasta entonces el cálculo usa solo los festivos de toda Cataluña, y lo dice. ${f.council} ayuntamientos ya han aprobado las suyas: puedes contarlas marcando la casilla, sabiendo que están pendientes de la orden.`,
      `El resto de España: la lista del BOE de fiestas laborales de ${YEAR} (${BOE_2027.ref}) para cada comunidad y, para ${f.cities} ciudades, las fiestas locales cuando el boletín oficial de la comunidad las ha publicado (${f.published} de ${f.cities} hoy).`,
    ],
    en: [
      `Catalonia's ${CATALONIA.length} region-wide holidays: ${regional?.name ?? "Ordre EMT/52/2026"} (${regional?.ref ?? "DOGC"}). In Aran, Easter Monday moves to 17 June (Festa d'Aran).`,
      dogc
        ? `Each town's two local holidays: the DOGC order with the ${YEAR} local holidays, already in for all ${f.towns} towns.`
        : `Each town's two local holidays come in a DOGC order that is not out yet (the 2026 one came on ${lastOrders[0]}, the 2025 one on ${lastOrders[1]}). Until then the plan uses the Catalonia-wide holidays only, and says so. ${f.council} councils have already approved theirs: tick the box to count them, bearing in mind they are pending the order.`,
      `The rest of Spain: the BOE's ${YEAR} list of public holidays (${BOE_2027.ref}) for each region and, for ${f.cities} cities, the local holidays once the region's official bulletin has published them (${f.published} of ${f.cities} so far).`,
    ],
  });

  const saturdayPara = f.weekendDays.length
    ? L(locale, {
        ca: `El ${YEAR} hi ha ${f.weekendDays.length} festius de tot Catalunya en cap de setmana (${weekendList}): en una setmana de dilluns a divendres no afegeixen cap dia, i per això no fan pont.`,
        es: `En ${YEAR} hay ${f.weekendDays.length} festivos de toda Cataluña en fin de semana (${weekendList}): en una semana de lunes a viernes no suman ningún día, y por eso no hacen puente.`,
        en: `In ${YEAR}, ${f.weekendDays.length} Catalonia-wide holidays fall on a weekend (${weekendList}): in a Monday-to-Friday week they add no day off, so they make no bridge.`,
      })
    : null;

  const caveat = L(locale, {
    ca: "És un càlcul, no un dret: les vacances es demanen i es pacten amb l'empresa, i els torns i els convenis ho poden canviar tot.",
    es: "Es un cálculo, no un derecho: las vacaciones se piden y se pactan con la empresa, y los turnos y los convenios pueden cambiarlo todo.",
    en: "This is a calculation, not an entitlement: leave has to be requested and agreed with your employer, and shifts and collective agreements can change everything.",
  });

  const headings = L(locale, {
    ca: { table: "Amb quants dies de vacances, quants dies de festa", how: "Com fem el càlcul", which: "Quins festius comptem", more: "Més sobre els festius del 2027" },
    es: { table: "Con cuántos días de vacaciones, cuántos días de fiesta", how: "Cómo hacemos el cálculo", which: "Qué festivos contamos", more: "Más sobre los festivos de 2027" },
    en: { table: "How many days off for how much leave", how: "How the plan is worked out", which: "Which holidays count", more: "More on the 2027 holidays" },
  });
  const tableLead = L(locale, {
    ca: `Per a tot Catalunya, sense festes locals. ${f.best ? `El dia de vacances que més rendeix: ${bestLine}.` : ""} Amb les dues festes locals del teu municipi, el planificador de dalt hi suma els seus ponts.`,
    es: `Para toda Cataluña, sin fiestas locales. ${f.best ? `El día de vacaciones que más rinde: ${bestLine}.` : ""} Con las dos fiestas locales de tu municipio, el planificador de arriba suma sus puentes.`,
    en: `For all of Catalonia, no local holidays. ${f.best ? `The single day of leave worth most: ${bestLine}.` : ""} With your town's two local holidays, the planner above adds their bridges.`,
  });

  const links = [
    { href: GUIDES.bridges2027[locale], label: BRIDGES_LABEL[locale] },
    { href: GUIDES.easter2027[locale], label: L(locale, { ca: `Setmana Santa ${YEAR} a Catalunya`, es: `Semana Santa ${YEAR} en Cataluña`, en: `Easter ${YEAR} in Catalonia` }) },
    { href: spainBridges, label: L(locale, { ca: `Ponts ${YEAR} a tot Espanya, per comunitat`, es: `Puentes ${YEAR} en toda España, por comunidad`, en: `Long weekends ${YEAR} across Spain, by region` }) },
    { href: GUIDES.workCalendar[locale], label: L(locale, { ca: `Calendari laboral ${YEAR} a Catalunya`, es: `Calendario laboral ${YEAR} en Cataluña`, en: `Catalonia public holidays ${YEAR}` }) },
    { href: hubPath(locale), label: L(locale, { ca: "Festius locals de cada municipi", es: "Festivos locales de cada municipio", en: "Local holidays town by town" }) },
    { href: widgetPagePath(locale), label: L(locale, { ca: `Posa el calendari ${YEAR} al teu web`, es: `Pon el calendario ${YEAR} en tu web`, en: `Put the ${YEAR} calendar on your website` }) },
  ];

  return (
    <>
      <SiteHeader locale={locale} translations={leaveEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <LeavePlanner locale={locale} data={data} initialPlace={DEFAULT_PLACE} initialLeave={DEFAULT_LEAVE} />
              <p className="text-sm text-[var(--color-muted)]">{caveat}</p>

              <h2 id="taula">{headings.table}</h2>
              <p>{tableLead}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{tableCaption}</caption>
                  <thead>
                    <tr>
                      {cols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {f.rows.map(({ leave, plan }) => (
                      <tr key={leave}>
                        <th scope="row" className="font-normal">
                          {t.leaveOption(leave)}
                        </th>
                        <td data-label={cols[1]}>{plan.daysOff}</td>
                        <td data-label={cols[2]}>{ratioText(plan.ratio, locale)}</td>
                        <td data-label={cols[3]}>
                          {plan.byDate.map((b) => `${rangeText(b.from, b.to, locale)} (${b.days})`).join("; ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {saturdayPara ? <p>{saturdayPara}</p> : null}

              <h2 id="calcul">{headings.how}</h2>
              <ul>
                {rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>

              <h2 id="festius">{headings.which}</h2>
              {sources.map((s) => (
                <p key={s}>{s}</p>
              ))}
              <p>
                <a href={regional?.url ?? GUIDES.workCalendar[locale]} rel="noopener" target="_blank">
                  {regional?.ref ?? "DOGC"}
                </a>
                {" · "}
                <a href={BOE_2027.url} rel="noopener" target="_blank">
                  {BOE_2027.ref.split(",")[0]}
                </a>
              </p>

              <h2 id="mes">{headings.more}</h2>
              <ul>
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <ShareBar locale={locale} path={leavePath(locale)} title={meta.h1} contentType="holidays_2027" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
