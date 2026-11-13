import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReservoirHubPage } from "@/components/programmatic/reservoirs/ReservoirPages";
import { NOT_FOUND_METADATA, resolveReservoirHub, reservoirHubMetadata } from "@/lib/programmatic/reservoirs/pages";
import { loadServerReservoirs, loadTotalPercent } from "@/lib/programmatic/reservoirs/server";

/**
 * /es/embalses/ — los embalses de la ACA, uno a uno. Solo `es`; ISR cada tres
 * horas con la lectura de la ACA en el HTML (lib/programmatic/reservoirs/
 * server.ts), y el navegador la vuelve a leer.
 */
const ROUTE = "es";

/** SERVER_REVALIDATE_SECONDS (a literal: Next reads it statically). */
export const revalidate = 10800;
// Regenerated on a timer: self-hosted, a dynamicParams = false route then 404s.
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveReservoirHub(ROUTE, (await params).locale);
  return locale ? reservoirHubMetadata(locale) : NOT_FOUND_METADATA;
}

export default async function Page({ params }: Props) {
  const locale = resolveReservoirHub(ROUTE, (await params).locale);
  if (!locale) notFound();
  const [server, totalPct] = await Promise.all([loadServerReservoirs(), loadTotalPercent()]);
  return <ReservoirHubPage locale={locale} server={server} totalPct={totalPct} />;
}
