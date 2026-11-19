import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { giftPath, type GiftLocale } from "@/lib/programmatic/gift-tax/copy";
import { giftMeta } from "@/lib/programmatic/gift-tax/page";

import { GiftTaxBody } from "./GiftTaxBody";

/** The gift tax page for catalonia (Codi tributari de Catalunya, llibre sisè, arts. 632-20 a 633-3). */
export function CataloniaGiftTaxRoute({ locale }: { locale: GiftLocale }) {
  const crumbs = [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: giftMeta("catalonia", locale).breadcrumb, href: giftPath("catalonia", locale) }];
  return (
    <GiftTaxBody
      region="catalonia"
      locale={locale}
      crumbs={crumbs}
      nextStep={<CalculatorNextStep current="gift-tax-catalonia" locale={locale} />}
      more={<MoreCalculators current="gift-tax-catalonia" locale={locale} />}
    />
  );
}
