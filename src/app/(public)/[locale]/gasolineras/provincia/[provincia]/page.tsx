import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelPlaceRoute, NOT_FOUND_METADATA, SpainProvinceRoute, fuelPlaceMetadata, spainProvinceMetadata } from "@/components/programmatic/fuel/routes";
import { provinceStaticParams, resolveProvince, resolveSpainProvince, spainProvinceStaticParams } from "@/lib/programmatic/fuel/routing";

/**
 * /es/gasolineras/provincia/<provincia>/ — a province. `es` only.
 *  - Barcelona, Girona, Lleida, Tarragona: the Catalan family's page (with
 *    comarques and cities; prices re-read in the browser).
 *  - Every other province and Ceuta and Melilla (21 Nov 2026): the Spain page,
 *    from the Ministry's national list (lib/programmatic/fuel/spain-server.ts),
 *    server HTML only.
 * Both regenerate every half hour with the prices in the HTML.
 */
/** SERVER_REVALIDATE_SECONDS in lib/programmatic/fuel/server.ts and SPAIN_REVALIDATE_SECONDS in spain-server.ts (a literal: Next reads it statically). */
export const revalidate = 1800;
export const dynamicParams = true;

type Params = Promise<{ locale: string; provincia: string }>;

export function generateStaticParams() {
  return [...provinceStaticParams("es"), ...spainProvinceStaticParams("es", "provincia")];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, provincia } = await params;
  const place = resolveProvince("es", locale, provincia);
  if (place) return fuelPlaceMetadata("es", place);
  const spain = resolveSpainProvince("es", locale, provincia);
  return spain ? spainProvinceMetadata("es", spain) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, provincia } = await params;
  const place = resolveProvince("es", locale, provincia);
  if (place) return <FuelPlaceRoute locale="es" place={place} />;
  const spain = resolveSpainProvince("es", locale, provincia);
  if (!spain) notFound();
  return <SpainProvinceRoute locale="es" province={spain} />;
}
