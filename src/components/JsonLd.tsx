import { jsonForScript } from "@/lib/seo/json-script";

/**
 * Structured data is injected as a non-executable `application/ld+json` script.
 * The payload is always produced by `lib/seo/jsonld.ts` from data we hold, and
 * is JSON-serialised; `jsonForScript` escapes every `<`, so no value can close
 * the element and carry markup.
 */
export function JsonLd({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      // The value is the output of JSON.stringify, never raw content.
      dangerouslySetInnerHTML={{ __html: jsonForScript(json) }}
    />
  );
}
