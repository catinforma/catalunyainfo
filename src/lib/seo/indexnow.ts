/**
 * IndexNow: tells Bing (and the other engines that share the protocol) that
 * URLs have changed, so they are recrawled in minutes instead of days.
 *
 * Bing sends ~14% of this site's sessions and ChatGPT search, which sits on
 * Bing's index, another ~7% (GA4, Sep-Oct 2026), and neither was ever told
 * about a new page. The key is public by design: the engine verifies it by
 * fetching `/<key>.txt` from this host, which lives in `public/`.
 */

export const INDEXNOW_KEY = "1b9cd1c5da114656a9bd9c3cc29740c6";

const HOST = "www.catalunyainfo.com";

/** Best effort: a failed ping must never fail a publish. */
export async function pingIndexNow(paths: string[]): Promise<{ submitted: number; status: number | null }> {
  const urlList = [...new Set(paths)].map((path) => `https://${HOST}${path.endsWith("/") ? path : `${path}/`}`);
  if (urlList.length === 0) return { submitted: 0, status: null };
  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`, urlList: urlList.slice(0, 10_000) }),
      signal: AbortSignal.timeout(10_000),
    });
    return { submitted: urlList.length, status: response.status };
  } catch {
    return { submitted: urlList.length, status: null };
  }
}
