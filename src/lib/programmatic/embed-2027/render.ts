import { councilApproved2027, isAran, NEXT, NEXT_YEAR, nextYearFor, SNAPSHOT, YEAR, yearRows, type HolidayRow } from "@/lib/programmatic/holidays/data";
import { councilLabel, councilSource } from "@/lib/programmatic/holidays/copy";
import { dayMonth, dayMonthYear, weekdayName } from "@/lib/programmatic/holidays/format";
import { caDe, joinList } from "@/lib/programmatic/holidays/names";
import { bulletinLocal2027, cityReadOn, commonLocalDays, officialCalendar, type CityDayKind } from "@/lib/programmatic/spain-2027/cities";
import { areaNameIntl, caOf, localNameIntl, localNoteIntl } from "@/lib/programmatic/spain-2027/city-copy-intl";
import { localName } from "@/lib/programmatic/spain-2027/city-copy";
import { dayName } from "@/lib/programmatic/spain-2027/copy";
import { dayNameIntl } from "@/lib/programmatic/spain-2027/copy-intl";
import { editionNames } from "@/lib/programmatic/spain-2027/editions";
import { BOE_REF, SOURCES, SOURCES_READ_ON } from "@/lib/programmatic/spain-2027/sources";
import { SOURCE_PROSE } from "@/lib/programmatic/spain-2027/sources-intl";

import { EMBED_YEAR, attributionPath, placeName, type EmbedLocale, type EmbedPlace, type EmbedYear } from "./places";
import { embedDocument, esc } from "./shell";

export { esc };

/**
 * The widget itself: one self-contained HTML document per place and
 * language, built as a string by the route handlers in src/app/embed/. No
 * script, no cookie, no font or request to anyone: a table of the 2027
 * holidays, where each list comes from, when it was read, and the
 * attribution link back to the place's full page (or, when that page is kept
 * out of the index, lib/seo/low-demand.ts, to the 2027 hub of the language:
 * places.ts `attributionPath`).
 *
 * It says exactly what the full pages say, read from the same functions:
 *  - Catalan towns (holidays/data.ts `yearRows(…, { council: true })`): the
 *    DOGC order's local days once `local-2027.json` is parsed; before it, the
 *    days the council has approved (`council-2027.ts`), each labelled pending
 *    the DOGC; with neither, the Catalonia-wide days and a line saying the
 *    local ones are not out yet.
 *  - Spanish cities (spain-2027/cities.ts `cityCalendar`): the BOE days, the
 *    island day, and the local days only where the city's 2027 list is
 *    published (`status2027`), else a line saying they are pending.
 *
 * A Catalan town also has a 2026 widget (/embed/<locale>/2026/<municipi>/):
 * that year's DOGC order, complete for every town (`yearRows(…, 2026)`).
 * The Spanish cities have 2027 only: the site holds their 2026 local days
 * for some cities, not all.
 *
 * Every string from the data is escaped (`esc`): nothing reaches the HTML
 * unescaped but the fixed markup of this file and shell.ts.
 */

interface Row {
  date: string;
  name: string;
  scope: string;
  /** Under the name: where it applies, or that it is pending the DOGC. */
  notes: string[];
  local: boolean;
}

interface Model {
  lang: EmbedLocale;
  title: string;
  rows: Row[];
  /** Paragraphs of the status block; HTML, already escaped. */
  status: string[];
  /** Source lines; HTML, already escaped. */
  sources: string[];
  readOn: string;
  page: string;
}

const W: Record<EmbedLocale, { date: string; holiday: string; scope: string; read: (d: string) => string }> = {
  ca: { date: "Dia", holiday: "Festa", scope: "Àmbit", read: (d) => `Dades llegides el ${d} de les fonts oficials.` },
  es: { date: "Día", holiday: "Fiesta", scope: "Ámbito", read: (d) => `Datos leídos el ${d} de las fuentes oficiales.` },
  en: { date: "Day", holiday: "Holiday", scope: "Where", read: (d) => `Data read on ${d} from the official sources.` },
};

const link = (url: string, text: string) => `<a href="${esc(url)}" rel="noopener nofollow" target="_blank">${esc(text)}</a>`;
const latest = (...dates: (string | null | undefined)[]) => dates.filter((d): d is string => Boolean(d)).sort().at(-1) ?? SNAPSHOT.readOn;

/* -------------------------------------------------------- Catalan towns --- */

const TOWN_SCOPE: Record<EmbedLocale, Record<HolidayRow["kind"], string>> = {
  ca: { catalonia: "Catalunya", local: "Local", aran: "Aran" },
  es: { catalonia: "Cataluña", local: "Local", aran: "Arán" },
  en: { catalonia: "Catalonia", local: "Local", aran: "Aran" },
};

/** As the full pages label a council's day (components/programmatic/holidays/parts.tsx). */
const PENDING_LABEL: Record<EmbedLocale, string> = {
  ca: "Aprovat per l'Ajuntament, pendent del DOGC",
  es: "Aprobado por el Ayuntamiento, pendiente del DOGC",
  en: "Approved by the council, pending the DOGC order",
};

/** The order's short name: "Ordre EMT/52/2026". */
const shortOrder = (name: string) => name.split(",")[0] ?? name;

function townModel(lang: EmbedLocale, place: Extract<EmbedPlace, { kind: "town" }>, year: EmbedYear): Model {
  if (year === YEAR) return townModelCurrent(lang, place);
  const { m } = place;
  const name = placeName(lang, place);
  const next = nextYearFor(m.slug);
  const council = next ? null : councilApproved2027(m.slug);
  const rows: Row[] = yearRows(m, NEXT, lang, { council: true }).map((r) => ({
    date: r.date,
    name: r.kind === "local" ? r.name : r.name.charAt(0).toUpperCase() + r.name.slice(1),
    scope: TOWN_SCOPE[lang][r.kind],
    notes: [...(r.where ? [r.where.join(", ")] : []), ...(r.pending ? [PENDING_LABEL[lang]] : [])],
    local: r.kind === "local",
  }));

  const status: string[] = [];
  const nuclei = next ? (next.local.length > 0 ? next.nuclei : []) : (council?.nuclei ?? []);
  const nucleiLine = nuclei.length
    ? joinList(nuclei.map((n) => `${n.name} (${joinList(n.dates.map((d) => dayMonth(d, lang)), lang)})`), lang)
    : null;
  if (next && NEXT_YEAR.order) {
    const lead = { ca: "Festius locals:", es: "Festivos locales:", en: "Local holidays:" }[lang];
    status.push(`${lead} ${link(NEXT_YEAR.order.url, shortOrder(NEXT_YEAR.order.name))} (${esc(NEXT_YEAR.order.ref)}).`);
  } else if (council) {
    const lead = { ca: "Festius locals", es: "Festivos locales", en: "Local holidays" }[lang];
    status.push(esc(`${lead} ${councilLabel(council, lang)}.`));
    const s = councilSource(council, lang);
    status.push(`${esc(s.lead)} ${link(s.url, s.name)} — ${esc(s.ref)}. ${esc(s.read)}`);
  } else {
    status.push(
      esc(
        {
          ca: `Els festius locals ${caDe(m.name)} del ${NEXT} encara no s'han publicat. Els fixa cada any una ordre del Departament d'Empresa i Treball, a proposta de cada ajuntament; la del ${YEAR} va sortir al DOGC el 17 de desembre de 2025.`,
          es: `Los festivos locales de ${name} de ${NEXT} todavía no se han publicado. Los fija cada año una orden del Departament d'Empresa i Treball, a propuesta de cada ayuntamiento; la de ${YEAR} salió en el DOGC el 17 de diciembre de 2025.`,
          en: `The ${NEXT} local holidays of ${name} are not out yet. Every year an order of the Catalan government's Department of Enterprise and Labour sets them, from each council's proposal; the one for ${YEAR} appeared in the DOGC on 17 December 2025.`,
        }[lang],
      ),
    );
  }
  if (nucleiLine) {
    status.push(esc(`${{ ca: "Nuclis amb festius locals propis:", es: "Núcleos con festivos locales propios:", en: "Villages with local holidays of their own:" }[lang]} ${nucleiLine}.`));
  }

  const regional = SNAPSHOT.sources.regional[String(NEXT)];
  const sources = regional
    ? [`${esc({ ca: "Festius de tot Catalunya:", es: "Festivos de toda Cataluña:", en: "Catalonia-wide holidays:" }[lang])} ${link(regional.url, shortOrder(regional.name))} (${esc(regional.ref)}).`]
    : [];
  if (isAran(m)) sources.push(esc({ ca: "A l'Aran, la Festa d'Aran substitueix el dilluns de Pasqua.", es: "En Arán, la Fiesta de Arán sustituye al lunes de Pascua.", en: "In Aran, the Festa d'Aran replaces Easter Monday." }[lang]));

  return {
    lang,
    title: { ca: `Calendari laboral ${EMBED_YEAR} ${caDe(m.name)}`, es: `Calendario laboral ${EMBED_YEAR} de ${name}`, en: `${name} public holidays ${EMBED_YEAR}` }[lang],
    rows,
    status,
    sources,
    readOn: latest(SNAPSHOT.readOn, next ? NEXT_YEAR.readOn : null, council?.readOn),
    page: attributionPath(lang, place),
  };
}

/**
 * A town's 2026 calendar: the year's DOGC order, complete for every town the
 * site lists (the snapshot), with the order that corrected it when one did.
 */
function townModelCurrent(lang: EmbedLocale, place: Extract<EmbedPlace, { kind: "town" }>): Model {
  const { m } = place;
  const name = placeName(lang, place);
  const rows: Row[] = yearRows(m, YEAR, lang).map((r) => ({
    date: r.date,
    name: r.kind === "local" ? r.name : r.name.charAt(0).toUpperCase() + r.name.slice(1),
    scope: TOWN_SCOPE[lang][r.kind],
    notes: r.where ? [r.where.join(", ")] : [],
    local: r.kind === "local",
  }));
  const order = SNAPSHOT.sources.localOrder;
  const lead = { ca: "Festius locals:", es: "Festivos locales:", en: "Local holidays:" }[lang];
  const status = [`${lead} ${link(order.url, shortOrder(order.name))} (${esc(order.ref)}).`];
  const amendment = m.correction ? SNAPSHOT.sources.localAmendments.find((a) => a.name.startsWith(m.correction!.by)) : null;
  if (amendment) {
    const by = { ca: "Modificada per a aquest municipi per", es: "Modificada para este municipio por", en: "Amended for this town by" }[lang];
    status.push(`${by} ${link(amendment.url, shortOrder(amendment.name))} (${esc(amendment.ref)}).`);
  }
  if (m.local.length === 0 && m.nuclei.length > 0) {
    status.push(esc({ ca: "El municipi no té festius locals propis: els tenen els seus nuclis.", es: "El municipio no tiene festivos locales propios: los tienen sus núcleos.", en: "The municipality has no local holidays of its own: its villages do." }[lang]));
  } else if (m.nuclei.length > 0) {
    const line = joinList(m.nuclei.map((n) => `${n.name} (${joinList(n.dates.map((d) => dayMonth(d, lang)), lang)})`), lang);
    status.push(esc(`${{ ca: "Nuclis amb festius locals propis:", es: "Núcleos con festivos locales propios:", en: "Villages with local holidays of their own:" }[lang]} ${line}.`));
  }
  const regional = SNAPSHOT.sources.regional[String(YEAR)];
  const sources = regional
    ? [`${esc({ ca: "Festius de tot Catalunya:", es: "Festivos de toda Cataluña:", en: "Catalonia-wide holidays:" }[lang])} ${link(regional.url, shortOrder(regional.name))} (${esc(regional.ref)}).`]
    : [];
  if (isAran(m)) sources.push(esc({ ca: "A l'Aran, la Festa d'Aran substitueix un festiu de Catalunya.", es: "En Arán, la Fiesta de Arán sustituye a un festivo de Cataluña.", en: "In Aran, the Festa d'Aran replaces one Catalonia-wide holiday." }[lang]));
  return {
    lang,
    title: { ca: `Calendari laboral ${YEAR} ${caDe(m.name)}`, es: `Calendario laboral ${YEAR} de ${name}`, en: `${name} public holidays ${YEAR}` }[lang],
    rows,
    status,
    sources,
    readOn: SNAPSHOT.readOn,
    page: attributionPath(lang, place),
  };
}

/* -------------------------------------------------------- Spanish cities --- */

const CITY_SCOPE: Record<EmbedLocale, Record<CityDayKind, string>> = {
  ca: { national: "Estatal", "national-kept": "Estatal", regional: "Comunitat", island: "Illa", local: "Local" },
  es: { national: "Nacional", "national-kept": "Nacional", regional: "Autonómica", island: "Insular", local: "Local" },
  en: { national: "National", "national-kept": "National", regional: "Regional", island: "Island", local: "Local" },
};

function cityModel(lang: EmbedLocale, place: Extract<EmbedPlace, { kind: "city" }>): Model {
  const { c } = place;
  const name = placeName(lang, place);
  // The widget carries the bulletin's days only: a council's days still pending their bulletin stay out (status "council").
  const list = bulletinLocal2027(c);
  const common = commonLocalDays(c);
  const s = SOURCES[c.region];
  const rows: Row[] = officialCalendar(c).map((d) => {
    const label =
      d.kind === "local"
        ? lang === "es"
          ? localName({ date: d.date, name: d.name })
          : localNameIntl({ date: d.date, name: d.name }, lang)
        : d.kind === "island"
          ? (d.name ?? "")
          : d.name
            ? lang === "es"
              ? dayName({ name: d.name, replaces: d.replaces ?? null })
              : dayNameIntl({ name: d.name, replaces: d.replaces ?? null }, lang)
            : "";
    const note = lang === "es" ? d.note : localNoteIntl(d.note, lang);
    return { date: d.date, name: label, scope: CITY_SCOPE[lang][d.kind], notes: note ? [note] : [], local: d.kind === "local" };
  });

  const status: string[] = [];
  if (list) {
    const lead = { ca: "Festes locals:", es: "Fiestas locales:", en: "Local holidays:" }[lang];
    status.push(`${lead} ${link(list.source.url, list.source.title)} (${esc(list.source.ref)}).`);
    for (const z of list.zones ?? []) {
      const place = lang === "es" ? z.place : areaNameIntl(z.place, lang);
      status.push(esc(`${place}: ${joinList(z.days.map((d) => `${weekdayName(d.date, lang)} ${dayMonth(d.date, lang)}`), lang)}.`));
    }
  } else {
    const missing = c.status2027 === "missing";
    const own = common.length > 0;
    status.push(
      esc(
        {
          ca: missing
            ? `La llista oficial del ${EMBED_YEAR} no dona les festes locals ${caOf(name)}.`
            : own
              ? `Falta la festa local pròpia ${caOf(name)} del ${EMBED_YEAR}, encara sense publicar.`
              : `Les festes locals ${caOf(name)} del ${EMBED_YEAR} encara no s'han publicat.`,
          es: missing
            ? `La lista oficial de ${EMBED_YEAR} no da las fiestas locales de ${name}.`
            : own
              ? `Falta la fiesta local propia de ${name} de ${EMBED_YEAR}, aún sin publicar.`
              : `Las fiestas locales de ${name} de ${EMBED_YEAR} aún no se han publicado.`,
          en: missing
            ? `The official ${EMBED_YEAR} list does not give ${name}'s local holidays.`
            : own
              ? `${name}'s own ${EMBED_YEAR} local holiday is not published yet.`
              : `${name}'s ${EMBED_YEAR} local holidays are not published yet.`,
        }[lang],
      ),
    );
    const how = lang === "es" ? s.local.how : SOURCE_PROSE[c.region][lang].how;
    status.push(`${esc(how)} ${link(s.local.bulletinUrl, s.local.bulletinName)}.`);
  }

  const boeLead = { ca: "Festius estatals i autonòmics:", es: "Festivos nacionales y autonómicos:", en: "National and regional holidays:" }[lang];
  // "BOE núm. 254, de 13.10.2026" (the page numbers and the id are said once, in the link).
  const boeIssue = BOE_REF.ref.split(", págs")[0] ?? BOE_REF.ref;
  const sources = [`${esc(boeLead)} ${link(BOE_REF.url, BOE_REF.id)} (${esc(boeIssue)}).`];
  if (s.decree.status === "published") {
    const decreeLead = { ca: "Calendari de la comunitat:", es: "Calendario de la comunidad:", en: "The community's calendar:" }[lang];
    sources.push(`${esc(decreeLead)} ${link(s.decree.text.url, s.decree.text.title)} (${esc(s.decree.text.ref)}).`);
  }

  const community = lang === "es" ? c.community.short : editionNames(c.region, lang).short;
  return {
    lang,
    title: {
      ca: `Calendari laboral ${EMBED_YEAR} ${caOf(name)} (${community})`,
      es: `Calendario laboral ${EMBED_YEAR} de ${name} (${community})`,
      en: `${name} (${community}) public holidays ${EMBED_YEAR}`,
    }[lang],
    rows,
    status,
    sources,
    readOn: latest(SOURCES_READ_ON, cityReadOn(place.c)),
    page: attributionPath(lang, place),
  };
}

/* ------------------------------------------------------------- Document --- */

export function renderEmbed(lang: EmbedLocale, place: EmbedPlace, year: EmbedYear = EMBED_YEAR): string {
  return documentHtml(embedModel(lang, place, year));
}

/** The model behind the HTML, for tests. A city has 2027 only (`year` is ignored for it). */
export function embedModel(lang: EmbedLocale, place: EmbedPlace, year: EmbedYear = EMBED_YEAR): Model {
  return place.kind === "town" ? townModel(lang, place, year) : cityModel(lang, place);
}

function documentHtml(model: Model): string {
  const w = W[model.lang];
  const body = model.rows
    .map(
      (r) =>
        `<tr${r.local ? ' class="l"' : ""}><td class="d"><time datetime="${r.date}">${esc(`${weekdayName(r.date, model.lang)} ${dayMonth(r.date, model.lang)}`)}</time></td>` +
        `<td>${r.local ? `<strong>${esc(r.name)}</strong>` : esc(r.name)}${r.notes.map((n) => `<small>${esc(n)}</small>`).join("")}</td>` +
        `<td>${esc(r.scope)}</td></tr>`,
    )
    .join("");
  return embedDocument({
    lang: model.lang,
    title: model.title,
    page: model.page,
    body: [
      `<h1>${esc(model.title)}</h1>`,
      `<table><thead><tr><th scope="col">${w.date}</th><th scope="col">${w.holiday}</th><th scope="col">${w.scope}</th></tr></thead><tbody>${body}</tbody></table>`,
      ...model.status.map((p) => `<p>${p}</p>`),
      ...model.sources.map((p) => `<p>${p}</p>`),
      `<p><time datetime="${model.readOn}">${esc(w.read(dayMonthYear(model.readOn, model.lang)))}</time></p>`,
    ],
  });
}
