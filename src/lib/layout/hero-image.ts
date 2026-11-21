/**
 * `sizes` of the article hero (EntryArticle.tsx), the LCP element on guides,
 * strike pages and day trips.
 *
 * The hero is full width at every size. Below Tailwind's `md` (48rem) it is
 * also cropped to 40vw of height (32vw under an answer-first summary), and
 * phones at 2.5 dppx or more are told it is 70vw wide, so they pick about a
 * 2x variant instead of a 3x-4x one:
 *
 * | phone (CSS px @ dppx) | `100vw` | this   |
 * | --------------------- | ------- | ------ |
 * | 412 @ 1.75 (PSI)      | 640     | 640    |
 * | 390 @ 2               | 828     | 828    |
 * | 412 @ 2.625           | 1080    | 828    |
 * | 393 @ 3, 430 @ 3      | 1200    | 828    |
 * | 412 @ 3.5             | 1600    | 1080   |
 *
 * (Chromium's choice from next.config.ts `deviceSizes`, production pages with
 * the HTML rewritten, 21 Nov 2026; on the 26N strike guide 33-62 KB became
 * 21-33 KB, on the Montserrat day trip 51-128 KB became 32-51 KB.) A browser
 * that does not support the `resolution` media feature reads `100vw`, the
 * previous value. next/image puts the same string in the head preload
 * (`imageSizes`), so the preload and the <img> still make one request.
 */
export const HERO_SIZES = "(max-width: 47.99rem) and (min-resolution: 2.5dppx) 70vw, 100vw";
