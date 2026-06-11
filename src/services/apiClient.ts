import { useAuthStore } from '../store/useAuthStore';

export const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api/v1';

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  adminKey?: string;
  adminKeyHeader?: string;
}

// Refresh lock — prevents concurrent refresh calls
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const json = await res.json() as {
    status: string;
    message?: string;
    data?: { access_token: string; refresh_token?: string };
  };

  if (!res.ok || json.status !== 'success' || !json.data) {
    throw new Error(json.message ?? 'Refresh token expired');
  }

  const { access_token, refresh_token } = json.data;
  useAuthStore.getState().setTokens(access_token, refresh_token ?? refreshToken);
  return access_token;
}

function buildRequest(endpoint: string, options: ApiOptions, token: string | null): Request {
  const { body, adminKey, adminKeyHeader, ...rest } = options;
  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (adminKey) headers[adminKeyHeader ?? 'X-Admin-Secret'] = adminKey;

  let requestBody: BodyInit | undefined;
  if (isFormData) {
    requestBody = body;
  } else if (body !== undefined) {
    requestBody = JSON.stringify(body);
  }

  return new Request(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers: { ...headers, ...rest.headers },
    body: requestBody,
  });
}

export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  let token = useAuthStore.getState().token;
  let res = await fetch(buildRequest(endpoint, options, token));

  if (res.status === 401) {
    if (isRefreshing) {
      // Wait for the in-flight refresh to finish, then retry with the new token
      token = await new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      });
    } else {
      isRefreshing = true;
      try {
        token = await refreshAccessToken();
        processQueue(null, token);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        globalThis.location.href = '/login';
        throw err;
      } finally {
        isRefreshing = false;
      }
    }
    // Retry original request with the fresh token
    res = await fetch(buildRequest(endpoint, options, token));
  }

  const json = await res.json() as { status: string; message?: string; data?: T };

  if (!res.ok) {
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }

  return ('data' in json ? json.data : json) as T;
}
