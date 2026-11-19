import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import type { IsdLocale } from "@/lib/programmatic/inheritance-tax/copy";
import { regionPath } from "@/lib/programmatic/inheritance-tax/regional-copy";
import { regionMeta } from "@/lib/programmatic/inheritance-tax/regional-page";

import { RegionalInheritanceTaxBody } from "./RegionalInheritanceTaxBody";

/** "Impuesto de sucesiones en la Comunidad Valenciana" (Ley 13/1997, arts. 10-12 quáter). */
export function ValenciaInheritanceTaxRoute({ locale }: { locale: IsdLocale }) {
  const crumbs = [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: regionMeta("valencia", locale).breadcrumb, href: regionPath("valencia", locale) }];
  return (
    <RegionalInheritanceTaxBody
      region="valencia"
      locale={locale}
      crumbs={crumbs}
      nextStep={<CalculatorNextStep current="inheritance-tax-valencia" locale={locale} />}
      more={<MoreCalculators current="inheritance-tax-valencia" locale={locale} />}
    />
  );
}
