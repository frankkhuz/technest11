import axios from "axios";
import { reportApiError } from "./api";

export const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (method && method !== "get") {
    const token = getCsrfTokenFromCookie();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["X-CSRF-Token"] = token;
    }
  }
  return config;
});

api.interceptors.response.use(undefined, (error) => {
  const res = error?.response;
  const url: string = error?.config?.url ?? "";
  if (res && !url.startsWith("/api/auth/refresh")) {
    reportApiError(res.status, url, res.data ?? null, res.headers?.["retry-after"]);
  }
  return Promise.reject(error);
});
