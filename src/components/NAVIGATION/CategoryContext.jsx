import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

import { getCategories } from "../../api/categoryService";
import { supabase } from "../../utils/supabaseClient";
import { usePageVisibility } from "../../hooks/usePageVisibility";

const CategoryContext = createContext();

const CACHE_KEY = "navCategoriesData";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const isVisible = usePageVisibility();

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      const cacheData = { value: data, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("CategoryContext error:", error.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      // --- Initial Load ---
      const cachedItem = localStorage.getItem(CACHE_KEY);
      if (cachedItem) {
        const { value, timestamp } = JSON.parse(cachedItem);
        if (Date.now() - timestamp < CACHE_TTL_MS) {
          setCategories(value);
          setLoading(false);
        }
      }
      // Always fetch fresh data when the component becomes visible.
      fetchCategories();

      const debouncedFetch = debounce(fetchCategories, 500);

      // --- Real-time Subscription ---
      const channel = supabase
        .channel("public:categories")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "categories" },
          () => {
            debouncedFetch();
          }
        );

      channel.subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isVisible, fetchCategories]);

  return (
    <CategoryContext.Provider value={{ categories, loading }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error(
      "useCategoryContext must be used within a CategoryProvider"
    );
  }
  return context;
};
