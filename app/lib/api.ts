type FetchOptions = RequestInit;

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const { headers = {}, body, ...rest } = options;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const mergedHeaders: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(headers as Record<string, string>),
  };

  const res = await fetch(path, {
    ...rest,
    body,
    headers: mergedHeaders,
    credentials: "include",
  });

  return res;
}
