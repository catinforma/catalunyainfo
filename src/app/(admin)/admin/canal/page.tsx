import { redirect } from "next/navigation";

import { ChannelPosts } from "@/components/share/ChannelPosts";
import { getSessionUser } from "@/lib/auth/session";
import { channelPosts } from "@/lib/share/channel-page";

export const dynamic = "force-dynamic";

/**
 * The WhatsApp channel's daily post inside the CMS (signed-in users, through
 * the SSH tunnel). The same page opens on the phone at `/canal/<token>/`.
 */
export default async function AdminChannelPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  const posts = await channelPosts();
  return <ChannelPosts {...posts} />;
}
