import type { ReactNode } from "react";

import { CodeBox } from "@/components/programmatic/embed-2027/CodeBox";
import { CALC_BOX_COPY } from "@/lib/programmatic/embed-calc/copy";
import { NET_SALARY_HEIGHT, netSalaryEmbedPath, type CalcEmbedLocale } from "@/lib/programmatic/embed-calc/paths";
import { iframeSnippet } from "@/lib/programmatic/embed-2027/snippet";
import { netSalaryPath } from "@/lib/programmatic/net-salary/copy";
import { siteOrigin } from "@/lib/site";

/**
 * "Embed this calculator", folded, on a calculator page: the code (an iframe
 * of /embed/<locale>/calc/…, and outside it a plain link to this page) is in
 * the HTML, with a copy button. lib/programmatic/embed-calc/.
 */
export function CalcEmbedFrame({ locale, children }: { locale: CalcEmbedLocale; children: ReactNode }) {
  const t = CALC_BOX_COPY[locale];
  return (
    <details id="embed" className="ci-embed-box my-6 rounded border border-[var(--color-rule)] p-3">
      <summary className="cursor-pointer font-semibold">{t.summary}</summary>
      <p>{t.lead}</p>
      {children}
      <p>{t.terms}</p>
    </details>
  );
}

export function NetSalaryEmbedBox({ locale }: { locale: CalcEmbedLocale }) {
  const t = CALC_BOX_COPY[locale];
  const code = iframeSnippet({ origin: siteOrigin(), embed: netSalaryEmbedPath(locale), page: netSalaryPath(locale), title: t.netTitle, height: NET_SALARY_HEIGHT });
  return (
    <CalcEmbedFrame locale={locale}>
      <CodeBox id="embed-net-salary" label={t.codeLabel} code={code} copyLabel={t.copy} copiedLabel={t.copied} />
    </CalcEmbedFrame>
  );
}
