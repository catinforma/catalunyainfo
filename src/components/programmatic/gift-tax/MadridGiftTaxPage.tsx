import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { giftPath, type GiftLocale } from "@/lib/programmatic/gift-tax/copy";
import { giftMeta } from "@/lib/programmatic/gift-tax/page";

import { GiftTaxBody } from "./GiftTaxBody";

/** The gift tax page for madrid (Decreto Legislativo 1/2010, arts. 22 bis a 25). */
export function MadridGiftTaxRoute({ locale }: { locale: GiftLocale }) {
  const crumbs = [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: giftMeta("madrid", locale).breadcrumb, href: giftPath("madrid", locale) }];
  return (
    <GiftTaxBody
      region="madrid"
      locale={locale}
      crumbs={crumbs}
      nextStep={<CalculatorNextStep current="gift-tax-madrid" locale={locale} />}
      more={<MoreCalculators current="gift-tax-madrid" locale={locale} />}
    />
  );
}
