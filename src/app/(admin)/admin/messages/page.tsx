import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { listContactMessages } from "@/lib/admin/queries";
import { formatDate } from "@/lib/format";
import { SITE } from "@/lib/site";
import { MessageActions } from "./MessageActions";

export const dynamic = "force-dynamic";

/**
 * The contact inbox.
 *
 * The form stores first and emails second, so this page is the authoritative
 * record: a message is here whether or not the mail provider was configured,
 * reachable or throttled when it arrived. The "delivered" column says which of
 * the two happened.
 */

const TOPIC_LABEL: Record<string, string> = {
  correction: "Correcció",
  editorial: "Contingut",
  press: "Premsa",
  collaboration: "Col·laboració",
  privacy: "Privadesa",
  other: "Altres",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Nou",
  read: "Llegit",
  answered: "Respost",
  spam: "Brossa",
};

export default async function MessagesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const messages = await listContactMessages();
  const unread = messages.filter((message) => message.status === "new").length;
  const undelivered = messages.filter((message) => !message.deliveredAt).length;

  return (
    <main className="ci-shell py-10">
      <div className="ci-section-head">
        <h1 className="text-3xl">Missatges</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {messages.length} en total · {unread} sense llegir
        </p>
      </div>

      {undelivered > 0 ? (
        <p className="ci-callout ci-callout-warning mt-4">
          {undelivered} missatge{undelivered === 1 ? "" : "s"} no s&apos;han pogut enviar per
          correu a {SITE.contactEmail}: es llegeixen aquí igualment. Per activar l&apos;avís per
          correu, defineix <code>RESEND_API_KEY</code> a les variables d&apos;entorn de
          producció.
        </p>
      ) : null}

      <ul className="mt-8 flex list-none flex-col gap-4 p-0">
        {messages.map((message) => (
          <li
            key={message.id}
            className="border border-[var(--color-rule)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-sans text-base font-semibold">
                {message.name}{" "}
                <a
                  href={`mailto:${message.email}?subject=Re:%20CatalunyaInfo`}
                  className="font-normal"
                >
                  {message.email}
                </a>
              </h2>
              <p className="text-xs text-[var(--color-muted)]">
                {formatDate(message.createdAt, "ca", "long")} ·{" "}
                {TOPIC_LABEL[message.topic] ?? message.topic} · {message.locale.toUpperCase()} ·{" "}
                {STATUS_LABEL[message.status] ?? message.status} ·{" "}
                {message.deliveredAt ? "enviat per correu" : "només desat"}
              </p>
            </div>

            {message.aboutPath ? (
              <p className="mt-2 font-mono text-xs text-[var(--color-muted)]">
                {message.aboutPath}
              </p>
            ) : null}

            <p className="ci-measure mt-3 whitespace-pre-wrap text-sm">{message.message}</p>

            <div className="mt-4">
              <MessageActions message={message} />
            </div>
          </li>
        ))}

        {messages.length === 0 ? (
          <li className="text-sm text-[var(--color-muted)]">
            Cap missatge encara. El formulari és a{" "}
            <code>/ca/contacte/</code>, <code>/es/contacto/</code> i <code>/en/contact/</code>.
          </li>
        ) : null}
      </ul>
    </main>
  );
}
