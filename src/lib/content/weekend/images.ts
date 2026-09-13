// GENERATED FILE - do not edit by hand.
// Source: incoming/  ->  npm run images:import
//
// Alt text and credits are NOT generated: they live in
// src/lib/content/weekend/payload.ts, keyed by the same slug, so that editorial
// wording is written by a person and survives a re-import.

export interface ImportedImage {
  readonly key: string;
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly blurDataUrl: string;
}

export const IMAGES: readonly ImportedImage[] = [
  {
    "key": "festa-bolet-setcases-pirineus",
    "url": "/images/festa-bolet-setcases-pirineus.webp",
    "width": 1672,
    "height": 941,
    "blurDataUrl": "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAACwAQCdASoQAAkAA4BaJYgCdABzgV8AAP6yDocS6uReqYhy1CH9/IWGf3bYwGe7RAUhoRps/183d27mdVZt+QOKbZbX4MxXXpDvW98k0hwJAxG/iTYekWu56yQAAA=="
  },
  {
    "key": "festa-sal-lescala-barques-illuminades",
    "url": "/images/festa-sal-lescala-barques-illuminades.webp",
    "width": 1672,
    "height": 941,
    "blurDataUrl": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADQAQCdASoQAAkAA4BaJaACdADAJdfwAAD33p+R5qcxnoVGA6oWJyooVNSnMGvesyRFflR51PmonH13tnZ8F+vv4YtpfBKeSzgV19FBc1eoH7TtoAA="
  },
  {
    "key": "festa-sega-arros-delta-ebre",
    "url": "/images/festa-sega-arros-delta-ebre.webp",
    "width": 1672,
    "height": 941,
    "blurDataUrl": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAkAA4BaJbACdAEXfTSsQpAA9ZJCj1JqwfQeA1r91+75W7x2HjscKbUJzd4tv+LQ4/khfuMn57t4GtlJGH3oPeO9q+KVe9L9FSSgAAA="
  },
  {
    "key": "fira-formatge-artesa-llado",
    "url": "/images/fira-formatge-artesa-llado.webp",
    "width": 1672,
    "height": 941,
    "blurDataUrl": "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAAAQAgCdASoQAAkAA4BaJZACdAYuvWOYH2IAAP5I7kyylqzV6vz/97TJluLtG9dO7VCvYoYVPH0UUcCESXYDgD4zQisHT/mGCu1f1S7ZjpA+BZv/8mawAA=="
  },
  {
    "key": "santa-tecla-tarragona-castells",
    "url": "/images/santa-tecla-tarragona-castells.webp",
    "width": 1672,
    "height": 941,
    "blurDataUrl": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAQCdASoQAAkAA4BaJYgCdAEQQ9IX+AD5WlzbDiGABTt6mywsCe9ZwhE2hlzxkXkG+vuRbyLyi0tB0CLIvb3QU655o+7scAAAAA=="
  },
  {
    "key": "sea-otter-europe-girona-ciclisme",
    "url": "/images/sea-otter-europe-girona-ciclisme.webp",
    "width": 1672,
    "height": 941,
    "blurDataUrl": "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAkAA4BaJZQCdAD1FX+cT4AA/om8VJwb+C8KKc/ujtLR03V6mrB8tXwFZ36JR9Dhiq2OXTQuf+9nOxFgJIff0+z+2TqTasCD6L0gAAA="
  }
] as const;

export const IMAGE_BY_KEY: ReadonlyMap<string, ImportedImage> = new Map(
  IMAGES.map((image) => [image.key, image]),
);
