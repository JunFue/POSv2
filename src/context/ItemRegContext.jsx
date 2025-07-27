import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { supabase } from "../utils/supabaseClient";
import { AuthContext } from "./AuthContext";

const ItemRegData = createContext();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function ItemRegProvider({ children }) {
  const [items, setItems] = useState([]);
  const [serverOnline, setServerOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const refreshItems = useCallback(async () => {
    // No need to fetch if the user is not logged in.
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated.");
      }
      const token = session.access_token;

      // Using the endpoint from your original file
      const res = await fetch(`${BACKEND_URL}/api/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch items. Status: ${res.status}`);
      }
      const data = await res.json();

      // Add a 'synced' status to all items fetched from the server.
      const syncedItems = data.map((item) => ({ ...item, status: "synced" }));
      setItems(syncedItems);
      setServerOnline(true);
    } catch (error) {
      console.error("Error in refreshItems:", error.message);
      setServerOnline(false);
      setItems([]); // Clear items on error
    } finally {
      setLoading(false);
    }
  }, [user]); // Dependency on user ensures it refetches on login/logout

  // Effect to fetch data when the user's login status changes
  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  // --- Functions for Optimistic UI ---

  // Adds a new item to the state with 'pending' status
  const addOptimisticItem = (item) => {
    setItems((currentItems) => [item, ...currentItems]);
  };

  // Updates an item's status and data once the server responds
  const updateItemStatus = (tempId, updatedData) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        // Find the item by its temporary ID and update it
        item.id === tempId ? { ...item, ...updatedData } : item
      )
    );
  };

  // --- End of new functions ---

  return (
    <ItemRegData.Provider
      value={{
        items,
        refreshItems,
        serverOnline,
        loading,
        addOptimisticItem, // Expose the new function
        updateItemStatus, // Expose the new function
      }}
    >
      {children}
    </ItemRegData.Provider>
  );
}

export { ItemRegData };
