import { useState, useEffect, useRef } from 'react';

export function useFormCache<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(error);
      }
    } else {
      isMounted.current = true;
    }
  }, [key, value]);

  const clearCache = () => {
    window.localStorage.removeItem(key);
    setValue(initialValue);
  };

  return [value, setValue, clearCache] as const;
}
