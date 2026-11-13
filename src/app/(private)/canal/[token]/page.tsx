import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChannelPosts } from "@/components/share/ChannelPosts";
import { channelPosts } from "@/lib/share/channel-page";
import { channelTokenMatches } from "@/lib/share/channel-token";

/**
 * /canal/<token>/ — the WhatsApp channel's daily post, for the owner's phone.
 *
 * Guarded by CHANNEL_PAGE_TOKEN (lib/share/channel-token.ts): any other
 * token, or none configured, is a plain 404. Rendered on every request
 * (Next sends `private, no-store`, which Cloudflare respects), never
 * prerendered, never in a sitemap, always noindex (layout + X-Robots-Tag).
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Canal: missatge del dia",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

type Props = { params: Promise<{ token: string }> };

export default async function ChannelTokenPage({ params }: Props) {
  const { token } = await params;
  if (!channelTokenMatches(token)) notFound();
  const posts = await channelPosts();
  return <ChannelPosts {...posts} />;
}
