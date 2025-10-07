import { useState, useEffect } from "react";

/**
 * A custom hook to manage state that persists in localStorage.
 * @param {string} key - The key to use for storing the value in localStorage.
 * @param {any} defaultValue - The default value to use if nothing is found in localStorage.
 * @returns {[any, function]} A stateful value, and a function to update it.
 */
export function usePersistentState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}
