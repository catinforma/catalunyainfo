import { IMAGE_BY_KEY, type ImportedImage } from "@/lib/content/images";

/**
 * Discover- and Article-ready crops of the site's licensed photographs.
 *
 * Google Discover shows a large image only when it is at least 1,200 px wide
 * and `max-image-preview:large` is allowed; Article markup asks for the image
 * in 16:9, 4:3 and 1:1. Our photographs are mostly 3:2 or 4:3 files, declared
 * as one image. Each ratio is cut from the original by `/img/<ratio>/<key>.jpg`
 * (app/img/[ratio]/[file]/route.ts) at the largest size the original allows:
 * never upscaled, and a ratio the original cannot give at 1,200 px is simply
 * not offered.
 *
 * Only photographs under an open licence the site may reuse (CC0, CC BY,
 * CC BY-SA, public domain, GFDL), as the image manifest records it from the
 * Commons sidecar. The illustrations without a licence field (AI-generated,
 * labelled as such) keep the single image they had; no text card is ever made
 * here.
 */

export const CROP_RATIOS = {
  "16x9": [16, 9],
  "4x3": [4, 3],
  "1x1": [1, 1],
} as const;

export type CropRatio = keyof typeof CROP_RATIOS;

export const CROP_ORDER: readonly CropRatio[] = ["16x9", "4x3", "1x1"];

/** Discover's minimum width for a large image. */
export const DISCOVER_MIN_WIDTH = 1200;

export function isCropRatio(value: string): value is CropRatio {
  return Object.hasOwn(CROP_RATIOS, value);
}

const OPEN_LICENCE = /^(?:CC0(?:\s+1\.0)?|CC BY(?:-SA)? \d\.\d(?: [a-z]{2})?|PD|Public domain|GFDL(?: \d\.\d)?)$/i;

/** CC0, CC BY, CC BY-SA, public domain or GFDL; never NC or ND, never unknown. */
export function isOpenLicence(licence: string | null | undefined): boolean {
  return Boolean(licence && OPEN_LICENCE.test(licence.trim()));
}

/** The licence deed for a Creative Commons licence name, as Google's image metadata asks. */
export function licenceUrl(licence: string | null | undefined): string | null {
  if (!licence) return null;
  const name = licence.trim();
  if (/^CC0/i.test(name)) return "https://creativecommons.org/publicdomain/zero/1.0/";
  const cc = /^CC (BY(?:-SA)?) (\d\.\d)(?: ([a-z]{2}))?$/i.exec(name);
  if (!cc) return null;
  const [, kind = "", version = "", port] = cc;
  return `https://creativecommons.org/licenses/${kind.toLowerCase()}/${version}/${port ? `${port.toLowerCase()}/` : ""}`;
}

/**
 * The largest crop of this ratio inside a width x height original, in whole
 * ratio units so the result is exactly 16:9, 4:3 or 1:1.
 */
export function cropSize(width: number, height: number, ratio: CropRatio): { width: number; height: number } {
  const [rw, rh] = CROP_RATIOS[ratio];
  const unit = Math.floor(Math.min(width / rw, height / rh));
  return { width: unit * rw, height: unit * rh };
}

export function cropPath(ratio: CropRatio, key: string): string {
  return `/img/${ratio}/${key}.jpg`;
}

export interface DiscoverCrop {
  ratio: CropRatio;
  /** Site-relative URL of the crop. */
  url: string;
  width: number;
  height: number;
}

/** Every crop of this photograph at least 1,200 px wide, 16:9 first; none if not openly licensed. */
export function discoverCrops(image: ImportedImage): DiscoverCrop[] {
  if (!isOpenLicence(image.license)) return [];
  return CROP_ORDER.map((ratio) => ({ ratio, url: cropPath(ratio, image.key), ...cropSize(image.width, image.height, ratio) })).filter(
    (crop) => crop.width >= DISCOVER_MIN_WIDTH,
  );
}

/** The manifest photograph a media URL serves (`/images/<key>.webp`, relative or absolute), if any. */
export function manifestImage(url: string | null | undefined): ImportedImage | null {
  if (!url) return null;
  const match = /^(?:https?:\/\/[^/]+)?\/images\/([a-z0-9-]+)\.webp$/.exec(url);
  const image = match?.[1] ? IMAGE_BY_KEY.get(match[1]) : undefined;
  return image && image.url === `/images/${match?.[1]}.webp` ? image : null;
}

/** The crops for a media URL: the manifest photograph's, if it is one and is openly licensed. */
export function cropsForUrl(url: string | null | undefined): DiscoverCrop[] {
  const image = manifestImage(url);
  return image ? discoverCrops(image) : [];
}

/** The crop the route may serve for `<ratio>/<file>`, or null (unknown, unlicensed, under 1,200 px). */
export function servableCrop(ratio: string, file: string): { image: ImportedImage; crop: DiscoverCrop } | null {
  if (!isCropRatio(ratio)) return null;
  const match = /^([a-z0-9-]+)\.jpg$/.exec(file);
  const image = match?.[1] ? IMAGE_BY_KEY.get(match[1]) : undefined;
  if (!image) return null;
  const crop = discoverCrops(image).find((c) => c.ratio === ratio);
  return crop ? { image, crop } : null;
}
