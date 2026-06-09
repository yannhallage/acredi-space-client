import { useEffect, useState } from 'react';

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useMockQuery<T>(loader: () => Promise<T>, queryKey = 'static'): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    loader()
      .then((data) => {
        if (active) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error: Error) => {
        if (active) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      active = false;
    };
    // The query key is the public dependency contract for this small mock layer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return state;
}
