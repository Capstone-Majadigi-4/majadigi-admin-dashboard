import { useAuthStore } from '../store/useAuthStore';

export const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api/v1';

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  adminKey?: string;
  adminKeyHeader?: string;
}

export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { body, adminKey, adminKeyHeader, ...rest } = options;
  const token = useAuthStore.getState().token;
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

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers: { ...headers, ...rest.headers },
    body: requestBody,
  });

  const json = await res.json() as { status: string; message?: string; data?: T };

  if (!res.ok) {
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }

  return ('data' in json ? json.data : json) as T;
}
