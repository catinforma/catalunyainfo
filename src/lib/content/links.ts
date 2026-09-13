/**
 * Link validation, kept free of JSX so it can be unit-tested directly and
 * reused on both the server and the client.
 */

/** Returns a safe href, or null if the URL scheme is not allowed. */
export function safeHref(raw: string): string | null {
  const value = raw.trim();
  if (value.startsWith("/")) return value;
  if (value.startsWith("mailto:")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
    return null;
  } catch {
    return null;
  }
}

export function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}
