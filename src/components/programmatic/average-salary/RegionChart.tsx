import { REGION_LABEL, euros, type WageLocale } from "@/lib/programmatic/average-salary/copy";
import type { RegionId } from "@/lib/programmatic/average-salary/ine";

/**
 * Mean gross salary per community, ranked, as plain HTML bars (no chart
 * library, nothing to load): one hue (--color-sea, light and dark), bars
 * grown from one baseline at zero, a hairline at Spain's mean, and each
 * community's name and figure as text beside its bar, so the chart reads
 * without colour and with a screen reader (the bars themselves are hidden
 * from it). The same figures are in the table right below.
 */

export interface ChartRow {
  region: Exclude<RegionId, "es">;
  mean: number;
}

const L = <T,>(locale: WageLocale, v: Record<WageLocale, T>): T => v[locale];

export function RegionChart({ locale, rows, national, year, tableId }: { locale: WageLocale; rows: ChartRow[]; national: number; year: number; tableId: number }) {
  const max = Math.max(...rows.map((r) => r.mean), national);
  const at = (v: number) => `${((v / max) * 100).toFixed(2)}%`;
  const title = L(locale, {
    es: `Salario medio bruto anual por comunidad autónoma, ${year}`,
    ca: `Salari mitjà brut anual per comunitat autònoma, ${year}`,
    en: `Average gross yearly salary by region, ${year}`,
  });
  const key = L(locale, {
    es: `La línea vertical marca la media de España (${euros(national, locale)}). Las barras empiezan en 0 €.`,
    ca: `La línia vertical marca la mitjana d'Espanya (${euros(national, locale)}). Les barres comencen a 0 €.`,
    en: `The vertical line marks Spain's mean (${euros(national, locale)}). Bars start at €0.`,
  });
  const source = L(locale, { es: `Fuente: INE, Encuesta Anual de Estructura Salarial, tabla ${tableId}.`, ca: `Font: INE, Enquesta Anual d'Estructura Salarial, taula ${tableId}.`, en: `Source: INE, Annual Wage Structure Survey, table ${tableId}.` });

  return (
    <figure className="my-6">
      <figcaption className="mb-1 font-semibold">{title}</figcaption>
      <p className="mt-0 text-sm text-[var(--color-muted)]">{key}</p>
      <ol className="m-0 list-none p-0">
        {rows.map((r) => (
          <li key={r.region} className="grid grid-cols-[minmax(7.5rem,11rem)_1fr] items-center gap-x-3 py-[3px] text-sm sm:grid-cols-[11rem_1fr_6.5rem]">
            <span className="leading-tight">{REGION_LABEL[r.region][locale]}</span>
            <span className="relative block h-[14px]" aria-hidden="true">
              <span className="absolute inset-y-0 left-0 rounded-r-[4px] bg-[var(--color-sea)]" style={{ width: at(r.mean) }} />
              <span className="absolute -inset-y-[3px] w-px bg-[var(--color-ink)]" style={{ left: at(national) }} />
            </span>
            <span className="col-start-2 text-right tabular-nums text-[var(--color-ink-soft)] sm:col-start-3">{euros(r.mean, locale)}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-[var(--color-muted)]">{source}</p>
    </figure>
  );
}
