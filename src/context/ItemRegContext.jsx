import { useState, useEffect, createContext, useContext } from "react"; // 1. Add useContext
import { supabase } from "../utils/supabaseClient";
import { AuthContext } from "./AuthContext"; // 2. Import AuthContext

const ItemRegData = createContext();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function ItemRegProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem("items");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading items from localStorage:", error);
      return [];
    }
  });

  const [serverOnline, setServerOnline] = useState(true);
  const [loading, setLoading] = useState(false);

  // 3. Get the user from the AuthContext
  const { user } = useContext(AuthContext);

  const refreshItems = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated.");
      }
      const token = session.access_token;

      const res = await fetch(`${BACKEND_URL}/api/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch items. Status: ${res.status}`);
      }
      const data = await res.json();
      setItems(data);
      localStorage.setItem("items", JSON.stringify(data));
      setServerOnline(true);
    } catch (error) {
      console.error("Error in refreshItems:", error.message);
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  };

  // 4. Make the data fetch dependent on the user's login status
  useEffect(() => {
    if (user) {
      // If a user is logged in, fetch the items
      refreshItems();
    } else {
      // If the user logs out, clear the items from state
      setItems([]);
    }
  }, [user]); // This effect now runs whenever the user's state changes

  return (
    <ItemRegData.Provider
      value={{ items, refreshItems, setItems, serverOnline, loading }}
    >
      {children}
    </ItemRegData.Provider>
  );
}

export { ItemRegData };
