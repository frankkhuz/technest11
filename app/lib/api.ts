import { getCsrfToken } from "./csrf";

type FetchOptions = RequestInit;

// Backend error codes the whole app reacts to the same way (see
// ApiNotices). Every other code is shown by the calling form itself.
export const API_ERROR_EVENT = "technest:api-error";

export type ApiErrorDetail = {
  status: number;
  path: string;
  code?: string;
  message?: string;
  retryAfter?: number;
};

const GLOBAL_CODES = new Set(["email_not_verified", "service_unavailable"]);

function isSignedOut(status: number, message?: string) {
  return status === 401 && !!message && /signed out/i.test(message);
}

/** Inspects a failed response without consuming it and broadcasts the
 * errors that get one shared treatment across the app. */
export function reportApiError(
  status: number,
  path: string,
  body: { code?: string; message?: string; error?: string } | null,
  retryAfter?: string | null
) {
  if (typeof window === "undefined" || !body) return;
  const message = body.message || body.error;
  if (!GLOBAL_CODES.has(body.code ?? "") && !isSignedOut(status, message)) return;
  const detail: ApiErrorDetail = {
    status,
    path,
    code: isSignedOut(status, message) ? "signed_out" : body.code,
    message,
    retryAfter: retryAfter ? Number(retryAfter) || undefined : undefined,
  };
  window.dispatchEvent(new CustomEvent<ApiErrorDetail>(API_ERROR_EVENT, { detail }));
}

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const { headers = {}, body, ...rest } = options;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const method = (rest.method ?? "GET").toUpperCase();
  const csrfToken = method !== "GET" ? getCsrfToken() : null;

  const mergedHeaders: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    ...(headers as Record<string, string>),
  };

  const res = await fetch(path, {
    ...rest,
    body,
    headers: mergedHeaders,
    credentials: "include",
  });

  if (!res.ok && path.startsWith("/api/") && !path.startsWith("/api/auth/refresh")) {
    res
      .clone()
      .json()
      .then((b) => reportApiError(res.status, path, b, res.headers.get("Retry-After")))
      .catch(() => {});
  }

  return res;
}

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  /** Always safe to show. `/api/listings` errors use `error`, everything else `message`. */
  message: string;
  code?: string;
};

/** apiFetch + JSON parsing in the backend's `{ success, message, data }` shape. */
export async function apiJson<T = Record<string, unknown>>(
  path: string,
  options: FetchOptions = {}
): Promise<ApiResult<T>> {
  try {
    const res = await apiFetch(path, options);
    const body = await res.json().catch(() => null);
    const ok = res.ok && body?.success !== false;
    return {
      ok,
      status: res.status,
      data: (body?.data ?? null) as T | null,
      message:
        body?.message ||
        body?.error ||
        (ok ? "" : res.status >= 500 ? "Something went wrong — please try again." : "Request failed."),
      code: body?.code,
    };
  } catch {
    return { ok: false, status: 0, data: null, message: "Network error — please try again." };
  }
}

export const jsonBody = (value: unknown): FetchOptions => ({
  method: "POST",
  body: JSON.stringify(value),
});

type UploadSignature = {
  signature: string;
  timestamp: number | string;
  folder: string;
  type?: string;
  cloudName: string;
  apiKey: string;
};

export type UploadedFile = { url: string; publicId: string };

/**
 * Uploads straight from the browser to Cloudinary with a signature from the
 * backend. `listing` (default) is for public photos — send the returned `url`.
 * `private` is for ID documents, selfies and certificates — those are stored
 * as `type=authenticated`, and only the `publicId` should be sent back.
 */
export async function uploadFiles(
  files: File[],
  purpose: "listing" | "private" = "listing"
): Promise<UploadedFile[]> {
  if (files.length === 0) return [];
  const sig = await apiJson<UploadSignature>("/api/uploads/signature", jsonBody({ purpose }));
  if (!sig.ok || !sig.data) throw new Error(sig.message || "Could not start the upload.");
  const { signature, timestamp, folder, type, cloudName, apiKey } = sig.data;

  const out: UploadedFile[] = [];
  for (const file of files) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", apiKey);
    fd.append("timestamp", String(timestamp));
    fd.append("signature", signature);
    fd.append("folder", folder);
    if (type) fd.append("type", type);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: fd,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error?.message || "Upload failed.");
    out.push({ url: json.secure_url, publicId: json.public_id });
  }
  return out;
}
