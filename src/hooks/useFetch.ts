import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const serviceModules: Record<string, () => Promise<unknown>> = {
  rsud: () => import('../services/rsud.json'),
  bapok: () => import('../services/bapok.json'),
  islamic: () => import('../services/islamic.json'),
  transjatim: () => import('../services/transjatim.json'),
  auth: () => import('../services/auth.json'),
};

export function useFetch<T>(serviceName: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    const loader = serviceModules[serviceName];
    const promise: Promise<unknown> = loader
      ? loader()
      : Promise.reject(new Error(`Service "${serviceName}" not found`));

    promise
      .then((mod) => {
        if (controller.signal.aborted) return;
        const raw = mod as { default: T };
        setState({ data: raw.default, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setState({ data: null, loading: false, error: message });
      });

    return () => controller.abort();
  }, [serviceName]);

  return state;
}
