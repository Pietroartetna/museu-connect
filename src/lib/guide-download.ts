/** Only app-managed audioguide objects can be served by the protected endpoint. */
export function guideStoragePath(reference: string) {
  if (!reference.startsWith("museo/guida/")) return null;
  const path = reference.slice("museo/".length);
  if (path.split("/").some((part) => !part || part === "." || part === "..") || /[\\\x00-\x1f]/.test(path)) return null;
  return path;
}

export const guideDownloadUrl = (id: string) => `/api/public/guide-file/${encodeURIComponent(id)}`;

export function guideCookie(token: string, secure: boolean) {
  return `museum-guide=${token}; Path=/api/public/guide-file; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
}