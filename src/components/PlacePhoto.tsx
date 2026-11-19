import Image from "next/image";

import type { PlacePhoto as Photo } from "@/lib/content/place-photos";
import type { Locale } from "@/lib/i18n/config";

const PHOTO: Record<Locale, string> = { ca: "Foto", es: "Foto", en: "Photo" };

/**
 * A licensed photograph of the page's place (lib/content/place-photos.ts),
 * always below the answer: lazy-loaded, with width and height so it reserves
 * its box (no layout shift). The caption carries what the licence asks for:
 * the author linked to the file's Commons page (the source) and the licence
 * linked to its deed.
 */
export function PlacePhoto({ photo, locale }: { photo: Photo | null; locale: Locale }) {
  if (!photo) return null;
  return (
    <figure className="ci-place-photo my-8">
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes="(min-width: 1024px) 42rem, 100vw"
        loading="lazy"
        placeholder="blur"
        blurDataURL={photo.blurDataUrl}
        className="h-auto w-full rounded-[var(--radius-sm)]"
      />
      <figcaption className="mt-2 text-xs text-[var(--color-muted)]">
        {photo.caption}{" "}
        <span className="text-[var(--color-faint)]">
          {PHOTO[locale]}:{" "}
          <a href={photo.creditUrl} rel="noopener nofollow" target="_blank">
            {photo.credit}
          </a>{" "}
          (Wikimedia Commons) ·{" "}
          {photo.licenceUrl ? (
            <a href={photo.licenceUrl} rel="license noopener nofollow" target="_blank">
              {photo.licence}
            </a>
          ) : (
            photo.licence
          )}
        </span>
      </figcaption>
    </figure>
  );
}
