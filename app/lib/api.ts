import { BACKEND_URL } from "./auth";

type FetchOptions = RequestInit & { auth?: boolean };

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const { auth = true, ...init } = options;

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    credentials: auth ? "include" : "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(
      errBody?.message || errBody?.error || `Request failed: ${res.status}`
    );
  }

  return res.json();
}
