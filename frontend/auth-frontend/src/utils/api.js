const DEFAULT_BASE = "http://127.0.0.1:8000";

export const API_BASE =
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_BASE;

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some endpoints might return empty
  }

  if (!res.ok) {
    const msg = data?.message || data?.detail || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}
