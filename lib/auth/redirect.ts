const FALLBACK_PATH = "/";

export function getSafeInternalPath(
  value: string | null | undefined,
  fallback = FALLBACK_PATH,
): string {
  if (!value) return fallback;

  let path = value.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    return fallback;
  }

  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//") || path.startsWith("/\\")) return fallback;
  if (path.includes("\\") || path.includes("://")) return fallback;
  if (path === "/auth/sign-in" || path.startsWith("/auth/sign-in?")) {
    return fallback;
  }

  return path;
}
