import { ENV } from "../config/env";
import { useAppStore } from "../store/useAppStore";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = useAppStore.getState().authToken;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("Authorization header set");
  } else {
    console.log("No auth token present");
  }

  console.log("AUTH HEADER:", headers.Authorization);

  const res = await fetch(`${ENV.API_URL}${endpoint}`, {
    method,
    headers,
    ...(method !== "GET" && body
      ? { body: JSON.stringify(body) }
      : {}),
  });

  console.log(`API request to ${endpoint} responded with status ${res.status}`);

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "API request failed");
  }

  return res.json();
}
