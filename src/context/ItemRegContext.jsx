import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { AuthContext } from "./AuthContext";
import { getItems } from "../api/itemService";

const ItemRegData = createContext();

export function ItemRegProvider({ children }) {
  const [items, setItems] = useState([]);
  const [serverOnline, setServerOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const refreshItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getItems();
      const syncedItems = data.map((item) => ({ ...item, status: "synced" }));
      setItems(syncedItems);
      setServerOnline(true);
    } catch (error) {
      console.error("Error in refreshItems:", error.message);
      setServerOnline(false);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  const addOptimisticItem = (item) => {
    setItems((currentItems) => [item, ...currentItems]);
  };

  const updateItemStatus = (tempId, updatedData) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === tempId ? { ...item, ...updatedData } : item
      )
    );
  };

  return (
    <ItemRegData.Provider
      value={{
        items,
        refreshItems,
        serverOnline,
        loading,
        addOptimisticItem,
        updateItemStatus,
      }}
    >
      {children}
    </ItemRegData.Provider>
  );
}

export { ItemRegData };
