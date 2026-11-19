import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import type { IsdLocale } from "@/lib/programmatic/inheritance-tax/copy";
import { regionPath } from "@/lib/programmatic/inheritance-tax/regional-copy";
import { regionMeta } from "@/lib/programmatic/inheritance-tax/regional-page";

import { RegionalInheritanceTaxBody } from "./RegionalInheritanceTaxBody";

/** "Impuesto de sucesiones en la Comunidad de Madrid" (Decreto Legislativo 1/2010, arts. 21-26). */
export function MadridInheritanceTaxRoute({ locale }: { locale: IsdLocale }) {
  const crumbs = [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: regionMeta("madrid", locale).breadcrumb, href: regionPath("madrid", locale) }];
  return (
    <RegionalInheritanceTaxBody
      region="madrid"
      locale={locale}
      crumbs={crumbs}
      nextStep={<CalculatorNextStep current="inheritance-tax-madrid" locale={locale} />}
      more={<MoreCalculators current="inheritance-tax-madrid" locale={locale} />}
    />
  );
}
