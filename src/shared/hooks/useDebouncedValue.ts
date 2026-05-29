import { useState, useEffect } from 'react';

/**
 * Hook que retorna un valor con debounce
 * Útil para búsquedas y filtros que disparan queries
 * @param value - Valor a debouncer
 * @param delay - Tiempo de espera en ms (default: 300ms)
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
