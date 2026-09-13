/**
 * Imports editorial images from `incoming/` into the site.
 *
 * For each file it: reads the real dimensions, writes an optimised WebP into
 * `public/images/`, generates a tiny blur placeholder so the image reserves its
 * space and contributes nothing to CLS, and regenerates
 * `src/lib/content/weekend/images.ts`.
 *
 * Images are served from our own origin rather than a remote host because
 * `next.config.ts` only allows Vercel Blob as a remote pattern, and because a
 * file in `public/` is cached by the CDN with no extra infrastructure.
 *
 * Usage: drop files in `incoming/`, then `npm run images:import`
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";

export {};

const ROOT = process.cwd();
const INCOMING = join(ROOT, "incoming");
const OUT_DIR = join(ROOT, "public", "images");
const MANIFEST = join(ROOT, "src", "lib", "content", "weekend", "images.ts");

/** Widest we ever render a hero. Anything larger is wasted bytes. */
const MAX_WIDTH = 1920;

interface Imported {
  key: string;
  url: string;
  width: number;
  height: number;
  blurDataUrl: string;
}

async function main() {
  const sharp = (await import("sharp")).default;

  await mkdir(OUT_DIR, { recursive: true });

  let files: string[];
  try {
    files = (await readdir(INCOMING)).filter((f) =>
      /\.(webp|png|jpe?g|avif)$/i.test(f),
    );
  } catch {
    console.error(`No existe ${INCOMING}. Crea la carpeta y deja ahi las imagenes.`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`No hay imagenes en ${INCOMING}.`);
    process.exit(1);
  }

  const imported: Imported[] = [];

  for (const file of files.sort()) {
    const source = await readFile(join(INCOMING, file));
    const key = parse(file).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const pipeline = sharp(source).rotate();
    const meta = await pipeline.metadata();

    const resized = sharp(source)
      .rotate()
      .resize({ width: Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH), withoutEnlargement: true });

    const out = await resized.webp({ quality: 82, effort: 5 }).toBuffer();
    const outMeta = await sharp(out).metadata();
    await writeFile(join(OUT_DIR, `${key}.webp`), out);

    // 16px-wide placeholder, inlined as a data URI. Small enough that it costs
    // less than the request it saves.
    const blur = await sharp(source).rotate().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();

    imported.push({
      key,
      url: `/images/${key}.webp`,
      width: outMeta.width ?? 0,
      height: outMeta.height ?? 0,
      blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
    });

    const kb = (out.length / 1024).toFixed(0);
    console.log(`${key.padEnd(38)} ${outMeta.width}x${outMeta.height}  ${kb} KB`);
  }

  const body = `// GENERATED FILE - do not edit by hand.
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

export const IMAGES: readonly ImportedImage[] = ${JSON.stringify(imported, null, 2)} as const;

export const IMAGE_BY_KEY: ReadonlyMap<string, ImportedImage> = new Map(
  IMAGES.map((image) => [image.key, image]),
);
`;

  await mkdir(join(ROOT, "src", "lib", "content", "weekend"), { recursive: true });
  await writeFile(MANIFEST, body, "utf8");

  console.log(`\n${imported.length} imagenes en public/images/`);
  console.log(`manifiesto: ${MANIFEST}`);
  console.log(`\nClaves para usar en payload.ts:`);
  for (const image of imported) console.log(`  ${image.key}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
