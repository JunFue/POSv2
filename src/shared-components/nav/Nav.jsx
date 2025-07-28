import { Link } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function Nav() {
  // --- NEW: State to hold the dynamic categories ---
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: Function to fetch categories from the API ---
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return; // Don't fetch if not logged in

      const token = session.access_token;
      const res = await fetch(`${BACKEND_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch categories for nav");

      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- NEW: Fetch categories when the component mounts ---
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- MODIFICATION: The links array is now built inside the component ---
  const links = [
    {
      path: "/dashboard",
      label: "Dashboard",
      flyoutText: (
        <>
          {/* --- NEW: Hard-coded Overview link --- */}
          <div>
            <Link to="/dashboard" className="block hover:text-emerald-700">
              Overview
            </Link>
          </div>

          {loading && <div>Loading...</div>}
          {!loading && categories.length === 0 && (
            <div>No categories found.</div>
          )}
          {categories.map((cat) => (
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
    { path: "/cashout", label: "Cashout", flyoutText: "Manage Cashout" },
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
          <div className="absolute top-[1vw] left-1/2 transform -translate-x-1/2 mt-2 w-max bg-background traditional-glass text-body-text text-sm md:text-[15px] lg:text-[18px] xl:text-[20px] p-2 rounded shadow-lg hidden group-hover:block z-20">
            {link.flyoutText}
          </div>
        </div>
      ))}
    </nav>
  );
}
