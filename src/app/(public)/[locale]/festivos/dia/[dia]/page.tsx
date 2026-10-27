import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DateRoute, dateMetadata } from "@/components/programmatic/holidays/routes";
import { dateStaticParams, resolveDatePage } from "@/lib/programmatic/holidays/routing";

/** /es/festivos/dia/8-diciembre-2026/ — "¿Es festivo el 8 de diciembre de 2026 en Cataluña?" */
export const revalidate = false;
export const dynamicParams = false;

type Params = Promise<{ locale: string; dia: string }>;

export function generateStaticParams() {
  return dateStaticParams("es");
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, dia } = await params;
  const iso = resolveDatePage("es", locale, dia);
  return iso ? dateMetadata("es", iso) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { locale, dia } = await params;
  const iso = resolveDatePage("es", locale, dia);
  if (!iso) notFound();
  return <DateRoute locale="es" iso={iso} />;
}
