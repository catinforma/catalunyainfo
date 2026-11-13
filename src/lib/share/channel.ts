import { b2href } from "@/lib/content/batch02/shared";
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

/**
 * The same box on the pages people come back to every day ("Avui a
 * Catalunya", the strikes hub), where the channel's daily post
 * (lib/share/channel-message.ts) repeats what the page answers. The post is
 * written in Catalan only, and the Spanish and English boxes say so.
 */
export function isDailyFollowPage(href: string): boolean {
  const clean = href.split(/[?#]/)[0]!.replace(/\/*$/, "/");
  return (["ca", "es", "en"] as const).some((locale) => clean === b2href("strikes", locale));
}

export const DAILY_FOLLOW_COPY: Record<Locale, { title: string; text: string; cta: string }> = {
  ca: {
    title: "Rep això cada matí al WhatsApp",
    text: "Cada matí, al canal de CatalunyaInfo: si és festiu, si hi ha vaga i què cal saber del dia, amb l'enllaç a la pàgina completa. Ningú veu el teu número.",
    cta: "Segueix el canal",
  },
  es: {
    title: "Recibe esto cada mañana en WhatsApp",
    text: "Cada mañana, en el canal de CatalunyaInfo (en catalán): si es festivo, si hay huelga y qué hay que saber del día, con el enlace a la página completa. Nadie ve tu número.",
    cta: "Seguir el canal",
  },
  en: {
    title: "Get this every morning on WhatsApp",
    text: "Every morning on the CatalunyaInfo channel (in Catalan): whether it is a holiday, any strikes and what to know that day, with a link to the full page. Nobody sees your number.",
    cta: "Follow the channel",
  },
};
