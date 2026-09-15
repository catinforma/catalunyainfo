import "server-only";

import { SITE } from "@/lib/site";
import type { ContactTopic } from "@/lib/db/schema";

/**
 * Delivers a copy of a contact message to the editorial inbox.
 *
 * The message is stored in `contact_messages` first and this runs afterwards,
 * so a mail provider that is down, rate-limited or simply not configured yet
 * can never lose a reader's message: the row is the record, the email is the
 * notification. That ordering is the whole design.
 *
 * Provider is Resend over plain HTTPS - no SDK, no extra dependency to audit
 * for something that is one POST. With no `RESEND_API_KEY` set, this returns
 * `false` and the admin inbox is the only route; nothing throws.
 */

export interface ContactPayload {
  id: string;
  locale: string;
  topic: ContactTopic;
  name: string;
  email: string;
  aboutPath: string | null;
  message: string;
}

/** Strips CR/LF so nothing a reader types can inject a mail header. */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, 200);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function notifyEditorial(payload: ContactPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  // Must be a verified sender at the provider. Resend's shared onboarding
  // sender works before a domain is verified, which is why it is the default.
  const from = process.env.CONTACT_FROM ?? "CatalunyaInfo <onboarding@resend.dev>";
  const to = process.env.CONTACT_TO ?? SITE.contactEmail;

  const subject = `[${payload.topic}] ${headerSafe(payload.name)} · ${payload.locale}`;
  const lines = [
    `<p><strong>De:</strong> ${escapeHtml(payload.name)} &lt;${escapeHtml(payload.email)}&gt;</p>`,
    `<p><strong>Motiu:</strong> ${escapeHtml(payload.topic)} · <strong>Idioma:</strong> ${escapeHtml(payload.locale)}</p>`,
    payload.aboutPath
      ? `<p><strong>Pàgina:</strong> ${escapeHtml(payload.aboutPath)}</p>`
      : "",
    "<hr>",
    `<p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>`,
    "<hr>",
    `<p style="color:#666;font-size:12px">id ${escapeHtml(payload.id)}</p>`,
  ];

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        // Answering the notification answers the reader.
        reply_to: payload.email,
        subject,
        html: lines.filter(Boolean).join("\n"),
      }),
      // A slow provider must not hold the reader's request open.
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error("[contact] provider rejected the message:", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      "[contact] notification failed, the message is still stored:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
