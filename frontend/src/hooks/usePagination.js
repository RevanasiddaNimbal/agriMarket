import { useState, useCallback } from 'react';

export function usePagination(initialPage = 0, initialSize = 20) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  const nextPage = useCallback(() => setPage((prev) => prev + 1), []);
  const prevPage = useCallback(() => setPage((prev) => Math.max(0, prev - 1)), []);
  const resetPage = useCallback(() => setPage(0), []);

  return {
    page,
    size,
    setPage,
    setSize,
    nextPage,
    prevPage,
    resetPage,
  };
}
