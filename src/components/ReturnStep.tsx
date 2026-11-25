import { IntentLink } from "@/components/nav/IntentLink";
import { NextStepView } from "@/components/NextStepView";
import { WhatsAppIcon } from "@/components/share/FollowChannel";

import { RETURN_STEP_PLACEMENT } from "@/lib/analytics/events";
import { RETURN_STEP_TITLE, type ReturnStep as ReturnStepData } from "@/lib/engagement/return-step";
import type { Locale } from "@/lib/i18n/config";

/**
 * The "keep it" block of the strike and election pages, right after the
 * answer (lib/engagement/return-step.ts has the why and the rules): the
 * WhatsApp alert as a button, then at most two short links. Server-rendered,
 * no state, a fixed layout, so it cannot shift anything.
 *
 * Measured by the one click listener (AnalyticsClicks.tsx) from the data
 * attributes: `data-ci-placement` (the block), `data-ci-position` and
 * `data-ci-family` on it, `data-ci-target` on each link.
 *
 * The WhatsApp link is the channel's URL as it is (a link that leaves the
 * site), opened in a new tab like the end-of-article box.
 */
export function ReturnStep({ step, locale, className }: { step: ReturnStepData | null; locale: Locale; className?: string }) {
  if (!step) return null;
  return (
    <aside
      aria-label={RETURN_STEP_TITLE[locale]}
      className={`ci-return${className ? ` ${className}` : ""}`}
      data-ci-placement={RETURN_STEP_PLACEMENT}
      data-ci-position={step.position}
      data-ci-family={step.family}
    >
      {/* next_step_view, once per page view: the denominator of the click rate */}
      <NextStepView locale={locale} />
      <a href={step.whatsapp.href} rel="noopener" target="_blank" className="ci-return-wa" data-ci-target="whatsapp_channel">
        <WhatsAppIcon size={22} />
        <span className="ci-return-wa-text">
          <span className="ci-return-wa-label">{step.whatsapp.label}</span>
          <span className="ci-return-wa-note">{step.whatsapp.note}</span>
        </span>
      </a>
      {step.links.length > 0 ? (
        <ul className="ci-return-links">
          {step.links.map((link) => (
            <li key={link.href}>
              <IntentLink href={link.href} data-ci-target={link.target}>
                {link.label}
              </IntentLink>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}
