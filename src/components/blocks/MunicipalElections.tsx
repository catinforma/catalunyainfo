import { MunicipalResults, type MunicipalCopy } from "@/components/blocks/MunicipalResults";
import { ELECTIONS_SOURCE, loadMunicipalHistory, loadMunicipalities } from "@/lib/content/elections/history";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";

/**
 * Municipal election results with a municipality picker. Server-renders
 * Barcelona in full; the picker loads any other municipality on demand.
 */

const BARCELONA = "08019";

const COPY: Record<Locale, MunicipalCopy & { unavailable: string; sourceLine: string; note: string; months: string[] }> = {
  ca: {
    label: "Tria un municipi",
    placeholder: "Escriu el nom: Girona, Reus, Vic…",
    notFound: "No trobem aquest municipi. Tria'l de la llista.",
    loading: "Carregant resultats…",
    failed: "No hem pogut llegir les dades d'aquest municipi. Torna-ho a provar més tard.",
    latestTitle: "{place}: eleccions municipals de {date}",
    summary: "Participació del {turnout} %: {voters} votants d'un cens de {electorate}. S'escollien {seats} regidors.",
    openLists: "En aquest municipi es vota amb llistes obertes: les dades sumen els vots de cada candidat, així que només en mostrem els regidors.",
    colList: "Candidatura",
    colVotes: "Vots",
    colShare: "% vots vàlids",
    colSeats: "Regidors",
    historyTitle: "{place}: totes les eleccions municipals des del 1979",
    colDate: "Eleccions",
    colTurnout: "Participació",
    colSeatsByList: "Regidors per candidatura",
    unavailable: "Ara mateix no podem llegir les dades electorals de la Generalitat. Consulta-les directament a",
    sourceLine: "Dades de",
    note: "Percentatges calculats a partir dels recomptes, sobre vots vàlids. La llista amb més regidors no sempre governa: l'alcaldia surt de la votació del ple.",
    months: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  },
  es: {
    label: "Elige un municipio",
    placeholder: "Escribe el nombre: Girona, Reus, Vic…",
    notFound: "No encontramos este municipio. Elígelo de la lista.",
    loading: "Cargando resultados…",
    failed: "No hemos podido leer los datos de este municipio. Vuelve a probar más tarde.",
    latestTitle: "{place}: elecciones municipales de {date}",
    summary: "Participación del {turnout} %: {voters} votantes de un censo de {electorate}. Se elegían {seats} concejales.",
    openLists: "En este municipio se vota con listas abiertas: los datos suman los votos de cada candidato, así que solo mostramos los concejales.",
    colList: "Candidatura",
    colVotes: "Votos",
    colShare: "% votos válidos",
    colSeats: "Concejales",
    historyTitle: "{place}: todas las elecciones municipales desde 1979",
    colDate: "Elecciones",
    colTurnout: "Participación",
    colSeatsByList: "Concejales por candidatura",
    unavailable: "Ahora mismo no podemos leer los datos electorales de la Generalitat. Consúltalos directamente en",
    sourceLine: "Datos de",
    note: "Porcentajes calculados a partir de los recuentos, sobre votos válidos. La lista con más concejales no siempre gobierna: la alcaldía sale de la votación del pleno.",
    months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  },
  en: {
    label: "Pick a municipality",
    placeholder: "Type the name: Girona, Reus, Vic…",
    notFound: "We can't find that municipality. Pick it from the list.",
    loading: "Loading results…",
    failed: "We couldn't read the data for this municipality. Please try again later.",
    latestTitle: "{place}: local elections of {date}",
    summary: "Turnout {turnout} %: {voters} voters out of an electorate of {electorate}. {seats} councillors were elected.",
    openLists: "This municipality votes with open lists: the data add up each candidate's votes, so we show councillors only.",
    colList: "List",
    colVotes: "Votes",
    colShare: "% of valid votes",
    colSeats: "Councillors",
    historyTitle: "{place}: every local election since 1979",
    colDate: "Election",
    colTurnout: "Turnout",
    colSeatsByList: "Councillors by list",
    unavailable: "We can't read the Generalitat's election data right now. See it directly at",
    sourceLine: "Data from",
    note: "Percentages computed from the counts, over valid votes. The list with most councillors does not always govern: the mayor is elected by the council.",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
};

export async function MunicipalElections({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const [municipalities, barcelona] = await Promise.all([loadMunicipalities(), loadMunicipalHistory(BARCELONA)]);

  if (barcelona.error || barcelona.elections.length === 0 || municipalities.length === 0) {
    return (
      <section className="ci-elections">
        <p className="ci-calc-note">
          {t.unavailable}{" "}
          <a href={ELECTIONS_SOURCE.url} rel="noopener" target="_blank">
            {ELECTIONS_SOURCE.name}
          </a>
          .
        </p>
      </section>
    );
  }

  return (
    <section className="ci-elections">
      <MunicipalResults
        t={t}
        intlLocale={INTL_LOCALE[locale]}
        municipalities={municipalities}
        initial={barcelona}
        initialName="Barcelona"
        monthNames={t.months}
      />
      <p className="ci-calc-note">
        {t.sourceLine}{" "}
        <a href={ELECTIONS_SOURCE.url} rel="noopener" target="_blank">
          {ELECTIONS_SOURCE.name}
        </a>{" "}
        ({ELECTIONS_SOURCE.publisher}). {t.note}
      </p>
    </section>
  );
}
