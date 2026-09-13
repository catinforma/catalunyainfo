import type { Metadata } from "next";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entra",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="ci-shell-narrow py-24">
      <h1 className="text-3xl">CatalunyaInfo CMS</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Accés restringit a l&apos;equip editorial.
      </p>
      <div className="mt-8">
        <LoginForm next={next ?? "/admin"} />
      </div>
    </main>
  );
}
