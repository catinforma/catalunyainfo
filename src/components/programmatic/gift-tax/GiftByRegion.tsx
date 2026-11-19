import Link from "next/link";

import { calcPath } from "@/lib/programmatic/calculators/paths";
import { GIFT_FAMILY, GIFT_REGION_IN, INHERITANCE_OF, type GiftLocale } from "@/lib/programmatic/gift-tax/copy";
import type { GiftRegionId } from "@/lib/programmatic/gift-tax/regions/types";

/**
 * "El impuesto de donaciones en otras comunidades": the other three gift tax
 * calculators, then the same community's inheritance tax calculator, on each
 * of the four gift pages. Which community taxes a gift depends on where a
 * property is or where the donee lives, so a reader on the wrong page finds
 * the right one; a reader weighing a gift now against an inheritance later
 * finds the other tax.
 */
export function GiftByRegion({ current, locale }: { current: GiftRegionId; locale: GiftLocale }) {
  const heading = { ca: "L'impost de donacions en altres comunitats", es: "El impuesto de donaciones en otras comunidades", en: "Gift tax in other regions" }[locale];
  const lead = {
    ca: "Un immoble paga a la comunitat on és; els diners i els altres béns, a la comunitat on viu qui rep la donació:",
    es: "Un inmueble paga en la comunidad donde está; el dinero y los demás bienes, en la comunidad donde vive quien recibe la donación:",
    en: "A property is taxed in the region where it is; money and other assets, in the region where the person receiving the gift lives:",
  }[locale];
  const label = { ca: "Calculadora per a", es: "Calculadora para", en: "Calculator for" }[locale];
  const inheritance = {
    ca: `Si en comptes d'una donació és una herència: calculadora de l'impost de successions ${GIFT_REGION_IN[current].ca}`,
    es: `Si en vez de una donación es una herencia: calculadora del impuesto de sucesiones ${GIFT_REGION_IN[current].es}`,
    en: `If it is an inheritance rather than a gift: the inheritance tax calculator ${GIFT_REGION_IN[current].en}`,
  }[locale];
  return (
    <section aria-labelledby="donaciones-comunidades">
      <h2 id="donaciones-comunidades">{heading}</h2>
      <p>{lead}</p>
      <ul>
        {GIFT_FAMILY.filter((f) => f.region !== current).map((f) => (
          <li key={f.id}>
            <Link href={calcPath(f.id, locale)}>
              {label} {f.name[locale]}
            </Link>
          </li>
        ))}
      </ul>
      <p>
        <Link href={calcPath(INHERITANCE_OF[current], locale)}>{inheritance}</Link>
      </p>
      <p>
        <Link href={`${calcPath("inheritance-tax-by-region", locale)}#donaciones`}>
          {
            {
              ca: "La donació de pares a fills als 21 territoris: bonificació i requisit de forma de cadascun",
              es: "La donación de padres a hijos en los 21 territorios: bonificación y requisito de forma de cada uno",
              en: "Gifts from parents to children in all 21 territories: each one's rebate and formal requirement",
            }[locale]
          }
        </Link>
      </p>
    </section>
  );
}
