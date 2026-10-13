import { useCallback, useEffect, useState } from 'react';
import { parseError } from '../utils/errorMessage';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// `fetcher` harus stabil antar-render (mis. fungsi service di level modul),
// karena perubahan referensinya memicu pengambilan ulang.
export function useFetch<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false; // abaikan hasil dari efek yang sudah dibersihkan
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        // data lama dipertahankan agar tampilan tidak kosong saat refetch gagal
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: parseError(error).message }));
      });
    return () => {
      cancelled = true;
    };
  }, [fetcher, reloadKey]);

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setReloadKey((k) => k + 1);
  }, []);

  return { ...state, refetch };
}
