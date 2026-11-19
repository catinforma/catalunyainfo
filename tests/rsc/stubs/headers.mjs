// Request-time APIs: an empty request (no cookies, no headers).
export async function headers() {
  return new Headers();
}
export async function cookies() {
  return { get: () => undefined, has: () => false, getAll: () => [] };
}
export async function draftMode() {
  return { isEnabled: false };
}
