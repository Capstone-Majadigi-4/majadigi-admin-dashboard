import { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiClient';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface FetchOptions {
  adminKey?: string;
  adminKeyHeader?: string;
}

export function useFetch<T>(endpoint: string, options?: FetchOptions): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const adminKey = options?.adminKey;
  const adminKeyHeader = options?.adminKeyHeader;

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        setLoading(true);
        setError(null);
        return apiFetch<T>(endpoint, { signal: controller.signal, adminKey, adminKeyHeader });
      })
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });

    return () => controller.abort();
  }, [endpoint, tick, adminKey, adminKeyHeader]);

  const refetch = () => setTick((t) => t + 1);

  return { data, loading, error, refetch };
}
