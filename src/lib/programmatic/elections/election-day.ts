import { b2href } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";

import { INE_MESA_URL } from "./polling";
import { ELECTION_NIGHT_RESULTS_URL, RESULTS_SITE_CHECKED } from "./results-night";

/**
 * The election-day layer of 29 November 2026 (18 Nov 2026, logged in
 * docs/SEO_EXPERIMENTS.md, "18 Nov 2026 — 29N election-day layer"): what the
 * elections hubs, the comarca pages and the 947 town pages lead with on the
 * eve, on polling day, once the polls close and in the week of the general
 * count. Pure and deterministic: the phase is a function of an instant, and
 * the pages call it on the server when they render (no client clock). The
 * routes that print it regenerate every 5 minutes (`revalidate = 300`), so
 * each phase reaches the cached HTML, and Cloudflare, within minutes of its
 * start without a deploy, a purge or a timer on the night.
 *
 * Phases (Madrid time):
 *   before   to Fri 27 Nov 23:59      no block (the page's usual 29N slot)
 *   eve      Sat 28 Nov               "tomorrow": hours, ID, where, reflection day
 *   polling  Sun 29 Nov 00:00-19:59   "today": hours, ID, where, help line, results from 20:00
 *   count    Sun 29 Nov 20:00-23:59   the official results site first
 *   after    Mon 30 Nov - Mon 7 Dec   provisional vs official, general count 4-7 Dec
 *   over     from Tue 8 Dec           no block
 *
 * Every fact, read on 18 Nov 2026 on the primary source:
 *  - 9:00 to 20:00, and whoever is in the polling place or at its entrance at
 *    20:00 still votes: LOREG arts. 84.1 ("se iniciará a las nueve horas la
 *    votación, que continuará sin interrupción hasta las veinte horas") and
 *    88.1 ("Si alguno de los electores que se hallan en el local o en el
 *    acceso al mismo no ha votado todavía, el Presidente admitirá que lo
 *    hagan"); Interior's 29N "voto presencial" page.
 *  - ID: Interior's 29N "voto presencial" page: DNI ("Válido también mediante
 *    la aplicación MiDNI. La Mesa dispondrá de un dispositivo para comprobar
 *    el código QR ... (Acuerdo de la Junta Electoral Central en su sesión del
 *    día 5 de noviembre de 2026)"), passport or driving licence with a photo;
 *    "No importa que estos documentos estén caducados, pero deben ser los
 *    originales, no valen fotocopias". MiDGT stays suspended (JEC Acuerdo
 *    334/2026, read 6 Nov).
 *  - Where: INE 29N page (cid=1700): the lookup needs "la provincia, el
 *    municipio y la inicial del primer apellido", no Cl@ve; voter cards posted
 *    2-10 Nov; the final list of tables and venues online from 19 Nov.
 *  - Help: INE cid=1700: free line 900 343 232, "El día 29 de noviembre, día de
 *    la votación, el horario será de 8:00 a 20:00 horas"; "hasta el mismo día
 *    de la votación, las Delegaciones Provinciales de la Oficina del Censo
 *    Electoral pueden emitir certificaciones censales específicas", "un medio
 *    de prueba de estar inscrito en el censo electoral vigente, aunque no
 *    figure en los ejemplares certificados de las listas del censo puestos a
 *    disposición de las mesas" (LOREG art. 85.1 admits it at the table).
 *  - Working that day: up to four paid hours (Interior's "voto presencial"
 *    page; RD 605/1999 art. 13).
 *  - 21 Nov 2026: in Catalonia, Ordre EMT/232/2026 (DOGC núm. 9799,
 *    20 Nov 2026; PDF read 21 Nov) sets them: art. 1.2 none if the shift
 *    overlaps polling hours by "com a màxim, de dues hores", two "si és de
 *    més de dues hores i de menys de quatre", four "si aquesta coincidència
 *    és de quatre o més hores"; art. 2 the employer picks the moment; art.
 *    4.1 mesa members get "les cinc primeres hores de la jornada laboral del
 *    dia immediatament posterior". Every page with this block is Catalan.
 *  - Mesa members: at the polling place at 8:00 (LOREG art. 80.1); employees
 *    and civil servants who sat get five fewer working hours on Monday
 *    30 Nov (LOREG art. 28.1).
 *  - Results: the provisional count is the Government's (LOREG art. 98.2),
 *    after voting ends at 20:00 (Canary Islands 21:00 peninsular time); in
 *    2023 the first figures came at 21:00 (Interior's note of 20 Jul 2023, in
 *    election-night.ts); the official result is the provincial boards'
 *    general count, 4-7 Dec (JEC 29N calendar PDF), published in the BOE.
 *    The results site is the one switch in results-night.ts: while it is
 *    null the block says so with the date it was last looked for.
 *  - Reflection day Sat 28 Nov: JEC calendar ("Jornada de reflexión");
 *    LOREG art. 53.
 */

export type ElectionDayPhase = "before" | "eve" | "polling" | "count" | "after" | "over";

/** Polling day of Real Decreto 806/2026 and the edges of the layer, as Madrid dates. */
export const ELECTION_DAY = { eve: "2026-11-28", day: "2026-11-29", lastDay: "2026-12-07" } as const;

/** 20:00 in Madrid, in minutes after midnight: polls close in Catalonia (LOREG art. 84.1). */
export const POLLS_CLOSE_MINUTES = 20 * 60;

const MADRID = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Madrid",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Date (YYYY-MM-DD) and minutes after midnight in Madrid at instant `now`. */
export function madridClock(now: Date): { date: string; minutes: number } {
  const parts = Object.fromEntries(MADRID.formatToParts(now).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

export function electionPhase(now: Date): ElectionDayPhase {
  const { date, minutes } = madridClock(now);
  if (date < ELECTION_DAY.eve) return "before";
  if (date === ELECTION_DAY.eve) return "eve";
  if (date === ELECTION_DAY.day) return minutes < POLLS_CLOSE_MINUTES ? "polling" : "count";
  if (date <= ELECTION_DAY.lastDay) return "after";
  return "over";
}

/**
 * When each phase begins, as instants (Madrid is on UTC+1 from 25 Oct 2026 to
 * 28 Mar 2027, so the offset is fixed for these dates). "after" starts the day
 * after polling day, "over" the day after the layer's last day.
 */
const PHASE_STARTS: Record<Exclude<ElectionDayPhase, "before">, string> = {
  eve: `${ELECTION_DAY.eve}T00:00:00+01:00`,
  polling: `${ELECTION_DAY.day}T00:00:00+01:00`,
  count: `${ELECTION_DAY.day}T20:00:00+01:00`,
  after: "2026-11-30T00:00:00+01:00",
  over: "2026-12-08T00:00:00+01:00",
};

/**
 * The instant the phase `now` falls in began, or null before the layer starts.
 * The pages print the phase (revalidated every 5 minutes), so their content
 * changes at these instants: the sitemap dates them no earlier (app/sitemap.ts).
 */
export function electionPhaseStart(now: Date): Date | null {
  const phase = electionPhase(now);
  return phase === "before" ? null : new Date(PHASE_STARTS[phase]);
}

/** The town a page is about, as that page writes it. */
export interface DayTown {
  /** "a Salou", "en Salou", "in Salou": the page's own locative. */
  where: string;
  /** In-page anchor of the town's polling-places section, with "#". */
  anchor: string;
  /** From the BOP lists; null when the town has none. */
  places: number | null;
  tables: number | null;
}

export interface DayContext {
  town?: DayTown | null;
  /** The 29N file is imported and the page already shows the town's result. */
  hasResults?: boolean;
  resultsUrl?: string | null;
  checked?: string;
}

export interface ElectionDayBlock {
  phase: Exclude<ElectionDayPhase, "before" | "over">;
  /** Callout style: act now (eve, polling) or read (count, after). */
  tone: "warning" | "info";
  title: string;
  /** Markdown lines (bold and links), the site's inline formatter. */
  md: string[];
  /** The official results site as a button, from 20:00 and only once it is announced. */
  cta: { href: string; label: string } | null;
}

/** In-page anchor of the block itself. */
export const ELECTION_DAY_ANCHOR = "29n-avui";

const LOREG = "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672";
const JEC_334 = "https://www.juntaelectoralcentral.es/cs/jec/doctrina/acuerdos?anyosesion=2026&idacuerdoinstruccion=155594&idsesion=1120&template=Doctrina%2FJEC_Detalle";
/** The INE census office's 29N page: roll closing date, voter cards, help line, certificates. */
export const INE_29N_URL = "https://www.ine.es/dyngs/CEL/index.htm?cid=1700";
const INE_29N = INE_29N_URL;
const PRESENCIAL = "https://29neleccionesgenerales.es/informacion-general/como-votar/voto-presencial";
/** The Generalitat's 29N voter-leave order (DOGC núm. 9799, 20 Nov 2026). */
const EMT_232 = "https://portaldogc.gencat.cat/utilsEADOP/PDF/9799/2181015.pdf";

const CHECKED_DAY: Record<Locale, (iso: string) => string> = {
  ca: (iso) => `${Number(iso.slice(8, 10))} de ${["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"][Number(iso.slice(5, 7)) - 1]} de ${iso.slice(0, 4)}`,
  es: (iso) => `${Number(iso.slice(8, 10))} de ${["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][Number(iso.slice(5, 7)) - 1]} de ${iso.slice(0, 4)}`,
  en: (iso) => `${Number(iso.slice(8, 10))} ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`,
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The block for a phase, or null before 28 Nov and after the general count. */
export function electionDayBlock(locale: Locale, phase: ElectionDayPhase, ctx: DayContext = {}): ElectionDayBlock | null {
  if (phase === "before" || phase === "over") return null;
  const url = ctx.resultsUrl === undefined ? ELECTION_NIGHT_RESULTS_URL : ctx.resultsUrl;
  const checked = CHECKED_DAY[locale](ctx.checked ?? RESULTS_SITE_CHECKED);
  const town = ctx.town ?? null;
  const copy = COPY[locale];
  const tone = phase === "eve" || phase === "polling" ? "warning" : "info";
  const cta = url && (phase === "count" || phase === "after") ? { href: url, label: copy.ctaLabel } : null;
  return { phase, tone, title: copy.title[phase], md: copy.lines(phase, { url, checked, town, hasResults: ctx.hasResults ?? false }), cta };
}

interface LineArgs {
  url: string | null;
  checked: string;
  town: DayTown | null;
  hasResults: boolean;
}

interface Copy {
  title: Record<ElectionDayBlock["phase"], string>;
  ctaLabel: string;
  lines: (phase: ElectionDayBlock["phase"], a: LineArgs) => string[];
}

const COPY: Record<Locale, Copy> = {
  ca: {
    title: {
      eve: "Demà es vota: diumenge 29 de novembre, de 9 a 20 h",
      polling: "Avui es vota: diumenge 29 de novembre, de 9 a 20 h",
      count: "Urnes tancades: l'escrutini provisional, aquesta nit",
      after: "Eleccions del 29 de novembre: resultats provisionals i escrutini general",
    },
    ctaLabel: "Resultats al web oficial del Ministeri de l'Interior",
    lines: (phase, { url, checked, town, hasResults }) => {
      const tomorrow = phase === "eve";
      const where = town
        ? `**On votes ${town.where}:** ${town.places !== null && town.tables !== null ? `[els ${plural(town.places, "local electoral", "locals electorals")} i les ${plural(town.tables, "mesa", "meses")}](${town.anchor}), de la llista oficial del BOP, més avall` : `[els locals electorals](${town.anchor}), més avall`}. La teva mesa te la diu la [consulta oficial de l'INE](${INE_MESA_URL}) amb la província, el municipi i la inicial del primer cognom, sense identificar-te, i la targeta censal.`
        : `**On votes:** la [consulta oficial de l'INE](${INE_MESA_URL}) et diu la mesa i el local amb la província, el municipi i la inicial del primer cognom, sense identificar-te; també ho diu la targeta censal, enviada per correu del 2 al 10 de novembre.`;
      const results = url
        ? `**Resultats:** el Ministeri de l'Interior publica l'escrutini provisional quan acaba la votació, a les 20:00 (a les Canàries, a les 21:00 hora peninsular), al seu [web oficial de resultats](${url}).`
        : `**Resultats:** el Ministeri de l'Interior publica l'escrutini provisional quan acaba la votació, a les 20:00 (a les Canàries, a les 21:00 hora peninsular); el 2023 les primeres dades van sortir a les 21:00. Encara no ha anunciat el web on el publicarà (comprovat el ${checked}). [Com és la nit electoral](${b2href("electionNight", "ca")}).`;
      if (phase === "eve" || phase === "polling") {
        return [
          `**Horari:** de 9:00 a 20:00. Si a les 20:00 ets dins del local o a l'entrada, encara pots votar ([LOREG, articles 84 i 88](${LOREG})).`,
          `**Què cal portar:** el DNI, el passaport o el carnet de conduir originals, amb foto; valen encara que estiguin caducats, però no fotocòpies ([Ministeri de l'Interior](${PRESENCIAL})). També val l'app **MiDNI**: la mesa en comprova el codi QR ([Junta Electoral Central, 5 de novembre de 2026](${JEC_334})). L'app MiDGT no val.`,
          where,
          `**Si no surts a la llista o tens dubtes:** l'Oficina del Cens Electoral atén gratis al 900 343 232, el diumenge 29 de 8:00 a 20:00, i fins al mateix dia la seva delegació provincial pot expedir una certificació censal específica, que acredita que ets al cens encara que no figuris a la llista de la mesa ([INE](${INE_29N})).`,
          `**Si treballes ${tomorrow ? "demà" : "avui"}:** tens dret a fins a quatre hores retribuïdes per votar: quatre si la jornada coincideix quatre hores o més amb l'horari de votació, dues si en coincideix més de dues i menys de quatre, cap si en coincideix dues o menys; l'empresa tria el moment ([Ordre EMT/232/2026](${EMT_232})). **Membres de mesa:** a les 8:00 al local, amb la notificació ([LOREG, article 80](${LOREG})); [què fer si t'ha tocat](${b2href("mesa", "ca")}).`,
          ...(tomorrow ? ["**Avui, dissabte 28, és la jornada de reflexió:** la campanya va acabar a mitjanit i ja no s'hi poden fer actes ni difondre propaganda (LOREG, article 53)."] : []),
          results,
        ];
      }
      const official = "Són resultats provisionals: els oficials surten de l'escrutini general de les juntes electorals provincials, del 4 al 7 de desembre, i es publiquen al BOE.";
      const townLine = town && !hasResults ? [`Els resultats del 29N ${town.where} apareixeran en aquesta pàgina quan el Ministeri de l'Interior publiqui el fitxer oficial de resultats per municipis.`] : [];
      if (phase === "count") {
        return [
          url
            ? `El Ministeri de l'Interior publica l'escrutini provisional a mesura que es compten les meses, al seu [web oficial de resultats](${url}); a les Canàries es vota fins a les 21:00 hora peninsular.`
            : `El Ministeri de l'Interior publica l'escrutini provisional a mesura que es compten les meses; a les Canàries es vota fins a les 21:00 hora peninsular. No havia anunciat el web on el publicarà (comprovat el ${checked}): [com seguir la nit electoral](${b2href("electionNight", "ca")}).`,
          official,
          ...townLine,
        ];
      }
      return [
        url
          ? `**Escrutini provisional:** el del Ministeri de l'Interior, al seu [web oficial de resultats](${url}).`
          : `**Escrutini provisional:** el difon el Ministeri de l'Interior (LOREG, article 98); no havia anunciat el web on el publicarà (comprovat el ${checked}).`,
        "**Escrutini general:** el fan les juntes electorals provincials del 4 al 7 de desembre; el resultat oficial es publica al BOE.",
        ...townLine,
        `**Membres de mesa:** si treballes per compte d'altri o ets funcionari, el dilluns 30 de novembre tens dret a cinc hores menys de feina, les cinc primeres de la jornada ([LOREG, article 28](${LOREG}); [Ordre EMT/232/2026](${EMT_232})).`,
      ];
    },
  },
  es: {
    title: {
      eve: "Mañana se vota: domingo 29 de noviembre, de 9 a 20 h",
      polling: "Hoy se vota: domingo 29 de noviembre, de 9 a 20 h",
      count: "Urnas cerradas: el escrutinio provisional, esta noche",
      after: "Elecciones del 29 de noviembre: resultados provisionales y escrutinio general",
    },
    ctaLabel: "Resultados en la web oficial del Ministerio del Interior",
    lines: (phase, { url, checked, town, hasResults }) => {
      const tomorrow = phase === "eve";
      const where = town
        ? `**Dónde votas ${town.where}:** ${town.places !== null && town.tables !== null ? `[los ${plural(town.places, "local electoral", "locales electorales")} y las ${plural(town.tables, "mesa", "mesas")}](${town.anchor}), de la lista oficial del BOP, más abajo` : `[los locales electorales](${town.anchor}), más abajo`}. Tu mesa te la dice la [consulta oficial del INE](${INE_MESA_URL}) con la provincia, el municipio y la inicial del primer apellido, sin identificarte, y la tarjeta censal.`
        : `**Dónde votas:** la [consulta oficial del INE](${INE_MESA_URL}) te dice la mesa y el local con la provincia, el municipio y la inicial del primer apellido, sin identificarte; también lo dice la tarjeta censal, enviada por correo del 2 al 10 de noviembre.`;
      const results = url
        ? `**Resultados:** el Ministerio del Interior publica el escrutinio provisional cuando termina la votación, a las 20:00 (en Canarias, a las 21:00 hora peninsular), en su [web oficial de resultados](${url}).`
        : `**Resultados:** el Ministerio del Interior publica el escrutinio provisional cuando termina la votación, a las 20:00 (en Canarias, a las 21:00 hora peninsular); en 2023 los primeros datos salieron a las 21:00. Aún no ha anunciado la web donde lo publicará (comprobado el ${checked}). [Cómo es la noche electoral](${b2href("electionNight", "es")}).`;
      if (phase === "eve" || phase === "polling") {
        return [
          `**Horario:** de 9:00 a 20:00. Si a las 20:00 estás dentro del local o en el acceso, todavía puedes votar ([LOREG, artículos 84 y 88](${LOREG})).`,
          `**Qué llevar:** el DNI, el pasaporte o el carné de conducir originales, con foto; valen aunque estén caducados, pero no fotocopias ([Ministerio del Interior](${PRESENCIAL})). También vale la app **MiDNI**: la mesa comprueba su código QR ([Junta Electoral Central, 5 de noviembre de 2026](${JEC_334})). La app MiDGT no vale.`,
          where,
          `**Si no apareces en la lista o tienes dudas:** la Oficina del Censo Electoral atiende gratis en el 900 343 232, el domingo 29 de 8:00 a 20:00, y hasta el mismo día su delegación provincial puede expedir una certificación censal específica, que acredita que estás en el censo aunque no figures en la lista de la mesa ([INE](${INE_29N})).`,
          `**Si trabajas ${tomorrow ? "mañana" : "hoy"}:** tienes derecho a hasta cuatro horas retribuidas para votar: cuatro si tu jornada coincide cuatro horas o más con el horario de votación, dos si coincide más de dos y menos de cuatro, ninguna si coincide dos o menos; la empresa elige el momento ([Ordre EMT/232/2026](${EMT_232})). **Miembros de mesa:** a las 8:00 en el local, con la notificación ([LOREG, artículo 80](${LOREG})); [qué hacer si te ha tocado](${b2href("mesa", "es")}).`,
          ...(tomorrow ? ["**Hoy, sábado 28, es la jornada de reflexión:** la campaña terminó a medianoche y ya no se pueden hacer actos ni difundir propaganda (LOREG, artículo 53)."] : []),
          results,
        ];
      }
      const official = "Son resultados provisionales: los oficiales salen del escrutinio general de las juntas electorales provinciales, del 4 al 7 de diciembre, y se publican en el BOE.";
      const townLine = town && !hasResults ? [`Los resultados del 29N ${town.where} aparecerán en esta página cuando el Ministerio del Interior publique el fichero oficial de resultados por municipios.`] : [];
      if (phase === "count") {
        return [
          url
            ? `El Ministerio del Interior publica el escrutinio provisional a medida que se cuentan las mesas, en su [web oficial de resultados](${url}); en Canarias se vota hasta las 21:00 hora peninsular.`
            : `El Ministerio del Interior publica el escrutinio provisional a medida que se cuentan las mesas; en Canarias se vota hasta las 21:00 hora peninsular. No había anunciado la web donde lo publicará (comprobado el ${checked}): [cómo seguir la noche electoral](${b2href("electionNight", "es")}).`,
          official,
          ...townLine,
        ];
      }
      return [
        url
          ? `**Escrutinio provisional:** el del Ministerio del Interior, en su [web oficial de resultados](${url}).`
          : `**Escrutinio provisional:** lo difunde el Ministerio del Interior (LOREG, artículo 98); no había anunciado la web donde lo publicará (comprobado el ${checked}).`,
        "**Escrutinio general:** lo hacen las juntas electorales provinciales del 4 al 7 de diciembre; el resultado oficial se publica en el BOE.",
        ...townLine,
        `**Miembros de mesa:** si trabajas por cuenta ajena o eres funcionario, el lunes 30 de noviembre tienes derecho a cinco horas menos de jornada, las cinco primeras ([LOREG, artículo 28](${LOREG}); [Ordre EMT/232/2026](${EMT_232})).`,
      ];
    },
  },
  en: {
    title: {
      eve: "Polling day is tomorrow: Sunday 29 November, 9:00 to 20:00",
      polling: "Polling day is today: Sunday 29 November, 9:00 to 20:00",
      count: "Polls closed: the provisional count comes in tonight",
      after: "29 November election: provisional results and the official count",
    },
    ctaLabel: "Results on the Spanish Interior Ministry's official site",
    lines: (phase, { url, checked, town, hasResults }) => {
      const tomorrow = phase === "eve";
      const where = town
        ? `**Where you vote ${town.where}:** ${town.places !== null && town.tables !== null ? `[the ${plural(town.places, "polling place", "polling places")} and ${plural(town.tables, "table", "tables")}](${town.anchor}) from the official BOP list, below` : `[the polling places](${town.anchor}), below`}. Your own table is on your census card and in the [INE's official lookup](${INE_MESA_URL}) (in Spanish), from your province, town and the first letter of your first surname, with no login.`
        : `**Where you vote:** the [INE's official lookup](${INE_MESA_URL}) (in Spanish) gives your table and polling place from your province, town and the first letter of your first surname, with no login; so does the census card posted from 2 to 10 November.`;
      const results = url
        ? `**Results:** the Spanish Interior Ministry publishes the provisional count once voting ends at 20:00 (21:00 peninsular time in the Canary Islands), on its [official results site](${url}).`
        : `**Results:** the Spanish Interior Ministry publishes the provisional count once voting ends at 20:00 (21:00 peninsular time in the Canary Islands); in 2023 the first figures came at 21:00. It has not yet announced the website it will use (checked on ${checked}). [How election night works](${b2href("electionNight", "en")}).`;
      if (phase === "eve" || phase === "polling") {
        return [
          `**Hours:** 9:00 to 20:00. If you are inside the polling place or at its entrance at 20:00, you can still vote ([electoral law, articles 84 and 88](${LOREG})).`,
          `**What to bring:** your original DNI, passport or driving licence, with a photo; they are valid even if expired, but photocopies are not ([Interior Ministry](${PRESENCIAL})). The **MiDNI** app is accepted too: the table checks its QR code ([Central Electoral Board, 5 November 2026](${JEC_334})). The MiDGT app is not. Only Spanish citizens on the electoral roll can vote.`,
          where,
          `**Not on the list, or unsure?** The census office's free line, 900 343 232, is open from 8:00 to 20:00 on Sunday 29 November, and until that day its provincial office can issue a specific census certificate (certificación censal específica), which proves you are on the roll even if you are missing from your table's list ([INE](${INE_29N})).`,
          `**Working ${tomorrow ? "tomorrow" : "today"}?** You are entitled to up to four paid hours to vote: four if your shift overlaps polling hours by four hours or more, two if by more than two and less than four, none if by two or less; your employer picks the time ([Ordre EMT/232/2026](${EMT_232})). **Polling-station members:** at the polling place at 8:00 with your notice ([electoral law, article 80](${LOREG})); [what to do if you were drawn](${b2href("mesa", "en")}).`,
          ...(tomorrow ? ["**Today, Saturday 28, is the day of reflection:** the campaign ended at midnight and no campaign event or material is allowed (electoral law, article 53)."] : []),
          results,
        ];
      }
      const official = "These figures are provisional: the official result comes from the provincial electoral boards' general count, 4 to 7 December, and is published in the BOE.";
      const townLine = town && !hasResults ? [`The 29 November results ${town.where} will appear on this page once the Interior Ministry publishes its official results file by municipality.`] : [];
      if (phase === "count") {
        return [
          url
            ? `The Spanish Interior Ministry publishes the provisional count as tables are counted, on its [official results site](${url}); the Canary Islands vote until 21:00 peninsular time.`
            : `The Spanish Interior Ministry publishes the provisional count as tables are counted; the Canary Islands vote until 21:00 peninsular time. It had not announced the website it will use (checked on ${checked}): [how to follow election night](${b2href("electionNight", "en")}).`,
          official,
          ...townLine,
        ];
      }
      return [
        url
          ? `**Provisional count:** the Interior Ministry's, on its [official results site](${url}).`
          : `**Provisional count:** published by the Interior Ministry (electoral law, article 98); it had not announced the website it will use (checked on ${checked}).`,
        "**Official count:** the provincial electoral boards hold the general count from 4 to 7 December; the official result is published in the BOE.",
        ...townLine,
        `**Polling-station members:** employees and civil servants who sat at a table are entitled to five fewer working hours on Monday 30 November, the first five of their day ([electoral law, article 28](${LOREG}); [Ordre EMT/232/2026](${EMT_232})).`,
      ];
    },
  },
};
