// Thin client for the SecureHR-GPT FastAPI backend.
// Leave VITE_API_URL blank to use the same origin (Vite proxy / static mount).

const BASE = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "securehr.token";

// sessionStorage: survives a refresh, is cleared when the tab closes.
export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (t) => sessionStorage.setItem(TOKEN_KEY, t),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

function describe(status, data, fallback) {
  if (status === 429) {
    return "You've reached the limit of 10 questions per minute. Wait a moment, then try again.";
  }
  const detail = data?.detail ?? data?.error;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(" ");
  return fallback || `Request failed (${status})`;
}

async function request(path, { method = "GET", json, form, body, auth = true } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let payload = body; // FormData for uploads: the browser sets the multipart boundary
  if (json) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(json);
  }
  if (form) payload = new URLSearchParams(form); // OAuth2 login expects form encoding

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: payload });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check that the API is running on port 8000.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized();
    throw new ApiError(res.status, describe(res.status, data, res.statusText));
  }
  return data;
}

export const api = {
  login: (username, password) =>
    request("/auth/login", { method: "POST", form: { username, password }, auth: false }),
  me: () => request("/auth/me"),
  employee: (id) => request(`/employees/${id}`),
chat: (message) => request("/chat", { method: "POST", json: { message } }),
  uploadDocument: (file, accessLevel) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("access_level", accessLevel);
    return request("/documents/upload", { method: "POST", body: fd });
  },
  auditLogs: ({ decision = "", limit = 100 } = {}) => {
    const params = new URLSearchParams({ limit });
    if (decision) params.set("decision", decision);
    return request(`/admin/audit-logs?${params}`);
  },
};
