import type { Locale } from "@/lib/i18n/config";

import type { LiveGame, LiveKind } from "./phases";

/**
 * What the checkers say about the state of the official numbers, in ca, es
 * and en: pending before the data, partial, complete, missing after the day,
 * and the warning when the feed cannot be read. Small enough for the browser.
 * "Official" is each game's official place to check, always linked.
 */

export interface LiveCopy {
  /** The link's text: the official list or checker of the draw's organiser. */
  officialLabel: string;
  /** The line that is always shown, with the link after it. */
  officialLead: string;
  /** Per state. `time` is "13:05" in Madrid. */
  kind: Record<LiveKind, (time: string) => { title: string; text: string }>;
  stale: (time: string) => string;
  unreachable: string;
  /** A valid number typed while there are no official numbers to compare with. */
  pendingFor: (n: string) => string;
  loading: string;
}

const day = (game: LiveGame, l: Locale): string => {
  const d = {
    navidad: { es: "22 de diciembre", ca: "22 de desembre", en: "22 December" },
    grossa: { es: "31 de diciembre", ca: "31 de desembre", en: "31 December" },
    nino: { es: "6 de enero", ca: "6 de gener", en: "6 January" },
  }[game];
  return d[l];
};

const orgName = (game: LiveGame): string => (game === "grossa" ? "Loteries de Catalunya" : "SELAE");

export function liveCopy(game: LiveGame, locale: Locale): LiveCopy {
  const org = orgName(game);
  const when = day(game, locale);
  const all: Record<Locale, LiveCopy> = {
    es: {
      officialLabel: game === "grossa" ? "resultados oficiales de Loteries de Catalunya" : "comprobador y lista oficial de SELAE",
      officialLead: "Comprobación oficial:",
      kind: {
        "pending-before": () => ({
          title: `Pendiente: el sorteo es el ${when}`,
          text: `Aún no hay números oficiales. Cuando ${org} los publique, este comprobador los leerá solo, sin recargar la página. No usamos listas de otros medios.`,
        }),
        "pending-today": () => ({
          title: "Pendiente: todavía no hemos cargado números oficiales",
          text: `El sorteo es hoy. En cuanto ${org} publique los números los cargamos aquí (esta página se actualiza sola cada minuto). Mientras tanto, compruébalo en ${org}.`,
        }),
        partial: (time) => ({
          title: `Números oficiales hasta ahora (leídos a las ${time})`,
          text: "El sorteo o la lista aún no están completos: un número que todavía no aparece puede tener premio. No te diremos «sin premio» hasta tenerlos todos.",
        }),
        complete: (time) => ({
          title: `Todos los números oficiales (leídos a las ${time})`,
          text: `Para cobrar solo vale la lista oficial de ${org}.`,
        }),
        "missing-after": () => ({
          title: "Los números de este sorteo no están cargados en esta página",
          text: `El sorteo ya se celebró. Comprueba tu décimo directamente en ${org}.`,
        }),
      },
      stale: (time: string) => `No hemos podido actualizar los números. Mostramos los últimos leídos, de las ${time}: puede haber números nuevos. Comprueba en ${org}.`,
      unreachable: `No hemos podido cargar los números. Comprueba tu décimo en ${org}.`,
      pendingFor: (n: string) => `El ${n} no se puede comprobar todavía: aún no hay números oficiales cargados. Pendiente.`,
      loading: "Cargando los números oficiales…",
    },
    ca: {
      officialLabel: game === "grossa" ? "resultats oficials de Loteries de Catalunya" : "comprovador i llista oficial de SELAE",
      officialLead: "Comprovació oficial:",
      kind: {
        "pending-before": () => ({
          title: `Pendent: el sorteig és el ${when}`,
          text: `Encara no hi ha números oficials. Quan ${org} els publiqui, aquest comprovador els llegirà sol, sense recarregar la pàgina. No fem servir llistes d'altres mitjans.`,
        }),
        "pending-today": () => ({
          title: "Pendent: encara no hem carregat números oficials",
          text: `El sorteig és avui. Tan bon punt ${org} publiqui els números els carreguem aquí (aquesta pàgina s'actualitza sola cada minut). Mentrestant, comprova'l a ${org}.`,
        }),
        partial: (time) => ({
          title: `Números oficials fins ara (llegits a les ${time})`,
          text: "El sorteig o la llista encara no són complets: un número que encara no hi surt pot tenir premi. No et direm «sense premi» fins a tenir-los tots.",
        }),
        complete: (time) => ({
          title: `Tots els números oficials (llegits a les ${time})`,
          text: `Per cobrar només val la llista oficial de ${org}.`,
        }),
        "missing-after": () => ({
          title: "Els números d'aquest sorteig no estan carregats en aquesta pàgina",
          text: `El sorteig ja s'ha celebrat. Comprova el teu dècim directament a ${org}.`,
        }),
      },
      stale: (time: string) => `No hem pogut actualitzar els números. Mostrem els últims llegits, de les ${time}: pot haver-hi números nous. Comprova a ${org}.`,
      unreachable: `No hem pogut carregar els números. Comprova el teu dècim a ${org}.`,
      pendingFor: (n: string) => `El ${n} encara no es pot comprovar: encara no hi ha números oficials carregats. Pendent.`,
      loading: "Carregant els números oficials…",
    },
    en: {
      officialLabel: game === "grossa" ? "official results from Loteries de Catalunya" : "SELAE's official checker and list",
      officialLead: "Official check:",
      kind: {
        "pending-before": () => ({
          title: `Pending: the draw is on ${when}`,
          text: `There are no official numbers yet. When ${org} publishes them, this checker reads them by itself, without reloading the page. We do not use other outlets' lists.`,
        }),
        "pending-today": () => ({
          title: "Pending: we have not loaded official numbers yet",
          text: `The draw is today. As soon as ${org} publishes the numbers we load them here (this page refreshes by itself every minute). Meanwhile, check with ${org}.`,
        }),
        partial: (time) => ({
          title: `Official numbers so far (read at ${time} Madrid time)`,
          text: "The draw or the list is not complete yet: a number that does not appear yet may still win. We will not say \"no prize\" until every number is in.",
        }),
        complete: (time) => ({
          title: `Every official number (read at ${time} Madrid time)`,
          text: `Only ${org}'s official list is valid for payment.`,
        }),
        "missing-after": () => ({
          title: "This draw's numbers are not loaded on this page",
          text: `The draw has taken place. Check your ticket directly with ${org}.`,
        }),
      },
      stale: (time: string) => `We could not refresh the numbers. Showing the last ones read, at ${time} (Madrid): newer numbers may exist. Check with ${org}.`,
      unreachable: `We could not load the numbers. Check your ticket with ${org}.`,
      pendingFor: (n: string) => `${n} cannot be checked yet: no official numbers are loaded. Pending.`,
      loading: "Loading the official numbers…",
    },
  };
  return all[locale];
}

/**
 * Height to reserve for the status box so a change of state (SSR text, the
 * browser's first answer, "so far" to "complete") does not move the page
 * (CLS): the tallest state of this game and language, in em of the callout's
 * font, for a narrow (phone) and a wide column. Characters per line are
 * conservative estimates (the title is bold), not measurements.
 */
export function reservedHeight(game: LiveGame, locale: Locale): { narrow: string; wide: string } {
  const t = liveCopy(game, locale);
  const kinds = ["pending-before", "pending-today", "partial", "complete", "missing-after"] as const;
  const official = `${t.officialLead} ${t.officialLabel}.`;
  const em = (perLine: number) => {
    const lines = (s: string) => Math.max(1, Math.ceil(s.length / perLine));
    const heights = kinds.map((k) => {
      const c = t.kind[k]("13:05");
      const paragraphs = 3;
      return (lines(c.title) + lines(c.text) + lines(official)) * 1.6 + paragraphs * 0.9 + 2.2;
    });
    return `${Math.ceil(Math.max(...heights) * 10) / 10}em`;
  };
  return { narrow: em(34), wide: em(64) };
}

/** "13:05", Madrid time, of an ISO instant. */
export function hhmmMadrid(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}
