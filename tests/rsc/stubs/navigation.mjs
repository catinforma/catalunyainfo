// next/navigation: server helpers that the pages under test never reach on the
// happy path, and client hooks with a neutral answer for the SSR phase.
export function notFound() {
  throw new Error("notFound()");
}
export function redirect(to) {
  throw new Error(`redirect(${to})`);
}
export const permanentRedirect = redirect;
export function usePathname() {
  return "/";
}
export function useSearchParams() {
  return new URLSearchParams();
}
export function useRouter() {
  return { push() {}, replace() {}, refresh() {}, back() {}, forward() {}, prefetch() {} };
}
export function useParams() {
  return {};
}
export function useSelectedLayoutSegment() {
  return null;
}
