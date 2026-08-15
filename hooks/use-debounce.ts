"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a value by the given delay (ms).
 * Useful for search inputs — delays API/filter calls until user stops typing.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
