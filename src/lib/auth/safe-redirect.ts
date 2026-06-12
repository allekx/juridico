/** Aceita apenas paths internos relativos (evita open redirect). */
export function safeRedirectPath(path: string, fallback = "/"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}
