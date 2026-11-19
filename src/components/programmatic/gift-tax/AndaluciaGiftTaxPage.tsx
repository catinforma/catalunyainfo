import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { giftPath, type GiftLocale } from "@/lib/programmatic/gift-tax/copy";
import { giftMeta } from "@/lib/programmatic/gift-tax/page";

import { GiftTaxBody } from "./GiftTaxBody";

/** The gift tax page for andalucia (Ley 5/2021, arts. 32 a 40 y 68). */
export function AndaluciaGiftTaxRoute({ locale }: { locale: GiftLocale }) {
  const crumbs = [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: giftMeta("andalucia", locale).breadcrumb, href: giftPath("andalucia", locale) }];
  return (
    <GiftTaxBody
      region="andalucia"
      locale={locale}
      crumbs={crumbs}
      nextStep={<CalculatorNextStep current="gift-tax-andalucia" locale={locale} />}
      more={<MoreCalculators current="gift-tax-andalucia" locale={locale} />}
    />
  );
}
