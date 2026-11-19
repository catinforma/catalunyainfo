import Link from "next/link";

import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { calcPath, type CalculatorId } from "@/lib/programmatic/calculators/paths";
import { GIFT_FAMILY, GIFT_OF_INHERITANCE, GIFT_REGION_IN } from "@/lib/programmatic/gift-tax/copy";
import type { IsdLocale } from "@/lib/programmatic/inheritance-tax/copy";
import { INHERITANCE_FAMILY } from "@/lib/programmatic/inheritance-tax/regional-copy";

/**
 * "Impuesto de sucesiones en otras comunidades": the other inheritance tax
 * calculators (Catalonia, Madrid, Andalucía, Comunitat Valenciana), on each
 * of the four pages. Which community's rules apply depends on where the
 * deceased lived, so a reader on the wrong page finds the right one. Then the
 * same community's gift tax calculator (lib/programmatic/gift-tax), for a
 * reader weighing a gift in life against an inheritance. Last, the guide to
 * the steps after a death (lib/content/batch02/death-steps.ts), which links
 * back to these calculators.
 */
export function InheritanceByRegion({ current, locale }: { current: CalculatorId; locale: IsdLocale }) {
  const heading = { ca: "L'impost de successions en altres comunitats", es: "El impuesto de sucesiones en otras comunidades", en: "Inheritance tax in other regions" }[locale];
  const lead = {
    ca: "S'aplica la norma de la comunitat on la persona morta va viure més dies dels últims cinc anys:",
    es: "Se aplica la norma de la comunidad donde la persona fallecida vivió más días de los últimos cinco años:",
    en: "The rules of the region where the deceased lived the most days of the last five years apply:",
  }[locale];
  const label = { ca: "Calculadora per a", es: "Calculadora para", en: "Calculator for" }[locale];
  const giftId = GIFT_OF_INHERITANCE[current];
  const gift = giftId ? GIFT_FAMILY.find((f) => f.id === giftId) : undefined;
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
      <p>
        <Link href={calcPath("inheritance-tax-by-region", locale)}>
          {
            {
              ca: "Les normes dels 21 territoris, una al costat de l'altra i amb el mateix exemple: l'impost de successions per comunitat",
              es: "Las normas de los 21 territorios, una al lado de otra y con el mismo ejemplo: el impuesto de sucesiones por comunidad",
              en: "All 21 territories' rules side by side, with one worked example: inheritance tax by region",
            }[locale]
          }
        </Link>
      </p>
      {gift ? (
        <p>
          <Link href={calcPath(gift.id, locale)}>
            {
              {
                ca: `Si és una donació en vida: calculadora de l'impost de donacions ${GIFT_REGION_IN[gift.region].ca}`,
                es: `Si es una donación en vida: calculadora del impuesto de donaciones ${GIFT_REGION_IN[gift.region].es}`,
                en: `If it is a gift during the donor's lifetime: the gift tax calculator ${GIFT_REGION_IN[gift.region].en}`,
              }[locale]
            }
          </Link>
        </p>
      ) : null}
      <p>
        {{ ca: "Els certificats, el notari i els altres terminis:", es: "Los certificados, el notario y los demás plazos:", en: "The certificates, the notary and the other deadlines:" }[locale]}{" "}
        <Link href={b2href("deathSteps", locale)}>{B2_TITLES.deathSteps[locale]}</Link>
      </p>
    </section>
  );
}
