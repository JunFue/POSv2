import { useState, useEffect } from "react";

/**
 * A custom React hook that tracks whether the page is currently visible
 * or hidden (e.g., user has switched to another tab).
 * @returns {boolean} - True if the page is visible, false otherwise.
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    // Add an event listener for the 'visibilitychange' event
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
