import { useEffect, useState } from 'react';

const readStoredValue = (key, fallbackValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallbackValue;
  } catch {
    return fallbackValue;
  }
};

export function useLocalStorage(key, fallbackValue) {
  const [value, setValue] = useState(() => readStoredValue(key, fallbackValue));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
