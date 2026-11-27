
// API client for the SecureHR-GPT FastAPI backend.

const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const TOKEN_KEY = "securehr.token";

// Store the JWT for the current browser tab.
export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token) => sessionStorage.setItem(TOKEN_KEY, token),
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
    return "Too many requests. Please wait a moment and try again.";
  }

  const detail = data?.detail ?? data?.error;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" ");
  }

  return fallback || `Request failed (${status})`;
}

async function request(
  path,
  { method = "GET", json, form, body, auth = true } = {}
) {
  const headers = {};
  const token = tokenStore.get();

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload = body;

  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(json);
  }

  if (form) {
    payload = new URLSearchParams(form);
  }

  let response;

  try {
    response = await fetch(BASE + path, {
      method,
      headers,
      body: payload,
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the server. Check that the backend is running and the API URL is configured correctly."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && auth) {
      onUnauthorized();
    }

    throw new ApiError(
      response.status,
      describe(response.status, data, response.statusText)
    );
  }

  return data;
}

// Available backend API operations.
export const api = {
  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      form: { username, password },
      auth: false,
    }),

  me: () => request("/auth/me"),

  employee: (id) => request(`/employees/${id}`),

  chat: (message) =>
    request("/chat", {
      method: "POST",
      json: { message },
    }),
};
