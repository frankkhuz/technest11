// app/lib/api.ts
// All frontend fetch calls go through here — points to the Express backend on Render.

import { BACKEND_URL, getToken } from "./auth";

type FetchOptions = RequestInit & { auth?: boolean };

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const { auth = false, headers = {}, ...rest } = options;

  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) mergedHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...rest,
    headers: mergedHeaders,
  });

  return res;
}
