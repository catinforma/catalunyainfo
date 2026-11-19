import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { giftPath, type GiftLocale } from "@/lib/programmatic/gift-tax/copy";
import { giftMeta } from "@/lib/programmatic/gift-tax/page";

import { GiftTaxBody } from "./GiftTaxBody";

/** The gift tax page for valencia (Ley 13/1997, arts. 10 bis a 12 ter). */
export function ValenciaGiftTaxRoute({ locale }: { locale: GiftLocale }) {
  const crumbs = [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: giftMeta("valencia", locale).breadcrumb, href: giftPath("valencia", locale) }];
  return (
    <GiftTaxBody
      region="valencia"
      locale={locale}
      crumbs={crumbs}
      nextStep={<CalculatorNextStep current="gift-tax-valencia" locale={locale} />}
      more={<MoreCalculators current="gift-tax-valencia" locale={locale} />}
    />
  );
}
