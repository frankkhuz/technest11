

type FetchOptions = RequestInit;

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const { headers = {}, ...rest } = options;

  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  const res = await fetch(path, {
    ...rest,
    headers: mergedHeaders,
    credentials: "include",
  });

  return res;
}
