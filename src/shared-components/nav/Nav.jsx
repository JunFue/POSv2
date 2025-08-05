import { Link } from "react-router"; // It's conventional to use react-router-dom
import { useState, useEffect } from "react";
import { getCategories } from "../../api/categoryService";
import { supabase } from "../../utils/supabaseClient"; // Import supabase for real-time
import { usePageVisibility } from "../../hooks/usePageVisibility"; // Import the visibility hook

const CACHE_KEY = "navCategoriesData";
const CACHE_TTL_MS = 15 * 60 * 1000; // Cache categories for 15 minutes

// A simple debounce utility
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export function Nav() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const isVisible = usePageVisibility();

  // --- FIX: The data fetching and real-time logic is now self-contained in this useEffect hook ---
  useEffect(() => {
    // Define the fetching function inside the effect.
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        const cacheData = {
          value: data,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.error("Nav component error:", error.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    // --- Initial Load ---
    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const { value, timestamp } = JSON.parse(cachedItem);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        setCategories(value);
        setLoading(false);
      }
    }
    // Always fetch fresh data on mount.
    fetchCategories();

    // Use a ref for the debounced function to persist it across renders.
    const debouncedFetchRef = debounce(fetchCategories, 500);

    // --- Real-time Subscription ---
    const channel = supabase
      .channel("public:categories")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        (payload) => {
          console.log("Category change detected:", payload);
          debouncedFetchRef();
        }
      );

    // Manage subscription based on page visibility.
    if (isVisible) {
      channel.subscribe();
    }

    // Cleanup function.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isVisible]); // The dependency array is now simple and safe.

  const links = [
    {
      path: "/dashboard",
      label: "Dashboard",
      flyoutText: (
        <>
          <div>
            <Link to="/dashboard" className="block hover:text-emerald-700">
              Overview
            </Link>
          </div>
          {loading && <div>Loading...</div>}
          {!loading &&
            categories.map((cat) => (
              <div key={cat.id}>
                <Link
                  to={`/dashboard/category/${encodeURIComponent(cat.name)}`}
                  className="block hover:text-emerald-700"
                >
                  {cat.name}
                </Link>
              </div>
            ))}
        </>
      ),
    },
    {
      path: "/cashout",
      label: "Cashout",
    },
    {
      path: "/transactions",
      label: "Transactions",
      flyoutText: (
        <>
          <div>
            <Link
              to="/transactions/item-sold"
              className="hover:text-emerald-700"
            >
              Items Sold
            </Link>
          </div>
          <div>
            <Link
              to="/transactions/payments-made"
              className="hover:text-emerald-700"
            >
              Payments Made
            </Link>
          </div>
        </>
      ),
    },
    {
      path: "/inventory",
      label: "Inventory",
      flyoutText: (
        <>
          <div>
            <Link
              to="/inventory/item-registration"
              className="hover:text-emerald-700"
            >
              Item Registration
            </Link>
          </div>
          <div>
            <Link
              to="/inventory/stocks-management"
              className="hover:text-emerald-700"
            >
              Stocks Management
            </Link>
          </div>
          <div>
            <Link
              to="/inventory/stocks-monitor"
              className="hover:text-emerald-700"
            >
              Stocks Monitor
            </Link>
          </div>
        </>
      ),
    },
  ];

  return (
    <nav className="flex items-center justify-around bg-background shadow-neumorphic p-4 text-base rounded-3xl">
      {links.map((link) => (
        <div key={link.path} className="relative group">
          <Link
            to={link.path}
            className="px-3 py-2 hover:text-emerald-700 transition-all"
          >
            {link.label}
          </Link>
          {link.flyoutText && (
            <div className="absolute top-[1vw] left-1/2 transform -translate-x-1/2 mt-2 w-max bg-background traditional-glass text-body-text text-sm md:text-[15px] lg:text-[18px] xl:text-[20px] p-2 rounded shadow-lg hidden group-hover:block z-20">
              {link.flyoutText}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
