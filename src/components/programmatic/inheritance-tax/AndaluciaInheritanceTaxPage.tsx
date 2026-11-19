import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import type { IsdLocale } from "@/lib/programmatic/inheritance-tax/copy";
import { regionPath } from "@/lib/programmatic/inheritance-tax/regional-copy";
import { regionMeta } from "@/lib/programmatic/inheritance-tax/regional-page";

import { RegionalInheritanceTaxBody } from "./RegionalInheritanceTaxBody";

/** "Impuesto de sucesiones en Andalucía" (Ley 5/2021 de Tributos Cedidos, arts. 26-29 and 37-39). */
export function AndaluciaInheritanceTaxRoute({ locale }: { locale: IsdLocale }) {
  const crumbs = [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: regionMeta("andalucia", locale).breadcrumb, href: regionPath("andalucia", locale) }];
  return (
    <RegionalInheritanceTaxBody
      region="andalucia"
      locale={locale}
      crumbs={crumbs}
      nextStep={<CalculatorNextStep current="inheritance-tax-andalucia" locale={locale} />}
      more={<MoreCalculators current="inheritance-tax-andalucia" locale={locale} />}
    />
  );
}
