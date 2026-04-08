import { ENV } from '../config/env';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { getApiErrorMessage } from '../utils/apiErrorMessage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
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

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${ENV.API_URL}${endpoint}`, {
    method,
    headers,
    ...(method !== 'GET' && body ? { body: JSON.stringify(body) } : {}),
    signal,
  });

  /* =========================
     🔥 GLOBAL 401 HANDLER
  ========================= */

  if (res.status === 401) {
    console.warn('Unauthorized response — signing out');

    try {
      const store = useAppStore.getState();
      await store.signOut();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during forced sign-out', err);
    }

    throw new ApiError('Session expired. Please log in again.', 401);
  }

  /* =========================
     Handle Other Errors
  ========================= */

  if (!res.ok) {
    let errorMessage = 'API request failed';

    try {
      const data = await res.json();
      errorMessage = getApiErrorMessage(data, errorMessage);
    } catch {
      try {
        errorMessage = await res.text();
      } catch {
        // ignore
      }
    }

    throw new ApiError(errorMessage, res.status);
  }

  /* =========================
     Successful Response
  ========================= */

  if (res.status === 204) {
    return {} as T;
  }

  return (await res.json()) as T;
}
