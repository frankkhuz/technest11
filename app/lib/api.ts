/**
 * TechNest Intelligence API client
 * Handles JWT auth headers for all calls to your Express backend
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://technestbackend-gue0.onrender.com";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  token?: string; // Pass the JWT from session
};

export async function apiRequest<T>(
  endpoint: string,
  { method = "GET", body, token }: RequestOptions = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// --- Typed API helpers ---

export const authApi = {
  register: (data: unknown) =>
    apiRequest("/api/auth/register", { method: "POST", body: data }),

  login: (identifier: string, password: string) =>
    apiRequest<{
      token: string;
      user: { id: string; role: string; name: string };
    }>("/api/auth/login", { method: "POST", body: { identifier, password } }),
};

export const gadgetsApi = {
  list: (token: string) => apiRequest("/api/gadgets", { token }),

  getPrice: (token: string) => apiRequest("/api/prices", { token }),

  getDevices: (token: string) => apiRequest("/api/devices", { token }),

  getRecommendations: (token: string) =>
    apiRequest("/api/recommendations", { token }),
};
