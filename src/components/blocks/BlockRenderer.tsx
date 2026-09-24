import Image from "next/image";
import Link from "next/link";

import { ContactForm } from "@/components/ContactForm";
import { Calculator } from "@/components/blocks/Calculator";
import { CalendarBlock } from "@/components/blocks/CalendarBlock";
import type { Block, Body } from "@/lib/content/blocks";
import { headingId } from "@/lib/content/blocks";
import { renderInline, safeHref } from "@/lib/content/inline";
import type { EntrySummary, MediaView, SourceView } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n";

/**
 * Everything the renderer needs, resolved once by the page. No block issues a
 * query of its own.
 */
export interface BlockContext {
  locale: Locale;
  media: Map<string, MediaView>;
  related: Map<string, EntrySummary>;
  sources: Map<string, SourceView>;
}

export function BlockRenderer({ body, context }: { body: Body; context: BlockContext }) {
  return (
    <div className="ci-prose">
      {body.map((block, index) => (
        <BlockView key={index} block={block} context={context} />
      ))}
    </div>
  );
}

function BlockView({ block, context }: { block: Block; context: BlockContext }) {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level}` as "h2" | "h3" | "h4";
      return <Tag id={headingId(block)}>{block.text}</Tag>;
    }

    case "paragraph":
      return <p className={block.lead ? "ci-lead" : undefined}>{renderInline(block.text)}</p>;

    case "list":
      return block.ordered ? (
        <ol>
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      ) : (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );

    case "quote":
      return (
        <figure className="border-l-2 border-[var(--color-rule-strong)] pl-4">
          <blockquote className="m-0 text-lg italic text-[var(--color-ink-soft)]">
            {renderInline(block.text)}
          </blockquote>
          {block.cite ? (
            <figcaption className="mt-2 text-xs text-[var(--color-muted)]">
              {block.citeUrl ? (
                <a href={block.citeUrl} rel="noopener" target="_blank">
                  {block.cite}
                </a>
              ) : (
                block.cite
              )}
            </figcaption>
          ) : null}
        </figure>
      );

    case "image": {
      const image = context.media.get(block.mediaId);
      if (!image) return null;
      const caption = block.captionOverride ?? image.caption;
      return (
        <figure
          className={
            block.size === "full"
              ? "-mx-[var(--spacing-gutter)] sm:mx-0"
              : block.size === "wide"
                ? "lg:-mr-24"
                : undefined
          }
        >
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width ?? 1600}
            height={image.height ?? 1067}
            sizes="(min-width: 1024px) 42rem, 100vw"
            placeholder={image.blurDataUrl ? "blur" : "empty"}
            blurDataURL={image.blurDataUrl ?? undefined}
            className="rounded-[var(--radius-sm)]"
          />
          {caption || image.credit ? (
            <figcaption className="mt-2 text-xs text-[var(--color-muted)]">
              {caption}
              {image.credit ? (
                <span className="ml-2 text-[var(--color-faint)]">
                  {image.creditUrl ? (
                    <a href={image.creditUrl} rel="noopener nofollow" target="_blank">
                      {image.credit}
                    </a>
                  ) : (
                    image.credit
                  )}
                  {image.license ? ` · ${image.license}` : null}
                </span>
              ) : null}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    case "gallery": {
      const images = block.mediaIds
        .map((id) => context.media.get(id))
        .filter((m): m is MediaView => Boolean(m));
      if (images.length === 0) return null;
      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((image) => (
            <figure key={image.id} className="m-0">
              <Image
                src={image.url}
                alt={image.alt}
                width={image.width ?? 800}
                height={image.height ?? 600}
                sizes="(min-width: 640px) 14rem, 45vw"
                placeholder={image.blurDataUrl ? "blur" : "empty"}
                blurDataURL={image.blurDataUrl ?? undefined}
                className="aspect-[3/2] rounded-[var(--radius-sm)] object-cover"
              />
            </figure>
          ))}
        </div>
      );
    }

    case "table":
      return (
        <div className="ci-table-wrap">
          {/*
            Explicit ARIA roles are set even though this is a real <table>.
            Below 40rem the CSS restyles the rows as stacked cards, and changing
            `display` on table elements strips their implicit roles - the roles
            put them back, so the structure survives for assistive technology at
            every width. `data-label` carries the column name into the stacked
            layout, where the header row is hidden.
          */}
          <table className="ci-table" role="table">
            {block.caption ? <caption>{block.caption}</caption> : null}
            <thead>
              <tr role="row">
                {block.headers.map((header, i) => (
                  <th key={i} scope="col" role="columnheader">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} role="row">
                  {row.map((cell, j) =>
                    j === 0 ? (
                      <th
                        key={j}
                        scope="row"
                        role="rowheader"
                        className="font-normal"
                        data-label={block.headers[j]}
                      >
                        {renderInline(cell)}
                      </th>
                    ) : (
                      <td key={j} role="cell" data-label={block.headers[j]}>
                        {renderInline(cell)}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {block.note ? (
            <p className="border-t border-[var(--color-rule)] px-3 py-2 text-xs text-[var(--color-muted)]">
              {renderInline(block.note)}
            </p>
          ) : null}
        </div>
      );

    case "keyFacts":
      return (
        <section className="ci-margin-block" aria-label={block.title ?? undefined}>
          {block.title ? (
            <h2 className="mb-3 font-sans text-base font-semibold">{block.title}</h2>
          ) : null}
          <dl className="ci-facts">
            {block.items.map((item, i) => {
              const source = item.sourceId ? context.sources.get(item.sourceId) : undefined;
              return (
                <div key={i} className="contents">
                  <dt>{item.label}</dt>
                  <dd>
                    {renderInline(item.value)}
                    {source?.url ? (
                      <a
                        href={source.url}
                        rel="noopener"
                        target="_blank"
                        className="ml-1 text-xs text-[var(--color-muted)]"
                      >
                        {source.name}
                      </a>
                    ) : null}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      );

    case "callout":
      return (
        <aside className={`ci-callout ci-callout-${block.tone}`}>
          {block.title ? (
            <p className="mb-1 font-semibold text-[var(--color-ink)]">{block.title}</p>
          ) : null}
          <p>{renderInline(block.text)}</p>
        </aside>
      );

    case "steps":
      return (
        <section>
          {block.title ? <h2>{block.title}</h2> : null}
          <ol className="m-0 list-none p-0">
            {block.items.map((step, i) => (
              <li
                key={i}
                className="grid grid-cols-[2rem_1fr] gap-3 border-b border-[var(--color-rule)] py-4 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className="ci-numeric mt-0.5 text-sm text-[var(--color-contour)]"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  {step.text ? (
                    <p className="mt-1 text-[var(--color-ink-soft)]">
                      {renderInline(step.text)}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      );

    case "faq":
      return (
        <section>
          {block.title ? <h2>{block.title}</h2> : null}
          <dl className="m-0">
            {block.items.map((item, i) => (
              <div key={i} className="border-b border-[var(--color-rule)] py-4 last:border-b-0">
                <dt className="font-semibold">{item.question}</dt>
                <dd className="m-0 mt-1 text-[var(--color-ink-soft)]">
                  {renderInline(item.answer)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      );

    case "map":
      return <MapBlock block={block} locale={context.locale} />;

    case "embed":
      return <EmbedBlock block={block} />;

    case "relatedLinks": {
      const t = getMessages(context.locale);
      const items = block.entryIds
        .map((id) => context.related.get(id))
        .filter((e): e is EntrySummary => Boolean(e));
      if (items.length === 0) return null;
      return (
        <nav aria-label={block.title ?? t.meta.relatedContent}>
          <h2 className="font-sans text-base font-semibold">
            {block.title ?? t.meta.relatedContent}
          </h2>
          <ul className="mt-2 list-none p-0">
            {items.map((item) => (
              <li key={item.entryId} className="border-b border-[var(--color-rule)] py-2">
                <Link href={item.href}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      );
    }

    case "divider":
      return <hr className="my-8" />;

    case "adSlot":
      // Placeholder only. No ad code is loaded anywhere in this build; see
      // docs/ADSENSE_READINESS.md for what has to be true before it is.
      return <div data-ad-placement={block.placement} aria-hidden="true" />;

    case "calculator":
      // Arithmetic only, over rates supplied by the editorial package.
      return <Calculator block={block} locale={context.locale} />;

    case "calendar":
      return <CalendarBlock block={block} locale={context.locale} />;

    case "contactForm":
      // The only interactive block. It carries no configuration from the
      // database, so where a message goes is decided in server code alone.
      return <ContactForm locale={context.locale} />;

    default:
      return null;
  }
}

/**
 * A static map: an OpenStreetMap iframe is only loaded after the reader asks
 * for it, so a third-party frame never touches the critical path or LCP. Until
 * then the coordinates themselves are shown, which is the useful part anyway.
 */
function MapBlock({
  block,
  locale,
}: {
  block: Extract<Block, { type: "map" }>;
  locale: Locale;
}) {
  const t = getMessages(locale);
  const delta = 0.02 * (20 - block.zoom);
  const bbox = [
    block.longitude - delta,
    block.latitude - delta / 2,
    block.longitude + delta,
    block.latitude + delta / 2,
  ].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${block.latitude},${block.longitude}`;
  const link = `https://www.openstreetmap.org/?mlat=${block.latitude}&mlon=${block.longitude}#map=${block.zoom}/${block.latitude}/${block.longitude}`;

  return (
    <figure className="m-0">
      <details className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-rule)] bg-[var(--color-surface)]">
        <summary className="cursor-pointer px-3 py-2 text-sm">
          {block.title ?? t.common.open}{" "}
          <span className="ci-numeric text-xs text-[var(--color-muted)]">
            {block.latitude.toFixed(5)}, {block.longitude.toFixed(5)}
          </span>
        </summary>
        <iframe
          src={src}
          title={block.title ?? "OpenStreetMap"}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="block aspect-[16/10] w-full border-0"
        />
      </details>
      {/* The embed shows one marker. Several points are listed beneath it as
          real links, which is better than a marker cluster nobody can read on
          a phone — and it works with JavaScript disabled. */}
      {block.points && block.points.length > 0 ? (
        <ul className="ci-map-points">
          {block.points.map((point) => {
            const href =
              point.href ??
              `https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}` +
                `#map=14/${point.latitude}/${point.longitude}`;
            const external = href.startsWith("http");
            return (
              <li key={`${point.latitude},${point.longitude}`}>
                <a
                  href={href}
                  {...(external ? { rel: "noopener nofollow", target: "_blank" } : {})}
                >
                  {point.label}
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
      <figcaption className="mt-2 text-xs text-[var(--color-muted)]">
        <a href={link} rel="noopener nofollow" target="_blank">
          OpenStreetMap
        </a>
      </figcaption>
    </figure>
  );
}

/** Allowlisted providers only; the id is validated at save time. */
function EmbedBlock({ block }: { block: Extract<Block, { type: "embed" }> }) {
  const src = embedSrc(block.provider, block.embedId);
  if (!src) return null;
  const ratio =
    block.aspectRatio === "1:1" ? "1/1" : block.aspectRatio === "4:3" ? "4/3" : "16/9";

  return (
    <figure className="m-0">
      <iframe
        src={src}
        title={block.title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        className="w-full rounded-[var(--radius-sm)] border-0"
        style={{ aspectRatio: ratio }}
      />
    </figure>
  );
}

function embedSrc(provider: string, id: string): string | null {
  const safeId = encodeURIComponent(id);
  switch (provider) {
    // youtube-nocookie: no tracking cookie until the reader plays the video.
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${safeId}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${safeId}`;
    case "spotify":
      return `https://open.spotify.com/embed/${safeId}`;
    case "openstreetmap":
      return safeHref(`https://www.openstreetmap.org/export/embed.html?bbox=${id}`);
    default:
      return null;
  }
}
