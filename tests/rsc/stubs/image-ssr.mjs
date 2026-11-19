// next/image in the SSR phase: a plain <img> (Next adds srcset/sizes; the text is the same).
import { createElement } from "react";

export default function Image({ src, alt, width, height, className, style }) {
  return createElement("img", { src: typeof src === "string" ? src : src?.src, alt, width, height, className, style, loading: "lazy", decoding: "async" });
}
