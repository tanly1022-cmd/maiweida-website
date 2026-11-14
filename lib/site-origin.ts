/** The canonical production domain must not follow Netlify preview hostnames. */
export const DEFAULT_SITE_ORIGIN = "https://maivida.com";

export function resolveSiteOrigin(configured?: string): string {
  const value = configured?.trim();
  if (!value) return DEFAULT_SITE_ORIGIN;
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("NEXT_PUBLIC_SITE_URL must be a complete HTTP(S) origin, e.g. https://maivida.com"); }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("NEXT_PUBLIC_SITE_URL must contain only an HTTP(S) origin, without credentials, path, query or fragment.");
  }
  return url.origin;
}
