import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { servableCrop } from "@/lib/seo/discover-images";

/**
 * `/img/<16x9|4x3|1x1>/<key>.jpg`: one crop of a licensed photograph, at the
 * size `discoverCrops` declares in the Article markup and og:image (see
 * lib/seo/discover-images.ts). Only manifest photographs under an open
 * licence, only crops at least 1,200 px wide; anything else is a 404.
 *
 * JPEG rather than WebP because link previews (WhatsApp, older crawlers) still
 * read JPEG most reliably. No query string: robots.txt disallows `/*?*`, and a
 * crawler must be able to fetch these. Cut with sharp, the library Next's own
 * image optimiser loads (installed with `next`), and cached hard: by the
 * browser for a week, by Cloudflare (it caches .jpg by extension) for a month,
 * and in this process for the last few dozen crops, so a crawl of the feed
 * costs one cut per image. A file is never replaced under the same key (the
 * import names each new photograph), so a cached crop cannot go stale.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL = "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=604800";

const MEMO_LIMIT = 48;
const memo = new Map<string, Uint8Array>();

function remember(key: string, bytes: Uint8Array) {
  if (memo.size >= MEMO_LIMIT) {
    const oldest = memo.keys().next().value;
    if (oldest !== undefined) memo.delete(oldest);
  }
  memo.set(key, bytes);
}

export async function GET(_request: Request, { params }: { params: Promise<{ ratio: string; file: string }> }) {
  const { ratio, file } = await params;
  const found = servableCrop(ratio, file);
  if (!found) {
    return new Response("Not found", { status: 404, headers: { "cache-control": "public, max-age=300" } });
  }
  const { image, crop } = found;
  const memoKey = `${crop.ratio}/${image.key}`;

  let bytes = memo.get(memoKey);
  if (!bytes) {
    const { default: sharp } = await import("sharp");
    // image.url is "/images/<key>.webp", checked against the manifest.
    const source = await readFile(join(process.cwd(), "public", "images", `${image.key}.webp`));
    const out = await sharp(source)
      .resize(crop.width, crop.height, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toBuffer();
    bytes = new Uint8Array(out);
    remember(memoKey, bytes);
  }

  return new Response(bytes as BodyInit, {
    headers: {
      "content-type": "image/jpeg",
      "content-length": String(bytes.byteLength),
      "cache-control": CACHE_CONTROL,
    },
  });
}
