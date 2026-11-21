import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FuelPlaceRoute, NOT_FOUND_METADATA, SpainProvinceRoute, fuelPlaceMetadata, spainProvinceMetadata } from "@/components/programmatic/fuel/routes";
import { provinceStaticParams, resolveProvince, resolveSpainProvince, spainProvinceStaticParams } from "@/lib/programmatic/fuel/routing";

/**
 * /ca/benzineres/provincia/<provincia>/ — una província. Només `ca`.
 *  - Barcelona, Girona, Lleida, Tarragona: la pàgina de la família catalana
 *    (amb comarques i ciutats; el navegador torna a llegir els preus).
 *  - Les altres províncies i Ceuta i Melilla (21 Nov 2026): la pàgina
 *    d'Espanya, amb la llista nacional del Ministeri
 *    (lib/programmatic/fuel/spain-server.ts), només HTML del servidor.
 * Totes dues es regeneren cada mitja hora amb els preus a l'HTML.
 */
/** SERVER_REVALIDATE_SECONDS in lib/programmatic/fuel/server.ts and SPAIN_REVALIDATE_SECONDS in spain-server.ts (a literal: Next reads it statically). */
export const revalidate = 1800;
export const dynamicParams = true;

type Params = Promise<{ locale: string; provincia: string }>;

export function generateStaticParams() {
  return [...provinceStaticParams("ca"), ...spainProvinceStaticParams("ca", "provincia")];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, provincia } = await params;
  const place = resolveProvince("ca", locale, provincia);
  if (place) return fuelPlaceMetadata("ca", place);
  const spain = resolveSpainProvince("ca", locale, provincia);
  return spain ? spainProvinceMetadata("ca", spain) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: { params: Params }) {
  const { locale, provincia } = await params;
  const place = resolveProvince("ca", locale, provincia);
  if (place) return <FuelPlaceRoute locale="ca" place={place} />;
  const spain = resolveSpainProvince("ca", locale, provincia);
  if (!spain) notFound();
  return <SpainProvinceRoute locale="ca" province={spain} />;
}
