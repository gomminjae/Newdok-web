export function proxyImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:') {
      return `/api/backend${parsed.pathname}${parsed.search}`;
    }
    return url;
  } catch {
    return url;
  }
}
