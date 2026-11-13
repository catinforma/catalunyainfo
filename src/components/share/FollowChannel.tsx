import type { Locale } from "@/lib/i18n/config";

import { DAILY_FOLLOW_COPY, FOLLOW_CHANNEL_COPY, WHATSAPP_CHANNEL_URL } from "@/lib/share/channel";

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} focusable="false">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2.1.7 2.8.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.3z"
      />
    </svg>
  );
}

/**
 * End-of-article box. `daily` on the pages readers revisit every day (the
 * daily page, the strikes hub): "get this every morning".
 */
export function FollowChannel({ locale, variant = "default" }: { locale: Locale; variant?: "default" | "daily" }) {
  const c = variant === "daily" ? DAILY_FOLLOW_COPY[locale] : FOLLOW_CHANNEL_COPY[locale];
  return (
    <aside className="ci-follow ci-measure mt-10" aria-label={c.title}>
      <p className="ci-follow-title">{c.title}</p>
      <p className="ci-follow-text">{c.text}</p>
      <a href={WHATSAPP_CHANNEL_URL} rel="noopener" target="_blank" className="ci-follow-button">
        <WhatsAppIcon />
        {c.cta}
      </a>
    </aside>
  );
}

/** One-line link for the footer. */
export function FollowChannelLink({ locale }: { locale: Locale }) {
  return (
    <a href={WHATSAPP_CHANNEL_URL} rel="noopener" target="_blank" className="ci-follow-link">
      <WhatsAppIcon size={16} />
      {FOLLOW_CHANNEL_COPY[locale].short}
    </a>
  );
}
