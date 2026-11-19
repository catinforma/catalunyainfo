import Link from "next/link";

import { calcPath, type CalculatorId } from "@/lib/programmatic/calculators/paths";
import type { IsdLocale } from "@/lib/programmatic/inheritance-tax/copy";
import { INHERITANCE_FAMILY } from "@/lib/programmatic/inheritance-tax/regional-copy";

/**
 * "Impuesto de sucesiones en otras comunidades": the other inheritance tax
 * calculators (Catalonia, Madrid, Andalucía, Comunitat Valenciana), on each
 * of the four pages. Which community's rules apply depends on where the
 * deceased lived, so a reader on the wrong page finds the right one.
 */
export function InheritanceByRegion({ current, locale }: { current: CalculatorId; locale: IsdLocale }) {
  const heading = { ca: "L'impost de successions en altres comunitats", es: "El impuesto de sucesiones en otras comunidades", en: "Inheritance tax in other regions" }[locale];
  const lead = {
    ca: "S'aplica la norma de la comunitat on la persona morta va viure més dies dels últims cinc anys:",
    es: "Se aplica la norma de la comunidad donde la persona fallecida vivió más días de los últimos cinco años:",
    en: "The rules of the region where the deceased lived the most days of the last five years apply:",
  }[locale];
  const label = { ca: "Calculadora per a", es: "Calculadora para", en: "Calculator for" }[locale];
  return (
    <section aria-labelledby="successions-comunitats">
      <h2 id="successions-comunitats">{heading}</h2>
      <p>{lead}</p>
      <ul>
        {INHERITANCE_FAMILY.filter((f) => f.id !== current).map((f) => (
          <li key={f.id}>
            <Link href={calcPath(f.id, locale)}>
              {label} {f.name[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
