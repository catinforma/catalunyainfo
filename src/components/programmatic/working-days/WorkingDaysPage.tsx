import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { BOE_2026 } from "@/lib/programmatic/holidays/boe-2026";
import { BOE_2027 } from "@/lib/programmatic/holidays/boe-2027";
import { SNAPSHOT, councilApprovedTowns, nextYearPublished } from "@/lib/programmatic/holidays/data";
import { caDayArticle, dayMonthYear } from "@/lib/programmatic/holidays/format";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import { leavePath } from "@/lib/programmatic/leave-2027/copy";
import { CITIES } from "@/lib/programmatic/spain-2027/cities";
import { editionHubPath } from "@/lib/programmatic/spain-2027/editions";
import { spainHubPath } from "@/lib/programmatic/spain-2027/paths";
import { DEFAULT_EXAMPLE, DEFAULT_PLACE, DEFAULT_SPAN, dateText, shortDate, workingDaysEditions, workingDaysPath, type WdLocale } from "@/lib/programmatic/working-days/copy";
import { WD_META, pageFigures } from "@/lib/programmatic/working-days/page";
import { workingDaysData } from "@/lib/programmatic/working-days/places";
import { AGE_2026, AGE_2027, AGE_2027_CHECKED_ON, LEGAL_TEXTS, RULES_AS_OF, type LegalText } from "@/lib/programmatic/working-days/rules";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { WorkingDaysCalculator, type WdState } from "./WorkingDaysCalculator";

/**
 * "Calculadora de días hábiles" / "Calculadora de dies hàbils" / "Spain
 * working days calculator": the rule in one sentence, the calculator with the
 * default example already worked out (server-rendered), then the worked
 * examples, the BOE texts quoted, a month-by-month table and what holidays
 * are counted. Every date and figure is computed from the engine and the
 * holiday modules; nothing is typed here.
 */

const L = <T,>(locale: WdLocale, v: Record<WdLocale, T>): T => v[locale];

export function workingDaysCrumbs(locale: WdLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    hubCrumb(locale),
    { label: WD_META[locale].breadcrumb, href: workingDaysPath(locale) },
  ];
}

export function workingDaysMetadata(locale: WdLocale): Metadata {
  const m = WD_META[locale];
  return buildMetadata({ locale, path: workingDaysPath(locale), title: m.title, description: m.description, translations: workingDaysEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ text, locale }: { text: LegalText; locale: WdLocale }) {
  return (
    <figure className="my-4">
      <blockquote lang="es" className="border-l-4 border-[var(--color-rule)] pl-4">
        {text.quote.split("\n").map((p) => (
          <p key={p}>{p}</p>
        ))}
      </blockquote>
      <figcaption className="text-sm text-[var(--color-muted)]">
        <A href={text.url}>{text.cite}</A>
        {locale === "es" ? "" : L(locale, { es: "", ca: " (text del BOE, en castellà)", en: " (BOE text, in Spanish)" })}
      </figcaption>
    </figure>
  );
}

const MONTHS: Record<WdLocale, string[]> = {
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  ca: ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

export function WorkingDaysRoute({ locale }: { locale: WdLocale }) {
  const meta = WD_META[locale];
  const crumbs = workingDaysCrumbs(locale);
  const data = workingDaysData(locale);
  const f = pageFigures(data, locale);
  const ex = DEFAULT_EXAMPLE;
  const initial: WdState = {
    mode: "deadline",
    rules: ex.rules,
    place: DEFAULT_PLACE[locale],
    place2: "",
    saturdays: false,
    notified: ex.notified,
    amount: String(ex.amount),
    unit: ex.unit,
    from: DEFAULT_SPAN.from,
    to: DEFAULT_SPAN.to,
    includeFrom: true,
  };
  const d = (iso: string) => shortDate(iso, locale);
  const long = (iso: string) => dateText(iso, locale);
  const checked = locale === "ca" ? `${caDayArticle(RULES_AS_OF)}${dayMonthYear(RULES_AS_OF, "ca")}` : dayMonthYear(RULES_AS_OF, locale);
  const dogc = nextYearPublished();
  const council = councilApprovedTowns().length;
  const published = CITIES.filter((c) => c.status2027 === "published").length;
  const localOrder = SNAPSHOT.sources.localOrder;
  const spainHub = locale === "es" ? spainHubPath() : editionHubPath(locale);

  const lead = L(locale, {
    es: `Un plazo administrativo en días se cuenta en días hábiles: empieza el día siguiente a la notificación y no cuentan los sábados, los domingos ni los festivos nacionales, autonómicos o locales (Ley 39/2015, art. 30). Si el último día es inhábil, pasa al siguiente hábil. Por ejemplo, 10 días hábiles notificados el ${d(ex.notified)} acaban el ${long(f.example.last)} en ${f.placeLabel} y el ${long(f.other.result.last)} en ${f.other.label}.`,
    ca: `Un termini administratiu en dies es compta en dies hàbils: comença l'endemà de la notificació i no compten els dissabtes, els diumenges ni els festius nacionals, autonòmics o locals (Llei 39/2015, art. 30). Si l'últim dia és inhàbil, passa al següent hàbil. Per exemple, 10 dies hàbils notificats el ${d(ex.notified)} acaben el ${long(f.example.last)} a ${f.placeLabel} i el ${long(f.other.result.last)} a ${f.other.label}.`,
    en: `A Spanish administrative deadline in days counts working days (días hábiles): it starts the day after notification, and Saturdays, Sundays and national, regional and local holidays do not count (Ley 39/2015, art. 30). If the last day is a non-working day, it moves to the next working day. For example, 10 working days notified on ${d(ex.notified)} end on ${long(f.example.last)} in ${f.placeLabel} and on ${long(f.other.result.last)} in ${f.other.label}.`,
  });
  const freshness = L(locale, {
    es: `Normas leídas en el BOE el ${checked}. Festivos oficiales de 2026 y 2027.`,
    ca: `Normes llegides al BOE ${checked}. Festius oficials del 2026 i el 2027.`,
    en: `Rules read in the BOE on ${checked}. Official 2026 and 2027 holidays.`,
  });
  const disclaimer = L(locale, {
    es: "Es un cálculo orientativo, no asesoramiento jurídico. Un plazo lo fija la norma o el acto que te notifican: comprueba en la notificación desde cuándo cuenta y si son días hábiles, naturales o meses, y el calendario de días inhábiles del órgano competente (la Administración del Estado, tu comunidad o tu ayuntamiento publican el suyo). Si hay un procedimiento judicial, confírmalo con tu abogado o el juzgado.",
    ca: "És un càlcul orientatiu, no assessorament jurídic. Un termini el fixa la norma o l'acte que et notifiquen: comprova a la notificació des de quan compta i si són dies hàbils, naturals o mesos, i el calendari de dies inhàbils de l'òrgan competent (l'Administració de l'Estat, la teva comunitat o el teu ajuntament publiquen el seu). Si hi ha un procediment judicial, confirma-ho amb el teu advocat o el jutjat.",
    en: "This is an estimate, not legal advice. A deadline is set by the law or the decision you are notified of: check in the notification when it starts and whether it is in working days, calendar days or months, and the competent authority's calendar of non-working days (the State, your region and your town council each publish one). In court proceedings, confirm it with your lawyer or the court.",
  });

  const h = L(locale, {
    es: { examples: "Ejemplos", admin: "Cómo se cuenta un plazo administrativo", judicial: "Plazos judiciales: agosto y del 24 de diciembre al 6 de enero", table: "Días hábiles por mes en 2026 y 2027", which: "Qué festivos contamos", more: "Más sobre festivos y calendarios" },
    ca: { examples: "Exemples", admin: "Com es compta un termini administratiu", judicial: "Terminis judicials: l'agost i del 24 de desembre al 6 de gener", table: "Dies hàbils per mes el 2026 i el 2027", which: "Quins festius comptem", more: "Més sobre festius i calendaris" },
    en: { examples: "Examples", admin: "How an administrative deadline is counted", judicial: "Court deadlines: August and 24 December to 6 January", table: "Working days per month in 2026 and 2027", which: "Which holidays count", more: "More on holidays and calendars" },
  });

  const examples = L(locale, {
    es: [
      `Diez días hábiles notificados el lunes ${d(ex.notified)}: el plazo empieza el ${d(f.example.first)} y acaba el ${long(f.example.last)} en ${f.placeLabel}, y el ${long(f.other.result.last)} en ${f.other.label}. La diferencia es el 7 de diciembre: festivo en la Comunidad de Madrid y laborable en Cataluña.`,
      `Un mes desde el 31 de enero de 2026: no hay 31 de febrero, así que acaba el último día del mes, el ${d(f.months.nominal)}. Es sábado, inhábil, y el plazo pasa al ${long(f.months.last)}.`,
      `Cinco días hábiles notificados el ${d("2026-12-22")} en ${f.placeLabel}: si el plazo es administrativo, acaba el ${long(f.christmasAdmin.last)}; si es judicial, del 24 de diciembre al 6 de enero no cuenta nada y acaba el ${long(f.christmasJudicial.last)}.`,
    ],
    ca: [
      `Deu dies hàbils notificats el dilluns ${d(ex.notified)}: el termini comença el ${d(f.example.first)} i acaba el ${long(f.example.last)} a ${f.placeLabel}, i el ${long(f.other.result.last)} a ${f.other.label}. La diferència és el 7 de desembre: festiu a la Comunitat de Madrid i laborable a Catalunya.`,
      `Un mes des del 31 de gener de 2026: no hi ha 31 de febrer, així que acaba l'últim dia del mes, el ${d(f.months.nominal)}. És dissabte, inhàbil, i el termini passa al ${long(f.months.last)}.`,
      `Cinc dies hàbils notificats el ${d("2026-12-22")} a ${f.placeLabel}: si el termini és administratiu, acaba el ${long(f.christmasAdmin.last)}; si és judicial, del 24 de desembre al 6 de gener no compta res i acaba el ${long(f.christmasJudicial.last)}.`,
    ],
    en: [
      `Ten working days notified on Monday ${d(ex.notified)}: the count starts on ${d(f.example.first)} and ends on ${long(f.example.last)} in ${f.placeLabel}, and on ${long(f.other.result.last)} in ${f.other.label}. The difference is 7 December: a holiday in the Madrid region and a working day in Catalonia.`,
      `One month from 31 January 2026: there is no 31 February, so it ends on the month's last day, ${d(f.months.nominal)}. That is a Saturday, a non-working day, so the deadline moves to ${long(f.months.last)}.`,
      `Five working days notified on ${d("2026-12-22")} in ${f.placeLabel}: an administrative deadline ends on ${long(f.christmasAdmin.last)}; a court deadline skips 24 December to 6 January and ends on ${long(f.christmasJudicial.last)}.`,
    ],
  });

  const adminPoints = L(locale, {
    es: [
      "Cuenta desde el día siguiente a la notificación o publicación, nunca el mismo día.",
      "Los sábados son inhábiles en los plazos administrativos desde la Ley 39/2015 (en vigor desde el 2 de octubre de 2016).",
      "Agosto es hábil: el mes de vacaciones de los juzgados no para los plazos de la Administración.",
      "Si el plazo es de días naturales (lo dice la ley y la notificación tiene que indicarlo), cuentan todos los días, pero si el último es inhábil también pasa al siguiente hábil.",
      "Un festivo local de tu municipio cuenta como inhábil aunque el órgano esté en otro, y al revés (art. 30.6). En la calculadora, marca la casilla del órgano y elige su municipio.",
      "En un registro electrónico se puede presentar cualquier día, pero lo que se presenta en día inhábil se entiende presentado a primera hora del primer día hábil siguiente (art. 31.2.b).",
    ],
    ca: [
      "Compta des de l'endemà de la notificació o publicació, mai el mateix dia.",
      "Els dissabtes són inhàbils en els terminis administratius des de la Llei 39/2015 (en vigor des del 2 d'octubre de 2016).",
      "L'agost és hàbil: el mes de vacances dels jutjats no atura els terminis de l'Administració.",
      "Si el termini és de dies naturals (ho diu la llei i la notificació ho ha d'indicar), compten tots els dies, però si l'últim és inhàbil també passa al següent hàbil.",
      "Una festa local del teu municipi compta com a inhàbil encara que l'òrgan sigui en un altre, i al revés (art. 30.6). A la calculadora, marca la casella de l'òrgan i tria el seu municipi.",
      "En un registre electrònic es pot presentar qualsevol dia, però el que es presenta en dia inhàbil s'entén presentat a primera hora del primer dia hàbil següent (art. 31.2.b).",
    ],
    en: [
      "It counts from the day after notification or publication, never the same day.",
      "Saturdays have been non-working days for administrative deadlines since Ley 39/2015 (in force since 2 October 2016).",
      "August counts: the courts' holiday month does not stop the administration's deadlines.",
      "If the deadline is in calendar days (the law says so, and the notification has to state it), every day counts, but a last day that is a non-working day still moves to the next working day.",
      "A local holiday where you live is a non-working day even if the authority sits elsewhere, and the other way round (art. 30.6). In the calculator, tick the box and pick the authority's town.",
      "An electronic registry accepts filings on any day, but a filing on a non-working day counts as made at the start of the next working day (art. 31.2.b).",
    ],
  });

  const judicialPoints = L(locale, {
    es: [
      "Además de sábados, domingos y festivos, son inhábiles todos los días de agosto y del 24 de diciembre al 6 de enero, ambos incluidos. Este último periodo lo añadió la Ley Orgánica 14/2022 (en vigor desde el 23 de diciembre de 2022).",
      "En la jurisdicción civil, un escrito sujeto a plazo se puede presentar hasta las 15:00 del día hábil siguiente al último (LEC art. 135.5). La calculadora lo muestra aparte: no alarga el plazo.",
      "No calculamos: la instrucción de causas penales, donde todos los días y horas son hábiles (LOPJ art. 184); las actuaciones urgentes, donde agosto es hábil (LEC arts. 131 y 133.2); ni los plazos por meses o las reglas propias de las leyes de cada jurisdicción (social, contencioso-administrativa).",
    ],
    ca: [
      "A més de dissabtes, diumenges i festius, són inhàbils tots els dies de l'agost i del 24 de desembre al 6 de gener, tots dos inclosos. Aquest darrer període el va afegir la Llei orgànica 14/2022 (en vigor des del 23 de desembre de 2022).",
      "A la jurisdicció civil, un escrit subjecte a termini es pot presentar fins a les 15.00 del dia hàbil següent a l'últim (LEC art. 135.5). La calculadora ho mostra a part: no allarga el termini.",
      "No calculem: la instrucció de causes penals, on tots els dies i hores són hàbils (LOPJ art. 184); les actuacions urgents, on l'agost és hàbil (LEC arts. 131 i 133.2); ni els terminis per mesos o les regles pròpies de les lleis de cada jurisdicció (social, contenciosa administrativa).",
    ],
    en: [
      "Besides Saturdays, Sundays and holidays, every day of August and 24 December to 6 January, both included, are non-working days. The Christmas period was added by Ley Orgánica 14/2022 (in force since 23 December 2022).",
      "In civil courts, a filing subject to a deadline can be made until 15:00 on the working day after the last one (LEC art. 135.5). The calculator shows it separately: it does not extend the deadline.",
      "Not covered: criminal investigation, where every day and hour counts (LOPJ art. 184); urgent proceedings, where August counts (LEC arts. 131 and 133.2); deadlines in months; and each jurisdiction's own rules (employment, judicial review).",
    ],
  });

  const tableLead = L(locale, {
    es: `De lunes a viernes, sin los festivos que comparte toda España: ${f.totals.y2026} días hábiles en 2026 y ${f.totals.y2027} en 2027. Cada festivo autonómico o local que cae entre semana resta uno más; la calculadora los cuenta para tu lugar.`,
    ca: `De dilluns a divendres, sense els festius que comparteix tot Espanya: ${f.totals.y2026} dies hàbils el 2026 i ${f.totals.y2027} el 2027. Cada festiu autonòmic o local que cau entre setmana en resta un més; la calculadora els compta per al teu lloc.`,
    en: `Monday to Friday, without the holidays all of Spain shares: ${f.totals.y2026} working days in 2026 and ${f.totals.y2027} in 2027. Every regional or local holiday on a weekday takes off one more; the calculator counts them for your place.`,
  });
  const cols = L(locale, { es: ["Mes", "2026", "2027"], ca: ["Mes", "2026", "2027"], en: ["Month", "2026", "2027"] });
  const total = L(locale, { es: "Total", ca: "Total", en: "Total" });

  const age2027Line = AGE_2027
    ? L(locale, {
        es: `El calendario de días inhábiles de la Administración General del Estado para 2027 ya está publicado: ${AGE_2027.ref}.`,
        ca: `El calendari de dies inhàbils de l'Administració General de l'Estat per al 2027 ja és publicat: ${AGE_2027.ref}.`,
        en: `The State administration's 2027 calendar of non-working days is out: ${AGE_2027.ref}.`,
      })
    : L(locale, {
        es: `El calendario de días inhábiles de 2027 de la Administración General del Estado aún no está en el BOE (lo hemos buscado hasta el ${dayMonthYear(AGE_2027_CHECKED_ON, "es")}; el de 2026 salió el ${dayMonthYear(AGE_2026.published, "es")}). Hasta entonces, para 2027 contamos la lista oficial de fiestas laborales (${BOE_2027.ref}), a la que ese calendario tiene que ajustarse (art. 30.7).`,
        ca: `El calendari de dies inhàbils del 2027 de l'Administració General de l'Estat encara no és al BOE (l'hem buscat fins ${caDayArticle(AGE_2027_CHECKED_ON)}${dayMonthYear(AGE_2027_CHECKED_ON, "ca")}; el del 2026 va sortir el ${dayMonthYear(AGE_2026.published, "ca")}). Fins aleshores, per al 2027 comptem la llista oficial de festes laborals (${BOE_2027.ref}), a la qual aquest calendari s'ha d'ajustar (art. 30.7).`,
        en: `The State administration's 2027 calendar of non-working days is not in the BOE yet (checked up to ${dayMonthYear(AGE_2027_CHECKED_ON, "en")}; the 2026 one came out on ${dayMonthYear(AGE_2026.published, "en")}). Until then, for 2027 we count the official list of public holidays (${BOE_2027.ref}), which that calendar has to follow (art. 30.7).`,
      });

  const sources = L(locale, {
    es: [
      `2026: la lista de fiestas laborales del BOE (${BOE_2026.ref}). La hemos comparado día a día con el calendario de días inhábiles de la Administración General del Estado para 2026 (${AGE_2026.ref}) y coinciden en todas las comunidades.`,
      age2027Line,
      `Cataluña: las órdenes del DOGC de cada año y, en cada municipio, sus fiestas locales de 2026 (${localOrder.name.split(",")[0]}, ${localOrder.ref}). ${dogc ? "Las de 2027 ya están incluidas." : `Las fiestas locales de 2027 salen en una orden del DOGC que aún no se ha publicado: hasta entonces no se cuentan, aunque ${council} ayuntamientos ya hayan aprobado las suyas.`}`,
      `Resto de España: la columna de cada comunidad del BOE, la fiesta local común de Navarra, la fiesta insular en Canarias y, para ${CITIES.length} ciudades, sus fiestas locales cuando el boletín oficial las ha publicado (las de 2027, ${published} de ${CITIES.length} hoy).`,
      "No contamos los días de los núcleos o barrios que tienen fiestas propias distintas de las del municipio, ni los días que una administración declare inhábiles por su cuenta. Fuera de 2026 y 2027 la calculadora no da resultado.",
    ],
    ca: [
      `2026: la llista de festes laborals del BOE (${BOE_2026.ref}). L'hem comparada dia a dia amb el calendari de dies inhàbils de l'Administració General de l'Estat per al 2026 (${AGE_2026.ref}) i coincideixen a totes les comunitats.`,
      age2027Line,
      `Catalunya: les ordres del DOGC de cada any i, a cada municipi, les seves festes locals del 2026 (${localOrder.name.split(",")[0]}, ${localOrder.ref}). ${dogc ? "Les del 2027 ja hi són." : `Les festes locals del 2027 surten en una ordre del DOGC que encara no s'ha publicat: fins aleshores no es compten, encara que ${council} ajuntaments ja hagin aprovat les seves.`}`,
      `Resta d'Espanya: la columna de cada comunitat del BOE, la festa local comuna de Navarra, la festa insular a Canàries i, per a ${CITIES.length} ciutats, les seves festes locals quan el butlletí oficial les ha publicades (les del 2027, ${published} de ${CITIES.length} avui).`,
      "No comptem els dies dels nuclis o barris que tenen festes pròpies diferents de les del municipi, ni els dies que una administració declari inhàbils pel seu compte. Fora del 2026 i el 2027 la calculadora no dona resultat.",
    ],
    en: [
      `2026: the BOE's list of public holidays (${BOE_2026.ref}). We compared it day by day with the State administration's 2026 calendar of non-working days (${AGE_2026.ref}); they match for every region.`,
      age2027Line,
      `Catalonia: each year's DOGC orders and, for each town, its 2026 local holidays (${localOrder.name.split(",")[0]}, ${localOrder.ref}). ${dogc ? "The 2027 ones are in." : `The 2027 local holidays come in a DOGC order that is not out yet: until then they are not counted, although ${council} councils have already approved theirs.`}`,
      `Rest of Spain: each region's column of the BOE list, Navarre's shared local holiday, the island holiday in the Canaries and, for ${CITIES.length} cities, their local holidays once the official bulletin has published them (for 2027, ${published} of ${CITIES.length} so far).`,
      "Not counted: days of villages or districts with holidays of their own that differ from the town's, and days an authority declares non-working on its own. Outside 2026 and 2027 the calculator gives no result.",
    ],
  });

  const links = [
    { href: GUIDES.workCalendar[locale], label: L(locale, { es: "Calendario laboral 2026 y 2027 en Cataluña", ca: "Calendari laboral 2026 i 2027 a Catalunya", en: "Catalonia public holidays 2026 and 2027" }) },
    { href: spainHub, label: L(locale, { es: "Calendario laboral 2027 en España, por comunidad y ciudad", ca: "Calendari laboral 2027 a Espanya, per comunitat i ciutat", en: "Spain 2027 public holidays, by region and city" }) },
    { href: leavePath(locale), label: L(locale, { es: "Cómo aprovechar los festivos y las vacaciones en 2027", ca: "Com aprofitar les vacances el 2027", en: "2027 leave planner" }) },
  ];

  return (
    <>
      <SiteHeader locale={locale} translations={workingDaysEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{freshness}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <WorkingDaysCalculator locale={locale} data={data} initial={initial} />
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <h2 id="ejemplos">{h.examples}</h2>
              <ul>
                {examples.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>

              <h2 id="administrativo">{h.admin}</h2>
              <Quote text={LEGAL_TEXTS.art30} locale={locale} />
              <ul>
                {adminPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>

              <h2 id="judicial">{h.judicial}</h2>
              <Quote text={LEGAL_TEXTS.lopj182} locale={locale} />
              <Quote text={LEGAL_TEXTS.lopj183} locale={locale} />
              <Quote text={LEGAL_TEXTS.lec133} locale={locale} />
              <ul>
                {judicialPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>

              <h2 id="por-mes">{h.table}</h2>
              <p>{tableLead}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
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
                    {f.monthly.map((m, i) => (
                      <tr key={m.month}>
                        <th scope="row" className="font-normal">
                          {MONTHS[locale][i]}
                        </th>
                        <td className="ci-numeric">{m.y2026}</td>
                        <td className="ci-numeric">{m.y2027}</td>
                      </tr>
                    ))}
                    <tr>
                      <th scope="row">{total}</th>
                      <td className="ci-numeric">
                        <strong>{f.totals.y2026}</strong>
                      </td>
                      <td className="ci-numeric">
                        <strong>{f.totals.y2027}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 id="festivos">{h.which}</h2>
              {sources.map((s) => (
                <p key={s}>{s}</p>
              ))}
              <p>
                <A href={BOE_2026.url}>{BOE_2026.ref.split(",")[0]}</A>
                {" · "}
                <A href={AGE_2026.url}>{AGE_2026.ref}</A>
                {" · "}
                <A href={BOE_2027.url}>{BOE_2027.ref.split(",")[0]}</A>
                {AGE_2027 ? (
                  <>
                    {" · "}
                    <A href={AGE_2027.url}>{AGE_2027.ref}</A>
                  </>
                ) : null}
                {" · "}
                <A href={localOrder.url}>{localOrder.ref}</A>
              </p>

              <h2 id="mas">{h.more}</h2>
              <ul>
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
              <MoreCalculators current="working-days" locale={locale} />
            </div>
            <ShareBar locale={locale} path={workingDaysPath(locale)} title={meta.h1} contentType="working_days" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
