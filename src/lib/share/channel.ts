import type { Locale } from "@/lib/i18n/config";

/**
 * The WhatsApp channel (created by the owner on 13 Nov 2026). A channel is
 * one-way: followers see the channel name and logo, never the admin's number.
 *
 * A plain link, no WhatsApp script: the CSP and the consent model are
 * untouched, and nothing loads until the reader taps it. Checked with curl on
 * 13 Nov 2026 (og:title "CatalunyaInfo").
 */
export const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VbEgw2ZJpe8jQPi18O3O";

export const FOLLOW_CHANNEL_COPY: Record<Locale, { title: string; text: string; cta: string; short: string }> = {
  ca: {
    title: "Segueix CatalunyaInfo a WhatsApp",
    text: "El que cal saber avui a Catalunya i plans per al cap de setmana, al teu mòbil. Ningú veu el teu número.",
    cta: "Segueix el canal",
    short: "Segueix-nos a WhatsApp",
  },
  es: {
    title: "Sigue a CatalunyaInfo en WhatsApp",
    text: "Lo que hay que saber hoy en Cataluña y planes para el fin de semana, en tu móvil. Nadie ve tu número.",
    cta: "Seguir el canal",
    short: "Síguenos en WhatsApp",
  },
  en: {
    title: "Follow CatalunyaInfo on WhatsApp",
    text: "What to know today in Catalonia and weekend ideas, on your phone. Nobody sees your number.",
    cta: "Follow the channel",
    short: "Follow us on WhatsApp",
  },
};
