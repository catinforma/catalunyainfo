/**
 * ads.txt, served only once there is a publisher ID to declare.
 *
 * AdSense needs this file to authorise the site's inventory, and it needs the
 * publisher's own `pub-` ID in it. Until the account exists there is nothing
 * true to write, so the route answers 404 rather than publishing a placeholder
 * that a crawler would read as a declaration.
 *
 * To switch it on: set `ADSENSE_PUBLISHER_ID=pub-XXXXXXXXXXXXXXXX` in the
 * Vercel production environment and redeploy. `f08c47fec0942fa0` is Google's
 * own certification-authority ID, the same for every AdSense publisher.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  const id = process.env.ADSENSE_PUBLISHER_ID?.trim();
  if (!id || !/^pub-\d{10,20}$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(`google.com, ${id}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
