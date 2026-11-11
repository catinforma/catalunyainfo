import type { EmbedLocale, EmbedPlace } from "./places";
import { renderEmbed } from "./render";

/** The widget document. Framing and robots headers are next.config.ts's (`EMBED_SOURCE`). */
export function embedResponse(locale: EmbedLocale, place: EmbedPlace): Response {
  return new Response(renderEmbed(locale, place), { headers: { "content-type": "text/html; charset=utf-8" } });
}

export function notFoundResponse(): Response {
  return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
}
