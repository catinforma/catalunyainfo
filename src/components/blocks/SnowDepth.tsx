import {
  AREA_LABEL,
  AREA_ORDER,
  METEOCAT_XEMA_URL,
  SNOW_SOURCE,
  formatInt,
  formatReadingTime,
  loadSnowReport,
  snowSummary,
  stationUrl,
  type StationSnow,
} from "@/lib/content/snow/depth";
import type { Locale } from "@/lib/i18n/config";

/**
 * Snow on the ground right now at Meteocat's mountain stations.
 *
 * An async server component, like ReservoirLevels: the answer has to be in the
 * HTML for "hi ha neu al Pirineu" to rank, and it has to be today's. The page
 * is rebuilt by the nightly cron (`snowDepth` is in DAY_DEPENDENT_BLOCKS), the
 * readings are cached no longer than the page (a day), and every row prints
 * the time of its own reading, because validated readings arrive a day or
 * more late.
 *
 * `loadSnowReport` throws when Meteocat cannot be read at runtime, and that is
 * deliberate: the throw fails the ISR regeneration, so the last good page
 * stays up instead of a day-long "could not read the data" page. Do not wrap
 * it in a try/catch or a Suspense boundary that would turn the failure into
 * rendered HTML. The `report.error` branch below is only reached during
 * `next build`.
 *
 * The strings live here rather than in the message files: the block is the
 * only thing that uses them.
 */

const COPY: Record<
  Locale,
  {
    label: string;
    station: string;
    depth: string;
    change: string;
    reading: string;
    noReading: string;
    sourceLine: string;
    note: string;
    checkMeteocat: string;
  }
> = {
  ca: {
    label: "Gruix de neu a les estacions del Meteocat",
    station: "Estació",
    depth: "Gruix de neu",
    change: "Canvi en 24 h",
    reading: "Lectura validada",
    noReading: "Cap lectura validada en 48 h",
    sourceLine: "Font:",
    note:
      "Només lectures validades pel Meteocat, en hora oficial de Catalunya. «Canvi en 24 h» compara amb la lectura validada d'un dia abans, quan n'hi ha: no és la neu nova caiguda. Cada nom enllaça amb la pàgina de l'estació al web del Meteocat, que mostra també les lectures automàtiques encara no validades.",
    checkMeteocat: "Consulta-les directament al web del Meteocat:",
  },
  es: {
    label: "Espesor de nieve en las estaciones de Meteocat",
    station: "Estación",
    depth: "Espesor de nieve",
    change: "Cambio en 24 h",
    reading: "Lectura validada",
    noReading: "Ninguna lectura validada en 48 h",
    sourceLine: "Fuente:",
    note:
      "Solo lecturas validadas por Meteocat, en hora oficial de Cataluña. «Cambio en 24 h» compara con la lectura validada de un día antes, cuando la hay: no es la nieve nueva caída. Cada nombre enlaza con la página de la estación en la web de Meteocat, que muestra también las lecturas automáticas aún no validadas.",
    checkMeteocat: "Consúltalas directamente en la web de Meteocat:",
  },
  en: {
    label: "Snow depth at Meteocat's stations",
    station: "Station",
    depth: "Snow depth",
    change: "24 h change",
    reading: "Validated reading",
    noReading: "No validated reading in 48 h",
    sourceLine: "Source:",
    note:
      "Validated Meteocat readings only, in Catalonia's local time. \"24 h change\" compares with the validated reading a day earlier, where there is one: it is not the amount of new snow. Each name links to the station's page on Meteocat's website, which also shows the automatic readings not yet validated.",
    checkMeteocat: "Check them directly on Meteocat's website:",
  },
};

function signed(value: number, locale: Locale): string {
  return `${value > 0 ? "+" : ""}${formatInt(value, locale)} cm`;
}

function StationRow({ station, locale }: { station: StationSnow; locale: Locale }) {
  const t = COPY[locale];
  const current = station.cm !== null && station.at !== null;
  return (
    <tr>
      <th scope="row">
        <a href={stationUrl(station.code)} rel="noopener" target="_blank">
          {station.name}
        </a>
        <small className="ci-reservoirs-place">
          {station.comarca} · {formatInt(station.altitude, locale)} m
        </small>
      </th>
      <td className="ci-numeric">{current ? <strong>{`${station.cm} cm`}</strong> : "—"}</td>
      <td className="ci-numeric">{current && station.change24h !== null ? signed(station.change24h, locale) : "—"}</td>
      {current ? (
        <td className="ci-numeric">{formatReadingTime(station.at!, locale)}</td>
      ) : (
        <td>
          <small>{t.noReading}</small>
        </td>
      )}
    </tr>
  );
}

export async function SnowDepth({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const report = await loadSnowReport();
  const [headline, ...detail] = snowSummary(report, locale);

  if (report.error || report.current === 0) {
    // Nothing current to show: say so, and send the reader to the source.
    // An old figure is never printed in place of today's.
    return (
      <section className="ci-reservoirs" aria-label={t.label}>
        <div className="ci-reservoirs-head">
          <p className="ci-reservoirs-figure">{headline}</p>
          <p>
            {t.checkMeteocat}{" "}
            <a href={METEOCAT_XEMA_URL} rel="noopener" target="_blank">
              meteo.cat
            </a>
            .
          </p>
        </div>
      </section>
    );
  }

  const groups = AREA_ORDER.map((area) => ({
    area,
    stations: report.stations.filter((station) => station.area === area),
  })).filter((group) => group.stations.length > 0);

  return (
    <section className="ci-reservoirs" aria-label={t.label}>
      <div className="ci-reservoirs-head">
        <p className="ci-reservoirs-figure">{headline}</p>
        {detail.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <div className="ci-table-scroll">
        <table className="ci-local-table ci-reservoirs-table">
          <thead>
            <tr>
              <th scope="col">{t.station}</th>
              <th scope="col">{t.depth}</th>
              <th scope="col">{t.change}</th>
              <th scope="col">{t.reading}</th>
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.area}>
              <tr>
                <th scope="rowgroup" colSpan={4}>
                  {AREA_LABEL[group.area][locale]}
                </th>
              </tr>
              {group.stations.map((station) => (
                <StationRow key={station.code} station={station} locale={locale} />
              ))}
            </tbody>
          ))}
        </table>
      </div>

      <p className="ci-calc-note">
        {t.note} {t.sourceLine}{" "}
        <a href={SNOW_SOURCE.url} rel="noopener" target="_blank">
          {SNOW_SOURCE.name}
        </a>
        , {SNOW_SOURCE.publisher}.
      </p>
    </section>
  );
}
