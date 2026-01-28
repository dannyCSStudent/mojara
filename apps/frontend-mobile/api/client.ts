import { ENV } from "../config/env";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
}

/* =========================
   Auth token injection
========================= */

let authToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  authToken = token;
}

/* =========================
   API Request
========================= */

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    signal,
  } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  const res = await fetch(`${ENV.API_URL}${endpoint}`, {
    method,
    headers,
    ...(method !== "GET" && body
      ? { body: JSON.stringify(body) }
      : {}),
    signal,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "API request failed");
  }

  return res.json();
}
