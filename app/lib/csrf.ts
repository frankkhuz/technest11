// lib/csrf.ts
// Reads the CSRF token cookie set by the backend and returns it so it can be
// echoed back in the "X-CSRF-Token" header (double-submit cookie pattern).
// Adjust COOKIE_NAME below if your backend's verifyCsrfToken middleware
// issues the cookie under a different name.

const COOKIE_NAME = "csrfToken";

export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}
