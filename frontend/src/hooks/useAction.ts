import { useCallback, useState } from 'react';
import { parseError, type ParsedError } from '../utils/errorMessage';

// Membungkus pemanggilan service yang mengubah data (POST/PATCH).
// execute() mengembalikan null bila gagal; detailnya ada di `error`.
// `onError` untuk efek samping saat gagal (mis. memuat ulang data setelah 409).
export function useAction<Args extends unknown[], Result>(
  action: (...args: Args) => Promise<Result>,
  onError?: (error: ParsedError) => void,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ParsedError | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<Result | null> => {
      setLoading(true);
      setError(null);
      try {
        return await action(...args);
      } catch (e) {
        const parsed = parseError(e);
        setError(parsed);
        onError?.(parsed);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [action, onError],
  );

  const clearError = useCallback(() => setError(null), []);

  return { execute, loading, error, clearError };
}
