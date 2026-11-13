import { longDate } from "@/lib/programmatic/holidays/format";
import { WHATSAPP_CHANNEL_URL } from "@/lib/share/channel";
import type { ChannelMessage } from "@/lib/share/channel-message";

import { CopyPostButton } from "./CopyPostButton";

/**
 * Today's and tomorrow's channel posts, each in a textarea with a copy
 * button, and what to check before pasting. Shared by the private token page
 * (`/canal/<token>/`) and the CMS (`/admin/canal/`).
 */
function Post({ id, title, message }: { id: string; title: string; message: ChannelMessage }) {
  return (
    <section className="mt-8" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="text-xl">
        {title} <span className="font-sans text-sm font-normal text-[var(--color-muted)]">{longDate(message.date, "ca")}</span>
      </h2>
      <textarea
        id={id}
        readOnly
        value={message.text}
        rows={message.lines.length + 3}
        className="mt-3 block w-full max-w-2xl border border-[var(--color-rule)] bg-[var(--color-surface)] p-3 font-sans text-sm leading-relaxed"
        aria-label={`Missatge del canal, ${longDate(message.date, "ca")}`}
      />
      <div className="mt-3">
        <CopyPostButton targetId={id} />
      </div>
      {message.warnings.length > 0 ? (
        <ul className="ci-callout ci-callout-warning mt-4 max-w-2xl text-sm">
          {message.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        {message.notable ? "Hi ha alguna cosa destacada: l'enllaç va a la pàgina corresponent." : "Dia tranquil: l'enllaç va a una pàgina de temporada."}
      </p>
    </section>
  );
}

export function ChannelPosts({ today, tomorrow, liveNote }: { today: ChannelMessage; tomorrow: ChannelMessage; liveNote: string }) {
  return (
    <main className="ci-shell py-8">
      <p className="ci-label">Canal de WhatsApp</p>
      <h1 className="mt-1 text-3xl">Missatge del dia</h1>
      <p className="ci-measure mt-3 text-sm text-[var(--color-muted)]">
        Copia el text, obre el{" "}
        <a href={WHATSAPP_CHANNEL_URL} rel="noopener noreferrer" target="_blank">
          canal
        </a>{" "}
        i enganxa&apos;l. Només conté dades que el web ja mostra verificades per a aquell dia. {liveNote}
      </p>
      <Post id="post-today" title="Avui" message={today} />
      <Post id="post-tomorrow" title="Demà" message={tomorrow} />
    </main>
  );
}
